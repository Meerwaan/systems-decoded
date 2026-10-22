// DOSSIER 027 — Voie de détresse : THE SYSTEM, solid (docs/027-decors.md, « model.js »).
//
//   buildLane() → { root, wheel, A, parts, update(P, time, px) }
//
//   root    THE ESCAPE LANE in its own frame (plan.js, LANE): origin at the bed's head, on its centre line, at its surface;
//           the bed runs toward −z, +x to its right (the road's axes; world.js tilts it with the descent). Inside: the sign
//           (a C26a with no text), the paved access (the « biseau »), the pit — its kerbs, the ROUND gravel that fills it
//           flush, the ruts and the bow waves the tyres push —, the concrete barrier (GBA), the earth mound; in the scene the
//           lane's platform (col.js leaves this footprint to us); on the bench only: the block of ground under the lane, CUT
//           along the bed's left edge (its face shows the 90 cm of gravel), a ribbon of the road, the comparison (the crushed
//           half filling up from the head, its divider, the twin wheel), the cut-away round the hero wheel.
//   wheel   THE HERO WHEEL (the truck's front-left): tyre, rim, nuts and, inside, the drum brake — the drum, two shoes and
//           their linings, the S-cam and its shaft, the backing plate. Origin at the hub's centre, axle along x, outer face
//           toward −x. `cutaway` takes away the quarter of the tyre, rim and drum that faces up-and-back (12 to 3 o'clock
//           seen from outside): real cut faces, the cam in the middle of the window.
//   update  sixteen times a frame, no allocation (P: docs/027-decors.md, plus `kmh` if world.js hands it: the wheel's
//           speed, which melts the tread and the rim's holes before they strobe).
//
// THE GRAINS. The gravel is a surface drawn by its shader — round pebbles of 1.25 cm (10/14 mm), one to a cell of a fixed
// lattice of the lane, that melt into their mean grey once a pebble is under a few pixels — and, where a camera comes
// close, real pebbles (instances) standing on the SAME lattice cells (one hash, in the shader and here): a window that
// follows the hero tyre (scene and bench), and two macro patches on the bench (round, crushed). A window slides over the
// lattice: a grain belongs to its cell of the lane, not to the window; the tyres push it — carried by the bow wave ahead,
// shoved to the lip once the tyre is over it, rolling as it goes. Everything is a function of the state.
//
// Three greys. Clearest: the round gravel (and the shoes, inside the drum). Middle: the concrete (kerbs, barrier,
// divider), the rim's steel, the crushed stone. Darkest: the earth (berm, block), the bitumen, the rubber, the cast iron.
// veille: the lane alive (the sign's chequers, the lip of the pit, the sheen of the gravel) and what it does (the ruts,
// the bow waves). signal: the heat of the drum. ink: the paint, the outlines.
import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import { mergeVertices, toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makePart, addMesh, solid, glow, setGlow, fatLine, box, cyl, plate, mergeGeometries, anchor, setPartOpacity } from "@kit/build3d.js";
import { BED, ACCESS, PANEL, RAIL, BERM, SINK, DEMO, TRUCK, AXLES, CURVE, ROAD, inBed } from "./plan.js";

const DEG = Math.PI / 180;
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.05 * (u > 0.5 ? 1 : 0.25);
const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
const f = (x) => (Number.isInteger(x) ? `${x}.0` : String(x)); // a number written for GLSL

/* ─────────────────────────────────────────────────────────── where everything stands (the lane's frame, cm) */
const R = TRUCK.wheel; //                     the tyre's radius (53)
const HALF = BED.w / 2; //                    225
const LEN = 100 * (BED.s1 - BED.s0); //       the bed: 66 m
const L = (s) => -100 * (s - BED.s0); //      a point of the road at `s` metres, along the lane
const LX = (x) => x - BED.x; //               a road x, in the lane's frame
const ROAD_R = LX(ROAD.right); //             the road's right edge: −295
const ZA = L(ACCESS.s0); //                   where the access leaves the road: +3000
const ZB = L(CURVE.s); //                     where the bend begins: +700
const PX = LX(PANEL.x); //                    the sign: −140…
const PZ = L(PANEL.s); //                     …+5200
const RX = LX(RAIL.x); //                     the barrier's middle: 265
const ZE = L(BERM.s1); //                     the berm's back: −7300
const KERB = 20; //                           the kerbs along the bed: 20 cm wide, 8 cm proud of the shoulder
const CELL = 1.25; //                         the gravel's lattice: one pebble to a cell
const HW1 = 17; //                            half the rut a single tyre opens (32 cm)…
const HW2 = 34; //                            …and the drive axle's twins (66 cm)
const RAMP = 150; //                          the ruts deepen over the bed's first 1.5 m
const SLOWMO = 2.5; //                        world.js: the road is filmed slowed down that much
// the cut-away: the round half's gravel taken away outboard of the hero wheel, ±3 m round where it stops — down to a
// face just outside its tyre: the tyre's buried part is behind it, and the pebbles in the face give way round its arc
const NOTCH = { x0: -HALF, x1: -DEMO.lane - TRUCK.tyre / 2 - 3, z0: -100 * DEMO.round - 300, z1: -100 * DEMO.round + 300 };
const DEMO_Z = -400; //                       the macro patches (VIEW.grains): 4 m into the bed
const R_IN = 19.5; //                         the cutaway takes the tyre, the rim and the drum outboard of this radius

const C = {
  gravel: 0xa9a59d, crushed: 0x7a7873, concrete: 0x6b6f73, asphalt: 0x1b1e21, ground: 0x222428, earth: 0x2a2723,
  rubber: 0x16191c, steel: 0x8e949b, hub: 0x3a3f44, iron: 0x33383d, shoe: 0x9aa1a8, lining: 0x5e574f, plate: 0x14181c,
};

/* ─────────────────────────────────────────────────────────── shared GLSL: the lattice, the tyres' work on the gravel */
const GLSL_HASH = /* glsl */ `
vec4 sdHash4(vec2 p) {
  vec4 p4 = fract(vec4(p.xyxy) * vec4(0.1031, 0.1030, 0.0973, 0.1099));
  p4 += dot(p4, p4.wzxy + 33.33);
  return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}`;

/** The surface of the gravel, as the tyres leave it: a rut from the bed's head to each tyre (as deep as the tyre sank,
 *  round like it under its front half, wider behind the drive axle's twins), the lips of what was pushed aside, and in
 *  front of each tyre the bow wave it shoves. uTrk: x, the hub's z, the depth, the half width ahead of the drive axle ·
 *  uTrkB: the drive axle's z, the half width behind it, the entry ramp · uWave: x, the contact's front z, height, half width. */
const GLSL_DEFORM = /* glsl */ `
uniform vec4 uTrk[2];
uniform vec4 uTrkB[2];
uniform vec4 uWave[6];
float sdRut(vec2 p, vec4 T, vec4 B) {
  if (T.z < 0.01 || p.y > 0.0) return 0.0;
  float d = T.z;
  float reach = sqrt(max(2.0 * ${f(R)} * d - d * d, 0.0));
  float behind = p.y - T.y;
  if (behind < -reach) return 0.0;
  float b = min(behind, 0.0);
  float lift = ${f(R)} - sqrt(max(${f(R * R)} - b * b, 0.0));
  float ramp = smoothstep(0.0, B.z, -p.y);
  float hw = mix(T.w, B.y, smoothstep(B.x - 30.0, B.x + 15.0, p.y));
  float ax = abs(p.x - T.x);
  float rut = max(d - lift, 0.0) * ramp * (1.0 - smoothstep(hw - 7.0, hw + 5.0, ax));
  float q = (ax - hw - 9.0) / 9.5;
  float lip = 0.26 * d * ramp * exp(-q * q) * smoothstep(-reach, -reach + 30.0, behind);
  return lip - rut;
}
float sdWave(vec2 p, vec4 W) {
  if (W.z < 0.01 || p.y > 0.0) return 0.0;
  float a = W.y - p.y;
  float ax = abs(p.x - W.x);
  float crest = 9.0 - 0.75 * max(ax - 0.55 * W.w, 0.0);
  float u = (a - crest) / 15.0;
  float along = exp(-u * u) + 0.32 * exp(-max(a - crest, 0.0) / 24.0) * smoothstep(crest - 4.0, crest + 4.0, a);
  float across = 1.0 - smoothstep(W.w + 2.0, W.w + 26.0, ax);
  return W.z * along * across;
}
float sdDeform(vec2 p) {
  float y = sdRut(p, uTrk[0], uTrkB[0]) + sdRut(p, uTrk[1], uTrkB[1]);
  for (int i = 0; i < 6; i++) y += sdWave(p, uWave[i]);
  return y;
}
vec3 sdDeformNormal(vec2 p) {
  float e = 1.2;
  float hx = sdDeform(p + vec2(e, 0.0)) - sdDeform(p - vec2(e, 0.0));
  float hz = sdDeform(p + vec2(0.0, e)) - sdDeform(p - vec2(0.0, e));
  return normalize(vec3(-hx / (2.0 * e), 1.0, -hz / (2.0 * e)));
}
/* where a pebble at rest at p (x, z) has been pushed, and how far it rolled: carried ahead by the wave, then, once the
   tyre is over it, shoved out to the lip */
vec3 sdPush(vec2 p, float jitter) {
  vec2 q = p;
  float moved = 0.0;
  for (int i = 0; i < 2; i++) {
    vec4 T = uTrk[i];
    vec4 B = uTrkB[i];
    if (T.z < 0.01 || p.y > 0.0) continue;
    float d = T.z;
    float reach = sqrt(max(2.0 * ${f(R)} * d - d * d, 0.0));
    float a = (T.y - reach) - p.y;
    float hw = mix(T.w, B.y, smoothstep(B.x - 30.0, B.x + 15.0, p.y));
    float ax = p.x - T.x + (jitter - 0.5) * 0.4;
    float aax = abs(ax);
    float ramp = smoothstep(0.0, B.z, -p.y);
    float carry = 0.2 * d * exp(-max(a, 0.0) / 14.0) * step(0.0, a) * (1.0 - smoothstep(hw, hw + 16.0, aax)) * ramp;
    float k = smoothstep(0.0, 24.0, -a) * (1.0 - smoothstep(hw - 1.0, hw + 4.0, aax)) * ramp;
    float out_ = hw + 5.0 + 0.55 * max(hw - aax, 0.0);
    float nx = T.x + sign(ax) * mix(aax, out_, k);
    q += vec2(nx - p.x, -carry);
    moved += carry + abs(nx - p.x);
  }
  return vec3(q, moved);
}`;

/** The pebbles of a surface, drawn: the nearest of the cells round the fragment (the same lattice and hash as the
 *  instanced grains), a dome of light on it, a crevice between; melted into the mean once a pebble is under a few pixels.
 *  And the crushed stone: flat facets, two to a stone, dark joints. */
const GLSL_PEBBLES = /* glsl */ `
float sdAlb = 1.0;
float sdCm = 0.0;
vec2 sdTilt = vec2(0.0);
float sdUp = 1.0;
float sdTop = 0.5;
// fw: how many cm one pixel covers here (taken by the caller, outside any branch)
void sdRound(vec2 p, float fw) {
  vec2 g = p / ${f(CELL)};
  vec2 i = floor(g);
  vec2 fr = g - i;
  float best = 9.0;
  vec2 bv = vec2(0.0);
  float bh = 0.5;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 b = vec2(float(x), float(y));
      vec4 h = sdHash4(i + b);
      vec2 o = fr - (b + 0.5 + (h.xy - 0.5) * 0.7);
      float r = 0.40 + 0.16 * h.z;
      float an = h.w * 6.2832;
      vec2 cs = vec2(cos(an), sin(an));
      vec2 qq = vec2(dot(o, cs), dot(o, vec2(-cs.y, cs.x)));
      qq.y *= 1.22;
      float dd = length(qq) / r;
      if (dd < best) { best = dd; bv = o / r; bh = h.z; }
    }
  }
  float fade = 1.0 - smoothstep(0.16, 0.38, fw / ${f(CELL)});
  float inside = 1.0 - smoothstep(0.9, 1.04, best);
  float dome = sqrt(max(1.0 - best * best, 0.0));
  float a = mix(0.40, (0.76 + 0.36 * bh) * (0.84 + 0.16 * dome), inside);
  sdAlb = mix(0.72, a, fade);
  sdTilt = bv * 0.85 * inside * fade;
  sdUp = mix(1.0, max(dome, 0.22), inside * fade);
  sdTop = mix(0.45, dome * inside, fade);
}
void sdCrush(vec2 p, float fw) {
  vec2 g = p / 1.45;
  vec2 i = floor(g);
  vec2 fr = g - i;
  float d1 = 9.0;
  float d2 = 9.0;
  vec4 h1 = vec4(0.5);
  vec2 o1 = vec2(0.0);
  vec2 c1 = vec2(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 b = vec2(float(x), float(y));
      vec4 h = sdHash4(i + b + 41.7);
      vec2 o = fr - (b + 0.5 + (h.xy - 0.5) * 0.8);
      float dd = length(o);
      if (dd < d1) { d2 = d1; d1 = dd; h1 = h; o1 = o; c1 = i + b; } else if (dd < d2) { d2 = dd; }
    }
  }
  float fade = 1.0 - smoothstep(0.16, 0.38, fw / 1.45);
  float joint = smoothstep(0.03, 0.13, d2 - d1);
  float an = h1.z * 6.2832;
  float side = step(0.0, dot(o1, vec2(cos(an), sin(an))));
  vec4 hf = sdHash4(c1 * 1.37 + side * 5.3 + 2.1);
  sdTilt = (hf.xy - 0.5) * 1.4 * joint * fade;
  sdUp = 1.0;
  sdAlb = mix(0.66, mix(0.34, (0.70 + 0.32 * h1.w) * (0.88 + 0.22 * hf.z), joint), fade);
  sdTop = mix(0.4, 0.6 * joint, fade);
}`;

/* ─────────────────────────────────────────────────────────── matter */

/** A lit solid of the house with code of its own spliced in: its object-space position as `vO` (and `vN`). */
function spliced(mat, key, uniforms, { head = "", vhead = "", vbody = "", vnormal = "", discard = "", color = "", rough = "", normal = "", emissive = "", finish = false } = {}) {
  mat.customProgramCacheKey = () => key;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vO;\nvarying vec3 vN;\n${vhead}`)
      .replace("#include <beginnormal_vertex>", vnormal || "#include <beginnormal_vertex>")
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n${vbody}\nvO = transformed;\nvN = objectNormal;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vO;\nvarying vec3 vN;\n${head}`)
      .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>\n${discard}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${color}`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\n${rough}`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${normal}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${emissive}`);
  };
  mat.userData.finish = finish; // the machining grain belongs to steel and iron, never to stone, earth or rubber
  return mat;
}

/** The depth (shadow) twin of a material whose vertices move in its shader. */
function depthOf(key, uniforms, vhead, vbody, discardHead = "", discard = "") {
  const mat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  mat.customProgramCacheKey = () => key + "-depth";
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vO;\n${vhead}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n${vbody}\nvO = transformed;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vO;\n${discardHead}`)
      .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>\n${discard}`);
  };
  return mat;
}

// a normal tilted by a pattern: tangents of the pattern's two axes (view space) handed by the vertex shader
const TILT = /* glsl */ `
{
  vec3 n0 = normal;
  vec3 ta = normalize(vTa - dot(vTa, n0) * n0);
  vec3 tb = normalize(vTb - dot(vTb, n0) * n0 - dot(vTb, ta) * ta);
  normal = normalize(n0 * sdUp + ta * sdTilt.x + tb * sdTilt.y);
}`;

/* ─────────────────────────────────────────────────────────── shapes */

/** A profile ([r, a] points: a closed loop, counter-clockwise — the solid on its left) turned round the wheel's axle (x)
 *  from ψ0 to ψ1 (degrees, from +y toward +z, the wheel seen from its outer side… turned so that ψ 90 is the rear). A
 *  sector is closed at both ends by the profile itself: real cut faces. */
function turned(profile, psi0 = 0, psi1 = 360, segs = 96, crease = 34) {
  const pts = profile.map(([r, a]) => new THREE.Vector2(r, a));
  const span = psi1 - psi0;
  const n = Math.max(3, Math.round((segs * span) / 360));
  // LatheGeometry stands (r sin φ, a, r cos φ); laid along x it is (a, −r sin φ, r cos φ): ψ = φ + 90°
  let lat = new THREE.LatheGeometry([...pts, pts[0]], n, (psi0 - 90) * DEG, span * DEG);
  lat.rotateZ(-Math.PI / 2);
  lat.deleteAttribute("uv");
  lat = toCreasedNormals(lat, crease * DEG);
  if (span >= 360) return lat;
  // the caps: the profile laid in the planes ψ0 (facing −ψ) and ψ1 (facing +ψ)
  const tris = THREE.ShapeUtils.triangulateShape(pts, []);
  const cap = (psi, flip) => {
    const c = Math.cos(psi * DEG);
    const s = Math.sin(psi * DEG);
    const pos = [];
    const nrm = flip ? [0, -s, c] : [0, s, -c];
    for (const [i, j, k] of tris) {
      const A = pts[i];
      let B = pts[j];
      let Cc = pts[k];
      const ccw = (B.x - A.x) * (Cc.y - A.y) - (B.y - A.y) * (Cc.x - A.x) > 0;
      if (ccw === flip) [B, Cc] = [Cc, B];
      for (const P of [A, B, Cc]) pos.push(P.y, P.x * c, P.x * s);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(Array.from({ length: pos.length / 3 }, () => nrm).flat(), 3));
    return g;
  };
  return mergeGeometries([lat, cap(psi0, false), cap(psi1, true)]);
}

/** A circle (or an arc) round the axle, as a fine line: radius r, at a along the axle, from ψ0 to ψ1. */
function arc(r, a, psi0, psi1, o) {
  const pts = [];
  const n = Math.max(4, Math.round((psi1 - psi0) / 3));
  for (let i = 0; i <= n; i++) {
    const p = (psi0 + ((psi1 - psi0) * i) / n) * DEG;
    pts.push([a, r * Math.cos(p), r * Math.sin(p)]);
  }
  return fatLine(pts, o);
}

/** The outline of a profile laid in the plane ψ: what a cut face shows. */
function profileLine(profile, psi, o) {
  const c = Math.cos(psi * DEG);
  const s = Math.sin(psi * DEG);
  return fatLine([...profile, profile[0]].map(([r, a]) => [a, r * c, r * s]), o);
}

/** A flat outline of the lane ([x, z] points, the lane's frame) given a thickness, from y0 to y1. */
function slab(outline, y0, y1, holes = [], bevel = 0.4) {
  const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)));
  for (const hole of holes) shape.holes.push(new THREE.Path(hole.map(([x, z]) => new THREE.Vector2(x, -z))));
  return plate(shape, y1 - y0, { bevel }).rotateX(-Math.PI / 2).translate(0, y0, 0);
}

/** A seeded value noise (lattice of hashed corners, smooth): the earth's lumps — no Math.random. */
function noise2(x, z, cell, seed = 1) {
  const h = (i, j) => {
    let t = Math.imul(i * 374761393 + j * 668265263 + seed * 2246822519, 3266489917) >>> 0;
    t = Math.imul(t ^ (t >>> 15), 2246822519) >>> 0;
    return ((t ^ (t >>> 13)) >>> 0) / 4294967296;
  };
  const gx = x / cell;
  const gz = z / cell;
  const i = Math.floor(gx);
  const j = Math.floor(gz);
  const u = smooth(gx - i);
  const v = smooth(gz - j);
  return (h(i, j) * (1 - u) + h(i + 1, j) * u) * (1 - v) + (h(i, j + 1) * (1 - u) + h(i + 1, j + 1) * u) * v;
}

/** The earth mound: a height field over [x0, x1] × [the bed's end, its back], closed down to y = −4 by four skirts.
 *  Rounded at an end unless it is cut there (the bench cuts the lane along the bed's left edge). */
function moundGeometry(x0, x1, roundLeft) {
  const nx = 44;
  const nz = 36;
  const zf = -LEN;
  const zb = ZE;
  const height = (x, z) => {
    const b = zf - z; // into the berm: 0 at its foot … 700 at its back
    const along = b < 290 ? smooth(b / 290) : b < 430 ? 1 : smooth(clamp01(1 - (b - 430) / 270));
    const sideL = roundLeft ? smooth(clamp01((x - x0) / 60)) : 1;
    const sideR = smooth(clamp01((x1 - x) / 60));
    const k = along * Math.min(sideL, sideR);
    return k * (BERM.h - 6 + 9 * noise2(x, z, 70, 5) + 4 * noise2(x, z, 23, 9)) - (1 - k) * 4;
  };
  const top = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = x0 + ((x1 - x0) * i) / nx;
    const z = zf + ((zb - zf) * j) / nz;
    top.push([x, height(x, z), z]);
  }
  const pos = [];
  const tri = (a, b, c) => pos.push(...a, ...b, ...c);
  const at = (i, j) => top[j * (nx + 1) + i];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    // facing up: (a, b, c) with b along +x, c along −z
    tri(at(i, j), at(i + 1, j), at(i, j + 1));
    tri(at(i + 1, j), at(i + 1, j + 1), at(i, j + 1));
  }
  // a skirt down to y = −4 along an edge, its triangles turned to face `out`
  const skirt = (edge, out) => {
    for (let k = 0; k < edge.length - 1; k++) {
      const a = edge[k];
      const b = edge[k + 1];
      const a0 = [a[0], -4, a[2]];
      const b0 = [b[0], -4, b[2]];
      const u = [a0[0] - a[0], a0[1] - a[1], a0[2] - a[2]];
      const v = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      if (n[0] * out[0] + n[1] * out[1] + n[2] * out[2] >= 0) {
        tri(a, a0, b);
        tri(b, a0, b0);
      } else {
        tri(a, b, a0);
        tri(b, b0, a0);
      }
    }
  };
  skirt(Array.from({ length: nz + 1 }, (_, j) => at(0, j)), [-1, 0, 0]); // the left end (the cut face on the bench)
  skirt(Array.from({ length: nz + 1 }, (_, j) => at(nx, j)), [1, 0, 0]);
  skirt(Array.from({ length: nx + 1 }, (_, i) => at(i, 0)), [0, 0, 1]); // its foot, on the gravel
  skirt(Array.from({ length: nx + 1 }, (_, i) => at(i, nz)), [0, 0, -1]);
  let g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g = mergeVertices(g, 0.01);
  g = toCreasedNormals(g, 50 * DEG);
  return g;
}

/** The C26a's pictogram, in the plate's own plane (u right, v up; the plate is 95 cm square): the road (ink), and
 *  the escape branch — a band, an arrowhead — into a block of chequers (veille). No text. */
function pictogram() {
  const flat = (pts) => new THREE.ShapeGeometry(new THREE.Shape(pts.map(([u, v]) => new THREE.Vector2(u, v))));
  const road = flat([[-22, -36], [-14, -36], [-14, 33], [-22, 33]]);
  const band = flat([[-17.5, -12.5], [-12.5, -17.5], [4.5, -0.5], [-0.5, 4.5]]);
  const head = flat([[-3.6, 6.4], [6.4, -3.6], [9.2, 9.2]]);
  const sq = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) sq.push(flat([[10 + 6.5 * i, 10 + 6.5 * j], [16.5 + 6.5 * i, 10 + 6.5 * j], [16.5 + 6.5 * i, 16.5 + 6.5 * j], [10 + 6.5 * i, 16.5 + 6.5 * j]]));
  const frame = new THREE.Shape([[-44, -44], [44, -44], [44, 44], [-44, 44]].map(([u, v]) => new THREE.Vector2(u, v)));
  frame.holes.push(new THREE.Path([[-40.5, -40.5], [40.5, -40.5], [40.5, 40.5], [-40.5, 40.5]].map(([u, v]) => new THREE.Vector2(u, v))));
  return { road, branch: mergeGeometries([band, head]), chequers: mergeGeometries(sq), frame: new THREE.ShapeGeometry(frame), outline: [[10, 10], [36, 10], [36, 36], [10, 36]] };
}

/* ─────────────────────────────────────────────────────────── the wheel */

// the tyre (315/80 R22.5: 107 cm across, 32 wide): rubber round its air, [r, a], counter-clockwise
const TYRE_OUT = [[28.6, -11.3], [29.2, -11.9], [30.2, -12.9], [32.5, -14.4], [36, -15.6], [40, -16], [44, -15.7], [47.5, -14.8], [50.2, -13.4], [51.8, -12], [52.7, -10.8], [53, -9.6]];
const TYRE_IN = [[50.2, 0], [50, -9], [49, -11.6], [46.5, -13.4], [43.5, -14.4], [40, -14.7], [36, -14.2], [33, -13.1], [31, -11.8], [29.9, -10.4], [28.6, -9.8]];
const mirrorA = (pts) => pts.map(([r, a]) => [r, -a]);
const TYRE = [...TYRE_OUT, ...mirrorA(TYRE_OUT).reverse(), ...mirrorA(TYRE_IN).reverse(), ...TYRE_IN.slice(1)].filter((p, i, all) => i === 0 || p[0] !== all[i - 1][0] || p[1] !== all[i - 1][1]);
// the rim's barrel (a 22.5 in. drop-centre rim)
const RIM = [[30.0, -11.7], [28.9, -11.3], [28.6, -10.6], [28.2, -7.5], [25.6, -5.6], [25.4, 1.2], [28.2, 4.6], [28.6, 10.6], [28.9, 11.3], [30.0, 11.7], [30.0, 12.5], [28.1, 12.1], [27.7, 10.7], [27.3, 5.0], [24.5, 1.5], [24.7, -5.9], [27.3, -7.8], [27.7, -10.7], [28.1, -12.1], [30.0, -12.5]];
// its disc: the inner ring (bolted, it stays) and the outer one (the ten hand holes)
const DISC_IN = [[13, -8.8], [18.5, -8.8], [R_IN, -8.4], [R_IN, -7.0], [18.3, -7.5], [13, -7.5]];
const DISC_OUT = [[R_IN, -8.4], [21.5, -7.6], [24.8, -4.4], [24.8, -3.1], [21.2, -6.3], [R_IN, -7.0]];
// the drum: its flange (bolted between the disc and the hub) and its wall, ribbed outside; the braking face at r = 21
const DRUM_IN = [[12, 3], [R_IN, 3], [R_IN, 6.2], [12, 6.2]];
const DRUM_OUT = [[R_IN, 3], [24.5, 3], [24.5, 7], [25.5, 7.6], [25.5, 9.6], [24.5, 10.2], [24.5, 15], [25.5, 15.6], [25.5, 17.6], [24.5, 18.2], [24.5, 26], [21, 26], [21, 6.2], [R_IN, 6.2]];
// …and the quarter the cutaway takes is only its outboard half: the inboard half stays, its cut face toward you, the
// linings pressed against it
const DRUM_CUT = 15;
const DRUM_QOUT = [[R_IN, 3], [24.5, 3], [24.5, 7], [25.5, 7.6], [25.5, 9.6], [24.5, 10.2], [24.5, DRUM_CUT], [21, DRUM_CUT], [21, 6.2], [R_IN, 6.2]];
const DRUM_QIN = [[21, DRUM_CUT], [24.5, DRUM_CUT], [25.5, 15.6], [25.5, 17.6], [24.5, 18.2], [24.5, 26], [21, 26]];
// the shoes: [ψ from, ψ to] — their cam ends meet at ψ 45° (the middle of the cutaway's window), their anchors at 225°
const SHOES = [
  { from: 57, to: 213, lining: [67, 203], roller: 54, open: 1 },
  { from: 237, to: 393, lining: [247, 383], roller: 36, open: -1 },
];
const ANCHOR = { psi: 225, r: 15.2 };
const CAM = { psi: 45, r: 13.0 };
const polar = (r, psi) => [r * Math.cos(psi * DEG), r * Math.sin(psi * DEG)]; // (y, z) of a point of the wheel's plane

function tyreMaterial(U) {
  return spliced(solid(C.rubber, { rough: 0.93, env: 0.55 }), "sd027-tyre", U, {
    head: /* glsl */ `uniform float uSpin; uniform float uTread; float sdGroove = 0.0;`,
    color: /* glsl */ `
    {
      float r = length(vO.yz);
      float a = vO.x;
      float m = atan(vO.z, vO.y) + uSpin;
      float m2 = atan(-vO.z, -vO.y) + uSpin;
      float dm = min(fwidth(m), fwidth(m2)); // (two cuts: the angle's jump is never on both)
      float w = fwidth(a) * 1.2 + 0.08;
      if (r > 49.0 && abs(a) < 15.0 && uTread > 0.003) {
        float u = m * 5.7296;          // 36 zigzags a turn
        float zig = abs(fract(u) - 0.5) * 2.0 - 0.5;
        float gz = 1.0 - smoothstep(0.42, 0.42 + w, abs(a + 8.4 + zig * 0.9));
        gz = max(gz, 1.0 - smoothstep(0.42, 0.42 + w, abs(a + 2.9 - zig * 0.9)));
        gz = max(gz, 1.0 - smoothstep(0.42, 0.42 + w, abs(a - 2.9 - zig * 0.9)));
        gz = max(gz, 1.0 - smoothstep(0.42, 0.42 + w, abs(a - 8.4 + zig * 0.9)));
        float ub = m * 7.6394;         // 48 shoulder blocks a turn
        float wb = dm * 7.6394 * 1.2 + 0.02;
        float notch = (1.0 - smoothstep(0.11, 0.11 + wb, abs(fract(ub) - 0.5))) * smoothstep(9.2, 10.0, abs(a)) * (1.0 - smoothstep(13.8, 14.6, abs(a)));
        float fadeZ = 1.0 - smoothstep(0.12, 0.3, dm * 5.7296);
        float fadeB = 1.0 - smoothstep(0.12, 0.3, dm * 7.6394);
        sdGroove = max(gz * fadeZ, notch * fadeB) * uTread * smoothstep(49.5, 51.5, r);
      }
      diffuseColor.rgb *= 1.0 - 0.62 * sdGroove;
    }`,
    rough: /* glsl */ `roughnessFactor = mix(roughnessFactor, 1.0, sdGroove);`,
  });
}

function rimDiscMaterial(U, color) {
  return spliced(solid(color, { rough: 0.5, metal: 0.38 }), "sd027-disc", U, {
    head: /* glsl */ `uniform float uSpin; uniform float uHoleFade; uniform float uHeat; uniform vec3 uSignal; float sdHole = 9.0;`,
    discard: /* glsl */ `
    {
      float r = length(vO.yz);
      float m = atan(vO.z, vO.y) + uSpin;
      float k = fract(m * 1.59155) - 0.5;    // ten holes a turn
      sdHole = length(vec2(k * 0.62832 * r / 3.3, (r - 21.7) / 1.7));
      if (sdHole < 1.0 - uHoleFade) discard;
    }`,
    color: /* glsl */ `diffuseColor.rgb *= mix(1.0, 0.5, (1.0 - smoothstep(1.0, 1.15, sdHole)) * (1.0 - uHoleFade));`,
    emissive: /* glsl */ `totalEmissiveRadiance += uSignal * uHeat * uHeat * 0.4 * uHoleFade * (1.0 - smoothstep(0.85, 1.2, sdHole));`,
    finish: true,
  });
}

function drumMaterial(U) {
  return spliced(solid(C.iron, { rough: 0.72, metal: 0.32 }), "sd027-drum", U, {
    head: /* glsl */ `uniform float uHeat; uniform float uContact; uniform vec3 uSignal;`,
    emissive: /* glsl */ `
    {
      float r = length(vO.yz);
      float a = vO.x;
      float skin = (1.0 - smoothstep(21.03, 21.6, r)) * step(6.0, a);        // the braking face, and its edge on a cut
      float face = (1.0 - step(3.25, a)) * smoothstep(12.5, 15.0, r);        // the outer face, seen through the rim's holes
      float wall = smoothstep(24.2, 24.6, r) * step(6.4, a);                  // the outside of the wall
      totalEmissiveRadiance += uSignal * uHeat * (1.15 * skin * (0.5 + 0.5 * uContact) + 0.42 * face * uHeat + 0.1 * wall * uHeat);
    }`,
    finish: true,
  });
}

/**
 * A wheel of the truck. `brake`: the hero has its drum brake inside; the bench's twin has none.
 * → { group, parts, U, update(spin, tread, holes, heat, pedal, cutaway, show) }
 */
function makeWheel({ brake = true } = {}) {
  const group = new THREE.Group(); //  the wheel's frame
  const quarter = new THREE.Group(); // what the cutaway takes away (a quarter of the tyre, the rim, the drum)
  const spin = new THREE.Group(); //    what turns as geometry (the nuts); the rest turns in its shaders
  group.add(quarter, spin);
  const U = {
    uSpin: { value: 0 }, uTread: { value: 1 }, uHoleFade: { value: 0 }, uHeat: { value: 0 }, uContact: { value: 0 },
    uSignal: { value: SIGNAL.clone() },
  };
  const tyre = makePart("tyre");
  const rim = makePart("rim");
  const drum = makePart("drum");
  const shoes = makePart("shoes");
  group.add(tyre, rim);
  if (brake) group.add(drum, shoes);
  const qMats = [];
  const capLines = []; //  the outlines of the cut faces left on the wheel (shown with the cutaway)
  const qLines = []; //    …and of the quarter (they go with it)
  const put = (part, geo, mat, where = part) => {
    const mesh = addMesh(part, geo, mat, { edges: false });
    if (where !== part) where.add(mesh);
    return mesh;
  };
  const line = (l, where, part, list, cap = false) => {
    where.add(l);
    part.userData.part.mats.add(l.material);
    l.userData.cap = cap;
    if (list) list.push(l);
    return l;
  };
  const lineOf = { color: BRAND.ink, width: 1.8, opacity: 0.5 };
  const capOf = { color: BRAND.ink, width: 1.6, opacity: 0 };

  // the tyre: three quarters that stay, the quarter that goes — the same shader turns them both
  const rubber = tyreMaterial(U);
  const rubberQ = tyreMaterial(U);
  qMats.push(rubberQ);
  put(tyre, turned(TYRE, 90, 360, 120), rubber);
  put(tyre, turned(TYRE, 0, 90, 120), rubberQ, quarter);
  for (const a of [-10.9, 10.9]) {
    line(arc(52.7, a, 90, 360, lineOf), group, tyre);
    line(arc(52.7, a, 0, 90, lineOf), quarter, tyre, qLines);
  }
  for (const psi of [0, 90]) {
    line(profileLine(TYRE, psi, capOf), group, tyre, capLines, true);
    line(profileLine(TYRE, psi, capOf), quarter, tyre, qLines, true);
  }

  // the rim: its barrel, its disc (the inner ring stays whole), the hub, the hub cap, ten nuts that turn
  const steel = solid(C.steel, { rough: 0.5, metal: 0.38 });
  const steelQ = solid(C.steel, { rough: 0.5, metal: 0.38 });
  qMats.push(steelQ);
  put(rim, turned(RIM, 90, 360, 120, 30), steel);
  put(rim, turned(RIM, 0, 90, 120, 30), steelQ, quarter);
  const disc = rimDiscMaterial(U, C.steel);
  const discQ = rimDiscMaterial(U, C.steel);
  qMats.push(discQ);
  put(rim, turned(DISC_OUT, 90, 360, 160, 30), disc);
  put(rim, turned(DISC_OUT, 0, 90, 160, 30), discQ, quarter);
  put(rim, turned(DISC_IN, 0, 360, 96, 30), solid(C.steel, { rough: 0.5, metal: 0.38 }));
  const hubMat = solid(C.hub, { rough: 0.6, metal: 0.35 });
  put(rim, turned([[5.4, -7.4], [12.9, -7.4], [12.9, 3.0], [5.4, 3.0]], 0, 360, 64, 30), hubMat);
  put(rim, turned([[0, -13.3], [6.9, -13.3], [7.6, -12.6], [7.6, -8.8], [0, -8.8]], 0, 360, 64, 30), solid(C.steel, { rough: 0.42, metal: 0.42 }));
  const nuts = [];
  for (let k = 0; k < 10; k++) {
    const [y, z] = polar(16.75, 36 * k + 18);
    nuts.push(cyl(1.45, 2.3, 0.15, 6).rotateZ(-Math.PI / 2).translate(-10.0, y, z), cyl(2.0, 0.4, 0.08, 20).rotateZ(-Math.PI / 2).translate(-9.0, y, z));
  }
  put(rim, mergeGeometries(nuts), solid(0xa3a9af, { rough: 0.4, metal: 0.45 }), spin);
  for (const a of [-12.1, 12.1]) {
    line(arc(30.0, a, 90, 360, lineOf), group, rim);
    line(arc(30.0, a, 0, 90, lineOf), quarter, rim, qLines);
  }
  line(arc(12.95, -8.8, 0, 360, { ...lineOf, opacity: 0.35 }), group, rim);
  for (const psi of [0, 90]) {
    line(profileLine(RIM, psi, capOf), group, rim, capLines, true);
    line(profileLine(DISC_OUT, psi, capOf), group, rim, capLines, true);
    line(profileLine(RIM, psi, capOf), quarter, rim, qLines, true);
    line(profileLine(DISC_OUT, psi, capOf), quarter, rim, qLines, true);
  }
  // the spindle the wheel turns on
  put(rim, cyl(5.4, 52, 0.2, 32).rotateZ(-Math.PI / 2).translate(19, 0, 0), hubMat);

  // the drum brake
  let ironQ = null;
  let lining = null;
  let camPivot = null;
  const shoePivots = [];
  let heatLight = null;
  if (brake) {
    const iron = drumMaterial(U);
    ironQ = drumMaterial(U);
    qMats.push(ironQ);
    put(drum, turned(DRUM_IN, 0, 360, 96, 30), drumMaterial(U));
    put(drum, turned(DRUM_OUT, 90, 360, 120, 30), iron);
    put(drum, turned(DRUM_QIN, 0, 90, 40, 30), iron);
    put(drum, turned(DRUM_QOUT, 0, 90, 40, 30), ironQ, quarter);
    for (const psi of [0, 90]) {
      line(profileLine(DRUM_OUT, psi, capOf), group, drum, capLines, true);
      line(profileLine(DRUM_QOUT, psi, capOf), quarter, drum, qLines, true);
    }
    line(arc(21, DRUM_CUT + 0.05, 0, 90, capOf), group, drum, capLines, true);
    line(arc(24.5, DRUM_CUT + 0.05, 0, 90, capOf), group, drum, capLines, true);
    // the backing plate, the anchor pins, the S-cam and its shaft
    const dark = solid(C.hub, { rough: 0.62, metal: 0.3 });
    put(drum, turned([[6, 26.6], [25.6, 26.6], [25.6, 27.4], [6, 27.4]], 0, 360, 96, 30), dark);
    const [ay, az] = polar(ANCHOR.r, ANCHOR.psi);
    const shaftSteel = solid(C.shoe, { rough: 0.45, metal: 0.42 });
    put(shoes, cyl(1.3, 19.5, 0.12, 20).rotateZ(-Math.PI / 2).translate(17.8, ay, az), shaftSteel);
    const [cy, cz] = polar(CAM.r, CAM.psi);
    camPivot = new THREE.Group();
    camPivot.position.set(0, cy, cz);
    group.add(camPivot);
    const sCam = [];
    for (let i = 0; i <= 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      const rr = 1.9 + 0.9 * ((t % Math.PI) / Math.PI);
      sCam.push([rr * Math.cos(t), rr * Math.sin(t)]);
    }
    // the cam: drawn in the wheel's plane (y, z), 7 cm along the axle
    const camGeo = plate(sCam, 7, { bevel: 0.15 }).rotateY(Math.PI / 2).translate(12.5, 0, 0);
    const camMesh = put(shoes, mergeGeometries([camGeo, cyl(1.7, 34, 0.12, 24).rotateZ(-Math.PI / 2).translate(29, 0, 0)]), shaftSteel);
    camPivot.add(camMesh);
    // the two shoes: table, web, lining, roller — each turns on its anchor pin (it is how they reach the drum)
    // the lining: grey-brown; only its friction face, against the drum, goes to the red
    lining = spliced(solid(C.lining, { rough: 0.9 }), "sd027-lining", U, {
      head: /* glsl */ `uniform float uHeat; uniform float uContact; uniform vec3 uSignal;`,
      emissive: /* glsl */ `
      {
        float face = smoothstep(20.3, 20.9, length(vO.yz));
        totalEmissiveRadiance += uSignal * uHeat * (0.03 + face * (0.15 + 0.65 * uContact)) * (0.6 + 0.4 * uHeat);
      }`,
    });
    const shoeSteel = solid(C.shoe, { rough: 0.5, metal: 0.36 });
    for (const S of SHOES) {
      const pivot = new THREE.Group();
      pivot.position.set(0, ay, az);
      const body = new THREE.Group();
      body.position.set(0, -ay, -az);
      pivot.add(body);
      group.add(pivot);
      const [ry, rz] = polar(16.5, S.roller);
      const parts = [
        turned([[19.25, 8.5], [19.75, 8.5], [19.75, 23.5], [19.25, 23.5]], S.from, S.to, 72, 30),
        turned([[12.8, 15.3], [19.25, 15.3], [19.25, 16.7], [12.8, 16.7]], S.from + 3, S.to - 3, 64, 30),
        cyl(1.6, 4.6, 0.12, 20).rotateZ(-Math.PI / 2).translate(16, ry, rz).deleteAttribute("uv"),
      ];
      body.add(put(shoes, mergeGeometries(parts), shoeSteel));
      body.add(put(shoes, turned([[19.75, 9.2], [20.92, 9.2], [20.92, 22.8], [19.75, 22.8]], S.lining[0], S.lining[1], 72, 30), lining));
      shoePivots.push({ pivot, open: S.open });
    }
    heatLight = new THREE.PointLight(BRAND.signal, 0, 46, 2);
    heatLight.position.set(16, 0, 0);
    group.add(heatLight);
  }

  // a quarter's materials fade as it goes; every part's own opacity multiplies (setPartOpacity)
  const fadeMat = (mat, k) => {
    mat.opacity = mat.userData.base * k;
    const transparent = mat.userData.transparent || k < 0.999;
    if (mat.transparent !== transparent) {
      mat.transparent = transparent;
      mat.needsUpdate = true;
    }
    mat.depthWrite = mat.userData.depthWrite && k > 0.55;
  };
  const QDIR = new THREE.Vector3(0, Math.SQRT1_2, Math.SQRT1_2); // up and back: the quarter's bisector
  const parts = { tyre, rim, drum, shoes };

  return {
    group, parts, U, quarter,
    /** `spin` rad turned · `tread`, `holes` 0–1 how much the tread and the holes still show (speed) · `heat` 0–1 ·
     *  `pedal` 0–1 · `cutaway` 0–1 · `show` 0–1 (the bench's fade). */
    update(spinRad, tread, holes, heat, pedal, cutaway, show) {
      U.uSpin.value = spinRad;
      spin.rotation.x = -spinRad;
      U.uTread.value = tread;
      U.uHoleFade.value = 1 - holes;
      U.uHeat.value = heat;
      for (const part of brake ? [tyre, rim, drum, shoes] : [tyre, rim]) setPartOpacity(part, show);
      group.visible = show > 0.004;
      // the cutaway: the quarter slides off up and back and dissolves; the cut faces left show their outlines
      const cut = smooth(clamp01(cutaway));
      const qk = (1 - smooth(ramp(cutaway, 0.1, 0.85))) * show;
      quarter.visible = qk > 0.004;
      quarter.position.copy(QDIR).multiplyScalar(26 * cut);
      for (const mat of qMats) fadeMat(mat, qk);
      for (const l of qLines) l.material.opacity = (l.userData.cap ? 0.75 * cut : 0.5) * qk;
      for (const l of capLines) l.material.opacity = 0.75 * cut * show;
      if (!brake) return;
      // the shoes open on their anchors as the cam turns; at contact the lining touches the drum
      const press = smooth(ramp(pedal, 0.05, 0.6));
      const contact = smooth(ramp(pedal, 0.45, 0.62));
      U.uContact.value = contact;
      for (const { pivot, open } of shoePivots) pivot.rotation.x = open * -0.07 * (1 - press);
      camPivot.rotation.x = -0.6 * press;
      heatLight.intensity = 14 * heat * heat * show;
    },
  };
}

/* ─────────────────────────────────────────────────────────── the lane */

export function buildLane() {
  const root = new THREE.Group();
  const U = {
    uTrk: { value: [new THREE.Vector4(), new THREE.Vector4()] },
    uTrkB: { value: [new THREE.Vector4(1e5, HW1, RAMP, 0), new THREE.Vector4(1e5, HW1, RAMP, 0)] },
    uWave: { value: Array.from({ length: 6 }, () => new THREE.Vector4()) },
    uSheen: { value: 0.03 }, //   the gravel's veille lustre
    uRutGlow: { value: 0.22 }, // …and the ruts', the waves'
    uNotch: { value: new THREE.Vector4(0, 0, 0, 0) }, // the cut-away: x0, x1, z0, z1 (none while x1 ≤ x0)
    uCrush: { value: new THREE.Vector2(0, 0) }, //       the crushed half: its front (z), on (1) or not
    uVeille: { value: VEILLE.clone() },
    uWarp: { value: new THREE.Vector4(0, 0, 0, 0) }, //  the section face: the tyre's circle (z, y), push, on
    uSectionX: { value: -HALF },
  };

  /* ── the sign: on the right verge of the road, « bien avant » ── */
  const panel = makePart("panel");
  const plateY = PANEL.h + 37.5;
  addMesh(panel, cyl(3.5, PANEL.h + 105, 0.4, 20).translate(PX, (PANEL.h + 105) / 2 - 20, PZ - 4), solid(C.steel, { rough: 0.55, metal: 0.35 }), { edgeOpacity: 0.45 });
  addMesh(panel, box(95, 95, 3, 0.8).translate(PX, plateY, PZ), solid(C.plate, { rough: 0.55 }), { edgeOpacity: 0.7 });
  const pic = pictogram();
  const inkMat = glow(BRAND.ink, 0.5);
  const roadMat = glow(BRAND.ink, 0.42);
  const chequerMat = glow(BRAND.veille, 0.6);
  const branchMat = glow(BRAND.veille, 0.6);
  for (const [geo, mat, dz] of [[pic.frame, inkMat, 1.62], [pic.road, roadMat, 1.64], [pic.branch, branchMat, 1.68], [pic.chequers, chequerMat, 1.7]]) {
    addMesh(panel, geo.clone().translate(PX, plateY, PZ + dz), mat, { edges: false });
  }
  const panelLamp = lampOf(panel);

  /* ── the access: the « biseau » of bitumen that leaves the road's right edge and widens to the whole bed ── */
  const access = makePart("access");
  const right = [];
  for (let i = 0; i <= 30; i++) {
    const v = i / 30; // 0 at the road … 1 at the bed's head: it leaves the edge at 6°, and meets the bed tangent
    right.push([ROAD_R + (HALF - ROAD_R) * (1 - (1 - v) ** 2), ZA * (1 - v)]);
  }
  const accessOutline = [[ROAD_R, ZA], [ROAD_R, ZB], [-HALF, 0], ...right.slice().reverse().slice(0, -1)];
  addMesh(access, slab(accessOutline, -8, 0), solid(C.asphalt, { rough: 0.92 }), { edgeOpacity: 0.35 });
  const accessLine = fatLine(right.map(([x, z]) => [x - 9, 0.6, z]), { color: BRAND.ink, width: 2, opacity: 0.5 });
  access.add(accessLine);
  access.userData.part.mats.add(accessLine.material);
  const accessLamp = lampOf(access);

  /* ── the road's ribbon (on the bench: where the lane leaves the road) ── */
  const roadEdge = makePart("roadEdge");
  const ribbonZ0 = PZ + 500; // from 5 m before the sign: the sign stands by the road
  addMesh(roadEdge, slab([[LX(-175) - 15, ribbonZ0], [ROAD_R, ribbonZ0], [ROAD_R, ZB], [LX(-175) - 15, ZB]], -8, 0), solid(C.asphalt, { rough: 0.92 }), { edgeOpacity: 0.3 });
  {
    const paint = glow(BRAND.ink, 0.55);
    const bands = [];
    const band = (x0, x1, z0, z1) => bands.push(new THREE.PlaneGeometry(x1 - x0, z0 - z1).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, 0.3, (z0 + z1) / 2));
    band(ROAD_R - 15, ROAD_R, ribbonZ0, ZA); // the edge line, whole…
    for (let z = ZA; z > ZB + 300; z -= 650) band(ROAD_R - 15, ROAD_R, z, z - 300); // …broken where the lane leaves
    for (let z = ribbonZ0 - 200; z > ZB + 300; z -= 1300) band(LX(-175) - 6, LX(-175) + 6, z, z - 300); // the centre line
    addMesh(roadEdge, mergeGeometries(bands), paint, { edges: false });
  }

  /* ── the pit: kerbs, concrete walls (seen on the bench), the veille line on its lip ── */
  const pit = makePart("pit");
  const concrete = solid(C.concrete, { rough: 0.86 });
  concrete.userData.finish = false;
  const kerbL = addMesh(pit, box(KERB, 8, LEN, 1.2).translate(-HALF - KERB / 2, 2, -LEN / 2), concrete, { edgeOpacity: 0.45 });
  addMesh(pit, box(KERB, 8, LEN, 1.2).translate(HALF + KERB / 2, 2, -LEN / 2), concrete, { edgeOpacity: 0.45 });
  const walls = new THREE.Group();
  pit.add(walls);
  for (const geo of [box(15, 88, LEN, 0.6).translate(HALF + 7.5, -46, -LEN / 2), box(2 * HALF + 15, 82, 15, 0.6).translate(7.5, -49, 7.5), box(2 * HALF + 15, 88, 15, 0.6).translate(7.5, -46, -LEN - 7.5)]) {
    walls.add(addMesh(pit, geo, concrete, { edgeOpacity: 0.35 }));
  }
  const lipOf = { color: BRAND.veille, width: 2.6, opacity: 0.5, hdr: 1.5 };
  // the left lip in three pieces: on the bench the middle one goes with the cut-away
  const lipL = [[-1, NOTCH.z1], [NOTCH.z1, NOTCH.z0], [NOTCH.z0, -LEN + 1]].map(([a, b]) => fatLine([[-HALF - 0.6, 6.4, a], [-HALF - 0.6, 6.4, b]], lipOf));
  const lipR = fatLine([[HALF + 0.6, 6.4, -1], [HALF + 0.6, 6.4, -LEN + 1]], lipOf);
  const lipHead = fatLine([[-HALF, 0.7, 0.4], [HALF, 0.7, 0.4]], lipOf); // where the bitumen stops
  const lips = [...lipL, lipR, lipHead];
  for (const l of lips) {
    pit.add(l);
    pit.userData.part.mats.add(l.material);
  }

  /* ── the gravel: a surface drawn by its shader, its four sides (cut faces), the cut-away's faces, the real pebbles ── */
  const gravel = makePart("gravel");
  const DEFORM_V = /* glsl */ `${GLSL_HASH}\n${GLSL_DEFORM}`;
  const surfaceHead = /* glsl */ `
    ${GLSL_HASH}
    ${GLSL_PEBBLES}
    uniform float uSheen; uniform float uRutGlow; uniform vec4 uNotch; uniform vec2 uCrush; uniform vec3 uVeille;
    varying vec3 vTa; varying vec3 vTb; varying float vRut;`;
  const surfaceVHead = /* glsl */ `${DEFORM_V}\nvarying vec3 vTa; varying vec3 vTb; varying float vRut;`;
  const notchCut = /* glsl */ `if (uNotch.y > uNotch.x && vO.x < uNotch.y && vO.z > uNotch.z && vO.z < uNotch.w) discard;`;
  const surfaceMat = spliced(solid(C.gravel, { rough: 0.82, env: 0.55 }), "sd027-gravel", U, {
    vhead: surfaceVHead,
    vnormal: /* glsl */ `vec3 objectNormal = sdDeformNormal(position.xz);
    #ifdef USE_TANGENT
      vec3 objectTangent = vec3(tangent.xyz);
    #endif`,
    vbody: /* glsl */ `
      float sdH = sdDeform(position.xz);
      transformed.y += sdH;
      vRut = sdH;
      vTa = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
      vTb = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));`,
    head: surfaceHead,
    discard: notchCut,
    color: /* glsl */ `
    {
      float cm = uCrush.y * step(8.0, vO.x) * smoothstep(uCrush.x - 40.0, uCrush.x + 40.0, vO.z) * step(${f(-DEMO.len)}, vO.z);
      float fw = max(fwidth(vO.x), fwidth(vO.z));
      if (cm > 0.5) sdCrush(vO.xz, fw); else sdRound(vO.xz, fw);
      sdCm = cm;
      diffuseColor.rgb *= sdAlb * mix(1.0, 0.5, cm); // the crushed stone is a step darker: two halves, two greys
    }`,
    rough: /* glsl */ `roughnessFactor = clamp(roughnessFactor + 0.18 * (1.0 - sdTop), 0.0, 1.0);`,
    normal: TILT,
    emissive: /* glsl */ `
    {
      float rut = clamp(-vRut / 14.0, 0.0, 1.0) + clamp(vRut / 9.0, 0.0, 1.0) * 0.8;
      totalEmissiveRadiance += uVeille * (uSheen * (0.35 + 0.65 * sdTop) * (1.0 - 0.8 * sdCm) + uRutGlow * rut);
    }`,
  });
  // the bed's surface: dense columns where the ruts run (|x| 50…170), dense rows over the first 44 m
  const surface = (() => {
    const xs = [];
    const run = (a, b, step) => {
      for (let x = a; x < b - 1e-6; x += step) xs.push(x);
    };
    run(-HALF, -170, 11);
    run(-170, -50, 2.5);
    run(-50, 50, 10);
    run(50, 170, 2.5);
    run(170, HALF, 11);
    xs.push(HALF);
    const zs = [];
    for (let z = 0; z > -4400; z -= 4) zs.push(z);
    for (let z = -4400; z > -LEN; z -= 40) zs.push(z);
    zs.push(-LEN);
    const nx = xs.length;
    const pos = new Float32Array(nx * zs.length * 3);
    const nrm = new Float32Array(nx * zs.length * 3);
    let k = 0;
    for (const z of zs) for (const x of xs) {
      pos[k] = x;
      pos[k + 2] = z;
      nrm[k + 1] = 1;
      k += 3;
    }
    const idx = [];
    for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i;
      idx.push(a, a + 1, a + nx, a + 1, a + nx + 1, a + nx);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
    g.setIndex(idx);
    return g;
  })();
  const surfaceMesh = addMesh(gravel, surface, surfaceMat, { edges: false });
  surfaceMesh.frustumCulled = false;
  surfaceMesh.castShadow = true;
  surfaceMesh.customDepthMaterial = depthOf("sd027-gravel", U, DEFORM_V, `transformed.y += sdDeform(position.xz);`, `uniform vec4 uNotch;`, notchCut);

  // the cut faces of the gravel: pebbles in the face's own plane; the section's face round the tyre pushes them aside
  const faceHead = /* glsl */ `
    ${GLSL_HASH}
    ${GLSL_PEBBLES}
    uniform float uSheen; uniform vec4 uNotch; uniform vec3 uVeille; uniform vec4 uWarp;
    varying vec3 vTa; varying vec3 vTb; varying vec2 vF;`;
  // round the hero tyre's buried arc (the section's face only): the pebbles pushed away from it, a dark seam along it
  const faceColor = /* glsl */ `
    {
      vec2 p = vF;
      float seam = 0.0;
      if (uWarp.w > 0.5) {
        vec2 dv = p - uWarp.xy;
        float dl = length(dv);
        float out_ = abs(dl - ${f(R)});
        p -= dv / max(dl, 1e-3) * uWarp.z * exp(-out_ / 10.0) * sign(dl - ${f(R)});
        seam = exp(-out_ / 3.0) * step(p.y, uWarp.y) * smoothstep(0.0, 3.0, uWarp.z);
      }
      sdRound(p, max(fwidth(p.x), fwidth(p.y)));
      diffuseColor.rgb *= sdAlb * 0.92 * (1.0 - 0.7 * seam);
    }`;
  const faceEmissive = /* glsl */ `totalEmissiveRadiance += uVeille * uSheen * 0.6 * (0.35 + 0.65 * sdTop);`;
  const faceMat = spliced(solid(C.gravel, { rough: 0.85, env: 0.7 }), "sd027-face", U, {
    vhead: /* glsl */ `varying vec3 vTa; varying vec3 vTb; varying vec2 vF;`,
    vbody: /* glsl */ `
      vec3 an = abs(normal);
      vF = an.x > 0.5 ? position.zy : (an.z > 0.5 ? position.xy : position.xz);
      vTa = normalize(normalMatrix * (an.x > 0.5 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0)));
      vTb = normalize(normalMatrix * (an.y > 0.5 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0)));`,
    head: faceHead,
    discard: /* glsl */ `if (uNotch.y > uNotch.x && vO.x < uNotch.y - 0.5 && vO.z > uNotch.z && vO.z < uNotch.w) discard;`,
    color: faceColor,
    normal: TILT,
    emissive: faceEmissive,
  });
  // a vertical face: a (top) → b (bottom) along one side, then the other; it faces (b − a) × (c − a)
  const quad = (a, b, c, d) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
    g.computeVertexNormals();
    return g;
  };
  const top = -0.05;
  const bottom = -BED.depth;
  const sides = mergeGeometries([
    quad([-HALF, top, -LEN], [-HALF, bottom, -LEN], [-HALF, bottom, 0], [-HALF, top, 0]), // left, facing −x (the bench's cut)
    quad([HALF, top, 0], [HALF, bottom, 0], [HALF, bottom, -LEN], [HALF, top, -LEN]), //     right, facing +x
    quad([-HALF, top, 0], [-HALF, bottom, 0], [HALF, bottom, 0], [HALF, top, 0]), //         the head, facing +z
    quad([HALF, top, -LEN], [HALF, bottom, -LEN], [-HALF, bottom, -LEN], [-HALF, top, -LEN]), // the end, facing −z
  ]);
  const sideMesh = addMesh(gravel, sides, faceMat, { edges: false });
  // the cut-away's three faces, built in the shader from the opening (uNotch) and the surface's shape
  const sectionMat = spliced(solid(C.gravel, { rough: 0.85, env: 0.7 }), "sd027-section", U, {
    vhead: /* glsl */ `${DEFORM_V}\nattribute vec3 aSec; uniform vec4 uNotch; varying vec3 vTa; varying vec3 vTb; varying vec2 vF;`,
    vnormal: /* glsl */ `vec3 objectNormal = aSec.z < 0.5 ? vec3(-1.0, 0.0, 0.0) : (aSec.z < 1.5 ? vec3(0.0, 0.0, -1.0) : vec3(0.0, 0.0, 1.0));`,
    vbody: /* glsl */ `
      {
        float x = aSec.z < 0.5 ? uNotch.y : mix(uNotch.x, uNotch.y, aSec.x);
        float z = aSec.z < 0.5 ? mix(uNotch.z, uNotch.w, aSec.x) : (aSec.z < 1.5 ? uNotch.w : uNotch.z);
        float yTop = sdDeform(vec2(x, z));
        transformed = vec3(x, mix(${f(-BED.depth)}, yTop, aSec.y), z);
        vF = aSec.z < 0.5 ? transformed.zy : transformed.xy;
        vTa = normalize(normalMatrix * (aSec.z < 0.5 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0)));
        vTb = normalize(normalMatrix * vec3(0.0, 1.0, 0.0));
      }`,
    head: faceHead,
    color: faceColor,
    normal: TILT,
    emissive: faceEmissive,
  });
  const sectionGeo = (() => {
    const pos = [];
    const sec = [];
    const strip = (id, nu, nv) => {
      for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
        const u0 = i / nu;
        const u1 = (i + 1) / nu;
        const v0 = j / nv;
        const v1 = (j + 1) / nv;
        // counter-clockwise seen from the opening (face 0 seen from −x has +z on its right; face 1 from −z has −x; face 2 from +z, +x)
        const quadUV = id === 1 ? [[u0, v0], [u0, v1], [u1, v1], [u0, v0], [u1, v1], [u1, v0]] : [[u0, v0], [u1, v0], [u1, v1], [u0, v0], [u1, v1], [u0, v1]];
        for (const [u, v] of quadUV) {
          pos.push(0, 0, 0);
          sec.push(u, v, id);
        }
      }
    };
    strip(0, 300, 24);
    strip(1, 60, 24);
    strip(2, 60, 24);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aSec", new THREE.Float32BufferAttribute(sec, 3));
    return g;
  })();
  const sectionMesh = addMesh(gravel, sectionGeo, sectionMat, { edges: false });
  sectionMesh.frustumCulled = false;
  sectionMat.side = THREE.DoubleSide;

  /* ── the pebbles that stand up: windows of instances on the lattice ── */
  const GRAIN_HEAD = /* glsl */ `
    ${DEFORM_V}
    attribute vec2 aCell;
    uniform vec4 uWin;   // first column, first row (lattice cells), columns, rows
    uniform vec4 uBox;   // x0, z0, x1, z1 (cm): where these grains live; they sink away at its edges
    uniform vec4 uHide;  // where another window's grains take over
    uniform vec4 uNotch; // the cut-away
    uniform vec2 uCrush; // the crushed half's front; 1: these grains only show there
    uniform float uShow;
    uniform float uTumble; // 0: river pebbles lie flat (turned about the vertical, tilted a little) · 1: crushed stone, any way up
    mat3 sdQuat(vec4 q) {
      float x = q.x, y = q.y, z = q.z, w = q.w;
      return mat3(1.0 - 2.0 * (y * y + z * z), 2.0 * (x * y + w * z), 2.0 * (x * z - w * y),
                  2.0 * (x * y - w * z), 1.0 - 2.0 * (x * x + z * z), 2.0 * (y * z + w * x),
                  2.0 * (x * z + w * y), 2.0 * (y * z - w * x), 1.0 - 2.0 * (x * x + y * y));
    }
    mat3 sdAxis(vec3 k, float t) {
      float c = cos(t), s = sin(t), C = 1.0 - c;
      return mat3(c + k.x * k.x * C, k.y * k.x * C + k.z * s, k.z * k.x * C - k.y * s,
                  k.x * k.y * C - k.z * s, c + k.y * k.y * C, k.z * k.y * C + k.x * s,
                  k.x * k.z * C + k.y * s, k.y * k.z * C - k.x * s, c + k.z * k.z * C);
    }
    void sdGrain(out vec3 T, out mat3 Rm, out vec3 Sh, out float size, out float tint) {
      float cx = uWin.x + mod(aCell.x - uWin.x, uWin.z);
      float cz = uWin.y + mod(aCell.y - uWin.y, uWin.w);
      vec4 h = sdHash4(vec2(cx, cz));
      vec4 h2 = sdHash4(vec2(cx, cz) + 71.3);
      vec2 rest = (vec2(cx, cz) + 0.5 + (h.xy - 0.5) * 0.7) * ${f(CELL)};
      float r = ${f(CELL)} * (0.36 + 0.22 * h.z);
      vec3 pm = sdPush(rest, h2.x);
      float e = min(min(rest.x - uBox.x, uBox.z - rest.x), min(rest.y - uBox.y, uBox.w - rest.y));
      float show = smoothstep(0.0, ${f(4 * CELL)}, e) * uShow;
      if (uNotch.y > uNotch.x && pm.x < uNotch.y && pm.y > uNotch.z && pm.y < uNotch.w) show = 0.0;
      if (rest.x > uHide.x && rest.x < uHide.z && rest.y > uHide.y && rest.y < uHide.w) show = 0.0;
      show *= mix(1.0, smoothstep(uCrush.x - 40.0, uCrush.x + 40.0, rest.y) * step(8.0, rest.x), uCrush.y);
      Sh = mix(vec3(1.0, 0.6 + 0.2 * h2.y, 0.76 + 0.24 * h2.z), vec3(1.0, 0.68 + 0.22 * h2.y, 0.8 + 0.2 * h2.z), uTumble);
      size = r * show;
      float u1 = h2.w;
      float a2 = h.w * 6.2832;
      float a3 = fract(h.w * 7.31 + h2.x) * 6.2832;
      mat3 Rq = uTumble > 0.5
        ? sdQuat(vec4(sqrt(1.0 - u1) * sin(a2), sqrt(1.0 - u1) * cos(a2), sqrt(u1) * sin(a3), sqrt(u1) * cos(a3)))
        : sdAxis(vec3(0.0, 1.0, 0.0), a2) * sdAxis(vec3(1.0, 0.0, 0.0), (u1 - 0.5) * 0.7) * sdAxis(vec3(0.0, 0.0, 1.0), (a3 / 6.2832 - 0.5) * 0.6);
      vec2 mv = pm.xy - rest;
      float ml = length(mv);
      Rm = ml > 1e-3 ? sdAxis(normalize(vec3(mv.y, 0.0, -mv.x)), pm.z / max(r, 0.1)) * Rq : Rq;
      float lift = 0.45 * r * smoothstep(0.5, 8.0, pm.z);
      T = vec3(pm.x, sdDeform(pm.xy) + 0.5 * Sh.y * size + lift - (1.0 - show) * 2.0 * r, pm.y);
      tint = (0.74 + 0.4 * h2.z) * (h2.x < 0.16 ? 0.72 : 1.0);
    }`;
  const grainUniforms = (extra) => ({ ...U, uWin: { value: new THREE.Vector4() }, uBox: { value: new THREE.Vector4() }, uHide: { value: new THREE.Vector4() }, uShow: { value: 0 }, uCrushOnly: { value: 0 }, ...extra });
  const makeGrains = (name, geo, color, rough, cols, rows, crushOnly) => {
    const GU = grainUniforms();
    GU.uCrush = { value: new THREE.Vector2(0, crushOnly ? 1 : 0) };
    GU.uTumble = { value: crushOnly ? 1 : 0 };
    const vbody = /* glsl */ `
      vec3 sdT; mat3 sdR; vec3 sdS; float sdSize; float sdTint;
      sdGrain(sdT, sdR, sdS, sdSize, sdTint);
      transformed = sdR * (position * sdS * sdSize) + sdT;`;
    const mat = spliced(solid(color, { rough, env: 0.75 }), `sd027-${name}`, GU, {
      vhead: `${GRAIN_HEAD}\nvarying float vTint;`,
      vnormal: /* glsl */ `
        vec3 objectNormal;
        {
          vec3 gT; mat3 gR; vec3 gS; float gSize; float gTint;
          sdGrain(gT, gR, gS, gSize, gTint);
          objectNormal = normalize(gR * (normal / gS));
          vTint = gTint;
        }
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3(tangent.xyz);
        #endif`,
      vbody,
      head: /* glsl */ `uniform float uSheen; uniform vec3 uVeille; varying float vTint;`,
      color: /* glsl */ `diffuseColor.rgb *= vTint;`,
      emissive: /* glsl */ `totalEmissiveRadiance += uVeille * uSheen * 0.7;`,
    });
    const count = cols * rows;
    const cells = new Float32Array(count * 2);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      cells[(j * cols + i) * 2] = i;
      cells[(j * cols + i) * 2 + 1] = j;
    }
    const g = geo.clone();
    g.setAttribute("aCell", new THREE.InstancedBufferAttribute(cells, 2));
    const mesh = new THREE.InstancedMesh(g, mat, count);
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.customDepthMaterial = depthOf(`sd027-${name}`, GU, GRAIN_HEAD, vbody);
    return { mesh, mat, GU, cols, rows };
  };
  // a round pebble: a lumpy ball (seeded), smooth; a crushed one: a hull of a few points, flat facets
  const pebbleGeo = (detail, seed) => {
    const rand = rng(seed);
    let g = new THREE.IcosahedronGeometry(1, detail);
    g.deleteAttribute("uv");
    g.deleteAttribute("normal");
    g = mergeVertices(g, 1e-4);
    const p = g.attributes.position;
    const lumps = Array.from({ length: 5 }, () => [new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(), 0.06 + 0.08 * rand()]);
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).normalize();
      let k = 1;
      for (const [dir, amp] of lumps) k += amp * Math.max(0, v.dot(dir)) ** 2 - amp * 0.3;
      v.multiplyScalar(k);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  };
  const crushedGeo = (seed) => {
    // a chunk: the corners of a box knocked about, and two more points — big facets, sharp edges
    const rand = rng(seed);
    const pts = [];
    for (const x of [-1, 1]) for (const y of [-0.8, 0.8]) for (const z of [-0.9, 0.9]) pts.push(new THREE.Vector3(x * (0.7 + 0.35 * rand()), y * (0.7 + 0.35 * rand()), z * (0.7 + 0.35 * rand())));
    pts.push(new THREE.Vector3(1.15, 0.2 * rand(), 0.1), new THREE.Vector3(-0.2, 1.0, 0.5 * rand()));
    const g = new ConvexGeometry(pts);
    g.deleteAttribute("uv");
    return g;
  };
  const heroGrains = makeGrains("grains-hero", pebbleGeo(0, 11), C.gravel, 0.6, 112, 152, false);
  const macroRound = makeGrains("grains-round", pebbleGeo(1, 13), C.gravel, 0.58, 72, 72, false);
  const macroCrushed = makeGrains("grains-crushed", crushedGeo(17), C.crushed, 0.74, 72, 72, true);
  for (const G of [heroGrains, macroRound, macroCrushed]) {
    gravel.add(G.mesh);
    gravel.userData.part.mats.add(G.mat);
  }
  const setWindow = (G, xMin, zMin, show, clip = true) => {
    const c0 = Math.floor(xMin / CELL);
    const r0 = Math.floor(zMin / CELL);
    G.GU.uWin.value.set(c0, r0, G.cols, G.rows);
    const x1 = (c0 + G.cols) * CELL;
    const z1 = (r0 + G.rows) * CELL;
    if (clip) G.GU.uBox.value.set(Math.max(c0 * CELL, -HALF + 1.5), Math.max(r0 * CELL, -LEN + 2), Math.min(x1, HALF - 1.5), Math.min(z1, -1.5));
    else G.GU.uBox.value.set(c0 * CELL, r0 * CELL, x1, z1);
    G.GU.uShow.value = show;
    G.mesh.visible = show > 0.004;
  };
  // the macro patches stand still (VIEW.grains: 4 m into the bed, on the hero's line and on the twin's)
  setWindow(macroRound, -DEMO.lane - 45, DEMO_Z - 45, 0);
  setWindow(macroCrushed, DEMO.lane - 45, DEMO_Z - 45, 0);
  const gravelParts = [surfaceMesh, sideMesh, sectionMesh];

  /* ── the concrete barrier (GBA profile) along the bed's right side ── */
  const rail = makePart("rail");
  const x0 = RX - RAIL.w / 2;
  const gba = [[x0, -6], [x0 + RAIL.w, -6], [x0 + RAIL.w - 2, RAIL.h], [x0 + 23, RAIL.h], [x0 + 19.5, 33], [x0 + 1.2, 7.5], [x0, 7.5]];
  const railZ0 = 400;
  const railLen = railZ0 - ZE;
  addMesh(rail, plate(gba, railLen, { bevel: 1.2 }).translate(0, 0, ZE), solid(C.concrete, { rough: 0.85 }), { edgeOpacity: 0.5 });
  rail.children.forEach((m) => m.material && (m.material.userData.finish = false));
  const railLamp = lampOf(rail);

  /* ── the earth mound that closes the bed ── */
  const berm = makePart("berm");
  const earth = solid(C.earth, { rough: 1, env: 0.5 });
  earth.userData.finish = false;
  const bermScene = addMesh(berm, moundGeometry(-HALF - 40, HALF + 40, true), earth, { edgeOpacity: 0.3, threshold: 40 });
  const bermBench = addMesh(berm, moundGeometry(-HALF, HALF + 40, false), earth, { edgeOpacity: 0.3, threshold: 40 });
  const bermLamp = lampOf(berm);

  /* ── the scene: the lane's platform (its shoulders), the footprint col.js leaves us ── */
  const ground = makePart("ground");
  {
    const out = [[ROAD_R, ZA], [ROAD_R, ZB]];
    // along the road's right edge round the bend, until it leaves the footprint (x = −400)
    for (let i = 1; i <= 12; i++) {
      const s = CURVE.s + (i / 12) * 7.66;
      const rr = (CURVE.r + ROAD.w / 2) ** 2 - (100 * (s - CURVE.s)) ** 2;
      out.push([LX(-175 - CURVE.r + Math.sqrt(Math.max(rr, 0))), L(s)]);
    }
    out.push([-400, -3281], [-350, -3800], [-281, -7500], [365, -7500], [365, ZA]);
    const hole = [[-HALF - KERB, 0], [-HALF - KERB, -LEN], [HALF + KERB, -LEN], [HALF + KERB, 0]];
    const groundMat = solid(C.ground, { rough: 0.97, env: 0.45 });
    groundMat.userData.finish = false;
    addMesh(ground, slab(out, -6, -2, [hole], 0.3), groundMat, { edgeOpacity: 0.3 });
  }

  /* ── the bench: the block of ground under the lane, cut along the bed's left edge ── */
  const block = makePart("block");
  {
    const outer = [[LX(-175) - 15, ribbonZ0 + 200], [20, ribbonZ0 + 200], [365, ZA], [365, -7450], [-HALF, -7450]];
    const upper = [...outer, [-HALF, -LEN - 15], [HALF + 15, -LEN - 15], [HALF + 15, 15], [-HALF - 1.5, 15], [ROAD_R, ZB], [LX(-175) - 15, ZB]];
    const lower = [...outer, [-HALF, 0], [ROAD_R, ZB], [LX(-175) - 15, ZB]];
    const blockMat = solid(C.earth, { rough: 1, env: 0.45 });
    blockMat.userData.finish = false;
    addMesh(block, slab(upper, -BED.depth, -2), blockMat, { edgeOpacity: 0.4 });
    addMesh(block, slab(lower, -BED.depth - 30, -BED.depth), blockMat, { edgeOpacity: 0.4 });
  }

  /* ── the bench: the comparison — the right half crushed, its divider, the twin wheel ── */
  const crushed = makePart("crushed");
  const divider = addMesh(crushed, box(18, 112, DEMO.len, 1.5).translate(0, -36, -DEMO.len / 2), solid(0x80858a, { rough: 0.85 }), { edgeOpacity: 0.5 });
  divider.material.userData.finish = false;
  crushed.add(macroCrushed.mesh);
  crushed.userData.part.mats.add(macroCrushed.mat);
  const twinPart = makePart("twin");
  const twin = makeWheel({ brake: false });
  twinPart.add(twin.group);
  for (const p of Object.values(twin.parts)) for (const m of p.userData.part.mats) twinPart.userData.part.mats.add(m);

  /* ── THE HERO WHEEL ── */
  const hero = makeWheel({ brake: true });
  const wheel = hero.group;

  root.add(panel, access, roadEdge, pit, gravel, rail, berm, ground, block, crushed, twinPart);
  const benchWheel = new THREE.Object3D();
  root.add(benchWheel);
  const parts = { panel, access, roadEdge, pit, gravel, rail, berm, crushed, twin: twinPart, ...hero.parts, ground, block };

  const A = {
    panel: anchor(panel, PX, plateY, PZ + 2),
    access: anchor(access, (ROAD_R + HALF) / 2, 0, ZA / 3),
    gravel: anchor(gravel, 0, 0, -1600),
    rail: anchor(rail, RX, RAIL.h, -1600),
    berm: anchor(berm, 0, BERM.h, -LEN - 360),
    round: anchor(root, -DEMO.lane, 0, -DEMO.len / 2),
    crushed: anchor(crushed, DEMO.lane, 0, -DEMO.len / 2),
    section: anchor(root, NOTCH.x1 - 1, -45, -100 * DEMO.round),
    benchWheel,
    twin: twin.group,
    drum: anchor(wheel, 16, 0, 0),
    shoe: anchor(wheel, 16, ...polar(20.9, 75)),
    tyre: anchor(wheel, 0, -R + SINK, -Math.sqrt(2 * R * SINK - SINK * SINK)),
  };

  // the exploded view on the bench: [part, lift, sideways, delay]
  const EXPLODE = [[panel, 400, 0, 0], [access, 230, 0, 0.12], [gravel, 900, 0, 0.24], [rail, 450, 450, 0.36], [berm, 700, 0, 0.48]];
  const reach = (d) => Math.sqrt(Math.max(2 * R * d - d * d, 0));
  const [T0, T1] = U.uTrk.value;
  const [B0, B1] = U.uTrkB.value;
  const W = U.uWave.value;
  const last = { bench: -1 };

  return {
    root, wheel, A, parts,
    update(P, time, px) {
      void time;
      void px;
      const bench = P.bench ? 1 : 0;
      const laneLit = clamp01(P.laneLit ?? 0);

      // what belongs to one set only
      if (last.bench !== bench) {
        last.bench = bench;
        ground.visible = !bench;
        kerbL.visible = !bench;
        walls.visible = !!bench;
        for (const l of lipL) l.position.y = bench ? -5.8 : 0;
        bermScene.visible = !bench;
        bermBench.visible = !!bench;
      }
      setPartOpacity(block, bench);
      setPartOpacity(roadEdge, bench);

      // the exploded view (the bench only): each part rises in its own window, the barrier steps aside
      const e = bench ? clamp01(P.explode ?? 0) : 0;
      for (const [part, lift, side, delay] of EXPLODE) {
        const u = settle(clamp01((e - delay) / 0.52));
        part.position.set(side * u, lift * u, 0);
      }

      // the parts the voice names, and the lane alive
      light(panelLamp, clamp01(P.litPanel ?? 0));
      light(accessLamp, clamp01(P.litAccess ?? 0));
      light(railLamp, clamp01(P.litRail ?? 0));
      light(bermLamp, clamp01(P.litBerm ?? 0));
      const pk = Math.max(laneLit, clamp01(P.litPanel ?? 0));
      setGlow(chequerMat, 0.32 + 1.3 * pk);
      setGlow(branchMat, 0.32 + 1.3 * pk);
      for (const l of lips) l.material.opacity = 0.18 + 0.72 * laneLit;
      U.uSheen.value = 0.018 + 0.055 * laneLit + 0.12 * clamp01(P.litGravel ?? 0);

      // the comparison: the right half fills with crushed stone from the head, the divider rises, the twin rolls in
      const cr = bench ? clamp01(P.crushed ?? 0) : 0;
      const crE = smooth(cr);
      U.uCrush.value.set(-DEMO.len * crE - 40 * (1 - crE), cr > 0.001 ? 1 : 0);
      setPartOpacity(crushed, cr > 0.001 ? 1 : 0);
      divider.position.y = -22 * (1 - smooth(ramp(cr, 0, 0.6)));
      macroCrushed.GU.uCrush.value.set(U.uCrush.value.x, 1);
      macroCrushed.GU.uShow.value = cr > 0.001 ? 1 : 0;
      macroCrushed.mesh.visible = cr > 0.001;

      // the tyres' work on the gravel: ruts, lips, bow waves
      const sink = clamp01(P.sink ?? 0);
      let heroX;
      let heroZ;
      let heroOn;
      if (!bench) {
        const dF = SINK * sink * inBed(P.s);
        const zF = L(P.s);
        const dD = SINK * sink * inBed(P.s - AXLES[1]);
        const zD = L(P.s - AXLES[1]);
        T0.set(-TRUCK.track / 2, zF, dF, HW1);
        T1.set(TRUCK.track / 2, zF, dF, HW1);
        B0.set(zD, HW2, RAMP, 0);
        B1.set(zD, HW2, RAMP, 0);
        W[0].set(-TRUCK.track / 2, zF - reach(dF), 0.38 * dF, HW1);
        W[1].set(TRUCK.track / 2, zF - reach(dF), 0.38 * dF, HW1);
        W[2].set(-TRUCK.track / 2, zD - reach(dD), 0.2 * dD, HW2);
        W[3].set(TRUCK.track / 2, zD - reach(dD), 0.2 * dD, HW2);
        W[4].z = 0;
        W[5].z = 0;
        heroX = -TRUCK.track / 2;
        heroZ = zF;
        heroOn = inBed(P.s) > 0.001 ? 1 : 0;
      } else {
        const d = SINK * sink;
        const on = clamp01(P.wheelIn ?? 0) > 0.01 ? 1 : 0;
        const twinOn = cr * clamp01(P.wheelIn ?? 0) > 0.01 ? 1 : 0;
        T0.set(-DEMO.lane, -100 * P.benchS, d * on, HW1);
        T1.set(DEMO.lane, -100 * P.twinS, d * twinOn, HW1);
        B0.set(1e5, HW1, RAMP, 0);
        B1.set(1e5, HW1, RAMP, 0);
        W[0].set(-DEMO.lane, -100 * P.benchS - reach(d), 0.38 * d * on, HW1);
        W[1].set(DEMO.lane, -100 * P.twinS - reach(d), 0.38 * d * twinOn, HW1);
        W[2].z = W[3].z = W[4].z = W[5].z = 0;
        heroX = -DEMO.lane;
        heroZ = -100 * P.benchS;
        heroOn = on;
      }
      // the window of real pebbles round the hero tyre; the macro patch gives way to it where they meet
      setWindow(heroGrains, heroX - 70, heroZ - 125, heroOn);
      const hb = heroGrains.GU.uBox.value;
      if (bench && heroOn) macroRound.GU.uHide.value.copy(hb);
      else macroRound.GU.uHide.value.set(0, 0, 0, 0);
      macroRound.GU.uShow.value = bench;
      macroRound.mesh.visible = !!bench;

      // the cut-away (the bench): the face sweeps in from the bed's left edge to the hero wheel's middle
      const sec = bench ? smooth(clamp01(P.section ?? 0)) : 0;
      if (sec > 0.001) U.uNotch.value.set(NOTCH.x0, NOTCH.x0 + (NOTCH.x1 - NOTCH.x0) * sec, NOTCH.z0, NOTCH.z1);
      else U.uNotch.value.set(0, 0, 0, 0);
      sectionMesh.visible = sec > 0.001;
      lipL[1].visible = sec <= 0.001;
      U.uRutGlow.value = bench ? 0.32 : 0.22;
      U.uWarp.value.set(-100 * P.benchS, R - SINK * sink, 9 * smooth(ramp(sink, 0.4, 1)), sec > 0.001 ? 1 : 0);

      // the wheels: the hero on the truck (scene) or on its mount (bench), the twin on the bench
      const heat = bench ? 0 : clamp01(P.heat ?? 0);
      let spinRad;
      let tread;
      let holes;
      if (!bench) {
        spinRad = (100 * P.s) / R;
        const deg = ((((P.kmh ?? 0) / 3.6 / SLOWMO) * 100) / R / 30) * (180 / Math.PI); // degrees a frame
        tread = 1 - smooth(ramp(deg, 1.5, 4));
        holes = 1 - smooth(ramp(deg, 7, 13));
      } else {
        spinRad = (100 * P.benchS) / R;
        const fast = smooth(ramp(P.benchS, 0.05, 0.6)) * (1 - smooth(ramp(P.benchS, DEMO.round - 1.5, DEMO.round - 0.1)));
        tread = 1 - fast;
        holes = 1 - fast;
      }
      const heroShow = bench ? clamp01(P.wheelIn ?? 0) : 1;
      hero.update(spinRad, tread, holes, heat, clamp01(P.pedal ?? 0), clamp01(P.cutaway ?? 0), heroShow);
      benchWheel.position.set(-DEMO.lane, R - SINK * sink, -100 * P.benchS);
      const twinShow = bench ? cr * clamp01(P.wheelIn ?? 0) : 0;
      const tf = smooth(ramp(P.twinS, 0.05, 0.6)) * (1 - smooth(ramp(P.twinS, DEMO.crushed - 2.5, DEMO.crushed - 0.1)));
      twin.update((100 * P.twinS) / R, 1 - tf, 1 - tf, 0, 0, 0, twinShow);
      twinPart.position.set(DEMO.lane, R - SINK * sink, -100 * P.twinS);
      setPartOpacity(twinPart, twinShow);
      for (const m of gravelParts) m.visible = m !== sectionMesh || sec > 0.001;
    },
  };
}

/* ─────────────────────────────────────────────────────────── a named part glows faintly veille (the 017's lamps) */
function lampOf(...parts) {
  const mats = parts.flatMap((part) => [...part.userData.part.mats]);
  const lines = mats.filter((mat) => mat.isLineMaterial);
  for (const l of lines) l.userData.rest = l.color.clone();
  const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
  for (const mat of solids) {
    mat.userData.rest = mat.color.clone();
    mat.userData.tint = mat.color.clone().multiply(TINT);
    mat.userData.glow = 0.12 * (1 - 0.8 * Math.min(1, lum(mat.color)));
  }
  return { solids, lines, k: -1 };
}
function light(lamp, k) {
  if (lamp.k === k) return;
  lamp.k = k;
  for (const mat of lamp.solids) {
    mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k);
    mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.6 * k);
  }
  for (const l of lamp.lines) l.color.copy(l.userData.rest).lerp(VEILLE, 0.6 * k);
}
void INK;
