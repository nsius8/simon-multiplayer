# Development Guide

## Tech Stack

**Frontend:**
- Framework: React with TypeScript
- Styling: Tailwind CSS
- State Management: React Context or Zustand
- Routing: React Router
- Real-time: Socket.io client
- QR Code: qrcode.react
- Sound: Howler.js or Web Audio API

**Backend:**
- Runtime: Node.js with Express
- Real-time: Socket.io
- Storage: Redis (for game state, player sessions)
- Session: express-session
- Code Generation: nanoid or shortid

**Deployment:**
- Frontend: Vercel or Netlify
- Backend: Railway, Render, or Fly.io
- Database: Upstash Redis (serverless)

## Project Structure

See `.cursorrules` for full project structure.

## Development Approach: Bottom-Up Component Development

**CRITICAL: Build components in dependency order, starting with the smallest, most isolated components first.**

### Component Dependency Hierarchy (Build Order):

1. **Foundation Layer** (No dependencies)
   - `types/game.types.ts` - TypeScript interfaces
   - `utils/colorUtils.ts` - Color selection logic
   - `utils/jokes.ts` - Joke array and getter
   - `utils/soundManager.ts` - Sound loading and playback

2. **Shared Components** (Depends on Foundation)
   - `components/shared/Button.tsx` - Reusable button
   - `components/shared/QRCode.tsx` - QR code display

3. **Atomic Game Components** (Depends on Foundation + Shared)
   - `components/game/ColorButton.tsx` - Single color button
   - `components/game/Timer.tsx` - Countdown timer display

4. **Composite Components** (Depends on Atomic)
   - `components/game/SequenceDisplay.tsx` - Uses ColorButton
   - `components/game/WaitingScreen.tsx` - Uses jokes utility
   - `components/game/GameBoard.tsx` - Uses ColorButton, Timer, SequenceDisplay

5. **Lobby Components** (Depends on Foundation + Shared)
   - `components/lobby/ColorPreview.tsx` - Uses ColorButton
   - `components/lobby/PlayerJoin.tsx` - Uses Button
   - `components/lobby/HostSetup.tsx` - Uses ColorPreview, Button
   - `components/lobby/LobbyWaiting.tsx` - Uses QRCode, ColorPreview

6. **Leaderboard Components** (Depends on Foundation)
   - `components/leaderboard/RoundLeaderboard.tsx`
   - `components/leaderboard/FinalLeaderboard.tsx`

7. **Hooks** (Depends on Foundation + Components)
   - `hooks/useSocket.ts` - Socket.io connection
   - `hooks/useSound.ts` - Uses soundManager
   - `hooks/useGame.ts` - Uses useSocket, game types

8. **Context** (Depends on Hooks)
   - `contexts/GameContext.tsx` - Uses useGame, useSocket

9. **Pages** (Depends on Components + Context)
   - `pages/Home.tsx` - Entry point
   - `pages/HostLobby.tsx` - Uses HostSetup, LobbyWaiting
   - `pages/PlayerLobby.tsx` - Uses PlayerJoin, LobbyWaiting
   - `pages/Game.tsx` - Uses GameBoard, RoundLeaderboard

10. **Server Components** (Parallel to Frontend)
    - See `.cursorrules` for full server structure

## Development Phases (Bottom-Up)

**Phase 1: Foundation** → **Phase 2: Shared Components** → **Phase 3: Atomic Game Components** → **Phase 4: Composite Game Components** → **Phase 5: Lobby Components** → **Phase 6: Leaderboard Components** → **Phase 7: Hooks & Context** → **Phase 8: Pages** → **Phase 9: Backend** → **Phase 10: Integration & Testing** → **Phase 11: Polish**

## Component Development Rules

1. **Always build in dependency order** - Never build a component that depends on another component that doesn't exist yet
2. **Test in isolation first** - Each component should work with mock data before integration
3. **Type everything** - Use TypeScript interfaces for all props and data
4. **Mobile-first** - Design for mobile, enhance for desktop
5. **Accessibility** - Include ARIA labels, keyboard navigation, high contrast
6. **Performance** - Use React.memo for static components, debounce rapid interactions
7. **Error boundaries** - Wrap major sections in error boundaries
8. **Consistent styling** - Use Tailwind utility classes, create design tokens for colors/spacing

## Environment Variables

**Client (.env):**
```
REACT_APP_API_URL=https://api.yourapp.com
REACT_APP_WS_URL=wss://api.yourapp.com
```

**Server (.env):**
```
PORT=3001
NODE_ENV=production
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=https://yourapp.com
SESSION_SECRET=your-secret-key
```

## Security Considerations

- Rate limiting on game creation and player joins
- Input sanitization for player names
- Server-side validation of all sequences
- Session validation on each action
- Anti-cheat: Server validates reaction times are realistic
- Game code uniqueness with collision detection

## Performance Optimization

- Color animations: Use CSS transforms (GPU accelerated)
- Sound preloading: Load all sounds on game start
- Debounce color clicks: Prevent double-clicks
- Memoize components: React.memo for static components
- WebSocket compression: Enable for payloads
- Redis caching: Cache game state, minimize queries
- Mobile: Touch-friendly sizes (min 60×60px), prevent zoom on double-tap
