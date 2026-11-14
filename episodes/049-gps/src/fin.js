// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier.
// SKELETON by the architect (it builds; the acte agent rewrites it whole: docs/049-actes.md › fin.js).
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0 } from "./world.js";

export default function fin({ D }) {
  const { tl, shot, cut, chip } = D;
  const t = D.times({
    avance: "avance", onze: "onze",
    toverdict: "toverdict", chute: "chute", pas: "verdict", horloge: "horloge", tocta: "tocta",
    pointbleu: "pointbleu", panneaux: "panneaux", commentaire: "commentaire",
    like: "like", likeEnd: "like$", abo: "abo", prochain: "prochain", aboEnd: "abo$", toloop: "toloop", rewind: "rewind",
  });

  /* chute — back to the hook's frame: the phone from below, the map struck, an hour in microseconds */
  cut(t.toverdict, SET.ROAD, VIEW.phone, { ...STAGED, eta: 0, err: 0, mood: 0 });
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.horloge - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);

  /* COMMENTAIRE — the two clocks, then the duel */
  cut(t.tocta, SET.BENCH, VIEW.clocks, { ...BENCHED, twin: 1, thread: 0 });
  shot(t.tocta, t.like - t.tocta, { az: -34 }, "sine.inOut");
  chip("chip-38", null, 96, 470, t.avance - 0.6, t.onze - 0.3);
  chip("chip-11", null, 96, 470, t.onze - 0.1, t.commentaire - 0.5);
  duelCall(tl, { from: t.commentaire - 0.3, aAt: t.pointbleu, bAt: t.panneaux, to: t.like - 0.3, toneA: "veille", toneB: "ink" });

  /* LIKE */
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* PROCHAIN DOSSIER */
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* rebouclage — back to the first frame */
  cut(t.toloop, SET.ROAD, { ...POSE0, d: 40 }, { ...STAGED, eta: FIRST.eta, err: FIRST.err, mood: FIRST.mood, fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: FIRST.fs });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: 40 });
}
