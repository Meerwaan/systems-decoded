// DOSSIER 016 — Disjoncteur : the system. One modular circuit breaker at its true size (plan.js: 1.8 × 8.5 × 7 cm,
// the origin is the middle of its base, its back on the rail at z = 0, its face and its handle toward +z, the feed
// on the upper terminal). Its works are drawn in the plane (z, y) and seen from the −x side:
//
//        y                 ┌ feed terminal ┐  screw ─►
//        │   ── upper horn ─────────┐ fixed contact
//        │   ║║║║║║║║ the chamber   ● ◄─ moving contact ── arm ──● pivot        ┌──────┐
//        │   ║║║║║║║║ (11 plates)       │spring  │bar of   ╲leg ── link ───────(  hub  )═══ handle
//        │   ── lower horn ──╯          │        │the      braid                └──────┘
//        │   [ coil ]══ core ─►         ●post    ●latch    ║ blade (two metals)
//        │        └── wire ───────────────────────────────╨ its clamp
//        │   └ load terminal ┘  screw ─►
//        └──────────────────────────────────────────────────────────── z (rail → face)
//
// The current, in series: feed terminal → fixed contact → moving contact, the arm, its leg → a braid → the blade,
// from its free end down to its clamp → the coil's wire, six turns → load terminal.
// The latch is ONE bar on a pivot: the coil's core strikes its foot (toward the face), the blade pushes it above
// the pivot (toward the rail) — both turn it the same way, and its head slides from under the arm's tooth. The
// spring, hooked behind the arm, is what then opens the contacts. The link is rigid: it leaves the handle's crank
// and aims at the arm's foot; on (handle 1, gap 0) and off (handle 0, gap 1) it lands on it exactly, and in the
// instant between (latch 1, gap 1, handle still 1) it no longer does — the "trip-free" of a real breaker.
// Three values of grey: the far shell's floor, the handle and the fibre dark; the case, the steel and the dark
// conductors in between; the two traps — the blade and the coil — clear. Light: INK the ordinary current, SIGNAL
// the overload, the heat, the arc; VEILLE the coil's pull and the part the voice names.
// Liberties taken to be read in one frame (docs/journal/016-model.md): the blade is 2 mm thick, the coil's wire and
// the braid are drawn fat, the chamber has no side cheek on the camera's side, the arc's slices burn near the
// plates' front edge.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glass, asShell, edgesOf, makePart, addMesh, setPartOpacity, anchor, box, cyl, plate, mergeGeometries } from "@kit/build3d.js";
import { MODULE } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
/** A point of the works, written the way they are drawn: (z, y), then x (0 is the mid-plane, −x the camera's side). */
const P3 = (z, y, x = 0) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.86, 0.62);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);
/** Out between a0 and a1, held, back between b0 and b1: the side-step a part takes to let another one pass. */
const trap = (k, a0, a1, b0, b1) => smooth(ramp(k, a0, a1)) * (1 - smooth(ramp(k, b0, b1)));
const at = (c, r, a) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
const polar = (c, p) => ({ r: Math.hypot(p[0] - c[0], p[1] - c[1]), a: Math.atan2(p[1] - c[1], p[0] - c[0]) });

/* ─────────────────────────────────────────────────────────── where everything is — all in (z, y) */

const HW = MODULE.w / 2;
const TOP = MODULE.h;
const WALL = 0.14;
const SKIN = 0.12;
const SH = 4.4; //                      the shoulders the terminal screws open on
const FACE = 6.0; //                    the face of the nose; the handle reaches MODULE.d
const NOSE = [2.05, 6.45];
const RAIL = { y0: 2.45, y1: 6.05, d: 0.55 }; // the window of the DIN rail, in the back
const ENTRY = [1.6, 2.8]; //            the mouths the wires enter by, top and bottom (z)
const SLOT = [3.3, 5.2]; //             the slot of the handle, in the face (y)
const OUTLINE = [[0, 0], [SH, 0], [SH, 1.8], [4.65, NOSE[0]], [FACE, NOSE[0]], [FACE, NOSE[1]], [4.65, NOSE[1]], [SH, 6.7], [SH, TOP], [0, TOP], [0, RAIL.y1], [RAIL.d, RAIL.y1], [RAIL.d, RAIL.y0], [0, RAIL.y0]];

// the terminals: a cage round the wire, a screw toward the shoulder
const TERM = { z: 2.2, in: 7.55, out: 0.9, hz: 0.65, hy: 0.6, hx: 0.55 };

// the chamber: plates stacked along y, their notch open toward the contacts (+z), a horn above, a horn below
const PLATES = { n: 11, y0: 3.8, pitch: 0.24, t: 0.08, z0: 0.8, z1: 2.45, hw: 0.6 };
const HORN = { up: 6.46, dn: 3.54, t: 0.08, tip: [2.84, 4.25] };
const MOUTH = 2.36; //                  where the arc's column enters the plates

// the contacts: the fixed one under the feed terminal, the moving one on an arm that turns about PIV
const PIV = [4.55, 5.5];
const TIP0 = [2.75, 6.2]; //            the moving pad, closed
const OPENA = 34 * DEG; //              the arm's swing (it opens anticlockwise in (z, y): the tip goes down)
const BEAM = polar(PIV, TIP0);
const TIPTOP = polar(PIV, [TIP0[0], TIP0[1] + 0.08]);
const FIXPAD = [2.75, 6.28];
const SEAT = { r: 0.82, a: 252 * DEG }; // the arm's foot: where the link pushes, where the braid leaves
const S0 = at(PIV, SEAT.r, SEAT.a);
const S1 = at(PIV, SEAT.r, SEAT.a + OPENA);
const EYE = { r: 1.45, a: BEAM.a }; //  the pin the spring hooks on, behind the beam
const POST = [3.12, 3.72]; //           …and its post
const SPRING = { x: 0.32, r: 0.15, wire: 0.04, turns: 9 };
const SPRING_L0 = Math.hypot(...at(PIV, EYE.r, EYE.a + OPENA).map((v, i) => v - POST[i])); // at rest: contacts open
const SPRING_L1 = Math.hypot(...at(PIV, EYE.r, EYE.a).map((v, i) => v - POST[i])); //           stretched: contacts closed

// the handle and its link
const HUB = [5.5, 4.25];
const LEVER = 36 * DEG; //              ± about the horizontal: up is on
const CRANK = 0.42;
const crankAt = (a, beta) => at(HUB, CRANK, a + beta);
/** Where the crank pin sits on the hub, so that ONE link length fits both on (handle up, contacts closed) and off. */
const BETA = (() => {
  const f = (b) => Math.hypot(crankAt(LEVER, b)[0] - S0[0], crankAt(LEVER, b)[1] - S0[1]) - Math.hypot(crankAt(-LEVER, b)[0] - S1[0], crankAt(-LEVER, b)[1] - S1[1]);
  let lo = 55 * DEG;
  let hi = 100 * DEG;
  if (f(lo) * f(hi) > 0) return 76 * DEG;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (f(lo) * f(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
})();
const LINK = Math.hypot(crankAt(LEVER, BETA)[0] - S0[0], crankAt(LEVER, BETA)[1] - S0[1]);
const LINK_X = -0.56;

// the latch: a bar on a pivot — its head under the arm's tooth, its foot in front of the coil's core
const LATCH = [3.6, 3.9];
const TRIP = 14 * DEG;
const HEAD = { z: [3.5, 3.7], y: [5.07, 5.27] };
const TOOTH = [[3.58, 5.3], [3.82, 5.3], [3.82, 5.76], [3.58, 5.86]];
const ANVIL = { z: [3.27, 3.41], y: [2.38, 2.82] };

// the blade: two metals, clamped by its foot, free above
const BLADE = { z0: 4.0, z1: 4.2, y0: 1.3, clamp: 1.65, y1: 4.3, hw: 0.25 };
/** How far its free end travels (toward the rail) to reach the latch's bar. */
const DEFL = BLADE.z0 - (LATCH[0] + 0.08);
const bowAt = (y) => DEFL * clamp01((y - BLADE.clamp) / (BLADE.y1 - BLADE.clamp)) ** 2;

// the coil, lying under the chamber: its core leaves toward the latch's foot
const COIL = { y: 2.6, z0: 0.85, z1: 2.25, r: 0.42, wire: 0.1, turns: 6, core: 0.17, tip: 2.5 };
const TRAVEL = ANVIL.z[0] - COIL.tip;
const RINGS = { n: 5, r: 0.8, z0: 0.7, span: 2.4, rate: 0.3 }; // the field: rings that travel the way the core is thrown

// The exploded view: two tiers, each a row across a camera filming toward az −60. Below, standing on the bench:
// the cover · the far shell, and lifted out of it toward the eye the two terminals and the chamber. Above: the
// handle and its link · the latch · the spring · the two contacts · the blade · the coil and its core.
const ROW_AZ = -60 * DEG;
const ROW = { x: Math.cos(ROW_AZ), z: -Math.sin(ROW_AZ), cz: 3.3 };
/** The offset that takes a part whose centre is `c` ([x, y, z]) to the place `s` of the row (cm, + to the right), at height `y`. */
const slot = (c, s, y = c[1]) => [s * ROW.x - c[0], y - c[1], ROW.cz + s * ROW.z - c[2]];
const TIER = 10.8;
const EXPL = {
  near: slot([-0.45, 4.25, 3.0], -3.6),
  far: slot([0.45, 4.25, 3.0], 3.4),
  handle: slot([0, HUB[1], 5.95], -5.65, TIER),
  latch: slot([-0.075, 3.9, 3.5], -3.85, TIER),
  spring: slot([SPRING.x, POST[1] + 0.75, POST[0]], -3.05, TIER),
  contacts: slot([0, 6.2, 2.75], -0.2, TIER + 0.3),
  blade: slot([0, 2.8, 4.1], 2.85, TIER),
  coil: slot([0, COIL.y, 1.55], 4.4, TIER - 0.3),
};
const LIFT_OUT = 1.6; // the terminals and the chamber stay in front of their seats in the far shell, lifted out of it
const OUT_X = 1.7; // how far the works step out of the far shell (toward the camera) before they go to their places

const DASH = { period: 0.5, speed: 1.6 }; // cm, cm/s: 0.053 cm a frame, a ninth of a period — it runs, it does not strobe

/* ─────────────────────────────────────────────────────────── geometry */

const lyingZ = (g) => g.rotateX(Math.PI / 2); // a lathe's axis (y) laid along +z
const lyingX = (g) => g.rotateZ(-Math.PI / 2); // …along +x
/** A flat piece drawn in (z, y), `t` thick along x, centred on `xc`. */
const slab = (outline, t, xc = 0, bevel = 0.03) => plate(outline, t, { bevel }).rotateY(-Math.PI / 2).translate(xc + t / 2, 0, 0);
/** A box from its six faces. */
const bx = (z0, z1, y0, y1, x0, x1, r = 0.03) => box(x1 - x0, y1 - y0, z1 - z0, r, 2).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
/** A pin along x, at (z, y). */
const pinX = (z, y, x0, x1, r, bevel = 0.02, seg = 20) => lyingX(cyl(r, x1 - x0, bevel, seg)).translate((x0 + x1) / 2, y, z);
/** A rod along z, at height y. */
const rodZ = (y, z0, z1, r, bevel = 0.03, seg = 28, x = 0) => lyingZ(cyl(r, z1 - z0, bevel, seg)).translate(x, y, (z0 + z1) / 2);
/** A tapered bar from a to b, half as wide as `wa` then `wb`. */
const quad = (a, b, wa, wb) => {
  const dz = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dz, dy);
  const nz = -dy / l;
  const ny = dz / l;
  return [[a[0] + nz * wa, a[1] + ny * wa], [b[0] + nz * wb, b[1] + ny * wb], [b[0] - nz * wb, b[1] - ny * wb], [a[0] - nz * wa, a[1] - ny * wa]];
};
const rel = (pts, c) => pts.map(([z, y]) => [z - c[0], y - c[1]]);
/** An open polyline given a thickness `t` on its left: a bent strap, a stretch of wall (the outline runs anticlockwise: left is inside). */
function strip(path, t) {
  const n = path.length;
  const normals = [];
  for (let i = 0; i < n - 1; i++) {
    const dz = path[i + 1][0] - path[i][0];
    const dy = path[i + 1][1] - path[i][1];
    const l = Math.hypot(dz, dy);
    normals.push([-dy / l, dz / l]);
  }
  const inner = path.map((p, i) => {
    const a = normals[Math.max(0, i - 1)];
    const b = normals[Math.min(n - 2, i)];
    const k = t / (1 + a[0] * b[0] + a[1] * b[1]);
    return [p[0] + (a[0] + b[0]) * k, p[1] + (a[1] + b[1]) * k];
  });
  return [...path, ...inner.reverse()];
}
/** A stroke of width `w` along an open polyline (print on the face). */
function stroke(path, w) {
  const n = path.length;
  const left = [];
  const right = [];
  for (let i = 0; i < n; i++) {
    const a = path[Math.max(0, i - 1)];
    const b = path[Math.min(n - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const dx = (b[0] - a[0]) / l;
    const dy = (b[1] - a[1]) / l;
    left.push([path[i][0] - (dy * w) / 2, path[i][1] + (dx * w) / 2]);
    right.push([path[i][0] + (dy * w) / 2, path[i][1] - (dx * w) / 2]);
  }
  return [...left, ...right.reverse()];
}
const flat = (pts) => new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))));

/** A polyline with its corners rounded, the way a wire is bent. `cut`: how far each corner is cut back. */
function bent(points, cut = 0.2, steps = 6) {
  const out = [];
  points.forEach((p, i) => {
    const a = points[i - 1];
    const b = points[i + 1];
    if (!a || !b) return out.push(p.clone());
    const u = a.clone().sub(p);
    const v = b.clone().sub(p);
    const k = Math.min(cut, u.length() / 2.2, v.length() / 2.2);
    const from = p.clone().addScaledVector(u.normalize(), k);
    const to = p.clone().addScaledVector(v.normalize(), k);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      out.push(from.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(p, 2 * t * (1 - t)).addScaledVector(to, t * t));
    }
  });
  return out;
}
/** No stretch of a polyline longer than `stride`. */
function resampled(points, stride = 0.08) {
  const out = [points[0].clone()];
  for (let i = 1; i < points.length; i++) {
    const n = Math.max(1, Math.ceil(points[i].distanceTo(points[i - 1]) / stride));
    for (let j = 1; j <= n; j++) out.push(points[i - 1].clone().lerp(points[i], j / n));
  }
  return out;
}
const lengthOf = (points) => points.reduce((sum, p, i) => sum + (i ? p.distanceTo(points[i - 1]) : 0), 0);
/** A supple line through a few points, as `n` + 1 points evenly spread: two of them morph into each other. */
const supple = (points, n) => new THREE.CatmullRomCurve3(points, false, "centripetal").getSpacedPoints(n);

/**
 * A round swept through `points` (its frame carried from one to the next: no twist at a bend). `radii`: one number, or
 * one per point. It carries `aS`, the length run since the first point (plus `s0`), and `aRad`. `onPath`: the vertices
 * are left ON the path — the shader pushes them out by their radius, or by a few pixels if that is more.
 */
function tube(points, radii, { radial = 10, onPath = false, s0 = 0 } = {}) {
  const n = points.length;
  const ring = radial + 1;
  const pos = [];
  const nor = [];
  const sAt = [];
  const rad = [];
  const index = [];
  const T = V();
  const T0 = V();
  const N = V();
  const Bn = V();
  const axis = V();
  const d = V();
  const q = new THREE.Quaternion();
  let s = 0;
  for (let i = 0; i < n; i++) {
    if (i) s += points[i].distanceTo(points[i - 1]);
    T.subVectors(points[Math.min(n - 1, i + 1)], points[Math.max(0, i - 1)]).normalize();
    if (i === 0) N.set(Math.abs(T.x) > 0.9 ? 0 : 1, 0, Math.abs(T.x) > 0.9 ? 1 : 0);
    else {
      axis.crossVectors(T0, T);
      const sin = axis.length();
      if (sin > 1e-7) N.applyQuaternion(q.setFromAxisAngle(axis.divideScalar(sin), Math.atan2(sin, T0.dot(T))));
    }
    N.addScaledVector(T, -N.dot(T)).normalize();
    T0.copy(T);
    Bn.crossVectors(T, N);
    const r = radii.length ? radii[i] : radii;
    const p = points[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      d.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(Bn, Math.sin(a));
      if (onPath) pos.push(p.x, p.y, p.z);
      else pos.push(p.x + d.x * r, p.y + d.y * r, p.z + d.z * r);
      nor.push(d.x, d.y, d.z);
      sAt.push(s + s0);
      rad.push(r);
    }
    if (i) {
      for (let j = 0; j < radial; j++) {
        const a = (i - 1) * ring + j;
        index.push(a, a + 1, a + ring, a + ring, a + 1, a + ring + 1);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("aS", new THREE.Float32BufferAttribute(sAt, 1));
  geo.setAttribute("aRad", new THREE.Float32BufferAttribute(rad, 1));
  geo.setIndex(index);
  return geo;
}

/** A spring along +y from the origin, `length` long: same wire, same turns whatever its length — two of them morph. Its ends close on the axis: the hooks. */
function helix(length, { r, wire, turns }) {
  const n = turns * 26;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const th = t * turns * Math.PI * 2;
    const rr = r * smooth(clamp01((Math.min(t, 1 - t) * turns) / 0.7));
    pts.push(V(rr * Math.cos(th), t * length, rr * Math.sin(th)));
  }
  return tube(pts, wire, { radial: 8 });
}

/** `count` ribbons of `segs` stretches each, to be laid along a curve by the shader: `aT` along, `aSide` across, `aK` which one. */
function ribbons(count, segs) {
  const pos = [];
  const t = [];
  const side = [];
  const which = [];
  const index = [];
  for (let k = 0; k < count; k++) {
    for (let i = 0; i <= segs; i++) {
      for (const s of [-1, 1]) {
        pos.push(0, 0, 0);
        t.push(i / segs);
        side.push(s);
        which.push(k);
      }
    }
    for (let i = 0; i < segs; i++) {
      const a = (k * (segs + 1) + i) * 2;
      index.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aT", new THREE.Float32BufferAttribute(t, 1));
  geo.setAttribute("aSide", new THREE.Float32BufferAttribute(side, 1));
  geo.setAttribute("aK", new THREE.Float32BufferAttribute(which, 1));
  geo.setIndex(index);
  return geo;
}

/* ─────────────────────────────────────────────────────────── light that has a place */

const BARS = /* glsl */ `
  // bars of light, their ends softened over what a pixel covers — and melted into their mean once too small to count
  float bars(float x, float duty) {
    float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
    float q = fract(x);
    float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
    return mix(b, duty, smoothstep(0.12, 0.4, w));
  }`;
/** A sheath of light round a line: never thinner than `uMinPx`. MORPH: it follows a part that bends (two other shapes, as attributes). */
const SHEATH = /* glsl */ `
  attribute float aS; attribute float aRad; uniform float uMinPx, uGrow;
  #ifdef GAIN
  attribute float aGain; varying float vGain;
  #endif
  #ifdef MORPH
  attribute vec3 aPos1; attribute vec3 aPos2; uniform float uM1, uM2;
  #endif
  varying float vS; varying vec3 vN; varying vec3 vV;
  void main() {
    vec3 p = position;
    #ifdef MORPH
    p += uM1 * (aPos1 - position) + uM2 * (aPos2 - position);
    #endif
    vec4 c = modelViewMatrix * vec4(p, 1.0);
    float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
    vec4 mv = modelViewMatrix * vec4(p + normal * max(aRad * uGrow, uMinPx * cmPerPx), 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vS = aS;
    #ifdef GAIN
    vGain = aGain;
    #endif
    gl_Position = projectionMatrix * mv;
  }`;

/**
 * The current, as a sheath of light on the visible face of each conductor (s = 0 where it enters the breaker).
 *   uLevel  how bright · uColor its hue (ink, then signal) · uDuty how much of a period a dash takes (1: a solid line)
 *   uCore   a white-hot heart inside it (the short circuit) · uGrow the sheath swells
 */
function current() {
  const shared = {
    uColor: { value: INK.clone() }, uHot: { value: HOT.clone() }, uTime: { value: 0 }, uLevel: { value: 0 }, uDuty: { value: 0.5 },
    uCore: { value: 0 }, uGrow: { value: 1 }, uAmount: { value: 1 }, uMinPx: { value: 2.2 },
  };
  const make = (morph) => {
    const uniforms = morph ? { ...shared, uM1: { value: 0 }, uM2: { value: 0 } } : shared;
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      defines: morph ? { MORPH: 1, GAIN: 1 } : { GAIN: 1 },
      uniforms,
      vertexShader: SHEATH,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor, uHot; uniform float uTime, uLevel, uDuty, uCore, uAmount;
        varying float vS; varying vec3 vN; varying vec3 vV; varying float vGain;
        ${BARS}
        void main() {
          float facing = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
          float body = pow(facing, 1.15);
          float dash = bars((vS - uTime * ${DASH.speed.toFixed(2)}) / ${DASH.period.toFixed(2)}, uDuty);
          float light = uLevel * mix(0.1, 1.0, dash);
          vec3 col = uColor * min(light, 2.4) * body + uHot * (uCore * smoothstep(0.62, 0.95, facing) * mix(0.55, 1.0, dash));
          gl_FragColor = vec4(col * (uAmount * vGain), 1.0);
        }`,
    });
  };
  return { u: shared, make };
}

/** A soft tube of light with no pattern: the glow round the blade, the rings of the coil's field. */
const auraMaterial = (color, extra = "", vertex = SHEATH, defines = {}) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    defines,
    uniforms: { uColor: { value: color.clone() }, uAmount: { value: 0 }, uMinPx: { value: 0 }, uGrow: { value: 1 }, uM1: { value: 0 }, uM2: { value: 0 }, uTime: { value: 0 } },
    vertexShader: vertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.6);
        gl_FragColor = vec4(uColor * (body * uAmount ${extra}), 1.0);
      }`,
  });

/** The coil's field: rings round its axis that travel the way the core is thrown, and close on it as they arrive. */
const ringMaterial = () =>
  auraMaterial(
    VEILLE,
    "* vS",
    /* glsl */ `
    attribute float aRad; attribute float aK; uniform float uMinPx, uTime;
    varying float vS; varying vec3 vN; varying vec3 vV;
    void main() {
      float u = fract(aK / ${RINGS.n.toFixed(1)} + uTime * ${RINGS.rate.toFixed(3)}); // where this ring is on its way
      float close = mix(1.0, 0.5, smoothstep(0.55, 1.0, u));
      vec3 p = vec3(position.x * close, ${COIL.y.toFixed(2)} + (position.y - ${COIL.y.toFixed(2)}) * close, ${RINGS.z0.toFixed(2)} + u * ${RINGS.span.toFixed(2)});
      vec4 c = modelViewMatrix * vec4(p, 1.0);
      float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
      vec4 mv = modelViewMatrix * vec4(p + normal * max(aRad, uMinPx * cmPerPx), 1.0);
      vN = normalize(normalMatrix * normal);
      vV = normalize(-mv.xyz);
      vS = sin(3.14159 * u); // it comes out of the dark and goes back to it
      gl_Position = projectionMatrix * mv;
    }`,
  );

/**
 * The arc: a ribbon laid along a curve and turned to the eye — a white-hot core with a clear edge, the hot air
 * round it (signal), a long halo. One ribbon between two feet (uA, uB, bowed toward uC), or, SLICES, one short
 * ribbon per gap between two plates (aA, aB), all on the column `uCol` (z).
 */
const arcMaterial = (slices) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    defines: slices ? { SLICES: 1 } : {},
    uniforms: {
      uA: { value: V() }, uB: { value: V() }, uC: { value: V() }, uCol: { value: 0 }, uTime: { value: 0 }, uWander: { value: 0.03 },
      uWidth: { value: slices ? 0.3 : 0.6 }, uMinPx: { value: slices ? 6 : 11 }, uQ: { value: 7 }, uFeather: { value: slices ? 0.16 : 0.06 },
      uHue: { value: SIGNAL.clone() }, uHot: { value: HOT.clone() }, uK: { value: new THREE.Vector3(slices ? 0.22 : 0.36, slices ? 0.7 : 0.9, slices ? 2.8 : 3.0) }, uAmount: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aT; attribute float aSide; attribute float aK;
      #ifdef SLICES
      attribute vec3 aA; attribute vec3 aB; uniform float uCol;
      #else
      uniform vec3 uA, uB, uC; uniform float uWander;
      #endif
      uniform float uTime, uWidth, uMinPx;
      varying float vAcross; varying float vT;
      void main() {
        float t = aT;
        #ifdef SLICES
        float sway = 0.03 * sin(aK * 2.4 + uTime * 2.6);
        vec3 A = aA + vec3(0.0, 0.0, uCol + sway);
        vec3 B = aB + vec3(0.0, 0.0, uCol - sway);
        vec3 C = 0.5 * (A + B) + vec3(0.0, 0.0, 0.03 * sin(aK * 1.7 + uTime * 3.1));
        #else
        vec3 A = uA; vec3 B = uB; vec3 C = uC;
        #endif
        float m = 1.0 - t;
        vec3 p = m * m * A + 2.0 * t * m * C + t * t * B;
        vec3 d = 2.0 * m * (C - A) + 2.0 * t * (B - C);
        #ifndef SLICES
        // it wanders, slowly: the film is in slow motion
        vec3 off = C - 0.5 * (A + B);
        float lo = length(off);
        vec3 bow = lo > 1e-4 ? off / lo : vec3(0.0, 0.0, -1.0);
        p += bow * (uWander * sin(3.14159 * t) * (sin(t * 9.0 + uTime * 4.0) + 0.6 * sin(t * 17.0 - uTime * 6.3)));
        #endif
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vec3 tv = (modelViewMatrix * vec4(d, 0.0)).xyz;
        vec3 s = cross(tv, -mv.xyz);
        float ls = length(s);
        s = ls > 1e-6 ? s / ls : vec3(1.0, 0.0, 0.0);
        float w = max(uWidth, uMinPx * max(1.0, -mv.z) / (projectionMatrix[1][1] * ${H2}));
        mv.xyz += s * (aSide * w);
        vAcross = aSide;
        vT = t;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue, uHot, uK; uniform float uAmount, uQ, uFeather;
      varying float vAcross; varying float vT;
      void main() {
        float x = abs(vAcross) * uQ; // the distance to the axis, in radii of the core
        float core = 1.0 - smoothstep(0.7, 1.3, x);
        float sheath = exp(-x * x / 5.8);
        float h = x / 3.0;
        float halo = pow(1.0 + h * h, -1.4) * (1.0 - smoothstep(0.5 * uQ, uQ, x));
        float ends = smoothstep(0.0, uFeather, vT) * (1.0 - smoothstep(1.0 - uFeather, 1.0, vT));
        vec3 col = uHue * (halo * uK.x + sheath * uK.y) + uHot * (core * uK.z);
        gl_FragColor = vec4(col * (uAmount * ends), 1.0);
      }`,
  });

/**
 * A ball of light with no edge, always facing the eye: a small hot heart, a soft body, a long tail. `uRadius` cm
 * (where the tail ends), never under `uMinPx` pixels. It stands where it is: what is in front of it hides it.
 */
const ballMaterial = (heart, hue) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uRadius, uMinPx; varying vec2 vUv;
      void main() {
        vUv = position.xy;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        c.xy += position.xy * r;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        float core = exp(-r2 / 0.012);
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
        gl_FragColor = vec4((uHeart * (core * 2.4) + uHue * (body + tail)) * uAmount, 1.0);
      }`,
  });
function makeBall(heart, hue) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ballMaterial(heart, hue));
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  mesh.visible = false;
  return mesh;
}
const lightMesh = (geometry, material, order = 4) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
};

/* ─────────────────────────────────────────────────────────── the case */

// the walls, stretch by stretch along the outline (anticlockwise): between them, the mouths of the two wires and
// the slot of the handle; the shoulders are closed by the plates the screws show through
const WALLS = [
  [[ENTRY[1], 0], [SH, 0]],
  [[SH, 1.8], [4.65, NOSE[0]], [FACE, NOSE[0]], [FACE, SLOT[0]]],
  [[FACE, SLOT[1]], [FACE, NOSE[1]], [4.65, NOSE[1]], [SH, 6.7]],
  [[SH, TOP], [ENTRY[1], TOP]],
  [[ENTRY[0], TOP], [0, TOP], [0, RAIL.y1], [RAIL.d, RAIL.y1], [RAIL.d, RAIL.y0], [0, RAIL.y0], [0, 0], [ENTRY[0], 0]],
];
/** A shoulder: a plate facing +z with half a round hole on the seam — the screw's head shows in it. */
function shoulder(y0, y1, yc, side) {
  const pts = [[0, y0], [HW, y0], [HW, y1], [0, y1]];
  for (let i = 0; i <= 12; i++) pts.push([0.34 * Math.cos((90 - i * 15) * DEG), yc + 0.34 * Math.sin((90 - i * 15) * DEG)]);
  return plate(side > 0 ? pts : pts.map(([x, y]) => [-x, y]).reverse(), WALL, { bevel: 0.025 }).translate(0, 0, SH - WALL);
}
/** One half of the case: `side` +1 the far half (+x), −1 the cover (−x). */
function shellHalf(side) {
  const deep = HW - SKIN;
  const x = (a, b) => (side > 0 ? [a, b] : [-b, -a]);
  return mergeGeometries([
    slab(OUTLINE, SKIN, side * (HW - SKIN / 2), 0.05), // the flank
    ...WALLS.map((path) => slab(strip(path, WALL), deep, (side * deep) / 2, 0.025)),
    shoulder(6.7, TOP, TERM.in, side),
    shoulder(0, 1.8, TERM.out, side),
    bx(ENTRY[0], ENTRY[1], TOP - WALL, TOP, ...x(0.5, HW)), // the cheeks of the wires' mouths…
    bx(ENTRY[0], ENTRY[1], 0, WALL, ...x(0.5, HW)),
    bx(FACE - WALL, FACE, SLOT[0], SLOT[1], ...x(0.5, HW)), // …and of the handle's slot
    bx(0, 0.2, RAIL.y1 - 0.2, RAIL.y1, ...x(0, HW)), // the two beaks that hold the rail
    bx(0, 0.2, RAIL.y0, RAIL.y0 + 0.2, ...x(0, HW)),
  ]);
}

// "C16", printed on the face: strokes in a box 1 wide, 1.8 high
const GLYPH = {
  C: [Array.from({ length: 15 }, (_, i) => [0.5 + 0.5 * Math.cos((50 + i * 18.6) * DEG), 0.9 + 0.9 * Math.sin((50 + i * 18.6) * DEG)])],
  1: [[[0.12, 1.32], [0.62, 1.8], [0.62, 0]]],
  6: [[[0.92, 1.6], [0.62, 1.8], [0.3, 1.66], [0.08, 1.3], [0, 0.8], [0.06, 0.4], [0.26, 0.08], [0.56, 0], [0.84, 0.12], [1, 0.42], [0.98, 0.76], [0.8, 1.02], [0.52, 1.1], [0.24, 1.0], [0.04, 0.72]]],
};
function printed(text, x0, y0, h, gap = 0.3) {
  const k = h / 1.8;
  const pieces = [];
  [...text].forEach((ch, i) => {
    for (const path of GLYPH[ch]) pieces.push(flat(stroke(path.map(([x, y]) => [x0 + (i * (1 + gap) + x) * k, y0 + y * k]), 0.19 * k)));
  });
  return mergeGeometries(pieces).translate(0, 0, FACE + 0.004);
}

/* ─────────────────────────────────────────────────────────── the system */

/**
 * → { root, A, update(P, time, px) }. `root`: the breaker, its origin the middle of its base (world.js stands it
 * in the row of the consumer unit, or on the bench). `A`: anchors that follow their parts — turned, bent, exploded.
 * P (see FIRST in world.js):
 *   bench     not used: the breaker is the same in the row and on the bench
 *   load      the current over the rating: 0 nothing · 1 dashes of ink run from the feed terminal to the load one ·
 *             above 1 they turn signal and widen · from 2 they melt into a solid line with a white-hot heart (3: a
 *             short circuit). Nothing runs once the contacts are apart, unless an arc carries it
 *   cover     1 closed · 0 the half-shell on the −x side has stepped off and faded
 *   xray      the whole case turns to glass where it stands
 *   explode   0 → 1: the two tiers of the exploded view (the cover comes back as a part of it)
 *   handle    1 up (on) · 0 down; the link follows its crank
 *   gap       0 the contacts closed · 1 apart: the arm swings by 34°, the spring behind it shortens
 *   latch     0 the bar's head under the arm's tooth · 1 turned by 14°: the head is clear, the foot has gone
 *   bend      the blade bows toward the rail; at 1 its free end is on the latch's bar
 *   warm      the blade glows, from ink to signal; above 0.5 a halo, and a real light on its neighbours
 *   pull      the coil's field: veille rings that travel along its axis toward the latch
 *   plunger   0 the core at rest · 1 thrown: its nose on the latch's foot
 *   arc       an arc between the contacts: a ribbon, a ball of light on each foot, a real light
 *   split     0 between the contacts · 0.3 its lower foot is on the horn · 0.6 it stands in the chamber's mouth ·
 *             1 cut: one short arc in each gap of the stack, the plates glow
 *   litHandle, litSpring, litContacts, litBlade, litCoil, litChamber   0–1: the part the voice is naming glows faintly veille
 */
export function buildSystem() {
  const root = new THREE.Group();
  const grp = (parent = root) => {
    const g = new THREE.Group();
    parent.add(g);
    return g;
  };
  const partIn = (parent, name) => {
    const part = makePart(name);
    parent.add(part);
    return part;
  };
  // three values of grey
  const C = { pit: 0x0e1012, liner: 0x262b30, handle: 0x33383e, fibre: 0x2f343a, lead: 0x555c63, iron: 0x666d74, shell: 0x7e858c, steel: 0x7b828a, zinc: 0x959ca3, fine: 0xb8bec3, clear: 0xdadfe2 };
  const steel = (color = C.steel) => solid(color, { rough: 0.5, metal: 0.42 });

  /* ══ THE CASE: two half-shells ══ */
  const farG = grp();
  const far = partIn(farG, "shellFar");
  {
    const m = { shell: solid(C.shell, { rough: 0.82, env: 0.7 }), liner: solid(C.liner, { rough: 0.96, env: 0.3 }), pin: steel(C.zinc), ink: solid(0x121416, { rough: 1, env: 0.2 }) };
    const ribs = [bx(WALL, 2.5, 6.64, 6.72, 0.02, HW - SKIN), bx(RAIL.d + WALL, 2.3, 3.3, 3.38, 0.02, HW - SKIN), bx(1.3, 3.45, 1.55, 1.62, 0.02, HW - SKIN)];
    addMesh(far, mergeGeometries([shellHalf(1), ...ribs]), m.shell, { edgeOpacity: 0.5 });
    addMesh(far, slab(OUTLINE, 0.03, 0.765, 0.006), m.liner, { edges: false }); // its floor, in the shade
    // the axles moulded in it: the arm's, the latch's, the handle's; the spring's post
    addMesh(far, mergeGeometries([pinX(PIV[0], PIV[1], -0.27, 0.77, 0.075), pinX(LATCH[0], LATCH[1], -0.27, 0.77, 0.065), pinX(HUB[0], HUB[1], -0.5, 0.77, 0.12), pinX(POST[0], POST[1], 0.14, 0.77, 0.06)]), m.pin, { edgeOpacity: 0.4 });
    addMesh(far, printed("C16", 0.1, 5.58, 0.36), m.ink, { edges: false });
  }
  const nearG = grp();
  const near = partIn(nearG, "shellNear");
  {
    const m = { shell: solid(C.shell, { rough: 0.82, env: 0.7 }), ink: solid(0x121416, { rough: 1, env: 0.2 }) };
    addMesh(near, shellHalf(-1), m.shell, { edgeOpacity: 0.5 });
    // what a face carries beside its rating: a framed number, two lines of small print
    const frame = new THREE.Shape([[-0.8, 5.58], [-0.14, 5.58], [-0.14, 5.94], [-0.8, 5.94]].map(([x, y]) => new THREE.Vector2(x, y)));
    frame.holes.push(new THREE.Path([[-0.75, 5.63], [-0.19, 5.63], [-0.19, 5.89], [-0.75, 5.89]].map(([x, y]) => new THREE.Vector2(x, y))));
    const small = [[-0.7, 5.76, 0.46], [-0.78, 2.9, 0.62], [-0.78, 2.72, 0.4]].map(([x, y, w]) => flat([[x, y - 0.025], [x + w, y - 0.025], [x + w, y + 0.025], [x, y + 0.025]]));
    addMesh(near, mergeGeometries([new THREE.ShapeGeometry(frame), ...small]).translate(0, 0, FACE + 0.004), m.ink, { edges: false });
    // the rivets that hold the two halves together
    const rivets = [[0.42, 8.05], [3.95, 8.05], [0.42, 0.45], [3.95, 0.45], [5.55, 2.5], [5.55, 6.0]];
    addMesh(near, mergeGeometries(rivets.map(([z, y]) => pinX(z, y, -HW - 0.02, -HW + 0.02, 0.13, 0.015, 20))), steel(C.fine), { edgeOpacity: 0.5 });
    addMesh(near, mergeGeometries(rivets.map(([z, y]) => pinX(z, y, -HW - 0.024, -HW + 0.02, 0.06, 0.004, 14))), solid(C.pit, { rough: 1, env: 0.2 }), { edges: false });
  }
  // under the X-ray each half is one pane of glass
  const glassOf = (side) => {
    const mat = glass(BRAND.ink, { base: 0.006, rim: 0.22, power: 3, edge: 0.42, spec: 0.4, through: 0.3 });
    const mesh = new THREE.Mesh(slab(OUTLINE, HW, (side * HW) / 2, 0.06), mat);
    const lines = edgesOf(mesh.geometry, { color: BRAND.ink, width: 2, opacity: 0 });
    mesh.add(lines);
    mesh.visible = false;
    return { mesh, mat, lines };
  };
  const farGlass = glassOf(1);
  const nearGlass = glassOf(-1);
  asShell([farGlass.mesh, nearGlass.mesh], 17); // before the consumer unit's own box (wall.js: 18): what is inside goes first
  farG.add(farGlass.mesh);
  nearG.add(nearGlass.mesh);

  /* ══ THE TERMINALS ══ */
  function terminal(name, yc) {
    const g = grp();
    const part = partIn(g, name);
    const cage = new THREE.Shape([[-TERM.hx, -TERM.hz], [TERM.hx, -TERM.hz], [TERM.hx, TERM.hz], [-TERM.hx, TERM.hz]].map(([x, y]) => new THREE.Vector2(x, y)));
    cage.holes.push(new THREE.Path([[-0.33, -0.4], [0.33, -0.4], [0.33, 0.4], [-0.33, 0.4]].map(([x, y]) => new THREE.Vector2(x, y))));
    addMesh(part, plate(cage, 2 * TERM.hy, { bevel: 0.04 }).rotateX(-Math.PI / 2).translate(0, yc - TERM.hy, TERM.z), steel(C.steel), { edgeOpacity: 0.5 });
    // its screw: the head shows in the shoulder
    addMesh(part, mergeGeometries([rodZ(yc, TERM.z + 0.4, 4.14, 0.19, 0.03, 20), rodZ(yc, 4.1, 4.33, 0.29, 0.05, 28)]), steel(C.fine), { edgeOpacity: 0.5 });
    addMesh(part, bx(4.325, 4.345, yc - 0.04, yc + 0.04, -0.26, 0.26, 0.005), solid(C.pit, { rough: 1, env: 0.2 }), { edges: false });
    return { g, part };
  }
  const termIn = terminal("termIn", TERM.in);
  const termOut = terminal("termOut", TERM.out);

  /* ══ THE CHAMBER: the stack of plates, its spine, the lower horn ══ */
  const chamberG = grp();
  const chamber = partIn(chamberG, "chamber");
  const plateMat = steel(C.steel);
  {
    const { z0, z1, hw, t } = PLATES;
    const notch = [[z0, -hw], [z1, -hw], [z1, -0.42], [1.76, -0.06], [1.68, 0], [1.76, 0.06], [z1, 0.42], [z1, hw], [z0, hw]];
    const toStack = new THREE.Matrix4().makeBasis(V(0, 0, 1), V(1, 0, 0), V(0, 1, 0)); // drawn in (z, x), stacked along y
    const one = plate(notch, t, { bevel: 0.015 }).applyMatrix4(toStack);
    // (no edge lines: eleven plates edge-on would be twenty-two hairlines in two centimetres)
    addMesh(chamber, mergeGeometries(Array.from({ length: PLATES.n }, (_, i) => one.clone().translate(0, PLATES.y0 + i * PLATES.pitch - t / 2, 0))), plateMat, { edges: false });
    addMesh(chamber, mergeGeometries([bx(RAIL.d + WALL + 0.01, z0, 3.5, 6.5, -0.62, 0.62), bx(z0, z1, 3.5, 6.5, 0.61, 0.68)]), solid(C.fibre, { rough: 0.9, env: 0.5 }), { edgeOpacity: 0.35 });
    addMesh(chamber, slab(strip([[z0 - 0.02, HORN.dn], [2.5, HORN.dn], HORN.tip], HORN.t), 0.9, 0, 0.02), steel(C.lead), { edgeOpacity: 0.5 });
  }

  /* ══ THE CONTACTS ══ */
  // the fixed one: a strap down from the feed terminal, its pad underneath, and the upper horn
  const fixedG = grp();
  const fixed = partIn(fixedG, "fixed");
  addMesh(fixed, slab(strip([[2.78, TERM.in - 0.25], [2.78, HORN.up], [PLATES.z0 - 0.02, HORN.up]], HORN.t), 0.9, 0, 0.02), steel(C.lead), { edgeOpacity: 0.5 });
  const fixPadMat = steel(C.fine);
  addMesh(fixed, bx(FIXPAD[0] - 0.13, FIXPAD[0] + 0.13, FIXPAD[1], FIXPAD[1] + 0.1, -0.3, 0.15), fixPadMat, { edgeOpacity: 0.5 });

  // the moving one: an arm on a pivot — the beam and its pad, the foot the link pushes, the tooth the latch holds
  const armG = grp();
  const armPivot = grp(armG);
  armPivot.position.set(0, PIV[1], PIV[0]);
  const arm = partIn(armPivot, "arm");
  const eye0 = at(PIV, EYE.r, EYE.a);
  addMesh(
    arm,
    mergeGeometries([
      slab(rel(quad(PIV, [TIP0[0] - 0.04, TIP0[1]], 0.14, 0.085), PIV), 0.25, -0.075),
      slab(rel(quad(PIV, S0, 0.12, 0.09), PIV), 0.25, -0.075),
      slab(rel(TOOTH, PIV), 0.25, -0.075),
      pinX(0, 0, -0.22, 0.07, 0.22, 0.03, 28),
      pinX(S0[0] - PIV[0], S0[1] - PIV[1], -0.21, 0.06, 0.13, 0.02),
      pinX(S0[0] - PIV[0], S0[1] - PIV[1], -0.63, -0.2, 0.05, 0.015, 12), // the pin the link pushes
      pinX(eye0[0] - PIV[0], eye0[1] - PIV[1], 0.04, 0.48, 0.04, 0.012, 12), // the pin the spring hooks on
    ]),
    steel(C.iron),
    { edgeOpacity: 0.55 },
  );
  const tipPadMat = steel(C.fine);
  addMesh(arm, bx(TIP0[0] - 0.13 - PIV[0], TIP0[0] + 0.13 - PIV[0], TIP0[1] - 0.08 - PIV[1], TIP0[1] + 0.08 - PIV[1], -0.3, 0.15), tipPadMat, { edgeOpacity: 0.5 });

  /* ══ THE SPRING: hooked on the arm, behind it; stretched while the contacts are closed ══ */
  const springG = grp();
  const springAim = grp(springG);
  springAim.position.set(SPRING.x, POST[1], POST[0]);
  const spring = partIn(springAim, "spring");
  const springMesh = (() => {
    const geo = helix(SPRING_L0, SPRING);
    const long = helix(SPRING_L1, SPRING);
    geo.morphAttributes.position = [long.attributes.position];
    geo.morphAttributes.normal = [long.attributes.normal];
    const mesh = addMesh(spring, geo, solid(C.zinc, { rough: 0.4, metal: 0.5 }), { edges: false });
    mesh.frustumCulled = false;
    return mesh;
  })();

  /* ══ THE LATCH: one bar on a pivot ══ */
  const latchG = grp();
  const latchPivot = grp(latchG);
  latchPivot.position.set(0, LATCH[1], LATCH[0]);
  const latch = partIn(latchPivot, "latch");
  {
    const q = LATCH;
    addMesh(
      latch,
      mergeGeometries([
        slab(rel(quad(q, [q[0], HEAD.y[0] + 0.05], 0.085, 0.07), q), 0.25, -0.075),
        bx(HEAD.z[0] - q[0], HEAD.z[1] - q[0], HEAD.y[0] - q[1], HEAD.y[1] - q[1], -0.2, 0.05),
        slab(rel(quad(q, [(ANVIL.z[0] + ANVIL.z[1]) / 2 + 0.02, ANVIL.y[1] - 0.1], 0.085, 0.07), q), 0.25, -0.075),
        bx(ANVIL.z[0] - q[0], ANVIL.z[1] - q[0], ANVIL.y[0] - q[1], ANVIL.y[1] - q[1], -0.22, 0.2),
        pinX(0, 0, -0.22, 0.07, 0.16, 0.03, 24),
      ]),
      steel(C.zinc),
      { edgeOpacity: 0.55 },
    );
  }

  /* ══ THE HANDLE and its link ══ */
  const handleG = grp();
  const handlePivot = grp(handleG);
  handlePivot.position.set(0, HUB[1], HUB[0]);
  const handle = partIn(handlePivot, "handle");
  addMesh(
    handle,
    mergeGeometries([lyingX(cyl(0.6, 0.9, 0.06, 48)), slab([[0.2, -0.3], [1.42, -0.21], [1.55, -0.1], [1.55, 0.1], [1.42, 0.21], [0.2, 0.3]], 0.84, 0, 0.07)]),
    solid(C.handle, { rough: 0.55, coat: 0.4, coatRough: 0.35 }),
    { edgeOpacity: 0.75 },
  );
  addMesh(handle, pinX(CRANK * Math.cos(BETA), CRANK * Math.sin(BETA), -0.64, -0.44, 0.05, 0.015, 12), steel(C.fine), { edges: false });
  const linkG = grp();
  const linkAim = grp(linkG);
  const link = partIn(linkAim, "link");
  addMesh(link, mergeGeometries([cyl(0.045, LINK, 0.012, 12).translate(0, LINK / 2, 0), pinX(0, 0, -0.035, 0.035, 0.095, 0.015, 16), pinX(0, LINK, -0.035, 0.035, 0.095, 0.015, 16)]), steel(C.fine), { edgeOpacity: 0.35 });

  /* ══ THE BLADE: two metals, and the braid that feeds its free end ══ */
  const bladeG = grp();
  const blade = partIn(bladeG, "blade");
  const bladeMats = [solid(0xe8ebed, { rough: 0.5, metal: 0.1 }), solid(0xa3aab0, { rough: 0.55, metal: 0.12 })]; // the two metals: two greys that show (matt: a flat metallic face only mirrors the studio, which is black)
  const bladeMeshes = bladeMats.map((mat, i) => {
    const t = (BLADE.z1 - BLADE.z0) / 2;
    const geo = new THREE.BoxGeometry(2 * BLADE.hw, BLADE.y1 - BLADE.y0, t, 1, 30, 1).translate(0, (BLADE.y0 + BLADE.y1) / 2, BLADE.z0 + t / 2 + i * t);
    const bowed = geo.attributes.position.clone();
    for (let v = 0; v < bowed.count; v++) bowed.setZ(v, bowed.getZ(v) - bowAt(bowed.getY(v)));
    geo.morphAttributes.position = [bowed];
    const mesh = addMesh(blade, geo, mat, { edges: false });
    mesh.frustumCulled = false;
    return mesh;
  });
  const clamp = partIn(bladeG, "clamp");
  addMesh(clamp, bx(3.88, 4.24, 1.2, BLADE.clamp, -0.4, 0.4, 0.04), steel(C.iron), { edgeOpacity: 0.5 });
  addMesh(clamp, pinX(4.06, 1.42, -0.45, -0.38, 0.09, 0.02, 16), steel(C.fine), { edges: false });
  // the braid: from the arm's foot to the blade's free end. It follows the arm (gap) and the blade (bend)
  const braidEnd = [BLADE.z1 + 0.02, 4.15];
  const braidAt = (foot, sag) => supple([P3(foot[0], foot[1] - 0.08), P3(foot[0] + 0.2 - sag * 0.14, foot[1] - 0.2), P3(4.58 + sag * 0.24, 4.34 + sag * 0.08), P3(4.44 + sag * 0.1, 4.16), P3(...braidEnd)], 36);
  const braidPts = [braidAt(S0, 0), braidAt(S1, 1), braidAt(S0, 0).map((p, i) => p.clone().setZ(p.z - bowAt(4.2) * smooth(i / 36)))];
  const braid = partIn(bladeG, "braid");
  const braidMesh = (() => {
    const [geo, open, bowed] = braidPts.map((pts) => tube(pts, 0.075, { radial: 10 }));
    geo.morphAttributes.position = [open.attributes.position, bowed.attributes.position];
    geo.morphAttributes.normal = [open.attributes.normal, bowed.attributes.normal];
    const mesh = addMesh(braid, geo, solid(C.lead, { rough: 0.6, metal: 0.4 }), { edges: false });
    mesh.frustumCulled = false;
    return mesh;
  })();

  /* ══ THE COIL: six turns of thick wire on a bobbin, and its core ══ */
  const coilG = grp();
  const coil = partIn(coilG, "coil");
  const bobbin = partIn(coilG, "bobbin");
  addMesh(bobbin, mergeGeometries([rodZ(COIL.y, COIL.z0, COIL.z1, 0.3, 0.03, 32), rodZ(COIL.y, COIL.z0 - 0.07, COIL.z0, 0.57, 0.02, 40), rodZ(COIL.y, COIL.z1, COIL.z1 + 0.07, 0.57, 0.02, 40)]), solid(C.fibre, { rough: 0.85, env: 0.5 }), { edgeOpacity: 0.4 });
  // the wire, as the current runs it: from the blade's clamp, six turns, then down to the load terminal
  const wirePts = (() => {
    const zA = COIL.z1 - 0.12;
    const zB = COIL.z0 + 0.12;
    const low = COIL.y - COIL.r;
    const lead = bent([P3(3.9, 1.42), P3(3.62, 1.78), P3(2.6, 1.78), P3(zA + 0.04, 1.88), P3(zA, low)], 0.18);
    const n = COIL.turns * 40;
    const turns = Array.from({ length: n + 1 }, (_, i) => {
      const phi = (i / n) * COIL.turns * Math.PI * 2;
      return P3(lerp(zA, zB, i / n), COIL.y - COIL.r * Math.cos(phi), -COIL.r * Math.sin(phi));
    });
    const tail = bent([P3(zB, low), P3(zB, 1.94), P3(0.72, 1.62), P3(0.62, 1.2), P3(0.84, TERM.out), P3(TERM.z - TERM.hz + 0.02, TERM.out)], 0.18);
    return resampled([...lead, ...turns.slice(1), ...tail.slice(1)], 0.07);
  })();
  const coilMat = solid(C.clear, { rough: 0.38, metal: 0.45 });
  addMesh(coil, tube(wirePts, COIL.wire, { radial: 10 }), coilMat, { edges: false });
  const plungerSlide = grp(coilG);
  const plunger = partIn(plungerSlide, "plunger");
  addMesh(plunger, rodZ(COIL.y, COIL.z0 - 0.14, COIL.tip, COIL.core, 0.07, 28), steel(C.fine), { edgeOpacity: 0.5 });
  // its field
  const ringMat = ringMaterial();
  const rings = (() => {
    const circle = Array.from({ length: 65 }, (_, i) => V(RINGS.r * Math.cos((i / 64) * Math.PI * 2), COIL.y + RINGS.r * Math.sin((i / 64) * Math.PI * 2), 0));
    const geos = Array.from({ length: RINGS.n }, (_, k) => {
      const geo = tube(circle, 0.045, { radial: 8, onPath: true });
      geo.setAttribute("aK", new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count).fill(k), 1));
      return geo;
    });
    return lightMesh(mergeGeometries(geos), ringMat);
  })();
  rings.visible = false;
  coilG.add(rings);

  /* ══ THE CURRENT: a sheath of light on the visible face of each conductor, from one terminal to the other ══ */
  const flow = current();
  const rigid = flow.make(false);
  const pathG = grp();
  let run = 0;
  /** One stretch of the path. `shapes`: the same stretch bent otherwise (the braid, the blade) — the shader blends them. */
  const stretch = (parent, pts, radius, shapes = null, gain = 1) => {
    const geo = tube(pts, radius, { radial: 10, onPath: true, s0: run });
    geo.setAttribute("aGain", new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count).fill(gain), 1));
    let material = rigid;
    if (shapes) {
      material = flow.make(true);
      shapes.forEach((other, i) => geo.setAttribute(`aPos${i + 1}`, tube(other, radius, { radial: 10, onPath: true }).attributes.position));
      if (shapes.length < 2) geo.setAttribute("aPos2", geo.attributes.position);
    }
    run += lengthOf(pts);
    parent.add(lightMesh(geo, material));
    return material;
  };
  // into the feed terminal, down its cage, the strap, the fixed pad
  stretch(pathG, resampled(bent([P3(TERM.z, TOP - 0.05, -0.57), P3(TERM.z, TERM.in - 0.1, -0.57), P3(2.6, TERM.in - 0.3, -0.57), P3(2.82, TERM.in - 0.45, -0.47), P3(2.82, HORN.up + 0.06, -0.47), P3(FIXPAD[0], FIXPAD[1] + 0.04, -0.32)], 0.12)), 0.075);
  // the moving pad, the beam, the pivot, the leg down to the arm's foot (in the arm's own frame: it turns with it)
  stretch(armPivot, resampled(bent([P3(TIP0[0] - PIV[0], TIP0[1] - PIV[1], -0.32), P3(TIP0[0] + 0.3 - PIV[0], TIP0[1] - 0.1 - PIV[1], -0.22), P3(-0.12, 0.06, -0.24), P3(S0[0] - PIV[0], S0[1] - PIV[1], -0.22)], 0.12)), 0.075);
  const braidFlow = stretch(pathG, braidPts[0], 0.095, [braidPts[1], braidPts[2]], 0.8);
  // down the blade, from its free end to its clamp
  const bladeLine = resampled([P3((BLADE.z0 + BLADE.z1) / 2, 4.14, -BLADE.hw - 0.015), P3((BLADE.z0 + BLADE.z1) / 2, 1.56, -BLADE.hw - 0.015)], 0.07);
  const bladeBowed = bladeLine.map((p) => p.clone().setZ(p.z - bowAt(p.y)));
  const bladeFlow = stretch(pathG, bladeLine, 0.05, [bladeBowed]);
  stretch(pathG, resampled(bent([P3(4.1, 1.56, -BLADE.hw - 0.015), P3(4.06, 1.42, -0.42), P3(3.94, 1.42, -0.1), wirePts[0]], 0.08)), 0.075);
  stretch(pathG, wirePts, COIL.wire + 0.012, null, 0.42);
  // the load terminal's cage, and out
  stretch(pathG, resampled(bent([wirePts.at(-1), P3(TERM.z - TERM.hz, TERM.out, -0.3), P3(TERM.z - 0.4, TERM.out, -0.57), P3(TERM.z, TERM.out - 0.1, -0.57), P3(TERM.z, 0.05, -0.57)], 0.12)), 0.075);

  /* ══ THE HEAT of the blade: a glow that has a place, a real light on its neighbours ══ */
  const bladeAura = auraMaterial(SIGNAL, "", SHEATH, { MORPH: 1 });
  {
    const line = resampled([P3((BLADE.z0 + BLADE.z1) / 2, BLADE.y1 + 0.1, 0), P3((BLADE.z0 + BLADE.z1) / 2, BLADE.clamp, 0)], 0.1);
    const geo = tube(line, line.map((p) => 0.34 * (0.4 + 0.6 * Math.sin(Math.PI * clamp01((p.y - BLADE.clamp + 0.3) / (BLADE.y1 - BLADE.clamp + 0.6))))), { radial: 12, onPath: true });
    geo.setAttribute("aPos1", tube(line.map((p) => p.clone().setZ(p.z - bowAt(p.y))), 0.5, { radial: 12, onPath: true }).attributes.position);
    geo.setAttribute("aPos2", geo.attributes.position);
    bladeG.add(lightMesh(geo, bladeAura, 3));
  }
  const bladeLight = new THREE.PointLight(BRAND.signal, 0, 7, 2);
  bladeLight.position.set(-0.7, 3.3, 3.8);
  bladeG.add(bladeLight);

  /* ══ THE ARC ══ */
  const arcG = grp();
  const arcMat = arcMaterial(false);
  const arcMesh = lightMesh(ribbons(1, 28), arcMat, 5);
  const SLICE_X = -0.5; // near the plates' front edge: they show between the plates, from the side as from above
  const sliceMat = arcMaterial(true);
  const sliceMesh = (() => {
    const segs = 6;
    const geo = ribbons(PLATES.n + 1, segs);
    const a = [];
    const b = [];
    for (let k = 0; k <= PLATES.n; k++) {
      // one per gap of the stack — and one between each horn and the plate next to it
      const y0 = k === 0 ? HORN.dn + HORN.t : PLATES.y0 + (k - 1) * PLATES.pitch + PLATES.t / 2;
      const y1 = k === PLATES.n ? HORN.up - HORN.t : PLATES.y0 + k * PLATES.pitch - PLATES.t / 2;
      for (let v = 0; v < (segs + 1) * 2; v++) {
        a.push(SLICE_X, y0, 0);
        b.push(SLICE_X, y1, 0);
      }
    }
    geo.setAttribute("aA", new THREE.Float32BufferAttribute(a, 3));
    geo.setAttribute("aB", new THREE.Float32BufferAttribute(b, 3));
    return lightMesh(geo, sliceMat, 5);
  })();
  const footUp = makeBall(HOT, SIGNAL);
  const footDn = makeBall(HOT, SIGNAL);
  const arcLight = new THREE.PointLight(BRAND.signal, 0, 9, 2);
  arcG.add(arcMesh, sliceMesh, footUp, footDn, arcLight);
  arcMesh.visible = sliceMesh.visible = false;

  /* ── anchors ── */
  const A = {
    handle: anchor(handlePivot, -0.42, 0, 1.5),
    link: anchor(linkAim, 0, LINK / 2, 0),
    spring: anchor(springAim, -0.2, SPRING_L0 * 0.55, 0),
    latch: anchor(latchPivot, -0.2, HEAD.y[1] - LATCH[1], 0),
    latchFoot: anchor(latchPivot, -0.22, ANVIL.y[1] - LATCH[1], ANVIL.z[0] - LATCH[0]),
    contacts: anchor(fixedG, -0.3, FIXPAD[1], FIXPAD[0]),
    arm: anchor(armPivot, -0.2, 0.3, -0.8),
    blade: anchor(bladeG, -BLADE.hw, 3.0, BLADE.z0),
    bladeTip: anchor(bladeG, -BLADE.hw, BLADE.y1, BLADE.z0),
    coil: anchor(coilG, -0.3, COIL.y + COIL.r + COIL.wire, (COIL.z0 + COIL.z1) / 2),
    plunger: anchor(plungerSlide, -COIL.core, COIL.y, COIL.tip),
    chamber: anchor(chamberG, -PLATES.hw, PLATES.y0 + PLATES.pitch * 5, 1.6),
    arc: anchor(arcG, 0, (FIXPAD[1] + TIP0[1]) / 2, FIXPAD[0]),
    termIn: anchor(termIn.g, 0, TOP, TERM.z),
    termOut: anchor(termOut.g, 0, 0, TERM.z),
    top: anchor(root, 0, TOP, TERM.z),
    face: anchor(root, 0, 5.76, FACE),
    side: anchor(root, -HW, 4.25, 2.6),
  };

  /* ── what lights up when the voice names a part: its solids, and the lines of its edges ── */
  const special = new Set([...bladeMats, fixPadMat, tipPadMat, plateMat, coilMat]); // their emission is written every frame
  const glowOf = (mat) => 0.11 * (1 - 0.85 * Math.min(1, 0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b));
  const lampOf = (...parts) => {
    const mats = parts.flatMap((part) => [...part.userData.part.mats]);
    const lines = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lines) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.glow = glowOf(mat);
    }
    return { solids, lines, on: -1 };
  };
  const lamps = { handle: lampOf(handle, link), spring: lampOf(spring), contacts: lampOf(fixed, arm), blade: lampOf(blade), coil: lampOf(coil, plunger), chamber: lampOf(chamber) };
  const light = (lamp, k) => {
    if (lamp.on === k) return;
    lamp.on = k;
    for (const mat of lamp.solids) {
      if (!special.has(mat)) mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k);
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.7 * k);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };
  /** A material that is hot AND named: its heat (a colour, how much), plus the faint veille of its lamp. */
  const tmp = new THREE.Color();
  const emit = (mat, heat, amount, lit) => {
    const g = mat.userData.glow * lit;
    mat.emissive.setRGB(heat.r * amount + VEILLE.r * g, heat.g * amount + VEILLE.g * g, heat.b * amount + VEILLE.b * g);
  };
  const put = (group, to, e, out = 0, by = OUT_X) => group.position.set(to[0] * e - by * out, to[1] * e, to[2] * e);
  const stagger = (k, i) => settle(ramp(k, 0.26 + 0.016 * i, 0.88 + 0.016 * i));

  return {
    root, A,
    parts: { far, near, handle, link, spring, latch, fixed, arm, blade, braid, coil, plunger, chamber, termIn: termIn.part, termOut: termOut.part },
    update(P, time = 0) {
      const k = clamp01(P.explode ?? 0);
      const whole = 1 - smooth(ramp(k, 0, 0.15)); // what only makes sense assembled leaves first
      const apart = smooth(ramp(k, 0.6, 1));
      const load = Math.max(0, P.load ?? 0);
      const cover = clamp01(P.cover ?? 1);
      const xray = clamp01(P.xray ?? 0);
      const gap = clamp01(P.gap ?? 0);
      const bend = clamp01(P.bend ?? 0);
      const warm = clamp01(P.warm ?? 0);
      const pull = clamp01(P.pull ?? 0);
      const arc = clamp01(P.arc ?? 0);
      const split = clamp01(P.split ?? 0);
      const litContacts = clamp01(P.litContacts ?? 0);
      const litBlade = clamp01(P.litBlade ?? 0);
      const litCoil = clamp01(P.litCoil ?? 0);
      const litChamber = clamp01(P.litChamber ?? 0);

      // ── the handle, the arm, the link between them, the latch
      const lever = (2 * clamp01(P.handle ?? 1) - 1) * LEVER;
      handlePivot.rotation.x = -lever;
      const swing = gap * OPENA;
      armPivot.rotation.x = -swing;
      const cz = HUB[0] + CRANK * Math.cos(lever + BETA);
      const cy = HUB[1] + CRANK * Math.sin(lever + BETA);
      const sz = PIV[0] + SEAT.r * Math.cos(SEAT.a + swing);
      const sy = PIV[1] + SEAT.r * Math.sin(SEAT.a + swing);
      linkAim.position.set(LINK_X, cy, cz);
      linkAim.rotation.x = Math.atan2(sz - cz, sy - cy);
      latchPivot.rotation.x = -clamp01(P.latch ?? 0) * TRIP;

      // ── the spring: from its post to the pin on the arm (in the exploded view it stands on its own, at rest)
      const ez = PIV[0] + EYE.r * Math.cos(EYE.a + swing) - POST[0];
      const ey = PIV[1] + EYE.r * Math.sin(EYE.a + swing) - POST[1];
      springAim.rotation.x = Math.atan2(ez, ey) * (1 - apart);
      springMesh.morphTargetInfluences[0] = ((Math.hypot(ez, ey) - SPRING_L0) / (SPRING_L1 - SPRING_L0)) * (1 - apart);

      // ── the blade: it bows, it glows
      bladeMeshes[0].morphTargetInfluences[0] = bladeMeshes[1].morphTargetInfluences[0] = bend;
      braidMesh.morphTargetInfluences[0] = gap;
      braidMesh.morphTargetInfluences[1] = bend;
      A.bladeTip.position.z = BLADE.z0 - DEFL * bend;
      tmp.copy(INK).lerp(SIGNAL, smooth(warm));
      emit(bladeMats[0], tmp, 0.07 + 1.1 * warm * warm, litBlade);
      emit(bladeMats[1], tmp, 0.05 + 1.3 * warm * warm, litBlade);
      const halo = smooth(ramp(warm, 0.35, 1)) * whole;
      bladeAura.uniforms.uAmount.value = 0.28 * halo;
      bladeAura.uniforms.uM1.value = bend;
      bladeLight.intensity = 1.6 * halo;

      // ── the coil: its field, its core
      plungerSlide.position.z = TRAVEL * clamp01(P.plunger ?? 0) + 1.1 * apart;
      rings.visible = pull * whole > 0.004;
      ringMat.uniforms.uAmount.value = 1.5 * pull * whole;
      ringMat.uniforms.uMinPx.value = 2.4;
      ringMat.uniforms.uTime.value = time;
      emit(coilMat, VEILLE, 0.22 * pull, litCoil);

      // ── the current: nothing runs through open contacts, unless an arc carries it
      const through = load * Math.max(1 - smooth(ramp(gap, 0.01, 0.1)), arc) * whole;
      const over = smooth(ramp(load, 1, 1.45));
      const short = smooth(ramp(load, 1.7, 2.6));
      flow.u.uTime.value = time;
      flow.u.uAmount.value = whole;
      flow.u.uLevel.value = Math.min(through, 1) * (0.8 + 0.25 * over - 0.1 * short);
      flow.u.uColor.value.copy(INK).lerp(SIGNAL, over);
      flow.u.uDuty.value = lerp(0.5, 0.62, over) + (1 - lerp(0.5, 0.62, over)) * short; // the dashes lengthen, then melt into a line
      flow.u.uCore.value = 1.5 * short * Math.min(through, 1);
      flow.u.uGrow.value = 1 + 0.25 * over + 0.12 * short;
      braidFlow.uniforms.uM1.value = gap;
      braidFlow.uniforms.uM2.value = bend;
      bladeFlow.uniforms.uM1.value = bend;

      // ── the arc: between the contacts, then along the horns, then cut by the plates
      const live = arc * whole;
      const hop = smooth(ramp(split, 0, 0.3)); // its lower foot leaves the moving contact for the horn's tip
      const runIn = smooth(ramp(split, 0.22, 0.6)); // both feet run along the horns to the chamber's mouth
      const cut = smooth(ramp(split, 0.5, 0.78)); // the plates take it
      const mz = PIV[0] + TIPTOP.r * Math.cos(TIPTOP.a + swing);
      const my = PIV[1] + TIPTOP.r * Math.sin(TIPTOP.a + swing);
      const uz = lerp(FIXPAD[0], MOUTH, runIn);
      const uy = lerp(FIXPAD[1], HORN.up - HORN.t - 0.01, smooth(ramp(split, 0.05, 0.3)));
      const lz = lerp(lerp(mz, HORN.tip[0], hop), MOUTH, runIn);
      const ly = lerp(lerp(my, HORN.tip[1], hop), HORN.dn + HORN.t + 0.01, runIn);
      const ax = lerp(0, -0.35, runIn);
      const one = live * (1 - cut);
      arcMesh.visible = one > 0.003;
      if (arcMesh.visible) {
        const u = arcMat.uniforms;
        u.uA.value.set(ax, uy, uz);
        u.uB.value.set(ax, ly, lz);
        u.uC.value.set(ax, (uy + ly) / 2, (uz + lz) / 2 - lerp(0.06, 0.34, runIn) - 0.12 * Math.sin(Math.PI * hop));
        u.uWander.value = 0.03 + 0.06 * Math.min(1, (uy - ly) / 2);
        u.uTime.value = time;
        u.uAmount.value = one;
      }
      footUp.visible = footDn.visible = one > 0.003;
      footUp.position.set(ax, uy, uz);
      footDn.position.set(ax, ly, lz);
      for (const foot of [footUp, footDn]) {
        foot.material.uniforms.uRadius.value = 1.05;
        foot.material.uniforms.uMinPx.value = 20;
        foot.material.uniforms.uAmount.value = 1.0 * one;
      }
      const sliced = live * cut;
      const column = lerp(MOUTH - 0.1, 1.62, smooth(ramp(split, 0.5, 1)));
      sliceMesh.visible = sliced > 0.003;
      sliceMat.uniforms.uCol.value = column;
      sliceMat.uniforms.uTime.value = time;
      sliceMat.uniforms.uAmount.value = sliced;
      arcLight.position.set(-0.5, lerp((uy + ly) / 2, 5.0, cut), lerp((uz + lz) / 2 + 0.25, column + 0.3, cut));
      arcLight.intensity = 6.5 * live;
      emit(fixPadMat, SIGNAL, 1.3 * live * (1 - runIn), litContacts);
      emit(tipPadMat, SIGNAL, 1.3 * live * (1 - hop), litContacts);
      emit(plateMat, SIGNAL, 0.13 * sliced + 0.05 * live * runIn * (1 - cut), litChamber);

      // ── the case: the cover steps off and fades; the X-ray turns both halves to glass
      const shown = Math.max(smooth(ramp(cover, 0, 0.7)), smooth(ramp(k, 0.02, 0.2)));
      const off = (1 - smooth(cover)) * (1 - smooth(ramp(k, 0, 0.25)));
      setPartOpacity(far, 1 - xray);
      setPartOpacity(near, shown * (1 - xray));
      farGlass.mesh.visible = xray > 0.004;
      nearGlass.mesh.visible = xray * shown > 0.004;
      farGlass.mat.uniforms.uAmount.value = xray;
      nearGlass.mat.uniforms.uAmount.value = xray * shown;
      farGlass.lines.material.opacity = 0.5 * xray;
      nearGlass.lines.material.opacity = 0.5 * xray * shown;

      // ── opened (the bench): the cover first, then the works step out of the far shell and go to their places —
      //    below, the cover · the terminals and the chamber · the far shell; above, the row of the works
      put(nearG, EXPL.near, settle(ramp(k, 0.14, 0.74)), trap(k, 0, 0.14, 0.36, 0.64), 2.2);
      nearG.position.x -= 1.5 * off;
      nearG.position.y += 0.35 * off;
      put(farG, EXPL.far, settle(ramp(k, 0.4, 0.98)));
      const step = trap(k, 0.04, 0.24, 0.5, 0.86);
      const lifted = settle(ramp(k, 0.08, 0.4));
      termIn.g.position.copy(farG.position);
      termIn.g.position.x -= LIFT_OUT * lifted;
      chamberG.position.copy(termIn.g.position);
      termOut.g.position.copy(termIn.g.position);
      termIn.g.position.y += 0.45 * apart;
      put(handleG, EXPL.handle, stagger(k, 0), step);
      put(linkG, EXPL.handle, stagger(k, 0), step);
      linkG.position.y += 0.75 * apart;
      linkG.position.z -= 0.45 * apart;
      put(latchG, EXPL.latch, stagger(k, 1), step);
      put(springG, EXPL.spring, stagger(k, 2), step);
      put(fixedG, EXPL.contacts, stagger(k, 3), step);
      put(armG, EXPL.contacts, stagger(k, 3), step);
      armG.position.x += 0.6 * ROW.x * apart;
      armG.position.y -= 0.3 * apart;
      armG.position.z += 0.6 * ROW.z * apart;
      put(bladeG, EXPL.blade, stagger(k, 4), step);
      put(coilG, EXPL.coil, stagger(k, 5), step);

      // ── the part the voice names
      light(lamps.handle, clamp01(P.litHandle ?? 0));
      light(lamps.spring, clamp01(P.litSpring ?? 0));
      light(lamps.contacts, litContacts);
      light(lamps.blade, litBlade);
      light(lamps.coil, litCoil);
      light(lamps.chamber, litChamber);
    },
  };
}
