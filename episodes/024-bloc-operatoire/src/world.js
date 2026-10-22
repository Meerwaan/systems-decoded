// DOSSIER 024 — Bloc opératoire : the world. This file is the contract between the sets and the acts:
//   · plan.js    where everything stands (shared by bloc.js and model.js)
//   · FIRST      the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0      the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply      what each number does to the world, every frame
// Three sets. The BLOC: an operating room like an X-ray — a glass shell, fine lines, and solid inside only what counts:
// the table, the lamp, the ventilator's bellows, the faulty appliance's casing and its wire, the IT sockets, the alarm
// repeater, the IT cabinet behind the back wall; you asleep and the surgeon, bodies of glass. HOME (« chez toi »):
// the room of 016 reused as it is (its wall, its consumer unit, its differential, its kettle): the same fault at home
// trips the differential and the room goes dark. The BENCH: the system — the isolation transformer and its two
// windings, the breakers, the insulation monitor, the earth bar, two stubs of casings — alone on its pool of light,
// opened. ONE object, re-parented between the cabinet and the bench: the cut from one to the other matches on it.
// Three colours. signal is the threat: the wire on the metal, the fault, the dark that would come, the fault current
// at home, the second fault that closes the loop. veille is the system alive: the windings that do not touch, the
// circuit tied to no earth, the monitor that measures and warns, the alarm in the room, the circuit that holds.
// ink is the rest, the ordinary current included.
//
// TACT: you are asleep and nothing happens to you. Nobody is hurt, no blood, no wound, no body opened: the surgeon's
// hands work above a drape. « Ici, le noir… » is a WHAT-IF (scene): the bloc goes dark item by item on the words and
// the next act starts in the light again — act 3 shows what really happens: nothing goes out.
//
// EXACTITUDE (docs/faits/024-*.md, « À ne pas dire »): the masses (the casings) ARE earthed; it is the circuit's live
// conductors that are tied to no earth (« aucun fil n'est relié à la terre »). The first fault does not cut; the
// SECOND (on the other conductor) closes a loop and the breakers cut. The monitor warns, it never cuts. No value
// (kΩ, mA, kVA, seconds) is written anywhere on screen.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import {
  ROOM, TABLE, YOU, LAMP, RESP, SURGEON, DEVICE, FAULT, SOCKETS, REPEATER, CABINET, MOUNT, CONDUIT,
  XFO, MAINS, RAIL, BREAKERS, CPI, OUT, EARTH, CASE_A, CASE_B, LINK, GHOST, CAPS, SYSTEM, BENCHAT,
} from "./plan.js";
import { buildSystem } from "./model.js";
import { buildBloc } from "./bloc.js";
// « chez toi »: the room of 016, reused as it is (never modified from here)
import { buildWall } from "../../016-disjoncteur/src/wall.js";
import { buildSystem as buildBreaker } from "../../016-disjoncteur/src/model.js";
import { HOME as BREAKER_AT, BOARD } from "../../016-disjoncteur/src/plan.js";

export const SET = { BENCH: 0, BLOC: 1, HOME: 2 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** The operation clock of the header (the story's time: a scenario, not a fact): it reads START + seconds. */
export const START = 1 * 3600 + 12 * 60 + 40; // 01:12:40

const [MX, MY, MZ] = MOUNT;
const [CX, CY, CZ] = SYSTEM.centre;

// The first frame is the hook, « Tu dors, sur la table d'opération. Dans un appareil, un fil touche le métal. » :
// you asleep on the table under the lit lamp, the ventilator breathing at your head, the surgeon across you — and
// beyond your feet the appliance, its casing of glass, the wire inside it a breath away from the metal (a faint
// signal on it). PROVISIONAL (candidate a): the planche of four candidates (docs/024-actes.md) chooses it, and it is
// pasted here before the acts are staged.
export const POSE0 = { tx: 50, ty: 112, tz: -50, d: 540, az: -34, el: 18, fov: 38, shift: 10, side: 0, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.BLOC,
  /* ── the bloc (bloc.js) ── */
  shell: 1, //    the X-ray of the room: walls, ceiling, the cabinet's glass, the figures (0–1)
  lamp: 1, //     the operating lamp lit: its face, its pool of light on the table (0 out → 1)
  vent: 1, //     the ventilator runs: its bellows rise and fall, your chest with them (0 stopped, still → 1)
  work: 0.5, //   the surgeon's hands at work above the drape: how much they move (0 still → 1)
  dark: 0, //     the electric blackout of the set on screen — in the bloc: the room's lights, the screens, the conduits
  //              (the lamp and the ventilator have their own numbers); at HOME: 016's circuit off (0 on → 1 off)
  current: 1, //  the IT circuit alive: ink heads flow along its conductors — in the walls (bloc) and in the system (0–1)
  seek: 0, //     the fault being looked for: a veille head runs from the cabinet along the conduit and stops on the
  //              faulty appliance's socket (0 at the cabinet → 1 arrived)
  cabinet: 0, //  the IT cabinet behind the back wall glows veille through it (« exprès »; the one light left in the dark) (0–1)
  /* ── the system (model.js) — and what it shares with the bloc ── */
  fault: 0, //    THE FIRST FAULT: the wire touches the metal — in the bloc, in the appliance at FAULT; on the bench, in
  //              casing A. A light that has a place, signal (0 apart → 1 touching)
  alarm: 0, //    the alarm: the monitor's LED and, in the bloc, the repeater on the back wall — light and slow rings, veille (0–1)
  explode: 0, //  on the bench: 0 assembled → 1 its parts apart in ONE vertical frame
  apart: 0, //    « deux enroulements, qui ne se touchent pas »: the two windings draw apart, the gap between them lit veille (0–1)
  home: 0, //     the bench says « chez toi »: the link from the secondary to the earth bar and a ghost differential on the line appear (0–1)
  leak: 0, //     the fault current along its path (casing A → PE → earth bar → back to the circuit): with `home` 1 a full
  //              loop of signal heads; with `home` 0 only a trickle through the three small marks (CAPS) (0–1)
  ddr: 0, //      a differential lights veille: on the bench the ghost one (« ton différentiel le voit »), at HOME 016's (0–1)
  fault2: 0, //   THE SECOND FAULT, on the other conductor, in casing B (bench only): signal (0–1)
  double: 0, //   the double-fault loop: signal heads through casing A, the PE, casing B (0–1)
  trip: 0, //     the breakers of the circuit open (0 closed → 1 tripped: their handles down, the circuit beyond goes dark)
  cpi: 1, //      the monitor at work: slow veille pulses leave it into the two conductors (« un boîtier veille ») (0–1)
  ins: 1, //      the monitor's bar gauge — the insulation it measures, NO figure: 1 high (veille) → 0 low (signal)
  litXfo: 0, litPrim: 0, litSec: 0, litEarth: 0, litCpi: 0, // the part the voice is naming glows faintly veille
  /* ── the header ── */
  faults: 0, //   the header's second readout « Défauts »: 0, 1, 2 — the story's count, not the picture's
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 20, fy: 110, fz: -30, fs: 450, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on
 *  BOUCHONS: the builders give better ones in their journals (docs/journal/024-bloc.md, 024-model.md). */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [FX, FY, FZ] = FAULT;
const [RX, RY, RZ] = REPEATER.at;
const [BX, BY, BZ] = RESP.bellows;
const [LX, LY, LZ] = LAMP.head;
export const VIEW = {
  hook: POSE0,
  /* ── in the bloc (room's frame) ── */
  // you asleep, closer: your face, the tube, the lamp's pool on your chest (fs 200)
  you: { ...P, tx: -40, ty: 112, tz: -10, d: 300, az: -72, el: 14, fov: 38, shift: 60 },
  // the appliance, close: its casing of glass, the wire inside, FAULT on the side facing us (fs 60)
  device: { ...P, tx: 144, ty: 103, tz: -96, d: 240, az: -8, el: 18, fov: 32, shift: 110, side: 0, roll: 0, drift: 0.3 },
  // the whole bloc, wide from the head end and a little high: table, lamp, ventilator, surgeon, appliance, the back wall (fs 600)
  room: { ...P, tx: 30, ty: 130, tz: -90, d: 820, az: -34, el: 16, fov: 40, shift: 60 },
  // the ventilator's bellows in their glass column, your head at the edge of the frame (fs 120)
  resp: { ...P, tx: BX + 10, ty: BY - 4, tz: BZ + 6, d: 170, az: -28, el: 8, shift: 100 },
  // the lamp's head from below and the side, its lit face, the table under it (fs 160)
  lamp: { ...P, tx: LX, ty: LY - 20, tz: LZ, d: 240, az: -40, el: -8, fov: 34, shift: 140 },
  // the surgeon across you, his hands above the drape, the back wall behind him (fs 250)
  surgeon: { ...P, tx: 10, ty: 138, tz: -40, d: 300, az: -16, el: 8, fov: 34, shift: 60 },
  // the alarm repeater on the back wall, the surgeon's shoulder at the edge (fs 80)
  repeater: { ...P, tx: RX, ty: RY, tz: RZ, d: 150, az: -22, el: 4, shift: 120 },
  // the IT cabinet seen from the room THROUGH the back wall, the system standing in it — act 2 cuts to the bench from it (fs 120)
  system: { ...P, tx: MX + CX, ty: MY + CY, tz: MZ, d: 340, az: -22, el: 10, shift: 60 },
  // the back wall wide: the conduits from the cabinet to the sockets, the lamp's line up to the ceiling (fs 500)
  walls: { ...P, tx: 120, ty: 175, tz: -255, d: 760, az: -12, el: 8, fov: 40, shift: 40, side: 0, roll: 0, drift: 0.3 },
  // far and high: the whole room like a model in the dark, the lamp its brightest point (fs 900)
  far: { ...P, tx: 20, ty: 120, tz: -30, d: 1900, az: -40, el: 32, fov: 34, shift: -60 },
  /* ── at home (016's frame, the room of 016 reused) ── */
  // the consumer unit and its row, the differential in it (fs 150)
  board: { ...P, tx: BOARD.at[0], ty: BOARD.rowY, tz: 4, d: 150, az: -24, el: 6, shift: 150 },
  // the whole wall of 016 from the room: the kettle, the heater, the wire's run, the unit (fs 500)
  homeRoom: { ...P, tx: -20, ty: 120, tz: 10, d: 617.5, az: -71, el: 6.5, fov: 50, shift: 130, side: 50 },
  /* ── on the bench (the root at BENCHAT) ── */
  // the system whole, three quarters (fs SIZE)
  whole: { ...P, tx: 8, ty: 36, tz: 0, d: 420, az: -30, el: 16, shift: 140 },
  // the exploded view, in ONE vertical frame
  exploded: { ...P, tx: 0, ty: 58, tz: 0, d: 440, az: -30, el: 14, shift: -60 },
  // the transformer alone, close: its core and its two windings
  xfo: { ...P, tx: -16, ty: 46, tz: 0, d: 190, az: -30, el: 12, shift: 0 },
  // the casings and the earth bar: the fault path (A, PE, earth bar, back through the marks)
  path: { ...P, tx: 46, ty: 34, tz: 2, d: 230, az: -26, el: 14, shift: 60 },
  // the double fault and the trip, on the bench (model journal)
  doubleBench: { ...P, tx: 30, ty: 40, tz: 0, d: 330, az: -28, el: 14, shift: 60 },
  caseA: { ...P, tx: 60, ty: 40, tz: 3, d: 95, az: -24, el: 12, shift: 0 },
  // the monitor on its rail, close: its gauge, its LED (fs 30)
  cpi: { ...P, tx: CPI.at[0], ty: CPI.at[1], tz: CPI.at[2] + 2, d: 70, az: -22, el: 10, shift: 120 },
};

/** What a cut to the bench sets, whatever came before: the system assembled, the circuit alive, the monitor watching,
 *  no fault, nothing lit. `faults` is the story's: it keeps its value. */
export const BENCHED = {
  explode: 0, apart: 0, home: 0, leak: 0, ddr: 0, fault: 0, fault2: 0, double: 0, trip: 0, cpi: 1, ins: 1, alarm: 0,
  litXfo: 0, litPrim: 0, litSec: 0, litEarth: 0, litCpi: 0, current: 1,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: CX, fy: BENCHAT[1] + CY, fz: CZ, fs: SIZE,
};
/** What a cut to the bloc sets: the operation going on, everything lit and running, no fault yet. */
export const STAGED = {
  shell: 1, lamp: 1, vent: 1, work: 0.5, dark: 0, current: 1, seek: 0, cabinet: 0, fault: 0, alarm: 0,
  explode: 0, apart: 0, home: 0, leak: 0, ddr: 0, fault2: 0, double: 0, trip: 0, cpi: 1, ins: 1,
  litXfo: 0, litPrim: 0, litSec: 0, litEarth: 0, litCpi: 0,
  mood: 1, gel: 0, fx: 20, fy: 110, fz: -30, fs: 450,
};
/** What a cut to HOME sets: 016's room in the evening, the kettle and the heater on, the circuit live, nothing lit. */
export const HOMED = { dark: 0, ddr: 0, mood: 1, gel: 0, fx: BOARD.at[0], fy: BOARD.rowY, fz: 4, fs: 150 };

export function buildWorld(stage) {
  const { scene } = stage;
  const bloc = buildBloc();
  const system = buildSystem();
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // standing at BENCHAT
  benchMount.position.set(...BENCHAT);
  bench.group.add(benchMount);

  // home: 016's wall and its breaker, at 016's own origin (never seen with the bloc)
  const wall = buildWall();
  const breaker = buildBreaker();
  const homeSet = new THREE.Group();
  const breakerMount = new THREE.Group();
  breakerMount.position.set(...BREAKER_AT);
  breakerMount.add(breaker.root);
  homeSet.add(wall.group, breakerMount);

  scene.add(bloc.group, homeSet, bench.group);
  stage.grade.gel.set(0xff5b2e);

  // what is handed to the sets, written in place (no allocation in apply)
  const SYS = {
    bench: 0, explode: 0, apart: 0, home: 0, leak: 0, ddr: 0, fault: 0, fault2: 0, double: 0, trip: 0, cpi: 1, ins: 1,
    alarm: 0, current: 1, litXfo: 0, litPrim: 0, litSec: 0, litEarth: 0, litCpi: 0,
  };
  const BLOC = { shell: 1, lamp: 1, vent: 1, work: 0.5, dark: 0, current: 1, seek: 0, cabinet: 0, fault: 0, alarm: 0, mood: 1 };
  const WALL = { shell: 1, you: 0, kettle: 1, heater: 1, hotwire: 0, char: 0, fault: 0, dark: 0, others: 1, diff: 0, load: 0.6 };
  const BRK = {
    bench: 0, load: 0.6, cover: 1, xray: 0, explode: 0, handle: 1, gap: 0, latch: 0, bend: 0.1, warm: 0.15, pull: 0,
    plunger: 0, arc: 0, split: 0, litHandle: 0, litSpring: 0, litContacts: 0, litBlade: 0, litCoil: 0, litChamber: 0,
  };

  return {
    bloc, system, bench, wall, breaker,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const atHome = S.set === SET.HOME;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      bloc.group.visible = S.set === SET.BLOC;
      homeSet.visible = atHome;
      const home = onBench ? benchMount : bloc.mount; // bloc.mount: the system's shelf in the IT cabinet
      if (system.root.parent !== home) home.add(system.root);
      if (!atHome) {
        for (const k in SYS) SYS[k] = k === "bench" ? (onBench ? 1 : 0) : S[k];
        if (!onBench) SYS.explode = 0;
        system.update(SYS, time, px);
      }
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else if (atHome) {
        WALL.shell = S.shell;
        WALL.dark = S.dark;
        WALL.kettle = WALL.heater = 1 - S.dark;
        WALL.load = 0.6 * (1 - S.dark);
        WALL.diff = S.ddr;
        wall.update(WALL, time, px);
        BRK.load = WALL.load;
        breaker.update(BRK, time, px);
      } else {
        for (const k in BLOC) BLOC[k] = S[k];
        bloc.update(BLOC, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : atHome ? 0.0004 : 0.25 / Math.max(1500, d * 2.4);
    },
  };
}

export {
  ROOM, TABLE, YOU, LAMP, RESP, SURGEON, DEVICE, FAULT, SOCKETS, REPEATER, CABINET, MOUNT, CONDUIT,
  XFO, MAINS, RAIL, BREAKERS, CPI, OUT, EARTH, CASE_A, CASE_B, LINK, GHOST, CAPS, SYSTEM, BENCHAT,
};
