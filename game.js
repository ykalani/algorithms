const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 16;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 20;
const BALL_SIZE = 16;

// Game state
let leftPaddle = {
    x: PADDLE_MARGIN,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};

let rightPaddle = {
    x: WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};

let ball = {
    x: WIDTH / 2 - BALL_SIZE / 2,
    y: HEIGHT / 2 - BALL_SIZE / 2,
    vx: 6 * (Math.random() > 0.5 ? 1 : -1),
    vy: 4 * (Math.random() > 0.5 ? 1 : -1),
    width: BALL_SIZE,
    height: BALL_SIZE
};

// AI parameters
const AI_SPEED = 4;

// Mouse control
canvas.addEventListener('mousemove', function (evt) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = evt.clientY - rect.top;
    leftPaddle.y = mouseY - leftPaddle.height / 2;

    // Clamp paddle inside canvas
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y + leftPaddle.height > HEIGHT) leftPaddle.y = HEIGHT - leftPaddle.height;
});

// Collision detection
function intersects(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Net
    ctx.fillStyle = "#444";
    for (let y = 0; y < HEIGHT; y += 32) {
        ctx.fillRect(WIDTH / 2 - 2, y, 4, 16);
    }

    // Left paddle
    ctx.fillStyle = "#fff";
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);

    // Right paddle
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Ball
    ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
}

// Update game state
function update() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce off top/bottom
    if (ball.y < 0) {
        ball.y = 0;
        ball.vy *= -1;
    } else if (ball.y + ball.height > HEIGHT) {
        ball.y = HEIGHT - ball.height;
        ball.vy *= -1;
    }

    // Left paddle collision
    if (intersects(ball, leftPaddle)) {
        ball.x = leftPaddle.x + leftPaddle.width;
        ball.vx *= -1.08;
        // Add some vertical randomness
        ball.vy += (Math.random() - 0.5) * 4;
    }

    // Right paddle collision
    if (intersects(ball, rightPaddle)) {
        ball.x = rightPaddle.x - ball.width;
        ball.vx *= -1.08;
        ball.vy += (Math.random() - 0.5) * 4;
    }

    // Score check (reset ball)
    if (ball.x < 0 || ball.x > WIDTH) {
        // Reset ball to center
        ball.x = WIDTH / 2 - BALL_SIZE / 2;
        ball.y = HEIGHT / 2 - BALL_SIZE / 2;
        ball.vx = 6 * (Math.random() > 0.5 ? 1 : -1);
        ball.vy = 4 * (Math.random() > 0.5 ? 1 : -1);
    }

    // AI for right paddle
    if (ball.vx > 0) { // Ball moving towards AI
        if (ball.y + ball.height / 2 > rightPaddle.y + rightPaddle.height / 2) {
            rightPaddle.y += AI_SPEED;
        } else if (ball.y + ball.height / 2 < rightPaddle.y + rightPaddle.height / 2) {
            rightPaddle.y -= AI_SPEED;
        }
    } else {
        // Center paddle when ball is moving away
        let centerY = HEIGHT / 2 - rightPaddle.height / 2;
        if (rightPaddle.y < centerY) rightPaddle.y += AI_SPEED / 2;
        else if (rightPaddle.y > centerY) rightPaddle.y -= AI_SPEED / 2;
    }

    // Clamp AI paddle inside canvas
    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y + rightPaddle.height > HEIGHT) rightPaddle.y = HEIGHT - rightPaddle.height;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();