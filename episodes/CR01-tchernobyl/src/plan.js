// CR01 — Tchernobyl : the plan of the four maquettes. Centimetres, y up, every maquette stands on the floor y = 0.
// No import here: coeur.js, canal.js, centrale.js, salle.js and world.js all read it — it is what lets them be built at the same time.
//
// « LA RECONSTITUTION » (kit/lib/reconstitution.js, docs/reconstitution.md): no glass, no X-ray. Every set is an investigators'
// MAQUETTE in matte clay (clay(), clayEdges()), under ONE hard light from the side (dir [-1, 0.36, 0.3]: from −x, a little +z,
// ≈ 19° high). The ONE part in fault glows red (alarm() + setAlarm(mat, S.fault)) — one red thing in the frame at a time; no green
// before `depuis` (heal()).
//
// FOUR MAQUETTES, FOUR PLACES. Each file builds its maquette around ITS OWN origin (local coordinates below); world.js puts the
// group at ORIGIN[name] and shows only the set that `S.set` names. Far apart, so a shadow or a light never crosses from one to
// the other.
//
// THE CUT. Every maquette is cut open by the plane x = 0 of its own frame (the coeur and the canal literally: their x < 0 half is
// removed and the cut faces look toward −x; the centrale and the salle are open toward −x, like a doll's house). The key light
// comes from −x: the cut faces are lit.
// AZIMUTH (kit/lib/stage.js, l. 381: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)): az 0 stands at +z,
// az −90 at −x — FACING the cut —, ±180 at −z. A mechanism is never filmed face on: the cameras sit between az −50 and −80
// (the DA's bench: −55 … −80 puts the lit face and the long shadow in the frame; toward +60 the maquette is against the light).
//
// SCALE: MAQUETTES. A real RBMK core is 11.8 m wide and 7 m tall, a channel 7 m tall and 9 cm wide: no frame holds both. Each maquette
// is at the scale of its subject (the coeur ≈ 1:10, the canal a slice magnified and squashed ≈ 6 times in height, the centrale ≈ 1:50,
// the salle ≈ 1:1). NO size is ever written on screen; the voice gives the true orders of magnitude; `sources` says the picture
// reconstitutes. The proportions INSIDE the canal's rod follow the true ones (water 1.25 m · graphite 4.5 m · water 1.25 m over 7 m)
// — never said, never labelled (⚠ docs/faits/CR01-tchernobyl.md).

/** Where each maquette stands in the world (its local origin). */
export const ORIGIN = {
  coeur: [0, 0, 0],
  canal: [4000, 0, 0],
  centrale: [-4000, 0, 0],
  salle: [0, 0, -4000],
};

/* ───────────── COEUR (coeur.js) — the RBMK core in section, ≈ 1:10 ─────────────
   The graphite stack (a cylinder of square columns), the lower plate under it, the UPPER SLAB (« un disque géant ») on top, the
   channel pipes rising above the slab, the concrete vault around, all cut by x = 0 (the −x half removed). The control rods come
   down from above through the slab. The light of the power lives INSIDE the stack: its lower half (`pLow`) and upper half (`pHigh`). */
export const CORE = { r: 59, y0: 40, y1: 110, column: 6 }; // the graphite stack (Ø 118 × 70) and the width of one column
export const SLAB_LOW = { r: 74, y0: 26, y1: 40 };
export const SLAB_TOP = { r: 86, y0: 110, y1: 140, lift: 150 }; // « un disque géant »; `slab` 1 lifts it by `lift` (shape of the flight: reconstituted)
export const PIPES = { y0: 140, y1: 182, count: 14 }; // the channel pipes above the slab (few and thick: 57 thin ones make a grey slab)
export const VAULT = { half: 120, y1: 190, wall: 14 }; // the concrete cavity: square footprint 240 × 240, open toward −x
export const RODS = { count: 9, travel: 70, park: 112 }; // rods in the cut face; their tips park at `park` (just inside the slab) when out, travel = the core's height
export const FLOOR_COEUR = 0;

/* ───────────── CANAL (canal.js) — ONE slice of the core, magnified: the physics ─────────────
   Three graphite columns side by side ALONG Z, cut open by x = 0: a FUEL channel (z −44), the ROD channel (z 0), a second FUEL channel
   (z +44). Inside the fuel channels: the fuel column, the water around it that boils into vapour. Inside the rod channel: water, and
   the ROD — from the top: the absorber (B4C, darkest), a water column, the graphite DISPLACER (the part in fault), a water column at
   the bottom. Neutrons are points of light that fly, split atoms, are swallowed. */
export const SLICE = { y0: 30, y1: 210, column: 44, depth: 44 }; // the core zone of the slice (180 tall), column width (z) and depth (x)
export const FUEL = [-44, 44]; // z of the two fuel channels
export const CHANNEL = { r: 12, fuel: 5.5 }; // channel tube radius (wall included) · fuel column radius: the water / vapour ring between
export const ROD = {
  z: 0, r: 7.5,
  // withdrawn (`rod` 0), from the top of the core zone down: water 32 · displacer 116 · water 32 (true ratios 1.25 · 4.5 · 1.25 over 7 m)
  waterTop: 32, displacer: 116, waterLow: 32,
  absorber: 132, // parked above the core zone when withdrawn (its tip at SLICE.y1)
  travel: 180, // `rod` 1 = the absorber's tip at the bottom of the core zone
  expel: 32 / 180, // ≈ 0.18: at this `rod` the displacer's foot reaches the bottom — the bottom water is gone (the moment of `defaut`)
};
export const SLAB_CANAL = { low: [0, 30], top: [210, 240] }; // the plates the slice stands between (y)
export const DRIVE = { y0: 240, y1: 400 }; // the rod's tube above the slab, where the absorber waits (fades into black before the header)

/* ───────────── CENTRALE (centrale.js) — the plant on a table, ≈ 1:50 ─────────────
   Open toward −x. From the reactor to the network: the reactor building, the circulation pumps, the TURBINE and its generator (the
   flywheel of the test), the emergency DIESELS, the EMERGENCY CORE COOLING (its valve: the part in fault), the pylons that leave. */
export const PLANT = {
  table: [380, 260], // footprint x × z, centred on the origin
  reactor: { at: [-130, 0, -10], size: [90, 80, 90] }, // the reactor building (a block: the coeur is elsewhere)
  pumps: { at: [-40, 0, -10], count: 4, r: 9, h: 22, gap: 24 }, // in a row along z
  turbine: { at: [70, 26, -10], length: 170, r: 20, gen: 50 }, // shaft along x; the generator is its +x end
  diesels: { at: [80, 0, 95], count: 3, size: [36, 22, 24], gap: 40 }, // in a row along x
  eccs: { at: [-120, 0, 95], tanks: 2, valve: [-75, 18, 95] }, // tanks and THE valve on the pipe to the reactor
  mains: { at: [40, 0, -125], pylons: 3, h: 70, gap: 90 }, // the line leaves toward −z then +x
};

/* ───────────── SALLE (salle.js) — the control room of unit 4, reconstituted, ≈ 1:1 ─────────────
   Seen from −x, from behind the operators: the curved DESK (its button AZ-5, the row of protection keys), the BOARD of rod positions
   on the wall behind it (a disc of small dials), silhouettes standing at the desk. Nobody presses the button on screen. */
export const ROOM = {
  desk: { at: [150, 0, 0], r: 320, arc: 70, h: 92, depth: 70 }, // an arc of `arc` degrees, centred on the x axis, facing −x
  az5: [138, 94, -46], // the button on the desk top (cap Ø ≈ 7: bigger than true, the picture needs it)
  keys: { at: [138, 94, 34], count: 5, gap: 9 }, // the protection keys and their lamps, along z
  board: { at: [330, 175, 0], r: 115, dials: 72, wall: [340, 320] }, // the disc of dials on the wall (faces −x)
  crew: [[62, 0, -88], [50, 0, 28], [70, 0, 124]], // three silhouettes, backs to the camera (no hand near the button)
};
