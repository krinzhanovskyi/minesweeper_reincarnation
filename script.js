const BOARD_SIZE = 10;
const MINES_COUNT = 10;
const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const restartBtn = document.getElementById("restart-btn");

let board = [];
let gameOver = false;

restartBtn.addEventListener("click", initGame);

function initGame() {
  boardElement.innerHTML = "";
  statusElement.innerText = "Игра началась!";
  board = [];
  gameOver = false;

  for (let y = 0; y < BOARD_SIZE; y++) {
    const row = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      row.push({
        x,
        y,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
        element: null,
      });
    }
    board.push(row);
  }

  let minesPlaced = 0;
  while (minesPlaced < MINES_COUNT) {
    const rx = Math.floor(Math.random() * BOARD_SIZE);
    const ry = Math.floor(Math.random() * BOARD_SIZE);
    if (!board[ry][rx].isMine) {
      board[ry][rx].isMine = true;
      minesPlaced++;
    }
  }

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (!board[y][x].isMine) {
        board[y][x].neighborMines = countMines(x, y);
      }
    }
  }

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cellData = board[y][x];
      const cellEl = document.createElement("div");
      cellEl.classList.add("cell");

      cellEl.addEventListener("click", () => revealCell(cellData));

      cellEl.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(cellData);
      });

      cellData.element = cellEl;
      boardElement.appendChild(cellEl);
    }
  }
}

function countMines(x, y) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
        if (board[ny][nx].isMine) count++;
      }
    }
  }
  return count;
}

function revealCell(cell) {
  if (gameOver || cell.isRevealed || cell.isFlagged) return;

  cell.isRevealed = true;
  cell.element.classList.add("revealed");

  if (cell.isMine) {
    cell.element.classList.add("mine");
    cell.element.innerText = "💣";
    gameOver = true;
    statusElement.innerText = "Вы проиграли!";
    revealAll();
    return;
  }

  if (cell.neighborMines > 0) {
    cell.element.innerText = cell.neighborMines;
  } else {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = cell.x + dx;
        const ny = cell.y + dy;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          revealCell(board[ny][nx]);
        }
      }
    }
  }
  checkWin();
}

function toggleFlag(cell) {
  if (gameOver || cell.isRevealed) return;
  cell.isFlagged = !cell.isFlagged;
  cell.element.innerText = cell.isFlagged ? "🚩" : "";
  cell.element.classList.toggle("flag", cell.isFlagged);
}

function revealAll() {
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x].isMine) {
        board[y][x].element.classList.add("mine");
        board[y][x].element.innerText = "💣";
      }
    }
  }
}

function checkWin() {
  let revealedCount = 0;
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x].isRevealed) revealedCount++;
    }
  }
  if (revealedCount === BOARD_SIZE * BOARD_SIZE - MINES_COUNT) {
    gameOver = true;
    statusElement.innerText = "Победа!";
  }
}

initGame();
