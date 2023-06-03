// get a random integer between the range of [min,max]
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// generate a new tetromino sequence
function generateSequence() {
  const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const tetrominoSequence = [];

  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    tetrominoSequence.push(name);
  }

  return tetrominoSequence;
}

// rotate an NxN matrix 90deg
function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - j][i])
  );

  return result;
}

// check to see if the new matrix/row/col is valid
function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] && (
        // outside the game bounds
        cellCol + col < 0 ||
        cellCol + col >= playfield[0].length ||
        cellRow + row >= playfield.length ||
        // collides with another piece
        playfield[cellRow + row][cellCol + col])
      ) {
        return false;
      }
    }
  }

  return true;
}

// place the tetromino on the playfield
function placeTetromino() {
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        // game over if piece has any part offscreen
        if (tetromino.row + row < 0) {
          return showGameOver();
        }

        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  // check for line clears starting from the bottom and working our way up
  for (let row = playfield.length - 1; row >= 0;) {
    if (playfield[row].every(cell => !!cell)) {
      // drop every row above this one
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r - 1][c];
        }
      }
    } else {
      row--;
    }
  }

  tetromino = getNextTetromino();
}

// show the game over screen
function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;

  context.fillStyle = 'black';
  context.globalAlpha = 0.75;
  context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

  context.globalAlpha = 1;
  context.fillStyle = 'white';
  context.font = '36px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
}

// initialize the playfield with empty cells
function createPlayfield(rows, cols) {
  const playfield = [];
  for (let row = 0; row < rows; row++) {
    playfield[row] = [];
    for (let col = 0; col < cols; col++) {
      playfield[row][col] = 0;
    }
  }
  return playfield;
}

// render the game state
function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  renderPlayfield();
  renderTetromino();
}

// render the playfield
function renderPlayfield() {
  for (let row = 0; row < playfield.length; row++) {
    for (let col = 0; col < playfield[row].length; col++) {
      const cell = playfield[row][col];

      if (cell) {
        context.fillStyle = colors[cell];
        context.fillRect(col * grid, row * grid, grid, grid);
      }
    }
  }
}

// render the active tetromino
function renderTetromino() {
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        context.fillStyle = colors[tetromino.name];
        const x = (tetromino.col + col) * grid;
        const y = (tetromino.row + row) * grid;
        context.fillRect(x, y, grid, grid);
      }
    }
  }
}

// get the next tetromino in the sequence
function getNextTetromino() {
  if (tetrominoSequence.length === 0) {
    tetrominoSequence = generateSequence();
  }

  const name = tetrominoSequence.pop();
  const matrix = tetrominos[name];

  // starting position
  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = name === 'I' ? -1 : -2;

  // return the new tetromino
  return {
    name: name,      // name of the piece (L, O, etc.)
    matrix: matrix,  // the current rotation matrix
    row: row,        // current row (starts offscreen)
    col: col         // current col
  };
}

// move the tetromino down
function moveTetrominoDown() {
  tetromino.row++;

  if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
    tetromino.row--;
    placeTetromino();
  }
}

// move the tetromino left
function moveTetrominoLeft() {
  tetromino.col--;

  if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
    tetromino.col++;
  }
}

// move the tetromino right
function moveTetrominoRight() {
  tetromino.col++;

  if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
    tetromino.col--;
  }
}

// rotate the tetromino
function rotateTetromino() {
  const nextRotation = rotate(tetromino.matrix);
  if (isValidMove(nextRotation, tetromino.row, tetromino.col)) {
    tetromino.matrix = nextRotation;
  }
}

// handle keyboard events
function keyDownListener(event) {
  if (gameOver) return;

  switch (event.code) {
    case 'ArrowUp':
      rotateTetromino();
      break;
    case 'ArrowDown':
      moveTetrominoDown();
      break;
    case 'ArrowLeft':
      moveTetrominoLeft();
      break;
    case 'ArrowRight':
      moveTetrominoRight();
      break;
  }
}

// initialize the game
function init() {
  tetrominoSequence = generateSequence();
  tetromino = getNextTetromino();

  // add event listener for keyboard controls
  document.addEventListener('keydown', keyDownListener);

  // start the game loop
  rAF = requestAnimationFrame(update);
}

// game loop
function update() {
  moveTetrominoDown();

  if (!gameOver) {
    render();
    rAF = requestAnimationFrame(update);
  }
}

// create the canvas and context
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

// set the dimensions of the canvas
const grid = 32;
const rows = 20;
const cols = 10;
canvas.width = grid * cols;
canvas.height = grid * rows;

// append the canvas to the document body
document.body.appendChild(canvas);

// define the colors for the tetrominoes
const colors = {
  'I': '#00FFFF',
  'J': '#0000FF',
  'L': '#FFA500',
  'O': '#FFFF00',
  'S': '#00FF00',
  'T': '#800080',
  'Z': '#FF0000',
};

// define the tetrominoes and their rotations as matrices
const tetrominos = {
  'I': [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  'J': [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'L': [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'O': [
    [1, 1],
    [1, 1],
  ],
  'S': [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  'T': [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'Z': [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

// initialize the playfield
let playfield = createPlayfield(rows, cols);

// initialize game variables
let tetrominoSequence = [];
let tetromino = null;
let rAF = null;
let gameOver = false;

// start the game
init();
