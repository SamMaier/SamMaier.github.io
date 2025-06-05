
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
  const allHaveStrikethrough =
    document.getElementById('y8')?.classList.contains('strikethrough') &&
    document.getElementById('y9')?.classList.contains('strikethrough') &&
    document.getElementById('y10')?.classList.contains('strikethrough');
  if (allHaveStrikethrough) {
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

// --- Scoring for Green Area (formerly Orange in original) ---
function calcGreen() {
  let total = 0;
  for (let i = 1; i <= 12; i++) {
    const id = "g" + i; // IDs are g1-g12 in green area
    const ele = document.getElementById(id);
    if (ele) {
      const valStr = ele.innerHTML; // Original text like 'x2', or the entered number
      const originalText = ele.dataset.originalText || valStr; // Prefer original if available
      const multiplierMatch = originalText.match(/x(\d)/); // e.g., x2, x3 from original text
      const actualMultiplier = multiplierMatch ? parseInt(multiplierMatch[1]) : 1;
      const numberVal = parseInt(ele.dataset.value || "0"); // Entered value is stored in data-value

      if (Number.isInteger(numberVal) && numberVal > 0) {
        total += (numberVal * actualMultiplier);
      }
      // Fox: If g7 has a value (fox icon is under g7).
      if (i === 7 && Number.isInteger(numberVal) && numberVal > 0) {
        numFoxes++;
      }
    }
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

  // Call new calculation functions
  let silverScore = calcSilver();
  let yellowScore = calcYellow();
  let blueScore = calcBlue();
  let greenScore = calcGreen();
  let pinkScore = calcPink();

  // Fox scoring: numFoxes is incremented in individual calc functions.
  // The lowest score among all colors is the value for each fox.
  let foxValue = Math.min(silverScore, yellowScore, blueScore, greenScore, pinkScore);
  if (!isFinite(foxValue) || isNaN(foxValue)) {
      foxValue = 0; // Handle cases where a score might not be a number yet
  }

  // Update fox display
  // The individual fox icons on the board are now styled generically as grey.
  // We only update the total fox score display at the bottom.
  const allFoxElements = document.querySelectorAll(".points.fox .pointsnumber");
  allFoxElements.forEach(el => {
      el.innerHTML = foxValue.toString();
  });

  document.getElementById("foxmultiplier").innerHTML = numFoxes.toString() + "x";
  document.getElementById("foxpoints").children[0].innerHTML = (numFoxes * foxValue).toString();


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

    // Display logic (might differ based on area)
    if (selected.id.startsWith("g")) { // Green area
        selected.innerHTML = (selected.dataset.originalText || "") + "<br>" + numericValue;
    } else if (selected.id.startsWith("p")) { // Pink area
        // Display the number. Original text like '≥2' is in selected.dataset.originalText
        selected.innerHTML = numericValue;
        // Validation for >=N should be here or before calling numberpicked
        const conditionText = selected.dataset.originalText || "";
        const conditionMatch = conditionText.match(/≥(\d)/);
        if (conditionMatch) {
            const minVal = parseInt(conditionMatch[1]);
            if (numericValue < minVal) {
                // Handle invalid input, e.g., alert or clear
                // For now, let's assume valid input or rely on user
                console.warn(`Value ${numericValue} for ${selected.id} is less than required ${minVal}`);
            }
        }
    } else { // Silver (s) and Yellow (y) areas
        selected.innerHTML = numericValue;
    }
    selected.style.color = "black";
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

  for (let i = 1; i <= 6; i++) {
    let id = "sq" + i;
    el = document.getElementById(id);
    el.innerHTML = i * multiplier;
    el.style.display = "block";
  }

  // Special logic for Pink area (sequential values)
  if (element.id.startsWith("p")){
    let prevNumStr = element.id.substring(1);
    let prevNum = Number(prevNumStr) - 1;
    if (prevNum > 0) { // Check if there is a previous pink box
      const prevPinkBox = document.getElementById("p" + prevNum);
      // Check if previous pink box has a value and it's not 6 (max value)
      if (prevPinkBox && prevPinkBox.dataset.value && prevPinkBox.dataset.value !== "6"){
        const prevVal = Number(prevPinkBox.dataset.value);
        // Hide numbers in modal that are less than or equal to the previous pink box's value
        for (let i = 1; i <= 6; i++) {
          if (i * multiplier <= prevVal) { // Compare with potential modal value
            document.getElementById("sq" + i).style.display = "none";
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
