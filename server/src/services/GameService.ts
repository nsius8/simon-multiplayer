// Game service for managing game state and logic

import type { Game, Player, PlayerInput, GameSettings, GameColor } from '../models/Game.js';
import { createGame, createPlayer, gameToClientState } from '../models/Game.js';
import { generateGameCode, generateGameId, generatePlayerId } from '../utils/codeGenerator.js';
import { selectRandomColors, generateSequence, calculateTimeLimit } from './ColorService.js';
import { validateSequence } from '../utils/validators.js';

// In-memory game storage (could be replaced with Redis)
const games = new Map<string, Game>();
const gamesByCode = new Map<string, string>(); // gameCode -> gameId

const MAX_PLAYERS = 10;

/**
 * Create a new game
 */
export function createNewGame(
  hostName: string,
  settings: GameSettings,
  socketId: string,
  clientPlayerId?: string
): { game: Game; playerId: string } {
  const gameId = generateGameId();
  const gameCode = generateGameCode();
  const playerId = clientPlayerId || generatePlayerId();

  const game = createGame(gameId, gameCode, playerId, settings);
  const hostPlayer = createPlayer(playerId, socketId, hostName, true);
  game.players.push(hostPlayer);

  games.set(gameId, game);
  gamesByCode.set(gameCode, gameId);

  return { game, playerId };
}

/**
 * Get a game by ID
 */
export function getGameById(gameId: string): Game | undefined {
  return games.get(gameId);
}

/**
 * Get a game by code
 */
export function getGameByCode(code: string): Game | undefined {
  const gameId = gamesByCode.get(code.toUpperCase());
  console.log(`🔍 Looking for game: code=${code.toUpperCase()}, found gameId=${gameId}, total games=${games.size}`);
  if (!gameId) return undefined;
  return games.get(gameId);
}

/**
 * Add a player to a game
 */
export function addPlayerToGame(
  game: Game,
  playerName: string,
  socketId: string,
  clientPlayerId?: string
): { success: boolean; player?: Player; error?: string } {
  if (game.status !== 'lobby') {
    return { success: false, error: 'Game has already started' };
  }

  if (game.players.length >= MAX_PLAYERS) {
    return { success: false, error: 'Game is full' };
  }

  const playerId = clientPlayerId || generatePlayerId();
  const player = createPlayer(playerId, socketId, playerName, false);
  game.players.push(player);

  return { success: true, player };
}

/**
 * Remove a player from a game
 */
export function removePlayerFromGame(game: Game, playerId: string): boolean {
  const index = game.players.findIndex((p) => p.id === playerId);
  if (index === -1) return false;

  const player = game.players[index];
  game.players.splice(index, 1);

  // If host left and there are other players, assign new host
  if (player.isHost && game.players.length > 0) {
    game.players[0].isHost = true;
    game.hostId = game.players[0].id;
  }

  // If no players left, delete the game
  if (game.players.length === 0) {
    games.delete(game.id);
    gamesByCode.delete(game.gameCode);
  }

  return true;
}

/**
 * Refresh colors for a game
 */
export function refreshGameColors(game: Game): GameColor[] {
  const newColors = selectRandomColors(game.settings.difficulty);
  game.settings.selectedColors = newColors;
  return newColors;
}

/**
 * Start a game
 */
export function startGame(game: Game): boolean {
  if (game.status !== 'lobby') return false;
  if (game.players.length < 2) return false;

  game.status = 'playing';
  game.currentRound = 0;

  // Set all players to playing status
  game.players.forEach((player) => {
    player.status = 'playing';
  });

  return true;
}

/**
 * Start a new round
 */
export function startRound(game: Game): { round: number; sequence: string[]; timeLimit: number } {
  game.currentRound++;
  game.sequence = generateSequence(
    game.settings.selectedColors,
    game.currentRound
  );
  game.playerInputs.clear();
  game.roundTimer = calculateTimeLimit(game.currentRound);

  // Reset player round state
  game.players.forEach((player) => {
    player.finishedCurrentRound = false;
    player.currentRoundTime = undefined;
  });

  return {
    round: game.currentRound,
    sequence: game.sequence,
    timeLimit: game.roundTimer,
  };
}

/**
 * Submit player input
 */
export function submitPlayerInput(
  game: Game,
  playerId: string,
  sequence: string[],
  reactionTime: number
): { isCorrect: boolean; shouldEliminate: boolean } {
  const player = game.players.find((p) => p.id === playerId);
  if (!player) return { isCorrect: false, shouldEliminate: false };

  const isCorrect = validateSequence(sequence, game.sequence);

  const input: PlayerInput = {
    playerId,
    sequence,
    isCorrect,
    reactionTime,
    submittedAt: new Date(),
  };

  game.playerInputs.set(playerId, input);
  player.finishedCurrentRound = true;
  player.currentRoundTime = reactionTime;

  // Update stats
  if (!isCorrect) {
    player.stats.mistakes++;
  }
  player.stats.roundsSurvived = game.currentRound;
  player.stats.roundsSubmitted++;
  player.stats.totalReactionTime += reactionTime;
  player.stats.averageReactionTime =
    player.stats.totalReactionTime / player.stats.roundsSubmitted;
  player.stats.lastRoundTime = reactionTime;

  // Determine if player should be eliminated (Last Man Standing mode)
  const shouldEliminate =
    game.settings.mode === 'lastManStanding' && !isCorrect;

  if (shouldEliminate) {
    player.status = 'eliminated';
  }

  return { isCorrect, shouldEliminate };
}

/**
 * Check if all active players have submitted
 */
export function allPlayersSubmitted(game: Game): boolean {
  const activePlayers = game.players.filter((p) => p.status !== 'eliminated');
  return activePlayers.every((p) => p.finishedCurrentRound);
}

/**
 * Check if game should end
 */
export function shouldGameEnd(game: Game): boolean {
  if (game.settings.mode === 'lastManStanding') {
    const activePlayers = game.players.filter((p) => p.status !== 'eliminated');
    return activePlayers.length <= 1;
  } else {
    // Best of X mode
    return game.currentRound >= (game.settings.rounds || 10);
  }
}

/**
 * End the game
 */
export function endGame(game: Game): void {
  game.status = 'finished';

  // Calculate final placements
  const sortedPlayers = [...game.players].sort((a, b) => {
    if (game.settings.mode === 'lastManStanding') {
      // Sort by rounds survived (descending), then by average time
      if (a.stats.roundsSurvived !== b.stats.roundsSurvived) {
        return b.stats.roundsSurvived - a.stats.roundsSurvived;
      }
      return a.stats.averageReactionTime - b.stats.averageReactionTime;
    } else {
      // Sort by mistakes (ascending), then by average time
      if (a.stats.mistakes !== b.stats.mistakes) {
        return a.stats.mistakes - b.stats.mistakes;
      }
      return a.stats.averageReactionTime - b.stats.averageReactionTime;
    }
  });

  sortedPlayers.forEach((player, index) => {
    player.stats.placement = index + 1;
    player.status = 'finished';
  });
}

/**
 * Get the winner of the game
 */
export function getWinner(game: Game): Player | undefined {
  if (game.status !== 'finished') return undefined;
  return game.players.find((p) => p.stats.placement === 1);
}

/**
 * Reset game for play again
 */
export function resetGame(game: Game): void {
  game.status = 'playing';
  game.currentRound = 0;
  game.sequence = [];
  game.playerInputs.clear();

  // Reset all players
  game.players.forEach((player) => {
    player.status = 'playing';
    player.stats = {
      mistakes: 0,
      roundsSurvived: 0,
      roundsSubmitted: 0,
      totalReactionTime: 0,
      averageReactionTime: 0,
    };
    player.finishedCurrentRound = false;
    player.currentRoundTime = undefined;
  });
}

/**
 * Get game state for client
 */
export function getClientGameState(game: Game) {
  return gameToClientState(game);
}

/**
 * Get round results
 */
export function getRoundResults(game: Game) {
  return game.players.map((player) => ({
    playerId: player.id,
    playerName: player.name,
    isCorrect: game.playerInputs.get(player.id)?.isCorrect ?? false,
    reactionTime: player.currentRoundTime || 0,
    mistakes: player.stats.mistakes,
    isEliminated: player.status === 'eliminated',
  }));
}

/**
 * Get leaderboard
 */
export function getLeaderboard(game: Game) {
  const sortedPlayers = [...game.players].sort((a, b) => {
    if (game.settings.mode === 'lastManStanding') {
      if (a.status === 'eliminated' && b.status !== 'eliminated') return 1;
      if (a.status !== 'eliminated' && b.status === 'eliminated') return -1;
      return a.stats.averageReactionTime - b.stats.averageReactionTime;
    } else {
      if (a.stats.mistakes !== b.stats.mistakes) {
        return a.stats.mistakes - b.stats.mistakes;
      }
      return a.stats.averageReactionTime - b.stats.averageReactionTime;
    }
  });

  return sortedPlayers.map((player, index) => ({
    playerId: player.id,
    playerName: player.name,
    rank: index + 1,
    mistakes: player.stats.mistakes,
    averageTime: player.stats.averageReactionTime,
    roundsSurvived: player.stats.roundsSurvived,
    status: player.status,
  }));
}
