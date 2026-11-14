// DOSSIER 052 — Télésiège débrayable : the dressing of the line and the station's mouth (the decorator's file —
// docs/recette-decorateur.md). What a chairlift really has around it, seen like the rest of the set — X-ray glass and
// fine ink, never solid, never on the grip nor the chair, never inside the station's housing:
//   · THE FIRS on the slope under the line, sparse, in clumps, outside the lift's clearing (|z| > 13 m): a fir is 8 to
//     14 m, so the hollow past the mouth and the steep span get their scale (« sous toi… la pente »). Never between
//     the comment's camera (steep, from +z) and the chair, nor in the station.
//   · YOUNG FIRS in the hollow right past the mouth (3 to 5 m, well under the chairs): the depth of the exit shot.
//   · THE SNOW in the night air over the hollow: slow streaks falling, the exit shot gets depth.
// Everything is in plan.js coordinates (ligne.js's group, never moved) and follows the line's X-ray (`line`).
// Tried and taken out (docs/journal/052-habillage.md): the mouth's two lamps (in no shot), the top station's far light
// (a moon in the header of the first frame), the firs behind the chair in the first frame (grass at 270 px).
// Nothing blinks, nothing thin turns: the trees and the lamps are still, the snow falls slowly.
//
//   dressLine() → { group, update(P, time, px) }   group: added to ligne.js's group
//   P = { line }
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, asShell } from "@kit/build3d.js";
import { makeDresser } from "@kit/details.js";
import { STATION, LINE, STEEP_X, groundAt } from "./plan.js";

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

export function dressLine() {
  const group = new THREE.Group();
  group.name = "habillage";
  const rand = rng(5207);

  /* ── THE FIRS: why — a chairlift climbs through a clearing in the forest; without a tree the hollow and the slope
     have no scale. Clumps on both sides, from just past the mouth up to where the line goes out of sight. ── */
  const clump = (x, z) => 0.6 * Math.sin(x / 2100 + 0.7) * Math.sin(z / 2500 - 0.3) + 0.35 * Math.sin((x + 1.6 * z) / 1700 + 1.9);
  const CELL = 700;
  // the first frame looks out of the mouth from inside, low (POSE0): through it, a fringe of firs on the horizon read as
  // grass behind the chair (planche « après », 270 px) — none in its cone, the hook keeps its plain night behind you
  const HOOK_EYE = [562, -20];
  const HOOK_AXIS = Math.atan2(-240, 738);
  // (17° up to the steep span, whose -z firs stay for the comment's shot; 25° on the far slope, seen over the mouth)
  const behindHook = (x, z) => Math.abs(Math.atan2(z - HOOK_EYE[1], x - HOOK_EYE[0]) - HOOK_AXIS) < (x < 15000 ? 17 : 25) * Math.PI / 180;
  const trees = [];
  for (let x = STATION.mouth + 400; x <= LINE.top + 1500; x += CELL)
    for (let z = -9800; z <= 9800; z += CELL) {
      const xx = x + rand() * CELL;
      const zz = z + rand() * CELL;
      if (Math.abs(zz) < 1300) continue; // the lift's clearing
      if (zz > 0 && xx > STEEP_X - 2800 && xx < STEEP_X + 2800 && zz < 5200) continue; // between the comment's camera and the chair
      if (behindHook(xx, zz)) continue;
      if (clump(xx, zz) + 0.1 < 0 || rand() > 0.42) continue;
      trees.push([xx, zz, 800 + rand() * 600, rand()]);
    }
  // young firs in the hollow right past the mouth, under the line where the cable is high over them (3 to 5 m: their
  // tops stay ≥ 2 m under the chairs): the depth of « sous toi… la pente » from the exit shot, which looks down into it
  for (const [xx, zz] of [[2350, 300], [2700, 700], [2950, 60], [3250, 980], [3500, 420], [3800, 150], [2550, 1050], [3100, -60]])
    trees.push([xx, zz, 300 + rand() * 200, rand()]);
  const firs = [];
  for (const [x, z, h, k] of trees) {
    const r = h * (0.17 + 0.04 * k);
    const base = groundAt(x) - 50;
    for (const [at, len, w] of [[0.1, 0.42, 1], [0.3, 0.36, 0.8], [0.5, 0.3, 0.6], [0.68, 0.32, 0.4]]) {
      const cone = new THREE.ConeGeometry(r * w, h * len, 9, 1, true).rotateY(k * 6.28).translate(x, base + h * at + (h * len) / 2, z);
      firs.push(bare(cone));
    }
  }
  const firMat = glass(BRAND.ink, { base: 0.002, rim: 0.1, power: 2.6, edge: 0.11, through: 0 });
  const forest = new THREE.Mesh(merge(firs), firMat);
  forest.frustumCulled = false;
  group.add(forest);
  asShell([forest], 22);

  const d = makeDresser({ order: 20, seed: 52 });
  /* ── THE SNOW: why — a mountain at night; it falls slowly past the mouth and over the hollow (streaks, never dots). ── */
  d.motes({ min: [STATION.mouth - 200, -700, -1300], size: [3200, 1700, 2600], count: 300, drift: [12, -45, 4], psize: [3.5, 6], k: 0.45 });
  d.done();
  group.add(d.group);

  return {
    group,
    trees: trees.length,
    update(P, time, px = 1) {
      const amount = P.line ?? 1;
      group.visible = amount > 0.003;
      if (!group.visible) return;
      firMat.uniforms.uAmount.value = amount;
      d.update({ amount }, time, px);
    },
  };
}
