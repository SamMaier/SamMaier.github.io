# Tres Fute — Score Calculator

A mobile-friendly web app that calculates scores for the board game *Tres Fute*.

## Project Structure

```
index.html   — Game board layout (score areas, dice field, tracks, modal)
style.css    — All styling (dark theme, diamond points, color-coded areas)
app.js       — Score calculation logic and user interactions
```

## Tech Stack

- **Pure vanilla HTML, CSS, JavaScript** — no frameworks, no build tools
- **Google Fonts**: Marck Script (cursive)

## Design

- **Dark theme**: black background (#000000), white borders, colored accents
- **Diamond-shaped score displays**: `.points` containers with `::before` pseudo-elements rotated 45°
- **Color-coded areas**: each scoring track has its own color (yellow, blue, green, orange, purple)
- **Shadow backgrounds**: `radial-gradient` per area to create depth
- **Mobile-first**: `touch-action: manipulation`, responsive viewport meta tag

## Common Code Patterns

### JavaScript (`app.js`)

| Pattern | Description |
|---|---|
| **Global state** | `selected`, `multiplier`, `numFoxes`, `isBeforeUnloadRegistered` at top |
| **Per-area scoring** | `calcYellow()`, `calcBlue()`, `calcGreen()`, `calcOrange()`, `calcPurple()` — each returns a score |
| **Central orchestrator** | `updateScore()` calls all area functions, computes fox value, updates DOM |
| **Fox scoring** | `numFoxes` counts bonus conditions; `foxNum = Math.min()` of all area scores; lowest area wins the fox color class (`foxo`, `foxy`, `foxb`, `foxg`, `foxp`) |
| **Modal number picker** | `numberbox()` opens `#mainmodal`; `numberpicked()` selects value; `turnOffModal()` closes it |
| **Three interactions** | `strikethrough()` — toggle ✗; `circle()` — toggle ◉ (circle); `numberbox()` — open modal for input |
| **Score hiding** | `hideScore()` / `hideScoreImpl()` toggle `.hiddenscore` class |
| **Safari hack** | In `strikethrough()`: temporarily set `display: none` then reflow to force `::after` rendering |
| **Beforeunload** | Registered once to warn on accidental page close |
| **Modal backdrop click** | `window.onclick` dismisses modal when clicking outside content |

### HTML (`index.html`)

| Pattern | Description |
|---|---|
| **Scorecard container** | `<div class="scorecard">` wraps all game UI |
| **Row / Column** | `<div class="row">` (flex row) / `<div class="column">` (flex column) helpers |
| **Surrounding boxes** | `<div class="surroundingbox">` with rounded borders wrap groups |
| **Interactive elements** | `.square`, `.circle`, `.bigsquare` with inline `onclick` handlers |
| **Bonus indicators** | `<div class="bonusbox">` with colored variants (`yellowbonus`, `bluebonus`, etc.) |
| **Fox display** | `<div class="points fox">` with `.pointsnumber` child |
| **Modal** | `<div id="mainmodal" class="modal">` with numbered `.bigsquare` buttons and a clear box |
| **Score summary** | Bottom row with colored diamond `.points` for each area + totalScore |

### CSS (`style.css`)

| Pattern | Description |
|---|---|
| **Box reset** | `body` with `margin: 0`, dark bg; `div` inherits Marck Script font |
| **Bonus box** | `.bonusbox` — small rounded square, black by default, colored variants |
| **Diamond points** | `.points` + `::before` rotated 45° — each area has a colored variant (`.yellowpoints`, `.bluepoints`, etc.) |
| **Number overlay** | `.pointsnumber` with `z-index: 999` sits on top of diamonds |
| **Interactive shapes** | `.bigsquare` (3.2rem), `.square` (2rem), `.circle` (1.8rem, 50% border-radius) |
| **Strikethrough** | `.strikethrough::before` + `::after` with rotated lines (X marks) |
| **Small strikethrough** | `.smallstrikethrough` for bonus box marks |
| **Shadow backgrounds** | `.yellowshadow`, `.blueshadow`, `.greenshadow`, `.orangeshadow`, `.purpleshadow` — radial gradients |
| **Positioned bonuses** | `.below` (1.6rem down), `.belo` (3.4rem down), `.foxbelow`, `.foxbelo` |
| **Spacing** | `.gobelow` (margin top/bottom) for number boxes |
| **Flex helpers** | `.row`, `.column` |
| **Modal** | Fixed overlay, `z-index: 99999`, semi-transparent bg |
| **Score hiding** | `.hiddenscore` sets font-size to 0.001rem |
