// DOSSIER 030 — Prise de terre : the plan of the sets. Centimetres, y up. No import here:
// model.js, buanderie.js and world.js all read it — it is what lets them be built at the same time.
//
// ONE HOUSE, TWO SCALES. The laundry room (buanderie.js) is at true scale: the washing machine, the wet tiles, you,
// the socket, the consumer unit on the wall, and, cut away under the floor, the foundations and the bare copper loop
// that runs round them at the bottom of the footing trench. The SYSTEM (model.js) is the earthing chain — the earth
// screw and lug on the casing, the green-and-yellow protective conductor (PE) in the cord, the plug and the socket's
// earth pin, the consumer unit's 30 mA differential and its main earthing terminal, the earthing conductor, the test
// link, the bare copper loop. It is laid out TWICE: IN PLACE (`PLACE` below, in the laundry's frame: the real runs,
// metres long) and ON THE BENCH (`BENCH` below: the same pieces, gathered into one vertical column, top = the machine,
// bottom = the earth). Sizes of the pieces are illustrative (no drawing of a French socket or unit was read); the
// laundry's lengths are ordres de grandeur. NOTHING of any size, current or resistance is written on screen.
//
// THE LAUNDRY'S FRAME: the floor is y = 0 (tiles, wet — an X-ray: a grid, never a slab). The BACK WALL is the plane
// z = 0, the room is on the +z side (like 016). The machine stands against the back wall, its door (hublot, glass and
// plastic: NEVER live) facing +z; you stand at its right (+x), facing −x, your hand going to its top (le capot).
// The socket is low on the back wall to the machine's left; the consumer unit high on the back wall further left.
// Below the floor: the slab, then the soil; the footing runs under the back wall (z ≈ −6) and under the left wall
// (x = ROOM.x0); the loop lies at the bottom of that trench, round the house.
// Azimuth, as in kit/lib/stage.js (camera = target + d·(sin az·cos el, sin el, cos az·cos el)): az 0 stands on +z and
// looks toward −z (the back wall seen square); az −90 stands on −x (from the left wall); az +90 on +x. The key light
// comes from −x, +y, +z: the film looks from az −20 … −60, from the machine's front-left — you are at its right, the
// socket and the unit to its left on the wall: nothing stands between the camera and the machine.

/* ───────────── THE LAUNDRY (buanderie.js) — true scale ───────────── */
/** The room: x from x0 to x1, the back wall at z = 0 (its thickness behind it, toward −z), the ceiling at h. No front
 *  wall (the camera's side). The left wall is the plane x = x0. */
export const ROOM = { x0: -280, x1: 220, z1: 320, h: 250, thick: 20 };
/** The washing machine: its bottom centre, its size (w along x, d along z). Front (+z) holds the door. */
export const MACHINE = { at: [0, 0, 32], w: 60, h: 85, d: 60 };
/** The door (hublot) on the front: glass and plastic — it is NEVER the part that is live, and never the one you touch. */
export const HUBLOT = { at: [0, 50, 62], r: 17 };
/** The drum, behind the door: its axis along z. It turns (`spin`): the spin cycle, the machine shaking. */
export const DRUM = { at: [0, 50, 30], r: 24, depth: 44 };
/** The top of the machine (le capot): a metal lid at y = MACHINE.h. TOUCH is where your hand lands on it. */
export const CAPOT = { y: 85, touch: [18, 85.6, 44] };
/** THE FAULT: inside the left panel (x = −30), the phase wire's sleeve worn through, touching the casing — a light that
 *  has a place. From the camera's side (front-left) it is seen through the glass of the casing. */
export const FAULT = [-27.5, 34, 26];
/** The phase wire inside the machine: from the cord's entry (back, bottom left) up the left panel, past FAULT, to the
 *  motor under the drum. Drawn by buanderie.js (it is the machine's), dark, signal at FAULT. */
export const PHASE = [[-22, 14, 3], [-27, 22, 10], [-27.5, 34, 26], [-18, 18, 34], [-4, 14, 34]];
/** The cord leaves the back of the machine here and runs, low behind it, to the plug in the socket. */
export const CORD_IN = [-22, 14, 2];
/** The socket on the back wall, low, left of the machine: its face at z = 0 (it stands out ≈ 4 cm). Without its earth
 *  pin (`pin` 0) it is an old two-hole socket — « ce qui manque se voit sur tes prises ». */
export const SOCKET = { at: [-64, 32, 0] };
/** The consumer unit on the back wall: its box of glass (buanderie.js), its rail at `rowY` (model.js puts the 30 mA
 *  differential and the main earthing terminal in it). */
export const TABLEAU = { at: [-172, 150, 0], w: 46, h: 58, d: 10, rowY: 160 };
/** You: standing barefoot on the wet tiles, at the machine's right, facing −x; your head; your two feet; where the hand
 *  rests (`reach` 0), where it hovers above the lid (`reach` 1), where it lands (`touch` 1 = CAPOT.touch). */
export const YOU = { at: [76, 0, 50], head: [76, 163, 50], feet: [[70, 0, 40], [82, 0, 60]], rest: [64, 82, 58], hover: [20, 96, 44] };
/** The water on the floor: one wide puddle under the machine's front and under your feet (it shines, it ripples). */
export const PUDDLE = { at: [36, 0, 64], r: 75 };
/** The circuit in the back wall (phase and neutral, ink, buanderie.js): from the unit up to `run`, along, down to the
 *  socket. The PE, when it exists (`chain` 1), runs beside them: that one is model.js's. */
export const CONDUIT = { run: 214, z: -6 };

/** UNDER THE FLOOR, cut away (buanderie.js draws the slab, the soil, the footings, in glass; `under` shows them). */
export const FOUND = { slab: 18, footing: { top: -18, bottom: -92, w: 50 }, z: -6 };
/** The bare copper loop (« la prise de terre », boucle à fond de fouille) at the bottom of the trench, round the house:
 *  along the back wall (z), round the corner at x0, along the left wall toward +z. A segment of it is model.js's (see
 *  PLACE.loop); buanderie.js does not draw copper. */
export const LOOP = { y: -84, z: -6, x0: -286, corner: [-286, -84, -6] };

/* ───────────── THE SYSTEM IN PLACE (model.js, `bench` 0) — in the laundry's frame ───────────── */
export const PLACE = {
  /** the earth screw and its lug (cosse) inside the casing: back panel, top left, its face toward +z (seen past the drum) */
  cosse: [-24, 76, 4],
  /** the PE in the machine: from the lug down the back panel to the cord's entry, then inside the cord to the plug */
  pe: [[-24, 76, 4], [-24, 30, 3.5], [-22, 14, 2], [-40, 4, 4], [-60, 4, 3], [-64, 26, 5]],
  /** the plug in the socket (its face against the socket's), the socket's earth pin at the top of its two holes */
  plug: [-64, 32, 4.5], pin: [-64, 34.6, 2],
  /** the PE in the wall (`chain` 1 only): from the socket up the wall, along at CONDUIT.run, down to the unit's terminal */
  wall: [[-64, 32, -6], [-64, 214, -6], [-180, 214, -6], [-180, 188, -6], [-180, 136, 3]],
  /** in the unit: the 30 mA differential (two modules) on the rail, and below it the main earthing terminal (bar) */
  diff: [-182, 160, 4], borne: [-168, 132, 4],
  /** the earthing conductor (bare copper): from the terminal down the wall, through the test link, through the slab,
   *  down the footing to the loop */
  terre: [[-168, 132, 4], [-168, 44, 4], [-168, 0, -6], [-168, -84, -6]],
  barrette: [-168, 44, 4],
  /** the piece of the loop that model.js draws (the rest of the loop, round the house, too): it joins the conductor at
   *  `join`; it is the one the camera finds under the floor */
  join: [-168, -84, -6],
};

/* ───────────── THE SYSTEM ON THE BENCH (model.js, `bench` 1) — illustrative, never displayed ─────────────
   Its origin: the bench's centre, on the bench. ONE vertical column, read from top to bottom as the fault current
   goes: the casing, the cord, the plug and the socket, the unit, the test link, the earth. Its face toward +z. */
export const BENCH = {
  /** a stub of the machine's casing (white sheet metal, its corner), standing; the lug on its face */
  stub: { at: [0, 66, -2], size: [18, 14, 1.2] }, cosse: [-3, 64, 0],
  /** the plug and the socket, the socket on a stub of wall (a plate) */
  plug: [0, 47, 3.5], socket: [0, 47, 0],
  /** the unit: a short rail, the differential on it, the main earthing terminal under it */
  diff: [-5, 32, 0.5], borne: [6, 26, 1],
  /** the test link, then the earthing conductor down to the loop */
  barrette: [6, 15, 1],
  /** a turn of the bare copper loop lying on the bench, round a stub of footing (glass) */
  loop: { at: [4, 2, 0], r: 11 }, join: [6, 3, 4],
};
/** ≈ the radius of the system on the bench, and its centre (for the camera and the light). */
export const SYSTEM = { size: 36, centre: [0, 34, 0] };
