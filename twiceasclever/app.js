
var selected = null;
var multiplier = 1; // Note: Green area multipliers are handled differently now.
var numFoxes = 0;
var isBeforeUnloadRegistered = false;

// --- Scoring for Silver Area (formerly Yellow in original) ---
function calcSilver() {
  let total = 0;
  const silverPointsPerRowMap = [0, 2, 4, 7, 11, 16, 22]; // Points for 0 to 6 marked squares in a row

  let foxSquares = 0
  // There are 4 rows in the silver area, each with 6 squares.
  // Row 1: s1-s6
  // Row 2: s7-s12
  // Row 3: s13-s18
  // Row 4: s19-s24
  for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
    let markedInRow = 0;
    for (let colIndex = 1; colIndex <= 6; colIndex++) {
      const squareId = "s" + (rowIndex * 6 + colIndex);
      const squareElement = document.getElementById(squareId);
      if (squareElement && squareElement.classList.contains("strikethrough")) {
        if (colIndex === 3) {
          foxSquares++;
        }
        markedInRow++;
      }
    }
    total += silverPointsPerRowMap[Math.min(markedInRow, 6)] || 0;
  }

  if (foxSquares === 4) {
    numFoxes++;
  }

  document.getElementById("greypoints").innerHTML = total.toString();
  return total;
}

// --- Scoring for Yellow Area (formerly Blue in original) ---
function calcYellow() {
  let checkedCount = 0;
  const yellowSquares = document.querySelectorAll('.yellowshadow .square'); // All squares in yellow area
  yellowSquares.forEach(sq => {
    if (sq.classList.contains('strikethrough')) {
      checkedCount++;
     }
   });

  const yellowPointsMap = [0, 3, 10, 21, 36, 55, 75, 96, 118, 141, 165]; // For 0 to 10 checked squares
  let total = yellowPointsMap[Math.min(checkedCount, yellowPointsMap.length - 1)] || 0;

  document.getElementById("yellowpoints").innerHTML = total.toString();
  const allHaveOutline =
    document.getElementById('y8')?.style.outlineColor === "black" &&
    document.getElementById('y9')?.style.outlineColor === "black" &&
    document.getElementById('y10')?.style.outlineColor === "black";
  if (allHaveOutline) {
    numFoxes++;
  }
  return total;
}

// --- Scoring for Blue Area (formerly Green in original) ---
function calcBlue() {
  let total = 0;
  let checkedCount = 0;
  for (let i = 1; i <= 12; i++) {
    const id = "b" + i; // IDs are b1-b12 in blue area
    const ele = document.getElementById(id);
    if (ele) {
      const numberVal = parseInt(ele.dataset.value || "0");
      if (Number.isInteger(numberVal) && numberVal > 0) {
        checkedCount++;
      }
    }
  }
  const bluePointsMap = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78]; // For 0 to 12 checked
  total = bluePointsMap[Math.min(checkedCount, 12)] || 0;

  if (total >= 45) {
    numFoxes++;
  }

  document.getElementById("bluepoints").innerHTML = total.toString();
  return total;
}

function calcGreen() {
  let total = 0;
  const pairs = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12]];

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const ele1 = document.getElementById("g" + pair[0]);
    const ele2 = document.getElementById("g" + pair[1]);
    let scoreForPair = 0;

    if (ele1) {
      const val1 = parseInt(ele1.dataset.value || "0");

      if (pair[0] === 7 && val1 > 0) { // Fox is in the g7/g8 pair
        numFoxes++;
      }
      if (ele2) {
        const val2 = parseInt(ele2.dataset.value || "0");

        if (val1 > 0 && val2 > 0) {
          scoreForPair = val1 - val2;
        }
      }
    }

    const scoreElement = document.getElementById("g-score-" + (i + 1));
    if (scoreElement) {
      scoreElement.innerHTML = scoreForPair.toString();
    }
    total += scoreForPair;
  }

  document.getElementById("greenpoints").innerHTML = total.toString();
  return total;
}

// --- Scoring for Pink Area (formerly Purple in original) ---
function calcPink() {
  let total = 0;
  for (let i = 1; i <= 12; i++) {
    const id = "p" + i;
    const ele = document.getElementById(id);
    if (ele) {
      const numberVal = parseInt(ele.dataset.value || "0"); // Assuming entered value is stored in data-value
      if (Number.isInteger(numberVal) && numberVal > 0) {
        total += numberVal;
      }
      // Fox: If p8 has a value (fox icon is under p8).
      if (i === 8 && Number.isInteger(numberVal) && numberVal > 0) {
        numFoxes++;
      }
    }
  }
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
      if (classes[j].startsWith("fox") && classes[j].length === 4) {
        console.log("removing " + classes[j])
      } else {
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
    selected.style.color = "inherit";
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
    if (i > 6 && !isBlue) {
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
    "greypoints", "yellowpoints", "bluepoints", "greenpoints", "pinkpoints",
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

// Initial score update on load, if needed (or call when game starts)
// updateScore(); 
