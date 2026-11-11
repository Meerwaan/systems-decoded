// DOSSIER 042 — AROUND, X-ray: the tank at night (hull, tracks, turret, gun, hatches; a generic silhouette, no country,
// no insignia, no number), its crew of four (« toi et trois autres », glass figures lit veille), the ground (a grid that
// fades, a low horizon), and the comment's « une machine » — a second turret of glass, alone like an exhibit, with an
// autoloader (a rack and an arm, solid) in its longer rear. Centimetres, Y up, in the frame of plan.js (the origin is the
// caisson's centre, the tank faces −x, its left — the loader's side — is +z).
//
//   buildChar() → { group, A, update(P, time, px, eye) }
//   P = { shell, crew, you, reach, other, arm, heat, bench } (+ `grab` if world.js hands it: the loader's hands follow
//   the round caisson.js pulls out; without it they follow `reach`)
//
// THE GLASS. One shell (asShell, order 20) for the whole tank: lofts (two footprints joined by flat faces) for the turret
// and its rear (the « nuque »), profile extrusions for the hull, the fenders and the tracks (a belt with its hole), one
// plane per skirt, a turned profile for the gun (sleeve, tube, bore evacuator, tube, muzzle: its steps are its edges, its
// lip and its long streak are what make it read from the front). The turret has no floor (the deck carries it) and no
// rear face (the bustle goes on from it); the bustle has no front face and NO ROOF: its rim is the opening the roof panel
// of caisson.js sits in — when the panel flies, a hole is left, never a pane. The caisson (solid) fits in that bustle.
// THE HEAT. Every line of the tank carries its nearness to the caisson (a vertex colour): three draws of the same lines,
// added — ink where it is far, ink fading and signal rising with `heat` where it is near — so the bustle and the roof
// warm in a frank signal, the gun and the glacis stay ink. The bustle's glass turns signal with them; on the ground the
// grid's lines warm under the turret (the pool of light itself belongs to feu.js). A slow breath, never a flicker.
// THE CREW. makeFigure shells, head and hands of glass too, tinted veille with a faint fill: a green silhouette with a
// bright lip, readable as a person at 20 m. Order 14: seen through the tank's glass. `update` is called sixteen times per
// frame: it sets uniforms and transforms only; the loader is re-posed only when `reach` (or `grab`) moved.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, lineMat, fatLine, solid, anchor, mergeGeometries } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { makeContact } from "@kit/atmo.js";
import { GROUND, HULL, TRACKS, TURRET, GUN, CREW, OTHER, ROUNDS, PANEL, CAISSON, DEG } from "./plan.js";
import { dressChar } from "./habillage.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const TAU = Math.PI * 2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ───────────────────────────────────────────────────────────── the shape of the tank, from plan.js */

const Y0 = GROUND.y;
const DECK = HULL.deck;
const BELLY = HULL.belly;
const TOP = TRACKS.top; //                     the tracks' upper run, the fenders' floor
const [NOSE, REAR] = HULL.x;
const GLACIS = HULL.glacis[1]; //              where the upper glacis meets the deck
const NOSE_Y = DECK - 34; //                   the nose, where the two glacis plates meet
const glacisX = (y) => GLACIS + ((NOSE - GLACIS) * (DECK - y)) / (DECK - NOSE_Y);
const WIDE = TRACKS.z[1] + 3; //               the fenders' outer face
const SPROCKET = [REAR - 18, TOP - 36]; //     drive sprocket (rear) and idler (front): the belt wraps them
const IDLER = [NOSE + 25, TOP - 36];
const WHEEL_Y = Y0 + 8 + TRACKS.wheels.r;
const TX0 = TURRET.x[0];
const TX1 = TURRET.x[1];
const BULK = CAISSON.bulkhead[0]; //           the caisson's face toward the crew: where the bustle begins
const ROOF = TURRET.roof;
const HWF = TURRET.halfWidth.front;
const HWR = TURRET.halfWidth.rear;
const UNDER = -42; //                          the bustle's underside: it overhangs the deck (the caisson's floor is at −34)
const SIDE = (y) => HWR + 12 - (12 * (y - TURRET.base)) / (ROOF - TURRET.base); // the turret's sloped side at its rear

/* ───────────────────────────────────────────────────────────── geometry helpers */

/** Two footprints (x, z) — `low` at y0, `high` at y1, the same count — joined by flat faces. `open`: the side faces
 *  (i → i+1) left out; `caps`: [bottom, top]. Non-indexed: flat normals, the glass lights face by face. */
function loft(low, high, y0, y1, { open = [], caps = [true, true] } = {}) {
  const pos = [];
  const tri = (a, b, c) => pos.push(...a, ...b, ...c);
  const n = low.length;
  const L = low.map(([x, z]) => [x, y0, z]);
  const H = high.map(([x, z]) => [x, y1, z]);
  for (let i = 0; i < n; i++) {
    if (open.includes(i)) continue;
    const j = (i + 1) % n;
    tri(L[i], L[j], H[j]);
    tri(L[i], H[j], H[i]);
  }
  const cap = (P) => {
    for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(P.map(([x, , z]) => new THREE.Vector2(x, z)), [])) tri(P[a], P[b], P[c]);
  };
  if (caps[0]) cap(L);
  if (caps[1]) cap(H);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}
/** A profile in (x, y) pushed along z from z0 to z1. */
function extrudeXY(pts, z0, z1) {
  const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  return extrudeShape(sh, z0, z1);
}
function extrudeShape(sh, z0, z1) {
  const g = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 12 });
  g.translate(0, 0, z0);
  return g;
}
/** The belt of a track, in (x, y): the bottom run, up round the sprocket, the top run, down round the idler. `t` is
 *  the belt's thickness taken off (the hole's path). */
function beltPath(path, t) {
  const R = 36 - t;
  const yb = Y0 + t;
  const [x0, x1] = [TRACKS.wheels.x[0] + t * 0.5, TRACKS.wheels.x[TRACKS.wheels.x.length - 1] - t * 0.5];
  const a0 = -125 * DEG;
  const a1 = 235 * DEG;
  path.moveTo(x0, yb);
  path.lineTo(x1, yb);
  path.lineTo(SPROCKET[0] + R * Math.cos(a0), SPROCKET[1] + R * Math.sin(a0));
  path.absarc(SPROCKET[0], SPROCKET[1], R, a0, Math.PI / 2, false);
  path.lineTo(IDLER[0], IDLER[1] + R);
  path.absarc(IDLER[0], IDLER[1], R, Math.PI / 2, a1, false);
  path.lineTo(x0, yb);
  return path;
}
/** A flat polygon in (x, y) at depth z (a skirt). */
function planeXY(pts, z) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))));
  g.translate(0, 0, z);
  return g;
}

/* ── lines: flat lists of segments [x0, y0, z0, x1, y1, z1, …] ── */
function pushEdges(out, geo, threshold = 25) {
  const a = new THREE.EdgesGeometry(geo, threshold).attributes.position.array;
  for (let i = 0; i < a.length; i++) out.push(a[i]);
}
const seg = (out, a, b) => out.push(a[0], a[1], a[2], b[0], b[1], b[2]);
/** A circle in the plane x–z (a hatch, the turret ring) or x–y (a wheel). */
function ringXZ(out, cx, y, cz, r, n = 32) {
  for (let j = 0; j < n; j++) {
    const a0 = (j / n) * TAU;
    const a1 = ((j + 1) / n) * TAU;
    out.push(cx + r * Math.cos(a0), y, cz + r * Math.sin(a0), cx + r * Math.cos(a1), y, cz + r * Math.sin(a1));
  }
}
function ringXY(out, cx, cy, z, r, n = 28) {
  for (let j = 0; j < n; j++) {
    const a0 = (j / n) * TAU;
    const a1 = ((j + 1) / n) * TAU;
    out.push(cx + r * Math.cos(a0), cy + r * Math.sin(a0), z, cx + r * Math.cos(a1), cy + r * Math.sin(a1), z);
  }
}
/** The bustle's outline drawn by hand: its underside all round (the front edge is the overhang), its rim but the front
 *  (the turret roof's seam draws it), its four rear corners (the front ones are the turret's own edges). */
function bustleEdges(out, low, high, y0, y1) {
  const n = low.length;
  for (let i = 0; i < n; i++) seg(out, [low[i][0], y0, low[i][1]], [low[(i + 1) % n][0], y0, low[(i + 1) % n][1]]);
  for (let i = 0; i < n - 1; i++) seg(out, [high[i][0], y1, high[i][1]], [high[i + 1][0], y1, high[i + 1][1]]);
  for (let i = 1; i < n - 1; i++) seg(out, [low[i][0], y0, low[i][1]], [high[i][0], y1, high[i][1]]);
}
function lines(list, material, parent, order = 2) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(list);
  const obj = new LineSegments2(geo, material);
  obj.frustumCulled = false;
  obj.renderOrder = order;
  parent.add(obj);
  return obj;
}

/** How near a point is to the caisson, 0 → 1: what `heat` warms (the bustle and the roof most, the glacis not at all). */
function nearness(x, y, z) {
  return smooth(330, 70, Math.hypot(x, (y - 10) * 1.4, z * 0.55)) * (y > -90 ? 1 : 0.45);
}

/** A gun: a turned profile (radius, distance from the trunnion), its axis laid toward −x from `trunnion`. */
function gunGeometry(profile, trunnion) {
  const g = new THREE.LatheGeometry(profile.map(([r, s]) => new THREE.Vector2(r, s)), 36);
  g.rotateZ(Math.PI / 2); // +y (the profile's axis) → −x
  g.translate(...trunnion);
  return g;
}

/** A round, for the autoloader: a case and its ogive, along +y from its base. */
const roundGeometry = () =>
  new THREE.LatheGeometry([[0.01, 0], [ROUNDS.r, 0], [ROUNDS.r, 66], [ROUNDS.r * 0.72, 72], [2.2, ROUNDS.length - 2], [0.01, ROUNDS.length]].map(([r, y]) => new THREE.Vector2(r, y)), 20);

/** The ground: only its grid, fading far away and where it would crowd under the pixel (grazing), its lines warming
 *  under the turret with `heat` (uHot: x, z, radii). */
function groundMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uInk: { value: INK.clone() }, uSig: { value: SIGNAL.clone() }, uAmount: { value: 0 }, uHeat: { value: 0 },
      uCell: { value: 50 }, uMajor: { value: 4 }, uReach: { value: 3000 }, uCentre: { value: new THREE.Vector2(-160, 0) },
      uHot: { value: new THREE.Vector4(-40, 0, 340, 260) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSig; uniform float uAmount, uHeat, uCell, uMajor, uReach; uniform vec2 uCentre; uniform vec4 uHot; varying vec2 vP;
      // a family of lines ≈ 3 px wide, melted away once a cell is under ~11 px (grazing, far): nothing fine that shimmers
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
        float fade = exp(-dot(r, r));
        vec2 h = (vP - uHot.xy) / uHot.zw;
        float hot = clamp(uHeat * exp(-dot(h, h)), 0.0, 1.0);
        vec3 col = mix(uInk, uSig, clamp(hot * 1.3, 0.0, 1.0)) * (1.0 + 1.3 * hot);
        gl_FragColor = vec4(col * (g * fade * uAmount), 1.0);
      }`,
  });
}

/** A crewman: a glass figure, head and hands of glass too, tinted veille with a faint fill. */
function crewman(order = 14) {
  const f = makeFigure({ shell: true, glassK: 1.5, spec: 0.25, through: 0.1, order });
  f.ghost(true);
  f.body.uniforms.uColor.value.copy(VEILLE);
  f.body.uniforms.uBase.value = 0.05;
  return f;
}
/** Sit a figure: its feet where they are on its floor, its seat `seatH` above them, hands forward on its controls. */
function seat(f, feet, seatH, facing, { hands = 30, lean = 8 } = {}) {
  f.group.position.set(feet[0], feet[1] + seatH - f.HIP, feet[2]);
  f.group.rotation.y = facing * DEG;
  const ankle = f.HIP - seatH + 8;
  f.lean(lean);
  f.leg("L", V(8.6, ankle, 40), V(0, 1, 0.5));
  f.leg("R", V(-8.6, ankle, 40), V(0, 1, 0.5));
  f.reach("L", V(15, 106, hands));
  f.reach("R", V(-15, 106, hands));
}

/* ───────────────────────────────────────────────────────────── the set */

const OP = 0.55; //  the tank's lines (ink)
const OPS = 0.95; // the same lines warmed (signal)
const GRID = 0.17; // the ground's grid

export function buildChar() {
  const group = new THREE.Group();
  const tank = new THREE.Group(); //  the glass and its lines (`shell`)
  const crewGroup = new THREE.Group(); // the four (`crew`)
  group.add(tank, crewGroup);
  const dress = dressChar(); group.add(dress.group);

  // flat faces: no lip, no softbox (a flat face at grazing would light whole: a pale slab); the lines carry the drawing
  const shellMat = glass(BRAND.ink, { base: 0.014, rim: 0.09, power: 3.2, edge: 0, spec: 0, through: 0.12 });
  const bustleMat = glass(BRAND.ink, { base: 0.02, rim: 0.1, power: 3.2, edge: 0, spec: 0, through: 0.12 });
  // the gun is round: its lip and a long streak are what make it read, even from the front
  const gunMat = glass(BRAND.ink, { base: 0.01, rim: 0.4, power: 2.2, edge: 0.6, spec: 0.35 });
  const panes = [];
  const pane = (geo, mat = shellMat, parent = tank) => {
    const m = new THREE.Mesh(geo, mat);
    parent.add(m);
    panes.push(m);
    return m;
  };
  const main = []; //  the tank's lines (warmed by `heat`)
  const gear = []; //  the running gear and the skirts: the same, at half value (they must not outshine the turret)
  const faint = []; // inside, very light: the breech, the turret ring, the engine deck

  /* ── the hull: its body between the tracks, its upper part over them (the fenders), a skirt each side ── */
  const lowHull = [[glacisX(TOP - 2), TOP - 2], [NOSE, NOSE_Y], [NOSE + 55, BELLY], [REAR - 15, BELLY], [REAR, BELLY + 30], [REAR, TOP - 2]];
  const upHull = [[glacisX(TOP), TOP], [REAR, TOP], [REAR, DECK], [GLACIS, DECK]];
  for (const g of [extrudeXY(lowHull, -HULL.halfWidth, HULL.halfWidth), extrudeXY(upHull, -WIDE, WIDE)]) {
    pane(g);
    pushEdges(main, g, 25);
  }
  for (const s of [1, -1]) {
    const skirt = planeXY([[NOSE + 40, TOP], [REAR - 15, TOP], [REAR - 15, TOP - 48], [NOSE + 85, TOP - 48]], s * (WIDE + 1.5));
    pane(skirt);
    pushEdges(gear, skirt, 25);
    // the track: a belt (its hole cut), round the sprocket and the idler
    const belt = beltPath(new THREE.Shape(), 0);
    belt.holes.push(beltPath(new THREE.Path(), 8));
    const tz = s > 0 ? [TRACKS.z[0] + 1, TRACKS.z[1]] : [-TRACKS.z[1], -TRACKS.z[0] - 1];
    const track = extrudeShape(belt, tz[0], tz[1]);
    pane(track);
    // its outline on the outer face only (both faces of both belts were four loops of spaghetti)
    const zo = s * TRACKS.z[1];
    for (const path of [beltPath(new THREE.Path(), 0), beltPath(new THREE.Path(), 8)]) {
      const pts = path.getPoints(10);
      for (let i = 0; i < pts.length - 1; i++) gear.push(pts[i].x, pts[i].y, zo, pts[i + 1].x, pts[i + 1].y, zo);
    }
    // seven road wheels, the sprocket, the idler: circles on the track's outer side, a hub each
    const z = s * (TRACKS.z[1] - 4);
    for (const x of TRACKS.wheels.x) {
      ringXY(gear, x, WHEEL_Y, z, TRACKS.wheels.r, 28);
      ringXY(gear, x, WHEEL_Y, z + s * 2, 9, 12);
    }
    ringXY(gear, SPROCKET[0], SPROCKET[1], z, 28, 24);
    ringXY(gear, SPROCKET[0], SPROCKET[1], z + s * 2, 14, 12);
    ringXY(gear, IDLER[0], IDLER[1], z, 26, 24);
    ringXY(gear, IDLER[0], IDLER[1], z + s * 2, 8, 12);
  }
  ringXZ(main, GLACIS + 20, DECK + 0.6, 0, 24, 24); // the driver's hatch
  for (let x = 100; x <= REAR - 10; x += 20) seg(faint, [x, DECK + 0.5, -95], [x, DECK + 0.5, 95]); // the engine deck

  /* ── the turret: long and low, wider at the front, its rear (the « nuque ») over the caisson ── */
  const tLow = [[TX0, 60], [TX0 + 20, HWF], [BULK, SIDE(TURRET.base)], [BULK, -SIDE(TURRET.base)], [TX0 + 20, -HWF], [TX0, -60]];
  const tHigh = [[TX0 + 30, 55], [TX0 + 45, HWF - 12], [BULK, HWR], [BULK, -HWR], [TX0 + 45, -(HWF - 12)], [TX0 + 30, -55]];
  const turret = loft(tLow, tHigh, TURRET.base, ROOF, { open: [2], caps: [false, true] });
  pane(turret);
  pushEdges(main, turret, 20);
  // the bustle: no front (the turret goes on into it), no roof (its rim is the panel's opening)
  const zb = SIDE(UNDER);
  const bLow = [[BULK, zb], [TX1 - 20, zb - 4], [TX1, zb - 24], [TX1, -(zb - 24)], [TX1 - 20, -(zb - 4)], [BULK, -zb]];
  const bHigh = [[BULK, HWR], [TX1 - 17, HWR - 4], [TX1, HWR - 24], [TX1, -(HWR - 24)], [TX1 - 17, -(HWR - 4)], [BULK, -HWR]];
  pane(loft(bLow, bHigh, UNDER, ROOF, { open: [5], caps: [true, false] }), bustleMat);
  bustleEdges(main, bLow, bHigh, UNDER, ROOF);
  // the turret's rear below the overhang, and the roof strip round the panel (glass only: their outlines are drawn)
  {
    const s0 = SIDE(TURRET.base);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([BULK, TURRET.base, -s0, BULK, TURRET.base, s0, BULK, UNDER, zb, BULK, TURRET.base, -s0, BULK, UNDER, zb, BULK, UNDER, -zb], 3));
    g.computeVertexNormals();
    pane(g);
    const rim = new THREE.Shape(bHigh.map(([x, z]) => new THREE.Vector2(x, z)));
    const hole = new THREE.Path();
    hole.moveTo(PANEL.x[0] - 0.5, PANEL.z[0] - 0.5);
    hole.lineTo(PANEL.x[1] + 0.5, PANEL.z[0] - 0.5);
    hole.lineTo(PANEL.x[1] + 0.5, PANEL.z[1] + 0.5);
    hole.lineTo(PANEL.x[0] - 0.5, PANEL.z[1] + 0.5);
    rim.holes.push(hole);
    const strip = new THREE.ShapeGeometry(rim);
    strip.rotateX(Math.PI / 2); // the shape's y → z
    strip.translate(0, ROOF, 0);
    pane(strip, bustleMat);
  }
  // the gun's mantlet, the gun (sleeve, tube, the evacuator a third of the way, tube, muzzle)
  {
    const mantlet = new THREE.BoxGeometry(44, 66, 84).translate(TX0 - 4, GUN.trunnion[1] - 2, 0);
    pane(mantlet);
    pushEdges(main, mantlet, 25);
    const len = GUN.trunnion[0] - GUN.muzzle;
    const ev = GUN.trunnion[0] - GUN.evacuator;
    const prof = [[GUN.r + 2.5, 24], [GUN.r + 1.7, ev], [GUN.r + 4.9, ev], [GUN.r + 5.5, ev + 7], [GUN.r + 5.5, ev + 60], [GUN.r + 4.9, ev + 66], [GUN.r + 1.1, ev + 66], [GUN.r + 0.3, len - 18], [GUN.r + 1.5, len - 18], [GUN.r + 1.5, len], [GUN.r - 1.5, len]];
    const gun = gunGeometry(prof, GUN.trunnion);
    pane(gun, gunMat);
    pushEdges(main, gun, 30);
    const breech = new THREE.BoxGeometry(GUN.breech[0] - GUN.breech[1], 38, 48).translate((GUN.breech[0] + GUN.breech[1]) / 2, GUN.trunnion[1], 0);
    pushEdges(faint, breech, 25);
  }
  // on the roof: the commander's cupola, the loader's hatch, the gunner's sight, the commander's panoramic sight
  {
    const [cx, cz] = TURRET.hatches.commander;
    const cupola = new THREE.CylinderGeometry(36, 38, 16, 32).translate(cx, ROOF + 8, cz);
    pane(cupola);
    pushEdges(main, cupola, 25);
    ringXZ(main, cx, ROOF + 16.6, cz, 26, 28);
    const [lx, lz] = TURRET.hatches.loader;
    ringXZ(main, lx, ROOF + 0.6, lz, 30, 30);
    const sight = new THREE.BoxGeometry(48, 26, 34).translate(TX0 + 68, ROOF + 13, -110);
    pane(sight);
    pushEdges(main, sight, 25);
    const stalk = new THREE.CylinderGeometry(10, 10, 18, 20).translate(-96, ROOF + 9, -122);
    const head = new THREE.BoxGeometry(28, 20, 28).translate(-96, ROOF + 28, -122);
    for (const g of [stalk, head]) {
      pane(g);
      pushEdges(main, g, 25);
    }
  }
  ringXZ(faint, TURRET.ring.x, DECK + 0.5, 0, TURRET.ring.r, 48); // the turret ring, inside
  asShell(panes, 20);

  /* ── the tank's lines. Three draws of the same segments, added — far ink · near ink (fades with heat) · near signal —
   *  their nearness to the caisson and their weight (the running gear at half) baked in a vertex colour; and three
   *  such sets — the middle, the +z side, the −z side — the side away from the eye at half value: depth, at no cost. ── */
  const split = [[], [], []];
  const splitK = [[], [], []];
  const sortOut = (list, k) => {
    for (let i = 0; i < list.length; i += 6) {
      const zm = (list[i + 2] + list[i + 5]) / 2;
      const gi = zm > 60 ? 1 : zm < -60 ? 2 : 0;
      for (let j = 0; j < 6; j++) split[gi].push(list[i + j]);
      splitK[gi].push(k);
    }
  };
  sortOut(main, 1);
  sortOut(gear, 0.5);
  const lineSets = [];
  split.forEach((list, gi) => {
    if (!list.length) return;
    const far = new Float32Array(list.length);
    const near = new Float32Array(list.length);
    for (let v = 0; v < list.length / 3; v++) {
      const k = splitK[gi][v >> 1];
      const w = nearness(list[3 * v], list[3 * v + 1], list[3 * v + 2]);
      far.fill((1 - w) * k, 3 * v, 3 * v + 3);
      near.fill(w * k, 3 * v, 3 * v + 3);
    }
    const geoFar = new LineSegmentsGeometry();
    geoFar.setPositions(list);
    geoFar.setColors(far);
    const geoNear = new LineSegmentsGeometry();
    geoNear.setPositions(list);
    geoNear.setColors(near);
    const set = {
      side: gi === 1 ? 1 : gi === 2 ? -1 : 0,
      inkFar: lineMat(BRAND.ink, 2, { opacity: OP, additive: true, vertexColors: true }),
      inkNear: lineMat(BRAND.ink, 2, { opacity: OP, additive: true, vertexColors: true }),
      sigNear: lineMat(BRAND.signal, 2.2, { opacity: 0, additive: true, vertexColors: true }),
    };
    for (const [geo, mat] of [[geoFar, set.inkFar], [geoNear, set.inkNear], [geoNear, set.sigNear]]) {
      const obj = new LineSegments2(geo, mat);
      obj.frustumCulled = false;
      obj.renderOrder = 2;
      tank.add(obj);
    }
    lineSets.push(set);
  });
  const faintMat = lineMat(BRAND.ink, 1.8, { opacity: 0.2, additive: true });
  lines(faint, faintMat, tank);

  /* ── the ground: its grid, a soft patch of shadow under the tank, a low horizon ── */
  const groundMat = groundMaterial();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(15000, 15000).rotateX(-Math.PI / 2), groundMat);
  ground.position.set(-160, Y0, 0);
  ground.frustumCulled = false;
  group.add(ground);
  const contact = makeContact({ amount: 0.55 });
  contact.scale.set(900, 480, 1);
  contact.position.set(-165, Y0 + 0.5, 0);
  group.add(contact);
  const horizonPts = [];
  for (let j = 0; j <= 160; j++) horizonPts.push([-160 + 40000 * Math.cos((j / 160) * TAU), Y0, 40000 * Math.sin((j / 160) * TAU)]);
  const horizon = fatLine(horizonPts, { color: BRAND.ink, width: 1.8, opacity: 0.1 });
  group.add(horizon);

  /* ── the crew of four, veille ── */
  const loader = crewman();
  const commander = crewman();
  const gunner = crewman();
  const driver = crewman();
  crewGroup.add(loader.group, commander.group, gunner.group, driver.group);
  seat(commander, CREW.commander.feet, CREW.commander.seat, CREW.commander.facing, { lean: 6 });
  seat(gunner, CREW.gunner.feet, CREW.gunner.seat, CREW.gunner.facing, { lean: 14, hands: 34 });
  {
    // the driver, in the hull at the front, half lying: hips at `at`, legs out toward the nose, the back laid back
    const [x, y, z] = CREW.driver.at;
    driver.group.position.set(x, y - driver.HIP, z);
    driver.group.rotation.y = CREW.driver.facing * DEG;
    driver.lean(-CREW.driver.recline);
    const ankle = BELLY + 15 - (y - driver.HIP);
    driver.leg("L", V(9, ankle, 60), V(0, 1, 0.2));
    driver.leg("R", V(-9, ankle, 60), V(0, 1, 0.2));
    driver.reach("L", V(15, 108, -2));
    driver.reach("R", V(-15, 108, -2));
  }
  const others = [commander, gunner, driver];

  // the loader: standing beside the breech, facing it, his back to his door; `reach` turns him (0.5), then a step
  // toward his door and his hands on the base of the round coming out of the caisson (1)
  const GR = ROUNDS.grab; // [rack, column, row]
  const REST_L = V(18, 97, 14);
  const REST_R = V(-18, 97, 14);
  const tA = new THREE.Vector3();
  const tB = new THREE.Vector3();
  const tC = new THREE.Vector3();
  const toLocal = (out, wx, wy, wz, gx, gy, gz, c, s) => {
    const dx = wx - gx;
    const dz = wz - gz;
    return out.set(dx * c - dz * s, wy - gy, dx * s + dz * c);
  };
  let posedReach = -1;
  let posedGrab = -1;
  function poseLoader(reach, grab) {
    posedReach = reach;
    posedGrab = grab;
    const turn = smooth(0, 0.5, reach);
    const step = smooth(0.5, 1, reach);
    const take = smooth(0.55, 1, reach);
    const th = (CREW.loader.facing + 180 * turn) * DEG; // he turns round by his left, toward +z
    const c = Math.cos(th);
    const s = Math.sin(th);
    const gx = CREW.loader.feet[0] + CREW.loader.step * step;
    const gy = CREW.loader.feet[1];
    const gz = CREW.loader.feet[2] - 14 * step;
    loader.group.position.set(gx, gy, gz);
    loader.group.rotation.y = th;
    loader.lean(16 * take);
    // the base of the round he takes (the caisson's frame is the world's on the tank set), his hands either side of it
    const bx = ROUNDS.base - ROUNDS.pull * grab + 8;
    const by = ROUNDS.rows[GR[2]] - 2;
    const bz = GR[0] * ROUNDS.cols[GR[1]];
    loader.reach("L", tA.copy(REST_L).lerp(toLocal(tC, bx, by, bz - 8, gx, gy, gz, c, s), take));
    loader.reach("R", tB.copy(REST_R).lerp(toLocal(tC, bx, by, bz + 8, gx, gy, gz, c, s), take));
    loader.leg("L", tA.set(8.6, 8 + 7 * Math.sin(Math.PI * step), 16 * step));
    loader.leg("R", tB.set(-8.6, 8, -10 * step));
  }
  poseLoader(0, 0);

  /* ── « une machine »: the other turret, alone like an exhibit (its basket under it, on its shadow), its autoloader ── */
  const other = new THREE.Group();
  other.position.set(...OTHER.at);
  other.rotation.y = OTHER.heading * DEG;
  group.add(other);
  const otherMat = glass(BRAND.ink, { base: 0.022, rim: 0.12, power: 3.2, edge: 0, spec: 0, through: 0.12 });
  const otherGunMat = glass(BRAND.ink, { base: 0.01, rim: 0.4, power: 2.2, edge: 0.6, spec: 0.35 });
  const otherPanes = [];
  const otherList = [];
  const otherPane = (geo, mat = otherMat) => {
    const m = new THREE.Mesh(geo, mat);
    other.add(m);
    otherPanes.push(m);
    return m;
  };
  const O = { x0: -300, x1: 172, roof: ROOF - 9, bulk: -40, under: -46 };
  {
    // a wedge front, sloped steeper than ours, and a much longer rear
    const lo = [[O.x0, 70], [O.x0 + 40, 160], [O.bulk, 150], [O.bulk, -150], [O.x0 + 40, -160], [O.x0, -70]];
    const hi = [[O.x0 + 50, 48], [O.x0 + 75, 138], [O.bulk, 136], [O.bulk, -136], [O.x0 + 75, -138], [O.x0 + 50, -48]];
    const t = loft(lo, hi, TURRET.base, O.roof, { open: [2], caps: [false, true] });
    otherPane(t);
    pushEdges(otherList, t, 20);
    const zb2 = 150 - (14 * (O.under - TURRET.base)) / (O.roof - TURRET.base);
    const bl = [[O.bulk, zb2], [O.x1 - 20, zb2 - 6], [O.x1, zb2 - 30], [O.x1, -(zb2 - 30)], [O.x1 - 20, -(zb2 - 6)], [O.bulk, -zb2]];
    const bh = [[O.bulk, 136], [O.x1 - 18, 130], [O.x1, 106], [O.x1, -106], [O.x1 - 18, -130], [O.bulk, -136]];
    otherPane(loft(bl, bh, O.under, O.roof, { open: [5], caps: [true, true] }));
    bustleEdges(otherList, bl, bh, O.under, O.roof);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([O.bulk, TURRET.base, -150, O.bulk, TURRET.base, 150, O.bulk, O.under, zb2, O.bulk, TURRET.base, -150, O.bulk, O.under, zb2, O.bulk, O.under, -zb2], 3));
    g.computeVertexNormals();
    otherPane(g);
    // the basket a turret lifted out shows, under its ring
    const basket = new THREE.CylinderGeometry(100, 92, 72, 40, 1, true).translate(-150, TURRET.base - 36, 0);
    otherPane(basket);
    pushEdges(otherList, basket, 25);
    // its gun, shorter in this maquette, its mantlet
    const trunnion = [O.x0, -22, 0];
    const mant = new THREE.BoxGeometry(40, 58, 76).translate(O.x0 - 6, -24, 0);
    otherPane(mant);
    pushEdges(otherList, mant, 25);
    const gun = gunGeometry([[GUN.r + 2.2, 26], [GUN.r + 1.6, 200], [GUN.r + 4.6, 200], [GUN.r + 4.6, 252], [GUN.r + 1, 252], [GUN.r + 0.4, 400], [GUN.r + 1.4, 400], [GUN.r + 1.4, 414], [GUN.r - 1.5, 414]], trunnion);
    otherPane(gun, otherGunMat);
    pushEdges(otherList, gun, 30);
    ringXZ(otherList, -140, O.roof + 0.6, -84, 30, 30); // the commander's hatch
  }
  asShell(otherPanes, 20);
  const otherInk = lineMat(BRAND.ink, 2, { opacity: 0, additive: true });
  lines(otherList, otherInk, other);
  const otherShadow = makeContact({ amount: 0 });
  otherShadow.scale.set(560, 360, 1);
  otherShadow.position.set(-110, Y0 - OTHER.at[1] + 0.5, 0);
  other.add(otherShadow);
  // the autoloader, solid: a rack of rounds lying across the rear (two rows, both sides), and the arm
  const metalMats = [];
  const metal = (color, o) => {
    const m = solid(color, o);
    m.transparent = true;
    metalMats.push(m);
    return m;
  };
  const caseMat = metal(0x7a7166, { rough: 0.5, metal: 0.3 });
  const frameMat = metal(0x4c5157, { rough: 0.62, metal: 0.25 });
  const armMat = metal(0xa3a9ae, { rough: 0.72, metal: 0.12 }); // the lightest of the three greys, never a gleam
  {
    const rounds = [];
    for (const s of [1, -1]) {
      for (const y of [-33, -15]) {
        for (let k = 0; k < 7; k++) {
          const g = roundGeometry().rotateX(s * (Math.PI / 2)); // along +z (or −z), base toward the middle
          rounds.push(g.translate(52 + 17 * k, y, s * 30));
        }
      }
    }
    other.add(new THREE.Mesh(mergeGeometries(rounds), caseMat));
    const frame = [];
    for (const s of [1, -1]) {
      frame.push(new THREE.BoxGeometry(124, 3, 100).translate(103, -41, s * 80));
      frame.push(new THREE.BoxGeometry(124, 32, 3).translate(103, -24, s * 27));
    }
    other.add(new THREE.Mesh(mergeGeometries(frame), frameMat));
  }
  const boom = new THREE.Group();
  boom.position.set(...OTHER.arm.pivot);
  other.add(boom);
  {
    const R = OTHER.arm.reach;
    const parts = [
      new THREE.CylinderGeometry(10, 10, 26, 24).translate(0, -6, 0), // the pivot
      new THREE.BoxGeometry(R, 10, 13).translate(-R / 2, -3, 0), //      the arm, toward −x from its pivot
      new THREE.BoxGeometry(50, 5, 18).translate(-R, 2.5, 0), //         the cradle under the round
    ];
    boom.add(new THREE.Mesh(mergeGeometries(parts), armMat));
    // the round it carries, along the arm, its tip outward: at arm 1 the arm points −x and the tip faces the breech
    const held = roundGeometry().rotateZ(Math.PI / 2).translate(-R + ROUNDS.length / 2, 4 + ROUNDS.r, 0);
    boom.add(new THREE.Mesh(held, caseMat));
  }
  const otherCrew = [crewman(), crewman()];
  for (const f of otherCrew) other.add(f.group);
  seat(otherCrew[0], [-140, -122, -76], 46, -90, { lean: 6 });
  seat(otherCrew[1], [-232, -140, -40], 42, -90, { lean: 14, hands: 34 });

  const A = {
    tank: anchor(tank, -150, -60, 0),
    turret: anchor(tank, -130, 0, 0),
    you: anchor(loader.group, 0, 194, 0), //   the loader's head (the chip « Toi »)
    hand: anchor(loader.arms.L.hand, 0, 0, 0),
    crew: anchor(crewGroup, -200, -20, 0),
    driver: anchor(driver.head, 0, 0, 0),
    other: anchor(other, -130, 0, 0),
    arm: anchor(boom, -OTHER.arm.reach, 8, 0),
  };

  return {
    group, A,
    /** Every frame, sixteen times: depends on P, time and the eye only; allocates nothing. */
    update(P, time, px, eye) {
      group.visible = !P.bench;
      if (P.bench) return;
      dress.update(P, time, px, eye);
      const shell = P.shell;
      // the fire breathes, slowly (never a flicker)
      const heat = clamp01(P.heat) * (0.93 + 0.05 * Math.sin(time * 1.7) + 0.02 * Math.sin(time * 4.1 + 1.3));

      /* the tank's glass: thinned when the eye is inside the turret (never a pale slab across a close shot) */
      let thin = 1;
      if (eye) {
        const ox = Math.max(TX0 - 30 - eye.x, eye.x - TX1 - 30, 0);
        const oy = Math.max(TURRET.base - eye.y, eye.y - ROOF - 40, 0);
        const oz = Math.max(Math.abs(eye.z) - HWF - 20, 0);
        thin = 0.35 + 0.65 * smooth(0, 80, Math.hypot(ox, oy, oz));
      }
      tank.visible = shell > 0.003;
      shellMat.uniforms.uAmount.value = shell;
      shellMat.uniforms.uGain.value = thin;
      gunMat.uniforms.uAmount.value = shell;
      bustleMat.uniforms.uAmount.value = shell;
      bustleMat.uniforms.uGain.value = thin * (1 + 0.7 * heat);
      bustleMat.uniforms.uColor.value.copy(INK).lerp(SIGNAL, clamp01(heat * 1.15));
      const toward = smooth(-400, 400, eye ? eye.z : 1000); // 1: the eye on the +z side (the loader's)
      for (const L of lineSets) {
        const k = shell * (L.side === 0 ? 1 : 0.5 + 0.5 * (L.side > 0 ? toward : 1 - toward));
        L.inkFar.opacity = OP * k;
        L.inkNear.opacity = OP * k * (1 - 0.85 * heat);
        L.sigNear.opacity = OPS * k * heat;
      }
      faintMat.opacity = 0.2 * shell;

      /* the ground */
      groundMat.uniforms.uAmount.value = GRID * shell;
      groundMat.uniforms.uHeat.value = heat * shell;
      ground.visible = shell > 0.003;
      contact.material.uniforms.uAmount.value = 0.55 * shell;
      contact.visible = ground.visible;
      horizon.material.opacity = 0.1 * shell;
      horizon.visible = ground.visible;

      /* the crew */
      const c = P.crew;
      crewGroup.visible = c > 0.003;
      for (const f of others) {
        f.body.uniforms.uAmount.value = c;
        f.body.uniforms.uGain.value = 1 - 0.3 * P.you;
      }
      loader.body.uniforms.uAmount.value = c;
      loader.body.uniforms.uGain.value = 1 + 0.9 * P.you;
      const grab = P.grab ?? smooth(0.5, 1, P.reach);
      if (P.reach !== posedReach || grab !== posedGrab) poseLoader(P.reach, grab);

      /* « une machine » */
      const o = P.other;
      other.visible = o > 0.003;
      if (other.visible) {
        otherMat.uniforms.uAmount.value = o;
        otherGunMat.uniforms.uAmount.value = o;
        otherInk.opacity = 0.7 * o; // brighter than ours: it is seen from 30 m
        otherShadow.material.uniforms.uAmount.value = 0.5 * o;
        for (const m of metalMats) m.opacity = o;
        for (const f of otherCrew) f.body.uniforms.uAmount.value = 0.55 * o; // present, but the machine is the subject
        boom.rotation.y = OTHER.arm.turn * DEG * (1 - smooth(0, 1, P.arm));
      }
    },
  };
}
