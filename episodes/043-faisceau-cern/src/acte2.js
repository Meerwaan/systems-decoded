// DOSSIER 043 — 02 AUTOPSIE : « Alors… on l'ouvre », the exploded view, the principle, the kickers at rest
// (toopen → tozero). docs/043-actes.md § acte2.js, docs/043-actes-maj.md.
//
// PLAN-SÉQUENCE, four moves and four cuts; az always decreasing inside a move.
//   19.54 → 24.44  cut on `dive` while act 1 still dives: time stops (the train creeps, a wagon's hole drifts through the
//                  row), the kickers in frame; on « on » the system comes apart (kickers, then septa, then dilution magnets
//                  lift, the vessel slides off the core); 22.38 cut along the same axis to the arc that leaves point 6,
//                  where the 3 600 loss monitors (distinct dots) light in a wave running up the arc.
//   24.44 → 34.16  cut on the kickers, lifted, lit one by one; on « poussent hors de l'anneau » the way out (route, a head
//                  of veille light) leaves them through the septa, and the camera FOLLOWS IT down the 700 m of line to the
//                  block (« le bloc », its vessel slid off, the bare core); then it dives onto the face (« Pourquoi il
//                  tient ? »), the rest goes out, and the principle's ghost: one signal point, the plate cracks.
//   34.16 → 35.84  cut on the ten dilution magnets: they light in turn, the dot sweeps each gap (« le font tourner »).
//   35.84 → 40.47  cut on the face: the « e » is drawn (1.2 m of trace inside the disc), orange; the camera backs off to the
//                  whole face (« étalée »).
//   40.47 → 48.24  cut on the kickers at rest (assembled), seen down the pipe from upstream: the train a bar of light,
//                  its end runs into the row on « trou », the pipe stays dark, the kickers breathe veille while the hole is
//                  in them, the train's head reaches their centre on « que là »; « Ailleurs… » : the ghost, fired in
//                  mid-train, the bunches swept against the wall (signal). act 3 cuts at `tozero`.
import * as THREE from "three";
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, LIGHT, BEAM, S6, PLACES } from "./world.js";
import { lineAt } from "./plan.js";

const K = PLACES.kick, FACE = PLACES.face;
const P = { fov: 34, side: 0, roll: 0, drift: 0.3, dof: 0, shift: 0 };
const CLOSE = { dof: VIEW.faceClose.dof };
const at = (p, o = {}) => ({ tx: p[0], ty: p[1], tz: p[2], ...o });
const v3 = (p, dy = 0) => new THREE.Vector3(p[0], p[1] + dy, p[2]);
/** The gap value that puts the centre of the wagon hole k (from the train's head) at arc s (cm past the grain). */
const holeAt = (s, k = 4) => s - S6 + BEAM.gap / 2 + (k * (BEAM.perWagon + BEAM.between) + BEAM.perWagon + BEAM.between / 2) * BEAM.slot;

export default function acte2({ D, world, co }) {
  const { tl, st, now, cut, path, punch, chip } = D;
  const A = world.exit.A;
  const t = D.times({
    toopen: "toopen", on: "explode", ouvreEnd: "ouvre$",
    capteurs: "eclate:capteurs", guettent: "eclate:guettent", moindre: "eclate:moindre", perte: "eclate:perte", aimants: "eclate:aimants", poussent: "eclate:poussent",
    anneau: "eclate:l'anneau", metres: "eclate:mètres", ligne: "eclate:ligne", et: "eclate:Et", bout: "eclate:bout",
    bloc: "eclate:bloc", eclateEnd: "eclate$",
    principe: "principe", tient: "principe:tient", sur: "principe:Sur", point: "principe:point",
    robuste: "principe:robuste", lacherait: "principe:lâcherait", alors: "principe:Alors", dix: "principe:aimants",
    tourner: "principe:tourner", dessine: "principe:dessine", trait: "principe:trait", vingt: "principe:vingt",
    meme: "principe:Même", etalee: "principe:étalée", principeEnd: "principe$",
    torepos: "torepos", trou: "repos:trou", proton: "repos:proton", les: "repos:Les", la: "repos:là",
    ailleurs: "repos:Ailleurs", balaieraient: "repos:balaieraient", parois: "repos:parois", tozero: "tozero",
  });
  setAct(tl, 2, t.toopen);

  /* ═════════ « Alors… on l'ouvre. » — point 6, time stopped; it comes apart ON « on » ═════════ */
  // the train creeps (50 cm/s: time stopped, not frozen): wagon hole 4 drifts through the kicker row
  const g0 = holeAt(S6) - 180;
  const tS = t.capteurs - 0.1; // 22.38, three frames before « capteurs »: the cut to the arc
  cut(t.toopen, SET.RING, VIEW.dive, { ...STAGED, gap: g0, ...LIGHT.kick, mood: 0 });
  st(t.toopen, t.principe - t.toopen, { gap: g0 + 50 * (t.principe - t.toopen) }, "none");
  st(t.on - 0.04, 1.3, { explode: 1 }, "sine.out"); // still ON « on », without the jolt of power2.out (qa 20.5 s)
  path([
    [t.toopen, VIEW.dive], //                                                                   −150, the row, close
    [t.on, { tz: K[2] + 60, ty: 6, d: 540, az: -155, el: 14 }], //                               −155, the kickers lift
    [tS, { tz: K[2] + 220, ty: 24, d: 1000, az: -159, el: 20, fov: 36 }], //                     the row and the septa, apart
  ]);
  // « 3 600 capteurs guettent la moindre perte » : a CUT along the same axis (the ×27 pull-back in 1.5 s turned 206 °/s)
  // to the arc that leaves point 6 (low, left of centre) toward G, seen from above: the monitors a line of distinct
  // veille dots; the wave runs from point 6 up the arc and its crest leaves the frame's top just before the next cut
  const ARC0 = { ...P, tx: 4280, ty: 0, tz: -3110, d: 8000, az: -180, el: 40, shift: 220 };
  // the train out, the line's X-ray glass dimmed (seen end-on it stacked into a white column up to the HUD)
  cut(tS, SET.RING, ARC0, { beam: 0, sensors: 0.3, shell: 0.25, cavern: 0, ...LIGHT.ring });
  st(t.guettent - 0.1, t.perte + 0.3 - t.guettent + 0.1, { sensors: 0.46 }, "sine.inOut"); // front ≈ 3 360 cm: the arc in frame
  path([
    [tS, ARC0], //                                                                               −180
    [t.aimants - 0.44, { d: 8800, az: -186, el: 42 }], //                                        −186, a breath back
  ]);
  part({ title: "Capteurs de pertes", x: 600, y: 800, align: "start", anchor: v3([4229, 0, -2961]) }, t.guettent, t.aimants - 0.72);

  /* ═════════ « Quinze aimants le poussent hors de l'anneau. 700 mètres de ligne. Et au bout… le bloc. » ═════════ */
  // the kickers, lifted; the way out leaves them and the camera follows its head down the line to the block
  const tK = t.aimants - 0.44; // 24.44, three frames before « Quinze »
  cut(tK, SET.RING, { ...P, ...at(K, { ty: 46, tz: K[2] + 20 }), d: 700, az: -128, el: 18 }, { sensors: 0.3, beam: 1, shell: 1, cavern: 1, ...LIGHT.kick });
  st(tK + 0.06, 0.35, { litKick: 1 }, "power2.out");
  st(tK + 0.1, 1.2, { arm: 1 }, "sine.inOut"); // the breath runs down the row: lit one by one
  st(t.poussent - 0.05, t.anneau + 0.3 - t.poussent, { route: 960 / 2960 }, "sine.in"); // out through the septa
  st(t.anneau + 0.25, t.bloc - t.anneau - 0.25, { route: 1 }, "sine.inOut"); //            down the line, into the face
  st(t.anneau, 0.4, { litSepta: 0.5 }, "sine.out");
  st(t.metres - 0.3, 0.4, { litLine: 1, litKick: 0.25, arm: 0.3 }, "sine.inOut");
  st(t.anneau, 1.4, { ...LIGHT.line }, "sine.inOut");
  st(t.et, 1.0, { ...LIGHT.block }, "sine.inOut");
  st(t.bloc - 0.2, 0.35, { litBlock: 1 }, "power2.out");
  part({ title: "Aimants d'éjection", x: 560, y: 520, align: "end", anchor: v3(A.kick, 46) }, t.aimants, t.metres - 0.4);
  part({ title: "Ligne d'extraction", x: 600, y: 540, align: "end", anchor: v3(lineAt(1900)) }, t.metres - 0.3, t.et - 0.1);
  chip("chip-bloc", null, 96, 470, t.bloc - 0.04, t.principe + 0.3);
  punch(t.bloc, 0.06);

  /* ═════════ « Pourquoi il tient ? Sur un seul point, même le matériau le plus robuste lâcherait. » ═════════ */
  // the dive onto the face; the rest goes out; the ghost (signal): the whole beam on ONE point, the plate cracks
  st(t.principe - 0.1, 0.6, { shell: 0.12, cavern: 0.2, ring: 0.3, beam: 0, litLine: 0, litSepta: 0, litKick: 0, sensors: 0, litBlock: 0, pool: 0.35 }, "sine.inOut");
  now(t.tient + 0.24, { route: 0 }); // on the hit: the way out has been seen
  st(t.sur - 0.14, 0.25, { mood: 1 }, "sine.inOut");
  st(t.sur + 0.1, t.point + 0.08 - t.sur - 0.1, { point: 0.7 }, "power2.out");
  st(t.point + 0.2, t.lacherait - t.point - 0.2, { point: 1 }, "sine.in"); // the spot grows hot
  st(t.lacherait - 0.02, 0.4, { crack: 1 }, "power2.out");
  punch(t.lacherait, 0.06);
  path([
    [tK, { ...P, ...at(K, { ty: 46, tz: K[2] + 20 }), d: 700, az: -128, el: 18 }], //           −128, the row, lifted
    [t.poussent, { ty: 24, tz: K[2] + 160, d: 760, az: -134, el: 23 }], //                     −134, the head leaves
    [t.metres, { ...at(lineAt(1300)), d: 1500, az: -139, el: 14, fov: 36 }], //                −139, down the line
    [t.et + 0.1, { ...at(lineAt(2450)), d: 1500, az: -143, el: 11 }], //                       −143, toward the end
    [t.bloc, { ...at(lineAt(3050), { ty: 10 }), d: 1100, az: -146, el: 20, fov: 34 }], //      −146, the bare core leaves its vessel
    [t.tient + 0.1, { ...at(FACE, { tz: FACE[2] + 12 }), d: 300, az: -149, el: 10, fov: 32, ...CLOSE }], // the whole face
    [t.point, { d: 275, az: -153, el: 14 }], //                                                 one point
    [t.lacherait, { d: 255, az: -157, el: 11 }], //                                             it cracks
    [t.alors - 0.12, { d: 248, az: -159, el: 12 }],
  ]);

  /* ═════════ « Alors dix aimants le font tourner : » — the ten dilution magnets, lifted, light in turn ═════════ */
  const tDil = t.alors - 0.12; // 34.16
  const DIL0 = { ...P, ...at(A.dilution, { ty: 50 }), d: 520, az: -140, el: 12 };
  cut(tDil, SET.RING, DIL0, { point: 0, crack: 0, mood: 0, ...LIGHT.line });
  st(t.dix - 0.2, t.tourner - t.dix + 0.3, { dil: 1 }, "sine.inOut");
  st(t.dix - 0.2, 0.3, { litDil: 1 }, "power2.out");
  part({ title: "Aimants de dilution", x: 560, y: 520, align: "end", anchor: v3(A.dilution, 56) }, t.dix - 0.1, t.tourner + 0.12);
  const tFace = t.dessine - 0.28; // 35.84, three frames before « il dessine »
  path([
    [tDil, DIL0], //                                                                            −140
    [t.dix, { az: -145, el: 16, d: 540 }], //                                                    −145
    [tFace, { az: -151, el: 12, d: 500 }], //                                                    −151
  ]);

  /* ═════════ « il dessine un « e » : un trait d'un mètre vingt. Même énergie… étalée. » ═════════ */
  const FACE0 = { ...P, ...at(FACE, { tz: FACE[2] + 12 }), d: 235, az: -140, el: 12, fov: 32, ...CLOSE };
  cut(tFace, SET.RING, FACE0, { litDil: 0, heat: 0.3, ...LIGHT.block });
  st(t.dessine - 0.12, t.vingt + 0.3 - t.dessine + 0.12, { paint: 1, heat: 0.6 }, "sine.inOut");
  st(t.meme, t.etalee + 0.3 - t.meme, { heat: 0.45 }, "sine.inOut");
  punch(t.vingt, 0.06);
  path([
    [tFace, FACE0], //                                                                           −140, the face
    [t.trait, { d: 220, az: -146, el: 9 }], //                                                   −146, the bar, the loop
    [t.vingt + 0.3, { d: 228, az: -151, el: 13 }], //                                            −151, the whole « e »
    [t.etalee + 0.2, { ...at(FACE, { tz: FACE[2] + 60 }), d: 430, az: -156, el: 18, dof: 0 }], // the face and the core
    [t.torepos, { d: 450, az: -157, el: 19 }],
  ]);

  /* ═════════ « Dans le train, un trou : trois microsecondes sans aucun proton. Les aimants ne s'allument que là. » ═════════ */
  // at rest, assembled: the train runs calm (320 cm/s, ease none). The camera looks DOWN the pipe from upstream, a bit
  // above: the bare pipe low left, the whole row rising toward the centre; seen along the pipe the bunches merge into a
  // bar of light. The bar's end (the hole's front) runs into the row on « trou »; the pipe stays dark while the row
  // breathes veille; the train's head (the hole's tail) comes back from the bottom after « proton » and reaches the
  // kickers' centre (+BEAM.gap/2, where act 3 fires) on « que là »
  const v = 340, tHead = t.la - 0.06; // 45.10
  const gR = BEAM.gap / 2 - v * (tHead - t.torepos); // on « trou » the bar's end 1 m before the row (−331), the hole behind it
  const GAP0 = { ...P, ...at(K, { tz: K[2] - 100 }), d: 900, az: -162, el: 17, shift: 60 };
  cut(t.torepos, SET.RING, GAP0, { ...STAGED, gap: gR, ...LIGHT.kick, mood: 0 });
  st(t.torepos, t.tozero - t.torepos, { gap: gR + v * (t.tozero - t.torepos) }, "none");
  st(t.trou + 0.2, 0.4, { arm: 1, litKick: 0.6 }, "sine.out"); // the hole is in them: veille while it passes (click trou+0.28)
  st(t.la + 0.18, 0.35, { arm: 0.3, litKick: 0 }, "sine.inOut"); // the train is back (click là+0.20)
  /* « Ailleurs… ils balaieraient ce train contre les parois. » — the ghost: fired in mid-train (signal) */
  st(t.ailleurs - 0.1, 0.25, { mood: 1 }, "sine.inOut");
  st(t.balaieraient - 0.24, t.parois + 0.3 - t.balaieraient + 0.24, { sweep: 1 }, "sine.inOut");
  st(t.balaieraient - 0.18, 0.45, { kick: 1 }, "power2.out");
  punch(t.parois, 0.06);
  path([
    [t.torepos, GAP0], //                                                                        −162, the bar into the row
    [t.trou, { az: -165, el: 18, d: 870 }], //                                                   −165, the bar's end runs in
    [t.proton, { az: -169, d: 820 }], //                                                         −169, nothing in the pipe
    [t.la, { az: -172, el: 19, d: 800 }], //                                                     −172, the head at the centre
    [t.balaieraient, { tz: K[2], az: -174.5, el: 21, d: 850, shift: 110 }], //                   −174.5, the ghost: past the row
    [t.tozero, { tz: K[2] + 30, az: -176.5, el: 23, d: 900, shift: 140 }], //                      the train swept, red
  ]);

  /** A callout of the exploded view (veille), shown on its word, gone before the next. */
  function part(opt, from, to) {
    const c = co.add({ ...opt, tone: "system" });
    c.show(tl, from);
    c.hide(tl, to);
  }
}
