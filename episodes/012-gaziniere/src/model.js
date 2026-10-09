// DOSSIER 012 — Gazinière : the system. Everything that belongs to the hero burner, as ONE rigid assembly:
//   · the burner: its cup under the top, the crown with its row of slots, the enamelled cap, the injector underneath
//   · the thermocouple: a pin standing in the flame beside the crown, and its thin lead running under the top
//   · the knob (you push it DOWN) and its spindle, which ends in a cone inside the tap
//   · the tap: a small machined block clamped on the gas rail, and its outlet tube to the injector
//   · THE HEART, screwed into the back of the tap, the size of a finger joint — the magnet unit. On its axis, from the
//     tap backward: the seat · the seal (a rubber pad on a bright cup) · the closing spring · a fixed guide · the
//     armature plate · the electromagnet (a U core, one coil on each leg) · and the can that holds it all.
// Centimetres, y up. The origin is the centre of the burner on the hob's top face; the axes are the kitchen's
// (plan.js: PARTS). The camera stands on the −x / +z side: what matters faces it.
// Two liberties, taken to be read in one frame (see docs/journal/012-model.md): the valve's stroke is 7 mm (4 in a
// real one), and the spindle pushes the seal through a cone and a cross pin (a real tap pushes along its own axis).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, setGlow, glass, asShell, edgesOf, makePart, addMesh, setPartOpacity, anchor, box, cyl, lathe, plate, mergeGeometries } from "@kit/build3d.js";
import { PARTS, BURNERS, KNOBS, SYSTEM } from "./plan.js";

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

/* ─────────────────────────────────────────────────────────── where everything is */

const B = PARTS.burner;
const RING = BURNERS[0].r; // the circle of flame ports
const TIP = PARTS.tip;
const KNOB = PARTS.knob;
const TAP = PARTS.tap;
const AX = { x: PARTS.magnet.x, y: PARTS.magnet.y }; // the magnet unit's axis, along z
const Z0 = PARTS.magnet.z0; // the back face of the tap: the can screws in here
const Z1 = PARTS.magnet.z1; // the can's rear end: the lead's nut
const CAN_R = 0.9; // plan.js says 0.8: one millimetre more, for the U and the spring to read
/** How far the seal, the spring's end and the armature travel. 4 mm in a real unit: 7 here, so that the snap shows on a thumbnail. */
export const STROKE = 0.7;
const SEAT = Z0 + 0.02; // where the pad shuts
const BUSH = 13.1; // the fixed guide: the spring pushes against it
const POLE = 12.0; // the face of the magnet's poles
const SPRING = { r: 0.42, wire: 0.055, turns: 4, z0: BUSH + 0.06, z1: SEAT - 0.36 }; // z1: against the seal's cup, valve shut
const TRAVEL = KNOBS.travel;
const KNOB_Y = 0.6; // the knob floats this far above the top: it goes down by TRAVEL
const CONE = { r0: 0.08, h: 0.6, y: AX.y - 0.05 }; // the spindle's end: its radius grows by STROKE while it goes down by TRAVEL
const PIN_Z = KNOB.z - (CONE.r0 + (STROKE / TRAVEL) * 0.05); // the cross pin's nose, at rest, on the cone
const RAIL = PARTS.rail;
// the outlet: out of the tap's +x face, then straight under the top to the injector. (plan.js ran it at y = −3.9:
// seen in profile it lay exactly behind the magnet unit and the lead.)
const OUTLET = [V(TAP.x + TAP.w / 2, -2.7, 15.0), V(0, -2.7, 15.0), V(0, -3.0, 0.55)];
const LEAD = [V(TIP.x, -0.95, TIP.z), V(TIP.x, -1.9, TIP.z), V(TIP.x, -3.2, 5.9), V(AX.x, AX.y, 8.4), V(AX.x, AX.y, Z1 - 0.4)];
const FLOOR = -SYSTEM.bench[1]; // the bench's floor, in this frame

// The exploded view: a row across a camera filming toward az −44, centred over the bench's origin, every part at the
// same depth. `s`: where a part's centre stands along the row (cm, + to the right of the picture).
const ROW_AZ = -44 * DEG;
const ROW = { x: Math.cos(ROW_AZ), z: -Math.sin(ROW_AZ), cx: -SYSTEM.bench[0], cz: -SYSTEM.bench[2] };
const slot = (x, z, s) => [ROW.cx + s * ROW.x - x, 0, ROW.cz + s * ROW.z - z];
const OPEN = {
  burner: slot(0, 0, -8.8),
  tc: slot(0, 0, -8.8).map((v, i) => v + [ROW.x, 0, ROW.z][i] * 1.0), // the pin stays beside the crown: "in the flame"
  can: slot(AX.x, (Z0 + Z1) / 2, 0.85),
  magnet: slot(AX.x, 11.55, 4.45),
  arm: slot(AX.x, POLE + STROKE + 0.07, 6.3),
  valve: slot(AX.x, 13.8, 8.45),
  tap: slot(TAP.x, TAP.z, 12.25),
  knob: 2.4, // …and the knob rises off its spindle, above the tap
  crown: 1.2,
  cap: 2.6,
};

const FLOW = { period: 1.7, duty: 0.56, speed: 5 }; // cm, cm/s: 0.17 cm a frame, a tenth of a period — it runs, it does not strobe
const VOLT = { period: 1.3, duty: 0.55, speed: 1.8 }; // slowly: a few millivolts

/* ─────────────────────────────────────────────────────────── geometry */

const lyingZ = (g) => g.rotateX(Math.PI / 2); // a lathe's axis (y) laid along +z
const lyingX = (g) => g.rotateZ(-Math.PI / 2); // …along +x
/** A lathe written [radius, z] round the magnet unit's axis. */
const onAxis = (profile, segments = 48, o = { bevel: 0.03, round: 2 }) => lyingZ(lathe(profile, segments, o)).translate(AX.x, AX.y, 0);
const ringOf = (r0, r1, a, b) => [[r0, a], [r1, a], [r1, b], [r0, b], [r0, a]];
const hex = (r, h, bevel = 0.05) => cyl(r, h, bevel, 6);

/** A polyline with its corners rounded, the way a tube is bent. `cut`: how far each corner is cut back. */
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

/** No stretch of a polyline longer than `stride`: a ruler fine enough for a head of light to travel along it. */
function resampled(points, stride = 0.25) {
  const out = [points[0].clone()];
  for (let i = 1; i < points.length; i++) {
    const n = Math.max(1, Math.ceil(points[i].distanceTo(points[i - 1]) / stride));
    for (let j = 1; j <= n; j++) out.push(points[i - 1].clone().lerp(points[i], j / n));
  }
  return out;
}

/**
 * A round swept through `points` (its frame carried from one to the next: no twist at a bend). `radii`: one number, or
 * one per point. It carries `aS`, the length run since the first point, and `aRad`. `onPath`: the vertices are left ON
 * the path — the shader pushes them out by their radius, or by a few pixels if that is more (see sheathMaterial).
 */
function tube(points, radii, { radial = 12, onPath = false } = {}) {
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
      sAt.push(s);
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

/** The closing spring between z = `a` and z = `b`, round the unit's axis. Same wire, same turns whatever its length: two of them morph. */
function helix(a, b) {
  const n = SPRING.turns * 30;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const th = t * SPRING.turns * Math.PI * 2;
    pts.push(V(AX.x + SPRING.r * Math.cos(th), AX.y + SPRING.r * Math.sin(th), a + (b - a) * t));
  }
  return tube(pts, SPRING.wire, { radial: 8 });
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
const SHEATH_VERTEX = /* glsl */ `
  attribute float aS; attribute float aRad; uniform float uMinPx;
  varying float vS; varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 c = modelViewMatrix * vec4(position, 1.0);
    float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
    vec4 mv = modelViewMatrix * vec4(position + normal * max(aRad, uMinPx * cmPerPx), 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vS = aS;
    gl_Position = projectionMatrix * mv;
  }`;

/**
 * The current the hot tip makes, as a sheath of veille light round the lead (s = 0 at the tip).
 *   uVolts 0 → 0.4   a head of light travels from the tip to the magnet, the lead lit behind it
 *          0.4 → 1   the whole lead gains in brightness, wide dashes run slowly toward the magnet
 */
const voltMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: VEILLE.clone() }, uTime: { value: 0 }, uVolts: { value: 0 }, uLen: { value: 1 }, uAmount: { value: 1 }, uMinPx: { value: 2.6 } },
    vertexShader: SHEATH_VERTEX,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uVolts, uLen, uAmount;
      varying float vS; varying vec3 vN; varying vec3 vV;
      ${BARS}
      void main() {
        float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.2);
        float head = (uLen + 0.6) * clamp(uVolts / 0.4, 0.0, 1.0);
        float behind = (1.0 - smoothstep(head - 0.5, head + 0.05, vS)) * smoothstep(0.0, 0.04, uVolts);
        float level = clamp((uVolts - 0.4) / 0.6, 0.0, 1.0);
        float dash = bars((vS - uTime * ${VOLT.speed.toFixed(2)}) / ${VOLT.period.toFixed(2)}, ${VOLT.duty.toFixed(2)});
        float line = behind * mix(0.4, 0.45 + 1.05 * dash, level);
        float going = smoothstep(0.0, 0.04, uVolts) * (1.0 - smoothstep(0.36, 0.44, uVolts));
        float gap = vS - head;
        float lead = going * 1.7 * exp(-gap * gap / 0.5);
        gl_FragColor = vec4(uColor * min(line + lead, 2.6) * body * uAmount, 1.0);
      }`,
  });

/** The gas, from the rail through the seat and down the outlet tube to the injector: wide signal dashes that run. */
const flowMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL.clone() }, uTime: { value: 0 }, uFlow: { value: 0 }, uMinPx: { value: 2.4 } },
    vertexShader: SHEATH_VERTEX,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uFlow;
      varying float vS; varying vec3 vN; varying vec3 vV;
      ${BARS}
      void main() {
        float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.1);
        float dash = bars((vS - uTime * ${FLOW.speed.toFixed(2)}) / ${FLOW.period.toFixed(2)}, ${FLOW.duty.toFixed(2)});
        // (kept under the heart's own light: in the close frame of the magnet unit this tube runs right above the spring)
        gl_FragColor = vec4(uColor * (0.1 + 0.5 * dash) * body * uFlow, 1.0);
      }`,
  });

/** The pin going red: a skin of light over it, white-hot at its end, cooling down its length. `uHeat` 0–1. */
const heatMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uHot: { value: HOT.clone().multiplyScalar(1.5) }, uCool: { value: SIGNAL.clone().multiplyScalar(1.25) }, uHeat: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vY = position.y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot, uCool; uniform float uHeat; varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        // cooling, the red draws back toward the end of the pin
        float along = smoothstep(${(TIP.y1 - 2.2).toFixed(2)} + 1.5 * (1.0 - uHeat), ${TIP.y1.toFixed(2)}, vY);
        float core = along * along * uHeat;
        gl_FragColor = vec4(mix(uCool, uHot, core) * (0.25 + 0.75 * f) * along * uHeat, 1.0);
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
  mesh.visible = false;
  return mesh;
};

/* ─────────────────────────────────────────────────────────── the system */

/**
 * → { root, A, update(p, time, px) }. `root`: one rigid assembly, its origin the centre of the burner on the top face
 * (world.js stands it in the hob, or on the bench). `A`: anchors that follow their parts, exploded or not.
 * p (see FIRST in world.js):
 *   bench     1: on the bench — a cut piece of the top (glass), two vees under the rail, a foot under the injector
 *   shell     the kitchen's X-ray: the hob shows its own rail, ours steps aside
 *   safety    1 → 0: the pin, its lead and the whole magnet unit fade away — a bare tap, a plug where the unit was;
 *             the gas then runs whatever `valve` says
 *   press     0 → 1: the knob and its spindle go down by KNOBS.travel; the cone pushes the cross pin, the pin the seal
 *             off its seat, and the armature lands on the magnet's poles
 *   valve     1 open (seal off its seat, spring squeezed, armature on the poles) → 0 shut. Open = max(press, valve)
 *   heat      0 → 1: the pin goes red — white-hot at its end, a glow with a heart and a long tail, a light on the crown
 *   volts     0 → 0.4: a head of veille light runs down the lead from the pin to the magnet · → 1: the lead brightens,
 *             dashes run slowly toward the magnet
 *   hold      0 → 1: the coils, the poles' tips and the armature glow veille; field lines bridge the gap while there is one
 *   xray      0 → 1: the tap's body and the can turn to glass; with the valve open the gas shows — signal dashes from
 *             the rail, through the seat, down the outlet tube to the injector
 *   explode   0 → 1 (the bench): the parts in a row across a camera at az −44
 *   litTap, litSpring, litMagnet, litTip   0–1: the part the voice is naming glows faintly veille
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
  // three values of grey, and a darker one for rubber, enamel and what light must show on
  const C = { rubber: 0x14171a, dark: 0x22262a, pipe: 0x565d64, cast: 0x4d545b, mid: 0x6e757c, alu: 0x868e95, fine: 0xa9b0b6, bright: 0xd4d9dd };

  /* ── the burner ── */
  const burnerG = grp();
  const crownG = grp(burnerG);
  const capG = grp(burnerG);
  const cup = partIn(burnerG, "cup");
  {
    const m = { cast: solid(C.cast, { rough: 0.82, metal: 0.2 }), brass: solid(C.mid, { rough: 0.6, metal: 0.35 }) };
    addMesh(cup, lathe([[0, -B.cupDepth], [1.9, -B.cupDepth], [4.5, -0.55], [4.5, 0], [5.1, 0], [5.1, 0.3], [4.62, 0.36], [0, 0.36]], 72, { bevel: 0.06, round: 2 }), m.cast, { edgeOpacity: 0.5 });
    // the injector's holder under the cup: the outlet tube ends in it
    addMesh(cup, mergeGeometries([lathe([[0, -3.48], [0.46, -3.48], [0.56, -3.38], [0.56, -B.cupDepth], [0, -B.cupDepth]], 32, { bevel: 0.04, round: 2 }), hex(0.66, 0.3).translate(0, -3.2, 0)]), m.brass, { edgeOpacity: 0.45 });
  }
  const crown = partIn(crownG, "crown");
  {
    const m = { alu: solid(C.fine, { rough: 0.62, metal: 0.3 }), pit: solid(0x0d0f11, { rough: 1, env: 0.2 }) };
    const y0 = B.portsY - 0.38;
    const y1 = B.portsY + 0.36;
    addMesh(crown, mergeGeometries([lathe(ringOf(3.3, RING, 0.36, y0), 72, { bevel: 0.06, round: 2 }), lathe(ringOf(3.5, RING, y1, y1 + 0.14), 72, { bevel: 0.04, round: 2 })]), m.alu, { edgeOpacity: 0.5 });
    // the row of slots: the lands between them (no edge lines: forty fine lines in a ring would crawl)
    const lands = [];
    const n = 40;
    const land = box(0.42, y1 - y0, 0.56, 0.05, 1).translate(0, (y0 + y1) / 2, RING - 0.28);
    for (let i = 0; i < n; i++) lands.push(land.clone().rotateY(((i + 0.5) / n) * Math.PI * 2));
    addMesh(crown, mergeGeometries(lands), m.alu, { edges: false });
    addMesh(crown, new THREE.CylinderGeometry(RING - 0.5, RING - 0.5, y1 - y0, 48, 1, true).translate(0, (y0 + y1) / 2, 0), m.pit, { edges: false }); // what shows in the slots: the dark inside
  }
  const cap = partIn(capG, "cap");
  {
    const top = B.capTop;
    const enamel = solid(0x1b1e21, { rough: 0.85, env: 0.45 }); // matt: seen from above, a glossy cap mirrors the rim light — a ball of veille, then a pale disc
    addMesh(cap, lathe([[0, top - 0.46], [B.capR - 0.25, top - 0.46], [B.capR, top - 0.36], [B.capR, top - 0.2], [B.capR - 0.34, top], [0, top]], 72, { bevel: 0.05, round: 3 }), enamel, { edgeOpacity: 0.5 });
  }

  /* ── the thermocouple: the pin in the flame, its lead, the nut at the magnet unit ── */
  const tcG = grp();
  const tc = partIn(tcG, "thermocouple");
  const leadPath = bent(LEAD, 0.9);
  const leadRuler = resampled(leadPath, 0.22);
  const pinMat = solid(C.fine, { rough: 0.45, metal: 0.4 });
  {
    const m = { collar: solid(C.mid, { rough: 0.6, metal: 0.35 }), lead: solid(C.mid, { rough: 0.5, metal: 0.4 }), nut: solid(C.alu, { rough: 0.55, metal: 0.35 }) };
    const arc = [15, 30, 45, 60, 75].map((a) => [TIP.r * Math.cos(a * DEG), TIP.y1 - TIP.r + TIP.r * Math.sin(a * DEG)]);
    addMesh(tc, lathe([[0, -0.55], [TIP.r, -0.55], [TIP.r, TIP.y1 - TIP.r], ...arc, [0, TIP.y1]], 32).translate(TIP.x, 0, TIP.z), pinMat, { edgeOpacity: 0.5 });
    addMesh(
      tc,
      mergeGeometries([
        lathe([[TIP.r, 0], [0.52, 0], [0.52, 0.2], [0.42, 0.3], [0.42, 0.46], [TIP.r, 0.52], [TIP.r, 0]], 32, { bevel: 0.03, round: 2 }), // the collar on the top
        hex(0.52, 0.36).translate(0, -0.72, 0), // its lock nut underneath
        cyl(0.22, 0.2, 0.04, 24).translate(0, -1.0, 0),
      ]).translate(TIP.x, 0, TIP.z),
      m.collar,
      { edgeOpacity: 0.5 },
    );
    addMesh(tc, tube(leadPath, 0.11, { radial: 10 }), m.lead, { edges: false });
    addMesh(tc, lyingZ(hex(0.42, 0.45)).translate(AX.x, AX.y, Z1 - 0.225), m.nut, { edgeOpacity: 0.5 });
  }
  // the heat: a skin of light on the pin, a ball with a heart, and a real light for the crown beside it
  const heatSkin = lightMesh(
    lathe([[TIP.r + 0.035, 0.52], [TIP.r + 0.035, TIP.y1 - TIP.r], ...[15, 30, 45, 60, 75].map((a) => [(TIP.r + 0.035) * Math.cos(a * DEG), TIP.y1 - TIP.r + (TIP.r + 0.035) * Math.sin(a * DEG)]), [0, TIP.y1 + 0.035]], 24).translate(TIP.x, 0, TIP.z),
    heatMaterial(),
  );
  const heatBall = makeBall(HOT, SIGNAL, TIP.x, TIP.y1 - 0.55, TIP.z);
  const heatLight = new THREE.PointLight(BRAND.signal, 0, 9, 2);
  heatLight.position.set(TIP.x - 0.4, TIP.y1 - 0.4, TIP.z + 0.6);
  // the current: a sheath of light on the lead, and its head
  const volt = voltMaterial();
  const voltGeo = tube(leadRuler, 0.19, { radial: 10, onPath: true });
  volt.uniforms.uLen.value = voltGeo.userData.length;
  const voltSheath = lightMesh(voltGeo, volt);
  const voltHead = makeBall(VEILLE.clone().lerp(new THREE.Color(1, 1, 1), 0.5), VEILLE, 0, 0, 0);
  tcG.add(heatSkin, heatBall, heatLight, voltSheath, voltHead);
  const rulerS = [0];
  for (let i = 1; i < leadRuler.length; i++) rulerS.push(rulerS[i - 1] + leadRuler[i].distanceTo(leadRuler[i - 1]));
  const LEAD_LEN = rulerS[rulerS.length - 1];
  const alongLead = (s, out) => {
    let i = 1;
    while (i < rulerS.length - 1 && rulerS[i] < s) i++;
    const u = clamp01((s - rulerS[i - 1]) / Math.max(1e-6, rulerS[i] - rulerS[i - 1]));
    out.lerpVectors(leadRuler[i - 1], leadRuler[i], u);
  };

  /* ── the tap, the spindle and its cone, the cross pin, the seat; the knob ── */
  const tapG = grp();
  const tapBody = partIn(tapG, "tap");
  const tapShape = [
    box(TAP.w, TAP.h, TAP.d, 0.14, 3).translate(TAP.x, TAP.y, TAP.z),
    lyingZ(cyl(0.5, 0.56, 0.06, 32)).translate(TAP.x, RAIL.y, TAP.z + TAP.d / 2 + 0.28), // the nipple to the rail
    lyingX(cyl(0.42, 0.3, 0.05, 32)).translate(TAP.x + TAP.w / 2 + 0.15, OUTLET[0].y, OUTLET[0].z), // the outlet's boss
  ];
  {
    const m = { body: solid(C.alu, { rough: 0.55, metal: 0.35 }), fine: solid(C.fine, { rough: 0.5, metal: 0.4 }) };
    addMesh(tapBody, mergeGeometries(tapShape), m.body, { edgeOpacity: 0.55 });
    addMesh(
      tapBody,
      mergeGeometries([
        hex(0.68, 0.7).translate(KNOB.x, TAP.y + TAP.h / 2 + 0.35, KNOB.z), // the gland round the spindle
        lyingX(lathe(ringOf(RAIL.r, RAIL.r + 0.17, -0.55, 0.55), 48, { bevel: 0.05, round: 2 })).translate(TAP.x, RAIL.y, RAIL.z), // the strap that clamps it on the rail
        lyingZ(hex(0.24, 0.2, 0.03)).translate(TAP.x, RAIL.y, RAIL.z + RAIL.r + 0.25),
        lyingX(cyl(0.24, 0.12, 0.03, 24)).translate(TAP.x - TAP.w / 2 - 0.06, TAP.y - 0.95, TAP.z + 0.55), // the bypass screw
      ]),
      m.fine,
      { edgeOpacity: 0.5 },
    );
  }
  const tapGlassMat = glass(BRAND.ink, { base: 0.01, rim: 0.3, power: 2.6, edge: 0.45, spec: 0.5, through: 0.25 });
  const tapGlass = new THREE.Mesh(mergeGeometries(tapShape.map((g) => g.clone())), tapGlassMat);
  const tapLines = edgesOf(tapGlass.geometry, { color: BRAND.ink, width: 2, opacity: 0.5 });
  tapGlass.add(tapLines);
  tapGlass.visible = false;
  asShell(tapGlass, 10);
  tapG.add(tapGlass);
  // what stays solid inside the glass
  const tapIn = partIn(tapG, "tapInside");
  const stemG = grp(tapIn);
  const pinG = grp(tapIn);
  {
    const m = { seat: solid(C.alu, { rough: 0.55, metal: 0.4 }), steel: solid(C.fine, { rough: 0.45, metal: 0.4 }), pin: solid(C.bright, { rough: 0.4, metal: 0.4 }) };
    addMesh(tapIn, onAxis(ringOf(0.3, 0.66, SEAT, SEAT + 0.22), 40), m.seat, { edgeOpacity: 0.55 });
    const k = STROKE / TRAVEL;
    const top = CONE.y + CONE.h;
    const spindle = lathe([[0, CONE.y], [CONE.r0, CONE.y], [CONE.r0 + k * CONE.h, top], [CONE.r0 + k * CONE.h, top + 0.08], [0.3, top + 0.22], [0.3, KNOB_Y + 0.4], [0, KNOB_Y + 0.4]], 40, { bevel: 0.025, round: 2 }).translate(KNOB.x, 0, KNOB.z);
    stemG.add(addMesh(tapIn, spindle, m.steel, { edgeOpacity: 0.5 }));
    const nose = [20, 40, 60, 80].map((a) => [0.09 * Math.cos(a * DEG), PIN_Z - 0.09 + 0.09 * Math.sin(a * DEG)]);
    pinG.add(addMesh(tapIn, onAxis([[0, SEAT + 0.02], [0.09, SEAT + 0.02], [0.09, PIN_Z - 0.09], ...nose, [0, PIN_Z]], 20, {}), m.pin, { edgeOpacity: 0.4 }));
  }
  // a hob WITHOUT the safety: a plug where the magnet unit screws in
  const plug = partIn(tapG, "plug");
  addMesh(plug, mergeGeometries([lyingZ(hex(0.74, 0.3)).translate(AX.x, AX.y, Z0 - 0.15), lyingZ(cyl(0.5, 0.1, 0.04, 32)).translate(AX.x, AX.y, Z0 - 0.35)]), solid(C.fine, { rough: 0.5, metal: 0.4 }), { edgeOpacity: 0.5 });
  setPartOpacity(plug, 0);

  const knobG = grp(tapG);
  const knob = partIn(knobG, "knob");
  {
    const top = KNOB_Y + KNOBS.h;
    const m = { body: solid(C.dark, { rough: 0.78, coat: 0.12, coatRough: 0.6, env: 0.6 }), mark: solid(0xd9d4c8, { rough: 0.6 }) };
    addMesh(knob, lathe([[0, KNOB_Y], [KNOBS.r, KNOB_Y], [KNOBS.r, KNOB_Y + 0.42], [KNOBS.r - 0.3, KNOB_Y + 0.72], [KNOBS.r - 0.4, top - 0.12], [KNOBS.r - 0.52, top], [0, top]], 64, { bevel: 0.06, round: 3 }).translate(KNOB.x, 0, KNOB.z), m.body, { edgeOpacity: 0.55 });
    // its mark: a bar across the top, and down the side that faces the camera
    addMesh(knob, mergeGeometries([box(0.24, 0.07, 1.25, 0.03, 1).translate(0, top + 0.02, 0.72), box(0.24, 1.3, 0.07, 0.03, 1).translate(0, top - 0.75, KNOBS.r - 0.4)]).rotateY(-40 * DEG).translate(KNOB.x, 0, KNOB.z), m.mark, { edges: false });
  }

  /* ── the magnet unit: the can (glass under the X-ray), and in it… ── */
  const canG = grp();
  const canBody = partIn(canG, "can");
  const canShape = [
    onAxis([[0, Z1], [0.5, Z1], [0.5, Z1 + 0.15], [CAN_R, Z1 + 0.45], [CAN_R, 11.9], [CAN_R - 0.05, 11.9], [CAN_R - 0.05, 12.04], [CAN_R, 12.04], [CAN_R, Z0 - 0.44], [0, Z0 - 0.44]], 56),
    lyingZ(hex(1.06, 0.44, 0.06)).translate(AX.x, AX.y, Z0 - 0.22),
  ];
  {
    const m = { can: solid(C.mid, { rough: 0.6, metal: 0.35 }), nut: solid(C.fine, { rough: 0.5, metal: 0.4 }) };
    addMesh(canBody, canShape[0], m.can, { edgeOpacity: 0.5 });
    addMesh(canBody, canShape[1], m.nut, { edgeOpacity: 0.5 });
  }
  const canGlassMat = glass(BRAND.ink, { base: 0.012, rim: 0.36, power: 2.4, edge: 0.5, spec: 0.6, through: 0.25 });
  const canGlass = new THREE.Mesh(mergeGeometries(canShape.map((g) => g.clone())), canGlassMat);
  const canLines = edgesOf(canGlass.geometry, { color: BRAND.ink, width: 2, opacity: 0.5 });
  canGlass.add(canLines);
  canGlass.visible = false;
  asShell(canGlass, 10);
  canG.add(canGlass);
  // …the fixed guide: the wall the spring pushes against
  const bush = partIn(canG, "guide");
  addMesh(bush, onAxis([[0.13, BUSH - 0.2], [0.34, BUSH - 0.2], [0.34, BUSH - 0.1], [CAN_R - 0.15, BUSH - 0.1], [CAN_R - 0.15, BUSH], [0.13, BUSH], [0.13, BUSH - 0.2]], 40), solid(C.mid, { rough: 0.6, metal: 0.35 }), { edgeOpacity: 0.5 });

  // …the seal on its rod, and the spring
  const valveG = grp();
  const valveSlide = grp(valveG);
  const valve = partIn(valveSlide, "seal");
  {
    const m = { pad: solid(C.rubber, { rough: 0.95, env: 0.4 }), cup: solid(C.bright, { rough: 0.42, metal: 0.4 }), rod: solid(C.fine, { rough: 0.45, metal: 0.4 }) };
    addMesh(valve, onAxis([[0, SEAT - 0.2], [0.5, SEAT - 0.2], [0.5, SEAT], [0, SEAT]], 40), m.pad, { edgeOpacity: 0.6 });
    addMesh(valve, onAxis([[0, SEAT - 0.42], [0.22, SEAT - 0.42], [0.22, SEAT - 0.3], [0.6, SEAT - 0.3], [0.6, SEAT - 0.2], [0, SEAT - 0.2]], 40), m.cup, { edgeOpacity: 0.5 });
    addMesh(valve, lyingZ(cyl(0.1, SEAT - 0.3 - (POLE + STROKE + 0.14), 0.02, 16)).translate(AX.x, AX.y, (SEAT - 0.3 + POLE + STROKE + 0.14) / 2), m.rod, { edges: false });
  }
  const spring = partIn(valveG, "spring");
  const springMat = solid(C.bright, { rough: 0.38, metal: 0.5 });
  const springGeo = helix(SPRING.z0, SPRING.z1);
  {
    const squeezed = helix(SPRING.z0, SPRING.z1 - STROKE);
    springGeo.morphAttributes.position = [squeezed.attributes.position];
    springGeo.morphAttributes.normal = [squeezed.attributes.normal];
  }
  const springMesh = addMesh(spring, springGeo, springMat, { edges: false });
  springMesh.frustumCulled = false;

  // …the armature plate, on the end of the rod
  const armG = grp();
  const armSlide = grp(armG);
  const arm = partIn(armSlide, "armature");
  const armMat = solid(C.fine, { rough: 0.45, metal: 0.4 });
  addMesh(arm, box(0.7, 1.0, 0.14, 0.03, 2).translate(AX.x, AX.y, POLE + STROKE + 0.07), armMat, { edgeOpacity: 0.55 });

  // …the electromagnet: a U core (its legs one above the other: the U reads in profile), a coil on each leg
  const magnetG = grp();
  const magnet = partIn(magnetG, "magnet");
  const coilMat = solid(C.dark, { rough: 0.7, metal: 0.2 });
  const LEG = 0.3; // each leg's height off the axis
  {
    const core = solid(C.mid, { rough: 0.6, metal: 0.35 });
    const u = [[Z1 + 0.2, -0.43], [POLE, -0.43], [POLE, -0.17], [Z1 + 0.45, -0.17], [Z1 + 0.45, 0.17], [POLE, 0.17], [POLE, 0.43], [Z1 + 0.2, 0.43]];
    addMesh(magnet, plate(u, 0.34, { bevel: 0.03 }).rotateY(-Math.PI / 2).translate(AX.x + 0.17, AX.y, 0), core, { edgeOpacity: 0.55 });
    const coil = lyingZ(lathe([[0.19, -0.22], [0.29, -0.22], [0.29, -0.17], [0.26, -0.17], [0.26, 0.17], [0.29, 0.17], [0.29, 0.22], [0.19, 0.22]], 32, { bevel: 0.015, round: 1 }));
    addMesh(magnet, mergeGeometries([-1, 1].map((s) => coil.clone().translate(AX.x, AX.y + s * LEG, POLE - 0.4))), coilMat, { edgeOpacity: 0.5 });
    // the lead's end, from the can's rear to the coils
    addMesh(magnet, lyingZ(cyl(0.07, 0.2, 0.02, 12)).translate(AX.x, AX.y, Z1 + 0.1), core, { edges: false });
  }
  // the grip: a band of light round each pole's tip, field lines across the gap, a soft ball round the whole
  const poleMat = glow(BRAND.veille, 0);
  const poles = lightMesh(mergeGeometries([-1, 1].map((s) => new THREE.BoxGeometry(0.39, 0.31, 0.07).translate(AX.x, AX.y + s * LEG, POLE - 0.035))), poleMat);
  const fieldMat = glow(BRAND.veille, 0, { additive: true });
  const fieldLines = [];
  for (const s of [-1, 1]) for (const dy of [-0.09, 0, 0.09]) fieldLines.push(lyingZ(new THREE.CylinderGeometry(0.024, 0.024, 1, 8, 1, true)).translate(AX.x, AX.y + s * LEG + dy, 0.5));
  const field = lightMesh(mergeGeometries(fieldLines), fieldMat);
  field.position.z = POLE;
  const holdBall = makeBall(VEILLE.clone().lerp(new THREE.Color(1, 1, 1), 0.35), VEILLE, AX.x, AX.y, POLE - 0.2);
  magnetG.add(poles, field, holdBall);

  /* ── the pipes: the outlet tube (always), and on the bench a stub of the rail ── */
  const outletPath = bent(OUTLET, 1.1);
  const pipe = partIn(root, "outlet");
  {
    const m = { tube: solid(C.pipe, { rough: 0.6, metal: 0.3 }), nut: solid(C.alu, { rough: 0.55, metal: 0.35 }) };
    addMesh(pipe, tube(outletPath, 0.26, { radial: 14 }), m.tube, { edges: false });
    addMesh(pipe, mergeGeometries([lyingX(hex(0.46, 0.4)).translate(OUTLET[0].x + 0.5, OUTLET[0].y, OUTLET[0].z), lyingZ(hex(0.46, 0.4)).translate(0, OUTLET[2].y, OUTLET[2].z + 0.2)]), m.nut, { edgeOpacity: 0.45 });
  }
  const railStub = partIn(root, "rail");
  addMesh(railStub, lyingX(lathe(ringOf(RAIL.r - 0.2, RAIL.r, -2.7, 2.7), 48, { bevel: 0.05, round: 2 })).translate(TAP.x, RAIL.y, RAIL.z), solid(C.pipe, { rough: 0.6, metal: 0.3 }), { edgeOpacity: 0.5 });

  // the gas: one path, from the rail, under the cone, through the seat, round the seal, out to the tube and the injector
  const inside = [V(TAP.x, RAIL.y, RAIL.z), V(TAP.x, RAIL.y, TAP.z + 1.0), V(TAP.x, AX.y - 0.82, KNOB.z - 0.5), V(AX.x, AX.y - 0.36, SEAT + 0.36), V(AX.x, AX.y - 0.17, SEAT + 0.1), V(AX.x, AX.y - 0.12, SEAT - 0.26), V(AX.x + 0.5, AX.y + 0.5, SEAT - 0.3), V(OUTLET[0].x - 0.5, OUTLET[0].y, OUTLET[0].z)];
  const gasPath = resampled([...bent(inside, 0.25, 4), ...outletPath], 0.3);
  const gasRadii = gasPath.map((p) => (p.x > OUTLET[0].x - 0.1 ? 0.37 : 0.11));
  const flow = flowMaterial();
  const gasSheath = lightMesh(tube(gasPath, gasRadii, { radial: 12, onPath: true }), flow);
  root.add(gasSheath);

  /* ── the bench: a piece of the top cut clean (glass), two vees under the rail, a foot under the injector ── */
  const stand = grp();
  const props = partIn(stand, "stand");
  {
    const m = { foot: solid(0x1f2327, { rough: 0.95, env: 0.3 }), post: solid(0x2a2f34, { rough: 0.85, env: 0.4 }) };
    const top = RAIL.y - 0.35;
    const vee = plate([[-1.25, FLOOR], [1.25, FLOOR], [1.25, top], [0.8, top], [0, top - 0.8], [-0.8, top], [-1.25, top]], 0.9, { bevel: 0.06 }).rotateY(-Math.PI / 2);
    addMesh(props, mergeGeometries([-1.95, 1.95].map((dx) => vee.clone().translate(TAP.x + dx + 0.45, 0, RAIL.z))), m.post, { edgeOpacity: 0.3 });
    addMesh(props, lathe([[0, FLOOR], [1.5, FLOOR], [1.5, FLOOR + 0.2], [0.62, FLOOR + 0.5], [0.42, FLOOR + 0.7], [0.42, -3.8], [0.62, -3.64], [0.62, -3.48], [0, -3.48]], 40, { bevel: 0.05, round: 2 }), m.foot, { edgeOpacity: 0.3 });
  }
  const slabMat = glass(BRAND.ink, { base: 0.004, rim: 0.09, power: 3, edge: 0.22, spec: 0.25 });
  const slab = (() => {
    const R = 6.7; // round the burner
    const w = 2.7; // half the tongue that carries the knob
    const shape = new THREE.Shape();
    const a0 = Math.atan2(Math.sqrt(R * R - (KNOB.x + w) ** 2), KNOB.x + w);
    const a1 = Math.atan2(Math.sqrt(R * R - (KNOB.x - w) ** 2), KNOB.x - w);
    shape.moveTo(R * Math.cos(a0), R * Math.sin(a0));
    shape.absarc(0, 0, R, a0, a1, true);
    shape.lineTo(KNOB.x - w, KNOB.z);
    shape.absarc(KNOB.x, KNOB.z, w, Math.PI, 0, true);
    shape.closePath();
    const hole = (x, z, r) => shape.holes.push(new THREE.Path().absarc(x, z, r, 0, Math.PI * 2, false));
    hole(0, 0, 4.62);
    hole(KNOB.x, KNOB.z, 0.5);
    hole(TIP.x, TIP.z, 0.42);
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false, curveSegments: 40 }).rotateX(Math.PI / 2), slabMat);
    const lines = edgesOf(mesh.geometry, { color: BRAND.ink, width: 2, opacity: 0.55, threshold: 30 });
    mesh.add(lines);
    asShell(mesh, 20);
    stand.add(mesh);
    return { mesh, lines };
  })();

  /* ── anchors ── */
  const A = {
    burner: anchor(capG, 0, B.capTop, 0),
    ports: anchor(crownG, -0.5 * RING, B.portsY, 0.87 * RING), // on the camera's side
    tip: anchor(tcG, TIP.x, TIP.y1 - 0.4, TIP.z),
    lead: anchor(tcG, TIP.x, -3.2, 5.9),
    knob: anchor(knobG, KNOB.x, KNOB_Y + KNOBS.h, KNOB.z),
    tap: anchor(tapG, TAP.x - TAP.w / 2, TAP.y, TAP.z),
    magnet: anchor(magnetG, AX.x, AX.y, POLE - 0.45),
    spring: anchor(valveG, AX.x, AX.y, (SPRING.z0 + SPRING.z1) / 2),
    seal: anchor(valveSlide, AX.x, AX.y, SEAT - 0.1),
  };

  /* ── what lights up when the voice names a part: its solids, and the lines of its edges ── */
  const special = new Set([pinMat, coilMat, armMat]); // their emission is written every frame: heat and grip add to it
  const glowOf = (mat) => 0.11 * (1 - 0.85 * Math.min(1, 0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b));
  const lampOf = (...parts) => {
    const mats = parts.flatMap((part) => [...part.userData.part.mats]);
    const lines = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lines) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.glow = glowOf(mat);
    }
    return { solids, lines, on: -1 };
  };
  const lamps = { tap: lampOf(tapBody, knob), spring: lampOf(valve, spring), magnet: lampOf(magnet, arm), tip: lampOf(tc) };
  const light = (lamp, k) => {
    if (lamp.on === k) return;
    lamp.on = k;
    for (const mat of lamp.solids) {
      if (!special.has(mat)) mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k);
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.7 * k);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };
  const go = (group, v, k, from, to) => {
    const u = settle(ramp(k, from, to));
    group.position.set(v[0] * u, v[1] * u, v[2] * u);
  };
  const tmp = new THREE.Color();

  return {
    root, A,
    parts: { cup, crown, cap, tc, tapBody, knob, canBody, valve, spring, arm, magnet },
    update(p, time = 0) {
      const bench = (p.bench ?? 0) > 0.5;
      const k = clamp01(p.explode ?? 0);
      const whole = 1 - smooth(ramp(k, 0, 0.2)); // what only makes sense assembled leaves first
      const safety = clamp01(p.safety ?? 1);
      const xray = clamp01(p.xray ?? 0);
      const press = clamp01(p.press ?? 0);
      const open = Math.max(press, clamp01(p.valve ?? 0));
      const heat = clamp01(p.heat ?? 0) * safety;
      const volts = clamp01(p.volts ?? 0);
      const hold = clamp01(p.hold ?? 0) * safety;

      // ── the mechanism
      stemG.position.y = -press * TRAVEL;
      knob.position.y = -press * TRAVEL;
      pinG.position.z = -press * STROKE;
      valveSlide.position.z = -open * STROKE;
      armSlide.position.z = -open * STROKE;
      springMesh.morphTargetInfluences[0] = open;
      A.spring.position.z = (SPRING.z0 + SPRING.z1 - open * STROKE) / 2;

      // ── opened, in a row (the bench). The can backs off along its own axis first: what it held leaves after it
      go(burnerG, OPEN.burner, k, 0, 0.58);
      crownG.position.y = OPEN.crown * settle(ramp(k, 0.5, 0.95));
      capG.position.y = OPEN.cap * settle(ramp(k, 0.5, 1));
      go(tcG, OPEN.tc, k, 0, 0.52);
      go(tapG, OPEN.tap, k, 0.04, 0.66);
      knobG.position.y = OPEN.knob * settle(ramp(k, 0.55, 1));
      canG.position.set(OPEN.can[0] * settle(ramp(k, 0.38, 0.64)), 0, OPEN.can[2] * ease(ramp(k, 0.14, 0.44))); // straight back off what it holds, then aside
      go(magnetG, OPEN.magnet, k, 0.42, 0.94);
      go(armG, OPEN.arm, k, 0.46, 0.97);
      go(valveG, OPEN.valve, k, 0.5, 1);

      // ── what is there: the safety, the X-ray, the bench
      setPartOpacity(tc, safety);
      setPartOpacity(bush, safety);
      setPartOpacity(valve, safety);
      setPartOpacity(spring, safety);
      setPartOpacity(arm, safety);
      setPartOpacity(magnet, safety);
      setPartOpacity(canBody, (1 - xray) * safety);
      setPartOpacity(plug, 1 - safety);
      setPartOpacity(tapBody, 1 - xray);
      canGlass.visible = xray * safety > 0.004;
      canGlassMat.uniforms.uAmount.value = xray * safety;
      canLines.material.opacity = 0.5 * xray * safety;
      tapGlass.visible = xray > 0.004;
      tapGlassMat.uniforms.uAmount.value = xray;
      tapLines.material.opacity = 0.5 * xray;
      setPartOpacity(pipe, whole);
      setPartOpacity(railStub, bench ? whole : 1 - clamp01(p.shell ?? 1));
      stand.visible = bench && whole > 0.004;
      if (stand.visible) {
        setPartOpacity(props, whole);
        slabMat.uniforms.uAmount.value = whole;
        slab.lines.material.opacity = 0.55 * whole;
      }

      // ── the part the voice names
      const litTap = clamp01(p.litTap ?? 0);
      const litTip = clamp01(p.litTip ?? 0);
      const litMagnet = clamp01(p.litMagnet ?? 0);
      light(lamps.tap, litTap);
      light(lamps.spring, clamp01(p.litSpring ?? 0));
      light(lamps.magnet, litMagnet);
      light(lamps.tip, litTip);
      tapGlassMat.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.6 * litTap);

      // ── the heat of the pin
      const warm = heat > 0.004;
      heatSkin.visible = heatBall.visible = warm;
      heatSkin.material.uniforms.uHeat.value = heat;
      heatBall.material.uniforms.uRadius.value = 1.3 + 1.3 * heat;
      heatBall.material.uniforms.uMinPx.value = 16 * heat;
      heatBall.material.uniforms.uAmount.value = 0.62 * heat * heat;
      heatLight.intensity = 2.2 * heat;
      pinMat.emissive.copy(VEILLE).multiplyScalar(pinMat.userData.glow * litTip).add(tmp.copy(SIGNAL).multiplyScalar(0.42 * heat));

      // ── the current in the lead
      const live = volts * safety > 0.004;
      voltSheath.visible = live;
      if (live) {
        volt.uniforms.uTime.value = time;
        volt.uniforms.uVolts.value = volts;
        volt.uniforms.uAmount.value = safety;
      }
      const going = smooth(ramp(volts, 0, 0.04)) * (1 - smooth(ramp(volts, 0.36, 0.44))) * safety;
      voltHead.visible = going > 0.004;
      if (voltHead.visible) {
        alongLead(Math.min(LEAD_LEN, (LEAD_LEN + 0.6) * (volts / 0.4)), voltHead.position);
        voltHead.material.uniforms.uRadius.value = 0.9;
        voltHead.material.uniforms.uMinPx.value = 12;
        voltHead.material.uniforms.uAmount.value = 0.75 * going;
      }

      // ── the magnet's grip
      const gap = (1 - open) * STROKE;
      const grip = hold > 0.004;
      poles.visible = holdBall.visible = grip;
      setGlow(poleMat, 2.3 * hold);
      field.visible = grip && gap > 0.02 && whole > 0.99;
      if (field.visible) {
        field.scale.z = gap;
        setGlow(fieldMat, 1.3 * hold);
      }
      holdBall.material.uniforms.uRadius.value = 1.25;
      holdBall.material.uniforms.uMinPx.value = 9;
      holdBall.material.uniforms.uAmount.value = 0.2 * hold;
      coilMat.emissive.copy(VEILLE).multiplyScalar(coilMat.userData.glow * litMagnet + 0.5 * hold);
      armMat.emissive.copy(VEILLE).multiplyScalar(armMat.userData.glow * litMagnet + 0.2 * hold * smooth(ramp(open, 0.6, 1)));

      // ── the gas (seen under the X-ray)
      const gas = xray * whole * Math.max(smooth(ramp(open, 0.08, 0.5)), 1 - safety);
      gasSheath.visible = gas > 0.004;
      if (gasSheath.visible) {
        flow.uniforms.uTime.value = time;
        flow.uniforms.uFlow.value = gas;
      }
    },
  };
}
