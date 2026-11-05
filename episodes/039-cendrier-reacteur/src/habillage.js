// DOSSIER 039 — the dressing of the reactor building's basement (batiment.js), X-ray. The decorator's recipe:
// docs/recette-decorateur.md · journal: docs/journal/039-habillage.md.
//
//   dressBatiment() → { group, update(P, time, px) }   — hung in batiment.js's `building`: gone with it (bench, `shell`)
//
// The plant has scrammed and its core is melting: nobody is left in the building, the normal lighting is down. What
// is alive here is what a plant keeps alive when everything else stops. Every touch stands BEHIND the plant (on the
// containment's arc, or on the far wall of the chamber's room), never over the chamber nor between the usual camera
// (az −10 … −55) and the system; seen above all in the wide shots (chamberLow, graze, pitSide, the loop).
//   1. EMERGENCY LIGHTS on the containment, a row at a storey's height: small fixtures, each a light that has a place
//      (a core, a tail) and its light running down the wall — the depth of the dark behind the plant, its scale (a
//      lamp every few metres), « the building is on its emergency lighting ».
//   2. TWO LAMPS ON THE FAR WALL of the chamber's room, over the channel's mouth: the empty room has a back, and a
//      light that waits over the way the melt will come.
//   3. A STAIR down the containment wall to the basement floor, its handrail: the one thing at a person's scale — and
//      nobody on it.
// What each follows: `shell` (the building's X-ray; 0 on the bench). Nothing moves, nothing flickers.
// Tried and taken out (journal): two alarm beacons, signal, breathing — at 270 px a red speck by the vessel, read as
// a stray ember; the threat already has its light.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { lineMat } from "@kit/build3d.js";
import { makeDresser } from "@kit/details.js";
import { CHAMBER, BASEMENT } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function dressBatiment() {
  const group = new THREE.Group();
  group.name = "habillage";
  const F = BASEMENT.floor;
  const [cx, , cz] = BASEMENT.centre;
  const R = BASEMENT.containment;
  // a point on the containment's inner face (stage azimuth: 0 = +z), `inset` cm toward the centre; and its inward normal's yaw
  const wall = (a, y, inset = 8) => [cx + (R - inset) * Math.sin(a * DEG), y, cz + (R - inset) * Math.cos(a * DEG)];
  const faceIn = (a) => a * DEG + Math.PI; // a plane's front (+z) turned to look at the centre

  const d = makeDresser({ order: 26, tone: 0.8, seed: 39 });
  const seg = []; // fine ink lines: the fixtures, the stair
  const ln = (a, b) => seg.push(...a, ...b);

  // 1 · emergency lights: a row on the containment, 4 m over the basement floor, every ≈ 5 m, behind the plant (where the
  //     wide shots look: az 150 … 205); none straight behind the vessel
  const LAMP_Y = F + 400;
  for (const a of [146, 158, 170, 190, 202, 214]) {
    const p = wall(a, LAMP_Y, 14);
    d.glow({ at: p, size: 210, k: 0.9 });
    d.wash({ at: wall(a, LAMP_Y - 6, 4), w: 300, h: 480, k: 0.34, rotY: faceIn(a) });
    // the fixture: a short bar on the wall
    const t = [Math.cos(a * DEG), 0, -Math.sin(a * DEG)];
    const q = wall(a, LAMP_Y + 8, 6);
    ln([q[0] - 40 * t[0], q[1], q[2] - 40 * t[2]], [q[0] + 40 * t[0], q[1], q[2] + 40 * t[2]]);
  }

  // 2 · the chamber room's far wall (over the channel's mouth): two lamps and their light down the glass
  const zW = CHAMBER.z0 - BASEMENT.room + 6;
  for (const x of [-380, 380]) {
    d.glow({ at: [x, 150, zW + 10], size: 90, k: 0.75 });
    d.wash({ at: [x, 144, zW], w: 170, h: 300, k: 0.12 });
    ln([x - 30, 158, zW + 4], [x + 30, 158, zW + 4]);
  }

  // 3 · a stair down the containment wall (two flights and a landing, its handrail), on the right of the usual view (graze, chamberLow)
  {
    const A0 = 132;
    const A1 = A0 + 26;
    const s0 = wall(A0, F, 40);
    const s1 = wall(A1, F, 40);
    const dir = [s1[0] - s0[0], 0, s1[2] - s0[2]];
    const L = Math.hypot(dir[0], dir[2]);
    dir[0] /= L;
    dir[2] /= L;
    const nIn = [-dir[2], 0, dir[0]]; // toward the centre (A increases anticlockwise seen from above: check sign below)
    const mid = wall((A0 + A1) / 2, F, 0);
    const toC = [cx - mid[0], 0, cz - mid[2]];
    if (nIn[0] * toC[0] + nIn[2] * toC[2] < 0) (nIn[0] = -nIn[0]), (nIn[2] = -nIn[2]);
    const W = 110; // the stair's width
    const H = (BASEMENT.ceiling - F) / 2; // each flight climbs half a storey
    const run = (L - 140) / 2;
    const at = (u, y, w) => [s0[0] + dir[0] * u + nIn[0] * w, y, s0[2] + dir[2] * u + nIn[2] * w];
    // flight 1: 0 → run, F → F + H; landing run → run + 140 at F + H; flight 2: → L, → F + 2H
    const pts = [[0, F], [run, F + H], [run + 140, F + H], [L, F + 2 * H]];
    for (let i = 1; i < pts.length; i++) {
      const [u0, y0] = pts[i - 1];
      const [u1, y1] = pts[i];
      for (const w of [0, W]) ln(at(u0, y0, w), at(u1, y1, w)); // the stringers (the landing's edges)
      ln(at(u0, y0 + 100, W), at(u1, y1 + 100, W)); // the handrail, on the open side
    }
    // the steps: every other tread (a stair reads by its rhythm, not by forty lines)
    for (const [u0, y0, u1, y1] of [[0, F, run, F + H], [run + 140, F + H, L, F + 2 * H]]) {
      const n = 12;
      for (let k = 1; k < n; k++) {
        const f = k / n;
        const u = u0 + (u1 - u0) * f;
        const y = y0 + (y1 - y0) * f;
        ln(at(u, y, 0), at(u, y, W));
      }
    }
    // the handrail's posts
    for (const [u, y] of [[0, F], [run * 0.5, F + H * 0.5], [run, F + H], [run + 140, F + H], [run + 140 + run * 0.5, F + 1.5 * H], [L, F + 2 * H]]) ln(at(u, y, W), at(u, y + 100, W));
  }
  d.done();
  group.add(d.group);

  const lineM = lineMat(BRAND.ink, 1.8, { opacity: 0.3 });
  const lines = new LineSegments2(new LineSegmentsGeometry().setPositions(seg), lineM);
  lines.frustumCulled = false;
  lines.renderOrder = 27;
  group.add(lines);

  return {
    group,
    /** P: batiment.js's numbers — `shell`, `bench`. No allocation. */
    update(P, time, px = 1) {
      const s = P.bench ? 0 : clamp01(P.shell ?? 1);
      group.visible = s > 0.003;
      if (!group.visible) return;
      d.update({ amount: s }, time, px);
      lineM.opacity = 0.3 * s;
    },
  };
}
