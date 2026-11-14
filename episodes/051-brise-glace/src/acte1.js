// 01 · MENACE — 0 → `tobench` (22.06). SKELETON written by the architect (it builds; to be rewritten in full by
// its agent): docs/051-actes.md, « ## acte1.js ». The hook A · B · C and the scene, in ONE move, two cuts at most.
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW, SET, STAGED } from "./world.js";
import { APART } from "./plan.js";

export default function acte1({ D }) {
  const { tl, st, shot, cut } = D;
  const t = D.times({ promesse: "promesse", scene: "scene", top: "dizaine", tobench: "tobench" });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });
  st(0, t.promesse, { close: 0.85, wake: 0.1 }, "sine.inOut");
  shot(0, t.promesse, { d: POSE0.d * 0.85, az: POSE0.az + 6 }, "sine.inOut", POSE0.d);
  cut(t.promesse - 0.1, SET.ICE, VIEW.bowSide, { ...STAGED, shok: 0, apart: APART.real, close: 0.9, mood: 1 });
  cut(t.top - 0.3, SET.ICE, VIEW.top, { ...STAGED, shok: 1, apart: APART.real, line: 1, close: 0.95, mood: 1, fs: 600000 });
  cut(t.tobench - 1.2, SET.ICE, VIEW.bow, { ...STAGED, shok: 0, close: 1, mood: 1 });
}
