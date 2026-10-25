(() => {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
  const colorNames = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'];
  const codeLength = 4;
  const maxGuesses = 5;
  const board = document.getElementById('board');
  const palette = document.getElementById('colorPalette');
  const secretDisplay = document.getElementById('secretCode');
  let secret = [];
  let currentGuess = [];
  let guesses = 0;
  let finished = false;

  function renderBoard() {
    board.replaceChildren();
    for (let rowIndex = 0; rowIndex < maxGuesses; rowIndex++) {
      const row = document.createElement('div');
      row.className = 'guess-row';
      row.dataset.row = rowIndex;
      const pegs = document.createElement('div');
      pegs.className = 'pegs';
      for (let column = 0; column < codeLength; column++) {
        const peg = document.createElement('span');
        peg.className = 'peg empty';
        pegs.appendChild(peg);
      }
      const feedback = document.createElement('div');
      feedback.className = 'feedback';
      for (let pin = 0; pin < codeLength; pin++) {
        const dot = document.createElement('span');
        dot.className = 'pin';
        feedback.appendChild(dot);
      }
      row.append(pegs, feedback);
      board.appendChild(row);
    }
    updateActiveRow();
  }

  function renderPalette() {
    palette.replaceChildren();
    colors.forEach((color, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'color-btn';
      button.style.backgroundColor = color;
      button.setAttribute('aria-label', colorNames[index]);
      button.title = colorNames[index];
      button.addEventListener('click', () => {
        if (finished || currentGuess.length === codeLength) return;
        currentGuess.push(index);
        updateCurrentRow();
      });
      palette.appendChild(button);
    });
  }

  function updateActiveRow() {
    board.querySelectorAll('.guess-row').forEach((row, index) => {
      row.classList.toggle('active', !finished && index === guesses);
    });
  }

  function updateCurrentRow() {
    const pegs = board.querySelectorAll('.guess-row')[guesses]?.querySelectorAll('.peg');
    if (!pegs) return;
    pegs.forEach((peg, index) => {
      peg.classList.toggle('empty', index >= currentGuess.length);
      peg.style.backgroundColor = currentGuess[index] === undefined ? '' : colors[currentGuess[index]];
    });
  }

  function calculateFeedback(guess) {
    const remaining = [...secret];
    const unmatched = [];
    let exact = 0;
    let misplaced = 0;
    guess.forEach((color, index) => {
      if (color === remaining[index]) {
        exact++;
        remaining[index] = -1;
      } else {
        unmatched.push(color);
      }
    });
    unmatched.forEach(color => {
      const index = remaining.indexOf(color);
      if (index !== -1) {
        misplaced++;
        remaining[index] = -1;
      }
    });
    return { exact, misplaced };
  }

  function submitGuess() {
    if (finished) return;
    if (currentGuess.length !== codeLength) {
      showMessage('Choose four colors before submitting.', 'warning');
      return;
    }
    const feedback = calculateFeedback(currentGuess);
    const row = board.querySelectorAll('.guess-row')[guesses];
    const pins = row.querySelectorAll('.pin');
    for (let index = 0; index < feedback.exact; index++) pins[index].classList.add('black');
    for (let index = 0; index < feedback.misplaced; index++) pins[feedback.exact + index].classList.add('white');
    guesses++;
    document.getElementById('guessCount').textContent = `${guesses} / ${maxGuesses}`;

    if (feedback.exact === codeLength) {
      finish(`Code cracked in ${guesses} ${guesses === 1 ? 'guess' : 'guesses'}!`, 'success');
    } else if (guesses === maxGuesses) {
      finish(`No guesses left. The code was ${secret.map(index => colorNames[index]).join(', ')}.`, 'error');
    } else {
      currentGuess = [];
      updateActiveRow();
      showMessage(`${feedback.exact} exact, ${feedback.misplaced} misplaced.`, '');
    }
  }

  function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
  }

  function finish(text, type) {
    finished = true;
    secretDisplay.replaceChildren(...secret.map(index => {
      const peg = document.createElement('span');
      peg.className = 'code-peg';
      peg.style.backgroundColor = colors[index];
      peg.setAttribute('aria-label', colorNames[index]);
      return peg;
    }));
    secretDisplay.classList.add('revealed');
    updateActiveRow();
    showMessage(text, type);
  }

  function newGame() {
    secret = Array.from({ length: codeLength }, () => Math.floor(Math.random() * colors.length));
    currentGuess = [];
    guesses = 0;
    finished = false;
    secretDisplay.replaceChildren(...Array.from({ length: codeLength }, () => {
      const peg = document.createElement('span');
      peg.className = 'code-peg hidden';
      peg.textContent = '?';
      return peg;
    }));
    secretDisplay.classList.remove('revealed');
    document.getElementById('guessCount').textContent = `0 / ${maxGuesses}`;
    showMessage('', '');
    renderBoard();
    renderPalette();
  }

  document.getElementById('submitGuess').addEventListener('click', submitGuess);
  document.getElementById('undoColor').addEventListener('click', () => {
    if (!finished) currentGuess.pop();
    updateCurrentRow();
  });
  document.getElementById('clearGuess').addEventListener('click', () => {
    if (!finished) currentGuess = [];
    updateCurrentRow();
  });
  document.getElementById('newGame').addEventListener('click', newGame);
  newGame();
})();
