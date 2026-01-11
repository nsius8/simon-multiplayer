# API & Data Models

## TypeScript Interfaces

```typescript
interface Game {
  id: string;
  code: string; // 6-character game code
  hostId: string;
  settings: GameSettings;
  players: Player[];
  status: 'lobby' | 'playing' | 'finished';
  currentRound: number;
  sequence: string[]; // array of color IDs
  createdAt: Date;
}

interface GameSettings {
  difficulty: 4 | 5 | 6 | 7 | 8 | 9;
  colors: string[]; // selected color hex codes
  speed: 'slow' | 'medium' | 'fast';
  mode: 'lastManStanding' | 'bestOfX';
  rounds?: 5 | 10 | 15 | 20; // only for bestOfX mode
}

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  status: 'waiting' | 'playing' | 'eliminated' | 'finished';
  stats: PlayerStats;
}

interface PlayerStats {
  mistakes: number;
  roundsSurvived: number;
  totalReactionTime: number;
  averageReactionTime: number;
  lastRoundTime?: number;
  placement?: number;
}

interface Round {
  number: number;
  sequence: string[];
  playerInputs: Map<string, PlayerInput>;
  startTime: Date;
  endTime?: Date;
}

interface PlayerInput {
  playerId: string;
  sequence: string[];
  isCorrect: boolean;
  reactionTime: number; // milliseconds
  submittedAt: Date;
}

interface Color {
  id: string;
  hex: string;
  name: string;
}
```

## Socket.io Events

**Client → Server:**
- `createGame` - { hostName, settings }
- `refreshColors` - { gameId }
- `startGame` - { gameId }
- `joinGame` - { code, playerName }
- `submitSequence` - { gameId, sequence, reactionTime }
- `playAgain` - { gameId } (host only)
- `newGame` - { gameId } (host only)

**Server → Client:**
- `game:created` - { gameId, code, settings }
- `colors:refreshed` - { colors }
- `player:joined` - { player }
- `player:left` - { playerId }
- `game:started`
- `round:start` - { round, sequence }
- `sequence:complete` - AI finished showing
- `input:phase:start` - { timeLimit }
- `time:update` - { remaining }
- `all:submitted` - all players submitted early
- `round:end` - { results, leaderboard, eliminatedPlayers }
- `next:round:starting` - { countdown: 3 }
- `game:end` - { finalLeaderboard, winner, stats }
- `join:error` - { message }
- `error` - { message, code }

## Utility Functions

**Color Selection:**
```typescript
const COLOR_PALETTE: Color[] = [
  { id: 'red', hex: '#FF0000', name: 'Red' },
  { id: 'blue', hex: '#0000FF', name: 'Blue' },
  { id: 'green', hex: '#00FF00', name: 'Green' },
  { id: 'yellow', hex: '#FFFF00', name: 'Yellow' },
  { id: 'orange', hex: '#FF8800', name: 'Orange' },
  { id: 'purple', hex: '#8800FF', name: 'Purple' },
  { id: 'pink', hex: '#FF00FF', name: 'Pink' },
  { id: 'cyan', hex: '#00FFFF', name: 'Cyan' },
  { id: 'lime', hex: '#88FF00', name: 'Lime' },
  { id: 'magenta', hex: '#FF0088', name: 'Magenta' },
  { id: 'teal', hex: '#00FF88', name: 'Teal' },
  { id: 'lavender', hex: '#8888FF', name: 'Lavender' },
];

function selectRandomColors(count: number): Color[] {
  const shuffled = [...COLOR_PALETTE].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

**Timer Calculation:**
```typescript
function calculateTimeLimit(round: number): number {
  return 10 + (2 * round); // seconds
}
```

**Sequence Validation:**
```typescript
function validateSequence(
  submitted: string[], 
  correct: string[]
): boolean {
  if (submitted.length !== correct.length) return false;
  return submitted.every((color, i) => color === correct[i]);
}
```

**Speed Timing:**
- Slow: 800ms per color, 400ms gap
- Medium: 600ms per color, 300ms gap
- Fast: 400ms per color, 200ms gap

**Color Button Grid Layout:**
- 4 colors: 2×2 grid
- 5-6 colors: 2×3 grid
- 7-9 colors: 3×3 grid
