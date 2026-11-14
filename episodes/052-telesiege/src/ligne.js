// DOSSIER 052 — Télésiège débrayable : THE CHAIRS AND THE LINE, X-ray. The hero chair (glass, four seats, its
// hanger) and the grip mount where world.js hangs the solid grip (model.js); you, of glass, who sit on it; the other
// chairs in the station and all along the line; the cable out of the station, the towers, the ground that drops
// into a hollow past the mouth and climbs, the far crests, the night sky; the comment's two arrows.
// Where everything stands: plan.js (pathAt). The brief: docs/052-decors.md « ligne.js ». Journal: docs/journal/052-ligne.md.
//
// buildLine() → { group, gripMount, A, update(P, time, px) }
//   group      added to the scene's set by world.js, never moved by it (plan.js coordinates)
//   gripMount  an Object3D in the GRIP FRAME of the hero chair (its cable axis, its travel, its pitch on a climb):
//              world.js parents the grip (model.js) to it in the scene
//   A          anchors (Object3D): seat (the hero chair's seat), rider (your chest), steep (the middle of the steepest
//              span, departure side), exit (just past the mouth, over the hollow), next (the chair behind the hero)
//   update     sixteen times a frame, no allocation; P plain numbers (world.js hands them over):
//     line     the X-ray of the ground, the towers, the line's chairs (0–1); the cable stays solid
//     rope     cm the cable has run (cumulative): the line's chairs ride it, its strands run
//     chair    the hero chair's abscissa (plan.js PATH)
//     free     0 the hero grip on the cable → 1 FREE cm under it (the gap the hook shows): the chair drops with it
//     iso      0 → 1 the hero chair on the side track (plan.js GARAGE)
//     others   0 → 1 the other chairs in the station (three ahead, three behind the hero, at the speeds of their places)
//     rider    0 → 1 you, of glass, there; `sit` 0 standing at the quay's edge → 1 seated, the bar down
//     sway     0 → 1 every chair swings on its grip (the stop): its own phase, from `time`
//     pull     0 → 1 the comment's arrows on the hero chair: red down the cable (what drags it), green up, twice as long
//     greens   0 → 1 the grips of the line's chairs lit veille, from the mouth up, one by one (the like: it runs again)
//
// HOW THE CHAIRS KEEP THEIR PLACES. On the cable every chair is 12 m behind the one before: CHAIR.spacing / CABLE.speed
// = 2.4 s. In the station the tyres slow them to 0.2 of the cable's speed, so the SAME 2.4 s are 2.4 m at the quay. The
// other chairs of the station are placed in time, not in distance: T(s) = ∫ ds / (v·speedAt) is tabled once, and chair
// k sits at T⁻¹(T(hero) + k·2.4 s). They may leave the station by up to 27 m, where they melt away while the line's
// chairs (carried by `rope`, 12 m apart) melt in over the same band: no chair pops into being at the mouth.
// THE CABLE. Same idiom as gare.js: dark steel 0x3a3f45 (metal 0.35), ink strands at 0.35 in a helix, phase =
// (path abscissa − rope) / CABLE.lay, faded to their mean by fwidth before they get finer than ≈ 4 px; under it a
// 1.8 px ink thread for where the tube itself would fall under a pixel. Between towers it sags 1 % of the span (the
// chairs and their grips follow it); it joins the station's cable at the mouth with no sag.
// Three colours: ink is the world; veille the grips that leave well gripped and the comment's green arrow; signal the
// comment's red arrow (what drags the chair down the slope).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, edgesOf, solid, glow, setGlow, box, cyl, anchor, lineMat, fatLine, mergeGeometries, placed } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { rng } from "@kit/rng.js";
import { CABLE, CABLE_Y, CHAIR, FREE, GRIP, LINE, LINE_LEN, PATH, STATION, CAME, SKY, STEEP_X, groundAt, pathAt, speedAt, sArrival, sDeparture, sLine, DEG } from "./plan.js";
import { dressLine } from "./habillage.js"; // the decorator: the firs, the mouth's lamps, the top station, the snow

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => {
  const k = clamp01((v - a) / (b - a));
  return k * k * (3 - 2 * k);
};
const tmp = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0 };

/* ── the line's polyline (the same as plan.js lineAt), for the sag ── */
const LPTS = [[STATION.mouth, CABLE_Y], ...LINE.towers];
const LCUM = [0];
for (let i = 1; i < LPTS.length; i++) LCUM.push(LCUM[i - 1] + Math.hypot(LPTS[i][0] - LPTS[i - 1][0], LPTS[i][1] - LPTS[i - 1][1]));
const SAG = 0.01; // the sag at mid-span, a share of the span
/** The cable's sag at the line's abscissa u (cm from the mouth): writes tmp.sag (cm, ≤ 0) and tmp.dsag (dy/du). */
function sagAt(u) {
  tmp.sag = 0;
  tmp.dsag = 0;
  if (u <= 0) return;
  let i = 1;
  while (i < LPTS.length - 1 && LCUM[i] < u) i++;
  const L = LCUM[i] - LCUM[i - 1];
  const k = (u - LCUM[i - 1]) / L;
  if (k < 0 || k > 1) return;
  tmp.sag = -4 * SAG * L * k * (1 - k);
  tmp.dsag = -4 * SAG * (1 - 2 * k);
}
/** pathAt with the line's sag: the chair at `s` (its grip on the cable), its pitch along the sagging cable. */
function chairAt(s, iso = 0) {
  pathAt(s, tmp, iso);
  if (s > PATH.END) {
    sagAt(s - PATH.END);
    tmp.y += tmp.sag;
    tmp.pitch += Math.atan(tmp.dsag);
  } else if (s < 0) {
    sagAt(-s);
    tmp.y += tmp.sag;
    tmp.pitch -= Math.atan(tmp.dsag);
  }
  return tmp;
}

/** The ground, smoothed (plan.js GROUND is linear between points): towers, the grid and the anchors stand on it. */
const gAt = (x) => (groundAt(x - 260) + 2 * groundAt(x) + groundAt(x + 260)) / 4;

/* ── time along the path: where the other chairs of the station are ── */
const T_STEP = 10;
const T_S0 = -4000;
const T_S1 = PATH.END + 4000;
const T_N = Math.ceil((T_S1 - T_S0) / T_STEP) + 1;
const T_TAB = new Float32Array(T_N);
for (let i = 1; i < T_N; i++) T_TAB[i] = T_TAB[i - 1] + T_STEP / (CABLE.speed * speedAt(T_S0 + (i - 0.5) * T_STEP));
const timeAt = (s) => {
  const f = Math.min(T_N - 1.001, Math.max(0, (s - T_S0) / T_STEP));
  const i = Math.floor(f);
  return T_TAB[i] + (T_TAB[i + 1] - T_TAB[i]) * (f - i);
};
/** The abscissa reached at time `t` (seconds on the table), NaN out of it. */
const sAtTime = (t) => {
  if (t < 0 || t > T_TAB[T_N - 1]) return NaN;
  let lo = 0;
  let hi = T_N - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (T_TAB[mid] <= t) lo = mid;
    else hi = mid;
  }
  return T_S0 + (lo + (t - T_TAB[lo]) / Math.max(1e-6, T_TAB[hi] - T_TAB[lo])) * T_STEP;
};
const GAP_T = CHAIR.spacing / CABLE.speed; // 2.4 s
/** How far the open grip rides under the cable at `s` (the came's ramps, arrival and departure). */
const S_OPEN0 = sArrival(CAME.startX);
const S_CLOSE1 = sDeparture(CAME.stopX);
const dropAt = (s) => FREE * smooth(S_OPEN0, S_OPEN0 + CAME.ramp, s) * (1 - smooth(S_CLOSE1 - CAME.ramp, S_CLOSE1, s));
/** Out of the station by `e` cm: the station's chairs melt away over [1500, 2700], the line's melt in over the same. */
const OUT0 = 1500;
const OUT1 = 2700;

/* ── the chair (chair frame: origin on the grip's hanger point, x the travel, y up, z outward) ── */
const HY = GRIP.hanger[1];
const YS = CHAIR.seatY - HY; //        the seat's middle, under the hanger point (−238)
const W2 = CHAIR.width / 2; //         110
const XB = -56; //                     the hanger's back run, behind the backrest
const HINGE = [XB, YS + 74]; //        the safety bar's hinge (x, y), on both side frames
const BAR_UP = 100 * DEG; //           the bar raised (sit 0)
const SEATS = [-82.5, -27.5, 27.5, 82.5];
const RIDE_Z = 82.5; //                your place: the outer one
// the polylines of the frame (x, y, z), shared by the glass tubes of the hero and the lines of the others
const HANGER = [[0, 0, 0], [0, -92, 0], [-6, -122, 0], [-26, -146, 0], [XB + 2, -164, 0], [XB, -186, 0], [XB, YS + 74, 0]];
const sideFrame = (z) => [[XB, YS + 74, z], [XB + 14, YS - 6, z], [32, YS - 6, z], [35, YS + 3, z]];
const armRest = (z) => [[XB + 6, YS + 34, z], [20, YS + 30, z], [24, YS + 22, z]];
const BEAMS = [[[XB, YS + 74, -W2 - 4], [XB, YS + 74, W2 + 4]], [[XB + 14, YS - 6, -W2 - 4], [XB + 14, YS - 6, W2 + 4]]];
// the bar, around its hinge: side arms to the front corner, the cross bar, the footrest
const BAR_C = [96, -46];
const BAR_F = [112, -104];
const barArm = (z) => [[0, 0, z], [BAR_C[0] * 0.55, BAR_C[1] * 0.2 + 4, z], [BAR_C[0], BAR_C[1], z]];
const BAR_X = [[BAR_C[0], BAR_C[1], -W2 - 6], [BAR_C[0], BAR_C[1], W2 + 6]];
const footStem = (z) => [[BAR_C[0], BAR_C[1], z], [BAR_F[0], BAR_F[1], z]];
const FOOT = [[BAR_F[0], BAR_F[1], -78], [BAR_F[0], BAR_F[1], 78]];

const tubeAlong = (pts, r, smoothCurve = false, radial = 10) => {
  const v = pts.map(([x, y, z]) => V(x, y, z));
  let curve;
  if (smoothCurve) curve = new THREE.CatmullRomCurve3(v, false, "centripetal", 0.5);
  else {
    curve = new THREE.CurvePath();
    for (let i = 1; i < v.length; i++) curve.add(new THREE.LineCurve3(v[i - 1], v[i]));
  }
  return new THREE.TubeGeometry(curve, smoothCurve ? 48 : Math.max(4, (v.length - 1) * 6), r, radial, false);
};
/** Segments [x,y,z, x,y,z, …] of polylines, and of the 12 edges of boxes (w, h, d, centre, tilt about z). */
const pushPoly = (out, pts) => {
  for (let i = 1; i < pts.length; i++) out.push(...pts[i - 1], ...pts[i]);
};
const pushBox = (out, w, h, d, cx, cy, cz, tilt = 0) => {
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  const p = (x, y, z) => [cx + x * c - y * s, cy + x * s + y * c, cz + z];
  const X = w / 2;
  const Y = h / 2;
  const Z = d / 2;
  const k = [p(-X, -Y, -Z), p(X, -Y, -Z), p(X, Y, -Z), p(-X, Y, -Z), p(-X, -Y, Z), p(X, -Y, Z), p(X, Y, Z), p(-X, Y, Z)];
  for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) out.push(...k[a], ...k[b]);
};
const segLines = (flat, color, width, opacity) => {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(flat);
  const obj = new LineSegments2(geo, lineMat(color, width, { opacity }));
  obj.renderOrder = 2;
  return obj;
};
const BACK_TILT = 12 * DEG; // the backrest leans back
const BACK = { x: -42, y: YS + 38, h: 62 };

/** The hero chair: glass tubes and eight cushions (the four places read), their edges; the bar on its hinge. */
function heroChairGeo() {
  const g = new THREE.Group();
  const mat = glass(BRAND.ink, { base: 0, rim: 0.38, power: 2.6, edge: 0.45, spec: 0.12, through: 0.28 });
  const panes = [];
  const add = (geo, m = mat, parent = g) => {
    const mesh = new THREE.Mesh(geo, m);
    parent.add(mesh);
    panes.push(mesh);
    return mesh;
  };
  add(tubeAlong(HANGER, 3.6, true, 12));
  for (const b of BEAMS) add(tubeAlong(b, 2.6));
  for (const z of [-W2 - 4, W2 + 4]) {
    add(tubeAlong(sideFrame(z), 2.4));
    add(tubeAlong(armRest(z), 2));
  }
  const edges = [];
  for (const z of SEATS) {
    const seat = add(box(64, 8, 51, 2.5));
    seat.position.set(-2, YS, z);
    const back = add(box(6, BACK.h, 51, 2.2));
    back.position.set(BACK.x, BACK.y, z);
    back.rotation.z = BACK_TILT;
    pushBox(edges, 64, 8, 51, -2, YS, z);
    pushBox(edges, 6, BACK.h, 51, BACK.x, BACK.y, z, BACK_TILT);
  }
  g.add(segLines(edges, BRAND.ink, 1.8, 0.3));
  // the bar, on its hinge
  const bar = new THREE.Group();
  bar.position.set(HINGE[0], HINGE[1], 0);
  for (const z of [-W2 - 8, W2 + 8]) add(tubeAlong(barArm(z), 2.2, true, 10), mat, bar);
  add(tubeAlong(BAR_X, 2.2), mat, bar);
  for (const z of [-50, 50]) add(tubeAlong(footStem(z), 1.8), mat, bar);
  add(tubeAlong(FOOT, 2), mat, bar);
  g.add(bar);
  asShell(panes, 20);
  return { g, mat, bar };
}

/** The other chairs: one shared glass body and one shared set of frame lines (the bar raised), own materials each. */
const OTHER_GEO = (() => {
  const parts = [placed(box(64, 8, CHAIR.width, 2.5), { pos: [-2, YS, 0] }), placed(box(6, BACK.h, CHAIR.width, 2.2), { pos: [BACK.x, BACK.y, 0], rotZ: BACK_TILT })];
  parts.push(tubeAlong(HANGER, 3.4, true, 8));
  return mergeGeometries(parts.map((p) => p.toNonIndexed ? (p.index ? p.toNonIndexed() : p) : p).map((p) => {
    for (const k of Object.keys(p.attributes)) if (!["position", "normal"].includes(k)) p.deleteAttribute(k);
    return p;
  }));
})();
const OTHER_LINES = (() => {
  const out = [];
  pushPoly(out, HANGER);
  for (const b of BEAMS) pushPoly(out, b);
  for (const z of [-W2 - 4, W2 + 4]) {
    pushPoly(out, sideFrame(z));
    pushPoly(out, armRest(z));
  }
  pushBox(out, 64, 8, CHAIR.width, -2, YS, 0);
  pushBox(out, 6, BACK.h, CHAIR.width, BACK.x, BACK.y, 0, BACK_TILT);
  for (let i = 1; i < 4; i++) pushPoly(out, [[-34, YS + 4.2, -W2 + 55 * i], [30, YS + 4.2, -W2 + 55 * i]]);
  // the bar, raised: turned about its hinge
  const c = Math.cos(BAR_UP);
  const s = Math.sin(BAR_UP);
  const turn = (pts) => pts.map(([x, y, z]) => [HINGE[0] + x * c - y * s, HINGE[1] + x * s + y * c, z]);
  for (const z of [-W2 - 8, W2 + 8]) pushPoly(out, turn(barArm(z)));
  pushPoly(out, turn(BAR_X));
  pushPoly(out, turn(FOOT));
  const geo = new LineSegmentsGeometry();
  geo.setPositions(out);
  return geo;
})();
/** A simple solid grip for the other chairs (no detail) and its veille light. */
const GRIP_GEO = mergeGeometries([placed(box(GRIP.len, 16, 14, 1.5), { pos: [0, -6, 4] }), placed(box(30, 10, 10, 1), { pos: [-20, 10, 12] }), placed(box(14, 30, 10, 1), { pos: [0, -26, 0] })].map((p) => {
  for (const k of Object.keys(p.attributes)) if (!["position", "normal"].includes(k)) p.deleteAttribute(k);
  return p.index ? p.toNonIndexed() : p;
}));
const LIT_GEO = box(GRIP.len * 1.08, 19, 17, 2);

function otherChair(order) {
  const pivot = new THREE.Group(); //  on the cable (position, yaw)
  const gripG = new THREE.Group(); //  its pitch
  const hang = new THREE.Group(); //   the chair, plumb, swinging
  const gm = glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.4, edge: 0.4 });
  const body = new THREE.Mesh(OTHER_GEO, gm);
  body.renderOrder = order;
  const lines = new LineSegments2(OTHER_LINES, lineMat(BRAND.ink, 1.8, { opacity: 0.32 }));
  lines.renderOrder = 2;
  hang.add(body, lines);
  const sm = solid(0x2c3238, { rough: 0.6, metal: 0.3 });
  sm.transparent = true;
  const grip = new THREE.Mesh(GRIP_GEO, sm);
  const lit = glow(BRAND.veille, 0);
  const litMesh = new THREE.Mesh(LIT_GEO, lit);
  litMesh.position.set(0, -6, 4);
  litMesh.visible = false;
  gripG.add(grip, litMesh);
  pivot.add(gripG, hang);
  return { pivot, gripG, hang, gm, lines, sm, lit, litMesh, base: 0.32 };
}

/** Place a chair: its grip `drop` cm under the cable at `s`, its chair hanging plumb from the hanger point. */
function placeChair(c, s, drop, iso, swing) {
  chairAt(s, iso);
  c.pivot.position.set(tmp.x, tmp.y - drop, tmp.z);
  c.pivot.rotation.set(0, tmp.yaw, 0);
  const p = tmp.pitch;
  c.gripG.rotation.z = p;
  c.hang.position.set(-HY * Math.sin(p), HY * Math.cos(p), 0);
  c.hang.rotation.set(0, 0, swing);
  return p;
}
function fadeChair(c, a) {
  c.pivot.visible = a > 0.01;
  c.gm.uniforms.uAmount.value = a;
  c.lines.material.opacity = c.base * a;
  c.sm.opacity = a;
  c.sm.depthWrite = a > 0.99;
}

/* ── the cable on the line: a tube of its own, the path abscissa in an attribute (the strands' phase) ── */
function cableGeo(side) {
  const pos = [];
  const nor = [];
  const sAt = [];
  const ang = [];
  const RAD = 10;
  const samples = [];
  const top = LINE_LEN + 0.2 * (LCUM[LCUM.length - 1] - LCUM[LCUM.length - 2]);
  for (let i = 1; i < LCUM.length + 1; i++) {
    const u0 = LCUM[i - 1];
    const u1 = i < LCUM.length ? LCUM[i] : top;
    const n = Math.max(2, Math.ceil((u1 - u0) / 120));
    for (let j = i === 1 ? 0 : 1; j <= n; j++) samples.push(u0 + ((u1 - u0) * j) / n);
  }
  const P = samples.map((u) => {
    chairAt(side > 0 ? PATH.END + u : -u);
    return V(tmp.x, tmp.y, tmp.z);
  });
  const T = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < P.length; i++) {
    T.subVectors(P[Math.min(P.length - 1, i + 1)], P[Math.max(0, i - 1)]).normalize();
    N.set(-T.y, T.x, 0).normalize();
    const s = side > 0 ? PATH.END + samples[i] : -samples[i];
    for (let k = 0; k <= RAD; k++) {
      const a = (k / RAD) * Math.PI * 2;
      const dx = Math.cos(a) * N.x + Math.sin(a) * B.x;
      const dy = Math.cos(a) * N.y + Math.sin(a) * B.y;
      const dz = Math.cos(a) * N.z + Math.sin(a) * B.z;
      pos.push(P[i].x + CABLE.r * dx, P[i].y + CABLE.r * dy, P[i].z + CABLE.r * dz);
      nor.push(dx, dy, dz);
      sAt.push(s);
      ang.push(k / RAD);
    }
  }
  const idx = [];
  for (let i = 0; i < P.length - 1; i++)
    for (let k = 0; k < RAD; k++) {
      const a = i * (RAD + 1) + k;
      const b = a + RAD + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("aS", new THREE.Float32BufferAttribute(sAt, 1));
  geo.setAttribute("aA", new THREE.Float32BufferAttribute(ang, 1));
  geo.setIndex(idx);
  return { geo, P };
}
function cableMat() {
  const mat = solid(0x3a3f45, { rough: 0.5, metal: 0.35 });
  mat.userData.finish = false; // its strands are its surface
  const uRope = { value: 0 };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRope = uRope;
    shader.uniforms.uLay = { value: CABLE.lay };
    shader.uniforms.uInk = { value: new THREE.Color(BRAND.ink) };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aS; attribute float aA; varying float vS; varying float vA;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvS = aS; vA = aA;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uRope, uLay; uniform vec3 uInk; varying float vS; varying float vA;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float ph = (vS - uRope) / uLay + vA;
        float aa = fwidth(ph);
        float f = abs(fract(ph) - 0.5);
        float st = 1.0 - smoothstep(0.09, 0.09 + max(aa, 1e-4) * 1.4, f);
        float vis = 1.0 - smoothstep(0.12, 0.28, aa);
        float strand = mix(0.2, st, vis);
        diffuseColor.rgb = mix(diffuseColor.rgb, uInk, 0.35 * strand);`,
      )
      // the night is dark: the strands also carry a little light of their own, or they vanish on the steel
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n totalEmissiveRadiance += uInk * 0.09 * strand;");
  };
  mat.customProgramCacheKey = () => "sd052-cable";
  return { mat, uRope };
}

/* ── the ground: a grid of glass over the smoothed profile, open where the station stands ── */
function groundMesh() {
  const X0 = -5000;
  const X1 = 27000;
  const Z = 9000;
  const geo = new THREE.PlaneGeometry(X1 - X0, 2 * Z, 320, 72);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + (X0 + X1) / 2;
    const z = p.getZ(i);
    const az = Math.abs(z);
    // across, the slope rises a little away from the line (a corridor cut in the mountain), with slow folds
    const lift = 0.08 * Math.max(0, az - 1400) + 160 * Math.sin(x / 2300 + z / 1700) * smooth(1400, 3200, az);
    p.setXYZ(i, x, gAt(x) + (x > STATION.mouth ? lift : lift * smooth(STATION.x0 - 2000, STATION.mouth, x)), z);
  }
  geo.computeVertexNormals();
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(BRAND.ink) }, uAmount: { value: 1 }, uHalf: { value: STATION.half + 30 }, uX0: { value: STATION.x0 - 40 }, uX1: { value: STATION.mouth } },
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vV = cameraPosition - w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uHalf, uX0, uX1;
      varying vec3 vW; varying vec3 vN; varying vec3 vV;
      float grid(vec2 c) {
        vec2 fw = max(fwidth(c), vec2(1e-5));
        vec2 g = abs(fract(c - 0.5) - 0.5) / fw;
        float l = 1.0 - min(min(g.x, g.y) / 1.2, 1.0);
        // a cell under a few pixels melts into its mean, it never crawls
        return l * (1.0 - smoothstep(0.12, 0.34, max(fw.x, fw.y)));
      }
      void main() {
        if (uAmount < 0.003) discard;
        if (abs(vW.z) < uHalf && vW.x > uX0 && vW.x < uX1) discard; // the station has its own floor
        float dist = length(vV);
        vec3 v = vV / max(dist, 1.0);
        float facing = abs(dot(normalize(vN), v));
        float rim = pow(clamp(1.0 - facing, 0.0, 1.0), 3.0);
        float fine = grid(vW.xz / 500.0);
        float coarse = grid(vW.xz / 2500.0);
        float far = exp(-dist / 60000.0);
        float k = (0.008 + 0.02 * rim) + (0.15 * fine + 0.2 * coarse) * far;
        gl_FragColor = vec4(uColor * k * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 5;
  return { mesh, mat };
}

/* ── the towers: a tube, its head, a train of sheaves under each cable — glass and fine lines ── */
function towers(towerMat, towerLines) {
  const g = new THREE.Group();
  const edges = [];
  for (let i = 0; i < LINE.towers.length; i++) {
    const [x, top] = LINE.towers[i];
    const base = gAt(x) - 120;
    const headY = top + 90;
    const h = headY - base;
    const shaft = new THREE.Mesh(cyl(38, h, 3, 28, 28), towerMat);
    shaft.position.set(x, base + h / 2, 0);
    const foot = new THREE.Mesh(box(150, 60, 150, 4), towerMat);
    foot.position.set(x, base + 120, 0);
    const arm = new THREE.Mesh(box(60, 46, 2 * 260 + 200, 4), towerMat);
    arm.position.set(x, headY, 0);
    g.add(shaft, foot, arm);
    pushBox(edges, 60, 46, 720, x, headY, 0);
    pushBox(edges, 150, 60, 150, x, base + 120, 0);
    pushPoly(edges, [[x - 38, base + 150, 38], [x - 38, headY - 23, 38]]);
    pushPoly(edges, [[x + 38, base + 150, -38], [x + 38, headY - 23, -38]]);
    // the sheave train under each cable, along the mean of its two spans' slopes
    const [px, py] = LPTS[i];
    const [nx, ny] = LPTS[i + 2] ?? [x + 4000, top + (top - py) * 0.6];
    const tilt = (Math.atan2(top - py, x - px) + Math.atan2(ny - top, nx - x)) / 2;
    const c = Math.cos(tilt);
    const s = Math.sin(tilt);
    for (const side of [-1, 1]) {
      const z = side * 260;
      const axY = top - CABLE.r - 15; // the cable rests on the sheaves' tops
      const beam = new THREE.Mesh(box(300, 12, 8, 2), towerMat);
      beam.position.set(x, axY, z + side * 14);
      beam.rotation.z = tilt;
      const post = new THREE.Mesh(box(14, headY - 23 - axY, 14, 2), towerMat);
      post.position.set(x, (headY - 23 + axY) / 2, z + side * 14);
      g.add(beam, post);
      pushBox(edges, 300, 12, 8, x, axY, z + side * 14, tilt);
      for (let k = 0; k < 6; k++) {
        const d = -125 + 50 * k;
        const sh = new THREE.Mesh(cyl(15, 7, 1.5, 24), towerMat);
        sh.rotation.x = Math.PI / 2;
        sh.position.set(x + d * c, axY + d * s, z);
        g.add(sh);
      }
    }
  }
  g.add(segLines(edges, BRAND.ink, 1.8, 1));
  towerLines.push(g.children[g.children.length - 1]);
  return g;
}

/* ── the sky: a dome at infinity, ADDED to the stage's background (which carries the mood); the crests ── */
function sky() {
  const g = new THREE.Group();
  const domeMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    fog: false,
    uniforms: { uColor: { value: new THREE.Color(BRAND.ink) } },
    vertexShader: /* glsl */ `
      varying vec3 vD;
      void main() { vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vD;
      void main() {
        vec3 d = normalize(vD);
        float e = d.y;
        // a cold horizon, brighter up the line (+x), black overhead; nothing under the horizon
        float band = exp(-max(e + 0.01, 0.0) * 9.0) * smoothstep(-0.06, 0.0, e);
        float k = 0.004 + band * (0.055 + 0.035 * max(d.x, 0.0));
        gl_FragColor = vec4(uColor * k, 1.0);
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(SKY.r, 64, 32), domeMat);
  dome.position.set(11000, 0, 0);
  dome.renderOrder = -20;
  g.add(dome);
  // the crests: jagged rings of ink lines; under each, a curtain that writes depth only (the sky ends on the crest)
  const rand = rng(52);
  const hide = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide, fog: false });
  const ops = [0.34, 0.24, 0.16];
  SKY.crests.forEach(([r, h], ci) => {
    const n = 420;
    const ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28, rand() * 6.28];
    const pts = [];
    const curtain = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const ridge = 1 - Math.abs(Math.sin(a * 7 + ph[0]) * 0.6 + Math.sin(a * 17 + ph[1]) * 0.3 + Math.sin(a * 41 + ph[2]) * 0.1);
      const swell = 0.5 + 0.5 * Math.sin(a * 3 + ph[3]);
      const y = h * (0.35 + 0.4 * ridge * ridge + 0.25 * swell);
      const x = 11000 + r * Math.cos(a);
      const z = r * Math.sin(a);
      pts.push([x, y, z]);
      curtain.push(x, y, z, x, -40000, z);
    }
    const line = fatLine(pts, { color: BRAND.ink, width: 2, opacity: ops[ci] ?? 0.14 });
    g.add(line);
    const cg = new THREE.BufferGeometry();
    cg.setAttribute("position", new THREE.Float32BufferAttribute(curtain, 3));
    const idx = [];
    for (let i = 0; i < n; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
    cg.setIndex(idx);
    const cm = new THREE.Mesh(cg, hide);
    cm.renderOrder = -30;
    g.add(cm);
  });
  return g;
}

/* ── the comment's arrows: a shaft and a head of light, along +x of their group ── */
function arrow(color) {
  const g = new THREE.Group();
  const m = glow(color, 1.25);
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(1, 7, 7), m);
  const head = new THREE.Mesh(new THREE.ConeGeometry(12, 28, 20), m);
  head.rotation.z = -Math.PI / 2;
  g.add(shaft, head);
  g.userData = { shaft, head };
  return g;
}
const setArrow = (a, len) => {
  const { shaft, head } = a.userData;
  shaft.scale.x = Math.max(0.01, len);
  shaft.position.x = len / 2;
  head.position.x = len + 13;
};

export function buildLine() {
  const group = new THREE.Group();
  group.add(sky());
  const dress = dressLine(); group.add(dress.group);

  // the ground and its profile under each cable (the hollow reads from any side)
  const ground = groundMesh();
  group.add(ground.mesh);
  const profiles = [];
  for (const z of [-260, 260]) {
    const pts = [];
    for (let x = STATION.mouth; x <= LINE.top + 2000; x += 100) pts.push([x, gAt(x) + 3, z]);
    const l = fatLine(pts, { color: BRAND.ink, width: 2, opacity: 0.4 });
    profiles.push(l);
    group.add(l);
  }
  // the towers
  const towerMat = glass(BRAND.ink, { base: 0, rim: 0.34, power: 2.4, edge: 0.5 });
  const towerLines = [];
  group.add(towers(towerMat, towerLines));

  // the cable on the line, both sides; its thread for the distance
  const cable = cableMat();
  const threads = [];
  for (const side of [-1, 1]) {
    const { geo, P } = cableGeo(side);
    group.add(new THREE.Mesh(geo, cable.mat));
    const th = fatLine(P.map((p) => [p.x, p.y, p.z]), { color: BRAND.ink, width: 1.8, opacity: 0.3 });
    threads.push(th);
    group.add(th);
  }

  // the hero chair: a pivot on the grip (position, yaw), the grip mount (pitch), the chair hanging plumb (sway)
  const heroPivot = new THREE.Group();
  const gripMount = new THREE.Group();
  const hero = heroChairGeo();
  heroPivot.add(gripMount, hero.g);
  group.add(heroPivot);

  // you, of glass from head to hands: a rig in the world (standing at the quay) or on your place (seated)
  const fig = makeFigure({ shell: true, hands: "flat", order: 12, through: 0.2 });
  fig.ghost(true);
  fig.group.rotation.y = Math.PI / 2; // it looks the way the chair travels
  const riderRig = new THREE.Group();
  const riderSway = new THREE.Group();
  riderSway.add(fig.group);
  riderRig.add(riderSway);
  group.add(riderRig);
  const STAND = [STATION.board + 34, 0, CHAIR_Z(RIDE_Z)];
  const SEAT_O = [-14, YS + 13 - fig.HIP, RIDE_Z]; // the figure's origin seated (its hips on the cushion), chair frame
  const ankle = { L: V(0, 0, 0), R: V(0, 0, 0) };
  const hand = { L: V(0, 0, 0), R: V(0, 0, 0) };
  let posed = -1;
  const poseRider = (k, bar) => {
    if (Math.abs(k - posed) < 1e-4 && posed >= 0) return;
    posed = k;
    for (const [s, sd] of [["L", 1], ["R", -1]]) {
      ankle[s].set(sd * (8.6 + 1.6 * k), 8 + 40 * k, 50 * k);
      fig.leg(s, ankle[s]);
    }
    fig.lean(-7 * k);
    // the hands: hanging → on the thighs → on the bar as it comes down
    for (const [s, sd] of [["L", 1], ["R", -1]]) {
      hand[s].set(sd * (20.5 - 4 * k), 92 + 6 * k + 6 * bar, 3 + 28 * k + 18 * bar);
      fig.reach(s, hand[s]);
    }
  };

  // the other chairs: three ahead and three behind the hero (by time), and the line's (by the rope)
  const OTH = [-3, -2, -1, 1, 2, 3];
  const others = OTH.map(() => otherChair(18));
  const N_LINE = Math.ceil(LINE_LEN / CHAIR.spacing);
  const ups = [];
  const downs = [];
  for (let i = 0; i < N_LINE; i++) {
    ups.push(otherChair(18));
    downs.push(otherChair(18));
  }
  for (const c of [...others, ...ups, ...downs]) group.add(c.pivot);

  // the comment's arrows, along the cable over the hero grip (outside it, toward a camera on the departure side)
  const red = arrow(BRAND.signal);
  red.rotation.y = Math.PI; // down the cable
  red.position.set(-36, 46, 22);
  const green = arrow(BRAND.veille);
  green.position.set(36, 46, 22);
  gripMount.add(red, green);

  chairAt(sLine(STEEP_X));
  const steepY = tmp.y;
  const A = {
    seat: anchor(hero.g, 0, YS + 10, 0),
    rider: anchor(fig.group, 0, 132, 4),
    steep: anchor(group, STEEP_X, steepY, 260),
    exit: anchor(group, STATION.mouth + 400, gAt(STATION.mouth + 400), 260),
    next: anchor(others[2].hang, 0, YS + 10, 0),
  };

  const swingOf = (P, time, ph) => P.sway * 9 * DEG * Math.sin(time * 2.02 + ph) * (0.75 + 0.25 * Math.sin(ph * 3.1));
  const last = { line: -1 };

  return {
    group, gripMount, A,
    update(P, time, px) {
      const L = P.line; dress.update(P, time, px);
      if (L !== last.line) {
        last.line = L;
        ground.mat.uniforms.uAmount.value = L;
        towerMat.uniforms.uAmount.value = L;
        for (const t of towerLines) t.material.opacity = 0.38 * L;
        for (const p of profiles) p.material.opacity = 0.4 * L;
      }
      cable.uRope.value = P.rope;

      // the hero
      const drop = FREE * P.free;
      chairAt(P.chair, P.iso);
      heroPivot.position.set(tmp.x, tmp.y - drop, tmp.z);
      heroPivot.rotation.set(0, tmp.yaw, 0);
      const yaw = tmp.yaw;
      const pitch = tmp.pitch;
      gripMount.rotation.z = pitch;
      const hx = -HY * Math.sin(pitch);
      const hy = HY * Math.cos(pitch);
      hero.g.position.set(hx, hy, 0);
      const sw = swingOf(P, time, 0.4);
      hero.g.rotation.set(0, 0, sw);
      const sit = clamp01(P.sit);
      const barK = smooth(0.62, 1, sit);
      hero.bar.rotation.z = BAR_UP * (1 - barK);

      // you
      riderRig.visible = P.rider > 0.01;
      if (riderRig.visible) {
        fig.body.uniforms.uAmount.value = P.rider;
        const e = smooth(0, 1, sit);
        // seated: your place in the chair frame → the pivot's frame (the swing about the hanger point) → the world
        const cs = Math.cos(sw);
        const sn = Math.sin(sw);
        const qx = hx + SEAT_O[0] * cs - SEAT_O[1] * sn;
        const qy = hy + SEAT_O[0] * sn + SEAT_O[1] * cs;
        const qz = SEAT_O[2];
        const cy = Math.cos(yaw);
        const sy = Math.sin(yaw);
        const wx = heroPivot.position.x + qx * cy + qz * sy;
        const wy = heroPivot.position.y + qy;
        const wz = heroPivot.position.z - qx * sy + qz * cy;
        riderRig.position.set(STAND[0] + (wx - STAND[0]) * e, STAND[1] + (wy - STAND[1]) * e, STAND[2] + (wz - STAND[2]) * e);
        riderRig.rotation.set(0, yaw * e, 0);
        riderSway.rotation.set(0, 0, sw * e);
        poseRider(e, barK);
      }

      // the comment's arrows
      const pl = clamp01(P.pull);
      red.visible = pl > 0.01; green.visible = pl > 0.5;
      if (red.visible) {
        setArrow(red, 90 * clamp01(pl * 2));
        setArrow(green, 180 * clamp01(pl * 2 - 1));
      }

      // the station's others, placed in time around the hero
      const heroIn = P.chair > T_S0 && P.chair < T_S1;
      const t0 = timeAt(P.chair);
      for (let i = 0; i < OTH.length; i++) {
        const c = others[i];
        const s = heroIn ? sAtTime(t0 + OTH[i] * GAP_T) : NaN;
        if (!(s === s)) {
          c.pivot.visible = false;
          continue;
        }
        const out = s < 0 ? -s : s > PATH.END ? s - PATH.END : 0;
        const a = P.others * (1 - smooth(OUT0, OUT1, out));
        fadeChair(c, a);
        if (a <= 0.01) continue;
        placeChair(c, s, dropAt(s), 0, swingOf(P, time, 1.3 + i * 1.9));
      }

      // the line's chairs, riding the rope: departure (up) and arrival (down)
      const front = clamp01(P.greens) * (LINE_LEN + 2400) - 600;
      const heroOut = P.chair < 0 || P.chair > PATH.END;
      for (let i = 0; i < N_LINE; i++) {
        const u = (((P.rope + i * CHAIR.spacing) % LINE_LEN) + LINE_LEN) % LINE_LEN;
        for (let side = 0; side < 2; side++) {
          const c = side === 0 ? ups[i] : downs[i];
          const uu = side === 0 ? u : LINE_LEN - u; // from the mouth
          const s = side === 0 ? PATH.END + uu : -uu;
          let a = L * smooth(OUT0, OUT1, uu) * (1 - smooth(LINE_LEN - 900, LINE_LEN - 100, uu));
          if (heroOut) a *= smooth(420, 900, Math.abs(s - P.chair));
          fadeChair(c, a);
          if (a <= 0.01) continue;
          placeChair(c, s, 0, 0, swingOf(P, time, i * 1.7 + side * 2.3));
          const g = side === 0 ? smooth(0, 600, front - uu) : 0;
          c.litMesh.visible = g > 0.01;
          if (c.litMesh.visible) setGlow(c.lit, 1.5 * g);
        }
      }
    },
  };
}

/** Your place across, in world z on the departure side (the chair's local z is outward = +z there). */
function CHAIR_Z(z) {
  return 260 + z;
}
