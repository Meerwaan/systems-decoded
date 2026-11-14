// CR04 — acte2b.js · t3 → t5 (tot3 → tozero): 23:40 the fire on the lead (its engine badly repaired); 23:58 the firefighters cut the
// engine, the fire goes out, the compressor stops; 0:05 the air leaks, ≈ 1 psi a minute; ≈ 0:44 everyone leaves; the train alone.
// docs/CR04-actes.md « acte2b.js » (+ docs/CR04-actes-maj.md: the compressor and the cut-off CLOSE, never in a wide shot).
//   A  tot3 → tot4      low three-quarter on the stack, one move closing on it: black smoke thickens, the 911 chip, the flames ON
//                       « feu »; the hood lifts on « Son moteur », the engine and turbo red ON « mal », the turbo circled.
//   C  tot4 → (feu)     cut (the open flank → the same flank, lower, further back): the fuel cut-off close; ON « coupent » its cover
//                       opens and the lever is thrown (no hand), the engine runs down; the fire's red light still on the hood.
//   D  → Mais           cut back on the stack: ON « s'éteint » the flames die, the smoke falls.
//   E  Mais → tot5      cut, close on the compressor (hood open): green, turning; red ON « compresseur »; still ON « s'arrête ».
//   F  tot5 → onze…     one move under the frame: the fittings puff ON « fuit », along to the cylinder (#mano: 60 → 57, the rod in
//                       by a hair), then the pull-back to the whole dark head ON « Le moteur reste coupé ».
//   H  onze… → train    cut on the clock's jump: the road, the headlights leaving; psi runs down to 31.
//   I  → tozero         cut: the train alone in the dark, the town below; punch « seul ».
// Hands over at tozero (acte2c cuts and sets everything): engine 0, cutoff 1, psi ≈ 30, brakes 7, leak 0.4.
import { feutre } from "@kit/reconstitution.js";
import { FIRST, VIEW, STAGED, SET, AT, LOOK, onLoco, lit, lookFrom } from "./world.js";
import { PSI, CULPRIT, PARTS, ROAD, groundY } from "./plan.js";

const L = (local) => onLoco(0, AT.park, local); // a point of the lead, parked (the train does not move in this act)
const W = (x, h, z) => [x, groundY(x) + h, z]; // a point of the world, h above the slope (route 161: the cars leave world x ≈ 0 uphill, +x)

/** What every cut of this act says: the train parked at Nantes, the essai done (automatic released, seven hand brakes on). */
const BASE = {
  ...FIRST, ...STAGED.tete, run: AT.park.run, slack: 0, brakes: 7, auto: 0, psi: PSI.held, leak: 0, derail: 0,
  culprit: 0, fault: 0, ok: 1, depuis: 0, engine: 1, smoke: 0.4, fire: 0, cutaway: 0, cab: 0, crew: 0, cutoff: 0, solo: 0,
  mano: 0, col: 0, mark: 0, speedo: 0, kmh: 0, pull: 0, hold: 0, road: 0, town: 1, glow: 0, cross: 0,
};

export default function acte2b({ D, world }) {
  const { st, now, cut, path, chip, punch } = D;
  const t = D.times({
    tot3: "tot3", appelle: "appelle", feu: "feu3", son: "t3:Son", mal: "repare",
    tot4: "tot4", pompiers: "pompiers", coupent: "coupent", feu4: "t4:feu", eteint: "eteint", mais: "t4:Mais",
    compresseur: "compresseur4", arrete: "arrete",
    tot5: "tot5", fuit: "fuit5", environ: "t5:environ", reste: "reste5", onze: "onzequarante", repart: "repart",
    train: "t5:train", seul: "seul5", tozero: "tozero",
  });

  /* ───────────── A · 23:40 — the fire ───────────── */
  const STACK = L([-16, 20, 0]);
  const A0 = { ...VIEW.cheminee, drift: 0.2 };
  cut(t.tot3, SET.PENTE, A0, { ...BASE, smoke: 0.4 });
  st(t.tot3 + 0.1, t.feu - t.tot3 - 0.1, { smoke: 1 }, "sine.inOut"); // the smoke thickens
  chip("chip-911", null, 96, 470, t.appelle, t.tot4 - 0.2);
  st(t.feu, 0.35, { fire: 1 }, "power2.out"); // ON « feu »: the flames out of the stack
  punch(t.feu, 0.06);
  st(t.son, 0.9, { cutaway: 1 }, "power2.inOut"); // « Son moteur »: the hood lifts off
  st(t.mal, 0.12, { culprit: CULPRIT.engine, fault: 1 }, "none"); // ON « mal »: the engine and its turbo red
  feutre(D, { id: "f2b-turbo", anchor: world.lead.A.turbo, w: 210, h: 170, from: t.mal, to: t.tot4 - 0.2, seed: 3 });
  path([
    [t.tot3, A0],
    [t.feu, lookFrom(L([-70, 9, 50]), L([-16, 20.5, 0]), { fov: 30, shift: 60, drift: 0.2 })],
    [t.mal, lookFrom(L([-62, 17, 54]), L([-15, 16, 1]), { fov: 30, shift: 30, drift: 0.2 })],
    [t.tot4 - 0.02, lookFrom(L([-56, 22, 50]), L([-15, 15, 2]), { fov: 30, shift: 30, drift: 0.2 })],
  ]);

  /* ───────────── C · 23:58 — the cut-off, close ───────────── */
  const CUT = PARTS.cutoff;
  // retouche 14/11: the whole lead first (front-left three-quarter: cab, hood, the fire on the stack), then one push along the same
  // line onto the cut-off (circled), so it reads as « on the locomotive »; no near sill crosses the subtitle band any more
  const C0 = lookFrom(L([-95, 26, 70]), L([-6, 9, 5]), { fov: 30, shift: 20, dof: 0, drift: 0.15 });
  const C1 = lookFrom(L([-16, 12.5, 32]), L(CUT), { fov: 30, shift: 10, dof: 0, drift: 0.15 });
  cut(t.tot4, SET.PENTE, C0, { ...BASE, ...lit(L([0, 9, 6]), 34), smoke: 1, fire: 1, culprit: 0, fault: 0, ok: 0 });
  st(t.tot4 + 0.6, t.coupent - t.tot4 - 0.8, { ...lit(L(CUT), 12) }, "sine.inOut"); // the light gathers on the cut-off
  st(t.coupent, 0.6, { cutoff: 1 }, "power2.inOut"); // ON « coupent »: the cover opens, the lever thrown down (no hand)
  st(t.coupent + 0.3, 1.5, { engine: 0 }, "sine.inOut"); // the engine runs down (the hood is shut: only the body's hum)
  const cutC = t.feu4 - 0.3; // a few frames before « Le feu s'éteint »
  feutre(D, { id: "f2b-cutoff", anchor: world.lead.A.cutoff, w: 230, h: 190, from: t.coupent - 0.35, to: cutC - 0.2, seed: 5 });
  path([
    [t.tot4, C0],
    [t.coupent - 0.2, C1],
    [cutC, lookFrom(L([-12, 11.5, 28]), L(CUT), { fov: 30, shift: 10, drift: 0.15 })],
  ]);

  /* ───────────── D · the fire goes out ───────────── */
  const D0 = lookFrom(L([-62, 12, 38]), L([-16, 21, 0]), { fov: 30, shift: 50, drift: 0.2 });
  cut(cutC, null, D0, { ...BASE, smoke: 0.6, fire: 1, engine: 0, cutoff: 1 });
  st(t.eteint, 0.5, { fire: 0 }, "power2.in"); // ON « s'éteint »
  st(t.eteint + 0.1, 0.9, { smoke: 0 }, "sine.in"); // the smoke falls
  const cutE = t.mais - 0.12;
  path([
    [cutC, D0],
    [cutE, lookFrom(L([-56, 9, 44]), L([-16, 20, 0]), { fov: 30, shift: 50, drift: 0.2 })],
  ]);

  /* ───────────── E · the compressor, close (hood open) ───────────── */
  const COMP = PARTS.compressor;
  const E0 = lookFrom(L([-6, 23, 22]), L([-22, 11, 0]), { fov: 30, shift: 20, dof: LOOK.dof, drift: 0.15 });
  // `engine` stays constant while the flywheel is seen: locomotive.js turns it by time × engine (a ramp would whirl it): it stops on one frame
  cut(cutE, null, E0, { ...BASE, ...lit(L(COMP), 26), engine: 0.7, smoke: 0, cutaway: 1, cutoff: 1, ok: 1 });
  st(t.compresseur, 0.12, { culprit: CULPRIT.compressor, fault: 1 }, "none"); // ON « compresseur »: red
  punch(t.compresseur, 0.06);
  now(t.arrete, { engine: 0 }); // ON « s'arrête »: still
  st(t.arrete, 0.3, { ok: 0 }, "power1.out");
  path([
    [cutE, E0],
    [t.compresseur, lookFrom(L([-9, 22.5, 21]), L([-22.5, 11, 0]), { fov: 30, shift: 20, dof: E0.dof, drift: 0.15 })],
    [t.tot5 - 0.02, lookFrom(L([-11, 21.5, 19.5]), L([-23, 11, 0]), { fov: 30, shift: 20, dof: E0.dof, drift: 0.15 })],
  ]);

  /* ───────────── F · 0:05 — the air leaks, under the frame, to the cylinder, then the dark head ───────────── */
  const F0 = lookFrom(L([-60, 2.5, 17]), L([-30, 5.2, 5.5]), { fov: 36, shift: 20, dof: E0.dof, drift: 0.1 });
  cut(t.tot5, null, F0, { ...BASE, ...lit(L([-28, 5, 7]), 30), engine: 0, smoke: 0, cutaway: 0, cutoff: 1, ok: 0, psi: PSI.held });
  st(t.fuit, 0.12, { culprit: CULPRIT.air, fault: 1 }, "none"); // ON « fuit »: the cylinder, its rod, the fittings red
  st(t.fuit, 0.5, { leak: 1 }, "power2.out"); // the puffs
  now(t.environ, { mano: 0 });
  st(t.environ, 0.25, { mano: 1 }, "power1.out"); // #mano: the needle leaves 60
  st(t.environ + 0.3, t.reste - t.environ - 0.3, { psi: PSI.held - 3 }, "none"); // cran by cran, 60 → 57: the rod in by a hair
  st(t.environ, 0.9, { fx: L(PARTS.cylinder)[0], fy: L(PARTS.cylinder)[1], fz: L(PARTS.cylinder)[2], fs: 22 }, "sine.inOut");
  st(t.reste - 0.32, 0.2, { mano: 0 }, "power1.in");
  now(t.reste - 0.12, { fault: 0, ...lit(L([-20, 9, 0]), 70), leak: 0.6, psi: PSI.held - 3 }); // the cut: the head, dark
  path([
    [t.tot5, F0],
    [t.fuit, lookFrom(L([-56, 3.2, 21]), L([-31, 5.2, 5.5]), { fov: 34, shift: 20, dof: E0.dof, drift: 0.1 })],
    [t.environ + 0.5, lookFrom(L([-27, 4.5, 20]), L([-38.6, 4.2, 5]), { fov: 30, shift: 20, dof: E0.dof, drift: 0.1 })],
    [t.reste - 0.12, lookFrom(L([-31, 5.5, 21]), L([-38.6, 4.4, 5]), { fov: 30, shift: 20, dof: E0.dof, drift: 0.1 })],
  ]);
  // « Le moteur reste coupé »: cut back (the cylinder → the whole head, the same flank), the head dark, no smoke
  const G0 = lookFrom(L([-100, 24, 108]), L([-12, 9, 0]), { fov: 30, shift: 20, dof: 0, drift: 0.15 });
  cut(t.reste - 0.12, null, G0);
  path([
    [t.reste - 0.12, G0],
    [t.onze - 0.02, lookFrom(L([-86, 21, 116]), L([-10, 9, 0]), { fov: 30, shift: 20, dof: 0, drift: 0.15 })],
  ]);

  /* ───────────── H · ≈ 0:44 — everyone leaves ───────────── */
  const H0 = lookFrom(W(-280, 30, ROAD.z - 10), W(380, 4, ROAD.z + 8), { fov: 30, shift: 20, drift: 0.2 });
  cut(t.onze, null, H0, { ...BASE, ...lit(W(150, 6, ROAD.z + 15), 450), engine: 0, smoke: 0, cutoff: 1, ok: 0, leak: 0.6, psi: PSI.held - 3 });
  st(t.onze + 0.42, 2.0, { road: 1 }, "power1.in"); // the headlights drive away
  st(t.onze + 0.2, t.train - t.onze - 0.3, { psi: 31 }, "none"); // the time has passed
  const cutI = t.train - 0.24;
  path([
    [t.onze, H0],
    [t.repart, lookFrom(W(-230, 32, ROAD.z - 14), W(1300, 4, ROAD.z + 8), { fov: 30, shift: 20, drift: 0.2 })],
    [cutI, lookFrom(W(-200, 34, ROAD.z - 16), W(2100, 4, ROAD.z + 8), { fov: 30, shift: 20, drift: 0.2 })],
  ]);

  /* ───────────── I · the train alone ───────────── */
  // retouche 14/11: VIEW.seul put the train as a line on the horizon; now the head of the train, readable, a narrow light on it,
  // and the empty night ahead of it and above (acte2c cuts at tozero and sets its own pose)
  const I0 = lookFrom(L([-230, 40, -150]), L([-45, 10, 0]), { fov: 30, shift: 40, drift: 0.2 });
  cut(cutI, null, I0, { ...BASE, ...lit(L([0, 10, 0]), 60), engine: 0, smoke: 0, cutoff: 1, ok: 0, leak: 0.4, psi: 30, road: 1 });
  punch(t.seul, 0.06);
  path([
    [cutI, I0],
    [t.tozero - 0.02, { ...I0, d: I0.d * 0.93 }],
  ]);
}

