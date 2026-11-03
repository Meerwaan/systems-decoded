// DOSSIER L05 — LES PIÈCES DU DOSSIER: the real documents, shown a few seconds each, framed by the dossier ("PIÈCE N°"),
// their source and licence on screen, always commented by the voice (docs/recette-long-affaire.md). ≤ 10 % of the film.
// ONLY the files whose licence was checked one by one (docs/faits/L05-hudson.md § Les pièces du dossier). NEVER an
// image of the film Sully, a TV news, another channel, a press agency; NEVER the report's figure 2 (no credit given).
// The image files go in episodes/L05-hudson/pieces/ (fetched by hand once Merwan agrees — not in the repo yet): a
// missing file leaves the frame dark with its number and source, so the film still builds.
//
//   showPiece(tl, { id, from, to, side = "right", top = 220 })   one at a time; it has left before any cut
// FILES_IN: false until Merwan agrees to download the five pieces into episodes/L05-hudson/pieces/ (the frames show without the image)
export const FILES_IN = true;
export const PIECES = {
  moteur: {
    n: 2,
    file: "pieces/moteur-repeche.jpg", // commons.wikimedia.org/wiki/File:Flight_1549_engine_recovered.jpg
    title: "Un moteur du vol 1549, sorti de l'Hudson",
    credit: "Photo LaDonna Davis · USACE New York District, 23 janv. 2009 · domaine public",
  },
  plume: {
    n: 4,
    file: "pieces/plume.jpg", // commons.wikimedia.org/wiki/File:USAir_1549_bird_feather.jpg
    title: "Une plume dans le moteur gauche",
    credit: "Photo NTSB, communiqué du 4 févr. 2009 · domaine public",
  },
  rapport: {
    n: 3,
    file: "pieces/ntsb-rapport.png", // the report's cover page, rendered from the PDF (AAR-10/03)
    title: "Rapport d'enquête NTSB/AAR-10/03",
    credit: "National Transportation Safety Board, adopté le 4 mai 2010 · domaine public",
  },
  trajectoire: {
    n: 5,
    file: "pieces/ntsb-fig1.png", // the report's figure 1 (the flight track) — to check page by page before use
    title: "La trajectoire du vol, figure 1 du rapport",
    credit: "NTSB/AAR-10/03 · domaine public",
  },
  secours: {
    n: 1,
    file: "pieces/uscg-secours.jpg", // commons: Coast_Guard_Response_to_Miracle_on_the_Hudson_(3201127645).jpg
    title: "Les secours sur l'Hudson",
    credit: "Photo U.S. Coast Guard · licence CC BY 2.0",
  },
};

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

/** A piece of the dossier on screen from `from` to `to` (fades 0.35 s in and out, inside that window). */
export function showPiece(tl, { id, from, to, side = "right", top = 220 }) {
  const p = PIECES[id];
  const node = el("div", `piece piece--${side}`);
  node.style.top = `${top}px`;
  node.append(el("div", "piece__n", `Pièce n° ${p.n}`));
  const img = el("div", "piece__img");
  if (FILES_IN) img.style.backgroundImage = `url("${p.file}")`;
  node.append(img, el("div", "piece__t", p.title), el("div", "piece__s", p.credit));
  document.getElementById("pieces").append(node);
  tl.fromTo(node, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, from);
  tl.to(node, { opacity: 0, duration: 0.35, ease: "power2.in" }, Math.max(from + 0.4, to - 0.35));
  return node;
}
