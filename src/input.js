// Keyboard input handling for both players.
// Keeps a set of currently pressed keys and exposes booleans per action.

const pressed = new Set();
const justPressed = new Set();

window.addEventListener(
  "keydown",
  (e) => {
    if (!pressed.has(e.code)) justPressed.add(e.code);
    pressed.add(e.code);

    // Prevent page scroll with arrows / space
    if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(
        e.code,
      )
    ) {
      e.preventDefault();
    }
  },
  { passive: false },
);

window.addEventListener("keyup", (e) => {
  pressed.delete(e.code);
});

function getInputs() {
  return {
    p1: {
      left: pressed.has("KeyA"),
      right: pressed.has("KeyD"),
      shootHeld: pressed.has("KeyW"),
      shootPressed: justPressed.has("KeyW"),
    },
    p2: {
      left: pressed.has("ArrowLeft"),
      right: pressed.has("ArrowRight"),
      shootHeld: pressed.has("ArrowUp"),
      shootPressed: justPressed.has("ArrowUp"),
    },
  };
}

// Call once per frame AFTER inputs have been consumed
function clearJustPressed() {
  justPressed.clear();
}
