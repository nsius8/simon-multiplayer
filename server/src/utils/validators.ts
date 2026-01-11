// Input validation utilities

import type { GameSettings } from '../models/Game.js';

/**
 * Validate game settings
 */
export function validateGameSettings(settings: GameSettings): boolean {
  // Validate difficulty
  if (![4, 5, 6, 7, 8, 9].includes(settings.difficulty)) {
    return false;
  }

  // Validate speed
  if (!['slow', 'medium', 'fast'].includes(settings.speed)) {
    return false;
  }

  // Validate mode
  if (!['lastManStanding', 'bestOfX'].includes(settings.mode)) {
    return false;
  }

  // Validate rounds for bestOfX mode
  if (settings.mode === 'bestOfX') {
    if (!settings.rounds || ![5, 10, 15, 20].includes(settings.rounds)) {
      return false;
    }
  }

  // Validate colors
  if (
    !settings.selectedColors ||
    settings.selectedColors.length !== settings.difficulty
  ) {
    return false;
  }

  return true;
}

/**
 * Validate sequence
 */
export function validateSequence(
  submitted: string[],
  correct: string[]
): boolean {
  if (submitted.length !== correct.length) return false;
  return submitted.every((color, i) => color === correct[i]);
}

/**
 * Sanitize player name
 */
export function sanitizePlayerName(name: string): string {
  return name
    .trim()
    .slice(0, 20)
    .replace(/[<>]/g, ''); // Remove potentially dangerous characters
}

/**
 * Validate game code format
 */
export function validateGameCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}
