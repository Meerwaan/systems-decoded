// DOSSIER L01 — the GLASS: the product, the one solid thing of the factory.
//
//   buildGlass() → {
//     line,                       a Group in LINE coordinates (plan.js · ST): the batch heaps, the melt in the furnace,
//                                 the ribbon from the throat to the cut (on the tin, through the lehr), the other
//                                 windshields of the queue, the bending mould
//     cutEnd,                     an Object3D at the ribbon's cut end, in a windshield-like frame (casse's "plainLine")
//     hero:    { root, onSurface, A },   the windshield (two glasses, the film, the band, its dots, the stamp, the sensors)
//     side:    { root, onSurface, A },   the tempered side window (one glass, its stamp)
//     sample:  { root, onSurface },      the 30 cm laminated sample of the ball tests
//     witness: { root, onSurface },      the 50 cm tempered witness pane
//     update(p, time, px)
//   }
//
// THE PANE FRAME (every root above): origin at the pane's centre; x across (for the windshield: toward the PASSENGER,
// the car's +x), y up its slant (toward the top edge), z toward the INSIDE of the car (the inner glass; the outer
// glass is on −z). A windshield bulges OUTWARD: its centre stands at z = −(sag + sagV) once bent. world.js places
// the roots (bench, line, car, road); casse.js drapes its fractures with `onSurface`.
//   onSurface(x, y, out, outN?, bend = 1) → out: the point of the pane's MID-PLANE at (x, y) (cm from the centre, in the
//   flat pane's own plane), bent by `bend`; outN its normal (toward +z). It is what keeps a crack on the glass.
//
// p = { place, hero, cut, print, bend, open, film, milk, explode, sensors, glow, queue, pos,
//       litGlass, litFilm, litBand, litStamp, flow, batch, charge, melt, ribbon, pull, silver, mould,
//       side, sideGlow, sideFilm, stress, sample, witness }
//   (the meaning of each number is in world.js · FIRST; `place` is world's SET, `pos` the hero's x on the line)
//
// HOW IT IS DRAWN. Every piece of glass (windshield, ribbon, side window, sample, witness, trim) goes through ONE
// shader, `glassMaterial`: the bend is computed in the vertex shader with the very formula of `onSurface` (so a crack
// laid by casse.js stays on the glass at any `bend`), the studio is mirrored analytically (the warm softbox, the cool
// strip, the ceiling: the boxes of stage.js · studioEnvironment) with a Fresnel term, heat is a signal emission with a
// core hotter than the edges, the milky veil leaves by patches from the centre. Blending is premultiplied: the glass
// darkens a little what lies behind it and adds its reflections — it stays glass, never a flat colour. The edge of
// every slab (`aRim`) is drawn as a lit, slightly luminous band: the tranche that catches the light.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, edgesOf, asShell, fatLine, box, mergeGeometries, SOFTBOX } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { LINE, ST, WS, SIDE, DROP, PANE, SILVER } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const remap = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (a, b, x) => {
  const t = remap(x, a, b);
  return t * t * (3 - 2 * t);
};
const TAU = Math.PI * 2;
const SET_LINE = 2;

/** The cross-bend's profile: 1 − CU2·u² − CU4·u⁴ — flatter in the middle than a parabola, the sides falling away
 * (a real windshield's wrap). Same depth at the centre (sag), zero at the foot's corners. */
const CU2 = 0.45;
const CU4 = 0.55;
/** The bent mid-plane of a w × h pane: sag across and along, scaled by `bend`. (The shader repeats this formula: GLSL_BEND.) */
function surfaceOf(w, h, sag, sagV) {
  return (x, y, out, outN, bend = 1) => {
    const u = (2 * x) / w;
    const v = (2 * y) / h;
    const u2 = u * u;
    out.set(x, y, -(sag * (1 - CU2 * u2 - CU4 * u2 * u2) + sagV * (1 - v * v)) * bend);
    if (outN) outN.set((-sag * bend * (2 * CU2 * u + 4 * CU4 * u2 * u) * 2) / w, (-sagV * 4 * y * bend) / (h * h), 1).normalize();
    return out;
  };
}

/* ───────────────────────────── outlines ───────────────────────────── */

/** Inner signed distance (cm, > 0 inside) of a trapezoid w at the foot, wTop at the top, h tall, corners rounded by r. */
function trapSdf(w, wTop, h, r) {
  const dx = (wTop - w) / 2;
  const len = Math.hypot(dx, h);
  const nx = -h / len;
  const ny = dx / len;
  return (x, y) => {
    const eB = y + h / 2;
    const eT = h / 2 - y;
    const eR = (x - w / 2) * nx + (y + h / 2) * ny;
    const eL = (-x - w / 2) * nx + (y + h / 2) * ny;
    const m = Math.min(eB, eT, eR, eL);
    if (m >= r) return m;
    const a = Math.min(eB - r, 0);
    const b = Math.min(eT - r, 0);
    const c = Math.min(eR - r, 0);
    const d = Math.min(eL - r, 0);
    return r - Math.sqrt(a * a + b * b + c * c + d * d);
  };
}

/** N points on the zero of `sdf`, found along rays from the centre (the shape is convex). Flat [x0, y0, x1, y1, …]. */
function outlineOf(sdf, hw, hh, N = 180) {
  const out = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU;
    const dx = Math.cos(a) * hw;
    const dy = Math.sin(a) * hh;
    let lo = 0;
    let hi = 1.6;
    for (let k = 0; k < 34; k++) {
      const m = (lo + hi) / 2;
      if (sdf(dx * m, dy * m) > 0) lo = m;
      else hi = m;
    }
    out.push(dx * lo, dy * lo);
  }
  return out;
}

/* ───────────────────────────── geometry builders ───────────────────────────── */

const ATTRS = ["aEdge", "aHeat", "aRim", "aThin", "aRough", "aBand"];
function newBuf() {
  const b = { pos: [], nrm: [], idx: [] };
  for (const k of ATTRS) b[k] = [];
  return b;
}
function vert(b, x, y, z, nx, ny, nz, a = {}) {
  b.pos.push(x, y, z);
  b.nrm.push(nx, ny, nz);
  b.aEdge.push(a.edge ?? 1);
  b.aHeat.push(a.heat ?? 1);
  b.aRim.push(a.rim ?? 0);
  b.aThin.push(a.thin ?? 0);
  b.aRough.push(a.rough ?? 0);
  b.aBand.push(a.band ?? 0);
  return b.pos.length / 3 - 1;
}
function toGeometry(b) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(b.pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(b.nrm, 3));
  for (const k of ATTRS) g.setAttribute(k, new THREE.Float32BufferAttribute(b[k], 1));
  g.setIndex(b.idx);
  g.computeBoundingSphere();
  return g;
}

/** One face of a pane: concentric rings from the centre to the outline (dense at the edge), at z, normal ±z.
 * `band`: optional (x, y) → the band's border distance, carried by the vertices (aBand). */
function faceInto(b, outline, sdf, z, nz, edgeScale = 14, RINGS = 14, pw = 1.6, band = null) {
  const N = outline.length / 2;
  const c = vert(b, 0, 0, z, 0, 0, nz, { edge: clamp01(sdf(0, 0) / edgeScale), band: band ? band(0, 0) : 0 });
  for (let k = 1; k <= RINGS; k++) {
    const t = 1 - Math.pow(1 - k / RINGS, pw);
    for (let i = 0; i < N; i++) {
      const x = outline[2 * i] * t;
      const y = outline[2 * i + 1] * t;
      vert(b, x, y, z, 0, 0, nz, { edge: clamp01(sdf(x, y) / edgeScale), band: band ? band(x, y) : 0 });
    }
  }
  for (let i = 0; i < N; i++) b.idx.push(c, c + 1 + i, c + 1 + ((i + 1) % N));
  for (let k = 1; k < RINGS; k++) {
    const r0 = c + 1 + (k - 1) * N;
    const r1 = c + 1 + k * N;
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      b.idx.push(r0 + i, r1 + i, r1 + j, r0 + i, r1 + j, r0 + j);
    }
  }
}
/** The edge of a slab between z0 and z1 along the outline: its normals in the plane, outward. */
function rimInto(b, outline, z0, z1) {
  const N = outline.length / 2;
  const s = b.pos.length / 3;
  for (let i = 0; i < N; i++) {
    const p = (i + N - 1) % N;
    const q = (i + 1) % N;
    let nx = outline[2 * q + 1] - outline[2 * p + 1];
    let ny = -(outline[2 * q] - outline[2 * p]);
    const l = Math.hypot(nx, ny) || 1;
    nx /= l;
    ny /= l;
    if (nx * outline[2 * i] + ny * outline[2 * i + 1] < 0) {
      nx = -nx;
      ny = -ny;
    }
    vert(b, outline[2 * i], outline[2 * i + 1], z0, nx, ny, 0, { edge: 0, rim: 1 });
    vert(b, outline[2 * i], outline[2 * i + 1], z1, nx, ny, 0, { edge: 0, rim: 1 });
  }
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    b.idx.push(s + 2 * i, s + 2 * i + 1, s + 2 * j + 1, s + 2 * i, s + 2 * j + 1, s + 2 * j);
  }
}
/** A slab of glass (two faces and its edge) between z0 (the −z face) and z1. */
function slabGeometry(outline, sdf, z0, z1, edgeScale, rings = 14, pw = 1.6) {
  const b = newBuf();
  faceInto(b, outline, sdf, z0, -1, edgeScale, rings, pw);
  faceInto(b, outline, sdf, z1, 1, edgeScale, rings, pw);
  rimInto(b, outline, z0, z1);
  return toGeometry(b);
}
function faceGeometry(outline, sdf, z, rings = 14, pw = 1.6, band = null) {
  const b = newBuf();
  faceInto(b, outline, sdf, z, -1, 14, rings, pw, band);
  return toGeometry(b);
}

/* ───────────────────────────── the glass shader ───────────────────────────── */

/** The studio's boxes, as directions (stage.js · studioEnvironment): what the glass mirrors. */
function rectLight(pos, w, h) {
  const c = new THREE.Vector3(...pos);
  const d = c.length();
  c.normalize();
  const u = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), c);
  if (u.lengthSq() < 1e-6) u.set(1, 0, 0);
  u.normalize();
  const v = new THREE.Vector3().crossVectors(c, u);
  return { c, u, v, s: new THREE.Vector3(w / 2, h / 2, d) };
}
const ENV = [rectLight(SOFTBOX.pos, SOFTBOX.w, SOFTBOX.h), rectLight([8, 3, -7], 1.6, 10), rectLight([0, 12, 0.001], 12, 12)];
const ENV_UNIFORMS = {};
ENV.forEach((e, i) => {
  ENV_UNIFORMS[`uE${i}c`] = { value: e.c };
  ENV_UNIFORMS[`uE${i}u`] = { value: e.u };
  ENV_UNIFORMS[`uE${i}v`] = { value: e.v };
  ENV_UNIFORMS[`uE${i}s`] = { value: e.s };
});
const KEY = new THREE.Vector3(-30, 52, 38).normalize();

const GLSL_NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) { return 0.5 * vnoise(p) + 0.3 * vnoise(p * 2.03 + 7.1) + 0.2 * vnoise(p * 4.07 + 3.3); }
`;
const GLSL_ENV = /* glsl */ `
  uniform vec3 uE0c, uE0u, uE0v, uE0s, uE1c, uE1u, uE1v, uE1s, uE2c, uE2u, uE2v, uE2s;
  float rectHit(vec3 r, vec3 c, vec3 u, vec3 v, vec3 s) {
    float t = dot(r, c);
    vec3 p = r * (s.z / max(t, 1e-3));
    vec2 q = abs(vec2(dot(p, u), dot(p, v))) / s.xy;
    // very soft borders: a hard-edged glint is a sticker on a coarse mesh
    return smoothstep(0.0, 0.3, t) * (1.0 - smoothstep(0.7, 1.1, max(q.x, q.y)));
  }
  // the photographer's strip: a long thin softbox above and behind the camera (it follows it, like a product
  // shot's rig) — whatever the angle, a glass shows a soft streak and a gradient, and reads as a sheet of glass
  vec3 envView(vec3 r) {
    vec3 rv = (viewMatrix * vec4(r, 0.0)).xyz;
    vec3 c = normalize(vec3(-0.22, 0.46, 0.86));
    float t = dot(rv, c);
    vec3 e = rv - c * t;
    float streak = smoothstep(0.2, 0.6, t) * (1.0 - smoothstep(0.05, 0.13, abs(e.y))) * (1.0 - smoothstep(0.7, 1.1, abs(e.x)));
    float dome = smoothstep(-0.1, 0.75, rv.y) * smoothstep(-0.4, 0.5, rv.z);
    return vec3(1.0, 0.97, 0.92) * (4.5 * streak + 0.55 * dome);
  }
  vec3 envSpec(vec3 r) {
    return envView(r) + vec3(1.0, 0.95, 0.88) * 2.2 * rectHit(r, uE0c, uE0u, uE0v, uE0s)
         + vec3(0.92, 0.95, 1.0) * 4.5 * rectHit(r, uE1c, uE1u, uE1v, uE1s)
         + vec3(0.7) * rectHit(r, uE2c, uE2u, uE2v, uE2s)
         + vec3(0.12) * smoothstep(-0.3, 0.6, r.y);
  }
`;
// heat → colour: 0.1 ≈ 450 °C (barely), 0.5 ≈ 600 °C (a dark red that smoulders), 1 ≥ 700 °C (signal, a white core)
const GLSL_HEAT = /* glsl */ `
  uniform vec3 uSignal;
  vec3 heatColor(float g, float core) {
    float k = smoothstep(0.06, 0.5, g) * 0.34 + smoothstep(0.5, 1.0, g) * 0.72;
    k *= mix(0.34, 1.22, core);
    float hot = smoothstep(0.45, 0.95, g);
    vec3 c = uSignal * k * vec3(1.0, mix(0.42, 1.0, hot), mix(0.3, 1.0, hot));
    c += vec3(1.0, 0.5, 0.2) * 0.22 * smoothstep(0.85, 1.0, g) * core * core;
    return c;
  }
  float heatAlpha(float g) { return smoothstep(0.04, 0.62, g) * 0.94; }
`;

const GLSL_BEND = /* glsl */ `
  vec3 bendP(vec3 p, vec4 s, float b) {
    vec2 uv = 2.0 * p.xy / s.xy; float u2 = uv.x * uv.x;
    p.z -= (s.z * (1.0 - ${CU2.toFixed(3)} * u2 - ${CU4.toFixed(3)} * u2 * u2) + s.w * (1.0 - uv.y * uv.y)) * b;
    return p;
  }
  vec3 bendN(vec3 p, vec4 s, float b) {
    vec2 uv = 2.0 * p.xy / s.xy; float u = uv.x;
    return normalize(vec3(-b * s.z * (2.0 * ${CU2.toFixed(3)} * u + 4.0 * ${CU4.toFixed(3)} * u * u * u) * 2.0 / s.x, -4.0 * s.w * b * p.y / (s.y * s.y), 1.0));
  }
`;
const GLASS_VS = /* glsl */ `
  ${GLSL_BEND}
  uniform float uBend, uPull, uFlow, uWave;
  uniform vec4 uSurf;
  attribute float aEdge; attribute float aHeat; attribute float aRim; attribute float aThin; attribute float aRough;
  varying vec3 vW; varying vec3 vN; varying vec2 vP; varying float vHeat; varying float vEdge; varying float vRim; varying float vSide;
  void main() {
    vec3 p = position; vec3 n = normal;
    vSide = normal.z;
  #ifdef RIBBON
    p.y -= aThin * uPull;
    // the fresh glass is wavy where it falls; the waves ride downstream and die as it floats
    float s = p.x - uFlow;
    float a1 = s * 0.045 + p.z * 0.021; float a2 = s * 0.083 - p.z * 0.047 + 1.7;
    float amp = aRough * uWave;
    p.y += amp * (0.6 * sin(a1) + 0.4 * sin(a2));
    float dx = amp * (0.6 * 0.045 * cos(a1) + 0.4 * 0.083 * cos(a2));
    float dz = amp * (0.6 * 0.021 * cos(a1) - 0.4 * 0.047 * cos(a2));
    if (aRough > 0.001) n = normalize(vec3(-dx, 1.0, -dz));
    vP = vec2(p.x, p.z);
  #else
    if (abs(n.z) > 0.5) n = sign(n.z) * bendN(p, uSurf, uBend);
    p = bendP(p, uSurf, uBend);
    vP = p.xy;
  #endif
    vec4 wp = modelMatrix * vec4(p, 1.0);
    vW = wp.xyz;
    vN = normalize(mat3(modelMatrix) * n);
    vHeat = aHeat; vEdge = aEdge; vRim = aRim;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const GLASS_FS = /* glsl */ `
  uniform vec3 uTint, uInk, uKey;
  uniform vec2 uHalf;
  uniform float uAmount, uFace, uBody, uSpec, uRimK, uGlow, uMilk, uLit, uSelf, uGround, uFlow, uTex;
  varying vec3 vW; varying vec3 vN; varying vec2 vP; varying float vHeat; varying float vEdge; varying float vRim; varying float vSide;
  uniform float uSpecSide;
  ${GLSL_NOISE}
  ${GLSL_ENV}
  ${GLSL_HEAT}
  void main() {
    if (uAmount < 0.003) discard;
    vec3 v = normalize(cameraPosition - vW);
    vec3 n = normalize(vN);
    float c = dot(n, v);
    if (c < 0.0) { n = -n; c = -c; }
    c = clamp(c, 0.0, 1.0);
    float g1 = 1.0 - c;
    float F = 0.04 + 0.96 * pow(clamp(g1, 0.0, 1.0), 5.0);
    vec3 r = reflect(-v, n);
    float grain = 1.0;
  #ifdef RIBBON
    grain = 0.72 + 0.56 * fbm(vec2((vP.x - uFlow) * 0.011, vP.y * 0.018));
  #endif
    float sideMask = uSpecSide == 0.0 ? 1.0 : step(0.5, vSide * uSpecSide);
    vec3 spec = min(envSpec(r) * F * uSpec * grain * sideMask, vec3(0.42));
    float lam = clamp(dot(n, uKey), 0.0, 1.0);
    vec3 rgb; float a;
    if (vRim > 0.5) {
      // the tranche: lit, a little luminous (the light that runs inside a glass comes out at its edge)
      float sharp = pow(clamp(g1, 0.0, 1.0), 2.0);
      rgb = uTint * uRimK * (0.16 + mix(0.75, 0.42, uGround) * lam + mix(0.25, 0.6, uGround) * sharp) + spec * 0.5;
      a = 0.9;
    } else {
      float tex = 1.0;
      if (uTex > 0.0) tex = mix(1.0, 0.8 + 0.4 * fbm(vP * 1.1 + 1.3), uTex);
      rgb = uTint * uFace * (0.6 + 0.4 * lam) * tex + spec;
      a = uBody + 0.3 * F;
    }
    rgb += uTint * (uSelf + 0.12 * uLit) * (uTex > 0.0 ? mix(1.0, 0.82 + 0.36 * fbm(vP * 1.1 + 1.3), uTex) : 1.0);
    // the milky sandwich: air still trapped between the layers. It leaves by patches, the centre first
    if (uMilk > 0.001) {
      vec2 q = vP / uHalf;
      float rr = length(q * vec2(1.0, 0.9));
      float nz = fbm(vP * 0.07 + 3.1);
      float clear = (1.0 - uMilk) * 1.5 - 0.3;
      float mk = smoothstep(clear - 0.05, clear + 0.05, rr + 0.35 * (nz - 0.5));
      float mott = 0.72 + 0.28 * fbm(vP * 0.21);
      rgb += uInk * 0.32 * mk * mott * (0.55 + 0.45 * lam);
      a = mix(a, 0.78, mk);
    }
    // heat
    float g = clamp(uGlow * vHeat, 0.0, 1.0);
    if (g > 0.001) {
      // a sheet that glows, not a cushion: a core lighter than its edges and corners (they cool first), a grain of
      // matter, still transparent enough to stay a sheet, the studio still passing on it, and its tranche brighter
      float core = clamp(vEdge, 0.0, 1.0);
      core = core * core * (3.0 - 2.0 * core);
      float mott = 0.84 + 0.32 * fbm(vP * 0.045 + 2.0);
      vec3 h = heatColor(g, core) * grain * mott;
      float ha = heatAlpha(g) * mix(0.6, 0.86, core);
      if (vRim > 0.5) { h = heatColor(g, 1.0) * 1.35; ha = heatAlpha(g); }
      rgb = mix(rgb, h, ha) + spec * 0.85;
      a = max(a, ha);
    }
    gl_FragColor = vec4(min(rgb, vec3(2.9)) * uAmount, clamp(a, 0.0, 1.0) * uAmount);
  }
`;

/** A soft light under a hot pane, following its bend inside, flat beyond its edges: a heart and a long trail. */
const HALO_VS = /* glsl */ `
  uniform float uBend; uniform vec4 uSurf; uniform float uOff;
  varying vec2 vQ;
  ${GLSL_BEND}
  void main() {
    vec3 p = position;
    vec2 c = clamp(p.xy, -uSurf.xy * 0.5, uSurf.xy * 0.5);
    p.z = bendP(vec3(c, 0.0), uSurf, uBend).z + uOff;
    vQ = p.xy / (uSurf.xy * 0.5);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
  }
`;
const HALO_FS = /* glsl */ `
  uniform vec3 uSignal; uniform float uK;
  varying vec2 vQ;
  void main() {
    if (uK < 0.002) discard;
    float r = length(vQ * vec2(0.92, 1.0));
    float f = exp(-max(r - 0.55, 0.0) * 3.2) * (1.0 - smoothstep(1.2, 1.75, r));
    gl_FragColor = vec4(uSignal * vec3(1.0, 0.55, 0.4) * uK * f, 1.0);
  }
`;
function makeHalo(w, h, surf, bendU, off) {
  const m = new THREE.ShaderMaterial({
    uniforms: { uBend: bendU, uSurf: { value: new THREE.Vector4(...surf) }, uOff: { value: off }, uSignal: { value: SIGNAL }, uK: { value: 0 } },
    vertexShader: HALO_VS, fragmentShader: HALO_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.9, h * 2.0, 40, 30), m);
  mesh.renderOrder = 0;
  mesh.frustumCulled = false;
  return mesh;
}

const premult = (m) => {
  m.transparent = true;
  m.blending = THREE.CustomBlending;
  m.blendSrc = THREE.OneFactor;
  m.blendDst = THREE.OneMinusSrcAlphaFactor;
  m.blendSrcAlpha = THREE.OneFactor;
  m.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
  return m;
};

/** The glass. `shared` hands it uniforms it shares with other layers (bend, amount, flow). */
function glassMaterial({ tint = INK, face = 0.014, body = 0.035, spec = 1, rimK = 1, ribbon = false, specSide = 0, surf = [WS.w, WS.h, WS.sag, WS.sagV], shared = {} } = {}) {
  const uniforms = {
    ...ENV_UNIFORMS,
    uBend: shared.uBend ?? { value: 1 },
    uAmount: shared.uAmount ?? { value: 1 },
    uFlow: shared.uFlow ?? { value: 0 },
    uPull: shared.uPull ?? { value: 0 },
    uWave: { value: 1.1 },
    uSurf: { value: new THREE.Vector4(...surf) },
    uHalf: { value: new THREE.Vector2(surf[0] / 2, surf[1] / 2) },
    uTint: { value: new THREE.Color(tint) },
    uInk: { value: INK },
    uSignal: { value: SIGNAL },
    uKey: { value: KEY },
    uFace: { value: face },
    uBody: { value: body },
    uSpec: { value: spec },
    uRimK: { value: rimK },
    uGlow: shared.uGlow ?? { value: 0 },
    uMilk: { value: 0 },
    uLit: { value: 0 },
    uSelf: { value: 0 },
    uGround: { value: 1 },
    uTex: { value: tint === VEILLE ? 1 : 0 },
    uSpecSide: { value: specSide },
  };
  const m = new THREE.ShaderMaterial({ uniforms, vertexShader: GLASS_VS, fragmentShader: GLASS_FS, defines: ribbon ? { RIBBON: 1 } : {}, side: THREE.DoubleSide, depthWrite: false, fog: false });
  return premult(m);
}

/* ── the black band (the frit), its dots, the mirror's patch and its windows; printed by a sweep ── */
const BAND_VS = /* glsl */ `
  uniform float uBend; uniform vec4 uSurf;
  attribute float aBand;
  varying vec2 vP; varying vec3 vW; varying vec3 vN; varying float vG;
  ${GLSL_BEND}
  void main() {
    vec3 n = bendN(position, uSurf, uBend);
    vec3 p = bendP(position, uSurf, uBend);
    vP = p.xy; vG = aBand;
    vec4 wp = modelMatrix * vec4(p, 1.0);
    vW = wp.xyz; vN = normalize(mat3(modelMatrix) * n);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const BAND_FS = /* glsl */ `
  uniform vec4 uTrap; uniform vec3 uBand; uniform vec4 uPatch; uniform vec3 uInk;
  uniform float uAmount, uFrontB, uFrontD, uLit;
  varying vec2 vP; varying vec3 vW; varying vec3 vN; varying float vG;
  ${GLSL_ENV}
  float halftone(float g, float P) {
    // the dot gradient: dots on a grid, their radius shrinking away from the band; sub-pixel, their average grey
    vec2 cell = (fract(vP / P) - 0.5) * P;
    float rr = length(cell);
    float rad = 0.6 * P * (1.0 - clamp(g / uBand.z, 0.0, 1.0));
    float aa = max(fwidth(rr), 1e-4);
    float d = 1.0 - smoothstep(rad - aa, rad + aa, rr);
    float px = max(fwidth(vP.x), fwidth(vP.y));
    float mean = clamp(3.14159 * rad * rad / (P * P), 0.0, 1.0);
    return mix(d, mean, smoothstep(0.22 * P, 0.5 * P, px));
  }
  void main() {
    if (uAmount < 0.003) discard;
    // beyond the band's inner border (< 0: inside the band; the top band is wider: aBand); the mirror's patch at the top centre
    float g = vG;
    float ip = min(uPatch.x - abs(vP.x), vP.y - uPatch.y);
    g = min(g, -ip);
    float aa = max(fwidth(g), 1e-3);
    float solidC = 1.0 - smoothstep(-aa, aa, g);
    float dots = (g > 0.0 && g < uBand.z) ? halftone(g, 0.95) : 0.0;
    // the windows of the camera and of the rain sensor, cut in the patch
    vec2 cw = abs(vP - uPatch.zw) - vec2(3.4, 2.3);
    float camW = 1.0 - smoothstep(-0.15, 0.15, max(cw.x, cw.y));
    float rain = 1.0 - smoothstep(1.9, 2.2, length(vP - uPatch.zw - vec2(8.5, 0.0)));
    // the print sweeps up the pane (the squeegee): the band first, then its dots
    float rb = 1.0 - smoothstep(uFrontB - 1.5, uFrontB + 1.5, vP.y);
    float rd = 1.0 - smoothstep(uFrontD - 1.5, uFrontD + 1.5, vP.y);
    float cov = max(solidC * rb, dots * rd) * (1.0 - max(camW, rain));
    if (cov < 0.01) discard;
    // fired enamel: black, a faint sheen of the studio on it
    vec3 v = normalize(cameraPosition - vW); vec3 n = normalize(vN); float c = abs(dot(n, v));
    if (dot(n, v) < 0.0) n = -n;
    float F = 0.04 + 0.96 * pow(clamp(1.0 - c, 0.0, 1.0), 5.0);
    vec3 col = vec3(0.006, 0.007, 0.008) + envSpec(reflect(-v, n)) * F * 0.5 + uInk * 0.12 * uLit;
    gl_FragColor = vec4(col * cov * uAmount, cov * uAmount);
  }
`;
function bandMaterial(shared) {
  const m = new THREE.ShaderMaterial({
    uniforms: {
      ...ENV_UNIFORMS,
      uBend: shared.uBend, uAmount: shared.uAmount,
      uSurf: { value: new THREE.Vector4(WS.w, WS.h, WS.sag, WS.sagV) },
      uTrap: { value: new THREE.Vector4(WS.w, WS.wTop, WS.h, CORNER) },
      uBand: { value: new THREE.Vector3(WS.band, WS.bandTop, WS.dots) },
      // the mirror's patch: half-width, its lower border; the camera window's centre
      uPatch: { value: new THREE.Vector4(17, WS.h / 2 - 27, WS.sensor[0] - 4, WS.sensor[1] - 2) },
      uInk: { value: INK },
      uFrontB: { value: 999 }, uFrontD: { value: 999 }, uLit: { value: 0 },
    },
    vertexShader: BAND_VS, fragmentShader: BAND_FS, side: THREE.DoubleSide, depthWrite: true, fog: false,
  });
  return premult(m);
}

/* ── a printed mark (the stamp, the silver lines): a mask lit in ink ── */
const MARK_VS = /* glsl */ `
  uniform float uBend; uniform vec4 uSurf;
  varying vec2 vUv; varying vec2 vP;
  ${GLSL_BEND}
  void main() {
    vec3 p = bendP(position, uSurf, uBend);
    vUv = uv; vP = p.xy;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
  }
`;
const STAMP_FS = /* glsl */ `
  uniform sampler2D uMap; uniform vec3 uInk; uniform float uAmount, uShow, uLit;
  varying vec2 vUv;
  void main() {
    float m = texture2D(uMap, vec2(1.0 - vUv.x, vUv.y)).a * uShow; // printed to read from OUTSIDE (−z)
    if (m < 0.01 || uAmount < 0.003) discard;
    vec3 col = uInk * (0.62 + 0.9 * uLit);
    gl_FragColor = vec4(col * m * uAmount, m * uAmount);
  }
`;
function stampMaterial(tex, shared, surf) {
  const m = new THREE.ShaderMaterial({
    uniforms: { uBend: shared.uBend, uAmount: shared.uAmount, uSurf: { value: new THREE.Vector4(...surf) }, uMap: { value: tex }, uInk: { value: INK }, uShow: { value: 1 }, uLit: { value: 0 } },
    vertexShader: MARK_VS, fragmentShader: STAMP_FS, side: THREE.DoubleSide, depthWrite: false, fog: false,
  });
  return premult(m);
}

/** The stamp: the E in its circle and the country (2 = France), "43R", a number, the roman numeral of the glazing. */
function stampTexture(numeral, number) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  const draw = () => {
    const g = c.getContext("2d");
    g.clearRect(0, 0, 512, 512);
    g.fillStyle = "#fff";
    g.strokeStyle = "#fff";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.lineWidth = 16;
    g.beginPath();
    g.arc(138, 128, 106, 0, TAU);
    g.stroke();
    g.font = "800 112px 'JetBrains Mono', monospace";
    g.fillText("E2", 138, 134);
    g.font = "800 230px 'Barlow Condensed', sans-serif";
    g.fillText(numeral, 390, 140);
    g.font = "800 118px 'JetBrains Mono', monospace";
    g.fillText("43R", 256, 312);
    g.font = "700 84px 'JetBrains Mono', monospace";
    g.fillText(number, 256, 440);
    tex.needsUpdate = true;
  };
  draw();
  return { tex, draw };
}

/* ── the melt: a paste of light that never stops flowing ── */
const MELT_VS = /* glsl */ `
  uniform float uTime;
  varying vec3 vL; varying float vTop;
  void main() {
    vec3 p = position;
    vTop = step(0.5, normal.y);
    p.y += vTop * 1.3 * sin(p.x * 0.017 - uTime * 0.55) * sin(p.z * 0.026 + uTime * 0.37);
    vL = p;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
  }
`;
const MELT_FS = /* glsl */ `
  uniform float uTime, uAmount, uHalfZ, uLevel, uX0, uX1;
  uniform vec3 uSignal, uInk;
  varying vec3 vL; varying float vTop;
  ${GLSL_NOISE}
  void main() {
    if (uAmount < 0.003) discard;
    // the charging pocket (the doghouse) is narrow
    if (vL.x < uX0 && abs(vL.z) > 70.0) discard;
    vec2 q = vec2(vL.x * 0.0062 - uTime * 0.045, vL.z * 0.0095);
    vec2 warp = vec2(fbm(q * 1.3 + vec2(0.0, uTime * 0.03)), fbm(q * 1.3 + 5.2 - vec2(uTime * 0.021, 0.0)));
    float f = fbm(q * 2.1 + warp * 1.7);
    float wall = smoothstep(0.0, 90.0, uHalfZ - abs(vL.z)) * smoothstep(0.0, 60.0, uX1 - vL.x);
    float f2 = smoothstep(0.25, 0.85, f);
    vec3 col = uSignal * (0.32 + 0.78 * f2) * mix(0.55, 1.1, wall);
    col += vec3(1.0, 0.45, 0.16) * 0.26 * smoothstep(0.66, 0.9, f) * wall;
    // the batch still floating on the melt near the charging end: a darker crust that breaks up downstream
    float crust = (1.0 - smoothstep(-220.0, 420.0, vL.x)) * smoothstep(0.5, 0.66, fbm(q * 3.2 + 2.0 + warp));
    col = mix(col, uSignal * 0.1 + uInk * 0.025, crust * 0.85);
    // the side wall of the pool: darker toward the bottom
    if (vTop < 0.5) col *= mix(0.25, 0.85, clamp((vL.y - (uLevel - 32.0)) / 32.0, 0.0, 1.0));
    gl_FragColor = vec4(min(col, vec3(2.9)) * uAmount, uAmount);
  }
`;

/* ── the silver lines of a rear screen, printed by the squeegee's sweep ── */
const SILVER_FS = /* glsl */ `
  uniform vec3 uInk; uniform float uAmount, uFront, uLines, uH, uW;
  varying vec2 vP;
  void main() {
    if (uAmount < 0.003) discard;
    // the lines across, every (uH / uLines), 0.7 cm thick; the two bus bars at the ends
    float pitch = (uH - 6.0) / (uLines - 1.0);
    float k = (vP.y + (uH - 6.0) * 0.5) / pitch;
    float dl = abs(fract(k + 0.5) - 0.5) * pitch;
    float aa = max(fwidth(dl), 1e-3);
    float line = (1.0 - smoothstep(0.35 - aa, 0.35 + aa, dl)) * step(abs(vP.x), uW * 0.5 - 4.0) * step(-0.5, k) * step(k, uLines - 0.5);
    float bus = step(uW * 0.5 - 6.0, abs(vP.x)) * step(abs(vP.x), uW * 0.5 - 2.5) * step(abs(vP.y), uH * 0.5 - 2.0);
    float m = max(line, bus) * (1.0 - smoothstep(uFront - 1.5, uFront + 1.5, vP.x));
    if (m < 0.01) discard;
    vec3 col = uInk * (0.55 + 0.25 * bus);
    gl_FragColor = vec4(col * m * uAmount, m * uAmount);
  }
`;

/* ───────────────────────────── the pieces ───────────────────────────── */

const CORNER = 8; // the windshield's corner radius
const TG = 0.4; //  one glass, drawn (true 2.1 mm: ×2) — plan.js says 0.55 (see the journal: À changer ailleurs)
const TF = 0.22; // the film, drawn (true 0.76 mm) — plan.js says 0.3
const EXPLODE = 30; //        cm each glass moves away from the film at explode = 1
const LIFT = 30; //           cm the top sheet is lifted at open = 1

/** Builds the windshield's shared geometries (one set for the hero and the queue). */
/**
 * The windshield's outline: a real one — clearly wider at the foot than at the top, the foot almost straight (a slight
 * bow), the top corners very round, the top edge arched a little. Resampled evenly (N points). Returns the outline and
 * `dist(x, y)`, the distance to it (cm, inside > 0). onSurface does NOT depend on it (only on w, h, sag, sagV).
 */
function windshieldOutline(N = 240) {
  const hw = WS.w / 2;
  const hh = WS.h / 2;
  const tw = WS.wTop / 2 - 4; // the top edge's line, before its corners round off
  const corners = [[-hw, -hh, 7], [hw, -hh, 7], [tw, hh, 26], [-tw, hh, 26]];
  const dense = [];
  const n = corners.length;
  for (let i = 0; i < n; i++) {
    const [px, py, r] = corners[i];
    const [ax, ay] = corners[(i + n - 1) % n];
    const [bx, by] = corners[(i + 1) % n];
    let d1x = ax - px, d1y = ay - py;
    let d2x = bx - px, d2y = by - py;
    const l1 = Math.hypot(d1x, d1y), l2 = Math.hypot(d2x, d2y);
    d1x /= l1; d1y /= l1; d2x /= l2; d2y /= l2;
    const th = Math.acos(Math.max(-1, Math.min(1, d1x * d2x + d1y * d2y)));
    const t = r / Math.tan(th / 2);
    const bxs = d1x + d2x, bys = d1y + d2y;
    const bl = Math.hypot(bxs, bys);
    const cx = px + (bxs / bl) * (r / Math.sin(th / 2));
    const cy = py + (bys / bl) * (r / Math.sin(th / 2));
    const a0 = Math.atan2(py + d1y * t - cy, px + d1x * t - cx);
    let a1 = Math.atan2(py + d2y * t - cy, px + d2x * t - cx);
    while (a1 < a0) a1 += TAU;
    if (a1 - a0 > Math.PI) a1 -= TAU;
    for (let k = 0; k <= 16; k++) {
      const a = a0 + ((a1 - a0) * k) / 16;
      dense.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  // the edges' bows: the foot bulges down a little, the top arches up
  for (const p of dense) {
    const ty = p[1] / hh;
    const bow = ty > 0 ? 1.6 * Math.max(0, 1 - (p[0] / tw) ** 2) * ty ** 8 : -1.0 * Math.max(0, 1 - (p[0] / hw) ** 2) * ty ** 8;
    p[1] += bow;
  }
  // resample evenly by arc length
  const acc = [0];
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1], b = dense[i % dense.length];
    acc.push(acc[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const L = acc[acc.length - 1];
  const outline = [];
  let j = 0;
  for (let i = 0; i < N; i++) {
    const s = (i / N) * L;
    while (acc[j + 1] < s) j++;
    const a = dense[j], b = dense[(j + 1) % dense.length];
    const k = (s - acc[j]) / Math.max(1e-6, acc[j + 1] - acc[j]);
    outline.push(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k);
  }
  // keep the order counter-clockwise, starting anywhere: faceInto does not care
  const dist = (x, y) => {
    let m = Infinity;
    for (let i = 0; i < N; i++) {
      const ax = outline[2 * i], ay = outline[2 * i + 1];
      const bx = outline[2 * ((i + 1) % N)], by = outline[2 * ((i + 1) % N) + 1];
      const ex = bx - ax, ey = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey)));
      const d = Math.hypot(x - ax - ex * t, y - ay - ey * t);
      if (d < m) m = d;
    }
    return m;
  };
  return { outline, dist };
}

function windshieldGeometries() {
  const { outline, dist: sdf } = windshieldOutline();
  // the band's width: WS.band along the sides and the foot, WS.bandTop along the top
  const bandOf = (x, y) => sdf(x, y) - (WS.band + (WS.bandTop - WS.band) * smooth(WS.h / 2 - 26, WS.h / 2 - 9, y));
  const HEAT = 42; // the heat's gradient: from the edge (cool) to 42 cm in (the core)
  const outer = slabGeometry(outline, sdf, -(TF / 2 + TG), -TF / 2, HEAT, 24, 2);
  const inner = slabGeometry(outline, sdf, TF / 2, TF / 2 + TG, HEAT, 24, 2);
  const film = slabGeometry(outline, sdf, -TF / 2 + 0.01, TF / 2 - 0.01, HEAT, 24, 2);
  const band = faceGeometry(outline, sdf, -(TF / 2 + TG * 0.5), 24, 2, bandOf);
  // the stamp: a small grid on the band's plane, a hair toward the outside
  const stamp = new THREE.PlaneGeometry(7.2, 7.2, 6, 6).translate(WS.stamp[0], WS.stamp[1], -(TF / 2 + TG * 0.5) - 0.12);
  // the trim: the blank's rectangle around the windshield's outline (two glasses thick)
  const tb = newBuf();
  const N = outline.length / 2;
  const RX = WS.w / 2 + 14;
  const RY = WS.h / 2 + 12;
  const rect = [];
  for (let i = 0; i < N; i++) {
    const x = outline[2 * i];
    const y = outline[2 * i + 1];
    const s = Math.min(RX / Math.max(Math.abs(x), 1e-6), RY / Math.max(Math.abs(y), 1e-6));
    rect.push(x * s, y * s);
  }
  const z0 = -(TF / 2 + TG);
  const z1 = TF / 2 + TG;
  for (const [z, nz] of [[z0, -1], [z1, 1]]) {
    const s0 = tb.pos.length / 3;
    for (let i = 0; i < N; i++) {
      vert(tb, outline[2 * i], outline[2 * i + 1], z, 0, 0, nz, { edge: 1 });
      vert(tb, rect[2 * i], rect[2 * i + 1], z, 0, 0, nz, { edge: 1 });
    }
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      tb.idx.push(s0 + 2 * i, s0 + 2 * i + 1, s0 + 2 * j + 1, s0 + 2 * i, s0 + 2 * j + 1, s0 + 2 * j);
    }
  }
  rimInto(tb, rect, z0, z1);
  const trim = toGeometry(tb);
  // the scoring line: a strip along the outline on the top face, its arc length in aHeat (0 → 1)
  const sb = newBuf();
  let L = 0;
  const acc = [0];
  for (let i = 1; i <= N; i++) {
    const j = i % N;
    L += Math.hypot(outline[2 * j] - outline[2 * i - 2], outline[2 * j + 1] - outline[2 * i - 1]);
    acc.push(L);
  }
  for (let i = 0; i <= N; i++) {
    const j = i % N;
    const x = outline[2 * j];
    const y = outline[2 * j + 1];
    const l = Math.hypot(x, y) || 1;
    vert(sb, x - (x / l) * 0.6, y - (y / l) * 0.6, z1 + 0.04, 0, 0, 1, { heat: acc[i] / L });
    vert(sb, x + (x / l) * 0.2, y + (y / l) * 0.2, z1 + 0.04, 0, 0, 1, { heat: acc[i] / L });
  }
  for (let i = 0; i < N; i++) sb.idx.push(2 * i, 2 * i + 1, 2 * i + 3, 2 * i, 2 * i + 3, 2 * i + 2);
  const score = toGeometry(sb);
  return { sdf, outline, outer, inner, film, band, stamp, trim, score };
}

const SCORE_FS = /* glsl */ `
  uniform vec3 uInk; uniform float uAmount, uDraw;
  varying float vS;
  void main() {
    float m = 1.0 - smoothstep(uDraw - 0.004, uDraw, vS);
    if (m < 0.01 || uAmount < 0.003) discard;
    // the cutting wheel's head: the last centimetres glow brighter
    float head = smoothstep(uDraw - 0.03, uDraw, vS) * step(uDraw, 0.999);
    gl_FragColor = vec4(uInk * (1.3 + 1.2 * head) * m * uAmount, m * uAmount);
  }
`;
const SCORE_VS = /* glsl */ `
  attribute float aHeat; varying float vS;
  void main() { vS = aHeat; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }
`;

/** The sensors' block: the housing, the camera's lens looking out, the rain sensor's pad, the mirror's foot. */
function sensorGeometries() {
  const housing = box(17, 11, 4.2, 0.9);
  const lens = new THREE.CylinderGeometry(1.5, 1.8, 1.0, 32).rotateX(Math.PI / 2).translate(-4, -2, -2.3);
  const pad = new THREE.CylinderGeometry(2.1, 2.1, 0.8, 32).rotateX(Math.PI / 2).translate(4.5, -2, -2.3);
  const foot = new THREE.CylinderGeometry(1.4, 1.8, 6, 24).translate(0, -8, 1.2);
  return { housing, lens, pad, foot };
}

/**
 * ONE windshield: meshes on the shared geometries and materials (the hero and each pane of the queue).
 * `set` lays its layers out: explode, lift, film slide, print, sensors, cut.
 */
function makeWindshield(G, M, SG) {
  const root = new THREE.Group();
  const outerG = new THREE.Group();
  const filmG = new THREE.Group();
  const innerG = new THREE.Group();
  root.add(outerG, filmG, innerG);
  const mk = (geo, mat, order) => {
    const m = new THREE.Mesh(geo, mat);
    m.renderOrder = order;
    m.frustumCulled = false;
    return m;
  };
  const band = mk(G.band, M.band, 1);
  const stamp = mk(G.stamp, M.stamp, 2);
  const outer = mk(G.outer, M.outer, 4);
  outerG.add(band, stamp, outer);
  const film = mk(G.film, M.film, 3);
  filmG.add(film);
  const inner = mk(G.inner, M.inner, 4);
  innerG.add(inner);
  const sensors = new THREE.Group();
  const housing = new THREE.Mesh(SG.housing, M.sensorBody);
  housing.add(edgesOf(SG.housing, { color: BRAND.ink, width: 1.8, opacity: 0.55 }));
  sensors.add(housing, new THREE.Mesh(SG.lens, M.lens), new THREE.Mesh(SG.pad, M.sensorBody), new THREE.Mesh(SG.foot, M.sensorBody));
  innerG.add(sensors);
  const trim = mk(G.trim, M.trim, 4);
  const score = mk(G.score, M.score, 5);
  root.add(trim, score);

  const P = new THREE.Vector3();
  const N = new THREE.Vector3();
  const Z = new THREE.Vector3(0, 0, 1);
  const surf = surfaceOf(WS.w, WS.h, WS.sag, WS.sagV);
  return {
    root, outerG, filmG, innerG, sensors, film, band, stamp, trim, score,
    set({ explode, open, film: f, print, sensors: s, cut, bend, onLine }) {
      outerG.position.z = -explode * EXPLODE;
      innerG.position.z = explode * EXPLODE + open * LIFT;
      film.visible = f > 0.005;
      filmG.position.set((1 - f) * (WS.w + 30), 0, 0); // it slides in from the +x side (on the line: from +z)
      band.visible = print > 0.003;
      stamp.visible = print > 0.8;
      sensors.visible = s > 0.005;
      if (sensors.visible) {
        surf(WS.sensor[0], WS.sensor[1], P, N, bend);
        const off = TF / 2 + TG + 2.15 + (1 - s) * 26; // the housing's back on the inner face; it comes down onto it
        sensors.position.copy(P).addScaledVector(N, off);
        sensors.quaternion.setFromUnitVectors(Z, N);
      }
      const trimOn = onLine && cut > 0.02 && cut < 0.75;
      trim.visible = trimOn;
      if (trimOn) {
        const k = smooth(0.4, 0.75, cut);
        trim.scale.setScalar(1 + 0.07 * k);
        trim.position.z = -2.5 * k;
      }
      score.visible = onLine && cut > 0.02 && cut < 0.82;
    },
  };
}

/** A flat (or slightly curved) pane: one glass, or laminated (glass · film · glass), its stamp. */
function makePane({ w, wTop = w, h, r, sagV = 0, tg = 0.42, laminated = false, tempered = true, stamp = null, shared, orderBase = 3 }) {
  const sdf = trapSdf(w, wTop, h, r);
  const outline = outlineOf(sdf, w / 2, h / 2, 140);
  const surf = [w, h, 0, sagV];
  const root = new THREE.Group();
  const mats = [];
  const meshes = { single: [], lam: [] };
  const mk = (geo, mat, order, list) => {
    const m = new THREE.Mesh(geo, mat);
    m.renderOrder = order;
    m.frustumCulled = false;
    root.add(m);
    list.push(m);
    return m;
  };
  const gMat = glassMaterial({ surf, shared, rimK: 1.05 });
  mats.push(gMat);
  if (tempered) mk(slabGeometry(outline, sdf, -tg / 2, tg / 2, Math.min(w, h) * 0.5), gMat, orderBase + 1, meshes.single);
  let fMat = null;
  if (laminated) {
    const t = tg * 0.72;
    const tf = 0.18;
    mk(slabGeometry(outline, sdf, -(tf / 2 + t), -tf / 2, Math.min(w, h) * 0.5), gMat, orderBase + 1, meshes.lam);
    mk(slabGeometry(outline, sdf, tf / 2, tf / 2 + t, Math.min(w, h) * 0.5), gMat, orderBase + 1, meshes.lam);
    fMat = glassMaterial({ tint: VEILLE, face: 0.02, body: 0.025, spec: 0.4, rimK: 1.8, surf, shared: { uBend: shared.uBend, uAmount: shared.uAmount } });
    fMat.uniforms.uSelf.value = 0.012;
    mk(slabGeometry(outline, sdf, -tf / 2 + 0.01, tf / 2 - 0.01, Math.min(w, h) * 0.5), fMat, orderBase, meshes.lam);
  }
  const stamps = [];
  if (stamp) {
    for (const s of stamp) {
      const sm = stampMaterial(s.tex, shared, surf);
      const geo = new THREE.PlaneGeometry(s.size, s.size, 4, 4).translate(s.at[0], s.at[1], -(tg / 2) - 0.08);
      const m = new THREE.Mesh(geo, sm);
      m.renderOrder = orderBase + 2;
      m.frustumCulled = false;
      root.add(m);
      stamps.push({ mesh: m, mat: sm });
    }
  }
  return { root, gMat, fMat, meshes, stamps, onSurface: surfaceOf(w, h, 0, sagV), sdf, outline };
}

/* ───────────────────────────── the line's glass ───────────────────────────── */

/** The ribbon's temperature along the line (°C): 1 100 entering the tin, 600 leaving it, the air of the room at the cut. */
function ribbonTemp(x) {
  if (x <= ST.bath.x0) return 1100;
  if (x <= ST.bath.x1) return THREE.MathUtils.lerp(1100, 600, (x - ST.bath.x0) / (ST.bath.x1 - ST.bath.x0));
  if (x <= ST.lehr.x0) return 600;
  if (x <= ST.lehr.x1) return THREE.MathUtils.lerp(600, 60, Math.pow((x - ST.lehr.x0) / (ST.lehr.x1 - ST.lehr.x0), 0.7));
  return 40;
}
/** Temperature → `glow` (world.js · FIRST: 450 °C ≈ 0.1, 600 ≈ 0.5, ≥ 700 = 1). */
function glowOf(t) {
  if (t >= 700) return 1;
  if (t >= 600) return 0.5 + 0.5 * ((t - 600) / 100);
  if (t >= 450) return 0.1 + 0.4 * ((t - 450) / 150);
  return 0.1 * clamp01((t - 250) / 200);
}
const R_X0 = ST.furnace.x1 - 30;
const R_X1 = ST.cut.at;
/** Half-width of the ribbon (cm): a narrow tongue at the throat, spreading on the tin, held to 3.6 m by the edge rolls. */
function ribbonHalf(x) {
  const spread = smooth(R_X0, ST.bath.x0 + 300, x);
  const held = smooth(ST.bath.x0 + 300, ST.bath.x0 + 780, x);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(55, 212, spread), 180, held);
}
/** Its thickness (drawn): a thick tongue that thins as it spreads; the edge rolls then draw it to its gauge. */
function ribbonThick(x) {
  const a = THREE.MathUtils.lerp(7, 1.9, smooth(R_X0, ST.bath.x0 + 300, x));
  return THREE.MathUtils.lerp(a, 1.15, smooth(ST.bath.x0 + 380, ST.bath.x0 + 840, x));
}
/** Where `pull` thins it: downstream of the first edge rolls. */
const pullZone = (x) => smooth(ST.bath.x0 + 380, ST.bath.x0 + 840, x);
/** The bottom of the ribbon: over the throat's lip, down onto the tin, lifted onto the rollers of the lehr. */
function ribbonBottom(x) {
  if (x < ST.bath.x0) return ST.bath.y + (ST.furnace.throat[1] + 0.5 - ST.bath.y) * (1 - smooth(R_X0, ST.bath.x0, x));
  return THREE.MathUtils.lerp(ST.bath.y, LINE.y + 0.05, smooth(ST.lift.x0, ST.lift.x1, x));
}
/** The edge rolls: pairs along the bath, gripping both edges. */
const ROLLS = [1420, 1560, 1700, 1840, 1980, 2120];
const ROLL_R = 12;
const TEETH = 7;

function ribbonGeometry() {
  const xs = [];
  for (let x = R_X0; x < 1500; x += 8) xs.push(x);
  for (let x = 1500; x < 2900; x += 22) xs.push(x);
  for (let x = 2900; x < R_X1; x += 50) xs.push(x);
  xs.push(R_X1);
  const SH = 7; //   vertices on each shoulder (the rounded edge)
  const FL = 30; //  across the flat top
  const b = newBuf();
  const cols = 2 * SH + FL + 1;
  const rows = xs.length;
  for (const x of xs) {
    const hw = ribbonHalf(x);
    const T = ribbonThick(x);
    const yb = ribbonBottom(x);
    const heat = glowOf(ribbonTemp(x));
    const rough = 1 - smooth(R_X0 + 30, ST.bath.x0 + 650, x);
    const pz = pullZone(x);
    for (let j = 0; j < cols; j++) {
      let z, y, ny, nz, rim = 0, flat = 0;
      if (j < SH) {
        const phi = (j / SH) * (Math.PI / 2); // 0 at the bottom of the bead → π/2 at its top
        z = -(hw - T + T * Math.cos(phi));
        y = yb + T * Math.sin(phi);
        ny = Math.sin(phi);
        nz = -Math.cos(phi);
        rim = j < SH * 0.6 ? 1 : 0;
      } else if (j <= SH + FL) {
        const s = (j - SH) / FL;
        z = THREE.MathUtils.lerp(-(hw - T), hw - T, s);
        y = yb + T;
        ny = 1;
        nz = 0;
        flat = 1;
      } else {
        const phi = ((cols - 1 - j) / SH) * (Math.PI / 2);
        z = hw - T + T * Math.cos(phi);
        y = yb + T * Math.sin(phi);
        ny = Math.sin(phi);
        nz = Math.cos(phi);
        rim = cols - 1 - j < SH * 0.6 ? 1 : 0;
      }
      const edge = clamp01((hw - Math.abs(z)) / 45);
      vert(b, x, y, z, 0, ny, nz, { edge, heat, rim, thin: 0.58 * pz * (y - yb), rough: rough * flat * smooth(0, 0.25, edge) });
    }
  }
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j;
      const c = (i + 1) * cols + j;
      b.idx.push(a, c, c + 1, a, c + 1, a + 1);
    }
  }
  // the cut end: the tranche across the whole ribbon
  const e0 = b.pos.length / 3;
  const last = (rows - 1) * cols;
  const ybE = ribbonBottom(R_X1);
  for (let j = 0; j < cols; j++) {
    const k = (last + j) * 3;
    vert(b, b.pos[k], b.pos[k + 1], b.pos[k + 2], 1, 0, 0, { edge: 0, heat: glowOf(ribbonTemp(R_X1)), rim: 1, thin: b.aThin[last + j] });
    vert(b, b.pos[k], ybE, b.pos[k + 2], 1, 0, 0, { edge: 0, heat: glowOf(ribbonTemp(R_X1)), rim: 1, thin: 0 });
  }
  for (let j = 0; j < cols - 1; j++) b.idx.push(e0 + 2 * j, e0 + 2 * j + 1, e0 + 2 * j + 3, e0 + 2 * j, e0 + 2 * j + 3, e0 + 2 * j + 2);
  return toGeometry(b);
}

/** An edge roll: a knurled wheel of glass on its shaft, seen like an X-ray. */
function rollGeometry() {
  const shape = new THREE.Shape();
  const n = TEETH * 2;
  for (let i = 0; i <= n * 6; i++) {
    const a = (i / (n * 6)) * TAU;
    const tooth = 0.5 + 0.5 * Math.cos(a * TEETH);
    const r = ROLL_R - 2.2 + 2.2 * Math.pow(tooth, 0.6);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, 2.6, 0, TAU, true);
  shape.holes.push(hole);
  const wheel = new THREE.ExtrudeGeometry(shape, { depth: 4, bevelEnabled: false, curveSegments: 4 }).translate(0, 0, -2);
  return wheel;
}

/* ───────────────────────────── build ───────────────────────────── */

export function buildGlass() {
  const surf = surfaceOf(WS.w, WS.h, WS.sag, WS.sagV);
  const R = rng(4301);

  /* ── the hero windshield (and the queue: same geometries, same materials, same state) ── */
  const U = { uBend: { value: 1 }, uAmount: { value: 1 }, uGlow: { value: 0 } };
  const stampHero = stampTexture("II", "00 4127");
  const M = {
    outer: glassMaterial({ shared: U, spec: 1.2, specSide: -1 }),
    inner: glassMaterial({ shared: U, spec: 1.2, specSide: 1 }),
    film: glassMaterial({ tint: VEILLE, face: 0.014, body: 0.02, spec: 0.4, rimK: 1.8, shared: { uBend: U.uBend, uAmount: U.uAmount } }),
    band: bandMaterial(U),
    stamp: stampMaterial(stampHero.tex, U, [WS.w, WS.h, WS.sag, WS.sagV]),
    trim: glassMaterial({ shared: { uBend: { value: 0 }, uAmount: { value: 1 } } }),
    score: premult(new THREE.ShaderMaterial({ uniforms: { uInk: { value: INK }, uAmount: { value: 1 }, uDraw: { value: 0 } }, vertexShader: SCORE_VS, fragmentShader: SCORE_FS, side: THREE.DoubleSide, depthWrite: false, fog: false })),
    sensorBody: solid(0x15181a, { rough: 0.55, metal: 0.2, coat: 0.4 }),
    lens: solid(0x050607, { rough: 0.08, coat: 1, env: 2.5 }),
  };
  M.film.uniforms.uSelf.value = 0.008;
  const G = windshieldGeometries();
  const SG = sensorGeometries();
  const hero = makeWindshield(G, M, SG);
  const root = hero.root;
  // the light of a hot glass: it lights what is around it (the mould, the rollers, the bench)
  const heroLight = new THREE.PointLight(SIGNAL, 0, 520, 1);
  heroLight.position.set(0, 0, -34); // under the sheet on the line (pane −z = down): it lights the mould and the cart
  root.add(heroLight);
  const heroHalo = makeHalo(WS.w, WS.h, [WS.w, WS.h, WS.sag, WS.sagV], U.uBend, -(TF / 2 + TG) - 1.2);
  root.add(heroHalo);
  const A = { stamp: hero.stamp, sensor: hero.sensors, center: new THREE.Object3D() };
  root.add(A.center);

  /* ── the line ── */
  const line = new THREE.Group();

  // the batch: five heaps — sand, soda, limestone, dolomite, cullet (shards of glass that glint)
  const heapGeo = (() => {
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const r = 35 * (1 - t);
      const y = 26 * (1 - Math.pow(1 - t, 1.25)) + 3 * Math.sin(t * Math.PI) * 0.4;
      pts.push(new THREE.Vector2(Math.max(r, 0.01), y));
    }
    const g = new THREE.LatheGeometry(pts, 40);
    const p = g.attributes.position;
    const rr = rng(77);
    const bumps = Array.from({ length: 9 }, () => [rr() * TAU, 2 + Math.floor(rr() * 5), rr()]);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const y = p.getY(i);
      const a = Math.atan2(z, x);
      let k = 0;
      for (const [ph, f, w] of bumps) k += Math.sin(a * f + ph + y * 0.15 * w) * 0.022;
      const s = 1 + k * Math.min(1, y / 4 + 0.2);
      p.setXYZ(i, x * s, y * (1 + k * 0.6), z * s);
    }
    g.computeVertexNormals();
    return g;
  })();
  const heapColors = [0.5, 0.68, 0.42, 0.32, 0.22];
  const heaps = ST.batch.heaps.map((x, i) => {
    const mat = solid(INK.clone().multiplyScalar(heapColors[i]), { rough: 0.95, double: true });
    mat.flatShading = true;
    const m = new THREE.Mesh(heapGeo, mat);
    m.position.set(x, ST.batch.y, 0);
    m.castShadow = true;
    m.receiveShadow = true;
    line.add(m);
    return m;
  });
  // the cullet: shards on the last heap
  const shardGeo = new THREE.TetrahedronGeometry(2.6, 0);
  const shardMat = solid(INK.clone().multiplyScalar(0.85), { rough: 0.06, coat: 1, env: 3 });
  const shards = new THREE.InstancedMesh(shardGeo, shardMat, 150);
  {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const s = new THREE.Vector3();
    const v = new THREE.Vector3();
    for (let i = 0; i < 150; i++) {
      const a = R() * TAU;
      const t = Math.sqrt(R());
      const rad = 33 * t;
      const y = 26 * (1 - Math.pow(t, 1.25)) * 0.97;
      v.set(Math.cos(a) * rad, y, Math.sin(a) * rad);
      e.set(R() * TAU, R() * TAU, R() * TAU);
      q.setFromEuler(e);
      s.set(0.6 + R() * 0.9, 0.3 + R() * 0.4, 0.6 + R() * 0.9);
      m.compose(v, q, s);
      shards.setMatrixAt(i, m);
    }
  }
  heaps[4].add(shards);
  // the stream of batch falling from the hopper's mouth into the melt
  const STREAM = 170;
  const grainGeo = new THREE.BoxGeometry(2.4, 7, 2.4);
  const grains = new THREE.InstancedMesh(grainGeo, solid(INK.clone().multiplyScalar(0.62), { rough: 0.9 }), STREAM);
  grains.frustumCulled = false;
  const grainSeed = Array.from({ length: STREAM }, () => [R(), R() * 2 - 1, R() * 2 - 1, 0.7 + R() * 0.6]);
  line.add(grains);

  // the melt in the furnace (and its charging pocket under the hopper)
  const MX0 = ST.hopper.at[0] - 18;
  const MX1 = ST.furnace.x1 - 12;
  const MZ = ST.furnace.half * 0.86;
  const meltMat = premult(new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAmount: { value: 1 }, uHalfZ: { value: MZ }, uLevel: { value: ST.furnace.melt }, uX0: { value: ST.furnace.x0 + 12 }, uX1: { value: MX1 }, uSignal: { value: SIGNAL }, uInk: { value: INK } },
    vertexShader: MELT_VS, fragmentShader: MELT_FS, side: THREE.DoubleSide, depthWrite: true, fog: false,
  }));
  const meltTop = new THREE.Mesh(new THREE.PlaneGeometry(MX1 - MX0, 2 * MZ, 90, 24).rotateX(-Math.PI / 2).translate((MX0 + MX1) / 2, ST.furnace.melt, 0), meltMat);
  const meltSide = new THREE.Mesh(new THREE.PlaneGeometry(MX1 - (ST.furnace.x0 + 12), 32, 40, 2).translate((MX1 + ST.furnace.x0 + 12) / 2, ST.furnace.melt - 16, MZ), meltMat);
  meltTop.frustumCulled = meltSide.frustumCulled = false;
  line.add(meltTop, meltSide);

  // the ribbon
  const ribbonU = { uBend: { value: 0 }, uAmount: { value: 1 }, uFlow: { value: 0 }, uPull: { value: 0 }, uGlow: { value: 1 } };
  const ribbonMat = glassMaterial({ ribbon: true, body: 0.07, face: 0.035, spec: 1.2, shared: ribbonU, rimK: 1.2 });
  const ribbon = new THREE.Mesh(ribbonGeometry(), ribbonMat);
  ribbon.renderOrder = 4;
  ribbon.frustumCulled = false;
  line.add(ribbon);
  // the light of the melt and of the hot ribbon
  const meltLight = new THREE.PointLight(SIGNAL, 0, 2600, 1);
  meltLight.position.set(700, 260, 0);
  const throatLight = new THREE.PointLight(SIGNAL, 0, 1400, 1);
  throatLight.position.set(ST.bath.x0 + 250, 150, 0);
  line.add(meltLight, throatLight);

  // the edge rolls (X-ray: glass shells and fine edges)
  const wheelGeo = rollGeometry();
  const rollMat = glass(BRAND.ink, { base: 0.01, rim: 0.3, power: 2.4, edge: 0.55, spec: 0.4, through: 0.25 });
  const shaftGeo = new THREE.CylinderGeometry(2.2, 2.2, 1, 16, 1, true);
  const rolls = [];
  for (const x of ROLLS) {
    for (const side of [-1, 1]) {
      const g = new THREE.Group();
      const spin = new THREE.Group();
      const wheel = new THREE.Mesh(wheelGeo, rollMat);
      wheel.add(edgesOf(wheelGeo, { color: BRAND.ink, width: 1.8, opacity: 0.75, threshold: 40 }));
      spin.add(wheel);
      g.add(spin);
      const shaft = new THREE.Mesh(shaftGeo, rollMat);
      shaft.rotation.x = Math.PI / 2;
      g.add(shaft);
      asShell([wheel, shaft], 20);
      line.add(g);
      rolls.push({ x, side, g, spin, shaft });
    }
  }

  // the cut end (casse.js's "plainLine"): a pane frame lying flat (x → +z, y → +x, z → +y)
  const cutEnd = new THREE.Object3D();
  cutEnd.position.set(ST.cut.at + 120, LINE.y + 1, 0);
  cutEnd.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)));
  line.add(cutEnd);

  // the queue: other windshields ahead and behind, lying like the hero
  const flatQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)));
  const queue = [-1, 1, 2].map((k) => {
    const w = makeWindshield(G, M, SG);
    w.root.quaternion.copy(flatQ);
    w.k = k;
    line.add(w.root);
    return w;
  });

  // the bending mould on its cart: a ring at the bent windshield's outline, under it; the cart seen like an X-ray
  const mould = new THREE.Group();
  mould.quaternion.copy(flatQ);
  {
    const pts = [];
    const v = new THREE.Vector3();
    const o = G.outline;
    const n = o.length / 2;
    for (let i = 0; i < n; i += 2) {
      // (the outline is evenly resampled: every other point is enough for the tube)
      const x = o[2 * i];
      const y = o[2 * i + 1];
      const l = Math.hypot(x, y);
      const k = (l - 3) / l;
      surf(x * k, y * k, v, null, 1);
      pts.push(new THREE.Vector3(v.x, v.y, v.z - (TF / 2 + TG) - 1.3));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal");
    const ringGeo = new THREE.TubeGeometry(curve, 300, 1.25, 6, true);
    const ringMat = solid(0x2a2f33, { rough: 0.42, metal: 0.45 });
    ringMat.emissive = new THREE.Color(SIGNAL);
    ringMat.emissiveIntensity = 0;
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.castShadow = true;
    mould.add(ring);
    const ringLine = fatLine(curve.getPoints(300).map((p) => [p.x, p.y, p.z - 1.3]), { color: BRAND.ink, width: 2, opacity: 0.8 });
    mould.add(ringLine);
    // the cart: four posts from the ring's corners down to a frame, four wheels (in the pane frame: down = −z)
    const parts = [];
    const wheels = [];
    const corners = [[-62, -36], [62, -36], [-52, 36], [52, 36]];
    for (const [x, y] of corners) {
      surf(x, y, v, null, 1);
      const top = v.z - 3;
      const bot = -78;
      parts.push(box(4, 4, top - bot, 0.4).translate(x, y, (top + bot) / 2));
      wheels.push([x, y]);
    }
    parts.push(box(150, 6, 6, 0.6).translate(0, -36, -78), box(130, 6, 6, 0.6).translate(0, 36, -78));
    parts.push(box(6, 78, 6, 0.6).translate(-62, 0, -78), box(6, 78, 6, 0.6).translate(62, 0, -78));
    const cartGeo = mergeGeometries(parts);
    const cartMat = glass(new THREE.Color(BRAND.ink), { base: 0.008, rim: 0.26, power: 2.4, edge: 0.5, spec: 0.3, through: 0.2 });
    const cart = new THREE.Mesh(cartGeo, cartMat);
    cart.add(edgesOf(cartGeo, { color: BRAND.ink, width: 1.8, opacity: 0.7 }));
    const wheelGeo2 = new THREE.CylinderGeometry(8, 8, 4, 24).rotateZ(Math.PI / 2);
    const shells = [cart];
    for (const [x, y] of wheels) {
      const wm = new THREE.Mesh(wheelGeo2, cartMat);
      wm.position.set(x, y, -88);
      wm.add(edgesOf(wheelGeo2, { color: BRAND.ink, width: 1.8, opacity: 0.6 }));
      mould.add(wm);
      shells.push(wm);
    }
    asShell(shells, 20);
    mould.add(cart);
    mould.userData = { ringMat, ringLine, cartMat, cart };
  }
  line.add(mould);

  // the rear-screen sample under the screen of the print gantry: its silver lines, printed
  const silverG = new THREE.Group();
  silverG.position.set(ST.print.at, LINE.y + 1.2, 135);
  silverG.rotation.x = -Math.PI / 2; // its plane lies flat: pane x → +x, pane y → −z, pane z → up
  const silverU = { uBend: { value: 0 }, uAmount: { value: 1 } };
  const silverPane = makePane({ w: SILVER.w, h: SILVER.h, r: 4, tg: 0.5, shared: silverU });
  silverG.add(silverPane.root);
  const silverMat = premult(new THREE.ShaderMaterial({
    uniforms: { uBend: silverU.uBend, uSurf: { value: new THREE.Vector4(SILVER.w, SILVER.h, 0, 0) }, uInk: { value: INK }, uAmount: { value: 1 }, uFront: { value: -999 }, uLines: { value: SILVER.lines }, uH: { value: SILVER.h }, uW: { value: SILVER.w } },
    vertexShader: MARK_VS, fragmentShader: SILVER_FS, side: THREE.DoubleSide, depthWrite: false, fog: false,
  }));
  const silverLines = new THREE.Mesh(new THREE.PlaneGeometry(SILVER.w, SILVER.h, 1, 1).translate(0, 0, 0.3), silverMat);
  silverLines.renderOrder = 6;
  silverG.add(silverLines);
  line.add(silverG);

  /* ── the side window: tempered (one glass, « I ») or laminated (glass · film · glass, « II ») ── */
  const sideU = { uBend: { value: 1 }, uAmount: { value: 1 }, uGlow: { value: 0 } };
  const stampI = stampTexture("I", "00 8253");
  const stampII = stampTexture("II", "00 8254");
  const SW = { w: SIDE.w, wTop: SIDE.w - 18, h: SIDE.h, r: 7, sagV: 1.2 };
  const sideStampAt = [SIDE.w / 2 - 12, -SIDE.h / 2 + 8];
  const side = makePane({ ...SW, tg: 0.42, laminated: true, tempered: true, shared: sideU, stamp: [{ tex: stampI.tex, at: sideStampAt, size: 6 }, { tex: stampII.tex, at: sideStampAt, size: 6 }] });
  side.A = { stamp: side.stamps[0].mesh };
  const sideLight = new THREE.PointLight(SIGNAL, 0, 300, 1);
  sideLight.position.set(0, 0, -22);
  side.root.add(sideLight);
  const sideHalo = makeHalo(SW.w, SW.h, [SW.w, SW.h, 0, SW.sagV], sideU.uBend, -1.2);
  side.root.add(sideHalo);

  // the section of the tempered glass (stress): a schematic laid in the pane, our line — the skins squeezed, the core pulling
  const stressG = new THREE.Group();
  stressG.position.z = 1.4;
  side.root.add(stressG);
  const ST_W = 56;
  const ST_H = 20;
  const sm = (color, k) => glow(color, k, { opacity: 0.999, double: true });
  const skinMat = sm(BRAND.ink, 0.32);
  const coreMat = sm(BRAND.signal, 0.55);
  const backMat = sm(BRAND.bg, 1);
  const inkArrow = sm(BRAND.ink, 1.25);
  const sigArrow = sm(BRAND.signal, 1.6);
  const notchMat = sm(BRAND.bg, 1);
  const plane = (w, h, x, y, mat, z = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    m.renderOrder = 8;
    stressG.add(m);
    return m;
  };
  plane(ST_W + 4, ST_H + 4, 0, 0, backMat, -0.05);
  plane(ST_W, 5, 0, 7.5, skinMat);
  plane(ST_W, 5, 0, -7.5, skinMat);
  const coreMesh = plane(ST_W, 10, 0, 0, coreMat);
  const arrowGeo = (len, w = 1.1, head = 3.2) => {
    const s = new THREE.Shape();
    s.moveTo(0, -w / 2);
    s.lineTo(len - head, -w / 2);
    s.lineTo(len - head, -head * 0.6);
    s.lineTo(len, 0);
    s.lineTo(len - head, head * 0.6);
    s.lineTo(len - head, w / 2);
    s.lineTo(0, w / 2);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  };
  const arrows = [];
  const addArrow = (geo, mat, x, y, dir) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, 0.08);
    m.rotation.z = dir > 0 ? 0 : Math.PI;
    m.renderOrder = 9;
    stressG.add(m);
    arrows.push(m);
    return m;
  };
  const inGeo = arrowGeo(15);
  const outGeo = arrowGeo(16, 1.3, 3.6);
  for (const y of [7.5, -7.5]) {
    addArrow(inGeo, inkArrow, -26, y, 1); //  from the left end, pointing in
    addArrow(inGeo, inkArrow, 26, y, -1); //  from the right end, pointing in
  }
  addArrow(outGeo, sigArrow, 3, 0, 1); //    from the centre, pointing out
  addArrow(outGeo, sigArrow, -3, 0, -1);
  const frame = fatLine([[-ST_W / 2, -ST_H / 2, 0.1], [ST_W / 2, -ST_H / 2, 0.1], [ST_W / 2, ST_H / 2, 0.1], [-ST_W / 2, ST_H / 2, 0.1], [-ST_W / 2, -ST_H / 2, 0.1]], { color: BRAND.ink, width: 2.2, opacity: 0.9 });
  frame.renderOrder = 10;
  stressG.add(frame);
  const seams = [fatLine([[-ST_W / 2, 5, 0.1], [ST_W / 2, 5, 0.1]], { color: BRAND.ink, width: 1.8, opacity: 0.5 }), fatLine([[-ST_W / 2, -5, 0.1], [ST_W / 2, -5, 0.1]], { color: BRAND.ink, width: 1.8, opacity: 0.5 })];
  for (const s of seams) {
    s.renderOrder = 10;
    stressG.add(s);
  }
  // the scratch: a notch from the top surface (x = 11: beside the arrows), and the crack it sends into the core
  const notchGeo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0, -1, 0], 3));
  const notch = new THREE.Mesh(notchGeo, notchMat);
  notch.position.set(11, ST_H / 2, 0.12);
  notch.renderOrder = 11;
  stressG.add(notch);
  const notchEdge = fatLine([[-0.5, 0, 0], [0, -1, 0], [0.5, 0, 0]], { color: BRAND.ink, width: 2, opacity: 0.9 });
  notchEdge.renderOrder = 12;
  notch.add(notchEdge);
  const crack = fatLine([[11, 5, 0.14], [12.2, 2.2, 0.14], [10.6, -0.8, 0.14], [13.4, -3.6, 0.14], [12.1, -6.2, 0.14]], { color: BRAND.ink, width: 2.6, hdr: 1.5 });
  crack.renderOrder = 12;
  stressG.add(crack);

  /* ── the sample (30 cm, laminated) and the witness (50 cm, tempered) ── */
  const sampleU = { uBend: { value: 0 }, uAmount: { value: 1 } };
  const sample = makePane({ w: DROP.sample, h: DROP.sample, r: 1.2, tg: 0.4, laminated: true, tempered: false, shared: sampleU });
  const witnessU = { uBend: { value: 0 }, uAmount: { value: 1 } };
  const witness = makePane({ w: PANE.witness, h: PANE.witness, r: 1.5, tg: 0.42, shared: witnessU });

  /* ── per-frame state ── */
  const mat4 = new THREE.Matrix4();
  const qI = new THREE.Quaternion();
  const vS = new THREE.Vector3();
  const vP = new THREE.Vector3();
  let fontsOk = false;
  const heapBase = new THREE.Vector3();

  const st = { explode: 0, open: 0, film: 0, print: 0, sensors: 0, cut: 0, bend: 0, onLine: false };

  return {
    line, cutEnd,
    hero: { root, onSurface: surf, A },
    side: { root: side.root, onSurface: side.onSurface, A: side.A },
    sample: { root: sample.root, onSurface: sample.onSurface },
    witness: { root: witness.root, onSurface: witness.onSurface },
    update(p, time, px) {
      void px;
      if (!fontsOk && typeof document !== "undefined" && document.fonts?.check?.("800 92px 'JetBrains Mono'") && document.fonts.check("800 190px 'Barlow Condensed'")) {
        fontsOk = true;
        stampHero.draw();
        stampI.draw();
        stampII.draw();
      }
      const onLine = p.place === SET_LINE;
      const bend = clamp01(p.bend);
      const g = clamp01(p.glow);

      /* the hero */
      U.uBend.value = bend;
      U.uAmount.value = clamp01(p.hero);
      U.uGlow.value = g;
      root.visible = p.hero > 0.003 && (!onLine || p.cut > 0.02);
      st.explode = clamp01(p.explode);
      st.open = clamp01(p.open);
      st.film = clamp01(p.film);
      st.print = clamp01(p.print);
      st.sensors = clamp01(p.sensors);
      st.cut = clamp01(p.cut);
      st.bend = bend;
      st.onLine = onLine;
      hero.set(st);
      const lg = clamp01(p.litGlass);
      M.outer.uniforms.uLit.value = M.inner.uniforms.uLit.value = lg;
      M.film.uniforms.uLit.value = clamp01(p.litFilm);
      M.film.uniforms.uSelf.value = 0.008 + 0.085 * st.explode;
      M.film.uniforms.uMilk.value = clamp01(p.milk);
      M.band.uniforms.uLit.value = clamp01(p.litBand);
      M.stamp.uniforms.uLit.value = clamp01(p.litStamp);
      M.stamp.uniforms.uShow.value = smooth(0.8, 1, st.print);
      // the print: the squeegee sweeps up the pane (pane y, the line's +x): the band, then the dots
      const sweep = (k) => -WS.h / 2 - 14 + (WS.h + 28) * k;
      M.band.uniforms.uFrontB.value = st.print >= 1 ? 999 : sweep(remap(st.print, 0, 0.45));
      M.band.uniforms.uFrontD.value = st.print >= 1 ? 999 : sweep(remap(st.print, 0.45, 0.8));
      // the cut: the score runs round the outline, the trim breaks away and goes, then the edges are ground
      M.score.uniforms.uDraw.value = remap(st.cut, 0.02, 0.4);
      M.score.uniforms.uAmount.value = 1 - smooth(0.6, 0.82, st.cut);
      M.trim.uniforms.uAmount.value = 1 - smooth(0.45, 0.75, st.cut);
      const ground = onLine ? smooth(0.75, 1, st.cut) : 1;
      M.outer.uniforms.uGround.value = M.inner.uniforms.uGround.value = ground;
      heroLight.intensity = 760 * smooth(0.15, 1, g);
      heroHalo.material.uniforms.uK.value = 0.34 * smooth(0.12, 1, g);
      heroHalo.visible = g > 0.01;

      /* the line's glass */
      const showLine = onLine;
      heaps.forEach((h, i) => {
        const grow = smooth(i, i + 0.6, p.batch);
        const gone = smooth(i * 0.11, i * 0.11 + 0.45, p.charge);
        const k = grow * (1 - gone);
        h.visible = showLine && k > 0.01;
        h.scale.set(0.6 + 0.4 * grow, Math.max(0.01, k), 0.6 + 0.4 * grow);
      });
      // the stream: grains falling from the hopper's mouth while the batch goes in
      const flowing = Math.sin(Math.PI * clamp01(p.charge));
      grains.visible = showLine && p.charge > 0.01 && p.charge < 0.99;
      if (grains.visible) {
        const top = ST.hopper.mouth;
        const bot = ST.furnace.melt + 2;
        const n = Math.round(STREAM * clamp01(flowing * 1.4));
        heapBase.set(ST.hopper.at[0], 0, ST.hopper.at[2]);
        for (let i = 0; i < STREAM; i++) {
          const [ph, jx, jz, sz] = grainSeed[i];
          const f = (ph + time * 0.9) % 1;
          const y = top - f * f * (top - bot);
          const spread = 6 + f * 10;
          vP.set(heapBase.x + jx * spread, y, heapBase.z + jz * spread);
          vS.setScalar(i < n ? sz : 0.0001);
          mat4.compose(vP, qI, vS);
          grains.setMatrixAt(i, mat4);
        }
        grains.instanceMatrix.needsUpdate = true;
      }
      meltMat.uniforms.uTime.value = time;
      meltMat.uniforms.uAmount.value = clamp01(p.melt);
      meltTop.visible = meltSide.visible = showLine && p.melt > 0.003;
      meltLight.intensity = 900 * clamp01(p.melt);
      const rib = clamp01(p.ribbon);
      ribbon.visible = showLine && rib > 0.003;
      ribbonU.uAmount.value = rib;
      ribbonU.uFlow.value = p.flow;
      const pull = clamp01(p.pull);
      ribbonU.uPull.value = pull;
      throatLight.intensity = 700 * rib;
      // the edge rolls grip the edges; they turn with the ribbon — faster when it is drawn faster
      // (the extra turn is a sawtooth of exactly one tooth: seamless at pull 1, and it never jumps with `flow`)
      const turn = p.flow / ROLL_R + pull * (TAU / TEETH) * ((time * 2.4) % 1);
      for (const r of rolls) {
        r.g.visible = showLine && rib > 0.003;
        if (!r.g.visible) continue;
        const hw = ribbonHalf(r.x);
        const T = ribbonThick(r.x) * (1 - 0.58 * pull * pullZone(r.x));
        const yTop = ribbonBottom(r.x) + T;
        r.g.position.set(r.x, yTop + ROLL_R - 0.6, r.side * (hw - 5));
        r.spin.rotation.z = -turn;
        const len = ST.bath.half + 120 - (hw - 5);
        r.shaft.scale.set(1, len, 1);
        r.shaft.position.set(0, 0, r.side * (len / 2 + 2));
      }
      // the queue
      for (const q of queue) {
        q.root.visible = showLine && p.queue > 0.003 && p.cut > 0.02;
        if (!q.root.visible) continue;
        q.root.position.set(p.pos + q.k * 420, LINE.y + 1.5, 0);
        q.set(st);
      }
      // the mould
      const mo = clamp01(p.mould);
      mould.visible = showLine && mo > 0.003;
      if (mould.visible) {
        mould.position.set(p.pos, LINE.y + 1.5 + 14, 0);
        const { ringMat, ringLine, cartMat } = mould.userData;
        ringMat.opacity = mo;
        ringMat.transparent = mo < 0.999;
        ringMat.emissiveIntensity = 0.9 * smooth(0.3, 1, g);
        ringLine.material.opacity = 0.8 * mo;
        cartMat.uniforms.uAmount.value = mo;
        cartMat.uniforms.uColor.value.copy(INK).lerp(SIGNAL, 0.75 * smooth(0.2, 1, g));
      }
      // the silver lines
      const sv = clamp01(p.silver);
      silverG.visible = showLine && sv > 0.003;
      silverMat.uniforms.uFront.value = sv >= 1 ? 999 : -SILVER.w / 2 - 4 + (SILVER.w + 8) * sv;

      /* the side window */
      const lam = p.sideFilm > 0.5;
      side.root.visible = p.side > 0.5;
      const sg = clamp01(p.sideGlow);
      sideU.uGlow.value = sg;
      sideLight.intensity = 420 * smooth(0.15, 1, sg);
      sideHalo.material.uniforms.uK.value = 0.32 * smooth(0.12, 1, sg);
      sideHalo.visible = side.root.visible && sg > 0.01;
      for (const m of side.meshes.single) m.visible = !lam;
      for (const m of side.meshes.lam) m.visible = lam;
      side.stamps[0].mesh.visible = !lam;
      side.stamps[1].mesh.visible = lam;
      side.A.stamp = lam ? side.stamps[1].mesh : side.stamps[0].mesh;
      // its section
      const s = Math.max(0, p.stress);
      const s1 = smooth(0, 1, s);
      const s2 = smooth(1, 2, s);
      const s3 = smooth(2, 3, s);
      stressG.visible = side.root.visible && s1 > 0.003;
      if (stressG.visible) {
        skinMat.opacity = s1;
        coreMat.opacity = s1;
        backMat.opacity = 0.92 * s1;
        notchMat.opacity = s1;
        setGlowK(coreMat, BRAND.signal, 0.55 + 0.75 * s3);
        inkArrow.opacity = s1;
        sigArrow.opacity = s1;
        setGlowK(sigArrow, BRAND.signal, 1.6 + 0.7 * s3);
        frame.material.opacity = 0.9 * s1;
        for (const sm2 of seams) sm2.material.opacity = 0.5 * s1;
        // the skins' arrows press in; the core's arrows pull out (they lengthen a little as the crack opens)
        for (let i = 0; i < 4; i++) arrows[i].scale.set(1, 1, 1);
        arrows[4].scale.x = arrows[5].scale.x = 1 + 0.25 * s3;
        // the scratch: held shut in the skin (2), then running down to the core (3)
        notch.visible = s2 > 0.003;
        notch.scale.set(0.9 + 1.6 * s3, 2.6 * s2 + 3.4 * s3, 1);
        crack.visible = s3 > 0.02;
        crack.material.opacity = s3;
      }
      // the sample and the witness
      sampleU.uAmount.value = clamp01(p.sample);
      sample.root.visible = p.sample > 0.003;
      witnessU.uAmount.value = clamp01(p.witness);
      witness.root.visible = p.witness > 0.003;
    },
  };
}

/** Re-light a glow material made by build3d's `glow` (its colour is hue × k). */
const _c = new THREE.Color();
function setGlowK(mat, hex, k) {
  mat.color.copy(_c.set(hex)).multiplyScalar(k);
}
