// DOSSIER 025 — ESP : the system. Everything the ESP is made of, as ONE rigid assembly at its true places in the car
// (plan.js: the root's origin is the car's — its centre on the ground —, its nose toward −z, LEFT is −x):
//   · FOUR WHEEL CORNERS (014's brake, four times, mirrored for the right): a ventilated disc, a caliper on its rear
//     top quarter and its two pads; behind the disc, on the hub, the toothed ring and, a breath above its teeth, the
//     speed sensor on its bracket. The two front ones steer (30° at `steer` 1) about the vertical through the hub.
//     The front-RIGHT one is the film's: « l'avant, à l'extérieur du virage » (the swerve is to the left).
//   · THE ESP UNIT behind the front-left arch: the valve block (machined aluminium, the clearest piece), its four
//     valves on the face the camera sees, the pump's motor hanging under it — and, clipped on top, THE COMPUTER. One
//     vertical edge of the computer is cut by a broad facet facing az −45 (the camera's side): on it, THE COMPARATOR —
//     a dark face, two thick needles, where you steer (ink, `aim`) and where the car goes (veille / signal, `yaw`),
//     and between them, when they part, the sector that shows how far. A picture of the computation, not a part of
//     the real thing (`sources` says so): no figure, no fine graduation — one mark at the top, « straight ».
//   · THE STEERING ANGLE SENSOR: a ring on the column just behind the wheel; its code disc turns with the wheel.
//   · THE YAW RATE SENSOR on the floor tunnel, at the car's heart: a small box, a turning arrow embossed on its lid.
//   · THE LINES: four brake lines from the block to the calipers (the front ones follow the steering at their end),
//     and the six wires of the sensors to the computer's connector — ink lines, never thinner than 2 px.
//   · ON THE BENCH ONLY: the four tyres of glass (the skeleton stands on them), the steering wheel and its column of
//     glass, two dark posts under the unit and the yaw sensor. In the car route.js draws the wheels and the wheel.
// Three values of grey: rubber, cast iron and the computer dark; steel and the motor middle; what is machined clear.
// Light: VEILLE is the system alive (the sensors' pulses, the pressure running down a line, the ONE brake that bites,
// the comparator's « yes »), SIGNAL the comparator's « no », INK the rest and where you steer.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glass, asShell, fatLine, makePart, addMesh, setPartOpacity, anchor, box, cyl, lathe, plate, mergeGeometries } from "@kit/build3d.js";
import { HUBS, TYRE, DISC, CALIPER, RING, UNIT, ECU, SAS, YAWS, STEERING, SYSTEM } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);
const KEYS = ["FL", "FR", "RL", "RR"];
const BRAKE_OF = { FL: "bFL", FR: "bFR", RL: "bRL", RR: "bRR" };

/* ─────────────────────────────────────────────────────────── where everything is */

/** Full lock, in radians (`steer` ±1), for the front corners; and the steering wheel's turn at full lock. */
export const STEER = 30 * DEG;
const WHEEL_TURN = 100 * DEG;
const R = TYRE.r;
const BEAD = TYRE.rim;
const HW = TYRE.w / 2;
const SPIN = 100 / R; // radians a metre rolled
// In a corner's own frame the first coordinate is `a`: how far INBOARD of the wheel's mid-plane (mirrored on the right).
const A_DISC = DISC.inset;
const DT = DISC.thick / 2;
const A_RING = RING.inset;
const TIP = RING.r + 0.18;
const GAP = 0.7; // how far each pad stands off the disc at rest: a millimetre in a real brake, seven here
const CAL_TILT = Math.PI / 2 - Math.atan2(CALIPER.up, CALIPER.back);
const calLocal = (a, y, z) => V(a, y * Math.cos(CAL_TILT) - z * Math.sin(CAL_TILT), y * Math.sin(CAL_TILT) + z * Math.cos(CAL_TILT));
const BANJO = calLocal(14.7, 14.6, -3.2); // where the brake line ends, on the caliper's inboard face
const BOOT = V(A_RING + 1.7, 14.6, 0.3); // where the sensor's wire leaves its boot
/** A point of corner `k`'s own frame, in the car's (not steered). */
const onCorner = (k, p) => {
  const [hx, hy, hz] = HUBS[k];
  const s = Math.sign(hx);
  return V(hx - s * p.x, hy + p.y, hz + p.z);
};

// the unit: the block, the computer on top of it
const U = { x: UNIT.at[0], y: UNIT.at[1], z: UNIT.at[2] };
const X0 = U.x - UNIT.w / 2;
const X1 = U.x + UNIT.w / 2;
const Y0 = U.y - UNIT.h / 2;
const Y1 = U.y + UNIT.h / 2;
const Z1 = U.z + UNIT.d / 2; // the face toward the rear of the car (the camera's side)
const MOTOR = { r: 3.4, h: 6.9 };
const E = { x: ECU.at[0], z: ECU.at[2], w: ECU.w, d: ECU.d, y0: Y1 + 0.3, y1: Y1 + 14.3, cut: 10 };
E.yc = (E.y0 + E.y1) / 2;
// the facet that carries the comparator: the computer's (−x, +z) vertical edge cut back by `cut` on both faces
const FACET = { x: E.x - E.w / 2 + E.cut / 2, z: E.z + E.d / 2 - E.cut / 2, n: [-Math.SQRT1_2, Math.SQRT1_2] };
const DIAL_R = ECU.dial;
const PLUG = { x: E.x + E.w / 2 + 2.4, y: E.y0 + 4.6, z: E.z }; // the computer's connector, on its +x face: every wire ends here
/** How far a needle turns for a degree of the story, and its stop. */
const NEEDLE = { gain: 2, stop: 140 * DEG };

// the steering column: from the wheel's centre down and forward through the angle sensor
const COL = V(SAS.at[0] - STEERING.x, SAS.at[1] - STEERING.y, SAS.at[2] - STEERING.z).normalize();
const COL_Q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), COL.clone().negate()); // local +z looks back at the driver
const onColumn = (origin, x, y, z) => V(x, y, z).applyQuaternion(COL_Q).add(V(...origin));

// the yaw sensor, a little larger than plan.js says (the system's sizes are illustrative): it must read on the bench
const YB = { w: 9, h: 3.6, d: 9 };

// the exploded view (the bench, seen from VIEW.exploded): what rises, and how far; each corner steps outward
const LIFT = { unit: 24, ecu: 50, yaws: 36, sas: 60, wheel: 82 };
const OUT = { x: 38, z: 10 };

const PULSE = { period: 14, duty: 0.32, speed: 19 }; // cm, cm/s: 0.63 cm a frame, a 22nd of a period — it runs, it does not strobe

/* ─────────────────────────────────────────────────────────── geometry (014's) */

const lyingZ = (g) => g.rotateX(Math.PI / 2);
const lyingX = (g) => g.rotateZ(-Math.PI / 2);
const turnX = (profile, segments = 64, o = { bevel: 0.08, round: 2 }) => lyingX(lathe(profile, segments, o));
const turnY = (profile, segments = 48, o = { bevel: 0.05, round: 2 }) => lathe(profile, segments, o);
const turnZ = (profile, segments = 64, o = { bevel: 0.1, round: 2 }) => lyingZ(lathe(profile, segments, o));
const ringOf = (r0, r1, a, b) => [[r0, a], [r1, a], [r1, b], [r0, b], [r0, a]];
const hex = (r, h, bevel = 0.07) => cyl(r, h, bevel, 6);
const slab = (outline, t, a, bevel = 0.15) => plate(outline, t, { bevel }).rotateY(-Math.PI / 2).translate(a, 0, 0);
const arc = (cx, cy, r, from, to, n = 8) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((from + ((to - from) * i) / n) * DEG), cy + r * Math.sin((from + ((to - from) * i) / n) * DEG)]);

function bent(points, cut = 0.8, steps = 7) {
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
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      out.push(from.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(p, 2 * t * (1 - t)).addScaledVector(to, t * t));
    }
  });
  return out;
}
function resampled(points, stride = 0.3) {
  const out = [points[0].clone()];
  for (let i = 1; i < points.length; i++) {
    const n = Math.max(1, Math.ceil(points[i].distanceTo(points[i - 1]) / stride));
    for (let j = 1; j <= n; j++) out.push(points[i - 1].clone().lerp(points[i], j / n));
  }
  return out;
}
const pathOf = (points, cut, stride) => resampled(bent(points, cut), stride);
const runOf = (points) => points.reduce((run, p, i) => (run.push(i ? run[i - 1] + p.distanceTo(points[i - 1]) : 0), run), []);

/** A round swept through `points` (014's): it carries `aS`, the length run, and `aRad`; `onPath`: vertices left on the path. */
function tube(points, radii, { radial = 12, onPath = false, s0 = 0 } = {}) {
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
  const Bn = V();
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
    Bn.crossVectors(T, N);
    const r = radii.length ? radii[i] : radii;
    const p = points[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      d.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(Bn, Math.sin(a));
      if (onPath) pos.push(p.x, p.y, p.z);
      else pos.push(p.x + d.x * r, p.y + d.y * r, p.z + d.z * r);
      nor.push(d.x, d.y, d.z);
      sAt.push(s + s0);
      rad.push(r);
    }
    if (i) {
      for (let j = 0; j < radial; j++) {
        const a = (i - 1) * ring + j;
        index.push(a, a + 1, a + ring, a + ring, a + 1, a + ring + 1);
      }
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
/** A path turned with a front wheel: each point about the vertical through hub `k`, by `angle` × its own weight. */
const steered = (points, weights, angle, k) => {
  const [hx, , hz] = HUBS[k];
  return points.map((p, i) => {
    const a = angle * weights[i];
    const c = Math.cos(a);
    const s = Math.sin(a);
    return V(hx + (p.x - hx) * c + (p.z - hz) * s, p.y, hz - (p.x - hx) * s + (p.z - hz) * c);
  });
};
/** A line that follows a front wheel at one end: full left lock, straight and full right (morphs, or attributes for a sheath). */
function flexTube(points, weights, radii, o, k) {
  const geo = tube(points, radii, o);
  const left = tube(steered(points, weights, STEER, k), radii, o);
  const right = tube(steered(points, weights, -STEER, k), radii, o);
  if (o.onPath) {
    geo.setAttribute("aPosL", left.attributes.position);
    geo.setAttribute("aPosR", right.attributes.position);
    geo.setAttribute("aNorL", left.attributes.normal);
    geo.setAttribute("aNorR", right.attributes.normal);
  } else {
    geo.morphAttributes.position = [left.attributes.position, right.attributes.position];
    geo.morphAttributes.normal = [left.attributes.normal, right.attributes.normal];
  }
  return geo;
}
function circle(r, a, o) {
  const pts = [];
  for (let i = 0; i <= 96; i++) pts.push([a, r * Math.cos((i / 96) * Math.PI * 2), r * Math.sin((i / 96) * Math.PI * 2)]);
  return fatLine(pts, o);
}
const WALL = [[BEAD, 9.2], [BEAD + 0.8, 10.2], [BEAD + 2.7, 10.9], [R - 6.8, HW], [R - 3.8, 10.7], [R - 1.8, 9.9], [R - 0.6, 8.8], [R, 7.4]];
const tyreSection = () => [...WALL.map(([r, a]) => [r, -a]), ...WALL.map(([r, a]) => [r, a]).reverse(), [BEAD, -9.2]];

/* ─────────────────────────────────────────────────────────── light that has a place */

const BARS = /* glsl */ `
  float bars(float x, float duty) {
    float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
    float q = fract(x);
    float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
    return mix(b, duty, smoothstep(0.12, 0.4, w));
  }`;
const sheathVertex = (flex) => /* glsl */ `
  attribute float aS; attribute float aRad; uniform float uMinPx;
  ${flex ? "attribute vec3 aPosL; attribute vec3 aPosR; attribute vec3 aNorL; attribute vec3 aNorR; uniform float uSteer;" : ""}
  varying float vS; varying vec3 vN; varying vec3 vV;
  void main() {
    vec3 p = position; vec3 n = normal;
    ${flex ? "float tl = max(uSteer, 0.0); float tr = max(-uSteer, 0.0); p += tl * (aPosL - position) + tr * (aPosR - position); n = normalize(n + tl * (aNorL - normal) + tr * (aNorR - normal));" : ""}
    vec4 c = modelViewMatrix * vec4(p, 1.0);
    float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
    vec4 mv = modelViewMatrix * vec4(p + n * max(aRad, uMinPx * cmPerPx), 1.0);
    vN = normalize(normalMatrix * n);
    vV = normalize(-mv.xyz);
    vS = aS;
    gl_Position = projectionMatrix * mv;
  }`;
const sheath = (flex, uniforms, body) =>
  new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms, vertexShader: sheathVertex(flex), fragmentShader: body });

/**
 * A brake line's light: a faint ink sheath at rest (the line reads as a line from afar); with pressure, veille as far
 * as `uHead`, and the head itself brighter while it runs (`uRun`).
 */
const pressureMaterial = (flex) =>
  sheath(flex, { uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() }, uBase: { value: 0.1 }, uLevel: { value: 0 }, uHead: { value: -10 }, uRun: { value: 0 }, uAmount: { value: 1 }, uMinPx: { value: 2.2 }, uSteer: { value: 0 } }, /* glsl */ `
    uniform vec3 uInk, uVeille; uniform float uBase, uLevel, uHead, uRun, uAmount;
    varying float vS; varying vec3 vN; varying vec3 vV;
    void main() {
      float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.15);
      float lit = 1.0 - smoothstep(uHead - 1.5, uHead, vS);
      float dh = (uHead - vS) / 6.0;
      float head = exp(-dh * dh) * (1.0 - smoothstep(uHead - 0.2, uHead + 1.2, vS)) * uRun;
      vec3 c = uInk * uBase + uVeille * (uLevel * lit * 0.9 + 1.5 * head);
      gl_FragColor = vec4(min(c, vec3(2.4)) * body * uAmount, 1.0);
    }`);
/** A sensor's wire: an ink line, and slow veille pulses running up it to the computer (s = 0 at the sensor). */
const wireMaterial = (flex) =>
  sheath(flex, { uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() }, uTime: { value: 0 }, uSense: { value: 0 }, uLit: { value: 0 }, uAmount: { value: 1 }, uMinPx: { value: 2.0 }, uSteer: { value: 0 } }, /* glsl */ `
    uniform vec3 uInk, uVeille; uniform float uTime, uSense, uLit, uAmount;
    varying float vS; varying vec3 vN; varying vec3 vV;
    ${BARS}
    void main() {
      float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.15);
      float x = (vS - uTime * ${PULSE.speed.toFixed(2)}) / ${PULSE.period.toFixed(2)};
      float pulse = bars(x, ${PULSE.duty.toFixed(2)});
      float q = fract(x);
      float headish = 0.45 + 0.55 * clamp(q / ${PULSE.duty.toFixed(2)}, 0.0, 1.0);
      vec3 c = uInk * (0.26 + 0.2 * uLit) + uVeille * (1.25 * pulse * headish * uSense + 0.35 * uLit);
      gl_FragColor = vec4(min(c, vec3(2.2)) * body * uAmount, 1.0);
    }`);

/** A ball of light with no edge (014's): a small hot heart, a soft body, a long tail. */
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
        gl_FragColor = vec4((uHeart * (core * 2.4) + uHue * (body + tail)) * uAmount, 1.0);
      }`,
  });
function makeBall(heart, hue, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ballMaterial(heart, hue));
  mesh.position.set(x, y, z);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  mesh.visible = false;
  return mesh;
}
const lightMesh = (geometry, material) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  return mesh;
};

/**
 * THE COMPARATOR's face, drawn in one shader (crisp at every size: everything is a distance, softened over a pixel).
 * uA where you steer (ink), uB where the car goes (uCar: veille or signal), both in radians, 0 = up, + = to the left
 * (anticlockwise, like the car's nose). The car's needle is drawn over yours: when they agree there is ONE needle,
 * veille. When they part, the sector between them lights in the car's colour (uGap).
 */
const dialMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: { uA: { value: 0 }, uB: { value: 0 }, uInk: { value: INK.clone() }, uCar: { value: VEILLE.clone() }, uVeille: { value: VEILLE.clone() }, uGap: { value: 0 }, uLit: { value: 0 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy / ${DIAL_R.toFixed(2)}; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uA, uB, uGap, uLit, uAmount; uniform vec3 uInk, uCar, uVeille; varying vec2 vP;
      // a tapered bar from the centre along angle a: its sides and its round tip softened over aa
      float needle(vec2 p, float a, float r1, float w0, float w1, float aa) {
        vec2 d = vec2(-sin(a), cos(a));
        float t = clamp(dot(p, d), 0.0, r1);
        float hw = mix(w0, w1, t / r1);
        return 1.0 - smoothstep(hw - aa, hw + aa, length(p - d * t));
      }
      void main() {
        vec2 p = vP;
        float r = length(p);
        float aa = max(max(fwidth(p.x), fwidth(p.y)) * 0.85, 1e-4);
        vec3 col = vec3(0.03, 0.033, 0.036) * (1.2 - 0.4 * clamp(r, 0.0, 1.0));
        // the sector between the two needles
        float th = atan(-p.x, p.y + 1e-6);
        float lo = min(uA, uB);
        float hi = max(uA, uB);
        float at = aa / max(r, 0.08);
        float inArc = smoothstep(lo - at, lo + at, th) * (1.0 - smoothstep(hi - at, hi + at, th));
        float band = smoothstep(0.24 - aa, 0.24 + aa, r) * (1.0 - smoothstep(0.86 - aa, 0.86 + aa, r));
        col = mix(col, uCar * 0.62, inArc * band * uGap);
        // its one mark: straight ahead
        col = mix(col, uInk * 0.5, needle(p - vec2(0.0, 0.86), 0.0, 0.1, 0.035, 0.035, aa));
        col = mix(col, uInk * 1.15, needle(p, uA, 0.8, 0.115, 0.075, aa));
        col = mix(col, uCar * 1.45, needle(p, uB, 0.8, 0.115, 0.075, aa));
        // named by the voice: a veille lip round the face
        col += uVeille * uLit * 0.35 * smoothstep(0.88, 1.0, r);
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });

/* ─────────────────────────────────────────────────────────── the system */

/**
 * → { root, A, parts, update(P, time, px) } (see the table of docs/025-decors.md). `root`: one rigid assembly in the
 * car's own frame; world.js stands it in the car or on the bench. `A`: anchors that follow their parts.
 */
export function buildSystem() {
  const root = new THREE.Group();
  const grp = (parent = root) => {
    const g = new THREE.Group();
    parent.add(g);
    return g;
  };
  const C = { rubber: 0x15181b, dark: 0x202428, iron: 0x3a4147, cast: 0x4a5158, mid: 0x6e757c, alu: 0x8b9299, fine: 0xa9b0b6, bright: 0xd4d9dd };
  /** A mesh of part `part`, hung in `group`; its material (and its edges' material) also into `bucket` (a lamp). */
  const put = (part, group, geo, mat, o = {}, bucket) => {
    const mesh = addMesh(part, geo, mat, o);
    group.add(mesh);
    if (bucket) {
      bucket.push(mat);
      for (const child of mesh.children) if (child.material?.isLineMaterial) bucket.push(child.material);
    }
    return mesh;
  };

  /* ── lamps: what lights up faintly veille when the voice names a part ── */
  const glowOf = (mat) => 0.11 * (1 - 0.85 * Math.min(1, 0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b));
  const lampOf = (mats, special = new Set(), strength = 1) => {
    const lines = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lines) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.glow = glowOf(mat);
    }
    return { solids, lines, special, strength, on: -1 };
  };
  const light = (lamp, k) => {
    if (lamp.on === k) return;
    lamp.on = k;
    k *= lamp.strength;
    for (const mat of lamp.solids) {
      if (!lamp.special.has(mat)) mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k);
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.7 * k);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };

  /* ══ THE FOUR CORNERS ══ */
  const corners = {};
  for (const k of KEYS) {
    const s = Math.sign(HUBS[k][0]);
    const part = makePart(k); // it steers about the vertical through its hub
    part.position.set(...HUBS[k]);
    root.add(part);
    const mirror = grp(part);
    mirror.scale.x = -s; // the left corner is drawn as 014's; the right one is its mirror
    const lampMats = [];
    const sensorMats = [];

    /* ── the tyre, of glass: on the bench only (in the car route.js draws the wheels) ── */
    const tyreG = grp(mirror);
    const tyreGlass = new THREE.Mesh(turnX(tyreSection(), 72, { crease: 34 }), glass(BRAND.ink, { base: 0.004, rim: 0.24, power: 2.6, edge: 0.5, spec: 0.3, through: 0.3 }));
    asShell(tyreGlass, 20);
    const tyreLines = [[R + 0.02, -7.4], [R + 0.02, 7.4], [BEAD + 1.2, -10.5], [BEAD + 1.2, 10.5]].map(([r, a]) => circle(r, a, { color: BRAND.ink, width: 2, opacity: 0.42 }));
    tyreG.add(tyreGlass, ...tyreLines);

    /* ── the disc: two machined faces, the vanes between them, the bell that bolts on the hub ── */
    const discSpin = grp(mirror);
    const discMat = solid(0xc0c6cb, { rough: 0.38, metal: 0.5, env: 1.4 });
    const D0 = A_DISC - DT;
    const D1 = A_DISC + DT;
    put(part, discSpin, turnX([[2.6, 2.4], [7.4, 2.4], [7.4, D0], [DISC.r, D0], [DISC.r, D0 + 0.8], [10.2, D0 + 0.8], [10.2, D1 - 0.8], [DISC.r, D1 - 0.8], [DISC.r, D1], [9.0, D1], [9.0, D0 + 0.8], [6.7, D0 + 0.8], [6.7, 3.1], [2.6, 3.1], [2.6, 2.4]], 96, { bevel: 0.07, round: 2 }), discMat, { edgeOpacity: 0.55 }, lampMats);
    const vanes = put(part, discSpin, mergeGeometries(Array.from({ length: 30 }, (_, i) => new THREE.BoxGeometry(1.0, 5.1, 0.55).translate(A_DISC, 12.8, 0).rotateX((i / 30) * Math.PI * 2))), solid(C.cast, { rough: 0.8, metal: 0.2 }), { edges: false });
    const blur = makePart(k + "Blur"); // what melts at speed: its own materials
    const vaneBlur = addMesh(blur, lyingX(new THREE.CylinderGeometry(DISC.r - 0.02, DISC.r - 0.02, 1.0, 72, 1, true)).translate(A_DISC, 0, 0), solid(0x343a40, { rough: 0.8, metal: 0.2, double: true }), { edges: false });
    discSpin.add(vaneBlur);

    /* ── the hub (it turns): flange and studs, and on it THE TOOTHED RING ── */
    const hubSpin = grp(mirror);
    {
      const steel = solid(C.mid, { rough: 0.5, metal: 0.45 });
      put(part, hubSpin, mergeGeometries([turnX([[0, 3.2], [5.8, 3.2], [5.8, 4.1], [2.7, 4.1], [2.7, 20.4], [0, 20.4]], 48, { bevel: 0.08, round: 2 }), ...Array.from({ length: 5 }, (_, i) => lyingX(cyl(0.5, 2.3, 0.08, 16)).translate(2.1, 4.2 * Math.cos((i / 5) * Math.PI * 2), 4.2 * Math.sin((i / 5) * Math.PI * 2)))]), steel, { edgeOpacity: 0.5 }, lampMats);
    }
    const a0 = A_RING - 0.9;
    const a1 = A_RING + 0.9;
    const foot = RING.r - 0.65;
    put(part, hubSpin, turnX([[2.7, a0 + 0.3], [foot - 0.65, a0 + 0.3], [foot - 0.65, a0], [foot, a0], [foot, a1], [foot - 0.65, a1], [foot - 0.65, a1 - 0.3], [2.7, a1 - 0.3], [2.7, a0 + 0.3]], 72, { bevel: 0.05, round: 2 }), solid(C.cast, { rough: 0.6, metal: 0.4 }), { edgeOpacity: 0.45 }, sensorMats);
    const tooth = box(1.8, 0.68, 0.44, 0.06, 1).translate(A_RING, RING.r - 0.34, 0);
    const teeth = put(part, hubSpin, mergeGeometries(Array.from({ length: RING.teeth }, (_, i) => tooth.clone().rotateX((i / RING.teeth) * Math.PI * 2))), solid(0xc6ccd1, { rough: 0.42, metal: 0.45 }), { edges: false }, sensorMats);
    const side = (a) => new THREE.RingGeometry(foot - 0.02, RING.r + 0.02, 72).rotateY(Math.PI / 2).translate(a, 0, 0);
    const toothBlur = addMesh(blur, mergeGeometries([lyingX(new THREE.CylinderGeometry(RING.r + 0.02, RING.r + 0.02, 1.84, 72, 1, true)).translate(A_RING, 0, 0), side(a0 - 0.02), side(a1 + 0.02)]), solid(0x7f868d, { rough: 0.5, metal: 0.4, double: true }), { edges: false });
    hubSpin.add(toothBlur);

    /* ── what does not turn: the hub carrier, and THE SPEED SENSOR on its bracket ── */
    const still = grp(mirror);
    {
      const iron = solid(C.iron, { rough: 0.85, metal: 0.2 });
      const web = [...arc(0, 13, 2.3, -30, 210), [-2.0, 9.5], [-4.6, 5.5], [-5.4, 1.5], [-5.6, -2.0], [-9.0, -3.6], ...arc(-11.5, -5.2, 1.5, 80, 280, 6), [-8.5, -6.6], [-5.0, -6.0], [-2.4, -9.0], ...arc(0, -12, 2.2, 160, 380), [2.4, -9.0], [5.2, -5.0], [5.8, -1.0], [7.6, 1.6], ...arc(8.8, 4.0, 1.5, -70, 150, 6), [5.2, 5.6], [2.0, 9.5]];
      put(part, still, mergeGeometries([slab(web, 2.0, 18.4, 0.2), turnX([[2.9, 15.4], [4.9, 15.4], [4.9, 16.0], [5.6, 16.0], [5.6, 16.8], [4.9, 16.8], [4.9, 19.6], [2.9, 19.6], [2.9, 15.4]], 48)]), iron, { edgeOpacity: 0.4 }, lampMats);
      put(part, still, mergeGeometries([box(4.2, 0.9, 3.0, 0.15).translate(A_RING + 1.2, 10.45, 0), hex(0.5, 0.4).translate(A_RING + 1.9, 11.1, 0)]), solid(C.mid, { rough: 0.55, metal: 0.4 }), { edgeOpacity: 0.45 }, lampMats);
      const body = solid(0x1b1e21, { rough: 0.6, coat: 0.3, coatRough: 0.5 });
      put(part, still, turnY([[0, TIP + 0.5], [0.72, TIP + 0.5], [0.72, 10.0], [1.15, 10.0], [1.15, 12.1], [0.6, 12.6], [0, 12.6]], 32).translate(A_RING, 0, 0), body, { edgeOpacity: 0.55 }, sensorMats);
      put(part, still, turnY([[0, TIP], [0.6, TIP], [0.6, TIP + 0.5], [0, TIP + 0.5]], 24, { bevel: 0.04, round: 1 }).translate(A_RING, 0, 0), solid(C.bright, { rough: 0.4, metal: 0.45 }), { edgeOpacity: 0.5 }, sensorMats);
      put(part, still, tube(bent([V(A_RING, 12.2, 0), V(A_RING, 13.0, 0), V(A_RING + 0.7, 13.9, 0.1), V(A_RING + 1.7, 14.6, 0.3)], 0.5, 5), 0.5, { radial: 10 }), body, { edges: false });
    }
    const senseBall = makeBall(VEILLE.clone().lerp(new THREE.Color(1, 1, 1), 0.4), VEILLE, A_RING, TIP - 0.1, 0);
    still.add(senseBall);

    /* ── the caliper (drawn on top of the disc, then turned back to the rear top quarter) and its two pads ── */
    const calRot = grp(mirror);
    calRot.rotation.x = CAL_TILT;
    {
      const cast = solid(0x687078, { rough: 0.72, metal: 0.3 });
      const frame = new THREE.Shape([[2.6, -6], [11.4, -6], [12.6, -4.8], [12.6, 4.8], [11.4, 6], [2.6, 6], [0.6, 4.0], [0.6, -4.0]].map(([x, y]) => new THREE.Vector2(x, y)));
      frame.holes.push(new THREE.Path([[4.4, -3.2], [3.6, -2.4], [3.6, 2.4], [4.4, 3.2], [8.2, 3.2], [9.0, 2.4], [9.0, -2.4], [8.2, -3.2]].map(([x, y]) => new THREE.Vector2(x, y))));
      put(part, calRot, mergeGeometries([
        slab([[-4.6, 16.4], [-6, 15.0], [-6, 10.9], [-5.5, 10.4], [-2.8, 10.4], [-2.3, 10.9], [-2.3, 13.4], [-1.7, 14.0], [1.7, 14.0], [2.3, 13.4], [2.3, 10.9], [2.8, 10.4], [5.5, 10.4], [6, 10.9], [6, 15.0], [4.6, 16.4]], 2.5, 2.4, 0.4),
        plate(frame, 2.6, { bevel: 0.45 }).rotateX(-Math.PI / 2).translate(0, 16.2, 0),
        box(3.0, 6.4, 12, 0.6).translate(11.1, 13.2, 0),
        lyingX(cyl(2.7, 0.9, 0.2, 40)).translate(12.9, 13.0, 0),
      ]), cast, { edgeOpacity: 0.5 }, lampMats);
      put(part, calRot, mergeGeometries([-6.7, 6.7].map((z) => lyingX(cyl(0.6, 6.4, 0.15, 20)).translate(9.4, 11.4, z))), solid(C.rubber, { rough: 0.95, env: 0.5 }), { edgeOpacity: 0.3 });
      put(part, calRot, mergeGeometries([lyingX(hex(0.75, 0.7)).translate(12.95, 14.6, -3.2), lyingX(cyl(0.72, 1.4, 0.1, 20)).translate(14.0, 14.6, -3.2), lyingX(cyl(0.32, 0.9, 0.06, 12)).translate(13.0, 15.4, 3.6)]), solid(C.fine, { rough: 0.45, metal: 0.45 }), { edgeOpacity: 0.45 }, lampMats);
    }
    const padOutG = grp(calRot);
    const padInG = grp(calRot);
    const liningMat = solid(0x1b1e21, { rough: 0.95, env: 0.4 });
    {
      const steel = solid(C.fine, { rough: 0.5, metal: 0.4 });
      const lining = box(1.0, 5.0, 10.6, 0.15);
      const shim = box(0.5, 5.6, 11.2, 0.12);
      put(part, padOutG, lining.clone().translate(D0 - 0.5, 12.9, 0), liningMat, { edgeOpacity: 0.5 });
      put(part, padOutG, shim.clone().translate(D0 - 1.25, 12.9, 0), steel, { edgeOpacity: 0.5 });
      put(part, padInG, lining.clone().translate(D1 + 0.5, 12.9, 0), liningMat, { edgeOpacity: 0.5 });
      put(part, padInG, shim.clone().translate(D1 + 1.25, 12.9, 0), steel, { edgeOpacity: 0.5 });
      put(part, padInG, lyingX(cyl(2.2, 1.6, 0.12, 32)).translate(D1 + 2.3, 13.0, 0), steel, { edgeOpacity: 0.4 });
    }
    // the brake that bites: a ball of veille light where the pads hold the disc
    const biteBall = makeBall(VEILLE.clone().lerp(new THREE.Color(1, 1, 1), 0.55), VEILLE, D0 - 1.4, 12.6, 0);
    calRot.add(biteBall);

    corners[k] = {
      k, part, front: k[0] === "F", spins: [discSpin, hubSpin], tyreG, tyreGlass, tyreLines, blur, vanes, vaneBlur, teeth, toothBlur,
      discMat, liningMat, padOutG, padInG, biteBall, senseBall,
      lamp: lampOf(lampMats, new Set([discMat])),
      sensorLamp: lampOf(sensorMats),
    };
    for (const line of tyreLines) part.userData.part.mats.add(line.material);
  }

  /* ══ THE ESP UNIT: the valve block, its four valves, the pump's motor ══ */
  const unit = makePart("unit");
  root.add(unit);
  const unitMats = [];
  const valves = {};
  {
    const alu = solid(C.bright, { rough: 0.5, metal: 0.4 });
    const fine = solid(C.fine, { rough: 0.45, metal: 0.45 });
    put(unit, unit, box(UNIT.w, UNIT.h, UNIT.d, 0.35, 3).translate(U.x, U.y, U.z), alu, { edgeOpacity: 0.6 }, unitMats);
    // the unions: the front-left line leaves by the face toward its wheel, the front-right by the other side, the rear two by the back
    put(unit, unit, mergeGeometries([
      lyingX(hex(0.85, 0.9)).translate(X0 - 0.45, 63, U.z + 1),
      lyingX(hex(0.85, 0.9)).translate(X1 + 0.45, 61, U.z - 1),
      lyingZ(hex(0.85, 0.9)).translate(U.x - 3, Y0 + 2.4, Z1 + 0.45),
      lyingZ(hex(0.85, 0.9)).translate(U.x + 3, Y0 + 2.4, Z1 + 0.45),
    ]), fine, { edgeOpacity: 0.5 }, unitMats);
    // its four valves, one per wheel, on the face the camera sees: they light with their line
    KEYS.forEach((k, i) => {
      const mat = solid(0x515860, { rough: 0.7, metal: 0.25 });
      put(unit, unit, mergeGeometries([lyingZ(cyl(1.25, 0.7, 0.12, 32)).translate(U.x - 4.5 + i * 3, Y1 - 2.7, Z1 + 0.35), lyingZ(cyl(0.55, 0.35, 0.06, 20)).translate(U.x - 4.5 + i * 3, Y1 - 2.7, Z1 + 0.85)]), mat, { edgeOpacity: 0.55 }, unitMats);
      valves[k] = mat;
    });
    // the pump's motor, hanging under it
    const can = solid(0x7d848b, { rough: 0.55, metal: 0.3 });
    const y0 = Y0 - MOTOR.h;
    put(unit, unit, turnY([[0, y0], [MOTOR.r - 0.5, y0], [MOTOR.r, y0 + 0.5], [MOTOR.r, y0 + 1.4], [MOTOR.r - 0.1, y0 + 1.5], [MOTOR.r - 0.1, y0 + 1.7], [MOTOR.r, y0 + 1.8], [MOTOR.r, Y0 - 0.9], [MOTOR.r + 0.6, Y0 - 0.9], [MOTOR.r + 0.6, Y0], [0, Y0]], 56, { bevel: 0.08, round: 2 }).translate(U.x, 0, U.z), can, { edgeOpacity: 0.5 }, unitMats);
    put(unit, unit, turnY([[0, y0 - 0.5], [2.5, y0 - 0.5], [2.5, y0 + 0.1], [0, y0 + 0.1]], 40).translate(U.x, 0, U.z), solid(C.dark, { rough: 0.7, coat: 0.2 }), { edgeOpacity: 0.5 }, unitMats);
  }
  const unitLamp = lampOf(unitMats, new Set(Object.values(valves)));

  /* ══ THE COMPUTER, clipped on top, and its COMPARATOR ══ */
  const ecu = makePart("ecu");
  root.add(ecu);
  const ecuMats = [];
  {
    const m = { box: solid(0x30353a, { rough: 0.85, env: 0.7 }), plug: solid(0x464d53, { rough: 0.8 }), seal: solid(C.iron, { rough: 0.92, env: 0.4 }) };
    const hw = E.w / 2;
    const hd = E.d / 2;
    // its footprint in (x, z), the (−x, +z) edge cut by a broad facet, stood up E.y1 − E.y0
    const outline = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw + E.cut, hd], [-hw, hd - E.cut]];
    const shell = plate(outline, E.y1 - E.y0, { bevel: 0.4 }).rotateX(Math.PI / 2).translate(E.x, E.y1, E.z);
    const ribs = Array.from({ length: 4 }, (_, i) => box(E.w - 7, 0.5, 0.7, 0.12, 1).translate(E.x + 3, E.y1 + 0.2, E.z - 4.5 + i * 2.2));
    put(ecu, ecu, mergeGeometries([shell, ...ribs]), m.box, { edgeOpacity: 0.6 }, ecuMats);
    put(ecu, ecu, box(UNIT.w - 0.5, 0.3, UNIT.d - 0.5, 0.1, 1).translate(U.x, Y1 + 0.15, U.z), m.seal, { edges: false });
    // its connector, on the +x face: the six wires plug in here
    put(ecu, ecu, mergeGeometries([box(2.4, 3.2, 8, 0.3).translate(E.x + hw + 1.2, PLUG.y, E.z), box(0.5, 2.2, 6.6, 0.15).translate(E.x + hw + 2.55, PLUG.y, E.z)]), m.plug, { edgeOpacity: 0.55 }, ecuMats);
  }
  // the comparator: on the facet, facing az −45
  const dialG = grp(ecu);
  dialG.position.set(FACET.x + FACET.n[0] * 0.05, E.yc, FACET.z + FACET.n[1] * 0.05);
  dialG.rotation.y = Math.atan2(FACET.n[0], FACET.n[1]);
  const dialMat = dialMaterial();
  const dialFace = new THREE.Mesh(new THREE.CircleGeometry(DIAL_R, 96), dialMat);
  dialFace.position.z = 0.02;
  dialG.add(dialFace);
  {
    const bezel = solid(C.fine, { rough: 0.45, metal: 0.4 });
    put(ecu, dialG, lyingZ(lathe([[DIAL_R - 0.05, -0.05], [DIAL_R + 0.75, -0.05], [DIAL_R + 0.75, 0.25], [DIAL_R + 0.45, 0.42], [DIAL_R - 0.05, 0.42], [DIAL_R - 0.05, -0.05]].map(([r, y]) => [r, y]), 96, { bevel: 0.08, round: 2 })), bezel, { edgeOpacity: 0.55 }, ecuMats);
    put(ecu, dialG, lyingZ(cyl(0.85, 0.5, 0.14, 32)).translate(0, 0, 0.3), solid(0x23272b, { rough: 0.6, coat: 0.3 }), { edgeOpacity: 0.6 });
  }
  const ecuLamp = lampOf(ecuMats, new Set(), 0.4); // a dark box tinted at full strength turns into a green brick

  /* ══ THE STEERING ANGLE SENSOR, on the column; on the bench, the wheel and its column of glass ══ */
  const sas = makePart("sas");
  sas.position.set(...SAS.at);
  sas.quaternion.copy(COL_Q);
  root.add(sas);
  const sasMats = [];
  const codeG = grp(sas);
  {
    const housing = solid(0x2a2f34, { rough: 0.75, coat: 0.25, coatRough: 0.5 });
    put(sas, sas, lyingZ(lathe([[2.3, -1.6], [SAS.r, -1.6], [SAS.r, 1.2], [SAS.r - 0.4, 1.6], [2.3, 1.6], [2.3, -1.6]], 72, { bevel: 0.15, round: 2 })), housing, { edgeOpacity: 0.6 }, sasMats);
    // the connector its wire leaves by, under it
    put(sas, sas, box(2.6, 1.8, 2.4, 0.25).translate(0, -SAS.r - 0.7, 0), housing, { edgeOpacity: 0.55 }, sasMats);
    // the column through it (in the car route.js draws the wheel; this short stub is the shaft the sensor reads)
    put(sas, sas, lyingZ(cyl(1.9, 10, 0.15, 40)), solid(C.mid, { rough: 0.5, metal: 0.4 }), { edgeOpacity: 0.45 });
    // the code disc, on the driver's face: six windows, it turns with the wheel
    const code = new THREE.Shape();
    code.absarc(0, 0, SAS.r - 0.7, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 2.2, 0, Math.PI * 2, true);
    code.holes.push(hole);
    for (let i = 0; i < 6; i++) {
      const w = new THREE.Path();
      w.absarc(3.35 * Math.cos((i / 6) * Math.PI * 2), 3.35 * Math.sin((i / 6) * Math.PI * 2), 0.62, 0, Math.PI * 2, true);
      code.holes.push(w);
    }
    put(sas, codeG, plate(code, 0.45, { bevel: 0.1 }).translate(0, 0, 1.65), solid(C.bright, { rough: 0.42, metal: 0.45 }), { edgeOpacity: 0.5 }, sasMats);
  }
  const sasLamp = lampOf(sasMats);

  const wheel = makePart("wheel"); // the bench's steering wheel and column: glass
  wheel.position.set(STEERING.x, STEERING.y, STEERING.z);
  wheel.quaternion.copy(COL_Q);
  root.add(wheel);
  const wheelSpin = grp(wheel);
  const wheelGlassMat = glass(BRAND.ink, { base: 0.004, rim: 0.26, power: 2.4, edge: 0.55, spec: 0.35, through: 0.3 });
  const wheelGlass = [
    new THREE.Mesh(new THREE.TorusGeometry(18.5, 1.7, 16, 72), wheelGlassMat),
    new THREE.Mesh(mergeGeometries([new THREE.CylinderGeometry(4.2, 4.2, 3.2, 40).rotateX(Math.PI / 2), ...[90, 210, 330].map((a) => new THREE.BoxGeometry(14.5, 2.4, 1.2).translate(10.8, 0, 0).rotateZ((a + 180) * DEG))]), wheelGlassMat),
  ];
  wheelSpin.add(...wheelGlass);
  const columnGlass = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 70, 24, 1, true).rotateX(Math.PI / 2).translate(0, 0, -36), wheelGlassMat);
  wheel.add(columnGlass);
  asShell([...wheelGlass, columnGlass], 20);
  const wheelRim = fatLine(Array.from({ length: 97 }, (_, i) => [18.5 * Math.cos((i / 96) * Math.PI * 2), 18.5 * Math.sin((i / 96) * Math.PI * 2), 0]), { color: BRAND.ink, width: 2, opacity: 0.4 });
  wheelSpin.add(wheelRim);
  wheel.userData.part.mats.add(wheelRim.material);

  /* ══ THE YAW RATE SENSOR, on the tunnel ══ */
  const yaws = makePart("yaws");
  root.add(yaws);
  const yawMats = [];
  {
    const [x, y, z] = YAWS.at;
    put(yaws, yaws, box(YB.w + 3, 0.6, YB.d + 3, 0.2).translate(x, y - YB.h / 2 - 0.3, z), solid(C.iron, { rough: 0.85, metal: 0.2 }), { edgeOpacity: 0.45 }, yawMats);
    put(yaws, yaws, box(YB.w, YB.h, YB.d, 0.5, 3).translate(x, y, z), solid(0x2c3136, { rough: 0.7, coat: 0.25, coatRough: 0.5 }), { edgeOpacity: 0.6 }, yawMats);
    // what it measures, embossed on its lid: a turn
    const turnArrow = mergeGeometries([
      new THREE.TorusGeometry(2.6, 0.42, 10, 48, Math.PI * 1.45).rotateZ(Math.PI * 0.05).rotateX(-Math.PI / 2),
      new THREE.ConeGeometry(0.95, 1.7, 20).rotateZ(-Math.PI / 2).translate(0.7, 0, 2.6), // the arc ends at (0, 0, 2.6), running toward +x
    ]).translate(x, y + YB.h / 2 + 0.25, z);
    put(yaws, yaws, turnArrow, solid(C.bright, { rough: 0.42, metal: 0.45 }), { edges: false }, yawMats);
    put(yaws, yaws, box(3, 1.6, 1.6, 0.2).translate(x, y - 0.4, z - YB.d / 2 - 0.8), solid(0x464d53, { rough: 0.8 }), { edgeOpacity: 0.5 }, yawMats);
  }
  const yawLamp = lampOf(yawMats);

  /* ══ THE LINES: four brake lines (block → caliper), six wires (sensor → computer) ══ */
  const lines = makePart("lines");
  root.add(lines);
  const pipeMat = solid(0x5d646b, { rough: 0.5, metal: 0.4 });
  const bj = Object.fromEntries(KEYS.map((k) => [k, onCorner(k, BANJO)]));
  const toward = (k, p, by) => V(p.x - Math.sign(HUBS[k][0]) * by, p.y, p.z); // `by` cm inboard of p
  const BRAKE = {
    FL: [V(X0, 63, U.z + 1), V(X0 - 2.7, 63, U.z + 1), V(-62, 57, -134), toward("FL", bj.FL, 2.3), bj.FL],
    FR: [V(X1, 61, U.z - 1), V(X1 + 2.7, 61, U.z - 1), V(-30, 59, -141), V(0, 58, -150), V(50, 56, -150), toward("FR", bj.FR, 2.3), bj.FR],
    RL: [V(U.x - 3, Y0 + 2.4, Z1), V(U.x - 3, Y0 + 2.4, Z1 + 2.7), V(-50, 40, -116), V(-30, 24, -100), V(-30, 22, 110), V(-55, 40, 145), toward("RL", bj.RL, 2.3), bj.RL],
    RR: [V(U.x + 3, Y0 + 2.4, Z1), V(U.x + 3, Y0 + 2.4, Z1 + 2.7), V(-40, 40, -114), V(30, 24, -100), V(30, 22, 110), V(55, 40, 145), toward("RR", bj.RR, 2.3), bj.RR],
  };
  const pressure = {};
  for (const k of KEYS) {
    const path = pathOf(BRAKE[k], 4, 0.8);
    const run = runOf(path);
    const L = run.at(-1);
    const front = k[0] === "F";
    const weights = run.map((s) => (front ? smooth(ramp(s, L - 38, L - 1.2)) : 0));
    const solidLine = put(lines, lines, front ? flexTube(path, weights, 0.45, { radial: 10 }, k) : tube(path, 0.45, { radial: 10 }), pipeMat, { edges: false });
    solidLine.frustumCulled = false;
    const mat = pressureMaterial(front);
    lines.add(lightMesh(front ? flexTube(path, weights, 0.62, { radial: 10, onPath: true }, k) : tube(path, 0.62, { radial: 10, onPath: true }), mat));
    pressure[k] = { mesh: solidLine, mat, L, front };
  }
  const plugAt = (i) => [V(PLUG.x + 2.6, PLUG.y, PLUG.z - 3 + i * 1.2), V(PLUG.x, PLUG.y, PLUG.z - 3 + i * 1.2)];
  const boot = Object.fromEntries(KEYS.map((k) => [k, onCorner(k, BOOT)]));
  const sasPlug = onColumn(SAS.at, 0, -SAS.r - 1.6, 0);
  const WIRES = {
    FL: [boot.FL, V(boot.FL.x + 1.8, 51.5, -143.6), V(-58, 52, -140), V(-44, 50, -138), V(-36, 57, -133), V(-37.4, 70, -129), ...plugAt(0)],
    FR: [boot.FR, V(boot.FR.x - 1.8, 51.5, -143.6), V(56, 60, -142), V(0, 63, -143), V(-34, 67, -134), ...plugAt(1)],
    RL: [boot.RL, V(-58, 44, 138), V(-36, 27, 112), V(-36, 27, -92), V(-36, 50, -112), V(-37, 66, -124), ...plugAt(2)],
    RR: [boot.RR, V(58, 44, 138), V(36, 27, 112), V(36, 27, -92), V(-20, 46, -112), V(-34, 65, -124), ...plugAt(3)],
    yaws: [V(YAWS.at[0], YAWS.at[1] - 0.4, YAWS.at[2] - YB.d / 2 - 1.6), V(0, 30, -22), V(-12, 28, -60), V(-30, 40, -100), V(-36, 62, -121), ...plugAt(4)],
    sas: [sasPlug, onColumn(SAS.at, 0, -SAS.r - 5, 1.5), V(-37, 77, -80), V(-37, 74, -110), V(-36.5, PLUG.y, -122), ...plugAt(5)],
  };
  const wires = {};
  for (const [name, points] of Object.entries(WIRES)) {
    const path = pathOf(points, 3, 0.8);
    const run = runOf(path);
    const front = name === "FL" || name === "FR";
    const weights = run.map((s) => (front ? 1 - smooth(ramp(s, 0.6, 18)) : 0));
    const mat = wireMaterial(front);
    lines.add(lightMesh(front ? flexTube(path, weights, 0.3, { radial: 8, onPath: true }, name) : tube(path, 0.3, { radial: 8, onPath: true }), mat));
    wires[name] = mat;
  }
  const wireList = Object.entries(wires).map(([name, mat]) => ({ name, mat, flex: name === "FL" || name === "FR" }));

  /* ══ THE BENCH: two dark posts, under the unit's motor and under the yaw sensor ══ */
  const stand = makePart("stand");
  root.add(stand);
  {
    const footMat = solid(0x1f2327, { rough: 0.95, env: 0.3 });
    const under = Y0 - MOTOR.h - 0.5;
    const yawUnder = YAWS.at[1] - YB.h / 2 - 0.6;
    const post = (top, r) => turnY([[0, 0], [r + 3, 0], [r + 3, 0.4], [r + 0.4, 1.2], [r, 2.2], [r, top - 1.4], [r + 1.6, top - 0.6], [r + 1.6, top], [0, top]], 40);
    put(stand, stand, mergeGeometries([post(under, 0.8).translate(U.x, 0, U.z), post(yawUnder, 0.9).translate(YAWS.at[0], 0, YAWS.at[2])]), footMat, { edgeOpacity: 0.3 });
  }

  /* ── anchors ── */
  const A = {};
  for (const k of KEYS) {
    const calRot = corners[k].padOutG.parent;
    A[k] = anchor(calRot, 0.6, 13.4, 0);
  }
  A.unit = anchor(unit, U.x, U.y, Z1);
  A.ecu = anchor(ecu, E.x, E.y1, E.z);
  A.dial = anchor(dialG, 0, 0, 0.3);
  A.sas = anchor(sas, 0, 0, 0);
  A.yaws = anchor(yaws, YAWS.at[0], YAWS.at[1] + YB.h / 2, YAWS.at[2]);
  A.centre = anchor(root, ...SYSTEM.centre);

  const home = { sas: V(...SAS.at), wheel: V(STEERING.x, STEERING.y, STEERING.z) };
  const dialCar = new THREE.Color();

  return {
    root, A,
    parts: { FL: corners.FL.part, FR: corners.FR.part, RL: corners.RL.part, RR: corners.RR.part, unit, ecu, sas, yaws, wheel },
    update(P = {}, time = 0) {
      const bench = (P.bench ?? 0) > 0.5;
      const k = clamp01(P.explode ?? 0);
      const whole = 1 - smooth(ramp(k, 0, 0.18)); // what only makes sense assembled leaves first
      const steer = Math.max(-1, Math.min(1, P.steer ?? 0));
      const sense = clamp01(P.sense ?? 0);
      const melt = bench ? 0 : smooth(ramp(P.kmh ?? 0, 3, 14)); // in the car the vanes and teeth turn too fast to be counted
      const turn = -(P.rolled ?? 0) * SPIN;
      const litCorners = clamp01(P.litCorners ?? 0);
      const litFR = clamp01(P.litFR ?? 0);
      const litWheels = clamp01(P.litWheels ?? 0);

      /* ── the four corners */
      const out = settle(ramp(k, 0.25, 0.95));
      for (const key of KEYS) {
        const c = corners[key];
        const [hx, hy, hz] = HUBS[key];
        c.part.position.set(hx + Math.sign(hx) * OUT.x * out, hy, hz + (c.front ? -OUT.z : OUT.z) * out);
        c.part.rotation.y = c.front ? steer * STEER : 0;
        for (const g of c.spins) g.rotation.x = turn;
        c.tyreG.visible = bench;
        c.tyreGlass.material.uniforms.uAmount.value = c.part.userData.part.opacity;
        setPartOpacity(c.blur, melt * c.part.userData.part.opacity);
        c.vaneBlur.visible = c.toothBlur.visible = melt > 0.004;
        c.vanes.visible = c.teeth.visible = melt < 0.995;
        // the brake: the pressure runs its line (0 → 0.5), the pads bite (0.45 → 0.75), the disc goes veille (0.55 → 1)
        const b = clamp01(P[BRAKE_OF[key]] ?? 0);
        const grip = smooth(ramp(b, 0.45, 0.75));
        const heat = smooth(ramp(b, 0.55, 1));
        const off = GAP * (1 - grip);
        c.padOutG.position.x = -off;
        c.padInG.position.x = off;
        const lc = Math.max(litCorners, key === "FR" ? litFR : 0, heat * 0.6);
        light(c.lamp, lc);
        c.discMat.color.copy(c.discMat.userData.rest).lerp(c.discMat.userData.tint, 0.7 * lc);
        c.discMat.emissive.copy(VEILLE).multiplyScalar(c.discMat.userData.glow * lc + 0.3 * heat);
        c.liningMat.emissive.copy(VEILLE).multiplyScalar(0.5 * heat);
        c.biteBall.visible = heat > 0.004;
        c.biteBall.material.uniforms.uRadius.value = 6 + 3 * heat;
        c.biteBall.material.uniforms.uMinPx.value = 48 * heat; // it must still say « this one » from VIEW.top, 19 m up
        c.biteBall.material.uniforms.uAmount.value = 0.65 * heat * heat;
        light(c.sensorLamp, litWheels);
        c.senseBall.visible = sense * whole > 0.004;
        c.senseBall.material.uniforms.uRadius.value = 1.6;
        c.senseBall.material.uniforms.uMinPx.value = 6;
        c.senseBall.material.uniforms.uAmount.value = (0.3 + 0.4 * litWheels) * sense * whole;
        // its line
        const line = pressure[key];
        line.mat.uniforms.uLevel.value = 0.85 * smooth(ramp(b, 0, 0.1));
        line.mat.uniforms.uHead.value = (line.L + 2) * ramp(b, 0.02, 0.5) + (b >= 0.5 ? 1e3 : 0) - 2;
        line.mat.uniforms.uRun.value = smooth(ramp(b, 0.0, 0.04)) * (1 - smooth(ramp(b, 0.42, 0.56)));
        line.mat.uniforms.uAmount.value = whole;
        if (line.front) {
          line.mat.uniforms.uSteer.value = steer;
          line.mesh.morphTargetInfluences[0] = Math.max(steer, 0);
          line.mesh.morphTargetInfluences[1] = Math.max(-steer, 0);
        }
        valves[key].emissive.copy(VEILLE).multiplyScalar(0.9 * smooth(ramp(b, 0, 0.12)));
      }

      /* ── the wires */
      for (const { name, mat, flex } of wireList) {
        mat.uniforms.uTime.value = time;
        mat.uniforms.uSense.value = sense;
        mat.uniforms.uAmount.value = whole;
        mat.uniforms.uLit.value = name === "sas" ? clamp01(P.litSteer ?? 0) : name === "yaws" ? clamp01(P.litYaw ?? 0) : litWheels;
        if (flex) mat.uniforms.uSteer.value = steer;
      }
      setPartOpacity(lines, whole);

      /* ── the unit, the computer, the comparator */
      unit.position.y = LIFT.unit * settle(ramp(k, 0.1, 0.72));
      ecu.position.y = LIFT.ecu * settle(ramp(k, 0.15, 0.8));
      light(unitLamp, 0);
      const litEcu = clamp01(P.litEcu ?? 0);
      light(ecuLamp, litEcu);
      const a = Math.max(-NEEDLE.stop, Math.min(NEEDLE.stop, (P.aim ?? 0) * NEEDLE.gain * DEG));
      const y = Math.max(-NEEDLE.stop, Math.min(NEEDLE.stop, (P.yaw ?? 0) * NEEDLE.gain * DEG));
      const alarm = clamp01(P.alarm ?? 0);
      dialCar.copy(VEILLE).lerp(SIGNAL, alarm);
      dialMat.uniforms.uA.value = a;
      dialMat.uniforms.uB.value = y;
      dialMat.uniforms.uCar.value.copy(dialCar);
      dialMat.uniforms.uGap.value = smooth(ramp(Math.abs(a - y), 2 * DEG, 9 * DEG));
      dialMat.uniforms.uLit.value = litEcu;
      dialMat.uniforms.uAmount.value = ecu.userData.part.opacity;

      /* ── the steering: the sensor's code disc and, on the bench, the wheel of glass */
      const wheelAngle = steer * WHEEL_TURN;
      codeG.rotation.z = wheelAngle;
      wheelSpin.rotation.z = wheelAngle;
      light(sasLamp, Math.max(clamp01(P.litSteer ?? 0), 0.3 * Math.abs(steer)));
      sas.position.copy(home.sas).y += LIFT.sas * settle(ramp(k, 0.05, 0.7));
      wheel.position.copy(home.wheel).y += LIFT.wheel * settle(ramp(k, 0.05, 0.7));
      wheel.visible = bench;
      wheelGlassMat.uniforms.uAmount.value = bench ? wheel.userData.part.opacity : 0;
      wheelRim.material.color.copy(INK).lerp(VEILLE, 0.5 * clamp01(P.litSteer ?? 0));

      /* ── the yaw sensor */
      yaws.position.y = LIFT.yaws * settle(ramp(k, 0.2, 0.85));
      light(yawLamp, clamp01(P.litYaw ?? 0));

      /* ── the bench's posts */
      stand.visible = bench && whole > 0.004;
      if (stand.visible) setPartOpacity(stand, whole);
    },
  };
}
