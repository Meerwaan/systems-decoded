// 02 · AUTOPSIE — SKELETON (it builds; the act's builder rewrites it entirely: docs/027-actes.md, « acte2.js »).
// « Alors… on l'ouvre. » The same lane on the bench, in place (benchCut with benchOrigin(RUN.freeze): the last shot of
// act 1 rode with the truck), the exploded view along it; the round grains, the comparison, the cut-away; then back on
// the road (« Et ton camion arrive à quatre-vingt-dix ») and the threshold (followCall), the camera already on its way.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, RUN, KMH, benchOrigin } from "./world.js";

export default function acte2({ D }) {
  const { tl, st, shot, cut } = D;
  const t = D.times({ ouvre: "ouvre", tobench: "tobench", explode: "explode", torepos: "torepos", toarrive: "toarrive", seuil: "seuil", seuilEnd: "seuil$", tozero: "tozero" });
  setAct(tl, 2, t.ouvre);
  const pose = benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.lane, origin: benchOrigin(RUN.freeze), state: BENCHED });
  st(t.explode, 1, { explode: 1 }, "power2.out");
  shot(t.tobench + 0.02, t.torepos - t.tobench, VIEW.exploded, "sine.inOut", pose.d);
  st(t.torepos, 0.8, { explode: 0 }, "sine.inOut");
  cut(t.toarrive, SET.SCENE, VIEW.side, { ...STAGED, s: RUN.freeze, kmh: KMH, pedal: 1 });
  st(t.toarrive, t.tozero - t.toarrive, { s: RUN.zero }, "none");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
}
