// DOSSIER L02 — Poste haute tension : THE SOLID THINGS — the system we take apart. Dark, fine light edges, three greys
// (the machined aluminium lighter than the cast steel, the sheds of the insulators darkest), metal ≤ 0.5, every part
// that fades with its own materials.
//
//   buildModel() → {
//     bay,        Group: YOUR bay's apparatus, in the bay's own frame (x along the bay as plan.js says, z = the phase
//                 offsets PH, y up): 3 breaker poles at BREAKER.x, 3 line disconnectors at LSECT.x, 3 bus disconnectors
//                 at BSECT.x, the padlock and the sign on the line disconnector of phase 1. world.js mounts it at z = BAY.mine
//     hero,       Group: the breaker pole of phase 1 — ITS FOOT at its local origin. world.js re-parents it: into
//                 `heroHome` (its place in the bay) in the poste, onto the bench's mount on the bench. The same object:
//                 the cut poste → bench is a match on the same pole at the same place of the picture
//     heroHome,   Group (in `bay`): where the hero stands in the bay
//     old,        Group: the 1956 breaker, six chambers in series (BENCH only — it stands at BENCH.old)
//     pole: { group, len, fit },   the insulating pole and its head (detector, or an earth clamp): its FOOT at its
//                 local origin, along +y. world.js places and aims it every frame (from your hands to the conductor).
//                 OPTIONAL `fit(dist)`: the pole is telescopic — its head's tip lands `dist` cm from the foot
//     makeEarthSet({ ground, points, free }) → { group, A: { head }, set({ clamps, current, earthed, wrong, shock }, time, px) }
//                 a portable earthing set: an earth clamp on its terminal at `ground` ([x, y, z], world), three line
//                 clamps that go up to `points` (three [x, y, z]: the conductors), copper cables between (a short-circuit
//                 bar on the ground links the three). `A.head`: where the pole holds the set (the eye of the clamp on its
//                 way up, or the pole's empty tip going down to fetch the next one) — continuous over clamps 1 → 2.
//                 `free` ([x, y, z] or null): where the earth end hangs when `wrong` undoes it first (1987). Its own group,
//                 world frame; `set` never touches `group.visible` (world.js may hide it)
//     A: { chamber, arcAt, sect, lock, sign },   anchors (Object3D) for labels
//     set(p, time, px)   every frame, several times per frame: depends on `p` and `time` only
//   }
//
// What `set` accepts (world.js · FIRST says what each one means):
//   place (the set shown: 0 poste · 1 bench · 2 line · 3 map), live, earthed, explode, named,
//   open, arc, heat, gas, wave, cycle, see, parts, era, cloud, vacuum, sopen, lock, sign, threat, head (0 detector ·
//   1 clamp on the pole), beep
//
// THE HERO'S CHAMBER (live tank, SF6 puffer): the housing is built CUT — 250° of it always there, the 110° facing
// the camera (azimuth CUT_AZ, the bench's shots: az −20 … −30) a part of its own that `see` fades out; inside, cut the
// same way, the fixed contact (support tube, finger crown, the arcing pin) and the moving one (the puffer cylinder,
// the white PTFE nozzle, the tulip, the drive rod), which `open` pulls down by STROKE. The arc burns on the axis from
// the pin's tip to the tulip, through the nozzle's throat: a ribbon turned to the eye (white core, signal sheath, long
// halo), a ball of light on each root, and a REAL point light that lights the inside of the housing, the nozzle and
// the contacts. The SF6 (veille) is streaks that run from the puffer through the throat along the arc.
//
// Colours here: signal is what is live and the threat (the arc, the pulse on what could close again, the cloud once
// it is high: the climate); veille is what protects (the gas that blows the arc, the earthing sets once earthed and
// their current, the zero crossings, what the voice names).
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { solid, glass, asShell, makePart, addMesh, setPartOpacity, anchor, box, cyl } from "@kit/build3d.js";
import { PH, LSECT, BREAKER, BSECT, POLE, BENCH } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.86, 0.62);
const WHITE = new THREE.Color(1, 0.97, 0.92);

/* the greys (three values, and the white of the PTFE nozzle) */
const G = { shed: 0x434950, cast: 0x666c72, alu: 0xa7adb2, cut: 0x707680, ptfe: 0xd8d4ca, tip: 0x5d5853, copper: 0x7f756b, fibre: 0x9a958b };

/* the cut: the wedge removed from the hero's chamber faces this azimuth (the bench's camera) */
const CUT_AZ = -25;
const CUT = { a0: (CUT_AZ + 55) * DEG, len: 250 * DEG, w0: (CUT_AZ - 55) * DEG, wlen: 110 * DEG };

/* the chamber (plan.js), and the moving contact's travel. Inside numbers are written for y0 = 600: OFF moves them */
const CH = BREAKER.chamber;
const OFF = CH.y0 - 600;
const STROKE = 32; // cm: the pin leaves the tulip, the arc burns 28 cm long through the throat
const VSTROKE = 4; // cm: the vacuum bottle's gap
const PIN_TIP = 758;
const ARC_MID = 744;

/* ─────────────────────────────────────────────────────────── geometry */

const v2 = (pts) => pts.map(([r, y]) => new THREE.Vector2(r, y));
/** A profile turned about y; `a0`/`len` a sector of it (the cut). Smooth around, sharp at the profile's corners. */
const turned = (profile, { seg = 64, a0 = 0, len = Math.PI * 2, crease = 38, open = false } = {}) => {
  // a hollow profile is closed back to its start (the lathe does not close a polyline)
  const pts = !open && (profile[0][0] > 0 || profile[profile.length - 1][0] > 0) ? [...profile, profile[0]] : profile;
  return toCreasedNormals(new THREE.LatheGeometry(v2(pts), seg, a0, len), crease * DEG);
};
/** The section of a turned profile, laid in the half-plane at azimuth `phi` (what a cut shows). */
function capOf(profile, phi) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(v2(profile)));
  g.rotateY(phi - Math.PI / 2);
  return g;
}
/** An insulator's sheds up a core of radius rc, from y0 to y1 (outer side only, upward): big and small in turn. */
function sheds(y0, y1, rc, big, small, pitch) {
  const pts = [];
  let k = 0;
  for (let y = y0 + pitch * 0.4; y < y1 - pitch * 0.7; y += pitch, k++) {
    const R = k % 2 ? small : big;
    const drop = (R - rc) * 0.22;
    pts.push([rc, y], [R - 0.4, y + 0.25], [R, y + 0.7], [R, y + 1.2], [R - 0.6, y + 1.45], [rc, y + 1.4 + drop]);
  }
  return pts;
}
/** An insulator column, solid, from y0 to y1 (flanges are separate pieces). */
const insulator = (y0, y1, rc, big, small, pitch) => [[0, y0], [rc, y0], ...sheds(y0, y1, rc, big, small, pitch), [rc, y1], [0, y1]];

/** `count` ribbons of `segs` stretches, laid along a curve by a shader: `aT` along, `aSide` across, `aK` which one. */
function ribbons(count, segs) {
  const pos = [], t = [], side = [], which = [], index = [];
  for (let k = 0; k < count; k++) {
    for (let i = 0; i <= segs; i++)
      for (const s of [-1, 1]) {
        pos.push(0, 0, 0);
        t.push(i / segs);
        side.push(s);
        which.push(k);
      }
    for (let i = 0; i < segs; i++) {
      const a = (k * (segs + 1) + i) * 2;
      index.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aT", new THREE.Float32BufferAttribute(t, 1));
  geo.setAttribute("aSide", new THREE.Float32BufferAttribute(side, 1));
  geo.setAttribute("aK", new THREE.Float32BufferAttribute(which, 1));
  geo.setIndex(index);
  return geo;
}
/** `count` quads facing the eye, `aC` their corner, `aK` which one. */
function quads(count) {
  const pos = [], c = [], which = [], index = [];
  for (let k = 0; k < count; k++) {
    for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      pos.push(0, 0, 0);
      c.push(x, y);
      which.push(k);
    }
    const a = k * 4;
    index.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aC", new THREE.Float32BufferAttribute(c, 2));
  geo.setAttribute("aK", new THREE.Float32BufferAttribute(which, 1));
  geo.setIndex(index);
  return geo;
}
const lightMesh = (geometry, material, order = 5) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
};

/* ─────────────────────────────────────────────────────────── light shaders (built once the frame is known) */

// what a shader needs to keep a width of at least N pixels: cm per pixel at the depth of `c` (view space)
const cmPerPx = (H2) => `max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2})`;
const additive = (o) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, ...o });

/** The arc: a ribbon along a bowed curve A → C → B, turned to the eye — white core with a clear edge, signal sheath, long halo. */
const arcMaterial = (H2, o = {}) =>
  additive({
    uniforms: {
      uA: { value: V() }, uB: { value: V() }, uC: { value: V() }, uTime: { value: 0 }, uWander: { value: 0.8 }, uSeed: { value: o.seed ?? 0 },
      uWidth: { value: o.width ?? 7 }, uMinPx: { value: o.minPx ?? 10 }, uQ: { value: o.q ?? 7 }, uFeather: { value: 0.05 },
      uHue: { value: SIGNAL.clone() }, uHot: { value: HOT.clone() }, uK: { value: new THREE.Vector3(0.34, 0.95, 2.7) }, uAmount: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aT; attribute float aSide;
      uniform vec3 uA, uB, uC; uniform float uTime, uWander, uWidth, uMinPx, uSeed;
      varying float vAcross; varying float vT;
      void main() {
        float t = aT; float m = 1.0 - t;
        vec3 p = m * m * uA + 2.0 * t * m * uC + t * t * uB;
        vec3 d = 2.0 * m * (uC - uA) + 2.0 * t * (uB - uC);
        // it wanders, slowly (the film is in slow motion), in two directions across its axis
        vec3 ax = normalize(d + vec3(1e-5));
        vec3 n1 = normalize(cross(ax, abs(ax.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 n2 = cross(ax, n1);
        float env = sin(3.14159 * t);
        p += uWander * env * (n1 * (sin(t * 7.0 + uTime * 2.1 + uSeed) + 0.5 * sin(t * 15.0 - uTime * 3.3 + uSeed))
                            + n2 * (0.7 * sin(t * 9.0 - uTime * 1.7 + uSeed * 1.3)));
        vec4 c = modelViewMatrix * vec4(p, 1.0);
        vec3 tv = (modelViewMatrix * vec4(d, 0.0)).xyz;
        vec3 s = cross(tv, -c.xyz);
        float ls = length(s);
        s = ls > 1e-6 ? s / ls : vec3(1.0, 0.0, 0.0);
        float w = max(uWidth * (0.62 + 0.38 * sqrt(env)), uMinPx * ${cmPerPx(H2)});
        c.xyz += s * (aSide * w);
        vAcross = aSide; vT = t;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue, uHot, uK; uniform float uAmount, uQ, uFeather;
      varying float vAcross; varying float vT;
      void main() {
        float x = abs(vAcross) * uQ; // the distance to the axis, in radii of the core
        float core = 1.0 - smoothstep(0.7, 1.3, x);
        float sheath = exp(-x * x / 5.8);
        float h = x / 3.0;
        float halo = pow(1.0 + h * h, -1.4) * (1.0 - smoothstep(0.5 * uQ, uQ, x));
        float ends = smoothstep(0.0, uFeather, vT) * (1.0 - smoothstep(1.0 - uFeather, 1.0, vT));
        vec3 col = uHue * (halo * uK.x + sheath * uK.y) + uHot * (core * uK.z);
        gl_FragColor = vec4(col * (uAmount * ends), 1.0);
      }`,
  });

/** A ball of light with no edge, facing the eye: a small hot heart, a soft body, a long tail. */
const ballMaterial = (H2, heart, hue) =>
  additive({
    side: THREE.FrontSide,
    uniforms: { uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute vec2 aC; uniform float uRadius, uMinPx; varying vec2 vUv;
      void main() {
        vUv = aC;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * ${cmPerPx(H2)});
        c.xy += aC * r;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        float core = exp(-r2 / 0.012);
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
        gl_FragColor = vec4((uHeart * (core * 2.2) + uHue * (body + tail)) * uAmount, 1.0);
      }`,
  });
const makeBall = (H2, heart, hue) => {
  const m = lightMesh(quads(1), ballMaterial(H2, heart, hue), 6);
  m.visible = false;
  return m;
};

/** The SF6 blowing the arc: streaks that run from the puffer, through the nozzle's throat, along the arc and out. */
const gasMaterial = (H2) =>
  additive({
    uniforms: { uTime: { value: 0 }, uNB: { value: 742 }, uAmount: { value: 0 }, uHue: { value: VEILLE.clone() }, uW: { value: 0.55 }, uMinPx: { value: 1.6 }, uRate: { value: 0.7 } },
    vertexShader: /* glsl */ `
      attribute float aT; attribute float aSide; attribute float aK;
      uniform float uTime, uNB, uW, uMinPx, uRate;
      varying float vAcross; varying float vF; varying float vT;
      vec3 path(float s, float ang) {
        float r; float y;
        if (s < 0.3) { float u = s / 0.3; r = mix(10.0, 5.6, u); y = uNB - 22.0 + u * 28.0; }
        else if (s < 0.5) { float u = (s - 0.3) / 0.2; r = mix(5.6, 2.5, u * (2.0 - u)); y = uNB + 6.0 + u * 18.0; }
        else { float u = (s - 0.5) / 0.5; r = mix(2.5, 10.0, u * u); y = uNB + 24.0 + u * 66.0; }
        return vec3(r * sin(ang), y, r * cos(ang));
      }
      void main() {
        float h = fract(sin(aK * 12.9898 + 4.1) * 43758.5453);
        float ang = aK * 2.39996 + 0.35 * sin(uTime * 0.6 + aK);
        float head = fract(h + uTime * uRate);
        float s = head - 0.15 * (1.0 - aT);
        vF = sin(3.14159 * head) * smoothstep(0.0, 0.03, s);
        s = clamp(s, 0.0, 1.0);
        vec3 p = path(s, ang);
        vec3 d = path(min(1.0, s + 0.01), ang) - path(max(0.0, s - 0.01), ang);
        vec4 c = modelViewMatrix * vec4(p, 1.0);
        vec3 tv = (modelViewMatrix * vec4(d, 0.0)).xyz;
        vec3 sd = cross(tv, -c.xyz);
        float ls = length(sd);
        sd = ls > 1e-6 ? sd / ls : vec3(1.0, 0.0, 0.0);
        c.xyz += sd * (aSide * max(uW, uMinPx * ${cmPerPx(H2)}));
        vAcross = aSide; vT = aT;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue; uniform float uAmount; varying float vAcross; varying float vF; varying float vT;
      void main() {
        float x = abs(vAcross);
        float body = exp(-x * x * 3.5);
        float k = body * smoothstep(0.0, 0.35, vT) * vF;
        gl_FragColor = vec4(uHue * (k * 1.25 * uAmount), 1.0);
      }`,
  });

/** The gas leaving the chamber as a cloud: soft puffs rising, veille low, signal high (the climate). */
const cloudMaterial = (H2) =>
  additive({
    side: THREE.FrontSide,
    uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uReach: { value: 900 }, uVeille: { value: VEILLE.clone() }, uSignal: { value: SIGNAL.clone() } },
    vertexShader: /* glsl */ `
      attribute vec2 aC; attribute float aK;
      uniform float uTime, uReach, uAmount;
      varying vec2 vUv; varying float vF; varying float vK;
      void main() {
        vK = aK;
        float h1 = fract(sin(aK * 12.9898) * 43758.5453);
        float h2 = fract(sin(aK * 78.233) * 12345.678);
        float f = fract(h1 + uTime * 0.045);
        float ang = aK * 2.39996 + f * 1.4;
        float spread = 8.0 + pow(f, 1.3) * 300.0 * (0.45 + 0.55 * uAmount) * (0.6 + 0.8 * h2);
        vec3 p = vec3(spread * sin(ang), f * uReach + 20.0 * h2, spread * cos(ang));
        vec4 c = modelViewMatrix * vec4(p, 1.0);
        float size = 22.0 + 190.0 * f * (0.7 + 0.6 * h2);
        c.xy += aC * size;
        vUv = aC; vF = f;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uVeille, uSignal; uniform float uAmount; varying vec2 vUv; varying float vF; varying float vK;
      void main() {
        float r2 = dot(vUv, vUv);
        float soft = exp(-r2 * 3.2) * (1.0 - smoothstep(0.7, 1.0, sqrt(r2)));
        // one hue or the other, never their mix (no fourth colour): veille low, signal high
        float high = step(0.5, fract(vK * 0.618 + 0.13) * 0.55 + vF * 0.9);
        vec3 hue = high > 0.5 ? uSignal : uVeille;
        float life = sin(3.14159 * vF);
        gl_FragColor = vec4(hue * (soft * life * 0.12 * uAmount), 1.0);
      }`,
  });

/** The alternating current beside the chamber (MODE 0 the trace, 1 the zero ticks, 2 the baseline), in a plane facing the camera. */
const waveMaterial = (H2, mode) =>
  additive({
    defines: { MODE: mode },
    uniforms: {
      uC0: { value: 0 }, uCycle: { value: 0 }, uN: { value: 4 }, uX0: { value: -215 }, uW: { value: 150 }, uA: { value: 34 }, uAmount: { value: 0 }, uMinPx: { value: mode === 0 ? 1.6 : 1.3 },
      uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() },
    },
    vertexShader: /* glsl */ `
      attribute float aT; attribute float aSide; attribute float aK;
      uniform float uC0, uCycle, uN, uX0, uW, uA, uMinPx;
      varying float vAcross; varying float vPhi; varying float vAge;
      void main() {
        vec3 p; vec3 d;
        #if MODE == 0
          float phi = uC0 + aT * uN;
          p = vec3(uX0 + aT * uW, uA * sin(3.14159 * phi), 0.0);
          d = vec3(uW / uN, uA * 3.14159 * cos(3.14159 * phi), 0.0);
          vPhi = phi; vAge = 0.0;
        #elif MODE == 1
          float phi = ceil(uC0 + 0.001) + aK;
          p = vec3(uX0 + (phi - uC0) / uN * uW, uA * (aT - 0.5) * 0.7, 0.0);
          d = vec3(0.0, 1.0, 0.0);
          vPhi = phi; vAge = uCycle - phi;
        #else
          p = vec3(uX0 + aT * uW, 0.0, 0.0);
          d = vec3(1.0, 0.0, 0.0);
          vPhi = uC0 + aT * uN; vAge = 0.0;
        #endif
        vec4 c = modelViewMatrix * vec4(p, 1.0);
        vec3 tv = (modelViewMatrix * vec4(d, 0.0)).xyz;
        vec3 s = cross(tv, -c.xyz);
        float ls = length(s);
        s = ls > 1e-6 ? s / ls : vec3(1.0, 0.0, 0.0);
        c.xyz += s * (aSide * uMinPx * ${cmPerPx(H2)});
        vAcross = aSide;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uVeille; uniform float uAmount, uCycle;
      varying float vAcross; varying float vPhi; varying float vAge;
      void main() {
        float x = abs(vAcross);
        float body = 1.0 - smoothstep(0.55, 1.0, x);
        #if MODE == 0
          if (vPhi > uCycle) discard;
          vec3 col = uInk * 0.95;
        #elif MODE == 1
          if (vAge < 0.0) discard;
          vec3 col = uVeille * (0.75 + 1.5 * exp(-vAge * 4.0));
        #else
          vec3 col = uInk * 0.3;
        #endif
        gl_FragColor = vec4(col * body * uAmount, 1.0);
      }`,
  });

/** The SF6 filling the chamber, drawn only while it drains away (`vacuum`): a faint veille volume with a level line. */
const fillMaterial = () =>
  additive({
    uniforms: { uLevel: { value: 886 }, uAmount: { value: 0 }, uHue: { value: VEILLE.clone() } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vY = position.y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uLevel, uAmount; uniform vec3 uHue; varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        if (vY > uLevel) discard;
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float line = 1.0 - smoothstep(0.0, 1.6, uLevel - vY);
        gl_FragColor = vec4(uHue * ((0.05 + 0.25 * g * g) + 0.9 * line) * uAmount, 1.0);
      }`,
  });

/** Copper cable laid along a bowed curve (A → C → B) by its vertex shader: a lit tube, never thinner than a few pixels;
 *  running dashes for a current, a tint once earthed. One material per cable (its uniforms are its shape). */
function cableMaterial(H2) {
  const U = {
    uA: { value: V() }, uB: { value: V(0, 1, 0) }, uC: { value: V(0, 0.5, 0) }, uR: { value: 1.1 }, uMinPx: { value: 2.6 },
    uLen: { value: 100 }, uRun: { value: 0 }, uDash: { value: 0 }, uDashHue: { value: VEILLE.clone() }, uTint: { value: 0 }, uTintHue: { value: VEILLE.clone() },
  };
  const mat = new THREE.MeshStandardMaterial({ color: G.copper, roughness: 0.38, metalness: 0.35 });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uA, uB, uC; uniform float uR, uMinPx; varying float vT;")
      .replace(
        "#include <beginnormal_vertex>",
        /* glsl */ `
        float t = clamp(position.y + 0.5, 0.0, 1.0); vT = t;
        float m = 1.0 - t;
        vec3 P = m * m * uA + 2.0 * t * m * uC + t * t * uB;
        vec3 T = 2.0 * m * (uC - uA) + 2.0 * t * (uB - uC);
        float lt = length(T); T = lt > 1e-5 ? T / lt : vec3(0.0, 1.0, 0.0);
        vec3 ref = abs(T.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 N1 = normalize(cross(T, ref)); vec3 B1 = cross(T, N1);
        vec2 rad = position.xz; float lr = length(rad); rad = lr > 1e-5 ? rad / lr : vec2(1.0, 0.0);
        vec3 objectNormal = rad.x * N1 + rad.y * B1;`,
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `
        vec4 c = modelViewMatrix * vec4(P, 1.0);
        float rr = max(uR, uMinPx * 0.5 * ${cmPerPx(H2)});
        vec3 transformed = P + objectNormal * rr;`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uLen, uRun, uDash, uTint; uniform vec3 uDashHue, uTintHue; varying float vT;")
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        float sRun = (1.0 - vT) * uLen - uRun;
        float ph = fract(sRun / 46.0);
        float dsh = smoothstep(0.30, 0.42, ph) * (1.0 - smoothstep(0.72, 0.84, ph));
        totalEmissiveRadiance += uDashHue * (uDash * dsh) + uTintHue * uTint;`,
      );
  };
  mat.userData.U = U;
  return mat;
}
const cableGeo = new THREE.CylinderGeometry(1, 1, 1, 10, 48, true);
function makeCable(H2) {
  const m = new THREE.Mesh(cableGeo, cableMaterial(H2));
  m.frustumCulled = false;
  m.castShadow = false;
  m.receiveShadow = true;
  return m;
}
/** Lay a cable from a to b ([x, y, z] or Vector3) bowed through c; its length for the dashes. */
function layCable(cable, a, b, c) {
  const U = cable.material.userData.U;
  U.uA.value.copy(a);
  U.uB.value.copy(b);
  U.uC.value.copy(c);
  U.uLen.value = a.distanceTo(c) + c.distanceTo(b);
}

/* ─────────────────────────────────────────────────────────── the arc's own light */

// The arc lights what is round it — the nozzle, the contacts, the inside of the housing — as a LINE of light (the
// segment it burns along), softened near it: a point light at the axis would burn the white nozzle out three
// centimetres away while leaving the housing dark. Shared uniforms (world space), written once per frame.
const ARC_LIGHT = { uArcA: { value: V() }, uArcB: { value: V() }, uArcCol: { value: SIGNAL.clone() }, uArcI: { value: 0 }, uArcR0: { value: 17 } };
function arcLit(mat) {
  const prev = mat.userData.patched ? mat.onBeforeCompile : null;
  const key = (mat.userData.patched ?? "") + "|arcLit";
  mat.userData.patched = key;
  mat.onBeforeCompile = (sh, r) => {
    prev?.call(mat, sh, r);
    Object.assign(sh.uniforms, ARC_LIGHT);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vArcP; varying vec3 vArcN;")
      .replace("#include <fog_vertex>", "vArcP = (modelMatrix * vec4(transformed, 1.0)).xyz; vArcN = normalize(mat3(modelMatrix) * objectNormal);\n#include <fog_vertex>");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uArcA, uArcB, uArcCol; uniform float uArcI, uArcR0; varying vec3 vArcP; varying vec3 vArcN;")
      .replace(
        "#include <opaque_fragment>",
        /* glsl */ `if (uArcI > 0.0) {
          vec3 ab = uArcB - uArcA;
          float tt = clamp(dot(vArcP - uArcA, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
          vec3 L = uArcA + ab * tt - vArcP;
          float dd = length(L);
          vec3 Nn = normalize(gl_FrontFacing ? vArcN : -vArcN);
          float ndl = max(dot(Nn, L / max(dd, 1e-3)), 0.0);
          float fall = 1.0 / (1.0 + dd * dd / (uArcR0 * uArcR0));
          outgoingLight += diffuseColor.rgb * uArcCol * (uArcI * ndl * fall);
        }
        #include <opaque_fragment>`,
      );
  };
  mat.customProgramCacheKey = () => key;
  mat.needsUpdate = true;
  return mat;
}
/** A fine light lip where a surface turns away from the eye: the sheds' rims read as light edges, without a line each. */
function rimmed(mat, k = 0.14) {
  const prev = mat.userData.patched ? mat.onBeforeCompile : null;
  const key = (mat.userData.patched ?? "") + "|rim";
  mat.userData.patched = key;
  mat.onBeforeCompile = (sh, r) => {
    prev?.call(mat, sh, r);
    sh.uniforms.uRimK = { value: k };
    sh.uniforms.uRimCol = { value: INK.clone() };
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uRimK; uniform vec3 uRimCol;")
      .replace(
        "#include <opaque_fragment>",
        /* glsl */ `{ float ndv = clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
          outgoingLight += uRimCol * (uRimK * pow(1.0 - ndv, 3.0)); }
        #include <opaque_fragment>`,
      );
  };
  mat.customProgramCacheKey = () => key;
  return mat;
}

/* ─────────────────────────────────────────────────────────── named, threat */

/** What the voice names, lit: a soft veille on the solids, veille edges. Only re-written when it changes. */
function lampOf(roots, skipRoots = []) {
  const solids = new Set();
  const lines = new Set();
  const skip = new Set();
  for (const r of skipRoots) r.traverse((o) => skip.add(o));
  for (const root of roots)
    root.traverse((o) => {
      const m = o.material;
      if (!m || m.userData.noLamp || skip.has(o) || o.parent?.material?.userData?.noLamp) return;
      if (m.isLineMaterial) {
        lines.add(m);
        m.userData.rest = m.userData.rest ?? m.color.clone();
      } else if (m.isMeshStandardMaterial) solids.add(m);
    });
  let k = -1;
  return (v) => {
    if (v === k) return;
    k = v;
    for (const m of solids) m.emissive.copy(VEILLE).multiplyScalar(0.2 * v);
    for (const l of lines) l.color.copy(l.userData.rest).lerp(VEILLE, 0.8 * v);
  };
}
const noLamp = (m) => ((m.userData.noLamp = true), m);

/* ─────────────────────────────────────────────────────────── the sign */

const FONT_D = "'Barlow Condensed', sans-serif";
function signTexture() {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 480;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const paint = () => {
    const g = c.getContext("2d");
    g.fillStyle = "#d6d0c2";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#16191c";
    g.fillRect(18, 18, c.width - 36, 10);
    g.fillRect(18, c.height - 28, c.width - 36, 10);
    g.fillStyle = "#5cffb0";
    g.fillRect(18, 40, c.width - 36, 22);
    g.fillStyle = "#16191c";
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.font = `700 176px ${FONT_D}`;
    g.fillText("CONDAMNÉ", c.width / 2, 270);
    g.font = `600 60px ${FONT_D}`;
    g.letterSpacing = "2px";
    g.fillText("DÉFENSE DE MANŒUVRER", c.width / 2, 390, c.width - 72);
    g.letterSpacing = "0px";
    tex.needsUpdate = true;
  };
  paint();
  return { tex, paint };
}

/* ═════════════════════════════════════════════════════════════════════ the model */

export function buildModel() {
  const H2 = (BRAND.H / 2).toFixed(1); // read here: a long's landscape frame is set before this runs
  const bay = new THREE.Group();
  const heroHome = new THREE.Group();

  /* ══ A BREAKER POLE (live tank): pedestal → mechanism box → support insulator → chamber. Its foot at the origin ══ */
  const breakerPole = (isHero) => {
    const M = {
      shed: rimmed(solid(G.shed, { rough: 0.62, metal: 0.08 })),
      cast: solid(G.cast, { rough: 0.6, metal: 0.35 }),
      alu: solid(G.alu, { rough: 0.4, metal: 0.45 }),
      box: noLamp(solid(0x4c5258, { rough: 0.55, metal: 0.3 })),
    };
    const g = new THREE.Group();
    const base = makePart("base");
    const column = makePart("column");
    const chamber = makePart("chamber");
    g.add(base, column, chamber);
    const B = BREAKER.base;

    // the pedestal: a base plate, a square steel post with gussets, the casting that carries the column
    addMesh(base, box(92, 5, 92, 1), M.cast, { pos: [0, 2.5, 0] });
    addMesh(base, box(36, B - 30, 36, 1.5), M.cast, { pos: [0, 5 + (B - 30) / 2, 0] });
    for (const [x, z, w, d] of [[0, 30, 4, 26], [0, -30, 4, 26], [30, 0, 26, 4], [-30, 0, 26, 4]]) addMesh(base, box(w, 46, d, 0.6), M.cast, { pos: [x, 28, z] });
    addMesh(base, box(60, 24, 60, 2.5), M.alu, { pos: [0, B - 12, 0] });
    // the operating mechanism (the spring), in its box on the camera's side; its rod rises into the casting
    addMesh(base, box(54, 86, 30, 2), M.box, { pos: [-4, 148, 33] });
    addMesh(base, box(46, 76, 1.4, 0.5), M.box, { pos: [-4, 148, 48.6] });
    addMesh(base, cyl(5, 1.6, 0.4, 24), M.alu, { pos: [12, 166, 49.6], rot: [Math.PI / 2, 0, 0] });
    addMesh(base, box(3, 12, 3, 0.6), M.alu, { pos: [-22, 136, 49.8] });
    addMesh(base, cyl(2.2, B - 12 - 191, 0.3, 16), M.box, { pos: [-4, 191 + (B - 12 - 191) / 2, 33] });

    // the support insulator: aluminium flanges, dark sheds
    const c0 = B, c1 = CH.y0;
    addMesh(column, turned([[0, c0], [31, c0], [31, c0 + 9], [27, c0 + 12], [20, c0 + 12], [0, c0 + 12]], { seg: 48 }), M.alu);
    addMesh(column, turned(insulator(c0 + 12, c1 - 12, 20, 34, 28, 9), { seg: 48 }), M.shed, { edges: false });
    addMesh(column, turned([[0, c1 - 12], [20, c1 - 12], [27, c1 - 12], [31, c1 - 9], [31, c1], [0, c1]], { seg: 48 }), M.alu);

    // the chamber: bottom flange (and its terminal pad, bus side), the sheds, the top flange and its cap (pad, line side)
    const o = OFF;
    const flangeLo = [[4.5, 600 + o], [36, 600 + o], [36, 611 + o], [33, 614 + o], [21, 614 + o], [21, 612 + o], [4.5, 612 + o]];
    const housing = [[21, 614 + o], [28, 614 + o], ...sheds(614 + o, CH.y1 - 14, 28, 45, 37, 9.5), [28, CH.y1 - 14], [21, CH.y1 - 14]];
    const flangeHi = [[0, CH.y1 - 10], [21, CH.y1 - 10], [21, CH.y1 - 14], [36, CH.y1 - 14], [36, CH.y1 - 2], [33, CH.y1 + 2], [22, CH.y1 + 10], [0, CH.y1 + 13]];
    addMesh(chamber, box(28, 4, 14, 0.6), M.alu, { pos: [46, 605 + o, 0] });
    addMesh(chamber, box(28, 4, 14, 0.6), M.alu, { pos: [-46, CH.y1 + 4, 0] });
    for (const [x, y] of [[40, 605 + o], [52, 605 + o], [-40, CH.y1 + 4], [-52, CH.y1 + 4]]) addMesh(chamber, cyl(1.6, 5, 0.3, 12), M.cast, { pos: [x, y, 3] });

    const parts = { base, column, chamber };
    if (!isHero) {
      addMesh(chamber, turned(flangeLo, { seg: 48 }), M.alu);
      addMesh(chamber, turned(housing, { seg: 56 }), M.shed, { edges: false });
      addMesh(chamber, turned(flangeHi, { seg: 48 }), M.alu);
      return { g, M, parts };
    }

    // THE HERO: cut. 250° always there, the wedge facing the camera its own part (`see` fades it), the cut faces lighter
    const cutMat = solid(G.cut, { rough: 0.78, metal: 0.1, double: true });
    const wedge = makePart("wedge");
    chamber.add(wedge);
    const Mw = { shed: rimmed(solid(G.shed, { rough: 0.62, metal: 0.08 })), alu: solid(G.alu, { rough: 0.4, metal: 0.45 }) };
    for (const [prof, mat, wmat, edges] of [[flangeLo, M.alu, Mw.alu, true], [housing, M.shed, Mw.shed, false], [flangeHi, M.alu, Mw.alu, true]]) {
      addMesh(chamber, turned(prof, { seg: 40, a0: CUT.a0, len: CUT.len }), mat, { edges });
      for (const phi of [CUT.a0, CUT.a0 + CUT.len]) addMesh(chamber, capOf(prof, phi), cutMat, { edges: false });
      addMesh(wedge, turned(prof, { seg: 18, a0: CUT.w0, len: CUT.wlen }), wmat, { edges });
    }
    // once the wedge has gone, a faint glass keeps the housing's outline
    const shell = new THREE.Mesh(turned(housing, { seg: 18, a0: CUT.w0, len: CUT.wlen }), glass(INK, { base: 0, rim: 0.12, edge: 0.22 }));
    asShell(shell, 22);
    chamber.add(shell);
    return { g, M, parts: { ...parts, wedge, shell }, cutMat };
  };

  /* ══ THE BREAKERS: three poles, the hero first ══ */
  const poles = [];
  PH.forEach((z, i) => {
    const p = breakerPole(i === 0);
    if (i === 0) {
      heroHome.position.set(BREAKER.x, 0, z);
      heroHome.add(p.g);
      bay.add(heroHome);
    } else {
      p.g.position.set(BREAKER.x, 0, z);
      bay.add(p.g);
    }
    poles.push(p);
  });
  const H = poles[0];
  const hero = H.g;
  const chamberG = H.parts.chamber;

  /* ══ INSIDE THE HERO'S CHAMBER (all cut like the housing) ══ */
  const cutIn = solid(G.cut, { rough: 0.78, metal: 0.1, double: true });
  noLamp(cutIn);
  const inner = new THREE.Group();
  inner.position.y = OFF;
  chamberG.add(inner);
  const addCut = (part, profile, mat, { edges = true, seg = 40 } = {}) => {
    addMesh(part, turned(profile, { seg, a0: CUT.a0, len: CUT.len }), mat, { edges, threshold: 30 });
    for (const phi of [CUT.a0, CUT.a0 + CUT.len]) addMesh(part, capOf(profile, phi), cutIn, { edges: false });
  };
  const IM = {
    alu: noLamp(solid(G.alu, { rough: 0.38, metal: 0.45, double: true })),
    tip: noLamp(solid(G.tip, { rough: 0.5, metal: 0.4, double: true })),
    tip2: noLamp(solid(G.tip, { rough: 0.5, metal: 0.4, double: true })),
    pin: noLamp(solid(0x80868b, { rough: 0.4, metal: 0.45, double: true })),
    ptfe: noLamp(solid(G.ptfe, { rough: 0.55, metal: 0, double: true })),
    puff: noLamp(solid(0x8a9095, { rough: 0.42, metal: 0.45, double: true })),
    rod: noLamp(solid(G.cast, { rough: 0.55, metal: 0.35, double: true })),
  };
  // the fixed contact: support tube hanging from the top, the finger crown (main contact), the arcing pin
  const fixedP = makePart("fixed");
  addCut(fixedP, [[0, 808], [11, 808], [11, 888], [9, 888], [9, 814], [0, 814]], IM.alu);
  addCut(fixedP, [[15.6, 789], [17.8, 789], [18.4, 795], [18.4, 812], [11, 812], [11, 806], [15.6, 800]], IM.alu);
  addCut(fixedP, [[0, PIN_TIP], [1.6, PIN_TIP + 0.4], [2.4, PIN_TIP + 2], [2.4, PIN_TIP + 7], [0, PIN_TIP + 7]], IM.tip, { seg: 24 });
  addCut(fixedP, [[0, PIN_TIP + 7], [2.4, PIN_TIP + 7], [2.4, 808], [0, 808]], IM.pin, { seg: 24 });
  // the moving contact: the puffer cylinder (also the main moving contact), the nozzle, the tulip, the drive rod
  const pufferP = makePart("puffer");
  addCut(pufferP, [[3.5, 688], [15.5, 688], [15.5, 796], [14.6, 800], [13, 800], [13, 694], [3.5, 694]], IM.puff);
  const nozzleP = makePart("nozzle");
  addCut(nozzleP, [[6, 742], [12.8, 742], [12.8, 770], [10.5, 792], [8, 792], [3.3, 772], [3.3, 764], [6, 752]], IM.ptfe, { edges: false });
  const tulipP = makePart("tulip");
  addCut(tulipP, [[0, 694], [2.6, 694], [2.6, 744], [5, 746], [5, 756], [2.5, 756], [2.5, 750], [0, 750]], IM.pin, { seg: 24 });
  addCut(tulipP, [[2.5, 756], [5, 756], [5, 760], [4.4, 762], [2.5, 762]], IM.tip2, { seg: 24 });
  const rodP = makePart("rod");
  addCut(rodP, [[0, 590], [3.5, 590], [3.5, 690], [0, 690]], IM.rod, { seg: 24 });
  inner.add(fixedP, pufferP, nozzleP, tulipP, rodP);
  const sf6Parts = [fixedP, pufferP, nozzleP, tulipP, rodP];

  // the vacuum bottle: ceramic body, end caps, the shield, the butt contacts on their stems, the bellows
  const VM = {
    cer: noLamp(solid(0x8e8a83, { rough: 0.7, metal: 0, double: true })),
    alu: noLamp(solid(G.alu, { rough: 0.38, metal: 0.45, double: true })),
    shield: noLamp(solid(0x666c72, { rough: 0.45, metal: 0.45, double: true })),
  };
  const vacFixed = makePart("vac-fixed");
  addCut(vacFixed, [[13, 706], [15, 706], [15, 794], [13, 794]], VM.cer, { edges: true });
  addCut(vacFixed, [[3.6, 700], [15.6, 700], [15.6, 706], [3.6, 706]], VM.alu);
  addCut(vacFixed, [[3.6, 794], [15.6, 794], [15.6, 800], [3.6, 800]], VM.alu);
  addCut(vacFixed, [[10.6, 734], [11.4, 734], [11.4, 770], [10.6, 770]], VM.shield);
  addCut(vacFixed, [[0, 752], [8, 752], [8.4, 754], [8, 756], [3.5, 756], [3.5, 888], [0, 888]], VM.alu, { seg: 24 });
  const vacMoving = makePart("vac-moving");
  addCut(vacMoving, [[0, 600], [3.5, 600], [3.5, 748], [8, 748], [8.4, 750], [8, 752], [0, 752]], VM.alu, { seg: 24 });
  const bellows = [[3.6, 706]];
  for (let k = 0; k < 6; k++) bellows.push([6.6, 708 + k * 3], [4.2, 709.5 + k * 3]);
  bellows.push([3.6, 726]);
  addCut(vacMoving, [...bellows, [3.5, 726], [3.5, 706]], VM.shield, { edges: false, seg: 24 });
  inner.add(vacFixed, vacMoving);

  // the SF6 in the chamber, drawn only while it drains (vacuum)
  const fill = lightMesh(turned([[20.4, 615], [20.4, 885]], { seg: 40, a0: CUT.a0, len: CUT.len, crease: 50, open: true }), fillMaterial(), 4);
  inner.add(fill);

  /* ══ THE ARC ══ */
  const arcMat = arcMaterial(H2, { width: 4.5, q: 7, minPx: 7 });
  const arcMesh = lightMesh(ribbons(1, 40), arcMat, 6);
  const footA = makeBall(H2, WHITE, SIGNAL);
  const footB = makeBall(H2, WHITE, SIGNAL);
  inner.add(arcMesh, footA, footB);
  // what the arc lights: everything inside the chamber, and the chamber itself
  const lit = new Set();
  chamberG.traverse((o) => {
    const m = o.material;
    if (m?.isMeshStandardMaterial && !lit.has(m)) {
      lit.add(m);
      arcLit(m);
    }
  });
  const gasMat = gasMaterial(H2);
  const gasMesh = lightMesh(ribbons(44, 8), gasMat, 6);
  inner.add(gasMesh);

  /* ══ THE CURRENT, beside the chamber: a sine in a plane facing the bench's camera ══ */
  const waveG = new THREE.Group();
  waveG.position.set(0, ARC_MID + OFF, 0);
  waveG.rotation.y = CUT_AZ * DEG;
  chamberG.add(waveG);
  const waveTrace = lightMesh(ribbons(1, 200), waveMaterial(H2, 0), 7);
  const waveTicks = lightMesh(ribbons(8, 1), waveMaterial(H2, 1), 7);
  const waveBase = lightMesh(ribbons(1, 1), waveMaterial(H2, 2), 7);
  const cursor = makeBall(H2, WHITE, SIGNAL);
  waveG.add(waveTrace, waveTicks, waveBase, cursor);
  const waveMats = [waveTrace.material, waveTicks.material, waveBase.material];

  /* ══ THE CLOUD: the gas leaving through the top ══ */
  const cloudMat = cloudMaterial(H2);
  const cloudMesh = lightMesh(quads(90), cloudMat, 8);
  cloudMesh.position.y = CH.y1 + 14;
  chamberG.add(cloudMesh);

  /* ══ A DISCONNECTOR (horizontal centre-break): two turning columns, an arm on each, contacts meeting mid-span ══ */
  const disconnector = (S, withBox) => {
    const M = {
      shed: rimmed(solid(G.shed, { rough: 0.62, metal: 0.08 })),
      cast: solid(G.cast, { rough: 0.6, metal: 0.35 }),
      alu: solid(G.alu, { rough: 0.4, metal: 0.45 }),
      box: solid(0x4c5258, { rough: 0.55, metal: 0.3 }),
      axis: noLamp(solid(0x7a8085, { rough: 0.45, metal: 0.45 })),
    };
    const g = new THREE.Group();
    const frame = makePart("frame");
    g.add(frame);
    const half = S.gap / 2;
    // the steel: a post under each column, a channel across
    for (const s of [-1, 1]) addMesh(frame, box(26, S.base - 14, 26, 1), M.cast, { pos: [s * half, (S.base - 14) / 2, 0] });
    addMesh(frame, box(S.gap + 90, 14, 34, 1), M.cast, { pos: [0, S.base - 7, 0] });
    const cols = [];
    const arms = [];
    for (const s of [-1, 1]) {
      const col = makePart("col");
      col.position.x = s * half;
      g.add(col);
      const y0 = S.base;
      const yTop = S.base + S.column;
      addMesh(col, cyl(17, 12, 1, 40), M.alu, { pos: [0, y0 + 6, 0] });
      addMesh(col, turned(insulator(y0 + 12, yTop - 4, 12, 24, 20, 8.5), { seg: 40 }), M.shed, { edges: false });
      addMesh(col, cyl(14, S.top - yTop + 4, 1, 40), M.alu, { pos: [0, (yTop - 4 + S.top) / 2, 0] });
      addMesh(col, box(20, 3, 12, 0.5), M.alu, { pos: [s * 25, S.top - 6, 0] });
      // the arm on its pivot: a tube, and its contact at the tip (male on one side, the fingers on the other)
      const pivot = new THREE.Group();
      pivot.position.set(0, S.top + 7, 0);
      col.add(pivot);
      const armP = makePart("arm");
      pivot.add(armP);
      addMesh(armP, cyl(4.2, S.arm - 8, 0.6, 24), M.alu, { pos: [(-s * (S.arm - 8)) / 2, 0, 0], rot: [0, 0, Math.PI / 2] });
      addMesh(armP, box(14, 12, 12, 1), M.alu, { pos: [0, 0, 0] });
      if (s < 0) addMesh(armP, box(16, 3, 9, 0.8), M.alu, { pos: [S.arm - 8, 0, 0] });
      else for (const dz of [-5.5, 5.5]) addMesh(armP, box(18, 10, 2, 0.5), M.alu, { pos: [-(S.arm - 9), 0, dz] });
      cols.push(col);
      arms.push([pivot, s]);
    }
    const out = { g, M, frame, cols, arms, axisMats: [] };
    if (withBox) {
      // the operating box on the near post (+z), its crank socket, the hasp; the rod that turns the column: its closing axis
      const x = -half;
      addMesh(frame, box(40, 60, 28, 1.5), M.box, { pos: [x, 130, 30] });
      addMesh(frame, box(34, 52, 1.2, 0.4), M.box, { pos: [x, 130, 44.6] });
      addMesh(frame, cyl(3.4, 4, 0.4, 20), M.alu, { pos: [x - 6, 140, 46.5], rot: [Math.PI / 2, 0, 0] });
      addMesh(frame, box(2, 7, 5, 0.3), M.alu, { pos: [x + 16, 129, 47] });
      addMesh(frame, cyl(2.2, S.base - 4 - 160, 0.3, 16), M.axis, { pos: [x, 160 + (S.base - 4 - 160) / 2, 30] });
      addMesh(frame, box(7, 5, 32, 0.6), M.axis, { pos: [x, S.base - 3, 15] });
      out.axisMats.push(M.axis);
      out.hasp = [x + 16, 129, 47];
    }
    return out;
  };

  const sects = [];
  const bsects = [];
  let sect1 = null;
  PH.forEach((z, i) => {
    for (const S of [LSECT, BSECT]) {
      const d = disconnector(S, S === LSECT && i === 0);
      d.g.position.set(S.x, 0, z);
      bay.add(d.g);
      (S === LSECT ? sects : bsects).push(d);
      if (S === LSECT && i === 0) sect1 = d;
    }
  });

  /* ══ THE PADLOCK AND THE SIGN, on phase 1's line disconnector (its box's hasp) ══ */
  const [hx, hy, hz] = sect1.hasp;
  const lockP = makePart("padlock");
  lockP.position.set(hx, hy - 9, hz + 1.2);
  sect1.frame.add(lockP);
  const LM = { body: solid(0xa39e93, { rough: 0.42, metal: 0.4 }), steel: solid(0x81878c, { rough: 0.35, metal: 0.5 }) };
  addMesh(lockP, box(6.4, 7.2, 2.8, 0.6), LM.body, { pos: [0, 0, 0] });
  addMesh(lockP, cyl(0.7, 0.4, 0.1, 16), LM.steel, { pos: [0, -1.2, 1.45], rot: [Math.PI / 2, 0, 0] });
  const shackle = new THREE.Group();
  shackle.position.set(-1.9, 3.6, 0); // the hinge leg
  lockP.add(shackle);
  const shP = makePart("shackle");
  shackle.add(shP);
  addMesh(shP, new THREE.TorusGeometry(1.9, 0.48, 10, 20, Math.PI), LM.steel, { pos: [1.9, 3.2, 0], edges: false });
  for (const x of [0, 3.8]) addMesh(shP, new THREE.CylinderGeometry(0.48, 0.48, 3.4, 10), LM.steel, { pos: [x, 1.5, 0], edges: false });
  // the sign hangs from the shackle on a cord, to the right of the box
  const sign = makePart("sign");
  sign.position.set(hx + 1, hy - 4, hz + 2);
  sect1.frame.add(sign);
  const { tex: signTex, paint: paintSign } = signTexture();
  const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.82, metalness: 0, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: 1 });
  Object.assign(signMat.userData, { base: 1, transparent: false, depthWrite: true, noLamp: true });
  const signPlate = new THREE.Group();
  signPlate.position.set(19, -15, 0.6);
  sign.add(signPlate);
  addMesh(sign, box(33, 21, 0.5, 0.2), solid(0x9a958b, { rough: 0.8 }), { pos: [19, -15, 0.2] });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(32, 20), signMat);
  face.position.set(19, -15, 0.47);
  sign.add(face);
  sign.userData.part.mats.add(signMat);
  for (const [x2] of [[7], [31]]) {
    const len = Math.hypot(x2, 5);
    addMesh(sign, new THREE.CylinderGeometry(0.22, 0.22, len, 6), solid(0x2a2e32, { rough: 0.8 }), { pos: [x2 / 2, -2.5, 0.3], rot: [0, 0, Math.atan2(x2, 5)], edges: false });
  }
  const signLampMat = signMat;

  /* ══ THE 1956 BREAKER: six chambers in series on a chassis (BENCH only) ══ */
  const old = new THREE.Group();
  old.position.set(...BENCH.old);
  const OM = {
    shed: rimmed(solid(0x4a5056, { rough: 0.6, metal: 0.05 }), 0.18),
    cast: solid(G.cast, { rough: 0.62, metal: 0.3 }),
    alu: solid(0x8e949a, { rough: 0.45, metal: 0.4 }),
  };
  const OLD = { y: 300, n: 6, half: 33, gap: 11, flange: 8, rc: 24, big: 38, small: 32 };
  const unit = OLD.half * 2 + OLD.gap;
  const total = OLD.n * unit + (OLD.n + 1) * OLD.flange;
  const along = (geo) => geo.rotateZ(-Math.PI / 2); // a turned piece laid along +x
  const oldPart = makePart("old");
  old.add(oldPart);
  // chassis: two legs, a beam, two short support insulators
  for (const x of [-total / 2 + 40, total / 2 - 40]) addMesh(oldPart, box(18, 170, 74, 1.5), OM.cast, { pos: [x, 85, 0] });
  addMesh(oldPart, box(total - 20, 16, 44, 1.5), OM.cast, { pos: [0, 178, 0] });
  for (const x of [-total / 4, total / 4]) addMesh(oldPart, turned(insulator(186, OLD.y - OLD.big, 14, 24, 20, 8), { seg: 32 }), OM.shed, { pos: [x, 0, 0], edges: false });
  addMesh(oldPart, box(60, 70, 40, 2), OM.cast, { pos: [-total / 2 + 40, 222, 0] });
  const oldArcs = [];
  let x = -total / 2;
  for (let k = 0; k <= OLD.n; k++) {
    addMesh(oldPart, along(turned([[0, 0], [OLD.big - 4, 0], [OLD.big - 4, OLD.flange], [0, OLD.flange]], { seg: 32 })), OM.alu, { pos: [x, OLD.y, 0] });
    x += OLD.flange;
    if (k === OLD.n) break;
    for (const [a, b] of [[0, OLD.half], [OLD.half + OLD.gap, unit]]) {
      addMesh(oldPart, along(turned(insulator(a, b, OLD.rc, OLD.big, OLD.small, 8.5), { seg: 36 })), OM.shed, { pos: [x, OLD.y, 0], edges: false });
    }
    // the window between the two halves: the arc burns across it
    const am = arcMaterial(H2, { width: 4, q: 6, minPx: 6, seed: k * 1.7 });
    am.uniforms.uWander.value = 0.4;
    const a0 = V(x + OLD.half - 6, OLD.y, 0);
    const a1 = V(x + OLD.half + OLD.gap + 6, OLD.y, 0);
    am.uniforms.uA.value.copy(a0);
    am.uniforms.uB.value.copy(a1);
    am.uniforms.uC.value.copy(a0).add(a1).multiplyScalar(0.5).add(V(0, 2, 0));
    const ribbon = lightMesh(ribbons(1, 12), am, 6);
    const band = lightMesh(new THREE.CylinderGeometry(OLD.rc + 0.6, OLD.rc + 0.6, OLD.gap, 40, 1, true).rotateZ(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: SIGNAL.clone(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }), 6);
    band.position.set(x + OLD.half + OLD.gap / 2, OLD.y, 0);
    old.add(band);
    const ball = makeBall(H2, WHITE, SIGNAL);
    ball.position.set(x + OLD.half + OLD.gap / 2, OLD.y, 0);
    old.add(ribbon, ball);
    oldArcs.push({ ribbon, ball, band, mat: am });
    x += unit;
  }
  for (const s of [-1, 1]) addMesh(oldPart, box(24, 4, 14, 0.6), OM.alu, { pos: [s * (total / 2 + 12), OLD.y + 20, 0] });

  /* ══ THE POLE: insulating fibre in sections, its hand guard, and its head (detector, or an earth clamp) ══ */
  const PM = { fibre: solid(G.fibre, { rough: 0.5, metal: 0.05 }), ring: solid(G.cast, { rough: 0.5, metal: 0.35 }), grip: solid(0x3a3f44, { rough: 0.8 }) };
  const poleG = new THREE.Group();
  const lower = new THREE.Group();
  const upper = new THREE.Group();
  poleG.add(lower, upper);
  const LOW = 560;
  const lowerP = makePart("pole-low");
  lower.add(lowerP);
  addMesh(lowerP, cyl(2.7, 150, 0.4, 20), PM.grip, { pos: [0, 75, 0] });
  addMesh(lowerP, cyl(7, 1.6, 0.4, 32), PM.ring, { pos: [0, 152, 0] });
  addMesh(lowerP, cyl(2.4, LOW - 152, 0.3, 20), PM.fibre, { pos: [0, 152 + (LOW - 152) / 2, 0], edges: false });
  for (const y of [300, 440, LOW - 3]) addMesh(lowerP, cyl(3, 4, 0.5, 20), PM.ring, { pos: [0, y, 0] });
  const upperP = makePart("pole-up");
  upper.add(upperP);
  const UPL = POLE.len - LOW + 160; // the top section, 160 cm of it inside the lower when at POLE.len
  addMesh(upperP, cyl(2.0, UPL, 0.3, 20), PM.fibre, { pos: [0, -UPL / 2, 0], edges: false });
  for (const y of [-UPL + 170, -UPL + 330]) addMesh(upperP, cyl(2.5, 3, 0.4, 20), PM.ring, { pos: [0, y, 0] });
  addMesh(upperP, cyl(2.8, 5, 0.5, 20), PM.ring, { pos: [0, -2.5, 0] });
  // the detector: coupling, body with its three lamps (off), the insulating neck, the electrode and its hook
  const DM = {
    body: solid(0x3b4045, { rough: 0.55, metal: 0.2 }),
    metal: solid(G.alu, { rough: 0.35, metal: 0.5 }),
    lamp: noLamp(solid(0x1a1d20, { rough: 0.12, metal: 0, coat: 0.8 })),
  };
  const det = makePart("detector");
  upper.add(det);
  addMesh(det, cyl(2.6, 4, 0.4, 20), DM.metal, { pos: [0, 2, 0] });
  addMesh(det, cyl(4.4, 17, 0.8, 32), DM.body, { pos: [0, 12.5, 0] });
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    addMesh(det, cyl(1.5, 1.2, 0.3, 16), DM.lamp, { pos: [4.3 * Math.sin(a), 15, 4.3 * Math.cos(a)], rot: [Math.PI / 2, 0, -a], edges: false });
  }
  addMesh(det, cyl(1.6, 5, 0.3, 16, 0.9), DM.body, { pos: [0, 23.5, 0] });
  addMesh(det, new THREE.CylinderGeometry(0.6, 0.6, 3, 10), DM.metal, { pos: [0, 27.5, 0], edges: false });
  addMesh(det, new THREE.TorusGeometry(2.4, 0.6, 10, 24, Math.PI * 1.25), DM.metal, { pos: [2.4, 29, 0], rot: [0, 0, Math.PI * 0.75], edges: false });
  const lampMat = DM.lamp;
  const DET_TIP = 31;

  /* ══ A LINE CLAMP (screw clamp, its eye for the pole at the origin, its jaw JAW cm above) ══ */
  const JAW = 17;
  const lineClamp = (CM) => {
    const p = makePart("clamp");
    addMesh(p, new THREE.TorusGeometry(2.6, 0.7, 10, 20), CM.steel, { pos: [0, 0, 0], edges: false });
    addMesh(p, cyl(0.9, 9, 0.2, 12), CM.steel, { pos: [0, 6.5, 0] });
    addMesh(p, box(3.4, 20, 7, 0.6), CM.alu, { pos: [-5, 11, 0] });
    addMesh(p, box(9, 3.2, 7, 0.6), CM.alu, { pos: [-1.6, JAW + 3.4, 0] });
    addMesh(p, box(7, 2.4, 6, 0.5), CM.alu, { pos: [-0.8, 11.5, 0] });
    addMesh(p, box(4, 4, 4, 0.5), CM.steel, { pos: [-6.8, 4, 0] });
    return p;
  };
  const poleClampMats = { alu: solid(G.alu, { rough: 0.4, metal: 0.45 }), steel: solid(0x6e7479, { rough: 0.4, metal: 0.45 }) };
  const poleClamp = lineClamp(poleClampMats);
  upper.add(poleClamp);

  let poleLen = POLE.len;
  const fit = (dist) => {
    poleLen = Math.min(POLE.len + 140, Math.max(LOW + 60, dist));
  };

  /* ══ THE EARTHING SETS (a factory: world.js makes four) ══ */
  const shared = { engaged: false };
  const earthSets = [];
  const makeEarthSet = ({ ground, points, free = null }) => {
    const group = new THREE.Group();
    const innerG = new THREE.Group();
    group.add(innerG);
    const EM = {
      alu: solid(G.alu, { rough: 0.4, metal: 0.45 }),
      steel: solid(0x6e7479, { rough: 0.4, metal: 0.45 }),
      cast: solid(G.cast, { rough: 0.6, metal: 0.35 }),
      bar: solid(G.copper, { rough: 0.4, metal: 0.4 }),
    };
    const gv = V(...ground);
    // which way the conductors are, on the ground: the junction lies a little toward them
    const toward = V(points[1][0] - ground[0], 0, points[1][2] - ground[2]).normalize();
    const J = gv.clone().addScaledVector(toward, 60).add(V(0, 2.5, 0));
    const across = V(-toward.z, 0, toward.x);
    // the terminal: a flat steel bar out of the gravel
    const term = makePart("terminal");
    term.position.copy(gv);
    innerG.add(term);
    addMesh(term, box(7, 30, 1.4, 0.3), EM.cast, { pos: [0, 15, 0] });
    addMesh(term, box(16, 3, 10, 0.5), EM.cast, { pos: [0, 1.5, 0] });
    // the earth clamp (a G clamp, T screw) that comes down onto it and tightens
    const eClamp = makePart("earth-clamp");
    innerG.add(eClamp);
    // a C round the bar's edge: the fixed jaw behind it, the spine, the arm in front that carries the screw
    addMesh(eClamp, box(10, 10, 2.6, 0.6), EM.alu, { pos: [0, 0, -2.1] });
    addMesh(eClamp, box(2.8, 10, 12, 0.6), EM.alu, { pos: [6.2, 0, 2.6] });
    addMesh(eClamp, box(10, 10, 2.6, 0.6), EM.alu, { pos: [0, 0, 7.3] });
    const screw = new THREE.Group();
    screw.position.set(0, 0, 7.3);
    eClamp.add(screw);
    const scP = makePart("screw");
    screw.add(scP);
    addMesh(scP, new THREE.CylinderGeometry(1, 1, 11, 12), EM.steel, { pos: [0, 0, 1.2], rot: [Math.PI / 2, 0, 0], edges: false });
    addMesh(scP, box(4.4, 4.4, 1.2, 0.3), EM.steel, { pos: [0, 0, -4.2] });
    addMesh(scP, new THREE.CylinderGeometry(0.8, 0.8, 13, 10), EM.steel, { pos: [0, 0, 6.6], rot: [0, 0, Math.PI / 2], edges: false });
    addMesh(eClamp, box(4, 4, 4, 0.5), EM.steel, { pos: [-6.5, -5, 1] });
    // the short-circuit bar on the ground, its lugs
    const bar = makePart("bar");
    bar.position.copy(J);
    bar.lookAt(J.clone().add(toward));
    innerG.add(bar);
    addMesh(bar, box(40, 2.6, 5, 0.5), EM.bar, { pos: [0, 0, 0] });
    for (const dx of [-15, -5, 5, 15]) addMesh(bar, cyl(1.6, 3, 0.3, 12), EM.steel, { pos: [dx, 2, 0] });
    // the three line clamps, and the cables (one per phase, and the earth lead)
    const clamps = points.map(() => {
      const c = lineClamp(EM);
      innerG.add(c);
      return c;
    });
    const cables = points.map(() => makeCable(H2));
    const lead = makeCable(H2);
    for (const c of [...cables, lead]) innerG.add(c);
    const head = new THREE.Object3D();
    group.add(head);
    // precomputed points (no allocation in set)
    const P = points.map((p) => V(...p));
    const lying = points.map((_, i) => J.clone().addScaledVector(across, (i - 1) * 16).addScaledVector(toward, 26).add(V(0, 3, 0)));
    const lugs = [-15, 5, 15].map((dx) => J.clone().addScaledVector(across, dx).add(V(0, 2, 0)));
    const leadLug = J.clone().addScaledVector(across, -5).add(V(0, 2, 0));
    const seat = gv.clone().add(V(0, 20, 0));
    const freeV = free ? V(...free) : null;
    const tmpA = V(), tmpB = V(), tmpC = V(), tmpJ = V();
    const solidsLit = [EM.alu, EM.steel, EM.bar];
    let lastTint = -1;

    const st = {
      group,
      A: { head },
      mats: EM,
      set({ clamps: k = 0, current = 0, earthed = 0, wrong = 0, shock = 0 } = {}, time = 0) {
        innerG.visible = k > 0.01 || wrong > 0.01;
        if (!innerG.visible) return;
        const w = smooth(clamp01(wrong));
        // the earth end: comes down onto its terminal (0 → 0.55), then the screw turns (0.55 → 1)
        const down = smooth(ramp(k, 0.01, 0.55));
        const turn = smooth(ramp(k, 0.55, 1));
        eClamp.visible = k > 0.01;
        tmpA.copy(seat).add(tmpB.set(0, 50 * (1 - down), 0));
        if (freeV) tmpA.lerp(freeV, w);
        eClamp.position.copy(tmpA);
        eClamp.rotation.z = freeV ? w * 0.9 : 0;
        screw.rotation.z = turn * Math.PI * 4;
        screw.position.z = 7.3 - 1.4 * turn;
        // the junction, lifted with the undone end (1987)
        tmpJ.copy(J);
        if (freeV) tmpJ.lerp(tmpC.copy(freeV).add(tmpB.set(0, 26, 0)), w);
        bar.position.copy(tmpJ);
        // the line ends, phase after phase: the pole fetches each one (0 → 0.18), lifts it to its conductor
        // (0.18 → 0.9), the screw closes (0.9 → 1)
        const kk = clamp01(k - 1) * 3;
        const iNow = Math.min(2, Math.floor(kk));
        let carried = false;
        for (let i = 0; i < 3; i++) {
          const u = clamp01(kk - i);
          const c = clamps[i];
          c.visible = k > 0.01;
          const rise = smooth(ramp(u, 0.18, 0.9));
          const lift = smooth(ramp(u, 0.18, 0.3));
          tmpA.copy(lying[i]);
          if (freeV) tmpA.lerp(tmpJ, w);
          tmpB.copy(P[i]).add(tmpC.set(0, -JAW, 0));
          // the way up: out from the ground, then up to the conductor along a gentle bow
          const bow = Math.sin(Math.PI * rise) * 120;
          c.position.set(lerp(tmpA.x, tmpB.x, rise), lerp(tmpA.y, tmpB.y, rise) - bow * 0.3, lerp(tmpA.z, tmpB.z, rise) + bow);
          c.rotation.set(0, 0, (1 - lift) * (Math.PI / 2));
          if (i === iNow && k > 1 && k < 2) {
            carried = u > 0.18;
            if (u < 0.18) {
              // the empty pole goes down from the last clamp put on to the next one waiting
              const back = smooth(u / 0.18);
              const prev = i > 0 ? tmpC.copy(P[i - 1]).add(tmpB.set(0, -JAW, 0)) : tmpC.copy(lying[0]).add(tmpB.set(0, 60, 0));
              head.position.lerpVectors(prev, c.position, back);
            } else head.position.copy(c.position);
          }
          // its cable: from its lug on the bar to the clamp, hanging nearly straight down, then along the ground
          tmpB.copy(lugs[i]).sub(J).add(tmpJ);
          tmpA.copy(c.position).add(tmpC.set(-6.8, 4, 0));
          const dy = Math.max(0, tmpA.y - tmpB.y);
          tmpC.set(lerp(tmpA.x, tmpB.x, 0.12), tmpB.y + Math.min(30, dy * 0.08), lerp(tmpA.z, tmpB.z, 0.12));
          layCable(cables[i], tmpB, tmpA, tmpC);
        }
        if (!(k > 1 && k < 2)) head.position.copy(k >= 2 ? tmpA.copy(P[2]).add(tmpC.set(0, -JAW, 0)) : tmpA.copy(lying[0]).add(tmpC.set(0, 60, 0)));
        if (carried || (k > 1 && k < 2)) shared.engaged = true;
        // the earth lead: from the bar to the earth clamp
        tmpA.copy(leadLug).sub(J).add(tmpJ);
        tmpB.copy(eClamp.position).add(tmpC.set(-6.5, -5, 1));
        tmpC.addVectors(tmpA, tmpB).multiplyScalar(0.5);
        tmpC.y = Math.max(1.5, Math.min(tmpA.y, tmpB.y) - 6) + 10 * w;
        layCable(lead, tmpB, tmpA, tmpC); // the current runs from the bar into the earth
        // what runs in them: earthed → veille; a current → dashes running down; a shock → signal
        const run = time * 150;
        const sh = clamp01(shock);
        for (const cab of [...cables, lead]) {
          const U = cab.material.userData.U;
          U.uRun.value = run;
          U.uDash.value = 1.1 * clamp01(current) + 1.8 * sh;
          U.uDashHue.value.copy(VEILLE).lerp(SIGNAL, sh);
          U.uTint.value = 0.07 * clamp01(earthed) * (1 - sh) + 0.35 * sh;
          U.uTintHue.value.copy(VEILLE).lerp(SIGNAL, sh);
        }
        const tint = Math.round(clamp01(earthed) * 20) / 20;
        if (tint !== lastTint) {
          lastTint = tint;
          for (const m of solidsLit) m.userData.earthTint = tint;
        }
      },
    };
    earthSets.push(st);
    return st;
  };

  /* ══ anchors, lamps ══ */
  const A = {
    chamber: anchor(chamberG, 0, ARC_MID + OFF, 0),
    arcAt: anchor(inner, 0, ARC_MID, 0),
    sect: anchor(sect1.g, 0, LSECT.top, 0),
    lock: lockP,
    sign,
  };
  const lamps = {
    3: lampOf(poles.map((p) => p.g)),
    4: lampOf(sects.map((d) => d.g), [lockP, sign]),
    6: lampOf([lockP, sign]),
    7: lampOf([det]),
  };
  // lockP and sign live inside sect1's frame: keep their lamp from the disconnector's
  const lampEarth = (v) => {
    for (const s of earthSets)
      for (const m of Object.values(s.mats)) m.emissive.copy(VEILLE).multiplyScalar(0.2 * v + 0.12 * (m.userData.earthTint ?? 0));
  };

  /* fonts: the sign is painted again once the page's font is there */
  let typeset = false;
  const FONT = `700 40px ${FONT_D}`;
  try {
    document.fonts?.load(FONT);
  } catch {}
  const retype = () => {
    if (typeset) return;
    try {
      if (!document.fonts.check(FONT)) return;
    } catch {
      return;
    }
    typeset = true;
    paintSign();
  };

  const nozzleEmit = IM.ptfe;
  const tipEmit = [IM.tip, IM.tip2];
  const shellMat = H.parts.shell.material;

  return {
    bay, hero, heroHome, old,
    pole: { group: poleG, len: POLE.len, fit },
    makeEarthSet,
    A,
    set(p, time, px) {
      retype();
      const bench = p.place === 1;
      const ex = smooth(clamp01(p.explode ?? 0));
      const see = smooth(clamp01(p.see ?? 0));
      const parts = smooth(clamp01(p.parts ?? 0));
      const vac = clamp01(p.vacuum ?? 0);
      const open = smooth(clamp01(p.open ?? 0));
      const sopen = clamp01(p.sopen ?? 0);
      const lock = clamp01(p.lock ?? 0);
      const named = Math.round(p.named ?? 0);

      /* ── the bay apart ("on l'ouvre"): breakers and disconnectors rise, each in its own window ── */
      poles.forEach((pl, i) => {
        const u = smooth(ramp(ex, 0.1 + 0.05 * i, 0.7 + 0.05 * i));
        pl.parts.column.position.y = 150 * u;
        pl.parts.chamber.position.y = 330 * u;
      });
      for (const d of [...sects, ...bsects]) {
        const u = smooth(ramp(ex, 0.3, 0.95));
        for (const c of d.cols) c.position.y = 120 * u;
      }

      /* ── the disconnectors: each arm turns 90° about its column (arms parallel, the air between the contacts) ── */
      const sw = smooth(sopen);
      for (const d of sects) for (const [pivot, side] of d.arms) pivot.rotation.y = side * sw * (Math.PI / 2);

      /* ── the threat: a slow signal breath on what could close again ── */
      const breath = clamp01(p.threat ?? 0) * (0.55 + 0.45 * Math.sin(time * 3.1));
      const onBreaker = breath * (1 - smooth(ramp(sopen, 0.35, 0.5)));
      const onAxis = breath * smooth(ramp(sopen, 0.5, 0.65)) * (1 - smooth(ramp(lock, 0.8, 1)));
      for (const pl of poles) pl.M.box.emissive.copy(SIGNAL).multiplyScalar(0.6 * onBreaker);
      for (const m of sect1.axisMats) m.emissive.copy(SIGNAL).multiplyScalar(1.1 * onAxis);

      /* ── the padlock: on, open (0.5); locked (1): the shackle drops and snaps ── */
      const on = smooth(ramp(lock, 0, 0.45));
      const snap = smooth(ramp(lock, 0.8, 1));
      setPartOpacity(lockP, on);
      lockP.position.z = sect1.hasp[2] + 1.2 + 14 * (1 - on);
      shackle.rotation.y = (1 - snap) * (Math.PI / 2);
      shackle.position.y = 3.6 + 1.8 * (1 - snap);
      // the sign: hung, it swings and settles
      const sg = clamp01(p.sign ?? 0);
      setPartOpacity(sign, smooth(ramp(sg, 0, 0.3)));
      sign.rotation.z = 0.22 * Math.sin(sg * Math.PI * 3) * (1 - sg);
      sign.rotation.x = 0.08 * Math.sin(sg * Math.PI * 2) * (1 - sg);

      /* ── the hero's chamber: the housing opened, the contacts apart, the parts apart, SF6 → vacuum ── */
      setPartOpacity(H.parts.wedge, 1 - see);
      shellMat.uniforms.uAmount.value = 0.7 * see * (1 - parts * 0.5);
      H.parts.shell.visible = see > 0.01;
      inner.visible = see > 0.002 || parts > 0.002;
      const sOut = 1 - smooth(ramp(vac, 0.25, 0.55));
      const vIn = smooth(ramp(vac, 0.45, 0.85));
      const stroke = STROKE * open;
      fixedP.position.y = 70 * parts;
      nozzleP.position.y = -stroke + 16 * parts;
      tulipP.position.y = -stroke - 10 * parts;
      pufferP.position.y = -stroke - 42 * parts;
      rodP.position.y = -stroke - 80 * parts;
      for (const part of sf6Parts) setPartOpacity(part, sOut);
      setPartOpacity(vacFixed, vIn);
      setPartOpacity(vacMoving, vIn);
      vacFixed.position.y = 40 * parts;
      vacMoving.position.y = -VSTROKE * open - 40 * parts;
      // the gas drains as the bottle comes
      const drain = smooth(ramp(vac, 0.0, 0.1)) * (1 - smooth(ramp(vac, 0.2, 0.5)));
      fill.visible = drain * see > 0.003;
      fill.material.uniforms.uAmount.value = 0.9 * drain * see;
      fill.material.uniforms.uLevel.value = lerp(885, 615, smooth(ramp(vac, 0.08, 0.5)));

      /* ── the current: a sine, a cursor; the arc breathes with |sin|, the gas rushes in at each zero ── */
      const wave = clamp01(p.wave ?? 0);
      const cyc = Math.max(0, p.cycle ?? 0);
      const N = 4;
      const c0 = Math.max(0, cyc - N);
      waveG.visible = wave > 0.003;
      for (const m of waveMats) {
        m.uniforms.uAmount.value = wave;
        m.uniforms.uC0.value = c0;
        m.uniforms.uCycle.value = cyc;
      }
      const sx = waveTrace.material.uniforms.uX0.value + ((cyc - c0) / N) * waveTrace.material.uniforms.uW.value;
      cursor.visible = wave > 0.003;
      cursor.position.set(sx, waveTrace.material.uniforms.uA.value * Math.sin(Math.PI * cyc), 0);
      cursor.material.uniforms.uRadius.value = 3;
      cursor.material.uniforms.uMinPx.value = 9;
      cursor.material.uniforms.uAmount.value = 0.9 * wave;
      const mag = Math.abs(Math.sin(Math.PI * cyc));
      const dz = cyc - Math.round(cyc);
      const zero = Math.exp(-(dz * dz) / 0.012);

      /* ── the arc: pin tip → tulip, through the throat; a light that lights the chamber ── */
      const heat = clamp01(p.heat ?? 0);
      const breathe = lerp(1, 0.16 + 0.84 * mag, wave);
      const gap = stroke * sOut + VSTROKE * open * vIn;
      const arcAmt = clamp01(p.arc ?? 0) * smooth(ramp(gap, 0.5, 4)) * breathe;
      arcMesh.visible = footA.visible = footB.visible = arcAmt > 0.003;
      const tA = arcMat.uniforms.uA.value;
      const tB = arcMat.uniforms.uB.value;
      // SF6: from the pin's tip down to the tulip's mouth; vacuum: across the bottle's contacts
      const vb = smooth(ramp(vac, 0.4, 0.7));
      tA.set(0, lerp(PIN_TIP + 70 * parts, 752 + 40 * parts, vb), 0);
      tB.set(0, lerp(762 - stroke - 10 * parts, 752 - VSTROKE * open - 40 * parts, vb), 0);
      arcMat.uniforms.uC.value.set(0.6, (tA.y + tB.y) / 2, -0.4);
      arcMat.uniforms.uTime.value = time;
      arcMat.uniforms.uWander.value = lerp(1.5, 0.3, vb);
      arcMat.uniforms.uWidth.value = lerp(4.5, 6, heat) * lerp(1, 0.45 + 0.55 * mag, wave) * lerp(1, 0.6, vb);
      arcMat.uniforms.uQ.value = lerp(7.5, 6, heat);
      arcMat.uniforms.uHot.value.copy(HOT).lerp(WHITE, heat);
      arcMat.uniforms.uK.value.set(0.2 + 0.06 * heat, 0.7 + 0.2 * heat, 2.3 + 0.5 * heat);
      arcMat.uniforms.uAmount.value = arcAmt;
      footA.position.copy(tA);
      footB.position.copy(tB);
      for (const f of [footA, footB]) {
        f.material.uniforms.uRadius.value = 2.2;
        f.material.uniforms.uMinPx.value = 7;
        f.material.uniforms.uAmount.value = 0.35 * arcAmt;
      }
      inner.updateWorldMatrix(true, false);
      inner.localToWorld(ARC_LIGHT.uArcA.value.copy(tA));
      inner.localToWorld(ARC_LIGHT.uArcB.value.copy(tB));
      ARC_LIGHT.uArcCol.value.copy(SIGNAL).lerp(HOT, 0.2 + 0.2 * heat);
      ARC_LIGHT.uArcI.value = 1.25 * arcAmt * (1 + 0.3 * heat);
      nozzleEmit.emissive.copy(SIGNAL).lerp(HOT, 0.3).multiplyScalar(0.1 * arcAmt);
      for (const m of tipEmit) m.emissive.copy(SIGNAL).lerp(WHITE, heat * 0.5).multiplyScalar(0.6 * arcAmt);

      /* ── the SF6 on the arc: it rushes in at each zero ── */
      const gasAmt = clamp01(p.gas ?? 0) * sOut * lerp(1, 0.3 + 0.7 * zero, wave);
      gasMesh.visible = gasAmt > 0.003;
      gasMat.uniforms.uAmount.value = gasAmt;
      gasMat.uniforms.uTime.value = time;
      gasMat.uniforms.uNB.value = 742 - stroke + 16 * parts;

      /* ── the cloud: the gas leaves through the top and rises, turning signal high up ── */
      const cl = clamp01(p.cloud ?? 0);
      cloudMesh.visible = cl > 0.003;
      cloudMat.uniforms.uAmount.value = cl;
      cloudMat.uniforms.uTime.value = time;
      cloudMat.uniforms.uReach.value = 250 + 950 * cl;

      /* ── the 1956 breaker: there (era 1), its six chambers lit one by one (1 → 2) ── */
      const era = clamp01(p.era ?? 0) + clamp01((p.era ?? 0) - 1);
      old.visible = bench && era > 0.01;
      if (old.visible) {
        setPartOpacity(oldPart, smooth(ramp(era, 0, 0.6)));
        oldArcs.forEach((a, k) => {
          const lit = smooth(ramp(era, 1 + k / 6, 1 + (k + 0.7) / 6));
          a.ribbon.visible = a.ball.visible = a.band.visible = lit > 0.003;
          a.band.material.color.copy(SIGNAL).multiplyScalar(1.1 * lit);
          a.mat.uniforms.uAmount.value = lit;
          a.mat.uniforms.uTime.value = time;
          a.ball.material.uniforms.uRadius.value = 16;
          a.ball.material.uniforms.uMinPx.value = 14;
          a.ball.material.uniforms.uAmount.value = 0.75 * lit;
        });
      }

      /* ── the pole: telescopic to its target; its head: the detector (lamps off: beep), or a clamp ── */
      const headIs = (p.head ?? 0) >= 0.5 ? 1 : 0;
      const tipLen = headIs ? JAW : DET_TIP;
      upper.position.y = poleLen - tipLen;
      upperP.position.y = 0;
      det.visible = headIs === 0;
      poleClamp.visible = headIs === 1 && !shared.engaged;
      poleClamp.position.set(0, 0, 0);
      lampMat.emissive.copy(SIGNAL).multiplyScalar(1.6 * clamp01(p.beep ?? 0));
      shared.engaged = false;
      poleLen = POLE.len;

      /* ── what the voice names ── */
      lamps[3](named === 3 ? 1 : 0);
      lamps[4](named === 4 ? 1 : 0);
      lamps[6](named === 6 ? 1 : 0);
      lamps[7](named === 7 ? 1 : 0);
      lampEarth(named === 8 ? 1 : 0);
      signLampMat.emissive.copy(named === 6 ? VEILLE : WHITE).multiplyScalar(named === 6 ? 0.42 : 0.1);
    },
  };
}
