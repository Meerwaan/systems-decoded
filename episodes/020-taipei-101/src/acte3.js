// 03 · RÉPONSE — from « Six heures cinquante-neuf » to « …c'est son record. » (tozero → toverdict). The climax.
// In cuts: one picture per breath of the voice. Every cut is laid a few frames before its sentence; the first one says
// the whole state ({ ...HERE, … }, built on STAGED): nothing is inherited from act 2.
//
// THE HEADER IS A RULER, AND IT TELLS THE TRUTH. `reach` is the ball's course at the end of a swing, in true cm, and
// it is only ever read off a WHOLE value of `swing` (the ball at the end of its course): 50 on « Cinquante », 70 on
// « Soixante-dix », 100 on « Un mètre ». The climax is played on a NEGATIVE course (`swing` even: 6): the gap that is
// left between the pin and the ring is then on the camera's side (docs/020-actes-maj.md).
//
//   « La butée est à un mètre cinquante… »  the pin crosses its ring under the eye, from +58 to −69 (swing 5.19 → 5.94)
//   « …et elle avance encore. »              ONE shot, no cut: the ball should stop at 70 like before — it does not. It
//                                            is held at the end of its course (swing → 6) while `reach` grows 70 → 100:
//                                            |course| = reach · cos(π·(6 − swing)) stays within 2 cm of the header, so the
//                                            header counts exactly what the gap bar loses (75 cm → 44)
//   « Un mètre. »                            tighter, the pin 44 cm from the ring: the picture HOLDS, nothing touches
//   « Les vérins freinent. »                 the near damper closes and glows veille — model.js doses that glow by the
//                                            ball's speed, which is zero at the end of a course: the cut overlaps the
//                                            action (swing back to 5.88, −93 cm) and the ball creeps the last cm, braked
//   « Elle s'arrête. »                       the glow dies as the ball stops; `mood` 1 → 0 ON the word: the relief
//
// The ball lags the tower by a quarter of a swing (world.js): when the tower is at the end of its lean (half values),
// the ball crosses its rest. « La tour part » leaves the right end (2.5); « La boule aussi » follows it to the left
// (4: −50); then 5: +70; then 6: −100. One straight line from « part » to « Cinquante »: no kink across the cut.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, CAGE } from "./world.js";

const [CX, CY, CZ] = CAGE.at;
const HEART = CY + 470; // the ball's centre in the tower

/* ── the poses (found with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the top third from outside, in the storm: the last modules bending, the ball a solid in the glass
const PEAK0 = { ...P, tx: 0, ty: 10500, tz: 0, d: 10500, az: -32, el: 3, fov: 36, shift: 0, side: 40 };
const PEAK1 = { ...PEAK0, d: 9800 };
// the tower from its foot, looking up: it crosses the whole frame
const LOW = { ...P, tx: 0, ty: 5600, tz: 0, d: 11500, az: -28, el: -34, fov: 55, shift: -150 };
// the cage aboard: the ball, its cradle, the dampers, the frame — the course reads against the cage
const CAGE0 = { ...P, tx: 0, ty: CY + 500, tz: 0, d: 3200, az: -36, el: 6, fov: 30, shift: 170 };
const CAGE1 = { ...CAGE0, d: 3000 };
// the pin in its ring, from above, through the ball turned to glass — closing in, slowly, for the whole sentence
const PIN0 = { ...P, tx: -40, ty: CY + 130, tz: 0, d: 2100, az: -24, el: 52, shift: 120 };
const PIN1 = { ...PIN0, tx: -70, d: 1750 };
// « Un mètre » : the pin and the near edge of the ring, the gap between them
const METER = { ...P, tx: -130, ty: CY + 125, tz: 0, d: 1100, az: -26, el: 40, shift: 40 };
// the near dampers, from three quarters, low (from above the glass floors veil them)
const DAMP0 = { ...P, tx: -250, ty: CY + 150, tz: 60, d: 1500, az: -40, el: 8, shift: 110 };
const DAMP1 = { ...DAMP0, d: 1400 };
// the cage whole, aboard, then the top in the rain, from far: the sway calms down
const BACK0 = { ...P, tx: 0, ty: CY + 600, tz: 0, d: 4300, az: -36, el: 6, fov: 30, shift: 170 };
const BACK1 = { ...PEAK0, d: 11000 };

/* ── the state ── */
// the typhoon at its peak: the tower swaying wide, the ball lagging in its cage, the light signal
const HERE = { ...STAGED, gel: 0.1 };
// the light: what it stands around, and how wide (aboard, world.js moves it with the cage)
const L_TOP = { fx: 0, fy: 9900, fz: 0, fs: 3000 };
const L_LOW = { fx: 0, fy: 7000, fz: 0, fs: 7000 };
const L_CAGE = { fx: CX, fy: HEART, fz: CZ, fs: 900 };
const L_RING = { fx: -60, fy: CY + 130, fz: 0, fs: 320 };
const L_DAMP = { fx: -300, fy: CY + 140, fz: 80, fs: 320 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);
/** STAGED without the sway: for a cut laid while the sway is already running (it must not jump). */
const STILL = { ...HERE };
delete STILL.swing;
delete STILL.reach;

export default function acte3({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    zero: "zero", tozero: "tozero", peak: "peak",
    totower: "zero:La-0.12", towergo: "towergo", ballgo: "ballgo", c50: "c50", c70: "c70",
    tobumper: "zero:La#3-0.12", bumper: "bumper", m150: "m150", still: "still", more: "more",
    toreponse: "toreponse", trigger: "trigger", brakes: "brakes", stops: "stops", returns: "returns",
    never: "never", record: "record", toverdict: "toverdict",
  });
  setAct(tl, 3, t.zero);

  /** The header answers a word: a beat on the course (#hud-clock) or on the bumper (#hud-count). */
  const beat = (sel, at, k = 1.16) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* ───────────── « Six heures cinquante-neuf. Le pic du typhon. » ───────────── */
  // the top of the tower from outside, the rain flying level. It sways from its left end to its right one, and on
  // « pic » it goes further than it ever has
  cut(t.tozero, SET.TOWER, PEAK0, { ...HERE, swing: 1.5, bend: 1.6, reach: 30, storm: 0.45, city: 0, ...L_TOP });
  shot(t.tozero, span(t.tozero, t.totower), PEAK1, "sine.inOut", PEAK0.d);
  st(t.tozero, span(t.tozero, t.towergo), { swing: 2.5 }, "none");
  st(t.peak, 0.9, { bend: 2.2, storm: 0.6 }, "sine.inOut");
  chip("chip-659", null, 96, 470, t.tozero + 0.15, t.totower - 0.15);

  /* ───────────── « La tour part. » ───────────── */
  // from its foot, looking up: the tower stands at the end of its lean — and on « part » it crosses the whole frame.
  // ONE straight line of `swing` from here to « Cinquante »: it does not stop at the cut that follows
  cut(t.totower, SET.TOWER, LOW, { ...STILL, bend: 2.5, reach: 30, storm: 0.6, axis: 1, city: 1, ...L_LOW });
  st(t.towergo, span(t.towergo, t.c50), { swing: 4 }, "none");

  /* ───────────── « La boule aussi. Cinquante centimètres. » ───────────── */
  // aboard the cage: it holds still, the rain sways. The ball, that waited, goes the same way the tower went, and the
  // header counts it: at the end of its course on « Cinquante », 50, signal
  cut(t.ballgo, SET.TOWER, CAGE0, { ...STILL, aboard: 1, bend: 1.6, storm: 0.8, datum: 1, ...L_CAGE });
  shot(t.ballgo, span(t.ballgo, t.tobumper), CAGE1, "sine.inOut", CAGE0.d);
  st(t.ballgo, span(t.ballgo, t.c50), { reach: 50 }, "sine.out");
  beat("#hud-clock", t.c50 + 0.05);

  /* ───────────── « Soixante-dix. » ───────────── */
  // the half-swing back, to the other side, further: 70 on the word
  st(t.c50, span(t.c50, t.c70), { swing: 5 }, "none");
  st(t.c50, span(t.c50, t.c70), { reach: 70 }, "sine.inOut");
  beat("#hud-clock", t.c70 + 0.05);

  /* ───────────── « La butée est à un mètre cinquante… et elle avance encore. » ───────────── */
  // from above, through the ball turned to glass: the ring, and in it the pin. The ring warms on the side the pin
  // goes to, a bar of signal says the gap that is left. The pin comes back across the ring (« un mètre
  // cinquante… »), slows where it stopped last time — 70 — and goes on (« avance encore »): the header counts what
  // the bar loses. ONE shot, closing in slowly: no cut until « Un mètre »
  st(t.c70, span(t.c70, t.still), { swing: 5.94 }, "sine.inOut");
  cut(t.tobumper, SET.TOWER, PIN0, { ...STILL, aboard: 1, bend: 1.6, storm: 0.8, xray: 1, limit: 1, datum: 1, ...L_RING });
  shot(t.tobumper, span(t.tobumper, t.toreponse), PIN1, "sine.inOut", PIN0.d);
  beat("#hud-count", t.bumper + 0.1, 1.2);
  st(t.still, span(t.still, t.trigger), { swing: 6 }, "sine.out");
  st(t.still, span(t.still, t.trigger), { reach: 100 }, "sine.out");
  chip("chip-butee", null, 96, 470, t.still, t.toreponse - 0.1);

  /* ───────────── « Un mètre. » ───────────── */
  // closer: the pin and the near edge of the ring, 44 cm of signal between them. It arrives — and THE PICTURE HOLDS:
  // nothing touches, nothing shakes
  cut(t.toreponse, SET.TOWER, METER, { ...STILL, aboard: 1, bend: 1.6, storm: 0.8, xray: 1, limit: 1, datum: 1, ...L_RING });
  beat("#hud-clock", t.trigger + 0.05, 1.2);

  /* ───────────── « Les vérins freinent. Elle s'arrête. » ───────────── */
  // the near dampers, from three quarters low. The cut overlaps the action: the ball is back a few cm (−93), still
  // moving — the damper it runs at closes and glows veille, the gland lights, the cylinders warm. Its last cm, braked:
  // the glow dies as the ball stops — and on « s'arrête » the relief: `mood` 0, the ring cools, the header (100 cm)
  // turns veille. Outside the rain still flies
  cut(t.brakes, SET.TOWER, DAMP0, { ...STILL, swing: 5.88, reach: 100, aboard: 1, bend: 1.6, storm: 0.8, xray: 0.6, limit: 1, brake: 1, heat: 0.4, ...L_DAMP });
  shot(t.brakes, span(t.brakes, t.returns), DAMP1, "sine.inOut", DAMP0.d);
  st(t.brakes, span(t.brakes, t.stops), { swing: 6 }, "sine.out");
  st(t.brakes, span(t.brakes, t.returns), { heat: 1 }, "sine.inOut");
  st(t.stops, 0.45, { mood: 0, gel: 0 }, "sine.inOut");
  st(t.stops, 0.7, { limit: 0 }, "sine.inOut");

  /* ───────────── « Elle repart dans l'autre sens. » ───────────── */
  // the cage whole, aboard: the ball comes back — and the cables pull the tower with it (a head of veille light climbs
  // them). The header keeps 100: it is the record
  cut(t.returns, SET.TOWER, BACK0, { ...STILL, swing: 6, reach: 100, aboard: 1, bend: 1.6, storm: 0.8, heat: 0.6, mood: 0, gel: 0, ...L_CAGE });
  st(t.returns, span(t.returns, t.toverdict), { swing: 7.3 }, "none");
  st(t.returns + 0.2, span(t.returns + 0.2, t.never), { pull: 1 }, "sine.inOut");

  /* ───────────── « On ne l'a jamais relevée plus loin : c'est son record. » ───────────── */
  // out of the cage, far back (by ratio): the top of the tower in the rain, its sway calming down
  shot(t.never, span(t.never, t.toverdict), BACK1, "sine.inOut", BACK0.d);
  st(t.never, span(t.never, t.toverdict - 0.3), { aboard: 0, storm: 0.6, bend: 1.2, heat: 0, pull: 0, ...L_TOP }, "sine.inOut");
  chip("chip-record", null, 96, 470, t.record, t.toverdict - 0.15);
}
