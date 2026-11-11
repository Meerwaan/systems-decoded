// DOSSIER 042 — the dressing of char.js: the life of the place, a tank alone in a field at night. Never on the system
// (the caisson), never in front of it, never in front of the column (feu.js). X-ray like the rest: ink lines and soft
// points, nothing solid, nothing that flickers. Each touch says one thing about the place:
//
//   · THE TREE LINE (two layers: a ragged edge of wood ≈ 300 m off, a low ridge ≈ 1.2 km off): « dehors, la nuit, en
//     rase campagne » — the hook stops being a tank in a void; when the camera glides, the two layers slide against each
//     other and the night gets its depth. Only in the half the wide shots look into (−z), only seen from low (the eye
//     under ≈ 2 m: from higher up, or from inside the turret, it would climb into the header), never in front of the
//     tank (drawn after the tank's glass writes its depth: the hull hides it), never behind the gun of the hook (a field).
// Tried and taken out (not seen at 270 px, a stray speck at best): the ruts behind the tank (grazing: flat), the crew's
// lit screens, a farm's lights far away (docs/journal/042-habillage.md).
//
// `update(P, time, px, eye)`: P is char.js's own (shell); sixteen times per frame, uniforms only.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { lineMat } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { GROUND } from "./plan.js";

const Y0 = GROUND.y;
const C = [-160, 0]; // the tank's middle on the ground (x, z)
const DEGR = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Segments with a colour per end (ink × fade): one draw, additive, no fog (far lines sink by their own fade). */
function segments(pos, col, width, opacity, order) {
  const g = new LineSegmentsGeometry().setPositions(pos);
  g.setColors(col);
  const mat = lineMat(BRAND.ink, width, { opacity, additive: true, vertexColors: true });
  mat.color.set(0xffffff); // the colour is in the vertices
  const mesh = new LineSegments2(g, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return { mesh, mat, opacity };
}

/** The half the wide shots look into (θ: the direction from the tank, from +x toward +z), its two ends sunk in the night. */
const env = (th) => smooth(-176, -160, th / DEGR) * (1 - smooth(-16, -4, th / DEGR));
/** A field, no wood: behind the gun of POSE0 (θ −67° → −57°), so that no line runs along the barrel of the hook. */
const field = (th) => smooth(-71, -67, th / DEGR) * (1 - smooth(-57, -53, th / DEGR));
const woods = (th) => env(th) * (1 - field(th));

export function dressChar() {
  const group = new THREE.Group();
  group.name = "habillage";
  const rand = rng(42);

  /* ── the tree line: a ragged edge of wood with a clearing or two (≈ 260–380 m) ── */
  const near = { pos: [], col: [] };
  {
    const th0 = -172 * DEGR, th1 = -6 * DEGR;
    const Rm = 32000;
    // trees along the arc length s: crown centre, half width, height (lower toward a wood's edge)
    const list = [];
    const L = (th1 - th0) * Rm;
    for (let s = 0; s < L; ) {
      const wd = woods(th0 + s / Rm);
      if (wd > 0.05 && Math.sin(s / 5200 + 0.8) > -0.8) list.push({ s, w: 260 + rand() * 220, h: (650 + rand() * 550) * (0.45 + 0.55 * wd) });
      s += 330 + rand() * 380;
    }
    const prof = (s) => {
      let p = 0;
      for (const t of list) {
        const u = (s - t.s) / t.w;
        if (u > -1 && u < 1) p = Math.max(p, t.h * Math.pow(1 - u * u, 0.6));
      }
      return p;
    };
    let prev = null;
    for (let s = 0; s <= L; s += 140) {
      const th = th0 + s / Rm;
      const R = Rm + 6000 * Math.sin(2.3 * th + 0.7);
      const h = prof(s);
      const p = [C[0] + R * Math.cos(th), Y0 + h, C[1] + R * Math.sin(th), h];
      if (prev && (prev[3] > 0 || h > 0)) {
        near.pos.push(prev[0], prev[1], prev[2], p[0], p[1], p[2]);
        near.col.push(INK.r, INK.g, INK.b, INK.r, INK.g, INK.b);
      }
      prev = p;
    }
  }
  /* ── the ridge behind the woods (≈ 1.2 km): one slow line, fainter, the same sectors ── */
  const far = { pos: [], col: [] };
  {
    const R = 120000;
    let prev = null;
    for (let th = -Math.PI; th <= 0.0001; th += 0.003) {
      const k = env(th);
      const h = (1500 + 800 * Math.sin(3.1 * th + 0.4) + 450 * Math.sin(7.3 * th + 2.1) + 160 * Math.sin(17 * th)) * (1 - 0.7 * field(th));
      const p = [C[0] + R * Math.cos(th), Y0 + Math.max(250, h), C[1] + R * Math.sin(th), k];
      if (prev) {
        far.pos.push(prev[0], prev[1], prev[2], p[0], p[1], p[2]);
        far.col.push(INK.r * prev[3], INK.g * prev[3], INK.b * prev[3], INK.r * k, INK.g * k, INK.b * k);
      }
      prev = p;
    }
  }
  const trees = segments(near.pos, near.col, 2.0, 0.3, 26);
  const ridge = segments(far.pos, far.col, 1.8, 0.24, 25);
  group.add(trees.mesh, ridge.mesh);

  return {
    group,
    /** P: char.js's numbers (shell); `eye` the camera. Uniforms only. */
    update(P, time, px, eye) {
      // only from low — POSE0 0.84 m, columnWide 1.9 m: full · inside the turret (3 m) or higher: none (the header)
      const k = clamp01(P.shell) * (eye ? 1 - smooth(195, 290, eye.y - Y0) : 1);
      trees.mesh.visible = ridge.mesh.visible = k > 0.003;
      trees.mat.opacity = trees.opacity * k;
      ridge.mat.opacity = ridge.opacity * k;
    },
  };
}
