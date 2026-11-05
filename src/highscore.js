// Interne Highscore-Logik ("hidden").
// Diese Datei verwaltet Speicherung und Rendering.

const interneHighscores = [];

function highscoreLadenIntern(startEintraege) {
  interneHighscores.length = 0;

  for (const eintrag of startEintraege) {
    interneHighscores.push({
      namen: eintrag.namen,
      punkte: eintrag.punkte,
    });
  }

  return interneHighscores;
}

function highscoreHinzufuegenIntern(name1, name2, score) {
  interneHighscores.push({
    namen: `${name1} & ${name2}`,
    punkte: score,
  });

  interneHighscores.sort((a, b) => b.punkte - a.punkte);

  if (interneHighscores.length > 10) {
    interneHighscores.length = 10;
  }

  return interneHighscores;
}

function renderHighscores(listEl) {
  listEl.innerHTML = "";

  if (interneHighscores.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Noch keine Spiele gespielt.";
    listEl.appendChild(li);
    return;
  }

  for (const eintrag of interneHighscores) {
    const li = document.createElement("li");

    const namen = document.createElement("span");
    namen.className = "names";
    namen.textContent = eintrag.namen;

    const punkte = document.createElement("span");
    punkte.className = "pts";
    punkte.textContent = eintrag.punkte;

    li.append(namen, punkte);
    listEl.appendChild(li);
  }
}
