const gameArea = document.getElementById('game-area');
const playerEl = document.getElementById('player');
const scoreEl = document.getElementById('score');
const overlay = document.getElementById('overlay');
const retryBtn = document.getElementById('retry');
const speedEl = document.getElementById('speed');

let player = {
    x: 30,
    y: 0,
    width: 40,
    height: 60,
    vy: 0,
    jumping: false,
    sliding: false
};

let obstacles = [];
let obstacleTimer = 0;
let speed = 4;
let score = 0;
let lastTime = null;
let speedTimer = 0;
let gameOver = false;

function reset() {
    obstacles.forEach(o => o.el.remove());
    obstacles = [];
    player.y = 0;
    player.vy = 0;
    player.jumping = false;
    player.sliding = false;
    playerEl.style.bottom = '10px';
    playerEl.style.height = '60px';
    playerEl.className = 'run';
    obstacleTimer = 0;
    speed = 4;
    score = 0;
    speedTimer = 0;
    lastTime = null;
    gameOver = false;
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
    speedEl.textContent = 'Speed: ' + speed;
    requestAnimationFrame(loop);
}

function spawnObstacle() {
    const el = document.createElement('div');
    el.classList.add('obstacle');
    gameArea.appendChild(el);
    const obs = {
        x: gameArea.clientWidth,
        width: 40,
        height: 60,
        el
    };
    obstacles.push(obs);
}

function updatePlayer(dt) {
    if (player.jumping) {
        player.vy += 0.8; // gravity
        player.y += player.vy;
        if (player.y > 0) {
            player.y = 0;
            player.vy = 0;
            player.jumping = false;
            playerEl.classList.remove('jump');
            playerEl.classList.add('run');
        }
        playerEl.style.bottom = 10 + player.y + 'px';
    }
}

function updateObstacles(dt) {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.x -= speed;
        if (o.x + o.width < 0) {
            o.el.remove();
            obstacles.splice(i, 1);
            continue;
        }
        o.el.style.left = o.x + 'px';
    }
}

function checkCollision() {
    const playerRect = playerEl.getBoundingClientRect();
    for (const o of obstacles) {
        const oRect = o.el.getBoundingClientRect();
        if (playerRect.left < oRect.right &&
            playerRect.right > oRect.left &&
            playerRect.top < oRect.bottom &&
            playerRect.bottom > oRect.top) {
            return true;
        }
    }
    return false;
}

function loop(timestamp) {
    if (gameOver) return;
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    obstacleTimer += dt;
    speedTimer += dt;
    if (obstacleTimer > 1500 / (speed / 4)) {
        spawnObstacle();
        obstacleTimer = 0;
    }
    if (speedTimer > 15000) {
        speed += 1;
        speedTimer = 0;
        speedEl.textContent = 'Speed: ' + speed;
    }

    updatePlayer(dt);
    updateObstacles(dt);

    score += dt * 0.01;
    scoreEl.textContent = 'Score: ' + Math.floor(score);

    if (checkCollision()) {
        gameOver = true;
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        return;
    }

    requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp' && !player.jumping && !player.sliding) {
        player.jumping = true;
        player.vy = -15;
        playerEl.classList.remove('run');
        playerEl.classList.add('jump');
    } else if (e.code === 'ArrowDown' && !player.jumping) {
        player.sliding = true;
        playerEl.style.height = '30px';
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown') {
        player.sliding = false;
        playerEl.style.height = '60px';
    }
});

retryBtn.addEventListener('click', reset);

reset();
