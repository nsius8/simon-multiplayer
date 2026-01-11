# Game Rules & Mechanics

## Game Setup & Lobby

### Host Configuration
- Host must enter their name before setup
- Host selects three settings:
  1. **Difficulty**: 4, 5, 6, 7, 8, or 9 colors
  2. **Color Selection**:
     - System randomly selects X colors from full palette (where X = difficulty)
     - Host sees preview of selected colors
     - "Refresh Colors" button to randomize color selection again
  3. **Speed**: Slow / Medium / Fast (affects playback speed between colors)
  4. **Game Mode**:
     - **Last Man Standing**: Players eliminated on mistakes, continue until 1 remains
     - **Best of X**: Host selects 5, 10, 15, or 20 rounds - winner has fewest mistakes

### Lobby Display
- System generates unique game code (display prominently)
- Shareable link (copy/share functionality)
- QR code for scanning (mobile-friendly)
- Real-time player list (max 10 players)
- Current settings display:
  - Difficulty
  - Speed
  - Mode
  - Color preview (show selected colors)
- "Start Game" button (visible to host only)

## Player Joining

### Join Flow
- Players enter via link/code/QR code
- Players enter their name
- Players see lobby with:
  - Waiting players list
  - Game settings (including color preview)
  - Waiting state until host starts

### Validation
- Maximum 10 players per game
- Unique player names (handle duplicates gracefully)
- Players cannot start game (host-only action)

## Gameplay Loop

### Round Start (Sequence Playback)
- All players see the color sequence play out simultaneously
- Colors light up one-by-one with sound effects
- Playback speed determined by host's speed setting:
  - Slow: longest delay between colors
  - Medium: moderate delay
  - Fast: shortest delay
- Sequence length = round number:
  - Round 1 = 1 color
  - Round 2 = 2 colors
  - Round 3 = 3 colors
  - etc.

### Input Phase
- Timer calculation: `10 seconds + (2 seconds × number of colors in sequence)`
  - Round 1: 10s
  - Round 2: 12s
  - Round 3: 14s
  - Round 5: 18s
- All players input their sequence simultaneously
- Timer counts down visibly for all players
- Players who finish early see:
  - "Waiting for others..." message
  - Random color-related joke (rotating display)
- Input validation: only allow colors that are in the game's color set

### Round End / Leaderboard Display
- Show leaderboard after each round for 5-10 seconds
- Leaderboard content varies by mode:
  - **Last Man Standing**: 
    - Players still in (sorted by fastest time)
    - Eliminated players (shown separately)
  - **Best of X**: 
    - All players (sorted by fewest mistakes, then fastest avg time)
- Auto-advance to next round after display period
- Show round number and progress

## Elimination & Mistake Tracking

### Last Man Standing Mode
- One wrong color = immediate elimination
- Eliminated players:
  - Stay connected to watch
  - Cannot input in subsequent rounds
  - Shown in "eliminated" section of leaderboard
- Game continues until:
  - 1 player remains (winner)
  - OR all players eliminated (no winner)

### Best of X Mode
- Wrong colors tracked as mistakes (not elimination)
- All players continue for all X rounds
- Running mistake count visible on leaderboard
- Track mistakes per round and total mistakes

### Timing & Scoring
- Track time to complete each round (for each player)
- Calculate average reaction time across completed rounds
- Store round-by-round performance data

## Game End

### Final Leaderboard
- Display winner prominently
- Rank all players by:
  - **Last Man Standing**: elimination order (last eliminated = winner)
  - **Best of X**: fewest mistakes, then fastest average time
- Show stats for each player:
  - Rounds survived/completed
  - Total mistakes
  - Average reaction time
  - Best round time

### Post-Game Actions
- Host options:
  - "Play Again" (restart with same settings)
  - "Back to Lobby" (return to lobby to change settings)
- Players can leave or wait for host to start new game
