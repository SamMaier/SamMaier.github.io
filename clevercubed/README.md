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

## Scoring

**Yellow Score Area:** Count the number of crosses in each of the three rows individually. Find the point value corresponding to the total crosses for each row using the printed sun legend (1 -> 2, 2 -> 6, 3 -> 12, 4 -> 20, 5 -> 30, 6 -> 42) and sum the scores for all three rows.

**Turquoise Score Area:** Count the total number of crosses in each of the five rows. Find the point value for the number of crosses in each row (1 -> 1, 2 -> 3, 3 -> 6, 4 -> 10, 5 -> 15, 6 -> 21) and add them together.

**Blue Score Area:** Identify the outermost number filled in to the left of the central 7, find its printed score value above it, and add that to the score value of the outermost number filled in to the right. Both of these go (starting from the middle) 3, 6, 9, 13, 17, 22. Add an extra 4 bonus points for every written 2, 3, 4, 10, 11, and 12.

**Brown Score Area:** Count the total number of crosses placed across the entire row and convert the total count to its corresponding point value shown on the score sheet (1 -> 2, 2 -> 5, 3 -> 9, 4 -> 14, 5 -> 20, 6 -> 27, 7 -> 35, 8 -> 44, 9 -> 54, 10 -> 65, 11 -> 77, 12 -> 90).

**Pink Score Area:** Sum all the individual numbers written into the pink boxes.

**Fox Bonuses:** Identify the lowest score among your five colored areas. Multiply that lowest score by the total number of unlocked fox symbols, then add this total to your final score as bonus points. This should be identical to the previous version and should require very little change.
