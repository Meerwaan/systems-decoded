// DOSSIER L06 — LES PIÈCES DU DOSSIER: the real documents, shown a few seconds each, framed by the dossier ("PIÈCE N°"),
// their source and licence on screen, always commented by the voice (docs/recette-long-affaire.md). ≤ 10 % of the film.
// ONLY what docs/faits/L06-blackout-europe.md § 12 lists. The UCTE and CRE reports carry NO free licence: their frame
// names the document (its number, its title, its source) and the film REDRAWS what it shows in 3D — no page is
// reproduced (`file: null`: a frame of text). The two photographs are free (credit on screen); their files go in
// episodes/L06-blackout/pieces/ once Merwan agrees to fetch them (not in the repo): until then (FILES_IN false) their
// frame shows dark with its number and its source, so the film still builds.
// NEVER a TV news, an amateur video, a press agency's photo, another channel.
//
//   showPiece(tl, { id, from, to, side = "right", top = 220 })   one at a time; it has left before any cut
export const FILES_IN = false;
export const PIECES = {
  rapport: {
    n: 1,
    file: null, // no page reproduced: the frame alone, the 3D report on the bench beside it
    title: "Final Report · System Disturbance on 4 November 2006",
    credit: "UCTE, 30 janvier 2007 · 84 pages · cité, redessiné en 3D",
  },
  reglages: {
    n: 2,
    file: null,
    title: "Tableau 1 : les réglages aux deux bouts de la ligne",
    credit: "Rapport UCTE, p. 19 · cité, redessiné en 3D",
  },
  cre: {
    n: 3,
    file: null,
    title: "Rapport d'enquête sur la panne du 4 novembre 2006",
    credit: "Commission de régulation de l'énergie, 7 février 2007 · cité",
  },
  pylones: {
    n: 4,
    file: "pieces/ems-pylones-2007.jpg", // commons.wikimedia.org/wiki/File:380-kV-Ems-Freileitungskreuzung_IMGP0026.jpg
    title: "La traversée de l'Ems, pylônes relevés",
    credit: "Photo Rainer Knäpper, 23 sept. 2007 · Licence Art Libre",
  },
  navire: {
    n: 5,
    file: "pieces/norwegian-pearl-papenburg.jpg", // commons.wikimedia.org/wiki/File:Norwegian_Pearl_in_Papenburg,_Germany.jpg
    title: "Le Norwegian Pearl à Papenburg", // never « cette nuit-là » : the photo's hour is not established
    credit: "Photo Pink Dispatcher · CC BY-SA 2.0",
  },
};

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

export function showPiece(tl, { id, from, to, side = "right", top = 220 }) {
  const p = PIECES[id];
  const node = el("div", `piece piece--${side}${p.file ? "" : " piece--text"}`);
  node.style.top = `${top}px`;
  node.append(el("div", "piece__n", `Pièce n° ${p.n}`));
  if (p.file) {
    const img = el("div", "piece__img");
    if (FILES_IN) img.style.backgroundImage = `url("${p.file}")`;
    node.append(img);
  }
  node.append(el("div", "piece__t", p.title), el("div", "piece__s", p.credit));
  document.getElementById("pieces").append(node);
  tl.fromTo(node, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, from);
  tl.to(node, { opacity: 0, duration: 0.35, ease: "power2.in" }, Math.max(from + 0.4, to - 0.35));
  return node;
}
