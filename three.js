const cells = document.querySelectorAll(".cell");
const statusText = document.querySelector("#statusText");
const restartBtn = document.querySelector("#restartBtn");
const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
let options = ["", "", "", "", "", "", "", "", ""];
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
        const [a, b, c] = condition;
        if (options[a] && options[a] === options[b] && options[a] === options[c]) {
            statusText.textContent = `${currentPlayer} wins!`;
            running = false;
            return;
        }
    }

    if (!options.includes("")) {
        statusText.textContent = `Draw!`;
        running = false;
    } else {
        changePlayer();
    }
}

function restartGame() {
    currentPlayer = "X";
    options.fill("");
    statusText.textContent = `${currentPlayer}'s turn`;
    cells.forEach(cell => (cell.textContent = ""));
    running = true;
}

function aiMove() {
    const bestMove = minimax(options, "O").index;
    const cell = cells[bestMove];
    updateCell(cell, bestMove);
    checkWinner();
}

function minimax(board, player) {
    const emptyCells = board.map((v, i) => (v === "" ? i : null)).filter(i => i !== null);

    if (checkWin(board, "X")) return { score: -10 };
    if (checkWin(board, "O")) return { score: 10 };
    if (emptyCells.length === 0) return { score: 0 };

    const moves = [];
    for (const index of emptyCells) {
        const move = { index };
        board[index] = player;

        const result = minimax(board, player === "O" ? "X" : "O");
        move.score = result.score;

        board[index] = "";
        moves.push(move);
    }

    return moves.reduce((best, move) => {
        if ((player === "O" && move.score > best.score) || (player === "X" && move.score < best.score)) {
            return move;
        }
        return best;
    }, { score: player === "O" ? -Infinity : Infinity });
}

function checkWin(board, player) {
    return winConditions.some(([a, b, c]) => board[a] === player && board[b] === player && board[c] === player);
}

