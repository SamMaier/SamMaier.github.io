var selected = null;
var multiplier = 1;

function updateScore() {
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
  updateScore()
}

function turnOffModal() {
   document.getElementById("mainmodal").style.display = "none"
}

window.onclick = function(event) {
  let modal = document.getElementById("mainmodal")
  if (event.target == modal) {
    turnOffModal()
  }
}
