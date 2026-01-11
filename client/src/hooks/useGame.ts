import { useState, useCallback, useEffect } from 'react';
import {
  type GameState,
  type GameSettings,
  type Player,
} from '../types/game.types';
import { useSocket } from './useSocket';
import { generatePlayerId } from '../utils/gameUtils';

interface UseGameReturn {
  game: GameState | null;
  player: Player | null;
  isLoading: boolean;
  error: string | null;
  connected: boolean;
  createGame: (settings: GameSettings, hostName: string) => void;
  joinGame: (code: string, playerName: string) => void;
  startGame: () => void;
  submitSequence: (sequence: string[], reactionTime: number) => void;
  refreshColors: () => void;
  playAgain: () => void;
  newGame: () => void;
  leaveGame: () => void;
  clearError: () => void;
}

export function useGame(): UseGameReturn {
  const { connected, error: socketError, emit, on, clearError: clearSocketError } = useSocket();
  const [game, setGame] = useState<GameState | null>(null);
  const [playerId] = useState(() => generatePlayerId());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      on('round:end', ({ eliminatedPlayers }) => {
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
      emit('createGame', { hostName, settings });
    },
    [emit]
  );

  const joinGame = useCallback(
    (code: string, playerName: string) => {
      setIsLoading(true);
      setError(null);
      emit('joinGame', { code, playerName });
    },
    [emit]
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

  return {
    game,
    player,
    isLoading,
    error: error || socketError,
    connected,
    createGame,
    joinGame,
    startGame,
    submitSequence,
    refreshColors,
    playAgain,
    newGame,
    leaveGame,
    clearError,
  };
}

export default useGame;
