// DOSSIER 028 — Détecteur de CO : the plan of the set. Centimetres, y up, the floor of the flat is y = 0. No import
// here: foyer.js, model.js and world.js all read it — it is what lets them be built at the same time.
//
// THE BEDROOM IS 022's (episodes/022-batterie-telephone/src/chambre.js, imported unchanged, already dressed by its
// habillage.js): its numbers are copied below — they MUST stay equal to 022's plan.js (and to the window drawn in
// chambre.js). The phone of 022 is not in this film: world.js never mounts it, and holds chambre.js's phone numbers
// at « nothing » (no heat, no charge, the pillow flat, the charger's cable lying on the bedside table).
// The bed's head is against the BACK wall (z = −125); you sleep on your right side, facing −x, your head on the
// pillow. The window is in the +x wall.
//
// THE REST OF THE FLAT (foyer.js), all of it on the same floor, all of it an X-ray:
//   · behind the bedroom's back wall, THE CORRIDOR (z −300 … −125), where the wall BOILER hangs on its far wall,
//     behind and to the right of your head; its flue goes up through the ceiling. The bedroom's DOOR is in the back
//     wall, right of the headboard: the gas comes in through it (and the X-ray shows it through every wall).
//   · left of the bedroom (x < −190), off the corridor, THE CHILDREN'S ROOM: two small beds, two children asleep.
//   · beyond the window (x > 190), OUTSIDE: a strip of garden, the night. « Dehors » happens there.
//
// AXES AND AZIMUTH (kit/lib/stage.js, line 381, checked: the camera stands at t + d·(sin az·cos el, sin el,
// cos az·cos el)): az 0 stands at +z (the front of the bedroom, the foot of the bed, looking toward the back wall),
// az −90 at −x (the bedside table's side, the children's room behind it), +90 at +x (the window, outside), ±180
// behind the back wall (in the corridor, looking into the bedroom). The key light comes from −x, +y, +z: a camera
// between az −20 and −70 has it at its shoulder and sees your face (you face −x).
//
// ONE TRUE SCALE for the flat and the people. THE DETECTOR's parts are illustrative (sizes of a common wall unit:
// never written on screen). THE BLOOD (model.js, buildBlood) is a MAQUETTE with its own scale: no length is ever
// shown on it — a red cell is not 4 cm, a molecule is not a bead (`sources` says so).

/* ───────────── THE BEDROOM (022's chambre.js — copied, do not change) ───────────── */
/** The room: its floor is x ∈ [−190, 190], z ∈ [−125, 260]; the ceiling at y = 250. */
export const ROOM = { x: 190, z0: -125, z1: 260, h: 250 };
/** The bed: the mattress is x ∈ [−75, 75], z ∈ [−112, 92], its top at y = 52; the headboard rises to y ≈ 108. */
export const BED = { x: 75, z0: -112, z1: 92, top: 52, board: 108 };
/** The pillow (its centre), you asleep on your side facing −x (your head; chambre.js lays it at y ≈ 68), the bedside table. */
export const PILLOW = { at: [-6, 59, -78], w: 68, d: 42, t: 14 };
export const YOU = { head: [14, 68, -80], chest: [14, 60, -48], feet: [10, 58, 72] };
export const TABLE = { at: [-116, 0, -96], w: 42, d: 36, h: 58 };
/** The window of the +x wall (chambre.js, `WIN`): z ∈ [−60, 60], y ∈ [95, 205], its curtain drawn (faint lines at x = 186). */
export const WINDOW = { x: 190, z0: -60, z1: 60, y0: 95, y1: 205 };

/* ───────────── THE FLAT AROUND IT (foyer.js) ───────────── */
/** The corridor behind the bedroom: x ∈ [x0, x1], z ∈ [z0, z1] (z1 is the bedroom's back wall), ceiling `h`. */
export const HALL = { x0: -450, x1: 330, z0: -300, z1: -125, h: 250 };
/** The bedroom's door, in its back wall (z = −125), right of the headboard: open (the gas comes through). */
export const DOOR = { x0: 104, x1: 180, h: 205, z: -125 };
/**
 * The wall boiler (gas), hung on the corridor's far wall: `at` the centre of its underside, `w` × `h` × `d` its
 * casing (it stands off the wall by `d`), `burner` the centre of its burner (seen through the casing), `flue` its
 * flue: from the top of the casing straight up through the ceiling to `top`. Seen from the pillow (POSE0) it stands
 * behind your head, a little to the right, higher than it.
 */
export const BOILER = { at: [150, 118, -284], w: 44, h: 74, d: 30, burner: [150, 134, -284], flue: { r: 6, top: 330 } };
/** Where the gas leaves the boiler (its underside, the draft hood) and the path it takes to you: through the door. */
export const LEAK = { from: [150, 120, -280], door: [142, 150, -125], bed: [20, 90, -60] };
/** The children's room, left of the bedroom; its door in its back wall; two small beds (`at` = the foot of each, on the floor) and their children (heads toward −z). */
export const KIDS = {
  room: { x0: -450, x1: -190, z0: -125, z1: 140, h: 250 },
  door: { x0: -330, x1: -262, h: 205, z: -125 },
  beds: [[-395, 0, 40], [-262, 0, 40]], bed: { w: 64, d: 140, top: 38 },
};
/** Outside, beyond the window: a strip of garden (a grid, no solid ground), and where you and the children stand at the end. */
export const OUTSIDE = { x0: 190, x1: 600, z0: -260, z1: 300, me: [318, 0, 30], kids: [[282, 0, 70], [352, 0, 82]] };
/** The smoke detector, white, on the bedroom's ceiling over the bed (the comment's « détecteur blanc, au plafond »). */
export const SMOKE = { at: [0, 250, 20], r: 6.5, h: 3.4 };

/* ───────────── THE SYSTEM (model.js) — the CO detector on the bedroom's back wall ───────────── */
/**
 * The detector: a wall unit `w` × `h`, `d` deep, corners `r`. `at` is the centre of its BACK (on the wall), its
 * face toward +z (the bed): left of the headboard's middle, above it, at about 1.5 m. Its root's origin is that
 * point; on the bench the same root stands upright on its bottom edge at BENCHAT (its face toward +z).
 */
export const DETECTOR = { at: [-40, 150, -125], w: 11, h: 11, d: 4.4, r: 1.6 };
export const BENCHAT = [0, DETECTOR.h / 2 + 0.2, 0];
/**
 * The exploded view: ONE ROW across the camera, in the order the air goes through them — from the grille (−x) to the
 * battery (+x): grille · membrane · electrode (the cell) · chip · buzzer · battery. `pitch` between their centres,
 * the row at `y` (root coordinates, on the bench). Each part upright, its face toward +z.
 */
export const ROW = { order: ["grille", "membrane", "electrode", "puce", "buzzer", "pile"], pitch: 13, y: 0, z: 6 };
/** ≈ the radius of the system on the bench (assembled: 8; the exploded row is ≈ 40 each side: fs 45 for it). */
export const SYSTEM = { size: 12 };

/* ───────────── THE BLOOD (model.js, buildBlood) — a MAQUETTE ───────────── */
/**
 * A short length of blood vessel, mounted in the bedroom at your chest (`at`, room coordinates), its axis along x,
 * `len` long, radius `r`; red cells (biconcave discs of glass) drift along it, each carrying four beads — veille
 * (oxygen) or signal (CO). Its own scale: no length is ever shown on it. world.js fades the flat as it appears.
 */
export const BLOOD = { at: YOU.chest, len: 60, r: 9 };

/* ───────────── THE STORY'S NUMBERS (main.js, the header) ───────────── */
/**
 * The night's clock, in minutes after midnight: 01:48 on the first frame; « Une heure passe » → 02:50; « Dix
 * minutes. Vingt. » → 03:00, 03:10 — the alarm. Illustrative (a scenario: `sources`).
 * The CO in the bedroom's air, in ppm: ONLY 50 AND 100 ARE HELD on screen — the zones of EN 50291-1 as the makers
 * who apply it publish them (50 ppm: alarm between 60 and 90 min; 100 ppm: between 10 and 40 min). Between them the
 * readout runs, it never stops on another figure.
 */
export const STORY = { start: 108, hour: 170, alarm: 190, ppmLow: 50, ppmHigh: 100 };
