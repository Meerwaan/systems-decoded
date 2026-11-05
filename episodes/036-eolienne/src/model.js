// DOSSIER 036 — the system: the top of an Enercon-type turbine, opened. Solid (three greys, fine light edges), the
// nacelle's cover and the spinner of glass. Built in the nacelle's frame of plan.js (origin at the top of the tower,
// +z upwind where the spinner looks, y up). docs/036-decors.md, « src/model.js ».
//
//   buildSystem() → { root, A, parts, update(P, time, px) }
//   root   the nacelle's frame. world.js re-parents it between the top of the tower (eolienne.js, A.top) and the bench.
//   A      hub (turns with `rotor`) · root[3] (each blade's frame, rotor-fixed, NOT pitched) · pitch[3] (the same,
//          turned by its pitch: world.js mounts the full blades of eolienne.js there) · motor[3] · battery[3] ·
//          heart (= battery[0]) · gen · brake · carrier · centre
//   P      bench cover rotor rpm pitchA pitchB pitchC explode batt charge motors heart
//          litMast litNacelle litGen litHub litMotor litBrake
//
// THE HUB IS A STAR CASTING, OPEN TOWARD THE WIND: a rounded triangular body around the rotor axis and three conical
// necks out to the blade bearings. Each neck has a big foundry window on its upwind side (where every working pose
// stands): through it, side by side in the same neck, the blade's PITCH DRIVE (motor, gearbox, its pinion in the
// toothed inner ring of the blade bearing — the ring turns with the pitch, the pinion six times as much) and ITS OWN
// BATTERY CABINET (18 lead blocks, a gauge on its face toward the wind). One technology on screen: electric. No
// hydraulic cylinder anywhere. The ring generator behind (no gearbox: its rotor is bolted to the hub and turns with
// it), its brake caliper on the rotor's rim (cold, ink: it is for maintenance), the carrier, the yaw ring and its six
// drives, the anemometer and the vane on the roof.
//
// LAYOUT (illustrative sizes, cm). In each blade's frame (plan.js: origin at the bearing's flange, +y toward the tip,
// +z upwind, +x the way the blade moves): the drive stands on the +x side of the neck, the cabinet on the −x side —
// the cameras stand on the −x side (az H−30 … H−70), they see the cabinet face-on and the drive across the open neck.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import {
  makePart, addMesh, solid, glow, setGlow, glass, asShell, cyl, box, lathe, plate, placed, anchor, setPartOpacity, mergeGeometries,
} from "@kit/build3d.js";
import { HUB, BEARING, GENERATOR, BRAKE, YAW, NACELLE, VANE, STUB, SYSTEM } from "./plan.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const INK = new THREE.Color(BRAND.ink);
const SIG = new THREE.Color(BRAND.signal);
const VEI = new THREE.Color(BRAND.veille);

// three greys and the hero: dark cast, mid steel, machined faces, the cabinet
const G = { cast: 0x5b636b, dark: 0x363c43, steel: 0x6c747c, machined: 0x99a0a6, hero: 0xb7bcc0, cell: 0x2b3036 };
const steel = (c, o = {}) => solid(c, { rough: 0.55, metal: 0.35, ...o });

// THE HUB, in the hub's frame (z the rotor axis). The cast body: a rounded triangle (three circles of `lobe` around
// points `R` out toward each blade) from z0 to z1, the rotor axle's bore through it.
const BODY = { R: 70, lobe: 86, z0: -95, z1: 28, bore: 50 };
// Each neck, along its blade (axial: from the rotor axis): a cone from `a0` to the bearing seat at `a1`, its window.
const NECK = { a0: 92, a1: 158, r0: 104, r1: 134, wall: 11, window: 74 };
// The blade bearing (y in the blade's frame): the outer ring (hub-fixed) and the inner ring (pitched) whose skirt
// hangs into the neck with its internal teeth; the pinion meshes there.
const RING = { y0: -32, outerIn: 116, outerOut: 140, innerIn: 94, innerOut: 115, skirt: -66, teeth: 120, pitchR: 87 };
const RATIO = 6; // the pinion turns six times as far as the blade (illustrative: 30° of pitch = half a turn, readable)
const PIN = { r: RING.pitchR / RATIO, y: -63, ang: 42 * DEG }; // the pinion's place: at `ang` from +z toward +x
const AXIS = RING.pitchR - PIN.r; // the drive's axis, from the blade's axis
const DRIVE = { x: AXIS * Math.sin(PIN.ang), z: AXIS * Math.cos(PIN.ang), gear: [-90, -118, 19], motor: [-118, -168, 22] };
// The cabinet (the −x side of the neck, its face toward +z): 3 × 6 lead blocks and a gauge of six segments.
const CAB = { x: -56, y: -80, z: 49, w: 62, h: 82, d: 32, cols: 3, rows: 6, segs: 6 };

/** Where a pose aims at the drive (between its pinion and its motor) and the cabinet's centre, in the blade's frame:
 *  what plan.js's PITCH.at / BATTERY.at should be (docs/journal/036-model.md, « À changer ailleurs »). */
export const DRIVE_AT = [DRIVE.x, -100, DRIVE.z];
export const CAB_AT = [CAB.x, CAB.y, CAB.z];

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const win = (k, a, b) => ease(clamp01((k - a) / (b - a)));

/** A tube or a ring turned around y: from y0 to y1, radii rin → rout (a bevel on every corner). */
const ringY = (rin, rout, y0, y1, bevel = 1.2, seg = 96) => lathe([[rin, y0], [rout, y0], [rout, y1], [rin, y1], [rin, y0]], seg, { bevel });

/** A lathe around z (the rotor axis): profile [r, z]. */
const latheZ = (profile, seg = 96, o = {}) => lathe(profile, seg, o).rotateX(Math.PI / 2);

/** A soft light that has a place: a billboard with a bright heart and a short fall-off (additive). */
function softGlow(size, color) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uAmount: { value: 0 }, uSize: { value: size } },
    vertexShader: /* glsl */ `
      uniform float uSize; varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
        float a = exp(-r * r * 5.0) * (1.0 - smoothstep(0.6, 1.0, r));
        gl_FragColor = vec4(uColor * (a * uAmount), 1.0);
      }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  m.renderOrder = 6;
  m.frustumCulled = false;
  return m;
}

/** The shape of the cast body: three lobes joined by their tangents, the axle's bore through it. */
function bodyShape() {
  const s = new THREE.Shape();
  let first = true;
  for (let i = 0; i < 3; i++) {
    const phi = (120 * i) * DEG;
    const cx = BODY.R * Math.sin(phi), cy = BODY.R * Math.cos(phi);
    for (let j = 0; j <= 16; j++) {
      const psi = phi - 60 * DEG + (120 * DEG * j) / 16;
      const x = cx + BODY.lobe * Math.sin(psi), y = cy + BODY.lobe * Math.cos(psi);
      if (first) { s.moveTo(x, y); first = false; } else s.lineTo(x, y);
    }
  }
  s.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, BODY.bore, 0, TAU, true);
  s.holes.push(hole);
  return s;
}

export function buildSystem() {
  const root = new THREE.Group();
  root.name = "system";
  const glassShells = []; // [mesh, amountScale]
  const shellGlass = () => glass(BRAND.ink, { base: 0.008, rim: 0.26, power: 2.6, edge: 0.4, spec: 0.45, through: 0.22 });

  /* ───────── the top of the tower (bench only), the yaw ring and its drives ───────── */
  const stub = makePart("stub");
  const stubGlass = shellGlass();
  const stubMesh = addMesh(stub, lathe([[175, -STUB], [160, 0]], 96), stubGlass, { edges: false });
  asShell(stubMesh, 18);
  const flangeMat = steel(G.dark);
  addMesh(stub, ringY(146, 172, -16, 0, 1.5), flangeMat);

  const yaw = makePart("yaw");
  const yawMat = steel(G.machined);
  addMesh(yaw, ringY(YAW.r - 10, YAW.r + 24, 0, 30, 2), yawMat);
  const yawTeeth = [];
  for (let i = 0; i < 96; i++) yawTeeth.push(new THREE.BoxGeometry(4, 22, 7).translate(0, 15, YAW.r + 27).applyMatrix4(new THREE.Matrix4().makeRotationY((i / 96) * TAU)));
  const yawTeethGeo = mergeGeometries(yawTeeth);
  addMesh(yaw, yawTeethGeo, yawMat, { edges: false });
  const yawDriveMat = steel(G.steel);
  for (let i = 0; i < YAW.motors; i++) {
    const a = (30 + 60 * i) * DEG;
    const x = Math.sin(a) * (YAW.r + 52), z = Math.cos(a) * (YAW.r + 52);
    addMesh(yaw, cyl(17, 46, 2), yawDriveMat, { pos: [x, 66, z] });
    addMesh(yaw, cyl(13, 58, 2), yawDriveMat, { pos: [x, 118, z] });
    addMesh(yaw, cyl(8, 26, 1), yawMat, { pos: [x, 32, z], edges: false });
  }

  /* ───────── the carrier: its foot on the yaw ring, the swan neck up to the axle ───────── */
  const carrier = makePart("carrier");
  const carMat = steel(G.dark, { rough: 0.62 });
  addMesh(carrier, ringY(110, YAW.r + 78, 30, 52, 2.5), carMat);
  const neckPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 40, -70), new THREE.Vector3(0, 120, -50), new THREE.Vector3(0, 200, 0), new THREE.Vector3(0, HUB.at[1], 70),
  ]);
  const swan = new THREE.TubeGeometry(neckPath, 32, 96, 40, false);
  addMesh(carrier, swan, carMat, { edges: false });
  // the cap where the swan neck carries the stator and the axle: a flange facing the wind
  addMesh(carrier, cyl(118, 30, 3), carMat, { pos: [0, HUB.at[1], 70], rot: [Math.PI / 2, 0, 0] });
  // the rear frame (the electrics' platform)
  addMesh(carrier, box(200, 22, 250, 3), carMat, { pos: [0, 70, -260] });
  addMesh(carrier, box(16, 60, 250, 2), carMat, { pos: [-92, 110, -260] });
  addMesh(carrier, box(16, 60, 250, 2), carMat, { pos: [92, 110, -260] });
  // the axle pin (fixed): from the carrier through the generator into the hub's bore
  const axleMat = steel(G.machined);
  addMesh(carrier, cyl(44, HUB.at[2] + 40 - 70, 2), axleMat, { pos: [0, HUB.at[1], (70 + HUB.at[2] + 40) / 2], rot: [Math.PI / 2, 0, 0] });

  /* ───────── the ring generator: the stator (fixed) and its rotor (turns with the hub) ───────── */
  const generator = makePart("generator");
  const statorMat = steel(G.steel, { rough: 0.6 });
  const gz = GENERATOR.z, gd = GENERATOR.depth / 2, gy = HUB.at[1];
  addMesh(generator, latheZ([[GENERATOR.outer - 34, gz - gd], [GENERATOR.outer, gz - gd], [GENERATOR.outer, gz + gd], [GENERATOR.outer - 34, gz + gd], [GENERATOR.outer - 34, gz - gd]], 128, { bevel: 2.5 }), statorMat, { pos: [0, gy, 0] });
  // the stator's cooling ribs, across its rim
  const ribs = [];
  for (let i = 0; i < 48; i++) ribs.push(placed(new THREE.BoxGeometry(5, 9, GENERATOR.depth - 14), { pos: [0, GENERATOR.outer + 4, 0], rotZ: 0 }).applyMatrix4(new THREE.Matrix4().makeRotationZ((i / 48) * TAU)));
  addMesh(generator, mergeGeometries(ribs), statorMat, { edges: false, pos: [0, gy, gz] });
  // the stator's support star, back to the carrier's cap
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 30 * DEG;
    const arm = addMesh(generator, box(22, 180, 16, 2), statorMat, { pos: [Math.sin(a) * 150, gy + Math.cos(a) * 150, gz - gd + 8] });
    arm.rotation.z = -a;
  }
  const genSpin = new THREE.Group(); // the rotor: turns with `rotor`
  genSpin.position.set(0, gy, 0);
  generator.add(genSpin);
  const rotorMat = steel(G.machined);
  const poleMat = steel(G.cast);
  const spinMeshes = [
    addMesh(generator, latheZ([[GENERATOR.inner - 20, gz - gd + 14], [GENERATOR.outer - 40, gz - gd + 14], [GENERATOR.outer - 40, gz + gd - 6], [GENERATOR.inner - 20, gz + gd - 6], [GENERATOR.inner - 20, gz - gd + 14]], 128, { bevel: 2 }), poleMat),
    // the rotor's web toward the hub, and the brake's rim on it
    addMesh(generator, latheZ([[60, gz + gd - 6], [GENERATOR.inner, gz + gd - 6], [GENERATOR.inner, gz + gd + 6], [60, gz + gd + 6], [60, gz + gd - 6]], 96, { bevel: 1.5 }), rotorMat),
    addMesh(generator, latheZ([[GENERATOR.inner + 40, gz + gd + 6], [GENERATOR.inner + 92, gz + gd + 6], [GENERATOR.inner + 92, gz + gd + 16], [GENERATOR.inner + 40, gz + gd + 16], [GENERATOR.inner + 40, gz + gd + 6]], 128, { bevel: 1.2 }), rotorMat),
  ];
  const poles = [];
  for (let i = 0; i < 72; i++) poles.push(new THREE.BoxGeometry(14, 6, GENERATOR.depth - 26).translate(0, GENERATOR.outer - 37, 0).applyMatrix4(new THREE.Matrix4().makeRotationZ((i / 72) * TAU)));
  spinMeshes.push(addMesh(generator, mergeGeometries(poles), rotorMat, { edges: false, pos: [0, 0, gz + 4] }));
  for (const m of spinMeshes) genSpin.add(m);
  // the brake: its caliper astride the rim (fixed to the stator), cold
  const brake = makePart("brake");
  const brakeMat = steel(G.machined, { rough: 0.5 });
  const ba = BRAKE.angle * DEG, br = GENERATOR.inner + 66;
  const bx = Math.sin(ba) * br, by = gy + Math.cos(ba) * br, bz = gz + gd + 11;
  const cal = new THREE.Group();
  cal.position.set(bx, by, bz);
  cal.rotation.z = -ba;
  brake.add(cal);
  for (const m of [
    addMesh(brake, box(BRAKE.w, BRAKE.h + 22, 12, 2), brakeMat, { pos: [0, 0, 14] }),
    addMesh(brake, box(BRAKE.w, BRAKE.h + 22, 12, 2), brakeMat, { pos: [0, 0, -14] }),
    addMesh(brake, box(BRAKE.w, 14, BRAKE.d - 10, 2), brakeMat, { pos: [0, (BRAKE.h + 22) / 2 + 4, 0] }),
    addMesh(brake, box(18, 70, 14, 2), statorMat, { pos: [0, 50, -24] }),
  ]) cal.add(m);

  /* ───────── the cover: Enercon's egg, and the anemometer and the vane on its roof ───────── */
  const cover = makePart("cover");
  const coverGlass = shellGlass();
  const egg = latheZ([[268, 262], [292, 180], [306, 40], [300, -160], [280, -340], [236, -520], [168, -640], [84, -730], [0, NACELLE.tail]], 96);
  const eggMesh = addMesh(cover, egg, coverGlass, { edges: false, pos: [0, NACELLE.y, 0] });
  asShell(eggMesh, 20);
  const vane = makePart("vane");
  cover.add(vane);
  const vaneMat = steel(G.machined);
  const roofY = NACELLE.y + 236;
  addMesh(vane, box(90, 8, 30, 2), vaneMat, { pos: [0, roofY + 4, VANE.at[2] + 10] });
  addMesh(vane, cyl(3.5, VANE.at[1] - roofY, 0.5, 16), vaneMat, { pos: [-30, (VANE.at[1] + roofY) / 2, VANE.at[2]] });
  addMesh(vane, cyl(3.5, VANE.at[1] - roofY, 0.5, 16), vaneMat, { pos: [30, (VANE.at[1] + roofY) / 2, VANE.at[2] + 20] });
  // the anemometer: three cups on three arms
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    addMesh(vane, box(30, 2.5, 2.5, 0.5), vaneMat, { pos: [-30 + Math.cos(a) * 15, VANE.at[1], VANE.at[2] + Math.sin(a) * 15], rot: [0, -a, 0], edges: false });
    addMesh(vane, new THREE.SphereGeometry(7, 16, 8, 0, TAU, 0, Math.PI / 2), vaneMat, { pos: [-30 + Math.cos(a) * 30, VANE.at[1], VANE.at[2] + Math.sin(a) * 30], rot: [Math.PI / 2, 0, -a], edges: false });
  }
  // the vane: a fin on its post
  addMesh(vane, plate([[0, 0], [-44, 6], [-44, 26], [0, 12]], 2, { bevel: 0.5 }), vaneMat, { pos: [31, VANE.at[1] - 6, VANE.at[2] + 20], rot: [0, Math.PI / 2, 0] });

  /* ───────── the hub: turns with the rotor ───────── */
  const hubG = new THREE.Group();
  hubG.position.set(...HUB.at);
  root.add(hubG);
  const hub = makePart("hub");
  hubG.add(hub);
  const castMat = steel(G.cast, { rough: 0.68, metal: 0.25 });
  const castIn = steel(G.cast, { rough: 0.7, metal: 0.2, double: true });
  const seatMat = steel(G.machined);
  addMesh(hub, plate(bodyShape(), BODY.z1 - BODY.z0, { bevel: 6, round: 3, curveSegments: 20 }), castMat, { pos: [0, 0, BODY.z0] });
  // the bell behind: from the cast body back to the generator's rotor
  const bellZ = GENERATOR.z + GENERATOR.depth / 2 + 6 - HUB.at[2];
  addMesh(hub, latheZ([[BODY.bore + 4, BODY.z0 + 4], [120, BODY.z0 + 4], [GENERATOR.inner + 6, bellZ + 20], [GENERATOR.inner + 6, bellZ], [GENERATOR.inner - 14, bellZ], [BODY.bore + 4, BODY.z0 - 30], [BODY.bore + 4, BODY.z0 + 4]], 96, { bevel: 2 }), castMat);
  // the nose of the axle, through the bore: its nut and its cap
  addMesh(hub, cyl(BODY.bore - 4, 22, 2), seatMat, { pos: [0, 0, BODY.z1 + 8], rot: [Math.PI / 2, 0, 0] });
  const spinner = makePart("spinner");
  hubG.add(spinner);
  const spinGlass = shellGlass();
  const spin = latheZ([[0, HUB.nose], [96, HUB.nose - 22], [178, HUB.nose - 84], [242, 170], [280, 70], [HUB.spinner, -30], [286, -110], [262, -136]], 96);
  const spinMesh = addMesh(spinner, spin, spinGlass, { edges: false });
  asShell(spinMesh, 22);

  const rootK = [], pitchK = [], motorA = [], battA = [], stubs = [];
  // the blade's solid root: full length in the scene (the glass blade goes on from it), cut short on the bench with
  // its section light; a fairing on its leading edge shows the pitch turning
  const rootStub = () => {
    const g = new THREE.Group();
    g.position.y = 6;
    g.add(addMesh(roots, lathe([[0, 0], [108, 0], [108, BEARING.stub - 6], [0, BEARING.stub - 6]], 96, { bevel: 2 }), rootMat));
    g.add(addMesh(roots, box(12, BEARING.stub - 40, 16, 3), edgeMat, { pos: [109, 14 + (BEARING.stub - 40) / 2, 0] }));
    const cut = addMesh(roots, cyl(100, 2, 0.5), cutMat, { pos: [0, BEARING.stub - 5, 0], edges: false });
    g.add(cut);
    stubs.push({ g, cut });
    return g;
  };
  const drives = makePart("drives");
  const batteries = makePart("batteries");
  const roots = makePart("roots");
  hubG.add(drives, batteries, roots);
  const motorMat = steel(G.steel, { rough: 0.5 });
  const gearMat = steel(G.machined);
  const pinMat = steel(G.machined, { rough: 0.4 });
  const keyMat = steel(G.hero, { rough: 0.4 });
  const bandMat = glow(BRAND.veille, 0);
  const rootMat = steel(0x40464d, { rough: 0.55, metal: 0.15 });
  const cutMat = steel(G.machined, { rough: 0.6, double: true });
  const edgeMat = steel(G.hero, { rough: 0.5 });
  const nutMat = steel(G.machined);
  const ringMat = steel(G.machined, { rough: 0.45 });
  const innerMat = steel(G.machined, { rough: 0.45 });

  // shared geometries
  const toothGeo = (() => {
    const t = [];
    for (let i = 0; i < RING.teeth; i++) {
      const a = (i / RING.teeth) * TAU;
      t.push(new THREE.BoxGeometry(2.4, 12, 7).translate(0, 0, RING.innerIn - 3.2).applyMatrix4(new THREE.Matrix4().makeRotationY(a)));
    }
    return mergeGeometries(t);
  })();
  const pinionGeo = (() => {
    const t = [new THREE.CylinderGeometry(PIN.r - 2, PIN.r - 2, 26, 24)];
    for (let i = 0; i < RING.teeth / RATIO; i++) {
      const a = (i / (RING.teeth / RATIO)) * TAU;
      t.push(new THREE.BoxGeometry(2.4, 26, 4.5).translate(0, 0, PIN.r - 0.4).applyMatrix4(new THREE.Matrix4().makeRotationY(a)));
    }
    return mergeGeometries(t);
  })();
  const nutGeo = (() => {
    const t = [];
    for (let i = 0; i < 36; i++) t.push(new THREE.CylinderGeometry(3.4, 3.4, 5, 6).translate(0, 2.5, 111.5).applyMatrix4(new THREE.Matrix4().makeRotationY(((i + 0.5) / 36) * TAU)));
    return mergeGeometries(t);
  })();
  const finsGeo = (() => {
    const t = [];
    for (let i = 0; i < 7; i++) t.push(new THREE.CylinderGeometry(DRIVE.motor[2] + 2.2, DRIVE.motor[2] + 2.2, 2.6, 32).translate(0, -6 - i * 6.5, 0));
    return mergeGeometries(t);
  })();
  const cellGeo = (() => {
    // 18 lead blocks on the cabinet's face, each with its two terminals
    const t = [];
    const cw = (CAB.w - 20) / CAB.cols, ch = (CAB.h - 10) / CAB.rows;
    for (let c = 0; c < CAB.cols; c++) {
      for (let r = 0; r < CAB.rows; r++) {
        const x = -CAB.w / 2 + 5 + cw * (c + 0.5), y = -CAB.h / 2 + 5 + ch * (r + 0.5);
        t.push(new THREE.BoxGeometry(cw - 2.6, ch - 2.4, 5).translate(x, y, CAB.d / 2 + 1));
      }
    }
    return mergeGeometries(t);
  })();
  const termGeo = (() => {
    const t = [];
    const cw = (CAB.w - 20) / CAB.cols, ch = (CAB.h - 10) / CAB.rows;
    for (let c = 0; c < CAB.cols; c++) {
      for (let r = 0; r < CAB.rows; r++) {
        const x = -CAB.w / 2 + 5 + cw * (c + 0.5), y = -CAB.h / 2 + 5 + ch * (r + 0.5);
        for (const s of [-1, 1]) t.push(new THREE.BoxGeometry(2.4, 2.4, 2).translate(x + s * (cw * 0.26), y + ch * 0.16, CAB.d / 2 + 4.4));
      }
    }
    return mergeGeometries(t);
  })();

  const battMats = [], segMats = [], halos = [], beacons = [], pinions = [], heartMats = new Set();
  const neckGeo = new THREE.LatheGeometry(
    [[NECK.r0 - NECK.wall, NECK.a0], [NECK.r0, NECK.a0], [NECK.r1, NECK.a1 - 10], [RING.outerOut, NECK.a1 - 6], [RING.outerOut, NECK.a1], [NECK.r1 - NECK.wall, NECK.a1], [NECK.r0 - NECK.wall, NECK.a0]]
      .map(([r, a]) => new THREE.Vector2(r, a - BEARING.r)), 64, NECK.window * DEG, TAU - 2 * NECK.window * DEG,
  );
  neckGeo.computeVertexNormals();
  // the cut faces of the window: two flat caps, machined-light like a section
  const capGeo = (sign) => {
    const prof = [[NECK.r0 - NECK.wall, NECK.a0], [NECK.r0, NECK.a0], [NECK.r1, NECK.a1 - 10], [RING.outerOut, NECK.a1 - 6], [RING.outerOut, NECK.a1], [NECK.r1 - NECK.wall, NECK.a1]];
    const sh = new THREE.Shape(prof.map(([r, a]) => new THREE.Vector2(r, a - BEARING.r)));
    return new THREE.ShapeGeometry(sh); // in (x = radius, y): turned to its window's edge where it is placed
  };

  for (let k = 0; k < 3; k++) {
    const r = new THREE.Group();
    r.rotation.z = -TAU * k / 3;
    const flange = new THREE.Group();
    flange.position.set(0, BEARING.r, 0); // the blade's frame: origin at its bearing's flange
    r.add(flange);
    hubG.add(r);
    rootK.push(flange);

    // the neck of the casting, its window toward the wind, and the bearing's outer ring on its seat
    const neckMesh = addMesh(hub, neckGeo, castIn, { threshold: 30 });
    flange.add(neckMesh);
    for (const sgn of [1, -1]) {
      // a cut face: the profile laid in the plane at angle ±window from +z (x = r·sin, z = r·cos)
      const a = sgn * NECK.window * DEG;
      const cap = addMesh(hub, capGeo(sgn), cutMat, { edges: false });
      cap.rotation.y = a - Math.PI / 2; // the shape's +x (radius) turned to (sin a, 0, cos a)
      flange.add(cap);
    }
    const outer = addMesh(hub, ringY(RING.outerIn, RING.outerOut, RING.y0, -2, 1.5), seatMat);
    flange.add(outer);

    // the pitched frame: the inner ring (toothed skirt into the neck), the blade's solid root, its bolts
    const p = new THREE.Group();
    flange.add(p);
    pitchK.push(p);
    for (const m of [
      addMesh(roots, ringY(RING.innerIn, RING.innerOut, RING.skirt, 0, 1.2), innerMat),
      addMesh(roots, toothGeo, innerMat, { edges: false, pos: [0, RING.skirt + 8, 0] }),
      // the ring's index under its skirt, toward the window: it turns with the blade
      addMesh(roots, box(12, 10, 8, 1), keyMat, { pos: [-Math.sin(40 * DEG) * (RING.innerIn + 9), RING.skirt - 4, Math.cos(40 * DEG) * (RING.innerIn + 9)], rot: [0, -40 * DEG, 0], edges: false }),
      rootStub(),
      addMesh(roots, ringY(100, 116, 0, 6, 1), rootMat),
      addMesh(roots, nutGeo, nutMat, { edges: false, pos: [0, 6, 0] }),
      // the leading edge's fairing: what shows the pitch turning
    ]) p.add(m);

    // THE PITCH DRIVE: motor, gearbox, the pinion in the ring's teeth; a bracket to the neck
    const drive = new THREE.Group();
    drive.position.set(DRIVE.x, 0, DRIVE.z);
    flange.add(drive);
    const pinion = addMesh(drives, pinionGeo, pinMat, { edges: false });
    pinion.position.y = PIN.y;
    pinions.push(pinion);
    // one tooth of light: what shows the pinion turning (six times the blade)
    const key = addMesh(drives, box(3.2, 27, 5.4, 0.4), keyMat, { pos: [0, 0, PIN.r - 0.2], edges: false });
    pinion.add(key);
    // under it, a collar half light, half dark: half a turn of the pinion reads at a glance
    const halfL = addMesh(drives, new THREE.CylinderGeometry(PIN.r - 1, PIN.r - 1, 10, 24, 1, false, -Math.PI / 2, Math.PI), keyMat, { edges: false, pos: [0, -18, 0] });
    const halfD = addMesh(drives, new THREE.CylinderGeometry(PIN.r - 1, PIN.r - 1, 10, 24, 1, false, Math.PI / 2, Math.PI), motorMat, { edges: false, pos: [0, -18, 0] });
    pinion.add(halfL, halfD);
    for (const m of [
      pinion,
      addMesh(drives, cyl(5, -DRIVE.gear[0] + PIN.y, 0.5, 24), gearMat, { pos: [0, (DRIVE.gear[0] + PIN.y) / 2 - 2, 0] }),
      addMesh(drives, cyl(DRIVE.gear[2], DRIVE.gear[0] - DRIVE.gear[1], 2), gearMat, { pos: [0, (DRIVE.gear[0] + DRIVE.gear[1]) / 2, 0] }),
      addMesh(drives, cyl(DRIVE.gear[2] + 7, 6, 1.5), gearMat, { pos: [0, DRIVE.gear[0] + 3, 0] }),
      addMesh(drives, cyl(DRIVE.motor[2], DRIVE.motor[0] - DRIVE.motor[1], 2.5), motorMat, { pos: [0, (DRIVE.motor[0] + DRIVE.motor[1]) / 2, 0] }),
      addMesh(drives, finsGeo, motorMat, { edges: false, pos: [0, DRIVE.motor[0], 0] }),
      addMesh(drives, box(16, 20, 12, 2), motorMat, { pos: [-DRIVE.motor[2] - 4, DRIVE.motor[0] - 20, 6] }),
      // the bracket that holds it to the neck's wall
      addMesh(drives, box(10, 14, 44, 2), gearMat, { pos: [DRIVE.gear[2] + 10, DRIVE.gear[0] - 4, -6] }),
    ]) drive.add(m);
    const band = addMesh(drives, cyl(DRIVE.motor[2] + 1.2, 6, 0.4), bandMat, { pos: [0, DRIVE.motor[1] + 9, 0], edges: false });
    drive.add(band);
    motorA.push(anchor(drive, 0, (DRIVE.gear[0] + DRIVE.motor[1]) / 2, 0));

    // ITS OWN BATTERY: the cabinet, 18 lead blocks, the gauge on its face, its light
    const cab = new THREE.Group();
    cab.position.set(CAB.x, CAB.y, CAB.z);
    flange.add(cab);
    const own = { body: steel(G.hero, { rough: 0.55, metal: 0.15 }), cell: steel(G.cell, { rough: 0.6, metal: 0.1 }), term: glow(BRAND.veille, 0) };
    battMats.push(own.term);
    const segs = [];
    const made = [
      addMesh(batteries, box(CAB.w, CAB.h, CAB.d, 2.5), own.body),
      addMesh(batteries, cellGeo, own.cell, { edges: false }),
      addMesh(batteries, termGeo, own.term, { edges: false }),
      // its feet, bolted to the casting behind it
      addMesh(batteries, box(CAB.w - 12, 8, 10, 1.5), own.body, { pos: [0, -CAB.h / 2 + 10, -CAB.d / 2 - 4] }),
      addMesh(batteries, box(CAB.w - 12, 8, 10, 1.5), own.body, { pos: [0, CAB.h / 2 - 10, -CAB.d / 2 - 4] }),
      // the gauge's frame: a dark window down the face's right side
      addMesh(batteries, box(11, CAB.h - 8, 2, 0.6), own.cell, { pos: [CAB.w / 2 - 8, 0, CAB.d / 2 + 1], edges: false }),
    ];
    // the gauge: six segments up the face's right side
    for (let s = 0; s < CAB.segs; s++) {
      const m = glow(BRAND.veille, 0);
      segs.push(m);
      const sh = (CAB.h - 14) / CAB.segs;
      made.push(addMesh(batteries, box(8, sh - 3, 2, 0.5), m, { pos: [CAB.w / 2 - 8, -CAB.h / 2 + 7 + sh * (s + 0.5), CAB.d / 2 + 2.4], edges: false }));
    }
    for (const m of made) cab.add(m);
    segMats.push(segs);
    const halo = softGlow(80, BRAND.veille);
    halo.position.set(CAB.w / 2 - 8, 0, CAB.d / 2 + 10);
    cab.add(halo);
    halos.push(halo);
    // seen from afar (the hook, 130 m), the three cabinets are one point of veille: a beacon drawn through the
    // casting, which fades out as soon as it would be bigger than a point
    const beacon = softGlow(420, BRAND.veille);
    beacon.material.depthTest = false;
        beacon.material.vertexShader = beacon.material.vertexShader
      .replace("varying vec2 vUv;", "varying vec2 vUv; varying float vFar;")
      .replace("gl_Position", "vFar = 1.0 - smoothstep(0.05, 0.1, uSize / max(1.0, -mv.z)); gl_Position");
    beacon.material.fragmentShader = beacon.material.fragmentShader
      .replace("varying vec2 vUv;", "varying vec2 vUv; varying float vFar;")
      .replace("(a * uAmount)", "(a * uAmount * vFar)");
    beacon.position.set(0, 0, CAB.d / 2 + 10);
    cab.add(beacon);
    beacons.push(beacon);
    battA.push(anchor(cab, 0, 0, CAB.d / 2));
    if (k === 0) for (const m of made) { heartMats.add(m.material); for (const c of m.children) if (c.material) heartMats.add(c.material); }
  }

  root.add(stub, yaw, carrier, generator, brake, cover);

  const parts = { stub, yaw, carrier, generator, brake, cover, hub, spinner, drives, batteries, roots };
  const A = {
    hub: hubG, root: rootK, pitch: pitchK, motor: motorA, battery: battA, heart: battA[0],
    gen: anchor(generator, 0, HUB.at[1], GENERATOR.z),
    brake: anchor(cal, 0, 0, 0),
    carrier: anchor(carrier, 0, 150, -20), centre: anchor(root, ...SYSTEM.centre),
  };

  // every solid and every edge line, to dim around the heart and to light what the voice names
  const dims = [];
  const seen = new Set();
  const collect = (part, tag) => {
    for (const mat of part.userData.part.mats) {
      if (seen.has(mat) || heartMats.has(mat)) continue;
      seen.add(mat);
      if (mat.isLineMaterial || mat.isMeshStandardMaterial) dims.push({ mat, c0: mat.color.clone(), tag, line: !!mat.isLineMaterial });
    }
  };
  collect(stub, "mast"); collect(yaw, "mast"); collect(carrier, "nacelle"); collect(generator, "gen"); collect(brake, "brake");
  collect(vane, "nacelle"); collect(hub, "hub"); collect(drives, "motor"); collect(batteries, "batt"); collect(roots, "hub");
  const glassAll = [[stubGlass, "mast"], [coverGlass, "nacelle"], [spinGlass, "spin"]];
  const lit = { mast: 0, nacelle: 0, gen: 0, hub: 0, motor: 0, brake: 0, batt: 0 };
  const tmp = new THREE.Color();

  const segK = new Float32Array(CAB.segs);
  return {
    root, A, parts,
    update({
      bench = 0, cover: cv = 1, rotor = 0, pitchA = 0, pitchB = 0, pitchC = 0, explode: k = 0, batt = 0, charge = 1,
      motors = 0, heart = 0, litMast = 0, litNacelle = 0, litGen = 0, litHub = 0, litMotor = 0, litBrake = 0,
    } = {}, time = 0, px = 1600) {
      stub.visible = bench > 0.5;
      const hk = clamp01(heart);
      const dim = 1 - 0.72 * hk;
      const ex = bench > 0.5 ? clamp01(k) : 0;

      // the rotor: the hub and the generator's rotor turn together (no gearbox)
      hubG.rotation.z = -TAU * rotor;
      genSpin.rotation.z = -TAU * rotor;
      const pitches = [pitchA, pitchB, pitchC];
      for (let i = 0; i < 3; i++) {
        pitchK[i].rotation.y = -pitches[i] * DEG;
        pinions[i].rotation.y = -pitches[i] * DEG * RATIO; // the pinion: six times the blade (an internal gear: same sense)
      }

      // the batteries: dark → veille; their gauges count the charge (signal under one half)
      const low = charge < 0.5;
      const litSegs = clamp01(charge) * CAB.segs;
      for (let s = 0; s < CAB.segs; s++) segK[s] = clamp01(litSegs - s);
      for (let i = 0; i < 3; i++) {
        const own = i === 0 ? 1 + 0.25 * hk : 1 - 0.75 * hk;
        const a = clamp01(batt) * own;
        setGlow(battMats[i], a * 0.6, low ? SIG : VEI);
        for (let s = 0; s < CAB.segs; s++) {
          const on = segK[s];
          if (on > 0.01 && a > 0.001) setGlow(segMats[i][s], a * (0.25 + 2.1 * on), low ? SIG : VEI);
          else setGlow(segMats[i][s], 0.05 * dim, INK);
        }
        const hm = halos[i].material.uniforms;
        hm.uAmount.value = a * (low ? 0.55 : 0.7);
        hm.uColor.value.copy(low ? SIG : VEI);
        const bm = beacons[i].material.uniforms;
        bm.uAmount.value = a * 0.7;
        bm.uColor.value.copy(low ? SIG : VEI);
      }
      setGlow(bandMat, clamp01(motors) * 1.6 * (1 - 0.6 * hk));

      // dimming around the heart, and the faint veille of the part the voice names
      lit.mast = litMast; lit.nacelle = litNacelle; lit.gen = litGen; lit.hub = litHub; lit.motor = litMotor; lit.brake = litBrake; lit.batt = 0;
      for (let i = 0; i < dims.length; i++) {
        const d = dims[i];
        const l = lit[d.tag] ?? 0;
        d.mat.color.copy(d.c0).multiplyScalar(dim);
        if (!d.line) {
          if (d.tag === "brake") d.mat.emissive.copy(INK).multiplyScalar(0.16 * l);
          else d.mat.emissive.copy(VEI).multiplyScalar(0.14 * l);
        } else if (l > 0.001) {
          d.mat.color.lerp(d.tag === "brake" ? INK : VEI, 0.55 * l);
        }
      }

      // the glass: the cover and the spinner by `cover`, the stub of the tower on the bench
      coverGlass.uniforms.uAmount.value = clamp01(cv) * dim;
      spinGlass.uniforms.uAmount.value = clamp01(cv) * dim * (1 - ex);
      stubGlass.uniforms.uAmount.value = dim;
      tmp.copy(INK).lerp(VEI, 0.7 * clamp01(litMast));
      stubGlass.uniforms.uColor.value.copy(tmp);
      tmp.copy(INK).lerp(VEI, 0.7 * clamp01(litNacelle));
      coverGlass.uniforms.uColor.value.copy(tmp);
      setPartOpacity(spinner, ex > 0.98 ? 0 : 1);

      // THE EXPLODED VIEW (bench): the cover lifts high, the hub comes forward and up a little, each blade's root
      // leaves its bearing, each drive and each cabinet come out of the hub along their blade, the generator stays
      cover.position.y = 700 * win(ex, 0, 0.45);
      hubG.position.set(HUB.at[0], HUB.at[1] + 260 * win(ex, 0.1, 0.6), HUB.at[2] + 170 * win(ex, 0.1, 0.6));
      const eR = win(ex, 0.3, 0.75), eD = win(ex, 0.4, 0.88), eB = win(ex, 0.5, 1);
      for (let i = 0; i < 3; i++) {
        pitchK[i].position.y = 230 * eR;
        stubs[i].g.scale.y = bench > 0.5 ? 0.45 : 1;
        stubs[i].cut.visible = bench > 0.5;
        const drive = motorA[i].parent;
        drive.position.set(DRIVE.x + 30 * eD, 120 * eD, DRIVE.z + 170 * eD);
        const cab = battA[i].parent;
        cab.position.set(CAB.x - 60 * eB, CAB.y + 40 * eB, CAB.z + 260 * eB);
      }
    },
  };
}
