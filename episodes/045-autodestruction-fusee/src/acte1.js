// 01 · MENACE — 0 → tobench (18,24). Starts on POSE0 and FIRST, without a cut; the scene's cut `toscene` (9,58, in the
// breath after « déclenchée ? »), and since the retouche of 08/11 two more: in the axis onto the charge line before
// « Une fusée » (4,81), onto the hull before « Il reste » (16,86). Every move a D.path, az DECREASING (docs/045-actes-maj.md):
//
// THE HOOK, one move from the sky into the bay (az −46 → −64):
//   « Ta fusée bascule et se déchire. »   POSE0, Ariane 5 crossways ≈ 70 % of the width. From frame 1 the SUBJECT moves:
//                                         it keeps veering (incid 30 → 34) and its boosters peel off the core (tear 0.25
//                                         → 0.42), both in power2.out — fastest on the first frames; fire at the junctions.
//                                         The camera closes in and drops under it. Punch « déchire ».
//   « …toute seule… comme prévu. »        the camera keeps sinking under it and pulls back to the whole rocket; on « prévu »
//                                         the veille light runs down every charge line (charge 0.25 → 1). Punch « prévu ».
//   « Une fusée emporte sa propre charge » the dive: along the core's veille line toward the bay (by ratio), its insides
//                                         turning solid (inside), the chip « Sa charge ». Punch « charge ».
//   « Mais ce jour-là… qui l'a déclenchée ? »  through the glass the bay and the chain; on « déclenchée » the detonator,
//                                         lit veille (litDet), ≈ 25 % of the width, the lens closing (dof); it glides on to
//                                         the cut, slower and slower.
// THE SCENE, one move from the ground back up to the hull (az −36 → −60):
//   cut `toscene`                          VIEW.wide: from the ground, the rocket tearing high up, the pad small below. The
//                                         RACCORD: the rocket lands where the detonator was (the same lit veille point).
//   « Quatre kilomètres au-dessus du sol. » the move glides and rises a notch: the height reads by the perspective
//   « À un kilomètre du pas de tir. »     the pad and its masts, the rocket almost overhead; chip « Pas de tir »
//   « Ses morceaux vont pleuvoir… »       the footprint grows on the ground under it (fall), a few pieces part (debris 0.04)
//   « …que dans son couloir. »            from higher: on « couloir » the band lights from the pad eastward; chip, punch
//   « Il reste sa charge. »               the camera climbs back to the rocket and tightens on the hull: its veille line
//                                         (VIEW.hull, re-aimed at the rocket as it veered); chip « Sa charge »; short punch
//                                         on « reste ». It reaches VIEW.hull AT the cut `tobench`, still moving.
//
// Handed to act 2 at 18,24: the scene, STAGED + tear 0.45, incid 34, charge 1, corridor 1, fall 1, debris 0.04, LIGHT.sky;
// the camera on HULL (= VIEW.hull aimed at the rocket's middle at incid 34). Nothing tweens past 18,24.
// No sound here: the 57 of episode.json are already laid in the breaths.
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW, STAGED, SET, LIGHT, LOOK, CENTER, SEAT, SYS, onRocket, ringPoint, sysToRocket } from "./world.js";

/* ── the veer of the hook: FIRST's 30° → 34°, fastest on the first frames (power2.out = 1 − (1 − u)³) ── */
const INC0 = 30;
const INC1 = 34;
const VEER = 3.0; // s
const incAt = (time) => INC0 + (INC1 - INC0) * (1 - (1 - Math.min(1, time / VEER)) ** 3);
/* ── where the poses aim, on the rocket as it is at that instant (it turns about its base: 3° moves the bay 1,7 m) ── */
const aim = ([x, y, z]) => ({ tx: x, ty: y, tz: z });
const mid = (inc) => aim(onRocket(1, inc, [0, CENTER, 0])); //                          the rocket's middle
const line = (inc, y) => aim(onRocket(1, inc, ringPoint(SEAT.az, SEAT.r, y))); //      a point of the core's charge line
const detAt = (inc) => aim(onRocket(1, inc, sysToRocket([SYS.det.at[0], 4, 0]))); //   the detonator in the bay
const DET = detAt(INC1);
/** The hull at the end of the act: VIEW.hull, aimed at the rocket as it veered (act 2's raccord reads this frame). */
const HULL = { ...VIEW.hull, ...mid(INC1) };
/** The scene from the ground (VIEW.wide, further and wider): the rocket where the detonator was before the cut (≈ 630, 700),
 *  its trail down to the ground; the pad comes into the frame on « un kilomètre » (the camera tilts down to it). */
const WIDE = { ...VIEW.wide, tx: 3000, ty: 8200, d: 60000, az: -36, el: -5, fov: 46, shift: -60 };

export default function acte1({ D }) {
  const { tl, st, cut, path, chip, show, hide, punch } = D;
  const t = D.times({
    dechire: "accroche:déchire", seule: "accroche:seule", prevu: "accroche:prévu",
    une: "promesse", charge: "promesse:charge", jour: "promesse:jour", qui: "promesse:qui", declenchee: "promesse:déclenchée",
    toscene: "toscene", sol: "scene:sol", kilometre: "scene:un+0.2", pas: "scene:pas", ses: "scene:Ses",
    pleuvoir: "scene:pleuvoir", couloir: "scene:couloir", il: "scene:Il", reste: "scene:reste", charge2: "scene:charge", tobench: "tobench",
  });
  // retouche 08/11 (qa du brouillon): two cuts more, each three frames before its sentence — « Une fusée… » (the dive
  // was heurté at 5,6 s) and « Il reste sa charge » (the climb from the ground to the hull turned ≈ 150 °/s)
  const toline = t.une - 0.1;
  const tohull = t.il - 0.12;
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ───────── THE HOOK: the sky → the detonator ───────── */
  // the subject moves from frame 1: it veers on, its boosters peel off (both fastest at the start), then barely more
  st(0, VEER, { incid: INC1 }, "power2.out");
  st(0, 2.4, { tear: 0.42 }, "power2.out");
  st(2.4, t.toscene - 2.45, { tear: 0.45 }, "sine.inOut");
  st(t.prevu, 0.8, { charge: 1 }, "sine.out"); //                   « comme prévu »: the light runs down every line
  st(t.charge + 0.04, 1.2, { inside: 1 }, "sine.inOut"); //       its insides that count turn solid as the dive starts
  st(t.charge + 0.3, 1.5, { fx: DET.tx, fy: DET.ty, fz: DET.tz, fs: 600 }, "sine.inOut"); // the light goes with the dive
  st(t.declenchee - 0.2, 0.4, { litDet: 1 }, "sine.out"); //       « déclenchée »: the detonator's veille edge
  path([
    [0, POSE0],
    [0.5, { ...mid(incAt(0.5)), d: 9000, az: -56, el: -3, fov: 42, shift: 130 }], // launched: in on the tearing, ≈ 20°/s round it, rising
    [t.dechire, { ...mid(incAt(t.dechire)), d: 8600, az: -59, el: -6, fov: 42, shift: 120 }],
    [t.seule, { ...mid(incAt(t.seule)), d: 11000, az: -62, el: 0, fov: 41, shift: 100 }],
    [t.prevu, { ...mid(INC1), d: 12500, az: -65, el: 8, fov: 40, shift: 140 }], // from above: the charge lines face the lens
    [toline, { d: 11200, az: -66.5, el: 8.5 }], //                                    it eases in while the light runs down
  ]);
  // the cut in the axis, onto the core's charge line: the dive goes on from 4 200 instead of 12 500 (≈ 27 °/s, not 80)
  const LINE = { ...line(INC1, 2300), d: 4200, az: -66.5, el: 7, fov: 39, shift: 30 };
  cut(toline, null, LINE);
  path([
    [toline, LINE],
    [t.charge, { ...line(INC1, 2300), d: 2400, az: -68, el: 6, fov: 38, shift: 0 }],
    [t.jour, { ...DET, d: 240, az: -70, el: 0, fov: 36, shift: 60, side: -40 }],
    // from above (el 6): the key light lays on the lock's top face, the box reads as a solid, not black on dark
    [t.declenchee, { ...DET, d: 95, az: -72, el: 6, fov: 34, shift: 90, side: -60, dof: LOOK.dof }], // near where the rocket lands after the cut
    [t.toscene, { d: 80, az: -76.5, el: 8 }], //                                   it keeps turning and rising round it to the cut
  ]);
  punch(t.dechire, 0.06);
  punch(t.prevu, 0.06);
  punch(t.charge, 0.06);
  punch(t.declenchee, 0.05, { hold: 0.12, down: 0.3 });
  chip("chip-charge", null, 96, 470, t.charge + 0.04, t.qui - 0.15);

  /* ───────── THE SCENE: the ground → the hull ───────── */
  cut(t.toscene, SET.SCENE, WIDE, { ...STAGED, tear: 0.45, incid: INC1, charge: 1, ...LIGHT.wide });
  st(t.ses - 0.5, 1.6, { fall: 1 }, "sine.inOut"); //              « Ses morceaux vont pleuvoir »: the cone and the footprint spread under it
  st(t.ses, 1.0, { debris: 0.04 }, "sine.out"); //                 « Ses morceaux »: a few pieces part
  st(t.couloir - 0.55, 0.8, { corridor: 1 }, "sine.inOut"); //    « couloir »: the band lights from the pad eastward
  st(t.couloir + 0.4, 1.6, { ...LIGHT.sky }, "sine.inOut"); //     the light climbs back to the rocket
  path([
    [t.toscene, WIDE],
    // retouche: the wide keeps gliding (orbit ≈ 5 °/s and the camera rising on « un kilomètre… pleuvoir », 13 to 16 °/s
    // where it stood at 4 to 6), the nose kept under 440 and the pad over 1 244
    [t.sol, { d: 58000, az: -45, el: -1, shift: 20 }],
    [t.kilometre, { tx: 2600, ty: 8000, d: 55000, az: -50, el: 1.5, shift: 90 }],
    [t.pleuvoir, { tx: 3600, d: 56500, az: -60, el: 9, shift: 86 }],
    [t.couloir, { tx: 5500, d: 60000, az: -64, el: 13.5, shift: 72 }],
    [tohull, { tx: 6000, d: 61000, az: -65.5, el: 14.5, shift: 72 }], //   the band stays in view to the end of its sentence
  ]);
  // the cut onto the hull (it was a climb from the ground at ≈ 150 °/s), then a slow push to HULL, still moving at tobench
  const HULL0 = { ...mid(INC1), d: 3100, az: -58, el: -12, fov: 37, shift: 0 };
  cut(tohull, null, HULL0);
  path([
    [tohull, HULL0],
    [t.tobench, HULL],
  ]);
  punch(t.couloir, 0.06);
  punch(t.reste, 0.05, { hold: 0.12, down: 0.3 });
  chip("chip-pas", null, 96, 470, t.pas - 0.04, t.ses - 0.1);
  chip("chip-couloir", null, 96, 470, t.couloir - 0.04, tohull - 0.14); // it leaves with its shot
  show("#chip-charge", t.charge2 - 0.14, 0.2);
  hide("#chip-charge", t.tobench - 0.3, 0.12);
}
