const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const grid = 30;
const tetrominoSequence = [];

// 定义方块形状和颜色
const tetrominos = {
    'I': [
        [1, 1, 1, 1]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
    ],
    'O': [
        [1, 1],
        [1, 1],
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1],
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
    ]
};

const colors = {
    'I': 'cyan',
    'J': 'blue',
    'L': 'orange',
    'O': 'yellow',
    'S': 'green',
    'T': 'purple',
    'Z': 'red'
};

// 初始化游戏状态
let playfield = [];

for (let row = -2; row < 20; row++) {
    playfield[row] = [];
    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }
}

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;  // requestAnimationFrame id
let gameOver = false;
let currentGame = 'tetris'; // Track the current game mode

// 获取下一个方块
function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
        generateSequence();
    }
    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];

    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

    return {
        name: name,
        matrix: matrix,
        row: -2,
        col: col
    };
}

// 生成随机序列
function generateSequence() {
    const names = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    while (names.length) {
        const name = names.splice(Math.floor(Math.random() * names.length), 1)[0];
        tetrominoSequence.push(name);
    }
}

// 碰撞检��
function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                playfield[cellRow + row][cellCol + col])
            ) {
                return false;
            }
        }
    }
    return true;
}

// 旋转矩阵
function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );
    return result;
}

// 将方块固定到场地
function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {
                if (tetromino.row + row < 0) {
                    return showGameOver();
                }
                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
            }
        }
    }
    for (let row = playfield.length - 1; row >= 0; ) {
        if (playfield[row].every(cell => !!cell)) {
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

// 显示游戏结束
function showGameOver() {
    cancelAnimationFrame(rAF);
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('游戏结束', canvas.width / 2, canvas.height / 2);
}

// 游戏循环
function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);

    for (let row = 0; row < playfield.length; row++) {
        for (let col = 0; col < playfield[row].length; col++) {
            if (playfield[row][col]) {
                const name = playfield[row][col];
                context.fillStyle = colors[name];
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }

    if (tetromino) {
        if (++count > 35) {
            tetromino.row++;
            count = 0;
            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino();
            }
        }
        context.fillStyle = colors[tetromino.name];
        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {
                    context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid - 1, grid - 1);
                }
            }
        }
    }
}

// 定义控制函数
function moveLeft() {
    const col = tetromino.col - 1;
    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
    }
}

function moveRight() {
    const col = tetromino.col + 1;
    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
    }
}

function rotateTetromino() {
    let rotated = rotate(tetromino.matrix);
    if (isValidMove(rotated, tetromino.row, tetromino.col)) {
        tetromino.matrix = rotated;
    } else {
        // Define a series of wall kick offsets including vertical shifts
        const wallKicks = [
            { row: 0, col: -1 },
            { row: 0, col: 1 },
            { row: -1, col: 0 },
            { row: -1, col: -1 },
            { row: -1, col: 1 },
            { row: 1, col: 0 },
            { row: 1, col: -1 },
            { row: 1, col: 1 }
        ];

        let rotatedSuccessfully = false;
        for (let kick of wallKicks) {
            if (isValidMove(rotated, tetromino.row + kick.row, tetromino.col + kick.col)) {
                tetromino.matrix = rotated;
                tetromino.row += kick.row;
                tetromino.col += kick.col;
                rotatedSuccessfully = true;
                break;
            }
        }

        if (!rotatedSuccessfully) {
            // Optional: provide feedback or handle rotation failure
            console.log('Rotation failed: No valid wall kick positions found.');
        }
    }
}

function accelerateFall() {
    const row = tetromino.row + 1;
    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row = row - 1;
        placeTetromino();
        return;
    }
    tetromino.row = row;
}

// 处理键盘事件
document.addEventListener('keydown', function(e) {
    if (gameOver) return;
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
        moveLeft();
    } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        moveRight();
    } else if (e.key === 'ArrowUp') { // Removed || e.key === 'Up'
        e.preventDefault(); // Prevent default action
        rotateTetromino();
    } else if (e.key === 'ArrowDown' || e.key === 'Down') {
        accelerateFall();
    }
});

// 添加事件监听器 for on-screen buttons
document.getElementById('leftBtn').addEventListener('click', function() {
    if (!gameOver) {
        moveLeft();
    }
});

document.getElementById('rightBtn').addEventListener('click', function() {
    if (!gameOver) {
        moveRight();
    }
});

document.getElementById('rotateBtn').addEventListener('click', function() {
    if (!gameOver) {
        rotateTetromino();
    }
});

document.getElementById('downBtn').addEventListener('click', function() {
    if (!gameOver) {
        accelerateFall();
    }
});

// Handle Settings Toggle
const toggleControls = document.getElementById('toggleControls');
const mobileControls = document.getElementById('mobileControls');
const body = document.body;

// Initialize the toggle based on saved preference
if (localStorage.getItem('enableControls') === 'true') {
    toggleControls.checked = true;
    mobileControls.style.display = 'flex';
    body.classList.add('enable-controls');
} else {
    toggleControls.checked = false;
    mobileControls.style.display = 'none';
    body.classList.remove('enable-controls');
}

// Listen for toggle changes
toggleControls.addEventListener('change', function() {
    if (this.checked) {
        mobileControls.style.display = 'flex';
        body.classList.add('enable-controls');
        localStorage.setItem('enableControls', 'true');
    } else {
        mobileControls.style.display = 'none';
        body.classList.remove('enable-controls');
        localStorage.setItem('enableControls', 'false');
    }
});

// Function to initialize Tetris
function initTetris() {
    // Existing Tetris initialization code
    playfield = [];
    for (let row = -2; row < 20; row++) {
        playfield[row] = [];
        for (let col = 0; col < 10; col++) {
            playfield[row][col] = 0;
        }
    }
    tetromino = getNextTetromino();
    gameOver = false;
    rAF = requestAnimationFrame(loop);
}

// Function to initialize Breakout
function initBreakout() {
    // Stop any existing game loop
    cancelAnimationFrame(rAF);
    
    // Reset canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Initialize Breakout variables
    breakout = {
        paddleWidth: 100,
        paddleHeight: 20,
        paddleX: (canvas.width - 100) / 2,
        rightPressed: false,
        leftPressed: false,
        ballRadius: 10,
        x: canvas.width / 2,
        y: canvas.height - 30,
        dx: 2,
        dy: -2,
        bricks: [],
        rows: 5,
        cols: 7,
        brickWidth: 75,
        brickHeight: 20,
        padding: 10,
        score: 0
    };
    
    // Create bricks
    for(let c = 0; c < breakout.cols; c++) {
        breakout.bricks[c] = [];
        for(let r = 0; r < breakout.rows; r++) {
            breakout.bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
    
    // Start Breakout game loop
    breakoutLoop();
}

// Breakout game loop
function breakoutLoop() {
    rAF = requestAnimationFrame(breakoutLoop);
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    drawScore();
    
    if(breakout.x + breakout.dx > canvas.width - breakout.ballRadius || breakout.x + breakout.dx < breakout.ballRadius) {
        breakout.dx = -breakout.dx;
    }
    if(breakout.y + breakout.dy < breakout.ballRadius) {
        breakout.dy = -breakout.dy;
    } else if(breakout.y + breakout.dy > canvas.height - breakout.ballRadius) {
        if(breakout.x > breakout.paddleX && breakout.x < breakout.paddleX + breakout.paddleWidth) {
            breakout.dy = -breakout.dy;
        }
        else {
            showGameOver();
        }
    }
    
    breakout.x += breakout.dx;
    breakout.y += breakout.dy;
    
    if(breakout.rightPressed && breakout.paddleX < canvas.width - breakout.paddleWidth) {
        breakout.paddleX += 7;
    }
    else if(breakout.leftPressed && breakout.paddleX > 0) {
        breakout.paddleX -= 7;
    }
}

// Draw Breakout elements
function drawPaddle() {
    context.beginPath();
    context.rect(breakout.paddleX, canvas.height - breakout.paddleHeight, breakout.paddleWidth, breakout.paddleHeight);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
}

function drawBall() {
    context.beginPath();
    context.arc(breakout.x, breakout.y, breakout.ballRadius, 0, Math.PI*2);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
}

function drawBricks() {
    for(let c = 0; c < breakout.cols; c++) {
        for(let r = 0; r < breakout.rows; r++) {
            if(breakout.bricks[c][r].status === 1) {
                let brickX = (c*(breakout.brickWidth + breakout.padding)) + breakout.padding;
                let brickY = (r*(breakout.brickHeight + breakout.padding)) + breakout.padding;
                breakout.bricks[c][r].x = brickX;
                breakout.bricks[c][r].y = brickY;
                context.beginPath();
                context.rect(brickX, brickY, breakout.brickWidth, breakout.brickHeight);
                context.fillStyle = "#0095DD";
                context.fill();
                context.closePath();
            }
        }
    }
}

function collisionDetection() {
    for(let c = 0; c < breakout.cols; c++) {
        for(let r = 0; r < breakout.rows; r++) {
            let b = breakout.bricks[c][r];
            if(b.status === 1) {
                if(breakout.x > b.x && breakout.x < b.x + breakout.brickWidth && breakout.y > b.y && breakout.y < b.y + breakout.brickHeight) {
                    breakout.dy = -breakout.dy;
                    b.status = 0;
                    breakout.score++;
                    if(breakout.score === breakout.rows * breakout.cols) {
                        alert("YOU WIN, CONGRATS!");
                        document.location.reload();
                        cancelAnimationFrame(rAF);
                    }
                }
            }
        }
    }
}

function drawScore() {
    context.font = "16px Arial";
    context.fillStyle = "#0095DD";
    context.fillText("Score: "+breakout.score, 8, 20);
}

// Handle keyboard events for Breakout
function keyDownHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        breakout.rightPressed = true;
    }
    else if(e.key === "Left" || e.key === "ArrowLeft") {
        breakout.leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        breakout.rightPressed = false;
    }
    else if(e.key === "Left" || e.key === "ArrowLeft") {
        breakout.leftPressed = false;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Function to switch games
function switchToTetris() {
    currentGame = 'tetris';
    body.classList.remove('enable-breakout');
    body.classList.add('enable-controls');
    initTetris();
}

function switchToBreakout() {
    currentGame = 'breakout';
    body.classList.add('enable-breakout');
    body.classList.remove('enable-controls');
    initBreakout();
}

// Handle game selection buttons
document.getElementById('playTetrisBtn').addEventListener('click', function() {
    switchToTetris();
});

document.getElementById('playBreakoutBtn').addEventListener('click', function() {
    switchToBreakout();
});

// Initialize Tetris on page load
initTetris();
