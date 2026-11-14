// 02 · AUTOPSIE (suite) — `torepos` (43.43) → `tozero` (49.99). SKELETON (to be rewritten in full by its agent):
// docs/051-actes.md, « ## acte2b.js ». Plain ice: the plate bends, splits, the blocks go under; then « là-bas… la
// glace se referme ».
import { SET, VIEW, STAGED } from "./world.js";

export default function acte2b({ D }) {
  const { st, shot, cut } = D;
  const t = D.times({ torepos: "torepos", fend: "fend", labas: "labas", tozero: "tozero" });
  cut(t.torepos, SET.ICE, VIEW.bowSide, { ...STAGED, shok: 0, close: 0.7, wake: 1, mood: 0, prop: 0.6 });
  st(t.torepos, t.labas - t.torepos, { run: 30 }, "none");
  st(t.torepos + 0.4, 0.8, { bend: 1 }, "sine.in");
  st(t.fend, 0.3, { crack: 1 }, "power2.out");
  st(t.fend + 0.3, 1.4, { tumble: 1 }, "sine.inOut");
  shot(t.labas - 0.2, t.tozero - t.labas, VIEW.high, "sine.inOut");
  st(t.labas, t.tozero - t.labas, { close: 1, wake: 0, mood: 1 }, "sine.inOut");
}
