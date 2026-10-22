// DOSSIER 023 — the plane and its world: an A330-200 like an X-ray over the Atlantic at night, the sea, the island
// and its runway.
//
//   buildAvion() → { group, mount, A, update(P, time, px) }
//   P = { ground, threshold, ahead, pitch, bank, dawn, wind, shell, engines, fuel, leak, lines, press, flow, surf, stick,
//         pax, you, grip, brakes, gear, tires, runway, made, mood }          (their meaning: FIRST, in world.js)
//
// THE PLANE, true scale (plan.js): nose toward −x, up +y, its LEFT side toward +z. A shell of glass — fuselage, belly
// fairing, swept wings and their winglets, fin, stabiliser — with a few lines of structure (frames, window belt, floor,
// doors, the cockpit's panes), and SOLID in it only what the story is about:
//   · the two engines: nacelle, spinner, fan. Alive: ink, the fan a smooth blur. Dead: cold, outlined signal, the fan
//     windmilling slowly (a dead engine windmills: true of Air Transat 236, and it never hops — see `fanMat`)
//   · the wing tanks (`fuel`): solid fuel in the glass, drained from the tips inward; empty, their outline in signal
//   · the leak (`leak`): drops of signal streaming aft from the RIGHT (far) pylon
//   · the three hydraulic circuits (`lines`, `press`, `flow`): along the belly, out to the ailerons, up to the tail.
//     Two start at the left engine, one at the right; the live one (HYD.live) ALSO starts at the RAT's bay — that is
//     the one that comes back, veille, from the bay outward, a head of light reaching every control surface at flow 1
//   · the control surfaces (`surf`, `stick`): ailerons, elevators, rudder — dim signal dead, veille alive
//   · the landing gear (`gear`, `brakes`, `tires`): two four-wheel bogies and the nose gear, solid in their bays
//   · you (`you`, `grip`), a body of glass at a left window, your window brighter; and the 306 (`pax`): small heads
//   · the RAT's bay (`mount`, at BAY.at), the skin cut open under its door
// THE WORLD, a model at the scale of the subject (plan.js): a dome of black sky and, under the plane, the sea at
// `ground − ISLAND.h` drawn at infinity (it reads by its crests, never a grey slab), anchored on the island so that it
// slides with `threshold`; the island, a dark plateau of glass with its contour lines; the runway on it, its lamps
// (signal out of reach → veille reached: `made`). Not one length, not one figure is written on any of it.
// Personne n'est blessé : the tyres let go, a few slow sparks, nothing breaks.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, glass, asShell, lineMat, box, cyl, lathe, plate, anchor, makePart, addMesh } from "@kit/build3d.js";
import { FUSE, WING, ENGINES, TAIL, SURFACES, GEAR, BAY, YOU, CABIN, HYD, ISLAND } from "./plan.js";
import { dressAvion } from "./habillage.js"; // the decorator: stars, the cloud deck, Terceira's lights, the seats

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const [BX, BY, BZ] = BAY.at;
// The runway is drawn 45 m wide: at plan.js's 9 m the main gear (10.6 m between its bogies) would roll beside it.
const RWY_W = Math.max(ISLAND.w, 4500);
const ISLE_Z = 0.62;
// The engines hang from the wing as an A330's do: the nacelle's lip a few metres ahead of the leading edge, its top just
// under the wing. plan.js has them 2.6 m further forward and 0.45 m lower, clear of the wing — floating (journal: « À
// changer ailleurs »). Once plan.js carries these two numbers, this line can read ENGINES alone.
const ENG = { ...ENGINES, x: -360, y: -335 }; // the island is longer than wide (Terceira lies east–west): its half-width over its half-length

/* ───────────────────────────────────────────────────────────── shapes */

// a smooth curve through [x, value] knots (Hermite, tangents from the neighbours)
function spline(knots) {
  const p = [...knots].sort((a, b) => a[0] - b[0]);
  const m = p.map((_, i) => {
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(p.length - 1, i + 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  });
  return (x) => {
    if (x <= p[0][0]) return p[0][1];
    if (x >= p.at(-1)[0]) return p.at(-1)[1];
    let i = 0;
    while (p[i + 1][0] < x) i++;
    const h = p[i + 1][0] - p[i][0];
    const u = (x - p[i][0]) / h;
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

// THE FUSELAGE, station by station: [x, half-width, keel, crest]. An Airbus nose (blunt, its tip a little under the
// axis, the windscreen where the crest drops), a long tube, and the tail cone that sweeps up to the APU's exhaust.
const BODY = [
  [-2900, 2, -52, -40],
  [-2886, 52, -110, 14],
  [-2852, 104, -162, 72],
  [-2795, 156, -205, 128],
  [-2715, 204, -238, 176],
  [-2610, 243, -261, 220],
  [-2490, 267, -275, 252],
  [-2360, 279, -281, 273],
  [-2220, 282, -282, 282],
  [1480, 282, -282, 282],
  [1800, 279, -262, 282],
  [2100, 266, -200, 279],
  [2400, 236, -115, 270],
  [2650, 186, -25, 254],
  [2850, 118, 60, 228],
  [2950, 62, 112, 200],
  [2980, 30, 138, 184],
];
const body = [1, 2, 3].map((k) => spline(BODY.map((row) => [row[0], row[k]])));
const AROUND = 72;
function section(x) {
  const [w, keel, crest] = body.map((f) => f(x));
  return { x, w, mid: (keel + crest) / 2, hh: (crest - keel) / 2 };
}
/** A point of the skin: station `x`, angle `a` around the axis (0 = the left side, +z; π/2 = the crown). `lift` cm outward. */
function onSkin(x, a, lift = 0) {
  const s = section(x);
  return [x, s.mid + (s.hh + lift) * Math.sin(a), (s.w + lift) * Math.cos(a)];
}
const ringAt = (x) => Array.from({ length: AROUND }, (_, j) => onSkin(x, (2 * Math.PI * j) / AROUND));
const angleOfY = (x, y) => {
  const s = section(x);
  return Math.asin(Math.max(-1, Math.min(1, (y - s.mid) / s.hh)));
};

// THE WING (the left one, +z; the right one is its mirror): a straight leading edge swept 31°, a kinked trailing edge
// (the A330's: nearly straight inboard, swept outboard), 5° of dihedral, thinner toward the tip, a winglet.
const TAN_LE = Math.tan(31 * DEG);
const KINK = 1000;
const TIPZ = WING.span / 2; // 3015
const LE0 = WING.x - WING.root / 2;
const wingLE = (z) => LE0 + z * TAN_LE;
const wingChord = (z) => (z < KINK ? lerp(WING.root, 640, z / KINK) : lerp(640, WING.tip, (z - KINK) / (TIPZ - KINK)));
const wingY = (z) => WING.y + z * Math.tan(WING.dihedral * DEG);
const wingThick = (z) => lerp(0.135, 0.105, z / TIPZ);
// the stabiliser and the fin
const STAB = { le: 2120, root: 560, tip: 190, semi: TAIL.stab / 2, y: 55, tan: Math.tan(32 * DEG), dihedral: 6, thick: 0.1 };
const stabLE = (z) => STAB.le + z * STAB.tan;
const stabChord = (z) => lerp(STAB.root, STAB.tip, z / STAB.semi);
const stabY = (z) => STAB.y + z * Math.tan(STAB.dihedral * DEG);
const FIN = { le: 1880, root: 880, tip: 330, y: 250, h: TAIL.fin, tan: Math.tan(38 * DEG), thick: 0.1 };
const finLE = (y) => FIN.le + (y - FIN.y) * FIN.tan;
const finChord = (y) => lerp(FIN.root, FIN.tip, (y - FIN.y) / FIN.h);

/** An aerofoil section around: `a` 0 at the leading edge; thickest a third of the way back, a thin trailing edge. */
const foilAround = 28;
function foil(lead, chord, thick, j) {
  const a = (2 * Math.PI * j) / foilAround;
  const c = Math.cos(a);
  const u = 0.5 - 0.5 * c; // 0 leading edge → 1 trailing edge
  const t = Math.sin(a) * (0.62 + 0.38 * c) * chord * thick * 0.5;
  return [lead + u * chord, t];
}
/** A horizontal lifting surface for one side `s` (+1 left, −1 right): stations along z, closed at the tip. */
function lifting(s, zs, LE, CH, Y, TH) {
  const rows = zs.map((z, i) => {
    const end = i === zs.length - 1;
    const row = [];
    for (let j = 0; j < foilAround; j++) {
      const [x, t] = foil(LE(z), CH(z), TH(z) * (end ? 0.05 : 1), j);
      row.push([x, Y(z) + t, s * (z + (end ? 4 : 0))]);
    }
    return row;
  });
  return skin(rows, { wrap: true });
}

/** How far outward the lines drawn on the skin stand (cm). */
const PANE_LIFT = 1.5;

/* ───────────────────────────────────────────────────────────── light that has a place */

// The fan of an engine, seen down its intake. Alive: a smooth blur (it turns far too fast to show a blade). Dead: its
// blades show, windmilling slowly and always at the same pace — a phase driven by a spool speed would run backwards
// when the speed drops; this one never hops: 0.12 turn a second is a tenth of a blade a frame.
const fanMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uLife: { value: 0 }, uPhase: { value: 0 }, uInk: { value: INK.clone() } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uLife, uPhase; uniform vec3 uInk; varying vec2 vUv;
      void main() {
        vec2 q = (vUv - 0.5) * 2.0;
        float r = length(q);
        if (r > 1.0) discard;
        float th = atan(q.y, q.x);
        float b = fract((th + r * 0.9) / 6.2831853 * 24.0 + uPhase * 24.0);
        float tri = abs(b - 0.5) * 2.0; // continuous across the wrap: 24 is a whole number
        float fw = max(fwidth(tri), 1e-4);
        float blade = smoothstep(0.42 - fw, 0.42 + fw, tri);
        float show = smoothstep(0.06, 0.25, 1.0 / (fw * 24.0)); // blades thinner than a pixel melt into their mean
        blade = mix(0.58, blade, show);
        float spin = smoothstep(0.15, 0.85, uLife);
        float lit = mix(mix(0.018, 0.13, blade), 0.085, spin);
        lit += 0.05 * exp(-pow((r - 0.93) / 0.05, 2.0)); // the casing's rub strip
        float edge = 1.0 - smoothstep(0.96, 1.0, r);
        gl_FragColor = vec4(uInk * lit * edge, 1.0);
      }`,
  });

// a window of the cabin: a rounded rectangle of light — its core, and a soft spill around it
const windowMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aLit; varying vec2 vUv; varying float vLit;
      void main() { vUv = uv; vLit = aLit; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vUv; varying float vLit;
      void main() {
        if (uAmount < 0.003) discard;
        vec2 q = (vUv - 0.5) * vec2(2.0, 2.0);
        vec2 hs = vec2(0.42, 0.5);
        vec2 d = abs(q) - hs + 0.3;
        float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 0.3; // a rounded rectangle
        float fw = max(fwidth(sd), 1e-4);
        float core = 1.0 - smoothstep(-fw, fw, sd);
        float mine = step(2.0, vLit); // yours: a wider spill, the one lit window you find first
        float spill = exp(-max(sd, 0.0) * mix(5.0, 2.6, mine)) * mix(0.18, 0.2, mine);
        gl_FragColor = vec4(uColor * (core * 0.9 + spill) * vLit * uAmount, 1.0);
      }`,
  });

// the lamps of the runway: never smaller than three pixels (from the far sea the island is a line of points), a soft disc
const lampMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL.clone() }, uAmount: { value: 0 }, uScale: { value: 2000 } },
    vertexShader: /* glsl */ `
      uniform float uScale; attribute float aK; varying float vK;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(uScale * 70.0 / max(-mv.z, 1.0), 3.0, 16.0);
        vK = aK;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vK;
      void main() {
        if (uAmount < 0.003) discard;
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float r = dot(q, q);
        if (r > 1.0) discard;
        gl_FragColor = vec4(uColor * exp(-r * 3.2) * vK * uAmount, 1.0);
      }`,
  });

/**
 * Streaks that leave one point over and over, each along its own way, long while fast, dying as they go: the sparks
 * of a tyre (thrown aft and up, falling back on the runway) and the fuel of the leak (streaming aft, falling slowly).
 * Alive on the first frame (periodic), and slow.
 */
function makeSpray(count, seed, { dir, reach, half, width, rate, fall, floor = -1e9, color }) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const dirs = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const d = V(...dir(rand)).normalize();
    dirs.set([d.x, d.y, d.z], i * 3);
    seeds.set([lerp(reach[0], reach[1], Math.pow(rand(), 1.3)), lerp(half[0], half[1], rand()), rand(), lerp(width[0], width[1], rand())], i * 4);
  }
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(dirs, 3));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  geo.instanceCount = count;
  const uniforms = {
    uAt: { value: V() }, uTime: { value: 0 }, uAmount: { value: 0 }, uReach: { value: 1 }, uScale: { value: 2200 }, uRes: { value: RES },
    uColor: { value: color.clone() }, uFall: { value: fall }, uFloor: { value: floor }, uRate: { value: rate },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uScale, uReach, uFall, uFloor, uRate; uniform vec2 uRes; uniform vec3 uAt;
        attribute vec3 aDir; attribute vec4 aSeed; varying vec2 vQ; varying float vA;
        void main() {
          float life = fract(aSeed.z + uTime * uRate * (0.8 + 0.4 * fract(aSeed.z * 7.3)));
          float fly = 1.0 - (1.0 - life) * (1.0 - life);
          vec3 c = uAt + aDir * aSeed.x * uReach * fly;
          c.y = max(uFloor + 0.5, c.y - uFall * life * life);
          float h = aSeed.y * mix(1.0, 0.4, life);
          vec3 way = normalize(aDir + vec3(0.0, -0.6 * life * uFall / max(aSeed.x * uReach, 1.0), 0.0));
          vec4 a = projectionMatrix * modelViewMatrix * vec4(c - way * h, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(c + way * h, 1.0);
          vQ = position.xy;
          vA = pow(1.0 - life, 1.4) * smoothstep(0.0, 0.06, life);
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
          float a = (1.0 - vQ.y * vQ.y) * pow(clamp(1.0 - abs(vQ.x), 0.0, 1.0), 1.2);
          gl_FragColor = vec4(uColor * a * vA * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  mesh.visible = false;
  return { mesh, uniforms };
}

/**
 * The air going by (the idiom of 007's jet.js): each mote drawn as the line it covers while the shutter is open —
 * its head bright, its tail gone, three pixels wide whatever its distance. The air flows aft (+x). Where it crosses the
 * RAT's disc (`uHub`, `uWhirl`) it turns veille.
 */
function makeStreaks({ count, seed, min, size }) {
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
    uTravel: { value: 0 }, uLen: { value: 420 }, uAmount: { value: 0 }, uInk: { value: INK.clone().multiplyScalar(0.55) }, uVeille: { value: VEILLE.clone().multiplyScalar(1.3) },
    uHub: { value: V(BX - 26, BY - 150, BZ) }, uWhirl: { value: 0 },
    uMin: { value: V(...min) }, uSize: { value: V(...size) }, uView: { value: RES },
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
        uniform float uTravel, uLen, uAmount, uWhirl; uniform vec3 uMin, uSize, uHub; uniform vec2 uView;
        attribute vec2 aSeed; attribute vec2 aCorner; varying float vA; varying float vSide; varying float vRat;
        void main() {
          float k = 0.7 + 0.3 * aSeed.x;
          vec3 p = position;
          p.x += uTravel * k;
          p = uMin + mod(p - uMin, uSize);
          vec3 q = (p - uMin) / uSize;
          float inside = smoothstep(0.0, 0.12, q.x) * smoothstep(1.0, 0.88, q.x) * smoothstep(0.0, 0.12, q.y) * smoothstep(1.0, 0.88, q.y) * smoothstep(0.0, 0.1, q.z) * smoothstep(1.0, 0.9, q.z);
          vec4 a = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(p - vec3(uLen * k, 0.0, 0.0), 1.0);
          vec2 yz = p.yz - uHub.yz;
          vRat = uWhirl * exp(-dot(yz, yz) / 6400.0) * smoothstep(uHub.x - 60.0, uHub.x + 10.0, p.x);
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
            vA = aSeed.y * inside * uAmount * (1.0 - aCorner.x) * smoothstep(8.0, 60.0, l) * clamp(2600.0 / c.w, 0.25, 1.0);
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uVeille; varying float vA; varying float vSide; varying float vRat;
        void main() { gl_FragColor = vec4(mix(uInk, uVeille, clamp(vRat, 0.0, 1.0)) * vA * (1.0 - abs(vSide)), 1.0); }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the sea and the sky

   Drawn at infinity, after everything (the idiom of 015's carrier.js): the sea is where each ray of the eye meets the
   plane `uSeaY` — the swell as broken crests in four sizes, each leaving before its lines get too close to draw (no
   grey slab toward the horizon), anchored on the island (`uIsle`): it slides when the world comes to the plane; a thin
   surf where the sea meets the island; water mirrors little seen from above, more toward the horizon. The sky: black,
   a thin horizon, three strata of cloud. The dawn (`uDawn`): a low band of ink ahead (−x) and its sheen on the water —
   never a colour. */
const ISLE_GLSL = /* glsl */ `
  float isleR(float th) { return 1.0 + 0.07 * sin(3.0 * th + 1.0) + 0.045 * sin(5.0 * th + 2.3) + 0.03 * sin(9.0 * th + 0.4); }`;
const isleR = (th) => 1 + 0.07 * Math.sin(3 * th + 1.0) + 0.045 * Math.sin(5 * th + 2.3) + 0.03 * Math.sin(9 * th + 0.4);
const backdropMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uInk: { value: INK.clone() }, uAmount: { value: 1 }, uSeaY: { value: -32000 }, uIsle: { value: new THREE.Vector2(-93000, 0) },
      uIsleR: { value: ISLAND.r }, uDawn: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position; // the dome follows the eye and never turns: the horizon stays level, and stays far
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount, uSeaY, uIsleR, uDawn; uniform vec2 uIsle;
      varying vec3 vDir;
      ${ISLE_GLSL}
      float crest(vec2 s, float cell) {
        float bend = min(cell, 3000.0) * (0.16 * sin(s.y / (cell * 2.3) + 1.3) + 0.1 * sin(s.y / (cell * 0.9) + s.x / (cell * 3.1)));
        float q = (s.x * 0.45 + s.y + bend) / cell;
        float fw = max(fwidth(q), 1e-5);
        float id = floor(q + 0.5);
        float gap = smoothstep(0.2, 0.65, 0.5 + 0.5 * sin(s.x / (cell * 1.7) + id * 2.399));
        return smoothstep(5.0, 14.0, 1.0 / fw) * gap * (1.0 - smoothstep(0.0, fw * 2.0, abs(fract(q - 0.5) - 0.5)));
      }
      float stratum(vec3 d, float h, float height, float far, float width, float k1, float k2, float phase) {
        float az = atan(d.x, d.z + 1e-6);
        float wisp = smoothstep(0.35, 0.9, 0.5 + 0.5 * sin(az * k1 + phase) * sin(az * k2 + phase * 1.7));
        float x = (d.y - (height - h) / far) / width;
        return exp(-x * x) * wisp;
      }
      void main() {
        vec3 d = normalize(vDir);
        float h = max(cameraPosition.y - uSeaY, 1.0); // the eye above the water
        float below = smoothstep(0.0, 0.0015, -d.y);
        float t = h / max(-d.y, 1e-4);
        vec2 p = cameraPosition.xz + d.xz * t; // where the ray meets the water: (x, z)
        vec2 s = p - uIsle;                     // anchored on the island
        float swell = max(max(crest(s, 700.0) * 0.5, crest(s, 2800.0) * 0.72), max(crest(s, 11200.0) * 0.9, crest(s, 44800.0)));
        float graze = 0.4 + 0.6 * pow(clamp(1.0 + d.y, 0.0, 1.0), 6.0);
        float far = exp(-t / 1200000.0);
        // the surf, where the sea meets the island
        float th = atan(s.y / ${ISLE_Z.toFixed(2)}, s.x);
        float e = length(vec2(s.x, s.y / ${ISLE_Z.toFixed(2)})) / (uIsleR * isleR(th));
        float fe = max(fwidth(e), 1e-5);
        float surf = (1.0 - smoothstep(0.0, max(0.012, fe * 2.0), abs(e - 1.004))) * 0.5 + 0.12 * exp(-max(e - 1.0, 0.0) * 30.0) * step(1.0, e);
        // dawn: its sheen on the water, toward −x
        float azd = atan(d.z, -d.x);
        float sheen = uDawn * exp(-azd * azd / 0.02) * graze * (0.05 + 0.9 * swell) * exp(-max(-d.y, 0.0) / 0.2);
        vec3 col = uInk * (swell * 0.12 * graze + surf * 0.35 + sheen * 0.5) * far * below;

        // the sky: a thin horizon, the air above it, three strata of cloud, and ahead the first light — a low band of ink
        float air = 0.045 * exp(-abs(d.y) / 0.0014) + step(0.0, d.y) * 0.012 * exp(-d.y / 0.09);
        float cloud = stratum(d, h, 30000.0, 500000.0, 0.0026, 9.0, 23.0, 0.6) * 0.05
          + stratum(d, h, 90000.0, 900000.0, 0.004, 7.0, 17.0, 2.1) * 0.04
          + stratum(d, h, 220000.0, 1500000.0, 0.006, 5.0, 13.0, 4.0) * 0.03;
        float sky = step(0.0, d.y);
        float band = uDawn * (0.2 * exp(-azd * azd / 0.3) + 0.035) * exp(-max(d.y, 0.0) / 0.018) * smoothstep(-0.003, 0.002, d.y);
        col += uInk * (air * (1.0 + 1.2 * uDawn) + cloud * sky * (1.0 + 1.2 * uDawn) + band);
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the set */

export function buildAvion() {
  const group = new THREE.Group(); // the world's frame: the plane at its origin, the world comes to it
  const plane = new THREE.Group(); // pitch and bank turn this, around the origin (and the bay with it)
  plane.rotation.order = "ZYX"; //    bank about the plane's own axis, then pitch
  group.add(plane);
  const A = {};
  const fx = {};

  /* ── the metals: three values of grey, little metal ── */
  const nacMat = () => solid(0x7a8086, { rough: 0.48, metal: 0.3, coat: 0.35, coatRough: 0.4 });
  const steel = solid(0x8d959b, { rough: 0.42, metal: 0.4, env: 1.1 });
  const bright = solid(0xc9ced1, { rough: 0.36, metal: 0.35, env: 1.2 });
  const rubber = solid(0x30363b, { rough: 0.9, env: 0.5 });
  const alloy = solid(0x9aa2a8, { rough: 0.45, metal: 0.35, env: 1.1 });
  const dark = solid(0x1a1f23, { rough: 0.85, env: 0.5 });

  /* ── the airframe: one shell of glass ── */
  fx.hull = glass(BRAND.ink, { base: 0, rim: 0.12, power: 3, edge: 0.34, spec: 0.25, through: 0.22 });
  fx.wings = glass(BRAND.ink, { base: 0.003, rim: 0.1, power: 2.6, edge: 0.3, spec: 0.3, through: 0.2 });
  const panes = [];
  const pane = (geometry, material) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    plane.add(mesh);
    panes.push(mesh);
    return mesh;
  };

  // the stations of the fuselage: dense at the nose and the tail, and the edges of the RAT's opening on the list
  const xs = (() => {
    const list = [];
    for (let x = -2900; x < -2700; x += 10) list.push(x);
    for (let x = -2700; x < -2200; x += 25) list.push(x);
    for (let x = -2200; x < 1480; x += 60) list.push(x);
    for (let x = 1480; x < 2980; x += 30) list.push(x);
    list.push(2980, BX - 24, BX + 218);
    return [...new Set(list)].sort((a, b) => a - b);
  })();
  const rings = xs.map(ringAt);
  // the opening under the RAT's door: the skin is cut there (the door is the system's, model.js)
  const HOLE = { x0: BX - 24, x1: BX + 218, z0: BZ - 45, z1: BZ + 45 }; // DOOR: x −16 → 210 from the hinge
  const inHole = (i, j) => {
    const xm = (xs[i] + xs[i + 1]) / 2;
    if (xm < HOLE.x0 || xm > HOLE.x1) return false;
    const p = onSkin(xm, (2 * Math.PI * (j + 0.5)) / AROUND);
    return p[1] < 0 && p[2] > HOLE.z0 && p[2] < HOLE.z1;
  };
  pane(skin(rings, { wrap: true, keep: (i, j) => !inHole(i, j) }), fx.hull);

  // the belly fairing, between the wings: a flat bulge under the tube (the main gear folds into it)
  {
    const fr = [];
    for (let x = -640; x <= 1000; x += 40) {
      const u = (x + 640) / 1640;
      const b = smooth(0, 0.3, u) * smooth(1, 0.72, u);
      const ring = [];
      for (let j = 0; j < 48; j++) {
        const a = (2 * Math.PI * j) / 48;
        const c = Math.cos(a);
        const sn = Math.sin(a);
        ring.push([x, -238 + (sn < 0 ? 62 : 30) * b * sn, (60 + 245 * b) * Math.sign(c) * Math.pow(Math.abs(c), 0.8)]);
      }
      fr.push(ring);
    }
    pane(skin(fr, { wrap: true }), fx.hull);
  }

  // the wings and their winglets, the stabiliser, the fin
  const wingZs = [0, 280, 600, KINK, 1500, 2000, 2500, TIPZ - 30, TIPZ];
  for (const s of [1, -1]) {
    pane(lifting(s, wingZs, wingLE, wingChord, wingY, wingThick), fx.wings);
    // the winglet: up from the tip, canted out, swept back
    const rows = [];
    for (let k = 0; k <= 5; k++) {
      const u = k / 5;
      const lead = wingLE(TIPZ) + 15 + u * 160;
      const chord = lerp(WING.tip - 20, 95, u) * (k === 5 ? 0.92 : 1);
      const row = [];
      for (let j = 0; j < foilAround; j++) {
        const [x, t] = foil(lead, chord, k === 5 ? 0.004 : 0.09, j);
        row.push([x, wingY(TIPZ) + 8 + u * 262, s * (TIPZ + 6 + u * 28 + t)]);
      }
      rows.push(row);
    }
    pane(skin(rows, { wrap: true }), fx.wings);
    pane(lifting(s, [0, 300, 600, STAB.semi - 20, STAB.semi], stabLE, stabChord, stabY, () => STAB.thick), fx.wings);
  }
  {
    const rows = [];
    const ys = [FIN.y - 40, FIN.y, FIN.y + 220, FIN.y + 480, FIN.y + FIN.h - 20, FIN.y + FIN.h];
    ys.forEach((y, i) => {
      const yy = Math.max(FIN.y, y);
      const end = i === ys.length - 1;
      const row = [];
      for (let j = 0; j < foilAround; j++) {
        const [x, t] = foil(finLE(yy) - (i === 0 ? 30 : 0), finChord(yy) + (i === 0 ? 60 : 0), FIN.thick * (end ? 0.05 : 1), j);
        row.push([x, y + (end ? 4 : 0), t]);
      }
      rows.push(row);
    });
    pane(skin(rows, { wrap: true }), fx.wings);
  }
  /* ── a few lines of structure: frames, the window belt, the floor, the doors, the cockpit — and the outline of what flies ── */
  const frames = [];
  const outline = [];
  const run = (list, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) list.push(...pts[i], ...pts[i + 1]);
    if (closed) list.push(...pts.at(-1), ...pts[0]);
  };
  const lifted = (x, a, l = PANE_LIFT) => onSkin(x, a, l);
  for (const x of [-2350, -1750, -1150, -550, 50, 650, 1250, 1850, 2400]) run(frames, ringAt(x).filter((_, j) => j % 2 === 0), true);
  const along = (fn, x0 = -2860, x1 = 2975, step = 40) => {
    const pts = [];
    for (let x = x0; x <= x1; x += step) pts.push(fn(x));
    return pts;
  };
  run(frames, along((x) => onSkin(x, Math.PI / 2)));
  run(frames, along((x) => onSkin(x, -Math.PI / 2), -2860, 2600));
  // the window belt (a line over and under the windows, each side) and the cabin floor seen through the skin
  const DOORS = [-2420, -1150, 1130, 2210];
  const WIN_Y = 25;
  for (const side of [1, -1]) {
    for (const dy of [-26, 28]) {
      run(frames, along((x) => {
        const a = angleOfY(x, WIN_Y + dy);
        return lifted(x, side > 0 ? a : Math.PI - a, 0.8);
      }, -2380, 2250, 50));
    }
    run(frames, along((x) => [x, -100, side * Math.sqrt(Math.max(0, section(x).w ** 2 - 100 ** 2)) * 0.96], -2350, 2150, 100));
    for (const xd of DOORS) {
      const pts = [];
      const a0 = angleOfY(xd, -92);
      const a1 = angleOfY(xd, 96);
      const A_ = (a) => (side > 0 ? a : Math.PI - a);
      for (let k = 0; k <= 8; k++) pts.push(lifted(xd - 53, A_(lerp(a0, a1, k / 8))));
      for (let k = 0; k <= 4; k++) pts.push(lifted(xd - 53 + (106 * k) / 4, A_(a1)));
      for (let k = 0; k <= 8; k++) pts.push(lifted(xd + 53, A_(lerp(a1, a0, k / 8))));
      for (let k = 0; k <= 4; k++) pts.push(lifted(xd + 53 - (106 * k) / 4, A_(a0)));
      run(frames, pts);
    }
  }
  // the cockpit: four panes a side, posts slanting back, in (x, angle from the left side)
  const COCKPIT = [
    [-2768, -2722, 66, 88],
    [-2716, -2672, 54, 82],
    [-2664, -2624, 46, 74],
    [-2616, -2584, 42, 66],
  ];
  const cockpitPanes = [];
  for (const side of [1, -1]) {
    for (const [x0, x1, a0, a1] of COCKPIT) {
      const A_ = (a) => (side > 0 ? a * DEG : Math.PI - a * DEG);
      const lean = 10; // the posts lean back
      const pts = [];
      for (let k = 0; k <= 6; k++) pts.push(lifted(lerp(x0, x0 + lean, k / 6), A_(lerp(a0, a1, k / 6))));
      for (let k = 0; k <= 6; k++) pts.push(lifted(lerp(x0 + lean, x1 + lean, k / 6), A_(a1)));
      for (let k = 0; k <= 6; k++) pts.push(lifted(lerp(x1 + lean, x1, k / 6), A_(lerp(a1, a0, k / 6))));
      for (let k = 0; k <= 6; k++) pts.push(lifted(lerp(x1, x0, k / 6), A_(a0)));
      run(outline, pts);
      cockpitPanes.push({ side, x0, x1, a0, a1, lean });
    }
  }
  run(outline, along((x) => lifted(x, 0, 0.5), 2930, 2980, 10)); // the APU's exhaust
  for (const s of [1, -1]) {
    // the wing's outline, its spars, the hinge line of its ailerons
    const at = (z, f) => [wingLE(z) + f * wingChord(z), wingY(z), s * z];
    run(outline, [at(280, 0), at(KINK, 0), at(TIPZ, 0), at(TIPZ, 1), at(KINK, 1), at(280, 1)]);
    for (const f of [0.15, 0.62]) run(frames, [at(300, f), at(KINK, f), at(TIPZ - 40, f)]);
    run(outline, [[wingLE(TIPZ) + 15, wingY(TIPZ) + 8, s * (TIPZ + 6)], [wingLE(TIPZ) + 175, wingY(TIPZ) + 270, s * (TIPZ + 34)], [wingLE(TIPZ) + 270, wingY(TIPZ) + 270, s * (TIPZ + 34)], [wingLE(TIPZ) + WING.tip - 5, wingY(TIPZ) + 8, s * (TIPZ + 6)]]);
    const st = (z, f) => [stabLE(z) + f * stabChord(z), stabY(z), s * z];
    run(outline, [st(240, 0), st(STAB.semi, 0), st(STAB.semi, 1), st(240, 1)]);
  }
  const fn = (y, f) => [finLE(y) + f * finChord(y), y, 0];
  run(outline, [fn(FIN.y + 10, 0), fn(FIN.y + FIN.h, 0), fn(FIN.y + FIN.h, 1), fn(FIN.y + 10, 1)]);
  // the opening under the RAT's door
  {
    const pts = [];
    const ring = (x, z) => [x, -Math.sqrt(Math.max(0, section(x).w ** 2 - z * z)) - 0.8, z];
    for (let k = 0; k <= 8; k++) pts.push(ring(lerp(HOLE.x0, HOLE.x1, k / 8), HOLE.z0));
    for (let k = 0; k <= 4; k++) pts.push(ring(HOLE.x1, lerp(HOLE.z0, HOLE.z1, k / 4)));
    for (let k = 0; k <= 8; k++) pts.push(ring(lerp(HOLE.x1, HOLE.x0, k / 8), HOLE.z1));
    for (let k = 0; k <= 4; k++) pts.push(ring(HOLE.x0, lerp(HOLE.z1, HOLE.z0, k / 4)));
    run(outline, pts);
  }
  const segments = (list, material, parent = plane) => {
    const geo = new LineSegmentsGeometry();
    geo.setPositions(list);
    const lines = new LineSegments2(geo, material);
    lines.frustumCulled = false;
    lines.renderOrder = 2;
    parent.add(lines);
    return lines;
  };
  fx.frames = lineMat(BRAND.ink, 1.8, { opacity: 0.22 });
  fx.outline = lineMat(BRAND.ink, 2.2, { opacity: 0.72 });
  segments(frames, fx.frames);
  segments(outline, fx.outline);

  /* ── the windows: one row a side, yours the brightest; the cockpit's panes faintly lit ── */
  {
    const pos = [];
    const uv = [];
    const lit = [];
    const idx = [];
    const quad = (c, nrm, w, h, k) => {
      const n = V(...nrm).normalize();
      const right = V(1, 0, 0);
      const up = V().crossVectors(n, right).normalize();
      if (up.y < 0) up.negate();
      const b = pos.length / 3;
      for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
        const p = V(...c).addScaledVector(right, (u - 0.5) * w).addScaledVector(up, (v - 0.5) * h);
        pos.push(p.x, p.y, p.z);
        uv.push(u, v);
        lit.push(k);
      }
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    };
    const PITCH = 53.3;
    for (const side of [1, -1]) {
      for (let k = -16; k <= 68; k++) {
        const x = YOU.at[0] + k * PITCH;
        if (x < -2340 || x > 2180 || DOORS.some((d) => Math.abs(d - x) < 85)) continue;
        const a = angleOfY(x, WIN_Y);
        const p = onSkin(x, side > 0 ? a : Math.PI - a, 1.2);
        const mine = side > 0 && k === 0;
        quad(p, [0, p[1] / 282, p[2] / 282], 23, 33, mine ? 2.6 : side > 0 ? 0.55 : 0.4);
      }
    }
    for (const { side, x0, x1, a0, a1, lean } of cockpitPanes) {
      const xm = (x0 + x1 + lean) / 2;
      const am = ((a0 + a1) / 2) * DEG;
      const p = onSkin(xm, side > 0 ? am : Math.PI - am, 0.8);
      const s = section(xm);
      quad(p, [0, Math.sin(am) * 1, side * Math.cos(am)], (x1 - x0) * 0.85, ((a1 - a0) * DEG * s.hh) * 0.85, 0.22);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute("aLit", new THREE.Float32BufferAttribute(lit, 1));
    geo.setIndex(idx);
    fx.windows = windowMat();
    const mesh = new THREE.Mesh(geo, fx.windows);
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    plane.add(mesh);
  }
  A.window = anchor(plane, YOU.at[0], WIN_Y, onSkin(YOU.at[0], angleOfY(YOU.at[0], WIN_Y))[2]);

  /* ── the engines: nacelle, pylon, spinner, fan — solid in the glass ── */
  const NAC = [[118, 72], [118, 22], [123, 6], [133, -1], [143, 4], [149, 40], [150, 140], [147, 280], [136, 390], [112, 466], [93, 470], [80, 486], [52, 504], [20, 517], [0, 521]];
  const nacGeo = lathe(NAC, 96, { bevel: 1.6 }).rotateZ(-Math.PI / 2);
  const spinGeo = lathe([[0, 22], [10, 30], [22, 44], [32, 60], [38, 74], [0, 74]], 48, { bevel: 0.6 }).rotateZ(-Math.PI / 2);
  const engines = [];
  for (const s of [1, -1]) {
    const g = new THREE.Group();
    g.position.set(ENG.x - ENGINES.len / 2, ENG.y, s * ENGINES.z);
    plane.add(g);
    const part = makePart(s > 0 ? "engL" : "engR");
    g.add(part);
    const mat = nacMat();
    const nac = addMesh(part, nacGeo, mat, { edgeOpacity: 0.8 });
    const spin = addMesh(part, spinGeo, mat, { edgeOpacity: 0.5 });
    // the pylon, up into the wing: glass like the wing it hangs from (only the engine is solid)
    const pyl = plate([[40, 130], [470, 130], [640, 206], [860, 240], [860, 268], [330, 268], [40, 152]], 30, { bevel: 8, round: 3 }).translate(ENG.x - ENGINES.len / 2, ENG.y, s * ENGINES.z - 15);
    pane(pyl, fx.wings);
    const fan = new THREE.Mesh(new THREE.CircleGeometry(118, 72).rotateY(-Math.PI / 2), fanMat());
    fan.position.x = 70;
    fan.renderOrder = 3;
    part.add(fan);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(134, 3, 8, 120).rotateY(Math.PI / 2), glow(BRAND.signal, 1, { additive: true }));
    lip.position.x = -1.5;
    part.add(lip);
    const edges = [nac, spin].map((m) => m.children[0].material);
    engines.push({ s, fan, lip, edges, mat });
  }
  A.engL = anchor(plane, ENG.x, ENG.y, ENGINES.z);
  A.engR = anchor(plane, ENG.x, ENG.y, -ENGINES.z);

  // the flap-track fairings under the trailing edge: the canoes that say « airliner »
  for (const s of [1, -1]) {
    for (const z of [520, 1250, 1750, 2250]) {
      const c = wingChord(z);
      const geo = new THREE.CapsuleGeometry(16, c * 0.62, 6, 14).rotateZ(Math.PI / 2).scale(1, 1.25, 0.8);
      const m = pane(geo, fx.wings);
      m.position.set(wingLE(z) + c * 0.82, wingY(z) - 0.06 * c - 14, s * z);
    }
  }
  asShell(panes, 20);

  /* ── the wing tanks: fuel, solid, drained from the tips inward (`uLevel`: how far out it still reaches) ── */
  fx.level = { value: 1e5 };
  {
    const fuelMat = solid(0x9fa6aa, { rough: 0.5, metal: 0.1, env: 0.9, double: true });
    fuelMat.onBeforeCompile = (sh) => {
      sh.uniforms.uLevel = fx.level;
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying float vSpan;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvSpan = abs(position.z);");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uLevel; varying float vSpan;").replace("void main() {", "void main() {\n  if (vSpan > uLevel) discard;");
    };
    fuelMat.customProgramCacheKey = () => "023-fuel";
    const box4 = (z, s, shrink = 1) => {
      const c = wingChord(z);
      const x0 = wingLE(z) + 0.17 * c;
      const x1 = wingLE(z) + 0.6 * c;
      const half = 0.42 * wingThick(z) * c * 0.5 * shrink;
      const y = wingY(z) + 0.012 * c;
      return [[x0, y + half, s * z], [x1, y + half * 0.8, s * z], [x1, y - half * 0.8, s * z], [x0, y - half, s * z]];
    };
    const TZ = [330, 700, KINK, 1500, 2000, 2350, 2650];
    fx.tankLines = lineMat(BRAND.ink, 1.8, { opacity: 0.5 });
    const tl = [];
    for (const s of [1, -1]) {
      const rows = [box4(TZ[0], s, 0.02), ...TZ.map((z) => box4(z, s)), box4(TZ.at(-1), s, 0.02)];
      const geo = skin(rows, { wrap: true }).toNonIndexed();
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, fuelMat);
      mesh.castShadow = false;
      plane.add(mesh);
      const first = box4(TZ[0], s);
      const last = box4(TZ.at(-1), s);
      run(tl, first, true);
      run(tl, last, true);
      for (let c = 0; c < 4; c++) run(tl, TZ.map((z) => box4(z, s)[c]));
    }
    fx.fuel = plane.children.filter((m) => m.material === fuelMat);
    segments(tl, fx.tankLines);
  }
  A.tanks = anchor(plane, wingLE(1500) + 0.38 * wingChord(1500), wingY(1500), 1500);

  /* ── the leak: fuel streaming aft from the right (far) pylon ── */
  A.leak = anchor(plane, ENG.x + 260, ENG.y + 110, -ENGINES.z);
  fx.leak = makeSpray(46, 31, {
    dir: (r) => [1, -0.04 - r * 0.06, (r - 0.5) * 0.05],
    reach: [1300, 2600],
    half: [22, 60],
    width: [1.2, 2.2],
    rate: 0.32,
    fall: 260,
    color: SIGNAL.clone().multiplyScalar(1.5),
  });
  fx.leak.uniforms.uAt.value.copy(A.leak.position);
  plane.add(fx.leak.mesh);

  /* ── the three hydraulic circuits ──
     Each a set of polylines (cm, plane's frame), offset from its neighbours by HYD.gap. Every vertex knows when the
     RAT's pressure reaches it (`arrive`, 0 at the bay → 1 at the end of every branch: a node's arrive is its distance
     from the bay over that distance plus the longest way left after it). Colours are written per segment end. */
  {
    const segs = []; // [p0, p1, arrive0, arrive1, circuit]
    const add = (c, pts, arr) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = V(...pts[i]);
        const b = V(...pts[i + 1]);
        const n = Math.max(1, Math.ceil(a.distanceTo(b) / 45));
        for (let k = 0; k < n; k++) {
          const p0 = a.clone().lerp(b, k / n);
          const p1 = a.clone().lerp(b, (k + 1) / n);
          segs.push([p0, p1, arr ? arr(i, k / n) : 2, arr ? arr(i, (k + 1) / n) : 2, c]);
        }
      }
    };
    const plen = (pts) => pts.reduce((l, p, i) => (i ? l + V(...p).distanceTo(V(...pts[i - 1])) : 0), 0);
    for (let c = 0; c < HYD.n; c++) {
      const o = (c - HYD.live) * HYD.gap;
      const live = c === HYD.live;
      const y = HYD.y;
      const EXIT = [-600, -230, 59 + (c - HYD.live) * 12]; // where model.js's three lines leave the bay (the live one at z 59)
      const B = [-420, y, o];
      const W = [60, y - 4, o];
      const trunk = [EXIT, B, [-300, y, o], W];
      const aft = [W, [900, y, o], [1650, y + 6, o], [2050, y + 120, o], [2300, 60 + o * 0.2, o]];
      const JT = aft.at(-1);
      const wingRun = (s) => {
        const pts = [W, [230, -186, s * 300 + o * 0.3]];
        for (const z of [520, 900, 1400, 1900, 2350, 2760]) pts.push([wingLE(z) + 0.68 * wingChord(z) + o * 0.7, wingY(z) - 0.012 * wingChord(z), s * z]);
        return pts;
      };
      const elevRun = (s) => [JT, [2440, stabY(160), s * 160 + o * 0.3], ...[400, 700, 900].map((z) => [stabLE(z) + 0.64 * stabChord(z) + o * 0.5, stabY(z), s * z])];
      const rudRun = [JT, [2420, 250, o * 0.25], ...[340, 600, 900, 1060].map((yy) => [finLE(yy) + 0.62 * finChord(yy) + o * 0.5, yy, o * 0.15])];
      const feeds = []; // from the engines' pumps: never lit by the RAT
      if (c === 0) feeds.push(-1);
      else feeds.push(1);
      for (const s of feeds) add(c, [[ENG.x + 330, ENG.y + 120, s * ENGINES.z + o * 0.4], [-120, -150, s * 640 + o * 0.4], [0, -190, s * 300 + o * 0.4], W]);
      if (!live) {
        for (const pts of [trunk, aft, wingRun(1), wingRun(-1), elevRun(1), elevRun(-1), rudRun]) add(c, pts);
        continue;
      }
      // the live one: from the bay, its arrivals
      const stub = [EXIT];
      const toW = plen(stub) + plen(trunk);
      const rem = { wing: plen(wingRun(1)), aft: plen(aft) + Math.max(plen(elevRun(1)), plen(rudRun)) };
      const aW = toW / (toW + Math.max(rem.wing, rem.aft));
      // straight along a chain from `a0` to `a1`
      const chain = (pts, a0, a1) => {
        const L = plen(pts);
        const cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + V(...pts[i]).distanceTo(V(...pts[i - 1])));
        return (i, u) => lerp(a0, a1, (cum[i] + u * (cum[i + 1] - cum[i])) / L);
      };
      const toWpts = trunk;
      add(c, toWpts, chain(toWpts, 0, aW));
      add(c, wingRun(1), chain(wingRun(1), aW, 1));
      add(c, wingRun(-1), chain(wingRun(-1), aW, 1));
      // the tail: the node JT is reached on the way to the farthest end behind it
      const dW = toW;
      const dJT = dW + plen(aft);
      const aJT2 = dJT / (dJT + Math.max(plen(elevRun(1)), plen(rudRun)));
      add(c, aft, chain(aft, aW, aJT2));
      add(c, elevRun(1), chain(elevRun(1), aJT2, 1));
      add(c, elevRun(-1), chain(elevRun(-1), aJT2, 1));
      add(c, rudRun, chain(rudRun, aJT2, 1));
    }
    const positions = new Float32Array(segs.length * 6);
    segs.forEach(([p0, p1], i) => positions.set([p0.x, p0.y, p0.z, p1.x, p1.y, p1.z], i * 6));
    const geo = new LineSegmentsGeometry();
    geo.setPositions(positions);
    const colors = new Float32Array(segs.length * 6);
    geo.setColors(colors);
    fx.hydMat = lineMat(0xffffff, 3, { vertexColors: true });
    const lines = new LineSegments2(geo, fx.hydMat);
    lines.frustumCulled = false;
    lines.renderOrder = 3;
    // a pipe a few centimetres thick: its width follows the distance, never under 2.2 px nor over 9
    lines.onBeforeRender = (renderer, scene, camera) => {
      const k = BRAND.H / (2 * Math.tan((camera.fov * DEG) / 2));
      fx.hydMat.linewidth = Math.min(9, Math.max(2.2, (7 * k) / Math.max(1, camera.position.length())));
    };
    plane.add(lines);
    fx.hyd = { segs, buf: geo.attributes.instanceColorStart.data, key: "" };
  }

  /* ── the control surfaces: ailerons, elevators, rudder — they turn about their hinge lines ── */
  fx.surfMat = solid(0x2c3236, { rough: 0.6, metal: 0.2, double: true });
  fx.surfEdges = [];
  const surfaces = [];
  /** A surface hinged on `h0` → `h1` (world points), its chord `c0` / `c1` aft (+x), its thickness along `n`. */
  const hinged = (h0, h1, c0, c1, t0, t1, n, kind, s) => {
    const a = V(...h0);
    const b = V(...h1);
    const axis = V().subVectors(b, a).normalize();
    const pivot = new THREE.Group();
    pivot.position.copy(a);
    pivot.quaternion.setFromUnitVectors(V(0, 0, 1), axis);
    const inv = pivot.quaternion.clone().invert();
    const N = V(...n);
    const sec = [[-0.05, 0], [0.02, 0.5], [0.25, 0.42], [0.6, 0.22], [1, 0.02], [1, -0.02], [0.6, -0.22], [0.25, -0.42], [0.02, -0.5]];
    const rows = [];
    for (let k = 0; k <= 4; k++) {
      const u = k / 4;
      const shrink = k === 0 || k === 4 ? 0.04 : 1;
      const base = a.clone().lerp(b, lerp(0.004, 0.996, u));
      const c = lerp(c0, c1, u);
      const t = lerp(t0, t1, u);
      rows.push(sec.map(([f, g]) => {
        const p = base.clone().add(V(f * c * (shrink < 1 ? 0.5 : 1), 0, 0)).addScaledVector(N, g * t * shrink).sub(a).applyQuaternion(inv);
        return [p.x, p.y, p.z];
      }));
    }
    // two more rows at each end so the caps close
    const part = makePart(kind);
    const mesh = addMesh(part, skin(rows, { wrap: true }), fx.surfMat, { edgeOpacity: 0.85, threshold: 35 });
    fx.surfEdges.push(mesh.children[0].material);
    pivot.add(part);
    plane.add(pivot);
    surfaces.push({ part, kind, s });
    return part;
  };
  // (built in the frame where the hinge runs toward +z: positive turns the trailing edge up)
  for (const s of [1, -1]) {
    const [z0, z1] = SURFACES.aileron;
    const za = s > 0 ? z0 : -z1;
    const zb = s > 0 ? z1 : -z0;
    const at = (z) => [wingLE(Math.abs(z)) + 0.76 * wingChord(Math.abs(z)), wingY(Math.abs(z)), z];
    const ca = 0.24 * wingChord(Math.abs(za));
    const cb = 0.24 * wingChord(Math.abs(zb));
    hinged(at(za), at(zb), ca, cb, wingThick(Math.abs(za)) * wingChord(Math.abs(za)) * 0.3, wingThick(Math.abs(zb)) * wingChord(Math.abs(zb)) * 0.3, [0, 1, 0], "aileron", s);
    const e0 = s > 0 ? 170 : -(SURFACES.elevator + 30);
    const e1 = s > 0 ? SURFACES.elevator + 30 : -170;
    const st = (z) => [stabLE(Math.abs(z)) + 0.7 * stabChord(Math.abs(z)), stabY(Math.abs(z)), z];
    hinged(st(e0), st(e1), 0.3 * stabChord(Math.abs(e0)), 0.3 * stabChord(Math.abs(e1)), 0.1 * 0.3 * stabChord(Math.abs(e0)) * 1.4, 0.1 * 0.3 * stabChord(Math.abs(e1)) * 1.4, [0, 1, 0], "elevator", s);
  }
  {
    const y0 = FIN.y + 60;
    const y1 = y0 + SURFACES.rudder;
    const rt = (y) => [finLE(y) + 0.7 * finChord(y), y, 0];
    hinged(rt(y0), rt(y1), 0.3 * finChord(y0), 0.3 * finChord(y1), 0.1 * 0.3 * finChord(y0) * 1.5, 0.1 * 0.3 * finChord(y1) * 1.5, [0, 0, 1], "rudder", 0);
  }
  {
    const zm = (SURFACES.aileron[0] + SURFACES.aileron[1]) / 2;
    A.aileron = anchor(plane, wingLE(zm) + 0.88 * wingChord(zm), wingY(zm), zm);
    const ze = SURFACES.elevator * 0.6;
    A.elevator = anchor(plane, stabLE(ze) + 0.85 * stabChord(ze), stabY(ze), ze);
    const yr = FIN.y + 60 + SURFACES.rudder / 2;
    A.rudder = anchor(plane, finLE(yr) + 0.85 * finChord(yr), yr, 0);
  }

  /* ── the landing gear: two four-wheel bogies under the wing roots, the nose gear; brakes in the wheels ── */
  fx.brake = solid(0x2a2e31, { rough: 0.7, metal: 0.2 });
  fx.brake.emissive = new THREE.Color(0, 0, 0);
  fx.brakeGlow = glow(BRAND.signal, 0, { additive: true });
  const GROUND0 = -(FUSE.r + GEAR.h); // the ground under the wheels, gear down, plane level
  fx.gearLines = [];
  const tires = [];
  const gears = [];
  const wheel = (parent, r, w, x, z) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    parent.add(g);
    const tireGeo = lathe([[r * 0.66, -w / 2], [r * 0.9, -w / 2], [r, -w * 0.3], [r, w * 0.3], [r * 0.9, w / 2], [r * 0.66, w / 2]], 64, { bevel: 2 }).rotateX(Math.PI / 2);
    const tp = makePart("tire");
    g.add(tp);
    const tire = addMesh(tp, tireGeo, rubber, { edgeOpacity: 0.5 });
    addMesh(tp, cyl(r * 0.66, w * 0.84, 1.2, 40).rotateX(Math.PI / 2), alloy, { edgeOpacity: 0.5 });
    addMesh(tp, cyl(r * 0.5, w * 0.9, 1, 32).rotateX(Math.PI / 2), fx.brake, { edgeOpacity: 0.4 });
    for (const sz of [1, -1]) {
      const disc = new THREE.Mesh(new THREE.RingGeometry(r * 0.2, r * 0.52, 40), fx.brakeGlow);
      disc.position.z = sz * (w * 0.46 + 0.4);
      if (sz < 0) disc.rotation.y = Math.PI;
      tp.add(disc);
    }
    tires.push({ g: tp, r, tire });
    for (const m of tp.userData.part.mats) if (m.isLineMaterial) fx.gearLines.push(m);
    return g;
  };
  for (const s of [1, -1]) {
    const pivot = new THREE.Group();
    pivot.position.set(GEAR.main[0], -175, s * GEAR.main[1]);
    plane.add(pivot);
    const leg = makePart("gear");
    pivot.add(leg);
    const axle = GROUND0 + 64 - -175; // from the pivot down to the axles
    addMesh(leg, cyl(14, 120, 2, 32).translate(0, -60, 0), steel, { edgeOpacity: 0.5 });
    addMesh(leg, cyl(10.5, -axle - 60, 1.5, 32).translate(0, axle / 2 - 30, 0), bright, { edgeOpacity: 0.5 });
    addMesh(leg, box(196, 15, 15, 3).translate(0, axle, 0), steel, { edgeOpacity: 0.5 });
    const bogie = new THREE.Group();
    bogie.position.y = axle;
    leg.add(bogie);
    for (const dx of [-72, 72]) for (const dz of [-46, 46]) wheel(bogie, 64, 38, dx, dz);
    gears.push({ pivot, s, main: true, bogie });
    if (s > 0) A.gear = anchor(bogie, 0, 0, 0);
    // the sparks of its rear tyres
    const sp = makeSpray(26, 50 + s, {
      dir: (r) => [0.6 + r, 0.08 + r * 0.7, (r - 0.5) * 1.2],
      reach: [40, 170],
      half: [5, 14],
      width: [0.8, 1.6],
      rate: 0.28,
      fall: 34,
      floor: GROUND0,
      color: SIGNAL.clone().lerp(INK, 0.15).multiplyScalar(2.1),
    });
    sp.uniforms.uAt.value.set(GEAR.main[0] + 72 + 40, GROUND0, s * GEAR.main[1]);
    plane.add(sp.mesh);
    gears.at(-1).sparks = sp;
  }
  {
    const pivot = new THREE.Group();
    pivot.position.set(GEAR.nose, -215, 0);
    plane.add(pivot);
    const leg = makePart("noseGear");
    pivot.add(leg);
    const axle = GROUND0 + 52 - -215;
    addMesh(leg, cyl(9, -axle, 1.5, 32).translate(0, axle / 2, 0), bright, { edgeOpacity: 0.5 });
    addMesh(leg, box(14, 14, 70, 3).translate(0, axle, 0), steel, { edgeOpacity: 0.5 });
    const bogie = new THREE.Group();
    bogie.position.y = axle;
    leg.add(bogie);
    for (const dz of [-24, 24]) wheel(bogie, 52, 30, 0, dz);
    gears.push({ pivot, s: 0, main: false, bogie });
  }

  /* ── you: a body of glass at the left window, seated, facing the nose; your left hand on the armrest ── */
  const seat = new THREE.Group();
  seat.position.set(...YOU.at);
  seat.rotation.y = -Math.PI / 2; // the figure looks toward +z, its left is +x: here, the nose (−x) and the window (+z)
  plane.add(seat);
  const fig = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.7, through: 0.2, skin: 0x9a948a }); // a grey head: in ink it melts into your lit window
  fig.group.position.set(0, -90, 0); // the hips at YOU.at
  seat.add(fig.group);
  fig.lean(-12);
  fig.leg("L", V(9, 46, 50), V(0, 1, 0.3));
  fig.leg("R", V(-9, 46, 50), V(0, 1, 0.3));
  fig.reach("R", V(-10, 96, 30));
  const ARMREST = { p: V(25, 106, 16), axis: V(0, 0, 1) };
  const seatParts = makePart("seat");
  seatParts.position.set(0, -90, 0);
  seat.add(seatParts);
  addMesh(seatParts, box(48, 8, 46, 2), dark, { pos: [0, 82, 6], edgeOpacity: 0.35 });
  const back = addMesh(seatParts, box(48, 70, 7, 2), dark, { pos: [0, 120, -18], edgeOpacity: 0.35 });
  back.rotation.x = -12 * DEG;
  addMesh(seatParts, box(5, 5, 44, 1.5), alloy, { pos: [ARMREST.p.x, ARMREST.p.y, ARMREST.p.z], edgeOpacity: 0.4 });
  let gripNow = -1;
  const setGrip = (k) => {
    const q = Math.round(k * 50) / 50;
    if (q === gripNow) return;
    gripNow = q;
    fig.hold("L", ARMREST.p, ARMREST.axis, { k: lerp(0.25, 1, q), bar: 2.5, palm: V(0, -1, 0) });
  };
  setGrip(0);
  A.you = anchor(plane, YOU.at[0] - 6, YOU.at[1] + 74, YOU.at[2]);

  /* ── the 306: small heads of glass, row after row (yours is you) ── */
  {
    const geos = [];
    const head = new THREE.SphereGeometry(9.5, 12, 8);
    const ZS = [-215, -165, -75, -25, 25, 75, 165, 215];
    for (let i = 0; i < CABIN.rows; i++) {
      const x = lerp(CABIN.from, CABIN.to, i / (CABIN.rows - 1));
      for (const z of ZS) {
        if (Math.abs(x - YOU.at[0]) < 60 && z === 215) continue;
        geos.push(head.clone().translate(x, 36, z));
      }
    }
    const merged = new THREE.BufferGeometry();
    const pos = [];
    const nor = [];
    for (const g of geos) {
      const gi = g.toNonIndexed();
      pos.push(...gi.attributes.position.array);
      nor.push(...gi.attributes.normal.array);
    }
    merged.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    merged.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    fx.pax = glass(BRAND.ink, { base: 0.004, rim: 0.32, power: 2.2, edge: 0.2 });
    const mesh = new THREE.Mesh(merged, fx.pax);
    mesh.frustumCulled = false;
    mesh.renderOrder = 9;
    plane.add(mesh);
    fx.paxMesh = mesh;
  }

  /* ── the RAT's bay: the world hangs system.root here ── */
  const mount = new THREE.Group();
  mount.position.set(...BAY.at);
  plane.add(mount);
  A.bay = anchor(plane, BX, BY, BZ);

  A.nose = anchor(plane, FUSE.nose, -46, 0);
  A.tail = anchor(plane, TAIL.x + 200, 520, 0);
  A.cockpit = anchor(plane, FUSE.cockpit, 150, 0);
  A.wingTip = anchor(plane, wingLE(TIPZ) + WING.tip / 2, wingY(TIPZ) + 120, TIPZ);

  /* ── the air going by ── */
  fx.air = makeStreaks({ count: 240, seed: 7, min: [-3600, -900, -3600], size: [7600, 2300, 7200] });
  group.add(fx.air.mesh);
  fx.ratAir = makeStreaks({ count: 34, seed: 11, min: [BX - 600, BY - 300, BZ - 140], size: [1100, 300, 280] });
  fx.ratAir.uniforms.uLen.value = 220;
  group.add(fx.ratAir.mesh);

  /* ── the island: a dark plateau of glass, its contour lines, a grid on its top; the runway, its lamps ── */
  const island = new THREE.Group();
  group.add(island);
  const R = ISLAND.r;
  const H = ISLAND.h;
  const LEVELS = [[0, 0.84], [-0.05 * H, 0.87], [-0.3 * H, 0.925], [-0.7 * H, 0.975], [-H - 40, 1.0]];
  const NI = 120;
  const ringI = (y, f) => Array.from({ length: NI }, (_, j) => {
    const th = (2 * Math.PI * j) / NI;
    const r = R * isleR(th) * f;
    return [r * Math.cos(th), y, r * Math.sin(th) * ISLE_Z];
  });
  fx.isle = glass(BRAND.ink, { base: 0, rim: 0.06, power: 2.6, edge: 0.2, through: 0.08 });
  // its top is dark and matt, not glass: a flat glass cap seen grazing would light up into a grey slab
  const capMat = new THREE.MeshBasicMaterial({ color: BRAND.bg, fog: false });
  const isleSide = new THREE.Mesh(skin(LEVELS.map(([y, f]) => ringI(y, f)), { wrap: true }), fx.isle);
  const topRing = ringI(0, 0.84);
  const capPos = [0, 0, 0, ...topRing.flat()];
  const capIdx = [];
  for (let j = 0; j < NI; j++) capIdx.push(0, 1 + ((j + 1) % NI), 1 + j);
  const capGeo = new THREE.BufferGeometry();
  capGeo.setAttribute("position", new THREE.Float32BufferAttribute(capPos, 3));
  capGeo.setIndex(capIdx);
  capGeo.computeVertexNormals();
  const isleTop = new THREE.Mesh(capGeo, capMat);
  for (const m of [isleSide, isleTop]) {
    m.frustumCulled = false;
    island.add(m);
  }
  asShell([isleSide], 15); // before the plane's shell: the island shows through the glass
  const contours = [];
  for (const [y, f] of LEVELS) run(contours, ringI(y, f), true);
  fx.contours = lineMat(BRAND.ink, 1.7, { opacity: 0.32, fog: true });
  segments(contours, fx.contours, island);
  const grid = [];
  const inside = (x, z) => {
    const th = Math.atan2(z / ISLE_Z, x);
    return Math.hypot(x, z / ISLE_Z) < R * isleR(th) * 0.8;
  };
  for (let gx = -R; gx <= R; gx += 2400) {
    let prev = null;
    for (let gz = -R; gz <= R; gz += 300) {
      const ok = inside(gx, gz) && Math.abs(gz) > RWY_W * 0.8;
      if (ok && prev !== null) grid.push(gx, 2, prev, gx, 2, gz);
      prev = ok ? gz : null;
    }
  }
  for (let gz = -R; gz <= R; gz += 2400) {
    if (Math.abs(gz) < RWY_W * 0.8) continue;
    let prev = null;
    for (let gx = -R; gx <= R; gx += 300) {
      const ok = inside(gx, gz);
      if (ok && prev !== null) grid.push(prev, 2, gz, gx, 2, gz);
      prev = ok ? gx : null;
    }
  }
  fx.grid = lineMat(BRAND.ink, 1.5, { opacity: 0.1, fog: true });
  segments(grid, fx.grid, island);
  // the runway: a dark matt strip (it takes the gear's shadows), its edges, its centre line
  const L = ISLAND.len;
  const rw = makePart("runway");
  island.add(rw);
  addMesh(rw, box(L, 6, RWY_W, 1), solid(0x111518, { rough: 0.95, env: 0.3 }), { pos: [0, -2, 0], edges: false });
  const paint = [];
  run(paint, [[L / 2, 2, RWY_W / 2], [-L / 2, 2, RWY_W / 2]]);
  run(paint, [[L / 2, 2, -RWY_W / 2], [-L / 2, 2, -RWY_W / 2]]);
  run(paint, [[L / 2, 2, RWY_W / 2], [L / 2, 2, -RWY_W / 2]]);
  run(paint, [[-L / 2, 2, RWY_W / 2], [-L / 2, 2, -RWY_W / 2]]);
  for (let x = L / 2 - 1500; x > -L / 2 + 1000; x -= 3600) run(paint, [[x, 2, 0], [x - 1800, 2, 0]]);
  for (let k = -3; k <= 3; k++) if (k) run(paint, [[L / 2 - 300, 2, (k * RWY_W) / 8.5], [L / 2 - 1800, 2, (k * RWY_W) / 8.5]]); // the keys at the threshold
  fx.paint = lineMat(BRAND.ink, 2, { opacity: 0.32, fog: true });
  segments(paint, fx.paint, island);
  {
    const pos = [];
    const k = [];
    const lamp = (x, z, kk = 1) => {
      pos.push(x, 12, z);
      k.push(kk);
    };
    for (let x = L / 2; x >= -L / 2; x -= 1300) {
      lamp(x, RWY_W / 2 + 60);
      lamp(x, -RWY_W / 2 - 60);
    }
    for (let j = -4; j <= 4; j++) {
      lamp(L / 2 + 40, (j * RWY_W) / 8, 1.5); // the threshold bar
      lamp(-L / 2 - 40, (j * RWY_W) / 8, 0.8);
    }
    for (const x of [600, 1200]) for (const z of [-260, 0, 260]) lamp(L / 2 + x, z, 1.2); // the approach lights
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aK", new THREE.Float32BufferAttribute(k, 1));
    fx.lamps = lampMat();
    const pts = new THREE.Points(geo, fx.lamps);
    pts.frustumCulled = false;
    pts.renderOrder = 8;
    island.add(pts);
  }
  A.threshold = anchor(island, L / 2, 0, 0);
  A.island = anchor(island, 0, 0, 0);
  const dress = dressAvion({ plane, island, group });

  /* ── the sea and the sky ── */
  fx.backdrop = backdropMat();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), fx.backdrop);
  dome.frustumCulled = false;
  dome.renderOrder = 100; // last: whatever wrote its depth hides the sea and the sky behind it
  group.add(dome);

  /* ───────────────────────────────────────────────────────── update */
  const hydColor = new THREE.Color();
  const tmpC = new THREE.Color();
  function paintHyd(lines, press, flow) {
    const key = `${lines.toFixed(3)}|${press.toFixed(3)}|${flow.toFixed(4)}`;
    if (key === fx.hyd.key) return;
    fx.hyd.key = key;
    const arr = fx.hyd.buf.array; // interleaved: start rgb, end rgb per segment
    const { segs } = fx.hyd;
    for (let i = 0; i < segs.length; i++) {
      const sg = segs[i];
      for (let e = 0; e < 2; e++) {
        const a = sg[2 + e];
        hydColor.copy(SIGNAL).multiplyScalar(0.3).lerp(tmpC.copy(INK).multiplyScalar(0.52), lines);
        if (a <= 1.5 && press > 0) {
          const lit = press * smooth(flow + 0.012, flow - 0.012, a);
          hydColor.lerp(tmpC.copy(VEILLE).multiplyScalar(1.05), lit);
          const head = press * Math.exp(-(((a - flow) / 0.03) ** 2)) * (flow > 0.002 && flow < 0.998 ? 1 : 0);
          hydColor.r += VEILLE.r * 1.4 * head;
          hydColor.g += VEILLE.g * 1.4 * head;
          hydColor.b += VEILLE.b * 1.4 * head;
        }
        arr[i * 6 + e * 3] = hydColor.r;
        arr[i * 6 + e * 3 + 1] = hydColor.g;
        arr[i * 6 + e * 3 + 2] = hydColor.b;
      }
    }
    fx.hyd.buf.needsUpdate = true;
  }

  const surfLit = new THREE.Color();
  function update(P = {}, time = 0, px = 2000) {
    const ground = P.ground ?? GROUND0;
    const thr = P.threshold ?? -ISLAND.far;
    const sh = clamp01(P.shell ?? 1);

    /* the plane */
    plane.rotation.z = -(P.pitch ?? 0) * DEG;
    plane.rotation.x = (P.bank ?? 0) * DEG;
    fx.hull.uniforms.uAmount.value = sh;
    fx.wings.uniforms.uAmount.value = sh;
    fx.frames.opacity = fx.frames.userData.base * sh;
    fx.outline.opacity = fx.outline.userData.base * sh;
    fx.windows.uniforms.uAmount.value = sh;

    /* the engines: L = clamp(engines, 0, 1), R = clamp(engines − 1, 0, 1) */
    const n = P.engines ?? 0;
    for (const e of engines) {
      const life = clamp01(e.s > 0 ? n : n - 1);
      e.fan.material.uniforms.uLife.value = life;
      e.fan.material.uniforms.uPhase.value = time * 0.12 * (e.s > 0 ? 1 : 0.93);
      const dead = 1 - smooth(0.05, 0.6, life);
      for (const m of e.edges) m.color.copy(INK).lerp(SIGNAL, dead);
      e.lip.material.color.copy(INK).multiplyScalar(0.18 * (1 - dead)).lerp(tmpC.copy(SIGNAL).multiplyScalar(1.5), dead);
    }

    /* the tanks, the leak */
    const fuel = clamp01(P.fuel ?? 0);
    fx.level.value = fuel < 0.002 ? -1 : lerp(330, 2650, fuel);
    for (const m of fx.fuel) m.visible = fuel > 0.002;
    fx.tankLines.color.copy(SIGNAL).lerp(INK, smooth(0, 0.3, fuel));
    fx.tankLines.opacity = lerp(0.34, 0.38, smooth(0, 0.3, fuel)) * Math.max(sh, 0.4);
    const leak = clamp01(P.leak ?? 0);
    fx.leak.mesh.visible = leak > 0.003;
    fx.leak.uniforms.uAmount.value = leak;
    fx.leak.uniforms.uReach.value = 0.35 + 0.65 * leak;
    fx.leak.uniforms.uTime.value = time;
    fx.leak.uniforms.uScale.value = px;

    /* the circuits */
    paintHyd(clamp01(P.lines ?? 0), clamp01(P.press ?? 0), clamp01(P.flow ?? 0));

    /* the control surfaces */
    const surf = clamp01(P.surf ?? 0);
    const stick = Math.max(-1, Math.min(1, P.stick ?? 0));
    fx.surfMat.emissive.copy(SIGNAL).multiplyScalar(0.14 * (1 - surf)).lerp(surfLit.copy(VEILLE).multiplyScalar(0.3), surf);
    for (const m of fx.surfEdges) m.color.copy(SIGNAL).multiplyScalar(0.8).lerp(surfLit.copy(VEILLE).multiplyScalar(1.15), surf);
    for (const sf of surfaces) {
      // stick +1: the left aileron up and the right one down (a roll to the left), both elevators up (nose up), the rudder to the left
      let a = 0;
      if (sf.kind === "aileron") a = stick * 22 * sf.s;
      else if (sf.kind === "elevator") a = stick * 22;
      else a = -stick * 20;
      sf.part.rotation.z = a * DEG;
    }

    /* the gear: 0 up in its bays → 1 down */
    const g = smooth(0, 1, P.gear ?? 0);
    const brakes = clamp01(P.brakes ?? 0);
    const tire = clamp01(P.tires ?? 0);
    for (const gr of gears) {
      if (gr.main) gr.pivot.rotation.x = gr.s * (Math.PI / 2) * (1 - g);
      else gr.pivot.rotation.z = -(Math.PI / 2) * (1 - g);
      if (gr.sparks) {
        const ahead = P.ahead ?? 1;
        const rolling = ahead < 0.02 ? smooth(-0.25, -0.17, ahead) : 0;
        const k = tire * rolling * g;
        gr.sparks.mesh.visible = k > 0.003;
        gr.sparks.uniforms.uAmount.value = k * 0.8;
        gr.sparks.uniforms.uTime.value = time;
        gr.sparks.uniforms.uScale.value = px;
        gr.sparks.uniforms.uFloor.value = ground;
      }
    }
    // stowed in its bays the gear steps back (eight rings under the belly would be eyes): its outlines dim
    for (const m of fx.gearLines) m.opacity = m.userData.base * lerp(0.3, 1, g);
    fx.brake.emissive.copy(SIGNAL).multiplyScalar(0.6 * brakes);
    fx.brakeGlow.color.copy(SIGNAL).multiplyScalar(0.85 * brakes);
    fx.brakeGlow.visible = brakes > 0.003;
    const sy = 1 - 0.26 * tire;
    for (const t of tires) {
      t.tire.scale.set(1 + 0.06 * tire, sy, 1 + 0.1 * tire);
      t.tire.position.y = -t.r * (1 - sy);
    }

    /* you, the 306 */
    const you = clamp01(P.you ?? 1);
    fig.group.visible = you > 0.004;
    seatParts.visible = you > 0.004;
    fig.body.uniforms.uAmount.value = you * Math.max(sh, 0.5);
    setGrip(clamp01(P.grip ?? 0));
    const pax = clamp01(P.pax ?? 0);
    fx.paxMesh.visible = pax > 0.003;
    fx.pax.uniforms.uAmount.value = pax;

    /* the air */
    const wind = clamp01(P.wind ?? 0);
    const whirl = clamp01(P.whirl ?? 0);
    fx.air.mesh.visible = wind > 0.003;
    fx.air.uniforms.uAmount.value = wind;
    fx.air.uniforms.uTravel.value = time * 5200;
    fx.air.uniforms.uWhirl.value = whirl;
    fx.ratAir.mesh.visible = wind * whirl > 0.003;
    fx.ratAir.uniforms.uAmount.value = wind * whirl;
    fx.ratAir.uniforms.uTravel.value = time * 5200;
    fx.ratAir.uniforms.uWhirl.value = whirl;

    /* the world: the island at the threshold, the sea under it, the runway's lamps */
    island.position.set(thr - L / 2, ground, 0);
    fx.backdrop.uniforms.uSeaY.value = ground - H;
    fx.backdrop.uniforms.uIsle.value.set(thr - L / 2, 0);
    fx.backdrop.uniforms.uDawn.value = clamp01(P.dawn ?? 0);
    const runway = clamp01(P.runway ?? 0);
    fx.lamps.uniforms.uAmount.value = runway * 2.2;
    fx.lamps.uniforms.uScale.value = px;
    fx.lamps.uniforms.uColor.value.copy(SIGNAL).lerp(VEILLE, smooth(0, 1, P.made ?? 0));
    fx.paint.opacity = fx.paint.userData.base * (0.4 + 0.6 * runway);
    dress.update(P, time, px);
  }
  update();

  return { group, mount, A, update };
}
