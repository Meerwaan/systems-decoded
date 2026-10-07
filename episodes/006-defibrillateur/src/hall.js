// The place: a station concourse on "your way", seen like an X-ray — a floor of tiles, a long wall
// in fine lines, and on that wall, thirty metres away, the green box. Solid, only what the story
// needs: three people of glass (the one who falls, the witness who calls and pushes on the chest,
// and TOI), the heart of the one who fell, the box and what is in it.
// Centimetres; the floor is y = 0; the hall runs along x. The one who falls ends on the back, head
// toward −x, feet toward +x, seen in profile from the +z side (where the camera lives).
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makeFigure } from "@kit/figure.js";
import { makeSurface, makePool } from "@kit/atmo.js";
import { solid, glow, glass, lineMat, anchor } from "@kit/build3d.js";
import { buildAED, padGeometry, heartSign, boltSign, CASE, PAD } from "./model.js";
import { buildHeart } from "./heart.js";

const DEG = Math.PI / 180;
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const INK = new THREE.Color(BRAND.ink);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const lerp = (a, b, u) => a + (b - a) * u;

export const HALL = { x: 20000, wall: -420, far: 3000, height: 470 }; // the wall behind the scene; how far along it the box is
const FEET = 85; // where the one who falls was standing (x): lying, the body is centred on the origin
const BACK = 10.5; // lying on the back, the axis of the body is this far above the floor
export const BOX = { x: HALL.far, y: 150, z: HALL.wall + 11 }; // the centre of the cabinet on the wall
/** Where things are once the body lies (world of the hall): the chest, the heart, the two electrodes. */
export const SPOT = { heart: V(-46, 12.7, -3.4), chest: V(-43, 21, 0), head: V(-81, 12, 0), floorBox: V(-122, 0, 54) };

const softGlow = (power = 2.2) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uPower: { value: power } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * f, 1.0);
      }`,
  });

// A light seen from far away: a bright core and a long tail. (A sphere that fades evenly from its
// centre reads as a green ball stuck on the wall.)
const halo = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main() {
        float n = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        gl_FragColor = vec4(uColor * (0.8 * pow(n, 14.0) + 0.2 * pow(n, 4.0)), 1.0);
      }`,
  });

export function buildHall() {
  const group = new THREE.Group();
  group.position.set(HALL.x, 0, 0);
  const fx = {};
  const A = {};

  /* ── the floor: tiles, no slab (seen from low, a floor is a grey band across the picture) ── */
  fx.floor = makeSurface({ radius: 5200, cell: 60, fade: 900, lift: 14 });
  fx.floor.group.children[0].visible = false;
  fx.floor.group.position.x = 1200;
  group.add(fx.floor.group);

  fx.pool = makePool({ radius: 300, color: BRAND.signal });
  fx.pool.mesh.position.set(-10, 0.6, 0);
  group.add(fx.pool.mesh);

  /* ── the wall behind: pilasters, a rail, a board of departures, a bench — all in fine lines ── */
  const seg = [];
  const line = (a, b) => seg.push(...a, ...b);
  const W = HALL.wall;
  const X0 = -1500;
  const X1 = HALL.far + 900;
  for (const y of [0, 96, HALL.height]) line([X0, y, W], [X1, y, W]);
  for (let x = X0 + 150; x <= X1; x += 300) { // (the box hangs between two pilasters, not on one)
    line([x, 0, W], [x, HALL.height, W]);
    line([x, HALL.height, W], [x, HALL.height, W + 620]); // a beam of the roof, toward us
  }
  line([X0, HALL.height, W + 620], [X1, HALL.height, W + 620]);
  // the board of departures
  const board = (x0, x1, y0, y1) => {
    line([x0, y0, W + 6], [x1, y0, W + 6]);
    line([x1, y0, W + 6], [x1, y1, W + 6]);
    line([x1, y1, W + 6], [x0, y1, W + 6]);
    line([x0, y1, W + 6], [x0, y0, W + 6]);
    for (let y = y0 + 22; y < y1 - 4; y += 22) line([x0 + 14, y, W + 6], [x1 - 14, y, W + 6]);
  };
  board(380, 800, 250, 400);
  board(1700, 2120, 250, 400);
  // a bench against the wall
  for (const [bx, len] of [[-760, 300], [1010, 300], [2300, 300]]) {
    for (const y of [44, 50]) {
      line([bx, y, W + 14], [bx + len, y, W + 14]);
      line([bx, y, W + 62], [bx + len, y, W + 62]);
    }
    for (const x of [bx, bx + len]) {
      line([x, 0, W + 20], [x, 50, W + 20]);
      line([x, 0, W + 58], [x, 50, W + 58]);
      line([x, 50, W + 14], [x, 50, W + 62]);
    }
  }
  const linesGeo = new LineSegmentsGeometry();
  linesGeo.setPositions(seg);
  fx.lines = lineMat(BRAND.ink, 1.9, { opacity: 0.5, fog: true });
  const lines = new LineSegments2(linesGeo, fx.lines);
  lines.frustumCulled = false;
  group.add(lines);
  // the wall itself: a breath of glass
  fx.wall = glass(BRAND.ink, { base: 0.012, rim: 0.05, power: 2 });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, HALL.height), fx.wall);
  wall.position.set((X0 + X1) / 2, HALL.height / 2, W - 1);
  group.add(wall);

  /* ── the green box: a cabinet on the wall, its sign above, and inside… the thing ── */
  const cabinet = new THREE.Group();
  cabinet.position.set(BOX.x, BOX.y, BOX.z);
  group.add(cabinet);
  const CAB = { w: 44, h: 50, d: 22 };
  fx.cabinet = glow(BRAND.veille, 0.5);
  const frame = [];
  const f = (a, b) => frame.push(...a, ...b);
  for (const z of [-CAB.d / 2, CAB.d / 2]) {
    f([-CAB.w / 2, -CAB.h / 2, z], [CAB.w / 2, -CAB.h / 2, z]);
    f([CAB.w / 2, -CAB.h / 2, z], [CAB.w / 2, CAB.h / 2, z]);
    f([CAB.w / 2, CAB.h / 2, z], [-CAB.w / 2, CAB.h / 2, z]);
    f([-CAB.w / 2, CAB.h / 2, z], [-CAB.w / 2, -CAB.h / 2, z]);
  }
  for (const x of [-CAB.w / 2, CAB.w / 2]) for (const y of [-CAB.h / 2, CAB.h / 2]) f([x, y, -CAB.d / 2], [x, y, CAB.d / 2]);
  const frameGeo = new LineSegmentsGeometry();
  frameGeo.setPositions(frame);
  fx.frame = lineMat(BRAND.veille, 3, { opacity: 0.95, hdr: 1.5 });
  const frameLines = new LineSegments2(frameGeo, fx.frame);
  cabinet.add(frameLines);
  // its back, lit: the box is a lamp on that wall
  fx.back = glow(BRAND.veille, 0.5);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(CAB.w - 2, CAB.h - 2), fx.back);
  back.position.z = -CAB.d / 2 + 0.6;
  cabinet.add(back);
  fx.door = glass(BRAND.veille, { base: 0.03, rim: 0.3, power: 2.2 });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(CAB.w, CAB.h), fx.door);
  door.position.x = CAB.w / 2;
  const hinge = new THREE.Group(); // the door turns on its left edge
  hinge.position.set(-CAB.w / 2, 0, CAB.d / 2);
  hinge.add(door);
  const doorEdge = [];
  for (const [a, b] of [[[0, -CAB.h / 2, 0], [CAB.w, -CAB.h / 2, 0]], [[CAB.w, -CAB.h / 2, 0], [CAB.w, CAB.h / 2, 0]], [[CAB.w, CAB.h / 2, 0], [0, CAB.h / 2, 0]]]) doorEdge.push(...a, ...b);
  const doorGeo = new LineSegmentsGeometry();
  doorGeo.setPositions(doorEdge);
  hinge.add(new LineSegments2(doorGeo, fx.frame));
  cabinet.add(hinge);
  // the sign above it: a heart, a bolt
  const sign = new THREE.Group();
  sign.position.set(0, CAB.h / 2 + 30, -CAB.d / 2 + 3);
  fx.sign = glow(BRAND.veille, 1.5);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), fx.sign);
  sign.add(plate);
  fx.signHeart = glow(BRAND.ink, 0.9);
  const signHeart = new THREE.Mesh(heartSign(24, 0.4), fx.signHeart);
  signHeart.position.set(0, 0.5, 0.3);
  sign.add(signHeart);
  fx.signBolt = glow(BRAND.veille, 0.5);
  const signBolt = new THREE.Mesh(boltSign(24, 0.5), fx.signBolt);
  signBolt.position.set(0, 0.5, 0.6);
  sign.add(signBolt);
  cabinet.add(sign);
  // its light, on the wall and from far away
  fx.beacon = new THREE.Mesh(new THREE.SphereGeometry(95, 40, 28), halo());
  cabinet.add(fx.beacon);
  A.box = anchor(cabinet, 0, 0, CAB.d / 2);
  A.sign = anchor(cabinet, 0, CAB.h / 2 + 30, 0);

  // the defibrillator: in the cabinet (standing, its top toward us), or on the floor beside the one who fell
  const aed = buildAED();
  group.add(aed.root);
  fx.aed = aed;
  const inBox = { pos: V(BOX.x, BOX.y, BOX.z - 8), rot: new THREE.Euler(Math.PI / 2, 0, 0) }; // standing: its top toward us, its handle up
  const onFloor = { pos: SPOT.floorBox.clone(), rot: new THREE.Euler(0, 0.55, 0) };
  A.aed = anchor(aed.root, 0, CASE.h, 0);

  /* ── the one who falls ── */
  const fall = new THREE.Group(); // turns around the feet: upright → on the back
  fall.position.set(FEET, 0, 0);
  group.add(fall);
  const victim = makeFigure({ hands: "flat" });
  victim.group.rotation.y = Math.PI / 2; // facing +x: falling backward is falling toward −x
  victim.flesh.color.multiplyScalar(0.62); // the head stays solid (a person), but the heart is the brightest thing of the body
  fall.add(victim.group);
  // the heart, in the chest
  const heart = buildHeart();
  heart.group.position.set(3.4, 131 - victim.HIP, 2.2);
  heart.group.scale.setScalar(1.12);
  victim.torso.add(heart.group);
  fx.heart = heart;
  A.heart = heart.A.centre;
  A.chest = anchor(group, SPOT.chest.x, SPOT.chest.y, SPOT.chest.z);
  A.head = anchor(victim.torso, 0, 166.5 - victim.HIP + 14, 0);

  // the two electrodes, where they go: under the right collarbone, on the left flank
  const padMat = solid(0xcfcbc0, { rough: 0.7, env: 0.5 });
  const mkPad = () => new THREE.Mesh(padGeometry(), padMat); // no shadow: on a chest of glass, it would fall through to the floor
  // In the frame of the trunk: x its left, y toward the head, z out of the chest. `n`: what the electrode faces;
  // `from`: where it comes from (the hand that brings it), `over`: how high its way arcs.
  const AX = { x: V(1, 0, 0), y: V(0, 1, 0) };
  const turned = (...steps) => steps.reduce((q, [axis, angle]) => q.multiply(new THREE.Quaternion().setFromAxisAngle(AX[axis], angle)), new THREE.Quaternion());
  const PADS = [
    // under the right collarbone, on the front of the chest
    { at: V(-8.4, 134.5 - victim.HIP, 9.6), quat: turned(["x", Math.PI / 2], ["y", -0.12]), n: V(0, 0, 1), from: V(-17.6, 6.5, 32), over: 0 },
    // on the left flank, under the armpit: it follows the ribs, half turned toward the side
    { at: V(12.0, 114 - victim.HIP, 5.2), quat: turned(["y", 0.82], ["x", Math.PI / 2], ["y", 0.22]), n: V(0.732, 0, 0.682), from: V(-33.6, 10, 34.7), over: 14 },
  ];
  fx.pads = PADS.map((p) => {
    const mesh = mkPad();
    mesh.position.copy(p.at);
    mesh.quaternion.copy(p.quat);
    mesh.scale.setScalar(1.15);
    victim.torso.add(mesh);
    return { mesh, home: p.at.clone(), n: p.n, from: p.from, over: p.over, at: V(0, 0, 0), facing: V(0, 0, 0) };
  });
  A.pad1 = anchor(victim.torso, PADS[0].at.x, PADS[0].at.y, PADS[0].at.z + 1);
  A.pad2 = anchor(victim.torso, PADS[1].at.x + 1, PADS[1].at.y, PADS[1].at.z);
  // the way the shock takes: from one electrode to the other, through the heart
  const through = new THREE.CatmullRomCurve3([PADS[0].at.clone(), V(-2, 136 - victim.HIP, 5), V(3.4, 131 - victim.HIP, 2.2), V(9, 122 - victim.HIP, 1), PADS[1].at.clone()]);
  const pathGeo = new LineGeometry();
  pathGeo.setPositions(through.getPoints(40).flatMap((q) => [q.x, q.y, q.z]));
  fx.path = lineMat(BRAND.signal, 0.85, { opacity: 0, additive: true });
  fx.path.worldUnits = true;
  fx.path.depthTest = false;
  const path = new Line2(pathGeo, fx.path);
  path.renderOrder = 7;
  victim.torso.add(path);
  fx.bursts = PADS.map((p) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16), softGlow(3.4));
    mesh.position.copy(p.at);
    victim.torso.add(mesh);
    return mesh;
  });

  /* ── the witness: on the knees beside the chest, the arms straight, pushing ── */
  const witness = makeFigure({ glassK: 0.55, hands: "flat" });
  group.add(witness.group);
  // the phone, on the floor, on speaker
  fx.phone = glow(BRAND.veille, 0);
  const phone = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.9, 15), solid(0x1a2025, { rough: 0.5 }));
  phone.position.set(-78, 0.5, -58);
  phone.rotation.y = 0.5;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.3, 13.4), fx.phone);
  screen.rotation.x = -Math.PI / 2;
  screen.position.y = 0.5;
  phone.add(screen);
  group.add(phone);
  A.phone = anchor(group, -78, 8, -58);

  /* ── TOI ── */
  const toi = makeFigure({ glassK: 0.55, hands: "flat" });
  group.add(toi.group);
  A.toi = anchor(toi.torso, 0, 166.5 - toi.HIP + 16, 0);

  /* ── people going by, far along the hall: this is a public place ── */
  fx.crowd = [];
  // (placed so that, in the first picture, nobody stands in front of the one who falls or in front of the box — and
  // nobody on the way the camera flies to the box: a figure of glass brushed past at speed is one stray frame)
  for (const [x, z, turn] of [[520, -330, 0.6], [1180, 120, -2.2], [3500, -150, -1.9], [3350, 150, -0.4], [-900, -200, 0.9]]) {
    const p = makeFigure({ glassK: 0.42, hands: "flat" });
    p.group.position.set(x, 0, z);
    p.group.rotation.y = turn;
    p.flesh.color.multiplyScalar(0.45);
    group.add(p.group);
    fx.crowd.push(p);
  }

  /* ── the way to the box, on the floor: dashes in centimetres on a dark line ── */
  const routePts = [V(-128, 1.2, -100), V(200, 1.2, -200), V(1500, 1.2, -300), V(BOX.x - 60, 1.2, HALL.wall + 80), V(BOX.x, 1.2, HALL.wall + 40)];
  const routeCurve = new THREE.CatmullRomCurve3(routePts);
  const routeGeo = new LineGeometry();
  routeGeo.setPositions(routeCurve.getPoints(120).flatMap((q) => [q.x, q.y, q.z]));
  fx.route = lineMat(BRAND.veille, 6, { opacity: 0, dashed: true, dashSize: 46, gapSize: 34 });
  fx.route.worldUnits = true;
  const route = new Line2(routeGeo, fx.route);
  route.computeLineDistances();
  route.frustumCulled = false;
  group.add(route);
  A.routeMid = anchor(group, 1500, 1.2, -300);

  /* ── the cables, once the box is on the floor: from its slot to each electrode ── */
  fx.cables = lineMat(0x8a949b, 0.6, { opacity: 0 });
  fx.cables.worldUnits = true;
  const cables = [0, 1].map(() => {
    const geo = new LineGeometry();
    geo.setPositions([0, 0, 0, 0, 0, 1]);
    const l = new Line2(geo, fx.cables);
    l.frustumCulled = false;
    group.add(l);
    return l;
  });

  /* ───────────────────────── poses ───────────────────────── */
  const tmp = new THREE.Vector3();
  const inv = new THREE.Matrix4();
  /** A point of the hall, in the frame of a figure (whatever it stands in). */
  const toLocal = (fig, world) => {
    fig.group.updateWorldMatrix(true, false);
    inv.copy(fig.group.matrixWorld).invert();
    return tmp.copy(world).applyMatrix4(group.matrixWorld).applyMatrix4(inv).clone();
  };
  const fwd = V(0, 0, 1);

  /** The one who falls. c: 0 upright (the knees give way) → 1 on the back. */
  const planted = { L: V(FEET + 2, 8, -8.6), R: V(FEET + 2, 8, 8.6) };
  function collapse(c) {
    const turn = smooth(0.12, 1, c);
    const angle = 90 * Math.pow(turn, 1.15);
    fall.rotation.z = angle * DEG;
    fall.position.y = BACK * smooth(0.55, 1, c);
    // the knees give way: the hips come down, then the legs lie out straight
    const drop = 36 * smooth(0, 0.34, c) * (1 - smooth(0.5, 0.96, c));
    victim.group.position.set(0, -drop, 0);
    victim.lean(-12 * Math.sin(Math.PI * clamp01(c / 0.9)), 0, 0);
    const straight = smooth(0.5, 0.97, c);
    for (const s of ["L", "R"]) {
      const side = s === "L" ? 1 : -1;
      const local = toLocal(victim, planted[s]);
      local.lerp(tmp.set(side * 9.5, 8, 0), straight);
      victim.leg(s, local, fwd);
      // the arms: hanging, then thrown out a little, then lying beside the body
      victim.reach(s, tmp.set(side * lerp(20.5, 31, smooth(0.2, 1, c)), lerp(92, 99, c), lerp(3, -7.5, smooth(0.3, 1, c))));
    }
  }

  /** On the knees at (x, z), facing \`turn\`; leaning \`pitch\` forward. \`sit\` 1: down on the heels, to work low. */
  function kneel(fig, x, z, turn, pitch, sit = 0) {
    fig.group.position.set(x, -43 - 17 * sit, z);
    fig.group.rotation.set(0, turn, 0);
    for (const s of ["L", "R"]) fig.leg(s, tmp.set((s === "L" ? 1 : -1) * 9.5, 49 + 17 * sit, lerp(-40, -5, sit)), tmp2.set(0, -0.6, 1), tmp3.set(0, -0.9, -0.45));
    fig.lean(pitch, 0, 0);
  }
  /** A direction of the hall, in the frame of a figure that stands in it. */
  const turnQ = new THREE.Quaternion();
  const dirLocal = (fig, v) => v.applyQuaternion(turnQ.copy(fig.group.quaternion).invert());
  const tmp2 = new THREE.Vector3();
  const tmp3 = new THREE.Vector3();
  function stand(fig, x, z, turn) {
    fig.group.position.set(x, 0, z);
    fig.group.rotation.set(0, turn, 0);
    fig.lean(0, 0, 0);
    fig.leg("L", tmp.set(8.6, 8, 0));
    fig.leg("R", tmp.set(-8.6, 8, 0));
    fig.reach("L", tmp.set(20.5, 92, 3));
    fig.reach("R", tmp.set(-20.5, 92, 3));
  }
  /** Running: a cycle of the legs and the arms, as a function of the distance covered. */
  function run(fig, x, z, turn, dist) {
    const a = (dist / 150) * Math.PI * 2; // one stride every 1.5 m
    fig.group.position.set(x, 3 * Math.abs(Math.sin(a)), z);
    fig.group.rotation.set(0, turn, 0);
    fig.lean(14, 0, 0);
    for (const s of ["L", "R"]) {
      const k = s === "L" ? 1 : -1;
      const ph = a + (k > 0 ? 0 : Math.PI);
      fig.leg(s, tmp.set(k * 8.6, 8 + 20 * Math.max(0, Math.sin(ph)), 30 * Math.cos(ph)), fwd);
      fig.reach(s, tmp.set(k * 23, 104 + 6 * Math.cos(ph), 8 - 22 * Math.cos(ph)), tmp2.set(k * 0.2, -0.4, -1));
    }
  }

  const WITNESS = { x: SPOT.chest.x, z: -43.5 };
  const TOI_AT = { x: -47, z: 52 }; // back with the box: at the right side of the one who fell, facing the witness
  const hand = new THREE.Vector3();
  const hue = new THREE.Color();
  const lay = { dir: new THREE.Vector3(), palm: new THREE.Vector3() };
  const DOWN = V(0, -1, 0);
  const padWorld = new THREE.Vector3();
  /**
   * cast       1: the three people of the story are there · 0: the hall on an ordinary day
   * collapse   0 → 1: the fall (the film starts with it under way)
   * witness    0: standing by · 1: on the knees, pushing on the chest · push 0/1: the pushes · off 0 → 1: hands off
   * toi        0: standing by · 1: running to the box (toiS: 0 → 1 along the way) · 2: on the knees, at the head · 3: at the box (door 0 → 1: it opens)
   * boxAt      0: the defibrillator is in the cabinet · 1: on the floor · padsOn [0–1, 0–1]: each electrode on the chest
   * chaos / order / flash / heartDim / halo: the heart (see heart.js) · shock 0 → 1: the current through the chest
   * route 0 → 1: the way to the box · call 0 → 1: the phone · lines: the fine lines · beacon: how far the box shines
   * ground: the pool of light under the one who fell (signal, then veille: `mood`) · sign: the sign above the box
   * ghost 0 / 1: seen from close, the three of them are glass all over (head and hands too), the two who help fainter
   */
  function update(S, time, px) {
    // the people of the story: there, or not (tomorrow, the same hall)
    const there = S.cast > 0.5;
    fall.visible = there;
    witness.group.visible = there;
    toi.group.visible = there;
    phone.visible = there && S.call > 0.01;
    collapse(S.collapse);
    heart.update({ chaos: S.chaos, order: S.order, flash: S.flash, dim: S.heartDim, halo: S.halo }, time);

    // the witness
    if (S.witness < 0.5) {
      stand(witness, -95, -160, 0.5);
    } else {
      const beat = S.push * (0.5 - 0.5 * Math.cos(time * Math.PI * 2 * 1.8)); // 108 pushes a minute
      const up = S.off;
      kneel(witness, WITNESS.x + 16 * up, WITNESS.z - 62 * smooth(0, 1, up), 0, lerp(54 + 3.2 * beat, 12, up));
      for (const s of ["L", "R"]) {
        const k = s === "L" ? 1 : -1;
        // one hand on the other, the heel of the hand on the breastbone, the fingers across the chest
        hand.set(k * lerp(1.2, 24, up), lerp(65.4 + (k > 0 ? 0 : 3.4) - 4.6 * beat, 118, up), lerp(39.5, 30, up));
        lay.dir.set(k * lerp(-0.45, 0, up), lerp(0, 0.5, up), 1);
        lay.palm.set(0, lerp(-1, -0.3, up), lerp(0, 1, up));
        witness.reach(s, hand, tmp2.set(k * 0.6, 0.2, -1), lay);
      }
    }

    // the electrodes: in the hand that brings them, then on the chest
    fx.pads.forEach((p, i) => {
      const e = smooth(0, 1, S.padsOn[i]);
      p.mesh.visible = S.padsOn[i] > 0.01;
      p.mesh.position.copy(p.home).addScaledVector(p.from, 1 - e);
      p.mesh.position.z += p.over * 4 * e * (1 - e);
    });
    fall.updateWorldMatrix(true, true);
    group.updateWorldMatrix(true, false);
    fx.pads.forEach((p) => {
      group.worldToLocal(victim.torso.localToWorld(p.at.copy(p.mesh.position)));
      p.facing.copy(p.n).transformDirection(victim.torso.matrixWorld).transformDirection(inv.copy(group.matrixWorld).invert());
    });

    // TOI
    if (S.toi < 0.5) {
      stand(toi, -128, -100, 0.75);
      toi.lean(10, 0, 0);
    } else if (S.toi < 1.5) {
      const u = clamp01(S.toiS);
      const p = routeCurve.getPointAt(u);
      const t = routeCurve.getTangentAt(u);
      run(toi, p.x, p.z, Math.atan2(t.x, t.z), u * routeCurve.getLength());
    } else if (S.toi > 2.5) {
      // at the box: standing beside it, a hand on its door
      stand(toi, BOX.x + 54, BOX.z + 34, Math.PI);
      toi.lean(6, 0, 0);
      lay.dir.set(1, 0.15, 0.35);
      lay.palm.set(0.2, 0, 1);
      toi.reach("L", toLocal(toi, tmp3.set(BOX.x + 27 - 14 * S.door, BOX.y + 4, BOX.z + 15 + 20 * S.door)), tmp2.set(0.6, -0.5, -0.4), lay);
    } else {
      // down on the heels at the right side of the chest, facing the witness: a hand for each electrode —
      // it brings it, presses it, and lets go when the box says so
      const away = smooth(0, 1, S.off);
      kneel(toi, TOI_AT.x, TOI_AT.z + 30 * away, Math.PI, lerp(52, 4, away), 1);
      [["L", 0], ["R", 1]].forEach(([s, i]) => {
        const p = fx.pads[i];
        const k = s === "L" ? 1 : -1;
        // the fingers: across the chest, away from TOI — and, on the flank, down along the ribs
        lay.dir.set(i ? 0.25 : -0.2, 0, -1).addScaledVector(p.facing, -lay.dir.dot(p.facing)).normalize();
        padWorld.copy(p.at).addScaledVector(p.facing, 2.7).addScaledVector(lay.dir, -5);
        const wrist = toLocal(toi, padWorld).lerp(tmp3.set(k * 25, 136, 20), away);
        lay.palm.copy(p.facing).multiplyScalar(-1);
        dirLocal(toi, lay.dir).lerp(tmp3.set(0, 1, 0.25), away);
        dirLocal(toi, lay.palm).lerp(tmp3.set(0, 0, 1), away);
        toi.reach(s, wrist, tmp2.set(k * 0.7, -0.2, -0.6), lay);
      });
    }

    // seen from close, the two who help are glass all over — head and hands too: bent over the chest, they would
    // hide what the story is about. Only the heart and the electrodes stay solid. (Switched on a cut.)
    const ghost = S.ghost > 0.5;
    for (const fig of [victim, witness, toi]) {
      const skin = ghost ? fig.body : fig.flesh;
      for (const mesh of [fig.head, fig.arms.L.hand, fig.arms.R.hand]) {
        mesh.material = skin;
        mesh.castShadow = !ghost;
      }
    }
    for (const fig of [witness, toi]) fig.body.uniforms.uAmount.value = ghost ? 0.5 : 1;

    hinge.rotation.y = -1.9 * S.door;
    // the defibrillator: in its box, or on the floor
    const at = S.boxAt > 0.5 ? onFloor : inBox;
    aed.root.position.copy(at.pos);
    aed.root.rotation.copy(at.rot);
    aed.pose({ led: 1, armed: S.armed, charge: S.charge, listen: S.listen, out: 0, speak: S.speak }, time);

    // their cables, the shock
    const laid = S.boxAt > 0.5 ? Math.min(1, S.padsOn[0] + S.padsOn[1]) : 0;
    fx.cables.opacity = 0.95 * laid;
    if (laid > 0.01 && !cables.done) {
      cables.done = true;
      group.updateWorldMatrix(true, true);
      const slot = aed.A.slot.getWorldPosition(new THREE.Vector3());
      group.worldToLocal(slot);
      fx.pads.forEach((p, i) => {
        const end = victim.torso.localToWorld(p.home.clone());
        group.worldToLocal(end);
        // along the floor on the side of the head, then up onto the chest: the one for the flank goes round by the shoulder
        const c = new THREE.CatmullRomCurve3(
          i
            ? [slot.clone(), V(slot.x + 6, 1.2, slot.z - 16), V(-96, 1.4, 16), V(-74, 19, -6), V(-52, 21.5, -11), V(end.x - 9, end.y + 2.5, end.z - 1), end]
            : [slot.clone(), V(slot.x + 16, 1.2, slot.z - 8), V(-88, 1.4, 34), V(-68, 16, 22), V(end.x - 7, end.y + 2, end.z + 3), end],
        );
        cables[i].geometry.setPositions(c.getPoints(36).flatMap((q) => [q.x, q.y, q.z]));
      });
    }
    for (const l of cables) l.visible = laid > 0.01;
    hue.copy(SIGNAL).lerp(INK, 0.5).multiplyScalar(2.2 * S.shock);
    fx.path.color.copy(hue);
    fx.path.opacity = Math.min(1, S.shock * 1.4);
    path.visible = S.shock > 0.01;
    fx.bursts.forEach((b) => {
      b.material.uniforms.uColor.value.copy(SIGNAL).lerp(INK, 0.5).multiplyScalar(1.5 * S.shock);
      b.scale.setScalar(0.35 + 0.65 * S.shock);
      b.visible = S.shock > 0.01;
    });

    // the place
    fx.lines.opacity = Math.min(1, 0.5 * S.lines);
    fx.pool.uniforms.uColor.value.copy(VEILLE).lerp(SIGNAL, S.mood);
    fx.pool.uniforms.uAmount.value = S.ground * (there ? 1 : 0);
    fx.wall.uniforms.uAmount.value = S.lines;
    fx.floor.grid.uAmount.value = 0.15 * S.lines;
    fx.route.opacity = Math.min(1, 0.9 * S.route);
    fx.route.linewidth = 6 * Math.max(1, S.route * 1.4);
    route.visible = S.route > 0.01;
    fx.phone.color.copy(VEILLE).multiplyScalar(1.6 * S.call);
    const breath = 0.9 + 0.1 * Math.sin(time * 1.9);
    fx.back.color.copy(VEILLE).multiplyScalar(0.3 * breath * Math.min(1.4, S.beacon));
    fx.frame.opacity = 0.95 * Math.min(1, S.beacon);
    // the sign: full from far away; from close, when it would sit behind the header, almost off
    fx.sign.color.copy(VEILLE).multiplyScalar(1.0 * Math.min(1.2, S.beacon) * S.sign);
    fx.signBolt.color.copy(VEILLE).multiplyScalar(0.42 * S.sign);
    fx.signHeart.color.copy(INK).multiplyScalar(0.95 * S.sign);
    fx.beacon.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(0.42 * breath * S.beacon * S.far);
    fx.beacon.scale.setScalar(Math.max(1, S.far));
    fx.beacon.visible = S.beacon * S.far > 0.01;
    for (const p of fx.crowd) p.body.uniforms.uAmount.value = S.lines;
    void px;
  }

  return { group, fx, A, update, victim, witness, toi, heart, route: routeCurve };
}
