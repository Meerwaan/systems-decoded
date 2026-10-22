// DOSSIER L03 — Évacuation d'un avion (format long) : the world — the contract between the chapters. A placeholder: the
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

/** The studio for a long seen on a big screen (kit/lib/stage.js, docs/recette-long-image.md). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof` 5  the lens, on the close and medium shots only (the poses that spread CLOSE): the part in focus, the X-ray
 *           machines behind it soften — measured on L02: the subject stands out, and the thin lines of the background
 *           shimmer 20 to 30 % less while the camera moves. Never above 6 on a long: the thin lines behind part into copies.
 *           Never on a wide shot, an exploded view, a document, a chapter card: they read from edge to edge (SHARP).
 *  `air`    0: tried on L01 and L02 (the arc, the test head) — no gain.
 *  `finish` 0: on L02's lit porcelain the machining grain made stains. 1 only for a machined metal part in close-up,
 *           and then its decor marks every large smooth surface `material.userData.finish = false`.
 *  Every pose carries its lens (`...CLOSE` or `...SHARP`): a cut or a move never inherits the blur of the shot before. */
export const LOOK = { dof: 5, air: 0, finish: 0, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
export const CLOSE = { dof: LOOK.dof };
export const SHARP = { dof: 0 };

// The first frame: the strongest picture of the film, sharp from edge to edge.
export const POSE0 = { tx: 0, ty: 20, tz: 0, d: 400, az: -34, el: 14, fov: 32, shift: 0, side: 0, roll: 0, drift: 0.3, ...SHARP };
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
