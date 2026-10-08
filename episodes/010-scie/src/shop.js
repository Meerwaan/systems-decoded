// DOSSIER 010 — Scie sur table : the shop — a cabinet saw seen like an X-ray, the board on its table, and you.
//
// Everything that is the saw is glass and fine ink lines (the cabinet, the cast-iron top with its two mitre
// slots and its throat plate, the fence on its rail, the handwheel, the paddle switch; inside, a shell of its
// own, the motor and its belt). Solid, the only things the story is about: the board — pale wood, its growth
// rings drawn in the shader — and your two hands. The rest of you is glass, like the shop far behind.
//
//   buildShop() → { group, A, update(p, time, px) }
//   p = { shell, table, you, feed, slip, circuit, harm, flinch, nick, dust, drop, blur }   (see FIRST in world.js)
//
// Not drawn here: the blade, its arbor block, the cartridge (model.js). Their room is kept free: nothing of
// ours stands within 8 cm of the blade's plane between the pivot and the front of the blade.
//
// Where the plan is bent (see docs/journal/010-shop.md): the board's leading edge is at z = LEAD − feed, so
// that its end stands in front of you and not behind; YOU is where your FEET are — the hips are 12 cm nearer
// the table, the trunk leans over it: an arm is 57 cm long.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { makeContact, makeMotes } from "@kit/atmo.js";
import { solid, glow, setGlow, glass, asShell, lineMat, edgesOf, box, cyl, placed, anchor, mergeGeometries } from "@kit/build3d.js";
import { TABLE, CABINET, THROAT, BLADE, ARBOR, BOARD, FENCE, YOU, TOUCH } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.8, 0.55); // an ember when it is born
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const ONE = V(1, 1, 1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const BOARD_TOP = TABLE.y + BOARD.thick;
const KERF = BLADE.kerf + 0.1; // the slot the blade leaves: a hair wider than its teeth
/** Where the kerf ends: just in front of where the teeth come down through the top of the board. */
const Z_FRONT = Math.sqrt(BLADE.r ** 2 - (BOARD_TOP - BLADE.y) ** 2) + 0.3;
/** The board's leading edge when `feed` is 0. */
const LEAD = -40;
/** Your hips (the figure's own origin): nearer the table than your feet, a little lower than standing straight. */
const HIPS = { x: YOU.x, y: -3, z: YOU.z - 12 };
const LEAN = { pitch: 26, turn: -14 }; // over the table, the left shoulder forward
/** How the left hand lies: its fingers point forward and a little toward the blade; it slides along APPROACH. */
const YAW = 18 * DEG;
const APPROACH = V(0.3, 0, -0.954).normalize();
/** A flat hand's own origin (its wrist) stands this far above what it lies on. */
const REST = 1.45;

/* ───────────────────────────────────────────────────────────── small makers */

/** A round bar from `a` to `b`. */
function bar(a, b, r, r2 = r, radial = 12) {
  const va = V(...a);
  const vb = V(...b);
  const q = new THREE.Quaternion().setFromUnitVectors(UP, vb.clone().sub(va).normalize());
  return new THREE.CylinderGeometry(r2, r, va.distanceTo(vb), radial, 1).applyMatrix4(new THREE.Matrix4().compose(va.clone().add(vb).multiplyScalar(0.5), q, ONE));
}
/** Position and normal only, not indexed: what every piece is reduced to before the pieces of one material are merged. */
function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  return o;
}
/** A circle (or an arc) of radius `r` round `c`, in the plane across `axis`. */
function arc(c, r, axis, from = 0, to = Math.PI * 2, n = 48) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = from + ((to - from) * i) / n;
    const u = Math.cos(t) * r;
    const v = Math.sin(t) * r;
    pts.push(axis === "x" ? [c[0], c[1] + v, c[2] + u] : axis === "y" ? [c[0] + u, c[1], c[2] + v] : [c[0] + u, c[1] + v, c[2]]);
  }
  return pts;
}
/** A slot with round ends lying on the table, along z: `hw` half its width, `hl` half its length. Closed. */
function stadium(hw, hl, y, n = 12) {
  const pts = [];
  const c = hl - hw;
  for (let i = 0; i <= n; i++) pts.push([hw * Math.cos((Math.PI * i) / n), y, -c - hw * Math.sin((Math.PI * i) / n)]);
  for (let i = 0; i <= n; i++) pts.push([-hw * Math.cos((Math.PI * i) / n), y, c + hw * Math.sin((Math.PI * i) / n)]);
  return pts;
}

/** A light that has a place: a ball with no edge, a bright core and a long tail. Seen through everything. */
function halo(core = 9) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uCore: { value: core } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uCore; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0); // clamp before pow
        gl_FragColor = vec4(uColor * (0.72 * pow(f, uCore) + 0.28 * f * f), 1.0);
      }`,
  });
}
const BALL = new THREE.SphereGeometry(1, 32, 20);
function makeHalo(parent, core) {
  const mesh = new THREE.Mesh(BALL, halo(core));
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  mesh.visible = false;
  parent.add(mesh);
  /** `k`: how bright (0: gone), `across`: its radius in cm. */
  const set = (p, colour, k, across) => {
    mesh.visible = k > 0.004;
    if (!mesh.visible) return;
    mesh.position.copy(p);
    mesh.scale.setScalar(across);
    mesh.material.uniforms.uColor.value.copy(colour).multiplyScalar(k);
  };
  return { mesh, set };
}

/**
 * Pale wood. One log, its axis running along the board a little askew, its heart under the board: the same
 * rings give long arches on the face, lines on the edges, arcs on the end grain. A ring is never thinner
 * than a pixel and a half: it spreads instead, with the same light, into an even tone.
 */
function woodMaterial(uniforms) {
  const mat = new THREE.MeshStandardMaterial({ color: INK.clone().multiplyScalar(0.24), roughness: 0.8, metalness: 0, envMapIntensity: 0.45, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uLead; varying vec3 vWood;")
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n{ vec4 wp = modelMatrix * vec4(position, 1.0); vWood = vec3(wp.x, wp.y - ${TABLE.y.toFixed(2)}, wp.z - uLead); }`);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        varying vec3 vWood;
        float woodTone(vec3 p) {
          vec2 heart = vec2(5.0 + 0.05 * p.z + 1.4 * sin(p.z * 0.023 + 1.0), -7.0 + 0.04 * p.z);
          float r = length(vec2(p.x, p.y) - heart);
          r += 0.2 * sin(p.z * 0.09 + r * 0.8) + 0.07 * sin(p.z * 0.37 + p.x * 0.9);
          float q = r / 0.66;
          float w = max(fwidth(q) * 1.5, 0.085);
          float line = (0.085 / w) * (1.0 - smoothstep(0.0, w, abs(fract(q - 0.5) - 0.5)));
          float small = clamp(fwidth(q) * 2.0, 0.0, 1.0); // 1: a ring is under two pixels — only the tone is left
          float late = mix(smoothstep(0.35, 1.0, fract(q)), 0.35, small);
          return 1.0 - 0.5 * line - 0.2 * late;
        }`,
      )
      // (the walls of the kerf stand in their own shadow: the slot is a dark line whatever side it is seen from)
      .replace("#include <color_fragment>", `#include <color_fragment>\ndiffuseColor.rgb *= woodTone(vWood) * mix(1.0, 0.1, step(abs(vWood.x), ${(KERF / 2 + 0.01).toFixed(3)}) * step(vWood.y, ${(BOARD.thick - 0.02).toFixed(2)}));`);
  };
  return mat;
}

/** The floor of a set seen like an X-ray: no slab, a grid that fades away from the saw, and a faint pool of light under it. */
function makeFloor() {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(900, 72),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 0.1 }, uPool: { value: 0.05 } },
      vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount, uPool; varying vec2 vP;
        float lines(float x, float cell) {
          float q = x / cell;
          float w = max(fwidth(q) * 1.5, 1e-5);
          return 1.0 - smoothstep(0.0, w, abs(fract(q - 0.5) - 0.5));
        }
        void main() {
          float g = max(lines(vP.x, 25.0), lines(vP.y, 25.0)) * 0.4 + max(lines(vP.x, 100.0), lines(vP.y, 100.0));
          float r = length(vP);
          float n = clamp(1.0 - r / 300.0, 0.0, 1.0);
          gl_FragColor = vec4(uColor * (g * exp(-r / 250.0) * uAmount + uPool * (0.7 * n * n * n + 0.3 * n)), 1.0);
        }`,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.02;
  return mesh;
}

/**
 * The sawdust the blade throws off its top, toward you: every chip is born again each period — the whole
 * spray is a pure function of time, alive on the first frame — flies slowly (the film runs at a crawl), lands
 * on the board and lies there until it fades. Drawn as the streak it travels in one frame.
 */
function makeDust({ count = 210, seed = 21 } = {}) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // phase, life (s), size (cm), level
  for (let i = 0; i < count; i++) {
    const th = (-12 + rand() * 50) * DEG; // from the top of the blade toward its front
    const speed = 6 + rand() * 15;
    pos.set([(rand() - 0.5) * 0.5, BLADE.y + (BLADE.r + 0.25) * Math.cos(th), BLADE.z + (BLADE.r + 0.25) * Math.sin(th)], i * 3);
    vel.set([(rand() - 0.5) * 5 - 0.6, -Math.sin(th) * speed * 0.5 + 2 + rand() * 6, Math.cos(th) * speed], i * 3);
    seeds.set([rand(), 1.7 + rand() * 1.9, 0.08 + Math.pow(rand(), 2) * 0.22, 0.45 + rand() * 0.55], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aVel", new THREE.BufferAttribute(vel, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = {
    uT: { value: 0 }, uScale: { value: 1600 }, uAmount: { value: 0 }, uStreak: { value: 0.05 }, uFloor: { value: BOARD_TOP + 0.06 },
    uColor: { value: INK.clone().multiplyScalar(2.1) }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale, uAmount, uStreak, uFloor; uniform vec2 uView;
        attribute vec3 aVel; attribute vec4 aSeed;
        varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
        const float G = 11.0;
        vec3 chipAt(float s) {
          float h = max(position.y - uFloor, 0.0);
          float land = (aVel.y + sqrt(aVel.y * aVel.y + 2.0 * G * h)) / G; // when it meets the board
          float u = min(s, land);
          return position + aVel * u - vec3(0.0, 0.5 * G * u * u, 0.0);
        }
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          float s = age * aSeed.y;
          vec4 mv = modelViewMatrix * vec4(chipAt(s), 1.0);
          vec4 c0 = projectionMatrix * mv;
          vec4 c1 = projectionMatrix * modelViewMatrix * vec4(chipAt(max(0.0, s - uStreak)), 1.0);
          vec2 run = c1.w > 0.0 && c0.w > 0.0 ? (c0.xy / c0.w - c1.xy / c1.w) * 0.5 * uView : vec2(0.0);
          float len = min(length(run), 90.0);
          float size = max(aSeed.z * uScale / max(0.5, -mv.z), 1.8);
          gl_PointSize = size + len;
          gl_Position = c0;
          gl_Position.xy -= (len > 0.5 ? normalize(run) * len : vec2(0.0)) / uView * c0.w; // centred on its path
          vDir = len > 0.5 ? normalize(run) : vec2(1.0, 0.0);
          vDot = size / (size + len);
          vHalf = 0.5 * (1.0 - vDot);
          vA = aSeed.w * smoothstep(0.0, 0.05, age) * (1.0 - smoothstep(0.62, 1.0, age)) * uAmount * sqrt(vDot);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
        void main() {
          if (vA < 0.003) discard;
          vec2 q = gl_PointCoord - 0.5;
          q.y = -q.y; // point coordinates run downward
          float along = max(abs(dot(q, vDir)) - vHalf, 0.0);
          float across = dot(q, vec2(-vDir.y, vDir.x));
          float d = length(vec2(along, across)) / (0.5 * vDot);
          float a = pow(max(0.0, 1.0 - d), 1.6);
          gl_FragColor = vec4(uColor * a * vA, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 6;
  return { points, uniforms };
}

/** What an ordinary saw would leave: embers drifting from the fingertip, slowly — born again each period, a pure function of time. */
function makeEmbers({ count = 42, seed = 6 } = {}) {
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4); // phase, period (s), size (cm), heading
  for (let i = 0; i < count; i++) seeds.set([rand(), 2.4 + rand() * 2.4, 0.22 + Math.pow(rand(), 2) * 0.6, rand() * Math.PI * 2], i * 4);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uScale: { value: 1600 }, uAmount: { value: 0 }, uOrigin: { value: V(0, 0, 0) }, uHot: { value: HOT.clone().multiplyScalar(3.2) }, uCool: { value: SIGNAL.clone().multiplyScalar(2.4) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale; uniform vec3 uOrigin; attribute vec4 aSeed; varying float vAge;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          vAge = age;
          float out_ = 0.8 + 9.0 * age * (0.5 + fract(aSeed.x * 7.3));
          vec3 p = uOrigin + vec3(cos(aSeed.w) * out_ * 0.7 - 2.0 * age, 7.0 * age - 19.0 * age * age, sin(aSeed.w) * out_ * 0.7 + 8.0 * age);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aSeed.z * uScale / max(1.0, -mv.z), 2.2, 46.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; uniform float uAmount; varying float vAge;
        void main() {
          if (uAmount < 0.003) discard;
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(clamp(1.0 - d, 0.0, 1.0), 1.6) * sin(3.14159 * vAge) * uAmount;
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.0, 0.6, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 7;
  return { points, uniforms };
}

/* ───────────────────────────────────────────────────────────── a hand one can pose finger by finger */

// how a hand lies: three bends per finger (radians, forefinger first), how far each fans toward the thumb,
// and the thumb's three bones — `spread`: away from the hand, `drop`: toward the palm
const FLAT = {
  bend: [[0.05, 0.1, 0.1], [0.05, 0.1, 0.08], [0.05, 0.1, 0.09], [0.07, 0.14, 0.12]],
  fan: [4, 0, -4, -10].map((d) => d * DEG),
  spread: [32, 16, 8].map((d) => d * DEG),
  drop: [-0.2, 0, 0.03],
};
// pulled back: half closed, the forefinger the least — it is the one you look at
const CURL = {
  bend: [[0.28, 0.42, 0.3], [0.55, 0.8, 0.5], [0.62, 0.86, 0.55], [0.68, 0.9, 0.6]],
  fan: [2, 0, -2, -5].map((d) => d * DEG),
  spread: [40, 24, 14].map((d) => d * DEG),
  drop: [0.25, 0.3, 0.25],
};

/**
 * The kit's real hand (a palm, a ball of the thumb, four fingers and a thumb of three bones each), taken
 * over: `pose` lays every bone, and the hand tells where its forefinger's joints and tip are. With what a
 * hand seen from close asks for: nails, and knuckles on its back.
 */
function rigHand(hand, flesh, nailMat, creaseMat) {
  const m = hand.meshes; // the palm, the ball of the thumb, 4 × 3 finger bones, 3 thumb bones
  const lengthOf = (mesh) => mesh.geometry.parameters.height ?? mesh.geometry.parameters.length;
  const chain = (bones) => {
    const dir = UP.clone().applyQuaternion(bones[0].quaternion);
    return { bones, root: bones[0].position.clone().addScaledVector(dir, -lengthOf(bones[0]) / 2), len: bones.map(lengthOf), r: bones.map((b) => b.geometry.parameters.radius), joints: [V(0, 0, 0), V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)], tip: V(0, 0, 0) };
  };
  const fingers = [0, 1, 2, 3].map((f) => chain([0, 1, 2].map((i) => m[2 + f * 3 + i])));
  const thumb = chain([14, 15, 16].map((i) => m[i]));
  const t = Math.sign(fingers[0].root.x) || 1; // which side the thumb is on

  for (const mesh of m) {
    mesh.material = flesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }
  for (const c of [...fingers, thumb]) {
    // a finger is wider than it is thick; and the skin folds across the back of each joint
    for (let i = 0; i < 3; i++) {
      c.bones[i].scale.set(0.96, 1, 0.84);
      if (!i) continue;
      for (const dy of [-0.13, 0.13]) {
        const crease = new THREE.Mesh(new THREE.TorusGeometry(c.r[i] * 1.0, 0.035, 4, 14, Math.PI - 1.2).rotateZ(Math.PI + 0.6).rotateX(Math.PI / 2), creaseMat);
        crease.position.y = -c.len[i] / 2 + dy;
        c.bones[i].add(crease);
      }
    }
    // a nail: a strip of a slightly larger cylinder on the back of the last bone (a bone's own −z is the back of the hand)
    const r = c.r[2];
    const nail = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.0, r * 1.05, r * 1.35, 10, 1, true, Math.PI - 0.82, 1.64), nailMat);
    nail.position.y = c.len[2] / 2 - r * 0.2;
    nail.receiveShadow = true;
    c.bones[2].add(nail);
    const fold = new THREE.Mesh(new THREE.TorusGeometry(r * 1.04, 0.03, 4, 14, 1.5).rotateZ(Math.PI * 1.5 - 0.75).rotateX(Math.PI / 2), creaseMat);
    fold.position.y = nail.position.y - r * 0.68;
    c.bones[2].add(fold);
  }
  for (const c of fingers) {
    const knuckle = new THREE.Mesh(BALL, flesh);
    knuckle.scale.set(c.r[0] * 1.12, c.r[0] * 0.62, c.r[0] * 1.35);
    knuckle.position.copy(c.root).add(V(0, 0.42, -0.25));
    knuckle.castShadow = knuckle.receiveShadow = true;
    hand.group.add(knuckle);
  }

  const a = V(0, 0, 0);
  const b = V(0, 0, 0);
  const d = V(0, 0, 0);
  const lay = (c, i) => {
    b.copy(a).addScaledVector(d, c.len[i]);
    c.bones[i].position.copy(a).add(b).multiplyScalar(0.5);
    c.bones[i].quaternion.setFromUnitVectors(UP, d);
    a.copy(b);
    c.joints[i + 1].copy(b);
  };
  /** Lay the hand between two ways of lying (`u` 0 → 1). No allocation: it is called on every sample of the shutter. */
  function pose(P, Q = P, u = 0) {
    for (let f = 0; f < 4; f++) {
      const c = fingers[f];
      a.copy(c.root);
      c.joints[0].copy(a);
      const fan = mix(P.fan[f], Q.fan[f], u) * t;
      let bent = 0;
      for (let i = 0; i < 3; i++) {
        bent += mix(P.bend[f][i], Q.bend[f][i], u);
        d.set(Math.sin(fan) * Math.cos(bent), -Math.sin(bent), Math.cos(fan) * Math.cos(bent));
        lay(c, i);
      }
      c.tip.copy(a).addScaledVector(d, c.r[2]);
    }
    a.copy(thumb.root);
    thumb.joints[0].copy(a);
    for (let i = 0; i < 3; i++) {
      const s = mix(P.spread[i], Q.spread[i], u);
      d.set(t * Math.sin(s), -mix(P.drop[i], Q.drop[i], u), Math.cos(s)).normalize();
      lay(thumb, i);
    }
    thumb.tip.copy(a).addScaledVector(d, thumb.r[2]);
  }
  pose(FLAT);
  return { group: hand.group, fingers, thumb, pose, t };
}

/* ───────────────────────────────────────────────────────────── the shop */

export function buildShop() {
  const group = new THREE.Group();
  const A = {};
  const fx = {};

  const far = new THREE.Group(); // the shop round the saw: a floor of lines, two silhouettes far behind
  const inner = new THREE.Group(); // inside the cabinet: the motor, its belt
  const saw = new THREE.Group(); // the cabinet, the rails, the fence, the switch
  const top = new THREE.Group(); // the cast-iron top alone: `table` fades it
  group.add(far, inner, saw, top);

  /* ── collectors: every piece is baked where it stands; one mesh per material, one mesh per family of lines ── */
  const L = { top: [], strong: [], fine: [], inner: [], far: [] };
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
  // the edges of a piece (its own outline when its edges are broken: one line per edge, on the crest)
  const edgesInto = (list, geometry, threshold = 28) => {
    const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, threshold).attributes.position;
    for (let i = 0; i < e.count; i += 2) seg(list, [e.getX(i), e.getY(i), e.getZ(i)], [e.getX(i + 1), e.getY(i + 1), e.getZ(i + 1)]);
  };
  const piece = (material, geometry, { pos, rotX, rotY, rotZ, lines = "strong", threshold } = {}) => {
    const g = placed(geometry, { pos, rotX, rotY, rotZ });
    if (lines) edgesInto(L[lines], g, threshold);
    put(material, g);
    return g;
  };

  /* ── glass. Linear values: 0.06 is already a quarter of the way to white ── */
  // the top is what the hand and the board lie on: a slab that says it is there by its edges, never a grey veil under them
  fx.top = glass(BRAND.ink, { base: 0.004, rim: 0.05, power: 2.4, edge: 0.12, spec: 0.3, through: 0.3 });
  fx.cab = glass(BRAND.ink, { base: 0.004, rim: 0.13, power: 2.6, edge: 0.18, spec: 0.3, through: 0.25 }); // sheet metal: large flat panels
  fx.trim = glass(BRAND.ink, { base: 0.006, rim: 0.26, power: 2.4, edge: 0.4, spec: 0.6, through: 0.2 }); // what is round or small: rails, fence, wheel, switch
  fx.motor = glass(BRAND.ink, { base: 0.004, rim: 0.12, power: 2.4, edge: 0.16, spec: 0.2, through: 0.3 }); // a shell of its own inside the cabinet's
  fx.beam = glass(BRAND.ink, { base: 0.003, rim: 0.08, power: 2.6, edge: 0.2, spec: 0.2, through: 0.25 }); // long flat things: the fence, the rails — seen at a grazing angle, bright glass is a grey slab across the picture
  fx.far = glass(BRAND.ink, { base: 0.002, rim: 0.06, power: 2.4, edge: 0.08 });
  const glasses = [fx.top, fx.cab, fx.trim, fx.beam, fx.motor, fx.far];
  const homes = new Map([[fx.top, top], [fx.cab, saw], [fx.trim, saw], [fx.beam, saw], [fx.motor, inner], [fx.far, far]]);

  /* ═════════════ 1 · THE SAW ═════════════ */

  const { x0, x1, z0, z1 } = TABLE;
  const TW = x1 - x0;
  const TD = z1 - z0;
  const TY = TABLE.y;

  // the cast-iron top: a thick slab with crisp edges, its two mitre slots, the throat plate and its slot
  piece(fx.top, box(TW, TABLE.thick, TD, 0.3), { pos: [0, TY - TABLE.thick / 2, 0], lines: "top" });
  for (const sx of [-19.5, 19.5]) {
    for (const e of [-0.95, 0.95]) seg(L.top, [sx + e, TY + 0.04, z0], [sx + e, TY + 0.04, z1]);
    for (const z of [z0 - 0.03, z1 + 0.03]) run(L.top, [[sx - 0.95, TY, z], [sx - 0.95, TY - 1, z], [sx + 0.95, TY - 1, z], [sx + 0.95, TY, z]]);
  }
  const THW = (THROAT.x1 - THROAT.x0) / 2;
  const THL = (THROAT.z1 - THROAT.z0) / 2;
  run(L.top, stadium(THW, THL, TY + 0.04), true);
  run(L.top, stadium(0.55, THL - 5.5, TY + 0.04, 6), true);
  run(L.top, arc([0, TY + 0.04, THL - 2.6], 0.9, "y", 0, Math.PI * 2, 16));

  // the cabinet: a plinth, the body, the flange the top is bolted on
  const CW = CABINET.x1 - CABINET.x0;
  const CD = CABINET.z1 - CABINET.z0;
  piece(fx.cab, box(CW + 3, 7, CD + 3, 0.6), { pos: [0, 3.5, 0], lines: "fine" });
  piece(fx.cab, box(CW, 74, CD, 1.6), { pos: [0, 44, 0] });
  piece(fx.cab, box(CW + 4, 2, CD + 4, 0.3), { pos: [0, 82, 0], lines: "fine" });
  // on its right side (away from where one films): the motor's cover and its louvres; at the back, the dust port
  piece(fx.cab, box(7, 42, 46, 2), { pos: [CABINET.x1 + 3.5, 36, -2], lines: "fine" });
  for (let y = 24; y <= 48; y += 6) seg(L.fine, [CABINET.x1 + 7.1, y, -14], [CABINET.x1 + 7.1, y, 10]);
  piece(fx.cab, cyl(5, 9, 0.4, 32), { pos: [-12, 17, CABINET.z0 - 4], rotX: Math.PI / 2, lines: "fine" });

  // the handwheel that raises the blade, on the front: a rim, three spokes, a hub, a crank handle — and its scale above it
  const WHEEL = [0, 51, CABINET.z1 + 4.6];
  const WR = 8.5;
  piece(fx.trim, new THREE.TorusGeometry(WR, 0.8, 10, 48), { pos: WHEEL, lines: null });
  for (const r of [WR - 0.8, WR + 0.8]) run(L.fine, arc(WHEEL, r, "z"));
  piece(fx.trim, cyl(2.3, 3.4, 0.4, 24), { pos: [WHEEL[0], WHEEL[1], WHEEL[2] - 0.4], rotX: Math.PI / 2, lines: "fine" });
  piece(fx.trim, cyl(0.9, 4.6, 0.1, 12), { pos: [WHEEL[0], WHEEL[1], CABINET.z1 + 2.3], rotX: Math.PI / 2, lines: null });
  for (let i = 0; i < 3; i++) {
    const t = (90 + i * 120) * DEG;
    piece(fx.trim, bar([WHEEL[0] + 2 * Math.cos(t), WHEEL[1] + 2 * Math.sin(t), WHEEL[2]], [WHEEL[0] + WR * Math.cos(t), WHEEL[1] + WR * Math.sin(t), WHEEL[2]], 0.55), { lines: null });
  }
  piece(fx.trim, cyl(1.05, 5.5, 0.3, 16), { pos: [WHEEL[0] + WR * Math.cos(-30 * DEG), WHEEL[1] + WR * Math.sin(-30 * DEG), WHEEL[2] + 3.4], rotX: Math.PI / 2, lines: "fine" });
  run(L.fine, arc([WHEEL[0], WHEEL[1], CABINET.z1 + 0.1], 15, "z", 25 * DEG, 155 * DEG, 26));
  for (let i = 0; i <= 8; i++) {
    const t = (25 + i * 16.25) * DEG;
    seg(L.fine, [15 * Math.cos(t), WHEEL[1] + 15 * Math.sin(t), CABINET.z1 + 0.1], [16.8 * Math.cos(t), WHEEL[1] + 16.8 * Math.sin(t), CABINET.z1 + 0.1]);
  }

  // the rails, and the extension wing on its two legs
  piece(fx.beam, box(162, 7.5, 5, 0.5), { pos: [17, 81.5, z1 + 3] });
  piece(fx.beam, box(162, 4.5, 3, 0.3), { pos: [17, 82.5, z0 - 1.7], lines: "fine" });
  piece(fx.cab, box(42, 3, TD, 0.3), { pos: [x1 + 21, TY - 1.5, 0], lines: "fine" });
  for (const z of [-30, 30]) piece(fx.cab, cyl(1.7, TY - 3, 0.2, 20), { pos: [x1 + 38, (TY - 3) / 2, z], lines: "fine" });

  // the rip fence: a beam the board rides against, its head clamped on the front rail, its lever
  const FX = FENCE.x + FENCE.w / 2;
  piece(fx.beam, box(FENCE.w, FENCE.h, 100, 0.5), { pos: [FX, TY + 0.05 + FENCE.h / 2, -4] });
  seg(L.fine, [FENCE.x - 0.03, TY + 4.7, -54], [FENCE.x - 0.03, TY + 4.7, 46]);
  piece(fx.trim, box(18, 9.5, 9, 0.8), { pos: [FX, 82.4, z1 + 6.6] });
  piece(fx.trim, bar([FX, 86.5, z1 + 11], [FX, 79.5, z1 + 21.5], 0.8), { lines: null });
  piece(fx.trim, new THREE.SphereGeometry(1.9, 16, 12), { pos: [FX, 79.2, z1 + 22], lines: null });
  piece(fx.trim, box(5, 5, 4, 0.4), { pos: [FX, 84, z0 - 3.5], lines: "fine" });
  A.fence = anchor(group, FX, TY + FENCE.h + 0.5, -8);

  // the paddle switch, hung under the front rail on the left: a box, and the wide paddle one slaps to stop
  const SW = [-44, 69.5, z1 + 9.2];
  piece(fx.trim, box(10, 15, 7, 0.8), { pos: SW });
  piece(fx.trim, box(12.5, 13, 1.4, 0.6), { pos: [SW[0], SW[1] - 0.6, SW[2] + 5.2], rotX: -0.16 });
  run(L.fine, arc([SW[0], SW[1] + 2, SW[2] + 3.6], 2.3, "z", 0, Math.PI * 2, 20));
  A.switch = anchor(group, SW[0], SW[1], SW[2] + 7);

  /* ── inside, seen through the sheet metal: the motor low on the right, its belt up to the arbor ── */
  const MOT = { x: 18.5, y: 34, z: 9, r: 8, len: 14 };
  const BELT_X = 8.0; // the middle of the arbor's pulley (model.js draws it: x 6.7 → 9.3, r 2.3)
  const PULLEY = { motor: 3.6, arbor: 2.2 };
  piece(fx.motor, cyl(MOT.r, MOT.len, 0.8, 48), { pos: [MOT.x, MOT.y, MOT.z], rotZ: Math.PI / 2, lines: "inner" });
  for (const s of [-1, 1]) piece(fx.motor, cyl(6.4, 2, 0.5, 40), { pos: [MOT.x + s * (MOT.len / 2 + 1), MOT.y, MOT.z], rotZ: Math.PI / 2, lines: "inner" });
  piece(fx.motor, box(6, 4, 8, 0.5), { pos: [MOT.x, MOT.y + MOT.r + 1.4, MOT.z], lines: "inner" });
  piece(fx.motor, cyl(0.9, 4, 0.1, 12), { pos: [BELT_X + 2.2, MOT.y, MOT.z], rotZ: Math.PI / 2, lines: null });
  piece(fx.motor, cyl(PULLEY.motor, 2.2, 0.3, 32), { pos: [BELT_X, MOT.y, MOT.z], rotZ: Math.PI / 2, lines: "inner" });
  piece(fx.motor, box(17, 1.2, 19, 0.3), { pos: [MOT.x, MOT.y - MOT.r - 1.2, MOT.z], lines: "inner" });

  // what follows the arbor when the blade drops: the two runs of the belt
  fx.driveLines = [];
  const outline = (mesh, geometry) => {
    const lines = edgesOf(geometry, { width: 1.8, opacity: 0.3 });
    fx.driveLines.push(lines.material);
    mesh.add(lines);
    return mesh;
  };
  const runGeo = new THREE.BoxGeometry(1.9, 1, 0.4);
  const runs = [0, 1].map(() => outline(new THREE.Mesh(runGeo, fx.motor), runGeo));
  inner.add(...runs);
  const ARM = { r: Math.hypot(BLADE.y - ARBOR.pivot[1], BLADE.z - ARBOR.pivot[2]), a: Math.atan2(BLADE.y - ARBOR.pivot[1], BLADE.z - ARBOR.pivot[2]) };
  function layDrive(drop) {
    const a = ARM.a - drop * ARBOR.drop * DEG;
    const ay = ARBOR.pivot[1] + ARM.r * Math.sin(a);
    const az = ARBOR.pivot[2] + ARM.r * Math.cos(a);
    // the two outer tangents of the pulleys: the same normal at both ends of a run
    const dy = ay - MOT.y;
    const dz = az - MOT.z;
    const D = Math.hypot(dy, dz);
    const along = Math.atan2(dy, dz);
    const open = Math.acos(clamp01((PULLEY.motor - PULLEY.arbor) / D));
    for (let i = 0; i < 2; i++) {
      const n = along + (i ? -open : open);
      const y1 = MOT.y + PULLEY.motor * Math.sin(n);
      const z1_ = MOT.z + PULLEY.motor * Math.cos(n);
      const y2 = ay + PULLEY.arbor * Math.sin(n);
      const z2 = az + PULLEY.arbor * Math.cos(n);
      runs[i].position.set(BELT_X, (y1 + y2) / 2, (z1_ + z2) / 2);
      runs[i].rotation.x = Math.atan2(z2 - z1_, y2 - y1);
      runs[i].scale.y = Math.hypot(y2 - y1, z2 - z1_);
    }
  }
  layDrive(0);

  /* ═════════════ 2 · THE SHOP, FAR BEHIND ═════════════ */
  // (only where a camera standing on the −x / +z side looks: toward +x and −z. Nothing on its own side.)

  fx.floor = makeFloor();
  far.add(fx.floor);
  const seat = makeContact({ amount: 0.6 }); // the saw sits on its floor
  seat.scale.set(118, 120, 1);
  seat.position.y = 0.3;
  far.add(seat);

  // a workbench against the back wall, its vice
  const WB = [120, -340];
  piece(fx.far, box(200, 7, 65, 0.6), { pos: [WB[0], 88, WB[1]], lines: "far" });
  for (const sx of [-92, 92]) for (const sz of [-26, 26]) piece(fx.far, box(8, 84, 8, 0.4), { pos: [WB[0] + sx, 42, WB[1] + sz], lines: "far" });
  piece(fx.far, box(184, 3, 50, 0.4), { pos: [WB[0], 22, WB[1]], lines: "far" });
  piece(fx.far, box(16, 13, 22, 0.8), { pos: [WB[0] - 80, 86, WB[1] + 40], lines: "far" });
  piece(fx.far, bar([WB[0] - 80, 86, WB[1] + 51], [WB[0] - 80, 86, WB[1] + 66], 1.2), { lines: null });
  piece(fx.far, bar([WB[0] - 92, 86, WB[1] + 66], [WB[0] - 68, 86, WB[1] + 66], 0.8), { lines: null });
  // boards leaning against the walls: upright things read in an upright picture (a rack of boards lying flat drew lines through your head)
  const rand = rng(31);
  const leaning = (n, at, turn) => {
    let along = 0;
    for (let i = 0; i < n; i++) {
      const h = 185 + rand() * 85;
      const w = 14 + rand() * 13;
      const tilt = (7 + rand() * 6) * DEG;
      const out = (h / 2) * Math.sin(tilt) + rand() * 6;
      // against the back wall it leans toward −z; against the side wall (turn), toward +x
      piece(fx.far, box(w, h, 3.5, 0.4), { pos: turn ? [at[0] + out, (h / 2) * Math.cos(tilt), at[1] + along + w / 2] : [at[0] + along + w / 2, (h / 2) * Math.cos(tilt), at[1] - out], rotX: -tilt, rotY: turn ? -Math.PI / 2 : 0, lines: "far" });
      along += w + 2 + rand() * 9;
    }
  };
  leaning(5, [245, -385], false);
  leaning(7, [425, -260], true);

  // dust hanging in the air of a shop: a few slow motes
  fx.motes = makeMotes({ count: 90, seed: 9, min: [-90, 60, -80], size: [190, 120, 160], psize: [0.05, 0.2], color: BRAND.ink, drift: [0.35, -0.5, 0.25] });
  far.add(fx.motes.points);

  /* ═════════════ 3 · THE BOARD ═════════════ */
  // Two strips, one on each side of the blade's line, and a bridge that fills what is not sawn yet: the inner
  // edges of the strips draw the line of the cut ahead of the blade — the pencil line the saw follows.

  const board = new THREE.Group();
  board.position.set(0, TY + 0.03, LEAD);
  group.add(board);
  fx.woodU = { uLead: { value: LEAD } };
  fx.wood = woodMaterial(fx.woodU);
  fx.boardLines = [];
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const slab = (xa, xb, outlined) => {
    const mesh = new THREE.Mesh(unit, fx.wood);
    mesh.receiveShadow = true;
    mesh.scale.set(xb - xa, BOARD.thick, BOARD.length);
    mesh.position.set((xa + xb) / 2, BOARD.thick / 2, BOARD.length / 2);
    if (outlined) {
      const lines = edgesOf(unit, { color: 0x15191c, width: 1.8, opacity: 0.5 });
      fx.boardLines.push(lines.material);
      mesh.add(lines);
    }
    board.add(mesh);
    return mesh;
  };
  slab(BOARD.x0, -KERF / 2, true);
  slab(KERF / 2, BOARD.x1, true);
  const bridge = slab(-KERF / 2, KERF / 2, false);
  A.boardEnd = anchor(board, 1, BOARD.thick, BOARD.length);

  fx.dust = makeDust();
  group.add(fx.dust.points);

  /* ═════════════ 4 · YOU ═════════════ */
  // A figure of glass leaning over the table; solid, its two hands. The right one pushes the end of the board;
  // the left one lies flat on it, left of the blade, fingers forward — and slides.

  const you = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.1, spec: 0.3, through: 0.2, skin: INK.clone().multiplyScalar(0.9) });
  you.group.position.set(HIPS.x, HIPS.y, HIPS.z);
  you.group.rotation.y = Math.PI; // the kit's figure looks toward +z: you face the saw
  you.leg("L", V(10, 8 - HIPS.y, 3));
  you.leg("R", V(-10, 8 - HIPS.y, -13));
  you.head.material = you.body; // from close, only what the sentence is about stays solid: the hands
  asShell(you.head, 10);
  you.shadow.visible = true;
  you.shadow.scale.set(62, 54, 1);
  you.shadow.position.set(0, 0.35 - HIPS.y, -3);
  group.add(you.group);
  A.youHead = anchor(you.torso, 0, you.head.position.y + 11, you.head.position.z);

  const armL = you.arms.L;
  const armR = you.arms.R;
  fx.flesh = you.flesh.clone(); // the left hand's own: an ordinary saw sets it alight
  fx.flesh.userData.tint = fx.flesh.color.clone();
  fx.nail = solid(INK.clone().multiplyScalar(1.02), { rough: 0.24, coat: 0.85, env: 1.2 });
  fx.nail.userData.tint = fx.nail.color.clone();
  fx.crease = solid(INK.clone().multiplyScalar(0.42), { rough: 0.8 });
  fx.crease.userData.tint = fx.crease.color.clone();
  const handL = rigHand(armL.fingers, fx.flesh, fx.nail, fx.crease);
  const handR = rigHand(armR.fingers, you.flesh, solid(INK.clone().multiplyScalar(1.02), { rough: 0.24, coat: 0.85, env: 1.2 }), solid(INK.clone().multiplyScalar(0.42), { rough: 0.8 }));
  // a wrist: the hand does not stop where the glass of the sleeve does
  const wristGeo = new THREE.CapsuleGeometry(2.15, 4.6, 6, 20);
  const wrists = [[armL, fx.flesh], [armR, you.flesh]].map(([arm, material]) => {
    const mesh = new THREE.Mesh(wristGeo, material);
    mesh.scale.set(1.15, 1, 0.76); // a wrist is wide and flat, never thicker than the palm it carries
    mesh.receiveShadow = true;
    you.group.add(mesh);
    return { arm, mesh };
  });
  const layWrists = () => {
    for (const w of wrists) {
      dir.subVectors(w.arm.at, w.arm.elbow).normalize();
      w.mesh.position.copy(w.arm.at).addScaledVector(dir, -2.2);
      w.mesh.quaternion.setFromUnitVectors(UP, dir);
    }
  };
  const INDEX = handL.fingers[0];
  const TIP_FLAT = INDEX.tip.clone(); // where a flat hand's forefinger ends, in the hand's own frame
  A.hand = anchor(armL.hand, 0, 1.6, 5);
  A.fingertip = anchor(you.group, 0, 0, 0);
  A.elbow = anchor(you.group, 0, 0, 0);

  // the cut you are left with: a thin signal line round the tip of the forefinger, from its pad to the edge of its nail
  {
    const r = INDEX.r[2] * 1.03;
    const curve = new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => {
      const t = (-75 + i * 10) * DEG;
      return V(0.05, INDEX.len[2] / 2 + r * Math.cos(t), -r * Math.sin(t));
    }));
    fx.nick = glow(BRAND.signal, 0);
    fx.mark = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.06, 6), fx.nick);
    fx.mark.visible = false;
    INDEX.bones[2].add(fx.mark);
  }

  // the blade's signal passing into you: a thread of veille light from the fingertip to the chest — a core, a sheath, a knot at every joint
  const thread = new THREE.Group();
  you.group.add(thread);
  fx.core = glow(BRAND.veille, 2.1, { additive: true });
  fx.sheath = glow(BRAND.veille, 0.22, { additive: true });
  fx.core.depthTest = fx.sheath.depthTest = false; // inside the glass, and through the hand
  const tubeGeo = new THREE.CylinderGeometry(1, 1, 1, 12, 1, true);
  const knotGeo = new THREE.SphereGeometry(1, 12, 8);
  const segs = [0.14, 0.14, 0.15, 0.2, 0.26, 0.3, 0.3].map((r) => {
    const s = { r, core: new THREE.Mesh(tubeGeo, fx.core), sheath: new THREE.Mesh(tubeGeo, fx.sheath), knot: new THREE.Mesh(knotGeo, fx.core) };
    for (const mesh of [s.core, s.sheath, s.knot]) {
      mesh.renderOrder = 8;
      mesh.frustumCulled = false;
      thread.add(mesh);
    }
    return s;
  });
  const pts = Array.from({ length: 8 }, () => V(0, 0, 0)); // fingertip, three joints, wrist, elbow, shoulder, chest — the figure's own frame
  const lens = new Float32Array(7);
  let total = 1;

  const lights = new THREE.Group(); // in the figure's own frame
  you.group.add(lights);
  const hl = { head: makeHalo(lights, 9), chest: makeHalo(lights, 3), touch: makeHalo(lights, 8), harmA: makeHalo(lights, 7), harmB: makeHalo(lights, 3.5), nick: makeHalo(lights, 6) };
  fx.embers = makeEmbers();
  group.add(fx.embers.points);

  /* ── the pose ── */
  const toFig = (out, x, y, z) => out.set(-(x - HIPS.x), y - HIPS.y, -(z - HIPS.z));
  // a flat left hand's own axes, in the figure's frame: fingers, back of the hand, across
  const HZ = V(-Math.sin(YAW), 0, Math.cos(YAW));
  const HX = V(Math.cos(YAW), 0, Math.sin(YAW));
  const DOWN = V(0, -1, 0);
  const AWAY = { at: V(20, 114, 30), dir: V(-0.1, 0.15, 0.98).normalize(), palm: V(-0.5, -0.75, 0.2).normalize() }; // pulled back: the hand up before the left shoulder, its back to where one films from
  const BEND_L = V(0.15, -0.4, -0.9); // the elbow behind the hand, never out to the left: a camera on that side would look down the forearm
  const BEND_R = V(-0.25, -0.35, -0.9);
  const layL = { dir: V(0, 0, 1), palm: V(0, -1, 0) };
  const layR = { dir: V(0, -0.04, 1).normalize(), palm: V(0, -1, 0) };
  const flatAt = V(0, 0, 0);
  const at = V(0, 0, 0);
  const wrist = V(0, 0, 0);
  const tmp = V(0, 0, 0);
  const dir = V(0, 0, 0);
  const headAt = V(0, 0, 0);
  const tipWorld = V(0, 0, 0);
  const colour = new THREE.Color();
  const posed = { slip: NaN, flinch: NaN, feed: NaN };
  /** The hand's own frame → the figure's. */
  const fromHand = (out, p) => out.copy(p).applyQuaternion(armL.hand.quaternion).add(armL.hand.position);

  function pose(slip, flinch, feed) {
    posed.slip = slip;
    posed.flinch = flinch;
    posed.feed = feed;
    const f = flinch;
    you.lean(mix(LEAN.pitch, 10, f), 0, mix(LEAN.turn, -4, f));

    // the left hand, flat on the board: its forefinger `s` cm short of the teeth (1 cm at 0.85, 2 mm at 0.95, on them at 1)
    const s = slip >= 0.6 ? Math.pow((1 - slip) / 0.15, 1.465) : 4.21 + 15.4 * (0.6 - slip);
    toFig(flatAt, TOUCH[0] - APPROACH.x * s, TOUCH[1], TOUCH[2] - APPROACH.z * s);
    flatAt.addScaledVector(HX, -TIP_FLAT.x).addScaledVector(HZ, -TIP_FLAT.z);
    flatAt.y = BOARD_TOP + REST - HIPS.y;
    // …or pulled back from it, the fingers half closed
    handL.pose(FLAT, CURL, f);
    at.copy(flatAt).lerp(AWAY.at, f);
    at.y += 7 * Math.sin(Math.PI * f); // it leaves the board upward
    layL.dir.copy(HZ).lerp(AWAY.dir, f).normalize();
    layL.palm.copy(DOWN).lerp(AWAY.palm, f).normalize();
    you.reach("L", wrist.copy(at).addScaledVector(layL.dir, -1), BEND_L, layL);

    // the right hand, flat on the end of the board: the heel of the palm just over its edge
    toFig(at, 9, BOARD_TOP + REST, LEAD - feed + BOARD.length + 3);
    you.reach("R", wrist.copy(at).addScaledVector(layR.dir, -1), BEND_R, layR);

    layWrists();

    // where the signal runs: fingertip, the forefinger's joints, the wrist, the elbow, the shoulder, the chest
    fromHand(pts[0], INDEX.tip);
    fromHand(pts[1], INDEX.joints[2]);
    fromHand(pts[2], INDEX.joints[1]);
    fromHand(pts[3], INDEX.joints[0]);
    pts[4].copy(armL.hand.position);
    pts[5].copy(armL.elbow);
    pts[6].copy(armL.sh);
    pts[7].set(3, 46, 4).applyMatrix4(you.torso.matrix);
    total = 0;
    for (let i = 0; i < 7; i++) total += lens[i] = pts[i].distanceTo(pts[i + 1]);
    A.fingertip.position.copy(pts[0]);
    A.elbow.position.copy(pts[5]);
    tipWorld.set(HIPS.x - pts[0].x, HIPS.y + pts[0].y, HIPS.z - pts[0].z);
  }
  handR.pose(FLAT);
  pose(1, 0, 6);
  if (Math.hypot(tipWorld.x - TOUCH[0], tipWorld.y - TOUCH[1], tipWorld.z - TOUCH[2]) > 0.08) console.warn("shop.js: the left hand does not reach TOUCH", tipWorld.toArray());

  /* ═════════════ assembly: one mesh per material, one per family of lines ═════════════ */

  const shells = { panes: [], inners: [...runs], fars: [] };
  for (const [material, list] of buckets) {
    const mesh = new THREE.Mesh(list.length > 1 ? mergeGeometries(list) : list[0], material);
    homes.get(material).add(mesh);
    (material === fx.motor ? shells.inners : material === fx.far ? shells.fars : shells.panes).push(mesh);
  }
  asShell(shells.inners, 15); // seen through the cabinet
  asShell(shells.panes, 20);
  asShell(shells.fars, 24);

  // lines step back with depth: full strength on the side one films from (−x, +z), fainter on the far side
  const dim = (x, z) => mix(1, 0.4, smooth(-30, 100, (x - z) * 0.7071));
  const lineSet = (list, width, opacity, parent, fade = dim) => {
    const colours = new Float32Array(list.length);
    for (let i = 0; i < list.length; i += 6) colours.fill(fade((list[i] + list[i + 3]) / 2, (list[i + 2] + list[i + 5]) / 2), i, i + 6);
    const geometry = new LineSegmentsGeometry().setPositions(list);
    geometry.setColors(colours);
    const material = lineMat(BRAND.ink, width, { opacity, additive: true, vertexColors: true });
    const mesh = new LineSegments2(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    parent.add(mesh);
    return material;
  };
  fx.lines = {
    top: lineSet(L.top, 2.2, 0.62, top),
    strong: lineSet(L.strong, 2.2, 0.7, saw),
    fine: lineSet(L.fine, 1.8, 0.42, saw),
    inner: lineSet(L.inner, 1.8, 0.3, inner),
    far: lineSet(L.far, 1.8, 0.26, far, () => 1),
  };

  const SIG = SIGNAL.clone();
  const VEI = VEILLE.clone();

  return {
    group, A, fx, you,
    /**
     * shell    the X-ray of the saw and of the shop (0–1) — the board goes with it
     * table    the cast-iron top alone: 1 as the rest · 0 gone
     * you      you at the saw (0 / 1)
     * feed     how far the board has been pushed, in cm: it moves toward −z, the kerf grows by as much
     * slip     your left hand: 0 well back (13 cm) → 0.85 its forefinger 1 cm from the teeth → 0.95 2 mm → 1 on them (TOUCH)
     * circuit  the thread of veille light: fingertip → wrist (0.19) → elbow (0.47) → shoulder (0.78) → chest (1)
     * harm     an ordinary saw: a signal light at the fingertip (0–0.3), then the whole hand alight, embers (0–1)
     * flinch   the hand pulled back and up, half closed; the trunk straightens (0–1)
     * nick     a thin signal line round the tip of the forefinger (0–1)
     * dust     the sawdust thrown off the blade (0–1), times `blur`
     * drop     for the belt: its upper pulley follows the arbor down (0–1)
     */
    update({ shell: sh = 1, table = 1, you: showYou = 1, feed = 6, slip = 0.85, circuit = 0, harm = 0, flinch = 0, nick = 0, dust = 1, drop = 0, blur = 1 } = {}, time = 0, px = 1600) {
      // the shell
      const on = sh > 0.01;
      for (let i = 0; i < glasses.length; i++) glasses[i].uniforms.uAmount.value = sh;
      fx.top.uniforms.uAmount.value = sh * table;
      fx.lines.top.opacity = 0.62 * sh * table;
      fx.lines.strong.opacity = 0.7 * sh;
      fx.lines.fine.opacity = 0.42 * sh;
      fx.lines.inner.opacity = 0.3 * sh;
      fx.lines.far.opacity = 0.26 * sh;
      for (let i = 0; i < fx.driveLines.length; i++) fx.driveLines[i].opacity = 0.3 * sh;
      far.visible = inner.visible = saw.visible = on;
      top.visible = sh * table > 0.01;
      fx.floor.material.uniforms.uAmount.value = 0.1 * sh;
      fx.floor.material.uniforms.uPool.value = 0.05 * sh;
      seat.material.uniforms.uAmount.value = 0.6 * sh;
      fx.motes.uniforms.uAmount.value = 0.25 * sh;
      fx.motes.update(time, px, 1 / 30);
      layDrive(clamp01(drop));

      // the board
      const lead = LEAD - feed;
      const sawn = Math.min(BOARD.length - 0.5, Math.max(0.5, Z_FRONT - lead));
      board.visible = on;
      board.position.z = lead;
      bridge.scale.z = BOARD.length - sawn;
      bridge.position.z = sawn + (BOARD.length - sawn) / 2;
      fx.woodU.uLead.value = lead;
      if (fx.wood.opacity !== Math.min(1, sh)) {
        fx.wood.opacity = Math.min(1, sh);
        fx.wood.transparent = sh < 0.999;
        fx.wood.needsUpdate = true;
      }
      for (let i = 0; i < fx.boardLines.length; i++) fx.boardLines[i].opacity = 0.5 * Math.min(1, sh);

      // the sawdust: only while the blade turns
      const spray = dust * blur * (on ? 1 : 0);
      fx.dust.points.visible = spray > 0.003;
      fx.dust.uniforms.uT.value = time;
      fx.dust.uniforms.uScale.value = px;
      fx.dust.uniforms.uAmount.value = spray;

      // you
      you.group.visible = showYou > 0.5;
      fx.embers.points.visible = false;
      if (!you.group.visible) return;
      const sl = clamp01(slip);
      const fl = clamp01(flinch);
      if (sl !== posed.slip || fl !== posed.flinch || feed !== posed.feed) pose(sl, fl, feed);

      // the signal running up your arm: lit behind its head
      const c = clamp01(circuit);
      const h = clamp01(harm);
      thread.visible = c > 0.001;
      if (thread.visible) {
        const head = c * total;
        let acc = 0;
        headAt.copy(pts[7]);
        for (let i = 0; i < 7; i++) {
          const s = segs[i];
          const u = clamp01((head - acc) / lens[i]);
          s.core.visible = s.sheath.visible = u > 0.001;
          s.knot.visible = u > 0.999;
          if (u > 0.001) {
            dir.subVectors(pts[i + 1], pts[i]).normalize();
            s.core.position.copy(pts[i]).addScaledVector(dir, (u * lens[i]) / 2);
            s.core.quaternion.setFromUnitVectors(UP, dir);
            s.core.scale.set(s.r, u * lens[i], s.r);
            s.sheath.position.copy(s.core.position);
            s.sheath.quaternion.copy(s.core.quaternion);
            s.sheath.scale.set(s.r * 3.4, u * lens[i], s.r * 3.4);
            s.knot.position.copy(pts[i + 1]);
            s.knot.scale.setScalar(s.r);
            if (u < 0.999) headAt.copy(pts[i]).addScaledVector(dir, u * lens[i]);
          }
          acc += lens[i];
        }
      }
      const breath = 1 + 0.07 * Math.sin(time * 1.1); // slow: a light that blinks reads as a fault
      const arrived = smooth(0.9, 1, c);
      hl.head.set(headAt, VEI, c > 0.001 ? 2.2 * breath * (1 - 0.5 * arrived) : 0, 2.4 + 1.2 * smooth(0.15, 0.5, c));
      hl.chest.set(pts[7], VEI, 0.28 * arrived * breath, 22);
      hl.touch.set(pts[0], VEI, 1.5 * smooth(0, 0.06, c) * (1 - 0.6 * smooth(0.2, 0.6, c)), 1.5);
      // the glass of your body takes the colour of what runs through it
      colour.copy(INK).lerp(VEILLE, 0.55 * smooth(0.5, 1, c)).lerp(SIGNAL, 0.5 * smooth(0.3, 1, h));
      you.body.uniforms.uColor.value.copy(colour);

      // an ordinary saw: a light that has a place — the fingertip, then the whole hand — and slow embers. Never more than light
      const fire = smooth(0, 0.3, h);
      const spread = smooth(0.3, 1, h);
      hl.harmA.set(pts[0], SIG, 2.6 * fire * breath, mix(1.4, 3.4, smooth(0, 0.7, h)));
      hl.harmB.set(fromHand(tmp, tmp.set(0, 0.5, 9)), SIG, 0.5 * spread * breath, 5 + 8 * spread);
      // the hand itself takes the colour: a shape of signal light, still a hand
      fx.flesh.emissive.copy(SIGNAL).multiplyScalar(0.7 * spread);
      fx.flesh.color.copy(fx.flesh.userData.tint).multiplyScalar(1 - 0.65 * spread);
      fx.nail.color.copy(fx.nail.userData.tint).multiplyScalar(1 - 0.65 * spread);
      fx.crease.color.copy(fx.crease.userData.tint).multiplyScalar(1 - 0.65 * spread);
      fx.nail.emissive.copy(SIGNAL).multiplyScalar(0.8 * spread);
      fx.embers.points.visible = h > 0.02;
      fx.embers.uniforms.uT.value = time;
      fx.embers.uniforms.uScale.value = px;
      fx.embers.uniforms.uAmount.value = smooth(0.05, 0.6, h);
      fx.embers.uniforms.uOrigin.value.copy(tipWorld);

      // what you are left with
      const n = clamp01(nick);
      fx.mark.visible = n > 0.01;
      setGlow(fx.nick, 3.2 * n);
      hl.nick.set(pts[0], SIG, 0.55 * n, 1.5);
    },
  };
}
