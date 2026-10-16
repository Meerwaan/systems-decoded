// 01 · MENACE — accroche → curiosite (0 → 11,17 s), IN THE CAR (FIRST: crash 0.6, lunge 1 — the instant is frozen).
// ONE movement, no cut: POSE0 (outside, three quarters front, your head in the web) pushes in while the web and its
// rings open → turns to the profile (the head in the raked glass) → CUTS to the glass's edge, passenger side
// (two glasses, the veille film between them: « moins d'un millimètre ») → CUTS, the same way of looking, to the
// driver's side window (one glass, no film) → on « pas » the film goes out. acte2 cuts at `lancement`.
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW, L01_AT, SET } from "./world.js";

// the windshield's edge, passenger side, seen along x (looked at: the film a veille line on the glass's edge)
const EDGE = { tx: 40, ty: 132, tz: -57, d: 32, az: -95, el: 6, fov: 34, shift: -120, side: 0, roll: 0, drift: 0.3 };
// the driver's side window from outside, the same way of looking (+x) as EDGE: no turn, a pull-back
const SIDE_OUT = { tx: -88, ty: 122, tz: 8, d: 150, az: -72, el: 12, fov: 30, shift: 40, side: 0, roll: 0, drift: 0.3 };

export default function acte1({ D }) {
  const { st, now, shot, cut } = D;
  const t = D.times({
    casse: "accroche:casse", promesse: "promesse", moins: "promesse:moins",
    curiosite: "curiosite", vitre: "curiosite:vitre", pas: "curiosite:pas", end: "lancement",
  });
  setAct(D.tl, 1, 0);

  // A — it moves from frame 1: the web opens around your head, its rings jump on « casse », the film shows it holds
  st(0, 3.8, { web: 1, stick: 0.3 }, "power2.out");
  st(0, t.casse, { rings: 0.6 }, "power2.out");
  st(t.casse, 0.3, { rings: 1 }, "power3.out");
  now(0, { l01: L01_AT.accroche });
  shot(0, t.promesse - 0.55, { ty: 134, d: 140, az: -140, el: 10 }, "sine.inOut", POSE0.d);

  // B — the same move turns to the profile, then cuts to its edge: the film lights between two glasses
  now(t.promesse, { l01: L01_AT.promesse });
  const hook2At = t.promesse + 0.65;
  shot(t.promesse - 0.55, hook2At - (t.promesse - 0.55), { ...VIEW.hook2 }, "sine.inOut");
  // the profile → the edge is a CUT on « moins » (a dive through the web smeared the frame: qa 39 at 6,0 s, then a
  // ratio dive still streaked the web at 6,0). The raccord is the shape: the raked glass, a diagonal rising to the
  // right, becomes its own edge, the same diagonal; then a slow push to « millimètre »
  shot(hook2At, t.moins - 0.15 - hook2At, { d: VIEW.hook2.d - 15 }, "sine.inOut");
  const edgeAt = t.moins - 0.15;
  cut(edgeAt, SET.CAR, EDGE);
  st(t.moins - 0.2, 0.6, { litFilm: 1 }, "power2.out");
  shot(edgeAt, t.curiosite - 0.15 - edgeAt, { d: 26 }, "sine.inOut");

  // C — your side window: one glass, no film. On « pas », the film goes out — the thread is open.
  // a CUT, not a pull-back (the pull-back crossed your glass body at speed: a parasite frame at 8,27 s). The raccord is
  // the way of looking: the same +x, the windshield's edge → the side window, then a slow push
  const sideAt = t.curiosite - 0.15;
  cut(sideAt, SET.CAR, SIDE_OUT, { sideOn: 1 });
  shot(sideAt, t.end - sideAt, { d: 135 }, "sine.inOut");
  now(t.curiosite, { l01: L01_AT.curiosite });
  st(t.pas - 0.05, 0.35, { litFilm: 0 }, "power2.in");
  now(t.pas, { fils: 1 });
}
