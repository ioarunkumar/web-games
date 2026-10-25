(() => {
  const size = 9;
  const settings = {
    easy: { removed: 30, hints: 2 },
    medium: { removed: 45, hints: 2 },
    hard: { removed: 55, hints: 1 }
  };
  let puzzle = [];
  let solution = [];
  let difficulty = 'easy';
  let hintsRemaining = 0;
  let startTime = 0;
  let timerId;
  let finished = false;

  function valid(grid, row, column, number) {
    for (let index = 0; index < size; index++) {
      if (index !== column && grid[row][index] === number) return false;
      if (index !== row && grid[index][column] === number) return false;
    }
    const firstRow = Math.floor(row / 3) * 3;
    const firstColumn = Math.floor(column / 3) * 3;
    for (let r = firstRow; r < firstRow + 3; r++) {
      for (let c = firstColumn; c < firstColumn + 3; c++) {
        if ((r !== row || c !== column) && grid[r][c] === number) return false;
      }
    }
    return true;
  }

  function solve(grid) {
    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        if (grid[row][column] !== 0) continue;
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let index = numbers.length - 1; index > 0; index--) {
          const swap = Math.floor(Math.random() * (index + 1));
          [numbers[index], numbers[swap]] = [numbers[swap], numbers[index]];
        }
        for (const number of numbers) {
          if (!valid(grid, row, column, number)) continue;
          grid[row][column] = number;
          if (solve(grid)) return true;
          grid[row][column] = 0;
        }
        return false;
      }
    }
    return true;
  }

  function createPuzzle() {
    solution = Array.from({ length: size }, () => Array(size).fill(0));
    solve(solution);
    puzzle = solution.map(row => [...row]);
    let removed = 0;
    while (removed < settings[difficulty].removed) {
      const row = Math.floor(Math.random() * size);
      const column = Math.floor(Math.random() * size);
      if (puzzle[row][column] !== 0) {
        puzzle[row][column] = 0;
        removed++;
      }
    }
    hintsRemaining = settings[difficulty].hints;
  }

  function renderGrid() {
    const grid = document.getElementById('grid');
    grid.replaceChildren();
    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        const cell = document.createElement('input');
        cell.type = 'text';
        cell.inputMode = 'numeric';
        cell.maxLength = 1;
        cell.className = 'cell';
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `Row ${row + 1}, column ${column + 1}`);
        if (puzzle[row][column]) {
          cell.value = puzzle[row][column];
          cell.readOnly = true;
          cell.classList.add('given');
        }
        cell.dataset.row = row;
        cell.dataset.column = column;
        cell.addEventListener('input', () => {
          cell.value = cell.value.replace(/[^1-9]/g, '').slice(-1);
          const value = Number(cell.value);
          cell.classList.toggle('invalid', Boolean(value) && !valid(readCurrentBoard(), row, column, value));
          checkSolved();
        });
        grid.appendChild(cell);
      }
    }
  }

  function readCurrentBoard() {
    const values = Array.from({ length: size }, () => Array(size).fill(0));
    document.querySelectorAll('#grid .cell').forEach(cell => {
      values[Number(cell.dataset.row)][Number(cell.dataset.column)] = Number(cell.value) || 0;
    });
    return values;
  }

  function checkSolved() {
    const values = readCurrentBoard();
    const complete = values.every((row, rowIndex) => row.every((value, columnIndex) => value === solution[rowIndex][columnIndex]));
    if (!complete) return;
    finished = true;
    clearInterval(timerId);
    document.querySelectorAll('#grid .cell').forEach(cell => { cell.readOnly = true; });
    showMessage(`Puzzle solved in ${document.getElementById('timer').textContent}.`, 'success');
  }

  function showMessage(text, type = '') {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${minutes}:${seconds}`;
  }

  function newGame() {
    clearInterval(timerId);
    finished = false;
    createPuzzle();
    renderGrid();
    showMessage('');
    startTime = Date.now();
    updateTimer();
    timerId = setInterval(updateTimer, 1000);
  }

  function hint() {
    if (finished) return;
    if (hintsRemaining <= 0) {
      showMessage('No hints remaining.');
      return;
    }
    const empty = [...document.querySelectorAll('#grid .cell')].filter(cell => !cell.value);
    if (!empty.length) {
      showMessage('No empty cells to fill.');
      return;
    }
    const cell = empty[Math.floor(Math.random() * empty.length)];
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);
    cell.value = solution[row][column];
    cell.readOnly = true;
    cell.classList.add('given');
    hintsRemaining--;
    showMessage(`Hint used. ${hintsRemaining} remaining.`);
    checkSolved();
  }

  document.querySelectorAll('.difficulty').forEach(button => {
    button.addEventListener('click', () => {
      difficulty = button.dataset.difficulty;
      document.querySelectorAll('.difficulty').forEach(option => option.classList.toggle('selected', option === button));
      newGame();
    });
  });
  document.getElementById('newGame').addEventListener('click', newGame);
  document.getElementById('getHint').addEventListener('click', hint);
  newGame();
})();
