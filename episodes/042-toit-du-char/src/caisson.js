// DOSSIER 042 — the SYSTEM, solid: the ammunition compartment at the turret's rear (« un caisson d'obus »), its
// rounds, its roof panel made to let go, the bulkhead with its two sliding blast doors and their seals, the rod and the
// egg-shaped cam that lock the doors when the panel leaves (US 5,201,556, schematic), the pressure arrows of the
// principle, and on the bench the like's counter-example (a closed block of thick steel). Centimetres, Y up, the origin
// is the caisson's centre (plan.js). Three greys (cast box, machined lips and leaves, the light hero: the panel, then
// the cam), fine edges, metal ≤ 0.5; signal = the powder burning and the pressure, veille = what holds.
//
//   buildCaisson() → { root, parts: { box, rounds, panel, doors, lock, block }, A, update(P, time, px, eye) }
//   P = { explode, section, litBox, litPanel, litDoors, litCam, weak, burn, press, arrowRoof, arrowDoor, vent, bulge,
//         blow, lock, bow, leak, seal, door, grab, block, crack, bench }
//
// The fire inside lights ONLY the faces turned toward it, and only on this file's materials (a term injected in their
// shader, two points of fire): the rounds, the inner walls, the panel's underside glow; the bench floor and the outer
// faces never catch it — a light that has a place, never a veil. Nothing is allocated in `update`.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, setGlow, lineMat, edgesOf, fatLine, anchor, box, cyl, plate, lathe, mergeGeometries, placed, makePart } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { CAISSON, PANEL, ROUNDS, DOORS, ROD, CAM, BLOCK, BENCH, DEG } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(0xffe2c6); //       the white heart of the signal (« à cœur blanc »)
const DARK = new THREE.Color(0x1d2226); //      edge lines on the light parts
const VEILLE_LIT = VEILLE.clone().multiplyScalar(1.8);
const SIGNAL_LIT = SIGNAL.clone().multiplyScalar(2.3);

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
/** Leaves fast, arrives with a slight overshoot and settles: parts have weight (as build3d's explode). */
const settle = (u) => {
  const s = Math.sin(Math.PI * u);
  return easeInOut(u) + s * s * 0.055 * (u > 0.5 ? 1 : 0.25);
};
/** 0 → 1 on a → b, back to 0 on b → c. */
/** The exploded view's window of one part. */
const spread = (k, [a, b]) => settle(ramp(k, a, b));
const bump = (x, a, b, c) => (x <= a || x >= c ? 0 : x < b ? smooth((x - a) / (b - a)) : smooth((c - x) / (c - b)));

/* ─────────────────────────────────────────────────────────── dimensions derived from plan.js */
const [X0, X1] = CAISSON.x, [Y0, Y1] = CAISSON.y, [Z0, Z1] = CAISSON.z, W = CAISSON.wall;
const [B0, B1] = CAISSON.bulkhead;
const TOP = PANEL.y[1]; //                                     the roof line (flush with the turret roof)
const O = DOORS.opening, L = DOORS.leaf;
const OY0 = O.y - O.h / 2, OY1 = O.y + O.h / 2; //              the openings, y
const OZI = O.z[0] - O.w / 2, OZO = O.z[0] + O.w / 2; //        their inner and outer edges, |z|
const PW = PANEL.x[1] - PANEL.x[0], PT = PANEL.y[1] - PANEL.y[0], PD = PANEL.z[1] - PANEL.z[0];
const PY = (PANEL.y[0] + PANEL.y[1]) / 2;
const BULGE = PANEL.bulge * 3; //                               drawn ×3: a 6 cm bow is 4 px on a 270 px thumbnail
const RAIL_Z = [Z0 - W, O.z[0] + L.w / 2 + DOORS.slide + 4]; // the guides run far enough for the loader's door to open
// the lock (schematic, after US 5,201,556): the cam is an egg-shaped disc (22 × 16 in profile, 10 thick along its
// axle), the axle near its fat end, its narrow end up at rest. Turned 80° it lays its narrow end on the leaves: the
// axle stands EGG_REACH cm from their face. A crank of RL cm at 200° (crew side, below), pulled up by the rod through a
// fork: 10 cm of rod turn the cam by 80°.
const EGG = { len: CAM.length, half: CAM.a, thick: 2 * CAM.b, axle: 3 }; // `axle`: cm from the egg's middle toward its fat end
const EGG_REACH = EGG.len / 2 + EGG.axle - 0.1;
const AXLE = [L.x[0] - EGG_REACH, CAM.at[1], CAM.at[2]];
const RL = 8.3, PHI0 = 200 * DEG, S0 = Math.sin(PHI0);
const ROD_X = AXLE[0] - RL * 0.75; //                            the middle of the crank pin's path
const LZ = -(EGG.thick / 2 + 2.8); //                           the lever's plane, past the egg's −z face: behind it for the camera
const YB0 = AXLE[1] + RL * S0; //                               the fork, at rest
const CLEVIS = TOP + 1.5; //                                    the rod's head, where the panel's tab is pinned

/** Where each part goes at explode = 1 (cm): the panel up, the rounds back out of the rear, the doors toward the crew,
 *  the rod and the cam further toward the crew and toward the camera's side (+z). Each in its own window. */
const SPREAD = { panel: [0, 80, 0], rounds: [90, 0, 0], doors: [-55, 0, 0], lock: [-110, 10, 30] };
const WINDOW = { panel: [0, 0.6], rounds: [0.1, 0.7], doors: [0.2, 0.8], lock: [0.3, 1] };

/** The panel's flight: 4 cm at blow 0.05 (cracked free), 40 cm at 0.15 (tilting), ≈ 25 m at 1; C1 from 0.05 on. */
function lift(b) {
  if (b <= 0.05) return 4 * (b / 0.05);
  if (b <= 0.15) {
    const u = (b - 0.05) / 0.1;
    return 4 + 36 * u * Math.sqrt(u);
  }
  const t = b - 0.15;
  return 40 + 540 * t + ((PANEL.flight.up - 40 - 540 * 0.85) / (0.85 * 0.85)) * t * t;
}

/* ─────────────────────────────────────────────────────────── helpers */

/** Fade a material made by the kit (it keeps its base opacity and blending in userData). */
function fade(mat, a) {
  mat.opacity = mat.userData.base * a;
  const t = mat.userData.transparent || a < 0.999;
  if (mat.transparent !== t) {
    mat.transparent = t;
    mat.needsUpdate = true;
  }
  mat.depthWrite = mat.userData.depthWrite && a > 0.55;
}

/** A lit mesh with its edge lines in a SHARED line material (so a whole part can glow, heat or be named at once). */
function edged(geo, mat, edge, o = {}) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = o.shadow ?? true;
  mesh.receiveShadow = true;
  if (edge) {
    const lines = edgesOf(o.outline ?? geo, { threshold: o.threshold });
    lines.material.dispose();
    lines.material = edge;
    mesh.add(lines);
  }
  if (o.pos) mesh.position.set(...o.pos);
  return mesh;
}
function slab(group, mat, edge, [x0, x1], [y0, y1], [z0, z1], r = 0.8) {
  const m = edged(box(x1 - x0, y1 - y0, z1 - z0, r), mat, edge, { pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
  group.add(m);
  return m;
}

/** A relative morph target (and its normals): `fn(v, out)` writes the displacement of vertex v at influence 1. */
function morph(geo, fn) {
  const pos = geo.attributes.position, n = pos.count;
  const d = new Float32Array(n * 3);
  const v = new THREE.Vector3(), o = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    fn(v.fromBufferAttribute(pos, i), o.set(0, 0, 0));
    d[i * 3] = o.x;
    d[i * 3 + 1] = o.y;
    d[i * 3 + 2] = o.z;
  }
  const bent = geo.clone();
  const bp = bent.attributes.position;
  for (let i = 0; i < n; i++) bp.setXYZ(i, pos.getX(i) + d[i * 3], pos.getY(i) + d[i * 3 + 1], pos.getZ(i) + d[i * 3 + 2]);
  bent.computeVertexNormals();
  const n0 = geo.attributes.normal.array, n1 = bent.attributes.normal.array;
  const dn = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) dn[i] = n1[i] - n0[i];
  geo.morphAttributes.position = [new THREE.BufferAttribute(d, 3)];
  geo.morphAttributes.normal = [new THREE.BufferAttribute(dn, 3)];
  geo.morphTargetsRelative = true;
  return geo;
}

/* ─────────────────────────────────────────────────────────── the fire's light, on this file's solids only */

const FIRE = {
  uFireP: { value: [new THREE.Vector3(), new THREE.Vector3()] },
  uFireR: { value: [1, 1] },
  uFireK: { value: 0 },
  uFireC: { value: SIGNAL.clone() },
};
const FIRE_HEAD = /* glsl */ `varying vec3 vFireW; varying vec3 vFireN;\n`;
const FIRE_UNI = /* glsl */ `uniform vec3 uFireP[2]; uniform float uFireR[2]; uniform float uFireK; uniform vec3 uFireC;\n`;
const FIRE_VERT = /* glsl */ `#include <project_vertex>
  vFireW = (modelMatrix * vec4(transformed, 1.0)).xyz;
  vFireN = mat3(modelMatrix) * objectNormal;`;
// only the faces turned toward a point of fire catch it (no wrap): the outer faces of the box stay dark
const FIRE_FRAG = /* glsl */ `if (uFireK > 0.0) {
    vec3 fN = normalize(vFireN);
    float fl = 0.0;
    for (int i = 0; i < 2; i++) {
      vec3 fL = uFireP[i] - vFireW;
      float fd = length(fL);
      float fnl = max(dot(fN, fL / max(fd, 1e-3)), 0.0);
      float fa = clamp(1.0 - fd / max(uFireR[i], 1e-3), 0.0, 1.0);
      fl += fnl * fa * fa;
    }
    outgoingLight += uFireC * diffuseColor.rgb * fl * uFireK;
  }
  #include <opaque_fragment>`;
function fireLit(mat) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, FIRE);
    shader.vertexShader = FIRE_HEAD + shader.vertexShader.replace("#include <project_vertex>", FIRE_VERT);
    shader.fragmentShader = FIRE_HEAD + FIRE_UNI + shader.fragmentShader.replace("#include <opaque_fragment>", FIRE_FRAG);
  };
  mat.customProgramCacheKey = () => "sd-042-fire";
  return mat;
}

/* ─────────────────────────────────────────────────────────── lights that have a place */

/** A soft round light facing the eye: a white heart and a coloured halo (a sphere would read as a disc). */
function glint(core, halo, size) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uCore: { value: core.clone() }, uHalo: { value: halo.clone() }, uAmount: { value: 0 }, uSize: { value: size } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `uniform float uSize; varying vec2 vP;
      void main() {
        vP = position.xy * 2.0;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `uniform vec3 uCore, uHalo; uniform float uAmount; varying vec2 vP;
      void main() {
        float r2 = dot(vP, vP);
        if (r2 >= 1.0) discard;
        float halo = pow(clamp(1.0 - r2, 0.0, 1.0), 2.4);
        float core = exp(-r2 * 26.0);
        gl_FragColor = vec4((uHalo * halo + uCore * core) * uAmount, 1.0);
      }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  m.frustumCulled = false;
  m.renderOrder = 6;
  m.visible = false;
  return m;
}

/** A soft sheet of light (an opening lit from inside): bright in the middle, gone at its borders. */
function sheet(w, h, k) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: SIGNAL.clone().multiplyScalar(k) }, uHot: { value: HOT.clone().multiplyScalar(k * 0.7) }, uAmount: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `uniform vec3 uColor, uHot; uniform float uAmount; varying vec2 vUv;
      void main() {
        vec2 q = abs(vUv - 0.5) * 2.0;
        float e = clamp(1.0 - max(q.x, q.y), 0.0, 1.0);
        float a = smoothstep(0.0, 0.5, e);
        float c = smoothstep(0.4, 1.0, e);
        gl_FragColor = vec4((uColor * a + uHot * c * c) * uAmount, 1.0);
      }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.renderOrder = 5;
  m.visible = false;
  return m;
}

/** Slow tongues of flame, all in one draw: quads facing the eye, their foot on `c`, swaying and breathing slowly. */
function makeFlames(list) {
  const n = list.length;
  const pos = new Float32Array(n * 12), corner = new Float32Array(n * 8), seed = new Float32Array(n * 16), index = [];
  const C = [-1, 0, 1, 0, 1, 1, -1, 1];
  list.forEach(({ c, w, h, ph, sp }, i) => {
    for (let k = 0; k < 4; k++) {
      pos.set(c, (i * 4 + k) * 3);
      corner.set([C[k * 2], C[k * 2 + 1]], (i * 4 + k) * 2);
      seed.set([w, h, ph, sp], (i * 4 + k) * 4);
    }
    const b = i * 4;
    index.push(b, b + 1, b + 2, b, b + 2, b + 3);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aCorner", new THREE.BufferAttribute(corner, 2));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
  geo.setIndex(index);
  const uniforms = { uT: { value: 0 }, uAmount: { value: 0 }, uSig: { value: SIGNAL.clone().multiplyScalar(1.5) }, uHot: { value: HOT.clone().multiplyScalar(2.2) } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `uniform float uT; attribute vec2 aCorner; attribute vec4 aSeed; varying vec2 vC; varying float vK;
        void main() {
          float t = uT * aSeed.w + aSeed.z * 6.2831;
          float h = aSeed.y * (0.8 + 0.12 * sin(t * 1.1) + 0.08 * sin(t * 2.3 + 1.7));
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float sway = (0.2 * sin(t * 0.9) + 0.08 * sin(t * 1.9 + 2.0)) * aCorner.y * aCorner.y;
          mv.x += (aCorner.x + sway) * aSeed.x * 0.5;
          mv.y += aCorner.y * h;
          vC = aCorner;
          vK = 0.86 + 0.14 * sin(t * 1.3 + 0.5);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `uniform vec3 uSig, uHot; uniform float uAmount; varying vec2 vC; varying float vK;
        void main() {
          float v = clamp(vC.y, 0.0, 1.0);
          float w = 0.95 * pow(1.0 - v, 0.5) * (0.55 + 0.45 * sqrt(clamp(v * 4.0, 0.0, 1.0)));
          float u = abs(vC.x);
          float a = (1.0 - smoothstep(w * 0.05, w + 1e-3, u)) * smoothstep(0.0, 0.1, v) * (1.0 - 0.5 * v);
          float core = clamp(1.0 - u / max(w, 1e-3), 0.0, 1.0) * (1.0 - v);
          vec3 col = mix(uSig, uHot, core * core);
          gl_FragColor = vec4(col * a * uAmount * vK, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  mesh.visible = false;
  return { mesh, uniforms };
}

/** Embers rising in the burning box (periodic: alive from the first frame), slow — the film is in slow motion. */
function makeEmbers(count, seed) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3), seeds = new Float32Array(count * 4);
  const lanes = [0, 121, -121];
  for (let i = 0; i < count; i++) {
    const lane = lanes[i % 3];
    pos.set([-48 + rand() * 96, -26 + rand() * 12, lane + (rand() - 0.5) * (lane ? 6 : 18)], i * 3);
    seeds.set([rand(), 2.2 + rand() * 1.6, 0.8 + rand() * rand() * 1.8, rand() * Math.PI * 2], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uScale: { value: 3000 }, uAmount: { value: 0 }, uHot: { value: HOT.clone().multiplyScalar(2.4) }, uCool: { value: SIGNAL.clone().multiplyScalar(1.8) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `uniform float uT, uScale; attribute vec4 aSeed; varying float vAge;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          vAge = age;
          vec3 p = position + vec3(cos(aSeed.w) * 5.0 * age, 48.0 * age, sin(aSeed.w) * 3.0 * age);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = max(1.8, aSeed.z * uScale / max(1.0, -mv.z));
        }`,
      fragmentShader: /* glsl */ `uniform vec3 uHot, uCool; uniform float uAmount; varying float vAge;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(clamp(1.0 - d, 0.0, 1.0), 1.6) * sin(3.14159 * vAge) * uAmount;
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.0, 0.6, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 4;
  points.visible = false;
  return { points, uniforms };
}

/* ─────────────────────────────────────────────────────────── pressure arrows */

const ARROW_MAT = (() => {
  const m = glow(BRAND.signal, 1.5);
  Object.assign(m, { depthTest: false, depthWrite: false, transparent: true });
  return m;
})();
const HULL_MAT = new THREE.MeshBasicMaterial({ color: 0x050607, depthTest: false, depthWrite: false, transparent: true, side: THREE.DoubleSide, fog: false });
const UP = new THREE.Vector3(0, 1, 0);

/** A thick arrow along +y from its tail (local 0) — drawn over everything, ringed in black so it reads on fire too. */
function arrow(len, rs, rh, hl) {
  const shaft = new THREE.CylinderGeometry(rs, rs, len - hl, 20).translate(0, (len - hl) / 2, 0);
  const head = new THREE.ConeGeometry(rh, hl, 28).translate(0, len - hl / 2, 0);
  const geo = mergeGeometries([shaft, head]);
  const g = new THREE.Group();
  const hull = new THREE.Mesh(geo, HULL_MAT);
  const k = (rh + 1.4) / rh;
  hull.scale.set(k, (len + 2.6) / len, k);
  hull.position.y = -1.3;
  hull.renderOrder = 24;
  const body = new THREE.Mesh(geo, ARROW_MAT);
  body.renderOrder = 25;
  g.add(hull, body);
  g.visible = false;
  return g;
}
function aim(g, from, dir) {
  g.position.set(...from);
  g.quaternion.setFromUnitVectors(UP, new THREE.Vector3(...dir).normalize());
  g.userData.home = g.position.clone();
  g.userData.q0 = g.quaternion.clone();
  return g;
}

/* ─────────────────────────────────────────────────────────── the build */

export function buildCaisson() {
  const root = new THREE.Group();
  const qUp = new THREE.Quaternion();

  /* ── the box: floor, rear, sides, bulkhead with its two openings, the lips round the panel ── */
  const boxPart = makePart("box");
  const boxMat = fireLit(solid(0x3a4046, { rough: 0.62, metal: 0.3 }));
  const lipMat = fireLit(solid(0x5c636a, { rough: 0.46, metal: 0.38 })); //  machined: the seat of the panel
  const boxEdge = lineMat(BRAND.ink, 2, { opacity: 0.7 });
  slab(boxPart, boxMat, boxEdge, [B0, X1 + W], [Y0 - W, Y0], [Z0 - W, Z1 + W]); //   floor
  slab(boxPart, boxMat, boxEdge, [X1, X1 + W], [Y0, Y1], [Z0 - W, Z1 + W]); //       rear (+x)
  slab(boxPart, boxMat, boxEdge, [B0, X1], [Y0, Y1], [Z0 - W, Z0]); //               far side (−z)
  slab(boxPart, boxMat, boxEdge, [B0, B1], [Y0, OY0], [Z0, Z1]); //                  bulkhead under the openings
  slab(boxPart, boxMat, boxEdge, [B0, B1], [OY1, Y1], [Z0, Z1]); //                  over them
  slab(boxPart, boxMat, boxEdge, [B0, B1], [OY0, OY1], [-OZI, OZI]); //              the middle pillar
  slab(boxPart, boxMat, boxEdge, [B0, B1], [OY0, OY1], [OZO, Z1]); //                the outer pillars
  slab(boxPart, boxMat, boxEdge, [B0, B1], [OY0, OY1], [Z0, -OZO]);
  // the lips: the outer rim of the walls rises to the roof line round the panel; their inner 4 cm are its seat
  slab(boxPart, lipMat, boxEdge, [B0, PANEL.x[0]], [Y1, TOP], [Z0 - W, Z1 + W], 0.5); //  over the bulkhead
  slab(boxPart, lipMat, boxEdge, [PANEL.x[1], X1 + W], [Y1, TOP], [Z0 - W, Z1 + W], 0.5); // over the rear
  slab(boxPart, lipMat, boxEdge, [PANEL.x[0], PANEL.x[1]], [Y1, TOP], [Z0 - W, PANEL.z[0]], 0.5); // far side
  // the four stubs of the light fasteners, on the seat: they show in the slit once the panel has let go
  const stubMat = fireLit(solid(0x8f959b, { rough: 0.4, metal: 0.4 }));
  for (const [fx, fz] of PANEL.fasteners) {
    const s = edged(cyl(1.1, 2.2, 0.15, 16), stubMat, null, { pos: [fx, Y1 + 1.1, fz] });
    boxPart.add(s);
  }
  // the near side (+z), « en coupe »: the solid fades, a ghost of glass and its edges stays (the six faces stay six)
  const near = new THREE.Group();
  const nearMat = fireLit(solid(0x3a4046, { rough: 0.62, metal: 0.3, opacity: 0.999 }));
  slab(near, nearMat, boxEdge, [B0, X1], [Y0, Y1], [Z1, Z1 + W]);
  slab(near, nearMat, boxEdge, [PANEL.x[0], PANEL.x[1]], [Y1, TOP], [PANEL.z[1], Z1 + W], 0.5);
  const ghostGeo = new THREE.BoxGeometry(X1 - B0, TOP - Y0, W);
  const ghost = new THREE.Mesh(ghostGeo, glass(BRAND.ink, { base: 0.012, rim: 0.2, power: 2.6, edge: 0.42 }));
  ghost.position.set((B0 + X1) / 2, (Y0 + TOP) / 2, Z1 + W / 2);
  asShell(ghost, 20);
  const ghostEdge = lineMat(BRAND.ink, 2, { opacity: 0 });
  const ghostLines = edgesOf(ghostGeo);
  ghostLines.material.dispose();
  ghostLines.material = ghostEdge;
  ghost.add(ghostLines);
  near.add(ghost);
  boxPart.add(near);
  root.add(boxPart);

  /* ── the fire inside (burn) ── */
  const R = rng(42);
  const flameList = [];
  const lane = (n, z, dz, w, h) => {
    for (let i = 0; i < n; i++) flameList.push({ c: [-48 + R() * 96, Y0 + 0.5 + R() * 3, z + (R() - 0.5) * dz], w: w[0] + R() * w[1], h: h[0] + R() * R() * h[1], ph: R(), sp: 0.7 + R() * 0.6 });
  };
  lane(10, 0, 20, [20, 12], [34, 30]); //                             the aisle, big: it shows through the gaps
  lane(9, 121, 3, [18, 14], [20, 34]); //                             in front of the near rack, seen in section
  lane(6, -121, 3, [16, 10], [16, 28]);
  for (const gz of [30, 48, 66, 84, 102]) flameList.push({ c: [-40 + R() * 80, -11.5 + R() * 18, gz], w: 9 + R() * 5, h: 14 + R() * 10, ph: R(), sp: 0.9 + R() * 0.4 });
  const flames = makeFlames(flameList);
  const embers = makeEmbers(42, 9);
  root.add(flames.mesh, embers.points);
  // the first case that lights (burn 0.2): on the near rack, front column, middle row — seen in section
  const IGNITE = [-6, 0, ROUNDS.cols[5] + ROUNDS.r + 0.8];
  const ignite = glint(HOT.clone().multiplyScalar(2.6), SIGNAL.clone().multiplyScalar(1.3), 24);
  ignite.position.set(...IGNITE);
  root.add(ignite);
  // the fire seen through the loader's opening (behind the door when it slides), and through the roof once open
  const doorGlow = sheet(O.w - 6, O.h - 6, 1.4);
  doorGlow.rotation.y = Math.PI / 2;
  doorGlow.position.set(B1 + 1.5, O.y, O.z[0]);
  const holeGlow = sheet(PW - 14, PD - 14, 1.2);
  holeGlow.rotation.x = -Math.PI / 2;
  holeGlow.position.set(0, Y1 - 3, 0);
  const bedGlow = sheet(X1 - X0 - 6, Z1 - Z0 - 6, 0.9);
  bedGlow.rotation.x = -Math.PI / 2;
  bedGlow.position.set(0, Y0 + 0.6, 0);
  root.add(doorGlow, holeGlow, bedGlow);
  // the slit of light all round the panel when it lets go (and through the seam when everything glows)
  const slitMat = glow(BRAND.signal, 0, { additive: true });
  const slitGeoX = new THREE.BoxGeometry(0.8, 1, PD).translate(0, 0.5, 0);
  const slitGeoZ = new THREE.BoxGeometry(PW, 1, 0.8).translate(0, 0.5, 0);
  const slits = [
    [slitGeoX, PANEL.x[0], 0], [slitGeoX, PANEL.x[1], 0], [slitGeoZ, 0, PANEL.z[0]], [slitGeoZ, 0, PANEL.z[1]],
  ].map(([g, x, z]) => {
    const m = new THREE.Mesh(g, slitMat);
    m.position.set(x, Y1, z);
    m.renderOrder = 5;
    root.add(m);
    return m;
  });
  // « son point faible, on l'a mis là »: the line of the rim lights up all round the panel
  const weakMat = lineMat(BRAND.veille, 3.6, { opacity: 0, hdr: 2.2 });
  const yW = TOP + 0.25;
  const weakLine = fatLine([[PANEL.x[0], yW, PANEL.z[0]], [PANEL.x[1], yW, PANEL.z[0]], [PANEL.x[1], yW, PANEL.z[1]], [PANEL.x[0], yW, PANEL.z[1]], [PANEL.x[0], yW, PANEL.z[0]]], { color: BRAND.veille, width: 3.6 });
  weakLine.material.dispose();
  weakLine.material = weakMat;
  weakLine.visible = false;
  root.add(weakLine);

  /* ── the rounds: base (culot) toward the doors, warm grey case, dark nose toward the rear ── */
  const rounds = makePart("rounds");
  const caseMat = fireLit(solid(0x8a8478, { rough: 0.78, metal: 0.08 }));
  const baseMat = fireLit(solid(0xa3a7aa, { rough: 0.38, metal: 0.45 }));
  const noseMat = fireLit(solid(0x50565c, { rough: 0.5, metal: 0.3 }));
  const CASE_C = caseMat.color.clone(), BASE_C = baseMat.color.clone(), NOSE_C = noseMat.color.clone();
  const roundEdge = lineMat(DARK.getHex(), 1.8, { opacity: 0.55 });
  const RS = 24, RR = ROUNDS.r;
  const turn = (g) => g.rotateZ(-Math.PI / 2); // the lathe's axis (y) along +x: the base at x 0
  const gBase = turn(lathe([[0, 0], [RR + 0.6, 0], [RR + 0.6, 1.6], [RR + 0.1, 2.3], [RR + 0.1, 5], [0, 5]], RS, { bevel: 0.35 }));
  const gCase = turn(lathe([[0, 5], [RR, 5], [RR, 61], [0, 61]], RS, { bevel: 0.3 }));
  const gNose = turn(lathe([[0, 61], [RR - 0.3, 61], [RR - 0.3, 65], [RR - 0.7, 66], [RR - 0.7, 80], [5.6, 84], [4.9, 88], [3.7, 92], [2.5, 95], [1.1, 97.3], [0, ROUNDS.length]], RS, { bevel: 0.3 }));
  const lists = { base: [], case: [], nose: [] };
  let grabbed = null;
  for (const rack of [1, -1]) {
    ROUNDS.cols.forEach((cz, ci) => {
      ROUNDS.rows.forEach((ry, ri) => {
        if (ROUNDS.empty.some(([r, c, w]) => r === rack && c === ci && w === ri)) return;
        const [gr, gc, gw] = ROUNDS.grab;
        if (rack === gr && ci === gc && ri === gw) {
          grabbed = new THREE.Group();
          grabbed.position.set(0, ry, rack * cz);
          grabbed.add(edged(gBase, baseMat, roundEdge, { pos: [ROUNDS.base, 0, 0] }), edged(gCase, caseMat, roundEdge, { pos: [ROUNDS.base, 0, 0] }), edged(gNose, noseMat, roundEdge, { pos: [ROUNDS.base, 0, 0] }));
          rounds.add(grabbed);
          return;
        }
        const at = { pos: [ROUNDS.base, ry, rack * cz] };
        lists.base.push(placed(gBase, at));
        lists.case.push(placed(gCase, at));
        lists.nose.push(placed(gNose, at));
      });
    });
  }
  rounds.add(edged(mergeGeometries(lists.base), baseMat, roundEdge), edged(mergeGeometries(lists.case), caseMat, roundEdge), edged(mergeGeometries(lists.nose), noseMat, roundEdge));
  const grabHome = grabbed.position.clone();
  root.add(rounds);

  /* ── the roof panel: the hero — the lightest, the thinnest ── */
  const panel = makePart("panel");
  const panelMat = fireLit(solid(0xb9bec2, { rough: 0.72, metal: 0.15, env: 0.12 })); // a big flat face mirrors the studio: little env
  panelMat.userData.finish = false; //                               the hero stays a clean plate (the grain read as marble)
  const panelEdge = lineMat(DARK.getHex(), 1.8, { opacity: 0.9 });
  const pGeo = morph(new THREE.BoxGeometry(PW, PT, PD, 14, 1, 28), (v, o) => {
    const X = v.x / (PW / 2), Z = v.z / (PD / 2);
    o.y = (1 - X * X) * (1 - Z * Z) * BULGE;
  });
  const panelMesh = edged(pGeo, panelMat, panelEdge, { outline: new THREE.BoxGeometry(PW, PT, PD) });
  panel.add(panelMesh);
  const boltMat = solid(0x4b5157, { rough: 0.5, metal: 0.4 });
  for (const [fx, fz] of PANEL.fasteners) panel.add(edged(cyl(2.4, 1.2, 0.25, 24), boltMat, panelEdge, { pos: [fx, PT / 2 + 0.6, fz] }));
  // the tab the rod is pinned to: from the panel's front edge, over the lip, to the rod's head
  const tabX = [ROD_X - 4, PANEL.x[0] + 7];
  panel.add(edged(box(tabX[1] - tabX[0], 2, 5.6, 0.4), panelMat, panelEdge, { pos: [(tabX[0] + tabX[1]) / 2, PT / 2 + 1, LZ] }));
  panel.position.set(0, PY, 0);
  root.add(panel);
  const snaps = PANEL.fasteners.map(([fx, fz]) => {
    const g = glint(INK.clone().multiplyScalar(2.2), INK.clone().multiplyScalar(0.5), 12);
    g.position.set(fx, Y1 + 1, fz);
    root.add(g);
    return g;
  });

  /* ── the doors, their guides and seals ── */
  const doors = makePart("doors");
  const leafMat = fireLit(solid(0x6c7378, { rough: 0.5, metal: 0.35 }));
  const leafEdge = lineMat(BRAND.ink, 2, { opacity: 0.75 });
  // the leaf bows between its guides: its free sides bend too (their curve is what reads), its top and bottom held
  const bowAt = (v, o) => {
    const Y = v.y / (L.h / 2), Z = v.z / (L.w / 2);
    o.x = -(1 - Y * Y) * (1 - 0.45 * Z * Z) * DOORS.bow;
  };
  const leafGeo = morph(new THREE.BoxGeometry(L.t, L.h, L.w, 1, 12, 16), bowAt);
  const ht = L.t / 2, hy = L.h / 2, hz = L.w / 2;
  const held = []; //                                               the 8 edges that stay put (no vertical ones)
  for (const sx of [-ht, ht]) for (const sy of [-hy, hy]) held.push(sx, sy, -hz, sx, sy, hz);
  for (const sy of [-hy, hy]) for (const sz of [-hz, hz]) held.push(-ht, sy, sz, ht, sy, sz);
  const leafLines = new LineSegmentsGeometry().setPositions(held);
  const sealMat = glow(BRAND.veille, 0, { additive: true });
  const sealInMat = glow(BRAND.veille, 0, { additive: true }); //   the loader's inner side: where it gives
  const leakMat = glow(BRAND.signal, 0, { additive: true });
  const FX = -ht - 1; //                                            the seal frame, just proud of the leaf's face
  const IN = 1.8, SW = 1.0;
  const bar = (len, alongZ, x, y, z) => (alongZ ? new THREE.BoxGeometry(0.5, SW, len, 1, 1, 16) : new THREE.BoxGeometry(0.5, len, SW, 1, 12, 1)).translate(x, y, z);
  const SIDE = hz - IN - SW / 2;
  const bent = []; //                                               everything on a leaf that bows with it
  const leaves = O.z.map((zc, i) => {
    const leaf = edged(leafGeo, leafMat, null, { pos: [(L.x[0] + L.x[1]) / 2, O.y, zc] });
    const lines = new LineSegments2(leafLines, leafEdge);
    lines.renderOrder = 2;
    leaf.add(lines);
    leaf.userData.home = leaf.position.clone();
    const inner = zc > 0 ? -1 : 1; //                               the side toward the middle pillar, local z sign
    const frame = morph(mergeGeometries([
      bar(L.w - 2 * IN, true, FX, hy - IN - SW / 2, 0),
      bar(L.w - 2 * IN, true, FX, -hy + IN + SW / 2, 0),
      bar(L.h - 2 * IN, false, FX, 0, -inner * SIDE),
      ...(i === 0 ? [] : [bar(L.h - 2 * IN, false, FX, 0, inner * SIDE)]),
    ]), bowAt);
    const f = new THREE.Mesh(frame, sealMat);
    f.renderOrder = 3;
    leaf.add(f);
    bent.push([leaf, f]);
    doors.add(leaf);
    return leaf;
  });
  const [loader, other] = leaves;
  const sealIn = new THREE.Mesh(morph(bar(L.h - 2 * IN, false, FX, 0, -SIDE), bowAt), sealInMat);
  sealIn.renderOrder = 3;
  const leakStrip = new THREE.Mesh(morph(new THREE.BoxGeometry(0.6, L.h - 6, 2.4, 1, 12, 1).translate(FX - 0.2, 0, -(hz - 0.8)), bowAt), leakMat);
  leakStrip.renderOrder = 3;
  bent.push([loader, sealIn], [loader, leakStrip]);
  const tongue = makeFlames([{ c: [0, 0, 0], w: 11, h: 26, ph: 0.3, sp: 1.1 }]);
  tongue.mesh.position.set(-ht - 3, 2, -hz + 0.5);
  tongue.uniforms.uSig.value.multiplyScalar(1.2);
  loader.add(sealIn, leakStrip, tongue.mesh);
  // a recessed grip on the loader's door
  loader.add(edged(box(2.4, 14, 3.2, 0.4), solid(0x4a5056, { rough: 0.55, metal: 0.35 }), leafEdge, { pos: [-L.t / 2 - 1.2, 0, hz - 8] }));
  const railMat = solid(0x565d64, { rough: 0.5, metal: 0.38 });
  for (const ry of DOORS.rails.y) slab(doors, railMat, leafEdge, [L.x[0] - 2, L.x[1]], [ry - 2, ry + 2], RAIL_Z, 0.5);
  root.add(doors);

  /* ── the lock: brackets on the lower guide, the axle, the egg-shaped cam and its crank, the fork, the rod, the pin ── */
  const lock = makePart("lock");
  const camMat = solid(0xb2b7bb, { rough: 0.3, metal: 0.35, coat: 0.35 });
  const rodMat = solid(0x9ca2a7, { rough: 0.34, metal: 0.45 });
  const darkMat = solid(0x50575e, { rough: 0.5, metal: 0.38 });
  const pinMat = solid(0xdfe2e5, { rough: 0.3, metal: 0.3 });
  const lockEdge = lineMat(DARK.getHex(), 1.8, { opacity: 0.8 });
  const lockEdgeInk = lineMat(BRAND.ink, 2, { opacity: 0.7 });
  // two brackets standing on the lower guide hold the axle in front of the leaves
  const yR = DOORS.rails.y[0];
  const bracket = [[L.x[0] - 2, yR - 2], [L.x[0] - 2, yR + 2], [AXLE[0] + 2.4, yR + 2], [AXLE[0] + 2.4, AXLE[1] + 2.4], [AXLE[0] + 1.2, AXLE[1] + 3.6], [AXLE[0] - 1.2, AXLE[1] + 3.6], [AXLE[0] - 2.4, AXLE[1] + 2.4], [AXLE[0] - 2.4, yR - 2]];
  const ZB = -LZ + 3.1;
  for (const zb of [ZB, -ZB - 1.6]) lock.add(edged(plate(bracket, 1.6, { bevel: 0.3 }), darkMat, lockEdgeInk, { pos: [0, 0, zb] }));
  const axle = edged(cyl(1.3, 2 * (ZB + 1.4), 0.2, 24).rotateX(Math.PI / 2), darkMat, lockEdgeInk, { pos: AXLE });
  lock.add(axle);
  const pivot = new THREE.Group();
  pivot.position.set(...AXLE);
  lock.add(pivot);
  // the egg: a disc with an egg's profile, narrow end up at rest, its fat end round the axle; rounded all over
  const egg = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    egg.push([(EGG.half * Math.cos(t) * (1 - 0.18 * Math.sin(t))) / 1.016, (EGG.len / 2) * Math.sin(t) + EGG.axle]);
  }
  // smooth across the outline's facets (an extrusion is shaded flat per facet: bands on the egg in close-up)
  const eggGeo = toCreasedNormals(plate(egg, EGG.thick, { bevel: 3.6, round: 4, curveSegments: 48 }).translate(0, 0, -EGG.thick / 2), 50 * DEG);
  const cam = new THREE.Mesh(eggGeo, camMat);
  cam.castShadow = cam.receiveShadow = true;
  const camRim = new THREE.Mesh(eggGeo, glass(BRAND.veille, { base: 0, rim: 0.9, power: 2.2, edge: 0.6 }));
  camRim.scale.setScalar(1.04);
  camRim.material.uniforms.uAmount.value = 0;
  camRim.renderOrder = 8;
  camRim.visible = false;
  pivot.add(cam, camRim);
  // the crank on the axle, past the egg's tip, and its pin
  const crank = new THREE.Group();
  crank.rotation.z = PHI0;
  crank.position.z = LZ;
  crank.add(edged(box(RL + 4, 3.8, 1.6, 0.35), rodMat, lockEdge, { pos: [RL / 2, 0, 0] }));
  crank.add(edged(cyl(2.8, 2, 0.25, 24).rotateX(Math.PI / 2), rodMat, lockEdge));
  crank.add(edged(cyl(0.9, 4.6, 0.15, 16).rotateX(Math.PI / 2), pinMat, lockEdge, { pos: [RL, 0, 0] }));
  pivot.add(crank);
  // the rod and everything that rides on it: the fork at its foot (the crank pin slides in its slot), the clevis and
  // the shear pin at its head, where the panel's tab is held
  const rodG = new THREE.Group();
  for (const dz of [-1.9, 1.9]) rodG.add(edged(box(7.4, 3.8, 0.8, 0.2), rodMat, lockEdge, { pos: [ROD_X, YB0, LZ + dz] }));
  rodG.add(edged(box(5.8, 1.8, 0.3, 0.05), darkMat, null, { pos: [ROD_X, YB0, LZ + 2.35], shadow: false })); // the slot
  rodG.add(edged(box(7.4, 1.4, 4.6, 0.25), rodMat, lockEdge, { pos: [ROD_X, YB0 + 2.6, LZ] }));
  const rodLen = CLEVIS - 3 - (YB0 + 3.3);
  rodG.add(edged(cyl(ROD.r, rodLen, 0.15, 20), rodMat, lockEdge, { pos: [ROD_X, YB0 + 3.3 + rodLen / 2, LZ] }));
  rodG.add(edged(box(6, 1.6, 8.4, 0.25), rodMat, lockEdge, { pos: [ROD_X, CLEVIS - 2.2, LZ] }));
  for (const dz of [-3.6, 3.6]) rodG.add(edged(box(6, 6, 1, 0.25), rodMat, lockEdge, { pos: [ROD_X, CLEVIS + 0.8, LZ + dz] }));
  const shear = edged(cyl(0.9, 9.4, 0.15, 16).rotateX(Math.PI / 2), pinMat, lockEdge, { pos: [ROD_X, CLEVIS + 0.4, LZ] });
  rodG.add(shear);
  const shearSnap = glint(INK.clone().multiplyScalar(2.4), INK.clone().multiplyScalar(0.6), 14);
  shearSnap.position.set(ROD_X, CLEVIS + 0.4, LZ);
  rodG.add(shearSnap);
  lock.add(rodG);
  root.add(lock);

  /* ── the pressure arrows: one per face (tip on its face), one to the roof, one to the loader's door ── */
  const LEN = 34;
  // born in this order: floor, rear, far side, bulkhead, near side — and the roof last, the face that will give
  const FACES = [
    [[0, 7, 0], [0, -1, 0]], [[54 - LEN, 0, 0], [1, 0, 0]], [[0, 0, -(124 - LEN)], [0, 0, -1]],
    [[-(54 - LEN), 0, 0], [-1, 0, 0]], [[0, 0, 124 - LEN], [0, 0, 1]], [[0, -7, 0], [0, 1, 0]],
  ];
  const VENT = [[-30, 34, -60], [30, 34, -60], [-30, 34, 60], [30, 34, 60], [0, 34, -20], [0, 34, 20]];
  const faces = FACES.map(([p, d]) => {
    const a = aim(arrow(LEN, 3.4, 8.5, 12), p, d);
    root.add(a);
    return a;
  });
  const toRoof = aim(arrow(49, 5, 12.5, 18), [0, -22, 0], [0, 1, 0]);
  const toDoor = aim(arrow(95, 5, 12.5, 18), [B1 + 47, O.y, O.z[0]], [-1, 0, 0]);
  root.add(toRoof, toDoor);
  const tmpV = new THREE.Vector3();

  /* ── the bench's counter-example: a closed block of the same thick steel, that swells and splits everywhere ── */
  const block = makePart("block");
  const [BX, BY, BZ] = BLOCK.size;
  const SWELL = 6.5;
  const pillow = (X, Y, Z) => [X * (1 - Y * Y) * (1 - Z * Z), Y * (1 - X * X) * (1 - Z * Z), Z * (1 - X * X) * (1 - Y * Y)];
  const blockGeo = morph(new THREE.BoxGeometry(BX, BY, BZ, 10, 8, 10), (v, o) => {
    const p = pillow((2 * v.x) / BX, (2 * v.y) / BY, (2 * v.z) / BZ);
    o.set(p[0] * SWELL, p[1] * SWELL, p[2] * SWELL);
  });
  const blockMat = solid(0x3a4046, { rough: 0.62, metal: 0.3, opacity: 0.999 });
  const blockEdge = lineMat(BRAND.ink, 2, { opacity: 0.7 });
  block.add(edged(blockGeo, blockMat, blockEdge, { outline: new THREE.BoxGeometry(BX, BY, BZ) }));
  // the cracks: jagged lines from near the middle of each face toward its edges, drawn step by step (all at once)
  const CR = rng(17);
  const cracks = [];
  const H = [BX / 2, BY / 2, BZ / 2];
  for (let axis = 0; axis < 3; axis++) {
    for (const sign of [1, -1]) {
      const b = (axis + 1) % 3, c = (axis + 2) % 3;
      for (let k = 0; k < 3; k++) {
        let u = (CR() - 0.5) * 0.5, w = (CR() - 0.5) * 0.5;
        const head = CR() * Math.PI * 2 + (k * Math.PI * 2) / 3;
        const pts = [];
        for (let s = 0; s < 8; s++) {
          const q = [0, 0, 0];
          q[b] = u;
          q[c] = w;
          q[axis] = sign;
          const sw = pillow(q[0], q[1], q[2]);
          const p = [0, 0, 0];
          p[axis] = sign * (H[axis] + Math.abs(sw[axis]) * SWELL + 0.6);
          p[b] = u * H[b] + sw[b] * SWELL;
          p[c] = w * H[c] + sw[c] * SWELL;
          pts.push(p);
          const turnA = head + (CR() - 0.5) * 1.3;
          const step = 0.13 + CR() * 0.06;
          u = Math.max(-0.97, Math.min(0.97, u + Math.cos(turnA) * step));
          w = Math.max(-0.97, Math.min(0.97, w + Math.sin(turnA) * step));
        }
        cracks.push(pts);
      }
    }
  }
  const crackPos = [];
  for (let s = 0; s < 7; s++) for (const pts of cracks) crackPos.push(...pts[s], ...pts[s + 1]);
  const crackGeo = new LineSegmentsGeometry().setPositions(crackPos);
  const crackMat = lineMat(BRAND.signal, 5, { opacity: 0, hdr: 2.6 });
  const crackLines = new LineSegments2(crackGeo, crackMat);
  crackLines.renderOrder = 3;
  crackLines.visible = false;
  const CRACK_N = crackPos.length / 6;
  block.add(crackLines);
  block.position.set(BLOCK.at[0], BENCH.floor + BY / 2, BLOCK.at[2]);
  root.add(block);
  const blockMesh = block.children[0];

  const parts = { box: boxPart, rounds, panel, doors, lock, block };
  const A = {
    caisson: anchor(root, 0, 0, 0),
    panel: anchor(panel, 0, PT / 2, 0),
    doors: anchor(doors, L.x[0], O.y, 0),
    door: anchor(doors, L.x[0], O.y, O.z[0]), //  the loader's
    cam: anchor(lock, ...AXLE),
    rod: anchor(rodG, ROD_X, (YB0 + CLEVIS) / 2, LZ),
    grab: anchor(grabbed, ROUNDS.base, 0, 0), //  the base of the round the loader takes
    block: anchor(block, 0, 0, 0),
  };

  /** The edges and a faint veille on the part the voice names. */
  const lit = (edge, base, opacity, v) => {
    edge.color.copy(base).lerp(VEILLE_LIT, v);
    edge.opacity = opacity + (1 - opacity) * v;
  };
  const tint = (mat, v) => mat.emissive.copy(VEILLE).multiplyScalar(0.12 * v);
  const leafHome = [loader.userData.home, other.userData.home];

  return {
    root, parts, A,
    /** Every frame, sixteen times: depends on P and time only, allocates nothing. */
    update(P, time, px) {
      const k = P.explode;

      /* the burning: one case, then the inside, then every seam */
      const burn = P.burn;
      const ign = ramp(burn, 0.1, 0.22);
      const flame = smooth(ramp(burn, 0.32, 0.66));
      const heat = ramp(burn, 0.55, 1);
      const flick = 0.92 + 0.05 * Math.sin(time * 1.7) + 0.03 * Math.sin(time * 2.9 + 1.1);
      FIRE.uFireK.value = 2.4 * (0.35 * ign * (1 - flame) + flame) * flick;
      FIRE.uFireP.value[0].set(0, -6, 0);
      FIRE.uFireR.value[0] = 210 * flame;
      FIRE.uFireP.value[1].set(IGNITE[0] * (1 - flame), -4 * flame, IGNITE[2] + (122 - IGNITE[2]) * flame);
      FIRE.uFireR.value[1] = 45 + 75 * flame;
      ignite.visible = ign > 0.002;
      ignite.material.uniforms.uAmount.value = ign * (1 - flame) * flick;
      flames.mesh.visible = embers.points.visible = flame > 0.002;
      flames.uniforms.uT.value = embers.uniforms.uT.value = time;
      flames.uniforms.uAmount.value = flame * (0.75 + 0.25 * heat);
      embers.uniforms.uAmount.value = flame;
      embers.uniforms.uScale.value = px;
      boxEdge.color.copy(INK).lerp(SIGNAL_LIT, heat);
      boxEdge.opacity = 0.7 + 0.25 * heat;
      boxMat.emissive.copy(SIGNAL).multiplyScalar(0.03 * heat);
      lit(boxEdge, boxEdge.color, boxEdge.opacity, P.litBox);
      tint(lipMat, P.litBox);

      /* the exploded view */
      const ep = spread(k, WINDOW.panel), er = spread(k, WINDOW.rounds), ed = spread(k, WINDOW.doors), el = spread(k, WINDOW.lock);
      rounds.position.set(SPREAD.rounds[0] * er, 0, 0);
      doors.position.set(SPREAD.doors[0] * ed, 0, 0);
      lock.position.set(SPREAD.lock[0] * el, SPREAD.lock[1] * el, SPREAD.lock[2] * el);

      /* section: the near wall turns to glass, never gone */
      const sec = P.section;
      fade(nearMat, 1 - sec);
      near.children[0].visible = near.children[1].visible = sec < 0.995;
      ghost.visible = sec > 0.002;
      ghost.material.uniforms.uAmount.value = 0.9 * sec;
      ghostEdge.opacity = 0.6 * sec;

      /* the rounds: dimmed while the arrows speak; the loader's comes out toward him */
      const dim = 1 - 0.6 * P.press;
      caseMat.color.copy(CASE_C).multiplyScalar(dim);
      baseMat.color.copy(BASE_C).multiplyScalar(dim);
      noseMat.color.copy(NOSE_C).multiplyScalar(dim);
      grabbed.position.copy(grabHome);
      grabbed.position.x -= ROUNDS.pull * smooth(P.grab);

      /* the panel: bulge, then let go, tilt, fly, tumble */
      const b = P.blow;
      const up = lift(b);
      const tilt = 12 * DEG * smooth(ramp(b, 0.05, 0.15));
      const tumble = (240 * DEG) * Math.pow(ramp(b, 0.15, 1), 1.2);
      const drift = Math.pow(ramp(b, 0.1, 1), 1.3);
      panel.position.set(PANEL.flight.drift[0] * drift, PY + SPREAD.panel[1] * ep + up, PANEL.flight.drift[2] * drift);
      panel.rotation.set(tilt * 0.4 + tumble * 0.35, 0, -tilt - tumble);
      panelMesh.morphTargetInfluences[0] = P.bulge;
      tint(panelMat, P.litPanel);
      lit(panelEdge, DARK, 0.9, P.litPanel);
      // the slit of light under it, and through the seam once everything glows
      const gap = up + SPREAD.panel[1] * ep;
      const open = ramp(gap, 0.3, 3) * (1 - ramp(b, 0.12, 0.2));
      const slitK = (0.35 * flame + 0.65 * heat) * Math.max(open, 0.5 * heat * (1 - ramp(gap, 3, 6)));
      setGlow(slitMat, 2 * slitK * flick);
      const slitH = Math.max(0.5, Math.min(gap, 3));
      for (let i = 0; i < 4; i++) {
        slits[i].visible = slitK > 0.002;
        slits[i].scale.y = slitH;
      }
      const snapK = bump(b, 0.015, 0.04, 0.09);
      for (let i = 0; i < 4; i++) {
        snaps[i].visible = snapK > 0.002;
        snaps[i].material.uniforms.uAmount.value = snapK;
      }
      bedGlow.visible = flame > 0.002;
      bedGlow.material.uniforms.uAmount.value = flame * flick;
      holeGlow.visible = flame > 0.002 && b > 0.04;
      holeGlow.material.uniforms.uAmount.value = flame * ramp(b, 0.04, 0.12) * flick;
      weakLine.visible = P.weak > 0.002;
      weakMat.opacity = P.weak;

      /* the doors: the loader's slides, both bow, the cam presses them home at the end of `lock` */
      const l = P.lock;
      const press = ramp(l, 0.88, 1);
      loader.position.copy(leafHome[0]);
      loader.position.z += DOORS.slide * P.door;
      loader.position.x += 0.5 * press;
      other.position.copy(leafHome[1]);
      other.position.x += 0.5 * press;
      for (let i = 0; i < bent.length; i++) {
        const w = bent[i][0] === loader ? P.bow : 0.9 * P.bow;
        bent[i][0].morphTargetInfluences[0] = w;
        bent[i][1].morphTargetInfluences[0] = w;
      }
      const sealK = 0.85 * P.seal * (1 + 0.6 * press);
      setGlow(sealMat, sealK);
      setGlow(sealInMat, sealK * (1 - P.leak));
      setGlow(leakMat, 2.6 * P.leak);
      leakStrip.visible = P.leak > 0.002;
      tongue.mesh.visible = P.leak > 0.002;
      tongue.uniforms.uT.value = time;
      tongue.uniforms.uAmount.value = P.leak * flick;
      doorGlow.visible = (ign > 0 || flame > 0) && P.door > 0.002;
      doorGlow.material.uniforms.uAmount.value = (0.4 * ign + flame) * flick;
      tint(leafMat, P.litDoors);
      lit(leafEdge, INK, 0.75, P.litDoors);

      /* the lock: the rod rises and, through the crank, turns the cam (they are linked: 10 cm → 80°) */
      const rise = ROD.travel * smooth(ramp(l, 0, 0.9));
      const phi = Math.PI - Math.asin(Math.min(1, S0 + rise / RL));
      pivot.rotation.z = -(PHI0 - phi);
      rodG.position.y = rise;
      shear.visible = l < 0.97;
      const snap = bump(l, 0.92, 0.965, 1);
      shearSnap.visible = snap > 0.002;
      shearSnap.material.uniforms.uAmount.value = snap;
      tint(camMat, P.litCam);
      camRim.visible = P.litCam > 0.002;
      camRim.material.uniforms.uAmount.value = 0.8 * P.litCam;
      lit(lockEdge, DARK, 0.8, P.litCam);

      /* the arrows: face by face (0 → 0.6), then all full; to the roof; to the door; and out through the opening */
      const v = P.vent * ramp(b, 0.035, 0.06);
      const sv = smooth(ramp(v, 0, 0.7)), rv = ramp(v, 0.3, 1);
      const full = smooth(ramp(P.press, 0.6, 1));
      for (let i = 0; i < 6; i++) {
        const a = faces[i];
        const s = settle(ramp(P.press, i * 0.1, i * 0.1 + 0.1)) * (0.8 + 0.2 * full);
        a.visible = s > 0.002;
        a.scale.setScalar(Math.max(0.001, s));
        a.quaternion.slerpQuaternions(a.userData.q0, qUp, sv);
        tmpV.set(VENT[i][0], VENT[i][1] + 60 * rv, VENT[i][2]);
        a.position.copy(a.userData.home).lerp(tmpV, sv);
      }
      const sr = Math.max(P.arrowRoof, v);
      toRoof.visible = sr > 0.002;
      toRoof.scale.setScalar(Math.max(0.001, settle(clamp01(sr))));
      toRoof.position.copy(toRoof.userData.home);
      toRoof.position.y += 70 * rv;
      toDoor.visible = P.arrowDoor > 0.002;
      toDoor.scale.set(1, Math.max(0.001, smooth(P.arrowDoor)), 1);
      setGlow(ARROW_MAT, 1.5 + 0.4 * full);

      /* the like's block: it swells first, then splits on every face, the light through each crack */
      block.visible = P.block > 0.002;
      fade(blockMat, P.block);
      blockEdge.opacity = 0.7 * P.block;
      const swell = smooth(ramp(P.crack, 0, 0.45));
      blockMesh.morphTargetInfluences[0] = swell;
      block.scale.setScalar(1 + 0.03 * swell);
      const cr = ramp(P.crack, 0.35, 0.95);
      crackLines.visible = cr > 0.001 && P.block > 0.002;
      crackGeo.instanceCount = Math.max(1, Math.ceil(CRACK_N * cr));
      crackMat.opacity = ramp(P.crack, 0.3, 0.42) * P.block;
    },
  };
}
