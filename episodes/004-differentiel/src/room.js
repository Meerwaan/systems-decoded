// The room, seen like an X-ray: a bathroom wall drawn in fine lines, the two wires that run inside
// it from the consumer unit to a socket, a flex with a bare spot — and you, a hand closed on it.
// Solid: only what the story needs (your head, your fist, your heart, the unit's own device).
// Centimetres. The floor is y = 0, the wall is the plane z = 0, the room is on the +z side.
// You stand facing the wall; the film mostly looks at you from behind it.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeSurface, makePool } from "@kit/atmo.js";
import { solid, glow, glass, lineMat, edgesOf, anchor, lathe } from "@kit/build3d.js";
import { BOX } from "./model.js";

const DEG = Math.PI / 180;
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const INK = new THREE.Color(BRAND.ink);
const HOT = new THREE.Color(1, 0.62, 0.38);

export const ROOM = { x: 20000 }; // the room is far from the bench: the two sets never see each other
const YOU = { z: 40 }; // where you stand, in front of the wall
const TOUCH = new THREE.Vector3(30, 104, 9); // the bare spot on the flex
const REST = new THREE.Vector3(27, 96, 24); // where the hand is once it has let go
const SOCKET = { x: 34, y: 110 };
export const UNIT = { x: -292, y: 172, z: 9, w: 34, h: 46 }; // the consumer unit: centre of its row of devices, how far it stands out
const RUN = 150; // the height the wires run at inside the wall: between the socket and the unit, where the camera follows them

/** A ball of light with no edge: brightest where it faces the eye, nothing at its rim. */
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

/** Embers falling off a point: each one is born again every period — a pure function of time. */
function makeEmbers({ count = 26, seed = 3 } = {}) {
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4); // phase, period (s), size (cm), heading
  for (let i = 0; i < count; i++) seeds.set([rand(), 0.9 + rand() * 0.9, 0.5 + Math.pow(rand(), 2) * 1.2, rand() * Math.PI * 2], i * 4);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uScale: { value: 1 }, uAmount: { value: 0 }, uOrigin: { value: new THREE.Vector3() }, uHot: { value: new THREE.Color(1, 0.8, 0.55).multiplyScalar(4) }, uCool: { value: SIGNAL.clone().multiplyScalar(2.6) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale; uniform vec3 uOrigin; attribute vec4 aSeed; varying float vAge;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          vAge = age;
          float away = 1.5 + 5.0 * age;
          vec3 p = uOrigin + vec3(cos(aSeed.w) * away, -(4.0 * age + 16.0 * age * age), sin(aSeed.w) * away);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = max(1.5, aSeed.z * uScale / max(0.5, -mv.z));
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; uniform float uAmount; varying float vAge;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - d), 1.6) * sin(3.14159 * vAge) * uAmount;
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.0, 0.7, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  return { points, uniforms };
}

/** `device`: the differential (a second copy of the bench model), mounted in the consumer unit. */
export function buildRoom({ device }) {
  const group = new THREE.Group();
  group.position.set(ROOM.x, 0, 0);
  const fx = {};
  const A = {};

  /* ── the floor: wet tiles ── */
  fx.floor = makeSurface({ radius: 900, cell: 20, fade: 150, lift: 4 });
  // seen at a grazing angle from inside the wall, a floor that shines is a grey slab across the picture: this one is matt
  Object.assign(fx.floor.group.children[0].material, { roughness: 1, envMapIntensity: 0 });
  fx.floor.group.children[0].material.color.set(0x06080a);
  fx.wet = makePool({ radius: 95, color: BRAND.veille });
  fx.wet.mesh.position.set(0, 0.3, YOU.z);
  group.add(fx.floor.group, fx.wet.mesh);

  /* ── the wall and what hangs on it: fine lines ── */
  const seg = [];
  const line = (a, b) => seg.push(...a, ...b);
  const rect = (x0, y0, x1, y1, z = 0) => {
    line([x0, y0, z], [x1, y0, z]);
    line([x1, y0, z], [x1, y1, z]);
    line([x1, y1, z], [x0, y1, z]);
    line([x0, y1, z], [x0, y0, z]);
  };
  line([-420, 0, 0], [190, 0, 0]); // where the wall meets the floor
  line([-420, 250, 0], [190, 250, 0]); // …and the ceiling
  line([-170, 0, 0], [-170, 250, 0]); // the partition: the unit is in the hall, next door
  line([-170, 0, 0], [-170, 0, 260]);
  line([190, 0, 0], [190, 250, 0]);
  line([190, 0, 0], [190, 0, 260]);
  rect(SOCKET.x - 4.5, SOCKET.y - 4.5, SOCKET.x + 4.5, SOCKET.y + 4.5); // the socket
  rect(SOCKET.x - 3.2, SOCKET.y - 3.2, SOCKET.x + 3.2, SOCKET.y + 3.2);
  // the basin, its mirror
  rect(72, 118, 138, 196);
  for (const z of [2, 46]) rect(68, 74, 142, 88, z);
  for (const [x, y] of [[68, 74], [142, 74], [142, 88], [68, 88]]) line([x, y, 2], [x, y, 46]);
  line([105, 88, 6], [105, 100, 6]); // the tap
  line([105, 100, 6], [105, 100, 18]);
  // the consumer unit: its box, its rail
  for (const z of [0, UNIT.z]) rect(UNIT.x - UNIT.w / 2, UNIT.y - UNIT.h / 2, UNIT.x + UNIT.w / 2, UNIT.y + UNIT.h / 2, z);
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) line([UNIT.x + (sx * UNIT.w) / 2, UNIT.y + (sy * UNIT.h) / 2, 0], [UNIT.x + (sx * UNIT.w) / 2, UNIT.y + (sy * UNIT.h) / 2, UNIT.z]);
  line([UNIT.x - UNIT.w / 2 + 2, UNIT.y, 1.2], [UNIT.x + UNIT.w / 2 - 2, UNIT.y, 1.2]);
  const wallGeo = new LineSegmentsGeometry();
  wallGeo.setPositions(seg);
  fx.wallMat = lineMat(BRAND.ink, 1.9, { opacity: 0.4 });
  const wall = new LineSegments2(wallGeo, fx.wallMat);
  wall.frustumCulled = false;
  group.add(wall);

  /* ── the devices of the unit: yours (solid), and the row of breakers beside it ── */
  const DEV_X = UNIT.x - UNIT.w / 2 + 3 + BOX.w / 2;
  const holder = new THREE.Group();
  // bench axes → wall axes: its height (Z) goes up, its front (Y) looks into the room
  holder.quaternion.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI));
  holder.position.set(DEV_X, UNIT.y, 1.2);
  holder.add(device.root);
  group.add(holder);
  A.device = anchor(group, DEV_X, UNIT.y, 1.2 + BOX.d + 0.6);
  // the breakers: one module each
  const breakerGeo = new THREE.BoxGeometry(1.74, BOX.h, 5.6);
  const breakerShell = glass(BRAND.ink, { base: 0.02, rim: 0.3, power: 2.4 });
  fx.breakers = Array.from({ length: 7 }, (_, i) => {
    const b = new THREE.Group();
    const x = DEV_X + BOX.w / 2 + 0.6 + 0.9 + i * 1.8;
    b.position.set(x, UNIT.y, 1.2 + 2.8);
    const body = new THREE.Mesh(breakerGeo, breakerShell);
    const edges = edgesOf(breakerGeo, { color: BRAND.ink, width: 1.9, opacity: 0.7 });
    const leverMat = glow(BRAND.ink, 0.7);
    const lever = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.5, 1.1), leverMat);
    lever.position.set(0, 0.9, 3.2);
    b.add(body, edges, lever);
    group.add(b);
    return { group: b, edges: edges.material, lever: leverMat, x };
  });
  const MINE = 2; // the breaker of the socket's circuit
  A.breaker = anchor(group, fx.breakers[MINE].x, UNIT.y, 1.2 + 5.8);
  A.unit = anchor(group, UNIT.x, UNIT.y + UNIT.h / 2, UNIT.z);

  /* ── the two wires in the wall: unit → up → along → down to the socket. And the flex, with its bare spot. ── */
  const wirePath = (dx) => [
    [fx.breakers[MINE].x + dx, UNIT.y - BOX.h / 2, 1.2], // out of the bottom of the breaker
    [fx.breakers[MINE].x + dx, RUN + dx, -3],
    [SOCKET.x + dx, RUN + dx, -3],
    [SOCKET.x + dx, SOCKET.y + 3, -3],
    [SOCKET.x + dx, SOCKET.y, 0.5],
  ];
  fx.wires = [-1.3, 1.3].map((dx, i) => {
    const pts = wirePath(dx).flat();
    const under = new Line2(new LineGeometry(), lineMat(BRAND.ink, 2.4, { opacity: 0.45 }));
    under.geometry.setPositions(pts);
    const dashes = new Line2(new LineGeometry(), lineMat(BRAND.ink, 3.4, { opacity: 0.95, dashed: true, dashSize: 6, gapSize: 5, hdr: 2.2 }));
    dashes.geometry.setPositions(pts);
    dashes.computeLineDistances();
    under.frustumCulled = dashes.frustumCulled = false;
    group.add(under, dashes);
    return { under, dashes, returning: i === 1 };
  });
  A.run = anchor(group, (SOCKET.x + UNIT.x) / 2, RUN, -3);
  // the flex: out of the socket, down to the dryer left on the edge of the basin
  const flexPts = [[SOCKET.x, SOCKET.y, 1], [SOCKET.x - 1, SOCKET.y - 1, 6], [TOUCH.x, TOUCH.y, TOUCH.z], [36, 96, 17], [52, 90, 24], [72, 91, 26]];
  const flexCurve = new THREE.CatmullRomCurve3(flexPts.map((p) => new THREE.Vector3(...p)));
  const flex = new THREE.Mesh(new THREE.TubeGeometry(flexCurve, 60, 0.42, 10), solid(0x8a949b, { rough: 0.55 }));
  group.add(flex);
  // the dryer: a barrel and a handle, in outline
  const dryer = new THREE.Group();
  const dGeo = new THREE.CylinderGeometry(4.2, 3.6, 15, 20).rotateZ(Math.PI / 2);
  const hGeo = new THREE.BoxGeometry(3.2, 11, 3.4);
  const dShell = glass(BRAND.ink, { base: 0.02, rim: 0.28, power: 2.4 });
  const barrel = new THREE.Mesh(dGeo, dShell);
  barrel.add(edgesOf(dGeo, { color: BRAND.ink, width: 1.8, opacity: 0.55, threshold: 40 }));
  const grip = new THREE.Mesh(hGeo, dShell);
  grip.position.set(-3, -6.5, 0);
  grip.add(edgesOf(hGeo, { color: BRAND.ink, width: 1.8, opacity: 0.55 }));
  dryer.add(barrel, grip);
  dryer.position.set(82, 93, 27);
  dryer.rotation.z = -0.2;
  group.add(dryer);
  // the bare spot: a point of heat, its halo, its embers
  fx.hot = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 14), glow(BRAND.signal, 0, { additive: true }));
  fx.halo = new THREE.Mesh(new THREE.SphereGeometry(4.2, 28, 18), softGlow(1.9));
  fx.burst = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 20), softGlow(3.2));
  fx.embers = makeEmbers({ seed: 7 });
  fx.hotWire = glow(BRAND.signal, 0);
  const bare = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(SOCKET.x - 1, SOCKET.y - 1, 6), TOUCH.clone(), new THREE.Vector3(36, 96, 17)]), 24, 0.5, 10), fx.hotWire);
  group.add(bare);
  for (const m of [fx.hot, fx.halo, fx.burst]) m.position.copy(TOUCH);
  fx.embers.uniforms.uOrigin.value.copy(TOUCH);
  group.add(fx.hot, fx.halo, fx.burst, fx.embers.points);
  A.touch = anchor(group, TOUCH.x, TOUCH.y, TOUCH.z);

  /* ── you: glass limbs, a head, a fist, a heart ── */
  const you = new THREE.Group();
  you.position.set(0, 0, YOU.z);
  you.rotation.y = Math.PI; // facing the wall
  group.add(you);
  // from here on, coordinates are yours: +z is in front of you, +x is your left
  const skin = solid(0xb4ada0, { rough: 0.62, env: 0.6 });
  fx.body = glass(BRAND.ink, { base: 0.014, rim: 0.34, power: 2.3 });
  const bust = lathe([[0.1, 86], [11, 86], [12.2, 96], [11.2, 110], [14.2, 127], [17.4, 141], [16.6, 147], [7, 151.5], [4.8, 155.5], [0.1, 155.5]], 56);
  const torso = new THREE.Mesh(bust, fx.body);
  torso.scale.z = 0.62;
  const head = new THREE.Mesh(new THREE.SphereGeometry(10.4, 40, 26), skin);
  head.position.set(0, 166.5, 1);
  head.castShadow = true;
  you.add(torso, head);
  const UP = new THREE.Vector3(0, 1, 0);
  const tmp = new THREE.Vector3();
  /** A limb of glass, `len` long (yours). Returns a function that lays it between two points that far apart. */
  const limb = (r, len) => {
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.1, len - r * 1.1), 8, 20), fx.body);
    you.add(mesh);
    return (a, b) => {
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(UP, tmp.subVectors(b, a).normalize());
    };
  };
  const between = (r, a, b) => limb(r, a.distanceTo(b))(a, b);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // legs and the arm that hangs: they do not move
  const joints = { hipL: V(8, 90, 0), kneeL: V(8.6, 48, 1.5), ankleL: V(8.6, 8, 0), hipR: V(-8, 90, 0), kneeR: V(-8.6, 48, 1.5), ankleR: V(-8.6, 8, 0), shL: V(19.5, 144, 0), elL: V(21.5, 116, -1), haL: V(20.5, 92, 3), shR: V(-19.5, 144, 0) };
  between(7, joints.hipL, joints.kneeL);
  between(5.2, joints.kneeL, joints.ankleL);
  between(7, joints.hipR, joints.kneeR);
  between(5.2, joints.kneeR, joints.ankleR);
  between(4.7, joints.shL, joints.elL);
  between(4, joints.elL, joints.haL);
  for (const side of [1, -1]) {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), fx.body);
    foot.scale.set(4.8, 3.4, 11.5);
    foot.position.set(side * 8.6, 3.4, 6);
    you.add(foot);
  }
  const idle = new THREE.Mesh(new THREE.SphereGeometry(4.3, 20, 14), fx.body);
  idle.position.copy(joints.haL);
  you.add(idle);
  // the arm that reaches: shoulder fixed, hand wherever the story puts it, elbow found between the two
  const ARM = { a: 30, b: 27 };
  const upper = limb(4.7, ARM.a);
  const fore = limb(4, ARM.b);
  const fist = new THREE.Group(); // its own frame: +y from the wrist to the knuckles, the palm toward −z
  you.add(fist);
  const back_ = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), skin);
  back_.scale.set(4.3, 4.0, 2.5);
  back_.position.set(0, 1.4, 0.4);
  back_.castShadow = true;
  fist.add(back_);
  /** A short piece of finger: laid between two points of the hand's frame, a little longer or shorter as needed. */
  const phalanx = (r, len) => {
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), skin);
    mesh.castShadow = true;
    fist.add(mesh);
    return (a, b) => {
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(UP, tmp.subVectors(b, a).normalize());
      mesh.scale.y = a.distanceTo(b) / (len + r);
    };
  };
  const fingers = [-3.05, -1.02, 1.02, 3.05].map((x, i) => ({ x, len: i === 0 || i === 3 ? 0.92 : 1, first: phalanx(1.0, 2.6), second: phalanx(0.92, 2.5) }));
  const thumb = phalanx(1.12, 3.0);
  const f0 = new THREE.Vector3();
  const f1 = new THREE.Vector3();
  const f2 = new THREE.Vector3();
  const forearm = new THREE.Vector3();
  const elbow = new THREE.Vector3();
  const hand = new THREE.Vector3();
  const along = new THREE.Vector3();
  const pole = new THREE.Vector3();
  // the heart
  fx.heart = new THREE.Mesh(new THREE.SphereGeometry(4.1, 28, 20), glow(BRAND.veille, 1));
  fx.heart.scale.set(1, 1.12, 0.9);
  fx.heart.position.set(3.6, 130, 2.5);
  fx.heartHalo = new THREE.Mesh(new THREE.SphereGeometry(8.5, 28, 20), softGlow(2.6));
  fx.heartHalo.position.copy(fx.heart.position);
  you.add(fx.heart, fx.heartHalo);
  A.heart = anchor(you, 3.6, 130, 2.5);
  A.head = anchor(you, 0, 178, 0);
  A.feet = anchor(you, 0, 2, 4);
  A.chest = anchor(you, -15, 132, 6);
  // the way the current takes through you: hand → elbow → shoulder → heart → hips → both feet
  fx.pathMat = lineMat(BRAND.signal, 3.4, { opacity: 0, dashed: true, dashSize: 3.2, gapSize: 2.4, hdr: 1.9 });
  fx.pathMat.depthTest = false; // it is drawn through the glass of the body
  fx.path = [0, 1].map(() => {
    const l = new Line2(new LineGeometry(), fx.pathMat);
    l.frustumCulled = false;
    l.renderOrder = 3;
    you.add(l);
    return l;
  });
  const pathPts = [new Float32Array(3 * 9), new Float32Array(3 * 9)];
  const toYou = new THREE.Vector3();

  const hue = new THREE.Color();
  const lerp = (a, b, u) => a + (b - a) * u;
  const sm = (a, b, x) => {
    const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  };
  /**
   * grip     0 → 1: the hand is on the flex (0: it has let go and drawn back) · clench 0 → 1: it closes on it
   * shock    0 → 1: the current runs through you (the path, the heart in signal, the wet floor)
   * hot      0 → 1: the bare spot glows · pop 0 → 1: the burst of light at the instant of contact
   * flow     cm of dashes gone by in the wall · lack 0 → 1: the returning wire runs fainter
   * live     0 → 1: there is current in the wall (0: it has been cut)
   * lines    0 → 1: the fine lines of the room · body 0 → 1: you
   * mine     0 → 1: your breaker stands out · dull 0 → 1: …and is shown doing nothing (signal)
   * mood     THREE.Color of the scene's light
   */
  function update(S, time, px) {
    // the arm
    toYou.copy(REST).lerp(TOUCH, S.grip);
    hand.set(-toYou.x, toYou.y, YOU.z - toYou.z); // the room's point, in your own frame (you face the wall)
    const d = Math.min(ARM.a + ARM.b - 0.6, tmp.subVectors(hand, joints.shR).length());
    along.subVectors(hand, joints.shR).normalize();
    const reach = (ARM.a * ARM.a - ARM.b * ARM.b + d * d) / (2 * d);
    const out = Math.sqrt(Math.max(0, ARM.a * ARM.a - reach * reach));
    pole.set(-0.35, -1, -0.1).addScaledVector(along, -pole.set(-0.35, -1, -0.1).dot(along)).normalize();
    elbow.copy(joints.shR).addScaledVector(along, reach).addScaledVector(pole, out);
    hand.copy(joints.shR).addScaledVector(along, d);
    upper(joints.shR, elbow);
    fore(elbow, hand);
    fist.position.copy(hand);
    // the hand continues the forearm; its palm is turned toward the flex
    forearm.subVectors(hand, elbow).normalize();
    fist.quaternion.setFromUnitVectors(UP, forearm);
    const c = S.clench;
    for (const f of fingers) {
      // open: the finger lies straight ahead; closed: it wraps back toward the palm
      f0.set(f.x, 4.2, 0.2);
      f1.set(f.x, lerp(7.6, 5.6, c) * f.len, lerp(-0.2, -2.6, c));
      f2.set(f.x, lerp(10.6, 2.4, c) * f.len, lerp(-0.6, -3.9, c));
      f.first(f0, f1);
      f.second(f1, f2);
    }
    f0.set(4.0, 0.6, -0.4);
    f1.set(lerp(6.4, 1.6, c), lerp(3.4, 3.0, c), lerp(-1.0, -4.2, c));
    thumb(f0, f1);

    // the current through you
    const p0 = pathPts[0];
    const p1 = pathPts[1];
    const chain = (out_, leg) => {
      const pts = [hand, elbow, joints.shR, tmp.set(-6, 140, 1), fx.heart.position, V0.set(0, 100, 1), leg ? joints.hipL : joints.hipR, leg ? joints.kneeL : joints.kneeR, leg ? FOOT_L : FOOT_R];
      pts.forEach((p, i) => out_.set([p.x, p.y, p.z], i * 3));
    };
    chain(p0, 0);
    fx.path[0].geometry.setPositions(p0);
    chain(p1, 1);
    fx.path[1].geometry.setPositions(p1);
    for (const l of fx.path) {
      l.computeLineDistances();
      l.visible = S.shock > 0.01 && S.body > 0.01;
    }
    fx.pathMat.opacity = S.shock * S.body;
    fx.pathMat.dashOffset = -time * 24; // a seventh of the period per frame: it runs, it does not strobe

    // the heart: a slow beat while all is well; under the current it races and turns to signal
    const beat = Math.pow(Math.max(0, Math.sin(time * 7.2)), 6) + 0.5 * Math.pow(Math.max(0, Math.sin(time * 7.2 - 0.9)), 6);
    const race = 0.5 + 0.5 * Math.sin(time * 16);
    const pump = beat * (1 - S.shock) + race * S.shock;
    hue.copy(VEILLE).lerp(SIGNAL, S.shock);
    fx.heart.material.color.copy(hue).multiplyScalar((1.1 + 1.5 * pump + 0.9 * S.shock) * S.body);
    fx.heartHalo.material.uniforms.uColor.value.copy(hue).multiplyScalar((0.2 + 0.4 * pump + 0.18 * S.shock) * S.body);
    fx.heart.scale.set(1 + 0.07 * pump, 1.12 + 0.07 * pump, 0.9 + 0.06 * pump);

    // the bare spot
    const glowing = 0.82 + 0.18 * Math.sin(time * 7.5);
    fx.hot.material.color.copy(SIGNAL).multiplyScalar(7 * S.hot * glowing);
    fx.halo.material.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(1.2 * S.hot * glowing);
    fx.hot.visible = fx.halo.visible = fx.embers.points.visible = bare.visible = S.hot > 0.01;
    fx.hotWire.color.copy(SIGNAL).lerp(HOT, 0.3).multiplyScalar(3.2 * S.hot * glowing);
    fx.embers.uniforms.uT.value = time;
    fx.embers.uniforms.uScale.value = px;
    fx.embers.uniforms.uAmount.value = S.hot;
    fx.burst.scale.setScalar(1 + 1.6 * Math.sqrt(S.pop));
    fx.burst.material.uniforms.uColor.value.copy(HOT).multiplyScalar(5 * sm(0, 0.14, S.pop) * Math.pow(1 - S.pop, 4));
    fx.burst.visible = S.pop > 0.001 && S.pop < 0.999;

    // the wires in the wall
    for (const w of fx.wires) {
      w.dashes.material.dashOffset = (w.returning ? 1 : -1) * S.flow;
      w.dashes.material.opacity = 0.9 * S.live * S.lines * (w.returning ? 1 - 0.35 * S.lack : 1);
      w.dashes.material.dashSize = w.returning ? 6 - 4 * S.lack : 6; // what comes back, when some is missing, runs thinner
      w.dashes.material.gapSize = w.returning ? 5 + 4 * S.lack : 5;
      w.dashes.visible = w.dashes.material.opacity > 0.01;
      w.under.material.opacity = 0.45 * S.lines;
    }

    // the room, you, the unit
    fx.wallMat.opacity = 0.4 * S.lines;
    fx.body.uniforms.uAmount.value = S.body;
    you.visible = S.body > 0.01;
    fx.breakers.forEach((b, i) => {
      const mine = i === MINE ? S.mine : 0;
      hue.copy(INK).lerp(SIGNAL, mine * S.dull);
      b.edges.color.copy(hue).multiplyScalar(1 + mine * 1.6);
      b.edges.opacity = 0.7 * S.lines;
      b.lever.color.copy(hue).multiplyScalar(0.7 + mine * 1.8);
    });
    fx.wet.uniforms.uColor.value.copy(S.mood);
    fx.wet.uniforms.uAmount.value = (0.16 + 0.3 * S.shock) * S.lines;
    fx.floor.grid.uAmount.value = 0.2 * S.lines;
  }
  const V0 = new THREE.Vector3();
  const FOOT_L = V(8.6, 1.5, 6);
  const FOOT_R = V(-8.6, 1.5, 6);

  return { group, fx, A, update, device, TOUCH: TOUCH.clone().add(group.position) };
}
