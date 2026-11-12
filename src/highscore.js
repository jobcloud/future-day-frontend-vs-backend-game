// Interne Highscore-Logik ("hidden").
// Diese Datei verwaltet Speicherung und Rendering.

const interneHighscores = [];
const HIGHSCORE_API_URL = "https://game-api.futureday.ch/scores";

function gruppenIdAusNamenErstellen(name1, name2) {
  const gruppenName = [name1, name2]
    .map((name) => name.normalize("NFKC").trim().toLowerCase())
    .join("\u0000");
  const startwerte = [0x811c9dc5, 0x12345678, 0x9e3779b9, 0xdeadbeef];
  const teile = startwerte.map((startwert) => {
    let hash = startwert;
    for (let index = 0; index < gruppenName.length; index++) {
      hash = Math.imul(hash ^ gruppenName.charCodeAt(index), 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  });
  let id = teile.join("");
  id = `${id.slice(0, 12)}5${id.slice(13, 16)}${"89ab"[parseInt(id[16], 16) % 4]}${id.slice(17)}`;
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

async function highscoreVomServerLaden() {
  try {
    const antwort = await fetch(HIGHSCORE_API_URL);
    if (!antwort.ok) {
      throw new Error(
        `Highscores konnten nicht geladen werden: ${antwort.status}`,
      );
    }
    const eintraege = await antwort.json();
    return eintraege.map((eintrag) => ({
      namen: eintrag.groupName,
      punkte: Number(eintrag.score),
    }));
  } catch (fehler) {
    console.error(fehler);
    return null;
  }
}

async function highscoreAnServerSenden(gruppenId, gruppenName, punkte) {
  try {
    const antwort = await fetch(HIGHSCORE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId: gruppenId,
        groupName: gruppenName,
        score: String(punkte),
      }),
    });
    if (!antwort.ok) {
      throw new Error(
        `Highscore konnte nicht gespeichert werden: ${antwort.status}`,
      );
    }
    return true;
  } catch (fehler) {
    console.error(fehler);
    return false;
  }
}

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
