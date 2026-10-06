// Photoelectric smoke detector (DAAF), modelled in centimetres, Y up.
// Mounting surface at y = 0, cover on top: looking "down" at it is looking up at a ceiling.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makePart, addMesh, solid, glow, lathe, fatLine, lineMat, mergeGeometries } from "@kit/build3d.js";

const DEG = Math.PI / 180;
const PCB_TOP = 0.89;
const CH_FLOOR = PCB_TOP + 0.12; // chamber floor top
const BEAM_Y = CH_FLOOR + 0.5; // height of the optical axis
export const PD_ANGLE = -50 * DEG; // photodiode sits 50° off the beam (far side): it only ever sees scattered light

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (r, h, seg = 64, open = false) => new THREE.CylinderGeometry(r, r, h, seg, 1, open);

function placed(geometry, { pos = [0, 0, 0], rotY = 0, rotZ = 0 }) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, rotZ, "YXZ")),
    new THREE.Vector3(1, 1, 1),
  );
  return geometry.clone().applyMatrix4(m);
}

const anchor = (parent, x, y, z) => {
  const o = new THREE.Object3D();
  o.position.set(x, y, z);
  parent.add(o);
  return o;
};

export function buildDetector() {
  const root = new THREE.Group();
  const A = {}; // callout anchors
  const fx = {}; // animated bits

  /* ── base: mounting plate + body wall ─────────────────────────────── */
  const base = makePart("base", { lift: 0 });
  addMesh(base, lathe([[0, 0], [5.25, 0], [5.25, 1.5], [5.02, 1.5], [5.02, 0.4], [0, 0.4]]), solid(BRAND.plastic, { rough: 0.62, double: true }));

  /* ── circuit board ────────────────────────────────────────────────── */
  const pcb = makePart("pcb", { lift: 2.3, delay: 0.3 });
  addMesh(pcb, cyl(4.8, 0.14, 96), solid(BRAND.pcb, { rough: 0.6 }), { pos: [0, PCB_TOP - 0.07, 0], edgeOpacity: 0.7 });
  const chip = solid(0x0d1012, { rough: 0.5 });
  addMesh(pcb, box(1.15, 0.2, 1.15), chip, { pos: [1.0, PCB_TOP + 0.1, 3.35], rot: [0, 0.3, 0] }); // microcontroller
  const smd = [];
  const r = rng(11);
  for (let i = 0; i < 16; i++) {
    const ang = (-150 + r() * 120) * DEG; // back half of the board, clear of battery and sounder
    const rad = 3.0 + r() * 1.45;
    smd.push(placed(box(0.34, 0.12, 0.17), { pos: [Math.cos(ang) * rad, PCB_TOP + 0.06, Math.sin(ang) * rad], rotY: r() > 0.5 ? 0 : Math.PI / 2 }));
  }
  addMesh(pcb, mergeGeometries(smd), solid(0x1c2024, { rough: 0.5 }), { edgeOpacity: 0.45, edgeWidth: 1.4 });
  addMesh(pcb, cyl(0.3, 0.62, 24), solid(0x15191c, { rough: 0.4 }), { pos: [-0.9, PCB_TOP + 0.31, -3.7] }); // capacitor
  // copper traces: quiet detail, not information
  const traces = new THREE.Group();
  const traceMat = lineMat(0x2f9d76, 1.6, { opacity: 0.55 });
  for (let i = 0; i < 9; i++) {
    const a0 = (-160 + i * 16 + r() * 8) * DEG;
    const r0 = 2.75;
    const r1 = 3.3 + r() * 1.2;
    const a1 = a0 + (r() - 0.5) * 0.5;
    const line = fatLine(
      [
        [Math.cos(a0) * r0, PCB_TOP + 0.012, Math.sin(a0) * r0],
        [Math.cos(a0) * r1, PCB_TOP + 0.012, Math.sin(a0) * r1],
        [Math.cos(a1) * (r1 + 0.25), PCB_TOP + 0.012, Math.sin(a1) * (r1 + 0.25)],
      ],
      { width: 1.6 },
    );
    line.material = traceMat;
    traces.add(line);
  }
  pcb.add(traces);
  pcb.userData.part.mats.add(traceMat);
  A.pcb = anchor(pcb, 1.0, PCB_TOP + 0.2, 3.35);

  /* ── battery: sealed lithium cell ─────────────────────────────────── */
  const battery = makePart("battery", { lift: 4.3, delay: 0.24 });
  const cell = [-3.45, PCB_TOP + 0.9, -0.1];
  addMesh(battery, cyl(0.85, 3.2, 48), solid(0x20262b, { rough: 0.45 }), { pos: cell, rot: [Math.PI / 2, 0, 0] });
  addMesh(battery, cyl(0.87, 1.5, 48, true), solid(BRAND.plastic, { rough: 0.5 }), { pos: [cell[0], cell[1], cell[2] - 0.2], rot: [Math.PI / 2, 0, 0], edgeWidth: 1.4 });
  addMesh(battery, cyl(0.3, 0.14, 24), solid(0x9aa0a4, { rough: 0.3, metal: 0.4 }), { pos: [cell[0], cell[1], cell[2] + 1.67], rot: [Math.PI / 2, 0, 0], edgeOpacity: 0.5 });
  A.battery = anchor(battery, cell[0] - 0.5, cell[1] + 0.6, cell[2] + 0.6);

  /* ── piezo sounder ────────────────────────────────────────────────── */
  const buzzer = makePart("buzzer", { lift: 4.3, delay: 0.24 });
  const bz = [2.55, PCB_TOP, 2.4];
  addMesh(buzzer, cyl(1.05, 0.8, 64), solid(0x0d0f11, { rough: 0.55 }), { pos: [bz[0], bz[1] + 0.4, bz[2]] });
  addMesh(buzzer, cyl(0.78, 0.06, 48), solid(0x191d20, { rough: 0.4 }), { pos: [bz[0], bz[1] + 0.83, bz[2]], edgeOpacity: 0.5 });
  fx.buzzerCore = glow(BRAND.signal, 0);
  addMesh(buzzer, cyl(0.22, 0.05, 24), fx.buzzerCore, { pos: [bz[0], bz[1] + 0.87, bz[2]], edges: false });
  fx.rings = [];
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.96, 1.04, 96), glow(BRAND.signal, 3.2, { additive: true, double: true }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(bz[0], bz[1] + 0.9, bz[2]);
    ring.visible = false;
    buzzer.add(ring);
    fx.rings.push(ring);
  }
  A.buzzer = anchor(buzzer, bz[0] + 0.6, bz[1] + 0.9, bz[2] + 0.5);
  fx.buzzerPos = new THREE.Vector3(bz[0], bz[1] + 0.9, bz[2]);

  /* ── optical chamber ──────────────────────────────────────────────── */
  const chamber = makePart("chamber", { lift: 5.6, delay: 0.18 });
  const matte = () => solid(0x0b0d0f, { rough: 0.95 });
  addMesh(chamber, cyl(2.32, 0.12, 96), matte(), { pos: [0, CH_FLOOR - 0.06, 0], edgeOpacity: 0.7 });
  // the labyrinth: two rings of opposed blades. Air drifts through; light has no straight path.
  const blades = [];
  const N = 18;
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2;
    const th2 = th + Math.PI / N;
    blades.push(placed(box(0.74, 1.1, 0.07), { pos: [Math.cos(th) * 2.02, CH_FLOOR + 0.55, Math.sin(th) * 2.02], rotY: -(th + 55 * DEG) }));
    blades.push(placed(box(0.42, 1.1, 0.07), { pos: [Math.cos(th2) * 1.68, CH_FLOOR + 0.55, Math.sin(th2) * 1.68], rotY: -(th2 - 50 * DEG) }));
  }
  addMesh(chamber, mergeGeometries(blades), matte(), { edgeOpacity: 0.62, edgeWidth: 1.7 });

  // infrared LED, firing along +X
  addMesh(chamber, box(0.62, 0.74, 0.6), solid(BRAND.graphite, { rough: 0.6 }), { pos: [-1.2, CH_FLOOR + 0.37, 0] });
  addMesh(chamber, cyl(0.17, 0.36, 24), solid(0x2a3035, { rough: 0.3 }), { pos: [-0.74, BEAM_Y, 0], rot: [0, 0, Math.PI / 2], edgeOpacity: 0.5 });
  fx.led = glow(BRAND.veille, 0.25);
  addMesh(chamber, new THREE.SphereGeometry(0.17, 24, 16), fx.led, { pos: [-0.56, BEAM_Y, 0], edges: false });
  A.led = anchor(chamber, -1.2, CH_FLOOR + 0.8, 0);

  // the beam: a cone of light that dies in a trap on the far wall
  const BEAM_X0 = -0.5;
  const BEAM_X1 = 1.46;
  const beamLen = BEAM_X1 - BEAM_X0;
  fx.beam = glow(BRAND.veille, 1.4, { additive: true, double: true });
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.1, beamLen, 32, 1, true), fx.beam);
  cone.rotation.z = -Math.PI / 2; // +Y → +X, wide end downstream
  cone.position.set(BEAM_X0 + beamLen / 2, BEAM_Y, 0);
  chamber.add(cone);
  fx.beamCore = fatLine([[BEAM_X0, BEAM_Y, 0], [BEAM_X1, BEAM_Y, 0]], { color: BRAND.veille, width: 4, hdr: 4, additive: true });
  chamber.add(fx.beamCore);
  addMesh(chamber, mergeGeometries([placed(box(0.5, 0.9, 0.07), { pos: [1.5, CH_FLOOR + 0.45, 0.17], rotY: -35 * DEG }), placed(box(0.5, 0.9, 0.07), { pos: [1.5, CH_FLOOR + 0.45, -0.17], rotY: 35 * DEG })]), matte(), { edgeOpacity: 0.6 }); // light trap

  // photodiode, off-axis, looking at the middle of the beam
  const pd = new THREE.Vector3(Math.cos(PD_ANGLE), 0, Math.sin(PD_ANGLE));
  addMesh(chamber, box(0.6, 0.74, 0.6), solid(BRAND.graphite, { rough: 0.6 }), { pos: [pd.x * 1.3, CH_FLOOR + 0.37, pd.z * 1.3], rot: [0, -PD_ANGLE, 0] });
  fx.pd = glow(BRAND.veille, 0);
  const lens = [pd.x * 0.94, BEAM_Y, pd.z * 0.94];
  addMesh(chamber, new THREE.SphereGeometry(0.15, 24, 16), fx.pd, { pos: lens, edges: false });
  fx.pdHalo = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 16), glow(BRAND.veille, 2.4, { additive: true }));
  fx.pdHalo.position.set(...lens);
  chamber.add(fx.pdHalo);
  A.pd = anchor(chamber, pd.x * 1.3, CH_FLOOR + 0.8, pd.z * 1.3);
  // baffle: blocks the direct LED → photodiode path
  addMesh(chamber, box(0.5, 0.95, 0.06), matte(), { pos: [-0.32, CH_FLOOR + 0.47, -0.36], rot: [0, 120 * DEG, 0], edgeOpacity: 0.6 });

  // what the photodiode watches: a dark wedge across the beam
  const viewA = [-0.08, BEAM_Y, -0.06];
  const viewB = [0.66, BEAM_Y, -0.06];
  const wedge = new THREE.BufferGeometry();
  wedge.setAttribute("position", new THREE.Float32BufferAttribute([...lens, ...viewA, ...viewB], 3));
  wedge.computeVertexNormals();
  fx.view = glow(BRAND.ink, 1, { additive: true, double: true });
  chamber.add(new THREE.Mesh(wedge, fx.view));
  fx.viewLines = [fatLine([lens, viewA], { width: 1.8, dashed: true, dashSize: 0.09, gapSize: 0.07 }), fatLine([lens, viewB], { width: 1.8, dashed: true, dashSize: 0.09, gapSize: 0.07 })];
  fx.viewLines.forEach((l) => chamber.add(l));

  // scattered light: rays from particles in the beam to the photodiode
  fx.rays = [];
  const rr = rng(4);
  for (let i = 0; i < 7; i++) {
    const hit = [-0.1 + (i / 6) * 0.78, BEAM_Y + (rr() - 0.5) * 0.14, (rr() - 0.5) * 0.14];
    const ray = fatLine([hit, lens], { color: BRAND.veille, width: 2.2, hdr: 3.2, additive: true });
    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), glow(BRAND.veille, 6, { additive: true }));
    spark.position.set(...hit);
    chamber.add(ray, spark);
    fx.rays.push({ ray, spark, phase: rr() });
  }

  // outside light, stopped by the blades
  fx.daylight = [];
  [20, 95, 160, 215, 290, 335].forEach((deg) => {
    const a = deg * DEG;
    const from = [Math.cos(a) * 5.4, CH_FLOOR + 0.6, Math.sin(a) * 5.4];
    const to = [Math.cos(a) * 2.42, CH_FLOOR + 0.6, Math.sin(a) * 2.42];
    const line = fatLine([from, to], { color: BRAND.ink, width: 2.4, hdr: 1.6, dashed: true, dashSize: 0.01, gapSize: 100 });
    const stop = fatLine(
      [
        [to[0] - Math.sin(a) * 0.22, to[1], to[2] + Math.cos(a) * 0.22],
        [to[0] + Math.sin(a) * 0.22, to[1], to[2] - Math.cos(a) * 0.22],
      ],
      { color: BRAND.signal, width: 3, hdr: 2 },
    );
    chamber.add(line, stop);
    fx.daylight.push({ line, stop, length: 5.4 - 2.42 });
  });
  A.blade = anchor(chamber, Math.cos(140 * DEG) * 2.2, CH_FLOOR + 1.1, Math.sin(140 * DEG) * 2.2);
  A.chamber = anchor(chamber, -1.5, CH_FLOOR + 1.15, 1.6);
  fx.chamberCenter = anchor(chamber, 0, BEAM_Y, 0);
  fx.pdLens = anchor(chamber, ...lens);

  // smoke and air: particles that drift in through the labyrinth. In the beam, they light up.
  fx.smoke = makeFlow({ count: 230, seed: 21, color: BRAND.signal, size: [0.06, 0.16] });
  fx.puffs = makeFlow({ count: 90, seed: 33, color: BRAND.signal, size: [0.7, 1.5], alpha: 0.075, soft: 1.1 });
  fx.air = makeFlow({ count: 220, seed: 8, color: BRAND.ink, size: [0.07, 0.15], alpha: 1, delay: 1.6, travel: [0.8, 1.4] });
  chamber.add(fx.puffs.points, fx.smoke.points, fx.air.points);

  /* ── insect mesh ──────────────────────────────────────────────────── */
  const mesh = makePart("mesh", { lift: 7.7, delay: 0.12 });
  const meshMat = solid(BRAND.ink, { opacity: 0.05, double: true });
  meshMat.depthWrite = false;
  meshMat.userData.depthWrite = false;
  addMesh(mesh, cyl(2.45, 1.16, 96, true), meshMat, { pos: [0, CH_FLOOR + 0.6, 0], edgeOpacity: 0.55, edgeWidth: 1.6 });
  const wires = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    wires.push(Math.cos(a) * 2.45, CH_FLOOR + 0.03, Math.sin(a) * 2.45, Math.cos(a) * 2.45, CH_FLOOR + 1.17, Math.sin(a) * 2.45);
  }
  const wireGeo = new THREE.BufferGeometry();
  wireGeo.setAttribute("position", new THREE.Float32BufferAttribute(wires, 3));
  const wireMat = new THREE.LineBasicMaterial({ color: BRAND.ink, transparent: true, opacity: 0.2, depthWrite: false });
  wireMat.userData = { base: 0.2, transparent: true, depthWrite: false };
  mesh.add(new THREE.LineSegments(wireGeo, wireMat));
  mesh.userData.part.mats.add(wireMat);

  /* ── chamber lid ──────────────────────────────────────────────────── */
  const lid = makePart("lid", { lift: 9.3, delay: 0.06 });
  addMesh(lid, cyl(2.45, 0.14, 96), matte(), { pos: [0, CH_FLOOR + 1.17, 0], edgeOpacity: 0.75 });
  addMesh(lid, cyl(0.5, 0.08, 32), matte(), { pos: [0, CH_FLOOR + 1.28, 0], edgeOpacity: 0.5 });

  /* ── cover ────────────────────────────────────────────────────────── */
  const cover = makePart("cover", { lift: 12.2, delay: 0 });
  const RIM = 1.5;
  const shell = () => solid(BRAND.plastic, { rough: 0.6, double: true });
  addMesh(cover, lathe([[5.3, 0], [5.3, 0.3], [5.12, 0.8], [4.72, 1.18], [4.35, 1.32], [4.35, 1.2], [4.62, 1.06], [4.98, 0.72], [5.12, 0.3], [5.12, 0], [5.3, 0]].map(([x, y]) => [x, y + RIM])), shell());
  const ribs = [];
  for (let i = 0; i < 24; i++) {
    const th = (i / 24) * Math.PI * 2;
    ribs.push(placed(box(1.5, 0.42, 0.13), { pos: [Math.cos(th) * 3.68, RIM + 1.43, Math.sin(th) * 3.68], rotY: -th, rotZ: -14 * DEG }));
  }
  addMesh(cover, mergeGeometries(ribs), shell(), { edgeWidth: 1.5 });
  addMesh(cover, lathe([[0, 1.5], [3.0, 1.5], [3.1, 1.62], [3.05, 1.86], [2.85, 1.95], [0, 1.95]].map(([x, y]) => [x, y + RIM])), shell());
  addMesh(cover, cyl(1.12, 0.09, 64), solid(0xc2bdb0, { rough: 0.5 }), { pos: [0, RIM + 1.99, 0] });
  fx.button = cover.children.at(-1);
  fx.buttonRing = new THREE.Mesh(new THREE.RingGeometry(1.22, 1.32, 96), glow(BRAND.veille, 3.5, { additive: true, double: true }));
  fx.buttonRing.rotation.x = -Math.PI / 2;
  fx.buttonRing.position.set(0, RIM + 2.0, 0);
  cover.add(fx.buttonRing);
  fx.statusLed = glow(BRAND.veille, 0);
  addMesh(cover, new THREE.SphereGeometry(0.13, 16, 12), fx.statusLed, { pos: [2.2, RIM + 1.96, 0.3], edges: false });
  fx.statusHalo = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), glow(BRAND.veille, 2.5, { additive: true }));
  fx.statusHalo.position.set(2.2, RIM + 1.96, 0.3);
  cover.add(fx.statusHalo);
  A.button = anchor(cover, 0, RIM + 2.05, 0);
  A.cover = anchor(cover, 3.9, RIM + 1.4, 3.0);

  const parts = { base, pcb, battery, buzzer, chamber, mesh, lid, cover };
  root.add(...Object.values(parts));

  // signal path, drawn in the exploded state: photodiode ↓ board → microcontroller → sounder ↑
  fx.wire = (lifts) => {
    const y = (part) => lifts[part];
    return [
      [lens[0], BEAM_Y + y("chamber"), lens[2]],
      [lens[0], PCB_TOP + 0.05 + y("pcb"), lens[2]],
      [1.0, PCB_TOP + 0.05 + y("pcb"), 3.35],
      [bz[0], PCB_TOP + 0.05 + y("pcb"), bz[2]],
      [bz[0], bz[1] + 0.4 + y("buzzer"), bz[2]],
    ];
  };

  return { root, parts, A, fx, dims: { BEAM_Y, CH_FLOOR, PCB_TOP, RIM } };
}

/**
 * Particles that enter the chamber between the blades and settle inside.
 * `uProgress` = seconds since they started; `uBeam` (0–1) lights those inside the beam.
 */
function makeFlow({ count, seed, color, size, alpha = 1, delay = 3.2, travel = [1.6, 3.2], soft = 1.8 }) {
  const rand = rng(seed);
  const a = new Float32Array(count * 4); // entry angle, final radius, height, delay
  const b = new Float32Array(count * 4); // travel time, swirl, size, phase
  for (let i = 0; i < count; i++) {
    a[i * 4] = rand() * Math.PI * 2;
    a[i * 4 + 1] = Math.sqrt(rand()) * 1.55;
    a[i * 4 + 2] = CH_FLOOR + 0.12 + rand() * 0.92;
    a[i * 4 + 3] = rand() * delay;
    b[i * 4] = travel[0] + rand() * (travel[1] - travel[0]);
    b[i * 4 + 1] = (rand() - 0.5) * 2.4;
    b[i * 4 + 2] = size[0] + rand() * (size[1] - size[0]);
    b[i * 4 + 3] = rand() * 6.28;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aA", new THREE.BufferAttribute(a, 4));
  geo.setAttribute("aB", new THREE.BufferAttribute(b, 4));
  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: -1 },
    uAmount: { value: 0 },
    uBeam: { value: 0 },
    uScale: { value: 1 },
    uColor: { value: new THREE.Color(color).multiplyScalar(1.7 * alpha) },
    uBeamColor: { value: new THREE.Color(BRAND.veille).multiplyScalar(7 * Math.min(1, alpha * 1.6)) },
    uBeamY: { value: BEAM_Y },
    uSoft: { value: soft },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uProgress, uAmount, uBeam, uScale, uBeamY;
        attribute vec4 aA; attribute vec4 aB;
        varying float vA; varying float vLit;
        void main() {
          float u = clamp((uProgress - aA.w) / aB.x, 0.0, 1.0);
          float e = 1.0 - pow(1.0 - u, 3.0);
          float r = mix(4.4, aA.y, e);
          float th = aA.x + aB.y * e + 0.16 * sin(uTime * 0.7 + aB.w) + max(0.0, uProgress - aA.w - aB.x) * 0.05 * sign(aB.y);
          vec3 p = vec3(r * cos(th), aA.z + 0.05 * sin(uTime * 0.9 + aB.w * 2.0), r * sin(th));
          float inBeam = smoothstep(0.34, 0.06, length(vec2(p.y - uBeamY, p.z))) * step(-0.5, p.x) * step(p.x, 1.46);
          vLit = inBeam * uBeam;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aB.z * (1.0 + vLit * 1.6) * uScale / max(0.5, -mv.z);
          vA = smoothstep(0.0, 0.12, u) * uAmount * (0.7 + 0.3 * sin(uTime * 1.3 + aB.w * 3.0));
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor, uBeamColor; uniform float uSoft; varying float vA; varying float vLit;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - d), uSoft);
          gl_FragColor = vec4(mix(uColor, uBeamColor, vLit) * a * vA, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  return { points, uniforms };
}
