var selected = null;
var multiplier = 1;
var numFoxes = 0;
var isBeforeUnloadRegistered = false;

// --- Clever Cubed specific state ---
var activeDieColor = '';       // 'yellow', 'turquoise', 'blue', 'brown', 'pink'
var ccSelectMode = '';         // 'field', 'platter-input', 'platter-mark', 'yellow-active', 'yellow-passive'
var activeFieldValue = 0;      // value of die on selected field
var dieFields = [null, null, null]; // {color, value} for fields I, II, III
var platterDice = [];          // array of {color, value} on silver platter
var platterMaxBoxes = 18;      // max boxes on platter grid
var bonusReroll = 0;           // number of used reroll bonuses
var bonusNumChange = 0;        // number of used number change bonuses
var bonusPlusOne = 0;          // number of used +1 bonuses
var bonusChainActive = false;  // for chaining 7 bonuses
var roundCrossed = 0;          // how many rounds crossed (0-6)
var pinkInput = new Array(13).fill(null); // values entered in pink boxes (1-indexed)
var blueLeftTrack = new Array(7).fill(null); // [1]..[6] left of center
var blueRightTrack = new Array(6).fill(null); // [8]..[12] right of center
var brownSkipped = new Array(13).fill(false); // [1]..[12] skipped brown boxes

// --- Sun scoring for Yellow: [crosses] -> points ---
var yellowSunScores = [0, 5, 10, 20, 42]; // 0-6 crosses

// --- Turquoise scoring: crosses per row -> points ---
var turqRowScores = [0, 2, 6, 12, 24, 40, 55, 70, 85, 100, 105];

// --- Blue track scoring ---
// Base score: outermost left + outermost right values
var blueBaseScores = [0, 0, 1, 3, 6, 10, 15, 21, 28, 36, 44, 44, 44]; // sum up to 44
var blueBonusValues = [2, 3, 4, 10, 11, 12]; // extra +4 each

// --- Brown scoring: total crosses -> points ---
var brownScores = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 90];

// ========================================
//  Interaction Functions
// ========================================

function selectDie(color, value) {
  activeDieColor = color;
  activeFieldValue = value;

  // Set up mode based on die color
  if (color === 'turquoise') {
    // Activate combo mode
    ccSelectMode = 'turquoise-combo';
    ccTurquoiseCrossesRemaining = countTurquoiseMatches();
  } else if (color === 'yellow') {
    // Set active mode for row-restricted crossing
    ccSelectMode = 'yellow-active';
  } else if (color === 'brown') {
    ccSelectMode = 'brown';
  } else {
    ccSelectMode = '';
  }

  turnOffModal();
  updateScore();
}

function activeFieldClick(fieldEl) {
  if (!activeDieColor) {
    // No die selected yet — open modal to pick one
    var modal = document.getElementById("mainmodal");
    modal.style.display = "flex";
    selected = fieldEl;
    ccSelectMode = 'field';
    for (var i = 1; i <= 12; i++) {
      var id = "sq" + i;
      var el = document.getElementById(id);
      if (i > 6) {
        el.style.display = "none";
      } else {
        el.innerHTML = i;
        el.style.display = "block";
      }
    }
    return;
  }
  // Die already selected — place it on the field
  var fieldIdx = -1;
  if (fieldEl.id === 'field-I') fieldIdx = 0;
  else if (fieldEl.id === 'field-II') fieldIdx = 1;
  else if (fieldEl.id === 'field-III') fieldIdx = 2;

  if (fieldIdx !== -1 && dieFields[fieldIdx] === null) {
    dieFields[fieldIdx] = { color: activeDieColor, value: activeFieldValue };
    fieldEl.innerHTML = activeFieldValue;
    fieldEl.classList.add('cc-dice-filled');
    fieldEl.style.borderColor = 'white';
    activeDieColor = '';
    activeFieldValue = 0;
    ccSelectMode = '';
    updateScore();
  }
}

function platterClick(platterEl) {
  // Find the clicked box
  var box = platterEl;
  if (box.classList.contains('cc-platter-box')) {
    if (box.classList.contains('strikethrough')) {
      // Already marked - toggle off
      box.classList.remove('strikethrough');
      box.classList.remove('cc-platter-marked');
      box.innerHTML = box.dataset.value || '';
      updateScore();
      return;
    }
  }
  // Empty spot or not a box - open modal
  var modal = document.getElementById("mainmodal");
  modal.style.display = "flex";
  selected = platterEl;
  ccSelectMode = 'platter';
  for (var i = 1; i <= 6; i++) {
    var id = "sq" + i;
    var el = document.getElementById(id);
    el.innerHTML = i;
    el.style.display = "block";
  }
}

function platterMarkClick(boxEl) {
  // Toggle marked/unmarked
  if (boxEl.classList.contains('strikethrough')) {
    boxEl.classList.remove('strikethrough');
    boxEl.classList.remove('cc-platter-marked');
    boxEl.innerHTML = boxEl.dataset.value || '';
  } else {
    boxEl.classList.add('strikethrough');
    boxEl.classList.add('cc-platter-marked');
    boxEl.innerHTML = '✗';
  }
  updateScore();
}

// Track last crossed brown index for left-to-right constraint
var brownLastCrossed = 0;

function strikethrough(element) {
  // Determine what type of element was clicked
  var id = element.id || '';
  var isPink = id.startsWith('pi');
  var isPinkBonus = element.classList.contains('cc-pink-bonus-choice');
  var isTurquoise = element.classList.contains('cc-sq-tc');
  var isYellow = id.match(/^y[0-9]+$/);
  var isBrown = id.match(/^br[0-9]+$/);

  // --- Turquoise combo ---
  if (isTurquoise && ccSelectMode === 'turquoise-combo') {
    if (!element.classList.contains('strikethrough')) {
      element.classList.add('strikethrough');
      ccTurquoiseCrossesRemaining--;
      if (ccTurquoiseCrossesRemaining <= 0) {
        ccSelectMode = '';
      }
    } else {
      // Remove a cross (undo)
      element.classList.remove('strikethrough');
      ccTurquoiseCrossesRemaining++;
    }
    turnOffModal();
    return;
  }

  // --- Yellow with row restriction ---
  if (isYellow) {
    // Check if yellow-active: only cross matching row
    if (ccSelectMode === 'yellow-active') {
      var activeFieldIdx = -1;
      if (activeDieColor === 'yellow') {
        for (var f = 0; f < 3; f++) {
          if (dieFields[f] && dieFields[f].value === activeFieldValue) {
            activeFieldIdx = f;
            break;
          }
        }
      }
      // Determine which row this box is in
      var boxNum = parseInt(id.replace('y', ''));
      var boxRow = Math.ceil(boxNum / 6);
      var activeRow = activeFieldIdx + 1;

      if (boxRow !== activeRow) {
        // Wrong row - flash briefly to indicate error
        element.style.backgroundColor = '#ff0';
        setTimeout(function() { element.style.backgroundColor = 'white'; }, 300);
        return;
      }
    }
    // Passive mode (from platter): only grey boxes allowed
    if (ccSelectMode === 'yellow-passive') {
      if (element.classList.contains('yellow-white')) {
        // White box - not allowed in passive mode
        element.style.backgroundColor = '#ff0';
        setTimeout(function() { element.style.backgroundColor = 'white'; }, 300);
        return;
      }
    }
    // Normal toggle
    element.classList.toggle("strikethrough");

    // Safari hack
    if (!navigator.userAgent.includes("Chrome") && navigator.userAgent.includes("Safari")) {
      element.style.display = 'none';
      element.offsetHeight;
      element.style.display = '';
    }

    // Check yellow bonuses (between-row indicators)
    checkYellowBonuses();
    updateScore();
    return;
  }

  // --- Brown left-to-right constraint ---
  if (isBrown) {
    var boxNum = parseInt(id.replace('br', ''));
    // Skip mechanic: if this box was skipped, it's locked
    if (brownSkipped[boxNum]) return;

    if (!element.classList.contains('strikethrough')) {
      // Only allow crossing if this is >= last crossed (or first box)
      if (boxNum > brownLastCrossed) {
        // Mark any boxes between last crossed and this one as skipped
        for (var s = brownLastCrossed + 1; s < boxNum; s++) {
          brownSkipped[s] = true;
        }
        brownLastCrossed = boxNum;
        element.classList.add("strikethrough");

        if (!navigator.userAgent.includes("Chrome") && navigator.userAgent.includes("Safari")) {
          element.style.display = 'none';
          element.offsetHeight;
          element.style.display = '';
        }

        // Check brown bonuses
        checkBrownBonuses();
        updateScore();
      } else if (boxNum <= brownLastCrossed) {
        // Already passed - allowed to undo or re-cross
        element.classList.toggle("strikethrough");

        if (!navigator.userAgent.includes("Chrome") && navigator.userAgent.includes("Safari")) {
          element.style.display = 'none';
          element.offsetHeight;
          element.style.display = '';
        }
        updateScore();
      }
    } else {
      element.classList.toggle("strikethrough");
      updateScore();
    }
    return;
  }

  // --- Default strikethrough ---
  element.classList.toggle("strikethrough");

  // Safari hack
  if (!navigator.userAgent.includes("Chrome") && navigator.userAgent.includes("Safari")) {
    element.style.display = 'none';
    element.offsetHeight;
    element.style.display = '';
  }
  updateScore();
}

var ccTurquoiseCrossesRemaining = 0;

function blueNumberpicked(value) {
  if (!selected) return;
  var id = selected.id;

  // Validate sequential entry: must fill from center outward
  // Check left track
  if (id.startsWith('blue-l')) {
    var idx = parseInt(id.replace('blue-l', ''));
    // Must have center filled, or right neighbor filled
    var centerFilled = document.getElementById('blue-center').dataset.value !== undefined;
    var rightFilled = false;
    if (idx < 6) {
      var rightEl = document.getElementById('blue-l' + (idx + 1));
      rightFilled = rightEl && rightEl.dataset.value !== undefined;
    }
    if (!centerFilled && !rightFilled) {
      selected.style.backgroundColor = '#f44';
      setTimeout(function() { selected.style.backgroundColor = 'white'; }, 400);
      turnOffModal();
      return;
    }
    blueLeftTrack[idx] = value;
  }

  // Check right track
  if (id.startsWith('blue-r')) {
    var idx2 = parseInt(id.replace('blue-r', ''));
    // Must have center filled, or left neighbor filled
    var centerFilled2 = document.getElementById('blue-center').dataset.value !== undefined;
    var leftFilled2 = false;
    if (idx2 > 8) {
      var leftEl2 = document.getElementById('blue-r' + (idx2 - 1));
      leftFilled2 = leftEl2 && leftEl2.dataset.value !== undefined;
    }
    if (!centerFilled2 && !leftFilled2) {
      selected.style.backgroundColor = '#f44';
      setTimeout(function() { selected.style.backgroundColor = 'white'; }, 400);
      turnOffModal();
      return;
    }
    blueRightTrack[idx2 - 7] = value; // [1]..[5] maps to [8]..[12]
  }

  // Center box: reset all tracks
  if (id === 'blue-center') {
    blueLeftTrack = new Array(7).fill(null);
    blueRightTrack = new Array(6).fill(null);
    var centerEl = document.getElementById('blue-center');
    centerEl.innerHTML = '7';
    delete centerEl.dataset.value;
    var allBoxes = document.querySelectorAll('.cc-blue-box');
    for (var b = 0; b < allBoxes.length; b++) {
      if (allBoxes[b].id !== 'blue-center') {
        allBoxes[b].innerHTML = allBoxes[b].id.replace(/[^0-9]/g, '');
        delete allBoxes[b].dataset.value;
      }
    }
    selected.dataset.value = value;
    selected.innerHTML = value;
    turnOffModal();
    updateScore();
    return;
  }

  selected.dataset.value = value;
  selected.innerHTML = value;
  turnOffModal();
  updateScore();
}

function circle(element) {
  var isCircle = element.classList.contains('circle');
  if (isCircle) {
    var colorProperty = "borderColor";
    if (element.style[colorProperty] == "white" || element.style[colorProperty] == "" || element.style[colorProperty] == null) {
      element.style[colorProperty] = "black";
    } else {
      element.style[colorProperty] = "white";
    }
  }
  updateScore();
}

function bonusAction(el) {
  if (!el.classList.contains('strikethrough')) {
    el.classList.add('strikethrough');
    updateScore();
  }
}

function roundCross(el) {
  if (!el.classList.contains('strikethrough')) {
    el.classList.add('strikethrough');
    roundCrossed++;
    // Round bonuses for 1-4
    if (roundCrossed <= 4) {
      // Trigger designated bonus action
      bonusChainActive = true;
    }
    updateScore();
  }
}

// ========================================
//  Number Picker Modal
// ========================================

function numberpicked(elementFromModal) {
  if (!selected) return;
  var pickedValue = elementFromModal.innerHTML;

  if (pickedValue.length === 0) {
    // Clear box
    if (selected.dataset.originalText) {
      selected.innerHTML = selected.dataset.originalText;
    } else {
      selected.innerHTML = "";
    }
    selected.style.color = "inherit";
    delete selected.dataset.value;
    if (ccSelectMode === 'pink') {
      var pinkIndex = parseInt(selected.id.replace('pi', ''));
      pinkInput[pinkIndex] = null;
    }
  } else {
    var numericValue = parseInt(pickedValue);

    if (ccSelectMode === 'field') {
      selectDie(activeDieColor, numericValue);
      return;
    }

    if (ccSelectMode === 'platter') {
      placeDieFromPlatter(numericValue);
      return;
    }

    if (ccSelectMode === 'pink') {
      pinkNumberpicked(elementFromModal);
      return;
    }

    if (ccSelectMode === 'blue') {
      blueNumberpicked(numericValue);
      return;
    }
  }
  turnOffModal();
}

function placeDieFromPlatter(value) {
  var color = activeDieColor;
  activeDieColor = '';
  activeFieldValue = value;

  // Check if platter has a marked box to cross
  var markedBox = findMarkedPlatterBox();
  if (markedBox) {
    markedBox.classList.add('strikethrough');
    markedBox.classList.remove('cc-platter-marked');
    markedBox.innerHTML = '';
    // Remove from platterDice
    for (var i = 0; i < platterDice.length; i++) {
      if (platterDice[i].el === markedBox) {
        platterDice.splice(i, 1);
        break;
      }
    }
    updatePlatterDisplay();
    updateScore();
    return;
  }

  // Place die on platter (unmarked)
  if (platterDice.length < platterMaxBoxes) {
    var box = document.createElement('div');
    box.className = 'cc-platter-box';
    box.innerHTML = value;
    box.style.position = 'relative';
    platterDice.push({ color: color, value: value, el: box });
    box.dataset.color = color;
    box.dataset.value = value;
    document.getElementById('platter').appendChild(box);

    // Mark as clickable (can be crossed later)
    box.onclick = function() { platterMarkClick(this); };
    updateScore();
  }
}

function findMarkedPlatterBox() {
  var boxes = document.querySelectorAll('#platter .cc-platter-box');
  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].classList.contains('strikethrough')) {
      return boxes[i];
    }
  }
  return null;
}

function platterMarkClick(boxEl) {
  if (boxEl.classList.contains('strikethrough')) return;
  boxEl.classList.add('strikethrough');
  boxEl.classList.add('cc-platter-marked');
  boxEl.innerHTML = '✗';
  updateScore();
}

function updatePlatterDisplay() {
  var platter = document.getElementById('platter');
  platter.innerHTML = '';
  for (var i = 0; i < platterDice.length; i++) {
    var d = platterDice[i];
    var box = document.createElement('div');
    box.className = 'cc-platter-box';
    box.innerHTML = d.value;
    box.dataset.color = d.color;
    box.dataset.value = d.value;
    box.onclick = function() { platterMarkClick(this); };
    platter.appendChild(box);
  }
}

// ========================================
//  Combo Helpers for Turquoise
// ========================================

function countTurquoiseMatches() {
  var count = 1; // the turquoise die itself
  // Check active fields
  for (var i = 0; i < 3; i++) {
    if (dieFields[i] && dieFields[i].color === activeDieColor && dieFields[i].value === activeFieldValue) {
      count++;
    }
  }
  // Check platter
  for (var i = 0; i < platterDice.length; i++) {
    if (platterDice[i].color === activeDieColor && platterDice[i].value === activeFieldValue) {
      count++;
    }
  }
  return Math.min(count, 6); // max 6 matches
}

function crossTurquoiseBoxes(numCrosses) {
  // Find all non-struck turquoise boxes
  var boxes = document.querySelectorAll('.cc-sq-tc:not(.strikethrough)');
  var crossed = 0;
  for (var i = 0; i < boxes.length && crossed < numCrosses; i++) {
    boxes[i].classList.add('strikethrough');
    crossed++;
  }
}

// ========================================
//  Score Calculation Functions
// ========================================

function calcYellow() {
  var total = 0;
  var crossesPerRow = [0, 0, 0]; // Row I, II, III

  // Count crosses per row
  for (var row = 1; row <= 3; row++) {
    for (var col = 1; col <= 6; col++) {
      var id = "y" + ((row - 1) * 6 + col);
      var el = document.getElementById(id);
      if (el && el.classList.contains('strikethrough')) {
        crossesPerRow[row - 1]++;
      }
    }
    // Sun scoring for this row
    var crosses = crossesPerRow[row - 1];
    total += yellowSunScores[Math.min(crosses, 6)] || 0;
  }

  document.getElementById("cc-yellow-score").innerHTML = total.toString();
  return total;
}

function calcTurquoise() {
  var total = 0;
  var crossesPerRow = [0, 0, 0, 0, 0];

  for (var row = 1; row <= 5; row++) {
    var boxes = document.querySelectorAll('#turq-row-' + row + ' .cc-sq-tc');
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].classList.contains('strikethrough')) {
        crossesPerRow[row - 1]++;
      }
    }
    var crosses = crossesPerRow[row - 1];
    total += turqRowScores[Math.min(crosses, 6)] || 0;
  }

  document.getElementById("cc-turquoise-score").innerHTML = total.toString();
  return total;
}

function calcBlue() {
  var total = 0;
  var bonusCount = 0;

  // Find outermost filled on left track (1-6)
  var leftOuter = null;
  for (var i = 1; i <= 6; i++) {
    if (blueLeftTrack[i] !== null) {
      leftOuter = blueLeftTrack[i];
    }
  }

  // Find outermost filled on right track (8-12)
  var rightOuter = null;
  for (var i = 0; i < 5; i++) {
    if (blueRightTrack[i] !== null) {
      rightOuter = blueRightTrack[i] + 7;
    }
  }

  // Also count center box
  var centerEl = document.getElementById('blue-center');
  var centerVal = centerEl && centerEl.dataset.value ? parseInt(centerEl.dataset.value) : null;

  // Base score from outermost boxes
  if (leftOuter !== null) {
    total += leftOuter;
    if (blueBonusValues.indexOf(leftOuter) !== -1) bonusCount++;
  }
  if (centerVal !== null) {
    total += centerVal;
    if (blueBonusValues.indexOf(centerVal) !== -1) bonusCount++;
  }
  if (rightOuter !== null) {
    total += rightOuter;
    if (blueBonusValues.indexOf(rightOuter) !== -1) bonusCount++;
  }

  // Bonus +4 for each 2,3,4,10,11,12 anywhere on the track
  for (var i = 0; i < 6; i++) {
    if (blueLeftTrack[i + 1] !== null && blueBonusValues.indexOf(blueLeftTrack[i + 1]) !== -1) bonusCount++;
  }
  for (var i = 0; i < 5; i++) {
    var rv = blueRightTrack[i] + 7;
    if (rv !== null && blueBonusValues.indexOf(rv) !== -1) bonusCount++;
  }
  if (centerVal !== null && blueBonusValues.indexOf(centerVal) !== -1) {
    // Already counted above, skip
  }

  total += bonusCount * 4;

  document.getElementById("cc-blue-score").innerHTML = total.toString();
  return total;
}

function calcBrown() {
  var total = 0;
  var crosses = 0;

  var boxes = document.querySelectorAll('#brown-row .cc-sq-bc');
  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].classList.contains('strikethrough')) {
      crosses++;
    }
  }

  total = brownScores[Math.min(crosses, 12)] || 0;

  document.getElementById("cc-brown-score").innerHTML = total.toString();
  return total;
}

function calcPink() {
  var total = 0;

  for (var i = 1; i <= 12; i++) {
    if (pinkInput[i] !== null) {
      total += pinkInput[i];
    }
  }

  document.getElementById("cc-pink-score").innerHTML = total.toString();
  return total;
}

function updateScore() {
  if (!isBeforeUnloadRegistered) {
    window.addEventListener('beforeunload', function (event) {
      event.preventDefault();
      event.returnValue = '';
    });
    isBeforeUnloadRegistered = true;
  }

  numFoxes = 0;

  var yellow = calcYellow();
  var turquoise = calcTurquoise();
  var blue = calcBlue();
  var brown = calcBrown();
  var pink = calcPink();

  // Fox multiplier: lowest area score × numFoxes
  var foxValue = Math.min(yellow, turquoise, blue, brown, pink);
  // Count foxes unlocked via bonus indicators
  var foxElements = document.querySelectorAll('.cc-yellowfox');
  for (var i = 0; i < foxElements.length; i++) {
    if (foxElements[i].classList.contains('strikethrough')) {
      numFoxes++;
    }
  }

  document.getElementById("cc-foxmultiplier").innerHTML = numFoxes.toString() + "x";

  var totalScore = yellow + turquoise + blue + brown + pink + (numFoxes * foxValue);
  document.getElementById("cc-totalScore").innerHTML = totalScore.toString();
}

// ========================================
//  Pink Box Click Handler
// ========================================

function pinkBoxClick(el) {
  if (el.dataset.value !== undefined) return; // Already filled

  selected = el;
  selectedPinkBox = el;
  ccSelectMode = 'pink';

  // Store original state
  if (!selected.dataset.originalText) {
    selected.dataset.originalText = selected.innerHTML || '';
  }

  var modal = document.getElementById("mainmodal");
  modal.style.display = "flex";

  // Get multiplier from data attribute
  var multEl = el.parentElement.querySelector('.cc-pink-multiplier');
  var multVal = multEl ? parseInt(multEl.dataset.mult) : 2;

  // Show die values 1-6 with both options (÷2↑ and ×N)
  // Top 3 rows: ÷2↑ option, Bottom 3 rows: ×N option
  for (var i = 1; i <= 6; i++) {
    var id = "sq" + i;
    var box = document.getElementById(id);
    var halved = Math.ceil(i / 2);
    var multResult = i * multVal;
    var displayText = i + '→' + halved;

    if (i <= 3) {
      // Top rows: show halved option
      displayText = i + '→' + halved;
    } else {
      // Bottom rows: show multiplier option
      displayText = i + '→' + multResult;
    }
    box.innerHTML = displayText;
    box.style.fontSize = '1.1rem';
    box.style.display = "block";
    box.style.whiteSpace = "nowrap";
  }
}

function pinkNumberpicked(elementFromModal) {
  if (!selected) return;
  var pickedText = elementFromModal.innerHTML;

  if (pickedText.length === 0) {
    if (selected.dataset.originalText) {
      selected.innerHTML = selected.dataset.originalText;
    } else {
      selected.innerHTML = '';
    }
    selected.style.color = 'inherit';
    delete selected.dataset.value;
    var pinkIdx = parseInt(selected.id.replace('pi', ''));
    pinkInput[pinkIdx] = null;
    turnOffModal();
    return;
  }

  // Format: "N→X" - the N is the die value, X is the chosen result
  var parts = pickedText.split('→');
  var rawDie = parseInt(parts[0]);
  var chosenResult = parseInt(parts[1]);

  // Store value
  var pinkIdx = parseInt(selected.id.replace('pi', ''));
  pinkInput[pinkIdx] = chosenResult;
  selected.innerHTML = chosenResult;
  selected.dataset.value = chosenResult;
  selected.style.color = 'black';

  turnOffModal();
}

// ========================================
//  Blue Box Click Handler
// ========================================

function blueBoxClick(el) {
  if (el.dataset.value !== undefined) return; // Already filled

  selected = el;
  ccSelectMode = 'blue';

  var modal = document.getElementById("mainmodal");
  modal.style.display = "flex";

  // Show sum values for blue+white die (2-12)
  for (var i = 2; i <= 12; i++) {
    var id = "sq" + i;
    var box = document.getElementById(id);
    box.innerHTML = i;
    box.style.fontSize = '1.4rem';
    box.style.display = "block";
  }
  // Hide unused boxes
  for (var j = 1; j <= 1; j++) {
    var unusedId = "sq" + j;
    var unusedBox = document.getElementById(unusedId);
    if (unusedBox) unusedBox.style.display = 'none';
  }
  for (var k = 13; k <= 12; k++) {
    var unusedId2 = "sq" + k;
    var unusedBox2 = document.getElementById(unusedId2);
    if (unusedBox2) unusedBox2.style.display = 'none';
  }
}

// ========================================
//  Modal & Helper Functions
// ========================================

function turnOffModal() {
  document.getElementById("mainmodal").style.display = "none";
  updateScore();
}

// ========================================
//  Bonus Checking
// ========================================

function checkYellowBonuses() {
  // Check bonuses between Row I and Row II
  checkYellowBonusRow(1);
  // Check bonuses between Row II and Row III
  checkYellowBonusRow(2);
}

function checkYellowBonusRow(rowIndex) {
  var bonusRow = document.getElementById('yellow-bonus-row-' + rowIndex);
  if (!bonusRow) return;

  var indicators = bonusRow.querySelectorAll('.cc-ybonus-indicator');
  for (var i = 0; i < indicators.length; i++) {
    var aboveId = indicators[i].dataset.above;
    var belowId = indicators[i].dataset.below;
    var aboveEl = document.getElementById(aboveId);
    var belowEl = document.getElementById(belowId);
    var bonusEl = indicators[i].querySelector('.cc-yellowfox, .cc-qmark-box');

    if (!bonusEl || bonusEl.classList.contains('strikethrough')) continue;

    if (aboveEl && belowEl &&
        aboveEl.classList.contains('strikethrough') &&
        belowEl.classList.contains('strikethrough')) {
      // Unlock bonus
      bonusEl.classList.add('strikethrough');
      if (bonusEl.classList.contains('cc-yellowfox')) {
        numFoxes++;
      }
    }
  }
}

function checkBrownBonuses() {
  var indicators = document.querySelectorAll('#brown-row .cc-brown-bonus');
  for (var i = 0; i < indicators.length; i++) {
    var leftId = indicators[i].dataset.left;
    var rightId = indicators[i].dataset.right;
    var leftEl = document.getElementById(leftId);
    var rightEl = document.getElementById(rightId);
    var bonusEl = indicators[i].querySelector('.cc-qmark-box, .cc-yellowfox');

    if (!bonusEl || bonusEl.classList.contains('strikethrough')) continue;

    if (leftEl && rightEl &&
        leftEl.classList.contains('strikethrough') &&
        rightEl.classList.contains('strikethrough')) {
      bonusEl.classList.add('strikethrough');
      if (bonusEl.classList.contains('cc-yellowfox')) {
        numFoxes++;
      }
    }
  }
}

window.onclick = function(event) {
  var modal = document.getElementById("mainmodal");
  if (event.target == modal) {
    turnOffModal();
  }
}
