(() => {
  const wordLists = {
    animals: ['elephant', 'giraffe', 'penguin', 'dolphin', 'kangaroo', 'butterfly', 'crocodile', 'flamingo'],
    countries: ['australia', 'brazil', 'canada', 'denmark', 'ethiopia', 'france', 'germany', 'jamaica'],
    foods: ['avocado', 'broccoli', 'chocolate', 'doughnut', 'grapefruit', 'lasagna', 'pancakes', 'watermelon'],
    sports: ['basketball', 'volleyball', 'badminton', 'gymnastics', 'swimming', 'cricket', 'football', 'archery'],
    science: ['astronomy', 'biology', 'chemistry', 'evolution', 'genetics', 'molecule', 'telescope', 'velocity']
  };
  const bodyParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
  let word = '';
  let category = '';
  let guessed = new Set();
  let mistakes = 0;
  let wins = 0;
  let losses = 0;
  let finished = false;

  function newGame() {
    const categories = Object.keys(wordLists);
    category = categories[Math.floor(Math.random() * categories.length)];
    const words = wordLists[category];
    word = words[Math.floor(Math.random() * words.length)].toUpperCase();
    guessed = new Set();
    mistakes = 0;
    finished = false;
    document.getElementById('hint').textContent = `Category: ${category[0].toUpperCase()}${category.slice(1)}`;
    document.getElementById('wrongCount').textContent = '0';
    document.getElementById('message').textContent = '';
    bodyParts.forEach(part => { document.getElementById(part).style.opacity = '0'; });
    renderWord();
    renderKeyboard();
  }

  function renderWord(reveal = false) {
    const display = document.getElementById('wordDisplay');
    display.replaceChildren(...[...word].map(letter => {
      const span = document.createElement('span');
      span.className = `letter${guessed.has(letter) ? ' revealed' : ''}${reveal && !guessed.has(letter) ? ' missed' : ''}`;
      span.textContent = guessed.has(letter) || reveal ? letter : '_';
      return span;
    }));
  }

  function renderKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.replaceChildren();
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `key${guessed.has(letter) ? (word.includes(letter) ? ' correct' : ' wrong') : ''}`;
      button.textContent = letter;
      button.disabled = guessed.has(letter) || finished;
      button.addEventListener('click', () => guess(letter));
      keyboard.appendChild(button);
    }
  }

  function guess(letter) {
    if (finished || guessed.has(letter)) return;
    guessed.add(letter);
    if (word.includes(letter)) {
      if ([...word].every(char => guessed.has(char))) {
        renderWord();
        finished = true;
        wins++;
        document.getElementById('wins').textContent = wins;
        showMessage(`You won! The word was ${word}.`, 'win');
      }
    } else {
      mistakes++;
      document.getElementById('wrongCount').textContent = mistakes;
      document.getElementById(bodyParts[mistakes - 1]).style.opacity = '1';
      if (mistakes === bodyParts.length) {
        finished = true;
        losses++;
        document.getElementById('losses').textContent = losses;
        renderWord(true);
        showMessage(`Game over. The word was ${word}.`, 'lose');
      }
    }
    renderKeyboard();
    if (!finished) renderWord();
  }

  function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
  }

  document.getElementById('newGame').addEventListener('click', newGame);
  document.addEventListener('keydown', event => {
    if (/^[a-z]$/i.test(event.key)) guess(event.key.toUpperCase());
  });
  newGame();
})();
