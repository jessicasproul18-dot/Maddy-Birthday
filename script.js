const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const introCatImg = document.getElementById('introCat');
const gameCatImg = document.getElementById('gameCat');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreText = document.getElementById('finalScore');
const initialsInput = document.getElementById('initialsInput');
const leaderboardList = document.getElementById('leaderboardList');
const saveBtn = document.getElementById('saveBtn');

canvas.width = 800;
canvas.height = 400;

let highScores = JSON.parse(localStorage.getItem('maddyHighScores')) || [
    { name: "MDY", score: 500 },
    { name: "CAT", score: 300 },
    { name: "KIT", score: 100 }
];

function updateLeaderboardUI() {
    leaderboardList.innerHTML = highScores.map((e, i) => 
        `<div style="font-weight: bold;">${i+1}. ${e.name} - ${e.score}</div>`
    ).join("");
}

let gameSpeed = 2.5;
let gameActive = false;
let obstacles = [];
let score = 0;
let introActive = true;
let animationId;
let confetti = [];
const confettiColors = ["#ff80ab", "#ff4081", "#00e5ff", "#76ff03", "#ffff00", "#ff3d00"];
let bgDecorations = [];

for(let i = 0; i < 5; i++) {
    bgDecorations.push({
        x: Math.random() * 800, y: Math.random() * 150 + 50,
        size: Math.random() * 20 + 20, speed: Math.random() * 0.5 + 0.2,
        color: ["#ff80ab", "#00e5ff", "#ffff00"][i % 3]
    });
}

// Fixed sizes to match your 100px HTML image
let cat = { x: 50, y: 300, width: 100, height: 100, velocity: 0, gravity: 0.8, jumpStrength: -15, isJumping: false, danceStep: 0 };

function typeMessage() {
    const typewriter = document.getElementById('typewriter');
    const msg = "Happy Birthday Maddy! 🎂";
    let i = 0;
    const interval = setInterval(() => {
        typewriter.innerHTML += msg.charAt(i);
        i++;
        if (i >= msg.length) {
            clearInterval(interval);
            document.getElementById('startButton').style.display = 'inline-block';
        }
    }, 125);
}

function updateGifPosition() {
    introCatImg.style.display = introActive ? 'block' : 'none';
    gameCatImg.style.display = gameActive ? 'block' : 'none';
    const activeImg = introActive ? introCatImg : gameCatImg;
    activeImg.style.left = cat.x + 'px';
    activeImg.style.top = gameActive ? (cat.y - 15) + 'px' : (cat.y - 175) + 'px';
}

function introLoop() {
    if (!introActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); createConfetti(); updateAndDrawConfetti();
    if (cat.x < 175) { cat.x += 3; } else { cat.danceStep += 0.1; cat.y = 300 + Math.sin(cat.danceStep) * 15; }
    updateGifPosition();
    animationId = requestAnimationFrame(introLoop);
}

// Input Fix: Separate handlers
function jump() {
    if (gameActive && !cat.isJumping) {
        cat.velocity = cat.jumpStrength;
        cat.isJumping = true;
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') jump();
});

window.addEventListener('touchstart', (e) => {
    if (gameActive && e.target.id !== 'initialsInput' && e.target.id !== 'saveBtn') {
        jump();
        e.preventDefault();
    }
}, {passive: false});

function spawnObstacle() {
    if (!gameActive) return;
    obstacles.push({ x: canvas.width, y: 320, width: 50, height: 50 });
    setTimeout(spawnObstacle, Math.max(1000, 2000 - (score / 10)));
}

function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    
    gameSpeed += 0.0005; 
    cat.velocity += cat.gravity; 
    cat.y += cat.velocity;
    
    if (cat.y > 300) { cat.y = 300; cat.isJumping = false; cat.velocity = 0; }
    updateGifPosition();

    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];
        o.x -= gameSpeed; 
        drawCake(o.x, o.y, o.width, o.height);

        // Fixed Hitbox Logic
        if (o.x > 30 && o.x < 150) {
            if (cat.x + 30 < o.x + o.width && 
                cat.x + cat.width - 30 > o.x &&
                cat.y + cat.height > o.y + 10) {
                
                gameActive = false;
                cancelAnimationFrame(animationId);
                showGameOver();
                return;
            }
        }
    }
    if (obstacles.length > 0 && obstacles[0].x < -50) obstacles.shift();
    score++;
    animationId = requestAnimationFrame(gameLoop);
}

function showGameOver() {
    finalScoreText.innerText = score;
    updateLeaderboardUI();
    gameOverScreen.style.display = 'block';
}

saveBtn.onclick = function() {
    let name = initialsInput.value.toUpperCase() || "???";
    highScores.push({ name: name.substring(0,3), score: score });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 3);
    localStorage.setItem('maddyHighScores', JSON.stringify(highScores));
    location.reload();
};

document.getElementById('startButton').onclick = function() {
    introActive = false; gameActive = true;
    this.style.display = 'none'; document.getElementById('banner-container').style.display = 'none';
    cat.x = 50; cat.y = 300; spawnObstacle(); gameLoop();
};

function drawCake(x, y, w, h) {
    ctx.fillStyle = "#ff80ab"; ctx.fillRect(x, y + 10, w, h - 10);
    ctx.fillStyle = "#f50057"; ctx.fillRect(x, y + 10, w, 5);
    ctx.fillStyle = "white"; ctx.font = "bold 16px Arial"; ctx.textAlign = "center";
    ctx.fillText("29", x + w/2, y + h - 10);
    ctx.fillStyle = "white"; ctx.fillRect(x + w/2 - 2, y - 5, 4, 15);
    ctx.fillStyle = "yellow"; ctx.beginPath(); ctx.arc(x + w/2, y - 8, 3, 0, Math.PI * 2); ctx.fill();
}
function createConfetti() { if (introActive && confetti.length < 50) { confetti.push({ x: Math.random() * canvas.width, y: -10, size: Math.random() * 8 + 4, color: confettiColors[Math.floor(Math.random() * confettiColors.length)], speed: Math.random() * 3 + 1, angle: Math.random() * 6.28 }); } }
function updateAndDrawConfetti() { confetti.forEach(c => { c.y += c.speed; c.x += Math.sin(c.angle) * 1; ctx.fillStyle = c.color; ctx.fillRect(c.x, c.y, c.size, c.size); if (c.y > canvas.height) { c.y = -10; c.x = Math.random() * canvas.width; } }); }
function drawBackground() { bgDecorations.forEach(bg => { bg.x -= bg.speed; if (bg.x < -50) bg.x = canvas.width + 50; ctx.fillStyle = bg.color; ctx.beginPath(); ctx.ellipse(bg.x, bg.y, bg.size * 0.8, bg.size, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.beginPath(); ctx.moveTo(bg.x, bg.y + bg.size); ctx.lineTo(bg.x, bg.y + bg.size + 20); ctx.stroke(); }); }

typeMessage(); introLoop();
