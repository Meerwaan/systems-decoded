// 02 · AUTOPSIE, second half — the principle and the rest (toprincipe → tozero). Seven sentences, six shots; every
// sentence shows its law on the thing itself: the air thickening as you fall (the pressure layers rushing up past
// you), the box reading it (its port lit, the pressure bar, then the rate bar), a canopy that drifts vs a body that
// rushes, the rate bar crossing its mark into signal on « chute », the self-test on the grass taking its zero, the
// ground falling away under the rig on the climb, and the window lit 225 m above the ground under your fall.
// No subscribe call here (since 036): the rest runs straight into the threat. No opening time is ever shown.
import { SET, VIEW, BENCHED, STAGED, SPEED, SYSTEM } from "./world.js";

// the control unit on the top flap (docs/journal/037-model.md: « unité de contrôle »)
const CTRL = { tx: 11, ty: 19.2, tz: 23.5 };

export default function acte2b({ D }) {
  const { st, shot, cut, punch, chip } = D;
  const t = D.times({
    toprincipe: "toprincipe", epaissit: "epaissit",
    boitier: "principe:boîtier", lit: "principe:lit", pression: "principe:pression", vitesse: "principe:vitesse", monte: "monte2",
    une: "principe:Une", voile: "voile1", trente: "trente5", chute: "principe:chute",
    torepos: "torepos", zero: "zero1", avion: "avion", montee: "repos:montée",
    fenetre: "fenetre", deux: "gate1", sol: "repos:sol#2", tozero: "tozero", // « du sol », not « Au sol »
  });
  // the cuts, a few frames before the sentence they serve
  const cBox = t.boitier - 0.18; //   « Le boîtier lit sa pression… »
  const cTwin = t.une - 0.06; //      « Une voile ouverte… »
  const cGauge = t.trente - 0.52; //  « Au-delà de 35… »
  const cWin = t.fenetre - 0.34; //   « Et sa fenêtre… »
  const fallState = { tilt: 0, hang: 0, land: 0, deploy: 0, flaps: 0, loop: 0, piston: 0, power: 1, fabric: 1, threat: 0 };

  /* ── « Plus tu descends, plus l'air s'épaissit. » — you fall through the pressure layers: they rush up and close in ── */
  const s1 = { ...VIEW.side, d: 600, az: -60, el: 32, fov: 46, shift: 40 };
  cut(t.toprincipe, SET.SCENE, s1, { ...STAGED, ...fallState, alt: 2600, vz: SPEED.fall, spin: 0, strata: 1, mood: 0 });
  st(t.toprincipe, cBox - t.toprincipe, { alt: 1900 }, "none");
  st(t.toprincipe, cBox - t.toprincipe, { spin: 0.45 }, "none");
  shot(t.toprincipe, cBox - t.toprincipe, { ...s1, d: 520 }, "sine.inOut");

  /* ── « Le boîtier lit sa pression… et à quelle vitesse elle monte. » — the port lit, the two bars of the gauge ── */
  const s2 = { ...VIEW.unit, d: 42 };
  cut(cBox, SET.BENCH, s2, { ...BENCHED, solo: 1, alt: 1900, vz: SPEED.fall });
  st(t.lit, 0.3, { litSensor: 1 }, "power2.out");
  st(t.pression, 0.6, { press: 0.7 }, "power2.out");
  st(t.vitesse, t.monte + 0.2 - t.vitesse, { rate: 0.5 }, "sine.inOut");
  punch(t.vitesse, 0.06);
  shot(cBox, cTwin - cBox, { ...s2, d: 34 }, "sine.inOut");

  /* ── « Une voile ouverte : quelques mètres par seconde. » — the second diver drifts under his canopy; you rush ── */
  const s3 = { ...VIEW.twin, ty: 320, d: 2500 };
  cut(cTwin, SET.SCENE, s3, { ...STAGED, ...fallState, alt: 1700, vz: SPEED.fall, spin: 0, twin: 1, mood: 0 });
  st(cTwin, cGauge - cTwin, { alt: 1560, spin: 0.5 }, "none");
  shot(cTwin, cGauge - cTwin, { ...s3, d: 2300 }, "sine.inOut");

  /* ── « Au-delà de 35, pour lui, c'est une chute. » — the rate bar climbs to its mark… and over it, signal ── */
  const s4 = { ...VIEW.unit, d: 32, az: -74, el: 18 };
  cut(cGauge, SET.BENCH, s4, { ...BENCHED, solo: 1, litSensor: 1, press: 0.8, rate: 0.12, alt: 1560, vz: SPEED.fall });
  st(t.trente, 0.4, { rate: 0.62 }, "sine.inOut");
  st(t.chute, 0.16, { rate: 1, mood: 1 }, "power2.out");
  chip("chip-seuil", null, 96, 470, t.trente, t.chute + 0.22);
  punch(t.chute, 0.06, { up: 0.08, hold: 0.1, down: 0.28 });
  shot(cGauge, t.torepos - cGauge, { ...s4, d: 27 }, "sine.inOut");

  /* ── « Au sol, il prend cette pression comme son zéro. » — the morning, the rig on the grass, the self-test ── */
  const s5 = { ...VIEW.ground };
  const s5in = { ...VIEW.ground, ...CTRL, d: 110, az: -36, el: 40, shift: 30 };
  const lift = t.zero + 0.26; // the pull-back starts in the breath after « zéro »
  cut(t.torepos, SET.SCENE, s5, {
    ...STAGED, ...fallState, alt: 0, vz: 0, body: 0, spin: 0, mood: 0, test: 0,
    fx: SYSTEM.centre[0], fy: SYSTEM.centre[1], fz: SYSTEM.centre[2], fs: 60,
  });
  st(t.torepos + 0.24, t.zero - t.torepos - 0.24, { test: 0.8 }, "none");
  st(t.zero + 0.24, 0.3, { test: 1 }, "none");
  chip("chip-zero", null, 96, 470, t.zero, t.avion - 0.12);
  shot(t.torepos, lift - t.torepos, s5in, "sine.inOut");

  /* ── « Dans l'avion, il compte la montée. » — the ground falls away under the rig, the header counts to 4 000 ── */
  // an even climb in ratio (≈ ×1,5 every 0,1 s), from the breath after « zéro »: the grass, the morning light and the
  // roads hand over across several frames instead of four (power2.in crossed 0 → 60 m in ≈ 0,15 s: the picture jumped)
  const climb = (u) => (Math.exp(7.6 * u) - 1) / (Math.exp(7.6) - 1);
  st(lift, t.montee + 0.2 - lift, { alt: 4000 }, climb);
  const s6 = { ...VIEW.ground, tx: 5, ty: 8, tz: 14, d: 320, az: -40, el: 62, fov: 36, shift: 0 };
  shot(lift, cWin - lift, s6, "sine.inOut", s5in.d);

  /* ── « Et sa fenêtre ne s'ouvre que vers 225 mètres du sol. » — the fall from afar, the sheet lit under you ── */
  const s7 = { ...VIEW.dive, d: 800, el: 42, fov: 50, shift: 40 };
  cut(cWin, SET.SCENE, s7, { ...STAGED, ...fallState, alt: 820, vz: SPEED.fall, spin: 0, threat: 0.2, mood: 0 });
  st(cWin, t.tozero - cWin, { alt: 250, spin: 1.4 }, "none");
  st(t.fenetre, 0.5, { gate: 1 }, "power2.out");
  chip("chip-fenetre", null, 96, 470, t.deux + 0.25, t.tozero - 0.17); // after the caption turns to « 225 », not on it
  st(t.sol, 0.3, { threat: 0.6 }, "power2.out");
  punch(t.sol, 0.06, { up: 0.08, hold: 0.1, down: 0.28 });
  shot(cWin, t.tozero - cWin, { ...s7, d: 700 }, "sine.inOut");
}
