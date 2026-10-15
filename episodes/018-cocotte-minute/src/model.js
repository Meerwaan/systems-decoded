// DOSSIER 018 — Cocotte-minute : the system. A pressure cooker of stainless steel, solid, and what goes on in it.
//
//   buildSystem() → { root, parts, A, update(p, time, px) }
//   root    one object, its origin the centre of the cooker's base (world.js stands it on the burner, or on the bench)
//   parts   { body, seal, lid, weight, safety, pin } — each can fade and has ITS OWN materials
//   A       anchors that follow their parts, exploded or not:
//           body, lid, seal, valve (the weight), hole (the chimney's mouth), safety, pin, stop, window, handle,
//           water (the surface), foam (its top), inside (the middle of the vapour), top (above the weight), jet (2 cm above the valve)
//   p       bench, bar, seen, xray, fill, mark, boil, foam, clog, clog2, whistle, off, safety, leak, plume, twist, explode,
//           litBody, litLid, litSeal, litValve, litSafety, litPin          (see FIRST in world.js)
//
// Three greys: the base and the two handles dark, the steel in the middle, the weight and the seal light.
// Two colours of steam, and that is the film: INSIDE, held prisoner, it is signal — a volume that packs under the lid,
// a hot skin against it, short strokes that beat on it. OUTSIDE, let out by the system, it is veille — a bright root
// where it leaves, a long tail that widens and melts. Nothing white, no flash, nothing ever bursts.
// With `xray` the vessel, the lid and the chimney's tube turn to glass where they stand (the bore must show: it is
// where the foam climbs and blocks); the weight, the safety plug, the pin, the seal, the lugs and the handles stay solid.
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { solid, glow, setGlow, glass, asShell, edgesOf, makePart, addMesh, setPartOpacity, anchor, box, cyl, lathe, plate, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { POT, LID, LUGS, SEAL, WINDOW, HANDLE, VALVE, SAFETY, PIN, STOP, INSIDE, HALF, APART, polar } from "./plan.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const WHITE = new THREE.Color(1, 1, 1);
const PALE = VEILLE.clone().lerp(WHITE, 0.45); //   steam at its root
const HOTSIG = SIGNAL.clone().lerp(new THREE.Color(1, 0.8, 0.5), 0.55); // steam packed against the lid
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);
const glsl3 = (c) => `vec3(${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)})`;
const f = (x) => x.toFixed(3);

/* ─────────────────────────────────────────────────────────── where everything is */

const FLOOR = INSIDE.floor + 0.1; //                the vessel's floor, inside
const RIM = POT.r + 0.15; //                         the rolled rim
const RC = 9.5; //                                   the radius of what is in the vessel
const TH = 0.25; //                                  the lid's sheet
const SK = LID.r - 0.28; //                          the skirt, inside
const SLOPE = (LID.top - LID.shoulder) / (LID.r - LID.flat); // the lid is a cone: how fast it comes down with the radius
const UNDER = LID.top - TH; //                       its underside, on the axis
const LUG0 = 40; //                                  where the first lug stands (degrees): clear of the window, of the stop
const [VX, VY, VZ] = VALVE.at;
const CH = VALVE.chimney;
const MOUTH = VY + CH.h; //                          the chimney's mouth, where the weight sits
const NOZZLE = INSIDE.under - 0.15; //               its other end, under the lid
const W0 = MOUTH - 0.7; //                           the weight's foot
const [SX, SY, SZ] = SAFETY.at;
const [PX, PY, PZ] = PIN.at;
const PIN_R = Math.hypot(PX, PZ);
const HOLE = PIN.r + 0.2; //                         the hole of the stop
const HOLD = (0.2 / PIN_R) / DEG; //                 how far the lid turns before the pin meets the hole's edge (degrees)
const [WX, , WZ] = polar(WINDOW.at, LID.r);
const W_ANG = Math.atan2(Math.sin(WINDOW.at * DEG), Math.cos(WINDOW.at * DEG)); // the window, as atan(z, x) gives it
const YHALF = FLOOR + HALF * (INSIDE.top - FLOOR);

/* ─────────────────────────────────────────────────────────── geometry */

/** A sector of a ring between two radii and two heights, centred on `at` degrees (plan.js: from +x toward +z), `arc` degrees wide. */
function sector(r0, r1, y0, y1, at, arc, { steps = Math.max(3, Math.ceil(arc / 4)), bevel = 0.06 } = {}) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = (at - arc / 2 + (arc * i) / steps) * DEG;
    pts.push([r1 * Math.cos(a), r1 * Math.sin(a)]);
  }
  for (let i = steps; i >= 0; i--) {
    const a = (at - arc / 2 + (arc * i) / steps) * DEG;
    pts.push([r0 * Math.cos(a), r0 * Math.sin(a)]);
  }
  const g = plate(pts, y1 - y0, { bevel, round: 1 });
  g.rotateX(Math.PI / 2); // the outline's y → z, its thickness → down
  g.translate(0, y1, 0);
  return g;
}
/** Six of them, one per lug. */
const sixOf = (make) => mergeGeometries(Array.from({ length: LUGS.n }, (_, i) => make(LUG0 + (360 / LUGS.n) * i)));

/** A side silhouette ([radius, y] points) given a width, standing along `at` degrees: a handle. */
function along(outline, width, at, bevel = 0.4) {
  const g = plate(outline, width, { bevel, round: 3 });
  g.translate(0, 0, -width / 2);
  g.rotateY(-at * DEG);
  return g;
}

/** `count` squares that always face the eye: the shader stands each where its seed (four numbers, 0–1) says. */
function sprites(count, seed) {
  const rand = rng(seed);
  const corner = [];
  const seeds = [];
  const index = [];
  for (let i = 0; i < count; i++) {
    const s = [(i + rand()) / count, rand(), rand(), rand()]; // the first one spread evenly: it is a phase
    for (const c of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      corner.push(...c);
      seeds.push(...s);
    }
    index.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(count * 12), 3));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute(corner, 2));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 4));
  geo.setIndex(index);
  return geo;
}

/** The push under the lid: short thick strokes, each standing along the lid's own normal, its head against the sheet. */
function strokes() {
  const rand = rng(18);
  const all = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (const [r, n, turn] of [[8.1, 9, 0.2], [5.3, 6, 0.6], [2.3, 3, 0.1]]) {
    for (let i = 0; i < n; i++) {
      const a = ((i + turn + 0.3 * (rand() - 0.5)) / n) * TAU;
      const dir = new THREE.Vector3(r > LID.flat ? SLOPE * Math.cos(a) : 0, 1, r > LID.flat ? SLOPE * Math.sin(a) : 0).normalize();
      const g = new THREE.CapsuleGeometry(0.15, 0.75, 4, 8);
      const y = g.attributes.position;
      const t = new Float32Array(y.count);
      for (let v = 0; v < y.count; v++) t[v] = clamp01(y.getY(v) / 1.05 + 0.5);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir));
      const head = UNDER - 0.1 - Math.max(r - LID.flat, 0) * SLOPE;
      g.translate(r * Math.cos(a) - dir.x * 0.55, head - dir.y * 0.55, r * Math.sin(a) - dir.z * 0.55);
      g.setAttribute("aT", new THREE.Float32BufferAttribute(t, 1));
      g.setAttribute("aDir", new THREE.Float32BufferAttribute(Array.from({ length: y.count }, () => [dir.x, dir.y, dir.z]).flat(), 3));
      g.setAttribute("aPhase", new THREE.Float32BufferAttribute(new Float32Array(y.count).fill(rand()), 1));
      all.push(g);
    }
  }
  return mergeGeometries(all);
}

/* ─────────────────────────────────────────────────────────── light that has a place */

const NOISE2 = /* glsl */ `
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise2(vec2 p) {
    vec2 i = floor(p); vec2 q = fract(p);
    q = q * q * (3.0 - 2.0 * q);
    return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), q.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), q.x), q.y);
  }`;
const NOISE3 = /* glsl */ `
  float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise3(vec3 p) {
    vec3 i = floor(p); vec3 q = fract(p);
    q = q * q * (3.0 - 2.0 * q);
    return mix(
      mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), q.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), q.x), q.y),
      mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), q.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), q.x), q.y),
      q.z);
  }`;
/** The lid's underside at a radius (the cone the steam packs against). */
const UNDER_GLSL = /* glsl */ `float under(float r) { return ${f(UNDER - 0.03)} - max(r - ${f(LID.flat)}, 0.0) * ${f(SLOPE)}; }`;
const SEEN = /* glsl */ `
  varying vec3 vN; varying vec3 vE; varying vec3 vP;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vE = normalize(-mv.xyz);
    vP = position;
    gl_Position = projectionMatrix * mv;
  }`;
const lightMaterial = (uniforms, vertexShader, fragmentShader, o = {}) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms, vertexShader, fragmentShader, ...o });
const lightMesh = (geometry, material, order = 4) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  mesh.visible = false;
  return mesh;
};

/**
 * THE STEAM HELD PRISONER: the room between the water and the lid, as a volume of signal light. Thicker where the eye
 * goes through more of it, denser toward the top, billows that climb and pack — and a hot skin against the lid's
 * underside, which is the push. `uDense` and `uHot` grow with the pressure. Nothing is drawn below `uLevel`.
 */
const vapourMaterial = (U) =>
  lightMaterial(
    U,
    SEEN,
    /* glsl */ `
    uniform float uAmount, uLevel, uDense, uHot, uTime; varying vec3 vN; varying vec3 vE; varying vec3 vP;
    ${NOISE3}
    ${UNDER_GLSL}
    void main() {
      float facing = clamp(abs(dot(normalize(vN), normalize(vE))), 0.0, 1.0);
      float r = length(vP.xz);
      float top = under(r);
      float w = max(fwidth(vP.y) * 1.5, 0.05);
      float above = smoothstep(uLevel - w, uLevel + w + 0.6, vP.y);
      float n = 0.62 * noise3(vP * 0.42 + vec3(0.0, -uTime * 0.55, 0.0)) + 0.38 * noise3(vP * 1.05 + vec3(uTime * 0.2, -uTime * 0.9, 1.7));
      float grad = mix(0.35, 1.0, smoothstep(uLevel, max(top, uLevel + 0.1), vP.y));
      float body = 0.2 + 0.8 * pow(facing, 1.25);
      float skin = exp(-max(top - vP.y, 0.0) / 0.6);
      float beat = 0.82 + 0.18 * sin(uTime * 2.2 + r * 0.5);
      float vol = uDense * body * (0.3 + 1.3 * n * n) * grad * above;
      float push = uHot * skin * beat * (0.5 + 0.5 * n);
      vec3 col = mix(${glsl3(SIGNAL)}, ${glsl3(HOTSIG)}, clamp(0.45 * uHot * skin * n, 0.0, 0.5));
      gl_FragColor = vec4(col * ((vol + push) * uAmount), 1.0);
    }`,
    { side: THREE.DoubleSide },
  );

/** Its push: each stroke comes up from below, presses on the lid, holds, and lets go — slowly, never in step. */
const pushMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    attribute vec3 aDir; attribute float aT; attribute float aPhase; uniform float uTime; varying float vT; varying float vLive;
    void main() {
      float u = fract(aPhase + uTime * 0.4);
      float below = 1.25 * (1.0 - smoothstep(0.0, 0.5, u));
      vLive = smoothstep(0.0, 0.14, u) * (1.0 - smoothstep(0.76, 1.0, u)) * (0.5 + 0.7 * smoothstep(0.3, 0.52, u));
      vT = aT;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position - aDir * below, 1.0);
    }`,
    /* glsl */ `
    uniform float uAmount; varying float vT; varying float vLive;
    void main() {
      vec3 col = mix(${glsl3(SIGNAL)}, ${glsl3(HOTSIG)}, vT * 0.8);
      gl_FragColor = vec4(col * ((0.3 + 1.1 * vT) * vLive * uAmount), 1.0);
    }`,
  );

/** The water: a faint volume of ink light that stops at its level, a clear skin under its surface. */
const waterMaterial = (U) =>
  lightMaterial(
    U,
    SEEN,
    /* glsl */ `
    uniform float uAmount, uLevel; varying vec3 vN; varying vec3 vE; varying vec3 vP;
    void main() {
      float facing = clamp(abs(dot(normalize(vN), normalize(vE))), 0.0, 1.0);
      float w = max(fwidth(vP.y) * 1.2, 0.04);
      float below = 1.0 - smoothstep(uLevel - w, uLevel + w, vP.y);
      float skin = exp(-max(uLevel - vP.y, 0.0) / 0.55);
      float deep = clamp((uLevel - vP.y) / 14.0, 0.0, 1.0);
      float body = (0.25 + 0.75 * pow(facing, 1.3)) * mix(1.0, 0.55, deep);
      gl_FragColor = vec4(${glsl3(INK)} * vec3(0.8, 0.93, 1.0) * ((0.14 * body + 0.24 * skin) * below * uAmount), 1.0);
    }`,
    { side: THREE.DoubleSide },
  );
/** Its surface: a sheet that heaves when it boils. */
const surfaceMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    uniform float uBoil, uTime; varying float vHeave;
    void main() {
      float h = sin(position.x * 0.8 + uTime * 2.2) * sin(position.z * 0.7 - uTime * 1.9) + 0.5 * sin(position.x * 1.9 - position.z * 1.3 + uTime * 3.1);
      vHeave = 0.5 + 0.33 * h;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y + uBoil * 0.2 * h, position.z, 1.0);
    }`,
    /* glsl */ `
    uniform float uAmount, uBoil; varying float vHeave;
    void main() { gl_FragColor = vec4(${glsl3(INK)} * ((0.2 + 0.4 * uBoil * vHeave) * uAmount), 1.0); }`,
    { side: THREE.DoubleSide },
  );
/** Bubbles: each leaves the floor, climbs to the surface, and starts again. */
const bubbleMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    attribute vec2 aCorner; attribute vec4 aSeed; uniform float uTime, uLevel; varying vec2 vUv; varying float vLive;
    void main() {
      float u = fract(aSeed.x + uTime * (0.22 + 0.16 * aSeed.y));
      float a = aSeed.z * 6.28319;
      float r = ${f(RC - 0.6)} * sqrt(aSeed.w);
      vec3 c = vec3(r * cos(a) + 0.25 * sin(u * 19.0 + aSeed.w * 40.0), mix(${f(FLOOR + 0.2)}, uLevel, u), r * sin(a));
      vLive = smoothstep(0.0, 0.1, u) * (1.0 - smoothstep(0.9, 1.0, u));
      vec4 mv = modelViewMatrix * vec4(c, 1.0);
      mv.xy += aCorner * max((0.16 + 0.22 * aSeed.y) * (0.6 + 0.7 * u), 1.6 * max(1.0, -mv.z) / (projectionMatrix[1][1] * ${H2}));
      vUv = aCorner;
      gl_Position = projectionMatrix * mv;
    }`,
    /* glsl */ `
    uniform float uAmount; varying vec2 vUv; varying float vLive;
    void main() {
      float r2 = dot(vUv, vUv);
      gl_FragColor = vec4(${glsl3(INK)} * (exp(-r2 * 3.0) * (1.0 - smoothstep(0.6, 1.0, r2)) * 0.9 * vLive * uAmount), 1.0);
    }`,
  );
/** The lentils, solid: at rest a bed on the floor; boiling, each rides a slow roll — up along the axis, out under the surface, down along the wall. */
const lentilMaterial = (U) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    uniforms: U,
    vertexShader: /* glsl */ `
      attribute vec2 aCorner; attribute vec4 aSeed; uniform float uTime, uBoil, uLevel; varying vec2 vUv;
      void main() {
        float u = fract(aSeed.x * 13.0 + uTime * 0.085 * (0.6 + 0.8 * aSeed.w));
        float lr = 0.3 + 0.65 * aSeed.y;
        float ph = u * 6.28319;
        float hh = max(uLevel - ${f(FLOOR)}, 0.4) * 0.5;
        float rl = 4.8 - 4.35 * lr * cos(ph);
        float yl = ${f(FLOOR)} + hh + max(hh - 0.4, 0.0) * lr * sin(ph);
        float rr = ${f(RC - 0.4)} * sqrt(aSeed.y);
        float yr = min(${f(FLOOR + 0.25)} + 1.3 * aSeed.w * (1.0 - 0.5 * aSeed.y), uLevel - 0.15);
        float a = aSeed.z * 6.28319 + uBoil * 0.3 * sin(uTime * 0.4 + aSeed.x * 40.0);
        vec3 c = vec3(mix(rr, rl, uBoil) * cos(a), mix(yr, yl, uBoil), mix(rr, rl, uBoil) * sin(a));
        vec4 mv = modelViewMatrix * vec4(c, 1.0);
        float turn = aSeed.w * 6.28319 + uBoil * (ph * 2.0);
        vec2 q = aCorner * vec2(1.0, 0.8);
        mv.xy += vec2(q.x * cos(turn) - q.y * sin(turn), q.x * sin(turn) + q.y * cos(turn)) * (0.23 + 0.07 * aSeed.z);
        vUv = aCorner;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        if (r2 > 1.0) discard;
        float shade = clamp(0.55 - 0.3 * vUv.x + 0.45 * vUv.y, 0.0, 1.0) * (1.0 - 0.5 * smoothstep(0.55, 1.0, r2));
        gl_FragColor = vec4(${glsl3(INK)} * (0.16 + 0.5 * shade), uAmount * (1.0 - smoothstep(0.82, 1.0, r2)));
      }`,
  });

/**
 * THE STEAM LET OUT: puffs with no edge that leave a mouth fast, slow down, widen and melt. Small and bright at the
 * root, wide and faint in the tail; `uPlume` says how far along it is still drawn (its last third fades into the dark).
 * uShape: x its length · y how wide it ends · z the radius of its root · w how much it climbs on the way (a jet that leaves sideways).
 */
const steamMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    attribute vec2 aCorner; attribute vec4 aSeed; uniform vec3 uFrom, uDir; uniform vec4 uShape; uniform float uTime, uPlume, uSpeed;
    varying vec2 vUv; varying float vAmount; varying vec2 vSeed; varying float vS;
    void main() {
      float u = fract(aSeed.x + uTime * uSpeed * (0.8 + 0.4 * aSeed.w));
      float s = (1.0 - exp(-2.3 * u)) / 0.8997;
      vec3 side = normalize(cross(uDir, vec3(0.31, 0.22, 0.92)));
      vec3 side2 = cross(uDir, side);
      float a = aSeed.y * 6.28319;
      float wide = uShape.z + uShape.y * pow(max(s, 0.0001), 1.35) * (0.25 + 0.75 * aSeed.z);
      vec3 c = uFrom + uDir * (uShape.x * s) + (side * cos(a) + side2 * sin(a)) * wide + vec3(0.0, uShape.w * s * s, 0.0);
      c += side * (0.14 * uShape.y * s * s * sin(uTime * 1.1 + aSeed.w * 6.28319));
      float size = mix(uShape.z * 0.55 + 0.35, uShape.y * 0.95, sqrt(s)) * (0.75 + 0.5 * aSeed.w);
      float end = max(uPlume, 0.05);
      vAmount = smoothstep(0.0, 0.04, u) * (1.0 - smoothstep(0.6 * end, end, s)) * mix(0.6, 0.05, sqrt(s));
      vS = s;
      vec4 mv = modelViewMatrix * vec4(c, 1.0);
      mv.xy += aCorner * size;
      vUv = aCorner;
      vSeed = aSeed.yz * 17.0;
      gl_Position = projectionMatrix * mv;
    }`,
    /* glsl */ `
    uniform float uAmount, uTime; varying vec2 vUv; varying float vAmount; varying vec2 vSeed; varying float vS;
    ${NOISE2}
    void main() {
      float r = length(vUv);
      float fall = exp(-r * r * 2.6) * (1.0 - smoothstep(0.6, 1.0, r));
      float n = 0.6 * noise2(vUv * 1.8 + vSeed + vec2(0.0, -uTime * 0.25)) + 0.4 * noise2(vUv * 3.9 - vSeed);
      vec3 col = mix(${glsl3(PALE)}, ${glsl3(VEILLE)}, smoothstep(0.0, 0.3, vS));
      gl_FragColor = vec4(col * (fall * (0.3 + 1.3 * n * n) * vAmount * uAmount), 1.0);
    }`,
  );

/** A ball of light with no edge, always facing the eye: a small hot heart, a soft body, a long tail. */
function makeBall(heart, hue) {
  return lightMesh(
    new THREE.PlaneGeometry(2, 2),
    lightMaterial(
      { uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
      /* glsl */ `
      uniform float uRadius, uMinPx; varying vec2 vUv;
      void main() {
        vUv = position.xy;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        c.xy += position.xy * r;
        gl_Position = projectionMatrix * c;
      }`,
      /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        float core = exp(-r2 / 0.012);
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
        gl_FragColor = vec4((uHeart * (core * 1.9) + uHue * (body + tail)) * uAmount, 1.0);
      }`,
    ),
    9,
  );
}
const shine = (ball, amount, radius, minPx = 0) => {
  ball.visible = amount > 0.004;
  ball.material.uniforms.uAmount.value = amount;
  ball.material.uniforms.uRadius.value = radius;
  ball.material.uniforms.uMinPx.value = minPx;
};

/**
 * The foam: ONE lit surface, stood by its vertex shader — a side against the vessel's wall, a top that rises from
 * the water (`uFoam.x`) to its own level (`uFoam.y`), domed (`uFoam.z`), slowly heaving, and never higher than the
 * lid's underside: at the top it lies against the cone. Signal where it touches a hole (`uTouch`: the chimney's, the safety valve's).
 */
function foamMaterial(U) {
  const mat = solid(new THREE.Color(0.5, 0.485, 0.45), { rough: 0.9 });
  mat.emissive = INK.clone().multiplyScalar(0.07); // light goes through foam: its shaded side is never dark
  mat.transparent = mat.userData.transparent = true;
  mat.customProgramCacheKey = () => "cooker-foam";
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        uniform vec4 uFoam; varying vec3 fP;
        ${UNDER_GLSL}
        float foamTop(vec2 p) {
          float r = length(p);
          float q = clamp(r / ${f(RC)}, 0.0, 1.0);
          float bumps = 0.17 * sin(p.x * 1.7 + uFoam.w * 0.9) * sin(p.y * 1.9 - uFoam.w * 0.7) + 0.09 * sin(p.x * 3.3 - p.y * 2.7 + uFoam.w * 1.3);
          float y = uFoam.y + uFoam.z * (1.0 - q * q) + bumps * min(1.0, uFoam.z * 3.0 + 0.4);
          return max(uFoam.x + 0.03, min(y, under(r) - 0.04));
        }`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        /* glsl */ `#include <beginnormal_vertex>
        if (position.y > 0.999 && length(position.xz) < ${f(RC - 0.2)}) {
          float hx = foamTop(position.xz + vec2(0.12, 0.0)) - foamTop(position.xz - vec2(0.12, 0.0));
          float hz = foamTop(position.xz + vec2(0.0, 0.12)) - foamTop(position.xz - vec2(0.0, 0.12));
          objectNormal = normalize(vec3(-hx, 0.24, -hz));
        }`,
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `#include <begin_vertex>
        transformed.y = mix(uFoam.x, foamTop(position.xz), position.y);
        fP = transformed;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", /* glsl */ `#include <common>\nuniform vec4 uFoam; uniform vec2 uTouch; varying vec3 fP;\n${UNDER_GLSL}`)
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        float cells = sin(fP.x * 5.3 + uFoam.w * 0.4) * sin(fP.z * 5.9 - uFoam.w * 0.3) * sin(fP.y * 6.1 + fP.x * 2.0);
        diffuseColor.rgb *= 0.9 + 0.1 * cells;`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        float nearLid = smoothstep(1.3, 0.15, under(length(fP.xz)) - fP.y);
        float d1 = dot(fP.xz, fP.xz);
        vec2 toSafe = fP.xz - vec2(${f(SX)}, ${f(SZ)});
        float d2 = dot(toSafe, toSafe);
        totalEmissiveRadiance += ${glsl3(SIGNAL)} * (nearLid * (uTouch.x * (1.5 * exp(-d1 / 1.6) + 0.25 * exp(-d1 / 14.0)) + uTouch.y * 1.4 * exp(-d2 / 1.5)));`,
      );
  };
  return mat;
}

/** The seal, with its hernia: at the window (and only there) its outer half swells out through the slot (`uBulge.x`, cm), and its lip lifts (`uBulge.y`). */
function sealMaterial(U) {
  const mat = solid(new THREE.Color(0.5, 0.487, 0.455), { rough: 0.95 });
  mat.customProgramCacheKey = () => "cooker-seal";
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform vec2 uBulge;").replace(
      "#include <begin_vertex>",
      /* glsl */ `#include <begin_vertex>
      {
        float rr = max(length(position.xz), 0.001);
        float d = atan(position.z, position.x) - (${f(W_ANG)});
        d = atan(sin(d), cos(d));
        float g = exp(-d * d / 0.0125);
        float outer = clamp((rr - ${f(SEAL.r - 0.25)}) / 0.6, 0.0, 1.0);
        transformed.xz += (position.xz / rr) * (uBulge.x * g * (0.3 + 0.7 * outer));
        transformed.y += uBulge.y * g * outer * (position.y > ${f(SEAL.y)} ? 1.0 : 0.25);
      }`,
    );
  };
  return mat;
}

/* ─────────────────────────────────────────────────────────── the system */

export function buildSystem() {
  const root = new THREE.Group();
  root.name = "cooker";
  const part = (name, parent = root) => {
    const p = makePart(name);
    parent.add(p);
    return p;
  };
  const steel = (v, o = {}) => solid(new THREE.Color(v, v * 1.01, v * 1.04), { rough: 0.5, metal: 0.45, env: 0.75, ...o });
  const bare = (geometry, material, parent, order = 3) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = order;
    parent.add(mesh);
    return mesh;
  };
  const shellGlass = () => glass(BRAND.ink, { base: 0.012, rim: 0.34, power: 2.4, edge: 0.5, spec: 0.6, through: 0.25 });
  /** The same shape as one glass, for the X-ray. */
  const ghostOf = (shape, parent) => {
    const mat = shellGlass();
    const mesh = new THREE.Mesh(shape, mat);
    const lines = edgesOf(shape, { color: BRAND.ink, width: 2, opacity: 0.45 });
    mesh.add(lines);
    mesh.visible = false;
    parent.add(mesh);
    return { mesh, mat, lines };
  };
  const see = (ghost, amount, tint = 0, hot = 0) => {
    ghost.mesh.visible = amount > 0.004;
    ghost.mat.uniforms.uAmount.value = amount;
    ghost.mat.uniforms.uColor.value.copy(INK).lerp(SIGNAL, 0.8 * hot).lerp(VEILLE, 0.7 * tint);
    ghost.lines.material.opacity = 0.45 * amount;
  };
  const M = {}; // the materials the voice can light up, by part

  /* ══ THE VESSEL: a thick base, a straight wall, a rolled rim with its six lugs, a long handle, the stop ══ */
  const body = part("body");
  const wall = part("wall", body); // what turns to glass
  const wallShape = lathe([[0, 0.86], [9.55, 0.86], [POT.r, 1.5], [POT.r, 13.72], [RIM, 13.9], [RIM, POT.h], [POT.r - POT.wall, POT.h], [POT.r - POT.wall, 1.45], [9.3, FLOOR], [0, FLOOR]], 96, { bevel: 0.14, round: 2 });
  M.wall = steel(0.33);
  addMesh(wall, wallShape, M.wall, { edgeOpacity: 0.5 });
  const bodyGhost = ghostOf(wallShape, body);
  addMesh(body, cyl(POT.base.r, POT.base.h, 0.16), steel(0.1, { rough: 0.6, metal: 0.4 }), { pos: [0, POT.base.h / 2, 0], edgeOpacity: 0.45 });
  M.ears = steel(0.33);
  addMesh(body, sixOf((a) => sector(POT.r + 0.05, POT.rim, 13.85, 14.45, a, LUGS.arc)), M.ears, { edgeOpacity: 0.6 });
  const dark = () => solid(new THREE.Color(0.035, 0.038, 0.042), { rough: 0.65, coat: 0.15, coatRough: 0.6 });
  addMesh(body, along([[9.9, 11.1], [12.6, 11.3], [25.5, 11.7], [25.5, 13.2], [9.9, 13.2]], HANDLE.w, HANDLE.at), dark(), { edgeOpacity: 0.6 });
  {
    // the stop: a foot riveted on the wall, a leg outside the lid's skirt, a tongue over the lid with its hole
    const tongue = new THREE.Shape();
    const hw = STOP.w / 2;
    tongue.moveTo(STOP.r1 + 0.25, -hw);
    tongue.lineTo(STOP.r0 + hw, -hw);
    tongue.absarc(STOP.r0 + hw, 0, hw, -Math.PI / 2, Math.PI / 2, true);
    tongue.lineTo(STOP.r1 + 0.25, hw);
    tongue.closePath();
    tongue.holes.push(new THREE.Path().absarc(PIN_R, 0, HOLE, 0, TAU, true));
    const top = plate(tongue, STOP.thick, { bevel: 0.07 });
    top.rotateX(Math.PI / 2);
    top.translate(0, STOP.y + STOP.thick / 2, 0);
    const leg = box(0.35, STOP.y - 12.3, STOP.w, 0.08).translate(STOP.r1 + 0.075, (STOP.y + 12.3) / 2, 0);
    const foot = box(STOP.r1 + 0.25 - POT.r, 0.35, STOP.w, 0.08).translate((STOP.r1 + 0.25 + POT.r) / 2, 12.45, 0);
    const rivet = cyl(0.3, 0.2, 0.06, 16).translate(POT.r + 0.45, 12.72, 0);
    M.stop = steel(0.33);
    addMesh(body, mergeGeometries([top, leg, foot, rivet].map((g) => g.rotateY(-STOP.at * DEG))), M.stop, { edgeOpacity: 0.7 });
  }
  // the hole of the stop, named
  const holeRing = bare(new THREE.TorusGeometry(HOLE + 0.07, 0.07, 8, 28).rotateX(Math.PI / 2).translate(PX, STOP.y + STOP.thick / 2 + 0.03, PZ), glow(BRAND.veille, 1.6, { opacity: 0 }), body, 4);
  // the half-way mark
  const markMat = glow(BRAND.veille, 1.5, { opacity: 0, double: true });
  const markBand = bare(new THREE.CylinderGeometry(POT.r + 0.05, POT.r + 0.05, 0.24, 96, 1, true).translate(0, YHALF, 0), markMat, body, 4);

  /* ══ THE SEAL ══ */
  const seal = part("seal");
  const SU = { uBulge: { value: new THREE.Vector2() } };
  M.seal = sealMaterial(SU);
  {
    const a = SEAL.r - SEAL.w / 2;
    const b = SEAL.r + SEAL.w / 2;
    const y0 = SEAL.y - SEAL.h / 2;
    const y1 = SEAL.y + SEAL.h / 2;
    addMesh(seal, lathe([[a, y0], [b, y0], [b, y1], [a, y1], [a, y0]], 192, { bevel: 0.22, round: 3 }), M.seal, { edgeOpacity: 0.55 });
  }

  /* ══ THE LID: a skirt over the rim, a cone, a flat crown; its lugs; the window; its handle ══ */
  const lid = part("lid");
  const dome = part("dome", lid); // what turns to glass
  M.dome = steel(0.37, { rough: 0.55 });
  const WY0 = SEAL.y - WINDOW.h / 2 - 0.03;
  const WY1 = SEAL.y + WINDOW.h / 2 + 0.03;
  addMesh(dome, lathe([[SK, LID.skirt[0]], [LID.r, LID.skirt[0]], [LID.r, WY0], [SK, WY0], [SK, LID.skirt[0]]], 96, { bevel: 0.06, round: 1 }), M.dome, { edgeOpacity: 0.5 });
  addMesh(dome, lathe([[SK, WY1], [LID.r, WY1], [LID.r, LID.shoulder], [LID.flat, LID.top], [0, LID.top], [0, UNDER], [LID.flat - 0.05, UNDER], [SK, LID.shoulder - TH + 0.06], [SK, WY1]], 96, { bevel: 0.3, round: 3 }), M.dome, { edgeOpacity: 0.5 });
  // the band the window is cut in: it goes all the way round but for the slot
  addMesh(dome, toCreasedNormals(sector(SK, LID.r + 0.09, WY0, WY1, WINDOW.at + 180, 360 - WINDOW.arc, { steps: 168, bevel: 0.05 }), 30 * DEG), M.dome, { edgeOpacity: 0.55 });
  // the lugs, as the sheet shows them outside: six pressed bosses at the foot of the skirt
  addMesh(dome, sixOf((a) => sector(LID.r - 0.03, LID.r + 0.16, LID.skirt[0], LID.skirt[0] + 0.62, a, LUGS.arc, { bevel: 0.05 })), M.dome, { edgeOpacity: 0.5 });
  const lidShape = lathe([[SK, LID.skirt[0]], [LID.r, LID.skirt[0]], [LID.r, LID.shoulder], [LID.flat, LID.top], [0, LID.top], [0, UNDER], [LID.flat - 0.05, UNDER], [SK, LID.shoulder - TH + 0.06], [SK, LID.skirt[0]]], 96, { bevel: 0.3, round: 3 });
  const lidGhost = ghostOf(lidShape, lid);
  // …and the lugs themselves, inside, under the vessel's: solid, whatever the lid is made of
  M.lugs = steel(0.48, { rough: 0.5, metal: 0.3 });
  addMesh(lid, sixOf((a) => sector(POT.r + 0.18, SK + 0.04, LID.skirt[0] + 0.02, LID.skirt[0] + 0.42, a, LUGS.arc)), M.lugs, { edgeOpacity: 0.7 });
  addMesh(lid, along([[11.35, 13.6], [25.3, 13.6], [25.3, 15.55], [13.0, 15.75], [11.6, 17.1], [8.2, 17.1], [8.2, 16.2], [10.6, 15.95], [11.35, 15.7]], HANDLE.w, HANDLE.at), dark(), { edgeOpacity: 0.6 });
  // what rides on the lid and stays solid: the chimney's nut, the safety valve's seat, the pin's bush
  M.seats = steel(0.28);
  addMesh(lid, mergeGeometries([
    lathe([[CH.r - 0.02, VY - 0.02], [1.1, VY - 0.02], [1.1, VY + 0.32], [CH.r - 0.02, VY + 0.42], [CH.r - 0.02, VY - 0.02]], 32, { bevel: 0.06 }).translate(VX, 0, VZ),
    lathe([[0.3, SY - 0.35], [1.25, SY - 0.35], [1.25, SY + 0.12], [0.3, SY + 0.12], [0.3, SY - 0.35]], 32, { bevel: 0.07 }).translate(SX, 0, SZ),
    lathe([[PIN.r + 0.03, PY - 0.25], [0.85, PY - 0.25], [0.85, PY + 0.14], [PIN.r + 0.03, PY + 0.14], [PIN.r + 0.03, PY - 0.25]], 28, { bevel: 0.06 }).translate(PX, 0, PZ),
  ]), M.seats, { edgeOpacity: 0.6 });
  // the chimney: a tube with a hole through it, a nozzle under the lid
  const tube = part("tube", lid);
  const tubeShape = lathe([[CH.hole, NOZZLE], [0.42, NOZZLE], [0.42, VY + 0.3], [CH.r, VY + 0.42], [CH.r, MOUTH - 0.14], [0.42, MOUTH], [CH.hole, MOUTH], [CH.hole, NOZZLE]], 40, { bevel: 0.04 }).translate(VX, 0, VZ);
  M.tube = steel(0.43, { rough: 0.45 });
  addMesh(tube, tubeShape, M.tube, { edgeOpacity: 0.6 });
  const tubeGhost = ghostOf(tubeShape, lid);
  asShell([bodyGhost.mesh, lidGhost.mesh, tubeGhost.mesh], 20);
  // in its bore: the steam that passes (veille), the foam that blocks it (signal)
  const boreGeo = new THREE.CylinderGeometry(1, 1, 1, 16).translate(0, 0.5, 0);
  const passMat = glow(BRAND.veille, 1.5, { opacity: 0 });
  const pass = bare(boreGeo, passMat, lid, 5);
  pass.position.set(VX, NOZZLE, VZ);
  pass.scale.set(0.13, MOUTH - NOZZLE, 0.13);
  const plugMat = glow(BRAND.signal, 1.7);
  const plug = bare(boreGeo, plugMat, lid, 5);
  plug.position.set(VX, NOZZLE - 0.25, VZ);
  const plug2 = bare(boreGeo, plugMat, lid, 5);
  plug2.position.set(SX, SY - 0.75, SZ);
  const plugBall = makeBall(HOTSIG, SIGNAL);
  lid.add(plugBall);
  const plugBall2 = makeBall(HOTSIG, SIGNAL);
  plugBall2.position.set(SX, SY - 0.55, SZ);
  lid.add(plugBall2);
  // the light under the weight when it lifts: the gap the steam leaves by
  const collarMat = glow(BRAND.veille, 1.5, { opacity: 0 });
  const collar = bare(new THREE.TorusGeometry(0.7, 0.14, 8, 32).rotateX(Math.PI / 2).translate(VX, MOUTH - 0.05, VZ), collarMat, lid, 5);
  const collar2Mat = glow(BRAND.veille, 1.3, { opacity: 0 });
  const collar2 = bare(new THREE.TorusGeometry(SAFETY.r - 0.12, 0.13, 8, 32).rotateX(Math.PI / 2).translate(SX, SY + 0.2, SZ), collar2Mat, lid, 5);

  /* ══ THE WORKING VALVE'S WEIGHT: the hero — a knurled bob, standing on the hole by its own weight ══ */
  const weight = part("weight");
  const bob = new THREE.Group(); // it tilts about its foot
  bob.position.set(VX, W0, VZ);
  weight.add(bob);
  M.weight = steel(0.52, { rough: 0.5, metal: 0.4, env: 0.6 });
  {
    const shape = lathe([[0, 0.74], [0.62, 0.74], [0.62, 0], [1.55, 0], [VALVE.weight.r, 0.32], [VALVE.weight.r, 1.5], [1.6, 1.78], [1.1, 1.9], [1.1, 2.15], [1.5, 2.3], [1.5, 2.62], [1.22, VALVE.weight.h], [0, VALVE.weight.h]], 56, { bevel: 0.07, round: 2 });
    bob.add(addMesh(weight, shape, M.weight, { edgeOpacity: 0.75 }));
    const ridge = box(0.2, 1.0, 0.3, 0.06, 2).translate(VALVE.weight.r - 0.02, 0.91, 0);
    bob.add(addMesh(weight, mergeGeometries(Array.from({ length: 22 }, (_, i) => ridge.clone().rotateY((i / 22) * TAU))), M.weight, { edges: false }));
  }

  /* ══ THE SAFETY VALVE: a small plug on its seat ══ */
  const safety = part("safety");
  M.safety = steel(0.46, { rough: 0.45 });
  addMesh(safety, lathe([[0, SY - 0.2], [0.42, SY - 0.2], [0.42, SY + 0.14], [SAFETY.r, SY + 0.14], [SAFETY.r, SY + 0.62], [0.6, SY + SAFETY.h], [0, SY + SAFETY.h]], 36, { bevel: 0.08, round: 2 }).translate(SX, 0, SZ), M.safety, { edgeOpacity: 0.75 });
  addMesh(safety, box(1.1, 0.1, 0.22, 0.04, 1).translate(SX, SY + SAFETY.h + 0.02, SZ), steel(0.2), { edges: false });

  /* ══ THE LOCKING PIN: a piston through the lid, under the hole of the stop ══ */
  const pin = part("pin");
  M.pin = steel(0.5, { rough: 0.45, metal: 0.35 });
  addMesh(pin, lathe([[0, PY - 0.55], [PIN.r - 0.1, PY - 0.55], [PIN.r - 0.1, PY + 0.1], [PIN.r, PY + 0.1], [PIN.r, PY + 0.78], [0, PY + 0.78]], 28, { bevel: 0.07, round: 2 }).translate(PX, 0, PZ), M.pin, { edgeOpacity: 0.8 });
  const tipMat = glow(BRAND.veille, 0);
  bare(cyl(PIN.r - 0.12, 0.05, 0.01, 20).translate(PX, PY + 0.79, PZ), tipMat, pin, 4);
  const spark = makeBall(HOTSIG, SIGNAL); // where the pin holds the lid: small, steady — not a flash
  spark.position.set(PX, PY + 0.98, PZ);
  pin.add(spark);

  /* ══ INSIDE: the water and its lentils, the foam, the steam held prisoner ══ */
  const inside = new THREE.Group();
  root.add(inside);
  const WU = { uAmount: { value: 0 }, uLevel: { value: FLOOR }, uBoil: { value: 0 }, uTime: { value: 0 } };
  const water = lightMesh(lathe([[0, FLOOR], [RC, FLOOR], [RC, POT.h], [0, POT.h]], 64), waterMaterial(WU), 4);
  const surface = lightMesh(new THREE.RingGeometry(0.01, RC, 56, 10).rotateX(-Math.PI / 2), surfaceMaterial(WU), 4);
  const bubbles = lightMesh(sprites(40, 7), bubbleMaterial(WU), 4);
  const lentils = lightMesh(sprites(240, 3), lentilMaterial(WU), 3);
  const FU = { uFoam: { value: new THREE.Vector4() }, uTouch: { value: new THREE.Vector2() } };
  const foamMat = foamMaterial(FU);
  const foam = new THREE.Mesh(new THREE.LatheGeometry([[RC, 0], [RC, 0.34], [RC, 0.67], ...Array.from({ length: 22 }, (_, i) => [RC * (1 - i / 21), 1])].map(([r, y]) => new THREE.Vector2(r, y)), 72), foamMat);
  foam.frustumCulled = false;
  foam.renderOrder = 1;
  foam.receiveShadow = true;
  foam.visible = false;
  const VU = { uAmount: { value: 0 }, uLevel: { value: FLOOR }, uDense: { value: 0 }, uHot: { value: 0 }, uTime: { value: 0 } };
  const topAt = (r) => UNDER - 0.03 - Math.max(r - LID.flat, 0) * SLOPE;
  const vapour = lightMesh(lathe([[0, FLOOR], [RC + 0.1, FLOOR], [RC + 0.1, topAt(RC + 0.1)], [LID.flat, topAt(0)], [0, topAt(0)]], 72), vapourMaterial(VU), 5);
  const PU = { uAmount: { value: 0 }, uTime: { value: 0 } };
  const push = lightMesh(strokes(), pushMaterial(PU), 6);
  inside.add(water, surface, bubbles, lentils, foam, vapour, push);

  /* ══ OUTSIDE: the three ways out ══ */
  const jetOf = (count, seed, from, dir, shape) => {
    const U = { uFrom: { value: new THREE.Vector3(...from) }, uDir: { value: new THREE.Vector3(...dir).normalize() }, uShape: { value: new THREE.Vector4(...shape) }, uTime: { value: 0 }, uPlume: { value: 1 }, uSpeed: { value: 0.5 }, uAmount: { value: 0 } };
    const mesh = lightMesh(sprites(count, seed), steamMaterial(U), 8);
    root.add(mesh);
    return { mesh, U };
  };
  const jetValve = jetOf(64, 11, [VX, W0 + 0.5, VZ], [0, 1, 0], [14, 3.8, 2.1, 0]);
  const jetSafety = jetOf(40, 12, [SX, SY + 0.5, SZ], [-0.12, 1, 0.18], [10.5, 3.4, 0.8, 0]);
  const [LX, , LZ] = polar(WINDOW.at, LID.r + 0.4);
  const jetLeak = jetOf(48, 13, [LX, SEAL.y, LZ], [Math.cos(WINDOW.at * DEG), 0.22, Math.sin(WINDOW.at * DEG)], [11, 3.2, 0.4, 6.5]);
  const leakBall = makeBall(PALE, VEILLE);
  leakBall.position.set(LX, SEAL.y, LZ);
  root.add(leakBall);

  /* ══ anchors ══ */
  const A = {
    body: anchor(body, 0, POT.h / 2, 0),
    lid: anchor(lid, 0, LID.top, 0),
    seal: anchor(seal, ...polar(140, SEAL.r, SEAL.y)),
    valve: anchor(weight, VX, W0 + 1.0, VZ),
    hole: anchor(lid, VX, MOUTH, VZ),
    safety: anchor(safety, SX, SY + SAFETY.h, SZ),
    pin: anchor(pin, PX, PY + 0.8, PZ),
    stop: anchor(body, ...polar(STOP.at, (STOP.r0 + STOP.r1) / 2, STOP.y)),
    window: anchor(lid, WX, SEAL.y, WZ),
    handle: anchor(lid, ...polar(HANDLE.at, LID.r + HANDLE.len * 0.6, 15.6)),
    water: anchor(body, 0, FLOOR, 0),
    foam: anchor(body, 0, INSIDE.top, 0),
    inside: anchor(body, 0, INSIDE.top + 1, 0),
    top: anchor(weight, VX, W0 + VALVE.weight.h, VZ),
    jet: anchor(weight, VX, W0 + VALVE.weight.h + 2, VZ),
  };

  const lit = (mat, k) => {
    mat.emissive.copy(VEILLE);
    mat.emissiveIntensity = 0.2 * k;
  };
  const fade = (mat, a) => {
    mat.opacity = a;
  };

  return {
    root, A,
    parts: { body, seal, lid, weight, safety, pin },
    /**
     * bench    1 on the bench (nothing to add: the cooker stands on its base)
     * bar      the pressure, 0–2: the pin rises with it by itself (up from 0.05–0.25); it doses all that `seen` draws
     * seen     how much of it is drawn, signal: the steam held between the water and the lid, its push on the lid (needs `xray`)
     * xray     the vessel, the lid and the chimney's tube turn to glass
     * fill     the level: 0 empty · 0.5 the half · 0.8 too much · 1 the brim        mark  the half-way line, veille
     * boil     the surface heaves, bubbles climb, the lentils roll                   foam  0 none · 0.5 half-way up · 1 against the lid
     * clog     foam in the chimney's bore: the weight falls back, no jet whatever `whistle` says · clog2: the same for the safety valve
     * whistle  the weight lifts, dances, a veille jet leaves it      off  the weight held `VALVE.away` above its hole
     * safety   the safety plug lifts, its jet        leak  0 · 0.5 the seal bulges out by the window · 1 it leaks there, sideways
     * plume    how far along the three jets are drawn (1: whole, 16 cm · 0.3: their root)
     * twist    the lid's handle pushed toward « open »: free it turns 30°; with pressure it turns a hair and stops on the pin
     * explode  0 → 0.25 the lid turns · 0.2 → 1 everything lifts off in one column (no steam, nothing inside from 0.05)
     * lit…     the part named glows faintly veille
     */
    update(p = {}, time = 0) {
      const k = clamp01(p.explode ?? 0);
      const bar = Math.min(2, Math.max(0, p.bar ?? 0));
      const xr = clamp01(p.xray ?? 0);
      const whole = 1 - ramp(k, 0, 0.05);
      const up = smooth(ramp(bar, 0.05, 0.25)); // the pin: up as long as there is pressure left
      const clog = clamp01(p.clog ?? 0);
      const clog2 = clamp01(p.clog2 ?? 0);
      const off = clamp01(p.off ?? 0);
      const whistle = clamp01(p.whistle ?? 0) * (1 - clog) * whole;
      const lifted = clamp01(p.safety ?? 0) * whole;
      const open = lifted * (1 - clog2);
      const leak = clamp01(p.leak ?? 0);
      const twist = clamp01(p.twist ?? 0);
      const plume = clamp01(p.plume ?? 1);
      const fill = clamp01(p.fill ?? 0);
      const boil = clamp01(p.boil ?? 0);
      const fo = clamp01(p.foam ?? 0);

      /* ── the mechanics ── */
      const turned = smooth(ramp(k, 0, 0.25));
      const turn = -Math.max(turned * LID.turn, twist * lerp(LID.turn, HOLD, up)) * DEG; // toward +z: the lid's handle leaves the vessel's on the camera's side
      const rise = (a, b) => settle(ramp(k, a, b));
      lid.rotation.y = seal.rotation.y = safety.rotation.y = pin.rotation.y = turn;
      lid.position.y = rise(0.22, 0.9) * APART.lid;
      seal.position.y = rise(0.3, 0.92) * APART.seal;
      const riseW = rise(0.2, 0.95);
      const dance = whistle * (1 - off);
      weight.position.y = riseW * APART.weight + off * VALVE.away * (1 - riseW) + dance * VALVE.lift * (0.72 + 0.28 * Math.sin(time * 7.1));
      weight.rotation.y = turn;
      bob.rotation.set(dance * 0.07 * Math.sin(time * 4.3), dance * time * 1.1, dance * 0.07 * Math.cos(time * 5.2));
      safety.position.y = rise(0.28, 1) * APART.safety + lifted * SAFETY.lift;
      pin.position.y = rise(0.32, 1) * APART.pin + up * PIN.travel;

      /* ── steel or glass ── */
      setPartOpacity(wall, (1 - xr) * body.userData.part.opacity);
      setPartOpacity(dome, (1 - xr) * lid.userData.part.opacity);
      setPartOpacity(tube, (1 - xr) * lid.userData.part.opacity);
      see(bodyGhost, xr * body.userData.part.opacity, p.litBody ?? 0);
      see(lidGhost, xr * lid.userData.part.opacity, p.litLid ?? 0, clamp01(p.seen ?? 0) * whole * clamp01(0.3 + 0.45 * bar) * smooth(ramp(bar, 0, 0.12)));
      see(tubeGhost, xr * lid.userData.part.opacity, p.litValve ?? 0);

      /* ── named ── */
      lit(M.wall, p.litBody ?? 0);
      lit(M.ears, p.litBody ?? 0);
      lit(M.dome, p.litLid ?? 0);
      lit(M.lugs, (p.litLid ?? 0) * 1.6);
      lit(M.seal, p.litSeal ?? 0);
      lit(M.weight, p.litValve ?? 0);
      lit(M.tube, p.litValve ?? 0);
      lit(M.safety, p.litSafety ?? 0);
      lit(M.pin, p.litPin ?? 0);
      lit(M.stop, (p.litPin ?? 0) * 0.5);
      fade(holeRing.material, clamp01(p.litPin ?? 0));
      holeRing.visible = (p.litPin ?? 0) > 0.004;
      setGlow(tipMat, 0.5 * up * whole + 1.4 * clamp01(p.litPin ?? 0));
      shine(spark, twist * up * whole * (0.62 + 0.1 * Math.sin(time * 2.6)), 0.8, 5);
      const mark = clamp01(p.mark ?? 0) * whole;
      fade(markMat, mark);
      markBand.visible = mark > 0.004;

      /* ── the seal at the window ── */
      SU.uBulge.value.set(1.15 * smooth(ramp(leak, 0, 0.5)), 0.26 * smooth(ramp(leak, 0.5, 1)));

      /* ── inside ── */
      const amount = xr * whole;
      const level = FLOOR + fill * (INSIDE.top - FLOOR);
      const wet = amount * smooth(ramp(fill, 0, 0.04));
      inside.visible = amount > 0.004;
      water.visible = surface.visible = lentils.visible = wet > 0.004;
      bubbles.visible = wet * boil > 0.004;
      WU.uAmount.value = wet;
      WU.uLevel.value = level;
      WU.uBoil.value = boil;
      WU.uTime.value = time;
      surface.position.y = level;
      const flat = level + fo * (UNDER + 0.35 - level);
      const hump = 0.7 * Math.sin(Math.PI * fo);
      const foamTop = Math.min(flat + hump, UNDER - 0.07);
      foam.visible = wet * fo > 0.004;
      foamMat.opacity = wet;
      FU.uFoam.value.set(level, flat, hump, time);
      FU.uTouch.value.set(Math.max(clog, 0.4 * smooth(ramp(fo, 0.9, 1))), Math.max(clog2, 0.4 * smooth(ramp(fo, 0.86, 0.97))));
      const seen = clamp01(p.seen ?? 0) * amount * smooth(ramp(bar, 0, 0.12));
      vapour.visible = push.visible = seen > 0.004;
      VU.uAmount.value = seen;
      VU.uLevel.value = Math.min(fo > 0.002 ? flat : level, UNDER);
      VU.uDense.value = 0.2 + 0.56 * bar;
      VU.uHot.value = 0.2 + 0.56 * bar;
      VU.uTime.value = time;
      PU.uAmount.value = seen * (0.45 + 0.4 * bar);
      PU.uTime.value = time * (0.7 + 0.3 * bar);
      A.water.position.y = level;
      A.foam.position.y = fo > 0.002 ? foamTop : level;
      A.inside.position.y = (Math.min(flat, UNDER - 1) + UNDER) / 2;

      /* ── in the bore: what passes, what blocks ── */
      fade(passMat, 0.7 * whistle * xr);
      pass.visible = whistle * xr > 0.004;
      plug.visible = clog * whole > 0.004;
      plug.scale.set(0.27, 0.01 + clog * (MOUTH - NOZZLE + 0.2), 0.27);
      plugBall.position.set(VX, NOZZLE - 0.2 + clog * (MOUTH - NOZZLE), VZ);
      shine(plugBall, clog * whole * (1 - 0.5 * clog) * 1.2 + clog * whole * 0.35, 1.0, 4);
      plug2.visible = clog2 * whole > 0.004;
      plug2.scale.set(0.34, 0.01 + clog2 * 0.6, 0.34);
      shine(plugBall2, clog2 * whole * 0.6, 0.9, 4);

      /* ── outside: the three ways out ── */
      const breath = 0.9 + 0.1 * Math.sin(time * 1.7);
      const jet = (j, a) => {
        j.mesh.visible = a > 0.004;
        j.U.uAmount.value = a * breath;
        j.U.uTime.value = time;
        j.U.uPlume.value = plume;
      };
      jet(jetValve, whistle * (1 - off));
      jetValve.U.uFrom.value.y = W0 + 0.5 + weight.position.y;
      fade(collarMat, whistle * (1 - off));
      collar.visible = whistle * (1 - off) > 0.004;
      jet(jetSafety, open);
      fade(collar2Mat, open);
      collar2.visible = open > 0.004;
      const out = smooth(ramp(leak, 0.55, 1)) * whole * (0.45 + 0.55 * clamp01(bar));
      jet(jetLeak, out);
      shine(leakBall, out * 0.7, 1.5, 4);
    },
  };
}
