// Main game loop. Wires together input, gameplay logic, physics and rendering.
// Loaded as a classic script so it can run from file:// without a web server.

// --- DOM handles ---
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highscoreListEl = document.getElementById("highscore-list");
const startModal = document.getElementById("start-modal");
const gameoverModal = document.getElementById("gameover-modal");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const name1Input = document.getElementById("name1");
const name2Input = document.getElementById("name2");
const finalScoreEl = document.getElementById("final-score");

// --- World constants ---
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = 480;
const NET_X = WIDTH / 2;
const NET_HEIGHT = 90;
const PLAYER_W = 70;
const PLAYER_H = 60;
const PLAYER_Y = GROUND_Y - PLAYER_H;
const PLAYER1_SCALE = 2;
const PLAYER1_W = PLAYER_W * PLAYER1_SCALE;
const PLAYER1_H = PLAYER_H * PLAYER1_SCALE;
const PLAYER1_Y = GROUND_Y - PLAYER1_H;
const BALL_RADIUS = 14;

// --- State ---
let state = null;
let running = false;
let hitCooldown = 0; // frames until ball can be hit by same paddle again

function createState(name1, name2) {
  return {
    width: WIDTH,
    height: HEIGHT,
    groundY: GROUND_Y,
    netX: NET_X,
    netHeight: NET_HEIGHT,
    score: 0,
    names: [name1, name2],
    players: [
      {
        seite: "links",
        name: name1,
        x: 150,
        y: PLAYER1_Y,
        width: PLAYER1_W,
        height: PLAYER1_H,
        color: "#e07a3a",
      },
      {
        seite: "rechts",
        name: name2,
        x: WIDTH - 220 - PLAYER1_W,
        y: PLAYER1_Y,
        width: PLAYER1_W,
        height: PLAYER1_H,
        color: "#f0f0f0",
      },
    ],
    ball: { x: WIDTH / 2, y: 120, vx: 3, vy: 0, radius: BALL_RADIUS },
  };
}

// --- Physics / collisions (kept out of gameplay.js on purpose) ---

function clampPlayers() {
  const [p1, p2] = state.players;
  // p1 stays on left half
  if (p1.x < 0) p1.x = 0;
  if (p1.x + p1.width > NET_X - 6) p1.x = NET_X - 6 - p1.width;
  // p2 stays on right half
  if (p2.x < NET_X + 6) p2.x = NET_X + 6;
  if (p2.x + p2.width > WIDTH) p2.x = WIDTH - p2.width;
}

function ballHitsPlayer(ball, player) {
  const cx = Math.max(player.x, Math.min(ball.x, player.x + player.width));
  const cy = Math.max(player.y, Math.min(ball.y, player.y + player.height));
  const dx = ball.x - cx;
  const dy = ball.y - cy;
  return dx * dx + dy * dy <= ball.radius * ball.radius;
}

function bounceOffWalls(ball) {
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx);
  }
  if (ball.x + ball.radius > WIDTH) {
    ball.x = WIDTH - ball.radius;
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy);
  }
}

function bounceOffNet(ball) {
  const netTop = GROUND_Y - NET_HEIGHT;
  const netLeft = NET_X - 4;
  const netRight = NET_X + 4;
  if (ball.y + ball.radius < netTop) return;

  const withinX =
    ball.x + ball.radius > netLeft && ball.x - ball.radius < netRight;
  if (!withinX) return;

  if (ball.vx > 0 && ball.x < NET_X) {
    ball.x = netLeft - ball.radius;
    ball.vx = -Math.abs(ball.vx) * 0.7;
  } else if (ball.vx < 0 && ball.x > NET_X) {
    ball.x = netRight + ball.radius;
    ball.vx = Math.abs(ball.vx) * 0.7;
  }
}

// --- Main step ---

function drawCountdownOverlay(text) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#ffcc33";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 6;
  ctx.font = "bold 140px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(text, WIDTH / 2, HEIGHT / 2);
  ctx.fillText(text, WIDTH / 2, HEIGHT / 2);
  ctx.restore();
}

function step() {
  const inputs = getInputs();

  // Movement (delegates SPIELER_TEMPO to gameplay.js)
  if (inputs.p1.left) bewegeSpieler(state.players[0], -1);
  if (inputs.p1.right) bewegeSpieler(state.players[0], +1);
  if (inputs.p2.left) bewegeSpieler(state.players[1], -1);
  if (inputs.p2.right) bewegeSpieler(state.players[1], +1);
  clampPlayers();

  const remainingMs = state.countdownEndsAt - performance.now();

  if (remainingMs > 0) {
    state.ball.vx = 0;
    state.ball.vy = 0;
    draw(ctx, state);
    const secondsLeft = Math.ceil(remainingMs / 1000);
    drawCountdownOverlay(String(secondsLeft));
    clearJustPressed();
    return;
  }

  if (remainingMs > -500) {
    if (state.ball.vx === 0 && state.ball.vy === 0) {
      state.ball.vx = state.initialBallVx;
    }
  }

  // Ball physics
  wendeSchwerkraftAn(state.ball);
  bewegeBall(state.ball);
  begrenzeBallTempo(state.ball);
  bounceOffWalls(state.ball);
  bounceOffNet(state.ball);

  // Paddle collisions
  if (hitCooldown > 0) hitCooldown--;
  if (hitCooldown === 0) {
    for (let i = 0; i < state.players.length; i++) {
      const p = state.players[i];
      if (ballHitsPlayer(state.ball, p)) {
        schlageBall(state.ball, p);
        erhöhePunkte(state);
        hitCooldown = 10;
        // nudge ball above paddle so it doesn't stick
        state.ball.y = p.y - state.ball.radius - 1;
        break;
      }
    }
  }

  // Ground = game over
  if (state.ball.y + state.ball.radius >= GROUND_Y) {
    endGame();
    return;
  }

  scoreEl.textContent = state.score;
  draw(ctx, state);
  if (remainingMs > -500) drawCountdownOverlay("GO!");
  clearJustPressed();
}

function loop() {
  if (!running) return;
  step();
  requestAnimationFrame(loop);
}

function startGame(name1, name2) {
  state = createState(name1 || "P1", name2 || "P2");
  state.countdownEndsAt = performance.now() + 3000;
  state.initialBallVx = state.ball.vx;
  state.ball.vx = 0;
  state.ball.vy = 0;
  hitCooldown = 30;
  scoreEl.textContent = "0";
  startModal.classList.add("hidden");
  gameoverModal.classList.add("hidden");
  draw(ctx, state);
  running = true;
  requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  addHighscore(state.names[0], state.names[1], state.score);
  renderHighscores(highscoreListEl);
  finalScoreEl.textContent = state.score;
  gameoverModal.classList.remove("hidden");
}

// --- Wire up UI ---

renderHighscores(highscoreListEl);
draw(ctx, {
  width: WIDTH,
  height: HEIGHT,
  groundY: GROUND_Y,
  netX: NET_X,
  netHeight: NET_HEIGHT,
  players: [
    {
      seite: "links",
      name: "P1",
      x: 150,
      y: PLAYER1_Y,
      width: PLAYER1_W,
      height: PLAYER1_H,
      color: "#e07a3a",
    },
    {
      seite: "rechts",
      name: "P2",
      x: WIDTH - 220 - PLAYER1_W,
      y: PLAYER1_Y,
      width: PLAYER1_W,
      height: PLAYER1_H,
      color: "#f0f0f0",
    },
  ],
  ball: { x: WIDTH / 2, y: 120, radius: BALL_RADIUS },
});

startBtn.addEventListener("click", () => {
  startGame(name1Input.value.trim(), name2Input.value.trim());
});

restartBtn.addEventListener("click", () => {
  gameoverModal.classList.add("hidden");
  startGame(state.names[0], state.names[1]);
});

// Also allow Enter in the name inputs to start
[name1Input, name2Input].forEach((el) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startBtn.click();
  });
});
