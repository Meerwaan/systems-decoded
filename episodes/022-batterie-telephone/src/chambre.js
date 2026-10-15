// DOSSIER 022 — the bedroom at night, and the ranks.
//   buildChambre() → { group, ranks, anchors, update(s, time, px) }
//   group    the bedroom, in the room's coordinates (floor y = 0); the phone is NOT in it (world.js mounts the system)
//   ranks    the twins of the phone, in the bench's coordinates (world.js lays it on the bench); slot (0, 0) left empty
//   anchors  pillow · pocket · head · socket · table
//   update   s = { room, fade, shell, you, cloth, pillow, trapped, plug, charge, place, heat, ranks, recall }
// THE ROOM is an X-ray: walls and ceiling barely there, no solid floor (a grid), a bed whose mattress has no top
// face (its lines, four flanks of glass), a duvet drawn by its relief, a bedside table, a socket. You: a body of
// glass asleep on your right side, facing −x, knees drawn up, one hand under the pillow's edge; you breathe.
// THE PILLOW is a soft lens — two skins meeting on a seam — hollowed under your head and ARCHED over the phone:
// its underside makes a small vault open toward −x, where the cable goes in. That vault is the pocket of heat:
// its ceiling is tinted signal (a heart above the phone, a tail toward its mouth), a narrow spill runs out on the
// mattress, and warm motes rise from the phone's back, meet the ceiling and stay. `pillow` folds the camera-side
// corner up like a page, round a hinge just in front of your head (your head stays where it lies).
// Three colours. signal: the heat. veille: the way to the bare floor. ink: everything else, the cable's current too.
// Shell orders (see `asShell`): you 10 · the pillow 14 · the duvet 18 · the table 22 · the headboard 26.
// Centimetres, y up. Everything is a function of the state and of `time`; `update` allocates nothing.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glass, asShell, box, plate, placed, lineMat, fatLine, makePart, addMesh, setPartOpacity, mergeGeometries } from "@kit/build3d.js";
import { ROOM, BED, PILLOW, YOU, TABLE, SOCKET, SPOTS, phoneSpot, PHONE, PORT, BATT, RANKS } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const ORDER = { you: 10, pillow: 14, duvet: 18, table: 22, head: 26 };
const STROKE = { strong: { w: 2.4, a: 0.74 }, fine: { w: 1.9, a: 0.42 }, faint: { w: 1.8, a: 0.2 } };
const { x: RX, z0: Z0, z1: Z1, h: CEIL } = ROOM;
const TOP = BED.top;
const HEAD_Y = 68; // your head's centre: on the pillow, not in it (plan.js says 63: the pillow is hollowed under it instead)

/* ───────────────────────────────────────────────────────────── the pillow's shape (shared by its mesh, the motes, the anchors) */

const W2 = PILLOW.w / 2;
const D2 = PILLOW.d / 2;
const SEAM = -1; // the seam's height, from the pillow's centre: its top rises 8 above it, its underside hangs 6 below
const PUFF = { top: 9.5, bot: 6 };
const DENT = { at: [YOU.head[0] - PILLOW.at[0], YOU.head[2] - PILLOW.at[2]], depth: 8.2, r: 14 }; // under your head
const CAVE = { at: [SPOTS[0][0] - PILLOW.at[0], SPOTS[0][2] - PILLOW.at[2]], h: 3.6, out: 22, in: 13, across: 9 }; // over the phone, open toward −x
const HINGE = { at: [7.5, 0], dir: [-0.883, 0.469], band: 14, angle: 42 * DEG, y0: SEAM - PUFF.bot }; // the fold of `pillow`
const puff1 = (a) => Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(a), 2.4)));
const puff = (u, v) => puff1(u) * puff1(v);
const cave = (x, z) => {
  const dx = (x - CAVE.at[0]) / (x < CAVE.at[0] ? CAVE.out : CAVE.in);
  const dz = (z - CAVE.at[1]) / CAVE.across;
  return CAVE.h * Math.exp(-dx * dx - dz * dz);
};
/** The pillow's two skins at (u, v) ∈ [−1, 1]²: where (x, z), and the heights of its top and of its underside (its own frame). */
function pillowAt(u, v, out) {
  const x = u * W2 * (1 - 0.05 * (1 - v * v)); // its sides drawn in, its corners out
  const z = v * D2 * (1 - 0.07 * (1 - u * u));
  const f = puff(u, v);
  const thick = (PUFF.top + PUFF.bot - 3) * f;
  const dent = Math.min(DENT.depth * Math.exp(-((x - DENT.at[0]) ** 2 + (z - DENT.at[1]) ** 2) / (DENT.r * DENT.r)), thick);
  const lift = Math.min(cave(x, z), Math.max(0, thick - dent));
  out.x = x;
  out.z = z;
  out.f = f;
  out.top = SEAM + PUFF.top * f - dent;
  out.bot = SEAM - PUFF.bot * f + lift;
  return out;
}

/** The fold of `pillow`, in GLSL: everything past the hinge turns up round it, over a band `BAND` wide. */
const BEND = /* glsl */ `
  uniform float uTheta; uniform vec2 uHinge; uniform vec2 uDir;
  const float BAND = ${HINGE.band.toFixed(1)}; const float Y0 = ${HINGE.y0.toFixed(2)};
  void bend(inout vec3 p, inout vec3 n) {
    vec2 r = p.xz - uHinge;
    vec2 perp = vec2(-uDir.y, uDir.x);
    float s = dot(r, uDir); float t = dot(r, perp); float h = p.y - Y0;
    float sb = clamp(s, 0.0, BAND);
    float phi = uTheta * sb / BAND;
    float k = max(uTheta / BAND, 1e-4);
    float rest = max(s - BAND, 0.0);
    float c = cos(phi); float sn = sin(phi);
    float S = (s < 0.0 ? s : sin(k * sb) / k + rest * c) - sn * h;
    float Y = (1.0 - cos(k * sb)) / k + rest * sn + c * h;
    p = vec3(uHinge.x + S * uDir.x + t * perp.x, Y0 + Y, uHinge.y + S * uDir.y + t * perp.y);
    float ns = dot(n.xz, uDir); float nt = dot(n.xz, perp);
    float ns2 = ns * c - n.y * sn;
    n = vec3(ns2 * uDir.x + nt * perp.x, ns * sn + n.y * c, ns2 * uDir.y + nt * perp.y);
  }`;

function pillowGeometry(sides) {
  const NU = 56;
  const NV = 36;
  const pos = [];
  const rim = [];
  const index = [];
  const at = {};
  for (const sgn of sides) {
    const base = pos.length / 3;
    for (let j = 0; j <= NV; j++)
      for (let i = 0; i <= NU; i++) {
        pillowAt(-1 + (2 * i) / NU, -1 + (2 * j) / NV, at);
        pos.push(at.x, sgn > 0 ? at.top : at.bot, at.z);
        rim.push(at.f);
      }
    for (let j = 0; j < NV; j++)
      for (let i = 0; i < NU; i++) {
        const a = base + j * (NU + 1) + i;
        const b = a + 1;
        const c = a + NU + 1;
        const d = c + 1;
        if (sgn > 0) index.push(a, c, b, b, c, d);
        else index.push(a, b, c, b, d, c);
      }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aRim", new THREE.Float32BufferAttribute(rim, 1));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/** The pillow: `uCloth` 1 a body of dense glass with its seam · 0 a bare outline. */
function pillowMaterial(bendU) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK }, uAmount: { value: 1 }, uCloth: { value: 1 }, ...bendU },
    vertexShader: /* glsl */ `
      attribute float aRim; varying vec3 vN; varying vec3 vV; varying vec3 vW; varying float vRim;
      ${BEND}
      void main() {
        vec3 p = position; vec3 n = normal;
        bend(p, n);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = normalize(normalMatrix * n); vV = normalize(-mv.xyz); vW = n; vRim = aRim;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uCloth; varying vec3 vN; varying vec3 vV; varying vec3 vW; varying float vRim;
      void main() {
        if (uAmount < 0.003) discard;
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        vec3 w = normalize(vW);
        float lit = clamp(dot(w, vec3(-0.45, 0.62, 0.64)), 0.0, 1.0);
        float body = 0.03 + 0.42 * pow(g, 2.2) + 0.26 * smoothstep(0.62, 0.97, g) + 0.1 * lit;
        float bare = 0.06 * pow(g, 3.0) + 0.3 * smoothstep(0.84, 0.985, g);
        float fw = max(fwidth(vRim), 1e-4);
        float seam = 1.0 - smoothstep(1.2 * fw, 2.6 * fw, vRim);
        gl_FragColor = vec4(uColor * ((mix(bare, body, uCloth) + seam * mix(0.5, 0.62, uCloth)) * uAmount), 1.0);
      }`,
  });
  mat.userData.through = 0;
  return mat;
}

/** The heat on the pillow's underside: painted where it lies (it folds with it), a heart above the phone, a tail toward the mouth. */
function roofMaterial(bendU) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: SIGNAL }, uAmount: { value: 0 }, uPhone: { value: new THREE.Vector2(CAVE.at[0], CAVE.at[1]) }, ...bendU },
    vertexShader: /* glsl */ `
      varying vec2 vR;
      ${BEND}
      void main() {
        vec3 p = position; vec3 n = normal;
        vR = position.xz;
        bend(p, n);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; uniform vec2 uPhone; varying vec2 vR;
      void main() {
        if (uAmount < 0.003) discard;
        vec2 d = vR - uPhone;
        float e = length(vec2(d.x / (d.x < 0.0 ? 1.7 : 1.0), d.y));
        float l = 1.5 * exp(-e * e / 46.0) + 0.34 * exp(-e / 9.0);
        gl_FragColor = vec4(uColor * (l * uAmount), 1.0);
      }`,
  });
}

/** What runs out of the vault on the mattress: a heart round the phone, a long tail toward −x. Never a bed that glows. */
function spillMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: SIGNAL }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vR; varying vec2 vUv;
      void main() { vR = position.xz; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vR; varying vec2 vUv;
      void main() {
        if (uAmount < 0.003) discard;
        float e = length(vec2(vR.x / (vR.x < 0.0 ? 2.3 : 1.0), vR.y));
        float l = 0.7 * exp(-e * e / 40.0) + 0.24 * exp(-e / 8.0);
        vec2 b = smoothstep(0.0, 0.14, vUv) * smoothstep(0.0, 0.14, 1.0 - vUv);
        gl_FragColor = vec4(uColor * (l * b.x * b.y * uAmount), 1.0);
      }`,
  });
}

/** A light seen from far away: a bright heart and a long tail (006, hall.js). A ball that fades evenly is a ball. */
function haloMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main() {
        float n = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        gl_FragColor = vec4(uColor * (0.8 * pow(n, 14.0) + 0.2 * pow(n, 4.0)), 1.0);
      }`,
  });
}

/**
 * The heat the pillow holds: warm motes born on the phone's back. Held (`uFree` 0), each rises to the pillow's
 * underside, creeps a little along it and stays; free (1), it rises on and dies out. Periodic: alive on any frame.
 * In the phone's own frame (the points follow the phone).
 */
function makeHeat(count = 170) {
  const rand = rng(22);
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rand() - 0.5) * (PHONE.w - 2.4) + 0.6;
    pos[i * 3 + 1] = PHONE.t + 0.15;
    pos[i * 3 + 2] = (rand() - 0.5) * (PHONE.d - 1.4);
    seed[i * 4] = rand();
    seed[i * 4 + 1] = rand();
    seed[i * 4 + 2] = rand();
    seed[i * 4 + 3] = Math.PI * (0.55 + 0.9 * rand()); // which way it creeps: mostly toward −x, the mouth of the vault
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
  const uniforms = { uTime: { value: 0 }, uAmount: { value: 0 }, uFree: { value: 0 }, uScale: { value: 1 }, uColor: { value: new THREE.Color(BRAND.signal).multiplyScalar(1.4) } };
  const f = (n) => n.toFixed(3);
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uAmount, uFree, uScale; attribute vec4 aSeed; varying float vA; varying float vStretch;
        float puff1(float a) { return sqrt(clamp(1.0 - pow(abs(a), 2.4), 0.0, 1.0)); }
        // the pillow's underside above the phone's frame (the pillow at rest)
        float roof(vec2 q) {
          vec2 l = q + vec2(${f(SPOTS[0][0] - PILLOW.at[0])}, ${f(SPOTS[0][2] - PILLOW.at[2])});
          vec2 c = l - vec2(${f(CAVE.at[0])}, ${f(CAVE.at[1])});
          float ax = c.x / (c.x < 0.0 ? ${f(CAVE.out)} : ${f(CAVE.in)}); float az = c.y / ${f(CAVE.across)};
          return ${f(SEAM + PILLOW.at[1] - SPOTS[0][1])} - ${f(PUFF.bot)} * puff1(l.x / ${f(W2)}) * puff1(l.y / ${f(D2)}) + ${f(CAVE.h)} * exp(-ax * ax - az * az);
        }
        void main() {
          float T = 8.0 + 5.0 * aSeed.y;
          float ph = fract(uTime / T + aSeed.x);
          float age = ph * T;
          vec2 dir = vec2(cos(aSeed.w), sin(aSeed.w));
          // held: up to the ceiling, then along it
          float up = 2.2 + 1.2 * aSeed.z;
          float room = max(roof(position.xz) - position.y - 0.35, 0.1);
          float hit = room / up;
          float creep = smoothstep(0.0, 1.0, clamp((age - hit) / max(T - hit, 0.1), 0.0, 1.0));
          vec2 xzH = position.xz + dir * creep * (1.5 + 5.5 * aSeed.z);
          xzH.x = max(xzH.x, -15.0);
          float yH = min(position.y + up * age, roof(xzH) - 0.35);
          // free: up and away
          float rise = age * (3.6 + 4.0 * aSeed.y);
          vec2 xzF = position.xz + dir * 0.07 * rise + 0.5 * vec2(sin(age * 0.7 + aSeed.x * 20.0), cos(age * 0.6 + aSeed.x * 12.0));
          vec3 p = vec3(mix(xzH, xzF, uFree), mix(yH, position.y + rise, uFree)).xzy;
          float speed = mix(age < hit ? up : 0.12, 3.6 + 4.0 * aSeed.y, uFree);
          float alive = smoothstep(0.0, 0.05, ph) * (1.0 - smoothstep(0.88, 1.0, ph));
          alive *= mix(0.86 + 0.14 * sin(uTime * 0.9 + aSeed.x * 40.0), 1.0 - smoothstep(9.0, 44.0, rise), uFree);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float size = max(2.6, (0.5 + 0.6 * aSeed.z) * uScale / max(1.0, -mv.z));
          vStretch = clamp(speed * 0.28 * uScale / max(1.0, -mv.z) / size, 0.0, 4.0);
          gl_PointSize = size * (1.0 + vStretch);
          gl_Position = projectionMatrix * mv;
          vA = uAmount * alive * (0.5 + 0.5 * aSeed.y) * mix(0.62, 1.0, uFree); // held, they lie on the pocket's own light: dimmer, or they turn white
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA; varying float vStretch;
        void main() {
          vec2 q = gl_PointCoord - 0.5;
          q.x *= 1.0 + vStretch;
          float a = pow(max(0.0, 1.0 - 2.0 * length(q)), 1.6);
          gl_FragColor = vec4(uColor * (a * vA), 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 6;
  return { points, uniforms };
}

/* ───────────────────────────────────────────────────────────── a head (012's, hob.js) and a figure of glass (017's, suite.js) */

const SKULL = [
  { c: [0, 2.2, -1.5], r: [7.6, 8.5, 9.7] },
  { c: [0, -3.8, 2.0], r: [6.5, 7.4, 6.5], k: 1.8 },
  { c: [0, -8.4, 4.4], r: [2.8, 2.1, 2.3], k: 2.2 },
  { c: [0, 2.6, 6.3], r: [5.9, 1.4, 2.4], k: 1.0 },
  { c: [4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 },
  { c: [-4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 },
  { c: [0, 0.2, 7.3], r: [0.95, 3.0, 1.55], k: 0.8 },
  { c: [0, -2.7, 8.1], r: [1.3, 1.35, 2.3], k: 1.0 },
  { c: [0, -6.5, 6.5], r: [2.6, 1.1, 1.7], k: 1.8 },
];
function headGeometry() {
  const far = (d, c, r) => {
    const ax = d.x / r[0], ay = d.y / r[1], az = d.z / r[2];
    const bx = c[0] / r[0], by = c[1] / r[1], bz = c[2] / r[2];
    const a = ax * ax + ay * ay + az * az;
    const b = ax * bx + ay * by + az * bz;
    const disc = b * b - a * (bx * bx + by * by + bz * bz - 1);
    return disc > 0 ? Math.max(0, (b + Math.sqrt(disc)) / a) : 0;
  };
  const smax = (a, b, k) => {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.max(a, b) + h * h * k * 0.25;
  };
  const ico = new THREE.IcosahedronGeometry(1, 20);
  ico.deleteAttribute("uv");
  ico.deleteAttribute("normal");
  const g = mergeVertices(ico, 1e-5);
  const at = g.attributes.position;
  const d = V();
  for (let i = 0; i < at.count; i++) {
    d.fromBufferAttribute(at, i).normalize();
    let r = far(d, SKULL[0].c, SKULL[0].r);
    for (let j = 1; j < SKULL.length; j++) r = smax(r, far(d, SKULL[j].c, SKULL[j].r), SKULL[j].k);
    at.setXYZ(i, d.x * r, d.y * r, d.z * r);
  }
  g.computeVertexNormals();
  return g;
}
function glassFigure({ order, k, through = 0.2 }) {
  const fig = makeFigure({ shell: true, hands: "real", order, glassK: k, through, skin: BRAND.ink });
  fig.ghost(true);
  const HEADY = 76.5;
  const headGeo = headGeometry();
  const head = glass(BRAND.ink, { base: 0.006 * k, rim: 0.5 * k, power: 2.4, edge: 0.42 * k, spec: 0.65 * k, through: 0.06 });
  fig.head.geometry = headGeo;
  fig.head.material = head;
  fig.head.position.set(0, HEADY, 2);
  asShell(fig.head, order);
  for (const layer of fig.head.children) if (layer.userData.shell) layer.geometry = headGeo;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.6, 9, 24, 1, true), fig.body);
  neck.position.set(0, HEADY - 12.5, 0.7);
  neck.rotation.x = 10 * DEG;
  neck.scale.z = 0.92;
  fig.torso.add(neck);
  asShell(neck, order);
  return { fig, head };
}

/* ───────────────────────────────────────────────────────────── glass and lines, baked where they stand (017, suite.js) */

function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  return o;
}
function makeSet() {
  const L = { strong: [], fine: [], faint: [] };
  const buckets = new Map();
  const into = (material, g) => {
    if (!buckets.has(material)) buckets.set(material, []);
    buckets.get(material).push(g);
  };
  const seg = (list, a, b) => list.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const run = (list, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) seg(list, pts[i], pts[i + 1]);
    if (closed) seg(list, pts[pts.length - 1], pts[0]);
  };
  const edgesInto = (list, geometry) => {
    const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, 28).attributes.position;
    for (let i = 0; i < e.count; i += 2) seg(list, [e.getX(i), e.getY(i), e.getZ(i)], [e.getX(i + 1), e.getY(i + 1), e.getZ(i + 1)]);
  };
  const piece = (material, geometry, { pos, rotX, rotY, rotZ, lines = false } = {}) => {
    const g = placed(geometry, { pos, rotX, rotY, rotZ });
    if (lines) edgesInto(L[lines], g);
    into(material, bare(g));
  };
  const slab = (material, xa, xb, ya, yb, za, zb, { r = 0.25, lines = false } = {}) => piece(material, box(xb - xa, yb - ya, zb - za, r), { pos: [(xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2], lines });
  const sheet = (material, a, b, c, d) => {
    const n = V(...b).sub(V(...a)).cross(V(...d).sub(V(...a))).normalize();
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(Array.from({ length: 6 }, () => [n.x, n.y, n.z]).flat(), 3));
    into(material, g);
  };
  const build = (parent, order, glasses, lines) => {
    const panes = [];
    for (const [material, list] of buckets) {
      const mesh = new THREE.Mesh(list.length > 1 ? mergeGeometries(list) : list[0], material);
      mesh.frustumCulled = false;
      parent.add(mesh);
      panes.push(mesh);
      glasses.push(material);
    }
    if (order != null) asShell(panes, order);
    for (const name of Object.keys(L)) {
      if (!L[name].length) continue;
      const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(L[name]), lineMat(BRAND.ink, STROKE[name].w, { opacity: STROKE[name].a }));
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;
      parent.add(mesh);
      lines.push(mesh.material);
    }
  };
  return { L, seg, run, piece, slab, sheet, build };
}
/** A rectangle with round corners, flat at height y: its points, in order. */
function rrect(x0, x1, z0, z1, r, y, n = 5) {
  const pts = [];
  const corner = (cx, cz, from) => {
    for (let i = 0; i <= n; i++) {
      const a = from + (i / n) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]);
    }
  };
  corner(x1 - r, z1 - r, 0);
  corner(x0 + r, z1 - r, Math.PI / 2);
  corner(x0 + r, z0 + r, Math.PI);
  corner(x1 - r, z0 + r, 1.5 * Math.PI);
  return pts;
}

/** A floor that is only its grid, each family of lines leaving before it crowds (017). */
function gridMaterial({ cell, major = 5, reach = 300, centre = [0, 0] }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK }, uCell: { value: cell }, uMajor: { value: major }, uReach: { value: reach }, uCentre: { value: new THREE.Vector2(...centre) }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uCell, uMajor, uReach, uAmount; uniform vec2 uCentre; varying vec2 vP;
      float lines(float q) {
        float fw = max(fwidth(q), 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return smoothstep(3.0, 11.0, 1.0 / fw) * (1.0 - smoothstep(0.0, fw * 1.5, d));
      }
      float level(vec2 q) { return max(lines(q.x), lines(q.y)); }
      void main() {
        if (uAmount < 0.002) discard;
        float g = max(level(vP / uCell) * 0.42, level(vP / (uCell * uMajor)));
        vec2 r = (vP - uCentre) / uReach;
        gl_FragColor = vec4(uColor * (g * (0.3 + 0.7 * exp(-dot(r, r))) * uAmount), 1.0);
      }`,
  });
}

/* ───────────────────────────────────────────────────────────── the duvet */

/**
 * A cloth lying on the bed and on whoever sleeps in it. Flat and seen at a grazing angle it gives NOTHING (a veil
 * there is a grey slab across the picture): it is drawn by its relief — the slopes that face the key light —, by its
 * outline where a slope turns away from the eye, by its hem, and by a quilting that leaves before its squares crowd.
 */
function duvetMaterial() {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK }, uAmount: { value: 1 }, uYou: { value: 1 }, uBreath: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aMound; attribute float aChest; attribute float aBorder; attribute vec3 aFlat;
      uniform float uYou, uBreath;
      varying vec3 vN; varying vec3 vV; varying vec3 vW; varying vec2 vP; varying float vBorder; varying float vMound;
      void main() {
        vMound = aMound * uYou;
        vec3 p = position + vec3(0.0, aMound * (uYou - 1.0) + aChest * uBreath * uYou, 0.0);
        vec3 n = normalize(mix(aFlat, normal, uYou));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = normalize(normalMatrix * n); vV = normalize(-mv.xyz); vW = n; vP = p.xz; vBorder = aBorder;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec3 vN; varying vec3 vV; varying vec3 vW; varying vec2 vP; varying float vBorder; varying float vMound;
      float lines(float q) {
        float fw = max(fwidth(q), 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return smoothstep(4.0, 14.0, 1.0 / fw) * (1.0 - smoothstep(0.0, fw * 1.5, d));
      }
      void main() {
        if (uAmount < 0.003) discard;
        vec3 w = normalize(vW);
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float slope = clamp(1.0 - abs(w.y), 0.0, 1.0);
        float relief = clamp(dot(w.xz, vec2(-0.62, 0.78)), 0.0, 1.0);
        float outline = pow(g, 3.0) * smoothstep(0.06, 0.42, slope);
        float quilt = max(lines(vP.x / 21.0), lines(vP.y / 21.0));
        float fb = max(fwidth(vBorder), 1e-4);
        float hem = 1.0 - smoothstep(1.0 * fb, 2.4 * fb, vBorder);
        float body = smoothstep(0.6, 5.0, vMound); // where it lies on someone
        gl_FragColor = vec4(uColor * ((0.5 * outline * (0.2 + 0.8 * body) + 0.07 * relief * body + quilt * (0.07 + 0.2 * body) + 0.8 * hem) * uAmount), 1.0);
      }`,
  });
  mat.userData.through = 0;
  return mat;
}

/* ───────────────────────────────────────────────────────────── the cable */

const DASH = { period: 6, speed: 9 }; // cm, cm per second: a twentieth of a period per frame
const CABLE_R = 0.45;
const [SX, SY] = SOCKET;
// Where it runs, for the phone under the pillow · on the bedside table · on the floor: seven fixed points, then three hung on its end.
const LAY = [
  { fixed: [[SX, SY, Z0 + 4.4], [SX, SY - 2.5, Z0 + 7.4], [SX + 0.4, SY - 14, Z0 + 9.5], [SX + 2.5, 60.6, Z0 + 13.5], [SX + 10, 58.6, Z0 + 22], [SX + 20, 58.6, Z0 + 30], [SX + 31, 55.2, Z0 + 37]], hung: [[-40.5, 0.5, -5.5], [-9, 0.08, -0.6], [0, 0, 0]] },
  { fixed: [[SX, SY, Z0 + 4.4], [SX - 0.4, SY - 2.5, Z0 + 7.4], [SX - 3, SY - 14, Z0 + 9.5], [SX - 8, 61, Z0 + 12.5], [SX - 13.5, 58.6, Z0 + 17], [SX - 17, 58.6, Z0 + 23], [SX - 18.2, 58.6, Z0 + 28]], hung: [[-8, 0.15, -2.2], [-4.5, 0.05, -0.4], [0, 0, 0]] },
  { fixed: [[SX, SY, Z0 + 4.4], [SX - 0.4, SY - 2.5, Z0 + 7.4], [SX - 3, SY - 14, Z0 + 9.5], [SX - 8, 61, Z0 + 12.5], [SX - 12, 58.6, Z0 + 21], [SX - 14, 58.6, Z0 + 37], [SX - 15, 57, Z0 + 46.5]], hung: [[-2.2, 0.2, -215], [-3, 0.1, -40], [0, 0, 0]] },
];
const KEYS = 10;
const PER = 9; // samples per span
const RINGS = (KEYS - 1) * PER + 1;
const RAD = 8;

function makeCable() {
  const pos = new Float32Array(RINGS * RAD * 3);
  const nor = new Float32Array(RINGS * RAD * 3);
  const along = new Float32Array(RINGS * RAD);
  const index = [];
  for (let i = 0; i < RINGS - 1; i++)
    for (let j = 0; j < RAD; j++) {
      const a = i * RAD + j;
      const b = i * RAD + ((j + 1) % RAD);
      index.push(a, b, a + RAD, b, b + RAD, a + RAD);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("aS", new THREE.BufferAttribute(along, 1));
  geo.setIndex(index);
  const uniforms = { uInk: { value: INK }, uAlpha: { value: 1 }, uFlow: { value: 0 }, uLive: { value: 1 }, uStill: { value: 0 }, uPeriod: { value: DASH.period } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: /* glsl */ `
        attribute float aS; varying float vS; varying vec3 vN; varying vec3 vP;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vS = aS; vN = normalize(normalMatrix * normal); vP = mv.xyz;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk; uniform float uAlpha, uFlow, uLive, uStill, uPeriod; varying float vS; varying vec3 vN; varying vec3 vP;
        // one dash per unit of q, 'frac' of it lit; too far to tell them apart, they melt into their mean
        float dash(float q, float frac) {
          float w = clamp(fwidth(q), 1e-4, 1.0);
          float d = abs(fract(q) - 0.5);
          return mix(1.0 - smoothstep(0.5 * frac - w, 0.5 * frac + w, d), frac, smoothstep(0.3, 0.65, w));
        }
        void main() {
          if (uAlpha < 0.003) discard;
          float facing = clamp(dot(normalize(vN), normalize(-vP)), 0.0, 1.0);
          vec3 col = uInk * (0.06 + 0.24 * pow(facing, 1.5)); // the conductor: a dark thread, round under the light
          float run = dash((vS - uFlow) / uPeriod, 0.5) * uLive; // the charger's current: light dashes running to the phone
          float still = dash(vS / uPeriod, 0.5) * uStill; //        …stopped where they stand, and dimmed
          col += uInk * (1.55 * run + 0.4 * still) * (0.6 + 0.4 * facing);
          gl_FragColor = vec4(col, uAlpha);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  const K = new Float32Array(KEYS * 3);
  const spot = [0, 0, 0];
  const end = V();
  let lastPlace = -1;
  let lastBack = -1;
  /** Lays the cable for the phone at `place`, its plug `back` cm out of the port. Returns where its plug is. */
  function lay(place, back) {
    if (place === lastPlace && back === lastBack) return end;
    lastPlace = place;
    lastBack = back;
    const p = Math.min(2, Math.max(0, place));
    const i0 = Math.min(1, Math.floor(p));
    const u = p - i0;
    const A = LAY[i0];
    const B = LAY[i0 + 1];
    phoneSpot(p, spot);
    end.set(spot[0] + PORT[0] - 1.1 - back, spot[1] + PORT[1] + (CABLE_R + 0.05 - PORT[1]) * clamp01(back / 3), spot[2] + PORT[2]);
    for (let k = 0; k < 7; k++) for (let c = 0; c < 3; c++) K[k * 3 + c] = mix(A.fixed[k][c], B.fixed[k][c], u);
    for (let k = 0; k < 3; k++) {
      K[(7 + k) * 3] = end.x + mix(A.hung[k][0], B.hung[k][0], u);
      K[(7 + k) * 3 + 1] = end.y + mix(A.hung[k][1], B.hung[k][1], u);
      K[(7 + k) * 3 + 2] = end.z + mix(A.hung[k][2], B.hung[k][2], u);
    }
    // a Catmull-Rom spline through the ten points; its frame carried along it (no twist, no flip where it hangs straight down)
    let nx = 1, ny = 0, nz = 0;
    let px = 0, py = 0, pz = 0;
    let s = 0;
    for (let r = 0; r < RINGS; r++) {
      const span = Math.min(KEYS - 2, Math.floor(r / PER));
      const t = r / PER - span;
      const i1 = span * 3;
      const ia = Math.max(0, span - 1) * 3;
      const i2 = (span + 1) * 3;
      const ib = Math.min(KEYS - 1, span + 2) * 3;
      const t2 = t * t, t3 = t2 * t;
      const c0 = -0.5 * t3 + t2 - 0.5 * t, c1 = 1.5 * t3 - 2.5 * t2 + 1, c2 = -1.5 * t3 + 2 * t2 + 0.5 * t, c3 = 0.5 * t3 - 0.5 * t2;
      const d0 = -1.5 * t2 + 2 * t - 0.5, d1 = 4.5 * t2 - 5 * t, d2 = -4.5 * t2 + 4 * t + 0.5, d3 = 1.5 * t2 - t;
      const x = c0 * K[ia] + c1 * K[i1] + c2 * K[i2] + c3 * K[ib];
      const y = c0 * K[ia + 1] + c1 * K[i1 + 1] + c2 * K[i2 + 1] + c3 * K[ib + 1];
      const z = c0 * K[ia + 2] + c1 * K[i1 + 2] + c2 * K[i2 + 2] + c3 * K[ib + 2];
      let tx = d0 * K[ia] + d1 * K[i1] + d2 * K[i2] + d3 * K[ib];
      let ty = d0 * K[ia + 1] + d1 * K[i1 + 1] + d2 * K[i2 + 1] + d3 * K[ib + 1];
      let tz = d0 * K[ia + 2] + d1 * K[i1 + 2] + d2 * K[i2 + 2] + d3 * K[ib + 2];
      const tl = Math.hypot(tx, ty, tz) || 1;
      tx /= tl; ty /= tl; tz /= tl;
      if (r > 0) s += Math.hypot(x - px, y - py, z - pz);
      px = x; py = y; pz = z;
      // the normal carried from the ring before: what is left of it across this tangent
      const dot = nx * tx + ny * ty + nz * tz;
      nx -= dot * tx; ny -= dot * ty; nz -= dot * tz;
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl; ny /= nl; nz /= nl;
      const bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
      for (let j = 0; j < RAD; j++) {
        const a = (j / RAD) * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        const ox = ca * nx + sa * bx, oy = ca * ny + sa * by, oz = ca * nz + sa * bz;
        const o = (r * RAD + j) * 3;
        pos[o] = x + ox * CABLE_R; pos[o + 1] = y + oy * CABLE_R; pos[o + 2] = z + oz * CABLE_R;
        nor[o] = ox; nor[o + 1] = oy; nor[o + 2] = oz;
        along[r * RAD + j] = s;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.normal.needsUpdate = true;
    geo.attributes.aS.needsUpdate = true;
    return end;
  }
  return { mesh, uniforms, lay };
}

/* ───────────────────────────────────────────────────────────── the ranks */

const COLS = 7; // slots i ∈ [−COLS, COLS]: wider than plan.js's RANKS.half, so that the far rows still fill the frame
const ROWS = 22; // …and no deeper than they can be seen: past the twentieth row they have sunk into the dark
function buildRanks() {
  const ranks = new THREE.Group();
  ranks.name = "ranks";
  const hw = PHONE.w / 2;
  const hd = PHONE.d / 2;
  const outline = new THREE.Shape();
  outline.moveTo(-hw + PHONE.r, -hd);
  outline.lineTo(hw - PHONE.r, -hd);
  outline.absarc(hw - PHONE.r, -hd + PHONE.r, PHONE.r, -Math.PI / 2, 0, false);
  outline.lineTo(hw, hd - PHONE.r);
  outline.absarc(hw - PHONE.r, hd - PHONE.r, PHONE.r, 0, Math.PI / 2, false);
  outline.lineTo(-hw + PHONE.r, hd);
  outline.absarc(-hw + PHONE.r, hd - PHONE.r, PHONE.r, Math.PI / 2, Math.PI, false);
  outline.lineTo(-hw, -hd + PHONE.r);
  outline.absarc(-hw + PHONE.r, -hd + PHONE.r, PHONE.r, Math.PI, 1.5 * Math.PI, false);
  const slabGeo = plate(outline, PHONE.t, { bevel: 0.16, round: 2, curveSegments: 6 }).rotateX(-Math.PI / 2);
  const slots = [];
  const seeds = [];
  const rand = rng(1622);
  for (let j = 0; j < ROWS; j++)
    for (let i = -COLS; i <= COLS; i++) {
      if (i === 0 && j === 0) continue; // the system's own place
      slots.push(i, j);
      seeds.push(rand());
    }
  const instanced = (source) => {
    const g = new THREE.InstancedBufferGeometry();
    g.setIndex(source.index);
    g.setAttribute("position", source.attributes.position);
    g.setAttribute("normal", source.attributes.normal);
    g.setAttribute("aSlot", new THREE.InstancedBufferAttribute(new Float32Array(slots), 2));
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1));
    g.instanceCount = seeds.length;
    return g;
  };
  const uniforms = {
    uInk: { value: INK }, uSignal: { value: SIGNAL }, uRanks: { value: 0 }, uRecall: { value: 0 }, uTime: { value: 0 }, uFade: { value: 1 },
    uPitch: { value: new THREE.Vector2(RANKS.pitch[0], RANKS.pitch[1]) },
  };
  const f = (n) => n.toFixed(3);
  const HEAD = /* glsl */ `
    attribute vec2 aSlot; attribute float aSeed;
    uniform float uRanks, uRecall, uTime; uniform vec2 uPitch;
    varying vec3 vL; varying vec3 vNw; varying float vK; varying float vEmber;
    const float ROWS = ${f(ROWS)};
    vec3 slot() {
      float j = aSlot.y;
      float show = clamp((uRanks * (ROWS + 4.0) - j) / 4.0, 0.0, 1.0); //                 they come row after row, the nearest first
      float gone = clamp((uRecall * (ROWS + 5.0) - (ROWS - 1.0 - j)) / 5.0, 0.0, 1.0); // …and go dark from the far end toward us
      vK = show * (1.0 - smoothstep(7.0, ROWS - 4.0, j)); //                              the far rows sink into the dark
      vEmber = (1.0 - gone) * (0.9 + 0.1 * sin(uTime * 0.8 + aSeed * 6.2832));
      return vec3(aSlot.x * uPitch.x, (1.0 - show) * (1.0 - show) * 3.0, -j * uPitch.y);
    }`;
  const SD = /* glsl */ `
    float sdBox(vec2 p, vec2 h, float r) { vec2 q = abs(p) - (h - r); return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
    const vec2 HALF = vec2(${f(hw)}, ${f(hd)}); const float RADIUS = ${f(PHONE.r)};
    const vec2 BATT_C = vec2(${f(BATT.at[0])}, ${f(BATT.at[2])}); const vec2 BATT_H = vec2(${f(BATT.w / 2)}, ${f(BATT.d / 2)});`;
  const twins = new THREE.Mesh(
    instanced(slabGeo),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        ${HEAD}
        void main() {
          vL = position; vNw = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position + slot(), 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uSignal; uniform float uFade;
        varying vec3 vL; varying vec3 vNw; varying float vK; varying float vEmber;
        ${SD}
        void main() {
          float k = vK * uFade;
          if (k < 0.004) discard;
          vec3 n = normalize(vNw);
          float lam = clamp(dot(n, normalize(vec3(-0.5, 0.55, 0.67))), 0.0, 1.0);
          float back = smoothstep(0.75, 0.95, n.y);
          // a dark slab: its back darkest, its flanks a light fillet on the key's side, darker away from it
          vec3 col = uInk * mix(0.025 + 0.36 * lam * lam, 0.02 + 0.03 * lam, back);
          float sd = sdBox(vL.xz, HALF, RADIUS);
          float w = max(fwidth(sd), 1e-4);
          col += uInk * 0.5 * (1.0 - smoothstep(1.0 * w, 2.2 * w, abs(sd + 0.16))) * back * (1.0 - smoothstep(0.5, 1.3, w));
          // one round lens on its back, and no more
          float ring = abs(length(vL.xz - vec2(5.3, -1.9)) - 0.6);
          float wr = max(fwidth(ring), 1e-4);
          col += uInk * 0.2 * (1.0 - smoothstep(wr, 2.0 * wr, ring)) * back * (1.0 - smoothstep(0.2, 0.5, wr));
          // its battery: an ember with a heart, seen through the back
          vec2 d = vL.xz - BATT_C;
          float inside = 1.0 - smoothstep(-1.3, 0.1, sdBox(d, BATT_H, 0.5));
          vec2 e = d / vec2(3.3, 2.0);
          col += uSignal * (0.14 + 1.45 * exp(-dot(e, e))) * inside * vEmber * back;
          gl_FragColor = vec4(col * k, 1.0);
        }`,
    }),
  );
  twins.frustumCulled = false;
  // the light under each of them: what sits it on the floor, warm while its ember lives
  const under = new THREE.Mesh(
    instanced(new THREE.PlaneGeometry(PHONE.w + 7, PHONE.d + 7).rotateX(-Math.PI / 2).translate(0, 0.07, 0)),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        ${HEAD}
        void main() {
          vL = position; vNw = normal;
          vec3 o = slot();
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(o.x, 0.0, o.z), 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uSignal; uniform float uFade;
        varying vec3 vL; varying vec3 vNw; varying float vK; varying float vEmber;
        ${SD}
        void main() {
          float k = vK * uFade;
          if (k < 0.004) discard;
          float near = 1.0 - clamp(sdBox(vL.xz, HALF, RADIUS) / 3.5, 0.0, 1.0);
          float a = near * near;
          gl_FragColor = vec4((uInk * 0.075 + uSignal * 0.13 * vEmber) * (a * k), 1.0); // (no pow here: on this card pow(0.0, 2.2) washed the whole bench white)
        }`,
    }),
  );
  under.frustumCulled = false;
  under.renderOrder = 2;
  ranks.add(under, twins);
  return { ranks, uniforms };
}

/* ───────────────────────────────────────────────────────────── the room */

export function buildChambre() {
  const group = new THREE.Group();
  group.name = "chambre";
  const fx = {};
  const shellGlass = []; // every glass the room's X-ray drives…
  const shellLines = []; // …and every family of lines
  const at = (x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    group.add(o);
    return o;
  };

  /* ═════════════ 1 · THE FLOOR (a grid, nothing under it), THE WALLS (sheets of glass, their outline) ═════════════ */

  fx.floor = gridMaterial({ cell: 25, major: 4, reach: 230, centre: [-20, -20] });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2 * RX, Z1 - Z0).rotateX(-Math.PI / 2), fx.floor);
  floor.position.set(0, 0, (Z0 + Z1) / 2);
  floor.frustumCulled = false;
  group.add(floor);

  const room = makeSet();
  const wallGlass = glass(BRAND.ink, { base: 0, rim: 0.075, power: 3.6 });
  room.sheet(wallGlass, [-RX, 0, Z0], [-RX, 0, Z1], [-RX, CEIL, Z1], [-RX, CEIL, Z0]);
  room.sheet(wallGlass, [RX, 0, Z0], [RX, 0, Z1], [RX, CEIL, Z1], [RX, CEIL, Z0]);
  room.sheet(wallGlass, [-RX, 0, Z0], [RX, 0, Z0], [RX, CEIL, Z0], [-RX, CEIL, Z0]);
  room.run(room.L.fine, [[-RX, 0, Z1], [-RX, 0, Z0], [RX, 0, Z0], [RX, 0, Z1]]); // where the walls meet the floor
  room.run(room.L.faint, [[RX, 0, Z1], [-RX, 0, Z1]]);
  for (const x of [-RX, RX]) room.seg(room.L.fine, [x, 0, Z0], [x, CEIL, Z0]);
  for (const x of [-RX, RX]) room.seg(room.L.faint, [x, 0, Z1], [x, CEIL, Z1]);
  room.run(room.L.faint, [[-RX, CEIL, Z0], [RX, CEIL, Z0], [RX, CEIL, Z1], [-RX, CEIL, Z1]], true);
  room.run(room.L.faint, [[-RX, 9, Z1], [-RX, 9, Z0], [RX, 9, Z0], [RX, 9, Z1]]); // a skirting
  // a window in the +x wall, its curtain drawn: the night stays outside
  const WIN = { z0: -60, z1: 60, y0: 95, y1: 205 };
  room.run(room.L.fine, [[RX, WIN.y0, WIN.z0], [RX, WIN.y0, WIN.z1], [RX, WIN.y1, WIN.z1], [RX, WIN.y1, WIN.z0]], true);
  room.seg(room.L.faint, [RX, WIN.y0, 0], [RX, WIN.y1, 0]);
  for (let z = WIN.z0 - 12; z <= WIN.z1 + 12; z += 12) room.seg(room.L.faint, [RX - 4, WIN.y0 - 14, z], [RX - 4, WIN.y1 + 8, z]);
  room.build(group, null, shellGlass, shellLines);

  /* ═════════════ 2 · THE BED: a base, a mattress with no top face, a headboard ═════════════ */

  const bed = makeSet();
  const flank = glass(BRAND.ink, { base: 0, rim: 0.2, power: 2.4 });
  const [BX0, BX1, BZ0, BZ1] = [-BED.x, BED.x, BED.z0, BED.z1];
  const MAT = TOP - 22; // the mattress's underside
  const BASE0 = 15; // the base's
  bed.run(bed.L.strong, rrect(BX0, BX1, BZ0, BZ1, 7, TOP), true);
  bed.run(bed.L.faint, rrect(BX0, BX1, BZ0, BZ1, 7, TOP - 4), true); // its piping
  bed.run(bed.L.fine, rrect(BX0, BX1, BZ0, BZ1, 7, MAT), true);
  bed.run(bed.L.fine, rrect(BX0 + 2, BX1 - 2, BZ0 + 2, BZ1 - 2, 4, BASE0), true);
  for (const x of [BX0, BX1]) for (const z of [BZ0 + 7, BZ1 - 7]) bed.seg(bed.L.faint, [x, TOP, z], [x, BASE0, z]);
  for (const x of [BX0 + 7, BX1 - 7]) bed.seg(bed.L.faint, [x, TOP, BZ1], [x, BASE0, BZ1]);
  bed.sheet(flank, [BX0, BASE0, BZ0 + 7], [BX0, BASE0, BZ1 - 7], [BX0, TOP, BZ1 - 7], [BX0, TOP, BZ0 + 7]);
  bed.sheet(flank, [BX1, BASE0, BZ0 + 7], [BX1, BASE0, BZ1 - 7], [BX1, TOP, BZ1 - 7], [BX1, TOP, BZ0 + 7]);
  bed.sheet(flank, [BX0 + 7, BASE0, BZ1], [BX1 - 7, BASE0, BZ1], [BX1 - 7, TOP, BZ1], [BX0 + 7, TOP, BZ1]);
  for (const x of [BX0 + 8, BX1 - 8]) for (const z of [BZ0 + 8, BZ1 - 8]) bed.run(bed.L.fine, [[x - 2.5, BASE0, z], [x - 2, 0, z], [x + 2, 0, z], [x + 2.5, BASE0, z]]); // its feet
  bed.build(group, null, shellGlass, shellLines);
  const headboard = makeSet();
  const boardGlass = glass(BRAND.ink, { base: 0.004, rim: 0.3, power: 2.6, edge: 0.2, through: 0.2 });
  headboard.slab(boardGlass, BX0 - 6, BX1 + 6, 10, 108, Z0 + 1.5, BZ0 - 1.5, { r: 2.5, lines: "fine" });
  headboard.build(group, ORDER.head, shellGlass, shellLines);

  /* ═════════════ 3 · THE BEDSIDE TABLE, THE SOCKET and its charger ═════════════ */

  const [TX, , TZ] = TABLE.at;
  const [TW, TD] = [TABLE.w / 2, TABLE.d / 2];
  const table = makeSet();
  const tableGlass = glass(BRAND.ink, { base: 0.004, rim: 0.34, power: 2.4, edge: 0.2, through: 0.22 });
  table.slab(glass(BRAND.ink, { base: 0, rim: 0.14, power: 3.4, through: 0.2 }), TX - TW, TX + TW, TABLE.h - 3, TABLE.h, TZ - TD, TZ + TD, { r: 0.7, lines: "fine" }); // its top (no lip: a flat face seen at a grazing angle would be a grey slab)
  table.slab(tableGlass, TX - TW + 1.5, TX + TW - 1.5, 34, TABLE.h - 3, TZ - TD + 1.5, TZ + TD - 1.5, { r: 0.6, lines: "faint" }); // its drawer
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) table.slab(tableGlass, TX + sx * (TW - 3) - 1.4, TX + sx * (TW - 3) + 1.4, 0, 34, TZ + sz * (TD - 3) - 1.4, TZ + sz * (TD - 3) + 1.4, { r: 0.4 });
  table.run(table.L.fine, [[TX - 6, 46, TZ + TD - 1.4], [TX + 6, 46, TZ + TD - 1.4]]); // its handle
  table.build(group, ORDER.table, shellGlass, shellLines);

  const wallZ = Z0 + 0.3;
  const plateSet = makeSet();
  plateSet.run(plateSet.L.strong, rrect(SX - 5, SX + 5, -5, 5, 1.4, 0).map(([x, , z]) => [x, SY + z, wallZ]), true);
  plateSet.run(plateSet.L.fine, Array.from({ length: 24 }, (_, i) => [SX + 3.4 * Math.cos((i / 24) * 6.2832), SY + 3.4 * Math.sin((i / 24) * 6.2832), wallZ]), true);
  plateSet.build(group, null, shellGlass, shellLines);
  const fixtures = makePart("fixtures"); // solid: the charger in the socket
  group.add(fixtures);
  addMesh(fixtures, box(3.6, 3.6, 3.4, 0.6), solid(0xa9afb3, { rough: 0.5 }), { pos: [SX, SY, Z0 + 2.2], edgeOpacity: 0.5 });
  addMesh(fixtures, box(1.3, 1.3, 1.2, 0.3), solid(0x4a5157, { rough: 0.6 }), { pos: [SX, SY, Z0 + 4.2], edges: false });

  /* ═════════════ 4 · YOU: asleep on your right side, facing −x, knees drawn up ═════════════ */

  const { fig: you, head: youHead } = glassFigure({ order: ORDER.you, k: 1.22 });
  fx.youHead = youHead;
  you.group.name = "chambre-you";
  group.add(you.group);
  const trunk = you.torso.children[0];
  const PITCH = 13; // curled a little: the trunk leans forward from the hips
  // the figure's own frame: +y to its head, +z in front of it, +x its left. Lying: head toward −z, facing −x, its left side up
  you.group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(0, 1, 0), V(0, 0, -1), V(-1, 0, 0)));
  you.leg("L", V(9, 34, 10), V(0, 0, 1), V(0, -0.85, 0.5));
  you.leg("R", V(-8, 22, 3), V(0, 0, 1), V(0, -0.9, 0.4));
  const ARMS = {
    L: { t: V(-13, 121, 33), bend: V(0.3, -1, 0.1), dir: V(-0.2, 0.25, 1).normalize(), palm: V(-1, 0, 0) }, // the upper arm: fallen in front of your chest, the hand on the mattress
    R: { t: V(-13.5, 147, 30), bend: V(-0.2, -1, 0.2), dir: V(0, 0.75, 0.66).normalize(), palm: V(-1, 0, 0) }, // the lower one: the hand under the pillow's edge
  };
  const pose = (pitch) => {
    for (const side of ["L", "R"]) you.reach(side, ARMS[side].t, ARMS[side].bend, ARMS[side]);
    you.lean(pitch, 0, 0);
  };
  pose(PITCH);
  you.grip("L", 0.3);
  you.grip("R", 0.22);
  you.head.rotation.set(13 * DEG, 10 * DEG, 0); // the chin tucked, the face a little up
  const headAt = you.head.position.clone().applyMatrix4(you.torso.matrix).applyQuaternion(you.group.quaternion);
  you.group.position.set(YOU.head[0] - headAt.x, HEAD_Y - headAt.y, YOU.head[2] - headAt.z);
  you.group.updateMatrix();
  const world = (v) => v.clone().applyMatrix4(you.group.matrix);

  /* ═════════════ 5 · THE DUVET: laid on the bed and on you ═════════════ */

  const BASE = TOP + 1;
  const bodies = []; // what lies under it: [a, b, radius], in the room
  const lying = (a, b, r) => bodies.push([world(a), world(b), r]);
  const hips = V(0, you.HIP, 0);
  const shoulders = you.arms.L.sh.clone().add(you.arms.R.sh).multiplyScalar(0.5);
  lying(hips, hips.clone().lerp(shoulders, 0.55), 14.5);
  lying(hips.clone().lerp(shoulders, 0.55), shoulders, 16.5);
  for (const side of ["L", "R"]) {
    lying(you.legs[side].hip, you.legs[side].knee, 8.5);
    lying(you.legs[side].knee, you.legs[side].ankle, 6.5);
    lying(you.legs[side].ankle, you.legs[side].ankle.clone().add(V(0, -6, 9)), 5.5);
  }
  lying(you.arms.L.sh, you.arms.L.elbow, 5.5);
  lying(you.arms.L.elbow, you.arms.L.at, 4.8);
  const mound = (x, z) => {
    let m = 0;
    for (const [a, b, r] of bodies) {
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const t = clamp01(((x - a.x) * dx + (z - a.z) * dz) / Math.max(1e-6, dx * dx + dz * dz));
      const q = Math.hypot(x - a.x - dx * t, z - a.z - dz * t) / (r * 2.3);
      if (q < 1) m = Math.max(m, (a.y + (b.y - a.y) * t + r - BASE) * (1 - q * q) ** 2);
    }
    return m;
  };
  const DUVET = { x: BED.x + 9, z0: world(shoulders).z + 9, z1: BED.z1 + 8, nx: 64, nz: 72 };
  const chest = world(hips.clone().lerp(shoulders, 0.7));
  const duvetGeo = (() => {
    const pos = [];
    const flat = [];
    const heap = [];
    const breath = [];
    const border = [];
    const index = [];
    for (let j = 0; j <= DUVET.nz; j++)
      for (let i = 0; i <= DUVET.nx; i++) {
        const x = mix(-DUVET.x, DUVET.x, i / DUVET.nx);
        const z = mix(DUVET.z0, DUVET.z1, j / DUVET.nz);
        const over = Math.max(smooth(BED.x - 3, BED.x + 9, Math.abs(x)), smooth(BED.z1 - 3, BED.z1 + 8, z)); // past the mattress it hangs
        const m = mound(x, z) * (1 - over);
        const y0 = BASE - 9 * over;
        pos.push(x, y0 + m, z);
        flat.push(x, y0, z);
        heap.push(m);
        breath.push(Math.exp(-((x - chest.x) ** 2 + (z - chest.z) ** 2) / (26 * 26)) * (m > 1 ? 1 : 0));
        border.push(Math.min(DUVET.x - Math.abs(x), z - DUVET.z0, DUVET.z1 - z));
      }
    for (let j = 0; j < DUVET.nz; j++)
      for (let i = 0; i < DUVET.nx; i++) {
        const a = j * (DUVET.nx + 1) + i;
        index.push(a, a + DUVET.nx + 1, a + 1, a + 1, a + DUVET.nx + 1, a + DUVET.nx + 2);
      }
    const normalsOf = (array) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(array, 3));
      g.setIndex(index);
      g.computeVertexNormals();
      return g;
    };
    const g = normalsOf(pos);
    g.setAttribute("aFlat", normalsOf(flat).attributes.normal);
    g.setAttribute("aMound", new THREE.Float32BufferAttribute(heap, 1));
    g.setAttribute("aChest", new THREE.Float32BufferAttribute(breath, 1));
    g.setAttribute("aBorder", new THREE.Float32BufferAttribute(border, 1));
    return g;
  })();
  fx.duvet = duvetMaterial();
  const duvet = new THREE.Mesh(duvetGeo, fx.duvet);
  duvet.frustumCulled = false;
  group.add(duvet);
  asShell(duvet, ORDER.duvet);

  /* ═════════════ 6 · THE PILLOW, and the heat it holds ═════════════ */

  const bendU = { uTheta: { value: 0 }, uHinge: { value: new THREE.Vector2(...HINGE.at) }, uDir: { value: new THREE.Vector2(...HINGE.dir) } };
  const pillow = new THREE.Group();
  pillow.position.set(...PILLOW.at);
  group.add(pillow);
  fx.pillow = pillowMaterial(bendU);
  const pillowMesh = new THREE.Mesh(pillowGeometry([1, -1]), fx.pillow);
  pillowMesh.frustumCulled = false;
  pillow.add(pillowMesh);
  asShell(pillowMesh, ORDER.pillow);
  fx.roof = roofMaterial(bendU);
  const roof = new THREE.Mesh(pillowGeometry([-1]), fx.roof);
  roof.frustumCulled = false;
  roof.renderOrder = 6; // before every shell: it shows through the pillow
  pillow.add(roof);
  fx.spill = spillMaterial();
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(73, 44).rotateX(-Math.PI / 2).translate(-14.5, 0, 0), fx.spill);
  spill.position.set(SPOTS[0][0], TOP + 0.3, SPOTS[0][2]);
  spill.frustumCulled = false;
  spill.renderOrder = 5;
  group.add(spill);
  fx.halo = haloMaterial();
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), fx.halo);
  halo.scale.set(34, 12, 22);
  halo.position.set(SPOTS[0][0] - 8, TOP + 3, SPOTS[0][2]); // at the mouth of the vault
  halo.frustumCulled = false;
  halo.renderOrder = 5;
  group.add(halo);
  const heat = makeHeat();
  const heatAt = new THREE.Group(); // where the phone lies
  heatAt.add(heat.points);
  group.add(heatAt);

  /* ═════════════ 7 · THE CABLE, its plug; THE WAY to the bare floor ═════════════ */

  const cable = makeCable();
  group.add(cable.mesh);
  const plug = makePart("plug");
  group.add(plug);
  addMesh(plug, box(1.9, 0.62, 1.15, 0.2), solid(0xb9bec1, { rough: 0.45, metal: 0.3 }), { pos: [0.1, 0, 0], edgeOpacity: 0.5 });
  const wayPts = [];
  const [AX, , AZ] = SPOTS[2];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    wayPts.push([mix(TX + 4, AX, u) + 26 * Math.sin(Math.PI * u), 0.5, mix(TZ + TD + 8, AZ - 20, u)]);
  }
  fx.way = lineMat(BRAND.veille, 2.6, { opacity: 0, dashed: true, dashSize: 9, gapSize: 7, hdr: 1.5 });
  fx.way.worldUnits = true;
  const way = fatLine(wayPts, { dashed: true });
  const spotRing = fatLine(Array.from({ length: 49 }, (_, i) => [AX + 20 * Math.cos((i / 48) * 6.2832), 0.5, AZ + 20 * Math.sin((i / 48) * 6.2832)]), { dashed: true });
  for (const line of [way, spotRing]) {
    line.material = fx.way;
    line.frustumCulled = false;
    group.add(line);
  }

  /* ═════════════ the ranks, the anchors ═════════════ */

  const { ranks, uniforms: rankU } = buildRanks();
  const pocket = { x: SPOTS[0][0] - 9, z: SPOTS[0][2] };
  const anchors = {
    pillow: at(PILLOW.at[0], PILLOW.at[1] + PILLOW.t / 2, PILLOW.at[2]), // the top of the pillow (where it lies)
    pocket: at(pocket.x, TOP + 3.2, pocket.z), //                          the heat held under it: the mouth of the vault
    head: at(YOU.head[0], HEAD_Y + 11, YOU.head[2]), //                    above your head
    socket: at(SX, SY, Z0 + 4),
    table: at(TX, TABLE.h, TZ), //                                         the top of the bedside table
  };

  /* ═════════════ every frame ═════════════ */

  const shellBase = shellLines.map((mat) => mat.opacity);
  const spot = [0, 0, 0];

  function update(s, time, px) {
    const inRoom = s.room > 0.5;
    const fade = clamp01(s.fade);
    ranks.visible = !inRoom && s.ranks > 0.004 && fade > 0.004;
    if (ranks.visible) {
      rankU.uRanks.value = clamp01(s.ranks);
      rankU.uRecall.value = clamp01(s.recall);
      rankU.uTime.value = time;
      rankU.uFade.value = fade;
    }
    group.visible = inRoom && fade > 0.004;
    if (!group.visible) return;

    // the X-ray of the room: glass, lines, grid; the duvet is the bed's
    const shell = clamp01(s.shell) * fade;
    for (let i = 0; i < shellGlass.length; i++) shellGlass[i].uniforms.uAmount.value = shell;
    for (let i = 0; i < shellLines.length; i++) shellLines[i].opacity = shellBase[i] * shell;
    fx.floor.uniforms.uAmount.value = 0.2 * shell;
    setPartOpacity(fixtures, shell);
    const here = clamp01(s.you);
    const breath = Math.sin(time * 1.45); // a breath every four seconds and a bit
    fx.duvet.uniforms.uAmount.value = shell;
    fx.duvet.uniforms.uYou.value = here;
    fx.duvet.uniforms.uBreath.value = 1.3 * (0.5 + 0.5 * breath);
    duvet.visible = shell > 0.004;

    // you
    you.group.visible = here * fade > 0.01;
    if (you.group.visible) {
      you.body.uniforms.uAmount.value = here * fade;
      fx.youHead.uniforms.uAmount.value = here * fade;
      trunk.scale.z = 0.62 * (1 + 0.035 * breath);
      pose(PITCH + 0.3 * breath);
    }

    // the pillow: a body or an outline; its camera-side corner folded up
    const lifted = smooth(0, 1, clamp01(s.pillow));
    fx.pillow.uniforms.uAmount.value = fade;
    fx.pillow.uniforms.uCloth.value = clamp01(s.cloth);
    bendU.uTheta.value = HINGE.angle * lifted;

    // the heat: held while the pillow lies on the phone, free as soon as it is lifted or the phone is out
    const place = Math.min(2, Math.max(0, s.place));
    const held = (1 - smooth(0.04, 0.45, s.pillow)) * (1 - smooth(0.1, 0.5, place));
    const trapped = clamp01(s.trapped);
    const pocketK = held * clamp01(0.7 * s.heat + 0.75 * trapped) * fade * (0.96 + 0.04 * Math.sin(time * 0.9));
    fx.roof.uniforms.uAmount.value = Math.min(pocketK, 0.8);
    roof.visible = pocketK > 0.004;
    fx.spill.uniforms.uAmount.value = 0.8 * pocketK;
    spill.visible = pocketK > 0.004;
    fx.halo.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(0.85 * Math.min(pocketK, 0.7));
    halo.visible = pocketK > 0.004;
    phoneSpot(place, spot);
    heatAt.position.set(spot[0], spot[1], spot[2]);
    heat.uniforms.uTime.value = time;
    heat.uniforms.uScale.value = px;
    heat.uniforms.uFree.value = 1 - held;
    heat.uniforms.uAmount.value = trapped * mix(0.5, 1, held) * fade;
    heat.points.visible = trapped * fade > 0.004;

    // the cable: its end follows the phone while it is plugged in (unplugged, it stays on the table); its dashes run with the charge
    const plugged = clamp01(s.plug);
    const end = cable.lay(Math.min(place, 1) + (place - Math.min(place, 1)) * plugged, 4.5 * (1 - plugged));
    plug.position.copy(end);
    setPartOpacity(plug, fade);
    const live = clamp01(s.charge) * smooth(0.6, 1, plugged);
    cable.uniforms.uAlpha.value = fade;
    cable.uniforms.uFlow.value = time * DASH.speed;
    cable.uniforms.uLive.value = live;
    cable.uniforms.uStill.value = 1 - live;

    // the way to the bare floor, as the phone leaves the table
    fx.way.opacity = 0.9 * smooth(1.02, 1.3, place) * fade;
    way.visible = spotRing.visible = fx.way.opacity > 0.004;
  }

  return { group, ranks, anchors, update, fx, you };
}
