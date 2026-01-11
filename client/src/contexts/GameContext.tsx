import { createContext, useContext, type ReactNode } from 'react';
import { useGame } from '../hooks/useGame';
import { useSound } from '../hooks/useSound';
import type {
  GameState,
  GameSettings,
  Player,
  GameColor,
  RoundResult,
  LeaderboardEntry,
} from '../types/game.types';

interface RoundEndData {
  results: RoundResult[];
  leaderboard: LeaderboardEntry[];
  eliminatedPlayers: string[];
}

interface GameContextValue {
  // Game state
  game: GameState | null;
  player: Player | null;
  isLoading: boolean;
  error: string | null;
  connected: boolean;
  roundEndData: RoundEndData | null;
  isRoundEnded: boolean;

  // Game actions
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

  // Sound
  muted: boolean;
  toggleMute: () => void;
  playColorSound: (colorId: string) => void;
  playColor: (color: GameColor) => void;
  playSuccessSound: () => void;
  playErrorSound: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const gameHook = useGame();
  const soundHook = useSound();

  const value: GameContextValue = {
    // Game state
    game: gameHook.game,
    player: gameHook.player,
    isLoading: gameHook.isLoading,
    error: gameHook.error,
    connected: gameHook.connected,
    roundEndData: gameHook.roundEndData,
    isRoundEnded: gameHook.isRoundEnded,

    // Game actions
    createGame: gameHook.createGame,
    joinGame: gameHook.joinGame,
    startGame: gameHook.startGame,
    submitSequence: gameHook.submitSequence,
    refreshColors: gameHook.refreshColors,
    playAgain: gameHook.playAgain,
    newGame: gameHook.newGame,
    leaveGame: gameHook.leaveGame,
    clearError: gameHook.clearError,
    clearRoundEnd: gameHook.clearRoundEnd,

    // Sound
    muted: soundHook.muted,
    toggleMute: soundHook.toggleMute,
    playColorSound: soundHook.playColorSound,
    playColor: soundHook.playColor,
    playSuccessSound: soundHook.playSuccessSound,
    playErrorSound: soundHook.playErrorSound,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}

export default GameContext;
