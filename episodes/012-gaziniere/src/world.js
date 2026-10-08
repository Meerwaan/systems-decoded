// DOSSIER 012 — Gazinière : the world. This file is the contract between the acts:
//   · the sets and the model, built once
//   · FIRST   the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0   the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply   what each number does to the world, every frame
// The acts (acte1.js … fin.js) only write st / shot / cut / tl calls against it: once this file is
// settled they can be staged at the same time, by different hands.
//
// Two sets. The SCENE: where the story happens — what surrounds the system is seen like an X-ray (a
// glass shell, fine lines, and solid inside it only what matters). The BENCH: the same system, alone,
// on its pool of light. It is ONE object, re-parented: the cut from one to the other matches on it.
// Reuse a set before modelling one: the room and its board (004/src/room.js), the hall (006/src/hall.js),
// the road (002/src/road.js), the shaft (003/src/shaft.js), the sky, the runway (007/src/jet.js),
// the glass figure and its hands (@kit/figure.js).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { glass, edgesOf, asShell } from "@kit/build3d.js";
import { makeBench, setMood } from "@kit/blocks.js";
import { buildModel, MODEL } from "./model.js";

export const SET = { BENCH: 0, SCENE: 1 };
/** Where the system stands in the scene (cm). On the bench it stands on the origin. */
export const HOME = [0, 140, 0];
/** ≈ the radius of the system: sizes the bench, the light, the shadows. */
export const SIZE = 9;

// The first frame is the hook: the strongest picture of the film, and it already shows what the hook says.
export const POSE0 = { tx: 0, ty: 150, tz: 0, d: 520, az: -34, el: 6, fov: 44, shift: 150, side: 0, roll: 0, drift: 0 };
export const FIRST = {
  set: SET.SCENE,
  // the scene — `shell`: how much of the X-ray shows; `threat`: the danger, 0 → 1
  shell: 1, threat: 0.2,
  // the system — see model.js
  explode: 0, heart: 0.3,
  // the light: what it stands around (`fx, fy, fz`, and `fs` its size), `mood` 0 veille → 1 signal (held frank),
  // `gel` a coloured light over the whole scene (it multiplies: black stays black), the bench's pool and grid
  fx: HOME[0], fy: HOME[1] + 2, fz: HOME[2], fs: 60, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};
/** The poses one act hands to the next (complete: nothing is inherited across a cut). */
export const VIEW = {
  // where act 1 ends, close on the system in the scene — act 2 cuts to the bench from it (benchCut)
  system: { tx: HOME[0], ty: HOME[1] + 2, tz: HOME[2], d: 62, az: -30, el: 24, fov: 28, shift: 150, side: 0, roll: 0, drift: 0.3 },
  // the exploded view on the bench
  exploded: { tx: 0, ty: 7, tz: 0, d: 96, az: -42, el: 16, fov: 28, shift: 165, side: 0, roll: 0, drift: 0.3 },
  // the system whole again, on the bench: the three calls to action play over it
  whole: { tx: 0, ty: 2.4, tz: 0, d: 74, az: -40, el: 18, fov: 28, shift: 40, side: 0, roll: 0, drift: 0.3 },
};
/** What a cut to the bench sets, whatever came before. */
export const BENCHED = { shell: 0, threat: 0, explode: 0, heart: 0.3, mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 2, fz: 0, fs: SIZE };
/** What a cut to the scene sets. */
export const STAGED = { shell: 1, explode: 0, gel: 0, fx: HOME[0], fy: HOME[1] + 2, fz: HOME[2], fs: 60 };

export function buildWorld(stage) {
  const { scene } = stage;
  const hero = buildModel();

  // the scene: a plinth of glass, the system standing on it, and the danger coming
  const set = new THREE.Group();
  const plinthGeo = new THREE.BoxGeometry(44, HOME[1], 44);
  const plinthGlass = glass(BRAND.ink, { base: 0, rim: 0.22, edge: 0.4, through: 0.3 });
  const plinth = new THREE.Mesh(plinthGeo, plinthGlass);
  plinth.position.set(HOME[0], HOME[1] / 2 - 0.2, HOME[2]);
  asShell([plinth]);
  const plinthLines = edgesOf(plinthGeo, { color: BRAND.ink, width: 1.8, opacity: 0.5 });
  plinth.add(plinthLines);
  const mount = new THREE.Group(); // where the system stands
  mount.position.set(...HOME);
  const danger = new THREE.Mesh(new THREE.SphereGeometry(MODEL.radius * 2, 32, 16), new THREE.MeshBasicMaterial({ color: BRAND.signal, transparent: true, opacity: 0, fog: false }));
  danger.position.set(-70, HOME[1] + 30, -40);
  set.add(plinth, mount, danger);

  const bench = makeBench(SIZE);
  scene.add(set, bench.group);
  stage.grade.gel.set(BRAND.signal);

  return {
    hero, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? bench.group : mount;
      if (hero.root.parent !== home) home.add(hero.root);
      hero.pose({ explode: S.explode, heart: S.heart }, time);

      plinthGlass.uniforms.uAmount.value = S.shell;
      plinthLines.material.opacity = 0.5 * S.shell;
      danger.material.opacity = 0.9 * S.threat;
      danger.scale.setScalar(0.4 + S.threat);

      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.5);
      bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.0004;
    },
  };
}
