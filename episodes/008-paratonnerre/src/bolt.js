// DOSSIER 008 — Paratonnerre : the storm. A dome at infinity (the grid of the ground, the horizon, the belly of the
// cloud lit from inside where the leader left it), the rain — hanging in the air while the film is stopped —, the
// stepped leader coming down by bounds with its branches, what the ground sends up to meet it, and the return
// stroke that climbs the channel back into the cloud.
//
//   signal   the leader coming down (the threat)
//   veille   what the rod sends up
//   ink      the weak answers of everything else, the rain, and the return stroke, white-hot
//
// A channel here is never a line: each stretch is drawn as a capsule with a core, a sheath of hot air and a long
// halo, as wide as its distance says (near: thick, far: thin), and the stretches are laid over each other with
// "the brightest wins" — no bead where two meet, no knot where a branch leaves.
//
// The sky is a studio model, built to be read from the lawn (EYE): nothing in it is to scale but the house, and
// the film never shows a height on a picture of the sky.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { anchor } from "@kit/build3d.js";
import { HOUSE, ROD, TREE, CHIMNEY, ANTENNA, YOU, SKY, LEADER } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const VIEW = new THREE.Vector2(BRAND.W, BRAND.H);

// Where the sky stands is the plan's business. This file was tuned with the cloud at 60 m, the leader leaving it at
// [1950, 6000, -890], the junction at [-370, 1640, 40] and the film opening on leader = 9 / 14 (docs/journal/008-bolt.md).
const BASE = SKY.base;
const FROM = LEADER.from;
const JUNCTION = LEADER.junction;

/** The leader's bounds, from the cloud to the junction: bound k of BOUNDS has landed when `leader` = k / BOUNDS. */
export const BOUNDS = 14;
const SUB = 4; // stretches per bound: a bound is not a ruler
/** The bounds already made when the film opens (`leader` = HELD / BOUNDS on the first frame)… */
const HELD = Math.min(BOUNDS - 2, Math.max(4, Math.round(LEADER.first * BOUNDS)));
/** …and how much of the way down they are, on the picture seen from the lawn: the five still to come arrive toward the eye, foreshortened. */
const HELD_SHARE = 0.72;
/** The lawn, where the hook is filmed from: the leader is drawn to be read from here (and from anywhere near it). */
const EYE = [-2280, 40, 2590];
const GAP = JUNCTION[1] - ROD.tip[1]; // the last gap, the one the rod's own leader crosses: every other answer is a share of it

/* ───────────────────────────────────────────────────────────── a little vector algebra (build time only) */

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const mix = (a, b, t) => a + (b - a) * t;

/** The picture seen from EYE looking at the middle of [from, to]: a point ↔ (right, up, depth), right and up per unit of depth. */
function eyeSpace(from, to) {
  const F = unit(sub([(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2], EYE));
  const R = unit(cross(F, [0, 1, 0]));
  const U = cross(R, F);
  return {
    to(p) {
      const v = sub(p, EYE);
      const z = dot(v, F);
      return [dot(v, R) / z, dot(v, U) / z, z];
    },
    from: (e) => [0, 1, 2].map((i) => EYE[i] + e[2] * (F[i] + e[0] * R[i] + e[1] * U[i])),
  };
}

/** From one corner to the next, in eye space: SUB stretches that wander a little off the straight line (`a` is not pushed, `b` is). */
function stretch(a, b, rand, deep, out) {
  const d = [b[0] - a[0], b[1] - a[1]];
  for (let j = 1; j <= SUB; j++) {
    const t = j / SUB;
    const k = j < SUB ? Math.sin(Math.PI * t) : 0;
    const off = (rand() - 0.5) * 0.2 * k;
    out.push([a[0] + d[0] * t - d[1] * off, a[1] + d[1] * t + d[0] * off, a[2] + (b[2] - a[2]) * t + (rand() - 0.5) * deep * 0.5 * k]);
  }
}

/**
 * The stepped leader: BOUNDS bounds in a zigzag from the cloud to the junction, and its branches — each leaves from
 * a corner, on the side the channel turns away from, advances a few bounds (shorter each time) in a plane of its
 * own, toward the eye or away from it, and stops. A long branch may fork once more.
 */
function makeLeader(from, to, rand) {
  const E = eyeSpace(from, to);
  const e0 = E.to(from);
  const e1 = E.to(to);
  const ax = [e1[0] - e0[0], e1[1] - e0[1]];
  const la = Math.hypot(ax[0], ax[1]);
  const along = [ax[0] / la, ax[1] / la];
  const perp = [-along[1], along[0]];
  const way = (k) => (k <= HELD ? (HELD_SHARE * k) / HELD : HELD_SHARE + ((1 - HELD_SHARE) * (k - HELD)) / (BOUNDS - HELD));
  const deep = (Math.abs(e1[2] - e0[2]) / BOUNDS) * 0.3; // how far a corner may sit before or behind the line
  const bow = 0.115 * la; // it bows to the right of the picture on its way down: behind the header it passes between the labels
  let side = rand() < 0.5 ? 1 : -1;
  let lat = 0;
  const corners = [];
  for (let k = 0; k <= BOUNDS; k++) {
    const free = k === 0 || k === BOUNDS ? 0 : 1;
    const step = (way(Math.min(k + 1, BOUNDS)) - way(Math.max(k - 1, 0))) / 2;
    const t = way(k) + free * (rand() - 0.5) * 0.3 * step;
    if (rand() < 0.82) side = -side;
    const swing = side * (0.16 + 0.3 * rand()) * step * la * (k === BOUNDS - 1 ? 0.5 : 1);
    lat = k === HELD ? lat * 0.4 : swing; // the bound that hangs over the roof on the first frame comes straight down at it
    const off = free * (lat + Math.sin(Math.PI * t) * bow);
    corners.push([e0[0] + ax[0] * t + perp[0] * off, e0[1] + ax[1] * t + perp[1] * off, mix(e0[2], e1[2], k / BOUNDS) + free * (rand() - 0.5) * 2 * deep]);
  }
  const main = [corners[0]];
  for (let k = 0; k < BOUNDS; k++) stretch(corners[k], corners[k + 1], rand, deep, main);

  const branches = [];
  /** `bound`: the bound of the main channel this branch's first bound grows with · `m` bounds · `w`: [width at the fork, at the end]. */
  const grow = (start, bound, m, ang, len, depth, w, sgn, twig) => {
    const pts = [start];
    let p = start;
    for (let i = 0; i < m; i++) {
      const dir = [along[0] * Math.cos(ang) + perp[0] * Math.sin(ang), along[1] * Math.cos(ang) + perp[1] * Math.sin(ang)];
      const q = [p[0] + dir[0] * len, p[1] + dir[1] * len, p[2] + depth * (0.6 + 0.8 * rand())];
      stretch(p, q, rand, deep, pts);
      if (twig && i === 0 && m >= 3 && bound + 1 < BOUNDS) grow(q, bound + 1, Math.min(2, BOUNDS - bound - 1), ang - sgn * (0.6 + 0.3 * rand()), len * 0.62, -depth * 0.7, [w[0] * 0.62, 0.5], -sgn, false);
      p = q;
      len *= 0.8;
      ang += (rand() - 0.5) * 0.7 - sgn * 0.12; // it wanders, and falls back toward the way down
    }
    branches.push({ bound, m, w, pts: pts.map(E.from) });
  };
  const pool = [];
  for (let c = 2; c < HELD; c++) pool.push(c); // none on the last bounds: they are the channel alone, and the junction stays clear
  const forks = [];
  while (forks.length < 6 && pool.length) forks.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  forks.sort((a, b) => a - b);
  for (const c of forks) {
    const seg = [corners[c + 1][0] - corners[c][0], corners[c + 1][1] - corners[c][1]];
    const len = Math.hypot(seg[0], seg[1]);
    const sgn = seg[0] * perp[0] + seg[1] * perp[1] > 0 ? -1 : 1;
    const m = Math.min(c >= HELD - 2 ? 2 : 4, 2 + Math.floor(rand() * 2.99));
    // (the low ones go away from the eye: the channel's last bounds come toward it, and must not run among them)
    const depth = (c >= HELD - 4 || rand() < 0.5 ? 1 : -1) * (0.5 + 0.7 * rand()) * len * corners[c][2];
    grow(corners[c], c, m, sgn * (0.45 + 0.4 * rand()), len * (0.85 + 0.3 * rand()), depth, [0.8, 0.5], sgn, true);
  }
  return { main: main.map(E.from), branches, share: la };
}

/** What the rod sends up: one supple line from its tip to the junction — no bounds, a positive leader climbs without stopping. */
function makeRise(from, to, rand, n = 30) {
  const E = eyeSpace(from, to);
  const e0 = E.to(from);
  const e1 = E.to(to);
  const d = [e1[0] - e0[0], e1[1] - e0[1]];
  const size = Math.hypot(d[0], d[1]) * (e0[2] + e1[2]) * 0.5;
  const p1 = rand() * 6.283;
  const p2 = rand() * 6.283;
  const p3 = rand() * 6.283;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const env = Math.pow(Math.sin(Math.PI * t), 0.75);
    const off = (0.05 * Math.sin(6.283 * 1.1 * t + p1) + 0.028 * Math.sin(6.283 * 2.7 * t + p2)) * env + (i > 0 && i < n ? (rand() - 0.5) * 0.016 : 0);
    pts.push(E.from([e0[0] + d[0] * t - d[1] * off, e0[1] + d[1] * t + d[0] * off, mix(e0[2], e1[2], t) + 0.05 * size * Math.sin(6.283 * 1.6 * t + p3) * env]));
  }
  return { pts, share: Math.hypot(d[0], d[1]) };
}

/** A weak answer: it leaves `base`, leans toward `toward`, wanders more and more, and stops after `length`. */
function makeStreamer(base, toward, length, rand, { n = 12, lean = 0.4, wander = 0.07 } = {}) {
  const h = [toward[0] - base[0], 0, toward[2] - base[2]];
  const hl = Math.hypot(h[0], h[2]) || 1;
  const D = unit([(h[0] / hl) * lean, 1, (h[2] / hl) * lean]);
  const U1 = unit(cross(D, [0, 0, 1]));
  const U2 = cross(D, U1);
  const p1 = rand() * 6.283;
  const p2 = rand() * 6.283;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const free = Math.pow(t, 0.8) * length;
    const a = (wander * Math.sin(6.283 * 1.3 * t + p1) + (rand() - 0.5) * 0.03) * free;
    const b = (wander * Math.sin(6.283 * 1.7 * t + p2) + (rand() - 0.5) * 0.03) * free;
    pts.push([0, 1, 2].map((k) => base[k] + D[k] * length * t + U1[k] * a + U2[k] * b));
  }
  return pts;
}

/* ───────────────────────────────────────────────────────────── the channels */

/** Stretches gathered into one mesh. Each is four corners of a quad the shader lays along it, on the picture. */
function ribbon() {
  const A = [];
  const B = [];
  const S = [];
  const W = [];
  const C = [];
  const K = [];
  const index = [];
  let n = 0;
  return {
    /**
     * A line of points. `s(i)`: when point i is reached (0–1, or in bounds / BOUNDS) · `q(i)`: where it stands on the way
     * of the return stroke (0 the tip of the rod → 1 the cloud; 2: never struck) · `w(i)` its width, `g(i)` its light ·
     * `bound(i)`: the bound the stretch from i belongs to · `branch`: 1 for what is not the main channel.
     */
    line(pts, { s, q = () => 2, w = () => 1, g = () => 1, bound = () => 0, branch = 0 }) {
      for (let i = 0; i < pts.length - 1; i++) {
        for (const [end, edge] of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
          A.push(...pts[i]);
          B.push(...pts[i + 1]);
          S.push(s(i), s(i + 1), q(i), q(i + 1));
          W.push(w(i), w(i + 1), g(i), g(i + 1));
          C.push(end, edge);
          K.push(bound(i), branch);
        }
        index.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
        n += 4;
      }
    },
    mesh(material) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(A, 3));
      geo.setAttribute("aB", new THREE.Float32BufferAttribute(B, 3));
      geo.setAttribute("aS", new THREE.Float32BufferAttribute(S, 4));
      geo.setAttribute("aW", new THREE.Float32BufferAttribute(W, 4));
      geo.setAttribute("aCorner", new THREE.Float32BufferAttribute(C, 2));
      geo.setAttribute("aKind", new THREE.Float32BufferAttribute(K, 2));
      geo.setIndex(index);
      const mesh = new THREE.Mesh(geo, material);
      mesh.frustumCulled = false;
      mesh.renderOrder = 3;
      return mesh;
    },
  };
}

/**
 * The light of a channel.
 *   gains    its halo, its sheath, its core (HDR)      radius   half the width of its core in pixels, at 42 m
 *   heart    how much of the core is ink rather than `hue`: [settled, added where it is fresh] — a bright orange
 *            washed with white turns pink: the leader's settled bounds keep a core of pure signal, and only the
 *            bound that has just landed is white-hot
 *   settled  the light of a bound once it has settled (the fresh one: 1)
 *   stepped  it advances by bounds (uX in bounds) or in one go (uX 0–1)
 *   stroke   half the width of the return stroke through it, in pixels (0: never struck)
 */
const boltMat = ({ hue, heart = [0.45, 0.4], gains, radius = 2.5, stepped = false, stroke = 0, settled = 0.55 }) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation, // the brightest wins: stretches overlap at every corner, and must not add up there
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    uniforms: {
      uView: { value: VIEW }, uHue: { value: hue.clone() }, uInk: { value: INK.clone() }, uHeart: { value: new THREE.Vector2(...heart) },
      uK: { value: new THREE.Vector3(...gains) }, uRadius: { value: radius }, uWorld: { value: 1.1 }, uRef: { value: 4200 }, uSettled: { value: settled },
      uStepped: { value: stepped ? 1 : 0 }, uN: { value: BOUNDS }, uX: { value: 0 },
      uStroke: { value: stroke }, uFront: { value: -1 }, uHot: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform vec2 uView;
      uniform float uX, uN, uStepped, uRadius, uWorld, uRef, uSettled, uStroke, uFront, uHot;
      attribute vec3 aB; attribute vec4 aS, aW; attribute vec2 aCorner, aKind;
      varying vec2 vPa, vPb, vQ, vGain, vKind; varying vec4 vRad;
      void main() {
        float x = min(uX, uN);
        // a bound waits, then leaps: its whole length in the last third of its turn
        float tip = uStepped > 0.5 ? (floor(x) + smoothstep(0.62, 1.0, fract(x))) / uN : uX;
        float k = clamp((tip - aS.x) / max(aS.y - aS.x, 1e-6), 0.0, 1.0);
        vec4 ca = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec4 cb = projectionMatrix * modelViewMatrix * vec4(mix(position, aB, k), 1.0);
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        vPa = vec2(0.0); vPb = vec2(1.0); vQ = vec2(2.0); vGain = vec2(0.0); vRad = vec4(1.0); vKind = vec2(0.0);
        const float NEAR = 8.0;
        if (k > 0.0 && (ca.w > NEAR || cb.w > NEAR)) {
          if (ca.w < NEAR) ca = mix(ca, cb, (NEAR - ca.w) / (cb.w - ca.w));
          if (cb.w < NEAR) cb = mix(cb, ca, (NEAR - cb.w) / (ca.w - cb.w));
          float focal = 0.5 * uView.y * projectionMatrix[1][1];
          vec2 pa = (ca.xy / ca.w * 0.5 + 0.5) * uView;
          vec2 pb = (cb.xy / cb.w * 0.5 + 0.5) * uView;
          // one that climbs in one go is brighter toward its head; one that steps flares on the bound in progress
          float fresh = exp(-8.0 * max(tip - mix(aS.x, aS.y, k), 0.0));
          if (uStepped > 0.5) {
            float age = x - (aKind.x + 1.0); // in bounds, since this one landed
            fresh = age < 0.0 ? 1.0 : exp(-3.0 * age);
          }
          float glow = mix(uSettled, 1.0, fresh * mix(1.0, 0.5, aKind.y));
          vec2 depth = vec2(ca.w, cb.w);
          vec2 r = max(uRadius * clamp(sqrt(uRef / depth), 0.72, 1.7), min(uWorld * focal / depth, vec2(uRadius * 3.4)));
          r = max(r * vec2(aW.x, mix(aW.x, aW.y, k)) * (1.0 + 0.3 * fresh), vec2(1.25));
          float rs = max(uStroke * clamp(sqrt(uRef / (0.5 * (ca.w + cb.w))), 0.8, 1.25), 1.0);
          float struck = step(0.0001, uHot) * step(0.0, uFront) * step(0.0001, uStroke);
          float reach = max(max(r.x, r.y) * 7.0, struck * rs * 9.0) + 2.0;
          vPa = pa; vPb = pb; vRad = vec4(r, rs, reach);
          vQ = vec2(aS.z, mix(aS.z, aS.w, k));
          vGain = vec2(aW.z, mix(aW.z, aW.w, k)) * glow;
          vKind = vec2(aKind.y, fresh * (1.0 - aKind.y));
          vec2 run = pb - pa;
          float l = length(run);
          vec2 dir = l > 1e-3 ? run / l : vec2(0.0, 1.0);
          vec2 p = mix(pa, pb, aCorner.x) + dir * (aCorner.x * 2.0 - 1.0) * reach + vec2(-dir.y, dir.x) * aCorner.y * reach;
          gl_Position = vec4(p / uView * 2.0 - 1.0, mix(ca.z / ca.w, cb.z / cb.w, aCorner.x), 1.0);
        }
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue, uInk, uK; uniform vec2 uHeart; uniform float uFront, uHot;
      varying vec2 vPa, vPb, vQ, vGain, vKind; varying vec4 vRad;
      // the channel across: a core with a clear edge and a lighter heart, the hot air right around it, a long halo
      vec3 channel(float d, float r, float reach, vec3 hue, float heart, vec3 k) {
        float core = 1.0 - smoothstep(r - 0.8, r + 0.8, d);
        float centre = 1.0 - smoothstep(0.0, r, d);
        float sheath = exp(-d * d / (r * r * 5.8));
        float x = d / (r * 3.0);
        float halo = pow(1.0 + x * x, -1.4) * (1.0 - smoothstep(0.5 * reach, reach, d));
        return hue * (halo * k.x + sheath * k.y) + mix(hue, uInk, clamp(heart + 0.12 * centre, 0.0, 1.0)) * (core * k.z);
      }
      void main() {
        vec2 p = gl_FragCoord.xy;
        vec2 ba = vPb - vPa;
        float t = clamp(dot(p - vPa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
        float d = length(p - vPa - ba * t);
        float q = mix(vQ.x, vQ.y, t);
        // behind the front of the return stroke, the leader is no more: what is left is white, and only as bright as uHot
        float struck = (1.0 - smoothstep(uFront - 0.012, uFront + 0.004, q)) * step(0.0, uFront);
        float r = max(mix(vRad.x, vRad.y, t), 1.0);
        vec3 col = channel(d, r, r * 7.0, uHue, uHeart.x + uHeart.y * vKind.y, uK) * (mix(vGain.x, vGain.y, t) * (1.0 - struck));
        float rs = max(vRad.z * mix(1.0, 0.5, vKind.x), 1.0);
        col = max(col, channel(d, rs, rs * 9.0, uInk, 1.0, vec3(0.12, 0.22, 2.0)) * (struck * uHot * mix(1.0, 0.3, vKind.x)));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });

/**
 * A ball of light with no edge, always facing the eye: a small white-hot heart, a soft body, a long tail. `size`: its
 * radius in centimetres (the tail's end), never under `min` nor over `max` pixels.
 */
function makeHead({ hue, size = 240, min = 40, max = 260 }) {
  const uniforms = {
    uView: { value: VIEW }, uCenter: { value: new THREE.Vector3() }, uHue: { value: hue.clone() }, uHeart: { value: INK.clone() },
    uSize: { value: size }, uMin: { value: min }, uMax: { value: max }, uAmount: { value: 0 },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform vec3 uCenter; uniform float uSize, uMin, uMax, uAmount; uniform vec2 uView; varying vec2 vUv;
        void main() {
          vUv = position.xy;
          vec4 c = projectionMatrix * viewMatrix * vec4(uCenter, 1.0);
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (uAmount > 0.001 && c.w > 20.0) {
            float s = clamp(uSize * 0.5 * uView.y * projectionMatrix[1][1] / c.w, uMin, uMax);
            gl_Position = vec4(c.xy / c.w + position.xy * s / (uView * 0.5), c.z / c.w, 1.0);
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHue, uHeart; uniform float uAmount; varying vec2 vUv;
        void main() {
          float r2 = dot(vUv, vUv);
          float core = exp(-r2 / 0.0045);
          float body = exp(-r2 / 0.05) * 0.4;
          float tail = 0.16 / (1.0 + r2 / 0.012) * (1.0 - smoothstep(0.5, 1.0, sqrt(r2)));
          gl_FragColor = vec4((uHeart * core * 2.4 + uHue * (body + tail)) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return { mesh, uniforms, at: uniforms.uCenter.value };
}

/* ───────────────────────────────────────────────────────────── the rain */

/**
 * Drops in a cube that follows the eye (each stays where it is in the world: it is the cube's window that moves).
 * Each is drawn as the line it covers while the shutter is open, its head a bright bead: hanging in the air (uLen
 * short) it is a short stroke, falling it is a long one. Three cubes, each four times the last: there is always
 * rain at arm's length and rain far away, and every drop is as wide as its distance says.
 */
function makeRain({ count, half, seed, shared }) {
  const rand = rng(seed);
  const base = [];
  const seeds = [];
  const corner = [];
  const index = [];
  for (let i = 0; i < count; i++) {
    const p = [(rand() * 2 - 1) * half, (rand() * 2 - 1) * half, (rand() * 2 - 1) * half];
    const s = [rand(), rand(), rand()];
    for (const c of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
      base.push(...p);
      seeds.push(...s);
      corner.push(...c);
    }
    index.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 3, i * 4 + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(base, 3));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 3));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute(corner, 2));
  geo.setIndex(index);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms: { ...shared, uHalf: { value: half } },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uDrop, uLen, uAmount, uHalf, uHot, uGlow, uReach;
        uniform vec3 uTip, uInk, uSignal; uniform vec4 uRoof; uniform vec2 uEave, uView;
        attribute vec3 aSeed; attribute vec2 aCorner;
        varying vec3 vCol; varying vec2 vUv; varying float vLen;
        void main() {
          float k = 0.78 + 0.22 * aSeed.x; // not all at one speed
          vec3 p = position;
          p.y -= uDrop * k;
          vec3 rel = mod(p - cameraPosition + uHalf, 2.0 * uHalf) - uHalf; // the copy of this drop nearest to the eye
          vec3 w = cameraPosition + rel;
          float dist = length(rel) / uHalf;
          // (a ball inside the cube: a drop is gone before the cube's wall takes it to the other side)
          float seen = smoothstep(0.2, 0.34, dist) * (1.0 - smoothstep(0.7, 0.98, dist)) * smoothstep(0.0, 25.0, w.y);
          // it does not rain under a roof
          float roof = uRoof.w - (uRoof.w - uEave.x) * abs(w.z) / uEave.y;
          if (w.x > uRoof.x && w.x < uRoof.y && abs(w.z) < uRoof.z && w.y < roof) seen = 0.0;
          float len = uLen * k * (0.7 + 0.6 * aSeed.z);
          vec4 a = projectionMatrix * viewMatrix * vec4(w, 1.0);
          vec4 b = projectionMatrix * viewMatrix * vec4(w + vec3(0.0, len, 0.0), 1.0);
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          vCol = vec3(0.0); vUv = vec2(0.0); vLen = 1.0;
          if (seen * uAmount > 0.002 && a.w > 30.0 && b.w > 30.0) {
            float focal = 0.5 * uView.y * projectionMatrix[1][1];
            vec2 pa = a.xy / a.w * uView * 0.5;
            vec2 run = b.xy / b.w * uView * 0.5 - pa;
            float l = length(run);
            vec2 dir = l > 1e-3 ? run / l : vec2(0.0, 1.0);
            float wide = clamp(0.32 * focal / a.w, 1.3, 2.9); // half its width, in pixels
            float lpx = max(l, 3.4 * wide);                   // far away it is a short tick, never a dot
            float alongPx = mix(-1.6 * wide, lpx, aCorner.x);
            vec2 px = pa + dir * alongPx + vec2(-dir.y, dir.x) * aCorner.y * wide;
            gl_Position = vec4(px / (uView * 0.5), a.z / a.w, 1.0);
            vUv = vec2(alongPx / wide, aCorner.y);
            vLen = lpx / wide;
            float dim = mix(0.36, 1.0, clamp(520.0 / a.w, 0.0, 1.0)); // the far ones are a haze of ticks, the near ones shine
            vec3 toTip = w - uTip;
            float lit = uGlow / (1.0 + dot(toTip, toTip) / (uReach * uReach)); // wet air around the leader's head
            vCol = (uInk * ((0.4 + 0.6 * aSeed.y) * dim * (1.0 + 2.0 * uHot)) + uSignal * lit) * (seen * uAmount);
          }
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vCol; varying vec2 vUv; varying float vLen;
        void main() {
          float across = 1.0 - abs(vUv.y);
          float bead = exp(-(vUv.x * vUv.x + vUv.y * vUv.y * 1.6) / 0.9);
          float tail = smoothstep(-1.0, 0.0, vUv.x) * pow(clamp(1.0 - vUv.x / vLen, 0.0, 1.0), 1.5) * across;
          gl_FragColor = vec4(vCol * (bead * 1.25 + tail * 0.4), 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 30; // after the shells of glass: a house hides the rain behind it, and is clean of specks
  return mesh;
}

/* ───────────────────────────────────────────────────────────── the sky */

/**
 * The sky and the ground, drawn at infinity behind everything (the technique of 007's backdrop). The ground is
 * where each ray of the eye meets y = 0: a grid whose every level leaves before its cells get too small to draw.
 * The cloud is where it meets y = uBase: soft pouches hanging between rounded creases (a noise whose octaves leave
 * before they get under a few pixels: nothing shimmers), lit from inside where the leader left (a small bright
 * heart, a long tail, coming through where the cloud is thin), from below by the channel itself — which is what
 * gives the belly its relief —, and white by the return stroke. It melts into the dark long before the horizon.
 */
const skyMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() },
      uBase: { value: BASE }, uFrom: { value: new THREE.Vector3(...FROM) }, uJunction: { value: new THREE.Vector3(...JUNCTION) },
      uSky: { value: 1 }, uCloud: { value: 0 }, uHot: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position; // the dome follows the eye and never turns: the horizon stays level, and stays far
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSignal, uFrom, uJunction;
      uniform float uBase, uSky, uCloud, uHot;
      varying vec3 vDir;
      float lines(float q) {
        float w = max(fwidth(q) * 1.5, 1e-5);
        return 1.0 - smoothstep(0.0, w, abs(fract(q - 0.5) - 0.5));
      }
      float level(vec2 p, float cell) {
        vec2 q = p / cell;
        vec2 fw = fwidth(q);
        float show = smoothstep(4.0, 16.0, 1.0 / max(max(fw.x, fw.y), 1e-5)); // pixels per cell
        return show * max(lines(q.x), lines(q.y));
      }
      float hash12(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }
      // value noise and its slope
      vec3 noised(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
        vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
        float a = hash12(i), b = hash12(i + vec2(1.0, 0.0)), c = hash12(i + vec2(0.0, 1.0)), d = hash12(i + vec2(1.0, 1.0));
        float k = a - b - c + d;
        return vec3(a + (b - a) * u.x + (c - a) * u.y + k * u.x * u.y, du * vec2(b - a + k * u.y, c - a + k * u.x));
      }
      // how far the belly hangs (0 a crease … 1 the bottom of a pouch) and its slope; foot: cells per pixel.
      // The two widest octaves hang in pouches between rounded creases, the finer ones are plain soft noise:
      // creases at every scale are a rock face, not a cloud
      vec3 belly(vec2 q, float foot, int octaves) {
        float h = 0.0, amp = 0.5, freq = 1.0, sum = 0.0;
        vec2 g = vec2(0.0);
        mat2 m = mat2(1.0, 0.0, 0.0, 1.0);
        q += 0.3 * noised(q * 0.6 + 3.1).yz; // the pouches are not laid on a grid
        for (int i = 0; i < 5; i++) {
          if (i >= octaves) break;
          float keep = 1.0 - smoothstep(0.1, 0.36, freq * foot);
          vec3 n = noised(m * q + float(i) * 17.3);
          float s = 2.0 * n.x - 1.0;
          float p = i < 2 ? sqrt(s * s + 0.04) : 0.5 + 0.5 * s;
          float dp = i < 2 ? s / sqrt(s * s + 0.04) : 0.5;
          h += amp * keep * p;
          g += amp * keep * dp * 2.0 * (n.yz * m);
          sum += amp;
          m = mat2(1.6, 1.2, -1.2, 1.6) * m;
          freq *= 2.0;
          amp *= 0.46;
        }
        return vec3(h, g) / sum;
      }
      void main() {
        vec3 d = normalize(vDir);
        vec3 eye = cameraPosition;
        vec3 col = vec3(0.0);

        // ── the ground: a grid, and what the stroke throws on it around the house
        float tg = max(eye.y, 1.0) / max(-d.y, 1e-4);
        vec2 pg = eye.xz + d.xz * tg;
        float below = smoothstep(0.0, 0.002, -d.y);
        float grid = max(max(level(pg, 200.0) * 0.3, level(pg, 1000.0) * 0.55), max(level(pg, 5000.0) * 0.85, level(pg, 25000.0)));
        vec2 gj = (pg - uJunction.xz) / 1600.0;
        float thrown = uHot / (1.0 + dot(gj, gj));
        col += uInk * (grid * (0.1 + 0.45 * thrown) + 0.03 * thrown) * exp(-tg / 90000.0) * below;

        // ── the horizon: a faint line (brighter, it was a bar across the close shots of the rod), and a little air above it
        col += uInk * (0.035 * exp(-abs(d.y) / 0.0016) + step(0.0, d.y) * 0.02 * exp(-d.y / 0.1));

        // ── the belly of the cloud
        float lift = max(uBase - eye.y, 1.0);
        float tc = lift / max(d.y, 2e-3);
        vec2 pc = eye.xz + d.xz * tc;
        vec2 q = pc / (uBase * 0.42);
        float foot = max(length(dFdx(q)), length(dFdy(q)));
        const float HANG = 0.11; // how far a pouch hangs under the plane, in cells
        // one step of parallax: a pouch slides over what is behind it
        vec2 q2 = q - d.xz / max(d.y, 0.25) * HANG * belly(q, foot, 2).x;
        vec3 b = belly(q2, foot, 5);
        float h = b.x;
        vec3 n = normalize(vec3(-2.0 * HANG * b.y, -1.0, -2.0 * HANG * b.z)); // pointing down
        // lit from below by the channel that hangs from it: only the sides of the pouches that face it
        vec3 toL = vec3(uFrom.x, uBase * 0.78, uFrom.z) - vec3(pc.x, uBase, pc.y);
        float ndl = clamp(dot(n, toL / max(length(toL), 1.0)), 0.0, 1.0);
        float r2 = dot(pc - uFrom.xz, pc - uFrom.xz) / (uBase * uBase); // from where the leader left, in heights of the cloud
        // lit from inside: the light comes through where the cloud is thin, the pouches stay dark
        float thin = mix(1.0, 0.25, smoothstep(0.25, 0.8, h));
        float point = pow(1.0 + r2 / 0.0009, -1.1); // (a bell would be a disc stuck on the ceiling)
        float heart = 1.5 * point + 0.55 * pow(1.0 + r2 / 0.02, -1.3) * thin;
        float rim = 0.5 * ndl / (1.0 + r2 / 0.35);
        float heartHot = 1.8 * point + 0.24 * pow(1.0 + r2 / 0.05, -1.2) * thin;
        float rimHot = 0.36 * ndl / (1.0 + r2 / 0.9);
        vec3 cloud = uInk * (0.018 * (0.1 + 0.9 * h * h))
          + uSignal * (uCloud / (1.0 + 3.0 * uHot) * (heart + rim))
          + uInk * min(uHot * (heartHot + rimHot), 2.4);
        float far = exp(-tc / (uBase * 9.0)) * smoothstep(0.0, 0.04, d.y) * step(eye.y, uBase);
        col += cloud * far;

        gl_FragColor = vec4(col * uSky, 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the set */

/** A point of a line of points evenly spread in `s` (a Float32Array of xyz), written into a Vector3. */
function along(pts, s, out) {
  const n = pts.length / 3 - 1;
  const x = Math.min(Math.max(s, 0), 1) * n;
  const i = Math.min(Math.floor(x), n - 1);
  const f = x - i;
  const o = i * 3;
  out.set(pts[o] + (pts[o + 3] - pts[o]) * f, pts[o + 1] + (pts[o + 4] - pts[o + 1]) * f, pts[o + 2] + (pts[o + 5] - pts[o + 2]) * f);
}
const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function buildStorm() {
  const group = new THREE.Group();
  const rand = rng(8);

  /* ── the sky ── */
  const sky = skyMat();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), sky);
  dome.frustumCulled = false;
  dome.renderOrder = -50; // first: everything else is in front of it
  group.add(dome);

  /* ── the rain ── */
  const drops = {
    uDrop: { value: 0 }, uLen: { value: 6 }, uAmount: { value: 0 }, uHot: { value: 0 }, uGlow: { value: 0 }, uReach: { value: Math.max(650, GAP * 1.6) },
    uTip: { value: new THREE.Vector3() }, uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uView: { value: VIEW },
    uRoof: { value: new THREE.Vector4(HOUSE.x0 - HOUSE.over, HOUSE.x1 + HOUSE.over, HOUSE.z1 + HOUSE.over, HOUSE.ridge) },
    uEave: { value: new THREE.Vector2(HOUSE.eave, HOUSE.z1) },
  };
  const rain = new THREE.Group();
  rain.add(makeRain({ count: 4200, half: 420, seed: 31, shared: drops }), makeRain({ count: 4200, half: 1700, seed: 32, shared: drops }), makeRain({ count: 4200, half: 6800, seed: 33, shared: drops }));
  group.add(rain);

  /* ── the leader, its branches ── */
  const L = makeLeader(FROM, JUNCTION, rand);
  const rise = makeRise(ROD.tip, JUNCTION, rand);
  const upShare = rise.share / (rise.share + L.share); // how much of the return stroke's way is the rod's own leader
  const nMain = BOUNDS * SUB;
  const qMain = (s) => upShare + (1 - s) * (1 - upShare);
  const down = ribbon();
  down.line(L.main, {
    s: (i) => i / nMain,
    q: (i) => qMain(i / nMain),
    g: (i) => 0.4 + 0.6 * smoothstep(0, 0.07, i / nMain), // it comes out of the cloud's own light
    bound: (i) => Math.floor(i / SUB),
  });
  for (const br of L.branches) {
    const n = br.m * SUB;
    down.line(br.pts, {
      s: (i) => (br.bound + i / SUB) / BOUNDS,
      q: (i) => qMain(br.bound / BOUNDS) + 0.06 * (i / n),
      w: (i) => mix(br.w[0], br.w[1], i / n), // it thins out…
      g: (i) => mix(0.85, 0.4, i / n), //         …and pales
      bound: (i) => br.bound + Math.floor(i / SUB),
      branch: 1,
    });
  }
  const leader = down.mesh(boltMat({ hue: SIGNAL, heart: [0, 0.85], gains: [0.22, 0.6, 2.6], radius: 3, stepped: true, stroke: 4.5 }));
  group.add(leader);
  const mainPts = new Float32Array(L.main.flat());

  /* ── the house WITHOUT its rod: the stroke that comes down on the chimney. A channel already struck, from the
        cloud to the chimney pot — `hit` is its light (white-hot at 1.5, the leader's own colour as it dies out) ── */
  const L2 = makeLeader([FROM[0] - 700, FROM[1], FROM[2] + 260], [CHIMNEY.x, CHIMNEY.top + 4, CHIMNEY.z], rng(21));
  const hitLine = ribbon();
  hitLine.line(L2.main, { s: (i) => i / nMain, q: (i) => 1 - i / nMain, g: (i) => 0.4 + 0.6 * smoothstep(0, 0.07, i / nMain), bound: (i) => Math.floor(i / SUB) });
  for (const br of L2.branches) {
    const n = br.m * SUB;
    hitLine.line(br.pts, {
      s: (i) => (br.bound + i / SUB) / BOUNDS, q: (i) => 1 - br.bound / BOUNDS + 0.06 * (i / n),
      w: (i) => mix(br.w[0], br.w[1], i / n), g: (i) => mix(0.85, 0.4, i / n), bound: (i) => br.bound + Math.floor(i / SUB), branch: 1,
    });
  }
  const HIT_K = [0.22, 0.6, 2.6];
  const struck = hitLine.mesh(boltMat({ hue: SIGNAL, heart: [0, 0.85], gains: HIT_K, radius: 3, stepped: true, stroke: 4.5 }));
  struck.visible = false;
  group.add(struck);

  /* ── what the rod sends up ── */
  const nUp = rise.pts.length - 1;
  const upLine = ribbon();
  upLine.line(rise.pts, { s: (i) => i / nUp, q: (i) => (i / nUp) * upShare });
  const up = upLine.mesh(boltMat({ hue: VEILLE, heart: [0.45, 0.4], gains: [0.1, 0.3, 2.4], radius: 2.8, stroke: 4.5, settled: 0.7 }));
  group.add(up);
  const upPts = new Float32Array(rise.pts.flat());

  /* ── the weak answers: the tree's, the chimney's, the antenna's — each its own number, the voice names them one by one ── */
  const weak = () => boltMat({ hue: INK, heart: [1, 0], gains: [0.05, 0.14, 1.15], radius: 2.2, settled: 0.7 });
  const answer = (base, share, o) => {
    const pts = makeStreamer(base, JUNCTION, GAP * share, rand, o);
    const n = pts.length - 1;
    const line = ribbon();
    line.line(pts, { s: (i) => i / n, w: (i) => mix(0.85, 0.55, i / n), g: (i) => mix(0.8, 0.4, i / n) });
    const mesh = line.mesh(weak());
    group.add(mesh);
    return { mesh, pts: new Float32Array(pts.flat()) };
  };
  // (twice as long as first built: named one by one in a wide shot, at 2 m they were 80 px of hairline)
  const tree = answer([TREE.x - 40, TREE.top, TREE.z], 1.05);
  const chimney = answer([CHIMNEY.x, CHIMNEY.top, CHIMNEY.z], 0.75, { lean: 0.25 });
  const antenna = answer([ANTENNA.x, ANTENNA.top, ANTENNA.z], 0.9, { lean: 0.5 });

  /* ── the one that rises from your head, outside: your hair on end, and a filament that climbs out of it ── */
  const head = [YOU.outside[0], 176, YOU.outside[2]];
  const hairs = ribbon();
  const hairPts = makeStreamer(head, JUNCTION, 250, rand, { n: 16, lean: 0.1, wander: 0.025 });
  hairs.line(hairPts, { s: (i) => i / 16, w: (i) => mix(0.62, 0.5, i / 16), g: (i) => mix(0.75, 0.32, i / 16) });
  const second = makeStreamer([head[0] + 6, head[1] - 2, head[2] - 3], JUNCTION, 120, rand, { n: 8, lean: 0.35, wander: 0.04 });
  hairs.line(second, { s: (i) => i / 8, w: () => 0.5, g: (i) => mix(0.5, 0.2, i / 8) });
  for (let i = 0; i < 6; i++) {
    const a = i * 1.047 + 0.4;
    const root = [head[0] + 7 * Math.cos(a), head[1] - 3, head[2] + 7 * Math.sin(a)];
    const pts = makeStreamer(root, [root[0] + Math.cos(a), 0, root[2] + Math.sin(a)], 26 + 18 * rand(), rand, { n: 4, lean: 0.4, wander: 0.05 });
    hairs.line(pts, { s: (j) => j / 4, w: () => 0.5, g: (j) => mix(0.55, 0.25, j / 4) });
  }
  const hair = hairs.mesh(weak());
  group.add(hair);
  const hairLine = new Float32Array(hairPts.flat());

  /* ── the balls of light ── */
  const heads = {
    leader: makeHead({ hue: SIGNAL, size: 330, min: 54, max: 280 }),
    up: makeHead({ hue: VEILLE, size: 170, min: 36, max: 220 }),
    front: makeHead({ hue: INK, size: 330, min: 60, max: 320 }),
    tree: makeHead({ hue: INK, size: 70, min: 16, max: 90 }),
    chimney: makeHead({ hue: INK, size: 70, min: 16, max: 90 }),
    antenna: makeHead({ hue: INK, size: 70, min: 16, max: 90 }),
    hair: makeHead({ hue: INK, size: 60, min: 16, max: 110 }),
  };
  for (const h of Object.values(heads)) group.add(h.mesh);

  /* ── what the stroke throws on the house ── */
  const flash = new THREE.PointLight(BRAND.ink, 0, 0, 2);
  flash.position.set(JUNCTION[0], JUNCTION[1] + 150, JUNCTION[2] + 60);
  group.add(flash);

  const A = {
    junction: anchor(group, ...JUNCTION),
    cloud: anchor(group, ...FROM),
    leaderTip: anchor(group, ...FROM),
    upTip: anchor(group, ...ROD.tip),
    treeUp: anchor(group, TREE.x, TREE.top, TREE.z),
    chimneyUp: anchor(group, CHIMNEY.x, CHIMNEY.top, CHIMNEY.z),
    antennaUp: anchor(group, ANTENNA.x, ANTENNA.top, ANTENNA.z),
    hairTip: anchor(group, ...head),
    front: anchor(group, ...ROD.tip),
  };

  const answers = (one, o, tipAnchor, tipHead) => {
    one.mesh.visible = o > 0.0005;
    one.mesh.material.uniforms.uX.value = o;
    along(one.pts, o, tipAnchor.position);
    tipHead.at.copy(tipAnchor.position);
    tipHead.uniforms.uAmount.value = 0.5 * smoothstep(0, 0.06, o);
  };

  return {
    group, A,
    /**
     * Every sample of the shutter (uniforms and positions only).
     *   sky     the grid, the horizon, the cloud (0–1)          cloud   the signal glow inside it, where the leader left (0–1)
     *   rain    the drops (how visible)                         fall    0 hanging in the air → 1 real rain (the length of their streaks)
     *   drop    how far they have fallen, in cm                 leader  0 in the cloud → 1 at the junction: bound k has landed at k / BOUNDS
     *   up      the rod's leader, 0 → 1 at the junction         upTree, upChimney, upAntenna   the others' answers, each 0 → 1 its full
     *   hair    the one above your head, outside (0–1)                  length (`ups`, if given, stands for the three)
     *   strike  the return stroke's front, 0 the tip of the rod → 1 the cloud          hot   how bright the struck channel is (0–1.5)
     */
    update({ sky: showSky = 1, cloud = 0, rain: showRain = 0, fall = 0, drop = 0, leader: k = 0, up: u = 0, ups, upTree = ups ?? 0, upChimney = ups ?? 0, upAntenna = ups ?? 0, hair: hr = 0, strike = 0, hot = 0, hit = 0 } = {}, time = 0) {
      const breath = 1 + 0.05 * Math.sin(time * 1.7); // slow: a glow that flickers reads as a fault
      const front = strike > 0 ? strike * 1.016 : -1;
      const gone = 1 - smoothstep(0, 0.03, strike); // the heads of the two leaders: the stroke takes their place

      dome.visible = showSky > 0.001;
      sky.uniforms.uSky.value = showSky;
      sky.uniforms.uCloud.value = cloud * breath * (1 - smoothstep(0.7, 1, strike)); // the stroke reaches the cloud: the leader's glow has gone with the leader
      sky.uniforms.uHot.value = Math.max(hot, hit);

      // the stroke on the chimney (the house without its rod)
      struck.visible = hit > 0.002;
      if (struck.visible) {
        const u = struck.material.uniforms;
        const k = Math.min(1, hit / 0.25);
        u.uX.value = BOUNDS;
        u.uFront.value = 1.016;
        u.uHot.value = hit;
        u.uK.value.set(HIT_K[0] * k, HIT_K[1] * k, HIT_K[2] * k);
      }

      // the leader (the tiny margin: k / BOUNDS × BOUNDS must not fall a hair short of k)
      const x = Math.min(Math.min(Math.max(k, 0), 1) * BOUNDS + 1e-6, BOUNDS);
      const done = Math.floor(x);
      const tip = Math.min(1, (done + smoothstep(0.62, 1, x - done)) / BOUNDS);
      leader.visible = k > 0;
      leader.material.uniforms.uX.value = x;
      leader.material.uniforms.uFront.value = front;
      leader.material.uniforms.uHot.value = hot;
      along(mainPts, tip, A.leaderTip.position);
      heads.leader.at.copy(A.leaderTip.position);
      // (its head flares as a bound lands, and settles)
      const landed = x - done > 0.62 ? 1 : Math.exp(-3 * (x - done));
      heads.leader.uniforms.uAmount.value = k > 0 ? smoothstep(0, 0.02, tip) * (0.72 + 0.4 * landed) * breath * gone : 0;

      // the rod's answer
      up.visible = u > 0.0005;
      up.material.uniforms.uX.value = u;
      up.material.uniforms.uFront.value = front;
      up.material.uniforms.uHot.value = hot;
      along(upPts, u, A.upTip.position);
      heads.up.at.copy(A.upTip.position);
      heads.up.uniforms.uAmount.value = smoothstep(0, 0.04, u) * gone;

      // the others'
      answers(tree, upTree, A.treeUp, heads.tree);
      answers(chimney, upChimney, A.chimneyUp, heads.chimney);
      answers(antenna, upAntenna, A.antennaUp, heads.antenna);

      hair.visible = hr > 0.0005;
      hair.material.uniforms.uX.value = hr;
      along(hairLine, hr, A.hairTip.position);
      heads.hair.at.copy(A.hairTip.position);
      heads.hair.uniforms.uAmount.value = 0.55 * smoothstep(0, 0.06, hr);

      // the return stroke: its front climbs the rod's leader, then the channel
      const s = Math.min(Math.max(strike, 0), 1);
      if (s <= upShare) along(upPts, s / upShare, A.front.position);
      else along(mainPts, 1 - (s - upShare) / (1 - upShare), A.front.position);
      heads.front.at.copy(A.front.position);
      heads.front.uniforms.uAmount.value = Math.min(hot, 1.2) * smoothstep(0, 0.02, s) * (1 - smoothstep(0.9, 1, s));
      flash.intensity = Math.max(hot, hit) * 1.2e6;

      // the rain
      rain.visible = showRain > 0.001;
      drops.uAmount.value = showRain;
      drops.uLen.value = mix(6, 58, fall);
      drops.uDrop.value = drop;
      drops.uHot.value = Math.max(hot, hit);
      drops.uTip.value.copy(A.leaderTip.position);
      drops.uGlow.value = k > 0 ? 2.6 * gone : 0;
    },
  };
}
