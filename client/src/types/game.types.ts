// Game types and interfaces for Simon Multiplayer

// =============================================================================
// Core Types
// =============================================================================

export interface GameColor {
  id: string;
  name: string;
  color: string;
  soundFreq: number;
}

export const COLOR_PALETTE: GameColor[] = [
  { id: 'red', name: 'Red', color: '#EF4444', soundFreq: 329.63 },
  { id: 'blue', name: 'Blue', color: '#3B82F6', soundFreq: 261.63 },
  { id: 'green', name: 'Green', color: '#10B981', soundFreq: 392.0 },
  { id: 'yellow', name: 'Yellow', color: '#F59E0B', soundFreq: 440.0 },
  { id: 'purple', name: 'Purple', color: '#8B5CF6', soundFreq: 493.88 },
  { id: 'orange', name: 'Orange', color: '#F97316', soundFreq: 523.25 },
  { id: 'pink', name: 'Pink', color: '#EC4899', soundFreq: 587.33 },
  { id: 'cyan', name: 'Cyan', color: '#06B6D4', soundFreq: 659.25 },
  { id: 'lime', name: 'Lime', color: '#84CC16', soundFreq: 698.46 },
  { id: 'magenta', name: 'Magenta', color: '#DB2777', soundFreq: 739.99 },
  { id: 'teal', name: 'Teal', color: '#14B8A6', soundFreq: 783.99 },
  { id: 'indigo', name: 'Indigo', color: '#6366F1', soundFreq: 830.61 },
];

export type GameSpeed = 'slow' | 'medium' | 'fast';

export type GameMode = 'lastManStanding' | 'bestOfX';

export type GameStatus = 'lobby' | 'playing' | 'finished';

export type PlayerStatus = 'waiting' | 'playing' | 'eliminated' | 'finished';

// =============================================================================
// Game Settings
// =============================================================================

export interface GameSettings {
  difficulty: 4 | 5 | 6 | 7 | 8 | 9;
  selectedColors: GameColor[];
  speed: GameSpeed;
  mode: GameMode;
  rounds?: 5 | 10 | 15 | 20; // only for bestOfX mode
}

// =============================================================================
// Player Types
// =============================================================================

export interface PlayerStats {
  mistakes: number;
  roundsSurvived: number;
  totalReactionTime: number;
  averageReactionTime: number;
  lastRoundTime?: number;
  placement?: number;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  status: PlayerStatus;
  stats: PlayerStats;
  finishedCurrentRound: boolean;
  currentRoundTime?: number;
}

export interface PlayerInput {
  playerId: string;
  sequence: string[];
  isCorrect: boolean;
  reactionTime: number; // milliseconds
  submittedAt: Date;
}

// =============================================================================
// Round Types
// =============================================================================

export interface Round {
  number: number;
  sequence: string[];
  playerInputs: Record<string, PlayerInput>;
  startTime: Date;
  endTime?: Date;
}

// =============================================================================
// Game State
// =============================================================================

export interface GameState {
  id: string;
  gameCode: string;
  hostId: string;
  settings: GameSettings;
  players: Player[];
  status: GameStatus;
  currentRound: number;
  sequence: string[]; // array of color IDs
  roundTimer: number;
  createdAt: Date;
}

// =============================================================================
// Leaderboard Types
// =============================================================================

export interface RoundResult {
  playerId: string;
  playerName: string;
  isCorrect: boolean;
  reactionTime: number;
  mistakes: number;
  isEliminated: boolean;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  rank: number;
  mistakes: number;
  averageTime: number;
  roundsSurvived: number;
  status: PlayerStatus;
}

// =============================================================================
// Socket.io Event Types
// =============================================================================

// Client → Server Events
export interface ClientToServerEvents {
  createGame: (data: { hostName: string; settings: GameSettings }) => void;
  refreshColors: (data: { gameId: string }) => void;
  startGame: (data: { gameId: string }) => void;
  joinGame: (data: { code: string; playerName: string }) => void;
  submitSequence: (data: {
    gameId: string;
    sequence: string[];
    reactionTime: number;
  }) => void;
  playAgain: (data: { gameId: string }) => void;
  newGame: (data: { gameId: string }) => void;
  leaveGame: (data: { gameId: string }) => void;
}

// Server → Client Events
export interface ServerToClientEvents {
  'game:created': (data: {
    gameId: string;
    code: string;
    settings: GameSettings;
  }) => void;
  'colors:refreshed': (data: { colors: GameColor[] }) => void;
  'player:joined': (data: { player: Player }) => void;
  'player:left': (data: { playerId: string }) => void;
  'game:started': () => void;
  'round:start': (data: { round: number; sequence: string[] }) => void;
  'sequence:complete': () => void;
  'input:phase:start': (data: { timeLimit: number }) => void;
  'time:update': (data: { remaining: number }) => void;
  'all:submitted': () => void;
  'round:end': (data: {
    results: RoundResult[];
    leaderboard: LeaderboardEntry[];
    eliminatedPlayers: string[];
  }) => void;
  'next:round:starting': (data: { countdown: number }) => void;
  'game:end': (data: {
    finalLeaderboard: LeaderboardEntry[];
    winner: Player;
    stats: GameStats;
  }) => void;
  'game:state': (data: { game: GameState }) => void;
  'join:error': (data: { message: string }) => void;
  error: (data: { message: string; code?: string }) => void;
}

export interface GameStats {
  totalRounds: number;
  totalPlayers: number;
  gameDuration: number; // milliseconds
}

// =============================================================================
// Utility Functions
// =============================================================================

export function getSpeedDelay(speed: GameSpeed): { color: number; gap: number } {
  switch (speed) {
    case 'slow':
      return { color: 800, gap: 400 };
    case 'medium':
      return { color: 600, gap: 300 };
    case 'fast':
      return { color: 400, gap: 200 };
  }
}

export function calculateTimeLimit(sequenceLength: number): number {
  return 10 + sequenceLength * 2;
}

export function getGridLayout(
  difficulty: number
): { cols: number; rows: number } {
  if (difficulty <= 4) return { cols: 2, rows: 2 };
  if (difficulty <= 6) return { cols: 3, rows: 2 };
  return { cols: 3, rows: 3 };
}

export function selectRandomColors(count: number): GameColor[] {
  const shuffled = [...COLOR_PALETTE].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function validateSequence(
  submitted: string[],
  correct: string[]
): boolean {
  if (submitted.length !== correct.length) return false;
  return submitted.every((color, i) => color === correct[i]);
}

// =============================================================================
// Constants
// =============================================================================

export const COLOR_JOKES = [
  "Why did the color go to therapy? It had too many hues!",
  "What's a color's favorite game? Hue and seek!",
  "Why was the color tired? It had a long wavelength!",
  "What did the color say to the rainbow? You're so spectrum-tacular!",
  "Why don't colors ever win at poker? They always show their true hues!",
  "What's a color's favorite type of music? The blues!",
  "Why was the color book so popular? It was very well-red!",
  "What do you call a color that's always late? Tardy-dye!",
  "Why did the crayon go to the doctor? It was feeling a bit waxy!",
  "What did the green grape say to the purple grape? Breathe!",
  "Why did the color wheel break up? It needed more space!",
  "What's orange and sounds like a parrot? A carrot!",
  "Why was the blue sad? It was feeling a little down!",
  "What did pink say to purple? You're grape!",
  "Why did yellow win the race? It was on a roll!",
];

export const MAX_PLAYERS = 10;
export const MIN_PLAYERS_TO_START = 2;
export const LEADERBOARD_DISPLAY_TIME = 7000; // 7 seconds
export const COUNTDOWN_TIME = 3; // 3 seconds before next round
