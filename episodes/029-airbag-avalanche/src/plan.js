// DOSSIER 029 — Airbag d'avalanche : the plan of the set. Centimetres, y up. No import here: pente.js, model.js and
// world.js all read it — it is what lets them be built at the same time.
//
// TWO FRAMES.
//  · THE SLOPE'S FRAME (pente.js draws everything in it, inside a group tilted by SLOPE about x): x across the slope
//    (+x = YOUR LEFT when you face downhill), h along the slope's normal (+ = out of the snow), s along the fall line
//    (+ = DOWNHILL). Its origin is where your boots stand on the slab's top at `travel` 0 — YOU STAY THERE: the
//    avalanche carries you, so the still mountain (grid, crown, rocks) scrolls UPHILL past you by `travel`, and the
//    flowing mass moves with you (013/015's rule: the frame is the subject's, the world comes to it). Every pose of
//    VIEW therefore stays true through the whole slide.
//  · THE WORLD'S FRAME (the camera, VIEW): the same origin, y truly up. slopePt(x, h, s) turns a point of the slope's
//    frame into the world's. The slope goes DOWN toward +z.
// Azimuth (kit/lib/stage.js: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)): az 0 stands at
// +z — DOWNHILL of you, looking up the slope at your front —, −90 at −x (your RIGHT side), +90 at +x (your LEFT,
// where the handle is), ±180 uphill, behind you. A camera looking up the slope has `el` negative.
// The key light comes from −x, +y, +z: from downhill and your right; a camera between az −20 and −70 has it at its shoulder.
//
// THE SCALE: true for you (1.76 m), your skis, the pack and the slab (≈ 40 cm, the Montana case); the slope's angle,
// the blocks, the flow's depth and the burial depth are ILLUSTRATIVE — nothing of them is ever written on screen
// (`sources` says so). The far crests and the sky are drawn at infinity.

export const DEG = Math.PI / 180;
/** The slope's angle (degrees; illustrative — a typical slab slope, never shown). */
export const SLOPE = 38;
const C = Math.cos(SLOPE * DEG);
const S = Math.sin(SLOPE * DEG);
/** A point of the slope's frame (x across, h out of the snow, s downhill) in the world's. */
export const slopePt = (x, h, s) => [x, h * C - s * S, h * S + s * C];
/** The slope's directions in the world: downhill along the surface, and its normal. */
export const DOWNHILL = [0, -S, C];
export const NORMAL = [0, C, S];

/* ───────────── THE SNOW (pente.js), in the slope's frame ───────────── */
/** The slab: a plate of cohesive snow on a weak layer. Its top is h = 0, its bed (the weak layer) h = −thick. The
 *  crown (where it breaks) runs ACROSS the slope just uphill of your heels, at s = crown; `crack` 0 → 1 runs it out
 *  from under your skis to ±halfWidth. Below the crack the slab is cut into blocks (`slab`) and slides (`travel`). */
export const SLAB = { thick: 40, crown: -35, halfWidth: 2600, top: -2500, bottom: 9000 };
/** The old snowpack under the weak layer, and the mountain: a grid that hugs the slope (no solid floor), `cell` cm. */
export const PACK_SNOW = { depth: 300, cell: 100 };
/** The flowing mass around you (it moves with you): its free surface h = 0 near you, its bed h = bed once `flow` 1
 *  (it gathers snow as it goes), across ±halfWidth, along s from −back to +ahead. */
export const FLOW = { bed: -220, halfWidth: 700, back: 900, ahead: 1400 };
/** The blocks of the broken slab, by size (cm): the big ones are bigger than you lying down, the grains small. With
 *  `sort` 1 the big ones ride the top of the flow, the small ones the bottom (inverse segregation: SLF, Mammut — the
 *  admitted principle, `sources`). */
export const BLOCKS = { big: [120, 220], mid: [40, 90], small: [8, 22], count: { big: 9, mid: 40, small: 600 } };

/* ───────────── YOU (pente.js) ───────────── */
/** You: kit/lib/figure.js (1.76 m, standing at its origin, looking toward +z — DOWNHILL —, +x its LEFT). Standing
 *  (`fall` 0) you are upright in the WORLD (gravity), boots at the origin, skis along the fall line. Knocked down
 *  (`fall` 1) you lie in the flow, chest up, head uphill. `bury` 0 → 1 takes your chest from the surface down to
 *  h = chestDown (≈ a metre of snow over you: illustrative). */
export const YOU = { height: 176, chest: [0, 128, 0], head: [0, 166.5, 1], chestDown: -135, lying: 22 };
export const SKIS = { len: 170, w: 8.5, gap: 18 };
/** The torso's own frame (figure.js: its `torso` group stands at the hips, y 90): the pack's back panel sits on your
 *  back at this point of it. pente.js puts its anchor A.pack there; world.js parents the system to it. */
export const PACK_ON_TORSO = [0, 38, -11];

/* ───────────── THE SYSTEM (model.js) — illustrative sizes, never written on screen ─────────────
   ITS OWN FRAME, the pack's: origin at the centre of the back panel (the face against your back), x across (+x =
   YOUR LEFT), y up your spine, −z away from your back (the pack stands out toward −z), +z toward your chest. On your
   back it hangs on pente.js's A.pack with no rotation; on the bench it stands at BENCHAT, its bottom on the floor. */
export const PACK = { w: 30, h: 52, d: 17 }; //            ≈ 30 L: from z 0 (the back panel) to z −d
/** The harness: two shoulder straps over your shoulders down to your chest (z ≈ +21), a chest strap, a hip belt. */
export const STRAPS = { x: 9, front: 21, shoulder: [23, 10], low: -22, chest: 2 };
/** THE HANDLE, on the LEFT shoulder strap at your sternum (the side depends on the model — the film shows one; the
 *  voice never says which). `pull` 1 draws it `pull` cm down and out along `dir`. The cable runs from it up the
 *  strap, over the shoulder and into the pack, to the trigger on the cartridge. */
export const HANDLE = { at: [9, -2, 22.5], size: [7, 3.2, 2.4], pull: 12, dir: [0.15, -0.8, 0.58] };
export const CABLE = [[9, -2, 21.5], [9, 14, 21], [9, 23, 12], [6, 21, -3], [-2, 12, -6], [-7, 10, -7]];
/** The gas cartridge (compressed gas; steel or carbon), standing in the pack against the back panel, and the trigger
 *  on its head (the pin the cable drives through the seal: `pierce`). */
export const CARTRIDGE = { at: [-7, -8, -7], r: 3.6, h: 26 };
export const TRIGGER = { at: [-7, 7.5, -7], r: 2.4, h: 4 };
/** The venturi on top: the gas jet, through a throat, pulls the air around in by side intakes (`draw`); out of it a
 *  short hose into the bag. The flows: the gas veille, the air ink — clear heads on a dark conductor. */
export const VENTURI = { at: [-7, 14, -7], r: 4.5, h: 10, intakes: 6 };
export const HOSE = [[-7, 19, -7], [-4, 22, -10], [0, 22, -12]];
/** THE BALLOON — ONE (contre-vérification: most packs have one balloon; two lobes of one balloon would hold). Folded:
 *  a flat bundle in the top compartment (`at`, `size`). Full (`bag` 1): at least 150 L (the norm's minimum — the only
 *  figure the film shows, the header's count): a thick horseshoe that rises out of the pack's top behind your head
 *  and wraps round its sides and top, the head in its hollow (tube r ≈ 15, centre line ≈ 210 cm ≈ 150 L). Your body
 *  is ≈ 70 L: with it you are « presque le triple » (a calculation, `sources`). */
export const BAG = {
  litres: 150,
  folded: { at: [1, 23.3, -10.5], size: [18, 5, 10] },
  full: { tube: 15, around: [0, 40, 10], radius: 34 }, // the horseshoe's centre line circles `around` (the head, in this frame) at `radius`
};
/** ≈ the radius of the system on the bench (the pack, its harness, the full balloon) and where it stands. */
export const SYSTEM = { size: 60, centre: [0, 30, 0] };
/** On the bench the pack's origin stands here: its bottom on the floor. */
export const BENCHAT = [0, PACK.h / 2, 0];

/* ───────────── FAR AWAY (pente.js) ───────────── */
/** The next file's teaser (030, the earth electrode: « un fil vert-jaune, sous ta maison »): far down in the valley, a
 *  chalet of glass and, under it, a line going down into the ground (veille). No colour of the real wire: we have three. */
export const VALLEY = { chalet: [600, 0, 26000], w: 900, h: 700 }; // in the slope's frame (x, h, s): on the valley floor, below
