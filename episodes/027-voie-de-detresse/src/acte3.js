// 03 · RÉPONSE — SKELETON (it builds; the act's builder rewrites it entirely: docs/027-actes.md, « acte3.js »).
// In cuts, one shot per breath: you steer right, the front wheels leave the bitumen and plunge into the gravel, the tyres
// sink, each turn pushes the gravel, about half a g — without the pedal — and the forty tonnes stop at RUN.stop.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, RUN, KMH } from "./world.js";

export default function acte3({ D }) {
  const { tl, st, cut } = D;
  const t = D.times({ zero: "zero", tozero: "tozero", braques: "braques", plongent: "plongent", trigger: "trigger", stop: "stop", toverdict: "toverdict" });
  setAct(tl, 3, t.zero);
  cut(t.tozero, SET.SCENE, VIEW.entry, { ...STAGED, s: RUN.zero, kmh: KMH, pedal: 1 });
  st(t.braques, 0.4, { steer: 0.5, pedal: 0 }, "power2.out");
  st(t.tozero, t.plongent - t.tozero, { s: RUN.entry }, "none");
  st(t.plongent, t.stop + 0.3 - t.plongent, { s: RUN.stop, kmh: 0 }, "power1.out");
  st(t.plongent, 1.2, { sink: 1, steer: 0 }, "power2.out");
  st(t.stop + 0.1, 0.5, { mood: 0 }, "sine.inOut");
}
