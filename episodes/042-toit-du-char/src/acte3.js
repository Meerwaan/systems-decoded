// DOSSIER 042 — the doors at rest (02 AUTOPSIE), then 03 RÉPONSE: torest → toverdict.
// Three moves, one per place, the camera never stops (D.path, az always DECREASING, `to: "go"`):
//   1 · torest → tozero   inside the turret's glass, the bulkhead and its two doors in three quarters: at rest, the seals
//                         that hold, then « sans verrou » the push bows the loader's door toward him, it springs back,
//                         the seal opens (signal).
//   2 · tozero → towide   ONE travel down the chain, no cut on it: the caisson in section, the powder, the push under
//                         the roof; the panel LETS GO in the frame, whole (jolt); then the camera follows the piece that
//                         moves — the panel's tab, down the rod, to the egg-shaped cam — and the cam PRESSES the two
//                         leaves in the same frame (jolt). « Verrouillées »: mood back to veille.
//   3 · towide → toverdict the whole tank, low, the column out of its roof, the four green under it.
// THE CHAIN IS ONE PIECE (docs/042-actes-maj.md, caisson journal): while `lock` runs 0 → 0.9 the panel rises with the
// rod, blow = 0.05 + 0.028 · lock / 0.9 (the same tween, the same ease: the line holds at every frame); the pin shears
// at lock 1 and only then is the panel free to fly (it leaves the top of the frame, and is gone in the wide shot).
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, LIGHT } from "./world.js";

/** The panel's height tied to the lock (the rod is 10 cm, the panel rises 10 cm with it). */
const BLOW = (lock) => 0.05 + (0.028 * Math.min(lock, 0.9)) / 0.9;

/* ── the poses (complete for the cuts; the path keys only say what changes) ── */
// at rest: the bulkhead from the turret's glass flank, its two doors, the loader at the left edge
const REST0 = { ...VIEW.rest, tz: 10, d: 640, az: -16, shift: 0 };
// the powder: the caisson in section, inside the turret
const ZERO0 = { ...VIEW.zero, az: 2, shift: 0 };
// the column: the whole tank at ground level, the echo of the first frame
const WIDE0 = { ...VIEW.columnWide, az: -18 };
const WIDE1 = { ...VIEW.columnWide, az: -30 }; // fin.js cuts on this very pose (invisible)

export default function acte3({ D }) {
  const { tl, st, path, cut, punch, jolt } = D;
  const t = D.times({
    torest: "torest", repos: "repos:repos", joints: "repos:joints", sans: "repos:sans", poussee: "repos:poussée",
    bombe: "repos:bombe", rebond: "repos:rebondissent", joint: "repos:s'ouvre",
    tozero: "tozero", zflambe: "zero:flambe", pression: "zero:pression", cogne: "zero:cogne", panneau: "zero:panneau",
    lache: "zero:lâche", envole: "reponse:s'envole", tringle: "reponse:tringle", tourne: "reponse:tourne",
    trigger: "trigger", verrou: "reponse:verrouillées", towide: "towide", colonne: "reponse:colonne", toverdict: "toverdict",
  });

  /* ═══ 1 · « Au repos, portes fermées. Leurs joints retiennent flammes et gaz. Mais sans verrou, la poussée bombe les
         portes vers toi. Puis elles rebondissent… et le joint s'ouvre. » ═══ */
  cut(t.torest, SET.TANK, REST0, { ...STAGED, mood: 0, ...LIGHT.tank });
  st(t.joints - 0.1, 0.5, { seal: 1, burn: 0.2 }, "power2.out"); // the green runs round both openings; a glow behind
  st(t.poussee - 0.15, 0.45, { arrowDoor: 1, burn: 0.4 }, "power2.out"); // the push, at the loader's door
  st(t.bombe - 0.2, 0.6, { bow: 1 }, "power2.out"); // the leaf bows toward him
  st(t.bombe + 0.05, 0.35, { arrowDoor: 0 }, "sine.inOut"); // the arrow goes: the bow is the picture
  st(t.rebond, 0.45, { bow: -0.4 }, "sine.inOut"); // it springs back…
  st(t.rebond + 0.45, 0.5, { bow: 0.15 }, "sine.inOut");
  st(t.rebond + 0.95, 0.5, { bow: 0 }, "sine.inOut");
  st(t.joint - 0.04, 0.3, { leak: 1, mood: 1 }, "power2.out"); // …and the seal opens: signal (« Ta porte : Joint ouvert »)
  punch(t.joint, 0.06, { hold: 0.12, down: 0.3 });
  path([
    [t.torest, REST0],
    // retouche 08/11: pushing in from the cut — at 38 s the two doors fill ≈ 60 % of the width, the loader out at the
    // left (at d 620 he was cut by the edge, the doors 35 %)
    [t.repos + 0.9, { az: -22, d: 540, el: 9 }], //                             « portes fermées »
    [t.joints, { az: -28, d: 470, el: 8 }], //                                  the seals
    [t.sans, { az: -32, tx: -72, tz: 26, d: 420, el: 6 }], //                   « sans verrou »: toward his door
    [t.bombe, { ...VIEW.doorClose, az: -36 }], //                                             the leaf bows toward him
    // retouche 08/11: −36 → −42 in 3 s sat under 4 °/s (42,5–43,6): it keeps gliding, the same way
    [t.joint, { az: -44, d: 325 }], //                                          the seal opens
    [t.tozero, { az: -46, d: 320 }],
  ]);

  /* ═══ 2 · « La poudre flambe. La pression cogne sous le toit. Et le panneau… lâche. Il s'envole. En partant, il tire
         une tringle. La came tourne. Elle plaque les portes contre leur cadre. Verrouillées. » ═══ */
  setAct(tl, 3, t.tozero);
  cut(t.tozero, SET.TANK, ZERO0, { ...STAGED, ...LIGHT.caisson });
  st(t.zflambe - 0.15, 0.6, { burn: 0.7 }, "power2.out"); // the powder
  st(t.pression, t.cogne - t.pression, { press: 1 }, "power1.in"); // the six arrows, face by face
  st(t.cogne - 0.12, 0.25, { arrowRoof: 1, bulge: 0.5 }, "power3.out"); // it knocks under the panel
  st(t.cogne + 0.2, 0.6, { bulge: 0.2 }, "sine.inOut");
  // « lâche »: cracked free in its frame, whole in the picture; the light slit all round, flames lick
  st(t.lache - 0.02, 0.3, { blow: 0.05, bulge: 0, column: 0.15 }, "power2.out");
  jolt(t.lache + 0.02, 0.9);
  punch(t.lache, 0.06);
  st(t.lache + 0.25, t.envole + 0.2 - t.lache - 0.25, { vent: 1 }, "sine.inOut"); // the arrows swing up, out by the slit
  st(t.envole + 0.3, 0.6, { press: 0, vent: 0, arrowRoof: 0 }, "sine.in"); // …and are gone before the rod
  // « Il s'envole. En partant, il tire une tringle. La came tourne. » — one motion: panel, rod and cam together
  const L0 = t.envole - 0.05;
  const L1 = t.trigger - 0.2;
  st(L0, L1 - L0, { lock: 0.9, blow: BLOW(0.9) }, "none");
  // the flames that licked round it die back while the camera comes down to the rod: seen low and along the opening,
  // even a low column is a white-salmon haze over the whole top of the frame; the slit of light under the panel
  // (the caisson's own fire) says enough
  // retouche 08/11 — « Il s'envole »: the lift is held by the rod (≤ 10 cm), so the kick is told by the panel's
  // frame shuddering and the flames bursting out round its edge (a jet, 0.32), gone before the camera is low
  st(t.envole - 0.05, 0.35, { column: 0.32 }, "power2.out");
  jolt(t.envole + 0.02, 0.6);
  st(t.envole + 0.4, 0.55, { column: 0 }, "sine.inOut");
  st(t.envole, 1.6, { ...LIGHT.lock }, "sine.inOut");
  // « Elle plaque les portes contre leur cadre » — the push arrives at the doors as the cam presses them home
  st(t.trigger - 0.02, 0.2, { lock: 1, seal: 1 }, "power3.out");
  jolt(t.trigger + 0.01, 0.9);
  // the pin has sheared: now the panel flies (it leaves the top of the frame) and the column grows
  st(t.trigger + 0.12, t.towide - t.trigger - 0.12, { blow: 0.9 }, "power2.in");
  st(t.trigger + 0.3, 1.8, { column: 0.5 }, "sine.inOut");
  st(t.verrou - 0.04, 0.3, { mood: 0 }, "sine.inOut"); // the system has won: veille
  punch(t.verrou, 0.06, { hold: 0.12, down: 0.3 });
  path([
    [t.tozero, ZERO0],
    [t.zflambe, VIEW.zero], //                                                  the powder (az −8)
    [t.cogne, { az: -18, el: 18, ty: 14, d: 760 }], //                          the knock under the roof
    [t.lache, { az: -28, el: 20, tx: -6, ty: 20, d: 840 }], //                  the panel lets go, whole
    [t.envole + 0.5, { az: -33, el: 12, tx: -44, ty: 22, tz: 0, d: 600 }], //   down toward its tab
    [t.tringle, { ...VIEW.mech, tx: -80, ty: 10, tz: 2, d: 360, az: -37, el: 4 }], // the rod rising
    [t.tourne + 0.4, { tx: -78, ty: 2, tz: 6, d: 320, az: -40, el: 3 }], //      the cam turning
    [t.trigger + 0.6, { az: -43, d: 330 }], //                                  it presses both leaves home
    [t.towide, { az: -46, d: 350 }], //                                       the loader stays out of the frame (az > −48)
  ]);

  /* ═══ 3 · « Le feu monte en colonne… au-dessus de vous. » ═══ */
  cut(t.towide, SET.TANK, WIDE0, { ...STAGED, burn: 0.7, blow: 0.9, lock: 1, seal: 1, column: 0.5, mood: 0, ...LIGHT.column });
  st(t.towide + 0.05, t.colonne + 0.8 - t.towide, { column: 1 }, "sine.out");
  path([
    [t.towide, WIDE0],
    [t.colonne, VIEW.columnWide], // az −24
    [t.toverdict, WIDE1],
  ]);
}
