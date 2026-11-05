// Simple 2D renderer using canvas. Draws court, net, players (boxes) and ball (sphere).

const BILD_ENDUNGEN = ["png", "jpeg", "jpg", "webp", "gif"];

let player1Sprite = null;
let player1SpriteReady = false;
let player1SpriteDone = false;

let player2Sprite = null;
let player2SpriteReady = false;
let player2SpriteDone = false;

let hintergrundBildDone = false;

const spriteReadyCallbacks = [];

function ladeErstesBild(stammname, endungen, beiErfolg, beiFertig) {
  let index = 0;

  function versucheNaechstes() {
    if (index >= endungen.length) {
      beiFertig(null, null);
      return;
    }

    const endung = endungen[index++];
    const dateiName = `${stammname}.${endung}`;
    const bild = new Image();

    bild.onload = () => {
      beiErfolg(bild, dateiName);
      beiFertig(bild, dateiName);
    };

    bild.onerror = () => {
      versucheNaechstes();
    };

    bild.src = dateiName;
  }

  versucheNaechstes();
}

function alleBilderFertig() {
  return player1SpriteDone && player2SpriteDone && hintergrundBildDone;
}

function flushSpriteReadyCallbacks() {
  if (!alleBilderFertig()) return;
  while (spriteReadyCallbacks.length > 0) {
    const callback = spriteReadyCallbacks.shift();
    callback();
  }
}

function wennSpielerSpritesBereit(callback) {
  if (alleBilderFertig()) {
    callback();
    return;
  }
  spriteReadyCallbacks.push(callback);
}

ladeErstesBild(
  "player1",
  BILD_ENDUNGEN,
  (bild) => {
    player1Sprite = bild;
    player1SpriteReady = true;
  },
  () => {
    player1SpriteDone = true;
    flushSpriteReadyCallbacks();
  },
);

ladeErstesBild(
  "player2",
  BILD_ENDUNGEN,
  (bild) => {
    player2Sprite = bild;
    player2SpriteReady = true;
  },
  () => {
    player2SpriteDone = true;
    flushSpriteReadyCallbacks();
  },
);

ladeErstesBild(
  "hintergrund",
  BILD_ENDUNGEN,
  (_, dateiName) => {
    const canvasElement = document.getElementById("game");
    if (canvasElement) {
      canvasElement.style.backgroundImage = `url("${dateiName}")`;
      canvasElement.style.backgroundPosition = "center center";
      canvasElement.style.backgroundRepeat = "no-repeat";
      canvasElement.style.backgroundSize = "contain";
    }
  },
  () => {
    hintergrundBildDone = true;
    flushSpriteReadyCallbacks();
  },
);

function draw(ctx, state) {
  const { width, height, groundY, netX, netHeight, players, ball } = state;

  ctx.clearRect(0, 0, width, height);

  // Players (boxes)
  for (const p of players) {
    const shouldUsePlayer1Sprite = p.seite === "links";
    const shouldUsePlayer2Sprite = p.seite === "rechts";

    if (shouldUsePlayer1Sprite && player1SpriteReady) {
      ctx.drawImage(player1Sprite, p.x, p.y, p.width, p.height);
    } else if (shouldUsePlayer2Sprite && player2SpriteReady) {
      ctx.save();
      ctx.translate(p.x + p.width, p.y);
      ctx.scale(-1, 1);
      ctx.drawImage(player2Sprite, 0, 0, p.width, p.height);
      ctx.restore();
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.width, p.height);

      // Racket top highlight
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(p.x, p.y, p.width, 4);
    }
  }

  // Ball (sphere)
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#e8f36b";
  ctx.fill();
  ctx.strokeStyle = "#5f6b1a";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Player name labels
  ctx.fillStyle = "#0e1626";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.textAlign = "center";
  for (const p of players) {
    ctx.fillText(p.name, p.x + p.width / 2, p.y - 8);
  }
}
