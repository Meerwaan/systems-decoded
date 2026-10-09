// DOSSIER 013 — Halo : the system. ONE rigid assembly, its origin on the track under the cockpit, the nose toward +z:
//   · the survival cell — a carbon tub lofted along the car, not a box: the nose tapering to its front bulkhead, the
//     flanks and their shoulder chamfer, the cockpit cut in the same skin, the headrest in a U, the roll hoop's tower
//     and its air intake behind your head, the rear bulkhead; machined inserts where something bolts on
//   · the halo — a titanium tube round your head, its single pillar ahead of your eyes, its two shoes on the cell's
//     shoulders; and its three fixings (a plate and two studs each), which come apart in the exploded view
//   · you — a body of glass lying the way a Formula 1 driver does, a solid helmet, your hands on a small solid wheel
// Centimetres, y up. The camera stands on the −x / +z side (the car's front right): what matters faces it.
// Liberties (see docs/journal/013-model.md): the cell's floor rises toward the front bulkhead (4 → 13 cm), the fuel
// hatch is on the LEFT flank only (the FIA's report), your way out is drawn in five postures.
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glass, makePart, addMesh, setPartOpacity, anchor, box, cyl, lathe, plate, chamfer, mergeGeometries } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { CELL, COCKPIT, HELMET, HALO, EXIT, RAIL } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const WHITE = new THREE.Color(1, 1, 1);
const HOT = new THREE.Color(1, 0.86, 0.62);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const H2 = (BRAND.H / 2).toFixed(1);
const UP = V(0, 1, 0);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const mix = (a, b, u) => a + (b - a) * u;
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);

/* ─────────────────────────────────────────────────────────── curves and skins */

/** A smooth curve through keys [[x, v], …]: cubic, never overshooting, flat beyond its ends. */
function keyed(list) {
  const keys = [...list].sort((a, b) => a[0] - b[0]);
  const n = keys.length;
  const d = [];
  for (let i = 0; i < n - 1; i++) d.push((keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]));
  const m = keys.map((_, i) => {
    if (i === 0) return d[0];
    if (i === n - 1) return d[n - 2];
    if (d[i - 1] * d[i] <= 0) return 0;
    const w0 = keys[i + 1][0] - keys[i][0];
    const w1 = keys[i][0] - keys[i - 1][0];
    const t = (d[i - 1] * w0 + d[i] * w1) / (w0 + w1);
    return Math.sign(t) * Math.min(Math.abs(t), 3 * Math.abs(d[i - 1]), 3 * Math.abs(d[i]));
  });
  return (x) => {
    if (x <= keys[0][0]) return keys[0][1];
    if (x >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0;
    while (x > keys[i + 1][0]) i++;
    const h = keys[i + 1][0] - keys[i][0];
    const t = (x - keys[i][0]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * keys[i][1] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * keys[i + 1][1] + (t3 - t2) * h * m[i + 1];
  };
}

/**
 * A profile given by its corners [{ p: [x, y], r, n, line, lip }]: a corner with `n` is cut back by `r` and replaced
 * by `n` facets of an arc — always `n + 1` points, even when there is no room for it: every section of a loft has the
 * same count. `sharp`: the corners marked `line` are left as they are (the outline the edge lines are drawn from).
 * Returns the points and `lip`, the index of the last point of the corner marked so.
 */
function rounded(corners, sharp = false) {
  const pts = [];
  let lip = -1;
  corners.forEach((c, i) => {
    const a = corners[i - 1]?.p;
    const b = corners[i + 1]?.p;
    const n = c.n && !(sharp && c.line) ? c.n : 0;
    if (n && a && b) {
      const u = [a[0] - c.p[0], a[1] - c.p[1]];
      const v = [b[0] - c.p[0], b[1] - c.p[1]];
      const lu = Math.hypot(u[0], u[1]);
      const lv = Math.hypot(v[0], v[1]);
      const k = Math.min(c.r, lu / 2.2, lv / 2.2);
      const cos = lu > 1e-6 && lv > 1e-6 ? (u[0] * v[0] + u[1] * v[1]) / (lu * lv) : -1;
      if (k > 1e-3 && cos > -0.995 && cos < 0.995) {
        const half = Math.acos(cos) / 2;
        const bis = [u[0] / lu + v[0] / lv, u[1] / lu + v[1] / lv];
        const lb = Math.hypot(bis[0], bis[1]);
        const centre = [c.p[0] + (bis[0] / lb) * (k / Math.cos(half)), c.p[1] + (bis[1] / lb) * (k / Math.cos(half))];
        const from = [c.p[0] + (u[0] / lu) * k - centre[0], c.p[1] + (u[1] / lu) * k - centre[1]];
        const to = [c.p[0] + (v[0] / lv) * k - centre[0], c.p[1] + (v[1] / lv) * k - centre[1]];
        const sweep = Math.atan2(from[0] * to[1] - from[1] * to[0], from[0] * to[0] + from[1] * to[1]);
        for (let s = 0; s <= n; s++) {
          const t = (sweep * s) / n;
          pts.push([centre[0] + from[0] * Math.cos(t) - from[1] * Math.sin(t), centre[1] + from[0] * Math.sin(t) + from[1] * Math.cos(t)]);
        }
      } else for (let s = 0; s <= n; s++) pts.push(c.p);
    } else pts.push(c.p);
    if (c.lip) lip = pts.length - 1;
  });
  return { pts, lip };
}

/**
 * A skin through rows of points ([x, y, z], the same count in each): a quad between two neighbours of a row and the
 * next row, facing outward when a row turns counter-clockwise seen from where the rows are going. `wrap`: each row is
 * a closed loop. `cols(j)`: keep only some columns. A triangle with no area is left out (a zero normal is a NaN).
 */
function loft(rows, { wrap = true, cols = null } = {}) {
  const n = rows[0].length;
  const pos = new Float32Array(rows.length * n * 3);
  rows.forEach((row, i) => row.forEach((p, j) => pos.set(p, (i * n + j) * 3)));
  const index = [];
  const tri = (a, b, c) => {
    const ux = pos[b * 3] - pos[a * 3];
    const uy = pos[b * 3 + 1] - pos[a * 3 + 1];
    const uz = pos[b * 3 + 2] - pos[a * 3 + 2];
    const vx = pos[c * 3] - pos[a * 3];
    const vy = pos[c * 3 + 1] - pos[a * 3 + 1];
    const vz = pos[c * 3 + 2] - pos[a * 3 + 2];
    if (Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) > 1e-7) index.push(a, b, c);
  };
  const last = wrap ? n : n - 1;
  for (let i = 0; i < rows.length - 1; i++) {
    for (let j = 0; j < last; j++) {
      if (cols && !cols(j)) continue;
      const a = i * n + j;
      const b = i * n + ((j + 1) % n);
      tri(a, b, a + n);
      tri(b, b + n, a + n);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  return geo;
}
/** Smooth where a skin turns gently, sharp where it breaks. */
const creased = (geo, deg = 30) => toCreasedNormals(geo, deg * DEG);
/** `outline`: what the edge lines are drawn from (build3d's `edgesOf` reads it). */
const outlinedBy = (geo, outline) => {
  geo.userData.edges = outline;
  return geo;
};
/** A flat face from a loop of [x, y], standing at `z`, facing +z or (`back`) −z. */
function face(loop, z, back = false) {
  const clean = loop.filter((p, i) => Math.hypot(p[0] - loop[(i + 1) % loop.length][0], p[1] - loop[(i + 1) % loop.length][1]) > 1e-4);
  const geo = new THREE.ShapeGeometry(new THREE.Shape(clean.map(([x, y]) => new THREE.Vector2(x, y))));
  if (back) geo.rotateY(Math.PI);
  return geo.translate(0, 0, z);
}
const scaledLoop = (loop, s, cy) => loop.map(([x, y]) => [x * s, cy + (y - cy) * s]);
const cleanLoop = (loop) => loop.filter((p, i) => Math.hypot(p[0] - loop[(i + 1) % loop.length][0], p[1] - loop[(i + 1) % loop.length][1]) > 1e-3);
/** A frame: the band between a loop shrunk by `s0` and by `s1`, `depth` thick from z = 0. */
function frame(loop, s0, s1, depth, bevel = 0.25) {
  const cy = (Math.min(...loop.map((p) => p[1])) + Math.max(...loop.map((p) => p[1]))) / 2;
  const shape = new THREE.Shape(cleanLoop(scaledLoop(loop, s0, cy)).map(([x, y]) => new THREE.Vector2(x, y)));
  shape.holes.push(new THREE.Path(cleanLoop(scaledLoop(loop, s1, cy)).map(([x, y]) => new THREE.Vector2(x, y))));
  return plate(shape, depth, { bevel, round: 2, curveSegments: 6 });
}
/** A rectangle w × h with round corners, centred. */
function rrect(w, h, r) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(w / 2, h / 2 - r);
  s.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2, false);
  s.lineTo(-w / 2 + r, h / 2);
  s.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-w / 2, -h / 2 + r);
  s.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

const lyingZ = (g) => g.rotateX(Math.PI / 2); // a lathe's axis (y) laid along +z
const lyingX = (g) => g.rotateZ(-Math.PI / 2); // …along +x
const ringOf = (r0, r1, a, b) => [[r0, a], [r1, a], [r1, b], [r0, b], [r0, a]];
const hex = (r, h, bevel = 0.12) => cyl(r, h, bevel, 6);

/**
 * A round swept through `points`, its frame carried from one to the next (no twist at a bend). It carries `aS`, the
 * length run since the first point — and, given `toward`, `aBand`: how much each point of the round faces that way
 * (the direction brought into the round's own plane: a line of light keeps its width all along a bent tube).
 */
function sweep(points, radius, radial = 20, toward = null) {
  const n = points.length;
  const ring = radial + 1;
  const pos = [];
  const nor = [];
  const sAt = [];
  const band = [];
  const index = [];
  const aim = V();
  const T = V();
  const T0 = V();
  const N = V();
  const B = V();
  const axis = V();
  const d = V();
  const q = new THREE.Quaternion();
  let s = 0;
  for (let i = 0; i < n; i++) {
    if (i) s += points[i].distanceTo(points[i - 1]);
    T.subVectors(points[Math.min(n - 1, i + 1)], points[Math.max(0, i - 1)]).normalize();
    if (i === 0) N.set(0, 1, 0);
    else {
      axis.crossVectors(T0, T);
      const sin = axis.length();
      if (sin > 1e-7) N.applyQuaternion(q.setFromAxisAngle(axis.divideScalar(sin), Math.atan2(sin, T0.dot(T))));
    }
    N.addScaledVector(T, -N.dot(T)).normalize();
    T0.copy(T);
    B.crossVectors(T, N);
    if (toward) aim.copy(toward).addScaledVector(T, -toward.dot(T)).normalize();
    const p = points[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      d.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a));
      pos.push(p.x + d.x * radius, p.y + d.y * radius, p.z + d.z * radius);
      nor.push(d.x, d.y, d.z);
      sAt.push(s);
      if (toward) band.push(d.dot(aim));
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
  if (toward) geo.setAttribute("aBand", new THREE.Float32BufferAttribute(band, 1));
  geo.setIndex(index);
  geo.userData.length = s;
  return geo;
}

/* ─────────────────────────────────────────────────────────── the cell's lines */

// along the car (z): its half width, its floor, the top of its deck, the deck's crown, the shoulder's chamfer
const HALF = keyed([[CELL.z0, CELL.half], [20, CELL.half], [60, 27.3], [110, 21.6], [160, 17.6], [CELL.z1, CELL.halfFront]]);
const FLOOR = keyed([[CELL.z0, CELL.floor], [64, CELL.floor], [120, CELL.floor + 2.4], [CELL.z1, CELL.floor + 9]]);
// the rim of the cockpit, its coaming, then a shelf where the halo's pillar stands, then the long fall to the nose
const TOP = keyed([[CELL.z0, CELL.rim], [COCKPIT.z1, CELL.rim], [52, 56.7], [57, 55.5], [66, 54.9], [100, 52.6], [150, 49.3], [CELL.z1, CELL.topFront]]);
const CROWN = keyed([[COCKPIT.z1, 0], [66, 1.0], [CELL.z1, 2.4]]);
const CHAMF = keyed([[CELL.z0, 5.6], [COCKPIT.z1, 5.6], [CELL.z1, 4.4]]);
// the cockpit: its opening in plan (round behind your head, narrowing to a round nose at the wheel), and the seat's line
const OPEN = { z0: COCKPIT.z0, z1: COCKPIT.z1, half: COCKPIT.half, back: -6, front: 10, n: 2.6 };
function openHalf(z) {
  if (z <= OPEN.z0 || z >= OPEN.z1) return 0;
  if (z < OPEN.back) {
    const u = (OPEN.back - z) / (OPEN.back - OPEN.z0);
    return OPEN.half * Math.sqrt(Math.max(0, 1 - u * u));
  }
  if (z > OPEN.front) {
    const u = (z - OPEN.front) / (OPEN.z1 - OPEN.front);
    return OPEN.half * Math.pow(Math.max(0, 1 - Math.pow(u, OPEN.n)), 1 / OPEN.n);
  }
  return OPEN.half;
}
const SEAT_FLOOR = 8;
const SEAT_Y = keyed([[OPEN.z0, CELL.rim - 0.6], [-25, 53], [-14, 43], [27, SEAT_FLOOR], [OPEN.z1, SEAT_FLOOR]]);
const DECK = 6; // points across the deck
const KNUCKLE = 0.46; // how far up the flank is widest

/** Half a section of the cell at `z` (x ≥ 0), from the middle of the floor round to the middle of the seat. */
function sectionCorners(z) {
  const f = FLOOR(z);
  const h = HALF(z);
  const t = TOP(z);
  const cr = CROWN(z);
  const c = CHAMF(z);
  const hd = h - 0.72 * c;
  const w = openHalf(z);
  const deckY = (x) => t - cr * (x / hd) ** 2;
  const out = [{ p: [0, f] }, { p: [h * 0.87, f], r: 2.4, n: 3, line: true }, { p: [h, f + KNUCKLE * (t - f)] }, { p: [h, t - cr - c], r: 0.9, n: 2, line: true }, { p: [hd, t - cr], r: 0.9, n: 2, line: true }];
  const xe = w > 0 ? w + Math.min(1.2, (hd - w) * 0.4) : 0; // room for the lip to turn
  for (let k = 1; k < DECK; k++) {
    const x = hd + (xe - hd) * (k / DECK);
    out.push({ p: [x, deckY(x)] });
  }
  const yl = deckY(w);
  const yin = w > 0 ? Math.min(SEAT_Y(z), yl - 0.2) : yl;
  const depth = yl - yin;
  const wi = Math.max(0, w - Math.min(1.2, w * 0.3));
  out.push({ p: [w, yl], r: Math.min(1, w * 0.4, depth * 0.4), n: 2, line: true, lip: true });
  out.push({ p: [wi, yin], r: Math.min(7, wi * 0.55, depth * 0.45), n: 5 });
  out.push({ p: [0, yin] });
  return out;
}
/** Where the flank is at height `y` (above the chine), and which way it faces in plan. `side`: +1 your left, −1 your right. */
function flank(side, z, y) {
  const at = (zz) => {
    const f = FLOOR(zz);
    const h = HALF(zz);
    const ym = f + KNUCKLE * (TOP(zz) - f);
    return y >= ym ? h : h * 0.87 + h * 0.13 * ((y - f) / (ym - f));
  };
  const slope = (at(z + 1) - at(z - 1)) / 2;
  return { x: side * at(z), yaw: Math.atan2(side, -slope) };
}

// the stations: every six centimetres, and closer where the opening's outline turns and where the coaming falls
const STATIONS = (() => {
  const zs = [];
  const n = 46;
  for (let i = 0; i <= n; i++) zs.push(CELL.z0 + ((CELL.z1 - CELL.z0) * i) / n);
  for (let a = 0; a <= 90; a += 6) zs.push(OPEN.back - (OPEN.back - OPEN.z0) * Math.sin(a * DEG));
  for (let a = 0; a <= 90; a += 5) zs.push(OPEN.front + (OPEN.z1 - OPEN.front) * Math.pow(Math.sin(a * DEG), 2 / OPEN.n));
  zs.push(46.8, 47.6, 48.6, 49.6, 50.8, 52, 53.5, 55, 57, -24, -19);
  zs.sort((a, b) => a - b);
  return zs.filter((z, i) => i === 0 || z - zs[i - 1] > 0.04);
})();

function tub(sharp) {
  const rows = [];
  let H = 0;
  let L = 0;
  for (const z of STATIONS) {
    const { pts, lip } = rounded(sectionCorners(z), sharp);
    H = pts.length;
    L = lip;
    rows.push([...pts, ...pts.slice(1, -1).reverse().map(([x, y]) => [-x, y])].map(([x, y]) => [x, y, z]));
  }
  const N = 2 * (H - 1);
  return { rows, outside: (j) => j < L || j >= N - L };
}

// behind your head: the roll hoop's tower — arches standing on the rear deck, its front face leaning back from the headrest
const TOWER = { base: CELL.rim - 0.5, e: 0.62, n: 24 };
const TOWER_TOP = keyed([[CELL.z0, 92.5], [-66, 95], [CELL.hoop.z, CELL.hoop.top], [-49, 95.4], [-48, 95.3], [-47.2, 95], [-46, 94], [-45.2, 92.9], [-44.6, 91], [-43.8, 84], [-43.2, 77.5], [-41, 73.6], [-36, 66.6], [-31, 60.4], [-30.4, 59.6]]);
const TOWER_HALF = keyed([[CELL.z0, 15.5], [CELL.hoop.z, CELL.hoop.half + 1.6], [-44.6, 13.4], [-41, 12], [-36, 10], [-31, 6.5], [-30.4, 5]]);
const TOWER_Z = [CELL.z0, -72, -68, -64, -60, -58, -56, -54, -52, -50.5, -49, -48, -47.2, -46, -45.2, -44.6, -44.2, -43.8, -43.5, -43.2, -42, -41, -39, -37.5, -36, -34, -32.5, -31, -30.4];
const INTAKE = { y: 85.4, rx: 7.8, ry: 6, z0: -47.5, z1: -42.5 };
function arch(z, grow = 0) {
  const top = TOWER_TOP(z) + grow;
  const hw = TOWER_HALF(z) + grow;
  const row = [];
  for (let i = 0; i <= TOWER.n; i++) {
    const a = (i / TOWER.n) * Math.PI;
    const c = Math.cos(a);
    row.push([hw * Math.sign(c) * Math.pow(Math.abs(c), TOWER.e), TOWER.base + (top - TOWER.base) * Math.pow(Math.max(0, Math.sin(a)), TOWER.e), z]);
  }
  return row;
}

// the headrest: a pad in a U round your helmet, low at its two ends, high behind your head
const PAD = { x: 19.5, tip: 13, zc: -6, y0: 57 };
const padTop = (z) => mix(61.6, 74.5, smooth(ramp(z, PAD.tip, -20)));
function padRows(sharp) {
  const rows = [];
  const station = (cx, cz, nx, nz, k = 1) => {
    const ht = padTop(cz);
    const { pts } = rounded([{ p: [-3.5, PAD.y0] }, { p: [3.5, PAD.y0] }, { p: [3.5, ht - 2.4], r: 1.2, n: 3 }, { p: [1.6, ht], r: 1, n: 3 }, { p: [-1.8, ht], r: 1, n: 3, line: true }, { p: [-3.5, ht - 3.4] }], sharp);
    const cy = (PAD.y0 + ht) / 2;
    return pts.map(([r, y]) => [cx + nx * r * k, cy + (y - cy) * k, cz + nz * r * k]);
  };
  // a rounded end: the section shrinks to nothing over two centimetres
  const end = (x, nx) => [[1.8, 0], [1.6, 0.45], [1, 0.8]].map(([off, k]) => station(x, PAD.tip + off, nx, 0, k));
  rows.push(...end(-PAD.x, -1));
  for (let i = 0; i <= 5; i++) rows.push(station(-PAD.x, mix(PAD.tip, PAD.zc, i / 5), -1, 0));
  for (let i = 1; i < 24; i++) {
    const a = (i / 24) * Math.PI;
    rows.push(station(-PAD.x * Math.cos(a), PAD.zc - PAD.x * Math.sin(a), -Math.cos(a), -Math.sin(a)));
  }
  for (let i = 0; i <= 5; i++) rows.push(station(PAD.x, mix(PAD.zc, PAD.tip, i / 5), 1, 0));
  rows.push(...end(PAD.x, 1).reverse());
  return rows;
}

/* ─────────────────────────────────────────────────────────── the halo's lines */

const RING_PTS = [...HALO.ring].reverse().map(([x, y, z]) => V(-x, y, z)).concat(HALO.ring.slice(1).map(([x, y, z]) => V(x, y, z)));
const RING_N = 220;
/** The ring's centre line, from its right shoe (−x) round the front to its left one: evenly spaced points. */
const RING = new THREE.CatmullRomCurve3(RING_PTS, false, "centripetal").getSpacedPoints(RING_N);
const FOOT = { y0: HALO.foot[0][1], y1: HALO.foot[1][1] + 0.7, z0: HALO.foot[0][2], z1: HALO.foot[1][2] - 0.2 };
// thin seen from the seat, deep seen from the side — and it fans out into the ring's two arms
const FOOT_A = keyed([[0, 2.5], [0.12, 1.75], [0.62, 1.75], [0.82, 3.2], [0.93, 6], [1, 7.6]]);
const FOOT_B = keyed([[0, 4.4], [0.12, 3.4], [0.6, 3], [1, 2.3]]);
const MOUNT = HALO.mounts[0]; // the left one (+x); the right one is its mirror
const PLATE_TOP = MOUNT[1] - 1.3; // the top of a rear fixing's plate: the halo's shoe sits on it
const SHOE = { w: 7.4, z0: -51, z1: -30.8, toe: PLATE_TOP + 2.5 };
const STUDS = { front: [[4.5, HALO.foot[0][2]], [-4.5, HALO.foot[0][2]]], rear: [-44.9, -48.9] };
const PRESS = { z: HALO.foot[1][2] - 1, y: HALO.foot[1][1] + HALO.r + 0.6, drop: 115 }; // where the ram's pad bears: the top of the ring's front

/* ─────────────────────────────────────────────────────────── light that has a place */

/**
 * The ring under load, as a skin of light over the tube (`aS`: the length run from the right shoe).
 *   uTouch, uLoad   the test: white where the pad bears, and veille spreading from there round both arms to the shoes
 *   uStress         the steel: a white-hot line along the top of the ring's front, hottest where the beam leans (uC1, uC2)
 */
const skinMaterial = (length) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uVeille: { value: VEILLE.clone() }, uWhite: { value: WHITE.clone().lerp(VEILLE, 0.12) }, uHot: { value: HOT.clone().multiplyScalar(1.7) }, uSignal: { value: SIGNAL.clone().multiplyScalar(1.25) },
      uLen: { value: length }, uTouch: { value: 0 }, uLoad: { value: 0 }, uStress: { value: 0 }, uC1: { value: -999 }, uC2: { value: -999 },
    },
    vertexShader: /* glsl */ `
      attribute float aS; attribute float aBand; varying float vS; varying float vB; varying vec3 vN; varying vec3 vV; varying vec3 vO;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vO = normal;
        vS = aS;
        vB = aBand;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uVeille, uWhite, uHot, uSignal; uniform float uLen, uTouch, uLoad, uStress, uC1, uC2;
      varying float vS; varying float vB; varying vec3 vN; varying vec3 vV; varying vec3 vO;
      void main() {
        float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        vec3 o = normalize(vO);
        float d = abs(vS - 0.5 * uLen);
        // the test: the load runs from the pad round the ring to its two shoes
        float reach = uLoad * (0.5 * uLen + 16.0);
        float spread = (1.0 - smoothstep(reach - 16.0, reach, d)) * smoothstep(0.0, 0.04, uLoad);
        vec3 col = uVeille * spread * (0.1 + 0.3 * uLoad) * (0.35 + 0.65 * f);
        float under = exp(-d * d / 60.0) * pow(clamp(o.y, 0.0, 1.0), 1.5);
        col += uWhite * under * uTouch * (0.5 + 1.1 * uLoad);
        // the steel: a narrow band where the beam bears, on the top of the front
        float band = pow(clamp(vB, 0.0, 1.0), 12.0);
        float front = smoothstep(0.14 * uLen, 0.28 * uLen, vS) * (1.0 - smoothstep(0.66 * uLen, 0.84 * uLen, vS));
        float a1 = vS - uC1; float a2 = vS - uC2;
        float lean = min(exp(-a1 * a1 / 130.0) + exp(-a2 * a2 / 130.0), 1.0);
        // an orange line along the top of the front; white-hot where the beam leans
        col += mix(uSignal, uHot, lean) * band * (0.75 * front + 1.2 * lean) * uStress;
        gl_FragColor = vec4(col, 1.0);
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

/**
 * The space the halo keeps: a volume of light, not a ball — thick, so bright, where the eye looks through its
 * middle; nothing at all at its edge; and it stops at the cockpit's rim (`uLow`, `uHigh`: heights in the cell's frame).
 */
const volumeMaterial = (power, low, high) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: VEILLE.clone() }, uAmount: { value: 0 }, uPower: { value: power }, uLow: { value: low }, uHigh: { value: high } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vY = position.y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uPower, uLow, uHigh; varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        gl_FragColor = vec4(uColor * pow(f, uPower) * smoothstep(uLow, uHigh, vY) * uAmount, 1.0);
      }`,
  });
/** An ellipsoid with squarer shoulders (`n` > 2), centred. */
function blob(rx, ry, rz, n = 2) {
  const geo = new THREE.SphereGeometry(1, 48, 32);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const v = V(p.getX(i), p.getY(i), p.getZ(i)).normalize();
    const k = 1 / Math.pow(Math.pow(Math.abs(v.x), n) + Math.pow(Math.abs(v.y), n) + Math.pow(Math.abs(v.z), n), 1 / n);
    p.setXYZ(i, v.x * k * rx, v.y * k * ry, v.z * k * rz);
  }
  return creased(geo, 80);
}

/** Sparks where steel bears on titanium: few, slow (the film is in slow motion), born again each period — a pure function of time. */
function makeSparks({ count = 40, seed = 13 } = {}) {
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4); // phase, period (s), size (cm), heading
  for (let i = 0; i < count; i++) seeds.set([rand(), 1.9 + rand() * 1.9, 0.7 + Math.pow(rand(), 2) * 1.1, rand() * Math.PI * 2], i * 4);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uScale: { value: 1600 }, uAmount: { value: 0 }, uO1: { value: V() }, uO2: { value: V() }, uOn2: { value: 0 }, uHot: { value: HOT.clone().multiplyScalar(3) }, uCool: { value: SIGNAL.clone().multiplyScalar(2.2) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale, uOn2; uniform vec3 uO1, uO2; attribute vec4 aSeed; varying float vAge; varying float vOn;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          vAge = age;
          float second = step(0.5, fract(aSeed.x * 13.7));
          vOn = mix(1.0, uOn2, second);
          float sp = 0.5 + fract(aSeed.x * 7.3);
          // they leave along the steel, backward, and fall
          vec3 p = mix(uO1, uO2, second) + vec3(cos(aSeed.w) * 9.0 * age * sp + 4.0 * age, 11.0 * age * sp - 30.0 * age * age, sin(aSeed.w) * 6.0 * age * sp - 16.0 * age);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aSeed.z * uScale / max(1.0, -mv.z), 2.4, 30.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; uniform float uAmount; varying float vAge; varying float vOn;
        void main() {
          if (uAmount * vOn < 0.003) discard;
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(clamp(1.0 - d, 0.0, 1.0), 1.6) * sin(3.14159 * vAge) * uAmount * vOn;
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.0, 0.6, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 7;
  points.visible = false;
  return { points, uniforms };
}

/** A strap: a band `width` wide through `points`, lying flat on `normals` (one per point). */
function ribbon(points, normals, width) {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  const n = 28;
  const pos = [];
  const index = [];
  const t = V();
  const nor = V();
  const side = V();
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const p = curve.getPoint(u);
    curve.getTangent(u, t);
    const f = u * (normals.length - 1);
    const a = Math.min(normals.length - 2, Math.floor(f));
    nor.copy(normals[a]).lerp(normals[a + 1], f - a).normalize();
    side.crossVectors(t, nor).normalize().multiplyScalar(width / 2);
    pos.push(p.x - side.x, p.y - side.y, p.z - side.z, p.x + side.x, p.y + side.y, p.z + side.z);
    if (i) index.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i, 2 * i - 1, 2 * i + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  return geo;
}

/* ─────────────────────────────────────────────────────────── your helmet */

// a sphere pulled into a helmet: it keeps its width down to its rim, and its chin bar comes forward
function helmetShaped(geo, grow = 1) {
  geo.rotateY(-Math.PI / 2); // the sphere's seam goes to the back of the head
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    const y = p.getY(i);
    let z = p.getZ(i);
    const low = smooth(ramp(y, 0.15, -0.8));
    const rad = Math.hypot(x, z) || 1e-6;
    const keep = mix(rad, Math.max(rad, 0.93), low) / rad;
    x *= keep;
    z *= keep;
    if (z > 0) z += 0.11 * low * smooth(ramp(z, 0, 0.8));
    p.setXYZ(i, x * 13.1 * grow, y * HELMET.r * grow, (z * 13.9 + 0.3) * grow);
  }
  return creased(geo, 62);
}

/* ─────────────────────────────────────────────────────────── the system */

/**
 * → { root, A, update(p, time, px) }. `root`: one rigid assembly (world.js stands it in the car, or on the bench).
 * `A`: anchors — halo, foot, mountL, mountR, helmet, cell, hoop, seat, pad, you — that follow their parts.
 * p (see FIRST in world.js):
 *   bench     1: on the bench (nothing to add: the tub lies on its flat floor, from its rear bulkhead to your knees)
 *   ahead     where the barrier is (metres): it only tells where the steel leans on the ring (`stress`)
 *   you       0 nobody · 1 you: a body of glass, a solid helmet, your hands on the wheel
 *   out       0 seated · 0.24 pushing up on the ring · 0.5 standing in the cockpit · 0.76 on the barrier · 1 on the track
 *             (past 0.5 your helmet also gets an outline of glass, drawn like your body: out there you stand behind
 *             the fire, whose light drowns anything solid)
 *   harness   your six-point harness, a band of veille light (it is undone as soon as `out` leaves 0)
 *   space     the space the halo keeps: a volume of veille light under the ring, round your head
 *   stress    the ring bearing the steel: a white-hot line on the top of its front, two hearts of light, slow sparks
 *   press     the test: 0 away · 0 → 0.3 the ram comes down · 0.3 its pad touches · 1 full load — veille runs from the
 *             pad round the ring to the shoes, down the pillar; white under the pad. Nothing moves: it does not yield
 *   explode   0 whole → 1 the halo 70 cm above the cell, its three fixings half-way
 *   fire      a signal light behind you (the fire is at the cell's rear)
 *   litHalo, litFoot, litMounts, litCell   0–1: the part the voice is naming glows faintly veille
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
  // carbon, machined inserts, titanium: three values of grey — and darker ones for what is hollow, or rubber
  const C = { pit: 0x090b0c, rubber: 0x1b1f23, grip: 0x2e3338, inside: 0x33383d, carbon: 0x4c5259, pad: 0x5f666d, insert: 0x7e868d, alu: 0x979ea5, fine: 0xb1b7bd, steel: 0xb6bcc2, titanium: 0xc8cdd2, helmet: 0xcbc6ba };
  const M = {
    carbon: () => solid(C.carbon, { rough: 0.72, metal: 0.15 }),
    insert: () => solid(C.insert, { rough: 0.58, metal: 0.35 }),
    alu: () => solid(C.alu, { rough: 0.52, metal: 0.38 }),
    fine: () => solid(C.fine, { rough: 0.46, metal: 0.4 }),
    titanium: (rough = 0.5) => solid(C.titanium, { rough, metal: 0.35, env: 0.85 }), // brushed: a softer light than a polished tube's, which blooms
  };

  /* ── the cell: the tub, its two bulkheads ── */
  const cellG = grp();
  const shell = partIn(cellG, "cell");
  const fine = tub(false);
  const bulk = { front: fine.rows[fine.rows.length - 1].map(([x, y]) => [x, y]), rear: fine.rows[0].map(([x, y]) => [x, y]) };
  {
    const carbon = M.carbon();
    const sharp = tub(true);
    addMesh(shell, outlinedBy(creased(loft(fine.rows, { cols: fine.outside })), loft(sharp.rows, { cols: sharp.outside })), carbon, { edgeOpacity: 0.62, threshold: 26 });
    addMesh(shell, creased(loft(fine.rows, { cols: (j) => !fine.outside(j) })), solid(C.inside, { rough: 0.92, env: 0.5 }), { edges: false });
    addMesh(shell, face(bulk.front, CELL.z1), carbon, { edges: false });
    addMesh(shell, face(bulk.rear, CELL.z0, true), carbon, { edges: false });
    // the tower of the roll hoop, and its air intake
    addMesh(shell, creased(loft(TOWER_Z.map((z) => arch(z)), { wrap: false })), carbon, { edgeOpacity: 0.55 });
    addMesh(shell, face(arch(CELL.z0).map(([x, y]) => [x, y]), CELL.z0, true), carbon, { edges: false });
    addMesh(shell, lyingZ(lathe(ringOf(0.85, 1, 0, INTAKE.z1 - INTAKE.z0), 56, { bevel: 0.03, round: 2 })).scale(INTAKE.rx, INTAKE.ry, 1).translate(0, INTAKE.y, INTAKE.z0), carbon, { edgeOpacity: 0.6 });
    const pit = new THREE.Mesh(new THREE.CircleGeometry(1, 40).scale(INTAKE.rx * 0.88, INTAKE.ry * 0.88, 1).translate(0, INTAKE.y, INTAKE.z1 - 0.8), solid(C.pit, { rough: 1, env: 0.1 }));
    shell.add(pit);
    // a panel on the nose (the dampers are under it): four fine lines on the long deck, four fasteners
    const hatchZ = [114, 122, 130, 138, 146, 154, 162, 170];
    const onDeck = (x, z, up) => TOP(z) - CROWN(z) * (x / (HALF(z) - 0.72 * CHAMF(z))) ** 2 + up;
    addMesh(shell, creased(loft(hatchZ.map((z) => [8, 4, 0, -4, -8].map((x) => [x, onDeck(x, z, 0.3), z])), { wrap: false })), carbon, { edgeOpacity: 0.5 });
    addMesh(shell, mergeGeometries([[6.4, 116], [-6.4, 116], [6.4, 168], [-6.4, 168]].map(([x, z]) => cyl(0.75, 0.5, 0.1, 16).translate(x, onDeck(x, z, 0.4), z))), M.alu(), { edges: false });
  }

  /* ── machined inserts: where something bolts on ── */
  const inserts = partIn(cellG, "inserts");
  {
    const m = { insert: M.insert(), alu: M.alu() };
    const cyF = (FLOOR(CELL.z1) + CELL.topFront) / 2;
    const cyR = (CELL.floor + CELL.rim) / 2;
    const about = (x, y, cy, s) => [x * s, cy + (y - cy) * s];
    // the front bulkhead: its frame, and the four studs the nose cone bolts on
    const hF = CELL.halfFront;
    const fF = FLOOR(CELL.z1);
    const cF = CHAMF(CELL.z1);
    const studsF = [[hF - 0.36 * cF, CELL.topFront - CROWN(CELL.z1) - cF / 2], [hF * 0.87 - 0.4, fF + 0.4]].flatMap(([x, y]) => [about(x, y, cyF, 0.83), about(-x, y, cyF, 0.83)]);
    addMesh(inserts, frame(bulk.front, 0.94, 0.72, 1.1).translate(0, 0, CELL.z1 - 0.2), m.insert, { edgeOpacity: 0.55 });
    addMesh(inserts, mergeGeometries(studsF.map(([x, y]) => lyingZ(cyl(1.5, 2.6, 0.2, 24)).translate(x, y, CELL.z1 + 1.1))), m.alu, { edgeOpacity: 0.5 });
    // the rear bulkhead: its frame, the six studs the engine bolts on, the fuel line's connector
    const studsR = [[CELL.half * 0.8, CELL.rim - 5], [CELL.half * 0.83, cyR], [CELL.half * 0.76, CELL.floor + 3.6]].flatMap(([x, y]) => [[x, y], [-x, y]]);
    addMesh(inserts, frame(bulk.rear, 0.95, 0.82, 1.1).rotateY(Math.PI).translate(0, 0, CELL.z0 + 0.2), m.insert, { edgeOpacity: 0.55 });
    addMesh(inserts, mergeGeometries([...studsR.map(([x, y]) => lyingZ(cyl(1.7, 3, 0.2, 24)).translate(x, y, CELL.z0 - 1.3)), lyingZ(lathe([[0, 0], [3.4, 0], [3.4, 1.4], [2.2, 1.8], [2.2, 4.4], [0, 4.4]], 32, { bevel: 0.2, round: 2 })).rotateY(Math.PI).translate(0, 46, CELL.z0)]), m.alu, { edgeOpacity: 0.5 });
    // on each flank: the front suspension's four pick-ups, the two sockets of the side impact structure
    const onFlank = (geo, side, z, y, proud = 0) => {
      const at = flank(side, z, y);
      return geo.rotateY(at.yaw).translate(at.x + Math.sin(at.yaw) * proud, y, z + Math.cos(at.yaw) * proud);
    };
    const pickup = () => mergeGeometries([box(6.4, 4, 1.1, 0.25), lyingZ(cyl(1.05, 1.5, 0.15, 20)).translate(0, 0, 0.7)]);
    const socket = () => mergeGeometries([box(10, 5.4, 1, 0.3), ...[-3.3, 3.3].map((dx) => lyingZ(hex(0.75, 0.6, 0.08)).translate(dx, 0, 0.6))]);
    const hard = [];
    for (const side of [1, -1]) {
      for (const [z, up] of [[184, 1], [146, 1], [180, 0], [140, 0]]) hard.push(onFlank(pickup(), side, z, up ? TOP(z) - CROWN(z) - CHAMF(z) - 4.2 : FLOOR(z) + 0.3 * (TOP(z) - FLOOR(z)), 0.1));
      hard.push(onFlank(socket(), side, 6, 43, 0.1), onFlank(socket(), side, 8, 33.5, 0.1));
    }
    addMesh(inserts, mergeGeometries(hard), m.insert, { edgeOpacity: 0.5 });
    // the roll hoop: a machined band round the tower
    addMesh(inserts, outlinedBy(creased(loft([[-59.4, 0], [-59.1, 0.45], [-52.9, 0.45], [-52.6, 0]].map(([z, g]) => arch(z, g)), { wrap: false })), loft([-59.2, -52.8].map((z) => arch(z, 0.45)), { wrap: false })), m.insert, { edgeOpacity: 0.55 });
    // the fuel cell's hatch: on the LEFT flank, behind the seat
    const hatch = { z: -56, y: 42, w: 28, h: 17 };
    const rim = rrect(hatch.w, hatch.h, 4.5);
    rim.holes.push(rrect(hatch.w - 5, hatch.h - 5, 2.6));
    const bx = hatch.w / 2 - 1.25;
    const by = hatch.h / 2 - 1.25;
    const bolts = [[-8, by], [0, by], [8, by], [-8, -by], [0, -by], [8, -by], [bx, 3], [bx, -3], [-bx, 3], [-bx, -3]].map(([x, y]) => lyingZ(hex(0.62, 0.5, 0.06)).translate(x, y, 0.95));
    addMesh(inserts, onFlank(mergeGeometries([plate(rim, 0.8, { bevel: 0.2 }), ...bolts]), 1, hatch.z, hatch.y, 0), m.insert, { edgeOpacity: 0.5 });
    addMesh(inserts, onFlank(box(hatch.w - 5, hatch.h - 5, 0.5, 0.2), 1, hatch.z, hatch.y, 0), solid(C.pad, { rough: 0.8, metal: 0.15 }), { edges: false });
  }
  // the three seats of the halo: blocks let into the carbon — one ahead of the cockpit, one on each shoulder
  const PED = { front: { y1: HALO.foot[0][1] - 1.2 }, rear: { y1: PLATE_TOP - 1.2 } };
  const pedF = partIn(cellG, "seatFront");
  addMesh(pedF, box(15.8, 3.2, 13.6, 0.5).translate(0, PED.front.y1 - 1.6, HALO.foot[0][2]), M.insert(), { edgeOpacity: 0.55 });
  const pedR = partIn(cellG, "seatRear");
  {
    const y1 = PED.rear.y1;
    const x1 = MOUNT[0] + 4.5; // it stands 2 cm proud of the flank, and comes back to it by a chamfer
    const boss = (s) => plate([[MOUNT[0] - 4.9, y1 - 4.5], [CELL.half + 0.25, y1 - 7.9], [CELL.half + 0.25, y1 - 6.9], [x1, y1 - 3.4], [x1, y1], [MOUNT[0] - 4.9, y1]].map(([x, y]) => [s * x, y]), 23, { bevel: 0.5, round: 2 }).translate(0, 0, MOUNT[2] - 14.5);
    const screws = [1, -1].flatMap((s) => [-47, -35].map((z) => lyingX(hex(0.85, 0.7, 0.1)).translate(s * (x1 + 0.2), y1 - 1.7, z)));
    addMesh(pedR, mergeGeometries([boss(1), boss(-1)]), M.insert(), { edgeOpacity: 0.55 });
    addMesh(pedR, mergeGeometries(screws), M.alu(), { edgeOpacity: 0.45 });
  }

  /* ── the headrest ── */
  const pad = partIn(cellG, "headrest");
  addMesh(pad, outlinedBy(creased(loft(padRows(false)), 38), loft(padRows(true))), solid(C.pad, { rough: 0.9, env: 0.6 }), { edgeOpacity: 0.5, threshold: 40 });

  /* ── the wheel: small, solid, on its column ── */
  const WHEEL = { hub: V(0, 49.5, 36.5), tilt: 17 * DEG, grip: 12.9 };
  const wheelG = grp(cellG);
  wheelG.position.copy(WHEEL.hub);
  wheelG.rotation.x = WHEEL.tilt;
  const wheel = partIn(wheelG, "wheel");
  {
    const halfOutline = [[0, 6.2], [7.5, 6.2], [10.6, 7.3], [13.9, 6.7], [14.6, 2], [14.6, -4.2], [12.8, -7.1], [10.4, -6.5], [9.6, -3.8], [6, -5.3], [0, -5.7]];
    const loop = [...halfOutline, ...halfOutline.slice(1, -1).reverse().map(([x, y]) => [-x, y])];
    const shape = new THREE.Shape(chamfer([loop[loop.length - 1], ...loop, loop[0]], 1.1, 3).slice(1, -1).map(([x, y]) => new THREE.Vector2(x, y)));
    for (const s of [1, -1]) {
      const hole = rrect(2.3, 6.6, 1);
      shape.holes.push(new THREE.Path(hole.getPoints(6).map((p) => new THREE.Vector2(p.x + s * 10.15, p.y + 0.9))));
    }
    const m = { body: solid(C.grip, { rough: 0.82, env: 0.7 }), screen: solid(0x0b0e10, { rough: 0.2, coat: 1, coatRough: 0.1 }), key: solid(C.fine, { rough: 0.5, metal: 0.3 }), column: M.insert() };
    addMesh(wheel, plate(shape, 2.3, { bevel: 0.45, round: 3 }).rotateY(Math.PI), m.body, { edgeOpacity: 0.6 });
    addMesh(wheel, box(8, 4.6, 0.4, 0.15).translate(0, 2, -2.4), m.screen, { edgeOpacity: 0.7 });
    const keys = [];
    for (const s of [1, -1]) {
      for (const [x, y] of [[5.9, 4.2], [5.9, 1.6], [5.9, -1]]) keys.push(lyingZ(cyl(0.72, 0.6, 0.12, 16)).translate(s * x, y, -2.5));
      keys.push(lyingZ(cyl(1.15, 0.8, 0.15, 20)).translate(s * 2.5, -3.2, -2.55)); // a rotary dial
    }
    addMesh(wheel, mergeGeometries(keys), m.key, { edges: false });
    addMesh(wheel, mergeGeometries([lyingZ(cyl(2.6, 2.4, 0.3, 28)).translate(0, 0, 1.2), lyingZ(cyl(1.6, 12, 0.2, 20)).translate(0, 0, 7.5)]), m.column, { edgeOpacity: 0.5 });
  }

  /* ── the halo: the ring, the collars of its welds, the pillar and its foot, the two shoes ── */
  const haloG = grp();
  const ringP = partIn(haloG, "ring");
  const ringGeo = sweep(RING, HALO.r, 24);
  const RING_LEN = ringGeo.userData.length;
  {
    const ti = M.titanium();
    addMesh(ringP, ringGeo, ti, { edges: false });
    const q = new THREE.Quaternion();
    const collars = [0.07, 0.385, 0.615, 0.93].map((u) => {
      const i = Math.round(u * RING_N);
      q.setFromUnitVectors(UP, V().subVectors(RING[i + 1], RING[i - 1]).normalize());
      return lathe(ringOf(HALO.r - 0.2, HALO.r + 0.34, -0.7, 0.7), 40, { bevel: 0.14, round: 2 }).applyQuaternion(q).translate(RING[i].x, RING[i].y, RING[i].z);
    });
    addMesh(ringP, mergeGeometries(collars), ti, { edgeOpacity: 0.45 });
  }
  const pillarP = partIn(haloG, "pillar");
  {
    const ti = M.titanium();
    const rows = [];
    const around = 36;
    const e = 2 / 2.4; // a little squarer than an ellipse
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const a = FOOT_A(t);
      const b = FOOT_B(t);
      const row = [];
      for (let j = 0; j < around; j++) {
        const phi = (j / around) * Math.PI * 2;
        const s = Math.sin(phi);
        const c = Math.cos(phi);
        row.push([a * Math.sign(s) * Math.pow(Math.abs(s), e), mix(FOOT.y0 + 0.4, FOOT.y1, t), mix(FOOT.z0, FOOT.z1, t) + b * Math.sign(c) * Math.pow(Math.abs(c), e)]);
      }
      rows.push(row);
    }
    addMesh(pillarP, creased(loft(rows), 40), ti, { edgeOpacity: 0.4 });
    // its flange, and the nuts on the two studs that come up through it
    addMesh(pillarP, box(13, 1, 9.8, 0.3).translate(0, FOOT.y0 + 0.5, FOOT.z0), ti, { edgeOpacity: 0.5 });
    addMesh(pillarP, mergeGeometries(STUDS.front.flatMap(([x, z]) => [cyl(1.8, 0.25, 0.06, 24).translate(x, FOOT.y0 + 1.125, z), hex(1.5, 1.1).translate(x, FOOT.y0 + 1.8, z)])), M.fine(), { edgeOpacity: 0.5 });
  }
  const shoes = partIn(haloG, "shoes");
  {
    const ti = M.titanium(0.54);
    const y0 = PLATE_TOP;
    const outline = [[SHOE.z0, y0], [SHOE.z1, y0], [SHOE.z1, y0 + 3.8], [-33.6, y0 + 8.5], [-38.5, y0 + 7.9], [-42.2, y0 + 2.7], [SHOE.z0, SHOE.toe]];
    const one = (s) => plate(outline, SHOE.w, { bevel: 0.6, round: 3 }).rotateY(-Math.PI / 2).translate(s * MOUNT[0] + SHOE.w / 2, 0, 0);
    addMesh(shoes, mergeGeometries([one(1), one(-1)]), ti, { edgeOpacity: 0.5 });
    addMesh(shoes, mergeGeometries([1, -1].flatMap((s) => STUDS.rear.flatMap((z) => [cyl(1.8, 0.25, 0.06, 24).translate(s * MOUNT[0], SHOE.toe + 0.125, z), hex(1.5, 1.1).translate(s * MOUNT[0], SHOE.toe + 0.8, z)]))), M.fine(), { edgeOpacity: 0.5 });
  }

  /* ── its three fixings: a plate, two studs standing in it ── */
  const STUD_IN = 4.6; // how far a stud goes down into the cell
  const fixing = (name, w, d, x, yTop, z, studs, len) => {
    const g = grp();
    const part = partIn(g, name);
    addMesh(part, box(w, 1.2, d, 0.3).translate(x, yTop - 0.6, z), M.alu(), { edgeOpacity: 0.55 });
    addMesh(part, mergeGeometries(studs.map(([sx, sz]) => cyl(1.05, len + STUD_IN, 0.22, 20).translate(sx, yTop - STUD_IN + (len + STUD_IN) / 2, sz))), M.fine(), { edgeOpacity: 0.45 });
    return { g, part };
  };
  const fixF = fixing("fixFront", 14.4, 11.6, 0, HALO.foot[0][1], HALO.foot[0][2], STUDS.front, 3);
  const fixL = fixing("fixLeft", 8.6, 21.6, MOUNT[0], PLATE_TOP, MOUNT[2] - 2.9, STUDS.rear.map((z) => [MOUNT[0], z]), 4.3);
  const fixR = fixing("fixRight", 8.6, 21.6, -MOUNT[0], PLATE_TOP, MOUNT[2] - 2.9, STUDS.rear.map((z) => [-MOUNT[0], z]), 4.3);

  /* ── light on the ring: the load of the test, the heat of the steel ── */
  const skin = skinMaterial(RING_LEN);
  const skinMesh = new THREE.Mesh(sweep(RING, HALO.r + 0.08, 24, V(-0.2, 0.82, 0.54).normalize()), skin);
  skinMesh.renderOrder = 4;
  skinMesh.visible = false;
  haloG.add(skinMesh);
  const hotBalls = [makeBall(HOT, SIGNAL), makeBall(HOT, SIGNAL)];
  const sparks = makeSparks();
  const touchBall = makeBall(WHITE, VEILLE);
  touchBall.position.set(0, PRESS.y - 0.4, PRESS.z);
  haloG.add(...hotBalls, sparks.points, touchBall);
  // where the barrier's line crosses the ring, seen from above (`ahead` metres from its final place)
  const TAN = Math.tan(RAIL.angle * DEG);
  const crossing = [V(), V()];
  const crossS = [-999, -999];
  let crossedAt = -1;
  function crossings(ahead) {
    const z0 = RAIL.cross + 100 * Math.min(0.9, Math.max(0, ahead));
    if (z0 === crossedAt) return;
    crossedAt = z0;
    let found = 0;
    crossS[0] = crossS[1] = -999;
    let g0 = RING[0].x - (RING[0].z - z0) * TAN;
    for (let i = 1; i <= RING_N && found < 2; i++) {
      const g1 = RING[i].x - (RING[i].z - z0) * TAN;
      if (g0 * g1 < 0) {
        const u = g0 / (g0 - g1);
        crossing[found].lerpVectors(RING[i - 1], RING[i], u);
        crossing[found].y += HALO.r;
        crossS[found] = ((i - 1 + u) / RING_N) * RING_LEN;
        found++;
      }
      g0 = g1;
    }
  }

  /* ── the test: a ram, its steel pad ── */
  const ramG = grp();
  const ram = partIn(ramG, "ram");
  const padY = PRESS.y; // the pad's lower face, bearing on the ring
  {
    const m = { steel: solid(C.steel, { rough: 0.34, metal: 0.5 }), pad: solid(C.alu, { rough: 0.45, metal: 0.45 }), dark: solid(0x2a2f34, { rough: 0.7, metal: 0.2 }), body: solid(0x3a4046, { rough: 0.8, metal: 0.1, env: 0.2 }) };
    addMesh(ram, cyl(7.5, 3.2, 0.4, 56).translate(0, padY + 1.6, PRESS.z), m.pad, { edgeOpacity: 0.6 });
    addMesh(ram, mergeGeometries([cyl(2.9, 2.2, 0.25, 32).translate(0, padY + 4.3, PRESS.z), cyl(3.3, 17, 0.3, 40).translate(0, padY + 19.4, PRESS.z)]), m.steel, { edgeOpacity: 0.4 });
    addMesh(ram, cyl(5.3, 5.6, 0.5, 40).translate(0, padY + 8.2, PRESS.z), m.dark, { edgeOpacity: 0.6 });
    addMesh(ram, cyl(6.9, 3.6, 0.5, 40).translate(0, padY + 29.6, PRESS.z), m.pad, { edgeOpacity: 0.55 });
    // the cylinder comes down out of the dark: its colour fades to black on the way up
    const body = new THREE.CylinderGeometry(8.3, 8.3, 90, 48, 24, true).translate(0, padY + 31.4 + 45, PRESS.z);
    const colors = new Float32Array(body.attributes.position.count * 3);
    for (let i = 0; i < body.attributes.position.count; i++) colors.fill(1 - smooth(ramp(body.attributes.position.getY(i) - (padY + 31.4), 3, 36)), i * 3, i * 3 + 3);
    body.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    m.body.vertexColors = true;
    addMesh(ram, body, m.body, { edges: false }).castShadow = false;
    ram.userData.part.meshes.pop();
  }

  /* ── you ── */
  const youG = grp();
  const fig = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.8, through: 0.2 });
  fig.ghost(true); // glass from head to hands: what is solid of you is your helmet
  youG.add(fig.group);
  const helmetG = new THREE.Group();
  fig.head.add(helmetG);
  const helmet = partIn(helmetG, "helmet");
  {
    const m = { shell: solid(C.helmet, { rough: 0.42, coat: 0.6, coatRough: 0.25 }), visor: solid(0x0c1013, { rough: 0.16, coat: 1, coatRough: 0.08, double: true }), trim: solid(C.rubber, { rough: 0.9, env: 0.5 }), pivot: M.insert() };
    addMesh(helmet, helmetShaped(new THREE.SphereGeometry(1, 64, 44, 0, Math.PI * 2, 0, Math.PI * 0.795)), m.shell, { edges: false });
    addMesh(helmet, helmetShaped(new THREE.SphereGeometry(1, 48, 12, Math.PI - 1.24, 2.48, 67 * DEG, 31 * DEG), 1.014), m.visor, { edgeColor: 0x15191c, edgeOpacity: 0.8, threshold: 80 });
    addMesh(helmet, new THREE.TorusGeometry(10.9, 1.9, 14, 48).rotateX(Math.PI / 2).scale(1, 1, 1.07).translate(0, -10.9, 0.3), m.trim, { edges: false });
    addMesh(helmet, mergeGeometries([1, -1].map((s) => lyingX(cyl(1.7, 0.7, 0.15, 24)).translate(s * 13.05, 1.2, 2.4))), m.pivot, { edgeOpacity: 0.5 });
    for (const mesh of helmet.children) mesh.castShadow = false; // glass casts no shadow: a helmet alone would cast an orphan oval
    helmet.userData.part.meshes.length = 0;
  }
  const helmetLine = new THREE.Mesh(helmetShaped(new THREE.SphereGeometry(1, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.795), 1.03), glass(BRAND.ink, { base: 0.008, rim: 0.75, power: 2.4, edge: 0.6 }));
  helmetLine.renderOrder = 10;
  helmetLine.visible = false;
  helmetG.add(helmetLine);

  // five postures, from the seat to the track (the figure's own frame is its feet's)
  const HIP0 = V(0, 15, 33); // your hips in the seat: the trunk lies back 50° from there, and your head is where the plan says
  const Y = V(0, 1, 0);
  const K = [
    { at: 0, P: V(HIP0.x, HIP0.y - fig.HIP, HIP0.z), yaw: 0, pitch: -50, roll: 0, head: 1, grip: 0.92, ankle: [V(7.5, 30, 108), V(-7.5, 30, 108)], wrist: [V(), V()], knee: V(0, 1, 0.15), toe: V(0, 0.6, 0.8), elbow: 0.3, drop: -1, back: 0 },
    { at: 0.24, P: V(0, -36, 18), yaw: 0, pitch: -14, roll: 0, head: 0, grip: 0.7, ankle: [V(8.5, 17, 34), V(-8.5, 17, 34)], wrist: [V(28.5, 91.5, 14), V(-28.5, 91.5, 14)], knee: V(0, 0.5, 1), toe: V(0, 0, 1), elbow: 1, drop: -0.2, back: -0.5 },
    { at: 0.5, P: V(0, -3, 30), yaw: 14, pitch: 7, roll: 5, head: 0, grip: 0.6, ankle: [V(9, 17, 31), V(-8, 17, 29)], wrist: [V(29, 91.5, 24), V(-28.5, 91.5, 26)], knee: V(0, 0.2, 1), toe: V(0, 0, 1), elbow: 0.8, drop: 0.2, back: -0.6 },
    { at: 0.76, P: V(EXIT.over[0] - 6, 36, EXIT.over[2] - 2), yaw: 70, pitch: 35, roll: 0, head: 0, grip: 0.5, ankle: [V(54, 106, 26), V(27, 98.5, 18)], wrist: [V(62, 108, 14), V(56, 108, 44)], knee: V(0, 0.4, 1), toe: V(0, 0, 1), elbow: 0.6, drop: -0.3, back: -0.7 },
    { at: 1, P: V(...EXIT.down), yaw: 90, pitch: 3, roll: 0, head: 0, grip: 0.15, ankle: [V(), V()], wrist: [V(), V()], knee: V(0, 0, 1), toe: V(0, 0, 1), elbow: 0.35, drop: -1, back: -0.1 },
  ];
  const HEAD_UP = V(0, 76.5, 1); // where the kit puts the head on the trunk
  const head0 = V();
  const lay0 = { L: { dir: V(), palm: V() }, R: { dir: V(), palm: V() } };
  const v1 = V();
  const v2 = V();
  const v3 = V();
  const P = V();
  const toFig = (w, yaw, out) => out.copy(w).sub(P).applyAxisAngle(Y, -yaw);
  const fromFig = (l, k, out) => out.copy(l).applyAxisAngle(Y, k.yaw * DEG).add(k.P);
  {
    // the seat: the pose is found once — where a hand closed on each grip has its wrist, where the head stands on the trunk
    const k = K[0];
    P.copy(k.P);
    fig.group.position.copy(P);
    fig.leg("L", toFig(k.ankle[0], 0, v1), k.knee, k.toe);
    fig.leg("R", toFig(k.ankle[1], 0, v1), k.knee, k.toe);
    fig.lean(k.pitch, 0, 0);
    head0.set(...HELMET.c).sub(P).applyMatrix4(new THREE.Matrix4().copy(fig.torso.matrix).invert());
    const axis = V(0, Math.cos(WHEEL.tilt), Math.sin(WHEEL.tilt)); // a grip of the wheel: a bar standing in its plane
    ["L", "R"].forEach((s, i) => {
      const sx = i ? -1 : 1;
      v1.set(sx * WHEEL.grip, 0.9, -1.15).applyAxisAngle(V(1, 0, 0), WHEEL.tilt).add(WHEEL.hub);
      fig.hold(s, toFig(v1, 0, v2), axis, { palm: v3.set(-sx, 0, 0), dir: V(0, -0.25, 1), k: k.grip, bar: 1.35, bend: V(sx * k.elbow, k.drop, k.back) });
      k.wrist[i].copy(fig.arms[s].target).add(P);
      lay0[s].dir.copy(fig.arms[s].dir);
      lay0[s].palm.copy(fig.arms[s].palm);
    });
    // standing on the track: the kit's own rest pose, where the last key stands
    const e = K[4];
    fromFig(v1.set(8.6, 8, 0), e, e.ankle[0]);
    fromFig(v1.set(-8.6, 8, 0), e, e.ankle[1]);
    fromFig(v1.set(21, 93, 6), e, e.wrist[0]);
    fromFig(v1.set(-21, 93, 6), e, e.wrist[1]);
  }
  const knee = V();
  const toe = V();
  const bend = V();
  let posed = -1;
  function poseYou(o) {
    if (o === posed) return;
    posed = o;
    let i = 0;
    while (i < K.length - 2 && o > K[i + 1].at) i++;
    const a = K[i];
    const b = K[i + 1];
    const u = smooth(ramp(o, a.at, b.at));
    const yaw = mix(a.yaw, b.yaw, u) * DEG;
    const pitch = mix(a.pitch, b.pitch, u);
    P.lerpVectors(a.P, b.P, u);
    if (i === 2 || i === 3) P.y += 14 * Math.sin(Math.PI * u) * (i === 2 ? 1 : 0.4); // over the beam, not through it
    fig.group.position.copy(P);
    fig.group.rotation.y = yaw;
    knee.lerpVectors(a.knee, b.knee, u);
    toe.lerpVectors(a.toe, b.toe, u);
    fig.leg("L", toFig(v1.lerpVectors(a.ankle[0], b.ankle[0], u), yaw, v2), knee, toe);
    fig.leg("R", toFig(v1.lerpVectors(a.ankle[1], b.ankle[1], u), yaw, v2), knee, toe);
    fig.lean(pitch, mix(a.roll, b.roll, u), 0);
    fig.head.position.lerpVectors(HEAD_UP, head0, mix(a.head, b.head, u));
    fig.head.rotation.x = -pitch * DEG; // whatever the trunk does, you look ahead
    const seated = o < 0.1;
    for (let s = 0; s < 2; s++) {
      const side = s ? "R" : "L";
      const sx = s ? -1 : 1;
      bend.set(sx * mix(a.elbow, b.elbow, u), mix(a.drop, b.drop, u), mix(a.back, b.back, u));
      fig.reach(side, toFig(v1.lerpVectors(a.wrist[s], b.wrist[s], u), yaw, v2), bend, seated ? lay0[side] : undefined);
      fig.grip(side, mix(a.grip, b.grip, u), 1.35);
    }
  }
  poseYou(0);

  /* ── your harness: six straps to one buckle, laid on the trunk as it lies in the seat ── */
  const harnessMat = new THREE.MeshBasicMaterial({ color: VEILLE.clone().multiplyScalar(1.15), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const harness = grp();
  harness.visible = false;
  {
    fig.torso.updateMatrix();
    const onTrunk = (x, y, z) => V(x, y, z).applyMatrix4(fig.torso.matrix).add(fig.group.position);
    const facing = (x, y, z) => V(x, y, z).normalize().transformDirection(fig.torso.matrix);
    const chest = (x, y, r) => 0.62 * Math.sqrt(Math.max(0, r * r - x * x)) + 1; // the trunk's front, a centimetre proud
    const strips = [];
    for (const s of [1, -1]) {
      // over the shoulder, down the chest
      strips.push(ribbon(
        [onTrunk(s * 8.5, 58, -9), onTrunk(s * 8.2, 62.2, -1), onTrunk(s * 7.6, 53, chest(7.6, 53, 17.4)), onTrunk(s * 6.5, 38, chest(6.5, 38, 14.2)), onTrunk(s * 4.4, 22, chest(4.4, 22, 11.3)), onTrunk(s * 1.2, 9.5, chest(1.2, 9.5, 12))],
        [facing(0, 1, -0.5), facing(0, 1, 0.2), facing(0, 0.4, 1), facing(0, 0, 1), facing(0, 0, 1), facing(0, 0, 1)],
        4.6,
      ));
      // across the hips
      strips.push(ribbon([onTrunk(s * 15.5, 0.5, -3), onTrunk(s * 12.2, 3.5, 4.4), onTrunk(s * 6.5, 6, 7.9), onTrunk(s * 1.2, 7.4, chest(1.2, 7.4, 12))], [facing(s, 0.2, 0.3), facing(s * 0.7, 0.2, 0.7), facing(s * 0.3, 0.1, 1), facing(0, 0, 1)], 4.6));
      // between the legs
      strips.push(ribbon([onTrunk(s * 1.4, 6.4, chest(1.4, 6.4, 12)), onTrunk(s * 2.6, -1, 8.8), onTrunk(s * 3.4, -8, 4.5)], [facing(0, 0, 1), facing(0, -0.2, 1), facing(0, -0.6, 0.8)], 3.6));
    }
    for (const geo of strips) harness.add(new THREE.Mesh(geo, harnessMat));
    const buckle = new THREE.Mesh(lyingZ(new THREE.CylinderGeometry(3.1, 3.1, 0.9, 28)), harnessMat);
    buckle.position.copy(onTrunk(0, 8, chest(0, 8, 12) + 0.5));
    buckle.quaternion.setFromUnitVectors(V(0, 0, 1), facing(0, 0, 1));
    harness.add(buckle);
    for (const mesh of harness.children) mesh.renderOrder = 6;
  }

  /* ── the space the halo keeps ── */
  const spaceG = grp();
  const volume = new THREE.Mesh(blob(27.5, 19, 47, 3), volumeMaterial(3, CELL.rim - 1, CELL.rim + 9));
  volume.position.set(0, HELMET.c[1] + 1, 6);
  volume.material.uniforms.uLow.value -= volume.position.y; // heights in its own frame
  volume.material.uniforms.uHigh.value -= volume.position.y;
  const heart = new THREE.Mesh(blob(25, 21, 27), volumeMaterial(3.2, -99, -98));
  heart.position.set(...HELMET.c);
  heart.material.uniforms.uColor.value.lerp(WHITE, 0.45); // its heart is light, not green paint on your helmet
  for (const mesh of [volume, heart]) {
    mesh.renderOrder = 5;
    mesh.frustumCulled = false;
  }
  spaceG.add(volume, heart);
  spaceG.visible = false;
  const spaceLight = new THREE.PointLight(BRAND.veille, 0, 90, 2);
  spaceLight.position.set(0, HELMET.c[1] + 6, HELMET.c[2] + 10);
  // the fire, behind you: a light that has a place
  const fireLight = new THREE.PointLight(BRAND.signal, 0, 460, 2);
  fireLight.position.set(-50, 118, CELL.z0 - 40);
  root.add(spaceLight, fireLight);

  /* ── anchors ── */
  const A = {
    halo: anchor(haloG, 0, HALO.foot[1][1] + HALO.r, HALO.foot[1][2]),
    foot: anchor(haloG, -1.6, mix(FOOT.y0, FOOT.y1, 0.45), mix(FOOT.z0, FOOT.z1, 0.45) + 2),
    mountL: anchor(fixL.g, MOUNT[0], PLATE_TOP, MOUNT[2] - 8),
    mountR: anchor(fixR.g, -MOUNT[0], PLATE_TOP, MOUNT[2] - 8),
    helmet: anchor(root, ...HELMET.c),
    cell: anchor(cellG, -HALF(96), 36, 96),
    hoop: anchor(cellG, 0, CELL.hoop.top, CELL.hoop.z),
    seat: anchor(cellG, 0, SEAT_Y(8) + 1, 8),
    pad: anchor(ramG, 0, padY + 1.6, PRESS.z),
    you: anchor(fig.head, 0, 0, 0),
  };

  /* ── what lights up when the voice names a part: its solids, and the lines of its edges ── */
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
    return { solids, lines, lit: -1, extra: -1 };
  };
  const lamps = { halo: lampOf(ringP), foot: lampOf(pillarP, fixF.part), mounts: lampOf(shoes, fixL.part, fixR.part), cell: lampOf(shell, inserts, pedF, pedR) };
  /** `k`: named by the voice · `extra`: more veille light on top of it (the load of the test). */
  const light = (lamp, k, extra = 0) => {
    if (lamp.lit === k && lamp.extra === extra) return;
    lamp.lit = k;
    lamp.extra = extra;
    for (const mat of lamp.solids) {
      mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k + extra);
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.55 * Math.max(k, Math.min(1, extra * 4)));
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };

  return {
    root, A, fig,
    parts: { shell, inserts, pad, wheel, ringP, pillarP, shoes, fixF: fixF.part, fixL: fixL.part, fixR: fixR.part, helmet, ram },
    update(p, time = 0, px = 1600) {
      const k = clamp01(p.explode ?? 0);
      const you = clamp01(p.you ?? 0);
      const out = clamp01(p.out ?? 0);
      const press = clamp01(p.press ?? 0);
      const stress = clamp01(p.stress ?? 0);
      const space = clamp01(p.space ?? 0);
      const fire = clamp01(p.fire ?? 0);

      // ── opened: the halo leaves first, straight up; its three fixings follow, half-way
      haloG.position.y = 70 * settle(ramp(k, 0.06, 0.86));
      const lift = 35 * settle(ramp(k, 0.24, 1));
      fixF.g.position.y = lift;
      fixL.g.position.y = lift;
      fixR.g.position.y = lift;

      // ── you
      const here = you > 0.004;
      youG.visible = here;
      if (here) {
        poseYou(out);
        fig.body.uniforms.uAmount.value = you;
        setPartOpacity(helmet, you);
        const through = you * smooth(ramp(out, 0.5, 0.8));
        helmetLine.visible = through > 0.004;
        helmetLine.material.uniforms.uAmount.value = through;
      }
      const belted = clamp01(p.harness ?? 0) * you * (1 - ramp(out, 0, 0.08));
      harness.visible = belted > 0.004;
      harnessMat.opacity = belted;

      // ── the test: the ram comes down, touches (0.3), and loads
      const touch = smooth(ramp(press, 0.26, 0.32));
      const load = ramp(press, 0.3, 1);
      const down = ramp(press, 0, 0.3);
      setPartOpacity(ram, smooth(ramp(press, 0, 0.07)));
      ramG.position.y = PRESS.drop * (1 - down) * (1 - down);

      // ── the part the voice names; and the load, which runs from the pad to the three fixings
      light(lamps.halo, clamp01(p.litHalo ?? 0), 0.07 * load + 0.04 * space);
      light(lamps.foot, clamp01(p.litFoot ?? 0), 0.08 * smooth(ramp(load, 0.3, 0.8)));
      light(lamps.mounts, clamp01(p.litMounts ?? 0), 0.08 * smooth(ramp(load, 0.55, 1)));
      light(lamps.cell, clamp01(p.litCell ?? 0));

      // ── light on the ring
      skinMesh.visible = touch > 0.004 || stress > 0.004;
      skin.uniforms.uTouch.value = touch;
      skin.uniforms.uLoad.value = load;
      skin.uniforms.uStress.value = stress;
      touchBall.visible = touch > 0.004;
      touchBall.material.uniforms.uRadius.value = 15;
      touchBall.material.uniforms.uMinPx.value = 10;
      touchBall.material.uniforms.uAmount.value = touch * (0.22 + 0.4 * load);
      const hot = stress > 0.004;
      sparks.points.visible = hot;
      if (hot) {
        crossings(p.ahead ?? 0.9);
        skin.uniforms.uC1.value = crossS[0];
        skin.uniforms.uC2.value = crossS[1];
        sparks.uniforms.uT.value = time;
        sparks.uniforms.uScale.value = px;
        sparks.uniforms.uAmount.value = stress;
        sparks.uniforms.uO1.value.copy(crossing[0]);
        sparks.uniforms.uO2.value.copy(crossing[1]);
        sparks.uniforms.uOn2.value = crossS[1] > -900 ? 1 : 0;
      }
      for (let i = 0; i < 2; i++) {
        const ball = hotBalls[i];
        ball.visible = hot && crossS[i] > -900;
        if (!ball.visible) continue;
        ball.position.copy(crossing[i]);
        ball.material.uniforms.uRadius.value = 9;
        ball.material.uniforms.uMinPx.value = 9;
        ball.material.uniforms.uAmount.value = 0.55 * stress;
      }

      // ── the space the halo keeps
      spaceG.visible = space > 0.004;
      volume.material.uniforms.uAmount.value = 0.4 * space;
      heart.material.uniforms.uAmount.value = 0.2 * space;
      spaceLight.intensity = 240 * space;

      // ── the fire behind you: it breathes slowly
      fireLight.intensity = 15000 * fire * (0.9 + 0.1 * Math.sin(time * 1.7));
    },
  };
}
