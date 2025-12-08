// ===============================
// TEXT LIPSYNC PRO – SAFE MODULE
// ===============================
// - Nutzt deine Blendshapes: jawOpenIndex, mouthWideIndex,
//   mouthPuckerIndex, mouthSmileIndex, mouthFrownIndex
// - Greift NUR, wenn du playTextLipsyncPro(text) ODER playTextLipsync(text) aufrufst
// - Audio-Lipsync bleibt unangetastet

// 🔥 Neu: Flag, ob Text-Lipsync gerade aktiv ist
let tlActive = false;

// Kleine Hilfsfunktion für Pausen
function tlSleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// -------------------------------
// 1. Grund-Mapping für Buchstaben
// -------------------------------
function tlLetterViseme(letter) {
  const l = letter.toLowerCase();

  // Offene Vokale
  if ("aäe".includes(l)) {
    return { jaw: 0.55, wide: 0.33, pucker: 0, frown: 0, smile: 0.15 };
  }
  // Runde Vokale
  if ("ouöü".includes(l)) {
    return { jaw: 0.32, wide: 0.08, pucker: 0.65, frown: 0, smile: 0 };
  }
  // I: breit
  if ("i".includes(l)) {
    return { jaw: 0.2,  wide: 0.6,  pucker: 0,    frown: 0, smile: 0.1 };
  }
  // Lippen geschlossen
  if ("mbp".includes(l)) {
    return { jaw: 0.0,  wide: 0,    pucker: 0,    frown: 0, smile: 0 };
  }
  // Unterlippe / Zähne: F/V
  if ("fv".includes(l)) {
    return { jaw: 0.1,  wide: 0.05, pucker: 0,    frown: 0.4, smile: 0 };
  }

  // Standard: leicht geöffnet, neutral
  return { jaw: 0.22, wide: 0.12, pucker: 0, frown: 0, smile: 0 };
}

// --------------------------------------
// 2. Sonderlaute für deutsches Sprechen
// --------------------------------------
function tlDetectSpecialVisemes(syl) {
  const t = syl.toLowerCase();

  if (t.startsWith("sch")) {
    return { jaw: 0.18, wide: 0.1,  pucker: 0.35, frown: 0,   smile: 0 };
  }
  if (t.startsWith("ch")) {
    return { jaw: 0.2,  wide: 0.25, pucker: 0,    frown: 0,   smile: 0 };
  }
  if (t.startsWith("pf")) {
    return { jaw: 0.05, wide: 0.05, pucker: 0,    frown: 0.35, smile: 0 };
  }
  if (t.startsWith("ei") || t.startsWith("ai")) {
    return { jaw: 0.32, wide: 0.3,  pucker: 0,    frown: 0,   smile: 0.1 };
  }
