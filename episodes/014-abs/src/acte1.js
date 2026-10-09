// 01 · MENACE — from the first frame to "Alors…" (0 → tosystem). The hook tells the whole dossier in one move,
// then the film goes back to 80 km/h and plays the "what if": locked wheels, straight on — and winds back.
//
// THE HOOK, one move. The first frame (POSE0 / FIRST) is low on the wet road behind the front-left wheel — turned
// to the left already: it shows the camera its face — the truck's lights and their reflections ahead. And it is
// already moving: the road rushes in for half a second, then time thickens as the foot goes down (from "écrases"
// on the film is in slow motion: 30 cm of road a second).
//   the wheel  round it while the nose dips and the tyre turns to glass: the caliper on its disc ("…le frein")
//   your foot  through the glass to the pedal, which starts to tremble on its word
//   the pipe   from the pedal to the unit: its two valves light up on "relâche"
//   the wheel  back out along the hose: the disc was going signal — the wheel was about to lock — and it cools
//              as the pads let go ("roue par roue"), the header's second speed climbs back
//   the truck  back behind the wheel, low: it steers harder on "camion", the truck slides to the right
//   your foot  and the pedal again: on "réflexe" the foot starts to lift — the picture HOLDS there
// THE SCENE. A cut: 80 km/h, the car, the rain, the truck (VIEW.chase). One move down to the wheel while the foot
// goes down ("Trop près…") and the wheel steers ("il faut tourner") — it locks on "bloquée". A cut on "tout droit":
// from behind, the car with its wheels turned sliding straight at the truck, to one metre of it. Then the film
// winds back, and act 2 cuts at `tosystem`.
//
// The road: `gap` and `rolled` always move in the same `st` (the wheels roll as much as the road comes, × how far
// the front-left wheel has fallen behind the car; locked, `rolled` stops). The header: `kmh` only ever falls.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, VIEW } from "./world.js";

/* ── the poses (found with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the front-left wheel, three quarters from behind: the whole tyre, the arch over it, the unit behind (top right)
const WHEEL = { ...P, tx: -80, ty: 40, tz: -145, d: 360, az: -56, el: 9, shift: 185 };
// your foot on the pedal, through the glass (at its limit: never closer, never more than two seconds); pushed to
// the right: the pedal's arm and its pad stand at the middle of the picture, the glass foot on them
const PEDAL = { ...VIEW.pedal, side: -100 };
// the unit in the car, its circuit facing us; the hose leaves the frame bottom left, toward the caliper
// (az −52: the circuit reads up to −50 or so, and every degree less is a degree the camera need not turn)
const UNIT = { ...P, tx: -54, ty: 57, tz: -130, d: 200, az: -52, el: 12, shift: 170 };
// low behind the wheel again, a little further and wider than the first frame: the wheel, and the truck it must miss
const AVOID = { ...P, tx: -70, ty: 45, tz: -250, d: 511, az: -11.86, el: 1.12, fov: 40, shift: 105, side: -60 };
// the scene: from behind and above, then down to that same low frame, then the wheel as it steers and locks
const CHASE = VIEW.chase;
const LOW = AVOID;
const STEERED = { ...P, tx: -80, ty: 38, tz: -145, d: 380, az: -48, el: 7, shift: 170 };
// the slide: the chase frame, lowered so that the truck's roof and its top lights stop under the header at one metre
const SLIDE = { ...VIEW.chase, shift: 175 };

// the light: what it stands around, and how wide
const L_WHEEL = { fx: -80, fy: 40, fz: -145, fs: 90 };
const L_PEDAL = { fx: -33, fy: 50, fz: -66, fs: 40 };
const L_UNIT = { fx: -52, fy: 58, fz: -128, fs: 40 };
const L_CAR = { fx: 0, fy: 60, fz: -400, fs: 900 };

// the hook's road, in metres to the truck: FIRST.gap, a rush that dies in half a second, then slow motion
// (if a draft shows the road's grid strobing in the first half-second, lengthen TAU)
const G0 = 26; //      FIRST.gap (world.js)
const RUSH = 3.6; //   metres of the opening rush…
const TAU = 0.6; //    …and its time constant, in seconds
const SLOW = 0.3; //   metres of road per second of film once the foot is down
const gapAt = (time) => G0 - RUSH * (1 - Math.exp(-time / TAU)) - SLOW * time;

/** An ease that leaves at `s0` times its mean speed and lands at `s1` times it: two moves chained without a stop. */
const glide = (s0, s1) => (u) => s0 * u + (3 - 2 * s0 - s1) * u * u + (s0 + s1 - 2) * u * u * u;
// for the two wide turns of the hook (pedal → unit, truck → pedal): its top speed is 1.4 times the mean, where
// sine.inOut's is 1.6 — a quarter turn must never take less than a second
const TURN = glide(0.25, 0.25);

export default function acte1({ D }) {
  const { tl, st, shot, cut, chip, jolt, hide } = D;
  const t = D.times({
    stamp: "stamp", ecrases: "accroche:écrases", frein: "accroche:frein", pedale: "accroche:pédale", shake: "shake", said: "accroche$",
    car: "car", lets: "lets", freins: "promesse:freins", roue: "promesse:roue", onpurpose: "onpurpose",
    pour: "promesse:pour", truck: "truck", sauf: "sauf", pied: "promesse:pied", reflex: "reflex",
    toscene: "toscene", tooclose: "tooclose", arreter: "scene:arrêter$", turn: "turn", mais: "scene:Mais", locked: "locked",
    straight: "straight", elle: "scene:elle", back: "back", tosystem: "tosystem",
  });
  const F = D.first;
  setAct(tl, 1, 0);

  /* ═════════════ THE HOOK ═════════════ */
  const end = t.toscene - 0.02; // everything of the hook has landed before the cut

  /* ── the road and the two speeds of the header ── */
  // the rush and its decay, wheels rolling (one tween: the same curve for the road and for the wheels)
  const g1 = gapAt(t.pedale);
  st(0, t.pedale, { gap: g1, rolled: F.rolled + G0 - g1 }, (u) => (G0 - gapAt(u * t.pedale)) / (G0 - g1));
  let G = g1;
  let R = F.rolled + G0 - g1;
  /** The road comes on to `until`; the wheels roll `slip` times as much (1 rolling · 0 locked). */
  const road = (from, until, slip = 1) => {
    const g = gapAt(until);
    R += (G - g) * slip;
    G = g;
    st(from, until - from, { gap: G, rolled: R }, "none");
  };
  const grab = t.roue - 0.05; // the pads let go, at the wheel
  road(t.pedale, t.shake);
  road(t.shake, t.lets, 0.7); //        the front-left wheel falls behind the car…
  road(t.lets, grab, 0.4);
  road(grab, t.onpurpose, 0.75); //     …and comes back
  road(t.onpurpose, end, 0.95);
  // the car only ever slows; the wheel is with it, plunges under your foot, and climbs back when the valve opens
  const kmhAt = (time) => 80 - 14 * Math.max(0, (time - t.stamp) / (end - t.stamp));
  st(t.stamp, end - t.stamp, { kmh: kmhAt(end) }, "none");
  st(t.stamp, t.pedale - t.stamp, { wkmh: kmhAt(t.pedale) }, "none");
  st(t.pedale, t.lets - t.pedale, { wkmh: 28 }, "sine.in");
  st(t.lets, grab - t.lets, { wkmh: 24 }, "none");
  st(grab, 1, { wkmh: kmhAt(grab + 1) - 3 }, "sine.inOut");
  st(grab + 1, end - grab - 1, { wkmh: kmhAt(end) - 3 }, "none");

  /* ───────────── A · "Sous la pluie, tu écrases le frein…" ───────────── */
  // the first second belongs to the first frame: the road rushes in, the truck grows, the camera only leans on the
  // wheel (a push already under way). On "écrases" it swings round the wheel: the nose dips on the tyre, the pads
  // bite; the tyre and the rim turn to glass as it comes level with them — the caliper on its disc, on "frein"
  const swing = t.stamp - 0.25;
  const atWheel = t.frein + 0.2;
  shot(0, swing, { d: D.pose0.d * 0.93, az: D.pose0.az - 1 }, glide(1, 1));
  shot(swing, atWheel - swing, WHEEL, glide(0.15, 1.3));
  st(t.ecrases - 0.05, 0.3, { dive: 1 }, "power2.out");
  st(t.ecrases, 0.35, { grip: 0.9 }, "power2.out");
  jolt(t.ecrases, 0.4, 0.35);
  st(t.ecrases + 0.15, t.frein + 0.25 - (t.ecrases + 0.15), { xray: 0.6 }, "sine.inOut");

  /* ───────────── "…et ta pédale se met à trembler." ───────────── */
  // on, through the glass, to your foot (the move does not stop at the wheel: it leaves it at the speed it came).
  // The pedal trembles on its word; the pump has started
  const atPedal = t.pedale + 0.55;
  const dA = WHEEL.az - (D.pose0.az - 1);
  const dB = PEDAL.az - WHEEL.az;
  shot(atWheel, atPedal - atWheel, PEDAL, glide(Math.min(1.5, (1.3 * dA * (atPedal - atWheel)) / (dB * (atWheel - swing))), 0));
  st(atWheel, atPedal - atWheel, L_PEDAL, "sine.inOut");
  st(t.shake, 0.25, { pulse: 1 }, "power2.out");
  st(t.shake, 0.3, { pump: 1 }, "sine.out");
  shot(atPedal, t.car - 0.4 - atPedal, { d: PEDAL.d * 0.95 }, "sine.out");
  // …and behind its branches the disc goes signal: that wheel is about to lock
  st(t.said, t.lets - t.said, { lock: 0.6 }, "sine.in");

  /* ───────────── B · "C'est ta voiture : elle relâche tes freins, roue par roue." ───────────── */
  // along the pipe, from the pedal to the unit — its block turns to glass. On "relâche": the first valve shuts
  // your foot out, the second opens (two veille coils, the dashes fall into the accumulator)
  const toUnit = t.car - 0.4;
  const atUnit = Math.min(t.lets - 0.05, toUnit + 1.5);
  shot(toUnit, atUnit - toUnit, UNIT, TURN);
  st(toUnit, atUnit - toUnit, L_UNIT, "sine.inOut");
  st(toUnit, atUnit - toUnit, { xray: 0.9 }, "sine.inOut");
  st(t.lets, 0.12, { inlet: 0 }, "power2.out");
  st(t.lets + 0.18, 0.12, { outlet: 1 }, "power2.out");
  const toHose = t.freins - 0.3;
  shot(atUnit, toHose - atUnit, { d: UNIT.d * 0.94 }, "sine.out");
  // back out along the hose to the wheel: the pads let go, the signal drains from the disc, the wheel turns again
  const atHose = Math.min(grab, toHose + 1);
  shot(toHose, atHose - toHose, WHEEL, "sine.inOut", UNIT.d * 0.94);
  st(toHose, atHose - toHose, L_WHEEL, "sine.inOut");
  st(grab, 0.45, { grip: 0.3 }, "sine.out");
  st(grab, 0.75, { lock: 0 }, "sine.inOut");
  shot(atHose, t.onpurpose - 0.05 - atHose, { d: WHEEL.d * 0.95 }, "sine.out");

  /* ───────────── "Exprès : pour t'éviter le camion." ───────────── */
  // the valves swap back, the pads bite again — and the camera swings behind the wheel, low: the truck is there.
  // The wheel is solid again. On "camion" it steers harder, and the truck slides to the right
  const toAvoid = t.onpurpose - 0.05;
  const atAvoid = Math.min(t.truck - 0.2, t.pour + 0.55);
  st(t.onpurpose, 0.12, { outlet: 0 }, "power2.out");
  st(t.onpurpose + 0.15, 0.12, { inlet: 1 }, "power2.out");
  st(t.onpurpose + 0.3, 0.4, { grip: 0.8 }, "sine.out");
  shot(toAvoid, atAvoid - toAvoid, AVOID, "sine.inOut", WHEEL.d * 0.95);
  st(toAvoid, 0.8, { xray: 0 }, "sine.inOut");
  const toFoot = t.truck + 0.35;
  shot(atAvoid, t.pied - 0.1 - atAvoid, { d: AVOID.d * 0.97 }, "sine.out");
  // (the truck enters the frame at the end of the swing, and is still in it a quarter of a second after the camera leaves)
  chip("chip-camion", null, 96, 460, atAvoid - 0.3, Math.min(toFoot + 0.25, t.pied - 0.3));
  // (the wheel has been turned to the left since the first frame, and the car has been creeping out of its lane)
  st(0, t.truck, { lane: 0.3, yaw: 0.8 }, "power1.in");
  st(t.truck, 0.5, { steer: 0.75 }, "power2.inOut");
  st(t.truck, 0.75, { lane: 0.9 }, "sine.inOut");
  st(t.truck, 0.9, { yaw: 2.2 }, "sine.inOut");

  /* ───────────── C · "Sauf si ton pied… a le mauvais réflexe." ───────────── */
  // back to your foot on the trembling pedal (the swing is a quarter turn: it takes the whole of "Sauf si ton
  // pied…", and lands in the pause after it). On "réflexe" the foot starts to lift — and the picture holds there
  const atFoot = t.pied + 0.75;
  // a quarter turn in little more than a second is a cut (the swing came out as the film's second most abrupt move on the draft)
  cut(t.pied - 0.1, SET.STREET, PEDAL, L_PEDAL);
  shot(t.pied - 0.1, end - t.pied + 0.1, { d: PEDAL.d * 0.94 }, "sine.out");
  st(t.reflex, Math.min(0.55, end - t.reflex), { brake: 0.7 }, "power1.out");

  /* ═════════════ THE SCENE ═════════════ */
  /* ───────────── "80 kilomètres-heure." ───────────── */
  // the cut: the film goes back. From behind and above — the car, the rain, the truck in your lane; the road comes on
  cut(t.toscene, SET.STREET, CHASE, { ...STAGED, ...L_CAR });
  G = STAGED.gap;
  R = STAGED.rolled;
  /** The road comes on to `gap` metres; the wheels roll `slip` times as much. */
  const come = (from, until, gap, ease = "none", slip = 1) => {
    R += (G - gap) * slip;
    G = gap;
    st(from, until - from, { gap: G, rolled: R }, ease);
  };
  come(t.toscene, t.tooclose, 27);

  /* ───────────── "Trop près pour t'arrêter :" ───────────── */
  // the camera comes down to the wheel's level as the foot goes down: the nose dips, time thickens
  const atLow = t.arreter;
  shot(t.toscene, atLow - t.toscene, LOW, "sine.inOut", CHASE.d);
  st(t.tooclose, atLow - t.tooclose, L_WHEEL, "sine.inOut");
  st(t.tooclose, 0.15, { brake: 1 }, "power2.out");
  st(t.tooclose, 0.3, { dive: 1 }, "power2.out");
  st(t.tooclose + 0.05, 0.3, { grip: 0.8 }, "power2.out");
  come(t.tooclose, t.mais, 24, "sine.out");
  st(t.tooclose, t.locked - t.tooclose, { kmh: 72, wkmh: 72 }, "none");
  // (the label is already placed by the hook: it only comes back)
  tl.fromTo("#chip-camion", { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, t.tooclose + 0.1);
  hide("#chip-camion", atLow - 0.1, 0.12);

  /* ───────────── "il faut tourner." ───────────── */
  // on to the wheel: it steers on the word — turned to the left, it shows the camera its whole face
  const atSteered = t.mais;
  shot(atLow, atSteered - atLow, STEERED);
  st(t.turn, 0.55, { steer: 0.8 }, "power2.inOut");

  /* ───────────── "Mais une roue bloquée…" ───────────── */
  // the "what if": the pads clamp for good, the wheel stops dead — its mark and its five branches stand still —
  // and ploughs the water. The header: "Ta roue 0 km/h", signal
  come(t.mais, t.locked, 23.8);
  st(t.locked, 0.15, { grip: 1 }, "power2.out");
  st(t.locked, 0.2, { lock: 1, wkmh: 0 }, "power2.out");
  st(t.locked, 0.25, { skid: 1 }, "sine.out");
  jolt(t.locked, 0.35, 0.3);
  come(t.locked, t.straight, 23.4, "none", 0);
  chip("chip-bloque", null, 96, 460, t.locked + 0.05, t.straight - 0.14);
  shot(atSteered, t.straight - 0.02 - atSteered, { d: STEERED.d * 0.94 }, "sine.out");

  /* ───────────── "…glisse tout droit… elle ne dirige plus rien." ───────────── */
  // the cut, on "tout droit": from behind, the front wheels turned to the left and the car going straight at the
  // truck on its four signal trails. It comes fast, and time stops one metre short
  cut(t.straight, SET.STREET, SLIDE, { steer: 1, ...L_CAR });
  come(t.straight, t.back, 1.2, glide(1.25, 0), 0);
  st(t.locked + 0.2, t.back - t.locked - 0.2, { kmh: 55 }, "none");
  shot(t.straight, t.back - t.straight, { d: SLIDE.d * 0.93 }, "sine.out");
  // ("Tu braques · Rien" comes with "elle ne dirige…", not on "rien": it needs its second and a half to be read)
  chip("chip-volant", null, 96, 460, t.elle + 0.15, t.back - 0.08);

  /* ───────────── the rewind (the silence before "Alors…") ───────────── */
  // the film winds back: the truck recedes, the wheels unlock and turn straight, the foot comes up. Act 2 cuts at
  // `tosystem` with its own state
  const rew = Math.min(0.35, t.tosystem - 0.03 - t.back);
  st(t.back, rew, { gap: 30, rolled: R - 6, lock: 0, skid: 0, steer: 0, kmh: 80, wkmh: 80, brake: 0, grip: 0, dive: 0 }, "power2.in");
  shot(t.back, rew, { d: SLIDE.d }, "power2.in");
}
