// In-memory highscore list. Rules: no persistence, resets on reload.

const scores = [];

function addHighscore(name1, name2, score) {
  scores.push({ names: `${name1} & ${name2}`, score });
  scores.sort((a, b) => b.score - a.score);
  if (scores.length > 10) scores.length = 10;
}

function renderHighscores(listEl) {
  listEl.innerHTML = "";
  if (scores.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No games played yet.";
    listEl.appendChild(li);
    return;
  }
  for (const entry of scores) {
    const li = document.createElement("li");
    const names = document.createElement("span");
    names.className = "names";
    names.textContent = entry.names;
    const pts = document.createElement("span");
    pts.className = "pts";
    pts.textContent = entry.score;
    li.append(names, pts);
    listEl.appendChild(li);
  }
}
