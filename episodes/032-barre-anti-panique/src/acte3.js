// 03 · RÉPONSE — from « 1883, Sunderland » to « Et la salle respire » (tozero → toverdict). The climax, in cuts.
// Every cut is laid a few frames before its sentence; its pose is complete and so is its state ({ ...PAST, … },
// { ...STAGED, … }): nothing is inherited from the act before, nothing from the shot before.
//
// 1883 is filmed from OUTSIDE the door, the side nobody stood on: from there the stairs rise behind the wall with the
// children packed on them, the door at their foot (seen from the landing, the children of the front rows fill the
// lens and hide the gap). « Une porte » : the camera comes down to it. « Sans barre » : its leaf, close, the outline
// of the bar where there is none. « Un verrou » : the bolt in the floor, close — it slams home on its word. « Un enfant
// à la fois » : one child, alone, comes out through the gap toward us; the others stay behind the glass. « 183 enfants
// meurent » : back to the stairs, and the surge dies — everything stops, nothing falls.
//
// Today, the same game played again with the bar. Your hip on it; it lights up on « barre » and goes in on
// « appuie ». « Le levier s'enfonce » : a cut to the box and the strike (the bolt jammed, signal) — the bar goes home,
// and on « sort » the bolt leaves the strike. « …malgré la foule » : the cut OUTSIDE, the frame of the hook — you
// pressed on the glass, the crowd's arrows still on the leaf, the crowd still pushing. « La porte bascule dehors » :
// in the same shot the leaf swings out toward us while the camera rises and pulls back; « Et la salle respire » :
// the crowd pours out into the light, the picture turns veille.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, PAST, GACHE } from "./world.js";

/* ── the poses (found with `look`, .cache/planches/032/acte3/) ── */
const P = { fov: 36, side: 0, roll: 0, drift: 0.3, dof: 0 };
// 1883 from outside and high: the door at the bottom of the frame, the stairs rising behind it, the children on them
const STAIRS = { ...P, tx: 0, ty: 110, tz: 150, d: 880, az: -165, el: 30, fov: 38, shift: 40 };
// the descent ends on the door, from outside: the leaf ajar inward, the children behind the glass
const DOOR83 = { ...P, tx: -10, ty: 88, tz: 12, d: 420, az: -161, el: 20, shift: 70 };
// « Sans barre » : the leaf's face where the bar would be (the bar's place on the leaf held ajar ≈ (14, 96, 30))
const EMPTY = { ...P, tx: 14, ty: 96, tz: 30, d: 290, az: -170, el: 8, fov: 32, shift: 90 };
const EMPTY1 = { ...EMPTY, d: 270 };
// « Un verrou » : the bolt shot into the floor at the leaf's free edge
const BOLT = { ...VIEW.bolt };
const BOLT1 = { ...BOLT, d: 128 };
// « un enfant à la fois » : the gap from outside, high — the one child who comes out walks toward the lens, alone
const GAP = { ...P, tx: -36, ty: 62, tz: -10, d: 460, az: -168, el: 22, shift: 60 };
const GAP1 = { ...GAP, d: 430 };
// « 183 enfants meurent » : the stairs again, a little more from the side; a slow pull-back
const HELD = { ...STAIRS, az: -156, d: 860 };
const HELD1 = { ...HELD, d: 940 };
// today: your hip on the bar, the bar across the frame
const HIP = { ...VIEW.hip };
const HIP1 = { ...HIP, d: 108 };
// the box and the strike, in the door, from the hall on the hinge side (the very frame act 2 handed over at the threshold)
const LATCH = { ...VIEW.latch };
const LATCH1 = { ...LATCH, d: 64 };
// outside, low: the frame of the hook a step back — you on the glass, the bar, the crowd's arrows, the crowd
const OUT = { ...P, tx: -5, ty: 110, tz: 30, d: 420, az: -150, el: -4, fov: 40, shift: 110 };
// the leaf swung out, the camera risen and pulled back: the crowd pouring into the light
const OPEN = { ...P, tx: 0, ty: 85, tz: -40, d: 680, az: -152, el: 20, fov: 38, shift: 120 };

/* ── the light: what it stands around, and how wide ── */
const L_STAIRS = { fx: 0, fy: 80, fz: 160, fs: 600 };
const L_DOOR83 = { fx: -10, fy: 80, fz: 12, fs: 300 };
const L_EMPTY = { fx: 14, fy: 96, fz: 30, fs: 90 };
const L_BOLT = { fx: -42, fy: 18, fz: 40, fs: 60 };
const L_GAP = { fx: -38, fy: 60, fz: 0, fs: 260 };
const L_HIP = { fx: -6, fy: 96, fz: 14, fs: 90 };
const L_LATCH = { fx: GACHE.at[0] + 4, fy: GACHE.at[1], fz: GACHE.at[2], fs: 40 };
const L_OUT = { fx: 0, fy: 105, fz: 20, fs: 320 };
const L_OPEN = { fx: 0, fy: 90, fz: -60, fs: 520 };

export default function acte3({ D }) {
  const { tl, st, shot, cut, punch, chip } = D;
  const t = D.times({
    tozero: "tozero", sunderland: "sunderland", porte: "porte3",
    sans: "sans", verrou: "verrou", enfant: "enfant", n183: "n183",
    torejoue: "torejoue", barre: "reponse:barre", appuie: "appuie", levier: "levier2", enfonce: "enfonce",
    trigger: "trigger", malgre: "malgre", bascule: "bascule", dehors: "dehors",
    et: "reponse:et", respire: "respire", toverdict: "toverdict",
  });
  t.un = t.verrou - 0.12; // « Un verrou »
  t.child = t.enfant - 0.13; // « un enfant »
  setAct(tl, 3, t.tozero + 0.12);

  /* ───────────── « 1883, Sunderland. » — the same door, 1883: the stairs, the children packed on them ───────────── */
  cut(t.tozero, SET.SALLE, STAIRS, { ...PAST, ...L_STAIRS });
  chip("chip-1883", null, 96, 470, t.tozero + 0.15, t.sunderland + 0.75);

  /* ───────────── « En bas d'un escalier, une porte. » — the camera comes down to the door at their foot ───────────── */
  const down = t.tozero + 0.3;
  shot(down, t.porte + 0.1 - down, DOOR83, "sine.inOut", STAIRS.d);
  st(down, t.porte - down, L_DOOR83, "sine.inOut");

  /* ───────────── « Sans barre. » — the leaf, close: the outline of the bar where there is none ───────────── */
  const toEmpty = t.sans - 0.2;
  // the children behind the leaf pale for this one breath: the outline of the missing bar is the subject
  cut(toEmpty, null, EMPTY, { ...L_EMPTY, ghost: 0, crowd: 0.25 });
  shot(toEmpty, t.un - 0.12 - toEmpty, EMPTY1, "sine.inOut");
  st(t.sans, 0.2, { ghost: 1 }, "sine.out");

  /* ───────────── « Un verrou : » — the bolt in the floor; it slams home on its word ───────────── */
  const toBolt = t.un - 0.12;
  cut(toBolt, null, BOLT, { ...L_BOLT, ghost: 0, crowd: 1, bolt: 0.8 });
  shot(toBolt, t.child - 0.12 - toBolt, BOLT1, "sine.inOut");
  st(t.verrou, 0.12, { bolt: 1 }, "power3.out");
  punch(t.verrou, 0.06);

  /* ───────────── « un enfant à la fois. » — from outside, one child comes out through the gap, alone ───────────── */
  const toGap = t.child - 0.12;
  cut(toGap, null, GAP, { ...L_GAP, bolt: 1, slip: 0 });
  shot(toGap, t.n183 - 0.12 - toGap, GAP1, "sine.inOut");
  st(t.child - 0.1, 1.0, { slip: 0.9 }, "sine.inOut"); // out on « fois », a step in front of the wall, alone

  /* ───────────── « 183 enfants meurent. » — the stairs again: the surge dies, everything stops; nothing falls ───────────── */
  const toHeld = t.n183 - 0.12;
  cut(toHeld, null, HELD, { ...L_STAIRS, slip: 0, press: 1 });
  shot(toHeld, t.torejoue - toHeld, HELD1, "sine.inOut");
  st(t.n183 + 0.1, 1.1, { press: 0.3 }, "sine.out");
  chip("chip-183", null, 96, 470, t.n183 - 0.04, t.torejoue - 0.1);

  /* ───────────── « On rejoue, avec la barre. » — today, your hip on the bar; it lights up on its word ───────────── */
  cut(t.torejoue, SET.SALLE, HIP, { ...STAGED, load: 1, press: 1, ...L_HIP });
  shot(t.torejoue, t.levier - 0.12 - t.torejoue, HIP1, "sine.inOut");
  st(t.barre - 0.04, 0.5, { litBar: 1 }, "sine.out");

  /* ───────────── « Ta hanche appuie. » — the bar goes in a little under your hip ───────────── */
  st(t.appuie - 0.04, 0.32, { push: 0.35 }, "power2.out");

  /* ───────────── « Le levier s'enfonce. » — the box and the strike: the bar goes home, the bolt still jammed ───────────── */
  const toLatch = t.levier - 0.24;
  cut(toLatch, null, LATCH, { ...L_LATCH, see: 1, jam: 1, push: 0.35, pene: 0, litBar: 1 });
  shot(toLatch, t.malgre - 0.12 - toLatch, LATCH1, "sine.inOut");
  st(t.enfonce, 0.35, { push: 1 }, "power2.out");

  /* ───────────── « Le pêne sort de la gâche… » — on « sort », the bolt leaves the strike (the header: « Libre ») ───────────── */
  st(t.trigger, 0.2, { pene: 1 }, "power2.out");
  st(t.trigger, 0.3, { jam: 0, litPene: 1 }, "sine.out");

  /* ───────────── « …malgré la foule. » — outside, the frame of the hook: the crowd still pushing, the bolt out ───────────── */
  const toOut = t.malgre - 0.12;
  cut(toOut, null, OUT, { ...L_OUT, see: 0, jam: 0, push: 1, pene: 1, litPene: 1, litBar: 1, load: 1, press: 1 });
  chip("chip-libre", null, 96, 470, t.malgre + 0.02, t.bascule - 0.1);

  /* ───────────── « La porte bascule dehors. » — the leaf swings out toward us; the camera rises and pulls back ───────────── */
  st(t.bascule - 0.06, 0.8, { swing: 1, arcOut: 1 }, "sine.out");
  st(t.bascule, 1.0, { outside: 1, load: 0 }, "sine.inOut");
  const rise = t.bascule - 0.5; // « La porte… »
  shot(rise, t.toverdict - 0.05 - rise, OPEN, "sine.inOut", OUT.d);
  st(rise, t.toverdict - 0.3 - rise, L_OPEN, "sine.inOut");
  punch(t.dehors, 0.05);

  /* ───────────── « Et la salle respire. » — the crowd pours out into the light; the picture turns veille ───────────── */
  st(t.et - 0.02, 0.35, { mood: 0 }, "sine.inOut");
  st(t.et - 0.1, t.toverdict - 0.15 - (t.et - 0.1), { flow: 1 }, "sine.inOut");
  st(t.et, 0.9, { press: 0 }, "sine.out");
}
