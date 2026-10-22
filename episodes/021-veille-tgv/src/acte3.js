// DOSSIER 021 — 03 RÉPONSE. From « La pédale se relève. » to « Et il prévient lui-même, par radio. » (tozero → toverdict).
// In cuts: the voice is chopped, one shot per breath, each one read in half a second. Every cut is laid a few frames
// before its sentence, its pose is complete and so is its state ({ ...STAGED, … }): nothing is inherited from act 2,
// nothing from the shot before.
//
// THE ORDER OF THE CAUSES, and no other (docs/021-actes.md): the pedal rises → ≈ 2.5 s → the bell → nobody → 2.5 s
// more → verdict: absent → the current is cut → the brakes' air vents → emergency braking → 2 320 m → stopped → the
// radio warns. The dial and its ring that empties are the hero: we come back to it for « Encore autant ».
//
// THE HEADER IS A SPEEDOMETER (main.js reads `kmh`). 255 km/h until « freinage d'urgence », then 255 → 0 in "none" to
// « arrêté » while `run` goes on by MPS × span / 2 in "power1.out" — the same constant deceleration: the picture shows
// the slowing down, the second readout counts the true distance (0 → 2 320 m, world.js `brakedOf`). Before that, EVERY
// shot on the line sees the world come at 70.8 m per film second: `run` moves in a straight line from the first cut.
// `mood` is 1 (signal) until « arrêté »: the release falls on the sentence where the system has won, not before.
//
// TACT: nobody in the cab, ever — no foot on the pedal (it rises on its own spring), the door at the back closed.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, MPS, KMH } from "./world.js";

/* ── the poses (found with `look`, docs/journal/021-acte3.md) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the pedal and the dial in ONE frame, under the desk: VIEW.system, a step back (the dial stays clear of the header)
const SYS0 = { ...P, tx: -833, ty: 172, tz: 4, d: 290, az: -38, el: 18, shift: -20 };
const SYS1 = { ...SYS0, d: 270 };
// the bell on the desk top in the foreground, the empty seat behind it: seen from the windscreen, on the seat's line
const BELL0 = { ...P, ...VIEW.bellCab, d: 184, az: -60, el: 18, shift: 60 }; // (az −72 put the desk's pale slab under the header)
const BELL1 = { ...BELL0, d: 170 };
// inside the cab from the windscreen: the empty seat, the closed door — held, almost still
const CAB0 = { ...P, ...VIEW.cab };
const CAB1 = { ...CAB0, d: 262 };
// the nose at night, from the front-left, further than the first frame (candidate (a) of the hook)
const NOSE0 = { ...P, tx: -900, ty: 255, tz: 0, d: 1750, az: -60, el: 3, fov: 34, shift: 60 };
const NOSE1 = { ...NOSE0, d: 1600 };
// the dial, close, in the cab: the hero
// (from higher, el 24: behind the box the knee space, not the side window — a mast passing close outside flashed
// through it for one frame, 52,87 s on the draft)
const DIAL0 = { ...P, tx: -850, ty: 197, tz: 7, d: 150, az: -16, el: 24, shift: 60 };
const DIAL1 = { ...DIAL0, d: 140 };
// the front power car: wire, pantograph, transformer, motors — « le courant est coupé »
const TRAC0 = { ...P, ...VIEW.traction };
const TRAC1 = { ...TRAC0, d: 2850 };
// the emergency valve under the cab floor, close, the brake pipe leaving toward the back; then back along the pipe
// (from a little above: behind it, the dark under the cab — lower, the smeared ballast makes a pale band)
const VALVE0 = { ...P, tx: -790, ty: 102, tz: 70, d: 150, az: -32, el: 10, shift: 40 };
const BRAKES = { ...P, ...VIEW.brakes };
// the line from high, front-left: the whole train in a diagonal, its brake pipe lit, the masts passing slower and
// slower (VIEW.wide, at 32 000, made the train a thread at the foot of the frame)
const WIDE0 = { ...P, tx: 2000, ty: 200, tz: 0, d: 12000, az: -55, el: 24, fov: 34, shift: 60 };
const WIDE1 = { ...WIDE0, d: 10800 };
// the front power car from the left: its cab cut open (the empty seat) on the left, the antenna on its roof in the
// middle, the night above it for the rings
const ROOF0 = { ...P, tx: -420, ty: 420, tz: 0, d: 1900, az: -40, el: 10, fov: 30, shift: 60 };
const ROOF1 = { ...ROOF0, d: 2050 };

/* ── the light: what it stands around, and how wide ── */
const L_SYS = { fx: -828, fy: 178, fz: 5, fs: 120 };
const L_BELL = { fx: -825, fy: 242, fz: 42, fs: 120 };
const L_CAB = { fx: -700, fy: 240, fz: 0, fs: 250 };
const L_NOSE = { fx: -900, fy: 255, fz: 0, fs: 1500 };
const L_DIAL = { fx: -850, fy: 195, fz: 7, fs: 60 };
const L_TRAC = { fx: 350, fy: 280, fz: 0, fs: 2200 };
const L_VALVE = { fx: -790, fy: 110, fz: 70, fs: 120 };
const L_BRAKES = { fx: 1600, fy: 80, fz: 0, fs: 3500 };
const L_WIDE = { fx: 6000, fy: 100, fz: 0, fs: 9000 };
const L_ROOF = { fx: -450, fy: 380, fz: 0, fs: 1300 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, tw, S, st, now, shot, cut, chip } = D;
  const t = D.times({
    tozero: "tozero", rises: "rises", secs: "secs", ring2: "ring2", bellword: "zero:sonnerie",
    noone: "noone", runs: "runs",
    again: "again", encore: "reponse:Encore", judge: "judge", trigger: "trigger",
    current: "current", coupe: "reponse:coupé", air: "air", escape: "reponse:s'échappe", urgence: "urgence",
    deux: "reponse:Deux", metres: "metres", stopped: "stopped", arrete: "reponse:arrêté",
    warns: "warns", radiow: "radiow", toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word: a beat on the speed (#hud-clock). */
  const beat = (sel, at, k = 1.18) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* ── the world comes at the train: from the first cut to the brakes, in a straight line; then it slows ── */
  const R0 = 0;
  const rBrake = R0 + MPS * span(t.tozero, t.urgence);
  const rStop = rBrake + (MPS * span(t.urgence, t.stopped)) / 2;
  tw.fromTo(S, { run: R0 }, { run: rBrake, duration: span(t.tozero, t.urgence), ease: "none", immediateRender: false }, t.tozero);
  tw.fromTo(S, { run: rBrake }, { run: rStop, duration: span(t.urgence, t.stopped), ease: "power1.out", immediateRender: false }, t.urgence);
  tw.fromTo(S, { kmh: KMH }, { kmh: 0, duration: span(t.urgence, t.stopped), ease: "none", immediateRender: false }, t.urgence);

  // the cab as this act finds it: night, the cab lit and EMPTY, the current flowing, the pedal just pressed
  const HERE = { ...STAGED, kmh: KMH, pedal: 1, count: 1, danger: 0, bell: 0, cut: 0, vent: 0, traction: 1, brake: 0, radio: 0, gel: 0 };
  // …once the bell rings: the pedal is up, the ring empty, signal
  const RINGING = { ...HERE, pedal: 0, count: 0, danger: 1, bell: 1, gel: 0.1 };
  // …once the verdict is in: the bell stops, the relay is open
  const JUDGED = { ...RINGING, bell: 0, cut: 1, gel: 0 };

  /* ───────────── « La pédale se relève. » ───────────── */
  // the camera that was on its way to the knee space, picked up close: the pedal and the dial in one frame. On
  // « relève » its spring lifts it — nobody's foot — and the ring, full, turns signal and starts to empty
  cut(t.tozero, SET.LINE, SYS0, { ...HERE, ...L_SYS });
  shot(t.tozero, span(t.tozero, t.ring2), SYS1, "sine.out", SYS0.d);
  st(t.rises, 0.35, { pedal: 0 }, "power3.out");
  now(t.rises + 0.05, { danger: 1 });

  /* ───────────── « Deux secondes et demie, environ. » ───────────── */
  // the same frame: the ring empties in a straight line, signal, from « relève » to « sonnerie »
  st(t.rises + 0.05, span(t.rises + 0.05, t.ring2), { count: 0 }, "none");
  chip("chip-25", null, 96, 470, t.secs - 0.1, t.ring2 - 0.15);

  /* ───────────── « Une sonnerie. » ───────────── */
  // from the empty ring to what it sets off: the bell in the foreground on the desk, the empty seat behind it
  cut(t.ring2, SET.LINE, BELL0, { ...RINGING, bell: 0, ...L_BELL });
  shot(t.ring2, span(t.ring2, t.noone), BELL1, "sine.out", BELL0.d);
  st(t.bellword, 0.25, { bell: 1 }, "power2.out");

  /* ───────────── « Personne ne répond. » ───────────── */
  // the cab from the windscreen: the empty seat, the door shut, the bell ringing in the foreground. Held
  cut(t.noone, SET.LINE, CAB0, { ...RINGING, ...L_CAB });
  shot(t.noone, span(t.noone, t.runs), CAB1, "sine.inOut", CAB0.d);

  /* ───────────── « Le train, lui… file toujours. » ───────────── */
  // from the cab's window to the cab seen from outside: the nose at night, the masts streaking past
  cut(t.runs, SET.LINE, NOSE0, { ...RINGING, ...L_NOSE });
  shot(t.runs, span(t.runs, t.again), NOSE1, "sine.inOut", NOSE0.d);

  /* ───────────── « Encore autant. » ───────────── */
  // the dial, close: on « Encore » the ring fills again, signal — and empties again, straight, to the verdict
  cut(t.again, SET.LINE, DIAL0, { ...RINGING, ...L_DIAL });
  shot(t.again, span(t.again, t.current), DIAL1, "sine.inOut", DIAL0.d);
  st(t.encore, 0.2, { count: 1 }, "power2.out");
  st(t.encore + 0.2, span(t.encore + 0.2, t.trigger), { count: 0 }, "none");

  /* ───────────── « Verdict : absent. » ───────────── */
  // the same frame: on « absent » the ring is empty; the bell stops, the relay opens
  chip("chip-verdict", null, 96, 470, t.judge, t.current - 0.15);
  st(t.trigger, 0.12, { bell: 0, gel: 0 }, "power2.out");
  st(t.trigger, 0.1, { cut: 1 }, "power3.out");

  /* ───────────── « Le courant est coupé. » ───────────── */
  // the traction chain: the current flows from the wire down the pantograph to the transformer and the motors —
  // and on « coupé » all of it goes dark at once
  cut(t.current, SET.LINE, TRAC0, { ...JUDGED, ...L_TRAC });
  shot(t.current, span(t.current, t.air), TRAC1, "sine.inOut", TRAC0.d);
  st(t.coupe, 0.2, { traction: 0 }, "power2.out");
  chip("chip-disjoncteurs", null, 96, 470, t.current + 0.3, t.air - 0.15);

  /* ───────────── « L'air des freins s'échappe : freinage d'urgence. » ───────────── */
  // the valve under the cab floor, close: on « s'échappe » it opens, the air leaves it. On « freinage » the camera
  // backs away along the brake pipe, behind the veille head that runs to the back: the bogies bite one after the other
  cut(t.air, SET.LINE, VALVE0, { ...JUDGED, traction: 0, ...L_VALVE });
  st(t.escape, 0.3, { vent: 1 }, "power2.out");
  const back = t.urgence - 0.1;
  const toWide = t.deux - 0.1; // a few frames before « Deux mille »
  shot(back, span(back, toWide), BRAKES, "sine.inOut", VALVE0.d);
  st(back, span(back, toWide), L_BRAKES, "sine.inOut");
  tw.fromTo(S, { brake: 0 }, { brake: 0.14, duration: span(t.urgence, toWide), ease: "sine.in", immediateRender: false }, t.urgence);
  chip("chip-urgence", null, 96, 470, t.urgence, toWide - 0.15);

  /* ───────────── « 2 320 mètres plus loin… le train est arrêté. » ───────────── */
  // the line from high: the head runs on to the tail, the train slows, the masts pass slower and slower — the header
  // counts the distance. On « arrêté » the speed is 0, nothing moves, and the film lets go: mood → veille
  // (the cut sets neither `kmh` nor `run` nor `brake`: they are halfway through their tweens)
  const { kmh: _k, brake: _b, ...MIDWAY } = JUDGED;
  cut(toWide, SET.LINE, WIDE0, { ...MIDWAY, traction: 0, vent: 1, ...L_WIDE });
  shot(toWide, span(toWide, t.warns - 0.1), WIDE1, "sine.inOut", WIDE0.d);
  void _k; void _b;
  tw.fromTo(S, { brake: 0.14 }, { brake: 1, duration: span(toWide, t.metres + 0.5), ease: "sine.out", immediateRender: false }, toWide);
  st(t.arrete - 0.04, 0.38, { mood: 0 }, "sine.inOut");
  beat("#hud-clock", t.stopped + 0.06);

  /* ───────────── « Et il prévient lui-même, par radio. » ───────────── */
  // the roof of the power car and its antenna: from « prévient » three veille rings leave into the night
  const toRoof = t.warns - 0.1;
  cut(toRoof, SET.LINE, ROOF0, { ...JUDGED, kmh: 0, mood: 0, traction: 0, vent: 1, brake: 1, ...L_ROOF });
  now(toRoof, { run: rStop });
  shot(toRoof, span(toRoof, t.toverdict), ROOF1, "sine.inOut", ROOF0.d);
  st(t.warns + 0.1, span(t.warns + 0.1, t.toverdict), { radio: 1 }, "none");
  chip("chip-radio", null, 96, 470, t.radiow - 0.2, t.toverdict - 0.15);
}
