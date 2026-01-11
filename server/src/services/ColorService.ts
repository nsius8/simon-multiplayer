// Color service for managing game colors

import type { GameColor } from '../models/Game.js';

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

/**
 * Select random colors from the palette
 */
export function selectRandomColors(count: number): GameColor[] {
  const shuffled = [...COLOR_PALETTE].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate a random sequence of color IDs
 */
export function generateSequence(colors: GameColor[], length: number): string[] {
  const sequence: string[] = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * colors.length);
    sequence.push(colors[randomIndex].id);
  }
  return sequence;
}

/**
 * Calculate time limit based on sequence length
 */
export function calculateTimeLimit(sequenceLength: number): number {
  return 10 + sequenceLength * 2;
}
