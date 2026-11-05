// Simple 2D renderer using canvas. Draws court, net, players (boxes) and ball (sphere).

const BILD_ENDUNGEN = ["png", "jpeg", "jpg", "webp", "gif"];

let player1Sprite = null;
let player1SpriteDone = false;

let player2Sprite = null;
let player2SpriteDone = false;

let hintergrundBildDone = false;

const spriteReadyCallbacks = [];

function ladeErstesBild(stammname, beimFertig) {
  let index = 0;

  function versucheNaechstes() {
    if (index >= BILD_ENDUNGEN.length) {
      beimFertig(null, null);
      return;
    }

    const endung = BILD_ENDUNGEN[index++];
    const dateiName = `${stammname}.${endung}`;
    const bild = new Image();

    bild.onload = () => {
      beimFertig(bild, dateiName);
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

function wennBilderFertig(callback) {
  if (alleBilderFertig()) {
    callback();
    return;
  }
  spriteReadyCallbacks.push(callback);
}

function drawRoundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

ladeErstesBild("player1", (bild) => {
  player1Sprite = bild;
  player1SpriteDone = true;
  flushSpriteReadyCallbacks();
});

ladeErstesBild("player2", (bild) => {
  player2Sprite = bild;
  player2SpriteDone = true;
  flushSpriteReadyCallbacks();
});

ladeErstesBild("hintergrund", (bild, dateiName) => {
  const canvasElement = document.getElementById("game");
  if (bild && canvasElement) {
    canvasElement.style.backgroundImage = `url("${dateiName}")`;
    canvasElement.style.backgroundPosition = "center center";
    canvasElement.style.backgroundRepeat = "no-repeat";
    canvasElement.style.backgroundSize = "contain";
  }
  hintergrundBildDone = true;
  flushSpriteReadyCallbacks();
});

function draw(ctx, state) {
  const { width, height, players, ball } = state;

  ctx.clearRect(0, 0, width, height);

  // Players (boxes)
  for (const p of players) {
    const shouldUsePlayer1Sprite = p.seite === "links";
    const shouldUsePlayer2Sprite = p.seite === "rechts";

    if (shouldUsePlayer1Sprite && player1Sprite) {
      ctx.drawImage(player1Sprite, p.x, p.y, p.width, p.height);
    } else if (shouldUsePlayer2Sprite && player2Sprite) {
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
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (const p of players) {
    const labelText = p.name;
    const textWidth = ctx.measureText(labelText).width;
    const padX = 10;
    const pillHeight = 26;
    const pillWidth = textWidth + padX * 2;
    const pillX = p.x + p.width / 2 - pillWidth / 2;
    const pillY = p.y - pillHeight - 10;

    ctx.fillStyle =
      p.seite === "links" ? "rgba(224,122,58,0.92)" : "rgba(41,98,255,0.92)";
    drawRoundedRectPath(ctx, pillX, pillY, pillWidth, pillHeight, 13);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.fillText(labelText, pillX + padX, pillY + pillHeight / 2);
  }
}
