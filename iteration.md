# Iteration

1. From the repository root, start a local static web server if one is not already running:
   `python -m http.server 8765 --bind 127.0.0.1`
2. In the Codex in-app browser, open:
   `http://127.0.0.1:8765/clevercubed/index.html`
   Use the local HTTP URL rather than a `file:///` URL so the page and its relative assets load correctly.
3. Confirm the browser is showing the rendered **Clever Cubed** page, with the title `Clever Cubed`, rather than an error page or the reference image itself.
4. Use the in-app browser screenshot action to capture the full page, including content below the viewport.
5. Compare the screenshot with `clevercubed/endgoal.png`.
6. Working from the top down, make a small set of edits to `clevercubed/index.html`, `clevercubed/style.css`, or `clevercubed/app.js` so the page more closely matches the reference.
7. A perfect pixel-by-pixel match is not required. Prioritize the layout, numbers, colors, and box locations.
8. Player-count icons and fox icons may look different in this version; that is acceptable. For implementation patterns and styling, prefer the existing conventions in `twiceasclever/` and `thatsprettyclever/`.
9. Reload the page, take a fresh full-page screenshot, and repeat the comparison after each small set of edits.
