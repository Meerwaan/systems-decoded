// 01 · MENACE — SKELETON by the architect (it builds; the acte agent rewrites it whole: docs/049-actes.md › acte1.js).
// From POSE0 and FIRST, no cut at 0: under the phone in its holder, the dot jumps into the field on « saute ».
import { setAct } from "@kit/overlay.js";
import { VIEW } from "./world.js";

export default function acte1({ D }) {
  const { tl, st, shot, chip } = D;
  const t = D.times({ saute: "saute", micro: "micro", promesse: "promesse", lentes: "lentes", scene: "scene", cinq: "cinq", tobench: "tobench" });
  chip("chip-micro", null, 96, 470, t.micro, t.promesse - 0.15);
  chip("chip-orbite", null, 96, 470, t.lentes - 0.4, t.scene - 0.2);
  chip("chip-sol", null, 600, 470, t.lentes - 0.4, t.scene - 0.2);
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });
  st(t.saute, 0.5, { err: 1 }, "power2.inOut");
  st(0, t.cinq, { eta: 5 }, "none");
  shot(0, t.promesse, { d: 40 }, "sine.inOut");
  shot(t.promesse, t.scene - t.promesse, VIEW.up, "sine.inOut");
  shot(t.scene, t.tobench - t.scene, VIEW.plunge, "sine.inOut");
  st(t.scene, 1, { dot: 1, ditch: 1 }, "sine.inOut");
  st(t.cinq, t.tobench - t.cinq, { eta: 4.2 }, "none");
}
