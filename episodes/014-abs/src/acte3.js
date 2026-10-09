// 03 · RÉPONSE — from "Tu écrases." to the truck passed (tozero → toverdict). The climax, in cuts: this is where
// they make the tension. Each cut is laid a few frames before its sentence, its pose is complete and so is its
// state ({ ...STAGED, … } or { ...BENCHED, … }): nothing is inherited.
//
// THE HEADER TELLS ONE STORY, in slow motion from the stamp to the swerve:
//   · `kmh` only ever comes down (KMH below is the whole story of that number): 80 → 30;
//   · `wkmh` dives when the wheel bites, comes back when the valves let it go, then ripples just under `kmh`;
//   · `gap` shrinks by ROAD metres a second (30 → 10 at "tu braques"), then the film picks up speed and the
//     truck goes by on your right.
// Every cut takes those numbers where the shot before left them (`W`, `R` and the two functions of time).
//
// Where the camera stands, and why:
//   · your foot, then the wheel, in the STREET: the stamp and its price (the disc reddens behind the glass);
//   · the three beats of the cycle on the BENCH, in ONE move: close on the glass block for "isole" and "relâche"
//     (where the light is says it all), then back along the hose to the brake — the wheel turns again in the same
//     picture, "il resserre" is the light running back down to the caliper, and the cycle runs away;
//   · back in the street for what it is all for: your foot, the wheels still turning, the truck going by.
import { setAct } from "@kit/overlay.js";
import { along } from "@kit/direct.js";
import { SET, STAGED, BENCHED, VIEW } from "./world.js";

/* ── the poses (found with `look`, then set against the header and the captions by measuring where things land) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// your foot on the pedal, through the glass (VIEW.pedal is at its limit: never closer, never longer than 2 s).
// It is VIEW.pedal a step back and pushed DOWN: at shift 150 the lever runs up behind the header and strikes
// through its labels — here the whole pedal hangs in the frame, pivot (y ≈ 500) to pad (y ≈ 1125). side 30
// keeps the servo out of the left edge. (Worked out from the projection, not seen on a sheet.)
const FOOT0 = { ...VIEW.pedal, d: 196, shift: -50, side: 30 };
const FOOT1 = { ...FOOT0, d: 184 };
const SHAKE0 = { ...FOOT0, d: 190 };
const SHAKE1 = { ...FOOT0, d: 180 };
// the front-left wheel from outside, WHOLE: the disc behind the glass spokes, the hose coming down to the caliper.
// (Closer — VIEW.wheel's own 190 — the hose, bright with your foot's pressure, shines right behind the header;
// pushed down until the block, top right, clears it too: measured, its top stays at y ≈ 425.)
const WHEEL0 = { ...VIEW.wheel, d: 310, shift: 100, side: 40 };
const WHEEL1 = { ...WHEEL0, d: 285, shift: 70 };
// THE frame of the cycle: the glass block, its two valves (VIEW.unitPart a step back: the computer clears the header)
const UNIT0 = { ...VIEW.unitPart, d: 110, shift: 120 };
const UNIT1 = { ...UNIT0, d: 100 };
// …and back along the hose: the block (top right), the caliper and the disc in the glass wheel (left)
const BOTH0 = { ...P, tx: -7, ty: 52, tz: -25, d: 235, az: -30, el: 12, shift: 150, side: -40 };
const BOTH1 = { ...BOTH0, d: 220, az: -31.5, side: -60 };
// low behind the car, on its left: the two left wheels in their spray, the truck ahead (its top under the header)
// (it backs off as the truck grows: the truck's top lights never reach the header)
const LOW0 = { ...P, tx: 0, ty: 40, tz: -300, d: 1060, az: -12, el: 1.6, fov: 40, shift: -10, side: -40 };
const LOW1 = { ...LOW0, d: 1110, az: -10.5, shift: -25 };
// the swerve, from behind and above: VIEW.chase, a little closer at first (the truck's top at y ≈ 445, the car's
// rear wheels at ≈ 1195: closer still, the car goes under the captions), then it lets the car drift left
const SWERVE0 = { ...VIEW.chase, d: 2900, shift: 185 };
const SWERVE1 = { ...VIEW.chase, shift: 160, side: 280 };

const FOOT_LIGHT = { fx: -33, fy: 50, fz: -66, fs: 40 };
const WHEEL_LIGHT = { fx: -80, fy: 40, fz: -145, fs: 90 };
const UNIT_LIGHT = { fx: 6, fy: 60, fz: -20, fs: 30 };
const BOTH_LIGHT = { fx: -6, fy: 50, fz: -24, fs: 50 };
const ROAD_LIGHT = { fx: 0, fy: 60, fz: -400, fs: 900 };

/** On the bench the wheel is a demonstration: it never turns faster than this (metres a second), or its teeth jump. */
const BENCH_ROAD = 0.4;
/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);
/** An ease for something that leaves at speed v0 and arrives at speed v1 (any unit: only their ratio counts). */
const glide = (v0, v1) => (u) => (v0 * u + ((v1 - v0) * u * u) / 2) / ((v0 + v1) / 2);

export default function acte3({ D }) {
  const { tl, st, shot, cut, jolt, chip } = D;
  const t = D.times({
    tozero: "tozero", press: "press", towheel: "zero:ta-0.1", slows: "slows", coup: "zero:coup+0.25", lock: "lock",
    toreponse: "toreponse", isolate: "isolate", v2: "v2", trigger: "trigger", pressure: "reponse:pression", again: "again", squeeze: "squeeze", forty: "forty",
    toturn: "toturn", tolow: "tourne:mais-0.12", steer: "steer", tocar: "tourne:braques$+0.05", obeys: "obeys",
    toverdict: "toverdict",
  });
  // (whatever the voice does to them, these stay in order)
  t.coup = Math.max(t.slows + 0.2, Math.min(t.coup, t.lock - 0.15));
  t.pressure = Math.max(t.trigger + 0.3, Math.min(t.pressure, t.again - 0.5));
  setAct(tl, 3, t.press);

  /* ── the three numbers of the header's story ── */
  // the car: it only ever slows down (one key per cut: a shot runs it straight from its cut to the next)
  const KMH = [[t.press, 80], [t.towheel, 79], [t.toreponse, 74], [t.toturn, 60], [t.tolow, 56], [t.tocar, 47], [t.toverdict, 30]];
  const kmhAt = (time) => along(KMH, time);
  // the road, in slow motion: metres a second on screen, from the stamp to "tu braques" (30 m → 10 m)
  const ROAD = 20 / span(t.tozero, t.steer);
  const gapAt = (time) => 30 - ROAD * (time - t.tozero);
  // the wheel: its speed where the last call left it, and the metres it has rolled
  let W = 80;
  let R = 0;
  /** The car's speed (and, in the street, the road) straight from one instant to another. */
  const car = (from, to, road = true) => st(from, span(from, to), road ? { kmh: kmhAt(to), gap: gapAt(to) } : { kmh: kmhAt(to) }, "none");
  /** The wheel from `from` to `to`: its speed goes straight to `w1`, and it turns by what that speed makes of `road` metres a second at the car's speed. */
  const wheel = (from, to, w1, road = ROAD) => {
    const dur = span(from, to);
    const v0 = (road * W) / kmhAt(from);
    const v1 = (road * w1) / kmhAt(to);
    st(from, dur, { wkmh: w1 }, "none");
    if (v0 + v1 > 1e-4) st(from, dur, { rolled: (R += ((v0 + v1) / 2) * dur) }, glide(v0, v1));
    W = w1;
  };
  /** The header's second readout answers: a beat on the wheel's number. */
  const beat = (at) => {
    tl.to("#hud-count", { scale: 1.2, duration: 0.1, ease: "power2.out", transformOrigin: "100% 50%" }, at);
    tl.to("#hud-count", { scale: 1, duration: 0.4, ease: "power2.out" }, at + 0.1);
  };

  /* ══════════ « Tu écrases. » ══════════ */
  // your foot, through the glass: on the word the pedal goes down in a tenth of a second and the nose dips
  cut(t.tozero, SET.STREET, FOOT0, { ...STAGED, gap: 30, rolled: R, shell: 0.65, ...FOOT_LIGHT });
  shot(t.tozero, span(t.tozero, t.towheel), FOOT1, "sine.out", FOOT0.d);
  st(t.press, 0.1, { brake: 1 }, "power2.in");
  st(t.press + 0.04, 0.3, { dive: 1 }, "power2.out");
  jolt(t.press + 0.08, 0.25, 0.4);
  st(t.tozero, span(t.tozero, t.press), { gap: gapAt(t.press), rolled: (R += ROAD * span(t.tozero, t.press)) }, "none");
  car(t.press, t.towheel);
  wheel(t.press, t.towheel, 79);

  /* ══════════ « Ta roue avant ralentit d'un coup : elle va se bloquer. » ══════════ */
  // the wheel from outside, turning with the road. "ralentit": the pads bite and it falls behind the road —
  // "d'un coup": 78 → 30 while the car is still at 77. "bloquer": the disc reddens, the wheel all but stops
  const stalled = Math.min(t.lock + 0.45, t.toreponse - 0.1);
  cut(t.towheel, SET.STREET, WHEEL0, { ...STAGED, brake: 1, dive: 1, xray: 0.6, grip: 0.15, gap: gapAt(t.towheel), kmh: kmhAt(t.towheel), wkmh: W, rolled: R, ...WHEEL_LIGHT });
  shot(t.towheel, span(t.towheel, t.toreponse), WHEEL1, "sine.out", WHEEL0.d);
  car(t.towheel, t.toreponse);
  st(t.slows, 0.3, { grip: 1 }, "power2.out");
  wheel(t.towheel, t.slows, 78);
  wheel(t.slows, t.coup, 30);
  wheel(t.coup, t.lock, 22);
  wheel(t.lock, stalled, 8);
  wheel(stalled, t.toreponse, 7);
  st(t.lock, Math.min(0.45, span(t.lock, t.toreponse) - 0.05), { lock: 0.6 }, "power2.out");
  beat(t.lock + 0.1);
  chip("chip-vabloquer", null, 96, 470, t.lock, t.toreponse - 0.15);

  /* ══════════ « Première vanne : il isole ton frein. Deuxième vanne : il relâche la pression. » ══════════ */
  // the bench, the glass block: your foot's light runs through it to the wheel. "isole": the first core snaps
  // shut, its coil lights, the light stops at the valve. "relâche": the second one lifts, the wheel's line
  // empties into the accumulator, the pump sends it back toward your foot
  cut(t.toreponse, SET.BENCH, UNIT0, { ...BENCHED, xray: 1, brake: 1, grip: 1, lock: 0.6, sense: 1, kmh: kmhAt(t.toreponse), wkmh: W, rolled: R, ...UNIT_LIGHT });
  shot(t.toreponse, span(t.toreponse, t.isolate + 0.5), UNIT1, "sine.out", UNIT0.d);
  car(t.toreponse, t.toturn, false);
  st(t.isolate, 0.14, { inlet: 0 }, "power2.in");
  chip("chip-isole", null, 96, 470, t.isolate, t.v2 - 0.12);
  st(t.trigger, 0.14, { outlet: 1 }, "power2.in");
  st(t.trigger + 0.1, Math.min(0.9, span(t.trigger + 0.1, t.again)), { grip: 0.25 }, "power2.out");
  st(t.trigger + 0.15, 0.3, { pump: 1 }, "power2.out");
  chip("chip-relache", null, 96, 470, t.trigger, t.pressure + 0.25);
  wheel(t.toreponse, t.trigger, 4, BENCH_ROAD);
  wheel(t.trigger, t.again, 6, BENCH_ROAD);

  /* ══════════ « La roue repart… il resserre. » ══════════ */
  // back along the hose the pressure has just left, to the brake: the disc cools, the wheel turns again — the
  // header's second number climbs and turns veille. "resserre": both valves fall back, the light runs down the
  // hose again, the pads close
  const back = Math.min(t.again + 0.2, t.squeeze - 0.1);
  shot(t.pressure, span(t.pressure, back), BOTH0, "sine.inOut", UNIT1.d);
  st(t.pressure, span(t.pressure, back), BOTH_LIGHT, "sine.inOut");
  st(t.again - 0.4, 0.7, { lock: 0 }, "sine.inOut");
  wheel(t.again, t.squeeze, 59, BENCH_ROAD);
  beat(t.again + 0.55 * span(t.again, t.squeeze));
  st(t.squeeze, 0.14, { outlet: 0 }, "power2.in");
  st(t.squeeze + 0.05, 0.14, { inlet: 1 }, "power2.in");
  st(t.squeeze + 0.1, Math.min(0.7, span(t.squeeze + 0.1, t.forty) - 0.05), { grip: 0.85 }, "power2.out");
  wheel(t.squeeze, t.forty, 54, BENCH_ROAD);
  chip("chip-resserre", null, 96, 470, t.squeeze, t.forty - 0.14);

  /* ══════════ « Jusqu'à 40 fois par seconde. » ══════════ */
  // the cycle runs away: let go, squeeze, each beat shorter than the last. What beats is PARTS — the two cores,
  // the pads, the light in the hose — and the wheel's number ripples just under the car's
  const BEATS = [1.3, 1.1, 0.9, 0.7];
  const room = span(t.forty, t.toturn - 0.1) / BEATS.reduce((a, b) => a + b, 0);
  shot(t.squeeze, span(t.squeeze, t.toturn), BOTH1, "sine.inOut", BOTH0.d);
  let a = t.forty;
  for (const k of BEATS) {
    const c = room * k;
    st(a, 0.3 * c, { inlet: 0, outlet: 1 }, "sine.inOut");
    st(a, 0.42 * c, { grip: 0.45 }, "sine.inOut");
    wheel(a, a + 0.45 * c, W + 4, BENCH_ROAD);
    st(a + 0.45 * c, 0.3 * c, { inlet: 1, outlet: 0 }, "sine.inOut");
    st(a + 0.45 * c, 0.5 * c, { grip: 0.85 }, "sine.inOut");
    wheel(a + 0.45 * c, a + c, W - 5.25, BENCH_ROAD);
    a += c;
  }
  wheel(a, t.toturn, W, BENCH_ROAD);
  chip("chip-40", null, 96, 470, t.forty, t.toturn - 0.15);

  /* ══════════ « Sous ton pied, ça tremble. » ══════════ */
  // your foot again: the pedal shivers (the pump) and kicks back, beat after beat
  cut(t.toturn, SET.STREET, SHAKE0, { ...STAGED, brake: 1, dive: 1, grip: 0.7, pulse: 1, pump: 1, shell: 0.65, gap: gapAt(t.toturn), kmh: kmhAt(t.toturn), wkmh: W, rolled: R, ...FOOT_LIGHT });
  shot(t.toturn, span(t.toturn, t.tolow), SHAKE1, "sine.out", SHAKE0.d);
  car(t.toturn, t.tolow);
  const kick = span(t.toturn, t.tolow) / 4;
  for (let i = 0; i < 4; i++) {
    const at = t.toturn + (i + 0.3) * kick;
    st(at, 0.3 * kick, { brake: 0.88 }, "power2.out");
    st(at + 0.3 * kick, 0.35 * kick, { brake: 1 }, "power2.in");
    wheel(t.toturn + i * kick, t.toturn + (i + 0.5) * kick, W + 3);
    wheel(t.toturn + (i + 0.5) * kick, t.toturn + (i + 1) * kick, W - 3.5);
  }

  /* ══════════ « Mais tes roues tournent encore : tu braques… » ══════════ */
  // low behind the car: its wheels turning in their spray, the truck ahead. "braques": your hands turn the wheel,
  // the front wheels follow — and the car starts to go where they point
  cut(t.tolow, SET.STREET, LOW0, { ...STAGED, brake: 1, dive: 1, grip: 0.7, pulse: 1, pump: 1, gap: gapAt(t.tolow), kmh: kmhAt(t.tolow), wkmh: W, rolled: R, ...ROAD_LIGHT });
  shot(t.tolow, span(t.tolow, t.tocar), LOW1, "sine.inOut", LOW0.d);
  st(t.tolow, span(t.tolow, t.tocar), { kmh: kmhAt(t.tocar), wkmh: (W = Math.round(kmhAt(t.tocar) * 0.93)) }, "none");
  st(t.tolow, span(t.tolow, t.steer), { gap: 10, rolled: (R += (gapAt(t.tolow) - 10) * 0.93) }, "none");
  // (the slow motion lets go: the road picks up speed from here)
  const PICKUP = 4; // metres a second on screen when the shot ends
  const g1 = 10 - ((ROAD + PICKUP) / 2) * span(t.steer, t.tocar);
  st(t.steer, span(t.steer, t.tocar), { gap: g1, rolled: (R += (10 - g1) * 0.93) }, glide(ROAD, PICKUP));
  st(t.steer, Math.min(0.4, span(t.steer, t.tocar) - 0.05), { steer: 0.85 }, "power2.out");
  st(t.steer + 0.2, span(t.steer + 0.2, t.tocar), { lane: 0.5, yaw: 3.5 }, "sine.in");

  /* ══════════ « …et la voiture obéit. » ══════════ */
  // from behind and above: the car moves over, the truck slides by on your right — the film's breath out.
  // Once its tail is behind your nose the threat is over: the light turns
  const G2 = -3.2; // where the truck is when the chute cuts: three metres behind your nose
  const ride = span(t.tocar, t.toverdict);
  const pass = glide(1.2, 0.8); // the car is still slowing: the truck goes by a little slower at the end
  let passed = 0.5; // the fraction of the shot at which the truck's tail is level with your nose
  for (let lo = 0, hi = 1, i = 0; i < 24; i++) {
    passed = (lo + hi) / 2;
    if (g1 + (G2 - g1) * pass(passed) > 0) lo = passed;
    else hi = passed;
  }
  cut(t.tocar, SET.STREET, SWERVE0, { ...STAGED, brake: 1, dive: 1, grip: 0.7, pulse: 1, pump: 1, steer: 0.85, lane: 0.5, yaw: 3.5, gap: g1, kmh: kmhAt(t.tocar), wkmh: W, rolled: R, ...ROAD_LIGHT });
  shot(t.tocar, ride, SWERVE1, "sine.inOut", SWERVE0.d);
  st(t.tocar, ride, { gap: G2, rolled: (R += (g1 - G2) * 0.95) }, pass);
  st(t.tocar, ride, { kmh: 30, wkmh: 29 }, "none");
  st(t.tocar, 0.85 * ride, { lane: 3.5 }, "sine.inOut");
  st(t.tocar, 0.4 * ride, { yaw: 9 }, "sine.inOut");
  st(t.tocar + 0.4 * ride, 0.5 * ride, { yaw: 0 }, "sine.inOut");
  st(t.tocar + 0.35 * ride, 0.25 * ride, { steer: -0.5 }, "sine.inOut");
  st(t.tocar + 0.6 * ride, 0.3 * ride, { steer: 0 }, "sine.inOut");
  st(t.tocar + passed * ride, Math.min(0.45, (1 - passed) * ride), { mood: 0 }, "sine.inOut");
  // (the label waits for the truck's corner to leave the top slot)
  chip("chip-obeit", null, 96, 470, Math.min(t.obeys + 0.2, t.toverdict - 0.5), t.toverdict - 0.15);
}
