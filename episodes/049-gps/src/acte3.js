// 03 · RÉPONSE — SKELETON by the architect (it builds; the acte agent rewrites it whole: docs/049-actes.md › acte3.js).
// Cut back to the road at `tozero`; three spheres meet in the field, a fourth, the clock corrected, they meet on the road.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED } from "./world.js";

export default function acte3({ D }) {
  const { tl, st, shot, cut } = D;
  const t = D.times({ zero: "zero", tozero: "tozero", spheres: "spheres", quatrieme: "quatrieme", trigger: "trigger", toverdict: "toverdict" });
  setAct(tl, 3, t.zero);
  cut(t.tozero, SET.ROAD, VIEW.climax, { ...STAGED, eta: 4.2, err: 1, dot: 1, sats: 3, ditch: 1 });
  st(t.spheres, 0.8, { spheres: 3 }, "sine.inOut");
  st(t.quatrieme, 1, { sats: 4, spheres: 4 }, "sine.inOut");
  st(t.trigger, 0.6, { err: 0, mood: 0 }, "power2.inOut");
  st(t.tozero, t.toverdict - t.tozero, { eta: 0 }, "none");
  shot(t.tozero, t.toverdict - t.tozero, { d: 3600 }, "sine.inOut");
}
