// DOSSIER 045 — L'autodestruction de la fusée : THE SYSTEM, drawn like an encyclopedia plate brought to life — a schematic
// for the general public, not a technical drawing: no dimensions, no real geometry, no box opened. Each part reads by its
// silhouette at 270 px, seen three-quarters: the antenna (a radome on its collar), the receiver (a finned box), the
// safe-and-arm unit (a closed box with a slot window where a witness disc turns a quarter turn, signal → veille), the
// detonator (a small closed cylinder plugged into the box), the cord (a sheath on its saddles), the charge (a chevron
// profile on a strip of hull, its inner face lighter). The principle is told with light, not mechanism: `fire` a head of
// light running down the chain, `jet` a stylised blade of veille light born under the chevron, `plate` a slab that opens
// clean. The chain is GENERIC (`sources`): nothing here is Ariane 5's own.
//
// buildSauvegarde() → { group, A, update(p, time, px, eye) }
//   group  LOCAL frame (plan.js SYS / ROW): +x along the row (antenna → charge), +y up off the strip (inward when mounted),
//          +z across. world.js re-parents it: into fusee.A.seat in the scene, onto the bench's halo on the bench.
//          Assembled (`explode` 0) the parts stand at SYS.*.at; exploded (1) at the x of ROW, the strip kept under the charge.
//   A      anchors (they follow `explode`): antenna, receiver, lock, det, cord, charge, section (the cut face), plate, top
//   p      { explode, litAnt, litLock, litDet, litCord, litCharge, solo, listen, arm, fire, section, jet, plate, watch,
//            bench (1 on the bench), shown (0–1: in the scene, the rocket's `inside`) }
// On the bench the whole chain stands RAISE above the floor on low blocks (room for the plate under the charge): its
// anchors are RAISE higher than on the bouchon. The radome faces out of the hull in the rocket (local −y) and up on the
// bench (a strip lying on the floor would hide it).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, setGlow, box, cyl, lathe, plate as slab, makePart, addMesh, setPartOpacity, anchor, fatLine, mergeGeometries } from "@kit/build3d.js";
import { SYS, ROW } from "./plan.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const inOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const easeOut = (u) => 1 - Math.pow(1 - clamp01(u), 3);
// leaves fast, lands with a slight overshoot: parts have weight (as kit explode())
const settle = (u) => inOut(u) + Math.sin(Math.PI * u) * Math.sin(Math.PI * u) * 0.055 * (u > 0.5 ? 1 : 0.25);
const TAU = Math.PI * 2;

const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = VEILLE.clone().lerp(new THREE.Color(0xffffff), 0.55);
const EDGE_LIT = VEILLE.clone().multiplyScalar(1.5);

// three values of grey: dark boxes, lighter machined faces, the charge (the hero) clearly lighter, its inner face lightest
const G = { hull: 0x30363c, body: 0x3f464d, sheath: 0x4f565d, face: 0x78808a, mid: 0x8f979e, hero: 0xadb4bb, liner: 0xe3e6e9, block: 0x24292e, steel: 0x6b737b };
const M = (c, o = {}) => solid(c, { rough: o.rough ?? 0.55, metal: o.metal ?? 0.3 });

// stylised sizes (cm): shapes that read, not a drawing of a real part
const RAISE = SYS.plate.t; //   the bench: the strip on low blocks, the plate's height under it
const STRIP_T = SYS.strip.t;
const STRIP_W = 22;
const AXIS = 2.4; //            the detonator's and the cord's axis above the strip
const CH = { w: 7, h: 4.6, wall: 0.75, liner: 0.4 }; // the chevron
const L = SYS.charge.to[0] - SYS.charge.from[0]; //     the charge's length (64)
const CUT_L = SYS.cut - SYS.charge.from[0]; //          where `section` cuts it, along the charge (32)
const PLATE = { x0: CUT_L, x1: L + 3, w: 24 };
const SPAN = 0.62; //            each part's window of `explode`
const HOP = 1.6; //              the little hop of a part on its way

/* the chevron's outlines in its own (z, y) plane: an outer wall, a lighter inner face under it, empty below */
const sinT = Math.sin(Math.atan2(CH.h, CH.w / 2));
const cosT = Math.cos(Math.atan2(CH.h, CH.w / 2));
const a1 = CH.wall / sinT;
const b1 = CH.wall / cosT;
const a2 = CH.liner / sinT;
const b2 = CH.liner / cosT;
const W2 = CH.w / 2;
const OUTER = [[-W2, 0], [0, CH.h], [W2, 0], [W2 - a1, 0], [0, CH.h - b1], [-W2 + a1, 0]];
const LINER = [[-W2 + a1, 0], [0, CH.h - b1], [W2 - a1, 0], [W2 - a1 - a2, 0], [0, CH.h - b1 - b2], [-W2 + a1 + a2, 0]];
const HOLLOW = [[-W2 + a1 + a2, 0], [0, CH.h - b1 - b2], [W2 - a1 - a2, 0]];
const APEX_IN = CH.h - b1 - b2; // the top of the empty space under the chevron
const BAND = [[-W2 - 0.1, 0.02], [0, CH.h + 0.12], [W2 + 0.1, 0.02], [W2 - 0.06, 0.02], [0, CH.h - 0.07], [-W2 + 0.06, 0.02]];

function roundRect(w, h, r, cx, cy) {
  const s = new THREE.Shape();
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  s.moveTo(x0 + r, y0);
  s.lineTo(x0 + w - r, y0);
  s.absarc(x0 + w - r, y0 + r, r, -Math.PI / 2, 0);
  s.lineTo(x0 + w, y0 + h - r);
  s.absarc(x0 + w - r, y0 + h - r, r, 0, Math.PI / 2);
  s.lineTo(x0 + r, y0 + h);
  s.absarc(x0 + r, y0 + h - r, r, Math.PI / 2, Math.PI);
  s.lineTo(x0, y0 + r);
  s.absarc(x0 + r, y0 + r, r, Math.PI, 1.5 * Math.PI);
  return s;
}
function stadium(l, h, cx, cy) {
  const p = new THREE.Path();
  const r = h / 2;
  const k = l / 2 - r;
  p.moveTo(cx - k, cy - r);
  p.lineTo(cx + k, cy - r);
  p.absarc(cx + k, cy, r, -Math.PI / 2, Math.PI / 2);
  p.lineTo(cx - k, cy + r);
  p.absarc(cx - k, cy, r, Math.PI / 2, 1.5 * Math.PI);
  return p;
}
/** a soft round dot (the head of light): a bright core, a long fall-off */
function softDot(n = 64) {
  const data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const r = Math.hypot(((x + 0.5) / n) * 2 - 1, ((y + 0.5) / n) * 2 - 1);
      const a = Math.pow(clamp01(1 - r), 2.2);
      const i = (y * n + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + 3] = Math.round(255 * a);
    }
  }
  const tex = new THREE.DataTexture(data, n, n);
  tex.needsUpdate = true;
  return tex;
}

/** A light that runs along x (mesh-local): a head, a long tail behind it. `uScale` = cm per local unit. */
function trailMat() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uHead: { value: -1e3 }, uScale: { value: 1 }, uTail: { value: 10 }, uAmount: { value: 0 },
      uCut: { value: -1e4 }, uBack: { value: 1 }, uCore: { value: HOT.clone().multiplyScalar(2.1) }, uGlow: { value: VEILLE.clone().multiplyScalar(1.1) },
    },
    vertexShader: /* glsl */ `
      varying float vX;
      void main() { vX = position.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uHead, uScale, uTail, uAmount, uCut, uBack;
      uniform vec3 uCore, uGlow;
      varying float vX;
      void main() {
        float dx = (uHead - vX) * uScale;
        float lead = smoothstep(-0.8, 0.0, dx);
        float tail = exp(-max(dx, 0.0) / max(uTail, 0.01));
        float core = exp(-clamp(dx * dx, 0.0, 60.0) / 1.2);
        float a = lead * tail * uAmount * (vX < uCut ? uBack : 1.0);
        gl_FragColor = vec4(mix(uGlow, uCore, clamp(core, 0.0, 1.0)) * a, 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  });
}
/** The jet's blade: a sheet of veille light, a white core. `uEnd` 1: the sheet seen end-on (a core across its width). */
function bladeMat(end, k) {
  return new THREE.ShaderMaterial({
    uniforms: { uAmount: { value: 0 }, uEnd: { value: end }, uH: { value: 1 }, uCore: { value: HOT.clone().multiplyScalar(k) }, uGlow: { value: VEILLE.clone().multiplyScalar(k * 0.55) } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount, uEnd, uH;
      uniform vec3 uCore, uGlow;
      varying vec2 vUv;
      void main() {
        // the blade runs DOWN: a bright leading tip at the bottom, a thinner, dimmer root up under the chevron
        float fromTip = vUv.y * max(uH, 0.01);
        float bead = exp(-clamp(fromTip / 0.9, 0.0, 30.0));
        float across = clamp(1.0 - abs(vUv.x * 2.0 - 1.0), 0.0, 1.0);
        float sharp = mix(5.0, 3.0, bead);
        float core = mix(1.0, pow(across, sharp), uEnd);
        float halo = mix(1.0, pow(across, 1.6), uEnd);
        float ends = mix(smoothstep(0.0, 0.03, vUv.x) * smoothstep(1.0, 0.97, vUv.x), 1.0, uEnd);
        float tip = smoothstep(0.0, 0.035, vUv.y) * (0.45 + 0.35 * (1.0 - vUv.y) + 1.3 * bead);
        gl_FragColor = vec4((uCore * core + uGlow * halo * 0.3) * ends * tip * uAmount, 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
  });
}

export function buildSauvegarde() {
  const group = new THREE.Group();
  group.name = "sauvegarde";
  const all = [];
  /** a part of the chain: its own materials, where it stands assembled (x0) and exploded (x1) */
  const part = (name, parent, o = {}) => {
    const g = makePart(name);
    parent.add(g);
    const r = { name, g, x0: 0, x1: 0, delay: 0, drop: 0, lit: null, l: -1, edges: [], solids: [], ...o };
    all.push(r);
    return r;
  };
  const seal = (r) => {
    r.g.traverse((c) => {
      if (c.isLineSegments2) r.edges.push({ mat: c.material, base: c.material.color.clone(), w: c.material.linewidth });
    });
    for (const m of r.g.userData.part.mats) if (m.isMeshStandardMaterial) r.solids.push(m);
  };
  const along = { rot: [0, 0, -Math.PI / 2] }; // a lathe or cylinder made along y, laid along +x

  /* ── the antenna: a radome on its collar ── */
  const ant = part("antenna", group, { x0: SYS.antenna.at[0], x1: ROW.antenna, delay: 0, drop: 0, lit: "litAnt" });
  const antRig = new THREE.Group(); // radome up (the bench); turned over in the rocket so that it faces out of the hull
  ant.g.add(antRig);
  {
    const dome = [[0, 0], [5.4, 0], [5.4, 0.5]];
    for (let i = 1; i <= 12; i++) {
      const t = (i / 12) * (Math.PI / 2);
      dome.push([5.4 * Math.cos(t), 0.5 + 5.1 * Math.sin(t)]);
    }
    const sub = makePart("antRig"); // the meshes go into antRig, their materials stay the antenna's
    sub.userData.part = ant.g.userData.part;
    antRig.add(sub);
    addMesh(sub, lathe(dome, 64, { bevel: 0.14, round: 2 }), M(G.mid, { rough: 0.5, metal: 0.15 }), { edgeOpacity: 0.55 });
    addMesh(sub, cyl(5.75, 0.7, 0.12, 64), M(G.face), { pos: [0, 0.3, 0], edgeOpacity: 0.6 });
    addMesh(sub, cyl(2.2, STRIP_T, 0.05, 32), M(G.face), { pos: [0, -STRIP_T / 2, 0], edges: false });
    addMesh(sub, cyl(6.5, 1.2, 0.15, 64), M(G.body), { pos: [0, -STRIP_T - 0.6, 0] });
  }
  seal(ant);

  /* ── the receiver: a finned box, its diode ── */
  const rec = part("receiver", group, { x0: SYS.receiver.at[0], x1: ROW.receiver, delay: 0.05, drop: RAISE, lit: "litAnt" });
  addMesh(rec.g, box(20, 10, 16, 0.4), M(G.body), { pos: [0, 5, 0] });
  addMesh(rec.g, box(18, 0.7, 14, 0.2), M(G.face), { pos: [0, 10.35, 0], edgeOpacity: 0.5 });
  const finMat = M(G.face);
  for (let i = -2; i <= 2; i++) addMesh(rec.g, box(0.9, 1.5, 11, 0.15), finMat, { pos: [i * 3.5, 11.45, 0], edgeOpacity: 0.5 });
  addMesh(rec.g, cyl(1.0, 1.2, 0.08, 24), M(G.face), { ...along, pos: [10.6, 4.5, 0], edges: false });
  const ledMat = glow(BRAND.veille, 0.3);
  addMesh(rec.g, cyl(0.65, 0.3, 0.05, 24), ledMat, { rot: [Math.PI / 2, 0, 0], pos: [6, 6.8, 8.15], edges: false });
  seal(rec);

  /* ── the wire from the receiver to the safe-and-arm unit ── */
  const wire = part("wire", group, { lit: "litAnt" });
  const wireMesh = addMesh(wire.g, new THREE.CylinderGeometry(0.5, 0.5, 1, 14, 1, true).rotateZ(-Math.PI / 2), M(G.sheath, { rough: 0.7, metal: 0.05 }), { edges: false });
  seal(wire);

  /* ── the safe-and-arm unit: a closed box, a slot window on its witness disc ── */
  const lock = part("lock", group, { x0: SYS.lock.at[0], x1: ROW.lock, delay: 0.1, drop: RAISE, lit: "litLock" });
  const LZ = 6.5; // half its depth: the window's face
  const WIN = { x: 0, y: 6.8, l: 7.8, h: 2.8, r: 4.05, hub: 2.05 };
  addMesh(lock.g, box(15, 13, 13, 0.45), M(G.body), { pos: [0, 6.5, 0] });
  const cover = roundRect(11.6, 9.6, 1.0, 0, 6.6);
  cover.holes.push(stadium(WIN.l, WIN.h, WIN.x, WIN.y));
  addMesh(lock.g, slab(cover, 0.6, { bevel: 0.12, round: 2, curveSegments: 18 }), M(G.face, { rough: 0.45, metal: 0.35 }), { pos: [0, 0, LZ], edgeOpacity: 0.6 });
  const screwMat = M(G.mid);
  for (const sx of [-4.7, 4.7]) for (const sy of [2.9, 10.3]) addMesh(lock.g, cyl(0.45, 0.3, 0.08, 16), screwMat, { rot: [Math.PI / 2, 0, 0], pos: [sx, sy, LZ + 0.75], edges: false });
  addMesh(lock.g, cyl(2.3, 4, 0.14, 40), M(G.face), { ...along, pos: [9.5, AXIS, 0], edgeOpacity: 0.55 }); // the socket the detonator plugs into
  addMesh(lock.g, cyl(1.0, 1.2, 0.08, 24), M(G.face), { ...along, pos: [-8.1, 4.5, 0], edges: false });
  // the witness disc behind the slot: veille quarters along the chain (armed), signal quarters across it (safe)
  const disc = new THREE.Group();
  disc.position.set(WIN.x, WIN.y, LZ + 0.4); // just behind the cover's face: little parallax in the slot
  lock.g.add(disc);
  const sectors = (c) => mergeGeometries([c, c + Math.PI].map((m) => new THREE.CircleGeometry(WIN.r, 24, m - Math.PI / 4, Math.PI / 2)));
  const discV = glow(BRAND.veille, 1.15);
  const discS = glow(BRAND.signal, 1.15);
  const discSub = makePart("disc");
  discSub.userData.part = lock.g.userData.part;
  disc.add(discSub);
  addMesh(discSub, sectors(0), discV, { edges: false });
  addMesh(discSub, sectors(Math.PI / 2), discS, { edges: false });
  addMesh(discSub, new THREE.CircleGeometry(WIN.hub, 32), M(G.block), { pos: [0, 0, 0.02], edges: false }); // hides where the quarters meet: one colour per side
  seal(lock);

  /* ── the detonator: a small closed cylinder, plugged in ── */
  const det = part("det", group, { x0: SYS.det.at[0], x1: ROW.det, delay: 0.15, drop: RAISE + AXIS - 1.6, lit: "litDet" });
  addMesh(det.g, lathe([[0, -5], [1.6, -5], [1.6, 3], [1.2, 4], [0, 4]], 48, { bevel: 0.14, round: 2 }), M(G.mid, { rough: 0.45, metal: 0.35 }), { ...along, pos: [0, AXIS, 0], edgeOpacity: 0.6 });
  addMesh(det.g, cyl(1.95, 1.4, 0.12, 48), M(G.face), { ...along, pos: [-3.1, AXIS, 0], edgeOpacity: 0.55 });
  seal(det);

  /* ── the cord: a sheath on its saddles (it stretches as the row opens) ── */
  const cord = part("cord", group, { x0: SYS.cord.from[0], x1: ROW.cord[0], delay: 0.2, drop: RAISE, lit: "litCord" });
  const CORD0 = SYS.cord.to[0] - SYS.cord.from[0];
  const CORD1 = ROW.cord[1] - ROW.cord[0];
  const cordTube = addMesh(cord.g, new THREE.CylinderGeometry(0.9, 0.9, 1, 20, 1, true).rotateZ(-Math.PI / 2).translate(0.5, 0, 0), M(G.sheath, { rough: 0.65, metal: 0.1 }), { pos: [0, AXIS, 0], edges: false });
  const ferMat = M(G.mid);
  const ferA = addMesh(cord.g, cyl(1.12, 1.2, 0.1, 24), ferMat, { ...along, pos: [0.6, AXIS, 0], edges: false });
  const ferB = addMesh(cord.g, cyl(1.12, 1.2, 0.1, 24), ferMat, { ...along, pos: [CORD0 - 0.6, AXIS, 0], edges: false });
  const clipMat = M(G.face);
  const CLIPS = [0.24, 0.5, 0.76];
  const clips = CLIPS.map(() => addMesh(cord.g, box(1.3, AXIS + 1.15, 2.8, 0.15), clipMat, { pos: [0, (AXIS + 1.15) / 2, 0], edgeOpacity: 0.5 }));
  const cordGlowMat = trailMat();
  const cordGlow = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 1, 16, 1, true).rotateZ(-Math.PI / 2).translate(0.5, 0, 0), cordGlowMat);
  cordGlow.position.y = AXIS;
  cordGlow.renderOrder = 4;
  cord.g.add(cordGlow);
  seal(cord);

  /* ── the charge and what lies under it, on one rig that slides along the row ── */
  const rig = part("rig", group, { x0: SYS.charge.from[0], x1: ROW.charge[0], delay: 0, hop: 0 });
  const chevron = (name, x0, x1, capA, capB) => {
    const r = part(name, rig.g, { lit: "litCharge" });
    const turn = [0, Math.PI / 2, 0]; // the outline's plane (z, y) → its extrusion along +x
    addMesh(r.g, slab(OUTER, x1 - x0, { bevel: 0.07, round: 1 }), M(G.hero, { rough: 0.42, metal: 0.3 }), { rot: turn, pos: [x0, 0, 0], edgeOpacity: 0.75 });
    const liner = M(G.liner, { rough: 0.32, metal: 0.45 });
    addMesh(r.g, slab(LINER, x1 - x0, { bevel: 0.05, round: 1 }), liner, { rot: turn, pos: [x0, 0, 0], edgeOpacity: 0.6 });
    const capMat = M(G.body);
    if (capA) addMesh(r.g, slab(HOLLOW, 0.7, { bevel: 0.05, round: 1 }), capMat, { rot: turn, pos: [x0 + 0.3, 0, 0], edges: false });
    if (capB) addMesh(r.g, slab(HOLLOW, 0.7, { bevel: 0.05, round: 1 }), capMat, { rot: turn, pos: [x1 - 1.0, 0, 0], edges: false });
    seal(r);
    r.liner = liner;
    return r;
  };
  const chWhole = chevron("chargeWhole", 0, L, true, true);
  const chBack = chevron("chargeBack", 0, CUT_L, true, false);
  const chFront = chevron("chargeFront", CUT_L, L, false, true);
  // the light that runs along the chevron's back
  const ridgeMat = trailMat();
  ridgeMat.uniforms.uGlow.value.multiplyScalar(0.6);
  const ridge = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(BAND.map(([x, y]) => new THREE.Vector2(x, y))), { depth: L, bevelEnabled: false }).rotateY(Math.PI / 2), ridgeMat);
  ridge.renderOrder = 4;
  rig.g.add(ridge);
  // the plate: whole, then two halves once it opens; a few slow chips
  const plateY = new THREE.Group();
  rig.g.add(plateY);
  const plLen = PLATE.x1 - PLATE.x0;
  const plX = (PLATE.x0 + PLATE.x1) / 2;
  const plWhole = part("plateWhole", plateY);
  addMesh(plWhole.g, box(plLen, RAISE, PLATE.w, 0.12), M(G.steel, { rough: 0.5, metal: 0.4 }), { pos: [plX, 0, 0], edgeOpacity: 0.7 });
  seal(plWhole);
  const halves = [1, -1].map((s) => {
    const r = part(s > 0 ? "plateL" : "plateR", plateY);
    r.mesh = addMesh(r.g, box(plLen, RAISE, PLATE.w / 2, 0.12), M(G.steel, { rough: 0.5, metal: 0.4 }), { pos: [plX, 0, (s * PLATE.w) / 4], edgeOpacity: 0.7 });
    r.side = s;
    seal(r);
    return r;
  });
  const chips = part("chips", rig.g);
  const CHIP = [[0.1, 1, 3.2, 0.8], [0.27, -1, 4.6, 0.6], [0.41, 1, 6.2, 0.7], [0.55, -1, 3.6, 0.9], [0.68, 1, 5.0, 0.55], [0.8, -1, 6.6, 0.7], [0.92, 1, 4.0, 0.6]];
  const chipMat = M(G.mid);
  const chipMeshes = CHIP.map(([, , , s], i) => addMesh(chips.g, box(s, s * 0.6, s * 0.85, 0.06), chipMat, { rot: [i, i * 0.7, 0], edges: false }));
  seal(chips);
  // the jet: a blade seen from the side, and the same blade end-on at the cut
  const bladeSideMat = bladeMat(0, 0.75);
  const bladeEndMat = bladeMat(1, 2.0);
  const bladeSide = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0.5, 0.5, 0), bladeSideMat);
  const bladeEnd = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0).rotateY(-Math.PI / 2), bladeEndMat);
  bladeSide.renderOrder = bladeEnd.renderOrder = 5;
  rig.g.add(bladeSide, bladeEnd);

  /* ── the strip of hull (whole, or cut at the section), the bench's low blocks ── */
  const stripPart = (name) => {
    const r = part(name, group);
    r.mesh = addMesh(r.g, new THREE.BoxGeometry(1, STRIP_T, STRIP_W), M(G.hull, { rough: 0.7, metal: 0.25 }), { pos: [0, -STRIP_T / 2, 0], edgeOpacity: 0.7 });
    seal(r);
    return r;
  };
  const stWhole = stripPart("stripWhole");
  const stBack = stripPart("stripBack");
  const stFront = stripPart("stripFront");
  const blocks = ["blockA", "blockB", "blockC", "blockD"].map((n) => {
    const r = part(n, group);
    addMesh(r.g, box(4, RAISE - STRIP_T, 14, 0.1), M(G.block, { rough: 0.8, metal: 0.1 }), { pos: [0, -STRIP_T - (RAISE - STRIP_T) / 2, 0], edgeOpacity: 0.5 });
    seal(r);
    return r;
  });

  /* ── light: the firing head, the antenna's rings ── */
  const headMat = new THREE.SpriteMaterial({ map: softDot(), color: HOT.clone().multiplyScalar(2.2), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, fog: false });
  const head = new THREE.Sprite(headMat);
  head.renderOrder = 6;
  group.add(head);
  const ringPts = [];
  for (let i = 0; i <= 72; i++) ringPts.push([Math.cos((i / 72) * TAU), 0, Math.sin((i / 72) * TAU)]);
  const rings = [0, 1, 2].map(() => {
    const r = fatLine(ringPts, { color: BRAND.veille, width: 3, additive: true, hdr: 1.5 });
    r.renderOrder = 4;
    ant.g.add(r);
    return r;
  });

  const MOVERS = [ant, rec, lock, det, cord, rig];
  const CHAIN = [ant, rec, wire, lock, det, cord]; // what `solo` takes away
  const A = {
    antenna: anchor(antRig, 0, 5.6, 0),
    receiver: anchor(rec.g, 0, 11, 0),
    lock: anchor(lock.g, WIN.x, WIN.y, LZ + 0.6),
    det: anchor(det.g, 0, AXIS + 1.6, 0),
    cord: anchor(cord.g, CORD0 / 2, AXIS, 0),
    charge: anchor(rig.g, L / 2, CH.h / 2, 0),
    section: anchor(rig.g, CUT_L, CH.h / 2, 0),
    plate: anchor(rig.g, plX, 0, 0),
    top: anchor(group, 0, 20, 0),
  };

  const light = (r, l) => {
    if (r.l === l) return;
    r.l = l;
    for (const e of r.edges) {
      e.mat.color.copy(e.base).lerp(EDGE_LIT, l);
      e.mat.linewidth = e.w + 0.9 * l;
    }
    for (const m of r.solids) {
      m.emissive.copy(VEILLE);
      m.emissiveIntensity = 0.1 * l;
    }
  };

  return {
    group, A,
    /** p = { explode, litAnt, litLock, litDet, litCord, litCharge, solo, listen, arm, fire, section, jet, plate, watch, bench, shown } */
    update(p, time = 0) {
      const shown = clamp01(p.shown ?? 1);
      group.visible = shown > 0.004;
      if (!group.visible) return;
      const onBench = (p.bench ?? 0) > 0.5;
      const ex = clamp01(p.explode ?? 0);
      const solo = clamp01(p.solo ?? 0);
      const sec = clamp01(p.section ?? 0);
      const pl = onBench ? clamp01(p.plate ?? 0) : 0;
      const jet = clamp01(p.jet ?? 0);
      const fire = clamp01(p.fire ?? 0);
      const watch = clamp01(p.watch ?? 0);
      const breath = 0.5 + 0.5 * Math.sin((time * TAU) / 3.2);
      group.position.y = onBench ? RAISE : 0;
      antRig.rotation.x = onBench ? 0 : Math.PI;
      antRig.position.y = onBench ? 0 : -STRIP_T;

      /* the row: each part slides in its own window, hops, and lands on the floor once off the strip */
      for (const m of MOVERS) {
        const u = settle(clamp01((ex - m.delay) / SPAN));
        m.u = u;
        m.g.position.x = lerp(m.x0, m.x1, u);
        m.g.position.y = (onBench ? -m.drop * smooth(0.5, 1, u) : 0) + (m.hop ?? HOP) * Math.sin(Math.PI * clamp01(u));
      }
      const cordLen = lerp(CORD0, CORD1, cord.u);
      const cordX = cord.g.position.x;
      cordTube.scale.x = cordLen;
      ferA.position.x = 0.6;
      ferB.position.x = cordLen - 0.6;
      for (let i = 0; i < clips.length; i++) clips[i].position.x = CLIPS[i] * cordLen;
      cordGlow.scale.x = cordLen;
      A.cord.position.x = cordLen / 2;
      // the wire between the receiver and the unit
      const xa = rec.g.position.x + 11.2;
      const ya = rec.g.position.y + 4.5;
      const xb = lock.g.position.x - 8.7;
      const yb = lock.g.position.y + 4.5;
      wireMesh.position.set((xa + xb) / 2, (ya + yb) / 2, 0);
      wireMesh.rotation.z = Math.atan2(yb - ya, xb - xa);
      wireMesh.scale.x = Math.max(0.01, Math.hypot(xb - xa, yb - ya));
      // the strip: it draws back under the charge as the row opens; cut at the section
      const rx = rig.g.position.x;
      const uS = settle(clamp01(ex / 0.5));
      const s0 = rx + lerp(SYS.strip.from[0] - SYS.charge.from[0], -4, uS);
      const s1 = rx + lerp(SYS.strip.to[0] - SYS.charge.from[0], L + 4, uS);
      const xc = rx + CUT_L;
      const place = (r, a, b) => {
        r.g.position.x = (a + b) / 2;
        r.mesh.scale.x = Math.max(0.01, b - a);
      };
      place(stWhole, s0, s1);
      place(stBack, s0, xc);
      place(stFront, xc, s1);
      blocks[0].g.position.x = s0 + 5;
      blocks[1].g.position.x = (s0 + xc) / 2;
      blocks[2].g.position.x = xc - 5;
      blocks[3].g.position.x = s1 - 5;

      /* what is seen */
      const chainA = shown * (1 - solo);
      for (const r of CHAIN) setPartOpacity(r.g, chainA);
      const cut = sec > 0.001;
      setPartOpacity(chWhole.g, cut ? 0 : shown);
      setPartOpacity(chBack.g, cut ? shown * (1 - sec) : 0);
      setPartOpacity(chFront.g, cut ? shown : 0);
      const split = cut || pl > 0.001;
      const frontGone = smooth(0, 0.4, pl);
      // the strip is the bench's piece of hull; in the rocket the hull is fusee.js's glass (a strip would hide the chain)
      const stripA = onBench ? shown : 0;
      setPartOpacity(stWhole.g, split ? 0 : stripA);
      setPartOpacity(stBack.g, split ? stripA * (1 - sec) : 0);
      setPartOpacity(stFront.g, split ? stripA * (1 - frontGone) : 0);
      const blockA = onBench ? shown * (1 - sec) : 0;
      setPartOpacity(blocks[0].g, blockA);
      setPartOpacity(blocks[1].g, blockA);
      setPartOpacity(blocks[2].g, blockA);
      setPartOpacity(blocks[3].g, onBench ? shown * (1 - frontGone) : 0);
      // the plate rises from under the floor as the strip under the charge fades (never both in the same place)
      const plA = shown * smooth(0, 0.3, pl);
      plateY.position.y = -(1 - smooth(0.2, 1, pl)) * 2.3 - RAISE / 2;
      const open = smooth(0.55, 0.95, jet);
      setPartOpacity(plWhole.g, open > 0.001 ? 0 : plA);
      for (const h of halves) {
        setPartOpacity(h.g, open > 0.001 ? plA : 0);
        h.mesh.position.z = h.side * (PLATE.w / 4 + 2.2 * open);
        h.mesh.rotation.x = -h.side * 0.1 * open;
      }
      setPartOpacity(chips.g, plA);
      for (let i = 0; i < CHIP.length; i++) {
        const [f, s, reach, size] = CHIP[i];
        const u = clamp01((jet - 0.6 - 0.025 * i) / 0.35);
        const c = chipMeshes[i];
        c.visible = u > 0;
        const e = easeOut(u);
        c.position.set(PLATE.x0 + f * plLen, lerp(-0.6, size * 0.3, e) + 2.0 * Math.sin(Math.PI * u) * (1 - 0.3 * u), s * (0.4 + reach * e));
        c.rotation.set(i + 3.1 * u, i * 0.7 + 2.3 * u, 1.4 * u * s);
      }

      /* the part the voice names: a veille edge; the armed chain at rest breathes */
      const wl = watch * (0.28 + 0.22 * breath);
      const litOf = (key) => Math.max(clamp01(p[key] ?? 0), wl);
      light(ant, litOf("litAnt"));
      light(rec, litOf("litAnt"));
      light(wire, wl);
      light(lock, litOf("litLock"));
      light(det, litOf("litDet"));
      light(cord, litOf("litCord"));
      const lc = clamp01(p.litCharge ?? 0);
      light(chWhole, lc);
      light(chBack, lc);
      light(chFront, lc);
      setGlow(ledMat, 0.3 + 1.4 * watch * (0.35 + 0.65 * breath));
      setGlow(discV, 1.15 + 0.4 * watch * breath);
      // the witness disc: a quarter turn, signal across the slot (safe) → veille along it (armed)
      disc.rotation.z = (1 - clamp01(p.arm ?? 1)) * (Math.PI / 2);

      /* fire: a head of light from the unit's socket, through the detonator, along the cord, along the charge */
      const fA = 0.2;
      const fB = 0.6;
      let hx;
      let hy;
      if (fire < fA) {
        const u = fire / fA;
        hx = lerp(lock.g.position.x + 9.5, det.g.position.x + 4, u);
        hy = lerp(lock.g.position.y, det.g.position.y, u) + AXIS;
      } else if (fire < fB) {
        hx = cordX + ((fire - fA) / (fB - fA)) * cordLen;
        hy = cord.g.position.y + AXIS;
      } else {
        const u = (fire - fB) / (1 - fB);
        hx = rx + u * L;
        hy = AXIS + (CH.h + 0.35 - AXIS) * smooth(0, 0.08, u);
      }
      const headA = shown * smooth(0, 0.015, fire) * (1 - smooth(0.97, 1, fire)) * (fire < fB ? 1 - solo : hx < xc ? 1 - sec : 1);
      head.visible = headA > 0.004;
      head.position.set(hx, hy, 0);
      head.scale.setScalar(onBench ? 1.4 : 8); // on the bench: a small core, the cord's long tail does the rest
      headMat.opacity = headA;
      const detFlash = smooth(0, 0.04, fire) * (1 - smooth(0.16, 0.3, fire));
      if (detFlash > 0) {
        for (const m of det.solids) m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.9 * detFlash);
        det.l = -1; // recomputed next frame
      }
      const on = fire > 0.0005 ? 1 : 0;
      cordGlowMat.uniforms.uHead.value = (fire - fA) / (fB - fA);
      cordGlowMat.uniforms.uScale.value = cordLen;
      cordGlowMat.uniforms.uTail.value = onBench ? 16 : 9;
      cordGlowMat.uniforms.uAmount.value = on * chainA;
      cordGlow.visible = on * chainA > 0.004;
      const ridgeA = on * shown * (1 - smooth(0.05, 0.4, jet));
      ridgeMat.uniforms.uHead.value = ((fire - fB) / (1 - fB)) * L;
      ridgeMat.uniforms.uTail.value = 15;
      ridgeMat.uniforms.uCut.value = CUT_L;
      ridgeMat.uniforms.uBack.value = 1 - sec;
      ridgeMat.uniforms.uAmount.value = ridgeA;
      ridge.visible = ridgeA > 0.004;

      /* jet: the inner face lights, a blade of light grows down from under the chevron, then through the plate */
      const born = smooth(0, 0.12, jet);
      const linerE = 0.55 * smooth(0, 0.25, jet) * (1 - 0.8 * smooth(0.3, 0.6, jet));
      if (linerE > 0) {
        for (const r of [chWhole, chBack, chFront]) {
          r.liner.emissiveIntensity = Math.max(0.1 * lc, linerE);
          r.l = -1;
        }
      }
      const tipY = jet < 0.5 ? lerp(APEX_IN, 0, inOut(jet / 0.5)) : lerp(0, 0.06 - RAISE, smooth(0.5, 0.78, jet));
      const bladeH = Math.max(0.01, APEX_IN - tipY);
      const x0 = lerp(0, CUT_L, sec);
      bladeSide.position.set(x0, tipY, 0);
      bladeSide.scale.set(Math.max(0.01, L - x0), bladeH, 1);
      bladeEnd.position.set(x0 - 0.08, tipY, 0);
      bladeEnd.scale.set(1, bladeH, 2.4);
      bladeSideMat.uniforms.uH.value = bladeH;
      bladeEndMat.uniforms.uH.value = bladeH;
      bladeSideMat.uniforms.uAmount.value = born * shown;
      bladeEndMat.uniforms.uAmount.value = born * shown;
      bladeSide.visible = bladeEnd.visible = born * shown > 0.004;

      /* listen: rings come in from the ground to the radome (up on the bench, out of the hull in the rocket) */
      const ls = clamp01(p.listen ?? 0) * chainA;
      const y0 = onBench ? 0.3 - RAISE : -38;
      const y1 = onBench ? 5.9 : -6.6 - STRIP_T;
      const r0 = onBench ? 14 : 18;
      for (let i = 0; i < 3; i++) {
        const r = rings[i];
        const u = (((time * 0.55 + i / 3) % 1) + 1) % 1;
        r.visible = ls > 0.004;
        r.position.set(0, lerp(y0, y1, u), 0);
        r.scale.setScalar(lerp(r0, 3.2, u));
        r.material.opacity = ls * Math.sin(Math.PI * u);
      }
    },
  };
}
