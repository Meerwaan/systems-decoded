// DOSSIER 027 — Voie de détresse : the dressing of the col (the decorator's file — docs/recette-decorateur.md).
// What a mountain road at night really has, seen like the rest of the place — X-ray glass and fine ink lines, never
// solid, never on the truck nor the lane, never in front of them:
//   · THE FOREST on the mountain's flank (left of the road): fir trees in clumps and clearings, from a few metres up the
//     slope to its crest — the mountain stops being a black mass, the scale of the place reads (a fir is 10 to 17 m), and
//     in the shots that ride with the truck its silhouettes file past high on the left, far from the road.
//   · THE TOP OF THE COL: the col's own sign (a blank board on two posts) and, just past the crest, the danger triangle
//     « descente dangereuse » (A14: its wedge going down, no figure) — where « il freinait sans arrêt depuis le haut du
//     col » begins: the long descent is announced there.
// Everything follows the place's X-ray (`shell`): when the place steps back, so does its dressing. Nothing moves: the
// trees are still (no wind: anything fine that sways flickers), the signs are still.
//
//   dressCol({ yRoad, mountainAt }) → { group, update(P, time, px) }   (group: in the road's frame, never moved)
//   P = { shell } — the col's own P (world.js → col.update)
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, asShell, lineMat } from "@kit/build3d.js";
import { MOUNTAIN, ROAD, PANEL } from "./plan.js";

const sz = (s) => -100 * s;

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

export function dressCol({ yRoad, mountainAt }) {
  const group = new THREE.Group();
  group.name = "habillage";
  const rand = rng(2707);
  const lineMats = [];
  const line = (segs, width, opacity) => {
    const mat = lineMat(BRAND.ink, width, { opacity });
    mat.userData.base = opacity;
    const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(segs), mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 23;
    group.add(mesh);
    lineMats.push(mat);
    return mesh;
  };

  /* ── THE FOREST: why — a col is a mountain road through the firs; without them the left of every frame is a black
     mass with no scale. Clumps and clearings (a slow field, not a carpet), sparse near the road so the foot of the
     mountain and the left verge stay clear, none round the bend's spur (the threat's side) nor past it. ── */
  const trees = [];
  const clump = (x, z) =>
    0.55 * Math.sin(x / 3300 + 1.3) * Math.sin(z / 2900 - 0.4) + 0.35 * Math.sin((x + 1.7 * z) / 2100 + 2.1) + 0.25 * Math.sin((x - z) / 5200);
  const CELL = 700;
  for (let z = sz(-300); z >= sz(232); z -= CELL)
    for (let off = 650; off <= 9000; off += CELL) {
      // jittered over a whole cell both ways: no rows, no columns, from any side
      const x = MOUNTAIN.foot - off - rand() * CELL;
      const zz = z - rand() * CELL;
      const s = -zz / 100;
      if (s > 232) continue;
      // a saddle at the col: fewer trees on its bare top; fewer near the road
      const near = Math.min(1, (off - 650) / 1800);
      const top = s < ROAD.top + 40 ? 0.45 : 1;
      const want = clump(x, zz) + 0.25 * near - 0.12;
      if (want < 0 || rand() > top * (0.3 + 0.6 * near)) continue;
      const [h0] = mountainAt(x, zz);
      if (h0 < 120) continue; // only on the slope itself, never on the verge
      const h = (800 + rand() * 700) * (0.7 + 0.3 * near);
      trees.push([x, yRoad(zz) + h0 - 70, zz, h, rand()]);
    }
  const firs = [];
  for (const [x, y, z, h, k] of trees) {
    const r = h * (0.17 + 0.04 * k);
    // a fir: four tiers of branches, each a cone open underneath (a closed base reads as a lampshade), narrower going
    // up, each one's skirt over the next one's top — the jagged silhouette, nothing flat
    const tiers = [
      [0.1, 0.42, 1],
      [0.3, 0.36, 0.8],
      [0.5, 0.3, 0.6],
      [0.68, 0.32, 0.4],
    ];
    for (const [at, len, w] of tiers) {
      const cone = new THREE.ConeGeometry(r * w, h * len, 9, 1, true).rotateY(k * 6.28).translate(x, y + h * at + (h * len) / 2, z);
      firs.push(bare(cone));
    }
  }
  const firMat = glass(BRAND.ink, { base: 0.002, rim: 0.1, power: 2.6, edge: 0.11, through: 0 });
  const forest = new THREE.Mesh(merge(firs), firMat);
  forest.frustumCulled = false;
  group.add(forest);
  asShell([forest], 22);

  /* ── THE TOP OF THE COL: why — « depuis le haut du col »: the col's sign says where the top is, the triangle just
     past it says what starts there. Both on the right verge, facing the traffic coming over the crest (+z), no text. ── */
  const signs = [];
  const segs = [];
  const fine = [];
  const S = (a, b, list = segs) => list.push(...a, ...b);
  const X = PANEL.x + 10; // the verge's sign line (where the lane's own sign stands, far below)
  {
    // the col's board: 120 × 80 on two posts, its frame and an inner frame (where the name and the altitude would be)
    const z = sz(ROAD.top + 4);
    const y = yRoad(z);
    const [w, hh, bottom] = [120, 80, 170];
    for (const dx of [-42, 42]) signs.push(bare(new THREE.BoxGeometry(6, bottom + hh, 6).translate(X + dx, y + (bottom + hh) / 2, z - 4)));
    signs.push(bare(new THREE.BoxGeometry(w, hh, 3).translate(X, y + bottom + hh / 2, z)));
    const c = [X, y + bottom + hh / 2, z + 2];
    const rect = (hw, hh2, list) => {
      const p = [[-hw, -hh2], [hw, -hh2], [hw, hh2], [-hw, hh2]].map(([a, b]) => [c[0] + a, c[1] + b, c[2]]);
      for (let i = 0; i < 4; i++) S(p[i], p[(i + 1) % 4], list);
    };
    rect(w / 2, hh / 2, segs);
    rect(w / 2 - 9, hh / 2 - 9, fine);
  }
  {
    // the danger triangle, 15 m past the crest: point up, 100 cm a side, its border and the wedge going down
    const z = sz(ROAD.top + 19);
    const y = yRoad(z);
    const side = 100;
    const cy = y + 215;
    signs.push(bare(new THREE.BoxGeometry(7, 215, 7).translate(X, y + 107, z - 4)));
    const tri = new THREE.Shape([new THREE.Vector2(-side / 2, 0), new THREE.Vector2(side / 2, 0), new THREE.Vector2(0, side * 0.866)]);
    signs.push(bare(new THREE.ExtrudeGeometry(tri, { depth: 3, bevelEnabled: false }).translate(X, cy - side * 0.29, z - 1)));
    const P = (u, v) => [X + u, cy - side * 0.29 + v, z + 2.5];
    const outer = [P(-side / 2, 0), P(side / 2, 0), P(0, side * 0.866)];
    for (let i = 0; i < 3; i++) S(outer[i], outer[(i + 1) % 3]);
    const inner = [P(-side / 2 + 15, 8.7), P(side / 2 - 15, 8.7), P(0, side * 0.866 - 17)];
    for (let i = 0; i < 3; i++) S(inner[i], inner[(i + 1) % 3], fine);
    // the wedge: the road going down to the right, filled by three strokes
    const wedge = [P(-24, 33), P(24, 17), P(-24, 17)];
    for (let i = 0; i < 3; i++) S(wedge[i], wedge[(i + 1) % 3]);
    S(P(-24, 25), P(0, 17));
  }
  const signMat = glass(BRAND.ink, { base: 0.004, rim: 0.16, power: 2.2, edge: 0.3, through: 0 });
  const signMesh = new THREE.Mesh(merge(signs), signMat);
  signMesh.frustumCulled = false;
  group.add(signMesh);
  asShell([signMesh], 22);
  line(segs, 2.2, 0.62);
  line(fine, 1.8, 0.36);

  return {
    group,
    trees: trees.length,
    update(P) {
      const amount = P.shell ?? 1;
      group.visible = amount > 0.003;
      if (!group.visible) return;
      firMat.uniforms.uAmount.value = amount;
      signMat.uniforms.uAmount.value = amount;
      for (const mat of lineMats) mat.opacity = mat.userData.base * amount;
    },
  };
}
