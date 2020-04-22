var selected = null;
var multiplier = 1;
var numFoxes = 0;

function calcYellow() {
  total = 29
  return total
}
function calcBlue() {
  total = 40
  return total
}
function calcGreen() {
  total = 33
  return total
}
function calcOrange() {
  total = 115
  return total
}
function calcPurple() {
  total = 65
  return total
}

function updateScore() {
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
}

function strikethrough(element) {
  let list = element.classList
  if (list.contains("strikethrough")) {
    list.remove("strikethrough")
  } else {
    list.add("strikethrough")
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
      console.log(prevVal)
      if (prevVal > 0 && prevVal !== 6){
        for (let i = 1; i <=prevVal; i++) {
          el = document.getElementById("sq" + i)
          el.style.display = "none"
        }
      }
    }
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
