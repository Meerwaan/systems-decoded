// 02 · AUTOPSIE — `tobench` (22.06) → `torepos` (43.43). SKELETON (to be rewritten in full by its agent):
// docs/051-actes.md, « ## acte2.js ». « Alors… on l'ouvre. », the exploded view (belt, tanks, the stem — the heart),
// the principle on the stem itself.
import { setAct } from "@kit/overlay.js";
import { benchCut } from "@kit/blocks.js";
import { SET, VIEW, BENCHED } from "./world.js";

export default function acte2({ D }) {
  const { tl, st, shot } = D;
  const t = D.times({ ouvre: "ouvre", tobench: "tobench", explode: "explode", coeur: "coeur", principe: "principe", torepos: "torepos" });
  setAct(tl, 2, t.ouvre);
  const pose = benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.bow, state: BENCHED });
  st(t.explode, 1.2, { explode: 1 }, "none");
  shot(t.tobench + 0.02, t.coeur - t.tobench, VIEW.exploded, "sine.inOut", pose.d);
  st(t.coeur, 0.4, { litStem: 1 }, "power2.out");
  st(t.principe - 0.2, 0.8, { explode: 0, slab: 1 }, "sine.inOut");
  shot(t.principe - 0.2, t.torepos - t.principe, VIEW.principle, "sine.inOut");
}
