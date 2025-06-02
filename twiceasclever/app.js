
var selected = null;
var multiplier = 1; // Note: Green area multipliers are handled differently now.
var numFoxes = 0;
var isBeforeUnloadRegistered = false;

// --- Scoring for Silver Area (formerly Yellow in original) ---
function calcSilver() {
  let total = 0;
  // The silver area is a 4x6 grid. Scoring is based on the point track: 2, 4, 7, 11, 16, 22.
  // This usually means points per N items of a certain type, or column/row completion.
  // For now, let's assume it scores based on completing vertical columns in the 4x6 grid.
  // Each square in the grid needs to be identifiable. They have classes like 'text-yellow-content'.
  // This is a placeholder logic and likely needs to be specific to Twice as Clever rules.

  const grid = {
    yellow: [], blue: [], green: [], pink: []
  };
  const rows = document.querySelectorAll('.surroundingbox.greyshadow .row[style*="margin: auto 0.1rem"]');
  if (rows.length === 4) { // Expect 4 rows of colored text squares
    rows.forEach((row, rowIndex) => {
      const squares = row.querySelectorAll('.square');
      squares.forEach((sq, colIndex) => {
        let color = null;
        if (sq.classList.contains('text-yellow-content')) color = 'yellow';
        else if (sq.classList.contains('text-blue-content')) color = 'blue';
        else if (sq.classList.contains('text-green-content')) color = 'green';
        else if (sq.classList.contains('text-pink-content')) color = 'pink';

        if (color) {
          if (!grid[color][colIndex]) grid[color][colIndex] = 0;
          if (sq.classList.contains('strikethrough')) {
            grid[color][colIndex]++;
          }
        }
      });
    });
  }

  // Example scoring: Points for full columns of a specific color (max 4 items per column)
  // This is a major assumption. The actual game might score per item, or different patterns.
  let completedColumns = 0;
  for (let c = 0; c < 6; c++) { // 6 columns
    if (grid.yellow[c] === 1 && grid.blue[c] === 1 && grid.green[c] === 1 && grid.pink[c] === 1) {
        completedColumns++; // Example: if a whole column (all 4 colors) is struck.
    }
  }
  const silverPointsMap = [0, 2, 4, 7, 11, 16, 22]; // For 0 to 6 completed columns
  total = silverPointsMap[Math.min(completedColumns, 6)] || 0;

  // Fox: The silver area has a fox bonus in its 5th row of bonuses.
  // This is likely an earned fox if that specific bonus is achieved, not calculated from grid.
  // For now, fox logic here is removed; it's tied to the bonus icon if it were clickable for a fox.

  document.getElementById("greypoints").innerHTML = total.toString();
  return total;
}

// --- Scoring for Yellow Area (formerly Blue in original) ---
function calcYellow() {
  let total = 0;
  let checkedCount = 0;
  const yellowSquares = document.querySelectorAll('.yellowshadow .square'); // All squares in yellow area
  yellowSquares.forEach(sq => {
    if (sq.classList.contains('strikethrough')) {
      checkedCount++;
    }
  });

  const yellowPointsMap = [0, 3, 10, 21, 36, 55, 75, 96, 118, 141, 165]; // For 0 to 10 checked squares
  total = yellowPointsMap[Math.min(checkedCount, 10)] || 0;

  // Fox: No explicit fox icon in the yellow area's main grid in the provided HTML.
  // The new column of 5 bonuses on the right might grant a fox, handled separately.

  document.getElementById("yellowpoints").innerHTML = total.toString();
  return total;
}

// --- Scoring for Blue Area (formerly Green in original) ---
function calcBlue() {
  let total = 0;
  let checkedCount = 0;
  for (let i = 1; i <= 12; i++) {
    const id = "g" + i; // IDs are g1-g12 in blue area
    const ele = document.getElementById(id);
    if (ele && ele.classList.contains("strikethrough")) {
      checkedCount++;
    }
  }
  const bluePointsMap = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78]; // For 0 to 12 checked
  total = bluePointsMap[Math.min(checkedCount, 12)] || 0;

  // Fox: If g9 (which has a fox bonus icon under it) is checked.
  const g9 = document.getElementById("g9");
  if (g9 && g9.classList.contains("strikethrough")) {
    numFoxes++;
  }

  document.getElementById("bluepoints").innerHTML = total.toString();
  return total;
}

// --- Scoring for Green Area (formerly Orange in original) ---
function calcGreen() {
  let total = 0;
  for (let i = 1; i <= 12; i++) {
    const id = "o" + i;
    const ele = document.getElementById(id);
    if (ele) {
      const valStr = ele.innerHTML;
      const multiplierMatch = valStr.match(/x(\d)/); // e.g., x2, x3
      const actualMultiplier = multiplierMatch ? parseInt(multiplierMatch[1]) : 1;
      const numberVal = parseInt(ele.dataset.value || "0"); // Assuming entered value is stored in data-value

      if (Number.isInteger(numberVal) && numberVal > 0) {
        total += (numberVal * actualMultiplier);
      }
      // Fox: If o8 has a value and its fox icon is achieved.
      if (i === 8 && Number.isInteger(numberVal) && numberVal > 0) {
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
      // Fox: If p7 has a value and its fox icon is achieved.
      if (i === 7 && Number.isInteger(numberVal) && numberVal > 0) {
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
    if (selected.id.startsWith("o")) { // Green area
        // Display the number, but keep the multiplier text part if possible, or just show number
        // For simplicity, just show the number. Original text like 'x2' is in selected.dataset.originalText
        selected.innerHTML = numericValue;
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
    } else {
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
  // Logic for top circle tracks - toggles black border and strikethrough
  if (element.style.borderColor === "white" || element.style.borderColor === "") {
    element.style.borderColor = "black";
  } else {
    if (element.classList.contains("strikethrough")) {
      element.classList.remove("strikethrough");
      element.style.borderColor = "white";
    } else {
      element.classList.add("strikethrough");
      // No score update needed for these circles directly, they grant bonuses
    }
  }
}

function numberbox(element) {
  selected = element;
  // Store original text (like x2, >=3) if not already stored
  if (!selected.dataset.originalText) {
    selected.dataset.originalText = selected.innerHTML;
  }

  let modal = document.getElementById("mainmodal");
  modal.style.display = "flex";

  // Populate modal with numbers 1-6
  for (let i = 1; i <= 6; i++) {
    let id = "sq" + i;
    let el = document.getElementById(id);
    el.innerHTML = i;
    el.style.display = "block"; // Ensure all are visible initially
  }

  // Specific logic for Pink area (≥N condition)
  // The modal always shows 1-6. The validation of ≥N happens in numberpicked or when scoring.
  // No special modal filtering for pink needed here based on typical 'Ganz Schön Clever' rules.
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
