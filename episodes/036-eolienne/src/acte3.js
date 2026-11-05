// 03 · RÉPONSE — from « Le réseau coupe. » to « …à quelques tours par minute. » (tozero → toverdict). The climax.
// In cuts: one shot per breath of the voice, each laid a few frames before its words, each with its complete pose and
// its complete state ({ ...STAGED, … }): nothing is inherited from the act before, nor from the shot before.
//
//   S1  from the road, behind your car       « Le réseau coupe. Plus de courant »   the grid's cable dies from the foot
//   S2  at the top, the hub through its glass « pour les moteurs de pales. »         the three pitch motors go dark
//   S3  the rotor from below, wide → closer   « Le rotor s'emballe. »                12 → 19 tr/min in one second
//   S4  at the top, the battery side          « Les batteries prennent le relais.    the three cabinets light veille
//                                               Les moteurs tournent. »             the motors wake, the pitch starts
//   S5  the rotor face-on, from below          « Chaque pale pivote. 90 degrés.      the three blades turn to edges
//                                               Plus rien ne pousse. »              the blur goes, the rotor slows
//   S6  from the road again, pulling back      « Et le rotor retombe… »              mood → veille, 3 tr/min
//
// THE ROTOR IS IN REAL TIME. `rpm` follows a schedule (SPEED below) and `rotor` is its exact integral: every change of
// speed lies inside one shot, `rpm` tweens on its own ease and `rotor` on the integral of it, so the blades always
// turn at the speed the header reads. The pitch is done by the electric motors on their batteries (their pinions
// turn 6 × the blade: model.js) — never a cylinder; nothing brakes the rotor (the brake stays out of this act).
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, HUBW, TURBINE } from "./world.js";

const [HX, HY, HZ] = HUBW;
const H = TURBINE.heading;
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };

/* ── the poses (VIEW, checked by the sets' agents; what lies between two of them is arithmetic) ── */
// S1: behind your car, at the height of a man, looking down the road: the grid's cable (veille) climbing its poles to
// the station and on to the tower's foot, your car at the bottom left, the tower rising out of the top of the frame
const ROAD0 = { ...P, tx: -2000, ty: 1500, tz: 3000, d: 8500, az: -10, el: -8, fov: 64, shift: 160 };
const ROAD1 = { ...ROAD0, d: 8150 };
// S6: the same place, further back on the road: the turbine calms down over the car
const BACK0 = { ...P, ...VIEW.road };
const BACK1 = { ...BACK0, d: VIEW.road.d * 1.07 };
// S2 and S4: the hub from upwind, through the spinner's glass and the hub's foundry windows — the three necks around
// the axis, each with its motor (+x) and its battery cabinet (−x). The SAME place twice, on purpose: in S2 only the
// motors are lit and they die; in S4 the cabinets light, then the motors come back. The colour tells the story.
const TOPA0 = { ...P, tx: HX, ty: HY, tz: HZ, d: 2700, az: H + 2, el: 16, fov: 32, shift: 120 };
const TOPA1 = { ...TOPA0, d: 2560 };
const TOPB0 = { ...P, tx: HX, ty: HY, tz: HZ, d: 2500, az: H + 10, el: 12, fov: 32, shift: 100 };
const TOPB1 = { ...TOPB0, d: 2250 }; // closer, the spinner's glass rises into the header
// S3: the rotor from below and aside (VIEW.rotor), wide, pushed in while it runs away
const LOW0 = { ...P, ...VIEW.rotor, d: VIEW.rotor.d * 1.25 };
const LOW1 = { ...LOW0, d: VIEW.rotor.d * 1.12 };
// S5: the rotor face-on, nearly level (the whole disc across the frame): the three blades turn to edges, to lines
const FACE0 = { ...P, ...VIEW.rotor, d: 15500, az: H + 5, el: -8, shift: 80 };
const FACE1 = { ...FACE0, d: 16300 };

/* ── the light: what it stands around, and how wide ── */
const L_ROAD = { fx: HX, fy: HY - 2000, fz: HZ, fs: 6000 };
const L_TOP = { fx: HX, fy: HY, fz: HZ, fs: 1500 };
const L_ROTOR = { fx: HX, fy: HY, fz: HZ, fs: 6000 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { st, shot, cut, chip, punch } = D;
  const t = D.times({
    tozero: "tozero", coupe: "coupe", pour: "zero:pour", moteurs1: "moteurs1", rotorW: "zero:rotor", emballe: "emballe",
    reponse: "reponse", relais: "relais", tournent: "tournent", chaque: "reponse:chaque", trigger: "trigger",
    pivoted: "pivoted", deg90b: "deg90b", pousse: "pousse", et: "reponse:et", retombe: "retombe", tours: "tours",
    toverdict: "toverdict",
  });

  /* ── the cuts: a few frames before the words that call them ── */
  const c1 = t.tozero; //           « Le réseau coupe. Plus de courant »
  const c2 = t.pour - 0.13; //      « pour les moteurs de pales. »
  const c3 = t.rotorW - 0.3; //     « Le rotor s'emballe. »
  const c4 = t.reponse - 0.14; //   « Les batteries prennent le relais. Les moteurs tournent. »
  const c5 = t.chaque - 0.15; //    « Chaque pale pivote. Quatre-vingt-dix degrés. Plus rien ne pousse. »
  const c6 = t.et - 0.14; //        « Et le rotor retombe… à quelques tours par minute. »
  const end = t.toverdict;

  /* ── the speed (tr/min): every ramp lies inside one shot ── */
  const linear = (u) => u;
  const out2 = (u) => 1 - (1 - u) * (1 - u);
  const SPEED = [
    // [from, to, rpm at the end, ease of rpm]  (holds are split at the cuts)
    [c1, c2, 12], [c2, c3, 12], [c3, t.emballe - 0.2, 12],
    [t.emballe - 0.2, t.emballe + 0.75, 19, linear], //   the runaway: one second, on « s'emballe »
    [t.emballe + 0.75, c4, 19], [c4, c5, 19], [c5, t.pivoted + 0.1, 19],
    [t.pivoted + 0.1, t.pousse + 0.24, 8, linear], //     the blades feathered: nothing pushes, the blur fades
    [t.pousse + 0.24, c6, 8],
    [c6, t.tours + 0.1, 3, out2], //                      « retombe… à quelques tours par minute »
    [t.tours + 0.1, end, 3],
  ];
  // the rotor's turns, segment by segment: the exact integral of the rpm curve
  let rpm0 = 12;
  let turns = 0;
  const marks = []; // [time, rotor, rpm] at the start of each segment
  const tweens = []; // laid after the cuts: a tween that starts on a cut must read the value the cut sets
  for (const [a, b, r1, f] of SPEED) {
    const dur = span(a, b);
    const ease = f ?? linear;
    marks.push([a, turns, rpm0]);
    // the rotor's own ease: ∫ rpm, normalised (a table of 48 steps, read linearly)
    const N = 48;
    const acc = [0];
    for (let i = 1; i <= N; i++) {
      const u0 = (i - 1) / N;
      const u1 = i / N;
      const r = (x) => rpm0 + (r1 - rpm0) * ease(x);
      acc.push(acc[i - 1] + (r(u0) + r(u1)) / 2 / N);
    }
    const mean = acc[N]; // mean rpm over the segment
    const gain = (mean / 60) * dur;
    const rotorEase = mean > 1e-6 ? (u) => {
      const x = Math.min(N, Math.max(0, u * N));
      const i = Math.min(N - 1, Math.floor(x));
      return (acc[i] + (acc[i + 1] - acc[i]) * (x - i)) / mean;
    } : linear;
    if (r1 !== rpm0) tweens.push([a, dur, { rpm: r1 }, ease === linear ? "none" : ease]);
    tweens.push([a, dur, { rotor: turns + gain }, rotorEase]);
    turns += gain;
    rpm0 = r1;
  }
  const rotorAt = (time) => {
    const m = marks.filter((k) => k[0] <= time + 1e-6).pop();
    return m ? m[1] : 0;
  };
  const rpmAt = (time) => {
    const m = marks.filter((k) => k[0] <= time + 1e-6).pop();
    return m ? m[2] : 12;
  };
  // what every cut of this act says, whatever came before
  const HERE = (at) => ({ ...STAGED, rotor: rotorAt(at), rpm: rpmAt(at), charge: 1 });

  /* ── S1 · « Le réseau coupe. Plus de courant » — from the road: the grid's cable dies from the foot ── */
  cut(c1, SET.SCENE, ROAD0, { ...HERE(c1), ...L_ROAD, pitchA: 8, pitchB: 8, pitchC: 8, mains: 1, motors: 1, batt: 0, mood: 1 });
  setAct(D.tl, 3, c1);
  shot(c1, span(c1, c2), ROAD1, "sine.inOut");
  st(t.coupe, 0.9, { mains: 0 }, "none"); // the cut runs from the tower's foot past the station, down the road
  chip("chip-reseau", null, 96, 470, t.coupe + 0.05, c2 - 0.16);

  /* ── S2 · « pour les moteurs de pales. » — the hub through its glass: the three motors go dark on « moteurs » ── */
  cut(c2, SET.SCENE, TOPA0, { ...HERE(c2), ...L_TOP, cover: 0.3, mains: 0, pitchA: 8, pitchB: 8, pitchC: 8, motors: 1, batt: 0, mood: 1 });
  shot(c2, span(c2, c3), TOPA1, "sine.inOut");
  st(t.moteurs1, 0.18, { motors: 0 }, "power2.out");

  /* ── S3 · « Le rotor s'emballe. » — the rotor from below: 12 → 19 tr/min in a second, the tips' trails turn signal ── */
  cut(c3, SET.SCENE, LOW0, { ...HERE(c3), ...L_ROTOR, mains: 0, pitchA: 8, pitchB: 8, pitchC: 8, motors: 0, batt: 0, mood: 1 });
  shot(c3, span(c3, c4), LOW1, "power1.in");
  punch(t.emballe, 0.06, { hold: 0.18, down: 0.45 }); // let go before the next cut

  /* ── S4 · « Les batteries prennent le relais. Les moteurs tournent. » — the battery side of the hub ── */
  cut(c4, SET.SCENE, TOPB0, { ...HERE(c4), ...L_TOP, cover: 0.3, mains: 0, pitchA: 8, pitchB: 8, pitchC: 8, motors: 0, batt: 0, mood: 1 });
  shot(c4, span(c4, c5), TOPB1, "sine.inOut");
  st(t.relais, 0.28, { batt: 1 }, "power2.out");
  chip("chip-relais", null, 96, 470, t.relais + 0.04, c5 - 0.16);
  st(t.tournent, 0.16, { motors: 1 }, "power2.out");
  st(t.tournent, span(t.tournent, c5), { pitchA: 14, pitchB: 14, pitchC: 14 }, "power1.in"); // the pinions start to turn

  /* ── S5 · « Chaque pale pivote. Quatre-vingt-dix degrés. Plus rien ne pousse. » — the rotor face-on ── */
  cut(c5, SET.SCENE, FACE0, { ...HERE(c5), ...L_ROTOR, mains: 0, pitchA: 14, pitchB: 14, pitchC: 14, motors: 1, batt: 1, mood: 1 });
  shot(c5, span(c5, c6), FACE1, "sine.inOut");
  st(c5, span(c5, t.deg90b + 0.36), { pitchA: 90, pitchB: 90, pitchC: 90 }, "sine.inOut"); // 90° on « quatre-vingt-dix »
  punch(t.trigger + 0.05, 0.06); // +pivote+

  /* ── S6 · « Et le rotor retombe… à quelques tours par minute. » — from the road: it calms over the car ── */
  cut(c6, SET.SCENE, BACK0, { ...HERE(c6), ...L_ROAD, mains: 0, pitchA: 90, pitchB: 90, pitchC: 90, motors: 1, batt: 1, mood: 1 });
  shot(c6, span(c6, end), BACK1, "sine.inOut", BACK0.d);
  st(t.retombe, 0.35, { mood: 0 }, "sine.inOut"); // the system has won: veille, here and not before
  chip("chip-tours", null, 96, 470, t.tours + 0.04, end - 0.16);

  /* ── the rotor and its speed, last: after the cuts that set them ── */
  for (const [a, dur, props, ease] of tweens) st(a, dur, props, ease);
}
