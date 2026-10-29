// DOSSIER 029 — Airbag d'avalanche : the dressing of the slope (the decorator's file — docs/recette-decorateur.md).
// What an off-piste slab slope really has, seen like the rest of the mountain — X-ray glass and fine ink lines, never
// solid, never on you nor the pack, never in the slide's path, never in front of you:
//   · THE FIRS lower down, sparse, outside the avalanche's path — a few on your right 35 to 75 m away (the background
//     of the shot across from your left, behind the cameras across from your right: never behind the section) — and
//     a clump round the chalet in the valley: the scale of the mountain (a fir is 8 to 14 m) and the life below.
//   · A LOW WINTER SUN, far on your right, just over the far crests: where the key light comes from.
// Tried and taken out (docs/journal/029-habillage.md): your trace from the crest to the crown, the cornice, the piste's
// poles — the crest and the slope above the crown are never in a frame below the header, and the poles read as specks
// (one fell in the header of the wide shot, one stood behind the section).
// Everything lives in the still mountain (pente.js `still`: it scrolls uphill past you by `travel`) and follows its
// X-ray (`shell`). Nothing moves on its own, nothing blinks: the trees are still, the sun is still.
//
//   dressSlope({ heightAt }) → { group, update(P, time, px) }   group: added to pente.js's `still` (the slope's frame)
//   P = { shell }
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, asShell } from "@kit/build3d.js";
import { makeDresser } from "@kit/details.js";
import { DEG, SLOPE, VALLEY } from "./plan.js";

const C = Math.cos(SLOPE * DEG);
const S = Math.sin(SLOPE * DEG);
/** World → the slope's frame (x across, h out of the snow, s downhill). */
const toSlope = ([x, y, z]) => [x, y * C + z * S, -y * S + z * C];

/** Position and normal only, non-indexed: every piece merged into one mesh carries the same attributes. */
function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  return o;
}
function merge(list) {
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", new THREE.Float32BufferAttribute(list.flatMap((g) => [...g.attributes.position.array]), 3));
  o.setAttribute("normal", new THREE.Float32BufferAttribute(list.flatMap((g) => [...g.attributes.normal.array]), 3));
  return o;
}

export function dressSlope({ heightAt = () => 0 } = {}) {
  const group = new THREE.Group();
  group.name = "habillage";
  const rand = rng(2909);
  /** Something upright in the WORLD (gravity), built y-up around its foot, stood at (x, h, s) of the slope's frame. */
  const upright = (geo, x, h, s) => geo.rotateX(-SLOPE * DEG).translate(x, h, s);

  /* ── THE FIRS: why — avalanche paths end in the forest, and a mountain with no tree has no scale. Sparse, in
     clumps, from 40 m below you down to the valley, never in the slab's path (|x| > 3000) nor in front of the chalet
     (the valley's camera looks down past you at it); a clump round the chalet. ── */
  const trees = [];
  const clump = (x, s) => 0.6 * Math.sin(x / 2300 + 1.3) * Math.sin(s / 2700 - 0.4) + 0.35 * Math.sin((x + 1.7 * s) / 1900 + 2.1);
  const CELL = 650;
  for (let s = 4000; s <= 30000; s += CELL)
    for (let x = -7800; x <= 7800; x += CELL) {
      const xx = x + rand() * CELL;
      const ss = s + rand() * CELL;
      const path = Math.abs(xx) < 3000 && ss < 21000;
      const corridor = Math.abs(xx - VALLEY.chalet[0]) < 2600 && ss > 14000 && ss < VALLEY.chalet[2] + 300;
      if (path || corridor) continue;
      const lower = Math.min(1, (ss - 4000) / 8000); // sparse high up, a little denser lower down
      if (clump(xx, ss) + 0.3 * lower - 0.15 < 0 || rand() > 0.22 + 0.35 * lower) continue;
      trees.push([xx, ss, 800 + rand() * 600, rand()]);
    }
  // nearer, on your RIGHT only (behind every camera that looks across the flow from your right — the section, the
  // side —, in the background of the shot that looks across from your left): a few firs 35 to 75 m away
  for (let s = 1500; s <= 6000; s += CELL)
    for (let x = -7600; x <= -3600; x += CELL) {
      const xx = x + rand() * CELL;
      const ss = s + rand() * CELL;
      if (clump(xx, ss) - 0.05 < 0 || rand() > 0.4) continue;
      trees.push([xx, ss, 800 + rand() * 500, rand()]);
    }
  // the clump round the chalet: behind it and on its sides (never between it and the camera, uphill of it)
  for (let i = 0; i < 9; i++) {
    const a = (-0.15 + 1.3 * (i / 8)) * Math.PI; // from its right side, round behind, to its left side
    const r = 1300 + rand() * 900;
    trees.push([VALLEY.chalet[0] + Math.cos(a) * r * 1.3, VALLEY.chalet[2] + 600 + Math.sin(a) * r, 700 + rand() * 500, rand()]);
  }
  const firs = [];
  for (const [x, s, h, k] of trees) {
    const r = h * (0.17 + 0.04 * k);
    const base = heightAt(s) - 40;
    for (const [at, len, w] of [[0.1, 0.42, 1], [0.3, 0.36, 0.8], [0.5, 0.3, 0.6], [0.68, 0.32, 0.4]]) {
      const cone = new THREE.ConeGeometry(r * w, h * len, 9, 1, true).rotateY(k * 6.28).translate(0, h * at + (h * len) / 2, 0);
      firs.push(bare(upright(cone, x, base, s)));
    }
  }
  const firMat = glass(BRAND.ink, { base: 0.002, rim: 0.1, power: 2.6, edge: 0.11, through: 0 });
  const forest = new THREE.Mesh(merge(firs), firMat);
  forest.frustumCulled = false;
  group.add(forest);

  asShell([forest], 22);

  /* ── A LOW WINTER SUN: why — the key light comes from downhill on your right; on a winter afternoon it is a sun
     a few degrees over the crests. Far (400 m), soft, a core and a long tail (≤ 1.2: it must not bleed). ── */
  const d = makeDresser({ order: 20, seed: 29 });
  const sunDir = new THREE.Vector3(-1, 0.08, 0.26).normalize().multiplyScalar(40000);
  d.glow({ at: toSlope(sunDir.toArray()), size: 7000, k: 0.75, kind: "far" });
  d.done();
  group.add(d.group);

  return {
    group,
    trees: trees.length,
    update(P, time, px) {
      const amount = P.shell ?? 1;
      group.visible = amount > 0.003;
      if (!group.visible) return;
      firMat.uniforms.uAmount.value = amount;
      d.update({ amount }, time, px);
    },
  };
}
