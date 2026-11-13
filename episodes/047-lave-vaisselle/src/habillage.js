// DOSSIER 047 — Lave-vaisselle : THE DRESSING (docs/recette-decorateur.md). The life the place has at night, around
// the machine — never on the system, never in front of it, nothing that loads the hook (POSE0, under the basket):
//   · the night's load: glasses and bowls upside down in the UPPER basket — an eco programme runs full, the gratin
//     dish is not alone in there (follows the X-ray of the machine, `shell`). Seen from BELOW (the hook, POSE0 el −16;
//     the crust from under it; the loop rising through the floor) they stand right over the dish and blur its
//     silhouette: they fade out as the camera goes under −4° of elevation, gone under −10°
//   · steam in the tub, slow streaks rising: the water is hot (follows `heat` — cold in the hook, it is the pre-wash)
//   · the kitchen light on the floor in the evening, gone when « tu vas dormir » (follows `night`: 0 lit → 1 off)
// Everything is ink, X-ray glass and fine lines; no light of its own on the system.
//
//   dressScene(stage) → { group, update(W, time, px) }   group stands at the origin (plan.js coordinates), in world.set
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, edgesOf, lathe, placed } from "@kit/build3d.js";
import { makeDresser } from "@kit/details.js";
import { makePool } from "@kit/atmo.js";
import { RACK2, TUB } from "./plan.js";
import { SET } from "./world.js";

const DEG = Math.PI / 180;

/** Glass that steps back: less rim than the machine's own, so a glass in the basket never outshines the circuit. */
const quietGlass = () => glass(BRAND.ink, { base: 0.003, rim: 0.13, power: 2.4, edge: 0.16, spec: 0.18, through: 0.14 });

/** Things of glass, each with its outline; one material, one amount. */
function glassSet(order) {
  const group = new THREE.Group();
  const mat = quietGlass();
  const lines = [];
  return {
    group,
    add(geometry, o, line = 0.3) {
      const geo = placed(geometry, o);
      if (geometry.userData.edges) geo.userData.edges = placed(geometry.userData.edges, o);
      const mesh = new THREE.Mesh(geo, mat);
      asShell(mesh, order);
      const e = edgesOf(geo, { width: 1.8, opacity: line });
      e.material.userData.base = line;
      e.renderOrder = order + 1;
      group.add(mesh, e);
      lines.push(e.material);
    },
    amount(a) {
      group.visible = a > 0.003;
      mat.uniforms.uAmount.value = a;
      for (const m of lines) m.opacity = m.userData.base * a;
    },
  };
}

export function dressScene(stage) {
  const group = new THREE.Group();
  group.name = "habillage";

  /* ── 1 · the night's load, upside down in the upper basket (left: glasses; right: two bowls leaning) ── */
  const load = glassSet(20);
  const y0 = RACK2.y0 + 0.6;
  const tumbler = lathe([[3.4, 0], [3.0, 9.6], [0, 9.8]], 40, { bevel: 0.4 }); // open rim down, closed base up
  for (const x of [-20, -12.5, -5]) for (const z of [-15, -5]) load.add(tumbler, { pos: [x, y0, z] });
  const bowl = lathe([[7, 0], [6.5, 2.8], [5, 4.8], [3.3, 5.5], [3.3, 6.1], [0, 6.1]], 48, { bevel: 0.4 });
  load.add(bowl, { pos: [15, y0 + 1.2, -12], rotX: -22 * DEG });
  load.add(bowl, { pos: [15, y0 + 1.2, 4], rotX: -22 * DEG });
  group.add(load.group);

  /* ── 2 · steam in the tub: the water is warm, the air above the dish is wet (rises, slow streaks) ── */
  const steam = makeDresser({ order: 15, seed: 47 }); // drawn BEFORE the machine's glass (21): its depth hold would hide what is inside the tub
  steam.motes({ min: [TUB.x0 + 2, 34, TUB.z0 + 2], size: [TUB.x1 - TUB.x0 - 4, TUB.y1 - 36, TUB.z1 - TUB.z0 - 4], count: 90, drift: [0.15, 2.4, 0.05], psize: [0.3, 0.7], k: 0.7 });
  steam.done();
  group.add(steam.group);

  /* ── 3 · the evening: the ceiling light on the floor in front of the machine and the sink; off when you go to bed ── */
  const pool = makePool({ radius: 170, color: BRAND.ink });
  pool.mesh.position.set(-30, 0.4, 70);
  pool.mesh.renderOrder = 25;
  group.add(pool.mesh);

  return {
    group,
    /** W: the director's state (world.js FIRST) — shell, heat, room, night. */
    update(W, time, px) {
      if (W.set === SET.BENCH) return; // the scene is hidden on the bench
      const el = stage.pose?.el ?? stage.cam.el; // the camera's elevation, degrees
      load.amount(W.shell * THREE.MathUtils.smoothstep(el, -10, -4));
      steam.update({ amount: W.shell * W.heat, motes: 1 }, time, px);
      const lamp = W.room * (1 - W.night);
      pool.mesh.visible = lamp > 0.003;
      pool.uniforms.uAmount.value = 0.2 * lamp;
    },
  };
}
