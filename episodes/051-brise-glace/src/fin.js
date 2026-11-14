// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier.
// SKELETON (to be rewritten in full by its agent): docs/051-actes.md, « ## fin.js ».
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, FIRST, POSE0 } from "./world.js";

export default function fin({ D }) {
  const { tl, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", pese: "pese3", tocta: "tocta", jours: "jours", commentaire: "commentaire",
    duelA: "duelA", duelB: "duelB", like: "like", likeEnd: "like$", abo: "abo", prochain: "prochain", aboEnd: "abo$", toloop: "toloop", rewind: "rewind",
  });
  cut(t.toverdict, SET.ICE, VIEW.quarter, { ...STAGED, shok: 0, close: 0.8, wake: 1, mood: 0, push: 1 });
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.pese - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  cut(t.tocta, SET.ICE, VIEW.top, { ...STAGED, shok: 1, apart: 11000, line: 1, wind: 1, close: 1, mood: 1, push: 0, fs: 600000 });
  D.st(t.tocta, t.jours - t.tocta + 0.4, { days: 6 }, "none");
  void chip;
  duelCall(tl, { from: t.commentaire - 0.5, aAt: t.duelA, bAt: t.duelB, to: t.like - 0.3, toneA: "veille", toneB: "signal" });
  cut(t.like - 0.12, SET.ICE, VIEW.bowSide, { ...STAGED, shok: 0, close: 1, crest: 1, straight: 1, crush: 1, mood: 1, prop: 1 });
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });
  cut(t.abo - 0.12, SET.ICE, VIEW.quarter, { ...STAGED, shok: 0, close: 0.8, mood: 0 });
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });
  cut(t.toloop, SET.ICE, { ...POSE0, d: POSE0.d * 0.85, az: POSE0.az + 6 }, { ...STAGED, ...FIRST });
  shot(t.toloop, t.rewind - t.toloop, { d: POSE0.d * 0.9 }, "sine.inOut");
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: POSE0.d * 0.85 });
}
