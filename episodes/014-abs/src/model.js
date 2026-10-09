// DOSSIER 014 — ABS : the system. Everything that stands between your foot and the front-left tyre, as ONE rigid
// assembly at its true places in the car (plan.js: the root's origin is the car's, its nose toward −z):
//   · THE WHEEL CORNER (it steers about the vertical through HUB): the tyre and its painted mark, a rim with five thick
//     spokes, and through them the brake — a ventilated disc, a caliper on its rear top quarter, two pads. Behind the
//     disc, on the hub: the toothed ring; a breath above its teeth, the sensor; behind them the hub carrier.
//   · THE ABS UNIT, a totem: the computer (a black box and its connector) on top, the valve block (machined aluminium,
//     the clearest piece of the film) in the middle, the pump's motor hanging under it. Under the X-ray the block is
//     glass and its circuit reads like a diagram, all in one plane facing +z:
//         foot ──► feed gallery ──►[INLET valve]──┐ drop
//              ▲ riser                             ▼
//              │            wheel ◄── wheel gallery ══╪══ (the OUTLET valve's needle shuts a hole in its floor)
//              └──[PUMP piston]◄── bottom gallery ◄───┴── drain ──► accumulator (a piston on a spring)
//   · THE PEDAL BOX: the pedal on its pivot, its push rod, the servo's drum, the master cylinder and its reservoir.
//   · THE LINES: foot → unit (a hard line), unit → caliper (a rubber hose that follows the steering), and the sensor's
//     wire up to the computer's connector.
// Three values of grey: rubber and cast iron dark, the rim and the steel in between, what is machined clear. Light:
// INK is the brake fluid (its pressure fills a line, its flow runs in dashes), VEILLE the system alive (the sensor's
// pulses, an energised coil, the part the voice names), SIGNAL the locked brake.
// Liberties taken to be read in one frame (docs/journal/014-model.md): the pads' stroke is 7 mm a side, the ring
// stands OUTBOARD of the hub carrier (it shows as soon as the disc is off), the valves gate their galleries like
// needles, the pump is one piston in line, lines and wire are three times their true gauge.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, setGlow, glass, asShell, edgesOf, fatLine, makePart, addMesh, setPartOpacity, anchor, box, cyl, lathe, plate, mergeGeometries } from "@kit/build3d.js";
import { HUB, TYRE, DISC, CALIPER, RING, PEDAL, pedalPad, MASTER, UNIT, SYSTEM } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.86, 0.62);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);
/** Out between a0 and a1, held, back between b0 and b1: the side-step a part takes to let another one pass. */
const trap = (k, a0, a1, b0, b1) => smooth(ramp(k, a0, a1)) * (1 - smooth(ramp(k, b0, b1)));

/* ─────────────────────────────────────────────────────────── where everything is */

const [HX, HY, HZ] = HUB;
const R = TYRE.r;
const BEAD = TYRE.rim;
const HW = TYRE.w / 2;
/** Full lock, in radians (`steer` ±1). */
export const STEER = 28 * DEG;
const SPIN = 100 / R; // radians a metre rolled
// In the corner's own frame the first coordinate is `a`: how far INBOARD of the wheel's mid-plane (the car's +x).
const A_DISC = DISC.x - HX; // the disc's mid-plane
const DT = DISC.thick / 2;
const A_RING = RING.x - HX;
const TIP = RING.r + 0.18; // the sensor's tip, a breath above the teeth
/** How far each pad stands off the disc with no pressure. A millimetre in a real brake: seven here, to be seen. */
export const GAP = 0.7;
// the caliper is drawn standing on top of the disc, then turned back to its place: the rear top quarter
const CAL_TILT = Math.PI / 2 - Math.atan2(CALIPER.at[1] - HY, CALIPER.at[2] - HZ);
const calPoint = (a, y, z) => V(HX + a, HY + y * Math.cos(CAL_TILT) - z * Math.sin(CAL_TILT), HZ + y * Math.sin(CAL_TILT) + z * Math.cos(CAL_TILT));
const BANJO = calPoint(14.7, 14.6, -3.2); // where the hose ends, on the caliper's inboard face

// the unit: the block, and the plane of its circuit
const U = { x: UNIT.at[0], y: UNIT.at[1], z: UNIT.at[2] };
const X0 = U.x - UNIT.w / 2; // the face toward the wheel
const X1 = U.x + UNIT.w / 2; // the face toward your foot
const Y0 = U.y - UNIT.h / 2;
const Y1 = U.y + UNIT.h / 2;
const ZF = U.z + UNIT.d / 2; // the face the camera reads the circuit through
const ZC = U.z + 1; // the circuit's plane
const XI = X1 - 3.4; // the inlet valve's axis
const XO = X0 + 4.9; // the outlet valve's
const XR = X1 - 1.2; // the riser the pump sends the fluid back up
const YF = Y1 - 4.3; // the feed gallery
const YW = Y1 - 7.1; // the wheel gallery
const YB = Y0 + 1.3; // the bottom gallery: accumulator, pump
/** The stroke of a valve's needle. */
export const STROKE = 0.7;
const SEAT_IN = YF - 0.75; // where the inlet's needle shuts: the mouth of the drop
const SEAT_OUT = YW - 0.45; // where the outlet's does: a hole in the wheel gallery's floor
const COIL = { y0: Y1 - 3.0, y1: Y1 - 0.4, r: 1.3 };
const ACC = { mouth: XO - 0.9, end: X0 + 0.4, r: 0.85, travel: 1.2 };
const PUMP = { x: XO + 3.3, e: 0.35, rate: 20 }; // the piston's place, its half stroke, radians a second
const ECU_H = 3.8;
const MOTOR = { r: 3.4, h: 6.9 };

// the pedal box
const [MX, MY] = MASTER.servo;
const PV = PEDAL.pivot;
const PAD_N = [0.419, 0.908]; // the pad's face looks back and up at your foot: (y, z)
const PAD_TILT = -Math.atan2(PAD_N[0], PAD_N[1]);
const armTo = (pad, out = {}) => {
  const y = pad[1] - 1.5 * PAD_N[0] - PV[1];
  const z = pad[2] - 1.5 * PAD_N[1] - PV[2];
  out.len = Math.hypot(y, z);
  out.turn = Math.atan2(-z, -y);
  return out;
};
const ARM0 = armTo(PEDAL.pad);
const CLEVIS = 6.6; // the push rod leaves the lever this far under the pivot
const ROD_TO = [MY, -93.4]; // …and aims at the middle of the servo's back: (y, z)
const PORT = V(MX - 2.6, MY, -117); // the master cylinder's outlet, on its flank

// The exploded view. Two tiers, each a row across a camera filming toward az −44 and centred over the bench's
// origin: below, the wheel corner at axle height — tyre · rim · ring and sensor · disc · caliper and pads; above
// them, lifted, the hydraulics — the unit (computer up, valves up, pump and motor down) · the pedal box.
// `s`: where a part's centre stands along the row (cm, + to the right of the picture).
const ROW_AZ = -44 * DEG;
const ROW = { x: Math.cos(ROW_AZ), z: -Math.sin(ROW_AZ), cx: -SYSTEM.bench[0], cz: -SYSTEM.bench[2] };
const slot = (x, z, s, lift = 0) => [ROW.cx + s * ROW.x - x, lift, ROW.cz + s * ROW.z - z];
const OPEN = {
  rim: slot(HX, HZ, -4.25),
  tyre: -70, //                    …and the tyre is pulled straight off the rim, toward the eye
  hub: slot(HX + A_RING, HZ, 28.95),
  disc: slot(HX + A_DISC, HZ, 52.25),
  cal: slot(CALIPER.at[0], CALIPER.at[2], 77.85),
  unit: slot(U.x, U.z, 14, 20),
  pedal: slot(MX, -94.5, 52, 22),
  ecu: 9.2, valves: 8.4, motor: -6, pump: -4.2, pads: -6,
};
// side-steps, so that nothing goes through anything: the wheel comes off outboard, the caliper lifts off the disc,
// the disc leaves the hub and overtakes it on the camera's side
const STEP = { rim: [-15, 0, 0], cal: [0, 9 * Math.cos(CAL_TILT), 9 * Math.sin(CAL_TILT)], disc: [-4, 0, 22] };

const DASH = { period: 1.7, duty: 0.55, speed: 5.2 }; // cm, cm/s: 0.17 cm a frame, a tenth of a period — it runs, it does not strobe
const PULSE = { period: 1.5, duty: 0.42, speed: 5.5 };

/* ─────────────────────────────────────────────────────────── geometry */

const lyingZ = (g) => g.rotateX(Math.PI / 2); // a lathe's axis (y) laid along +z
const lyingX = (g) => g.rotateZ(-Math.PI / 2); // …along +x
/** A lathe written [radius, a] round the axle. Profiles run anticlockwise in (radius, a): the kit's lathe then faces outward. */
const turnX = (profile, segments = 64, o = { bevel: 0.08, round: 2 }) => lyingX(lathe(profile, segments, o));
const turnY = (profile, segments = 48, o = { bevel: 0.05, round: 2 }) => lathe(profile, segments, o);
const turnZ = (profile, segments = 64, o = { bevel: 0.1, round: 2 }) => lyingZ(lathe(profile, segments, o));
const ringOf = (r0, r1, a, b) => [[r0, a], [r1, a], [r1, b], [r0, b], [r0, a]];
const hex = (r, h, bevel = 0.07) => cyl(r, h, bevel, 6);
/** A flat piece drawn in (z, y), `t` thick along the axle, its inboard face at `a`. */
const slab = (outline, t, a, bevel = 0.15) => plate(outline, t, { bevel }).rotateY(-Math.PI / 2).translate(a, 0, 0);
const arc = (cx, cy, r, from, to, n = 8) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((from + ((to - from) * i) / n) * DEG), cy + r * Math.sin((from + ((to - from) * i) / n) * DEG)]);

/** A polyline with its corners rounded, the way a pipe is bent. `cut`: how far each corner is cut back. */
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
/** No stretch of a polyline longer than `stride`. */
function resampled(points, stride = 0.3) {
  const out = [points[0].clone()];
  for (let i = 1; i < points.length; i++) {
    const n = Math.max(1, Math.ceil(points[i].distanceTo(points[i - 1]) / stride));
    for (let j = 1; j <= n; j++) out.push(points[i - 1].clone().lerp(points[i], j / n));
  }
  return out;
}
const pathOf = (points, cut, stride) => resampled(bent(points, cut), stride);
/** The length run at each point of a polyline. */
const runOf = (points) => points.reduce((run, p, i) => (run.push(i ? run[i - 1] + p.distanceTo(points[i - 1]) : 0), run), []);

/**
 * A round swept through `points` (its frame carried from one to the next: no twist at a bend). `radii`: one number, or
 * one per point. It carries `aS`, the length run since the first point (plus `s0`), and `aRad`. `onPath`: the vertices
 * are left ON the path — the shader pushes them out by their radius, or by a few pixels if that is more.
 */
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

/** A path turned with the wheel: each point about the vertical through the hub, by `angle` × its own weight. */
const steered = (points, weights, angle) =>
  points.map((p, i) => {
    const a = angle * weights[i];
    const c = Math.cos(a);
    const s = Math.sin(a);
    return V(HX + (p.x - HX) * c + (p.z - HZ) * s, p.y, HZ - (p.x - HX) * s + (p.z - HZ) * c);
  });
/**
 * A hose, a wire: the same tube at full left lock, straight ahead and full right. Solid (`onPath` false) it morphs
 * between the three; as a sheath of light it carries the two other shapes as attributes (see sheathVertex).
 */
function flexTube(points, weights, radii, o) {
  const geo = tube(points, radii, o);
  const left = tube(steered(points, weights, STEER), radii, o);
  const right = tube(steered(points, weights, -STEER), radii, o);
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

/** A spring lying along x, from `x0` to `x1`. Same wire, same turns whatever its length: two of them morph. */
function helixX(x0, x1, cy, cz, r, wire, turns) {
  const n = turns * 28;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const th = t * turns * Math.PI * 2;
    pts.push(V(x0 + (x1 - x0) * t, cy + r * Math.cos(th), cz + r * Math.sin(th)));
  }
  return tube(pts, wire, { radial: 8 });
}

/** A circle round the axle, as a fine line. */
function circle(r, a, o) {
  const pts = [];
  for (let i = 0; i <= 96; i++) pts.push([a, r * Math.cos((i / 96) * Math.PI * 2), r * Math.sin((i / 96) * Math.PI * 2)]);
  return fatLine(pts, o);
}

// the tyre's section: [radius, a], from the outboard bead round to the inboard one
const WALL = [[BEAD, 9.2], [BEAD + 0.8, 10.2], [BEAD + 2.7, 10.9], [R - 6.8, HW], [R - 3.8, 10.7], [R - 1.8, 9.9], [R - 0.6, 8.8], [R, 7.4]];
const groove = (a) => [[R, a - 0.8], [R - 0.6, a - 0.5], [R - 0.6, a + 0.5], [R, a + 0.8]]; // they run round the tyre: turning, they do not move
const tyreSection = (tread) => [...WALL.map(([r, a]) => [r, -a]), ...tread, ...WALL.map(([r, a]) => [r, a]).reverse(), [BEAD, -9.2]];
// its mark: a band of paint from the outboard wall, over the shoulder, across the tread
const MARK = [[R - 9, -HW - 0.1], [R - 6.8, -HW - 0.1], [R - 3.8, -10.8], [R - 1.75, -9.98], [R - 0.53, -8.86], [R + 0.08, -7.4], [R + 0.08, 7.4], [R - 0.53, 8.86], [R - 1.75, 9.98], [R - 3, 10.5]];

/** Five thick spokes round a centre: the outline, drawn in the wheel's plane. */
function star() {
  const pts = [];
  const hubR = 7.6;
  const tipR = 20;
  const b0 = Math.asin(3.0 / hubR);
  const b1 = Math.asin(2.3 / tipR);
  for (let k = 0; k < 5; k++) {
    const th = (k / 5) * Math.PI * 2 + Math.PI / 2;
    const prev = th - (Math.PI * 2) / 5;
    for (let i = 1; i < 6; i++) {
      const a = prev + b0 + (th - prev - 2 * b0) * (i / 6);
      pts.push([hubR * Math.cos(a), hubR * Math.sin(a)]);
    }
    pts.push([hubR * Math.cos(th - b0), hubR * Math.sin(th - b0)], [tipR * Math.cos(th - b1), tipR * Math.sin(th - b1)], [tipR * Math.cos(th + b1), tipR * Math.sin(th + b1)], [hubR * Math.cos(th + b0), hubR * Math.sin(th + b0)]);
  }
  return pts;
}

/* ─────────────────────────────────────────────────────────── light that has a place */

const BARS = /* glsl */ `
  // bars of light, their ends softened over what a pixel covers — and melted into their mean once too small to count
  float bars(float x, float duty) {
    float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
    float q = fract(x);
    float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
    return mix(b, duty, smoothstep(0.12, 0.4, w));
  }`;
/** A sheath of light round a line: never thinner than `uMinPx`. `flex`: it follows the steering, like the hose it lies on. */
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

/**
 * The brake fluid in one branch of the circuit, as a sheath of ink light (s = 0 where the branch starts).
 *   uBase    the bore itself, faintly: the circuit reads as a map before anything is pressed
 *   uLevel   the pressure: how bright the branch is, as far as `uHead` (a front that runs down the line)
 *   uRun     the flow: dashes that run toward the end of the branch (> 0) or back to its start (< 0), between uFrom and uTo
 *   uGate    what passes the valve standing on the first `uGateTo` centimetres (0: the light stops there)
 */
function fluid() {
  const uniforms = {
    uColor: { value: INK.clone() }, uTime: { value: 0 }, uBase: { value: 0.07 }, uLevel: { value: 0 }, uHead: { value: 1e4 }, uRun: { value: 0 },
    uFrom: { value: -10 }, uTo: { value: 1e4 }, uGate: { value: 1 }, uGateTo: { value: -10 }, uAmount: { value: 1 }, uMinPx: { value: 2.4 }, uSteer: { value: 0 },
  };
  const make = (flex) =>
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms,
      vertexShader: sheathVertex(flex),
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uTime, uBase, uLevel, uHead, uRun, uFrom, uTo, uGate, uGateTo, uAmount;
        varying float vS; varying vec3 vN; varying vec3 vV;
        ${BARS}
        void main() {
          float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.15);
          float lit = 1.0 - smoothstep(uHead - 0.9, uHead, vS);
          float way = uRun < 0.0 ? -1.0 : 1.0;
          float dash = bars((vS * way - uTime * ${DASH.speed.toFixed(2)}) / ${DASH.period.toFixed(2)}, ${DASH.duty.toFixed(2)});
          float flow = abs(uRun) * smoothstep(uFrom - 0.3, uFrom + 0.3, vS) * (1.0 - smoothstep(uTo - 0.3, uTo + 0.3, vS));
          float gate = mix(uGate, 1.0, smoothstep(uGateTo - 0.15, uGateTo + 0.15, vS));
          // at rest the pressure is an even light; flowing, it breaks into dashes
          float light = uBase + uLevel * lit * mix(1.0, 0.4 + 0.75 * dash, flow) + 0.38 * flow * dash;
          gl_FragColor = vec4(uColor * min(light * gate, 2.2) * body * uAmount, 1.0);
        }`,
    });
  return { u: uniforms, rigid: make(false), flex: make(true) };
}

/**
 * What the sensor reads, as pulses of veille light running up its wire (s = 0 at the sensor). They sit on a lattice
 * that runs at one speed; the wheel's speed says how many of its places are lit — all of them (uW1), one in two
 * (uW2), one in four (uW4), none: the rhythm thins out as the wheel slows, and a stopped wheel sends nothing.
 */
const pulseMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: VEILLE.clone() }, uTime: { value: 0 }, uSense: { value: 0 }, uW1: { value: 0 }, uW2: { value: 0 }, uW4: { value: 0 }, uMinPx: { value: 2.4 }, uSteer: { value: 0 } },
    vertexShader: sheathVertex(true),
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uSense, uW1, uW2, uW4;
      varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.15);
        float x = (vS - uTime * ${PULSE.speed.toFixed(2)}) / ${PULSE.period.toFixed(2)};
        float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
        float place = floor(x);
        float q = x - place;
        float pulse = smoothstep(0.0, w, q) * (1.0 - smoothstep(${PULSE.duty.toFixed(2)}, ${PULSE.duty.toFixed(2)} + w, q));
        float on = max(uW1, max(uW2 * (1.0 - step(0.5, mod(place, 2.0))), uW4 * (1.0 - step(0.5, mod(place, 4.0)))));
        // its head is the brighter end
        float lit = on * pulse * (0.4 + 0.6 * clamp(q / ${PULSE.duty.toFixed(2)}, 0.0, 1.0));
        gl_FragColor = vec4(uColor * (0.07 + 1.6 * lit) * body * uSense, 1.0);
      }`,
  });

/**
 * A ball of light with no edge, always facing the eye: a small hot heart, a soft body, a long tail. `uRadius` cm
 * (where the tail ends), never under `uMinPx` pixels. It stands where it is: what is in front of it hides it.
 */
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
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
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

/* ─────────────────────────────────────────────────────────── the system */

/**
 * → { root, A, update(p, time) }. `root`: one rigid assembly in the car's own frame (world.js stands it in the car,
 * or on the bench). `A`: anchors that follow their parts — steered, exploded or not.
 * p (see FIRST in world.js):
 *   bench     1: on the bench — a post under the unit, another under the servo; the ring's teeth always drawn sharp
 *   steer     −1 full right … 1 full left: the whole corner turns by 28° about the vertical through the hub; the hose
 *             and the sensor's wire follow
 *   rolled    metres rolled: the tyre, the rim, the disc, the hub and its ring turn (forward: toward −z)
 *   wkmh      the wheel's speed: in the street, over ≈ 10 km/h the teeth and the disc's vanes melt into an even band;
 *             with `sense`, how many pulses run up the wire (all · one in two · one in four · none at 0)
 *   brake     your foot: the pad is at pedalPad(brake, pulse, time), the lever and the push rod follow; the feed line
 *             fills with ink light, from the master cylinder to the inlet valve (0 → 0.3: a front runs down the line)
 *   pulse     the pedal trembles (pedalPad)
 *   grip      the pads close on the disc (7 mm a side); the wheel's line is as bright as the pressure at the caliper
 *   lock      the disc and the pads go signal, a ball of light at the caliper, a signal light inside the wheel
 *   inlet     1 open · 0 shut: the needle comes down on the mouth of the drop, its coil glows veille, the light stops there
 *   outlet    0 shut · 1 open: the needle lifts off the hole in the wheel gallery's floor, its coil glows veille, dashes
 *             run from the caliper back into the drain, the accumulator's piston gives way
 *   pump      the piston goes to and fro on its cam; dashes run along the bottom gallery, up the riser and back up
 *             the feed line toward your foot
 *             (with inlet open and brake above grip, dashes run from your foot to the caliper: the pressure is building)
 *   sense     veille pulses up the sensor's wire, a glow at its tip
 *   xray      the tyre and the rim turn to glass (the mark stays, fainter); the block turns to glass: its circuit shows
 *   explode   0 → 1 (the bench): the two tiers of the exploded view
 *   litRing, litSensor, litEcu, litValves, litPump   0–1: the part the voice is naming glows faintly veille
 *   shell, dive, rain, kmh   not used here
 */
export function buildSystem() {
  const root = new THREE.Group();
  const grp = (parent = root) => {
    const g = new THREE.Group();
    parent.add(g);
    return g;
  };
  const partIn = (parent, name) => {
    const part = makePart(name);
    parent.add(part);
    return part;
  };
  // three values of grey — dark (rubber, cast iron, the computer), middle (the rim, steel), clear (what is machined)
  const C = { rubber: 0x15181b, dark: 0x202428, iron: 0x3a4147, cast: 0x4a5158, mid: 0x6e757c, alu: 0x8b9299, fine: 0xa9b0b6, bright: 0xd4d9dd };

  /* ══ THE WHEEL CORNER ══ */
  const corner = grp();
  corner.position.set(HX, HY, HZ);

  /* ── the tyre ── */
  const tyreG = grp(corner);
  const tyreSpin = grp(tyreG);
  const tyre = partIn(tyreSpin, "tyre");
  addMesh(tyre, turnX(tyreSection([...groove(-3.9), ...groove(0), ...groove(3.9)]), 96, { crease: 34 }), solid(C.rubber, { rough: 0.95, env: 0.55 }), { edges: false });
  // its outline: the two shoulders, and where each wall meets the rim. Circles: turning, they do not move
  const tyreLines = [[R + 0.02, -7.4], [R + 0.02, 7.4], [BEAD + 1.2, -10.5], [BEAD + 1.2, 10.5]].map(([r, a]) => circle(r, a, { color: BRAND.ink, width: 2, opacity: 0.4 }));
  tyreSpin.add(...tyreLines);
  const mark = partIn(tyreSpin, "mark");
  addMesh(mark, lyingX(new THREE.LatheGeometry(MARK.map(([r, a]) => new THREE.Vector2(r, a)), 4, -0.06, 0.12)), solid(0xbdb8ac, { rough: 0.9, double: true }), { edges: false });

  /* ── the rim: five thick spokes, a deep barrel; through the spokes, the brake ── */
  const rimG = grp(corner);
  const rimSpin = grp(rimG);
  const rim = partIn(rimSpin, "rim");
  const spokes = plate(star(), 3.0, { bevel: 0.35 }).rotateY(Math.PI / 2).translate(-10.3, 0, 0);
  const cap = turnX([[0, -11.0], [2.4, -11.0], [3.0, -10.75], [3.0, -10.2], [0, -10.2]], 40, { bevel: 0.06, round: 2 });
  const rimShape = mergeGeometries([
    // the barrel: lip, bead seat, drop centre, and back
    turnX([[19.6, -10.6], [22.4, -10.9], [22.4, -10.2], [BEAD, -9.5], [21.2, -6.5], [20.2, -4.5], [20.2, 5], [21.2, 7], [BEAD, 9.5], [22.4, 10.2], [22.4, 10.8], [21.5, 10.8], [19.4, 9.6], [19.4, -6], [19.6, -10.6]], 96, { bevel: 0.12, round: 2 }),
    spokes.clone(), // the spokes
    turnX(ringOf(2.9, 7.0, -7.4, 2.4), 48), // the pad that bolts on the hub
    cap.clone(), // the centre cap
  ]);
  addMesh(rim, rimShape, solid(0x9aa1a8, { rough: 0.5, metal: 0.36 }), { edgeOpacity: 0.5 });
  // the five bolt holes (few and large: they may turn)
  addMesh(rim, mergeGeometries(Array.from({ length: 5 }, (_, i) => lyingX(new THREE.CylinderGeometry(0.85, 0.85, 0.1, 20)).translate(-10.32, 4.9 * Math.sin(((i + 0.5) / 5) * Math.PI * 2), 4.9 * Math.cos(((i + 0.5) / 5) * Math.PI * 2)))), solid(0x0e1012, { rough: 1, env: 0.2 }), { edges: false });

  // under the X-ray the tyre and the rim are one shell of glass
  const wheelGlass = glass(BRAND.ink, { base: 0.005, rim: 0.2, power: 3, edge: 0.4, spec: 0.35, through: 0.3 });
  const tyreGlass = new THREE.Mesh(turnX(tyreSection([]), 72, { crease: 34 }), wheelGlass);
  const rimGlass = new THREE.Mesh(rimShape.clone(), wheelGlass);
  const rimLines = edgesOf(mergeGeometries([spokes, cap]), { color: BRAND.ink, width: 2, opacity: 0.45 });
  const lipLines = [[22.4, -10.9], [22.4, 10.8]].map(([r, a]) => circle(r, a, { color: BRAND.ink, width: 2, opacity: 0 }));
  rimGlass.add(rimLines, ...lipLines);
  tyreGlass.visible = rimGlass.visible = false;
  asShell([tyreGlass, rimGlass], 20);
  tyreSpin.add(tyreGlass);
  rimSpin.add(rimGlass);

  /* ── the disc: two machined faces, the vanes between them, the bell that bolts on the hub ── */
  const discG = grp(corner);
  const discSpin = grp(discG);
  const disc = partIn(discSpin, "disc");
  const discMat = solid(0xc0c6cb, { rough: 0.38, metal: 0.5, env: 1.4 });
  const D0 = A_DISC - DT;
  const D1 = A_DISC + DT;
  addMesh(disc, turnX([[2.6, 2.4], [7.4, 2.4], [7.4, D0], [DISC.r, D0], [DISC.r, D0 + 0.8], [10.2, D0 + 0.8], [10.2, D1 - 0.8], [DISC.r, D1 - 0.8], [DISC.r, D1], [9.0, D1], [9.0, D0 + 0.8], [6.7, D0 + 0.8], [6.7, 3.1], [2.6, 3.1], [2.6, 2.4]], 96, { bevel: 0.07, round: 2 }), discMat, { edgeOpacity: 0.55 });
  const vanes = partIn(discSpin, "vanes");
  addMesh(vanes, mergeGeometries(Array.from({ length: 30 }, (_, i) => new THREE.BoxGeometry(1.0, 5.1, 0.55).translate(A_DISC, 12.8, 0).rotateX((i / 30) * Math.PI * 2))), solid(C.cast, { rough: 0.8, metal: 0.2 }), { edges: false });
  // …which melt into an even band once the wheel turns faster than they can be counted
  const vaneBlur = partIn(discSpin, "vaneBlur");
  addMesh(vaneBlur, lyingX(new THREE.CylinderGeometry(DISC.r - 0.02, DISC.r - 0.02, 1.0, 72, 1, true)).translate(A_DISC, 0, 0), solid(0x343a40, { rough: 0.8, metal: 0.2, double: true }), { edges: false });
  setPartOpacity(vaneBlur, 0);

  /* ── the hub (it turns): flange and studs, the spindle, and on it THE TOOTHED RING ── */
  const hubG = grp(corner);
  const hubSpin = grp(hubG);
  const hub = partIn(hubSpin, "hub");
  {
    const m = { steel: solid(C.mid, { rough: 0.5, metal: 0.45 }), rubber: solid(C.rubber, { rough: 0.95, env: 0.5 }) };
    addMesh(hub, mergeGeometries([turnX([[0, 3.2], [5.8, 3.2], [5.8, 4.1], [2.7, 4.1], [2.7, 20.4], [0, 20.4]], 48, { bevel: 0.08, round: 2 }), ...Array.from({ length: 5 }, (_, i) => lyingX(cyl(0.5, 2.3, 0.08, 16)).translate(2.1, 4.2 * Math.cos((i / 5) * Math.PI * 2), 4.2 * Math.sin((i / 5) * Math.PI * 2)))]), m.steel, { edgeOpacity: 0.5 });
    // the drive shaft's boot, cut clean
    addMesh(hub, turnX([[0, 19.9], [4.0, 19.9], [4.3, 20.7], [3.4, 21.5], [3.9, 22.3], [3.0, 23.1], [3.3, 23.9], [2.3, 24.6], [0, 24.6]], 40, { bevel: 0.1, round: 2 }), m.rubber, { edgeOpacity: 0.3 });
  }
  const ring = partIn(hubSpin, "ring");
  const teeth = partIn(hubSpin, "teeth");
  const toothBlur = partIn(hubSpin, "toothBlur");
  {
    const a0 = A_RING - 0.9;
    const a1 = A_RING + 0.9;
    const foot = RING.r - 0.65;
    addMesh(ring, turnX([[2.7, a0 + 0.3], [foot - 0.65, a0 + 0.3], [foot - 0.65, a0], [foot, a0], [foot, a1], [foot - 0.65, a1], [foot - 0.65, a1 - 0.3], [2.7, a1 - 0.3], [2.7, a0 + 0.3]], 72, { bevel: 0.05, round: 2 }), solid(C.cast, { rough: 0.6, metal: 0.4 }), { edgeOpacity: 0.45 });
    // the teeth, clear on the darker band: no edge lines (forty-four fine lines in a ring would crawl)
    const tooth = box(1.8, 0.68, 0.44, 0.06, 1).translate(A_RING, RING.r - 0.34, 0);
    addMesh(teeth, mergeGeometries(Array.from({ length: RING.teeth }, (_, i) => tooth.clone().rotateX((i / RING.teeth) * Math.PI * 2))), solid(0xc6ccd1, { rough: 0.42, metal: 0.45 }), { edges: false });
    // …and what they melt into at speed: an even grey band, closed on both sides
    const side = (a) => new THREE.RingGeometry(foot - 0.02, RING.r + 0.02, 72).rotateY(Math.PI / 2).translate(a, 0, 0);
    addMesh(toothBlur, mergeGeometries([lyingX(new THREE.CylinderGeometry(RING.r + 0.02, RING.r + 0.02, 1.84, 72, 1, true)).translate(A_RING, 0, 0), side(a0 - 0.02), side(a1 + 0.02)]), solid(0x7f868d, { rough: 0.5, metal: 0.4, double: true }), { edges: false });
    setPartOpacity(toothBlur, 0);
  }

  /* ── what does not turn: the hub carrier behind the ring, and THE SENSOR on its bracket ── */
  const knuckle = partIn(hubG, "carrier");
  {
    const iron = solid(C.iron, { rough: 0.85, metal: 0.2 });
    const web = [...arc(0, 13, 2.3, -30, 210), [-2.0, 9.5], [-4.6, 5.5], [-5.4, 1.5], [-5.6, -2.0], [-9.0, -3.6], ...arc(-11.5, -5.2, 1.5, 80, 280, 6), [-8.5, -6.6], [-5.0, -6.0], [-2.4, -9.0], ...arc(0, -12, 2.2, 160, 380), [2.4, -9.0], [5.2, -5.0], [5.8, -1.0], [7.6, 1.6], ...arc(8.8, 4.0, 1.5, -70, 150, 6), [5.2, 5.6], [2.0, 9.5]];
    addMesh(knuckle, mergeGeometries([slab(web, 2.0, 18.4, 0.2), turnX([[2.9, 15.4], [4.9, 15.4], [4.9, 16.0], [5.6, 16.0], [5.6, 16.8], [4.9, 16.8], [4.9, 19.6], [2.9, 19.6], [2.9, 15.4]], 48)]), iron, { edgeOpacity: 0.4 });
    // the sensor's bracket, reaching over the ring
    addMesh(knuckle, mergeGeometries([box(4.2, 0.9, 3.0, 0.15).translate(A_RING + 1.2, 10.45, 0), hex(0.5, 0.4).translate(A_RING + 1.9, 11.1, 0)]), solid(C.mid, { rough: 0.55, metal: 0.4 }), { edgeOpacity: 0.45 });
  }
  const sensor = partIn(hubG, "sensor");
  {
    const m = { body: solid(0x1b1e21, { rough: 0.6, coat: 0.3, coatRough: 0.5 }), tip: solid(C.bright, { rough: 0.4, metal: 0.45 }) };
    addMesh(sensor, turnY([[0, TIP + 0.5], [0.72, TIP + 0.5], [0.72, 10.0], [1.15, 10.0], [1.15, 12.1], [0.6, 12.6], [0, 12.6]], 32).translate(A_RING, 0, 0), m.body, { edgeOpacity: 0.55 });
    addMesh(sensor, turnY([[0, TIP], [0.6, TIP], [0.6, TIP + 0.5], [0, TIP + 0.5]], 24, { bevel: 0.04, round: 1 }).translate(A_RING, 0, 0), m.tip, { edgeOpacity: 0.5 });
    // the stiff boot its wire leaves by
    addMesh(sensor, tube(bent([V(A_RING, 12.2, 0), V(A_RING, 13.0, 0), V(A_RING + 0.7, 13.9, 0.1), V(A_RING + 1.7, 14.6, 0.3)], 0.5, 5), 0.5, { radial: 10 }), m.body, { edges: false });
  }
  const WIRE_FROM = V(HX + A_RING + 1.7, HY + 14.6, HZ + 0.3);
  const senseBall = makeBall(VEILLE.clone().lerp(new THREE.Color(1, 1, 1), 0.4), VEILLE, A_RING, TIP - 0.1, 0);
  hubG.add(senseBall);

  /* ── the caliper (drawn on top of the disc, then turned back to the rear top quarter) and its two pads ── */
  const calG = grp(corner);
  const calRot = grp(calG);
  calRot.rotation.x = CAL_TILT;
  const caliper = partIn(calRot, "caliper");
  {
    const m = { cast: solid(0x687078, { rough: 0.72, metal: 0.3 }), rubber: solid(C.rubber, { rough: 0.95, env: 0.5 }), fine: solid(C.fine, { rough: 0.45, metal: 0.4 }) };
    const frame = new THREE.Shape([[2.6, -6], [11.4, -6], [12.6, -4.8], [12.6, 4.8], [11.4, 6], [2.6, 6], [0.6, 4.0], [0.6, -4.0]].map(([x, y]) => new THREE.Vector2(x, y)));
    frame.holes.push(new THREE.Path([[4.4, -3.2], [3.6, -2.4], [3.6, 2.4], [4.4, 3.2], [8.2, 3.2], [9.0, 2.4], [9.0, -2.4], [8.2, -3.2]].map(([x, y]) => new THREE.Vector2(x, y))));
    addMesh(
      caliper,
      mergeGeometries([
        slab([[-4.6, 16.4], [-6, 15.0], [-6, 10.9], [-5.5, 10.4], [-2.8, 10.4], [-2.3, 10.9], [-2.3, 13.4], [-1.7, 14.0], [1.7, 14.0], [2.3, 13.4], [2.3, 10.9], [2.8, 10.4], [5.5, 10.4], [6, 10.9], [6, 15.0], [4.6, 16.4]], 2.5, 2.4, 0.4), // the outboard fingers
        plate(frame, 2.6, { bevel: 0.45 }).rotateX(-Math.PI / 2).translate(0, 16.2, 0), // the bridge over the disc's edge, and its window
        box(3.0, 6.4, 12, 0.6).translate(11.1, 13.2, 0), // the inboard housing…
        lyingX(cyl(2.7, 0.9, 0.2, 40)).translate(12.9, 13.0, 0), // …and its cylinder
      ]),
      m.cast,
      { edgeOpacity: 0.5 },
    );
    addMesh(caliper, mergeGeometries([-6.7, 6.7].map((z) => lyingX(cyl(0.6, 6.4, 0.15, 20)).translate(9.4, 11.4, z))), m.rubber, { edgeOpacity: 0.3 }); // the slider pins' boots
    addMesh(caliper, mergeGeometries([lyingX(hex(0.75, 0.7)).translate(12.95, 14.6, -3.2), lyingX(cyl(0.72, 1.4, 0.1, 20)).translate(14.0, 14.6, -3.2), lyingX(cyl(0.32, 0.9, 0.06, 12)).translate(13.0, 15.4, 3.6)]), m.fine, { edgeOpacity: 0.45 }); // the banjo, the bleed nipple
  }
  const pads = partIn(calRot, "pads");
  const padOutG = grp(calRot);
  const padInG = grp(calRot);
  const liningMat = solid(0x1b1e21, { rough: 0.95, env: 0.4 });
  {
    const steel = solid(C.fine, { rough: 0.5, metal: 0.4 });
    const lining = box(1.0, 5.0, 10.6, 0.15);
    const shim = box(0.5, 5.6, 11.2, 0.12);
    // at rest in these groups the pads TOUCH the disc: update() stands them off by GAP × (1 − grip)
    padOutG.add(addMesh(pads, lining.clone().translate(D0 - 0.5, 12.9, 0), liningMat, { edgeOpacity: 0.5 }), addMesh(pads, shim.clone().translate(D0 - 1.25, 12.9, 0), steel, { edgeOpacity: 0.5 }));
    padInG.add(addMesh(pads, lining.clone().translate(D1 + 0.5, 12.9, 0), liningMat, { edgeOpacity: 0.5 }), addMesh(pads, shim.clone().translate(D1 + 1.25, 12.9, 0), steel, { edgeOpacity: 0.5 }), addMesh(pads, lyingX(cyl(2.2, 1.6, 0.12, 32)).translate(D1 + 2.3, 13.0, 0), steel, { edgeOpacity: 0.4 })); // …and the piston that pushes the inboard one
  }
  // the locked brake: a ball of light at the pads, and a real light inside the wheel
  const lockBall = makeBall(HOT, SIGNAL, D0 - 1.6, 12.6, 0);
  const lockLight = new THREE.PointLight(BRAND.signal, 0, 60, 2);
  lockLight.position.set(1.5, 12, 0);
  calRot.add(lockBall, lockLight);

  /* ══ THE ABS UNIT ══ */
  const unitG = grp();
  const block = partIn(unitG, "block");
  const nut = (x, y, z) => lyingX(hex(0.78, 0.9)).translate(x, y, z);
  const blockShape = box(UNIT.w, UNIT.h, UNIT.d, 0.35, 3).translate(U.x, U.y, U.z);
  {
    const m = { alu: solid(C.bright, { rough: 0.5, metal: 0.4 }), fine: solid(C.fine, { rough: 0.45, metal: 0.45 }), pit: solid(0x0e1012, { rough: 1, env: 0.2 }), seal: solid(C.iron, { rough: 0.92, env: 0.4 }), pipe: solid(0x2b3035, { rough: 0.55, metal: 0.4 }) };
    addMesh(block, blockShape, m.alu, { edgeOpacity: 0.6 });
    // its unions: your wheel's and your foot's, and the stubs of the three other wheels and of the second circuit
    const stubs = [[X0, YW, ZC - 4], [X0, YF + 0.7, ZC], [X0, YF + 0.7, ZC - 4], [X1, YF, ZC - 4]];
    addMesh(block, mergeGeometries([nut(X0 - 0.45, YW, ZC), nut(X1 + 0.45, YF, ZC), ...stubs.map(([x, y, z]) => nut(x + (x < U.x ? -0.45 : 0.45), y, z))]), m.fine, { edgeOpacity: 0.5 });
    addMesh(block, mergeGeometries(stubs.map(([x, y, z]) => lyingX(cyl(0.4, 2.0, 0.06, 16)).translate(x + (x < U.x ? -1.9 : 1.9), y, z))), m.pipe, { edges: false });
    // the plugs that close its bores, on the face the camera sees; the two wells of the valves, under the computer
    addMesh(block, mergeGeometries([[XO, YB], [XR - 0.6, YB], [X0 + 2.2, YW]].map(([x, y]) => lyingZ(cyl(0.7, 0.14, 0.05, 24)).translate(x, y, ZF + 0.05))), m.fine, { edgeOpacity: 0.45 });
    addMesh(block, box(UNIT.w - 0.5, 0.24, UNIT.d - 0.5, 0.1, 1).translate(U.x, Y1 + 0.1, U.z), m.seal, { edges: false }); // (under the computer: it only shows once the computer is lifted)
    addMesh(block, mergeGeometries([XI, XO].map((x) => new THREE.CircleGeometry(1.45, 32).rotateX(-Math.PI / 2).translate(x, Y1 + 0.235, ZC))), m.pit, { edges: false });
  }
  const blockGlassMat = glass(BRAND.ink, { base: 0.01, rim: 0.26, power: 2.6, edge: 0.42, spec: 0.5, through: 0.25 });
  const blockGlass = new THREE.Mesh(blockShape.clone(), blockGlassMat);
  const blockLines = edgesOf(blockGlass.geometry, { color: BRAND.ink, width: 2, opacity: 0.5 });
  blockGlass.add(blockLines);
  blockGlass.visible = false;
  asShell(blockGlass, 10);
  unitG.add(blockGlass);

  /* ── the computer, on top ── */
  const ecuG = grp(unitG);
  const ecu = partIn(ecuG, "ecu");
  {
    const m = { box: solid(0x30353a, { rough: 0.85, env: 0.7 }), plug: solid(0x464d53, { rough: 0.8 }) }; // matt: a varnished lid seen from az ≈ −45 mirrors the rim light, which stands exactly opposite — a white-green burn that reads as `litEcu`
    const ribs = Array.from({ length: 5 }, (_, i) => box(UNIT.w - 2.2, 0.5, 0.7, 0.12, 1).translate(U.x, Y1 + ECU_H + 0.2, U.z - 3.6 + i * 1.8));
    addMesh(ecu, mergeGeometries([box(UNIT.w, ECU_H, UNIT.d, 0.4, 3).translate(U.x, Y1 + ECU_H / 2, U.z), ...ribs]), m.box, { edgeOpacity: 0.6 });
    // its connector, on the wheel's side: the sensor's wire plugs in here
    addMesh(ecu, mergeGeometries([box(2.4, 2.8, 7, 0.3).translate(X0 - 1.2, Y1 + 1.9, U.z - 0.5), box(0.5, 2.0, 5.6, 0.15).translate(X0 - 2.55, Y1 + 1.9, U.z - 0.5)]), m.plug, { edgeOpacity: 0.55 });
  }
  const PLUG = V(X0 - 2.8, Y1 + 1.9, U.z - 1.6);

  /* ── the two valves of this wheel: a coil, an armature, a needle; their seats stay in the block ── */
  const guts = partIn(unitG, "seats");
  const steelFine = () => solid(C.fine, { rough: 0.42, metal: 0.45 });
  addMesh(guts, mergeGeometries([turnY(ringOf(0.36, 0.8, SEAT_IN - 0.25, SEAT_IN), 32, { bevel: 0.04, round: 1 }).translate(XI, 0, ZC), turnY(ringOf(0.36, 0.8, SEAT_OUT - 0.25, SEAT_OUT), 32, { bevel: 0.04, round: 1 }).translate(XO, 0, ZC)]), steelFine(), { edgeOpacity: 0.5 });
  const coilShape = () => turnY([[0.6, COIL.y0], [COIL.r, COIL.y0], [COIL.r, COIL.y0 + 0.25], [COIL.r - 0.15, COIL.y0 + 0.25], [COIL.r - 0.15, COIL.y1 - 0.25], [COIL.r, COIL.y1 - 0.25], [COIL.r, COIL.y1], [0.6, COIL.y1], [0.6, COIL.y0]], 40, { bevel: 0.03, round: 1 });
  /** One valve at x: `tip` where its needle's point stands at rest, `up` the top of its armature at rest. */
  function valve(name, x, tip, top) {
    const g = grp(unitG);
    const slide = grp(g);
    const coil = partIn(g, name + "Coil");
    const coilMat = solid(0x515860, { rough: 0.7, metal: 0.25 });
    addMesh(coil, coilShape().translate(x, 0, ZC), coilMat, { edgeOpacity: 0.55 });
    const needle = partIn(slide, name + "Needle");
    const steel = solid(C.bright, { rough: 0.4, metal: 0.45 });
    const armature = [top - 2.4, top];
    addMesh(needle, mergeGeometries([cyl(0.5, 2.4, 0.06, 28).translate(x, (armature[0] + armature[1]) / 2, ZC), cyl(0.2, armature[0] - tip - 0.3, 0.03, 16).translate(x, (armature[0] + tip + 0.3) / 2, ZC), turnY([[0, tip], [0.36, tip + 0.3], [0.36, tip + 0.45], [0, tip + 0.45]], 24, { bevel: 0.03, round: 1 }).translate(x, 0, ZC)]), steel, { edgeOpacity: 0.5 });
    return { g, slide, coil, needle, coilMat };
  }
  // the inlet is open at rest: its needle stands a stroke above its seat; the outlet is shut: its needle is on it
  const vIn = valve("inlet", XI, SEAT_IN + STROKE, COIL.y1);
  const vOut = valve("outlet", XO, SEAT_OUT, COIL.y1 - STROKE);

  /* ── the accumulator: a piston on a spring, under the outlet's drain ── */
  const accSlide = grp(unitG);
  const acc = partIn(unitG, "accumulator");
  accSlide.add(addMesh(acc, lyingX(cyl(ACC.r, 0.3, 0.05, 28)).translate(ACC.mouth - 0.4, YB, ZC), steelFine(), { edgeOpacity: 0.5 }));
  const accSpring = (() => {
    const geo = helixX(ACC.end + 0.05, ACC.mouth - 0.56, YB, ZC, 0.58, 0.075, 4);
    const squeezed = helixX(ACC.end + 0.05, ACC.mouth - 0.56 - ACC.travel, YB, ZC, 0.58, 0.075, 4);
    geo.morphAttributes.position = [squeezed.attributes.position];
    geo.morphAttributes.normal = [squeezed.attributes.normal];
    const mesh = addMesh(acc, geo, solid(C.bright, { rough: 0.38, metal: 0.5 }), { edges: false });
    mesh.frustumCulled = false;
    return mesh;
  })();
  // what it has taken: a volume of light between its mouth and its piston
  const accGlowMat = glow(BRAND.ink, 0, { additive: true });
  const accGlow = lightMesh(lyingX(new THREE.CylinderGeometry(ACC.r - 0.08, ACC.r - 0.08, 1, 20)), accGlowMat);
  accGlow.position.set(ACC.mouth, YB, ZC);
  unitG.add(accGlow);

  /* ── the pump: a piston in line in the bottom gallery, on the cam of the motor that hangs under the block ── */
  const pumpG = grp(unitG);
  const pumpSlide = grp(pumpG);
  const pump = partIn(pumpG, "pump");
  pumpSlide.add(addMesh(pump, lyingX(cyl(0.56, 1.6, 0.08, 28)).translate(PUMP.x, YB, ZC), solid(C.bright, { rough: 0.4, metal: 0.45 }), { edgeOpacity: 0.5 }));
  addMesh(pump, mergeGeometries([-1.3, 1.3].map((dx) => lyingX(turnY(ringOf(0.34, 0.74, -0.1, 0.1), 28, { bevel: 0.03, round: 1 })).translate(PUMP.x + dx, YB, ZC))), steelFine(), { edgeOpacity: 0.45 });
  const motorG = grp(unitG);
  const camG = grp(motorG);
  const motor = partIn(motorG, "motor");
  {
    const m = { can: solid(0x7d848b, { rough: 0.55, metal: 0.3 }), cap: solid(C.dark, { rough: 0.7, coat: 0.2 }), steel: solid(C.fine, { rough: 0.45, metal: 0.45 }) };
    const y0 = Y0 - MOTOR.h;
    addMesh(motor, turnY([[0, y0], [MOTOR.r - 0.5, y0], [MOTOR.r, y0 + 0.5], [MOTOR.r, y0 + 1.4], [MOTOR.r - 0.1, y0 + 1.5], [MOTOR.r - 0.1, y0 + 1.7], [MOTOR.r, y0 + 1.8], [MOTOR.r, Y0 - 0.9], [MOTOR.r + 0.6, Y0 - 0.9], [MOTOR.r + 0.6, Y0], [0, Y0]], 56, { bevel: 0.08, round: 2 }).translate(U.x, 0, U.z), m.can, { edgeOpacity: 0.5 });
    addMesh(motor, mergeGeometries([turnY([[0, y0 - 0.5], [2.5, y0 - 0.5], [2.5, y0 + 0.1], [0, y0 + 0.1]], 40).translate(U.x, 0, U.z), box(1.6, 0.9, 1.2, 0.15).translate(U.x - 2.2, y0 - 0.2, U.z + 1.6)]), m.cap, { edgeOpacity: 0.5 });
    addMesh(motor, cyl(0.3, YB - 0.1 - Y0, 0.04, 16).translate(U.x, (Y0 + YB - 0.1) / 2, U.z), m.steel, { edges: false });
    camG.add(addMesh(motor, cyl(0.75, 0.4, 0.05, 28).translate(U.x, YB - 0.3, U.z), m.steel, { edgeOpacity: 0.45 }));
  }

  /* ══ THE PEDAL BOX ══ */
  const pedalG = grp();
  const box0 = partIn(pedalG, "pedalBox");
  {
    const m = { drum: solid(0x343a40, { rough: 0.5, metal: 0.35, coat: 0.2, coatRough: 0.5 }), alu: solid(C.alu, { rough: 0.5, metal: 0.4 }), tank: solid(0xbdc3c1, { rough: 0.7 }), dark: solid(0x2a2f34, { rough: 0.85 }), iron: solid(C.iron, { rough: 0.8, metal: 0.25 }), fine: solid(C.fine, { rough: 0.45, metal: 0.45 }), rubber: solid(C.rubber, { rough: 0.95, env: 0.5 }) };
    const dome = [[4.2, 0], [7.2, 0.3], [9.6, 1.1], [11.1, 2.4], [11.8, 3.8], [12.0, 4.8]]; // one shell of the servo's drum, from its hub to its seam
    const z0 = MASTER.servo[2] - 5.4;
    const z1 = MASTER.servo[2] + 5.0;
    addMesh(box0, turnZ([[0, z0], ...dome.map(([r, d]) => [r, z0 + d]), [12.5, z0 + 4.8], [12.5, z1 - 4.8], ...dome.map(([r, d]) => [r, z1 - d]).reverse(), [0, z1]], 72, { crease: 30 }).translate(MX, MY, 0), m.drum, { edgeOpacity: 0.5 });
    // the master cylinder, the union the feed line leaves by
    addMesh(box0, mergeGeometries([turnZ([[0, -121.4], [1.7, -121.4], [1.9, -120.6], [2.6, -120.2], [2.6, z0 - 1.2], [3.7, z0 - 1.2], [3.7, z0], [0, z0]], 40).translate(MX, MY, 0), ...[-108.5, -115.5].map((z) => cyl(0.9, 1.2, 0.08, 20).translate(MX, MY + 2.9, z))]), m.alu, { edgeOpacity: 0.5 });
    addMesh(box0, lyingX(hex(0.8, 1.0)).translate(PORT.x - 0.3, PORT.y, PORT.z), m.fine, { edgeOpacity: 0.5 });
    // its reservoir and cap
    addMesh(box0, box(6.4, 5.2, 9.6, 1.1, 4).translate(MX, MY + 6.0, -112), m.tank, { edgeOpacity: 0.5 });
    addMesh(box0, cyl(2.1, 1.3, 0.2, 32).translate(MX, MY + 9.2, -110.5), m.dark, { edgeOpacity: 0.5 });
    // the piece of bulkhead it is bolted through, the bracket that carries the pedal's pivot, the boot of the push rod
    const cheek = [[-92.4, 82.5], [-92.4, 66.0], [-80.0, 70.2], [-76.6, 71.2], [-73.8, 72.4], [-73.0, 74.6], [-74.2, 76.6], [-77, 77.4], [-86, 81.5]];
    const side = (x) => plate(cheek, 0.4, { bevel: 0.08 }).rotateY(-Math.PI / 2).translate(x, 0, 0);
    addMesh(box0, mergeGeometries([box(13, 17, 0.6, 0.2).translate(MX, MY - 1.5, z1 + 0.3), side(MX - 2.4), side(MX + 2.8)]), m.iron, { edgeOpacity: 0.45 });
    addMesh(box0, lyingX(cyl(0.9, 6.8, 0.15, 24)).translate(...PV), m.fine, { edgeOpacity: 0.5 });
    addMesh(box0, turnZ([[0.6, 0], [2.6, 0], [2.6, 0.6], [1.0, 3.4], [0.6, 3.4], [0.6, 0]], 32, { bevel: 0.1, round: 2 }).translate(MX, MY, z1 + 0.6), m.rubber, { edgeOpacity: 0.3 });
  }
  // the lever: it hangs from the pivot; its pad is where plan.js says your foot is
  const leverG = grp(pedalG);
  leverG.position.set(...PV);
  const lever = partIn(leverG, "lever");
  const armMesh = addMesh(lever, slab([[1.1, -ARM0.len], [1.6, -1.0], ...arc(0, 0, 1.9, -20, 200), [-1.6, -1.0], [-1.1, -ARM0.len]], 0.9, 0.45, 0.15), solid(C.mid, { rough: 0.55, metal: 0.4 }), { edgeOpacity: 0.5 });
  const padG = grp(pedalG);
  const pad = partIn(padG, "pad");
  {
    const rubber = solid(0x191c1f, { rough: 0.92, env: 0.5 });
    addMesh(pad, box(6.6, 4.8, 1.2, 0.4).translate(0, 0, -0.6), rubber, { edgeOpacity: 0.55 });
    addMesh(pad, mergeGeometries([-1.5, -0.5, 0.5, 1.5].map((y) => box(5.6, 0.5, 0.3, 0.1, 1).translate(0, y, 0.06))), solid(0x2c3136, { rough: 0.9, env: 0.5 }), { edges: false });
    addMesh(pad, box(7.0, 5.2, 0.4, 0.12).translate(0, 0, -1.4), solid(C.fine, { rough: 0.5, metal: 0.4 }), { edgeOpacity: 0.5 });
  }
  const rodG = grp(pedalG);
  const rod = partIn(rodG, "rod");
  addMesh(rod, mergeGeometries([lyingZ(cyl(0.45, 24, 0.1, 16)).translate(0, 0, -12), box(1.7, 1.7, 2.4, 0.25).translate(0, 0, -0.5)]), solid(C.fine, { rough: 0.45, metal: 0.45 }), { edgeOpacity: 0.45 });

  /* ══ THE LINES ══ */
  const lineG = grp();
  const lines = partIn(lineG, "lines");
  const pipeMat = solid(0x2b3035, { rough: 0.55, metal: 0.4 });
  // foot → unit: out of the master cylinder's flank, down and forward to the block's face, then the feed gallery to the inlet's seat
  const feedOut = pathOf([PORT, V(MX - 6.4, MY, -117), V(MX - 6.4, YF + 3.4, -125), V(X1 + 2.9, YF, ZC), V(X1, YF, ZC)], 1.6, 0.4);
  const feedIn = pathOf([V(X1, YF, ZC), V(XI, YF, ZC), V(XI, SEAT_IN + 0.1, ZC)], 0.3, 0.2);
  const L_FEED_OUT = runOf(feedOut).at(-1);
  const L_FEED = L_FEED_OUT + runOf(feedIn).at(-1);
  const S_RISER = L_FEED_OUT + (X1 - XR);
  addMesh(lines, tube(feedOut, 0.4, { radial: 12 }), pipeMat, { edges: false });
  // unit → caliper: the inlet's seat, the drop, the wheel gallery; out of the block, a union, and the hose
  const wheelIn = pathOf([V(XI, SEAT_IN, ZC), V(XI, YW, ZC), V(X0, YW, ZC)], 0.3, 0.2);
  const wheelOut = pathOf([V(X0, YW, ZC), V(X0 - 2.7, YW, ZC), V(X0 - 4.7, YW - 0.2, ZC - 0.6), V(-62.4, 55.0, -132.5), V(-62.2, 50.0, -137.6), V(BANJO.x + 2.3, BANJO.y, BANJO.z), BANJO], 1.6, 0.35);
  const wheelRun = runOf(wheelOut);
  const L_WHEEL_IN = runOf(wheelIn).at(-1);
  const L_WHEEL = L_WHEEL_IN + wheelRun.at(-1);
  const S_DRAIN = SEAT_IN - YW + (XI - XO) - 0.2;
  const UNION = 2.7; // the hard stub out of the block; the hose starts here
  const wheelWeights = wheelRun.map((s) => smooth(ramp(s, UNION + 0.8, wheelRun.at(-1) - 1.2)));
  const cutAt = wheelRun.findIndex((s) => s >= UNION);
  addMesh(lines, tube(wheelOut.slice(0, cutAt + 1), 0.4, { radial: 12 }), pipeMat, { edges: false });
  addMesh(lines, lyingX(hex(0.85, 1.3)).translate(X0 - UNION, YW, ZC), solid(C.fine, { rough: 0.45, metal: 0.45 }), { edgeOpacity: 0.5 });
  const hose = partIn(lineG, "hose");
  const hoseMesh = addMesh(hose, flexTube(wheelOut.slice(cutAt), wheelWeights.slice(cutAt), 0.62, { radial: 12 }), solid(0x1a1d20, { rough: 0.9, env: 0.6 }), { edges: false });
  hoseMesh.frustumCulled = false;
  // the sensor's wire, from its boot up to the computer's connector
  const wirePath = pathOf([WIRE_FROM, V(-63.0, 51.5, -143.6), V(-60.4, 58.5, -137.5), V(-60.6, 66.2, -131.2), V(PLUG.x - 1.2, PLUG.y, PLUG.z), PLUG], 1.4, 0.35);
  const wireRun = runOf(wirePath);
  const wireWeights = wireRun.map((s) => 1 - smooth(ramp(s, 0.6, 16)));
  const wire = partIn(lineG, "wire");
  const wireMesh = addMesh(wire, flexTube(wirePath, wireWeights, 0.3, { radial: 10 }), solid(0x24282c, { rough: 0.8, env: 0.6 }), { edges: false });
  wireMesh.frustumCulled = false;

  // ── the light in them ──
  const feed = fluid();
  const wheel = fluid();
  const drain = fluid();
  const back = fluid();
  wheel.u.uGateTo.value = SEAT_IN - YW - 0.35; // shut, the whole drop goes dark: two lights, one above the other, and the needle between them
  lineG.add(lightMesh(tube(feedOut, 0.56, { radial: 12, onPath: true }), feed.rigid), lightMesh(flexTube(wheelOut, wheelWeights, wheelRun.map((s) => (s < UNION ? 0.56 : 0.8)), { radial: 12, onPath: true, s0: L_WHEEL_IN }), wheel.flex));
  const drainPath = pathOf([V(XO, SEAT_OUT - 0.05, ZC), V(XO, YB, ZC), V(ACC.mouth, YB, ZC)], 0.3, 0.2);
  const backPath = pathOf([V(XO, YB, ZC), V(XR, YB, ZC), V(XR, YF, ZC)], 0.35, 0.2);
  unitG.add(
    lightMesh(tube(feedIn, 0.42, { radial: 12, onPath: true, s0: L_FEED_OUT }), feed.rigid),
    lightMesh(tube(wheelIn, 0.42, { radial: 12, onPath: true }), wheel.rigid),
    lightMesh(tube(drainPath, 0.34, { radial: 10, onPath: true }), drain.rigid),
    lightMesh(tube(backPath, 0.32, { radial: 10, onPath: true }), back.rigid),
  );
  const pulses = pulseMaterial();
  lineG.add(lightMesh(flexTube(wirePath, wireWeights, 0.5, { radial: 10, onPath: true }), pulses));

  /* ══ THE BENCH: a post under the unit, another under the servo ══ */
  const stand = grp();
  const props = partIn(stand, "stand");
  {
    const foot = solid(0x1f2327, { rough: 0.95, env: 0.3 });
    const under = Y0 - MOTOR.h - 0.5;
    const belly = MY - 12.5;
    addMesh(props, mergeGeometries([turnY([[0, 0], [4.2, 0], [4.2, 0.4], [1.2, 1.2], [0.8, 2.2], [0.8, under - 1.4], [2.4, under - 0.6], [2.4, under], [0, under]], 40).translate(U.x, 0, U.z), turnY([[0, 0], [5, 0], [5, 0.4], [1.4, 1.3], [1.0, 2.4], [1.0, belly - 1.9], [3.0, belly - 0.7], [3.0, belly], [0, belly]], 40).translate(MX, 0, MASTER.servo[2])]), foot, { edgeOpacity: 0.3 });
  }

  /* ── anchors ── */
  const A = {
    hub: anchor(rimG, -11, 0, 0),
    tyre: anchor(tyreG, 0, -R, 0),
    disc: anchor(discG, D0, 3.5, 12.5),
    caliper: anchor(calRot, 0.6, 13.4, 0),
    ring: anchor(hubG, A_RING - 0.9, 1.5, RING.r - 0.4),
    sensor: anchor(hubG, A_RING, 11.4, 0.9),
    ecu: anchor(ecuG, U.x, Y1 + ECU_H, ZF),
    unit: anchor(unitG, U.x, U.y, ZF),
    inlet: anchor(vIn.g, XI, (COIL.y0 + COIL.y1) / 2, ZC + COIL.r),
    outlet: anchor(vOut.g, XO, (COIL.y0 + COIL.y1) / 2, ZC + COIL.r),
    pump: anchor(pumpG, PUMP.x, YB, ZC + 0.56),
    motor: anchor(motorG, U.x, Y0 - MOTOR.h / 2, U.z + MOTOR.r),
    pedal: anchor(padG, 0, 0, 0),
    master: anchor(pedalG, MX - 2.6, MY, -111),
    hose: anchor(lineG, -62.4, 55.0, -132.5),
  };

  /* ── what lights up when the voice names a part: its solids, and the lines of its edges ── */
  const special = new Set([vIn.coilMat, vOut.coilMat]); // their emission is written every frame: a live coil adds to it
  const glowOf = (mat) => 0.11 * (1 - 0.85 * Math.min(1, 0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b));
  const lampOf = (...parts) => {
    const mats = parts.flatMap((part) => [...part.userData.part.mats]);
    const lineMats = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lineMats) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.glow = glowOf(mat);
    }
    return { solids, lines: lineMats, on: -1 };
  };
  const lamps = { ring: lampOf(ring, teeth, toothBlur), sensor: lampOf(sensor), ecu: lampOf(ecu), valves: lampOf(vIn.coil, vIn.needle, vOut.coil, vOut.needle), pump: lampOf(motor, pump) };
  const light = (lamp, k) => {
    if (lamp.on === k) return;
    lamp.on = k;
    for (const mat of lamp.solids) {
      if (!special.has(mat)) mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k);
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.7 * k);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };
  const arm = {};
  const tmp = new THREE.Color();
  const put = (group, to, e, step, d = 0) => group.position.set(to[0] * e + (step ? step[0] * d : 0), to[1] * e + (step ? step[1] * d : 0), to[2] * e + (step ? step[2] * d : 0));

  return {
    root, A,
    parts: { tyre, rim, disc, ring, teeth, sensor, caliper, pads, block, ecu, motor, pump, lever, pad },
    update(p, time = 0) {
      const bench = (p.bench ?? 0) > 0.5;
      const k = clamp01(p.explode ?? 0);
      const whole = 1 - smooth(ramp(k, 0, 0.18)); // what only makes sense assembled leaves first
      const xray = clamp01(p.xray ?? 0);
      const steer = Math.max(-1, Math.min(1, p.steer ?? 0));
      const brake = clamp01(p.brake ?? 0);
      const grip = clamp01(p.grip ?? 0);
      const lock = clamp01(p.lock ?? 0);
      const inlet = clamp01(p.inlet ?? 1);
      const outlet = clamp01(p.outlet ?? 0);
      const pumping = clamp01(p.pump ?? 0);
      const sense = clamp01(p.sense ?? 0);
      const wkmh = Math.max(0, p.wkmh ?? 0);

      // ── the wheel: it steers, it turns
      corner.rotation.y = steer * STEER;
      const turn = -(p.rolled ?? 0) * SPIN;
      tyreSpin.rotation.x = rimSpin.rotation.x = discSpin.rotation.x = hubSpin.rotation.x = turn;
      hoseMesh.morphTargetInfluences[0] = wireMesh.morphTargetInfluences[0] = Math.max(steer, 0);
      hoseMesh.morphTargetInfluences[1] = wireMesh.morphTargetInfluences[1] = Math.max(-steer, 0);
      // what turns too fast to be counted melts into its mean (on the bench the wheel is turned by hand: always sharp)
      const melt = bench ? 0 : smooth(ramp(wkmh, 3, 14));
      setPartOpacity(toothBlur, melt);
      setPartOpacity(vaneBlur, melt);
      teeth.visible = vanes.visible = melt < 0.995;

      // ── the brake
      const off = GAP * (1 - grip);
      const apart = settle(ramp(k, 0.62, 1));
      padOutG.position.set(-off - apart, OPEN.pads * apart, 0);
      padInG.position.set(off + apart, OPEN.pads * apart, 0);
      discMat.emissive.copy(INK).multiplyScalar(0.035).lerp(tmp.copy(SIGNAL).multiplyScalar(0.36), lock);
      liningMat.emissive.copy(SIGNAL).multiplyScalar(0.7 * lock);
      lockBall.visible = lock > 0.004;
      lockBall.material.uniforms.uRadius.value = 9 + 5 * lock;
      lockBall.material.uniforms.uMinPx.value = 24 * lock;
      lockBall.material.uniforms.uAmount.value = 0.6 * lock * lock;
      lockLight.intensity = 170 * lock;

      // ── the X-ray
      setPartOpacity(tyre, 1 - xray);
      setPartOpacity(mark, 1 - 0.7 * xray);
      setPartOpacity(rim, 1 - xray);
      tyreGlass.visible = rimGlass.visible = xray > 0.004;
      wheelGlass.uniforms.uAmount.value = xray;
      rimLines.material.opacity = 0.45 * xray;
      for (const line of lipLines) line.material.opacity = 0.35 * xray;
      for (const line of tyreLines) line.material.opacity = 0.4 + 0.2 * xray;
      setPartOpacity(block, 1 - xray);
      blockGlass.visible = xray > 0.004;
      blockGlassMat.uniforms.uAmount.value = xray;
      blockLines.material.opacity = 0.5 * xray;

      // ── the valves, the accumulator, the pump
      const shut = 1 - inlet;
      vIn.slide.position.y = -shut * STROKE;
      vOut.slide.position.y = outlet * STROKE;
      const litValves = clamp01(p.litValves ?? 0);
      vIn.coilMat.emissive.copy(VEILLE).multiplyScalar(vIn.coilMat.userData.glow * litValves + 0.85 * shut);
      vOut.coilMat.emissive.copy(VEILLE).multiplyScalar(vOut.coilMat.userData.glow * litValves + 0.85 * outlet);
      const taken = smooth(outlet);
      accSlide.position.x = -ACC.travel * taken;
      accSpring.morphTargetInfluences[0] = taken;
      const depth = 0.25 + ACC.travel * taken;
      accGlow.scale.x = depth;
      accGlow.position.x = ACC.mouth - depth / 2;
      accGlow.visible = taken * whole > 0.004;
      setGlow(accGlowMat, 0.42 * taken * whole);
      const cam = PUMP.e * pumping;
      camG.position.set(cam * Math.cos(time * PUMP.rate), 0, cam * Math.sin(time * PUMP.rate));
      pumpSlide.position.x = cam * Math.cos(time * PUMP.rate);

      // ── the fluid: where the pressure is, which way it runs
      const filling = inlet * smooth(ramp(brake - grip, 0.03, 0.3)); // your foot's pressure is above the caliper's, and the way is open
      const letting = outlet * (0.35 + 0.65 * grip);
      feed.u.uTime.value = wheel.u.uTime.value = drain.u.uTime.value = back.u.uTime.value = time;
      feed.u.uAmount.value = wheel.u.uAmount.value = drain.u.uAmount.value = back.u.uAmount.value = whole;
      feed.u.uLevel.value = 0.85 * smooth(ramp(brake, 0, 0.3)) * (0.35 + 0.65 * brake);
      feed.u.uHead.value = (L_FEED + 1) * ramp(brake, 0, 0.3) + (brake >= 0.3 ? 1e3 : 0);
      const feedRun = filling - pumping;
      feed.u.uRun.value = feedRun;
      feed.u.uTo.value = feedRun < 0 ? S_RISER : 1e4;
      wheel.u.uLevel.value = 0.85 * smooth(ramp(grip, 0, 0.12)) * (0.2 + 0.8 * Math.pow(grip, 1.5));
      wheel.u.uHead.value = (L_WHEEL + 1) * ramp(grip, 0, 0.12) + (grip >= 0.12 ? 1e3 : 0);
      const wheelFlow = filling - letting;
      wheel.u.uRun.value = wheelFlow;
      wheel.u.uFrom.value = wheelFlow < 0 ? S_DRAIN : -10;
      wheel.u.uGate.value = inlet;
      wheel.u.uSteer.value = steer;
      drain.u.uLevel.value = 0.7 * outlet;
      drain.u.uRun.value = outlet;
      back.u.uLevel.value = 0.4 * pumping;
      back.u.uRun.value = pumping;

      // ── the sensor: its pulses, as fast as the wheel turns
      const turning = smooth(ramp(wkmh, 0.5, 6));
      pulses.uniforms.uTime.value = time;
      pulses.uniforms.uSense.value = sense * whole;
      pulses.uniforms.uW4.value = turning;
      pulses.uniforms.uW2.value = smooth(ramp(wkmh, 22, 38));
      pulses.uniforms.uW1.value = smooth(ramp(wkmh, 52, 68));
      pulses.uniforms.uSteer.value = steer;
      senseBall.visible = sense * turning > 0.004;
      senseBall.material.uniforms.uRadius.value = 1.6;
      senseBall.material.uniforms.uMinPx.value = 7;
      senseBall.material.uniforms.uAmount.value = 0.45 * sense * turning;

      // ── the pedal: the pad is where plan.js says your foot is; the lever and the push rod follow
      const at = pedalPad(brake, clamp01(p.pulse ?? 0), time);
      armTo(at, arm);
      leverG.rotation.x = arm.turn;
      armMesh.scale.y = arm.len / ARM0.len;
      padG.position.set(at[0], at[1], at[2]);
      padG.rotation.x = PAD_TILT + (arm.turn - ARM0.turn);
      const cy = PV[1] - CLEVIS * Math.cos(arm.turn);
      const cz = PV[2] - CLEVIS * Math.sin(arm.turn);
      rodG.position.set(PV[0], cy, cz);
      rodG.rotation.x = Math.atan2(ROD_TO[0] - cy, -(ROD_TO[1] - cz));

      // ── opened (the bench): two tiers across the camera. The wheel comes off first, the caliper lifts off the
      //    disc, the disc leaves the hub; the hydraulics rise before anything passes under them
      const rimOut = trap(k, 0, 0.14, 0.6, 0.9);
      put(rimG, OPEN.rim, settle(ramp(k, 0.42, 0.95)), STEP.rim, rimOut);
      tyreG.position.copy(rimG.position);
      tyreG.position.x += OPEN.tyre * settle(ramp(k, 0.06, 0.6));
      put(calG, OPEN.cal, settle(ramp(k, 0.2, 0.8)), STEP.cal, trap(k, 0.1, 0.24, 0.55, 0.85));
      put(discG, OPEN.disc, settle(ramp(k, 0.3, 0.85)), STEP.disc, trap(k, 0.2, 0.36, 0.66, 0.92));
      put(hubG, OPEN.hub, settle(ramp(k, 0.38, 0.92)));
      const rise = settle(ramp(k, 0.02, 0.4));
      const slide = settle(ramp(k, 0.25, 0.8));
      unitG.position.set(OPEN.unit[0] * slide, OPEN.unit[1] * rise, OPEN.unit[2] * slide);
      pedalG.position.set(OPEN.pedal[0] * slide, OPEN.pedal[1] * rise, OPEN.pedal[2] * slide);
      ecuG.position.y = OPEN.ecu * settle(ramp(k, 0.5, 0.92));
      vIn.g.position.y = vOut.g.position.y = OPEN.valves * settle(ramp(k, 0.56, 1));
      motorG.position.y = OPEN.motor * settle(ramp(k, 0.5, 0.92));
      pumpG.position.y = OPEN.pump * settle(ramp(k, 0.58, 1));
      setPartOpacity(lines, whole);
      setPartOpacity(hose, whole);
      setPartOpacity(wire, whole);
      stand.visible = bench && whole > 0.004;
      if (stand.visible) setPartOpacity(props, whole);

      // ── the part the voice names
      light(lamps.ring, clamp01(p.litRing ?? 0));
      light(lamps.sensor, clamp01(p.litSensor ?? 0));
      light(lamps.ecu, clamp01(p.litEcu ?? 0));
      light(lamps.valves, litValves);
      light(lamps.pump, clamp01(p.litPump ?? 0));
      blockGlassMat.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.45 * litValves);
    },
  };
}
