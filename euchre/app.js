const scoresheetBody = document.getElementById('scoresheet').getElementsByTagName('tbody')[0];
const modal = document.getElementById('bid-modal');
const scoreModal = document.getElementById('score-modal');
const closeButtons = document.getElementsByClassName('close-button');
const numberSelector = document.getElementById('number-selector');
const scoreNumberSelector = document.getElementById('score-number-selector');
const suitSelector = document.getElementById('suit-selector');
const playerToggle = document.getElementById('player-toggle');

const bidModalTitle = document.getElementById('bid-modal-title');
const scoreModalTitle = document.getElementById('score-modal-title');

let activeBidCell = null;
let activeScoreCell = null;
let playerCount = 4;
let dealerNames = {};

// Initialize dealer names
for (let i = 1; i <= 6; i++) {
    dealerNames[i] = String.fromCharCode(64 + i);
}

function generateRows() {
    scoresheetBody.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const row = scoresheetBody.insertRow();
        const dealerCell = row.insertCell();
        const roundCell = row.insertCell();
        const usCell = row.insertCell();
        const themCell = row.insertCell();
        const bidCell = row.insertCell();

        const dealerId = (i % playerCount) + 1;
        dealerCell.textContent = dealerNames[dealerId];
        dealerCell.contentEditable = true;
        dealerCell.dataset.dealer = dealerId;

        const roundNumber = i + 1;
        roundCell.textContent = roundNumber;

        usCell.classList.add('we-cell', 'disabled');
        themCell.classList.add('they-cell', 'disabled');
        bidCell.classList.add('bid-cell');

        function openScoreModal(cell) {
            if (!cell.classList.contains('disabled')) {
                activeScoreCell = cell;
                scoreModalTitle.textContent = `Select Score for ${cell.classList.contains('we-cell') ? 'We' : 'They'}`;
                scoreModal.style.display = 'block';
            }
        }

        usCell.addEventListener('click', () => openScoreModal(usCell));
        themCell.addEventListener('click', () => openScoreModal(themCell));

        bidCell.addEventListener('click', function(e) {
            activeBidCell = this;
            this.innerHTML = '';
            bidModalTitle.textContent = `Select Bid ${roundNumber}`;
            modal.style.display = 'block';
        });
    }
}

scoresheetBody.addEventListener('input', (e) => {
    const target = e.target;
    if (target.matches('td:first-child') && target.isContentEditable) {
        const dealerId = target.dataset.dealer;
        const newName = target.textContent;

        dealerNames[dealerId] = newName;

        const allDealerCells = scoresheetBody.querySelectorAll(`[data-dealer="${dealerId}"]`);
        allDealerCells.forEach(cell => {
            if (cell !== target) {
                cell.textContent = newName;
            }
        });
    }
});

playerToggle.addEventListener('change', (e) => {
    if (e.target.name === 'players') {
        playerCount = parseInt(e.target.value, 10);
        generateRows();
    }
});

for (let i = 1; i <= 12; i++) {
    const number = document.createElement('span');
    if (i === 12) {
        number.textContent = 'Alone';
        number.dataset.value = 'Alone';
    } else {
        number.textContent = i;
        number.dataset.value = i;
    }
    numberSelector.appendChild(number);
}

for (let i = 1; i <= 10; i++) {
    const number = document.createElement('span');
    number.textContent = i;
    number.dataset.value = i;
    scoreNumberSelector.appendChild(number);
}

for (let i = 0; i < closeButtons.length; i++) {
    closeButtons[i].addEventListener('click', () => {
        modal.style.display = 'none';
        scoreModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target == modal || e.target == scoreModal) {
        modal.style.display = 'none';
        scoreModal.style.display = 'none';
    }
});

numberSelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'SPAN') {
        const selected = numberSelector.querySelector('.selected');
        if (selected) {
            selected.classList.remove('selected');
        }
        e.target.classList.add('selected');
        updateBid();
    }
});

suitSelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'SPAN') {
        const selected = suitSelector.querySelector('.selected');
        if (selected) {
            selected.classList.remove('selected');
        }
        e.target.classList.add('selected');
        updateBid();
    }
});

scoreNumberSelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'SPAN') {
        const selected = scoreNumberSelector.querySelector('.selected');
        if (selected) {
            selected.classList.remove('selected');
        }
        e.target.classList.add('selected');
        updateScore();
    }
});

function updateBid() {
    const selectedNumber = numberSelector.querySelector('.selected');
    const selectedSuit = suitSelector.querySelector('.selected');

    if (activeBidCell && selectedNumber && selectedSuit) {
        const suit = selectedSuit.dataset.suit;
        const number = selectedNumber.dataset.value;

        activeBidCell.classList.remove('red-suit');

        let suitHtml = `<span>${suit}</span>`;
        if (suit === '♥' || suit === '♦') {
            suitHtml = `<span class="red-suit">${suit}</span>`;
        }

        activeBidCell.innerHTML = `<span>${number}</span>${suitHtml}`;

        const row = activeBidCell.parentElement;
        const usCell = row.querySelector('.we-cell');
        const themCell = row.querySelector('.they-cell');
        usCell.classList.remove('disabled');
        themCell.classList.remove('disabled');

        modal.style.display = 'none';
        selectedNumber.classList.remove('selected');
        selectedSuit.classList.remove('selected');
    }
}

function updateScore() {
    const selectedNumber = scoreNumberSelector.querySelector('.selected');

    if (activeScoreCell && selectedNumber) {
        const number = parseInt(selectedNumber.dataset.value, 10);
        const currentRow = activeScoreCell.parentElement;
        const previousRow = currentRow.previousElementSibling;
        let previousScore = 0;

        if (previousRow) {
            const cellIndex = activeScoreCell.cellIndex;
            const previousCell = previousRow.cells[cellIndex];
            previousScore = parseInt(previousCell.textContent, 10) || 0;
        }

        activeScoreCell.textContent = previousScore + number;
        scoreModal.style.display = 'none';
        selectedNumber.classList.remove('selected');
    }
}

generateRows();

window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
});
