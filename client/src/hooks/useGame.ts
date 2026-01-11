import { useState, useCallback, useEffect } from 'react';
import {
  type GameState,
  type GameSettings,
  type Player,
  type RoundResult,
  type LeaderboardEntry,
} from '../types/game.types';
import { useSocket } from './useSocket';
import { generatePlayerId } from '../utils/gameUtils';

interface RoundEndData {
  results: RoundResult[];
  leaderboard: LeaderboardEntry[];
  eliminatedPlayers: string[];
}

interface UseGameReturn {
  game: GameState | null;
  player: Player | null;
  isLoading: boolean;
  error: string | null;
  connected: boolean;
  roundEndData: RoundEndData | null;
  isRoundEnded: boolean;
  createGame: (settings: GameSettings, hostName: string) => void;
  joinGame: (code: string, playerName: string) => void;
  startGame: () => void;
  submitSequence: (sequence: string[], reactionTime: number) => void;
  refreshColors: () => void;
  playAgain: () => void;
  newGame: () => void;
  leaveGame: () => void;
  clearError: () => void;
  clearRoundEnd: () => void;
}

export function useGame(): UseGameReturn {
  const { connected, error: socketError, emit, on, clearError: clearSocketError } = useSocket();
  const [game, setGame] = useState<GameState | null>(null);
  const [playerId] = useState(() => generatePlayerId());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roundEndData, setRoundEndData] = useState<RoundEndData | null>(null);
  const [isRoundEnded, setIsRoundEnded] = useState(false);

  const player = game?.players.find((p) => p.id === playerId) || null;

  // Set up event listeners
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    cleanups.push(
      on('game:created', () => {
        setIsLoading(false);
        // Game state will be updated via game:state event
      })
    );

    cleanups.push(
      on('game:state', ({ game: gameState }) => {
        setGame(gameState);
        setIsLoading(false);
      })
    );

    cleanups.push(
      on('player:joined', ({ player: newPlayer }) => {
        setGame((prev) => {
          if (!prev) return prev;
          // Avoid duplicates
          if (prev.players.some((p) => p.id === newPlayer.id)) return prev;
          return {
            ...prev,
            players: [...prev.players, newPlayer],
          };
        });
      })
    );

    cleanups.push(
      on('player:left', ({ playerId: leftPlayerId }) => {
        setGame((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.filter((p) => p.id !== leftPlayerId),
          };
        });
      })
    );

    cleanups.push(
      on('colors:refreshed', ({ colors }) => {
        setGame((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            settings: {
              ...prev.settings,
              selectedColors: colors,
            },
          };
        });
      })
    );

    cleanups.push(
      on('game:started', () => {
        setGame((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'playing',
            currentRound: 0,
          };
        });
      })
    );

    cleanups.push(
      on('round:start', ({ round, sequence }) => {
        // Clear round end data when new round starts
        setIsRoundEnded(false);
        setRoundEndData(null);
        
        setGame((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentRound: round,
            sequence,
            players: prev.players.map((p) => ({
              ...p,
              finishedCurrentRound: false,
            })),
          };
        });
      })
    );

    cleanups.push(
      on('time:update', ({ remaining }) => {
        setGame((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            roundTimer: remaining,
          };
        });
      })
    );

    cleanups.push(
      on('round:end', ({ results, leaderboard, eliminatedPlayers }) => {
        setRoundEndData({ results, leaderboard, eliminatedPlayers });
        setIsRoundEnded(true);
        setGame((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map((p) => ({
              ...p,
              status: eliminatedPlayers.includes(p.id) ? 'eliminated' : p.status,
              finishedCurrentRound: true,
            })),
          };
        });
      })
    );

    cleanups.push(
      on('next:round:starting', ({ countdown }: { countdown: number }) => {
        // Don't clear roundEndData yet - we'll show "Starting in X..." message
        // The actual transition to 'playing' happens when round:start is received
        console.log(`Next round starting in ${countdown} seconds...`);
      })
    );

    cleanups.push(
      on('game:end', () => {
        setGame((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'finished',
          };
        });
      })
    );

    cleanups.push(
      on('join:error', ({ message }) => {
        setError(message);
        setIsLoading(false);
      })
    );

    cleanups.push(
      on('error', ({ message }) => {
        setError(message);
        setIsLoading(false);
      })
    );

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [on]);

  const createGame = useCallback(
    (settings: GameSettings, hostName: string) => {
      setIsLoading(true);
      setError(null);
      emit('createGame', { hostName, settings, playerId });
    },
    [emit, playerId]
  );

  const joinGame = useCallback(
    (code: string, playerName: string) => {
      setIsLoading(true);
      setError(null);
      emit('joinGame', { code, playerName, playerId });
    },
    [emit, playerId]
  );

  const startGame = useCallback(() => {
    if (game) {
      emit('startGame', { gameId: game.id });
    }
  }, [emit, game]);

  const submitSequence = useCallback(
    (sequence: string[], reactionTime: number) => {
      if (game) {
        emit('submitSequence', { gameId: game.id, sequence, reactionTime });
      }
    },
    [emit, game]
  );

  const refreshColors = useCallback(() => {
    if (game) {
      emit('refreshColors', { gameId: game.id });
    }
  }, [emit, game]);

  const playAgain = useCallback(() => {
    if (game) {
      emit('playAgain', { gameId: game.id });
    }
  }, [emit, game]);

  const newGame = useCallback(() => {
    if (game) {
      emit('newGame', { gameId: game.id });
    }
  }, [emit, game]);

  const leaveGame = useCallback(() => {
    if (game) {
      emit('leaveGame', { gameId: game.id });
      setGame(null);
    }
  }, [emit, game]);

  const clearError = useCallback(() => {
    setError(null);
    clearSocketError();
  }, [clearSocketError]);

  const clearRoundEnd = useCallback(() => {
    setIsRoundEnded(false);
    setRoundEndData(null);
  }, []);

  return {
    game,
    player,
    isLoading,
    error: error || socketError,
    connected,
    roundEndData,
    isRoundEnded,
    createGame,
    joinGame,
    startGame,
    submitSequence,
    refreshColors,
    playAgain,
    newGame,
    leaveGame,
    clearError,
    clearRoundEnd,
  };
}

export default useGame;
