// DOSSIER 022 — Batterie de téléphone : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by chambre.js, model.js and pores.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The ROOM: a bedroom at night seen like an X-ray — the bed, you asleep, the pillow, the cable — and,
// solid under the pillow, the phone. The BENCH: that same phone — the system — alone on its pool of light, opened;
// and, for one sentence, hundreds of its twins in ranks around it.
// It is ONE object, re-parented: a cut from one set to the other matches on it.
// And one more scale, mounted on the system: the PORES (`micro`, pores.js) — the film between its two electrodes, a
// maquette. The fade between the two scales is shared out: model.js and chambre.js dissolve with `fade` (1 → 0),
// pores.js comes with `micro` (0 → 1); apply() hides whatever has reached nothing.
// Three colours. signal is the HEAT: the battery warming, what the pillow holds, the hot point, the thermometer.
// veille is the system alive: the lithium going through the pores, the circuit that cuts, the film that closes.
// ink is everything else — the charger's current in the cable included.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { moved, smooth, clamp01 } from "@kit/direct.js";
import { ROOM, BED, PILLOW, YOU, TABLE, SOCKET, SPOTS, phoneSpot, PHONE, PORT, BATT, BOARD, OPEN, TONGUE, DENT, MICRO, RANKS, SYSTEM, TEMP } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildChambre } from "./chambre.js";
import { buildPores } from "./pores.js";

export const SET = { BENCH: 0, ROOM: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

// The first frame is the hook: night, you asleep, your head on the pillow — and under the pillow, on our side of
// your head, a warm light that has a place: the phone, charging. No text: the picture alone stops the thumb.
// (Act 1 tunes POSE0 and FIRST and hands them back.)
export const POSE0 = { tx: -8, ty: 59, tz: -68, d: 250, az: -52, el: 17, fov: 36, shift: 160, side: 20, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.ROOM,
  /* ── the room (chambre.js) ── */
  shell: 1, //     the X-ray of the room: walls, the bed, the bedside table, the socket (0–1)
  you: 1, //       0 nobody · 1 you asleep, a body of glass (you breathe: that is `time`, not a number)
  cloth: 1, //     the pillow: 1 a body (dense glass, its seams: it reads as a pillow) → 0 a bare outline, the phone showing under it
  pillow: 0, //    the pillow: 0 lying on the phone · 1 lifted clear of it (in between it rises)
  trapped: 0.3, // the heat the pillow holds, DRAWN: warm motes that rise from the phone, meet the pillow and stay (0–1); once the pillow is off (or the phone out), they rise free and thin out
  plug: 1, //      the cable: 1 in the phone · 0 pulled out of it
  place: 0, //     where the phone lies: 0 under the pillow · 1 on the bedside table, in the open · 2 on the bare floor, away from the bed (in between it is carried: plan.js → phoneSpot)
  /* ── the ranks, on the bench (chambre.js) ── */
  ranks: 0, //     « un modèle entier »: hundreds of twins of the phone, in rows around it (0–1: they come row after row, the nearest first)
  recall: 0, //    they are recalled: their warm hearts go dark, row after row, from the far end toward us (0–1) — the system's own stays
  /* ── the system (model.js) ── */
  temp: 34, //     the battery at its hottest point, in degrees: the header's big readout (only 130 is sourced: plan.js → TEMP)
  heat: 0.55, //   the heat of the battery, DRAWN: a signal glow with a heart, inside the phone (0–1)
  charge: 1, //    the charge: 1 the protection circuit lets it through · 0 it has cut (its switch open, veille; the cable's dashes stop) — the header's second readout
  xray: 0, //      the phone's body (and the battery's pouch) turn to glass where they stand (0–1): the battery, then its layers, show
  explode: 0, //   on the bench: 0 assembled → 1 the back lifted, the battery risen out of the body
  unroll: 0, //    the battery opens on its layers: the outer end of its winding comes off as a tongue, its three sheets fanned (0–1)
  swell: 0, //     the battery swollen: the pouch bulges, the back lifts off the body (0–1)
  dent: 0, //      the battery is damaged: a crease on the pouch, where the hot point will be born (0–1)
  spot: 0, //      the hot point: a signal light that has a place and grows (0–1) — at the dent in the phone, under the film at the scale of the pores
  level: 0.6, //   how full the battery is (0–1)…
  levelSeen: 0, // …and how much of that level is DRAWN: a veille column in the pouch (0–1)
  /* ── the pores (pores.js) ── */
  micro: 0, //     the scale: 0 the phone · 1 the pores — the film between its two electrodes (a maquette; the phone and the room dissolve)
  ions: 0, //      the lithium, DRAWN: veille grains going down through the pores (0–1) — where a pore is shut they stop against the film
  pores: 1, //     the film's pores: 1 all open → 0 all shut; they close ONE BY ONE, from the hot point outward
  melt: 0, //      the film melting: it softens and glazes, from the hot point outward (0–1) — it never burns, never tears
  liquid: 0, //    the liquid between the electrodes, DRAWN: a faint signal body filling the gaps (0–1) — it is flammable
  touch: 0, //     « si elles se touchent »: the film gives way at one place and the two electrodes meet through it (0–1) — a hypothesis, acts 1 only
  chain: 0, //     « la chaleur appelle la chaleur »: from that place, hot points light their neighbours, one after the other (0–1) — acts 1 only
  hair: 0, //      a human hair lying across the maquette, for scale (0–1)
  litCopper: 0, litAlu: 0, litFilm: 0, litRoll: 0, litBoard: 0, // the part the voice is naming glows faintly veille (the two metal sheets: ink)
  /* ── the header ── */
  meter: 0, //     its second readout: 0 « Charge » (reads `charge`) · 1 « Courant » (reads `pores`)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -14, fy: 58, fz: -76, fs: 70, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [MX, MY, MZ] = MICRO.at;
/** A pose written around the system where it stands on the bench (the origin), moved to where it lies in the room. */
export const inRoom = (pose, place = 0) => moved(pose, [0, 0, 0], phoneSpot(place));

const SYSTEM_VIEW = { ...P, tx: 0, ty: 0.6, tz: 0, d: 62, az: -38, el: 24, shift: 170 };
export const VIEW = {
  hook: POSE0,
  /* ── in the room ── */
  // the whole bed from the foot: you asleep, the pillow, the bedside table, the cable
  bed: { ...P, tx: -10, ty: 46, tz: -24, d: 820, az: -30, el: 26, fov: 36, shift: 190 },
  // the pillow, your head on it (cloth 1; trapped: the heat it holds)
  pillow: { ...P, tx: -18, ty: 57, tz: -76, d: 190, az: -36, el: 18, fov: 32, shift: 180 },
  // under the pillow, the phone, close (cloth 0.2, xray 1: the battery in it) — the same picture as VIEW.whole on the bench
  under: inRoom(SYSTEM_VIEW),
  // the cable, from the phone to the socket
  cable: { ...P, tx: -72, ty: 62, tz: -100, d: 250, az: -22, el: 14, fov: 32, shift: 170 },
  // the phone on the bedside table (place 1) · alone on the floor, the bed far behind (place 2)
  table: inRoom({ ...SYSTEM_VIEW, d: 90 }, 1),
  away: { ...P, tx: -90, ty: 20, tz: 60, d: 760, az: -26, el: 30, fov: 36, shift: 190 },
  /* ── on the bench ── */
  whole: { ...SYSTEM_VIEW, side: 60 },
  // the ranks (ranks 1): the system in front, its twins running away behind it (light wide: fs 160)
  ranks: { ...P, tx: 0, ty: 0, tz: -70, d: 400, az: -14, el: 27, fov: 40, shift: 150 },
  // the exploded view (explode 1): the body, the battery, the back · with its tongue out (unroll 1)
  exploded: { ...P, tx: 0, ty: 4.6, tz: 0, d: 96, az: -38, el: 18, shift: 190 },
  opened: { ...P, tx: 3.6, ty: 4.6, tz: 0, d: 108, az: -38, el: 18, shift: 190 },
  // the tongue: its three sheets fanned · the battery's side, its turns · the board at its end
  tongue: { ...P, tx: 9.6, ty: 4.6, tz: 0, d: 36, az: -34, el: 14, shift: 170 },
  roll: { ...P, tx: 2, ty: 4.6, tz: 2.8, d: 30, az: -14, el: 12, shift: 170 },
  board: { ...P, tx: -4.5, ty: 4.7, tz: 0, d: 22, az: -52, el: 22, shift: 170 },
  // the battery and its board, for « il coupe » (levelSeen 1)
  battery: { ...P, tx: 0, ty: 4.6, tz: 0, d: 50, az: -40, el: 20, shift: 180 },
  /* ── at the scale of the pores (micro 1; written around the system's origin: in the room, inRoom(VIEW.pores)) ── */
  // the film between its two electrodes, whole · the film's face and its pores · the hot point under the film
  pores: { ...P, tx: MX, ty: MY, tz: MZ, d: 104, az: -36, el: 24, shift: 185 },
  film: { ...P, tx: MX + 1, ty: MY, tz: MZ + 1.6, d: 72, az: -32, el: 32, shift: 175 },
  hot: { ...P, tx: MX + MICRO.hot[0], ty: MY - 0.6, tz: MZ + MICRO.hot[1], d: 46, az: -28, el: 26, shift: 170 },
};

/** What a cut to the bench sets, whatever came before: the phone whole, cool, at rest. */
export const BENCHED = {
  shell: 0, you: 0, cloth: 1, pillow: 0, trapped: 0, plug: 0, place: 0, ranks: 0, recall: 0,
  temp: TEMP.rest, heat: 0, charge: 1, xray: 0, explode: 0, unroll: 0, swell: 0, dent: 0, spot: 0, level: 0.6, levelSeen: 0,
  micro: 0, ions: 0, pores: 1, melt: 0, liquid: 0, touch: 0, chain: 0, hair: 0,
  litCopper: 0, litAlu: 0, litFilm: 0, litRoll: 0, litBoard: 0, meter: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 1, fz: 0, fs: SIZE,
};
/** What a cut to the room sets: the first frame — night, you asleep, the phone charging under the pillow. (It follows FIRST.) */
export const STAGED = (({ set, ...rest }) => rest)(FIRST);
/**
 * What a cut to the scale of the pores adds (over BENCHED or STAGED): the film at work — every pore open, the
 * lithium going through, the header on « Courant ». On the bench the light stands around the maquette as written;
 * in the room, add the phone's spot to fx, fy, fz.
 */
export const PORED = {
  micro: 1, xray: 0, explode: 0, unroll: 0, ions: 1, pores: 1, melt: 0, liquid: 0, touch: 0, chain: 0, hair: 0, spot: 0,
  litCopper: 0, litAlu: 0, litFilm: 0, meter: 1, fx: MX, fy: MY, fz: MZ, fs: SIZE,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const chambre = buildChambre();
  const system = buildSystem();
  const maquette = buildPores();
  const lens = new THREE.Group(); // where the maquette of the pores stands, counted from the system's origin: it follows the system from one set to the other
  lens.position.set(MX, MY, MZ);
  lens.add(maquette.group);
  const set = new THREE.Group(); // the room
  const mount = new THREE.Group(); // where the phone lies in it (plan.js → phoneSpot)
  set.add(chambre.group, mount);
  const bench = makeBench(SIZE);
  bench.group.add(chambre.ranks);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);
  const spot = [0, 0, 0];

  return {
    chambre, system, pores: maquette, bench, set, mount,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      const fade = 1 - smooth(clamp01(S.micro)); // at the scale of the pores, whatever is around the system has dissolved
      bench.group.visible = onBench;
      set.visible = !onBench;
      phoneSpot(S.place, spot);
      mount.position.set(spot[0], spot[1], spot[2]);
      const home = onBench ? bench.group : mount;
      if (system.root.parent !== home) home.add(system.root);
      if (lens.parent !== home) home.add(lens);
      // the two ENDS of the fade are the world's: at the scale of the pores the phone is not drawn at all, and the
      // other way round. In between, each file fades its own materials (model.js with `fade`, pores.js with `micro`).
      system.root.visible = fade > 0.001;
      maquette.group.visible = smooth(clamp01(S.micro)) >= 0.001; // pores.js only updates from there: below, it would show at full opacity
      system.update({ bench: onBench ? 1 : 0, fade, temp: S.temp, heat: S.heat, charge: S.charge, xray: S.xray, explode: S.explode, unroll: S.unroll, swell: S.swell, dent: S.dent, spot: S.spot, level: S.level, levelSeen: S.levelSeen, litCopper: S.litCopper, litAlu: S.litAlu, litFilm: S.litFilm, litRoll: S.litRoll, litBoard: S.litBoard }, time, px);
      maquette.update({ micro: S.micro, bench: onBench ? 1 : 0, temp: S.temp, spot: S.spot, ions: S.ions, pores: S.pores, melt: S.melt, liquid: S.liquid, touch: S.touch, chain: S.chain, hair: S.hair, litCopper: S.litCopper, litAlu: S.litAlu, litFilm: S.litFilm }, time, px);

      chambre.update({ room: onBench ? 0 : 1, fade, shell: S.shell, you: S.you, cloth: S.cloth, pillow: S.pillow, trapped: S.trapped, plug: S.plug, charge: S.charge, place: S.place, heat: S.heat, ranks: S.ranks, recall: S.recall }, time, px);
      if (onBench) bench.set({ pool: S.pool, grid: S.grid * fade, mood: S.mood });
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35 * fade);
      scene.fog.density = onBench ? bench.fog(stage.pose?.d ?? stage.cam.d) : 0.0004;
    },
  };
}

export { ROOM, BED, PILLOW, YOU, TABLE, SOCKET, SPOTS, phoneSpot, PHONE, PORT, BATT, BOARD, OPEN, TONGUE, DENT, MICRO, RANKS, SYSTEM, TEMP };
