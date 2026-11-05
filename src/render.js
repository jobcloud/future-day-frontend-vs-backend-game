// Simple 2D renderer using canvas. Draws court, net, players (boxes) and ball (sphere).

const player1Sprite = new Image();
let player1SpriteReady = false;
player1Sprite.onload = () => {
  player1SpriteReady = true;
};
player1Sprite.src = "player1.png";

const player2Sprite = new Image();
let player2SpriteReady = false;
player2Sprite.onload = () => {
  player2SpriteReady = true;
};
player2Sprite.src = "player2.png";

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
