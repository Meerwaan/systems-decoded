// DOSSIER 015 — the aircraft: a single-seat Rafale M seen like an X-ray, coming down on the deck.
//
//   buildRafale() → { group, update(P, time, px), A }
//   P = { jet, pos, alt, nose, squat, hook, gas, puff, scrape, you, held }      (their meaning: FIRST, in world.js)
//
// A shell of glass and a few lines of structure — delta wing, canards, one fin, two nozzles — and SOLID in it only
// what the story is about: the three legs and their wheels (they hit the deck), the hook under the tail, between the
// nozzles (it takes the wire), the two nozzles (they answer the throttle) and, in the cockpit, the throttle on the
// left console with your left hand on it. You: a body of glass, a helmet.
//
// The airframe is built the way 007's two-seater was (jet.js: sections, `skin`, `aerofoil`, `patch`), with ONE
// place and a short canopy, in that file's frame: nose toward +z, LEFT wing toward +x, y = 0 under the main wheels,
// which stand at z = 0. That frame is turned half a turn here: on the deck the aircraft flies toward −z, and its
// left is port (−x).
//
// TWO NUMBERS PLACE IT: `pos` and `alt`, through hookAt() of plan.js — the point where the tip of the lowered hook
// is (the throat of its shoe, where the wire sits). `nose` pitches it around its main wheels; `squat` sinks it on
// its legs. The hook hangs LOWER than the wheels, as a real one does: down to its stop, or to the deck. Its tip is at
// hookAt in z whatever happens, and in y as soon as the wheels are on the deck or `held` is 1.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { makeContact, makePool } from "@kit/atmo.js";
import { solid, glow, setGlow, glass, asShell, lineMat, edgesOf, box, cyl, lathe, plate, anchor, makePart, addMesh, setPartOpacity } from "@kit/build3d.js";
import { hookAt } from "./plan.js";

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

// the contract, read once: where the hook's tip is for pos = 0, alt = 0, and what a metre of each moves
const [HX, HY, HZ] = hookAt(0, 0);
const PER_POS = hookAt(1, 0)[2] - HZ; // cm of z per metre of `pos`
const PER_ALT = hookAt(0, 1)[1] - HY; // cm of y per metre of `alt`

/** The aircraft in numbers, in its own frame (cm, degrees): nose +z, left wing +x, main wheels at z = 0 on y = 0. */
export const RAFALE_M = {
  length: 1535,
  span: 1088,
  height: 534,
  nose: 850,
  tail: -685, // where the nozzles end
  main: { x: 128, r: 38, wide: 27, stroke: 24 }, // the main wheels, and how far their legs give
  front: { x: 12.5, z: 530, r: 27, wide: 16, stroke: 42 }, // the twin nose wheels
  // the hook: its hinge under the keel, between the engines; `down`: its stop, below the aircraft's axis; `sole`: its shoe under the throat
  hook: { pivot: [0, 164, -410], length: 211, down: 47, stowed: -1.5, sole: HY },
  throttle: { x: 38, y: 229, from: 486, travel: 32 }, // on the left console; `gas` 0 → 1 pushes it `travel` cm forward
  stick: [-38, 226, 514],
  hips: [0, 220, 506], // you, in the seat
  recline: 27,
};
const { main: MAIN, front: FRONT, hook: HOOK, throttle: THR } = RAFALE_M;
const CANOPY = { front: 612, arch: 540, rear: 352 }; // the windscreen, then ONE canopy: a single-seater's

/* ───────────────────────────────────────────────────────────── shapes (the idiom of 007's jet.js) */

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

// The fuselage, station by station: half-width, keel, crest, and the height of its shoulder — the line the canopy
// sits on. Behind the single place the crest comes down at once into the dorsal spine: no second hump.
const AROUND = 64;
const SILL = 4; // the canopy is the arc of each section between points SILL and AROUND / 2 − SILL
const A0 = (2 * Math.PI * SILL) / AROUND;
const UPPER = 2 / 1.75;
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
  [470, 52, 151, 322, 254],
  [410, 53.5, 150, 318, 256],
  [352, 54.5, 150, 306, 257],
  [300, 55, 150, 300, 258],
  [238, 55, 152, 296, 258],
  [150, 54, 156, 291, 256],
  [0, 52, 162, 284, 252],
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
/** A piece of the canopy as a surface: `u` 0 at its front → 1 at its rear, `v` 0 on the left sill → 1 on the right one. */
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
const NOZZLE = { x: 45, y: 199, from: -612, r: 36.8, lip: 29.5 }; // each nozzle, from the end of its pod to RAFALE_M.tail

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

// The throat of a nozzle, seen from behind. At rest: a dark hole, a faint ember around it. At full power: a hard,
// bright core — its edge is sharp, it is not a flame — with the heat falling off to the wall. One-sided: seen from
// the front through the glass, it would be a ball of fire in the belly.
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

/**
 * Sparks: thin streaks that leave one point over and over (alive on the first frame, and slow: the film is in slow
 * motion), each drawn along its own way, long while it is fast, dying as it goes. Thrown astern (+z) and up.
 */
function makeSparks(count, seed) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)); // x: along the streak · y: across
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const dir = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // reach (cm), half-length (cm), phase, width (cm)
  const d = V();
  for (let i = 0; i < count; i++) {
    d.set((rand() - 0.5) * 1.3, 0.04 + rand() * 0.8, 0.4 + rand()).normalize();
    dir.set([d.x, d.y, d.z], i * 3);
    seeds.set([34 + Math.pow(rand(), 1.3) * 190, 4 + rand() * 12, rand(), 0.7 + rand() * 1.1], i * 4);
  }
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(dir, 3));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  geo.instanceCount = count;
  const uniforms = { uAt: { value: V() }, uTime: { value: 0 }, uAmount: { value: 0 }, uScale: { value: 2200 }, uRes: { value: RES }, uColor: { value: HOT.clone().multiplyScalar(2.3) } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uScale; uniform vec2 uRes; uniform vec3 uAt; attribute vec3 aDir; attribute vec4 aSeed; varying vec2 vQ; varying float vA;
        void main() {
          float life = fract(aSeed.z + uTime * (0.22 + 0.2 * fract(aSeed.z * 7.3)));
          float fly = 1.0 - (1.0 - life) * (1.0 - life);
          vec3 c = uAt + aDir * aSeed.x * fly;
          c.y = max(uAt.y + 0.5, c.y - 30.0 * life * life); // they fall back on the deck, never through it
          float h = aSeed.y * mix(1.0, 0.35, life);
          vec3 way = normalize(aDir + vec3(0.0, -0.9 * life, 0.0));
          vec4 a = projectionMatrix * modelViewMatrix * vec4(c - way * h, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(c + way * h, 1.0);
          vQ = position.xy;
          vA = pow(1.0 - life, 1.5) * smoothstep(0.0, 0.05, life);
          if (a.w < 1.0 || b.w < 1.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          vec2 run = (b.xy / b.w - a.xy / a.w) * uRes;
          float len = length(run);
          run = len > 1e-4 ? run / len : vec2(1.0, 0.0); // seen end-on it has no direction: never divide by its length
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

/* ───────────────────────────────────────────────────────────── the aircraft */

export function buildRafale() {
  const group = new THREE.Group(); // the ship's frame: `pos` and `alt` place it; its origin is the deck under the main wheels, `alt` up
  const flip = new THREE.Group(); // the aircraft's own frame, turned to fly toward −z
  flip.rotation.y = Math.PI;
  const tilt = new THREE.Group(); // what pitches, around the axle of the main wheels
  tilt.position.set(0, MAIN.r, 0);
  const plane = new THREE.Group(); // the airframe: it sinks on its legs
  plane.position.set(0, -MAIN.r, 0);
  group.add(flip);
  flip.add(tilt);
  tilt.add(plane);
  const fx = {};
  const A = {};

  const parts = []; // every solid piece: `jet` fades them together
  const newPart = (name, parent = plane) => {
    const p = makePart(name);
    parent.add(p);
    parts.push(p);
    return p;
  };
  /** A bar from `a` to `b` ([x, y, z] each), `r` thick at `a` (and `top` at `b`). */
  const strut = (part, a, b, r, material, { top = r, edge = 0.5, bevel } = {}) => {
    const from = V(...a);
    const to = V(...b);
    const mesh = addMesh(part, cyl(r, from.distanceTo(to), bevel ?? Math.min(0.7, r * 0.22), 40, top), material, { edgeOpacity: edge });
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, to.sub(from).normalize());
    return mesh;
  };
  /** A bar of a fixed length whose two ends move: returns what lays it between two points (Vector3). */
  const link = (part, r, len, material, at = 0) => {
    const mesh = addMesh(part, cyl(r, len, Math.min(0.5, r * 0.25), 24).translate(0, at * len, 0), material, { edgeOpacity: 0.45 });
    const d = V();
    return (a, b, from = 0.5) => {
      mesh.position.copy(a).lerp(b, from);
      mesh.quaternion.setFromUnitVectors(UP, d.subVectors(b, a).normalize());
    };
  };

  /* ── the metals: three values of grey, little metal (a mirror only shows a black studio) ── */
  const cast = solid(0x69737b, { rough: 0.58, metal: 0.3, coat: 0.35, coatRough: 0.45 }); // housings, brackets
  const steel = solid(0x8d959b, { rough: 0.42, metal: 0.4, env: 1.1 }); // braces, axles, links
  const bright = solid(0xd4d8da, { rough: 0.34, metal: 0.35, env: 1.25 }); // what slides: the pistons, the hook
  const rubber = solid(0x2c3237, { rough: 0.92, env: 0.5 }); // never black: a black tyre on a dark deck is a hole
  const alloy = solid(0xaab1b6, { rough: 0.45, metal: 0.35, env: 1.1 });
  const hookMat = solid(0xaeb5ba, { rough: 0.48, metal: 0.3, env: 1 }); // the lightest piece of the aircraft, never blown out
  const dark = solid(0x15191c, { rough: 0.88, env: 0.5 });
  const grey = solid(0x333a40, { rough: 0.8, metal: 0.1, env: 0.6 });

  /* ── the airframe: one shell of glass (the numbers of 007: seen along its length, a brighter fuselage is two neon tubes) ── */
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
    const list = [RAFALE_M.nose - 3, RAFALE_M.nose - 8, -640, -652, ...breaks];
    for (let z = RAFALE_M.nose; z > -640; z -= 15) if (!breaks.some((b) => Math.abs(b - z) < 7)) list.push(z);
    return list.sort((a, b) => b - a);
  })();
  const rings = zs.map(bodyRing);
  // open where the canopy sits: its own glass closes it
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
  run(frames, rings.filter((_, i) => zs[i] <= CANOPY.rear).map((ring) => ring[AROUND / 4])); // the dorsal spine
  const edge = ({ root, tip }, side, at) => at(side * root[0], root[1], tip[0] * side, tip[1], root, tip);
  for (const side of [1, -1]) {
    run(outline, podRing(POD[0][0], side), true); // the lip of the air intake
    run(frames, podRing(0, side).filter((_, j) => j % 2 === 0), true);
    run(frames, podRing(-450, side).filter((_, j) => j % 2 === 0), true);
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
  run(outline, [[0, 200, RAFALE_M.nose], [0, 199, RAFALE_M.nose + 34]]);
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

  /* ── the canopy: a windscreen and ONE pane, on a thin solid frame ── */
  pane(patch(canopySurf(CANOPY.front, CANOPY.arch), [0, 1], [0, 1], 8, 28), fx.canopy);
  pane(patch(canopySurf(CANOPY.arch, CANOPY.rear), [0, 1], [0, 1], 26, 28), fx.canopy);
  const cockpit = newPart("cockpit");
  const frameMat = solid(0x7b8287, { rough: 0.45, metal: 0.4 });
  const tube = (pts, r = 1.7) => addMesh(cockpit, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => V(...p))), 64, r, 8), frameMat, { edges: false });
  const arc = (z, n = 28) => Array.from({ length: n + 1 }, (_, k) => onSection(section(z), A0 + ((Math.PI - 2 * A0) * k) / n));
  // (two arches and no sills: from a camera at the sill a tube is a bar across the picture; the lip of the glass draws that line)
  tube(arc(CANOPY.arch), 1.8);
  tube(arc(CANOPY.rear), 1.6);

  /* ── the cockpit: a floor, the instrument panel, two side consoles, the seat — matt and dark: what counts in there is lighter ── */
  addMesh(cockpit, box(74, 3, 190, 0.8), dark, { pos: [0, 192.5, 505], edgeOpacity: 0.4 });
  addMesh(cockpit, box(57, 25, 4, 0.8), dark, { pos: [0, 238, 566], edgeOpacity: 0.5 });
  addMesh(cockpit, box(62, 3.5, 26, 1.2), dark, { pos: [0, 253, 571], edgeOpacity: 0.4 }); // the coaming
  fx.screens = glow(BRAND.ink, 0.4, { additive: true });
  for (const x of [-19, 0, 19]) {
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(14.6, 11), fx.screens);
    screen.position.set(x, 238, 563.8);
    screen.rotation.y = Math.PI;
    cockpit.add(screen);
  }
  for (const x of [-38, 38]) addMesh(cockpit, box(13, 14, 112, 1), dark, { pos: [x, 211, 505], edgeOpacity: 0.42 });
  // the seat: a pan, a back leaning like you, a headrest
  addMesh(cockpit, box(40, 9, 46, 1.5), grey, { pos: [0, 207.5, 526], edgeOpacity: 0.4 });
  const seat = new THREE.Group();
  seat.position.set(...RAFALE_M.hips);
  seat.rotation.x = -RAFALE_M.recline * DEG;
  cockpit.add(seat);
  const inSeat = (geometry, material, pos) => {
    const mesh = addMesh(cockpit, geometry, material, { pos, edgeOpacity: 0.4 });
    seat.add(mesh);
    return mesh;
  };
  inSeat(box(42, 84, 5, 1.2), grey, [0, 36, -14]);
  inSeat(box(23, 19, 9, 2), grey, [0, 86, -17]);
  // the stick, on the right console: a Rafale is flown with the right hand, the throttle in the left
  strut(cockpit, [RAFALE_M.stick[0], 218, RAFALE_M.stick[2]], [RAFALE_M.stick[0], 232, RAFALE_M.stick[2] + 1.5], 1.7, grey, { edge: 0.4 });

  /* ── the throttle, on the left console: two rails, the stop of full power ahead, and the lever your hand pushes ── */
  for (const dx of [-3.6, 3.6]) addMesh(cockpit, box(1.3, 1.4, THR.travel + 9, 0.3), steel, { pos: [THR.x + dx, 218.7, THR.from + THR.travel / 2], edgeOpacity: 0.5 });
  fx.stop = glow(BRAND.signal, 0.2);
  const stop = new THREE.Mesh(box(9.6, 2.6, 1.8, 0.4), fx.stop);
  stop.position.set(THR.x, 219.3, THR.from + THR.travel + 5.4);
  cockpit.add(stop);
  const lever = newPart("throttle");
  addMesh(lever, box(5.6, 1.6, 7.5, 0.4), bright, { pos: [THR.x, 219.2, 0], edgeOpacity: 0.5 }); // its carriage, on the rails
  addMesh(lever, box(2.6, THR.y - 219.5, 3.2, 0.5), bright, { pos: [THR.x, (THR.y + 219.5) / 2, 0], edgeOpacity: 0.5 });
  addMesh(lever, cyl(2.1, 11, 0.6, 32).rotateZ(Math.PI / 2), bright, { pos: [THR.x, THR.y, 0], edgeOpacity: 0.5 }); // the grip, across your palm
  A.throttle = anchor(lever, THR.x, THR.y, 0);

  /* ── you: a body of glass in the seat, a helmet; the left hand solid, on the throttle ── */
  const fig = makeFigure({ hands: "real", shell: true, order: 10, through: 0.15 });
  const FIG = [RAFALE_M.hips[0], RAFALE_M.hips[1] - fig.HIP, RAFALE_M.hips[2]]; // where the figure's own origin (between its feet, standing) goes
  fig.group.position.set(...FIG);
  plane.add(fig.group);
  fig.lean(-RAFALE_M.recline);
  fig.leg("L", V(9.5, 70, 68), V(0, 1, 0.25));
  fig.leg("R", V(-9.5, 70, 68), V(0, 1, 0.25));
  fig.hold("R", V(RAFALE_M.stick[0] - FIG[0], 229 - FIG[1], RAFALE_M.stick[2] + 1 - FIG[2]), V(0, 1, 0.1), { bar: 1.7, k: 1, bend: V(-0.55, -0.5, -0.65) });
  // the right hand is glass like the rest: only the hand the story is about stays solid
  for (const mesh of fig.arms.R.fingers.meshes) {
    mesh.material = fig.body;
    mesh.castShadow = false;
    asShell(mesh, 10);
  }
  fig.head.visible = false; // it is in the helmet
  const helmet = new THREE.Group();
  helmet.position.copy(fig.head.position);
  fig.torso.add(helmet);
  const helmetMat = solid(0xa3a9ac, { rough: 0.5, coat: 0.3, coatRough: 0.4, env: 0.9 });
  const visorMat = solid(0x12161a, { rough: 0.55, coat: 0.2, coatRough: 0.5, env: 0.8 }); // not a mirror: two points of the rim light in it are two red eyes
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
  const youMats = [fig.flesh, helmetMat, visorMat, maskMat, visorEdge.material]; // the solid of you: faded by `you`
  A.head = anchor(fig.torso, fig.head.position.x, fig.head.position.y, fig.head.position.z);
  A.cockpit = anchor(plane, 0, 250, 486);
  A.canopy = anchor(plane, 0, 322, 462);
  const HOLD = { palm: V(0, -1, 0), dir: V(0, 0, 1), k: 1, bar: 2.1, bend: V(0.55, -0.5, -0.65) };
  const ACROSS = V(1, 0, 0);
  const grip = V();

  /* ── the legs: solid, they are what hits the deck. A housing fixed to the airframe, and a foot — the bright piston,
     the axle, the wheel — that slides up into it (`squat`); a scissor of two links closes as it does ── */
  const legs = newPart("legs");
  const wheel = (part, x, y, z, r, wide, side) => {
    const h = wide / 2;
    const rim = r * 0.52;
    const turn = side > 0 ? -Math.PI / 2 : Math.PI / 2; // the profile's +y → outboard
    const tyre = lathe([[rim, -h * 0.84], [r * 0.82, -h], [r * 0.96, -h * 0.8], [r, -h * 0.4], [r, h * 0.4], [r * 0.96, h * 0.8], [r * 0.82, h], [rim, h * 0.84]], 64, { bevel: r * 0.05, round: 3 });
    addMesh(part, tyre.rotateZ(turn), rubber, { pos: [x, y, z], edges: false });
    const hub = lathe([[0.1, -h * 0.86], [rim * 1.03, -h * 0.86], [rim * 1.03, h * 0.88], [rim * 0.9, h * 0.74], [rim * 0.48, h * 0.74], [rim * 0.36, h * 0.46], [0.1, h * 0.46]], 48, { bevel: 0.5, round: 1 });
    addMesh(part, hub.rotateZ(turn), alloy, { pos: [x, y, z], edgeOpacity: 0.7 });
    // no spokes, no bolts: thin lines spinning only flicker. Two rings on the shoulders say "tyre"
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
    const lines = new LineSegments2(geo, lineMat(BRAND.ink, 1.9, { opacity: 0.42 }));
    lines.renderOrder = 2;
    part.userData.part.mats.add(lines.material);
    part.add(lines);
  };

  const mains = [1, -1].map((s) => {
    const top = V(s * 98, 172, 2); // where the leg enters the airframe
    const axle = V(s * 110, MAIN.r, 0);
    const u = axle.clone().sub(top);
    const len = u.length();
    u.normalize();
    const on = (d, dz = 0) => [top.x + u.x * d, top.y + u.y * d, top.z + u.z * d + dz];
    strut(legs, on(0), on(78), 7.4, cast, { top: 6.6 });
    strut(legs, on(72), on(79.5), 8.3, steel, { edge: 0.6 }); // its gland
    strut(legs, [s * 98, 172, -13], [s * 98, 172, 17], 5.2, cast); // the trunnion
    strut(legs, on(40), [s * 58, 171, 0], 3, steel); // the side brace, up into the belly
    strut(legs, on(46), [s * 98, 170, 52], 3.2, steel); // the drag brace, forward
    const foot = newPart(s > 0 ? "footL" : "footR");
    strut(foot, on(58), on(len), 4.5, bright, { edge: 0.4 });
    strut(foot, [s * 102, MAIN.r, 0], [s * 143, MAIN.r, 0], 4.2, steel);
    strut(foot, [s * 109.5, MAIN.r, 0], [s * 114.4, MAIN.r, 0], 16, cast, { edge: 0.5, bevel: 0.8 }); // the brake pack
    wheel(foot, s * MAIN.x, MAIN.r, 0, MAIN.r, MAIN.wide, s);
    A[s > 0 ? "wheelL" : "wheelR"] = anchor(foot, s * MAIN.x, MAIN.r, 0);
    const upper = V(...on(73, -8.6));
    const lower0 = V(...on(len - 10, -6.2));
    return { u, foot, upper, lower0, lower: V(), knee: V(), a: link(legs, 2.3, 34, steel), b: link(legs, 2.3, 34, steel), reach: 34 };
  });

  const nose = (() => {
    const top = V(0, 168, 522);
    const axle = V(0, FRONT.r, FRONT.z);
    const u = axle.clone().sub(top);
    const len = u.length();
    u.normalize();
    const on = (d, dz = 0) => [0, top.y + u.y * d, top.z + u.z * d + dz];
    strut(legs, on(0), on(76), 8.4, cast, { top: 7.4 }); // a carrier aircraft's nose leg: it is what the catapult pulls
    strut(legs, on(70), on(77.5), 9.3, steel, { edge: 0.6 });
    strut(legs, on(60), [0, 158, 444], 3.5, steel); // the drag brace, back into the keel
    const foot = newPart("footN");
    strut(foot, on(54), on(len), 5.3, bright, { edge: 0.4 });
    strut(foot, [-21, FRONT.r, FRONT.z], [21, FRONT.r, FRONT.z], 3.7, steel);
    for (const s of [1, -1]) wheel(foot, s * FRONT.x, FRONT.r, FRONT.z, FRONT.r, FRONT.wide, s);
    // the launch bar, raised: the mark of the navy's Rafale
    strut(foot, [0, FRONT.r + 5, FRONT.z + 5], [0, FRONT.r + 36, FRONT.z + 44], 2.5, steel);
    strut(foot, [-7, FRONT.r + 36, FRONT.z + 44], [7, FRONT.r + 36, FRONT.z + 44], 2.8, bright);
    A.noseWheel = anchor(foot, 0, FRONT.r, FRONT.z);
    const upper = V(...on(71, -9.6));
    const lower0 = V(...on(len - 9, -6.6));
    return { u, foot, upper, lower0, lower: V(), knee: V(), a: link(legs, 2.4, 37, steel), b: link(legs, 2.4, 37, steel), reach: 37 };
  })();
  const AFT = V(0, 0, -1);
  const along = V();
  /** The scissor of a leg whose foot has gone `up` cm into its housing. */
  const fold = (leg, up) => {
    leg.foot.position.copy(leg.u).multiplyScalar(-up);
    leg.lower.copy(leg.lower0).add(leg.foot.position);
    along.subVectors(leg.lower, leg.upper);
    const d = Math.min(along.length(), leg.reach * 2 - 0.5);
    along.normalize();
    leg.knee.copy(leg.upper).addScaledVector(along, d / 2).addScaledVector(AFT, Math.sqrt(Math.max(0, leg.reach * leg.reach - (d * d) / 4)));
    leg.a(leg.upper, leg.knee);
    leg.b(leg.knee, leg.lower);
  };

  /* ── the two engines: a solid nozzle each, a dark plate deep in it, the core on that plate, and the heat behind ── */
  const engines = newPart("engines");
  const nozzleMat = solid(0x363d43, { rough: 0.5, metal: 0.45, env: 1.1, double: true });
  const depth = RAFALE_M.tail - NOZZLE.from; // (negative: toward the tail)
  const ring = lathe([[33.4, 0], [NOZZLE.r, 0], [34.6, -depth * 0.5], [NOZZLE.lip, -depth], [27.2, -depth], [30.6, -depth * 0.42], [33.4, 0]], 64, { bevel: 0.8, round: 1 }).rotateX(-Math.PI / 2);
  fx.core = coreMat();
  fx.heat = heatMat();
  fx.trails = [];
  for (const side of [1, -1]) {
    addMesh(engines, ring, nozzleMat, { pos: [side * NOZZLE.x, NOZZLE.y, NOZZLE.from], edgeOpacity: 0.6 });
    const plateBack = addMesh(engines, new THREE.CircleGeometry(29.6, 48), dark, { pos: [side * NOZZLE.x, NOZZLE.y, NOZZLE.from - 38], rot: [0, Math.PI, 0], edges: false });
    plateBack.castShadow = false;
    const core = new THREE.Mesh(new THREE.CircleGeometry(28.6, 48), fx.core);
    core.position.set(side * NOZZLE.x, NOZZLE.y, NOZZLE.from - 40); // half-way down: seen 16° off the axis, the lip must not hide it
    core.rotation.y = Math.PI;
    core.renderOrder = 4;
    const trail = new THREE.Mesh(new THREE.CylinderGeometry(9, 26.5, 1, 40, 12, true).translate(0, 0.5, 0).rotateX(-Math.PI / 2), fx.heat);
    trail.position.set(side * NOZZLE.x, NOZZLE.y, RAFALE_M.tail + 4);
    trail.renderOrder = 5;
    plane.add(core, trail);
    fx.trails.push(trail);
    A[side > 0 ? "nozzleL" : "nozzleR"] = anchor(plane, side * NOZZLE.x, NOZZLE.y, RAFALE_M.tail);
  }
  A.nozzles = anchor(plane, 0, NOZZLE.y, RAFALE_M.tail);

  /* ── the hook: a bright arm hinged under the keel, between the engines, and its shoe. Its own frame: the hinge at
     the origin, the throat of the shoe — where the wire sits: "the tip" — at (0, 0, −length) ── */
  const [PX, PY, PZ] = HOOK.pivot;
  const bay = newPart("hookBay");
  addMesh(bay, box(15, 24, 34, 1.5), cast, { pos: [PX, PY + 12, PZ + 4], edgeOpacity: 0.5 }); // its bracket, down from the keel
  strut(bay, [PX - 9.5, PY, PZ], [PX + 9.5, PY, PZ], 3.4, steel, { edge: 0.6 }); // the hinge pin
  const hook = newPart("hook");
  hook.position.set(PX, PY, PZ);
  const L = HOOK.length;
  const S45 = Math.SQRT1_2;
  // the shoe, drawn as it stands on the deck with the arm 45° down: [astern, up] from the throat. A round sole, `sole`
  // below the throat (it skims the deck); a toe that goes under the wire, the notch the wire slides up into, and a
  // neck around the end of the arm
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
  // the arm: thick at the hinge, thinner toward the shoe (it ends in the middle of the shoe, a hair off the line to the throat)
  const heel = [0, S45 * 13, -L + S45 * 21];
  strut(hook, [0, 0, 0], heel, 5.2, hookMat, { top: 3.9, edge: 0.5 });
  strut(hook, [-7.5, 0, 0], [7.5, 0, 0], 6.2, steel, { edge: 0.6 }); // its eye, around the pin
  A.hook = anchor(hook, 0, 0, -L);
  A.hookPivot = anchor(plane, PX, PY, PZ);
  // the wire in the throat: a point of veille when the hook holds it
  fx.grab = softGlow(2);
  const grab = new THREE.Mesh(new THREE.SphereGeometry(7.5, 20, 14), fx.grab);
  grab.position.set(0, 0, -L);
  grab.renderOrder = 6;
  hook.add(grab);
  // its damper: a barrel hinged in the keel, a rod hinged on the arm — it holds the hook down on the deck
  const DAMP = { keel: V(PX, PY + 22, PZ - 22), arm: [4, -40] };
  const barrel = link(bay, 3.3, 27, cast, 0.5);
  const rod = link(bay, 1.9, 27, bright, -0.5);
  const onArm = V();

  /* ── what the deck gives back: the smoke of the tyres, the sparks of the shoe. In the ship's frame: they do not pitch ── */
  fx.puffs = [];
  const blob = new THREE.SphereGeometry(1, 20, 14);
  const rand = rng(15);
  for (const side of [-1, 1]) {
    for (let k = 0; k < 6; k++) {
      const mesh = new THREE.Mesh(blob, softGlow(1.5));
      mesh.renderOrder = 6;
      mesh.visible = false;
      group.add(mesh);
      fx.puffs.push({ mesh, x: side * MAIN.x, k, sway: (rand() - 0.5) * 2, rise: 0.7 + rand() * 0.6, phase: rand() * 6.28 });
    }
  }
  fx.sparks = makeSparks(96, 31);
  fx.scrape = softGlow(2.4);
  const ember = new THREE.Mesh(blob, fx.scrape);
  ember.renderOrder = 6;
  ember.visible = false;
  group.add(fx.sparks.mesh, ember);
  // what sits it on the deck: a faint pool of light under the legs and the hook (the dark tyres stand out on it), and a
  // patch of shadow under each wheel, which gathers as the wheel comes down — it is what says "half a metre to go"
  fx.pool = makePool({ radius: 1000, color: BRAND.ink });
  fx.pool.mesh.scale.set(0.42, 0.95, 1);
  fx.shadows = [[-MAIN.x, 0, 1], [MAIN.x, 0, 1], [0, -FRONT.z, 0.8]].map(([x, z, k]) => {
    const mesh = makeContact({ amount: 0 });
    group.add(mesh);
    return { mesh, x, z, k };
  });
  group.add(fx.pool.mesh);
  A.deck = anchor(group, 0, 0, 0); // the deck under the main wheels (the wheels' own level when the aircraft is in the air)

  A.nose = anchor(plane, 0, 200, RAFALE_M.nose);
  A.tail = anchor(plane, 0, NOZZLE.y, RAFALE_M.tail);
  A.fin = anchor(plane, 0, RAFALE_M.height, -568);
  A.wingL = anchor(plane, 537, 192, -285);
  A.wingR = anchor(plane, -537, 192, -285);
  A.cg = anchor(plane, 0, 215, 0);

  asShell(panes, 20);

  /** Fade a list of materials that belong to no part (the solid of you). */
  let youWas = -1;
  const fadeYou = (a) => {
    if (a === youWas) return;
    youWas = a;
    for (const mat of youMats) {
      mat.opacity = mat.userData.base * a;
      const transparent = mat.userData.transparent || a < 0.999;
      if (mat.transparent !== transparent) {
        mat.transparent = transparent;
        mat.needsUpdate = true;
      }
      mat.depthWrite = mat.userData.depthWrite && a > 0.55;
    }
  };
  let gasWas = -1;

  /**
   *   jet     0–1, a fade of the whole aircraft
   *   pos     metres of the hook's tip along the landing axis (hookAt)      alt   metres between the main wheels and the deck
   *   nose    degrees nose up, around the main wheels                        squat 0–1, the legs give (the scissors close)
   *   hook    1 down → 0 up against the keel, its shoe between the nozzles   held  0–1, the wire has it: its tip is AT hookAt, the throat lit veille
   *   gas     0–1: the lever travels 32 cm (0.5 → 1: 16 cm, your hand with it); the nozzles: a dark throat → a hard signal core, a short tail of heat
   *   puff    0–1, the smoke of the tyres, streaming astern of the two main wheels
   *   scrape  0–1, the sparks of the shoe on the deck, thrown astern
   *   you     0–1, you in the seat
   */
  function update(P = {}, time = 0) {
    const jet = clamp01(P.jet ?? 1);
    group.visible = jet > 0.004;
    if (!group.visible) return;
    const th = (P.nose ?? 0) * DEG;
    const cos = Math.cos(th);
    const sin = Math.sin(th);
    const drop = MAIN.stroke * clamp01(P.squat ?? 0);
    const alt = Math.max(0, P.alt ?? 0) * PER_ALT; // cm between the wheels and the deck
    const held = clamp01(P.held ?? 0);
    const down = smooth(0, 1, P.hook ?? 1);
    const gas = clamp01(P.gas ?? 0.5);
    const you = clamp01(P.you ?? 1) * jet;

    /* the airframe on its legs */
    tilt.rotation.x = -th;
    plane.position.y = -MAIN.r - drop;
    for (const leg of mains) fold(leg, drop / -leg.u.y);
    // the nose wheel, its leg out: is its tread under the deck? Then the leg gives what it takes
    const tread = MAIN.r + (FRONT.r - MAIN.r - drop) * cos + FRONT.z * sin - FRONT.r;
    fold(nose, clamp((-alt - tread) / cos, 0, FRONT.stroke));

    /* the hook, and through it the place of everything: its hinge in the group's frame (above the wheels' level, astern of them) */
    const py = PY - MAIN.r - drop;
    const hingeY = MAIN.r + py * cos + PZ * sin;
    const hingeZ = py * sin - PZ * cos;
    const free = hingeY - L * Math.sin(Math.min(1.45, HOOK.down * DEG + th)); // down to its stop…
    const tipY = lerp(Math.max(HY - alt, free), HY, held); // …or to the deck; held, where the wire is
    const reach = Math.asin(clamp((hingeY - tipY) / L, -0.4, 0.995)); // the arm, below the horizon
    const tipZ = hingeZ + L * Math.cos(reach);
    group.position.set(HX, alt, HZ + (P.pos ?? 0) * PER_POS - tipZ);
    const now = lerp(th + HOOK.stowed * DEG, reach, down); // where the arm really is
    hook.rotation.x = th - now;
    const c = Math.cos(hook.rotation.x);
    const s = Math.sin(hook.rotation.x);
    onArm.set(PX, PY + DAMP.arm[0] * c - DAMP.arm[1] * s, PZ + DAMP.arm[0] * s + DAMP.arm[1] * c);
    barrel(DAMP.keel, onArm, 0);
    rod(DAMP.keel, onArm, 1);
    fx.grab.uniforms.uColor.value.copy(VEILLE).multiplyScalar(1.5 * held * down * jet);
    grab.visible = held > 0.01;

    /* the throttle and your hand on it */
    if (gas !== gasWas) {
      gasWas = gas;
      lever.position.z = THR.from + THR.travel * gas;
      fig.hold("L", grip.set(THR.x - FIG[0], THR.y - FIG[1], lever.position.z - FIG[2]), ACROSS, HOLD);
    }
    const full = smooth(0.5, 1, gas);
    setGlow(fx.stop, (0.14 + 1.1 * full * full) * jet);
    setGlow(fx.screens, 0.4 * jet);

    /* the nozzles */
    fx.core.uniforms.uGas.value = 0.02 * gas + full * full;
    fx.core.uniforms.uAmount.value = jet * (0.5 + 0.5 * gas);
    // a slow breath, never a flutter: a glow that blinks several times a second reads as a fault
    fx.heat.uniforms.uAmount.value = (0.02 + 0.34 * full) * jet * (0.94 + 0.06 * Math.sin(time * 2.7));
    for (const trail of fx.trails) trail.scale.z = 60 + 150 * full;

    /* the smoke of the tyres: each puff is born under the wheel, drifts astern and up as it grows, and goes — over and over */
    const puff = clamp01(P.puff ?? 0) * jet;
    for (const b of fx.puffs) {
      b.mesh.visible = puff > 0.004;
      if (!b.mesh.visible) continue;
      const u = (b.k + ((time * 0.3) % 1)) / 6;
      const size = 16 + 92 * Math.pow(u, 0.8);
      b.mesh.position.set(b.x + b.sway * 34 * u + 5 * Math.sin(time * 0.9 + b.phase), 6 + size * 0.42 + 60 * b.rise * u * u, 14 + (120 + 230 * puff) * u);
      b.mesh.scale.set(size, size * 0.82, size * 1.25);
      b.mesh.material.uniforms.uColor.value.copy(INK).multiplyScalar(0.32 * puff * Math.pow(1 - u, 1.25) * smooth(0, 0.07, u));
    }

    /* the sparks of the shoe: where its sole really is */
    const scrape = clamp01(P.scrape ?? 0) * jet;
    fx.sparks.mesh.visible = ember.visible = scrape > 0.004;
    if (scrape > 0.004) {
      const soleY = hingeY - L * Math.sin(now) - HOOK.sole + 0.5;
      const soleZ = hingeZ + L * Math.cos(now) + 5;
      fx.sparks.uniforms.uAt.value.set(0, soleY, soleZ);
      fx.sparks.uniforms.uTime.value = time;
      fx.sparks.uniforms.uAmount.value = scrape;
      ember.position.set(0, soleY + 2, soleZ + 4);
      ember.scale.set(8, 5, 13);
      fx.scrape.uniforms.uColor.value.copy(HOT).multiplyScalar(1.6 * scrape * (0.9 + 0.1 * Math.sin(time * 2.3)));
    }

    /* the deck under it (the group's origin is `alt` above the deck) */
    const near = (1 - smooth(150, 900, alt)) * jet;
    fx.pool.mesh.visible = near > 0.01;
    fx.pool.mesh.position.set(0, 0.9 - alt, 200);
    fx.pool.uniforms.uAmount.value = 0.11 * near;
    for (const sh of fx.shadows) {
      const h = alt + (sh.k < 1 ? Math.max(0, tread + alt) : 0); // how far above the deck that wheel is
      const tight = 1 - smooth(0, 160, h);
      sh.mesh.visible = tight * jet > 0.01;
      sh.mesh.position.set(sh.x, 1.4 - alt, sh.z * cos + 6);
      sh.mesh.scale.set((84 + 0.9 * h) * sh.k, (150 + 1.2 * h) * sh.k, 1);
      sh.mesh.material.uniforms.uAmount.value = 0.62 * tight * jet;
    }

    /* the fades */
    fx.hull.uniforms.uAmount.value = jet;
    fx.wings.uniforms.uAmount.value = jet;
    fx.canopy.uniforms.uAmount.value = jet;
    fx.frames.opacity = fx.frames.userData.base * jet;
    fx.outline.opacity = fx.outline.userData.base * jet;
    for (const part of parts) setPartOpacity(part, jet);
    fig.group.visible = you > 0.004;
    fig.body.uniforms.uAmount.value = you;
    fadeYou(you);
  }
  update();

  return { group, plane, fig, fx, A, update };
}
