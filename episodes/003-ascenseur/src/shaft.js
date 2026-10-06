// The shaft: twelve floors of void seen like an X-ray — fine lines for the well, the landings and
// the car — and, solid, the only things that matter: the two rails, the frame of the car with its
// safety gears, the one who rides, the ropes, and the governor at the top. True scale (1 unit = 1 cm).
// Y = 0 is the floor of the twelfth storey; the pit is 36 m below.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makePool, makeMotes } from "@kit/atmo.js";
import { solid, glow, glass, lineMat, edgesOf, anchor, lathe } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { BLOCK } from "./model.js";

export const SHAFT = { x: 6000, floor: 300, floors: 12, half: 108, top: 760 };
const DEPTH = SHAFT.floor * SHAFT.floors; // 3600 cm of void
export const CAR = { w: 160, h: 224, d: 140, roof: 249.5 };
const ROPES = 6;
const GEAR_Y = -44; // the safety gears: under the floor, one on each rail
const CUT_AT = [318, 338, 306, 330, 312, 344]; // where each rope gives

const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const INK = new THREE.Color(BRAND.ink);
const smooth = (a, b, x) => {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

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

/**
 * Embers falling off a point that is about to give: each one is born again every period, so the
 * whole thing is a pure function of time — and already alive on the very first frame.
 */
function makeEmbers({ count = 28, seed = 3 } = {}) {
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4); // phase, period (s), size (cm), heading
  for (let i = 0; i < count; i++) seeds.set([rand(), 0.9 + rand() * 0.9, 0.9 + Math.pow(rand(), 2) * 2.1, rand() * Math.PI * 2], i * 4);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uScale: { value: 1 }, uAmount: { value: 0 }, uOrigin: { value: new THREE.Vector3() }, uHot: { value: new THREE.Color(1, 0.8, 0.55).multiplyScalar(4) }, uCool: { value: new THREE.Color(BRAND.signal).multiplyScalar(2.6) } };
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
          float out_ = 3.0 + 9.0 * age;
          vec3 p = uOrigin + vec3(cos(aSeed.w) * out_, -(10.0 * age + 34.0 * age * age), sin(aSeed.w) * out_);
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

/** `governor`: the model at the top of the well · `gears`: two safety gears (no rail of their own), mounted under the car. */
export function buildShaft({ governor, gears }) {
  const group = new THREE.Group();
  group.position.set(SHAFT.x, 0, 0);
  const fx = {};
  const A = {};
  const H = SHAFT.half;

  /* ── the well: its corners, a frame and a door at every landing. The deeper, the redder. ── */
  const seg = [];
  const col = [];
  const tint = new THREE.Color();
  const depthColor = (y) => tint.copy(INK).multiplyScalar(0.9).lerp(SIGNAL, smooth(0.3, 1, -y / DEPTH)).multiplyScalar(1 + 2.2 * smooth(0.45, 1, -y / DEPTH));
  const line = (a, b) => {
    seg.push(...a, ...b);
    col.push(...depthColor(a[1]).toArray(), ...depthColor(b[1]).toArray());
  };
  for (let k = -2; k <= SHAFT.floors; k++) {
    const y = -k * SHAFT.floor;
    for (const [x, z] of [[-H, -H], [H, -H], [H, H], [-H, H]]) line([x, y, z], [x, k === -2 ? SHAFT.top : y + SHAFT.floor, z]); // the corners, floor by floor
    line([-H, y, -H], [H, y, -H]);
    line([H, y, -H], [H, y, H]);
    line([H, y, H], [-H, y, H]);
    line([-H, y, H], [-H, y, -H]);
    if (k < 0) continue;
    // the landing: its door on the front wall, and the bit of floor one waits on
    line([-46, y, H], [-46, y + 212, H]);
    line([46, y, H], [46, y + 212, H]);
    line([-46, y + 212, H], [46, y + 212, H]);
    line([0, y, H], [0, y + 212, H]);
    line([-78, y, H], [-78, y, H + 70]);
    line([78, y, H], [78, y, H + 70]);
    line([-78, y, H + 70], [78, y, H + 70]);
  }
  const wellGeo = new LineSegmentsGeometry();
  wellGeo.setPositions(seg);
  wellGeo.setColors(col);
  fx.wellMat = lineMat(0xffffff, 1.9, { opacity: 0.5, vertexColors: true, fog: true });
  const well = new LineSegments2(wellGeo, fx.wellMat);
  well.frustumCulled = false;
  group.add(well);
  // the sill of the twelfth floor: the line the car's floor is level with — until it is not
  fx.sill = glow(BRAND.ink, 1.1);
  const sill = new THREE.Mesh(new THREE.BoxGeometry(156, 1.6, 3), fx.sill);
  sill.position.set(0, -0.8, H);
  group.add(sill);
  A.sill = anchor(group, -78, 0, H);

  /* ── the two rails, top to bottom: solid ── */
  const steel = solid(0x3d4449, { rough: 0.4, metal: 0.65, coat: 0.25, coatRough: 0.4, env: 1.15 });
  const tee = new THREE.Shape(); // seen from above: the foot against the wall, the blade toward the car (−x)
  tee.moveTo(0, -6.5);
  tee.lineTo(0, 6.5);
  tee.lineTo(-2.2, 6.5);
  tee.lineTo(-2.2, 1.7);
  tee.lineTo(-11, 1.7);
  tee.lineTo(-11, -1.7);
  tee.lineTo(-2.2, -1.7);
  tee.lineTo(-2.2, -6.5);
  tee.closePath();
  const railGeo = new THREE.ExtrudeGeometry(tee, { depth: DEPTH + SHAFT.top + 60, bevelEnabled: false });
  railGeo.rotateX(-Math.PI / 2); // the profile lies flat (x, z), the length goes up
  railGeo.translate(0, -DEPTH - 60, 0);
  for (const side of [1, -1]) {
    const rail = new THREE.Mesh(railGeo, steel);
    rail.position.x = side * (H - 3);
    rail.scale.x = side;
    rail.castShadow = true;
    rail.receiveShadow = true;
    rail.add(edgesOf(railGeo, { color: BRAND.ink, width: 1.9, opacity: 0.7 }));
    group.add(rail);
  }
  // the rails, lit: once everything else has let go, they are what is left
  fx.railGlow = lineMat(BRAND.veille, 3.4, { opacity: 0 });
  fx.railGlow.depthTest = false; // a drawing device: it shows through whatever stands in front
  const glowGeo = new LineSegmentsGeometry();
  glowGeo.setPositions([H - 14.3, -DEPTH, 0, H - 14.3, SHAFT.top, 0, -(H - 14.3), -DEPTH, 0, -(H - 14.3), SHAFT.top, 0]);
  const railGlow = new LineSegments2(glowGeo, fx.railGlow);
  railGlow.frustumCulled = false;
  railGlow.renderOrder = 2;
  group.add(railGlow);

  /* ── the car: a frame of steel, a box of glass, and you ── */
  const car = new THREE.Group();
  const frame = solid(0x191e22, { rough: 0.5, metal: 0.6, coat: 0.5, coatRough: 0.35, env: 1.1 });
  const bright = solid(0x9aa3a9, { rough: 0.32, metal: 0.75, env: 1.4 });
  const piece = (w, h, d, x, y, z = 0, mat = frame, edge = 0.75) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    if (edge) m.add(edgesOf(geo, { color: BRAND.ink, width: 1.9, opacity: edge }));
    car.add(m);
    return m;
  };
  for (const side of [1, -1]) piece(9, 290, 12, side * 84.5, 105); // uprights
  piece(182, 13, 13, 0, 243); // crosshead: the ropes hang from it
  piece(182, 13, 16, 0, -30); // safety plank: the gears are bolted to its ends
  piece(CAR.w, 5, CAR.d, 0, -2.5).castShadow = false; // floor (it would keep what is under it in the dark)
  // the six rope hitches on the crosshead
  const hitchGeo = new THREE.CylinderGeometry(2.1, 2.6, 9, 14);
  const ropeX = (i) => (i - (ROPES - 1) / 2) * 11;
  for (let i = 0; i < ROPES; i++) {
    const h = new THREE.Mesh(hitchGeo, bright);
    h.position.set(ropeX(i), CAR.roof + 4.5, 0);
    car.add(h);
  }

  // the safety gears, one on each rail. Bench axes → shaft axes: the rail's length (Z) goes up, its blade (Y) points at the car.
  fx.gears = gears.map((gear, i) => {
    const side = i === 0 ? 1 : -1;
    const holder = new THREE.Group();
    holder.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -side), new THREE.Vector3(-side, 0, 0), new THREE.Vector3(0, 1, 0)));
    holder.position.set(side * (H - 3), GEAR_Y, 0);
    holder.add(gear.root);
    car.add(holder);
    return gear;
  });
  A.block = anchor(car, H - 3 - BLOCK.top, GEAR_Y, 0);
  // their linkage: a shaft across, under the floor, turned by the governor's rope through one lever
  car.updateMatrixWorld(true); // the car is not in the well yet: its world is its own frame
  const eyeAt = gears[0].A.eye.getWorldPosition(new THREE.Vector3()); // where the first gear's rod ends
  const LINK_Z = -17;
  const rod = (from, to, r = 1.1) => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const geo = new THREE.CylinderGeometry(r, r, a.distanceTo(b), 12);
    const m = new THREE.Mesh(geo, bright);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    m.castShadow = true;
    car.add(m);
    return m;
  };
  rod([-eyeAt.x, eyeAt.y, LINK_Z], [eyeAt.x, eyeAt.y, LINK_Z]);
  for (const side of [1, -1]) rod([side * eyeAt.x, eyeAt.y, LINK_Z], [side * eyeAt.x, eyeAt.y, -side * Math.abs(eyeAt.z)], 0.9);

  // the box
  const shell = glass(BRAND.ink, { base: 0.012, rim: 0.3, power: 2.6 });
  fx.shell = shell;
  const boxGeo = new THREE.BoxGeometry(CAR.w, CAR.h, CAR.d);
  const box = new THREE.Mesh(boxGeo, shell);
  box.position.y = CAR.h / 2;
  const boxEdges = edgesOf(boxGeo, { color: BRAND.ink, width: 2.4, opacity: 0.9 });
  fx.boxEdges = boxEdges.material;
  box.add(boxEdges);
  // what makes it a lift and not a showcase: its doors, a handrail, the panel of buttons, the light in the ceiling
  const inside = [];
  const il = (a, b) => inside.push(...a, ...b);
  const [hw, hd] = [CAR.w / 2, CAR.d / 2];
  for (const x of [-44, 0, 44]) il([x, -CAR.h / 2 + 2, hd], [x, CAR.h / 2 - 14, hd]); // the two door leaves
  il([-44, CAR.h / 2 - 14, hd], [44, CAR.h / 2 - 14, hd]);
  il([-hw + 12, -18, -hd + 3], [hw - 12, -18, -hd + 3]); // handrail, back wall
  il([-hw + 3, -18, -hd + 12], [-hw + 3, -18, hd - 30]); // handrail, side wall
  const panel = [56, 71, -30, 34]; // x0, x1, y0, y1 on the front wall, beside the door
  il([panel[0], panel[2], hd - 1], [panel[1], panel[2], hd - 1]);
  il([panel[1], panel[2], hd - 1], [panel[1], panel[3], hd - 1]);
  il([panel[1], panel[3], hd - 1], [panel[0], panel[3], hd - 1]);
  il([panel[0], panel[3], hd - 1], [panel[0], panel[2], hd - 1]);
  const insideGeo = new LineSegmentsGeometry();
  insideGeo.setPositions(inside);
  fx.insideMat = lineMat(BRAND.ink, 1.8, { opacity: 0.55 });
  box.add(new LineSegments2(insideGeo, fx.insideMat));
  // the buttons: two columns of six; the twelfth is lit
  fx.buttons = glow(BRAND.ink, 0.55, { double: true });
  fx.button12 = glow(BRAND.veille, 4.5, { double: true });
  const dot = new THREE.CircleGeometry(1.9, 16);
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 2; c++) {
      const lit = r === 5 && c === 1;
      const b = new THREE.Mesh(dot, lit ? fx.button12 : fx.buttons);
      b.position.set(panel[0] + 4.4 + c * 6.4, panel[2] + 7 + r * 9.6, hd - 1.4);
      b.rotation.y = Math.PI; // they face the one who rides
      box.add(b);
      if (lit) A.button = anchor(box, b.position.x, b.position.y, b.position.z);
    }
  }
  fx.lamp = glow(BRAND.ink, 0.5);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(70, 0.8, 44), fx.lamp);
  lamp.position.y = CAR.h / 2 - 2.2;
  box.add(lamp);
  car.add(box);
  fx.box = box;
  // the front edge of its floor: level with the sill of the landing — until it is not
  const floorLine = new THREE.Mesh(new THREE.BoxGeometry(156, 1.6, 3), fx.sill);
  floorLine.position.set(0, -0.8, hd + 1.5);
  car.add(floorLine);
  // light on the floor: the car is lived in
  fx.inside = makePool({ radius: 92 });
  fx.inside.mesh.position.y = 1.2;
  car.add(fx.inside.mesh);

  // you: a head, and a body of glass
  const you = new THREE.Group();
  const skin = solid(0x9a958a, { rough: 0.65, env: 0.6 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(10.5, 40, 26), skin);
  head.position.y = 165;
  head.castShadow = true;
  const bust = lathe([[0.1, 0], [8.5, 0], [10, 4], [8.6, 46], [10.4, 86], [12.2, 98], [11.2, 111], [14.2, 128], [17.2, 141], [16.4, 147], [7, 151.5], [4.8, 155], [0.1, 155]], 56);
  fx.body = glass(BRAND.ink, { base: 0.03, rim: 0.42, power: 2 });
  const body = new THREE.Mesh(bust, fx.body);
  body.scale.z = 0.62; // shoulders, not a skittle
  you.add(head, body);
  you.position.set(10, 0, 4);
  you.rotation.y = 0.5;
  car.add(you);
  A.you = anchor(car, 10, 178, 4);
  A.head = anchor(car, 10, 165, 4);
  A.roof = anchor(car, 0, CAR.roof, 0);
  A.floor = anchor(car, -hw, 0, hd);
  group.add(car);
  fx.car = car;

  /* ── the hoist ropes: six of them, from the crosshead to the machine above ── */
  fx.ropes = Array.from({ length: ROPES }, (_, i) => {
    const mat = () => lineMat(BRAND.ink, 3.2, { opacity: 0.95 });
    const lower = new Line2(new LineGeometry(), mat());
    const upper = new Line2(new LineGeometry(), mat());
    lower.frustumCulled = upper.frustumCulled = false;
    group.add(lower, upper);
    // where it will be cut: a hot point on the rope
    const hot = new THREE.Mesh(new THREE.SphereGeometry(3.4, 20, 14), glow(BRAND.signal, 0, { additive: true }));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(11, 24, 16), softGlow(1.8));
    const burst = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 20), softGlow(3.4));
    const embers = makeEmbers({ seed: 3 + i });
    group.add(hot, halo, burst, embers.points);
    return { x: ropeX(i), lower, upper, hot, halo, burst, embers, cutAt: CUT_AT[i], lowerPos: new Float32Array(9), upperPos: new Float32Array(6) };
  });
  A.ropes = anchor(group, 0, 330, 0);
  A.hitch = anchor(car, ropeX(ROPES - 1) + 6, CAR.roof + 8, 0);

  /* ── the governor, and its own rope: up one side, over the sheave, down the other, tied to the car's lever ── */
  const G = { x: 62, y: 560, z: -(H - 26) };
  governor.root.position.set(G.x, G.y, G.z);
  group.add(governor.root);
  const r = governor.groove;
  const loop = [G.x - r, -DEPTH - 40, G.z, G.x - r, G.y, G.z];
  for (let k = 1; k < 24; k++) {
    const a = Math.PI * (1 - k / 24);
    loop.push(G.x + r * Math.cos(a), G.y + r * Math.sin(a), G.z);
  }
  loop.push(G.x + r, G.y, G.z, G.x + r, -DEPTH - 40, G.z);
  const loopGeo = new LineGeometry();
  loopGeo.setPositions(loop);
  fx.govLine = lineMat(BRAND.veille, 2.8, { opacity: 0.4 });
  const govLine = new Line2(loopGeo, fx.govLine);
  govLine.frustumCulled = false;
  fx.govRope = lineMat(BRAND.veille, 2.8, { opacity: 0.95, dashed: true, dashSize: 9, gapSize: 6, hdr: 1.5 });
  const govRope = new Line2(loopGeo, fx.govRope);
  govRope.computeLineDistances();
  govRope.frustumCulled = false;
  group.add(govLine, govRope);
  // the lever: from the strand that goes down with the car to the shaft that works the gears
  rod([G.x + r, eyeAt.y, G.z], [G.x + r, eyeAt.y, LINK_Z], 0.9);
  const clamp = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 4), bright);
  clamp.position.set(G.x + r, eyeAt.y, G.z);
  car.add(clamp);
  A.lever = anchor(car, G.x + r, eyeAt.y, G.z);
  A.governor = anchor(group, G.x, G.y, G.z);

  /* ── the pit: where it would end ── */
  const pit = new THREE.Mesh(new THREE.BoxGeometry(H * 2, 10, H * 2), solid(0x0c1013, { rough: 0.85 }));
  pit.position.y = -DEPTH - 50;
  pit.receiveShadow = true;
  fx.pitGlow = makePool({ radius: 170, color: BRAND.signal });
  fx.pitGlow.mesh.position.y = -DEPTH - 44;
  group.add(pit, fx.pitGlow.mesh);
  A.pit = anchor(group, 0, -DEPTH, 0);
  A.depth = anchor(group, -H, -DEPTH * 0.3, H);

  // the height of the drop, drawn between the sill and the car's floor
  fx.dropMat = lineMat(BRAND.signal, 3, { opacity: 0, hdr: 1.6 });
  const dropGeo = new LineSegmentsGeometry();
  const dropPos = new Float32Array(18);
  dropGeo.setPositions(dropPos);
  const drop = new LineSegments2(dropGeo, fx.dropMat);
  drop.frustumCulled = false;
  drop.renderOrder = 3;
  group.add(drop);
  const DROP = { x: -hw - 8, z: H };
  A.drop = anchor(group, DROP.x, -25, DROP.z);

  /* ── dust in the well: still, until the car is not ── */
  const dust = makeMotes({ count: 420, seed: 31, min: [-H, -1500, -H], size: [H * 2, 2300, H * 2], psize: [1.2, 4.2], color: BRAND.ink, drift: [0, 100, 0] });
  dust.uniforms.uColor.value.multiplyScalar(0.36);
  group.add(dust.points);

  const hue = new THREE.Color();
  const HOT = new THREE.Color(1, 0.62, 0.38);
  /**
   * y        cm the car's floor sits under the twelfth floor (0 at rest, ~52 once stopped)
   * cut      [0–1 × 6] each rope: 0 whole, 1 gone · hot [0–1 × 6]: the point about to give · pop [0–1 × 6]: the burst of light as it gives
   * keep     0–1: the ropes still whole turn to veille (they hold) · lone: index of the one that would do alone, or -1
   * stubs    0/1: what is left of a cut rope stays on its hitch
   * box / you / shell   0–1 visibility of the glass box, of the rider, of all the fine lines
   * aura     0–1: the gears' outline lights up · grip 0–1: they bite (signal) · hold 0–1: they hold (veille)
   * bite / heat / spark   the wedges of the gears (see the model)
   * rails    0–1: the rails light up · drop 0–1: the dimension between sill and floor
   * pit      0–1 · haze 0–1 · dustT: seconds of fall (moves the dust) · rope: cm the governor's rope has run · gov 0–1: the governor and its rope are there · dashes 0–1: the dashes that show the rope running
   * mood     THREE.Color of the scene's light
   */
  function update(S, time, px) {
    car.position.y = -S.y;
    const roof = CAR.roof + 9 - S.y; // the top of the hitches
    fx.ropes.forEach((rope, i) => {
      const c = S.cut[i];
      const { x } = rope;
      if (c <= 0) {
        rope.lowerPos.set([x, roof, 0, x, (roof + SHAFT.top) / 2, 0, x, SHAFT.top, 0]);
        rope.upper.visible = false;
      } else {
        // the lower end falls back over its hitch and hangs there, the upper end is whipped away
        const e = c * c * (3 - 2 * c);
        const up = (rope.cutAt - roof) * (1 - e) + 20 * e;
        const lean = Math.sin(i * 2.1 + 0.6) > 0 ? 1 : -1;
        rope.lowerPos.set([x, roof, 0, x + lean * 3 * e, roof + up * 0.62 + 6 * e, 3 * e, x + lean * (12 * e + 3 * Math.sin(e * 6.283) * (1 - e)), roof + up * (1 - 0.72 * e), 8 * e]);
        const gone = rope.cutAt + (SHAFT.top - rope.cutAt) * Math.min(1, c * 1.4);
        rope.upperPos.set([x + 26 * Math.sin(c * 8 + i) * (1 - c), gone, 0, x, SHAFT.top, 0]);
        rope.upper.geometry.setPositions(rope.upperPos);
        rope.upper.visible = gone < SHAFT.top - 1;
      }
      rope.lower.geometry.setPositions(rope.lowerPos);
      rope.lower.visible = c < 1 || S.stubs > 0.5;
      const alone = S.lone >= 0 && S.lone !== i;
      const held = c <= 0 ? S.keep : 0;
      rope.lower.material.color.copy(INK).lerp(VEILLE, held).multiplyScalar(c > 0 ? 0.55 : 1 + 1.1 * held);
      if (c > 0 && c < 1) rope.lower.material.color.lerp(HOT, (1 - c) * 0.9); // its broken end is still hot
      rope.upper.material.color.copy(INK).lerp(HOT, c > 0 ? (1 - c) * 0.9 : 0);
      rope.lower.material.opacity = 0.95 * (alone ? 0.2 : 1) * S.ropesA;
      rope.upper.material.opacity = 0.95 * S.ropesA;
      const h = c < 0.04 ? S.hot[i] : 0;
      rope.hot.position.set(x, rope.cutAt, 0);
      rope.halo.position.copy(rope.hot.position);
      const beat = 0.82 + 0.18 * Math.sin(time * 7.5 + i * 1.7); // it breathes, it never blinks
      rope.hot.material.color.copy(SIGNAL).multiplyScalar(7 * h * beat);
      rope.halo.material.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(1.1 * h * beat);
      rope.hot.scale.setScalar(0.7 + h * 0.6);
      rope.hot.visible = rope.halo.visible = rope.embers.points.visible = h > 0.01;
      rope.embers.uniforms.uOrigin.value.copy(rope.hot.position);
      rope.embers.uniforms.uT.value = time;
      rope.embers.uniforms.uScale.value = px;
      rope.embers.uniforms.uAmount.value = h;
      const p = S.pop[i];
      rope.burst.position.copy(rope.hot.position);
      // up in two frames, then it dies away while it is still small: a flash, not a ball
      rope.burst.scale.setScalar(1 + 3.6 * Math.sqrt(p));
      rope.burst.material.uniforms.uColor.value.copy(HOT).multiplyScalar(13 * smooth(0, 0.14, p) * Math.pow(1 - p, 4));
      rope.burst.visible = p > 0.001 && p < 0.999;
    });

    // the fine lines, the glass
    fx.wellMat.opacity = 0.5 * S.shell;
    fx.shell.uniforms.uAmount.value = S.box * S.shell;
    fx.boxEdges.opacity = 0.9 * S.box;
    fx.insideMat.opacity = 0.55 * S.box;
    fx.buttons.color.copy(INK).multiplyScalar(0.55 * S.box);
    fx.button12.color.copy(VEILLE).multiplyScalar(4.5 * S.box);
    fx.lamp.color.copy(INK).multiplyScalar(0.5 * S.box);
    fx.box.visible = S.box > 0.01;
    you.visible = S.you > 0.01;
    fx.inside.uniforms.uColor.value.copy(S.mood);
    fx.inside.uniforms.uAmount.value = 0.3 * S.box + 0.06;

    // gears and rails
    for (const gear of fx.gears) gear.pose({ bite: S.bite, heat: S.heat, hold: S.hold, aura: Math.max(S.aura, S.grip, S.hold * 0.7), grip: S.grip * (1 - S.hold), spark: S.spark, px });
    fx.railGlow.color.copy(VEILLE).multiplyScalar(1 + S.rails * 1.5);
    fx.railGlow.opacity = S.rails;
    railGlow.visible = S.rails > 0.01;
    fx.sill.color.copy(INK).multiplyScalar(S.drop * 1.1);
    sill.visible = floorLine.visible = S.drop > 0.01;

    // the drop: sill → floor
    const { x, z } = DROP;
    dropPos.set([x, 0, z, x, -S.y, z, x - 9, 0, z, x + 9, 0, z, x - 9, -S.y, z, x + 9, -S.y, z]);
    dropGeo.setPositions(dropPos);
    fx.dropMat.opacity = S.drop;
    drop.visible = S.drop > 0.01 && S.y > 0.5;
    A.drop.position.set(x, -S.y / 2, z);

    fx.govRope.dashOffset = -S.rope;
    fx.govRope.opacity = 0.95 * S.gov * S.dashes;
    fx.govLine.opacity = 0.4 * S.gov;
    governor.root.visible = govLine.visible = S.gov > 0.01;
    govRope.visible = fx.govRope.opacity > 0.01;
    fx.pitGlow.uniforms.uAmount.value = S.pit;
    dust.uniforms.uAmount.value = S.haze;
    dust.update(S.dustT, px, S.streak);
  }

  return { group, car, fx, A, update, governor, G };
}
