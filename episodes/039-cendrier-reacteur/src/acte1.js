// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). PLAN-SÉQUENCE (retouche 06/11, docs/recette-actes.md):
// three D.path moves that never stop, two cuts from place to place only (the chamber → the pool on « Pour », the
// pool → under the vessel on « Plus »); « perce » is seen whole, with no cut on it. The notes below are the story.
//
// THE HOOK. The first frame (POSE0 / FIRST) is taken low over the spreading chamber, looking back at the pit: the
// vessel's red belly, a continuous stream of melt falling from its hole into the pit, the plug a faint veille ring
// on the pit's floor. It moves from frame 1: the stream runs, the camera closes and turns round the hole.
//   « fond »     a punch (choc)
//   « lâche »    the hole opens wider, the belly goes full red: the stream thickens
//   « couler »   the pool in the pit starts to spread
// THE PROMISE, one move. The camera rises and pulls back over the chamber (« une salle vide l'attend »): the empty
// chamber in front, the burning pit behind it — the room waits for the melt; its rim lights on « salle ». It pans to
// the pool beside it (« ni pompe, ni courant, ni toi »: the still water lights), then pushes onto a shut valve
// (« Alors qui va l'ouvrir ? », a punch).
// THE SCENE. A cut back under the vessel, same instant (« Plus de 2 000 degrés »): the belly, the stream, from the
// side; on « perce » the hole opens in full (punch). The camera rises over the pit while the melt fills it and eats
// its concrete (« ronge une fosse de béton »), then dives onto the plug (« Une seule sortie… une porte qui doit
// fondre »: the plug reddens, punch) and holds on it through « Alors… ».
// Hands act 2 VIEW.plugTop and the full pit (pit 0.8, plug 0.35): act 2 cuts in place to the bench.
//
// The belly never rises under the header (its red skin failed the contrast at 5.19 s): every pose keeps it below
// y ≈ 420 — the chamber's wide frame is pushed down (shift −150).
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW, LOOK } from "./world.js";

/* ── the poses (checked with `look`, docs/journal/039-acte1.md) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
// over the empty chamber, the burning pit and its stream behind it: « une salle vide l'attend »
const ROOM = { ...P, tx: 0, ty: -100, tz: 1200, d: 2800, az: -20, el: 20, fov: 40, shift: -110 };
// (retouche) cut on « Pour l'eau »: a shut valve against the pool's wall, the water beside it — « ni pompe… »
const POOL = { ...P, tx: 690, ty: -60, tz: 2300, d: 1300, az: 4, el: 30, fov: 32, shift: 110 };
// back under the vessel, from the side: the belly, its hole, the stream (« Plus de 2 000 degrés », « perce »)
const SIDE = { ...P, tx: 0, ty: 330, tz: 0, d: 900, az: -30, el: 14, fov: 36, shift: 0 };

export default function acte1({ D }) {
  const { tl, st, cut, chip, punch, path } = D;
  const t = D.times({
    choc: "choc", lache: "lache", couler: "couler", promesse: "promesse", salle: "salle", pour: "promesse:pour", toi: "promesse:toi", degres: "degres",
    pompe: "pompe", alors: "promesse:alors", ouvrir: "ouvrir", scene: "scene", perce: "perce", coeur: "scene:cœur",
    ronge: "ronge", sortie: "sortie", porte: "porte", fondre: "fondre", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  // a fire's throb on one number: back-to-back half-swings (never two tweens of it at once), 0.11–0.24 s each,
  // deterministic (no Math.random); it ends on `hi` at t1
  const fr = (x) => x - Math.floor(x);
  function flicker(key, t0, t1, lo, hi, seed) {
    for (let at = t0, i = 0; at < t1 - 0.02; i++) {
      const r = fr(Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453);
      const dur = Math.min(0.11 + 0.13 * r, t1 - at);
      const last = at + dur >= t1 - 0.02;
      const v = last ? hi : i % 2 ? hi - (hi - lo) * 0.25 * r : lo + (hi - lo) * 0.3 * r;
      st(at, dur, { [key]: v }, "sine.inOut");
      at += dur;
    }
  }
  D.captionStyle({ hit: 0.25 });

  /* ── the hook: the stream runs, the camera never stops (plan-séquence, retouche 06/11) ──
     One move from the first frame to the cut on « Pour »: it closes on the hole and rises round it (« fond »,
     « lâche »), follows the stream down (« couler »), then pulls back and up over the empty chamber (« salle »). */
  const swing = t.couler + 0.26; // the swish (sfx couler+0.28): the pull-back takes speed on it
  const pool = t.pour - 0.12;
  path([
    [0, POSE0],
    [t.choc, { d: 1450, az: -26, el: 8, shift: -55 }],
    [t.lache, { ty: 300, tz: 40, d: 1200, az: -33, el: 14, shift: -70 }],
    [t.couler, { ty: 180, d: 1250, az: -38, el: 20, shift: -90 }],
    [swing + 1.0, { tx: 0, ty: -20, tz: 700, d: 2100, az: -30, el: 25, fov: 42, shift: -100 }],
    [t.salle, ROOM],
    [pool, { az: -12, el: 23, d: 2650 }],
  ]);
  punch(t.choc, 0.06);
  // (retouche 06/11, l'image bouge par son sujet) from frame 1: the hole widens, the pool spreads, fumes rise,
  // the belly and the core throb like a fire — bright surfaces that change, not only a camera that moves
  st(0, 0.6, { breach: 0.72 }, "power2.out"); // the stream widens from frame 1
  st(0.6, t.lache - 0.6, { breach: 0.76 }, "sine.inOut");
  st(t.lache, 0.5, { breach: 0.85 }, "power2.out");
  st(0, t.couler + 0.9, { pit: 0.12 }, "sine.in");
  st(0, t.couler, { fume: 0.5 }, "sine.out");
  flicker("belly", 0, t.lache, 0.45, 1.2, 1.7);
  flicker("belly", t.lache, t.scene, 0.45, 1.15, 4.1);
  flicker("belly", t.scene, t.tobench, 0.45, 1.3, 6.3); // under the belly it flares near white at its lowest point
  flicker("core", 0, swing, 0.3, 1, 2.9);
  st(swing, 0.4, { core: 0.7 }, "sine.inOut");

  /* ── the promise: the empty chamber, the pool, a shut valve ── */
  st(swing, t.salle - swing, { fx: 0, fy: -330, fz: 1500, fs: 1500 }, "sine.inOut");
  st(t.salle, 0.4, { litChamber: 0.6 }, "power2.out");
  chip("chip-salle", null, 96, 470, t.salle, t.pour - 0.5); // gone before the cut on « Pour »
  // a cut from place to place (the chamber → the pool), then one move round the shut valve, closing in
  const back = t.scene - 0.12;
  cut(pool, null, POOL, { litChamber: 0, fx: 700, fy: -110, fz: 2300, fs: 900 });
  path([
    [pool, POOL],
    [t.pompe, { d: 1180, az: -3, el: 29 }], // (az grows the other way: the pool's wall hides the valve)
    [t.toi, { tx: 700, ty: -90, d: 1020, az: -10, el: 27, shift: 100 }],
    [t.ouvrir, { d: 880, az: -16, el: 26, shift: 90, dof: LOOK.dof }],
    [back, { d: 800, az: -21 }],
  ]);
  st(pool, t.ouvrir - pool, { fs: 450 }, "sine.inOut");
  st(t.pompe, 0.4, { litPool: 0.6 }, "power2.out");
  st(t.alors - 0.4, 0.6, { litPool: 0 }, "sine.inOut");
  st(t.alors, 0.4, { litValves: 0.6 }, "power2.out");
  punch(t.ouvrir, 0.06);

  /* ── the scene: back under the vessel, the same instant — then ONE move, no cut: under the belly as the hole
     opens (« perce », seen whole), up over the pit as the melt eats it (« ronge »), down onto the plug (« fondre ») ── */
  // (retouche 06/11) the move under the belly turns one way only, faster (az −4 → −35 at plugTop): the vessel's
  // bright meridians sweep across the frame — 12–14 s was a slow stretch
  const SIDE0 = { ...SIDE, az: -4 };
  cut(back, null, SIDE0, { litValves: 0, litChamber: 0, litPool: 0, fx: 0, fy: 300, fz: 0, fs: 600 });
  path([
    [back, SIDE0],
    [t.degres, { d: 820, az: -13, el: 13 }],
    [t.perce, { d: 720, az: -21, el: 12 }], // low: the belly and its hole seen from under
    [t.ronge, { ty: 200, d: 1100, az: -25, el: 28, fov: 38, shift: 20 }],
    [t.ronge + 1.2, { ty: 80, d: 1600, az: -28, el: 44, shift: 40 }],
    [t.sortie, { ty: 40, d: 1300, az: -32, el: 54, fov: 36, shift: 60 }],
    [t.fondre, { ty: 10, d: 850, az: -34, el: 62, fov: 34, shift: 80, dof: LOOK.dof }],
    [t.tobench, VIEW.plugTop], // act 2 cuts in place from it
  ]);
  st(back, t.perce - back, { pit: 0.3 }, "sine.inOut");
  st(t.perce - 0.04, 0.45, { breach: 1 }, "power2.out");
  punch(t.perce, 0.06);
  st(t.perce + 0.3, 1.5, { fy: 60, fs: 700 }, "sine.inOut");
  st(t.ronge, t.sortie - t.ronge, { pit: 0.8, eaten: 0.6, fume: 0.6 }, "sine.inOut");
  st(t.sortie - 0.5, 1.2, { fy: 0, fs: 300 }, "sine.inOut");
  st(t.sortie, 0.6, { litPlug: 0.8 }, "power2.out");
  st(t.fondre - 0.05, 0.6, { plug: 0.35 }, "power2.out");
  punch(t.fondre, 0.06);
  // « Alors… » : the plunge goes on settling onto the plug, slow — the suck in the sound
}
