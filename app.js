function updateScore() {
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
  console.log(element.style.borderColor)
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
