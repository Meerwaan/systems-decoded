// DOSSIER 003 — what really holds a lift: the safety gear (in French, "le parachute") clamped on
// its guide rail, and the overspeed governor that fires it. Centimetres.
// On the bench the rail lies on its foot: its length runs along Z (the direction the car travels:
// +Z is "up" in the shaft), its blade stands up (Y). Seen from above, it is the textbook drawing:
// the blade in the middle, a fixed shoe on its springs on one side, the wedge and the slanted wall
// it climbs on the other.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glow, lineMat, makePart, addMesh, anchor } from "@kit/build3d.js";

const DEG = Math.PI / 180;
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const INK = new THREE.Color(BRAND.ink);

export const RAIL = { len: 420, foot: 13, footH: 2.2, blade: 3.4, high: 11 };
const BLADE = RAIL.blade / 2; // half-thickness of the blade
const BODY = { x: 13.5, z: 14, y0: 2.8, y1: 13 }; // half-width, half-length, underside, top of the jaws
// the slanted wall the wedge rides on: wide gap at the bottom (−Z), narrow at the top (+Z)
const WALL = { bottom: 9.8, top: 4.2 };
const SLOPE = (WALL.bottom - WALL.top) / (BODY.z * 2);
const wallAt = (z) => WALL.bottom - (z + BODY.z) * SLOPE;
const ROLL = 1; // the rollers between the wedge's back and the wall
const GAP = 1.7; // at rest, between the teeth and the blade
export const WEDGE = { len: 16, rest: -12.5, travel: GAP / SLOPE }; // length, where its lower end rests, how far it climbs before it bites
export const BLOCK = { top: BODY.y1 + 1.8, half: BODY.z, wide: BODY.x }; // for whoever mounts it on a car

/** A flat outline (x, z) given height: the way every piece of the block is cut. Its edges are broken by `bevel`. */
function slab(points, y0, y1, bevel = 0.3) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], -points[0][1]);
  for (const [x, z] of points.slice(1)) shape.lineTo(x, -z);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: y1 - y0 - 2 * bevel,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel, // the outline keeps its size: the bevel is taken from the piece, not added to it
    bevelSegments: 2,
  });
  geo.rotateX(-Math.PI / 2); // the outline lies on the bench, the thickness goes up
  geo.translate(0, y0 + bevel, 0);
  return geo;
}

/**
 * Sparks off the bite: born along the line where the teeth meet the blade, dragged along by the
 * rail (+Z), slow — the film is in slow motion. A pure function of `uT`, the seconds since the bite.
 */
function makeSparks({ count = 170, seed = 9 } = {}) {
  const rand = rng(seed);
  const origin = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const life = new Float32Array(count * 3); // birth (s), lifetime (s), size
  for (let i = 0; i < count; i++) {
    origin.set([BLADE + 0.2 + rand() * 0.5, 3.6 + rand() * 7.4, -4 + rand() * 16], i * 3);
    const out = 4 + rand() * 20;
    vel.set([out * (0.35 + rand()), (rand() - 0.25) * 22, 22 + rand() * 54], i * 3);
    life.set([Math.pow(rand(), 1.8) * 3.1, 0.45 + rand() * 0.75, 0.5 + Math.pow(rand(), 2) * 1.3], i * 3); // most of them at the bite, fewer and fewer as it brakes
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(origin, 3));
  geo.setAttribute("aVel", new THREE.BufferAttribute(vel, 3));
  geo.setAttribute("aLife", new THREE.BufferAttribute(life, 3));
  const uniforms = { uT: { value: -1 }, uScale: { value: 1 }, uHot: { value: new THREE.Color(1, 0.86, 0.6).multiplyScalar(5) }, uCool: { value: SIGNAL.clone().multiplyScalar(3) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale; attribute vec3 aVel; attribute vec3 aLife; varying float vAge;
        void main() {
          float age = (uT - aLife.x) / aLife.y;
          vAge = age;
          float run = clamp(age, 0.0, 1.0);
          // it leaves fast and the air holds it back
          vec3 p = position + aVel * aLife.y * (run - 0.38 * run * run);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (age < 0.0 || age > 1.0) ? 0.0 : max(2.0, aLife.z * uScale / max(0.5, -mv.z));
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; varying float vAge;
        void main() {
          if (vAge < 0.0 || vAge > 1.0) discard;
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - d), 1.6) * sin(3.14159 * clamp(vAge, 0.0, 1.0));
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.0, 0.6, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  return { points, uniforms };
}

/** `rail: false` leaves the length of rail out: the block alone, to be mounted on a real one. */
export function buildParachute({ rail: withRail = true } = {}) {
  const root = new THREE.Group();
  const fx = {};
  const A = {};
  // materials that take the light: on a bench, a boxy part reads by its shading. One set per part:
  // a part can fade (the lid, to show what is under it) without taking its neighbours along.
  const metals = () => ({
    cast: solid(0x232a30, { rough: 0.6, metal: 0.3, coat: 0.3, coatRough: 0.45, env: 1 }),
    machined: solid(0x7a848d, { rough: 0.45, metal: 0.3, env: 1.1 }), // where the casting was milled flat
    bright: solid(0xa9b1b6, { rough: 0.35, metal: 0.5, env: 1.3 }),
  });
  const steel = solid(0x5a646d, { rough: 0.42, metal: 0.45, coat: 0.25, coatRough: 0.4, env: 1.1 });
  const { cast, machined, bright } = metals();
  const parts = {};

  /* ── the rail: a T on its foot. It is the one that slides when the car falls. ── */
  if (withRail) {
    const rail = makePart("rail", { lift: 0 });
    const tee = new THREE.Shape();
    const f = RAIL.foot / 2;
    tee.moveTo(-f, 0);
    tee.lineTo(f, 0);
    tee.lineTo(f, RAIL.footH);
    tee.lineTo(BLADE, RAIL.footH);
    tee.lineTo(BLADE, RAIL.high);
    tee.lineTo(-BLADE, RAIL.high);
    tee.lineTo(-BLADE, RAIL.footH);
    tee.lineTo(-f, RAIL.footH);
    tee.closePath();
    const railGeo = new THREE.ExtrudeGeometry(tee, { depth: RAIL.len, bevelEnabled: false });
    railGeo.translate(0, 0, -RAIL.len / 2);
    addMesh(rail, railGeo, steel, { edgeOpacity: 0.75 });
    // graduations on top of the blade: without them a rail that slides looks still
    const marks = [];
    for (let z = -RAIL.len / 2 + 6; z < RAIL.len / 2; z += 6) marks.push(z);
    fx.marks = new THREE.InstancedMesh(new THREE.BoxGeometry(RAIL.blade * 0.72, 0.06, 0.55), new THREE.MeshBasicMaterial({ color: INK.clone().multiplyScalar(0.62) }), marks.length);
    const m4 = new THREE.Matrix4();
    marks.forEach((z, i) => fx.marks.setMatrixAt(i, m4.makeTranslation(0, RAIL.high + 0.04, z)));
    rail.add(fx.marks);
    fx.rail = rail;
    parts.rail = rail;
    A.rail = anchor(root, 0, RAIL.high, -30);
  }

  /* ── the block: two jaws around the blade, a lid across them ── */
  const body = makePart("body", { lift: 13, delay: 0.18, span: 0.6 });
  const shoeJaw = [[-BODY.x, -BODY.z], [-BLADE - 0.6, -BODY.z], [-BLADE - 0.6, -10.5], [-7.6, -10.5], [-7.6, 10.5], [-BLADE - 0.6, 10.5], [-BLADE - 0.6, BODY.z], [-BODY.x, BODY.z]];
  const wedgeJaw = [[WALL.bottom, -BODY.z], [BODY.x, -BODY.z], [BODY.x, BODY.z], [WALL.top, BODY.z]];
  for (const jaw of [shoeJaw, wedgeJaw]) {
    addMesh(body, slab(jaw, BODY.y0, BODY.y1 - 0.7), cast, { edgeOpacity: 0.85 });
    // its top, milled flat: what the lid sits on — and what one sees once the lid is off
    addMesh(body, slab(jaw, BODY.y1 - 0.7, BODY.y1, 0.2), machined, { edgeOpacity: 0.7 });
  }
  // the fixed shoe, on its stack of disc springs: what makes the grip progressive
  addMesh(body, slab([[-BLADE - 2.7, -9], [-BLADE - 0.3, -9], [-BLADE - 0.3, 9], [-BLADE - 2.7, 9]], BODY.y0 + 0.8, BODY.y1 - 1.2, 0.15), bright, { edgeOpacity: 0.6 });
  for (const z of [-6, 0, 6]) {
    for (let j = 0; j < 4; j++) addMesh(body, new THREE.CylinderGeometry(1.55, 1.2, 0.5, 28).rotateZ(Math.PI / 2), bright, { pos: [-BLADE - 3.15 - j * 0.75, 7.7, z], edges: false });
    addMesh(body, new THREE.CylinderGeometry(0.45, 0.45, 3.4, 12).rotateZ(Math.PI / 2), cast, { pos: [-BLADE - 4.4, 7.7, z], edges: false });
  }
  A.body = anchor(body, -BODY.x, BODY.y1, 8);
  A.shoe = anchor(body, -BLADE - 1.5, BODY.y1 - 1.2, 0);

  const lid = makePart("lid", { lift: 38, delay: 0, span: 0.6 });
  const ofLid = metals();
  addMesh(lid, slab([[-BODY.x, -BODY.z], [BODY.x, -BODY.z], [BODY.x, BODY.z], [-BODY.x, BODY.z]], BODY.y1 + 0.2, BLOCK.top), ofLid.cast, { edgeOpacity: 0.9 });
  for (const [x, z] of [[-10.6, -11], [10.6, -11], [-10.6, 11], [10.6, 11]]) {
    addMesh(lid, new THREE.CylinderGeometry(1.75, 1.75, 0.22, 24), ofLid.machined, { pos: [x, BLOCK.top + 0.11, z], edges: false });
    addMesh(lid, new THREE.CylinderGeometry(1.2, 1.2, 0.95, 6), ofLid.bright, { pos: [x, BLOCK.top + 0.6, z], edges: false });
  }
  // the maker's plate
  addMesh(lid, new THREE.BoxGeometry(8.4, 0.1, 4.6), ofLid.machined, { pos: [-4.4, BLOCK.top + 0.05, -4.6], edgeOpacity: 0.45 });
  A.lid = anchor(lid, BODY.x, BLOCK.top, -6);

  /* ── the wedge: thick at the bottom, thin at the top; it climbs the slope and closes on the blade ── */
  const wedge = makePart("wedge", { lift: 25, delay: 0.08, span: 0.6 });
  const slide = new THREE.Group(); // moved along the slanted wall by the film
  const inner = BLADE + GAP; // the tips of its teeth, at rest
  const top = WEDGE.rest + WEDGE.len;
  const outline = [[wallAt(WEDGE.rest) - ROLL, WEDGE.rest], [wallAt(top) - ROLL, top]];
  for (let i = 0; i <= WEDGE.len * 2; i++) outline.push([inner + (i % 2 ? 0.46 : 0), top - i * 0.5]); // its teeth, a centimetre apart
  fx.wedgeMat = solid(0xc6cbce, { rough: 0.42, metal: 0.25, env: 1.2 });
  const wedgeMesh = addMesh(wedge, slab(outline, BODY.y0 + 0.8, BODY.y1 - 1.2, 0.1), fx.wedgeMat, { edgeOpacity: 0.9, threshold: 40 });
  // its biting face, and the strip that tells it apart from the rest
  fx.bite = glow(BRAND.veille, 0.5);
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.16, BODY.y1 - BODY.y0 - 2.6, WEDGE.len - 0.8), fx.bite);
  face.position.set(inner + 0.22, (BODY.y0 + BODY.y1) / 2 - 0.2, WEDGE.rest + WEDGE.len / 2); // between the teeth: they stand out against it
  fx.strip = glow(BRAND.veille, 1.6);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, WEDGE.len - 2.4), fx.strip);
  strip.position.set(inner + 1.25, BODY.y1 - 1.14, WEDGE.rest + WEDGE.len / 2);
  // the rod the governor's rope pulls on: it leaves the block by the top, above the blade
  const lug = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 3), bright);
  lug.position.set(inner + 0.9, BODY.y1 - 0.9, top - 2);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 29.5, 14).rotateX(Math.PI / 2), bright);
  rod.position.set(inner + 0.35, BODY.y1 - 0.9, top - 3 + 14.75);
  rod.castShadow = true;
  const eye = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.42, 10, 28), bright);
  eye.position.set(inner + 0.35, BODY.y1 - 0.9, top + 28);
  eye.rotation.y = Math.PI / 2;
  slide.add(wedgeMesh, face, strip, lug, rod, eye);
  // the rollers it rides on: they travel half as far as it does
  const rollers = new THREE.Group();
  for (let k = 0; k < 4; k++) {
    const z = WEDGE.rest + 2 + k * 4;
    const r = new THREE.Mesh(new THREE.CylinderGeometry(ROLL * 0.48, ROLL * 0.48, BODY.y1 - BODY.y0 - 2.4, 16), bright);
    r.position.set(wallAt(z) - ROLL / 2, (BODY.y0 + BODY.y1) / 2 - 0.2, z);
    rollers.add(r);
  }
  wedge.add(slide, rollers);
  fx.slide = slide;
  A.wedge = anchor(slide, inner + 2.4, BODY.y1 - 1.2, WEDGE.rest + 5);
  A.eye = anchor(slide, inner + 0.35, BODY.y1 - 0.9, top + 28);
  A.teeth = anchor(slide, inner, BODY.y1 - 1.2, WEDGE.rest + WEDGE.len / 2);
  A.rod = anchor(slide, inner + 0.35, BODY.y1 - 0.9, top + 15);

  Object.assign(parts, { body, wedge, lid });
  root.add(...Object.values(parts));
  fx.sparks = makeSparks();
  root.add(fx.sparks.points);
  // the outline of the block, as a light: how it is found from far away (a drawing device, not a lamp)
  const outlineMats = [...lid.userData.part.mats, ...body.userData.part.mats].filter((m) => m.isLineMaterial && m.color.r > 0.5);

  /**
   * bite   0 → 1: the wedge climbs the slope and closes on the blade
   * slip   cm the rail has run through the block (the car falling)
   * heat   0 → 1: the teeth on the steel · hold 0 → 1: it grips — the biting face goes from signal to veille
   * aura   0 → 1: the block's outline lights up (veille; signal with `grip`) · spark: seconds since the bite (< 0: none)
   */
  const hue = new THREE.Color();
  function pose({ bite = 0, slip = 0, hold = 0, heat = 0, aura = 0, grip = 0, spark = -1, px = 1 }) {
    const d = WEDGE.travel * bite;
    slide.position.set(-d * SLOPE, 0, d);
    rollers.position.set((-d * SLOPE) / 2, 0, d / 2);
    if (fx.rail) fx.rail.position.z = slip % 6; // the graduations repeat every 6 cm: the rail never runs out
    hue.copy(VEILLE).lerp(SIGNAL, Math.min(1, heat * 2.5) * (1 - hold)); // at rest it stands by; biting, it burns; holding, it stands by again
    fx.bite.color.copy(hue).multiplyScalar(0.5 + heat * 7 + hold * 2.2);
    fx.strip.color.copy(hue).multiplyScalar(1.6 + heat * 2.5 + hold);
    hue.copy(VEILLE).lerp(SIGNAL, grip);
    for (const m of outlineMats) m.color.copy(INK).lerp(hue, Math.min(1, aura * 1.5)).multiplyScalar(1 + aura * 3.4);
    fx.sparks.uniforms.uT.value = spark;
    fx.sparks.uniforms.uScale.value = px;
    fx.sparks.points.visible = spark >= 0 && spark < 4.4;
  }
  pose({});

  return { root, parts, fx, A, pose };
}

/* ───────────────────────────────────────────────────────────── the governor
   A sheave the car turns through its own small rope. Two weights ride on it, held in by springs;
   speed throws them outward. At 115 % they reach the teeth of the ring around them: the sheave
   locks, the rope stops — and the car, which does not, pulls its own wedges up.
   The sheave turns in the XY plane, facing +Z. */
export function buildGovernor() {
  const root = new THREE.Group();
  const fx = {};
  const A = {};
  const R = 15; // the flanges
  const GROOVE = R - 1.3; // where the rope sits
  const TIP = R + 3.2; // the teeth of the ring reach in to here
  const ROOT = R + 5.2;
  const OUT = R + 8.6;
  const PIN = 10.5; // the weights hinge this far from the axle
  const steel = solid(0x3a434b, { rough: 0.38, metal: 0.75, coat: 0.3, coatRough: 0.35, env: 1.2 });
  const cast = solid(0x161b1f, { rough: 0.55, metal: 0.55, coat: 0.45, coatRough: 0.4, env: 1.1 });
  const bright = solid(0xa4acb1, { rough: 0.32, metal: 0.7, env: 1.4 });
  const dark = solid(0x0b0e11, { rough: 0.7, metal: 0.3 });
  const plate = (shape, z0, z1, bevel = 0.25) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: z1 - z0 - 2 * bevel, curveSegments: 40, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 2 });
    geo.translate(0, 0, z0 + bevel);
    return geo;
  };
  const disc = (radius, holes = []) => {
    const s = new THREE.Shape().absarc(0, 0, radius, 0, Math.PI * 2, false);
    for (const [x, y, r] of holes) s.holes.push(new THREE.Path().absarc(x, y, r, 0, Math.PI * 2, true));
    return s;
  };

  /* ── what does not turn: the back plate on its beam, and the ring of teeth around the sheave ── */
  const frame = makePart("frame");
  const back = new THREE.Shape();
  const [bw, bh, br] = [25, 30, 5];
  back.moveTo(-bw + br, -bh - 2);
  back.lineTo(bw - br, -bh - 2);
  back.quadraticCurveTo(bw, -bh - 2, bw, -bh - 2 + br);
  back.lineTo(bw, bh - br);
  back.quadraticCurveTo(bw, bh, bw - br, bh);
  back.lineTo(-bw + br, bh);
  back.quadraticCurveTo(-bw, bh, -bw, bh - br);
  back.lineTo(-bw, -bh - 2 + br);
  back.quadraticCurveTo(-bw, -bh - 2, -bw + br, -bh - 2);
  addMesh(frame, plate(back, -6.6, -4.9), cast, { edgeOpacity: 0.8 });
  addMesh(frame, new THREE.BoxGeometry(96, 8, 9), cast, { pos: [0, -bh - 6, -9.4], edgeOpacity: 0.7 });
  // the ring: a ratchet turned inside out
  const TEETH = 18;
  const ring = new THREE.Shape().absarc(0, 0, OUT, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  for (let k = 0; k < TEETH; k++) {
    const a0 = (k / TEETH) * Math.PI * 2;
    const a1 = ((k + 0.74) / TEETH) * Math.PI * 2;
    const a2 = ((k + 1) / TEETH) * Math.PI * 2;
    if (k === 0) hole.moveTo(ROOT * Math.cos(a0), ROOT * Math.sin(a0));
    hole.lineTo(TIP * Math.cos(a1), TIP * Math.sin(a1)); // a long ramp…
    hole.lineTo(ROOT * Math.cos(a2), ROOT * Math.sin(a2)); // …and a steep face: what the weight butts against
  }
  ring.holes.push(hole);
  const ringMesh = addMesh(frame, plate(ring, 2.0, 4.4, 0.2), cast, { edgeOpacity: 0.9, threshold: 30 });
  fx.ringEdges = [...ringMesh.children].find((c) => c.material?.isLineMaterial).material;
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    addMesh(frame, new THREE.CylinderGeometry(1.15, 1.15, 7.2, 16).rotateX(Math.PI / 2), bright, { pos: [(OUT - 2.2) * Math.cos(a), (OUT - 2.2) * Math.sin(a), -1.5], edges: false });
    addMesh(frame, new THREE.CylinderGeometry(1.5, 1.5, 0.8, 6).rotateX(Math.PI / 2), bright, { pos: [(OUT - 2.2) * Math.cos(a), (OUT - 2.2) * Math.sin(a), 4.75], edges: false });
  }
  root.add(frame);

  /* ── the sheave: two flanges, the groove between them, holes that show it turning ── */
  const wheel = new THREE.Group();
  const sheave = makePart("wheel");
  const holes = Array.from({ length: 4 }, (_, k) => {
    const a = (65 + k * 90) * DEG;
    return [7.4 * Math.cos(a), 7.4 * Math.sin(a), 2.5];
  });
  addMesh(sheave, plate(disc(R, holes), 1.0, 1.8, 0.2), steel, { edgeOpacity: 0.85, threshold: 40 });
  addMesh(sheave, plate(disc(GROOVE - 0.5, holes), -1.0, 1.0, 0), dark, { edges: false });
  addMesh(sheave, plate(disc(R, holes), -1.8, -1.0, 0.2), steel, { edgeOpacity: 0.6, threshold: 40 });
  addMesh(sheave, new THREE.CylinderGeometry(3.3, 3.3, 5.4, 32).rotateX(Math.PI / 2), bright, { pos: [0, 0, 1.1], threshold: 40, edgeOpacity: 0.6 });
  addMesh(sheave, new THREE.CylinderGeometry(1.5, 1.5, 0.9, 6).rotateX(Math.PI / 2), cast, { pos: [0, 0, 4.2], edges: false });
  wheel.add(sheave);

  /* ── the two weights: hinged near the rim, held in by a spring, a tooth at the far end ── */
  const pawlShape = new THREE.Shape();
  pawlShape.moveTo(-1.7, -1.5);
  pawlShape.lineTo(6.0, -2.3);
  pawlShape.quadraticCurveTo(9.9, -2.6, 10.5, -0.3);
  pawlShape.lineTo(10.6, 2.6); // the tooth
  pawlShape.lineTo(8.7, 1.7);
  pawlShape.lineTo(5.4, 1.8);
  pawlShape.lineTo(-1.7, 1.5);
  pawlShape.quadraticCurveTo(-2.7, 0, -1.7, -1.5);
  const SPRING_AT = new THREE.Vector3(5.4, -0.2, 1.3); // on the weight, where the spring hooks
  fx.pawlMat = solid(0xb9bfc3, { rough: 0.4, metal: 0.35, env: 1.3 });
  fx.tips = glow(BRAND.signal, 0.6);
  fx.weights = [20 * DEG, 200 * DEG].map((phi) => {
    const pivot = new THREE.Group();
    pivot.position.set(PIN * Math.cos(phi), PIN * Math.sin(phi), 2.0);
    const arm = makePart("weight");
    addMesh(arm, plate(pawlShape, 0, 2.2, 0.2), fx.pawlMat, { edgeOpacity: 0.9, threshold: 40 });
    addMesh(arm, new THREE.CylinderGeometry(0.85, 0.85, 2.8, 16).rotateX(Math.PI / 2), cast, { pos: [0, 0, 1.2], edges: false });
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.3, 2.3), fx.tips);
    tip.position.set(10.72, 1.3, 1.1);
    arm.add(tip);
    pivot.add(arm);
    wheel.add(pivot);
    // the post its spring is hooked on, nearer the axle
    const post = new THREE.Vector3(4.4 * Math.cos(phi - 118 * DEG), 4.4 * Math.sin(phi - 118 * DEG), 3.3);
    addMesh(sheave, new THREE.CylinderGeometry(0.5, 0.5, 2.2, 12).rotateX(Math.PI / 2), cast, { pos: [post.x, post.y, 2.6], edges: false });
    const spring = new Line2(new LineGeometry(), lineMat(BRAND.ink, 2, { opacity: 0.9 }));
    spring.frustumCulled = false;
    wheel.add(spring);
    return { pivot, phi, post, spring };
  });
  root.add(wheel);
  fx.wheel = wheel;
  A.wheel = anchor(root, -R * 0.72, R * 0.72, 2);
  A.ring = anchor(root, OUT * 0.72, -OUT * 0.72, 4.4);
  A.weight = anchor(fx.weights[0].pivot, 8, 1.2, 2.4);

  const hue = new THREE.Color();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const along = new THREE.Vector3();
  const side = new THREE.Vector3();
  const coil = new Float32Array(3 * 12);
  /**
   * turn   radians the sheave has turned · swing 0 → 1: how far speed has thrown the weights (1: in the teeth)
   * lock   0 → 1: caught — the ring and the tips of the weights go to signal
   */
  function pose({ turn = 0, swing = 0, lock = 0 }) {
    wheel.rotation.z = turn;
    for (const w of fx.weights) {
      // the weight trails behind its hinge, its tooth outward; swinging opens it toward the ring
      w.pivot.rotation.z = w.phi - Math.PI / 2 + swing * 26 * DEG;
      w.pivot.updateMatrix();
      a.copy(w.post);
      b.copy(SPRING_AT).applyMatrix4(w.pivot.matrix);
      b.z = a.z;
      along.subVectors(b, a);
      side.set(-along.y, along.x, 0).normalize().multiplyScalar(0.62);
      // a coil: straight at both ends, zigzag in between
      for (let i = 0; i < 12; i++) {
        const u = i === 0 ? 0 : i === 11 ? 1 : 0.1 + (0.8 * (i - 1)) / 9;
        const k = i < 2 || i > 9 ? 0 : i % 2 ? 1 : -1;
        coil.set([a.x + along.x * u + side.x * k, a.y + along.y * u + side.y * k, a.z], i * 3);
      }
      w.spring.geometry.setPositions(coil);
    }
    hue.copy(INK).lerp(SIGNAL, lock);
    fx.ringEdges.color.copy(hue).multiplyScalar(1 + lock * 4.5);
    hue.copy(VEILLE).lerp(SIGNAL, Math.max(lock, Math.min(1, Math.max(0, swing - 0.8) * 5)));
    fx.tips.color.copy(hue).multiplyScalar(0.6 + swing * 2.2 + lock * 4);
  }
  pose({});
  // a caught sheave rests with the tooth of each weight against the steep face of a tooth of the ring
  const PITCH = (Math.PI * 2) / TEETH;
  const REST = 7.1 * DEG;
  /** The angle the sheave is stopped at, if it is caught while at `turn` (it turns clockwise: toward the negatives). */
  const settle = (turn) => REST + Math.floor((turn - REST) / PITCH) * PITCH;
  return { root, fx, A, pose, R, groove: GROOVE, settle };
}
