// 03 · RÉPONSE — from "Quelqu'un est coincé." to "…le champ tombe, en quelques secondes." (tozero → toverdict). The climax.
// In cuts. Every cut is laid a few frames before its sentence, its pose is complete and so is its state ({ ...HERE, … },
// built on STAGED): nothing is inherited from the act before, nothing from the shot before.
//
// THE HEADER TELLS THE TWO BUTTONS APART. The emergency stop: « Machine » turns to « Arrêtée » — and the big readout
// does not move: 1,5 T, signal. The magnet stop: nothing in the header answers at once — the causes come first, in
// the voice's order and no other: the wire warms (`hot`) → the helium boils (`boil`) → it leaves by the pipe (`plume`)
// → and only then the field comes down (`tesla` → 0: the readout counts down and turns veille at zero).
//
// Where the camera stands, and why:
//   · the machine's front, from the −x side (the key light's): the cylinder flat on it, someone held behind it, in
//     full — never closer: a body of glass on a pale front. Three times the same place, on purpose: someone is held
//     there; the machine goes dark and nothing lets go (a step back: the field's lines fill the room); the field
//     falls, the cylinder slides to the floor;
//   · you at the box, from behind (your LEFT hand): in full for the emergency stop; then the same frame closes on the
//     box for the other button — the flap is up BEFORE the fingers go under it;
//   · inside the machine (covers of glass, the room dimmed): the rings in three quarters from the side, so that the
//     warm stretch is seen going from ring to ring — and so that neither the cylinder nor the person, who stand at the
//     mouth, are in the frame. From there ONE move climbs with the cold up the pipe, past the roof, to the open air.
// No field line is drawn at the box nor inside the machine (`seen` 0: they would cross the picture in thick bands).
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, VIEW } from "./world.js";

/* ── the poses (found with `look`; what lies between two of them is arithmetic) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the mouth of the tunnel: the cylinder, the person behind it — head at y ≈ 550, feet at ≈ 1150
const MOUTH0 = { ...P, ...VIEW.mouth };
const MOUTH1 = { ...MOUTH0, d: 1060 };
// the same front, a little more from the front and a step back: its ring of light, its lamp, its panels — then,
// further back, the room the lines fill (you, at the box, stay out of the frame on the right)
const OFF0 = { ...P, tx: -30, ty: 105, tz: 95, d: 1080, az: -17, el: 9, shift: 165 };
const OFF1 = { ...P, tx: -60, ty: 112, tz: 95, d: 1300, az: -21, el: 9, shift: 150 };
// you at the box, in full: the door's frame on the left, the box, your arm
const BOX0 = { ...P, ...VIEW.box };
const BOX1 = { ...BOX0, d: 725 };
const BOX2 = { ...BOX0, d: 700 };
// the box from close (you, from behind, down to mid-thigh: the limit of what a body of glass stands)
const NEAR = { ...P, ...VIEW.boxNear };
// the rings in their bath, in three quarters from the side: the front of the magnet is on the right. The top of the
// vessel is at y ≈ 465, under the header (closer, the bright bath ran behind its labels); the person and the
// cylinder, who stand at the mouth, are out of the frame on the right (x > 1130)
const WIRE0 = { ...P, tx: 0, ty: 135, tz: -40, d: 760, az: -68, el: 14, shift: 120 };
const WIRE1 = { ...WIRE0, d: 730 };
// above the roof: the top of the pipe, the cloud as it comes out · the cloud grown (it drifts to the right)
const PIPE = { ...P, ...VIEW.pipe, shift: 120 };
const PLUME = { ...P, ...VIEW.plume, shift: 120 };

/* ── the state ── */
// the room as this act finds it: the cylinder on the machine, someone held behind it, you at the box, hands empty
const HERE = { ...STAGED, bottle: 1, carry: 0, victim: 1, spot: 1 };
// the light: what it stands around, and how wide
const L_MOUTH = { fx: -30, fy: 100, fz: 100, fs: 320 };
const L_ROOM = { fx: -30, fy: 110, fz: 100, fs: 420 };
const L_BOX = { fx: 62, fy: 120, fz: 400, fs: 150 };
const L_NEAR = { fx: 64, fy: 128, fz: 404, fs: 60 };
const L_WIRE = { fx: 0, fy: 140, fz: 0, fs: 200 };
const L_SKY = { fx: 20, fy: 300, fz: -30, fs: 420 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, shot, cut, jolt, chip } = D;
  const t = D.times({
    tozero: "tozero",
    tobox: "zero:Tu-0.12", hit: "estop", tooff: "zero:la-0.1", machineoff: "machineoff", fieldon: "fieldon", stillon: "stillon",
    toreponse: "toreponse", other: "other", hood: "hood", trigger: "trigger",
    towire: "reponse:fil-0.22", wire: "reponse:fil", warms: "warms", bath: "reponse:l'hélium-0.1", boils: "reponse:bout#2-0.1",
    expands: "expands", times700: "reponse:sept", vent: "vent", tube: "tube",
    tofall: "reponse:et-0.1", falls: "falls",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word: a beat on the field (#hud-clock) or on the machine (#hud-count). */
  const beat = (sel, at, k = 1.16) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* ══════════ THE WRONG BUTTON ══════════ */

  /* ───────────── « Quelqu'un est coincé. » ───────────── */
  // the machine's front: the cylinder flat on it, and behind the cylinder someone who cannot move. The field's lines
  // are drawn; the picture closes on them, slowly
  cut(t.tozero, SET.SUITE, MOUTH0, { ...HERE, seen: 0.8, ...L_MOUTH });
  shot(t.tozero, span(t.tozero, t.tobox), MOUTH1, "sine.out", MOUTH0.d);

  /* ───────────── « Tu frappes l'arrêt d'urgence : » ───────────── */
  // you at the box, from behind. Your left hand comes up, faster and faster, and lands on the big button on
  // « d'urgence » — its travel does not show from here: the hand says it, and the picture, which takes the blow
  cut(t.tobox, SET.SUITE, BOX0, { ...HERE, seen: 0, ...L_BOX });
  shot(t.tobox, span(t.tobox, t.hit), BOX1, "sine.out", BOX0.d);
  st(t.tobox + 0.12, span(t.tobox + 0.12, t.hit), { reach: 1 }, "power2.in");
  st(t.hit, 0.06, { estop: 1 }, "power2.out");
  shot(t.hit, 0.14, BOX2, "power2.out", BOX1.d);

  /* ───────────── « la machine s'éteint. » ───────────── */
  // the machine's front again. On « s'éteint » the ring of light round the mouth, the lamp in the tunnel, the two
  // panels go out — and the header says so: « Arrêtée ». Nothing else has changed: that is the point
  cut(t.tooff, SET.SUITE, OFF0, { ...HERE, reach: 1, estop: 1, seen: 0.8, ...L_MOUTH });
  st(t.machineoff + 0.06, 0.2, { power: 0 }, "power2.in");
  beat("#hud-count", t.machineoff + 0.18, 1.2);

  /* ───────────── « Le champ, lui… ne bouge pas. » ───────────── */
  // …and back from it, without leaving it: the cylinder is still flat on the machine, the person still behind it, and
  // the lines — brighter on « champ » — still fill the room. The header has not moved: 1,5 T, signal. It answers
  // « pas », and THE PICTURE HOLDS
  const back = t.fieldon - 0.15;
  shot(back, span(back, t.stillon), OFF1, "sine.inOut", OFF0.d);
  st(back, span(back, t.stillon), L_ROOM, "sine.inOut");
  st(t.fieldon, 0.5, { seen: 1 }, "sine.out");
  chip("chip-champ", null, 96, 470, t.fieldon + 0.1, t.toreponse - 0.15);
  beat("#hud-clock", t.stillon + 0.08, 1.2);

  /* ══════════ THE RIGHT ONE ══════════ */

  /* ───────────── « L'autre bouton, sous son capot : l'arrêt de l'aimant. » ───────────── */
  // the box again, your hand still on the button that did nothing — and the frame closes on the other one, which
  // glows. On « capot » its flap lifts; only then do your fingers go under it; on « l'arrêt » they press
  cut(t.toreponse, SET.SUITE, BOX2, { ...HERE, reach: 1, estop: 1, power: 0, seen: 0, ...L_BOX });
  const closing = span(t.toreponse, t.hood + 0.1);
  shot(t.toreponse, closing, NEAR, "sine.inOut", BOX2.d);
  st(t.toreponse, closing, L_NEAR, "sine.inOut");
  st(t.other, 0.3, { litButtons: 1 }, "sine.out");
  st(t.hood, 0.3, { flap: 1 }, "power2.out");
  st(t.hood + 0.32, span(t.hood + 0.32, t.trigger - 0.02), { reach: 2 }, "sine.inOut");
  st(t.trigger, 0.07, { mstop: 1 }, "power2.out");
  jolt(t.trigger + 0.02, 0.25, 0.3);
  st(t.trigger + 0.25, 0.4, { litButtons: 0 }, "sine.inOut");
  chip("chip-capot", null, 96, 470, t.hood, t.towire - 0.15);

  /* ───────────── « Le fil chauffe, l'hélium bout, » ───────────── */
  // inside the machine, its covers turned to glass, the room dimmed: the rings of wire in their bath, the current's
  // round on them. On « fil » a warm stretch is born on a ring at the front; it goes round it and takes the next
  // ones (the current's round fades as it does). On « l'hélium » the bath stirs; on « bout » it boils
  cut(t.towire, SET.SUITE, WIRE0, { ...HERE, reach: 2, estop: 1, flap: 1, mstop: 1, power: 0, seen: 0, shell: 0.3, xray: 1, spin: 1, ...L_WIRE });
  shot(t.towire, span(t.towire, t.expands), WIRE1, "sine.out", WIRE0.d);
  st(t.wire - 0.05, span(t.wire - 0.05, t.boils + 0.3), { hot: 1 }, "sine.inOut");
  st(t.warms, span(t.warms, t.boils + 0.3), { spin: 0.35 }, "sine.inOut");
  st(t.bath, span(t.bath, t.boils), { boil: 0.3 }, "sine.in");
  st(t.boils, 0.35, { boil: 1 }, "power2.out");

  /* ───────────── « se dilate sept cents fois, file dehors par un tube… » ───────────── */
  // the bath goes down: what it was is gas now, and wants seven hundred times the room. ONE move goes with it: up
  // the turret and the pipe — the cold climbs it, ahead of the camera —, past the ceiling and the roof, to the open
  // air. On « dehors » the cloud bursts out, white and cold; the camera backs away from it while it grows
  // (the sky is only drawn once the camera is level with the roof: from inside, its horizon would cross the room;
  // and the pipe is only lit — veille, on « tube » — once its top is in the frame: on the way up it runs behind the
  // header, and a lit pipe shone through its labels. The cold that climbs it stays under the header.)
  st(t.expands, span(t.expands, t.tofall), { helium: 0.15 }, "sine.inOut");
  chip("chip-700", null, 96, 470, t.expands, t.vent - 0.1);
  const up = t.times700 + 0.1;
  const out = t.vent + 0.25; // « dehors » is being said: the camera is above the roof
  shot(up, span(up, out), PIPE, "sine.inOut", WIRE1.d);
  st(up, span(up, out), L_SKY, "sine.inOut");
  st(up, span(up, t.vent), { plume: 0.28 }, "sine.in");
  st(up + 0.45 * span(up, out), 0.35, { sky: 1 }, "sine.inOut");
  st(t.vent, span(t.vent, t.tofall), { plume: 1 }, "sine.out");
  shot(out, span(out, t.tofall), PLUME, "sine.inOut", PIPE.d);
  st(t.tube - 0.05, 0.3, { litPipe: 1 }, "sine.out");

  /* ───────────── « et le champ tombe, en quelques secondes. » ───────────── */
  // the machine's front, a third time. On « tombe » the header counts down — and what the picture drew of the field
  // goes with it: its lines die, the light turns. Under 0,6 T the cylinder lets go: it slides down the front to the
  // foot of the machine, and whoever it held is free. At zero the readout is veille
  cut(t.tofall, SET.SUITE, MOUTH1, { ...HERE, reach: 2, estop: 1, flap: 1, mstop: 1, power: 0, seen: 1, helium: 0.15, boil: 0.5, hot: 1, plume: 1, spin: 0.35, ...L_MOUTH });
  shot(t.tofall, span(t.tofall, t.toverdict), MOUTH0, "sine.inOut", MOUTH1.d);
  const falling = 1.0;
  const zero = t.falls + 0.04 + falling;
  st(t.falls + 0.04, falling, { tesla: 0, spin: 0, boil: 0 }, "none");
  st(t.falls + 0.1, 0.5, { mood: 0 }, "sine.inOut");
  st(zero - 0.4, 0.45, { victim: 0 }, "sine.inOut");
  st(zero - 0.1, 0.3, { seen: 0 }, "sine.out");
  beat("#hud-clock", zero, 1.2);
  chip("chip-libre", null, 96, 470, zero, t.toverdict - 0.14);
}
