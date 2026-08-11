# Clever Cubed: Score Sheet Implementation Guide

This is a pure, 3 file website with no external dependencies. Just an index.html, style.css, and app.js.

You should reference twiceasclever/ and thatsprettyclever/ for as much as you can. You should use the same idioms, the same css and html blocks, the same javascript style. Keep the layout and constraints the same (eg. same dimensions).

The goal is to create a visual near-copy of the Clever Cubed scorecard. There are some things which will look very different (eg. the foxes are now just score icons that change color, some of the icons are swapped by emoji) and some of the meaningless iconography can go away.

The main things you will have to change are

1. Colors - all colors should match almost exactly to the endgoal
2. Numbers - all numbers should match exactly to the endgoal, including which box is which
3. Bonus boxes and score boxes - they should stay in the same style as twiceasclever/, but be placed in the locations based on endgoal
4. Alignment - make the boxes align in the correct ways according to endgoal

Do not worry about the javascript yet.
