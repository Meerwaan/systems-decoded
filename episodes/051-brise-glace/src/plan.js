// DOSSIER 051 — Le brise-glace : the plan of the set. Centimetres, y up. No import here: model.js, glace.js,
// banquise.js and world.js all read it — it is what lets them be built at the same time.
//
// THE ORIGIN is the icebreaker's waterline, amidships: y = 0 is the sea's surface, its bow points toward −z.
// PORT (bâbord) is −x, STARBOARD (tribord) is +x (facing −z, the right hand is +x).
// Azimuth (kit/lib/stage.js, checked: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)):
//   az 0 stands at +z — ASTERN, looking along the ship toward its bow · az −90 at −x (its PORT flank)
//   · ±180 AHEAD of the bow (−z) · az +90 at +x (starboard). The key light comes from −x, +y, +z: astern-port;
//   a camera between az −20 and −70 has it at its shoulder (the port quarter).
//
// TWO FRAMES, ONE NUMBER. The icebreaker never moves: the ICE does. `run` (metres) is how far the ship has
// travelled into the ice: everything that belongs to the ice (the field, its floes and ridges, the trapped ship,
// the blocks it has broken) is drawn shifted by +run·100 in z (it slides astern as the ship goes ahead; `run`
// falling is the ship backing off). Only the plate in contact (glace.js, CONTACT) stays under the stem.
// The ship rolls by `heel` around its own long axis (z, at the waterline): world.js does it, on both sets.
//
// ONE SCALE: TRUE for the ships and the ice (a generic heavy icebreaker of ≈ 116 m, ice a metre thick). TWO
// exceptions, said in `sources`: (1) in the hook and the loop the two ships are brought close (`apart` ≈ 1.2 km
// instead of ≈ 11 km) to share one vertical frame — the top view of the scene puts the real distance back;
// (2) the ice belt is drawn thicker than its true 50 mm in the cutaway (it would be under a pixel). No length,
// angle or thickness is ever written on the 3D: the voice says them, the header and the chips carry the rest.

/* ───────────── THE ICEBREAKER (model.js) — generic: neither the Xuelong nor the Oden drawn ───────────── */
/** Hull: stern at +z, bow tip at −z; the waterline beam, the draught (keel at −draught), the main deck. */
export const SHIP = { stern: 5600, bow: -6000, beam: 2600, draught: 800, deck: 900, keel: -800 };
/** THE STEM — the heart: inclined 20° to the waterline over the ice zone (y −400 → +400), steeper above and
 *  below. Profile points [z, y] from the deck down to where it meets the keel (the hull is drawn through them). */
export const STEM = {
  angle: 20, //   degrees with the waterline (sourced: « typically 20–30° »; the film says « vingt degrés »)
  water: -4800, // z where the stem cuts the waterline
  profile: [[-6000, 900], [-5899, 400], [-4800, 0], [-3701, -400], [-3000, -720], [-2400, -800]],
  /** the « presque droite » stem (≈ 82°) the principle and the like compare it with: same waterline point */
  straight: { angle: 82, profile: [[-4930, 900], [-4856, 400], [-4800, 0], [-4744, -400], [-4690, -800]] },
};
/** The ice belt: the thickest plating, a band around the waterline from bow to stern (drawn 12 cm thick in the
 *  cutaway; true: up to 50 mm). */
export const BELT = { bottom: -250, top: 200, thick: 12 };
/** The heeling tanks: two pairs, port and starboard (the Oden's: 400 t each), against the sides, below the
 *  waterline; a cross pipe joins each pair at the bottom. `fore` / `aft`: the pairs' centres in z. */
export const TANKS = { fore: -1300, aft: 1500, length: 1800, width: 380, bottom: -700, top: -20, inset: 140, pipe: 70, pipeY: -640 };
/** The superstructure (forward of amidships, as on most icebreakers), the bridge, the funnel, the helideck aft. */
export const DECKHOUSE = { from: -3200, to: -700, half: 950, top: 2200, bridge: 2600, funnel: [0, 900, 600], heli: [0, 900, 4300] };
/** Two propellers (the voir: « l'hélice brasse ») and their rudders, astern. */
export const PROPS = { z: 5300, y: -520, x: 520, r: 230, blades: 4 };
/** The weight the stem lays on the ice: an arrow from the contact point, straight down (veille). */
export const PUSH = { at: [0, 20, -4800], length: 900 };

/* ───────────── THE ICE AT THE BOW (glace.js) — ship frame ───────────── */
/** Sea ice of the film: a metre thick, a tenth above the water. */
export const ICE = { thick: 100, freeboard: 10 };
/** The plate in contact: the slab under the stem that bends, cracks, and breaks into blocks. Its edge sits on the
 *  stem's waterline point; it reaches `length` ahead; `half` its half-width. */
export const CONTACT = { edge: -4800, length: 3200, half: 1700 };
/** The near field glace.js draws (blocks along the hull, rubble, ridges) — banquise.js leaves this box to it. */
export const PATCH = { ahead: -14000, behind: 9000, half: 4500 };
/** Pressure ridges: their sail (the crest above the ice) along both flanks and, in ice frame, one ahead (the
 *  ridge act 3 rams). Heights are illustrative (never written on screen). */
export const RIDGE = { sail: 280, flank: 1700, ahead: -5750, width: 900 };

/* ───────────── THE FIELD (banquise.js) — ice frame (shifted by +run·100 in z) ───────────── */
/** The trapped ship (« ton navire », X-ray): ice-strengthened, ≈ 72 m (the Akademik Shokalskiy, not named on
 *  screen), at `apart` metres AHEAD of the icebreaker (−z), off its axis to port, heading turned by `yaw`. */
export const SHOK = { length: 7160, beam: 1280, deck: 620, draught: 450, x: -2600, yaw: 50, crowd: 9 };
/** How far apart the two ships stand (metres): ≈ 11 km for real (« une dizaine de kilomètres », ≈ 6 nmi);
 *  ≈ 1.2 km in the hook and the loop (see the top of this file). FIRST.apart says the hook's. */
export const APART = { real: 11000, hook: 1200 };
/** The field: floes of 20 to 80 m, leads between them while `close` < 1; it reaches `radius` around the ship. */
export const FIELD = { radius: 1500000, floeMin: 2000, floeMax: 8000 };
/** The wind (« le vent… »: an easterly), the direction it pushes the pack in the ship frame (unit vector). */
export const WIND = { dir: [-0.95, 0, -0.31] };
/** The helicopter of the comment's duel, above the trapped ship (the evacuation was flown, 2/01/2014). */
export const HELI = { y: 4500, length: 1600 };

/* ───────────── THE BENCH ───────────── */
/** On the bench the ship stands on its keel: the bench floor lies at y = SHIP.keel (world.js lowers the bench),
 *  so the ship keeps the SAME coordinates on both sets and the cut to the bench needs no offset. */
export const BENCH_FLOOR = SHIP.keel;
/** ≈ the ship's half-length: sizes the bench, its light, its shadows. */
export const SIZE = 6000;
