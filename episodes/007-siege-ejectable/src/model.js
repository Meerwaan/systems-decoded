// DOSSIER 007 — the ejection seat of a Rafale (Martin-Baker F16F), and whoever sits in it.
// Centimetres. The origin is the foot of the rails; the seat leans back with them, as in the
// aircraft (SEAT.tilt). Everything is built in the SEAT'S OWN FRAME: +y up the rails, +z out of
// the backrest toward the knees, +x the occupant's left.
//   · two rails, bolted to the cockpit's rear wall — they stay in the aircraft
//   · the gun: two telescopic tubes, which are also the two beams of the seat. Their inner stages
//     stay on the floor; the outer barrels leave with the seat
//   · the pan, the survival pack lying in it, and across its underside the rocket motor
//   · ONE handle, between the thighs: a loop pulled upward. Its order leaves as gas, in small pipes
//   · on the side of the back, the "brain": a capsule that feels the air, a cartridge, a clockwork
//   · on top, the headbox: the drogue, shot out of its tube, and under it the main parachute
// Groups, from the outside in: root → tilt → carriage (the gun pushes it) → fly (the film's own:
// once out, the seat is flown by moving this) → the seat's body, and what stays with the occupant
// when the seat lets go (`rider`: the harness, the pack, the main parachute).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glow, lineMat, makePart, addMesh, anchor, setPartOpacity, box, cyl, lathe, placed, mergeGeometries } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const X = V(1, 0, 0);
const Y = V(0, 1, 0);
const Z = V(0, 0, 1);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const HOT = new THREE.Color(1, 0.86, 0.62);
const WEB = 0xcfcbc0; // webbing: the straps are read against the dark seat and through the glass body
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles
const settle = (u) => easeInOut(u) + Math.sin(Math.PI * u) ** 2 * 0.055 * (u > 0.5 ? 1 : 0.25);

/**
 * In its own frame the seat is 58 wide (x −33.5 … +24.5: the brain is on the right), 141 up the
 * rails, 61 deep. Leaning as in the aircraft, in the room: 127 high, from z = −68 (the top of the
 * rails) to z = +44 (the front of the pan); someone in it reaches z ≈ +92 with their toes.
 */
export const SEAT = {
  tilt: 30, // degrees the rails lean back
  rail: 132, // their length
  stroke: 150, // how far the gun pushes the seat along them: at 1, its last shoe has left the rails
  hip: [0, 34, 31], // the occupant's hips, in the seat's frame
  size: { x: [-33.5, 24.5], y: [0, 127], z: [-68, 44] }, // in the room, leaning, no one in it
};
const TILT = SEAT.tilt * DEG;
const UPW = V(0, Math.cos(TILT), Math.sin(TILT)); // the aircraft's "up", seen from the seat's frame
const GUN = { x: 19, z: 10, len: 90 };
const PAN = { y: 30, z: 14, slope: 12 * DEG }; // the pan drops toward its front edge: the thighs lie on it
const PAN_UP = V(0, Math.cos(PAN.slope), Math.sin(PAN.slope));
const HANDLE = { z: 43, top: 11.5, half: 4.8, bar: 1.3, pull: 7 }; // low between the thighs: a hand resting on a knee is nowhere near it
const NOZZLES = [-15, -5, 5, 15];
const BRAIN = { x0: 23.6, x1: 29, x2: 33, y: 66, h: 28, z: 10, d: 15 };
const DROGUE = { x: -10, y: 139.5, z: 6 };
// The brain, the pipes and the drogue's tube are on the occupant's RIGHT (−x): the side the studio's
// key light falls on, and the side of the hand that pulls. A film shows the seat from there (az < 0).
const LIFT = 38; // exploded, the seat also climbs its rails a little: the gun shows its stages
const FLOW = { period: 5, speed: 18 }; // cm, cm/s: a dash moves a seventh of its period per frame at most, or it hops
const SEATED = V(0, -56, 31); // where a standing figure's feet go for its hips to be on the pan

/** A point given in the pan's own frame (x, above its top, from its rear edge) → the seat's frame. */
const pf = (x, py, pz) => V(x, PAN.y + py * Math.cos(PAN.slope) - pz * Math.sin(PAN.slope), PAN.z + py * Math.sin(PAN.slope) + pz * Math.cos(PAN.slope));
const panFrame = () => {
  const frame = new THREE.Group();
  frame.position.set(0, PAN.y, PAN.z);
  frame.rotation.x = PAN.slope;
  return frame;
};
const into = (frame, mesh) => (frame.add(mesh), mesh);

/* ─────────────────────────────────────────────────────────── light that has a place */

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

/** A jet out of a nozzle: a hot core that cools along its length, no edge. */
const flameMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uHot: { value: HOT.clone().multiplyScalar(1.25) }, uCool: { value: SIGNAL.clone().multiplyScalar(1.3) }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vT;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vT = uv.y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot, uCool; uniform float uAmount; varying vec3 vN; varying vec3 vV; varying float vT;
      void main() {
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float core = f * f * f;
        float along = clamp(1.0 - vT, 0.0, 1.0);
        gl_FragColor = vec4(mix(uCool, uHot, core * along) * core * along * (0.3 + 0.7 * along) * uAmount, 1.0);
      }`,
  });

/**
 * Embers blown out of the nozzles: each one is born again every period, so the whole thing is a
 * pure function of time — and already alive on the very first frame. `mouths`: [x, y, z] each.
 */
function makeEmbers(mouths, { count = 64, seed = 7 } = {}) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // phase, period (s), size (cm), heading
  for (let i = 0; i < count; i++) {
    pos.set(mouths[i % mouths.length], i * 3);
    seeds.set([rand(), 1.1 + rand() * 1.1, 1.0 + Math.pow(rand(), 2) * 2.4, rand() * Math.PI * 2], i * 4); // slow: the film is in slow motion, and a point that hops flickers
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uScale: { value: 3850 }, uAmount: { value: 0 }, uHot: { value: HOT.clone().multiplyScalar(4) }, uCool: { value: SIGNAL.clone().multiplyScalar(2.6) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale; attribute vec4 aSeed; varying float vAge;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          vAge = age;
          float wide = 1.5 + 15.0 * age;
          vec3 p = position + vec3(cos(aSeed.w) * wide, -(32.0 * age + 22.0 * age * age), sin(aSeed.w) * wide);
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

/* ─────────────────────────────────────────────────────────── gas in a pipe */

/** A polyline with its corners rounded: the way a pipe is bent. */
function bent(points, r = 2.4, steps = 5) {
  const out = [];
  points.forEach((p, i) => {
    const a = points[i - 1];
    const b = points[i + 1];
    if (!a || !b) return out.push(p.clone());
    const u = a.clone().sub(p);
    const v = b.clone().sub(p);
    const k = Math.min(r, u.length() / 2.2, v.length() / 2.2);
    const from = p.clone().addScaledVector(u.normalize(), k);
    const to = p.clone().addScaledVector(v.normalize(), k);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      out.push(from.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(p, 2 * t * (1 - t)).addScaledVector(to, t * t));
    }
  });
  return new THREE.CatmullRomCurve3(out, false, "centripetal");
}

/**
 * The flow: a sleeve of light around a dark pipe, cut into dashes that run. `uFront`: how far the
 * gas has got (cm from the handle); `uStart`: where this pipe begins, on the same ruler.
 */
const flowMaterial = (shared, start, length) =>
  new THREE.ShaderMaterial({
    fog: false,
    uniforms: { ...shared, uStart: { value: start }, uLen: { value: length } },
    vertexShader: /* glsl */ `
      uniform float uStart, uLen; varying float vS;
      void main() { vS = uStart + uv.x * uLen; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uFront, uOffset; varying float vS;
      void main() {
        if (uAmount < 0.003 || vS > uFront) discard;
        if (fract((vS - uOffset) / ${FLOW.period.toFixed(1)}) > 0.6) discard;
        // the head of the flow is its brightest stretch
        gl_FragColor = vec4(uColor * uAmount * (1.0 + smoothstep(uFront - 12.0, uFront, vS)), 1.0);
      }`,
  });

/* ─────────────────────────────────────────────────────────── cloth, straps, lines */

/** A flat strap laid through a few points; `out`: roughly what its face looks at. */
function ribbon(material, width, n = 26) {
  const pos = new Float32Array((n + 1) * 6);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const index = [];
  for (let i = 0; i < n; i++) index.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  geo.setIndex(index);
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  const curve = new THREE.CatmullRomCurve3([V(), V(0, 1, 0)], false, "centripetal");
  const p = V();
  const t = V();
  const w = V();
  mesh.lay = (points, out) => {
    curve.points = points;
    for (let i = 0; i <= n; i++) {
      curve.getPoint(i / n, p);
      curve.getTangent(i / n, t);
      w.crossVectors(t, out);
      if (w.lengthSq() < 1e-6) w.set(1, 0, 0);
      w.normalize().multiplyScalar(width / 2);
      pos.set([p.x - w.x, p.y - w.y, p.z - w.z, p.x + w.x, p.y + w.y, p.z + w.z], i * 6);
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  };
  return mesh;
}

/** `count` loose segments whose ends are rewritten in place (no new buffer at every frame). */
function segments(count, material) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(new Float32Array(count * 6));
  const line = new LineSegments2(geo, material);
  line.frustumCulled = false;
  line.renderOrder = 3;
  const data = geo.attributes.instanceStart.data; // interleaved: start xyz, end xyz
  return { line, array: data.array, flush: () => (data.needsUpdate = true) };
}

/**
 * A parachute, hanging from its origin along +y. Gores, not half a ball: each panel swells
 * between two seams, the hem is scalloped between two lines, and it opens crown first.
 * `set(d)`: 0 packed → the lines pay out, the canopy a long sock → 1 full.
 * `split`: the lines gather on two points `split` apart (two risers) instead of one;
 * `bridle`: a single line from the origin up to where they gather.
 */
function makeChute({ gores = 16, radius = 250, sag = 0.7, lines = 420, bridle = 0, split = 0 } = {}) {
  const U = 4;
  const M = 14;
  const PHI = 100 * DEG; // a little past the half ball: the skirt turns in
  const group = new THREE.Group();
  const perGore = (U + 1) * (M + 1);
  const pos = new Float32Array(gores * perGore * 3);
  const col = new Float32Array(gores * perGore * 3);
  const index = [];
  const c = new THREE.Color();
  for (let g = 0; g < gores; g++) {
    c.copy(VEILLE).multiplyScalar(g % 2 ? 0.4 : 0.64); // one gore in two a tone down: the dome is read as panels
    for (let k = 0; k < perGore; k++) c.toArray(col, (g * perGore + k) * 3);
    for (let i = 0; i < M; i++) {
      for (let j = 0; j < U; j++) {
        const a = g * perGore + i * (U + 1) + j;
        index.push(a, a + U + 1, a + 1, a + 1, a + U + 1, a + U + 2);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setIndex(index);
  const cloth = solid(0xffffff, { rough: 0.85, double: true, env: 0.3 });
  cloth.vertexColors = true;
  cloth.emissive = VEILLE.clone(); // cloth lets the light through: its shadow side is never black
  cloth.emissiveIntensity = 0.1;
  const canopy = new THREE.Mesh(geo, cloth);
  canopy.frustumCulled = false;
  const seamMat = lineMat(BRAND.pcb, 1.8, { opacity: 0.7 });
  const cordMat = lineMat(BRAND.ink, 1.8, { opacity: 0.5 });
  const seams = segments(gores * M, seamMat);
  const cords = segments(gores + 1, cordMat);
  group.add(canopy, seams.line, cords.line);

  const rHem = radius * Math.sin(PHI);
  const yHem = Math.sqrt(Math.max(1, lines * lines - rHem * rHem));
  const sock = radius * PHI * 0.8; // the canopy's length while it is still a sock
  let last = -1;
  function set(d) {
    group.visible = d > 0.002;
    if (d === last || !group.visible) return;
    last = d;
    const out = smooth(0, 0.42, d);
    const open = smooth(0.34, 1, d);
    const base = bridle * out;
    for (let g = 0; g < gores; g++) {
      for (let i = 0; i <= M; i++) {
        const s = 0.07 + 0.93 * (i / M); // 0.07: the vent at the crown
        const phi = s * PHI;
        const w = smooth(0, 1, open * 1.7 - 0.7 * s); // the crown fills before the skirt
        const r0 = mix(radius * (0.02 + 0.05 * Math.sin(Math.PI * s)), radius * Math.sin(phi), w) * (0.35 + 0.65 * out);
        const y0 = mix(lines + sock * (1 - s), yHem + radius * sag * (Math.cos(phi) - Math.cos(PHI)), w);
        const belly = 0.09 * w * Math.sqrt(Math.max(0, Math.sin(Math.PI * Math.min(1, s * 1.08))));
        const arch = 0.05 * radius * w * smooth(0.7, 1, s);
        for (let j = 0; j <= U; j++) {
          const u = j / U;
          const across = Math.sin(Math.PI * u);
          const th = ((g + u) / gores) * Math.PI * 2;
          const r = r0 * (1 + belly * across);
          const o = (g * perGore + i * (U + 1) + j) * 3;
          pos[o] = r * Math.cos(th);
          pos[o + 1] = base + (y0 + arch * across) * out;
          pos[o + 2] = r * Math.sin(th);
        }
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    for (let g = 0; g < gores; g++) {
      const first = g * perGore * 3;
      for (let i = 0; i < M; i++) {
        const a = first + i * (U + 1) * 3;
        const b = a + (U + 1) * 3;
        seams.array.set([pos[a], pos[a + 1], pos[a + 2], pos[b], pos[b + 1], pos[b + 2]], (g * M + i) * 6);
      }
      const h = first + M * (U + 1) * 3; // where this seam meets the hem
      cords.array.set([split ? Math.sign(pos[h] || 1) * split * 0.5 : 0, base, 0, pos[h], pos[h + 1], pos[h + 2]], g * 6);
    }
    cords.array.set([0, 0, 0, 0, base, 0], gores * 6);
    seams.flush();
    cords.flush();
  }
  set(0);
  return { group, set, mats: [cloth, seamMat, cordMat], height: bridle + yHem + radius * sag * (1 - Math.cos(PHI)) };
}

/* ─────────────────────────────────────────────────────────── the seat */

/**
 * `stand`: the trestle that holds the rails on the bench (in the aircraft, the cockpit's rear wall does).
 * Returns { root, parts, A, fx, pose, sit, fly, trail, hang, setPixelScale }.
 */
export function buildSeat({ stand = false } = {}) {
  const root = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.rotation.x = -TILT;
  const carriage = new THREE.Group();
  const fly = new THREE.Group();
  const turn = new THREE.Group(); // `upright`: the seat straightens around the occupant's hips
  const unturn = new THREE.Group();
  const body = new THREE.Group();
  const rider = new THREE.Group();
  turn.position.set(...SEAT.hip);
  unturn.position.set(...SEAT.hip).negate();
  root.add(tilt);
  tilt.add(carriage);
  carriage.add(fly);
  fly.add(turn);
  turn.add(unturn);
  unturn.add(body, rider);

  const fx = {};
  const A = {};
  const parts = {};
  // `burst`: where the part goes in the exploded view (cm, the seat's frame)
  const part = (name, parent, burst = [0, 0, 0], delay = 0, span = 0.7) => {
    const p = makePart(name, { delay, span });
    p.userData.part.burst = V(...burst);
    parts[name] = p;
    parent.add(p);
    return p;
  };
  // one set of materials per part: a part can fade without taking its neighbours along.
  // Three values of grey: the structure dark, the pads between, what is machined — the gun — clear.
  const metals = () => ({
    cast: solid(0x2f383f, { rough: 0.56, metal: 0.25, coat: 0.45, coatRough: 0.4 }),
    shell: solid(0x414c54, { rough: 0.5, metal: 0.2, coat: 0.5, coatRough: 0.35 }),
    pad: solid(0x5a666e, { rough: 0.9 }),
    steel: solid(0x6f7a83, { rough: 0.42, metal: 0.4, env: 1.1 }),
    bright: solid(0xb9c0c4, { rough: 0.34, metal: 0.45, env: 1.3 }),
    hero: solid(0xd2d6d8, { rough: 0.4, metal: 0.25, env: 1.2 }),
    web: solid(WEB, { rough: 0.8, env: 0.5, double: true }),
  });
  const own = (p, ...mats) => mats.forEach((m) => p.userData.part.mats.add(m));

  /* ── the rails: they stay in the aircraft ── */
  const rails = part("rails", tilt);
  const m0 = metals();
  for (const x of [-GUN.x, GUN.x]) addMesh(rails, box(5, SEAT.rail, 4.5, 0.5), m0.steel, { pos: [x, SEAT.rail / 2, 2.25], edgeOpacity: 0.55 });
  for (const y of [5, 66, SEAT.rail - 5]) addMesh(rails, box(34, 4, 2.6, 0.5), m0.cast, { pos: [0, y, 1.6], edgeOpacity: 0.45 });

  /* ── the gun's inner stages: bolted to the floor, they stay too ── */
  const piston = part("piston", tilt);
  const m1 = metals();
  fx.stages = [];
  for (const x of [-GUN.x, GUN.x]) {
    addMesh(piston, box(9.5, 4, 9.5, 0.7), m1.cast, { pos: [x, 2, GUN.z], edgeOpacity: 0.5 });
    addMesh(piston, cyl(2.9, GUN.len, 0.25, 40), m1.bright, { pos: [x, 4 + GUN.len / 2, GUN.z], edgeOpacity: 0.45 });
    fx.stages.push(addMesh(piston, cyl(3.6, GUN.len, 0.25, 40), m1.hero, { pos: [x, 4 + GUN.len / 2, GUN.z], edgeOpacity: 0.45 }));
  }
  addMesh(piston, box(30, 3, 5, 0.6), m1.cast, { pos: [0, 1.5, GUN.z], edgeOpacity: 0.45 });

  /* ── the gun's outer barrels: the two beams the whole seat is hung on ── */
  const gun = part("gun", body);
  const m2 = metals();
  const barrel = lathe([[0, 6], [5, 6], [5, 10], [4.4, 10], [4.4, 50], [4.9, 50], [4.9, 53.5], [4.4, 53.5], [4.4, 90], [5.3, 90], [5.3, 100], [0, 100]], 48, { bevel: 0.25, round: 2 });
  for (const x of [-GUN.x, GUN.x]) {
    addMesh(gun, barrel, m2.hero, { pos: [x, 0, GUN.z], edgeOpacity: 0.5 });
    // the shoes that ride the rails
    for (const y of [14, 56, 94]) addMesh(gun, box(6.5, 7, 3, 0.5), m2.steel, { pos: [x, y, 5.4], edgeOpacity: 0.5 });
  }
  for (const y of [26, 95]) addMesh(gun, box(30, 5, 4, 0.7), m2.cast, { pos: [0, y, 9], edgeOpacity: 0.45 });
  A.gun = anchor(gun, -GUN.x - 4.6, 74, GUN.z + 2);

  /* ── the back, and the reel that hauls the shoulders against it ── */
  const back = part("back", body, [0, 0, 22], 0.05);
  const m3 = metals();
  addMesh(back, box(29, 68, 6, 1.4), m3.cast, { pos: [0, 64, 14], edgeOpacity: 0.55 });
  addMesh(back, box(25, 58, 4.5, 1.8), m3.pad, { pos: [0, 63, 18.3], edgeOpacity: 0.45 });
  addMesh(back, cyl(3.3, 16, 0.4, 32).rotateZ(Math.PI / 2), m3.steel, { pos: [0, 99, 14.5], edgeOpacity: 0.5 });
  A.spine = anchor(back, 0, 58, 21); // until someone sits here

  /* ── the pan ── */
  const pan = part("pan", body, [0, -10, 40]);
  const m4 = metals();
  const panF = panFrame();
  pan.add(panF);
  into(panF, addMesh(pan, box(44, 11, 46, 2.2), m4.cast, { pos: [0, -10.5, 23], edgeOpacity: 0.55 }));
  for (const x of [-20.5, 20.5]) into(panF, addMesh(pan, box(3, 7, 44, 1.2), m4.shell, { pos: [x, -2, 23], edgeOpacity: 0.5 }));
  into(panF, addMesh(pan, box(15, 6.5, 6, 1.2), m4.shell, { pos: [0, -3.2, 44.6], edgeOpacity: 0.5 })); // where the handle lives
  A.pan = anchor(panF, -22, -9, 30);

  /* ── the survival pack: it lies in the pan, and leaves with the occupant ── */
  const pack = part("pack", rider, [0, 4, 48], 0.12); // straight above the pan, as the room sees it
  const m5 = metals();
  const packF = panFrame();
  pack.add(packF);
  // clearer than the pan it lies in: lifted out, it must not read as a second pan
  into(packF, addMesh(pack, box(37, 5.5, 40, 2.4), solid(0x808c93, { rough: 0.9 }), { pos: [0, -2.25, 22], edgeOpacity: 0.5 }));
  into(packF, addMesh(pack, box(5, 0.5, 40.6, 0.2), m5.web, { pos: [0, 0.5, 22], edges: false }));

  /* ── the rocket motor: across the underside of the pan, its nozzles down ── */
  const rocket = part("rocket", body, [0, -32.5, 27], 0.15); // straight under it
  const m6 = metals();
  const rocketF = panFrame();
  rocket.add(rocketF);
  const motor = lathe([[0, -21], [5.7, -21], [5.7, -17.5], [5, -17.5], [5, 17.5], [5.7, 17.5], [5.7, 21], [0, 21]], 48, { bevel: 0.3, round: 2 }).rotateZ(Math.PI / 2);
  into(rocketF, addMesh(rocket, motor, m6.steel, { pos: [0, -22, 26], edgeOpacity: 0.5 }));
  for (const x of [-10, 10]) into(rocketF, addMesh(rocket, box(3, 4, 12.5, 0.6), m6.cast, { pos: [x, -17.4, 26], edgeOpacity: 0.45 }));
  fx.throat = glow(BRAND.signal, 0);
  const MOUTH = -32;
  for (const x of NOZZLES) {
    into(rocketF, addMesh(rocket, cyl(3.1, 5.5, 0.25, 32, 1.7), m6.bright, { pos: [x, -29.2, 26], edgeOpacity: 0.5 }));
    const throat = new THREE.Mesh(new THREE.CircleGeometry(2.7, 28).rotateX(Math.PI / 2), fx.throat);
    throat.position.set(x, MOUTH + 0.1, 26);
    rocketF.add(throat);
  }
  own(rocket, fx.throat);
  A.rocket = anchor(rocketF, -21.5, -22, 26);
  // its fire: a jet under each nozzle, a ball of light where they meet, embers, and a lamp that lights what is around
  fx.flame = flameMaterial();
  const jet = new THREE.LatheGeometry([[2.5, 0], [3.9, -7], [3.4, -20], [1.8, -38], [0.05, -54]].map(([r, y]) => new THREE.Vector2(r, y)), 28);
  fx.jets = NOZZLES.map((x) => {
    const mesh = new THREE.Mesh(jet, fx.flame);
    mesh.position.set(x, MOUTH, 26);
    rocketF.add(mesh);
    return mesh;
  });
  fx.blast = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), softGlow(2.4));
  fx.blast.position.set(0, MOUTH - 4, 26);
  fx.blast.scale.set(24, 8, 9);
  fx.embers = makeEmbers(NOZZLES.map((x) => [x, MOUTH - 2, 26]));
  fx.fire = new THREE.PointLight(BRAND.signal, 0, 320, 1.5);
  fx.fire.position.set(0, MOUTH - 16, 26);
  rocketF.add(fx.blast, fx.embers.points, fx.fire);

  /* ── the handle: one loop, between the thighs. The first thing the eye must find ── */
  const handle = part("handle", body, [0, 9, 51], 0.2);
  const handleF = panFrame();
  handle.add(handleF);
  const k = HANDLE.half;
  const top = HANDLE.top;
  const loop = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([[-k, -9], [-k, 0], [-k, top - 7], [-k, top - 3], [-k + 0.9, top - 0.9], [-k + 2.4, top], [0, top], [k - 2.4, top], [k - 0.9, top - 0.9], [k, top - 3], [k, top - 7], [k, 0], [k, -9]].map(([x, y]) => V(x, y, HANDLE.z))),
    72,
    HANDLE.bar,
    16,
  );
  fx.loop = solid(BRAND.signal, { rough: 0.42, coat: 0.6 });
  fx.loop.emissive = SIGNAL.clone(); // it stays the colour of the threat in any light
  fx.loop.emissiveIntensity = 0.35;
  into(handleF, addMesh(handle, loop, fx.loop, { edges: false }));
  A.handle = anchor(handleF, 0, HANDLE.top, HANDLE.z);

  /* ── the headbox: the drogue in its tube, the main parachute under the lid ── */
  const headbox = part("headbox", body, [0, 26, 4], 0.1);
  const m7 = metals();
  addMesh(headbox, box(40, 26, 18, 2.4), m7.shell, { pos: [0, 115, 9], edgeOpacity: 0.55 });
  addMesh(headbox, box(22, 18, 4.5, 1.8), m7.pad, { pos: [0, 113, 19.6], edgeOpacity: 0.45 }); // the headrest
  addMesh(headbox, box(22, 2, 13, 0.7), m7.cast, { pos: [7, 128.6, 9.5], edgeOpacity: 0.45 }); // the lid the parachute leaves by
  addMesh(headbox, cyl(4.3, 12, 0.4, 36), m7.steel, { pos: [DROGUE.x, 133, DROGUE.z], edgeOpacity: 0.5 });
  fx.plug = addMesh(headbox, cyl(3.6, 2.2, 0.5, 32), m7.bright, { pos: [DROGUE.x, 139.6, DROGUE.z], edgeOpacity: 0.5 });
  A.headbox = anchor(headbox, -20, 120, 14);

  /* ── the brain: no computer. A capsule that feels the air, a cartridge, a clockwork ── */
  const brain = part("brain", body, [-20, 6, 16], 0.25);
  brain.scale.x = -1; // drawn on the left, worn on the right
  const m8 = metals();
  const B = BRAIN;
  // a value clearer than the structure it is bolted to: it has to be found
  const housing = solid(0x98a2a9, { rough: 0.5, metal: 0.3, coat: 0.4, coatRough: 0.4 });
  addMesh(brain, box(B.x1 - B.x0, B.h, B.d, 0.6), housing, { pos: [(B.x0 + B.x1) / 2, B.y, B.z], edgeOpacity: 0.55 });
  for (const s of [-1, 1]) {
    addMesh(brain, box(B.x2 - B.x1, 0.9, B.d, 0.2), housing, { pos: [(B.x1 + B.x2) / 2, B.y + s * (B.h / 2 - 0.45), B.z], edgeOpacity: 0.5 });
    addMesh(brain, box(B.x2 - B.x1, B.h, 0.9, 0.2), housing, { pos: [(B.x1 + B.x2) / 2, B.y, B.z + s * (B.d / 2 - 0.45)], edgeOpacity: 0.5 });
  }
  addMesh(brain, new THREE.PlaneGeometry(B.d - 1.8, B.h - 1.8).rotateY(Math.PI / 2), solid(0x0d1215, { rough: 0.9 }), { pos: [B.x1 + 0.06, B.y, B.z], edges: false });
  // the clockwork: a dial, and a hand that turns
  const DIAL = { y: B.y + 7.2, z: B.z, r: 4.7 };
  addMesh(brain, cyl(DIAL.r, 1.4, 0.25, 48).rotateZ(-Math.PI / 2), solid(BRAND.plastic, { rough: 0.6 }), { pos: [B.x1 + 0.8, DIAL.y, DIAL.z], edgeOpacity: 0.7 });
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return placed(new THREE.BoxGeometry(0.14, i % 3 ? 0.9 : 1.6, 0.34), { pos: [0, 3.7 * Math.cos(a), 3.7 * Math.sin(a)], rotX: a });
  });
  addMesh(brain, mergeGeometries(ticks), solid(0x0d1215, { rough: 0.8 }), { pos: [B.x1 + 1.55, DIAL.y, DIAL.z], edges: false });
  fx.hand = new THREE.Group();
  fx.hand.position.set(B.x1 + 1.75, DIAL.y, DIAL.z);
  fx.needle = glow(BRAND.signal, 1.5);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.3, 0.55), fx.needle);
  needle.position.y = 1.5;
  fx.hand.add(needle);
  into(fx.hand, addMesh(brain, cyl(0.75, 0.5, 0.12, 20).rotateZ(-Math.PI / 2), m8.cast, { edges: false }));
  brain.add(fx.hand);
  own(brain, fx.needle);
  // the capsule: a sealed drum whose rippled face swells as the air thins
  const bellows = lathe([[0, 0], [3.6, 0], [3.6, 2.1], [3.1, 2.7], [2.6, 2.1], [2.1, 2.7], [1.6, 2.1], [1.1, 2.7], [0.6, 2.1], [0, 2.5]], 56, { crease: 30 }).rotateZ(-Math.PI / 2);
  addMesh(brain, bellows, m8.bright, { pos: [B.x1 + 0.1, B.y - 6.8, B.z - 3.4], threshold: 20, edgeOpacity: 0.55 });
  // the cartridge: powder, and the band that says so
  addMesh(brain, cyl(1.55, 7, 0.3, 28), m8.hero, { pos: [B.x1 + 1.7, B.y - 6.8, B.z + 3.6], edgeOpacity: 0.6 });
  addMesh(brain, cyl(1.75, 1, 0.15, 28), m8.steel, { pos: [B.x1 + 1.7, B.y - 10.6, B.z + 3.6], edges: false });
  fx.band = solid(BRAND.signal, { rough: 0.5 });
  addMesh(brain, cyl(1.62, 1.3, 0.1, 28), fx.band, { pos: [B.x1 + 1.7, B.y - 5.4, B.z + 3.6], edges: false });
  // its cover, hinged along the bottom: it falls open outward
  fx.cover = new THREE.Group();
  fx.cover.position.set(B.x2, B.y - B.h / 2, B.z);
  into(fx.cover, addMesh(brain, box(0.8, B.h, B.d, 0.3), housing, { pos: [0.4, B.h / 2, 0], edgeOpacity: 0.55 }));
  into(fx.cover, addMesh(brain, box(0.5, 2.4, 5, 0.2), m8.steel, { pos: [0.95, B.h - 2.4, 0], edges: false }));
  brain.add(fx.cover);
  A.brain = anchor(brain, B.x2 + 0.6, B.y, B.z);
  // what is inside, for the film to name: the clockwork, the capsule, the cartridge (whose metal it may light up)
  A.dial = anchor(brain, B.x2, DIAL.y, DIAL.z);
  A.capsule = anchor(brain, B.x2, B.y - 6.8, B.z - 3.4);
  A.cartridge = anchor(brain, B.x2, B.y - 6.8, B.z + 3.6);
  fx.cartridge = m8.hero;

  /* ── the pipes: the order leaves the handle as gas — to the rocket, through the brain, to the gun and the headbox ── */
  const pipes = part("pipes", body, [-18, 0, 6], 0.3);
  pipes.scale.x = -1; // like the brain
  const m9 = metals();
  const pipeMat = solid(0x0d1215, { rough: 0.32, metal: 0.3, coat: 0.7, coatRough: 0.25 });
  fx.gas = { uColor: { value: VEILLE.clone() }, uAmount: { value: 0 }, uFront: { value: 0 }, uOffset: { value: 0 } };
  const trunk = [pf(7.5, -3.4, 44.4), pf(23.5, -3.4, 44.4), pf(23.5, -6, 3), V(24.9, 36, 15.4), V(24.9, 49, 14.4), V(27, B.y - B.h / 2 + 0.4, 12)];
  const tee = V(26, 88, 13.5);
  const routes = [
    { start: 0, through: trunk },
    { start: 34, through: [pf(23.5, -5, 26), pf(23.5, -22, 26), pf(21.4, -22, 26)] },
    { start: 96, through: [V(27, B.y + B.h / 2 - 0.4, 12), tee, V(22.6, 96.5, 12), V(GUN.x, 101, GUN.z), V(-GUN.x, 101, GUN.z)] },
    { start: 105, through: [tee, V(25.6, 100, 15.6), V(21, 106, 15.6), V(21, 124, 10), V(16.5, 129.6, DROGUE.z), V(-DROGUE.x + 4.4, 129.6, DROGUE.z)] },
  ];
  let reach = 0;
  for (const route of routes) {
    const curve = bent(route.through);
    const length = curve.getLength();
    const steps = Math.ceil(length / 1.2);
    addMesh(pipes, new THREE.TubeGeometry(curve, steps, 0.75, 10), pipeMat, { edges: false });
    const sleeve = new THREE.Mesh(new THREE.TubeGeometry(curve, steps, 0.92, 10), flowMaterial(fx.gas, route.start, length));
    pipes.add(sleeve);
    for (const end of [route.through[0], route.through.at(-1)]) addMesh(pipes, new THREE.SphereGeometry(1.25, 16, 12), m9.bright, { pos: end.toArray(), edges: false });
    reach = Math.max(reach, route.start + length);
  }
  fx.gasReach = reach;
  A.gas = anchor(pipes, 24.9, 42, 15.4);
  A.gasOut = anchor(pipes, 26.4, B.y + B.h / 2 + 6, 12.6); // where the pipe leaves the brain, on its way to the gun and the headbox

  /* ── the leg restraints: two lines that haul the shins against the seat ── */
  const legs = part("legs", body, [0, -10, 40]);
  const m10 = metals();
  fx.garters = [-1, 1].map((side) => {
    const line = ribbon(m10.web, 2.2, 12);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(5.9, 0.6, 8, 32), m10.web);
    legs.add(line, ring);
    return { side, line, ring, pts: [V(), V(), V()] };
  });
  own(legs, m10.web);

  /* ── the harness: it is the parachute's own, and leaves with the occupant ── */
  const harness = part("harness", rider, [0, 8, 46], 0.15);
  const m11 = metals();
  fx.straps = {
    shoulder: [-1, 1].map((side) => ({ side, mesh: ribbon(m11.web, 4.4), pts: Array.from({ length: 6 }, () => V()) })),
    lap: [-1, 1].map((side) => ({ side, mesh: ribbon(m11.web, 4.4), pts: Array.from({ length: 4 }, () => V()) })),
    crotch: { mesh: ribbon(m11.web, 3.6, 14), pts: Array.from({ length: 3 }, () => V()) },
  };
  for (const strap of [...fx.straps.shoulder, ...fx.straps.lap, fx.straps.crotch]) harness.add(strap.mesh);
  fx.buckle = addMesh(harness, cyl(3.3, 1.5, 0.4, 32).rotateX(Math.PI / 2), m11.steel, { edgeOpacity: 0.6 });
  own(harness, m11.web);

  /* ── the drogue: a small parachute shot out of the headbox, that straightens the seat ── */
  const drogue = part("drogue", body);
  fx.drogue = makeChute({ gores: 10, radius: 45, sag: 0.85, lines: 150, bridle: 70 });
  fx.drogue.group.position.set(DROGUE.x, DROGUE.y, DROGUE.z);
  drogue.add(fx.drogue.group);
  own(drogue, ...fx.drogue.mats);

  /* ── the main parachute, on its two risers: what saves ── */
  const chute = part("chute", rider);
  const RISER = { y: 152, z: 32, split: 34 };
  fx.chute = makeChute({ gores: 16, radius: 250, sag: 0.7, lines: 420, split: RISER.split });
  fx.chute.group.position.set(0, RISER.y, RISER.z);
  fx.riserMat = lineMat(WEB, 3.4, { opacity: 0.9 });
  fx.risers = segments(2, fx.riserMat);
  chute.add(fx.chute.group, fx.risers.line);
  own(chute, ...fx.chute.mats, fx.riserMat);

  /* ── on the bench: a trestle, where the aircraft has a wall ── */
  if (stand) {
    const trestle = part("stand", root);
    const m12 = { cast: solid(0x1a2024, { rough: 0.9 }) }; // matt: a prop must not catch the light the seat is posed in
    const top = V(0, 104 * Math.cos(TILT), -104 * Math.sin(TILT));
    const foot = V(0, 0, -116);
    const length = top.distanceTo(foot);
    for (const x of [-GUN.x, GUN.x]) {
      const strut = addMesh(trestle, cyl(1.8, length, 0.3, 24), m12.cast, { pos: [x, (top.y + foot.y) / 2, (top.z + foot.z) / 2], edgeOpacity: 0.35 });
      strut.quaternion.setFromUnitVectors(Y, top.clone().sub(foot).normalize());
      addMesh(trestle, cyl(5.5, 1.4, 0.4, 32), m12.cast, { pos: [x, 0.7, foot.z], edgeOpacity: 0.35 });
    }
    addMesh(trestle, cyl(1.3, 2 * GUN.x, 0.2, 20).rotateZ(Math.PI / 2), m12.cast, { pos: [0, top.y * 0.45, mix(foot.z, top.z, 0.45)], edgeOpacity: 0.35 });
    addMesh(trestle, box(50, 2.4, 16, 0.8), m12.cast, { pos: [0, 1.2, 3], edgeOpacity: 0.35 });
  }

  const partList = Object.values(parts);
  let occupant = null;
  /** Seat someone (see `seatOccupant`), or no one: from then on `pose` moves them with the seat. */
  function sit(who) {
    if (occupant) rider.remove(occupant.group);
    occupant = who ?? null;
    if (occupant) {
      rider.add(occupant.group);
      A.spine = occupant.A.spine;
    }
    return api;
  }

  const trail = V(0, 1, 0); // where the drogue streams, in the seat's frame: the film points it downwind
  const hang = V(0, 1, 0); // the axis of the main parachute
  const tmp = V();
  const bar = V();
  const shin = V();
  const OUT = { chest: V(0, 0.5, 0.86), lap: V(0, 0.75, 0.66), side: V(1, 0, 0) };
  // a point of a strap: on the occupant's trunk (given as on an upright, unposed one), or where it lies on the empty seat
  const lie = (target, seated, onRider, onSeat) => {
    target.copy(onSeat);
    if (occupant && seated > 0) target.lerp(occupant.torsoPoint(onRider[0], onRider[1], onRider[2], tmp), seated);
    return target;
  };
  const REEL = [-1, 1].map((side) => V(side * 6, 99.6, 17.6));
  const LAP = [-1, 1].map((side) => pf(side * 19, 2.6, 6));
  const LAP_FLAT = [-1, 1].map((side) => pf(side * 13, 1.1, 8));
  const CROTCH = [pf(0, 1.0, 9), pf(0, 0.9, 27)];
  const SNUB = [-1, 1].map((side) => pf(side * 15, -14, 44.5));
  const BAR = pf(0, HANDLE.top, HANDLE.z);

  /**
   * Everything from 0 to 1.
   *   explode  the exploded view            handle   the handle, pulled
   *   gas      how far the gas has got in the pipes (its dashes run with `time`)
   *   harness  the reel hauls: back against the seat, shins drawn in
   *   gun      the tubes extend: the seat climbs its rails (1: clear of them)
   *   burn     the rocket                   drogue   the small parachute, out and open
   *   release  the seat lets go of the occupant and falls away
   *   canopy   the main parachute: out as a sock, then full
   *   brain    its cover open               timer    the hand of its clockwork
   *   float    the occupant comes off the pan         grip   their right hand goes to the handle and closes
   *   spine    one vertebra turns to signal           bones  the spine shows (1 by default)
   *   upright  once out: the seat straightens from its lean
   *   seated   1: the straps are worn; 0: they lie on the empty seat (by default: is someone visible in it?)
   */
  function pose(state = {}, time = 0) {
    const { explode: ex = 0, handle: pull = 0, gas = 0, harness: haul = 0, gun: shot = 0, burn = 0, drogue: small = 0, release = 0, canopy = 0, brain: open = 0, timer = 0, upright = 0 } = state;
    const seated = state.seated ?? (occupant?.group.visible ? 1 : 0);

    for (const p of partList) {
      const q = p.userData.part;
      p.position.copy(q.burst).multiplyScalar(settle(clamp01((ex - q.delay) / q.span)));
    }
    handle.position.addScaledVector(PAN_UP, HANDLE.pull * smooth(0, 1, pull));

    // the gun: the barrels leave with the seat, the middle stage follows half way, the inner one stays
    carriage.position.y = SEAT.stroke * shot + LIFT * settle(clamp01(ex / 0.8));
    const out = carriage.position.y + gun.position.y - piston.position.y;
    for (const stage of fx.stages) stage.position.y = 4 + GUN.len / 2 + out / 2;
    turn.rotation.x = TILT * upright;

    // the seat lets go: it falls, tipping back
    const fall = release * release;
    body.position.set(0, -150 * fall, -36 * fall);
    body.rotation.x = -0.45 * fall;

    // the rocket: the light lives under the nozzles
    const fire = clamp01(burn) * rocket.userData.part.opacity;
    const lit = fire > 0.004;
    fx.jets.forEach((jet, i) => {
      jet.visible = lit;
      jet.scale.set(0.75 + 0.45 * fire, 1.2 * fire * (0.93 + 0.07 * Math.sin(time * 2.1 + i * 1.7)), 0.75 + 0.45 * fire); // a slow breath, never a flicker
    });
    fx.flame.uniforms.uAmount.value = 0.8 * fire;
    fx.blast.visible = lit;
    fx.blast.material.uniforms.uColor.value.copy(SIGNAL).lerp(HOT, 0.2).multiplyScalar(0.7 * fire);
    fx.embers.points.visible = lit;
    fx.embers.uniforms.uT.value = time;
    fx.embers.uniforms.uAmount.value = fire;
    fx.throat.color.copy(SIGNAL).lerp(HOT, 0.5 * fire).multiplyScalar(2.6 * fire);
    fx.fire.intensity = 900 * fire * (0.95 + 0.05 * Math.sin(time * 1.9));

    // the gas
    fx.gas.uFront.value = gas * fx.gasReach;
    fx.gas.uOffset.value = time * FLOW.speed;
    fx.gas.uAmount.value = gas > 0.001 ? 2.2 * pipes.userData.part.opacity : 0;

    // the brain
    fx.cover.rotation.z = -1.85 * smooth(0, 1, open);
    fx.hand.rotation.x = -timer * 300 * DEG;

    // the parachutes
    fx.plug.visible = small < 0.02;
    fx.drogue.set(small);
    fx.drogue.group.quaternion.setFromUnitVectors(Y, tmp.copy(trail).normalize());
    fx.chute.set(canopy);
    fx.chute.group.quaternion.setFromUnitVectors(Y, tmp.copy(hang).normalize());

    // the occupant
    bar.copy(BAR).add(handle.position);
    occupant?.pose(state, bar);

    // the harness: from the reel, over each shoulder, down to the buckle; two lap belts; one strap between the legs
    const slack = 2.6 * (1 - haul);
    const gone = smooth(0, 0.3, release); // off the seat: the ends that held to it follow the body
    for (const { side: s, mesh, pts } of fx.straps.shoulder) {
      pts[0].copy(REEL[s < 0 ? 0 : 1]);
      if (occupant && gone > 0) pts[0].lerp(occupant.torsoPoint(s * 8.5, 90, 23, tmp), gone);
      lie(pts[1], seated, [s * 8.5, 95.2, 27.5], tmp.set(s * 6, 97.5, 20.9));
      lie(pts[2], seated, [s * 8.5, 94.2, 36.5], tmp.set(s * 6, 90, 21));
      lie(pts[3], seated, [s * 7.5, 84.5, 41.8 + slack], tmp.set(s * 6, 76, 21));
      lie(pts[4], seated, [s * 5, 66.5, 40 + slack], tmp.set(s * 4.5, 58, 21));
      lie(pts[5], seated, [s * 2.2, 48.5, 39.4], tmp.set(s * 2.2, 40, 21.4));
      mesh.lay(pts, OUT.chest);
    }
    for (const { side: s, mesh, pts } of fx.straps.lap) {
      pts[0].copy(LAP[s < 0 ? 0 : 1]);
      if (occupant && gone > 0) pts[0].lerp(occupant.torsoPoint(s * 14, 38, 29, tmp), gone);
      lie(pts[1], seated, [s * 13.5, 42.5, 36.8], LAP_FLAT[s < 0 ? 0 : 1]);
      lie(pts[2], seated, [s * 6, 47, 39.2], tmp.set(s * 6, 37, 21.6));
      lie(pts[3], seated, [0, 48.5, 39.6], tmp.set(0, 40, 21.6));
      mesh.lay(pts, OUT.lap);
    }
    {
      const { mesh, pts } = fx.straps.crotch;
      lie(pts[0], seated, [0, 46.5, 39.6], tmp.set(0, 38, 21.6));
      lie(pts[1], seated, [0, 37, 41.5], CROTCH[0]);
      pts[2].copy(CROTCH[1]);
      if (occupant && gone > 0) pts[2].lerp(occupant.torsoPoint(0, 33, 38, tmp), gone);
      mesh.lay(pts, OUT.chest);
      lie(fx.buckle.position, seated, [0, 48.5, 40.4], tmp.set(0, 40, 22.4));
    }

    // the leg restraints: from the front of the pan to a garter on each shin
    for (const { side: s, line, ring, pts } of fx.garters) {
      const snub = SNUB[s < 0 ? 0 : 1];
      const worn = occupant && seated > 0.5 && release < 0.02;
      ring.visible = !!worn;
      pts[0].copy(snub);
      if (worn) {
        occupant.shin(s, shin, tmp);
        ring.position.copy(shin).sub(legs.position);
        ring.quaternion.setFromUnitVectors(Z, tmp);
        pts[2].copy(ring.position).addScaledVector(tmp.set(0, 0.6, -0.8), 5.9);
        pts[1].copy(pts[0]).lerp(pts[2], 0.5);
        pts[1].y -= 3 * (1 - haul);
      } else {
        pts[1].copy(snub).add(tmp.set(0, -5, 3));
        pts[2].copy(snub).add(tmp.set(0, -11, 2));
      }
      line.lay(pts, OUT.side);
    }

    // the risers: from the shoulders to where the lines gather
    const flown = canopy > 0.002;
    fx.risers.line.visible = flown;
    if (flown) {
      [-1, 1].forEach((s, i) => {
        lie(shin, 1, [s * 8.5, 95.4, 32], tmp.set(s * 8.5, 99, 22));
        tmp.set(s * RISER.split * 0.5, 0, 0).applyQuaternion(fx.chute.group.quaternion).add(fx.chute.group.position);
        fx.risers.array.set([shin.x, shin.y, shin.z, tmp.x, tmp.y, tmp.z], i * 6);
      });
      fx.risers.flush();
    }
  }

  const api = {
    root, parts, A, fx, pose, sit, fly, trail, hang,
    /** The embers are points: they need the stage's `pixelScale()` whenever the lens changes. */
    setPixelScale: (px) => (fx.embers.uniforms.uScale.value = px),
  };
  pose({});
  return api;
}

/* ─────────────────────────────────────────────────────────── whoever sits in it */

/**
 * A figure of glass, sitting in the seat (its group is in the seat's frame: `seat.sit(occupant)`).
 * Hands on the thighs, just behind the knees; through the glass, a spine. Posed by the seat's own
 * `pose` — float, grip, harness, spine, bones, release — or alone: `pose(state, bar)`, `bar` being
 * the top of the handle in the seat's frame. `fig` is the kit's figure (ghost, head, skin…).
 */
export function seatOccupant({ glassK = 1, order = 10, through = 0.15, spec, helmet: helm = true } = {}) {
  const fig = makeFigure({ shell: true, hands: "real", order, glassK, through, spec });
  const group = new THREE.Group();
  group.add(fig.group);
  const A = {};

  /* ── the spine: what the gun's eighteen g go through ── */
  const HURT = 6; // where the back gives: the hinge between the chest and the loins
  const COUNT = 21;
  const spine = makePart("spine");
  const BONE = new THREE.Color(BRAND.plastic);
  const bone = solid(BRAND.plastic, { rough: 0.55, env: 0.6 });
  const hurt = solid(BRAND.plastic, { rough: 0.55, env: 0.6 });
  hurt.emissive = SIGNAL.clone();
  hurt.emissiveIntensity = 0;
  const pitchOf = (len) => (len / (COUNT - 1)) * 0.72;
  const vertebrae = Array.from({ length: COUNT }, (_, i) => {
    const u = i / (COUNT - 1);
    const r = mix(2.7, 1.5, Math.pow(u, 0.8));
    const h = pitchOf(63);
    // the hollow of the loins, the round of the chest, the neck coming forward
    const z = -3.2 - 3.2 * Math.sin(Math.PI * clamp01((u - 0.2) / 0.65)) + 2 * smooth(0.8, 1, u);
    const geo = mergeGeometries([cyl(r, h, 0.35, 20), placed(cyl(0.62, r * 1.5, 0.2, 10), { pos: [0, -h * 0.2, -r * 1.25], rotX: 115 * DEG })]);
    const mesh = addMesh(spine, geo, i === HURT ? hurt : bone, { pos: [0, 5 + 63 * u, z], edges: false });
    mesh.castShadow = false;
    return mesh;
  });
  spine.userData.part.meshes.length = 0; // glass casts no shadow: neither does what is inside it
  fig.torso.add(spine);
  A.spine = anchor(spine, 0, vertebrae[HURT].position.y, vertebrae[HURT].position.z - 3);
  A.head = anchor(fig.head, 0, 0, 0);

  /* ── a helmet and its visor: at a glance, someone in a fighter. Solid: hide it (`helmet.visible`) where the head turns to glass ── */
  const helmet = new THREE.Group();
  if (helm) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(11.9, 44, 26, 0, Math.PI * 2, 0, Math.PI * 0.6), solid(BRAND.plastic, { rough: 0.45, coat: 0.6, double: true }));
    cap.rotation.x = -0.5; // tipped back: its opening is the face
    const visor = new THREE.Mesh(new THREE.SphereGeometry(11.3, 36, 12, Math.PI / 2 - 0.95, 1.9, Math.PI * 0.4, Math.PI * 0.22), solid(0x0d1215, { rough: 0.15, coat: 1, coatRough: 0.1, double: true }));
    helmet.add(cap, visor);
    fig.head.add(helmet);
  }

  const at = V();
  const rest = V();
  const t = V();
  const n = V();
  const palm = V();
  const dir = V();
  const toBar = V();
  const axis = V();
  const REST_BAR = pf(0, HANDLE.top, HANDLE.z);
  const HOOK = { palm: V(0, -0.8, -0.6), dir: V(0, -0.6, 0.8) }; // over the top of the loop, fingers down its far side
  const torsoPoint = (x, y, z, target = V()) => target.set(x - SEATED.x, y - SEATED.y - fig.HIP, z - SEATED.z).applyMatrix4(fig.torso.matrix).add(fig.group.position);
  /** A third of the way up a shin (the seat's frame), and into `axis` the shin's direction. */
  const shin = (side, target, axis) => {
    const leg = fig.legs[side > 0 ? "L" : "R"];
    axis?.subVectors(leg.knee, leg.ankle).normalize();
    return target.copy(leg.ankle).lerp(leg.knee, 0.3).add(fig.group.position);
  };

  function pose({ float: lift = 0, grip = 0, harness: haul = 0, spine: broken = 0, bones = 1, release = 0 } = {}, bar = REST_BAR) {
    fig.group.position.copy(SEATED).addScaledVector(UPW, 5 * lift);
    const hung = smooth(0, 1, release);
    for (const side of ["L", "R"]) {
      const sx = side === "L" ? 1 : -1;
      // on the pedals → drawn against the seat → hanging under a parachute
      at.set(sx * mix(24, 21, haul), mix(-6, -10, haul), mix(82, 66, haul)).addScaledVector(UPW, 3 * lift);
      at.lerp(rest.set(sx * 11, -44, 43), hung);
      fig.leg(side, at.sub(fig.group.position));
    }
    fig.lean((1 - haul) * (4 + 6 * grip) - 1.5 * haul, 0, 9 * grip * (1 - 0.5 * haul));
    for (const side of ["L", "R"]) {
      const leg = fig.legs[side];
      t.subVectors(leg.knee, leg.hip).normalize();
      n.set(0, 1, 0).addScaledVector(t, -t.y).normalize();
      // at rest the hand lies open over the thigh as over a wide bar: one grip, from there to the handle
      rest.copy(leg.knee).addScaledVector(t, -13).addScaledVector(n, 0.8);
      palm.copy(n).negate();
      if (hung > 0) {
        // under the canopy, each hand goes up to its riser
        const sx = side === "L" ? 1 : -1;
        at.copy(rest).lerp(toBar.set(sx * 12.5, 177, 1.5), hung);
        axis.copy(X).lerp(Y, hung).normalize();
        palm.lerp(n.set(-sx, 0, 0), hung).normalize();
        dir.copy(t).lerp(Z, hung).normalize();
        fig.hold(side, at, axis, { k: mix(0.12, 0.9, hung), bar: mix(5, 1.2, hung), palm, dir });
        continue;
      }
      const g = side === "R" ? clamp01(grip) : 0;
      if (g <= 0) {
        fig.hold(side, rest, X, { k: 0.12, bar: 5, palm, dir: t });
        continue;
      }
      const go = smooth(0, 0.7, g);
      toBar.copy(bar).sub(fig.group.position);
      at.copy(rest).lerp(toBar, go);
      at.y += 7 * Math.sin(Math.PI * go); // it comes down on the handle from above
      palm.lerp(HOOK.palm, go).normalize();
      dir.copy(t).lerp(HOOK.dir, go).normalize();
      fig.hold(side, at, X, { k: mix(0.12, 1, smooth(0.6, 1, g)), bar: mix(5, HANDLE.bar, go), palm, dir });
    }
    setPartOpacity(spine, clamp01(bones));
    hurt.color.copy(BONE).lerp(SIGNAL, broken);
    hurt.emissiveIntensity = 1.5 * broken;
    vertebrae[HURT].scale.y = 1 - 0.4 * broken; // crushed
  }
  pose({});

  return { group, fig, spine, helmet, A, pose, torsoPoint, shin };
}
