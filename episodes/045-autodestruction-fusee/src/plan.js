// DOSSIER 045 — L'autodestruction de la fusée : WHERE EVERYTHING STANDS. Centimetres, y up. No import: read by every set
// (fusee.js, sauvegarde.js, kourou.js), by world.js and by the acts.
//
// THE STORY (docs/faits/045-autodestruction-fusee.md, Lions report): Ariane 5, flight 501, Kourou, 4 June 1996. H0 is the
// Vulcain's ignition (09:33:59 local); lift-off ≈ H0+7 s (« H0+36,7 s, approx. 30 seconds after lift-off »). Nominal to
// ≈ H0+36 s; the inertial reference systems stop at H0+36,7 s; the nozzles go hard over; incidence > 20°; the boosters tear
// off the core ≈ H0+39 s — the rupture of their links with the core triggers the destruction, automatically, as designed —
// ≈ 4 km up, ≈ 1 km from the pad; the debris fell over ≈ 12 km² of mangrove and savanna east of the pad.
// The destruction chain shown (antenna, safe-and-arm, detonator, cord, linear charge) is the GENERIC one (NASA PT-TE-1438,
// Pyroalliance): Ariane 5's own was not found at the source — the picture reconstitutes, `sources` says so.
//
// AXES. The ground is y 0. The pad (ELA-3) stands on the origin. +x is EAST, downrange: the flight path, the corridor, the
// debris, the coast; +z is north. The camera (kit/lib/stage.js): position = target + d·(sin az·cos el, sin el, cos az·cos el)
//   az 0     the camera north of its target (+z), looking south: the rocket's flank, its pitch-over runs left → right
//   az −90   the camera west (−x), looking east down the corridor: the rocket from behind, its boosters left and right
//   az −40   the film's side (west-north): the key light (−x, +y, +z) comes from behind the camera
//   el < 0   the camera under its target, looking up (the hook's contre-plongée)
// THE ROCKET'S OWN FRAME: origin = the bottom of the core's aft skirt, y up its axis, its boosters at z = ±BOOSTER.side.
// A point at azimuth `a` (degrees) and radius r in that frame is (r·sin a, y, r·cos a) — the stage's convention: on the
// unturned rocket, a part at a = −40 faces a camera at az −40. The rocket pitches over TOWARD +x (a turn about z): its
// ±z faces stay where they are, which is why the film's side (−40) keeps facing the camera as it tilts.
//
// TWO SCALES. The rocket, the pad, the booth and the system are TRUE SIZE (rounded from public drawings: no length is ever
// written on screen). The GEOGRAPHY is a MAQUETTE: 1 km = KM cm (40 m), so that a 50 m rocket « quatre kilomètres au-dessus
// du sol, à un kilomètre du pas de tir » holds in one vertical frame with the pad — the 4 : 1 is kept, nothing measured.

export const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/* ───────────────────────── the geography (maquette) ───────────────────────── */

/** cm per km of the GEOGRAPHY only (heights in the sky, distances on the ground). The rocket stays true size. */
export const KM = 4000;
/** Where it breaks up (H0+39 s): the core's base 4 km up, 1 km east of the pad (Lions §1.3, §3.1 j). */
export const ALT = 4 * KM;
export const DOWN = 1 * KM;

/** The pad, ELA-3 — true size, rounded, X-ray: the launch table on its deck over the flame ducts, four lightning masts. */
export const PAD = {
  table: { w: 2200, d: 1700, h: 650 }, //   the mobile launch table, standing on the deck (y 0), its openings under the nozzles
  ducts: { w: 900, len: 6000, depth: 900 }, // the flame ducts leaving the table east and west, cut in the ground
  base: 1000, //                             the core's base (rocket frame y 0) on the table, nozzles hanging into its openings
  masts: { r: 4200, h: 7000, w: 120 }, //    four lightning masts around the table (rounded; never measured)
};

/** The flight corridor (CNES: the zone where the rocket is no danger, even destroyed): a band on the ground from just
 *  behind the pad, eastward past the coast, widening; its faint walls in the air. Maquette — the band is the RULE. */
export const CORRIDOR = { x0: -1 * KM, x1: 16 * KM, half0: 1.6 * KM, half1: 4.5 * KM, wall: 6 * KM };
export const corridorHalf = (x) => CORRIDOR.half0 + (CORRIDOR.half1 - CORRIDOR.half0) * clamp01((x - CORRIDOR.x0) / (CORRIDOR.x1 - CORRIDOR.x0));

/** Where the debris of 501 came down: ≈ 12 km² (≈ 5 × 2,5 km) of mangrove and savanna EAST of the pad (Lions §1.3). The
 *  film never labels it « dans le couloir » (the report does not say it in those words): it shows it near the pad, east. */
export const FALL = { x0: 0.2 * KM, x1: 5.2 * KM, half: 1.25 * KM };

/** The ground (maquette): savanna around the pad and west of it, mangrove and its creeks east toward the coast, the ocean. */
export const GROUND = { savanna: [-12 * KM, 1.5 * KM], mangrove: [1.5 * KM, 8 * KM], coast: 8 * KM, far: 60 * KM };

/** The CNES safety room (« la sauvegarde ») as a glass booth WEST-NORTH of the pad (maquette: the real room is km away):
 *  its window faces the pad, its console under the window, two screens — the corridor band and the flown track. A camera
 *  behind the console sees the screens AND the pad through the glass (azimuth of the booth seen from the pad ≈ −54°). */
export const BOOTH = { at: [-2.2 * KM, 0, 1.6 * KM], w: 700, d: 500, h: 470, desk: 95, screen: [120, 70] };
/** The booth's azimuth seen from the pad (degrees, stage convention): a camera at this az behind the booth looks at the pad. */
export const BOOTH_AZ = Math.atan2(BOOTH.at[0], BOOTH.at[2]) / DEG;

/** The next file (046, the refinery flare): a far silhouette on the south-east horizon, its pilot flame. True size. */
export const TEASER = { at: [11 * KM, 0, -4.5 * KM], h: 9000, r: 120 };

/* ───────────────────────── the rocket (Ariane 5 G, true size, rounded) ───────────────────────── */

export const ROCKET = {
  core: { r: 270, y0: 0, y1: 3050 }, //                 EPC, Ø 5,4 m, ≈ 30 m
  vulcain: { y0: -40, y1: -360, r0: 55, r1: 105 }, //   the Vulcain's nozzle hanging under the core (throat → exit)
  bay: { y0: 3050, y1: 3210 }, //                       the VEB, « la case à équipements »: the guidance, the SRI, the safety box
  upper: { y0: 3050, y1: 3480, r: 200 }, //            the upper stage, under the fairing
  fairing: { y0: 3210, y1: 4300, tip: 5150, r: 270 }, // the fairing (cylinder, then its ogive)
  top: 5150,
};
/** The two boosters (EAP): Ø 3 m, at z = ±side, their nozzles hanging under the table line. */
export const BOOSTER = { r: 152, side: 452, y0: -20, y1: 2700, nose: 3150, nozzle: -330, exit: 150 };
/** The struts between each booster and the core (heights in the rocket frame): aft and forward. */
export const ATTACH = { aft: 260, fwd: 2620 };
/** The electric links across the forward junction, one harness per booster: their rupture triggered 501's destruction. */
export const LINKS = { y: 2560, len: 150 };
/** The rocket's middle up its axis: what the wide poses aim at. */
export const CENTER = 2600;

/** In the bay: the two inertial reference systems (SRI) and the safety box (where the system is mounted), by azimuth. */
export const SRI = [{ az: -80, r: 205, y: 3130, size: [40, 26, 34] }, { az: -5, r: 205, y: 3130, size: [40, 26, 34] }];
/** The system's seat: inside the bay's skin on the film's side. sauvegarde.js's LOCAL frame maps onto it so that
 *  local +x runs DOWN the rocket's axis (antenna at the top, the charge below), local +y points INWARD (toward the axis),
 *  local +z along the skin (tangent). fusee.js builds A.seat with that turn: world.js only re-parents the system there. */
export const SEAT = { az: -40, r: 262, y: 3190 };

/** The linear charges ALONG THE HULL (generic — `sources`: the image reconstitutes): down the core from the seat, along each
 *  booster on its west side (the film sees them). Azimuths in the rocket frame (boosters: around their own axis). */
export const CHARGES = { core: { az: -40, y0: 260, y1: 3130 }, booster: { az: -75, y0: 150, y1: 2620 } };

/* ───────────────────────── the flight (the planned path, then the veer) ───────────────────────── */

/**
 * The planned path, `u` = `climb` 0 (on the pad) → 1 (the point of H0+39 s). Returns the core's base in the world and the
 * path's tilt from vertical toward +x (degrees). The pitch-over is a maquette (a parabola that leaves the pad vertical).
 */
export function flightAt(u) {
  const k = clamp01(u);
  const rise = ALT - PAD.base;
  return { x: DOWN * k * k, y: PAD.base + rise * k, z: 0, pitch: Math.atan2(2 * DOWN * k, rise) / DEG };
}

/** The rocket placed: its base and its tilt (degrees from vertical toward +x) = the path's + `incid` (its angle off the path). */
export function rocketAt(climb, incid = 0) {
  const f = flightAt(climb);
  return { pos: [f.x, f.y, f.z], tilt: f.pitch + incid };
}

/** A point of the rocket's frame [lx, ly, lz] → the world, for a given state (the camera's targets, the light). */
export function onRocket(climb, incid, [lx, ly, lz]) {
  const { pos, tilt } = rocketAt(climb, incid);
  const c = Math.cos(tilt * DEG);
  const s = Math.sin(tilt * DEG);
  return [pos[0] + lx * c + ly * s, pos[1] - lx * s + ly * c, pos[2] + lz];
}
/** A point at azimuth `a` (degrees), radius r, height y of the rocket's frame. */
export const ringPoint = (a, r, y) => [r * Math.sin(a * DEG), y, r * Math.cos(a * DEG)];

/** The hook's state of the rocket (FIRST): high on its path, already crossways and tearing. */
export const HOOK = { climb: 1, incid: 30 };

/* ───────────────────────── the system (sauvegarde.js), true size ───────────────────────── */

/** The chain in its LOCAL frame (cm): +x along the row (antenna → charge), +y up off the hull strip (inward when mounted),
 *  +z across. Assembled (`explode` 0) it is as mounted in the bay; `explode` 1 spreads it in a row along x, the gaps the
 *  model's own (≈ 200 cm end to end). On the bench it lies on its halo, the strip flat at y 0. */
export const SYS = {
  antenna: { at: [-72, 0, 0], h: 20, r: 6.5 }, //        a stub through the skin, its radome OUTSIDE (local −y), « elle écoute le sol »
  receiver: { at: [-56, 0, 0], size: [24, 12, 18] }, //  the receiver-decoder box behind it
  lock: { at: [-32, 0, 0], size: [15, 13, 13], rotor: 4.5 }, // the safe-and-arm device, its rotor seen through a window
  det: { at: [-17, 0, 0], r: 0.7, len: 5 }, //           the detonator, plugged into the lock's output
  cord: { from: [-14, 0, 0], to: [6, 0, 0], r: 0.35 }, // the confined detonating cord (on the bench it runs on along the strip)
  charge: { from: [6, 0, 0], to: [70, 0, 0], w: 2.6, h: 1.9 }, // the linear shaped charge: a V pointing INTO the strip
  strip: { from: [-80, 0, 0], to: [76, 0, 0], w: 16, t: 0.8 }, // the piece of hull it is all mounted on
  plate: { at: [52, -1.2, 0], t: 2, w: 34, d: 22 }, //   the principle's steel plate under the charge, 2 cm (« jusqu'à »)
  /** where `section` cuts the charge: its part at x < cut is hidden, so the cut face looks toward −x (seen from az −40 → −90) */
  cut: 38,
};
/** `explode` 1: where each part's centre stands along x (the row across the camera, in the order the voice names them).
 *  The acts aim at these numbers; the model moves its parts from SYS.*.at to here (its strip stays under the charge). */
export const ROW = { antenna: -112, receiver: -86, lock: -52, det: -28, cord: [-22, 18], charge: [22, 86], cut: 54 };

/* ───────────────────────── the bench (a set of its own) ───────────────────────── */

/** The bench: the system alone on its pool of light, at the origin of an empty studio (SET.BENCH hides the base and the
 *  rocket). `size` ≈ the radius of what stands on it (the row spans ≈ 200 cm): sizes the bench, its light, its shadows. */
export const BENCH = { at: [0, 0, 0], size: 95 };
