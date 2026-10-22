// DOSSIER 024 — Bloc opératoire : the plan of the sets. Centimetres, y up. No import here:
// model.js, bloc.js and world.js all read it — it is what lets them be built at the same time.
//
// ONE SCALE, TRUE FOR THE ROOM, ILLUSTRATIVE FOR THE SYSTEM. The operating room, its table, you, the lamp, the
// ventilator, the surgeon and the faulty appliance are at true scale (ordres de grandeur). The system's parts (the
// isolation transformer, its breakers, the insulation monitor, the earth bar) have illustrative sizes: no medical
// IT panel was read in detail (docs/faits/024-bloc-operatoire.md, « Non trouvé »). NOTHING of any size, current or
// resistance is ever written on screen: the NF C 15-211 was not read, no value is given to « la norme française ».
//
// THE ROOM'S FRAME (bloc.js): the floor is y = 0. The table's long axis is x; YOUR HEAD IS AT −x (the anaesthesia
// side, the ventilator there), your feet at +x. The room is open toward +z: that is the camera's side. The BACK WALL
// is the plane z = ROOM.z0 (behind the surgeon, facing the camera); behind it, in a technical space, the IT
// cabinet that holds the system. The camera looks from +z, from the left: `az` −20 … −50 stands at −x / +z
// (three quarters from the head end, where the key light falls) and looks toward +x / −z — the appliance and the
// cabinet are placed there, BEYOND the table, so that nothing stands between the camera and you.
// Azimuth, as in kit/lib/stage.js (camera = target + d·(sin az·cos el, sin el, cos az·cos el)): az 0 stands on +z
// and looks toward −z (the room seen square from the front); az −90 stands on −x (from the head end); az +90 on +x
// (from the feet); az ±180 behind the back wall, looking back into the room.
//
// HOME (« chez toi ») is NOT modelled here: it is the room of 016 reused as it is (episodes/016-disjoncteur/src/
// wall.js and its breaker), in 016's own frame, at the origin — the two sets are never visible together.

/* ───────────── THE OPERATING ROOM (bloc.js) — true scale ───────────── */
/** The room: x from x0 to x1, the back wall at z0, the ceiling at h. No front wall (the camera's side). The floor is a
 *  GRID (an X-ray has no solid floor). */
export const ROOM = { x0: -340, x1: 340, z0: -260, z1: 300, h: 300 };
/** The operating table: its top (len along x, w along z) at height `top`, one central column. */
export const TABLE = { at: [0, 0, 0], len: 205, w: 56, top: 92, col: [40, 30] };
/** You, asleep on your back on the table, a body of glass: head at −x, feet at +x. `chest` is where the breathing
 *  shows (it rises with the ventilator); `mouth` where the ventilator's tube arrives. */
export const YOU = { head: [-80, 104, 0], chest: [-38, 106, 0], feet: [92, 98, 0], mouth: [-84, 110, 4] };
/** The operating lamp (scialytique): its arm from a ceiling pivot, its head — a wide disc, solid, its face lit —
 *  above your chest; it throws a pool of light on the table. « Une lampe qui s'éteint » / « La lampe éclaire ». */
export const LAMP = { pivot: [-10, 300, -70], head: [-20, 198, 0], r: 34 };
/** The ventilator (anaesthesia workstation) at the head end, a little behind: a cart with its BELLOWS in a glass
 *  column (they rise and fall: « le respirateur tourne »), its screen, its tube to your mouth. */
export const RESP = { at: [-155, 0, -70], size: [60, 130, 50], bellows: [-155, 118, -42], r: 10, h: 30 };
/** The surgeon: standing on the far side (−z) facing +z (toward the camera, across you), hands above your belly. */
export const SURGEON = { at: [12, 0, -62], hands: [12, 112, -12] };
/** THE FAULTY APPLIANCE (« dans un appareil, un fil touche le métal »): a box on a cart, at the foot end, beyond the
 *  table. Its METAL CASING (la carcasse: glass in the X-ray, its edges solid), inside it ONE wire, dark, whose sleeve
 *  is worn at FAULT, where it touches the casing — a light that has a place, signal. FAULT is on the casing's inner
 *  face toward +z (the camera's side). Its cord runs to the IT sockets on the back wall. */
export const DEVICE = { at: [150, 0, -105], cart: [56, 92, 46], box: [46, 18, 38] };
export const FAULT = [138, 103, -88];
/** The IT sockets on the back wall, behind the appliance (and a second pair behind the ventilator). */
export const SOCKETS = [[150, 120, -258], [-150, 120, -258]];
/** The alarm repeater (report d'alarme) on the back wall: a small panel, its light and its buzzer — « une alarme, dans
 *  la salle ». Between the surgeon's head and the appliance, seen over the table. */
export const REPEATER = { at: [85, 182, -258], size: [22, 14, 4] };
/** The IT cabinet, behind the back wall in the technical space (right-back corner): a glass cupboard; the system
 *  stands in it on a shelf at MOUNT. Seen from the room THROUGH the back wall. */
export const CABINET = { at: [255, 0, -300], w: 100, h: 230, d: 60 };
export const MOUNT = [250, 92, -300];
/** The IT circuit in the walls: from the cabinet's outlet (the system's OUT, in the room's frame) along the back wall
 *  at height `run`, down to each socket; and up to the lamp's ceiling pivot. `current` flows along it (ink heads);
 *  `seek` runs a veille head from the cabinet to the faulty appliance's socket (« le défaut sera cherché »). */
export const CONDUIT = { run: 240, z: -262 };

/* ───────────── THE SYSTEM (model.js) — illustrative sizes, never displayed ─────────────
   Its origin: the bottom centre of its shelf; its FRONT faces +z (the room, the camera). Left to right: the mains
   come in (−x), the isolation transformer, then up to the rail (its breakers and the insulation monitor), and the
   circuit leaves toward +x. The earth bar runs along the bottom. */
/** The isolation transformer: a U–I core standing up, its two legs `legs` apart, and on each leg ITS winding — the
 *  PRIMARY on the left leg (the mains), the SECONDARY on the right one (the circuit): two coils that do not touch.
 *  Its casing (`cover`) is a box around it, removed in the exploded view. */
export const XFO = { at: [-16, 0, 0], core: [32, 38, 12], legs: 22, coil: { r: 7.5, h: 22, y: 19 }, cover: [42, 46, 26] };
/** The mains cable coming in from −x to the primary (three conductors: two live and the earth, which goes to EARTH). */
export const MAINS = { from: [-50, 20, 0] };
/** The DIN rail above the transformer: the two breakers of the secondary circuit (they trip at the SECOND fault), and
 *  the insulation monitor (contrôleur permanent d'isolement, CPI): a 4-module box, its bar gauge (NO figure), its
 *  LED, its test button. It is wired to the two conductors and to the earth bar. */
export const RAIL = { y: 56, x0: -6, x1: 34, z: 6 };
export const BREAKERS = { at: [2, 56, 6], w: 3.6, h: 9 };
export const CPI = { at: [22, 56, 6], w: 7.2, h: 9 };
/** The circuit leaves the rail toward +x at OUT (in the room it continues into the walls — bloc.js; on the bench it
 *  runs to the two casings). */
export const OUT = [36, 64, 3.6];
/** The earth bar: along the bottom, the casings' protective conductors (PE) and the CPI's earth wire land on it. */
export const EARTH = { y: 3, x0: -30, x1: 56, z: 10 };
/** ON THE BENCH ONLY: the circuit's two conductors run to two stubs of appliance casings (carcasses), each with its
 *  PE to the earth bar. Casing A takes the first fault (on conductor 1), casing B the second (on conductor 2). */
export const CASE_A = { at: [50, 40, 0], size: [12, 10, 10] };
export const CASE_B = { at: [50, 18, 0], size: [12, 10, 10] };
/** « Chez toi » on the bench (`home` 1): the link that ties one side of the secondary to the earth bar (as the neutral
 *  is at home), and a ghost differential on the line, on the rail between the breakers and the CPI's right. */
export const LINK = { from: [-5, 8, 0] };
export const GHOST = { at: [32, 56, 6], w: 3.6, h: 9 };
/** The tiny return path of the medical IT (« le chemin de retour est minuscule »): the cables' capacitance to earth,
 *  drawn as three small marks between the conductors' run and the earth bar, at these x. */
export const CAPS = { xs: [38, 42, 46], y0: 6, y1: 55 };
/** ≈ the radius of the system on the bench, and its centre in its own frame (for the camera and the light). */
export const SYSTEM = { size: 45, centre: [10, 30, 0] };
/** On the bench the root stands on the origin. */
export const BENCHAT = [0, 0, 0];
