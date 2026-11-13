// DOSSIER 048 — Tunnelier : the DRESSING of the street (docs/recette-decorateur.md). What a Paris street has at night
// that the section did not yet say — never on the machine, never in front of it, never on the column, the trough
// or the gauge. All ink, X-ray glass and fine lines; nothing solid, no text, nothing that blinks. plan.js coordinates.
//
//   dressStreet() → { group, update(p, time, px) }      p = rue.js's own state: { street, town }
//     street  everything here follows the street's X-ray (when the street steps back, so does its dressing)
//     town    the far skyline steps out when the town is seen from above (it would stand among its blocks)
// (tried and taken out, 13/11: a sewer gallery under the far sidewalk and its manhole — at 270 px they read as two
// more lines under the road, not as a gallery, and the sewer crossed the top of the first frame)
//
// The touches, and why:
//   · the STREET LAMPS lit — rue.js's three posts get their light: a heart and a long tail at the lantern (it is
//     night; a street is read by its lamps)
//   · the CITY far beyond — rooftops of glass and a few late windows, kilometres behind the building: the street is
//     one street of a city, not a model on a table
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, lineMat } from "@kit/build3d.js";
import { makeDresser } from "@kit/details.js";
import { STREET } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
// drawn after the street (32) and the building (34): plain additive glass, no depth hold — it hides nothing
const ORDER = 38;

export function dressStreet() {
  const group = new THREE.Group();
  group.name = "habillage";
  const far = new THREE.Group(); // the skyline: it steps out for the town
  group.add(far);
  const farPanes = [];
  const farInks = [];
  const pane = (geo, o, k, list, parent) => {
    const mat = glass(BRAND.ink, o);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = ORDER;
    mesh.frustumCulled = false;
    parent.add(mesh);
    list.push([mat, k]);
    return mesh;
  };
  const bake = (P, width, opacity, list, parent) => {
    const mat = lineMat(BRAND.ink, width, { opacity });
    const obj = new LineSegments2(new LineSegmentsGeometry().setPositions(P), mat);
    obj.renderOrder = ORDER + 1;
    obj.frustumCulled = false;
    parent.add(obj);
    list.push([mat, opacity]);
    return obj;
  };
  const poly = (P, pts, closed = false) => {
    const n = pts.length - (closed ? 0 : 1);
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      P.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    }
  };

  /* ── the street lamps lit: rue.js's three posts (lantern at y 465, on the far sidewalk) ── */
  // (no pool on the ground: in the wide shots the lamps stand at the frame's right edge, their pool would fall
  // under TikTok's buttons — the heart and its tail say the light alone)
  const d = makeDresser({ order: ORDER + 2, tone: 0.8 });
  for (const x of [-2300, 1250, 3900]) d.glow({ at: [x, 15 + 420 + 30, -(STREET.carriage + 45)], size: 300, k: 1.25 });
  d.done();
  group.add(d.group);

  /* ── the city far beyond: rooftops of glass and a few late windows, behind the building ── */
  const rand = rng(4811);
  const roofs = [];
  const wins = [];
  const winCol = [];
  const put = (x0, x1, y0, y1, z, k) => {
    for (const [px, py] of [[x0, y0], [x1, y0], [x1, y1], [x0, y0], [x1, y1], [x0, y1]]) {
      wins.push(px, py, z);
      winCol.push(INK.r * k, INK.g * k, INK.b * k);
    }
  };
  for (const row of [{ z: -4600, k: 1 }, { z: -7400, k: 0.6 }]) {
    let x = -9000 + rand() * 600;
    while (x < 9000) {
      const w = 900 + rand() * 900;
      const h = 1650 + Math.floor(rand() * 4) * 300; // five to eight storeys of a Paris block
      const z = row.z - rand() * 500;
      const mans = 160 + rand() * 120; //              the mansard's break
      // its outline against the night: the front's sides, the mansard's slope, the ridge, a chimney now and then
      poly(roofs, [[x, 0, z], [x, h, z], [x + 70, h + mans, z], [x + w - 70, h + mans, z], [x + w, h, z], [x + w, 0, z]]);
      if (rand() < 0.6) {
        const cx = x + 120 + rand() * (w - 280);
        poly(roofs, [[cx, h + mans, z], [cx, h + mans + 110, z], [cx + 60, h + mans + 110, z], [cx + 60, h + mans, z]]);
      }
      pane(new THREE.PlaneGeometry(w, h).translate(x + w / 2, h / 2, z), { base: 0.006, rim: 0, power: 1, edge: 0, through: 0 }, 1, farPanes, far);
      // a few windows still lit at this hour
      for (let f = 1; f < h / 300 - 0.5; f++)
        for (let wx = x + 90; wx < x + w - 140; wx += 160)
          if (rand() < 0.06) put(wx, wx + 100, f * 300 + 70, f * 300 + 210, z + 1, (0.18 + 0.2 * rand()) * row.k);
      x += w + (rand() < 0.25 ? 900 + rand() * 600 : 0); // now and then a street opens between two blocks
    }
  }
  bake(roofs, 1.8, 0.2, farInks, far);
  const winGeo = new THREE.BufferGeometry();
  winGeo.setAttribute("position", new THREE.Float32BufferAttribute(wins, 3));
  winGeo.setAttribute("color", new THREE.Float32BufferAttribute(winCol, 3));
  const winMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const winMesh = new THREE.Mesh(winGeo, winMat);
  winMesh.renderOrder = ORDER;
  winMesh.frustumCulled = false;
  far.add(winMesh);

  return {
    group,
    update(p = {}, time = 0, px = 1) {
      const sh = clamp01(p.street ?? 1);
      group.visible = sh > 0.003;
      if (!group.visible) return;
      d.update({ amount: sh }, time, px);
      const fa = sh * (1 - clamp01((p.town ?? 0) * 3));
      far.visible = fa > 0.003;
      for (const [mat, k] of farPanes) mat.uniforms.uAmount.value = fa * k;
      for (const [mat, o] of farInks) mat.opacity = o * fa;
      winMat.opacity = fa;
    },
  };
}
