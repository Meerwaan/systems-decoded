// DOSSIER 004 — the residual-current device ("le différentiel", 30 mA) that sits in the consumer unit.
// Centimetres. On the bench it lies on its back: X is its width, Z its height on the wall (+Z = the
// side the mains come in), Y its depth (the front face, with the lever, looks up).
// Inside, one thing matters: a ring of ferrite both wires of the circuit pass through. What leaves
// by one comes back by the other; the ring feels the difference. When some is missing, a small coil
// on the ring wakes a relay — a paddle a magnet was holding lets go — the spring that was kept
// loaded snaps, and the contacts open.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { BRAND } from "@kit/brand.js";
import { solid, glow, lineMat, makePart, addMesh, anchor } from "@kit/build3d.js";

const DEG = Math.PI / 180;
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const INK = new THREE.Color(BRAND.ink);
const AXIS_X = new THREE.Vector3(1, 0, 0);

export const BOX = { w: 4.4, h: 8.8, d: 4.4, nose: 1.0 }; // width, height on the wall, depth, how far the nose with the lever stands out
const HW = BOX.w / 2;
const HH = BOX.h / 2;
const WIRE = { x: 0.42, y: 2.3, r: 0.2 }; // the two conductors: either side of the middle, at this depth
const RING = { z: -1.75, R: 1.25, r: 0.4 }; // the ring: where it stands, its radius, the radius of its section
const HINGE = { y: 4.1, z: 0.75 }; // the lever turns about this axis (along X)
const ARM = { z0: 1.25, z1: 2.72 }; // the moving contacts: hinge, tip
const ON = 27 * DEG; // the lever leans this much toward the mains side when the current is on
const FLOW_Y = WIRE.y + WIRE.r + 0.07; // the dashes of the current ride just on top of the wires

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cylZ = (r, len, seg = 24) => new THREE.CylinderGeometry(r, r, len, seg).rotateX(Math.PI / 2);
const cylX = (r, len, seg = 24) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2);

/** A coil drawn as a zigzag between two points: straight at both ends. */
function coilPoints(out, a, b, side, turns = 7, lead = 0.12) {
  const n = turns * 2 + 3;
  for (let i = 0; i <= n; i++) {
    const u = i === 0 ? 0 : i === n ? 1 : lead + ((1 - 2 * lead) * (i - 1)) / (n - 2);
    const k = i < 2 || i > n - 2 ? 0 : i % 2 ? 1 : -1;
    out[i * 3] = a.x + (b.x - a.x) * u + side.x * k;
    out[i * 3 + 1] = a.y + (b.y - a.y) * u + side.y * k;
    out[i * 3 + 2] = a.z + (b.z - a.z) * u + side.z * k;
  }
  return out;
}

/** `flows: false` leaves out the moving dashes (the copy mounted in the consumer unit is seen from far). */
export function buildDifferential({ flows = true } = {}) {
  const root = new THREE.Group();
  const fx = {};
  const A = {};
  // one set of materials per part: a part can fade without taking its neighbours along
  const metals = () => ({
    shell: solid(0xbdb9ae, { rough: 0.66, coat: 0.15, coatRough: 0.55, env: 0.8 }),
    dark: solid(0x1b2126, { rough: 0.6, metal: 0.3, coat: 0.3, coatRough: 0.45 }),
    steel: solid(0x6f7a83, { rough: 0.42, metal: 0.4, env: 1.1 }),
    bright: solid(0xb9c0c4, { rough: 0.36, metal: 0.45, env: 1.3 }),
    sheath: solid(0x232b31, { rough: 0.5, metal: 0.25, coat: 0.4, coatRough: 0.35 }), // a conductor: dark, so that the dashes of the current read on it
  });

  /* ── the case: a tray of pale plastic. It turns to glass when the inside is the subject. ── */
  const shell = makePart("shell", { lift: 0 });
  const m0 = metals();
  addMesh(shell, box(BOX.w, 0.34, BOX.h), m0.shell, { pos: [0, 0.17, 0] });
  for (const [w, d, x, z] of [[0.2, BOX.h, -HW + 0.1, 0], [0.2, BOX.h, HW - 0.1, 0], [BOX.w - 0.4, 0.2, 0, -HH + 0.1], [BOX.w - 0.4, 0.2, 0, HH - 0.1]]) {
    addMesh(shell, box(w, BOX.d - 0.34, d), m0.shell, { pos: [x, 0.34 + (BOX.d - 0.34) / 2, z] });
  }
  A.base = anchor(shell, -HW, BOX.d, -HH + 1.2);

  /* ── the wiring: four terminals, and the two wires on their way to the ring and beyond ── */
  const wiring = makePart("wiring", { lift: 0 });
  const mw = metals();
  for (const side of [-1, 1]) {
    for (const end of [-1, 1]) {
      addMesh(wiring, box(0.8, 1.0, 0.85), mw.steel, { pos: [side * 0.62, WIRE.y, end * (HH - 0.72)], edgeOpacity: 0.6 });
      addMesh(wiring, new THREE.CylinderGeometry(0.27, 0.27, 0.26, 16), mw.dark, { pos: [side * 0.62, WIRE.y + 0.62, end * (HH - 0.72)], edges: false });
    }
    // mains side: terminal → fixed contact. Load side: where the ring let it go → terminal.
    addMesh(wiring, cylZ(WIRE.r, HH - 0.72 - ARM.z1 - 0.1), mw.sheath, { pos: [side * WIRE.x, WIRE.y, (HH - 0.72 + ARM.z1 + 0.1) / 2], edges: false });
    addMesh(wiring, box(0.46, 0.5, 0.2), mw.bright, { pos: [side * WIRE.x, WIRE.y, ARM.z1 + 0.1], edgeOpacity: 0.5 });
    addMesh(wiring, cylZ(WIRE.r, ARM.z0 - 0.15 - (RING.z + 1.5)), mw.sheath, { pos: [side * WIRE.x, WIRE.y, (ARM.z0 - 0.15 + RING.z + 1.5) / 2], edges: false });
    addMesh(wiring, cylZ(WIRE.r, RING.z - 1.5 + HH - 0.72), mw.sheath, { pos: [side * WIRE.x, WIRE.y, (RING.z - 1.5 - HH + 0.72) / 2], edges: false });
  }
  // the cradle the ring stands in
  addMesh(wiring, box(2.9, 0.42, 0.56), mw.dark, { pos: [0, 0.55, RING.z], edgeOpacity: 0.6 });

  /* ── the heart: the ring, the two lengths of wire that pass through it, and the fine coil that listens ── */
  const core = makePart("core", { lift: 2.6, delay: 0.14, span: 0.6 });
  const m1 = metals();
  fx.ferrite = solid(0x20272d, { rough: 0.42, metal: 0.25, coat: 0.6, coatRough: 0.25, env: 1.2 });
  addMesh(core, new THREE.TorusGeometry(RING.R, RING.r, 28, 96), fx.ferrite, { pos: [0, WIRE.y, RING.z], edges: false });
  // its coil: a dozen turns of fine wire over the top of the ring
  const turn = new THREE.TorusGeometry(RING.r + 0.055, 0.045, 8, 28);
  for (let k = 0; k < 13; k++) {
    const a = (58 + k * 5.4) * DEG;
    const t = new THREE.Mesh(turn, m1.bright);
    t.position.set(RING.R * Math.cos(a), WIRE.y + RING.R * Math.sin(a), RING.z);
    t.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-Math.sin(a), Math.cos(a), 0)); // its axis along the ring
    core.add(t);
  }
  // the line of light that says it is alive (a drawing device)
  fx.eye = glow(BRAND.veille, 1.6);
  for (const dz of [-RING.r - 0.012, RING.r + 0.012]) {
    const eye = new THREE.Mesh(new THREE.TorusGeometry(RING.R, 0.04, 8, 96), fx.eye);
    eye.position.set(0, WIRE.y, RING.z + dz);
    core.add(eye);
  }
  for (const side of [-1, 1]) addMesh(core, cylZ(WIRE.r, 3.0), m1.sheath, { pos: [side * WIRE.x, WIRE.y, RING.z], edges: false });
  A.ring = anchor(core, -RING.R - RING.r, WIRE.y + 0.4, RING.z);
  A.ringTop = anchor(core, 0, WIRE.y + RING.R + RING.r, RING.z);
  A.coil = anchor(core, RING.R * Math.cos(64 * DEG), WIRE.y + RING.R * Math.sin(64 * DEG) + RING.r, RING.z);
  A.wires = anchor(core, 0, WIRE.y + WIRE.r, RING.z + 1.3);

  /* ── the mechanism: the relay, the loaded spring, the lever, the two contacts that move ── */
  const mech = makePart("mech", { lift: 4.9, delay: 0.06, span: 0.6 });
  const m2 = metals();
  // the relay: a magnet holds a paddle against a small spring. The ring's coil only has to cancel the magnet.
  const RELAY = { x: 1.42, y: 1.3, z: -0.05 };
  addMesh(mech, box(1.0, 1.1, 1.3), m2.dark, { pos: [RELAY.x, RELAY.y + 0.2, RELAY.z], edgeOpacity: 0.8 });
  addMesh(mech, cylZ(0.34, 0.9, 20), m2.bright, { pos: [RELAY.x, RELAY.y + 0.2, RELAY.z + 0.05], edges: false });
  fx.paddle = new THREE.Group(); // hinged on the mains side of the relay, lying on it
  fx.paddle.position.set(RELAY.x, RELAY.y + 0.8, RELAY.z + 0.62);
  fx.paddleMat = solid(0xc6cbce, { rough: 0.42, metal: 0.25, env: 1.2 });
  const paddle = new THREE.Mesh(box(0.86, 0.12, 1.24), fx.paddleMat);
  paddle.position.set(0, 0.06, -0.62);
  paddle.castShadow = true;
  fx.paddleGlow = glow(BRAND.veille, 1.2);
  const mark = new THREE.Mesh(box(0.5, 0.03, 0.9), fx.paddleGlow);
  mark.position.set(0, 0.135, -0.62);
  fx.paddle.add(paddle, mark);
  mech.add(fx.paddle);
  A.relay = anchor(mech, RELAY.x + 0.5, RELAY.y + 0.9, RELAY.z);
  // the two leads from the ring's coil to the relay (they belong to the mechanism: the ring leaves without them)
  fx.leadMat = lineMat(BRAND.ink, 2, { opacity: 0.85 });
  const lead = new Line2(new LineGeometry(), fx.leadMat);
  fx.leadPts = [[RING.R * Math.cos(64 * DEG), WIRE.y + RING.R * Math.sin(64 * DEG) + RING.r + 0.1, RING.z], [1.05, WIRE.y + 1.25, RING.z + 0.75], [RELAY.x, RELAY.y + 1.0, RELAY.z - 0.8], [RELAY.x, RELAY.y + 0.5, RELAY.z - 0.5]];
  lead.geometry.setPositions(fx.leadPts.flat());
  lead.frustumCulled = false;
  mech.add(lead);
  fx.pulse = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), glow(BRAND.signal, 6, { additive: true }));
  fx.pulse.visible = false;
  mech.add(fx.pulse);

  // the lever and what turns with it
  fx.lever = new THREE.Group();
  fx.lever.position.set(0, HINGE.y, HINGE.z);
  const handle = new THREE.Mesh(box(1.5, 2.3, 0.62), m2.steel);
  handle.position.set(0, 1.25, 0);
  handle.castShadow = true;
  const grip = new THREE.Mesh(box(1.5, 0.34, 0.74), m2.dark);
  grip.position.set(0, 2.5, 0);
  fx.leverMark = glow(BRAND.veille, 1.4);
  const stripe = new THREE.Mesh(box(1.1, 0.03, 0.4), fx.leverMark); // on its top: what one sees from the front of the unit
  stripe.position.set(0, 2.685, 0);
  const tail = new THREE.Mesh(box(0.42, 1.3, 0.34), m2.steel); // below the axle: the spring hooks on it
  tail.position.set(-1.25, -0.6, 0);
  fx.lever.add(handle, grip, stripe, tail);
  mech.add(fx.lever);
  addMesh(mech, cylX(0.17, 3.6, 16), m2.bright, { pos: [0, HINGE.y, HINGE.z], edges: false });
  A.lever = anchor(fx.lever, -0.75, 1.2, 0);
  // the spring: from a post on the case to the tail of the lever. Loaded as long as the lever is up.
  fx.springMat = lineMat(BRAND.ink, 2.8, { opacity: 0.95 });
  fx.spring = new Line2(new LineGeometry(), fx.springMat);
  fx.spring.frustumCulled = false;
  fx.springPts = new Float32Array(3 * 18);
  mech.add(fx.spring);
  const POST = new THREE.Vector3(-1.25, 0.9, 2.3);
  addMesh(mech, cylX(0.14, 0.5, 12), m2.dark, { pos: [POST.x, POST.y, POST.z], edges: false });
  A.spring = anchor(mech, -1.25, 2.0, 1.3);
  // the moving contacts: two arms, hinged, their tips against the fixed contacts
  fx.arms = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * WIRE.x, WIRE.y, ARM.z0);
    const arm = new THREE.Mesh(box(0.34, 0.2, ARM.z1 - ARM.z0), m2.bright);
    arm.position.set(0, 0, (ARM.z1 - ARM.z0) / 2);
    arm.castShadow = true;
    const tip = new THREE.Mesh(box(0.42, 0.34, 0.16), m2.bright);
    tip.position.set(0, 0, ARM.z1 - ARM.z0);
    pivot.add(arm, tip);
    mech.add(pivot);
    return pivot;
  });
  addMesh(mech, cylX(0.14, 2.0, 12), m2.dark, { pos: [0, WIRE.y, ARM.z0], edges: false });
  // where the contacts part: a spark, for the time of a frame or two
  fx.arc = glow(BRAND.signal, 0, { additive: true });
  fx.arcs = [-1, 1].map((side) => {
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), fx.arc);
    a.position.set(side * WIRE.x, WIRE.y + 0.2, ARM.z1);
    a.visible = false;
    mech.add(a);
    return a;
  });
  A.contacts = anchor(mech, WIRE.x + 0.3, WIRE.y + 0.3, ARM.z1 - 0.3);

  /* ── the front: pale plastic, a nose the lever comes out of, and the button marked T ── */
  const cover = makePart("cover", { lift: 7.4, delay: 0, span: 0.6 });
  const m3 = metals();
  // the plate, cut around the nose
  const plate = new THREE.Shape();
  plate.moveTo(-HW, -HH);
  plate.lineTo(HW, -HH);
  plate.lineTo(HW, HH);
  plate.lineTo(-HW, HH);
  plate.closePath();
  const NOSE = { x: 1.25, z0: -0.55, z1: 2.05 };
  const slot = new THREE.Path();
  slot.moveTo(-NOSE.x + 0.3, -NOSE.z1 + 0.25);
  slot.lineTo(NOSE.x - 0.3, -NOSE.z1 + 0.25);
  slot.lineTo(NOSE.x - 0.3, -NOSE.z0 - 0.25);
  slot.lineTo(-NOSE.x + 0.3, -NOSE.z0 - 0.25);
  slot.closePath();
  plate.holes.push(slot);
  const plateGeo = new THREE.ExtrudeGeometry(plate, { depth: 0.3, bevelEnabled: false });
  plateGeo.rotateX(-Math.PI / 2);
  plateGeo.translate(0, BOX.d, 0);
  addMesh(cover, plateGeo, m3.shell);
  // the nose: four walls around the lever
  for (const [w, d, x, z] of [[0.3, NOSE.z1 - NOSE.z0, -NOSE.x + 0.15, (NOSE.z0 + NOSE.z1) / 2], [0.3, NOSE.z1 - NOSE.z0, NOSE.x - 0.15, (NOSE.z0 + NOSE.z1) / 2], [NOSE.x * 2 - 0.6, 0.25, 0, NOSE.z0 + 0.125], [NOSE.x * 2 - 0.6, 0.25, 0, NOSE.z1 - 0.125]]) {
    addMesh(cover, box(w, BOX.nose, d), m3.shell, { pos: [x, BOX.d + 0.3 + BOX.nose / 2, z] });
  }
  // the test button, and its T
  fx.button = new THREE.Group();
  fx.button.position.set(-1.2, BOX.d + 0.3, -2.75);
  const key = new THREE.Mesh(box(0.95, 0.3, 0.95), m3.dark);
  key.position.y = 0.15;
  fx.buttonMark = glow(BRAND.ink, 1.1);
  const t1 = new THREE.Mesh(box(0.52, 0.02, 0.13), fx.buttonMark);
  t1.position.set(0, 0.315, 0.18);
  const t2 = new THREE.Mesh(box(0.13, 0.02, 0.52), fx.buttonMark);
  t2.position.set(0, 0.315, -0.08);
  fx.button.add(key, t1, t2);
  cover.add(fx.button);
  // the rating plate
  addMesh(cover, box(1.6, 0.04, 0.85), m3.steel, { pos: [0.95, BOX.d + 0.32, -2.75], edgeOpacity: 0.4 });
  A.cover = anchor(cover, HW, BOX.d + 0.3, -1.6);
  A.button = anchor(cover, -1.2, BOX.d + 0.65, -2.75);
  A.plate = anchor(cover, 0.95, BOX.d + 0.36, -2.75);

  const parts = { shell, wiring, core, mech, cover };
  root.add(shell, wiring, core, mech, cover);

  /* ── the current, drawn: dashes that run along the two wires. What leaves, what comes back, what is missing. ── */
  fx.flow = [];
  if (flows) {
    for (const side of [-1, 1]) {
      const mat = lineMat(BRAND.ink, 0.15, { opacity: 0, dashed: true, dashSize: 0.34, gapSize: 0.3, hdr: 1.25 });
      mat.worldUnits = true; // centimetres, not pixels: from close they are bars of light, from far a fine line
      mat.needsUpdate = true;
      const g = new LineGeometry();
      g.setPositions([side * WIRE.x, FLOW_Y, HH - 1.0, side * WIRE.x, FLOW_Y, -HH + 1.0]);
      const l = new Line2(g, mat);
      l.computeLineDistances();
      l.frustumCulled = false;
      l.renderOrder = 4;
      root.add(l);
      fx.flow.push({ line: l, mat, side });
    }
  }
  // the outline of the device, as a light: how it is found from far away (a drawing device, not a lamp)
  const outline = [...cover.userData.part.mats, ...shell.userData.part.mats].filter((m) => m.isLineMaterial);
  for (const m of outline) m.userData.rest = m.color.clone();

  const hue = new THREE.Color();
  const tailAt = new THREE.Vector3();
  const side = new THREE.Vector3(0.16, 0, 0);
  const lead0 = new THREE.Vector3();
  const lead1 = new THREE.Vector3();
  /**
   * off      0 → 1: the lever drops, the spring lets go, the contacts open
   * paddle   0 → 1: the magnet lets go of the paddle
   * sense    0 → 1: the ring feels something missing (its line of light goes to signal)
   * pulse    0 → 1: the word travels from the ring's coil to the relay (< 0 or > 1: nothing)
   * arc      0 → 1: the spark as the contacts part
   * out / back   cm of dashes gone by on the wire that brings the current, on the one that takes it back
   * flow     0 → 1: the dashes are there · lack 0 → 1: how much fainter the returning ones are
   * press    0 → 1: the test button, pushed · aura 0 → 1: the outline of the case lights up (veille)
   */
  function pose({ off = 0, paddle = 0, sense = 0, pulse = -1, arc = 0, out = 0, back = 0, flow = 0, lack = 0, press = 0, aura = 0 }) {
    const lean = ON * (1 - 2 * off);
    fx.lever.rotation.x = lean;
    for (const arm of fx.arms) arm.rotation.x = -34 * DEG * off;
    // the spring: between its post and the tail of the lever, wherever that is
    tailAt.set(-1.25, -1.1, 0).applyAxisAngle(AXIS_X, lean).add(fx.lever.position);
    fx.spring.geometry.setPositions(coilPoints(fx.springPts, POST, tailAt, side, 7));
    fx.paddle.rotation.x = 50 * DEG * paddle;
    hue.copy(VEILLE).lerp(SIGNAL, Math.min(1, sense));
    fx.eye.color.copy(hue).multiplyScalar(1.6 + sense * 4);
    fx.paddleGlow.color.copy(VEILLE).lerp(SIGNAL, paddle).multiplyScalar(1.2 + paddle * 3);
    fx.leverMark.color.copy(VEILLE).lerp(INK, off).multiplyScalar(1.4 - off * 0.9);
    fx.pulse.visible = pulse > 0 && pulse < 1;
    if (fx.pulse.visible) {
      const n = fx.leadPts.length - 1;
      const u = pulse * n;
      const i = Math.min(n - 1, Math.floor(u));
      lead0.fromArray(fx.leadPts[i]);
      lead1.fromArray(fx.leadPts[i + 1]);
      fx.pulse.position.lerpVectors(lead0, lead1, u - i);
    }
    fx.arc.color.copy(SIGNAL).lerp(INK, 0.4).multiplyScalar(5 * Math.pow(1 - Math.min(1, arc), 2));
    for (const a of fx.arcs) {
      a.visible = arc > 0.01 && arc < 0.99;
      a.scale.setScalar(0.5 + arc * 0.9);
    }
    for (const f of fx.flow) {
      const returning = f.side > 0;
      f.mat.dashOffset = returning ? back : -out; // one runs toward the load, the other back from it
      f.mat.opacity = flow * (returning ? 1 - 0.35 * lack : 1);
      // the same rhythm, shorter dashes: less of it comes back
      f.mat.dashSize = returning ? 0.34 - 0.24 * lack : 0.34;
      f.mat.gapSize = returning ? 0.3 + 0.24 * lack : 0.3;
      f.line.visible = f.mat.opacity > 0.01;
    }
    fx.button.position.y = BOX.d + 0.3 - 0.2 * press;
    fx.buttonMark.color.copy(INK).lerp(VEILLE, press).multiplyScalar(1.1 + 3.2 * press); // pressed: its T lights up
    for (const m of outline) m.color.copy(m.userData.rest).lerp(VEILLE, Math.min(1, aura * 1.5)).multiplyScalar(1 + aura * 3.2);
  }
  pose({});

  return { root, parts, fx, A, pose };
}
