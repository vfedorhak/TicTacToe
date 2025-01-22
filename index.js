const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector("#statusText");
const restartBtn = document.querySelector("#restartBtn");

const winConditions = [
    // Горизонтальні лінії
    [0, 1, 2, 3],
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [6, 7, 8, 9],
    [10, 11, 12, 13],
    [11, 12, 13, 14],
    [15, 16, 17, 18],
    [16, 17, 18, 19],
    [20, 21, 22, 23],
    [21, 22, 23, 24],

    // Вертикальні лінії
    [0, 5, 10, 15],
    [1, 6, 11, 16],
    [2, 7, 12, 17],
    [3, 8, 13, 18],
    [4, 9, 14, 19],
    [5, 10, 15, 20],
    [6, 11, 16, 21],
    [7, 12, 17, 22],
    [8, 13, 18, 23],
    [9, 14, 19, 24],

    // Діагоналі
    [0, 6, 12, 18],
    [6, 12, 18, 24],
    [1, 7, 13, 19],
    [5, 11, 17, 24],
    [15, 11, 7, 3],
    [16, 12, 8, 4],
    [20, 16, 12, 8],
    [21, 17, 13, 9]
];

let options = new Array(25).fill(""); // Ігрова дошка 5x5
let currentPlayer = "X";
let running = false;

initializeGame();

function initializeGame() {
    cells.forEach(cell => cell.addEventListener("click", cellClicked));
    restartBtn.addEventListener("click", restartGame);
    statusText.textContent = `${currentPlayer}'s turn`;
    running = true;
}

function cellClicked() {
    const cellIndex = this.getAttribute("cellIndex");

    if (options[cellIndex] !== "" || !running) return;

    updateCell(this, cellIndex);
    checkWinner();

    if (running && currentPlayer === "O") {
        aiMove();
    }
}

function updateCell(cell, index) {
    options[index] = currentPlayer;
    cell.textContent = currentPlayer;
   
}

function changePlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `${currentPlayer}'s turn`;
}

function checkWinner() {
    for (const condition of winConditions) {
        const [a, b, c, d] = condition;
        if (
            options[a] !== "" &&
            options[a] === options[b] &&
            options[a] === options[c] &&
            options[a] === options[d]
        ) {
            statusText.textContent = `${currentPlayer} wins!`;
            running = false;
            return true;
            restartGame()
        }
    }

    if (!options.includes("")) {
        statusText.textContent = `Draw!`;
        running = false;
        return true;
        restartGame()
    }

    changePlayer();
    return false;
}


function restartGame() {
    currentPlayer = "X";
    options.fill("");
    statusText.textContent = `${currentPlayer}'s turn`;
    cells.forEach(cell => (cell.textContent = ""));
    running = true;
}

function aiMove() {
    if (!running) return;

    const emptyCellsCount = options.filter(cell => cell === "").length;
    const maxDepth = emptyCellsCount > 15 ? 3 : emptyCellsCount > 7 ? 4 : 6;

    // 1. AI перевіряє, чи може виграти (пріоритет №1)
    for (const condition of winConditions) {
        const [a, b, c, d] = condition;
        const line = [options[a], options[b], options[c], options[d]];
        if (line.filter(v => v === "O").length === 3 && line.includes("")) {
            const winIndex = condition.find(i => options[i] === "");
            updateCell(cells[winIndex], winIndex);
            checkWinner();
            return;
        }
    }

    // 2. AI блокує виграш гравця (пріоритет №2)
    for (const condition of winConditions) {
        const [a, b, c, d] = condition;
        const line = [options[a], options[b], options[c], options[d]];
        if (line.filter(v => v === "X").length === 3 && line.includes("")) {
            const blockIndex = condition.find(i => options[i] === "");
            updateCell(cells[blockIndex], blockIndex);
            checkWinner();
            return;
        }
    }

    // 3. AI робить найкращий можливий хід (Minimax)
    const bestMove = minimax(options, "O", 0, maxDepth).index;
    updateCell(cells[bestMove], bestMove);
    checkWinner();
}

function evaluateBoard(board) {
    for (const [a, b, c, d] of winConditions) {
        const line = [board[a], board[b], board[c], board[d]];
        if (line.every(cell => cell === "O")) return 1000;
        if (line.every(cell => cell === "X")) return -1000;
    }

    let score = 0;
    for (const [a, b, c, d] of winConditions) {
        const line = [board[a], board[b], board[c], board[d]];
        const oCount = line.filter(v => v === "O").length;
        const xCount = line.filter(v => v === "X").length;

        if (oCount > 0 && xCount === 0) score += Math.pow(10, oCount);
        if (xCount > 0 && oCount === 0) score -= Math.pow(10, xCount);
    }

    return score;
}

function minimax(board, player, depth = 0, maxDepth = 4, alpha = -Infinity, beta = Infinity) {
    const emptyCells = board.map((v, i) => (v === "" ? i : null)).filter(i => i !== null);

    const boardEval = evaluateBoard(board);
    if (Math.abs(boardEval) >= 1000) return { score: boardEval }; // Прямий виграш/програш
    if (emptyCells.length === 0) return { score: 0 }; // Нічия
    if (depth >= maxDepth) return { score: boardEval }; // Евристична оцінка

    let bestMove = null;

    if (player === "O") {
        let maxEval = -Infinity;
        for (const index of emptyCells) {
            board[index] = "O";
            const eval = minimax(board, "X", depth + 1, maxDepth, alpha, beta).score;
            board[index] = "";
            if (eval > maxEval) {
                maxEval = eval;
                bestMove = index;
            }
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break; // Альфа-бета відсічення
        }
        return { score: maxEval, index: bestMove };
    } else {
        let minEval = Infinity;
        for (const index of emptyCells) {
            board[index] = "X";
            const eval = minimax(board, "O", depth + 1, maxDepth, alpha, beta).score;
            board[index] = "";
            if (eval < minEval) {
                minEval = eval;
                bestMove = index;
            }
            beta = Math.min(beta, eval);
            if (beta <= alpha) break; // Альфа-бета відсічення
        }
        return { score: minEval, index: bestMove };
    }
}