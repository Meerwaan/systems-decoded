// DOSSIER 041 — THE SYSTEM, solid: the coupon of stuffed Whipple shield, and everything that hits it.
//   · the coupon (plan.js LAYERS, COUPON): a 40 × 40 cm patch cut out of the hero module's wall, CURVED (concentric with
//     the lab's axis: ≈ 1 cm of sag over 40 cm, it says « a hull »), its four layers cut clean on the same radial planes
//     like a test specimen, every cut edge chamfered: the bumper (2 mm, aluminium, the lightest: the hero), 10 cm of
//     nothing, the blanket (Nextel ceramic over Kevlar, two greys, the Kevlar woven in the shader), the rear wall (4.8 mm,
//     aluminium, mid grey, its cabin side machined in an isogrid). Three greys, metal ≤ 0.45, fine light edges.
//   · the bille (1 cm, white-hot: a solid hot ball + a halo that never shrinks under 7 px + a tapered streak behind it),
//     the baseball-size one (`big`, a dark signal lump, an object not a light), the rifle bullet left behind (`bullet`,
//     glass), the gauges (1 cm under the bille, 10 cm across the gap: ink, no figure), the radar sweep that misses it.
//   · the impact (`burst` 0 → 1, on the voice's words; deterministic, seeded, a function of `burst` only):
//       0 → 0.1   the contact: a ball of white light ON the bumper that swells and dies (never a veil); the bille gone
//       0.1 → 0.3 the bumper holed clean (2.6 × the bille), its lip curled into the gap, glowing then dark; the cloud born
//       0.3 → 0.7 the cloud spreads through the gap: 96 shards and drops (signal streaks, the front brighter) in a 24° cone,
//                 ≈ 9 cm wide when its front reaches the blanket
//       0.7 → 0.85 the blanket breaks it again: each shard squashes on the ceramic and splits into finer, dimmer bits that
//                 splash back; the ceramic scorched in a shallow crater
//       0.85 → 1  a rain of hot points over 12–14 cm of the rear wall (drawn through the blanket, from the side only), the
//                 wall bulging ≈ 1 mm toward the cabin; at 1 it holds: its edges turn veille
//     `shock` the ring running through the bumper; `molten` the share of the shards that are drops of molten metal (≤ 60 %).
//   · the counter-example (`mirror`): ONE flat plate of the same aluminium (6.8 mm) above the coupon; its twin bille
//     (`pierce`): 0.4 contact, 0.4 → 0.8 a single point that digs (crater with a crown in front, the back bulging hot),
//     0.8 → 1 a slug and a tight jet out of the back.
// Three colours: ink the structure, the gauges, the ghost bullet, the sweep; signal the bille, the cloud, the heat, the
// crater, the big one; veille the layer the voice names (`lit*`), the gap's light (`litGap`), the wall that held.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glass, asShell, setPartOpacity, anchor, lineMat, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { LAYERS, COUPON, SPREAD, BILLE, BIG, BULLET, GAUGE1, GAUGE10, MIRROR } from "./plan.js";

const DEG = Math.PI / 180;
const R0 = -COUPON.axis[2]; // 224.4: the hero's axis is at z = −R0; the bumper's outer radius, and the arc's reference
const HALF = COUPON.half;
const RH = 1.3; //   the hole in the bumper (radius, cm): 2.6 × the bille
const RHM = 1.5; //  the hole through the mirror plate
const SIDE = 24; //  samples along each side of a coupon's outline
const RINGS = 22; // rings from the hole to the edge
const VIEWPORT = new THREE.Vector2(BRAND.W, BRAND.H);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);

const clamp01 = (x) => Math.min(1, Math.max(0, x));
// the kit's machining grain (stage `finish`) reads as corrugation on a 40 cm sheet: the coupon stays bare
const bare = (mat) => ((mat.userData.finish = false), mat);
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// leaves fast, settles with a hair of overshoot: a layer has weight
const settle = (u) => {
  const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  return e + Math.sin(Math.PI * u) ** 2 * 0.05 * (u > 0.5 ? 1 : 0.25);
};

/* ───────────────────────────────────────────────────────────────────── geometry: the layers of the coupon */

// a point of a layer: `u` along x, `v` the arc (cm, measured on the bumper's outer face), `r` the radius from the hero's axis
const onCurve = (u, v, r) => [u, r * Math.sin(v / R0), r * Math.cos(v / R0) - R0];
const onFlat = (u, v, z) => [u, v, z];
const radialOf = (p) => {
  const l = Math.hypot(p[1], p[2] + R0);
  return [0, p[1] / l, (p[2] + R0) / l];
};
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const neg3 = (a) => [-a[0], -a[1], -a[2]];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** The outline of a square of half-side h, m samples a side, from the corner (h, −h) counter-clockwise; `N` points
 *  inward (both ways at a corner: the bevel is mitred), `O` the outward normal of the side a sample belongs to. */
function squareLoop(h, m) {
  const sides = [
    [[h, -h], [h, h], [-1, 0], [1, 0, 0]],
    [[h, h], [-h, h], [0, -1], [0, 1, 0]],
    [[-h, h], [-h, -h], [1, 0], [-1, 0, 0]],
    [[-h, -h], [h, -h], [0, 1], [0, -1, 0]],
  ];
  const B = [];
  const N = [];
  const O = [];
  sides.forEach(([a, b, n, o], s) => {
    const prev = sides[(s + 3) % 4][2];
    for (let j = 0; j < m; j++) {
      const t = j / m;
      B.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      N.push(j === 0 ? [n[0] + prev[0], n[1] + prev[1]] : n);
      O.push(o);
    }
  });
  return { B, N, O };
}

/** A sheet of quads through rows[i][k] (i around — wrapped if `closed` — k across), turned to face `expect(p)`;
 *  smooth normals inside the sheet (or `normalAt(p)`), crisp against its neighbours. */
function grid(rows, closed, expect, normalAt = null) {
  const ni = rows.length;
  const nk = rows[0].length;
  const pos = new Float32Array(ni * nk * 3);
  for (let i = 0; i < ni; i++) for (let k = 0; k < nk; k++) pos.set(rows[i][k], (i * nk + k) * 3);
  const idx = [];
  for (let i = 0; i < (closed ? ni : ni - 1); i++) {
    const j = (i + 1) % ni;
    for (let k = 0; k < nk - 1; k++) {
      const a = i * nk + k;
      const b = j * nk + k;
      const c = j * nk + k + 1;
      const d = i * nk + k + 1;
      idx.push(a, b, c, a, c, d);
    }
  }
  const at = (n) => [pos[n * 3], pos[n * 3 + 1], pos[n * 3 + 2]];
  let best = 0;
  let facing = 1;
  for (let t = 0; t < idx.length; t += 3) {
    const A = at(idx[t]);
    const B = at(idx[t + 1]);
    const C = at(idx[t + 2]);
    const n = cross3(sub3(B, A), sub3(C, A));
    const area = Math.hypot(...n);
    if (area > best) {
      best = area;
      facing = Math.sign(dot3(n, expect([(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3, (A[2] + B[2] + C[2]) / 3]))) || 1;
    }
  }
  if (facing < 0) for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  if (normalAt) {
    const nr = g.attributes.normal;
    for (let i = 0; i < ni * nk; i++) {
      const n = normalAt(at(i));
      nr.setXYZ(i, n[0], n[1], n[2]);
    }
  }
  return g;
}

/**
 * One layer of the coupon: a square of half-side `half` between radii (or z) r0 < r1, its cut edges chamfered by `c`,
 * with a round hole of radius `hole` at its centre. `fill` "merge": the hole is filled in the body (a layer that never
 * opens); "apart": the filling discs come back on their own (the bumper's plug), and the hole's wall is in the body.
 * Returns { body, fill, front, back }: front/back are the crest lines (closed polylines) on the two bevels.
 */
function slab({ r0, r1, half, hole, c, flat = false, front = true, back = true, fill = "merge" }) {
  const at = flat ? onFlat : onCurve;
  const out = flat ? () => [0, 0, 1] : radialOf;
  const inw = (p) => neg3(out(p));
  const { B, N, O } = squareLoop(half, SIDE);
  const NA = B.length;
  const H = B.map(([u, v]) => {
    const l = Math.hypot(u, v);
    return [(hole * u) / l, (hole * v) / l];
  });
  const E = B.map(([u, v], i) => [u + c * N[i][0], v + c * N[i][1]]);
  const T = Array.from({ length: RINGS + 1 }, (_, k) => Math.pow(k / RINGS, 1.5));
  const face = (r) => B.map((_, i) => T.map((t) => at(H[i][0] + (E[i][0] - H[i][0]) * t, H[i][1] + (E[i][1] - H[i][1]) * t, r)));
  const disc = (r) => B.map((_, i) => [0, 1 / 3, 2 / 3, 1].map((t) => at(H[i][0] * t, H[i][1] * t, r)));
  const body = [];
  if (front) body.push(grid(face(r1), true, out, out));
  if (back) body.push(grid(face(r0), true, inw, inw));
  for (let s = 0; s < 4; s++) {
    const ids = Array.from({ length: SIDE + 1 }, (_, j) => (s * SIDE + j) % NA);
    const o = O[s * SIDE + 1];
    const strip = (pa, pb, e) => body.push(grid(ids.map((i) => [pa(i), pb(i)]), false, e));
    strip((i) => at(E[i][0], E[i][1], r1), (i) => at(B[i][0], B[i][1], r1 - c), (p) => add3(o, out(p)));
    strip((i) => at(B[i][0], B[i][1], r1 - c), (i) => at(B[i][0], B[i][1], r0 + c), () => o);
    strip((i) => at(B[i][0], B[i][1], r0 + c), (i) => at(E[i][0], E[i][1], r0), (p) => sub3(o, out(p)));
  }
  let fillGeo = null;
  const discs = [grid(disc(r1), true, out, out), grid(disc(r0), true, inw, inw)];
  if (fill === "merge") body.push(...discs);
  else {
    body.push(grid(B.map((_, i) => [at(H[i][0], H[i][1], r1), at(H[i][0], H[i][1], r0)]), true, (p) => [-p[0], -p[1], 0]));
    fillGeo = mergeGeometries(discs);
  }
  const crest = (r) => {
    const pts = B.map(([u, v], i) => at(u + 0.5 * c * N[i][0], v + 0.5 * c * N[i][1], r));
    pts.push(pts[0]);
    return pts;
  };
  return { body: mergeGeometries(body), fill: fillGeo, front: crest(r1 - c / 2), back: crest(r0 + c / 2) };
}

/** A ring around the z axis (the path): `profile` [r, z] points, each z pulled toward `z0` by jag(φ) ∈ [0, 1] — a torn
 *  lip, a crown. Two-sided. */
function ring(profile, { z0 = 0, jag = () => 1, segments = 64 } = {}) {
  const rows = [];
  for (let i = 0; i < segments; i++) {
    const f = (i / segments) * Math.PI * 2;
    const h = jag(f);
    rows.push(profile.map(([r, z]) => [r * Math.cos(f), r * Math.sin(f), z0 + (z - z0) * h]));
  }
  return grid(rows, true, (p) => [p[0], p[1], 0.2]);
}

/** Thin ink lines (screen pixels) on a loop. */
function crestLine(points, mat) {
  const geo = new LineGeometry();
  geo.setPositions(points.flat());
  const line = new Line2(geo, mat);
  line.renderOrder = 2;
  return line;
}
function segments(pairs, mat) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(pairs.flat(2));
  const lines = new LineSegments2(geo, mat);
  lines.renderOrder = 3;
  return lines;
}

/* ──────────────────────────────────────────────────── surfaces: what the standard solids add in their own shader */

const NOISE = /* glsl */ `
float sdH2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float sdN2(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(sdH2(i), sdH2(i + vec2(1.0, 0.0)), f.x), mix(sdH2(i + vec2(0.0, 1.0)), sdH2(i + vec2(1.0, 1.0)), f.x), f.y);
}`;

/** Adds to a kit solid (after its colour, after its emissive): `vWl` is the vertex in the mesh's own centimetres. */
function inject(mat, key, uniforms, { vHead = "", vBody = "", fHead = "", color = "", emissive = "" }) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `varying vec3 vWl;\n${vHead}\n${shader.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\n  vWl = position;\n${vBody}`)}`;
    shader.fragmentShader = `varying vec3 vWl;\n${fHead}\n${shader.fragmentShader
      .replace("#include <color_fragment>", `#include <color_fragment>\n${color}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${emissive}`)}`;
  };
  mat.customProgramCacheKey = () => `whipple-${key}`;
  return mat;
}

/* ─────────────────────────────────────────────────────────────────────── lights: what has a place, and glows */

/**
 * A ball of light with no edge, facing the eye (after 015's `makeBall`): far away, a hot heart, a body, a tail, never
 * under `uMinPx`; close, when the solid ball it surrounds (`uCore`, cm) is big on screen, only its glow around it. It is
 * pulled toward the eye by its own radius, so a plate it nears never cuts it in half.
 */
function makeHalo(heart, hue, { core = 0, soft = 0, minPx = 7 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: minPx },
      uAmount: { value: 0 }, uH: { value: BRAND.H }, uCore: { value: core }, uSoft: { value: soft },
    },
    vertexShader: /* glsl */ `
      uniform float uRadius, uMinPx, uH, uCore; varying vec2 vUv; varying float vK; varying float vS;
      void main() {
        vUv = position.xy;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        if (c.z > -0.5) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); vUv = vec2(2.0); vK = 0.0; vS = 0.0; return; }
        float depth = -c.z;
        float floorR = uMinPx * depth / (projectionMatrix[1][1] * uH * 0.5);
        float r = max(uRadius, floorR);
        vK = clamp(uRadius / max(r, 1e-4), 0.0, 1.0);
        vS = clamp(uCore / max(r, 1e-4), 0.0, 0.95);
        float k = max(depth - r, 0.5) / depth; // along the eye's ray: same place, same size on screen
        c.xyz *= k;
        c.xy += position.xy * r * k;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount, uSoft; varying vec2 vUv; varying float vK; varying float vS;
      void main() {
        float r2 = dot(vUv, vUv);
        if (r2 >= 1.0 || uAmount < 0.002) discard;
        float r = sqrt(r2);
        float core = exp(-r2 / mix(0.16, 0.012, vK * (1.0 - uSoft)));
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, r));
        vec3 far = (uHeart * core * 2.2 + uHue * (body + tail)) * max(0.6, vK);
        float g = exp(-max(r - vS, 0.0) / 0.2) * smoothstep(vS * 0.85, vS * 1.02, r) * (1.0 - smoothstep(0.7, 1.0, r));
        vec3 near = uHue * 0.6 * g + uHeart * 0.15 * g * g;
        gl_FragColor = vec4(mix(far, near, smoothstep(0.1, 0.2, vS)) * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  mesh.visible = false;
  return mesh;
}
const shine = (halo, amount, radius) => {
  halo.visible = amount > 0.003;
  halo.material.uniforms.uAmount.value = amount;
  halo.material.uniforms.uRadius.value = radius;
};

/** The white-hot ball itself: a crisp round silhouette, white where it faces the eye, signal at its limb. */
function hotBall(r) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uHeart: { value: INK.clone().multiplyScalar(2.3) }, uHue: { value: SIGNAL.clone().multiplyScalar(1.5) }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying vec3 vN; varying vec3 vV;
      void main() { float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0); gl_FragColor = vec4(mix(uHue, uHeart, pow(f, 0.8)), uAmount); }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), mat);
  mesh.renderOrder = 5;
  return mesh;
}

/** A tapered streak from `uHead` to `uTail` (screen-wide: never under `uWHead` px at its head), hot at the head. */
function makeTrail() {
  const n = 24;
  const pos = [];
  for (let i = 0; i <= n; i++) pos.push(i / n, -1, 0, i / n, 1, 0);
  const idx = [];
  for (let i = 0; i < n; i++) idx.push(2 * i, 2 * i + 2, 2 * i + 3, 2 * i, 2 * i + 3, 2 * i + 1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uHead: { value: new THREE.Vector3() }, uTail: { value: new THREE.Vector3(0, 0, 1) }, uHcm: { value: 0.6 }, uWHead: { value: 5.5 },
      uWTail: { value: 2.0 }, uAmount: { value: 0 }, uView: { value: VIEWPORT },
      uHeart: { value: INK.clone().multiplyScalar(1.9) }, uHue: { value: SIGNAL.clone().multiplyScalar(1.5) },
    },
    vertexShader: /* glsl */ `
      uniform vec3 uHead, uTail; uniform float uHcm, uWHead, uWTail; uniform vec2 uView; varying float vS; varying float vSide;
      void main() {
        vS = position.x; vSide = position.y;
        vec4 mh = modelViewMatrix * vec4(uHead, 1.0);
        vec4 mt = modelViewMatrix * vec4(uTail, 1.0);
        if (mh.z > -1.0) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
        if (mt.z > -1.0) mt = mix(mh, mt, (-1.0 - mh.z) / (mt.z - mh.z)); // never behind the eye
        vec4 h = projectionMatrix * mh;
        vec4 t = projectionMatrix * mt;
        vec2 d = t.xy / t.w * 0.5 * uView - h.xy / h.w * 0.5 * uView;
        float len = length(d);
        vec2 dir = len > 0.01 ? d / len : vec2(1.0, 0.0);
        float wh = clamp(uHcm * projectionMatrix[1][1] * 0.5 * uView.y / h.w, uWHead, 220.0);
        vec4 c = mix(h, t, position.x);
        c.xy += vec2(-dir.y, dir.x) * position.y * 0.5 * mix(wh, uWTail, position.x) / (0.5 * uView) * c.w;
        gl_Position = c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying float vS; varying float vSide;
      void main() {
        float across = 1.0 - smoothstep(0.2, 1.0, abs(vSide));
        float fade = pow(clamp(1.0 - vS, 0.0, 1.0), 1.4);
        gl_FragColor = vec4(mix(uHeart, uHue, smoothstep(0.0, 0.22, vS)) * across * fade * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  mesh.visible = false;
  return mesh;
}

/**
 * Shards, drops and points (instanced streaks), all a pure function of one clock `uU`:
 *   kind 0  a shard of the cloud: flies from `aOrigin` along `aDir` at `aT.z` cm per unit of `uU`, from `aT.x`, and
 *           stops at `aT.y` (it has met the blanket: it squashes — its streak shrinks onto the point — and fades)
 *   kind 1  a finer bit, born where its shard met the blanket: splashes off (decelerating), dimmer, gone after `aL.z`
 *   kind 2  a point of the rain: on the wall, white-hot as it lands at `aT.x`, then a dim signal mark that stays
 * The streak is where the thing was `uDu` earlier: still frames keep their motion. `aL` = size (cm), rank (a drop of
 * molten metal when rank < uMolten), life, front (s⁴: the fastest, the front, are the brightest).
 */
function makeShards(list, { depthTest = true, du = 0.09 } = {}) {
  const n = list.length;
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const O = new Float32Array(n * 3);
  const D = new Float32Array(n * 3);
  const T = new Float32Array(n * 4);
  const L = new Float32Array(n * 4);
  list.forEach((s, i) => {
    O.set(s.origin, i * 3);
    D.set(s.dir, i * 3);
    T.set([s.t0, s.arrive, s.speed, s.kind], i * 4);
    L.set([s.size, s.rank, s.life, s.front], i * 4);
  });
  geo.setAttribute("aOrigin", new THREE.InstancedBufferAttribute(O, 3));
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(D, 3));
  geo.setAttribute("aT", new THREE.InstancedBufferAttribute(T, 4));
  geo.setAttribute("aL", new THREE.InstancedBufferAttribute(L, 4));
  geo.instanceCount = n;
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uU: { value: 0 }, uDu: { value: du }, uMolten: { value: 0 }, uAmount: { value: 0 }, uGate: { value: 1 }, uView: { value: VIEWPORT },
      uHot: { value: INK.clone().multiplyScalar(2.4) }, uMid: { value: SIGNAL.clone().multiplyScalar(2.2) },
    },
    vertexShader: /* glsl */ `
      uniform float uU, uDu, uMolten, uAmount, uGate; uniform vec2 uView; uniform vec3 uHot, uMid;
      attribute vec3 aOrigin; attribute vec3 aDir; attribute vec4 aT; attribute vec4 aL;
      varying vec2 vQ; varying float vLen; varying float vW; varying vec3 vCol; varying float vA; varying float vDrop;
      vec3 place(float u) {
        float tau = max(u - aT.x, 0.0);
        if (aT.w < 0.5) return aOrigin + aDir * aT.z * min(tau, max(aT.y - aT.x, 0.0));
        if (aT.w < 1.5) return aOrigin + aDir * aT.z * (1.0 - exp(-4.0 * tau)) * 0.25;
        return aOrigin;
      }
      void hide() { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); vA = 0.0; vQ = vec2(0.0); vLen = 0.0; vW = 1.0; vCol = vec3(0.0); vDrop = 0.0; }
      void main() {
        float tau = uU - aT.x;
        float alpha = 0.0; vec3 col = uMid; float drop = 0.0; float lag = 0.0;
        if (aT.w < 0.5) {
          alpha = smoothstep(0.0, 0.025, tau) * (1.0 - smoothstep(0.0, 0.09, uU - aT.y));
          drop = aL.y < uMolten ? 1.0 : 0.0;
          float heat = 1.0 - 0.4 * clamp(tau, 0.0, 1.0);
          col = drop > 0.5 ? mix(uMid, uHot, 0.3 + 0.4 * heat * aL.w) : uMid * (0.45 + 0.75 * aL.w) * heat;
          col *= 1.0 + 0.7 * (1.0 - smoothstep(0.0, 0.12, tau)); // white-hot as it is born
          lag = uDu;
        } else if (aT.w < 1.5) {
          alpha = smoothstep(0.0, 0.02, tau) * (1.0 - smoothstep(0.35 * aL.z, aL.z, tau));
          col = uMid * 0.42;
          lag = uDu * 0.6;
        } else {
          alpha = step(0.0, tau);
          col = mix(uMid * 0.55, uHot * 1.1, exp(-max(tau, 0.0) / 0.06));
        }
        alpha *= uAmount * uGate;
        if (alpha < 0.002) { hide(); return; }
        vec4 h = projectionMatrix * modelViewMatrix * vec4(place(uU), 1.0);
        vec4 t = projectionMatrix * modelViewMatrix * vec4(place(uU - lag), 1.0);
        if (h.w < 0.05 || t.w < 0.05) { hide(); return; }
        vec2 ph = h.xy / h.w * 0.5 * uView;
        vec2 d = ph - t.xy / t.w * 0.5 * uView;
        float len = length(d);
        vec2 dir = len > 0.01 ? d / len : vec2(1.0, 0.0);
        len = min(len, 320.0);
        float w = clamp(aL.x * projectionMatrix[1][1] * 0.5 * uView.y / h.w, 2.2, 26.0);
        float x = position.x * (len + w) - 0.5 * w;
        float y = position.y * 0.5 * w;
        vec2 pix = ph - dir * len + dir * x + vec2(-dir.y, dir.x) * y;
        vQ = vec2(x, y); vLen = len; vW = w; vA = alpha; vCol = col; vDrop = drop;
        gl_Position = vec4(pix / (0.5 * uView) * h.w, h.z, h.w);
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vQ; varying float vLen; varying float vW; varying vec3 vCol; varying float vA; varying float vDrop;
      void main() {
        if (vA < 0.002) discard;
        float hw = 0.5 * vW;
        float x = clamp(vQ.x, 0.0, vLen);
        float dd = length(vec2(vQ.x - x, vQ.y)) / hw;
        if (dd >= 1.0) discard;
        float shape = pow(1.0 - dd, 1.5);
        float a = vLen > 0.5 ? x / vLen : 1.0;
        float along = mix(0.12, 1.0, pow(a, 1.6));
        float hx = vQ.x - vLen;
        float head = vDrop * exp(-(hx * hx + vQ.y * vQ.y) / max(hw * hw * 0.7, 0.5));
        gl_FragColor = vec4(vCol * (shape * along + 1.2 * head) * vA, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  mesh.visible = false;
  return mesh;
}

/* ───────────────────────────────────────────────────────────── the cloud: one seeded list, rejoued identically */

const GAP = LAYERS.gap[1] - LAYERS.gap[0]; //    10.2 cm, bumper's inner face → blanket's outer face (on the axis)
const Z_BACK = LAYERS.bumper[0] - R0; //          −0.2: the bumper's inner face
const Z_BLANKET = LAYERS.gap[0] - R0; //          −10.4: the ceramic's face
const CONE = 24 * DEG; //                         at the blanket, ≈ 9 cm across

function cloudLists() {
  const R = rng(4101);
  const shards = [];
  const bits = [];
  for (let i = 0; i < 96; i++) {
    const th = CONE * Math.sqrt(R());
    const ph = 2 * Math.PI * R();
    const dir = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), -Math.cos(th)];
    // from the front (1, on the axis) back to 0.35: a filled cone of rays from the hole, not a thin shell; the slowest
    // never reach the blanket before the wall has held — they fade with the rest (`burst` 0.93 → 1)
    const s = (1 - 0.65 * Math.pow(R(), 1.6)) * (1 - 0.06 * (th / CONE) ** 2);
    const a = 0.55 * Math.sqrt(R());
    const b = 2 * Math.PI * R();
    const origin = [a * Math.cos(b), a * Math.sin(b), Z_BACK];
    const t0 = 0.035 * R();
    const speed = GAP * s; // cm per unit of the cloud's clock: the fastest on the axis meets the blanket at u = 1
    const tau = GAP / (Math.cos(th) * speed);
    const A = [origin[0] + dir[0] * speed * tau, origin[1] + dir[1] * speed * tau, Z_BLANKET];
    shards.push({ origin, dir, t0, arrive: t0 + tau, speed, kind: 0, size: 0.17 + 0.15 * R(), rank: R(), life: 0, front: s ** 4 });
    for (let j = 0; j < 2; j++) {
      const ang = Math.atan2(A[1], A[0]) + (R() - 0.5) * 2.4;
      const lat = 0.5 + 0.8 * R();
      const back = 0.25 + 0.55 * R();
      const l = Math.hypot(lat, back);
      bits.push({
        origin: [A[0], A[1], Z_BLANKET + 0.05], dir: [(Math.cos(ang) * lat) / l, (Math.sin(ang) * lat) / l, back / l],
        t0: t0 + tau + 0.012 * R(), arrive: 0, speed: 4 * (1.0 + 2.0 * R()), kind: 1, size: 0.07 + 0.05 * R(), rank: 1, life: 0.1 + 0.1 * R(), front: 0,
      });
    }
  }
  const rain = [];
  for (let i = 0; i < 64; i++) {
    const r = 6.8 * Math.pow(R(), 0.8);
    const a = 2 * Math.PI * R();
    const b = 0.86 + 0.09 * (0.35 + 0.65 * (r / 6.8)) * R(); // the centre first
    rain.push({
      origin: onCurve(r * Math.cos(a), r * Math.sin(a), LAYERS.wall[1] + 0.04), dir: [0, 0, 1], t0: (b - 0.1) / 0.6, arrive: 0, speed: 0, kind: 2,
      size: 0.2 + 0.12 * R(), rank: 1, life: 0, front: 0,
    });
  }
  const jet = [];
  for (let i = 0; i < 60; i++) {
    const th = 4 * DEG * Math.sqrt(R());
    const ph = 2 * Math.PI * R();
    const s = 0.55 + 0.45 * R();
    jet.push({
      origin: [0.3 * (R() - 0.5), 0.3 * (R() - 0.5), -MIRROR.thick - 0.3], dir: [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), -Math.cos(th)],
      t0: 0.06 * R(), arrive: 1e4, speed: 16 * s, kind: 0, size: 0.18 + 0.14 * R(), rank: R(), life: 0, front: s ** 4,
    });
  }
  return { shards: [...shards, ...bits], rain, jet };
}

/* ─────────────────────────────────────────────────────────────────────────────────────────── the system */

/**
 * buildWhipple() → { root, parts, A, update(P, time, px, eye) }
 *   root   added to the scene as it is (never moved but by the dodge, in world.js): the coupon stands on the origin
 *   parts  { bumper, blanket, wall, mirror } — each fades on its own (setPartOpacity) and has its own materials
 *   A      anchors: impact (the origin), bille (follows `dist`), gap (mid-gap), blanket, wall (behind the impact),
 *          mirror (the plate's face), big, gauge10 (the middle of the 10 cm gauge)
 *   update P = { explode, litBumper, litGap, litBlanket, litWall, bille, dist, trail, scan, bullet, gauge1, big,
 *                burst, shock, molten, gauge10, mirror, pierce, bench } · `px` = stage.pixelScale() · `eye` = the camera's
 *                position (sizes the lights so they read at every distance). Called sixteen times a frame: no allocation.
 */
export function buildWhipple() {
  const root = new THREE.Group();
  const look = (part, mats) => {
    const line = lineMat(BRAND.ink, 2, { opacity: 0.72 });
    part.userData.part.mats.add(line);
    return { line, faces: mats, lit: new THREE.Color(0, 0, 0) };
  };

  /* ── the bumper: 2 mm of aluminium, the lightest grey — holed by the bille, its lip curled into the gap ── */
  const bumper = makePart("bumper", { lift: SPREAD.bumper });
  const UB = {
    uRing: { value: new THREE.Vector3(0, 1, 0) }, uHole: { value: new THREE.Vector2(RH, 0) }, uSpot: { value: new THREE.Vector2(0, 1) },
    uLitE: { value: new THREE.Color(0, 0, 0) }, uSig: { value: SIGNAL.clone() }, uHotC: { value: INK.clone() },
  };
  const bumperMat = inject(bare(solid(0xd3d8dd, { rough: 0.36, metal: 0.3 })), "bumper", UB, {
    fHead: "uniform vec3 uRing; uniform vec2 uHole; uniform vec2 uSpot; uniform vec3 uLitE; uniform vec3 uSig; uniform vec3 uHotC;",
    emissive: /* glsl */ `
      float sdR = length(vWl.xy);
      float sdQ = (sdR - uRing.x) / uRing.y;
      vec3 sdE = uLitE + uSig * uRing.z * exp(-sdQ * sdQ);
      sdE += mix(uSig, uHotC, 0.35 * uHole.y) * (1.6 * uHole.y) * exp(-max(sdR - uHole.x, 0.0) / 0.4);
      sdE += uSig * uSpot.x * exp(-(sdR * sdR) / max(uSpot.y * uSpot.y, 0.01));
      totalEmissiveRadiance += sdE;`,
  });
  const bs = slab({ r0: LAYERS.bumper[0], r1: LAYERS.bumper[1], half: HALF, hole: RH, c: 0.05, fill: "apart" });
  addMesh(bumper, bs.body, bumperMat, { edges: false });
  const plug = addMesh(bumper, bs.fill, bumperMat, { edges: false });
  const lipMat = bare(solid(0xb2b7bc, { rough: 0.5, metal: 0.3, double: true }));
  const lipJag = rng(77);
  const petals = Array.from({ length: 9 }, () => 0.7 + 0.3 * lipJag());
  const lip = addMesh(
    bumper,
    ring([[RH, Z_BACK + 0.02], [RH + 0.07, Z_BACK - 0.28], [RH + 0.24, Z_BACK - 0.66]], {
      z0: Z_BACK, segments: 72, jag: (f) => (0.3 + 0.7 * Math.pow(Math.abs(Math.sin(4.5 * f + 0.4)), 0.6)) * petals[Math.floor((f / (2 * Math.PI)) * 9) % 9],
    }),
    lipMat,
    { edges: false },
  );
  lip.visible = false;
  const bumperLook = look(bumper, [UB.uLitE]);
  bumper.add(crestLine(bs.front, bumperLook.line), crestLine(bs.back, bumperLook.line));

  /* ── the blanket: Nextel ceramic (light, matte) over Kevlar (darker, woven) — never yellow, never pure white ── */
  const blanket = makePart("blanket", { lift: SPREAD.blanket, delay: 0.15 });
  const mid = (LAYERS.blanket[0] + LAYERS.blanket[1]) / 2;
  const UC = { uCrater: { value: new THREE.Vector2(0, 0) }, uLitE: { value: new THREE.Color(0, 0, 0) }, uSig: { value: SIGNAL.clone() } };
  const ceramicMat = inject(bare(solid(0x868480, { rough: 0.95, metal: 0 })), "ceramic", UC, {
    fHead: `uniform vec2 uCrater; uniform vec3 uLitE; uniform vec3 uSig;\n${NOISE}`,
    color: /* glsl */ `
      float sdR = length(vWl.xy);
      float sdN = sdN2(vWl.xy * 2.6) * 0.6 + sdN2(vWl.xy * 7.0) * 0.4;
      diffuseColor.rgb *= 0.95 + 0.1 * sdN2(vWl.xy * 1.3);
      diffuseColor.rgb *= 1.0 - 0.55 * uCrater.x * exp(-sdR * sdR / 9.0) * (0.5 + 0.5 * sdN);`,
    emissive: /* glsl */ `totalEmissiveRadiance += uLitE + uSig * uCrater.y * exp(-sdR * sdR / 5.0) * (0.3 + 0.7 * sdN);`,
  });
  const UK = { uLitE: UC.uLitE };
  const kevlarMat = inject(bare(solid(0x4c4d51, { rough: 0.8, metal: 0.05 })), "kevlar", UK, {
    fHead: "uniform vec3 uLitE;",
    color: /* glsl */ `
      vec2 sdQ = vWl.xy / 0.45;
      vec2 sdF = fract(sdQ);
      float sdOver = mod(floor(sdQ.x) + floor(sdQ.y), 2.0);
      float sdTow = mix(sin(3.14159 * sdF.y), sin(3.14159 * sdF.x), sdOver);
      float sdK = 1.0 - smoothstep(0.3, 0.7, fwidth(sdQ.x) + fwidth(sdQ.y));
      diffuseColor.rgb *= mix(1.0, 0.7 + 0.45 * sdTow, sdK);`,
    emissive: "totalEmissiveRadiance += uLitE;",
  });
  const cs = slab({ r0: mid, r1: LAYERS.blanket[1], half: HALF, hole: RH, c: 0.1, back: false });
  const ks = slab({ r0: LAYERS.blanket[0], r1: mid, half: HALF, hole: RH, c: 0.1, front: false });
  addMesh(blanket, cs.body, ceramicMat, { edges: false });
  addMesh(blanket, ks.body, kevlarMat, { edges: false });
  const blanketLook = look(blanket, [UC.uLitE]);
  blanket.add(crestLine(cs.front, blanketLook.line), crestLine(cs.back, blanketLook.line), crestLine(ks.back, blanketLook.line));

  /* ── the rear wall: 4.8 mm, mid grey, its cabin side machined in an isogrid; it bulges a hair and holds ── */
  const wall = makePart("wall", { lift: 0 });
  const UW = { uBulge: { value: 0 }, uLitE: { value: new THREE.Color(0, 0, 0) } };
  const r0w = LAYERS.wall[0].toFixed(3);
  const wallMat = inject(bare(solid(0x737980, { rough: 0.48, metal: 0.38 })), "wall", UW, {
    vHead: "uniform float uBulge;",
    vBody: "  transformed.z -= uBulge * exp(-dot(position.xy, position.xy) / 36.0);",
    fHead: /* glsl */ `uniform vec3 uLitE;
      float sdRib(vec2 p) {
        float m = 0.0;
        for (int k = 0; k < 3; k++) {
          float a = 1.5708 + float(k) * 1.0472;
          float d = dot(p, vec2(cos(a), sin(a))) / 6.0;
          float fw = fwidth(d);
          float f = abs(fract(d) - 0.5) * 2.0;
          m = max(m, smoothstep(0.84, 0.9, f) * (1.0 - smoothstep(0.06, 0.16, fw)));
        }
        return m;
      }`,
    color: /* glsl */ `
      float sdRad = length(vec2(vWl.y, vWl.z + ${R0.toFixed(2)}));
      float sdBack = 1.0 - smoothstep(${r0w} + 0.004, ${r0w} + 0.012, sdRad);
      diffuseColor.rgb *= mix(1.0, mix(0.8, 1.14, sdRib(vWl.xy)), sdBack);`,
    emissive: "totalEmissiveRadiance += uLitE;",
  });
  const ws = slab({ r0: LAYERS.wall[0], r1: LAYERS.wall[1], half: HALF, hole: RH, c: 0.08 });
  addMesh(wall, ws.body, wallMat, { edges: false });
  const wallLook = look(wall, [UW.uLitE]);
  wall.add(crestLine(ws.front, wallLook.line), crestLine(ws.back, wallLook.line));

  const layers = [bumper, blanket, wall];
  for (const p of layers) root.add(p);

  /* ── the gap: « dix centimètres de vide » — at `litGap`, a soft volume of veille light, the only time « nothing » shows ── */
  const gapMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uAmount: { value: 0 }, uOff: { value: new THREE.Vector3() }, uDzBu: { value: 0 }, uDzBl: { value: 0 }, uColor: { value: VEILLE.clone() } },
    vertexShader: /* glsl */ `
      varying vec3 vP;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount, uDzBu, uDzBl; uniform vec3 uOff, uColor; varying vec3 vP;
      float dens(vec3 p) {
        float yy = p.y * p.y;
        float top = sqrt(max(${(LAYERS.gap[1] ** 2).toFixed(2)} - yy, 0.0)) - ${R0.toFixed(2)} + uDzBu;
        float bot = sqrt(max(${(LAYERS.gap[0] ** 2).toFixed(2)} - yy, 0.0)) - ${R0.toFixed(2)} + uDzBl;
        float w = (p.z - bot) / max(top - bot, 0.1);
        if (w <= 0.0 || w >= 1.0) return 0.0;
        float across = smoothstep(0.0, 0.08, w) * (1.0 - smoothstep(0.92, 1.0, w));
        float r2 = (p.x * p.x + p.y * p.y) / 110.0; // brightest on the bille's axis, fading toward the cut edges
        return across * exp(-r2) * (1.0 - smoothstep(16.0, 20.0, abs(p.x))) * (1.0 - smoothstep(16.0, 20.0, abs(p.y))) * (0.7 + 0.3 * sin(3.14159 * w));
      }
      void main() {
        if (uAmount < 0.003) discard;
        vec3 ro = cameraPosition - uOff;
        vec3 rd = normalize(vP - cameraPosition);
        vec3 rs = vec3(abs(rd.x) < 1e-5 ? 1e-5 : rd.x, abs(rd.y) < 1e-5 ? 1e-5 : rd.y, abs(rd.z) < 1e-5 ? 1e-5 : rd.z);
        vec3 bmin = vec3(-20.6, -20.6, ${(Z_BLANKET + 0.05).toFixed(2)} + uDzBl);
        vec3 bmax = vec3(20.6, 20.6, ${(Z_BACK - 0.05).toFixed(2)} + uDzBu);
        vec3 t0 = (bmin - ro) / rs;
        vec3 t1 = (bmax - ro) / rs;
        vec3 tn = min(t0, t1);
        vec3 tf = max(t0, t1);
        float a = max(max(tn.x, tn.y), max(tn.z, 0.0));
        float b = min(min(tf.x, tf.y), tf.z);
        if (b <= a) discard;
        float dt = (b - a) / 24.0;
        float sum = 0.0;
        for (int i = 0; i < 24; i++) sum += dens(ro + rd * (a + (float(i) + 0.5) * dt));
        gl_FragColor = vec4(uColor * (1.0 - exp(-sum * dt * 0.05)) * uAmount, 1.0);
      }`,
  });
  const gapVol = new THREE.Mesh(new THREE.BoxGeometry(41.2, 41.2, 1), gapMat);
  gapVol.renderOrder = 4;
  gapVol.visible = false;
  root.add(gapVol);

  /* ── the bille: a white-hot ball, its halo, its streak ── */
  const bille = new THREE.Group();
  const billeBall = hotBall(BILLE.r);
  const billeHalo = makeHalo(INK.clone().multiplyScalar(1.3), SIGNAL.clone().multiplyScalar(1.1), { core: BILLE.r, minPx: 13 });
  bille.add(billeBall, billeHalo);
  root.add(bille);
  const trail = makeTrail();
  root.add(trail);

  /* ── the baseball-size one: a dark lump of signal, an object (not a light), its rim lit signal ── */
  const bigPart = makePart("big");
  const lump = new THREE.IcosahedronGeometry(BIG.r, 3);
  {
    const R = rng(1408);
    const bumps = Array.from({ length: 14 }, () => {
      const z = 2 * R() - 1;
      const a = 2 * Math.PI * R();
      const s = Math.sqrt(1 - z * z);
      return [s * Math.cos(a), s * Math.sin(a), z, (R() - 0.4) * 0.22, 0.12 + 0.25 * R()];
    });
    const p = lump.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / BIG.r;
      const y = p.getY(i) / BIG.r;
      const z = p.getZ(i) / BIG.r;
      let k = 1;
      for (const [bx, by, bz, h, w] of bumps) k += h * Math.exp(-(1 - (x * bx + y * by + z * bz)) / w);
      p.setXYZ(i, x * BIG.r * k, y * BIG.r * k, z * BIG.r * k);
    }
    lump.computeVertexNormals();
  }
  addMesh(bigPart, lump, solid(0x7a2c17, { rough: 0.88, metal: 0.15 }), { edges: false });
  const bigRim = new THREE.Mesh(lump, glass(BRAND.signal, { base: 0, rim: 0.55, power: 2.2, edge: 0.35 }));
  bigRim.scale.setScalar(1.03);
  asShell([bigRim], 22);
  bigPart.add(bigRim);
  setPartOpacity(bigPart, 0);
  root.add(bigPart);

  /* ── the rifle bullet left behind: glass, ink ── */
  const bulletGeo = new THREE.LatheGeometry(
    [[0, -1.5], [0.33, -1.48], [0.39, -1.2], [0.39, 0.0], [0.35, 0.45], [0.26, 0.9], [0.13, 1.28], [0.01, 1.5]].map(([r, y]) => new THREE.Vector2(r, y)),
    40,
  ).rotateX(-Math.PI / 2); // its tip toward the wall (−z), the way it goes
  bulletGeo.scale(1, 1, BULLET.length / 3);
  const bulletMat = glass(BRAND.ink, { base: 0.01, rim: 0.6, power: 2.0, edge: 0.55, spec: 0.5, through: 0.2 });
  const bullet = new THREE.Mesh(bulletGeo, bulletMat);
  asShell([bullet], 21);
  bullet.visible = false;
  root.add(bullet);

  /* ── the gauges: ink, no figure — « un centimètre », « dix centimètres » by their length alone ── */
  const g1Mat = lineMat(BRAND.ink, 2.4, { opacity: 0 });
  const gauge1 = new THREE.Group();
  gauge1.add(segments([[[0, 0, 0], [0, 0, 1]], [[0, -0.28, 0], [0, 0.28, 0]], [[0, -0.28, 1], [0, 0.28, 1]]], g1Mat));
  gauge1.visible = false;
  root.add(gauge1);
  const g10Mat = lineMat(BRAND.ink, 2.4, { opacity: 0 });
  const g10y = GAUGE10.y; // the arc where it lies, at the bottom of the gap: it runs radially, face to face
  const g10Pairs = [[onCurve(GAUGE10.x, g10y, LAYERS.gap[1]), onCurve(GAUGE10.x, g10y, LAYERS.gap[0])]];
  const across = (r, h) => [onCurve(GAUGE10.x, g10y - h, r), onCurve(GAUGE10.x, g10y + h, r)];
  g10Pairs.push(across(LAYERS.gap[1] - 0.02, 0.9), across(LAYERS.gap[0] + 0.02, 0.9));
  for (let k = 1; k < 10; k++) g10Pairs.push(across(LAYERS.gap[1] - k, 0.35));
  const gauge10 = segments(g10Pairs, g10Mat);
  gauge10.visible = false;
  root.add(gauge10);
  const g10mid = onCurve(GAUGE10.x, g10y, (LAYERS.gap[0] + LAYERS.gap[1]) / 2);

  /* ── the radar sweep: a thin band of ink light that passes over the bille and does not catch it ── */
  const scanMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uS: { value: 0 }, uAmount: { value: 0 }, uColor: { value: INK.clone() } },
    vertexShader: "varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: /* glsl */ `
      uniform float uS, uAmount; uniform vec3 uColor; varying vec3 vP;
      void main() {
        float zs = mix(-7.0, 7.0, uS);
        float q = (vP.z - zs) / 0.28;
        float band = exp(-q * q);
        float wake = vP.z < zs ? 0.2 * exp(-(zs - vP.z) / 2.2) : 0.0;
        float lean = exp(-vP.y * vP.y / 20.0);
        gl_FragColor = vec4(uColor * (0.75 * band + wake) * lean * uAmount, 1.0);
      }`,
  });
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(16, 12).rotateY(Math.PI / 2), scanMat);
  scan.frustumCulled = false;
  scan.renderOrder = 8;
  scan.visible = false;
  root.add(scan);

  /* ── the impact ── */
  const flash = makeHalo(INK.clone().multiplyScalar(1.35), SIGNAL.clone().multiplyScalar(0.9), { soft: 0.75 });
  flash.position.set(0, 0, 0.35);
  const birth = makeHalo(INK.clone().multiplyScalar(0.7), SIGNAL.clone().multiplyScalar(1.1), { soft: 0.6 });
  const { shards: shardList, rain: rainList, jet: jetList } = cloudLists();
  const cloud = makeShards(shardList, { du: 0.22 });
  const rain = makeShards(rainList, { depthTest: false });
  root.add(flash, birth, cloud, rain);

  /* ── the mirror: one flat plate of the same aluminium, 6.8 mm — a single point digs through it ── */
  const mirror = makePart("mirror", { lift: 0 });
  mirror.position.set(MIRROR.at[0], MIRROR.at[1], MIRROR.at[2]);
  const UM = { uHeatM: { value: 0 }, uSig: { value: SIGNAL.clone() } };
  const plateMat = inject(bare(solid(0xb4b9be, { rough: 0.38, metal: 0.32 })), "mirror", UM, {
    fHead: "uniform float uHeatM; uniform vec3 uSig;",
    emissive: "totalEmissiveRadiance += uSig * uHeatM * exp(-max(length(vWl.xy) - 1.5, 0.0) / 0.7);",
  });
  const ms = slab({ r0: -MIRROR.thick, r1: 0, half: MIRROR.half, hole: RHM, c: 0.08, flat: true, fill: "apart" });
  addMesh(mirror, ms.body, plateMat, { edges: false });
  const mFill = addMesh(mirror, ms.fill, plateMat, { edges: false });
  const hotMetal = (color) => bare(solid(color, { rough: 0.55, metal: 0.32, double: true }));
  const bowlMat = hotMetal(0x8c9196);
  const bowl = addMesh(mirror, ring([[0, -0.45], [0.6, -0.42], [1.05, -0.3], [1.35, -0.1], [RHM, 0]], { segments: 48 }), bowlMat, { edges: false });
  const crownJag = rng(9);
  const crownPts = Array.from({ length: 11 }, () => 0.55 + 0.45 * crownJag());
  const crownMat = hotMetal(0xa4a9ae);
  const crown = addMesh(
    mirror,
    ring([[RHM, 0], [RHM + 0.12, 0.24], [RHM + 0.42, 0.1], [RHM + 0.8, 0.004]], { segments: 66, jag: (f) => crownPts[Math.floor((f / (2 * Math.PI)) * 11) % 11] }),
    crownMat,
    { edges: false },
  );
  const bulgeMat = hotMetal(0x969ba0);
  const bulge = addMesh(mirror, ring([[0, -0.45], [0.8, -0.3], [RHM, 0]], { segments: 48 }), bulgeMat, { edges: false, pos: [0, 0, -MIRROR.thick] });
  const tornMat = hotMetal(0x969ba0);
  const torn = addMesh(
    mirror,
    ring([[RHM, -MIRROR.thick], [RHM + 0.1, -MIRROR.thick - 0.3], [RHM + 0.32, -MIRROR.thick - 0.6]], { z0: -MIRROR.thick, segments: 60, jag: (f) => 0.35 + 0.65 * Math.abs(Math.sin(3.5 * f + 1.1)) }),
    tornMat,
    { edges: false },
  );
  const slugMat = hotMetal(0x9a9fa4);
  const slug = addMesh(mirror, new THREE.CylinderGeometry(1.1, 1.0, 1.0, 28).rotateX(Math.PI / 2), slugMat, { edges: false });
  const jet = makeShards(jetList, { du: 0.3 });
  mirror.add(jet);
  const mirrorLine = lineMat(BRAND.ink, 2, { opacity: 0.72 });
  mirror.userData.part.mats.add(mirrorLine);
  mirror.add(crestLine(ms.front, mirrorLine), crestLine(ms.back, mirrorLine));
  const twin = new THREE.Group();
  const twinBall = hotBall(BILLE.r);
  const twinHalo = makeHalo(INK.clone().multiplyScalar(1.15), SIGNAL.clone().multiplyScalar(1.05), { core: BILLE.r });
  twin.add(twinBall, twinHalo);
  const twinTrail = makeTrail();
  const mFlash = makeHalo(INK.clone().multiplyScalar(1.35), SIGNAL.clone().multiplyScalar(0.9), { soft: 0.75 });
  mFlash.position.set(0, 0, 0.35);
  mirror.add(twin, twinTrail, mFlash);
  setPartOpacity(mirror, 0);
  root.add(mirror);

  const A = {
    impact: anchor(root, 0, 0, 0),
    bille: anchor(bille, 0, 0, 0),
    gap: anchor(root, 0, 0, (Z_BACK + Z_BLANKET) / 2),
    blanket: anchor(blanket, 0, 0, LAYERS.blanket[1] - R0),
    wall: anchor(wall, 0, 0, LAYERS.wall[1] - R0),
    mirror: anchor(root, MIRROR.at[0], MIRROR.at[1], 0),
    big: anchor(bigPart, 0, 0, 0),
    gauge10: anchor(root, g10mid[0], g10mid[1], g10mid[2]),
  };
  const parts = { bumper, blanket, wall, mirror };

  const setLit = (L, k, glow = 0.05) => {
    L.line.color.lerpColors(INK, VEILLE, k);
    L.line.opacity = 0.72 + 0.28 * k;
    L.line.linewidth = 2 + 0.9 * k;
    for (const u of L.faces) u.value.copy(VEILLE).multiplyScalar(glow * k);
  };
  const UBu = UB.uRing.value;
  const UBh = UB.uHole.value;
  const UBs = UB.uSpot.value;
  const cloudU = cloud.material.uniforms;
  const rainU = rain.material.uniforms;
  const jetU = jet.material.uniforms;
  const trailU = trail.material.uniforms;
  const twinTrailU = twinTrail.material.uniforms;

  return {
    root, parts, A,
    update(P, time = 0, px = 1000, eye = null) {
      void time;
      void px;
      const ox = root.position.x;
      const oy = root.position.y;
      const oz = root.position.z;

      /* the exploded view: outward, toward where the bille comes from (+z); the wall stays */
      const k = clamp01(P.explode ?? 0);
      const kb = SPREAD.bumper * settle(clamp01(k / 0.8));
      const kl = SPREAD.blanket * settle(clamp01((k - 0.15) / 0.8));
      bumper.position.z = kb;
      blanket.position.z = kl;
      wall.position.z = SPREAD.wall * k;

      const b = clamp01(P.burst ?? 0);
      const held = smooth(0.94, 1.0, b);
      setLit(bumperLook, clamp01(P.litBumper ?? 0));
      setLit(blanketLook, clamp01(P.litBlanket ?? 0));
      // the wall that held glows plainly veille (its cut faces are what a side view sees of it)
      const lw = clamp01(P.litWall ?? 0);
      setLit(wallLook, Math.max(lw, held), held > lw ? 0.05 + 0.2 * held : 0.05);

      /* the gap's light */
      const lg = clamp01(P.litGap ?? 0);
      gapVol.visible = lg > 0.003;
      if (gapVol.visible) {
        const z0 = Z_BLANKET + 0.05 + kl;
        const z1 = Z_BACK - 0.05 + kb;
        gapVol.position.set(0, 0, (z0 + z1) / 2);
        gapVol.scale.set(1, 1, Math.max(0.1, z1 - z0));
        gapMat.uniforms.uAmount.value = 0.3 * lg;
        gapMat.uniforms.uOff.value.set(ox, oy, oz);
        gapMat.uniforms.uDzBu.value = kb;
        gapMat.uniforms.uDzBl.value = kl;
      }

      /* the bille, on its path, until the flash swallows it */
      const dist = Math.max(0, P.dist ?? 0);
      const shown = clamp01(P.bille ?? 0) * (1 - smooth(0.03, 0.06, b));
      const cz = dist + BILLE.r;
      bille.position.set(0, 0, cz);
      bille.visible = shown > 0.01;
      billeBall.material.uniforms.uAmount.value = shown;
      billeBall.material.depthWrite = shown > 0.9;
      shine(billeHalo, shown, BILLE.r * 2.2);
      let far = 100;
      if (eye) far = Math.hypot(eye.x - ox, eye.y - oy, eye.z - oz - cz);
      const tr = clamp01(P.trail ?? 0) * shown;
      trail.visible = tr > 0.01;
      if (trail.visible) {
        const len = Math.min(700, Math.max(4, 0.34 * far));
        trailU.uHead.value.set(0, 0, cz);
        trailU.uTail.value.set(0, 0, cz + len);
        trailU.uAmount.value = tr;
      }
      // a hot thing nearing a plate lights it, where it will hit
      UBs.x = shown * 0.9 * (1 - smooth(0, 10, dist));
      UBs.y = 0.5 + 0.15 * dist;

      /* the big one, the ghost bullet */
      const bg = clamp01(P.big ?? 0);
      setPartOpacity(bigPart, bg);
      bigRim.material.uniforms.uAmount.value = bg;
      bigPart.position.set(BIG.offset[0], BIG.offset[1], dist + BIG.offset[2]);
      const bu = clamp01(P.bullet ?? 0);
      bullet.visible = bu > 0.01;
      bulletMat.uniforms.uAmount.value = 0.9 * bu;
      bullet.position.set(BULLET.lateral[0], BULLET.lateral[1], BULLET.ref + (dist - BULLET.ref) / 15);

      /* the gauges, the sweep */
      const g1 = clamp01(P.gauge1 ?? 0);
      gauge1.visible = g1 > 0.01;
      g1Mat.opacity = g1;
      gauge1.position.set(GAUGE1.offset[0], GAUGE1.offset[1], dist + GAUGE1.offset[2]);
      const g10 = clamp01(P.gauge10 ?? 0);
      gauge10.visible = g10 > 0.01;
      g10Mat.opacity = g10;
      const s = clamp01(P.scan ?? 0);
      scan.visible = s > 0.001 && s < 0.999;
      scanMat.uniforms.uS.value = s;
      scanMat.uniforms.uAmount.value = 0.55 * Math.sin(Math.PI * s);
      scan.position.set(0, 0, cz);

      /* the impact: the flash, the hole, the cloud, the blanket, the rain, the wall that holds */
      const rise = clamp01(b / 0.025);
      const die = clamp01((b - 0.025) / 0.085);
      shine(flash, b > 0 ? 2.2 * rise * (1 - die) ** 2 : 0, 1.2 + 3.6 * rise * (1 - die) + 0.6 * die);
      const opened = b >= 0.06;
      plug.visible = !opened;
      lip.visible = opened;
      const heat = opened ? 1 - smooth(0.1, 0.6, b) : 0;
      UBh.y = heat;
      lipMat.emissive.copy(SIGNAL).multiplyScalar(1.5 * heat * heat + 0.25 * heat);
      const sh = clamp01(P.shock ?? 0);
      UBu.set(0.5 + 18 * sh, 0.6 + 1.4 * sh, sh > 0 && sh < 1 ? 1.4 * (1 - sh) ** 2 : 0);

      const u = (b - 0.1) / 0.6; // the cloud's clock: 0 at the hole, 1 its front on the blanket
      cloud.visible = b > 0.09 && b < 0.999;
      cloudU.uU.value = u;
      cloudU.uMolten.value = 0.6 * clamp01(P.molten ?? 0);
      cloudU.uAmount.value = 1 - smooth(0.93, 1.0, b);
      const bc = clamp01(u);
      shine(birth, b > 0.06 ? 0.8 * smooth(0.06, 0.12, b) * (1 - smooth(0.12, 0.4, b)) : 0, 0.8 + 1.4 * bc);
      birth.position.set(0, 0, Z_BACK - 0.35 * GAP * bc);

      const crater = smooth(0.7, 0.85, b);
      UC.uCrater.value.set(crater, crater * (1 - smooth(0.8, 1.0, b)) * 1.3);
      UW.uBulge.value = 0.12 * smooth(0.85, 1.0, b);

      rain.visible = b >= 0.85;
      if (rain.visible) {
        rainU.uU.value = u;
        rainU.uAmount.value = 1;
        // the rain is on the wall, behind the blanket: it is drawn through it, and only seen from the side
        let gate = 0;
        if (eye) {
          const ex = eye.x - ox;
          const ey = eye.y - oy;
          const ez = eye.z - oz;
          const l = Math.hypot(ex, ey, ez) || 1;
          gate = ez < LAYERS.wall[0] - R0 ? 0 : 1 - smooth(0.3, 0.52, Math.abs(ez) / l);
        }
        rainU.uGate.value = gate;
      }

      /* the mirror plate and its twin */
      const m = clamp01(P.mirror ?? 0);
      setPartOpacity(mirror, m);
      if (m > 0.004) {
        const pc = clamp01(P.pierce ?? 0);
        const g = smooth(0.4, 0.8, pc);
        const out = clamp01((pc - 0.8) / 0.2);
        mFill.visible = pc < 0.4;
        bowl.visible = pc >= 0.4 && pc < 0.8;
        bulge.visible = pc >= 0.4 && pc < 0.8;
        crown.visible = pc >= 0.4;
        torn.visible = pc >= 0.8;
        slug.visible = pc >= 0.8 && out < 0.999;
        bowl.scale.set(1, 1, 0.15 + 0.85 * g);
        crown.scale.set(1, 1, 0.2 + 0.8 * g);
        bulge.scale.set(1, 1, 0.1 + 0.9 * g);
        const hm = pc >= 0.4 ? smooth(0.4, 0.45, pc) * (1 - 0.6 * smooth(0.8, 1.0, pc)) : 0;
        UM.uHeatM.value = 0.8 * hm;
        bowlMat.emissive.copy(SIGNAL).multiplyScalar(1.6 * hm);
        bulgeMat.emissive.copy(SIGNAL).multiplyScalar(1.1 * hm * g);
        crownMat.emissive.copy(SIGNAL).multiplyScalar(0.5 * hm);
        tornMat.emissive.copy(SIGNAL).multiplyScalar(0.9 * hm);
        const e = 1 - (1 - out) * (1 - out);
        slug.position.set(0, 0, -MIRROR.thick - 0.5 - 13 * e);
        slug.rotation.set(0.6 * e, 0.25 * e, 0);
        slugMat.emissive.copy(SIGNAL).multiplyScalar(1.8 * (1 - 0.4 * out));
        jet.visible = pc >= 0.8;
        jetU.uU.value = out + (pc >= 0.8 ? 0.02 : 0);
        jetU.uMolten.value = 0.5;
        jetU.uAmount.value = m;
        const tw = pc < 0.4 ? m : 0;
        const tz = MIRROR.twinFrom * (1 - clamp01(pc / 0.4)) + BILLE.r;
        twin.visible = tw > 0.01;
        twin.position.set(0, 0, tz);
        twinBall.material.uniforms.uAmount.value = tw;
        shine(twinHalo, tw, BILLE.r * 2.2);
        twinTrail.visible = tw > 0.01;
        twinTrailU.uHead.value.set(0, 0, tz);
        twinTrailU.uTail.value.set(0, 0, tz + 14);
        twinTrailU.uAmount.value = 0.7 * tw;
        const fr = clamp01((pc - 0.4) / 0.02);
        const fd = clamp01((pc - 0.42) / 0.07);
        shine(mFlash, pc >= 0.4 ? 2.0 * m * fr * (1 - fd) ** 2 : 0, 1.2 + 3.0 * fr * (1 - fd));
      }
    },
  };
}
