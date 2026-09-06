var selected = null;
var numFoxes = 0;
var isBeforeUnloadRegistered = false;

function valueOf(element) { return Number(element && element.dataset.value || 0); }
function writeScore(id, value) { var element = document.getElementById(id); if (element) element.textContent = value; return value; }
function registerBeforeUnload() {
  if (isBeforeUnloadRegistered) return;
  window.addEventListener('beforeunload', function (event) { event.preventDefault(); event.returnValue = ''; });
  isBeforeUnloadRegistered = true;
}

function calcYellow() {
  var middle = 0, bottom = 0, columns = 0, columnScores = [10, 10, 15, 15, 20];
  for (var i = 1; i <= 5; i++) {
    middle += valueOf(document.getElementById('y-m' + i));
    bottom += valueOf(document.getElementById('y-b' + i));
    if (valueOf(document.getElementById('y-t' + i)) && valueOf(document.getElementById('y-m' + i)) && valueOf(document.getElementById('y-b' + i))) columns += columnScores[i - 1];
  }
  if (valueOf(document.getElementById('y-t5'))) numFoxes++;
  writeScore('yellow-minus', middle); writeScore('yellow-plus', bottom); writeScore('yellow-columns', columns);
  return writeScore('yellowpoints', bottom - middle + columns);
}

function calcBlue() {
  var columnScores = [7, 8, 9, 10, 11, 12], total = 0;
  for (var c = 1; c <= 6; c++) {
    var count = 0;
    for (var r = 1; r <= 6; r++) if (document.getElementById('b-r' + r + '-c' + c).classList.contains('strikethrough')) count++;
    if (count >= 2) total += columnScores[c - 1];
  }
  var opposite = 0;
  for (var d = 1; d <= 6; d++) if (document.getElementById('b-r' + d + '-c' + (7 - d)).classList.contains('strikethrough')) opposite++;
  if (opposite >= 2) total += 6;
  var rowSix = 0;
  for (c = 1; c <= 6; c++) if (document.getElementById('b-r6-c' + c).classList.contains('strikethrough')) rowSix++;
  if (rowSix >= 2) numFoxes++;
  return writeScore('bluepoints', total);
}

function calcGrey() {
  var columnScores = [1,2,3,4,5,6,6,7,7,8,8,9,9,10,10,11], total = 0;
  var cells = document.querySelectorAll('.grey-grid>i');
  for (var c = 0; c < 16; c++) {
    var complete = true;
    for (var r = 0; r < 4; r++) if (!cells[r * 16 + c].classList.contains('strikethrough')) complete = false;
    if (complete) total += columnScores[c];
  }
  ['W','L','D'].forEach(function (shade) {
    var shadeCells = document.querySelectorAll('.grey-grid>i.' + shade);
    if (shadeCells.length && Array.prototype.every.call(shadeCells, function (cell) { return cell.classList.contains('strikethrough'); })) numFoxes++;
  });
  return writeScore('greypoints', total);
}

function calcGreen() {
  var total = 0;
  for (var i = 1; i <= 11; i++) {
    var top = valueOf(document.getElementById('green-top-' + i));
    var bottom = valueOf(document.getElementById('green-bottom-' + i));
    var score = top && bottom ? (top + bottom) * (i >= 4 ? 2 : 1) : 0;
    document.getElementById('green-star-' + i).textContent = score ? score : (i >= 4 ? 'x2' : '');
    total += score;
  }
  if (valueOf(document.getElementById('green-bottom-10'))) numFoxes++;
  return writeScore('greenpoints', total);
}

function calcPink() {
  var progress = [2,4,6,9,12,15,19,23,27,32,37,42], lastPrefix = -1, extras = 0;
  for (var i = 1; i <= 12; i++) {
    var box = document.getElementById('pink-' + i), value = valueOf(box);
    box.classList.toggle('pink-circled', value === 2 || value === 4 || value === 6);
    if (i === lastPrefix + 2 && value) lastPrefix = i - 1;
    if (value === 2) extras += 2; else if (value === 4) extras += 4; else if (value === 6) extras += 3;
  }
  var foxBox = document.getElementById('pink-8');
  if (valueOf(foxBox) === 5 || valueOf(foxBox) === 6) numFoxes++;
  return writeScore('pinkpoints', (lastPrefix >= 0 ? progress[lastPrefix] : 0) + extras);
}

function updateScore() {
  numFoxes = 0;
  var scores = [calcYellow(), calcBlue(), calcGrey(), calcGreen(), calcPink()];
  var foxValue = Math.min.apply(Math, scores), foxClasses = ['foxy','foxb','foxs','foxg','foxp'];
  var foxStyle = foxClasses[scores.indexOf(foxValue)];
  Array.prototype.forEach.call(document.querySelectorAll('.fox'), function (element) {
    foxClasses.forEach(function (className) { element.classList.remove(className); });
    element.classList.add(foxStyle);
    var number = element.querySelector('.pointsnumber') || element.querySelector('span');
    if (number) number.textContent = foxValue;
  });
  writeScore('foxmultiplier', numFoxes + 'x');
  writeScore('totalScore', scores.reduce(function (sum, score) { return sum + score; }, 0) + numFoxes * foxValue);
}

function numberbox(element, allowedValues) {
  selected = element;
  var allowed = allowedValues || [1,2,3,4,5,6];
  if (!allowedValues && !valueOf(element)) {
    var match = element.id.match(/^y-([mb])(\d)$/);
    var greenMatch = element.id.match(/^green-(top|bottom)-(\d+)$/);
    var pinkMatch = element.id.match(/^pink-(\d+)$/);
    var prefix = match ? 'y-' + match[1] : greenMatch ? 'green-' + greenMatch[1] + '-' : pinkMatch ? 'pink-' : null;
    var index = Number(match ? match[2] : greenMatch ? greenMatch[2] : pinkMatch ? pinkMatch[1] : 1);
    for (var i = 1; prefix && i < index; i++) {
      if (!valueOf(document.getElementById(prefix + i))) { allowed = []; break; }
    }
  }
  for (var value = 1; value <= 6; value++) document.getElementById('sq' + value).style.display = allowed.indexOf(value) < 0 ? 'none' : 'block';
  var modal = document.getElementById('mainmodal'); modal.style.display = 'flex'; modal.setAttribute('aria-hidden', 'false');
}

function yellowTopBox(element, index) {
  var previous = 0, next = 7, hasGap = false;
  for (var i = 1; i < index; i++) {
    var value = valueOf(document.getElementById('y-t' + i));
    if (!value) hasGap = true;
    previous = Math.max(previous, value);
  }
  for (i = index + 1; i <= 5; i++) {
    value = valueOf(document.getElementById('y-t' + i));
    if (value) next = Math.min(next, value);
  }
  var allowed = hasGap && !valueOf(element) ? [] : [1,2,3,4,5,6].filter(function (value) { return value > previous && value < next; });
  numberbox(element, allowed);
}

function numberpicked(element) {
  if (!selected) return;
  var picked = Number(element.textContent);
  var oldValue = valueOf(selected);
  var wasAuto = selected.dataset.auto === 'true';
  var oldAutoTarget = selected.dataset.autoTarget && document.getElementById(selected.dataset.autoTarget);
  if (oldAutoTarget && oldAutoTarget.dataset.autoSource === selected.id) {
    delete oldAutoTarget.dataset.value; delete oldAutoTarget.dataset.auto; delete oldAutoTarget.dataset.autoSource; oldAutoTarget.textContent = '';
  }
  delete selected.dataset.autoTarget;
  if (selected.dataset.autoSource) {
    var oldSource = document.getElementById(selected.dataset.autoSource);
    if (oldSource) delete oldSource.dataset.autoTarget;
    delete selected.dataset.autoSource;
  }
  if (!picked) { delete selected.dataset.value; selected.textContent = ''; delete selected.dataset.auto; }
  else {
    selected.dataset.value = picked; selected.textContent = picked; delete selected.dataset.auto;
    if (!wasAuto && selected.id.indexOf('pink-') === 0 && picked === 3) {
      var index = Number(selected.id.split('-')[1]);
      for (var i = index + 1; i <= 12; i++) {
        var next = document.getElementById('pink-' + i);
        if (!valueOf(next)) { next.dataset.value = '3'; next.dataset.auto = 'true'; next.dataset.autoSource = selected.id; selected.dataset.autoTarget = next.id; next.textContent = '3'; break; }
      }
    }
  }
  if (oldValue !== picked || oldAutoTarget || wasAuto) registerBeforeUnload();
  turnOffModal();
}

function strikethrough(element) {
  registerBeforeUnload(); element.classList.toggle('strikethrough');
  if (!navigator.userAgent.includes('Chrome') && navigator.userAgent.includes('Safari')) { element.style.display = 'none'; element.offsetHeight; element.style.display = ''; }
  updateScore();
}

function toggleGrey(element) {
  registerBeforeUnload();
  var marked = element.classList.contains('strikethrough');
  Array.prototype.forEach.call(document.querySelectorAll('.grey-grid>[data-region="' + element.dataset.region + '"]'), function (cell) { cell.classList.toggle('strikethrough', !marked); });
  updateScore();
}

function circle(element) {
  registerBeforeUnload();
  if (element.style.borderColor === 'black') { if (element.classList.contains('strikethrough')) { element.classList.remove('strikethrough'); element.style.borderColor = ''; } else element.classList.add('strikethrough'); }
  else element.style.borderColor = 'black';
  updateScore();
}

function hideScore() { ['yellowpoints','bluepoints','greypoints','greenpoints','pinkpoints','foxmultiplier','foxpoints','totalScore'].forEach(function (id) { var el = document.getElementById(id); if (el) el.classList.toggle('hiddenscore'); }); }
function turnOffModal() { var modal = document.getElementById('mainmodal'); modal.style.display = 'none'; modal.setAttribute('aria-hidden','true'); selected = null; updateScore(); }
window.onclick = function (event) { if (event.target === document.getElementById('mainmodal')) turnOffModal(); };

Array.prototype.forEach.call(document.querySelectorAll('.blue-grid>i'), function (cell, index) {
  cell.onclick = function () { strikethrough(cell); };
  cell.setAttribute('aria-label', 'Blue row ' + (Math.floor(index / 6) + 1) + ', column ' + (index % 6 + 1));
});
Array.prototype.forEach.call(document.querySelectorAll('.grey-grid>i'), function (cell, index) {
  cell.onclick = function () { toggleGrey(cell); };
  cell.setAttribute('aria-label', 'Grey row ' + (Math.floor(index / 16) + 1) + ', column ' + (index % 16 + 1));
});
Array.prototype.forEach.call(document.querySelectorAll('.green-columns button,.pink-columns button'), function (button) {
  button.onclick = function () { numberbox(button); };
  var green = button.id.match(/^green-(top|bottom)-(\d+)$/);
  var pink = button.id.match(/^pink-(\d+)$/);
  button.setAttribute('aria-label', green ? 'Green column ' + green[2] + ' ' + green[1] : 'Pink box ' + pink[1]);
});
Array.prototype.forEach.call(document.querySelectorAll('.yellow-row .square'), function (cell) {
  var parts = cell.id.split('-');
  var rowName = { t: 'top', m: 'middle', b: 'bottom' }[parts[1].charAt(0)];
  cell.setAttribute('aria-label', 'Yellow ' + rowName + ' row, column ' + parts[1].slice(1));
});
Array.prototype.forEach.call(document.querySelectorAll('.action-circles'), function (track, trackIndex) {
  Array.prototype.forEach.call(track.querySelectorAll('i'), function (circle, index) { circle.setAttribute('aria-label', (trackIndex ? 'Plus one' : 'Reroll') + ' action ' + (index + 1)); });
});
Array.prototype.forEach.call(document.querySelectorAll('.polish-grid>i'), function (circle, index) { circle.setAttribute('aria-label', 'Silver polish action ' + (index + 1)); });
Array.prototype.forEach.call(document.querySelectorAll('.blue-grid>i,.grey-grid>i,.yellow-row .square,.round-card .square,.action-circles>i,.polish-grid>i'), function (element) {
  element.setAttribute('role', 'button'); element.setAttribute('tabindex', '0');
  element.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); element.click(); } });
});
updateScore();
