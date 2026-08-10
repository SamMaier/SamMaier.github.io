var selected = null;
var multiplier = 1;
var numFoxes = 0;
var isBeforeUnloadRegistered = false;

// --- Clever Cubed specific state ---
var activeDieColor = '';       // 'yellow', 'turquoise', 'blue', 'brown', 'pink'
var ccSelectMode = '';         // 'field', 'platter-input', 'yellow-active', 'yellow-passive'
var activeFieldValue = 0;      // value of die on selected field
var dieFields = [null, null, null]; // {color, value} for fields I, II, III
var platterDice = [];          // array of {color, value} on silver platter
var platterMaxBoxes = 18;      // max boxes on platter grid
var bonusChainActive = false;  // for chaining 7 bonuses
var roundCrossed = 0;          // how many rounds crossed (0-6)
var pinkInput = new Array(13).fill(null); // values entered in pink boxes (1-indexed)
var blueLeftTrack = new Array(7).fill(null); // [1]..[6] left of center
var blueRightTrack = new Array(6).fill(null); // [8]..[12] right of center
var brownSkipped = new Array(13).fill(false); // [1]..[12] skipped brown boxes

// --- Sun scoring for Yellow: [crosses] -> points per row ---
var yellowSunScores = [0, 5, 10, 20, 42]; // 0-6 crosses

// --- Turquoise scoring: crosses per row -> points ---
var turqRowScores = [0, 2, 6, 12, 24, 40, 55, 70, 85, 100, 105];

// --- Blue track scoring ---
var blueBonusValues = [2, 3, 4, 10, 11, 12]; // extra +4 each

// --- Brown scoring: total crosses -> points ---
var brownScores = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 90];

// Track last crossed brown index for left-to-right constraint
var brownLastCrossed = 0;

// Turquoise combo state
var ccTurquoiseCrossesRemaining = 0;

// ========================================
//  Interaction Functions
// ========================================

function selectDie(color, value) {
  activeDieColor = color;
  activeFieldValue = value;

  // Set up mode based on die color
  if (color === 'turquoise') {
    ccSelectMode = 'turquoise-combo';
    ccTurquoiseCrossesRemaining = countTurquoiseMatches();
  } else if (color === 'yellow') {
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
  var box = platterEl;
  if (box.classList.contains('cc-platter-box')) {
    if (box.classList.contains('strikethrough')) {
      box.classList.remove('strikethrough');
      box.classList.remove('cc-platter-marked');
      box.innerHTML = box.dataset.value || '';
      updateScore();
      return;
    }
  }
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
  if (boxEl.classList.contains('strikethrough')) return;
  boxEl.classList.add('strikethrough');
  boxEl.classList.add('cc-platter-marked');
  boxEl.innerHTML = '✗';
  updateScore();
}

// ========================================
//  Strikethrough handlers
// ========================================

function strikethrough(element) {
  var id = element.id || '';

  // --- Turquoise combo ---
  if (element.classList.contains('cc-sq-tc') && ccSelectMode === 'turquoise-combo') {
    if (!element.classList.contains('strikethrough')) {
      element.classList.add('strikethrough');
      ccTurquoiseCrossesRemaining--;
      if (ccTurquoiseCrossesRemaining <= 0) {
        ccSelectMode = '';
      }
    } else {
      element.classList.remove('strikethrough');
      ccTurquoiseCrossesRemaining++;
    }
    turnOffModal();
    return;
  }

  // --- Yellow with row restriction ---
  if (id.match(/^y[0-9]+$/) && !element.classList.contains('cc-sq-bc')) {
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
      var boxNum = parseInt(id.replace('y', ''));
      var boxRow = Math.ceil(boxNum / 6);
      var activeRow = activeFieldIdx + 1;

      if (boxRow !== activeRow) {
        element.style.backgroundColor = '#ff0';
        setTimeout(function() { element.style.backgroundColor = 'white'; }, 300);
        return;
      }
    }
    // Passive mode: only grey boxes allowed
    if (ccSelectMode === 'yellow-passive') {
      if (element.classList.contains('yellow-white')) {
        element.style.backgroundColor = '#ff0';
        setTimeout(function() { element.style.backgroundColor = 'white'; }, 300);
        return;
      }
    }
    // Normal toggle
    element.classList.toggle("strikethrough");

    if (!navigator.userAgent.includes("Chrome") && navigator.userAgent.includes("Safari")) {
      element.style.display = 'none';
      element.offsetHeight;
      element.style.display = '';
    }

    checkYellowBonuses();
    updateScore();
    return;
  }

  // --- Brown left-to-right constraint ---
  if (id.match(/^br[0-9]+$/)) {
    var boxNum = parseInt(id.replace('br', ''));
    if (brownSkipped[boxNum]) return;

    if (!element.classList.contains('strikethrough')) {
      if (boxNum > brownLastCrossed) {
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

        checkBrownBonuses();
        updateScore();
      } else if (boxNum <= brownLastCrossed) {
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

  if (!navigator.userAgent.includes("Chrome") && navigator.userAgent.includes("Safari")) {
    element.style.display = 'none';
    element.offsetHeight;
    element.style.display = '';
  }
  updateScore();
}

// ========================================
//  Blue track handlers
// ========================================

function blueBoxClick(el) {
  if (el.dataset.value !== undefined) return;

  selected = el;
  ccSelectMode = 'blue';

  var modal = document.getElementById("mainmodal");
  modal.style.display = "flex";

  for (var i = 2; i <= 12; i++) {
    var id = "sq" + i;
    var box = document.getElementById(id);
    box.innerHTML = i;
    box.style.fontSize = '1.4rem';
    box.style.display = "block";
  }
  var unusedBox = document.getElementById("sq1");
  if (unusedBox) unusedBox.style.display = 'none';
}

function blueNumberpicked(value) {
  if (!selected) return;
  var id = selected.id;

  if (id.startsWith('blue-l')) {
    var idx = parseInt(id.replace('blue-l', ''));
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

  if (id.startsWith('blue-r')) {
    var idx2 = parseInt(id.replace('blue-r', ''));
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
    blueRightTrack[idx2 - 7] = value;
  }

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

// ========================================
//  Pink box handlers
// ========================================

function pinkBoxClick(el) {
  if (el.dataset.value !== undefined) return;

  selected = el;
  ccSelectMode = 'pink';

  if (!selected.dataset.originalText) {
    selected.dataset.originalText = selected.innerHTML || '';
  }

  var modal = document.getElementById("mainmodal");
  modal.style.display = "flex";

  var multEl = el.parentElement.querySelector('.cc-pink-multiplier');
  var multVal = multEl ? parseInt(multEl.dataset.mult) : 2;

  for (var i = 1; i <= 6; i++) {
    var id = "sq" + i;
    var box = document.getElementById(id);
    var halved = Math.ceil(i / 2);
    var multResult = i * multVal;

    if (i <= 3) {
      box.innerHTML = i + '→' + halved;
    } else {
      box.innerHTML = i + '→' + multResult;
    }
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
    var pinkIdx = parseInt(selected.id.replace('p', ''));
    pinkInput[pinkIdx] = null;
    turnOffModal();
    return;
  }

  var parts = pickedText.split('→');
  var rawDie = parseInt(parts[0]);
  var chosenResult = parseInt(parts[1]);

  var pinkIdx = parseInt(selected.id.replace('p', ''));
  pinkInput[pinkIdx] = chosenResult;
  selected.innerHTML = chosenResult;
  selected.dataset.value = chosenResult;
  selected.style.color = 'black';

  turnOffModal();
}

// ========================================
//  Number Picker Modal
// ========================================

function numberpicked(elementFromModal) {
  if (!selected) return;
  var pickedValue = elementFromModal.innerHTML;

  if (pickedValue.length === 0) {
    if (selected.dataset.originalText) {
      selected.innerHTML = selected.dataset.originalText;
    } else {
      selected.innerHTML = "";
    }
    selected.style.color = "inherit";
    delete selected.dataset.value;
    if (ccSelectMode === 'pink') {
      var pinkIndex = parseInt(selected.id.replace('p', ''));
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

  if (platterDice.length < platterMaxBoxes) {
    var box = document.createElement('div');
    box.className = 'cc-platter-box';
    box.innerHTML = value;
    box.style.position = 'relative';
    platterDice.push({ color: color, value: value, el: box });
    box.dataset.color = color;
    box.dataset.value = value;
    document.getElementById('platter').appendChild(box);
    box.onclick = function() { platterMarkClick(this); };
    updateScore();
  }
}

// ========================================
//  Circle handler
// ========================================

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

// ========================================
//  Bonus Action handler
// ========================================

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
    if (roundCrossed <= 4) {
      bonusChainActive = true;
    }
    updateScore();
  }
}

// ========================================
//  Combo Helpers for Turquoise
// ========================================

function countTurquoiseMatches() {
  var count = 1;
  for (var i = 0; i < 3; i++) {
    if (dieFields[i] && dieFields[i].color === activeDieColor && dieFields[i].value === activeFieldValue) {
      count++;
    }
  }
  for (var i = 0; i < platterDice.length; i++) {
    if (platterDice[i].color === activeDieColor && platterDice[i].value === activeFieldValue) {
      count++;
    }
  }
  return Math.min(count, 6);
}

// ========================================
//  Score Calculation Functions
// ========================================

function calcYellow() {
  var total = 0;
  var crossesPerRow = [0, 0, 0]; // Row I (y1-y6), Row II (y7-y12), Row III (y13-y18)

  for (var row = 1; row <= 3; row++) {
    for (var col = 1; col <= 6; col++) {
      var boxNum = (row - 1) * 6 + col;
      var id = "y" + boxNum;
      var el = document.getElementById(id);
      if (el && el.classList.contains('strikethrough')) {
        crossesPerRow[row - 1]++;
      }
    }
    var crosses = crossesPerRow[row - 1];
    total += yellowSunScores[Math.min(crosses, 6)] || 0;
  }

  // Update individual row scores
  var rowTotal = 0;
  for (var row = 1; row <= 3; row++) {
    var crosses = crossesPerRow[row - 1];
    rowTotal += yellowSunScores[Math.min(crosses, 6)] || 0;
  }
  document.getElementById("cc-yellow-total").innerHTML = rowTotal.toString();
  document.getElementById("cc-yellow-score").innerHTML = rowTotal.toString();

  return rowTotal;
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

  document.getElementById("cc-turquoise-total").innerHTML = total.toString();
  document.getElementById("cc-turquoise-score").innerHTML = total.toString();
  return total;
}

function calcBlue() {
  var total = 0;
  var bonusCount = 0;

  var leftOuter = null;
  for (var i = 1; i <= 6; i++) {
    if (blueLeftTrack[i] !== null) {
      leftOuter = blueLeftTrack[i];
    }
  }

  var rightOuter = null;
  for (var i = 0; i < 5; i++) {
    if (blueRightTrack[i] !== null) {
      rightOuter = blueRightTrack[i] + 7;
    }
  }

  var centerEl = document.getElementById('blue-center');
  var centerVal = centerEl && centerEl.dataset.value ? parseInt(centerEl.dataset.value) : null;

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

  for (var i = 1; i <= 6; i++) {
    if (blueLeftTrack[i] !== null && blueBonusValues.indexOf(blueLeftTrack[i]) !== -1) bonusCount++;
  }
  for (var i = 0; i < 5; i++) {
    var rv = blueRightTrack[i] + 7;
    if (rv !== null && blueBonusValues.indexOf(rv) !== -1) bonusCount++;
  }

  total += bonusCount * 4;

  document.getElementById("cc-blue-total").innerHTML = total.toString();
  return total;
}

function calcBrown() {
  var total = 0;
  var crosses = 0;

  for (var i = 1; i <= 12; i++) {
    var el = document.getElementById('br' + i);
    if (el && el.classList.contains('strikethrough')) {
      crosses++;
    }
  }

  total = brownScores[Math.min(crosses, 12)] || 0;

  document.getElementById("cc-brown-total").innerHTML = total.toString();
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

  document.getElementById("cc-pink-total").innerHTML = total.toString();
  document.getElementById("cc-pink-score").innerHTML = total.toString();
  return total;
}

// ========================================
//  Main Score Update
// ========================================

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

  // Count foxes from crossed bonus elements
  var foxElements = document.querySelectorAll('.fox:not(.foxbelow):not(.foxbelo)');
  for (var i = 0; i < foxElements.length; i++) {
    if (foxElements[i].classList.contains('strikethrough')) {
      numFoxes++;
    }
  }

  // Also count from circle tracks
  var foxCircle = document.getElementById('fox-circle');
  if (foxCircle && foxCircle.style.borderColor === 'black') {
    numFoxes++;
  }

  document.getElementById("foxmultiplier").innerHTML = numFoxes.toString() + "x";

  var totalScore = yellow + turquoise + blue + brown + pink + (numFoxes * foxValue);
  document.getElementById("totalScore").innerHTML = totalScore.toString();
}

// ========================================
//  Bonus Checking for Yellow
// ========================================

function checkYellowBonuses() {
  // Bonuses between Row I and Row II
  // Bonus at col 2: needs y2 (Row I) and y8 (Row II) crossed
  checkYellowBonus('y2', 'y8', null); // +1
  checkYellowBonus('y4', 'y10', 'yellowbonus'); // ?
  checkYellowBonus('y4', 'y10', 'blackbonus'); // 🔓 (the middle one)
  checkYellowBonus('y2', 'y8', 'fox'); // Fox
  checkYellowBonus('y4', 'y10', 'blackbonus'); // ↻
  checkYellowBonus('y6', 'y12', 'blackbonus'); // +1

  // Bonuses between Row II and Row III
  checkYellowBonus('y7', 'y13', 'bluebonus'); // ?
  checkYellowBonus('y7', 'y13', 'blackbonus'); // 🔓
  checkYellowBonus('y9', 'y15', 'greybonus'); // ?
  checkYellowBonus('y11', 'y17', 'greenbonus'); // ?
  checkYellowBonus('y12', 'y18', 'pinkbonus'); // ?
  checkYellowBonus('y12', 'y18', 'blackbonus'); // ↻
}

function checkYellowBonus(aboveId, belowId, bonusClass) {
  var aboveEl = document.getElementById(aboveId);
  var belowEl = document.getElementById(belowId);
  if (!aboveEl || !belowEl) return;
  if (!aboveEl.classList.contains('strikethrough') || !belowEl.classList.contains('strikethrough')) return;

  // Find matching bonus element
  var bonusRows = document.querySelectorAll('.surroundingbox.greyshadow .row');
  for (var r = 0; r < bonusRows.length; r++) {
    var bonuses = bonusRows[r].querySelectorAll('.bonusbox, .points');
    for (var b = 0; b < bonuses.length; b++) {
      var bonus = bonuses[b];
      if (bonusClass) {
        var classes = bonus.className;
        if (classes.indexOf(bonusClass) === -1) continue;
      }
      if (!bonus.classList.contains('strikethrough')) {
        bonus.classList.add('strikethrough');
        if (bonus.classList.contains('fox')) {
          numFoxes++;
        }
      }
    }
  }
}

// ========================================
//  Bonus Checking for Brown
// ========================================

function checkBrownBonuses() {
  // Brown bonuses are between adjacent boxes
  // br1-br2: ↻, br2-br3: +1, br3-br4: blue ?, br4-br5: 🔓
  // br5-br6: yellow ?, br6-br7: ↻, br7-br8: fox, br8-br9: grey ?
  // br9-br10: +1, br10-br11: green ?, br11-br12: pink ?
  var bonusPairs = [
    ['br1', 'br2', null],   // ↻ (already crossed on first of pair)
    ['br2', 'br3', null],   // +1
    ['br3', 'br4', 'bluebonus'],
    ['br4', 'br5', 'blackbonus'], // 🔓
    ['br5', 'br6', 'yellowbonus'],
    ['br6', 'br7', 'blackbonus'], // ↻
    ['br7', 'br8', 'fox'],
    ['br8', 'br9', 'greybonus'],
    ['br9', 'br10', 'blackbonus'], // +1
    ['br10', 'br11', 'greenbonus'],
    ['br11', 'br12', 'pinkbonus']
  ];

  for (var i = 0; i < bonusPairs.length; i++) {
    var leftId = bonusPairs[i][0];
    var rightId = bonusPairs[i][1];
    var bonusType = bonusPairs[i][2];
    var leftEl = document.getElementById(leftId);
    var rightEl = document.getElementById(rightId);
    if (!leftEl || !rightEl) continue;
    if (!leftEl.classList.contains('strikethrough') || !rightEl.classList.contains('strikethrough')) continue;

    // Find the bonus between these boxes
    var leftParent = leftEl.parentElement;
    if (!leftParent) continue;
    var siblings = leftParent.children;
    for (var s = 0; s < siblings.length; s++) {
      if (siblings[s] === leftEl) {
        if (s + 1 < siblings.length && siblings[s + 1].className && siblings[s + 1].className.indexOf('bonusbox') !== -1) {
          var bonus = siblings[s + 1];
          if (bonusType && bonus.className.indexOf(bonusType) === -1) continue;
          if (!bonus.classList.contains('strikethrough')) {
            bonus.classList.add('strikethrough');
            if (bonus.classList.contains('fox')) {
              numFoxes++;
            }
          }
          break;
        }
      }
    }
  }
}

// ========================================
//  Modal & Helper Functions
// ========================================

function turnOffModal() {
  document.getElementById("mainmodal").style.display = "none";
  updateScore();
}

function hideScore(element) {
  var scoreElements = [
    "cc-yellow-total", "cc-turquoise-total", "cc-blue-total",
    "cc-brown-total", "cc-pink-total", "foxpoints", "totalScore"
  ];
  scoreElements.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.classList.toggle("hiddenscore");
    }
  });
  var foxMultiplier = document.getElementById("foxmultiplier");
  if (foxMultiplier) foxMultiplier.classList.toggle("hiddenscore");
}

window.onclick = function(event) {
  var modal = document.getElementById("mainmodal");
  if (event.target == modal) {
    turnOffModal();
  }
}
