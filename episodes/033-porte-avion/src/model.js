// DOSSIER 033 — Porte d'avion : THE SYSTEM, solid — the plug door, its frame, its stops, its locks, and the air on it.
//
//   buildModel() → { root, parts, A, update(p, time, px) }
//   p = { explode, named, section, handle, hooks, stops, open, air, pin, pout, load, wall, tug, mood }
//       (their meaning: FIRST in world.js; pin, pout, load are computed by world.js from `alt`)
//   A = { mid       the door's middle (inner face)            handle   the handle's grip (where the hands go)
//         hooks     the middle hook's claw, aft edge          stop     a stop pair, aft edge, mid height (the heart)
//         lap       the panel's overhang, aft edge, mid height edge     the aft edge, mid height, the seam
//         hinge     the hinge arm's root (forward frame) }
//
// Local frame (plan.js · DOOR): origin at the middle of the sill, the panel in x-y, +z OUTWARD, −x forward.
// root is what world.js parents: at DOOR_AT in the plane (no rotation), at the origin of the bench (turned BENCH.turn).
//
// WHAT IT IS. A plug door: larger than its hole, set from the INSIDE, resting on twelve stops. Every large piece is a
// slab bent to the fuselage (radius PLANE.r about the plane's axis, local y = −PLANE.floor): outside, the door is flush
// with 023's glass skin; in section, its profile is an arc. The stack, local z (+ outward):
//   skin 0 → −2 · frame −2 → −14 · frame stops −14 → −18 · door stops −18 → −22 · panel (the overhang) −22 → −36 ·
//   lining −36 → −38 ; the plug fills the opening from 0 to −36, 0.8 cm short of the frame all round.
// THE SECTION cuts through the AFT STOPS (x = CUT), not through x = 0 (no stop lives there): what is left reads, from
// the cabin to the night, lining | panel | stops | frame | skin. The cut faces are flat and unlit (three greys, the
// stops veille) — a technical section, never a hole.
// ITS OWN LIGHT. Seen from the cabin the door faces away from the key: it carries a spot of its own, high and aft in
// the cabin, aimed at its lining, and a soft halo behind it on the night's side (drawn toward the cabin only). Both are
// off on the bench, where the door is turned to the key (the bench is told apart by where root's parent stands).
// THE AIR. One instanced field of arrows (one draw): on each face their number follows that face's pressure (pin,
// pout), inside the surplus is veille; `section` moves them into the cut's plane; `wall` fills the cabin with arrows
// streaming to the door; `tug` is one signal arrow at the grip, pointing into the cabin.
// THE OPENING (Korea only): a parallel arm — the door comes OUT (+z) and goes forward (−x), a little yaw. Never up,
// never in.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glass, plate, box, cyl, fatLine, anchor, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { DOOR, AIR, PLANE, DOOR_AT } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => {
  const u = clamp01(x);
  return u * u * (3 - 2 * u);
};
const fract = (x) => x - Math.floor(x);
// leaves fast, settles with a hair of overshoot: parts have weight
const ease = (x) => {
  const u = clamp01(x);
  const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const s = Math.sin(Math.PI * u);
  return e + s * s * 0.05 * (u > 0.5 ? 1 : 0.25);
};

/* ── the bend: the fuselage's curve ── */
const R = PLANE.r; //            282
const YC = -PLANE.floor; //      96: the plane's axis, local y
const Z0 = PLANE.r - DOOR_AT[2]; // 2: the skin's crown stands 2 cm outside DOOR_AT
const Q = { y: 0, z: 0 };
function bend(y, z, out = Q) {
  const ph = (y - YC) / R;
  const r = R + z;
  out.y = YC + r * Math.sin(ph);
  out.z = r * Math.cos(ph) - R + Z0;
  return out;
}
const tilt = (y) => -(y - YC) / R; // rotation.x that lays a flat piece on the skin at height y

/** The outline of a bent slab, in the (−z, y) plane of a shape. */
function profile(y0, y1, z0, z1) {
  const n = Math.max(2, Math.ceil((y1 - y0) / 6));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    bend(y0 + ((y1 - y0) * i) / n, z1);
    pts.push([-Q.z, Q.y]);
  }
  for (let i = n; i >= 0; i--) {
    bend(y0 + ((y1 - y0) * i) / n, z0);
    pts.push([-Q.z, Q.y]);
  }
  return pts;
}
/** A slab x0→x1, y0→y1 (along the skin), z0→z1 (depth), bent to the fuselage, its edges broken. */
const slab = (x0, x1, y0, y1, z0, z1, bevel = 0.5) => plate(profile(y0, y1, z0, z1), x1 - x0, { bevel }).rotateY(Math.PI / 2).translate(x0, 0, 0);
const capGeo = (y0, y1, z0, z1) => new THREE.ShapeGeometry(new THREE.Shape(profile(y0, y1, z0, z1).map(([a, b]) => new THREE.Vector2(a, b)))).rotateY(Math.PI / 2);

function roundRect(w, h, r, s = new THREE.Shape()) {
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
/** A rectangle's outline with a point every `step` cm (so that it can be bent). */
function rectPts(x0, x1, y0, y1, step = 6) {
  const pts = [];
  const run = (ax, ay, bx, by) => {
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let i = 0; i < n; i++) pts.push([ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n]);
  };
  run(x0, y0, x1, y0);
  run(x1, y0, x1, y1);
  run(x1, y1, x0, y1);
  run(x0, y1, x0, y0);
  return pts;
}

/* ── the stack ── */
const Z = { skin: -2, frame: -14, pad: -18, fit: -22, panel: -22 - DOOR.t, lining: -24 - DOOR.t };
const CUT = 57.5; // the section's plane: through the aft stops
// the handle's pivot: aft of the porthole and high, so that the grip (HD.len below it) falls ≈ 104 cm above the floor —
// where a standing man's hands go (plan.js says [8, 112]: the grip would sit at 66 cm, the neighbour crouching)
const HAT = [34, 150];
const HYAW = -30 * DEG; // the lever hangs forward-down: its grip under the porthole, never a « 1 » beside the « 0 »

export function buildModel() {
  const root = new THREE.Group();
  const { open: O, lap, stops: ST, hooks: HK, handle: HD, frame: FR, window: WN } = DOOR;
  const HW = O.w / 2; //                 53.5
  const GAP = 0.8;
  const PX = HW - GAP; //                 the plug's half width
  const LX = HW + lap; //                 60.5: the panel's half width
  const FX = HW + FR.w; //                69.5: the frame's outer edge
  const SX = FX + 20; //                  the skin band's outer edge
  const stopYs = Array.from({ length: ST.perSide }, (_, i) => ST.from + ((ST.to - ST.from) * i) / (ST.perSide - 1));

  /* ── materials: three greys (frame and skin dark · panel, plug, handle mid · lining, stops, hooks light) ── */
  const MATS = [];
  const mat = (color, grp, o = {}) => {
    const m = solid(color, { rough: o.rough ?? 0.5, metal: o.metal ?? 0.3 });
    m.userData.c0 = new THREE.Color(color);
    m.userData.grp = grp;
    if (o.finish === false) m.userData.finish = false;
    MATS.push(m);
    return m;
  };
  const skinM = mat(0x262a2f, 3, { rough: 0.62, metal: 0.25 });
  const frameM = mat(0x30353a, 3, { rough: 0.58, metal: 0.3 });
  const padM = mat(0xa7adb2, 4, { rough: 0.38, metal: 0.4 });
  const fitM = mat(0xb4babe, 4, { rough: 0.36, metal: 0.4 });
  const lapM = mat(0x666d73, 3, { rough: 0.5, metal: 0.3 });
  const plugM = mat(0x7b8288, 0, { rough: 0.5, metal: 0.3 });
  const liningM = mat(0xc3c7ca, 0, { rough: 0.62, metal: 0.05 });
  const lisseM = mat(0x8e959b, 0, { rough: 0.5, metal: 0.25 });
  const bezelM = mat(0x9ba2a8, 0, { rough: 0.4, metal: 0.35 });
  const paneM = mat(0x07090b, 0, { rough: 0.15, metal: 0.1, finish: false });
  const armM = mat(0x474d53, 0, { rough: 0.5, metal: 0.35 });
  const hBaseM = mat(0x7d848a, 1, { rough: 0.45, metal: 0.35 });
  const hArmM = mat(0x464c52, 1, { rough: 0.45, metal: 0.4 });
  const hGripM = mat(0xb9bfc3, 1, { rough: 0.35, metal: 0.4 });
  const shaftM = mat(0x596066, 2, { rough: 0.42, metal: 0.45 });
  const tubeM = mat(0x6b7278, 2, { rough: 0.42, metal: 0.45 });
  const lugM = mat(0x8f969c, 2, { rough: 0.4, metal: 0.4 });
  const hookMs = HK.ys.map(() => mat(0xa4abb0, 2, { rough: 0.36, metal: 0.42 }));

  const caps = new Map();
  const capOf = (m) => {
    if (!caps.has(m)) caps.set(m, new THREE.MeshBasicMaterial({ color: m.userData.grp === 3 && m !== lapM ? m.userData.c0.clone().multiplyScalar(1.15) : m.userData.c0.clone().lerp(new THREE.Color(0xffffff), 0.2), side: THREE.DoubleSide, fog: false }));
    return caps.get(m);
  };
  const padCapM = new THREE.MeshBasicMaterial({ color: 0xb9bfc4, side: THREE.DoubleSide, fog: false });
  caps.set(padM, padCapM);
  caps.set(fitM, padCapM);

  /* ── pieces: whole, or (straddling the cut) whole + aft half + cut face ── */
  const wholes = [];
  const halves = [];
  const capMeshes = [];
  const fores = []; // what lies wholly forward of the cut: hidden in section
  function piece(part, m, x0, x1, y0, y1, z0, z1, o = {}) {
    const g = slab(x0, x1, y0, y1, z0, z1, o.bevel ?? 0.5);
    const mesh = addMesh(part, g, m, o);
    if (x0 < CUT && x1 > CUT) {
      wholes.push(mesh);
      const h = addMesh(part, slab(CUT, x1, y0, y1, z0, z1, o.bevel ?? 0.5), m, o);
      h.visible = false;
      halves.push(h);
      const c = new THREE.Mesh(capGeo(y0, y1, z0, z1), capOf(m));
      c.position.x = CUT - 0.3;
      c.visible = false;
      part.add(c);
      capMeshes.push(c);
    } else if (x1 <= CUT) fores.push(mesh);
    return mesh;
  }
  const put = (part, parent, geo, m, o = {}) => {
    const mesh = addMesh(part, geo, m, o);
    parent.add(mesh);
    return mesh;
  };
  const onSkin = (obj, x, y, z) => {
    bend(y, z);
    obj.position.set(x, Q.y, Q.z);
    obj.rotation.x = tilt(y);
    return obj;
  };

  /* ── THE FRAME (fixed): the skin band, the door surround, its stops, the hooks' pins, the hinge arm's root ── */
  const frame = makePart("frame");
  root.add(frame);
  piece(frame, skinM, -SX, SX, -26, 0, Z.skin, 0); //  under the sill (the bench's floor hides most of it)
  piece(frame, skinM, -SX, SX, O.h, O.h + 36, Z.skin, 0);
  piece(frame, skinM, -SX, -HW, 0, O.h, Z.skin, 0);
  piece(frame, skinM, HW, SX, 0, O.h, Z.skin, 0);
  piece(frame, frameM, -FX, -HW, -FR.w, O.h + FR.w, Z.frame, Z.skin);
  piece(frame, frameM, HW, FX, -FR.w, O.h + FR.w, Z.frame, Z.skin);
  piece(frame, frameM, -HW, HW, -FR.w, 0, Z.frame, Z.skin);
  piece(frame, frameM, -HW, HW, O.h, O.h + FR.w, Z.frame, Z.skin);
  for (const s of [-1, 1]) for (const y of stopYs) piece(frame, padM, s > 0 ? CUT - 3 : -CUT - 3, s > 0 ? CUT + 3 : -CUT + 3, y - 4, y + 4, Z.pad, Z.frame, { bevel: 0.6, edgeOpacity: 0.55 });
  // the hooks' pins: a fork on the aft frame, a pin across it
  for (const y of HK.ys) {
    const fork = onSkin(new THREE.Group(), 64.5, y, Z.frame);
    frame.add(fork);
    for (const s of [-1, 1]) put(frame, fork, box(5, 2.4, 9, 0.4), lugM, { pos: [0, s * 4.3, -4.5], edgeOpacity: 0.5 });
    put(frame, fork, cyl(1.3, 11, 0.2, 20), lugM, { pos: [0, 0, -5.5], edges: false });
  }
  // the hinge arm's root (forward), and the arm itself (placed every frame between the root and the door)
  const ARM = 62;
  const P0 = [-PX, 0, Z.fit + 2]; // where the arm takes the door: its forward edge, mid height (bend's crown: y = YC)
  const C = [P0[0] - ARM, YC, Z.fit + 2 + Z0];
  put(frame, frame, cyl(3.6, 13, 0.4, 32), armM, { pos: C, edgeOpacity: 0.5 });
  const arm = put(frame, frame, new THREE.BoxGeometry(1, 6, 3.2), armM, { edgeOpacity: 0.5 });
  fores.push(...frame.children.filter((c) => c.isMesh && c.material === armM));

  /* ── THE DOOR: leaf (moves on the arm) → panel, handle, hooks ── */
  const leaf = new THREE.Group();
  root.add(leaf);

  const panel = makePart("panel");
  leaf.add(panel);
  piece(panel, plugM, -PX, PX, GAP, O.h - GAP, Z.panel, 0); // the plug: the door's outer skin, flush, and its body
  piece(panel, lapM, -LX, -PX, -lap, O.h + lap, Z.panel, Z.fit); // the overhang, all round: what rests on the stops
  piece(panel, lapM, PX, LX, -lap, O.h + lap, Z.panel, Z.fit);
  piece(panel, lapM, -PX, PX, -lap, GAP, Z.panel, Z.fit);
  piece(panel, lapM, -PX, PX, O.h - GAP, O.h + lap, Z.panel, Z.fit);
  piece(panel, liningM, -LX + 1.5, LX - 1.5, -lap + 1.5, O.h + lap - 1.5, Z.lining, Z.panel, { bevel: 0.8 }); // the lining: the hero seen from the cabin
  piece(panel, lisseM, -50, 40, 28, 33, Z.lining - 2.5, Z.lining); // two stiffeners: the scale
  piece(panel, lisseM, -50, 40, 176, 181, Z.lining - 2.5, Z.lining);
  for (const s of [-1, 1]) for (const y of stopYs) piece(panel, fitM, s > 0 ? CUT - 3.5 : -CUT - 3.5, s > 0 ? CUT + 3.5 : -CUT + 3.5, y - 5, y + 5, Z.fit, Z.pad, { bevel: 0.7, edgeOpacity: 0.55 });
  // the porthole, both faces: a bezel, a dark pane, a sheet of glass that catches the softbox
  const ring = roundRect(WN.w + 10, WN.h + 10, (WN.w + 10) * 0.38);
  ring.holes.push(roundRect(WN.w, WN.h, WN.w * 0.38, new THREE.Path()));
  const paneShape = roundRect(WN.w, WN.h, WN.w * 0.38);
  const sheetM = glass(BRAND.ink, { base: 0.02, rim: 0.1, spec: 0.75 });
  for (const [z, depth, paneZ, sheetZ] of [[Z.lining - 2.5, 2.5, Z.lining - 0.35, Z.lining - 0.5], [-0.1, 0.9, 0.05, 0.45]]) {
    const g = onSkin(new THREE.Group(), 0, WN.y, 0);
    bend(WN.y, 0);
    const base = Q.z;
    panel.add(g);
    const zIn = (zz) => bend(WN.y, zz).z - base;
    put(panel, g, plate(ring, depth, { bevel: 0.35 }), bezelM, { pos: [0, 0, zIn(z)], edgeOpacity: 0.6 });
    put(panel, g, plate(paneShape, 0.3, { bevel: 0.1 }), paneM, { pos: [0, 0, zIn(paneZ)], edges: false });
    const sheet = new THREE.Mesh(new THREE.ShapeGeometry(paneShape, 16), sheetM);
    sheet.position.z = zIn(sheetZ);
    g.add(sheet);
    fores.push(...g.children);
  }

  /* the handle: an escutcheon, a hub, an arm hanging down, a grip; it turns about x (its end toward the cabin, up) */
  const handle = makePart("handle");
  leaf.add(handle);
  const hTilt = onSkin(new THREE.Group(), HAT[0], HAT[1], Z.lining);
  handle.add(hTilt);
  put(handle, hTilt, box(17, 17, 1.6, 0.5), hBaseM, { pos: [0, 0, -0.8] });
  put(handle, hTilt, cyl(4.4, 8, 0.5, 40).rotateZ(Math.PI / 2), hBaseM, { pos: [0, 0, -4] });
  const hYaw = new THREE.Group();
  hYaw.rotation.z = HYAW;
  hTilt.add(hYaw);
  const hRot = new THREE.Group();
  hRot.position.set(0, 0, -4);
  hYaw.add(hRot);
  put(handle, hRot, box(5.5, HD.len, 3.4, 0.8), hArmM, { pos: [0, -HD.len / 2, -1.2] });
  put(handle, hRot, cyl(2.2, 26, 0.5, 32).rotateZ(Math.PI / 2), hGripM, { pos: [0, -HD.len, -3.6] });
  const grip = anchor(hRot, 0, -HD.len, -3.6);
  grip.rotation.z = -Math.PI / 2; // its +y along the bar (vol.js builds the neighbour's grip from it)

  /* the locking shaft along the aft edge, its three hooks (each its own material: they go one by one), the torque tube */
  const hooks = makePart("hooks");
  leaf.add(hooks);
  const zS = Z.lining - 4;
  const path = [];
  for (let y = 22; y <= 172; y += 10) {
    bend(y, zS);
    path.push(new THREE.Vector3(HK.x, Q.y, Q.z));
  }
  put(hooks, hooks, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path), 40, HK.r, 12), shaftM, { edges: false });
  for (const y of [22, 172]) put(hooks, onSkin(new THREE.Group(), HK.x, y, Z.lining), box(8, 4, 5, 0.5), shaftM, { pos: [0, 0, -2.5], edgeOpacity: 0.5 }).parent || null;
  const tubeG = onSkin(new THREE.Group(), (HAT[0] + HK.x) / 2, HAT[1], zS);
  hooks.add(tubeG);
  put(hooks, tubeG, cyl(1.7, HK.x - HAT[0], 0.2, 24).rotateZ(Math.PI / 2), tubeM, { edges: false });
  put(hooks, tubeG, box(9, 10, 8, 0.8), tubeM, { pos: [(HK.x - HAT[0]) / 2, 0, 0] }); // the gearbox on the shaft
  const crank = new THREE.Group();
  crank.position.set((HK.x - HAT[0]) / 2 - 9, 0, 0);
  tubeG.add(crank);
  put(hooks, crank, box(2.6, 9, 2.6, 0.4), tubeM, { pos: [0, -4, -1.8], edgeOpacity: 0.5 });
  const hookSlides = HK.ys.map((y, i) => {
    const g = onSkin(new THREE.Group(), HK.x, y, zS);
    hooks.add(g);
    const slide = new THREE.Group();
    g.add(slide);
    const m = hookMs[i];
    put(hooks, slide, cyl(3.6, 8, 0.4, 32), m, { edgeOpacity: 0.5 });
    put(hooks, slide, box(20, 5, 3.6, 0.6), m, { pos: [10, 0, 0] }); //                       out over the overhang
    put(hooks, slide, box(3.6, 5, 24, 0.6), m, { pos: [19, 0, 11] }); //                       down toward the frame
    put(hooks, slide, box(7, 4.6, 3.2, 0.6), m, { pos: [15.8, 0, 21.4] }); //                   the claw, behind the pin
    return slide;
  });
  const hookAt = anchor(hookSlides[1], 17, 0, 20);

  /* the neighbour's force: ONE signal arrow at the grip, pointing into the cabin */
  const ARROW = (() => {
    const shaft = new THREE.CylinderGeometry(0.9, 0.9, 14, 10).rotateX(Math.PI / 2).translate(0, 0, 7);
    const head = new THREE.ConeGeometry(3.2, 8, 16).rotateX(Math.PI / 2).translate(0, 0, 18);
    return mergeGeometries([shaft, head]);
  })();
  const tugM = new THREE.MeshBasicMaterial({ color: new THREE.Color(BRAND.signal).multiplyScalar(1.5), fog: false });
  const tug = new THREE.Mesh(ARROW, tugM);
  tug.rotation.y = Math.PI; // points −z: into the cabin
  tug.renderOrder = 6;
  hYaw.add(tug);

  /* the overhang, named: the frame's outline (ink) and the panel's band beyond it (veille), drawn through the panel */
  const bentLoop = (x0, x1, y0, y1, z) => rectPts(x0, x1, y0, y1).concat([[x0, y0]]).map(([x, y]) => (bend(y, z), [x, Q.y, Q.z]));
  const holeLine = fatLine(bentLoop(-HW, HW, 0, O.h, Z.frame - 0.2), { color: BRAND.ink, width: 2.6, opacity: 0.95 });
  const rimLine = fatLine(bentLoop(-LX, LX, -lap, O.h + lap, Z.fit + 0.2), { color: BRAND.veille, width: 2.6, opacity: 1, hdr: 1 });
  const bandShape = new THREE.Shape(rectPts(-LX, LX, -lap, O.h + lap).map(([x, y]) => new THREE.Vector2(x, y)));
  bandShape.holes.push(new THREE.Path(rectPts(-HW, HW, 0, O.h).reverse().map(([x, y]) => new THREE.Vector2(x, y))));
  const bandGeo = new THREE.ShapeGeometry(bandShape);
  const bp = bandGeo.attributes.position;
  for (let i = 0; i < bp.count; i++) {
    bend(bp.getY(i), Z.fit + 0.1);
    bp.setXYZ(i, bp.getX(i), Q.y, Q.z);
  }
  const bandM = new THREE.MeshBasicMaterial({ color: new THREE.Color(BRAND.veille).multiplyScalar(0.2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, side: THREE.DoubleSide, fog: false });
  const band = new THREE.Mesh(bandGeo, bandM);
  for (const o of [holeLine, rimLine]) {
    o.material.depthTest = false;
    o.renderOrder = 8;
  }
  band.renderOrder = 7;
  frame.add(holeLine);
  panel.add(band, rimLine);

  /* the seam, outside: a fine line round the door that keeps it readable at 60 px on the flank; signal when it opens */
  const seam = fatLine(bentLoop(-HW, HW, 0, O.h, 0.25), { color: BRAND.ink, width: 2, opacity: 0.5 });
  frame.add(seam);

  /* ── ITS OWN LIGHT (in the plane only) ── */
  const spot = new THREE.SpotLight(0xfff2e6, 0, 1100, 30 * DEG, 0.75, 0);
  spot.position.set(90, 215, -320);
  spot.target.position.set(10, 100, Z.lining);
  root.add(spot, spot.target);
  const haloM = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: { uColor: { value: new THREE.Color(BRAND.ink) }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vUv;
      void main() {
        vec2 q = (vUv - 0.5) * 2.0;
        float r2 = clamp(dot(q, q), 0.0, 1.0);
        float a = exp(-r2 * 3.2) * (1.0 - smoothstep(0.55, 1.0, sqrt(r2)));
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(520, 560).rotateY(Math.PI), haloM); // faces −z: the cabin only
  halo.position.set(0, YC, 9);
  halo.renderOrder = 5;
  root.add(halo);

  /* ── THE AIR: one instanced field ── */
  const N = AIR.n;
  const M = 170;
  const airMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const air = new THREE.InstancedMesh(ARROW, airMat, 2 * N + M);
  air.frustumCulled = false;
  air.renderOrder = 6;
  root.add(air);
  const ZAX = new THREE.Vector3(0, 0, 1);
  const rand = rng(33);
  const slot = (x, y, z, dir, travel, period, s) => ({
    tip: new THREE.Vector3(x, y, z),
    dir: dir.clone(),
    q: new THREE.Quaternion().setFromUnitVectors(ZAX, dir),
    s: new THREE.Vector3(...s),
    travel,
    period,
    phase: rand(),
  });
  const normalAt = (y, sign) => new THREE.Vector3(0, Math.sin((y - YC) / R), Math.cos((y - YC) / R)).multiplyScalar(sign);
  const shuffled = () => {
    const a = Array.from({ length: N }, (_, i) => i);
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const rankIn = shuffled();
  const rankOut = shuffled();
  const faceIn = [];
  const faceOut = [];
  const secIn = [];
  const secOut = [];
  for (let i = 0; i < N; i++) {
    const x = -42 + 16.8 * (i % 6);
    const y = 22 + 30.8 * Math.floor(i / 6);
    bend(y, Z.lining - 6);
    faceIn.push(slot(x, Q.y, Q.z, normalAt(y, 1), 30, 1.7, [1, 1, 1]));
    bend(y, 5);
    faceOut.push(slot(x, Q.y, Q.z, normalAt(y, -1), 30, 1.7, [0.68, 0.68, 0.9]));
    // section: 12 rows × 3 lanes in the cut's plane, each lane flowing into the next
    const row = i % 12;
    const ln = Math.floor(i / 12);
    const ys = 4 + row * 16.4;
    bend(ys, Z.lining - 4 - ln * 18);
    secIn.push(slot(CUT - 5, Q.y, Q.z, normalAt(ys, 1), 18, 1.25, [0.85, 0.85, 0.85]));
    bend(ys, 4 + ln * 18);
    secOut.push(slot(CUT - 5, Q.y, Q.z, normalAt(ys, -1), 18, 1.25, [0.62, 0.62, 0.85]));
  }
  const wallS = [];
  const wallD = new Float32Array(M);
  for (let i = 0; i < M; i++) {
    const dd = 70 + (AIR.reach - 70) * Math.sqrt(rand());
    const al = (-25 + 110 * rand()) * DEG;
    const S = new THREE.Vector3(Math.sin(al) * dd, 25 + 160 * rand(), Z.lining - 10 - Math.cos(al) * dd);
    const E = new THREE.Vector3(-40 + 85 * rand(), 30 + 140 * rand(), Z.lining - 12);
    const dir = E.clone().sub(S);
    const len = dir.length();
    dir.divideScalar(len);
    const w = slot(S.x, S.y, S.z, dir, Math.max(20, Math.min(80, len - 28)), 0.95, [1.6, 1.6, 2.6]);
    w.travel = -w.travel; // the wall's arrows start at S and run forward (setArrow runs from tip − travel·dir to tip)
    wallS.push(w);
    wallD[i] = dd;
  }
  const _p = new THREE.Vector3();
  const _m = new THREE.Matrix4();
  const _c = new THREE.Color();
  const _c2 = new THREE.Color();
  const ZERO = new THREE.Vector3(0, 0, 0);
  const INK = new THREE.Color(BRAND.ink);
  const VEILLE = new THREE.Color(BRAND.veille);
  const SIGNAL = new THREE.Color(BRAND.signal);
  const LIFT = new THREE.Color(BRAND.ink).multiplyScalar(0.14);
  const SKIN0 = new THREE.Color(BRAND.ink);
  /** One arrow: its slot, its strength (0 gone), its veille share (0 ink → 1 veille), its brightness. */
  function setArrow(idx, s, time, amount, v, k) {
    const u = fract(time / s.period + s.phase);
    const fade = smooth(u / 0.3) * (1 - smooth((u - 0.72) / 0.28)) * amount;
    if (fade < 0.004) {
      _m.compose(s.tip, s.q, ZERO);
      air.setMatrixAt(idx, _m);
      air.setColorAt(idx, _c.setScalar(0));
      return;
    }
    const along = s.travel > 0 ? s.travel * (u - 1) : -s.travel * u;
    _p.copy(s.dir).multiplyScalar(along).add(s.tip);
    _m.compose(_p, s.q, s.s);
    air.setMatrixAt(idx, _m);
    _c.copy(INK).multiplyScalar(0.75).lerp(_c2.copy(VEILLE).multiplyScalar(1.25), v).multiplyScalar(fade * k);
    air.setColorAt(idx, _c);
  }

  const parts = { frame, panel, handle, hooks };
  bend(O.h / 2, Z.lining);
  const midY = Q.y;
  const midZ = Q.z;
  const A = {
    mid: anchor(panel, 0, midY, midZ),
    handle: grip,
    hooks: hookAt,
    stop: anchor(frame, CUT, bend(stopYs[2], Z.pad).y, Q.z),
    lap: anchor(panel, LX, bend(YC, Z.fit).y, Q.z),
    edge: anchor(leaf, HW, bend(YC, 0).y, Q.z),
    hinge: anchor(frame, C[0], C[1], C[2]),
  };

  const OPEN_TURN = 100 * DEG;
  function update(p = {}, time = 0) {
    const k = clamp01(p.explode ?? 0);
    const named = Math.round(p.named ?? 0);
    const sec = (p.section ?? 0) > 0.5;
    const op = smooth(p.open ?? 0);
    const load = clamp01(p.load ?? 0);
    const inPlane = !!root.parent && root.parent.position.lengthSq() > 100;

    /* the exploded view: toward the cabin (−z), each in its lane — the panel a little, the shaft aside, the handle far */
    const e1 = ease(k / 0.6);
    const e2 = ease((k - 0.15) / 0.65);
    const e3 = ease((k - 0.3) / 0.7);
    panel.position.set(0, 0, -40 * e1);
    hooks.position.set(38 * e2, 0, -82 * e2);
    handle.position.set(0, 6 * e3, -128 * e3);

    /* the opening (Korea): out and forward on the arm, a little yaw — never up, never in */
    const th = OPEN_TURN * op;
    leaf.position.set(-ARM * (1 - Math.cos(th)), 0, ARM * Math.sin(th) + 0.6 * load);
    leaf.rotation.y = -10 * DEG * op;
    {
      const r = leaf.rotation.y;
      const px0 = P0[0];
      const pz0 = P0[2] + Z0 + panel.position.z;
      const ax = px0 * Math.cos(r) + pz0 * Math.sin(r) + leaf.position.x;
      const az = -px0 * Math.sin(r) + pz0 * Math.cos(r) + leaf.position.z;
      const dx = ax - C[0];
      const dz = az - C[2];
      const l = Math.max(1, Math.hypot(dx, dz));
      arm.position.set((ax + C[0]) / 2, YC, (az + C[2]) / 2);
      arm.rotation.y = Math.atan2(-dz, dx);
      arm.scale.x = l;
    }

    /* the handle (lifted toward the cabin), the tube and its crank with it; the hooks one by one */
    const hAng = 150 * DEG * clamp01(p.handle ?? 0);
    hRot.rotation.x = hAng;
    crank.rotation.x = hAng;
    const hk = clamp01(p.hooks ?? 0);
    for (let i = 0; i < hookSlides.length; i++) {
      const u = smooth(hk * 3 - i);
      hookSlides[i].position.set(8 * u, 0, -6 * u);
      hookMs[i].userData.go = Math.max(4 * u * (1 - u), 0.55 * u);
    }

    /* named: what the voice names lights up, the rest steps down a little */
    for (let i = 0; i < MATS.length; i++) {
      const m = MATS[i];
      const own = named > 0 && m.userData.grp === named;
      m.color.copy(m.userData.c0).multiplyScalar(named > 0 && !own ? 0.72 : 1);
      if (own && named <= 2) m.emissive.copy(LIFT);
      else m.emissive.setScalar(0);
    }
    const lit = Math.max(clamp01(p.stops ?? 0), named === 4 ? 1 : 0);
    const gS = (0.06 + 0.5 * lit) * (1 + 0.12 * load * Math.sin(time * 2.2)); // they shiver under the load: slow, never a blink
    padM.emissive.copy(VEILLE).multiplyScalar(gS * 0.85);
    fitM.emissive.copy(VEILLE).multiplyScalar(gS);
    padCapM.color.setHex(0xb9bfc4).lerp(_c.copy(VEILLE).multiplyScalar(1.3), clamp01(lit * 0.55));
    for (let i = 0; i < hookMs.length; i++) hookMs[i].emissive.add(_c.copy(SIGNAL).multiplyScalar(1.5 * hookMs[i].userData.go));
    if (named === 3) lapM.emissive.copy(VEILLE).multiplyScalar(0.16);
    plugM.emissive.add(_c.copy(SIGNAL).multiplyScalar(0.3 * op));
    seam.material.color.copy(SKIN0).lerp(SIGNAL, op);
    seam.material.opacity = 0.5 + 0.5 * op;
    const showLap = named === 3 && !sec;
    band.visible = showLap;
    rimLine.visible = showLap;
    holeLine.visible = showLap;

    /* the section */
    for (let i = 0; i < wholes.length; i++) wholes[i].visible = !sec;
    for (let i = 0; i < halves.length; i++) halves[i].visible = sec;
    for (let i = 0; i < capMeshes.length; i++) capMeshes[i].visible = sec;
    for (let i = 0; i < fores.length; i++) fores[i].visible = !sec;
    handle.visible = !sec;
    hooks.visible = !sec;
    seam.visible = !sec;

    /* its own light */
    spot.intensity = inPlane ? 1.1 : 0;
    halo.visible = inPlane && !sec;
    haloM.uniforms.uAmount.value = inPlane ? 0.2 : 0;

    /* the air */
    const a = clamp01(p.air ?? 0) * (1 - clamp01(op * 3));
    const nIn = N * clamp01(p.pin ?? 1);
    const nOut = N * clamp01(p.pout ?? 1);
    const fin = sec ? secIn : faceIn;
    const fout = sec ? secOut : faceOut;
    for (let i = 0; i < N; i++) {
      setArrow(i, fin[i], time, a * clamp01(nIn - rankIn[i]), clamp01(rankIn[i] + 1 - nOut), 1);
      setArrow(N + i, fout[i], time, a * clamp01(nOut - rankOut[i]), 0, 0.8);
    }
    const w = clamp01(p.wall ?? 0);
    const front = AIR.reach * w;
    for (let i = 0; i < M; i++) setArrow(2 * N + i, wallS[i], time, clamp01((front - wallD[i]) / 70) * clamp01(w * 6), 1, 0.85 + 0.35 * w);
    air.instanceMatrix.needsUpdate = true;
    if (air.instanceColor) air.instanceColor.needsUpdate = true;
    air.visible = a > 0.004 || w > 0.004;
    const tg = clamp01(p.tug ?? 0);
    tug.visible = tg > 0.01 && !sec;
    tug.scale.setScalar(0.55 + 0.45 * tg);
    tug.position.set(0, -HD.len * Math.cos(hAng), -4 - HD.len * Math.sin(hAng) - 4);
  }
  update();

  return { root, parts, A, update };
}
