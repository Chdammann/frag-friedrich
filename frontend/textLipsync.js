// ===============================
// TEXT LIPSYNC PRO – SAFE MODULE
// ===============================
// - Nutzt deine Blendshapes: jawOpenIndex, mouthWideIndex,
//   mouthPuckerIndex, mouthSmileIndex, mouthFrownIndex
// - Greift NUR, wenn du playTextLipsyncPro(text) ODER playTextLipsync(text) aufrufst
// - Audio-Lipsync bleibt unangetastet

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
    // „schön“, „Schlaf“ – leicht gerundete Lippen
    return { jaw: 0.18, wide: 0.1,  pucker: 0.35, frown: 0,   smile: 0 };
  }
  if (t.startsWith("ch")) {
    // „ich“, „dich“
    return { jaw: 0.2,  wide: 0.25, pucker: 0,    frown: 0,   smile: 0 };
  }
  if (t.startsWith("pf")) {
    // „Pfalz“
    return { jaw: 0.05, wide: 0.05, pucker: 0,    frown: 0.35, smile: 0 };
  }
  if (t.startsWith("ei") || t.startsWith("ai")) {
    // „mein“, „Kaiser“
    return { jaw: 0.32, wide: 0.3,  pucker: 0,    frown: 0,   smile: 0.1 };
  }
  if (t.startsWith("eu") || t.startsWith("äu")) {
    // „Eule“, „Häuser“
    return { jaw: 0.26, wide: 0.22, pucker: 0.2,  frown: 0,   smile: 0 };
  }

  return null;
}

// --------------------------------------
// 3. Einfache Silben-Zerlegung (deutsch)
// --------------------------------------
function tlSplitIntoSyllables(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zäöüß ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .flatMap(word => {
      // Grobe Heuristik: Konsonantencluster + Vokal
      const m = word.match(/[bcdfghjklmnpqrstvwxyz]*[aeiouäöü]+[a-zäöüß]*/g);
      return m || [word];
    });
}

// --------------------------------------
// 4. Sanfte Übergänge (Lerp auf Blendshapes)
// --------------------------------------
let tlBlendCache = {}; // merkt sich die letzten Werte, NUR für Text-Lipsync

function tlSmoothSet(index, target, factor = 0.55) {
  if (index == null || index < 0) return;
  const current = tlBlendCache[index] ?? 0;
  const next = current + (target - current) * factor;
  tlBlendCache[index] = next;
  setBlendshape(index, next);
}

function tlApplyViseme(v) {
  const jaw   = v.jaw   ?? 0;
  const wide  = v.wide  ?? 0;
  const puck  = v.pucker ?? 0;
  const frown = v.frown ?? 0;
  const smile = v.smile ?? 0;

  tlSmoothSet(jawOpenIndex,     jaw);
  tlSmoothSet(mouthWideIndex,   wide);
  tlSmoothSet(mouthPuckerIndex, puck);
  tlSmoothSet(mouthFrownIndex,  frown);
  tlSmoothSet(mouthSmileIndex,  smile);
}

function tlResetMouthToIdle() {
  const idle = { jaw: 0.1, wide: 0, pucker: 0, frown: 0, smile: 0 };
  tlApplyViseme(idle);
}

// --------------------------------------
// 5. Hauptfunktion: Silbenbasierter Text-Lipsync
// --------------------------------------
async function playTextLipsyncPro(text, options = {}) {
  if (!text || typeof text !== "string") return;

  const mode      = options.mode      || "syllable"; // "syllable" oder "letter"
  const baseSpeed = options.baseSpeed || 160;        // Dauer pro Silbe in ms

  tlBlendCache = {}; // Cache für sanfte Übergänge zurücksetzen

  let units;
  if (mode === "letter") {
    units = text.split("");
  } else {
    units = tlSplitIntoSyllables(text);
  }

  for (const unit of units) {
    if (!unit) continue;
    const u = unit.trim();
    if (!u) continue;

    // Sonderlaute zuerst versuchen
    let v = tlDetectSpecialVisemes(u);
    if (!v) {
      // ansonsten nach erstem Buchstaben mappen
      v = tlLetterViseme(u[0]);
    }

    tlApplyViseme(v);

    let dur = baseSpeed;

    // längere Silben mit vielen Vokalen → etwas länger halten
    if (/[aeiouäöü]{2,}/.test(u)) {
      dur += 60;
    }

    await tlSleep(dur);
  }

  // Am Ende sauber in die Idle-Mundform zurück
  tlResetMouthToIdle();
}

// --------------------------------------
// 6. Kompatibilitäts-Wrapper
// --------------------------------------
// Du kannst weiterhin playTextLipsync("Text") in der Konsole aufrufen.
// Intern nutzt es die Pro-Version.
async function playTextLipsync(text) {
  return playTextLipsyncPro(text, { mode: "syllable" });
}
async function playTextLipsyncSynced(text, audioDuration) {
  const syllables = tlSplitIntoSyllables(text);
  const count = syllables.length;

  if (count === 0 || !audioDuration) {
    return playTextLipsyncPro(text); // Fallback
  }

  const timePerSyl = (audioDuration * 1000) / count;

  tlBlendCache = {};

  for (const syl of syllables) {
    if (!syl) continue;

    let v = tlDetectSpecialVisemes(syl) || tlLetterViseme(syl[0]);
    tlApplyViseme(v);

    await tlSleep(timePerSyl);
  }

  tlResetMouthToIdle();
}
