// 03 · RÉPONSE — from "Zéro": the clock starts again, the mechanism reacts, the climax. In cuts: a cut is
// laid a few frames BEFORE the sentence that motivates it, its pose is complete, its state says everything
// the picture needs (nothing is inherited). The mechanism follows the VOICE, word by word; the figures on
// screen stay exact. One panel at a time in the top slot, and it has left before the next cut.
import { setAct } from "@kit/overlay.js";
import { SET, HOME, VIEW, STAGED } from "./world.js";

export default function acte3({ D }) {
  const { tl, st, shot, cut, jolt, blip } = D;
  const t = D.times({ zero: "zero", tozero: "tozero", danger: "zero:danger", reponse: "reponse", trigger: "trigger", toverdict: "toverdict" });
  setAct(tl, 3, t.zero);
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.2, color: "#ff5b2e", duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%" }, t.zero);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: 0.6, ease: "power2.out" }, t.zero + 0.12);

  // "zéro. le danger arrive." — back in the scene, the system assembled, the threat on it
  cut(t.tozero, SET.SCENE, { ...VIEW.system, d: 150, az: -58, el: 10 }, { ...STAGED, shell: 0.5, threat: 0.6, heart: 0.8, mood: 1, fs: 30 });
  shot(t.tozero, t.reponse - t.tozero, { d: 120, az: -50 }, "sine.inOut");
  st(t.danger, 0.8, { threat: 1 }, "power2.in");
  jolt(t.zero, 0.3, 0.4);

  // "…le système réagit." — a light that has a place, never a veil over the whole picture (#flash ≤ 0.08)
  cut(t.reponse - 0.12, SET.SCENE, { ...VIEW.system, d: 70, az: -36, el: 20, tx: HOME[0], ty: HOME[1] + 2.5, tz: HOME[2] });
  shot(t.reponse - 0.12, t.toverdict - t.reponse, { d: 60, az: -28 }, "sine.inOut");
  st(t.trigger, 0.12, { heart: 6, threat: 0 }, "power2.out");
  st(t.trigger + 0.12, 1.0, { heart: 2, mood: 0 }, "power2.out");
  blip("#flash", t.trigger, 0.06, 0.03, 0.3);
  jolt(t.trigger, 0.45, 0.5);
}
