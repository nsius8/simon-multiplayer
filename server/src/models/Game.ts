// Game model and types

export interface GameColor {
  id: string;
  name: string;
  color: string;
  soundFreq: number;
}

export type GameSpeed = 'slow' | 'medium' | 'fast';
export type GameMode = 'lastManStanding' | 'bestOfX';
export type GameStatus = 'lobby' | 'playing' | 'finished';
export type PlayerStatus = 'waiting' | 'playing' | 'eliminated' | 'finished';

export interface GameSettings {
  difficulty: 4 | 5 | 6 | 7 | 8 | 9;
  selectedColors: GameColor[];
  speed: GameSpeed;
  mode: GameMode;
  rounds?: 5 | 10 | 15 | 20;
}

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
  socketId: string;
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
  reactionTime: number;
  submittedAt: Date;
}

export interface Game {
  id: string;
  gameCode: string;
  hostId: string;
  settings: GameSettings;
  players: Player[];
  status: GameStatus;
  currentRound: number;
  sequence: string[];
  playerInputs: Map<string, PlayerInput>;
  roundTimer: number;
  createdAt: Date;
}

export function createPlayer(
  id: string,
  socketId: string,
  name: string,
  isHost: boolean
): Player {
  return {
    id,
    socketId,
    name,
    isHost,
    status: 'waiting',
    stats: {
      mistakes: 0,
      roundsSurvived: 0,
      totalReactionTime: 0,
      averageReactionTime: 0,
    },
    finishedCurrentRound: false,
  };
}

export function createGame(
  id: string,
  gameCode: string,
  hostId: string,
  settings: GameSettings
): Game {
  return {
    id,
    gameCode,
    hostId,
    settings,
    players: [],
    status: 'lobby',
    currentRound: 0,
    sequence: [],
    playerInputs: new Map(),
    roundTimer: 0,
    createdAt: new Date(),
  };
}

export function gameToClientState(game: Game): Omit<Game, 'playerInputs'> & { playerInputs: Record<string, PlayerInput> } {
  return {
    ...game,
    playerInputs: Object.fromEntries(game.playerInputs),
  };
}
