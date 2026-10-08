// DOSSIER 008 — Paratonnerre : the house, seen like an X-ray — what is in it, you, and the tree.
//
// A shell of glass with real thicknesses (walls 24 cm thick with their windows cut through, two roof
// slabs with their overhang, verge and ridge tiles, gutters) and fine ink lines that fade with depth;
// inside, solid, the only things that matter here: the roof frame, the wires, the pipes — the three
// ways a stroke would take to the earth — and you, at the window.
//
//   buildHouse() → { group, A, T, update(p, time, px) }      p = { shell, inside, you, out, whatif, fire }
//
// `whatif` (0 → 1) is the house WITHOUT a rod: the stroke comes in by the top of the chimney and looks
// for the earth. It is a graph of timed strokes (STROKE TIMES below, handed back as `T`): each one
// lights up behind a fiery head, an arc where the current jumps from one conductor to the next, and
// at 1 everything it went through burns. Three kinds of things inside, told apart by what they are
// made of: the frame is dark timber, a pipe is pale metal, a wire is a thread of light.
//
// Not drawn here: the rod, its conductor, the lightning, the ground (model.js, bolt.js).
import * as THREE from "three";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, setGlow, glass, asShell, box, cyl, plate, lathe, placed, anchor, mergeGeometries } from "@kit/build3d.js";
import { HOUSE, roofY, CHIMNEY, ANTENNA, TREE, ROD, YOU, WINDOW } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.8, 0.55); // white-hot: an ember when it is born
const FIERY = new THREE.Color(1, 0.3, 0.1); // the hottest the stroke gets: its head, its arcs — still signal, never cream
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const ONE = V(1, 1, 1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const { x0, x1, z0, z1, floor1, eave, ridge, over } = HOUSE;
const TH = 24; // how thick the walls are
const RT = 14; // how thick the roof slabs are, across
const SLOPE = Math.atan2(ridge - eave, z1);
const COS = Math.cos(SLOPE);
const SIN = Math.sin(SLOPE);
const DROP = RT / COS; // the slab, measured upright
const TOP = eave - DROP - 1.5; // the long walls stop just under it
/** A height under the roof's surface: `d` cm below it, upright. */
const under = (z, d) => roofY(z) - d;

/* ───────────────────────────────────────────────────────────── materials of our own */

/**
 * Lines in screen pixels (the instanced quads of LineSegments2) that know how far they are: full
 * strength on the near side of the house, down to `far` on its far side — depth is measured from
 * `uCentre`, over `uReach` cm, whatever the distance of the camera. What is far steps back.
 * `lit`: the stroke's own lines instead — each segment knows when the stroke reaches its two ends
 * (`instanceK`: t at the start, t at the end, level) and shows only behind the head (`uHead`).
 */
function lineMaterial({ color = BRAND.ink, width = 2, hdr = 1, far = 0.3, reach = 620, centre = [0, 400, 0], lit = false } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: !lit,
    blending: lit ? THREE.AdditiveBlending : THREE.NormalBlending,
    defines: lit ? { LIT: "" } : {},
    uniforms: {
      uColor: { value: new THREE.Color(color).multiplyScalar(hdr) }, uHot: { value: FIERY.clone().multiplyScalar(2.6) },
      uWidth: { value: width }, uRes: { value: RES }, uAmount: { value: 1 }, uFar: { value: far },
      uCentre: { value: V(...centre) }, uReach: { value: reach }, uHead: { value: 0 }, uBurn: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uWidth, uReach; uniform vec2 uRes; uniform vec3 uCentre;
      attribute vec3 instanceStart; attribute vec3 instanceEnd;
      varying vec2 vUv; varying float vDepth;
      #ifdef LIT
        attribute vec3 instanceK; varying float vT; varying float vLevel;
      #endif
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
        #ifdef LIT
          vT = position.y < 0.5 ? instanceK.x : instanceK.y;
          vLevel = instanceK.z;
        #endif
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uHot; uniform float uAmount, uFar, uHead, uBurn;
      varying vec2 vUv; varying float vDepth;
      #ifdef LIT
        varying float vT; varying float vLevel;
      #endif
      void main() {
        if (uAmount < 0.003) discard;
        if (abs(vUv.y) > 1.0) { // round ends
          float b = abs(vUv.y) - 1.0;
          if (vUv.x * vUv.x + b * b > 1.0) discard;
        }
        #ifdef LIT
          if (vT > uHead) discard;
          float lead = exp(-(uHead - vT) * 30.0); // just behind the head, white-hot
          vec3 c = mix(uColor * vLevel, uHot, clamp(lead, 0.0, 1.0)) * (1.0 + 0.15 * uBurn);
          gl_FragColor = vec4(c * uAmount, 1.0);
        #else
          float k = clamp(0.5 + 0.5 * vDepth, 0.0, 1.0);
          gl_FragColor = vec4(uColor, uAmount * mix(1.0, uFar, k * k * (3.0 - 2.0 * k)));
        #endif
      }`,
  });
}

/**
 * The glass of the house: `glass()` of the kit (same uniforms: asShell makes its two other layers
 * out of it), with what a house asks for —
 *   `grade` [y0, y1, low]  a wall fades toward the ground (its light comes from the sky): low at y0, full at y1
 *   `tile`   the tiles of a roof slab's upper face: courses down the slope, each tile brighter toward
 *            its lower edge. A course is never thinner than a pixel and a half: it spreads instead,
 *            with the same light, into an even sheen
 *   `streak` the slanted reflections of a window pane (anchored in the wall: they do not crawl)
 */
function glazed({ base = 0.008, rim = 0.1, power = 2.6, edge = 0.06, through = 0.25, tile = 0, streak = 0, grade = [0, 1, 1] } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color(BRAND.ink) }, uBase: { value: base }, uRim: { value: rim }, uPower: { value: power }, uAmount: { value: 1 },
      uEdge: { value: edge }, uSpec: { value: 0 }, uGain: { value: 1 }, uTile: { value: tile }, uStreak: { value: streak },
      uGrade: { value: V(...grade) }, uCourse: { value: 33 * COS },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vP; varying float vTop; varying float vAlong;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vP = position;
        vTop = smoothstep(0.62, 0.72, normal.y); // the upper face of a slab, on either slope
        vAlong = abs(normal.x) > 0.6 ? position.z : position.x; // along the wall a pane is set in
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uGrade; uniform float uBase, uRim, uPower, uAmount, uEdge, uGain, uTile, uStreak, uCourse;
      varying vec3 vN; varying vec3 vV; varying vec3 vP; varying float vTop; varying float vAlong;
      // a line at every whole number of q, t thick (in q): never under a pixel and a half — spread, with the same light
      float band(float q, float t) {
        float w = max(fwidth(q) * 1.5, t);
        float d = abs(fract(q - 0.5) - 0.5);
        return (t / w) * (1.0 - smoothstep(0.0, w, d));
      }
      void main() {
        if (uAmount < 0.003) discard;
        float facing = dot(normalize(vN), normalize(vV));
        float g = clamp(1.0 - abs(facing), 0.0, 1.0); // clamp before pow
        float light = (uBase + uRim * pow(g, uPower)) * mix(uGrade.z, 1.0, smoothstep(uGrade.x, uGrade.y, vP.y)) + uEdge * smoothstep(0.6, 0.97, g);
        if (uTile > 0.0) {
          float q = abs(vP.z) / uCourse;
          float small = clamp(fwidth(q) * 2.2, 0.0, 1.0); // 1: a course is under two pixels — only the sheen is left
          light += vTop * uTile * (0.45 + 0.55 * abs(facing)) * (band(q, 0.07) + 0.6 * mix(fract(q), 0.5, small)); // (at a grazing angle the rim already lights the slab)
        }
        if (uStreak > 0.0) {
          float s = fract((vAlong * 0.75 + vP.y) / 170.0);
          light += uStreak * (smoothstep(0.0, 0.1, s) * (1.0 - smoothstep(0.2, 0.34, s)) + 0.5 * smoothstep(0.46, 0.5, s) * (1.0 - smoothstep(0.54, 0.6, s)));
        }
        gl_FragColor = vec4(uColor * light * uAmount * uGain, 1.0);
      }`,
  });
  mat.userData.through = through;
  return mat;
}

/** Lights that have a place: a bright core and a long tail, one point each. `size`: the whole halo across, in cm (0: off). */
function makeSprites(count) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  const uniforms = { uScale: { value: 1600 } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uScale; attribute vec3 aColor; attribute float aSize; varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vColor = aColor;
          gl_Position = aSize > 0.0 ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0);
          gl_PointSize = clamp(aSize * uScale / max(1.0, -mv.z), 14.0, 230.0);
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          float n = clamp(1.0 - length(gl_PointCoord - 0.5) * 2.0, 0.0, 1.0);
          gl_FragColor = vec4(vColor * (0.78 * pow(n, 6.0) + 0.22 * n * n), 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 7;
  let used = 0;
  return {
    points, pos, col, size, uniforms,
    slot: () => used++,
    put(i, p, colour, k, across) {
      pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2];
      col[i * 3] = colour.r * k; col[i * 3 + 1] = colour.g * k; col[i * 3 + 2] = colour.b * k;
      size[i] = k > 0.004 ? across : 0;
    },
    flush() {
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aColor.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
    },
  };
}

/**
 * Embers falling from where the stroke came in: each one is born again every period, so the whole
 * thing is a pure function of time — alive on the first frame — and slow: the film runs at a crawl.
 */
function makeEmbers(origin, { count = 46, seed = 4 } = {}) {
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4); // phase, period (s), size (cm), heading
  for (let i = 0; i < count; i++) seeds.set([rand(), 2.6 + rand() * 2.4, 5 + Math.pow(rand(), 2) * 9, rand() * Math.PI * 2], i * 4);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uScale: { value: 1600 }, uAmount: { value: 0 }, uOrigin: { value: V(...origin) }, uHot: { value: HOT.clone().multiplyScalar(3.4) }, uCool: { value: SIGNAL.clone().multiplyScalar(2.4) } };
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
          float out_ = 16.0 + 70.0 * age * (0.5 + fract(aSeed.x * 7.3));
          vec3 p = uOrigin + vec3(cos(aSeed.w) * out_, 20.0 * age - 230.0 * age * age, sin(aSeed.w) * out_);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aSeed.z * uScale / max(1.0, -mv.z), 2.5, 60.0);
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

/* ───────────────────────────────────────────────────────────── small makers */

/** A round bar from `a` to `b`: `r` thick at a, `r2` at b. */
function bar(a, b, r, r2 = r, radial = 10) {
  const va = V(...a);
  const vb = V(...b);
  const len = va.distanceTo(vb);
  const q = new THREE.Quaternion().setFromUnitVectors(UP, vb.clone().sub(va).normalize());
  return new THREE.CylinderGeometry(r2, r, len, radial, 1).applyMatrix4(new THREE.Matrix4().compose(va.add(vb).multiplyScalar(0.5), q, ONE));
}
const ball = (p, r, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h).translate(...p);
/** A run of pipe or of conduit through points: bars, and a ball at every bend. */
const pipe = (pts, r, radial = 10) => [...pts.slice(1).map((p, i) => bar(pts[i], p, r, r, radial)), ...pts.slice(1, -1).map((p) => ball(p, r * 1.03, radial, 8))];
/** Position and normal only, not indexed: what every piece is reduced to before the pieces of one material are merged. */
function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  return o;
}
/** A jagged way from `a` to `b`: an arc, broken again and again around its own line. Seeded: the same on every frame. */
function jag(a, b, seed, { amp = 0.13, depth = 3 } = {}) {
  const rand = rng(seed);
  let pts = [V(...a), V(...b)];
  const d = new THREE.Vector3();
  for (let level = 0; level < depth; level++) {
    const next = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1];
      const q = pts[i];
      d.subVectors(q, p);
      const side = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).cross(d).normalize();
      next.push(p.clone().lerp(q, 0.4 + rand() * 0.2).addScaledVector(side, (rand() < 0.5 ? -1 : 1) * amp * d.length() * (0.5 + rand())), q);
    }
    pts = next;
  }
  return pts.map((p) => [p.x, p.y, p.z]);
}
const near = (v, t) => Math.abs(v - t) < 2.5;

/* ───────────────────────────────────────────────────────────── the house */

export function buildHouse() {
  const group = new THREE.Group();
  const A = {};
  const fx = {};

  const shell = new THREE.Group(); // glass
  const outer = new THREE.Group(); // the few solid things outside: the antenna, a door handle
  const inner = new THREE.Group(); // what is inside, solid: frame, wires, pipes
  const rooms = new THREE.Group(); // the glass inside the glass: the upper floor, a partition
  shell.add(rooms);
  group.add(shell, outer, inner);

  /* ── collectors: every piece is baked where it stands; one mesh per material, one mesh per family of lines ── */
  const L = { strong: [], fine: [], inside: [], wires: [] };
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
  // the edges of a piece (its own outline when its edges are broken: one line per edge, on the crest), `keep` to drop some
  const edgesInto = (list, geometry, keep, threshold = 28) => {
    const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, threshold).attributes.position;
    for (let i = 0; i < e.count; i += 2) {
      const a = [e.getX(i), e.getY(i), e.getZ(i)];
      const b = [e.getX(i + 1), e.getY(i + 1), e.getZ(i + 1)];
      if (!keep || keep(a, b)) seg(list, a, b);
    }
  };
  const piece = (material, geometry, { pos, rotX, rotY, rotZ, lines = "strong", keep, threshold } = {}) => {
    const g = placed(geometry, { pos, rotX, rotY, rotZ });
    if (lines) edgesInto(L[lines], g, keep, threshold);
    put(material, g);
    return g;
  };

  /* ── glass. Linear values: 0.06 is already a quarter of the way to white ── */
  fx.wall = glazed({ base: 0.018, rim: 0.26, power: 2.2, edge: 0.26, through: 0.2, grade: [0, eave, 0.3] });
  fx.roof = glazed({ base: 0.012, rim: 0.12, power: 2.4, edge: 0.06, through: 0.25, tile: 0.22 });
  fx.stack = glass(BRAND.ink, { base: 0.02, rim: 0.24, power: 2.4, edge: 0.34, spec: 0.4, through: 0.25 }); // masonry: the chimney, the sills, the step
  fx.trim = glass(BRAND.ink, { base: 0.004, rim: 0.3, power: 2.6, edge: 0.5, spec: 0.7, through: 0.2 }); // what is round or small: tiles, gutters, window frames
  fx.pane = glazed({ base: 0.012, rim: 0.12, power: 2, edge: 0, through: 0.3, streak: 0.07 });
  // the floor, the partition: a shell of their own inside the house's (seen through it at their own strength — which is low:
  // a floor of glass seen at a grazing angle is a grey slab across the picture)
  fx.inner = glass(BRAND.ink, { base: 0.002, rim: 0.012, power: 3, edge: 0 });
  fx.sill = glass(BRAND.ink, { base: 0.006, rim: 0.12, power: 2.4, edge: 0.24, spec: 0.3, through: 0.2 });
  const glasses = [fx.wall, fx.roof, fx.stack, fx.sill, fx.trim, fx.pane, fx.inner];
  const homes = new Map(); // material → the group its pieces go to (not in userData: asShell clones the material, and userData with it)
  for (const m of glasses) homes.set(m, shell);
  homes.set(fx.inner, rooms);

  /* ── solids ── */
  const tone = (hex, k, o) => solid(new THREE.Color(hex).multiplyScalar(k), o);
  fx.metal = tone(0xc9c6bc, 1, { rough: 0.42, metal: 0.45 }); // the antenna
  homes.set(fx.metal, outer);
  // three values: the timber (darker as it stands deeper in the house), the metal of the pipes, the pale plastic and enamel of what one touches
  fx.truss = [tone(0x5b6066, 1, { rough: 0.85 }), tone(0x5b6066, 0.84, { rough: 0.85 }), tone(0x5b6066, 0.7, { rough: 0.85 })];
  fx.purlin = tone(0x5b6066, 0.9, { rough: 0.85 });
  fx.chevron = tone(0x5b6066, 0.42, { rough: 0.9 });
  fx.wire = tone(0xc9c5ba, 1, { rough: 0.6 }); // a wire carries light: it glows a little — a pipe is metal, the frame is dark
  fx.wire.emissive = INK.clone().multiplyScalar(0.5);
  fx.wire.userData.glow = fx.wire.emissive.clone();
  fx.pipe = tone(0xb9bdc1, 1, { rough: 0.35, metal: 0.2, env: 1.2 });
  fx.fix = tone(0xd6d1c4, 0.62, { rough: 0.65 });
  fx.shade = tone(0xd6d1c4, 0.62, { rough: 0.65, double: true });
  fx.ceram = tone(0xd6d1c4, 0.3, { rough: 0.55 }); // what lies flat under the light: the shower tray
  fx.dark = tone(0x20252a, 1, { rough: 0.5 });
  const insides = [...fx.truss, fx.purlin, fx.chevron, fx.wire, fx.pipe, fx.fix, fx.shade, fx.ceram, fx.dark];
  for (const m of insides) {
    homes.set(m, inner);
    m.userData.tint = m.color.clone();
  }
  fx.metal.userData.tint = fx.metal.color.clone();

  /* ═════════════ 1 · THE SHELL ═════════════ */

  // each wall: where a point (a: along it, y, d: how deep from its outer face) stands, and how its plate is laid
  const SIDES = {
    front: { at: (a, y, d) => [a, y, z1 - d], rotY: 0, flip: 1, pos: [0, 0, z1 - TH], turn: 0 },
    back: { at: (a, y, d) => [a, y, z0 + d], rotY: Math.PI, flip: -1, pos: [0, 0, z0 + TH], turn: 0 },
    left: { at: (a, y, d) => [x0 + d, y, a], rotY: -Math.PI / 2, flip: 1, pos: [x0 + TH, 0, 0], turn: Math.PI / 2 },
    right: { at: (a, y, d) => [x1 - d, y, a], rotY: Math.PI / 2, flip: -1, pos: [x1 - TH, 0, 0], turn: Math.PI / 2 },
  };
  const rect = ([a0, a1, b0, b1]) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]];
  // a wall: a plate TH thick, its openings cut through, every edge broken (the bright lip of glass)
  const wall = (side, outline, holes, keep) => {
    const S = SIDES[side];
    const map = (pts) => {
      const m = pts.map(([a, y]) => new THREE.Vector2(S.flip * a, y));
      return S.flip < 0 ? m.reverse() : m; // the outline stays counter-clockwise
    };
    const shape = new THREE.Shape(map(outline));
    shape.isShape = true; // what plate() looks for to take a shape with its holes (three itself does not set it)
    for (const h of holes) shape.holes.push(typeof h === "function" ? h(S.flip) : new THREE.Path(map(rect(h))));
    piece(fx.wall, plate(shape, TH, { bevel: 2.4, round: 2, curveSegments: 28 }), { pos: S.pos, rotY: S.rotY, keep });
  };
  // a window in its reveal: the pane, its frame, a cross, a sill that stands out
  const mid = TH * 0.55;
  const dress = (side, [a0, a1, b0, b1], { cross = true } = {}) => {
    const S = SIDES[side];
    const w = a1 - a0;
    const h = b1 - b0;
    const ca = (a0 + a1) / 2;
    const cb = (b0 + b1) / 2;
    const o = { rotY: S.turn, lines: null };
    piece(fx.pane, box(w - 9, h - 9, 1.2, 0.4), { ...o, pos: S.at(ca, cb, mid) });
    for (const [a, y, ww, hh] of [[ca, b0 + 2.7, w - 1, 5], [ca, b1 - 2.7, w - 1, 5], [a0 + 2.7, cb, 5, h - 11], [a1 - 2.7, cb, 5, h - 11]]) piece(fx.trim, box(ww, hh, 6, 1.2), { ...o, pos: S.at(a, y, mid) });
    run(L.fine, [S.at(a0 + 5.4, b0 + 5.4, mid - 3), S.at(a1 - 5.4, b0 + 5.4, mid - 3), S.at(a1 - 5.4, b1 - 5.4, mid - 3), S.at(a0 + 5.4, b1 - 5.4, mid - 3)], true);
    if (cross) {
      const bar_ = b0 + h * 0.64;
      piece(fx.trim, box(3.4, h - 10, 4.5, 1), { ...o, pos: S.at(ca, cb, mid) });
      piece(fx.trim, box(w - 10, 3.4, 4.5, 1), { ...o, pos: S.at(ca, bar_, mid) });
      seg(L.strong, S.at(ca, b0 + 5.4, mid - 3), S.at(ca, b1 - 5.4, mid - 3));
      seg(L.strong, S.at(a0 + 5.4, bar_, mid - 3), S.at(a1 - 5.4, bar_, mid - 3));
    }
    piece(fx.sill, box(w + 18, 6, 15, 2), { rotY: S.turn, pos: S.at(ca, b0 - 3.4, 2.5) });
  };

  const DOOR = [180, 280, 0, 215];
  const OPEN = {
    front: [[WINDOW.x0, WINDOW.x1, WINDOW.y0, WINDOW.y1], [-150, -10, 340, 460], [160, 300, 340, 460]],
    back: [[-260, -100, 95, 225], [90, 250, 95, 225], [-230, -90, 340, 460], [60, 200, 340, 460]],
    left: [[-60, 100, 95, 225], [-70, 70, 340, 460]],
    right: [[-100, 60, 95, 225], [-70, 70, 340, 460]],
  };
  const xi = x1 - TH; // where the long walls end, between the gables
  // the long walls: between the gables. Their ends are buried in them: only the inner corner is an edge
  const keepLong = (a, b) => !(near(Math.abs(a[0]), xi) && near(Math.abs(b[0]), xi) && !(near(Math.abs(a[2]), z1 - TH) && near(Math.abs(b[2]), z1 - TH)));
  wall("front", [[-xi, 0], [DOOR[0], 0], [DOOR[0], DOOR[3]], [DOOR[1], DOOR[3]], [DOOR[1], 0], [xi, 0], [xi, TOP], [-xi, TOP]], OPEN.front, keepLong);
  wall("back", rect([-xi, xi, 0, TOP]), OPEN.back, keepLong);
  // the gables, up to the underside of the roof; an oculus under the ridge. The seam with the long wall is not an edge
  const keepGable = (a, b) => !(Math.abs(a[1] - b[1]) > 5 && near(Math.abs(a[0]), xi) && near(Math.abs(b[0]), xi) && near(Math.abs(a[2]), z1) && near(Math.abs(b[2]), z1));
  const gable = [[z0, 0], [z1, 0], [z1, TOP], [0, under(0, DROP + 1.5)], [z0, TOP]];
  const oculus = () => new THREE.Path().absarc(0, 668, 25, 0, Math.PI * 2, true);
  wall("left", gable, [...OPEN.left, oculus], keepGable);
  wall("right", gable, [...OPEN.right, oculus], keepGable);
  for (const side of Object.keys(OPEN)) for (const o of OPEN[side]) dress(side, o);
  A.window = anchor(group, (WINDOW.x0 + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2, z1);

  // the door: its leaf with two panels, a handle, a step, a canopy
  fx.door = glass(BRAND.ink, { base: 0.012, rim: 0.14, power: 2.2, edge: 0.3, spec: 0.5, through: 0.25 });
  homes.set(fx.door, shell);
  glasses.push(fx.door);
  {
    const S = SIDES.front;
    const cx = (DOOR[0] + DOOR[1]) / 2;
    piece(fx.door, box(DOOR[1] - DOOR[0] - 3, DOOR[3] - 3, 5, 1.2), { pos: S.at(cx, DOOR[3] / 2, mid), lines: "fine" });
    for (const [b0, b1] of [[18, 92], [108, 198]]) run(L.fine, [S.at(DOOR[0] + 14, b0, mid - 2.6), S.at(DOOR[1] - 14, b0, mid - 2.6), S.at(DOOR[1] - 14, b1, mid - 2.6), S.at(DOOR[0] + 14, b1, mid - 2.6)], true);
    put(fx.metal, bar(S.at(DOOR[1] - 9, 103, mid - 6), S.at(DOOR[1] - 21, 103, mid - 6), 1, 1, 8), ball(S.at(DOOR[1] - 9, 103, mid - 4.5), 1.9));
    piece(fx.sill, box(128, 9, 44, 2.5), { pos: [cx, 4.5, z1 + 22] });
    piece(fx.pane, box(140, 3, 60, 1), { pos: [cx, 238, z1 + 28], rotX: 0.2 });
    for (const a of [cx - 62, cx + 62]) seg(L.fine, [a, 205, z1], [a, 232.5, z1 + 54]);
  }

  /* ── the roof: two slabs with their overhang, tiled; ridge tiles, verge tiles, gutters ── */
  {
    const len = (z1 + over) / COS;
    const keepRoof = (a, b) => !(Math.abs(a[2]) < 14 && Math.abs(b[2]) < 14 && Math.min(a[1], b[1]) < ridge - 5); // under the ridge the two slabs run into each other
    for (const s of [1, -1]) {
      piece(fx.roof, box(x1 - x0 + 2 * over, RT, len, 3), { pos: [0, ridge - (len / 2) * SIN - (RT / 2) * COS, s * ((len / 2) * COS - (RT / 2) * SIN)], rotX: s * SLOPE, keep: keepRoof });
      // verge tiles: a row of small tiles stepping down each gable edge, each one lifted over the next
      for (const e of [1, -1]) {
        for (let i = 0; i < 15; i++) {
          const d = 18 + i * 34;
          piece(fx.trim, box(15, 9, 37, 2.5, 2), { pos: [e * (x1 + over - 4.5), ridge - d * SIN + 2.5 * COS, s * (d * COS + 2.5 * SIN)], rotX: s * (SLOPE - 0.07), lines: null });
        }
      }
      // the gutter: a half round under the edge of the slab
      const gutter = new THREE.CylinderGeometry(7.5, 7.5, x1 - x0 + 2 * over + 4, 14, 1, true, Math.PI, Math.PI).rotateZ(Math.PI / 2);
      piece(fx.trim, gutter, { pos: [0, under(z1 + over, DROP - 9), s * (z1 + over + 6.5)], lines: null });
    }
    // ridge tiles: half rounds, each one over the end of the next
    for (let x = x0 - over + 21; x < x1 + over - 10; x += 41.2) {
      piece(fx.trim, new THREE.CylinderGeometry(11, 12.8, 44, 14, 1, true, 0, Math.PI).rotateZ(Math.PI / 2), { pos: [x, ridge - 5, 0], lines: null });
    }
  }
  A.ridgeEnd = anchor(group, ...ROD.foot);

  /* ── the chimney: its stack through the roof (and down to the upper floor, faintly), a crown, two pots ── */
  const CH = { x: CHIMNEY.x, z: CHIMNEY.z, h: CHIMNEY.w / 2, crown: CHIMNEY.top - 30, top: CHIMNEY.top };
  const cut = (z) => roofY(z) + 0.6; // where the stack comes out of the roof
  {
    piece(fx.stack, box(CHIMNEY.w, CH.crown - floor1, CHIMNEY.w, 2.5), { pos: [CH.x, (CH.crown + floor1) / 2, CH.z], lines: null });
    piece(fx.stack, box(CHIMNEY.w + 16, 12, CHIMNEY.w + 16, 3), { pos: [CH.x, CH.crown + 6, CH.z] });
    for (const e of [-1, 1]) piece(fx.trim, lathe([[10, CH.crown + 12], [8.4, CH.top], [6.9, CH.top], [8.4, CH.crown + 12]], 28), { pos: [CH.x + e * 16, 0, CH.z] });
    const cx = [CH.x - CH.h, CH.x + CH.h];
    const cz = [CH.z - CH.h, CH.z + CH.h];
    for (const x of cx) {
      for (const z of cz) {
        seg(L.strong, [x, cut(z), z], [x, CH.crown, z]);
        seg(L.fine, [x, floor1 + 0.5, z], [x, cut(z) - DROP - 2, z]);
      }
    }
    run(L.strong, [[cx[0], cut(cz[0]), cz[0]], [cx[1], cut(cz[0]), cz[0]], [cx[1], cut(cz[1]), cz[1]], [cx[0], cut(cz[1]), cz[1]]], true);
    run(L.fine, [[cx[0], floor1 + 0.5, cz[0]], [cx[1], floor1 + 0.5, cz[0]], [cx[1], floor1 + 0.5, cz[1]], [cx[0], floor1 + 0.5, cz[1]]], true);
  }
  A.chimneyTop = anchor(group, CH.x, CH.top, CH.z);

  /* ── the rake antenna on its mast ── */
  {
    const { x, z, top } = ANTENNA;
    const by = top - 32; // the boom
    put(fx.metal, bar([x, ridge - 2, z], [x, top, z], 2.2, 2.2, 12), ball([x, top, z], 2.3), placed(box(16, 5, 30, 1.2), { pos: [x, ridge + 9, z] }));
    put(fx.metal, bar([x - 46, by, z], [x + 82, by, z], 1.3, 1.3, 8));
    seg(L.strong, [x - 46, by, z], [x + 82, by, z]);
    const element = (ex, ey, len, r = 0.7) => {
      put(fx.metal, bar([ex, ey, z - len / 2], [ex, ey, z + len / 2], r, r, 6));
      seg(L.strong, [ex, ey, z - len / 2], [ex, ey, z + len / 2]);
    };
    [52, 49, 46, 43, 40, 37].forEach((len, i) => element(x + 18 + i * 12.5, by, len));
    element(x + 5, by, 58, 1.05); // the dipole
    put(fx.metal, placed(box(6, 5, 9, 0.8), { pos: [x + 5, by - 3, z] }));
    for (const dy of [-15, 0, 15]) element(x - 40, by + dy, 72); // the reflector
    put(fx.metal, bar([x - 40, by - 17, z], [x - 40, by + 17, z], 0.9, 0.9, 6));
    seg(L.fine, [x + 5, by - 5, z + 2.6], [x + 2.6, by - 30, z + 2.6]); // its cable, down the mast
    seg(L.fine, [x + 2.6, by - 30, z + 2.6], [x + 2.6, ridge + 12, z + 2.6]);
    A.antennaTop = anchor(group, x, top, z);
  }

  /* ── inside the shell, still glass: the upper floor, a partition between the living room and the hall ── */
  piece(fx.inner, box(x1 - x0 - 2 * TH - 1, 18, z1 - z0 - 2 * TH - 1, 2), { pos: [0, floor1 - 9, 0], lines: "fine" });
  const WALL = { x: 50, t: 12 }; // the partition
  piece(fx.inner, box(WALL.t, floor1 - 20, z1 - TH - 5, 1.5), { pos: [WALL.x, (floor1 - 18) / 2, (z1 - TH) / 2 + 1.5], lines: "fine" });

  /* ═════════════ 2 · INSIDE: the frame, the wires, the pipes ═════════════ */

  /* ── the roof frame: three trusses (rafters, collar, king post), a ridge beam, purlins, common rafters ── */
  const TRUSS = [-300, 0, 300];
  const RAFT = 62; // the axis of a principal rafter, under the roof's surface
  const PURL = [165, 265];
  const CHEV = [-400, -320, -240, -160, -80, 0, 80, 165, 255, 330, 405]; // the common rafters: two of them flank the chimney
  const zi = z1 - TH;
  TRUSS.forEach((X, i) => {
    const m = fx.truss[i];
    for (const s of [1, -1]) piece(m, box(10, 18, zi / COS, 1.2), { pos: [X, under(zi / 2, RAFT), (s * zi) / 2], rotX: s * SLOPE, lines: "inside" });
    piece(m, box(10, 16, 286, 1.2), { pos: [X, 640, 0], lines: "inside" });
    piece(m, box(10, 129, 12, 1.2), { pos: [X, 712.5, 0], lines: "inside" });
  });
  const RIDGE_Y = ridge - 34;
  piece(fx.purlin, box(2 * xi, 18, 10, 1.2), { pos: [0, RIDGE_Y, 0], lines: "inside" });
  for (const s of [1, -1]) {
    for (const z of PURL) piece(fx.purlin, box(2 * xi, 16, 9, 1.2), { pos: [0, under(z, 40), s * z], rotX: s * SLOPE, lines: "inside" });
    piece(fx.purlin, box(2 * xi, 12, 14, 1.2), { pos: [0, 466, s * (zi - 7)], lines: "inside" }); // the ledger the trusses stand on
    for (const x of CHEV) put(fx.chevron, placed(box(5, 7, (z1 + over - 4) / COS, 0.6, 1), { pos: [x, under((z1 + over - 4) / 2, 24.9), (s * (z1 + over - 4)) / 2], rotX: s * SLOPE }));
  }

  /* ── the wires: conduits clipped to the frame and run in the walls, a junction box by the chimney,
        the consumer unit on the back wall, sockets along the skirting — one of them beside you ── */
  const WY = under(PURL[0], 40) - 4.2; // along the lower face of the back purlin
  const WZ = -(PURL[0] + 5);
  const BZ = z0 + TH + 3.5; // against the back wall
  const TRUNK = -307; // the x of the way down to the unit
  const UNIT = { x: -300, y: 150, z: z0 + TH + 5, w: 38, h: 52 };
  const FZ = z1 - TH - 3.5; // against the front wall
  const GX = x0 + TH + 3.5; // against the gable
  const PXW = WALL.x - WALL.t / 2 - 2.5; // against the partition, on its −x face: the one the camera sees
  const SOCKET = [WALL.x - WALL.t / 2 - 0.7, 105, 215]; // the socket beside you, at the height of a hand
  const LAMP = [-40, 250, 110]; // the lamp of the living room: behind you and above — seen from the lawn, its halo is what you stand against
  const ROUTE = {
    attic: [[205, WY, WZ], [TRUNK, WY, WZ]],
    lamp2: [[-7, WY, WZ], [-7, 631, -138], [-7, 631, -2]],
    down: [[TRUNK, WY, WZ], [TRUNK, under(172, RAFT) + 2, -172], [TRUNK, under(-BZ, RAFT) + 1.5, BZ], [TRUNK, UNIT.y + UNIT.h / 2, BZ]],
    lamp1: [[TRUNK, 246, BZ], [TRUNK, 246, LAMP[2]], [LAMP[0], 246, LAMP[2]]],
    low: [[TRUNK, UNIT.y - UNIT.h / 2, BZ], [TRUNK, 38, BZ], [GX, 38, BZ], [GX, 38, FZ], [PXW, 38, FZ], [PXW, 38, SOCKET[2]], [PXW, SOCKET[1] - 5, SOCKET[2]]],
  };
  for (const r of Object.values(ROUTE)) {
    put(fx.wire, pipe(r, 1, 8));
    run(L.wires, r);
  }
  piece(fx.fix, box(13, 13, 7, 1.2), { pos: [205, WY, WZ - 1], rotX: -SLOPE, lines: "inside" }); // the junction box

  // the consumer unit: its case, two rows of breakers, their levers
  piece(fx.fix, box(UNIT.w, UNIT.h, 9, 1.5), { pos: [UNIT.x, UNIT.y, UNIT.z], lines: "inside" });
  for (const [r, row] of [UNIT.y + 12.5, UNIT.y - 12.5].entries()) {
    for (let i = 0; i < 8; i++) {
      const bx = UNIT.x - 13.3 + i * 3.8;
      put(fx.dark, placed(box(3.3, 9, 3, 0.4, 2), { pos: [bx, row, UNIT.z + 5] }));
      put(fx.fix, placed(box(1.5, 2.6, 1.6, 0.3, 1), { pos: [bx, row + ((i + r) % 4 === 0 ? -1.4 : 1.4), UNIT.z + 6.9] }));
    }
  }
  A.unit = anchor(group, UNIT.x, UNIT.y, UNIT.z + 5);

  // a socket: its plate, its well, two holes and the earth pin. `turn`: which way it faces (rotY from +z)
  const socket = (p, turn, detail = false) => {
    const m = new THREE.Matrix4().compose(V(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, turn, 0)), ONE);
    const at = (g) => g.applyMatrix4(m);
    const plateGeo = at(box(8.8, 8.8, 1.4, 0.5, 2));
    edgesInto(L.inside, plateGeo);
    put(fx.fix, plateGeo);
    put(fx.dark, at(cyl(2.5, 0.5, 0.1, 24).rotateX(Math.PI / 2).translate(0, 0, 0.75)));
    if (detail) {
      for (const e of [-1, 1]) put(fx.dark, at(cyl(0.34, 0.4, 0.05, 10).rotateX(Math.PI / 2).translate(e * 0.95, 0, 0.9)));
      put(fx.fix, at(cyl(0.27, 1.5, 0.05, 10).rotateX(Math.PI / 2).translate(0, 1.2, 1.3)));
    }
  };
  socket(SOCKET, -Math.PI / 2, true);
  socket([x0 + TH + 0.7, 38, 150], Math.PI / 2);
  socket([-300, 38, z1 - TH - 0.7], Math.PI);
  A.socket = anchor(group, ...SOCKET);

  // a lamp: a rose on the ceiling, a cord, a shade, and its bulb — the only light of the room
  const bulbs = [];
  const lamp = (x, y, z, drop, t) => {
    put(fx.fix, cyl(5, 3, 0.6, 20).translate(x, y - 1.5, z));
    put(fx.wire, bar([x, y - 3, z], [x, y - drop + 12, z], 0.6, 0.6, 6));
    seg(L.wires, [x, y - 3, z], [x, y - drop + 12, z]);
    put(fx.shade, lathe([[3, 12.5], [17.5, 0], [16.6, -0.8], [2.5, 11]], 36).translate(x, y - drop, z));
    const mat = glow(BRAND.ink, 1.4);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(4.4, 18, 12), mat);
    mesh.position.set(x, y - drop + 2.5, z);
    inner.add(mesh);
    bulbs.push({ mat, p: [x, y - drop + 2.5, z], t });
  };
  lamp(...LAMP, 50, 0.67); // the living room
  lamp(0, 631, 0, 84, 0.33); // upstairs, under the collar of the middle truss

  /* ── the water: a bathroom upstairs (a shower, a basin), a heater downstairs, one pipe down the front wall into the ground ── */
  const PX = 330;
  const PZ = z1 - TH - 5.5;
  const HEAD = [PX, 474, PZ - 30]; // the shower head
  const TRAY = floor1 + 8;
  {
    put(fx.pipe, pipe([[PX, -45, 440], [PX, -45, PZ], [PX, 380, PZ]], 4, 12));
    for (const y of [60, 150, 240, 310]) put(fx.pipe, cyl(5.5, 3.2, 0.5, 18).translate(PX, y, PZ));
    put(fx.pipe, bar([PX - 11, 380, PZ - 1], [PX + 11, 380, PZ - 1], 3.7, 3.7, 14)); // the mixer
    for (const e of [-1, 1]) put(fx.fix, ball([PX + e * 12.5, 380, PZ - 1], 3.3, 12, 10));
    put(fx.pipe, pipe([[PX, 380, PZ], [PX, 482, PZ], [PX, 485, PZ - 30], [PX, 478, PZ - 30]], 2.2, 10));
    put(fx.pipe, lathe([[0.1, 5], [3.5, 5], [14, 1], [14, 0], [0.1, 0]], 32).translate(...HEAD));
    piece(fx.ceram, box(92, 8, 92, 2.5), { pos: [PX, floor1 + 4, PZ - 50], lines: "inside" }); // the tray
    // the basin, on the right gable
    put(fx.fix, lathe([[0.1, -14], [10, -13], [20, -5.5], [22.5, 0], [21, 0], [18, -4], [9, -11], [0.1, -12]], 36).translate(xi - 26, 356, 120));
    put(fx.fix, bar([xi - 26, floor1, 120], [xi - 26, 343, 120], 7, 5, 16));
    put(fx.pipe, pipe([[xi - 4, 372, 120], [xi - 14, 372, 120], [xi - 14, 366, 120]], 1.4, 8)); // its tap
    put(fx.pipe, pipe([[xi - 6, 334, 120], [xi - 6, 284, 120], [xi - 6, 284, PZ], [PX, 284, PZ]], 2.6, 10));
    // the heater: a tank on the wall of the hall
    put(fx.fix, lathe([[0.1, 0], [16, 1.6], [24, 7], [27, 16], [27, 96], [24, 105], [16, 110.4], [0.1, 112]], 44).translate(392, 92, 292));
    for (const y of [122, 178]) put(fx.pipe, cyl(27.7, 3.4, 0.5, 44).translate(392, y, 292));
    put(fx.pipe, pipe([[384, 93, 292], [384, 70, 292], [384, 70, PZ], [PX, 70, PZ]], 2.6, 10));
  }
  A.shower = anchor(group, ...HEAD);

  /* ═════════════ 3 · WITHOUT THE ROD: the stroke's way through the house ═════════════ */

  // STROKE TIMES — `whatif` when the stroke gets there
  const T = { roof: 0.103, box: 0.17, lamp2: 0.33, pipeTop: 0.36, jets: 0.45, unit: 0.56, lamp1: 0.67, socket: 0.87, you: 0.92, ground: 0.88, end: 0.95 };
  const lit = { way: [[], []], arc: [[], []] }; // the lines of the stroke — positions, and (t at the start, t at the end, how bright) per segment
  const strokes = []; // those with a head: { pts, cum, len, t0, t1, slot }
  const sprites = makeSprites(72);
  const spots = []; // lights that stay where the current jumped or arrived: { p, t, across, hold, burst, slot }
  /** A way the stroke takes, from `t0` to `t1`. `level`: 1 the way to the earth, under 1 a dead end of the frame, 2 an arc (`gain`: how bright). */
  const stroke = (pts, t0, t1, level = 1, head = level === 1, gain = Math.min(level, 1)) => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
    const len = cum.at(-1);
    const at = (l) => t0 + ((t1 - t0) * l) / len;
    const [P, K] = level === 2 ? lit.arc : lit.way;
    for (let i = 1; i < pts.length; i++) {
      seg(P, pts[i - 1], pts[i]);
      K.push(at(cum[i - 1]), at(cum[i]), gain);
    }
    if (head) strokes.push({ pts, cum, len, t0, t1, slot: sprites.slot() });
    // when the stroke passes a point of this way (a fraction of its length)
    return (l) => at(l);
  };
  const spot = (p, t, across, hold = 0.5, burst = 1.2) => spots.push({ p, t, across, hold, burst, slot: sprites.slot() });
  const half = (a, b, u = 0.5) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];

  // down the chimney: its axis, its four corners; it leaves it where the stack meets the frame
  const ENTRY = [CH.x, cut(CH.z) + 4, CH.z];
  stroke([[CH.x, CH.top, CH.z], [CH.x, 650, CH.z]], 0, 0.14);
  for (const x of [CH.x - CH.h, CH.x + CH.h]) for (const z of [CH.z - CH.h, CH.z + CH.h]) stroke([[x, CH.crown, z], [x, cut(z), z]], 0.015, T.roof, 0.6);
  spot([CH.x, CH.top, CH.z], 0.004, 190, 0.8, 1.4);
  spot(ENTRY, T.roof, 150, 0.7, 1.2);
  // ① the frame: up the common rafter beside the stack to the ridge beam, along it, down the trusses
  const chevY = (z) => under(Math.abs(z), 24.9);
  stroke(jag([CH.x - CH.h, 716, CH.z], [CHEV[7] + 2.5, chevY(CH.z), CH.z], 11, { depth: 2 }), 0.096, 0.108, 2);
  stroke([[CHEV[7], chevY(CH.z), CH.z], [CHEV[7], chevY(-8), -8], [CHEV[7], RIDGE_Y, 0]], 0.103, 0.14);
  const t300 = 0.19; // at the truss it turns down
  stroke([[CHEV[7], RIDGE_Y, 0], [TRUSS[2], RIDGE_Y, 0]], 0.14, t300);
  stroke([[TRUSS[2], RIDGE_Y, 0], [xi, RIDGE_Y, 0]], t300, 0.24, 0.5);
  const west = stroke([[CHEV[7], RIDGE_Y, 0], [-xi, RIDGE_Y, 0]], 0.14, 0.36, 0.5);
  const apex = under(0, RAFT);
  const foot = (s) => [0, under(zi - 3, RAFT), s * (zi - 3)];
  const rafter = stroke([[TRUSS[2], apex, 0], [TRUSS[2], foot(1)[1], foot(1)[2]]], t300, 0.345);
  stroke([[TRUSS[2], apex, 0], [TRUSS[2], foot(-1)[1], foot(-1)[2]]], t300, 0.345, 0.5);
  for (const [X, span] of [[TRUSS[1], 0.15], [TRUSS[0], 0.14]]) {
    const t = west(CHEV[7] - X);
    for (const s of [1, -1]) stroke([[X, apex, 0], [X, foot(s)[1], foot(s)[2]]], t, t + span, 0.42, false);
  }
  // ② from the stack to the junction box on the purlin behind it: an arc — then the wires
  const BOX = [205, WY, WZ];
  const arcW = [[205, 654, CH.z - CH.h], [205, WY + 5, WZ + 4]];
  stroke(jag(...arcW, 21), 0.138, T.box, 2);
  spot(half(...arcW), 0.15, 100, 0.55, 1.3);
  const attic = stroke(ROUTE.attic, T.box, 0.4);
  stroke(ROUTE.lamp2, attic(205 + 7), T.lamp2);
  const down = stroke(ROUTE.down, 0.4, T.unit);
  const dl = Math.hypot(...[0, 1, 2].map((k) => ROUTE.down[1][k] - ROUTE.down[0][k])) + Math.hypot(...[0, 1, 2].map((k) => ROUTE.down[2][k] - ROUTE.down[1][k])) + (ROUTE.down[2][1] - 246);
  stroke([...ROUTE.lamp1, [LAMP[0], 204, LAMP[2]]], down(dl), T.lamp1);
  stroke([[TRUNK, UNIT.y + UNIT.h / 2, BZ + 3], [TRUNK, UNIT.y - UNIT.h / 2, BZ + 3]], T.unit, 0.6, 1, false);
  spot([UNIT.x, UNIT.y, UNIT.z + 6], 0.58, 150, 0.55, 1.2);
  const low = stroke(ROUTE.low, 0.6, T.socket);
  {
    // the two other sockets, as the stroke goes by
    const l1 = UNIT.y - UNIT.h / 2 - 38 + (TRUNK - GX);
    spot([GX, 38, 150], low(l1 + (150 - BZ)), 80, 0.45, 1.1);
    spot([-300, 38, FZ], low(l1 + (FZ - BZ) + (-300 - GX)), 80, 0.45, 1.1);
  }
  // …the socket beside you, and the arc it spits at you (it stops short of your hand)
  const HAND = [YOU.inside[0] + 21, 93, YOU.inside[2] + 6];
  const MOUTH = [SOCKET[0] - 1.5, SOCKET[1], SOCKET[2]];
  const TIP = half(MOUTH, HAND, 0.62);
  const spit = jag(MOUTH, TIP, 31, { amp: 0.14, depth: 4 }); // 17 points
  stroke(spit, T.socket, T.you, 2);
  // two forks, each leaving from a point of the arc itself
  stroke(jag(spit[7], [TIP[0] + 6, TIP[1] + 30, TIP[2] + 14], 32, { amp: 0.16, depth: 2 }), 0.89, T.you, 2);
  stroke(jag(spit[11], [TIP[0] - 8, TIP[1] - 26, TIP[2] - 10], 33, { amp: 0.16, depth: 2 }), 0.9, T.you, 2);
  spot(MOUTH, T.socket, 120, 0.7, 1.2);
  // ③ from the foot of the truss to the top of the shower's pipe: an arc — then the water
  const arcP = [[TRUSS[2] + 4, under(300, RAFT) - 10, 301], [PX, 481, PZ]];
  stroke(jag(...arcP, 41), rafter((300 / (zi - 3)) * Math.hypot(zi - 3, apex - foot(1)[1])), T.pipeTop, 2);
  spot(half(...arcP), 0.345, 100, 0.55, 1.3);
  stroke([[PX, 482, PZ], [PX, 485, PZ - 30], [PX, 476, PZ - 30]], T.pipeTop, 0.39);
  [[0, 0], [8, 4], [-7, 5], [2, -8]].forEach(([dx, dz], j) => {
    stroke(jag([HEAD[0] + dx, HEAD[1] - 1, HEAD[2] + dz], [HEAD[0] + dx * 2.6, TRAY + 1, HEAD[2] + dz * 2.6], 50 + j, { amp: 0.03, depth: 3 }), 0.39, T.jets, 2, false, 0.5);
  });
  spot(HEAD, 0.39, 60, 0.45, 0.9);
  spot([HEAD[0], TRAY + 3, HEAD[2]], T.jets, 80, 0.4, 0.9);
  stroke([[PX, 482, PZ], [PX, 380, PZ]], T.pipeTop, 0.42);
  const fall = stroke([[PX, 380, PZ], [PX, 0, PZ]], 0.42, T.ground);
  stroke([[PX, 284, PZ], [xi - 6, 284, PZ], [xi - 6, 284, 120], [xi - 6, 334, 120]], fall(380 - 284), fall(380 - 284) + 0.085);
  spot([xi - 26, 356, 120], fall(380 - 284) + 0.085, 80, 0.4, 1);
  stroke([[PX, 70, PZ], [384, 70, PZ], [384, 70, 292], [384, 93, 292]], fall(380 - 70), fall(380 - 70) + 0.045);
  spot([392, 148, 292], fall(380 - 70) + 0.045, 90, 0.3, 0.7);
  stroke([[PX, 0, PZ], [PX, -45, PZ], [PX, -45, 440]], T.ground, T.end);
  spot([PX, -30, 400], 0.925, 260, 0.6, 0.9);

  fx.lit = lineMaterial({ color: BRAND.signal, width: 4.6, hdr: 2.2, lit: true });
  fx.arc = lineMaterial({ color: SIGNAL.clone().lerp(FIERY, 0.5), width: 3.6, hdr: 3, lit: true }); // thinner and hotter: it is air that burns
  const litMeshes = [[lit.way, fx.lit], [lit.arc, fx.arc]].map(([[P, K], material]) => {
    const geo = new LineSegmentsGeometry().setPositions(P);
    geo.setAttribute("instanceK", new THREE.InstancedBufferAttribute(new Float32Array(K), 3));
    const mesh = new THREE.Mesh(geo, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 6;
    group.add(mesh);
    return mesh;
  });
  group.add(sprites.points);
  for (const b of bulbs) b.slot = sprites.slot();

  fx.embers = makeEmbers([ENTRY[0], ENTRY[1] + 10, ENTRY[2]]);
  group.add(fx.embers.points);
  const fireSlot = sprites.slot();

  /* ═════════════ 4 · YOU ═════════════ */

  // at the window, inside: standing, the weight on one leg, looking out and up
  const you = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.9, through: 0.2, skin: BRAND.ink });
  you.group.position.set(...YOU.inside);
  you.leg("L", V(9.5, 8, 4));
  you.leg("R", V(-9, 8, -2));
  you.reach("L", V(21, 93, 6));
  you.reach("R", V(-21.5, 92, 1));
  you.lean(-4, 1.5, 0);
  you.head.position.z -= 1.2;
  for (const s of ["L", "R"]) you.grip(s, 0.12);
  group.add(you.group);
  A.youHead = anchor(you.torso, 0, you.head.position.y + 11, you.head.position.z);

  // on the lawn, outside: alone, standing, the head thrown back to the sky above the house
  const outside = makeFigure({ shell: true, hands: "real", order: 12, glassK: 1.8, through: 0.2, skin: BRAND.ink });
  outside.group.position.set(...YOU.outside);
  outside.group.rotation.y = Math.atan2(-370 - YOU.outside[0], 40 - YOU.outside[2]); // toward where the leader comes down
  outside.leg("L", V(11.5, 8, 2));
  outside.leg("R", V(-11.5, 8, -2));
  outside.reach("L", V(25, 91, -1));
  outside.reach("R", V(-25, 91, -1));
  outside.lean(-11, 0, 0);
  outside.head.position.z -= 3.2;
  outside.head.position.y -= 0.8;
  for (const s of ["L", "R"]) outside.grip(s, 0.1);
  group.add(outside.group);
  // alone on the lawn: a pool of light under your feet — from far away it is what finds you
  const lawn = new THREE.Mesh(
    new THREE.CircleGeometry(1, 56),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 0.11 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying vec2 vUv;
        void main() { float n = clamp(1.0 - length(vUv - 0.5) * 2.0, 0.0, 1.0); gl_FragColor = vec4(uColor * (0.7 * pow(n, 3.0) + 0.3 * n) * uAmount, 1.0); }`,
    }),
  );
  lawn.rotation.x = -Math.PI / 2;
  lawn.scale.setScalar(250);
  lawn.position.set(YOU.outside[0], 1.5, YOU.outside[2]);
  group.add(lawn);
  A.outHead = anchor(outside.torso, 0, outside.head.position.y + 11, outside.head.position.z);

  /* ═════════════ 5 · THE TREE ═════════════ */

  const tree = new THREE.Group();
  tree.position.set(TREE.x, 0, TREE.z);
  group.add(tree);
  fx.bark = tone(0x4d5156, 1, { rough: 0.95 });
  fx.bark.userData.tint = fx.bark.color.clone();
  fx.leaves = glass(BRAND.ink, { base: 0.012, rim: 0.1, power: 1.5, edge: 0.07, spec: 0.2, through: 0.06 });
  {
    const rand = rng(8);
    const wood = [];
    const twigs = [];
    const HEART = TREE.top - TREE.crown - 20; // the height of the middle of the crown
    const inCrown = (p) => Math.hypot(p.x / (TREE.crown - 25), (p.y - HEART) / (TREE.crown - 10), p.z / (TREE.crown - 25));
    const arr = (p) => [p.x, p.y, p.z];
    // a branch, then the branches it bears: solid down to the third order, a line beyond
    const grow = (from, dir, len, r, order) => {
      const to = from.clone().addScaledVector(dir, len);
      for (let i = 0; i < 6 && inCrown(to) > 1; i++) to.lerp(from, 0.25); // never out of the crown
      if (order <= 2) wood.push(bar(arr(from), arr(to), r, r * 0.62, order ? 8 : 14), ball(arr(to), r * 0.63, 8, 6));
      else seg(twigs, arr(from), arr(to));
      if (order >= 4) return;
      const n = [5, 3, 3, 2][order];
      const turn = rand() * 6.28;
      for (let k = 0; k < n; k++) {
        const az = turn + (k / n) * 6.28 + (rand() - 0.5) * 0.9;
        const spread = (order === 0 ? 0.5 : 0.62) + rand() * 0.3;
        const side = V(Math.cos(az), 0, Math.sin(az));
        side.addScaledVector(dir, -side.dot(dir)).normalize();
        const d = dir.clone().multiplyScalar(Math.cos(spread)).addScaledVector(side, Math.sin(spread));
        d.y += 0.22; // toward the light
        d.normalize();
        grow(order === 0 ? from.clone().lerp(to, 0.8 + 0.2 * (k / n)) : to, d, len * (order === 0 ? 0.62 : 0.66) * (0.85 + rand() * 0.3), r * (order === 0 ? 0.42 : 0.55), order + 1);
      }
      // the leader goes on
      if (order <= 1) grow(to, dir.clone().add(V((rand() - 0.5) * 0.3, 0.25, (rand() - 0.5) * 0.3)).normalize(), len * 0.55, r * 0.6, order + 1);
    };
    wood.push(bar([0, -4, 0], [2, 46, -1], 38, 26, 16)); // the flare of the roots
    grow(V(2, 46, -1), V(0.02, 1, -0.015).normalize(), 350, 26, 0);
    tree.add(new THREE.Mesh(mergeGeometries(wood.map(bare)), fx.bark));

    // the crown: a few uneven lumps, one shell of glass — soft: it is the branches that say "tree"
    const lump = ([cx, cy, cz, r], seed) => {
      const ph = rng(seed);
      const p = [ph() * 6.28, ph() * 6.28, ph() * 6.28, ph() * 6.28];
      const ico = new THREE.IcosahedronGeometry(1, 5);
      ico.deleteAttribute("uv");
      ico.deleteAttribute("normal");
      const g = mergeVertices(ico, 1e-4);
      const at = g.attributes.position;
      for (let i = 0; i < at.count; i++) {
        const x = at.getX(i);
        const y = at.getY(i);
        const z = at.getZ(i);
        const k = r * (1 + 0.13 * Math.sin(2.4 * x + p[0]) * Math.cos(2.1 * y + p[1]) + 0.09 * Math.sin(3.6 * z + p[2] + 1.4 * x) + 0.04 * Math.sin(6.5 * y + p[3]));
        at.setXYZ(i, cx + x * k, cy + y * k * 0.92, cz + z * k);
      }
      g.computeVertexNormals();
      return bare(g);
    };
    const R = TREE.crown / 300;
    const crownGeo = mergeGeometries(
      [[0, 790, 0, 165], [140, 650, 70, 150], [-145, 670, 50, 150], [70, 680, -140, 150], [-110, 620, -140, 140], [10, 560, 10, 175], [-20, 620, 150, 130]].map(([cx, cy, cz, r], i) => lump([cx * R, cy, cz * R, r * R], 60 + i)),
    );
    crownGeo.computeBoundingBox();
    crownGeo.translate(0, TREE.top - crownGeo.boundingBox.max.y, 0); // its top is where the plan says
    const crown = new THREE.Mesh(crownGeo, fx.leaves);
    tree.add(crown);
    asShell(crown, 24);

    fx.twigs = lineMaterial({ width: 1.8, far: 0.3, reach: 300, centre: [0, HEART, 0] });
    const twigMesh = new THREE.Mesh(new LineSegmentsGeometry().setPositions(twigs), fx.twigs);
    twigMesh.frustumCulled = false;
    twigMesh.renderOrder = 2;
    tree.add(twigMesh);
  }
  A.treeTop = anchor(group, TREE.x, TREE.top, TREE.z);

  /* ═════════════ assembly: one mesh per material, one per family of lines ═════════════ */

  const panes = [];
  for (const [material, list] of buckets) {
    const mesh = new THREE.Mesh(list.length > 1 ? mergeGeometries(list) : list[0], material);
    homes.get(material).add(mesh);
    if (homes.get(material) === shell) panes.push(mesh);
    if (homes.get(material) === rooms) asShell(mesh, 15);
  }
  asShell(panes, 20);

  fx.strong = lineMaterial({ width: 2.2, far: 0.3 });
  fx.fine = lineMaterial({ width: 1.8, far: 0.25 });
  fx.insideLines = lineMaterial({ width: 1.8, far: 0.3 });
  fx.wireLines = lineMaterial({ width: 2.6, hdr: 1.5, far: 0.45 }); // a wire is a thread of light: brighter than an edge of the shell
  for (const [name, material, parent] of [["strong", fx.strong, shell], ["fine", fx.fine, shell], ["inside", fx.insideLines, inner], ["wires", fx.wireLines, inner]]) {
    const mesh = new THREE.Mesh(new LineSegmentsGeometry().setPositions(L[name]), material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    parent.add(mesh);
  }

  const SIG = SIGNAL.clone().multiplyScalar(2.6);
  const HEADC = FIERY.clone().multiplyScalar(2.8);
  const WARM = INK.clone().multiplyScalar(1.1);
  const p3 = [0, 0, 0];

  return {
    group, A, fx,
    /** `whatif` when the stroke gets there: roof, box, lamp2, pipeTop, jets, unit, lamp1, socket, you, ground, end. */
    T,
    /**
     * shell   the X-ray of the house and of the tree (0–1)
     * inside  the frame, the wires, the pipes: how bright (0: gone)
     * you     you at the window (0 / 1)        out   you on the lawn (0 / 1)
     * whatif  the stroke's way through the house, 0 → 1        fire   embers where it came in (0–1)
     */
    update({ shell: sh = 1, inside = 0.6, you: showYou = 1, out = 0, whatif = 0, fire = 0 } = {}, time = 0, px = 1600) {
      const w = clamp01(whatif);
      const burn = smooth(0.94, 1, w);

      // the shell, the tree
      for (let i = 0; i < glasses.length; i++) glasses[i].uniforms.uAmount.value = sh;
      fx.leaves.uniforms.uAmount.value = sh;
      fx.strong.uniforms.uAmount.value = 0.7 * sh;
      fx.fine.uniforms.uAmount.value = 0.42 * sh;
      fx.twigs.uniforms.uAmount.value = 0.5 * sh;
      shell.visible = outer.visible = tree.visible = sh > 0.01;
      fx.metal.color.copy(fx.metal.userData.tint).multiplyScalar(sh);
      fx.bark.color.copy(fx.bark.userData.tint).multiplyScalar(sh);

      // what is inside
      inner.visible = inside > 0.01;
      const k = clamp01(inside * 1.25);
      for (let i = 0; i < insides.length; i++) insides[i].color.copy(insides[i].userData.tint).multiplyScalar(k);
      fx.wire.emissive.copy(fx.wire.userData.glow).multiplyScalar(k);
      fx.insideLines.uniforms.uAmount.value = 0.6 * clamp01(inside);
      fx.wireLines.uniforms.uAmount.value = 0.9 * k;

      you.group.visible = showYou > 0.5;
      outside.group.visible = lawn.visible = out > 0.5;

      // the stroke: its lines behind the head, a head on every way it is on, a light wherever it jumped or arrived
      const on = w > 0.0005;
      for (let i = 0; i < litMeshes.length; i++) {
        litMeshes[i].visible = on;
        litMeshes[i].material.uniforms.uHead.value = w;
        litMeshes[i].material.uniforms.uBurn.value = burn;
      }
      fx.arc.uniforms.uAmount.value = 1 + 0.1 * Math.sin(time * 1.3); // it breathes, slowly
      fx.lit.uniforms.uWidth.value = 4.6 + 1.4 * burn;
      sprites.uniforms.uScale.value = px;
      for (let i = 0; i < strokes.length; i++) {
        const s = strokes[i];
        if (!on || w <= s.t0 || w >= s.t1) {
          sprites.size[s.slot] = 0;
          continue;
        }
        const l = ((w - s.t0) / (s.t1 - s.t0)) * s.len;
        let j = 1;
        while (j < s.cum.length - 1 && s.cum[j] < l) j++;
        const u = (l - s.cum[j - 1]) / Math.max(1e-6, s.cum[j] - s.cum[j - 1]);
        const a = s.pts[j - 1];
        const b = s.pts[j];
        p3[0] = a[0] + (b[0] - a[0]) * u;
        p3[1] = a[1] + (b[1] - a[1]) * u;
        p3[2] = a[2] + (b[2] - a[2]) * u;
        sprites.put(s.slot, p3, HEADC, 1, 85);
      }
      for (let i = 0; i < spots.length; i++) {
        const s = spots[i];
        const lit_ = smooth(s.t - 0.004, s.t + 0.012, w);
        const breath = 1 + 0.07 * Math.sin(time * 1.3 + i * 1.7); // slow: a light that blinks reads as a fault
        sprites.put(s.slot, s.p, SIG, on ? lit_ * (s.hold + s.burst * Math.exp(-Math.max(0, w - s.t) / 0.05) + 0.45 * burn) * breath : 0, s.across * (0.75 + 0.25 * lit_ + 0.2 * burn));
      }
      // the lamps: the light of the house — until the stroke gets to them
      for (let i = 0; i < bulbs.length; i++) {
        const b = bulbs[i];
        const hit = on ? smooth(b.t - 0.004, b.t + 0.012, w) : 0;
        if (hit > 0.5) {
          setGlow(b.mat, 3, SIGNAL);
          sprites.put(b.slot, b.p, SIG, hit * (0.7 + 1.2 * Math.exp(-Math.max(0, w - b.t) / 0.05) + 0.4 * burn), 150);
        } else {
          setGlow(b.mat, 1.4 * k, INK);
          sprites.put(b.slot, b.p, WARM, inside > 0.01 ? 0.85 * k * sh : 0, i ? 150 : 260); // (the first one is the lamp you stand against)
        }
      }
      // where it came in: embers, and the glow of what burns there
      fx.embers.uniforms.uT.value = time;
      fx.embers.uniforms.uScale.value = px;
      fx.embers.uniforms.uAmount.value = fire;
      fx.embers.points.visible = fire > 0.003;
      sprites.put(fireSlot, ENTRY, SIG, fire * 0.55 * (1 + 0.1 * Math.sin(time * 0.9)), 210);
      sprites.flush();
    },
  };
}
