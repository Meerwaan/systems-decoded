// DOSSIER 013 — Halo : the track, the triple steel barrier, the fire.
//
// The frame is the car's (plan.js): it is the barrier that comes. `slide` is the barrier's own frame — its origin
// on the car's axis, at z = cross + 100·ahead, turned 29° — and in it  x = n  across the barrier (+n: the track
// side, where the car comes from; −n: the side it comes out of, where the camera stands) and  z = s  along it.
// The car's axis always goes through that origin: the breach is a FIXED stretch of the barrier, the car slides
// through it along (−sin 29°, cos 29°).
//
//   the track    no slab (an X-ray set): a grid, the white line of the track's edge and the run-off, parallel to
//                the barrier; darker on the far side. It smears over its travel when it goes by fast.
//   the barrier  SOLID — it is the threat. Three W beams of galvanised steel on posts, spliced and bolted, running
//                off into the dark both ways. Their fine lines (lips, folds) are drawn by their own shader: they
//                follow the steel when it bends, and turn signal where it is struck.
//   the breach   wholly a function of `ahead` (3.75 → 0). It is SOLVED when the set is built, not tuned by hand:
//                for 76 values of `ahead`, each beam takes the smallest deformation that clears the car (an
//                envelope read off plan.js) — the top one lifts and rolls over the halo's ring, then comes to
//                rest on the main hoop; the middle one tears, its two ends peel away; the bottom one is laid flat
//                under the floor. The answer goes into a texture (s × ahead) the vertex shader reads: `update`
//                only writes uniforms and a few transforms.
//   the fire     a volume: slices that face the eye, depth-tested (your helmet and the halo stand in front of it),
//                laid OVER one another (never added: signal stays signal), a white-hot heart at its seat, held
//                back by the barrier except over the top beam. Its light is a real one (it has a place).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, box, cyl, chamfer, makePart, addMesh, setPartOpacity, mergeGeometries, placed, anchor } from "@kit/build3d.js";
import { RAIL, FIRE, CELL, HALO, HELMET, CAR, COCKPIT } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const BG = new THREE.Color(BRAND.bg);
const VIEW = new THREE.Vector2(BRAND.W, BRAND.H);
const FPS = 30;
const f = (x) => Number(x).toFixed(4);
const v3 = (c) => `vec3(${f(c.r)}, ${f(c.g)}, ${f(c.b)})`;

/* >>> SOLVER — pure JS, no three: plan.js in, tables out (the scratch harness runs this block alone) */

const DEG = Math.PI / 180;
const SIN = Math.sin(RAIL.angle * DEG);
const COS = Math.cos(RAIL.angle * DEG);
/** `ahead` runs from 0 to A1 in NA rows; s from S0 by steps of DS in NS columns: the wound, and room around it. */
const A1 = RAIL.first;
const NA = 76;
const DA = A1 / (NA - 1);
const S0 = -480;
const DS = 2.5;
const NS = 385;
const H = RAIL.beamH / 2 - 1; // (drawn 2 cm short of their pitch: the dark gap between two beams is what says "three")
const D = RAIL.depth;
const [Y_LOW, Y_MID, Y_TOP] = RAIL.beams;
/** Where the middle beam tears, and where its two ends start to bend (a post stands at ±95). */
const TEAR = -15;
const HINGE_U = -93;
const HINGE_D = 113;
const L_U = TEAR - HINGE_U;
const L_D = HINGE_D - TEAR;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
/** 0 at a, 1 at b (either way round). */
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** 1 within `flat` of the centre, 0 past `zero`, a cosine shoulder between. */
const plateau = (d, flat, zero) => (d <= flat ? 1 : d >= zero ? 0 : 0.5 + 0.5 * Math.cos((Math.PI * (d - flat)) / (zero - flat)));

/** The W of a beam: [n, v] from its bottom lip to its top lip — two crests toward the track, the valley on the posts. */
const W = chamfer([[0, -H], [0.5, -H + 2.1], [D, -H + 5.1], [D, -H + 9.7], [0, -1.7], [0, 1.7], [D, H - 9.7], [D, H - 5.1], [0.5, H - 2.1], [0, H]], 1.5, 3);

/** A point of the barrier's frame, at `ahead` a → the car's (x, z). */
const carX = (n, s) => COS * n + SIN * s;
const carZ = (n, s, a) => RAIL.cross + 100 * a - SIN * n + COS * s;
/** The plough, seen from above: the nose cone, then the tub (taken at its full width early: we only know plan.js). */
const ploughHalf = (z) =>
  z >= CELL.z1 ? 4 + ((CELL.halfFront - 4) * (CAR.nose - z)) / (CAR.nose - CELL.z1) : z > CELL.z1 - 50 ? CELL.half - ((CELL.half - CELL.halfFront) * (z - (CELL.z1 - 50))) / 50 : CELL.half;
const inPlough = (n, s, a, m) => {
  const z = carZ(n, s, a);
  if (z > CAR.nose + m || z < CELL.z0 - m) return false;
  return Math.abs(carX(n, s)) < ploughHalf(Math.min(CAR.nose, Math.max(CELL.z0, z))) + m;
};
/** The halo's tube, as segments: the ring from one mount round to the other, and the foot. */
const RING = [...HALO.ring].reverse().map(([x, y, z]) => [-x, y, z]).concat(HALO.ring.slice(1));
const TUBES = RING.slice(1).map((p, i) => [RING[i], p]).concat([HALO.foot]);
const distSeg = (x, y, z, a, b) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const t = clamp01(((x - a[0]) * dx + (y - a[1]) * dy + (z - a[2]) * dz) / (dx * dx + dy * dy + dz * dz));
  return Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t, z - a[2] - dz * t);
};
/** Is this point of the car's frame inside something solid (grown by `m`)? The tub, the main hoop, your helmet, the halo. */
function hitsCar(x, y, z, m) {
  if (z < CAR.nose + m && z > CELL.z0 - m) {
    const zc = Math.min(CAR.nose, Math.max(CELL.z0, z));
    const top = zc > CELL.z1 ? CELL.topFront + 2 - ((CELL.topFront - 28) * (zc - CELL.z1)) / (CAR.nose - CELL.z1) : zc > COCKPIT.z1 ? CELL.rim + 2 - ((CELL.rim - CELL.topFront) * (zc - COCKPIT.z1)) / (CELL.z1 - COCKPIT.z1) : CELL.rim + 2;
    if (Math.abs(x) < ploughHalf(zc) + m && y < top + m && y > CELL.floor - 0.3) return true;
  }
  const hoop = CELL.hoop;
  if (Math.abs(x) < hoop.half + 1 + m && z > CELL.z0 - m && z < hoop.z + 8 + m && y < hoop.top + 1 + m) return true;
  if (Math.hypot(x - HELMET.c[0], y - HELMET.c[1], z - HELMET.c[2]) < HELMET.r + m) return true;
  for (const [p, q] of TUBES) if (distSeg(x, y, z, p, q) < HALO.r + m) return true;
  return false;
}

/* ── the top beam: lifted by `L`, rolled (its bottom lip toward the camera), pushed a little ── */
const TOP_ROLL = 0.72;
function topShape(s, a, L, out) {
  out[0] = -(3.5 * smooth(3.3, 1.9, a) + 7 * smooth(0.55, 0, a)) * plateau(Math.abs(s + 14), 26, 250);
  out[1] = L * plateau(Math.abs(s - 4), 72, 300);
  out[2] = 0;
  out[3] = -TOP_ROLL * smooth(3.45, 1.85, a) * plateau(Math.abs(s + 8), 55, 255) * (1 + 0.22 * Math.sin(s * 0.019 + 0.6));
  return out;
}
function topClear(a, L) {
  const d = [0, 0, 0, 0];
  for (let s = -150; s <= 150; s += DS) {
    topShape(s, a, L, d);
    const cr = Math.cos(d[3]);
    const sr = Math.sin(d[3]);
    for (const [pn, pv] of W) {
      const n = d[0] + pn * cr - pv * sr;
      const y = Y_TOP + d[1] + pn * sr + pv * cr;
      if (hitsCar(carX(n, s), y, carZ(n, s, a), 1.2)) return false;
    }
  }
  return true;
}

/* ── an end of the torn middle beam: a strip that keeps its length, bent at its hinge by `phi`, curled at its tip ── */
/** → [n, along] pairs every DS of its length (σ = 0 at the hinge). `along`: toward the tear. */
function flapLine(L, phi, curl, out) {
  let n = 0;
  let z = 0;
  out[0] = 0;
  out[1] = 0;
  for (let k = 1; k < out.length / 2; k++) {
    const sg = (k - 0.5) * DS;
    const psi = phi * smooth(0, 14, sg) + curl * Math.min(1, phi / 0.5) * Math.pow(smooth(0.4 * L, L, sg), 1.3);
    n -= Math.sin(psi) * DS;
    z += Math.cos(psi) * DS;
    out[2 * k] = n;
    out[2 * k + 1] = z;
  }
  return out;
}
/** `g`: +1 the upstream end (it runs toward +s), −1 the downstream one. Does it cut into the plough, seen from above? */
function flapHits(line, L, s0, g, a) {
  const K = Math.min(line.length / 2, Math.round((L + 8) / DS));
  for (let k = 6; k < K; k++) {
    const n = line[2 * k];
    const s = s0 + g * line[2 * k + 1];
    const tn = line[2 * k] - line[2 * k - 2];
    const ts = g * (line[2 * k + 1] - line[2 * k - 1]);
    const l = Math.hypot(tn, ts) || 1;
    for (const o of [-1.5, 4, 9.5]) if (inPlough(n + ((g * ts) / l) * o, s - ((g * tn) / l) * o, a, 3)) return true;
  }
  return false;
}

/** Everything the breach is, for every `ahead`. */
function solve() {
  const row = (j) => j * DA;
  /* the top beam's lift */
  const lift = new Float32Array(NA);
  for (let j = 0; j < NA; j++) {
    const a = row(j);
    let L = 11.5 * smooth(2.85, 1.75, a); // it is up before the halo gets there: the posts are being wrenched
    if (!topClear(a, L)) {
      let hi = 60;
      for (let it = 0; it < 14; it++) {
        const mid = (L + hi) / 2;
        if (topClear(a, mid)) hi = mid;
        else L = mid;
      }
      L = hi;
    }
    lift[j] = L;
  }
  // it rises a little early and never jerks: widen each need over its neighbours, then even it out
  const eased = (src, ahead, back, blur) => {
    const wide = src.map((_, j) => {
      let m = 0;
      for (let k = Math.max(0, j - back); k <= Math.min(NA - 1, j + ahead); k++) m = Math.max(m, src[k]);
      return m;
    });
    return wide.map((_, j) => {
      let sum = 0;
      let count = 0;
      for (let k = Math.max(0, j - blur); k <= Math.min(NA - 1, j + blur); k++) {
        sum += wide[k];
        count++;
      }
      return Math.max(src[j], sum / count);
    });
  };
  const liftEased = eased(lift, 3, 5, 3);

  /* the two ends of the middle beam: the smallest opening that clears the plough, never closing again */
  const KU = Math.round((L_U + 14) / DS) + 2;
  const KD = Math.round((L_D + 14) / DS) + 2;
  const phiU = new Float32Array(NA);
  const phiD = new Float32Array(NA);
  const CURL_U = 0.7;
  const CURL_D = 0.38;
  const lineU = new Float32Array(KU * 2);
  const lineD = new Float32Array(KD * 2);
  let pu = 0;
  let pd = 0;
  for (let j = NA - 1; j >= 0; j--) {
    const a = row(j) - 0.12 * smooth(A1, A1 - 0.4, row(j)); // a hand's width ahead of the car: steel gives way before it is gone through
    while (pu < 2.95 && flapHits(flapLine(L_U, pu, CURL_U, lineU), L_U, HINGE_U, 1, a)) pu += 0.01;
    while (pd < 2.95 && flapHits(flapLine(L_D, pd, CURL_D, lineD), L_D, HINGE_D, -1, a)) pd += 0.01;
    phiU[j] = Math.max(pu, 0.95 * smooth(3.62, 2.75, row(j))); // torn, the upstream end springs back toward the camera
    phiD[j] = pd;
  }
  // (at `first` the nose only touches: nothing has moved yet)
  const onset = (j) => smooth(A1, A1 - 0.15, row(j));
  const phiUe = eased(phiU, 0, 3, 2).map((p, j) => p * onset(j));
  const phiDe = eased(phiD, 0, 3, 2).map((p, j) => p * onset(j));

  /* the bottom beam: laid flat wherever the plough stands over it, and a ramp each side */
  const lay = new Float32Array(NA * NS);
  for (let j = NA - 1; j >= 0; j--) {
    const a = row(j) - 0.3 * smooth(A1, A1 - 0.5, row(j));
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < NS; i++) {
      const s = S0 + i * DS;
      let under = false;
      for (const n of [-31, -23, -15, -7, 1, 8]) under ||= inPlough(n, s, a, 6);
      if (under) {
        lo = Math.min(lo, s);
        hi = Math.max(hi, s);
      }
    }
    for (let i = 0; i < NS; i++) {
      const s = S0 + i * DS;
      const here = hi >= lo ? plateau(Math.max(lo - s, s - hi, 0), 12, 125) : 0;
      lay[j * NS + i] = Math.max(here, j < NA - 1 ? lay[(j + 1) * NS + i] : 0);
    }
  }

  /* the four fields (n, y, s of the centre line moved; roll), and what `update` reads row by row */
  const field = () => new Float32Array(NA * NS * 4);
  const top = field();
  const midU = field();
  const midD = field();
  const low = field();
  const tips = new Float32Array(NA * 8); // the two torn ends (n, y, s each), the top beam's lift on the axis, the bottom beam's lay there
  const d = [0, 0, 0, 0];
  for (let j = 0; j < NA; j++) {
    const a = row(j);
    flapLine(L_U, phiUe[j], CURL_U, lineU);
    flapLine(L_D, phiDe[j], CURL_D, lineD);
    const openU = Math.min(1, phiUe[j] / 0.6);
    const openD = Math.min(1, phiDe[j] / 0.6);
    for (let i = 0; i < NS; i++) {
      const s = S0 + i * DS;
      const o = (j * NS + i) * 4;
      top.set(topShape(s, a, liftEased[j], d), o);
      // upstream end: it peels up and leans its top toward the camera
      let sg = Math.min(s - HINGE_U, L_U + 14);
      if (sg > 0) {
        const k = Math.min(KU - 2, Math.floor(sg / DS));
        const u = sg / DS - k;
        const along = lineU[2 * k + 1] + (lineU[2 * k + 3] - lineU[2 * k + 1]) * u;
        const t = Math.min(1.15, sg / L_U);
        midU.set([lineU[2 * k] + (lineU[2 * k + 2] - lineU[2 * k]) * u, 12 * t * t * openU, HINGE_U + along - Math.min(s, TEAR + 14), 0.9 * t * openU], o);
      }
      // downstream end: shoved round by the nose, it droops
      sg = Math.min(HINGE_D - s, L_D + 14);
      if (sg > 0) {
        const k = Math.min(KD - 2, Math.floor(sg / DS));
        const u = sg / DS - k;
        const along = lineD[2 * k + 1] + (lineD[2 * k + 3] - lineD[2 * k + 1]) * u;
        const t = Math.min(1.15, sg / L_D);
        midD.set([lineD[2 * k] + (lineD[2 * k + 2] - lineD[2 * k]) * u, -6 * t * t * openD, HINGE_D - along - Math.max(s, TEAR - 14), -0.35 * t * openD], o);
      }
      const e = smooth(0, 1, lay[j * NS + i] * onset(j));
      const rho = (Math.PI / 2) * e;
      low.set([-14 * e, H * Math.cos(rho) + (Y_LOW - H) * (1 - e) - Y_LOW, 0, rho], o);
    }
    const kU = Math.round(L_U / DS);
    const kD = Math.round(L_D / DS);
    const axis = Math.round(-S0 / DS);
    tips.set([lineU[2 * kU], Y_MID + 12 * openU, HINGE_U + lineU[2 * kU + 1], lineD[2 * kD], Y_MID - 6 * openD, HINGE_D - lineD[2 * kD + 1], top[(j * NS + axis) * 4 + 1], lay[j * NS + axis] * onset(j)], j * 8);
  }
  return { top, midU, midD, low, tips, lift: liftEased, phiU: phiUe, phiD: phiDe, lay };
}

/* <<< SOLVER */

/* ───────────────────────────────────────────────────────────── the steel */

const POSTS = { first: -95, d: 5.5, w: RAIL.post.w, h: RAIL.post.h, knee: 14 };
const REACH = 5800; // the barrier runs this far each way, cm…
const FADE = [2600, 5200]; // …and sinks into the dark between these distances from the car
const SEAM = RAIL.post.every * 2; // a splice every other post
const SEAM0 = POSTS.first + RAIL.post.every;
const EDGE_N = 560; // the white line of the track's edge, from the barrier
const RUN_N = 60; // the run-off starts here

/** The solved fields as textures: s across, `ahead` down. Half floats: filtered on every card, a millimetre fine. */
function fieldTexture(data) {
  const half = new Uint16Array(data.length);
  for (let i = 0; i < data.length; i++) half[i] = THREE.DataUtils.toHalfFloat(data[i]);
  const tex = new THREE.DataTexture(half, NS, NA, THREE.RGBAFormat, THREE.HalfFloatType);
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/** Where a beam has a ring of vertices: every DS in the wound (the texture's own grid), further and further apart away from it. */
function stations(from, to) {
  const half = [0];
  let s = 0;
  while (s < REACH) {
    s += Math.abs(s) < 420 ? DS : Math.min(190, DS + (s - 420) * 0.14);
    half.push(Math.min(s, REACH));
  }
  const all = [...half.slice(1).reverse().map((x) => -x), ...half];
  return [from, ...all.filter((x) => x > from + 0.01 && x < to - 0.01), to];
}

/** A beam at rest: the W swept along s. position = (n, v, s) — the shader stands it at its height and bends it. */
function beamGeometry(from, to) {
  const rings = stations(from, to);
  const F = W.length - 1; // facets across the W: each its own pair of vertices, its own normal — a fold is a fold
  const pos = new Float32Array(rings.length * F * 6);
  const nor = new Float32Array(rings.length * F * 6);
  const index = [];
  rings.forEach((s, i) => {
    for (let j = 0; j < F; j++) {
      const a = W[j];
      const b = W[j + 1];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const k = (i * F + j) * 2;
      pos.set([a[0], a[1], s, b[0], b[1], s], k * 3);
      nor.set([(b[1] - a[1]) / l, -(b[0] - a[0]) / l, 0, (b[1] - a[1]) / l, -(b[0] - a[0]) / l, 0], k * 3);
      if (i < rings.length - 1) index.push(k, k + 1, k + 2 * F, k + 1, k + 2 * F + 1, k + 2 * F);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setIndex(index);
  return geo;
}

const DEFORM = /* glsl */ `
  uniform sampler2D uDef; uniform float uAhead, uBeamY;
  varying vec3 rlRest; varying vec2 rlWorld;
  vec4 rlField(float s) {
    vec2 uv = vec2((clamp(s, ${f(S0)}, ${f(S0 + (NS - 1) * DS)}) - ${f(S0)}) / ${f(DS)} + 0.5, clamp(uAhead, 0.0, ${f(A1)}) / ${f(DA)} + 0.5) / vec2(${f(NS)}, ${f(NA)});
    return textureLod(uDef, uv, 0.0);
  }
  // the W carried by its centre line: moved, turned with it, rolled around it (and, laid flat under the car, crushed)
  void rlDeform(vec3 rest, vec3 restN, out vec3 P, out vec3 Nr) {
    float s = rest.z;
    vec4 d = rlField(s); vec4 d0 = rlField(s - ${f(DS)}); vec4 d1 = rlField(s + ${f(DS)});
    vec3 T = vec3(d1.x - d0.x, d1.y - d0.y, ${f(2 * DS)} + d1.z - d0.z);
    T /= max(length(T), 1e-4);
    vec3 U0 = vec3(0.0, 1.0, 0.0) - T * T.y;
    U0 /= max(length(U0), 1e-4);
    vec3 N0 = cross(U0, T);
    float cr = cos(d.w); float sr = sin(d.w);
    vec3 N = N0 * cr + U0 * sr;
    vec3 U = U0 * cr - N0 * sr;
    float sq = 1.0;
    #if PIECE == 3
      sq = 1.0 - 0.6 * smoothstep(1.15, 1.5, d.w);
    #endif
    P = vec3(d.x, uBeamY + d.y, s + d.z) + N * (rest.x * sq) + U * rest.y;
    Nr = N * (restN.x / sq) + U * restN.y;
    Nr /= max(length(Nr), 1e-4);
  }`;
/** The torn edge: the same ragged line for both ends — they were one sheet. */
const TORN = /* glsl */ `
  float rlJag(float v) { return 5.0 * sin(v * 0.83 + 1.3) + 2.6 * sin(v * 2.9 + 0.4) + 1.4 * sin(v * 7.1 + 2.0); }
  float rlTornAt(vec3 rest) {
    #if PIECE == 1
      return ${f(TEAR)} + rlJag(rest.y) - rest.z;
    #elif PIECE == 2
      return rest.z - ${f(TEAR)} - rlJag(rest.y);
    #else
      return 1000.0;
    #endif
  }`;

/**
 * Galvanised steel, matt. `piece`: 0 the top beam · 1, 2 the two ends of the middle one · 3 the bottom one.
 * → the material, and the one that draws it into the shadow map (bent the same way).
 */
function beamMaterial(piece, uniforms) {
  const mat = solid(0x767d84, { rough: 0.9, metal: 0.2, env: 0.45, double: true });
  mat.shadowSide = THREE.DoubleSide;
  mat.defines = { ...mat.defines, PIECE: piece };
  mat.customProgramCacheKey = () => `rail-beam-${piece}`;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${DEFORM}\nvec3 rlP; vec3 rlN;`)
      .replace("#include <beginnormal_vertex>", "rlDeform(position, normal, rlP, rlN);\nvec3 objectNormal = rlN;")
      .replace("#include <begin_vertex>", "vec3 transformed = rlP;\nrlRest = position;\nrlWorld = (modelMatrix * vec4(rlP, 1.0)).xz;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        uniform float uHit; uniform vec3 uInk; uniform vec3 uSignal; varying vec3 rlRest; varying vec2 rlWorld;
        ${TORN}
        // a line drawn in the steel, never under two pixels
        float rlLine(float v, float at, float w) { return 1.0 - smoothstep(w, 1.8 * w, abs(v - at)); }
        float rlTorn; float rlFw; float rlFs;`,
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        {
          float rv = rlRest.y; float rs = rlRest.z;
          rlTorn = rlTornAt(rlRest);
          if (rlTorn < 0.0) discard;
          rlFw = max(fwidth(rv), 1e-4); rlFs = max(fwidth(rs), 1e-4);
          // the hollows of the W stand in their own shade, whichever side they are seen from
          float hollow = gl_FrontFacing ? 1.0 - rlRest.x / ${f(D)} : rlRest.x / ${f(D)};
          diffuseColor.rgb *= 1.0 - 0.52 * hollow * hollow;
          // …and its two lips turn away: a shade darker too, so that each beam is one thing
          diffuseColor.rgb *= 1.0 - 0.3 * smoothstep(${f(H - 3.2)}, ${f(H)}, abs(rv));
          diffuseColor.rgb *= 0.95 + 0.05 * sin(rs * 0.13 + rv * 0.9) * sin(rs * 0.037 + 1.7);
          // zinc: faint streaks down the sheet (they melt into its tone before they get thinner than a pixel)
          diffuseColor.rgb *= 1.0 + 0.09 * sin(rs * 1.7 + 3.0 * sin(rs * 0.31)) * sin(rs * 0.53 + 1.3) * (1.0 - smoothstep(0.4, 1.2, rlFs));
          // a splice every other post: the lap of two sheets, eight bolts (they melt away when they get small)
          float near = 1.0 - smoothstep(0.3, 0.75, max(rlFw, rlFs));
          float sd = mod(rs - ${f(SEAM0)} + ${f(SEAM / 2)}, ${f(SEAM)}) - ${f(SEAM / 2)};
          float lap = 1.0 - smoothstep(0.3, 0.3 + 1.5 * rlFs, abs(sd - 16.0));
          float bd = length(vec2(min(abs(abs(sd) - 5.0), abs(abs(sd) - 12.0)), abs(abs(rv) - 8.1)));
          float head = 1.0 - smoothstep(1.2, 1.2 + 1.5 * rlFs, bd);
          diffuseColor.rgb *= 1.0 - near * max(0.5 * lap, 0.5 * head);
        }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        {
          float rv = rlRest.y; float rs = rlRest.z;
          float w = 0.95 * rlFw;
          float lips = max(rlLine(rv, ${f(H - 0.4)}, w), rlLine(rv, ${f(0.4 - H)}, w)) * (1.0 - smoothstep(1.3, 2.8, rlFw));
          float folds = max(max(rlLine(rv, ${f(H - 5.1)}, w), rlLine(rv, ${f(5.1 - H)}, w)), max(rlLine(rv, ${f(H - 9.7)}, w), rlLine(rv, ${f(9.7 - H)}, w))) * (1.0 - smoothstep(0.4, 0.9, rlFw));
          // where it is struck, its lines are signal
          float heat = uHit * exp(-rs * rs / 17000.0);
          totalEmissiveRadiance += mix(uInk * 0.4, uSignal * 1.2, heat) * lips + uInk * (0.2 * folds);
          // the torn edge is still hot
          float rim = 1.0 - smoothstep(0.0, max(1.8, 2.2 * rlFs), rlTorn);
          totalEmissiveRadiance += mix(uSignal * 1.25, uInk * 1.5, rim * rim) * rim * uHit;
        }`,
      )
      .replace("#include <dithering_fragment>", `#include <dithering_fragment>\ngl_FragColor.rgb = mix(gl_FragColor.rgb, ${v3(BG)}, smoothstep(${f(FADE[0])}, ${f(FADE[1])}, length(rlWorld)));`);
  };
  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
  depth.defines = { PIECE: piece };
  depth.customProgramCacheKey = () => `rail-beam-depth-${piece}`;
  depth.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${DEFORM}`)
      .replace("#include <begin_vertex>", "vec3 rlP; vec3 rlN;\nrlDeform(position, vec3(1.0, 0.0, 0.0), rlP, rlN);\nvec3 transformed = rlP;\nrlRest = position;\nrlWorld = vec2(0.0);");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 rlRest;\n${TORN}`)
      .replace("void main() {", "void main() {\nif (rlTornAt(rlRest) < 0.0) discard;");
  };
  return { mat, depth };
}

/** A matt steel that sinks into the dark far from the car, like the beams. */
function postMaterial(color) {
  const mat = solid(color, { rough: 0.66, metal: 0.35, env: 0.8 });
  mat.customProgramCacheKey = () => "rail-post";
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 rlWorld;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nrlWorld = (modelMatrix * vec4(transformed, 1.0)).xz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec2 rlWorld;")
      .replace("#include <dithering_fragment>", `#include <dithering_fragment>\ngl_FragColor.rgb = mix(gl_FragColor.rgb, ${v3(BG)}, smoothstep(${f(FADE[0])}, ${f(FADE[1])}, length(rlWorld)));`);
  };
  return mat;
}

/* ───────────────────────────────────────────────────────────── the track */

function makeGround() {
  const uniforms = {
    uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uAmount: { value: 1 }, uSmear: { value: new THREE.Vector2() },
    uFire: { value: 0 }, uFireAt: { value: new THREE.Vector2() }, uFireR: { value: 100 },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(26000, 26000),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        varying vec2 vL; varying vec2 vW;
        void main() {
          vL = vec2(position.x, -position.y); // n and s on the track
          vW = (modelMatrix * vec4(position, 1.0)).xz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk; uniform vec3 uSignal; uniform float uAmount, uFire, uFireR; uniform vec2 uSmear; uniform vec2 uFireAt;
        varying vec2 vL; varying vec2 vW;
        // one family of lines: a pixel and a half wide, and spread over what they travel in a frame — with the same light
        float lines(float x, float cell, float smear) {
          float q = x / cell;
          float w = max(fwidth(q) * 1.5, 1e-5);
          float d = abs(fract(q - 0.5) - 0.5);
          float reach = max(w, 0.5 * smear / cell);
          return (w / reach) * (1.0 - smoothstep(reach - w, reach, d));
        }
        // a painted band, half its width each side of 0, spread the same way
        float band(float x, float hw, float smear) {
          float w = max(fwidth(x) * 1.5, 0.01);
          float reach = max(hw, 0.5 * smear);
          return (hw / reach) * (1.0 - smoothstep(reach, reach + w, abs(x)));
        }
        void main() {
          if (uAmount < 0.003) discard;
          float g = max(lines(vL.x, 100.0, uSmear.x), lines(vL.y, 100.0, uSmear.y)) * 0.38 + max(lines(vL.x, 500.0, uSmear.x), lines(vL.y, 500.0, uSmear.y));
          float around = exp(-length(vW - vec2(0.0, 60.0)) / 1500.0);
          float far = exp(-length(vW) / 2600.0);
          float side = vL.x > 0.0 ? 1.0 : 0.42; // the track · the other side of the barrier
          float edge = band(vL.x - ${f(EDGE_N)}, 7.0, uSmear.x);
          float inner = band(vL.x - ${f(RUN_N)}, 2.2, uSmear.x);
          float run = step(${f(RUN_N)}, vL.x) * step(vL.x, ${f(EDGE_N)});
          float pool = pow(clamp(1.0 - length((vW - vec2(0.0, 40.0)) / vec2(260.0, 420.0)), 0.0, 1.0), 2.0);
          vec3 col = uInk * ((g * 0.17 * side + run * 0.011) * around + (edge * 0.55 + inner * 0.13) * far + pool * 0.022);
          // the fire lights the track: around it the grid takes its colour
          float lit = uFire * pow(clamp(1.0 - length(vL - uFireAt) / (2.7 * max(uFireR, 1.0)), 0.0, 1.0), 2.0);
          col += uSignal * lit * (g * 0.5 + 0.05 + 0.4 * (edge + inner));
          gl_FragColor = vec4(col * uAmount, 1.0);
        }`,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.frustumCulled = false;
  mesh.renderOrder = -2;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── what the steel throws */

/**
 * Sparks: slow (the film is in slow motion), each a streak from where it was a moment ago to where it is, born
 * again in its turn — a pure function of `uT`. Four places give them (`uEmit`), each with its own strength.
 */
function makeSparks(count, seed) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 0, 1, 0, 1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 2, 1, 3]);
  const seeds = new Float32Array(count * 4); // phase, period (s), speed (cm/s), width (px)
  const dirs = new Float32Array(count * 4); // direction, which place
  const offs = new Float32Array(count * 3);
  const d = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const place = i % 4;
    seeds.set([rand(), 0.8 + rand() * 1.1, 70 + Math.pow(rand(), 1.6) * 250, 2.6 + rand() * 2.6], i * 4);
    // thrown the way the car goes (toward the camera's side and along the barrier), fanned out, rather upward
    d.set(-SIN + (rand() - 0.6) * 1.1, 0.15 + rand() * 0.9, COS * 0.8 + (rand() - 0.5) * 1.2).normalize();
    dirs.set([d.x, d.y, d.z, place], i * 4);
    offs.set([(rand() - 0.5) * 8, (rand() - 0.5) * (place < 2 ? 26 : 5), (rand() - 0.5) * (place < 2 ? 8 : 90)], i * 3);
  }
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(dirs, 4));
  geo.setAttribute("aOff", new THREE.InstancedBufferAttribute(offs, 3));
  geo.instanceCount = count;
  const uniforms = {
    uT: { value: 0 }, uView: { value: VIEW }, uAmount: { value: 1 },
    uEmit: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] }, uEmitK: { value: [0, 0, 0, 0] },
    uHot: { value: INK.clone().multiplyScalar(2.6) }, uCool: { value: SIGNAL.clone().multiplyScalar(1.7) },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT; uniform vec3 uEmit[4]; uniform float uEmitK[4]; uniform vec2 uView;
        attribute vec4 aSeed; attribute vec4 aDir; attribute vec3 aOff;
        varying vec2 vQ; varying float vAge; varying float vK;
        vec3 flight(vec3 o, vec3 v, float t) { return o + v * t * (1.0 - 0.22 * t) + vec3(0.0, -150.0 * t * t, 0.0); }
        void main() {
          int e = int(aDir.w + 0.5);
          float k = uEmitK[e];
          float age = fract(uT / aSeed.y + aSeed.x) / 0.7; // past 1: waiting for its turn
          vAge = age; vK = k; vQ = position.xy;
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (k > 0.004 && age < 1.0) {
            float tau = age * 0.7 * aSeed.y;
            vec3 o = uEmit[e] + aOff;
            vec3 v = aDir.xyz * aSeed.z;
            vec4 c1 = projectionMatrix * modelViewMatrix * vec4(flight(o, v, tau), 1.0);
            vec4 c0 = projectionMatrix * modelViewMatrix * vec4(flight(o, v, max(tau - 0.075, 0.0)), 1.0);
            if (c0.w > 0.05 && c1.w > 0.05 && flight(o, v, tau).y > 0.5) {
              vec2 run = (c1.xy / c1.w - c0.xy / c0.w) * uView;
              float len = length(run);
              vec2 dir = len > 0.01 ? run / len : vec2(1.0, 0.0);
              vec4 c = mix(c0, c1, position.x);
              // a head wider than its tail
              float wide = aSeed.w * mix(0.4, 1.0, position.x);
              c.xy += (vec2(-dir.y, dir.x) * position.y * wide + dir * (position.x * 2.0 - 1.0) * aSeed.w) / uView * 2.0 * c.w;
              gl_Position = c;
            }
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot; uniform vec3 uCool; uniform float uAmount;
        varying vec2 vQ; varying float vAge; varying float vK;
        void main() {
          float across = pow(clamp(1.0 - abs(vQ.y), 0.0, 1.0), 1.5);
          float along = mix(0.1, 1.0, vQ.x * vQ.x) * (1.0 - smoothstep(0.86, 1.0, vQ.x));
          float life = sqrt(clamp(sin(3.14159 * clamp(vAge, 0.0, 1.0)), 0.0, 1.0));
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.08, 0.6, vAge)) * (across * along * life * vK * uAmount), 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/** Flakes of zinc and steel: each leaves the wound when the car gets to its `ahead`, tumbles, floats, comes down. */
function makeShards(count, seed) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-0.5, -0.36, 0, 0.62, -0.2, 0, -0.08, 0.56, 0], 3));
  const origin = new Float32Array(count * 3);
  const dir = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // the `ahead` it leaves at, spin, phase, size (cm)
  const d = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const s = (rand() * 2 - 1) * 80;
    origin.set([-2 + rand() * 6, 8 + rand() * 92, s], i * 3);
    d.set(-SIN * 1.4 - rand() * 0.9, 0.1 + rand() * 0.8, COS + (rand() - 0.5) * 1.3).normalize();
    dir.set([d.x, d.y, d.z], i * 3);
    // the upstream side is struck first
    seeds.set([Math.min(3.6, 1.2 + rand() * 2.2 - s * 0.006), 2 + rand() * 7, rand() * 6.283, 1.1 + Math.pow(rand(), 2) * 2.6], i * 4);
  }
  geo.setAttribute("aOrigin", new THREE.InstancedBufferAttribute(origin, 3));
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(dir, 3));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  geo.instanceCount = count;
  const uniforms = { uAhead: { value: A1 }, uTime: { value: 0 }, uAmount: { value: 1 }, uColor: { value: INK.clone() } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uAhead, uTime; attribute vec3 aOrigin; attribute vec3 aDir; attribute vec4 aSeed; varying float vGlint; varying float vK;
        vec3 turn(vec3 v, vec3 axis, float a) { return v * cos(a) + cross(axis, v) * sin(a) + axis * dot(axis, v) * (1.0 - cos(a)); }
        void main() {
          float k = clamp((aSeed.x - uAhead) / 1.6, 0.0, 1.0);
          float fly = 1.0 - (1.0 - k) * (1.0 - k); // fast at first, then afloat
          float a = aSeed.z + aSeed.y * (fly * 2.6 + uTime * 0.12);
          vec3 axis = normalize(vec3(sin(aSeed.z * 3.1), cos(aSeed.z * 1.7), sin(aSeed.z * 5.3 + 1.0)) + vec3(0.02, 0.01, 0.03));
          vec3 n = turn(vec3(0.0, 0.0, 1.0), axis, a);
          vec3 p = aOrigin + aDir * ((40.0 + 150.0 * fract(aSeed.z * 3.3)) * fly + 1.5 * sin(uTime * 0.23 + aSeed.z)) + turn(position * aSeed.w, axis, a);
          p.y -= 46.0 * k * k * fract(aSeed.z * 7.7);
          p.y = max(p.y, 0.8); // they come to rest on the track
          vGlint = abs(dot(n, normalize(vec3(-0.5, 0.62, 0.6))));
          vK = smoothstep(0.0, 0.04, k) * (1.0 - smoothstep(0.7, 1.0, k));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying float vGlint; varying float vK;
        void main() {
          if (uAmount * vK < 0.003) discard;
          gl_FragColor = vec4(uColor * (0.05 + 1.1 * pow(clamp(vGlint, 0.0, 1.0), 4.0)) * uAmount * vK, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the fire */

/** A block of noise that tiles: three octaves of value noise, stretched to use the whole range. */
function noiseBlock(size, seed) {
  const rand = rng(seed);
  const lattice = (period) => {
    const g = new Float32Array(period * period * period);
    for (let i = 0; i < g.length; i++) g[i] = rand();
    const at = (x, y, z) => g[(x % period) + period * ((y % period) + period * (z % period))];
    const ease = (t) => t * t * (3 - 2 * t);
    const mix = (a, b, t) => a + (b - a) * t;
    return (u, v, w) => {
      const x = u * period;
      const y = v * period;
      const z = w * period;
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const zi = Math.floor(z);
      const fx = ease(x - xi);
      const fy = ease(y - yi);
      const fz = ease(z - zi);
      return mix(
        mix(mix(at(xi, yi, zi), at(xi, yi, zi + 1), fz), mix(at(xi, yi + 1, zi), at(xi, yi + 1, zi + 1), fz), fy),
        mix(mix(at(xi + 1, yi, zi), at(xi + 1, yi, zi + 1), fz), mix(at(xi + 1, yi + 1, zi), at(xi + 1, yi + 1, zi + 1), fz), fy),
        fx,
      );
    };
  };
  const o1 = lattice(4);
  const o2 = lattice(8);
  const o3 = lattice(16);
  const data = new Uint8Array(size * size * size);
  let i = 0;
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x + 0.5) / size;
        const v = (y + 0.5) / size;
        const w = (z + 0.5) / size;
        data[i++] = Math.round(255 * clamp01(0.5 + ((o1(u, v, w) + 0.5 * o2(u, v, w) + 0.25 * o3(u, v, w)) / 1.75 - 0.5) * 2.1));
      }
    }
  }
  const tex = new THREE.Data3DTexture(data, size, size, size);
  tex.format = THREE.RedFormat;
  tex.type = THREE.UnsignedByteType;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.RepeatWrapping;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}

const SLICES = 64;
/**
 * The fireball. `uC`, `uR`: its centre and its size (update moves them with `fire`). Slices across its ball, each
 * facing the eye, the far ones first: every one lays its flame OVER what is behind it — so the colour never climbs
 * past what it was given (signal stays signal, the heart stays white), and what is near hides what is far.
 * `uJit` shifts the whole stack by a fraction of a slice at each instant of the shutter: sixteen coarse stacks
 * make a fine one. They are depth-tested: the fire goes round the steel, and behind your helmet.
 */
function makeFire() {
  const uniforms = {
    uNoise: { value: noiseBlock(48, 131) }, uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() },
    uC: { value: new THREE.Vector3() }, uR: { value: 30 }, uSeat: { value: new THREE.Vector3(...FIRE.seat) },
    uTime: { value: 0 }, uJit: { value: 0 }, uFire: { value: 0 }, uZx: { value: 0 }, uAmount: { value: 1 },
  };
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 2, 1, 3]);
  geo.setAttribute("aLayer", new THREE.InstancedBufferAttribute(new Float32Array(SLICES).map((_, i) => i), 1));
  geo.instanceCount = SLICES;
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */ `
        uniform vec3 uC; uniform float uR, uJit; attribute float aLayer; varying vec3 vP;
        void main() {
          vec3 centre = uC + vec3(0.0, 0.7 * uR, 0.0);
          float ball = 1.9 * uR;
          vec3 toEye = cameraPosition - centre;
          toEye /= max(length(toEye), 1e-3);
          vec3 right = cross(vec3(0.001, 1.0, 0.0), toEye);
          right /= max(length(right), 1e-4);
          vec3 up = cross(toEye, right);
          float depth = ((aLayer + uJit) / ${f(SLICES)} * 2.0 - 1.0) * ball; // the far ones first
          vP = centre + toEye * depth + (right * position.x + up * position.y) * ball;
          gl_Position = projectionMatrix * viewMatrix * vec4(vP, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        precision highp sampler3D;
        uniform sampler3D uNoise; uniform vec3 uInk; uniform vec3 uSignal; uniform vec3 uC; uniform vec3 uSeat;
        uniform float uR, uTime, uFire, uZx, uAmount;
        varying vec3 vP;
        void main() {
          if (uFire < 0.004 || uAmount < 0.004 || vP.y < 0.0) discard;
          float R = max(uR, 1.0);
          vec3 q = vP - uC;
          // in the barrier's axes: across it, up, along it
          float qn = ${f(COS)} * q.x - ${f(SIN)} * q.z;
          float qs = ${f(SIN)} * q.x + ${f(COS)} * q.z;
          float ry = q.y > 0.0 ? 1.38 * R : uC.y / 0.92;
          float d = length(vec3(qn / (0.86 * R), q.y / ry, qs / (1.04 * R)));
          if (d > 2.1) discard;
          float h = clamp(vP.y / (uC.y + 1.38 * R), 0.0, 1.0);
          // flames are tall and they climb: the noise is read squeezed in height, sliding upward — great billows,
          // the cells they are made of, and the licks along their skin, each carried by the one before
          float n1 = textureLod(uNoise, vec3(q.x, q.y * 0.45, q.z) / (3.2 * R) + vec3(0.13, -0.13 * uTime, 0.37), 0.0).r;
          float n2 = textureLod(uNoise, vec3(q.x, q.y * 0.5, q.z) / (1.5 * R) + vec3(0.5, -0.27 * uTime, 0.21) + (n1 - 0.5) * 0.2, 0.0).r;
          float n3 = textureLod(uNoise, vec3(q.x, q.y * 0.4, q.z) / (0.5 * R) + vec3(0.2, -0.8 * uTime, 0.7) + (n2 - 0.5) * 0.15, 0.0).r;
          // its skin: a ball at its foot, tongues and loose curls at its top
          float e = 1.0 - d + (n1 - 0.5) * (0.45 + 0.75 * h) + (n2 - 0.5) * (0.3 + 0.3 * h) + (n3 - 0.5) * 0.14;
          float dens = smoothstep(0.0, 0.05, e);
          // the steel holds it back: none of it on your side of the barrier — except over the top beam, where it leans out
          float n = ${f(COS)} * vP.x - ${f(SIN)} * (vP.z - uZx);
          float over = 80.0 * uFire * smoothstep(100.0, 200.0, vP.y);
          dens *= smoothstep(-6.0 - over, 30.0 - over, n);
          if (dens < 0.004) discard;
          // bright cells between dark seams, deeper = brighter, its top cooler: one hue, more or less of it
          float deep = smoothstep(0.0, 0.4, e);
          float cell = smoothstep(0.4, 0.58, n2 + 0.5 * (n3 - 0.5));
          float shade = mix(0.13, 1.0, cell) * mix(0.6, 1.0, deep) * mix(1.0, 0.42, smoothstep(0.3, 0.95, h));
          vec3 col = uSignal * (1.12 * shade);
          // the heart, white-hot, at its seat — and signal at its fullest around it
          vec3 toSeat = vP - uSeat;
          float core = exp(-dot(toSeat, toSeat) / ((0.13 * R + 12.0) * (0.13 * R + 12.0)));
          float white = smoothstep(0.45, 0.9, core * (0.55 + 0.9 * n2));
          col = mix(col, uSignal * 1.12, 0.7 * smoothstep(0.1, 0.55, core));
          col = mix(col, uInk * 1.06, white);
          // a skin, not a mist: two or three slices deep, nothing behind shows
          float a = (1.0 - exp(-dens * mix(0.8, 2.1, max(cell * deep, white)))) * uAmount;
          gl_FragColor = vec4(col * a, a);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 1; // before the fine lines of what stands in front of it, before every pane of glass
  return { mesh, uniforms };
}

/** Embers carried up by the fire: each one born again in its turn, a pure function of `uT`. */
function makeEmbers(count, seed) {
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4); // phase, period (s), size (cm), how high it goes
  const offs = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    seeds.set([rand(), 1.6 + rand() * 2.2, 1.6 + Math.pow(rand(), 2) * 3.4, 0.5 + rand() * 0.8], i * 4);
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    offs.set([Math.cos(a) * r, rand(), Math.sin(a) * r], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  geo.setAttribute("aOff", new THREE.BufferAttribute(offs, 3));
  const uniforms = {
    uT: { value: 0 }, uScale: { value: 1 }, uAmount: { value: 0 }, uC: { value: new THREE.Vector3() }, uR: { value: 30 },
    uHot: { value: INK.clone().multiplyScalar(2.2) }, uCool: { value: SIGNAL.clone().multiplyScalar(1.5) },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale, uR; uniform vec3 uC; attribute vec4 aSeed; attribute vec3 aOff; varying float vAge;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          vAge = age;
          // up with the hot air, drifting apart, in a slow corkscrew
          float turn = 6.2832 * aOff.y + 2.4 * age * (aSeed.x - 0.5);
          vec3 p = uC + vec3(aOff.x * cos(turn) - aOff.z * sin(turn), 0.0, aOff.x * sin(turn) + aOff.z * cos(turn)) * uR * (0.35 + 0.7 * age)
            + vec3(0.0, uR * (-0.2 + 2.9 * age * aSeed.w), 0.0);
          p.y = max(p.y, 1.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = max(2.0, aSeed.z * uScale / max(0.5, -mv.z));
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot; uniform vec3 uCool; uniform float uAmount; varying float vAge;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - d), 1.6) * sqrt(clamp(sin(3.14159 * vAge), 0.0, 1.0)) * uAmount;
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.05, 0.5, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 6;
  return { points, uniforms };
}

/* ───────────────────────────────────────────────────────────── the set */

export function buildRail() {
  const group = new THREE.Group();
  const slide = new THREE.Group();
  slide.rotation.y = RAIL.angle * DEG;
  group.add(slide);
  const A = {};
  const steel = makePart("rail"); // the bag of every material that fades with `shell`
  const bag = steel.userData.part;
  slide.add(steel);

  const solved = solve();
  const SH = { uAhead: { value: A1 }, uHit: { value: 0 }, uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() } };

  /* ── the three beams (the middle one in two ends) ── */
  const beam = (piece, y, data, from, to) => {
    const { mat, depth } = beamMaterial(piece, { ...SH, uDef: { value: fieldTexture(data) }, uBeamY: { value: y } });
    const mesh = new THREE.Mesh(beamGeometry(from, to), mat);
    mesh.customDepthMaterial = depth;
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    bag.mats.add(mat);
    bag.meshes.push(mesh);
    steel.add(mesh);
    return mesh;
  };
  beam(0, Y_TOP, solved.top, -REACH, REACH);
  beam(1, Y_MID, solved.midU, -REACH, TEAR + 12);
  beam(2, Y_MID, solved.midD, TEAR - 12, REACH);
  beam(3, Y_LOW, solved.low, -REACH, REACH);

  /* ── the posts: behind the beams, on the side away from the track ── */
  const mPost = postMaterial(0x6c737a);
  const upright = (h) => box(POSTS.d, h, POSTS.w, 0.5);
  const xPost = -POSTS.d / 2 - 0.4;
  const near = [];
  const far = [];
  for (let s = POSTS.first - RAIL.post.every * 30; s <= REACH; s += RAIL.post.every) {
    if (Math.abs(Math.abs(s) - 95) < 1) continue; // the two that flank the breach bend: below
    (Math.abs(s) < 1300 ? near : far).push(placed(upright(POSTS.h), { pos: [xPost, POSTS.h / 2, s] }));
  }
  addMesh(steel, mergeGeometries(near), mPost, { edgeOpacity: 0.5 });
  addMesh(steel, mergeGeometries(far), mPost, { edges: false });

  // a post that gives: a stub left standing, the rest folded over at its knee, toward `dir` (n, s)
  const mBent = solid(0x767d84, { rough: 0.62, metal: 0.38, env: 0.85 });
  const bentPost = (s, dir) => {
    const root = new THREE.Group();
    root.position.set(xPost, 0, s);
    steel.add(root);
    const arm = new THREE.Group();
    arm.position.y = POSTS.knee;
    root.add(arm);
    root.add(addMesh(steel, upright(POSTS.knee).translate(0, POSTS.knee / 2, 0), mBent, { edgeOpacity: 0.55 }));
    arm.add(addMesh(steel, upright(POSTS.h - POSTS.knee).translate(0, (POSTS.h - POSTS.knee) / 2, 0), mBent, { edgeOpacity: 0.55 }));
    const l = Math.hypot(dir[0], dir[1]);
    const axis = new THREE.Vector3(dir[1] / l, 0, -dir[0] / l);
    // the fold itself: a roll of steel across the knee
    const knuckle = addMesh(steel, cyl(POSTS.d * 0.56, POSTS.w * 1.02, 0.3, 20), mBent, { edges: false });
    knuckle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
    knuckle.position.y = POSTS.knee;
    root.add(knuckle);
    return { root, arm, axis };
  };
  const postU = bentPost(-95, [-1, 0.12]); // upstream: pushed over toward the camera
  const postD = bentPost(95, [-SIN, COS]); // downstream: the peeled end of the beam mows it down, along the car's way

  /* ── the track ── */
  const ground = makeGround();
  slide.add(ground.mesh);

  /* ── sparks, flakes ── */
  const sparks = makeSparks(150, 17);
  const shards = makeShards(30, 23);
  slide.add(sparks.mesh, shards.mesh);

  /* ── the fire: in the car's frame (it is the car that burns) ── */
  const fire = makeFire();
  const embers = makeEmbers(120, 5);
  const light = new THREE.PointLight(BRAND.signal, 0, 1500, 1.5);
  group.add(fire.mesh, embers.points, light);

  /* ── anchors ── */
  A.beamTop = anchor(slide, 2, Y_TOP, 0);
  A.breach = anchor(slide, -4, Y_MID - 4, 0);
  A.post = anchor(slide, xPost - 60, 40, -95);
  A.edge = anchor(slide, EDGE_N, 0, -260);
  A.fire = anchor(group, ...FIRE.seat);
  A.flameTop = anchor(group, ...FIRE.seat);

  const NW = new THREE.Vector3(COS, 0, -SIN); // +n, in the car's frame
  const tip = new Float32Array(8);
  const rowAt = (a) => {
    const x = Math.min(NA - 1, Math.max(0, a / DA));
    const j = Math.min(NA - 2, Math.floor(x));
    const u = x - j;
    for (let k = 0; k < 8; k++) tip[k] = solved.tips[j * 8 + k] + (solved.tips[(j + 1) * 8 + k] - solved.tips[j * 8 + k]) * u;
  };
  let lastTime = NaN;
  let lastAhead = NaN;
  let travel = 0; // cm the barrier slides in one frame

  return {
    group, A, slide,
    /** `shell` fades everything here · `ahead` (m) brings the barrier and opens it · `fire` 0 → 1 · `split` (the rear end torn off: nothing of ours moves with it). */
    update({ shell = 1, ahead = 0, fire: burn = 0 } = {}, time = 0, px = 1) {
      group.visible = shell > 0.004;
      if (!group.visible) {
        light.intensity = 0;
        return;
      }
      const zx = RAIL.cross + ahead * 100;
      slide.position.z = zx;
      // how fast it comes, read off the last instant asked for (the shutter asks for sixteen in a row)
      const dt = time - lastTime;
      if (Math.abs(dt) > 1e-5) travel = Math.abs(dt) < 0.2 ? Math.abs(((ahead - lastAhead) * 100) / dt) / FPS : 0;
      lastTime = time;
      lastAhead = ahead;

      /* the steel */
      setPartOpacity(steel, shell);
      const a = Math.min(A1, Math.max(0, ahead));
      SH.uAhead.value = a;
      const hit = smooth(A1, A1 - 0.3, a);
      SH.uHit.value = hit;
      rowAt(a);
      postU.arm.quaternion.setFromAxisAngle(postU.axis, 1.2 * smooth(3.4, 2.5, a));
      postD.arm.quaternion.setFromAxisAngle(postD.axis, 1.43 * smooth(3.6, 2.8, a));
      A.beamTop.position.y = Y_TOP + tip[6];

      /* the track */
      const g = ground.uniforms;
      g.uAmount.value = shell;
      g.uSmear.value.set(SIN * travel * 1.2, COS * travel * 1.2);

      /* what the steel throws, while it is being gone through */
      const moving = smooth(0, 0.22, a) * hit;
      const sp = sparks.uniforms;
      sp.uT.value = time;
      sp.uAmount.value = shell;
      sp.uEmit.value[0].set(tip[0], tip[1], tip[2]);
      sp.uEmit.value[1].set(tip[3], tip[4], tip[5]);
      sp.uEmit.value[2].set(1, Y_TOP + tip[6] - 12, -6);
      sp.uEmit.value[3].set(-10, 4, 6);
      sp.uEmitK.value[0] = moving * smooth(0.3, 1, a);
      sp.uEmitK.value[1] = moving * smooth(0.6, 1.6, a);
      sp.uEmitK.value[2] = moving * smooth(1.4, 1.15, a);
      sp.uEmitK.value[3] = moving * smooth(3.5, 3.1, a);
      shards.uniforms.uAhead.value = a;
      shards.uniforms.uTime.value = time;
      shards.uniforms.uAmount.value = shell * hit;

      /* the fire */
      const k = clamp01(burn);
      const R = 30 + (FIRE.r - 30) * Math.pow(k, 1.25);
      const F = fire.uniforms;
      F.uFire.value = k;
      F.uAmount.value = shell;
      F.uR.value = R;
      F.uC.value.set(FIRE.seat[0], 22 + 0.4 * R, FIRE.seat[2]).addScaledVector(NW, 0.4 * R - 12);
      F.uTime.value = time;
      F.uJit.value = (time * 556.2) % 1;
      F.uZx.value = zx;
      fire.mesh.visible = k > 0.004;
      const E = embers.uniforms;
      E.uT.value = time;
      E.uScale.value = px;
      E.uAmount.value = shell * smooth(0.05, 0.4, k);
      E.uC.value.copy(F.uC.value);
      E.uR.value = R;
      embers.points.visible = k > 0.004;
      // its light stands in it, a little toward the track: it reaches the faces of the steel that look at it
      light.position.copy(F.uC.value).addScaledVector(NW, 0.3 * R);
      light.position.y += 0.3 * R;
      light.intensity = k > 0.004 ? 6500 * Math.pow(R / FIRE.r, 1.5) * shell * (0.95 + 0.05 * Math.sin(time * 1.3)) : 0;
      g.uFire.value = k;
      g.uFireR.value = R;
      const cx = F.uC.value.x;
      const cz = F.uC.value.z - zx;
      g.uFireAt.value.set(COS * cx - SIN * cz, SIN * cx + COS * cz);
      A.fire.position.copy(F.uC.value);
      A.flameTop.position.set(F.uC.value.x, F.uC.value.y + 1.5 * R, F.uC.value.z);
    },
  };
}
