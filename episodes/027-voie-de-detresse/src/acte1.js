// 01 · MENACE — SKELETON (it builds; the act's builder rewrites it entirely: docs/027-actes.md, « acte1.js »).
// From the first frame to « Alors… »: the truck runs down the col, its drums too hot, the pedal sinks, the speed climbs,
// the bend and the ravine at the bottom, the lane on the right. ONE move (two cuts at most), the camera riding with the
// truck (`ride` 1). It FINISHES at `freeze` on VIEW.lane with the truck stopped in time at RUN.freeze: act 2 cuts from there.
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW, RUN, KMH } from "./world.js";

export default function acte1({ D }) {
  const { tl, st, shot } = D;
  const t = D.times({ v80: "v80", v90: "v90", freeze: "freeze", tobench: "tobench" });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });
  st(0, t.freeze, { s: RUN.freeze }, "none"); // the run (rate(kmh) m per film second, in straight runs)
  st(t.v80, 0.3, { kmh: 80 }, "power2.out");
  st(t.v90, 0.3, { kmh: KMH }, "power2.out");
  shot(0, t.freeze, VIEW.lane, "sine.inOut", POSE0.d);
}
