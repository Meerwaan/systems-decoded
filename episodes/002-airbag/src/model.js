// Driver airbag, modelled in centimetres, Y up.
// The dashboard is the plane y = 0; the steering wheel lies on it and +Y points at the driver,
// so the exploded view opens toward the camera and the bag inflates "up".
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makePart, addMesh, solid, glow, lathe, placed, anchor, fatLine, mergeGeometries } from "@kit/build3d.js";

const DEG = Math.PI / 180;
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (r, h, seg = 64, open = false) => new THREE.CylinderGeometry(r, r, h, seg, 1, open);

export const RIM = 18.5; // steering-wheel radius
export const ECU_Z = 32; // where the control unit sits on the plane
const HOUSING_Y = 2.4;
const COVER_Y = 7.3;
const BAG_Y = 6.2; // the bag is anchored here and grows upward
export const BAG = { r: 31, h: 15 }; // inflated half-sizes

const circle = (r, y, n = 120) => Array.from({ length: n + 1 }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * r, y, Math.sin((i / n) * Math.PI * 2) * r]);

export function buildAirbag() {
  const root = new THREE.Group();
  const A = {};
  const fx = {};

  /* ── steering wheel ───────────────────────────────────────────────── */
  const wheel = makePart("wheel", { lift: 0 });
  const rim = addMesh(wheel, new THREE.TorusGeometry(RIM, 1.55, 20, 140), solid(0x15191c, { rough: 0.55 }), { pos: [0, 4.2, 0], rot: [Math.PI / 2, 0, 0], edges: false });
  for (const r of [RIM - 1.55, RIM + 1.55]) {
    const ring = fatLine(circle(r, 4.2), { width: 1.8, opacity: 0.7 });
    wheel.add(ring);
    wheel.userData.part.mats.add(ring.material);
  }
  const spokes = [0, Math.PI, Math.PI / 2].map((a) => placed(box(10.4, 1.1, 3.8), { pos: [Math.cos(a) * 12.4, 3.5, Math.sin(a) * 12.4], rotY: -a }));
  addMesh(wheel, mergeGeometries(spokes), solid(0x1d2226, { rough: 0.6 }));
  addMesh(wheel, cyl(8.2, 2.2, 72), solid(0x1a1e22, { rough: 0.6 }), { pos: [0, 1.3, 0] });
  A.wheel = anchor(wheel, RIM * 0.72, 5.6, RIM * 0.72);
  fx.rim = rim;

  /* ── housing: the can everything sits in ──────────────────────────── */
  const housing = makePart("housing", { lift: 3.6, delay: 0.3 });
  addMesh(housing, lathe([[0, 0], [7.3, 0], [7.3, 3.4], [7.0, 3.4], [7.0, 0.35], [0, 0.35]].map(([r, y]) => [r, y + HOUSING_Y])), solid(0x2b3238, { rough: 0.5, metal: 0.25, double: true }));

  /* ── gas generator: the pyrotechnic charge ────────────────────────── */
  const inflator = makePart("inflator", { lift: 8.2, delay: 0.2 });
  const INF_Y = HOUSING_Y + 0.4;
  addMesh(inflator, cyl(4.3, 2.8, 64), solid(0x596168, { rough: 0.4, metal: 0.4 }), { pos: [0, INF_Y + 1.4, 0] });
  addMesh(inflator, cyl(5.3, 0.28, 64), solid(0x4a5258, { rough: 0.4, metal: 0.4 }), { pos: [0, INF_Y + 0.14, 0], edgeOpacity: 0.6 });
  addMesh(inflator, cyl(3.1, 0.14, 48), solid(0x4a5258, { rough: 0.4, metal: 0.4 }), { pos: [0, INF_Y + 2.87, 0], edgeOpacity: 0.6 });
  const holes = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    holes.push(placed(box(0.14, 0.6, 0.6), { pos: [Math.cos(a) * 4.31, INF_Y + 1.5, Math.sin(a) * 4.31], rotY: -a }));
  }
  fx.holes = glow(BRAND.signal, 0); // the vents: dark at rest, incandescent when it fires
  addMesh(inflator, mergeGeometries(holes), fx.holes, { edges: false });
  addMesh(inflator, cyl(0.8, 1.1, 24), solid(0x1c2024, { rough: 0.5 }), { pos: [0, INF_Y - 0.5, 0], edgeOpacity: 0.6 }); // igniter
  fx.spark = new THREE.Mesh(new THREE.SphereGeometry(1.3, 20, 14), glow(0xfff1dc, 9, { additive: true }));
  fx.spark.position.set(0, INF_Y - 0.2, 0);
  fx.fireHalo = new THREE.Mesh(new THREE.SphereGeometry(7.5, 28, 18), glow(BRAND.signal, 2.6, { additive: true }));
  fx.fireHalo.position.set(0, INF_Y + 1.5, 0);
  inflator.add(fx.spark, fx.fireHalo);
  A.inflator = anchor(inflator, 4.4, INF_Y + 2.6, 2.2);
  fx.igniter = anchor(inflator, 0, INF_Y - 0.5, 0);

  /* ── the bag, folded ──────────────────────────────────────────────── */
  const pack = makePart("pack", { lift: 12.4, delay: 0.1 });
  addMesh(
    pack,
    lathe([[0, 1.5], [1.4, 1.9], [2.8, 1.45], [4.2, 1.9], [5.6, 1.4], [6.5, 1.0], [6.7, 0.3], [6.2, 0], [0, 0]].map(([r, y]) => [r, y + 5.9])),
    solid(BRAND.plastic, { rough: 0.8, double: true }),
    { threshold: 10 },
  );
  A.pack = anchor(pack, -5.2, 7.3, 2.4);

  /* ── cover: two flaps along a pre-cut seam ────────────────────────── */
  const cover = makePart("cover", { lift: 17, delay: 0 });
  const profile = [[0, 1.05], [5.6, 1.05], [7.2, 0.7], [7.9, 0.05], [7.9, 0], [7.5, 0], [6.9, 0.45], [5.4, 0.72], [0, 0.72]].map(([r, y]) => new THREE.Vector2(r, y));
  fx.flaps = [1, -1].map((side) => {
    // half a dome, hinged on its outer edge (z = ±7.9)
    const half = new THREE.LatheGeometry(profile, 48, side === 1 ? -Math.PI / 2 : Math.PI / 2, Math.PI);
    const pivot = new THREE.Group();
    pivot.position.set(0, COVER_Y, side * 7.9);
    const mesh = new THREE.Mesh(half, solid(0x1b2024, { rough: 0.6, double: true }));
    mesh.position.set(0, 0, -side * 7.9);
    mesh.castShadow = mesh.receiveShadow = true;
    pivot.add(mesh);
    cover.add(pivot);
    cover.userData.part.mats.add(mesh.material);
    const edge = fatLine(circle(7.9, 0, 48).filter(([, , z]) => z * side >= -0.01), { width: 1.9, opacity: 0.8 });
    edge.position.copy(mesh.position);
    pivot.add(edge);
    cover.userData.part.mats.add(edge.material);
    return { pivot, side };
  });
  fx.seam = fatLine([[-7.4, COVER_Y + 1.08, 0], [7.4, COVER_Y + 1.08, 0]], { width: 2.2, dashed: true, dashSize: 0.5, gapSize: 0.35, opacity: 0.9 });
  cover.add(fx.seam);
  cover.userData.part.mats.add(fx.seam.material);
  A.cover = anchor(cover, 4.8, COVER_Y + 1.1, 3.4);

  /* ── the bag, inflating: an anchored cushion ──────────────────────── */
  fx.bag = new THREE.Group();
  fx.bag.position.set(0, BAG_Y, 0);
  fx.bagMat = solid(BRAND.plastic, { rough: 0.82 });
  const cushion = new THREE.Mesh(new THREE.SphereGeometry(1, 72, 44), fx.bagMat);
  cushion.scale.set(BAG.r, BAG.h, BAG.r);
  cushion.position.y = BAG.h;
  cushion.castShadow = cushion.receiveShadow = true;
  // sewn panels: an equator and two meridians
  const seams = [];
  for (let i = 0; i < 96; i++) {
    const a0 = (i / 96) * Math.PI * 2;
    const a1 = ((i + 1) / 96) * Math.PI * 2;
    seams.push(Math.cos(a0), 0, Math.sin(a0), Math.cos(a1), 0, Math.sin(a1));
    seams.push(Math.cos(a0), Math.sin(a0), 0, Math.cos(a1), Math.sin(a1), 0);
    seams.push(0, Math.sin(a0), Math.cos(a0), 0, Math.sin(a1), Math.cos(a1));
  }
  const seamGeo = new THREE.BufferGeometry();
  seamGeo.setAttribute("position", new THREE.Float32BufferAttribute(seams.map((v) => v * 1.002), 3));
  fx.bagSeams = new THREE.LineBasicMaterial({ color: 0x2b3136, transparent: true, opacity: 0.55 });
  cushion.add(new THREE.LineSegments(seamGeo, fx.bagSeams));
  // vents on the underside: where the gas leaves
  fx.ventDirs = [new THREE.Vector3(0.74, -0.42, -0.52).normalize(), new THREE.Vector3(-0.74, -0.42, -0.52).normalize()];
  for (const dir of fx.ventDirs) {
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.1, 28), new THREE.MeshBasicMaterial({ color: 0x0a0c0e, side: THREE.DoubleSide }));
    hole.position.copy(dir).multiplyScalar(1.004);
    hole.lookAt(dir.clone().multiplyScalar(2));
    cushion.add(hole);
  }
  fx.bag.add(cushion);
  fx.cushion = cushion;
  fx.bag.visible = false;

  /* ── gas: bursts out of the generator, then leaves through the vents ─ */
  fx.gas = makeGas(260, 7);
  fx.gas.points.position.set(0, INF_Y + 1.5, 0);
  fx.vent = makeVent(110, 19);

  const parts = { wheel, housing, inflator, pack, cover };
  root.add(...Object.values(parts), fx.bag, fx.gas.points, fx.vent.points);

  /* ── control unit: the box that decides ───────────────────────────── */
  const ecu = makePart("ecu");
  ecu.position.set(0, 0, ECU_Z);
  addMesh(ecu, box(13, 3, 9), solid(0x3b4349, { rough: 0.5, metal: 0.3 }), { pos: [0, 1.5, 0] });
  const fins = [-4.5, -2.25, 0, 2.25, 4.5].map((x) => placed(box(0.35, 0.5, 7.6), { pos: [x + 2.6, 3.25, 0] }));
  addMesh(ecu, mergeGeometries(fins), solid(0x333a40, { rough: 0.5, metal: 0.3 }), { edgeOpacity: 0.5, edgeWidth: 1.5 });
  addMesh(ecu, box(4.2, 1.9, 2.2), solid(0x14181b, { rough: 0.6 }), { pos: [0, 1.4, -5.4] }); // connector
  addMesh(ecu, box(2.6, 0.45, 2.6), solid(0x0d1012, { rough: 0.5 }), { pos: [-4.4, 3.22, 1.2] }); // accelerometer
  fx.chip = glow(BRAND.veille, 0.6);
  addMesh(ecu, new THREE.SphereGeometry(0.42, 16, 12), fx.chip, { pos: [-4.4, 3.5, 1.2], edges: false });
  fx.chipHalo = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), glow(BRAND.veille, 2.4, { additive: true }));
  fx.chipHalo.position.set(-4.4, 3.5, 1.2);
  ecu.add(fx.chipHalo);
  A.ecu = anchor(ecu, 5.2, 3.2, 3.0);
  root.add(ecu);
  // its line to the igniter (hidden under the hub at the end)
  fx.wirePath = [[0, 1.4, ECU_Z - 6.5], [0, 0.3, ECU_Z - 9], [0, 0.3, 9], [0, 0.3, 0], [0, INF_Y - 0.5, 0]].map((p) => new THREE.Vector3(...p));

  /* ── crash-test head ──────────────────────────────────────────────── */
  fx.head = new THREE.Group();
  const skull = new THREE.Mesh(new THREE.SphereGeometry(9.5, 48, 32), solid(0xcfc9bb, { rough: 0.45, coat: 0.4 }));
  skull.castShadow = skull.receiveShadow = true;
  fx.head.add(skull);
  fx.headMats = [skull.material];
  for (const side of [-1, 1]) {
    // the dummy's reference target, on both temples
    const target = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CircleGeometry(3.3, 40), new THREE.MeshBasicMaterial({ color: BRAND.ink, transparent: true }));
    target.add(disc);
    fx.headMats.push(disc.material);
    for (const q of [0, 2]) {
      const quarter = new THREE.Mesh(new THREE.CircleGeometry(3.3, 20, (q * Math.PI) / 2, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x0a0c0e, transparent: true }));
      quarter.position.z = 0.01;
      target.add(quarter);
      fx.headMats.push(quarter.material);
    }
    target.position.set(side * 9.52, 0, 0);
    target.rotation.y = (side * Math.PI) / 2;
    fx.head.add(target);
  }
  fx.head.visible = false;
  A.head = anchor(fx.head, -6.5, 6.5, 0);
  root.add(fx.head);

  /* ── hands on the rim (for the comment CTA) ───────────────────────── */
  fx.hands = [-1, 1].map((side) => {
    const mat = glow(BRAND.signal, 2.2);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(2.6, 28, 18), mat);
    hand.visible = false;
    root.add(hand);
    return { hand, mat, side };
  });
  fx.reach = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 96), glow(BRAND.signal, 3, { additive: true, double: true }));
  fx.reach.rotation.x = -Math.PI / 2;
  fx.reach.position.set(0, 8.8, 0);
  fx.reach.visible = false;
  root.add(fx.reach);
  A.hand = anchor(root, -RIM, 6.8, 0);

  return { root, parts, ecu, A, fx, dims: { INF_Y, COVER_Y, BAG_Y } };
}

/** Hot gas around the generator; `uSpread` (0–1) throws it outward as the bag opens. */
function makeGas(count, seed) {
  const rand = rng(seed);
  const a = new Float32Array(count * 4); // angle, start radius, end radius, height
  const b = new Float32Array(count * 4); // size, phase, end height, speed
  for (let i = 0; i < count; i++) {
    a[i * 4] = rand() * Math.PI * 2;
    a[i * 4 + 1] = 4.4 + rand() * 1.8;
    a[i * 4 + 2] = 6 + Math.sqrt(rand()) * 22;
    a[i * 4 + 3] = (rand() - 0.5) * 2.2;
    b[i * 4] = 0.5 + rand() * 1.3;
    b[i * 4 + 1] = rand() * 6.28;
    b[i * 4 + 2] = 2 + rand() * 24;
    b[i * 4 + 3] = 0.6 + rand() * 0.8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aA", new THREE.BufferAttribute(a, 4));
  geo.setAttribute("aB", new THREE.BufferAttribute(b, 4));
  const uniforms = { uTime: { value: 0 }, uAmount: { value: 0 }, uSpread: { value: 0 }, uScale: { value: 1 }, uColor: { value: new THREE.Color(BRAND.signal).multiplyScalar(2.6) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uAmount, uSpread, uScale;
        attribute vec4 aA; attribute vec4 aB;
        varying float vA;
        void main() {
          float e = 1.0 - pow(1.0 - clamp(uSpread * aB.w * 1.25, 0.0, 1.0), 3.0);
          float r = mix(aA.y, aA.z, e) + 0.35 * sin(uTime * 23.0 + aB.y * 5.0);
          float th = aA.x + 0.5 * sin(uTime * 3.0 + aB.y) + e * 0.6;
          vec3 p = vec3(r * cos(th), mix(aA.w, aB.z, e) + 0.3 * sin(uTime * 19.0 + aB.y * 3.0), r * sin(th));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aB.x * (1.0 + e * 1.5) * uScale / max(0.5, -mv.z);
          vA = uAmount * (0.55 + 0.45 * sin(uTime * 31.0 + aB.y * 7.0)) * (1.0 - e * 0.55);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          gl_FragColor = vec4(uColor * pow(max(0.0, 1.0 - d), 1.6) * vA, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  return { points, uniforms };
}

/** Cooled gas streaming out of the two vents. World-space: set `uOrigin[i]` / `uDir[i]` every frame. */
function makeVent(count, seed) {
  const rand = rng(seed);
  const a = new Float32Array(count * 4); // which vent, phase, spread x, spread y
  for (let i = 0; i < count; i++) {
    a[i * 4] = i % 2;
    a[i * 4 + 1] = rand();
    a[i * 4 + 2] = rand() - 0.5;
    a[i * 4 + 3] = rand() - 0.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aA", new THREE.BufferAttribute(a, 4));
  const uniforms = {
    uTime: { value: 0 },
    uAmount: { value: 0 },
    uScale: { value: 1 },
    uColor: { value: new THREE.Color(BRAND.ink).multiplyScalar(1.5) },
    uOrigin: { value: [new THREE.Vector3(), new THREE.Vector3()] },
    uDir: { value: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0)] },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uAmount, uScale; uniform vec3 uOrigin[2]; uniform vec3 uDir[2];
        attribute vec4 aA; varying float vA;
        void main() {
          int k = int(aA.x + 0.5);
          vec3 o = k == 0 ? uOrigin[0] : uOrigin[1];
          vec3 d = k == 0 ? uDir[0] : uDir[1];
          float u = fract(uTime * 0.9 + aA.y);
          vec3 side = normalize(cross(d, vec3(0.0, 1.0, 0.0)));
          vec3 up = cross(side, d);
          vec3 p = o + d * (u * 26.0) + (side * aA.z + up * aA.w) * (1.0 + u * 13.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (0.7 + u * 2.6) * uScale / max(0.5, -mv.z);
          vA = uAmount * (1.0 - u) * smoothstep(0.0, 0.08, u);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          gl_FragColor = vec4(uColor * pow(max(0.0, 1.0 - d), 1.7) * vA, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  return { points, uniforms };
}
