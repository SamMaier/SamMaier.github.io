var selected = null;
var multiplier = 1;
var numFoxes = 0;

function calcYellow() {
  let total = 0
  strikemap = {}
  for (let i = 1; i <= 12; i++) {
    id = "y" + i
    ele = document.getElementById(id)
    let list = ele.classList
    if (list.contains("strikethrough")) {
      strikemap[i] = true
    } else {
      strikemap[i] = false
    }
  }
  if (strikemap[1] && strikemap[4] && strikemap[7]) {
    total += 10
  }
  if (strikemap[2] && strikemap[5] && strikemap[10]) {
    total += 14
  }
  if (strikemap[3] && strikemap[8] && strikemap[11]) {
    total += 16
  }
  if (strikemap[6] && strikemap[9] && strikemap[12]) {
    total += 20
  }
  if (strikemap[10] && strikemap[11] && strikemap[12]) {
    numFoxes++
  }
  document.getElementById("yellowpoints").innerHTML = total.toString()
  return total
}
function calcBlue() {
  let total = 0
  map = { 0:0, 1:1, 2:2, 3:4, 4:7, 5:11, 6:16, 7:22, 8:29, 9:37, 10:46, 11:56 }
  hasFox = true
  for (let i = 2; i <= 12; i++) {
    id = "b" + i
    ele = document.getElementById(id)
    let list = ele.classList
    if (list.contains("strikethrough")) {
      total += 1
    } else {
      if (i >= 9) {
        hasFox = false
      }
    }
  }
  if (hasFox) {
    numFoxes ++
  }
  total = map[total]
  document.getElementById("bluepoints").innerHTML = total.toString()
  return total
}
function calcGreen() {
  let total = 0
  map = { 0:0, 1:1, 2:3, 3:6, 4:10, 5:15, 6:21, 7:28, 8:36, 9:45, 10:55, 11:66 }
  for (let i = 1; i < 12; i++) {
    id = "g" + i
    ele = document.getElementById(id)
    let list = ele.classList
    if (list.contains("strikethrough")) {
      total += 1
      if (i === 7) {
        numFoxes++
      }
    }
  }
  total = map[total]
  document.getElementById("greenpoints").innerHTML = total.toString()
  return total
}
function calcOrange() {
  let total = 0
  for (let i = 1; i < 12; i++) {
    id = "o" + i
    ele = document.getElementById(id)
    val = Number(ele.innerHTML)
    if (Number.isInteger(val)) {
      total += val
      if (val > 0 && i === 8) {
        numFoxes++
      }
    }
  }
  document.getElementById("orangepoints").innerHTML = total.toString()
  return total
}
function calcPurple() {
  let total = 0
  for (let i = 1; i <= 11; i++) {
    id = "p" + i
    ele = document.getElementById(id)
    val = Number(ele.innerHTML)
    if (Number.isInteger(val)) {
      total += val
      if (val > 0 && i === 7) {
        numFoxes++
      }
    }
  }
  document.getElementById("purplepoints").innerHTML = total.toString()
  return total
}

function updateScore() {
  numFoxes = 0
  let yellow = calcYellow()
  let blue = calcBlue()
  let green = calcGreen()
  let orange = calcOrange()
  let purple = calcPurple()
  let foxNum = Math.min(yellow, blue, green, orange, purple)
  let foxStyleClass = ""
  if (foxNum === orange) {
    foxStyleClass = "foxo"
  } else if (foxNum === yellow) {
    foxStyleClass = "foxy"
  } else if (foxNum === blue) {
    foxStyleClass = "foxb"
  } else if (foxNum === green) {
    foxStyleClass = "foxg"
  } else {
    foxStyleClass = "foxp"
  }
  let elements = document.getElementsByClassName("fox")
  for (let i = 0; i < elements.length; i++) {
    classes = elements[i].className.split(" ")
    newClasses = ""
    for (let j = 0; j < classes.length; j++) {
      if (classes[j].startsWith("fox") && classes[j].length === 4) {
        console.log("removing " + classes[j])
      } else {
        newClasses += classes[j] + " "
      }
    }
    newClasses += foxStyleClass
    elements[i].className = newClasses
    elements[i].children[0].innerHTML = foxNum.toString()
  }

  document.getElementById("foxmultiplier").innerHTML = numFoxes.toString() + "x"

  totalScore = yellow + blue + green + orange + purple + (numFoxes * foxNum)
  document.getElementById("totalScore").innerHTML = totalScore.toString()
}

function numberpicked(element) {
  selected.style.color = "black"
  selected.innerHTML = element.innerHTML
  if (element.innerHTML.length === 0) {
    selected.style.color = "inherit"
    if (multiplier === 2) {
      selected.innerHTML = "x2"
    } else if (multiplier === 3) {
      selected.innerHTML = "x3"
    } else {
      selected.innerHTML = ""
    }
  }
  turnOffModal()
}

function strikethrough(element) {
  let list = element.classList
  if (list.contains("strikethrough")) {
    list.remove("strikethrough")
  } else {
    list.add("strikethrough")
  }
  if (!navigator.userAgent.includes("Chrome") && navigator.userAgent.includes("Safari")) {
    // Hack for Safari since it can't draw the ::after CSS pseudoelement for some reason.
    element.style.display = 'none';
    element.offsetHeight;
    element.style.display = '';
  }
  updateScore();
}

function circle(element) {
  let list = element.classList
  if (element.style.borderColor == "white" || element.style.borderColor == "" || element.style.borderColor == null) {
    element.style.borderColor = "black"
  } else {
    if (list.contains("strikethrough")) {
      list.remove("strikethrough")
      element.style.borderColor = "white"
    } else {
      list.add("strikethrough")
    }
  } 
}

function numberbox(element, multipl = 1) {
  multiplier = multipl
  let modal = document.getElementById("mainmodal")
  modal.style.display = "flex"
  selected = element

  for (let i = 1; i <= 6; i++) {
    let id = "sq" + i
    el = document.getElementById(id)
    el.innerHTML = i * multiplier
    el.style.display = "block"
  }

  if (element.id.startsWith("p")){
    let prevNum = Number(element.id.substring(1))-1
    if (prevNum) {
      prevVal = Number(document.getElementById("p"+prevNum).innerHTML)
      if (prevVal > 0 && prevVal !== 6){
        for (let i = 1; i <=prevVal; i++) {
          el = document.getElementById("sq" + i)
          el.style.display = "none"
        }
      }
    }
  }
}

function hideScore(element) {
  hideScoreImpl(element)
  hideScoreImpl(document.getElementById("totalScore"))
  hideScoreImpl(document.getElementById("bluepoints"))
}

function hideScoreImpl(element) {
  let list = element.classList
  if (list.contains("hiddenscore")) {
    list.remove("hiddenscore")
  } else {
    list.add("hiddenscore")
  }
}

function turnOffModal() {
  document.getElementById("mainmodal").style.display = "none"
  updateScore()
}

window.onclick = function(event) {
  let modal = document.getElementById("mainmodal")
  if (event.target == modal) {
    turnOffModal()
  }
}
