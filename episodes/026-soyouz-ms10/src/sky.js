// DOSSIER 026 — Soyouz MS-10 : THE SKY, THE EARTH, THE DESCENT. Everything around the module (the origin) that is not
// the rocket, in the scene's frame: world.js adds `group` to the set and never turns it (docs/026-decors.md, sky.js).
//   · the dome, at infinity (007/src/jet.js, backdropMat): black above; the limb — the Earth's horizon at the angle the
//     altitude gives — a fine bright line under a thin band of pale air; under it the Earth, dark, hazier toward its rim,
//     its strata of cloud following its curve; close to the ground, the steppe: a flat ground, its grid (the 007's
//     levels, no shimmer), a flat horizon and the faint strata of the night over it
//   · the air going by (007, makeStreaks): fine ink streaks along the stack's axis, rare up high, dense in the fall
//   · the sheath of the fall: the shield's rim white-hot (a light that has a place), hot air rising along the module, a wake
//   · the parachute: riser, lines, a small extractor, the canopy (reefed, then full), glass with fine gores, its vent
//   · the last push: a short burst under the module, a ring of light on the steppe, its dust thrown out; the module set down
//   · the next file (027), far away at night: a road coming down a slope, two headlamps, then a short lit spur — the exit
//
// THE CURVE OF THE EARTH. In a vertical frame (≈ 20° wide) a true horizon hardly bends: seen from 93 km it sags by eight
// pixels across the picture. The Earth here is a studio model: its limb stays at the true depression the altitude gives
// (the angle of the horizon under the level), but the planet's centre leans toward where the camera looks (KAPPA), so
// that its limb is a tighter circle — it bends like the Earth on a photograph from orbit, more as one climbs. A camera
// that pans sees it as it would see a planet (the curve stays level, its top where it looks); the strata on the Earth
// are fixed in azimuth: they slide by. Nothing on it is ever measured on screen (`sources`: « maquette »).
//
// Three colours: ink is the world (the sky, the Earth, the air, the canopy, the burst, the road); signal is the heat of
// the fall (the threat); veille is the exit of the next file — the system of the 027.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, asShell, anchor, fatLine, lineMat } from "@kit/build3d.js";
import { makeContact, makeMotes } from "@kit/atmo.js";
import { DEG, EARTH, CHUTE, DM, TEASER } from "./plan.js";
import { dressSteppe } from "./habillage.js"; // the decorator: the steppe's tufts, the teaser's mountains

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const VIEWPORT = new THREE.Vector2(BRAND.W, BRAND.H);
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** The studio Earth: how far its centre leans toward where the camera looks (degrees), by altitude (km) — 0 on the
 *  ground, ≈ 32° at 50 km, 36° at 93 km. Its limb then sags by ≈ 35 px across a frame at 50 km, ≈ 55 px at 93 km. */
const KAPPA = { max: 36, scale: 25, top: 93 };
const kappaAt = (alt) => (KAPPA.max * DEG * (1 - Math.exp(-Math.max(alt, 0) / KAPPA.scale))) / (1 - Math.exp(-KAPPA.top / KAPPA.scale));
/** Where the steppe takes over from the Earth seen from high up (km). */
const LOW = [1.2, 5.0];

/* ───────────────────────────────────────────────────────────── the dome */

const R = EARTH.R.toFixed(1);
/**
 * The sky and the ground, drawn at infinity behind everything (copied from 007's backdropMat): nothing here is an object
 * the far plane could cut. The local vertical leans by `uPitch` (the dome turns about z). Up high, the limb and the
 * studio Earth (see THE CURVE above); close to the ground, the plane `uGround` cm under the module, where each ray of the
 * eye meets it — a grid whose every level leaves before its cells get too small to draw.
 */
const domeMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uInk: { value: INK.clone() },
      uPitch: { value: 0 }, // radians
      uGround: { value: -5e6 }, // cm: the ground under the module
      uKappa: { value: 0 }, // radians: how far the studio Earth's centre leans toward the camera
      uHigh: { value: 1 }, // 0 the steppe … 1 the Earth seen from high up
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position; // the dome follows the eye: the horizon stays far
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk;
      uniform float uPitch, uGround, uKappa, uHigh;
      varying vec3 vDir;
      const float HALF_PI = 1.5707963;
      vec3 lean(vec3 v) { float c = cos(uPitch), s = sin(uPitch); return vec3(c * v.x - s * v.y, s * v.x + c * v.y, v.z); }
      // one family of grid lines, a pixel and a half wide (007): thinner, they shimmer
      float lines(float q) {
        float w = max(fwidth(q) * 1.5, 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return 1.0 - smoothstep(0.0, w, d);
      }
      float level(vec2 p, float cell) {
        vec2 q = p / cell;
        vec2 fw = fwidth(q);
        float show = smoothstep(4.0, 16.0, 1.0 / max(max(fw.x, fw.y), 1e-5)); // pixels per cell: it leaves before it shimmers
        return show * max(lines(q.x), lines(q.y));
      }
      // a stratum of cloud over the flat horizon (007): it sinks toward it as one climbs
      float stratum(vec3 d, float az, float h, float height, float far, float width, float k1, float k2, float phase) {
        float wisp = smoothstep(0.35, 0.9, 0.5 + 0.5 * sin(az * k1 + phase) * sin(az * k2 + phase * 1.7));
        float x = (d.y - (height - h) / far) / width;
        return exp(-x * x) * wisp;
      }
      // a band of cloud on the Earth, "at" radians under the limb, never thinner than a pixel and a half; its wisps are
      // fixed in azimuth (integer frequencies: no seam behind the camera)
      float band(float e, float w, float az, float at, float width, float k1, float k2, float phase) {
        float wd = max(width, 1.5 * w);
        float x = (e - at) / wd;
        float wisp = smoothstep(0.2, 0.85, 0.5 + 0.5 * sin(az * k1 + phase) * sin(az * k2 + phase * 1.7));
        return exp(-x * x) * (width / wd) * (0.3 + 0.7 * wisp);
      }
      void main() {
        vec3 d = lean(normalize(vDir));
        vec3 eye = lean(cameraPosition);
        float hcm = max(eye.y - uGround, 1.0); // the eye above the ground
        float hk = hcm * 1e-5;
        float dip = atan(sqrt(2.0 * ${R} * hk + hk * hk) / ${R}); // the true depression of the horizon
        // where the camera looks, levelled (robust when it looks up or down: its up vector says it then)
        vec3 fw = lean(-vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]));
        vec3 up = lean(vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]));
        vec2 hv = fw.xz * length(fw.xz) - up.xz * fw.y;
        hv /= max(length(hv), 1e-5);
        // the studio Earth: its centre leans toward the camera, its limb's top stays at the true depression
        float kap = min(uKappa, 0.45 * (HALF_PI - dip));
        vec3 C = vec3(hv.x * sin(kap), -cos(kap), hv.y * sin(kap));
        float e = acos(clamp(dot(d, C), -1.0, 1.0)) - (HALF_PI - dip - kap); // radians from the limb: + the sky, − the Earth
        float w = max(fwidth(e), 1e-6);
        float az = atan(d.x, abs(d.z) < 1e-6 ? 1e-6 : d.z);
        float sky = smoothstep(-w, w, e);
        float earth = 1.0 - sky;
        float hi = uHigh;
        // (each side's light is computed on its own side of the limb only: an exponential of the other side is an
        // infinity, and nothing times an infinity is not a number — a slab of black)
        float es = max(e, 0.0);
        float ee = min(e, 0.0);

        // the limb: a fine bright line, a pixel and a half at least; the air over it: a thin pale band (thinner seen from
        // the steppe), and the faintest rise of light toward it — the black above is never a flat grey
        float s = max(0.8 * w, 0.00015);
        float limb = exp(-0.5 * e * e / (s * s)) * mix(0.34, 0.62, hi);
        float air = sky * (mix(0.12, 0.16, hi) * exp(-es / mix(0.0018, 0.0065, hi)) + mix(0.03, 0.022, hi) * exp(-es / mix(0.12, 0.3, hi)));

        // up high: the Earth, dark, hazier toward its rim, its strata of cloud following the curve
        float haze = 0.09 * exp(ee / 0.016) + 0.034 * exp(ee / 0.07);
        float clouds = band(ee, w, az, -0.0075, 0.0016, 9.0, 23.0, 0.6) * 0.11
          + band(ee, w, az, -0.021, 0.0038, 7.0, 17.0, 2.1) * 0.09
          + band(ee, w, az, -0.046, 0.0075, 5.0, 13.0, 4.0) * 0.07
          + band(ee, w, az, -0.092, 0.015, 4.0, 11.0, 5.3) * 0.05;
        float globe = earth * hi * (0.04 + haze + clouds);

        // close to the ground: the steppe — where the ray meets the plane, a grid fading far away (007's levels)
        float t = hcm / max(-d.y, 1e-4);
        vec2 p = eye.xz + d.xz * t;
        // (the brightest level wins: added up, the lines that four levels share would be four times too bright)
        float grid = max(max(level(p, 500.0) * 0.3, level(p, 2500.0) * 0.55), max(level(p, 12500.0) * 0.85, level(p, 62500.0)));
        float far = exp(-t / (260000.0 + 12.0 * hcm));
        float lift = smoothstep(1500.0, 12000.0, hcm);
        float steppe = earth * (1.0 - hi) * step(d.y, 0.0) * (grid * 0.105 * (1.0 + 1.3 * lift) + 0.01) * far;
        float strata = sky * (1.0 - hi) * (stratum(d, az, hcm, 30000.0, 500000.0, 0.0026, 9.0, 23.0, 0.6) * 0.06
          + stratum(d, az, hcm, 90000.0, 900000.0, 0.004, 7.0, 17.0, 2.1) * 0.045
          + stratum(d, az, hcm, 220000.0, 1500000.0, 0.006, 5.0, 13.0, 4.0) * 0.035);
        gl_FragColor = vec4(uInk * (limb + air + globe + steppe + strata), 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the air going by */

/**
 * The air going by (007's makeStreaks, turned to run along y). Each mote is drawn as the line it covers while the
 * shutter is open — its head bright, its tail gone — three pixels wide whatever its distance: a dot would hop, and a
 * mote near the lens would be a slab across the picture. `uTravel`: cm covered (+: the stack climbs, the air runs
 * down past it) · `uLen`: cm of streak, signed like the travel · `uShare`: how many of them are drawn (thin air: few).
 */
function makeStreaks({ count, seed, min, size, len, ref }) {
  const rand = rng(seed);
  const base = [];
  const seeds = [];
  const corner = [];
  const index = [];
  for (let i = 0; i < count; i++) {
    const p = [min[0] + rand() * size[0], min[1] + rand() * size[1], min[2] + rand() * size[2]];
    const s = [rand(), 0.3 + rand() * 0.7, rand()];
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
  const uniforms = {
    uTravel: { value: 0 }, uLen: { value: 0 }, uAmount: { value: 0 }, uShare: { value: 1 }, uRef: { value: ref }, uColor: { value: INK.clone() },
    uMin: { value: new THREE.Vector3(...min) }, uSize: { value: new THREE.Vector3(...size) }, uView: { value: VIEWPORT },
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
        uniform float uTravel, uLen, uAmount, uShare, uRef; uniform vec3 uMin, uSize; uniform vec2 uView;
        attribute vec3 aSeed; attribute vec2 aCorner; varying float vA; varying float vSide;
        void main() {
          float k = 0.6 + 0.4 * aSeed.x; // not all at one speed: that is the depth of the air
          vec3 p = position;
          p.y -= uTravel * k;
          p = uMin + mod(p - uMin, uSize);
          vec3 q = (p - uMin) / uSize;
          float inside = smoothstep(0.0, 0.12, q.x) * smoothstep(1.0, 0.88, q.x) * smoothstep(0.0, 0.1, q.y) * smoothstep(1.0, 0.9, q.y) * smoothstep(0.0, 0.12, q.z) * smoothstep(1.0, 0.88, q.z);
          vec4 a = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(p + vec3(0.0, uLen * k, 0.0), 1.0);
          vSide = aCorner.y;
          vA = 0.0;
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (aSeed.z < uShare && a.w > 40.0 && b.w > 40.0) {
            vec2 run = (b.xy / b.w - a.xy / a.w) * uView * 0.5;
            float l = length(run);
            vec2 n = l > 1e-3 ? vec2(-run.y, run.x) / l : vec2(0.0, 1.0);
            vec4 c = mix(a, b, aCorner.x);
            c.xy += n * aCorner.y * (3.0 / uView) * c.w;
            gl_Position = c;
            // (close to the lens a streak would be a slab: it is not drawn there; behind the header it melts into the black)
            float header = 1.0 - 0.7 * smoothstep(0.45, 0.62, c.y / c.w);
            vA = aSeed.y * inside * uAmount * (1.0 - aCorner.x) * smoothstep(8.0, 60.0, l) * clamp(uRef / c.w, 0.2, 1.0) * smoothstep(150.0, 600.0, min(a.w, b.w)) * header;
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA; varying float vSide;
        void main() { gl_FragColor = vec4(uColor * vA * (1.0 - abs(vSide)), 1.0); }`,
    }),
  );
  mesh.frustumCulled = false;
  return { mesh, uniforms, len };
}

/* ───────────────────────────────────────────────────────────── lights that have a place */

/**
 * A ball of light with no edge, always facing the eye (008's makeHead): a small white-hot heart, a soft body, a short
 * tail. `size`: its radius in centimetres, never under `min` nor over `max` pixels. `uCenter` is in the scene's frame.
 */
function makeGlow({ hue, heart = INK, size, min, max, core = 0.0045, body = 0.05, bodyGain = 0.4, tail = 0.012, tailGain = 0.16, heartGain = 2.4 }) {
  const uniforms = {
    uView: { value: VIEWPORT }, uCenter: { value: new THREE.Vector3() }, uHue: { value: hue.clone() }, uHeart: { value: heart.clone() },
    uSize: { value: size }, uMin: { value: min }, uMax: { value: max }, uAmount: { value: 0 },
  };
  const f = (x) => x.toFixed(5);
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
          float heart = exp(-r2 / ${f(core)});
          float body = exp(-r2 / ${f(body)}) * ${f(bodyGain)};
          float tail = ${f(tailGain)} / (1.0 + r2 / ${f(tail)}) * (1.0 - smoothstep(0.5, 1.0, sqrt(r2)));
          gl_FragColor = vec4((uHeart * heart * ${f(heartGain)} + uHue * (body + tail)) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return { mesh, uniforms, at: uniforms.uCenter.value };
}

/* ───────────────────────────────────────────────────────────── the sheath of the fall */

const HOT_VS = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying vec3 vP;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vP = position;
    gl_Position = projectionMatrix * mv;
  }`;
const HOT_HEAD = /* glsl */ `
  uniform vec3 uHot, uHeat, uInk; uniform float uAmount, uTime; uniform vec2 uSpan;
  varying vec3 vN; varying vec3 vV; varying vec3 vP;
  float facing() { return clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0); }`;
/** What each part of the heat does with its light (glsl bodies): `hot` white-hot, `heat` signal, `ink` the cooled air. */
const HOT_FS = {
  // the shock layer under the shield: a lens of plasma, white at its heart, signal at its rim
  cap: `
    float edge = pow(1.0 - facing(), 1.3);
    float r = clamp(length(vP.xz) / 119.0, 0.0, 1.0);
    vec3 col = mix(uHot, uHeat, smoothstep(0.3, 1.0, r)) * (0.12 + 0.6 * edge);`,
  // the hot air peeling off the rim and rising past the module, opening like a meteor's tail — its sheath along the
  // module, then its wake over it: bright only where the eye grazes it (never a veil over the module), filaments
  // running up along the flow, white at the rim, signal, then falling back to ink as it cools, gone into the black
  sheath: `
    float edge = pow(1.0 - facing(), 2.2);
    float up = clamp((vP.y - uSpan.x) / (uSpan.y - uSpan.x), 0.0, 1.0);
    float a = atan(vP.x, vP.z);
    float strands = 0.5 + 0.5 * sin(a * 11.0 + 1.9 * sin(a * 5.0 + vP.y * 0.006 + 0.8));
    float pulse = 0.7 + 0.3 * sin(vP.y * 0.03 - uTime * 11.0 + a * 3.0);
    vec3 hue = mix(mix(uHot, uHeat, smoothstep(0.0, 0.07, up)), uInk * 0.4, smoothstep(0.14, 0.5, up));
    float gone = 1.0 - smoothstep(180.0, 560.0, vP.y); // into the black before it can reach a header over the module
    vec3 col = hue * edge * pow(1.0 - up, 2.8) * (0.35 + 0.65 * strands) * pulse * 0.6 * gone;`,
  // the rim of the shield, white-hot: a tube of light (its heart where it faces the eye)
  rim: `
    vec3 col = uHot * pow(facing(), 2.4) * 1.25;`,
  // and the signal glow around it
  halo: `
    vec3 col = uHeat * pow(facing(), 1.8) * 0.34;`,
  // the last push: a cone of light fanning down from under the module, white at the shield, fading toward the ground
  burst: `
    float core = pow(facing(), 1.3);
    float u = clamp(-vP.y, 0.0, 1.0);
    vec3 col = mix(uHot, uInk * 0.8, smoothstep(0.0, 0.5, u)) * core * pow(1.0 - u, 1.6) * 0.7;`,
};
function hotMat(kind, span = [0, 1], { double = true } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: double ? THREE.DoubleSide : THREE.FrontSide,
    uniforms: {
      uAmount: { value: 0 }, uTime: { value: 0 }, uSpan: { value: new THREE.Vector2(...span) },
      uHot: { value: INK.clone().multiplyScalar(1.7) }, uHeat: { value: SIGNAL.clone().multiplyScalar(1.35) }, uInk: { value: INK.clone() },
    },
    vertexShader: HOT_VS,
    fragmentShader: `${HOT_HEAD}
      void main() {${HOT_FS[kind]}
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });
}
const turned = (profile, segments = 64) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);

/** The heat of the fall, around the module falling shield first (`heat` 0–1). Drawn before the glass (it shows through the module's walls). */
function makeHeat() {
  const group = new THREE.Group();
  // (r, y): from the shield's rim, opening as it rises past the module and over it — the sheath, then the wake
  const tail = [[116, -2], [122, 20], [132, 70], [146, 140], [164, 240], [186, 380], [208, 560], [228, 780], [244, 1000]];
  const cap = [[0, -30], [36, -28.5], [70, -23], [96, -13], [112, -2], [119, 8]];
  const mats = {
    cap: hotMat("cap"),
    sheath: hotMat("sheath", [-2, 1000]),
    rim: hotMat("rim", [0, 1], { double: false }),
    halo: hotMat("halo", [0, 1], { double: false }),
  };
  const add = (geo, mat, order) => {
    const m = new THREE.Mesh(geo, mat);
    m.renderOrder = order;
    m.frustumCulled = false;
    group.add(m);
    return m;
  };
  add(turned(tail, 96), mats.sheath, 6);
  add(turned(cap), mats.cap, 7);
  const rim = add(new THREE.TorusGeometry(113, 3.6, 12, 128), mats.rim, 8);
  const halo = add(new THREE.TorusGeometry(115, 15, 16, 128), mats.halo, 7);
  for (const ring of [rim, halo]) {
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 7;
  }
  const all = Object.values(mats);
  return {
    group,
    update(heat, time) {
      group.visible = heat > 0.005;
      if (!group.visible) return;
      const k = clamp01(heat);
      for (const mat of all) {
        mat.uniforms.uTime.value = time;
        mat.uniforms.uAmount.value = k;
      }
      // the rim is lit first, the tail grows out of the heat
      mats.rim.uniforms.uAmount.value = smooth(0, 0.35, k);
      mats.sheath.uniforms.uAmount.value = smooth(0.1, 1, k);
    },
  };
}

/* ───────────────────────────────────────────────────────────── the parachute */

/** A set of separate segments, drawn in screen pixels ([[a, b], …]). */
function segments(pairs, { color = BRAND.ink, width = 2, opacity = 0.6 } = {}) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(pairs.flat(2));
  const line = new LineSegments2(geo, lineMat(color, width, { opacity }));
  line.renderOrder = 3;
  line.frustumCulled = false;
  return line;
}
/** A canopy's profile ([r, y], skirt at y 0, vent on top): a dome a little tucked in at its skirt. */
function canopyProfile(r, depth, vent, n = 18) {
  const end = 98 * DEG;
  const a = r / Math.sin(end);
  const start = Math.asin(vent / a);
  const b = depth / (Math.cos(start) - Math.cos(end));
  return Array.from({ length: n + 1 }, (_, i) => {
    const phi = start + ((end - start) * i) / n;
    return [a * Math.sin(phi), b * (Math.cos(phi) - Math.cos(end))];
  });
}
/** The gores (meridians at every `step` of the lathe), the skirt's hem and the vent's ring of a canopy profile. */
function canopyLines(profile, gores, around = 96) {
  const pairs = [];
  for (let k = 0; k < gores; k++) {
    const a = (k * TAU) / gores;
    for (let i = 0; i < profile.length - 1; i++) {
      const [r0, y0] = profile[i];
      const [r1, y1] = profile[i + 1];
      pairs.push([[r0 * Math.sin(a), y0, r0 * Math.cos(a)], [r1 * Math.sin(a), y1, r1 * Math.cos(a)]]);
    }
  }
  for (const [r, y] of [profile[0], profile[profile.length - 1]]) {
    for (let j = 0; j < around; j++) {
      const a0 = (j * TAU) / around;
      const a1 = ((j + 1) * TAU) / around;
      pairs.push([[r * Math.sin(a0), y, r * Math.cos(a0)], [r * Math.sin(a1), y, r * Math.cos(a1)]]);
    }
  }
  return pairs;
}
/** A cone of lines from a point (the origin) to a ring of `n` points at height 1, radius 1: scaled (r, length, r) it fits any skirt. */
const fan = (n) => Array.from({ length: n }, (_, k) => [[0, 0, 0], [Math.sin((k * TAU) / n), 1, Math.cos((k * TAU) / n)]]);

const CANOPY = { r: CHUTE.r, depth: CHUTE.depth, vent: 40, gores: 24 };
const RISER = 150; // cm of riser between the module's top and where the lines meet
const LINES = CHUTE.lines - RISER; // cm of suspension lines, from there to the skirt
const PILOT = { r: 70, depth: 52, vent: 10, gores: 12, lines: 95, bridle: 40 };

/** The parachute (`chute` 0 → 1): the lines pay out behind a small extractor (→ 0.35), the canopy opens reefed, then full. */
function makeChute() {
  const group = new THREE.Group();
  group.position.set(...CHUTE.riser); // where the riser leaves the module
  const swing = new THREE.Group(); // what sways, very slowly, about that point
  group.add(swing);

  const riser = fatLine([[0, 0, 0], [0, 1, 0]], { width: 2.6, opacity: 0.8 });
  riser.frustumCulled = false;
  const lines = segments(fan(CANOPY.gores), { width: 1.9, opacity: 0.5 });
  lines.position.y = RISER;
  swing.add(riser, lines);

  const profile = canopyProfile(CANOPY.r, CANOPY.depth, CANOPY.vent);
  const canopyMat = glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.6, edge: 0.55, spec: 0.22, through: 0.3 });
  const canopy = new THREE.Mesh(turned(profile, CANOPY.gores * 2), canopyMat);
  canopy.frustumCulled = false;
  asShell([canopy], 16);
  const gores = segments(canopyLines(profile, CANOPY.gores), { width: 1.9, opacity: 0.42 });
  canopy.add(gores);
  swing.add(canopy);

  // the extractor that pulls it all out, and stays over the vent
  const pilot = new THREE.Group();
  const pilotProfile = canopyProfile(PILOT.r, PILOT.depth, PILOT.vent, 10);
  const pilotMat = glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.6, edge: 0.55, through: 0.25 });
  const pilotDome = new THREE.Mesh(turned(pilotProfile, PILOT.gores * 2), pilotMat);
  pilotDome.frustumCulled = false;
  pilotDome.position.y = PILOT.lines;
  asShell([pilotDome], 16);
  pilotDome.add(segments(canopyLines(pilotProfile, PILOT.gores, 48), { width: 1.9, opacity: 0.42 }));
  const pilotLines = segments(fan(PILOT.gores), { width: 1.8, opacity: 0.45 });
  pilotLines.scale.set(PILOT.r, PILOT.lines, PILOT.r);
  pilot.add(pilotDome, pilotLines);
  const bridle = fatLine([[0, 0, 0], [0, 1, 0]], { width: 1.9, opacity: 0.55 });
  bridle.frustumCulled = false;
  swing.add(pilot, bridle);

  const centre = anchor(swing, 0, RISER + LINES + CANOPY.depth / 2, 0);
  const parts = [riser, lines, canopy, pilot, bridle];
  const mainLines = [riser.material, lines.material, gores.material];
  const pilotLineMats = [bridle, pilotLines, ...pilotDome.children].filter((o) => o.material?.isLineMaterial).map((o) => o.material);
  const fade = (k, kPilot) => {
    canopyMat.uniforms.uAmount.value = k;
    pilotMat.uniforms.uAmount.value = kPilot;
    for (const mat of mainLines) mat.opacity = mat.userData.base * k;
    for (const mat of pilotLineMats) mat.opacity = mat.userData.base * kPilot;
  };

  return {
    group,
    centre,
    update(chute, time) {
      const c = clamp01(chute);
      const on = c > 0.004;
      for (const p of parts) p.visible = on;
      if (!on) return;
      const shown = smooth(0.004, 0.05, c);
      const pilotK = shown * (1 - smooth(0.72, 0.92, c)); // its work done, the extractor is let go: the canopy stands alone
      fade(shown, pilotK);
      pilot.visible = bridle.visible = pilotK > 0.004;
      const pay = smooth(0.02, 0.33, c); // the lines paid out
      const reef = smooth(0.35, 0.55, c); // the canopy opens, held narrow by its reefing line
      const full = smooth(0.6, 0.9, c); // the reefing line cut: full
      const breath = Math.sin(time * 2.2) * full; // it breathes, slowly
      const sx = lerp(lerp(0.055, 0.3, reef), 1, full) * (1 + 0.04 * Math.sin(Math.PI * smooth(0.82, 1, c))) * (1 + 0.016 * breath);
      const sy = lerp(lerp(1.55, 1.22, reef), 1, full) * (1 - 0.012 * breath);
      const riserLen = RISER * smooth(0.004, 0.06, c);
      riser.scale.set(1, Math.max(riserLen, 0.01), 1);
      const L = Math.max(LINES * pay, 0.01);
      const skirt = CANOPY.r * sx;
      lines.scale.set(Math.max(skirt, 0.01), L, Math.max(skirt, 0.01));
      lines.visible = pay > 0.002;
      canopy.position.y = RISER + L;
      canopy.scale.set(sx, sy, sx);
      // the extractor rides at the top of the bundle, then over the vent
      const apex = RISER + L + CANOPY.depth * sy;
      pilot.position.y = apex + lerp(30, PILOT.bridle, full);
      bridle.position.y = apex;
      bridle.scale.set(1, Math.max(pilot.position.y - apex, 0.01), 1);
      centre.position.y = RISER + L + (CANOPY.depth * sy) / 2;
      // a slow sway about the riser's foot, only once open
      swing.rotation.set(0.012 * Math.sin(time * 0.53 + 1) * full, 0, 0.018 * Math.sin(time * 0.71) * full);
    },
  };
}

/* ───────────────────────────────────────────────────────────── the last push, the ground */

/**
 * The steppe's dust thrown out from under the module (after makeMotes): each grain runs outward along its own ray,
 * looping, drawn as the line it covers while the shutter is open — slow streaks, lit by the burst.
 */
function makeDust({ count = 420, seed = 11, span = 480 } = {}) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = rand() * TAU; // its ray
    pos[i * 3 + 1] = 110 + rand() * 60; // where it starts, at the edge of the shield's shadow
    pos[i * 3 + 2] = 10 + Math.pow(rand(), 1.6) * 80; // how high it is thrown
    seeds[i * 4] = 150 + rand() * 240; // cm per second outward: slow streaks
    seeds[i * 4 + 1] = rand();
    seeds[i * 4 + 2] = 3 + Math.pow(rand(), 2) * 6; // cm across
    seeds[i * 4 + 3] = 0.35 + rand() * 0.65;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = {
    uTime: { value: 0 }, uAmount: { value: 0 }, uScale: { value: 1 }, uStreak: { value: 1 / 60 }, uSpan: { value: span },
    uColor: { value: INK.clone().multiplyScalar(2.0) }, uView: { value: VIEWPORT },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uAmount, uScale, uStreak, uSpan; uniform vec2 uView;
        attribute vec4 aSeed; varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
        void main() {
          float run = mod(aSeed.x * uTime + aSeed.y * uSpan, uSpan);
          float u = run / uSpan;
          vec3 dir = vec3(cos(position.x), 0.0, sin(position.x));
          vec3 p = dir * (position.y + run) + vec3(0.0, 3.0 + position.z * sin(3.1415927 * min(u * 1.3, 1.0)), 0.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vec4 c0 = projectionMatrix * mv;
          vec4 c1 = projectionMatrix * modelViewMatrix * vec4(p - dir * aSeed.x * uStreak, 1.0);
          vec2 run2 = c1.w > 0.0 && c0.w > 0.0 ? (c0.xy / c0.w - c1.xy / c1.w) * 0.5 * uView : vec2(0.0);
          float len = min(length(run2), 200.0);
          float size = aSeed.z * uScale / max(0.5, -mv.z);
          gl_PointSize = size + len;
          gl_Position = c0;
          gl_Position.xy -= (len > 0.5 ? normalize(run2) * len : vec2(0.0)) / uView * c0.w; // centred on its path
          vDir = len > 0.5 ? normalize(run2) : vec2(1.0, 0.0);
          vDot = size / (size + len);
          vHalf = 0.5 * (1.0 - vDot);
          vA = aSeed.w * uAmount * (1.0 - u) * smoothstep(0.0, 0.08, u) * sqrt(vDot);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
        void main() {
          vec2 q = gl_PointCoord - 0.5;
          q.y = -q.y;
          float along = max(abs(dot(q, vDir)) - vHalf, 0.0);
          float across = dot(q, vec2(-vDir.y, vDir.x));
          float d = length(vec2(along, across)) / (0.5 * vDot);
          gl_FragColor = vec4(uColor * pow(max(0.0, 1.0 - d), 2.0) * vA, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  return { points, uniforms };
}

/** The last push and the ground under the module: the burst, its ring of light, the dust thrown and the dust hanging, the contact. */
function makeLanding() {
  const group = new THREE.Group(); // at the origin: the module's base
  const ground = new THREE.Group(); // on the steppe, under the module (y = −alt · 1e5)
  group.add(ground);

  const flash = makeGlow({ hue: INK, size: 150, min: 22, max: 200, core: 0.006, body: 0.06, bodyGain: 0.4, tail: 0.02, tailGain: 0.16, heartGain: 2.0 });
  flash.at.set(0, -16, 0);
  // the ring of nozzles under the shield, firing: a ring of light, white at its heart
  const ringCore = hotMat("rim", [0, 1], { double: false });
  ringCore.uniforms.uHeat.value.copy(INK);
  const ringHalo = hotMat("halo", [0, 1], { double: false });
  ringHalo.uniforms.uHeat.value.copy(INK).multiplyScalar(1.1);
  const nozzles = new THREE.Group();
  for (const [geo, mat, order] of [[new THREE.TorusGeometry(DM.r * 0.7, 3.2, 12, 96), ringCore, 8], [new THREE.TorusGeometry(DM.r * 0.7, 13, 16, 96), ringHalo, 7]]) {
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = Math.PI / 2;
    m.renderOrder = order;
    m.frustumCulled = false;
    nozzles.add(m);
  }
  nozzles.position.y = -4;
  // and their short jets fanning down to the steppe
  const burstMat = hotMat("burst", [0, 1]);
  const burst = new THREE.Mesh(turned([[DM.r * 0.62, 0], [DM.r * 0.9, -0.3], [DM.r * 1.35, -0.75], [DM.r * 1.6, -1]], 48), burstMat);
  burst.position.y = -6;
  burst.renderOrder = 6;
  burst.frustumCulled = false;
  group.add(flash.mesh, nozzles, burst);

  // the light the burst throws on the steppe: a ring around the module's footprint
  const ringMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uAmount: { value: 0 }, uInk: { value: INK.clone() } },
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount; uniform vec3 uInk; varying vec2 vP;
      void main() {
        float r = length(vP);
        float ring = exp(-pow((r - 200.0) / 60.0, 2.0)) * 0.42 + exp(-r * r / (110.0 * 110.0)) * 0.22;
        gl_FragColor = vec4(uInk * ring * (1.0 - smoothstep(380.0, 560.0, r)) * uAmount, 1.0);
      }`,
  });
  const ring = new THREE.Mesh(new THREE.CircleGeometry(560, 96), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 2;
  ring.renderOrder = 4;
  const dust = makeDust();
  // what hangs in the air once the burst is over, settling
  const hang = makeMotes({ count: 170, seed: 13, min: [-650, 4, -650], size: [1300, 150, 1300], psize: [1.4, 3.8], color: BRAND.ink, drift: [0.8, -0.25, 0.5] });
  const contact = makeContact({ amount: 0 });
  contact.scale.set(340, 340, 1);
  contact.position.y = 0.6;
  ground.add(ring, dust.points, hang.points, contact);

  return {
    group,
    ground,
    update(retro, alt, chute, time, px) {
      const r = clamp01(retro);
      const gap = Math.max(alt, 0) * 1e5; // cm between the shield and the steppe
      ground.position.y = -gap;
      const near = 1 - smooth(500, 900, gap); // the ground close enough for the burst to reach it
      flash.uniforms.uAmount.value = r * 0.8;
      flash.mesh.visible = r > 0.003;
      ringCore.uniforms.uAmount.value = r;
      ringHalo.uniforms.uAmount.value = r;
      nozzles.visible = r > 0.003;
      burstMat.uniforms.uAmount.value = r * 0.38;
      burstMat.uniforms.uTime.value = time;
      burst.visible = r > 0.003;
      burst.scale.set(1, Math.max(Math.min(gap - 6, 70), 24), 1); // short jets: a skirt of light, not a beam
      ringMat.uniforms.uAmount.value = r * near;
      ring.visible = r * near > 0.003;
      dust.uniforms.uAmount.value = r * near;
      dust.uniforms.uTime.value = time;
      dust.uniforms.uScale.value = px;
      dust.points.visible = r * near > 0.003;
      const settle = (1 - smooth(0.0005, 0.0035, alt)) * smooth(0.5, 0.9, chute);
      hang.uniforms.uAmount.value = 0.12 * settle;
      hang.update(time, px, 1 / 60);
      hang.points.visible = settle > 0.01;
      const down = 1 - smooth(0, 0.003, alt);
      contact.material.uniforms.uAmount.value = 0.55 * down;
      contact.visible = down > 0.01;
    },
  };
}

/* ───────────────────────────────────────────────────────────── the next file */

/** The camera's far plane is 1.6 km: the teaser (3.8 km away) is built at NEAR and shrunk as much — the same angles seen from the module. */
const TEASER_NEAR = 140000;
/** The road (u to the right of someone at the module looking toward TEASER.az, v up, w away), true centimetres: it comes
 *  over the crest of a hill and runs down toward the plain; J is where the exit leaves it. */
const ROAD = [[-18000, 9000, 80000], [-14000, 8300, 56000], [-8000, 6500, 32000], [-2000, 4200, 10000], [4000, 2100, -10000], [8000, 1000, -24000], [11500, 350, -40000], [15000, 0, -60000]];
const JUNCTION = 5; // ROAD[5]
const RAMP = [[0, 0, 0], [3000, 500, -1500], [6000, 1300, -3000], [8500, 2000, -4000]]; // from J: it climbs
const LAMPS = { apart: 800, up: 150 }; // the two headlamps (cm, true scale): wider apart than a truck's, or they would be one dot

/** Far away at night (`truck`): a road down a slope, two headlamps coming down it (0 → 0.8), then a short lit spur — the exit (0.8 → 1). */
function makeTeaser() {
  const S = TEASER_NEAR / TEASER.far;
  const a = TEASER.az * DEG;
  const F = [Math.sin(a), 0, Math.cos(a)];
  const Rt = [-Math.cos(a), 0, Math.sin(a)];
  const at = (u, v, w) => new THREE.Vector3(((TEASER.far + w) * F[0] + u * Rt[0]) * S, v * S, ((TEASER.far + w) * F[2] + u * Rt[2]) * S);
  const group = new THREE.Group();

  // the hill: its skyline behind the road, a faint line
  const ridge = [];
  for (let u = -80000; u <= 34000; u += 4000) ridge.push(at(u, 10600 * Math.exp(-(((u + 18000) / 21000) ** 2)) + 500 * Math.sin(u / 8000) * Math.exp(-(((u + 18000) / 32000) ** 2)), 84000));
  const ridgeLine = fatLine(ridge.map((p) => p.toArray()), { width: 1.9, opacity: 0.3 });
  const road = new THREE.CatmullRomCurve3(ROAD.map((p) => at(...p)));
  const roadLine = fatLine(road.getPoints(64).map((p) => p.toArray()), { width: 2, opacity: 0.55 });
  for (const line of [ridgeLine, roadLine]) line.frustumCulled = false;
  group.add(ridgeLine, roadLine);

  // the exit: from J, climbing away from the road, veille — and its lamps lighting one by one
  const J = at(...ROAD[JUNCTION]);
  const ramp = new THREE.Group();
  ramp.position.copy(J);
  const rampPts = RAMP.map(([u, v, w]) => at(ROAD[JUNCTION][0] + u, ROAD[JUNCTION][1] + v, ROAD[JUNCTION][2] + w).sub(J));
  const rampLine = fatLine(rampPts.map((p) => p.toArray()), { color: BRAND.veille, width: 2.6, opacity: 0.95 });
  rampLine.frustumCulled = false;
  ramp.add(rampLine);
  const rampCurve = new THREE.CatmullRomCurve3(rampPts.map((p) => p.clone().add(J)));
  const lights = Array.from({ length: 5 }, (_, i) => {
    const g = makeGlow({ hue: VEILLE, heart: VEILLE, size: 400, min: 7, max: 9, core: 0.03, body: 0.14, bodyGain: 0.5, tail: 0.05, tailGain: 0.1, heartGain: 1.6 });
    rampCurve.getPointAt(0.12 + (0.86 * i) / 4, g.at);
    group.add(g.mesh);
    return g;
  });
  group.add(ramp);

  // the two headlamps
  const lamps = [-1, 1].map(() => {
    const g = makeGlow({ hue: INK, size: 900, min: 12, max: 14, core: 0.045, body: 0.13, bodyGain: 0.3, tail: 0.06, tailGain: 0.1, heartGain: 2.2 });
    group.add(g.mesh);
    return g;
  });
  const tJ = JUNCTION / (ROAD.length - 1);
  const on = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const centre = anchor(group, ...at(...ROAD[0]).toArray());

  return {
    group,
    centre,
    update(truck) {
      const k = clamp01(truck);
      group.visible = k > 0.001;
      if (!group.visible) return;
      const shown = smooth(0, 0.06, k);
      ridgeLine.material.opacity = ridgeLine.material.userData.base * shown;
      roadLine.material.opacity = roadLine.material.userData.base * shown;
      // no brakes: it gathers speed down the slope, and is still on the road when the exit lights
      const s = Math.pow(clamp01(k / 0.8), 1.35);
      const t = tJ * (0.02 + 0.95 * s);
      road.getPoint(t, on);
      road.getTangent(t, tangent);
      const side = Math.hypot(tangent.x, tangent.z) || 1;
      for (let i = 0; i < lamps.length; i++) {
        const sgn = i ? 1 : -1;
        lamps[i].at.set(on.x + (sgn * LAMPS.apart * S * -tangent.z) / side, on.y + LAMPS.up * S, on.z + (sgn * LAMPS.apart * S * tangent.x) / side);
        lamps[i].uniforms.uAmount.value = smooth(0, 0.05, k);
      }
      centre.position.copy(on);
      const exit = smooth(0.8, 0.96, k);
      ramp.visible = exit > 0.002;
      ramp.scale.setScalar(Math.max(exit, 0.002));
      for (let i = 0; i < lights.length; i++) lights[i].uniforms.uAmount.value = smooth(0.8 + 0.032 * i, 0.84 + 0.032 * i, k);
    },
  };
}

/* ───────────────────────────────────────────────────────────── the sky */

/**
 * buildSky() → { group, A, update(P, time, px) }
 *   group  around the module (the origin): the dome (at infinity), the streaks, the sheath, the parachute, the push and
 *          its dust, the teaser far away. world.js adds it to the scene, never turned (and never moved: the glows place
 *          themselves in the scene's frame).
 *   A      anchors: canopy (the centre of the canopy, as it opens), ground (the steppe under the module), truck (the headlamps)
 */
export function buildSky() {
  const group = new THREE.Group();

  const domeMaterial = domeMat();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), domeMaterial);
  dome.frustumCulled = false;
  dome.renderOrder = -50; // first: everything else is in front of it
  group.add(dome);

  // the air: close around the module (short streaks), and all along the stack (long ones)
  const streaks = [
    makeStreaks({ count: 140, seed: 7, min: [-1700, -1300, -1700], size: [3400, 3800, 3400], len: 900, ref: 1400 }),
    makeStreaks({ count: 190, seed: 9, min: [-7500, -7000, -7500], size: [15000, 13000, 15000], len: 3200, ref: 6000 }),
  ];
  for (const s of streaks) group.add(s.mesh);

  const heat = makeHeat();
  const chute = makeChute();
  const landing = makeLanding();
  const teaser = makeTeaser();
  group.add(heat.group, chute.group, landing.group, teaser.group);
  const dress = dressSteppe(); landing.ground.add(dress.ground); group.add(dress.group);

  const A = {
    canopy: chute.centre,
    ground: anchor(landing.ground, 0, 0, 0),
    truck: teaser.centre,
  };

  return {
    group, A,
    /** P = { alt, pitch, flown, airspeed, heat, chute, retro, truck } — seize fois par image : rien n'est alloué ici. */
    update(P, time = 0, px = 1000) {
      const alt = Math.max(0, P.alt ?? 0);
      const u = domeMaterial.uniforms;
      u.uPitch.value = (P.pitch ?? 0) * DEG;
      u.uGround.value = -alt * 1e5;
      u.uKappa.value = kappaAt(alt);
      u.uHigh.value = smooth(LOW[0], LOW[1], alt);

      // the air: its length follows |airspeed|, its sense its sign; thin up high (few), dense in the fall's heat
      const airspeed = P.airspeed ?? 0;
      const heatK = clamp01(P.heat ?? 0);
      const thin = smooth(5, 30, alt);
      const amount = smooth(0.02, 0.15, Math.abs(airspeed)) * lerp(0.55, 0.42, thin) * (1 + 0.35 * heatK);
      const share = clamp01(lerp(1, 0.32, thin) + 0.7 * heatK);
      const travel = (P.flown ?? 0) * 100;
      for (const s of streaks) {
        s.uniforms.uTravel.value = travel;
        s.uniforms.uLen.value = airspeed * s.len;
        s.uniforms.uAmount.value = amount;
        s.uniforms.uShare.value = share;
        s.mesh.visible = amount > 0.002;
      }

      heat.update(heatK, time);
      chute.update(P.chute ?? 0, time);
      landing.update(P.retro ?? 0, alt, P.chute ?? 0, time, px);
      teaser.update(P.truck ?? 0); // (it lives on the steppe at `alt` 0: its glows are placed in the scene's frame)
      dress.update(P, time, px);
    },
  };
}
