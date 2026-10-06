// The road: what is at stake before anything fires. A car at true scale (1 unit = 1 cm), seen
// like on an X-ray — a shell of glass and fine lines, with what matters solid inside it: the wheel,
// the one who drives, the unit that waits — the lane going by under it, and the wall it has one
// second to reach. A second set, far from the bench where the module is taken apart.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makeSurface, makePool, makeMotes } from "@kit/atmo.js";
import { solid, glow, setGlow, lineMat, edgesOf, fatLine, anchor } from "@kit/build3d.js";

const DEG = Math.PI / 180;
export const ROAD = { x: 4000, nose: -223, speed: 1390 }; // where the set stands · the bumper · cm per second at 50 km/h
export const MOUNT = { x: -36, y: 98, z: -6, tilt: 65 * DEG }; // the steering wheel in the car: its centre, how far it leans back
const LANE = 190; // half-width of the lane the car is in
const WHEEL_R = 32;

/** Glass that only shows where it turns away from the eye: the shell of an X-ray. */
function shell(color = BRAND.ink, { base = 0.035, rim = 0.5, power = 2.4 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uBase: { value: base }, uRim: { value: rim }, uPower: { value: power }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uBase, uRim, uPower, uAmount; varying vec3 vN; varying vec3 vV;
      void main() {
        // clamp before pow: facing the eye exactly, the dot product can read 1.0000001, and pow() of a negative is not a number
        float f = pow(clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * (uBase + uRim * f) * uAmount, 1.0);
      }`,
  });
}

/** A side profile (z, y) pushed across the width of the car, with softened edges. */
function across(points, width, bevel, arches = []) {
  const shape = new THREE.Shape();
  shape.moveTo(...points[0]);
  for (const p of points.slice(1)) shape.lineTo(...p);
  // back along the underside, over each wheel
  for (const z of arches) {
    shape.lineTo(z + WHEEL_R + 7, 22);
    shape.absarc(z, 30, WHEEL_R + 7, 0, Math.PI, false);
    shape.lineTo(z - WHEEL_R - 7, 22);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 24 });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(-Math.PI / 2); // profile x → world z, the push → world x
  return geo;
}

/** Hazard stripes for the barrier, painted once. */
function stripes() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#15191c";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#ff5b2e";
  for (let x = -c.height; x < c.width + c.height; x += 190) {
    g.beginPath();
    g.moveTo(x, c.height);
    g.lineTo(x + 95, c.height);
    g.lineTo(x + 95 + c.height, 0);
    g.lineTo(x + c.height, 0);
    g.closePath();
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function buildRoad() {
  const group = new THREE.Group();
  group.position.set(ROAD.x, 0, 0);
  const fx = {};
  const A = {};

  /* ── ground: the technical grid going by, the lane, its markings ── */
  const surface = makeSurface({ radius: 5200, cell: 100, fade: 1700, lift: 30 });
  surface.group.position.set(0, 0, -1400);
  group.add(surface.group);
  fx.grid = surface.grid;

  const lane = new THREE.Mesh(new THREE.PlaneGeometry(LANE * 4, 9000), new THREE.MeshStandardMaterial({ color: 0x0d1215, roughness: 0.58, metalness: 0, envMapIntensity: 0.6 }));
  lane.rotation.x = -Math.PI / 2;
  lane.position.set(-LANE, 2, -2600);
  lane.receiveShadow = true;
  group.add(lane);

  const paint = new THREE.MeshBasicMaterial({ color: new THREE.Color(BRAND.ink).multiplyScalar(0.42) });
  for (const x of [LANE, -LANE * 3]) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(7, 0.4, 9000), paint);
    edge.position.set(x, 2.6, -2600);
    group.add(edge);
  }
  const DASH = { every: 1300, long: 300, count: 8 };
  fx.dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(9, 0.4, DASH.long), paint, DASH.count);
  fx.dashes.frustumCulled = false;
  group.add(fx.dashes);

  /* ── the car, as an X-ray ── */
  const car = new THREE.Group();
  const glass = shell(BRAND.ink, { base: 0.006, rim: 0.2, power: 3.2 });
  const inner = shell(BRAND.ink, { base: 0.004, rim: 0.1, power: 2.6 });
  fx.shells = [glass, inner];
  const lines = [];
  const ghost = (geometry, material, { pos, rot, width = 2, opacity = 0.8, threshold = 30 } = {}) => {
    const mesh = new THREE.Mesh(geometry, material);
    if (pos) mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    const edge = edgesOf(geometry, { color: BRAND.ink, width, opacity, threshold });
    lines.push(edge.material);
    mesh.add(edge);
    car.add(mesh);
    return mesh;
  };
  fx.lines = lines;

  // body: bumper, bonnet, belt line, boot — and the two arches; then the cabin
  ghost(across([[-215, 24], [-217, 46], [-211, 63], [-193, 77], [-92, 90], [152, 93], [205, 91], [226, 80], [224, 30], [214, 22]], 164, 6, [135, -130]), glass, { width: 2.4, opacity: 0.9, threshold: 34 });
  ghost(across([[-97, 91], [-44, 140], [92, 142], [150, 94]], 142, 5), glass, { width: 2.2, opacity: 0.85 });
  // inside: dashboard, two seats
  ghost(new THREE.BoxGeometry(150, 20, 34), inner, { pos: [0, 86, -52], width: 1.6, opacity: 0.45 });
  for (const x of [-36, 36]) {
    ghost(new THREE.BoxGeometry(46, 58, 12), inner, { pos: [x, 96, 62], rot: [-0.16, 0, 0], width: 1.6, opacity: 0.45 });
    ghost(new THREE.BoxGeometry(46, 10, 44), inner, { pos: [x, 62, 38], width: 1.6, opacity: 0.45 });
  }
  // wheels (they turn)
  fx.wheels = [];
  const tyre = new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 24, 56).rotateZ(Math.PI / 2);
  const rim = new THREE.CylinderGeometry(20, 20, 25, 40).rotateZ(Math.PI / 2); // no spokes: thin lines spinning only flicker
  for (const z of [-130, 135]) {
    for (const x of [-78, 78]) {
      const w = new THREE.Group();
      const t1 = new THREE.Mesh(tyre, inner);
      const e1 = edgesOf(tyre, { color: BRAND.ink, width: 2, opacity: 0.75, threshold: 40 });
      const e2 = edgesOf(rim, { color: BRAND.ink, width: 1.8, opacity: 0.5, threshold: 40 });
      lines.push(e1.material, e2.material);
      w.add(t1, e1, e2);
      w.position.set(x, WHEEL_R, z);
      car.add(w);
      fx.wheels.push(w);
    }
  }

  // where the module sits: the film mounts the real one here (same model as on the bench)
  const mount = new THREE.Group();
  mount.position.set(MOUNT.x, MOUNT.y, MOUNT.z);
  mount.rotation.x = MOUNT.tilt;
  car.add(mount);
  A.wheel = anchor(car, MOUNT.x, MOUNT.y, MOUNT.z);
  // the instruments behind the wheel: a disc of light the wheel stands out against
  fx.cluster = makePool({ radius: 58 });
  fx.cluster.mesh.rotation.x = MOUNT.tilt - Math.PI / 2;
  fx.cluster.mesh.position.set(MOUNT.x, MOUNT.y - 4, MOUNT.z - 12);
  car.add(fx.cluster.mesh);

  // the one who drives: a head (solid — it is the one the bag is for), shoulders
  const you = new THREE.Group();
  fx.youMat = solid(0x8d897f, { rough: 0.7, env: 0.5 });
  fx.head = new THREE.Mesh(new THREE.SphereGeometry(11, 40, 26), fx.youMat);
  fx.head.position.set(-36, 119, 44);
  fx.head.castShadow = true;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(15, 22, 8, 20), inner);
  torso.position.set(-36, 88, 50);
  const torsoEdge = edgesOf(torso.geometry, { color: BRAND.ink, width: 1.6, opacity: 0.5, threshold: 50 });
  lines.push(torsoEdge.material);
  torso.add(torsoEdge);
  you.add(fx.head, torso);
  car.add(you);
  fx.you = you;
  A.driver = anchor(car, -36, 133, 44);

  // the phone: a cold rectangle in the driver's hand
  fx.phone = glow(0xd6e8ff, 0);
  fx.phone.side = THREE.DoubleSide;
  const phone = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 16), fx.phone);
  phone.position.set(-22, 96, 22);
  phone.rotation.set(-55 * DEG, 0.35, 0);
  fx.phoneHalo = new THREE.Mesh(new THREE.SphereGeometry(13, 24, 16), glow(0xbcd7ff, 0.7, { additive: true }));
  fx.phoneMesh = phone;
  fx.phoneHalo.position.copy(phone.position);
  car.add(phone, fx.phoneHalo);

  // the unit that waits, under the console, and its line to the wheel
  fx.chip = glow(BRAND.veille, 2.4);
  const unit = new THREE.Mesh(new THREE.BoxGeometry(15, 5, 20), fx.chip);
  unit.position.set(0, 27, 26);
  fx.wire = fatLine([[0, 27, 16], [0, 27, -30], [MOUNT.x, 60, -30], [MOUNT.x, MOUNT.y - 14, MOUNT.z - 12]], { color: BRAND.veille, width: 2, dashed: true, dashSize: 4, gapSize: 3, opacity: 0.7 });
  car.add(unit, fx.wire);
  A.unit = anchor(car, 0, 30, 26);

  // lights
  fx.lamps = []; // from the driver's seat nobody sees their own lamps: they go out with the shell
  fx.lamp = glow(0xfff4e0, 1.5);
  for (const x of [-57, 57]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(42, 8, 3), fx.lamp);
    lamp.position.set(x, 64, ROAD.nose - 0.5);
    car.add(lamp);
    fx.lamps.push(lamp);
  }
  fx.tail = glow(BRAND.signal, 2.4);
  for (const [x, w, y, h] of [[-58, 40, 80, 8], [58, 40, 80, 8], [0, 150, 88, 2.4]]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(w, h, 3), fx.tail);
    lamp.position.set(x, y, 233.5);
    car.add(lamp);
    fx.lamps.push(lamp);
  }
  // what the headlamps throw on the road: two pools that widen
  fx.beam = new THREE.Mesh(
    new THREE.PlaneGeometry(460, 1300),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color(0xfff1dc) }, uAmount: { value: 0.085 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying vec2 vUv;
        void main() {
          float along = vUv.y;                                // 0 at the bumper → 1 far ahead
          float spread = mix(0.1, 0.27, along);
          float lamps = smoothstep(spread, 0.0, abs(abs(vUv.x - 0.5) - mix(0.125, 0.19, along)));
          float fall = smoothstep(0.0, 0.035, along) * pow(clamp(1.0 - along, 0.0, 1.0), 2.3);
          gl_FragColor = vec4(uColor * lamps * fall * uAmount, 1.0);
        }`,
    }),
  );
  fx.beam.rotation.x = -Math.PI / 2;
  fx.beam.position.set(0, 3.2, ROAD.nose - 650);
  car.add(fx.beam);
  // a little light under the car: it sits on the road, it does not float
  fx.under = makePool({ radius: 330 });
  fx.under.mesh.position.set(0, 3.6, 10);
  fx.under.mesh.scale.set(0.62, 1, 1);
  car.add(fx.under.mesh);
  A.bumper = anchor(car, 0, 46, ROAD.nose);
  group.add(car);

  /* ── the wall: the one solid thing on this road ── */
  const wall = new THREE.Group();
  const WALL = { w: 430, h: 250, d: 100 };
  const concrete = solid(0xb7b2a5, { rough: 0.86, env: 0.5 });
  const block = new THREE.Mesh(new THREE.BoxGeometry(WALL.w, WALL.h, WALL.d), concrete);
  block.position.set(0, WALL.h / 2, -WALL.d / 2);
  block.castShadow = true;
  block.receiveShadow = true;
  const blockEdge = edgesOf(block.geometry, { color: 0x1d2226, width: 2, opacity: 0.9 });
  block.add(blockEdge);
  fx.hazard = new THREE.MeshStandardMaterial({ map: stripes(), roughness: 0.75, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0.5, envMapIntensity: 0.3 });
  fx.hazard.emissiveMap = fx.hazard.map;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(WALL.w - 36, WALL.h - 36), fx.hazard);
  face.position.set(0, WALL.h / 2, 0.8);
  face.receiveShadow = true;
  // the shock, read on the wall
  fx.ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 96), glow(BRAND.signal, 3.2, { additive: true, double: true }));
  fx.ring.position.set(0, 50, 2);
  fx.ring.visible = false;
  fx.contact = new THREE.Mesh(new THREE.PlaneGeometry(190, 64), glow(BRAND.signal, 4, { additive: true, double: true }));
  fx.contact.position.set(0, 46, 1.2);
  fx.contact.visible = false;
  wall.add(block, face, fx.ring, fx.contact);
  group.add(wall);
  A.wall = anchor(wall, 0, WALL.h * 0.62, 2);

  /* ── the distance left, drawn on the road like on a plan ── */
  const TICKS = 14;
  const RX = LANE - 60; // between the car and the edge of the lane
  const ruleGeo = new LineSegmentsGeometry();
  const rulePos = new Float32Array((TICKS + 3) * 6);
  ruleGeo.setPositions(rulePos);
  fx.ruleMat = lineMat(BRAND.signal, 3, { opacity: 0 });
  const rule = new LineSegments2(ruleGeo, fx.ruleMat);
  rule.frustumCulled = false;
  rule.renderOrder = 3;
  group.add(rule);
  A.rule = anchor(group, RX, 2, ROAD.nose);

  /* ── air: what the headlamps catch, going by ── */
  const dust = makeMotes({ count: 760, seed: 11, min: [-650, 6, -2600], size: [1300, 330, 3100], psize: [1.4, 5], color: BRAND.ink, drift: [0, 0, ROAD.speed] });
  dust.uniforms.uColor.value.multiplyScalar(0.5);
  group.add(dust.points);

  const m4 = new THREE.Matrix4();
  const hue = new THREE.Color();
  const VEILLE = new THREE.Color(BRAND.veille);
  const SIGNAL = new THREE.Color(BRAND.signal);
  /**
   * dist    cm between the bumper and the wall (below 0: the bumper is being crushed)
   * travel  cm of road covered since the start · step: cm covered during one frame
   * phone / brake / hazard / rule / ring / haze / grid / you / alarm / shell   0–1
   * nod     0–1: the driver looks down · mood: THREE.Color of the scene's light
   */
  function update(S, time, px) {
    const zWall = ROAD.nose - S.dist;
    wall.position.z = zWall;
    // the stripes answer the headlamps as the wall comes into their reach
    const lit = THREE.MathUtils.smoothstep(1500 - S.dist, 0, 1300);
    fx.hazard.emissiveIntensity = 0.42 + lit * 0.4 + S.hazard * 0.9;

    for (const w of fx.wheels) w.rotation.x = -S.travel / WHEEL_R;
    fx.grid.uOffset.value.set(0, S.travel);
    fx.grid.uSmear.value.set(0, S.step * 1.4);
    fx.grid.uAmount.value = S.grid;
    for (let i = 0; i < DASH.count; i++) {
      const z = ((((i * DASH.every + S.travel) % (DASH.every * DASH.count)) + DASH.every * DASH.count) % (DASH.every * DASH.count)) - DASH.every * (DASH.count - 1.5);
      m4.makeTranslation(-LANE, 2.6, z);
      fx.dashes.setMatrixAt(i, m4);
    }
    fx.dashes.instanceMatrix.needsUpdate = true;

    setGlow(fx.phone, S.phone * 5);
    fx.phoneMesh.visible = S.phone > 0.01;
    fx.phoneHalo.material.opacity = S.phone * 0.4 * (0.9 + 0.1 * Math.sin(time * 9));
    fx.phoneHalo.visible = S.phone > 0.01;
    fx.head.position.set(-36, 119 - S.nod * 5, 44 - S.nod * 6);
    fx.you.visible = S.you > 0.01;
    fx.youMat.opacity = S.you;
    fx.youMat.transparent = S.you < 0.999;
    setGlow(fx.tail, 2 + S.brake * 5);

    // the unit: on watch (veille), then alarmed (signal)
    hue.copy(VEILLE).lerp(SIGNAL, S.alarm);
    setGlow(fx.chip, 2.4 + 0.35 * Math.sin(time * 9) + S.alarm * 5, hue);
    fx.wire.material.color.copy(hue);
    for (const m of fx.shells) m.uniforms.uAmount.value = S.shell;
    for (const lamp of fx.lamps) lamp.visible = S.shell > 0.3;
    fx.beam.material.uniforms.uAmount.value = 0.085 * (0.4 + 0.6 * S.shell);
    for (const m of fx.lines) m.opacity = m.userData.base * (0.15 + 0.85 * S.shell);
    fx.cluster.uniforms.uColor.value.copy(S.mood);
    fx.cluster.uniforms.uAmount.value = S.cluster;
    fx.under.uniforms.uColor.value.copy(S.mood);
    fx.under.uniforms.uAmount.value = 0.2;

    // ruler: a line from the bumper to the wall, a tick at each end, one per metre from the wall
    const z0 = ROAD.nose;
    const len = Math.max(0, S.dist);
    let o = 0;
    const seg = (x1, z1, x2, z2) => {
      rulePos.set([x1, 5, z1, x2, 5, z2], o);
      o += 6;
    };
    seg(RX, z0, RX, z0 - len);
    seg(RX - 22, z0, RX + 22, z0);
    seg(RX - 22, z0 - len, RX + 22, z0 - len);
    for (let k = 1; k <= TICKS; k++) {
      const z = z0 - len + k * 100;
      if (z < z0 - 4) seg(RX - 9, z, RX + 9, z);
      else seg(RX, z0, RX, z0);
    }
    ruleGeo.setPositions(rulePos);
    fx.ruleMat.opacity = S.rule;
    rule.visible = S.rule > 0.01;
    A.rule.position.set(RX, 5, z0 - len / 2);

    fx.ring.scale.setScalar(20 + S.ring * 200);
    fx.ring.material.opacity = Math.sin(Math.PI * Math.min(1, S.ring)) * 0.9;
    fx.ring.visible = fx.ring.material.opacity > 0.01;
    fx.contact.material.opacity = Math.max(0, 1 - S.ring * 1.6) * (S.ring > 0 ? 1 : 0);
    fx.contact.visible = fx.contact.material.opacity > 0.01;

    dust.uniforms.uAmount.value = S.haze;
    dust.update(S.travel / ROAD.speed, px, (S.step / ROAD.speed) * 1.2);
  }

  return { group, car, wall, mount, fx, A, update };
}
