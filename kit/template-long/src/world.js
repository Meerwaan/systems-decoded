// DOSSIER __ID__ — __TITLE__ (format long) : the world — the contract between the chapters. A placeholder: the
// architect of a long writes it (sets, FIRST, POSE0, VIEW, STEPS, apply). See docs/recette-long.md.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";

export const SET = { BENCH: 0 };
export const SIZE = 60; // ≈ the radius of what the light stands around (cm)
export const FAR = 20000;
/** The steps of the line, as the header names them (ÉTAPE 01 / 08 …). */
export const STEPS = ["Le four", "Le bain d'étain", "L'étenderie", "La découpe", "Le bombage", "La salle blanche", "L'autoclave", "Le test"];
/** The chapter cards: their small line, and the line under the rule. */
export const CARD = { kicker: () => "Fabriqué pour te sauver", sub: () => "" };
/** Beats whose marked words stay off the picture (a chapter shows them better). */
export const KEYWORDS_SKIP = [];
export const POSE0 = { tx: 0, ty: 20, tz: 0, d: 400, az: -34, el: 14, fov: 32, shift: 0, side: 0, roll: 0, drift: 0.3 };
export const FIRST = { set: SET.BENCH, step: 0, temp: 20, tempOn: 0, mood: 0, pool: 0.3, grid: 0.16 };

export function buildWorld(stage) {
  const bench = makeBench(SIZE);
  const box = new THREE.Mesh(new THREE.BoxGeometry(120, 6, 80), new THREE.MeshStandardMaterial({ color: 0x3a4044, roughness: 0.6 }));
  box.position.y = 3;
  bench.group.add(box);
  stage.scene.add(bench.group);
  return {
    bench,
    apply(S) {
      Object.assign(stage.focus, { x: 0, y: 3, z: 0, scale: SIZE });
      setMood(stage, S.mood, 0);
      bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      stage.scene.fog.density = bench.fog(stage.cam.d);
    },
  };
}
