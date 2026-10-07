// The aircraft and its world: a two-seat Rafale at true scale (1 unit = 1 cm), seen like an X-ray —
// a shell of glass and a few lines of structure, and solid inside it only what the story needs:
// the cockpit, its two bulkheads and the leaning rails the seats ride on. The canopy is glass seen
// from close, in two halves, each with its cutting cord: it lights up, then cuts — the pane leaves
// in shards, the frame and a broken fringe stay. Around it, no photograph: a runway and a ground
// drawn in lines going by, a horizon, a few strata of cloud, streaks of air.
//
// The aircraft never leaves the origin of its group: it pitches there, and the ground falls away
// under it (`alt`). Nose toward +z, left wing toward +x (the way a figure of the kit faces);
// y = 0 is the runway when the wheels are on it, and the main wheels touch it at z = 0.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeContact, makePool } from "@kit/atmo.js";
import { solid, glow, setGlow, glass, asShell, lineMat, edgesOf, fatLine, box, cyl, anchor, mergeGeometries } from "@kit/build3d.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** The aircraft in numbers (cm, degrees). `seatFront` / `seatRear`: the foot of each seat's rails, on the centreline. */
export const JET = {
  length: 1535,
  span: 1088,
  height: 534,
  nose: 850,
  tail: -685,
  recline: 30, // how far the rails — and the seat on them — lean back (the model's own SEAT.tilt: the two pairs of rails coincide)
  seatFront: [0, 186, 508],
  seatRear: [0, 190, 358],
  floor: 194, // where the heels rest
  sill: 254,
  speed: 14400, // cm per second at 520 km/h
};
const CANOPY = { front: 612, arch: 540, mid: 388, rear: 238 }; // the windscreen, then two halves
const CORD = { u: [0.06, 0.94], v: [0.1, 0.9] }; // the loop of the cutting cord on each half (along, across): close to the frame

/* ───────────────────────────────────────────────────────────── shapes */

// a smooth curve through [z, value] knots
function spline(knots) {
  const p = [...knots].sort((a, b) => a[0] - b[0]);
  const m = p.map((_, i) => {
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(p.length - 1, i + 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  });
  return (z) => {
    if (z <= p[0][0]) return p[0][1];
    if (z >= p.at(-1)[0]) return p.at(-1)[1];
    let i = 0;
    while (p[i + 1][0] < z) i++;
    const h = p[i + 1][0] - p[i][0];
    const u = (z - p[i][0]) / h;
    return (2 * u ** 3 - 3 * u * u + 1) * p[i][1] + (u ** 3 - 2 * u * u + u) * h * m[i] + (3 * u * u - 2 * u ** 3) * p[i + 1][1] + (u ** 3 - u * u) * h * m[i + 1];
  };
}

/** A skin through rows of points (`rows[i][j]` = [x, y, z]). `wrap`: each row closes on itself. `keep(i, j)`: which panels exist. */
function skin(rows, { wrap = false, keep } = {}) {
  const n = rows[0].length;
  const pos = new Float32Array(rows.length * n * 3);
  rows.forEach((row, i) => row.forEach((p, j) => pos.set(p, (i * n + j) * 3)));
  const index = [];
  for (let i = 0; i < rows.length - 1; i++) {
    for (let j = 0; j < (wrap ? n : n - 1); j++) {
      if (keep && !keep(i, j)) continue;
      const a = i * n + j;
      const b = i * n + ((j + 1) % n);
      index.push(a, b, b + n, a, b + n, a + n);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

// The fuselage, station by station: half-width, keel, crest, and the height of its shoulder — the
// line the canopy sits on. Its section is wide at the shoulders and narrows to a keel: a Rafale's.
const AROUND = 64;
const SILL = 4; // the canopy is the arc of each section between points SILL and AROUND / 2 − SILL
const A0 = (2 * Math.PI * SILL) / AROUND;
const UPPER = 2 / 1.75; // the exponent of the upper half (2 / n of a superellipse): a little pointed
const K = Math.sin(A0) ** UPPER;
const BODY = [
  [850, 1.5, 198, 202, 200.7],
  [825, 11, 189, 212, 204],
  [780, 23, 178, 225, 212],
  [720, 34, 168, 238, 223],
  [660, 42.5, 161, 248, 234],
  [612, 46, 158, 256, 243],
  [575, 48.5, 155, 281, 248],
  [540, 50, 153, 302, 251],
  [470, 52, 151, 323, 254],
  [388, 54, 150, 327, 256],
  [310, 55, 150, 324, 257],
  [238, 55, 152, 309, 258],
  [150, 54, 156, 297, 256],
  [0, 52, 162, 286, 252],
  [-200, 48, 170, 274, 246],
  [-400, 40, 180, 262, 240],
  [-540, 28, 196, 250, 236],
  [-640, 10, 216, 236, 228],
  [-652, 1.5, 222, 226, 224.5],
];
const body = [1, 2, 3, 4].map((k) => spline(BODY.map((row) => [row[0], row[k]])));
const lowerN = spline([[850, 2], [720, 1.75], [320, 1.75], [120, 2.2], [-652, 2.2]]);
function section(z) {
  const [w, keel, crest, shoulder] = body.map((f) => f(z));
  const mid = (shoulder - K * crest) / (1 - K); // where it is widest, so that the shoulder falls at the angle A0
  return { z, w, mid, up: crest - mid, down: mid - keel, lower: 2 / lowerN(z) };
}
function onSection(s, a) {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  const e = sn >= 0 ? UPPER : s.lower;
  return [s.w * Math.sign(c) * Math.abs(c) ** e, s.mid + (sn >= 0 ? s.up : s.down) * Math.sign(sn) * Math.abs(sn) ** e, s.z];
}
const bodyRing = (z) => {
  const s = section(z);
  return Array.from({ length: AROUND }, (_, j) => onSection(s, (2 * Math.PI * j) / AROUND));
};
/** A half of the canopy as a surface: `u` 0 at its front → 1 at its rear, `v` 0 on the left sill → 1 on the right one. */
const canopySurf = (zA, zB) => (u, v) => onSection(section(lerp(zA, zB, u)), A0 + (Math.PI - 2 * A0) * v);

// an engine pod on each flank, from the lip of its air intake to its nozzle: [z, centre x, half-width, underside, top]
const POD = [
  [345, 60, 27, 152, 200],
  [300, 62, 34, 150, 208],
  [200, 64, 40, 148, 216],
  [0, 64, 46, 148, 228],
  [-250, 60, 47, 152, 234],
  [-450, 52, 44, 158, 234],
  [-580, 46, 39, 160, 236],
  [-615, 45, 36, 163, 235],
];
const pod = [1, 2, 3, 4].map((k) => spline(POD.map((row) => [row[0], row[k]])));
const podRing = (z, side, n = 40) => {
  const [xc, w, under, top] = pod.map((f) => f(z));
  return Array.from({ length: n }, (_, j) => {
    const c = Math.cos((2 * Math.PI * j) / n);
    const s = Math.sin((2 * Math.PI * j) / n);
    return [side * (xc + w * Math.sign(c) * Math.abs(c) ** 0.87), (under + top) / 2 + ((top - under) / 2) * Math.sign(s) * Math.abs(s) ** 0.87, z];
  });
};
const circle = (x, y, z, r, n = 40) => Array.from({ length: n }, (_, j) => [x + r * Math.cos((2 * Math.PI * j) / n), y + r * Math.sin((2 * Math.PI * j) / n), z]);

// wing, canard, fin: [span, height, leading edge z, trailing edge z] at the root and at the tip (the fin's span is its height)
const WING = { root: [70, 208, 235, -470], tip: [530, 194, -276, -410] };
const CANARD = { root: [50, 246, 418, 262], tip: [212, 256, 272, 240] };
const FIN = { root: [240, 0, -217, -583], tip: [534, 0, -516, -621] };
/** An aerofoil carried from root to tip and closed there: a round nose, thickest a third of the way back, a thin trailing edge. */
function aerofoil({ root, tip }, { thick = 0.045, steps = 6, around = 28 } = {}) {
  const rows = [];
  for (let i = 0; i <= steps + 1; i++) {
    const end = i > steps;
    const [x, y, lead, trail] = root.map((r, k) => lerp(r, tip[k], Math.min(1, i / steps)));
    const chord = lead - trail;
    const row = [];
    for (let j = 0; j < around; j++) {
      const a = (2 * Math.PI * j) / around;
      const t = Math.sin(a) * (0.62 + 0.38 * Math.cos(a)) * chord * thick * 0.5 * (end ? 0.05 : 1);
      row.push([x + (end ? 2 : 0), y + t, (lead + trail) / 2 + Math.cos(a) * chord * 0.5 * (end ? 0.92 : 1)]);
    }
    rows.push(row);
  }
  return skin(rows, { wrap: true });
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
function normalOn(surf, u, v) {
  const e = 2e-3;
  const p = surf(u, v);
  _a.fromArray(surf(u + e, v)).sub(_b.fromArray(surf(u - e, v)));
  _c.fromArray(surf(u, v + e)).sub(_b.fromArray(surf(u, v - e)));
  _a.cross(_c).normalize();
  if (_a.x * p[0] + _a.y * (p[1] - 230) < 0) _a.negate(); // outward
  return [_a.x, _a.y, _a.z];
}
/** A piece of a surface, its normals taken from the surface itself: two pieces side by side shade as one. */
function patch(surf, [u0, u1], [v0, v1], nu, nv) {
  const pos = [];
  const nor = [];
  const index = [];
  for (let i = 0; i <= nu; i++) {
    for (let j = 0; j <= nv; j++) {
      const u = lerp(u0, u1, i / nu);
      const v = lerp(v0, v1, j / nv);
      pos.push(...surf(u, v));
      nor.push(...normalOn(surf, u, v));
      if (i < nu && j < nv) {
        const a = i * (nv + 1) + j;
        index.push(a, a + 1, a + nv + 2, a, a + nv + 2, a + nv + 1);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(index);
  return geo;
}

/**
 * The pane inside the cord's loop, already broken: every triangle is a shard that knows where it
 * will fly (the vertex shader moves it with `uCut`). Those along the loop stay: the broken fringe.
 */
function shatter(surf, seed) {
  const rand = rng(seed);
  const NU = 11;
  const NV = 9;
  const node = [];
  for (let i = 0; i <= NU; i++) {
    node.push([]);
    for (let j = 0; j <= NV; j++) {
      // nodes on the loop slide along it, the others wander: no two shards alike
      const du = i === 0 || i === NU ? 0 : (rand() - 0.5) * 0.74;
      const dv = j === 0 || j === NV ? 0 : (rand() - 0.5) * 0.74;
      node[i].push({ u: lerp(CORD.u[0], CORD.u[1], (i + du) / NU), v: lerp(CORD.v[0], CORD.v[1], (j + dv) / NV), rim: i === 0 || i === NU || j === 0 || j === NV });
    }
  }
  const pos = [];
  const nor = [];
  const mid = [];
  const out = [];
  const axis = [];
  const seeds = [];
  for (let i = 0; i < NU; i++) {
    for (let j = 0; j < NV; j++) {
      const [a, b, c, d] = [node[i][j], node[i + 1][j], node[i + 1][j + 1], node[i][j + 1]];
      for (const tri of rand() < 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]]) {
        const stuck = tri.filter((q) => q.rim).length >= 2 && rand() < 0.72;
        const cu = (tri[0].u + tri[1].u + tri[2].u) / 3;
        const cv = (tri[0].v + tri[1].v + tri[2].v) / 3;
        const n = normalOn(surf, cu, cv);
        const pull = 0.25 + rand() * 0.75; // a tooth of the fringe: its point drawn back toward the loop, more or less
        const throwBy = stuck ? 0 : 50 + rand() * 120;
        const o = [n[0] + (rand() - 0.5) * 0.8, n[1] + (rand() - 0.5) * 0.5, n[2] + (rand() - 0.5) * 0.8];
        _a.set(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
        const s = [rand(), stuck ? 0 : (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.9), stuck ? 0 : 0.45 + rand() * 0.55];
        const corners = tri.map((q) => surf(stuck && !q.rim ? lerp(cu, q.u, pull) : q.u, stuck && !q.rim ? lerp(cv, q.v, pull) : q.v));
        const middle = [0, 1, 2].map((k) => (corners[0][k] + corners[1][k] + corners[2][k]) / 3);
        for (const p of corners) {
          pos.push(...p);
          nor.push(...n);
          mid.push(...middle);
          out.push(o[0] * throwBy, o[1] * throwBy, o[2] * throwBy);
          axis.push(_a.x, _a.y, _a.z);
          seeds.push(...s);
        }
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("aCentre", new THREE.Float32BufferAttribute(mid, 3));
  geo.setAttribute("aOut", new THREE.Float32BufferAttribute(out, 3));
  geo.setAttribute("aAxis", new THREE.Float32BufferAttribute(axis, 3));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 3)); // when it leaves · how it spins · how much wind it takes (0: it stays)
  return geo;
}

const shardMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uCut: { value: 0 }, uAmount: { value: 1 }, uWind: { value: new THREE.Vector3(0, 80, -650) }, uColor: { value: INK.clone() }, uHot: { value: SIGNAL.clone() } },
    vertexShader: /* glsl */ `
      uniform float uCut; uniform vec3 uWind;
      attribute vec3 aCentre; attribute vec3 aOut; attribute vec3 aAxis; attribute vec3 aSeed;
      varying vec3 vN; varying vec3 vV; varying float vLife; varying float vFly;
      vec3 turn(vec3 p, vec3 k, float a) { float c = cos(a); float s = sin(a); return p * c + cross(k, p) * s + k * dot(k, p) * (1.0 - c); }
      void main() {
        float fly = step(1e-4, aSeed.z);
        float t = fly * clamp((uCut - aSeed.x * 0.16) / (1.0 - aSeed.x * 0.16), 0.0, 1.0);
        float angle = aSeed.y * t * 6.5;
        // thrown outward by the cord — a push that dies — then taken by the wind, which does not
        vec3 moved = aOut * (1.0 - (1.0 - t) * (1.0 - t)) + uWind * (aSeed.z * t * t);
        vec3 n = turn(normal, aAxis, angle);
        vec4 mv = modelViewMatrix * vec4(aCentre + turn(position - aCentre, aAxis, angle) + moved, 1.0);
        vN = normalize(normalMatrix * n); vV = normalize(-mv.xyz); vLife = t; vFly = fly;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uHot; uniform float uAmount, uCut;
      varying vec3 vN; varying vec3 vV; varying float vLife; varying float vFly;
      void main() {
        float facing = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float g = 1.0 - facing;
        // a pane in the air: its lip when it turns away, a glint when it faces the eye
        float light = 0.1 + 0.5 * g * g + 0.45 * pow(facing, 24.0) * vFly;
        float hot = pow(clamp(1.0 - uCut, 0.0, 1.0), 5.0);
        float gone = 1.0 - smoothstep(0.7, 1.0, vLife);
        gl_FragColor = vec4((uColor * light * mix(0.55, 1.0, vFly) + uHot * hot * 0.14) * gone * uAmount, 1.0);
      }`,
  });

// what burns behind a nozzle: brightest on its axis, dying along its length — a gradient, never a solid cone
const flameMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uAmount: { value: 0 }, uCore: { value: INK.clone().multiplyScalar(1.6) }, uColor: { value: SIGNAL.clone().multiplyScalar(1.5) } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vU;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vU = uv.y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCore, uColor; uniform float uAmount; varying vec3 vN; varying vec3 vV; varying float vU;
      void main() {
        float f = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 1.5);
        float along = pow(clamp(1.0 - vU, 0.0, 1.0), 1.7) * smoothstep(0.0, 0.05, vU);
        gl_FragColor = vec4(mix(uCore, uColor, smoothstep(0.0, 0.3, vU)) * f * along * uAmount, 1.0);
      }`,
  });

/**
 * The air going by. Each mote is drawn as the line it covers while the shutter is open — its head
 * bright, its tail gone — three pixels wide whatever its distance: a dot would hop, and a mote near
 * the lens would be a slab across the picture. Too slow to be a line, it is not drawn at all.
 * `uTravel`: cm covered · `uLen`: cm of streak.
 */
function makeStreaks({ count = 170, seed = 7, min, size }) {
  const rand = rng(seed);
  const base = [];
  const seeds = [];
  const corner = [];
  const index = [];
  for (let i = 0; i < count; i++) {
    const p = [min[0] + rand() * size[0], min[1] + rand() * size[1], min[2] + rand() * size[2]];
    const s = [rand(), 0.3 + rand() * 0.7];
    for (const c of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
      base.push(...p);
      seeds.push(...s);
      corner.push(...c);
    }
    index.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 3, i * 4 + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(base, 3));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 2));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute(corner, 2));
  geo.setIndex(index);
  const uniforms = {
    uTravel: { value: 0 }, uLen: { value: 0 }, uAmount: { value: 0 }, uColor: { value: INK.clone() },
    uMin: { value: new THREE.Vector3(...min) }, uSize: { value: new THREE.Vector3(...size) }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uTravel, uLen, uAmount; uniform vec3 uMin, uSize; uniform vec2 uView;
        attribute vec2 aSeed; attribute vec2 aCorner; varying float vA; varying float vSide;
        void main() {
          float k = 0.6 + 0.4 * aSeed.x; // not all at one speed: that is the depth of the air
          vec3 p = position;
          p.z -= uTravel * k;
          p = uMin + mod(p - uMin, uSize);
          vec3 q = (p - uMin) / uSize;
          float inside = smoothstep(0.0, 0.12, q.x) * smoothstep(1.0, 0.88, q.x) * smoothstep(0.0, 0.12, q.y) * smoothstep(1.0, 0.88, q.y) * smoothstep(0.0, 0.1, q.z) * smoothstep(1.0, 0.9, q.z);
          vec4 a = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(p + vec3(0.0, 0.0, uLen * k), 1.0);
          vSide = aCorner.y;
          vA = 0.0;
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (a.w > 40.0 && b.w > 40.0) {
            vec2 run = (b.xy / b.w - a.xy / a.w) * uView * 0.5;
            float l = length(run);
            vec2 n = l > 1e-3 ? vec2(-run.y, run.x) / l : vec2(0.0, 1.0);
            vec4 c = mix(a, b, aCorner.x);
            c.xy += n * aCorner.y * (3.0 / uView) * c.w;
            gl_Position = c;
            vA = aSeed.y * inside * uAmount * (1.0 - aCorner.x) * smoothstep(8.0, 60.0, l) * clamp(1400.0 / c.w, 0.2, 1.0);
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA; varying float vSide;
        void main() { gl_FragColor = vec4(uColor * vA * (1.0 - abs(vSide)), 1.0); }`,
    }),
  );
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

/**
 * The sky and the ground, drawn at infinity behind everything: nothing here is an object the far
 * plane could cut. The ground is where each ray of the eye meets the plane `uAlt` below the group —
 * a grid whose every level leaves before its cells get too small to draw (no shimmer, no grey slab
 * near the horizon), spread along its run like anything moving in front of a shutter; and on it the
 * runway: two edges, the dashes of its centre line, the keys of its thresholds.
 */
const backdropMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uInk: { value: INK.clone() }, uOrigin: { value: new THREE.Vector3() },
      uAlt: { value: 0 }, uTravel: { value: 0 }, uTravelGrid: { value: 0 }, uSmear: { value: 0 },
      uGround: { value: 1 }, uSky: { value: 1 }, uRunway: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position; // the dome follows the eye and never turns: the horizon stays level, and stays far
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uOrigin;
      uniform float uAlt, uTravel, uTravelGrid, uSmear, uGround, uSky, uRunway;
      varying vec3 vDir;
      const float HALF = 2250.0;                 // a runway 45 m wide
      const float FROM = -30000.0, TO = 210000.0; // 2.4 km long, 300 m of it behind the aircraft when travel = 0
      float lines(float q, float smear) {
        float w = max(fwidth(q) * 1.5, 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        float reach = max(w, 0.5 * smear);
        return (w / reach) * (1.0 - smoothstep(reach - w, reach, d));
      }
      float level(vec2 p, float cell, float smear) {
        vec2 q = p / cell;
        vec2 fw = fwidth(q);
        float show = smoothstep(4.0, 16.0, 1.0 / max(max(fw.x, fw.y), 1e-5)); // pixels per cell
        return show * max(lines(q.x, 0.0), lines(q.y, smear / cell));
      }
      // paint that stays readable from 200 m up or far down the runway, like on a map: never less than px pixels on
      // each side of its line — until that would be the runway itself (on the horizon), where it goes out
      float mark(float x, float size, float px) {
        float w = max(fwidth(x), 1e-4);
        float h = max(size, w * px);
        return (1.0 - smoothstep(h - w * 0.75, h + w * 0.75, abs(x))) * (1.0 - smoothstep(700.0, 2600.0, w * px));
      }
      float painted(float z, float period, float on) { float k = floor(z / period); return k * on + min(z - k * period, on); }
      // how much of what the shutter sweeps is paint, for dashes on long every period
      float dashes(float z, float period, float on, float smear) {
        float s = max(max(smear, fwidth(z) * 1.5), 1.0);
        return clamp((painted(z + 0.5 * s, period, on) - painted(z - 0.5 * s, period, on)) / s, 0.0, 1.0);
      }
      // a lamp on the ground: never smaller than a few pixels — seen from the runway itself, paint is a hairline under the
      // horizon, and it is its lamps that say "runway". At speed each lamp is the line it draws while the shutter is open
      float lamps(float x, float z, float period, float smear) {
        float wx = max(fwidth(x), 1e-4);
        float wz = max(fwidth(z), 1e-4);
        float rx = max(26.0, wx * 2.2);
        float on = max(52.0, wz * 2.2);
        float s = max(max(smear, wz * 1.5), 1.0);
        float lit = clamp(dashes(z, period, on, smear) * sqrt(max(s / on, 1.0)), 0.0, 1.0);
        return (1.0 - smoothstep(rx * 0.35, rx, abs(x))) * lit * (1.0 - 0.7 * smoothstep(period * 0.2, period * 0.7, on));
      }
      float span(float z, float from, float to) { float w = max(fwidth(z), 1.0); return smoothstep(from - w, from + w, z) * (1.0 - smoothstep(to - w, to + w, z)); }
      float stratum(vec3 d, float h, float height, float far, float width, float k1, float k2, float phase) {
        float az = atan(d.x, d.z + 1e-6);
        float wisp = smoothstep(0.35, 0.9, 0.5 + 0.5 * sin(az * k1 + phase) * sin(az * k2 + phase * 1.7));
        float x = (d.y - (height - h) / far) / width;
        return exp(-x * x) * wisp;
      }
      void main() {
        vec3 d = normalize(vDir);
        float h = max(cameraPosition.y - (uOrigin.y - uAlt), 1.0); // the eye above the ground
        float t = h / max(-d.y, 1e-4);
        vec2 p = cameraPosition.xz + d.xz * t - uOrigin.xz;
        float below = smoothstep(0.0, 0.002, -d.y);
        float zr = p.y + uTravel;
        vec2 g = vec2(p.x, p.y + uTravelGrid);
        float strip = span(zr, FROM, TO) * (1.0 - smoothstep(HALF + 40.0, HALF + 60.0 + fwidth(p.x), abs(p.x)));
        // (the brightest level wins: added up, the lines that four levels share would be four times too bright)
        float grid = max(max(level(g, 500.0, uSmear) * 0.3, level(g, 2500.0, uSmear) * 0.55), max(level(g, 12500.0, uSmear) * 0.85, level(g, 62500.0, uSmear)));
        float keys = (span(zr, FROM + 600.0, FROM + 3600.0) + span(zr, TO - 3600.0, TO - 600.0))
          * (1.0 - smoothstep(0.2, 0.3, abs(fract(p.x / 360.0) - 0.5))) * (1.0 - smoothstep(1700.0, 1800.0, abs(p.x)))
          * smoothstep(4.0, 12.0, 360.0 / max(fwidth(p.x), 1e-3));
        // (thin paint: from a camera on the runway, a centre line at its true 90 cm is a grey beam across the picture)
        float marks = mark(abs(p.x) - HALF, 12.0, 2.5) + mark(p.x, 8.0, 1.6) * dashes(zr, 5000.0, 3000.0, uSmear) + keys * 0.8;
        float far = exp(-t / (260000.0 + 12.0 * uAlt));
        // from high up the runway is a strip a shade lighter than the land, and the land shows more of its lines;
        // from its own level that shade would be a slab under the wheels
        float high = smoothstep(1500.0, 12000.0, h);
        vec3 col = uInk * (grid * 0.105 * (1.0 + 1.3 * high) * (1.0 - 0.35 * strip * uRunway) + (marks * 0.26 + 0.02 * high) * strip * uRunway) * far * below * uGround;
        float lights = lamps(abs(p.x) - (HALF + 60.0), zr, 6000.0, uSmear) + 0.7 * lamps(p.x, zr + 800.0, 3000.0, uSmear);
        col += uInk * lights * 1.25 * span(zr, FROM, TO) * far * below * uRunway * uGround;

        // the horizon: a thin line, and the air above it; then three strata of cloud, which sink toward it as one climbs
        float air = 0.13 * exp(-abs(d.y) / 0.0016) + step(0.0, d.y) * 0.03 * exp(-d.y / 0.12);
        float cloud = stratum(d, h, 30000.0, 500000.0, 0.0026, 9.0, 23.0, 0.6) * 0.06
          + stratum(d, h, 90000.0, 900000.0, 0.004, 7.0, 17.0, 2.1) * 0.045
          + stratum(d, h, 220000.0, 1500000.0, 0.006, 5.0, 13.0, 4.0) * 0.035;
        col += uInk * (air + cloud * step(0.0, d.y)) * uSky;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the set */

export function buildJet() {
  const group = new THREE.Group();
  const plane = new THREE.Group(); // what pitches
  plane.rotation.order = "YXZ";
  group.add(plane);
  const fx = {};
  const A = {};

  /* ── the airframe: one shell of glass ── */
  // (dimmer than a figure's glass: seen along its length, most of a fuselage turns away from the eye — at the usual
  // strength its two engine pods are two neon tubes)
  fx.hull = glass(BRAND.ink, { base: 0, rim: 0.12, power: 3, edge: 0.32, spec: 0, through: 0.22 });
  // large flat panes: seen at a grazing angle, the rim and the lip of a fuselage would turn a whole wing into a grey slab
  // (these are linear values: 0.06 is already a quarter of the way to white on the screen)
  fx.wings = glass(BRAND.ink, { base: 0.002, rim: 0.045, power: 3, edge: 0.07, spec: 0, through: 0.2 });
  fx.canopy = glass(BRAND.ink, { base: 0, rim: 0.2, power: 3, edge: 0.5, spec: 0.8, through: 0.3 });
  fx.gearGlass = glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.6, edge: 0.4, spec: 0, through: 0.2 });
  const panes = [];
  const pane = (geometry, material, parent = plane) => {
    const mesh = new THREE.Mesh(geometry, material);
    parent.add(mesh);
    panes.push(mesh);
    return mesh;
  };

  const zs = (() => {
    const breaks = Object.values(CANOPY);
    const list = [JET.nose - 3, JET.nose - 8, -640, -652, ...breaks];
    for (let z = JET.nose; z > -640; z -= 15) if (!breaks.some((b) => Math.abs(b - z) < 7)) list.push(z);
    return list.sort((a, b) => b - a);
  })();
  const rings = zs.map(bodyRing);
  // open where the canopy sits: with its pane cut away, the cockpit is open to the sky
  pane(skin(rings, { wrap: true, keep: (i, j) => !(zs[i] <= CANOPY.front && zs[i + 1] >= CANOPY.rear && j >= SILL && j < AROUND / 2 - SILL) }), fx.hull);

  const podZ = [];
  for (let z = POD[0][0]; z > POD.at(-1)[0]; z -= 30) podZ.push(z);
  podZ.push(POD.at(-1)[0]);
  for (const side of [1, -1]) {
    pane(skin(podZ.map((z) => podRing(z, side)), { wrap: true }), fx.hull);
    pane(skin([circle(side * 45, 199, -612, 36.5), circle(side * 45, 199, -650, 33), circle(side * 45, 199, JET.tail, 28)], { wrap: true }), fx.hull);
  }

  const wing = aerofoil(WING);
  const canard = aerofoil(CANARD, { thick: 0.05, steps: 4 });
  for (const side of [1, -1]) {
    pane(side > 0 ? wing : wing.clone().scale(-1, 1, 1), fx.wings);
    pane(side > 0 ? canard : canard.clone().scale(-1, 1, 1), fx.wings);
    // the missile on its rail, at the tip: no Rafale flies without them
    const missile = pane(new THREE.CapsuleGeometry(7, 290, 6, 16).rotateX(Math.PI / 2), fx.hull);
    missile.position.set(side * 537, 192, -285);
  }
  pane(aerofoil(FIN, { thick: 0.04 }).rotateZ(Math.PI / 2), fx.wings);
  const fairing = pane(new THREE.CapsuleGeometry(8, 120, 6, 16).rotateX(Math.PI / 2), fx.hull); // at the top of the fin
  fairing.position.set(0, 528, -565);

  /* ── a few lines of structure: frames, keel, spars — and the outline of everything that flies ── */
  const frames = [];
  const outline = [];
  const run = (list, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) list.push(...pts[i], ...pts[i + 1]);
    if (closed) list.push(...pts.at(-1), ...pts[0]);
  };
  for (const z of [720, 150, 0, -200, -400, -540]) run(frames, bodyRing(z).filter((_, j) => j % 2 === 0), true);
  for (const j of [0, AROUND / 2, (AROUND * 3) / 4]) run(frames, rings.map((ring) => ring[j]));
  run(frames, rings.filter((_, i) => zs[i] >= CANOPY.front).map((ring) => ring[AROUND / 4]));
  run(frames, rings.filter((_, i) => zs[i] <= CANOPY.rear).map((ring) => ring[AROUND / 4]));
  const edge = ({ root, tip }, side, at) => at(side * root[0], root[1], tip[0] * side, tip[1], root, tip);
  for (const side of [1, -1]) {
    run(outline, podRing(POD[0][0], side), true); // the lip of the air intake
    run(frames, podRing(0, side).filter((_, j) => j % 2 === 0), true);
    run(frames, podRing(-450, side).filter((_, j) => j % 2 === 0), true);
    run(outline, circle(side * 45, 199, JET.tail, 28), true);
    run(frames, circle(side * 45, 199, -612, 36.5, 20), true);
    for (const s of [WING, CANARD]) {
      edge(s, side, (x0, y0, x1, y1, root, tip) => {
        run(outline, [[x0, y0, root[2]], [x1, y1, tip[2]], [x1, y1, tip[3]], [x0, y0, root[3]]]);
        // two spars, and the line the control surface hinges on
        for (const f of s === WING ? [0.34, 0.6, 0.84] : [0.5]) run(frames, [[x0, y0, lerp(root[2], root[3], f)], [x1, y1, lerp(tip[2], tip[3], f)]]);
      });
    }
  }
  run(outline, [[0, FIN.root[0], FIN.root[2]], [0, FIN.tip[0], FIN.tip[2]], [0, FIN.tip[0], FIN.tip[3]], [0, FIN.root[0], FIN.root[3]]]);
  run(frames, [[0, FIN.root[0], lerp(FIN.root[2], FIN.root[3], 0.72)], [0, FIN.tip[0], lerp(FIN.tip[2], FIN.tip[3], 0.6)]]);
  // the probe at the tip of the nose, and the refuelling one, fixed, on its right: a Rafale's signature
  run(outline, [[0, 200, JET.nose], [0, 199, JET.nose + 34]]);
  run(outline, [[-30, 243, 650], [-37, 261, 674], [-38, 267, 744]]);
  const segments = (list, material) => {
    const geo = new LineSegmentsGeometry();
    geo.setPositions(list);
    const lines = new LineSegments2(geo, material);
    lines.frustumCulled = false;
    lines.renderOrder = 2;
    plane.add(lines);
    return lines;
  };
  fx.frames = lineMat(BRAND.ink, 1.9, { opacity: 0.3 });
  fx.outline = lineMat(BRAND.ink, 2.3, { opacity: 0.8 });
  segments(frames, fx.frames);
  segments(outline, fx.outline);

  /* ── the canopy: a windscreen, then two halves — each a frame of glass that stays and a pane that will not ── */
  const front = canopySurf(CANOPY.front, CANOPY.arch);
  pane(patch(front, [0, 1], [0, 1], 8, 28), fx.canopy);
  fx.cordHot = new THREE.Color();
  const half = (zA, zB, seed) => {
    const surf = canopySurf(zA, zB);
    const { u, v } = CORD;
    const band = pane(mergeGeometries([patch(surf, [0, 1], [0, v[0]], 22, 4), patch(surf, [0, 1], [v[1], 1], 22, 4), patch(surf, [0, u[0]], v, 3, 22), patch(surf, [u[1], 1], v, 3, 22)]), fx.canopy);
    const panel = pane(patch(surf, u, v, 20, 22), fx.canopy);
    const shards = new THREE.Mesh(shatter(surf, seed), shardMat());
    shards.frustumCulled = false; // its vertices fly
    shards.renderOrder = 6;
    shards.visible = false;
    plane.add(shards);
    // the cord: a loop near the frame and a line down the middle, laid on the glass
    const cord = lineMat(BRAND.ink, 2.2, { opacity: 0.42 });
    const lay = (uv) => {
      const geo = new LineGeometry();
      geo.setPositions(uv.flatMap(([cu, cv]) => {
        const p = surf(cu, cv);
        const n = normalOn(surf, cu, cv);
        return [p[0] + n[0] * 0.6, p[1] + n[1] * 0.6, p[2] + n[2] * 0.6];
      }));
      const line = new Line2(geo, cord);
      line.renderOrder = 4;
      plane.add(line);
      return line;
    };
    const N = 14;
    const loop = [];
    for (let k = 0; k < N; k++) loop.push([lerp(u[0], u[1], k / N), v[0]]);
    for (let k = 0; k < N; k++) loop.push([u[1], lerp(v[0], v[1], k / N)]);
    for (let k = 0; k < N; k++) loop.push([lerp(u[1], u[0], k / N), v[1]]);
    for (let k = 0; k <= N; k++) loop.push([u[0], lerp(v[1], v[0], k / N)]);
    lay(loop);
    const spine = lay(Array.from({ length: N + 1 }, (_, k) => [lerp(u[0], u[1], k / N), 0.5]));
    return { band, panel, shards, cord, spine };
  };
  fx.front = half(CANOPY.arch, CANOPY.mid, 7);
  fx.rear = half(CANOPY.mid, CANOPY.rear, 19);

  // its frame, solid: three arches and two sills — what is left when the glass is gone
  const frameMat = solid(0x7b8287, { rough: 0.45, metal: 0.4 });
  fx.frameTubes = [];
  const tube = (pts, r = 1.7) => {
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 64, r, 8), frameMat);
    mesh.receiveShadow = true;
    plane.add(mesh);
    fx.frameTubes.push(mesh);
    return mesh;
  };
  const arc = (z, n = 28) => Array.from({ length: n + 1 }, (_, k) => onSection(section(z), A0 + ((Math.PI - 2 * A0) * k) / n));
  for (const z of [CANOPY.arch, CANOPY.mid, CANOPY.rear]) tube(arc(z), z === CANOPY.arch ? 2.2 : 1.8);
  tube(arc(CANOPY.front), 1.2);
  for (const a of [A0, Math.PI - A0]) tube(Array.from({ length: 25 }, (_, k) => onSection(section(lerp(CANOPY.front, CANOPY.rear, k / 24)), a)), 1.5);

  /* ── the cockpit, solid: a floor, two instrument panels, and behind each place a bulkhead with its two leaning rails ── */
  // matt: a varnished floor mirrors the rim light into a slab of colour
  const dark = solid(0x15191c, { rough: 0.88, env: 0.5 });
  const grey = solid(0x343a40, { rough: 0.82, metal: 0.1, env: 0.6 });
  const steel = solid(0x9a9fa2, { rough: 0.4, metal: 0.45 }); // the rails: the lightest thing in there, they are what the seat rides on
  fx.cockpit = []; // every solid piece of the cockpit that is fixed straight to the aircraft (`cockpit: 0` takes them all away)
  const part = (geometry, material, { pos, rot, parent = plane, edges = 0.5 } = {}) => {
    const mesh = new THREE.Mesh(geometry, material);
    if (pos) mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (edges) mesh.add(edgesOf(geometry, { width: 1.8, opacity: edges }));
    parent.add(mesh);
    if (parent === plane) fx.cockpit.push(mesh);
    return mesh;
  };
  part(box(74, 3, 330, 0.8), dark, { pos: [0, JET.floor - 1.5, 427], edges: 0.4 });
  fx.screens = glow(BRAND.ink, 0.4);
  const panel = (z, y, w) => {
    part(box(w, 25, 4, 0.8), dark, { pos: [0, y, z] });
    part(box(w + 5, 3.5, 26, 1.2), dark, { pos: [0, y + 15, z + 5], edges: 0.4 });
    for (const x of [-w / 3, 0, w / 3]) {
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(w / 3.9, 11), fx.screens);
      screen.position.set(x, y, z - 2.2);
      screen.rotation.y = Math.PI;
      plane.add(screen);
      fx.cockpit.push(screen);
    }
  };
  panel(566, 238, 57);
  panel(450, 244, 54);
  fx.consoles = [];
  for (const z of [530, 380]) for (const x of [-37, 37]) fx.consoles.push(part(box(10, 10, 118, 1), dark, { pos: [x, 211, z], edges: 0.35 }));
  // the head-up display: a small pane standing on the front coaming
  const hud = new THREE.Mesh(new THREE.PlaneGeometry(15, 13), glass(BRAND.ink, { base: 0.03, rim: 0.3, power: 2 }));
  hud.position.set(0, 266, 572);
  hud.rotation.x = -0.6;
  hud.add(edgesOf(hud.geometry, { width: 1.8, opacity: 0.6 }));
  plane.add(hud);
  fx.cockpit.push(hud);

  const bay = (name, [x, y, z]) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.x = -JET.recline * DEG; // +y runs up the rails, +z out of the seat's back
    plane.add(g);
    fx.cockpit.push(g);
    part(box(60, 92, 3, 0.6), grey, { parent: g, pos: [0, 38, -9.5], edges: 0.4 });
    // The rails, cut like the seat's own (model.js: two beams 38 cm apart, three ties). A seat brings its pair with it;
    // these are hidden until the film says the place is empty (`railsRear` / `railsFront`): the seat has flown, its
    // rails stayed — and the swap from one pair to the other cannot be seen.
    // With them, what the gun leaves behind once it has fired: its inner stage on the floor, its middle stage drawn out
    // half-way up (where model.js leaves them at `gun` = 1) — the seat can leave or come back without anything popping.
    const rails = new THREE.Group();
    for (const sx of [-19, 19]) {
      part(box(5, 132, 4.5, 0.5), left.steel, { parent: rails, pos: [sx, 66, 2.25], edges: 0.55 });
      part(box(9.5, 4, 9.5, 0.7), left.cast, { parent: rails, pos: [sx, 2, 10], edges: 0.5 });
      part(cyl(2.9, 90, 0.25, 40), left.bright, { parent: rails, pos: [sx, 49, 10], edges: 0.45 });
      part(cyl(3.6, 90, 0.25, 40), left.hero, { parent: rails, pos: [sx, 124, 10], edges: 0.45 });
    }
    for (const sy of [5, 66, 127]) part(box(34, 4, 2.6, 0.5), left.cast, { parent: rails, pos: [0, sy, 1.6], edges: 0.45 });
    part(box(30, 3, 5, 0.6), left.cast, { parent: rails, pos: [0, 1.5, 10], edges: 0.45 });
    rails.visible = false;
    g.add(rails);
    fx.bayRails[name] = rails;
    // where the film mounts the seat: the same frame, empty
    const mount = new THREE.Object3D();
    mount.name = name;
    mount.position.copy(g.position);
    mount.rotation.copy(g.rotation);
    plane.add(mount);
    return mount;
  };
  fx.bayRails = {};
  // the seat's own metals (model.js), for what it leaves in the aircraft
  const left = {
    steel: solid(0x6f7a83, { rough: 0.42, metal: 0.4, env: 1.1 }),
    cast: solid(0x2f383f, { rough: 0.56, metal: 0.25, coat: 0.45, coatRough: 0.4 }),
    bright: solid(0xb9c0c4, { rough: 0.34, metal: 0.45, env: 1.3 }),
    hero: solid(0xd2d6d8, { rough: 0.4, metal: 0.25, env: 1.2 }),
  };
  A.seatFront = bay("seatFront", JET.seatFront);
  A.seatRear = bay("seatRear", JET.seatRear);

  /* ── the gear: simple, and it folds forward into the belly ── */
  fx.gearLines = [];
  const leg = (pivot, foot, wheels, r, wide) => {
    const g = new THREE.Group();
    g.position.set(...pivot);
    for (const pts of [[[0, 0, 0], foot], [[0, -34, 46], [foot[0] * 0.6, foot[1] * 0.6, foot[2] * 0.6]]]) {
      const strut = fatLine(pts, { width: 3, opacity: 0.75 });
      fx.gearLines.push(strut.material);
      g.add(strut);
    }
    const tyre = new THREE.CylinderGeometry(r, r, wide, 40).rotateZ(Math.PI / 2); // no spokes: thin lines spinning only flicker
    for (const x of wheels) {
      const wheel = pane(tyre, fx.gearGlass, g);
      wheel.position.set(foot[0] + x, foot[1], foot[2]);
      const rim = edgesOf(tyre, { width: 2, opacity: 0.7, threshold: 40 });
      fx.gearLines.push(rim.material);
      wheel.add(rim);
    }
    plane.add(g);
    return g;
  };
  fx.gear = [leg([0, 162, 520], [0, -138, 8], [-11, 11], 24, 13), leg([92, 172, 0], [36, -138, 0], [0], 34, 24), leg([-92, 172, 0], [-36, -138, 0], [0], 34, 24)];

  asShell(panes, 20);

  /* ── the two engines: a disc of fire deep in each nozzle, and what burns behind ── */
  fx.core = glow(BRAND.signal, 0); // one-sided: seen from the front through the glass, it would be a ball of fire in the belly
  fx.flame = flameMat();
  fx.flames = [];
  for (const side of [1, -1]) {
    const core = new THREE.Mesh(new THREE.CircleGeometry(27, 40), fx.core);
    core.position.set(side * 45, 199, -640);
    core.rotation.y = Math.PI;
    const flame = new THREE.Mesh(new THREE.CylinderGeometry(7, 27, 1, 40, 12, true).translate(0, 0.5, 0).rotateX(-Math.PI / 2), fx.flame);
    flame.position.set(side * 45, 199, -642);
    flame.renderOrder = 5;
    plane.add(core, flame);
    fx.flames.push(flame);
    A[side > 0 ? "nozzleL" : "nozzleR"] = anchor(plane, side * 45, 199, JET.tail);
  }

  A.canopy = anchor(plane, 0, 329, CANOPY.mid);
  A.canopyFront = anchor(plane, 0, 324, 468);
  A.canopyRear = anchor(plane, 0, 326, 318);
  A.headFront = anchor(plane, 0, 295, 470);
  A.headRear = anchor(plane, 0, 299, 320);
  A.nose = anchor(plane, 0, 200, JET.nose);
  A.tail = anchor(plane, 0, 199, JET.tail);
  A.fin = anchor(plane, 0, JET.height, -568);
  A.wingL = anchor(plane, 537, 192, -285);
  A.wingR = anchor(plane, -537, 192, -285);
  A.intake = anchor(plane, 60, 176, 345);
  A.cg = anchor(plane, 0, 215, 0);

  /* ── the world ── */
  fx.backdrop = backdropMat();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), fx.backdrop);
  dome.frustumCulled = false;
  dome.renderOrder = -50; // first: everything else is in front of it
  group.add(dome);

  const land = new THREE.Group(); // what stays on the ground when the aircraft climbs
  group.add(land);
  fx.pool = makePool({ radius: 1000, color: BRAND.ink });
  fx.pool.mesh.scale.set(0.85, 1.3, 1);
  fx.pool.mesh.position.set(0, 0.6, 60);
  fx.contact = makeContact({ amount: 0.4 });
  fx.contact.scale.set(420, 1250, 1);
  fx.contact.position.set(0, 1.2, 60);
  // what the two nozzles throw on the runway behind them
  fx.burn = makePool({ radius: 1000, color: BRAND.signal });
  fx.burn.mesh.scale.set(0.6, 1.5, 1);
  fx.burn.mesh.position.set(0, 0.9, -1350);
  land.add(fx.pool.mesh, fx.contact, fx.burn.mesh);
  A.runway = anchor(land, 0, 0, 0);

  fx.air = makeStreaks({ min: [-1600, -500, -3000], size: [3200, 1900, 6000] });
  group.add(fx.air.mesh);

  const fold = [-102 * DEG, -96 * DEG, -96 * DEG];
  const tint = new THREE.Color();
  const cutHalf = (h, cut, cord, amount) => {
    const open = cut > 0.0005;
    h.panel.visible = !open;
    h.spine.visible = !open;
    h.shards.visible = open;
    h.shards.material.uniforms.uCut.value = cut;
    h.shards.material.uniforms.uAmount.value = amount;
    const k = clamp01(cord);
    h.cord.color.copy(tint.copy(INK).lerp(SIGNAL, clamp01(k * 1.6)).multiplyScalar(1 + k * 3));
    h.cord.opacity = (0.42 + 0.58 * k) * (0.3 + 0.7 * amount);
    h.cord.linewidth = 2.2 + 1.8 * k;
  };

  /**
   * Everything 0–1 unless said otherwise; every field has a default (the aircraft parked, whole).
   *   gear      1 down → 0 folded away                  pitch / roll   degrees (nose up, right wing down)
   *   alt       cm above the runway                     thrust         the two nozzles
   *   speed     how fast the world goes by (1 = 520 km/h): the streaks, the smear of the ground
   *   travel    cm covered since the start — the ground slides by that much. Tween it for a speed
   *             that changes; without it the ground runs at `speed`, which then must not change
   *   step      cm covered during one frame (default: from `speed`)
   *   cord      the cutting cord alight                 cut            0 whole → 1 open, the shards gone
   *   cordFront / cordRear, canopyFront / canopyRear    each half on its own (default: cord, cut)
   *   shell     the glass and the lines of the airframe (0: only the cockpit is left)
   *   canopy    the glass of the canopy (default: follows `shell`, never below 0.35)
   *   consoles  0 takes away the four side consoles, when a close shot must see the seat pan from the side
   *   railsRear / railsFront   1 shows the bare rails of a place whose seat has left (a seat mounted there has its own)
   *   frame     0 takes away the canopy's solid frame (arches and sills): from a camera at the sill, a tube across the picture
   *   cockpit   0 takes away every solid piece of the cockpit (floor, panels, consoles, bulkheads): only what the film mounts is left
   *   streaks / ground / sky / runway / pool            each layer of the world (default 1 — the streaks follow `speed`)
   */
  function update(S = {}, time = 0) {
    const alt = Math.max(0, S.alt ?? 0);
    const speed = S.speed ?? 0;
    const travel = S.travel ?? time * speed * JET.speed;
    const step = S.step ?? (speed * JET.speed) / 30;
    const shell = S.shell ?? 1;
    const gear = S.gear ?? 1;
    const thrust = S.thrust ?? 0;

    plane.rotation.set(-(S.pitch ?? 0) * DEG, 0, (S.roll ?? 0) * DEG);
    land.position.y = -alt;

    fx.hull.uniforms.uAmount.value = shell;
    fx.wings.uniforms.uAmount.value = shell;
    const canopy = S.canopy ?? 0.35 + 0.65 * shell;
    fx.canopy.uniforms.uAmount.value = canopy;
    fx.frames.opacity = fx.frames.userData.base * (0.12 + 0.88 * shell);
    fx.outline.opacity = fx.outline.userData.base * (0.2 + 0.8 * shell);
    cutHalf(fx.front, S.canopyFront ?? S.cut ?? 0, S.cordFront ?? S.cord ?? 0, canopy);
    cutHalf(fx.rear, S.canopyRear ?? S.cut ?? 0, S.cordRear ?? S.cord ?? 0, canopy);
    const cockpit = (S.cockpit ?? 1) > 0.5;
    for (const mesh of fx.cockpit) mesh.visible = cockpit;
    for (const console of fx.consoles) console.visible = cockpit && (S.consoles ?? 1) > 0.5;
    for (const tube of fx.frameTubes) tube.visible = (S.frame ?? 1) > 0.5;
    fx.bayRails.seatRear.visible = (S.railsRear ?? 0) > 0.5;
    fx.bayRails.seatFront.visible = (S.railsFront ?? 0) > 0.5;

    const down = smooth(0, 1, gear);
    fx.gear.forEach((g, i) => {
      g.rotation.x = fold[i] * (1 - down);
      g.visible = gear > 0.02;
    });
    fx.gearGlass.uniforms.uAmount.value = shell * smooth(0.02, 0.3, gear);
    for (const m of fx.gearLines) m.opacity = m.userData.base * (0.2 + 0.8 * shell) * smooth(0.02, 0.3, gear);

    setGlow(fx.core, thrust * 2.8);
    // a slow breath, never a flutter: a glow that blinks several times a second reads as a fault
    fx.flame.uniforms.uAmount.value = thrust * (0.93 + 0.07 * Math.sin(time * 2.9));
    for (const flame of fx.flames) {
      flame.visible = thrust > 0.01;
      flame.scale.z = 140 + 430 * thrust;
    }

    const u = fx.backdrop.uniforms;
    group.updateWorldMatrix(true, false);
    u.uOrigin.value.setFromMatrixPosition(group.matrixWorld);
    u.uAlt.value = alt;
    u.uTravel.value = travel;
    u.uTravelGrid.value = travel % 62500; // the grid repeats: keep its numbers small, its lines stay sharp after kilometres
    u.uSmear.value = step * 1.4;
    u.uGround.value = S.ground ?? 1;
    u.uSky.value = S.sky ?? 1;
    u.uRunway.value = S.runway ?? 1;
    const near = 1 - smooth(200, 1500, alt);
    fx.pool.uniforms.uAmount.value = (S.pool ?? 1) * 0.05 * near;
    fx.contact.material.uniforms.uAmount.value = 0.4 * near;
    fx.contact.visible = fx.pool.mesh.visible = near > 0.01;
    const lit = thrust * (1 - smooth(60, 1000, alt));
    fx.burn.uniforms.uAmount.value = lit * 0.2;
    fx.burn.mesh.visible = lit > 0.01;

    fx.air.uniforms.uAmount.value = (S.streaks ?? speed) * 0.5;
    fx.air.uniforms.uTravel.value = travel;
    fx.air.uniforms.uLen.value = step * 2;
  }
  update();

  return { group, plane, fx, A, update };
}
