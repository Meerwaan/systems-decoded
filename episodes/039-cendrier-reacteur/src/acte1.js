// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). One cut in the act (back under the vessel).
//
// THE HOOK. The first frame (POSE0 / FIRST) is taken low over the spreading chamber, looking back at the pit: the
// vessel's red belly, a continuous stream of melt falling from its hole into the pit, the plug a faint veille ring
// on the pit's floor. It moves from frame 1: the stream runs, the camera pushes in (glide).
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
import { glide } from "@kit/direct.js";
import { POSE0, VIEW, LOOK } from "./world.js";

/* ── the poses (checked with `look`, docs/journal/039-acte1.md) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
// the hook pushes in a little, the picture pushed down so that the belly stays under the header
// (retouche : d 1250 and glide(2.6, 1) — the push keeps moving up to the swish; 1.5 → 3.9 s was still)
const PUSH = { ...POSE0, d: 1250, el: 4, shift: -70 };
// over the empty chamber, the burning pit and its stream behind it: « une salle vide l'attend »
const ROOM = { ...P, tx: 0, ty: -100, tz: 1200, d: 2800, az: -20, el: 20, fov: 40, shift: -110 };
// (retouche) cut on « Pour l'eau »: a shut valve against the pool's wall, the water beside it — « ni pompe… »
const POOL = { ...P, tx: 690, ty: -60, tz: 2300, d: 1300, az: 4, el: 30, fov: 32, shift: 110 };
// the same axis, pushed in on the valve: « qui va l'ouvrir ? »
const VALVE = { ...POOL, d: 850, el: 28, shift: 90, dof: LOOK.dof };
// back under the vessel, from the side: the belly, its hole, the stream (« Plus de 2 000 degrés », « perce »)
const SIDE = { ...P, tx: 0, ty: 330, tz: 0, d: 900, az: -30, el: 14, fov: 36, shift: 0 };
// over the pit: the melt filling it, its concrete wall round it (« ronge une fosse de béton »)
const PIT = { ...P, tx: 0, ty: 60, tz: 0, d: 1700, az: -32, el: 45, fov: 38, shift: 40 };

export default function acte1({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    choc: "choc", lache: "lache", couler: "couler", promesse: "promesse", salle: "salle", pour: "promesse:pour",
    pompe: "pompe", alors: "promesse:alors", ouvrir: "ouvrir", scene: "scene", perce: "perce", coeur: "scene:cœur",
    ronge: "ronge", sortie: "sortie", porte: "porte", fondre: "fondre", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ── the hook: the stream runs, the camera pushes in ── */
  const swing = t.couler + 0.26; // the swish (sfx couler+0.28): the camera leaves on it
  shot(0, swing, PUSH, glide(2.6, 1));
  punch(t.choc, 0.06);
  st(t.lache, 0.5, { breach: 0.8, belly: 1 }, "power2.out");
  st(t.couler, 0.9, { pit: 0.1 }, "power2.out");

  /* ── the promise: the empty chamber, the pool, a shut valve ── */
  shot(swing, t.salle - swing, ROOM, "sine.inOut", PUSH.d);
  st(swing, t.salle - swing, { fx: 0, fy: -330, fz: 1500, fs: 1500 }, "sine.inOut");
  st(t.salle, 0.4, { litChamber: 0.6 }, "power2.out");
  chip("chip-salle", null, 96, 470, t.salle, t.pour - 0.5); // (retouche) gone before the cut on « Pour »
  // (retouche) a cut, not the 1.9 s pan (heurté at 7.8 s, the valve lost in a pale slab at 9.0 s)
  const pool = t.pour - 0.12;
  cut(pool, null, POOL, { litChamber: 0, fx: 700, fy: -110, fz: 2300, fs: 900 });
  shot(pool, t.ouvrir - pool, VALVE, "sine.inOut", POOL.d);
  st(pool, t.ouvrir - pool, { fs: 450 }, "sine.inOut");
  st(t.pompe, 0.4, { litPool: 0.6 }, "power2.out");
  st(t.alors - 0.4, 0.6, { litPool: 0 }, "sine.inOut");
  st(t.alors, 0.4, { litValves: 0.6 }, "power2.out");
  punch(t.ouvrir, 0.06);

  /* ── the scene: back under the vessel, the same instant ── */
  const back = t.scene - 0.12;
  cut(back, null, SIDE, { litValves: 0, litChamber: 0, litPool: 0, fx: 0, fy: 300, fz: 0, fs: 600 });
  // (retouche) the push goes on to the cut and turns a little: 12–14.5 s was still
  const pit = t.ronge - 0.7; // on « Le cœur fondu », a few frames ahead of it
  shot(back, pit - back, { ...SIDE, d: 680, az: -24 }, "sine.inOut", SIDE.d);
  st(back, t.perce - back, { pit: 0.3 }, "sine.inOut");
  st(t.perce - 0.04, 0.45, { breach: 1 }, "power2.out");
  punch(t.perce, 0.06);
  // (retouche) cuts, not the rise (heurté at 16.1 s) nor the plunge (heurté at 18.0 s): slow pushes between them
  cut(pit, null, { ...PIT, d: 1950 }, { fy: 60, fs: 700 });
  shot(pit, t.sortie - 0.12 - pit, PIT, "sine.inOut", 1950);
  st(t.ronge, t.sortie - t.ronge, { pit: 0.8, eaten: 0.6, fume: 0.6 }, "sine.inOut");
  const plug = t.sortie - 0.12;
  cut(plug, null, { ...VIEW.plugTop, d: 800 }, { fy: 0, fs: 300 });
  shot(plug, t.tobench - 0.4 - plug, VIEW.plugTop, "sine.inOut", 800);
  st(t.sortie, 0.6, { litPlug: 0.8 }, "power2.out");
  st(t.fondre - 0.05, 0.6, { plug: 0.35 }, "power2.out");
  punch(t.fondre, 0.06);
  // « Alors… » : the plunge holds (its drift breathes), nothing else moves — the suck in the sound
}
