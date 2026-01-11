# Design System (Figma Brief)

## Design Philosophy
- **Fun & Playful**: Bright colors, smooth animations, celebratory moments
- **Clear & Simple**: Easy to understand at a glance, minimal cognitive load
- **Modern**: Contemporary UI patterns, gradient accents, subtle shadows
- **Accessible**: High contrast, readable fonts, touch-friendly sizes
- **Responsive**: Works seamlessly on mobile phones, tablets, and desktop

## Brand & Style Guide

### Color Palette

**Primary Colors:**
- Primary Blue: `#3B82F6` (actions, buttons)
- Primary Purple: `#8B5CF6` (accents, highlights)
- Success Green: `#10B981` (correct answers, success states)
- Error Red: `#EF4444` (wrong answers, elimination)
- Warning Orange: `#F59E0B` (timer warnings)

**Neutral Colors:**
- Background Dark: `#0F172A` (main background)
- Surface: `#1E293B` (cards, panels)
- Surface Light: `#334155` (hover states, secondary surfaces)
- Text Primary: `#F8FAFC` (headings, important text)
- Text Secondary: `#94A3B8` (secondary text, labels)

**Game Colors (Examples - will be randomized):**
- Red: `#FF0000`
- Blue: `#0000FF`
- Green: `#00FF00`
- Yellow: `#FFFF00`
- Orange: `#FF8800`
- Purple: `#8800FF`
- Pink: `#FF00FF`
- Cyan: `#00FFFF`
- Lime: `#88FF00`

### Typography
- **Font Family**: Inter or Poppins (modern, clean, highly legible)

**Type Scale:**
- Display: 48px/60px, Bold (game codes, big numbers)
- H1: 36px/44px, Bold (page titles)
- H2: 28px/36px, Semibold (section headers)
- H3: 20px/28px, Semibold (card titles)
- Body Large: 18px/28px, Regular (main content)
- Body: 16px/24px, Regular (standard text)
- Body Small: 14px/20px, Regular (secondary info)
- Caption: 12px/16px, Medium (labels, metadata)

### Spacing System
Use 8px base unit:
- 4px (0.5 unit)
- 8px (1 unit)
- 16px (2 units)
- 24px (3 units)
- 32px (4 units)
- 48px (6 units)
- 64px (8 units)

### Border Radius
- Small: 8px (buttons, inputs)
- Medium: 12px (cards, panels)
- Large: 16px (modals, major surfaces)
- XLarge: 24px (color buttons in game)
- Round: 9999px (pills, avatars)

### Shadows
- Small: `0 1px 3px rgba(0, 0, 0, 0.12)`
- Medium: `0 4px 6px rgba(0, 0, 0, 0.16)`
- Large: `0 10px 15px rgba(0, 0, 0, 0.2)`
- XLarge: `0 20px 25px rgba(0, 0, 0, 0.25)`

## Component Library

See full component specifications in the original Figma brief. Key components:
- Buttons (Primary, Secondary, Icon)
- Input Fields (Text, Game Code)
- Cards (Standard, Elevated)
- Color Buttons (Game)
- Progress Indicators (Timer, Loading Spinner, Countdown Dots)

## Responsive Breakpoints

**Mobile (320px - 767px):**
- Single column layout
- Color grid: 2×2 for 4 colors, 2×3 for 5-6, 3×3 for 7-9
- Color buttons: 80×80px minimum
- Full-width buttons
- Sticky header with round info
- Bottom sheet for leaderboard

**Tablet (768px - 1023px):**
- Two column where appropriate
- Color grid: Same as mobile but larger (100×100px)
- Side-by-side cards in lobby
- Leaderboard can be modal or side panel

**Desktop (1024px+):**
- Maximum width: 1200px, centered
- Color grid: 120×120px buttons with generous spacing
- Side-by-side layouts for lobby
- Modals for leaderboards
- Hover effects enabled

## Animations & Transitions

**Page Transitions:**
- Fade in: 300ms ease-out
- Slide up: 400ms ease-out (for modals)

**Interactive Elements:**
- Hover: 200ms ease-out
- Click: 150ms ease-in-out
- Color activation: 300ms with ease-out scale

**Feedback Animations:**
- Success: Green pulse 500ms
- Error: Red shake 400ms (3 oscillations)
- Elimination: Fade to red 600ms
- Winner: Confetti + scale pulse loop

## Accessibility Requirements

**Color Contrast:**
- Text on backgrounds: Minimum 4.5:1 ratio
- Interactive elements: Minimum 3:1 ratio
- Color-blind safe: Use patterns/icons with colors

**Touch Targets:**
- Minimum size: 44×44px (iOS) / 48×48px (Android)
- Spacing: 8px minimum between targets

**Focus States:**
- Visible focus ring: 2px Primary Blue outline
- 2px offset from element
- Never remove focus indicators

**Screen Reader Support:**
- All interactive elements labeled
- Live regions for dynamic updates (players joining, timer)
- Skip links for game sections

**Keyboard Navigation:**
- Tab order logical
- Enter/Space for activation
- Escape to close modals
- Arrow keys for color grid navigation (optional enhancement)

## Iconography

**Icon Library**: Lucide Icons or Heroicons

**Icons Needed:**
- Home, Create Game, Join Game, Settings, Copy, QR Code, Refresh, Timer, Trophy, Crown, Check, X, Leave, Pause, Play, Volume
