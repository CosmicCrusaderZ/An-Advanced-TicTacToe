const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const cellElements = document.querySelectorAll('[data-cell]');
const board = document.getElementById('game-board');
const statusElement = document.getElementById('status');
const restartButton = document.getElementById('restart');
const vsPlayerButton = document.getElementById('vs-player');
const vsAIButton = document.getElementById('vs-ai');
const difficultySelector = document.querySelector('.difficulty-selector');
const difficultyButtons = document.querySelectorAll('.difficulty');
const darkModeButton = document.getElementById('darkMode');
const lightModeButton = document.getElementById('lightMode');

const placeSound = document.getElementById('place-sound');
const winSound = document.getElementById('win-sound');
const drawSound = document.getElementById('draw-sound');

let currentClass;
let isVsAI = false;
let aiDifficulty = 'medium';
let currentPlayer;

vsPlayerButton.addEventListener('click', startVsPlayer);
vsAIButton.addEventListener('click', () => {
    isVsAI = true;
    difficultySelector.style.display = 'block';
});

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        aiDifficulty = button.getAttribute('data-difficulty');
        difficultySelector.style.display = 'none';
        startGame();
    });
});

restartButton.addEventListener('click', startGame);
darkModeButton.addEventListener('click', () => document.body.classList.add('dark-mode'));
lightModeButton.addEventListener('click', () => document.body.classList.remove('dark-mode'));

function startVsPlayer() {
    isVsAI = false;
    difficultySelector.style.display = 'none';
    startGame();
}

function startGame() {
    currentClass = X_CLASS;
    currentPlayer = 'X';
    statusElement.textContent = `${currentPlayer}'s turn`;
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.classList.remove('winning-cell');
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    board.classList.remove(X_CLASS);
    board.classList.remove(O_CLASS);
    board.classList.add(X_CLASS);
}

function handleClick(e) {
    const cell = e.target;
    if (cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS)) {
        return;
    }
    placeMark(cell, currentClass);
    placeSound.play();
    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        if (isVsAI && currentPlayer === 'O') {
            makeAIMove();
        }
    }
}

function placeMark(cell, classToAdd) {
    cell.classList.add(classToAdd);
}

function swapTurns() {
    currentClass = currentClass === X_CLASS ? O_CLASS : X_CLASS;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    board.classList.remove(X_CLASS);
    board.classList.remove(O_CLASS);
    board.classList.add(currentClass);
    statusElement.textContent = `${currentPlayer}'s turn`;
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass);
        });
    });
}

function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

function endGame(draw) {
    if (draw) {
        statusElement.textContent = "It's a draw!";
        drawSound.play();
    } else {
        statusElement.textContent = `${currentPlayer} wins!`;
        winSound.play();
        const winningCombination = WINNING_COMBINATIONS.find(combination => {
            return combination.every(index => {
                return cellElements[index].classList.contains(currentClass);
            });
        });
        winningCombination.forEach(index => {
            cellElements[index].classList.add('winning-cell');
        });
    }
    cellElements.forEach(cell => {
        cell.removeEventListener('click', handleClick);
    });
}

function makeAIMove() {
    let bestScore = -Infinity;
    let bestMove;
    const availableMoves = [...cellElements].filter(cell => !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS));

    for (let i = 0; i < availableMoves.length; i++) {
        const cell = availableMoves[i];
        cell.classList.add(O_CLASS);
        const score = minimax(cellElements, 0, false, -Infinity, Infinity);
        cell.classList.remove(O_CLASS);
        if (score > bestScore) {
            bestScore = score;
            bestMove = cell;
        }
    }

    if (bestMove) {
        setTimeout(() => {
            placeMark(bestMove, O_CLASS);
            placeSound.play();
            if (checkWin(O_CLASS)) {
                endGame(false);
            } else if (isDraw()) {
                endGame(true);
            } else {
                swapTurns();
            }
        }, 500);
    }
}

function minimax(board, depth, isMaximizing, alpha, beta) {
    if (checkWin(O_CLASS)) return 1;
    if (checkWin(X_CLASS)) return -1;
    if (isDraw()) return 0;

    const maxDepth = getAIDifficultyDepth();
    if (depth >= maxDepth) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < cellElements.length; i++) {
            if (!cellElements[i].classList.contains(X_CLASS) && !cellElements[i].classList.contains(O_CLASS)) {
                cellElements[i].classList.add(O_CLASS);
                const score = minimax(board, depth + 1, false, alpha, beta);
                cellElements[i].classList.remove(O_CLASS);
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < cellElements.length; i++) {
            if (!cellElements[i].classList.contains(X_CLASS) && !cellElements[i].classList.contains(O_CLASS)) {
                cellElements[i].classList.add(X_CLASS);
                const score = minimax(board, depth + 1, true, alpha, beta);
                cellElements[i].classList.remove(X_CLASS);
                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    }
}

function getAIDifficultyDepth() {
    switch (aiDifficulty) {
        case 'easy':
            return 1;
        case 'medium':
            return 3;
        case 'hard':
            return 5;
        case 'impossible':
            return Infinity;
        default:
            return 3;
    }
}

startGame();
