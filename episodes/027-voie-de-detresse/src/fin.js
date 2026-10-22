// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier — SKELETON (it
// builds; the act's builder rewrites it entirely: docs/027-actes.md, « fin.js »).
//   chute        « cette voie n'a aucun frein » — struck on « aucun », corrected on « payer » (retitle) — D.verdict
//   commentaire  what the film still owes (« Et ton pied ? »), then the question in two answers (duelCall)
//   like · prochain dossier (last) · boucle: the last frame IS the first
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, FIRST, RUN, rate } from "./world.js";

export default function fin({ D }) {
  const { tl, st, cut } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "secret", strike: "strike", verdict: "verdict", tocta: "tocta", ask: "ask",
    choiceA: "choiceA", choiceB: "choiceB", tolike: "tolike", likeEnd: "like$", toabo: "toabo", gaz: "gaz", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });
  cut(t.toverdict, SET.SCENE, VIEW.top, { ...STAGED, s: RUN.stop, kmh: 0, pedal: 0, sink: 1, mood: 0, laneLit: 1, heat: 0.5 });
  retitle(tl, { showAt: t.secret + 0.1, strikeAt: t.strike, swapAt: t.verdict, hideAt: t.tocta - 0.42 });
  D.verdict(t.verdict);
  duelCall(tl, { from: t.ask, aAt: t.choiceA, bAt: t.choiceB, to: t.tolike - 0.3, toneA: "signal", toneB: "veille" });
  likeCall(tl, { from: t.tolike + 0.12, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} chauffeurs` });
  nextFile(tl, { showAt: t.toabo + 0.06, factAt: t.gaz, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });
  // the loop: the truck comes down the col again and reaches s = 0 on the very last frame (never backwards)
  const back = rate(FIRST.kmh) * (D.tEnd - t.toloop);
  cut(t.toloop, SET.SCENE, { ...VIEW.hook, d: VIEW.hook.d * 1.1 }, { ...STAGED, s: -back, kmh: FIRST.kmh, pedal: FIRST.pedal, sink: 0, steer: 0, heat: FIRST.heat, laneLit: FIRST.laneLit });
  st(t.toloop, D.tEnd - t.toloop, { s: 0 }, "none");
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: VIEW.hook.d * 1.1 });
}
