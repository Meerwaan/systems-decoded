// DOSSIER L04 — who lives on the deck: your Rafale M, the next one, the parked ones, the hangar's, the tanker; the people
// of glass (your yellow dog, the deck crew, the cabin's engineer and operator, the landing officer); Pedro; and on the
// bench, the deck-plan table and the Forrestal's (1967).
//
//   buildBord() → { rafale, next, tanker, parked, liftPair, fleet, crew, pedro, board, forrestal, set(p, time, px) }
//     rafale   { group, A: { hook, cockpit, nozzles, holdback, tow, … }, update(p, time, px) } — YOUR aircraft. Its own
//              frame: origin on the deck under the NOSE-WHEEL axle, nose toward −z (plan.js · RAFALE). world.js places
//              and turns `group` every frame (plan.js · jetAt); A.hook is the hook's TIP (Andromède's bight follows it),
//              A.holdback the fitting on the nose gear the holdback bar hangs from, A.tow the end of the launch bar.
//              update p = { jet, pitch (degrees, nose up, around the main wheels), bank (degrees: > 0 starboard wing
//              down, < 0 port wing down — "à gauche"), gas, tremble, hook, bar, you, hud, night, onDeck, gear?, scrape? }
//     next     { group, update } — the next aircraft (world.js places it); update p = { jet, gas, night, gear? }
//     tanker   { group, update } — a tanker Rafale, its buddy pod, its hose and basket out (world.js places it beside you)
//     parked   Group in the ship's frame: the aircraft parked on deck at plan.js · PARK
//     liftPair Group: two aircraft on a lift's platform (origin at the platform's centre, on top: world.js hangs it there)
//     fleet    Group in the ship's frame: the aircraft asleep in the hangar (plan.js · HANGAR)
//     crew     { group (ship's frame), dog, lso, cabin: [Object3D, Object3D] } — `dog` stands at CREW.dog facing +z, `lso`
//              at LSO.at facing the aircraft that comes; the two cabin figures are re-parented by world.js onto the
//              cabin's seats (model.js): their origin is ON THE FLOOR between their feet, they face their +z, seated
//     pedro    { group } — in the ship's frame at PEDRO.at (it keeps station abeam, nose toward −z, its door open to port)
//     board, forrestal  Groups — bench items 1 and 3, at the bench's origin (world.js shows one). The tables are LONG
//              ALONG z (150 × 340 cm, the bow toward −z, as the ship seen from above)
//     set(p, time, px)  p = { place, item, night, next, parked, running, fleet, tanker, dog, sig, vest, crew, cabinCrew,
//              lso, lsoArm, paddles, pedro, zones, tokens, green, red, rocket, fire, burnt } — their meaning: FIRST in
//              world.js. Every key may be missing. Called sixteen times a frame: no allocation inside.
//
// THE AIRCRAFT is built the way 015's was (rafale.js: sections, `skin`, `aerofoil`, `patch` — itself 007's idiom), in
// that file's frame (nose +z, left wing +x, main wheels at z = 0, y = 0 under them), turned half a turn and moved by
// RAFALE.mains: 015's nose wheels (z = 530) land on our origin. A shell of glass and fine lines; SOLID only what the
// story is about: the legs and their wheels, the launch bar and the holdback fitting, the hook, the nozzles, the
// throttle and your left hand on it, your helmet. The others are a LIGHT version (one geometry for all, a few draws).
// Colours: the cores at full power are signal (the threat: the heat), the head-up display and the starboard light
// veille, the port light signal (port is red, starboard green: the film's two colours, for once, are the rule).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { makeContact, makePool } from "@kit/atmo.js";
import { solid, glow, setGlow, glass, asShell, lineMat, edgesOf, box, cyl, lathe, plate, anchor, makePart, addMesh, setPartOpacity, mergeGeometries, fatLine } from "@kit/build3d.js";
import { RAFALE, PARK, HANGAR, CREW, LSO, PEDRO, SHIP, ANGLED, ANGLED_DIR, ANGLED_RIGHT, ANGLED_YAW, CAT, ISLAND, LIFTS, onAngled } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const HOT = new THREE.Color(1, 0.42, 0.16); // the hottest a spark gets: still signal, never cream
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const TAU = Math.PI * 2;

/** The aircraft in numbers, in 015's frame (cm, degrees): nose +z, left wing +x, main wheels at z = 0 on y = 0. */
const M = {
  height: 534,
  nose: 850,
  tail: -685,
  main: { x: 128, r: 38, wide: 27 },
  front: { x: 12.5, z: RAFALE.mains, r: 27, wide: 16 }, // the twin nose wheels: on our origin
  // the hook: its hinge under the keel; `down` its stop below the axis; `sole` the throat's height when the shoe skims the deck
  hook: { pivot: [0, 164, -410], length: 211, down: 47, stowed: -1.5, sole: 12 },
  throttle: { x: 38, y: 229, from: 486, travel: 32 },
  stick: [-38, 226, 514],
  hips: [0, 220, 506],
  recline: 27,
};
const { main: MAIN, front: FRONT, hook: HOOK, throttle: THR } = M;
const CANOPY = { front: 612, arch: 540, rear: 352 };
/** 015's frame → ours: x → −x, z → RAFALE.mains − z. */
const FLIP = new THREE.Matrix4().makeTranslation(0, 0, RAFALE.mains).multiply(new THREE.Matrix4().makeRotationY(Math.PI));
const flipPt = (p) => [-p[0], p[1], RAFALE.mains - p[2]];

/* ───────────────────────────────────────────────────────────── shapes (the idiom of 007's jet.js, via 015) */

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

const AROUND = 64;
const SILL = 4;
const A0 = (2 * Math.PI * SILL) / AROUND;
const UPPER = 2 / 1.75;
const K = Math.sin(A0) ** UPPER;
const BODY = [
  [850, 1.5, 198, 202, 200.7], [825, 11, 189, 212, 204], [780, 23, 178, 225, 212], [720, 34, 168, 238, 223], [660, 42.5, 161, 248, 234],
  [612, 46, 158, 256, 243], [575, 48.5, 155, 281, 248], [540, 50, 153, 302, 251], [470, 52, 151, 322, 254], [410, 53.5, 150, 318, 256],
  [352, 54.5, 150, 306, 257], [300, 55, 150, 300, 258], [238, 55, 152, 296, 258], [150, 54, 156, 291, 256], [0, 52, 162, 284, 252],
  [-200, 48, 170, 274, 246], [-400, 40, 180, 262, 240], [-540, 28, 196, 250, 236], [-640, 10, 216, 236, 228], [-652, 1.5, 222, 226, 224.5],
];
const body = [1, 2, 3, 4].map((k) => spline(BODY.map((row) => [row[0], row[k]])));
const lowerN = spline([[850, 2], [720, 1.75], [320, 1.75], [120, 2.2], [-652, 2.2]]);
function section(z) {
  const [w, keel, crest, shoulder] = body.map((f) => f(z));
  const mid = (shoulder - K * crest) / (1 - K);
  return { z, w, mid, up: crest - mid, down: mid - keel, lower: 2 / lowerN(z) };
}
function onSection(s, a) {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  const e = sn >= 0 ? UPPER : s.lower;
  return [s.w * Math.sign(c) * Math.abs(c) ** e, s.mid + (sn >= 0 ? s.up : s.down) * Math.sign(sn) * Math.abs(sn) ** e, s.z];
}
const bodyRing = (z, n = AROUND) => {
  const s = section(z);
  return Array.from({ length: n }, (_, j) => onSection(s, (2 * Math.PI * j) / n));
};
const canopySurf = (zA, zB) => (u, v) => onSection(section(lerp(zA, zB, u)), A0 + (Math.PI - 2 * A0) * v);

const POD = [
  [345, 60, 27, 152, 200], [300, 62, 34, 150, 208], [200, 64, 40, 148, 216], [0, 64, 46, 148, 228],
  [-250, 60, 47, 152, 234], [-450, 52, 44, 158, 234], [-580, 46, 39, 160, 236], [-615, 45, 36, 163, 235],
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
const NOZZLE = { x: 45, y: 199, from: -612, r: 36.8, lip: 29.5 };
const WING = { root: [70, 208, 235, -470], tip: [530, 194, -276, -410] };
const CANARD = { root: [50, 246, 418, 262], tip: [212, 256, 272, 240] };
const FIN = { root: [240, 0, -217, -583], tip: [534, 0, -516, -621] };
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
  if (_a.x * p[0] + _a.y * (p[1] - 230) < 0) _a.negate();
  return [_a.x, _a.y, _a.z];
}
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

/** Position + normal only, never indexed: what lets any two geometries merge. */
const bare = (g, keepUv = false) => {
  const o = g.index ? g.toNonIndexed() : g.clone();
  for (const k of Object.keys(o.attributes)) if (k !== "position" && k !== "normal" && !(keepUv && k === "uv")) o.deleteAttribute(k);
  if (!o.attributes.normal) o.computeVertexNormals();
  return o;
};
const merge = (list, keepUv = false) => mergeGeometries(list.map((g) => bare(g, keepUv)));
/** A cylinder between two points (a strut of the light aircraft). */
const strutGeo = (a, b, r, seg = 10) => {
  const A = V(...a);
  const B = V(...b);
  const g = new THREE.CylinderGeometry(r, r, A.distanceTo(B), seg, 1, false);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, B.clone().sub(A).normalize()));
  g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
  return g;
};

/* ───────────────────────────────────────────────────────────── light that has a place */

/** A ball of light with no edge: brightest where it faces the eye, nothing at its rim. */
const softGlow = (power = 2.2) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uPower: { value: power } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * f, 1.0);
      }`,
  });

// The throat of a nozzle, seen from behind: a dark hole and a faint ember at rest; at full power a hard, bright core
// (its edge sharp, not a flame) and the heat falling off to the wall. One-sided.
const coreMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uGas: { value: 0 }, uAmount: { value: 1 }, uHot: { value: SIGNAL.clone().lerp(INK, 0.16).multiplyScalar(2.1) }, uCool: { value: SIGNAL.clone() } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot, uCool; uniform float uGas, uAmount; varying vec2 vUv;
      void main() {
        if (uAmount < 0.003) discard;
        float r = length(vUv - 0.5) * 2.0;
        float disc = 1.0 - smoothstep(0.93, 1.0, r);
        float ember = 0.025 + 0.07 * smoothstep(0.3, 0.9, r);
        float core = 1.0 - smoothstep(0.52, 0.6, r);
        float soft = pow(clamp(1.0 - r, 0.0, 1.0), 0.8);
        vec3 col = uCool * ember + (uHot * core + uCool * (0.14 + 0.6 * soft)) * uGas;
        gl_FragColor = vec4(col * disc * uAmount, 1.0);
      }`,
  });

// the heat behind a nozzle: brightest on its axis, dying along its length — a gradient, never a solid cone
const heatMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uAmount: { value: 0 }, uCore: { value: SIGNAL.clone().lerp(INK, 0.25).multiplyScalar(1.3) }, uColor: { value: SIGNAL.clone() } },
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
        if (uAmount < 0.003) discard;
        float f = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 1.6);
        float along = pow(clamp(1.0 - vU, 0.0, 1.0), 1.9) * smoothstep(0.0, 0.06, vU);
        gl_FragColor = vec4(mix(uCore, uColor, smoothstep(0.0, 0.35, vU)) * f * along * uAmount, 1.0);
      }`,
  });

/** Lines that fade away with the distance to the eye (cm): far, a fine line only crawls — the glass's lip carries the shape. */
function fadeFar(mat, near, far) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uFadeNear = { value: near };
    shader.uniforms.uFadeFar = { value: far };
    shader.vertexShader = "varying float vFadeZ;\n" + shader.vertexShader.replace("vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );", "vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );\n\t\t\tvFadeZ = -0.5 * ( start.z + end.z );");
    shader.fragmentShader =
      "varying float vFadeZ;\nuniform float uFadeNear, uFadeFar;\n" +
      shader.fragmentShader.replace("gl_FragColor = vec4( diffuseColor.rgb, alpha );", "gl_FragColor = vec4( diffuseColor.rgb, alpha * ( 1.0 - smoothstep( uFadeNear, uFadeFar, vFadeZ ) ) );");
  };
  mat.customProgramCacheKey = () => `fadeFar${near}-${far}`;
  return mat;
}

/** Navigation lights: points of light that keep a few pixels however far (a core and a halo, `aColor` each). */
const navMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uAmount: { value: 0 }, uSize: { value: 150 }, uMin: { value: 7 }, uH: { value: BRAND.H } },
    vertexShader: /* glsl */ `
      attribute vec3 aColor; uniform float uSize, uMin, uH; varying vec3 vC;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float px = uSize * projectionMatrix[1][1] * uH * 0.5 / max(-mv.z, 1.0);
        gl_PointSize = clamp(px, uMin, 90.0);
        vC = aColor;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount; varying vec3 vC;
      void main() {
        if (uAmount < 0.003) discard;
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float r = length(q);
        if (r > 1.0) discard;
        float core = 1.0 - smoothstep(0.16, 0.34, r);
        float halo = pow(clamp(1.0 - r, 0.0, 1.0), 2.4);
        gl_FragColor = vec4(vC * (core * 2.1 + halo * 0.5) * uAmount, 1.0);
      }`,
  });
/** Two points: the port wingtip (signal) and the starboard one (veille), in OUR frame. */
function navLights(material) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([...flipPt([541, 194, -282]), ...flipPt([-541, 194, -282])], 3));
  g.setAttribute("aColor", new THREE.Float32BufferAttribute([SIGNAL.r, SIGNAL.g, SIGNAL.b, VEILLE.r, VEILLE.g, VEILLE.b], 3));
  const pts = new THREE.Points(g, material);
  pts.frustumCulled = false;
  pts.renderOrder = 8;
  return pts;
}

/**
 * Streaks: thin lines that leave one point over and over, each drawn along its own way, long while it is fast,
 * dying as it goes (015's sparks). `dir`: a direction; the streaks fan around it. The width stays ≥ 2 px.
 */
function makeStreaks(count, seed, { spread = 1.3, reach = [34, 190], len = [4, 16], width = [0.7, 1.8], fall = 30, rise = 0, color = HOT.clone().multiplyScalar(2.3), speed = [0.22, 0.42] } = {}) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const dir = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  const spd = new Float32Array(count);
  const d = V();
  for (let i = 0; i < count; i++) {
    d.set((rand() - 0.5) * spread, 0.04 + rand() * 0.8, 0.4 + rand()).normalize();
    dir.set([d.x, d.y, d.z], i * 3);
    seeds.set([reach[0] + Math.pow(rand(), 1.3) * (reach[1] - reach[0]), len[0] + rand() * (len[1] - len[0]), rand(), width[0] + rand() * (width[1] - width[0])], i * 4);
    spd[i] = speed[0] + rand() * (speed[1] - speed[0]);
  }
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(dir, 3));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  geo.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(spd, 1));
  geo.instanceCount = count;
  const uniforms = { uAt: { value: V() }, uTime: { value: 0 }, uAmount: { value: 0 }, uScale: { value: 2200 }, uRes: { value: RES }, uColor: { value: color }, uFall: { value: fall }, uRise: { value: rise } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uScale, uFall, uRise; uniform vec2 uRes; uniform vec3 uAt; attribute vec3 aDir; attribute vec4 aSeed; attribute float aSpeed; varying vec2 vQ; varying float vA;
        void main() {
          float life = fract(aSeed.z + uTime * aSpeed);
          float fly = 1.0 - (1.0 - life) * (1.0 - life);
          vec3 c = uAt + aDir * aSeed.x * fly;
          c.y = max(uAt.y + 0.5, c.y - uFall * life * life + uRise * life);
          float h = aSeed.y * mix(1.0, 0.35, life);
          vec3 way = normalize(aDir + vec3(0.0, (uRise > 0.0 ? 0.9 : -0.9) * life, 0.0));
          vec4 a = projectionMatrix * modelViewMatrix * vec4(c - way * h, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(c + way * h, 1.0);
          vQ = position.xy;
          vA = pow(1.0 - life, 1.5) * smoothstep(0.0, 0.05, life);
          if (a.w < 1.0 || b.w < 1.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          vec2 run = (b.xy / b.w - a.xy / a.w) * uRes;
          float len = length(run);
          run = len > 1e-4 ? run / len : vec2(1.0, 0.0);
          vec4 p = position.x < 0.0 ? a : b;
          float wide = max(2.0, aSeed.w * uScale / p.w);
          p.xy += vec2(-run.y, run.x) * position.y * (wide / uRes) * p.w;
          gl_Position = p;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying vec2 vQ; varying float vA;
        void main() {
          if (uAmount < 0.003) discard;
          float a = (1.0 - vQ.y * vQ.y) * pow(clamp(1.0 - abs(vQ.x), 0.0, 1.0), 1.3);
          gl_FragColor = vec4(uColor * a * vA * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  mesh.visible = false;
  return { mesh, uniforms };
}

/** One ribbon of light between two points (uA tail → uB head), ≥ 2 px wide, brightest at its head. */
function makeRibbon(color, wide = 2.6) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const uniforms = { uA: { value: V() }, uB: { value: V(0, 0, 1) }, uAmount: { value: 0 }, uWide: { value: wide }, uRes: { value: RES }, uColor: { value: color } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform vec3 uA, uB; uniform float uWide; uniform vec2 uRes; varying vec2 vQ;
        void main() {
          vec4 a = projectionMatrix * modelViewMatrix * vec4(uA, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(uB, 1.0);
          vQ = position.xy;
          if (a.w < 1.0 || b.w < 1.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          vec2 run = (b.xy / b.w - a.xy / a.w) * uRes;
          float len = length(run);
          run = len > 1e-4 ? run / len : vec2(1.0, 0.0);
          vec4 p = position.x < 0.0 ? a : b;
          p.xy += vec2(-run.y, run.x) * position.y * (uWide / uRes) * p.w;
          gl_Position = p;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying vec2 vQ;
        void main() {
          if (uAmount < 0.003) discard;
          float head = pow(clamp(0.5 + 0.5 * vQ.x, 0.0, 1.0), 2.2);
          gl_FragColor = vec4(uColor * (1.0 - vQ.y * vQ.y) * head * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  mesh.visible = false;
  return { mesh, uniforms };
}

/** The head-up display: a pane of veille glass with a few symbols, every stroke at least 1.8 px wide. `uSize` in cm. */
const hudMat = (w, h) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uAmount: { value: 0 }, uColor: { value: VEILLE.clone() }, uSize: { value: new THREE.Vector2(w, h) } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount; uniform vec3 uColor; uniform vec2 uSize; varying vec2 vUv;
      float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a; vec2 ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * h); }
      void main() {
        if (uAmount < 0.003) discard;
        vec2 p = (vUv - 0.5) * uSize;
        float aa = max(max(fwidth(p.x), fwidth(p.y)), 1e-4); // cm per pixel
        float w = max(0.06, 0.95 * aa);
        float d = 1e3;
        // the flight-path marker: a ring, two wings, a fin
        vec2 m = vec2(0.0, -0.8);
        d = min(d, abs(length(p - m) - 0.75));
        d = min(d, seg(p, m + vec2(-2.1, 0.0), m + vec2(-0.75, 0.0)));
        d = min(d, seg(p, m + vec2(0.75, 0.0), m + vec2(2.1, 0.0)));
        d = min(d, seg(p, m + vec2(0.0, 0.75), m + vec2(0.0, 1.5)));
        // the horizon, broken in the middle
        d = min(d, seg(p, vec2(-6.6, 1.4), vec2(-2.6, 1.4)));
        d = min(d, seg(p, vec2(2.6, 1.4), vec2(6.6, 1.4)));
        // one rung of the pitch ladder below (the glide path), its ends turned up
        d = min(d, seg(p, vec2(-4.4, -3.6), vec2(-1.8, -3.6)));
        d = min(d, seg(p, vec2(1.8, -3.6), vec2(4.4, -3.6)));
        d = min(d, seg(p, vec2(-4.4, -3.6), vec2(-4.4, -3.0)));
        d = min(d, seg(p, vec2(4.4, -3.6), vec2(4.4, -3.0)));
        // the heading scale: five ticks, wide apart
        for (int i = -2; i <= 2; i++) { float x = float(i) * 1.9; d = min(d, seg(p, vec2(x, 4.6), vec2(x, i == 0 ? 3.7 : 4.15))); }
        // the speed and altitude boxes
        vec2 q = abs(p - vec2(-5.9, -0.8)) - vec2(1.05, 0.5); d = min(d, abs(max(q.x, q.y)));
        q = abs(p - vec2(5.9, -0.8)) - vec2(1.05, 0.5); d = min(d, abs(max(q.x, q.y)));
        float line = 1.0 - smoothstep(w, w + aa, d);
        // the pane itself: a faint tint and a lip
        vec2 e = abs(vUv - 0.5) * uSize - 0.5 * uSize + 0.15;
        float lip = 1.0 - smoothstep(w, w + aa, abs(max(e.x, e.y)));
        gl_FragColor = vec4(uColor * (line * 1.5 + 0.02 + lip * 0.18) * uAmount, 1.0);
      }`,
  });

/** Fade a solid material (MeshStandard and the like), the way setPartOpacity does. */
function fadeMat(mat, a) {
  mat.opacity = mat.userData.base * a;
  const transparent = mat.userData.transparent || a < 0.999;
  if (mat.transparent !== transparent) {
    mat.transparent = transparent;
    mat.needsUpdate = true;
  }
  mat.depthWrite = mat.userData.depthWrite && a > 0.55;
}

/* ───────────────────────────────────────────────────────────── YOUR aircraft */

function buildHero() {
  const group = new THREE.Group(); // our frame: origin on the deck under the nose-wheel axle, nose toward −z
  const tilt = new THREE.Group(); // pitches around the main wheels' axle
  tilt.position.set(0, MAIN.r, RAFALE.mains);
  const roll = new THREE.Group(); // banks around the aircraft's axis, and trembles
  roll.position.set(0, 215 - MAIN.r, 0);
  const body0 = new THREE.Group();
  body0.position.set(0, -215, -RAFALE.mains);
  const flip = new THREE.Group(); // 015's frame
  flip.matrixAutoUpdate = false;
  flip.matrix.copy(FLIP);
  const plane = new THREE.Group();
  group.add(tilt);
  tilt.add(roll);
  roll.add(body0);
  body0.add(flip);
  flip.add(plane);
  const fx = {};
  const A = {};

  const parts = [];
  const newPart = (name, parent = plane) => {
    const p = makePart(name);
    parent.add(p);
    parts.push(p);
    return p;
  };
  const strut = (part, a, b, r, material, { top = r, edge = 0.5, bevel } = {}) => {
    const from = V(...a);
    const to = V(...b);
    const mesh = addMesh(part, cyl(r, from.distanceTo(to), bevel ?? Math.min(0.7, r * 0.22), 40, top), material, { edgeOpacity: edge });
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, to.sub(from).normalize());
    return mesh;
  };
  const link = (part, r, len, material, at = 0) => {
    const mesh = addMesh(part, cyl(r, len, Math.min(0.5, r * 0.25), 24).translate(0, at * len, 0), material, { edgeOpacity: 0.45 });
    const d = V();
    return (a, b, from = 0.5) => {
      mesh.position.copy(a).lerp(b, from);
      mesh.quaternion.setFromUnitVectors(UP, d.subVectors(b, a).normalize());
    };
  };

  /* ── the metals: three values of grey, little metal ── */
  const cast = solid(0x69737b, { rough: 0.58, metal: 0.3, coat: 0.35, coatRough: 0.45 });
  const steel = solid(0x8d959b, { rough: 0.42, metal: 0.4, env: 1.1 });
  const bright = solid(0xd4d8da, { rough: 0.34, metal: 0.35, env: 1.25 });
  const rubber = solid(0x2c3237, { rough: 0.92, env: 0.5 });
  const alloy = solid(0xaab1b6, { rough: 0.45, metal: 0.35, env: 1.1 });
  const hookMat = solid(0xaeb5ba, { rough: 0.48, metal: 0.3, env: 1 });
  const dark = solid(0x15191c, { rough: 0.88, env: 0.5 });
  const grey = solid(0x333a40, { rough: 0.8, metal: 0.1, env: 0.6 });

  /* ── the airframe: one shell of glass ── */
  fx.hull = glass(BRAND.ink, { base: 0, rim: 0.12, power: 3, edge: 0.32, spec: 0, through: 0.22 });
  fx.wings = glass(BRAND.ink, { base: 0.002, rim: 0.045, power: 3, edge: 0.07, spec: 0, through: 0.2 });
  fx.canopy = glass(BRAND.ink, { base: 0, rim: 0.2, power: 3, edge: 0.5, spec: 0.7, through: 0.3 });
  const panes = [];
  const pane = (geometry, material, parent = plane) => {
    const mesh = new THREE.Mesh(geometry, material);
    parent.add(mesh);
    panes.push(mesh);
    return mesh;
  };
  const zs = (() => {
    const breaks = Object.values(CANOPY);
    const list = [M.nose - 3, M.nose - 8, -640, -652, ...breaks];
    for (let z = M.nose; z > -640; z -= 15) if (!breaks.some((b) => Math.abs(b - z) < 7)) list.push(z);
    return list.sort((a, b) => b - a);
  })();
  const rings = zs.map((z) => bodyRing(z));
  pane(skin(rings, { wrap: true, keep: (i, j) => !(zs[i] <= CANOPY.front && zs[i + 1] >= CANOPY.rear && j >= SILL && j < AROUND / 2 - SILL) }), fx.hull);
  const podZ = [];
  for (let z = POD[0][0]; z > POD.at(-1)[0]; z -= 30) podZ.push(z);
  podZ.push(POD.at(-1)[0]);
  for (const side of [1, -1]) pane(skin(podZ.map((z) => podRing(z, side)), { wrap: true }), fx.hull);
  const wing = aerofoil(WING);
  const canard = aerofoil(CANARD, { thick: 0.05, steps: 4 });
  for (const side of [1, -1]) {
    pane(side > 0 ? wing : wing.clone().scale(-1, 1, 1), fx.wings);
    pane(side > 0 ? canard : canard.clone().scale(-1, 1, 1), fx.wings);
    const missile = pane(new THREE.CapsuleGeometry(7, 290, 6, 16).rotateX(Math.PI / 2), fx.hull);
    missile.position.set(side * 537, 192, -285);
  }
  pane(aerofoil(FIN, { thick: 0.04 }).rotateZ(Math.PI / 2), fx.wings);
  const fairing = pane(new THREE.CapsuleGeometry(8, 120, 6, 16).rotateX(Math.PI / 2), fx.hull);
  fairing.position.set(0, 528, -565);

  /* ── a few lines of structure, and the outline of everything that flies ── */
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
    run(outline, podRing(POD[0][0], side), true);
    run(frames, podRing(0, side).filter((_, j) => j % 2 === 0), true);
    run(frames, podRing(-450, side).filter((_, j) => j % 2 === 0), true);
    for (const s of [WING, CANARD]) {
      edge(s, side, (x0, y0, x1, y1, root, tip) => {
        run(outline, [[x0, y0, root[2]], [x1, y1, tip[2]], [x1, y1, tip[3]], [x0, y0, root[3]]]);
        for (const f of s === WING ? [0.34, 0.6, 0.84] : [0.5]) run(frames, [[x0, y0, lerp(root[2], root[3], f)], [x1, y1, lerp(tip[2], tip[3], f)]]);
      });
    }
  }
  run(outline, [[0, FIN.root[0], FIN.root[2]], [0, FIN.tip[0], FIN.tip[2]], [0, FIN.tip[0], FIN.tip[3]], [0, FIN.root[0], FIN.root[3]]]);
  run(frames, [[0, FIN.root[0], lerp(FIN.root[2], FIN.root[3], 0.72)], [0, FIN.tip[0], lerp(FIN.tip[2], FIN.tip[3], 0.6)]]);
  run(outline, [[0, 200, M.nose], [0, 199, M.nose + 34]]);
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
  // far away ("un trait sur la mer") the fine lines go: the glass's lip carries the shape
  fx.frames = fadeFar(lineMat(BRAND.ink, 1.9, { opacity: 0.3 }), 6000, 16000);
  fx.outline = fadeFar(lineMat(BRAND.ink, 2.3, { opacity: 0.8 }), 9000, 26000);
  segments(frames, fx.frames);
  segments(outline, fx.outline);

  /* ── the canopy, the cockpit ── */
  pane(patch(canopySurf(CANOPY.front, CANOPY.arch), [0, 1], [0, 1], 8, 28), fx.canopy);
  pane(patch(canopySurf(CANOPY.arch, CANOPY.rear), [0, 1], [0, 1], 26, 28), fx.canopy);
  const cockpit = newPart("cockpit");
  const frameMat = solid(0x7b8287, { rough: 0.45, metal: 0.4 });
  const tube = (pts, r = 1.7) => addMesh(cockpit, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => V(...p))), 64, r, 8), frameMat, { edges: false });
  const arc = (z, n = 28) => Array.from({ length: n + 1 }, (_, k) => onSection(section(z), A0 + ((Math.PI - 2 * A0) * k) / n));
  tube(arc(CANOPY.arch), 1.8);
  tube(arc(CANOPY.rear), 1.6);
  addMesh(cockpit, box(74, 3, 190, 0.8), dark, { pos: [0, 192.5, 505], edgeOpacity: 0.4 });
  addMesh(cockpit, box(57, 25, 4, 0.8), dark, { pos: [0, 238, 566], edgeOpacity: 0.5 });
  addMesh(cockpit, box(62, 3.5, 26, 1.2), dark, { pos: [0, 253, 571], edgeOpacity: 0.4 });
  fx.screens = glow(BRAND.ink, 0.4, { additive: true });
  for (const x of [-19, 0, 19]) {
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(14.6, 11), fx.screens);
    screen.position.set(x, 238, 563.8);
    screen.rotation.y = Math.PI;
    cockpit.add(screen);
  }
  for (const x of [-38, 38]) addMesh(cockpit, box(13, 14, 112, 1), dark, { pos: [x, 211, 505], edgeOpacity: 0.42 });
  addMesh(cockpit, box(40, 9, 46, 1.5), grey, { pos: [0, 207.5, 526], edgeOpacity: 0.4 });
  const seat = new THREE.Group();
  seat.position.set(...M.hips);
  seat.rotation.x = -M.recline * DEG;
  cockpit.add(seat);
  const inSeat = (geometry, material, pos) => {
    const mesh = addMesh(cockpit, geometry, material, { pos, edgeOpacity: 0.4 });
    seat.add(mesh);
    return mesh;
  };
  inSeat(box(42, 84, 5, 1.2), grey, [0, 36, -14]);
  inSeat(box(23, 19, 9, 2), grey, [0, 86, -17]);
  strut(cockpit, [M.stick[0], 218, M.stick[2]], [M.stick[0], 232, M.stick[2] + 1.5], 1.7, grey, { edge: 0.4 });

  /* ── the head-up display: a pane on the coaming, leaning back toward your eyes ── */
  const HUD = { w: 15, h: 12.5 };
  fx.hud = hudMat(HUD.w, HUD.h);
  const hud = new THREE.Mesh(new THREE.PlaneGeometry(HUD.w, HUD.h), fx.hud);
  hud.position.set(0, 275, 562); // at the height of your eyes, a hand's breadth above the coaming
  hud.rotation.set(-0.3, Math.PI, 0);
  hud.renderOrder = 9;
  hud.visible = false;
  plane.add(hud);
  addMesh(cockpit, box(17, 7, 4, 0.8), dark, { pos: [0, 258, 566], edgeOpacity: 0.4 }); // its foot on the coaming

  /* ── the throttle ── */
  for (const dx of [-3.6, 3.6]) addMesh(cockpit, box(1.3, 1.4, THR.travel + 9, 0.3), steel, { pos: [THR.x + dx, 218.7, THR.from + THR.travel / 2], edgeOpacity: 0.5 });
  fx.stop = glow(BRAND.signal, 0.2);
  const stop = new THREE.Mesh(box(9.6, 2.6, 1.8, 0.4), fx.stop);
  stop.position.set(THR.x, 219.3, THR.from + THR.travel + 5.4);
  cockpit.add(stop);
  const lever = newPart("throttle");
  addMesh(lever, box(5.6, 1.6, 7.5, 0.4), bright, { pos: [THR.x, 219.2, 0], edgeOpacity: 0.5 });
  addMesh(lever, box(2.6, THR.y - 219.5, 3.2, 0.5), bright, { pos: [THR.x, (THR.y + 219.5) / 2, 0], edgeOpacity: 0.5 });
  addMesh(lever, cyl(2.1, 11, 0.6, 32).rotateZ(Math.PI / 2), bright, { pos: [THR.x, THR.y, 0], edgeOpacity: 0.5 });
  A.throttle = anchor(lever, THR.x, THR.y, 0);

  /* ── you ── */
  const fig = makeFigure({ hands: "real", shell: true, order: 10, through: 0.15 });
  const FIG = [M.hips[0], M.hips[1] - fig.HIP, M.hips[2]];
  fig.group.position.set(...FIG);
  plane.add(fig.group);
  fig.lean(-M.recline);
  fig.leg("L", V(9.5, 70, 68), V(0, 1, 0.25));
  fig.leg("R", V(-9.5, 70, 68), V(0, 1, 0.25));
  fig.hold("R", V(M.stick[0] - FIG[0], 229 - FIG[1], M.stick[2] + 1 - FIG[2]), V(0, 1, 0.1), { bar: 1.7, k: 1, bend: V(-0.55, -0.5, -0.65) });
  for (const mesh of fig.arms.R.fingers.meshes) {
    mesh.material = fig.body;
    mesh.castShadow = false;
    asShell(mesh, 10);
  }
  fig.head.visible = false;
  const helmet = new THREE.Group();
  helmet.position.copy(fig.head.position);
  fig.torso.add(helmet);
  const helmetMat = solid(0xa3a9ac, { rough: 0.5, coat: 0.3, coatRough: 0.4, env: 0.9 });
  const visorMat = solid(0x12161a, { rough: 0.55, coat: 0.2, coatRough: 0.5, env: 0.8 });
  const maskMat = solid(0x5a6269, { rough: 0.7 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(13.6, 44, 30), helmetMat);
  dome.scale.set(1, 1.03, 1.1);
  const visorGeo = new THREE.SphereGeometry(14.1, 32, 12, Math.PI / 2 - 1.05, 2.1, Math.PI * 0.34, Math.PI * 0.22);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.scale.set(1, 1.03, 1.1);
  const visorEdge = edgesOf(visorGeo, { width: 1.9, opacity: 0.55, threshold: 60 });
  visor.add(visorEdge);
  const mask = new THREE.Mesh(box(8.5, 8, 7, 2.4), maskMat);
  mask.position.set(0, -6.2, 13.2);
  helmet.add(dome, visor, mask);
  for (const mesh of [dome, visor, mask]) mesh.receiveShadow = true;
  const youMats = [fig.flesh, helmetMat, visorMat, maskMat, visorEdge.material];
  A.head = anchor(fig.torso, fig.head.position.x, fig.head.position.y, fig.head.position.z);
  A.cockpit = anchor(plane, 0, 250, 486);
  A.canopy = anchor(plane, 0, 322, 462);
  const HOLD = { palm: V(0, -1, 0), dir: V(0, 0, 1), k: 1, bar: 2.1, bend: V(0.55, -0.5, -0.65) };
  const ACROSS = V(1, 0, 0);
  const grip = V();

  /* ── the legs: solid, they are what stands on the deck ── */
  const legs = newPart("legs");
  const wheel = (part, x, y, z, r, wide, side) => {
    const h = wide / 2;
    const rim = r * 0.52;
    const turn = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    const tyre = lathe([[rim, -h * 0.84], [r * 0.82, -h], [r * 0.96, -h * 0.8], [r, -h * 0.4], [r, h * 0.4], [r * 0.96, h * 0.8], [r * 0.82, h], [rim, h * 0.84]], 64, { bevel: r * 0.05, round: 3 });
    addMesh(part, tyre.rotateZ(turn), rubber, { pos: [x, y, z], edges: false });
    const hub = lathe([[0.1, -h * 0.86], [rim * 1.03, -h * 0.86], [rim * 1.03, h * 0.88], [rim * 0.9, h * 0.74], [rim * 0.48, h * 0.74], [rim * 0.36, h * 0.46], [0.1, h * 0.46]], 48, { bevel: 0.5, round: 1 });
    addMesh(part, hub.rotateZ(turn), alloy, { pos: [x, y, z], edgeOpacity: 0.7 });
    const pts = [];
    for (const sx of [-h * 0.8, h * 0.8]) {
      for (let k = 0; k < 56; k++) {
        const a0 = (2 * Math.PI * k) / 56;
        const a1 = (2 * Math.PI * (k + 1)) / 56;
        pts.push(x + sx, y + r * 0.965 * Math.cos(a0), z + r * 0.965 * Math.sin(a0), x + sx, y + r * 0.965 * Math.cos(a1), z + r * 0.965 * Math.sin(a1));
      }
    }
    const geo = new LineSegmentsGeometry();
    geo.setPositions(pts);
    const lines = new LineSegments2(geo, fadeFar(lineMat(BRAND.ink, 1.9, { opacity: 0.42 }), 3000, 9000));
    lines.renderOrder = 2;
    part.userData.part.mats.add(lines.material);
    part.add(lines);
  };
  const legParts = [legs];
  for (const s of [1, -1]) {
    const top = V(s * 98, 172, 2);
    const axle = V(s * 110, MAIN.r, 0);
    const u = axle.clone().sub(top);
    const len = u.length();
    u.normalize();
    const on = (d, dz = 0) => [top.x + u.x * d, top.y + u.y * d, top.z + u.z * d + dz];
    strut(legs, on(0), on(78), 7.4, cast, { top: 6.6 });
    strut(legs, on(72), on(79.5), 8.3, steel, { edge: 0.6 });
    strut(legs, [s * 98, 172, -13], [s * 98, 172, 17], 5.2, cast);
    strut(legs, on(40), [s * 58, 171, 0], 3, steel);
    strut(legs, on(46), [s * 98, 170, 52], 3.2, steel);
    const foot = newPart(s > 0 ? "footL" : "footR");
    legParts.push(foot);
    strut(foot, on(58), on(len), 4.5, bright, { edge: 0.4 });
    strut(foot, [s * 102, MAIN.r, 0], [s * 143, MAIN.r, 0], 4.2, steel);
    strut(foot, [s * 109.5, MAIN.r, 0], [s * 114.4, MAIN.r, 0], 16, cast, { edge: 0.5, bevel: 0.8 });
    wheel(foot, s * MAIN.x, MAIN.r, 0, MAIN.r, MAIN.wide, s);
    A[s > 0 ? "wheelL" : "wheelR"] = anchor(foot, s * MAIN.x, MAIN.r, 0);
    // the scissor, open at full stroke (the legs do not move here)
    const upper = V(...on(73, -8.6));
    const lower = V(...on(len - 10, -6.2));
    const mid = upper.clone().lerp(lower, 0.5).add(V(0, 0, -16));
    link(legs, 2.3, 34, steel)(upper, mid);
    link(legs, 2.3, 34, steel)(mid, lower);
  }
  const noseFoot = newPart("footN");
  legParts.push(noseFoot);
  {
    const top = V(0, 168, 522);
    const axle = V(0, FRONT.r, FRONT.z);
    const u = axle.clone().sub(top);
    const len = u.length();
    u.normalize();
    const on = (d, dz = 0) => [0, top.y + u.y * d, top.z + u.z * d + dz];
    strut(legs, on(0), on(76), 8.4, cast, { top: 7.4 });
    strut(legs, on(70), on(77.5), 9.3, steel, { edge: 0.6 });
    strut(legs, on(60), [0, 158, 444], 3.5, steel);
    strut(noseFoot, on(54), on(len), 5.3, bright, { edge: 0.4 });
    strut(noseFoot, [-21, FRONT.r, FRONT.z], [21, FRONT.r, FRONT.z], 3.7, steel);
    for (const s of [1, -1]) wheel(noseFoot, s * FRONT.x, FRONT.r, FRONT.z, FRONT.r, FRONT.wide, s);
    const upper = V(...on(71, -9.6));
    const lower = V(...on(len - 9, -6.6));
    const mid = upper.clone().lerp(lower, 0.5).add(V(0, 0, -18));
    link(legs, 2.4, 37, steel)(upper, mid);
    link(legs, 2.4, 37, steel)(mid, lower);
    // the holdback fitting: a lug on the aft face of the leg, low, between the twin wheels (the bar hangs from it)
    addMesh(noseFoot, box(7, 9, 12, 1.2), cast, { pos: [0, 33, FRONT.z - 12], edgeOpacity: 0.55 });
    strut(noseFoot, [-4.2, 33, FRONT.z - 15], [4.2, 33, FRONT.z - 15], 2.2, steel, { edge: 0.5 });
    A.holdback = anchor(noseFoot, 0, 33, FRONT.z - 15);
  }
  A.noseWheel = anchor(noseFoot, 0, FRONT.r, FRONT.z);
  // the launch bar: hinged just ahead of the axle; `bar` 0 raised (the mark of the navy's Rafale), 1 down in the shuttle's hook
  const launch = new THREE.Group();
  launch.position.set(0, FRONT.r + 5, FRONT.z + 5);
  noseFoot.add(launch);
  const BAR = { len: 48, up: -38.5 * DEG, down: 11 * DEG };
  {
    const m1 = addMesh(noseFoot, cyl(2.6, BAR.len, 0.5, 32), steel, { edgeOpacity: 0.5 });
    m1.position.set(0, 0, BAR.len / 2);
    m1.rotation.x = Math.PI / 2;
    launch.add(m1);
    const m2 = addMesh(noseFoot, cyl(2.9, 15, 0.5, 32), bright, { edgeOpacity: 0.5 });
    m2.position.set(0, 0, BAR.len);
    m2.rotation.z = Math.PI / 2;
    launch.add(m2);
  }
  A.tow = anchor(launch, 0, 0, BAR.len);

  /* ── the two engines ── */
  const engines = newPart("engines");
  const nozzleMat = solid(0x363d43, { rough: 0.5, metal: 0.45, env: 1.1, double: true });
  const depth = M.tail - NOZZLE.from;
  const ring = lathe([[33.4, 0], [NOZZLE.r, 0], [34.6, -depth * 0.5], [NOZZLE.lip, -depth], [27.2, -depth], [30.6, -depth * 0.42], [33.4, 0]], 64, { bevel: 0.8, round: 1 }).rotateX(-Math.PI / 2);
  fx.core = coreMat();
  fx.heat = heatMat();
  fx.trails = [];
  for (const side of [1, -1]) {
    addMesh(engines, ring, nozzleMat, { pos: [side * NOZZLE.x, NOZZLE.y, NOZZLE.from], edgeOpacity: 0.6 });
    const plateBack = addMesh(engines, new THREE.CircleGeometry(29.6, 48), dark, { pos: [side * NOZZLE.x, NOZZLE.y, NOZZLE.from - 38], rot: [0, Math.PI, 0], edges: false });
    plateBack.castShadow = false;
    const core = new THREE.Mesh(new THREE.CircleGeometry(28.6, 48), fx.core);
    core.position.set(side * NOZZLE.x, NOZZLE.y, NOZZLE.from - 40);
    core.rotation.y = Math.PI;
    core.renderOrder = 4;
    // the heat: it widens as it goes, toward the deflector (≈ 4 m astern of the nozzles at full power)
    const trail = new THREE.Mesh(new THREE.CylinderGeometry(40, 26.5, 1, 40, 12, true).translate(0, 0.5, 0).rotateX(-Math.PI / 2), fx.heat);
    trail.position.set(side * NOZZLE.x, NOZZLE.y, M.tail + 4);
    trail.renderOrder = 5;
    plane.add(core, trail);
    fx.trails.push(trail);
    A[side > 0 ? "nozzleL" : "nozzleR"] = anchor(plane, side * NOZZLE.x, NOZZLE.y, M.tail);
  }
  A.nozzles = anchor(plane, 0, NOZZLE.y, M.tail);

  /* ── the hook ── */
  const [PX, PY, PZ] = HOOK.pivot;
  const bay = newPart("hookBay");
  addMesh(bay, box(15, 24, 34, 1.5), cast, { pos: [PX, PY + 12, PZ + 4], edgeOpacity: 0.5 });
  strut(bay, [PX - 9.5, PY, PZ], [PX + 9.5, PY, PZ], 3.4, steel, { edge: 0.6 });
  const hook = newPart("hook");
  hook.position.set(PX, PY, PZ);
  const L = HOOK.length;
  const S45 = Math.SQRT1_2;
  const SHOE = [
    [-13, -6.5], [-11, -9.6], [-6, -11.5], [0, -HOOK.sole], [7, -11.2], [13, -8.6], [17, -4], [19, 2], [18.5, 8], [15, 14], [9, 18.5], [1, 23], [-8, 26.5],
    [-14.5, 20], [-10, 13], [-5.6, 6.6], [-2, 3.9], [1.5, 3.2], [3.6, 1.2], [3.8, -1.4], [2, -3.4], [-1.5, -4], [-8, -4.7],
  ];
  const WIDE = 11;
  const shoe = plate(SHOE, WIDE, { bevel: 0.6, round: 2 })
    .translate(0, 0, -WIDE / 2)
    .applyMatrix4(new THREE.Matrix4().makeBasis(V(0, S45, -S45), V(0, S45, S45), V(1, 0, 0)))
    .translate(0, 0, -L);
  addMesh(hook, shoe, hookMat, { edgeOpacity: 0.8, edgeColor: 0x1d2226 });
  const heel = [0, S45 * 13, -L + S45 * 21];
  strut(hook, [0, 0, 0], heel, 5.2, hookMat, { top: 3.9, edge: 0.5 });
  strut(hook, [-7.5, 0, 0], [7.5, 0, 0], 6.2, steel, { edge: 0.6 });
  A.hook = anchor(hook, 0, 0, -L);
  A.hookPivot = anchor(plane, PX, PY, PZ);
  const DAMP = { keel: V(PX, PY + 22, PZ - 22), arm: [4, -40] };
  const barrel = link(bay, 3.3, 27, cast, 0.5);
  const rod = link(bay, 1.9, 27, bright, -0.5);
  const onArm = V();

  /* ── the sparks of the shoe on the deck (`scrape`), in the group's frame: they do not pitch ── */
  const blob = new THREE.SphereGeometry(1, 20, 14);
  fx.sparks = makeStreaks(96, 31);
  fx.sparks.uniforms.uAt.value.set(0, 0, 0);
  // our frame flies toward −z: the sparks are thrown astern (+z) — makeStreaks throws toward +z already
  fx.scrape = softGlow(2.4);
  const ember = new THREE.Mesh(blob, fx.scrape);
  ember.renderOrder = 6;
  ember.visible = false;
  group.add(fx.sparks.mesh, ember);

  /* ── the night: the two wingtip lights ── */
  fx.nav = navMat();
  plane.add(Object.assign(navLights(fx.nav), { matrixAutoUpdate: true }));
  // (navLights writes OUR frame's points: undo the flip for this one, it lives in 015's frame)
  plane.children.at(-1).geometry.applyMatrix4(FLIP.clone().invert());

  /* ── what sits it on the deck ── */
  fx.pool = makePool({ radius: 1000, color: BRAND.ink });
  fx.pool.mesh.scale.set(0.42, 0.95, 1);
  fx.pool.mesh.position.set(0, 0.9, 520);
  fx.shadows = [[-MAIN.x, RAFALE.mains, 1], [MAIN.x, RAFALE.mains, 1], [0, 0, 0.8]].map(([x, z, k]) => {
    const mesh = makeContact({ amount: 0 });
    mesh.position.set(x, 1.4, z + 6);
    mesh.scale.set(84 * k, 150 * k, 1);
    group.add(mesh);
    return { mesh, k };
  });
  group.add(fx.pool.mesh);

  A.nose = anchor(plane, 0, 200, M.nose);
  A.tail = anchor(plane, 0, NOZZLE.y, M.tail);
  A.fin = anchor(plane, 0, M.height, -568);
  A.wingL = anchor(plane, 537, 192, -285);
  A.wingR = anchor(plane, -537, 192, -285);
  A.cg = anchor(plane, 0, 215, 0);

  asShell(panes, 20);

  let youWas = -1;
  const fadeYou = (a) => {
    if (a === youWas) return;
    youWas = a;
    for (const mat of youMats) fadeMat(mat, a);
  };
  let gasWas = -1;
  let jetWas = -1;
  let gearWas = -1;

  /**
   *   jet 0–1 a fade · pitch° nose up around the main wheels · bank° (> 0 starboard wing down) · gas 0.5 idle → 1 full
   *   tremble 0–1 (a shiver at the frame rate on a slow sway) · hook 0 up → 1 down (to its stop in the air, on the deck
   *   on it) · bar 0 the launch bar raised → 1 down in the shuttle's hook · you · hud · night (the wingtip lights) ·
   *   onDeck 1 the pool and the shadows under the wheels · gear (optional, 1) 0 the legs up · scrape (optional, 0)
   *   the shoe's sparks
   */
  function update(P = {}, time = 0) {
    const jet = clamp01(P.jet ?? 1);
    group.visible = jet > 0.004;
    if (!group.visible) return;
    const th = (P.pitch ?? 0) * DEG;
    const cos = Math.cos(th);
    const sin = Math.sin(th);
    const down = smooth(0, 1, P.hook ?? 0);
    const gas = clamp01(P.gas ?? 0.5);
    const you = clamp01(P.you ?? 1) * jet;
    const onDeck = clamp01(P.onDeck ?? 1);
    const tremble = clamp01(P.tremble ?? 0);

    /* the airframe: pitch, bank, and the tremble — a shiver AT THE FRAME RATE (30 beats a second for 30 frames: the
       same blur on every frame) on a slow sway */
    const shiver = Math.sin(TAU * 30 * time + 0.7);
    const shiver2 = Math.sin(TAU * 30 * time + 2.3);
    const sway = Math.sin(TAU * 0.55 * time) * 0.7 + Math.sin(TAU * 0.83 * time + 1.1) * 0.3;
    tilt.rotation.x = th + tremble * (0.0011 * shiver2 + 0.0016 * sway);
    roll.rotation.z = -(P.bank ?? 0) * DEG + tremble * (0.0024 * shiver + 0.0022 * sway);
    roll.position.y = 215 - MAIN.r + tremble * (0.35 * shiver2 + 0.25 * sway);

    /* the legs (in the air, `gear` 0 hides them) and the launch bar */
    const gear = clamp01(P.gear ?? 1) * jet;
    if (gear !== gearWas) {
      gearWas = gear;
      for (const p of legParts) setPartOpacity(p, gear);
    }
    launch.rotation.x = lerp(BAR.up, BAR.down, smooth(0, 1, P.bar ?? 0));

    /* the hook: its hinge above the deck; on the deck the shoe rests on it, in the air it hangs to its stop */
    const hingeY = MAIN.r + (PY - MAIN.r) * cos + PZ * sin;
    const free = HOOK.down * DEG + th;
    const touch = Math.asin(clamp((hingeY - HOOK.sole) / L, -0.4, 0.995));
    const reach = onDeck > 0.5 ? Math.min(free, touch) : free;
    const now = lerp(th + HOOK.stowed * DEG, reach, down);
    hook.rotation.x = th - now;
    const c = Math.cos(hook.rotation.x);
    const s = Math.sin(hook.rotation.x);
    onArm.set(PX, PY + DAMP.arm[0] * c - DAMP.arm[1] * s, PZ + DAMP.arm[0] * s + DAMP.arm[1] * c);
    barrel(DAMP.keel, onArm, 0);
    rod(DAMP.keel, onArm, 1);

    /* the throttle and your hand on it */
    if (gas !== gasWas) {
      gasWas = gas;
      lever.position.z = THR.from + THR.travel * gas;
      fig.hold("L", grip.set(THR.x - FIG[0], THR.y - FIG[1], lever.position.z - FIG[2]), ACROSS, HOLD);
    }
    const full = smooth(0.5, 1, gas);
    setGlow(fx.stop, (0.14 + 1.1 * full * full) * jet);
    setGlow(fx.screens, 0.4 * jet);

    /* the nozzles: two cores, the heat that streams back toward the deflector */
    fx.core.uniforms.uGas.value = 0.02 * gas + full * full;
    fx.core.uniforms.uAmount.value = jet * (0.5 + 0.5 * gas);
    fx.heat.uniforms.uAmount.value = (0.02 + 0.34 * full) * jet * (0.94 + 0.06 * Math.sin(time * 2.7));
    for (const trail of fx.trails) trail.scale.z = 60 + 380 * full;

    /* the head-up display, the wingtip lights */
    const hudK = clamp01(P.hud ?? 0) * jet;
    hud.visible = hudK > 0.004;
    fx.hud.uniforms.uAmount.value = hudK;
    // the HUD is lit for the shots from the cockpit: from inside, the canopy's glass would wash the whole frame
    fx.canopy.uniforms.uAmount.value = jet * (1 - 0.85 * hudK);
    fx.nav.uniforms.uAmount.value = smooth(0.25, 0.75, P.night ?? 0) * jet;

    /* the shoe's sparks (where its sole is: in the group's frame, astern of the main wheels) */
    const scrape = clamp01(P.scrape ?? 0) * jet * down;
    fx.sparks.mesh.visible = ember.visible = scrape > 0.004;
    if (scrape > 0.004) {
      const soleY = hingeY - L * Math.sin(now) - HOOK.sole + 0.5;
      const soleZ = RAFALE.mains - (PZ * cos - (PY - MAIN.r) * sin) + L * Math.cos(now) - 5;
      fx.sparks.uniforms.uAt.value.set(0, Math.max(0.5, soleY), soleZ);
      fx.sparks.uniforms.uTime.value = time;
      fx.sparks.uniforms.uAmount.value = scrape;
      ember.position.set(0, Math.max(2, soleY + 2), soleZ + 4);
      ember.scale.set(8, 5, 13);
      fx.scrape.uniforms.uColor.value.copy(HOT).multiplyScalar(1.6 * scrape * (0.9 + 0.1 * Math.sin(time * 2.3)));
    }

    /* the deck under it */
    const near = onDeck * jet;
    fx.pool.mesh.visible = near > 0.01;
    fx.pool.uniforms.uAmount.value = 0.11 * near;
    for (const sh of fx.shadows) {
      sh.mesh.visible = near > 0.01;
      sh.mesh.material.uniforms.uAmount.value = 0.62 * near;
    }

    /* the fades */
    if (jet !== jetWas) {
      jetWas = jet;
      fx.hull.uniforms.uAmount.value = jet;
      fx.wings.uniforms.uAmount.value = jet;
      fx.frames.opacity = fx.frames.userData.base * jet;
      fx.outline.opacity = fx.outline.userData.base * jet;
      for (const part of parts) if (!legParts.includes(part)) setPartOpacity(part, jet);
    }
    fig.group.visible = you > 0.004;
    fig.body.uniforms.uAmount.value = you;
    fadeYou(you);
  }
  update();

  return { group, plane, fig, fx, A, update };
}

/* ───────────────────────────────────────────────────────────── the LIGHT aircraft (all the others) */

let LIGHT = null;
/** One set of geometries for every other aircraft, in OUR frame (origin under the nose wheel, nose −z). */
function lightGeometry() {
  if (LIGHT) return LIGHT;
  const N = 32;
  const sill = 2;
  const zs = [M.nose - 3];
  for (let z = M.nose - 30; z > -640; z -= 40) zs.push(z);
  zs.push(CANOPY.front, CANOPY.rear, -640, -652);
  zs.sort((a, b) => b - a);
  const rings = zs.map((z) => bodyRing(z, N));
  const inCanopy = (i, j) => zs[i] <= CANOPY.front && zs[i + 1] >= CANOPY.rear && j >= sill && j < N / 2 - sill;
  const hull = [skin(rings, { wrap: true, keep: (i, j) => !inCanopy(i, j) })];
  const podZ = [];
  for (let z = POD[0][0]; z > POD.at(-1)[0]; z -= 60) podZ.push(z);
  podZ.push(POD.at(-1)[0]);
  for (const side of [1, -1]) hull.push(skin(podZ.map((z) => podRing(z, side, 20)), { wrap: true }));
  for (const side of [1, -1]) hull.push(new THREE.CapsuleGeometry(7, 290, 3, 8).rotateX(Math.PI / 2).translate(side * 537, 192, -285));
  const wing = aerofoil(WING, { steps: 3, around: 16 });
  const canard = aerofoil(CANARD, { thick: 0.05, steps: 2, around: 14 });
  const wings = [wing, wing.clone().scale(-1, 1, 1), canard, canard.clone().scale(-1, 1, 1), aerofoil(FIN, { thick: 0.04, steps: 3, around: 14 }).rotateZ(Math.PI / 2)];
  const canopy = [skin(rings, { wrap: true, keep: inCanopy })];
  // the legs and wheels (solid), the hook stowed and the nozzles (solid), the two cores
  const gear = [];
  for (const s of [1, -1]) {
    gear.push(new THREE.CylinderGeometry(MAIN.r, MAIN.r, MAIN.wide, 18).rotateZ(Math.PI / 2).translate(s * MAIN.x, MAIN.r, 0));
    gear.push(strutGeo([s * 98, 172, 2], [s * 110, MAIN.r, 0], 6.5));
    gear.push(new THREE.CylinderGeometry(FRONT.r, FRONT.r, FRONT.wide, 16).rotateZ(Math.PI / 2).translate(s * FRONT.x, FRONT.r, FRONT.z));
  }
  gear.push(strutGeo([0, 168, 522], [0, FRONT.r, FRONT.z], 7));
  gear.push(strutGeo([0, FRONT.r + 5, FRONT.z + 5], [0, FRONT.r + 36, FRONT.z + 44], 2.6));
  const fixed = [strutGeo([0, 164, -410], [0, 159, -620], 5)];
  const depth = M.tail - NOZZLE.from;
  for (const side of [1, -1]) fixed.push(new THREE.CylinderGeometry(NOZZLE.lip + 3, NOZZLE.r, -depth, 20, 1, true).rotateX(Math.PI / 2).translate(side * NOZZLE.x, NOZZLE.y, (NOZZLE.from + M.tail) / 2));
  const cores = [1, -1].map((side) => new THREE.CircleGeometry(28.6, 24).rotateY(Math.PI).translate(side * NOZZLE.x, NOZZLE.y, NOZZLE.from - 40));
  const at = (list, keepUv) => merge(list, keepUv).applyMatrix4(FLIP);
  // the outline: wings, canards, fin, intakes — in our frame
  const out = [];
  const run = (pts, closed = false) => {
    const q = pts.map(flipPt);
    for (let i = 0; i < q.length - 1; i++) out.push(...q[i], ...q[i + 1]);
    if (closed) out.push(...q.at(-1), ...q[0]);
  };
  for (const side of [1, -1]) {
    for (const s of [WING, CANARD]) run([[side * s.root[0], s.root[1], s.root[2]], [side * s.tip[0], s.tip[1], s.tip[2]], [side * s.tip[0], s.tip[1], s.tip[3]], [side * s.root[0], s.root[1], s.root[3]]]);
    run(podRing(POD[0][0], side, 16), true);
  }
  run([[0, FIN.root[0], FIN.root[2]], [0, FIN.tip[0], FIN.tip[2]], [0, FIN.tip[0], FIN.tip[3]], [0, FIN.root[0], FIN.root[3]]]);
  run(rings.map((r) => r[N / 4]));
  const lines = new LineSegmentsGeometry();
  lines.setPositions(out);
  LIGHT = { hull: at(hull), wings: at(wings), canopy: at(canopy), gear: at(gear), fixed: at(fixed), cores: at(cores, true), lines };
  return LIGHT;
}

/** A set of materials for a family of light aircraft (they fade together). */
function lightMats({ lines = 0.42, near = 4000, far = 12000 } = {}) {
  const m = {
    hull: glass(BRAND.ink, { base: 0, rim: 0.12, power: 3, edge: 0.34, spec: 0, through: 0.18 }),
    wings: glass(BRAND.ink, { base: 0.002, rim: 0.05, power: 3, edge: 0.09, spec: 0, through: 0.18 }),
    canopy: glass(BRAND.ink, { base: 0, rim: 0.2, power: 3, edge: 0.5, spec: 0.5, through: 0.3 }),
    lines: fadeFar(lineMat(BRAND.ink, 1.9, { opacity: lines }), near, far),
    gear: solid(0x5d666d, { rough: 0.62, metal: 0.25, env: 0.8 }),
    nozzle: solid(0x363d43, { rough: 0.5, metal: 0.45, env: 1.1, double: true }),
    core: coreMat(),
    nav: navMat(),
    amount: -1,
    gas: -1,
  };
  return m;
}
function setLightAmount(m, a) {
  if (a === m.amount) return;
  m.amount = a;
  m.hull.uniforms.uAmount.value = a;
  m.wings.uniforms.uAmount.value = a;
  m.canopy.uniforms.uAmount.value = a;
  m.lines.opacity = m.lines.userData.base * a;
  fadeMat(m.gear, a);
  fadeMat(m.nozzle, a);
}
/** The engines of a family: `gas` 0 cold · 0.5 idle (two small signal cores) · 1 full. */
function setLightGas(m, gas, a) {
  const full = smooth(0.5, 1, gas);
  m.core.uniforms.uGas.value = 0.3 * smooth(0.05, 0.5, gas) + full * full;
  m.core.uniforms.uAmount.value = a * smooth(0.02, 0.3, gas);
}

function makeLightJet(mats, { gear = true, lines = true, nav = false } = {}) {
  const G = lightGeometry();
  const group = new THREE.Group();
  const shell = [];
  for (const [geo, mat] of [[G.hull, mats.hull], [G.wings, mats.wings], [G.canopy, mats.canopy]]) {
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    shell.push(mesh);
  }
  asShell(shell, 20);
  const gearMesh = new THREE.Mesh(G.gear, mats.gear);
  gearMesh.visible = gear;
  const fixed = new THREE.Mesh(G.fixed, mats.nozzle);
  const cores = new THREE.Mesh(G.cores, mats.core);
  cores.renderOrder = 4;
  group.add(gearMesh, fixed, cores);
  if (lines) {
    const l = new LineSegments2(G.lines, mats.lines);
    l.frustumCulled = false;
    l.renderOrder = 2;
    group.add(l);
  }
  if (nav) group.add(navLights(mats.nav));
  return { group, gear: gearMesh };
}

/* ───────────────────────────────────────────────────────────── the people of glass */

/** A figure of glass from head to hands (seen from close, only what the sentence is about stays solid). */
function person({ order = 20, glassK = 1 } = {}) {
  const fig = makeFigure({ shell: true, hands: "flat", order, glassK, through: 0.1 });
  fig.ghost(true);
  fig.amount = -1;
  return fig;
}
function fadePerson(fig, a) {
  if (a === fig.amount) return;
  fig.amount = a;
  fig.group.visible = a > 0.004;
  fig.body.uniforms.uAmount.value = a;
}
const yawTo = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]); // the rotation.y that turns +z toward `to`

/* ───────────────────────────────────────────────────────────── Pedro */

function makeRotorDisc(r, k = 1) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uInk: { value: INK.clone() }, uAmount: { value: 1 }, uK: { value: k } },
    vertexShader: /* glsl */ `varying vec2 vQ; void main() { vQ = position.xy / ${r.toFixed(1)}; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount, uK; varying vec2 vQ;
      void main() {
        if (uAmount < 0.003) discard;
        float r = length(vQ);
        float aa = max(fwidth(r), 1e-4);
        float disc = 1.0 - smoothstep(1.0 - aa * 1.5, 1.0 + aa, r);
        float tips = smoothstep(0.78, 0.985, r) * disc;
        float hub = 1.0 - smoothstep(0.05, 0.11, r);
        gl_FragColor = vec4(uInk * (0.02 * disc + 0.08 * tips + 0.12 * hub) * uAmount * uK, 1.0);
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

/** A Dauphin of glass, nose toward −z, its origin at the cabin's centre; the side door open to PORT (−x), the diver in it. */
function makePedro() {
  const group = new THREE.Group();
  const bob = new THREE.Group();
  group.add(bob);
  const hull = glass(BRAND.ink, { base: 0, rim: 0.17, power: 2.6, edge: 0.42, spec: 0.45, through: 0.2 });
  const tubes = glass(BRAND.ink, { base: 0.004, rim: 0.3, power: 2.2, edge: 0.35 });
  const panes = [];
  const pane = (geo, mat = hull) => {
    const m = new THREE.Mesh(geo, mat);
    bob.add(m);
    if (mat === hull) panes.push(m);
    return m;
  };
  // the cabin and the body, station by station along z: [z, half-width, bottom, top]; the door cut out of its port side
  const ST = [[-430, 4, -40, -20], [-410, 42, -85, 10], [-360, 85, -105, 60], [-280, 108, -112, 105], [-180, 118, -112, 130], [-60, 120, -112, 150], [80, 118, -108, 150], [200, 108, -96, 135], [300, 88, -70, 115], [380, 62, -40, 95], [430, 40, -10, 80]];
  const NA = 36;
  const ringAt = ([z, w, lo, hi]) =>
    Array.from({ length: NA }, (_, j) => {
      const a = (TAU * j) / NA;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const mid = (lo + hi) / 2;
      const h = (hi - lo) / 2;
      return [w * Math.sign(c) * Math.abs(c) ** 0.7, mid + h * Math.sign(s) * Math.abs(s) ** 0.8, z];
    });
  const rows = ST.map(ringAt);
  const DOOR = { z: [-180, 80], j: [14, 22] }; // the panels around angle π (−x, port), between those stations
  const doorPanel = (i, j) => ST[i][0] >= DOOR.z[0] && ST[i + 1][0] <= DOOR.z[1] && j >= DOOR.j[0] && j < DOOR.j[1];
  pane(skin(rows, { wrap: true, keep: (i, j) => !doorPanel(i, j) }));
  // the engine cowl on top, the tail boom, the fenestron in its fin, the stabiliser
  pane(new THREE.CapsuleGeometry(55, 220, 6, 18).rotateX(Math.PI / 2).translate(0, 168, 120));
  pane(lathe([[0, 0], [52, 0], [24, 560], [0, 560]], 24).rotateX(Math.PI / 2).translate(0, 70, 380));
  pane(new THREE.TorusGeometry(58, 14, 12, 40).rotateY(Math.PI / 2).translate(0, 105, 1000));
  pane(plate([[-40, 0], [70, 0], [40, 175], [5, 175], [-60, 40]], 10, { bevel: 2 }).rotateY(Math.PI / 2).translate(-5, 105, 1010));
  pane(new THREE.BoxGeometry(260, 5, 50).translate(0, 75, 860));
  // the wheels (glass), the mast
  for (const s of [-1, 1]) pane(new THREE.CylinderGeometry(22, 22, 14, 18).rotateZ(Math.PI / 2).translate(s * 110, -128, 120), tubes);
  pane(new THREE.CylinderGeometry(16, 16, 12, 16).rotateZ(Math.PI / 2).translate(0, -128, -300), tubes);
  pane(new THREE.CylinderGeometry(12, 15, 70, 16).translate(0, 230, 40), tubes);
  // the door's frame: a few lines that say "open"
  const frame = [];
  const corner = (z, y) => [-110, y, z];
  for (const [p, q] of [[corner(-180, -100), corner(-180, 128)], [corner(80, -100), corner(80, 128)], [corner(-180, 128), corner(80, 128)], [corner(-180, -100), corner(80, -100)]]) frame.push(...p, ...q);
  const fg = new LineSegmentsGeometry();
  fg.setPositions(frame);
  const frameMat = lineMat(BRAND.ink, 2.2, { opacity: 0.6 });
  const frameLines = new LineSegments2(fg, frameMat);
  frameLines.renderOrder = 2;
  bob.add(frameLines);
  // the rotor: a blurred disc, never blades that flicker; the fenestron, a small one
  const rotor = makeRotorDisc(595);
  rotor.mesh.rotation.x = -Math.PI / 2;
  rotor.mesh.position.set(0, 268, 40);
  bob.add(rotor.mesh);
  const tail = makeRotorDisc(50, 1.4);
  tail.mesh.rotation.y = Math.PI / 2;
  tail.mesh.position.set(0, 105, 1000);
  bob.add(tail.mesh);
  asShell(panes, 20);
  // the pilot, seated, glass
  const pilot = person({ order: 12, glassK: 0.7 });
  pilot.group.rotation.y = Math.PI; // facing −z
  pilot.group.position.set(45, -112 - 46, -250);
  pilot.leg("L", V(8.6, 52, 46));
  pilot.leg("R", V(-8.6, 52, 46));
  pilot.reach("R", V(-14, 108, 36));
  pilot.reach("L", V(20, 110, 30));
  bob.add(pilot.group);
  // THE DIVER: sitting on the door's sill, legs out over the sea, facing out to port; his mask is solid
  const diver = person({ order: 12, glassK: 0.95 });
  diver.group.rotation.y = -Math.PI / 2; // +z → −x
  diver.group.position.set(-80, -104 - 44, -60); // the floor at y −104; seated: hips 44 cm above it
  diver.leg("L", V(8.6, 18, 52), V(0, 0.4, 1));
  diver.leg("R", V(-8.6, 22, 48), V(0, 0.4, 1));
  diver.reach("L", V(26, 96, 18));
  diver.reach("R", V(-24, 132, 26), V(-0.4, -1, 0.2));
  diver.lean(8);
  bob.add(diver.group);
  const maskMat = solid(0x262c31, { rough: 0.5, coat: 0.4, env: 0.9 });
  const lensMat = solid(0x9aa3a8, { rough: 0.25, metal: 0.2, env: 1.3 });
  const maskG = new THREE.Group();
  maskG.position.copy(diver.head.position).add(V(0, 1.5, 8.5));
  diver.torso.add(maskG);
  const strap = new THREE.Mesh(new THREE.TorusGeometry(10.8, 1.1, 8, 32).rotateX(Math.PI / 2), maskMat);
  strap.position.set(0, 0, -8.5);
  const frameM = new THREE.Mesh(box(15, 8, 4, 1.6), maskMat);
  const lens = new THREE.Mesh(box(12.5, 5.6, 1.2, 0.8), lensMat);
  lens.position.z = 2.1;
  maskG.add(strap, frameM, lens);
  frameM.add(edgesOf(frameM.geometry, { width: 1.9, opacity: 0.6 }));
  const mats = [hull, tubes];
  return { group, bob, rotor, tail, mats, frameMat, pilot, diver, maskMats: [maskMat, lensMat] };
}

/* ───────────────────────────────────────────────────────────── the bench tables */

const TABLE = { w: 150, l: 340, top: 24 };
/** A token: a little aircraft lying on the table, its silhouette from above ([x, z], nose −z, centred). */
const RAFALE_TOP = (() => {
  const half = [[0, -8.6], [0.75, -6.6], [1.05, -4.3], [3.1, -1.9], [3.1, -1.4], [1.25, -1.6], [1.4, -0.6], [6.0, 4.6], [6.0, 5.5], [1.55, 6.2], [1.05, 8.1], [0, 8.3]];
  return [...half, ...half.slice(1, -1).reverse().map(([x, z]) => [-x, z])];
})();
const SWEPT_TOP = (() => {
  // a generic swept-wing jet of 1967 (long nose, swept wings, a tailplane)
  const half = [[0, -9.0], [0.8, -6.5], [1.2, -2.6], [5.4, 2.0], [5.4, 2.8], [1.3, 2.4], [1.2, 5.6], [3.2, 7.6], [3.2, 8.3], [0.9, 8.0], [0.6, 8.6], [0, 8.6]];
  return [...half, ...half.slice(1, -1).reverse().map(([x, z]) => [-x, z])];
})();
const tokenGeo = (outline, scale = 1) => {
  const g = plate(outline.map(([x, z]) => [x * scale, -z * scale]), 1.1 * scale, { bevel: 0.32 * scale, round: 2 });
  g.rotateX(-Math.PI / 2);
  // a low fin on its back ([z along the token, height]): the shape's x is −z once turned
  const fin = plate([[4.4, 0], [8.2, 0], [8.4, 2.3], [7.1, 2.3]].map(([z, h]) => [-z * scale, h * scale]), 0.5 * scale, { bevel: 0.15 * scale });
  fin.rotateY(Math.PI / 2).translate(-0.25 * scale, 1.0 * scale, 0);
  return merge([g, fin]);
};

/** Where the deck outline spans at a given z: [xmin, xmax] (the outline in its own units). */
function spanAt(outline, z) {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < outline.length; i++) {
    const [x0, z0] = outline[i];
    const [x1, z1] = outline[(i + 1) % outline.length];
    if ((z0 - z) * (z1 - z) > 0 || z0 === z1) continue;
    const x = x0 + ((z - z0) / (z1 - z0)) * (x1 - x0);
    lo = Math.min(lo, x);
    hi = Math.max(hi, x);
  }
  return [lo, hi];
}

/** The plan's surface: the deck filled faintly, the zones in bands across it (`uZones` reveals them one by one, bow first). */
const planMat = (bounds) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uZones: { value: 0 }, uColor: { value: INK.clone() }, uB: { value: bounds } },
    vertexShader: /* glsl */ `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uZones; uniform vec3 uColor; uniform float uB[7]; varying vec3 vP;
      void main() {
        float i = 0.0;
        for (int k = 1; k < 6; k++) i += step(uB[k], vP.z);
        float on = smoothstep(i / 6.0, (i + 1.0) / 6.0, uZones);
        float alt = mod(i, 2.0);
        gl_FragColor = vec4(uColor * (0.035 + on * (0.03 + 0.045 * alt)), 1.0);
      }`,
  });

/** The fire on the Forrestal's table: one flame per place, each a billboard with a white heart at its root, a signal
 *  body and a tip that dissolves — "the brightest wins" (max blending), never a wall. */
function makeFlames(sites) {
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  geo.setAttribute("aPos", new THREE.InstancedBufferAttribute(new Float32Array(sites.flatMap((s) => s.at)), 3));
  geo.setAttribute("aInfo", new THREE.InstancedBufferAttribute(new Float32Array(sites.flatMap((s) => [s.start, s.size, s.seed, 0])), 4));
  geo.instanceCount = sites.length;
  const uniforms = { uFire: { value: 0 }, uBurnt: { value: 0 }, uTime: { value: 0 }, uBody: { value: SIGNAL.clone().multiplyScalar(1.5) }, uHeart: { value: SIGNAL.clone().lerp(INK, 0.55).multiplyScalar(2.2) } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    vertexShader: /* glsl */ `
      uniform float uFire, uBurnt, uTime; attribute vec3 aPos; attribute vec4 aInfo; varying vec2 vQ; varying float vK; varying float vSeed;
      void main() {
        float g = smoothstep(aInfo.x, aInfo.x + 0.14, uFire) * (1.0 - 0.35 * uBurnt);
        vK = g;
        vSeed = aInfo.z;
        vec4 c = modelViewMatrix * vec4(aPos, 1.0);
        vec3 up = (viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
        vec2 u = up.xy;
        float l = length(u);
        u = l > 0.25 ? u / l : vec2(0.0, 1.0); // seen from above, a flame stands up the screen
        vec2 r = vec2(u.y, -u.x);
        float h = aInfo.y * (0.25 + 0.75 * g);
        float w = h * 0.5;
        c.xy += r * position.x * w + u * position.y * h;
        vQ = position.xy;
        gl_Position = projectionMatrix * c;
        if (g < 0.003) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uBody, uHeart; varying vec2 vQ; varying float vK; varying float vSeed;
      void main() {
        float y = clamp(vQ.y, 0.0, 1.0);
        // a slow sway, never a flicker
        float off = 0.13 * y * sin(y * 3.1 + uTime * 2.2 + vSeed * 6.28) + 0.05 * y * sin(y * 7.0 - uTime * 3.1 + vSeed * 3.0);
        float w = 0.78 * pow(clamp(1.0 - y, 0.0, 1.0), 0.8) * (0.55 + 0.45 * smoothstep(0.0, 0.3, y));
        float d = abs(vQ.x - off) / max(w, 1e-3);
        float body = (1.0 - smoothstep(0.55, 1.0, d)) * (1.0 - smoothstep(0.7, 1.0, y));
        float heart = (1.0 - smoothstep(0.0, 0.5, d)) * (1.0 - smoothstep(0.05, 0.42, y));
        float halo = exp(-1.7 * d) * 0.16 * (1.0 - y);
        vec3 col = uBody * (body * (1.0 - 0.45 * y) + halo) + uHeart * heart;
        gl_FragColor = vec4(col * vK, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  return { mesh, uniforms };
}

/** Embers carried up from the fire: streaks born again in turn, each from its place, a pure function of uTime. */
function makeEmbers(sites, count, seed) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const pos = new Float32Array(count * 3);
  const info = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const s = sites[i % sites.length];
    pos.set(s.at, i * 3);
    info.set([s.start, rand(), 0.22 + rand() * 0.25, (rand() - 0.5) * 2], i * 4);
  }
  geo.setAttribute("aPos", new THREE.InstancedBufferAttribute(pos, 3));
  geo.setAttribute("aInfo", new THREE.InstancedBufferAttribute(info, 4));
  geo.instanceCount = count;
  const uniforms = { uFire: { value: 0 }, uTime: { value: 0 }, uRes: { value: RES }, uColor: { value: HOT.clone().multiplyScalar(2.0) } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uFire, uTime; uniform vec2 uRes; attribute vec3 aPos; attribute vec4 aInfo; varying vec2 vQ; varying float vA;
        void main() {
          float g = smoothstep(aInfo.x + 0.05, aInfo.x + 0.2, uFire);
          float life = fract(aInfo.y + uTime * aInfo.z);
          vec3 c = aPos + vec3(aInfo.w * 7.0 * life + 1.5 * sin(uTime * 1.3 + aInfo.y * 9.0) * life, 4.0 + 46.0 * life, 0.6 * aInfo.w * 6.0 * life);
          vec3 way = vec3(0.12 * aInfo.w, 1.0, 0.0);
          float h = 1.4 * (1.0 - 0.5 * life);
          vec4 a = projectionMatrix * modelViewMatrix * vec4(c - way * h, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(c + way * h, 1.0);
          vQ = position.xy;
          vA = g * pow(1.0 - life, 1.4) * smoothstep(0.0, 0.08, life);
          if (a.w < 1.0 || b.w < 1.0 || g < 0.003) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          vec2 run = (b.xy / b.w - a.xy / a.w) * uRes;
          float len = length(run);
          run = len > 1e-4 ? run / len : vec2(1.0, 0.0);
          vec4 p = position.x < 0.0 ? a : b;
          p.xy += vec2(-run.y, run.x) * position.y * (2.2 / uRes) * p.w;
          gl_Position = p;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying vec2 vQ; varying float vA;
        void main() {
          float a = (1.0 - vQ.y * vQ.y) * pow(clamp(1.0 - abs(vQ.x), 0.0, 1.0), 1.2);
          gl_FragColor = vec4(uColor * a * vA, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  return { mesh, uniforms };
}

/** A table on the bench: its body (solid, matt), and on it a ship's deck drawn at `k` (cm of table per cm of ship). */
function makeTable({ outline, k, lines: drawn, zones }) {
  const group = new THREE.Group();
  const part = makePart("table");
  group.add(part);
  const wood = solid(0x262b2f, { rough: 0.85, env: 0.5 });
  addMesh(part, box(TABLE.w, TABLE.top, TABLE.l, 1.6), wood, { pos: [0, TABLE.top / 2, 0], edgeOpacity: 0.55 });
  const Y = TABLE.top + 0.06;
  // the deck, filled
  const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x * k, -z * k)));
  const fill = new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2).translate(0, Y, 0);
  const bounds = zones ?? [-1e6, -1e5, -1e5, -1e5, -1e5, -1e5, 1e6];
  const plan = planMat(bounds.map((b) => b * k));
  const fillMesh = new THREE.Mesh(fill, plan);
  fillMesh.renderOrder = 1;
  group.add(fillMesh);
  // the lines: the outline, the runway, the catapults, the island, the lifts — each ≥ 2 px (fat lines)
  const lineList = [];
  const draw = (pts, { width = 2.2, opacity = 0.75, color = BRAND.ink, closed = false } = {}) => {
    const p = pts.map(([x, z]) => [x * k, Y + 0.25, z * k]);
    if (closed) p.push(p[0]);
    const l = fatLine(p, { width, opacity, color });
    group.add(l);
    lineList.push(l);
    return l;
  };
  draw(outline, { width: 2.4, opacity: 0.85, closed: true });
  for (const d of drawn) draw(d.pts, d);
  // the zones' borders, across the deck
  const zoneLines = [];
  if (zones) {
    for (let i = 1; i < 6; i++) {
      const [lo, hi] = spanAt(outline, zones[i]);
      if (!Number.isFinite(lo)) continue;
      zoneLines.push(draw([[lo, zones[i]], [hi, zones[i]]], { width: 2, opacity: 0.6, color: BRAND.ink }));
    }
  }
  for (const l of zoneLines) l.visible = false;
  return { group, plan, zoneLines, Y, k };
}

/* ───────────────────────────────────────────────────────────── the whole cast */

export function buildBord() {
  /* ── your aircraft, the next, the tanker ── */
  const rafale = buildHero();

  const nextMats = lightMats({ lines: 0.5, near: 5000, far: 14000 });
  const nextJet = makeLightJet(nextMats, { nav: true });
  const next = {
    group: nextJet.group,
    A: {},
    update(p = {}, time = 0) {
      const a = clamp01(p.jet ?? 1);
      nextJet.group.visible = a > 0.004;
      setLightAmount(nextMats, a);
      setLightGas(nextMats, p.gas ?? 0.5, a);
      nextMats.nav.uniforms.uAmount.value = smooth(0.25, 0.75, p.night ?? 0) * a;
      nextJet.gear.visible = (p.gear ?? 1) > 0.5;
    },
  };

  const tankMats = lightMats({ lines: 0.5, near: 5000, far: 16000 });
  const tankJet = makeLightJet(tankMats, { gear: false, nav: true });
  // the buddy pod under its belly (solid), the hose trailing back and down (solid), the basket (veille)
  const podMat = solid(0x6b747b, { rough: 0.55, metal: 0.3, coat: 0.3 });
  const hoseMat = solid(0x7d868c, { rough: 0.6, env: 0.9 }); // light enough to read against the night
  const basketMat = solid(0x2f8a66, { rough: 0.5, env: 0.8 });
  basketMat.emissive = VEILLE.clone();
  basketMat.emissiveIntensity = 0.5;
  const podPart = makePart("pod");
  tankJet.group.add(podPart);
  addMesh(podPart, new THREE.CapsuleGeometry(24, 330, 8, 24).rotateX(Math.PI / 2), podMat, { pos: [0, 96, 440], edgeOpacity: 0.5 });
  addMesh(podPart, box(10, 26, 60, 2), podMat, { pos: [0, 128, 440], edgeOpacity: 0.4 });
  const hoseG = new THREE.Group();
  hoseG.position.set(0, 92, 640);
  podPart.add(hoseG);
  const HOSE = new THREE.CatmullRomCurve3([V(0, 0, 0), V(0, -20, 260), V(0, -70, 620), V(0, -140, 1050), V(0, -205, 1420)]);
  addMesh(podPart, new THREE.TubeGeometry(HOSE, 48, 4.6, 10), hoseMat, { edges: false });
  hoseG.add(podPart.children.at(-1));
  const basket = new THREE.Group();
  basket.position.copy(HOSE.getPoint(1));
  hoseG.add(basket);
  {
    const ringM = addMesh(podPart, new THREE.TorusGeometry(36, 3.6, 10, 40), basketMat, { edges: false });
    ringM.position.set(0, -6, 48);
    basket.add(ringM);
    const collar = addMesh(podPart, cyl(8, 22, 1, 24).rotateX(Math.PI / 2), basketMat, { edgeOpacity: 0.5 });
    collar.position.set(0, 0, 4);
    basket.add(collar);
    const spokes = [];
    for (let i = 0; i < 10; i++) {
      const a = (TAU * i) / 10;
      spokes.push(strutGeo([7 * Math.cos(a), 7 * Math.sin(a), 12], [32 * Math.cos(a), -6 + 32 * Math.sin(a), 48], 1.3, 6));
    }
    const sp = addMesh(podPart, merge(spokes), basketMat, { edges: false });
    basket.add(sp);
  }
  const tankNavK = { v: 0 };
  const tanker = {
    group: tankJet.group,
    A: { basket },
    update(p = {}, time = 0) {
      const a = clamp01(p.jet ?? 1);
      tankJet.group.visible = a > 0.004;
      setLightAmount(tankMats, a);
      setLightGas(tankMats, 0.7, a);
      tankNavK.v = smooth(0.25, 0.75, p.night ?? 0);
      tankMats.nav.uniforms.uAmount.value = tankNavK.v * a;
      setPartOpacity(podPart, a);
      basketMat.emissiveIntensity = 0.7 + 0.8 * tankNavK.v;
      // the hose breathes slowly in the slipstream (rotations around its root: no geometry rebuilt)
      hoseG.rotation.y = 0.018 * Math.sin(time * 0.53) + 0.008 * Math.sin(time * 1.21 + 0.4);
      hoseG.rotation.x = 0.012 * Math.sin(time * 0.41 + 1.3);
      basket.rotation.z = 0.08 * Math.sin(time * 0.7);
    },
  };

  /* ── the parked aircraft (on deck), the hangar's, the pair on the forward lift ── */
  const parkMats = lightMats({ lines: 0.42, near: 4500, far: 12000 });
  const parked = new THREE.Group();
  for (const [x, z, yaw] of PARK) {
    const j = makeLightJet(parkMats);
    // PARK gives where the aircraft STANDS (its middle): our origin is under the nose wheel, ≈ 4.3 m ahead of it
    const r = yaw * DEG;
    j.group.position.set(x - 430 * Math.sin(r), 0, z - 430 * Math.cos(r));
    j.group.rotation.y = r;
    parked.add(j.group);
  }
  const fleetMats = lightMats({ lines: 0.4, near: 4000, far: 11000 });
  const fleet = new THREE.Group();
  const HF = [[-650, -4800, 30], [650, -3000, -30], [-650, -600, 30], [650, 1500, -30], [-650, 3800, 30], [650, 5800, -30]];
  for (const [x, z, yaw] of HF) {
    const j = makeLightJet(fleetMats);
    const r = yaw * DEG;
    j.group.position.set(x - 430 * Math.sin(r), HANGAR.floor, z - 430 * Math.cos(r));
    j.group.rotation.y = r;
    fleet.add(j.group);
  }
  const liftPair = new THREE.Group();
  for (const [x, z, yaw] of [[-250, -1000, 0], [250, 1000, 180]]) {
    const j = makeLightJet(fleetMats);
    const r = yaw * DEG;
    j.group.position.set(x - 430 * Math.sin(r), 0, z - 430 * Math.cos(r));
    j.group.rotation.y = r;
    liftPair.add(j.group);
  }

  /* ── the people ── */
  const crewG = new THREE.Group();
  // YOUR YELLOW DOG: glass; his vest, the only solid thing on him, veille
  const dogFig = person({ order: 20, glassK: 1 });
  const dog = new THREE.Group();
  dog.position.set(...CREW.dog);
  dog.add(dogFig.group);
  crewG.add(dog);
  const vestMat = solid(0x3d9c75, { rough: 0.6, env: 0.6 });
  vestMat.emissive = VEILLE.clone();
  const vest = new THREE.Mesh(
    lathe([[12.4, 103], [12.6, 110], [15.6, 127], [18.9, 140.5], [18.3, 145.5], [12.0, 149]], 40, { bevel: 0.4 }),
    vestMat,
  );
  vest.scale.z = 0.66;
  vest.position.y = -dogFig.HIP;
  vest.castShadow = false;
  dogFig.torso.add(vest);
  const DS = { sig: -1 };
  const tA = V();
  const tB = V();
  const tD = V();
  const tP = V();
  /** His gestures: his frame faces +z (your nose), +x is his left. */
  function poseDog(sig, time) {
    const f = dogFig;
    if (sig !== DS.sig) {
      DS.sig = sig;
      // the body: standing, or kneeling turned toward the bow (his left arm then points along the catapult, to the bow)
      const kneel = sig === 4;
      f.group.position.y = kneel ? -40 : 0;
      f.group.rotation.y = kneel ? Math.PI / 2 : 0;
      if (kneel) {
        f.leg("R", V(-8.6, 46, -36), V(0, -0.2, 1), V(0, -0.3, -1));
        f.leg("L", V(8.6, 48, 32), V(0, 1, 0.6));
        f.lean(12);
      } else {
        f.leg("L", V(9.5, 8, 2));
        f.leg("R", V(-9.5, 8, -2));
        f.lean(0);
      }
    }
    const w = TAU * time;
    switch (sig) {
      case 1: { // "come forward": both arms up, the hands beckoning toward his face
        const k = 0.5 + 0.5 * Math.sin(w * 0.95);
        f.reach("L", tA.set(26, 176 + 4 * k, 26 - 18 * k), tB.set(1, -0.3, 0.3), { dir: tD.set(0, 1, -0.4), palm: tP.set(0, 0, -1) });
        f.reach("R", tA.set(-26, 176 + 4 * k, 26 - 18 * k), tB.set(-1, -0.3, 0.3), { dir: tD, palm: tP });
        break;
      }
      case 2: // "tension": one hand raised, flat, toward you
        f.reach("R", tA.set(-27, 196, 14), tB.set(-1, -0.4, 0), { dir: tD.set(0, 1, 0.1), palm: tP.set(0, 0, 1) });
        f.reach("L", tA.set(21, 92, 4));
        break;
      case 3: // "full power": the raised hand circles over his head, two fingers up
        f.reach("R", tA.set(-6 + 11 * Math.cos(w * 1.15), 196, 6 + 11 * Math.sin(w * 1.15)), tB.set(-1, -0.2, 0), { dir: tD.set(0, 1, 0), palm: tP.set(1, 0, 0) });
        f.reach("L", tA.set(21, 92, 4));
        break;
      case 4: // "launch": kneeling, his left arm straight out toward the bow (his +x once turned), the right hand on his knee
        f.reach("L", tA.set(70, 122, 14), tB.set(0, -1, 0), { dir: tD.set(1, -0.15, 0), palm: tP.set(0, -1, 0) });
        f.reach("R", tA.set(-12, 78, 30));
        break;
      case 5: // "stop": arms crossed over his head
        f.reach("L", tA.set(-12, 190, 9), tB.set(1, -0.2, 0.2), { dir: tD.set(-0.6, 0.8, 0), palm: tP.set(0, 0, 1) });
        f.reach("R", tA.set(12, 192, 7), tB.set(-1, -0.2, 0.2), { dir: tD.set(0.6, 0.8, 0), palm: tP });
        break;
      case 6: { // "wave off": both arms sweeping over his head, crossing
        const k = Math.sin(w * 1.1);
        f.reach("L", tA.set(4 + 30 * k, 188 - 6 * Math.abs(k), 8), tB.set(1, -0.3, 0.1), { dir: tD.set(0.3 * k, 1, 0), palm: tP.set(0, 0, 1) });
        f.reach("R", tA.set(-4 - 30 * k, 188 - 6 * Math.abs(k), 8), tB.set(-1, -0.3, 0.1), { dir: tD.set(-0.3 * k, 1, 0), palm: tP });
        break;
      }
      default:
        f.reach("L", tA.set(20.5, 92, 3));
        f.reach("R", tA.set(-20.5, 92, 3));
    }
  }

  // THE DECK CREW, clear of the tracks, turned toward your aircraft
  const others = new THREE.Group();
  const NG = CAT[0].from;
  const otherFigs = CREW.others.map((o, i) => {
    const f = person({ order: 20, glassK: 0.85 });
    f.group.position.set(...o);
    f.group.rotation.y = yawTo(o, NG);
    if (i === 0) {
      f.reach("L", V(-6, 128, 12), V(1, -0.4, 0));
      f.reach("R", V(6, 126, 14), V(-1, -0.4, 0)); // arms crossed
    } else if (i === 1) {
      f.reach("R", V(-30, 150, 40), V(-1, -0.5, 0), { dir: V(-0.2, 0.3, 1) }); // pointing
    } else if (i === 2) {
      f.reach("L", V(16, 168, 8), V(1, -0.2, 0.1)); // a hand to the ear defenders
    }
    others.add(f.group);
    return f;
  });
  crewG.add(others);

  // THE LANDING SIGNAL OFFICER and his team, on their platform at the port edge, facing the aircraft that comes
  const lso = new THREE.Group();
  lso.position.set(...LSO.at);
  lso.rotation.y = Math.atan2(-ANGLED_DIR[0], -ANGLED_DIR[2]); // facing astern along the runway
  crewG.add(lso);
  const deckMat = glass(BRAND.ink, { base: 0, rim: 0.05, power: 3, edge: 0.35 }); // its lip only: a thin box seen raking is otherwise a grey slab
  const platform = new THREE.Mesh(new THREE.BoxGeometry(320, 8, 260), deckMat);
  platform.position.set(-40, -4, 30);
  lso.add(platform);
  const shield = new THREE.Mesh(new THREE.BoxGeometry(300, 110, 4), deckMat); // the wind screen at his back
  shield.position.set(-40, 55, -95);
  lso.add(shield);
  asShell([platform, shield], 22);
  const officer = person({ order: 20, glassK: 1 });
  lso.add(officer.group);
  const team = [[-130, -30], [-200, 10]].map(([x, z], i) => {
    const f = person({ order: 20, glassK: 0.7 });
    f.group.position.set(x, 0, z);
    if (i === 0) {
      f.reach("L", V(-6, 128, 12), V(1, -0.4, 0));
      f.reach("R", V(6, 126, 14), V(-1, -0.4, 0));
    } else f.reach("R", V(-16, 150, 18), V(-1, -0.4, 0)); // a headset
    lso.add(f.group);
    return f;
  });
  const handsetMat = solid(0x4a5156, { rough: 0.55, coat: 0.3, env: 0.9 });
  const handset = new THREE.Group();
  officer.group.add(handset);
  const hs = new THREE.Mesh(box(3.6, 3.2, 15, 1), handsetMat);
  hs.position.set(0, -2.8, 2);
  hs.add(edgesOf(hs.geometry, { width: 1.8, opacity: 0.5 }));
  handset.add(hs);
  // the paddles of before the 1960s: one veille (his left), one signal
  const paddleMats = [VEILLE, SIGNAL].map((c) => {
    const m = solid(c.clone().multiplyScalar(0.55), { rough: 0.6, env: 0.6 });
    m.emissive = c.clone();
    m.emissiveIntensity = 0.7;
    return m;
  });
  const paddleGeo = plate([[-17, -15], [17, -15], [17, 15], [-17, 15]], 2, { bevel: 0.8 });
  const paddles = paddleMats.map((m, i) => {
    const g = new THREE.Group();
    const face = new THREE.Mesh(paddleGeo, m);
    face.position.set(0, 0, -1);
    face.add(edgesOf(paddleGeo, { width: 1.8, opacity: 0.5 }));
    const handle = new THREE.Mesh(cyl(1.4, 20, 0.3, 12), handsetMat);
    handle.position.set(0, -24, 0);
    g.add(face, handle);
    g.visible = false;
    officer.group.add(g);
    return g;
  });
  const LS = { arm: -1, paddles: -1 };
  function poseLso(arm, pad) {
    if (arm === LS.arm && pad === LS.paddles) return;
    LS.arm = arm;
    LS.paddles = pad;
    const f = officer;
    if (pad > 0.004) {
      const tiltP = smooth(0.5, 1, pad) * 28 * DEG;
      f.reach("L", tA.set(72, 150, 10), tB.set(0.2, -1, 0), { dir: tD.set(1, 0.1, 0), palm: tP.set(0, 0, 1) });
      f.reach("R", tA.set(-72, 150, 10), tB.set(-0.2, -1, 0), { dir: tD.set(-1, 0.1, 0), palm: tP });
      paddles[0].position.copy(f.arms.L.hand.position).add(tA.set(4, 20, 2));
      paddles[1].position.copy(f.arms.R.hand.position).add(tA.set(-4, 20, 2));
      paddles[0].rotation.z = -tiltP;
      paddles[1].rotation.z = tiltP;
      paddles[0].visible = paddles[1].visible = true;
      handset.visible = false;
    } else {
      paddles[0].visible = paddles[1].visible = false;
      handset.visible = true;
      // the handset: at his chest (0) → raised high over his head (1: "wave off")
      f.reach("R", tA.set(lerp(-14, -24, arm), lerp(122, 198, arm), lerp(26, 12, arm)), tB.set(-1, -0.5, 0.1), { dir: tD.set(0, lerp(0.3, 1, arm), lerp(0.9, 0.1, arm)), palm: tP.set(1, 0, 0) });
      f.reach("L", tA.set(21, 94, 6));
      handset.position.copy(f.arms.R.hand.position);
      handset.quaternion.copy(f.arms.R.hand.quaternion);
    }
  }

  // THE CABIN: the engineer and the operator, seated (their origin on the floor, between their feet)
  const cabin = [0, 1].map((i) => {
    const o = new THREE.Group();
    const f = person({ order: 20, glassK: 0.85 });
    f.group.position.y = 46 - f.HIP;
    f.leg("L", V(9, f.HIP - 46 + 8, 44), V(0, 1, 0.3));
    f.leg("R", V(-9, f.HIP - 46 + 8, 46), V(0, 1, 0.3));
    f.reach("L", V(17, 112, 34), V(1, -0.6, -0.2));
    f.reach("R", V(-17, i ? 124 : 112, i ? 30 : 34), V(-1, -0.6, -0.2));
    f.lean(6);
    o.add(f.group);
    o.userData.fig = f;
    return o;
  });

  /* ── Pedro ── */
  const ped = makePedro();
  const pedroG = ped.group;
  pedroG.position.set(...PEDRO.at);
  let pedroWas = -1;

  /* ── the deck-plan table (item 1): the Charles de Gaulle at 1:90 ── */
  const KC = 290 / SHIP.len; // 290 cm of table for 261.5 m of ship
  const ang = (s, off) => {
    const p = onAngled(s, off);
    return [p[0], p[2]];
  };
  const rect = ([x0, x1], [z0, z1]) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  const CDG_ZONES = [SHIP.bow, -8500, -4300, 0, 4600, 9000, SHIP.stern];
  const boardT = makeTable({
    outline: SHIP.deck,
    k: KC,
    zones: CDG_ZONES,
    lines: [
      { pts: [ang(0, -ANGLED.half), ang(ANGLED.len, -ANGLED.half)], opacity: 0.45, width: 2 },
      { pts: [ang(0, ANGLED.half), ang(ANGLED.len, ANGLED.half)], opacity: 0.45, width: 2 },
      { pts: [ang(0, 0), ang(ANGLED.len, 0)], opacity: 0.3, width: 2 },
      ...CAT.map((c) => ({ pts: [[c.from[0], c.from[2]], [c.to[0], c.to[2]]], opacity: 0.7, width: 2.2 })),
      { pts: rect(ISLAND.x, ISLAND.z), opacity: 0.7, width: 2.2, closed: true },
      ...LIFTS.map((l) => ({ pts: rect(l.x, l.z), opacity: 0.5, width: 2, closed: true })),
    ],
  });
  const board = boardT.group;
  // the little aircraft: [x, z, yaw°] in the ship's frame (the middle of the aircraft); red: "qui ne voleront pas de sitôt"
  const CDG_TOKENS = [
    [-200, -5500 + 430, 0], // yours, on the bow catapult
    [PARK[0][0], PARK[0][1], PARK[0][2]], [PARK[1][0], PARK[1][1], PARK[1][2]], [PARK[2][0], PARK[2][1], PARK[2][2]], [PARK[3][0], PARK[3][1], PARK[3][2]], [PARK[4][0], PARK[4][1], PARK[4][2]],
    [-1700, -9000, 20], [-2300, -6800, 15], [-900, 11200, 180], [300, 11600, 180], [1300, 3200, -90], [-1600, 2500, 30], [900, -2600, 10], [-400, 7800, 160],
  ];
  const CDG_RED = new Set([3, 5, 8]); // PARK[2], PARK[4] and one at the stern
  const tokenMat = solid(0xc9c6bd, { rough: 0.55, env: 0.8 });
  const rafaleToken = tokenGeo(RAFALE_TOP, (1535 * KC) / 17);
  const discGeo = new THREE.CircleGeometry(2.6, 28).rotateX(-Math.PI / 2);
  const greenMat = glow(BRAND.veille, 1.2);
  const redMat = glow(BRAND.signal, 1.3);
  const boardTokens = CDG_TOKENS.map(([x, z, yaw], i) => {
    const g = new THREE.Group();
    g.position.set(x * KC, boardT.Y + 0.1, z * KC);
    g.rotation.y = yaw * DEG;
    const m = new THREE.Mesh(rafaleToken, tokenMat);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    const red = CDG_RED.has(i);
    const disc = new THREE.Mesh(discGeo, red ? redMat : greenMat);
    disc.position.set(0, 1.3, 1.2);
    disc.renderOrder = 3;
    g.add(disc);
    board.add(g);
    return { g, disc, red, order: i };
  });

  /* ── the Forrestal's table (item 3), 1967: another contour, the aircraft ranged aft, the rocket, the fire ── */
  const KF = 320 / 31700; // 320 cm of table for its 317 m
  const FM = 100; // the outline below is in metres
  const F_DECK = [[-24, 158], [24, 158], [36, 130], [40, 60], [40, -40], [37, -100], [26, -135], [10, -156], [0, -158], [-10, -156], [-24, -135], [-32, -100], [-33, -60], [-46, -40], [-50, -20], [-46, 20], [-38, 80], [-32, 130]].map(([x, z]) => [x * FM, z * FM]);
  const fAng = (s, off) => {
    const a = 10.5 * DEG;
    return [(6 - s * Math.sin(a) + off * Math.cos(a)) * FM, (150 - s * Math.cos(a) - off * Math.sin(a)) * FM];
  };
  const mRect = (x, z) => rect(x.map((v) => v * FM), z.map((v) => v * FM));
  const forT = makeTable({
    outline: F_DECK,
    k: KF,
    lines: [
      { pts: [fAng(0, -17), fAng(215, -17)], opacity: 0.45, width: 2 },
      { pts: [fAng(0, 17), fAng(215, 17)], opacity: 0.45, width: 2 },
      { pts: [[-8 * FM, -90 * FM], [-8 * FM, -150 * FM]], opacity: 0.6, width: 2.1 },
      { pts: [[8 * FM, -90 * FM], [8 * FM, -150 * FM]], opacity: 0.6, width: 2.1 },
      { pts: [fAng(140, -6), fAng(200, -6)], opacity: 0.6, width: 2.1 },
      { pts: [mRect([30, 39], [-30, 5])][0], opacity: 0.7, width: 2.2, closed: true },
      { pts: mRect([40, 52], [-80, -62]), opacity: 0.45, width: 2, closed: true },
      { pts: mRect([40, 52], [-55, -37]), opacity: 0.45, width: 2, closed: true },
      { pts: mRect([40, 52], [20, 38]), opacity: 0.45, width: 2, closed: true },
      { pts: mRect([-60, -48], [-30, -12]), opacity: 0.45, width: 2, closed: true },
    ],
  });
  const forrestal = forT.group;
  // aircraft ranged aft for the second launch: [x m, z m, yaw°, scale] — the starboard row (larger, like F-4s), the port row (A-4s)
  const F_TOKENS = [
    [27, 96, -120, 1.1], [27, 113, -120, 1.1], [27, 130, -120, 1.1], [14, 104, -150, 1.1],
    [-22, 100, 140, 0.8], [-20, 117, 140, 0.8], [-18, 134, 140, 0.8], [-6, 88, 165, 0.8],
    [2, 122, 180, 0.8], [3, 141, 180, 0.8], [12, 146, -170, 1.1],
    [24, -112, 0, 1.1], [-20, -116, 8, 0.8], [0, -130, 0, 1.1],
  ];
  const SOURCE = 1; // the F-4 whose rocket goes off (starboard, aft)
  const TARGET = 5; // the A-4 it hits, across the deck (port, aft)
  const fTokenMat = solid(0xc9c6bd, { rough: 0.55, env: 0.8 });
  const fDoomedMat = solid(0xc9c6bd, { rough: 0.55, env: 0.8 }); // those the fire reaches: `burnt` darkens them
  const sweptGeo = tokenGeo(SWEPT_TOP, 1);
  const tAt = (i) => {
    const [x, z] = F_TOKENS[i];
    return [x * FM * KF, forT.Y + 0.1, z * FM * KF];
  };
  const T0 = tAt(TARGET);
  const dist = (i) => Math.hypot(tAt(i)[0] - T0[0], tAt(i)[2] - T0[2]);
  const doomed = new Set(F_TOKENS.map((_, i) => i).filter((i) => i !== SOURCE && dist(i) < 34 && F_TOKENS[i][1] > 0));
  const forTokens = F_TOKENS.map(([x, z, yaw, s], i) => {
    const g = new THREE.Group();
    g.position.set(...tAt(i));
    g.rotation.y = yaw * DEG;
    g.scale.setScalar(s);
    const m = new THREE.Mesh(sweptGeo, doomed.has(i) ? fDoomedMat : fTokenMat);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    forrestal.add(g);
    return { g, order: z > 0 ? i : i + 20 };
  });
  // the fire's places: the doomed aircraft (in order of distance from the one hit), and burning fuel on the deck between them
  const sites = [];
  const doomedList = [TARGET, ...[...doomed].filter((i) => i !== TARGET).sort((a, b) => dist(a) - dist(b))];
  const frand = rng(67);
  doomedList.forEach((i, n) => {
    const at = tAt(i);
    sites.push({ at: [at[0], at[1] + 1, at[2]], start: 0.02 + (0.72 * dist(i)) / 34, size: 16 + frand() * 6, seed: frand() });
  });
  for (const [x, z] of [[-14, 110], [-10, 126], [-4, 104], [6, 128], [-12, 96], [8, 112]]) {
    const at = [x * FM * KF, forT.Y + 0.3, z * FM * KF];
    const d = Math.hypot(at[0] - T0[0], at[2] - T0[2]);
    sites.push({ at, start: 0.08 + (0.72 * d) / 34, size: 9 + frand() * 5, seed: frand() });
  }
  const flames = makeFlames(sites);
  const embers = makeEmbers(sites, 90, 11);
  forrestal.add(flames.mesh, embers.mesh);
  const firePool = makePool({ radius: 60, color: BRAND.signal });
  firePool.mesh.position.set(T0[0] + 6, forT.Y + 0.2, T0[2] + 4);
  forrestal.add(firePool.mesh);
  // the rocket: a spark on the F-4, a head of light that flies across, its trail dying; the impact, a light that has a place
  const S0 = tAt(SOURCE);
  const sparkMat = softGlow(2.0);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), sparkMat);
  spark.position.set(S0[0], S0[1] + 2, S0[2]);
  spark.scale.setScalar(2.4);
  spark.renderOrder = 7;
  const headMat = softGlow(1.8);
  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), headMat);
  head.renderOrder = 7;
  const trail = makeRibbon(SIGNAL.clone().lerp(INK, 0.3).multiplyScalar(2.0), 3);
  const impactMat = softGlow(1.6);
  const impact = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), impactMat);
  impact.position.set(T0[0], T0[1] + 3, T0[2]);
  impact.renderOrder = 7;
  forrestal.add(spark, head, trail.mesh, impact);
  const along = (u, out) => out.set(lerp(S0[0], T0[0], u), lerp(S0[1], T0[1], u) + 3 + 9 * Math.sin(Math.PI * u), lerp(S0[2], T0[2], u));
  const vH = V();
  const vT = V();

  /* ── set: everything here but the aircraft that world.js updates ── */
  const S = { tok: -1, green: -1, red: -1, zones: -1, ftok: -1, burnt: -1, crew: -1, cabin: -1, lso: -1 };
  function set(p = {}, time = 0) {
    const place = p.place ?? 0;
    if (place !== 1) {
      /* the deck */
      const night = p.night ?? 0;
      const pk = clamp01(p.parked ?? 0.6);
      parked.visible = pk > 0.004;
      setLightAmount(parkMats, pk);
      setLightGas(parkMats, 0.5 * clamp01(p.running ?? 0), pk);
      const fl = clamp01(p.fleet ?? 0);
      fleet.visible = fl > 0.004;
      setLightAmount(fleetMats, fl);
      setLightGas(fleetMats, 0, fl);

      const dk = clamp01(p.dog ?? 1);
      fadePerson(dogFig, dk);
      dog.visible = dk > 0.004;
      if (dog.visible) {
        poseDog(Math.round(p.sig ?? 0), time);
        const vk = clamp01(p.vest ?? 0.35);
        vestMat.emissiveIntensity = (0.12 + 0.95 * Math.pow(vk, 1.4)) * dk;
        fadeMat(vestMat, dk);
      }
      const ck = clamp01(p.crew ?? 0.6);
      if (ck !== S.crew) {
        S.crew = ck;
        others.visible = ck > 0.004;
        for (const f of otherFigs) fadePerson(f, ck);
      }
      const cb = clamp01(p.cabinCrew ?? 0);
      if (cb !== S.cabin) {
        S.cabin = cb;
        for (const o of cabin) fadePerson(o.userData.fig, cb);
      }
      const lk = clamp01(p.lso ?? 0);
      lso.visible = lk > 0.004;
      if (lso.visible) {
        if (lk !== S.lso) {
          S.lso = lk;
          fadePerson(officer, lk);
          for (const f of team) fadePerson(f, lk * (1 - smooth(0, 0.3, p.paddles ?? 0)));
          deckMat.uniforms.uAmount.value = lk;
          fadeMat(handsetMat, lk);
        }
        poseLso(clamp01(p.lsoArm ?? 0), clamp01(p.paddles ?? 0));
        for (const m of paddleMats) m.emissiveIntensity = 0.45 + 0.6 * smooth(0.2, 0.8, night);
      }

      const pd = clamp01(p.pedro ?? 0);
      pedroG.visible = pd > 0.004;
      if (pedroG.visible) {
        if (pd !== pedroWas) {
          pedroWas = pd;
          for (const m of ped.mats) m.uniforms.uAmount.value = pd;
          ped.rotor.u.uAmount.value = pd;
          ped.tail.u.uAmount.value = pd;
          ped.frameMat.opacity = ped.frameMat.userData.base * pd;
          fadePerson(ped.pilot, pd);
          fadePerson(ped.diver, pd);
          for (const m of ped.maskMats) fadeMat(m, pd);
        }
        // a slow hover: it bobs and sways, never fast
        ped.bob.position.set(6 * Math.sin(time * 0.37), 14 * Math.sin(time * 0.52) + 5 * Math.sin(time * 0.91 + 1), 8 * Math.sin(time * 0.29 + 2));
        ped.bob.rotation.set(0.012 * Math.sin(time * 0.44), 0, 0.016 * Math.sin(time * 0.33 + 0.5));
      }
      return;
    }

    /* the bench */
    const item = Math.round(p.item ?? 0);
    if (item === 1) {
      const z = clamp01(p.zones ?? 0);
      if (z !== S.zones) {
        S.zones = z;
        boardT.plan.uniforms.uZones.value = z;
        boardT.zoneLines.forEach((l, i) => {
          const a = smooth(i / 6, (i + 1.5) / 6, z);
          l.visible = a > 0.01;
          l.material.opacity = 0.6 * a;
        });
      }
      const tk = clamp01(p.tokens ?? 0);
      if (tk !== S.tok) {
        S.tok = tk;
        const n = boardTokens.length;
        for (const t of boardTokens) {
          const a = smooth((t.order / n) * 0.85, (t.order / n) * 0.85 + 0.15, tk); // set down one by one
          t.g.visible = a > 0.01;
          t.g.scale.setScalar(Math.max(0.01, 0.6 + 0.4 * a));
          t.g.position.y = boardT.Y + 0.1 + 5 * (1 - a);
        }
      }
      const gr = clamp01(p.green ?? 0);
      const rd = clamp01(p.red ?? 0);
      if (gr !== S.green || rd !== S.red) {
        S.green = gr;
        S.red = rd;
        setGlow(greenMat, 1.2 * gr);
        setGlow(redMat, 1.35 * rd);
        for (const t of boardTokens) t.disc.visible = (t.red ? rd : gr) > 0.01;
      }
    } else if (item === 3) {
      const tk = clamp01(p.tokens ?? 0);
      if (tk !== S.ftok) {
        S.ftok = tk;
        const n = forTokens.length;
        forTokens.forEach((t, i) => {
          const a = smooth((i / n) * 0.85, (i / n) * 0.85 + 0.15, tk);
          t.g.visible = a > 0.01;
          t.g.position.y = forT.Y + 0.1 + 5 * (1 - a);
        });
      }
      const rocket = clamp01(p.rocket ?? 0);
      const fire = clamp01(p.fire ?? 0);
      const burnt = clamp01(p.burnt ?? 0);
      // the spark on the F-4 (rocket 0 → 0.05), a slow breath
      const sk = smooth(0.0, 0.03, rocket) * (1 - smooth(0.06, 0.2, rocket));
      spark.visible = sk > 0.004;
      sparkMat.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(1.8 * sk * (0.85 + 0.15 * Math.sin(time * 3.0)));
      // the head of light and its trail (0.05 → 1)
      const u = smooth(0.05, 1, rocket);
      const flying = rocket > 0.05 && rocket < 0.995;
      head.visible = trail.mesh.visible = flying;
      if (flying) {
        along(u, vH);
        along(Math.max(0, u - 0.28), vT);
        head.position.copy(vH);
        head.scale.setScalar(2.2);
        headMat.uniforms.uColor.value.copy(SIGNAL).lerp(INK, 0.35).multiplyScalar(2.4);
        trail.uniforms.uA.value.copy(vT);
        trail.uniforms.uB.value.copy(vH);
        trail.uniforms.uAmount.value = 1;
      }
      // the impact: it swells as the head arrives and dies small as the fire takes its place
      const ik = smooth(0.94, 1, rocket) * (1 - 0.75 * smooth(0.05, 0.4, fire));
      impact.visible = ik > 0.004;
      impact.scale.setScalar(3 + 5 * ik);
      impactMat.uniforms.uColor.value.copy(SIGNAL).lerp(INK, 0.5).multiplyScalar(2.2 * ik);
      // the fire, place after place
      flames.mesh.visible = embers.mesh.visible = fire > 0.004;
      flames.uniforms.uFire.value = fire;
      flames.uniforms.uBurnt.value = burnt;
      flames.uniforms.uTime.value = time;
      embers.uniforms.uFire.value = fire;
      embers.uniforms.uTime.value = time;
      const fk = smooth(0, 0.5, fire);
      firePool.mesh.visible = fk > 0.004;
      firePool.uniforms.uAmount.value = 0.32 * fk;
      if (burnt !== S.burnt) {
        S.burnt = burnt;
        fDoomedMat.color.setHex(0xc9c6bd).lerp(_burnt, burnt);
      }
    }
  }
  const _burnt = new THREE.Color(0x1d2124);
  set();

  return {
    rafale,
    next,
    tanker,
    parked,
    liftPair,
    fleet,
    crew: { group: crewG, dog, lso, cabin, dogFig, officer },
    pedro: { group: pedroG, diver: ped.diver },
    board,
    forrestal,
    set,
  };
}
