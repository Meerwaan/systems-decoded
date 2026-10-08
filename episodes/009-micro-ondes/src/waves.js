// DOSSIER 009 — Micro-ondes : the microwaves. Nobody has ever seen one: each thing the voice says is given an
// object that does it.
//
//   signal   the microwaves: the standing wave in the cavity, the fronts that get out without the door, THE wave
//   veille   what throws them back: the fronts that leave the plate toward the inside, the mark on its hole
//   ink      visible light: the threads that go through the holes to your eyes, the marks of the measure
//
//   · the field    a standing wave. Its antinodes are lobes of light (a small hot heart, a body, a tail) set every
//                  half wavelength, 6.1 cm, with a node on each wall; neighbours take turns to swell, as the two
//                  signs of a standing wave do. The layer nearest the door and the column nearest the camera also
//                  show the wave itself: a string held at its nodes, drawn with its two extremes — a chain of
//                  lenses, a lobe in each.
//   · the rebound  the mirror of the leak: where the field meets the plate, fronts (caps of a sphere) leave it
//                  toward the inside, and die in 12 cm.
//   · the leak     without the door the field walks out of the mouth: caps 12.2 cm apart (a fainter one between
//                  two: the other sign), wider and weaker as they go.
//   · the measure  ONE wave, exactly 12.2 cm, a ribbon laid against the plate, its two ends marked; and a fine
//                  ring around ONE hole. The lobes step aside.
//   · the light    a few threads from the food, each through one hole of the plate, to your eyes; and the line of
//                  sight through the marked hole.
//
// Everything is a function of the state and of `time`: uniforms and a few positions, nothing allocated.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { anchor, fatLine } from "@kit/build3d.js";
import { CAVITY, DOOR, WINDOW, HOLES, WAVE, YOU, TURNTABLE } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const VIEW = new THREE.Vector2(BRAND.W, BRAND.H);

const LAMBDA = WAVE.length;
const HALF = LAMBDA / 2;
/**
 * The perforated plate: where the field is thrown back, and where the holes are. It is inside the door, 3 mm behind
 * the door's centre plane (model.js: its own PLATE_Z) — the plan does not say it yet.
 */
const PLATE_Z = DOOR.home[2] - 0.3;
/** The mouth of the cavity: what the field walks out of when the door is not there. */
const MOUTH_Z = CAVITY.z1;
const MID = [(CAVITY.x0 + CAVITY.x1) / 2, (CAVITY.y0 + CAVITY.y1) / 2];

/* ── the lattice of antinodes: a node on the left wall, on the plate; centred in the height ── */
const NX = 6;
const NY = 4;
const NZ = 5;
const X0 = CAVITY.x0 + HALF / 2;
const Y0 = MID[1] - ((NY - 1) * HALF) / 2;
const Z0 = PLATE_Z - HALF / 2 - (NZ - 1) * HALF;
/** How bright each layer is, from the back wall to the door: the far ones are depth, the near one is the picture. */
const LAYER = [0.3, 0.38, 0.5, 0.7, 1];
/**
 * Where the wave itself is drawn, as strings: across the layer nearest the door (along x), and along the column
 * nearest the camera's side (along z, from the back to the plate) — the two faces of the box the film looks at.
 * Lobes alone everywhere else: a string through every row is a tangle. [axis (0: x, 1: z), layer or column, how bright]
 */
const STRINGS = [[0, NZ - 1, 1], [1, 0, 0.8]];

/* ── the measure: the wave's centre line passes `GAP` from the hole — next to it, never over it ── */
const RULER = { amp: 2.6, r: 0.28, wide: 4, gap: 0.5, z: PLATE_Z - 0.3 };
const HOLE = [HOLES.origin[0], HOLES.origin[1], PLATE_Z];
const SLOPE = (RULER.amp * 2 * Math.PI) / LAMBDA; // how steep the wave is where it crosses its own axis
const RULER_C = [HOLE[0] + (RULER.gap * SLOPE) / Math.hypot(1, SLOPE), HOLE[1] + RULER.gap / Math.hypot(1, SLOPE)];
const RULER_X0 = RULER_C[0] - HALF;

/* ── the leak: caps of spheres about a point behind the mouth — nearly flat as they leave it, round further out ── */
const LEAK = { c0: 15, count: 16, speed: 5, cone: [17 / 15, 12.2 / 15] };
/** The rebound is its mirror: the same fronts, veille, about the image of that point in the plate — they leave the plate toward the inside and die in 12 cm. */
const BACK = { c0: 15, count: 4, reach: 12, cone: [15.5 / 15, 10.5 / 15] };
/** Your eyes, from the centre of your head (kitchen.js draws the head; these only say where the threads land). */
const FACE = 9.5; // from the centre of your head to the front of your face
/** How much of the field the eye finds through the window, once the holes are too small to be told apart (true: a fifth, a tenth at a slant). */
const SEEN = 0.45;
/** Drawn after the plate (7) and its smoked glass (8), before the shells of glass hold their depth (9). */
const AFTER = 8.5;
// (a fallback, read off kitchen.js: world.js may hand over the kitchen's own anchor — see `watch`)
const EYES = { dx: 3.1, dy: -1, front: 7.1, rise: 2.6 };
/** Five threads leave the dish; the eighth is the line of sight through the marked hole (it comes from the lit back wall). */
const THREADS = 6;
const SIGHT = THREADS - 1;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ───────────────────────────────────────────────────────────── shared GLSL */

const GL_HALF = HALF.toFixed(4);
/** The life of the standing wave: who swells when, and how the whole pattern slides. */
const ALIVE = /* glsl */ `
  const float PI = 3.14159265;
  uniform float uTime;
  // neighbours take turns: where one antinode swells, the next ones are slack (the phase of a lobe, then 0–1)
  float turn(float parity, float row, float layer) { return uTime * 1.75 + parity * PI + 0.35 * row + 0.5 * layer; }
  float swell(float parity, float row, float layer) { return 0.5 + 0.5 * sin(turn(parity, row, layer)); }
  // the whole pattern slides a little (cm), in one piece — the strings go through their lobes: slow, never a flicker
  vec3 slide() { return vec3(0.8 * sin(uTime * 0.5), 0.35 * sin(uTime * 0.37 + 1.0), 0.0); }
`;

/**
 * The perforated plate is drawn by model.js as a sheet that does not write depth (render order 7): it covers whatever
 * was drawn before it, and nothing drawn after. So everything here that may stand on either side of it is drawn twice:
 * pass 0 before the plate — what is BEYOND it from the eye (the plate then masks it, hole by hole) —, pass 1 after it —
 * what is on the eye's own side. From the room or from inside the cavity, the plate hides only what is behind it.
 */
const SIDES = /* glsl */ `
  uniform float uPass, uPlateZ, uShut, uSeen, uHoleD; uniform vec4 uWindow; uniform vec2 uView;
  // how much of what stands at p this pass draws
  float share(vec3 p) {
    if ((p.z < uPlateZ) == (cameraPosition.z < uPlateZ)) return uPass; // on the eye's side of the plate: after it
    // beyond it. Through the window? (p and the eye are on either side: the division is safe)
    vec2 c = mix(cameraPosition.xy, p.xy, (uPlateZ - cameraPosition.z) / (p.z - cameraPosition.z));
    vec2 in2 = smoothstep(vec2(-1.5), vec2(1.5), min(c - uWindow.xz, uWindow.yw - c));
    // from far, the holes melt into an even sheet (model.js: under 2 px across) that would leave a fifth of the field,
    // a tenth at a slant: the film needs it to read from the room. So there the field is drawn AFTER the plate, at
    // uSeen of its light; from close, BEFORE it, whole — and the plate masks it hole by hole. Between the two, both.
    float focal = 0.5 * uView.y * projectionMatrix[1][1];
    float melt = 1.0 - smoothstep(2.0, 3.6, uHoleD * focal / max(length(p - cameraPosition), 1e-3));
    float k = in2.x * in2.y * melt * uShut;
    return uPass > 0.5 ? k * uSeen : 1.0 - k;
  }
`;
const PLATE = {
  uView: { value: VIEW },
  uPlateZ: { value: PLATE_Z },
  uWindow: { value: new THREE.Vector4(WINDOW.x0, WINDOW.x1, WINDOW.y0, WINDOW.y1) },
  uHoleD: { value: HOLES.d },
  uSeen: { value: SEEN },
  uShut: { value: 0 }, // 1: the door is there, shut in its frame
};
/** The same thing once more, after the plate: the two share everything but `uPass`. */
function twice(o, order = AFTER) {
  const mat = o.mesh.material.clone();
  mat.uniforms = { ...o.mesh.material.uniforms, uPass: { value: 1 } };
  o.after = finish(new THREE.Mesh(o.mesh.geometry, mat), order);
  o.after.position.copy(o.mesh.position);
  return o;
}
const seen = (o, on) => {
  o.mesh.visible = on;
  o.after.visible = on;
};

/**
 * A stretch from a to b (world) laid on the picture as a capsule: the technique of 008's channels. `uWorldR` is half
 * the width of its core in centimetres, never under `uMinPx` pixels.
 */
const LAY = /* glsl */ `
  uniform float uMinPx, uWorldR, uHalo;
  attribute vec2 aCorner;
  varying vec2 vPa, vPb; varying vec4 vAlong; varying float vR, vGain;
  void lay(vec3 a, vec3 b, float gain, float sa, float sb, float off, float whole) {
    vec4 ca = projectionMatrix * modelViewMatrix * vec4(a, 1.0);
    vec4 cb = projectionMatrix * modelViewMatrix * vec4(b, 1.0);
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vPa = vec2(0.0); vPb = vec2(1.0); vAlong = vec4(0.0); vR = 1.0; vGain = 0.0;
    const float NEAR = 0.6;
    if (gain > 0.002 && (ca.w > NEAR || cb.w > NEAR)) {
      if (ca.w < NEAR) ca = mix(ca, cb, (NEAR - ca.w) / (cb.w - ca.w));
      if (cb.w < NEAR) cb = mix(cb, ca, (NEAR - cb.w) / (ca.w - cb.w));
      float focal = 0.5 * uView.y * projectionMatrix[1][1];
      vec2 pa = (ca.xy / ca.w * 0.5 + 0.5) * uView;
      vec2 pb = (cb.xy / cb.w * 0.5 + 0.5) * uView;
      float r = max(uMinPx, uWorldR * focal / (0.5 * (ca.w + cb.w)));
      float reach = r * uHalo + 2.0;
      vec2 run = pb - pa;
      float l = length(run);
      vec2 dir = l > 1e-3 ? run / l : vec2(0.0, 1.0);
      vec2 p = mix(pa, pb, aCorner.x) + dir * (aCorner.x * 2.0 - 1.0) * reach + vec2(-dir.y, dir.x) * aCorner.y * reach;
      gl_Position = vec4(p / uView * 2.0 - 1.0, mix(ca.z / ca.w, cb.z / cb.w, aCorner.x), 1.0);
      vPa = pa; vPb = pb; vAlong = vec4(sa, sb, off, whole); vR = r; vGain = gain;
    }
  }
`;

/**
 * The light of a stroke: a core with a clear edge, the glow right around it, a long halo.
 *   gains   halo, sheath, core (HDR)        heart   how much of the core's centre is ink rather than `hue`
 *   bead    0: an even line · 1: beads of light that run along it (`period` cm apart, `rate` of them a second)
 *   fadeIn  centimetres over which it comes out of nothing at its start (0: none)
 */
const strokeMat = ({ hue, vertex, gains, radius, minPx = 1.2, halo = 7, heart = 0, bead = 0, period = 9, rate = 1, fadeIn = 0, fadeOut = 0, uniforms = {} }) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation, // the brightest wins: stretches overlap at every joint, and must not add up there
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    uniforms: {
      uView: { value: VIEW }, uTime: { value: 0 }, uAmount: { value: 0 },
      uHue: { value: hue.clone() }, uInk: { value: INK.clone() }, uK: { value: new THREE.Vector3(...gains) }, uHeart: { value: heart },
      uWorldR: { value: radius }, uMinPx: { value: minPx }, uHalo: { value: halo },
      uBead: { value: bead }, uPeriod: { value: period }, uRate: { value: rate }, uFadeIn: { value: fadeIn }, uFadeOut: { value: fadeOut },
      uPass: { value: 0 }, ...PLATE,
      ...uniforms,
    },
    vertexShader: ALIVE + SIDES + LAY + vertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue, uInk, uK; uniform float uHeart, uHalo, uTime, uBead, uPeriod, uRate, uFadeIn, uFadeOut;
      varying vec2 vPa, vPb; varying vec4 vAlong; varying float vR, vGain;
      void main() {
        vec2 p = gl_FragCoord.xy;
        vec2 ba = vPb - vPa;
        float t = clamp(dot(p - vPa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
        float d = length(p - vPa - ba * t);
        float r = max(vR, 0.9);
        float core = 1.0 - smoothstep(r - 0.8, r + 0.8, d);
        float centre = 1.0 - smoothstep(0.0, r, d);
        float sheath = exp(-d * d / (r * r * 5.8));
        float x = d / (r * 3.0);
        float reach = r * uHalo;
        float halo = pow(1.0 + x * x, -1.4) * (1.0 - smoothstep(0.5 * reach, reach, d));
        float s = mix(vAlong.x, vAlong.y, t);
        float run = pow(clamp(0.5 + 0.5 * cos(6.28318 * ((s + vAlong.z) / max(uPeriod, 0.01) - uTime * uRate)), 0.0, 1.0), 3.0);
        float lit = mix(1.0, 0.38 + 0.62 * run, uBead) * (uFadeIn > 0.0 ? smoothstep(0.0, uFadeIn, s) : 1.0);
        if (uFadeOut > 0.0) lit *= mix(0.25, 1.0, smoothstep(0.0, uFadeOut, vAlong.w - s)); // it lands softly: several threads on one eye are not a star
        vec3 col = uHue * (halo * uK.x + sheath * uK.y) + mix(uHue, uInk, clamp(uHeart * (0.6 + 0.4 * centre), 0.0, 1.0)) * (core * uK.z);
        gl_FragColor = vec4(col * (vGain * lit), 1.0);
      }`,
  });

/** Quads for `n` stretches: `each(i)` gives the attributes of stretch i, as { name: [numbers] }; the same for its four corners. */
function stretches(n, sizes, each) {
  const data = Object.fromEntries(Object.keys(sizes).map((k) => [k, []]));
  const corner = [];
  const index = [];
  for (let i = 0; i < n; i++) {
    const a = each(i);
    for (const c of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
      for (const k in sizes) data[k].push(...a[k]);
      corner.push(...c);
    }
    index.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 3, i * 4 + 2);
  }
  return { data, corner, index };
}

function finish(mesh, order) {
  mesh.frustumCulled = false;
  mesh.renderOrder = order; // under 9: the shells of glass (the kitchen, the oven, you) never hide what is drawn here
  mesh.visible = false;
  return mesh;
}

/* ───────────────────────────────────────────────────────────── the field in the cavity */

/** The antinodes: balls of light with no edge, always facing the eye — a small hot heart, a body, a tail. */
function makeLobes() {
  const centre = [];
  const lat = [];
  for (let k = 0; k < NZ; k++)
    for (let j = 0; j < NY; j++)
      for (let i = 0; i < NX; i++) {
        centre.push(X0 + i * HALF, Y0 + j * HALF, Z0 + k * HALF);
        lat.push((i + j + k) % 2, j, k, LAYER[k]);
      }
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 1, 3, 2]);
  geo.setAttribute("aCenter", new THREE.InstancedBufferAttribute(new Float32Array(centre), 3));
  geo.setAttribute("aLat", new THREE.InstancedBufferAttribute(new Float32Array(lat), 4));
  geo.instanceCount = NX * NY * NZ;
  const uniforms = {
    uView: { value: VIEW }, uTime: { value: 0 }, uAmount: { value: 0 }, uGrow: { value: 1 },
    uHue: { value: SIGNAL.clone() }, uSize: { value: 3.5 }, uK: { value: new THREE.Vector3(0.09, 0.5, 2.3) },
    uPass: { value: 0 }, ...PLATE,
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader:
        ALIVE +
        SIDES +
        /* glsl */ `
        uniform float uAmount, uSize, uGrow;
        attribute vec3 aCenter; attribute vec4 aLat; // parity, row, layer, how bright
        varying vec2 vUv; varying float vGain, vHeart;
        void main() {
          vUv = position.xy;
          vGain = 0.0;
          vHeart = aLat.w; // the far layers are soft bodies of light, only the near ones have a hot heart: depth, not a field of dots
          float b = swell(aLat.x, aLat.y, aLat.z);
          vec3 at = aCenter + slide();
          float sh = share(at);
          vec4 c = projectionMatrix * modelViewMatrix * vec4(at, 1.0);
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (uAmount > 0.002 && c.w > 1.0 && sh > 0.002) {
            float focal = 0.5 * uView.y * projectionMatrix[1][1];
            float s = clamp(uSize * uGrow * mix(0.72, 1.0, b) * focal / c.w, 5.0, 1400.0);
            // (a lobe the camera is about to fly through goes out before it fills the picture)
            vGain = uAmount * aLat.w * mix(0.5, 1.0, b) * smoothstep(1.5, 7.0, c.w) * sh;
            gl_Position = vec4(c.xy / c.w + position.xy * s / (uView * 0.5), c.z / c.w, 1.0);
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHue, uK; varying vec2 vUv; varying float vGain, vHeart;
        void main() {
          float r2 = dot(vUv, vUv);
          float heart = exp(-r2 / 0.017);
          float body = exp(-r2 / 0.12);
          float tail = (1.0 - smoothstep(0.35, 1.0, sqrt(r2))) / (1.0 + r2 / 0.05);
          gl_FragColor = vec4(uHue * ((tail * uK.x + body * uK.y + heart * uK.z * vHeart) * vGain), 1.0);
        }`,
    }),
  );
  return { mesh: finish(mesh, 4), uniforms };
}

/** The wave itself, on the layers of STRINGS: a string held at its nodes, drawn at its two extremes. */
function makeStrings() {
  const PER = 14; // stretches per half wave
  const n = NX * PER;
  const q = stretches(n, { aS: 2 }, (i) => ({ aS: [(i / PER) * HALF, ((i + 1) / PER) * HALF] }));
  const origin = [];
  const row = [];
  const axis = [];
  for (const [ax, at, w] of STRINGS)
    for (let j = 0; j < NY; j++)
      for (const side of [1, -1]) {
        if (ax) origin.push(X0 + at * HALF, Y0 + j * HALF, PLATE_Z - NZ * HALF);
        else origin.push(X0 - HALF / 2, Y0 + j * HALF, Z0 + at * HALF);
        row.push(w, side, j, at);
        axis.push(ax);
      }
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(n * 12), 3));
  geo.setAttribute("aS", new THREE.Float32BufferAttribute(q.data.aS, 2));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute(q.corner, 2));
  geo.setIndex(q.index);
  geo.setAttribute("aOrigin", new THREE.InstancedBufferAttribute(new Float32Array(origin), 3));
  geo.setAttribute("aRow", new THREE.InstancedBufferAttribute(new Float32Array(row), 4));
  geo.setAttribute("aAxis", new THREE.InstancedBufferAttribute(new Float32Array(axis), 1));
  geo.instanceCount = axis.length;
  const mat = strokeMat({
    hue: SIGNAL,
    gains: [0.07, 0.3, 1.35],
    radius: 0.075,
    minPx: 1.2,
    uniforms: { uAmp: { value: 1.9 }, uWalls: { value: new THREE.Vector2(CAVITY.x0, CAVITY.x1) } },
    vertex: /* glsl */ `
      attribute vec2 aS;      // this stretch, in cm from the string's first node
      attribute vec3 aOrigin; // the string's first node
      attribute vec4 aRow;    // how bright, which extreme (+1 / -1), row, layer (a string along x) or column (along z)
      attribute float aAxis;  // 0: along x · 1: along z
      uniform float uAmount, uAmp; uniform vec2 uWalls;
      void main() {
        // each half wave opens as wide as its lobe swells (it is nil at the nodes: no step from one to the next)
        float lobe = floor(0.5 * (aS.x + aS.y) / ${GL_HALF});
        float layer = aAxis > 0.5 ? lobe : aRow.w;
        float amp = uAmp * mix(0.42, 1.0, swell(mod(lobe + aRow.z + aRow.w, 2.0), aRow.z, layer)) * aRow.y;
        vec3 o = aOrigin + slide();
        vec3 dir = aAxis > 0.5 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
        vec3 a = o + dir * aS.x + vec3(0.0, amp * sin(PI * aS.x / ${GL_HALF}), 0.0);
        vec3 b = o + dir * aS.y + vec3(0.0, amp * sin(PI * aS.y / ${GL_HALF}), 0.0);
        float x = 0.5 * (a.x + b.x);
        // nothing outside the metal; and a string along z is five half waves long, not six
        float keep = aAxis > 0.5 ? step(lobe, ${(NZ - 0.5).toFixed(1)}) : smoothstep(uWalls.x, uWalls.x + 0.8, x) * (1.0 - smoothstep(uWalls.y - 0.8, uWalls.y, x));
        lay(a, b, uAmount * aRow.x * keep * share(0.5 * (a + b)), aS.x, aS.y, 0.0, 0.0);
      }`,
  });
  return { mesh: finish(new THREE.Mesh(geo, mat), 5), uniforms: mat.uniforms };
}

/* ───────────────────────────────────────────────────────────── the fronts: caps of spheres */

/** A cap of the unit sphere about +z. */
const capGeometry = () => new THREE.SphereGeometry(1, 72, 28, 0, Math.PI * 2, 0, 0.98).rotateX(Math.PI / 2);

/** A front is a thin skin of light: faint where it faces the eye, a crisp line where it turns away, a brighter band on its border. */
const SKIN = /* glsl */ `
  // m: 0 on its axis → 1 on its border · k: how much it shows of its face, of where it turns away, of its border
  float skin(vec3 n, vec3 v, float m, vec3 k) {
    float g = clamp(1.0 - abs(dot(normalize(n), normalize(v))), 0.0, 1.0);
    float inside = 1.0 - smoothstep(0.88, 1.0, m);
    float lip = smoothstep(0.78, 0.93, m) * inside;
    return (k.x + k.y * (0.5 * pow(g, 2.6) + 0.9 * smoothstep(0.62, 0.97, g))) * inside + k.z * lip;
  }
`;
const skinMat = (uniforms, vertexShader, fragmentShader) =>
  new THREE.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, vertexShader, fragmentShader: SKIN + fragmentShader });

/**
 * Fronts half a wave apart, one strong, one faint (the two signs of the wave), that walk away from a wall: caps of
 * spheres about `source`, a point `c0` behind that wall — each comes through it crown first, and widens.
 *   way     +1: out of the mouth, toward you (the leak) · -1: off the plate, back into the cavity (the rebound)
 *   uReach  how far the first has got (cm from the wall) — beyond, nothing yet; `soft`: over how many cm they die there
 *   far     the distance over which they lose half their light · born: cm over which they light up past the wall
 */
function makeFronts({ hue, source, wall, way, c0, count, cone, soft, far, born, k }) {
  const geo = new THREE.InstancedBufferGeometry().copy(capGeometry());
  geo.setAttribute("aIndex", new THREE.InstancedBufferAttribute(new Float32Array(Array.from({ length: count }, (_, i) => i)), 1));
  geo.instanceCount = count;
  const uniforms = {
    uHue: { value: hue.clone() }, uSource: { value: new THREE.Vector3(...source) }, uCone: { value: new THREE.Vector2(...cone) }, uWay: { value: way },
    uPhase: { value: 0 }, uCount: { value: count }, uC0: { value: c0 }, uWall: { value: wall }, uReach: { value: 0 }, uAmount: { value: 0 },
    uPass: { value: 0 }, ...PLATE,
    uSoft: { value: soft }, uFar: { value: far }, uBorn: { value: born }, uSkin: { value: new THREE.Vector3(...k) },
  };
  const mat = skinMat(
    uniforms,
    SIDES +
      /* glsl */ `
      attribute float aIndex;
      uniform vec3 uSource; uniform float uPhase, uCount, uC0, uWay;
      varying vec3 vN, vV, vW; varying float vD, vKind;
      void main() {
        vD = mod(aIndex + uPhase, uCount) * ${GL_HALF}; // how far its crown is from the wall
        vec3 dir = vec3(position.xy, position.z * uWay);
        vW = uSource + dir * (uC0 + vD);
        vKind = (mod(aIndex, 2.0) < 0.5 ? 1.0 : 0.4) * share(vW);
        vec4 mv = modelViewMatrix * vec4(vW, 1.0);
        vN = normalMatrix * dir;
        vV = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    /* glsl */ `
      uniform vec3 uHue, uSource, uSkin; uniform vec2 uCone; uniform float uWall, uReach, uAmount, uWay, uSoft, uFar, uBorn;
      varying vec3 vN, vV, vW; varying float vD, vKind;
      void main() {
        vec3 d = vW - uSource;
        float m = length(d.xy / (max(d.z * uWay, 1e-3) * uCone)); // 0 on the axis → 1 on the edge of the beam
        float past = (vW.z - uWall) * uWay;
        float born = smoothstep(-0.3, uBorn, past);                 // it comes through the wall, crown first
        float fresh = 1.0 + 0.8 * exp(-max(past, 0.0) / 1.2);       // …bright as it leaves it
        float head = 1.0 - smoothstep(uReach - uSoft, uReach, vD);  // the head of the train: nothing has got further yet
        float weak = 1.0 / (1.0 + vD / uFar);
        gl_FragColor = vec4(uHue * (skin(vN, vV, m, uSkin) * born * fresh * head * weak * vKind * uAmount), 1.0);
      }`,
  );
  return { mesh: finish(new THREE.Mesh(geo, mat), 4), uniforms };
}

/* ───────────────────────────────────────────────────────────── the measure */

/** ONE wave: a band that follows a sine, flat against the plate — a hot core with a clean edge, a glow, a halo. */
function makeRuler() {
  const N = 192;
  const H = RULER.r * RULER.wide;
  const k = (2 * Math.PI) / LAMBDA;
  const pos = [];
  const uv = [];
  const index = [];
  for (let i = 0; i <= N; i++) {
    const s = (i / N) * LAMBDA;
    const dy = RULER.amp * k * Math.cos(k * s);
    const l = Math.hypot(1, dy);
    for (const e of [-1, 1]) {
      pos.push(s - (dy / l) * e * H, RULER.amp * Math.sin(k * s) + (1 / l) * e * H, 0);
      uv.push(i / N, e);
    }
    if (i < N) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(index);
  const uniforms = {
    // (its core stays under 1.6: a wide stroke pushed further is washed to salmon by the tone curve)
    uTime: { value: 0 }, uHue: { value: SIGNAL.clone() }, uInk: { value: INK.clone() }, uK: { value: new THREE.Vector3(0.1, 0.45, 1.5) },
    uWide: { value: RULER.wide }, uDraw: { value: 0 }, uFresh: { value: 0 }, uAmount: { value: 0 },
    uPass: { value: 0 }, ...PLATE, uSeen: { value: 1 }, // (a measure is read whole from the room: no dimming once the holes have melted)
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false, // a measure: nothing of the oven's body hides it (the plate does, from the room and from close: see SIDES)
      side: THREE.DoubleSide,
      // its halo adds to the picture, its core covers it (alpha): over the pale sheet of the plate it stays signal, not salmon
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader:
        SIDES +
        /* glsl */ `
        varying vec2 vUv; varying float vShare;
        void main() {
          vUv = uv;
          vec4 w = modelMatrix * vec4(position, 1.0);
          vShare = share(w.xyz);
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHue, uInk, uK; uniform float uTime, uWide, uDraw, uFresh, uAmount;
        varying vec2 vUv; varying float vShare;
        void main() {
          float a = abs(vUv.y) * uWide; // from the centre line, in half widths of the core
          float aa = clamp(fwidth(a), 1e-4, 0.5);
          float core = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, a);
          float centre = 1.0 - smoothstep(0.0, 1.0, a);
          float out1 = max(a - 1.0, 0.0);
          float sheath = exp(-out1 * out1 / 0.2) * (1.0 - core);
          float halo = pow(1.0 + a * a / 6.0, -1.5) * (1.0 - smoothstep(0.55 * uWide, uWide, a));
          // drawn from one end to the other; its head is hotter while it runs
          float tip = uDraw * 1.03;
          float drawn = 1.0 - smoothstep(tip - 0.02, tip, vUv.x);
          float fresh = uFresh * exp(-max(tip - vUv.x, 0.0) * 12.0);
          float breath = 0.94 + 0.06 * sin(6.28318 * (vUv.x * 1.5 - uTime * 0.22));
          // a band has an edge: a finer, brighter line along each side of the core — seen from very close it is still an object
          float rim = smoothstep(0.8, 0.95, a) * core;
          vec3 col = uHue * (halo * uK.x + sheath * uK.y) + mix(uHue, uInk, 0.05 * centre) * (core * uK.z * (0.6 + 0.4 * centre + 0.3 * rim) * breath);
          float k = drawn * uAmount * vShare;
          gl_FragColor = vec4(col * (k * (1.0 + fresh)), core * k * 0.94);
        }`,
    }),
  );
  mesh.position.set(RULER_X0, RULER_C[1], RULER.z);
  return { mesh: finish(mesh, 6), uniforms };
}

/** A fine mark, in pixels, read through anything. */
function mark(points, color, width, hdr) {
  const line = fatLine(points, { color, width, additive: true, hdr });
  line.material.depthTest = false;
  line.material.opacity = 0;
  line.renderOrder = AFTER + 0.2;
  line.frustumCulled = false;
  line.visible = false;
  return line;
}
const show = (lines, a) => {
  for (const line of lines) {
    line.visible = a > 0.004;
    line.material.opacity = a;
  }
};

/* ───────────────────────────────────────────────────────────── the light */

/** The threads of visible light: dish → one hole → eye. Their ends are uniforms (the eye moves with you). */
function makeThreads() {
  const q = stretches(THREADS * 2, { aThread: 2 }, (i) => ({ aThread: [Math.floor(i / 2), i % 2] }));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(THREADS * 2 * 12), 3));
  geo.setAttribute("aThread", new THREE.Float32BufferAttribute(q.data.aThread, 2));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute(q.corner, 2));
  geo.setIndex(q.index);
  const S = [];
  const H = [];
  const E = [];
  for (let i = 0; i < THREADS; i++) {
    // where it leaves the food: about the turntable's axis, where model.js's bowl always is as it goes round
    const a = i * 2.399963;
    const r = 0.5 + 0.3 * i;
    S.push(new THREE.Vector3(TURNTABLE.x + r * Math.cos(a), TURNTABLE.y + 4.75, TURNTABLE.z + r * Math.sin(a)));
    H.push(new THREE.Vector3());
    E.push(new THREE.Vector3());
  }
  const mat = strokeMat({
    hue: INK,
    gains: [0.045, 0.2, 1.45],
    radius: 0.008,
    minPx: 1.15,
    halo: 8,
    bead: 1,
    period: 9,
    rate: 0.9,
    fadeIn: 5,
    fadeOut: 3,
    uniforms: { uS: { value: S }, uH: { value: H }, uE: { value: E } },
    vertex: /* glsl */ `
      attribute vec2 aThread; // which thread, which half (0: dish → hole, 1: hole → eye)
      uniform vec3 uS[${THREADS}]; uniform vec3 uH[${THREADS}]; uniform vec3 uE[${THREADS}];
      uniform float uAmount;
      void main() {
        int i = int(aThread.x + 0.5);
        vec3 s = uS[i]; vec3 h = uH[i]; vec3 e = uE[i];
        float l0 = length(h - s);
        float l1 = l0 + length(e - h);
        // (its two halves stand on either side of the plate)
        if (aThread.y < 0.5) lay(s, h, uAmount * share(vec3(h.xy, uPlateZ - 1.0)), 0.0, l0, aThread.x * 3.7, l1);
        else lay(h, e, uAmount * share(vec3(h.xy, uPlateZ + 1.0)), l0, l1, aThread.x * 3.7, l1);
      }`,
  });
  return { mesh: finish(new THREE.Mesh(geo, mat), 6), uniforms: mat.uniforms, S, H, E };
}

/** The hole of the lattice nearest to (x, y) on the plate, written into `out`. */
function nearestHole(x, y, out) {
  const p = HOLES.pitch;
  const h = (p * Math.sqrt(3)) / 2;
  const dx = x - HOLES.origin[0];
  const dy = y - HOLES.origin[1];
  const j0 = Math.floor(dy / h);
  let best = Infinity;
  for (let j = j0; j <= j0 + 1; j++) {
    const i = Math.round((dx - 0.5 * j * p) / p);
    const hx = (i + 0.5 * j) * p;
    const hy = j * h;
    const d2 = (hx - dx) * (hx - dx) + (hy - dy) * (hy - dy);
    if (d2 < best) {
      best = d2;
      out.set(HOLES.origin[0] + hx, HOLES.origin[1] + hy, PLATE_Z);
    }
  }
}

/* ───────────────────────────────────────────────────────────── the set */

export function buildWaves() {
  const group = new THREE.Group();
  const benchGroup = new THREE.Group(); // nothing of the field on the bench

  const lobes = makeLobes();
  const strings = makeStrings();
  const leak = makeFronts({ hue: SIGNAL, source: [MID[0], MID[1], MOUTH_Z - LEAK.c0], wall: MOUTH_Z, way: 1, c0: LEAK.c0, count: LEAK.count, cone: LEAK.cone, soft: 5, far: 20, born: 3.5, k: [0.035, 1, 0.16] });
  const rebound = makeFronts({ hue: VEILLE, source: [HOLE[0], HOLE[1], PLATE_Z + BACK.c0], wall: PLATE_Z, way: -1, c0: BACK.c0, count: BACK.count, cone: BACK.cone, soft: 8, far: 60, born: 1.2, k: [0.012, 0.9, 0.3] });
  const ruler = makeRuler();
  const threads = makeThreads();
  for (const o of [lobes, strings, rebound, leak, threads]) {
    twice(o);
    group.add(o.mesh, o.after);
  }
  twice(ruler, AFTER + 0.1);
  group.add(ruler.mesh, ruler.after);

  /* ── the marks of the measure: the two ends of the wave and the line between them (ink), the ring on the hole (veille) ── */
  const x0 = RULER_X0;
  const x1 = RULER_X0 + LAMBDA;
  const yb = RULER_C[1];
  const yd = yb - RULER.amp - 1.1; // the dimension line, under the trough
  const ends = [
    mark([[x0, yd - 0.45, RULER.z], [x0, yb + RULER.amp + 0.9, RULER.z]], BRAND.ink, 2.6, 1.5),
    mark([[x1, yd - 0.45, RULER.z], [x1, yb + RULER.amp + 0.9, RULER.z]], BRAND.ink, 2.6, 1.5),
    mark([[x0, yd, RULER.z], [x1, yd, RULER.z]], BRAND.ink, 2.2, 1.3),
  ];
  const ring = [];
  for (let i = 0; i <= 72; i++) ring.push([HOLE[0] + 0.21 * Math.cos((i / 72) * 2 * Math.PI), HOLE[1] + 0.21 * Math.sin((i / 72) * 2 * Math.PI), PLATE_Z - 0.03]);
  const target = [mark(ring, BRAND.veille, 2.6, 2)];
  // four short ticks about the ring: a sight, not one more hole
  for (const [cx, cy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) target.push(mark([[HOLE[0] + 0.29 * cx, HOLE[1] + 0.29 * cy, PLATE_Z - 0.03], [HOLE[0] + 0.41 * cx, HOLE[1] + 0.41 * cy, PLATE_Z - 0.03]], BRAND.veille, 2.4, 2));
  group.add(...ends, ...target);

  const A = {
    lobe: anchor(group, X0 + 3 * HALF, Y0 + 2 * HALF, Z0 + (NZ - 1) * HALF), // the antinode nearest the door, in front of your eyes
    wave0: anchor(group, x0, yb, RULER.z),
    wave1: anchor(group, x1, yb, RULER.z),
    hole: anchor(group, ...HOLE),
    front: anchor(group, MID[0], MID[1], MOUTH_Z), // the head of the leak
    ray: anchor(group, YOU.x, YOU.head, (PLATE_Z + YOU.z) / 2), // the middle of the beam, between the plate and your eyes
    rayHole: anchor(group, ...HOLE), //                            the hole the line of sight goes through: the marked one
    mouth: anchor(group, MID[0], MID[1], MOUTH_Z),
  };

  const eye = new THREE.Vector3();
  const brow = new THREE.Vector3();
  const right = new THREE.Vector3();
  const fwd = new THREE.Vector3();
  const MAIN = 0; // the thread that leaves the middle of the dish
  let watched = null;

  return {
    group, benchGroup, A,
    /**
     * Where your eyes are, from who draws them: an anchor between the two, on the brow (kitchen.js: `A.youEyes`), in a
     * head whose own x runs from one eye to the other and z out of the face. Without it the threads land where the plan
     * says your eyes should be — right at the glass, less so once you straighten.
     */
    watch(anchorBetweenEyes) {
      watched = anchorBetweenEyes;
    },
    /**
     * Every sample of the shutter.
     *   power   the field in the cavity (0: nothing is left · 1: a thousand watts): lobes, strings, rebound, and the leak's light
     *   door    1: the door is there · open: its angle (0 closed): the rebound needs the plate in place
     *   leak    the fronts that get out of the mouth: their head reaches your face at 0.7, has gone past it at 1
     *   ruler   0 → 0.6 the wave is drawn from one end to the other (the lobes step aside) · 0.55 → 0.75 its ends are marked ·
     *           0.8 → 1 the ring closes on the hole
     *   light   the threads of visible light, dish → hole → eyes
     *   near    1: your face at the glass · 0: a step back (YOU.back): the leak's reach and the threads' ends follow
     */
    update({ power = 1, door = 1, open = 0, leak: lk = 0, ruler: ru = 0, light = 0, near = 1 } = {}, time = 0) {
      const pw = clamp01(power);
      const aside = 1 - 0.94 * smooth(0, 0.5, ru); // the lobes make room for the measure
      const headZ = YOU.z + YOU.back * (1 - clamp01(near));

      // the field (the amplitude of a wave goes as the root of its power)
      const field = Math.pow(pw, 0.8) * aside;
      seen(lobes, field > 0.002);
      lobes.uniforms.uTime.value = time;
      lobes.uniforms.uAmount.value = field;
      lobes.uniforms.uGrow.value = 0.7 + 0.3 * pw;
      seen(strings, field > 0.002);
      strings.uniforms.uTime.value = time;
      strings.uniforms.uAmount.value = field;
      strings.uniforms.uAmp.value = 1.9 * Math.sqrt(pw);

      // the rebound: only against a door that is there, and shut
      const shut = clamp01(door) * (1 - smooth(0.02, 0.2, open));
      const back = pw * shut * (1 - smooth(0, 0.5, ru));
      PLATE.uShut.value = shut;
      seen(rebound, back > 0.002);
      rebound.uniforms.uPhase.value = (time * LEAK.speed) / HALF;
      rebound.uniforms.uReach.value = BACK.reach;
      rebound.uniforms.uAmount.value = 1.2 * back;

      // the leak
      const gap = headZ - FACE - MOUTH_Z; // from the mouth to your face
      const reach = (gap * Math.max(lk, 0)) / 0.7;
      const out = pw * smooth(0, 0.06, lk);
      seen(leak, out > 0.002);
      leak.uniforms.uPhase.value = (time * LEAK.speed) / HALF;
      leak.uniforms.uReach.value = reach;
      leak.uniforms.uAmount.value = 1.5 * out;
      A.front.position.z = MOUTH_Z + reach;

      // the measure
      const draw = clamp01(ru / 0.6);
      seen(ruler, ru > 0.002);
      ruler.uniforms.uTime.value = time;
      ruler.uniforms.uDraw.value = draw;
      ruler.uniforms.uFresh.value = 1.2 * smooth(0, 0.1, draw) * (1 - smooth(0.85, 1, draw));
      ruler.uniforms.uAmount.value = smooth(0, 0.06, ru);
      show(ends, smooth(0.55, 0.75, ru));
      show(target, smooth(0.8, 1, ru));

      // the light: each thread runs straight from the dish to an eye, through the hole nearest to that line
      const lt = clamp01(light);
      seen(threads, lt > 0.002);
      if (lt > 0.002) {
        threads.uniforms.uTime.value = time;
        threads.uniforms.uAmount.value = Math.pow(lt, 0.7);
        const n = clamp01(near);
        if (watched) {
          watched.updateWorldMatrix(true, false);
          const e = watched.matrixWorld.elements;
          brow.set(e[12], e[13], e[14]);
          right.set(e[0], e[1], e[2]).normalize();
          fwd.set(e[8], e[9], e[10]).normalize();
          brow.addScaledVector(fwd, -1.4); // from the brow back to the front of the eyeballs
        } else {
          brow.set(YOU.x, YOU.head + EYES.dy + EYES.rise * (1 - n), headZ - EYES.front);
          right.set(-1, 0, 0);
        }
        for (let i = 0; i < THREADS; i++) {
          const s = threads.S[i];
          // (each lands on its own point of the eye)
          eye.copy(brow).addScaledVector(right, (i === SIGHT || i % 2 ? 1 : -1) * EYES.dx + 0.28 * Math.cos(i * 2.4));
          eye.y += 0.28 * Math.sin(i * 2.4);
          threads.E[i].copy(eye);
          if (i === SIGHT) {
            // straight back from the eye through the marked hole, to the cavity's back wall
            const t = (CAVITY.z0 + 0.5 - eye.z) / (PLATE_Z - eye.z);
            threads.H[i].set(HOLE[0], HOLE[1], PLATE_Z);
            s.set(eye.x + (HOLE[0] - eye.x) * t, eye.y + (HOLE[1] - eye.y) * t, CAVITY.z0 + 0.5);
          } else {
            const t = (PLATE_Z - s.z) / (eye.z - s.z);
            nearestHole(s.x + (eye.x - s.x) * t, s.y + (eye.y - s.y) * t, threads.H[i]);
          }
        }
        A.ray.position.copy(threads.H[MAIN]).lerp(threads.E[MAIN], 0.5);
      }
    },
  };
}
