// DOSSIER 046 — Torchère : the FIRE and the GAS out of the tip. Centimetres, Y up, world coordinates (plan.js: the
// origin at the stack's foot, the tip's mouth at TIP.y1, the flame's root at FLAME.base).
//
//   the flare     a real volume, marched (after 042/feu.js): a white-hot mouth on the tip, a signal body that opens and
//                 rolls at the top, edges eaten by a turbulence that climbs, a top that dulls into an ember where the
//                 smoke is born. The wind lays it over the plant (−x), more and more as it climbs. `flare` 0.08 is the
//                 purge's tiny flame just over the mouth; 0.35 → 1 the swell of the first frame; 1 the giant flame.
//                 "The brightest wins" (MaxEquation): light over light stays signal. Everything bright fades into the
//                 black before the header (screen y < 450, gl_FragCoord): the labels keep their contrast.
//   the smoke     soot, never "the toxic gas": dark puffs born at the flame's top, rising and drifting with the wind,
//                 their belly lit by the fire under them (a signal rim), so they read on the dark.
//   the embers    streaks rising out of the flame (never points): the fire is alive from the first frame.
//   the pilots    three small veille flames on their nozzles round the tip (PILOT: the hero, then ±120°): a clear
//                 core, a veille body, a slow sway (never a blink), a soft halo that keeps them readable from far.
//                 `pilot` → 0: they shrink and die (the act does it in a quarter of a second).
//   the raw gas   a dead tip: grey mist pouring out of the mouth, over its rim, sinking toward the columns (heavier than
//                 air), with thin signal threads in it — "incolore", a gas that has nothing to do there. `raw` is both
//                 how much and how far it has gone.
//   the drip      the rain of fire (ghosts): burning drops falling from the flame to the ground, streaks.
//   the light     the flare lights what stands under it (a point light, signal, with the flame).
//
//   buildFlamme() → { group, A, update(P, time, px, eye) }
//   A      base (the flame's root) · crown (the giant flame's top) · pilot (the hero pilot) · cloud (where the raw gas sinks)
//   P      flare · smoke · pilot · raw · drip — all 0 → 1
//   eye    the camera's position (THREE.Vector3): the pilots turn to it
//
// `update` only writes uniforms and transforms (it is called for every instant of the shutter): no allocation.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { anchor } from "@kit/build3d.js";
import { FLAME, PILOT, TIP } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const VIEWPORT = new THREE.Vector2(BRAND.W, BRAND.H);
const TAU = Math.PI * 2;
const n = (x) => Number(x).toFixed(5);
const v3 = (c) => `vec3(${n(c.r)}, ${n(c.g)}, ${n(c.b)})`;
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Full light under 600 px from the top, black from 430 (the header ends at 410) — in gl_FragCoord (from the bottom). */
const HEAD = new THREE.Vector2(BRAND.H - 600, BRAND.H - 430);
/** The wind: it lays the flame and its smoke over the plant (−x). */
const LEAN = 0.2;
const WIND = -1;

/** The flame's height above its root (cm): 0.08 ≈ 85 cm (the purge's tiny flame) · 0.35 ≈ 5 m · 1 FLAME.len. */
const flameHeight = (f) => FLAME.len * (f < 0.1 ? 0.7 * f : 0.07 + 0.93 * Math.pow((f - 0.1) / 0.9, 0.85));
/** Its radius where it opens (before the roll at the top). */
const flameWidth = (f) => (f < 0.1 ? 10 + 150 * f : 25 + (FLAME.r - 25) * Math.pow((f - 0.1) / 0.9, 0.7));
/** Its radius at the mouth (the tip's opening, TIP.r ≈ 92). */
const mouthWidth = (f) => 16 + 66 * smooth(0.08, 0.5, f);

/** The three pilots: the hero (PILOT.at), then two more at ±120° round the tip's axis, same radius, same height. */
const PILOT_R = Math.hypot(PILOT.at[0], PILOT.at[2]);
const PILOT_A = Math.atan2(PILOT.at[2], PILOT.at[0]);
export const PILOTS = Array.from({ length: PILOT.count }, (_, k) => {
  const a = PILOT_A + (k * TAU) / PILOT.count;
  return [PILOT_R * Math.cos(a), PILOT.at[1], PILOT_R * Math.sin(a)];
});

const GLSL = /* glsl */ `
  const vec3 INK = ${v3(INK)}; const vec3 SIG = ${v3(SIGNAL)}; const vec3 VEI = ${v3(VEILLE)};
  const float TIPY = ${n(TIP.y1)};
  const float WIND = ${n(WIND)};
  // the raw gas, out of a dead tip: s 0 → 1 along its life; a, b its seeds
  vec3 rawAt(float s, vec4 a, vec4 b) {
    float ang = a.z * 6.28318;
    vec2 radial = vec2(cos(ang), sin(ang));
    float r0 = sqrt(a.w) * 70.0;
    float up = (35.0 + 55.0 * b.x) * (1.0 - exp(-s * 10.0)); // what is left of its push out of the pipe
    float fall = (1250.0 + 550.0 * b.y) * s * s; //              heavier than air: it sinks
    float spill = (40.0 + 160.0 * b.z) * sqrt(s) + 110.0 * s; // over the rim, outward
    vec2 lat = radial * (r0 + spill) + vec2(WIND, -0.38 + 0.3 * (b.w - 0.5)) * (1200.0 * (0.7 + 0.5 * b.w)) * pow(s, 1.5);
    lat += vec2(sin(s * 7.0 + a.x * 20.0), cos(s * 6.0 + a.y * 20.0)) * 45.0 * s;
    return vec3(lat.x, TIPY + 6.0 + up - fall, lat.y);
  }`;

/* ───────────────────────────────────────────────────────────── a block of tileable noise (three octaves in one tap) */

function noiseVolume(size, seed) {
  const rand = rng(seed);
  const ease = (t) => t * t * (3 - 2 * t);
  const lattice = (cells) => {
    const g = new Float32Array(cells * cells * cells);
    for (let i = 0; i < g.length; i++) g[i] = rand();
    const at = (x, y, z) => g[((x % cells) * cells + (y % cells)) * cells + (z % cells)];
    return (u, v, w) => {
      const x = u * cells, y = v * cells, z = w * cells;
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      const fx = ease(x - xi), fy = ease(y - yi), fz = ease(z - zi);
      const l = (p, q, t) => p + (q - p) * t;
      return l(
        l(l(at(xi, yi, zi), at(xi, yi, zi + 1), fz), l(at(xi, yi + 1, zi), at(xi, yi + 1, zi + 1), fz), fy),
        l(l(at(xi + 1, yi, zi), at(xi + 1, yi, zi + 1), fz), l(at(xi + 1, yi + 1, zi), at(xi + 1, yi + 1, zi + 1), fz), fy),
        fx,
      );
    };
  };
  const o1 = lattice(4), o2 = lattice(8), o3 = lattice(16);
  const data = new Uint8Array(size * size * size);
  let i = 0;
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x + 0.5) / size, v = (y + 0.5) / size, w = (z + 0.5) / size;
        const value = (o1(u, v, w) + 0.5 * o2(u, v, w) + 0.25 * o3(u, v, w)) / 1.75;
        data[i++] = Math.round(255 * clamp01(0.5 + (value - 0.5) * 2.1));
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

/* ───────────────────────────────────────────────────────────── 1 · the flare, marched */

const flameMat = (U, steps) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide, // the camera may stand inside its box (the tip, close)
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation, // light over light: the brightest wins, signal stays signal
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    defines: { STEPS: steps },
    uniforms: U,
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      precision highp float; precision highp sampler3D;
      ${GLSL}
      uniform sampler3D uNoise;
      uniform vec3 uBase, uBox0, uBox1;
      uniform vec2 uHead;
      uniform float uTime, uH, uR, uR0, uLean, uGain, uK, uScale, uSmall;
      varying vec3 vWorld;

      float tap(vec3 p) { return texture(uNoise, p).r; }

      // x: how much fire · y: how hot (0 a dull ember → 1 white)
      vec2 field(vec3 p) {
        float H = max(uH, 10.0);
        float h = p.y;
        float u = h / H;
        if (u < -0.03 || u > 1.42) return vec2(0.0);
        float uc = clamp(u, 0.0, 1.42);
        // the wind lays it over: its axis bends toward WIND, more and more as it climbs
        float cx = WIND * uLean * H * uc * uc;
        float grow = smoothstep(0.0, 0.45, uc);
        float roll = smoothstep(0.5, 1.0, uc);
        // the giant one rolls out at its top; the purge's tiny flame closes into a point
        float W = mix(uR0, uR, grow) * (1.0 + mix(0.5, -0.7, uSmall) * roll);
        vec2 q = vec2(p.x - cx, p.z);
        float r = length(q) / W;
        if (r > 2.0) return vec2(0.0);
        // the turbulence climbs: big billows, finer licks warped by them (scaled to the flame: the purge licks too)
        float sc = uScale;
        float big = tap(vec3(q.x * sc, h * sc - uTime * 0.3, q.y * sc) + vec3(0.13, 0.0, 0.57));
        float fine = tap(vec3(q.x * sc * 2.3, h * sc * 2.3 - uTime * 0.85, q.y * sc * 2.3) + vec3(0.71, 0.29, 0.05) + (big - 0.5) * 0.3);
        float amp = mix(0.32, 0.85, smoothstep(0.0, 0.7, uc)) * mix(1.0, 0.16, uSmall);
        float rr = r + (big - 0.5) * amp * 1.6 + (fine - 0.5) * mix(0.55, 0.14, uSmall);
        float shape = 1.0 - smoothstep(mix(0.74, 0.86, uSmall), 1.0, rr);
        float top = 1.0 - smoothstep(0.68, 1.06, u + (big - 0.5) * mix(0.5, 0.2, uSmall) + (fine - 0.5) * 0.32);
        float bottom = smoothstep(-0.03, 0.0, u);
        float dens = shape * top * bottom * mix(0.3 + 1.5 * fine * fine, 1.0, 0.6 * uSmall);
        // white only at the mouth and in a thin heart low in the body; signal in the body, streaked by the licks;
        // a dull ember at its edges and its top, where the smoke is born
        float mid = 1.0 - smoothstep(0.2, 1.1, rr);
        float licks = 0.35 + 1.3 * fine * fine + 0.3 * big;
        float T = min(mid * mix(0.98, 0.36, smoothstep(0.0, 0.75, uc)) * licks, 0.93);
        T = max(T, (1.0 - smoothstep(0.0, 18.0 + 0.05 * H, h)) * (1.0 - smoothstep(0.45, 1.0, rr)));
        T *= 1.0 - 0.55 * smoothstep(0.55, 0.95, u);
        return vec2(dens, clamp(T, 0.0, 1.0));
      }

      vec3 heat(float T) {
        vec3 c = mix(SIG * 0.08, SIG * 0.42, smoothstep(0.0, 0.12, T));
        c = mix(c, SIG * 1.0, smoothstep(0.12, 0.42, T));
        c = mix(c, SIG * 1.28, smoothstep(0.45, 0.7, T));
        return mix(c, INK * 1.85, smoothstep(0.8, 0.97, T)); // (a narrow step: the white replaces the orange, no pink band)
      }

      void main() {
        vec3 ro = cameraPosition - uBase;
        vec3 rd = normalize(vWorld - cameraPosition);
        vec3 d = mix(rd, vec3(1e-5), step(abs(rd), vec3(1e-5)));
        vec3 a = (uBox0 - ro) / d, b = (uBox1 - ro) / d;
        vec3 lo = min(a, b), hi = max(a, b);
        float ta = max(max(lo.x, lo.y), max(lo.z, 0.0));
        float tb = min(min(hi.x, hi.y), hi.z);
        if (tb <= ta) discard;
        float ds = (tb - ta) / float(STEPS);
        // a different offset at every instant of the shutter: the steps melt into one another
        float j = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))) + fract(uTime * 7.31));
        vec3 col = vec3(0.0);
        float tr = 1.0;
        for (int i = 0; i < STEPS; i++) {
          vec3 p = ro + rd * (ta + (float(i) + j) * ds);
          vec2 f = field(p);
          if (f.x > 0.003) {
            float al = 1.0 - exp(-f.x * uK * ds);
            col += tr * al * heat(f.y);
            tr *= 1.0 - al;
            if (tr < 0.03) break;
          }
        }
        float fade = 1.0 - smoothstep(uHead.x, uHead.y, gl_FragCoord.y);
        gl_FragColor = vec4(col * (uGain * fade), 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── 2 · puffs: the smoke, the raw gas's mist */

/** Camera-facing quads placed in the shader from a seed and the time. MODE 0: soot off the flame's top · 1: raw gas. */
function makePuffs({ count, seed, mode, noise, uTime }) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(12), 3));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute([-1, -1, 1, -1, -1, 1, 1, 1], 2));
  geo.setIndex([0, 1, 2, 2, 1, 3]);
  const a = new Float32Array(count * 4);
  const b = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    a.set([rand(), rand(), rand(), rand()], i * 4);
    b.set([rand(), rand(), rand(), rand()], i * 4);
  }
  geo.setAttribute("aA", new THREE.InstancedBufferAttribute(a, 4));
  geo.setAttribute("aB", new THREE.InstancedBufferAttribute(b, 4));
  geo.instanceCount = count;
  const uniforms = {
    uTime, uNoise: { value: noise }, uAmount: { value: 0 }, uAlive: { value: 0 }, uFire: { value: 0 },
    uR: { value: 100 }, uReach: { value: 0 }, uSrc: { value: new THREE.Vector3() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    defines: { MODE: mode },
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: /* glsl */ `
      ${GLSL}
      uniform float uTime, uAmount, uAlive, uFire, uR, uReach; uniform vec3 uSrc;
      attribute vec2 aCorner; attribute vec4 aA, aB;
      varying vec2 vQ, vN; varying float vA, vBelly; varying vec3 vSeed;
      void main() {
        vec3 c; float size;
        #if MODE == 0
          // soot: born at the flame's top, it climbs, slows, swells and drifts with the wind
          float life = 7.5 * (0.75 + 0.5 * aA.y);
          float age = fract(uTime / life + aA.x);
          float t = age * life;
          c = uSrc + vec3((aA.z * 2.0 - 1.0) * uR * 0.6, 0.0, (aA.w * 2.0 - 1.0) * uR * 0.6);
          c.y += (190.0 + 130.0 * aB.x) * t * (1.0 - 0.03 * t);
          c.x += WIND * (60.0 + 50.0 * aB.y) * t;
          c.x += 70.0 * sin(t * 0.6 + aB.z * 6.28) * age;
          c.z += 70.0 * cos(t * 0.5 + aB.w * 6.28) * age;
          size = mix(0.6, 2.5, sqrt(age)) * uR * (0.75 + 0.5 * aB.z);
          vA = uAmount * (0.6 + 0.4 * aB.w) * smoothstep(0.0, 0.1, age) * (1.0 - smoothstep(0.5, 1.0, age))
             * mix(uAlive, 1.0, smoothstep(0.06, 0.3, age)); // a flame that dies stops the new smoke; the old climbs on
          vBelly = uFire * (1.0 - smoothstep(0.02, 0.6, age));
        #else
          // the raw gas's mist: out of the mouth, over the rim, sinking toward the columns
          float life = 6.0 * (0.8 + 0.4 * aA.y);
          float s = fract(uTime / life + aA.x);
          c = rawAt(s, aA, aB);
          vec3 back = rawAt(max(s - 0.03, 0.0), aA, aB);
          size = mix(8.0, 200.0, pow(s, 0.85)) * (0.7 + 0.6 * aB.w);
          vA = uAmount * smoothstep(0.0, 0.05, s) * (1.0 - smoothstep(0.6, 1.0, s)) * (1.0 - smoothstep(uReach - 0.12, uReach, s));
          vBelly = 0.0;
        #endif
        float ang = aB.z * 6.2832 + uTime * 0.06 * (aB.x - 0.5);
        vN = mat2(cos(ang), sin(ang), -sin(ang), cos(ang)) * aCorner;
        vQ = aCorner;
        vSeed = vec3(aA.y, aB.x, aB.y);
        vec4 mv = viewMatrix * vec4(c, 1.0);
        #if MODE == 0
          mv.xy += aCorner * size;
        #else
          // a streak that widens: drawn along its own way (in the view), twice as long as it is wide
          vec2 run = mv.xy - (viewMatrix * vec4(back, 1.0)).xy;
          float rl = length(run);
          vec2 ax = rl > 1e-3 ? run / rl : vec2(0.0, 1.0);
          mv.xy += ax * (aCorner.x * size * mix(1.3, 2.4, smoothstep(0.0, 0.3, s))) + vec2(-ax.y, ax.x) * (aCorner.y * size * 0.7);
        #endif
        gl_Position = vA > 0.002 ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      precision highp float; precision highp sampler3D;
      ${GLSL}
      uniform sampler3D uNoise; uniform float uTime;
      varying vec2 vQ, vN; varying float vA, vBelly; varying vec3 vSeed;
      void main() {
        float r = length(vQ);
        if (r > 1.0 || vA < 0.002) discard;
        float nz = texture(uNoise, vec3(vN * 0.3 + vSeed.xy, vSeed.z + uTime * 0.015)).r;
        float edge = r + (nz - 0.5) * 0.6;
        float body = 1.0 - smoothstep(0.35, 0.92, edge);
        #if MODE == 0
          vec3 col = INK * (0.035 + 0.04 * nz);
          float under = smoothstep(-0.2, -0.95, vQ.y); // the fire under it lights its belly, a rim on its lower edge
          float rim = smoothstep(0.45, 0.85, edge);
          col += SIG * (0.5 * vBelly * under * (0.25 + 0.75 * rim));
          col += INK * (0.13 * smoothstep(0.0, 0.9, vQ.y) * rim); // the sky's light on its crown: a silhouette
          float al = body * vA * 0.94;
        #else
          vec3 col = INK * (0.4 + 0.2 * nz);
          float al = body * vA * 0.1;
        #endif
        gl_FragColor = vec4(col, clamp(al, 0.0, 0.95));
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── 3 · streaks: embers, the drip, the raw gas's threads */

/** Each streak is drawn from where it was a moment ago to where it is. MODE 0: embers · 1: the drip · 2: raw threads. */
function makeStreaks({ count, seed, mode, uTime }) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(12), 3));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute([0, -1, 0, 1, 1, -1, 1, 1], 2));
  geo.setIndex([0, 2, 1, 1, 2, 3]);
  const a = new Float32Array(count * 4);
  const b = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    a.set([rand(), rand(), rand(), rand()], i * 4);
    b.set([rand(), rand(), rand(), rand()], i * 4);
  }
  geo.setAttribute("aA", new THREE.InstancedBufferAttribute(a, 4));
  geo.setAttribute("aB", new THREE.InstancedBufferAttribute(b, 4));
  geo.instanceCount = count;
  const uniforms = {
    uTime, uAmount: { value: 0 }, uH: { value: 100 }, uR: { value: 100 }, uReach: { value: 0 },
    uBase: { value: new THREE.Vector3(0, FLAME.base, 0) }, uView: { value: VIEWPORT }, uHead: { value: HEAD },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    defines: { MODE: mode },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      ${GLSL}
      uniform float uTime, uAmount, uH, uR, uReach; uniform vec3 uBase; uniform vec2 uView;
      attribute vec2 aCorner; attribute vec4 aA, aB;
      varying vec2 vQ; varying float vGlow, vAge;
      #if MODE == 0
        vec3 at(float t) {
          // born in the flame's body, carried up by it, slowing, drifting with the wind
          // born at its skin, in its upper half: they leave it, they never sparkle inside it
          float ang = aA.z * 6.28318;
          float hb = (0.3 + 0.5 * aA.w) * uH;
          vec3 p = uBase + vec3(cos(ang) * uR * 1.05 + WIND * 0.2 * uH * (hb / max(uH, 1.0)), hb, sin(ang) * uR * 1.05);
          float v = 260.0 + 320.0 * aB.y;
          p.y += v * t * (1.0 - 0.18 * t);
          p.x += WIND * (90.0 + 60.0 * aB.z) * t + 30.0 * sin(t * 4.0 + aB.w * 9.0) * t;
          p.z += 30.0 * cos(t * 3.3 + aA.x * 9.0) * t;
          return p;
        }
      #elif MODE == 1
        vec3 p0() { return uBase + vec3((aA.z * 2.0 - 1.0) * uR * 0.8, 40.0 + aA.w * 320.0, (aB.x * 2.0 - 1.0) * uR * 0.8); }
        vec3 v0() { return vec3((aA.z * 2.0 - 1.0) * 220.0 + WIND * 60.0, 90.0 * aB.y, (aB.x * 2.0 - 1.0) * 220.0); }
        vec3 at(float t) { return p0() + v0() * t - vec3(0.0, 490.5 * t * t, 0.0); }
      #endif
      void main() {
        vec3 h, tl; float glow, age;
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        vQ = vec2(0.0); vGlow = 0.0; vAge = 0.0;
        #if MODE == 0
          float life = 1.6 + 1.6 * aA.y;
          age = fract(uTime / life + aA.x);
          float t = age * life;
          h = at(t); tl = at(max(t - 0.06, 0.0));
          glow = sin(3.14159 * age) * (0.7 + 0.5 * aB.w);
          float wpx = 2.2;
        #elif MODE == 1
          vec3 s0 = p0(), w0 = v0();
          float T = (w0.y + sqrt(w0.y * w0.y + 981.0 * 2.0 * max(s0.y, 1.0))) / 981.0;
          float P = T + 0.25 + 0.9 * aB.z;
          float t = mod(uTime + aA.x * P, P);
          if (t > T) return;
          age = t / T;
          h = at(t); tl = at(max(t - 0.13, 0.0));
          glow = smoothstep(0.0, 0.06, age) * (1.0 - 0.45 * age) * (0.7 + 0.5 * aB.w);
          float wpx = 3.2;
        #else
          float life = 6.0 * (0.8 + 0.4 * aA.y);
          age = fract(uTime / life + aA.x);
          h = rawAt(age, aA, aB); tl = rawAt(max(age - 0.05, 0.0), aA, aB);
          glow = smoothstep(0.0, 0.05, age) * (1.0 - smoothstep(0.55, 1.0, age)) * (1.0 - smoothstep(uReach - 0.12, uReach, age));
          float wpx = 1.6;
        #endif
        if (uAmount * glow < 0.003) return;
        vec4 ch = projectionMatrix * viewMatrix * vec4(h, 1.0);
        vec4 ct = projectionMatrix * viewMatrix * vec4(tl, 1.0);
        if (ch.w < 10.0 || ct.w < 10.0) return;
        vec2 ph = (ch.xy / ch.w * 0.5 + 0.5) * uView;
        vec2 pt = (ct.xy / ct.w * 0.5 + 0.5) * uView;
        float focal = 0.5 * uView.y * projectionMatrix[1][1];
        float w = clamp((0.6 + 0.6 * aB.w) * 3.0 * focal / ch.w, 1.0, wpx); // half its width, px (never under 2 px across)
        vec2 run = ph - pt;
        float l = length(run);
        vec2 dir = l > 0.5 ? run / l : vec2(0.0, 1.0);
        vec2 p = mix(pt, ph, aCorner.x) + dir * (aCorner.x * 2.0 - 1.0) * w + vec2(-dir.y, dir.x) * aCorner.y * w;
        gl_Position = vec4(p / uView * 2.0 - 1.0, ch.z / ch.w, 1.0);
        vQ = aCorner; vGlow = glow; vAge = age;
      }`,
    fragmentShader: /* glsl */ `
      ${GLSL}
      uniform float uAmount; uniform vec2 uHead;
      varying vec2 vQ; varying float vGlow, vAge;
      void main() {
        float across = 1.0 - vQ.y * vQ.y;
        float a = across * across * mix(0.25, 1.0, vQ.x) * vGlow * uAmount;
        #if MODE == 0
          vec3 c = mix(INK * 2.0, SIG * 1.7, smoothstep(0.05, 0.45, vAge));
        #elif MODE == 1
          vec3 c = mix(SIG * 1.8, INK * 2.0, 0.8 * smoothstep(0.6, 1.0, vQ.x));
        #else
          vec3 c = SIG * 0.85;
        #endif
        float fade = 1.0 - smoothstep(uHead.x, uHead.y, gl_FragCoord.y);
        gl_FragColor = vec4(c * (a * fade), 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── 4 · the pilots */

/** One pilot flame: a quad (x −1 → 1, y 0 → 1) turned to the eye about y; a clear core, a veille body. */
const pilotMat = (U, seed) =>
  new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uAmount: U.uAmount, uSize: U.uSize, uSeed: { value: seed } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending, // it sits on the fire: veille over signal, never a blend of both
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      ${GLSL}
      uniform float uTime, uAmount, uSize, uSeed;
      varying vec2 vP;
      void main() {
        float h = uSize * (0.86 + 0.06 * sin(uTime * 4.3 + uSeed * 5.0) + 0.035 * sin(uTime * 8.9 + uSeed * 2.0));
        float yy = vP.y / max(h, 0.04);
        if (yy > 1.0 || uAmount < 0.003) discard;
        float sway = (0.1 * sin(uTime * 3.1 + uSeed * 4.0) + 0.05 * sin(uTime * 7.7 + uSeed)) * yy * yy;
        float w = 0.92 * sin(3.14159 * pow(clamp(yy, 0.0, 1.0), 0.62));
        float d = abs(vP.x - sway) / max(w, 0.02);
        float inside = 1.0 - smoothstep(0.6, 1.0, d);
        float core = (1.0 - smoothstep(0.0, 0.55, d)) * (1.0 - smoothstep(0.1, 0.55, yy)) * smoothstep(0.0, 0.05, yy);
        vec3 col = VEI * mix(1.3, 0.85, smoothstep(0.45, 1.0, yy));
        col = mix(col, mix(VEI, INK, 0.7) * 1.7, core);
        gl_FragColor = vec4(col, clamp(inside * uAmount, 0.0, 1.0));
      }`,
  });

/** The halo round a pilot: a light that has a place (a bright core, a long tail), kept a few pixels wide from far. */
const haloMat = (U) =>
  new THREE.ShaderMaterial({
    uniforms: { uAmount: U.uAmount, uSizes: U.uHalo },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform vec3 uSizes;
      varying vec2 vQ;
      void main() {
        vQ = position.xy;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * uSizes.x;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${GLSL}
      uniform float uAmount;
      varying vec2 vQ;
      void main() {
        float r = length(vQ);
        float a = (exp(-r * r * 10.0) * 0.5 + exp(-r * 4.5) * 0.13) * (1.0 - smoothstep(0.75, 1.0, r));
        gl_FragColor = vec4(VEI * (a * uAmount), 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the whole */

export function buildFlamme() {
  const group = new THREE.Group();
  const noise = noiseVolume(64, 46);
  const uTime = { value: 0 };

  /* ── the flare ── */
  const FU = {
    uNoise: { value: noise }, uTime, uBase: { value: new THREE.Vector3(0, FLAME.base, 0) },
    uBox0: { value: new THREE.Vector3() }, uBox1: { value: new THREE.Vector3() }, uHead: { value: HEAD },
    uH: { value: 100 }, uR: { value: 40 }, uR0: { value: 30 }, uLean: { value: LEAN }, uGain: { value: 0 },
    uK: { value: 0.012 }, uScale: { value: 0.003 }, uSmall: { value: 1 },
  };
  const flare = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), flameMat(FU, 48));
  flare.frustumCulled = false;
  flare.renderOrder = 26;
  group.add(flare);

  /* ── its light on what stands under it ── */
  const light = new THREE.PointLight(BRAND.signal, 0, 5200, 0);
  light.position.set(0, FLAME.base + 300, 0);
  group.add(light);

  /* ── the smoke, the embers ── */
  const smoke = makePuffs({ count: 30, seed: 461, mode: 0, noise, uTime });
  smoke.mesh.renderOrder = 27;
  const embers = makeStreaks({ count: 44, seed: 462, mode: 0, uTime });
  embers.mesh.renderOrder = 28;
  group.add(smoke.mesh, embers.mesh);

  /* ── the raw gas ── */
  const mist = makePuffs({ count: 48, seed: 463, mode: 1, noise, uTime });
  mist.mesh.renderOrder = 24;
  const threads = makeStreaks({ count: 56, seed: 464, mode: 2, uTime });
  threads.mesh.renderOrder = 25;
  group.add(mist.mesh, threads.mesh);

  /* ── the drip ── */
  const drip = makeStreaks({ count: 150, seed: 465, mode: 1, uTime });
  drip.mesh.renderOrder = 28;
  group.add(drip.mesh);

  /* ── the pilots ── */
  const PU = { uTime, uAmount: { value: 1 }, uSize: { value: 1 }, uHalo: { value: new THREE.Vector3(40, 0, 0) } };
  const PW = PILOT.r * 1.2, PH = PILOT.r * 6; // the quad: half its width, its height (cm)
  const pilotGeo = new THREE.PlaneGeometry(2, 1).translate(0, 0.5, 0);
  const haloGeo = new THREE.PlaneGeometry(2, 2);
  const halo = haloMat(PU);
  const pilots = PILOTS.map((at, k) => {
    const m = new THREE.Mesh(pilotGeo, pilotMat(PU, 1.7 + k * 2.3));
    m.position.set(at[0], at[1] - 1, at[2]);
    m.scale.set(PW, PH, 1);
    m.renderOrder = 29;
    m.frustumCulled = false;
    const h = new THREE.Mesh(haloGeo, halo);
    h.position.set(at[0], at[1] + PH * 0.3, at[2]);
    h.renderOrder = 29;
    h.frustumCulled = false;
    group.add(m, h);
    return { m, h };
  });

  const A = {
    base: anchor(group, 0, FLAME.base, 0),
    crown: anchor(group, WIND * LEAN * FLAME.len * 0.9, FLAME.base + FLAME.len * 0.95, 0),
    pilot: anchor(group, PILOT.at[0], PILOT.at[1] + PH * 0.35, PILOT.at[2]),
    cloud: anchor(group, WIND * 520, TIP.y1 - 650, 0),
  };

  return {
    group, A,
    update(P, time, px, eye) {
      uTime.value = time;
      const f = clamp01(P.flare);
      // a living flame: it breathes slowly, never blinks
      const breath = 1 + 0.035 * Math.sin(time * 1.7) + 0.025 * Math.sin(time * 2.9 + 1.3);
      const H = flameHeight(f) * breath;
      const R = flameWidth(f);
      const R0 = Math.min(mouthWidth(f), R);
      const lean = LEAN * (1 + 0.15 * Math.sin(time * 0.37));

      /* the flare */
      flare.visible = f > 0.004;
      if (flare.visible) {
        const wm = Math.max(R0, R * 1.5) * 2.02;
        const reach = lean * H * 2.02; // how far the axis goes downwind at the box's top
        const x0 = -wm - (WIND < 0 ? reach : 0), x1 = wm + (WIND > 0 ? reach : 0);
        const y1 = H * 1.42 + 10;
        FU.uBox0.value.set(x0, -6, -wm);
        FU.uBox1.value.set(x1, y1, wm);
        flare.scale.set(x1 - x0, y1 + 6, 2 * wm);
        flare.position.set((x0 + x1) / 2, FLAME.base + (y1 - 6) / 2, 0);
        FU.uH.value = H;
        FU.uR.value = R;
        FU.uR0.value = R0;
        FU.uLean.value = lean;
        FU.uScale.value = 1 / (3.2 * R);
        FU.uK.value = 0.0075 * Math.min(3.5, Math.max(1, 180 / R));
        FU.uSmall.value = 1 - smooth(0.1, 0.4, f);
        FU.uGain.value = 1.1 * smooth(0, 0.03, f);
      }
      light.intensity = 1.6 * smooth(0.06, 0.6, f) * breath;
      light.position.set(WIND * lean * H * 0.25, FLAME.base + H * 0.3, 0);

      /* the smoke, the embers */
      const s = clamp01(P.smoke);
      smoke.mesh.visible = s > 0.003;
      smoke.uniforms.uAmount.value = s;
      smoke.uniforms.uAlive.value = smooth(0.12, 0.35, f);
      smoke.uniforms.uFire.value = smooth(0.1, 0.5, f);
      smoke.uniforms.uR.value = Math.max(R, 120);
      smoke.uniforms.uSrc.value.set(WIND * lean * H * 0.5, FLAME.base + H * 0.72, 0);
      const e = smooth(0.2, 0.6, f);
      embers.mesh.visible = e > 0.003;
      embers.uniforms.uAmount.value = e;
      embers.uniforms.uH.value = H;
      embers.uniforms.uR.value = R;

      /* the pilots */
      const pl = clamp01(P.pilot);
      const lit = pl > 0.003;
      PU.uAmount.value = smooth(0, 0.3, pl);
      PU.uSize.value = Math.pow(pl, 0.6);
      const ppx = px > 0 ? px : 1000;
      for (let k = 0; k < pilots.length; k++) {
        const { m, h } = pilots[k];
        m.visible = h.visible = lit;
        if (!lit || !eye) continue;
        const dx = eye.x - m.position.x, dy = eye.y - m.position.y, dz = eye.z - m.position.z;
        m.rotation.y = Math.atan2(dx, dz);
        if (k === 0) {
          // the halo: ≈ 3 radii of the flame, never under 11 px across its core (the hero's distance sizes all three)
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          PU.uHalo.value.x = Math.max(PILOT.r * 2.8, (11 * dist) / ppx) * (0.6 + 0.4 * PU.uSize.value);
        }
      }

      /* the raw gas */
      const w = clamp01(P.raw);
      const rawAmount = smooth(0, 0.25, w);
      mist.mesh.visible = threads.mesh.visible = rawAmount > 0.003;
      mist.uniforms.uAmount.value = rawAmount;
      mist.uniforms.uReach.value = 0.12 + w * 1.0;
      threads.uniforms.uAmount.value = rawAmount;
      threads.uniforms.uReach.value = 0.12 + w * 1.0;

      /* the drip */
      const dp = clamp01(P.drip);
      drip.mesh.visible = dp > 0.003;
      drip.uniforms.uAmount.value = dp;
      drip.uniforms.uR.value = Math.max(R, 120);
    },
  };
}
