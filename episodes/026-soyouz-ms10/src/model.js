// DOSSIER 026 — Soyouz MS-10 : THE SYSTEM. Centimetres, y up; the origin is YOU — the bottom of the descent module's
// heat shield, on the stack's axis (plan.js). What the four small motors tear off the rocket, and what feels it turn:
//   · THE FAIRING (the upper one, the part that leaves with you): two half-shells split along the plane x = 0, a thin
//     wall (its inside shows when it opens), the four lattice fins folded flat at its foot; THE NOSE on top of it, in
//     two halves too, the flange the tower stood on at its summit. `skin` turns all of it to glass, its edges kept.
//   · THE FOUR SMALL SOLID MOTORS — the hero, the clearest grey: each leaning on the nose cone, its nozzle canted out
//     and down. A faint veille glow deep in each throat, one after the other (`litMotors`); then four veille jets that
//     run down along the fairing, spreading, and a light that has a place at each mouth (`fire`).
//   · THE TOWER, glass and ink (it is never what saves you): its truss, its ring of small nozzles, its body, its tip;
//     once it flies, its small ink jet and a fine trail; far away, a pale point.
//   · THE ORBITAL MODULE (an egg with a short waist, its docking probe) and THE DESCENT MODULE — a bell: its solid heat
//     shield, its walls of GLASS held by solid hoops — with YOU and YOUR CREWMATE (figures of glass) on your backs in
//     two of the three solid couches, knees up; the console above your faces and its АВАРИЯ lamp.
//   · THE SENSORS, a group apart (world.js mounts it on the rocket in the sky, under the head on the bench): two clear
//     boxes, a gyroscope ring and a lamp on each face, their wires up the rocket's skin to the junction under the module.
//   · ON THE BENCH ONLY: the glass section of rocket that holds the sensors at their place (launcher.js draws the rocket
//     in the sky).
// Three values of grey: the fairing and the heat shield darkest, the modules in the middle, the motors clearest (the
// couches and the sensors clear too). Colour: veille is the system alive (the motors lit, then firing; the sensors
// that feel the turn; you, alive), signal the АВАРИЯ lamp, ink the rest — the tower above all.
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { solid, glow, setGlow, glass, asShell, lineMat, fatLine, makePart, addMesh, setPartOpacity, anchor, box, cyl, lathe, plate, mergeGeometries } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { DEG, around, DM, OM, FAIRING, MOTORS, FINS, TOWER, CONSOLE, SENSORS, SM, STAGE3, TRUSS, CORE, BENCH, HEAD } from "./plan.js";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const V2 = (x, y) => new THREE.Vector2(x, y);
const UP = V(0, 1, 0);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT_V = new THREE.Color(0.86, 1, 0.93); // veille heated to white: the heart of a jet
const HOT_I = new THREE.Color(1, 0.96, 0.9); // ink heated to white
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// a part leaves fast, overshoots a little and settles: it has weight
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.05 * (u > 0.5 ? 1 : 0.25);

/* ─────────────────────────────────────────────────────────── where everything stands (beyond plan.js) */

/** Three values of grey: the fairing darkest, the modules in the middle, the motors the clearest of all. */
const G = {
  shield: 0x22272b, coiffe: 0x59626a, panel: 0x1b2024, strut: 0x474f55,
  module: 0x7f878e, hoop: 0x666e75, steel: 0x8e969c,
  seat: 0x959ca1, sensor: 0xa9b0b5, nozzle: 0xc3c9cc, motor: 0xe2e5e6, graphite: 0x13171a,
};
/** The fairing's two profiles ([r, y], bottom → top): the cylinder, and the nose — a short steep shoulder (the four
 *  motors stand on it), an ogive, the neck and the flange the tower stood on. */
const CYL_OUT = [[FAIRING.r, FAIRING.low], [FAIRING.r, FAIRING.shoulder]];
const NOSE_OUT = [[150, 560], [146, 563.5], [134, 571], [124, 612], [110, 655], [92, 700], [72, 740], [58, 766], [54, 772]];
const NOSE_TOP = [[54, 782], [60, 784], [60, 790], [30, 790], [30, 794], [0, 794]];
/** A motor: its case is centred on (MOTORS.r, MOTORS.y), leaning out by MOTORS.cant; the mouth of its nozzle is MOUTH
 *  below the centre along that axis. Its own frame: +y up the case, −y out of the nozzle, +z outward (before the lean). */
const MOUTH = 37.6;
/** Drawn 1.3 times plan.js's size (illustrative: the hero must read on a head seen whole), so their centres stand 15 cm
 *  higher than MOTORS.y — the nozzles clear the shoulder. */
const MOTOR_K = 1.3;
const MOTOR_Y = MOTORS.y + 15;
const JET = 860; // cm: a motor's jet, from its mouth
const LAMP_I = 5200; // the light a jet throws on the fairing (decay 1.5, cm)
/** The exploded view (the bench): the nose and its motors rise, the halves part and turn out like a clam, the
 *  orbital module rises, the sensors step out of the glass section. */
const EX = { nose: 200, om: 85, spread: 260, turn: 0.6, sensors: 42 };
/** The sensor boxes are drawn 1.35 times plan.js's size: they must read on a column of rocket eleven metres tall. */
const SENSOR_K = 1.35;
/** The descent module's wall: a convex bell (a quadratic curve) from the rim of the heat shield to the hatch. */
const BELL = [[DM.r, DM.shield], [118, 120], [DM.neck, DM.top]];
const bellAt = (t) => {
  const u = 1 - t;
  return [u * u * BELL[0][0] + 2 * u * t * BELL[1][0] + t * t * BELL[2][0], u * u * BELL[0][1] + 2 * u * t * BELL[1][1] + t * t * BELL[2][1]];
};
/** The couches (plan.js SEATS): the bell narrows fast above the knees, so the two side ones stand 4 cm further in. */
const SEAT_X = [-56, 4, 62];
/** A figure lying in its couch: its hip joint (the head comes to z −52.5, y 77), and how far it sinks at `press` 1. */
const HIP = { y: 76, z: 24 };
const PRESS = 3.5;
/** The console: its face looks DOWN AT YOUR FACES (its normal ≈ (0, −0.79, −0.62)), the lamp on its upper left, over you. */
const CON = { at: [-24, 164, -22], w: 80, h: 36, d: 7, lamp: [-16, 7.5], lampW: 30, lampH: 9.4 };
/** The tower's profile ([r, y]): the collar and its ring of nozzles, the body, the upper section, the tip. */
const TOWER_PROFILE = [[0, 836], [26, 836], [40, 842], [44, 852], [44, 884], [38, 896], [38, 1170], [32, 1186], [29, 1200], [29, 1262], [22, 1300], [12, 1336], [4, 1356], [0, 1360]];
const TRAIL = 4000; // cm of trail behind the tower
/** The sensors' wires: up the inside of the skin (STAGE3 r 133; between the service module, r 136, and the skirt,
 *  r 150, above it) to their connector at the junction under the module. [r, y] per sensor, from its socket. */
const WIRES = [
  [[112, -378], [112, -366], [126, -357], [126, -338], [143, -324], [143, -58], [140, -46]],
  [[128, -1218], [128, -338], [143, -324], [143, -58], [140, -46]],
];
const PULSE = { period: 160, duty: 0.3, speed: 90 }; // cm, cm/s: 3 cm a frame, a 53rd of a period — it runs, it does not strobe

/* ─────────────────────────────────────────────────────────── geometry */

/** The inner face of a wall profile, `t` cm in (the first point straight in). */
const offsetIn = (pts, t) =>
  pts.map(([r, y], i) => {
    if (i === 0) return [r - t, y];
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const nr = b[1] - a[1];
    const ny = -(b[0] - a[0]);
    const l = Math.hypot(nr, ny) || 1;
    return [Math.max(0, r - (nr / l) * t), y - (ny / l) * t];
  });
const cylLoop = () => [...CYL_OUT, ...offsetIn(CYL_OUT, FAIRING.wall).reverse(), CYL_OUT[0]];
const noseLoop = () => {
  const inner = offsetIn(NOSE_OUT, FAIRING.wall);
  return [...NOSE_OUT, ...NOSE_TOP, [0, inner.at(-1)[1] - 2], ...inner.reverse(), NOSE_OUT[0]];
};

/**
 * Half a shell of revolution: a closed wall profile turned over half a turn (side +1: x > 0, −1: x < 0) and its two
 * cut faces on the plane x = 0. Faceted only at the profile's corners.
 */
function halfShell(loop, side, segments = 48) {
  const pts = loop.map(([r, y]) => V2(Math.max(0, r), y));
  const phi0 = side > 0 ? 0 : Math.PI;
  const pieces = [new THREE.LatheGeometry(pts, segments, phi0, Math.PI).toNonIndexed()];
  for (const c of [1, -1]) {
    const cap = new THREE.ShapeGeometry(new THREE.Shape(pts.slice(0, -1)));
    // the shape's (r, y) → the cut plane x = 0, at z = c·r (c +1: the front cut, −1: the back one)
    cap.applyMatrix4(new THREE.Matrix4().set(0, 0, -c, 0, 0, 1, 0, 0, c, 0, 0, 0, 0, 0, 0, 1));
    pieces.push(cap.toNonIndexed());
  }
  for (const p of pieces) {
    p.deleteAttribute("uv");
    p.deleteAttribute("normal");
  }
  return toCreasedNormals(mergeGeometries(pieces), 32 * DEG);
}

/** A lattice fin, folded flat: its frame and its cells, 70 × 150, 3.6 thick (z 0 against the fairing → z 3.6). */
function finGeometry() {
  const { w, h } = FINS;
  const shape = new THREE.Shape([V2(-w / 2, 0), V2(w / 2, 0), V2(w / 2, h), V2(-w / 2, h)]);
  const border = 4.5;
  const bar = 2.8;
  const cols = 3;
  const rows = 7;
  const cw = (w - 2 * border - (cols - 1) * bar) / cols;
  const ch = (h - 2 * border - (rows - 1) * bar) / rows;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) {
      const x0 = -w / 2 + border + c * (cw + bar);
      const y0 = border + r * (ch + bar);
      shape.holes.push(new THREE.Path([V2(x0, y0), V2(x0, y0 + ch), V2(x0 + cw, y0 + ch), V2(x0 + cw, y0)]));
    }
  return plate(shape, 3.6, { bevel: 0.5, round: 1, curveSegments: 1 });
}

/** A couch (the Kazbek liner): its side profile (z, y) extruded across x, narrower at the headrest; the leg rest
 *  under the calves, its two struts, the two shock struts down to the floor. Centred on x = 0. */
const COUCH = [
  [-66, 64], [-64.5, 69.5], [-59, 70], [-46, 70], [-41.5, 66.5], [-35, 64.5], [10, 64], [19, 61.5], [29, 62], [36, 66], [40, 72], [44, 72.5],
  [45, 56], [38, 48], [-52, 48], [-62, 52], [-66, 58],
];
function couchGeometry() {
  const geo = plate(COUCH, 44, { bevel: 2.2, round: 3 }).rotateY(-Math.PI / 2).translate(22, 0, 0);
  // the headrest is a head wide, not a back wide
  for (const g of [geo, geo.userData.edges]) {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * (1 - 0.38 * ramp(-p.getZ(i), 38, 66)));
    p.needsUpdate = true;
  }
  return geo;
}

/** A segment of a strut between two points (a cylinder laid on them). */
function strut(a, b, r) {
  const d = V().subVectors(b, a);
  const g = cyl(r, d.length(), 0.3, 20);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize()));
  g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
}

/** A polyline with its corners rounded, resampled every `stride` cm (025's). */
function pathOf(points, cut = 4, stride = 1.5) {
  const out = [];
  points.forEach((p, i) => {
    const a = points[i - 1];
    const b = points[i + 1];
    if (!a || !b) return out.push(p.clone());
    const u = a.clone().sub(p);
    const v = b.clone().sub(p);
    const k = Math.min(cut, u.length() / 2.2, v.length() / 2.2);
    const from = p.clone().addScaledVector(u.normalize(), k);
    const to = p.clone().addScaledVector(v.normalize(), k);
    for (let s = 0; s <= 7; s++) {
      const t = s / 7;
      out.push(from.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(p, 2 * t * (1 - t)).addScaledVector(to, t * t));
    }
  });
  const res = [out[0].clone()];
  for (let i = 1; i < out.length; i++) {
    const n = Math.max(1, Math.ceil(out[i].distanceTo(out[i - 1]) / stride));
    for (let j = 1; j <= n; j++) res.push(out[i - 1].clone().lerp(out[i], j / n));
  }
  return res;
}
/** A round swept through `points`: it carries `aS` (the length run) and `aRad` (025's). */
function tube(points, radius, radial = 10) {
  const n = points.length;
  const ring = radial + 1;
  const pos = [];
  const nor = [];
  const sAt = [];
  const rad = [];
  const index = [];
  const T = V();
  const T0 = V();
  const N = V();
  const B = V();
  const axis = V();
  const d = V();
  const q = new THREE.Quaternion();
  let s = 0;
  for (let i = 0; i < n; i++) {
    if (i) s += points[i].distanceTo(points[i - 1]);
    T.subVectors(points[Math.min(n - 1, i + 1)], points[Math.max(0, i - 1)]).normalize();
    if (i === 0) N.set(Math.abs(T.x) > 0.9 ? 0 : 1, 0, Math.abs(T.x) > 0.9 ? 1 : 0);
    else {
      axis.crossVectors(T0, T);
      const sin = axis.length();
      if (sin > 1e-7) N.applyQuaternion(q.setFromAxisAngle(axis.divideScalar(sin), Math.atan2(sin, T0.dot(T))));
    }
    N.addScaledVector(T, -N.dot(T)).normalize();
    T0.copy(T);
    B.crossVectors(T, N);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      d.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a));
      const p = points[i];
      pos.push(p.x + d.x * radius, p.y + d.y * radius, p.z + d.z * radius);
      nor.push(d.x, d.y, d.z);
      sAt.push(s);
      rad.push(radius);
    }
    if (i)
      for (let j = 0; j < radial; j++) {
        const a = (i - 1) * ring + j;
        index.push(a, a + 1, a + ring, a + ring, a + 1, a + ring + 1);
      }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("aS", new THREE.Float32BufferAttribute(sAt, 1));
  geo.setAttribute("aRad", new THREE.Float32BufferAttribute(rad, 1));
  geo.setIndex(index);
  geo.userData.length = s;
  return geo;
}
/** A unit circle of points (for ring lines). */
const circle = (r, y, n = 96) => Array.from({ length: n + 1 }, (_, i) => [r * Math.sin((i / n) * Math.PI * 2), y, r * Math.cos((i / n) * Math.PI * 2)]);

/* ─────────────────────────────────────────────────────────── light that has a place */

/** A jet out of a nozzle: a hot core that cools along its length, no edge (007's), its two colours given. */
const flameMaterial = (hot, cool) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uHot: { value: hot.clone() }, uCool: { value: cool.clone() }, uAmount: { value: 0 } },
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
        if (uAmount < 0.003) discard;
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float core = f * f * f;
        float along = clamp(1.0 - vT, 0.0, 1.0);
        vec3 c = mix(uCool, uHot, core * along * along) * core * along * (0.25 + 0.75 * along) * uAmount;
        gl_FragColor = vec4(min(c, vec3(2.6)), 1.0);
      }`,
  });

/** The inside of a nozzle lit from its throat: brightest deep in, nothing at the lip. uv.y: 0 at the lip → 1 at the throat. */
const mouthMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: VEILLE.clone() }, uHot: { value: HOT_V.clone() }, uAmount: { value: 0 }, uHeat: { value: 0 } },
    vertexShader: /* glsl */ `varying float vT; void main() { vT = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uHot; uniform float uAmount, uHeat; varying float vT;
      void main() {
        if (uAmount < 0.003) discard;
        float g = pow(clamp(vT, 0.0, 1.0), 1.7);
        vec3 c = mix(uColor, uHot, uHeat * g) * (0.08 + g) * uAmount;
        gl_FragColor = vec4(min(c, vec3(2.6)), 1.0);
      }`,
  });

/** A ball of light with no edge (014's, 025's): a small hot heart, a soft body, a long tail. A billboard. */
const ballMaterial = (heart, hue) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uRadius, uMinPx; varying vec2 vUv;
      void main() {
        vUv = position.xy;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        c.xy += position.xy * r;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        float core = exp(-r2 / 0.012);
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(clamp(r2, 0.0, 4.0))));
        gl_FragColor = vec4(min((uHeart * (core * 2.4) + uHue * (body + tail)) * uAmount, vec3(2.8)), 1.0);
      }`,
  });
function makeBall(heart, hue) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ballMaterial(heart, hue));
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  mesh.visible = false;
  return mesh;
}

/** A sensor's wire (025's): an ink line never thinner than two pixels, and slow veille heads running up it. */
const BARS = /* glsl */ `
  float bars(float x, float duty) {
    float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
    float q = fract(x);
    float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
    return mix(b, duty, smoothstep(0.12, 0.4, w));
  }`;
const wireMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() }, uTime: { value: 0 }, uSense: { value: 0 }, uLit: { value: 0 }, uAmount: { value: 1 }, uMinPx: { value: 1.05 } },
    vertexShader: /* glsl */ `
      attribute float aS; attribute float aRad; uniform float uMinPx;
      varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 c = modelViewMatrix * vec4(position, 1.0);
        float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
        vec4 mv = modelViewMatrix * vec4(position + normal * (max(aRad, uMinPx * cmPerPx) - aRad), 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vS = aS;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uVeille; uniform float uTime, uSense, uLit, uAmount;
      varying float vS; varying vec3 vN; varying vec3 vV;
      ${BARS}
      void main() {
        float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.15);
        float x = (vS - uTime * ${PULSE.speed.toFixed(2)}) / ${PULSE.period.toFixed(2)};
        float pulse = bars(x, ${PULSE.duty.toFixed(2)});
        float head = 0.4 + 0.6 * clamp(fract(x) / ${PULSE.duty.toFixed(2)}, 0.0, 1.0);
        vec3 c = uInk * (0.3 + 0.15 * uLit) + uVeille * (1.3 * pulse * head * uSense + 0.3 * uLit);
        gl_FragColor = vec4(min(c, vec3(2.2)) * body * uAmount, 1.0);
      }`,
  });

/** The АВАРИЯ lamp: dark glass that lights signal, the word in it heated to white. */
const lampMaterial = (map) =>
  new THREE.ShaderMaterial({
    uniforms: { uMap: { value: map }, uOn: { value: 0 }, uSig: { value: SIGNAL.clone() }, uHot: { value: new THREE.Color(1, 0.9, 0.78) } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap; uniform float uOn; uniform vec3 uSig, uHot; varying vec2 vUv;
      void main() {
        float m = texture2D(uMap, vUv).r;
        vec2 q = abs(vUv - 0.5) * 2.0;
        float rim = smoothstep(0.9, 1.0, max(q.x, q.y * 0.97));
        vec3 off = vec3(0.045, 0.02, 0.016) + vec3(0.075, 0.04, 0.03) * m;
        vec3 on = uSig * (0.48 - 0.22 * rim) + mix(uSig * 1.4, uHot * 1.95, smoothstep(0.3, 1.0, m)) * m;
        gl_FragColor = vec4(mix(off, on, uOn), 1.0);
      }`,
  });

/** The word АВАРИЯ, drawn stroke by stroke (no font: the project's fonts are Latin subsets). White on black, a mask. */
function avariaTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 160;
  const g = c.getContext("2d");
  g.fillStyle = "#000";
  g.fillRect(0, 0, c.width, c.height);
  const h = 104;
  const w = 60;
  const gap = 16;
  const s = 17;
  const i = s / 2;
  const half = Math.PI / 2;
  // each letter in a box w × h, y down; `i` keeps the stroke inside it
  const A = () => {
    g.moveTo(i, h);
    g.lineTo(w * 0.42, i);
    g.lineTo(w * 0.58, i);
    g.lineTo(w - i, h);
    g.moveTo(w * 0.23, h * 0.67);
    g.lineTo(w * 0.77, h * 0.67);
  };
  const VE = () => {
    const m = h * 0.49;
    const r1 = (m - i) / 2;
    const r2 = (h - i - m) / 2;
    const x1 = w - i - r1 - h * 0.05;
    const x2 = w - i - r2;
    g.moveTo(i, h - i);
    g.lineTo(i, i);
    g.lineTo(x1, i);
    g.arc(x1, i + r1, r1, -half, half);
    g.lineTo(i, m);
    g.moveTo(i, m);
    g.lineTo(x2, m);
    g.arc(x2, m + r2, r2, -half, half);
    g.lineTo(i, h - i);
  };
  const ER = () => {
    const r = (h * 0.56 - i) / 2;
    const x = w - i - r;
    g.moveTo(i, h);
    g.lineTo(i, i);
    g.lineTo(x, i);
    g.arc(x, i + r, r, -half, half);
    g.lineTo(i, i + 2 * r);
  };
  const IE = () => {
    g.moveTo(i, 0);
    g.lineTo(i, h - i);
    g.lineTo(w - i, i);
    g.lineTo(w - i, h);
  };
  const YA = () => {
    const r = (h * 0.56 - i) / 2;
    const x = i + r;
    g.moveTo(w - i, h);
    g.lineTo(w - i, i);
    g.lineTo(x, i);
    g.arc(x, i + r, r, -half, half, true);
    g.lineTo(w - i, i + 2 * r);
    g.moveTo(x + h * 0.05, i + 2 * r);
    g.lineTo(i, h);
  };
  const word = [A, VE, A, ER, IE, YA];
  const x0 = (c.width - (word.length * w + (word.length - 1) * gap)) / 2;
  const y0 = (c.height - h) / 2;
  g.strokeStyle = "#fff";
  g.lineWidth = s;
  g.lineJoin = "round";
  g.lineCap = "butt";
  word.forEach((draw, k) => {
    g.save();
    g.translate(x0 + k * (w + gap), y0);
    g.beginPath();
    draw();
    g.stroke();
    g.restore();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

/* ─────────────────────────────────────────────────────────── lamps: what lights faintly veille when the voice names it */

function lampOf(mats, strength = 1) {
  const solids = [];
  const lines = [];
  for (const m of mats) {
    if (m.isLineMaterial) {
      m.userData.rest = m.color.clone();
      lines.push(m);
    } else if (m.isMeshStandardMaterial) {
      m.userData.rest = m.color.clone();
      m.userData.tint = m.color.clone().multiply(TINT);
      solids.push(m);
    }
  }
  return { solids, lines, strength, on: -1 };
}
function light(lamp, k) {
  if (lamp.on === k) return;
  lamp.on = k;
  k *= lamp.strength;
  for (const m of lamp.solids) {
    m.emissive.copy(VEILLE).multiplyScalar(0.1 * k);
    m.color.copy(m.userData.rest).lerp(m.userData.tint, 0.55 * k);
  }
  for (const l of lamp.lines) l.color.copy(l.userData.rest).lerp(VEILLE, 0.75 * k);
}

/* ─────────────────────────────────────────────────────────── the system */

/**
 * buildSystem() → { root, sensors, A, parts, update(P, time, px) } (docs/026-decors.md).
 *   root     the escape head, the tower, the crew, the console, the bench-only glass section — its origin: the base
 *            of the descent module (plan.js)
 *   sensors  the two sensor boxes and their wires, in root's coordinates: world.js re-parents it (rocket / bench)
 *   A        anchors: nose, motors, motor, tower, om, dm, you, mate, console, lamp, sensorA, sensorB, centre, seat
 *   parts    { fairingL, fairingR, nose, motors, tower, om, dm, seats, crew, console, sensors, ghost } — each its own
 *            materials (the fairing's and the nose's crossfade solid ↔ glass with `skin` here: leave them to update)
 */
export function buildSystem() {
  const root = new THREE.Group();
  const cap = new THREE.Group(); // what rises off the descent module when it frees itself: the fairing, its nose and motors, the orbital module
  root.add(cap);
  /** A mesh of `part` hung in `group` (its materials stay the part's). */
  const put = (part, group, geo, mat, o = {}) => {
    const mesh = addMesh(part, geo, mat, o);
    group.add(mesh);
    return mesh;
  };
  /** Solid and glass at once: the fairing and the nose turn to glass with `skin`, their edges kept. */
  const shellParts = [];
  const shelled = (part) => {
    part.userData.fx = { solids: [], lines: [], glasses: [], meshes: [] };
    shellParts.push(part);
    return part;
  };
  const shellMesh = (part, group, geo, mats, o = {}) => {
    const mesh = put(part, group, geo, mats.solid, o);
    const fx = part.userData.fx;
    if (!fx.solids.includes(mats.solid)) fx.solids.push(mats.solid);
    for (const child of mesh.children) if (child.material?.isLineMaterial) fx.lines.push(child.material);
    fx.meshes.push(mesh);
    if (mats.glass) {
      const pane = new THREE.Mesh(geo, mats.glass);
      pane.position.copy(mesh.position);
      pane.rotation.copy(mesh.rotation);
      group.add(pane);
      fx.glasses.push(pane);
    }
    return mesh;
  };
  const shellMats = () => ({
    solid: solid(G.coiffe, { rough: 0.55, metal: 0.22, coat: 0.2, coatRough: 0.5, double: true }),
    glass: glass(BRAND.ink, { base: 0, rim: 0.2, power: 2.8, edge: 0.42, spec: 0.3, through: 0.2 }),
  });
  const finMats = () => ({ solid: solid(G.coiffe, { rough: 0.55, metal: 0.25 }) });

  /* ══ THE FAIRING: two half-shells, the fins on their foot ══ */
  const halves = {};
  const fairingGlass = [];
  const finGeo = finGeometry();
  const cylGeo = { [-1]: halfShell(cylLoop(), -1), [1]: halfShell(cylLoop(), 1) };
  for (const s of [-1, 1]) {
    const part = shelled(makePart(s < 0 ? "fairingL" : "fairingR"));
    cap.add(part);
    const m = shellMats();
    shellMesh(part, part, cylGeo[s], m, { edgeOpacity: 0.72 });
    const f = finMats();
    for (const az0 of FINS.az) {
      const az = az0 + 45; // at 0° and 180° a fin would straddle the split: the four stand between
      if (Math.sign(Math.sin(az * DEG)) !== s) continue;
      const fin = shellMesh(part, part, finGeo, f, { edgeOpacity: 0.32 });
      fin.position.set(...around(az, FAIRING.r + 1, FINS.y));
      fin.rotation.y = az * DEG;
    }
    halves[s] = { fairing: part };
    fairingGlass.push(...part.userData.fx.glasses);
  }
  const fairingL = halves[-1].fairing;
  const fairingR = halves[1].fairing;

  /* ══ THE NOSE: its two halves, the flange at its summit; the four motors ride on it ══ */
  const nose = shelled(makePart("nose"));
  cap.add(nose);
  const noseMats = shellMats();
  for (const s of [-1, 1]) {
    const half = new THREE.Group();
    nose.add(half);
    shellMesh(nose, half, halfShell(noseLoop(), s), noseMats, { edgeOpacity: 0.72 });
    halves[s].nose = half;
  }
  fairingGlass.push(...nose.userData.fx.glasses);
  asShell(fairingGlass, 26);

  /* ══ THE FOUR SMALL SOLID MOTORS ══ */
  const motors = makePart("motors");
  nose.add(motors);
  for (const s of [-1, 1]) {
    halves[s].motors = new THREE.Group();
    motors.add(halves[s].motors);
  }
  const caseGeo = lathe([[0, -21.6], [7.4, -21.6], [8, -20.6], [11, -18.8], [16.2, -14.2], [17, -12], [17, 23], [16.7, 26.5], [15, 30.3], [11.5, 34], [6.5, 36.4], [0, 37]], 48, { bevel: 0.5, round: 2 });
  const bandGeo = lathe([[17, 4.4], [17.8, 5], [17.8, 7.6], [17, 8.2]], 48, { crease: 30 });
  const nozzleGeo = lathe([[14.8, -37.6], [15.4, -37.9], [15.9, -37.4], [15.4, -36.6], [12.6, -30.5], [9.2, -24.5], [7.6, -21.2]], 48, { crease: 40 });
  const linerPts = [[14.8, -37.6], [12, -31.3], [8.6, -25.5], [6.2, -22]];
  const linerGeo = new THREE.LatheGeometry(linerPts.map(([r, y]) => V2(r, y)), 40);
  const glowGeo = new THREE.LatheGeometry(linerPts.map(([r, y]) => V2(r - 0.35, y + 0.05)), 40);
  const throatGeo = new THREE.CircleGeometry(6.4, 28).rotateX(Math.PI / 2);
  const jetGeo = new THREE.LatheGeometry([[12.5, 0], [15.5, -30], [21, -110], [29, -260], [37, -460], [40, -640], [30, -790], [0.4, -JET]].map(([r, y]) => V2(r, y)), 32);
  const coreGeo = new THREE.LatheGeometry([[8.5, 0], [9.5, -30], [8, -110], [4.5, -200], [0.3, -270]].map(([r, y]) => V2(r, y)), 24);
  const flame = flameMaterial(HOT_V.clone().multiplyScalar(1.1), VEILLE.clone().multiplyScalar(1.05));
  const heart = flameMaterial(HOT_V.clone().multiplyScalar(1.35), HOT_V.clone().lerp(VEILLE, 0.5));
  const motorFx = MOTORS.az.map((az, i) => {
    const s = Math.sin(az * DEG) < 0 ? -1 : 1;
    const g = new THREE.Group();
    g.position.set(...around(az, MOTORS.r, MOTOR_Y));
    g.rotation.set(-MOTORS.cant * DEG, az * DEG, 0, "YXZ");
    halves[s].motors.add(g);
    const body = new THREE.Group(); // the motor itself; its jet, its light and its anchor stay unscaled
    body.scale.setScalar(MOTOR_K);
    g.add(body);
    const m = {
      hero: solid(G.motor, { rough: 0.38, metal: 0.3, coat: 0.5, coatRough: 0.3, env: 1.2 }),
      nozzle: solid(G.nozzle, { rough: 0.34, metal: 0.45, env: 1.3 }),
      band: solid(G.steel, { rough: 0.45, metal: 0.4 }),
      liner: solid(G.graphite, { rough: 0.85, double: true }),
      throat: glow(BRAND.veille, 0, { additive: true }),
    };
    const shown = [put(motors, body, caseGeo, m.hero, { edgeOpacity: 0.5 }), put(motors, body, nozzleGeo, m.nozzle, { edgeOpacity: 0.5 })];
    put(motors, body, bandGeo, m.band, { edges: false });
    put(motors, body, linerGeo, m.liner, { edges: false });
    put(motors, body, throatGeo, m.throat, { edges: false, pos: [0, -21.9, 0] });
    const inner = mouthMaterial();
    const mouth = new THREE.Mesh(glowGeo, inner);
    mouth.renderOrder = 4;
    body.add(mouth);
    const lip = MOUTH * MOTOR_K;
    const jet = new THREE.Mesh(jetGeo, flame);
    jet.position.y = -lip;
    jet.visible = false;
    jet.add(new THREE.Mesh(coreGeo, heart));
    g.add(jet);
    const ball = makeBall(HOT_V, VEILLE);
    ball.position.y = -lip - 6;
    g.add(ball);
    const lamp = new THREE.PointLight(BRAND.veille, 0, 1400, 1.5);
    lamp.position.y = -lip - 90;
    g.add(lamp);
    const exit = anchor(g, 0, -lip, 0);
    const lines = shown.flatMap((mesh) => mesh.children.filter((c) => c.material?.isLineMaterial).map((c) => c.material));
    return { i, g, inner, jet, ball, lamp, exit, throat: m.throat, lit: lampOf([m.hero, m.nozzle, ...lines], 0.6) };
  });

  /* ══ THE TOWER: glass and ink, never veille ══ */
  const tower = makePart("tower");
  root.add(tower);
  const towerGlass = glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.6, edge: 0.55, spec: 0.35, through: 0.2 });
  const towerPanes = [new THREE.Mesh(new THREE.LatheGeometry(TOWER_PROFILE.map(([r, y]) => V2(r, y)), 48), towerGlass)];
  const towerNozzle = new THREE.LatheGeometry([V2(7.5, -16), V2(3.2, 0)], 16, 0, Math.PI * 2);
  const towerJets = [];
  const towerFlame = flameMaterial(HOT_I.clone().multiplyScalar(1.1), INK.clone().multiplyScalar(0.75));
  const smallJet = new THREE.LatheGeometry([[6.5, 0], [11, -18], [16, -70], [14, -160], [0.3, -240]].map(([r, y]) => V2(r, y)), 20);
  for (let k = 0; k < 6; k++) {
    const az = 30 + k * 60;
    const n = new THREE.Group();
    n.position.set(...around(az, 44, 866));
    n.rotation.set(-35 * DEG, az * DEG, 0, "YXZ");
    const cone = new THREE.Mesh(towerNozzle, towerGlass);
    n.add(cone);
    towerPanes.push(cone);
    const j = new THREE.Mesh(smallJet, towerFlame);
    j.position.y = -16;
    n.add(j);
    towerJets.push(j);
    tower.add(n);
  }
  tower.add(towerPanes[0]);
  asShell(towerPanes, 28);
  // the truss that held it on the flange, and two rings that give its body a shape from afar
  const trussPts = [];
  for (let k = 0; k <= 8; k++) {
    const a = (k / 8) * 360;
    trussPts.push(around(a, 34, 792), around(a + 22.5, 25, 836));
  }
  const towerLines = [fatLine(trussPts, { color: BRAND.ink, width: 1.9, opacity: 0.55 }), fatLine(circle(38.4, 896), { color: BRAND.ink, width: 1.9, opacity: 0.45 }), fatLine(circle(38.4, 1170), { color: BRAND.ink, width: 1.9, opacity: 0.45 })];
  tower.add(...towerLines);
  // once it flies: its trail (a line of its own, in the head's frame) and, far away, a pale point
  const AWAY = V(...TOWER.away).normalize();
  const trailPts = Array.from({ length: 24 }, (_, k) => [AWAY.x * (k / 23), AWAY.y * (k / 23), AWAY.z * (k / 23)]); // unit length: scaled to its metres
  const trail = fatLine(trailPts, { color: BRAND.ink, width: 2.4, vertexColors: true, additive: true, opacity: 0 });
  trail.geometry.setColors(trailPts.flatMap((_, k) => [Math.pow(k / 23, 1.6), Math.pow(k / 23, 1.6), Math.pow(k / 23, 1.6)])); // bright at the tower, nothing where it left
  trail.frustumCulled = false;
  const trailMat = trail.material;
  root.add(trail);
  const towerDot = makeBall(HOT_I, INK.clone().multiplyScalar(0.8));
  towerDot.position.y = (TOWER.base + TOWER.top) / 2;
  tower.add(towerDot);

  /* ══ THE ORBITAL MODULE ══ */
  const om = makePart("om");
  cap.add(om);
  const omMats = { body: solid(G.module, { rough: 0.55, metal: 0.25, coat: 0.35, coatRough: 0.45 }), steel: solid(G.steel, { rough: 0.4, metal: 0.4 }), hoop: solid(G.hoop, { rough: 0.5, metal: 0.3 }) };
  put(om, om, lathe([[0, 230], [36, 230], [58, 236], [82, 252], [100, 274], [110, 304], [112, 340], [112, 386], [110, 420], [100, 452], [82, 474], [56, 490], [34, 497], [30, 498], [0, 498]], 72, { bevel: 1, round: 2 }), omMats.body, { edgeOpacity: 0.6 });
  put(om, om, lathe([[112, 337], [114.5, 338], [114.5, 344], [112, 345]], 72, { crease: 30 }), omMats.hoop, { edgeOpacity: 0.45 });
  put(om, om, lathe([[112, 381], [114.5, 382], [114.5, 388], [112, 389]], 72, { crease: 30 }), omMats.hoop, { edgeOpacity: 0.45 });
  put(om, om, lathe([[0, 497], [19, 497], [19, 503], [9, 508], [6, 524], [3.5, 530], [0, OM.probe]], 40, { bevel: 0.4, round: 2 }), omMats.steel, { edgeOpacity: 0.5 });

  /* ══ THE DESCENT MODULE: its heat shield, its walls of glass, its hoops ══ */
  const dm = makePart("dm");
  root.add(dm);
  const dmMats = { shield: solid(G.shield, { rough: 0.7, metal: 0.15 }), hoop: solid(G.hoop, { rough: 0.62, metal: 0.25 }) };
  put(dm, dm, lathe([[0, 0], [52, 2.4], [86, 6.5], [104, 11], [108.5, 14], [108.5, DM.shield], [0, DM.shield]], 72, { bevel: 0.8, round: 2 }), dmMats.shield, { edgeOpacity: 0.6 });
  const dmGlass = glass(BRAND.ink, { base: 0, rim: 0.24, power: 2.6, edge: 0.5, spec: 0.45, through: 0.25 });
  const wallPts = Array.from({ length: 25 }, (_, k) => bellAt(k / 24));
  const dmWall = new THREE.Mesh(new THREE.LatheGeometry(wallPts.map(([r, y]) => V2(r, y)), 72), dmGlass);
  dm.add(dmWall);
  asShell(dmWall, 20);
  for (const t of [0.02, 0.36, 0.66, 0.9]) {
    const [r, y] = bellAt(t);
    put(dm, dm, lathe([[r - 0.6, y - 2], [r + 2, y - 2], [r + 2, y + 2], [r - 0.6, y + 2]], 72, { bevel: 0.4, round: 1 }), dmMats.hoop, { edgeOpacity: 0.4 });
  }
  put(dm, dm, lathe([[0, 220], [46, 220], [49, 223], [49, 226], [40, 228], [40, 234], [0, 234]], 64, { bevel: 0.5, round: 1 }), dmMats.hoop, { edgeOpacity: 0.55 }); // the hatch, and the tunnel up to the orbital module

  /* ══ THE THREE COUCHES ══ */
  const seats = makePart("seats");
  root.add(seats);
  const seatMats = { pan: solid(G.seat, { rough: 0.6, metal: 0.1, coat: 0.25 }), strut: solid(G.strut, { rough: 0.5, metal: 0.35 }) };
  const couchGeo = couchGeometry();
  const restGeo = box(26, 4, 40, 1.2);
  const seatStruts = mergeGeometries([
    strut(V(-10, 52, 40), V(-10, 101, 50), 1.8),
    strut(V(10, 52, 40), V(10, 101, 50), 1.8),
    strut(V(0, 49, -30), V(0, DM.shield + 2, -34), 2.6),
    strut(V(0, 49, 16), V(0, DM.shield + 2, 20), 2.6),
  ]);
  const seatGroups = SEAT_X.map((x) => {
    const g = new THREE.Group();
    g.position.x = x;
    seats.add(g);
    put(seats, g, couchGeo, seatMats.pan, { edgeOpacity: 0.55 });
    put(seats, g, restGeo, seatMats.pan, { edgeOpacity: 0.55, pos: [0, 104.5, 34] });
    put(seats, g, seatStruts, seatMats.strut, { edgeOpacity: 0.4 });
    return g;
  });

  /* ══ YOU AND YOUR CREWMATE: glass, on your backs, knees up ══ */
  const crew = makePart("crew");
  root.add(crew);
  const lay = (x, glassK, order) => {
    const f = makeFigure({ shell: true, hands: "flat", order, glassK, through: 0.18, spec: 0.55 });
    f.ghost(true);
    f.group.rotation.x = -Math.PI / 2; // its feet toward +z, its face up
    f.group.position.set(x, HIP.y, HIP.z + 90);
    for (const s of ["L", "R"]) f.leg(s, V(s === "L" ? 8.6 : -8.6, 64, 37)); // thighs up, shins along +z, feet up
    f.reach("L", V(10, 103, 12), V(0.8, 0, -0.6), { dir: V(-0.55, -0.6, 0.1).normalize(), palm: V(0, 0, -1) });
    f.reach("R", V(-10, 103, 12), V(-0.8, 0, -0.6), { dir: V(0.55, -0.6, 0.1).normalize(), palm: V(0, 0, -1) });
    crew.add(f.group);
    f.tint = { color: f.body.uniforms.uColor.value, gain: f.body.uniforms.uGain, k: -1 };
    return f;
  };
  const mate = lay(SEAT_X[1], 0.82, 10); // drawn first: seen through you
  const you = lay(SEAT_X[0], 1, 12);

  /* ══ THE CONSOLE AND ITS LAMP ══ */
  const consoleP = makePart("console");
  root.add(consoleP);
  const frame = new THREE.Group();
  frame.position.set(...CON.at);
  frame.rotation.x = -CONSOLE.tilt * DEG; // its −z face looks down at your faces
  consoleP.add(frame);
  const conMats = { panel: solid(G.panel, { rough: 0.55, metal: 0.2, coat: 0.3 }), key: solid(0x343a3f, { rough: 0.5, metal: 0.2 }), arm: solid(G.strut, { rough: 0.5, metal: 0.35 }) };
  put(consoleP, frame, box(CON.w, CON.h, CON.d, 1.4), conMats.panel, { edgeOpacity: 0.6 });
  const keys = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) if (!(r === 0 && c < 4)) keys.push(box(4.2, 4.2, 1.4, 0.5).translate(-6 + (c - 2.5) * 6.4, 9 - r * 7.4, -CON.d / 2 - 0.5));
  put(consoleP, frame, mergeGeometries(keys), conMats.key, { edges: false });
  put(consoleP, frame, box(CON.lampW + 3.6, CON.lampH + 3.6, 1.6, 0.5), conMats.key, { edgeOpacity: 0.5, pos: [CON.lamp[0], CON.lamp[1], -CON.d / 2 - 0.6] });
  const lampMat = lampMaterial(avariaTexture());
  const lampMesh = new THREE.Mesh(new THREE.PlaneGeometry(CON.lampW, CON.lampH).rotateY(Math.PI), lampMat);
  lampMesh.position.set(CON.lamp[0], CON.lamp[1], -CON.d / 2 - 1.75); // 0.35 in front of its bezel
  frame.add(lampMesh);
  // its two arms, up to the hatch ring
  frame.updateMatrix();
  const toFrame = frame.matrix.clone().invert();
  const armGeo = mergeGeometries([-1, 1].map((sx) => strut(V(sx * 30, CON.h / 2 - 3, CON.d / 2), V(-24 + sx * 26, 214, -18).applyMatrix4(toFrame), 1.6)));
  put(consoleP, frame, armGeo, conMats.arm, { edgeOpacity: 0.4 });

  /* ══ THE SENSORS: a group apart ══ */
  const sensors = makePart("sensors");
  const senMats = { box: solid(G.sensor, { rough: 0.45, metal: 0.3, coat: 0.4, coatRough: 0.35 }), ring: solid(G.motor, { rough: 0.3, metal: 0.45 }), dark: solid(G.panel, { rough: 0.6, metal: 0.2 }), lamp: glow(BRAND.veille, 0.05) };
  const [sw, sh, sd] = SENSORS.size;
  const boxGeo = box(sw, sh, sd, 1.2);
  const ringGeo = new THREE.TorusGeometry(5.2, 1.15, 12, 40);
  const ringHubGeo = cyl(1.8, 1.6, 0.3, 20).rotateX(Math.PI / 2);
  const lampGeo = new THREE.CircleGeometry(2.3, 20);
  const plugGeo = box(10, 7, 8, 0.8);
  const wireMat = wireMaterial();
  const leadMat = lineMat(BRAND.ink, 2, { opacity: 0.6 });
  const sensorFx = SENSORS.at.map((at, k) => {
    const az = k === 0 ? -35 : -150;
    const out = V(Math.sin(az * DEG), 0, Math.cos(az * DEG));
    const unit = new THREE.Group(); // the box, its ring, its lamp: what steps out on the bench
    unit.position.set(...at);
    unit.rotation.y = az * DEG; // its face (+z) outward
    unit.scale.setScalar(SENSOR_K);
    sensors.add(unit);
    put(sensors, unit, boxGeo, senMats.box, { edgeOpacity: 0.6 });
    put(sensors, unit, ringGeo, senMats.ring, { edges: false, pos: [-4.5, 0, sd / 2 + 1.2] });
    put(sensors, unit, ringHubGeo, senMats.ring, { edges: false, pos: [-4.5, 0, sd / 2 + 0.8] });
    put(sensors, unit, lampGeo, senMats.lamp, { edges: false, pos: [7, 2.5, sd / 2 + 0.06] });
    const ball = makeBall(HOT_V, VEILLE);
    ball.position.set(7, 2.5, sd / 2 + 2);
    unit.add(ball);
    // its wire, from the socket above it up to the connector under the module
    const pts = pathOf(WIRES[k].map(([r, y]) => V(...around(az, r, y))));
    const wire = new THREE.Mesh(tube(pts, 0.9), wireMat);
    wire.frustumCulled = false;
    sensors.add(wire);
    const [pr, py] = WIRES[k].at(-1);
    put(sensors, sensors, plugGeo, senMats.dark, { edgeOpacity: 0.5, pos: around(az, pr, py + 2) }).rotation.y = az * DEG;
    const socket = V(...around(az, WIRES[k][0][0], WIRES[k][0][1]));
    const lead = fatLine([[0, 0, 0], [0, 1, 0]], { color: BRAND.ink, width: 2 });
    lead.material = leadMat;
    lead.position.copy(socket);
    lead.frustumCulled = false;
    sensors.add(lead);
    return { unit, home: V(...at), out, ball, lead, socket, top: V(), dir: V() };
  });
  const senLamp = lampOf([...sensors.userData.part.mats].filter((m) => m === senMats.box || (m.isLineMaterial && m !== leadMat)));

  /* ══ ON THE BENCH ONLY: the glass section of rocket under the head (launcher.js's glass) ══ */
  const ghost = makePart("ghost");
  root.add(ghost);
  const ghostMat = glass(BRAND.ink, { base: 0, rim: 0.26, edge: 0.45, through: 0.25 });
  const ghostPane = (profile, segs = 64) => {
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(profile.map(([r, y]) => V2(r, y)), segs), ghostMat);
    ghost.add(mesh);
    return mesh;
  };
  const panes = [
    ghostPane([[150, -330], [150, FAIRING.low]]), // the skirt of the fairing that stays
    ghostPane([[14, -272], [24, -236], [110, -230], [SM.r, -214], [SM.r, SM.top - 2], [96, SM.top]]), // the service module and its nozzle
    ghostPane([[STAGE3.r, STAGE3.bottom], [STAGE3.r, STAGE3.top]]), // the third stage
    ghostPane([[CORE.r, BENCH.floor], [CORE.r, CORE.top - 10], [140, CORE.top]]), // the top of the core, cut where the bench's floor is
  ];
  for (const sx of [-1, 1]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(6, 170, 82), ghostMat); // a folded solar panel
    panel.position.set(sx * (SM.r + 4), -118, 0);
    ghost.add(panel);
    panes.push(panel);
  }
  for (const [x, z] of [[40, 0], [-40, 0], [0, 40], [0, -40]]) {
    const n = ghostPane([[22, -1104], [13, -1046], [6, STAGE3.bottom - 4]], 24); // the third stage's engine, in the truss
    n.position.set(x, 0, z);
    panes.push(n);
  }
  asShell(panes, 30);
  const zig = [];
  for (let k = 0; k <= 12; k++) zig.push(around(k * 30, TRUSS.r, TRUSS.top), around(k * 30 + 15, TRUSS.r + 6, TRUSS.bottom));
  ghost.add(fatLine(zig, { color: BRAND.ink, width: 2, opacity: 0.5 }));
  for (const [r, y, o] of [[150, FAIRING.low, 0.4], [150, -330, 0.45], [STAGE3.r, -420, 0.35], [STAGE3.r, STAGE3.bottom, 0.45], [CORE.r, CORE.top, 0.45], [CORE.r, BENCH.floor + 0.5, 0.7]]) ghost.add(fatLine(circle(r, y), { color: BRAND.ink, width: 2, opacity: o }));
  ghost.visible = false;

  /* ══ lamps: what the voice names lights faintly veille ══ */
  const shipLamp = lampOf([...om.userData.part.mats, ...dm.userData.part.mats]);

  /* ══ anchors ══ */
  const A = {
    nose: anchor(nose, 0, FAIRING.nose, 0),
    motors: anchor(motors, 0, MOTOR_Y, 0),
    motor: motorFx[0].exit,
    tower: anchor(tower, 0, (TOWER.base + TOWER.top) / 2, 0),
    om: anchor(om, 0, (OM.base + OM.top) / 2, 0),
    dm: anchor(dm, 0, DM.top / 2, 0),
    you: anchor(you.head, 0, 0, 0),
    mate: anchor(mate.head, 0, 0, 0),
    console: anchor(frame, 0, 0, -CON.d / 2),
    lamp: anchor(frame, CON.lamp[0], CON.lamp[1], -CON.d / 2 - 1.5),
    sensorA: anchor(sensorFx[0].unit, 0, 0, sd / 2),
    sensorB: anchor(sensorFx[1].unit, 0, 0, sd / 2),
    centre: anchor(root, ...HEAD.centre),
    seat: anchor(seatGroups[0], 0, 66, -10),
  };
  const parts = { fairingL, fairingR, nose, motors, tower, om, dm, seats, crew, console: consoleP, sensors, ghost };

  /** The fairing and the nose: `a` how much of them is there, `skin` 1 solid → 0 glass (their edges stay). */
  const shellFade = (part, a, skin) => {
    const fx = part.userData.fx;
    part.visible = a > 0.004;
    if (!part.visible) return;
    const s = a * smooth(ramp(skin, 0.25, 1));
    for (const m of fx.solids) {
      m.opacity = s;
      const t = s < 0.999;
      if (m.transparent !== t) {
        m.transparent = t;
        m.needsUpdate = true;
      }
      m.depthWrite = s > 0.55;
      m.visible = s > 0.004;
    }
    for (const mesh of fx.meshes) mesh.castShadow = s > 0.6;
    for (const l of fx.lines) l.opacity = l.userData.base * a * (0.5 + 0.5 * skin);
    const g = a * (1 - smooth(ramp(skin, 0, 0.75)));
    for (const pane of fx.glasses) {
      pane.material.uniforms.uAmount.value = g;
      pane.visible = g > 0.003;
    }
  };
  const tintFigure = (f, k) => {
    if (f.tint.k === k) return;
    f.tint.k = k;
    f.tint.color.copy(INK).lerp(VEILLE, 0.85 * k);
    f.tint.gain.value = 1 + 1.1 * k;
  };
  let pressed = -1;

  return {
    root, sensors, A, parts,
    /** Every frame, sixteen times — no allocation. P = { bench, skin, explode, shed, tower, fire, litMotors, free,
     *  avaria, press, sense, litShip, litMate, litYou, litSensors } (docs/026-decors.md). */
    update(P = {}, time = 0, px = 1) {
      void px;
      const bench = (P.bench ?? 0) > 0.5;
      const e = clamp01(P.explode ?? 0);
      const shed = clamp01(P.shed ?? 0);
      const free = bench ? 0 : clamp01(P.free ?? 0);
      const skin = clamp01(P.skin ?? 1);
      const fire = clamp01(P.fire ?? 0);
      const litM = P.litMotors ?? 0;

      /* ── the exploded view: the nose and its motors up, the halves apart like a clam, the orbital module up */
      const open = settle(ramp(e, 0.05, 0.75));
      nose.position.y = EX.nose * settle(ramp(e, 0, 0.7));
      om.position.y = EX.om * settle(ramp(e, 0.2, 0.9));
      /* ── the fairing jettisoned: each half tips out about its foot and falls, its half of the nose and its two motors with it */
      const tip = 1.3 * smooth(ramp(shed, 0, 0.85));
      const drop = 1500 * shed * shed;
      const drift = 240 * shed;
      for (const s of [-1, 1]) {
        const h = halves[s];
        const rz = -s * tip;
        const c = Math.cos(rz);
        const sn = Math.sin(rz);
        const hx = s * FAIRING.r;
        const hy = FAIRING.low;
        h.fairing.position.set(hx - (c * hx - sn * hy) + s * drift + s * EX.spread * open, hy - (sn * hx + c * hy) - drop, 0);
        h.fairing.rotation.set(0, s * EX.turn * open, rz, "YXZ");
        const ly = hy - nose.position.y; // the same hinge, seen from the (lifted) nose
        h.nose.position.set(hx - (c * hx - sn * ly) + s * drift, ly - (sn * hx + c * ly) - drop, 0);
        h.nose.rotation.z = rz;
        h.motors.position.copy(h.nose.position);
        h.motors.rotation.z = rz;
      }
      /* ── the module frees itself: the fairing, its nose, its motors and the orbital module rise off it and are gone */
      cap.position.y = 3000 * smooth(free);
      const stay = 1 - smooth(ramp(free, 0.5, 0.97));
      const there = stay * (1 - smooth(ramp(shed, 0.72, 0.98)));
      shellFade(fairingL, there, skin);
      shellFade(fairingR, there, skin);
      shellFade(nose, there, skin);
      setPartOpacity(motors, there);
      setPartOpacity(om, stay);

      /* ── the four motors: lit one by one (litMotors 0–4), then their jets */
      flame.uniforms.uAmount.value = 0.95 * there;
      heart.uniforms.uAmount.value = 0.9 * there;
      for (const m of motorFx) {
        const k = clamp01(litM - m.i);
        setGlow(m.throat, 1.3 * k + 2.4 * fire);
        m.inner.uniforms.uAmount.value = (0.6 * k + 1.3 * fire) * there;
        m.inner.uniforms.uHeat.value = fire;
        light(m.lit, Math.max(k, fire));
        const b = m.ball.material.uniforms;
        b.uAmount.value = (0.2 * k + 0.85 * fire) * there;
        b.uRadius.value = 8 + 16 * fire;
        b.uMinPx.value = 2.5 + 5 * fire;
        m.ball.visible = b.uAmount.value > 0.003;
        const on = fire > 0.003 && there > 0.004;
        m.jet.visible = on;
        if (on) m.jet.scale.set(0.72 + 0.28 * fire, fire * (0.95 + 0.05 * Math.sin(time * 2.3 + m.i * 1.9)), 0.72 + 0.28 * fire);
        m.lamp.intensity = LAMP_I * fire * there;
      }

      /* ── the tower: `tower` metres along its way, from its seat on the (lifted) nose */
      const tm = Math.max(0, P.tower ?? 0);
      const td = tm * 100;
      const seat = nose.position.y;
      tower.position.set(AWAY.x * td, AWAY.y * td + seat, AWAY.z * td);
      tower.visible = !(bench && tm > 60);
      const flying = smooth(ramp(tm, 0.03, 0.8));
      towerFlame.uniforms.uAmount.value = 0.85 * flying;
      for (const j of towerJets) {
        j.visible = flying > 0.003 && tower.visible;
        j.scale.set(1, 0.6 + 0.4 * flying, 1);
      }
      const len = Math.min(td, TRAIL);
      trail.visible = flying > 0.003 && tower.visible;
      trail.position.set(AWAY.x * (td - len), FAIRING.nose + 2 + seat + AWAY.y * (td - len), AWAY.z * (td - len));
      trail.scale.setScalar(Math.max(1, len));
      trailMat.opacity = 0.7 * flying;
      const far = bench ? 0 : smooth(ramp(tm, 50, 140));
      const d = towerDot.material.uniforms;
      d.uAmount.value = 0.75 * far;
      d.uRadius.value = 60;
      d.uMinPx.value = 4;
      towerDot.visible = far > 0.003;

      /* ── you, your crewmate: pressed into your couches; named, you glow */
      const press = clamp01(P.press ?? 0);
      if (press !== pressed) {
        pressed = press;
        for (const f of [you, mate]) {
          f.group.position.y = HIP.y - PRESS * press;
          f.lean(-4 * press);
        }
        for (const g of seatGroups) g.scale.y = 1 - 0.02 * press;
      }
      tintFigure(you, clamp01(P.litYou ?? 0));
      tintFigure(mate, 0.7 * clamp01(P.litMate ?? 0));

      /* ── the console's lamp */
      lampMat.uniforms.uOn.value = clamp01(P.avaria ?? 0);

      /* ── the two modules, named: their edges veille */
      const ship = clamp01(P.litShip ?? 0);
      light(shipLamp, ship);
      dmGlass.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.55 * ship); // its lip turns veille, the glass stays glass
      dmGlass.uniforms.uGain.value = 1 + 0.12 * ship;

      /* ── the sensors: their lamps, their pulses, their boxes; on the bench they step out of the glass */
      const sense = clamp01(P.sense ?? 0);
      const litS = clamp01(P.litSensors ?? 0);
      wireMat.uniforms.uTime.value = time;
      wireMat.uniforms.uSense.value = sense;
      wireMat.uniforms.uLit.value = litS;
      light(senLamp, litS);
      const breath = 0.86 + 0.14 * Math.sin(time * 2.4);
      setGlow(senMats.lamp, 0.05 + 2.3 * sense * breath);
      const step = bench ? EX.sensors * settle(ramp(e, 0.3, 1)) : 0;
      for (const f of sensorFx) {
        f.unit.position.copy(f.home).addScaledVector(f.out, step);
        const b = f.ball.material.uniforms;
        b.uAmount.value = 0.65 * sense * breath;
        b.uRadius.value = 3.5;
        b.uMinPx.value = 5;
        f.ball.visible = sense > 0.003;
        f.top.copy(f.unit.position).y += (sh / 2) * SENSOR_K;
        f.dir.subVectors(f.top, f.socket);
        const l = f.dir.length();
        f.lead.scale.setScalar(Math.max(0.001, l));
        if (l > 1e-4) f.lead.quaternion.setFromUnitVectors(UP, f.dir.divideScalar(l));
      }

      /* ── the bench's glass section */
      ghost.visible = bench;
    },
  };
}
