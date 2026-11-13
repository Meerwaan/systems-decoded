// DOSSIER 046 — Torchère : THE DRESSING of the refinery at dusk (raffinerie.js). Recipe: docs/recette-decorateur.md.
// Journal: docs/journal/046-habillage.md. Never on the flare network nor in front of it, never on the dishwasher (047),
// nothing new in the sky (the set already has its dusk and its far plant).
//
//   dressRaffinerie() → { group, update(p, time) }   p.amount: the set's X-ray (`shell`, 0 on the bench)
//
// The touches, each with its reason:
//   · the plant's lamps   at 16:30 in winter the plant is running and its lights are on: still points on the far units'
//                         platforms, tank tops and rack — a place where people work, without a person in the picture
//   · the site road       its street lamps every 25 m along the far −z side (z −52 m), from x −15 m outward: scale (a
//                         lamp is 10 m) and a row of lights across the dark upper-left of the wide shots (the plant at
//                         rest, « rien n’a explosé »); out of the first frame and of the window shot
//   · the windsock        every flare site has one: it says where a gas would go. It hangs toward −x, the way flamme.js
//                         lays the smoke (WIND −1) — over the plant. It sways slowly, never flutters
// Everything is ink, glass and fine lines; it follows `amount` and `time` only (allocates nothing in update).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makeDresser } from "@kit/details.js";
import { glass, asShell, lineMat } from "@kit/build3d.js";

const TAU = Math.PI * 2;

/** One family of fine ink lines; `base` its opacity at amount 1. */
function lines(segs, { width = 1.8, base = 0.3, fog = true, order = 24, color = BRAND.ink } = {}) {
  const mat = lineMat(color, width, { opacity: base, fog });
  mat.userData.k = base;
  const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(segs), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return { mesh, mat };
}
const ring = (out, c, r, n, a0 = 0) => {
  // a ring in the plane perpendicular to x (the sock's axis)
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * TAU;
    const b = a0 + ((i + 1) / n) * TAU;
    out.push(c[0], c[1] + r * Math.cos(a), c[2] + r * Math.sin(a), c[0], c[1] + r * Math.cos(b), c[2] + r * Math.sin(b));
  }
};

export function dressRaffinerie() {
  const group = new THREE.Group();
  group.name = "habillage";
  const d = makeDresser({ order: 24, tone: 0.8, seed: 46 });

  /* ── the plant's lamps: on the far units (raffinerie.js UNITS, x −2800 → −4600) and its long rack (x −2750) ── */
  const LAMPS = [
    [-3220, 1240, -380], [-3230, 640, -260], // the tall far column: its top platform, a middle one
    [-3610, 880, 500], [-2960, 780, -1580], // the two smaller columns
    [-3350, 650, 1450], [-3980, 650, 1150], // the sphere tanks' tops
    [-3150, 330, -2130], [-2980, 470, 940], // the two blocks (control, substation)
    [-3400, 600, -2200], [-4200, 600, -2200], // the air cooler's walkway
    [-2630, 540, -2600], [-2630, 540, -800], [-2630, 540, 1000], // the long rack
  ];
  for (const at of LAMPS) d.glow({ at, size: 240, k: 1.5, kind: "far" });

  /* ── the site road: street lamps every 30 m, leaving toward +x −z ── */
  const ROAD = { from: [-1500, -5200], dir: [1, 0], every: 2500, count: 5, h: 1000, arm: 160 };
  const poles = [];
  for (let i = 0; i < ROAD.count; i++) {
    const x = ROAD.from[0] + ROAD.dir[0] * ROAD.every * i;
    const z = ROAD.from[1] + ROAD.dir[1] * ROAD.every * i;
    // the arm reaches over the road (to the lamp's left, looking down the road)
    const ax = x - ROAD.dir[1] * ROAD.arm;
    const az = z + ROAD.dir[0] * ROAD.arm;
    poles.push(x, 0, z, x, ROAD.h, z, x, ROAD.h, z, ax, ROAD.h - 20, az);
    d.glow({ at: [ax, ROAD.h - 40, az], size: 280, k: 1.6, kind: "far" });
  }
  const pole = lines(poles, { width: 1.8, base: 0.22 });
  group.add(pole.mesh);
  d.done();
  group.add(d.group);

  /* ── the windsock on its mast, 14 m past the stack, away from the network (x +1400, z +400), hanging toward −x ── */
  const MAST = { at: [1400, 400], h: 1400 };
  const mastSegs = [];
  mastSegs.push(MAST.at[0], 0, MAST.at[1], MAST.at[0], MAST.h + 40, MAST.at[1]);
  for (const y of [MAST.h * 0.35, MAST.h * 0.7]) {
    // the climbing rungs' brackets, two short ticks
    mastSegs.push(MAST.at[0] - 18, y, MAST.at[1], MAST.at[0] + 18, y, MAST.at[1]);
  }
  // on the stack’s halo an ink line vanishes: a dark stroke under it makes the mast a silhouette there (as at dusk)
  const mastDark = lines(mastSegs, { width: 4.5, base: 0.85, fog: false, order: 23, color: 0x07090b });
  const mast = lines(mastSegs, { width: 2.2, base: 0.55, fog: false });
  group.add(mastDark.mesh, mast.mesh);
  const sock = new THREE.Group(); // pivots on the mast top
  sock.position.set(MAST.at[0], MAST.h, MAST.at[1]);
  group.add(sock);
  const SOCK = { len: 380, r0: 48, r1: 18 };
  const geo = new THREE.CylinderGeometry(SOCK.r1, SOCK.r0, SOCK.len, 24, 1, true);
  geo.rotateZ(Math.PI / 2); // its axis along x: the tail (top) toward −x
  geo.translate(-SOCK.len / 2, 0, 0);
  const sockMat = glass(BRAND.ink, { base: 0.004, rim: 0.2, power: 2.4, edge: 0.22, spec: 0.2, through: 0.16 });
  const sockMesh = new THREE.Mesh(geo, sockMat);
  sockMesh.frustumCulled = false;
  asShell([sockMesh], 24);
  const bands = [];
  for (let i = 0; i <= 5; i++) {
    const u = i / 5;
    ring(bands, [-SOCK.len * u, 0, 0], SOCK.r0 + (SOCK.r1 - SOCK.r0) * u, 20);
  }
  const bandDark = lines(bands, { width: 4.5, base: 0.85, fog: false, order: 23, color: 0x07090b });
  const band = lines(bands, { width: 2.2, base: 0.7, fog: false, order: 25 });
  sock.add(bandDark.mesh, sockMesh, band.mesh);
  const LM = [pole.mat, mastDark.mat, mast.mat, bandDark.mat, band.mat];

  return {
    group,
    /** p.amount follows the set's `shell` (0 on the bench: nothing here). Uniforms and two angles only. */
    update(p, time) {
      const a = p.amount > 0 ? Math.min(1, p.amount) : 0;
      group.visible = a > 0.003;
      if (!group.visible) return;
      d.update({ amount: a, lamp: 1, motes: 0 }, time, 1);
      for (let i = 0; i < LM.length; i++) LM[i].opacity = LM[i].userData.k * a;
      sockMat.uniforms.uAmount.value = a;
      // a steady breeze: the sock droops a little and swings slowly round the mast (≈ 0.06 Hz; never a flutter)
      sock.rotation.set(0, 0.1 * Math.sin(time * 0.37) + 0.04 * Math.sin(time * 0.83 + 1.3), 0.16 + 0.03 * Math.sin(time * 0.51 + 0.4), "YXZ");
    },
  };
}
