(() => {
  const size = 8;
  const moves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  const scoreKey = 'standaloneKnightsTourBestScores';
  let position;
  let visited;
  let startTime;
  let timerId;
  let finished;
  let hintTimeout;
  let scores = loadScores();

  function loadScores() {
    try {
      const saved = JSON.parse(localStorage.getItem(scoreKey) || '[]');
      return Array.isArray(saved) ? saved.filter(Number.isFinite).slice(0, 5) : [];
    } catch {
      return [];
    }
  }

  function key([row, column]) { return `${row},${column}`; }

  function possibleMoves(from = position) {
    return moves
      .map(([rowDelta, columnDelta]) => [from[0] + rowDelta, from[1] + columnDelta])
      .filter(([row, column]) => row >= 0 && row < size && column >= 0 && column < size && !visited.has(key([row, column])));
  }

  function newGame() {
    clearInterval(timerId);
    clearTimeout(hintTimeout);
    position = [0, 0];
    visited = new Map([[key(position), 1]]);
    startTime = Date.now();
    finished = false;
    document.getElementById('status').textContent = '';
    updateTimer();
    timerId = setInterval(updateTimer, 1000);
    renderBoard();
  }

  function updateTimer() {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').textContent = `Time: ${seconds}s`;
  }

  function play(row, column) {
    if (finished || !possibleMoves().some(([r, c]) => r === row && c === column)) return;
    position = [row, column];
    visited.set(key(position), visited.size + 1);
    renderBoard();
    if (visited.size === size * size) {
      finished = true;
      clearInterval(timerId);
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      scores = [...scores, seconds].sort((a, b) => a - b).slice(0, 5);
      try { localStorage.setItem(scoreKey, JSON.stringify(scores)); } catch { /* Scores are optional. */ }
      renderScores();
      document.getElementById('status').textContent = `Tour complete in ${seconds} seconds.`;
    } else if (possibleMoves().length === 0) {
      finished = true;
      clearInterval(timerId);
      document.getElementById('status').textContent = 'No legal moves remain. Start a new game to try again.';
    }
  }

  function renderBoard() {
    const board = document.getElementById('board');
    const available = possibleMoves();
    board.replaceChildren();
    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = `cell ${(row + column) % 2 ? 'dark' : 'light'}`;
        const cellKey = key([row, column]);
        if (visited.has(cellKey)) {
          cell.classList.add('visited');
          const number = document.createElement('span');
          number.className = 'move-number';
          number.textContent = visited.get(cellKey);
          cell.appendChild(number);
        }
        if (position[0] === row && position[1] === column) {
          cell.classList.add('current');
          cell.setAttribute('aria-label', `Knight at row ${row + 1}, column ${column + 1}`);
          const knight = document.createElement('span');
          knight.className = 'knight';
          knight.textContent = '\u265e';
          cell.appendChild(knight);
        } else {
          cell.setAttribute('aria-label', `Row ${row + 1}, column ${column + 1}${available.some(([r, c]) => r === row && c === column) ? ', legal move' : ''}`);
        }
        if (available.some(([r, c]) => r === row && c === column)) cell.classList.add('possible-move');
        cell.disabled = finished || visited.has(cellKey);
        cell.addEventListener('click', () => play(row, column));
        board.appendChild(cell);
      }
    }
    renderScores();
  }

  function renderScores() {
    const list = document.getElementById('bestScores');
    list.replaceChildren();
    if (scores.length === 0) {
      const empty = document.createElement('li');
      empty.textContent = 'No completed tours yet';
      list.appendChild(empty);
      return;
    }
    scores.slice(0, 5).forEach(seconds => {
      const item = document.createElement('li');
      item.textContent = `${seconds} seconds`;
      list.appendChild(item);
    });
  }

  function showHint() {
    if (finished) return;
    const choices = possibleMoves();
    if (!choices.length) return;
    const best = choices.reduce((currentBest, candidate) =>
      possibleMoves(candidate).length < possibleMoves(currentBest).length ? candidate : currentBest
    );
    const index = best[0] * size + best[1];
    const cell = document.getElementById('board').children[index];
    cell.classList.add('hinted');
    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => cell.classList.remove('hinted'), 900);
  }

  document.getElementById('resetGame').addEventListener('click', newGame);
  document.getElementById('showHint').addEventListener('click', showHint);
  newGame();
})();
