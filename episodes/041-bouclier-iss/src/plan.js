// DOSSIER 041 — Le bouclier de l'ISS : WHERE EVERYTHING STANDS. Centimetres, Y up. No import: whipple.js, station.js,
// world.js and the acts all read this file, nothing else holds a dimension.
//
// THE CONVENTIONS (checked on kit/lib/stage.js: camera = target + d·(sin az·cos el, sin el, cos az·cos el)):
//   · the station flies toward −x: its front (the ram face, where the shield is thickest) is −x. Its line of
//     pressurised modules lies along x, the truss across it along z, the Earth below (−y), 400 km down (026's dome).
//   · THE ORIGIN is the impact point: the outer face of the bumper, on the +z flank of the hero module (a US lab,
//     Destiny's size), at its mid-length and mid-height. The bille comes from +z, straight in (−z): a normal impact,
//     as in NASA's design test (TP-2003-210788 §3.1).
//   · az 0 the camera sits on +z and looks down the bille's path (the layers face on); az −90 it sits at −x, in front
//     of the station, and sees the layers edge on (profile): outside (+z) on the RIGHT of the frame, the cabin on the left.
//     The key light comes from −x, +y, +z: film between az −20 and −70.
//
// THE SCALE. Everything is TRUE SIZE (the ISS ≈ 109 m of truss, a module ≈ 4.3 m across, the bumper 2 mm, the gap
// 10 cm, the bille 1 cm), in ONE place: the coupon of shield (whipple.js) is the piece of the hero module's wall where
// the bille hits, so a move can go from the bille to the whole station without a cut (the camera's near plane follows
// its distance). Only the far things are a maquette — the Earth (026's studio dome), the Kosmos 1408 cloud « au loin »,
// the dodge « d'un cheveu », the next file's tank — and nothing is ever measured on them (`sources` says so).

export const DEG = Math.PI / 180;

/** The orbit: what 026's dome needs. `alt` in km (the limb ≈ 20° under the level). */
export const ORBIT = { alt: 400 };

/* ─────────────────────────────────────────────── the system: the coupon of stuffed Whipple shield (whipple.js) */

/** The layers, as RADII from the hero module's axis (the coupon is a curved patch, concentric with the hull).
 *  From the outside in (TP-2003-210788, NASA US lab; faits § 4): bumper Al 6061 « un ou deux millimètres » (drawn 2);
 *  10 cm of empty gap; the Nextel (ceramic fibre) + Kevlar blanket, a thin slice close to the wall; the rear wall,
 *  Al 2219 « trois à cinq millimètres » (drawn 4.8, the lab's); behind it the cabin.
 *  Standoff bumper → rear wall: 11.4 cm (fig. 3-13). */
export const LAYERS = {
  bumper: [224.2, 224.4], //  2 mm — its outer face is the origin
  gap: [214.0, 224.2], //     10.2 cm of nothing (« dix centimètres de vide »)
  blanket: [213.2, 214.0], // 8 mm: Nextel (outer half, lighter grey) over Kevlar (inner half, darker, woven) — NEVER yellow
  wall: [212.52, 213.0], //   4.8 mm, the pressure wall (« ta coque »)
};
/** The coupon: a square patch of the four layers, 40 cm along x by 40 cm of arc (≈ ±20 cm in y), centred on the origin.
 *  Its rear wall IS the hull there: station.js leaves this window open in the hero's glass. */
export const COUPON = { half: 20, axis: [0, 0, -224.4] };
/** The exploded view: how far each layer lifts OUTWARD along the bille's path (+z), cm, at explode = 1. The wall stays. */
export const SPREAD = { bumper: 30, blanket: 12, wall: 0 };

/** THE BILLE: an aluminium-like sphere of 1 cm, along its path (0, 0, +dist) → the origin. `dist` is the state number:
 *  cm left before contact (≈ 2 500 in the hook, ≈ 300 on « tête », ≈ 20–40 in the close-ups, 0 = contact).
 *  At 10 km/s (the voice), 1 000 cm ≈ 1 ms: main.js turns `dist` into the header's countdown. */
export const BILLE = { r: 0.5, from: [0, 0, 1], speed: 1e6 /* cm/s */ };
/** The baseball-size one (« au-delà d'un centimètre », « le gros ou le petit ») : ≈ 7.4 cm, beside and behind the bille. */
export const BIG = { r: 3.7, offset: [-9, 7, 14] };
/** The rifle bullet left behind (« quinze fois plus vite qu'une balle »): it sits beside the path at `ref` cm when the
 *  bille passes it, and creeps on at 1/15 of the bille's speed — z = ref + (dist − ref) / 15. */
export const BULLET = { ref: 40, lateral: [-3.2, 2.4], length: 3.0, r: 0.39 };
/** The gauges: « un centimètre » next to the bille; « dix centimètres » along z under the gap. */
export const GAUGE1 = { offset: [0, -1.6, 0] };
export const GAUGE10 = { y: -8, x: 0, z: [-0.2, -10.2] }; // inside the gap, under the bille's axis, clear of the cloud (±4.5 cm at the blanket)
/** The counter-example (« à côté, en miroir »): ONE flat plate of the same aluminium as bumper + wall together
 *  (2 + 4.8 mm), ABOVE the coupon (a vertical frame stacks them: the coupon low on the bench, the plate over it), its
 *  outer face at the same z. A twin bille hits it on `pierce`. (Along x it would hide behind the coupon from az −60…−90.) */
export const MIRROR = { at: [0, 54, 0], half: 16, thick: 0.68, twinFrom: 45 };

/** ≈ the radius of the whole on the bench (coupon + mirror): sizes the bench, its light, its shadows. */
export const SYSTEM = { centre: [0, 22, -6], size: 48 };
/** The bench: the same place, the station gone; its floor just under the coupon (the cut to the bench is in place). */
export const BENCH = { floor: -21.5 };

/* ───────────────────────────────────────────────────── around: the station, X-ray (station.js) — a faithful maquette */

/** The hero module (a US lab): axis along x through COUPON.axis, outer radius = LAYERS.wall[1], 850 cm long. */
export const HERO = { centre: [0, 0, -224.4], r: 213, length: 850, window: 20 };
/** « Tu dors » : the sleeper (« toi »), in his bag tethered along the +z wall, lying along +x, head nearest the impact. */
export const SLEEPER = { head: [-6, -4, -52], feet: [168, -10, -58] };
/** The other modules, along x (centre x, radius, length) — enough to read the ISS at a glance, never a survey. */
export const MODULES = {
  harmony: { x: -785 - 360, r: 220, length: 720 }, //      Node 2, ahead of the lab
  unity: { x: 425 + 275, r: 220, length: 550 }, //         Node 1, behind it
  zarya: { x: 975 + 160 + 645, r: 205, length: 1290 }, //  the Russian segment begins
  zvezda: { x: 2585 + 655, r: 210, length: 1310 },
  columbus: { side: 1, x: -1145, r: 224, length: 690 }, //  on Harmony, toward +z
  kibo: { side: -1, x: -1145, r: 220, length: 1120 }, //    on Harmony, toward −z
};
/** The two shelters of 15/11/2021 (faits § 9): Crew Dragon at Harmony's front port, Soyuz under the Russian segment. */
export const DRAGON = { at: [-1505 - 330, 0, -224.4], axis: [-1, 0, 0], r: 200, length: 440 };
export const SOYUZ = { at: [1780, -560, -224.4], axis: [0, -1, 0], r: 135, length: 700 };
/** The ship docked at the back whose engines push the station aside (« elle les esquive »): a Progress at Zvezda's aft. */
export const PROGRESS = { at: [3895 + 360, 0, -224.4], axis: [1, 0, 0], r: 135, length: 720 };
/** The truss: across the lab's zenith, along z, 109 m; the arrays at its ends (four pairs, ≈ 35 × 12 m each wing,
 *  rotating about z); the radiators on its inner segments. */
export const TRUSS = { y: 430, z: [-5450 - 224.4, 5450 - 224.4], w: 300, arrays: [-4650, -3350, 3350, 4650], wing: [3500, 1150] };
/** The seven (« les sept astronautes »): six at their posts (in the station's modules) + the sleeper; on `shelter`
 *  four float to Dragon, three to Soyuz (NASA: 4 NASA + 1 ESA in Dragon, 2 cosmonauts in Soyuz). */
export const CREW = {
  posts: [[-1100, 20, -224.4], [-1180, -10, 250], [-300, 30, -260], [700, 0, -224.4], [1900, 10, -224.4], [3100, -20, -224.4]],
  dragon: 4, soyuz: 3,
};

/** « La station change d'orbite d'un cheveu » : how far the whole station is pushed (+y, cm) at dodge = 1 (a maquette:
 *  the real burn, 0.3–1 m/s hours ahead, moves it by kilometres at the conjunction — never measured on screen). */
export const DODGE = { dy: 520 };
/** The baseball-size debris of the chute, at station scale: from far ahead (−x) toward the lab, passing under it
 *  once the station has moved (flyby 0 → 1). */
export const FLYBY = { from: [-30000, 0, 900], to: [24000, 0, -1400], r: 3.7 };
/** 15/11/2021, « au loin » : Kosmos 1408 hit by the missile, its cloud spreading along its orbit (a maquette). */
export const KOSMOS = { at: [-52000, 2500, 26000], along: [0.3, 0, 1], spread: 30000, count: 1500 };

/* ───────────────────────────────────────────────────────────────── the next file (042), far from everything */

/** A tank under seals in the dark, its roof alone outlined (« un char dont le toit est fait pour sauter »), on its own
 *  patch of floor, seen on the BENCH set (the Earth hidden). ≈ 9 m long. */
export const TEASER = { at: [0, -21.5, 42000], length: 900, heading: -30 };
