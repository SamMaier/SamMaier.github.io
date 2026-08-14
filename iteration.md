# Clever Cubed iteration guide

Use this file together with `clevercubed/README.md`. The goal is a close visual match to `clevercubed/endgoal.png`, while preserving the conventions and compact style of `twiceasclever/` and `thatsprettyclever/`. Prefer copying an existing construct and making a small tweak over inventing a new layout system.

## Required workflow

1. Work from the repository root and serve the site over HTTP. The bundled Python runtime may be needed if `python` is not on PATH; alternatively use a simple local Node static server.

   `python -m http.server 8765 --bind 127.0.0.1`

2. Open `http://127.0.0.1:8765/clevercubed/index.html` in the in-app browser. Do not use the `file:///` URL for visual testing; relative assets and caching are unreliable there.
3. Confirm the page title is `Clever Cubed` and the page itself is rendered.
4. Take a fresh full-page browser screenshot after every small group of edits. Also take a viewport screenshot of the section being worked on when visual detail matters.
5. Compare directly with `clevercubed/endgoal.png`, working from the top down. Prioritize, in order: section layout, score/box/bonus locations, exact numbers, colors, overlap, then typography and icon details.
6. After edits, reload with a new query/cache-buster on the stylesheet, verify the rendered result—not only the source—and run `git diff --check`.

Do not trust a stale screenshot or the open `file:///` tab. If the browser appears unchanged, confirm the loaded stylesheet URL and bump the `style.css?v=...` query in `clevercubed/index.html`.

## Layout conventions to reuse

- Reuse the `row`, `column`, `surroundingbox`/`area`, `long-track`, `long-boxes`, `points`, `tinypoints`, `pointsnumber`, `bonusbox`, `greaterthan`, `dash`, and `dash-wrapper` idioms from the reference projects.
- A scoring star is a `tinypoints` element with a `pointsnumber` child. It should be in the same `.column` as its main square so the star, square, and bonus share one horizontal center.
- For sections where the target overlaps the elements, put the score marker above the square in the column, use a negative bottom margin, and put the bonus below with the existing absolute `.below`/`.foxbelow` pattern. Keep the marker and square above the bonus with z-index rather than introducing a separate grid.
- Use the negative margins from `twiceasclever`’s `.greaterthan` and `.dash-wrapper` when separators sit between boxes. This prevents separator flex slots from creating oversized gaps.
- Do not add start arrows. The target does not need them.
- Keep the score stars visible against their section background. If a section’s star fill blends into the gradient, add a small contrast change or white drop shadow; preserve the `tinypoints` shape and font.

## Important visual conventions

- Foxes must never be emoji. Use the existing CSS fox treatment: `<div class="points fox"><div class="pointsnumber">0</div></div>`. The fox is a styled points diamond/icon and can change color by section.
- Question-mark/bonus colors must be assigned by class, not by a generic black default:
  - black: `#050505`
  - pink: `#e91e63`
  - yellow: `#f5c820`
  - teal/blue: `#079fa8`
  - purple: `#32227f`
  - brown: `#a8793c`
  - grey: `#aeaeae`
  - green: `#0a0`
- Keep bonus boxes in the existing `bonusbox` style: white border, rounded corners, sans-serif icon/text, and the correct color class.
- Use the existing Marck Script style and text-shadow/stroke conventions for score markers and `-1`/`+1`; do not substitute browser-default text.
- Player-count icons and exact fox artwork can differ from the reference as allowed by `README.md`, but their layout and visual weight should remain similar.

## Target mappings already established

These mappings are the intended contents/locations from `endgoal.png`. Keep them exact when changing layout.

### Yellow area

- Header scores: `2, 6, 12, 20, 30, 42`.
- First bonus row: black reroll, black dice, pink `?`, black `+1`, teal `?`, fox.
- Second bonus row: black dice, teal `?`, purple `?`, brown `?`, yellow `?`, black `+1`.

### Blue area

- Header scores: `1, 3, 6, 10, 15, 21`.
- Right-side bonuses, top to bottom: fox, black `+1`, brown `?`, teal `?`, black `?`.
- Bottom bonuses, left to right: brown `?`, pink `?`, yellow `?`, black dice, purple `?`, black reroll.

### Purple area

- Score stars: `22, 17, 13, 9, 6, 3, 3, 6, 9, 13, 17, 22`.
- The twelve regular main squares are empty white boxes. Place the purple `7` square and circular reroll at the center between the two halves.
- Separators are `-1` before the center and `+1` after the center, styled like the reference `greaterthan`/`dash` constructs and overlapping their neighboring columns.
- Bonuses, left to right across the regular boxes: black `+1`, pink `?`, none, yellow `?`, black dice, none, none, black reroll, brown `?`, none, teal `?`, fox.
- Verify every star, square, and bonus shares the same column center. Do not insert an extra `1,2,3...` label between purple boxes; hide the track index there if necessary.

### Brown area

- Score stars: `2, 5, 9, 14, 20, 27, 35, 44, 54, 65, 77, 90`.
- Main boxes, left to right: `1, 5, 3, 4, 2, 6, 4, 5, 2, 1, 6, 3`.
- Bonuses: black dice under 1; pink `?` under 5; none under 3; black reroll under 4; teal `?` under 2; none under 6; black `+1` under 4; purple `?` under 5; none under 2; yellow `?` under 1; fox under 6; none under 3.
- Brown score stars, boxes, and bonuses should use the same shared-column overlap pattern as purple. Be careful with old nth-child color overrides inherited from copied files; they can silently recolor the wrong bonus after columns move.

### Pink area

- Score markers: `blank, x1, x2, x2, x1, x2, x2, x1, x3, x2, x2, x3`, with the visible track indices `1` through `12`.
- All twelve main boxes contain `½`.
- Bonuses, left to right: black `?`, black reroll, teal/blue `?`, black `+1`, black dice, yellow `?`, brown `?`, black reroll, fox, purple `?`, teal `?`, black `?`.
- Score markers, half-point boxes, and bonuses should share columns and remain fully inside the pink track. Do not add a start arrow.

## DOM/CSS verification checklist

When alignment is uncertain, inspect the rendered rectangles rather than guessing from source order. For each section, verify that each score marker and main square have the same center X, and that each bonus center X matches its main square. Check that bonuses are not clipped by `.area { overflow: hidden; }`; use the section-specific `overflow: visible`/padding pattern only where the target requires it.

Before handing off:

- Refresh the HTTP preview with the latest stylesheet cache-buster.
- Take a fresh full-page screenshot and compare against `endgoal.png`.
- Check the target section’s score values, main-box contents, bonus classes/colors, and left/right alignment.
- Confirm no emoji foxes or unwanted start arrows remain.
- Run `git diff --check` and report only the relevant files changed.
