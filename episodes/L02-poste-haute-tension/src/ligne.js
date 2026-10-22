// DOSSIER L02 — Poste haute tension : THE LINES — pylons and conductors, the line in the country (the helicopter of
// July 2025, Virginia 1987) and the map of France.
//
//   makePylon({ h, arms, reach, earthWire }) → { group, A: { mine: [3 Object3D], voisine: [3 Object3D], top } }
//                 a double-circuit lattice tower seen like an X-ray, its foot at its local origin, its crossarms along z:
//                 YOUR circuit hangs on the +z arms, THE NEIGHBOUR's on the −z arms (bottom → top: arms[0..2]).
//                 The anchors are the centres of the conductor bundles, under the insulator strings
//   makeCorridor({ from, dir, span, n, sag, pylon, first }) → { group, A: { towers }, set(p, time, px) }
//                 n spans of the double circuit from the tower at `from` ([x, y, z]) toward `dir` (−1: −x, +1: +x),
//                 `span` apart, conductors sagging `sag` at mid-span; `first`: the tower at `from` is drawn too.
//                 Used by world.js in the POSTE (the corridor that leaves it, from the last pylon) — the far fault of
//                 the incident (`defect`) burns on one of its far towers
//   buildLigne() → { group, corridor, A: { phases(x) → three [x, y, z] of YOUR circuit's conductors at x, heli, basket,
//                 apprentice }, set(p, time, px) }   the LIGNE place: the corridor along +x (plan.js · LINE), its ground,
//                 its sky; the helicopter of glass, its sling and its basket (solid: it is a tool), the two technicians
//                 in it, the spacers (plan.js · HELI); Virginia 1987: the apprentice and his mate (figures of glass).
//                 The earthing sets of 1987 are model.js's (world.js hangs them on the towers of V87)
//   buildMap() → { group, set({ dots, links, here }, time, px) }   France as points and lines (plan.js · MAP)
//
// What the corridor's and the line's `set` accept (world.js · FIRST says what each one means):
//   amount (the X-ray of the pylons), live, voisine, earthed, couple, induced, current, defect
//   + for buildLigne: day, heli, fly, basket, spacer, v87, wrong, grab, shock
//
// HOW IT IS DRAWN
//   · a conductor is a RIBBON drawn in screen space: as wide as the real tube (3 cm) or 1.1 px, whichever is more, with a
//     halo when it is live; ribbons are blended "the brightest wins" (MAX): the four sub-conductors of a bundle merge by
//     themselves into one wire of light far away, and nothing gets brighter where segments or wires overlap
//   · a tower is lines: legs and crossarms ≥ 2 px, its bracing 1.8 px that fades out once a panel gets under ~10 px
//     (no lattice that swarms); its insulator strings are glass, their sheds fade with distance
//   · the LIGNE's sky and ground are drawn at infinity (the 007's idiom): a grid of fields, a horizon, and for `day` a
//     low warm dusk on the far side of the line (signal, very low: no blue, the sky above stays our background)
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, fatLine, solid, lineMat, lathe, plate, edgesOf, mergeGeometries } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { rng } from "@kit/rng.js";
import { LINE, HELI, V87, MAP } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, u) => a + (b - a) * u;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** The insulator string (arm tip → yoke) and the yoke down to the bundle's centre. */
const STRING = 380;
const HANG = STRING + 30;
/** The bundle: four sub-conductors on a square `B` cm across (plan.js · HELI.bundle), each 3.2 cm thick. */
const B = HELI.bundle;
const SUB_R = 1.6;
const SUBS = [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => [(a * B) / 2, (b * B) / 2]); // [dy, dz]

/* ───────────────────────────── the ribbon: a wire drawn in screen space ───────────────────────────── */

const WIRE_VS = /* glsl */ `
  uniform float uPx, uMinPx, uHaloPx, uHaloK; uniform vec2 uView;
  attribute vec3 aOther; attribute float aEnd; attribute float aSide; attribute float aDist; attribute float aR;
  varying float vX; varying float vMax; varying float vDist; varying float vDepth;
  void main() {
    vec4 a = modelViewMatrix * vec4(position, 1.0);
    vec4 b = modelViewMatrix * vec4(aOther, 1.0);
    const float NEAR = 8.0;
    vX = 0.0; vMax = 2.0; vDist = aDist; vDepth = 1.0;
    if (a.z > -NEAR && b.z > -NEAR) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    // a wire that passes beside the camera: each end is slid along its segment to the near plane, never projected behind
    if (a.z > -NEAR) a = mix(a, b, (a.z + NEAR) / (a.z - b.z));
    if (b.z > -NEAR) b = mix(b, a, (b.z + NEAR) / (b.z - a.z));
    vec4 ca = projectionMatrix * a;
    vec4 cb = projectionMatrix * b;
    vec2 run = (cb.xy / cb.w - ca.xy / ca.w) * uView * (aEnd > 0.5 ? -1.0 : 1.0);
    float l = length(run);
    vec2 n = l > 1e-4 ? vec2(-run.y, run.x) / l : vec2(0.0, 1.0);
    float depth = max(-a.z, NEAR);
    float core = max(aR * uPx / depth, uMinPx);
    float total = core + uHaloPx + core * uHaloK;
    ca.xy += n * aSide * total * 2.0 / uView * ca.w;
    gl_Position = ca;
    vX = aSide * total / core;
    vMax = total / core;
    vDepth = depth;
  }`;

// a conductor: dark ink tube with a lit rim (cut) · signal with a hot centre line and a tight halo (live) · veille (earthed);
// `uInd` 0 → 1 a faint signal life crawling along a cut wire, 1 → 2 the surge (bright, fast)
const WIRE_FS = /* glsl */ `
  uniform vec3 uSigC, uVeiC, uInkC; uniform float uSig, uVei, uInd, uTime, uAmount, uBase, uFar;
  varying float vX; varying float vMax; varying float vDist; varying float vDepth;
  void main() {
    float a = abs(vX);
    float aa = max(fwidth(vX), 1e-3);
    float inCore = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, a);
    float tube = sqrt(clamp(1.0 - a * a, 0.0, 1.0));
    float rim = pow(clamp(a, 0.0, 1.0), 3.0);
    float centre = 1.0 - smoothstep(0.0, 0.55, a);
    vec3 cut = uInkC * uBase * (0.05 + 0.12 * tube + 0.3 * rim);
    vec3 live = uSigC * (1.0 + 0.5 * tube) + vec3(1.0, 0.85, 0.75) * 0.5 * centre;
    vec3 earth = uVeiC * (0.5 + 0.45 * tube) + vec3(0.8, 1.0, 0.9) * 0.22 * centre;
    float sig = clamp(uSig, 0.0, 1.0);
    float vei = clamp(uVei, 0.0, 1.0) * (1.0 - sig);
    vec3 c = mix(cut, live, sig);
    c = mix(c, earth, vei);
    float i1 = clamp(uInd, 0.0, 1.0);
    float i2 = clamp(uInd - 1.0, 0.0, 1.0);
    float crawl = 0.55 + 0.45 * sin(vDist * 0.0007 - uTime * 0.8);
    float surge = 0.6 + 0.9 * pow(0.5 + 0.5 * sin(vDist * 0.0021 - uTime * 8.0), 3.0);
    float ind = (i1 * 0.32 * crawl * (1.0 - i2) + i2 * surge) * (1.0 - sig);
    c += uSigC * ind * (0.6 + 0.4 * tube);
    float glowK = max(sig, max(vei * 0.65, min(i1 * 0.25 + i2 * 0.9, 1.0) * (1.0 - sig)));
    float h = clamp((a - 1.0) / max(vMax - 1.0, 1e-3), 0.0, 1.0);
    float halo = glowK * 0.4 * pow(1.0 - h, 2.4);
    vec3 hc = mix(uSigC, uVeiC, vei * (1.0 - i2));
    vec3 col = c * inCore + hc * halo * (1.0 - inCore);
    gl_FragColor = vec4(col * uAmount * exp(-vDepth / uFar), 1.0);
  }`;

// the field between the two circuits: thin signal arcs, a slow light travelling from the neighbour to yours; an arc
// fades out once it would stand less than ~10 px from the next one (no moiré down the line)
const FIELD_FS = /* glsl */ `
  uniform vec3 uSigC; uniform float uAmount, uTime, uFar, uPx, uPitch;
  varying float vX; varying float vMax; varying float vDist; varying float vDepth;
  void main() {
    float a = abs(vX) / max(vMax, 1e-3);
    float prof = exp(-a * a * 5.0) * (1.0 - a);
    float travel = 0.3 + 0.7 * pow(0.5 + 0.5 * sin((vDist - uTime * 0.16) * 12.566), 2.0);
    float k = smoothstep(5.0, 14.0, uPitch * uPx / max(vDepth, 1.0));
    gl_FragColor = vec4(uSigC * prof * travel * 1.3 * uAmount * k * exp(-vDepth / uFar), 1.0);
  }`;

function ribbonMaterial(fs, extra = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPx: { value: 2000 }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) }, uMinPx: { value: 1.1 }, uHaloPx: { value: 4 }, uHaloK: { value: 1.2 },
      uSigC: { value: SIGNAL.clone() }, uVeiC: { value: VEILLE.clone() }, uInkC: { value: INK.clone() },
      uSig: { value: 0 }, uVei: { value: 0 }, uInd: { value: 0 }, uTime: { value: 0 }, uAmount: { value: 1 }, uBase: { value: 1 }, uFar: { value: 500000 },
      uPitch: { value: 2500 },
      ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, { value: v }])),
    },
    vertexShader: WIRE_VS,
    fragmentShader: fs,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
  });
}

/** Collects polylines into one ribbon mesh: `add(points, radius, dist0, norm)`; `done(material)`. */
function makeRibbons() {
  const P = [];
  const O = [];
  const E = [];
  const S = [];
  const D = [];
  const R = [];
  const index = [];
  let n = 0;
  return {
    add(pts, r, dist0 = 0, norm = false) {
      let total = 0;
      if (norm) for (let i = 0; i + 1 < pts.length; i++) total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1], pts[i + 1][2] - pts[i][2]);
      let dist = dist0;
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        for (const [end, side] of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
          P.push(...(end ? b : a));
          O.push(...(end ? a : b));
          E.push(end);
          S.push(side);
          const d = end ? dist + l : dist;
          D.push(norm ? d / Math.max(total, 1e-3) : d);
          R.push(r);
        }
        index.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
        n += 4;
        dist += l;
      }
    },
    done(material) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
      geo.setAttribute("aOther", new THREE.Float32BufferAttribute(O, 3));
      geo.setAttribute("aEnd", new THREE.Float32BufferAttribute(E, 1));
      geo.setAttribute("aSide", new THREE.Float32BufferAttribute(S, 1));
      geo.setAttribute("aDist", new THREE.Float32BufferAttribute(D, 1));
      geo.setAttribute("aR", new THREE.Float32BufferAttribute(R, 1));
      geo.setIndex(index);
      const mesh = new THREE.Mesh(geo, material);
      mesh.frustumCulled = false;
      mesh.renderOrder = 5;
      return mesh;
    },
  };
}

/** A sagging conductor between two points (a parabola), as points. */
const catenary = (a, b, sag, n = 24) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const u = k / n;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - 4 * sag * u * (1 - u), a[2] + (b[2] - a[2]) * u];
  });

/* ───────────────────────────── a light that has a place (camera-facing, never smaller than a few pixels) ───────────────────────────── */

const QUAD = new THREE.PlaneGeometry(1, 1);
function makeGlow({ core = [1, 0.9, 0.82], tail = SIGNAL, size = 100, minPx = 12, k = 1.6 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uCore: { value: new THREE.Color(...core).multiplyScalar(k) }, uTail: { value: new THREE.Color(tail).multiplyScalar(k * 0.7) },
      uSize: { value: size }, uMinPx: { value: minPx }, uPx: { value: 2000 }, uAmount: { value: 1 },
    },
    vertexShader: /* glsl */ `
      uniform float uSize, uMinPx, uPx; varying vec2 vQ;
      void main() {
        vQ = position.xy * 2.0;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float s = max(uSize, uMinPx * max(-mv.z, 1.0) / uPx);
        mv.xy += position.xy * s;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCore, uTail; uniform float uAmount; varying vec2 vQ;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        float r = sqrt(r2);
        vec3 c = uCore * exp(-r2 * 70.0) + uTail * (0.55 * exp(-r * 6.5) + 0.12 * exp(-r * 2.2)) * (1.0 - r2);
        gl_FragColor = vec4(c * uAmount, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(QUAD, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 8;
  return { mesh, u: mat.uniforms };
}

/** Slow sparks falling from a point (a fault, a hand that touches): periodic, alive from the first frame. */
function makeSparks({ count = 16, seed = 11, spread = 160, life = 1.6 } = {}) {
  const R = rng(seed);
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const ph = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = R() * Math.PI * 2;
    const s = 0.35 + 0.65 * R();
    vel.set([Math.cos(a) * s * spread, (0.2 + 0.6 * R()) * spread, Math.sin(a) * s * spread], i * 3);
    ph[i] = R();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aVel", new THREE.BufferAttribute(vel, 3));
  geo.setAttribute("aPh", new THREE.BufferAttribute(ph, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uLife: { value: life }, uG: { value: spread * 2.2 }, uAmount: { value: 0 }, uColor: { value: SIGNAL.clone().multiplyScalar(1.6) } },
    vertexShader: /* glsl */ `
      uniform float uTime, uLife, uG; attribute vec3 aVel; attribute float aPh; varying float vA;
      void main() {
        float t = fract(uTime / uLife + aPh) * uLife;
        vec3 p = position + aVel * t + vec3(0.0, -0.5 * uG * t * t, 0.0);
        vA = (1.0 - t / uLife);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = 3.0;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vA;
      void main() {
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(q, q);
        if (r2 > 1.0) discard;
        gl_FragColor = vec4(uColor * vA * vA * (1.0 - r2) * uAmount, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 8;
  return { mesh: pts, u: mat.uniforms };
}

/* ───────────────────────────── the pylon ───────────────────────────── */

const segs = (list) => {
  const g = new LineSegmentsGeometry();
  g.setPositions(list);
  return g;
};

/** A double-circuit tower (see the header). */
export function makePylon({ h = LINE.h, arms = LINE.arms, reach = LINE.reach, earthWire = LINE.earthWire } = {}) {
  const group = new THREE.Group();
  const base = h * 0.075;
  const waist = h * 0.026;
  const topW = waist * 0.8;
  const yW = arms[0] - 500; // where the legs stop spreading
  const yTop = arms[2] + 250;
  const peak = Math.max(earthWire, yTop + 200);
  const hw = (y) => (y <= yW ? lerp(base, waist, y / yW) : y <= yTop ? lerp(waist, topW, (y - yW) / (yTop - yW)) : lerp(topW, 30, (y - yTop) / (peak - yTop)));

  // the levels of the lattice: wide panels at the foot, one at each crossarm's two chords, none longer than ~3.5 m above the waist
  const levels = [0];
  for (let y = 0; y < yW - 1; ) {
    y = Math.min(yW, y + Math.max(240, hw(y) * 1.45));
    levels.push(y);
  }
  let upper = [yW, yTop, ...arms, ...arms.map((a) => a + 250)].filter((v) => v >= yW && v <= yTop);
  upper = [...new Set(upper.map((v) => Math.round(v)))].sort((a, b) => a - b);
  for (let again = true; again; ) {
    again = false;
    for (let i = 0; i + 1 < upper.length; i++)
      if (upper[i + 1] - upper[i] > 360) {
        upper.splice(i + 1, 0, Math.round((upper[i] + upper[i + 1]) / 2));
        again = true;
        break;
      }
  }
  const all = [...levels, ...upper.slice(1)];
  const armLevels = new Set([...arms, ...arms.map((a) => a + 250), yW, yTop].map((v) => Math.round(v)));

  const S = []; // structure: legs, crossarm chords, the strings' lines
  const Br = []; // bracing
  const c = (y, sx, sz) => [sx * hw(y), y, sz * hw(y)];
  const seg = (list, a, b) => list.push(...a, ...b);
  const CORNERS = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
  for (let i = 0; i + 1 < all.length; i++) {
    const y0 = all[i];
    const y1 = all[i + 1];
    for (let k = 0; k < 4; k++) {
      const [sx, sz] = CORNERS[k];
      const [tx, tz] = CORNERS[(k + 1) % 4];
      seg(S, c(y0, sx, sz), c(y1, sx, sz)); // the leg
      // the face between this corner and the next: an X in each panel
      seg(Br, c(y0, sx, sz), c(y1, tx, tz));
      seg(Br, c(y0, tx, tz), c(y1, sx, sz));
    }
  }
  for (const y of all) {
    const list = armLevels.has(Math.round(y)) || y === 0 ? S : Br;
    for (let k = 0; k < 4; k++) seg(list, c(y, ...CORNERS[k]), c(y, ...CORNERS[(k + 1) % 4]));
  }
  // the peak that carries the earth wire
  for (const [sx, sz] of CORNERS) seg(S, c(yTop, sx, sz), [0, peak, 0]);
  seg(S, [-60, peak, 0], [60, peak, 0]);

  // the crossarms: a truss tapering from the tower's face to its tip, the string hanging at the tip
  const strings = [];
  const A = { mine: [], voisine: [], top: new THREE.Object3D() };
  A.top.position.set(0, peak, 0);
  group.add(A.top);
  arms.forEach((y, i) => {
    const r = reach[i];
    for (const [key, s] of [["mine", 1], ["voisine", -1]]) {
      const w0 = hw(y);
      const w1 = hw(y + 250);
      const b0 = (sx) => [sx * w0, y, s * w0];
      const t0 = (sx) => [sx * w1, y + 250, s * w1];
      const b1 = (sx) => [sx * 26, y, s * r];
      const t1 = (sx) => [sx * 14, y + 55, s * r];
      for (const sx of [1, -1]) {
        seg(S, b0(sx), b1(sx));
        seg(S, t0(sx), t1(sx));
        seg(S, b1(sx), t1(sx));
      }
      seg(S, b1(1), b1(-1));
      // its bracing: a zigzag on each side and underneath
      const bays = 4;
      const at = (f, sx, top) => {
        const a = top ? t0(sx) : b0(sx);
        const b = top ? t1(sx) : b1(sx);
        return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
      };
      for (let k = 0; k < bays; k++) {
        const f0 = k / bays;
        const f1 = (k + 1) / bays;
        for (const sx of [1, -1]) seg(Br, at(f0, sx, k % 2 === 0), at(f1, sx, k % 2 === 1));
        seg(Br, at(f0, 1, false), at(f1, -1, false));
      }
      // the string: a line always (it reads from far), its glass and sheds from close
      seg(S, [0, y, s * r], [0, y - STRING, s * r]);
      seg(S, [0, y - STRING, s * r - 45], [0, y - STRING, s * r + 45]);
      strings.push([0, y, s * r]);
      const o = new THREE.Object3D();
      o.position.set(0, y - HANG, s * r);
      group.add(o);
      A[key].push(o);
    }
  });

  const structure = new LineSegments2(segs(S), lineMat(BRAND.ink, 2.1, { opacity: 0.75 }));
  const bracing = new LineSegments2(segs(Br), lineMat(BRAND.ink, 1.8, { opacity: 0.45 }));
  structure.renderOrder = 2;
  bracing.renderOrder = 2;
  structure.frustumCulled = bracing.frustumCulled = false;
  group.add(structure, bracing);

  // the insulators: glass rods and, from close, their sheds (a striped thing: they go before they would shimmer)
  const rodGeo = [];
  const shedGeo = [];
  const SHEDS = 19;
  const pitch = (STRING - 40) / SHEDS;
  const shedProfile = [];
  for (let k = 0; k < SHEDS; k++) {
    const y0 = -20 - k * pitch;
    shedProfile.push([4.5, y0], [15, y0 - 2], [14, y0 - 4.5], [4.5, y0 - 6.5]);
  }
  const shed = lathe([[0, -18], ...shedProfile, [0, -STRING + 18]], 18);
  const rod = lathe([[0, 0], [5, -6], [5, -STRING + 6], [0, -STRING]], 12);
  for (const p of strings) {
    rodGeo.push(rod.clone().translate(...p));
    shedGeo.push(shed.clone().translate(...p));
  }
  const rodMat = glass(BRAND.ink, { base: 0.01, rim: 0.3, power: 2.2, edge: 0.3 });
  const shedMat = glass(BRAND.ink, { base: 0.004, rim: 0.22, power: 2.6, edge: 0.25 });
  const rods = new THREE.Mesh(mergeGeometries(rodGeo), rodMat);
  const sheds = new THREE.Mesh(mergeGeometries(shedGeo), shedMat);
  rods.renderOrder = sheds.renderOrder = 4;
  group.add(rods, sheds);

  // the four footings
  const footMat = glass(BRAND.ink, { base: 0.002, rim: 0.12, power: 2.6, edge: 0.16 });
  const footGeo = mergeGeometries(CORNERS.map(([sx, sz]) => new THREE.BoxGeometry(150, 70, 150).translate(sx * base, 20, sz * base)));
  const feet = new THREE.Mesh(footGeo, footMat);
  feet.renderOrder = 4;
  group.add(feet);

  // the fades: what the tower draws depends on how far the eye is (read at render time: no allocation)
  const state = { amount: 1, px: 2000 };
  const midY = h * 0.5;
  const distTo = (camera) => {
    const e = group.matrixWorld.elements;
    const m = camera.matrixWorld.elements;
    return Math.hypot(e[12] - m[12], e[13] + midY - m[13], e[14] - m[14]);
  };
  const wrap = (obj, fn) => {
    const own = obj.onBeforeRender;
    obj.onBeforeRender = function (renderer, scene, camera, geometry, material, g) {
      own.call(this, renderer, scene, camera, geometry, material, g);
      fn(distTo(camera));
    };
  };
  const far = (d) => Math.exp(-d / 320000);
  wrap(structure, (d) => (structure.material.opacity = state.amount * 0.78 * far(d)));
  wrap(bracing, (d) => (bracing.material.opacity = state.amount * 0.5 * far(d) * smooth(6, 14, (300 * state.px) / Math.max(d, 1))));
  rods.onBeforeRender = (r, s, camera) => (rodMat.uniforms.uAmount.value = state.amount * far(distTo(camera)));
  sheds.onBeforeRender = (r, s, camera) => (shedMat.uniforms.uAmount.value = state.amount * smooth(2.5, 7, (pitch * state.px) / Math.max(distTo(camera), 1)));
  feet.onBeforeRender = (r, s, camera) => (footMat.uniforms.uAmount.value = state.amount * smooth(4, 12, (150 * state.px) / Math.max(distTo(camera), 1)));

  return { group, A, state, structure, bracing };
}

/* ───────────────────────────── the corridor: towers, bundles, spacers, the field, the far fault ───────────────────────────── */

const FIELD_PITCH = 2500;

/** n spans of the double circuit (see the header). `spacers`: their pitch (0: none); `skip(x, key, i)`: a spacer not drawn. */
export function makeCorridor({ from = [0, 0, 0], dir = 1, span = LINE.span, n = LINE.n, sag = LINE.sag, pylon = {}, first = true, spacers = HELI.pitch, skip = null } = {}) {
  const group = new THREE.Group();
  const towers = [];
  const P = { h: LINE.h, arms: LINE.arms, reach: LINE.reach, earthWire: LINE.earthWire, ...pylon };
  for (let k = 0; k <= n; k++) {
    const t = makePylon(P);
    t.group.position.set(from[0] + dir * k * span, from[1], from[2]);
    t.group.visible = first || k > 0;
    group.add(t.group);
    towers.push(t);
  }
  group.updateMatrixWorld(true);
  const at = (t, key, i) => t.A[key][i].position.clone().add(t.group.position).toArray();

  const mine = makeRibbons();
  const voisine = makeRibbons();
  const earth = makeRibbons();
  const field = makeRibbons();
  const spacerGeo = [];
  const frame = (() => {
    const bar = 3;
    const parts = [];
    for (const s of [-1, 1]) {
      parts.push(new THREE.BoxGeometry(bar, bar, B + bar).translate(0, (s * B) / 2, 0));
      parts.push(new THREE.BoxGeometry(bar, B + bar, bar).translate(0, 0, (s * B) / 2));
    }
    const diag = Math.SQRT2 * B;
    parts.push(new THREE.BoxGeometry(bar * 0.8, bar * 0.8, diag).rotateX(Math.PI / 4));
    parts.push(new THREE.BoxGeometry(bar * 0.8, bar * 0.8, diag).rotateX(-Math.PI / 4));
    for (const [dy, dz] of SUBS) parts.push(new THREE.BoxGeometry(12, 6.5, 6.5).translate(0, dy, dz)); // its clamps on the four wires
    return mergeGeometries(parts.map((g) => g.toNonIndexed()));
  })();

  for (let k = 0; k < n; k++) {
    const t0 = towers[k];
    const t1 = towers[k + 1];
    const x0 = t0.group.position.x;
    for (const [key, list] of [["mine", mine], ["voisine", voisine]]) {
      for (let i = 0; i < 3; i++) {
        const a = at(t0, key, i);
        const b = at(t1, key, i);
        for (const [dy, dz] of SUBS) list.add(catenary([a[0], a[1] + dy, a[2] + dz], [b[0], b[1] + dy, b[2] + dz], sag, 56), SUB_R, k * span);
        // the spacers, every `spacers` along the bundle (none near a tower)
        if (spacers > 0) {
          const m = Math.floor((span - 4000) / spacers);
          const off = (span - m * spacers) / 2;
          for (let j = 0; j <= m; j++) {
            const u = (off + j * spacers) / span;
            const x = lerp(a[0], b[0], u);
            if (skip?.(x, key, i)) continue;
            const y = lerp(a[1], b[1], u) - 4 * sag * u * (1 - u);
            spacerGeo.push(frame.clone().translate(x, y, a[2]));
          }
        }
      }
    }
    // the earth wire, peak to peak
    const ea = t0.A.top.position.clone().add(t0.group.position).toArray();
    const eb = t1.A.top.position.clone().add(t1.group.position).toArray();
    earth.add(catenary(ea, eb, sag * 0.72, 40), 1.1, k * span);
    // the field: arcs from each of the neighbour's conductors to yours, every FIELD_PITCH, none near a tower
    let s = 0;
    for (let d = FIELD_PITCH * 1.4; d < span - FIELD_PITCH * 1.2; d += FIELD_PITCH, s++) {
      const u = d / span;
      for (let i = 0; i < 3; i++) {
        const va = at(t0, "voisine", i);
        const ma = at(t0, "mine", i);
        const y = va[1] - 4 * sag * u * (1 - u);
        const x = x0 + dir * d;
        const len = Math.abs(ma[2] - va[2]);
        const bulge = (s + i) % 2 ? 0.16 * len : -0.12 * len;
        const pts = Array.from({ length: 21 }, (_, q) => {
          const v = q / 20;
          return [x, y + bulge * 4 * v * (1 - v), lerp(va[2] + B * 0.6, ma[2] - B * 0.6, v)];
        });
        field.add(pts, 1.2, 0, true);
      }
    }
  }

  const mineMat = ribbonMaterial(WIRE_FS);
  const voisineMat = ribbonMaterial(WIRE_FS);
  const earthMat = ribbonMaterial(WIRE_FS, { uBase: 2.0 });
  earthMat.uniforms.uMinPx.value = 0.9;
  const fieldMat = ribbonMaterial(FIELD_FS, { uPitch: FIELD_PITCH });
  fieldMat.uniforms.uMinPx.value = 2.6;
  fieldMat.uniforms.uHaloPx.value = 1.4;
  fieldMat.uniforms.uHaloK.value = 0;
  const mineMesh = mine.done(mineMat);
  const voisineMesh = voisine.done(voisineMat);
  const earthMesh = earth.done(earthMat);
  const fieldMesh = field.done(fieldMat);
  fieldMesh.renderOrder = 4;
  group.add(mineMesh, voisineMesh, earthMesh, fieldMesh);

  // the spacers: dark frames on the wires (drawn after them: they cut the light), faded out under ~10 px
  const spacerMat = new THREE.ShaderMaterial({
    uniforms: { uPx: { value: 2000 }, uAmount: { value: 1 }, uInkC: { value: INK.clone() } },
    vertexShader: /* glsl */ `
      uniform float uPx; varying vec3 vN; varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vA = smoothstep(7.0, 16.0, ${B.toFixed(1)} * uPx / max(-mv.z, 1.0));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInkC; uniform float uAmount; varying vec3 vN; varying float vA;
      void main() {
        float a = vA * uAmount;
        if (a < 0.01) discard;
        vec3 n = normalize(vN);
        float l = 0.5 + 0.5 * dot(n, normalize(vec3(-0.45, 0.75, 0.5)));
        float rim = pow(1.0 - abs(n.z), 2.0);
        gl_FragColor = vec4(uInkC * (0.05 + 0.2 * l + 0.12 * rim), a);
      }`,
    transparent: true,
    depthWrite: false,
  });
  let spacerMesh = null;
  if (spacerGeo.length) {
    spacerMesh = new THREE.Mesh(mergeGeometries(spacerGeo), spacerMat);
    spacerMesh.renderOrder = 6;
    spacerMesh.frustumCulled = false;
    group.add(spacerMesh);
  }

  // the far fault: on the farthest tower, at the neighbour's bottom string
  const ft = towers[towers.length - 1];
  const faultAt = ft.group.position.clone().add(V(0, P.arms[0] - STRING * 0.55, -P.reach[0]));
  const fault = makeGlow({ size: 420, minPx: 64, k: 1.9 });
  fault.mesh.position.copy(faultAt);
  const sparks = makeSparks({ spread: 140, life: 1.7 });
  sparks.mesh.position.copy(faultAt);
  group.add(fault.mesh, sparks.mesh);

  const ribbonMats = [mineMat, voisineMat, earthMat, fieldMat];
  return {
    group,
    A: { towers, fault: faultAt },
    set(p, time = 0, px = 2000) {
      const amount = p.amount ?? 1;
      for (const t of towers) {
        t.state.amount = amount;
        t.state.px = px;
      }
      const wires = 0.3 + 0.7 * amount;
      const mu = mineMat.uniforms;
      mu.uSig.value = clamp01(p.live ?? 0);
      mu.uVei.value = clamp01(p.earthed ?? 0);
      mu.uInd.value = Math.max(0, Math.min(2, p.induced ?? 0));
      const vu = voisineMat.uniforms;
      vu.uSig.value = clamp01(p.voisine ?? 1);
      for (const m of ribbonMats) {
        m.uniforms.uPx.value = px;
        m.uniforms.uTime.value = time;
        m.uniforms.uAmount.value = wires;
      }
      earthMat.uniforms.uAmount.value = amount;
      const couple = clamp01(p.couple ?? 0);
      fieldMat.uniforms.uAmount.value = couple * wires;
      fieldMesh.visible = couple > 0.004;
      if (spacerMesh) {
        spacerMat.uniforms.uPx.value = px;
        spacerMat.uniforms.uAmount.value = amount;
      }
      const d = clamp01(p.defect ?? 0);
      fault.mesh.visible = sparks.mesh.visible = d > 0.004;
      // an arc breathes, it does not blink
      const breath = 0.82 + 0.12 * Math.sin(time * 6.1) * Math.sin(time * 2.3 + 1) + 0.06 * Math.sin(time * 13.7);
      fault.u.uAmount.value = d * breath;
      fault.u.uPx.value = px;
      sparks.u.uTime.value = time;
      sparks.u.uAmount.value = d;
    },
  };
}

/* ───────────────────────────── the sky and the ground of the LIGNE, at infinity ───────────────────────────── */

function makeDome() {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uInk: { value: INK.clone() }, uSig: { value: SIGNAL.clone() }, uDay: { value: 0 }, uAmount: { value: 1 }, uSun: { value: new THREE.Vector2(0.3, -1).normalize() } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSig; uniform float uDay, uAmount; uniform vec2 uSun;
      varying vec3 vDir;
      float lines(float q) {
        float w = max(fwidth(q) * 1.5, 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return 1.0 - smoothstep(0.0, w, d);
      }
      float level(vec2 p, float cell) {
        vec2 q = p / cell;
        vec2 fw = fwidth(q);
        float show = smoothstep(5.0, 18.0, 1.0 / max(max(fw.x, fw.y), 1e-5));
        return show * max(lines(q.x), lines(q.y));
      }
      vec2 rot(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }
      void main() {
        vec3 d = normalize(vDir);
        float h = max(cameraPosition.y, 1.0);
        float t = h / max(-d.y, 1e-4);
        vec2 p = cameraPosition.xz + d.xz * t;
        float below = smoothstep(0.0, 0.003, -d.y);
        // the country: two grids of fields that do not line up, and a fine one from close; the brightest wins
        vec2 f1 = rot(p + vec2(3100.0, -900.0), 0.33);
        vec2 f2 = rot(p + vec2(-5300.0, 2200.0), -0.21);
        float fields = max(level(f1, 11000.0) * 0.8, level(vec2(f2.x, f2.y * 1.6), 8000.0) * 0.55);
        float fine = level(p, 1000.0) * 0.34;
        float far = exp(-t / 380000.0);
        vec3 col = uInk * max(fields, fine) * 0.14 * far * below;
        // the horizon: a thin line of air; at dusk, a warm band very low on the far side, the sky above stays dark
        vec2 dh = normalize(d.xz + vec2(1e-5));
        float sun = 0.3 + 0.7 * smoothstep(-0.4, 1.0, dot(dh, uSun));
        float ay = abs(d.y);
        col += uInk * 0.05 * exp(-ay / 0.0025);
        float up = step(0.0, d.y);
        vec3 warm = uSig * (0.1 * exp(-ay / 0.0022) + up * (0.028 * exp(-d.y / 0.018) + 0.005 * exp(-d.y / 0.1)) + (1.0 - up) * 0.022 * exp(d.y / 0.01));
        col += warm * uDay * sun;
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -5;
  return { mesh, u: mat.uniforms };
}

/* ───────────────────────────── the helicopter (glass), its basket (solid), the spacers ───────────────────────────── */

function makeRotorDisc(r, k = 1) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uInk: { value: INK.clone() }, uAmount: { value: 1 }, uK: { value: k } },
    vertexShader: /* glsl */ `varying vec2 vQ; void main() { vQ = position.xy / ${r.toFixed(1)}; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount, uK; varying vec2 vQ;
      void main() {
        float r = length(vQ);
        float aa = max(fwidth(r), 1e-4);
        float disc = 1.0 - smoothstep(1.0 - aa * 1.5, 1.0 + aa, r);
        float tips = smoothstep(0.78, 0.985, r) * disc;
        float hub = 1.0 - smoothstep(0.05, 0.11, r);
        gl_FragColor = vec4(uInk * (0.018 * disc + 0.075 * tips + 0.12 * hub) * uAmount * uK, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(r, 72), mat);
  mesh.renderOrder = 7;
  return { mesh, u: mat.uniforms };
}

/** A light single-engine helicopter of glass, nose toward +x; its origin at the hook under its belly. */
function makeHeli() {
  const group = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = 150; // the hook is 1.5 m under the cabin's centre
  group.add(body);
  const hull = glass(BRAND.ink, { base: 0, rim: 0.17, power: 2.6, edge: 0.42, spec: 0.45, through: 0.2 });
  const tubes = glass(BRAND.ink, { base: 0.004, rim: 0.3, power: 2.2, edge: 0.35 });
  const panes = [];
  const pane = (geo, mat = hull) => {
    const m = new THREE.Mesh(geo, mat);
    body.add(m);
    if (mat === hull) panes.push(m);
    return m;
  };
  // the cabin: a bubble, higher than wide, the nose low
  const cabin = lathe([[0, 250], [40, 246], [75, 232], [100, 205], [115, 165], [120, 110], [118, 40], [110, -40], [92, -110], [62, -160], [34, -190], [0, -200]], 40);
  cabin.rotateZ(-Math.PI / 2).scale(1, 1.15, 0.86);
  pane(cabin);
  // the engine cowl over it, the tail boom, the fin, the stabiliser
  pane(new THREE.CapsuleGeometry(46, 170, 8, 20).rotateZ(Math.PI / 2).translate(-70, 128, 0));
  const boom = lathe([[0, 0], [36, 0], [13, 540], [0, 540]], 24);
  boom.rotateZ(Math.PI / 2).translate(-150, 60, 0);
  pane(boom);
  pane(plate([[0, 0], [62, 0], [118, 175], [78, 182], [-12, 40]], 8, { bevel: 2 }).translate(-735, 55, -4));
  pane(new THREE.BoxGeometry(34, 5, 180).translate(-610, 66, 0));
  // the skids and their cross tubes
  for (const s of [-1, 1]) {
    const skid = new THREE.CapsuleGeometry(5, 320, 4, 12).rotateZ(Math.PI / 2).translate(25, -182, s * 104);
    pane(skid, tubes);
  }
  for (const x of [115, -70]) {
    const curve = new THREE.CatmullRomCurve3([V(x, -182, -104), V(x, -140, -86), V(x, -118, 0), V(x, -140, 86), V(x, -182, 104)]);
    pane(new THREE.TubeGeometry(curve, 24, 4, 8), tubes);
  }
  // the mast and the rotor: a blurred disc, never blades that flicker
  pane(new THREE.CylinderGeometry(9, 12, 70, 16).translate(0, 175, 0), tubes);
  const rotor = makeRotorDisc(535);
  rotor.mesh.rotation.x = -Math.PI / 2;
  rotor.mesh.position.set(0, 212, 0);
  body.add(rotor.mesh);
  const tail = makeRotorDisc(92, 1.4);
  tail.mesh.position.set(-700, 118, -22);
  body.add(tail.mesh);
  asShell(panes, 20);
  // the pilot, seated in the right seat (glass, inside the shell: drawn first)
  const pilot = makeFigure({ shell: true, hands: "flat", order: 12, glassK: 0.75 });
  pilot.ghost(true);
  pilot.group.rotation.y = Math.PI / 2; // facing +x
  pilot.group.position.set(70, -150, -30);
  pilot.leg("L", V(8.6, 50, 48));
  pilot.leg("R", V(-8.6, 50, 48));
  pilot.reach("R", V(-14, 78, 34));
  pilot.reach("L", V(20, 82, 26));
  body.add(pilot.group);
  // the hook
  const hookMat = solid(0x4a4e53, { rough: 0.5, metal: 0.3 });
  const hook = new THREE.Mesh(new THREE.BoxGeometry(16, 14, 16), hookMat);
  group.add(hook);
  const mats = [hull, tubes, pilot.body];
  return { group, body, rotor, tail, mats, pilot };
}

/** The basket: an open cage of tubes, its floor at its origin, along x; two hooks on its +z rail that rest on a bundle. */
function makeBasket() {
  const group = new THREE.Group();
  const L = 200;
  const W = 110;
  const H = 110;
  const T = 4;
  const frameGeo = [];
  const add = (g, x, y, z) => frameGeo.push(g.translate(x, y, z).toNonIndexed());
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.BoxGeometry(T, H, T), (sx * (L - T)) / 2, H / 2, (sz * (W - T)) / 2);
  for (const y of [H, 60]) {
    for (const sz of [-1, 1]) add(new THREE.BoxGeometry(L, T, T), 0, y, (sz * (W - T)) / 2);
    for (const sx of [-1, 1]) add(new THREE.BoxGeometry(T, T, W), (sx * (L - T)) / 2, y, 0);
  }
  // the hooks: from the +z top rail, up and over the near top sub-conductor of the bundle
  const hookGeo = [];
  for (const x of [-70, 70]) {
    const curve = new THREE.CatmullRomCurve3([V(x, H, W / 2 - 2), V(x, H + 6, W / 2 + 3), V(x, H + 7, W / 2 + 12), V(x, H + 1, W / 2 + 19)]);
    hookGeo.push(new THREE.TubeGeometry(curve, 16, 2, 8).toNonIndexed());
  }
  const frameMat = solid(0x60656b, { rough: 0.5, metal: 0.35 });
  const floorMat = solid(0x34383d, { rough: 0.7, metal: 0.2 });
  const kickMat = solid(0x494d52, { rough: 0.62, metal: 0.25 });
  const frame = new THREE.Mesh(mergeGeometries([...frameGeo, ...hookGeo.map((g) => { g.deleteAttribute("uv"); return g; })].map((g) => { if (g.attributes.uv) g.deleteAttribute("uv"); return g; })), frameMat);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(L, 5, W).translate(0, 2.5, 0), floorMat);
  const kickGeo = [];
  for (const sz of [-1, 1]) kickGeo.push(new THREE.BoxGeometry(L - 8, 24, 2).translate(0, 17, (sz * (W - 6)) / 2).toNonIndexed());
  for (const sx of [-1, 1]) kickGeo.push(new THREE.BoxGeometry(2, 24, W - 8).translate((sx * (L - 6)) / 2, 17, 0).toNonIndexed());
  const kick = new THREE.Mesh(mergeGeometries(kickGeo), kickMat);
  group.add(frame, floor, kick);
  const edges = edgesOf(new THREE.BoxGeometry(L, H, W).translate(0, H / 2, 0), { width: 1.8, opacity: 0.55 });
  group.add(edges);
  // the bridles: from the four top corners to the ring the sling hangs from
  const RING = 190;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) group.add(fatLine([[(sx * (L - T)) / 2, H, (sz * (W - T)) / 2], [0, RING, 0]], { color: BRAND.ink, width: 1.8, opacity: 0.7 }));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(7, 1.8, 8, 20), frameMat);
  ring.position.y = RING;
  group.add(ring);
  return { group, ring: RING, rail: H, width: W };
}

/** A spacer of the hero bundle, solid (`tone`: its grey): a square frame on the four wires, a cross inside. */
function makeHeroSpacer(tone, edge) {
  const group = new THREE.Group();
  const mat = solid(tone, { rough: 0.55, metal: 0.35, opacity: 1 });
  const parts = [];
  const bar = 3.4;
  for (const s of [-1, 1]) {
    parts.push(new THREE.BoxGeometry(bar, bar, B + bar).translate(0, (s * B) / 2, 0).toNonIndexed());
    parts.push(new THREE.BoxGeometry(bar, B + bar, bar).translate(0, 0, (s * B) / 2).toNonIndexed());
  }
  parts.push(new THREE.BoxGeometry(bar * 0.8, bar * 0.8, Math.SQRT2 * B).rotateX(Math.PI / 4).toNonIndexed());
  parts.push(new THREE.BoxGeometry(bar * 0.8, bar * 0.8, Math.SQRT2 * B).rotateX(-Math.PI / 4).toNonIndexed());
  for (const [dy, dz] of SUBS) parts.push(new THREE.BoxGeometry(13, 7.5, 7.5).translate(0, dy, dz).toNonIndexed());
  const geo = mergeGeometries(parts.map((g) => { if (g.attributes.uv) g.deleteAttribute("uv"); return g; }));
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);
  const lines = edgesOf(new THREE.BoxGeometry(bar + 1, B + bar + 1, B + bar + 1), { width: 1.8, opacity: edge, color: BRAND.ink });
  group.add(lines);
  return { group, mat, lines };
}

/* ───────────────────────────── the LIGNE place ───────────────────────────── */

const HANDS = [["L", 11], ["R", -11]]; // each hand, and where it holds a spacer (cm above / under its centre)

/** The LIGNE place (see the header). */
export function buildLigne() {
  const group = new THREE.Group();
  const dome = makeDome();
  group.add(dome.mesh);
  const TOP = 2; // the phase they work on: your top one
  const heroX = LINE.span + HELI.spacer; // on span 1, from its first tower (x = 60 000 = HELI.x)
  const corridor = makeCorridor({ from: [0, 0, 0], dir: 1, skip: (x, key, i) => key === "mine" && i === TOP && Math.abs(x - heroX) < 10 });
  group.add(corridor.group);

  /** The centre of your bundle `i` at x (the parabola of makeCorridor, exactly). */
  const centreY = (x, i) => {
    const u = (((x % LINE.span) + LINE.span) % LINE.span) / LINE.span;
    return LINE.arms[i] - HANG - 4 * LINE.sag * u * (1 - u);
  };
  /** Your circuit's three conductors at x (bottom → top), sag included: the lower sub-conductor on the camera's side (+z). */
  const phases = (x) => [0, 1, 2].map((i) => [x, centreY(x, i) - B / 2, LINE.reach[i] + B / 2]);

  /* the helicopter, its sling, its basket, the two technicians, the spacers they swap */
  const heli = makeHeli();
  const basket = makeBasket();
  const sling = fatLine([[0, 0, 0], [0, -1, 0]], { color: BRAND.ink, width: 2, opacity: 0.8 });
  group.add(heli.group, basket.group, sling);
  const gloveMat = solid(0x55595d, { rough: 0.8 });
  const helmetMat = solid(0xd9d3c6, { rough: 0.42 });
  const helmetGeo = mergeGeometries([
    new THREE.SphereGeometry(12.4, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2).toNonIndexed(),
    new THREE.CylinderGeometry(14, 14, 1.4, 28).translate(0, 0.4, 1.6).toNonIndexed(),
  ].map((g) => { if (g.attributes.uv) g.deleteAttribute("uv"); return g; }));
  const techs = [0, 1].map((k) => {
    const f = makeFigure({ shell: true, hands: "flat", order: 16 + k * 2, glassK: 0.9 });
    f.ghost(true);
    for (const m of f.skin) if (m !== f.head) {
      m.material = gloveMat;
      asShell(m, false);
    }
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0, 2.2, 0);
    f.head.add(helmet);
    basket.group.add(f.group);
    f.group.position.set(k ? 52 : -52, 5, 18);
    return f;
  });
  const oldSpacer = makeHeroSpacer(0x3a3c3e, 0.35);
  const newSpacer = makeHeroSpacer(0xb9b3a7, 0.7);
  group.add(oldSpacer.group, newSpacer.group);
  const heroY = centreY(heroX, TOP);
  const heroZ = LINE.reach[TOP];

  /* 1987: the apprentice and his mate, figures of glass at the foot of the first tower */
  const apprentice = makeFigure({ shell: true, hands: "flat", order: 22 });
  apprentice.ghost(true);
  const mate = makeFigure({ shell: true, hands: "flat", order: 24, glassK: 0.7 });
  mate.ghost(true);
  group.add(apprentice.group, mate.group);
  const END = [V87.at[0] + 120, 110, V87.at[2] - 200]; // world.js hangs the free end of the cable there
  const toEnd = V(END[0] - V87.at[0], 0, END[2] - V87.at[2]);
  const walkLen = Math.max(0, toEnd.length() - 50);
  toEnd.normalize();
  const faceEnd = Math.atan2(toEnd.x, toEnd.z);
  const faceApp = Math.atan2(V87.at[0] - V87.mate[0], V87.at[2] - V87.mate[2]);
  mate.group.position.set(...V87.mate);
  mate.group.rotation.y = faceApp;
  mate.reach("L", V(22, 96, 8));
  mate.reach("R", V(-24, 92, 6));
  const handGlow = makeGlow({ size: 34, minPx: 9, k: 1.4 });
  const footGlow = makeGlow({ size: 60, minPx: 8, k: 0.8 });
  group.add(handGlow.mesh, footGlow.mesh);
  const appBodyColor = apprentice.body.uniforms.uColor.value;

  /* scratch (set() runs sixteen times a frame: nothing allocated in it) */
  const t0 = V();
  const t1 = V();
  const loc = V();
  const spOld = V();
  const spNew = V();
  const Yax = V(0, 1, 0);
  const wristW = V();
  // a world point → a figure's own frame (its group: a position and a turn about y, inside `parent` at `pp`)
  const toLocal = (out, w, f, px0, py0, pz0) => {
    const g = f.group;
    const x = w.x - px0 - g.position.x;
    const y = w.y - py0 - g.position.y;
    const z = w.z - pz0 - g.position.z;
    const c = Math.cos(-g.rotation.y);
    const s = Math.sin(-g.rotation.y);
    return out.set(c * x + s * z, y, -s * x + c * z);
  };

  return {
    group, corridor,
    A: { phases, heli: heli.group, basket: basket.group, apprentice: apprentice.group, centreY },
    set(p, time = 0, px = 2000) {
      corridor.set(p, time, px);
      dome.u.uDay.value = clamp01(p.day ?? 0);

      /* ── 2025: the helicopter ── */
      const hk = clamp01(p.heli ?? 0);
      const on = hk > 0.004;
      heli.group.visible = basket.group.visible = sling.visible = on;
      oldSpacer.group.visible = true;
      if (on) {
        for (const m of heli.mats) m.uniforms.uAmount.value = hk;
        heli.rotor.u.uAmount.value = hk;
        heli.tail.u.uAmount.value = hk;
        const fly = p.fly ?? HELI.x;
        const dock = clamp01(p.basket ?? 0);
        const hang = 1 - dock;
        // docked: the floor 1.1 m under the bundle's centre, beside it (−z), the hooks on its top sub-conductor
        const yc = centreY(fly, TOP);
        const swayZ = hang * 22 * Math.sin(time * 0.83);
        const swayX = hang * 12 * Math.sin(time * 0.61 + 1.3);
        const bx = fly + swayX;
        const by = lerp(yc - basket.rail - 25, yc + 1350, smooth(0, 1, hang));
        const bz = heroZ - (basket.width / 2 + B / 2 + 10) + swayZ;
        basket.group.position.set(bx, by, bz);
        basket.group.rotation.set(swayZ * 0.0016, 0, -swayX * 0.0012);
        // the helicopter right above, a slow hover
        const hy = by + basket.ring + HELI.sling + 20 * Math.sin(time * 0.9);
        heli.group.position.set(fly + 8 * Math.sin(time * 0.5), hy, heroZ - 90 + 10 * Math.sin(time * 0.7 + 2));
        heli.group.rotation.set(0.03 * Math.sin(time * 0.6), 0.18, 0.025 * Math.sin(time * 0.8 + 1));
        heli.group.updateMatrixWorld(true);
        // the sling: from the hook to the basket's ring
        t0.setFromMatrixPosition(heli.group.matrixWorld);
        t1.set(bx, by + basket.ring, bz);
        sling.position.copy(t0);
        loc.subVectors(t1, t0);
        sling.scale.set(1, loc.length(), 1);
        sling.quaternion.setFromUnitVectors(Yax, loc.normalize().negate());

        /* the spacers: technician A takes the old one off and keeps it; B fits the new one */
        const sp = clamp01(p.spacer ?? 0);
        const uOld = smooth(0, 0.45, sp);
        const uNew = smooth(0.5, 1, sp);
        const floorY = by + 5;
        spOld.set(heroX, heroY, heroZ).lerp(t0.set(bx - 34, floorY + 92, bz + 26), uOld);
        oldSpacer.group.position.copy(spOld);
        oldSpacer.group.rotation.set(0, uOld * 0.9, uOld * 0.5);
        spNew.set(bx + 40, floorY + 108, bz + 30).lerp(t1.set(heroX, heroY, heroZ), uNew);
        newSpacer.group.position.copy(spNew);
        newSpacer.group.rotation.set(0, (1 - uNew) * 0.7, 0);
        newSpacer.group.visible = dock > 0.5;
        const work = smooth(0.82, 1, dock); // hands on the rail until the basket is docked
        const [A, Bt] = techs;
        A.lean(lerp(8, 28, work) - 10 * uOld * work, 0, 18 * work);
        // A: both hands on the old spacer (on its near side), or on the rail
        for (const [s, dy] of HANDS) {
          t0.set(spOld.x - 4, spOld.y + dy, spOld.z - B / 2 - 3);
          toLocal(loc, t0, A, bx, by, bz);
          const railL = t1.set(s === "L" ? 22 : -22, basket.rail - 5, basket.width / 2 - 18 - 4);
          loc.lerp(railL, 1 - work);
          A.reach(s, loc);
        }
        Bt.lean(lerp(6, 24, work * uNew) + 6 * work, 0, -14 * work);
        for (const [s, dy] of HANDS) {
          t0.set(spNew.x + 4, spNew.y + dy, spNew.z - B / 2 - 3);
          toLocal(loc, t0, Bt, bx, by, bz);
          const railB = t1.set(s === "L" ? 22 : -22, basket.rail - 5, basket.width / 2 - 18 - 4);
          loc.lerp(railB, 1 - work);
          Bt.reach(s, loc);
        }
      } else {
        newSpacer.group.visible = false;
        oldSpacer.group.position.set(heroX, heroY, heroZ);
        oldSpacer.group.rotation.set(0, 0, 0);
      }

      /* ── 1987: the apprentice ── */
      const v = p.v87 ?? 0;
      const crew = clamp01(v - 1);
      apprentice.group.visible = mate.group.visible = crew > 0.004;
      const shock = clamp01(p.shock ?? 0);
      handGlow.mesh.visible = footGlow.mesh.visible = crew > 0.004 && shock > 0.004;
      if (crew > 0.004) {
        apprentice.body.uniforms.uAmount.value = crew;
        mate.body.uniforms.uAmount.value = crew * 0.85;
        const g = clamp01(p.grab ?? 0);
        const w = smooth(0, 0.55, g); // two steps toward the cable's end
        const rk = smooth(0.4, 1, g); // then the hand goes to it
        const ag = apprentice.group;
        ag.position.set(V87.at[0] + toEnd.x * walkLen * w, 0, V87.at[2] + toEnd.z * walkLen * w);
        ag.rotation.y = faceEnd;
        const step = w * 2; // 0 → 2 steps
        const sw = Math.sin(Math.PI * step);
        const liftL = Math.max(0, Math.sin(Math.PI * step)) * 6 * (1 - rk);
        const liftR = Math.max(0, -Math.sin(Math.PI * step)) * 6 * (1 - rk);
        apprentice.leg("L", t0.set(8.6, 8 + liftL, 12 * sw + 6 * rk));
        apprentice.leg("R", t0.set(-8.6, 8 + liftR, -12 * sw - 4 * rk));
        apprentice.lean(20 * rk + 4, 0, 0);
        t1.set(...END);
        toLocal(loc, t1, apprentice, 0, 0, 0);
        loc.y += 4;
        t0.set(-20.5, 92, 3).lerp(loc, rk);
        const wrist = apprentice.reach("R", t0);
        apprentice.reach("L", t1.set(21, 94, 6));
        // the induced current through him: his glass turns signal, a light at the hand that holds the cable
        appBodyColor.copy(INK).lerp(SIGNAL, shock);
        apprentice.body.uniforms.uGain.value = 1 + 0.9 * shock;
        apprentice.group.updateMatrixWorld(true);
        wristW.copy(wrist).applyMatrix4(apprentice.group.matrixWorld);
        handGlow.mesh.position.copy(wristW);
        handGlow.u.uAmount.value = shock * (0.9 + 0.1 * Math.sin(time * 5.3));
        handGlow.u.uPx.value = px;
        footGlow.mesh.position.set(ag.position.x, 6, ag.position.z);
        footGlow.u.uAmount.value = shock * 0.55;
        footGlow.u.uPx.value = px;
      }
    },
  };
}

/* ───────────────────────────── the map of France ───────────────────────────── */

// the outline of the Hexagon, [longitude, latitude], from Dunkerque clockwise (≈ 110 points), and Corsica
const FRANCE = [
  [2.37, 51.05], [2.55, 51.09], [2.63, 50.95], [2.9, 50.7], [3.1, 50.78], [3.3, 50.52], [3.65, 50.37], [4.03, 50.36], [4.15, 50.25],
  [4.2, 49.96], [4.45, 49.94], [4.8, 50.15], [4.86, 49.8], [5.1, 49.62], [5.47, 49.5], [5.8, 49.55], [6.37, 49.46], [6.6, 49.2],
  [7.0, 49.12], [7.5, 49.17], [8.0, 49.02], [8.23, 48.97], [7.95, 48.6], [7.75, 48.3], [7.6, 47.95], [7.55, 47.6], [7.2, 47.45],
  [6.95, 47.3], [6.75, 47.1], [6.45, 46.95], [6.12, 46.6], [6.15, 46.4], [5.97, 46.2], [6.3, 46.4], [6.8, 46.39], [6.85, 46.15],
  [6.86, 45.83], [7.05, 45.7], [7.15, 45.45], [6.95, 45.25], [6.65, 45.05], [6.95, 44.8], [6.9, 44.45], [7.0, 44.25], [7.65, 44.15],
  [7.5, 43.78], [7.27, 43.7], [7.12, 43.58], [6.9, 43.42], [6.65, 43.2], [6.2, 43.1], [5.93, 43.1], [5.6, 43.18], [5.37, 43.3],
  [5.0, 43.38], [4.85, 43.4], [4.55, 43.45], [4.25, 43.46], [3.9, 43.5], [3.6, 43.33], [3.3, 43.22], [3.1, 43.1], [3.05, 42.8],
  [3.17, 42.44], [2.85, 42.4], [2.5, 42.36], [2.05, 42.38], [1.75, 42.48], [1.45, 42.6], [1.0, 42.75], [0.65, 42.8], [0.3, 42.7],
  [0.0, 42.7], [-0.5, 42.8], [-0.9, 42.95], [-1.4, 43.05], [-1.78, 43.37], [-1.56, 43.48], [-1.45, 43.75], [-1.38, 44.1],
  [-1.27, 44.5], [-1.25, 44.65], [-1.2, 45.1], [-1.15, 45.5], [-1.05, 45.6], [-1.2, 45.85], [-1.15, 46.15], [-1.4, 46.35],
  [-1.78, 46.5], [-2.1, 46.8], [-2.15, 47.05], [-2.2, 47.27], [-2.5, 47.3], [-2.95, 47.5], [-3.37, 47.73], [-3.9, 47.82],
  [-4.35, 47.82], [-4.73, 48.03], [-4.5, 48.25], [-4.78, 48.4], [-4.78, 48.55], [-4.3, 48.68], [-3.9, 48.72], [-3.55, 48.82],
  [-3.0, 48.82], [-2.7, 48.55], [-2.3, 48.65], [-2.0, 48.65], [-1.5, 48.64], [-1.58, 48.95], [-1.6, 49.3], [-1.85, 49.7],
  [-1.6, 49.65], [-1.25, 49.7], [-1.2, 49.4], [-0.8, 49.35], [-0.2, 49.3], [0.1, 49.45], [0.2, 49.7], [0.6, 49.85],
  [1.0, 49.92], [1.45, 50.1], [1.6, 50.35], [1.6, 50.73], [1.85, 50.96],
];
const CORSE = [[9.4, 43.0], [9.47, 42.8], [9.55, 42.6], [9.55, 42.1], [9.38, 41.7], [9.2, 41.38], [8.85, 41.55], [8.6, 41.9], [8.6, 42.25], [8.7, 42.57], [9.0, 42.65], [9.3, 42.7]];
const LON0 = 2.5;
const LAT0 = 46.5;
const KM = Math.cos((LAT0 * Math.PI) / 180);
const SCALE = MAP.w / ((9.6 + 4.8) * KM); // MAP.w across, from Brest to Corsica
const proj = ([lon, lat]) => [(lon - LON0) * KM * SCALE, (LAT0 - lat) * SCALE];
const inside = (poly, x, z) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};

/** France as points and lines (see the header). */
export function buildMap() {
  const group = new THREE.Group();
  const R = rng(87);
  const main = FRANCE.map(proj);
  const corse = CORSE.map(proj);
  // the outline: it must read alone, the points on it
  for (const poly of [main, corse]) group.add(fatLine([...poly, poly[0]].map(([x, z]) => [x, 0, z]), { color: BRAND.ink, width: 2.4, opacity: 0.7 }));

  // the substations: denser in the north, the east, around Paris and Lyon (seeded, not uniform)
  const G = (lon, lat, x0, y0, s) => Math.exp(-((lon - x0) ** 2 + (lat - y0) ** 2) / (2 * s * s));
  const weight = (lon, lat) =>
    0.3 + 0.22 * clamp01((lat - 42.5) / 8.5) + 1.5 * G(lon, lat, 2.35, 48.85, 0.85) + 1.0 * G(lon, lat, 4.85, 45.75, 0.6) + 0.8 * G(lon, lat, 3.1, 50.4, 0.7) +
    0.7 * G(lon, lat, 6.2, 49.05, 0.8) + 0.6 * G(lon, lat, 7.5, 48.3, 0.45) + 0.45 * G(lon, lat, 5.4, 43.4, 0.55) + 0.4 * G(lon, lat, 4.8, 44.7, 0.45) +
    0.3 * G(lon, lat, -0.6, 44.85, 0.5) + 0.3 * G(lon, lat, -1.6, 47.2, 0.5) + 0.3 * G(lon, lat, 1.45, 43.6, 0.45) + 0.3 * G(lon, lat, 0.1, 49.4, 0.45);
  const n = MAP.dots;
  const pts = [];
  const here = MAP.here;
  for (let guard = 0; pts.length < n && guard < n * 400; guard++) {
    const lon = -4.9 + R() * 14.6;
    const lat = 41.3 + R() * 9.9;
    if (R() * 3.2 > weight(lon, lat)) continue;
    const [x, z] = proj([lon, lat]);
    if (!inside(main, x, z) && !inside(corse, x, z)) continue;
    pts.push([x, z]);
  }
  // they light from this poste outward, with some disorder (a grid is not built in one order)
  const reach = Math.hypot(MAP.w, MAP.w);
  const order = pts.map(([x, z]) => clamp01(Math.hypot(x - here[0], z - here[2]) / reach) * 0.75 + R() * 0.25);
  const pos = new Float32Array(pts.length * 3);
  const ord = new Float32Array(pts.length);
  const size = new Float32Array(pts.length);
  pts.forEach(([x, z], i) => {
    pos.set([x, 0, z], i * 3);
    ord[i] = order[i];
    size[i] = 4.6 + 2.4 * R() * R();
  });
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  dotGeo.setAttribute("aOrder", new THREE.BufferAttribute(ord, 1));
  dotGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  const dotMat = new THREE.ShaderMaterial({
    uniforms: { uDots: { value: 0 }, uAmount: { value: 1 }, uInkC: { value: INK.clone() } },
    vertexShader: /* glsl */ `
      uniform float uDots; attribute float aOrder; attribute float aSize; varying float vK; varying float vFresh;
      void main() {
        float t = clamp((uDots * 1.1 - aOrder) / 0.1, 0.0, 1.0);
        vK = t;
        vFresh = t * (1.0 - t) * 4.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (1.0 + 0.5 * vFresh) * step(0.001, t);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInkC; uniform float uAmount; varying float vK; varying float vFresh;
      void main() {
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(q, q);
        if (r2 > 1.0) discard;
        gl_FragColor = vec4(uInkC * (0.85 + 0.8 * vFresh) * (1.0 - r2 * r2) * vK * uAmount, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
  });
  const dots = new THREE.Points(dotGeo, dotMat);
  dots.frustumCulled = false;
  dots.renderOrder = 6;
  group.add(dots);

  // the lines between neighbours: each point to its two nearest, sometimes a third; traced from the poste outward
  const edges = new Set();
  const list = [];
  const maxLen = MAP.w * 0.05;
  for (let i = 0; i < pts.length; i++) {
    const near = [];
    for (let j = 0; j < pts.length; j++) {
      if (j === i) continue;
      const d = (pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2;
      if (near.length < 3 || d < near[2][0]) {
        near.push([d, j]);
        near.sort((a, b) => a[0] - b[0]);
        if (near.length > 3) near.pop();
      }
    }
    const k = R() < 0.4 ? 3 : 2;
    for (let q = 0; q < Math.min(k, near.length); q++) {
      const j = near[q][1];
      if (Math.sqrt(near[q][0]) > maxLen) continue;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (edges.has(key)) continue;
      edges.add(key);
      list.push(i < j ? [i, j] : [j, i]);
    }
  }
  const links = list.slice(0, MAP.links);
  const LP = [];
  const LO = [];
  const LE = [];
  const LS = [];
  const LR = [];
  const LI = [];
  links.forEach(([i, j], k) => {
    // drawn from the end nearer the poste: the grid spreads out of it
    const di = order[i];
    const dj = order[j];
    const [a, b] = di <= dj ? [pts[i], pts[j]] : [pts[j], pts[i]];
    const o = Math.max(di, dj) * 0.9 + R() * 0.1;
    for (const [end, side] of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
      LP.push(...(end ? [b[0], 0, b[1]] : [a[0], 0, a[1]]));
      LO.push(...(end ? [a[0], 0, a[1]] : [b[0], 0, b[1]]));
      LE.push(end);
      LS.push(side);
      LR.push(o);
    }
    LI.push(k * 4, k * 4 + 1, k * 4 + 2, k * 4 + 1, k * 4 + 3, k * 4 + 2);
  });
  const linkGeo = new THREE.BufferGeometry();
  linkGeo.setAttribute("position", new THREE.Float32BufferAttribute(LP, 3));
  linkGeo.setAttribute("aOther", new THREE.Float32BufferAttribute(LO, 3));
  linkGeo.setAttribute("aEnd", new THREE.Float32BufferAttribute(LE, 1));
  linkGeo.setAttribute("aSide", new THREE.Float32BufferAttribute(LS, 1));
  linkGeo.setAttribute("aOrder", new THREE.Float32BufferAttribute(LR, 1));
  linkGeo.setIndex(LI);
  const linkMat = new THREE.ShaderMaterial({
    uniforms: { uLinks: { value: 0 }, uAmount: { value: 1 }, uInkC: { value: INK.clone() }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) } },
    vertexShader: /* glsl */ `
      uniform float uLinks; uniform vec2 uView;
      attribute vec3 aOther; attribute float aEnd; attribute float aSide; attribute float aOrder;
      varying float vA; varying float vX;
      void main() {
        float t = clamp((uLinks * 1.15 - aOrder) / 0.15, 0.0, 1.0);
        vec3 s = aEnd > 0.5 ? aOther : position;
        vec3 e = aEnd > 0.5 ? position : aOther;
        vec3 eNow = mix(s, e, max(t, 0.002));
        vec4 ca = projectionMatrix * modelViewMatrix * vec4(s, 1.0);
        vec4 cb = projectionMatrix * modelViewMatrix * vec4(eNow, 1.0);
        vec4 c = aEnd > 0.5 ? cb : ca;
        vec2 run = (cb.xy / cb.w - ca.xy / ca.w) * uView;
        float l = length(run);
        vec2 n = l > 1e-4 ? vec2(-run.y, run.x) / l : vec2(0.0, 1.0);
        c.xy += n * aSide * 1.4 * 2.0 / uView * c.w;
        gl_Position = c;
        vA = step(0.001, t);
        vX = aSide;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInkC; uniform float uAmount; varying float vA; varying float vX;
      void main() {
        float p = 1.0 - smoothstep(0.35, 1.0, abs(vX));
        gl_FragColor = vec4(uInkC * 0.3 * p * vA * uAmount, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
  });
  const linkMesh = new THREE.Mesh(linkGeo, linkMat);
  linkMesh.frustumCulled = false;
  linkMesh.renderOrder = 5;
  group.add(linkMesh);

  // this poste: a veille light and a ring that breathes
  const spot = makeGlow({ core: [0.75, 1, 0.88], tail: VEILLE, size: 240, minPx: 30, k: 1.5 });
  spot.mesh.position.set(here[0], 4, here[2]);
  const ringPts = Array.from({ length: 65 }, (_, i) => [Math.cos((i / 64) * Math.PI * 2), 0, Math.sin((i / 64) * Math.PI * 2)]);
  const ring = fatLine(ringPts, { color: BRAND.veille, width: 2.2, opacity: 0.9 });
  ring.position.set(here[0], 4, here[2]);
  group.add(spot.mesh, ring);

  return {
    group,
    A: { dots: pts.length, links: links.length, here: spot.mesh },
    set(p, time = 0, px = 2000) {
      dotMat.uniforms.uDots.value = clamp01(p.dots ?? 0);
      linkMat.uniforms.uLinks.value = clamp01(p.links ?? 0);
      const h = clamp01(p.here ?? 0);
      spot.mesh.visible = ring.visible = h > 0.004;
      spot.u.uAmount.value = h;
      spot.u.uPx.value = px;
      const breath = 0.5 + 0.5 * Math.sin(time * 1.4);
      ring.scale.setScalar(lerp(300, 820, breath) * (0.6 + 0.4 * h));
      ring.material.opacity = 0.75 * h * (1 - 0.6 * breath);
    },
  };
}
