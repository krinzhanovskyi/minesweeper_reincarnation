const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const minesCountEl = document.getElementById("mines-count");
const timerEl = document.getElementById("timer");
const restartBtn = document.getElementById("restart-btn");
const difficultySelect = document.getElementById("difficulty-select");

let board = null;
let gameOver = false;

const timer = new Timer((sec) => {
  timerEl.textContent = String(sec).padStart(3, "0");
});

function startGame() {
  const { rows, cols, mines } = DIFFICULTIES[difficultySelect.value];
  board = new Board(rows, cols, mines);
  gameOver = false;

  timer.reset();
  updateMinesCounter();
  setStatus("In progress", false);

  renderBoard(rows, cols);
}

function renderBoard(rows, cols) {
  boardEl.style.setProperty("--cols", cols);
  boardEl.innerHTML = "";

  const fragment = document.createDocumentFragment();

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cellEl = document.createElement("div");
      cellEl.className = "cell";
      cellEl.dataset.x = x;
      cellEl.dataset.y = y;
      fragment.appendChild(cellEl);
    }
  }

  boardEl.appendChild(fragment);
}

function getCellElement(x, y) {
  return boardEl.children[y * board.cols + x];
}

function syncCells(cells) {
  for (const cell of cells) {
    const el = getCellElement(cell.x, cell.y);
    el.classList.add("revealed");

    if (cell.isMine) {
      el.classList.add("mine");
      el.textContent = "💣";
    } else if (cell.neighborMines > 0) {
      el.textContent = cell.neighborMines;
      el.dataset.mines = cell.neighborMines;
    }
  }
}

function revealAllMines() {
  for (let y = 0; y < board.rows; y++) {
    for (let x = 0; x < board.cols; x++) {
      const cell = board.grid[y][x];
      if (cell.isMine && !cell.isFlagged) {
        const el = getCellElement(x, y);
        el.classList.add("revealed", "mine");
        el.textContent = "💣";
      }
    }
  }
}

function handleActionResult({ hitMine, changed }) {
  if (changed.length === 0) return;

  timer.start();
  syncCells(changed);

  if (hitMine) {
    gameOver = true;
    timer.stop();
    revealAllMines();
    setStatus("Поражение!", true);
    return;
  }

  if (board.isWin()) {
    gameOver = true;
    timer.stop();
    setStatus("Победа!", false);
  }
}

function updateMinesCounter() {
  minesCountEl.textContent = board.totalMines - board.flagsCount;
}

function setStatus(text, isLost) {
  statusEl.textContent = text;
  statusEl.classList.toggle("lost", isLost);
}

// Event delegation for left click (reveal or chord)
boardEl.addEventListener("click", (e) => {
  if (gameOver) return;
  const cellEl = e.target.closest(".cell");
  if (!cellEl) return;

  const x = Number(cellEl.dataset.x);
  const y = Number(cellEl.dataset.y);
  const cell = board.grid[y][x];

  const result = cell.isRevealed ? board.chord(x, y) : board.reveal(x, y);
  handleActionResult(result);
});

// Event delegation for right click (flagging)
boardEl.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (gameOver) return;

  const cellEl = e.target.closest(".cell");
  if (!cellEl) return;

  const x = Number(cellEl.dataset.x);
  const y = Number(cellEl.dataset.y);
  const updated = board.toggleFlag(x, y);

  if (updated) {
    cellEl.classList.toggle("flag", updated.isFlagged);
    cellEl.textContent = updated.isFlagged ? "🚩" : "";
    updateMinesCounter();
  }
});

restartBtn.addEventListener("click", startGame);
difficultySelect.addEventListener("change", startGame);

startGame();
