
var selected = null;
var multiplier = 1; // Note: Green area multipliers are handled differently now.
var numFoxes = 0;
var isBeforeUnloadRegistered = false;

// --- Scoring for Silver Area (formerly Yellow in original) ---
function calcSilver() {
  let total = 0;
  const yellowPointsPerRow = [0, 2, 6, 12, 20, 30, 42];

  for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    let markedInRow = 0;
    for (let colIndex = 1; colIndex <= 6; colIndex++) {
      const squareId = "s" + (rowIndex * 6 + colIndex);
      const squareElement = document.getElementById(squareId);
      if (squareElement && squareElement.classList.contains("strikethrough")) {
        markedInRow++;
      }
    }
    total += yellowPointsPerRow[markedInRow];
  }

  if (document.getElementById("s6")?.classList.contains("strikethrough")) {
    numFoxes++;
  }

  document.getElementById("yellowpoints").innerHTML = total.toString();
  return total;
}

// --- Scoring for Yellow Area (formerly Blue in original) ---
function calcYellow() {
  let total = 0;
  const turquoisePointsPerRow = [0, 1, 3, 6, 10, 15, 21];
  for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
    let markedInRow = 0;
    for (let colIndex = 1; colIndex <= 6; colIndex++) {
      const square = document.getElementById("b" + (rowIndex * 6 + colIndex));
      if (square?.classList.contains("strikethrough")) {
        markedInRow++;
      }
    }
    total += turquoisePointsPerRow[markedInRow];
  }

  if (document.getElementById("b6")?.classList.contains("strikethrough")) {
    numFoxes++;
  }
  document.getElementById("tealpoints").innerHTML = total.toString();
  return total;
}

// --- Scoring for Blue Area (formerly Green in original) ---
function calcBlue() {
  let total = 0;
  const boxes = Array.from({length: 12}, (_, index) => document.getElementById("p" + (index + 1)));
  const printedScores = [22, 17, 13, 9, 6, 3, 3, 6, 9, 13, 17, 22];
  const bonusValues = new Set([2, 3, 4, 10, 11, 12]);
  const values = boxes.map(box => parseInt(box?.dataset.value || "0"));
  const leftmostIndex = values.slice(0, 6).findIndex(value => value > 0);
  const rightmostIndex = values.slice(6).map((value, index) => ({value, index: index + 6})).reverse().find(item => item.value > 0)?.index;

  if (leftmostIndex >= 0) {
    total += printedScores[leftmostIndex];
  }
  if (rightmostIndex !== undefined) {
    total += printedScores[rightmostIndex];
  }
  values.forEach(value => {
    if (bonusValues.has(value)) {
      total += 4;
    }
  });

  if (values[11] > 0) {
    numFoxes++;
  }

  document.getElementById("purplepoints").innerHTML = total.toString();
  return total;
}

function calcGreen() {
  const brownPoints = [0, 2, 5, 9, 14, 20, 27, 35, 44, 54, 65, 77, 90];
  let crossed = 0;
  for (let i = 1; i <= 12; i++) {
    if (document.getElementById("g" + i)?.classList.contains("strikethrough")) {
      crossed++;
    }
  }

  if (document.getElementById("g11")?.classList.contains("strikethrough")) {
    numFoxes++;
  }
  const total = brownPoints[crossed];
  document.getElementById("brownpoints").innerHTML = total.toString();
  return total;
}

// --- Scoring for Pink Area (formerly Purple in original) ---
function calcPink() {
  let total = 0;
  const pinkSquares = document.querySelectorAll(".pink-row .long-boxes .square");
  pinkSquares.forEach((ele, index) => {
    const numberVal = parseInt(ele.dataset.value || "0");
    if (Number.isInteger(numberVal) && numberVal > 0) {
      total += numberVal;
      if (index === 8) {
        numFoxes++;
      }
    }
  });
  document.getElementById("pinkpoints").innerHTML = total.toString();
  return total;
}

function updateScore() {
  if (!isBeforeUnloadRegistered) {
    window.addEventListener('beforeunload', function (event) {
      event.preventDefault();
      event.returnValue = ''; // Required for some browsers.
    });
    isBeforeUnloadRegistered = true;
  }

  numFoxes = 0; // Reset before recalculating

  if (document.getElementById("fox-circle").style.borderColor === "black") {
    numFoxes++;
  }

  // Call new calculation functions
  let silverScore = calcSilver();
  let yellowScore = calcYellow();
  let blueScore = calcBlue();
  let greenScore = calcGreen();
  let pinkScore = calcPink();

  // Fox scoring: numFoxes is incremented in individual calc functions.
  // The lowest score among all colors is the value for each fox.
  let foxValue = Math.min(silverScore, yellowScore, blueScore, greenScore, pinkScore);
  if (foxValue === silverScore) {
    foxStyleClass = "foxs"
  } else if (foxValue === yellowScore) {
    foxStyleClass = "foxy"
  } else if (foxValue === blueScore) {
    foxStyleClass = "foxb"
  } else if (foxValue === greenScore) {
    foxStyleClass = "foxg"
  } else {
    foxStyleClass = "foxp"
  }

  // Update fox display
  // The individual fox icons on the board are now styled generically as grey.
  // We only update the total fox score display at the bottom.
  let allFoxElements = document.getElementsByClassName("fox")
  for (let el of allFoxElements) {
    classes = el.className.split(" ")
    newClasses = ""
    for (let j = 0; j < classes.length; j++) {
      if (!(classes[j].startsWith("fox") && classes[j].length === 4)) {
        // Only readding the classes that arent like "foxp" or "foxs"
        newClasses += classes[j] + " "
      }
    }
    newClasses += foxStyleClass
    el.className = newClasses
    el.children[0].innerHTML = foxValue.toString()
  }

  document.getElementById("foxmultiplier").innerHTML = numFoxes.toString() + "x";

  let totalScoreVal = silverScore + yellowScore + blueScore + greenScore + pinkScore + (numFoxes * foxValue);
  document.getElementById("totalScore").innerHTML = totalScoreVal.toString();
}

function numberpicked(elementFromModal) {
  if (!selected) return;

  const pickedValue = elementFromModal.innerHTML;

  if (pickedValue.length === 0) { // Clear box
    selected.innerHTML = selected.dataset.originalText || ""; // Restore original text (like x2, >=3)
    selected.style.color = selected.id.startsWith("pink") ? "" : "inherit";
    delete selected.dataset.value; // Clear stored value
  } else {
    const numericValue = parseInt(pickedValue);
    selected.dataset.value = numericValue; // Store the actual numeric value

    // Display the number in the box
    selected.innerHTML = numericValue;
    selected.style.color = "black";

    // Validation for pink area
    if (selected.id.startsWith("p")) {
        const conditionText = selected.dataset.originalText || "";
        const conditionMatch = conditionText.match(/≥(\d)/);
        if (conditionMatch) {
            const minVal = parseInt(conditionMatch[1]);
            if (numericValue < minVal) {
                console.warn(`Value ${numericValue} for ${selected.id} is less than required ${minVal}`);
            }
        }
    }
  }
  turnOffModal();
}

function strikethrough(element) {
  element.classList.toggle("strikethrough");
  // Safari hack (from original)
  if (!navigator.userAgent.includes("Chrome") && navigator.userAgent.includes("Safari")) {
    element.style.display = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.display = '';
  }
  updateScore();
}

function circle(element) {
  let list = element.classList
  const isSquare = list.contains("square")
  const colorProperty = isSquare ? "outlineColor" : "borderColor";

  if (element.style[colorProperty] == "white" || element.style[colorProperty] == "" || element.style[colorProperty] == null) {
    element.style[colorProperty] = "black";
    if (isSquare) {
      element.style.outlineStyle = "solid"
    }
  } else {
    if (list.contains("strikethrough")) {
      list.remove("strikethrough");
      element.style[colorProperty] = "white";
      if (isSquare) {
        element.style.outlineStyle = "none"
      }
    } else {
      list.add("strikethrough");
    }
  }

  updateScore();
}

function numberbox(element, multipl = 1) {
  if (element.id && element.id.startsWith("g")) {
    strikethrough(element);
    return;
  }

  const pinkPickerRow = document.getElementById("pink-picker-row");
  if (pinkPickerRow) pinkPickerRow.style.display = element.id && element.id.startsWith("pink") ? "flex" : "none";
  if (!element.id || !element.id.startsWith("pink")) {
    document.getElementById("picker-row-1").style.display = "flex";
    document.getElementById("picker-row-2").style.display = "flex";
    document.getElementById("picker-blank-row").style.display = "flex";
  }

  if (element.id && element.id.startsWith("p") && !element.id.startsWith("pink")) {
    const index = Number(element.id.substring(1));
    const isLeft = index <= 6;
    let adjacentValue = isLeft ? 6 : 8;

    if (isLeft) {
      for (let i = 1; i <= 6; i++) {
        const box = document.getElementById("p" + i);
        if (box && box.dataset.value) {
          adjacentValue = Number(box.dataset.value) - 1;
          break;
        }
      }
    } else {
      for (let i = 12; i >= 7; i--) {
        const box = document.getElementById("p" + i);
        if (box && box.dataset.value) {
          adjacentValue = Number(box.dataset.value) + 1;
          break;
        }
      }
    }

    if (element.dataset.originalText === undefined) {
      element.dataset.originalText = element.innerHTML;
    }
    selected = element;
    document.getElementById("mainmodal").style.display = "flex";
    document.getElementById("modal-extra-rows").style.display = "none";

    for (let i = 1; i <= 12; i++) {
      const pickerBox = document.getElementById("sq" + i);
      pickerBox.style.display = "none";
    }
    document.getElementById("sq1").innerHTML = "7";
    document.getElementById("sq2").innerHTML = adjacentValue.toString();
    document.getElementById("sq1").style.display = "block";
    document.getElementById("sq2").style.display = (adjacentValue >= 2 && adjacentValue <= 12) ? "block" : "none";
    return;
  }

  if (element.id && element.id.startsWith("pink")) {
    multiplier = multipl;
    if (element.dataset.originalText === undefined) {
      element.dataset.originalText = element.innerHTML;
    }
    selected = element;
    document.getElementById("mainmodal").style.display = "flex";
    document.getElementById("modal-extra-rows").style.display = "none";

    const isFirstPinkBox = element.id === "pink1";
    document.getElementById("picker-row-1").style.display = isFirstPinkBox ? "none" : "flex";
    document.getElementById("picker-row-2").style.display = isFirstPinkBox ? "none" : "flex";
    document.getElementById("picker-blank-row").style.display = "flex";

    const pinkOptions = [1, 2, 3, 4, 5, 6].map(value => value * multipl);
    for (let i = 1; i <= 12; i++) {
      const pickerBox = document.getElementById("sq" + i);
      pickerBox.style.display = "none";
    }
    if (!isFirstPinkBox) {
      pinkOptions.forEach((value, index) => {
        const pickerBox = document.getElementById("sq" + (index + 1));
        pickerBox.innerHTML = value.toString();
        pickerBox.style.display = "block";
      });
    }
    document.getElementById("pink-picker-row").style.display = "flex";
    return;
  }

  multiplier = multipl;
  // Store original text if not already stored
  if (element.dataset.originalText === undefined) {
    element.dataset.originalText = element.innerHTML;
  }

  let modal = document.getElementById("mainmodal");
  modal.style.display = "flex";
  selected = element;

  const isBlue = element.id.startsWith("b");
  const maxNumber = isBlue ? 12 : 6;

  document.getElementById("modal-extra-rows").style.display = isBlue ? "block" : "none";

  for (let i = 1; i <= 12; i++) {
    let id = "sq" + i;
    el = document.getElementById(id);
    if ((i > 6 && !isBlue) || i == 1 && isBlue) {
      el.style.display = "none";
    } else {
      el.innerHTML = i * multiplier;
      el.style.display = "block";
    }
  }

  // Special logic for Pink area (>= initial value)
  if (element.id.startsWith("p")) {
    const conditionText = element.dataset.originalText || "";
    const conditionMatch = conditionText.match(/≥(\d)/);
    if (conditionMatch) {
        const minVal = parseInt(conditionMatch[1]);
        for (let i = 1; i <= 6; i++) {
            if (i * multiplier < minVal) {
                document.getElementById("sq" + i).style.display = "none";
            }
        }
    }
  }

  // Special logic for Blue area (<= previous value)
  if (element.id.startsWith("b")){
    let prevNumStr = element.id.substring(1);
    let prevNum = Number(prevNumStr) - 1;
    if (prevNum > 0) { 
      const prevBox = document.getElementById("b" + prevNum);
      if (prevBox && prevBox.dataset.value){
        const prevVal = Number(prevBox.dataset.value);
        for (let i = 1; i <= maxNumber; i++) {
          let el = document.getElementById("sq" + i);
          if (i * multiplier > prevVal) {
            el.style.display = "none";
          }
        }
      }
    }
  }
}


function hideScore(element) {
  // This function seems to be attached to the parent of all score displays.
  // It should toggle visibility for all individual score elements.
  const scoreElements = [
    "yellowpoints", "tealpoints", "purplepoints", "brownpoints", "pinkpoints",
    "foxpoints", "totalScore"
  ];
  scoreElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) hideScoreImpl(el.classList.contains("pointsnumber") ? el : el.children[0]); // Target the number itself
  });
  // Also toggle the fox multiplier
  const foxMultiplier = document.getElementById("foxmultiplier");
  if (foxMultiplier) hideScoreImpl(foxMultiplier);
}

function hideScoreImpl(element) {
  if (element) {
    element.classList.toggle("hiddenscore");
  }
}

function turnOffModal() {
  document.getElementById("mainmodal").style.display = "none";
  updateScore();
}

window.onclick = function(event) {
  let modal = document.getElementById("mainmodal");
  if (event.target == modal) {
    turnOffModal();
  }
}

updateScore();
