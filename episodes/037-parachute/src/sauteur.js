// DOSSIER 037 — Le parachute de secours : THE DIVER, aux rayons X, and what leaves the rig.
//   buildDiver() → { group, A, update(p, time, px) }
//   group    added to the scene by world.js, at the origin
//   A        anchors: back (THE RIG RIDES IT: world.js adds the system's root to it), handle, hand, head, canopy, twin
//   update(p, time, px) — p, plain numbers (sixteen times a frame: nothing allocated here):
//     body     you, a body of glass, and the harness (0 hidden: the rig alone, on the ground in the morning)
//     shell    how bright your glass and the canopy's are (0–1)
//     spin     your turn about the vertical, in TURNS (it grows: the acts move it with time; whole number = spin 0)
//     tilt     your head pitched down, degrees (0 flat, belly to earth)
//     hang     0 flat in the fall → 1 upright under the canopy, swung about the shoulders
//     land     0 → 1 down in the field: lying on your side, the canopy collapsed beside you (reads groundY)
//     hand     your right hand drifting by the ripcord handle, open, not taking it (« ta main ne bouge pas ») (0–1)
//     deploy   0 nothing → the pilot chute leaves your back (0.05–0.25), the bag and the lines stretch up (0.25–0.5),
//              the canopy inflates (0.5–0.85), full (1). The flaps are model.js's `flaps` (the act opens them first)
//     twin     the second diver of the principle under his open canopy, at TWIN, pale (0–1)
//     vz       the fall's speed, m/s (the limbs flutter with it; the twin's air is his own)
//     groundY  where the ground is in the scene, cm (world.js: −alt · 100)
//     mood     the light (0 veille → 1 signal)
//
// THE BODY is the kit's glass figure (kit/lib/figure.js), glass from head to hands: the only solids on you are the rig
// (model.js, on `A.back`) and the ripcord handle. It is INERT: the limbs are posed by the air, never by you — in the
// fall they trail toward the sky (the figure's back), under the canopy they hang (its feet), in the field they lie.
// The air shakes the forearms and the shins slowly (a breath, never a tremor).
//
// THE CANOPY lives in `wingPivot`, a child of the spin only: it opens toward the sky whatever your tilt, and the body
// swings under it (`hang`). The points it hangs from (your shoulders, the reserve tray) are anchors on the body, read
// back into its frame every update. The wing is a tube of 29 stations × 28 points of airfoil, re-shaped on the CPU
// only when `deploy` or `land` change (the inflation, the slump on the grass); its ribs and trailing edge are fine
// ink lines, its leading edge veille once it is full (« ce qui te sauve »). Smaller than a real reserve (plan.js).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makeFigure } from "@kit/figure.js";
import { glass, asShell, anchor, solid, fatLine, lineMat, lathe, edgesOf } from "@kit/build3d.js";
import { makeStreaks } from "@kit/postes.js";
import { BODY, CANOPY, TWIN, CONTAINER, PILOT } from "./plan.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ───────────── lines whose ends move (no allocation: the buffer is written in place) ───────────── */
function segs(n, { color = BRAND.ink, width = 1.8, opacity = 0.5, hdr } = {}) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(new Float32Array(n * 6));
  const line = new LineSegments2(geo, lineMat(color, width, { opacity, hdr }));
  line.renderOrder = 3;
  line.frustumCulled = false;
  const buf = geo.attributes.instanceStart.data;
  return { line, arr: buf.array, buf, mat: line.material, base: opacity, n };
}
const put = (arr, k, a, b) => {
  arr[k * 6] = a.x; arr[k * 6 + 1] = a.y; arr[k * 6 + 2] = a.z;
  arr[k * 6 + 3] = b.x; arr[k * 6 + 4] = b.y; arr[k * 6 + 5] = b.z;
};

/* ───────────── THE WING: a ram-air canopy, seven cells ───────────── */
const NS = 29; // span stations: 7 cells × 4, a rib every 4th
const NC = 28; // points around the airfoil (closed): the upper skin from the trailing edge, then the lower one
const HALF = NC / 2;
const RIBS = 8;
const ROWS = [0.07, 0.33, 0.58, 0.84]; // where the lines meet the lower skin, along the chord (A, B, C, D)
const NLINES = RIBS * ROWS.length;
const RISER = 45; // cm of riser above the shoulders, where the lines meet

/** The airfoil at `u` (0 leading edge → 1 trailing edge), in chords: [upper, lower] above the chord line (one shared
 *  pair, read at once: the wing is re-shaped inside update, nothing is allocated there). */
const AF = new Float64Array(2);
function airfoil(u) {
  const t = 0.2;
  const yt = 5 * t * (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u * u + 0.2843 * u * u * u - 0.1015 * u * u * u * u);
  const yc = 0.16 * u * (1 - u);
  AF[0] = yc + yt;
  AF[1] = yc - 0.45 * yt;
  return AF;
}
const LOWER_MID = airfoil(0.5)[1];

/**
 * A wing that inflates (`k` 0 a bundle → 1 full) and slumps (`c` 0 flying → 1 collapsed on the grass). Its own frame:
 * the span along x, the leading edge toward +z, the centre of its lower skin at the origin.
 */
function makeWing({ glassK = 1 } = {}) {
  const half = CANOPY.span / 2;
  const chord = CANOPY.chord;
  const count = NS * NC;
  const pos = new Float32Array(count * 3);
  const nrm = new Float32Array(count * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
  const index = [];
  for (let i = 0; i < NS - 1; i++) {
    for (let j = 0; j < NC; j++) {
      const a = i * NC + j;
      const b = i * NC + ((j + 1) % NC);
      const c = (i + 1) * NC + j;
      const d = (i + 1) * NC + ((j + 1) % NC);
      index.push(a, c, b, b, c, d);
    }
  }
  geo.setIndex(index);
  const mat = glass(BRAND.ink, { base: 0, rim: 0.26 * glassK, power: 2.6, edge: 0.5 * glassK, spec: 0.1 * glassK, through: 0.3 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  asShell([mesh], 16);

  // the ribs and the trailing edge (ink), the leading edge (veille, once full)
  const ink = segs(RIBS * NC + (NS - 1), { width: 1.8, opacity: 0.42 * glassK });
  const lead = segs(NS - 1, { color: BRAND.veille, width: 2.6, opacity: 0.9, hdr: 1.5 });
  mesh.add(ink.line, lead.line);
  const attach = new Float32Array(NLINES * 3); // where each line meets the lower skin (wing frame)
  const top = new THREE.Vector3();

  // the airfoil's parameters along the contour, fixed
  const U = new Float32Array(NC);
  const UP = new Uint8Array(NC);
  for (let j = 0; j < NC; j++) {
    if (j < HALF) { U[j] = 0.5 * (1 + Math.cos((Math.PI * j) / HALF)); UP[j] = 1; } // trailing edge → leading edge, upper
    else { U[j] = 0.5 * (1 - Math.cos((Math.PI * (j - HALF)) / HALF)); UP[j] = 0; } // leading edge → trailing edge, lower
  }

  const st = { L: half, chordK: 1, thick: 1, theta: 30 * DEG, puff: 1, c: 0 };
  const out = new THREE.Vector3();
  /** A point of the skin at span `s` (−1 → 1), chord `u`, upper or lower. */
  function surf(s, u, upper, o) {
    const af = airfoil(u);
    const cell = ((s + 1) / 2) * 7;
    const pinch = Math.abs(Math.sin(Math.PI * cell)); // 0 on a rib, 1 mid-cell
    const y0 = upper ? af[0] * (1 - 0.18 * st.puff * (1 - pinch)) : af[1] * (1 - 0.12 * st.puff * (1 - pinch));
    let h = (y0 - LOWER_MID) * chord * st.chordK * st.thick;
    const th = st.theta;
    const a = s * th;
    const x = th > 1e-4 ? (st.L * Math.sin(a)) / th : st.L * s;
    const yArc = th > 1e-4 ? (st.L * (Math.cos(a) - 1)) / th : 0;
    // collapsed: a crumpled sheet, its folds slow and wide
    if (st.c > 0) h += st.c * (7 * Math.sin(s * 11 + u * 4) + 4 * Math.sin(s * 23 - u * 7 + 1.3) + 3 * Math.cos(u * 9));
    o.set(x + Math.sin(a) * h, yArc + Math.cos(a) * h, (0.5 - u) * chord * st.chordK);
    return o;
  }

  const ea = new THREE.Vector3();
  const eb = new THREE.Vector3();
  const en = new THREE.Vector3();
  const P = (i, j, o) => o.set(pos[(i * NC + j) * 3], pos[(i * NC + j) * 3 + 1], pos[(i * NC + j) * 3 + 2]);
  const pa = new THREE.Vector3();
  const pb = new THREE.Vector3();
  let lastK = -1;
  let lastC = -1;
  function shape(k, c) {
    if (Math.abs(k - lastK) < 1e-5 && Math.abs(c - lastC) < 1e-5) return false;
    lastK = k; lastC = c;
    const spread = smooth(0.12, 0.9, k);
    st.L = half * lerp(0.06, 1, spread);
    st.chordK = lerp(0.3, 1, smooth(0, 0.55, k));
    st.thick = lerp(0.3, 1, smooth(0, 0.7, k)) * (1 + 0.08 * Math.sin(Math.PI * smooth(0.55, 1, k))) * (1 - 0.88 * c);
    st.theta = 30 * DEG * lerp(0.2, 1, spread) * (1 - 0.9 * c);
    st.puff = smooth(0.4, 1, k) * (1 - c);
    st.c = c;
    for (let i = 0; i < NS; i++) {
      const s = -1 + (2 * i) / (NS - 1);
      for (let j = 0; j < NC; j++) {
        surf(s, U[j], UP[j] === 1, out);
        const v = (i * NC + j) * 3;
        pos[v] = out.x; pos[v + 1] = out.y; pos[v + 2] = out.z;
      }
    }
    // normals: across the span × around the airfoil (glass reads |n·v|: the sign does not matter)
    for (let i = 0; i < NS; i++) {
      for (let j = 0; j < NC; j++) {
        P(Math.min(NS - 1, i + 1), j, pa); P(Math.max(0, i - 1), j, pb); ea.subVectors(pa, pb);
        P(i, (j + 1) % NC, pa); P(i, (j + NC - 1) % NC, pb); eb.subVectors(pa, pb);
        en.crossVectors(ea, eb);
        if (en.lengthSq() < 1e-10) en.set(0, 1, 0);
        en.normalize();
        const v = (i * NC + j) * 3;
        nrm[v] = en.x; nrm[v + 1] = en.y; nrm[v + 2] = en.z;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.normal.needsUpdate = true;
    // ribs (every 4th station) and the trailing edge
    let n = 0;
    for (let r = 0; r < RIBS; r++) {
      const i = r * 4;
      for (let j = 0; j < NC; j++) { P(i, j, pa); P(i, (j + 1) % NC, pb); put(ink.arr, n++, pa, pb); }
    }
    for (let i = 0; i < NS - 1; i++) { P(i, 0, pa); P(i + 1, 0, pb); put(ink.arr, n++, pa, pb); }
    ink.buf.needsUpdate = true;
    for (let i = 0; i < NS - 1; i++) { P(i, HALF, pa); P(i + 1, HALF, pb); put(lead.arr, i, pa, pb); }
    lead.buf.needsUpdate = true;
    // where the lines meet the lower skin
    for (let r = 0; r < RIBS; r++) {
      const s = -1 + (2 * r) / (RIBS - 1);
      for (let q = 0; q < ROWS.length; q++) {
        surf(s, ROWS[q], false, out);
        const v = (r * ROWS.length + q) * 3;
        attach[v] = out.x; attach[v + 1] = out.y; attach[v + 2] = out.z;
      }
    }
    surf(0, 0.38, true, top);
    return true;
  }
  shape(1, 0);
  return {
    mesh, mat, ink, lead, attach, top, shape,
    fade(k, leadK) {
      mat.uniforms.uAmount.value = k;
      mesh.visible = k > 0.004;
      ink.mat.opacity = ink.base * k;
      lead.mat.opacity = lead.base * leadK;
      lead.line.visible = leadK > 0.004;
    },
  };
}

/* ───────────── THE PILOT CHUTE: a small dome of glass on its spring ───────────── */
const PC = { r: 36, depth: 24, spring: 28, turns: 6 };
function makePilot() {
  const group = new THREE.Group();
  const prof = [];
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * (Math.PI / 2);
    prof.push([Math.max(0.6, PC.r * Math.cos(a)), PC.depth * Math.sin(a)]);
  }
  const mat = glass(BRAND.ink, { base: 0, rim: 0.36, power: 2.4, edge: 0.6, through: 0.25 });
  const dome = new THREE.Mesh(lathe(prof, 32), mat);
  dome.frustumCulled = false;
  asShell([dome], 15);
  // its gores, a few fine lines from the skirt to the apex
  const gores = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU;
    for (let i = 0; i < 12; i++) {
      const [r0, y0] = prof[i];
      const [r1, y1] = prof[i + 1];
      gores.push([[r0 * Math.sin(a), y0, r0 * Math.cos(a)], [r1 * Math.sin(a), y1, r1 * Math.cos(a)]]);
    }
  }
  const goreGeo = new LineSegmentsGeometry();
  goreGeo.setPositions(gores.flat(2));
  const goreLines = new LineSegments2(goreGeo, lineMat(BRAND.ink, 1.8, { opacity: 0.4 }));
  goreLines.renderOrder = 3;
  goreLines.frustumCulled = false;
  dome.add(goreLines);
  // the spring under it: a helix of unit height, scaled to its length
  const coil = [];
  for (let i = 0; i <= PC.turns * 16; i++) {
    const a = (i / 16) * TAU;
    const r = lerp(PC.r * 0.42, PC.r * 0.22, i / (PC.turns * 16));
    coil.push([r * Math.cos(a), -i / (PC.turns * 16), r * Math.sin(a)]);
  }
  const spring = fatLine(coil, { width: 1.9, opacity: 0.7 });
  spring.frustumCulled = false;
  const springMat = spring.material;
  group.add(dome, spring);
  return {
    group,
    set(len, k) {
      spring.scale.set(1, Math.max(0.3, len), 1);
      mat.uniforms.uAmount.value = k;
      goreLines.material.opacity = 0.4 * k;
      springMat.opacity = 0.7 * k;
      group.visible = k > 0.004;
    },
  };
}

/* ───────────── THE POSES (the figure's own frame: standing, looking +z, +x its left) ───────────── */
// in the fall, the air pushes every limb toward the sky — the figure's back (−z); under the canopy they hang (−y);
// in the field, lying on the right side, they fall forward. The forearms and the shins flutter with the speed.
const POSE = {
  fall: { hand: [V(46, 113, -30), V(-46, 113, -30)], ankle: [V(23, 40, -40), V(-20, 44, -36)], toe: V(0, -0.5, -1), bend: [V(0.6, 0.25, -1), V(-0.6, 0.25, -1)] },
  hang: { hand: [V(21, 90, 7), V(-21, 90, 7)], ankle: [V(10, 9, 5), V(-9, 10, 3)], toe: V(0, -0.85, 1), bend: [V(0.35, -1, -0.1), V(-0.35, -1, -0.1)] },
  lie: { hand: [V(12, 104, 32), V(-8, 98, 30)], ankle: [V(12, 44, 38), V(-10, 30, 26)], toe: V(0, -0.3, 1), bend: [V(0.4, -1, 0.3), V(-0.4, -1, 0.3)] },
};
// the right hand by the handle (BODY.handle: figure (9, 133, 12)), open, beside it toward your middle and a little in
// front: seen from under the chest, the handle on one side, the hand on the other — the hand never covers it
const BY_HANDLE = { at: V(0.5, 129, 19.5), dir: V(0.15, 1, 0.25).normalize(), palm: V(0.05, 0.2, -1).normalize(), bend: V(-0.3, -1, 0.7) };
const HEAD = { rest: V(0, 76.5, 1), limp: V(0, 72.5, 7.5) }; // the head in the torso's frame: it hangs forward

/** Figure coordinates (standing) → the diver's frame (laid face down, see the bouchon's numbers). */
const FIG = { y: -12, z: -111 };

export function buildDiver() {
  const group = new THREE.Group();
  group.name = "diver";
  // spin about y through the origin → tilt about x → land (lying on the side) → hang about the shoulders' line
  const spinG = new THREE.Group();
  const tiltG = new THREE.Group();
  const landG = new THREE.Group();
  const hangPivot = new THREE.Group();
  hangPivot.position.set(...BODY.shoulders);
  const hangG = new THREE.Group();
  const frame = new THREE.Group(); // THE DIVER'S FRAME (plan.js): back up +y, head +z, left +x
  frame.position.set(-BODY.shoulders[0], -BODY.shoulders[1], -BODY.shoulders[2]);
  group.add(spinG);
  spinG.add(tiltG);
  tiltG.add(landG);
  landG.add(hangPivot);
  hangPivot.add(hangG);
  hangG.add(frame);

  /* ── you: glass from head to hands ── */
  const fig = makeFigure({ shell: true, hands: "flat", through: 0.2 });
  fig.ghost(true);
  fig.group.rotation.x = 90 * DEG; // laid face down: up → +z, front → −y, +x stays its left
  fig.group.position.set(0, FIG.y, FIG.z); // the shoulders (standing y ≈ 145) at z 34, the back at y 0
  frame.add(fig.group);
  fig.lean(6, 0, 0); // a body that holds nothing: the trunk a little hunched over the hips

  /* ── the harness: fine ink lines on the trunk (figure frame), rings on the thighs ── */
  const harness = new THREE.Group();
  fig.group.add(harness);
  const strap = (pts) => {
    const l = fatLine(pts, { width: 2.2, opacity: 0.85 });
    l.frustumCulled = false;
    harness.add(l);
    return l;
  };
  for (const sx of [1, -1]) {
    // the main lift web: from the rig's top over the shoulder, down the chest to the hip ring
    strap([[sx * 12, 139, -12], [sx * 13.5, 149, -6], [sx * 13.5, 150.5, 1], [sx * 12, 145, 8.5], [sx * 11, 134, 10.6], [sx * 10.5, 118, 10.2], [sx * 11, 103, 9.6], [sx * 12.5, 93, 8]]);
    // the lateral: from the hip ring around to the rig's bottom
    strap([[sx * 12.5, 93, 8], [sx * 15.5, 92, 1], [sx * 15, 93, -7], [sx * 12, 96, -12]]);
  }
  // the chest strap, across, where the handle rides on the left web
  strap([[-11, 127, 10.6], [-4, 127.5, 11.6], [4, 127.5, 11.6], [11, 127, 10.6]]);
  // the leg straps: a ring on each thigh, riding it (a child of the thigh's own mesh: the capsule runs along its y)
  const ring = [];
  for (let i = 0; i <= 24; i++) ring.push([8 * Math.cos((i / 24) * TAU), 0, 8 * Math.sin((i / 24) * TAU)]);
  const legRings = [];
  for (const s of ["L", "R"]) {
    const thigh = fig.legs[s].thigh.mesh;
    const l = fatLine(ring, { width: 2.2, opacity: 0.85 });
    l.frustumCulled = false;
    l.position.y = -fig.legs[s].thighLen * 0.2; // toward the hip
    thigh.add(l);
    legRings.push(l);
  }

  // the ripcord handle: solid, light metal, small — a D on the left web at the chest
  const handleMat = solid(0xdfe1e3, { rough: 0.34, metal: 0.15 });
  handleMat.emissive.set(0x46443f); // seen from under the chest the key light is behind it: it must still read light
  const handleG = new THREE.Group();
  handleG.position.set(...BODY.handle);
  const dRing = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.8, 12, 32, Math.PI), handleMat);
  const dBar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 6.8, 14), handleMat);
  dBar.rotation.z = Math.PI / 2;
  handleG.add(dRing, dBar);
  // on the chest: the D's bow toward your head and a little out of the chest (−y), its bar across the strap
  handleG.rotation.set(115 * DEG, 0, 0);
  frame.add(handleG);

  const back = new THREE.Group(); // the rig's mount: the diver's frame itself
  frame.add(back);

  // points of the body the canopy hangs from (the diver's frame): the risers at the shoulders, the reserve tray's mouth
  const fz = (y) => y + FIG.z;
  const fy = (z) => FIG.y - z;
  const shL = anchor(frame, 13, fy(-4), fz(150));
  const shR = anchor(frame, -13, fy(-4), fz(150));
  const tray = anchor(frame, PILOT.at[0], CONTAINER.depth + 1, PILOT.at[2]);

  /* ── the canopy, the lines, the bag, the pilot chute: in the sky's frame (spin only) ── */
  const wingPivot = new THREE.Group();
  spinG.add(wingPivot);
  const wing = makeWing();
  wingPivot.add(wing.mesh);
  const lines = segs(NLINES, { width: 1.8, opacity: 0.5 });
  const risers = segs(2, { width: 2.6, opacity: 0.8 });
  const bridle = segs(1, { width: 1.9, opacity: 0.6 });
  wingPivot.add(lines.line, risers.line, bridle.line);
  const pilot = makePilot();
  wingPivot.add(pilot.group);
  // the deployment bag: a soft box of glass with fine edges
  const bagGeo = new THREE.BoxGeometry(24, 15, 18);
  const bagMat = glass(BRAND.ink, { base: 0, rim: 0.34, power: 2.4, edge: 0.55, through: 0.25 });
  const bag = new THREE.Mesh(bagGeo, bagMat);
  bag.frustumCulled = false;
  asShell([bag], 15);
  const bagEdges = edgesOf(bagGeo, { width: 1.9, opacity: 0.6 });
  bag.add(bagEdges);
  wingPivot.add(bag);
  const canopyAt = anchor(wingPivot, 0, CANOPY.lines, 0);

  /* ── the twin: pale, upright under his open canopy, his own slow air ── */
  const twinG = new THREE.Group();
  twinG.position.set(...TWIN.at);
  group.add(twinG);
  const twinSway = new THREE.Group();
  twinG.add(twinSway);
  const tfig = makeFigure({ shell: true, glassK: 0.55, hands: "flat" });
  tfig.ghost(true);
  tfig.group.position.set(0, -145, 0); // his shoulders at TWIN.at
  tfig.reach("L", V(19, 196, -3), V(0.6, 0, -0.6));
  tfig.reach("R", V(-19, 196, -3), V(-0.6, 0, -0.6));
  tfig.leg("L", V(9, 9, 6));
  tfig.leg("R", V(-8, 11, 2));
  twinSway.add(tfig.group);
  for (const sx of [1, -1]) {
    const l = fatLine([[sx * 12, 139, -12], [sx * 13.5, 150, -2], [sx * 12, 145, 8.5], [sx * 11, 120, 10.2], [sx * 12.5, 93, 8]], { width: 1.9, opacity: 0.45 });
    l.frustumCulled = false;
    tfig.group.add(l);
  }
  const twinWing = makeWing({ glassK: 0.7 });
  twinWing.mesh.position.set(0, CANOPY.lines, 0);
  twinWing.mesh.updateMatrix();
  twinSway.add(twinWing.mesh);
  const twinLines = segs(NLINES + 2, { width: 1.8, opacity: 0.32 });
  {
    const a = V(0, 0, 0);
    const b = V(0, 0, 0);
    const rL = V(13, RISER, 0);
    const rR = V(-13, RISER, 0);
    for (let q = 0; q < NLINES; q++) {
      b.fromArray(twinWing.attach, q * 3).applyMatrix4(twinWing.mesh.matrix);
      put(twinLines.arr, q, b.x >= 0 ? rL : rR, b);
    }
    put(twinLines.arr, NLINES, a.set(13, 4, 0), rL);
    put(twinLines.arr, NLINES + 1, a.set(-13, 4, 0), rR);
    twinLines.buf.needsUpdate = true;
  }
  twinSway.add(twinLines.line);
  // his air: short, slow strands rising past him (he comes down at a few metres a second)
  const twinAir = makeStreaks({
    count: 22,
    seed: 37,
    len: 46,
    width: 1.3,
    k: 0.32,
    fill: (i, r) => ({ o: [(r() - 0.5) * 520, -260 + r() * 260, (r() - 0.5) * 420], d: [0, 1, 0], l1: 640 + r() * 220, speed: 500, len: 0.7 + r() * 0.6 }),
  });
  twinG.add(twinAir.mesh);

  /* ── anchors ── */
  const A = {
    back,
    handle: anchor(frame, ...BODY.handle),
    hand: anchor(fig.arms.R.hand, 0, 0, 0),
    head: anchor(fig.head, 0, 0, 0),
    canopy: canopyAt,
    twin: anchor(twinG, 0, CANOPY.lines * 0.5, 0),
  };

  /* ── what update reuses ── */
  const tgt = V(0, 0, 0);
  const bend = V(0, 0, 0);
  const toe = V(0, 0, 0);
  const lay = { dir: V(0, 0, 1), palm: V(0, 0, -1) };
  const pL = V(0, 0, 0);
  const pR = V(0, 0, 0);
  const pT = V(0, 0, 0);
  const mid = V(0, 0, 0);
  const rtL = V(0, 0, 0);
  const rtR = V(0, 0, 0);
  const tmp = V(0, 0, 0);
  const up = V(0, 1, 0);
  const S = V(0, 0, 0);
  const bagAt = V(0, 0, 0);
  const pcAt = V(0, 0, 0);
  const from = V(0, 0, 0);
  const groundAt = V(0, 0, 0);
  const airAt = V(0, 0, 0);
  const q0 = new THREE.Quaternion();
  const q1 = new THREE.Quaternion();
  const e0 = new THREE.Euler();
  const FLUTTER = [[0.53, 1.7], [0.61, 4.1], [0.47, 2.6], [0.57, 5.3]]; // Hz, phase: the right arm, the left, the legs

  /** Blend the three poses into `o` (fall, hang, lie), for limb `k` of a list. */
  const blend = (o, key, k, h, l) => {
    o.copy(POSE.fall[key][k]).lerp(POSE.hang[key][k], h).lerp(POSE.lie[key][k], l);
    return o;
  };

  return {
    group, A,
    update(p, time = 0) {
      const bodyOn = (p.body ?? 1) > 0.01;
      const shell = clamp01(p.shell ?? 1);
      const land = smooth(0, 1, clamp01(p.land ?? 0));
      const hang = clamp01(p.hang ?? 0) * (1 - land);
      const vz = Math.max(0, p.vz ?? 0);
      const groundY = p.groundY ?? 0;

      /* the body's place */
      spinG.rotation.y = (p.spin ?? 0) * TAU;
      tiltG.rotation.x = (p.tilt ?? 0) * DEG * (1 - land);
      hangG.rotation.x = -90 * DEG * hang;
      landG.rotation.z = 90 * DEG * land; // on the right side
      landG.position.y = land > 0 ? (groundY + 24) * land : 0;

      /* you */
      fig.group.visible = bodyOn;
      handleG.visible = bodyOn;
      fig.body.uniforms.uAmount.value = shell;
      if (bodyOn) {
        const air = Math.min(1, vz / 55) * (1 - land); // how hard the air shakes you
        const breath = 0.35 * (1 - land); // and a slow sway that never stops while you hang
        const fl = Math.max(air, breath * hang);
        const handK = smooth(0, 1, clamp01(p.hand ?? 0));
        for (let k = 0; k < 2; k++) {
          const s = k === 0 ? "L" : "R";
          const [hz, ph] = FLUTTER[k];
          const w = TAU * hz * time + ph;
          blend(tgt, "hand", k, hang, land);
          tgt.x += fl * 3.2 * Math.sin(w);
          tgt.y += fl * 2.4 * Math.sin(w * 0.73 + 1.1);
          tgt.z += fl * 4.2 * Math.cos(w * 1.13);
          blend(bend, "bend", k, hang, land);
          if (k === 1 && handK > 0) {
            // the right hand drifts by the handle: still a little moved by the air, never closing on it
            tmp.copy(BY_HANDLE.at);
            tmp.x += 0.8 * Math.sin(w * 0.6);
            tmp.z += 0.9 * Math.cos(w * 0.5);
            tgt.lerp(tmp, handK);
            bend.lerp(BY_HANDLE.bend, handK);
            lay.dir.copy(BY_HANDLE.dir);
            lay.palm.copy(BY_HANDLE.palm);
            fig.reach(s, tgt, bend, handK > 0.5 ? lay : undefined);
          } else {
            fig.reach(s, tgt, bend);
          }
        }
        toe.copy(POSE.fall.toe).lerp(POSE.hang.toe, hang).lerp(POSE.lie.toe, land);
        for (let k = 0; k < 2; k++) {
          const [hz, ph] = FLUTTER[2 + k];
          const w = TAU * hz * time + ph;
          blend(tgt, "ankle", k, hang, land);
          tgt.x += fl * 2.2 * Math.sin(w);
          tgt.z += fl * 3.4 * Math.sin(w * 1.21 + 0.4);
          tgt.y += fl * 1.6 * Math.cos(w * 0.8);
          fig.leg(k === 0 ? "L" : "R", tgt, undefined, toe);
        }
        fig.head.position.copy(HEAD.rest).lerp(HEAD.limp, 1 - 0.4 * land);
      }

      /* the canopy and what pulls it out */
      const dep = clamp01(p.deploy ?? 0);
      const out = dep > 0.05;
      wing.mesh.visible = false;
      lines.line.visible = risers.line.visible = bridle.line.visible = false;
      bag.visible = false;
      pilot.group.visible = false;
      if (out) {
        group.updateMatrixWorld(true);
        pL.setFromMatrixPosition(shL.matrixWorld); wingPivot.worldToLocal(pL);
        pR.setFromMatrixPosition(shR.matrixWorld); wingPivot.worldToLocal(pR);
        pT.setFromMatrixPosition(tray.matrixWorld); wingPivot.worldToLocal(pT);
        mid.addVectors(pL, pR).multiplyScalar(0.5);
        S.copy(mid).addScaledVector(up, CANOPY.lines); // where the canopy's lower skin rides once the lines are tight

        const pay = smooth(0.25, 0.5, dep); // the bag climbs to line stretch
        const k = smooth(0.5, 0.85, dep); // the canopy inflates
        const c = land; // and slumps on the grass
        const fade = shell * smooth(0.05, 0.08, dep);

        // the canopy: in the air above you, or down on the grass beside you
        if (dep >= 0.5) {
          wing.shape(k, c);
          const sway = (1 - land) * smooth(0.85, 1, dep);
          airAt.copy(S);
          groundAt.set(mid.x + 300, groundY + 4, mid.z - 200);
          wing.mesh.position.copy(airAt).lerp(groundAt, land);
          e0.set(sway * 1.6 * DEG * Math.sin(time * 1.3), 0, sway * 1.4 * DEG * Math.sin(time * 0.9 + 0.7));
          q0.setFromEuler(e0);
          e0.set(0, 28 * DEG, 0);
          q1.setFromEuler(e0);
          wing.mesh.quaternion.copy(q0).slerp(q1, land);
          wing.mesh.updateMatrix();
          wing.fade(fade * smooth(0.5, 0.56, dep), shell * smooth(0.8, 1, dep) * (1 - 0.6 * land));
          canopyAt.position.copy(wing.top).applyMatrix4(wing.mesh.matrix);
        } else {
          canopyAt.position.copy(S);
        }

        // the bag: out of the tray, up to line stretch; it opens and lets the canopy go
        bagAt.copy(pT).lerp(S, pay);
        if (dep > 0.25 && dep < 0.56) {
          bag.visible = true;
          bag.position.copy(bagAt).addScaledVector(up, 7.5);
          bagMat.uniforms.uAmount.value = fade * (1 - smooth(0.5, 0.56, dep));
          bagEdges.material.opacity = 0.6 * bagMat.uniforms.uAmount.value;
        }

        // the risers and the lines (from 0.25)
        if (dep > 0.25) {
          const rl = RISER * smooth(0.25, 0.31, dep);
          from.copy(dep >= 0.5 ? wing.mesh.position : bagAt).sub(mid);
          if (from.lengthSq() < 1) from.copy(up);
          from.normalize();
          rtL.copy(pL).addScaledVector(from, rl);
          rtR.copy(pR).addScaledVector(from, rl);
          put(risers.arr, 0, pL, rtL);
          put(risers.arr, 1, pR, rtR);
          risers.buf.needsUpdate = true;
          risers.line.visible = true;
          risers.mat.opacity = risers.base * fade;
          for (let q = 0; q < NLINES; q++) {
            const left = Math.floor(q / ROWS.length) >= RIBS / 2; // the ribs on your left (+x) hang from your left riser
            if (dep >= 0.5) tmp.fromArray(wing.attach, q * 3).applyMatrix4(wing.mesh.matrix);
            else tmp.copy(bagAt);
            put(lines.arr, q, left ? rtL : rtR, tmp);
          }
          lines.buf.needsUpdate = true;
          lines.line.visible = true;
          lines.mat.opacity = lines.base * fade;
        }

        // the pilot chute: leaps off the tray on its spring, climbs, then rides above the canopy
        const leap = smooth(0.05, 0.25, dep);
        const rise = 1 - (1 - leap) * (1 - leap);
        if (dep < 0.25) {
          from.copy(pT);
          pcAt.copy(pT).addScaledVector(up, 18 + 240 * rise);
          pcAt.x += 22 * rise;
          pcAt.z -= 30 * rise;
        } else if (dep < 0.5) {
          from.copy(bagAt).addScaledVector(up, 15);
          pcAt.copy(from).addScaledVector(up, 200);
          pcAt.x += 22;
          pcAt.z -= 30;
        } else {
          from.copy(canopyAt.position);
          pcAt.copy(from).addScaledVector(up, lerp(200, 110, k));
          pcAt.x += 22 * (1 - k);
          pcAt.z -= lerp(30, 70, k);
        }
        const pk = fade * (1 - land) * (1 - 0.35 * smooth(0.85, 1, dep));
        pilot.group.position.copy(pcAt);
        pilot.set(PC.spring * smooth(0.05, 0.075, dep), pk);
        tmp.copy(pcAt).addScaledVector(up, -PC.spring * smooth(0.05, 0.075, dep));
        put(bridle.arr, 0, from, tmp);
        bridle.buf.needsUpdate = true;
        bridle.line.visible = pk > 0.004;
        bridle.mat.opacity = bridle.base * pk;
      } else {
        canopyAt.position.set(0, CANOPY.lines, 0);
      }

      /* the twin */
      const tw = clamp01(p.twin ?? 0);
      twinG.visible = tw > 0.01;
      if (twinG.visible) {
        const k = tw * shell;
        tfig.body.uniforms.uAmount.value = k;
        twinWing.fade(k, 0);
        twinLines.mat.opacity = twinLines.base * k;
        twinSway.rotation.set(1.2 * DEG * Math.sin(time * 0.8), 0, 1.5 * DEG * Math.sin(time * 0.6 + 1));
        twinAir.set(0.9 * tw, time);
      } else {
        twinAir.set(0, time);
      }
    },
  };
}
