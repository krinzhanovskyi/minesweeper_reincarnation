class Board {
  constructor(rows, cols, totalMines) {
    this.rows = rows;
    this.cols = cols;
    this.totalMines = totalMines;
    this.grid = [];
    this.minesGenerated = false;
    this.revealedCount = 0;
    this.flagsCount = 0;

    this.initGrid();
  }

  initGrid() {
    this.grid = Array.from({ length: this.rows }, (_, y) =>
      Array.from({ length: this.cols }, (_, x) => ({
        x,
        y,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      })),
    );
  }

  // Generate mines after the first click to guarantee a safe opening
  placeMines(safeX, safeY) {
    let placed = 0;

    while (placed < this.totalMines) {
      const rx = Math.floor(Math.random() * this.cols);
      const ry = Math.floor(Math.random() * this.rows);

      // Keep the clicked cell and its immediate neighbors mine-free
      const isSafeZone = Math.abs(rx - safeX) <= 1 && Math.abs(ry - safeY) <= 1;

      if (!this.grid[ry][rx].isMine && !isSafeZone) {
        this.grid[ry][rx].isMine = true;
        placed++;
      }
    }

    this.calculateNeighbors();
    this.minesGenerated = true;
  }

  calculateNeighbors() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (!this.grid[y][x].isMine) {
          this.grid[y][x].neighborMines = this.getNeighbors(x, y).filter(
            (n) => n.isMine,
          ).length;
        }
      }
    }
  }

  getNeighbors(x, y) {
    const neighbors = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
          neighbors.push(this.grid[ny][nx]);
        }
      }
    }
    return neighbors;
  }

  reveal(x, y) {
    const cell = this.grid[y][x];
    if (cell.isRevealed || cell.isFlagged)
      return { hitMine: false, changed: [] };

    if (!this.minesGenerated) {
      this.placeMines(x, y);
    }

    const changed = [];
    const queue = [cell];

    while (queue.length > 0) {
      const current = queue.pop();
      if (current.isRevealed || current.isFlagged) continue;

      current.isRevealed = true;
      changed.push(current);

      if (current.isMine) {
        return { hitMine: true, changed };
      }

      this.revealedCount++;

      // Flood fill empty areas
      if (current.neighborMines === 0) {
        for (const neighbor of this.getNeighbors(current.x, current.y)) {
          if (!neighbor.isRevealed && !neighbor.isFlagged) {
            queue.push(neighbor);
          }
        }
      }
    }

    return { hitMine: false, changed };
  }

  // Reveal unflagged neighbors if surrounding flags match the cell's number
  chord(x, y) {
    const cell = this.grid[y][x];
    if (!cell.isRevealed || cell.neighborMines === 0) {
      return { hitMine: false, changed: [] };
    }

    const neighbors = this.getNeighbors(x, y);
    const flaggedCount = neighbors.filter((n) => n.isFlagged).length;

    if (flaggedCount !== cell.neighborMines) {
      return { hitMine: false, changed: [] };
    }

    let hitMine = false;
    const allChanged = [];

    for (const neighbor of neighbors) {
      if (!neighbor.isRevealed && !neighbor.isFlagged) {
        const result = this.reveal(neighbor.x, neighbor.y);
        allChanged.push(...result.changed);
        if (result.hitMine) hitMine = true;
      }
    }

    return { hitMine, changed: allChanged };
  }

  toggleFlag(x, y) {
    const cell = this.grid[y][x];
    if (cell.isRevealed) return null;

    cell.isFlagged = !cell.isFlagged;
    this.flagsCount += cell.isFlagged ? 1 : -1;
    return cell;
  }

  isWin() {
    return this.revealedCount === this.rows * this.cols - this.totalMines;
  }
}
