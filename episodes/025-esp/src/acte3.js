// 03 · RÉPONSE — from « L'arrière part. » to « Tu es droit. » (tozero → toverdict). The climax: the spin of act 1
// played again — with the ESP. In cuts, one shot per breath: the voice is hacked into short sentences, each picture
// reads in half a second.
//
// WHAT THE SCREEN CLAIMS (docs/faits/025-esp.md): the ESP compares, the answer is no; it reduces the engine's power
// FIRST (« il coupe les gaz »: the drive stops flowing, the speed drops a little), THEN brakes ONE wheel — in this
// case (oversteer to the left) the front one outside the turn, the front-RIGHT. Nothing more: no delay, no « always
// one wheel ». The header does the arithmetic by itself: « Écart » is |yaw − aim|, this act only moves yaw and aim.
//
// TWO KINDS OF NUMBERS here. The story's (gap, rolled, yaw, aim, steer, lane, kmh, slide, alarm, gas, bFR,
// litFR, moment, mood) run in ONE chain across the whole act, on the words — the cuts never set them (a cut in the
// middle of a running tween would fight it). The picture's (onboard, the light, what glows to be seen, the glass)
// are set by each cut, complete. The first cut sets everything ({ ...STAGED, … }): nothing comes from act 2.
//
// Where the camera stands:
//   · from above (`top`, onboard 0: the road still, the car turns on it) — the spin, the arrows, the one lit corner,
//     the arc that turns the car back: three times, the same place on purpose (part · tourne trop · l'extérieur →
//     se redresse), then once more for « Tu es droit »;
//   · inside the car (onboard 1: the car square): your hands and the wheel, the comparator, the engine, the line
//     to the front-right brake and the brake itself — the pressure is followed from the unit to the pads;
//   · wide for « la toupie a commencé » (the ditch at the edge), low in front for the nose, low behind for the rear.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, VIEW, MPS, SLOWMO, KMH } from "./world.js";

/* ── the poses ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// from above: the car in the middle, its arrows, its trails
const TOP0 = { ...P, ...VIEW.top, shift: 60, side: 50 };
const TOP1 = { ...TOP0, d: 1750 };
// …and over the front, closer, for the one lit corner and the arc it gives
const TOPF0 = { ...TOP0, tx: 30, tz: -80, d: 1700, side: 110 };
const TOPF1 = { ...TOPF0, d: 1600 };
// your hands on the wheel, the angle sensor on the column behind it
const HANDS0 = { ...P, ...VIEW.hands, ty: 92, d: 250, az: -38, el: 22 };
const HANDS1 = { ...HANDS0, d: 232 };
// the comparator on the unit, in the car, under the glass
const UNIT0 = { ...P, ...VIEW.unit };
const UNIT1 = { ...UNIT0, d: 128 };
// wide: the road, both ditches — the car sliding towards the left one
const WIDE0 = { ...P, ...VIEW.wide, tx: 80, d: 3000, side: 50 };
const WIDE1 = { ...WIDE0, d: 2800 };
// the engine and its two drive shafts, from the front-RIGHT and above: the hero corner on the right, no brake in front
const ENGINE0 = { ...P, ...VIEW.engine, az: 160, el: 50 };
const ENGINE1 = { ...ENGINE0, d: 480 };
// the same unit as « non », a step back: its row of valves, the front-right one lights and the pressure leaves
const LINE0 = { ...UNIT0, ty: 68, d: 200, el: 22 };
const LINE1 = { ...LINE0, d: 215 };
// THE wheel: the front-right brake, from the front-left, through the car's glass
const CORNER0 = { ...P, ...VIEW.cornerFR };
const CORNER1 = { ...CORNER0, d: 315 };
// low in front (the nose comes back) · low behind (the rear follows)
const FRONT0 = { ...P, ...VIEW.front, tx: -50, ty: 55, tz: -150, d: 950, az: -165, shift: 60 };
const FRONT1 = { ...FRONT0, d: 880 };
const REAR0 = { ...P, ...VIEW.rear, tx: 0, ty: 50, tz: 60, d: 1150, az: -15, el: 24, shift: 60, side: 40 };
const REAR1 = { ...REAR0, d: 1080 };

/* ── the light: what it stands around, and how wide ── */
const L_CAR = { fx: 0, fy: 50, fz: -100, fs: 700 };
const L_WIDE = { fx: -150, fy: 0, fz: -300, fs: 4000 };
const L_HANDS = { fx: -37, fy: 94, fz: -44, fs: 90 };
const L_UNIT = { fx: -52.5, fy: 74.8, fz: -125, fs: 60 };
const L_ENGINE = { fx: 0, fy: 50, fz: -165, fs: 160 };
const L_LINE = { fx: 10, fy: 58, fz: -140, fs: 140 };
const L_CORNER = { fx: 70, fy: 40, fz: -142, fs: 120 };

/* ── what each kind of shot shows (complete: a cut sets all of it) ── */
const LOOK = { litSteer: 0, litYaw: 0, litWheels: 0, litEcu: 0, litCorners: 0, sense: 1, shell: 1 };
const ROAD = { ...LOOK, onboard: 0, arrows: 1 };
// low or inside, the arrows would lie across the foreground: they are drawn from above only
const LOW = { ...LOOK, onboard: 0, arrows: 0 };
const INSIDE = { ...LOOK, onboard: 1, shell: 0.55, arrows: 0 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    tozero: "tozero", part: "part", volant2: "volant2", gauche: "zero:gauche-0.1", tourne: "tourne", trop: "zero:trop-0.1",
    non: "non", toupie2: "toupie2",
    gaz: "gaz", trigger: "trigger", une: "une", roue: "reponse:roue-0.05", exterieur: "exterieur", coin: "coin",
    redresse: "redresse", nez: "nez", suit: "suit", droit: "droit", toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word (#hud-clock the speed, #hud-count the écart). */
  const beat = (sel, at, k = 1.16) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* ══════════ THE STORY: one chain, on the words ══════════ */
  // the film is slowed down on the road: the road goes by at MPS / SLOWMO metres per film second, all through the act
  const run = span(t.tozero, t.toverdict);
  const GAP0 = -6;
  const ROLLED0 = 30;
  st(t.tozero, run, { gap: GAP0 - (MPS / SLOWMO) * run, rolled: ROLLED0 + (MPS / SLOWMO) * run }, "none");

  // « L'arrière part. » — you are steering left (aim 14), the car follows (yaw 16): then on « part » the rear goes
  st(t.part, 0.55, { yaw: 32 }, "power2.in");
  st(t.part, 0.45, { slide: 1 }, "power2.out");
  // « Le volant dit gauche. » — the wheel goes a little further left in your hands
  st(t.gauche, 0.4, { steer: 0.85 }, "sine.inOut");
  // « La voiture tourne trop. » — the two arrows: the car's (signal) passes the ink one
  st(t.tourne + 0.08, 0.12, { alarm: 1 }, "power2.out");
  st(t.trop - 0.25, 0.75, { yaw: 46 }, "sine.inOut");
  // « La réponse est non. » — the header's écart beats
  beat("#hud-count", t.non + 0.12, 1.22);
  // « Et la toupie… a commencé. » — it slides towards the left ditch
  st(t.toupie2 + 0.1, span(t.toupie2 + 0.1, t.gaz - 0.1), { yaw: 60, lane: 1.6 }, "sine.inOut");
  // « Il coupe les gaz. » — the drive stops flowing; the speed drops a little (illustrative)
  st(t.gaz + 0.05, 0.2, { gas: 0 }, "power2.out");
  st(t.gaz + 0.05, 0.6, { kmh: KMH - 3 }, "sine.out");
  beat("#hud-clock", t.gaz + 0.2, 1.12);
  // « Puis il freine. » — a head of pressure leaves the unit down the front-right line…
  st(t.trigger + 0.05, span(t.trigger + 0.05, t.roue), { bFR: 0.5 }, "sine.in");
  // « Une roue. L'avant. » — …the pads bite, the disc turns veille
  st(t.roue, 0.45, { bFR: 1, litFR: 1 }, "power2.out");
  // « Freinée par ce seul coin, la voiture se redresse. » — the arc against the spin; then the car turns back
  st(t.coin, 0.5, { moment: 1 }, "power2.out");
  st(t.redresse - 0.05, span(t.redresse - 0.05, t.nez), { yaw: 28, lane: 1.2 }, "sine.inOut");
  // « Le nez revient. »
  st(t.nez + 0.05, span(t.nez + 0.05, t.suit), { yaw: 18, lane: 0.9 }, "sine.inOut");
  // « L'arrière suit. » — the rear comes in: the car points where you steer
  st(t.suit + 0.05, span(t.suit + 0.05, t.droit), { yaw: 14, slide: 0, steer: 0.5, kmh: KMH - 6 }, "sine.inOut");
  // « Tu es droit. » — straight in its lane, the two arrows one; the brake lets go; and the colour lets go with it
  st(t.droit + 0.02, span(t.droit + 0.02, t.toverdict), { yaw: 0, aim: 0, steer: 0.1, lane: 0.4, bFR: 0, litFR: 0, moment: 0 }, "sine.inOut");
  st(t.droit + 0.04, 0.12, { alarm: 0 }, "power2.out");
  st(t.droit + 0.04, 0.3, { mood: 0 }, "sine.inOut");

  /* ══════════ THE PICTURE: one shot per breath ══════════ */

  // « L'arrière part. » — from above (the match: from the front-right corner on the bench to the same car on the road)
  cut(t.tozero, SET.ROAD, TOP0, {
    ...STAGED, ...LOW, ...L_CAR,
    gap: GAP0, rolled: ROLLED0, steer: 0.75, aim: 14, yaw: 16, lane: 0.8, kmh: KMH, gas: 1, slide: 0, alarm: 0,
    bFR: 0, litFR: 0, moment: 0, mood: 1,
  });
  shot(t.tozero, span(t.tozero, t.volant2), TOP1, "sine.out", TOP0.d);

  // « Le volant dit gauche. » — your hands on the wheel, the angle sensor lit behind it
  cut(t.volant2, SET.ROAD, HANDS0, { ...INSIDE, ...L_HANDS, litSteer: 1 });
  shot(t.volant2, span(t.volant2, t.tourne), HANDS1, "sine.out", HANDS0.d);

  // « La voiture tourne trop. » — from above again: the arrows come, the car's passes yours
  cut(t.tourne, SET.ROAD, TOP0, { ...ROAD, ...L_CAR, arrows: 0 });
  st(t.tourne + 0.06, 0.3, { arrows: 1 }, "power2.out");
  shot(t.tourne, span(t.tourne, t.non), TOP1, "sine.out", TOP0.d);

  // « La réponse est non. » — the comparator: two needles apart, the sector signal
  cut(t.non, SET.ROAD, UNIT0, { ...INSIDE, ...L_UNIT, litEcu: 1 });
  shot(t.non, span(t.non, t.toupie2), UNIT1, "sine.out", UNIT0.d);
  chip("chip-non", null, 96, 470, t.non + 0.08, t.toupie2 - 0.15);

  // « Et la toupie… a commencé. » — wide: the car sideways, sliding to the ditch
  cut(t.toupie2, SET.ROAD, WIDE0, { ...ROAD, ...L_WIDE });
  shot(t.toupie2, span(t.toupie2, t.gaz), WIDE1, "sine.inOut", WIDE0.d);

  // « Il coupe les gaz. » — the engine: the flow along its shafts stops on « gaz »
  cut(t.gaz - 0.12, SET.ROAD, ENGINE0, { ...INSIDE, ...L_ENGINE });
  shot(t.gaz - 0.12, span(t.gaz - 0.12, t.trigger), ENGINE1, "sine.out", ENGINE0.d);
  chip("chip-gaz", null, 96, 470, t.gaz + 0.1, t.trigger - 0.12);

  // « Puis il freine. » — the unit, and the pressure leaving it down the front-right line
  cut(t.trigger - 0.1, SET.ROAD, LINE0, { ...INSIDE, ...L_LINE, sense: 0.4 });
  shot(t.trigger - 0.1, span(t.trigger - 0.1, t.une), LINE1, "sine.inOut");

  // « Une roue. L'avant. » — following the pressure to the end of its line: the front-right brake bites
  cut(t.une - 0.1, SET.ROAD, CORNER0, { ...INSIDE, ...L_CORNER, sense: 0.4 });
  shot(t.une - 0.1, span(t.une - 0.1, t.exterieur), CORNER1, "sine.out", CORNER0.d);

  // « À l'extérieur du virage. » → « Freinée par ce seul coin, la voiture se redresse. » — from above: ONE corner lit,
  // outside the curve; then the arc, and the car turns back
  cut(t.exterieur - 0.1, SET.ROAD, TOPF0, { ...ROAD, ...L_CAR });
  shot(t.exterieur - 0.1, span(t.exterieur - 0.1, t.nez), TOPF1, "sine.inOut", TOPF0.d);
  chip("chip-coin", null, 96, 470, t.exterieur + 0.05, t.coin - 0.15);

  // « Le nez revient. » — low in front
  cut(t.nez - 0.1, SET.ROAD, FRONT0, { ...LOW, ...L_CAR });
  shot(t.nez - 0.1, span(t.nez - 0.1, t.suit), FRONT1, "sine.out", FRONT0.d);

  // « L'arrière suit. » — low behind
  cut(t.suit - 0.1, SET.ROAD, REAR0, { ...LOW, ...L_CAR });
  shot(t.suit - 0.1, span(t.suit - 0.1, t.droit), REAR1, "sine.out", REAR0.d);

  // « Tu es droit. » — from above: straight, the two arrows one, veille
  cut(t.droit - 0.1, SET.ROAD, TOP1, { ...ROAD, ...L_CAR });
  shot(t.droit - 0.1, span(t.droit - 0.1, t.toverdict), { ...TOP1, d: 1680 }, "sine.out", TOP1.d);
}
