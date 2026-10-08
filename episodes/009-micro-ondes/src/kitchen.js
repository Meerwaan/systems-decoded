// DOSSIER 009 — Micro-ondes : the kitchen, seen like an X-ray — and you, your face at the glass.
//
// A column unit of glass with the niche the oven is built into (left free: the oven is model.js, the
// waves are waves.js), the worktop running toward +x with its sink, its hob and its hood, wall units,
// a tiled splashback drawn in faint lines, a floor that is only a grid. Nothing solid: the kitchen
// steps back so that the oven is all the eye finds.
// And two people of glass. YOU: a real head — brow, nose, chin, ears, two eyes in their sockets — bent
// toward the door, ten centimetres from it; a hand that goes to the handle, closes on it, follows it as
// the door swings while you straighten out of its way. And the forearm of someone else, out of frame:
// the researchers' test, a hand reaching into the open cavity until its fingertips glow.
//
//   buildKitchen() → { group, A, fx, update(p, time, px) }      p = { shell, you, near, pull, open, eyes, hand, pain }
//   buildKitchen({ hob: false, floorAt: [x, z] }): the same kitchen without its glass hob — another film brings its own
//   (012, the gas hob) — and the floor's grid centred where that film stands.
//
// Shell orders (see `asShell`): you 10, the test arm 12, the kitchen 24 — the oven's own glass belongs
// in between (20): what is inside is drawn first.
import * as THREE from "three";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glass, asShell, box, cyl, placed, anchor, mergeGeometries } from "@kit/build3d.js";
import { COLUMN, WORKTOP, OVEN, DOOR, HINGE, HANDLE, YOU } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const ORDER = { you: 10, test: 12, room: 24 };
const T = 1.8; // a panel of the units
const PLINTH = 10;
const SWING = 100 * DEG; // the door wide open
/** The bar of the handle as model.js builds it, door closed: its axis (x, z), how thick the hand finds it (a bar of 1.5 × 1.25), where the hand takes it. */
const BAR = { x: HANDLE.x, z: DOOR.home[2] + OVEN.doorThick / 2 + HANDLE.out - 0.62, r: 0.8, y: HANDLE.y0 + 5.5 };

/* ───────────────────────────────────────────────────────────── materials of our own */

/**
 * Lines in screen pixels (the instanced quads of LineSegments2) that know how far they are: full
 * strength on the near side of the kitchen, down to `far` on its far side. What is far steps back.
 */
function lineMaterial({ color = BRAND.ink, width = 2, far = 0.3, reach = 240, centre = [40, 140, 30] } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uWidth: { value: width }, uRes: { value: RES }, uAmount: { value: 1 },
      uFar: { value: far }, uCentre: { value: V(...centre) }, uReach: { value: reach },
    },
    vertexShader: /* glsl */ `
      uniform float uWidth, uReach; uniform vec2 uRes; uniform vec3 uCentre;
      attribute vec3 instanceStart; attribute vec3 instanceEnd;
      varying vec2 vUv; varying float vDepth;
      // an end behind the eye is brought back in front of it (as LineMaterial does), or the quad turns inside out
      void trim(const in vec4 start, inout vec4 end) {
        float a = projectionMatrix[2][2];
        float b = projectionMatrix[3][2];
        float nearEstimate = -0.5 * b / a;
        float alpha = (nearEstimate - start.z) / (end.z - start.z);
        end.xyz = mix(start.xyz, end.xyz, alpha);
      }
      void main() {
        vUv = uv;
        vec4 start = modelViewMatrix * vec4(instanceStart, 1.0);
        vec4 end = modelViewMatrix * vec4(instanceEnd, 1.0);
        if (start.z < 0.0 && end.z >= 0.0) trim(start, end);
        else if (end.z < 0.0 && start.z >= 0.0) trim(end, start);
        vec4 clipStart = projectionMatrix * start;
        vec4 clipEnd = projectionMatrix * end;
        float aspect = uRes.x / uRes.y;
        vec2 dir = clipEnd.xy / (abs(clipEnd.w) > 1e-6 ? clipEnd.w : 1e-6) - clipStart.xy / (abs(clipStart.w) > 1e-6 ? clipStart.w : 1e-6);
        dir.x *= aspect;
        float len = length(dir);
        dir = len > 1e-7 ? dir / len : vec2(1.0, 0.0); // a segment seen end-on has no direction: never divide by its length
        vec2 offset = vec2(dir.y, -dir.x);
        dir.x /= aspect;
        offset.x /= aspect;
        if (position.x < 0.0) offset *= -1.0;
        if (position.y < 0.0) offset -= dir; else if (position.y > 1.0) offset += dir;
        vec4 clip = position.y < 0.5 ? clipStart : clipEnd;
        clip.xy += offset * (uWidth / uRes.y) * clip.w;
        gl_Position = clip;
        float z = position.y < 0.5 ? start.z : end.z;
        vDepth = ((viewMatrix * modelMatrix * vec4(uCentre, 1.0)).z - z) / uReach;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uFar;
      varying vec2 vUv; varying float vDepth;
      void main() {
        if (uAmount < 0.003) discard;
        if (abs(vUv.y) > 1.0) { // round ends
          float b = abs(vUv.y) - 1.0;
          if (vUv.x * vUv.x + b * b > 1.0) discard;
        }
        float k = clamp(0.5 + 0.5 * vDepth, 0.0, 1.0);
        gl_FragColor = vec4(uColor, uAmount * mix(1.0, uFar, k * k * (3.0 - 2.0 * k)));
      }`,
  });
}

/**
 * `glass()` of the kit (same uniforms: `asShell` makes its other layers out of it) that can also
 *   · take heat: around two points of the world (`uHeatA`, `uHeatB`, within `uHeatR` cm) the glass
 *     turns signal and lights up, even where it faces the eye — `uHeat` 0 → 1. A light that has a
 *     place: your eyes, the fingertips of the test;
 *   · come out of the dark: `uFade` (z0, z1) — full on the oven's side of z0, gone beyond z1.
 */
function warm(options) {
  const mat = glass(BRAND.ink, options);
  Object.assign(mat.uniforms, {
    uHeat: { value: 0 }, uHeatR: { value: 6 }, uHeatA: { value: V(0, -1e4, 0) }, uHeatB: { value: V(0, -1e4, 0) },
    uHot: { value: SIGNAL.clone().multiplyScalar(1.25) }, uFade: { value: new THREE.Vector2(1e5, 2e5) },
  });
  mat.vertexShader = mat.vertexShader
    .replace("varying vec3 vV;", "varying vec3 vV; varying vec3 vW;")
    .replace("gl_Position =", "vW = (modelMatrix * vec4(position, 1.0)).xyz;\n        gl_Position =");
  mat.fragmentShader = mat.fragmentShader
    .replace("varying vec3 vV;", "varying vec3 vV; varying vec3 vW; uniform float uHeat, uHeatR; uniform vec3 uHeatA, uHeatB, uHot; uniform vec2 uFade;")
    .replace("if (uAmount < 0.003) discard;", "float fade = 1.0 - smoothstep(uFade.x, uFade.y, vW.z);\n        if (uAmount * fade < 0.003) discard;")
    .replace(
      "gl_FragColor = vec4(uColor * light * uAmount * uGain, 1.0);",
      /* glsl */ `vec3 da = vW - uHeatA; vec3 db = vW - uHeatB;
        float r2 = max(uHeatR * uHeatR, 1e-4);
        float w = clamp(uHeat * max(exp(-dot(da, da) / r2), exp(-dot(db, db) / r2)), 0.0, 1.0);
        vec3 c = uColor * light * (1.0 - w) + uHot * w * (0.12 + 0.7 * pow(g, 1.4) + 0.5 * light);
        gl_FragColor = vec4(c * uAmount * uGain * fade, 1.0);`,
    );
  if (!mat.vertexShader.includes("vW =") || !mat.fragmentShader.includes("uHot * w") || !mat.fragmentShader.includes("float fade")) throw new Error("kitchen.js: the kit's glass shader changed — warm() no longer fits it");
  return mat;
}

/** A light that has a place, as a ball in the world (no point sprite: its size is in centimetres, whatever the lens): a bright core and a long tail. */
function orbMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        float n = 1.0 - sqrt(clamp(1.0 - f * f, 0.0, 1.0)); // 1 at the centre of the disc, 0 on its rim (clamped before sqrt and pow)
        gl_FragColor = vec4(uColor * (0.78 * pow(n, 6.0) + 0.22 * n * n), 1.0);
      }`,
  });
}
const ORB = new THREE.SphereGeometry(1, 28, 18);

/** The floor: no slab, the joints of its tiles — never thinner than a pixel and a half, they spread instead — and a faint pool of light where you stand. */
function makeFloor(centre) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 }, uCell: { value: 30 }, uCentre: { value: new THREE.Vector2(...centre) }, uFade: { value: 170 }, uPool: { value: 0.035 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vP = w.xz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uCell, uFade, uPool; uniform vec2 uCentre; varying vec2 vP;
      float band(float q, float t) {
        float w = max(fwidth(q) * 1.5, t);
        float d = abs(fract(q - 0.5) - 0.5);
        return (t / w) * (1.0 - smoothstep(0.0, w, d));
      }
      void main() {
        if (uAmount < 0.003) discard;
        float g = max(band(vP.x / uCell, 0.012), band(vP.y / uCell, 0.012));
        float r = length(vP - uCentre);
        float pool = pow(clamp(1.0 - r / 240.0, 0.0, 1.0), 2.4);
        gl_FragColor = vec4(uColor * (g * 0.34 * exp(-r / uFade) + pool * uPool) * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(760, 520).rotateX(-Math.PI / 2).translate(-80, 0, 260), mat);
  mesh.renderOrder = 1;
  return mesh;
}

/* ───────────────────────────────────────────────────────────── a head */

// Seen from its own centre (the kit's ball of 10.4 cm, the face toward +z): a few ellipsoids —
// centre, radii, how softly each joins what is already there — and two sockets dug for the eyes.
const SKULL = [
  { c: [0, 2.2, -1.5], r: [7.6, 8.5, 9.7] }, // the cranium
  { c: [0, -3.8, 2.0], r: [6.5, 7.4, 6.5], k: 1.8 }, // the face, down to the jaw
  { c: [0, -9.0, 4.6], r: [2.8, 2.1, 2.3], k: 2.2 }, // the chin
  { c: [0, 2.6, 6.3], r: [5.9, 1.4, 2.4], k: 1.0 }, // the brow
  { c: [4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 }, // the cheekbones
  { c: [-4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 },
  { c: [0, 0.2, 7.3], r: [0.95, 3.0, 1.55], k: 0.8 }, // the bridge of the nose
  { c: [0, -2.7, 8.1], r: [1.3, 1.35, 2.3], k: 1.0 }, // its tip: 10.4 cm in front of the centre
  { c: [0, -6.5, 6.5], r: [2.6, 1.1, 1.7], k: 1.8 }, // the lips: barely
  { c: [7.4, -0.6, -1.3], r: [1.0, 2.9, 1.9], k: 0.5 }, // the ears
  { c: [-7.4, -0.6, -1.3], r: [1.0, 2.9, 1.9], k: 0.5 },
];
// (a large ball that barely bites: a hollow with gentle sides — a small one digs a pit whose rim lights up, and the face wears goggles)
const SOCKETS = [{ c: [4.0, 0.3, 11.5], r: 4.5 }, { c: [-4.0, 0.3, 11.5], r: 4.5 }];
// the eyeballs sit inside the glass, seen through it like eyes under their lids (flush with the face, in profile, they are two balls stuck on it)
const EYES = [[3.1, 0.45, 5.1], [-3.1, 0.45, 5.1]];
/** Where a look leaves the face and the light lands on it: the front of an eye, on the surface of the head. */
const GAZE = { y: 0.45, z: 7.15 };

function headGeometry() {
  // where a ray from the centre along `d` leaves an ellipsoid (0: it misses it)
  const far = (d, c, r) => {
    const ax = d.x / r[0], ay = d.y / r[1], az = d.z / r[2];
    const bx = c[0] / r[0], by = c[1] / r[1], bz = c[2] / r[2];
    const A = ax * ax + ay * ay + az * az;
    const B = ax * bx + ay * by + az * bz;
    const disc = B * B - A * (bx * bx + by * by + bz * bz - 1);
    return disc > 0 ? Math.max(0, (B + Math.sqrt(disc)) / A) : 0;
  };
  const smax = (a, b, k) => {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.max(a, b) + h * h * k * 0.25;
  };
  const ico = new THREE.IcosahedronGeometry(1, 32);
  ico.deleteAttribute("uv");
  ico.deleteAttribute("normal");
  const g = mergeVertices(ico, 1e-5);
  const at = g.attributes.position;
  const d = V();
  for (let i = 0; i < at.count; i++) {
    d.fromBufferAttribute(at, i).normalize();
    let r = far(d, SKULL[0].c, SKULL[0].r);
    for (let j = 1; j < SKULL.length; j++) r = smax(r, far(d, SKULL[j].c, SKULL[j].r), SKULL[j].k);
    for (const s of SOCKETS) {
      // where the ray enters the ball that digs the socket: the surface steps back to there, softly
      const B = d.x * s.c[0] + d.y * s.c[1] + d.z * s.c[2];
      const disc = B * B - (s.c[0] * s.c[0] + s.c[1] * s.c[1] + s.c[2] * s.c[2] - s.r * s.r);
      if (disc <= 0 || B <= 0) continue; // (B < 0: the ray leaves by the back of the head, the ball is behind it — its roots are negative, and a negative radius throws the vertex out through the face)
      const near = B - Math.sqrt(disc);
      const h = Math.max(1.4 - Math.abs(r - near), 0) / 1.4;
      r = Math.min(r, near) - h * h * 1.4 * 0.25;
    }
    at.setXYZ(i, d.x * r, d.y * r, d.z * r);
  }
  g.computeVertexNormals();
  return g;
}

/* ───────────────────────────────────────────────────────────── small makers */

/** Position and normal only, not indexed: what every piece is reduced to before the pieces of one material are merged. */
function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  return o;
}

/* ───────────────────────────────────────────────────────────── the kitchen */

export function buildKitchen({ hob = true, floorAt = [YOU.x, YOU.z + 20] } = {}) {
  const group = new THREE.Group();
  const A = {};
  const fx = {};
  const room = new THREE.Group(); // everything of the kitchen itself
  group.add(room);

  /* ── collectors: every piece is baked where it stands; one mesh per material, one mesh per family of lines ── */
  const L = { strong: [], fine: [], faint: [] };
  const buckets = new Map();
  const put = (material, ...geometries) => {
    if (!buckets.has(material)) buckets.set(material, []);
    for (const g of geometries.flat()) buckets.get(material).push(bare(g));
  };
  const seg = (list, a, b) => list.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const run = (list, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) seg(list, pts[i], pts[i + 1]);
    if (closed) seg(list, pts.at(-1), pts[0]);
  };
  const edgesInto = (list, geometry) => {
    const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, 28).attributes.position;
    for (let i = 0; i < e.count; i += 2) seg(list, [e.getX(i), e.getY(i), e.getZ(i)], [e.getX(i + 1), e.getY(i + 1), e.getZ(i + 1)]);
  };
  const piece = (material, geometry, { pos, rotX, rotY, rotZ, lines = false } = {}) => {
    const g = placed(geometry, { pos, rotX, rotY, rotZ });
    if (lines) edgesInto(L[lines], g);
    put(material, g);
    return g;
  };
  /** A board between two corners; `lines`: its own edges drawn in that family. */
  const slab = (material, xa, xb, ya, yb, za, zb, { r = 0.25, lines = false } = {}) =>
    piece(material, box(xb - xa, yb - ya, zb - za, r), { pos: [(xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2], lines });
  /** The twelve edges of a cabinet. */
  const frame = (list, xa, xb, ya, yb, za, zb) => {
    for (const y of [ya, yb]) run(list, [[xa, y, za], [xb, y, za], [xb, y, zb], [xa, y, zb]], true);
    for (const [x, z] of [[xa, za], [xb, za], [xb, zb], [xa, zb]]) seg(list, [x, ya, z], [x, yb, z]);
  };
  const ring = (list, cx, y, cz, r, n = 40) => run(list, Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 6.2832), y, cz + r * Math.sin((i / n) * 6.2832)]), true);

  /* ── glass. Linear values: 0.06 is already a quarter of the way to white. Flat boards: almost nothing
     where they face the eye (a veil over the oven otherwise), a lip on their edges, no softbox (a whole door would flash) ── */
  fx.carcass = glass(BRAND.ink, { base: 0.003, rim: 0.2, power: 2.4, edge: 0.3, through: 0.22 });
  fx.front = glass(BRAND.ink, { base: 0.005, rim: 0.13, power: 2.2, edge: 0.24, through: 0.25 });
  // whatever lies flat (the worktop, a shelf, the hob): seen at a grazing angle a board of glass is a grey slab across the picture — its lines draw it, not its light
  fx.flat = glass(BRAND.ink, { base: 0.004, rim: 0.03, power: 2.6, edge: 0, through: 0.2 });
  fx.trim = glass(BRAND.ink, { base: 0.004, rim: 0.3, power: 2.6, edge: 0.5, spec: 0.7, through: 0.2 }); // what is round and small: the tap
  fx.bowl = glass(BRAND.ink, { base: 0.003, rim: 0.1, power: 2.4, edge: 0.16, spec: 0.2, through: 0.2 }); // the sink
  const glasses = [fx.carcass, fx.front, fx.flat, fx.trim, fx.bowl];

  /* ═════════════ 1 · THE COLUMN ═════════════ */

  const { x0: CX0, x1: CX1, z1: CZ1, top: CTOP } = COLUMN;
  const N0 = OVEN.y0 - 0.6; // the niche: the oven, and a breath around it
  const N1 = OVEN.y1 + 0.6;
  const CZ = CZ1 - 2; // the carcass stops behind its fronts
  // its two sides — open at the height of the niche: seen in profile, no board of glass lies over the oven
  for (const [xa, xb] of [[CX0, CX0 + T], [CX1 - T, CX1]]) {
    slab(fx.carcass, xa, xb, PLINTH, N0 - T, 0, CZ);
    slab(fx.carcass, xa, xb, N1 + T, CTOP, 0, CZ);
  }
  for (const y of [PLINTH, N0 - T, N1, CTOP - T]) slab(fx.flat, CX0 + T, CX1 - T, y, y + T, 0, CZ); // floor, the shelf under the oven, the one over it, top
  // fronts without handles (nothing here competes with the oven's own): two doors under the niche, one above
  const DOORS = [[PLINTH + 0.6, 76], [76.6, N0 - T - 0.3], [N1 + T + 0.3, CTOP - 0.3]];
  for (const [ya, yb] of DOORS) {
    slab(fx.front, CX0 + 0.3, CX1 - 0.3, ya, yb, CZ1 - 1.9, CZ1, { r: 0.35 });
    run(L.fine, [[CX0 + 0.3, ya, CZ1], [CX1 - 0.3, ya, CZ1], [CX1 - 0.3, yb, CZ1], [CX0 + 0.3, yb, CZ1]], true);
    seg(L.faint, [CX0 + 3, yb - 2.6, CZ1], [CX1 - 3, yb - 2.6, CZ1]); // the groove a hand opens it by
  }
  slab(fx.front, CX0, CX1, 0, PLINTH - 0.4, CZ1 - 6.6, CZ1 - 5, { lines: "faint" });
  frame(L.strong, CX0, CX1, PLINTH, CTOP, 0, CZ1);
  run(L.fine, [[CX0 + T, N0, CZ1], [CX1 - T, N0, CZ1], [CX1 - T, N1, CZ1], [CX0 + T, N1, CZ1]], true); // the mouth of the niche
  for (const y of [N0, N1]) for (const x of [CX0 + T, CX1 - T]) seg(L.faint, [x, y, CZ1], [x, y, OVEN.z0 - 4]); // and how deep it goes
  A.columnTop = anchor(group, 0, CTOP, CZ1);

  /* ═════════════ 2 · THE RUN: base units, the worktop, the sink, the hob ═════════════ */

  const W = WORKTOP;
  const BZ = W.depth - 4; // the plane of the fronts: the worktop overhangs them
  const BY = W.y - W.thick; // the top of the base units
  const BAYS = [W.x0, 91, 151, 211, W.x1];
  for (const x of [W.x0 + T / 2, 91, 151, 211, W.x1 - T / 2]) slab(fx.carcass, x - T / 2, x + T / 2, PLINTH, BY, 0, BZ - 2);
  slab(fx.flat, W.x0 + T, W.x1 - T, PLINTH, PLINTH + T, 0, BZ - 2);
  slab(fx.front, W.x0, W.x1, 0, PLINTH - 0.4, BZ - 7.6, BZ - 6, { lines: "faint" });
  slab(fx.flat, W.x0, W.x1 + 2, BY, W.y, 0, W.depth, { r: 0.5, lines: "strong" });
  // fronts: three drawers · the two doors under the sink · two deep drawers under the hob · one door
  const FRONTS = [
    [BAYS[0], BAYS[1], [[PLINTH + 0.6, 40], [40.6, 70], [70.6, BY - 0.6]]],
    [BAYS[1], 121, [[PLINTH + 0.6, BY - 0.6]]],
    [121, BAYS[2], [[PLINTH + 0.6, BY - 0.6]]],
    [BAYS[2], BAYS[3], [[PLINTH + 0.6, 48], [48.6, BY - 0.6]]],
    [BAYS[3], BAYS[4], [[PLINTH + 0.6, BY - 0.6]]],
  ];
  for (const [xa, xb, rows] of FRONTS)
    for (const [ya, yb] of rows) {
      slab(fx.front, xa + 0.3, xb - 0.3, ya, yb, BZ - 1.9, BZ, { r: 0.35 });
      run(L.fine, [[xa + 0.3, ya, BZ], [xb - 0.3, ya, BZ], [xb - 0.3, yb, BZ], [xa + 0.3, yb, BZ]], true);
      seg(L.faint, [xa + 3, yb - 2.6, BZ], [xb - 3, yb - 2.6, BZ]);
    }
  run(L.fine, [[W.x1, PLINTH, 0], [W.x1, PLINTH, BZ], [W.x1, BY, BZ]]); // the end of the run
  A.worktop = anchor(group, 110, W.y, W.depth - 8);

  // the sink: a bowl sunk in the worktop, a swan-neck tap behind it
  const SINK = { x: 121, z: 32, w: 46, d: 36 };
  piece(fx.bowl, box(SINK.w, 18, SINK.d, 3.4), { pos: [SINK.x, W.y - 9.2, SINK.z] });
  {
    const rim = [];
    const rr = 3.4;
    for (const [sx, sz, a0] of [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]])
      for (let i = 0; i <= 6; i++) {
        const a = (a0 + i * 15) * DEG;
        rim.push([SINK.x + sx * (SINK.w / 2 - rr) + rr * Math.cos(a), W.y + 0.1, SINK.z + sz * (SINK.d / 2 - rr) + rr * Math.sin(a)]);
      }
    run(L.fine, rim, true);
    ring(L.faint, SINK.x, W.y - 17.9, SINK.z, 2.6, 20); // the drain
    const neck = new THREE.CatmullRomCurve3([V(SINK.x, W.y, 7), V(SINK.x, W.y + 20, 7), V(SINK.x, W.y + 29, 9.5), V(SINK.x, W.y + 33, 15.5), V(SINK.x, W.y + 30, 21.5), V(SINK.x, W.y + 24, 23.5)], false, "centripetal");
    put(fx.trim, new THREE.TubeGeometry(neck, 44, 1.15, 14, false));
    piece(fx.trim, cyl(2.5, 3.4, 0.4, 32), { pos: [SINK.x, W.y + 1.7, 7], lines: "fine" });
    piece(fx.trim, box(1.4, 1.4, 9, 0.5), { pos: [SINK.x + 3.4, W.y + 4.6, 10.5], rotX: 0.5 }); // its lever
  }

  // the hob: a plate of glass on the worktop, four rings
  const HOB = { x: 181, z: 31, w: 58, d: 50 };
  if (hob) slab(fx.flat, HOB.x - HOB.w / 2, HOB.x + HOB.w / 2, W.y, W.y + 0.8, HOB.z - HOB.d / 2, HOB.z + HOB.d / 2, { r: 0.3, lines: "fine" });
  for (const [dx, dz, r] of hob ? [[-14, 12, 9.5], [14, 12, 7], [-14, -12, 7], [14, -12, 10.5]] : []) {
    ring(L.fine, HOB.x + dx, W.y + 0.9, HOB.z + dz, r);
    ring(L.faint, HOB.x + dx, W.y + 0.9, HOB.z + dz, r * 0.55, 28);
  }

  /* ═════════════ 3 · UP THE WALL: the hood, the wall units, the splashback ═════════════ */

  const WY = 150; // the underside of everything that hangs
  const WD = 35;
  slab(fx.flat, BAYS[2], BAYS[3], WY, WY + 5, 0, 48, { r: 0.6, lines: "fine" }); // the hood: a flat canopy over the hob…
  slab(fx.carcass, HOB.x - 13, HOB.x + 13, WY + 5, CTOP, 0, 28, { r: 0.4, lines: "fine" }); // …and its duct
  for (const [xa, xb] of [[BAYS[0], BAYS[1]], [BAYS[1], BAYS[2]], [BAYS[3], BAYS[4]]]) {
    for (const x of [xa, xb - T]) slab(fx.carcass, x, x + T, WY, CTOP, 0, WD);
    for (const y of [WY, CTOP - T]) slab(fx.flat, xa + T, xb - T, y, y + T, 0, WD);
    slab(fx.front, xa + 0.3, xb - 0.3, WY + 0.3, CTOP - 0.3, WD, WD + 1.9, { r: 0.35 });
    frame(L.fine, xa, xb, WY, CTOP, 0, WD + 1.9);
    seg(L.faint, [xa + 3, WY + 2.9, WD + 1.9], [xb - 3, WY + 2.9, WD + 1.9]);
  }
  // the wall itself: where it meets the floor, a corner of the room far to the right, and the tiles of the splashback
  run(L.fine, [[-330, 0, 0], [300, 0, 0], [300, 0, 330]]);
  seg(L.fine, [300, 0, 0], [300, 236, 0]);
  for (let y = W.y + 20; y < WY - 1; y += 20) seg(L.faint, [W.x0, y, 0.4], [W.x1, y, 0.4]);
  for (let x = W.x0 + 20; x < W.x1; x += 20) seg(L.faint, [x, W.y, 0.4], [x, WY, 0.4]);

  /* ── assembly: one mesh per material, all of it ONE shell; one mesh per family of lines; the floor ── */
  const panes = [];
  for (const [material, list] of buckets) {
    const mesh = new THREE.Mesh(list.length > 1 ? mergeGeometries(list) : list[0], material);
    room.add(mesh);
    panes.push(mesh);
  }
  asShell(panes, ORDER.room);
  fx.strong = lineMaterial({ width: 2.2, far: 0.32 });
  fx.fine = lineMaterial({ width: 1.8, far: 0.22 });
  fx.faint = lineMaterial({ width: 1.8, far: 0.2 });
  for (const [name, material] of [["strong", fx.strong], ["fine", fx.fine], ["faint", fx.faint]]) {
    const mesh = new THREE.Mesh(new LineSegmentsGeometry().setPositions(L[name]), material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    room.add(mesh);
  }
  const floor = makeFloor(floorAt);
  room.add(floor);

  /* ═════════════ 4 · YOU ═════════════ */

  const you = makeFigure({ shell: true, hands: "real", order: ORDER.you, glassK: 1.6, through: 0.2, skin: BRAND.ink });
  you.group.rotation.y = Math.PI; // facing the oven (−z): the figure's own left is toward −x, the camera's side
  group.add(you.group);
  you.shadow.visible = true;
  you.grip("L", 0.15);

  // a head: the kit's ball makes way for a skull with a face, of glass that can take heat
  const HEADY = 76.5; // its centre in the trunk's frame: above the hips…
  const HEADZ = 2; // …and forward of them
  fx.head = warm({ base: 0.006, rim: 0.67, power: 2.4, edge: 0.56, spec: 0.8, through: 0.2 });
  you.head.geometry = headGeometry();
  you.head.material = fx.head;
  you.head.castShadow = false;
  you.head.position.set(0, HEADY, HEADZ);
  asShell(you.head, ORDER.you);
  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(4.5, 9, 6, 20), you.body);
  neck.position.set(0, HEADY - 10.5, 0.7);
  neck.rotation.x = 10 * DEG;
  neck.scale.z = 0.92;
  you.torso.add(neck);
  asShell(neck, ORDER.you);
  // its eyes: the only solid things of you — what looks, and later what heats
  fx.eye = solid(INK.clone().multiplyScalar(0.52), { rough: 0.5, env: 0.5 });
  fx.eye.emissive = new THREE.Color(0, 0, 0);
  fx.pupil = solid(0x0b0d0f, { rough: 0.35 });
  fx.eyeOrb = orbMaterial();
  const eyeOrbs = [];
  const eyeAt = [];
  for (const [x, y, z] of EYES) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1.15, 28, 20), fx.eye);
    ball.position.set(x, y, z);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.72, 20, 14), fx.pupil);
    pupil.position.set(0, -0.1, 0.57);
    ball.add(pupil);
    const orb = new THREE.Mesh(ORB, fx.eyeOrb);
    orb.renderOrder = 7;
    orb.position.set(x, GAZE.y, GAZE.z - 0.25);
    orb.visible = false;
    you.head.add(ball, orb);
    eyeOrbs.push(orb);
    eyeAt.push(anchor(you.head, x, GAZE.y, GAZE.z));
  }
  // the hands: the left one of glass like the rest; the right one — the one that pulls — solid, and all the lighter as it acts
  for (const mesh of you.arms.L.fingers.meshes) {
    mesh.material = you.body;
    mesh.castShadow = false;
  }
  asShell(you.arms.L.fingers.meshes, ORDER.you);
  fx.hand = solid(BRAND.ink, { rough: 0.6, env: 0.6 });
  for (const mesh of you.arms.R.fingers.meshes) {
    mesh.material = fx.hand;
    mesh.castShadow = false;
  }
  A.youHead = anchor(you.head, 0, 12.5, 0);
  A.youEyes = anchor(you.head, 0, 0.5, 8.6);
  A.youHand = anchor(you.arms.R.hand, 0, -1.2, 7);

  const NEAR_LEAN = 16; // degrees, from the hips: the head comes down to the window — its centre in YOU, the tip of its nose 10 cm from the glass
  const EYE = GAZE;
  // Where the front of your eyes is, from YOU — kept in step with waves.js (its EYES: dy −1, front 7.1, rise 2.6 once you stand back):
  // its threads of light land there when nobody hands it `A.youEyes` to watch. The stance is solved for it, whatever `near`.
  const SIGHT = { y: YOU.head - 1, front: 7.1, rise: 2.6 };
  const foot = V();
  const GRIP = { x: BAR.x - HINGE.x, z: BAR.z - HINGE.z }; // the bar, seen from the hinge
  const X = V(1, 0, 0);
  const Z = V(0, 0, 1);
  const DOWN = V(0, -1, 0);
  const at = V();
  const rest = V();
  const bar = V();
  const axis = V();
  const palm = V();
  const dir = V();
  const HOLD = { palm, dir, k: 0, bar: 1 };
  const last = { near: NaN, pull: NaN, open: NaN, hand: NaN };

  function poseYou(nearK, pull, open) {
    const n = clamp01(nearK);
    const grab = smooth(0, 1, clamp01(pull / 0.5)); // the hand on its way to the handle
    const tug = clamp01((pull - 0.5) / 0.5);
    const th = clamp01(open) * SWING;
    // the door sweeps where your head is: you straighten out of its way while it passes — and stay back for as long as you hold it
    const sweep = smooth(0.05, 0.3, open);
    const back = n * sweep * Math.max(1 - smooth(0.8, 1, open), smooth(0, 0.6, tug));
    const lean0 = mix(5, NEAR_LEAN, n); // how you stand while nothing moves
    const face = mix(8, 10, n); // how far down you look (degrees)
    const eyeY = you.HIP + HEADY * Math.cos(lean0 * DEG) - HEADZ * Math.sin(lean0 * DEG) + EYE.y * Math.cos(face * DEG) - EYE.z * Math.sin(face * DEG);
    const eyeF = HEADY * Math.sin(lean0 * DEG) + HEADZ * Math.cos(lean0 * DEG) + EYE.y * Math.sin(face * DEG) + EYE.z * Math.cos(face * DEG);
    const gy = Math.min(0, SIGHT.y + SIGHT.rise * (1 - n) - eyeY); // the knees give a little: never on tiptoe
    const gz = YOU.z + YOU.back * (1 - n) - SIGHT.front + eyeF;
    you.group.position.set(YOU.x, gy, gz);
    you.leg("L", foot.set(9.5, 8 - gy, 7));
    you.leg("R", foot.set(-9.5, 8 - gy, -5));
    const pitch = lean0 - (lean0 + 6) * back - 2.5 * tug * (1 - back);
    you.lean(pitch, 0, 5 * grab + 12 * back * tug);
    you.head.rotation.x = Math.max(-12, Math.min(18, face - pitch)) * DEG; // the eyes stay on the plate

    // the shoulders, once the trunk has leaned: the arms hang plumb from them
    const shY = you.HIP + 54 * Math.cos(pitch * DEG);
    const shZ = 54 * Math.sin(pitch * DEG);
    you.reach("L", at.set(21, shY - 53, shZ + 9)); // (never quite straight: a doll's arm)

    // the right hand: open along the thigh → closed on the bar, wherever the door has taken it
    rest.set(-15, shY - 62, shZ + 3);
    const c = Math.cos(th);
    const s = Math.sin(th);
    const wx = HINGE.x + GRIP.x * c - GRIP.z * s;
    const wz = HINGE.z + GRIP.x * s + GRIP.z * c;
    bar.set(-(wx - YOU.x), BAR.y - gy, -(wz - gz)); // in your own frame (you face −z)
    at.lerpVectors(rest, bar, grab);
    at.x -= 5 * Math.sin(Math.PI * grab); // it comes round from the outside
    at.z -= 3 * Math.sin(Math.PI * grab);
    axis.copy(Z).lerp(UP, grab).normalize(); // the thumb: forward at rest, up on the bar
    palm.set(c, 0, s).multiplyScalar(grab).addScaledVector(X, 1 - grab).normalize(); // the palm faces the hinge's side, and turns with the door
    dir.set(-s, 0, c).multiplyScalar(grab).addScaledVector(DOWN, 1 - grab).normalize(); // the fingers: down at rest, into the gap behind the bar
    HOLD.k = mix(0.12, 1, smooth(0.6, 1, grab));
    HOLD.bar = mix(5, BAR.r, grab);
    you.hold("R", at, axis, HOLD);
    fx.hand.color.copy(INK).multiplyScalar(mix(0.2, 1, smooth(0.04, 0.42, pull)));
  }

  /* ═════════════ 5 · THE TEST: someone else's forearm, out of the dark, into the open cavity ═════════════ */

  const tester = makeFigure({ shell: true, hands: "real", order: ORDER.test, glassK: 1.7, through: 0.15, skin: BRAND.ink });
  tester.group.rotation.y = Math.PI;
  group.add(tester.group);
  // nothing of them but a forearm and a hand
  tester.torso.visible = false;
  for (const s of ["L", "R"]) tester.legs[s].thigh.mesh.visible = tester.legs[s].shin.mesh.visible = tester.legs[s].foot.visible = false;
  tester.arms.L.upper.mesh.visible = tester.arms.L.fore.mesh.visible = tester.arms.L.hand.visible = tester.arms.R.upper.mesh.visible = false;
  fx.test = warm({ base: 0.008, rim: 0.72, power: 2.4, edge: 0.6, spec: 0.7, through: 0.15 });
  fx.test.uniforms.uFade.value.set(72, 92);
  tester.arms.R.fore.mesh.material = fx.test;
  asShell(tester.arms.R.fore.mesh, ORDER.test);
  // the hand: solid — it is what the sentence is about — in three matters, so that the heat can climb it from the tips
  fx.testHand = [solid(BRAND.ink, { rough: 0.6, env: 0.6 }), solid(BRAND.ink, { rough: 0.6, env: 0.6 }), solid(BRAND.ink, { rough: 0.6, env: 0.6 })];
  for (const mat of fx.testHand) mat.emissive = new THREE.Color(0, 0, 0);
  tester.arms.R.fingers.meshes.forEach((mesh, i) => {
    mesh.material = fx.testHand[i < 2 ? 0 : (i - 2) % 3]; // the palm and the first bones · the middle ones · the tips
    mesh.castShadow = false;
  });
  // the tip of each finger (the hand is open, at rest, and stays so): where the field bites first
  fx.tipOrb = orbMaterial();
  const tipOrbs = [4, 7, 10, 13, 16].map((i) => {
    const bone = tester.arms.R.fingers.meshes[i];
    bone.geometry.computeBoundingBox();
    const orb = new THREE.Mesh(ORB, fx.tipOrb);
    orb.renderOrder = 7;
    orb.position.copy(bone.position).addScaledVector(V(0, 1, 0).applyQuaternion(bone.quaternion), bone.geometry.boundingBox.max.y * 0.7);
    orb.visible = false;
    tester.arms.R.hand.add(orb);
    return orb;
  });
  A.testHand = anchor(tester.arms.R.hand, 0, -2.2, 17.5);
  // where they stand (hidden: only the shoulder matters — high, so that the forearm comes in level) and where the wrist goes
  const TEST = { x: -12.5, lift: 28, z: [147, 109], wrist: [V(0, 156, 96), V(-5.5, 161, 57)] };
  const HEAT = [0.12, 0.5, 1]; // how much of the pain each matter of the hand takes
  const REACH = { dir: V(0.1, 0.02, 1).normalize(), palm: V(0, -1, 0) }; // their own frame: the fingers toward the back of the cavity, the palm down

  function poseTest(h) {
    const gz = mix(TEST.z[0], TEST.z[1], h);
    tester.group.position.set(TEST.x, TEST.lift, gz);
    at.lerpVectors(TEST.wrist[0], TEST.wrist[1], h);
    tester.reach("R", at.set(-(at.x - TEST.x), at.y - TEST.lift, -(at.z - gz)), null, REACH);
  }

  return {
    group, A, fx, you, tester,
    benchGroup: new THREE.Group(), // (nothing of the kitchen goes to the bench)
    /**
     * shell  the X-ray of the kitchen (0–1)                 you   you, in front of the oven (0 / 1)
     * near   1: your face 10 cm from the glass · 0: a step back, upright
     * pull   0 the hand at your side · 0.5 closed on the handle · 1 pulling        open  the door's angle (0–1 → 100°): the hand follows the bar
     * eyes   without the door: the heat in your eyes, then in your face (0–1)
     * hand   the test: a forearm reaches into the cavity (0–1)      pain  its fingertips glow (0–1)
     */
    update({ shell: sh = 1, you: showYou = 1, near = 1, pull = 0, open = 0, eyes = 0, hand = 0, pain = 0 } = {}, time = 0) {
      // the kitchen
      room.visible = sh > 0.01;
      for (let i = 0; i < glasses.length; i++) glasses[i].uniforms.uAmount.value = sh;
      fx.strong.uniforms.uAmount.value = 0.72 * sh;
      fx.fine.uniforms.uAmount.value = 0.4 * sh;
      fx.faint.uniforms.uAmount.value = 0.17 * sh;
      floor.material.uniforms.uAmount.value = sh;

      // you
      const here = showYou > 0.5;
      you.group.visible = here;
      if (here && (near !== last.near || pull !== last.pull || open !== last.open)) {
        last.near = near;
        last.pull = pull;
        last.open = open;
        poseYou(near, pull, open);
      }
      const breath = 1 + 0.06 * Math.sin(time * 1.3); // slow: a light that blinks reads as a fault
      const e = here ? clamp01(eyes) : 0;
      const lit = e > 0.003;
      fx.eye.emissive.copy(SIGNAL).multiplyScalar(2.2 * smooth(0, 0.5, e));
      fx.eyeOrb.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(1.9 * smooth(0, 0.6, e) * breath);
      fx.head.uniforms.uHeat.value = 0.9 * smooth(0.25, 1, e);
      fx.head.uniforms.uHeatR.value = mix(1.6, 6, e);
      for (let i = 0; i < 2; i++) {
        eyeOrbs[i].visible = lit;
        eyeOrbs[i].scale.setScalar(mix(1.8, 5, e));
      }
      if (lit) {
        eyeAt[0].getWorldPosition(fx.head.uniforms.uHeatA.value);
        eyeAt[1].getWorldPosition(fx.head.uniforms.uHeatB.value);
      }

      // the test
      const h = clamp01(hand);
      const reaching = h > 0.003;
      tester.group.visible = reaching;
      if (reaching && h !== last.hand) {
        last.hand = h;
        poseTest(h);
      }
      const hurt = reaching ? clamp01(pain) * smooth(0.45, 0.95, h) : 0;
      const seen = smooth(0.1, 0.55, h); // the hand comes out of the dark as it nears the oven
      for (let i = 0; i < 3; i++) {
        const mat = fx.testHand[i];
        const heat = hurt * HEAT[i];
        mat.color.copy(INK).multiplyScalar(0.82).lerp(SIGNAL, 0.8 * heat);
        mat.emissive.copy(SIGNAL).multiplyScalar(0.9 * heat * heat);
        mat.opacity = seen;
        mat.depthWrite = seen > 0.55;
        if (mat.transparent !== seen < 0.999) {
          mat.transparent = seen < 0.999;
          mat.needsUpdate = true;
        }
      }
      fx.tipOrb.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(1.7 * hurt * breath);
      for (let i = 0; i < tipOrbs.length; i++) {
        tipOrbs[i].visible = hurt > 0.003;
        tipOrbs[i].scale.setScalar(mix(1, 2.3, hurt));
      }
    },
  };
}
