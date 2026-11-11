// DOSSIER 042 — Le toit du char : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by caisson.js, char.js, feu.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Three new files, ONE place (no re-parenting): the SYSTEM, solid (caisson.js: the ammunition compartment at the
// turret's rear, its rounds, its roof panel, the two sliding blast doors and their seals, the rod and the egg-shaped
// cam, the pressure arrows; on the bench the like's counter-example); AROUND, X-ray (char.js: the tank at night, its
// crew of four, the ground, the comment's other turret and its arm); the FIRE (feu.js: the column out of the roof, the
// glow on the ground; far away, the 043 teaser). The BENCH is the same place with the tank, the ground and the fire gone
// and a pool of light under the caisson: a cut to the bench is IN PLACE (the caisson does not move).
// Three colours. signal is the threat: the powder burning, the pressure arrows, the column, a seal that opens.
// veille is the system alive: the crew (« silhouettes vertes »), the seals that hold, the weak point made on purpose,
// the door locked. ink is the rest: the tank's glass, the ground, the other turret.
//
// THE STORY (docs/faits/042-toit-du-char.md; a type scenario — no case, no date, no country, `sources` says so): the
// powder of a round flames in the compartment behind the crew; the pressure rises on its six faces; the thin roof panel
// lets go first and flies; as it goes it pulls a rod, the rod turns an egg-shaped cam, the cam presses the two sliding
// doors against their frame — locked; the fire goes up in a column, above the four, who are safe behind the doors.
// Without the lock, the push bows the doors toward the crew, they spring back, the seal opens (US 5,201,556).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { GROUND, CAISSON, PANEL, ROUNDS, DOORS, ROD, CAM, SYSTEM, BENCH, BLOCK, HULL, TRACKS, TURRET, GUN, CREW, OTHER, FIRE, TEASER } from "./plan.js";
import { buildCaisson } from "./caisson.js";
import { buildChar } from "./char.js";
import { buildFeu } from "./feu.js";

export const SET = { BENCH: 0, TANK: 1 };
/** ≈ the radius of the caisson: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the cam, a door, the lock at work
 *  `air`    off until a planche shows a net gain at 270 px
 *  `finish` the surface of the solid parts (the caisson, the panel, the doors, the cam): machining grain, handling marks
 *  Every pose says its lens (dof 0 unless it spreads CLOSE): a cut never inherits the blur of the shot before. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// The first frame is the hook, « Tes obus brûlent. Le toit de ton char saute. » : night, low at ground level, the tank
// from the front-left, under its gun (the barrel toward the lens's left), the turret of glass and its crew, and BEHIND
// the turret the caisson solid and glowing, its roof panel already lifting on a push of flames — the fire rises behind
// the subject. PROVISIONAL (candidate b, set on bouchons): the planche of four candidates (docs/042-actes.md) chooses
// it, and it is pasted here before the acts are staged.
export const POSE0 = { tx: -250, ty: -60, tz: 0, d: 2000, az: -36, el: -2, fov: 44, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.TANK,
  /* ── around (char.js) ── */
  shell: 1, //      the tank, X-ray: glass and fine lines (0–1; hidden on the bench)
  crew: 0.35, //    the four, glass figures lit veille (0–1; « Exprès » lights them full)
  you: 0, //        the loader picked out, « toi » (0–1)
  reach: 0, //      the loader turns round to his door and takes a round (0 facing the breech · 0.5 turned · 1 hands on the round)
  other: 0, //      the comment's other turret, « une machine » (0–1)
  arm: 0, //        its arm swings a round to the breech (0 → 1)
  heat: 0.7, //     the fire's light on the turret's rear lines (0–1)
  /* ── the system (caisson.js) ── */
  explode: 0, //    0 assembled → 1 apart: panel up, rounds back, doors toward the crew, rod and cam further out
  section: 0, //    the +z side wall cut away (« en coupe ») (0–1)
  litBox: 0, litPanel: 0, litDoors: 0, litCam: 0, // the part the voice names, a faint veille (0–1)
  weak: 0, //       the green ring round the roof panel, « son point faible, on l'a mis là » (0–1)
  burn: 0.8, //     the powder burning inside: 0 · 0.2 one case lights · 0.6 the inside flames · 1 it glows through every seam
  press: 0, //      the pressure arrows, face by face (the six are born on 0 → 0.6), then full (1)
  arrowRoof: 0, //  one arrow up to the panel, « le toit… » (0–1)
  arrowDoor: 0, //  one arrow to the loader's door and past it to him, « …ou toi » (0–1)
  vent: 0, //       every arrow swings up and leaves through the opening (0–1; needs blow ≥ 0.05)
  bulge: 0, //      the panel bows up, the thin face that gives (0–1)
  blow: 0.08, //    the panel: 0 seated · 0.05 cracked free · 0.15 ≈ 40 cm up, tilting · 1 ≈ 25 m up, gone (a maquette)
  lock: 0, //       the lock: 0 → 0.6 the rod rises · 0.2 → 0.9 the cam turns · 0.9 → 1 it presses both doors, the pin shears
  bow: 0, //        the doors bow toward the crew (1) or back (−0.5): the spring of « elles rebondissent »
  leak: 0, //       the loader's seal opens on the crew side: a signal slit (0–1)
  seal: 0.5, //     the seals round both openings, veille (0–1)
  door: 0, //       the loader's door slides open toward +z (0 · 0.12 a slit · 1 wide open)
  grab: 0, //       the round he takes comes out of its slot toward him (0–1)
  block: 0, //      the bench's counter-example, a closed block of thick steel (0–1)
  crack: 0, //      it swells and splits on every face, fire through the cracks (0–1)
  /* ── the fire (feu.js) ── */
  column: 0.45, //  the column out of the roof: 0.1 licks under the panel · 0.4 a jet of ≈ 3 m · 1 the full column (≈ 9 m)
  fall: 0, //       the column dies back into the opening (0–1)
  teaser: 0, //     the 043 teaser: 0 → 0.4 the beam runs · 0.4 → 0.7 the train over it · 0.7 → 1 the block swallows it
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -60, fy: 20, fz: 0, fs: 700, mood: 1, gel: 0, pool: 0, grid: 0,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). THE CAMERA TURNS ONE WAY: in every
 *  path, az DECREASES. The order below follows the film:
 *   acte1  −36 (POSE0) → −40 → −44 → −50 (roof) → −56 → −62 (doorSlit) | cut +10 (section) → +4 → −2 (crewWide) → −8 → −14 → −20 (closeIn)
 *   acte2  −20 → −30 (time stops) | cut −40 (system) → −46 (exploded) → −50 (panelUp) → −56 (doorsOut) → −64 (cam) | cut −28 → −34 (secBench) → −42
 *   acte3  cut −16 → −22 (rest) → −30 → −40 (doorClose) → −46 | cut +2 → −8 (zero) → −20 → −32 → −46 (mech) → −52 → −58 | cut −18 → −24 (columnWide) → −30
 *   fin    −30 → −34 → −38 → −44 (doorLocked) → −48 | cut −10 → −18 (loader) → −28 → −40 (duo) → −46 | cut −20 → −28 (like) → −36
 *          | cut −40 → −50 (teaser) → −56 | cut −24 (POSE0 + 12) → −36 (POSE0)
 *  Starting points, set on BOUCHONS: the builders give better ones in their journals (docs/journal/042-<file>.md). */
const P = { fov: 34, side: 0, roll: 0, drift: 0.3, dof: 0 };
export const VIEW = {
  hook: POSE0,
  /* ── the candidates of the first frame (docs/042-actes.md) ── */
  // a: the tank's rear-left three-quarter at ground level (the script's « voir »): its rear corner close, the gun away
  rear: { ...P, tx: -100, ty: -90, tz: 0, d: 2050, az: 40, el: -1, fov: 44, shift: 0 },
  // c: from above the roof, the panel flying at the lens on its push of flames, the turret below
  panelHigh: { ...P, tx: 0, ty: 100, tz: 0, d: 1100, az: 25, el: 55, fov: 46, shift: 0 },
  // d: close on the turret's rear from the loader's flank, low: the caisson glowing, the panel lifting, him at his door
  bustleLow: { ...P, tx: -60, ty: -20, tz: 0, d: 1200, az: 12, el: -4, fov: 42, shift: 0 },
  /* ── act 1 (the tank, at night) ── */
  roof: { ...P, tx: 0, ty: 30, tz: 0, d: 1000, az: -50, el: 28 }, //               « son point faible, on l'a mis là »
  doorSlit: { ...P, tx: -90, ty: -10, tz: 50, d: 700, az: -62, el: 8 }, //       « la porte dans ton dos… ouverte »
  section: { ...P, tx: 0, ty: 0, tz: 0, d: 1000, az: 10, el: 14 }, //             « la poudre flambe »: the caisson in section
  crewWide: { ...P, tx: -190, ty: -40, tz: 0, d: 1800, az: -2, el: 10 }, //      « toi et trois autres, devant »
  closeIn: { ...P, tx: -20, ty: 0, tz: 10, d: 700, az: -20, el: 16, fov: 32 }, // the caisson close: what we will open
  /* ── act 2 (the bench: the same place, the tank gone) ── */
  system: { ...P, tx: 0, ty: 0, tz: 0, d: 1460, az: -40, el: 18, fov: 30, shift: 40 },
  exploded: { ...P, tx: -20, ty: 25, tz: 10, d: 1630, az: -46, el: 18, fov: 32, shift: 60 },
  panelUp: { ...P, tx: 0, ty: 110, tz: 0, d: 1000, az: -50, el: 26, fov: 32 },
  doorsOut: { ...P, tx: -120, ty: 0, tz: 0, d: 800, az: -56, el: 12, fov: 32 },
  cam: { ...P, ...CLOSE, tx: -190, ty: 11, tz: 30, d: 160, az: -64, el: 10, fov: 30 }, // CAM.at + the exploded lock's spread
  secBench: { ...P, tx: 0, ty: 0, tz: 0, d: 1350, az: -34, el: 22, fov: 30, shift: 30 }, // the principle, « en coupe »
  /* ── act 3 (the tank) ── */
  rest: { ...P, tx: -80, ty: 0, tz: 0, d: 800, az: -22, el: 10 }, //              « au repos, portes fermées »
  doorClose: { ...P, ...CLOSE, tx: -67, ty: -2, tz: 40, d: 350, az: -40, el: 4, fov: 30 }, // a door bows toward him
  zero: { ...P, tx: 0, ty: 10, tz: 0, d: 800, az: -8, el: 16 }, //                « la poudre flambe… le panneau lâche »
  mech: { ...P, ...CLOSE, tx: -72, ty: 0, tz: 10, d: 330, az: -46, el: 4, fov: 30 }, // the rod, the cam, the doors
  columnWide: { ...P, tx: -220, ty: 200, tz: 0, d: 3200, az: -24, el: -4, fov: 40, shift: 0 }, // « au-dessus de vous »
  /* ── the end ── */
  doorLocked: { ...P, ...CLOSE, tx: -67, ty: -2, tz: 20, d: 300, az: -40, el: 4, fov: 30 }, // « ta porte », locked
  loader: { ...P, tx: -150, ty: -30, tz: 60, d: 650, az: -18, el: 12 }, //        « le temps de saisir un obus »
  duo: { ...P, tx: 40, ty: -20, tz: 250, d: 2100, az: -40, el: 14 }, //            « un homme… ou une machine ? »
  like: { ...P, tx: 130, ty: 10, tz: 0, d: 2000, az: -28, el: 16, fov: 30 }, //    the bench: the caisson and the block
  teaser: { ...P, tx: TEASER.at[0], ty: TEASER.at[1] + 365, tz: TEASER.at[2], d: 2700, az: -50, el: 16, fov: 40, shift: 0, side: 100 },
};

/** What a cut to the bench sets, whatever came before: the caisson whole, at rest, nothing burning, nobody. */
export const BENCHED = {
  set: SET.BENCH, shell: 0, crew: 0, you: 0, reach: 0, other: 0, arm: 0, heat: 0,
  explode: 0, section: 0, litBox: 0, litPanel: 0, litDoors: 0, litCam: 0, weak: 0, burn: 0, press: 0, arrowRoof: 0,
  arrowDoor: 0, vent: 0, bulge: 0, blow: 0, lock: 0, bow: 0, leak: 0, seal: 0, door: 0, grab: 0, block: 0, crack: 0,
  column: 0, fall: 0, teaser: 0,
  mood: 0, gel: 0, pool: 0.25, grid: 0.16, fx: 0, fy: 0, fz: 0, fs: SIZE,
};
/** What a cut to the tank sets: the tank at night, the crew at their posts, the caisson in section, its seals holding,
 *  nothing yet burning. The act says what burns and where the light stands. */
export const STAGED = {
  set: SET.TANK, shell: 1, crew: 1, you: 0, reach: 0, other: 0, arm: 0, heat: 0,
  explode: 0, section: 1, litBox: 0, litPanel: 0, litDoors: 0, litCam: 0, weak: 0, burn: 0, press: 0, arrowRoof: 0,
  arrowDoor: 0, vent: 0, bulge: 0, blow: 0, lock: 0, bow: 0, leak: 0, seal: 0.5, door: 0, grab: 0, block: 0, crack: 0,
  column: 0, fall: 0, teaser: 0,
  mood: 1, gel: 0, pool: 0, grid: 0, fx: -150, fy: -40, fz: 0, fs: 520,
};
/** The light's stand-points, ready to spread into a `st`: on the caisson, on the lock, on the tank, on the column. */
export const LIGHT = {
  caisson: { fx: 0, fy: 0, fz: 0, fs: 160 },
  lock: { fx: -80, fy: 0, fz: 0, fs: 60 },
  tank: { fx: -150, fy: -40, fz: 0, fs: 520 },
  column: { fx: -100, fy: 200, fz: 0, fs: 900 },
};

export function buildWorld(stage) {
  const { scene } = stage;
  const system = buildCaisson();
  const tank = buildChar();
  const fire = buildFeu();
  const bench = makeBench(SIZE);
  bench.group.position.y = BENCH.floor; // under the caisson: the cut to the bench is in place
  scene.add(tank.group, fire.group, system.root, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    system, tank, fire, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      const eye = stage.camera.position;
      const b = onBench ? 1 : 0;
      bench.group.visible = onBench;
      tank.update({ shell: S.shell, crew: S.crew, you: S.you, reach: S.reach, grab: S.grab, other: S.other, arm: S.arm, heat: S.heat, bench: b }, time, px, eye);
      system.update({
        explode: S.explode, section: S.section, litBox: S.litBox, litPanel: S.litPanel, litDoors: S.litDoors, litCam: S.litCam,
        weak: S.weak, burn: S.burn, press: S.press, arrowRoof: S.arrowRoof, arrowDoor: S.arrowDoor, vent: S.vent,
        bulge: S.bulge, blow: S.blow, lock: S.lock, bow: S.bow, leak: S.leak, seal: S.seal, door: S.door, grab: S.grab,
        block: S.block, crack: S.crack, bench: b,
      }, time, px, eye);
      fire.update({ column: S.column, fall: S.fall, blow: S.blow, teaser: S.teaser, bench: b }, time, px, eye);
      if (onBench) bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.4);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.00005; // night air: the tank at 20 m stays clear
    },
  };
}

export { GROUND, CAISSON, PANEL, ROUNDS, DOORS, ROD, CAM, SYSTEM, BENCH, BLOCK, HULL, TRACKS, TURRET, GUN, CREW, OTHER, FIRE, TEASER };
