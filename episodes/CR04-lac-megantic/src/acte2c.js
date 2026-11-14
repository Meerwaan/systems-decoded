// CR04 — acte2c.js · t6 → defaut (tozero → tot7): 0:58 « soixante-six tonnes », a few hundred kilos short; the train leaves, alone
// (raccord on the first image). 02 LE DÉFAUT: the test held on the air; the seven hand brakes alone, a third; the air leaking for an
// hour. docs/CR04-actes.md « acte2c.js », docs/CR04-actes-maj.md. Three cuts, the camera never still:
//   1. tozero, the brake cylinder of THE wheel, parked (VIEW.cylindre), a slow orbit: « soixante-six tonnes » — #colonne, the air +
//      the seven hand brakes above the 66 line, green; « il en manque » — psi 30 → 27, the bar drops just under the line, red.
//   2. t6:Le, THE FIRST IMAGE again (POSE0, FIRST): on « part » the wheel starts to turn; « Tout seul »: the couplers stretch behind.
//   3. toverdict, the train taking the slope, the camera RIDING it (every key re-aimed on the moving lead): from low ahead-left of the
//      nose (VIEW.prend) back along the five locomotives — « l'air des locomotives »: every brake cylinder in green — to the seven
//      vehicles of the head (the convoi journal's `tete`): « sept » — the seven hand brake wheels red, the red circle round them;
//      #colonne again, the air taken out on « seuls »: 22 t against 66, punch on « tiers ».
//   4. defaut:Et#2, back on THE cylinder, riding the train: « l'air » — the cylinder red, the fittings puffing; « se vidait » — #mano
//      falls to 0, the piston goes back and the shoe lifts off the wheel, which turns faster and faster.
// The train runs from `trigger`: R(at) below is the same law `st` lays on `run`, so the camera keys follow it exactly (keys every
// 0.2 s on the riding shots: a spline through sparse keys would let a 100-unit-per-second train slide in a close-up frame).
// Starts with a complete cut at `tozero`; hands over at `tot7` (acte3 cuts to Lac-Mégantic). Never writes the header (main.js).
// No sound written here (journal → « sons »).
import { feutre } from "@kit/reconstitution.js";
import { FIRST, VIEW, SET, POSE0, onLoco, lit, lookFrom, LOOK } from "./world.js";
import { PARTS, CULPRIT } from "./plan.js";

const RUN_END = 450; // the head's u at tot7: ≈ 90 units/s at the end (motion blur on the ties, never a strobe)
const RUN_GO = 9; // what the first image's wheel does (acte1: 0 → 9), replayed from « part »

export default function acte2c({ D, world }) {
  const { st, now, cut, shot, path, punch } = D;
  const t = D.times({
    tozero: "tozero", souviens: "souviens", manque: "manque", kilos: "kilos", le: "t6:Le", trigger: "trigger", toutseul: "toutseul",
    toverdict: "toverdict", il: "defaut:Il", reussi: "reussi2", locos: "locos", sept: "sept2", seuls: "defaut:seuls",
    verdict: "verdict", fallait: "fallait", et2: "defaut:Et#2", vidait: "vidait", heure: "heure", tot7: "tot7",
  });

  /* the train's run, as st lays it (sine.in to RUN_GO from « part », then power1.in to RUN_END over the verdict) */
  const R = (at) => {
    if (at <= t.trigger) return 0;
    if (at <= t.toverdict) return RUN_GO * (1 - Math.cos(((at - t.trigger) / (t.toverdict - t.trigger)) * (Math.PI / 2)));
    const u = Math.min(1, (at - t.toverdict) / (t.tot7 - t.toverdict));
    return RUN_GO + (RUN_END - RUN_GO) * u * u;
  };
  const SLACK_DUR = 2.7; // « Tout seul » → ≈ 86 s: the wave of the couplers, head to tail
  const slackAt = (at) => (at <= t.toutseul ? 0 : (1 - Math.cos(Math.PI * Math.min(1, (at - t.toutseul) / SLACK_DUR))) / 2);
  const at0 = (at) => ({ run: R(at), slack: slackAt(at) });
  const Lr = (at, local) => onLoco(0, at0(at), local); // a point of the lead locomotive, where it is at `at`
  /** A riding shot: keys every `step` s from a0 to a1, the camera and its target given in the lead's frame by design(u). */
  const ride = (a0, a1, design, step = 0.2) => {
    const keys = [];
    const n = Math.max(2, Math.round((a1 - a0) / step));
    for (let k = 0; k <= n; k++) {
      const at = a0 + ((a1 - a0) * k) / n, u = k / n;
      const { cam, tgt, o, lt, fs } = design(u, at);
      keys.push([at, { ...lookFrom(Lr(at, cam), Lr(at, tgt), o), drift: 0.2 }]);
      if (k > 0) st(keys[k - 1][0], at - keys[k - 1][0], lit(Lr(at, lt), fs), "none");
    }
    return keys;
  };
  const mix = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
  /** Through a list of [u, value] stops, straight between each pair: the keys are passed at speed, never braked on (plan-séquence). */
  const along = (stops, u) => {
    for (let i = 1; i < stops.length; i++) {
      if (u <= stops[i][0] || i === stops.length - 1) {
        const [u0, a] = stops[i - 1], [u1, b] = stops[i];
        const w = Math.max(0, Math.min(1, (u - u0) / (u1 - u0)));
        return Array.isArray(a) ? mix(a, b, w) : a + (b - a) * w;
      }
    }
    return stops.at(-1)[1];
  };

  // every number the place reads, so that each cut says the whole state (nothing inherited from the act before)
  const PARKED = {
    ...FIRST, culprit: 0, fault: 0, ok: 0, depuis: 0, run: 0, slack: 0, brakes: 7, auto: 0, leak: 0.6, derail: 0,
    engine: 0, smoke: 0, fire: 0, cutaway: 0, cab: 0, crew: 0, cutoff: 1, solo: 0, mano: 0, col: 0, mark: 1, speedo: 0, kmh: 0,
    pull: 0, hold: 0, road: 1, town: 1, glow: 0, cross: 0,
  };

  /* ── 1 · tozero, 0:58 — THE cylinder, parked; the column: 70.6 t, then 65.7 t (raccord: « le train reste seul » → its brake) ── */
  const CYL = VIEW.cylindre;
  const C0 = { ...CYL, az: CYL.az - 6, d: CYL.d * 1.12, shift: -110 }; // the cylinder below the column (zone haute)
  cut(t.tozero, SET.PENTE, C0, { ...PARKED, ...lit(onLoco(0, { run: 0 }, PARTS.cylinder), 18), psi: 30 });
  path([
    [t.tozero, C0],
    [t.souviens + 0.4, { az: CYL.az, d: CYL.d * 1.08 }],
    [t.manque + 0.3, { az: CYL.az + 6, el: CYL.el + 2, d: CYL.d * 1.04 }],
    [t.le - 0.13, { az: CYL.az + 11, el: CYL.el + 3, d: CYL.d }],
  ]);
  st(t.souviens - 0.15, 0.3, { col: 1 }, "power2.out");
  // « Il en manque… »: 30 → 27 psi, the bar crosses the 66 line on « centaines » and turns red, held to « kilos »
  st(t.manque, t.kilos - 0.4 - t.manque, { psi: 26.6 }, "sine.inOut"); // 65 t on the column: under the 66 (27 psi read 65.7, shown « 66 »)
  st(t.le - 0.32, 0.18, { col: 0 }, "power1.in");

  /* ── 2 · t6:Le, THE FIRST IMAGE (POSE0, FIRST): « part » the wheel turns, « Tout seul » the couplers stretch ── */
  cut(t.le - 0.12, SET.PENTE, POSE0, { ...FIRST, run: 0, slack: 0, col: 0, mark: 0 });
  shot(t.le - 0.12, t.toverdict - t.le + 0.12, { ...POSE0, d: POSE0.d * 0.93 }, "sine.inOut");
  st(t.trigger, t.toverdict - t.trigger, { run: RUN_GO }, "sine.in");
  st(t.trigger, t.toverdict - t.trigger, lit(onLoco(0, { run: RUN_GO }, PARTS.wheel), 14), "sine.in");
  punch(t.trigger, 0.06);
  st(t.toutseul, SLACK_DUR, { slack: 1 }, "sine.inOut");

  /* ── 3 · toverdict — the train takes the slope; the camera rides back along it, from the nose to the seven of the head ── */
  const V0 = { cam: [-130, 14, 62], tgt: [10, 9, 0], lt: [-20, 9, 0], fs: 70 };
  const k1 = (t.reussi - t.toverdict) / (t.fallait + 0.3 - t.toverdict);
  const k2 = (t.locos - t.toverdict) / (t.fallait + 0.3 - t.toverdict);
  const k3 = (t.sept - t.toverdict) / (t.fallait + 0.3 - t.toverdict);
  const camS = [[0, V0.cam], [k1, [-150, 40, 85]], [k2, [-150, 75, 105]], [k3, [-140, 110, 120]], [1, [-120, 130, 125]]];
  const tgtS = [[0, V0.tgt], [k1, [70, 9, 0]], [k2, [170, 10, 0]], [k3, [300, 10, 0]], [1, [300, 10, 0]]];
  const ltS = [[0, V0.lt], [k1, [50, 9, 0]], [k2, [160, 10, 0]], [k3, [300, 10, 0]], [1, [300, 10, 0]]];
  const fsS = [[0, 70], [k1, 140], [k2, 260], [k3, 340], [1, 340]];
  const shiftS = [[0, 40], [k3, 0], [1, 0]];
  const keys3 = ride(t.toverdict, t.fallait + 0.3, (u) => ({
    cam: along(camS, u), tgt: along(tgtS, u), lt: along(ltS, u), fs: along(fsS, u), o: { fov: 30, shift: along(shiftS, u), dof: 0 },
  }));
  cut(t.toverdict, SET.PENTE, keys3[0][1], {
    ...PARKED, ...at0(t.toverdict), ...lit(Lr(t.toverdict, V0.lt), V0.fs), culprit: CULPRIT.handbrakes, fault: 0, psi: 27, leak: 0.4,
    mark: 1, slack: slackAt(t.toverdict),
  });
  path(keys3);
  st(t.toverdict, t.tot7 - t.toverdict, { run: RUN_END }, "power1.in");
  // « grâce à l'air des locomotives »: every locomotive's brake cylinder, its rod and shoe in green, a moment
  st(t.locos - 0.32, 0.25, { ok: 1 }, "power2.out");
  st(t.sept - 0.55, 0.35, { ok: 0 }, "power1.in");
  // « Tes sept freins à main »: the seven wheels red, the circle round them; the column: air + hand brakes, then the air out on « seuls »
  st(t.sept, 0.2, { fault: 1 }, "power2.out");
  feutre(D, { id: "feutre-sept", anchor: world.A.seven, w: 520, h: 560, dy: 0, from: t.sept + 0.05, to: t.fallait + 0.2, seed: 7 });
  st(t.sept - 0.1, 0.3, { col: 1 }, "power2.out");
  st(t.seuls, 0.55, { psi: 0 }, "sine.inOut");
  punch(t.verdict, 0.06);
  st(t.et2 - 0.42, 0.2, { col: 0 }, "power1.in");

  /* ── 4 · defaut:Et#2 — THE cylinder again, riding: « l'air » red and puffing, « se vidait » the shoe lifts off (raccord: the column
     emptied of its air → the cylinder that empties) ── */
  const air2 = t.et2 + 0.08;
  const cutAt = t.et2 - 0.14;
  const keys4 = ride(cutAt, t.tot7 - 0.02, (u) => ({
    // wider than VIEW.cylindre and lower in the frame: the cylinder, its lever, THE shoe on the wheel, under #mano
    cam: along([[0, [-30, 4.4, 21.5]], [0.5, [-28, 4.6, 21]], [1, [-26, 5.2, 20.5]]], u),
    tgt: along([[0, [-40.6, 3.0, 4.3]], [0.5, [-41, 2.8, 4.2]], [1, [-41.3, 2.7, 4.0]]], u),
    lt: [-41, 3.2, 4.5], fs: 18,
    o: { fov: 30, shift: -90, dof: LOOK.dof },
  }));
  cut(cutAt, SET.PENTE, keys4[0][1], {
    ...PARKED, ...at0(cutAt), ...lit(Lr(cutAt, [-40, 3.4, 4.5]), 18), culprit: CULPRIT.air, fault: 0, psi: 14, leak: 1, mark: 0, col: 0,
  });
  path(keys4);
  st(air2, 0.2, { fault: 1 }, "power2.out");
  st(t.et2 + 0.05, 0.25, { mano: 1 }, "power2.out");
  st(air2, t.vidait - air2, { psi: 6 }, "sine.in");
  st(t.vidait, 0.7, { psi: 0 }, "power1.out");
  st(t.tot7 - 0.3, 0.2, { mano: 0 }, "power1.in");
  now(t.tot7 - 0.05, { mano: 0 });
}
