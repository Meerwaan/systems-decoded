// 03 · RÉPONSE — `tozero` (49.99) → `toverdict` (67.29). SKELETON (to be rewritten in full by its agent):
// docs/051-actes.md, « ## acte3.js ». Stuck: the ridges, both flanks, the ship stops. Then the Oden: its tanks, the
// water changing side in 15 s, the roll, the hull free; back off, ram, the bow lays its weight, the ridge breaks.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED } from "./world.js";

export default function acte3({ D }) {
  const { tl, st, cut, jolt } = D;
  const t = D.times({ zero: "zero", tozero: "tozero", reponse: "reponse", rollFrom: "rollFrom", libere: "libere", recule: "recule", elan: "elan", trigger: "trigger", toverdict: "toverdict" });
  setAct(tl, 3, t.zero);
  cut(t.tozero, SET.ICE, VIEW.high, { ...STAGED, shok: 0, close: 1, wake: 0, mood: 1, prop: 0.8 });
  st(t.zero, 2, { ridge: 1, grip: 1 }, "sine.in");
  cut(t.reponse - 0.12, SET.ICE, VIEW.section, { ...STAGED, shok: 0, close: 1, ridge: 1, grip: 1, section: 1, mood: 1, prop: 0 });
  st(t.rollFrom, 1.1, { tanks: 1, pump: 1, heel: 6 }, "sine.inOut");
  st(t.libere, 0.6, { grip: 0, pump: 0 }, "sine.out");
  cut(t.recule - 0.1, SET.ICE, VIEW.bowSide, { ...STAGED, shok: 0, close: 1, ridge: 0, crest: 1, mood: 1, prop: 1 });
  st(t.recule, t.elan - t.recule, { run: -40 }, "sine.inOut");
  st(t.elan, t.trigger - t.elan, { run: 0, bend: 1 }, "power2.in");
  st(t.trigger, 0.3, { crack: 1, mood: 0 }, "power2.out");
  jolt(t.trigger, 0.45, 0.5);
}
