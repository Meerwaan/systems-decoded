// DOSSIER 050 — Plaque à induction : THE SAUCEPAN, the heart of the system. Its own frame: origin = the centre of the
// underside of its base, y up (world.js stands it on the hero zone, and lifts it). Solid brushed stainless, a capsule base
// (three layers: a magnetic steel plate under, an aluminium core, a steel cover), a long handle toward front-right
// (PAN.handle.dir) on its riveted bracket. Inside: the water, which boils (domes that swell and burst, big bubbles that
// climb from the floor), the steam above. In the base, what the film is about: the induced currents (rings in the
// magnetic plate whose bright heads run round, veille) and the heat they make (signal, a warm TINT in the base's
// thickness — NEVER incandescent: a pan does not glow like a toaster's wire), rising into the water in a few threads.
// `xray` turns the wall to glass so the water and the bubbles show; `cut` halves it like the hob (the +z half fades away,
// the section faces appear: the wall, the three layers of the base, the water).
//
//   buildCasserole() → { root, A, update(p, time, px) }
//   p = { boil, steam, xray, eddy, panHeat, litPan, cut }
//   A: base (centre of the base, inside its thickness), water (the water's surface), handle (where a hand closes on it), rim
//
// Every round piece is turned in two halves (back: z < 0, front: z > 0) with their own materials, so `cut` only has to
// fade the front one; the light things (water, bubbles, steam, threads, rings) drop their z > 0 half in their shaders.
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { solid, glass, asShell, edgesOf, fatLine, lathe, chamfer, plate, cyl, anchor, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { PAN, EDDY } from "./plan.js";

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const WARM = SIGNAL.clone().lerp(INK, 0.35); // the heat seen in water: a tint, not a flame
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const f = (x) => x.toFixed(3);
const glsl3 = (c) => `vec3(${f(c.r)}, ${f(c.g)}, ${f(c.b)})`;

/* ─────────────────────────────────────────────────────────── the shape */
const { r: R, top: TOP, h: H, wall: WALL, base: BASE, water: WATER } = PAN;
const C = 1.2; //                       the round between the bottom and the wall
const FLOOR = BASE + WALL; //            the inside floor
const RIM_Y = H - 0.35; //               where the rolled rim starts
const innerR = (y) => (y <= BASE + C ? R - WALL : R - WALL + ((TOP - R) * (y - BASE - C)) / (RIM_Y - BASE - C));
const RW = innerR(WATER) - 0.04; //      the water's radius at its surface
// the body (one sheet: bottom, wall, rolled rim), [r, y], outside then inside
const BODY = [
  [0, BASE], [R - C, BASE], [R - C * 0.3, BASE + C * 0.3], [R, BASE + C], [TOP, RIM_Y],
  [TOP + 0.16, H - 0.16], [TOP + 0.06, H], [TOP - WALL - 0.06, H],
  [TOP - WALL, RIM_Y], [R - WALL, BASE + C], [R - C * 0.3 - WALL * 0.7, FLOOR + C * 0.3 - WALL * 0.3], [R - C, FLOOR], [0, FLOOR],
];
// the capsule base under it: a disc 5 mm thick, its edge rounded, slightly wider than the flat of the bottom
const RCAP = R - 0.85;
const CAPS = [[0, 0], [RCAP - 0.22, 0], [RCAP, 0.2], [RCAP - 0.08, BASE], [0, BASE]];
// its three layers, bottom up (the section shows them): the magnetic plate, the aluminium core, the steel cover
// (each ≥ 2 mm so the section reads them: the steel layer goes on up through the body's bottom sheet, to the floor)
const LAYERS = [
  { y0: 0, y1: 0.2, color: 0x2e3338, heat: 1 }, //   ferritic steel — the currents run here
  { y0: 0.2, y1: 0.4, color: 0xeef0f2, heat: 0.3 }, // aluminium: spreads the heat
  { y0: 0.4, y1: BASE, color: 0x5a524b, heat: 0.25 }, // the steel the pan is made of (warmer grey: apart from the wall)
];
const EDDY_Y = 0.08; //                  the rings, in the magnetic plate

/* ─────────────────────────────────────────────────────────── geometry */

/** A profile turned around y over half a turn: `side` −1 the back half (z < 0), +1 the front (z > 0). */
function half(profile, side, segments = 56) {
  const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments, side < 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI);
  return toCreasedNormals(geo, 40 * DEG);
}
/** The section of a turned profile on the plane z = 0, both sides of the axis: a closed polygon (x, y). */
function sectionOf(profile) {
  const right = profile.map(([r, y]) => new THREE.Vector2(r, y));
  const left = profile.map(([r, y]) => new THREE.Vector2(-r, y)).reverse();
  return new THREE.ShapeGeometry(new THREE.Shape([...right, ...left]));
}

/** `count` squares that always face the eye: the shader stands each where its seed (four numbers, 0–1) says. */
function sprites(count, seed) {
  const rand = rng(seed);
  const corner = [];
  const seeds = [];
  const index = [];
  for (let i = 0; i < count; i++) {
    const s = [(i + rand()) / count, rand(), rand(), rand()];
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

/* ─────────────────────────────────────────────────────────── light that has a place */

const lightMaterial = (uniforms, vertexShader, fragmentShader, o = {}) =>
  new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms, vertexShader, fragmentShader, ...o });
const lightMesh = (geometry, material, order = 4) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  mesh.visible = false;
  return mesh;
};
const NOISE2 = /* glsl */ `
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise2(vec2 p) {
    vec2 i = floor(p); vec2 q = fract(p);
    q = q * q * (3.0 - 2.0 * q);
    return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), q.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), q.x), q.y);
  }`;
// the boiling surface: domes that swell where a big bubble comes up, then burst in a ring (cells re-seeded each cycle)
const BOIL = /* glsl */ `
  float hash1(float n) { return fract(sin(n * 127.1 + 0.37) * 43758.5453); }
  float boilH(vec2 p, out float ring) {
    float s = 0.0; ring = 0.0;
    for (int i = 0; i < 9; i++) {
      float fi = float(i);
      float t = uTime * (0.8 + 0.35 * hash1(fi + 3.1)) + hash1(fi + 7.7);
      float k = floor(t); float u = fract(t);
      float rr = ${f(RW - 1.6)} * sqrt(hash1(k * 1.37 + fi * 9.1));
      float aa = 6.28319 * hash1(k * 2.11 + fi * 4.3);
      vec2 d = p - vec2(rr * cos(aa), rr * sin(aa));
      float w = 1.1 + 1.0 * hash1(fi * 5.9 + 1.0);
      float q = dot(d, d);
      s += smoothstep(0.0, 0.62, u) * (1.0 - smoothstep(0.62, 0.7, u)) * exp(-q / (w * w));
      float pr = clamp((u - 0.62) / 0.3, 0.0, 1.0);
      float x = (sqrt(q) - w * (0.5 + 1.5 * pr)) / 0.22;
      ring += step(0.62, u) * (1.0 - smoothstep(0.7, 0.95, u)) * exp(-x * x);
    }
    s += 0.28 * sin(p.x * 0.9 + uTime * 2.1) * sin(p.y * 0.8 - uTime * 1.7);
    return s;
  }`;
const AMP = 0.42; // how high a dome swells at full boil (cm)

/** The water: a faint volume of ink light under its surface (seen through the glass wall, or in section). */
const waterMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    varying vec3 vN; varying vec3 vE; varying vec3 vP;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vN = normalize(normalMatrix * normal); vE = normalize(-mv.xyz); vP = position;
      gl_Position = projectionMatrix * mv;
    }`,
    /* glsl */ `
    uniform float uAmount, uCut; varying vec3 vN; varying vec3 vE; varying vec3 vP;
    void main() {
      if (uCut > 0.0 && vP.z > 0.0) discard;
      float facing = clamp(abs(dot(normalize(vN), normalize(vE))), 0.0, 1.0);
      float body = 0.3 + 0.7 * facing;
      float skin = exp(-max(${f(WATER)} - vP.y, 0.0) / 0.6);
      gl_FragColor = vec4(${glsl3(INK)} * vec3(0.82, 0.94, 1.0) * ((0.12 * body + 0.2 * skin) * uAmount), 1.0);
    }`,
    { side: THREE.BackSide },
  );
/** Its surface, lit: the domes catch the key light, the bursts leave bright rings. */
const surfaceMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    uniform float uTime, uBoil; varying vec3 vP; varying vec3 vW;
    ${BOIL}
    void main() {
      vec2 p = position.xz;
      float ring;
      float edge = 1.0 - smoothstep(${f(RW - 2.2)}, ${f(RW)}, length(p));
      vec3 q = vec3(position.x, position.y + ${f(AMP)} * uBoil * edge * boilH(p, ring), position.z);
      vP = q;
      vec4 w = modelMatrix * vec4(q, 1.0);
      vW = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
    /* glsl */ `
    uniform float uTime, uBoil, uAmount, uCut; varying vec3 vP; varying vec3 vW;
    ${BOIL}
    void main() {
      if (uCut > 0.0 && vP.z > 0.0) discard;
      vec2 p = vP.xz;
      float ring, r2;
      float edge = 1.0 - smoothstep(${f(RW - 2.2)}, ${f(RW)}, length(p));
      float k = ${f(AMP)} * uBoil * edge;
      float e = 0.18;
      float hx = (boilH(p + vec2(e, 0.0), r2) - boilH(p - vec2(e, 0.0), r2)) * k / (2.0 * e);
      float hz = (boilH(p + vec2(0.0, e), r2) - boilH(p - vec2(0.0, e), r2)) * k / (2.0 * e);
      boilH(p, ring);
      vec3 n = normalize(vec3(-hx, 1.0, -hz));
      vec3 v = normalize(cameraPosition - vW);
      vec3 l = normalize(vec3(-0.55, 0.75, 0.45));
      vec3 rf = reflect(-v, n);
      float lr = clamp(dot(rf, l), 0.0, 1.0);
      float spec = pow(lr, 48.0) * 1.6 + pow(lr, 6.0) * 0.22;
      float fres = pow(clamp(1.0 - dot(n, v), 0.0, 1.0), 3.0) * 0.22;
      float lit = 0.035 + spec + fres + 0.55 * ring * uBoil * edge + 0.25 * clamp(length(vec2(hx, hz)), 0.0, 1.0) * uBoil;
      // water darkens what is under it (a dark mirror), its domes and bursts catch the light
      float a = (0.58 + 0.3 * fres) * uAmount;
      gl_FragColor = vec4(${glsl3(INK)} * vec3(0.86, 0.95, 1.0) * lit * uAmount / max(a, 0.05), a);
    }`,
    { side: THREE.DoubleSide, blending: THREE.NormalBlending },
  );
/** Big bubbles: each leaves the floor, swells as it climbs, and bursts at the surface. Fewer as `boil` drops. */
const bubbleMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    attribute vec2 aCorner; attribute vec4 aSeed; uniform float uTime, uBoil, uCut; varying vec2 vUv; varying float vLive;
    void main() {
      float u = fract(aSeed.x + uTime * (0.55 + 0.4 * aSeed.y));
      float a = aSeed.z * 6.28319;
      float r = ${f(R - 2.0)} * sqrt(aSeed.w);
      vec3 c = vec3(r * cos(a) + 0.3 * sin(u * 17.0 + aSeed.w * 40.0), mix(${f(FLOOR + 0.25)}, ${f(WATER - 0.2)}, u * u * (1.6 - 0.6 * u)), r * sin(a));
      vLive = smoothstep(0.0, 0.08, u) * (1.0 - smoothstep(0.88, 1.0, u)) * smoothstep(aSeed.y - 0.15, aSeed.y, uBoil * 1.1);
      if (uCut > 0.0 && c.z > 0.0) vLive = 0.0;
      vec4 mv = modelViewMatrix * vec4(c, 1.0);
      mv.xy += aCorner * (0.2 + 0.32 * aSeed.y) * (0.55 + 0.8 * u);
      vUv = aCorner;
      gl_Position = projectionMatrix * mv;
    }`,
    /* glsl */ `
    uniform float uAmount; varying vec2 vUv; varying float vLive;
    void main() {
      float r = length(vUv);
      float rim = smoothstep(0.5, 0.82, r) * (1.0 - smoothstep(0.82, 1.0, r));
      float glint = exp(-dot(vUv - vec2(-0.35, 0.35), vUv - vec2(-0.35, 0.35)) * 30.0);
      gl_FragColor = vec4(${glsl3(INK)} * ((0.75 * rim + 0.08 + 0.9 * glint) * (1.0 - step(1.0, r)) * vLive * uAmount), 1.0);
    }`,
  );
/** The heat rising in the water: a few warm threads from the floor — a tint, slow, never a flame. */
const threadMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    attribute vec2 aCorner; attribute vec4 aSeed; uniform float uTime, uCut; varying vec2 vUv; varying float vLive;
    void main() {
      float u = fract(aSeed.x + uTime * (0.12 + 0.08 * aSeed.y));
      float a = aSeed.z * 6.28319;
      float r = ${f(R - 2.4)} * sqrt(aSeed.w);
      vec3 c = vec3(r * cos(a) + 0.6 * sin(u * 5.0 + aSeed.y * 9.0), mix(${f(FLOOR + 0.6)}, ${f(WATER - 0.6)}, u), r * sin(a));
      vLive = smoothstep(0.0, 0.18, u) * (1.0 - smoothstep(0.55, 1.0, u)) * (1.0 - 0.5 * u);
      if (uCut > 0.0 && c.z > 0.0) vLive = 0.0;
      vec4 mv = modelViewMatrix * vec4(c, 1.0);
      mv.xy += aCorner * vec2(1.0, 2.4);
      vUv = aCorner;
      gl_Position = projectionMatrix * mv;
    }`,
    /* glsl */ `
    uniform float uAmount; varying vec2 vUv; varying float vLive;
    void main() {
      float g = exp(-vUv.x * vUv.x * 3.0) * exp(-vUv.y * vUv.y * 2.2) * (1.0 - step(1.0, abs(vUv.x)));
      gl_FragColor = vec4(${glsl3(WARM)} * (g * vLive * uAmount), 1.0);
    }`,
  );
/** The steam: puffs that leave the whole water surface, rise, widen, drift, and are gone well below the header. */
const steamMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    attribute vec2 aCorner; attribute vec4 aSeed; uniform float uTime;
    varying vec2 vUv; varying float vAmount; varying vec2 vSeed;
    void main() {
      float u = fract(aSeed.x + uTime * 0.17 * (0.8 + 0.4 * aSeed.w));
      float s = (1.0 - exp(-2.0 * u)) / 0.8647;
      float a = aSeed.y * 6.28319;
      float r0 = ${f(RW - 1.5)} * sqrt(aSeed.z);
      vec3 c = vec3(r0 * cos(a), ${f(WATER + 0.4)} + 27.0 * s, r0 * sin(a));
      c.xz *= 1.0 + 0.55 * s;
      c.x += 3.5 * s * s * sin(uTime * 0.45 + aSeed.w * 6.28319) - 2.0 * s * s;
      c.z += 2.5 * s * s * cos(uTime * 0.37 + aSeed.y * 6.28319);
      vec4 mv = modelViewMatrix * vec4(c, 1.0);
      float size = mix(1.6, 6.5, sqrt(s)) * (0.75 + 0.5 * aSeed.w);
      vAmount = smoothstep(0.02, 0.3, s) * (1.0 - smoothstep(0.35, 1.0, s)) * mix(0.75, 0.2, sqrt(s)) * smoothstep(16.0, 36.0, -mv.z);
      mv.xy += aCorner * size;
      vUv = aCorner;
      vSeed = aSeed.yz * 17.0;
      gl_Position = projectionMatrix * mv;
    }`,
    /* glsl */ `
    uniform float uAmount, uTime; varying vec2 vUv; varying float vAmount; varying vec2 vSeed;
    ${NOISE2}
    void main() {
      float r = length(vUv);
      float fall = exp(-r * r * 2.6) * (1.0 - smoothstep(0.6, 1.0, r));
      float n = 0.6 * noise2(vUv * 1.8 + vSeed + vec2(0.0, -uTime * 0.25)) + 0.4 * noise2(vUv * 3.9 - vSeed);
      gl_FragColor = vec4(${glsl3(INK)} * (fall * (0.25 + 1.2 * n * n) * vAmount * uAmount), 1.0);
    }`,
  );
/** The induced currents: rings in the magnetic plate, a faint body and bright heads that run round (veille). Seen through
 *  the steel (no depth test): it is the X-ray of the base. Two trains of heads: the fast one takes over as `eddy` rises. */
const eddyMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    varying vec3 vP;
    void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    /* glsl */ `
    uniform float uTime, uAmount, uCut; varying vec3 vP;
    void main() {
      if (uCut > 0.0 && vP.z > 0.02) discard;
      float a = atan(vP.z, vP.x) / 6.28319;
      float slow = pow(fract(a * 3.0 + uTime * 0.2), 5.0);
      float fast = pow(fract(a * 4.0 + uTime * 0.42 + 0.3), 5.0);
      float k = mix(slow, fast, smoothstep(0.4, 1.0, uAmount));
      float lit = (0.32 + 1.5 * k) * smoothstep(0.0, 0.25, uAmount) * (0.55 + 0.45 * uAmount);
      gl_FragColor = vec4(${glsl3(VEILLE)} * lit, 1.0);
    }`,
    { depthTest: false },
  );
/** The water in section: a faint sheet under the (moving) surface line, a bright line on it. */
const waterCapMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    varying vec3 vP;
    void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    /* glsl */ `
    uniform float uTime, uBoil, uAmount; varying vec3 vP;
    ${BOIL}
    void main() {
      float ring;
      float edge = 1.0 - smoothstep(${f(RW - 2.2)}, ${f(RW)}, abs(vP.x));
      float top = ${f(WATER)} + ${f(AMP)} * uBoil * edge * boilH(vec2(vP.x, 0.0), ring);
      float below = top - vP.y;
      if (below < 0.0) discard;
      float line = exp(-below / 0.08);
      float deep = clamp(below / 8.0, 0.0, 1.0);
      gl_FragColor = vec4(${glsl3(INK)} * vec3(0.82, 0.94, 1.0) * ((0.1 * (1.0 - 0.4 * deep) + 0.55 * line) * uAmount), 1.0);
    }`,
  );

/* ─────────────────────────────────────────────────────────── the saucepan */

export function buildCasserole() {
  const root = new THREE.Group();
  root.name = "casserole";
  const fade = (mat) => Object.assign(mat, { transparent: true });

  // ── the body: brushed stainless, two halves (the front one fades on `cut`); the outline of the whole, and of the back
  // (no machining grain on the wall: at 270 px its rings read as scan lines)
  const steelB = solid(0xcdd2d7, { rough: 0.36, metal: 0.36 });
  const steelF = fade(solid(0xcdd2d7, { rough: 0.36, metal: 0.36 }));
  steelB.userData.finish = steelF.userData.finish = false;
  // in section the inside of the back half steps back into the shade: the base and the water lead
  const STEEL = steelB.color.clone();
  const SHADE = new THREE.Color(0x111417);
  const body = chamfer(BODY, 0.05, 2);
  const bodyB = new THREE.Mesh(half(body, -1, 64), steelB);
  const bodyF = new THREE.Mesh(half(body, 1, 64), steelF);
  bodyB.castShadow = bodyF.castShadow = true;
  const bodyWhole = lathe(BODY, 128, { bevel: 0.05, round: 2 });
  const edgesWhole = edgesOf(bodyWhole, { opacity: 0.5, width: 1.8 });
  const edgesBack = edgesOf(half(BODY, -1, 64), { opacity: 0, width: 1.8 });
  // the X-ray of the wall: the same body in glass
  const shell = new THREE.Mesh(bodyWhole, glass(BRAND.ink, { base: 0, rim: 0.22, edge: 0.5, spec: 0.35, through: 0.3 }));
  asShell(shell, 20);
  shell.visible = false;

  // ── the capsule base: the outside is the steel cover (the heat tints it, `litPan` lights it veille)
  const capB = solid(0x8d939a, { rough: 0.42, metal: 0.45 });
  const capF = fade(solid(0x8d939a, { rough: 0.42, metal: 0.45 }));
  const caps = chamfer(CAPS, 0.03, 2);
  const capsB = new THREE.Mesh(half(caps, -1, 64), capB);
  const capsF = new THREE.Mesh(half(caps, 1, 64), capF);
  const capsWhole = lathe(CAPS, 128, { bevel: 0.03, round: 2 });
  const capEdges = edgesOf(capsWhole, { opacity: 0.5, width: 1.8 });
  // machining rings on the underside (seen from below: « le cœur »)
  const turned = new THREE.Group();
  for (const [rr, op] of [[2.6, 0.32], [5.4, 0.26], [8.1, 0.3]]) {
    const pts = [];
    for (let i = 0; i <= 96; i++) pts.push([rr * Math.cos((i / 96) * TAU), -0.012, rr * Math.sin((i / 96) * TAU)]);
    const line = fatLine(pts, { color: BRAND.ink, width: 1.8, opacity: op });
    line.userData.base = op;
    turned.add(line);
  }

  // ── the section faces (z = 0, facing +z): the wall, the three layers of the base, the water
  const section = new THREE.Group();
  section.visible = false;
  const wallCap = new THREE.Mesh(sectionOf(body), solid(0xc4c9ce, { rough: 0.5, metal: 0.3 }));
  const layerMats = LAYERS.map((L) => solid(L.color, { rough: 0.55, metal: 0.3 }));
  LAYERS.forEach((L, i) => {
    const r0 = RCAP - 0.22 + (0.22 * (L.y0 + L.y1)) / 2 / BASE;
    const g = new THREE.ShapeGeometry(new THREE.Shape([[-r0, L.y0], [r0, L.y0], [r0, L.y1], [-r0, L.y1]].map(([x, y]) => new THREE.Vector2(x, y))));
    section.add(new THREE.Mesh(g, layerMats[i]));
  });
  // the steel layer carried on through the body's bottom sheet (in front of the wall's section face)
  const sheet = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape([[-(R - C), BASE], [R - C, BASE], [R - C, FLOOR], [-(R - C), FLOOR]].map(([x, y]) => new THREE.Vector2(x, y)))).translate(0, 0, 0.004),
    layerMats[2],
  );
  section.add(sheet);
  // the clear lines between the layers, and the section's outline
  const seams = new THREE.Group();
  for (const y of [LAYERS[0].y1, LAYERS[1].y1]) {
    seams.add(fatLine([[-RCAP + 0.1, y, 0.01], [RCAP - 0.1, y, 0.01]], { color: BRAND.ink, width: 2, opacity: 0.85 }));
  }
  section.add(wallCap, seams);

  // ── the handle: a long tapered bar on a riveted bracket, rising a little toward front-right
  const handleMat = fade(solid(0x8a9097, { rough: 0.38, metal: 0.5 }));
  const [dx, , dz] = PAN.handle.dir;
  const handle = new THREE.Group();
  const wallAt = innerR(PAN.handle.y) + WALL;
  handle.position.set(dx * wallAt, PAN.handle.y, dz * wallAt);
  handle.rotation.y = -Math.atan2(dz, dx);
  const bar = new THREE.Group();
  bar.rotation.z = 9 * DEG;
  const L = PAN.handle.len;
  const outline = new THREE.Shape([[1.6, -1.0], [L - 2.2, -1.45], [L - 0.6, -1.25], [L, 0], [L - 0.6, 1.25], [L - 2.2, 1.45], [1.6, 1.0]].map(([x, y]) => new THREE.Vector2(x, y)));
  const hole = new THREE.Path();
  hole.absellipse(L - 2.1, 0, 0.75, 0.42, 0, TAU, false);
  outline.holes.push(hole);
  const barGeo = plate(outline, 0.75, { bevel: 0.2 }).rotateX(Math.PI / 2).translate(0, 0.375, 0);
  const barMesh = new THREE.Mesh(barGeo, handleMat);
  barMesh.castShadow = true;
  const neckGeo = new THREE.CylinderGeometry(0.62, 0.9, 2.2, 24).rotateZ(Math.PI / 2).translate(0.9, 0, 0).toNonIndexed();
  const bracketGeo = plate(new THREE.Shape([[-1.6, -1.5], [1.6, -1.5], [1.9, 0.4], [0, 1.7], [-1.9, 0.4]].map(([x, y]) => new THREE.Vector2(x, y))), 0.3, { bevel: 0.1 })
    .rotateY(Math.PI / 2).translate(-0.05, 0, 0);
  const handleMetal = new THREE.Mesh(mergeGeometries([neckGeo, bracketGeo]), handleMat);
  // two rivet heads, inside the wall
  const rivets = new THREE.Mesh(
    mergeGeometries([0.75, -0.85].map((y) => cyl(0.32, 0.16, 0.06, 20).rotateZ(Math.PI / 2).translate(-WALL - 0.42, y, 0))),
    handleMat,
  );
  bar.add(barMesh, edgesOf(barGeo, { opacity: 0.45, width: 1.8 }));
  handle.add(bar, handleMetal, rivets, edgesOf(bracketGeo, { opacity: 0.4, width: 1.8 }));
  const handleEdges = [bar.children[1], handle.children[3]];

  // ── what is inside, and above: light
  const U = {
    uTime: { value: 0 }, uBoil: { value: 0 }, uCut: { value: 0 }, uAmount: { value: 1 },
  };
  const own = (extra) => ({ uTime: U.uTime, uBoil: U.uBoil, uCut: U.uCut, uAmount: { value: 0 }, ...extra });
  const WU = own();
  const water = lightMesh(lathe([[0, FLOOR], [R - C, FLOOR], [innerR(BASE + C) - 0.04, BASE + C], [RW, WATER], [0, WATER]], 72), waterMaterial(WU), 4);
  const SU = own();
  const surface = lightMesh(new THREE.RingGeometry(0.01, RW, 96, 30).rotateX(-Math.PI / 2).translate(0, WATER, 0), surfaceMaterial(SU), 5);
  const BU = own();
  const bubbles = lightMesh(sprites(64, 50), bubbleMaterial(BU), 6);
  const TU = own();
  const threads = lightMesh(sprites(14, 51), threadMaterial(TU), 5);
  const VU = own();
  const steam = lightMesh(sprites(84, 52), steamMaterial(VU), 8);
  const EU = own();
  const eddyGeo = mergeGeometries(
    Array.from({ length: EDDY.rings }, (_, i) => new THREE.TorusGeometry(1.7 + (i * (RCAP - 1.2 - 1.7)) / (EDDY.rings - 1), 0.07, 8, 160).rotateX(-Math.PI / 2).translate(0, EDDY_Y, 0)),
  );
  const eddy = lightMesh(eddyGeo, eddyMaterial(EU), 9);
  const CU = own();
  const waterCap = lightMesh(new THREE.PlaneGeometry(2 * RW, WATER + 1 - FLOOR).translate(0, (WATER + 1 + FLOOR) / 2, 0.005), waterCapMaterial(CU), 5);

  root.add(bodyB, bodyF, edgesWhole, edgesBack, shell, capsB, capsF, capEdges, turned, section, handle, water, surface, bubbles, threads, steam, eddy, waterCap);

  const A = {
    base: anchor(root, 0, BASE / 2, 0),
    water: anchor(root, 0, WATER, 0),
    handle: anchor(bar, L * 0.72, 0.4, 0),
    rim: anchor(root, 0, H, 0),
  };

  const heatTint = new THREE.Color();
  return {
    root, A,
    /**
     * boil     the water boils: domes that swell and burst, big bubbles climbing (0–1); 0 still — « les bulles retombent »
     * steam    the steam above the water (0–1)
     * xray     the wall turns to glass (0–1): the water, the bubbles, the threads of heat show; the base stays solid
     * eddy     the induced currents in the base, veille: rings whose bright heads run round, faster as it rises (0–1)
     * panHeat  the heat in the base, signal — a warm tint in its thickness, threads rising in the water (0–1), never a fire
     * litPan   the base glows faintly veille as the voice names it (« le cœur ») (0–1)
     * cut      0 whole → 1 halved like the hob (the +z half fades away): the wall, the base's three layers, the water in section
     */
    update({ boil = 0, steam: s = 0, xray = 0, eddy: e = 0, panHeat = 0, litPan = 0, cut = 0 } = {}, time = 0) {
      U.uTime.value = time;
      U.uBoil.value = boil;
      U.uCut.value = cut;
      const front = 1 - smooth(0, 0.85, cut);
      // the wall: solid → glass (xray); its front half away (cut)
      const wallA = 1 - xray;
      steelB.color.lerpColors(STEEL, SHADE, 0.95 * cut);
      steelB.envMapIntensity = 1 - 0.9 * cut; // its reflections were the white veil
      steelB.roughness = 0.36 + 0.4 * cut;
      // in section the back wall above the water still read as a white veil, whatever its shade: it thins to a dark ghost
      const backA = wallA * (1 - 0.75 * smooth(0, 1, cut));
      steelB.opacity = backA;
      steelB.transparent = backA < 0.999;
      steelB.depthWrite = backA > 0.5;
      bodyB.visible = wallA > 0.003;
      steelF.opacity = wallA * front;
      steelF.transparent = steelF.opacity < 0.999;
      steelF.depthWrite = wallA * front > 0.5;
      bodyF.visible = wallA * front > 0.003;
      shell.visible = xray * front > 0.003;
      shell.material.uniforms.uAmount.value = xray * front;
      edgesWhole.material.opacity = 0.5 * front;
      edgesWhole.visible = front > 0.003;
      edgesBack.material.opacity = 0.5 * (1 - front);
      edgesBack.visible = front < 0.997;
      // the base: its front half too; the heat and the veille light in its steel
      capF.opacity = front;
      capF.transparent = front < 0.999;
      capF.depthWrite = front > 0.5;
      capsF.visible = front > 0.003;
      capEdges.material.opacity = 0.5 * front;
      capEdges.visible = front > 0.003;
      const hk = (0.26 + 0.24 * cut) * panHeat; // ≈ 0.5 in section: « elle naît dans le fond »
      const lk = 0.12 * litPan;
      heatTint.setRGB(SIGNAL.r * hk + VEILLE.r * lk, SIGNAL.g * hk + VEILLE.g * lk, SIGNAL.b * hk + VEILLE.b * lk);
      capB.emissive.copy(heatTint);
      capF.emissive.copy(heatTint);
      for (const line of turned.children) line.material.opacity = line.userData.base * (1 - cut);
      // the section faces: the layers warm by their own share (the magnetic plate first)
      section.visible = cut > 0.003;
      for (let i = 0; i < LAYERS.length; i++) {
        const h = (0.2 + 0.3 * cut) * panHeat * LAYERS[i].heat;
        const l = i === 0 ? 0.14 * litPan : 0.05 * litPan;
        layerMats[i].emissive.setRGB(SIGNAL.r * h + VEILLE.r * l, SIGNAL.g * h + VEILLE.g * l, SIGNAL.b * h + VEILLE.b * l);
      }
      // the handle goes with the front half
      handleMat.opacity = front;
      handleMat.transparent = front < 0.999;
      handleMat.depthWrite = front > 0.5;
      handle.visible = front > 0.003;
      for (const edge of handleEdges) edge.material.opacity = 0.45 * front;

      // the light: water (seen through the glass, from above, or in section), the boiling, the heat, the steam, the currents
      WU.uAmount.value = Math.max(xray, 0.35 * cut);
      water.visible = WU.uAmount.value > 0.003;
      SU.uAmount.value = 1;
      surface.visible = true;
      BU.uAmount.value = boil;
      bubbles.visible = boil > 0.003;
      TU.uAmount.value = 0.13 * panHeat;
      threads.visible = panHeat > 0.003;
      VU.uAmount.value = 0.6 * s;
      steam.visible = s > 0.003;
      EU.uAmount.value = e;
      eddy.visible = e > 0.003;
      CU.uAmount.value = cut;
      waterCap.visible = cut > 0.003;
    },
  };
}
