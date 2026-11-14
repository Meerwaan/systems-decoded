// DOSSIER 051 — Le brise-glace : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js, glace.js, banquise.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The ICE: the Antarctic pack under a dark sky, a low signal glow on the horizon (the threat) — the field
// and its floes (banquise.js), the trapped ship « ton navire » seen like an X-ray with glass people on its deck, and
// the ice at the bow that bends, cracks, piles into ridges (glace.js); in the middle of it, SOLID on its own pool of
// light, the system: the icebreaker (model.js). The BENCH: that same icebreaker alone on its pool, out of the water
// — its ice belt, its heeling tanks, its stem. ONE object, re-parented: the cut from one to the other matches on it,
// in place (the bench floor is lowered to the keel: the ship keeps the same coordinates on both sets).
// Three colours. signal is the threat: the horizon, the pack closing, the ridges pressing on the hull, the « presque
// droite » stem that only crushes. veille is the system alive: the belt, the water of the tanks, the weight laid
// on the ice, the crack that it opens. ink is the rest: the ice, the trapped ship, the lines.
//
// THE STORY (docs/faits/051-brise-glace.md; the image reconstructs, `sources` says so): Antarctica, Christmas 2013,
// a ship with 52 passengers caught in the pack; the Xuelong comes for it, stops ≈ 11 km away, and is caught in turn
// (six days, wind and tide). Act 3 is NOT the Xuelong: it is an icebreaker in general — the Oden's tanks, its
// 15-second roll, backing off and ramming. Same model, the chips name which ship it is. No angle of heel, no pump
// flow, no gesture of a real crew. Nobody is hurt.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { SHIP, SHOK, APART, SIZE as SHIP_SIZE, BENCH_FLOOR, STEM } from "./plan.js";
import { buildShip } from "./model.js";
import { buildGlace } from "./glace.js";
import { buildBanquise } from "./banquise.js";

const DEG = Math.PI / 180;
export const SET = { BENCH: 0, ICE: 1 };
/** ≈ the ship's half-length: sizes the bench, its light, its shadows. */
export const SIZE = SHIP_SIZE;
/** Where the trapped ship stands in the ship frame, for a given `apart` (m) and `run` (m): poses near it use it. */
export const shokAt = (apart, run = 0) => [SHOK.x, SHOK.deck, -apart * 100 + run * 100];

/** The studio (kit/lib/stage.js). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens on the CLOSE-UPS only (the poses that spread CLOSE): the stem and its plate, a tank, the belt
 *  `air`    off until a before / after planche shows a net gain at 270 px (the horizon glow is the candidate)
 *  `finish` the solids' surface (the hull plating, the stem) */
export const LOOK = { dof: 6, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// The first frame is the hook, « La glace se referme sur ton navire » : at the ice's level, low, past the trapped
// ship's X-ray hull — floes sliding in and closing on it — and behind it, small but readable, the icebreaker's solid
// bow coming, then stopping, the ice closing in its wake; the signal glow of the horizon behind both.
// PROVISIONAL (set on BOUCHONS): the planche of the six-point candidates (docs/051-actes.md) chooses it.
export const POSE0 = { tx: -3608, ty: 450, tz: -120095, d: 10050, az: -172.1, el: 6, fov: 40, shift: 150, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.ICE,
  /* ── the field (banquise.js) ── */
  shell: 1, //   the X-ray of the trapped ship and the field's fine lines (0–1)
  close: 0.55, // the pack: 0 loose floes, leads of black water between them → 1 compact (≈ 100 %), no water left
  wake: 0.6, //  the channel behind the icebreaker: 1 open (black water, broken blocks) → 0 closed again
  run: 0, //     metres the icebreaker has gone into the ice: the ice (field, floes, ridges, the trapped ship) slides by +run in z
  apart: APART.hook, // metres from the icebreaker to the trapped ship (≈ 1 200 in the hook and the loop, ≈ 11 000 in the top view) — changes on a cut only
  shok: 1, //    the trapped ship, X-ray (0–1)
  crowd: 1, //   the glass people on its deck (0–1)
  line: 0, //    the distance line from the icebreaker's bow to the trapped ship, and the two ships' map beacons (0–1)
  wind: 0, //    the easterly: long arrows over the pack, pushing it against both ships (0–1)
  heli: 0, //    the helicopter over the trapped ship (the comment's duel) (0–1)
  /* ── the ice at the bow (glace.js; `ridge` and `close` are read by banquise.js too) ── */
  ridge: 0, //   pressure ridges piling along BOTH flanks, pressing on the hull (0–1)
  crest: 0, //   the ridge ahead of the bow (ice frame: RIDGE.ahead), the one act 3 rams (0–1)
  grip: 0, //    the ice pressed against the plating (1) → released, a hand of black water off the hull (0)
  bend: 0, //    the plate under the stem bends down (0 → 1 its full sag, before it breaks)
  crack: 0, //   it splits: cracks run across and along it, then it is blocks (0 → 1)
  crush: 0, //   the « presque droite » stem's only effect: the edge crumbles in place, nothing gives (0 → 1)
  tumble: 0, //  the broken blocks turn on edge and slide down along the hull, under it (0 → 1)
  slab: 0, //    on the bench: the plate of the principle under the stem (0–1)
  /* ── the icebreaker (model.js) ── */
  explode: 0, // on the bench: 0 assembled → 1 its parts apart (the belt off the hull, the tanks out of it, the stem forward)
  litBelt: 0, litTanks: 0, litStem: 0, // the part the voice names glows veille (the stem: « le cœur »)
  straight: 0, // 0 its 20° stem · 1 the « presque droite » stem (≈ 82°, signal) in its place, same waterline point
  push: 0, //    the weight the stem lays on the ice: a veille arrow, down — with `straight` 1, a signal arrow, forward (0–1)
  section: 0, // the transverse cutaway amidships: 0 whole → 1 the aft half gone, the section capped (tanks and belt seen)
  tanks: 0, //   the water of the heeling tanks: −1 all in the PORT ones · 0 even · +1 all STARBOARD
  pump: 0, //    the flow in the cross pipes: |pump| its strength, its sign the way (> 0 port → starboard, < 0 back)
  bowWater: 0, // the sea see-through at the bow (bowSide): the plate's sag and the blocks under the hull show (0/1)
  heel: 0, //    degrees of roll, + to starboard (≤ 8, illustrative: no angle is sourced, none is written)
  prop: 0.3, //  the propellers' churn: 0 still → 1 full power (and the boil astern, banquise.js)
  /* ── the header ── */
  days: 0, //    the comment's counter (chip-jours): 0 → 6 days
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -2000, fy: 300, fz: -90000, fs: 120000, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points set on
 *  BOUCHONS: the builders give better ones in their journals (docs/journal/051-model.md, 051-glace.md, 051-banquise.md).
 *  Poses near the trapped ship are written for FIRST.apart (1 200 m) and run 0: elsewhere, re-aim with shokAt(). */
// every pose says its lens (0 a pinhole; the close-ups spread CLOSE): a cut never inherits the blur of the shot before
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const [SX, SY, SZ] = shokAt(APART.hook);
export const VIEW = {
  hook: POSE0,
  /* ── the ice ── */
  // the trapped ship's deck from its port quarter, a little above: its glass people, the floes pressing (« 52 passagers »)
  deck: { ...P, tx: -1044, ty: 700, tz: -118432, d: 4500, az: -5, el: 25, fov: 32, shift: 140 },
  // low along its flank: the plates pressing on the hull (« Les plaques se pressent contre ta coque »)
  flank: { ...P, tx: -3018, ty: 150, tz: -119502, d: 4000, az: -30, el: 3, fov: 36, shift: 150 },
  // the map: both ships far apart (apart = APART.real), the distance line between them (« une dizaine de kilomètres »)
  top: { ...P, tx: -1300, ty: 0, tz: -553000, d: 2400000, az: -40, el: 75, fov: 50, shift: 120 },
  // high over the icebreaker stopped in the pack, the ice tight all around (« qui l'a bloqué ? »)
  high: { ...P, tx: 0, ty: 0, tz: -1500, d: 32000, az: -40, el: 34, fov: 36, shift: 130 },
  // the bow in profile, at the ice's level: the stem riding the plate (« il casse un mètre de glace… sans la frapper »)
  bowSide: { ...P, tx: 0, ty: 150, tz: -4900, d: 3600, az: -92, el: 4, fov: 30, shift: 150 },
  // the bow from its port bow, low: the solid icebreaker coming at the camera (the end of act 1, the cut to the bench)
  bow: { ...P, tx: 0, ty: 400, tz: -2500, d: 16000, az: -140, el: 8, fov: 30, shift: 150 },
  // the whole ship from its port quarter, in the ice, three quarters — act 2b's plain-ice shot, the chute
  quarter: { ...P, tx: 0, ty: 300, tz: -800, d: 28000, az: -50, el: 12, fov: 30, shift: 140 },
  // the transverse cutaway seen from astern-port: the two tanks, the water changing side, the ridges at the flanks
  section: { ...P, tx: 0, ty: -100, tz: 0, d: 7600, az: -22, el: 8, fov: 30, shift: 120 },
  // the stern, just above the water: the propellers' boil (« l'hélice brasse encore ») — the camera stays above y = 50
  stern: { ...P, tx: 0, ty: 200, tz: 5200, d: 4200, az: -40, el: 10, fov: 32, shift: 140 },
  /* ── the bench (the same coordinates: the floor is at the keel) ── */
  // the ship whole on its pool, three quarters from the port bow
  whole: { ...P, tx: 0, ty: 500, tz: -500, d: 27000, az: -150, el: 14, fov: 28, shift: 100 },
  // the exploded view: belt off the hull, tanks out, stem forward — in ONE vertical frame
  exploded: { ...P, tx: 0, ty: 1600, tz: -2200, d: 42000, az: -140, el: 20, fov: 28, shift: -60 },
  // the belt along the port waterline
  belt: { ...P, ...CLOSE, tx: -1300, ty: 0, tz: -2600, d: 7000, az: -112, el: 6, fov: 28, shift: 130 },
  // the tanks inside, port side (the hull ghosted), from above the port quarter
  tanks: { ...P, ...CLOSE, tx: 0, ty: -200, tz: 300, d: 22000, az: -50, el: 40, fov: 28, shift: 60 },
  // THE STEM — the heart: the bow from its port bow, close
  stem: { ...P, ...CLOSE, tx: 0, ty: 0, tz: -4800, d: 6200, az: -128, el: 8, fov: 28, shift: 130 },
  // the principle: the stem and its plate in profile, at waterline level (the bench plate, `slab`)
  principle: { ...P, ...CLOSE, tx: 0, ty: -50, tz: -5150, d: 4200, az: -90, el: 9, fov: 28, shift: 140 },
};

/** What a cut to the bench sets, whatever came before. */
export const BENCHED = {
  shell: 0, close: 0, wake: 0, shok: 0, crowd: 0, line: 0, wind: 0, heli: 0, ridge: 0, crest: 0, grip: 0,
  bend: 0, crack: 0, crush: 0, tumble: 0, slab: 0, section: 0, tanks: 0, pump: 0, heel: 0, prop: 0, push: 0, straight: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 0, fz: -500, fs: SIZE,
};
/** What a cut back to the ice sets (the rest — close, ridge, apart… — the act says). */
export const STAGED = { shell: 1, explode: 0, slab: 0, litBelt: 0, litTanks: 0, litStem: 0, gel: 0, fx: 0, fy: 300, fz: -1000, fs: 15000 };

export function buildWorld(stage) {
  const { scene } = stage;
  const ship = buildShip();
  const glace = buildGlace();
  const field = buildBanquise();

  // FRAME: the ship's frame, on either set — the ship rolls in it (`heel`), the ice near it (glace) sits in it
  const frame = new THREE.Group();
  const roll = new THREE.Group(); // the roll axis: the ship's long axis at the waterline
  roll.add(ship.root);
  frame.add(roll, glace.root);

  const bench = makeBench(SIZE);
  bench.group.position.y = BENCH_FLOOR; // the floor at the keel: same coordinates on both sets
  const ice = new THREE.Group();
  ice.add(field.root);
  scene.add(ice, bench.group, frame);
  stage.grade.gel.set(0xff5b2e);

  return {
    ship, glace, field, bench, frame,
    /** where the stem's waterline point is (ship frame): the camera of the principle aims there */
    stemAt: [0, 0, STEM.water],
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      bench.group.visible = onBench;
      ice.visible = !onBench;
      roll.rotation.z = -S.heel * DEG; // + heel: the starboard side (+x) goes down

      ship.update(S, time, onBench);
      glace.update(S, time, onBench);
      if (!onBench) field.update(S, time);

      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.5);
      bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      // the fog: the bench's, or a haze that eats the far pack and the horizon but keeps a ship at ≈ 1.3 km
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.5 / Math.max(stage.cam.d * 12, 150000);
    },
  };
}
// (SHIP is re-exported for the acts' convenience: the keel, the deck, the draught)
export { SHIP };
