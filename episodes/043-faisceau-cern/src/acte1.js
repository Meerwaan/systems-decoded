// DOSSIER 043 — 01 MENACE : accroche, promesse, scene (0 → toopen). docs/043-actes.md § acte1.js, docs/043-actes-maj.md.
//
// PLAN-SÉQUENCE: five moves, four cuts (« dehors », the grain, the scene, the exit), az always decreasing inside a move.
//   0 → 3.98    the hook. POSE0 exactly on frame 0; the train already runs (gap at 900 cm/s from t = 0, ease "none"), the
//               grain falls (it reaches the beam's axis on « poussière ») and its shower grows: the picture moves by its
//               subject on frame 1. The camera pushes in toward the grain (« Un grain de poussière »), which strikes the
//               train as « poussière » ends (the shower bursts on « va le jeter »).
//   3.98 → 7.03 a cut ON « dehors »: outside. « Pour l'avaler : un bloc de six tonnes » — blockFar, entering at speed (the
//               swish): the way out (route) runs down the line and lands in the face on the click; the block on its halo.
//   7.03 → 9.90 « Et des grains comme lui… combien ont déjà gagné ? » — a grain like him falls before the train (the
//               pose is ours: VIEW.grainFloat left the grain out of frame); a wagon's hole comes down the far bar; it
//               strikes bunches ON « gagné ».
//   9.90 → 16.90 the scene, ONE move: the coil under the shower (« pleuvoir », « aimants »), the hero bunch and its
//               twentieth that strikes the coil (« abîmer »), the pull-back as the train leaves again (« des milliers »),
//               then forward along the train that rushes at us. 16.90 cut: the ring round point 6, its only branch, and
//               the dive into it as it lights veille (« la sortie de secours »).
//               act 2 cuts on `dive` while this dive still runs.
// CLOSE UP, THE TRAIN IS A WHITE BAR: it reads « train » when a wagon's hole runs by. Every tight shot has one, placed by
// `holeAt` (the gap value that puts the centre of hole k at an arc s) and `run` (the train's speed, cm/s, by keys).
import { setAct } from "@kit/overlay.js";
import { POSE0, FIRST, VIEW, LIGHT, BEAM, S6, PLACES } from "./world.js";

/** The gap value that puts the centre of the wagon hole k (counted from the train's head) at arc s (cm past the grain). */
const holeAt = (s, k = 10) => s - S6 + BEAM.gap / 2 + (k * (BEAM.perWagon + BEAM.between) + BEAM.perWagon + BEAM.between / 2) * BEAM.slot;
/** How far the train runs from keys[0] to t, its speed linear between keys ([[t, v], …], cm/s). */
const travelled = (keys, t) => {
  let d = 0;
  for (let i = 1; i < keys.length; i++) {
    const [ta, va] = keys[i - 1], [tb, vb] = keys[i];
    if (t <= ta) break;
    const u = Math.min(t, tb) - ta, vu = va + ((vb - va) * u) / (tb - ta);
    d += ((va + vu) / 2) * u;
  }
  return d;
};

export default function acte1({ D }) {
  const { tl, st, now, cut, path, punch, chip } = D;
  const t = D.times({
    train: "accroche:train", grain: "accroche:grain", poussiere: "accroche:poussière", dehors: "accroche:dehors",
    promesse: "promesse", avaler: "promesse:l'avaler", bloc: "promesse:bloc", et: "promesse:et", gagne: "promesse:gagné",
    scene: "scene", pleuvoir: "scene:pleuvoir", aimants: "scene:aimants", vingtieme: "scene:vingtième", abimer: "scene:abîmer",
    ton: "scene:ton", milliers: "scene:milliers", seule: "scene:seule", issue: "scene:issue", sortie: "scene:sortie",
    toopen: "toopen",
  });
  const cBlock = t.dehors - 0.1, hit = t.poussiere + 0.34, cGrain = t.et - 0.12, cScene = t.scene - 0.12, cExit = t.seule - 0.12;
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /** The train runs at the speeds of `keys` from gap g0 (a speed ramp is a quadratic ease: no jump in speed). */
  const run = (keys, g0) => {
    let g = g0;
    now(keys[0][0], { gap: g });
    for (let i = 1; i < keys.length; i++) {
      const [ta, va] = keys[i - 1], [tb, vb] = keys[i];
      const T = tb - ta, dg = ((va + vb) / 2) * T, a = (va * T) / dg;
      st(ta, T, { gap: g + dg }, va === vb ? "none" : (u) => a * u + (1 - a) * u * u);
      g += dg;
    }
  };

  /* ── 0 → 3.98 · « Ton faisceau porte l'énergie d'un train lancé. Un grain de poussière va le jeter… » ── */
  run([[0, 900], [cGrain, 900]], FIRST.gap); // the hook runs on into blockFar: the far ring's ribbon keeps its pace
  // the grain falls from frame 0 (no stop), and strikes the train as « poussière » ends: its speed doubles on the way
  const g1 = 0.6, a1 = ((g1 - FIRST.grain) / t.grain) * ((hit - t.grain) / (1 - g1));
  st(0, t.grain, { grain: g1 }, "none");
  st(t.grain, hit - t.grain, { grain: 1 }, (u) => a1 * u + (1 - a1) * u * u);
  st(0, 2.3, { spray: 0.4 }, "sine.out");
  st(hit, 0.4, { spray: 0.7 }, "power2.out"); // struck: the shower bursts (« va le jeter »)
  path([
    [0, POSE0],
    [t.train, { tx: 3, ty: 1.7, d: 57, az: -78.5, el: 4.6, drift: 0.2 }],
    [t.grain, { tx: 0.5, ty: 1.5, d: 47, az: -80, el: 5 }],
    [cBlock, { tx: 0, ty: 1, d: 41, az: -81.5, el: 5.2 }],
  ]);
  punch(t.train, 0.06);
  chip("chip-grain", null, 96, 470, t.grain + 0.06, cBlock - 0.18);

  /* ── 3.98 → 7.03 · « …dehors. Pour l'avaler : un bloc de six tonnes. » — cut ON « dehors »: outside, the block ── */
  cut(cBlock, null, { ...VIEW.blockFar, d: 2900, az: -142 }, { route: 0.3, litBlock: 0.4, pool: 1, mood: 0, ...LIGHT.block });
  st(cBlock, t.avaler + 0.4 - cBlock, { route: 1 }, "sine.inOut"); // the way out runs down the line, lands in the face on the click
  st(t.avaler + 0.4, 0.12, { litBlock: 1 }, "power2.out");
  st(t.avaler + 0.52, 0.8, { litBlock: 0.55 }, "sine.out");
  path([
    [cBlock, { ...VIEW.blockFar, d: 2900, az: -142 }], // it enters at speed (the swish)
    [t.promesse, { d: 2380, az: -147 }],
    [t.bloc, { d: 2200, az: -152 }],
    [cGrain, { d: 2040, az: -158 }],
  ]);

  /* ── 7.03 → 9.90 · « Et des grains comme lui… combien ont déjà gagné ? » ── */
  // a fresh grain like him falls, a wagon's hole runs by, and it strikes the train ON « gagné »
  const GF = { ...VIEW.grainFloat, tx: 0, ty: 0.5, tz: 0, d: 50, az: -68, el: 7 };
  const kGrain = [[cGrain, 200], [cScene, 200]];
  cut(cGrain, null, GF, { route: 0, litBlock: 0, pool: 0.6, mood: 1, grain: 0.5, spray: 0.12, ...LIGHT.grain });
  run(kGrain, holeAt(0) - 200 * (cScene + 0.25 - cGrain)); // a wagon's hole comes down the far bar; the grain strikes bunches
  st(cGrain, t.gagne - cGrain, { grain: 1 }, "power1.in");
  st(t.gagne, 0.4, { spray: 0.6 }, "power2.out");
  path([
    [cGrain, GF],
    [t.gagne - 0.6, { az: -72, d: 46 }],
    [cScene, { az: -77, d: 43 }],
  ]);
  punch(t.gagne, 0.06);

  /* ── 9.90 → 19.54 · the scene, one move ── */
  // back at the hook's eye (between coil and yoke of magnet 0), a longer lens: the train rushes at us, wagon after wagon
  const TRAIN_LONG = { tx: 285, ty: -2, tz: -10, d: 360, az: -85, el: 2.2, fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 };
  // retouche 08/11: the MAGNET is the subject: its end (cryostat, yoke, the two apertures, the coil) three-quarter, whole
  // in frame, the shower raining into it; then down its body to the struck coil, never closer than d 70 (no reversal)
  const FACE = { tx: -25, ty: -3, tz: 0, d: 300, az: -52, el: 24, fov: 34, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 };
  const slow = t.vingtieme - 0.5, go = t.ton - 0.06, cTrain = t.ton - 0.12;
  const kScene = [[cScene, 200], [slow - 0.5, 200], [slow, 60], [go, 60], [go + 0.7, 1500], [t.toopen, 1500]];
  cut(cScene, null, FACE, { mood: 1, grain: 1, spray: 0.6, coil: 0.15, route: 0, litBlock: 0, pool: 0.6, fx: -120, fy: 0, fz: 0, fs: 150 });
  run(kScene, holeAt(50) - travelled(kScene, t.abimer - 0.28)); // a hole behind the hero bunch; the one before it passes the coil
  st(t.pleuvoir, 0.35, { spray: 1 }, "power2.out"); // « pleuvoir »
  st(t.aimants, 0.36, { coil: 0.45 }, "power2.out"); // « aimants » : a hot SPOT on the coil (0.7 spread it into a band)
  // « Un vingtième d'un paquet suffit à en abîmer un. » : one bunch drawn big, its twentieth comes away and strikes
  st(slow, 0.5, { hero: 1 }, "sine.inOut");
  st(t.vingtieme, 0.42, { slice: 0.4 }, "sine.inOut");
  st(t.abimer - 0.5, t.ton - 0.4 - (t.abimer - 0.5), { slice: 1 }, "sine.in"); // it lands at the crack (scene:ton − 0.36)
  st(t.ton - 0.44, 0.3, { coil: 0.52 }, "power2.out"); // the twentieth's hit: the spot grows, still a spot
  punch(t.abimer, 0.06);
  // « Ton train en compte des milliers. » : the train leaves again, we pull back over it
  st(go, 0.4, { hero: 0 }, "sine.inOut");
  st(go, 0.8, { spray: 0.35 }, "sine.inOut"); // the eye goes back into the shower's reach: thin it
  st(go + 0.5, 1.0, { coil: 0.75 }, "sine.inOut");
  st(go, 1.3, { fx: 0, fs: 1500 }, "sine.inOut");
  path([
    [cScene, FACE],
    [t.aimants - 0.2, { tx: -50, d: 250, az: -55, el: 22 }], // the face held while the rain pours into it
    [t.abimer - 0.5, { tx: -118, ty: -1, tz: -0.5, d: 100, az: -60, el: 14, dof: VIEW.hero.dof }], // down to the hero at the coil
    [cTrain, { tx: -121, d: 88, az: -62, el: 13 }], // a slow creep: the twentieth strikes (t.ton − 0.4)
  ]);
  // « Ton train en compte des milliers. » : a cut a few frames before « Ton » (the old pull-back swung 180 cm in 0.8 s:
  // qa « heurté » at 15.4); the train rushes at us from rest, the eye creeps on, never past the grain
  cut(cTrain, null, TRAIN_LONG);
  path([
    [cTrain, TRAIN_LONG],
    [cExit, { tx: 335, d: 360, az: -86.6, el: 1 }], // the eye stays between coil and yoke (r 11 → 24 cm off the axis)
  ]);

  /* ── 16.90 → 19.54 · « Seule issue… la sortie de secours. » — cut: the ring round point 6, its only branch; dive into it ── */
  // (from the tunnel, a rise to the ring turned the picture 180–220 °/s: a cut, a few frames before « Seule »)
  const RING_EXIT = { tx: PLACES.kick[0], ty: 0, tz: PLACES.kick[2] + 600, d: 7000, az: -136, el: 34, fov: 34, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 };
  cut(cExit, null, RING_EXIT, { mood: 0, spray: 0.35, ...LIGHT.ring });
  st(t.issue + 0.24, 0.3, { litKick: 1, arm: 1 }, "power2.out"); // the click: the kickers light
  st(t.issue + 0.2, t.sortie + 0.3 - (t.issue + 0.2), { route: 1 }, "sine.inOut"); // the way out runs down the line
  st(t.issue + 0.2, 1.0, { ...LIGHT.kick }, "sine.inOut");
  path([
    [cExit, RING_EXIT],
    [t.sortie + 0.2, { ...VIEW.exitLit, az: -148 }],
    [t.toopen, { d: 1350, az: -156, el: 28 }],
  ]);
  punch(t.sortie, 0.05);
  chip("chip-sortie", null, 96, 470, t.sortie - 0.1, t.toopen - 0.2);
}
