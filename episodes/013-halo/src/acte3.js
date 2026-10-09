// 03 · RÉPONSE — from "Impact." to the chute (tozero → toverdict). The climax, in cuts: this is where they make
// the tension. Each cut is laid a few frames before its sentence, its pose is complete and so is its state
// ({ ...STAGED, … }): nothing is inherited.
//
// ONE slow motion, from "Impact" to "l'acier": `ahead` goes down from 5.6 to 0 and never comes back up — each cut
// takes it where the shot before left it (the AHEAD table below is the whole story of that number). The header's
// speed comes down with it (`kmhAt`), its clock stays at T+0:00 until the fire, then runs to 28.
//
// Where the camera stands, and why:
//   · "Impact" and "L'arrière s'arrache" are filmed from the TRACK side: from behind the barrier the front breaks
//     up hidden by the steel, and the rear end is the far end of the car;
//   · "Ta coque… entre dans le rail" and the halo are filmed from BEHIND the barrier, where the cell comes out;
//   · the fire is behind the cell from there: the helmet and the ring stay readable in front of it. Your way out
//     ends on the track side, so that is where "tu es dehors" is filmed.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, LODGED } from "./world.js";

/* ── the one number of the slow motion: where each shot leaves the barrier (metres) ── */
const AHEAD = { hit: 3.4, torn: 2.3, through: 1.0 };
/** The speed the header shows for an `ahead`: 192 until the nose touches (3.75), then a steady deceleration to rest. */
const kmhAt = (a) => Math.round(192 * Math.sqrt(Math.min(a, 3.75) / 3.75));

/* ── the poses (found with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// "Impact": from the track side, the nose and the front wing going into the beams
const HIT0 = { ...P, tx: 0, ty: 30, tz: 230, d: 1000, az: 52, el: 22, fov: 30, shift: 150 };
const HIT1 = { ...HIT0, d: 940 };
// the tear, from close: the cell's rear bulkhead (left), the engine bolted on it, the rear wheels — from the track
// side, above. Then back and round to the whole of it: the cell in the steel (top), the rear end on the track (bottom)
const TEAR0 = { ...P, tx: 0, ty: 40, tz: -150, d: 700, az: 132, el: 24, fov: 30, shift: 120 };
const TEAR1 = { ...TEAR0, d: 660 };
const TORN = { ...P, tx: 20, ty: 30, tz: -190, d: 1280, az: 162, el: 32, fov: 30, shift: 170 };
// the cell coming through the steel, from behind the barrier: low and almost head-on (the hook's own place, wider)
const THROUGH0 = { ...P, tx: -5, ty: 70, tz: 40, d: 560, az: -14, el: 3, fov: 42, shift: 220, side: 80 };
const THROUGH1 = { ...THROUGH0, d: 500 };
// THE picture: your helmet under the ring, the top beam on it. It is VIEW.cockpit pushed DOWN (shift 80, not 150):
// at 150 the beam — the steel the sentence is about — runs behind the header
const KEY0 = { ...P, tx: 0, ty: 74, tz: 4, d: 440, az: -30, el: 13, shift: 80, side: 30 };
const KEY1 = { ...KEY0, d: 370 };
const KEY2 = { ...KEY0, d: 345, az: -34, el: 15, shift: 60 }; // …and round it a little: the space between the helmet and the steel opens
// the wreck and its fire · toward the cockpit in the fire (your foot) · then back and up with you as you stand:
// standing, your helmet is 1.77 m up — from closer it goes behind the header
const BURN0 = { ...P, tx: 0, ty: 80, tz: -20, d: 760, az: -40, el: 10, fov: 34, shift: 150 }; // (VIEW.lodged)
const BURN1 = { ...BURN0, tx: 5, ty: 83, tz: -8, d: 600 };
const BURN2 = { ...BURN0, tx: 8, ty: 105, tz: 8, d: 670, shift: 120 };
// from the track side: the whole fireball over the barrier — then toward you, standing in front of it
const OUT0 = { ...P, tx: 60, ty: 170, tz: -120, d: 1450, az: 135, el: 8, fov: 38, shift: 100 };
const OUT1 = { ...OUT0, ty: 120, d: 1080 }; // (VIEW.trackSide, a little closer)

const NOSE_LIGHT = { fx: 0, fy: 45, fz: 260, fs: 420 };
const JOINT_LIGHT = { fx: 0, fy: 45, fz: -130, fs: 260 };
const REAR_LIGHT = { fx: 20, fy: 45, fz: -200, fs: 520 };
const CELL_LIGHT = { fx: 0, fy: 72, fz: 30, fs: 170 };
const HEAD_LIGHT = { fx: 0, fy: 74, fz: 4, fs: 60 };
const WRECK_LIGHT = { fx: 0, fy: 72, fz: -20, fs: 300 };
const VEILLE = "#5cffb0";
const INK = "#e9e4d8";
/** A length of time between two cues, whatever the voice does to them. */
const gap = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, shot, cut, jolt, chip } = D;
  const t = D.times({
    tozero: "tozero", impact: "impact", torear: "zero:arri-0.14", tear: "tear", car: "zero:voiture", two: "two",
    tocell: "zero:coque-0.3", enters: "enters",
    toreponse: "toreponse", trigger: "trigger", stays: "stays", you: "reponse:toi", steel: "steel",
    tofire: "tofire", blaze: "blaze", foot: "foot", stuck: "feu:coinc-0.08", leaves: "feu:laisses-0.1", shoe: "shoe", s28: "s28", outside: "outside",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.impact);

  /* ══════════ « Impact. » ══════════ */
  // from the track side: the beams sweep in and the front of the car comes apart in them. Fast, then it slows —
  // the slow motion starts here. The header's clock answers the word
  cut(t.tozero, SET.TRACK, HIT0, { ...STAGED, sec: 0, ...NOSE_LIGHT });
  shot(t.tozero, gap(t.tozero, t.torear), HIT1, "sine.out", HIT0.d);
  st(t.tozero, gap(t.tozero, t.torear), { ahead: AHEAD.hit, kmh: kmhAt(AHEAD.hit) }, "power2.out");
  jolt(t.impact + 0.08, 0.35, 0.4);
  tl.to("#hud-clock", { scale: 1.2, duration: 0.1, ease: "power2.out", transformOrigin: "100% 50%" }, t.impact);
  tl.to("#hud-clock", { scale: 1, duration: 0.45, ease: "power2.out" }, t.impact + 0.1);

  /* ══════════ « L'arrière s'arrache : ta voiture se sépare en deux. » ══════════ */
  // "s'arrache": a kick, the hoses go taut and snap. "se sépare en deux": the rear end flies, and lies on the track
  // (the camera is on the joint for the first, and goes back with the piece that flies for the second)
  const land = Math.min(t.two + 0.2, t.tocell - 0.3);
  cut(t.torear, SET.TRACK, TEAR0, { ...STAGED, sec: 0, ahead: AHEAD.hit, kmh: kmhAt(AHEAD.hit), ...JOINT_LIGHT });
  shot(t.torear, gap(t.torear, t.car), TEAR1, "sine.out", TEAR0.d);
  shot(t.car, gap(t.car, land + 0.1), TORN, "sine.inOut", TEAR1.d);
  st(t.torear, gap(t.torear, t.tocell), { ahead: AHEAD.torn, kmh: kmhAt(AHEAD.torn) }, "none");
  st(t.tear, 0.3, { split: 0.14 }, "power2.out");
  jolt(t.tear, 0.3, 0.35);
  st(t.tear + 0.3, gap(t.tear + 0.3, t.car), { split: 0.2 }, "none");
  st(t.car, gap(t.car, land), { split: 1, ...REAR_LIGHT }, "sine.inOut");
  // (the label stands in the gap between the two halves: it comes once the pull-back has opened it)
  chip("chip-split", null, 96, 770, Math.min(t.car + 0.5, land - 0.2), t.tocell - 0.15);

  /* ══════════ « Ta coque, elle… entre dans le rail. » ══════════ */
  // from behind the barrier: the middle beam tears, the cell comes through — toward us
  cut(t.tocell, SET.TRACK, THROUGH0, { ...STAGED, sec: 0, ahead: AHEAD.torn, kmh: kmhAt(AHEAD.torn), split: 1, ...CELL_LIGHT });
  shot(t.tocell, gap(t.tocell, t.toreponse), THROUGH1, "sine.inOut", THROUGH0.d);
  st(t.tocell, gap(t.tocell, t.toreponse), { ahead: AHEAD.through, kmh: kmhAt(AHEAD.through) }, "none");
  // "Ta coque": the tub the voice means takes a faint veille, the time to be named — then it is steel against carbon
  st(t.tocell + 0.3, 0.3, { litCell: 0.35 }, "power2.out");
  st(t.enters, Math.min(0.5, gap(t.enters, t.toreponse - 0.05)), { litCell: 0 }, "sine.inOut");
  chip("chip-cell", null, 96, 470, t.tocell + 0.4, t.toreponse - 0.15);

  /* ══════════ « Et devant ton casque, l'arceau tient : il reste entre toi… et l'acier. » ══════════ */
  // the picture of the film. The top beam comes over your helmet; on "tient" the ring bears it — a white-hot line
  // where the steel leans; on "il reste entre toi" the space around your head, whole
  const rest = Math.min(t.steel + 0.55, t.tofire - 0.2);
  cut(t.toreponse, SET.TRACK, KEY0, { ...STAGED, sec: 0, ahead: AHEAD.through, kmh: kmhAt(AHEAD.through), split: 1, ...HEAD_LIGHT });
  shot(t.toreponse, gap(t.toreponse, t.trigger), KEY1, "sine.out", KEY0.d);
  shot(t.stays, gap(t.stays, t.tofire), KEY2, "sine.inOut", KEY1.d);
  st(t.toreponse, gap(t.toreponse, rest), { ahead: 0, kmh: 0 }, "none");
  st(t.trigger, 0.12, { stress: 1 }, "power2.out");
  st(t.trigger, 0.3, { litHalo: 1 }, "power2.out");
  jolt(t.trigger, 0.25, 0.4);
  st(t.stays, gap(t.stays, t.you + 0.3), { space: 0.85 }, "sine.inOut");
  st(rest - 0.25, gap(rest - 0.25, t.tofire), { stress: 0.3, fire: 0.15 }, "sine.inOut");

  /* ══════════ « Le feu. Ton pied est coincé : tu laisses ta chaussure. » ══════════ */
  // the wreck, lodged. The fire blooms on the word and the header's clock starts running
  const toout = t.s28 - 0.1;
  const isOut = Math.min(t.outside + 0.25, t.toverdict - 0.45); // you are on the ground, on "dehors"
  const up = Math.min(t.shoe + 0.4, toout - 0.1); // you are standing in the cockpit
  cut(t.tofire, SET.TRACK, BURN0, { ...STAGED, ...LODGED, sec: 0, fire: 0.15, litHalo: 1, space: 0.7, ...WRECK_LIGHT });
  st(t.blaze, 0.5, { fire: 0.5 }, "power2.out");
  st(t.blaze + 0.5, gap(t.blaze + 0.5, toout), { fire: 0.6 }, "none");
  st(t.blaze, gap(t.blaze, isOut), { sec: 28 }, "none");
  shot(t.blaze + 0.3, gap(t.blaze + 0.3, t.stuck + 0.2), BURN1, "sine.inOut", BURN0.d);
  shot(t.leaves, gap(t.leaves, up), BURN2, "sine.inOut", BURN1.d);
  // you push up… and fall back: your foot. Then you pull it out of the shoe, and stand
  st(t.foot, Math.min(0.45, gap(t.foot, t.stuck) * 0.8), { out: 0.18, space: 0.3 }, "power2.out");
  st(t.stuck, Math.min(0.3, gap(t.stuck, t.leaves) * 0.6), { out: 0.05 }, "power2.in");
  st(t.leaves, gap(t.leaves, up), { out: 0.5, space: 0 }, "power2.inOut");
  chip("chip-shoe", null, 96, 470, t.foot + 0.25, toout - 0.15);

  /* ══════════ « 28 secondes, environ… et tu es dehors. » ══════════ */
  // from the track side: the fireball over the barrier — and you, over the bent beam, out of it
  cut(toout, SET.TRACK, OUT0, { ...STAGED, ...LODGED, fire: 0.6, out: 0.5, litHalo: 0, ...WRECK_LIGHT });
  shot(toout, gap(toout, Math.min(isOut + 0.3, t.toverdict)), OUT1, "sine.inOut", OUT0.d);
  st(toout, gap(toout, t.outside), { fire: 1 }, "sine.inOut");
  const climb = Math.max(toout + 0.2, isOut - 0.75);
  st(climb, gap(climb, isOut), { out: 1 }, "sine.inOut"); // over the beam and down in one go: the crouch on the beam is never held
  tl.to("#hud-clock", { scale: 1.2, color: VEILLE, duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%" }, isOut);
  tl.to("#hud-clock", { scale: 1, color: INK, duration: 0.3, ease: "power2.out" }, isOut + 0.12);
  chip("chip-out", null, 96, 470, isOut - 0.35, t.toverdict - 0.15);
}
