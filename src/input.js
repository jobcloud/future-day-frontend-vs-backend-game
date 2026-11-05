// Keyboard input handling for both players.
// Keeps a set of currently pressed keys and exposes booleans per action.

const pressed = new Set();

window.addEventListener(
  "keydown",
  (e) => {
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
    },
    p2: {
      left: pressed.has("ArrowLeft"),
      right: pressed.has("ArrowRight"),
    },
  };
}
