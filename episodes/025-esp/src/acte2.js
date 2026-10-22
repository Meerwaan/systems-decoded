// 02 · AUTOPSIE — from the cut to the bench to the cut of act 3 (tobench → tozero).
//
// Act 1 leaves the system alone in the car of glass (VIEW.system), the spin thrown the other way (HANDOFF). On
// "Alors…" act 1 still holds that picture; just before "on" the car goes out around the system and the same
// skeleton stands on its pool, in place (benchCut, origin BENCHAT). On "on" it comes apart and the camera pulls
// back to the whole exploded view; the steering, the needles and the header's écart come back to 0 with it.
// Then each part the voice names has its frame and its gesture, in the exploded view:
//   the steering angle sensor — the wheel of glass turns on "veux": the ink needle (aim) leaves, the header's
//   écart opens (the wheel has spoken, the car not yet) ;
//   the yaw sensor — on "vraiment" the whole skeleton turns on its pool (onboard 0) and the écart closes ;
//   the four wheel sensors — the car straightens, its wheels roll, the four rings light up ;
//   the computer — the camera dives to its dial: on "compare" the two needles swing and rest one on the other.
// A part once named stays faintly lit: on "compare" the four of them glow together (the cover).
// "Vingt-cinq fois par seconde" : the skeleton closes up while the camera pulls back high above it ; "elle va là
// où tu braques ?" : the question asked in a gesture — the wheel turns one way then the other, the skeleton
// follows it closely, the écart stays veille. "Tant que la réponse est oui… il ne fait rien" : the camera comes
// to the unit and its four lines — and on "rien" nothing moves, no brake bites.
// The threshold does not stop the film: the camera is already on its way to the front-right corner; the wheel
// lights up on "roue", and on "regarde" we are on it. Act 3 cuts from there to the same wheel on the road.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, HANDOFF, BENCHAT, SIZE, SAS, YAWS, HUBS, UNIT } from "./world.js";

const DEG = Math.PI / 180;
/** A pose written for the skeleton square, turned with it by `deg` (onboard 0 on the bench turns it by yaw). */
const turned = (pose, deg) => {
  const c = Math.cos(deg * DEG);
  const s = Math.sin(deg * DEG);
  return { ...pose, tx: pose.tx * c + pose.tz * s, tz: -pose.tx * s + pose.tz * c, az: pose.az + deg };
};

// how far each part rises in the exploded view (model.js, LIFT)
const LIFT = { ecu: 50, yaws: 36, sas: 60, wheel: 82 };
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };

/* ── the frames ── */
// the steering wheel of glass and its sensor, risen on the column
const WHEEL = { ...P, tx: SAS.at[0], ty: SAS.at[1] + LIFT.sas + 6, tz: -44, d: 330, az: -22, el: 26, shift: 130 };
// the yaw sensor, risen above the floor of the skeleton
const YAWX = { ...VIEW.yawBench, ty: YAWS.at[1] + LIFT.yaws + 1.2, d: 165, az: -24, el: 40 };
// high above the exploded skeleton, the car's length along the frame's height: it turns on its pool, its corners roll
const HIGH = { ...P, tx: 0, ty: 50, tz: -10, d: 1600, az: -8, el: 50, fov: 30, shift: 200, side: 60 };
// the rear-left corner seen from inboard: the wheel, its toothed ring and the sensor's tip above the teeth
const WHEELX = { ...P, tx: -118 + 12, ty: 36, tz: 153, d: 330, az: 55, el: 24, shift: 60, side: 40, drift: 0.15 };
// the comparator on the computer's face, risen
const DIAL = { ...VIEW.ecuBench, ty: VIEW.ecuBench.ty + LIFT.ecu, d: 120 };
// assembled, from high above: the question asked in a gesture
const TOP = { ...P, tx: 0, ty: 30, tz: -10, d: 1450, az: -8, el: 52, fov: 30, shift: 190, side: 70 };
// the unit and its four lines running out to the corners
const BLOCK = { ...P, tx: -35, ty: 56, tz: -112, d: 440, az: -32, el: 40, shift: 140 };
// THE wheel: the front-right corner
const FR = { ...VIEW.frBench, d: 390, el: 26, shift: 110 };

// the light: what it stands around, and how wide
const L_WHOLE = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: SIZE };
const L_WIDE = { ...L_WHOLE, fs: 330 };
const L_WHEEL = { fx: SAS.at[0], fy: SAS.at[1] + LIFT.sas, fz: -42, fs: 80 };
const L_YAW = { fx: YAWS.at[0], fy: YAWS.at[1] + LIFT.yaws, fz: YAWS.at[2], fs: 60 };
const L_RING = { fx: -72, fy: 34, fz: 172, fs: 90 }; // (where the corner stands, the skeleton turned by 12°)
const L_DIAL = { fx: DIAL.tx, fy: DIAL.ty, fz: DIAL.tz, fs: 50 };
const L_BLOCK = { fx: UNIT.at[0], fy: UNIT.at[1], fz: UNIT.at[2], fs: 160 };
const L_FR = { fx: HUBS.FR[0], fy: HUBS.FR[1], fz: HUBS.FR[2], fs: 110 };

export default function acte2({ D, co, world }) {
  const { tl, st, now, shot } = D;
  const A = world.system.A;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode",
    volant: "volant", want: "want", lacet: "lacet", really: "really", perwheel: "perwheel", calc: "calc",
    compare: "compare", eclateEnd: "eclate$",
    torepos: "torepos", question: "question", braques: "braques", oui: "oui", rien: "rien",
    toseuil: "toseuil", thiswheel: "thiswheel", watch: "watch", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── "…on l'ouvre." — the same skeleton on the bench, in place; it comes apart ───────────── */
  const bench = benchCut(D, {
    at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: BENCHAT,
    state: { ...BENCHED, yaw: HANDOFF.yaw, aim: HANDOFF.aim, steer: HANDOFF.steer, ...L_WHOLE },
  });
  st(t.explode, 0.9, { explode: 1 }, "power2.out");
  st(t.explode, 1.1, { yaw: 0, aim: 0, steer: 0 }, "sine.inOut");
  shot(t.tobench + 0.02, t.volant - 0.15 - t.tobench, HIGH, "sine.inOut", bench.d);
  st(t.tobench + 0.02, 0.9, L_WIDE, "sine.inOut");

  /* ───────────── "Un capteur dans le volant : où tu veux aller." — the wheel turns: the ink needle leaves ───────────── */
  shot(t.volant - 0.15, t.want - 0.1 - (t.volant - 0.15), WHEEL, "sine.inOut", HIGH.d);
  st(t.volant - 0.15, 0.7, L_WHEEL, "sine.inOut");
  st(t.volant, 0.35, { litSteer: 1 }, "sine.out");
  const cSas = co.add({ title: "Capteur d'angle", x: 96, y: 480, align: "start", tone: "system", anchor: A.sas });
  cSas.show(tl, t.volant + 0.05);
  cSas.hide(tl, t.lacet - 0.3);
  st(t.want, 0.6, { steer: 0.5, aim: 12 }, "sine.inOut");
  // (2026-10-21) the camera does not stop on the wheel: a slow push while it turns — the render measured this second
  // as one of the stillest of the film, inside the leak of the TikTok curves (10 → 25 s)
  shot(t.want - 0.1, t.lacet - 0.12 - (t.want - 0.1), { ...WHEEL, d: WHEEL.d * 0.88 }, "sine.inOut", WHEEL.d);

  /* ───────────── "Un capteur de lacet : où la voiture va vraiment." — on "vraiment" it turns on its pool, and the skeleton with it ───────────── */
  st(t.lacet - 0.1, 0.4, { litSteer: 0.35 }, "sine.inOut");
  // a cut (from one sensor to the next): the yaw sensor is in the frame from the first word of its sentence
  D.cut(t.lacet - 0.12, SET.BENCH, YAWX, L_YAW);
  st(t.lacet + 0.1, 0.35, { litYaw: 1 }, "sine.out");
  const cYaw = co.add({ title: "Capteur de lacet", x: 96, y: 480, align: "start", tone: "system", anchor: A.yaws });
  cYaw.show(tl, t.lacet + 0.12);
  cYaw.hide(tl, t.perwheel - 0.45);
  // (yaw is 0: the frame changes without a jump) — the sensor and its arrow turn on the grid, the écart closes
  now(t.lacet, { onboard: 0 });
  st(t.really - 0.05, 0.75, { yaw: 12 }, "sine.inOut");
  // (2026-10-21) the stillest three seconds of the render (0.15–0.3): a push in on the sensor while it lights, the
  // skeleton turns under it on « vraiment » (sfx hit, really+0.45)
  shot(t.lacet - 0.12, t.perwheel - 0.12 - (t.lacet - 0.12), { ...YAWX, d: YAWX.d * 0.84 }, "sine.inOut", YAWX.d);

  /* ───────────── "Un capteur par roue." — one wheel, near: it rolls, its toothed ring and its sensor light up ───────────── */
  // a cut to the rear-left corner seen from inboard (the skeleton is turned by 12°: so is the pose)
  st(t.perwheel - 0.3, 0.4, { litYaw: 0.35 }, "sine.inOut");
  D.cut(t.perwheel - 0.12, SET.BENCH, turned(WHEELX, 12), L_RING);
  st(t.perwheel - 0.05, 0.35, { litWheels: 1 }, "sine.out");
  st(t.perwheel - 0.12, t.calc - (t.perwheel - 0.12), { rolled: 0.22 }, "none");
  const cWheels = co.add({ title: "Capteurs de roue", x: 96, y: 480, align: "start", tone: "system", anchor: A.RL });
  cWheels.show(tl, t.perwheel + 0.02);
  cWheels.hide(tl, t.calc - 0.32);

  /* ───────────── "Et un calculateur… qui compare." — its dial: the two needles rest one on the other ───────────── */
  // a cut to the dial; the skeleton turns square again and the camera turns with it (the dial holds still in
  // the frame), then the car's frame
  D.cut(t.calc - 0.12, SET.BENCH, turned(DIAL, 12), L_DIAL);
  const square = t.compare - 0.3 - t.calc;
  st(t.calc, square, { yaw: 0, aim: 0, steer: 0 }, "sine.inOut");
  shot(t.calc, square, DIAL, "sine.inOut");
  now(t.compare - 0.25, { onboard: 1 }); // (yaw is back to 0: no jump)
  st(t.calc - 0.12, 0.3, { litWheels: 0.35 }, "sine.inOut");
  st(t.calc + 0.15, 0.4, { litEcu: 1 }, "sine.out");
  const cEcu = co.add({ title: "Calculateur", x: 96, y: 480, align: "start", tone: "system", anchor: A.dial });
  cEcu.show(tl, t.calc + 0.3);
  cEcu.hide(tl, t.torepos - 0.25);
  // the ink needle swings to where the wheel asks; the car's follows it close behind and lands on it
  const swing = 0.6;
  st(t.compare - 0.08, swing, { aim: 12, steer: 0.5 }, "sine.inOut");
  st(t.compare, swing, { yaw: 12 }, "sine.inOut");
  // every part named glows together: the whole system, lit (the cover: eclate$)
  st(t.compare + 0.1, 0.5, { litSteer: 0.7, litYaw: 0.7, litWheels: 0.7 }, "sine.inOut");

  /* ───────────── "Vingt-cinq fois par seconde," — the skeleton closes up; high above it, its sensors alive ───────────── */
  const back = t.question - 0.1 - (t.torepos - 0.05);
  shot(t.torepos - 0.05, back, TOP, "sine.inOut", DIAL.d);
  st(t.torepos - 0.05, back, L_WIDE, "sine.inOut");
  st(t.torepos + 0.05, back - 0.2, { explode: 0 }, "sine.inOut");
  st(t.torepos, back, { aim: 0, yaw: 0, steer: 0 }, "sine.inOut"); // (onboard 1: only the needles go back)
  st(t.torepos + 0.2, 0.8, { litSteer: 0, litYaw: 0, litWheels: 0, litEcu: 0 }, "sine.inOut");
  st(t.torepos + 0.3, 0.8, { sense: 1 }, "sine.out");
  D.chip("chip-25", null, 96, 470, t.torepos + 0.1, t.question - 0.15);

  /* ───────────── "il pose la même question : elle va là où tu braques ?" — the wheel asks, the skeleton follows ───────────── */
  now(t.question - 0.05, { onboard: 0 }); // (yaw is 0)
  const lag = 0.06;
  const ask = (at, dur, aim) => {
    st(at, dur, { aim, steer: aim / 24 }, "sine.inOut");
    st(at + lag, dur, { yaw: aim }, "sine.inOut");
  };
  const q2 = t.question + 0.95;
  const q3 = t.braques + 0.15;
  ask(t.question + 0.05, q2 - (t.question + 0.05), 12);
  ask(q2, q3 - q2, -8);
  ask(q3, t.oui - 0.2 - q3, 0);

  /* ───────────── "Tant que la réponse est oui… il ne fait rien." — the unit and its four lines: nothing moves ───────────── */
  now(t.oui, { onboard: 1 }); // (yaw is back to 0)
  shot(t.oui - 0.1, t.rien - 0.1 - (t.oui - 0.1), BLOCK, "sine.inOut", TOP.d);
  st(t.oui - 0.1, 0.9, L_BLOCK, "sine.inOut");
  D.chip("chip-oui", null, 96, 470, t.oui + 0.05, t.toseuil - 0.15);

  /* ───────────── the threshold — "Abonne-toi : cette roue freinée sans toi… regarde." ───────────── */
  // The film does not stop for it: the camera is already on its way to the front-right corner; the wires quiet
  // down (in a near frame their pulses are only clutter), the wheel lights up on "roue", "regarde": we are on it.
  shot(t.toseuil - 0.1, t.watch - (t.toseuil - 0.1), FR, "sine.inOut", BLOCK.d);
  st(t.toseuil - 0.1, t.watch - (t.toseuil - 0.1), L_FR, "sine.inOut");
  st(t.toseuil + 0.2, 0.8, { sense: 0 }, "sine.inOut");
  st(t.thiswheel - 0.05, 0.4, { litFR: 0.6 }, "sine.out");
  followCall(tl, { from: t.toseuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
}
