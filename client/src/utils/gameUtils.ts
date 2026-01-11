// Game utility functions

import {
  type GameSpeed,
  type GameSettings,
  type Player,
  type LeaderboardEntry,
  calculateTimeLimit,
  validateSequence,
  getSpeedDelay,
} from '../types/game.types';

export { calculateTimeLimit, validateSequence, getSpeedDelay };

/**
 * Speed timing constants
 */
export const SPEED_TIMINGS: Record<
  GameSpeed,
  { color: number; gap: number }
> = {
  slow: { color: 800, gap: 400 },
  medium: { color: 600, gap: 300 },
  fast: { color: 400, gap: 200 },
};

/**
 * Generate a unique game code (6 characters)
 */
export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars like 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a unique player ID
 */
export function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Generate a random sequence of colors
 */
export function generateSequence(
  colorIds: string[],
  length: number
): string[] {
  const sequence: string[] = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * colorIds.length);
    sequence.push(colorIds[randomIndex]);
  }
  return sequence;
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format reaction time in milliseconds to seconds with 1 decimal
 */
export function formatReactionTime(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Sort players for leaderboard (Last Man Standing mode)
 * Active players first (sorted by fastest time), then eliminated
 */
export function sortPlayersLastManStanding(
  players: Player[]
): Player[] {
  const active = players
    .filter((p) => p.status !== 'eliminated')
    .sort(
      (a, b) =>
        (a.stats.averageReactionTime || Infinity) -
        (b.stats.averageReactionTime || Infinity)
    );

  const eliminated = players
    .filter((p) => p.status === 'eliminated')
    .sort((a, b) => (b.stats.roundsSurvived || 0) - (a.stats.roundsSurvived || 0));

  return [...active, ...eliminated];
}

/**
 * Sort players for leaderboard (Best of X mode)
 * Sorted by fewest mistakes, then fastest avg time
 */
export function sortPlayersBestOfX(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    // First by mistakes (ascending)
    const mistakeDiff = (a.stats.mistakes || 0) - (b.stats.mistakes || 0);
    if (mistakeDiff !== 0) return mistakeDiff;

    // Then by average reaction time (ascending)
    return (
      (a.stats.averageReactionTime || Infinity) -
      (b.stats.averageReactionTime || Infinity)
    );
  });
}

/**
 * Convert players to leaderboard entries
 */
export function playersToLeaderboard(
  players: Player[],
  mode: 'lastManStanding' | 'bestOfX'
): LeaderboardEntry[] {
  const sorted =
    mode === 'lastManStanding'
      ? sortPlayersLastManStanding(players)
      : sortPlayersBestOfX(players);

  return sorted.map((player, index) => ({
    playerId: player.id,
    playerName: player.name,
    rank: index + 1,
    mistakes: player.stats.mistakes || 0,
    averageTime: player.stats.averageReactionTime || 0,
    roundsSurvived: player.stats.roundsSurvived || 0,
    status: player.status,
  }));
}

/**
 * Check if game should end
 */
export function shouldGameEnd(
  players: Player[],
  currentRound: number,
  settings: GameSettings
): boolean {
  if (settings.mode === 'lastManStanding') {
    // Game ends when 1 or fewer players remain
    const activePlayers = players.filter((p) => p.status !== 'eliminated');
    return activePlayers.length <= 1;
  } else {
    // Best of X: game ends when all rounds are completed
    return currentRound >= (settings.rounds || 10);
  }
}

/**
 * Get the winner from players
 */
export function getWinner(
  players: Player[],
  mode: 'lastManStanding' | 'bestOfX'
): Player | null {
  const sorted =
    mode === 'lastManStanding'
      ? sortPlayersLastManStanding(players)
      : sortPlayersBestOfX(players);

  return sorted[0] || null;
}

/**
 * Create a shareable game URL
 */
export function getGameUrl(gameCode: string): string {
  return `${window.location.origin}/join/${gameCode}`;
}
