# Clever Cubed: Score Sheet Implementation Guide

This document provides a comprehensive technical breakdown of the **Clever Cubed** score sheet layout, section rules, and mechanics required to implement a digital, web-based scoring application.

---

## 1. Scoring Page Layout Overview

The digital score sheet interface must be structured into several interconnected interactive zones:

* 
**Round Tracker (Top Banner):** Tracks game progression based on player count. It dictates the duration of the game: 4 rounds for 4 players , 5 rounds for 3 players , and 6 rounds for 2 players or solo play. At the start of rounds 1 through 4, crossing out the round number immediately triggers a designated bonus action. Rounds 5 and 6 provide no starting bonus.

* 
**Active Dice Fields (Top Left):** Consists of three sequential slots marked **I**, **II**, and **III**. When the active player selects a die, it is placed unchanged onto the topmost free slot.

* 
**Silver Platter (Secondary Area):** A shared zone representing the game box platter. Any dice rolled by the active player with a value *lower* than the selected die are automatically moved here. At the end of the active player's third turn, all remaining unselected dice are moved here (guaranteeing a minimum of three dice for passive players).

* 
**Bonus Action Tracker (Top Grey Area):** A persistent status bar tracking unlocked and spent player resources. It contains three distinct functional rows:

1. 
**Row 1: Reroll Bonuses** — Allows the active player to reroll all just-rolled dice.

2. 
**Row 2: Number Change Bonuses** — Allows a player to treat a die as any number from 1–6 (represented by a question mark).

3. 
**Row 3: +1 Dice Bonuses** — Allows a player to select an extra die from the active fields or silver platter at the end of a turn.

* 
*UI Mechanic:* Unlocked bonuses must be circled from left to right without spaces. Chaining 7 bonuses in a row unlocks a secondary bonus shown to the right. Spent bonuses are crossed out.

* 
**Main Scoring Grid (Body):** Contains 5 colored scoring areas tied directly to their respective dice types. Yellow, Turquoise, and Brown areas utilize a cross-out selection mechanic. Blue and Pink areas require user number input. Once filled, these inputs can never be altered.

---

## 2. Colored Scoring Sections

### Yellow Score Area

* **Layout & Box Locations:**
* Consists of a grid divided into three separate rows: Row I, Row II, and Row III.

* Each row contains a mix of white and grey numbered boxes.

* Bonus icons are placed between rows, vertically connecting specific boxes from the row above and below.

* **Scoring Rules:**
* Scored per row individually.

* Points are calculated using the sun icons displayed in the UI: the black number inside the sun is the point value, and the white number at the bottom-left of the sun indicates the required number of crosses.

* 
*Example:* 4 crosses in a single row yields 20 points.

* Maximum score is 42 points per row, totaling a maximum of 126 points.


* **Placement & Interaction Rules:**
* 
**Active Crossing:** If the yellow die is placed on Dice Field I, the player can only cross a matching number in Row I. If placed on Field II, it applies only to Row II. If placed on Field III, it applies only to Row III. Box color (white or grey) does not matter for active selection.

* 
**Passive Crossing:** When selecting a yellow die from the silver platter, the player **must only cross a grey field**. However, passive selection completely lifts the Row I, II, or III restriction.

* 
**Modifier Interactions:** Utilizing a Number Change bonus or a +1 bonus does *not* lift the active row restrictions. For passive platter play, a Number Change bonus simply allows the selection of any valid grey box matching the modified number.


* **Bonus Activation:**
* A connected bonus is immediately unlocked when both the field directly above it and the field directly below it are crossed out.


* 
*Example:* The Fox bonus is unlocked when the grey 6 in Row I and the white 6 in Row II are both crossed.

* Unlocking a "Yellow Question Mark" bonus allows the player to immediately cross out *any* field in the Yellow grid.


### Turquoise Score Area

* **Layout & Box Locations:**
* Composed of a grid featuring 5 horizontal rows and multiple vertical columns.


* The grid contains a combination of turquoise-colored fields and white fields.


* **Scoring Rules:**
* Crosses are counted individually for each of the 5 horizontal rows.

* 
*Example:* 3 crosses within a single row yields 6 points.

* White fields inside the grid count strictly toward row scoring totals and do not trigger bonuses.

* The absolute maximum score for this section is 105 points.

* **Placement & Interaction Rules:**
* 
**Active Crossing:** The player selects the turquoise die and crosses out a field displaying that exact number.


* 
*Combo Mechanic:* A player can cross out **multiple fields simultaneously** if the chosen turquoise die's face value matches the face value of dice already sitting on their active dice fields (I, II, or III). A total of two matching numbers (the turquoise die + 1 active field die) allows 2 crosses. Three matching numbers allows 3 crosses.


* 
*Example:* If Active Field I holds a yellow 3, Active Field II holds a brown 5, and the player places a turquoise 3 onto Field III, they can cross out two different '3' fields in the grid. If the brown die was also a 3, they could cross three fields at once.


* 
**Passive Crossing:** Works similarly, but the combo mechanics are dictated entirely by matching numbers present **on the silver platter**. Dice currently sitting on the active player's dice fields are ignored during passive selection.


* 
**Modifier Interactions:** Number Change bonuses and +1 bonuses successfully inherit and trigger these multi-cross combo mechanics if the resulting numbers match the respective active field or platter sets.


* **Bonus Activation:**
* A printed bonus is awarded immediately when **all turquoise-colored fields** within a respective row or column are completely filled. White fields are omitted from bonus checks.

* Unlocking a "Turquoise Question Mark" bonus allows the player to cross out exactly *one* single field in this grid; it cannot trigger multi-cross combos.


### Blue Score Area

* **Layout & Box Locations:**
* Designed as a linear horizontal track branching symmetrically in two directions out from a central starting box pre-printed with the number **7**.

* Boxes extending to the left are bound by a **-1** modifier. Boxes extending to the right are bound by a **+1** modifier.

* **Scoring Rules:**
* The primary score is calculated by identifying the value printed *above* the outermost filled box on the left, and adding it to the value printed *above* the outermost filled box on the right. This component maxes out at 44 points.


* Additionally, every single instance where a player has written a **2, 3, 4, 10, 11, or 12** anywhere on the track awards an additional flat +4 points.


* The maximum combined score for the Blue area is 68 points.


* **Placement & Interaction Rules:**
* 
**Core Sum Mechanic:** To input a number, the player **must always add the face value of the Blue die and the White die together**, regardless of where either die is currently positioned or which one was chosen.

* Numbers must be logged sequentially outward from the center; leaving blank spacer boxes is strictly prohibited.

* 
**Left Track Rule:** The sum must be exactly **1 smaller (-1)** than the number written in the box immediately to its right.

* 
**Right Track Rule:** The sum must be exactly **1 bigger (+1)** than the number written in the box immediately to its left.

* 
**Sequence Reset:** A player may intentionally choose to write a **7** in an active box to reset the sequence. According to physical rules, two 7s cannot stand directly adjacent to one another. Once a 7 is placed, the next sequential box must strictly follow the standard ±1 rules relative to 7 (meaning it must be a 6 or an 8).


* **Bonus Activation:**
* The bonus icon printed underneath the track is instantly awarded the moment the box directly above it is filled with a number.

* 
**Modifier Restrictions:** If using a Number Change bonus, the modification applies only to a single chosen die and its value must remain between 1 and 6. Similarly, the "Blue Question Mark" bonus is restricted to a value between 1 and 6, meaning the white die must still be rolled/added to it to form a final track entry.


### Brown Score Area

* **Layout & Box Locations:**
* Consists of a single horizontal row of numbers stretching from left to right.
* Bonus items are physically placed in the spaces between individual number boxes.


* **Scoring Rules:**
* Scoring scales purely based on the total number of crosses placed across the entire row.

* Achieving a fully completed row of 12 crosses awards exactly 90 points.


* **Placement & Interaction Rules:**
* 
**Active & Passive Crossing:** The player selects a die matching a number on the row and crosses it out.

* 
**Left-to-Right Constraint:** Crosses must strictly be entered from left to right as indicated by the track's orientation arrow.

* 
*Skipping Mechanic:* Players are allowed to skip over numbers to cross a matching box further down the line. However, **any skipped fields become permanently locked and inaccessible** for the remainder of the game.

* Number Change and +1 bonuses interact natively with this section without extra constraints.


* **Bonus Activation:**
* A brown track bonus is unlocked immediately when **both fields directly to its left and directly to its right** have been successfully crossed out.

* Unlocking a "Brown Question Mark" bonus allows a player to cross out any single valid box residing safely to the right of their last placed cross.


### Pink Score Area

* **Layout & Box Locations:**
* Consists of a single horizontal row of empty text boxes that must be filled with numbers sequentially.
* Specific boxes feature structural bonus icons printed directly beneath them.


* **Scoring Rules:**
* The final score of the Pink area is the calculated **mathematical sum of all numbers written into the fields**.


* **Placement & Interaction Rules:**
* 
**Strict Order:** Players must fill the boxes in precise order from left to right. Skipping fields is entirely prohibited.


* **The Bonus vs. Multiplier Dilemma:**
1. 
**Claiming the Bonus:** For the very first box on the track, and any subsequent box featuring a bonus icon underneath, the player can choose to claim the bonus. To do so, they must **take the chosen die's face value, divide it by two, and round up to the nearest whole number** (e.g., a die value of 5 becomes 3). Write this halved value into the box to claim the bonus.


2. 
**Forfeiting the Bonus:** Alternatively, the player can choose to completely forfeit the printed bonus action. In this case, they **multiply the raw face value of the die by the numerical multiplier shown inside that box** (e.g., $\times2$ or $\times3$) and write the full multiplied product into the box. No division occurs.

* Boxes without printed bonuses simply receive the raw face value of the chosen die.
* Number Change and +1 bonuses work normally here. The "Pink Question Mark" bonus acts as a single die input up to a maximum value of 6.

---

## 3. Global Game Mechanics for Logic Engine

### End Game Scoring (The Fox Multiplier)

When the final round concludes and all remaining +1 bonuses are spent, the application must execute the final scoring routine:

1. Sum the individual point totals for each of the 5 colored sections.
2. Identify the **lowest scoring colored area** among the five.
3. Count the total number of **Fox items** unlocked across all grids during the game.
4. Multiply the total number of foxes by the score of that lowest area.

* 
*Example:* If a player unlocks 3 Foxes, and their lowest scoring color section finished with 15 points, they are awarded an extra +45 bonus points ($3 \times 15$) to their grand total.


### Special Black Question Mark

Unlocking the unique black question mark bonus at the start of Round 4 acts as a universal wild card. It can substitute for any colored question mark bonus, but **must be used immediately** the moment it is unlocked.
