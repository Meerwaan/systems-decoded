// CR02 — Deepwater Horizon : the plan of the three maquettes. Centimetres of MAQUETTE, y up, every maquette stands on the floor y = 0.
// No import here: plateforme.js, puits.js, bop.js and world.js all read it — it is what lets them be built at the same time.
//
// « LE NOIR CHAUD » (kit/lib/reconstitution.js, docs/reconstitution.md): the studio 3D of the dossiers, turned warm. Every set is a
// maquette in satin clay (clay({ tone }), clayEdges()), under the stage's softbox key and a warm amber spot that follows stage.focus.
// Colour code (Merwan, 05/11): veille GREEN = what works (the mud column that holds, a seal that seals, the corrected BOP) ·
// alarme RED = the incident (the gas, the blowout, the part in fault) · AMBER = the time (header) and the mood. One red PART at a time
// (alarm() + setAlarm(mat, k), chosen by S.culprit); the gas and the fire are red by nature (they ARE the incident).
//
// THREE MAQUETTES, THREE PLACES. Each file builds its maquette around ITS OWN origin (local coordinates below); world.js puts the
// group at ORIGIN[name] and shows only the set that `S.set` names. Far apart: no shadow, no light crosses from one to the other.
//
// THE CUT. puits and bop are cut open by the plane x = 0 of their own frame (the −x half removed, the cut faces look toward −x:
// the bore, the fluids, the rams are seen in section). The plateforme is NOT cut: it stands whole above its sea, and the sea itself
// stops at the plane x = SEA.cut (an aquarium edge) so that a camera at x < SEA.cut sees under the surface (the riser, the seabed).
// AZIMUTH (kit/lib/stage.js l. 381: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)): az 0 stands at +z,
// az −90 at −x — FACING the cut —, ±180 at −z. A mechanism is never filmed face on: cameras sit between az −50 and −80
// (az −55 … −80 puts the lit face and the long shadow in the frame). `shift` positive moves the picture up.
//
// SCALE: MAQUETTES. A real well is ≈ 1 500 m of water and ≈ 4 000 m of rock under a 17 m BOP and a rig whose derrick rises ≈ 70 m:
// no frame holds that. Each maquette is at the scale of its subject (plateforme ≈ 1:60 with the water squashed ≈ 7 times, puits a
// SCHEMATIC column whose width is magnified ≈ 40 times against its length, bop ≈ 1:10 with the pipe magnified ≈ 3 times).
// NO size is ever written on screen; the voice gives no length; `sources` says the picture reconstitutes.

/** Where each maquette stands in the world (its local origin). */
export const ORIGIN = {
  plateforme: [0, 0, 0],
  puits: [5000, 0, 0],
  bop: [-5000, 0, 0],
};

/* ───────────── PLATEFORME (plateforme.js) — the rig at night, its sea, the riser down to the seabed, ≈ 1:60 ─────────────
   The FLOOR (y 0) is the SEABED. The sea surface is at SEA.y. A semi-submersible: two pontoons under water, columns through the
   surface, the deck, the DRILL FLOOR at its centre (the rotary table, the hole), the DERRICK (lattice tower) above it. Under the
   drill floor the moon pool; the RISER goes down from it through the water to the small BOP on the wellhead (a proxy: the true BOP
   is bop.js). The blowout: mud (and gas) out of the hole (`jet`), over the floor (`spill`), then the fire (`blast`, `fire`), then the
   sinking (`sink`). Nobody on the deck: no figure, no face. */
export const SEA = { y: 380, cut: -160, reach: 2600 }; // the surface (y), the aquarium edge (x = cut: no water toward −x), how far it runs
export const PONTOONS = { z: [-58, 58], length: 190, w: 28, y0: 326, y1: 350 }; // two, along x, under the surface
export const COLUMNS = { at: [[-62, -58], [62, -58], [-62, 58], [62, 58]], r: 12, y1: 440 }; // four columns, pontoons → deck (generic semi-submersible: reconstituted)
export const DECK = { size: [150, 22, 132], y0: 440, y1: 462 }; // the hull box (x × h × z), centred on the axis
export const DRILL = { floor: 472, half: 18, table: 4, hole: [0, 472, 0] }; // the drill floor (a raised plate, half-width), the rotary table radius, the hole
export const DERRICK = { y0: 472, y1: 600, base: 13, top: 3.5, legs: 4, bays: 9 }; // the lattice tower: half-widths at foot and crown
export const RISER = { r: 2.6, y0: 30, y1: 440 }; // the riser (magnified ≈ 3×), from the BOP top to under the deck (the moon pool)
export const SEABED_BOP = { at: [0, 0, 0], size: [16, 30, 16] }; // the BOP proxy on the wellhead (same silhouette as bop.js, simplified)
export const JET = { from: 472, to: 600, r: 3.4 }; // the mud jet: out of the hole, up the derrick axis to the crown (`jet` 1)

/* ───────────── PUITS (puits.js) — the well in section, a schematic column, + the surface instruments ─────────────
   One long vertical maquette, cut by x = 0, read from the bottom up: the RESERVOIR (the porous layer the gas comes from), the ROCK in
   strata around the CASING, the SEABED and the WELLHEAD with a SIMPLE BOP (three bands that squeeze: annular, BSR, VBR — the same
   numbers as bop.js, the same order), the RISER through the dark water, the DRILL FLOOR at the top. Inside, the DRILL PIPE down the
   axis. The FLUIDS fill the bore: heavy MUD, SEAWATER that replaces it from the top, the GAS (red) that enters at the bottom and
   climbs. At the top, the CONSOLE (two dials: the drill pipe's pressure and the kill line's — the negative test) and the EDS PANEL
   (the emergency button); the KILL LINE runs from its dial down along the riser to the BOP, the CONTROL CABLE from the EDS panel down
   the other side. At the bottom, the FLOW DIAL (an indicator of the maquette, not a rig instrument: « 10 » marked on it). */
export const COLUMN = { bore: 17, wall: 4, pipe: 4.5 }; // bore radius (fluids), tube wall, drill pipe radius — the width is magnified
export const WELL = {
  reservoir: [0, 46], // the porous layer (y): the gas enters the bore at its top
  bottom: 46, // the bottom of the bore
  seabed: 262, // the rock (strata) from `bottom` to here; the water above
  bop: [262, 318], // the simple BOP: annular band at the top, BSR band, VBR band at the bottom (bop.js order: annular · BSR · VBR)
  surface: 560, // the drill floor plate (the riser ends under it)
  top: 600, // the derrick's foot, a stub that fades into the black (the header is above)
};
export const CONSOLE = { at: [10, 588, -64], dial: 13, gap: 34 }; // the two dials side by side along z (TUBE at −gap/2, LIGNE at +gap/2), faces −x
export const EDS = { at: [10, 578, 66], button: 5 }; // the emergency panel and its button (cap radius), faces −x
export const KILL_LINE = { z: -28, r: 1.6 }; // the kill line: down along the riser on the console’s side (−z), from the LIGNE dial to the BOP
export const CABLE = { z: 28, r: 1.2 }; // the control cable: from the EDS panel down the panel’s side (+z) to the BOP (`signal` runs along it)
export const FLOW_DIAL = { at: [6, 74, 52], r: 15, max: 30, mark: 10 }; // the flow dial at the inflow, 0 … 30 barrels/min, its mark at 10
export const BALANCE = { at: [0, 46, 0] }; // the « balance » of principe: two arrows at the bottom of the bore (puits.js)

/* ───────────── BOP (bop.js) — the blowout preventer in section, ≈ 1:10: THE SYSTEM ─────────────
   On the FLOOR (= the seabed), cut by x = 0, faces toward −x. From the bottom up (CSB, Vol. 2: the order of the stack): the wellhead
   connector and the frame; the LOWER STACK — three VBR (pipe rams), the CSR (casing shear, grey, never named), the BSR (the blind
   shear ram: two blades that cut the pipe and seal); the LMRP — the lower and upper ANNULARS (rubber packers), the flex joint, the
   riser that rises into the black. The two CONTROL PODS on the LMRP's flanks (z ±), their front panels toward −x (they open: the
   27 V battery and its gauge in one, the solenoid valve with its two coils and the 9 V battery in the other). Accumulator bottles
   around the frame. The DRILL PIPE down the bore — it BUCKLES off-centre between the VBR (held) and the annular (`buckle`). */
export const STACK = { half: 30, y0: 0, y1: 160 }; // the frame's half-width (x, z) and height
export const BORE = { r: 7 }; // the bore radius (magnified)
export const PIPE = { r: 2.4 }; // the drill pipe (magnified ≈ 3×)
export const RAMS = {
  // y of each element's centre and its height (bottom → top); rams close along ±z, toward the bore
  vbr: [[26, 9], [38, 9], [50, 9]], // lower · middle · UPPER (the one that closes: `vbr`)
  csr: [63, 9],
  bsr: [77, 11], // the blades: one from −z (upper blade), one from +z (lower blade), they overlap past the centre
  annular: [[100, 16], [122, 16]], // lower · UPPER (the one closed at 21 h 43: `annular`)
  flex: [144, 12],
  riser: [156, 280], // the riser from the flex joint up into the black (fades before the header)
};
export const PODS = { at: [[10, 112, -46], [10, 112, 46]], size: [18, 30, 22] }; // [0] the battery pod (−z), [1] the valve pod (+z); size x × y × z
export const BUCKLE = { y: 80, off: 5.2 }; // where the buckled pipe is most off-centre (at the BSR) and by how much (z, toward +z)
export const RAMS2 = { bsr2: [92, 11], ring: [70, 5] }; // `depuis`: the second shear ram (above the first) and the centring ring

/* CULPRIT — the part in fault, one per set (S.culprit, S.fault lights it in alarm red; 0 = none):
   puits:  1 the LIGNE dial (« l'autre : zéro ») · 2 the EDS button (« rien ne se passe »)
   bop:    1 the upper annular (« ne scelle pas ») · 2 the drill pipe, buckled (« plié ») · 3 the 27 V battery (« vide »)
           4 the solenoid valve (« mal câblée ») · 5 the 9 V battery (« à plat »)
   plateforme: none (the jet and the fire are red by nature). */
export const CULPRIT = {
  puits: { dialLine: 1, eds: 2 },
  bop: { annular: 1, pipe: 2, battery: 3, valve: 4, pile: 5 },
};
