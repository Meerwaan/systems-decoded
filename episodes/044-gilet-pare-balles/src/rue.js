// DOSSIER 044 — Le gilet pare-balles : AROUND, X-ray. Everything that is not the vest (gilet.js is the system, solid):
//
//   the street   a street of a housing estate at night, drawn in lines: kerbs, a sparse grid on the road, the feet of
//                the façades; on both sides blocks of flats of glass (their floors, windows, balconies in fine lines, a
//                few windows lit ink), street lamps (a point of light and its cone), the far end melting into the night.
//   the riot     up the street (−x): fires (bins, a burnt car), each a light that has a place — a white-hot heart, a
//                signal body, a tip that dissolves, drawn "the brightest wins" (blend MAX: signal over signal stays
//                orange) —, slow smoke lit from below, embers that rise (kit makeMotes), blurred glass silhouettes far
//                away; the façades take the fires' glow (signal lines baked from below, a warm pool on the wall). One
//                bin burns on the far pavement 5 m ahead of him (behind the torso in POSE0), an ember fire behind him.
//                Nobody shoots, nothing is thrown, no sign, no name.
//   him          « toi », a policeman of glass (kit/lib/figure.js), facing up the street (−x), his left hand on the back
//                of his belt (elbow high and back: never across the panel seen from his left), his right arm along his
//                side, a little back. Close (`xray`), his trunk is swapped for a SCULPTED TORSO of glass with the rib
//                cage in fine lines (12 pairs of ribs, cartilages, sternum, costal margin, spine) — the skin under the
//                impact is pushed in by the cone (max(0, coneAt − the gap panel → skin)), and `wave` runs a signal
//                ripple out of the impact over the belly and the ribs, once. `A.carry` follows his trunk (identity at
//                rest): the vest rides on it when he turns and walks home (`walk`).
//   the bench    the clay block (cut by `section` through the bench's impact, its face dented by the cone's own
//                profile), the depth gauge (a straight edge across, a graduated probe down into the dent, the 44 mark
//                lit veille), the chute's ghost plate and ghost bullet (it bounces), the comment's ghost blade (never
//                touches), the 045 rocket and its charge (signal).
//
//   buildRue() → { group, A, update(p, time, px, eye) }
//   p       { shell, riot, you, xray, wave, walk, cone, out, section, clay, dent, gauge, wall, bounce, blade, teaser, bench }
//   A       carry (a Group: identity while `walk` is 0), head, chest, belly, ribs, street, fire, clay, dent, gauge, wall,
//           blade, teaser, charge
//   px      stage.pixelScale() (pixels per cm at 1 cm from the lens) · eye the camera's position (world)
// `update` only writes uniforms and transforms (the clay's dent and the walk rewrite a few preallocated arrays, and
// only when their number moves): it is called sixteen times per frame. Nothing here draws at random (kit/lib/rng.js),
// and no flow ever changes how MANY elements it draws: a puff, an ember, a flame fades in and out.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glow, glass, asShell, anchor, lathe, plate, box, edgesOf, lineMat, mergeGeometries } from "@kit/build3d.js";
import { makeMotes, makePool } from "@kit/atmo.js";
import { makeFigure } from "@kit/figure.js";
import { DEG, STREET, RIOT, YOU, BODY, PANEL, IMPACT, CONE, coneProfile, SECTION, CLAY, GAUGE, IMPACT_BENCH, WALL, BLADE, WALK, TEASER, BULLET } from "./plan.js";
import { dressRue } from "./habillage.js";

const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, u) => a + (b - a) * u;
const f4 = (x) => Number(x).toFixed(4);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const BG = new THREE.Color(BRAND.bg ?? 0x050607);

/* ── uniforms every shader of the street shares (written once per update) ── */
const TIME = { value: 0 };
const FOG = { value: STREET.fog }; //   the street's night air (world.js sets the same density on the scene)
const FOCAL = { value: 2400 }; //        px of the lens: what keeps a fine line at least uMinW pixels wide
const MAX_BLEND = { transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.MaxEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor };

const NOISE = /* glsl */ `
  float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
  }`;

/** The cone's profile (plan.js coneProfile) and how far it pushes the skin toward +x, in the carry frame. */
const CONE_GLSL = /* glsl */ `
  uniform float uCone;
  float coneProf(float r) {
    if (r >= ${f4(CONE.R)}) return 0.0;
    float u = 1.0 - r / ${f4(CONE.R)};
    float rd = min(1.0, r / 1.2);
    return pow(max(u, 0.0), ${f4(CONE.k)}) * (0.92 + 0.08 * rd * rd);
  }
  float bellyPush(vec3 c) {
    float k = ${f4(CONE.depth)} * uCone * coneProf(length(c.yz - vec2(${f4(IMPACT[1])}, ${f4(IMPACT[2])})));
    return max(0.0, k - (c.x - (${f4(PANEL.wear)})));
  }`;

const patch = (src, from, to) => {
  if (!src.includes(from)) console.warn("rue.js: shader patch missed —", from.slice(0, 40));
  return src.replace(from, to);
};

/* ── glass, with the street's fog (the kit's glass ignores the scene's fog: the far end would never melt) ── */
const GLASS_VS = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying float vFogDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vFogDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
function fogGlass(color, o) {
  const m = glass(color, o);
  m.uniforms.uFog = FOG;
  m.vertexShader = GLASS_VS;
  m.fragmentShader = patch(m.fragmentShader, "varying vec3 vV;", "varying vec3 vV; varying float vFogDepth; uniform float uFog;");
  m.fragmentShader = patch(
    m.fragmentShader,
    "gl_FragColor = vec4(uColor * light * uAmount * uGain, 1.0);",
    "float fogK = exp(-pow(uFog * vFogDepth, 2.0)); gl_FragColor = vec4(uColor * light * uAmount * uGain * fogK, 1.0);",
  );
  return m;
}

/* ── fine lines in world units that never get thinner than `minW` pixels (tubes: their normal is the radial
   direction, so the shader finds the centre line and widens around it) ── */
const R0 = 0.1;
function fineMat({ color = BRAND.ink, k = 1, hot = 2.6, wave = false, push = false, run = false, trail = false, minW = 2.2 } = {}) {
  const defines = {};
  if (wave) defines.WAVE = 1;
  if (push) defines.PUSH = 1;
  if (run) defines.RUN = 1;
  if (trail) defines.TRAIL = 1;
  const mat = new THREE.ShaderMaterial({
    defines,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color).multiplyScalar(k) },
      uHot: { value: SIGNAL.clone().multiplyScalar(hot) },
      uAmount: { value: 1 }, uAmount2: { value: 1 },
      uR0: { value: R0 }, uMinW: { value: minW }, uFocal: FOCAL,
      uCone: { value: 0 }, uWave: { value: 0 }, uHit: { value: V(0, 0, 0) }, uHead: { value: 0 }, uTail: { value: 0.3 },
    },
    vertexShader: /* glsl */ `
      attribute float aS; attribute float aB; attribute float aKind;
      uniform float uR0, uMinW, uFocal;
      varying vec3 vC; varying float vS; varying float vB; varying float vKind; varying float vThin; varying float vNear;
      #ifdef PUSH
      ${CONE_GLSL}
      #endif
      void main() {
        vec3 c = position - normal * uR0;
        vec4 mvc = modelViewMatrix * vec4(c, 1.0);
        float need = 0.5 * uMinW * max(1.0, -mvc.z) / max(uFocal, 1.0);
        float r = max(uR0, need);
        vec3 p = c + normal * r;
        #ifdef PUSH
        if (aKind > 0.5) { float d = bellyPush(c); p.x += d; c.x += d; }
        #endif
        vC = c; vS = aS; vB = aB; vKind = aKind; vThin = uR0 / r;
        vec4 mva = modelViewMatrix * vec4(0.0, c.y, 0.0, 1.0);
        vNear = clamp((mvc.z - mva.z) / 9.0, -1.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uHot, uHit; uniform float uAmount, uAmount2, uWave, uHead, uTail;
      varying vec3 vC; varying float vS; varying float vB; varying float vKind; varying float vThin; varying float vNear;
      void main() {
        float a = (vKind > 0.5 ? uAmount2 : uAmount) * vB * (0.55 + 0.45 * vThin);
        #ifdef WAVE
        if (vKind < 0.5) a *= mix(0.16, 1.0, smoothstep(-0.55, 0.45, vNear)); // the far side of the cage, faint: no lattice
        #endif
        vec3 col = uColor;
        #ifdef WAVE
        if (uWave > 0.001 && uWave < 0.999) {
          float d = distance(vC, uHit);
          float R = uWave * 50.0;
          col += uHot * exp(-(d - R) * (d - R) / 9.0) * pow(1.0 - uWave, 0.6);
        }
        #endif
        #ifdef RUN
        float lit = 1.0 - smoothstep(uHead - 0.004, uHead + 0.004, vS);
        float head = exp(-(vS - uHead) * (vS - uHead) / 0.0009) * (1.0 - step(0.999, uHead)) * step(0.0005, uHead);
        col = col * lit + uHot * head;
        a *= max(lit, head);
        #endif
        #ifdef TRAIL
        a *= smoothstep(uHead - uTail, uHead, vS) * (1.0 - step(uHead, vS));
        #endif
        if (a < 0.002) discard;
        gl_FragColor = vec4(col * a, 1.0);
      }`,
  });
  return mat;
}
/** Tubes along curves, merged: [{ pts, closed, seg, b (brightness), kind (1: pushed by the cone / second amount), s0, s1 }]. */
function tubes(list) {
  const geos = list.map(({ pts, closed = false, seg, b = 1, kind = 0, s0 = 0, s1 = 1 }) => {
    const curve = new THREE.CatmullRomCurve3(pts, closed, "centripetal");
    const n = seg ?? Math.max(8, pts.length * 6);
    const g = new THREE.TubeGeometry(curve, n, R0, 5, closed);
    const count = g.attributes.position.count;
    const s = new Float32Array(count);
    for (let i = 0; i <= n; i++) for (let j = 0; j <= 5; j++) s[i * 6 + j] = s0 + (s1 - s0) * (i / n);
    g.setAttribute("aS", new THREE.BufferAttribute(s, 1));
    g.setAttribute("aB", new THREE.BufferAttribute(new Float32Array(count).fill(b), 1));
    g.setAttribute("aKind", new THREE.BufferAttribute(new Float32Array(count).fill(kind), 1));
    g.deleteAttribute("uv");
    return g;
  });
  return mergeGeometries(geos);
}

/** A set of segments drawn in screen pixels, a grey per vertex (× the material's colour). */
function lineSet() {
  const pos = [];
  const col = [];
  return {
    pos, col,
    push(a, b, ka, kb = ka) {
      pos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
      col.push(ka, ka, ka, kb, kb, kb);
    },
    build(color, width = 2, { fog = true, order = 2 } = {}) {
      const geo = new LineSegmentsGeometry();
      geo.setPositions(new Float32Array(pos));
      geo.setColors(new Float32Array(col));
      const line = new LineSegments2(geo, lineMat(color, width, { vertexColors: true, additive: true, fog }));
      line.renderOrder = order;
      line.frustumCulled = false;
      return line;
    },
  };
}
/** A line whose points move (written in place: no allocation). */
function liveLine(n, color, width, opacity) {
  const arr = new Float32Array(n * 6);
  const geo = new LineSegmentsGeometry();
  geo.setPositions(arr);
  const line = new LineSegments2(geo, lineMat(color, width, { opacity }));
  line.renderOrder = 3;
  line.frustumCulled = false;
  const data = geo.attributes.instanceStart.data;
  return { line, arr: data.array, flush: () => (data.needsUpdate = true) };
}

/* ── billboards: one quad per element, everything moved in the shader ── */
function quads(n, attrs) {
  const g = new THREE.InstancedBufferGeometry();
  const p = new THREE.PlaneGeometry(1, 1);
  g.index = p.index;
  g.setAttribute("position", p.attributes.position);
  for (const [name, size, arr] of attrs) g.setAttribute(name, new THREE.InstancedBufferAttribute(arr, size));
  g.instanceCount = n;
  return g;
}

/** Flames: tongues standing on their base (turned to the eye about the vertical), a white heart at the root, a signal
 *  body, a tip that breaks up and dissolves. MAX blending: the brightest wins. */
function makeFlames(list) {
  const n = list.length;
  const base = new Float32Array(n * 3);
  const shape = new Float32Array(n * 4);
  list.forEach((t, i) => {
    base.set(t.at, i * 3);
    shape.set([t.w, t.h, t.seed, t.k], i * 4);
  });
  const uniforms = { uTime: TIME, uFog: FOG, uAmount: { value: 1 }, uBody: { value: SIGNAL.clone().multiplyScalar(1.45) }, uCore: { value: INK.clone().multiplyScalar(1.15) } };
  const mesh = new THREE.Mesh(
    quads(n, [["aBase", 3, base], ["aShape", 4, shape]]),
    new THREE.ShaderMaterial({
      ...MAX_BLEND,
      side: THREE.DoubleSide,
      uniforms,
      vertexShader: /* glsl */ `
        attribute vec3 aBase; attribute vec4 aShape;
        uniform float uTime, uAmount, uFog;
        varying vec2 vUv; varying float vSeed; varying float vK;
        void main() {
          vec3 base = (modelMatrix * vec4(aBase, 1.0)).xyz;
          vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
          right = normalize(vec3(right.x, 0.0, right.z) + vec3(1e-4, 0.0, 0.0));
          float s = aShape.z;
          float h = aShape.y * (0.93 + 0.07 * sin(uTime * 1.7 + s * 11.0)) * (0.55 + 0.45 * uAmount);
          vec3 p = base + right * position.x * aShape.x * (0.8 + 0.2 * uAmount) + vec3(0.0, (position.y + 0.5) * h, 0.0);
          vec4 mv = viewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          vUv = position.xy + 0.5;
          vSeed = s;
          float fogK = exp(-pow(uFog * -mv.z, 2.0));
          vK = aShape.w * uAmount * (0.5 + 0.5 * fogK);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform vec3 uBody, uCore;
        varying vec2 vUv; varying float vSeed; varying float vK;
        ${NOISE}
        void main() {
          float y = vUv.y;
          float t = uTime;
          float sway = (vnoise(vec2(y * 1.6 - t * 0.55, vSeed * 13.0)) - 0.5) * 0.55 * y;
          float x = (vUv.x - 0.5 - sway) * 2.0;
          float width = mix(0.82, 0.07, pow(clamp(y, 0.0, 1.0), 0.75)) * smoothstep(0.0, 0.12, y);
          float n = 0.62 * vnoise(vec2(vUv.x * 3.6 + vSeed * 7.0, y * 2.8 - t * 1.25)) + 0.38 * vnoise(vec2(vUv.x * 8.0 - vSeed, y * 6.5 - t * 2.1));
          float edge = max(width * (0.72 + 0.56 * n), 1e-3);
          float body = 1.0 - smoothstep(edge * 0.3, edge, abs(x));
          float top = 1.0 - smoothstep(0.3, 1.0, y + (n - 0.5) * 0.5);
          float dens = body * top;
          float core = (1.0 - smoothstep(0.0, max(width * 0.5, 1e-3), abs(x))) * (1.0 - smoothstep(0.03, 0.4, y));
          vec3 col = uBody * dens + uCore * core * dens;
          if (dens < 0.002) discard;
          gl_FragColor = vec4(col * vK, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return { mesh, uniforms };
}

/** Lights that have a place: a bright heart and a long tail (025's makeSprites, as quads), MAX-blended. */
function makeHalos(list) {
  const n = list.length;
  const base = new Float32Array(n * 3);
  const shape = new Float32Array(n * 4);
  const color = new Float32Array(n * 3);
  list.forEach((h, i) => {
    base.set(h.at, i * 3);
    shape.set([h.size, h.k, h.seed ?? i * 0.37, h.breathe ?? 0.1], i * 4);
    color.set([h.color.r, h.color.g, h.color.b], i * 3);
  });
  const uniforms = { uTime: TIME, uFog: FOG, uAmount: { value: 1 } };
  const mesh = new THREE.Mesh(
    quads(n, [["aBase", 3, base], ["aShape", 4, shape], ["aColor", 3, color]]),
    new THREE.ShaderMaterial({
      ...MAX_BLEND,
      uniforms,
      vertexShader: /* glsl */ `
        attribute vec3 aBase; attribute vec4 aShape; attribute vec3 aColor;
        uniform float uTime, uAmount, uFog;
        varying vec2 vQ; varying vec3 vCol;
        void main() {
          vec4 mv = modelViewMatrix * vec4(aBase, 1.0);
          float breathe = 1.0 - aShape.w + aShape.w * sin(uTime * 0.9 + aShape.z * 9.0);
          mv.xy += position.xy * aShape.x;
          gl_Position = projectionMatrix * mv;
          vQ = position.xy * 2.0;
          float fogK = exp(-pow(uFog * -mv.z, 2.0));
          vCol = aColor * aShape.y * uAmount * breathe * (0.45 + 0.55 * fogK);
        }`,
      fragmentShader: /* glsl */ `
        varying vec2 vQ; varying vec3 vCol;
        void main() {
          float n = clamp(1.0 - length(vQ), 0.0, 1.0);
          gl_FragColor = vec4(vCol * (0.72 * pow(n, 7.0) + 0.28 * n * n), 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/** Light thrown on a wall or the ground: quads laid in the world, a soft falloff, MAX-blended (never a veil: a place). */
function makePools(list) {
  const pos = [];
  const q = [];
  const col = [];
  const kind = [];
  const idx = [];
  list.forEach((p, i) => {
    const c = p.centre;
    const [u, v] = p.axes; // half-extent vectors [ [x,y,z], [x,y,z] ]
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (const [a, b] of corners) {
      pos.push(c[0] + a * u[0] + b * v[0], c[1] + a * u[1] + b * v[1], c[2] + a * u[2] + b * v[2]);
      q.push(a, b);
      col.push(p.color.r * p.k, p.color.g * p.k, p.color.b * p.k);
      kind.push(p.wall ? 1 : 0);
    }
    const o = i * 4;
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aQ", new THREE.Float32BufferAttribute(q, 2));
  geo.setAttribute("aCol", new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute("aKind", new THREE.Float32BufferAttribute(kind, 1));
  geo.setIndex(idx);
  const uniforms = { uTime: TIME, uFog: FOG, uAmount: { value: 1 } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      ...MAX_BLEND,
      side: THREE.DoubleSide,
      uniforms,
      vertexShader: /* glsl */ `
        attribute vec2 aQ; attribute vec3 aCol; attribute float aKind;
        uniform float uAmount, uFog, uTime;
        varying vec2 vQ; varying vec3 vCol; varying float vKind;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          vQ = aQ; vKind = aKind;
          float fogK = exp(-pow(uFog * -mv.z, 2.0));
          vCol = aCol * uAmount * fogK * (0.9 + 0.1 * sin(uTime * 0.8 + position.x * 0.003));
        }`,
      fragmentShader: /* glsl */ `
        varying vec2 vQ; varying vec3 vCol; varying float vKind;
        void main() {
          float f;
          if (vKind > 0.5) {
            float up = clamp(vQ.y * 0.5 + 0.5, 0.0, 1.0); // 0 at the foot of the wall, 1 at the top of the quad
            f = exp(-2.6 * vQ.x * vQ.x) * pow(1.0 - up, 2.2);
          } else {
            float r = clamp(length(vQ), 0.0, 1.0);
            f = pow(1.0 - r, 2.0);
          }
          gl_FragColor = vec4(vCol * f, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  return { mesh, uniforms };
}

/** Smoke: soft puffs that rise and grow slowly, lit signal from below, dark ink above; each fades in at the fire and
 *  out high up (a puff is never born or killed in view), and everything near the header's height fades to the night. */
function makeSmoke(list) {
  const n = list.length;
  const base = new Float32Array(n * 3);
  const shape = new Float32Array(n * 4);
  const drift = new Float32Array(n * 3);
  list.forEach((s, i) => {
    base.set(s.at, i * 3);
    shape.set([s.seed, s.rate, s.size, s.height], i * 4);
    drift.set(s.drift, i * 3);
  });
  const uniforms = { uTime: TIME, uFog: FOG, uAmount: { value: 1 }, uLow: { value: SIGNAL.clone().multiplyScalar(0.55) }, uHigh: { value: INK.clone().multiplyScalar(0.12) } };
  const mesh = new THREE.Mesh(
    quads(n, [["aBase", 3, base], ["aShape", 4, shape], ["aDrift", 3, drift]]),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms,
      vertexShader: /* glsl */ `
        attribute vec3 aBase; attribute vec4 aShape; attribute vec3 aDrift;
        uniform float uTime, uAmount, uFog;
        varying vec2 vQ; varying float vA; varying float vLow; varying float vSeed;
        void main() {
          float f = fract(uTime * aShape.y + aShape.x);
          float H = 620.0 * aShape.w;
          vec3 c = aBase + vec3(aDrift.x * f * H, 70.0 + f * H, aDrift.z * f * H);
          c.x += sin(uTime * 0.21 + aShape.x * 20.0) * 30.0 * f;
          c.z += cos(uTime * 0.17 + aShape.x * 13.0) * 30.0 * f;
          float size = (90.0 + f * 400.0) * aShape.z;
          vec4 mvc = modelViewMatrix * vec4(c, 1.0);
          vec4 clip = projectionMatrix * mvc;
          float rot = aShape.x * 6.2832 + uTime * 0.06 * (aShape.x - 0.5);
          vec2 q = position.xy;
          vec2 qr = vec2(q.x * cos(rot) - q.y * sin(rot), q.x * sin(rot) + q.y * cos(rot));
          vec4 mv = mvc;
          mv.xy += qr * size;
          gl_Position = projectionMatrix * mv;
          vQ = q * 2.0;
          vSeed = aShape.x;
          float life = smoothstep(0.0, 0.2, f) * (1.0 - smoothstep(0.5, 1.0, f));
          float ndcY = clip.w > 0.0 ? clip.y / clip.w : 1.0;
          float hud = 1.0 - smoothstep(0.28, 0.52, ndcY);
          float fogK = exp(-pow(uFog * -mvc.z, 2.0));
          vA = life * uAmount * hud * fogK;
          vLow = 1.0 - smoothstep(0.0, 0.42, f);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uLow, uHigh; uniform float uTime;
        varying vec2 vQ; varying float vA; varying float vLow; varying float vSeed;
        ${NOISE}
        void main() {
          float r = length(vQ);
          float blob = clamp(1.0 - r, 0.0, 1.0);
          blob = blob * blob * (3.0 - 2.0 * blob);
          float n = 0.6 * vnoise(vQ * 2.1 + vSeed * 17.0 + vec2(0.0, -uTime * 0.06)) + 0.4 * vnoise(vQ * 4.6 - vSeed * 9.0);
          float a = blob * smoothstep(0.18, 0.72, n + blob * 0.35) * vA * 0.62;
          if (a < 0.002) discard;
          gl_FragColor = vec4(mix(uHigh, uLow, vLow), a);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  return { mesh, uniforms };
}

/* ── the trunk (figure.js's own profile: the vest is fitted to it) ── */
const TRUNK = [[0.1, 86], [11, 86], [12.2, 96], [11.2, 110], [14.2, 127], [17.4, 141], [16.6, 147], [7, 151.5], [4.8, 155.5], [0.1, 155.5]];
const SM = new THREE.CatmullRomCurve3(TRUNK.map(([r, y]) => V(r, y, 0)), false, "centripetal").getPoints(54).map((p) => [Math.max(0.1, p.x), p.y]);
/** The trunk's half-width (along z, once turned) at a height. */
function halfAt(y) {
  for (let i = 1; i < SM.length; i++) {
    const [r0, y0] = SM[i - 1];
    const [r1, y1] = SM[i];
    if (y1 > y0 + 1e-6 && y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return y < 100 ? 11 : 0.1;
}
const FRONT_K = 0.62; // the front as figure.js draws it (BODY.front)
const BACK_K = 0.58; //  the back a little flatter: a back, not a barrel
/** A point of the trunk's cross-section: φ 0 at the spine, π at the sternum; s < 1 goes inside the skin. */
function trunkAt(phi, y, side, s = 1) {
  const c = halfAt(y);
  const cx = Math.cos(phi);
  return V(cx * (cx > 0 ? BACK_K : FRONT_K) * c * s, y, side * Math.sin(phi) * c * s);
}

/** The sculpted torso of glass: the trunk's rings, flattened at the back; dented by the cone and lit by the wave in its shader. */
function makeTorso() {
  const seg = 72;
  const rings = SM.length;
  const pos = new Float32Array(rings * (seg + 1) * 3);
  for (let j = 0; j < rings; j++) {
    const [r, y] = SM[j];
    for (let k = 0; k <= seg; k++) {
      const th = (k / seg) * TAU; // starts at the spine: the seam is at the back
      const cx = Math.cos(th);
      const i = (j * (seg + 1) + k) * 3;
      pos[i] = cx * (cx > 0 ? BACK_K : FRONT_K) * r;
      pos[i + 1] = y;
      pos[i + 2] = Math.sin(th) * r;
    }
  }
  const idx = [];
  for (let j = 0; j < rings - 1; j++) {
    for (let k = 0; k < seg; k++) {
      const a = j * (seg + 1) + k;
      const b = a + 1;
      const c = a + seg + 1;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  // the seam: the first and the last column are the same points — one normal for both
  const nor = geo.attributes.normal.array;
  for (let j = 0; j < rings; j++) {
    const a = j * (seg + 1) * 3;
    const b = (j * (seg + 1) + seg) * 3;
    for (let c = 0; c < 3; c++) nor[a + c] = nor[b + c] = (nor[a + c] + nor[b + c]) / 2;
  }
  // facing outward? (the winding above runs one way round; flip if the normal at the front points inward)
  const front = (Math.round(seg / 2) + (rings >> 1) * (seg + 1)) * 3;
  if (nor[front] > 0) for (let i = 0; i < nor.length; i++) nor[i] = -nor[i];

  const mat = glass(BRAND.ink, { base: 0.004, rim: 0.42, power: 2.4, edge: 0.35, spec: 0.8, through: 0.15 });
  Object.assign(mat.uniforms, { uCone: { value: 0 }, uPushK: { value: 1 }, uWave: { value: 0 }, uHot: { value: SIGNAL.clone().multiplyScalar(1.6) }, uSkinHit: { value: V(0, 0, 0) } });
  mat.vertexShader = /* glsl */ `
    varying vec3 vN; varying vec3 vV; varying vec3 vP;
    uniform float uPushK;
    ${CONE_GLSL}
    void main() {
      vec3 p = position; vec3 n = normal;
      float d0 = bellyPush(p) * uPushK;
      if (d0 > 0.0) {
        float e = 0.25;
        float dy = (bellyPush(p + vec3(0.0, e, 0.0)) - bellyPush(p - vec3(0.0, e, 0.0))) * uPushK / (2.0 * e);
        float dz = (bellyPush(p + vec3(0.0, 0.0, e)) - bellyPush(p - vec3(0.0, 0.0, e))) * uPushK / (2.0 * e);
        p.x += d0;
        n = normalize(n + vec3(0.0, dy, dz) * max(0.2, -n.x));
      }
      vP = p;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vN = normalize(normalMatrix * n);
      vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`;
  mat.fragmentShader = patch(mat.fragmentShader, "varying vec3 vV;", "varying vec3 vV; varying vec3 vP; uniform float uWave; uniform vec3 uHot, uSkinHit;");
  mat.fragmentShader = patch(
    mat.fragmentShader,
    "gl_FragColor = vec4(uColor * light * uAmount * uGain, 1.0);",
    `float ringK = 0.0;
        if (uWave > 0.001 && uWave < 0.999) {
          float dd = distance(vP, uSkinHit);
          float R = uWave * 50.0;
          ringK = exp(-(dd - R) * (dd - R) / 5.0) * pow(1.0 - uWave, 0.6) * (0.12 + 0.88 * g) * 0.85;
        }
        gl_FragColor = vec4((uColor * light + uHot * ringK) * uAmount * uGain, 1.0);`,
  );
  const mesh = new THREE.Mesh(geo, mat);
  return { mesh, mat };
}

/** The rib cage, in fine lines: 12 pairs of ribs and their cartilages, the sternum, the costal margin, the spine; and
 *  (kind 1) the skin's line in the section plane, pushed in by the cone. */
function makeCage() {
  const list = [];
  const S = 0.86; // inside the skin
  // [y at the spine, φ/π where the bone ends, y there, y where its cartilage meets the sternum (0: the costal margin, −1: floating)]
  const RIBS = [
    [147, 0.7, 141.5, 141.6],
    [144, 0.75, 137.5, 138.8],
    [141, 0.76, 133.5, 136.0],
    [138, 0.77, 130.0, 133.2],
    [135, 0.78, 126.5, 130.4],
    [132, 0.79, 122.5, 127.6],
    [129, 0.8, BODY.ribs.front, 124.8],
    [126, 0.7, 115.5, 0],
    [123, 0.62, 113.5, 0],
    [120, 0.55, BODY.ribs.low, 0],
    [117, 0.45, 112.6, -1],
    [114, 0.36, 113.6, -1],
  ];
  const sternumAt = (y, side) => {
    const c = halfAt(y);
    return V(-FRONT_K * c * 0.93, y, side * 1.6);
  };
  for (const side of [-1, 1]) {
    for (const [yp, pe, ye, ys] of RIBS) {
      const bone = [];
      for (let i = 0; i <= 14; i++) {
        const t = i / 14;
        const phi = Math.PI * lerp(0.06, pe, t);
        bone.push(trunkAt(phi, yp - (yp - ye) * Math.pow(t, 1.3), side, S));
      }
      list.push({ pts: bone, seg: 40, b: 1 });
      if (ys > 0) {
        // the cartilage: on round the front, rising to the sternum's edge
        const end = sternumAt(ys, side);
        const cart = [];
        for (let i = 0; i <= 6; i++) {
          const t = i / 6;
          const phi = Math.PI * lerp(pe, 0.955, t);
          const p = trunkAt(phi, ye + (ys - ye) * Math.pow(t, 1.5), side, S);
          cart.push(i === 6 ? end : p);
        }
        list.push({ pts: cart, seg: 18, b: 0.55 });
      }
    }
    // the costal margin: from the xiphoid down and out along the cartilages of ribs 7 to 10
    const margin = [[0.955, 124.8], [0.88, 121.2], [0.8, BODY.ribs.front], [0.7, 115.5], [0.62, 113.5], [0.55, BODY.ribs.low]].map(([pp, y]) => trunkAt(Math.PI * pp, y, side, S));
    margin[0] = sternumAt(124.8, side);
    list.push({ pts: margin, seg: 30, b: 0.62 });
    // the sternum's edge
    list.push({ pts: [146.6, 140, 133, 126, 124.8].map((y) => sternumAt(y, side)), seg: 16, b: 0.8 });
  }
  // the sternum's top and the xiphoid
  list.push({ pts: [sternumAt(146.6, -1), V(-FRONT_K * halfAt(147) * 0.95, 147.2, 0), sternumAt(146.6, 1)], seg: 8, b: 0.8 });
  list.push({ pts: [sternumAt(124.8, -1), V(-FRONT_K * halfAt(122) * 0.93, 121.6, 0), sternumAt(124.8, 1)], seg: 8, b: 0.7 });
  // the spine: one small loop per vertebra, deep at the back
  for (let y = 94; y <= 152; y += 3.85) {
    const cx = BACK_K * halfAt(y + 1.6) * 0.66;
    const h = 1.5;
    const w = 1.25;
    list.push({ pts: [V(cx - w, y, 0), V(cx, y - 0.25, 0), V(cx + w, y, 0), V(cx + w * 1.05, y + h, 0), V(cx + w, y + 2 * h, 0), V(cx, y + 2 * h + 0.25, 0), V(cx - w, y + 2 * h, 0), V(cx - w * 1.05, y + h, 0)], closed: true, seg: 20, b: 0.32 });
  }
  // the skin in the section plane (kind 1)
  const zs = SECTION.z;
  const skin = [];
  for (let y = 90; y <= 143; y += 0.6) {
    const c = halfAt(y);
    skin.push(V(-FRONT_K * c * Math.sqrt(Math.max(0, 1 - (zs / c) ** 2)), y, zs));
  }
  list.push({ pts: skin, seg: 140, b: 1, kind: 1 });
  const mat = fineMat({ color: BRAND.ink, k: 0.52, hot: 2.6, wave: true, push: true, minW: 2.2 });
  const mesh = new THREE.Mesh(tubes(list), mat);
  mesh.renderOrder = 8; // drawn before the shells' depth: seen through the glass
  mesh.frustumCulled = false;
  return { mesh, mat };
}

/** A glass figure baked into one geometry (position and normal only), as it stands: for the crowd. */
function bakeFigure(f) {
  f.group.updateMatrixWorld(true);
  const geos = [];
  f.group.traverse((o) => {
    if (!o.isMesh || o.userData.shell || !o.visible || o === f.shadow) return;
    if (o.material !== f.body && o.material !== f.flesh) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", o.geometry.attributes.position.clone());
    g.setAttribute("normal", o.geometry.attributes.normal.clone());
    if (o.geometry.index) g.setIndex(o.geometry.index.clone());
    else g.setIndex([...Array(g.attributes.position.count).keys()]);
    g.applyMatrix4(o.matrixWorld);
    geos.push(g);
  });
  return mergeGeometries(geos);
}

/* ── where the fires burn ── */
const FIRES = RIOT.fires.map(([x, z], i) => ({ x, z, kind: i === RIOT.fires.length - 1 ? "ember" : "bin", s: [1.0, 1.15, 1.25, 1.45, 1.35, 0.55][i] ?? 1, i }));
FIRES.push({ x: RIOT.car[0], z: RIOT.car[1], kind: "car", s: 1.5, i: FIRES.length });
/** How much of the fires' light falls on a point (baked on the façades and the ground): from below, it fades with height and distance. */
function fireLight(x, y, z) {
  let k = 0;
  for (const f of FIRES) {
    const d2 = (x - f.x) ** 2 + (z - f.z) ** 2;
    k += f.s * Math.exp(-d2 / (2 * 900 * 900)) * Math.exp(-Math.max(0, y) / (680 * Math.sqrt(f.s)));
  }
  return Math.min(1.2, k);
}
/** The street fades out toward its two ends (the far end melts into the night). */
const endFade = (x) => smooth(STREET.from - 300, STREET.from + 1600, x) * (1 - smooth(STREET.to - 1800, STREET.to, x));

export function buildRue() {
  const group = new THREE.Group();
  group.name = "rue";
  const A = {};
  const rand = rng(44);

  /* ═════════════ THE STREET (shell) ═════════════ */
  const street = new THREE.Group();
  street.name = "street";
  group.add(street);
  const ink = lineSet(); //   ink lines (grey per vertex)
  const hot = lineSet(); //   the same lines where the fires light them (signal per vertex)
  const seg = (a, b, k) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const n = Math.max(1, Math.ceil(L / 300));
    for (let i = 0; i < n; i++) {
      const u0 = i / n;
      const u1 = (i + 1) / n;
      const p = [lerp(a[0], b[0], u0), lerp(a[1], b[1], u0), lerp(a[2], b[2], u0)];
      const q = [lerp(a[0], b[0], u1), lerp(a[1], b[1], u1), lerp(a[2], b[2], u1)];
      ink.push(p, q, k * endFade(p[0]), k * endFade(q[0]));
      const hp = fireLight(...p);
      const hq = fireLight(...q);
      if (hp + hq > 0.05) hot.push(p, q, Math.min(1, hp) * 0.85, Math.min(1, hq) * 0.85);
    }
  };

  // the ground: kerbs, the feet of the façades, joints on the pavements, a sparse grid on the road
  const G = 0.4;
  for (const side of [-1, 1]) {
    seg([STREET.from, G, side * STREET.kerb], [STREET.to, G, side * STREET.kerb], 0.3);
    seg([STREET.from, 14, side * (STREET.kerb + 4)], [STREET.to, 14, side * (STREET.kerb + 4)], 0.16);
    seg([STREET.from, G, side * STREET.half], [STREET.to, G, side * STREET.half], 0.2);
    for (let x = STREET.from; x <= STREET.to; x += 400) seg([x, 14, side * (STREET.kerb + 4)], [x, G, side * STREET.half], 0.1);
    seg([STREET.from, G, side * 160], [STREET.to, G, side * 160], 0.07);
  }
  for (let x = STREET.from + 250; x <= STREET.to; x += 500) seg([x, G, -STREET.kerb], [x, G, STREET.kerb], 0.075);

  // the blocks of flats: a seed block behind each side of him, then rows both ways
  const blocks = [];
  const row = (side, x0, w0, floors0) => {
    const make = (xa, xb, floors) => blocks.push({ x0: xa, x1: xb, side, floors, h: floors * STREET.blocks.floor + 70, depth: 1000 + rand() * 300 });
    make(x0, x0 + w0, floors0);
    let x = x0 + w0;
    while (x < STREET.to - 400) {
      x += 380 + rand() * 520;
      const w = lerp(STREET.blocks.w[0], STREET.blocks.w[1], rand());
      make(x, Math.min(x + w, STREET.to + 600), Math.round(lerp(5, 12, rand())));
      x += w;
    }
    x = x0;
    while (x > STREET.from + 400) {
      x -= 380 + rand() * 520;
      const w = lerp(STREET.blocks.w[0], STREET.blocks.w[1], rand());
      make(Math.max(x - w, STREET.from - 600), x, Math.round(lerp(5, 12, rand())));
      x -= w;
    }
  };
  row(-1, -1750, 2700, 10); // the façade across the street, behind the burning bin (POSE0's background)
  row(1, -1300, 2300, 8);
  const facadeMats = [];
  const litWin = [];
  for (const b of blocks) {
    const zf = b.side * STREET.half;
    const zb = b.side * (STREET.half + b.depth);
    const { x0, x1, h } = b;
    // its volume of glass (a faint shell: the lines do the drawing)
    const m = fogGlass(BRAND.ink, { base: 0, rim: 0.035, power: 2.2 });
    m.uniforms.uAmount.value = 1;
    const shellMesh = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, h, b.depth), m);
    shellMesh.position.set((x0 + x1) / 2, h / 2, (zf + zb) / 2);
    asShell(shellMesh, 14);
    street.add(shellMesh);
    facadeMats.push({ m, k: endFade((x0 + x1) / 2) });
    // its outline and the edges going back
    seg([x0, 0, zf], [x0, h, zf], 0.3);
    seg([x1, 0, zf], [x1, h, zf], 0.3);
    seg([x0, h, zf], [x1, h, zf], 0.32);
    seg([x0, h, zf], [x0, h, zb], 0.16);
    seg([x1, h, zf], [x1, h, zb], 0.16);
    seg([x0, h, zb], [x1, h, zb], 0.1);
    seg([x0, h - 60, zf], [x1, h - 60, zf], 0.14); // the parapet
    // floors
    for (let k = 1; k < b.floors; k++) seg([x0, k * STREET.blocks.floor, zf], [x1, k * STREET.blocks.floor, zf], 0.15);
    // bays and windows (none on the ground floor but a hall), balconies on every third bay of some blocks
    const nb = Math.max(3, Math.round((x1 - x0) / 300));
    const bw = (x1 - x0) / nb;
    const balconies = rand() < 0.65;
    const zw = zf - b.side * 1.5;
    for (let k = 0; k < b.floors; k++) {
      const yf = k * STREET.blocks.floor;
      for (let j = 0; j < nb; j++) {
        const xa = x0 + j * bw;
        if (k === 0) {
          if (j === Math.floor(nb / 2)) {
            seg([xa + 40, 0, zw], [xa + 40, 230, zw], 0.18);
            seg([xa + bw - 40, 0, zw], [xa + bw - 40, 230, zw], 0.18);
            seg([xa + 40, 230, zw], [xa + bw - 40, 230, zw], 0.18);
          }
          continue;
        }
        const wx0 = xa + bw * 0.25;
        const wx1 = xa + bw * 0.75;
        const wy0 = yf + 85;
        const wy1 = yf + 225;
        seg([wx0, wy0, zw], [wx1, wy0, zw], 0.12);
        seg([wx0, wy1, zw], [wx1, wy1, zw], 0.12);
        seg([wx0, wy0, zw], [wx0, wy1, zw], 0.12);
        seg([wx1, wy0, zw], [wx1, wy1, zw], 0.12);
        if (rand() < 0.075) litWin.push([(wx0 + wx1) / 2, (wy0 + wy1) / 2, zf - b.side * 2, wx1 - wx0 - 8, wy1 - wy0 - 8, b.side]);
        if (balconies && j % 3 === 1) {
          const zo = zf - b.side * 115;
          seg([xa + 10, yf, zf], [xa + 10, yf, zo], 0.2);
          seg([xa + bw - 10, yf, zf], [xa + bw - 10, yf, zo], 0.2);
          seg([xa + 10, yf, zo], [xa + bw - 10, yf, zo], 0.22);
          seg([xa + 10, yf + 100, zo], [xa + bw - 10, yf + 100, zo], 0.16);
          seg([xa + 10, yf, zo], [xa + 10, yf + 100, zo], 0.12);
          seg([xa + bw - 10, yf, zo], [xa + bw - 10, yf + 100, zo], 0.12);
        }
      }
    }
  }
  // lit windows (ink, steady)
  let windowMat;
  {
    const geos = litWin.map(([x, y, z, w, hh, side]) => {
      const g = new THREE.PlaneGeometry(w, hh);
      if (side > 0) g.rotateY(Math.PI);
      g.translate(x, y, z);
      g.deleteAttribute("uv");
      return g;
    });
    const winMat = new THREE.MeshBasicMaterial({ color: INK.clone().multiplyScalar(0.36), transparent: true, depthWrite: false, fog: true, side: THREE.DoubleSide });
    const win = new THREE.Mesh(mergeGeometries(geos), winMat);
    win.renderOrder = 3;
    street.add(win);
    windowMat = winMat;
  }

  // street lamps: a pole, an arm, a head of glass, a point of light, its cone, a pool on the ground
  const lampHalos = [];
  const lampPools = [];
  const lampHeads = [];
  const lampCones = new THREE.Group();
  const coneMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uK: { value: 0.045 }, uFog: FOG },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vH; varying float vFogDepth;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        vH = clamp(position.y / 780.0 + 0.5, 0.0, 1.0);
        vFogDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uFog;
      varying vec3 vN; varying vec3 vV; varying float vH; varying float vFogDepth;
      void main() {
        float facing = abs(dot(normalize(vN), normalize(vV)));
        float k = uK * pow(vH, 1.6) * pow(facing, 1.5) * exp(-pow(uFog * vFogDepth, 2.0));
        gl_FragColor = vec4(uColor * k, 1.0);
      }`,
  });
  const lampAt = [];
  for (let x = -4200; x <= STREET.to - 400; x += STREET.lamps.every) lampAt.push([x, 1]);
  for (let x = -3000; x <= STREET.to - 400; x += STREET.lamps.every) lampAt.push([x, -1]);
  const headMat = fogGlass(BRAND.ink, { base: 0.01, rim: 0.3, power: 2.2, edge: 0.3 });
  for (const [x, side] of lampAt) {
    const zp = side * STREET.lamps.z;
    const zl = side * (STREET.lamps.z - 150);
    const hh = STREET.lamps.h;
    seg([x, 0, zp], [x, hh, zp], 0.3);
    seg([x, hh, zp], [x, hh + 12, zp - side * 60], 0.28);
    seg([x, hh + 12, zp - side * 60], [x, hh + 4, zl], 0.28);
    const head = new THREE.Mesh(new THREE.BoxGeometry(46, 9, 22), headMat);
    head.position.set(x, hh, zl);
    asShell(head, 14);
    street.add(head);
    lampHeads.push(head);
    lampHalos.push({ at: [x, hh - 8, zl], size: 150, k: 0.85, color: INK, breathe: 0 });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(250, 780, 28, 1, true), coneMat);
    cone.position.set(x, hh - 8 - 390, zl);
    lampCones.add(cone);
    lampPools.push({ centre: [x, 1, zl], axes: [[240, 0, 0], [0, 0, 240]], color: INK, k: 0.07 });
  }
  street.add(lampCones);
  const lampLights = makeHalos(lampHalos);
  street.add(lampLights.mesh);
  const lampFloor = makePools(lampPools);
  street.add(lampFloor.mesh);

  const inkLines = ink.build(BRAND.ink, 2, { fog: true, order: 2 });
  street.add(inkLines);
  A.street = anchor(group, -3000, 150, 0);

  /* ═════════════ THE RIOT (riot) ═════════════ */
  const riot = new THREE.Group();
  riot.name = "riot";
  group.add(riot);
  const dress = dressRue(); group.add(dress.group); // habillage.js: stones on the road, a starred bus shelter, the sky over the far end
  const hotLines = hot.build(BRAND.signal, 2, { fog: true, order: 2 });
  riot.add(hotLines);
  const binMat = fogGlass(BRAND.ink, { base: 0.006, rim: 0.32, power: 2.2, edge: 0.4 });
  const carMat = fogGlass(BRAND.ink, { base: 0.002, rim: 0.16, power: 2.6, edge: 0.2 });
  const flames = [];
  const halos = [];
  const pools = [];
  const puffs = [];
  const motes = [];
  for (const f of FIRES) {
    const s = f.s;
    const fr = rng(100 + f.i);
    if (f.kind === "bin") {
      // one or two wheelie bins of glass, the lid thrown open; the flames stand out of their mouth
      const nBins = s > 1.4 ? 2 : 1;
      for (let b = 0; b < nBins; b++) {
        const bin = new THREE.Group();
        const body = new THREE.Mesh(box(64, 100, 72, 3), binMat);
        body.position.y = 50;
        const lid = new THREE.Mesh(box(66, 4, 76, 1.5), binMat);
        lid.rotation.z = 1.9;
        lid.position.set(-34, 132, 0);
        bin.add(body, lid);
        asShell([body, lid], 14);
        bin.position.set(f.x + b * 80 - (nBins - 1) * 40, 0, f.z + b * 30);
        bin.rotation.y = fr() * TAU;
        riot.add(bin);
      }
      const top = 100;
      const nt = Math.round(3 + 2 * s);
      for (let t = 0; t < nt; t++) {
        const ox = (fr() - 0.5) * 44 * s * (nBins === 2 ? 2 : 1);
        const oz = (fr() - 0.5) * 40 * s;
        flames.push({ at: [f.x + ox, top - 8, f.z + oz], w: lerp(50, 74, fr()) * s, h: lerp(110, 175, fr()) * s, seed: fr() * 10, k: lerp(0.75, 1, fr()) });
      }
      halos.push({ at: [f.x, top + 40 * s, f.z], size: 330 * s, k: 0.42, color: SIGNAL, seed: fr() * 9, breathe: 0.08 });
    } else if (f.kind === "ember") {
      // what is left of a fire behind him: low flames on a heap
      for (let t = 0; t < 3; t++) flames.push({ at: [f.x + (fr() - 0.5) * 50, 4, f.z + (fr() - 0.5) * 50], w: lerp(36, 52, fr()), h: lerp(55, 85, fr()), seed: fr() * 10, k: 0.8 });
      halos.push({ at: [f.x, 40, f.z], size: 220, k: 0.36, color: SIGNAL, seed: fr() * 9, breathe: 0.08 });
    } else {
      // the burnt car: a body of glass on its wheels, its insides glowing, flames out of the windows
      const car = new THREE.Group();
      const outline = [[-210, 26], [-212, 72], [-175, 88], [-90, 96], [-48, 140], [62, 143], [140, 98], [204, 86], [212, 30], [170, 26], [150, 46], [110, 46], [92, 26], [-96, 26], [-114, 46], [-154, 46], [-174, 26]];
      const shellMesh = new THREE.Mesh(plate(outline, 176, { bevel: 4 }), carMat);
      shellMesh.position.z = -88;
      const wheels = [];
      for (const wx of [-134, 130]) for (const wz of [-78, 78]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 20, 24), carMat);
        w.rotation.x = Math.PI / 2;
        w.position.set(wx, 30, wz);
        wheels.push(w);
      }
      car.add(shellMesh, ...wheels);
      asShell([shellMesh, ...wheels], 14);
      car.position.set(f.x, 0, f.z);
      car.rotation.y = 0.08;
      riot.add(car);
      halos.push({ at: [f.x, 95, f.z], size: 380, k: 0.5, color: SIGNAL, seed: 3.3, breathe: 0.1 });
      for (let t = 0; t < 7; t++) flames.push({ at: [f.x + lerp(-90, 80, t / 6) + (fr() - 0.5) * 20, 92, f.z + (fr() - 0.5) * 60], w: lerp(60, 90, fr()), h: lerp(150, 230, fr()), seed: fr() * 10, k: lerp(0.8, 1, fr()) });
    }
    // the light it throws: on the ground, on the nearest façade (and a little on the far one)
    pools.push({ centre: [f.x, 1.2, f.z], axes: [[300 * s, 0, 0], [0, 0, 300 * s]], color: SIGNAL, k: 0.22 });
    for (const side of [-1, 1]) {
      const dz = Math.abs(side * STREET.half - f.z);
      const k = (0.26 * s) / (1 + dz / 380);
      if (k < 0.03) continue;
      const hgt = 900 * Math.sqrt(s);
      pools.push({ centre: [f.x, hgt / 2, side * (STREET.half - 3)], axes: [[(f.i === 0 ? 520 : 950) * s, 0, 0], [0, hgt / 2, 0]], color: SIGNAL, k, wall: true });
    }
    // its smoke: slow, drifting up the street (−x), away from him
    const np = f.kind === "car" ? 12 : f.kind === "ember" ? 4 : Math.round(7 + 2 * s);
    for (let p = 0; p < np; p++) {
      puffs.push({ at: [f.x + (fr() - 0.5) * 50, f.kind === "ember" ? 0 : 60, f.z + (fr() - 0.5) * 50], seed: p / np + fr() * 0.05, rate: lerp(0.045, 0.065, fr()), size: lerp(0.8, 1.15, fr()) * Math.sqrt(s) * (f.kind === "ember" ? 0.6 : 1), height: f.kind === "ember" ? 0.5 : lerp(0.85, 1.15, fr()), drift: [-0.32, 0, -0.08] });
    }
    // its embers: a box above it, drifting up (kit makeMotes: they fade at the box's edges, never pop)
    const m = makeMotes({ count: Math.round(26 * s), seed: 7 + f.i, min: [f.x - 90 * s, 90, f.z - 90 * s], size: [180 * s, 380 * Math.sqrt(s), 180 * s], psize: [0.7, 2.0], color: BRAND.signal, drift: [-6, 46, -2] });
    m.points.renderOrder = 6;
    riot.add(m.points);
    motes.push(m);
  }
  A.fire = anchor(riot, FIRES[0].x, 120, FIRES[0].z);
  const fireFlames = makeFlames(flames);
  const fireHalos = makeHalos(halos);
  const firePools = makePools(pools);
  const smoke = makeSmoke(puffs);
  riot.add(smoke.mesh, firePools.mesh, fireFlames.mesh, fireHalos.mesh);

  let crowdMat;
  // the crowd: blurred silhouettes, far up the street — dark, a rim lit by the fires, some swaying (one mesh)
  {
    const variants = [];
    for (let v = 0; v < 3; v++) {
      const f = makeFigure({ shell: false });
      if (v === 1) {
        f.lean(4, -3, 10);
        f.reach("R", V(-24, 100, 8));
        f.leg("L", V(12, 8, 6), V(0, 0, 1), V(0.3, 0, 1));
      } else if (v === 2) {
        f.reach("L", V(8, 128, 14));
        f.reach("R", V(-8, 126, 14));
        f.lean(-2, 2, -12);
      } else {
        f.reach("L", V(21, 94, -4));
        f.leg("R", V(-11, 8, -5), V(0, 0, 1), V(-0.2, 0, 1));
      }
      variants.push(bakeFigure(f));
    }
    const geos = [];
    const placed = [];
    const cr = rng(260);
    let tries = 0;
    while (placed.length < RIOT.crowd.n && tries++ < 600) {
      const x = lerp(RIOT.crowd.x[0], RIOT.crowd.x[1], cr());
      const z = lerp(RIOT.crowd.z[0], RIOT.crowd.z[1], cr());
      if (FIRES.some((f) => Math.hypot(f.x - x, f.z - z) < 170 * f.s)) continue;
      if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 75)) continue;
      placed.push([x, z]);
      const g = variants[placed.length % 3].clone();
      const m = new THREE.Matrix4().compose(V(x, 0, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), (90 + (cr() - 0.5) * 100) * DEG), V(1, lerp(0.94, 1.06, cr()), 1));
      g.applyMatrix4(m);
      const count = g.attributes.position.count;
      const sway = new Float32Array(count * 3);
      const ph = cr() * TAU;
      const amp = cr() < 0.4 ? 0 : lerp(2, 5, cr());
      const fq = lerp(0.5, 0.9, cr());
      for (let i = 0; i < count; i++) sway.set([ph, amp, fq], i * 3);
      g.setAttribute("aSway", new THREE.BufferAttribute(sway, 3));
      geos.push(g);
    }
    crowdMat = new THREE.ShaderMaterial({
      uniforms: { uTime: TIME, uFog: FOG, uAmount: { value: 1 }, uRim: { value: INK.clone().lerp(SIGNAL, 0.55).multiplyScalar(0.3) }, uBase: { value: new THREE.Color(0x0c0a09) }, uFogColor: { value: BG.clone() } },
      vertexShader: /* glsl */ `
        attribute vec3 aSway; uniform float uTime;
        varying vec3 vN; varying vec3 vV; varying float vFogDepth;
        void main() {
          vec3 p = position;
          float sw = sin(uTime * aSway.z + aSway.x) * aSway.y * clamp(p.y / 170.0, 0.0, 1.0);
          p.x += sw; p.z += sw * 0.4;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vFogDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uRim, uBase, uFogColor; uniform float uAmount, uFog;
        varying vec3 vN; varying vec3 vV; varying float vFogDepth;
        void main() {
          float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
          vec3 col = uBase + uRim * pow(g, 1.5) * uAmount;
          float fogK = exp(-pow(uFog * vFogDepth, 2.0));
          gl_FragColor = vec4(mix(uFogColor, col, fogK), 1.0);
        }`,
    });
    const crowd = new THREE.Mesh(mergeGeometries(geos), crowdMat);
    crowd.frustumCulled = false;
    riot.add(crowd);
  }

  /* ═════════════ HIM (you, xray, wave, walk) — carry follows his trunk ═════════════ */
  const you = makeFigure({ shell: true, hands: "flat" });
  you.ghost(true); // glass from head to hands: only the vest is solid
  you.group.position.set(...YOU.at);
  you.group.rotation.y = YOU.turn * DEG;
  group.add(you.group);
  // his trunk gets its own glass: it gives way to the sculpted torso when `xray` comes up
  const trunk = you.torso.children[0];
  trunk.material = you.body.clone();
  asShell(trunk, 20);
  const carry = new THREE.Group();
  carry.name = "carry";
  carry.matrixAutoUpdate = false;
  group.add(carry);
  A.carry = carry;
  const torso = makeTorso();
  asShell(torso.mesh, 20);
  carry.add(torso.mesh);
  const cage = makeCage();
  carry.add(cage.mesh);
  // the point on the skin under the impact (where the wave starts)
  const skinX = -FRONT_K * halfAt(IMPACT[1]) * Math.sqrt(1 - (IMPACT[2] / halfAt(IMPACT[1])) ** 2);
  torso.mat.uniforms.uSkinHit.value.set(skinX, IMPACT[1], IMPACT[2]);
  cage.mat.uniforms.uHit.value.set(skinX, IMPACT[1], IMPACT[2]);
  A.head = anchor(carry, -1, BODY.head, 0);
  A.chest = anchor(carry, -9, 128, 0);
  A.belly = anchor(carry, skinX, IMPACT[1], IMPACT[2]);
  A.ribs = anchor(carry, -3, 124, 11);

  // his pose at rest: feet a little apart, the left hand on the back of his belt (elbow high and back), the right arm
  // along his side, a little behind (figure's own frame: front +z, his left +x)
  const REST = {
    handL: V(11, 111, -14), bendL: V(0.04, 0.22, -1),
    handR: V(-20.5, 92, -6), bendR: V(-0.35, -1, -0.25),
    ankleL: V(10, 8, 1.5), ankleR: V(-10, 8, -2),
  };
  const WALKP = { handL: V(20.5, 93, 3), bendL: V(0.35, -1, -0.1), handR: V(-20.5, 93, 3), bendR: V(-0.35, -1, -0.1) };
  const toeL = V(0.18, 0, 1);
  const toeR = V(-0.15, 0, 1);
  const FWD = V(0, 0, 1);
  const hL = V(0, 0, 0);
  const hR = V(0, 0, 0);
  const bL = V(0, 0, 0);
  const bR = V(0, 0, 0);
  const aL = V(0, 0, 0);
  const aR = V(0, 0, 0);
  const LEN = Math.hypot(WALK.to[0], WALK.to[2]);
  const YAW_END = Math.atan2(WALK.to[0], WALK.to[2]) / DEG; // the figure's facing once turned (≈ 87°)
  const mA = new THREE.Matrix4();
  const mB = new THREE.Matrix4();
  let lastWalk = -1;
  function poseWalk(w) {
    const turn = smooth(0, WALK.turn, w);
    const go = clamp01((w - WALK.turn) / (1 - WALK.turn));
    const g = smooth(0.01, WALK.turn, w); // the arms leave their rest pose while he turns
    const amp = smooth(0, 0.035, go) * (1 - smooth(0.975, 1, go));
    const dist = go * LEN;
    const ph = (dist / 140) * TAU;
    const sp = Math.sin(ph);
    const cp = Math.cos(ph);
    const shuffle = Math.sin(turn * Math.PI * 2);
    // legs: a pendulum walk (the stance foot all but planted), little steps while turning
    aL.set(lerp(REST.ankleL.x, 9, g), 8 + 6 * Math.max(0, cp) * amp + 3.5 * Math.max(0, shuffle) * (1 - amp), lerp(REST.ankleL.z, 0, g) + 22 * sp * amp);
    aR.set(lerp(REST.ankleR.x, -9, g), 8 + 6 * Math.max(0, -cp) * amp + 3.5 * Math.max(0, -shuffle) * (1 - amp), lerp(REST.ankleR.z, 0, g) - 22 * sp * amp);
    you.leg("L", aL, FWD, toeL);
    you.leg("R", aR, FWD, toeR);
    // arms: from the rest pose to a light swing
    hL.lerpVectors(REST.handL, WALKP.handL, g);
    hL.z -= 12 * sp * amp;
    hR.lerpVectors(REST.handR, WALKP.handR, g);
    hR.z += 12 * sp * amp;
    bL.lerpVectors(REST.bendL, WALKP.bendL, g);
    bR.lerpVectors(REST.bendR, WALKP.bendR, g);
    you.reach("L", hL, bL);
    you.reach("R", hR, bR);
    const pitch = 2.5 * amp;
    you.lean(pitch, 0, 0);
    const bob = -0.9 * (0.5 - 0.5 * Math.cos(2 * ph)) * amp;
    const px = WALK.to[0] * go;
    const pz = WALK.to[2] * go;
    const dyaw = (YAW_END - YOU.turn) * turn;
    you.group.position.set(px, bob, pz);
    you.group.rotation.y = (YOU.turn + dyaw) * DEG;
    // carry: the same motion for the vest — about him, then leaning from the hips
    mA.makeTranslation(px, bob, pz);
    mA.multiply(mB.makeRotationY(dyaw * DEG));
    mA.multiply(mB.makeTranslation(0, BODY.hip, 0));
    mA.multiply(mB.makeRotationZ(pitch * DEG));
    mA.multiply(mB.makeTranslation(0, -BODY.hip, 0));
    carry.matrix.copy(mA);
    carry.matrixWorldNeedsUpdate = true;
  }
  poseWalk(0);
  lastWalk = 0;

  /* ── the chute's ghost plate and ghost bullet (on the torso: in carry) ── */
  const wallMat = glass(BRAND.ink, { base: 0.025, rim: 0.32, power: 2, edge: 0.55, spec: 0.5 });
  const wallMesh = new THREE.Mesh(box(WALL.t, PANEL.h, PANEL.w, 0.2), wallMat);
  wallMesh.position.set(WALL.x - WALL.t / 2, PANEL.y, PANEL.z);
  asShell(wallMesh, 22);
  const wallEdges = edgesOf(wallMesh.geometry, { opacity: 0.6, width: 2 });
  wallMesh.add(wallEdges);
  carry.add(wallMesh);
  A.wall = anchor(carry, WALL.x - WALL.t, IMPACT[1], IMPACT[2]);
  const BL = BULLET.len;
  const bulletProfile = [[0, -BL / 2], [BULLET.d / 2, -BL / 2], [BULLET.d / 2, 0.05], [BULLET.d * 0.47, 0.3], [BULLET.d * 0.37, 0.53], [BULLET.d * 0.2, 0.7], [0, BL / 2]];
  const ghostMat = glass(BRAND.ink, { base: 0.05, rim: 0.55, power: 2, edge: 0.6, spec: 0.6 });
  const ghost = new THREE.Mesh(lathe(bulletProfile, 32), ghostMat);
  asShell(ghost, 22);
  const ghostG = new THREE.Group(); // its frame: the nose along +x
  ghost.rotation.z = -Math.PI / 2;
  ghostG.add(ghost);
  carry.add(ghostG);
  const ghostHalo = makeHalos([{ at: [0, 0, 0], size: 22, k: 0.9, color: INK, breathe: 0 }]);
  ghostG.add(ghostHalo.mesh);
  const CONTACT = V(WALL.x - WALL.t - BL / 2, IMPACT[1], IMPACT[2]); // the ghost's centre when its nose touches the plate
  const START = V(CONTACT.x - 150, CONTACT.y, CONTACT.z);
  const REB = [V(CONTACT.x - 30, CONTACT.y + 22, CONTACT.z + 12), V(CONTACT.x - 66, CONTACT.y + 42, CONTACT.z + 26), V(CONTACT.x - 96, CONTACT.y + 54, CONTACT.z + 36)];
  const inLen = CONTACT.x - START.x;
  const rebCurve = new THREE.CatmullRomCurve3([CONTACT, ...REB], false, "centripetal");
  const rebLen = rebCurve.getLength();
  const S_C = inLen / (inLen + rebLen);
  const trailMat = fineMat({ color: BRAND.ink, k: 1.0, trail: true, minW: 4.5 });
  trailMat.uniforms.uTail.value = 0.32;
  const trail = new THREE.Mesh(tubes([
    { pts: [START, V(lerp(START.x, CONTACT.x, 0.5), START.y, START.z), CONTACT], seg: 40, s0: 0, s1: S_C },
    { pts: [CONTACT, ...REB], seg: 48, s0: S_C, s1: 1 },
  ]), trailMat);
  trail.frustumCulled = false;
  trail.renderOrder = 8;
  carry.add(trail);
  const ringMat = new THREE.MeshBasicMaterial({ color: INK.clone().multiplyScalar(1.1), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 48), ringMat);
  ring.rotation.y = Math.PI / 2;
  ring.position.set(WALL.x - WALL.t - 0.05, IMPACT[1], IMPACT[2]);
  ring.renderOrder = 8;
  carry.add(ring);
  const tmpP = V(0, 0, 0);

  /* ═════════════ THE BENCH ═════════════ */
  const IY = IMPACT_BENCH[1];
  const IZ = IMPACT_BENCH[2];
  const CUT = IMPACT_BENCH[2]; // the section through the bench's impact
  const X0 = CLAY.face;
  const X1 = CLAY.face + CLAY.size[0];
  const Y0 = CLAY.centre[0] - CLAY.size[1] / 2;
  const Y1 = Y0 + CLAY.size[1];
  const Z0 = CLAY.centre[1] - CLAY.size[2] / 2;
  const Z1 = CLAY.centre[1] + CLAY.size[2] / 2;
  const clayG = new THREE.Group();
  clayG.name = "clay";
  group.add(clayG);
  const clayMat = solid(0x3b3833, { rough: 0.96, metal: 0, env: 0.3 });
  const capMat = solid(0x5c574f, { rough: 0.94, metal: 0, env: 0.3 });
  clayMat.userData.finish = false; // clay is pressed, not machined: no grain
  capMat.userData.finish = false;
  // the dented front face, in two halves (either side of the cut); the dent is written in place when `dent` moves
  const live = []; // [array, normals, index, prof, gy, gz]
  function frontFace(za, zb) {
    const ny = 122;
    const nz = Math.max(2, Math.round((zb - za) / 0.5));
    const pos = new Float32Array((ny + 1) * (nz + 1) * 3);
    const nor = new Float32Array((ny + 1) * (nz + 1) * 3);
    const idx = [];
    for (let j = 0; j <= ny; j++) {
      const y = Y0 + ((Y1 - Y0) * j) / ny;
      for (let k = 0; k <= nz; k++) {
        const z = za + ((zb - za) * k) / nz;
        const i = j * (nz + 1) + k;
        pos.set([X0, y, z], i * 3);
        nor.set([-1, 0, 0], i * 3);
        const r = Math.hypot(y - IY, z - IZ);
        if (r < CONE.R) {
          const e = 0.04;
          const dp = (coneProfile(r + e) - coneProfile(Math.max(0, r - e))) / (r + e - Math.max(0, r - e));
          const rr = Math.max(r, 1e-4);
          live.push([pos, nor, i, coneProfile(r), CONE.depth * dp * ((y - IY) / rr), CONE.depth * dp * ((z - IZ) / rr)]);
        }
        if (j < ny && k < nz) {
          const a = i;
          const b = i + 1;
          const c = i + nz + 1;
          const d = c + 1;
          idx.push(a, b, c, b, d, c);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geo.setIndex(idx);
    return geo;
  }
  const quad = (pts, n) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts.flat(), 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute([...n, ...n, ...n, ...n], 3));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    return g;
  };
  // the rest of each half: top, bottom, back, its outer side (no face on the cut: the cap is there)
  const halfRest = (za, zb, outer) => mergeGeometries([
    quad([[X0, Y1, za], [X0, Y1, zb], [X1, Y1, zb], [X1, Y1, za]], [0, 1, 0]),
    quad([[X0, Y0, za], [X1, Y0, za], [X1, Y0, zb], [X0, Y0, zb]], [0, -1, 0]),
    quad([[X1, Y0, za], [X1, Y1, za], [X1, Y1, zb], [X1, Y0, zb]], [1, 0, 0]),
    outer < 0
      ? quad([[X0, Y0, za], [X0, Y1, za], [X1, Y1, za], [X1, Y0, za]], [0, 0, -1])
      : quad([[X0, Y0, zb], [X1, Y0, zb], [X1, Y1, zb], [X0, Y1, zb]], [0, 0, 1]),
  ]);
  const frontNear = frontFace(Z0, CUT);
  const frontFar = frontFace(CUT, Z1);
  const near = new THREE.Group();
  near.add(new THREE.Mesh(frontNear, clayMat), new THREE.Mesh(halfRest(Z0, CUT, -1), clayMat));
  const far = new THREE.Group();
  far.add(new THREE.Mesh(frontFar, clayMat), new THREE.Mesh(halfRest(CUT, Z1, 1), clayMat));
  // the cap: the clay in section at z = CUT, its front edge the dent's own profile
  const NCAP = 244;
  const capPos = new Float32Array((NCAP + 1) * 2 * 3);
  const capIdx = [];
  const capY = [];
  for (let i = 0; i <= NCAP; i++) {
    const y = Y0 + ((Y1 - Y0) * i) / NCAP;
    capY.push(y);
    capPos.set([X0, y, CUT, X1, y, CUT], i * 6);
    if (i < NCAP) {
      const f0 = i * 2;
      const b0 = f0 + 1;
      const f1 = f0 + 2;
      const b1 = f0 + 3;
      capIdx.push(f0, b0, f1, b0, b1, f1);
    }
  }
  const capGeo = new THREE.BufferGeometry();
  capGeo.setAttribute("position", new THREE.BufferAttribute(capPos, 3));
  capGeo.setAttribute("normal", new THREE.Float32BufferAttribute(new Array((NCAP + 1) * 2).fill([0, 0, 1]).flat(), 3));
  capGeo.setIndex(capIdx);
  const cap = new THREE.Mesh(capGeo, capMat);
  // the edges: the whole block, or the near half with the dent's profile on its cut
  const edgeMat = lineMat(BRAND.ink, 2, { opacity: 0.5 });
  const boxEdges = (za, zb) => {
    const P = [];
    const e = (a, b) => P.push(...a, ...b);
    for (const y of [Y0, Y1]) {
      e([X0, y, za], [X0, y, zb]); e([X1, y, za], [X1, y, zb]); e([X0, y, za], [X1, y, za]); e([X0, y, zb], [X1, y, zb]);
    }
    e([X0, Y0, za], [X0, Y1, za]); e([X1, Y0, za], [X1, Y1, za]); e([X1, Y0, zb], [X1, Y1, zb]);
    return P;
  };
  const mkEdges = (P) => {
    const g = new LineSegmentsGeometry();
    g.setPositions(new Float32Array(P));
    const l = new LineSegments2(g, edgeMat);
    l.renderOrder = 2;
    return l;
  };
  const fullEdges = mkEdges([...boxEdges(Z0, Z1), X0, Y0, Z1, X0, Y1, Z1]);
  const halfEdges = mkEdges(boxEdges(Z0, CUT));
  const profile = liveLine(NCAP, BRAND.ink, 2.2, 0.75);
  clayG.add(near, far, cap, fullEdges, halfEdges, profile.line);
  let lastDent = -1;
  function writeDent(dent) {
    for (const [pos, nor, i, prof, gy, gz] of live) {
      pos[i * 3] = X0 + CONE.depth * dent * prof;
      const nx = -1;
      const ny = dent * gy;
      const nz = dent * gz;
      const l = Math.hypot(nx, ny, nz);
      nor[i * 3] = nx / l;
      nor[i * 3 + 1] = ny / l;
      nor[i * 3 + 2] = nz / l;
    }
    for (const g of [frontNear, frontFar]) {
      g.attributes.position.needsUpdate = true;
      g.attributes.normal.needsUpdate = true;
    }
    const a = profile.arr;
    for (let i = 0; i <= NCAP; i++) {
      const y = capY[i];
      const x = X0 + CONE.depth * dent * coneProfile(Math.abs(y - IY));
      capPos[i * 6] = x;
      if (i < NCAP) a.set([x, y, CUT + 0.08], i * 6);
      if (i > 0) a.set([x, y, CUT + 0.08], (i - 1) * 6 + 3);
    }
    capGeo.attributes.position.needsUpdate = true;
    profile.flush();
  }
  writeDent(0);
  lastDent = 0;
  A.clay = anchor(group, X0, IY, IZ);
  A.dent = anchor(group, X0 + CONE.depth, IY, IZ);

  // the depth gauge: a straight edge across the face, a graduated probe down into the dent along +x
  const gaugeG = new THREE.Group();
  gaugeG.name = "gauge";
  group.add(gaugeG);
  const steelMat = solid(0x8c867b, { rough: 0.45, metal: 0.4, env: 0.7 });
  const EDGE_Y = IY + 0.5 + 0.7;
  const edgeBar = new THREE.Group();
  const edgeNear = new THREE.Mesh(box(0.5, 1.4, GAUGE.edge / 2 + 0.6, 0.08), steelMat);
  edgeNear.position.z = -GAUGE.edge / 4 + 0.3;
  const edgeFar = new THREE.Mesh(box(0.5, 1.4, GAUGE.edge / 2 - 0.6, 0.08), steelMat);
  edgeFar.position.z = GAUGE.edge / 4 + 0.3;
  edgeBar.add(edgeNear, edgeFar);
  edgeBar.position.set(X0 - 0.25, EDGE_Y, IZ);
  gaugeG.add(edgeBar);
  const probeG = new THREE.Group(); // its origin is the probe's tip
  const probeMat = solid(0x34312c, { rough: 0.5, metal: 0.3, env: 0.7 });
  const probe = new THREE.Mesh(box(GAUGE.probe, 0.9, 0.5, 0.05), probeMat);
  probe.position.set(-GAUGE.probe / 2, 0, 0);
  probeG.add(probe);
  const ticks = [];
  for (let k = 1; k <= GAUGE.probe * 10 - 1; k++) {
    if (k === Math.round(GAUGE.mark * 10)) continue;
    const len = k % 10 === 0 ? 0.62 : k % 5 === 0 ? 0.42 : 0.26;
    const g = new THREE.PlaneGeometry(0.045, len);
    g.translate(-k * 0.1, 0.45 - len / 2, 0.26);
    g.deleteAttribute("uv");
    ticks.push(g);
  }
  const tickMat = glow(BRAND.ink, 0.9);
  const tickMesh = new THREE.Mesh(mergeGeometries(ticks), tickMat);
  probeG.add(tickMesh);
  const markMat = glow(BRAND.veille, 1.9);
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.8), markMat);
  mark.position.set(-GAUGE.mark, 0.45 - 0.4, 0.27);
  probeG.add(mark);
  probeG.position.set(X0, IY, IZ + 0.25);
  gaugeG.add(probeG);
  A.gauge = anchor(probeG, -GAUGE.mark, 0.1, 0.3);

  /* ── the comment's ghost blade (a kitchen knife of glass, its point 3 cm from the strike face) ── */
  const bladeG = new THREE.Group();
  bladeG.name = "blade";
  group.add(bladeG);
  const bladeMat = glass(BRAND.ink, { base: 0.02, rim: 0.45, power: 2, edge: 0.6, spec: 0.6, through: 0.2 });
  const bladeOutline = [[0, 0.12], [-3, 0.5], [-BLADE.len, 0.95], [-BLADE.len, -3.1], [-13, -3.05], [-8, -2.6], [-4, -1.55], [-1.5, -0.55]];
  const bladeGeo = plate(bladeOutline, 0.22, { bevel: 0.05 });
  bladeGeo.translate(0, 0, -0.11);
  const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
  const bolster = new THREE.Mesh(box(1.1, 4.4, 1.0, 0.2), bladeMat);
  bolster.position.set(-BLADE.len - 0.55, -1.05, 0);
  const handleGeo = plate([[-BLADE.len - 1.1, 0.85], [-BLADE.len - 12, 1.05], [-BLADE.len - 13, 0.1], [-BLADE.len - 12.4, -1.7], [-BLADE.len - 1.1, -2.3]], 1.5, { bevel: 0.35 });
  handleGeo.translate(0, 0, -0.75);
  const handle = new THREE.Mesh(handleGeo, bladeMat);
  asShell([bladeMesh, bolster, handle], 22);
  const bladeEdges = edgesOf(bladeGeo, { opacity: 0.55, width: 2 });
  const bladeTilt = new THREE.Group();
  bladeTilt.rotation.z = -BLADE.tilt * DEG;
  bladeTilt.add(bladeMesh, bolster, handle, bladeEdges);
  bladeG.add(bladeTilt);
  bladeG.position.set(...BLADE.tip);
  A.blade = anchor(group, ...BLADE.tip);

  /* ── the 045 teaser: a rocket of glass (two stages, fins), its charge along the body ── */
  const teaserG = new THREE.Group();
  teaserG.name = "teaser";
  group.add(teaserG);
  const rocketG = new THREE.Group();
  teaserG.add(rocketG);
  teaserG.position.set(...TEASER.at);
  const H = TEASER.h;
  const r = TEASER.r;
  const rocketMat = glass(BRAND.ink, { base: 0.03, rim: 0.8, power: 1.8, edge: 0.85, spec: 0.9, through: 0.15 });
  const bodyGeo = lathe([[0, 1.2], [3.6, 1.2], [2.0, 5.5], [r, 6.5], [r, H * 0.54], [r * 0.8, H * 0.585], [r * 0.8, H * 0.83], [r * 0.66, H * 0.89], [r * 0.42, H * 0.95], [r * 0.15, H * 0.99], [0, H]], 48, { crease: 28 });
  const rocketBody = new THREE.Mesh(bodyGeo, rocketMat);
  const fins = [];
  const finGeo = plate([[r - 0.3, 6.5], [r + 7.5, 0.2], [r + 7.5, 7.5], [r - 0.3, 22]], 0.5, { bevel: 0.12 });
  finGeo.translate(0, 0, -0.25);
  for (let k = 0; k < 4; k++) {
    const fin = new THREE.Mesh(finGeo, rocketMat);
    fin.rotation.y = (k * 90 + 45) * DEG;
    fins.push(fin);
  }
  rocketG.add(rocketBody, ...fins);
  asShell([rocketBody, ...fins], 22);
  const rocketEdges = edgesOf(bodyGeo, { opacity: 0.85, width: 2.5, threshold: 20 });
  rocketG.add(rocketEdges);
  // the charge: on the side the camera sees in VIEW.teaser (az −66), along both stages
  const chargeDir = V(Math.sin(-66 * DEG), 0, Math.cos(-66 * DEG));
  const chargePts = [];
  for (let k = 0; k <= 10; k++) {
    const y = lerp(8, H * 0.82, k / 10);
    const rr = (y < H * 0.54 ? r : r * 0.8) + 0.35;
    chargePts.push(V(chargeDir.x * rr, y, chargeDir.z * rr));
  }
  // (the interstage: the line steps in with the body)
  const chargeMat = fineMat({ color: BRAND.signal, k: 1.5, hot: 2.4, run: true, minW: 6 });
  const chargeMesh = new THREE.Mesh(tubes([{ pts: chargePts, seg: 60 }]), chargeMat);
  chargeMesh.frustumCulled = false;
  chargeMesh.renderOrder = 8;
  rocketG.add(chargeMesh);
  const rocketPool = makePool({ radius: 30, color: BRAND.ink }); // the halo under the rocket (retouche fin)
  rocketPool.mesh.position.y = 0.2;
  teaserG.add(rocketPool.mesh);
  A.teaser = anchor(rocketG, 0, H * 0.5, 0);
  A.charge = anchor(rocketG, chargeDir.x * (r + 0.35), H * 0.4, chargeDir.z * (r + 0.35));

  /* ═════════════ every frame ═════════════ */
  const setLines = (line, a) => {
    line.visible = a > 0.004;
    line.material.opacity = a;
  };
  const fadeSolid = (mats, a) => {
    for (const m of mats) {
      m.transparent = a < 0.999;
      m.opacity = a;
      m.depthWrite = a > 0.5;
    }
  };

  return {
    group,
    A,
    update(p, time, px) {
      TIME.value = time;
      if (px) FOCAL.value = px;

      /* the street */
      const shell = clamp01(p.shell ?? 0);
      street.visible = shell > 0.004;
      if (street.visible) {
        setLines(inkLines, shell);
        for (const { m, k } of facadeMats) m.uniforms.uAmount.value = shell * k;
        headMat.uniforms.uAmount.value = shell;
        windowMat.opacity = shell;
        coneMat.uniforms.uK.value = 0.045 * shell;
        lampLights.uniforms.uAmount.value = shell;
        lampFloor.uniforms.uAmount.value = shell;
      }

      /* the riot */
      const rt = clamp01(p.riot ?? 0);
      riot.visible = rt > 0.004;
      if (riot.visible) {
        setLines(hotLines, rt * (0.88 + 0.12 * Math.sin(time * 0.8)));
        binMat.uniforms.uAmount.value = Math.max(shell, rt) * 0.9;
        carMat.uniforms.uAmount.value = rt;
        fireFlames.uniforms.uAmount.value = rt;
        fireHalos.uniforms.uAmount.value = rt;
        firePools.uniforms.uAmount.value = rt;
        smoke.uniforms.uAmount.value = rt;
        crowdMat.uniforms.uAmount.value = rt;
        for (const m of motes) {
          m.uniforms.uAmount.value = rt * 0.85;
          m.update(time, px || FOCAL.value, 1 / 30);
        }
      }

      dress.update(p); // the dressing follows `shell` (stones, the bus shelter) and `riot` (the sky over the far end)
      /* him */
      const yu = clamp01(p.you ?? 0);
      const xr = clamp01(p.xray ?? 0);
      you.group.visible = yu > 0.004;
      you.body.uniforms.uAmount.value = yu;
      trunk.material.uniforms.uAmount.value = yu * (1 - xr);
      trunk.visible = yu * (1 - xr) > 0.004;
      const w = clamp01(p.walk ?? 0);
      if (w !== lastWalk) {
        poseWalk(w);
        lastWalk = w;
      }
      const out = clamp01(p.out ?? 0);
      const cone = Math.max(0, p.cone ?? 0);
      const wave = clamp01(p.wave ?? 0);
      const sec = clamp01(p.section ?? 0);
      torso.mesh.visible = yu * xr > 0.004;
      torso.mat.uniforms.uAmount.value = yu * xr;
      torso.mat.uniforms.uCone.value = cone;
      torso.mat.uniforms.uPushK.value = 1 - out;
      torso.mat.uniforms.uWave.value = wave;
      cage.mesh.visible = torso.mesh.visible;
      cage.mat.uniforms.uAmount.value = yu * xr;
      cage.mat.uniforms.uAmount2.value = yu * xr * smooth(0.5, 0.9, sec) * (1 - out);
      cage.mat.uniforms.uCone.value = cone * (1 - out);
      cage.mat.uniforms.uWave.value = wave;

      /* the ghost plate and its bullet */
      const wl = clamp01(p.wall ?? 0);
      wallMesh.visible = wl > 0.004;
      wallMat.uniforms.uAmount.value = wl;
      wallEdges.material.opacity = 0.6 * wl;
      const bo = clamp01(p.bounce ?? 0);
      const showGhost = wl > 0.004 && bo > 0.001 && bo < 0.999;
      ghostG.visible = showGhost;
      trail.visible = wl > 0.004 && bo > 0.001;
      ring.visible = wl > 0.004 && bo > 0.5 && bo < 0.66;
      if (trail.visible) {
        let s;
        if (bo <= 0.5) {
          const u = bo / 0.5;
          s = S_C * u;
          tmpP.lerpVectors(START, CONTACT, u);
          ghostG.rotation.set(0, 0, 0);
        } else {
          const u = (bo - 0.5) / 0.5;
          const e = 1 - (1 - u) * (1 - u) * 0.6 - 0.4 * (1 - u); // quick off the plate, slowing
          s = S_C + (1 - S_C) * clamp01(e);
          rebCurve.getPointAt(clamp01(e), tmpP);
          ghostG.rotation.set(0, 0.6 * e, 2.4 * e); // it tumbles back
        }
        ghostG.position.copy(tmpP);
        ghostMat.uniforms.uAmount.value = wl * (1 - smooth(0.9, 0.99, bo));
        ghostHalo.uniforms.uAmount.value = wl * (1 - smooth(0.9, 0.99, bo));
        trailMat.uniforms.uHead.value = s;
        trailMat.uniforms.uAmount.value = wl * (1 - smooth(0.85, 1, bo));
        const ru = clamp01((bo - 0.5) / 0.16);
        ring.scale.setScalar(0.6 + ru * 7);
        ringMat.opacity = wl * (1 - ru) * 0.8;
      }

      /* the bench: the clay, cut and dented */
      const cl = clamp01(p.clay ?? 0);
      clayG.visible = cl > 0.004;
      if (clayG.visible) {
        fadeSolid([clayMat, capMat], cl);
        const dent = clamp01(p.dent ?? 0);
        if (dent !== lastDent) {
          writeDent(dent);
          lastDent = dent;
        }
        const cut = sec >= 0.5;
        far.visible = !cut;
        fullEdges.visible = !cut;
        halfEdges.visible = cut;
        profile.line.visible = cut;
        edgeMat.opacity = 0.5 * cl;
        profile.line.material.opacity = 0.75 * cl;
      }
      const g = clamp01(p.gauge ?? 0);
      gaugeG.visible = g > 0.004;
      if (gaugeG.visible) {
        const u = smooth(0, 0.2, g);
        fadeSolid([steelMat, probeMat], u);
        tickMat.opacity = u;
        tickMat.transparent = true;
        edgeBar.position.x = X0 - 0.25 - 4 * (1 - u);
        edgeFar.visible = sec < 0.5;
        const depth = CONE.depth * clamp01(p.dent ?? 0) * smooth(0.2, 1, g);
        probeG.position.x = X0 + depth - 3 * (1 - u);
        const lit = smooth(0.93, 1, g) * smooth(0.9, 1, p.dent ?? 0);
        mark.visible = u > 0.05;
        markMat.color.copy(lit > 0.02 ? VEILLE : INK).multiplyScalar(lit > 0.02 ? 0.9 + 1.0 * lit : 0.9);
      }

      /* the blade: comes in, stops 3 cm short — never closer */
      const bl = clamp01(p.blade ?? 0);
      bladeG.visible = bl > 0.004;
      if (bladeG.visible) {
        const a = smooth(0, 0.5, bl);
        bladeMat.uniforms.uAmount.value = a;
        bladeEdges.material.opacity = 0.55 * a;
        bladeG.position.x = BLADE.tip[0] - 9 * (1 - smooth(0, 1, bl));
      }

      /* the rocket: comes up, then its charge lights from the bottom up and stays */
      const te = clamp01(p.teaser ?? 0);
      teaserG.visible = te > 0.004;
      if (teaserG.visible) {
        const u = smooth(0, 0.5, te);
        rocketG.position.y = -22 * (1 - u);
        rocketMat.uniforms.uAmount.value = u;
        rocketEdges.material.opacity = 0.85 * u;
        rocketPool.uniforms.uAmount.value = 0.3 * u;
        const head = smooth(0.5, 0.8, te);
        chargeMat.uniforms.uHead.value = head > 0 ? head : -1;
        chargeMat.uniforms.uAmount.value = u;
        chargeMesh.visible = te > 0.5;
      }
    },
  };
}
