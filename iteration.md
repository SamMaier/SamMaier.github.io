# Clever 4ever iteration guide

Use this file together with `clever4ever/README.md`. The goal is a close visual match to `clever4ever/clever4ever.jpg`, while preserving the compact mobile conventions of `clevercubed/`, `twiceasclever/`, and `thatsprettyclever/`. Clever 4ever is an interactive score sheet, not a full dice-game implementation.

## Required workflow

1. Before editing, run `git status --short` and preserve unrelated worktree changes.
2. Work from the repository root and serve the site over HTTP. Use a simple local Node server if Python is unavailable.
3. Open `http://127.0.0.1:8765/clever4ever/index.html` in the in-app browser. Do not use a `file:///` URL because relative assets, recoloring, and offline registration are unreliable there.
4. Confirm the page title is `Clever 4ever` and the score sheet renders immediately without navigation or instructions around it.
5. Compare with `clever4ever/clever4ever.jpg` from the top down. Prioritize silhouette and section order, grids and score values, bonus placement, colors, overlap, typography, then substitute icon details.
6. Validate behavior before visual polish. Run `node --check clever4ever/app.js`, exercise the deterministic scoring checks below, and inspect the browser console.
7. After each focused visual edit, reload the HTTP preview and take a fresh full-page screenshot. Finish with a 30rem viewport and a 320px-wide viewport.
8. Run `git diff --check` and report only intentionally changed files.

Do not trust a stale screenshot or an old Clever Cubed browser tab. Confirm the current URL contains `/clever4ever/`. If the browser appears unchanged, verify the loaded stylesheet and use a temporary query-string cache-buster in `clever4ever/index.html` while iterating.

## Repository and layout conventions

- Keep the runtime app to `clever4ever/index.html`, `clever4ever/style.css`, and `clever4ever/app.js`. Use the root-level local font, recolor, manifest, and offline files.
- Use vanilla HTML, CSS, and JavaScript. Do not add frameworks, build tooling, external resources, or runtime network requests.
- Keep the scorecard at a maximum width of 30rem on a black page. There must be no page-level horizontal scrolling at 320px.
- Preserve the visual order: top controls; yellow and blue side by side; grey full width; green full width; pink full width; score summary.
- Reuse `row`, `column`, `surroundingbox`, `area`, `square`, `bigsquare`, `circle`, `bonusbox`, `points`, `tinypoints`, `pointsnumber`, `strikethrough`, and the color-specific shadow/points/bonus classes.
- Declare the score-sheet DOM directly in HTML. Do not use late scripts that replace or rebuild whole sections.
- Keep bonus and score markers aligned with their owning column. Do not clip markers with `.area { overflow: hidden; }`.
- Use the local Marck Script font and the established number-picker modal, inline handlers, score hiding, Safari X-rendering workaround, and one-time `beforeunload` registration.

## Color and icon conventions

- Yellow: gradient centre `#f3c900`, dark edge `#805c00`, points/bonus `#f5c820`.
- Blue: gradient centre `#28aee4`, dark edge `#04527d`, points/bonus `#079fa8`.
- Grey: gradient centre `#888888`, dark edge `#222222`, points/bonus `#aeaeae`.
- Green: gradient centre `#70bd18`, dark edge `#285d00`, points/bonus `#64a915`.
- Pink: gradient centre `#ff73ad`, dark edge `#97165b`, points/bonus `#e91e63`.
- Black bonuses use `#050505`.
- Foxes are CSS score icons, never emoji: `<div class="points fox"><div class="pointsnumber">0</div></div>`.
- `🎲`, `↻`, `+1`, `±1`, and `?` are acceptable substitutes for decorative artwork. Player-count artwork may be simplified while retaining comparable placement and weight.

## Canonical section content

### Top controls

- Three large empty dice fields run vertically at left.
- Round cards are `1` through `6`, with reroll, `+1`, silver polish (`±1`), black `?`, three-player, and four-player markers beneath them.
- The reroll and `+1` tracks each contain seven tri-state circles. The reroll track ends with a pink `?` bonus.
- The separate silver-polish panel contains nine tri-state circles in a 3-by-3 grid.
- Action circles cycle empty white outline → unlocked black outline → crossed/used → empty. They do not affect the numerical score.

### Yellow area

- Use three rows of five number boxes. The top row must be strictly increasing; the middle and bottom rows accept values `1–6`.
- Top-row bonuses: none, grey `±1`, grey `?`, green `?`, fox.
- Middle-row bonuses: reroll, pink `?`, blue `?`, `+1`, yellow `?`. The bottom row has no immediate bonuses.
- Completed-column values are `10, 10, 15, 15, 20`.
- Score: `sum(bottom) - sum(middle) + completed-column values`. A column is complete only when all three cells contain a value. Negative scores are valid.
- Unlock the yellow fox when top-row column 5 contains a value. Keep the middle, bottom, and completed-column subtotals visible.

### Blue area

- Use a 6-by-6 matrix. Rows are blue-die values `1–6`; columns are white-die values `1–6`.
- Row bonuses for at least two crosses are, top to bottom: green `?`, pink `?`, yellow `?`, `+1`, grey `?`, fox.
- Column scores for at least two crosses are `7, 8, 9, 10, 11, 12`.
- The top-left-to-bottom-right diagonal grants reroll at two crosses. The opposite diagonal grants 6 points at two crosses. Never reuse one diagonal for both rules.
- Unlock the blue fox when row 6 contains at least two crosses.

### Grey area

- Use a 4-by-16 grid with column scores `1, 2, 3, 4, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11`.
- Shades, left to right, are:

```text
R1  L W W L L L L W W L L D L L D D
R2  L W W D D D L W W W L D L W D L
R3  L L W L L L W D D L L W L W W D
R4  L D D L D D W D D L W W L W L D
```

- Every orthogonally connected same-shade component is one region. Clicking any cell toggles its whole region; corrections and non-adjacent choices remain allowed.
- Bonuses: R1C1 `±1`, R1C6 green `?`, R1C13 `±1`; R2C8 reroll, R2C16 green `?`; R3C4 pink `?`, R3C6 `±1`, R3C10 `±1`, R3C14 blue `?`; R4C1 reroll, R4C8 `+1`, R4C12 yellow `?`, R4C15 `±1`.
- Score a column only when all four cells are crossed.
- Completing every cell of a shade unlocks one fox, so grey contributes zero through three foxes. Show three grey board fox icons.

### Green area

- Use eleven columns. Every box is split diagonally into independently clickable top and bottom halves; each track fills left-to-right and accepts `1–6`.
- Lower bonuses: reroll, blue `?`, `±1`, yellow `?`, grey `?`, `+1`, pink `?`, blue `?`, yellow `?`, fox, `+1`.
- Columns 1–3 score `top + bottom`; columns 4–11 score `2 × (top + bottom)`. A half-filled column scores zero.
- Show each completed column score in the star above it and retain `x2` cues on incomplete columns 4–11.
- Unlock the green fox when column 10's lower half contains a value. The diagonal must not intercept either hit target.

### Pink area

- Use twelve number boxes with progress scores `2, 4, 6, 9, 12, 15, 19, 23, 27, 32, 37, 42`.
- Bonuses: `±1`, none, green `?`, `+1`, reroll, none, grey `?`, fox, none, blue `?`, none, yellow `?`.
- Values `2`, `4`, and `6` are visually circled. A `2` adds 2 points, a `4` adds 4, and a `6` adds 3.
- Entering `3` writes exactly one additional `3` into the next empty box without recursion.
- The score is the progress value of the last occupied prefix box plus all value-based extras.
- Unlock the pink fox only when column 8 contains `5` or `6`.

## Summary and fox scoring

- Summary order is yellow, blue, grey, green, pink, fox, total.
- Fox value is the minimum of the five coloured scores. On ties, use the first area in summary order for the visual class: `foxy`, `foxb`, `foxs`, `foxg`, `foxp`.
- Fox multiplier is yellow `0/1` + blue `0/1` + grey `0/3` + green `0/1` + pink `0/1`. Top action tracks do not add foxes.
- Total is `yellow + blue + grey + green + pink + foxCount × foxValue`.
- Every board fox and the summary fox displays the current fox value. Tapping the summary hides and restores its values.

## Deterministic functional checks

1. Empty board: all areas `0`, fox value `0`, multiplier `0x`, total `0`.
2. Yellow middle `[1,2,3,4,5]`: `-15`. Add the same bottom row: `0`. Add a valid increasing top row across all five columns: `70`.
3. Blue R1C2 and R2C2: `8`. Add a second qualifying column and ensure the opposite-diagonal bonus is added only when two marks lie on that diagonal.
4. Grey: three marks in a column score zero; the fourth adds exactly that column's printed value.
5. Green column 1 with `2` and `5`: `7`; column 4 with `2` and `5`: `14`; a half-filled column: `0`.
6. Pink prefix `[1,2,3,3,4,6]`: progress `15` plus extras `9`, total `24`. A selected `3` creates only the next single `3`.
7. Forced colour scores `[10,20,30,40,50]` with two foxes produce fox value `10`, fox total `20`, and grand total `170`. A tied minimum keeps stable colour precedence without changing the score.

## Final visual checklist

- The portrait silhouette and section proportions resemble `clever4ever/clever4ever.jpg`.
- Exact grids, labels, score values, shade regions, bonuses, and fox locations match this guide.
- Every target is touch-usable and number text cannot be selected accidentally.
- Score and bonus markers remain visible and centered.
- The page has no horizontal scroll at 320px.
- Recoloring, modal dismissal, score hiding, reload warning, service-worker registration, and all score updates work.
- No external resources or emoji foxes are present.
