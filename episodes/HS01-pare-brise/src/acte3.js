// (02 · L'USINE, suite) — flacon → tete (29,2 → 49,8 s): 1903, the stamp, the side window that bursts, the 10 kg head.
// See docs/HS01-actes.md for the plan. In cuts, one shot per breath; NOTHING IS PAID:
//   · the flask falls in slow motion, followed — the cut comes while it is still ~1 m in the air (`flask` 0.72: at 0.84
//     dossier.js already lays it on the floor), `star` stays 0
//   · the stamp is seen raking, sliding down: it never reads (face on it says E2 · II · 43R)
//   · the side window bursts « toute seule » — the grain glows half a second, never named
//   · the head falls in slow motion, the camera goes down with it; black one frame-ish before the glass (drop < 1)
import { SET, AT, VIEW, L01_AT, ST, LAB, onLine, run } from "./world.js";

const P = { fov: 30, side: 0, roll: 0, drift: 0.3 };

/* The flask's fall, as dossier.js draws it (fallPose): shelf → edge (k 0.1) → floor (k 0.84), height ∝ t². */
const SHELF_C = [LAB.shelf[0], LAB.shelf[1] + LAB.flask.h / 2, LAB.shelf[2]];
const TW = (() => {
  const x = LAB.floor[0] - LAB.shelf[0], z = LAB.floor[2] - LAB.shelf[2], n = Math.hypot(x, z);
  return [x / n, z / n];
})();
const EDGE = [SHELF_C[0] + 8 * TW[0], SHELF_C[1], SHELF_C[2] + 8 * TW[1]];
const LIE = [LAB.floor[0] + 4 * TW[0], 6.6, LAB.floor[2] + 4 * TW[1]];
const flaskAt = (k) => {
  if (k <= 0.1) return EDGE;
  const u = (k - 0.1) / 0.74;
  return [EDGE[0] + (LIE[0] - EDGE[0]) * u, EDGE[1] - 2 + (LIE[1] - EDGE[1] + 2) * u * u, EDGE[2] + (LIE[2] - EDGE[2]) * u];
};

export default function acte3({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    flacon: "flacon", tombe: "flacon:tombe", eclats: "flacon:éclats",
    tampon: "tampon", lire: "tampon:lire",
    nickel: "nickel", eclate: "nickel:éclate",
    tete: "tete", kilos: "tete:kilos", drop: "drop",
    ouvre: "ouvre",
  });
  const from = t.flacon - 0.15;

  /* ── « Et on est remontés jusqu'en novembre 1903. » — from the glass of the flask, a pull-back to his hand ──── */
  // the raccord from the bench's glass edge: a detail of glass, the flask's shoulder, then the room opens around it
  const FLASK0 = { ...P, tx: LAB.shelf[0], ty: LAB.shelf[1] + 8, tz: LAB.shelf[2], d: 120, az: -18, el: -4, shift: 0 };
  cut(from, SET.LAB, FLASK0, {
    ...AT.lab, labelOn: 1, ben: 0, flask: 0, star: 0, l01: L01_AT.flacon, fils: 3,
    fx: -150, fy: 300, fz: -220, fs: 320,
  });
  // a slow pull-back that keeps the flask (the arm stays out of the way: a wide shelf shot puts it in front)
  shot(from + 0.04, t.tombe - 0.3 - (from + 0.04), { ...FLASK0, d: 165, az: -24, el: -2 }, "sine.inOut", 120);

  /* ── « Un flacon tombe par terre. Il aurait dû voler en éclats. » — it slips on « tombe », slow motion, followed ─ */
  const tip = t.tombe - 0.3;
  st(tip, 0.3, { flask: 0.1 }, "power2.in");
  const cutT = t.tampon - 0.12; //   the cut: the flask still in the air
  const K_END = 0.72;
  st(t.tombe, cutT - t.tombe, { flask: K_END }, "none");
  st(t.tombe, cutT - t.tombe, { fy: 120, fx: -100, fz: -140 }, "sine.inOut");
  // the camera falls with it: keys along its path (k linear in time), each leg a straight move
  const FOLLOW = { ...P, shift: 120, d: 230, az: -22, el: 2 };
  const legs = 6;
  shot(tip, t.tombe - tip + 0.05, { ...FOLLOW, tx: EDGE[0], ty: EDGE[1] - 4, tz: EDGE[2], d: 240 }, "sine.inOut");
  for (let i = 1; i <= legs; i++) {
    const a = t.tombe + 0.05 + ((cutT - t.tombe - 0.05) * (i - 1)) / legs;
    const b = t.tombe + 0.05 + ((cutT - t.tombe - 0.05) * i) / legs;
    const k = 0.1 + (K_END - 0.1) * ((b - t.tombe) / (cutT - t.tombe));
    const [x, y, z] = flaskAt(k);
    shot(a, b - a, { ...FOLLOW, tx: x, ty: y, tz: z, d: 240 - 50 * (i / legs), el: 2 - 6 * (i / legs) }, "none");
  }
  now(t.eclats, { fils: 4 });

  /* ── « Un petit tampon, dans le coin de ta vitre. Le jour où il faut sortir… tu sais le lire ? » ─────────────── */
  // the cut on the movement of the fall: the camera keeps gliding DOWN, now along the corner of the windshield; raking
  const RAKE = { ...VIEW.stamp, d: 100, az: -67, el: 3, shift: 120 }; // seen: a raked mark, never letters (≥ −66 reads)
  cut(cutT, SET.BENCH, { ...RAKE, ty: RAKE.ty + 14 }, { ...AT.bench, litStamp: 1, l01: L01_AT.tampon, fils: 4 });
  shot(cutT + 0.04, t.nickel - 0.12 - (cutT + 0.04), { ...RAKE, ty: RAKE.ty - 3, d: 92, az: -69 }, "sine.out");
  now(t.lire, { fils: 5 });

  /* ── « Et parfois, une vitre éclate… toute seule. Des années plus tard. » — from inside, nothing touches it ────── */
  const cN = t.nickel - 0.12;
  const SIDE_IN = { ...VIEW.sideIn };
  cut(cN, SET.CAR, { ...SIDE_IN, d: 165, az: 68 }, { ...AT.car, sideOn: 1, nickel: 0, grains: 0, l01: L01_AT.nickel, fils: 5 });
  shot(cN + 0.04, t.tete - 0.12 - (cN + 0.04), { ...SIDE_IN, d: 148, az: 70 }, "sine.inOut");
  st(t.eclate - 0.6, 0.45, { nickel: 0.5 }, "power2.out"); // the grain glows, unnamed
  // never past 0.85: above 0.9 casse.js lights a one-frame flash before the grains (qa: a parasite frame at 41.8 s)
  st(t.eclate - 0.15, 0.15, { nickel: 0.85 }, "power2.in");
  st(t.eclate, 0.3, { grains: 0.7 }, "power2.out");
  now(t.eclate, { fils: 6 });

  /* ── « Et à la fin, on lâche sur lui une tête de dix kilos. » — the head falls, slow; black before the glass ──── */
  const cT = t.tete - 0.12;
  const black = t.ouvre - 0.27;
  const X = ST.test.frame;
  // the head (postes.js · makeHeadRig: y = yC + 150 (1 − drop²), yC ≈ 100 the glass) and the glass in one frame,
  // then the camera goes down WITH it: keys along its fall (drop eased sine.in), the head held at ≈ y 660 → 820 px
  const headY = (u) => {
    const k = 0.97 * (1 - Math.cos((u * Math.PI) / 2));
    return 100 + 150 * (1 - k * k);
  };
  const HP = (u) => onLine(X, { ...P, ty: headY(u), d: 600 * (240 / 600) ** u, az: -24, el: 10 - 4 * u, shift: 300 - 160 * u });
  cut(cT, SET.LINE, { ...HP(0), d: 640 }, {
    ...AT.line, pos: X, cut: 1, print: 1, bend: 1, film: 1, sensors: 1, drop: 0, web: 0, rings: 0, stick: 0,
    mood: 1, hot: 0.2, fx: X, fy: 150, fz: 0, fs: 380, l01: L01_AT.tete, fils: 6,
  });
  run(D, cT, black);
  shot(cT + 0.04, t.drop - (cT + 0.04), HP(0), "sine.inOut", 640);
  st(t.drop, black - t.drop, { drop: 0.97 }, "sine.in");
  const N = 8;
  for (let i = 1; i <= N; i++) {
    const a0 = t.drop + ((black - t.drop) * (i - 1)) / N;
    shot(a0, (black - t.drop) / N, HP(i / N), "none");
  }
  now(t.kilos, { fils: 7 });
  tl.set("#black", { opacity: 1 }, black);
}
