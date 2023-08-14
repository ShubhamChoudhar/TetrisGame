const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const shapes = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 1, 0]]
];
let currentShape;
let currentPosition;
let nextShape;
let gameInterval;
let gameSpeed = 500;
let isPaused = false;
const colors = [
    "#FF0D72", "#0DC2FF", "#0DFF72", "#F538FF", 
    "#FF8E0D", "#FFE138", "#3877FF"
];

let highScore = localStorage.getItem('highScore') || 0;
let level = 1;

function drawNextShape() {
    const nextCanvas = document.getElementById("nextCanvas");
    const nextCtx = nextCanvas.getContext("2d");
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    for (let y = 0; y < nextShape.length; y++) {
        for (let x = 0; x < nextShape[y].length; x++) {
            if (nextShape[y][x]) {
                nextCtx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                nextCtx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function updateGameSpeed() {
    gameSpeed = 500 - (level - 1) * 50;
    if (gameSpeed < 50) gameSpeed = 50;  // Limit the speed

    clearInterval(gameInterval);
    gameInterval = setInterval(update, gameSpeed);
}

function togglePause() {
    console.log("Toggle Pause triggered");
    if (isPaused) {
        gameInterval = setInterval(update, gameSpeed);
        isPaused = false;
    } else {
        clearInterval(gameInterval);
        isPaused = true;
    }
}

function spawnShape() {
    currentShape = nextShape || shapes[Math.floor(Math.random() * shapes.length)];
    nextShape = shapes[Math.floor(Math.random() * shapes.length)];
    drawNextShape();
    currentPosition = { x: Math.floor(COLS / 2) - 1, y: 0 };
}

function drawBlock(x, y) {
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y);
            }
        }
    }
}

function reset() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    spawnShape();
}

function spawnShape() {
    currentShape = shapes[Math.floor(Math.random() * shapes.length)];
    currentPosition = { x: Math.floor(COLS / 2) - 1, y: 0 };
}

function moveShape(dx, dy) {
    let canMove = true;
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                let newX = currentPosition.x + x + dx;
                let newY = currentPosition.y + y + dy;
                if (newX < 0 || newX >= COLS || newY >= ROWS || board[newY][newX]) {
                    canMove = false;
                }
            }
        }
    }

    if (canMove) {
        currentPosition.x += dx;
        currentPosition.y += dy;
    } else if (dy === 1) {
        mergeShape();
        spawnShape();
    }
}

function mergeShape() {
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                board[currentPosition.y + y][currentPosition.x + x] = 1;
            }
        }
    }
}

function update() {
    drawBoard();
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                drawBlock(currentPosition.x + x, currentPosition.y + y);
            }
        }
    }

    moveShape(0, 1);
}

reset();
setInterval(update, 500);

let score = 0;

function rotateShape() {
    const newShape = [];
    for (let x = 0; x < currentShape[0].length; x++) {
        newShape[x] = [];
        for (let y = 0; y < currentShape.length; y++) {
            newShape[x][y] = currentShape[currentShape.length - 1 - y][x];
        }
    }
    if (!collision(newShape, currentPosition)) {
        currentShape = newShape;
    }
}

function collision(shape, position) {
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                let newX = position.x + x;
                let newY = position.y + y;
                if (newX < 0 || newX >= COLS || newY >= ROWS || board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function clearLines() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            score += 100;
            y++;
        }
    }
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    level = Math.floor(score / 1000) + 1;
}

function checkGameOver() {
    for (let x = 0; x < COLS; x++) {
        if (board[0][x]) {
            return true;
        }
    }
    return false;
}

function update() {
    drawBoard();
    let color = colors[shapes.indexOf(currentShape)];
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                drawBlock(currentPosition.x + x, currentPosition.y + y, color);
            }
        }
    }

    moveShape(0, 1);
    clearLines();

    if (checkGameOver()) {
        alert(`Game Over! Your score is: ${score}`);
        reset();
    }

    updateGameSpeed();
}

// Listen for arrow keys to move and rotate the shape
document.addEventListener('keydown', function (event) {
    if (event.keyCode === 37) {  // Left arrow
        moveShape(-1, 0);
    } else if (event.keyCode === 39) {  // Right arrow
        moveShape(1, 0);
    } else if (event.keyCode === 40) {  // Down arrow
        moveShape(0, 1);
    } else if (event.keyCode === 38) {  // Up arrow
        rotateShape();
    }
});

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function testClick() {
    console.log("Button was clicked!");
}

// Start and Pause button functionality
togglePause();
document.getElementById("toggleButton").addEventListener("click", togglePause());
document.getElementById("highScoreDisplay").innerText = highScore;
document.getElementById("levelDisplay").innerText = level;

reset();
gameInterval = setInterval(update, gameSpeed);
