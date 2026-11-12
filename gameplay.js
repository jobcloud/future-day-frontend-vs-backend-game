// ================================================================
//  gameplay.js
//  Das ist DEIN Spielplatz! Ändere die Zahlen und schau, was passiert.
//  Versuche zum Beispiel, die Spieler schneller zu machen oder den
//  Ball hüpfiger.
// ================================================================

// --- Einstellbare Zahlen -----------------------------------------

// Wie schnell die Spieler nach links und rechts laufen
const SPIELER_TEMPO = 6;

// Wie stark ein Schlägerhit den Ball nach oben schießt
const SCHLAG_KRAFT = 10;

// Wie viele Punkte es für jeden Balltreffer gibt
const PUNKTE_PRO_TREFFER = 1;

// Wie stark die Schwerkraft den Ball jedes Bild nach unten zieht
const SCHWERKRAFT = 0.28;

// Höchstes Tempo, das der Ball haben darf (damit er nicht wegfliegt)
const MAX_BALL_TEMPO = 14;

// Wie sehr ein Schlag zufällig schwankt (0.2 = zwischen 80% und 120% Stärke)
const SCHLAG_ZUFALL = 0.2;

// --- Kleine Spielfunktionen --------------------------------------

// Bewege einen Spieler. richtung ist -1 (links) oder +1 (rechts).
function bewegeSpieler(spieler, richtung) {
  spieler.x += richtung * SPIELER_TEMPO;
}

// Schlage den Ball zurück in den Himmel, auf die andere Seite vom Netz.
function schlageBall(ball, spieler) {
  const zurAnderenSeite = spieler.seite === "links" ? 1 : -1;

  ball.vy = -SCHLAG_KRAFT * zufallsFaktor(SCHLAG_ZUFALL);
  ball.vx =
    zurAnderenSeite * (SCHLAG_KRAFT * 0.5) * zufallsFaktor(SCHLAG_ZUFALL);
}

// Zähle Punkte hinzu, nachdem ein Treffer gelungen ist.
function erhöhePunkte(spiel) {
  spiel.score += PUNKTE_PRO_TREFFER;
}

// Die Schwerkraft zieht den Ball jedes Bild ein Stück nach unten.
function wendeSchwerkraftAn(ball) {
  ball.vy += SCHWERKRAFT;
}

// Bewege den Ball entsprechend seinem aktuellen Tempo.
function bewegeBall(ball) {
  ball.x += ball.vx;
  ball.y += ball.vy;
}

// Verhindere, dass der Ball zu schnell wird.
function begrenzeBallTempo(ball) {
  if (ball.vx > MAX_BALL_TEMPO) ball.vx = MAX_BALL_TEMPO;
  if (ball.vx < -MAX_BALL_TEMPO) ball.vx = -MAX_BALL_TEMPO;
  if (ball.vy > MAX_BALL_TEMPO) ball.vy = MAX_BALL_TEMPO;
  if (ball.vy < -MAX_BALL_TEMPO) ball.vy = -MAX_BALL_TEMPO;
}

// Wähle einen zufälligen Faktor nahe bei 1, z. B. 0.9 - 1.1 bei menge = 0.1.
function zufallsFaktor(menge) {
  return 1 + (Math.random() * 2 - 1) * menge;
}

// --- Highscore-Funktionen --------------------------------------

async function highscoreLaden() {
  const eintraege = await highscoreVomServerLaden();
  return eintraege === null
    ? interneHighscores
    : highscoreLadenIntern(eintraege);
}

// Füge einen neuen Highscore hinzu.
async function highscoreHinzufuegen(spieler1Name, spieler2Name, punkte) {
  highscoreHinzufuegenIntern(spieler1Name, spieler2Name, punkte);
  const gruppenId = gruppenIdAusNamenErstellen(spieler1Name, spieler2Name);
  const gespeichert = await highscoreAnServerSenden(
    gruppenId,
    `${spieler1Name} & ${spieler2Name}`,
    punkte,
  );
  return gespeichert ? highscoreLaden() : interneHighscores;
}
