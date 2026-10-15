// DOSSIER 022 — Batterie de téléphone : the plan of the set. Centimetres, y up. No import here: chambre.js,
// model.js, pores.js and world.js all read it — it is what lets them be built at the same time.
//
// THE ROOM (chambre.js): a bedroom at night, seen like an X-ray. The floor is y = 0. The bed stands against the
// back wall (−z), its head there; you sleep in it, your head on the pillow. UNDER the pillow, on the camera's side
// of your head, the phone charges; its cable runs to a socket in the back wall, above the bedside table (−x).
// The camera mostly stands on the −x / +z side (az −20 … −60), where the key light falls: it sees the pillow,
// your head beyond it, the bedside table on the left.

/** The room: its floor is x ∈ [−190, 190], z ∈ [−125, 260]; the bed's head against the −z wall. */
export const ROOM = { x: 190, z0: -125, z1: 260, h: 250 };
/** The bed: the mattress is x ∈ [−75, 75], z ∈ [−112, 92], its top at y = 52. */
export const BED = { x: 75, z0: -112, z1: 92, top: 52 };
/** The pillow (its centre, lying on the mattress), and how far it rises when it is taken off the phone (`pillow` 1). */
export const PILLOW = { at: [-6, 59, -78], w: 68, d: 42, t: 14, lift: 26 };
/** You, asleep on your side, facing −x (the phone, the camera): where your head lies, where your feet are. */
export const YOU = { head: [14, 63, -80], feet: [10, 58, 72] };
/** The bedside table (its top at y = `h`) and the socket above it, in the back wall. */
export const TABLE = { at: [-116, 0, -96], w: 42, d: 36, h: 58 };
export const SOCKET = [-116, 86, -124];
/**
 * Where the phone lies (the origin of the system: the centre of its underside), for `place` 0 · 1 · 2:
 * under the pillow · on the bedside table, in the open · on the bare floor, away from the bed and from anything
 * that burns. It never turns: its long axis stays along x, its port toward −x (the table, the socket).
 */
export const SPOTS = [[-24, 52, -76], [-116, 58, -92], [-120, 0, 150]];
const ARC = [16, 30]; // how high it is carried on the way from one spot to the next
/** The phone's place for any `place` between 0 and 2 (it is carried along an arc): world.js mounts the system there, chambre.js ends the cable there. */
export function phoneSpot(place, out = [0, 0, 0]) {
  const p = Math.min(2, Math.max(0, place));
  const i = Math.min(1, Math.floor(p));
  const u = p - i;
  const a = SPOTS[i];
  const b = SPOTS[i + 1];
  out[0] = a[0] + (b[0] - a[0]) * u;
  out[1] = a[1] + (b[1] - a[1]) * u + Math.sin(Math.PI * u) * ARC[i];
  out[2] = a[2] + (b[2] - a[2]) * u;
  return out;
}

// THE SYSTEM (model.js): a phone of no brand at all — a rounded slab, no logo, no recognisable camera island —
// lying flat, its back up. Its root's origin is the centre of its underside; its long axis is x. It opens on its
// battery; the battery opens on its layers; at the battery's −x end, the little protection board.
/** The phone: `w` along x, `d` along z, `t` thick; `r` the radius of its corners. */
export const PHONE = { w: 15.2, d: 7.2, t: 0.85, r: 0.9 };
/** The charging port, at the −x end (root coordinates). */
export const PORT = [-7.6, 0.42, 0];
/** The battery (its centre, assembled) — a flat pouch — and the protection board at its −x end. */
export const BATT = { at: [0.9, 0.44, 0], w: 9.6, d: 5.6, t: 0.5 };
export const BOARD = { at: [-4.5, 0.44, 0], w: 0.9, d: 5.0, t: 0.3 };
/** `explode` 1: the battery (and its board) has risen to y = `battery`, the back to y = `back`; the body stays down. */
export const OPEN = { battery: 4.6, back: 9.2 };
/**
 * `unroll` 1: the outer end of the wound layers has come off the battery's +x end, a tongue `len` long lying along
 * +x, its three sheets fanned `fan` apart in y — from the bottom: copper (coated), the film, aluminium (coated).
 * The film is a little wider than the metal. The winding axis is z: the turns show on the battery's +z side.
 */
export const TONGUE = { from: [5.7, 0, 0], len: 8.5, fan: 1.3 };
/** Where the battery is damaged (`dent`), and where its hot point is born (`spot`) — root coordinates, assembled. */
export const DENT = [3.4, 0.44, 1.5];

// THE PORES (pores.js): the film between its two electrodes, seen from very close. IT IS A MAQUETTE, with its
// own scale — a pore is not a round hole, a film is not this thick: NO LENGTH IS EVER SHOWN ON IT. world.js mounts
// it on the system — its own origin, the middle of the film, at `at` counted from the system's; when `micro` is 1 it is all there is (the phone, the room have dissolved).
// From the top: the upper electrode (the aluminium side), the liquid, the film and its pores, the liquid, the lower
// electrode (the copper side). In charge the lithium goes DOWN through the pores.
// A sandwich hides its filling: the upper electrode is CUT AWAY — it only covers the back of the patch (z < `cut`),
// its cut face toward us — so that the film's upper face and its pores are in full view. The film is translucent:
// the hot point, born on the lower electrode's face, glows THROUGH it.
/**
 * `w` × `d`: the patch of film shown (x, z); `film` its thickness; `gap` from the film's faces to each electrode;
 * `slab` the thickness of an electrode; `cut`: the upper electrode only covers z < cut; `pores` how many holes
 * across x and z (readable: ≥ 12 px each on a 405 px frame at VIEW.film); `hot` where the hot point is born, on the
 * lower electrode's face (x, z from the centre); `hair` a human hair for scale, lying along x IN FRONT of the patch
 * at the film's height (its centre, from the maquette's): its thickness against the film's edge — a few times
 * thicker, an order of magnitude only.
 */
export const MICRO = { at: [0, 6, 0], w: 16, d: 9, film: 0.5, gap: 2.4, slab: 2, cut: -0.8, pores: [9, 5], hot: [3, 1.6], hair: { r: 1.1, at: [0, 0, 6.4] } };

// THE RANKS (chambre.js): « un modèle entier » — the same phone, hundreds of times, lying on the bench's floor in
// rows that run away toward −z. The slot (0, 0) is the system's own: it stays empty.
/** Slot (i, j): x = i · pitch[0], z = −j · pitch[1], i ∈ [−half, half], j ∈ [0, rows). */
export const RANKS = { pitch: [21, 12], half: 4, rows: 46 };

/** ≈ the radius of the system on the bench (exploded, its tongue out). */
export const SYSTEM = { size: 11 };
/**
 * The header's thermometer, in degrees Celsius. ONLY `melt` IS SOURCED (« vers cent trente degrés », 130–140
 * depending on the material); every other value is illustrative — it is shown with « ≈ », it runs, it is never
 * held on a figure while a sentence states a threshold.
 */
export const TEMP = { rest: 25, first: 34, melt: 130 };
