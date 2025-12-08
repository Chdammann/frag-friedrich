// ===============================
// TEXT LIPSYNC PRO – SAFE MODULE
// ===============================

// 🔥 Flag: Läuft gerade Text-Lipsync?
let tlActive = false;

// Kleine Hilfsfunktion für Pausen
function tlSleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// -------------------------------
// 1. Grund-Mapping für Buchstaben
// -------------------------------
function tlLetterViseme(letter) {
  const l = letter.toLowerCase();

  if ("aäe".includes(l)) return { jaw: 0.55, wide: 0.33, pucker: 0,    frown: 0,   smile: 0.15 };
  if ("ouöü".includes(l)) return { jaw: 0.32, wide: 0.08, pucker: 0.65, frown: 0,   smile: 0 };
  if ("i".includes(l))    return { jaw: 0.2,  wide: 0.6,  pucker: 0,    frown: 0,   smile: 0.1 };
  if ("mbp".includes(l))  return { jaw: 0.0,  wide: 0,    pucker: 0,    frown: 0,   smile: 0 };
  if ("fv".includes(l))   return { jaw: 0.1,  wide: 0.05, pucker: 0,    frown: 0.4, smile: 0 };

  return { jaw: 0.22, wide: 0.12, pucker: 0, frown: 0, smile: 0 };
}

// --------------------------------------
// 2. Sonderlaute (Deutsch)
// --------------------------------------
function tlDetectSpecialVisemes(syl) {
  const t = syl.toLowerCase();

  if (t.startsWith("sch")) return { jaw: 0.18, wide: 0.1,  pucker: 0.35, frown: 0,   smile: 0 };
  if (t.startsWith("ch"))  return { jaw: 0.2,  wide: 0.25, pucker: 0,    frown: 0,   smile: 0 };
  if (t.startsWith("pf"))  return { jaw: 0.05, wide: 0.05, pucker: 0,    frown: 0.35, smile: 0 };
  if (t.startsWith("ei") || t.startsWith("ai"))
                           return { jaw: 0.32, wide: 0.3,  pucker: 0,    frown: 0,   smile: 0.1 };
  if (t.startsWith("eu") || t.startsWith("äu"))
                           return { jaw: 0.26, wide: 0.22, pucker: 0.2,  frown: 0,   smile: 0 };

  return null;
}

// --------------------------------------
// 3. Silbenzerlegung
// --------------------------------------
function tlSplitIntoSyllables(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zäöüß ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .flatMap(word =>
      word.match(/[bcdfghjklmnpqrstvwxyz]*[aeiouäöü]+[a-zäöüß]*/g) || [word]
    );
}

// --------------------------------------
// 4. VISEME SET – OHNE SMOOTHING!!
// --------------------------------------

function tlApplyViseme(v) {
  if (!v) return;

  setBlendshape(jawOpenIndex,     v.jaw   ?? 0);
  setBlendshape(mouthWideIndex,   v.wide  ?? 0);
  setBlendshape(mouthPuckerIndex, v.pucker ?? 0);
  setBlendshape(mouthFrownIndex,  v.frown ?? 0);
  setBlendshape(mouthSmileIndex,  v.smile ?? 0);
}

function tlResetMouthToIdle() {
  tlApplyViseme({ jaw: 0.1, wide: 0, pucker: 0, frown: 0, smile: 0 });
}

// --------------------------------------
// 5. Hauptfunktion – Textbasiertes Lipsync
// --------------------------------------
async function playTextLipsyncPro(text, options = {}) {
  if (!text || typeof text !== "string") return;

  tlActive = true;

  const mode = options.mode || "syllable";
  const baseSpeed = options.baseSpeed || 200;

  const units =
    mode === "letter" ? text.split("") : tlSplitIntoSyllables(text);

  for (const unit of units) {
    const syl = unit.trim();
    if (!syl) continue;

    const v = tlDetectSpecialVisemes(syl) || tlLetterViseme(syl[0]);
    tlApplyViseme(v);

    let dur = baseSpeed;
    if (/[aeiouäöü]{2,}/.test(syl)) dur += 60;

    await tlSleep(dur);
  }

  // Ende: Mundschließen & tlActive werden von SPEAK.onend erledigt
}

// --------------------------------------
// 6. Wrapper
// --------------------------------------
async function playTextLipsync(text) {
  return playTextLipsyncPro(text, { mode: "syllable" });
}
