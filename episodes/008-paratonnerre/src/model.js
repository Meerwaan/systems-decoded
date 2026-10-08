// DOSSIER 008 — the lightning rod: at its place on the house (buildRod), and as a kit on the bench (buildKit).
// Centimetres, y up. Nothing here moves and nothing is powered: a rod, a wire, a stake.
//   · the capture rod: turned steel, tapered, its end ROUNDED (2.1 cm across — not a needle), screwed by its
//     wrench flats into a sleeve on top of a 6 cm mast, 4 m above the ridge
//   · the down conductor: 50 mm² of round wire — 8 mm, a pencil. It is held in a terminal on the sleeve, comes
//     down the mast on clips, leaves it above the base, runs down the roof, round its edge, back to the wall,
//     down the front
//   · the test joint, at a man's height: two terminal blocks and a link bar that can be taken off
//   · the earth: a 2.5 m stake, the wire held against its head by a stirrup
// Three values of grey, laid from the ground up: what fixes it is dark (cast), the mast and the stake are in
// between (steel), what is machined is clear (fine) and the rod is the clearest thing of all (hero). The wire is
// a clear grey too — a thin thing must be clearer than what holds it: the film has three colours, and copper is none of them.
// Light is veille, and it all runs on one ruler, `s`: centimetres from the top of the rod down to the foot of the stake.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, setPartOpacity, box, cyl, lathe, plate, mergeGeometries, fatLine, anchor } from "@kit/build3d.js";
import { HOUSE, ROD } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const OUT = V(0, 0, 1);
const VEILLE = new THREE.Color(BRAND.veille);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const H2 = (BRAND.H / 2).toFixed(1);
const into = (frame, mesh) => (frame.add(mesh), mesh);

// Opened, the kit is a ROW: a column 1.4 m tall and a hand wide fills nothing of an upright picture, three
// parts side by side are each twice as large in it. The row lies across the picture of a camera at az −40.
const ROW = [Math.cos(40 * DEG), Math.sin(40 * DEG)]; // x, z
const OPEN = { rod: [-44, -62], wire: [-20, -10] }; // how far along the row, how far up, each part ends
/**
 * The kit on the bench. `tip`: where the top of its rod stands when it is assembled (the cut from the house
 * matches on it). `open`: the middle of the row it opens into — what the camera aims at then — and
 * `openTip`: where the top of the rod has gone.
 */
export const KIT = {
  tip: [0, 144, 0],
  open: [ROW[0] * -15, 41, ROW[1] * -15],
  openTip: [ROW[0] * OPEN.rod[0], 144 + OPEN.rod[1], ROW[1] * OPEN.rod[0]],
};

const TIP_R = 1.05; // the rounded end of the rod
const MAST_R = 3;
const WIRE_R = 0.4;
const STAKE_R = 1.1;
const HEAD = 70; // how much of the top of the mast the kit keeps
const WIRE_Z = MAST_R + 1.6; // the conductor stands off the mast on its clips…
const CLAMP_Z = 5.5; // …and steps out to enter its terminal on the sleeve
const WIRE_TOP = [[0, -51.9, CLAMP_Z], [0, -61.8, CLAMP_Z], [0, -66.6, WIRE_Z]]; // its first points, from the tip of the rod
const STAKE_OFF = STAKE_R + 0.15 + WIRE_R; // the wire lies along the stake
const WALL_OFF = 6; // …and stands this far off the wall

// One set of materials per part: a part fades, or lights up, without taking its neighbours along.
const metals = () => ({
  hero: solid(0xeef0f1, { rough: 0.34, metal: 0.35, env: 1.1 }),
  fine: solid(0xa6adb3, { rough: 0.55, metal: 0.3, env: 0.8 }),
  steel: solid(0x8a929a, { rough: 0.5, metal: 0.3, env: 1 }),
  wire: solid(0xa7aeb5, { rough: 0.38, metal: 0.4 }),
  cast: solid(0x333a41, { rough: 0.62, metal: 0.25, env: 0.8 }),
});

/* ─────────────────────────────────────────────────────────── geometry */

/** A geometry drawn in its own frame — x across, y along the wire, z out of what it is fixed to — set at `p`, y on `along`, z on `out`. */
const framed = (geometry, p, along = UP, out = OUT) =>
  geometry.clone().applyMatrix4(new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(along, out), along, out).setPosition(p));
/** A geometry drawn standing on y = 0, set at `p` and turned to stand along `dir`. */
const aimed = (geometry, p, dir) =>
  geometry.clone().applyMatrix4(new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()), V(1, 1, 1)));
/** A hex head on its washer, standing on y = 0. `r`: across corners / 2. */
const bolt = (r, h = r * 0.75) => mergeGeometries([cyl(r * 1.45, 0.16, 0.04, 20).translate(0, 0.08, 0), cyl(r, h, 0.07, 6).translate(0, 0.16 + h / 2, 0)]);
/** A round, lying along z. */
const lying = (r, len, bevel = 0.12, segments = 24) => cyl(r, len, bevel, segments).rotateX(Math.PI / 2);
/** A flat plate w × h, its four corners rounded by r, `depth` thick (from z = 0). */
const slab = (w, h, r, depth, bevel = 0.14) => {
  const outline = [];
  for (const [sx, sy, a0] of [[1, -1, -90], [1, 1, 0], [-1, 1, 90], [-1, -1, 180]]) {
    for (let i = 0; i <= 6; i++) outline.push([sx * (w / 2 - r) + r * Math.cos((a0 + i * 15) * DEG), sy * (h / 2 - r) + r * Math.sin((a0 + i * 15) * DEG)]);
  }
  return plate(outline, depth, { bevel });
};
const join = (...sets) => {
  const all = {};
  for (const set of sets) for (const [key, list] of Object.entries(set)) (all[key] ??= []).push(...list);
  return all;
};

/** A polyline with its corners rounded — the way a wire is bent — and no stretch longer than `stride`. `cut`: how far each corner is cut back (one number, or one per point). */
function bent(points, cut = 4, steps = 6, stride = 45) {
  const out = [];
  const push = (p) => {
    const last = out[out.length - 1];
    if (last) {
      const n = Math.ceil(last.distanceTo(p) / stride);
      for (let i = 1; i < n; i++) out.push(last.clone().lerp(p, i / n));
    }
    out.push(p);
  };
  points.forEach((p, i) => {
    const a = points[i - 1];
    const b = points[i + 1];
    if (!a || !b) return push(p.clone());
    const u = a.clone().sub(p);
    const v = b.clone().sub(p);
    const k = Math.min(cut.length ? cut[i] : cut, u.length() / 2.2, v.length() / 2.2);
    const from = p.clone().addScaledVector(u.normalize(), k);
    const to = p.clone().addScaledVector(v.normalize(), k);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      push(from.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(p, 2 * t * (1 - t)).addScaledVector(to, t * t));
    }
  });
  return out;
}

/**
 * A round swept through `points` (its frame carried from one to the next: no twist at a bend). `radii`: one
 * number, or one per point. `sheath`: the ruler, one `s` per point — the vertices are then left ON the path,
 * with their radius and their direction beside them: the shader puts them where it wants (see sheathMaterial).
 */
function tube(points, radii, { radial = 12, caps = false, sheath = null } = {}) {
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
  const B = V();
  const axis = V();
  const d = V();
  const q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) {
    T.subVectors(points[Math.min(n - 1, i + 1)], points[Math.max(0, i - 1)]).normalize();
    if (i === 0) N.set(Math.abs(T.x) > 0.9 ? 0 : 1, 0, Math.abs(T.x) > 0.9 ? 1 : 0);
    else {
      axis.crossVectors(T0, T);
      const sin = axis.length();
      if (sin > 1e-7) N.applyQuaternion(q.setFromAxisAngle(axis.divideScalar(sin), Math.atan2(sin, T0.dot(T))));
    }
    N.addScaledVector(T, -N.dot(T)).normalize();
    T0.copy(T);
    B.crossVectors(T, N);
    const r = radii.length ? radii[i] : radii;
    const p = points[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      d.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a));
      if (sheath) pos.push(p.x, p.y, p.z);
      else pos.push(p.x + d.x * r, p.y + d.y * r, p.z + d.z * r);
      nor.push(d.x, d.y, d.z);
      if (sheath) sAt.push(sheath[i]), rad.push(r);
    }
    if (i) {
      for (let j = 0; j < radial; j++) {
        const a = (i - 1) * ring + j;
        index.push(a, a + 1, a + ring, a + ring, a + 1, a + ring + 1);
      }
    }
    if (caps && (i === 0 || i === n - 1)) {
      const first = pos.length / 3;
      const k = i === 0 ? -1 : 1;
      pos.push(p.x, p.y, p.z);
      nor.push(T.x * k, T.y * k, T.z * k);
      for (let j = 0; j <= radial; j++) {
        const a = (j / radial) * Math.PI * 2;
        d.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a));
        pos.push(p.x + d.x * r, p.y + d.y * r, p.z + d.z * r);
        nor.push(T.x * k, T.y * k, T.z * k);
      }
      for (let j = 1; j <= radial; j++) index.push(first, first + (k > 0 ? j : j + 1), first + (k > 0 ? j + 1 : j));
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  if (sheath) {
    geo.setAttribute("aS", new THREE.Float32BufferAttribute(sAt, 1));
    geo.setAttribute("aRad", new THREE.Float32BufferAttribute(rad, 1));
  }
  geo.setIndex(index);
  return geo;
}

/**
 * A round bar from y0 up to y1, snapped off at either end: the break of an interrupted view, a crown of
 * `teeth` facets `top` / `bottom` cm deep (0: sawn flat). `bore`: the radius of its hole — a tube.
 * Two pieces broken with the same teeth face each other like the two zigzags of a drawing.
 */
function snapped(r, y0, y1, { top = 0, bottom = 0, teeth = 5, bore = 0 } = {}) {
  const seg = teeth * 12;
  const zig = (j) => (j % 12 < 6 ? (j % 12) / 3 - 1 : 3 - (j % 12) / 3);
  const pos = [];
  const nor = [];
  const e1 = V();
  const e2 = V();
  const fn = V();
  const P = (rad, j, y) => V(rad * Math.cos((j / seg) * Math.PI * 2), y, rad * Math.sin((j / seg) * Math.PI * 2));
  const tri = (a, b, c, na, nb, nc) => {
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    nor.push(na.x, na.y, na.z, nb.x, nb.y, nb.z, nc.x, nc.y, nc.z);
  };
  const flat = (a, b, c) => {
    fn.crossVectors(e1.subVectors(b, a), e2.subVectors(c, a)).normalize();
    tri(a, b, c, fn, fn, fn);
  };
  const yb = (j) => y0 + bottom * zig(j);
  const yt = (j) => y1 + top * zig(j);
  const ct = V(0, y1 - 0.4 * top, 0);
  const cb = V(0, y0 + 0.4 * bottom, 0);
  for (let j = 0; j < seg; j++) {
    const k = j + 1;
    const n0 = P(1, j, 0);
    const n1 = P(1, k, 0);
    const b0 = P(r, j, yb(j));
    const b1 = P(r, k, yb(k));
    const t0 = P(r, j, yt(j));
    const t1 = P(r, k, yt(k));
    tri(b0, t0, b1, n0, n0, n1);
    tri(b1, t0, t1, n1, n0, n1);
    if (bore) {
      const ib0 = P(bore, j, yb(j));
      const ib1 = P(bore, k, yb(k));
      const it0 = P(bore, j, yt(j));
      const it1 = P(bore, k, yt(k));
      flat(it0, t1, t0);
      flat(it0, it1, t1);
      flat(ib0, b0, b1);
      flat(ib0, b1, ib1);
      const m0 = n0.clone().negate();
      const m1 = n1.clone().negate();
      tri(ib0, ib1, it0, m0, m1, m0);
      tri(ib1, it1, it0, m1, m1, m0);
    } else {
      flat(ct, t1, t0);
      flat(cb, b0, b1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
  return geo;
}

/** Lists of geometries by material ("steel", or "steel:hw" for small hardware: fainter edges), merged into one mesh each. */
function bins(part, frame, m) {
  const lists = new Map();
  return {
    put(key, ...geos) {
      if (!lists.has(key)) lists.set(key, []);
      lists.get(key).push(...geos.flat());
      return this;
    },
    set(set, p, along, out) {
      for (const [key, list] of Object.entries(set)) this.put(key, p ? list.map((g) => framed(g, p, along, out)) : list);
      return this;
    },
    flush() {
      for (const [key, geos] of lists) {
        const [name, small] = key.split(":");
        into(frame, addMesh(part, mergeGeometries(geos), m[name], { edgeOpacity: small ? 0.36 : name === "hero" ? 0.42 : 0.5 }));
      }
      lists.clear();
    },
  };
}

/* ─────────────────────────────────────────────────────────── the fixings
   Each in its own frame: the wire runs along y through the origin, +z looks away from what it is fixed to. */

/** What grips the conductor, the same on every fixing: a cradle under it, a strap over it, two screws. */
const grip = (w = 4.6) => ({
  cast: [box(w - 1, 3, 1.05, 0.2).translate(0, 0, -0.78), box(w, 2.2, 0.6, 0.15).translate(0, 0, 0.55)],
  "steel:hw": [-1, 1].map((s) => aimed(bolt(0.42, 0.38), V(s * (w / 2 - 0.8), 0, 0.85), OUT)),
});
/** On the roof: a foot screwed on the slope, 2.5 cm under the wire. */
const roofClip = () =>
  join(grip(), {
    cast: [box(7, 5.2, 0.6, 0.15).translate(0, 0, -2.2), box(3.6, 3, 0.62, 0.12).translate(0, 0, -1.6)],
    "steel:hw": [-1, 1].map((s) => aimed(bolt(0.45, 0.36), V(s * 2.65, 0, -1.9), OUT)),
  });
/** On the wall: a plate, a stem, the grip. */
const wallClip = () =>
  join(grip(), {
    cast: [lying(0.85, 4.1).translate(0, 0, -3.3), box(4.8, 6, 0.7, 0.2).translate(0, 0, -WALL_OFF + 0.35)],
    "steel:hw": [-1, 1].map((s) => aimed(bolt(0.45, 0.36), V(0, s * 2.15, -WALL_OFF + 0.7), OUT)),
  });
/** On the mast: a band round it, closed by a bolt at the back. */
const mastClip = () => {
  const z = -(MAST_R + 1.6);
  return join(grip(), {
    cast: [
      lathe([[MAST_R + 0.02, -1.3], [MAST_R + 0.6, -1.3], [MAST_R + 0.6, 1.3], [MAST_R + 0.02, 1.3]], 48, { bevel: 0.12, round: 2 }).translate(0, 0, z),
      ...[-1, 1].map((s) => box(0.9, 2.6, 1.7, 0.2).translate(s * 0.75, 0, z - MAST_R - 1.2)),
    ],
    "steel:hw": [aimed(bolt(0.5, 0.45), V(1.2, 0, z - MAST_R - 1.3), V(1, 0, 0)), aimed(bolt(0.5, 0.45), V(-1.2, 0, z - MAST_R - 1.3), V(-1, 0, 0))],
  });
};

/**
 * The test joint: the conductor is CUT here. Each end is screwed in its own terminal block, and a link bar
 * across the two, on two studs, closes the path: take the bar off and the earth can be measured alone.
 * `fixed`: what stays on the wall; `link`: the bar, its washers and its nuts.
 */
function testJoint() {
  const bar = []; // a flat bar with two round ends
  for (const end of [1, -1]) for (let i = 0; i <= 14; i++) bar.push([1.4 * end * Math.cos((i / 14) * Math.PI), end * (4.6 + 1.4 * Math.sin((i / 14) * Math.PI))]);
  const fixed = { cast: [slab(8.6, 15, 1.5, 0.8).translate(0, 0, -WALL_OFF)], fine: [], "steel:hw": [], "cast:hw": [] };
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) fixed["steel:hw"].push(aimed(bolt(0.45, 0.36), V(sx * 3.1, sy * 6.3, -WALL_OFF + 0.8), OUT));
  const link = { hero: [plate(bar, 0.7, { bevel: 0.14 }).translate(0, 0, 1.75)], "steel:hw": [] };
  for (const s of [-1, 1]) {
    fixed.cast.push(lying(1.15, 3.5, 0.15, 28).translate(0, s * 4.5, -3.5));
    fixed.fine.push(box(5, 5, 3.4, 0.32).translate(0, s * 4.5, -0.1));
    fixed.fine.push(cyl(0.95, 0.9, 0.12, 24).translate(0, s * 7.4, 0)); // the boss the wire enters by
    fixed["cast:hw"].push(aimed(bolt(0.55, 0.5), V(-2.5, s * 4.5, -0.1), V(-1, 0, 0))); // the screw that bites the wire
    fixed["cast:hw"].push(lying(0.42, 2.9, 0.06, 16).translate(0, s * 4.5, 3)); // the stud
    link["steel:hw"].push(aimed(mergeGeometries([cyl(1.25, 0.18, 0.04, 24).translate(0, 0.09, 0), cyl(1, 0.85, 0.1, 6).translate(0, 0.6, 0)]), V(0, s * 4.5, 2.45), OUT));
  }
  return { fixed, link };
}

/** The stirrup that holds the wire against the stake: a U-bolt round the stake, a plate over the wire, two nuts. In the stake's frame, around y = 0; `side`: which way the wire is (±z). */
function stirrup(side = 1) {
  const R = STAKE_R + 0.37;
  const z = V(0, 0, side);
  const u = new THREE.TorusGeometry(R, 0.32, 10, 24, Math.PI).rotateX((-side * Math.PI) / 2).toNonIndexed();
  return {
    fine: [box(5.8, 3, 0.9, 0.22).translate(0, 0, side * (STAKE_OFF + WIRE_R + 0.5))],
    "steel:hw": [
      u,
      ...[-1, 1].flatMap((s) => [
        lying(0.32, 3.7, 0.05, 12).translate(s * R, 0, side * 1.85),
        aimed(mergeGeometries([cyl(0.85, 0.14, 0.03, 20).translate(0, 0.07, 0), cyl(0.62, 0.6, 0.07, 6).translate(0, 0.44, 0)]), V(s * R, 0, side * (STAKE_OFF + WIRE_R + 0.95)), z),
      ]),
    ],
  };
}

/* ─────────────────────────────────────────────────────────── the top of the mast: the same on the house and on the bench
   Drawn from the tip of the rod (the origin), y going down. */
function addHead(part, frame, m, { kit = false } = {}) {
  const b = bins(part, frame, m);
  // the rod: a shoulder, a groove, a long taper, a round end
  const arc = [15, 30, 45, 60, 75].map((a) => [TIP_R * Math.cos(a * DEG), -TIP_R + TIP_R * Math.sin(a * DEG)]);
  const rod = lathe([[0, -43.2], [2.4, -43.2], [2.4, -41.2], [1.9, -41.2], [1.9, -40.4], [2.1, -40.4], [TIP_R, -TIP_R], ...arc, [0, 0]], 72, { bevel: 0.14, round: 2 });
  b.put("hero", rod, cyl(2.75, 2.8, 0.2, 6).translate(0, -44.6, 0)); // its wrench flats
  b.put("steel", cyl(3.9, 2.4, 0.22, 6).rotateY(30 * DEG).translate(0, -47.2, 0)); // the lock nut
  // the sleeve: it caps the mast, and carries the conductor's terminal
  b.put("fine", lathe([[MAST_R + 0.02, -62], [3.95, -62], [3.95, -58.6], [3.62, -58.6], [3.62, -57.8], [3.95, -57.8], [3.95, -52.2], [4.45, -52.2], [4.45, -49.8], [3.6, -48.4], [0, -48.4]], 64, { bevel: 0.14, round: 2 }));
  for (const s of [-1, 1]) b.put("cast:hw", aimed(bolt(0.55, 0.45), V(s * 3.95, -60.3, 0), V(s, 0, 0))); // its two set screws
  b.put("fine", box(4.2, 5.4, 1.4, 0.25).translate(0, -55, 4.45)); // the terminal: a lug on the sleeve…
  b.put("steel", box(4.2, 5.4, 0.7, 0.2).translate(0, -55, 6.2)); // …a plate over the wire…
  for (const s of [-1, 1]) b.put("cast:hw", aimed(bolt(0.6, 0.5), V(s * 1.4, -55, 6.55), OUT)); // …two bolts
  if (kit) {
    b.put("steel", snapped(MAST_R, -HEAD, -50, { bottom: 0.9, teeth: 5, bore: MAST_R - 0.45 }));
    const run = bent([...WIRE_TOP.map((p) => V(...p)), V(0, -68.9, WIRE_Z)], 1, 6);
    into(frame, addMesh(part, tube(run, WIRE_R, { caps: true }), m.wire, { edges: false }));
    into(frame, addMesh(part, snapped(WIRE_R, -69.9, -68.8, { bottom: 0.3, teeth: 2 }).translate(0, 0, WIRE_Z), m.wire, { edgeOpacity: 0.4 }));
  }
  b.flush();
}

/* ─────────────────────────────────────────────────────────── light that has a place */

/**
 * The sheath of light round the conductor, from the tip of the rod to the foot of the stake. Its vertices
 * lie ON the path (see tube): the shader pushes them out by their radius, or by `uMinPx` pixels if that is
 * more — from the lawn, 8 mm of wire is a hair, and a line of light must never get thinner than a line.
 *   uCharge   dashes climbing the wire, the rod steadily lit — only as far up as the charge has climbed
 *             (uRise: the s of its front, cm; uRiseOn: the front itself, a head of light while it is on its way)
 *   uDash     1: dashes · 0: a plain line (while the camera runs along the wire: dashes crossed fast twist like barley sugar)
 *   uHead     where the stroke's current has got (s, cm) · uFlowOn: how bright — behind the head the
 *             conductor stays lit and dashes run DOWN it
 *   uStake    the stake alone, glowing (the current leaving it for the ground)
 */
const DASH = { period: 38, up: 26, down: 150 }; // cm, cm/s. Running down, a dash moves 5 cm a frame: under a seventh of its period, it runs, it does not strobe
const sheathMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: VEILLE.clone() }, uTime: { value: 0 }, uCharge: { value: 0 }, uHead: { value: 0 }, uFlowOn: { value: 0 },
      uStake: { value: 0 }, uStakeS: { value: 1e9 }, uLen: { value: 1 }, uMinPx: { value: 3 }, uDash: { value: 1 }, uRise: { value: 0 }, uRiseOn: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aS; attribute float aRad; uniform float uMinPx;
      varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 c = modelViewMatrix * vec4(position, 1.0);
        float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
        vec4 mv = modelViewMatrix * vec4(position + normal * max(aRad, uMinPx * cmPerPx), 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vS = aS;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uCharge, uHead, uFlowOn, uStake, uStakeS, uLen, uDash, uRise, uRiseOn;
      varying float vS; varying vec3 vN; varying vec3 vV;
      // bars of light, their ends softened over what a pixel covers — and melted into their mean once too small to count
      float bars(float x, float duty) {
        float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
        float q = fract(x);
        float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
        return mix(b, duty, smoothstep(0.12, 0.4, w));
      }
      void main() {
        float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.3);
        float wire = smoothstep(44.0, 66.0, vS); // the rod itself is lit evenly: dashes are for the wire
        float climbed = smoothstep(uRise - 5.0, uRise + 5.0, vS); // the charge comes from the earth: lit from the foot of the stake up to its front
        float up = pow(max(uCharge, 0.0), 0.55) * climbed * mix(0.05 + 1.1 * exp(-vS / 11.0), 0.24 + 1.3 * mix(0.56, bars((vS + uTime * ${DASH.up.toFixed(1)}) / ${DASH.period.toFixed(1)}, 0.56), uDash), wire) * mix(1.25, 0.8, clamp(vS / uLen, 0.0, 1.0));
        float rg = vS - uRise;
        up += uCharge * uRiseOn * 1.6 * exp(-rg * rg / 300.0);
        float behind = 1.0 - smoothstep(uHead - 4.0, uHead + 4.0, vS);
        float down = uFlowOn * behind * mix(0.9, 0.42 + 0.8 * mix(0.56, bars((vS - uTime * ${DASH.down.toFixed(1)}) / ${DASH.period.toFixed(1)}, 0.56), uDash), wire);
        float gap = vS - uHead;
        float head = uFlowOn * (1.7 * exp(-gap * gap / 260.0) + 0.6 * step(gap, 0.0) * exp(min(gap, 0.0) / 70.0));
        float stake = uStake * step(uStakeS, vS);
        gl_FragColor = vec4(uColor * min(up + down + head + stake, 3.2) * body, 1.0);
      }`,
  });

/**
 * A light seen from anywhere: a bright core and a long tail, on a unit sphere the shader sizes — `uRadius`
 * cm, or `uMinPx` pixels if that is more (a 30 cm glow seen from the lawn would be a dot).
 */
const haloMaterial = (core = 0.8) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uRadius: { value: 1 }, uMinPx: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uRadius, uMinPx; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        vec4 mv = modelViewMatrix * vec4(position * r, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main() {
        float n = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        gl_FragColor = vec4(uColor * (${core.toFixed(2)} * pow(n, 14.0) + ${(1 - core).toFixed(2)} * pow(n, 4.0)), 1.0);
      }`,
  });

/**
 * The field. What a pointed, earthed thing does to the field under a cloud is what a drain does to a slow
 * river: far above, the lines come straight down, evenly spaced; near the top of the rod they all turn in
 * and land on it. The lines drawn are those of exactly that — a uniform flow plus a sink at the tip:
 *   ρ² = ρ0² − 2b² (1 − cos θ)        (ρ: distance to the axis, θ: angle from straight up, seen from the tip)
 * `uB` (cm) is the strength of the sink: at 0 the lines fall straight past the rod; as it grows they lean,
 * and one after the other they are caught. Twelve lines of equal flux: evenly spread over a disc far above.
 * Each is a ribbon a few pixels wide, worked out in the vertex shader — nothing is rebuilt as the field grows.
 */
const FIELD = { sink: 115, reach: 167, top: 1000, lines: 12, steps: 56 };
const fieldMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: VEILLE.clone() }, uB: { value: 0 }, uAmount: { value: 0 }, uTime: { value: 0 }, uTop: { value: FIELD.top }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) } },
    vertexShader: /* glsl */ `
      attribute vec3 aLine; attribute float aSide;
      uniform float uB, uTop; uniform vec2 uView;
      varying float vSide; varying float vR; varying float vY;
      vec3 curve(float rho0, float phi, float t) {
        float b = max(uB, 0.01);
        float least = atan(rho0, uTop);
        float last = min(acos(clamp(1.0 - rho0 * rho0 / (2.0 * b * b), -1.0, 1.0)), 3.14159265 - least);
        float th = mix(least, last, clamp(t, 0.0, 1.0));
        float rho = sqrt(max(rho0 * rho0 - 2.0 * b * b * (1.0 - cos(th)), 0.0));
        return vec3(rho * cos(phi), rho * cos(th) / max(sin(th), 1e-4), rho * sin(phi));
      }
      void main() {
        float t = aLine.z;
        float dt = t < 0.99 ? 0.01 : -0.01;
        vec3 p = curve(aLine.x, aLine.y, t);
        vec4 c0 = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        vec4 c1 = projectionMatrix * modelViewMatrix * vec4(curve(aLine.x, aLine.y, t + dt), 1.0);
        vec2 d = (c1.xy / max(c1.w, 1e-3) - c0.xy / max(c0.w, 1e-3)) * uView * sign(dt);
        d /= max(length(d), 1e-5);
        // 3.6 px wide with soft borders (what the eye gets: a line a little over 2 px), 0.6 cm from close
        float halfPx = max(2.3, 0.34 * projectionMatrix[1][1] * ${H2} / max(1.0, c0.w));
        c0.xy += vec2(-d.y, d.x) * aSide * halfPx * 2.0 / uView * c0.w;
        vSide = aSide;
        vR = length(p);
        vY = p.y;
        gl_Position = c0;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uTime, uTop;
      varying float vSide; varying float vR; varying float vY;
      void main() {
        float across = 1.0 - smoothstep(0.3, 1.0, abs(vSide));
        float sky = 1.0 - smoothstep(0.3 * uTop, 0.96 * uTop, vY); // they come out of the sky: no line begins
        float below = smoothstep(-70.0, -6.0, vY); // a line the rod has not caught yet goes by, and fades
        float near = exp(-vR / 95.0); // tighter, brighter: all of it lands there
        float swell = 0.84 + 0.16 * sin(6.2832 * (vR / 260.0 + uTime * 0.2)); // a slow swell sliding down to the tip
        gl_FragColor = vec4(uColor * across * sky * below * (0.4 + 1.5 * near) * swell * uAmount, 1.0);
      }`,
  });
function fieldLines() {
  const { lines, steps, reach } = FIELD;
  const line = [];
  const side = [];
  const index = [];
  for (let i = 0; i < lines; i++) {
    const rho = reach * Math.sqrt((i + 0.5) / lines);
    const phi = i * 2.39996 + 0.6; // the golden angle: from any side, no two lines fall on each other
    for (let k = 0; k <= steps; k++) {
      line.push(rho, phi, k / steps, rho, phi, k / steps);
      side.push(-1, 1);
    }
    for (let k = 0; k < steps; k++) {
      const a = (i * (steps + 1) + k) * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(side.length * 3), 3));
  geo.setAttribute("aLine", new THREE.Float32BufferAttribute(line, 3));
  geo.setAttribute("aSide", new THREE.Float32BufferAttribute(side, 1));
  geo.setIndex(index);
  const mesh = new THREE.Mesh(geo, fieldMaterial());
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return mesh;
}

/**
 * The current spreading in the ground: on a level disc round the stake, two rings that widen and die out,
 * each with a faint wake behind it. Several discs, at several depths: seen from the lawn, a bowl of ripples.
 * `uRing`: radius and brightness of the one, radius and brightness of the other.
 */
const ringMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: VEILLE.clone() }, uRing: { value: new THREE.Vector4(0, 0, 0, 0) } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vP = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform vec4 uRing; varying vec2 vP;
      float ring(float rho, float r, float k) {
        float w = max(1.6 + 0.008 * r, 1.3 * fwidth(rho)); // never thinner than a line
        float d = (rho - r) / w;
        float inside = clamp(rho / max(r, 1.0), 0.0, 1.0);
        return k * (exp(-d * d) + 0.07 * step(rho, r) * inside * inside);
      }
      void main() {
        float rho = length(vP);
        float a = ring(rho, uRing.x, uRing.y) + ring(rho, uRing.z, uRing.w);
        if (a < 0.002) discard;
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
  });
const RINGS = { depths: [-12, -80, -150, -220, -285], reach: 400 };

/* ─────────────────────────────────────────────────────────── A · on the house */

const [X0, RIDGE] = ROD.foot;
const TIP = V(...ROD.tip);
const RISE = Math.atan2(HOUSE.ridge - HOUSE.eave, HOUSE.z1);
const DOWNHILL = V(0, -Math.sin(RISE), Math.cos(RISE));
const ROOF_OUT = V(0, Math.cos(RISE), Math.sin(RISE));
/** A point `t` cm down the front slope from the ridge, `h` cm above the tiles. */
const onRoof = (t, h = 2.5) => V(X0, RIDGE, 0).addScaledVector(DOWNHILL, t).addScaledVector(ROOF_OUT, h);
const WALL = ROD.joint[2];
const JOINT = ROD.joint[1];
const STAKE = { z: ROD.run[5][2], top: ROD.run[4][1], foot: ROD.run[5][1] };
const STAKE_GRIP = 8; // the stirrup, this far under the head of the stake

/**
 * → { root, A, update(p, time) }, p = { amount, charge, field, flow, flowOn, earth } (see world.js):
 *   amount   0: no rod on this house — nothing of all this
 *   charge   0–1: the earth's charge drawn up — dashes climb the conductor (slowly), the rod is lit, and a glow sits on its top and grows
 *   field    0–1: the field lines lean in, and are caught by the top of the rod one after the other
 *   flow     0 the tip → 1 the foot of the stake: the head of the stroke's current, by length of conductor
 *   flowOn   0–1.5: how bright it is; behind the head the conductor stays lit, dashes running down
 *   earth    0 → 1: rings widen in the ground round the stake, at several depths, and die out; the stake glows (it stays lit at 1: put it back to 0 on a cut)
 */
export function buildRod() {
  const root = new THREE.Group();
  const fx = {};

  /* ── the way down, point by point ── */
  const edgeZ = ROD.run[1][2] + 4.5; // just past the edge of the roof
  const edge = onRoof((edgeZ - 2.5 * Math.sin(RISE)) / Math.cos(RISE));
  const tipAt = (p) => V(X0 + p[0], TIP.y + p[1], p[2]);
  const upper = bent(
    [...WIRE_TOP.map(tipAt), V(X0, RIDGE + 26, WIRE_Z), onRoof(34), edge, V(X0, edge.y - 10.5, edgeZ), V(X0, ROD.run[2][1], WALL), V(X0, JOINT + 2.6, WALL)],
    [0, 1, 1, 6, 8, 3.5, 3.5, 6, 0],
  );
  const lower = bent([V(X0, JOINT - 2.6, WALL), V(X0, -8, WALL), V(X0, STAKE.top + 6, STAKE.z - STAKE_OFF), V(X0, STAKE.top - STAKE_GRIP - 3.5, STAKE.z - STAKE_OFF)], [0, 7, 7, 0]);
  // the ruler: s, cm of conductor from the tip of the rod
  const path = [];
  const ruler = [];
  const mark = (p) => {
    ruler.push(path.length ? ruler[ruler.length - 1] + p.distanceTo(path[path.length - 1]) : 0);
    path.push(p);
  };
  mark(TIP.clone());
  mark(tipAt([0, WIRE_TOP[0][1], 0]));
  upper.forEach(mark);
  lower.forEach(mark);
  mark(V(X0, STAKE.top - STAKE_GRIP - 3.5, STAKE.z));
  const stakeS = ruler[ruler.length - 1];
  mark(V(X0, STAKE.foot, STAKE.z));
  const LEN = ruler[ruler.length - 1];

  /* ── the solids: four parts, so the whole thing can fade ── */
  const head = makePart("head");
  const mast = makePart("mast");
  const run = makePart("run");
  const stake = makePart("stake");
  const solids = [head, mast, run, stake];
  root.add(...solids);

  const headFrame = new THREE.Group();
  headFrame.position.copy(TIP);
  head.add(headFrame);
  addHead(head, headFrame, metals());

  {
    // the mast, its splice, the base bolted on the ridge and its two braces along it
    const m = metals();
    const b = bins(mast, mast, m);
    const at = (x, y, z = 0) => V(X0 + x, RIDGE + y, z);
    const top = TIP.y - 50 - RIDGE;
    b.put("steel", cyl(MAST_R, top - 2.2, 0.2, 48).translate(X0, RIDGE + (top + 2.2) / 2, 0));
    // two lengths of tube, sleeved and bolted through
    b.put("fine", lathe([[MAST_R + 0.02, -8], [3.75, -8], [3.75, -7], [3.55, -6.8], [3.55, 6.8], [3.75, 7], [3.75, 8], [MAST_R + 0.02, 8]], 48, { bevel: 0.1, round: 2 }).translate(X0, RIDGE + 190, 0));
    for (const y of [185.5, 194.5]) b.put("cast:hw", aimed(bolt(0.7, 0.55), at(-3.55, y), V(-1, 0, 0)), aimed(bolt(0.7, 0.55), at(3.55, y), V(1, 0, 0)));
    for (const y of [-84, -150, -264, -338]) b.set(mastClip(), V(X0, TIP.y + y, WIRE_Z));
    // the saddle: a wing on each slope, three bolts each, a cap over the ridge
    for (const s of [-1, 1]) {
      const down = V(0, DOWNHILL.y, s * DOWNHILL.z);
      const out = V(0, ROOF_OUT.y, s * ROOF_OUT.z);
      const wing = new THREE.Matrix4().makeBasis(V(1, 0, 0), out, new THREE.Vector3().crossVectors(V(1, 0, 0), out));
      b.put("cast", box(30, 1, 26, 0.3).applyMatrix4(wing.clone().setPosition(at(0, 0).addScaledVector(down, 13.6).addScaledVector(out, 0.5))));
      for (const x of [-11, 0, 11]) b.put("steel:hw", aimed(bolt(0.95, 0.7), at(x, 0).addScaledVector(down, 19.5).addScaledVector(out, 1), out));
    }
    b.put("cast", box(30, 2.6, 8.4, 0.5).translate(X0, RIDGE + 0.7, 0));
    // the socket the mast stands in: a flange, two gussets, a pinch bolt
    b.put("cast", cyl(6, 1.3, 0.25, 40).translate(X0, RIDGE + 2.6, 0));
    b.put("cast", lathe([[MAST_R + 0.03, 2], [4.2, 2], [4.2, 15], [3.75, 15.8], [MAST_R + 0.03, 15.8]], 48, { bevel: 0.14, round: 2 }).translate(X0, RIDGE, 0));
    const gusset = plate([[4.1, 3.2], [13.6, 3.2], [13.6, 4.3], [4.1, 13.2]], 0.8, { bevel: 0.12 }).translate(0, 0, -0.4);
    b.put("cast", gusset.clone().translate(X0, RIDGE, 0), gusset.clone().rotateY(Math.PI).translate(X0, RIDGE, 0));
    b.put("steel:hw", aimed(bolt(0.75, 0.6), at(0, 9.5, -4.2), V(0, 0, -1)));
    // the braces: from a band on the mast down to two small saddles on the ridge
    const band = 84;
    b.put("cast", lathe([[MAST_R + 0.02, -1.8], [3.75, -1.8], [3.75, 1.8], [MAST_R + 0.02, 1.8]], 48, { bevel: 0.14, round: 2 }).translate(X0, RIDGE + band, 0));
    fx.braces = [];
    for (const s of [-1, 1]) {
      const from = at(s * 5.2, band);
      const to = at(s * 58, 4.6);
      const dir = to.clone().sub(from);
      const len = dir.length();
      dir.normalize();
      b.put("cast", box(3.2, 3.2, 1.4, 0.3).translate(X0 + s * 4.6, RIDGE + band, 0)); // the ear on the band
      b.put("steel", aimed(cyl(1, len - 5, 0.18, 24).translate(0, len / 2, 0), from, dir));
      for (const end of [from, to]) {
        b.put("cast", aimed(box(2.6, 5, 1.3, 0.3), end.clone().addScaledVector(dir, end === from ? 1.6 : -1.6), dir)); // the flattened, drilled end
        b.put("steel:hw", aimed(bolt(0.6, 0.45), end.clone().add(V(0, 0, 0.65)), OUT), aimed(bolt(0.6, 0.45), end.clone().add(V(0, 0, -0.65)), V(0, 0, -1)));
      }
      // its foot: a small saddle astride the ridge
      b.put("cast", box(12, 2.4, 8, 0.45).translate(X0 + s * 58, RIDGE + 0.7, 0), box(1.3, 4.6, 3.4, 0.3).translate(X0 + s * 58, RIDGE + 3.6, -1.4));
      for (const z of [-1, 1]) {
        const down = V(0, DOWNHILL.y, z * DOWNHILL.z);
        const out = V(0, ROOF_OUT.y, z * ROOF_OUT.z);
        const wing = new THREE.Matrix4().makeBasis(V(1, 0, 0), out, new THREE.Vector3().crossVectors(V(1, 0, 0), out));
        b.put("cast", box(12, 0.9, 13, 0.3).applyMatrix4(wing.clone().setPosition(at(s * 58, 0).addScaledVector(down, 7).addScaledVector(out, 0.45))));
        b.put("steel:hw", aimed(bolt(0.8, 0.6), at(s * 58, 0).addScaledVector(down, 9.6).addScaledVector(out, 0.9), out));
      }
      fx.braces.push([from, to]);
    }
    b.flush();
  }

  {
    // the conductor: two lengths of wire (it is cut at the test joint), its clips on the roof and on the wall
    const m = metals();
    for (const pts of [upper, lower]) addMesh(run, tube(pts, WIRE_R, { caps: true }), m.wire, { edges: false });
    const b = bins(run, run, m);
    for (const t of [80, 170, 260, 350, 440]) b.set(roofClip(), onRoof(t), DOWNHILL, ROOF_OUT);
    for (const y of [440, 352, 266, 114, 38]) b.set(wallClip(), V(X0, y, WALL));
    const joint = testJoint();
    b.set(joint.fixed, V(X0, JOINT, WALL)).set(joint.link, V(X0, JOINT, WALL));
    b.flush();
  }

  {
    // the stake: a chamfered head, a groove, 2.5 m of bar, a point — and the stirrup that holds the wire on it
    const m = metals();
    const b = bins(stake, stake, m);
    const len = STAKE.top - STAKE.foot;
    b.put("steel", lathe([[0, -len], [STAKE_R, -len + 11], [STAKE_R, -3], [STAKE_R - 0.12, -3], [STAKE_R - 0.12, -2.5], [STAKE_R, -2.5], [STAKE_R, 0], [0, 0]], 40, { bevel: 0.16, round: 2 }).translate(X0, STAKE.top, STAKE.z));
    b.set(stirrup(-1), V(X0, STAKE.top - STAKE_GRIP, STAKE.z));
    b.flush();
  }

  /* ── from far away: everything here is a line. Each thin thing carries one, in pixels, hidden inside it from close ── */
  const xyz = (p) => [p.x, p.y, p.z];
  const far = [
    fatLine([[X0, TIP.y - 44, 0], [X0, TIP.y - 0.8, 0]], { color: 0xd4d8db, width: 3 }),
    fatLine([[X0, RIDGE + 2, 0], [X0, TIP.y - 44, 0]], { color: 0x8f979f, width: 3 }),
    fatLine([...upper, ...lower].map(xyz), { color: 0x959ca3, width: 3 }),
    fatLine([[X0, STAKE.top - 0.5, STAKE.z], [X0, STAKE.foot + 1, STAKE.z]], { color: 0x7d858d, width: 2.8 }),
    ...fx.braces.map(([a, b]) => fatLine([xyz(a), xyz(b)], { color: 0x6b737b, width: 2 })),
  ];
  root.add(...far);

  /* ── the light ── */
  const headSheath = [[0.5, 0.3], [-0.3, 1.25], [-1.4, 1.8], [-20, 2.25], [-40.4, 2.8], [-43.2, 3.1], [-43.9, 0.4]]; // the rod alone: the sleeve stays metal
  const stakeSheath = [[0.5, 0.3], [0, STAKE_R + 0.4], [STAKE.foot - STAKE.top + 11, STAKE_R + 0.4], [STAKE.foot - STAKE.top, 0.5], [STAKE.foot - STAKE.top - 1, 0.2]];
  const wirePts = [...upper, ...lower];
  const sheath = new THREE.Mesh(
    mergeGeometries([
      tube(headSheath.map(([y]) => V(X0, TIP.y + y, 0)), headSheath.map(([, r]) => r), { radial: 16, sheath: headSheath.map(([y]) => Math.max(0, -y)) }),
      tube(wirePts, WIRE_R + 0.38, { radial: 10, sheath: ruler.slice(2, 2 + wirePts.length) }),
      tube(stakeSheath.map(([y]) => V(X0, STAKE.top + y, STAKE.z)), stakeSheath.map(([, r]) => r), { radial: 12, sheath: stakeSheath.map(([y]) => stakeS + Math.max(0, -STAKE_GRIP - 3.5 - y)) }),
    ]),
    sheathMaterial(),
  );
  sheath.frustumCulled = false;
  sheath.renderOrder = 4;
  const SU = sheath.material.uniforms;
  SU.uLen.value = LEN;
  SU.uStakeS.value = stakeS - 0.5;

  const ball = new THREE.SphereGeometry(1, 40, 28);
  const glowTip = new THREE.Mesh(ball, haloMaterial(0.8)); // on the top of the rod: where the charge gathers
  glowTip.position.copy(TIP);
  const glowHead = new THREE.Mesh(ball, haloMaterial(0.72)); // the head of the stroke's current, on its way down
  const glowSoil = new THREE.Mesh(ball, haloMaterial(0.25)); // the ground round the stake, taking it
  glowSoil.position.set(X0, (STAKE.top + STAKE.foot) / 2, STAKE.z);
  glowSoil.scale.set(20, 150, 20);
  const field = fieldLines();
  field.position.copy(TIP);
  const disc = new THREE.CircleGeometry(RINGS.reach + 40, 96);
  const rings = RINGS.depths.map((y) => {
    const mesh = new THREE.Mesh(disc, ringMaterial());
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(X0, y, STAKE.z);
    return mesh;
  });
  for (const mesh of [glowTip, glowHead, glowSoil, ...rings]) {
    mesh.frustumCulled = false;
    mesh.renderOrder = 5;
  }
  root.add(sheath, glowTip, glowHead, glowSoil, field, ...rings);

  const A = {
    tip: anchor(root, ...ROD.tip),
    foot: anchor(root, ...ROD.foot),
    joint: anchor(root, X0, JOINT, WALL + 3),
    stakeHead: anchor(root, X0, STAKE.top, STAKE.z),
    stakeFoot: anchor(root, X0, STAKE.foot, STAKE.z),
    mid: anchor(root, X0, 330, WALL), // a point of the conductor on the front wall
    sleeve: anchor(root, X0, TIP.y - 55, CLAMP_Z), // where the conductor is taken on the rod
  };

  /** Where the conductor is, `s` cm from the tip. */
  const along = (s, out) => {
    for (let i = 1; i < ruler.length; i++) {
      if (s <= ruler[i]) return out.lerpVectors(path[i - 1], path[i], clamp01((s - ruler[i - 1]) / Math.max(1e-6, ruler[i] - ruler[i - 1])));
    }
    return out.copy(path[path.length - 1]);
  };

  let shown = -1;
  return {
    root, A, length: LEN,
    update({ amount = 1, charge = 0, climb = 1, dash = 1, field: lines = 0, flow = 0, flowOn = 0, earth = 0 } = {}, time = 0) {
      root.visible = amount > 0.004;
      if (!root.visible) return;
      if (amount !== shown) {
        shown = amount;
        for (const part of solids) setPartOpacity(part, amount);
        for (const line of far) line.material.opacity = line.material.userData.base * amount;
      }
      const breath = 1 + 0.05 * Math.sin(time * 1.3);
      const taken = smooth(ramp(earth, 0, 0.3)); // the stake glows as soon as the current reaches the ground, and stays lit

      SU.uTime.value = time;
      SU.uCharge.value = charge * amount;
      const rising = Math.min(1, 14 * climb * (1 - climb)); // the front shows only while the charge is on its way up
      SU.uRise.value = (1 - clamp01(climb)) * LEN;
      SU.uRiseOn.value = rising;
      SU.uDash.value = clamp01(dash);
      SU.uHead.value = clamp01(flow) * LEN;
      SU.uFlowOn.value = flowOn * amount;
      SU.uStake.value = 1.15 * taken * amount;

      const lit = (0.35 * Math.min(1, charge * 4) + 1.35 * charge + 0.45 * lines) * breath * amount * smooth(ramp(climb, 0.9, 1));
      glowTip.visible = lit > 0.01;
      glowTip.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(Math.min(lit, 2.3));
      glowTip.material.uniforms.uRadius.value = 5 + 16 * charge + 4 * lines;
      glowTip.material.uniforms.uMinPx.value = 10 + 11 * charge + 3 * lines;

      // one head of light: the stroke's current on its way down, or — before it — the charge on its way up
      const down = flowOn * amount;
      const up = down > 0.01 ? 0 : rising * charge * amount;
      glowHead.visible = down > 0.01 || up > 0.01;
      if (glowHead.visible) {
        along(down > 0.01 ? clamp01(flow) * LEN : (1 - clamp01(climb)) * LEN, glowHead.position);
        glowHead.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(Math.min(2.8, down > 0.01 ? 1.9 * down : 1.5 * up));
        glowHead.material.uniforms.uRadius.value = 17;
        glowHead.material.uniforms.uMinPx.value = 15;
      }

      glowSoil.visible = taken * amount > 0.01;
      glowSoil.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(0.42 * taken * breath * amount);

      const FU = field.material.uniforms;
      field.visible = lines * amount > 0.004;
      FU.uB.value = FIELD.sink * clamp01(lines);
      FU.uAmount.value = smooth(ramp(lines, 0, 0.22)) * (0.75 + 0.25 * lines) * amount;
      FU.uTime.value = time;

      // on each level two rings leave the stake one after the other — the deeper, the later and the smaller — widen, and die out: all gone at 1
      for (let i = 0; i < rings.length; i++) {
        const ring = rings[i].material.uniforms.uRing.value;
        let any = 0;
        for (let j = 0; j < 2; j++) {
          const u = clamp01(earth * 1.75 - 0.09 * i - 0.36 * j);
          const k = 1.5 * smooth(ramp(u, 0, 0.12)) * Math.pow(1 - u, 1.3) * amount;
          ring.setComponent(j * 2, 12 + (RINGS.reach - 50 * i) * (1 - (1 - u) * (1 - u)));
          ring.setComponent(j * 2 + 1, k);
          any = Math.max(any, k);
        }
        rings[i].visible = any > 0.004;
      }
    },
  };
}

/* ─────────────────────────────────────────────────────────── B · on the bench
   The system does not hold on a bench (13 m of wire): this is an INTERRUPTED VIEW, as on a drawing. Three parts,
   each snapped off where the drawing skips a length. Assembled, they stand one above the other on the same wire;
   opened, they come down side by side, in the order the current takes them — rod, wire, stake:
     rod    the last 70 cm of the mast — the very geometry that stands on the house
     wire   a length of conductor, two wall clips, the test joint
     stake  the head of the stake and its stirrup; a break; its point
   …and a stand: a turned base the point rests on, a post and a jaw that hold the stake up. */
const LAY = (() => {
  const tip = KIT.tip[1];
  const gap = 1.8;
  const rodEnd = tip - HEAD;
  const wireTop = rodEnd - gap;
  const wireEnd = wireTop - 34;
  const stubTop = wireEnd - gap; // the wire that comes out of the stirrup
  const stakeTop = stubTop - 2.8;
  const headEnd = stakeTop - 15;
  const pointTop = headEnd - gap;
  return { tip, wireTop, wireEnd, joint: (wireTop + wireEnd) / 2, stubTop, stakeTop, grip: stakeTop - 7.5, headEnd, pointTop, floor: 4.2, z: WIRE_Z - STAKE_OFF };
})();

/**
 * → { root, parts, A, pose(p, time) }, p = { explode, litRod, litWire, litStake }:
 *   explode  0 assembled, one above the other → 1 a row: the rod swings out and comes down, the wire after it; the stake stays on its stand.
 *            The link bar of the test joint comes off its studs on the way: that is where the path can be opened
 *   lit…     0–1: the part the voice is naming glows faintly veille
 */
export function buildKit() {
  const root = new THREE.Group();
  const fx = {};

  /* ── rod ── */
  const rod = makePart("rod");
  const rodFrame = new THREE.Group();
  rodFrame.position.set(...KIT.tip);
  rod.add(rodFrame);
  addHead(rod, rodFrame, metals(), { kit: true });

  /* ── wire ── */
  const wire = makePart("wire");
  {
    const m = metals();
    const b = bins(wire, wire, m);
    const at = V(0, LAY.joint, WIRE_Z);
    b.put("wire", snapped(WIRE_R, LAY.joint + 2.6, LAY.wireTop, { top: 0.3, teeth: 2 }).translate(0, 0, WIRE_Z), snapped(WIRE_R, LAY.wireEnd, LAY.joint - 2.6, { bottom: 0.3, teeth: 2 }).translate(0, 0, WIRE_Z));
    for (const s of [-1, 1]) b.set(wallClip(), V(0, LAY.joint + s * 12, WIRE_Z));
    const joint = testJoint();
    b.set(joint.fixed, at);
    b.flush();
    // the link bar: its own group — it comes off as the kit opens
    fx.link = new THREE.Group();
    wire.add(fx.link);
    const l = bins(wire, fx.link, m);
    l.set(joint.link, at);
    l.flush();
  }

  /* ── stake ── */
  const stake = makePart("stake");
  {
    const m = metals();
    const b = bins(stake, stake, m);
    const top = lathe([[STAKE_R, -4.2], [STAKE_R, -3], [STAKE_R - 0.12, -3], [STAKE_R - 0.12, -2.5], [STAKE_R, -2.5], [STAKE_R, 0], [0, 0]], 40, { bevel: 0.16, round: 2 });
    b.put("steel", top.translate(0, LAY.stakeTop, LAY.z), snapped(STAKE_R, LAY.headEnd, LAY.stakeTop - 4.2, { bottom: 0.5, teeth: 3 }).translate(0, 0, LAY.z));
    b.put("steel", lathe([[0, LAY.floor], [STAKE_R, LAY.floor + 8], [STAKE_R, LAY.pointTop - 1.2]], 40, { bevel: 0.1 }).translate(0, 0, LAY.z), snapped(STAKE_R, LAY.pointTop - 1.2, LAY.pointTop, { top: 0.5, teeth: 3 }).translate(0, 0, LAY.z));
    b.set(stirrup(1), V(0, LAY.grip, LAY.z));
    b.put("wire", snapped(WIRE_R, LAY.grip - 3.5, LAY.stubTop, { top: 0.3, teeth: 2 }).translate(0, 0, WIRE_Z));
    b.flush();
  }

  /* ── the stand ── */
  const stand = makePart("stand");
  {
    const m = { ...metals(), cast: solid(0x2c3238, { rough: 0.95, metal: 0, env: 0.35 }), ring: solid(0x3d444b, { rough: 0.9, metal: 0, env: 0.35 }) };
    const b = bins(stand, stand, m);
    const jaw = LAY.floor + 10.3; // where it holds the stake: on the bar, just above the point
    const post = -7.4; // behind the stake
    b.put("cast", lathe([[0, 0], [19, 0], [19, 1.1], [18.1, 2.6], [13.6, 2.6], [13.6, 2.15], [12.4, 2.15], [12.4, 2.6], [6.6, 2.6], [6.6, LAY.floor], [0, LAY.floor]], 96, { bevel: 0.22, round: 2 }).translate(0, 0, LAY.z));
    b.put("ring", lathe([[12.5, 2.1], [13.5, 2.1], [13.5, 2.5], [12.5, 2.5]], 96, { bevel: 0.08 }).translate(0, 0, LAY.z)); // a turned ring let into the base: a tone above it, no more — lying flat, a clear ring outshines the parts
    b.put("fine", lathe([[0, LAY.floor], [2.3, LAY.floor], [2.3, LAY.floor + 0.45], [0.5, LAY.floor + 0.45], [0, LAY.floor + 0.1]], 40, { bevel: 0.1 }).translate(0, 0, LAY.z)); // the cup the point rests in
    b.put("steel", cyl(0.95, jaw + 1.4 - 2.6, 0.2, 28).translate(0, 2.6 + (jaw + 1.4 - 2.6) / 2, LAY.z + post));
    b.put("cast", cyl(1.6, 1.2, 0.2, 28).translate(0, 3.2, LAY.z + post));
    b.put("cast", box(2.4, 2.2, -post - 0.6, 0.35).translate(0, jaw, LAY.z + post / 2 - 0.3)); // the arm
    b.put("cast", lathe([[STAKE_R + 0.03, -1.3], [2.15, -1.3], [2.15, 1.3], [STAKE_R + 0.03, 1.3]], 40, { bevel: 0.16, round: 2 }).translate(0, jaw, LAY.z)); // the jaw
    b.put("fine", aimed(mergeGeometries([cyl(0.45, 1.2, 0.05, 16).translate(0, 0.6, 0), cyl(1.05, 0.9, 0.16, 28).translate(0, 1.65, 0)]), V(-2.15, jaw, LAY.z), V(-1, 0, 0))); // its thumbscrew
    b.flush();
  }

  root.add(stand, stake, wire, rod);
  const parts = { rod, wire, stake, stand };
  const A = {
    tip: anchor(rod, ...KIT.tip),
    sleeve: anchor(rod, 0, LAY.tip - 55, CLAMP_Z),
    wire: anchor(wire, 0, LAY.joint + 7.5, WIRE_Z),
    joint: anchor(wire, 0, LAY.joint, WIRE_Z + 2.5),
    stake: anchor(stake, 0, LAY.grip, LAY.z),
    point: anchor(stake, 0, LAY.floor + 5, LAY.z),
  };

  // what lights up when the voice names a part: its metal, and the lines of its edges
  const lamps = [rod, wire, stake].map((part) => {
    const mats = [...part.userData.part.mats];
    const lines = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lines) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.glow = 0.2 * (1 - 0.85 * Math.min(1, 0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b));
    }
    return { solids, lines, on: -1 };
  });
  const light = (lamp, k) => {
    if (lamp.on === k) return;
    lamp.on = k;
    for (const mat of lamp.solids) {
      mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k);
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.7 * k);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };

  return {
    root, parts, A,
    pose({ explode: k = 0, litRod = 0, litWire = 0, litStake = 0 } = {}) {
      // each part swings out first, comes down after: it never passes through its neighbour
      const out = (part, [along, y], from, to) => {
        const u = ease(ramp(k, from, from + (to - from) * 0.75));
        part.position.set(ROW[0] * along * u, y * ease(ramp(k, from + (to - from) * 0.3, to)), ROW[1] * along * u);
      };
      out(rod, OPEN.rod, 0, 0.9);
      out(wire, OPEN.wire, 0.1, 1);
      fx.link.position.z = 5.5 * smooth(ramp(k, 0.45, 1));
      light(lamps[0], litRod);
      light(lamps[1], litWire);
      light(lamps[2], litStake);
    },
  };
}
