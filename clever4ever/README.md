# Clever 4ever implementation plan

This folder is the fourth score-sheet app in the repository. The finished app must look and behave like `thatsprettyclever/`, `twiceasclever/`, and `clevercubed/`: one compact mobile scorecard, pure HTML/CSS/JavaScript, no build step, no external resources, automatic score calculation, and the same reusable visual and interaction idioms.

The reference image is `clever4ever.jpg`. The authoritative rules are the publisher's rulebook:

https://www.schmidtspiele.de/files/Produkte/4/49203%20-%20Kniffel%C2%AE/49424_Clever_4ever_DE.pdf

Do not implement the full dice game. Like the previous three apps, this is an interactive score sheet. The player records results and the app calculates scores and foxes.

## Non-negotiable repository conventions

- Keep the runtime app to `index.html`, `style.css`, and `app.js`; use the existing local Marck Script font and root-level shared files.
- Do not add a framework, package manager, build tool, SVG/image dependency, or network request.
- Reuse the existing class vocabulary wherever it fits: `scorecard`, `row`, `column`, `surroundingbox`, `area`, `square`, `bigsquare`, `circle`, `bonusbox`, `points`, `tinypoints`, `pointsnumber`, `strikethrough`, `below`, `foxbelow`, `hiddenscore`, and the color-specific `*shadow`, `*points`, and `*bonus` classes.
- Use inline `onclick` handlers, global functions, and the existing number-picker modal style so this app feels like the other three.
- Foxes are CSS score icons, never emoji. Use `<div class="points fox"><div class="pointsnumber">0</div></div>`.
- Use `🎲`, `↻`, `+1`, `±1`, and `?` as the same pragmatic substitutes used elsewhere. Exact decorative artwork is not required.
- Use the existing shared `../recolor.css`, `../recolor.js`, `../offline.js`, `../manifest.webmanifest`, and `../marck-script-v22-latin-regular.woff2` rather than copying them.
- Preserve the existing 30rem mobile scorecard width and black page background. Match the reference's portrait silhouette instead of making a desktop dashboard.

## Best donor for each part

1. Start from `clevercubed/` because it has the current local-font, top-track, responsive scorecard, CSS fox, score summary, recolor, offline, and modal conventions.
2. Copy stable primitives, not Clever Cubed's late inline DOM-rewrite scripts. Clever 4ever's final HTML should declare its real DOM directly.
3. Reuse `clevercubed/app.js` for score orchestration, number picking, strike toggling, circle tri-state behavior, fox coloring, score hiding, modal dismissal, and one-time `beforeunload` registration.
4. Reuse the 6-by-N grid patterns from Clever Cubed for blue, its long-track column alignment for green/pink, and its grey top controls.
5. Use `twiceasclever/` only when it has a cleaner version of a primitive or interaction. Do not carry over its old scoring tables or misleading color names.

## Canonical colors and naming

Use direct, honest names in this implementation. Do not repeat Clever Cubed's `calcSilver()`/`calcYellow()` naming mismatch.

| Area | Suggested gradient center | Dark edge | Points/bonus fill | Function | Output id |
|---|---:|---:|---:|---|---|
| Yellow | `#f3c900` | `#805c00` | `#f5c820` | `calcYellow()` | `yellowpoints` |
| Blue | `#28aee4` | `#04527d` | `#079fa8` or a slightly bluer matched value | `calcBlue()` | `bluepoints` |
| Grey | `#888888` | `#222222` | `#aeaeae` | `calcGrey()` | `greypoints` |
| Green | `#70bd18` | `#285d00` | `#64a915` | `calcGreen()` | `greenpoints` |
| Pink | `#ff73ad` | `#97165b` | `#e91e63` | `calcPink()` | `pinkpoints` |

Keep bonus colors consistent throughout: yellow `#f5c820`, pink `#e91e63`, green `#64a915`, grey `#aeaeae`, blue `#079fa8`, and black `#050505`.

## Exact score-sheet data

### Top controls

- Three large empty dice fields run vertically at left.
- Round cards are `1` through `6` with these contents below them: reroll, `+1`, silver polish (`±1`), black `?`, three-player marker, four-player marker.
- To the right of the lower two dice fields, place:
  - a reroll action track with seven tri-state circles and a pink `?` completion bonus;
  - a `+1` action track with seven tri-state circles;
  - a separate silver-polish action panel with nine tri-state circles in a 3-by-3 arrangement.
- Reuse `circle()`: empty white outline -> unlocked black outline -> crossed/used -> empty. These action states do not change the numerical score.

### Yellow area

- Three rows of five number boxes. Every row fills left-to-right.
- The top row must be strictly increasing. The middle and bottom rows accept any 1-6 value.
- Top-row bonuses by column: none, silver polish, grey `?`, green `?`, fox.
- Middle-row bonuses by column: reroll, pink `?`, blue `?`, `+1`, yellow `?`.
- Bottom row has no immediate bonuses.
- Completed-column score values: `[10, 10, 15, 15, 20]`.
- Score formula: `sum(bottom row) - sum(middle row) + sum(completed-column values)`. The top row scores no values directly. A column is complete only when all three cells contain a value. The result may be negative.
- The yellow fox is unlocked when the fifth/top-row cell contains a value.
- Show live middle-row minus subtotal, bottom-row plus subtotal, and completed-column subtotal near their printed score icons if space permits; `yellowpoints` is their combined result.

### Blue area

- A 6-by-6 matrix. Rows are labeled blue die `1..6`; columns are labeled white die `1..6`.
- Tapping a matrix cell toggles one cross. IDs should be stable (`b-r1-c1` through `b-r6-c6`) or data-driven (`data-row`, `data-column`).
- Row bonuses, earned when a row has at least two crosses: green `?`, pink `?`, yellow `?`, `+1`, grey `?`, fox.
- The top-left-to-bottom-right diagonal grants a reroll bonus when it has at least two crosses.
- Column score values are `[7, 8, 9, 10, 11, 12]`; add a column's value when it has at least two crosses.
- The opposite diagonal, top-right-to-bottom-left, scores `6` points when it has at least two crosses.
- `calcBlue()` is the sum of qualifying column values plus the possible six-point diagonal. The blue fox is unlocked when row 6 has at least two crosses.
- Do not accidentally use one diagonal for both the reroll and the six points.

### Grey area

- Render a 4-by-16 grid. Column scores are `[1, 2, 3, 4, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11]`.
- The shade matrix below is transcribed from `clever4ever.jpg`. `W` = white, `L` = light grey, `D` = dark grey.

```text
      01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16
R1     L  W  W  L  L  L  L  W  W  L  L  D  L  L  D  D
R2     L  W  W  D  D  D  L  W  W  W  L  D  L  W  D  L
R3     L  L  W  L  L  L  W  D  D  L  L  W  L  W  W  D
R4     L  D  D  L  D  D  W  D  D  L  W  W  L  W  L  D
```

- Treat each orthogonally connected same-shade component as one polyomino region. Give all cells in a component the same `data-region`. Clicking any cell toggles the entire region. This mirrors how a grey die fills a whole region without requiring the app to know the die value.
- The two valid starting regions are the two components that touch the far-left edge. Do not prevent corrections or enforce adjacency in the score sheet; the player remains responsible for legal play.
- Bonuses are at: R1C1 silver polish, R1C6 green `?`, R1C13 silver polish; R2C8 reroll, R2C16 green `?`; R3C4 pink `?`, R3C6 silver polish, R3C10 silver polish, R3C14 blue `?`; R4C1 reroll, R4C8 `+1`, R4C12 yellow `?`, R4C15 silver polish.
- `calcGrey()` adds a column score only when all four cells in that column are crossed.
- Completing every cell of each shade earns one fox, so grey can contribute zero through three foxes. Render three board fox icons in the right-hand grey panel.
- Use borders and small radius differences to make region shapes legible, but retain the compact square grid and the three reference shades.

### Green area

- Eleven columns. Each main box is split diagonally into independently clickable top and bottom halves.
- The upper and lower tracks each fill left-to-right independently. Each half stores one 1-6 value.
- Lower-half bonuses by column: reroll, blue `?`, silver polish, yellow `?`, grey `?`, `+1`, pink `?`, blue `?`, yellow `?`, fox, `+1`.
- A column scores only when both halves have values. Columns 1-3 score `top + bottom`; columns 4-11 score `2 * (top + bottom)`.
- Show the calculated value in a star above every completed column, with blank stars for incomplete columns and visible `x2` cues above columns 4-11.
- The green fox is unlocked when column 10's lower half contains a value.
- Do not make the diagonal line a decorative overlay that intercepts clicks. Use two actual buttons/hit areas or delegated pointer math with accessible labels.

### Pink area

- Twelve number boxes filled left-to-right. Progress scores are `[2, 4, 6, 9, 12, 15, 19, 23, 27, 32, 37, 42]`.
- Bonuses by column: silver polish, none, green `?`, `+1`, reroll, none, grey `?`, fox, none, blue `?`, none, yellow `?`.
- Picker values are 1-6.
- Value effects: `1` no effect; `2` adds 2 end-game points; `3` writes one additional `3` into the next empty box; `4` adds 4 end-game points; `5` earns that column's printed bonus; `6` earns that bonus and adds 3 end-game points.
- The automatic `3` is exactly one extra write and must not recursively create an infinite chain. Mark it with `data-auto="true"` if helpful. If no next box is available, do nothing.
- `calcPink()` equals the progress value of the last occupied prefix box plus `2` for each entered 2, `4` for each entered 4, and `3` for each entered 6.
- The pink fox is unlocked only when column 8 contains a 5 or 6, because printed bonuses trigger only for 5/6.
- A number should be visually circled for 2, 4, and 6. Keep the number editable; the circle is derived from its value, not separately toggled state.

### Summary and fox scoring

- Summary order: yellow, blue, grey, green, pink, fox, total.
- Each board fox and the fox summary displays the current fox value: the minimum of the five colored scores.
- Fox multiplier is the total unlocked fox count: yellow 0/1 + blue 0/1 + grey 0/3 + green 0/1 + pink 0/1, plus any manually unlocked fox from the top action area only if the reference explicitly contains one (it does not appear to).
- Total: `yellow + blue + grey + green + pink + foxCount * foxValue`.
- Lowest-area fox classes should be `foxy`, `foxb`, `foxs`, `foxg`, `foxp`. On ties, use the first area in summary order; the color is only visual and does not change scoring.

## Implementation steps

1. **Baseline once, before editing.** Record `git status --short`, do not touch unrelated dirty files, and read this guide plus the three prior app READMEs. Inspect `clever4ever.jpg` at full resolution.
2. **Establish the static page shell.** Keep the prepared head, modal, scorecard, named sections, summary, and script order. Set the title to `Clever 4ever`. Build the final top controls and all five colored sections directly in HTML. Avoid post-load scripts that rewrite the DOM.
3. **Copy and specialize CSS primitives.** Bring across the proven sizes and shapes from Clever Cubed. Add only section-specific layout rules: yellow 3x5, blue 6x6, grey 4x16, green split cells, and pink 12-cell track. Keep all columns centered with score markers and bonuses in the same column wrapper.
4. **Add static canonical content.** Enter all score tables, bonus locations, row/column labels, shade classes, and green/pink multipliers before implementing behavior. Compare source data against the tables above and the reference image.
5. **Implement common state helpers.** Use `data-value` for number cells, `strikethrough` for crossed cells/regions, and inline style/class state for action circles. Register `beforeunload` once, on the first actual edit. Every edit ends in `updateScore()`.
6. **Implement number picking.** One modal is enough. Configure it with an allowed-values array and selected target. Clear restores the target's printed placeholder. Yellow/green/pink use 1-6. Top yellow filters values greater than the previous cell. Keep editing and clearing possible.
7. **Implement one calculator at a time in visual order.** Use the exact formulas above. Each calculator returns a number and only increments `numFoxes` for its own verified fox conditions. Keep rendering of per-column stars/subtotals inside the relevant calculator.
8. **Implement fox/total orchestration.** Reset `numFoxes`, call exactly five calculators, find the minimum, update all `.fox` displays/classes, update `foxmultiplier`, and write the total. Do not let score-display DOM rewrites destroy event state.
9. **Add pink automatic-3 behavior last.** Run it as a result of selecting 3, not during `calcPink()`. Calculators must be pure reads plus display updates; they should never create new moves.
10. **Add shared integration only after the board is correct.** Add a `clever4ever` entry to root `recolor.js`; add the folder to the `offline.js` nested-page regex; add the three runtime files to `sw.js` and bump its cache name; add a root `index.html` link. Do not cache `clever4ever.jpg` or this guide because the runtime does not need them.
11. **Validate functionally before visual polish.** Run `node --check clever4ever/app.js`. Serve the repository root over HTTP and test the deterministic cases below. Fix behavior before spacing.
12. **Perform one top-down visual pass.** At a roughly 30rem mobile viewport compare against `clever4ever.jpg`: silhouette, section order/sizes, exact grids and bonuses, colors, score markers, overlap, typography. Then test a narrow phone viewport without horizontal page scrolling.
13. **Finish with repository checks.** Test modal backdrop, Safari X rendering pattern, score hiding, recolor, reload/offline registration, and all summary values. Run `git diff --check` and report only files intentionally changed.

## Deterministic scoring checks

Use these before any subjective visual iteration:

1. Empty board -> all five areas `0`, fox value `0`, multiplier `0x`, total `0`.
2. Yellow middle `[1,2,3,4,5]`, bottom empty, top empty -> `-15`. Add bottom `[1,2,3,4,5]` -> `0`. Fill top row with any valid increasing prefix across all five columns -> completed-column bonus `70`, so yellow becomes `70`.
3. Blue crosses R1C2 and R2C2 -> column 2 scores `8`. Add R1C5 and R2C5 -> column 5 scores `11`; if two marks also lie on the top-right-to-bottom-left diagonal, add `6` exactly once.
4. Grey: cross every cell in one column but only three of its four rows -> no points for that column. Cross the fourth -> add exactly that column's printed value.
5. Green column 1 values 2 and 5 -> `7`. Green column 4 values 2 and 5 -> `14`. A half-filled column -> `0`.
6. Pink prefix `[1,2,3,3,4,6]` -> progress `15` plus `2 + 4 + 3 = 9`, total `24`. The selected 3 creates only the next single 3.
7. Fox integration: force color scores `[10,20,30,40,50]` and unlock two foxes -> fox value `10`, fox total `20`, grand total `170`. Repeat with a tie for minimum to verify stable visual color precedence without changing the total.

## Visual acceptance checklist

- The page immediately opens on the score sheet; no hero, navigation chrome, instructions panel, or extra route.
- Reference order is top controls; yellow and blue side-by-side; grey full width; green full width; pink full width; score summary.
- All labels, score values, bonus colors, and bonus positions match this guide and the source image.
- Every hit target is usable by touch; number cells cannot select text.
- No emoji foxes and no external resources.
- There is no page-level horizontal scroll at 320px width. Dense inner tracks may scale through smaller CSS dimensions, not a separate desktop layout.
- All score/bonus markers remain visible rather than being clipped by `.area { overflow: hidden; }`.
- The five summary diamonds, fox multiplier/value, and total update after every edit and can be hidden/restored by tapping the summary as in the prior apps.

## Implementation status

`index.html`, `style.css`, and `app.js` now contain the first complete score-sheet implementation. The five scoring areas, fox calculation, modal interactions, shared recolor integration, and offline registration are present and have received an initial 30rem/320px visual pass.
