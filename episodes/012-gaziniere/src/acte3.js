// 03 · RÉPONSE — from "La flamme est éteinte." to the chute (tozero → toverdict). The snap the film has promised
// since the hook, and that the header's clock has been waiting for in real time. In cuts — this is where they make
// the tension: the dead burner → the tip going dark → the lead paling → the heart in profile → the snap → the
// burner where the haze stops. Each cut is laid a few frames before its sentence, its pose is complete and its
// state too ({ ...STAGED, … }): nothing is inherited.
//
// In the kitchen the story never goes back: `heat` 0.6 → 0.12, `volts` 0.66 → under the threshold (0.36) just
// before "lâche", then `hold` → 0, then `valve` → 0 on "claque", then `gas` → 0, then `mood` → 0. `flame` stays 0.
//
// Where the camera stands, and why:
//   · the gauge (#gauge) holds the top slot from "La pointe" to the snap: 480 → 680 px, opaque. Every picture it
//     plays over is pushed DOWN (a small `shift`): the tip, the lead and the heart all stand under 690;
//   · under the top the camera stays at the height of the worktop's own thickness (y 86 → 90) and looks level:
//     from below, that slab is a white band across the picture (VIEW.under). And it stands in FRONT of the hob
//     (az −55), not beside it: from az −62 … −78 at 35 cm and more, the kitchen's glass sink (x 98 → 144, z 14 → 50)
//     comes between the camera and the lead — a pale hill over half the picture;
//   · the heart is filmed in profile from 24 cm (az −78): near enough for the sink to stay out of the left edge;
//   · the frame of the snap does not move while it snaps: the camera has finished closing in when the voice names
//     the spring, the spring lights up — and on "claque" the only thing that moves in the picture is the valve.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED } from "./world.js";

/* ── the poses (found with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the dead burner under the saucepan, from the left: the crown without a flame, the haze leaving
const DEAD0 = { ...P, tx: 166, ty: 93.0, tz: 35.5, d: 52, az: -58, el: 5, shift: 230 };
const DEAD1 = { ...DEAD0, d: 46 };
// the tip, from close (under the gauge)
const TIP0 = { ...P, tx: 163.1, ty: 92.8, tz: 38.9, d: 23, az: -42, el: 8, shift: 110 };
const TIP1 = { ...TIP0, d: 20 };
// under the top: the lead from the foot of the tip (top left, under the gauge) down to the magnet unit (right)
const UNDER = { ...P, tx: 163, ty: 88.4, tz: 42.8, d: 36, az: -55, el: 2, shift: 130, side: 110 };
const UNDER1 = { ...UNDER, ty: 88.2, tz: 43.2, d: 34.5 }; // …and it leans toward the magnet (further, the lead leaves by the left edge)
// the heart in profile: the frame of the snap
const HEART0 = { ...P, tx: 163, ty: 86.9, tz: 47.4, d: 26.5, az: -78, el: 8, shift: 40, side: 30 };
const HEART = { ...HEART0, d: 23.5 };
// the burner again, on the axis of the pull-back that follows — then the saucepan and the hob, calm
const SHUT0 = { ...P, tx: 166, ty: 93.4, tz: 35, d: 56, az: -34, el: 7, shift: 150 };
const SHUT1 = { ...SHUT0, d: 52 };
const BILAN = { ...P, tx: 166, ty: 99, tz: 34, d: 106, az: -36, el: 10, fov: 40, shift: 90 }; // (the foam's dome stays under the label of the top slot)

const TIP_LIGHT = { fx: 163, fy: 93, fz: 39, fs: 12 };
const UNDER_LIGHT = { fx: 163, fy: 88, fz: 44, fs: 12 };
const HEART_LIGHT = { fx: 163, fy: 87, fz: 47, fs: 6 };
const FRAME = 1 / 30;
const SIGNAL = "#ff5b2e";
const VEILLE = "#5cffb0";
const INK = "#e9e4d8";
/** A length of time between two cues, whatever the voice does to them. */
const gap = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, shot, cut, jolt, chip } = D;
  const t = D.times({
    tozero: "tozero", zero: "zero", cool: "cool", courant: "zero:courant", drop: "drop", drop2: "drop2",
    torelease: "torelease", release: "release", ressort: "reponse:ressort", trigger: "trigger", gaz: "reponse:gaz", shut: "shut",
    tobilan: "tobilan", few: "few", hundreds: "hundreds", toverdict: "toverdict",
  });
  setAct(tl, 3, t.zero);

  /* ══════════ « La flamme est éteinte. » ══════════ */
  // the burner under the saucepan: forty ports, not one flame — and the haze that keeps leaving them
  const toTip = t.cool - 0.25;
  cut(t.tozero, SET.KITCHEN, DEAD0, { ...STAGED });
  shot(t.tozero, gap(t.tozero, toTip), DEAD1, "sine.out", DEAD0.d);
  st(t.tozero, gap(t.tozero, toTip), { heat: 0.56, volts: 0.645 }, "none"); // the story runs: the tip goes on cooling

  /* ══════════ « La pointe refroidit. » ══════════ */
  // from close: its red dies while the voice says it. The gauge comes in: it reads the current the tip still makes
  const toWire = t.courant - 0.15;
  cut(toTip, SET.KITCHEN, TIP0, { ...STAGED, heat: 0.56, volts: 0.645, ...TIP_LIGHT });
  shot(toTip, gap(toTip, toWire), TIP1, "sine.inOut", TIP0.d);
  st(t.cool, gap(t.cool, toWire + 0.4), { heat: 0.12 }, "power1.out");
  st(toTip + 0.02, gap(toTip + 0.02, t.drop - 0.02), { volts: 0.6 }, "none");
  tl.set("#gauge-s1", { opacity: 0 }, 0);
  tl.fromTo("#gauge", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.cool);

  /* ══════════ « Le courant baisse… baisse… » ══════════ */
  // down the lead, through the glass of the top, to the magnet it feeds: the tap and the can turn to glass on the
  // way. On each "baisse" the veille of the lead pales — the gauge comes down toward its threshold
  const atWire = t.drop2 - 0.1;
  shot(toWire, gap(toWire, atWire), UNDER, "sine.inOut", TIP1.d);
  st(toWire, 0.7, { xray: 1 }, "sine.inOut");
  st(toWire, gap(toWire, atWire), { ...UNDER_LIGHT }, "sine.inOut");
  st(t.drop, gap(t.drop, atWire), { volts: 0.48 }, "sine.out");
  st(t.drop2, gap(t.drop2, t.torelease - 0.06), { volts: 0.39 }, "sine.out");
  shot(atWire, gap(atWire, t.torelease), UNDER1, "sine.inOut", UNDER.d);

  /* ══════════ « L'aimant lâche. » ══════════ */
  // the heart, in profile, of glass. The current goes under the threshold just before the word: the gauge turns
  // signal. On the word the magnet's veille dies — nothing holds the armature any more
  const cross = t.release - 0.1;
  const atHeart = t.ressort - 0.05;
  cut(t.torelease, SET.KITCHEN, HEART0, { ...STAGED, xray: 1, heat: 0.12, volts: 0.39, ...HEART_LIGHT });
  shot(t.torelease, gap(t.torelease, atHeart), HEART, "sine.inOut", HEART0.d);
  st(t.torelease + 0.02, gap(t.torelease + 0.02, cross), { volts: 0.362 }, "none");
  st(cross, 0.35, { volts: 0.3 }, "sine.out");
  tl.to("#gauge-fill", { backgroundColor: SIGNAL, duration: 0.12 }, cross + 0.03);
  tl.to("#gauge-s0", { opacity: 0, duration: 0.1 }, cross + 0.03);
  tl.to("#gauge-s1", { opacity: 1, duration: 0.1 }, cross + 0.13);
  st(t.release + 0.02, 0.15, { hold: 0 }, "power2.in");

  /* ══════════ « Le ressort claque. » ══════════ */
  // the camera has stopped. "Le ressort": it lights up, the armature starts to peel off the poles… "claque": the
  // valve is on its seat in three frames, the gas stops in the tube. A light knock, and nothing else moves
  const toShut = t.gaz - 0.2;
  const snap = t.trigger - 3 * FRAME;
  const peel = Math.min(t.release + 0.3, snap - 0.1);
  st(cross + 0.35, gap(cross + 0.35, toShut - 0.03), { volts: 0.16 }, "none");
  st(Math.min(t.ressort, snap - 0.25), 0.2, { litSpring: 1 }, "power2.out");
  st(peel, gap(peel, snap), { valve: 0.93 }, "sine.in");
  st(snap, 3 * FRAME, { valve: 0 }, "power4.in");
  jolt(t.trigger, 0.3, 0.35);
  // the header's clock has counted the true seconds since the flame went out: it stops here (main.js) — and says so
  tl.to("#hud-clock", { scale: 1.2, color: VEILLE, duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%" }, t.trigger);
  tl.to("#hud-clock", { scale: 1, color: INK, duration: 0.6, ease: "power2.out" }, t.trigger + 0.12);
  // the gauge has said what it had to
  tl.to("#gauge", { opacity: 0, y: -24, duration: 0.2, ease: "power2.in" }, Math.min(t.trigger + 0.35, toShut - 0.25));

  /* ══════════ « Le gaz est coupé. » ══════════ */
  // the burner: the haze thins and stops. The light turns veille
  cut(toShut, SET.KITCHEN, SHUT0, { ...STAGED, valve: 0, hold: 0, heat: 0.1, volts: 0.12 });
  shot(toShut, gap(toShut, t.tobilan), SHUT1, "sine.out", SHUT0.d);
  st(toShut + 0.04, gap(toShut + 0.04, t.shut + 0.24), { gas: 0 }, "sine.inOut");
  st(t.shut, 0.3, { mood: 0 }, "sine.inOut");
  chip("chip-coupe", null, 96, 470, t.shut + 0.05, t.few - 0.25);

  /* ══════════ « Il est sorti quelques litres de gaz. Pas des centaines. » ══════════ */
  // a calm pull-back to the saucepan and the hob. The header's counter answers "quelques litres"
  shot(t.tobilan, gap(t.tobilan, t.hundreds), BILAN, "sine.inOut", SHUT1.d);
  shot(t.hundreds, gap(t.hundreds, t.toverdict), { d: BILAN.d * 1.03 }, "sine.inOut"); // …and it never quite stops
  st(t.tobilan, gap(t.tobilan, t.toverdict - 0.05), { heat: 0, volts: 0, boil: 0.12 }, "sine.out"); // the tip is cold, the water still
  tl.to("#hud-count", { scale: 1.14, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%" }, t.few + 0.1);
  tl.to("#hud-count", { scale: 1, duration: 0.4, ease: "power2.inOut" }, t.few + 0.24);
  chip("chip-300", null, 96, 470, t.hundreds, t.toverdict - 0.2);
}
