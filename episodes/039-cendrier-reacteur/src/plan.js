// DOSSIER 039 — Le cendrier du réacteur : the plan of the set. Centimetres, y up. No import here: model.js,
// corium.js, batiment.js and world.js all read it — it is what lets them be built at the same time.
//
// THE ORIGIN is the centre of the reactor pit's floor, on the TOP of its sacrificial concrete (y 0): straight
// under the vessel's lowest point, right over the melt plug. The vessel's axis is the y axis (x = z = 0).
// The corium's path runs toward +z: pit (z 0) → plug (under the floor's centre) → shaft → transfer channel → the
// spreading chamber (z 750 … 2450), lower than the pit. The IRWST pool lies beside the chamber, on its +x side.
// So a camera on the usual side (az −20 … −70: it stands at −x / +z) has the chamber in front, the channel, and
// the pit and its glowing vessel BEHIND it: the threat behind the subject.
// Azimuth (kit/lib/stage.js, checked: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)):
// az 0 stands at +z — beyond the chamber's far end, looking back along the path toward the pit —, −90 at −x
// (the chamber's left flank), ±180 at −z (behind the pit). The key light comes from −x, +y, +z.
//
// SCALE. The spreading chamber is TRUE in area (1000 × 1700 cm = 170 m², ASN 2011 / IRSN): the one number the
// voice says, and the only size ever written on screen (« 170 m² » on the slab, chip-170). Everything else is a
// MODEL at about the right proportions, never written: the vessel is 005's (a 900 MWe vessel, a little smaller
// than an EPR's), the pit, the plug, the channel, the pool and the valves are placed and sized for the picture
// (no drawing of the EPR's core catcher under a verified licence: `sources` says the picture reconstructs).

/* ───────────── THE VESSEL (batiment.js: 005's reactor.js, its group moved here) ─────────────
   005's frame: y 0 = the top of the fuel, its lower head's lowest point at −645. Moved by `at`, that point is at
   y = `low`, 2.6 m over the pit floor; its lower head (the hemisphere the melt pierces) starts at `belly`. */
export const VESSEL = { at: [0, 905, 0], r: 205, low: 260, belly: 465, head: 1532, top: 1710 };

/* ───────────── THE SYSTEM (model.js) — solid ───────────── */
/** The reactor pit under the vessel: `r` the inner radius of its sacrificial lining; the floor's top at y 0, the
 *  lining `sac` thick on the floor and on the wall up to `top`; behind it, `zirc` of zirconia bricks (everywhere
 *  but the plug); behind that, the pit's structural concrete (batiment.js, X-ray) `wall` thick, up to `rim`. */
export const PIT = { r: 300, floor: 0, top: 420, sac: 50, zirc: 12, wall: 150, rim: 1100 };
/** The melt plug (« la porte fusible »): a metal gate at the floor's centre, UNDER the sacrificial concrete (its
 *  top at y −50, `h` thick); over it a cap of sacrificial concrete, ringed (`ring`) so that it reads from above.
 *  The only place the zirconia does not line: the only way out. */
export const PLUG = { r: 55, y: -50, h: 12, ring: 72 };
/** Under the plug, a short drop, then the transfer channel: lined with zirconia, a little slope down to the
 *  chamber. Its section `w` × `h`; `from` the bottom of the drop, `to` its mouth in the chamber. */
export const SHAFT = { r: 55, top: -62, bottom: -260 };
export const CHANNEL = { w: 120, h: 140, from: [0, -260, 0], to: [0, -330, 750] };
/** The spreading chamber (« la chambre d'étalement »), à sec: its floor's top at `floor`; x0…x1 × z0…z1 =
 *  1000 × 1700 cm = 170 m². Its floor and its low side walls (`side` high) are the cooling structure: thick
 *  cast-iron elements `plate` thick, ribbed underneath (`ribs` deep: the cooling channels), a thin layer of
 *  sacrificial concrete on top. The melt spread over it is `sheet` thick (illustrative: « mince »). */
export const CHAMBER = { x0: -500, x1: 500, z0: 750, z1: 2450, floor: -330, side: 120, plate: 25, ribs: 100, sheet: 20 };
export const AREA = 170; // m²: (x1 − x0) × (z1 − z0) / 10 000 — the number the voice says
/** The central channel under the structure: the flooding water comes in by it, fills the ribs and the gap behind
 *  the side walls, and overflows onto the melt (Fischer, NURETH-16 § 9). */
export const CENTRAL = { r: 40, y: -500, z0: 750, z1: 2450 };
/** The water level in the chamber when it is flooded (over the melt's top, −310). */
export const FLOOD = { level: -250 };
/** The IRWST, the borated water pool INSIDE the reactor building — a sector of it, beside the chamber: its
 *  surface (`level`) higher than the chamber's floor: the water comes down by gravity, no pump. */
export const POOL = { x0: 700, x1: 1300, z0: 750, z1: 2450, floor: -150, level: 250, wall: 40 };
/** The two passive flooding valves, low in the pool's inner wall; their triggers lie on the chamber's slab, by its
 *  +x side wall, each tied to its valve: the melt, spreading, destroys them — the valves open, and stay open. */
export const VALVES = [[700, -110, 1900], [700, -110, 2300]];
export const TRIGGERS = [[420, -330, 1900], [420, -330, 2300]];
/** Each valve's pipe, down and under to the central channel's +z end. */
export const PIPES = VALVES.map(([x, y, z]) => [[x, y, z], [x - 60, y, z], [x - 60, CENTRAL.y, z], [0, CENTRAL.y, CENTRAL.z1]]);
/** The « principe » demonstration: the same mass of melt, first a thick heap on the slab, then spread thin. */
export const HEAP = { at: [0, -330, 1600], r: 260, h: 160 };

/* ───────────── AROUND (batiment.js) — X-ray ───────────── */
/** The basement of the reactor building: its floor grid (`floor`), the chamber's room (walls `room` cm off the
 *  cooling structure, ceiling at `ceiling`), the containment's wall curving behind, fading out above `fade`. */
export const BASEMENT = { floor: -560, room: 150, ceiling: 260, containment: 2600, centre: [0, 0, 1000], fade: [1600, 2400] };
/** The next file's teaser (040, the fire shelters), far from everything: the two sets never see each other. */
export const TEASER = { at: [60000, 0, 0], ring: 1400 };

/** ≈ the radius of the whole (vessel to the chamber's far end): sizes the bench, its light, its shadows; and the
 *  centre the wide shots look at. */
export const SYSTEM = { size: 1500, centre: [0, 300, 1200] };
