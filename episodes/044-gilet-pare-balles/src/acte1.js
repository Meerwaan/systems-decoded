// 01 · MENACE — 0 → `toopen` (18,10). Two places, two moves, one cut (docs/044-actes.md § acte1.js, docs/044-actes-maj.md).
//
// THE HOOK (0 → 8,41), one path on the torso, az 28 → −6. It opens on POSE0, the macro in section: the bullet already
// flattening in the bent layers, the ribs of glass behind, the bin burning across the street. From frame 1 the SUBJECT
// moves: the cone deepens, the bullet opens into its mushroom, the fold runs out, the broken yarns that sprang out
// droop and dim, the wake fades. « Tu prends une balle » holds the macro and pulls back; « Tu crois à une pierre » the
// flank whole at d 140 (him, the vest, the stones on the street behind); « Entre elle et toi, pas d'acier : du tissu »
// dives back on the section — the bullet on the left, his ribs on the right, the soft leaves between, their crossed
// yarns brought up on « tissu »; « Et ce choc dans ton ventre… » pulls back to his belly as the cone pushes and the
// blow runs once over his belly and ribs.
//
// THE SCENE (8,41 → 18,10), a cut a breath before « La nuit », then one path in the street, az 82 → −28: behind him,
// 3/4 back, the street running up to its fires; over his shoulder (« couvre ») and up the street; on « tir » the bullet
// appears far up, a point of signal whose wake grows (never where it comes from); the camera takes it and runs beside
// it (« fonce », « mètres »: the bus shelter, the lamps streaming behind); « Devant elle… » the vest comes in on the
// right; « …ton gilet » him and the vest; « Combien de couches vont tenir ? » the dive on the tip, 4 cm from the panel.
// The bullet's flight is ONE ease (GSAP power2.out, a cubic, from « tir » to `toopen`): fast up the street, slowing all the way to
// the frozen frame act 2 opens on — no break of speed anywhere. The camera keys read where it is (bulletX).
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW, STAGED, SET, LIGHT } from "./world.js";
import { IMPACT } from "./plan.js";

const D0 = 1000; // cm: the bullet's distance when it appears (T−25 ms; the film never says it — 10 m keeps the camera's run up the street under 3 m/s)
const D1 = 4; //    cm: where act 2 freezes it
const DEG = Math.PI / 180;
/** The pose that looks from `cam` at `target` ([x, y, z], cm). */
const aim = (cam, target) => {
  const [dx, dy, dz] = [cam[0] - target[0], cam[1] - target[1], cam[2] - target[2]];
  const d = Math.hypot(dx, dy, dz);
  return { tx: target[0], ty: target[1], tz: target[2], d, az: Math.atan2(dx, dz) / DEG, el: Math.asin(dy / d) / DEG };
};

export default function acte1({ D }) {
  const { tl, st, path, cut, punch, chip } = D;
  const t = D.times({
    balle: "accroche:balle", pierre: "accroche:pierre", entre: "promesse:entre", tissu: "promesse:tissu",
    choc: "promesse:choc", ventre: "promesse:ventre", donne: "promesse:donné", toscene: "toscene",
    couvre: "scene:couvre", tir: "scene:tir", fonce: "scene:fonce", metres: "scene:mètres", devant: "scene:devant",
    gilet: "scene:gilet", tenir: "scene:tenir", toopen: "toopen",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ───────── the hook: the bullet in the cone, the camera off the macro and back ───────── */
  // the subject moves from frame 1 (FIRST → here); every number keeps rising toward the loop's own values
  // retouche 08/11 (qa: first half-second 1.6): the impact plays hard in the first second — the bullet crushes, the
  // cone digs, two more layers tear, the fold runs, the struck yarns pull tight, the broken ends droop, the wake draws back
  st(0, 1.2, { cone: 0.7, mushroom: 0.76 }, "power2.out");
  st(1.2, t.ventre - 1.2, { cone: 0.72, mushroom: 0.78 }, "sine.inOut");
  st(t.ventre, 0.9, { cone: 0.9, mushroom: 0.86 }, "power2.out"); // « ventre »: the cone pushes
  st(0, 1.4, { ring: 0.7 }, "power2.out");
  st(1.4, t.toscene - 1.4, { ring: 0.85 }, "sine.inOut");
  st(0, 0.9, { pierce: 0.3 }, "power2.out");
  st(0, 1.4, { tense: 0.85 }, "power2.out");
  st(0, 1.2, { breaks: 1 }, "power2.out"); // the yarns that sprang out droop and dim (0.5 → 1)
  st(0, 1.0, { trail: 0.15 }, "power2.out");
  st(t.tissu - 0.08, 0.4, { litWeave: 0.6 }, "power2.out"); // « du tissu »: the crossed yarns of every leaf
  st(t.choc - 0.1, 0.5, { litWeave: 0 }, "sine.inOut");
  st(t.ventre, 1.4, { wave: 1 }, "none"); // the blow runs once over his belly and ribs
  chip("chip-tissu", null, 96, 470, t.tissu - 0.08, t.ventre - 0.1);

  path([
    [0, POSE0], // the macro in section — left already running (16°/s)
    [0.5, { d: 40, az: 20, el: -6 }],
    [t.balle + 0.28, { d: 50, az: 17, el: -3 }], //                                                         « balle »: still on it
    // « pierre »: high behind his left flank, head to vest in, the stones strewn on the road behind him, left (≈ 90–110 px)
    [t.pierre + 0.3, { tx: -30, ty: 115, tz: -60, d: 400, az: 12, el: 24, fov: 28, shift: 0, drift: 0.2 }],
    [t.tissu, { tx: -9, ty: 107, tz: 5, d: 40, az: 8, el: -3, fov: 34, shift: 0 }], //                   the section, side on
    [t.ventre, { tx: -4, ty: 114, tz: 6, d: 165, az: 0, el: 6, fov: 36, shift: 120, drift: 0.3 }], //  his belly, his ribs
    [t.toscene, { az: -16, d: 100, ty: 112 }], //                                « qui te l'a donné ? »: the push in on the belly
  ]);
  punch(t.balle, 0.06);
  punch(t.tissu, 0.06);
  punch(t.donne, 0.05, { hold: 0.12, down: 0.3 });

  /* ───────── the scene: the street, a fraction of a second before ───────── */
  cut(t.toscene, SET.SCENE, VIEW.night, { ...STAGED, dist: D0, bullet: 0, trail: 0, ...LIGHT.street });
  // « tir »: the bullet appears up the street, its wake grows; ONE ease all the way to the frozen tip (no break of speed)
  st(t.tir - 0.04, 0.14, { bullet: 1 }, "power2.out");
  st(t.tir - 0.04, 0.2, { trail: 1 }, "power2.out"); // the wake draws out at once, bright (its glow is `trail`): a streak, not a point
  st(t.tir, t.toopen - t.tir, { dist: D1 }, "power2.out"); // GSAP power2 = cubic
  st(t.devant, t.toopen - t.devant, { ...LIGHT.panel }, "sine.inOut");
  const u = (time) => Math.min(1, Math.max(0, (time - t.tir) / (t.toopen - t.tir)));
  const bulletX = (time) => IMPACT[0] - (D0 - (D0 - D1) * (1 - Math.pow(1 - u(time), 3))); // the same ease: cubic out
  // beside the bullet at `time`: the camera at bullet + off, aimed `lead` cm ahead of it (it flies left to right)
  const beside = (time, off, lead) => {
    const x = bulletX(time);
    return aim([x + off[0], IMPACT[1] + off[1], IMPACT[2] + off[2]], [x + lead, IMPACT[1], IMPACT[2]]);
  };
  chip("chip-gilet", null, 96, 470, t.gilet - 0.1, t.tenir + 0.25);

  path([
    [t.toscene, VIEW.night], //                                                  3/4 back, the street running up to its fires
    [t.couvre, { ...aim([-40, 172, 90], [-500, 130, -20]), fov: 34 }], //        over his shoulder, up the street (the lens starts closing)
    // « personne n'entend le tir »: the camera runs up the street and out to the side, the lens closing on where the bullet
    // appears — seen from above and three-quarters, its wake streaks across the dark road (5.8 m, a long lens: fov 18)
    [t.tir, { ...aim([-520, 225, 330], [-961, 108, 5]), fov: 18 }],
    [t.tir + 0.5, { ...aim([-548, 165, 225], [-785, 108, 5]), fov: 32 }], //    it comes at us: the lens opens as it nears
    [t.fonce, { ...beside(t.fonce, [70, 12, 72], 10), fov: 40, shift: 30 }], //  « fonce »: beside it
    [t.fonce + 0.5, beside(t.fonce + 0.5, [40, 8, 52], 7)], //                   closer
    [t.metres, beside(t.metres, [26, 6, 49], 6)], //                             « mètres »: the street streams behind
    [t.metres + 0.6, beside(t.metres + 0.6, [19, 5, 55], 8)],
    [t.devant, beside(t.devant, [4, 6, 84], 6)], //                              « Devant elle… »: the vest comes in, right
    [t.gilet, { ...aim([-81.5, 131, 219], [-36, 108, 5]), fov: 44 }], //        « …ton gilet »: him, the vest, the bullet
    [t.tenir, { ...aim([-36, 110, 50], [-15, 106, 5]), fov: 38 }], //           « Combien de couches vont tenir ? »
    [t.toopen, VIEW.tip], //                                                     the tip, 4 cm away
  ]);
  punch(t.tir, 0.06);
  punch(t.gilet, 0.06);
  punch(t.tenir, 0.05, { hold: 0.12, down: 0.3 });
}
