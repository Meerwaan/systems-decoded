// DOSSIER 046 — Torchère : where everything stands. No import: model.js, flamme.js, raffinerie.js and world.js all read it.
//
// THE SCALE IS A MAQUETTE (sources says so): a real flare stack is « plusieurs dizaines de mètres, parfois plus de cent »,
// stands well away from the units, and its knock-out drum is a few metres long. That does not fit one vertical frame with
// its system, so everything here is a maquette at the scale of the subject — the stack 18 m, the columns 11 to 15 m, the
// whole flare network from the columns to the stack ≈ 23 m long: the network fills the 3D zone of the frame (1080 × 720 px,
// landscape) seen broadside (VIEW.exploded), checked on bouchons. NO length, height or pressure is ever shown.
//
// Centimetres, Y up, the ground at y 0. THE ORIGIN is the foot of the flare stack. The gas runs toward +x: the three
// columns and their relief valves at −x, the header (collecteur) on its pipe rack, the knock-out drum (ballon), the
// water seal (garde hydraulique) at the foot of the stack, the stack, the tip and its pilots, the flame above it.
//
// AZIMUTH (kit/lib/stage.js l. 381, checked: the camera stands at t + d·(sin az·cos el, sin el, cos az·cos el)):
//   az 0 stands on +z, −90 on −x (the columns' side), ±180 on −z, +90 on +x (beyond the stack).
//   The key light comes from −x, +y, +z. With az ≈ −40 the screen's right is ≈ +x+z: the gas path reads LEFT → RIGHT,
//   columns on the left, stack on the right. Seen from az ≈ +140…+170 (from beyond the stack, into the light) the
//   stack stands dark against the columns and the key: the contre-jour of the hook.

export const GROUND = { y: 0, half: 4200 }; // the X-ray grid around the plant (half-width)

/* ── the flare network: THE SYSTEM, solid (model.js) ── */
export const STACK = { at: [0, 0], r: 70, y0: 0, y1: 1800 }; // the stack (cheminée): a tube on its foot, plain, dark on its halo
export const TIP = { y0: 1800, y1: 1930, r: 92 }; // the flare tip: a wider head, its wind shield
export const PILOT = { at: [-78, 1945, 62], r: 9, count: 3 }; // the hero pilot (on the camera's side for az ≈ −40), two more round the tip
export const FLAME = { base: 1940, len: 1500, r: 260 }; // where the flare burns: from just over the tip, up to `len` at flare 1, `r` its width there
export const SEAL = { at: [-430, 0], r: 135, y0: 0, y1: 430, water: 230, dip: 150 }; // the water seal: a standing drum, water to y 230, the dip pipe down to y 150
export const KO = { at: [-1050, 270, 0], r: 170, len: 700, level: 95 }; // the knock-out drum, lying along x (centre, radius, length); liquid up to `level` over its bottom
export const HEADER = {
  r: 46, // the header's radius (the biggest pipe of the network)
  y: 620, // the height of the pipe rack
  manifold: { x: -1850, z: [-760, 760] }, // the common pipe along z, where every relief line comes down
  // the gas path, a polyline: manifold → along x on the rack → down into the KO drum (inlet top) | out of it (outlet top)
  // → into the seal (dip pipe) | out of the seal top → the stack's foot. `flow` 0 → 1 runs along it (FLOWAT).
  path: [
    [-1850, 620, 0], [-1340, 620, 0], [-1340, 450, 0], // into the drum (inlet on its top)
    [-760, 450, 0], [-760, 560, 0], [-430, 560, 0], [-430, 150, 0], // out of the drum (outlet on its top), down the dip pipe
    [-430, 380, 0], [-320, 340, 0], [-70, 340, 0], // out of the seal, into the stack's foot
    [0, 340, 0], [0, 1930, 0], // up the stack to the tip
  ],
};
/** `flow` (0 → 1) at each step the voice names: the gas has reached… */
export const FLOWAT = { valves: 0, header: 0.12, drum: 0.36, drumOut: 0.46, seal: 0.55, sealOut: 0.66, stack: 0.72, tip: 1 };
export const VALVES = [ // the three relief valves (soupapes), one per column, high on its side, their outlet toward +x
  { col: 0, at: [-1965, 1150, -760] },
  { col: 1, at: [-1930, 1350, 0] },
  { col: 2, at: [-1990, 1000, 760] },
];

/* ── the refinery: X-RAY (raffinerie.js) ── */
export const COLUMNS = [ // the three columns the valves protect (glass, their inside fills signal with `press`)
  { at: [-2150, -760], r: 150, h: 1300 },
  { at: [-2150, 0], r: 185, h: 1500 },
  { at: [-2150, 760], r: 125, h: 1150 },
];
export const COMPRESSOR = { at: [-1500, 0, 1250], len: 520, r: 95, motor: [-1985, 1250], axis: "x" }; // solid: casing on its skid, the motor at −x, the rotor along x
export const RACK = { from: -1850, to: -1340, y: 620, every: 250, half: 120 }; // the pipe rack under the header (glass portals)
export const UNITS = { from: -4600, to: -2800 }; // the rest of the plant behind the columns: low glass blocks, tanks, more columns
export const PANE = { at: [2300, 1450, 2700], w: 220, h: 160, look: [0, 1400, 0] }; // the flat's window (like): a building of glass, the torch beyond
/** The next file's teaser (047, lave-vaisselle), on its own floor far from the plant: an X-ray dishwasher, its spray arm. */
export const TEASER = { at: [0, 0, 24000], size: [60, 85, 60], arm: { y: 52, len: 42 }, lower: { y: 14, len: 46 } };

/* ── the bench ── */
/** Where the bench's pool lies (the middle of the network): the system is re-parented IN PLACE (world.js), no offset. */
export const BENCHAT = [-1000, 0, 0];
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const NETWORK = { size: 1250, centre: [-1000, 950, 0] };
