// Color-related jokes for the waiting screen

import { COLOR_JOKES } from '../types/game.types';

export { COLOR_JOKES };

let lastJokeIndex = -1;

/**
 * Get a random joke, avoiding repeating the last one
 */
export function getRandomJoke(): string {
  let index: number;
  do {
    index = Math.floor(Math.random() * COLOR_JOKES.length);
  } while (index === lastJokeIndex && COLOR_JOKES.length > 1);

  lastJokeIndex = index;
  return COLOR_JOKES[index];
}

/**
 * Get all jokes
 */
export function getAllJokes(): string[] {
  return [...COLOR_JOKES];
}

/**
 * Get a joke by index
 */
export function getJokeByIndex(index: number): string {
  return COLOR_JOKES[index % COLOR_JOKES.length];
}
