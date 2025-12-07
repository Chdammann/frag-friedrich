// ===============================
// TEXT-TO-VISEME LIPSYNC (SAFE)
// ===============================
// Dieses Modul beeinflusst NICHT deinen Audio-LipSync.
// Es wird nur genutzt, wenn du playTextLipsync(text) aufrufst.

function textToViseme(letter) {
  const l = letter.toLowerCase();

  if ("aäe".includes(l)) {
    return { jaw: 0.45, wide: 0.25, pucker: 0, frown: 0 };
  }
  if ("oou".includes(l)) {
    return { jaw: 0.25, wide: 0, pucker: 0.55, frown: 0 };
  }
  if ("i".includes(l)) {
    return { jaw: 0.2, wide: 0.6, pucker: 0, frown: 0 };
  }
  if ("mbp".includes(l)) {
    return { jaw: 0.0, wide: 0, pucker: 0, frown: 0 };  // geschlossener Mund
  }
  if ("fv".includes(l)) {
    return { jaw: 0.1, wide: 0, pucker: 0, frown: 0.4 };
  }

  // Standard: leicht geöffnet
  return { jaw: 0.12, wide: 0, pucker: 0, frown: 0 };
}


async function playTextLipsync(text) {
  const speed = 65; // ms pro „Laut“ – kannst du später anpassen

  for (const char of text) {
    const v = textToViseme(char);

    // Blendshapes setzen – deine vorhandenen Indizes benutzen!
    setBlendshape(jawOpenIndex, v.jaw || 0);
    setBlendshape(mouthWideIndex, v.wide || 0);
    setBlendshape(mouthPuckerIndex, v.pucker || 0);
    setBlendshape(mouthFrownIndex, v.frown || 0);
    setBlendshape(mouthSmileIndex, 0); // neutral, später erweiterbar

    await new Promise(r => setTimeout(r, speed));
  }

  // Am Ende Mund zum Idle übergeben:
  setBlendshape(jawOpenIndex, 0.1);
  setBlendshape(mouthWideIndex, 0);
  setBlendshape(mouthPuckerIndex, 0);
  setBlendshape(mouthFrownIndex, 0);
}
