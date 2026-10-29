// DOSSIER 030 — Prise de terre : the world. This file is the contract between the sets and the acts:
//   · plan.js    where everything stands (shared by buanderie.js and model.js)
//   · FIRST      the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0      the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply      what each number does to the world, every frame
// Two sets. The LAUNDRY (buanderie.js): a laundry room like an X-ray — a glass shell, fine lines, a grid for the wet
// tiles, and solid inside only what counts: the washing machine's casing (its metal is what goes live), its drum
// turning, the phase wire that touches the casing, you barefoot (a body of glass), the socket, the consumer unit's box;
// and cut away under the floor, the slab, the soil and the footings, in glass. The BENCH: the system — the earthing
// chain, from the lug on the casing to the bare copper loop — alone on its pool of light, opened as one column.
// ONE object, laid out twice (model.js: `bench` 0 in place in the laundry, 1 on the bench); the cut from one to the
// other matches on the same piece at the same place of the picture (the lug at « on l'ouvre », the loop at « Autour
// des fondations »).
// Three colours. signal is the threat: the casing live, the fault, the current that goes through you. veille is the
// system alive: the green-and-yellow protective conductor (veille, striped with ink — never yellow), the chain that
// arrives at the earth, the fault current that takes it, the differential that sees and cuts. ink is the rest.
//
// EXACTITUDE (docs/faits/030-*.md, « À ne pas dire »): the door (hublot) is glass and plastic, never live — the metal
// is the casing and the lid (le capot). Without the PE, the casing stays live and NO current flows: nothing trips
// until a body is the path; then the 30 mA differential trips — AFTER you. With the PE, the fault current goes by the
// PE, the main earthing terminal, the earthing conductor, the loop, into the ground (it goes back to the substation
// through the ground: it does not « vanish »): the differential sees the difference and trips BEFORE your hand. The
// loop lies AROUND the foundations (à fond de fouille), never « under » them. No value (Ω, mA, seconds) on screen;
// the only figure is the voice's « 230 volts » (the header).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import {
  ROOM, MACHINE, HUBLOT, DRUM, CAPOT, FAULT, PHASE, CORD_IN, SOCKET, TABLEAU, YOU, PUDDLE, CONDUIT, FOUND, LOOP,
  PLACE, BENCH, SYSTEM,
} from "./plan.js";
import { buildModel } from "./model.js";
import { buildBuanderie } from "./buanderie.js";

export const SET = { BENCH: 0, SCENE: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** The story's clock in the header (a scenario, not a fact): it reads START + seconds — 21:47:12. */
export const START = 21 * 3600 + 47 * 60 + 12;
/** The voice's only figure: the casing's voltage, once it is live (« tout le métal est à 230 volts »). */
export const VOLTS = 230;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the part in focus, what lies in front and behind melts
 *  `air`    light in the air behind the plane in focus — kept only where it is a net gain at 270 px wide
 *  `finish` the surface of the solid parts: machining grain and handling marks that break the reflections
 *  Every pose says its lens (dof 0 unless it spreads CLOSE): a cut never inherits the blur of the shot before. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

const [CX, CY, CZ] = SYSTEM.centre;
const [MX, , MZ] = MACHINE.at;

// The first frame is the hook, « Ta machine à laver est sous tension. Et rien n'a sauté. » : the machine in its spin
// cycle, seen from the wet floor, its casing live (signal) and shaking, the drum turning behind the door; your bare feet
// in the puddle at the right edge; low on the wall the cord, its green-and-yellow conductor faint veille, going to a
// socket. chosen on the board of candidates: (a′) (docs/030-decors.md, docs/journal/030-etat.md);
// it is pasted here before the acts are staged. Sharp (dof 0).
export const POSE0 = { tx: 18, ty: 44, tz: 46, d: 270, az: -40, el: 1, fov: 46, shift: 70, side: -30, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.SCENE,
  /* ── the laundry (buanderie.js) ── */
  shell: 1, //    the X-ray of the room: walls, the unit's box, the machine's glass, you (0–1)
  spin: 1, //     the drum turns — the spin cycle — and the machine shakes on its feet, the water trembles (0 still → 1)
  live: 1, //     THE CASING IS LIVE: all its metal glows signal, from FAULT outward (0 ink → 1 signal)
  fault: 1, //    the phase wire touches the casing at FAULT: a light that has a place, signal (0 apart → 1 touching)
  reach: 0.4, //  your hand: 0 at your side → 1 hovering just above the lid (« ta main se tend vers le capot »)
  touch: 0, //    your hand on the lid (0 → 1: it lands on CAPOT.touch)
  body: 0, //     the fault current THROUGH YOU: signal heads from the hand, down the arm and the body, to the feet, into
  //              the wet floor, rings in the puddle (0–1)
  under: 0, //    the cut-away under the floor: the slab, the soil, the footings, in glass (0 hidden → 1)
  /* ── the system (model.js) — in place and on the bench ── */
  explode: 0, //  on the bench: 0 the chain gathered under the stub of casing → 1 laid out in ONE column, casing to loop
  chain: 0, //    the earthing chain is whole beyond the plug (the PE in the wall, the terminal, the earthing conductor, the
  //              loop): 1 there → 0 gone (« ce fil… n'arrive nulle part »). The film's house starts WITHOUT it
  pin: 0, //      the socket's earth pin: 1 a socket with its pin → 0 an old two-hole socket
  plug: 1, //     the plug in the socket (0 pulled out a few cm → 1 in) — the bench's gesture on « par la broche »
  pe: 0.35, //    the green-and-yellow conductor lit veille, striped with ink (0 dark → 1 bright)
  run: 0, //      a veille head running along the chain from the lug (0) to the loop (1): it lights what it passes;
  //              with `chain` 0 it stops at the plug — « n'arrive nulle part »
  leak: 0, //     THE FAULT CURRENT BY THE EARTH: veille heads from the lug, along the PE, the terminal, the earthing
  //              conductor, into the loop, and rings into the ground (0–1). Only where the chain is whole
  ddr: 0, //      the 30 mA differential sees it: it lights veille (0–1)
  trip: 0, //     the differential trips: 0 closed → 1 its handle down
  litCosse: 0, litPe: 0, litPrise: 0, litBorne: 0, litTerre: 0, litBoucle: 0, // the part the voice is naming glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: MX, fy: 46, fz: MZ, fs: 130, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on
 *  BOUCHONS: the builders give better ones in their journals (docs/journal/030-buanderie.md, 030-model.md). */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const [UX, UY, UZ] = FAULT;
const [KX, KY, KZ] = PLACE.cosse;
const [SX, SY] = SOCKET.at;
const [DX, DY, DZ] = PLACE.diff;
const [JX, JY, JZ] = PLACE.join;
const [HX, HY, HZ] = YOU.hover;
export const VIEW = {
  hook: POSE0,
  /* ── in the laundry (its frame) ── */
  // the machine whole, three quarters, a little high: casing, lid, door, the cord to the socket (fs 130)
  machine: { ...P, tx: MX, ty: 50, tz: MZ, d: 360, az: -34, el: 12, fov: 34, shift: 80 },
  // inside the casing, close: the phase wire on the left panel, FAULT (fs 40)
  fault: { ...P, ...CLOSE, tx: UX, ty: UY, tz: UZ, d: 95, az: -62, el: 10, shift: 60 },
  // the consumer unit, close: the 30 mA differential on its rail, the terminal under it (fs 50)
  tableau: { ...P, ...CLOSE, tx: DX + 6, ty: DY - 10, tz: DZ, d: 150, az: -22, el: 4, shift: 110 },
  // the socket and the plug, close: two holes — with or without the pin (fs 25)
  socket: { ...P, ...CLOSE, tx: SX, ty: SY, tz: 3, d: 75, az: -24, el: 8, shift: 110 },
  // you whole, barefoot by the machine: the machine, you, the puddle (fs 250)
  you: { ...P, tx: 40, ty: 88, tz: 48, d: 420, az: -22, el: 6, fov: 34, shift: 40 },
  // your feet in the puddle, your legs, the machine's foot (fs 90) — never closer
  feet: { ...P, tx: 64, ty: 16, tz: 54, d: 170, az: -30, el: 6, shift: 200 },
  // your arm going to the lid: the lid, the hand, the arm, your shoulder (fs 90) — never the hand alone
  reach: { ...P, tx: 34, ty: 102, tz: 44, d: 290, az: -48, el: 12, shift: 40 },
  // where act 1 ends, close on the lug inside the casing, the lid above it — act 2 cuts to the bench from it (benchCut)
  system: { ...P, ...CLOSE, tx: KX, ty: KY, tz: KZ, d: 120, az: -34, el: 16, shift: 80 },
  // the back wall wide: the socket, the wall's run, the unit (fs 450)
  wall: { ...P, tx: -110, ty: 120, tz: 0, d: 560, az: -24, el: 6, fov: 34, shift: 60 },
  // under the floor: the footing in glass, the bare copper loop at its bottom, where the earthing conductor joins it (fs 140)
  under: { ...P, tx: -230, ty: -62, tz: 20, d: 460, az: -52, el: 9, shift: 40 },
  // the whole chain in section: the machine, the wall, the unit, down through the slab to the loop (fs 700)
  section: { ...P, tx: -90, ty: 50, tz: 10, d: 900, az: -28, el: 6, fov: 34, shift: 0 },
  // far and high: the laundry like a model in the night (the announcement: nothing of the subject) (fs 1200)
  far: { ...P, tx: -40, ty: 80, tz: 80, d: 1700, az: -36, el: 20, fov: 30, shift: -40 },
  /* ── on the bench (the root at the origin) ── */
  // the chain whole, three quarters (fs SIZE)
  whole: { ...P, tx: 0, ty: 36, tz: 0, d: 250, az: -30, el: 12, shift: 0 },
  // the exploded view: the column, casing on top, loop at the bottom, in ONE vertical frame
  exploded: { ...P, tx: 0, ty: 37.5, tz: 0, d: 260, az: -30, el: 10, shift: -20 },
  // the stub of casing and its lug, close
  bStub: { ...P, ...CLOSE, tx: -3, ty: 66, tz: 0, d: 64, az: -30, el: 12, shift: -40 },
  // the plug and the socket, close: the pin
  bPlug: { ...P, ...CLOSE, tx: 0, ty: 46, tz: 3, d: 72, az: -24, el: 30, shift: 0 },
  bPlugSide: { ...P, ...CLOSE, tx: 0, ty: 47, tz: 3, d: 70, az: -72, el: 8, shift: 60 }, // the pins seen in profile (model.js)
  // the unit: the differential and the main earthing terminal
  bTab: { ...P, ...CLOSE, tx: -3, ty: 30, tz: 1, d: 80, az: -28, el: 10, shift: 40 },
  // the test link, the earthing conductor, the loop
  bEarth: { ...P, tx: BENCH.loop.at[0], ty: 9, tz: 0, d: 150, az: -30, el: 18, shift: 40 },
};

/** What a cut to the bench sets, whatever came before: the chain whole and dark, nothing flows, nothing is lit. */
export const BENCHED = {
  explode: 0, chain: 1, pin: 1, plug: 1, pe: 0.35, run: 0, leak: 0, ddr: 0, trip: 0,
  litCosse: 0, litPe: 0, litPrise: 0, litBorne: 0, litTerre: 0, litBoucle: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: CX, fy: CY, fz: CZ, fs: SIZE,
};
/** What a cut to the laundry sets: THE FILM'S HOUSE — the machine spinning, its casing live, no earth beyond the plug,
 *  your hand on its way, nothing through you yet, the floor closed. */
export const STAGED = {
  shell: 1, spin: 1, live: 1, fault: 1, reach: 0.4, touch: 0, body: 0, under: 0,
  explode: 0, chain: 0, pin: 0, plug: 1, pe: 0.35, run: 0, leak: 0, ddr: 0, trip: 0,
  litCosse: 0, litPe: 0, litPrise: 0, litBorne: 0, litTerre: 0, litBoucle: 0,
  mood: 1, gel: 0, fx: MX, fy: 46, fz: MZ, fs: 130,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const laundry = buildBuanderie();
  const system = buildModel();
  const bench = makeBench(SIZE);
  scene.add(laundry.group, bench.group);
  stage.grade.gel.set(0xff5b2e);

  // what is handed to the sets, written in place (no allocation in apply)
  const SYS = {
    bench: 0, explode: 0, chain: 0, pin: 0, plug: 1, pe: 0.35, run: 0, leak: 0, ddr: 0, trip: 0, live: 1, fault: 1,
    litCosse: 0, litPe: 0, litPrise: 0, litBorne: 0, litTerre: 0, litBoucle: 0, under: 0,
  };
  const LAU = { shell: 1, spin: 1, live: 1, fault: 1, reach: 0.4, touch: 0, body: 0, under: 0, chain: 0, trip: 0, mood: 1 };

  return {
    laundry, system, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      laundry.group.visible = !onBench;
      const home = onBench ? bench.group : laundry.mount; // laundry.mount: the laundry's origin (PLACE is in its frame)
      if (system.root.parent !== home) home.add(system.root);
      for (const k in SYS) SYS[k] = k === "bench" ? (onBench ? 1 : 0) : S[k];
      if (!onBench) SYS.explode = 0;
      system.update(SYS, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        for (const k in LAU) LAU[k] = S[k];
        laundry.update(LAU, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.25 / Math.max(1500, d * 2.4);
    },
  };
}

export {
  ROOM, MACHINE, HUBLOT, DRUM, CAPOT, FAULT, PHASE, CORD_IN, SOCKET, TABLEAU, YOU, PUDDLE, CONDUIT, FOUND, LOOP,
  PLACE, BENCH, SYSTEM,
};
