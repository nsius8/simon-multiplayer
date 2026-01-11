// Color utilities for Simon game

import {
  COLOR_PALETTE,
  type GameColor,
  getGridLayout,
  selectRandomColors,
} from '../types/game.types';

export { COLOR_PALETTE, getGridLayout, selectRandomColors };

/**
 * Get a color by its ID
 */
export function getColorById(colorId: string): GameColor | undefined {
  return COLOR_PALETTE.find((c) => c.id === colorId);
}

/**
 * Get colors by their IDs
 */
export function getColorsByIds(colorIds: string[]): GameColor[] {
  return colorIds
    .map((id) => getColorById(id))
    .filter((c): c is GameColor => c !== undefined);
}

/**
 * Get CSS classes for grid layout based on difficulty
 */
export function getGridClasses(difficulty: number): string {
  const { cols, rows } = getGridLayout(difficulty);
  return `grid-cols-${cols} grid-rows-${rows}`;
}

/**
 * Get inline grid styles for layout
 */
export function getGridStyles(
  difficulty: number
): React.CSSProperties {
  const { cols } = getGridLayout(difficulty);
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '0.75rem',
  };
}

/**
 * Get a lighter version of a color for hover states
 */
export function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

/**
 * Get a darker version of a color for pressed states
 */
export function darkenColor(hex: string, percent: number): string {
  return lightenColor(hex, -percent);
}

/**
 * Add alpha to a hex color
 */
export function addAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get the row layout for colors based on count
 * Returns an array of row sizes
 * - 4 colors: 2, 2
 * - 5 colors: 3, 2
 * - 6 colors: 3, 3
 * - 7 colors: 2, 3, 2
 * - 8 colors: 3, 2, 3
 * - 9 colors: 3, 3, 3
 */
export function getColorRowLayout(count: number): number[] {
  switch (count) {
    case 4:
      return [2, 2];
    case 5:
      return [3, 2];
    case 6:
      return [3, 3];
    case 7:
      return [2, 3, 2];
    case 8:
      return [3, 2, 3];
    case 9:
      return [3, 3, 3];
    default:
      // Fallback for other counts
      if (count <= 4) return [2, 2];
      return [3, 3, 3];
  }
}

/**
 * Group items into rows based on the color layout
 */
export function groupIntoRows<T>(items: T[]): T[][] {
  const layout = getColorRowLayout(items.length);
  const rows: T[][] = [];
  let index = 0;

  for (const rowSize of layout) {
    rows.push(items.slice(index, index + rowSize));
    index += rowSize;
  }

  return rows;
}
