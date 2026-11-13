// DOSSIER 047 — Lave-vaisselle : the plan of the set. Centimetres, y up, the kitchen floor is y = 0. No import here:
// model.js, cuve.js, cuisine.js and world.js all read it — it is what lets them be built at the same time.
//
// THE ORIGIN is the centre of the dishwasher's footprint on the floor. Its DOOR faces +z; x runs to the RIGHT as you
// stand in front of it. Azimuth (kit/lib/stage.js, checked: the camera stands at t + d·(sin az · cos el, sin el,
// cos az · cos el)): az 0 stands at +z — IN FRONT of the door —, az −90 at −x (its LEFT flank, the sink's side),
// ±180 behind it (−z, the kitchen wall). The key light comes from −x, +y, +z: front-left; a camera between az −20
// and −70 has it at its shoulder. To look AT the door from inside the tub, the camera stands at az ±150…180.
//
// ONE SCALE, TRUE: a standard 60 cm built-in dishwasher, its stainless tub, its parts at their usual places (sizes
// and places from manufacturers' pictures and service manuals: never written on screen). The water circuit is
// simplified (one lower spray arm is the system; the upper arm and its riser are glass), `sources` says so.
// The kitchen is 009's (009-micro-ondes/src/kitchen.js), imported unchanged and moved by KITCHEN.at: the
// dishwasher stands at the END of its run, right of its last base unit, under a worktop that continues it.

/* ───────────── THE KITCHEN (cuisine.js: 009's kitchen, moved) ───────────── */
/** Where 009's kitchen origin goes in this frame: its wall (009 z = 0) at z −30, its run (009 x 31 → 260) at x −261 → −32. */
export const KITCHEN = { at: [-292, 0, -30], floorAt: [292, 60] }; // floorAt: 009's floor grid centred under the dishwasher (009 coordinates)
/** The worktop that runs on over the dishwasher (009's is y 86 → 90, 62 deep from the wall). */
export const WORKTOP = { x0: -32, x1: 32, y0: 86, y1: 90, z0: -30, z1: 32 };
/** 009's sink, in THIS frame: the bowl's centre on the worktop, its bottom, the tap's mouth, the drain under it. */
export const SINK = { x: -171, z: 2, top: 90, bottom: 72, w: 46, d: 36, mouth: [-171, 114, -6.5], drain: [-171, 72, 2] };
/** The waste pipe under the sink: down from the drain, then back into the wall (« l'eau qui part à l'égout »). */
export const WASTE = [[-171, 72, 2], [-171, 42, 2], [-171, 34, -10], [-171, 34, -30]];
/** You, of glass, at the sink (cuisine.js), facing −z; your hand holds a plate under the tap at `plate`. */
export const YOU = { x: -171, z: 58, plate: [-171, 98, 0], plateR: 13 };
/** The two columns of water beside the dishwasher, on the floor at its right (cuisine.js). TRUE volumes: r 8 cm,
 *  so the machine's column is 50 cm high at ten litres; the hand-washing one, twice as high (« moitié moins »),
 *  never graduated, never a figure (the litres by hand are not sourced). */
export const COLUMNS = { r: 8, machine: [58, 0, 42], hand: [78, 0, 42], h: 50 };

/* ───────────── THE DISHWASHER AROUND THE SYSTEM (cuve.js, X-ray) ───────────── */
/** The cabinet, door shut (its door in front of it: DOOR). */
export const DW = { x0: -30, x1: 30, y0: 0, y1: 85, z0: -29, z1: 28 };
/** The base under the tub (feet, pump, sump, valve live in it): y 0 → 14. */
export const BASE = { y1: 14 };
/** The stainless tub, inside: its floor slopes gently toward the sump (y0 at the walls, 0.6 cm lower at the sump). */
export const TUB = { x0: -27, x1: 27, y0: 15, y1: 79, z0: -26, z1: 27 };
/** The door: closed, its inner face at z 28 and its front at z 33; it opens about the hinge axis (along x, at y 4,
 *  z 30.5), its top falling toward +z: `door` 0 shut → 1 open flat (90°). The control strip and the eco lamp are on
 *  its top edge (y 82 → 85), seen from above and from the front. */
export const DOOR = { x0: -30, x1: 30, y0: 3, y1: 85, z0: 28, z1: 33, hinge: [4, 30.5], open: 90, lamp: [-14, 84, 31] };
/** The lower basket (wire, X-ray) on its rails, and the upper one (fainter), with the upper arm (glass) under it. */
export const RACK = { x0: -25, x1: 25, z0: -23, z1: 24, y0: 21, y1: 37 };
export const RACK2 = { x0: -25, x1: 25, z0: -23, z1: 24, y0: 49, y1: 64, arm: [0, 46, 0] };
/** THE GRATIN DISH, upside down in the lower basket, its soiled inside facing the arm: a glazed oven dish, solid.
 *  `rim` is the plane of its opening (facing −y), `base` its bottom (on top); tilted `tilt`° about x (front edge HIGHER: its opening looks down toward the door).
 *  The CRUST lines its inside base and runs up its walls: the signal of the film, what the jets hit. */
export const DISH = { centre: [-2, 28, 0], w: 32, d: 22, rim: 25, base: 31, wall: 0.8, tilt: 10, crust: 29.8 };

/* ───────────── THE SYSTEM (model.js) — the water circuit, solid; on the bench it stands on BENCH_FROM ───────────── */
/** The sump: a cup sunk in the tub floor (its rim at the floor, y 15), a little forward of the arm's axis. */
export const SUMP = { x: 0, z: 9, r: 7, y0: 7, y1: 15 };
/** The three filters, nested, centred on the sump: coarse (a cup with a handle, sticking out of the floor), fine
 *  (a cylinder of mesh), microfine (a flat perforated plate on the floor, with the sump's hole). */
export const FILTERS = {
  coarse: { r: 4.2, y0: 8, y1: 16, handle: 16.9 },
  fine: { r: 6.6, y0: 7.5, y1: 15.2 },
  micro: { x0: -16, x1: 16, z0: 2.5, z1: 22, y: 15.3, hole: 6.6 },
};
/** The circulation pump, in the base right of the sump: its volute (pump head) fed from the sump's side, its motor along +x. */
export const PUMP = { volute: [11, 7, 9], vr: 4, motor: { x0: 15, x1: 27, r: 4.2, y: 7, z: 9 } };
/** The tube from the volute to the arm's hub, under the tub floor (points of its centre line), radius `r`. */
export const TUBE = { r: 1.6, path: [[11, 11, 9], [9, 12.5, 3], [2, 12.5, 0], [0, 14, 0], [0, 16, 0]] };
/** THE LOWER SPRAY ARM — the heart: it turns about y on its hub at `hub`, `len` tip to tip; its nozzles on top
 *  (`jets` per side, inclined) and one at each tip, aimed sideways: their reaction turns it (no motor). */
export const ARM = { hub: [0, 17, 0], hubR: 2.5, len: 46, w: 4, h: 1.8, jets: 5, tip: 1.2 };
/** The heating element: a tube lying on the tub floor, a horseshoe around the sump and under the arm's sweep. */
export const HEATER = { r: 0.55, y: 15.8, path: [[-20, 15.8, -18], [-20, 15.8, 20], [-17, 15.8, 23], [17, 15.8, 23], [20, 15.8, 20], [20, 15.8, -18]] };
/** The inlet valve (électrovanne), in the base at the rear left: its body, its coil on top, the hose's nipple
 *  out of the back; its pipe climbs between the tub's left wall and the cabinet to the inlet `port`, low on the
 *  tub's left wall, aimed +x: the water arcs out, lands on the floor and runs into the sump. */
export const VALVE = { body: [-22, 6, -23], coil: [-22, 9.6, -23], nipple: [-22, 6, -29.5], pipe: [[-22, 6, -20], [-28.5, 7, -14], [-28.5, 18, 4], [-27, 18, 9]], port: [-27, 18, 9] };
/** The detergent dispenser on the door's inner face (door shut): its body, the TRAP over the tablet's chamber
 *  (hinged on its lower edge, it falls open toward the tub), the tablet. When the door opens, they go with it. */
export const DISPENSER = { centre: [8, 55, 26.6], w: 14, h: 9, d: 2.8, trap: { centre: [10.5, 55.5, 25.1], w: 6.4, h: 4.8, hingeY: 53.1 }, tablet: [3.6, 2.4, 1.6], lands: [10, 15.8, 21] };
/** The water's round (reponse: « …et repart ») as one line: out of the arm, up a jet to the crust, down onto the
 *  filters, into the sump, the pump, the tube, back to the hub. model.js draws it (`loop`, heads by `passes`). */
export const LOOP = [[0, 18.8, 0], [-1, 29.4, 2], [0, 22, 9], [0, 18, 9], [0, 10, 9], [11, 7, 9], [11, 11, 9], [9, 12.5, 3], [2, 12.5, 0], [0, 16, 0], [0, 18.8, 0]];
/** The system's footprint centre at its lowest point: on the bench it stands there (hero.root.position = −BENCH_FROM),
 *  and benchCut's `origin` is this point. Its size (≈ radius) sizes the bench. */
export const BENCH_FROM = [-1, 2.5, 2];
export const SYSTEM = { size: 32 };
