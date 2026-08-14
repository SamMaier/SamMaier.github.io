(function () {
  'use strict';

  var gameConfigs = {
    thatsprettyclever: {
      trigger: '.scorecard > .row:first-child > .surroundingbox:first-child .bigsquare',
      areas: ['.yellowshadow', '.blueshadow', '.greenshadow', '.orangeshadow', '.purpleshadow'],
      defaults: ['#999955', '#222299', '#337733', '#bb6600', '#440099']
    },
    twiceasclever: {
      trigger: '.dice-field .surroundingbox:first-child .bigsquare',
      areas: [
        '.scorecard > .row[style*="height: 13rem"] .greyshadow',
        '.yellowshadow',
        '.blueshadow',
        '.greenshadow',
        '.pinkshadow'
      ],
      defaults: ['#888888', '#999955', '#222299', '#337733', '#ff85c2']
    },
    clevercubed: {
      trigger: '.dice-field .surroundingbox:first-child .bigsquare',
      areas: ['.grid-yellow', '.grid-blue', '.purple-row .area', '.brown-row .area', '.pink-row .area'],
      defaults: ['#f3c900', '#52bec2', '#440099', '#b07a34', '#ff85c2']
    }
  };

  var palette = [
    ['Classic yellow', '#999955'], ['Classic blue', '#222299'],
    ['Classic green', '#337733'], ['Classic orange', '#bb6600'],
    ['Classic purple', '#440099'], ['Silver', '#888888'],
    ['Bubblegum pink', '#ff85c2'], ['Golden yellow', '#f3c900'],
    ['Teal', '#52bec2'], ['Brown', '#b07a34'],
    ['Red', '#e53935'],
    ['Orange', '#ff6f00'], ['Dark grey', '#333333'],
    ['Royal blue', '#1e5cff'], ['Violet', '#7e57c2']
  ];

  var colorAliases = {
    '#aa9955': '#999955',
    '#ff73ad': '#ff85c2',
    '#453894': '#440099',
    '#43a047': '#337733',
    '#00acc1': '#52bec2',
    '#fdd835': '#333333'
  };

  var gameKey = Object.keys(gameConfigs).find(function (key) {
    return location.pathname.indexOf('/' + key + '/') !== -1 || location.pathname.endsWith('/' + key);
  });
  var config = gameConfigs[gameKey];
  if (!config) return;

  var boardAreas = config.areas.map(function (selector) { return document.querySelector(selector); });
  var trigger = document.querySelector(config.trigger);
  if (!trigger || boardAreas.some(function (area) { return !area; })) return;

  var storageKey = 'clever-recolor-' + gameKey;
  var colors = config.defaults.slice();
  var selectedArea = null;
  var lastFocused = null;

  try {
    var storedColors = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(storedColors) && storedColors.length === colors.length) {
      colors = storedColors.map(function (color, index) {
        var normalizedColor = typeof color === 'string' ? color.toLowerCase() : '';
        if (colorAliases[normalizedColor]) return colorAliases[normalizedColor];
        return /^#[0-9a-f]{6}$/i.test(normalizedColor) ? normalizedColor : config.defaults[index];
      });
    }
  } catch (error) {
    colors = config.defaults.slice();
  }

  function gradient(color) {
    return 'radial-gradient(circle, color-mix(in srgb, ' + color + ', white 18%) 12%, ' +
      'color-mix(in srgb, ' + color + ', black 18%) 58%, ' +
      'color-mix(in srgb, ' + color + ', black 58%) 100%)';
  }

  function applyColor(index) {
    if (colors[index].toLowerCase() === config.defaults[index].toLowerCase()) {
      boardAreas[index].style.removeProperty('background');
      boardAreas[index].style.removeProperty('background-image');
    } else {
      boardAreas[index].style.setProperty('background', gradient(colors[index]), 'important');
    }
  }

  function saveColors() {
    try { localStorage.setItem(storageKey, JSON.stringify(colors)); } catch (error) {}
  }

  var modal = document.createElement('div');
  modal.className = 'recolor-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'recolor-title');
  modal.innerHTML =
    '<div class="recolor-panel">' +
      '<div class="recolor-header">' +
        '<button class="recolor-icon-button recolor-back" type="button" aria-label="Back to board">&#8249;</button>' +
        '<h2 class="recolor-title" id="recolor-title">Recolor</h2>' +
        '<button class="recolor-icon-button recolor-close" type="button" aria-label="Close recolor menu">&times;</button>' +
      '</div>' +
      '<div class="recolor-board" aria-label="Choose a board area"></div>' +
      '<div class="recolor-palette" aria-label="Choose a color"></div>' +
      '<button class="recolor-reset" type="button">Reset colors</button>' +
    '</div>';
  document.body.appendChild(modal);

  var miniBoard = modal.querySelector('.recolor-board');
  var paletteGrid = modal.querySelector('.recolor-palette');
  var title = modal.querySelector('.recolor-title');
  var backButton = modal.querySelector('.recolor-back');
  var closeButton = modal.querySelector('.recolor-close');

  config.defaults.forEach(function (color, index) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'recolor-area';
    button.setAttribute('aria-label', 'Recolor area ' + (index + 1));
    button.addEventListener('click', function () { showPalette(index); });
    miniBoard.appendChild(button);
  });

  palette.forEach(function (item) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'recolor-swatch';
    button.title = item[0];
    button.setAttribute('aria-label', item[0]);
    button.style.background = item[1];
    button.dataset.color = item[1];
    button.addEventListener('click', function () {
      colors[selectedArea] = item[1];
      applyColor(selectedArea);
      saveColors();
      showBoard();
    });
    paletteGrid.appendChild(button);
  });

  function refreshMiniBoard() {
    miniBoard.querySelectorAll('.recolor-area').forEach(function (area, index) {
      area.style.background = gradient(colors[index]);
    });
  }

  function showBoard() {
    selectedArea = null;
    modal.classList.remove('is-picking');
    title.textContent = 'Recolor';
    refreshMiniBoard();
    modal.querySelector('.recolor-area').focus();
  }

  function showPalette(index) {
    selectedArea = index;
    modal.classList.add('is-picking');
    title.textContent = 'Choose a color';
    paletteGrid.querySelectorAll('.recolor-swatch').forEach(function (swatch) {
      swatch.classList.toggle('is-selected', swatch.dataset.color.toLowerCase() === colors[index].toLowerCase());
    });
    paletteGrid.querySelector('.is-selected, .recolor-swatch').focus();
  }

  function openModal() {
    lastFocused = document.activeElement;
    refreshMiniBoard();
    modal.classList.add('is-open');
    modal.classList.remove('is-picking');
    document.body.classList.add('recolor-open');
    title.textContent = 'Recolor';
    closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open', 'is-picking');
    document.body.classList.remove('recolor-open');
    if (lastFocused) lastFocused.focus();
  }

  trigger.classList.add('recolor-trigger');
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('tabindex', '0');
  trigger.setAttribute('aria-label', 'Recolor board');
  trigger.addEventListener('click', openModal);
  trigger.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal();
    }
  });

  closeButton.addEventListener('click', closeModal);
  backButton.addEventListener('click', showBoard);
  modal.querySelector('.recolor-reset').addEventListener('click', function () {
    colors = config.defaults.slice();
    boardAreas.forEach(function (area) {
      area.style.removeProperty('background');
      area.style.removeProperty('background-image');
    });
    try { localStorage.removeItem(storageKey); } catch (error) {}
    refreshMiniBoard();
  });
  modal.addEventListener('click', function (event) {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      if (modal.classList.contains('is-picking')) showBoard();
      else closeModal();
    }
  });

  colors.forEach(function (color, index) { applyColor(index); });
})();
