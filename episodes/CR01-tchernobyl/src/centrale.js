// CR01 — centrale.js : the plant on a table, ≈ 1:50 (plan.js PLANT) — « la reconstitution » V3, le noir chaud (docs/reconstitution.md).
// A maquette in satin clay, under the studio key; the ONE part in fault (the emergency-cooling valve) in alarm red; what WORKS in green
// when the acts light `ok` (the safety systems: ECCS tanks and pipes, the diesels; the light that runs in the pipes turns green too).
//
//   buildCentrale() → { group, A, haloR, update(S, time, px) }
//   A: focus, fault (the valve), reactor, pumps, turbine, generator, diesels, eccs, mains (+ flywheel, transformer, board)
//   reads S: spin flow diesel mains feed fault ok
//
// What stands on the table (local frame, table top y = 4, open toward −x like a doll's house):
//   · the reactor hall (x −175 … −110), open on −x and +z: the core drum, the upper slab and its channel heads; the low annex
//     (x −110 … −85) with the drum separator on its roof. Risers slab → drum, downcomers drum → the four PUMPS, discharge pumps →
//     annex: the circulation loop, where heads of light run with `flow`.
//   · the steam line drum → turbine (heads while the steam is admitted: `spin` ≈ 1; the test closes it and the set coasts down).
//   · the TURBINE on its deck: the HP casing (closed), the LP casing OPEN (lower half only: the blade rows turn in plain sight), the
//     FLYWHEEL coupling painted in four sectors (light / dark: its rotation reads at 270 px), the GENERATOR and its exciter.
//     The rotor angle integrates `spin` (no jump when it changes).
//   · `mains`: generator → transformer → three pylons → the line leaves the table and sinks into the night.
//   · `feed`: generator → the switchboard → the pumps' motors (the idea of the test). Its heads slow down with `spin`.
//   · the three DIESELS: skid, block, alternator, radiator fan (turns with `diesel`), stack and clay smoke puffs, a lamp that comes
//     up; they shake while they start. Their cable to the switchboard lights once they are up (`diesel` → 1).
//   · the ECCS: two tanks, the pipe to the annex, and THE VALVE (alarm(): red with `fault`, isolated « la veille à 14 h »).
// Flows are heads of light on a dark conductor, in centimetres, ≤ 1/7 of their period per frame (V0 / 30 fps / PER ≈ 1/23).
import * as THREE from "three";
import { box, cyl, lathe, plate, mergeGeometries, glow, setGlow } from "@kit/build3d.js";
import { clay, clayEdges, alarm, setAlarm, safe, RECON } from "@kit/reconstitution.js";
import { PLANT } from "./plan.js";

const TOP = 4; // the table top
const W0 = 7; // rotor speed at spin 1, rad/s · 05/11: the angle is seek-safe (rotorT, world.js); the 38–71 s « parasites » were time × spin while spin ramped, not aliasing
const V0 = 34; // heads speed at full flow, cm/s
const PER = 26; // heads period, cm
const FAN = 15; // the diesels' fan at diesel 1, rad/s
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const sstep = (x) => x * x * (3 - 2 * x);
const V = (p) => new THREE.Vector3(p[0], p[1], p[2]);
const UP = new THREE.Vector3(0, 1, 0);
const PAPIER = new THREE.Color(RECON.papier);
const VEILLE = new THREE.Color(RECON.veille);

/** A polyline with rounded corners (quadratic bends of `bend` cm): the route of a pipe or a cable. */
function routeCurve(pts, bend) {
  const P = pts.map(V);
  const path = new THREE.CurvePath();
  let cur = P[0].clone();
  for (let i = 1; i < P.length; i++) {
    const a = P[i];
    if (i < P.length - 1) {
      const din = a.clone().sub(P[i - 1]);
      const lin = din.length();
      din.normalize();
      const dout = P[i + 1].clone().sub(a);
      const lout = dout.length();
      dout.normalize();
      const c = Math.min(bend, lin / 2, lout / 2);
      const p1 = a.clone().addScaledVector(din, -c);
      const p2 = a.clone().addScaledVector(dout, c);
      if (cur.distanceTo(p1) > 1e-3) path.add(new THREE.LineCurve3(cur.clone(), p1));
      path.add(new THREE.QuadraticBezierCurve3(p1, a.clone(), p2));
      cur = p2;
    } else path.add(new THREE.LineCurve3(cur.clone(), a.clone()));
  }
  return path;
}

/** Dark clay with heads of light that run along it (uv.x of a TubeGeometry: 0 → 1 along the route). `cat`: the shared uniforms of a flow. */
const HEAD = { value: new THREE.Color(RECON.papier) };
function flowMat(cat, len, off, tone, fade) {
  const mat = clay({ tone });
  const own = { uLen: { value: len }, uOff: { value: off }, uFade: { value: fade } };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, cat, own, { uHead: HEAD });
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vAlong;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\n  vAlong = uv.x;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vAlong;\nuniform float uLen, uOff, uFade, uPhase, uAmp, uPer, uGain;\nuniform vec3 uHead;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
  float sAl = vAlong * uLen;
  float xHd = fract((uOff + sAl - uPhase) / max(uPer, 1.0));
  float gHd = pow(clamp((xHd - 0.42) / 0.53, 0.0, 1.0), 2.0) * (1.0 - smoothstep(0.95, 1.0, xHd));
  float fEnd = uFade > 0.0 ? 1.0 - smoothstep(uLen - uFade, uLen, sAl) : 1.0;
  totalEmissiveRadiance += uHead * (uAmp * fEnd * (0.12 + uGain * gHd));`,
      )
      .replace("#include <tonemapping_fragment>", "gl_FragColor.rgb *= (uFade > 0.0 ? 1.0 - smoothstep(uLen - uFade, uLen, sAl) : 1.0);\n#include <tonemapping_fragment>");
  };
  mat.customProgramCacheKey = () => "cr01-centrale-flow";
  return mat;
}
const flowCat = (per = PER, gain = 1.9) => ({ uPhase: { value: 0 }, uAmp: { value: 0 }, uPer: { value: per }, uGain: { value: gain } });

/** A box beam from a to b (w × w section): the lattice of a pylon. */
function beam(a, b, w) {
  const A = V(a);
  const B = V(b);
  const d = B.clone().sub(A);
  const g = new THREE.BoxGeometry(w, d.length(), w);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()));
  const m = A.add(B).multiplyScalar(0.5);
  return g.translate(m.x, m.y, m.z);
}

export function buildCentrale() {
  const group = new THREE.Group();
  const put = (geo, mat, x, y, z, parent = group, o = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (o.rx) m.rotation.x = o.rx;
    if (o.rz) m.rotation.z = o.rz;
    if (o.ry) m.rotation.y = o.ry;
    m.castShadow = m.receiveShadow = true;
    if (o.edges !== false) m.add(clayEdges(geo, o.edgeOpacity ? { opacity: o.edgeOpacity } : {}));
    parent.add(m);
    return m;
  };
  const AXX = Math.PI / 2; // a kit cylinder (axis y) turned onto x: rz = −π/2 · onto z: rx = π/2
  const pipe = (pts, r, cat, o = {}) => {
    const curve = o.curve ?? routeCurve(pts, o.bend ?? r * 2.6);
    const len = curve.getLength();
    const geo = new THREE.TubeGeometry(curve, Math.max(8, Math.ceil(len / (o.step ?? 2.2))), r, o.radial ?? 14, false);
    const mat = cat ? flowMat(cat, len, o.off ?? 0, o.tone ?? -0.72, o.fade ?? 0) : o.mat;
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    group.add(m);
    return m;
  };

  /* ── the table ── */
  const [tw, td] = PLANT.table;
  put(box(tw, TOP, td, 0.6), clay({ tone: -0.62 }), 0, TOP / 2, 0);

  /* ── the reactor hall (open on −x and +z) and its annex ── */
  const R = PLANT.reactor;
  const hall = { x0: -175, x1: -110, z0: R.at[2] - R.size[2] / 2, z1: R.at[2] + R.size[2] / 2, h: R.size[1] }; // z −55 … 35
  const hx = (hall.x0 + hall.x1) / 2;
  const wallMat = clay({ tone: 0.32 });
  put(box(hall.x1 - hall.x0, hall.h, 3, 0.4), wallMat, hx, TOP + hall.h / 2, hall.z0 + 1.5); // back wall (−z)
  put(box(3, hall.h, hall.z1 - hall.z0, 0.4), wallMat, hall.x1 - 1.5, TOP + hall.h / 2, R.at[2]); // +x wall (shared with the annex)
  put(box(hall.x1 - hall.x0 + 3, 3, 5, 0.4), clay({ tone: 0.12 }), hx + 1.5, TOP + hall.h + 1.5, hall.z0 + 2.5); // cornice, back
  put(box(5, 3, hall.z1 - hall.z0, 0.4), clay({ tone: 0.12 }), hall.x1 - 2.5, TOP + hall.h + 1.5, R.at[2]); // cornice, +x
  const core = { x: -142, z: R.at[2], r: 21, y1: 44 };
  put(cyl(core.r, core.y1 - TOP, 0.5, 48), clay({ tone: -0.05 }), core.x, (TOP + core.y1) / 2, core.z); // the core drum
  put(cyl(core.r + 4, 5, 0.6, 48), clay({ tone: 0.42 }), core.x, core.y1 + 2.5, core.z); // the upper slab
  {
    const heads = [];
    for (let i = -6; i <= 6; i++)
      for (let j = -6; j <= 6; j++) {
        const x = i * 3.6 + (j % 2 ? 1.8 : 0);
        const z = j * 3.12;
        if (x * x + z * z > 21.5 * 21.5) continue;
        heads.push(new THREE.CylinderGeometry(1.15, 1.15, 2.2, 10).translate(core.x + x, core.y1 + 6.1, core.z + z));
      }
    const m = new THREE.Mesh(mergeGeometries(heads), clay({ tone: 0.7 }));
    m.castShadow = m.receiveShadow = true;
    group.add(m);
  }
  const annex = { x0: hall.x1, x1: -85, h: 30 };
  put(box(annex.x1 - annex.x0, annex.h, hall.z1 - hall.z0, 0.5), clay({ tone: 0.22 }), (annex.x0 + annex.x1) / 2, TOP + annex.h / 2, R.at[2]);
  const drum = { x: -98, y: TOP + annex.h + 6, r: 6 };
  put(cyl(drum.r, 84, 0.6, 40), clay({ tone: 0.5 }), drum.x, drum.y, R.at[2], group, { rx: AXX }); // the drum separator, along z

  /* ── the circulation loop: risers slab → drum, downcomers drum → pumps, discharge pumps → annex (`flow`) ── */
  const LOOP = flowCat();
  for (const zr of [-40, -22, 2, 20]) pipe([[-131, core.y1 + 5, zr], [-131, 60, zr], [drum.x, 60, zr], [drum.x, drum.y + drum.r - 0.5, zr]], 1.7, LOOP, { bend: 4 });
  const P = PLANT.pumps;
  const pumpZ = Array.from({ length: P.count }, (_, i) => P.at[2] + (i - (P.count - 1) / 2) * P.gap); // −46 −22 2 26
  for (const zi of pumpZ) {
    put(cyl(P.r, 12, 0.6, 36), clay({ tone: 0.18 }), P.at[0], TOP + 6, zi); // the volute
    put(cyl(P.r + 1, 1.6, 0.3, 36), clay({ tone: 0.45 }), P.at[0], TOP + 12.8, zi); // flange
    put(cyl(6.5, 13, 0.6, 32), clay({ tone: -0.32 }), P.at[0], TOP + 20.2, zi); // the motor
    for (const y of [16.5, 20.2, 23.9]) put(cyl(7.1, 1.1, 0.2, 32), clay({ tone: 0.05 }), P.at[0], TOP + y, zi, group, { edges: false }); // its fins
    put(cyl(3.6, 2.4, 0.4, 24), clay({ tone: 0.55 }), P.at[0], TOP + 27.9, zi); // cap
    pipe([[drum.x + drum.r - 0.5, drum.y, zi], [-62, drum.y, zi], [-62, TOP + 9, zi], [P.at[0] - P.r + 0.5, TOP + 9, zi]], 2.1, LOOP, { bend: 5 });
    pipe([[P.at[0] - 3, TOP + 2.6, zi], [annex.x1 - 0.5, TOP + 2.6, zi]], 1.7, LOOP);
  }

  /* ── the steam line: drum → HP casing ── */
  const STEAM = flowCat();
  pipe([[drum.x, drum.y + 2, -10], [drum.x, 74, -10], [-9, 74, -10], [-9, 43, -10]], 3.2, STEAM, { bend: 8, tone: -0.6 });

  /* ── the turbine set on its deck ── */
  const T = PLANT.turbine;
  const AY = T.at[1] + TOP; // 30: the shaft
  const AZ = T.at[2];
  const tx0 = T.at[0] - T.length / 2; // −15
  const tx1 = T.at[0] + T.length / 2; // 155 (the generator is the last `gen` of it)
  const deckTop = 10;
  put(box(tx1 + 15 - (tx0 - 5), deckTop - TOP, 58, 0.5), clay({ tone: -0.58 }), (tx1 + 15 + tx0 - 5) / 2, (TOP + deckTop) / 2, AZ - 6);
  const pedMat = clay({ tone: -0.05 });
  for (const x of [tx0 - 2, 24, 106, tx1 + 3]) put(box(6, AY - deckTop, 15, 0.4), pedMat, x, (AY + deckTop) / 2 - 1, AZ);
  const HP = { x0: tx0, x1: 21, r: 13 };
  put(cyl(HP.r, HP.x1 - HP.x0, 0.8, 48), clay({ tone: 0.3 }), (HP.x0 + HP.x1) / 2, AY, AZ, group, { rz: -AXX });
  put(box(HP.x1 - HP.x0 - 6, AY - HP.r - deckTop + 2, 12, 0.4), pedMat, (HP.x0 + HP.x1) / 2, (deckTop + AY - HP.r + 2) / 2, AZ, group, { edges: false });
  put(box(HP.x1 - HP.x0 + 2, 1.6, 2 * HP.r + 5, 0.3), clay({ tone: 0.5 }), (HP.x0 + HP.x1) / 2, AY, AZ); // its split flange
  // the LP casing: only its lower half — the rotor turns in plain sight
  const LP = { x0: 26, x1: 92, r: 21.5, t: 2 };
  const half = (ro, ri, n = 28) => {
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push([ro * Math.cos(Math.PI + (Math.PI * i) / n), ro * Math.sin(Math.PI + (Math.PI * i) / n)]);
    for (let i = n; i >= 0; i--) pts.push([ri * Math.cos(Math.PI + (Math.PI * i) / n), ri * Math.sin(Math.PI + (Math.PI * i) / n)]);
    return pts;
  };
  const lpMat = clay({ tone: 0.28 });
  put(plate(half(LP.r, LP.r - LP.t), LP.x1 - LP.x0, { bevel: 0.4 }), lpMat, LP.x0, AY, AZ, group, { ry: AXX }); // shell: extrusion z → x
  for (const x of [LP.x0, LP.x1 - 2]) put(plate(half(LP.r, 4.2), 2, { bevel: 0.3 }), lpMat, x, AY, AZ, group, { ry: AXX }); // end walls
  for (const s of [-1, 1]) put(box(LP.x1 - LP.x0, 1.6, 4.2, 0.3), clay({ tone: 0.5 }), (LP.x0 + LP.x1) / 2, AY - 0.8, AZ + s * (LP.r + 1.6)); // split flanges
  const GEN = { x0: tx1 - T.gen + 3, x1: tx1 - 2, r: 17 };
  put(cyl(GEN.r, GEN.x1 - GEN.x0, 1.2, 48), clay({ tone: -0.18 }), (GEN.x0 + GEN.x1) / 2, AY, AZ, group, { rz: -AXX });
  for (const x of [GEN.x0 + 5, GEN.x1 - 5]) put(cyl(GEN.r + 0.9, 2.2, 0.3, 48), clay({ tone: 0.42 }), x, AY, AZ, group, { rz: -AXX });
  put(box(GEN.x1 - GEN.x0 - 8, AY - GEN.r - deckTop + 2, 16, 0.4), pedMat, (GEN.x0 + GEN.x1) / 2, (deckTop + AY - GEN.r + 2) / 2, AZ, group, { edges: false });
  put(cyl(7, 9, 0.5, 32), clay({ tone: 0.3 }), tx1 + 8, AY, AZ, group, { rz: -AXX }); // the exciter

  // what turns: shaft, LP rotor (drum, hubs, blade rows: double flow, the blades longer toward the ends), the four-sector flywheel
  const rotor = new THREE.Group();
  rotor.position.set(0, AY, AZ);
  group.add(rotor);
  const rotorMat = clay({ tone: 0.62 });
  {
    const geos = [new THREE.CylinderGeometry(2.8, 2.8, tx1 + 8 - (tx0 - 6), 20).rotateZ(AXX).translate((tx1 + 8 + tx0 - 6) / 2, 0, 0)];
    const hub = 8;
    const rows = [[30.5, 18.6], [37.5, 16.6], [44, 14.6], [74, 14.6], [80.5, 16.6], [87.5, 18.6]];
    for (const [x, R1] of rows) {
      geos.push(new THREE.CylinderGeometry(hub + 1.2, hub + 1.2, 2.2, 28).rotateZ(AXX).translate(x, 0, 0));
      const n = 24;
      const L = R1 - hub;
      for (let k = 0; k < n; k++) geos.push(new THREE.BoxGeometry(1.0, L, 3.1).translate(0, hub + L / 2, 0).rotateY(0.7).rotateX(((k + (x > 59 ? 0.5 : 0)) * 2 * Math.PI) / n).translate(x, 0, 0));
    }
    const m = new THREE.Mesh(mergeGeometries(geos), rotorMat);
    m.castShadow = m.receiveShadow = true;
    rotor.add(m);
  }
  put(cyl(7.6, LP.x1 - LP.x0 - 6, 0.5, 40), clay({ tone: 0.4 }), (LP.x0 + LP.x1) / 2, 0, 0, rotor, { rz: -AXX });
  {
    // the steam inlet's drum, painted as a balancing target: a checker of 8 × 3 cells (period 90° around: at spin 1 a frame turns it
    // 0.18 of a period) — from above the cells run across: the speed reads at 270 px, and it is paint, not shading
    const cells = [[], []];
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 8; k++) cells[(k + j) % 2].push(new THREE.CylinderGeometry(11, 11, 8, 6, 1, false, (k * Math.PI) / 4, Math.PI / 4).rotateZ(AXX).translate(59 + (j - 1) * 8, 0, 0));
    cells.forEach((g, i) => {
      const m = new THREE.Mesh(mergeGeometries(g), clay({ tone: i ? -0.92 : 0.9 }));
      m.castShadow = m.receiveShadow = true;
      rotor.add(m);
    });
    const ends = clayEdges(cyl(11, 24, 0.3, 64), { opacity: 0.5 });
    ends.position.set(59, AY, AZ);
    ends.rotation.z = -AXX;
    group.add(ends);
  }
  const FLY = { x: 98.7, r: 19.5, t: 5 };
  {
    const light = clay({ tone: 0.8 });
    const dark = clay({ tone: -0.75 });
    for (let k = 0; k < 4; k++) {
      const g = new THREE.CylinderGeometry(FLY.r, FLY.r, FLY.t, 14, 1, false, (k * Math.PI) / 2, Math.PI / 2).rotateZ(AXX).translate(FLY.x, 0, 0);
      const m = new THREE.Mesh(g, k % 2 ? dark : light);
      m.castShadow = m.receiveShadow = true;
      rotor.add(m);
    }
    const hubG = cyl(6, FLY.t + 2, 0.5, 32);
    put(hubG, clay({ tone: 0.15 }), FLY.x, 0, 0, rotor, { rz: -AXX });
    const rim = clayEdges(cyl(FLY.r, FLY.t, 0.3, 64), { opacity: 0.55 }); // its outline does not turn (a circle is a circle)
    rim.position.set(FLY.x, AY, AZ);
    rim.rotation.z = -AXX;
    group.add(rim);
  }

  /* ── the switchboard, the feed (generator → pumps) and the diesels' cable ── */
  const BOARD = [-12, TOP + 9, 52];
  put(box(14, 18, 10, 0.6), clay({ tone: 0.1 }), ...BOARD);
  put(box(10, 2.2, 0.8, 0.2), clay({ tone: 0.6 }), BOARD[0], BOARD[1] + 4, BOARD[2] + 5.2, group, { edges: false });
  const FEED = flowCat();
  const genX = 128;
  pipe([[genX, AY - 12, AZ + GEN.r - 2], [genX, AY - 12, 24], [genX, TOP + 2, 29], [genX, TOP + 2, 52], [BOARD[0] + 7.5, TOP + 2, 52]], 1.25, FEED, { bend: 4, tone: -0.75 });
  const busX = -24;
  pipe([[BOARD[0] - 7, TOP + 8, BOARD[2]], [busX, TOP + 8, BOARD[2]], [busX, TOP + 8, pumpZ[0] - 4]], 1.25, FEED, { bend: 3, tone: -0.75, off: 210 });
  for (const zi of pumpZ) pipe([[busX, TOP + 8, zi], [busX, TOP + 20, zi], [P.at[0] + 6, TOP + 20, zi]], 0.95, FEED, { bend: 2.5, tone: -0.75, off: 260 + (52 - zi) });
  const DZC = flowCat();
  const Dz = PLANT.diesels;
  const dzX = Array.from({ length: Dz.count }, (_, i) => Dz.at[0] + (i - (Dz.count - 1) / 2) * Dz.gap); // 40 80 120
  pipe([[dzX.at(-1) + 11, TOP + 2, 82], [BOARD[0], TOP + 2, 82], [BOARD[0], TOP + 2, BOARD[2] + 5.5]], 1.25, DZC, { bend: 4, tone: -0.75 });
  for (const xc of dzX) pipe([[xc + 11, TOP + 5, Dz.at[2] - 6], [xc + 11, TOP + 2, 82]], 0.95, DZC, { bend: 2, tone: -0.75 });

  /* ── the diesels ── */
  const diesels = [];
  const puffGeo = new THREE.IcosahedronGeometry(1, 1);
  const puffMat = clay({ tone: 0.4 });
  puffMat.flatShading = true; // sculpted smoke: the maquette's clay, facetted
  const dieselMat = safe(clay({ tone: 0.2 }), 0.3);
  for (let i = 0; i < dzX.length; i++) {
    const xc = dzX[i];
    const zc = Dz.at[2];
    put(box(Dz.size[0] + 2, 3, Dz.size[2] + 2, 0.4), clay({ tone: -0.42 }), xc, TOP + 1.5, zc); // skid (does not shake)
    const dg = new THREE.Group();
    dg.position.set(xc, TOP + 3, zc);
    group.add(dg);
    put(box(20, 14, 18, 1), dieselMat, -5, 7, 0, dg); // the block
    put(box(17, 3, 12, 0.6), clay({ tone: -0.25 }), -5, 15.5, 0, dg); // the head cover
    put(cyl(7, 12, 0.5, 32), clay({ tone: -0.12 }), 11, 7, 0, dg, { rz: -AXX }); // the alternator
    put(box(5, 15, 18, 0.6), clay({ tone: 0.05 }), -17.5, 7.5, 0, dg); // the radiator
    const fan = new THREE.Group();
    fan.position.set(-20.6, 8, 0);
    dg.add(fan);
    const ring = new THREE.TorusGeometry(6.4, 0.8, 10, 40).rotateY(AXX);
    const ringM = new THREE.Mesh(ring, clay({ tone: 0.38 }));
    ringM.position.set(-20.6, 8, 0);
    ringM.castShadow = true;
    dg.add(ringM);
    {
      const blades = [];
      for (let k = 0; k < 3; k++) blades.push(new THREE.BoxGeometry(0.9, 5.2, 3.4).translate(0, 3.2, 0).rotateY(0.5).rotateX((k * 2 * Math.PI) / 3));
      blades.push(new THREE.CylinderGeometry(1.5, 1.5, 1.6, 16).rotateZ(AXX));
      const m = new THREE.Mesh(mergeGeometries(blades), clay({ tone: 0.75 }));
      m.castShadow = true;
      fan.add(m);
    }
    put(cyl(2, 24, 0.3, 24), clay({ tone: -0.35 }), 2, 17 + 12, -5.5, dg); // the stack
    put(cyl(2.7, 1.6, 0.3, 24), clay({ tone: 0.3 }), 2, 17 + 24.6, -5.5, dg);
    const lampMat = glow(RECON.papier, 0.15);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), lampMat);
    lamp.position.set(-1, 11, 9.4);
    dg.add(lamp);
    put(box(5, 5, 0.8, 0.2), clay({ tone: -0.6 }), -1, 11, 9.1, dg, { edges: false });
    const puffs = [];
    for (let k = 0; k < 10; k++) {
      const p = new THREE.Mesh(puffGeo, puffMat);
      p.castShadow = true;
      p.visible = false;
      group.add(p);
      puffs.push(p);
    }
    diesels.push({ dg, fan, lampMat, puffs, xc, zc, seed: i * 0.37 });
  }

  /* ── the emergency core cooling: two tanks, the pipe to the annex, THE valve ── */
  const E = PLANT.eccs;
  const eccsMat = safe(clay({ tone: 0.4 }), 0.32);
  const eccsPipe = safe(clay({ tone: -0.25 }), 0.32);
  const tankX = Array.from({ length: E.tanks }, (_, i) => E.at[0] + (i - (E.tanks - 1) / 2) * 26); // −133 −107
  for (const x of tankX) {
    put(lathe([[0, 0], [10, 0], [10, 33], [8.4, 38.4], [4.6, 41.4], [0, 42]], 48, { bevel: 0.5 }), eccsMat, x, TOP + 2.5, E.at[2]);
    put(cyl(10.8, 2.5, 0.3, 48), clay({ tone: -0.3 }), x, TOP + 1.25, E.at[2]);
  }
  const [vx, vy, vz] = E.valve;
  pipe([[tankX[0], vy, vz], [vx - 5, vy, vz]], 2.1, null, { mat: eccsPipe });
  pipe([[vx + 5, vy, vz], [-58, vy, vz], [-58, vy, 50], [-100, vy, 50], [-100, vy, hall.z1 + 0.5]], 2.1, null, { mat: eccsPipe, bend: 6 });
  const valveMat = alarm({ tone: 0.1 });
  const valve = put(box(10, 9, 9, 1.4), valveMat, vx, vy, vz);
  for (const s of [-1, 1]) put(cyl(3.5, 1.6, 0.3, 28), valveMat, vx + s * 5.6, vy, vz, group, { rz: -AXX });
  put(cyl(2.6, 8, 0.4, 24), valveMat, vx, vy + 8.5, vz);
  {
    const g = [new THREE.TorusGeometry(5.6, 0.95, 10, 40).rotateX(AXX), new THREE.BoxGeometry(11.2, 0.9, 0.9), new THREE.BoxGeometry(0.9, 0.9, 11.2), new THREE.CylinderGeometry(1.4, 1.4, 1.8, 16)];
    const m = new THREE.Mesh(mergeGeometries(g), valveMat);
    m.position.set(vx, vy + 13.4, vz);
    m.castShadow = true;
    group.add(m);
  }

  /* ── the line to the network: generator → transformer → three pylons → off the table ── */
  const MAINS = flowCat(70, 1.25); // long, soft heads on the conductors: short bright ones read as fairy lights
  const TR = [150, TOP + 9, -62];
  put(box(26, 18, 18, 0.8), clay({ tone: 0.02 }), ...TR);
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) put(box(2, 13, 3.6, 0.3), clay({ tone: -0.3 }), TR[0] - 10 + k * 5, TR[1] - 1, TR[2] + s * 10.8, group, { edges: false });
  const bush = [143, 150, 157];
  for (const x of bush) {
    put(cyl(1.5, 8, 0.3, 16), clay({ tone: 0.7 }), x, TR[1] + 13, TR[2]);
    for (const y of [1.5, 4, 6.5]) put(cyl(2.3, 0.8, 0.1, 16), clay({ tone: 0.7 }), x, TR[1] + 9 + y, TR[2], group, { edges: false });
  }
  pipe([[genX, AY - 12, AZ - GEN.r + 2], [genX, TOP + 10, -40], [genX, TOP + 10, TR[2]], [TR[0] - 13.5, TOP + 10, TR[2]]], 1.4, MAINS, { bend: 4, tone: -0.75 });
  const M = PLANT.mains;
  const pyX = Array.from({ length: M.pylons }, (_, i) => M.at[0] + (i - (M.pylons - 1) / 2) * M.gap); // −50 40 130
  {
    const g = [];
    const hb = 9;
    const ht = 3;
    const H1 = 56;
    const lv = [0, 14, 28, 42, H1];
    const at = (y) => hb + (ht - hb) * (y / H1);
    for (const x0 of pyX) {
      const z0 = M.at[2];
      const c = (y, sx, sz) => [x0 + sx * at(y), TOP + y, z0 + sz * at(y)];
      const corners = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
      for (const [sx, sz] of corners) g.push(beam(c(0, sx, sz), c(H1, sx, sz), 1.5));
      for (let l = 0; l < lv.length; l++)
        for (let k = 0; k < 4; k++) {
          const [ax, az] = corners[k];
          const [bx, bz] = corners[(k + 1) % 4];
          if (l > 0) g.push(beam(c(lv[l], ax, az), c(lv[l], bx, bz), 1.1));
          if (l < lv.length - 1) {
            g.push(beam(c(lv[l], ax, az), c(lv[l + 1], bx, bz), 0.9));
            g.push(beam(c(lv[l], bx, bz), c(lv[l + 1], ax, az), 0.9));
          }
        }
      for (const [sx, sz] of corners) g.push(beam(c(H1, sx, sz), [x0, TOP + 68, z0], 1.2));
      g.push(beam([x0, TOP + H1, z0 - 17], [x0, TOP + H1, z0 + 17], 1.6));
      for (const s of [-1, 1]) {
        g.push(beam([x0, TOP + H1, z0 + s * 16], [x0, TOP + 64, z0], 0.9));
        g.push(new THREE.CylinderGeometry(0.9, 0.9, 4.5, 10).translate(x0, TOP + H1 - 2.4, z0 + s * 15));
      }
    }
    const m = new THREE.Mesh(mergeGeometries(g), clay({ tone: 0.4 }));
    m.castShadow = m.receiveShadow = true;
    group.add(m);
  }
  // two conductors, each ONE tube from a bushing to the night (the heads run all the way), with their sag
  {
    const hang = TOP + 51.4;
    for (const s of [-1, 1]) {
      const z = M.at[2] + s * 15;
      const pts = [V([s < 0 ? bush[0] : bush[2], TR[1] + 17, TR[2]])];
      const lead = [pyX[2], hang, z];
      for (let k = 1; k <= 10; k++) {
        const u = k / 10;
        pts.push(V([pts[0].x + (lead[0] - pts[0].x) * u, pts[0].y + (lead[1] - pts[0].y) * u - 2 * Math.sin(Math.PI * u), pts[0].z + (lead[2] - pts[0].z) * u]));
      }
      const spans = [[pyX[2], pyX[1], 6], [pyX[1], pyX[0], 6], [pyX[0], -340, 10]];
      for (const [a, b, sag] of spans)
        for (let k = 1; k <= 16; k++) {
          const u = k / 16;
          const y = b === -340 ? hang + (16 - hang) * u * u - sag * Math.sin(Math.PI * u) : hang - sag * Math.sin(Math.PI * u);
          pts.push(V([a + (b - a) * u, y, z]));
        }
      const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
      pipe(null, 0.75, MAINS, { curve, radial: 8, step: 2.5, tone: -0.7, off: 80, fade: 150 });
    }
  }

  /* ── anchors ── */
  const anchor = (x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    group.add(o);
    return o;
  };
  const A = {
    focus: anchor(0, 30, 0),
    fault: anchor(...PLANT.eccs.valve),
    reactor: anchor(R.at[0], TOP + R.size[1], R.at[2]),
    pumps: anchor(P.at[0], TOP + P.h + 4, P.at[2]),
    turbine: anchor(T.at[0], AY, AZ),
    generator: anchor((GEN.x0 + GEN.x1) / 2, AY, AZ),
    flywheel: anchor(FLY.x, AY, AZ),
    diesels: anchor(Dz.at[0], TOP + Dz.size[1] + 4, Dz.at[2]),
    eccs: anchor(E.at[0], TOP + 42, E.at[2]),
    mains: anchor(M.at[0], M.h, M.at[2]),
    transformer: anchor(TR[0], TR[1] + 9, TR[2]),
    board: anchor(BOARD[0], BOARD[1] + 9, BOARD[2]),
  };

  // integrated phases (the shutter asks sixteen instants in a row: integrate between them; a seek re-seeds from `time`)
  let lastT = NaN;
  let aRotor = 0;
  let aFan = 0;
  let phLoop = 0;
  let phSteam = 0;
  let phFeed = 0;
  let phMains = 0;
  let phDz = 0;
  let phPuff = 0;
  const lampHue = new THREE.Color();

  return {
    group, A, haloR: 22,
    update(S, time) {
      const spin = S.spin ?? 1;
      const flow = S.flow ?? 1;
      const dz = clamp01(S.diesel ?? 0);
      const mains = clamp01(S.mains ?? 1);
      const feed = clamp01(S.feed ?? 0);
      const ok = clamp01(S.ok ?? 0);
      const dt = time - lastT;
      if (Math.abs(dt) < 0.25) {
        aRotor += dt * W0 * spin;
        aFan += dt * FAN * dz;
        phLoop += dt * V0 * flow;
        phSteam += dt * V0 * 1.25;
        phFeed += dt * V0 * spin;
        phMains += dt * V0 * 1.7;
        phDz += dt * V0;
        phPuff += dt * (0.22 + 0.3 * dz);
      } else {
        aRotor = time * W0 * spin;
        aFan = time * FAN * dz;
        phLoop = time * V0 * flow;
        phSteam = time * V0 * 1.25;
        phFeed = time * V0 * spin;
        phMains = time * V0 * 1.7;
        phDz = time * V0;
        phPuff = time * (0.22 + 0.3 * dz);
      }
      { const eff = (S.rotorT ?? -1) >= 0 ? S.rotorT : time * spin; aRotor = W0 * eff; phFeed = V0 * eff; } // 05/11: seek-safe (renders seek every frame)
      lastT = time;

      rotor.rotation.x = aRotor;
      HEAD.value.copy(PAPIER).lerp(VEILLE, ok);
      LOOP.uPhase.value = phLoop;
      LOOP.uAmp.value = Math.min(1, 0.35 + 0.8 * flow);
      STEAM.uPhase.value = phSteam;
      STEAM.uAmp.value = sstep(ramp(spin, 0.82, 1)); // the test closes the steam: the set coasts down on its inertia
      FEED.uPhase.value = phFeed;
      FEED.uAmp.value = feed * (0.35 + 0.65 * clamp01(spin));
      MAINS.uPhase.value = phMains;
      MAINS.uAmp.value = mains;
      DZC.uPhase.value = phDz;
      DZC.uAmp.value = sstep(ramp(dz, 0.85, 1));

      // the diesels: they shake while they start, the fan winds up, the smoke comes, the lamp comes up
      const shake = 0.22 * Math.min(1, dz * 6) * (1 - 0.5 * dz);
      lampHue.copy(PAPIER).lerp(VEILLE, ok);
      for (let i = 0; i < diesels.length; i++) {
        const d = diesels[i];
        d.dg.position.x = d.xc + shake * Math.sin(time * 61 + i * 1.7);
        d.dg.position.y = TOP + 3 + shake * Math.sin(time * 53 + i * 2.3);
        d.fan.rotation.x = aFan + i * 0.9;
        setGlow(d.lampMat, 0.12 + 2.2 * sstep(ramp(dz, 0.12, 1)), lampHue);
        const on = Math.min(1, dz * 5);
        for (let k = 0; k < d.puffs.length; k++) {
          const p = d.puffs[k];
          const u = phPuff + k / d.puffs.length + d.seed;
          const f = u - Math.floor(u);
          const s = (2 + 6.6 * f) * Math.pow(Math.sin(Math.PI * Math.min(1, f * 1.15)), 0.45) * on * (0.6 + 0.4 * dz);
          p.visible = s > 0.05;
          if (!p.visible) continue;
          p.scale.setScalar(s);
          p.position.set(d.xc + 2 + 16 * f * f + 1.4 * Math.sin(5 * f + k * 2.4), TOP + 3 + 43 + 19 * f, d.zc - 5.5 + 1.6 * Math.cos(4 * f + k * 1.9));
          p.rotation.set(k * 1.3 + f, k * 0.7 + 2 * f, 0);
        }
      }
      setAlarm(valveMat, S.fault ?? 0);
    },
  };
}
