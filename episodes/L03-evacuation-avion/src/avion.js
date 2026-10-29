// DOSSIER L03 — the airliner from OUTSIDE, like an X-ray, at its true scale, standing on its site.
//
//   buildAvion() → { group, A, set(p, time, px) }
//   p = { amount, variant, site, run, alt, doorA, doorB, doorC, shut, evac, bags, spin, thump, dash, bridge, gulp, pilots,
//         hurt, mark, lights, emerg, smoke, fire, breach, pax, mood }          (their meaning: FIRST, in world.js)
//   A = { door(variant, id) → Object3D at the sill's centre of that door (variant "a350" | "a380" | "b737", id "1L",
//         "M3R", "WR"…), foot(variant, id) → Object3D where its slide lands on the ground, engineR → Object3D at the
//         right engine's inlet of the shown variant, nose → Object3D at the nose, gather → the field of the saved,
//         cockpit → the pilots' heads, fire → the heart of the outside fire (moves with the site) }
//
// THE PLANE'S FRAME (plan.js): nose toward −x, up +y, its LEFT side toward +z (the camera's side); the ground is y = 0.
// The plane stands still at x = 0 and the world comes to it: the runway, its lamps, the Dash 8 slide by `run`; the
// plane rises by `alt` (the approach). THREE VARIANTS (`variant`, one shown): A350-900, A380, 737-200 — PLANES.
// FOUR SITES (`site`): Haneda's runway at night · the trial hangar · Manchester's runway, morning · an apron at night.
//
// THE DA HERE: one shell of glass per airliner (fuselage, wings and their tips, fin, stabiliser, pylons) with a few
// lines of structure (frames, the window belt, the floor, the doors, the cockpit's panes); the A350's black mask round
// its windscreen. SOLID: the nacelles and the gear (three greys), the SLIDES (a light warm grey — tubes, bed, cross
// tubes, head beam: the first object of the thumbnail), the fire (a volume with a white heart, never a sheet), its
// plume (dark, soft, lit from under), the evacuees' bags. The people are small figures of glass (a GPU crowd driven by
// `evac` alone: never a jump), veille once they are out and standing. Windows: warm ink when `lights`, a glimmer when
// only `emerg` (and its points high in the cabin). The smoke in the cabin: a dark sheet tinted signal coming down
// inside the hull; the breach: a signal glow running along the cabin from the fire.
// Every number that moves is read in `set` and written into uniforms or positions: NO allocation there.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glass, asShell, lineMat, box, cyl, lathe, plate, makePart, addMesh, mergeGeometries } from "@kit/build3d.js";
import { PLANES, VARIANT_KEY, SLIDE, OPEN, RUNWAY, HANGAR, APRON, DASH, GATHER } from "./plan.js";

const SITE_KEY = ["haneda", "hangar", "manchester", "apron"];
const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const f = (x) => Number(x).toFixed(4);

/* ───────────────────────────────────────────────────────────── shapes (the idioms of 023, set per variant) */

/** A smooth curve through [x, value] knots (Hermite, tangents from the neighbours). */
function spline(knots) {
  const p = [...knots].sort((a, b) => a[0] - b[0]);
  const m = p.map((_, i) => {
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(p.length - 1, i + 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  });
  return (x) => {
    if (x <= p[0][0]) return p[0][1];
    if (x >= p.at(-1)[0]) return p.at(-1)[1];
    let i = 0;
    while (p[i + 1][0] < x) i++;
    const h = p[i + 1][0] - p[i][0];
    const u = (x - p[i][0]) / h;
    return (2 * u ** 3 - 3 * u * u + 1) * p[i][1] + (u ** 3 - 2 * u * u + u) * h * m[i] + (3 * u * u - 2 * u ** 3) * p[i + 1][1] + (u ** 3 - u * u) * h * m[i + 1];
  };
}

/** A skin through rows of points (`rows[i][j]` = [x, y, z]). `wrap`: each row closes on itself. Its normals point IN. */
function skin(rows, { wrap = false } = {}) {
  const n = rows[0].length;
  const pos = new Float32Array(rows.length * n * 3);
  rows.forEach((row, i) => row.forEach((p, j) => pos.set(p, (i * n + j) * 3)));
  const index = [];
  for (let i = 0; i < rows.length - 1; i++) {
    for (let j = 0; j < (wrap ? n : n - 1); j++) {
      const a = i * n + j;
      const b = i * n + ((j + 1) % n);
      index.push(a, b, b + n, a, b + n, a + n);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

/** An aerofoil section around: `j` 0 at the leading edge; thickest a third of the way back, a thin trailing edge. */
const FOIL = 26;
function foil(lead, chord, thick, j) {
  const a = (2 * Math.PI * j) / FOIL;
  const c = Math.cos(a);
  const u = 0.5 - 0.5 * c;
  const t = Math.sin(a) * (0.62 + 0.38 * c) * chord * thick * 0.5;
  return [lead + u * chord, t];
}
/** A horizontal lifting surface for one side `s` (+1 left, −1 right): stations along z, closed at the tip. */
function lifting(s, zs, LE, CH, Y, TH) {
  const rows = zs.map((z, i) => {
    const end = i === zs.length - 1;
    const row = [];
    for (let j = 0; j < FOIL; j++) {
      const [x, t] = foil(LE(z), CH(z), TH(z) * (end ? 0.05 : 1), j);
      row.push([x, Y(z) + t, s * (z + (end ? 4 : 0))]);
    }
    return row;
  });
  return skin(rows, { wrap: true });
}

// THE FUSELAGES, as knots: [distance from the nose in half-widths, width, keel, crest] — width in half-widths, keel and
// crest in half-heights about the axis. The A350: an Airbus nose, blunt, its tip under the axis. The A380: blunter, its
// brow full almost at once (the upper deck runs to the nose). The 737: narrow, its nose long and drooping.
const NOSES = {
  a350: [[0, 0.008, -0.19, -0.13], [0.05, 0.19, -0.39, 0.06], [0.17, 0.37, -0.57, 0.26], [0.37, 0.55, -0.72, 0.45], [0.66, 0.72, -0.84, 0.63], [1.03, 0.86, -0.93, 0.79], [1.45, 0.95, -0.975, 0.9], [1.91, 0.99, -0.996, 0.97], [2.45, 1, -1, 1]],
  a380: [[0, 0.01, -0.3, -0.12], [0.05, 0.22, -0.48, 0.12], [0.18, 0.45, -0.64, 0.4], [0.38, 0.65, -0.77, 0.62], [0.66, 0.8, -0.87, 0.79], [1.02, 0.91, -0.94, 0.9], [1.45, 0.97, -0.98, 0.97], [1.95, 1, -1, 1]],
  b737: [[0, 0.01, -0.3, -0.2], [0.07, 0.2, -0.47, -0.02], [0.28, 0.42, -0.65, 0.2], [0.62, 0.62, -0.8, 0.42], [1.08, 0.78, -0.9, 0.62], [1.68, 0.9, -0.96, 0.8], [2.38, 0.97, -0.99, 0.93], [3.1, 1, -1, 1]],
};
// [distance from the tail's end in half-widths, width, keel, crest]: the cone sweeps up to the APU's exhaust
const TAILS = {
  a350: [[5.4, 1, -1, 1], [4.25, 0.99, -0.93, 1], [3.15, 0.94, -0.71, 0.99], [2.1, 0.84, -0.41, 0.96], [1.2, 0.66, -0.09, 0.9], [0.47, 0.42, 0.21, 0.81], [0.11, 0.22, 0.4, 0.71], [0, 0.1, 0.48, 0.65]],
  a380: [[5.0, 1, -1, 1], [3.9, 0.985, -0.9, 0.99], [2.9, 0.93, -0.66, 0.95], [1.95, 0.82, -0.36, 0.88], [1.1, 0.63, -0.06, 0.79], [0.42, 0.38, 0.2, 0.68], [0.1, 0.2, 0.33, 0.6], [0, 0.09, 0.4, 0.55]],
  b737: [[6.0, 1, -1, 1], [4.6, 0.98, -0.9, 1], [3.3, 0.9, -0.6, 0.98], [2.0, 0.72, -0.25, 0.93], [1.0, 0.5, 0.05, 0.85], [0.3, 0.26, 0.3, 0.72], [0, 0.11, 0.42, 0.62]],
};

// The nacelles, normalised ([r / engine radius, y / length]): a big-fan nacelle and its exhaust cone (A350, A380), the
// long thin JT8D with its tailpipe (737).
const NAC_FAN = [[0.787, 0.138], [0.787, 0.042], [0.82, 0.012], [0.887, -0.002], [0.953, 0.008], [0.993, 0.077], [1, 0.269], [0.98, 0.537], [0.907, 0.749], [0.747, 0.894], [0.62, 0.902], [0.533, 0.933], [0.347, 0.967], [0.133, 0.992], [0, 1]];
const NAC_JT8D = [[0.8, 0.1], [0.8, 0.02], [0.86, 0], [0.95, 0.008], [1, 0.05], [1.01, 0.4], [1, 0.72], [0.93, 0.85], [0.78, 0.92], [0.66, 0.94], [0.6, 0.98], [0, 1]];

/** Each variant's figure: the wing set, the tail, the cabin, the panes of the cockpit, the gear, the seats. */
const SPEC = {
  a350: {
    wingY: -0.74, dihedral: 5.5, kinkF: 0.32, kinkC: 0.55, thick: [0.13, 0.095], tip: "shark",
    stab: { back: 1250, root: 620, tip: 220, semi: 960, sweep: 32, y: 0.15, dihedral: 6 },
    fin: { back: 1480, root: 1020, tip: 380, sweep: 40 },
    nac: NAC_FAN, ceil: 250, lane: 215, tube: 28, win: { w: 26, h: 40, pitch: 50.8, y: 98 },
    // the windscreen: [x0, x1 in half-widths from the nose, angle low, angle high (degrees from the side)]
    panes: [[0.47, 0.63, 64, 88], [0.65, 0.81, 52, 82], [0.84, 0.98, 44, 74], [1.0, 1.12, 40, 66]], mask: true,
    seats: [-232, -182, -132, -50, 0, 50, 132, 182, 232], seatPitch: 84, rows: [[-2560, 2420]],
    gear: [{ x: 60, z: 540, axles: 2, pair: 70, r: 67, top: "wing" }, { x: -2640, z: 0, axles: 1, pair: 36, r: 48, top: "keel" }],
    crowd: 379,
  },
  a380: {
    wingY: -0.8, dihedral: 4, kinkF: 0.3, kinkC: 0.55, thick: [0.135, 0.1], tip: "fence",
    stab: { back: 1650, root: 900, tip: 330, semi: 1520, sweep: 33, y: 0.1, dihedral: 4 },
    fin: { back: 1950, root: 1400, tip: 520, sweep: 40 },
    nac: NAC_FAN, ceil: 245, ceilU: 225, lane: 215, tube: 28, win: { w: 24, h: 38, pitch: 53, y: 98 },
    panes: [[0.42, 0.58, 20, 42], [0.6, 0.76, 14, 38], [0.79, 0.93, 10, 33], [0.95, 1.06, 8, 28]], mask: false,
    seats: [-292, -244, -196, -112, -60, -8, 44, 112, 196, 244, 292].slice(0, 10), seatsU: [-236, -186, -136, -45, 45, 136, 186, 236], seatPitch: 86, rows: [[-3260, 2980]], rowsU: [[-2480, 2560]],
    gear: [{ x: -80, z: 630, axles: 2, pair: 70, r: 70, top: "wing" }, { x: 330, z: 215, axles: 3, pair: 70, r: 70, top: "keel" }, { x: -2980, z: 0, axles: 1, pair: 38, r: 52, top: "keel" }],
    crowd: 400,
  },
  b737: {
    wingY: -0.62, dihedral: 6, kinkF: 0.28, kinkC: 0.62, thick: [0.13, 0.1], tip: "none",
    stab: { back: 620, root: 400, tip: 140, semi: 550, sweep: 30, y: 0.2, dihedral: 7 },
    fin: { back: 820, root: 560, tip: 190, sweep: 36, dorsal: 380 },
    nac: NAC_JT8D, ceil: 215, lane: 140, tube: 22, win: { w: 22, h: 32, pitch: 51, y: 92 },
    panes: [[0.66, 0.84, 42, 62], [0.86, 1.04, 34, 60], [1.06, 1.22, 30, 56], [1.04, 1.2, 64, 72]], mask: false,
    seats: [-142, -94, -46, 46, 94, 142], seatPitch: 81, rows: [[-1020, 1400]],
    gear: [{ x: 40, z: 262, axles: 1, pair: 42, r: 56, top: "wing" }, { x: -1240, z: 0, axles: 1, pair: 22, r: 34, top: "keel" }],
    crowd: 137,
  },
};

/* ───────────────────────────────────────────────────────────── shared light: textures and shaders */

// a soft disc of light: its heart and a short tail — the idiom of 003's softGlow (a flat sphere reads as a plate)
let GLOW_TEX = null;
function glowTexture() {
  if (GLOW_TEX) return GLOW_TEX;
  const n = 64;
  const data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const r = Math.hypot((x + 0.5) / n - 0.5, (y + 0.5) / n - 0.5) * 2;
      const v = Math.max(0, Math.exp(-r * r * 9) * 0.75 + Math.exp(-r * 3.2) * 0.25 - 0.012 * r) * (r < 1 ? 1 : 0);
      const k = Math.round(255 * Math.min(1, v));
      data.set([k, k, k, k], (y * n + x) * 4);
    }
  }
  GLOW_TEX = new THREE.DataTexture(data, n, n);
  GLOW_TEX.needsUpdate = true;
  GLOW_TEX.magFilter = GLOW_TEX.minFilter = THREE.LinearFilter;
  return GLOW_TEX;
}
/** A billboard of light: `sprite.material.color` is its colour × its strength (keep it under 3). */
function glowSprite(size) {
  const mat = new THREE.SpriteMaterial({ map: glowTexture(), color: 0x000000, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const s = new THREE.Sprite(mat);
  s.scale.set(size, size, 1);
  s.renderOrder = 7;
  s.visible = false;
  return s;
}

/** The fan seen down an intake (023): alive a smooth blur, still its blades, melted into their mean under the pixel. */
const fanMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uLife: { value: 0 }, uPhase: { value: 0 }, uInk: { value: INK.clone() } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uLife, uPhase; uniform vec3 uInk; varying vec2 vUv;
      void main() {
        vec2 q = (vUv - 0.5) * 2.0;
        float r = length(q);
        if (r > 1.0) discard;
        float th = atan(q.y, q.x);
        float b = fract((th + r * 0.9) / 6.2831853 * 22.0 + uPhase * 22.0);
        float tri = abs(b - 0.5) * 2.0;
        float fw = max(fwidth(tri), 1e-4);
        float blade = smoothstep(0.42 - fw, 0.42 + fw, tri);
        float show = smoothstep(0.06, 0.25, 1.0 / (fw * 22.0));
        blade = mix(0.58, blade, show);
        float spin = smoothstep(0.15, 0.85, uLife);
        float lit = mix(mix(0.02, 0.13, blade), 0.09 + 0.05 * exp(-r * r * 6.0), spin);
        lit += 0.05 * exp(-pow((r - 0.93) / 0.05, 2.0));
        float edge = 1.0 - smoothstep(0.96, 1.0, r);
        gl_FragColor = vec4(uInk * lit * edge, 1.0);
      }`,
  });

/**
 * The windows of the cabin: a rounded rectangle of light, its core and a soft spill. `uLights` warm ink, `uEmerg` a
 * glimmer; the smoke dims and darkens the ones it covers (`uSmokeY` main deck, `uSmokeU` upper deck, plane's frame);
 * the breach lights them signal from the fire's station outward (`uFireX`, `uBreach` × `uLen`).
 */
const windowMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uLights: { value: 0 }, uEmerg: { value: 0 }, uAmount: { value: 1 },
      uSmokeY: { value: 1e5 }, uSmokeU: { value: 1e5 }, uUpper: { value: 1e5 }, uFireX: { value: 0 }, uBreach: { value: 0 }, uLen: { value: 6000 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aWin; varying vec2 vUv; varying vec3 vWin;
      void main() { vUv = uv; vWin = aWin; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSignal; uniform float uLights, uEmerg, uAmount, uSmokeY, uSmokeU, uUpper, uFireX, uBreach, uLen, uTime;
      varying vec2 vUv; varying vec3 vWin; // x station, y height, lit factor
      void main() {
        if (uAmount < 0.003) discard;
        vec2 q = (vUv - 0.5) * 2.0;
        vec2 d = abs(q) - vec2(0.42, 0.5) + 0.32;
        float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 0.32;
        float fw = max(fwidth(sd), 1e-4);
        float core = 1.0 - smoothstep(-fw, fw, sd);
        float spill = exp(-max(sd, 0.0) * 4.0) * 0.16;
        float lit = vWin.z * (uLights * 0.85 + uEmerg * 0.1 * (1.0 - uLights));
        // the smoke: the window under the sheet goes dark and warm
        float level = vWin.y > uUpper ? uSmokeU : uSmokeY;
        float cover = smoothstep(level - 18.0, level + 18.0, vWin.y);
        vec3 col = mix(uInk, uSignal * 0.55, cover * 0.7) * lit * (1.0 - 0.82 * cover);
        // the fire inside: a window lights signal when the breach has reached its station
        float reach = uBreach * uLen;
        float hot = (1.0 - smoothstep(reach - 260.0, reach + 60.0, abs(vWin.x - uFireX))) * step(0.002, uBreach);
        col += uSignal * hot * (0.5 + 0.12 * sin(uTime * 1.3 + vWin.x * 0.01));
        gl_FragColor = vec4(col * (core * 0.95 + spill) * uAmount, 1.0);
      }`,
  });

/** Lamps: soft discs sized in the world (`aK.y` cm), never under three pixels; `aK.x` their strength. */
const lampMat = (color) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uAmount: { value: 0 }, uScale: { value: 2000 }, uMax: { value: 14 } },
    vertexShader: /* glsl */ `
      uniform float uScale, uMax; attribute vec2 aK; varying float vK;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(uScale * aK.y / max(-mv.z, 1.0), 3.0, uMax);
        vK = aK.x;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vK;
      void main() {
        if (uAmount < 0.003) discard;
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float r = dot(q, q);
        if (r > 1.0) discard;
        gl_FragColor = vec4(uColor * exp(-r * 3.4) * vK * uAmount, 1.0);
      }`,
  });

/**
 * The smoke in the cabin, seen from outside: the near wall of a tube inside the hull, drawn after the people and the
 * windows and before the shell — a dark sheet tinted signal whose lower edge rolls slowly (`uSmokeY`, `uSmokeU` for the
 * upper deck), and the breach: a signal glow that runs along the cabin from the fire. Premultiplied: it darkens what is
 * behind it, and adds its own light.
 */
const cabinSmokeMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide, // the skin's normals point in: its back faces are the near wall
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    uniforms: {
      uSignal: { value: SIGNAL.clone() }, uAmount: { value: 0 }, uSmokeY: { value: 1e5 }, uSmokeU: { value: 1e5 }, uUpper: { value: 1e5 },
      uFloor: { value: 0 }, uTime: { value: 0 }, uFireX: { value: 0 }, uBreach: { value: 0 }, uLen: { value: 6000 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vP;
      void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSignal; uniform float uAmount, uSmokeY, uSmokeU, uUpper, uFloor, uTime, uFireX, uBreach, uLen;
      varying vec3 vP;
      void main() {
        if (vP.y < uFloor) discard;
        // its lower edge rolls: long slow sheets, never a ripple
        float roll = 14.0 * sin(vP.x / 230.0 + uTime * 0.35) + 9.0 * sin(vP.x / 97.0 - uTime * 0.22 + 1.7) + 6.0 * sin(vP.x / 41.0 + uTime * 0.5);
        float level = (vP.y > uUpper ? uSmokeU : uSmokeY) + roll;
        float cover = smoothstep(level - 26.0, level + 30.0, vP.y);
        float thick = 0.6 + 0.4 * smoothstep(level, level + 90.0, vP.y);
        float a = cover * thick * 0.8 * uAmount;
        vec3 col = uSignal * 0.045 * a;
        float reach = uBreach * uLen;
        float hot = (1.0 - smoothstep(reach - 300.0, reach + 80.0, abs(vP.x - uFireX))) * step(0.002, uBreach);
        float floorUp = 1.0 - smoothstep(0.0, 160.0, vP.y - uFloor);
        float blot = 0.55 + 0.45 * sin(vP.x * 0.011 + uTime * 0.6) * sin(vP.x * 0.0047 - uTime * 0.37 + 1.3);
        col += uSignal * hot * (0.025 + 0.13 * floorUp) * blot;
        gl_FragColor = vec4(col, a);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the fire, its plume, its embers (013's volume) */

/** A block of noise that tiles: three octaves of value noise, stretched to use the whole range. */
let NOISE = null;
function noiseBlock() {
  if (NOISE) return NOISE;
  const size = 40;
  const rand = rng(131);
  const lattice = (period) => {
    const g = new Float32Array(period * period * period);
    for (let i = 0; i < g.length; i++) g[i] = rand();
    const at = (x, y, z) => g[(x % period) + period * ((y % period) + period * (z % period))];
    const ease = (t) => t * t * (3 - 2 * t);
    return (u, v, w) => {
      const x = u * period;
      const y = v * period;
      const z = w * period;
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const zi = Math.floor(z);
      const fx = ease(x - xi);
      const fy = ease(y - yi);
      const fz = ease(z - zi);
      return lerp(
        lerp(lerp(at(xi, yi, zi), at(xi, yi, zi + 1), fz), lerp(at(xi, yi + 1, zi), at(xi, yi + 1, zi + 1), fz), fy),
        lerp(lerp(at(xi + 1, yi, zi), at(xi + 1, yi, zi + 1), fz), lerp(at(xi + 1, yi + 1, zi), at(xi + 1, yi + 1, zi + 1), fz), fy),
        fx,
      );
    };
  };
  const o1 = lattice(4);
  const o2 = lattice(8);
  const o3 = lattice(20);
  const data = new Uint8Array(size * size * size);
  let i = 0;
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x + 0.5) / size;
        const v = (y + 0.5) / size;
        const w = (z + 0.5) / size;
        data[i++] = Math.round(255 * clamp01(0.5 + ((o1(u, v, w) + 0.5 * o2(u, v, w) + 0.25 * o3(u, v, w)) / 1.75 - 0.5) * 2.1));
      }
    }
  }
  NOISE = new THREE.Data3DTexture(data, size, size, size);
  NOISE.format = THREE.RedFormat;
  NOISE.type = THREE.UnsignedByteType;
  NOISE.minFilter = NOISE.magFilter = THREE.LinearFilter;
  NOISE.wrapS = NOISE.wrapT = NOISE.wrapR = THREE.RepeatWrapping;
  NOISE.unpackAlignment = 1;
  NOISE.needsUpdate = true;
  return NOISE;
}

/**
 * A fire: slices across its body, each facing the eye, the far ones first; each lays its flame OVER what is behind it
 * (premultiplied), so the colour never climbs past what it was given — signal stays signal, its heart white.
 * `uC` its seat, `uR` its size, `uShape` its radii (x along the fuselage, y up, z across). Depth-tested: it goes behind
 * the slides and the nacelles; drawn before every pane of glass (the fire is under the hull, not in it).
 */
function makeFire(slices = 44) {
  const uniforms = {
    uNoise: { value: noiseBlock() }, uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() },
    uC: { value: V() }, uR: { value: 100 }, uShape: { value: V(1, 1, 1) }, uTime: { value: 0 }, uJit: { value: 0 }, uFire: { value: 0 },
  };
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 2, 1, 3]);
  geo.setAttribute("aLayer", new THREE.InstancedBufferAttribute(new Float32Array(slices).map((_, i) => i), 1));
  geo.instanceCount = slices;
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */ `
        uniform vec3 uC, uShape; uniform float uR, uJit; attribute float aLayer; varying vec3 vP;
        void main() {
          vec3 centre = uC + vec3(0.0, 0.7 * uR * uShape.y, 0.0);
          float ball = 1.9 * uR * max(uShape.x, max(uShape.y, uShape.z));
          vec3 toEye = cameraPosition - centre;
          toEye /= max(length(toEye), 1e-3);
          vec3 right = cross(vec3(0.001, 1.0, 0.0), toEye);
          right /= max(length(right), 1e-4);
          vec3 up = cross(toEye, right);
          float depth = ((aLayer + uJit) / ${f(slices)} * 2.0 - 1.0) * ball;
          vP = centre + toEye * depth + (right * position.x + up * position.y) * ball;
          gl_Position = projectionMatrix * viewMatrix * vec4(vP, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        precision highp sampler3D;
        uniform sampler3D uNoise; uniform vec3 uInk, uSignal, uC, uShape;
        uniform float uR, uTime, uFire;
        varying vec3 vP;
        void main() {
          if (uFire < 0.004 || vP.y < 0.0) discard;
          float R = max(uR, 1.0);
          vec3 q = vP - uC;
          float ry = q.y > 0.0 ? 1.45 * R * uShape.y : max(uC.y, 1.0) / 0.92;
          float d = length(vec3(q.x / (R * uShape.x), q.y / ry, q.z / (R * uShape.z)));
          if (d > 2.1) discard;
          float h = clamp(vP.y / max(uC.y + 1.45 * R * uShape.y, 1.0), 0.0, 1.0);
          float n1 = textureLod(uNoise, vec3(q.x, q.y * 0.45, q.z) / (3.2 * R) + vec3(0.13, -0.11 * uTime, 0.37), 0.0).r;
          float n2 = textureLod(uNoise, vec3(q.x, q.y * 0.5, q.z) / (1.5 * R) + vec3(0.5, -0.24 * uTime, 0.21) + (n1 - 0.5) * 0.2, 0.0).r;
          float n3 = textureLod(uNoise, vec3(q.x, q.y * 0.4, q.z) / (0.55 * R) + vec3(0.2, -0.7 * uTime, 0.7) + (n2 - 0.5) * 0.15, 0.0).r;
          float e = 1.0 - d + (n1 - 0.5) * (0.45 + 0.75 * h) + (n2 - 0.5) * (0.3 + 0.3 * h) + (n3 - 0.5) * 0.14;
          float dens = smoothstep(0.0, 0.05, e);
          if (dens < 0.004) discard;
          float deep = smoothstep(0.0, 0.4, e);
          float cell = smoothstep(0.4, 0.58, n2 + 0.5 * (n3 - 0.5));
          float shade = mix(0.13, 1.0, cell) * mix(0.6, 1.0, deep) * mix(1.0, 0.42, smoothstep(0.3, 0.95, h));
          vec3 col = uSignal * (1.1 * shade);
          vec3 toSeat = (vP - uC + vec3(0.0, 0.25 * R, 0.0)) / vec3(uShape.x, 1.0, uShape.z);
          float core = exp(-dot(toSeat, toSeat) / ((0.16 * R + 14.0) * (0.16 * R + 14.0)));
          float white = smoothstep(0.45, 0.9, core * (0.55 + 0.9 * n2));
          col = mix(col, uSignal * 1.1, 0.7 * smoothstep(0.1, 0.55, core));
          col = mix(col, uInk * 1.05, white);
          float a = 1.0 - exp(-dens * mix(0.8, 2.1, max(cell * deep, white)));
          gl_FragColor = vec4(col * a, a);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  mesh.visible = false;
  return { mesh, uniforms };
}

/**
 * The plume: a dark column of smoke that rises from the fire, widens and leans with the wind, rolls slowly (the noise
 * slides up), lit signal from under and gone dark above. A volume of soft slices: never a sheet, never a grid.
 */
function makePlume(slices = 40) {
  const uniforms = {
    uNoise: { value: noiseBlock() }, uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() },
    uBase: { value: V() }, uH: { value: 2500 }, uR0: { value: 250 }, uGrow: { value: 0.35 }, uLean: { value: new THREE.Vector2(0.25, 0) },
    uTime: { value: 0 }, uJit: { value: 0 }, uAmount: { value: 0 },
  };
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 2, 1, 3]);
  geo.setAttribute("aLayer", new THREE.InstancedBufferAttribute(new Float32Array(slices).map((_, i) => i), 1));
  geo.instanceCount = slices;
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */ `
        uniform vec3 uBase; uniform float uH, uR0, uGrow, uJit; uniform vec2 uLean; attribute float aLayer; varying vec3 vP;
        void main() {
          vec3 centre = uBase + vec3(uLean.x * 0.5 * uH, 0.5 * uH, uLean.y * 0.5 * uH);
          float ball = max(0.62 * uH, uR0 + uGrow * uH);
          vec3 toEye = cameraPosition - centre;
          toEye /= max(length(toEye), 1e-3);
          vec3 right = cross(vec3(0.001, 1.0, 0.0), toEye);
          right /= max(length(right), 1e-4);
          vec3 up = cross(toEye, right);
          float depth = ((aLayer + uJit) / ${f(slices)} * 2.0 - 1.0) * ball;
          vP = centre + toEye * depth + (right * position.x + up * position.y) * ball;
          gl_Position = projectionMatrix * viewMatrix * vec4(vP, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        precision highp sampler3D;
        uniform sampler3D uNoise; uniform vec3 uInk, uSignal, uBase; uniform float uH, uR0, uGrow, uTime, uAmount; uniform vec2 uLean;
        varying vec3 vP;
        void main() {
          if (uAmount < 0.004) discard;
          vec3 q = vP - uBase;
          float t = q.y / max(uH, 1.0);
          if (t < -0.08 || t > 1.25) discard;
          float hy = max(q.y, 0.0);
          vec2 off = q.xz - uLean * hy;
          float r = uR0 + uGrow * hy;
          float n1 = textureLod(uNoise, vec3(q.x, q.y * 0.6, q.z) / (2.6 * uR0 + 0.4 * hy) + vec3(0.31, -0.035 * uTime, 0.6), 0.0).r;
          float n2 = textureLod(uNoise, vec3(q.x, q.y, q.z) / (1.1 * uR0) + vec3(0.7, -0.08 * uTime, 0.15) + (n1 - 0.5) * 0.3, 0.0).r;
          float d = length(off) / r + (n1 - 0.5) * 0.9 + (n2 - 0.5) * 0.35;
          float dens = (1.0 - smoothstep(0.35, 1.0, d)) * smoothstep(-0.08, 0.06, t) * (1.0 - smoothstep(0.55, 1.15, t + (n2 - 0.5) * 0.35));
          if (dens < 0.004) discard;
          float a = dens * 0.72 * uAmount;
          float under = exp(-hy / (0.16 * uH));
          vec3 col = uSignal * (0.012 + 0.09 * under * under) * (0.55 + 0.45 * n2) + uInk * 0.008 * n1;
          gl_FragColor = vec4(col * a, a);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 0;
  mesh.visible = false;
  return { mesh, uniforms };
}

/** Embers carried up by the fire: each one born again in its turn, a pure function of `uT` (013). */
function makeEmbers(count, seed) {
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4);
  const offs = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    seeds.set([rand(), 2.2 + rand() * 2.6, 5 + Math.pow(rand(), 2) * 9, 0.5 + rand() * 0.8], i * 4);
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    offs.set([Math.cos(a) * r, rand(), Math.sin(a) * r], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  geo.setAttribute("aOff", new THREE.BufferAttribute(offs, 3));
  const uniforms = {
    uT: { value: 0 }, uScale: { value: 1 }, uAmount: { value: 0 }, uC: { value: V() }, uR: { value: 30 }, uShape: { value: V(1, 1, 1) },
    uHot: { value: INK.clone().multiplyScalar(1.8) }, uCool: { value: SIGNAL.clone().multiplyScalar(1.4) },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale, uR; uniform vec3 uC, uShape; attribute vec4 aSeed; attribute vec3 aOff; varying float vAge;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          vAge = age;
          float turn = 6.2832 * aOff.y + 2.4 * age * (aSeed.x - 0.5);
          vec3 spread = vec3(aOff.x * cos(turn) - aOff.z * sin(turn), 0.0, aOff.x * sin(turn) + aOff.z * cos(turn)) * uShape;
          vec3 p = uC + spread * uR * (0.35 + 0.7 * age) + vec3(0.0, uR * uShape.y * (-0.1 + 3.4 * age * aSeed.w), 0.0);
          p.y = max(p.y, 1.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aSeed.z * uScale / max(0.5, -mv.z), 2.0, 9.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; uniform float uAmount; varying float vAge;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - d), 1.6) * sqrt(clamp(sin(3.14159 * vAge), 0.0, 1.0)) * uAmount;
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.05, 0.5, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 6;
  points.visible = false;
  return { points, uniforms };
}

/* ───────────────────────────────────────────────────────────── the air a slide swallows (`gulp`) */

/**
 * Wisps of the night's air, drawn into the head of a slide while it inflates: each leaves its own point around the
 * head, accelerates in, turns a little and dies at the mouth — a streak a few pixels wide, veille, never a fog.
 */
function makeGulp(seed, count = 56) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const dirs = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const d = V(rand() * 2 - 1, rand() * 1.4 - 0.55, 0.35 + rand()).normalize();
    dirs.set([d.x, d.y, d.z], i * 3);
    seeds.set([110 + Math.pow(rand(), 0.9) * 300, rand(), 0.75 + rand() * 0.5, rand() < 0.5 ? -1 : 1], i * 4);
  }
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(dirs, 3));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  geo.instanceCount = count;
  const uniforms = {
    uAt: { value: V() }, uSpread: { value: 50 }, uTime: { value: 0 }, uAmount: { value: 0 }, uRes: { value: new THREE.Vector2(BRAND.W, BRAND.H) },
    uColor: { value: VEILLE.clone().multiplyScalar(1.6) },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uSpread; uniform vec2 uRes; uniform vec3 uAt;
        attribute vec3 aDir; attribute vec4 aSeed; varying vec2 vQ; varying float vA;
        vec3 at(float life) {
          float k = pow(clamp(1.0 - life, 0.0, 1.0), 1.7);
          float turn = 1.3 * life * aSeed.w;
          vec3 d = vec3(aDir.x * cos(turn) - aDir.z * sin(turn), aDir.y, aDir.x * sin(turn) + aDir.z * cos(turn));
          return uAt + vec3(aSeed.w * uSpread, 0.0, 0.0) + d * aSeed.x * k;
        }
        void main() {
          float life = fract(aSeed.y + uTime * 0.42 * aSeed.z);
          vec3 c0 = at(life);
          vec3 c1 = at(max(life - 0.14, 0.0));
          vec4 a = projectionMatrix * modelViewMatrix * vec4(c1, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(c0, 1.0);
          vQ = position.xy;
          vA = smoothstep(0.0, 0.18, life) * (1.0 - smoothstep(0.82, 1.0, life));
          if (a.w < 1.0 || b.w < 1.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          vec2 run = (b.xy / b.w - a.xy / a.w) * uRes;
          float len = length(run);
          run = len > 1e-4 ? run / len : vec2(1.0, 0.0);
          vec4 p = position.x < 0.0 ? a : b;
          p.xy += vec2(-run.y, run.x) * position.y * (3.4 / uRes) * p.w;
          gl_Position = p;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying vec2 vQ; varying float vA;
        void main() {
          if (uAmount < 0.003) discard;
          float a = (1.0 - vQ.y * vQ.y) * pow(clamp(0.5 + 0.5 * vQ.x, 0.0, 1.0), 1.4);
          gl_FragColor = vec4(uColor * a * vA * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  mesh.visible = false;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the evacuees: a crowd driven by `evac` alone */

const LANES = 8;
// in units of `evac`: the last figure leaves the plane at T0, slides for DS, gets up in DG, walks away in DW
const CROWD = { T0: 0.68, DS: 0.05, DG: 0.016, DW: 0.24 };
const CROWD_GLSL = /* glsl */ `
  uniform float uEvac, uN, uNs, uMode, uGR, uBags;
  uniform vec3 uHead[${LANES}]; uniform vec3 uFoot[${LANES}]; uniform vec3 uOut[${LANES}]; uniform vec3 uCtrl[${LANES}];
  uniform float uOpen[${LANES}]; uniform float uLaneW[${LANES}];
  uniform vec3 uGather;
  attribute vec4 aI; // its turn, and three draws
  // where figure aI.x stands at uEvac: its place, its heading, sitting (1) or standing (0), shown, out and safe
  void crowd(out vec3 pos, out vec3 fwd, out float sit, out float vis, out float saved) {
    float i = aI.x;
    float ns = max(uNs, 1.0);
    int j = int(mod(i, ns) + 0.5);
    if (j > ${LANES - 1}) j = ${LANES - 1};
    float m = floor(i / ns);
    float t0 = i / max(uN, 1.0) * ${f(CROWD.T0)};
    float q = uEvac - t0;
    vis = step(0.0, q) * step(i + 0.5, uN) * smoothstep(0.88, 1.0, uOpen[j]) * step(0.5, uNs);
    vec3 H = uHead[j];
    vec3 F = uFoot[j];
    vec3 O = uOut[j];
    vec3 side = normalize(cross(vec3(0.0, 1.0, 0.0), O));
    float lane = mod(m, 2.0) < 0.5 ? -1.0 : 1.0;
    vec3 off = side * lane * uLaneW[j];
    vec3 dest;
    if (uMode > 0.5) {
      float a = aI.y * 6.2831853;
      float r = sqrt(aI.z) * uGR;
      dest = uGather + vec3(cos(a) * r, 0.0, sin(a) * r * 0.62);
    } else {
      dest = F + O * (800.0 + aI.y * 900.0) + side * (aI.z - 0.5) * 1500.0;
    }
    dest.y = 0.0;
    sit = 0.0;
    saved = 0.0;
    float DS = ${f(CROWD.DS)}, DG = ${f(CROWD.DG)}, DW = ${f(CROWD.DW)};
    if (q < DS) {
      float s = clamp(q / DS, 0.0, 1.0);
      s = s * s * 0.45 + s * 0.55; // it gathers speed down the slope
      pos = mix(H, F, s) + off;
      vec3 d = F - H;
      fwd = normalize(vec3(d.x, 0.0, d.z) + vec3(1e-4, 0.0, 0.0));
      sit = 1.0;
      vis *= smoothstep(0.0, 0.006, q);
    } else if (q < DS + DG) {
      float u = (q - DS) / DG;
      u = u * u * (3.0 - 2.0 * u);
      pos = F + off + O * 70.0 * u;
      fwd = O;
      sit = 1.0 - u;
    } else {
      float u = clamp((q - DS - DG) / DW, 0.0, 1.0);
      float e = u * u * (3.0 - 2.0 * u);
      vec3 a = F + off + O * 70.0;
      vec3 c = uCtrl[j] + off;
      pos = mix(mix(a, c, e), mix(c, dest, e), e);
      vec3 d = (c - a) * (1.0 - e) + (dest - c) * e;
      fwd = normalize(vec3(d.x, 0.0, d.z) + vec3(1e-4, 0.0, 0.0));
      saved = smoothstep(0.55, 1.0, u);
    }
  }
  // a vertex of the figure (standing, feet at the origin, facing +z) put in its place
  vec3 posed(vec3 v, vec3 pos, vec3 fwd, float sit, out mat3 basis) {
    vec3 fx = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
    float b = 0.55 * sit;
    float cb = cos(b), sb = sin(b);
    basis = mat3(fx, vec3(0.0, cb, -sb) * 0.0 + vec3(0.0, 1.0, 0.0), fwd);
    float vy = v.y * mix(1.0, 0.6, sit);
    float y2 = vy * cb + v.z * sb;
    float z2 = v.z * cb - vy * sb;
    return pos + fx * v.x + vec3(0.0, y2 + 16.0 * sit, 0.0) + fwd * z2;
  }
`;

function figureGeometry() {
  // legs, trunk, head: a small person of glass, 1.7 m (aPart: 0 limbs, 1 trunk, 2 head)
  const parts = [];
  const tag = (geo, k) => {
    const g = geo.toNonIndexed();
    g.deleteAttribute("uv");
    g.setAttribute("aPart", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(k), 1));
    return g;
  };
  for (const x of [-10, 10]) parts.push(tag(new THREE.CapsuleGeometry(8, 66, 3, 8).translate(x, 42, 0), 0));
  parts.push(tag(new THREE.CapsuleGeometry(19, 48, 4, 12).scale(1, 1, 0.7).translate(0, 108, 0), 1));
  for (const x of [-25, 25]) parts.push(tag(new THREE.CapsuleGeometry(6, 52, 3, 8).rotateZ(x > 0 ? -0.12 : 0.12).translate(x, 104, 0), 0));
  parts.push(tag(new THREE.SphereGeometry(12, 14, 10).translate(0, 152, 2), 2));
  return mergeGeometries(parts);
}

function makeCrowd(n) {
  const base = figureGeometry();
  const geo = new THREE.InstancedBufferGeometry().copy(base);
  const rand = rng(379);
  const aI = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) aI.set([i, rand(), rand(), rand()], i * 4);
  geo.setAttribute("aI", new THREE.InstancedBufferAttribute(aI, 4));
  geo.instanceCount = n;
  const uniforms = {
    uEvac: { value: 0 }, uN: { value: n }, uNs: { value: 0 }, uMode: { value: 0 }, uGR: { value: GATHER.r }, uBags: { value: 0 },
    uHead: { value: Array.from({ length: LANES }, () => V()) }, uFoot: { value: Array.from({ length: LANES }, () => V()) },
    uOut: { value: Array.from({ length: LANES }, () => V(0, 0, 1)) }, uCtrl: { value: Array.from({ length: LANES }, () => V()) },
    uOpen: { value: new Array(LANES).fill(0) }, uLaneW: { value: new Array(LANES).fill(40) }, uGather: { value: V(...GATHER.at) },
    uAmount: { value: 1 }, uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */ `
        ${CROWD_GLSL}
        attribute float aPart; varying vec3 vN; varying vec3 vV; varying float vSaved; varying float vHead;
        void main() {
          vec3 pos, fwd; float sit, vis, saved;
          crowd(pos, fwd, sit, vis, saved);
          if (vis < 0.01) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          mat3 basis;
          vec3 p = posed(position, pos, fwd, sit, basis);
          vec3 n = basis * normal;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vN = normalize(normalMatrix * n);
          vV = normalize(-mv.xyz);
          vSaved = saved * vis + 2.0 * (1.0 - vis);
          vHead = aPart;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uVeille; uniform float uAmount; varying vec3 vN; varying vec3 vV; varying float vSaved; varying float vHead;
        void main() {
          if (uAmount < 0.003) discard;
          float fade = clamp(2.0 - vSaved, 0.0, 1.0);
          float saved = clamp(vSaved, 0.0, 1.0);
          float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
          // over, not added: a crowd of glass never burns to white where it thickens
          float a = clamp(0.16 + 0.75 * pow(g, 1.8) + (vHead > 1.5 ? 0.12 : 0.0), 0.0, 0.85) * uAmount;
          vec3 col = mix(uInk * 0.72, uVeille * 0.95, saved);
          gl_FragColor = vec4(col * a, a);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 8;
  // their bags: solid, signal, in the right hand
  const bagGeo = new THREE.InstancedBufferGeometry().copy(box(22, 40, 52, 4).translate(30, 62, 4));
  bagGeo.deleteAttribute("uv");
  bagGeo.setAttribute("aI", new THREE.InstancedBufferAttribute(aI, 4));
  bagGeo.instanceCount = n;
  const bags = new THREE.Mesh(
    bagGeo,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        ${CROWD_GLSL}
        varying vec3 vNw; varying float vVis;
        void main() {
          vec3 pos, fwd; float sit, vis, saved;
          crowd(pos, fwd, sit, vis, saved);
          vis *= step(aI.w, uBags);
          vVis = vis;
          if (vis < 0.01) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          mat3 basis;
          vec3 p = posed(position, pos, fwd, sit, basis);
          vNw = basis * normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uAmount; varying vec3 vNw; varying float vVis;
        void main() {
          if (uAmount < 0.003) discard;
          vec3 L = normalize(vec3(-0.45, 0.8, 0.5));
          float k = 0.32 + 0.68 * max(dot(normalize(vNw), L), 0.0);
          gl_FragColor = vec4(vec3(${f(SIGNAL.r)}, ${f(SIGNAL.g)}, ${f(SIGNAL.b)}) * k * 0.95, 1.0);
        }`,
    }),
  );
  bags.frustumCulled = false;
  bags.renderOrder = 0;
  return { mesh, bags, uniforms };
}

/* ───────────────────────────────────────────────────────────── a slide: built deployed, unrolled and inflated in its shader */

/** A capsule along z (from z0 to z1, its axis at x, y) or along x; `aAxis` = the nearest point of its axis. */
function capsuleAlong(axis, a0, a1, x, y, r, radial = 18) {
  const len = Math.max(1, a1 - a0);
  const geo = new THREE.CapsuleGeometry(r, len, 5, radial, Math.max(1, Math.round(len / 120)));
  if (axis === "z") geo.rotateX(Math.PI / 2).translate(x, y, (a0 + a1) / 2);
  else geo.rotateZ(Math.PI / 2).translate((a0 + a1) / 2, x, y);
  const pos = geo.attributes.position;
  const ax = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    if (axis === "z") ax.set([x, y, Math.min(a1, Math.max(a0, pos.getZ(i)))], i * 3);
    else ax.set([Math.min(a1, Math.max(a0, pos.getX(i))), x, y], i * 3);
  }
  geo.setAttribute("aAxis", new THREE.BufferAttribute(ax, 3));
  return geo;
}
function withSelfAxis(geo) {
  geo.setAttribute("aAxis", new THREE.BufferAttribute(geo.attributes.position.array.slice(), 3));
  return geo;
}
/** A lit solid whose vertices the slide's uniforms bend: `uCut` (unrolled length), `uRound` (flat fabric 0 → full tube 1). */
function slideMat(color, U, o = {}) {
  const m = solid(color, { rough: 0.66, env: 0.35, ...o });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uCut = U.uCut;
    sh.uniforms.uRound = U.uRound;
    sh.uniforms.uLamp = U.uLamp;
    sh.uniforms.uLampC = U.uLampC;
    sh.uniforms.uL = U.uL;
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uLamp; uniform vec3 uLampC; varying float vAlong; varying float vUp;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        // the escape light at the door's sill: it lights the slide from its head down, the tops of the tubes first
        totalEmissiveRadiance += uLampC * uLamp * (0.05 + 0.13 * exp(-vAlong / 480.0)) * (0.5 + 0.5 * vUp);`,
      );
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec3 aAxis; uniform float uCut, uRound, uL; varying float vAlong; varying float vUp;")
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
        vec3 axC = aAxis; axC.z = min(axC.z, uCut);
        float beyond = step(uCut + 0.5, position.z);
        transformed.z = min(transformed.z, uCut);
        vec3 rel = transformed - axC;
        rel *= vec3(mix(1.28, 1.0, uRound), mix(0.3, 1.0, uRound), 1.0);
        rel.y *= mix(1.0, 0.12, beyond);
        rel.x *= mix(1.0, 0.92, beyond);
        transformed = axC + rel;
        // the foot flares where it meets the ground
        transformed.x *= 1.0 + 0.22 * smoothstep(0.8, 1.0, aAxis.z / max(uL, 1.0)) * uRound * (1.0 - beyond);
        vAlong = transformed.z;
        vUp = clamp(normal.y, 0.0, 1.0);`,
      );
  };
  m.customProgramCacheKey = () => "L03-slide";
  return m;
}

/**
 * One slide, in its own frame: its HEAD at the origin (the sill's outer edge), down the slope along +z (the frame
 * `tilt` turns about x). What makes it read as an INFLATABLE at a glance: two fat side walls (a big tube, a second one
 * stacked on it), the sliding cloth stretched between them — light, a little hollow —, the divider of a double lane
 * (wide-bodies), a fatter head tube at the door, the toe; under the cloth, cross tubes; the foot flares on the ground
 * (shader). The pack it comes from (`bundle`).
 */
function buildSlide({ w, tube, L, seed, double }) {
  const U = { uCut: { value: L }, uRound: { value: 1 }, uLamp: { value: 0 }, uLampC: { value: INK.clone() }, uL: { value: L } };
  const r = tube;
  const xs = w / 2 - r;
  const yT = r * 0.55;
  const tubes = [];
  for (const sx of [-1, 1]) {
    tubes.push(capsuleAlong("z", r * 0.6, L - r * 0.9, sx * xs, yT, r, 30));
    tubes.push(capsuleAlong("z", L * 0.035, L * 0.87, sx * (xs + r * 0.06), yT + r * 0.95, r * 0.62, 24));
  }
  if (double) tubes.push(capsuleAlong("z", r * 2.2, L - r * 1.6, 0, yT + r * 0.3, r * 0.36, 20));
  tubes.push(capsuleAlong("x", -w / 2 - r * 0.35, w / 2 + r * 0.35, yT + r * 0.55, r * 0.95, r * 1.5, 30));
  tubes.push(capsuleAlong("x", -xs - r * 0.25, xs + r * 0.25, yT - r * 0.15, L - r * 0.9, r * 0.95, 26));
  const under = [];
  for (let z = Math.min(420, L * 0.45); z < L - 200; z += 420) under.push(capsuleAlong("x", -xs + r * 0.3, xs - r * 0.3, -r * 0.5, z, r * 0.5, 16));
  const strip = (geo) => {
    geo.deleteAttribute("uv");
    return geo;
  };
  // the cloth: a sheet from wall to wall, sagging a little in each lane
  const z0 = r * 1.2;
  const Lb = L - r * 1.9;
  const nx = double ? 24 : 14;
  const bedGeo = new THREE.PlaneGeometry(2 * xs, Lb, nx, Math.max(2, Math.round(Lb / 80))).rotateX(-Math.PI / 2).translate(0, 0, z0 + Lb / 2);
  {
    const pos = bedGeo.attributes.position;
    const yBed = yT + r * 0.55;
    const sag = r * 0.2;
    for (let i = 0; i < pos.count; i++) {
      const u = (pos.getX(i) + xs) / (2 * xs);
      const dip = double ? Math.abs(Math.sin(2 * Math.PI * u)) : Math.sin(Math.PI * u);
      pos.setY(i, yBed - sag * dip);
    }
    bedGeo.computeVertexNormals();
  }
  withSelfAxis(strip(bedGeo));
  const T = new THREE.Mesh(mergeGeometries(tubes.map(strip)), slideMat(0xcbbd9b, U, { rough: 0.42, env: 0.25 }));
  const B = new THREE.Mesh(bedGeo, slideMat(0xcdc2a8, U, { rough: 0.78, env: 0.12, double: true }));
  const X = new THREE.Mesh(mergeGeometries(under.map(strip)), slideMat(0x9a907c, U, { rough: 0.5 }));
  const tilt = new THREE.Group();
  for (const m of [T, B, X]) {
    m.castShadow = false;
    m.receiveShadow = false;
    m.frustumCulled = false;
    tilt.add(m);
  }
  // the pack: the folded slide in its case — it falls from the door, and what is still folded rides the front edge
  const part = makePart("pack");
  const bundle = addMesh(part, box(1, 1, 1, 0.12), solid(0x6f685b, { rough: 0.8, env: 0.6 }), { edgeOpacity: 0.55, threshold: 30 });
  bundle.castShadow = false;
  const gulp = makeGulp(seed);
  return { U, tilt, part, bundle, gulp, L, w, r, double, X, yBed: yT + r * 0.55 - r * 0.2 };
}

/* ───────────────────────────────────────────────────────────── one airliner */

function buildPlane(key, M) {
  const P = PLANES[key];
  const S = SPEC[key];
  const hw = P.r;
  const HH = P.h ? P.h / 2 : P.r;
  const g = new THREE.Group();
  g.name = key;
  const len = P.tail - P.nose;

  /* ── the section, station by station ── */
  const knots = [...NOSES[key].map(([d, ...v]) => [P.nose + d * hw, ...v]), ...TAILS[key].map(([d, ...v]) => [P.tail - d * hw, ...v])];
  const [fw, fk, fc] = [1, 2, 3].map((k) => spline(knots.map((row) => [row[0], row[k]])));
  const section = (x) => {
    const keel = fk(x) * HH;
    const crest = fc(x) * HH;
    return { w: fw(x) * hw, mid: P.axis + (keel + crest) / 2, hh: (crest - keel) / 2 };
  };
  const onSkin = (x, a, lift = 0) => {
    const s = section(x);
    return [x, s.mid + (s.hh + lift) * Math.sin(a), (s.w + lift) * Math.cos(a)];
  };
  const angleOfY = (x, y) => {
    const s = section(x);
    return Math.asin(Math.max(-1, Math.min(1, (y - s.mid) / s.hh)));
  };
  const sideA = (side, a) => (side > 0 ? a : Math.PI - a);
  const AROUND = 72;
  const ringAt = (x) => Array.from({ length: AROUND }, (_, j) => onSkin(x, (2 * Math.PI * j) / AROUND));
  const xs = [];
  for (let x = P.nose; x < P.nose + 2.6 * hw; x += hw / 28) xs.push(x);
  for (let x = P.nose + 2.6 * hw; x < P.tail - 5.6 * hw; x += 70) xs.push(x);
  for (let x = P.tail - 5.6 * hw; x < P.tail; x += hw / 9) xs.push(x);
  xs.push(P.tail);

  const panes = [];
  const pane = (geometry, material) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    g.add(mesh);
    panes.push(mesh);
    return mesh;
  };
  pane(skin(xs.map(ringAt), { wrap: true }), M.hull);

  /* ── the wing, its tip, the stabiliser, the fin ── */
  const W = P.wing;
  const semi = W.span / 2;
  const tanS = Math.tan(W.sweep * DEG);
  const zk = hw + S.kinkF * (semi - hw);
  const Y0 = P.axis + S.wingY * HH;
  const LE = (z) => W.x + (z - hw) * tanS;
  const CH = (z) => (z <= hw ? W.root : z <= zk ? lerp(W.root, S.kinkC * W.root, (z - hw) / (zk - hw)) : lerp(S.kinkC * W.root, W.tip, (z - zk) / (semi - zk)));
  const WY = (z) => Y0 + Math.max(0, z - hw * 0.5) * Math.tan(S.dihedral * DEG);
  const TH = (z) => lerp(S.thick[0], S.thick[1], z / semi);
  const wingZs = [hw * 0.45, hw, (hw + zk) / 2, zk, lerp(zk, semi, 0.33), lerp(zk, semi, 0.66), semi - 30, semi];
  for (const s of [1, -1]) {
    pane(lifting(s, wingZs, LE, CH, WY, TH), M.wings);
    const tipLE = LE(semi);
    const tipY = WY(semi);
    if (S.tip === "shark") {
      // the A350's sharklet: the wing bends up in a long curve and sweeps back
      const rows = [];
      const n = 12;
      const Rb = 210;
      for (let k = 0; k <= n; k++) {
        const u = k / n;
        const th = Math.min(1, u * 1.35) * 78 * DEG;
        const rise = u > 0.74 ? (u - 0.74) * 520 : 0;
        const z = semi + Rb * Math.sin(th);
        const y = tipY + Rb * (1 - Math.cos(th)) + rise;
        const lead = tipLE + 10 + Math.pow(u, 1.3) * W.tip * 1.1;
        const chord = lerp(W.tip - 15, W.tip * 0.36, u) * (k === n ? 0.94 : 1);
        const row = [];
        for (let j = 0; j < FOIL; j++) {
          const [x, t0] = foil(lead, chord, k === n ? 0.004 : 0.09, j);
          row.push([x, y + t0 * Math.cos(th), s * (z - t0 * Math.sin(th))]);
        }
        rows.push(row);
      }
      pane(skin(rows, { wrap: true }), M.wings);
    } else if (S.tip === "fence") {
      // the A380's wingtip fence: a plate up and down at the tip
      const rows = [];
      for (const [k, dy] of [[0, -120], [1, -40], [2, 60], [3, 170]]) {
        const row = [];
        const chord = W.tip * (k === 0 || k === 3 ? 0.62 : 0.92);
        for (let j = 0; j < FOIL; j++) {
          const [x, t0] = foil(tipLE + 30 + (dy + 120) * 0.35, chord, k === 0 || k === 3 ? 0.004 : 0.08, j);
          row.push([x, tipY + dy, s * (semi + 6 + t0)]);
        }
        rows.push(row);
      }
      pane(skin(rows, { wrap: true }), M.wings);
    }
    // the stabiliser
    const ST = S.stab;
    const stLE0 = P.tail - ST.back;
    const stTan = Math.tan(ST.sweep * DEG);
    const stY = P.axis + ST.y * HH;
    pane(
      lifting(s, [0, ST.semi * 0.35, ST.semi * 0.7, ST.semi - 15, ST.semi], (z) => stLE0 + z * stTan, (z) => lerp(ST.root, ST.tip, z / ST.semi), (z) => stY + z * Math.tan(ST.dihedral * DEG), () => 0.1),
      M.wings,
    );
  }
  const FIN = S.fin;
  const finLE0 = P.tail - FIN.back;
  const finBase = (() => {
    const s = section(finLE0 + FIN.root * 0.5);
    return s.mid + s.hh - 18;
  })();
  const finTan = Math.tan(FIN.sweep * DEG);
  const finLE = (y) => finLE0 + (y - finBase) * finTan;
  const finCh = (y) => lerp(FIN.root, FIN.tip, (y - finBase) / P.tailFin);
  {
    const rows = [];
    const ys = [finBase - 40, finBase, finBase + P.tailFin * 0.2, finBase + P.tailFin * 0.55, finBase + P.tailFin - 20, finBase + P.tailFin];
    ys.forEach((y, i) => {
      const yy = Math.max(finBase, y);
      const end = i === ys.length - 1;
      const dorsal = FIN.dorsal && i === 0 ? FIN.dorsal : 0;
      const row = [];
      for (let j = 0; j < FOIL; j++) {
        const [x, t] = foil(finLE(yy) - (i === 0 ? 40 : 0) - dorsal, finCh(yy) + (i === 0 ? 70 : 0) + dorsal, 0.1 * (end ? 0.05 : 1), j);
        row.push([x, y + (end ? 4 : 0), t]);
      }
      rows.push(row);
    });
    pane(skin(rows, { wrap: true }), M.wings);
  }

  /* ── the engines: nacelle (solid), its fan, its lip; the pylon of glass ── */
  const E = P.engines;
  const nacGeo = lathe(S.nac.map(([r, y]) => [r * E.r, y * E.len]), 72, { bevel: 1.4 }).rotateZ(-Math.PI / 2);
  const engines = [];
  for (const s of [1, -1]) {
    for (const ez of E.z) {
      const eg = new THREE.Group();
      eg.position.set(E.x, E.y, s * ez);
      g.add(eg);
      const part = makePart(`eng${s > 0 ? "L" : "R"}${ez}`);
      eg.add(part);
      addMesh(part, nacGeo, M.nacelle, { edgeOpacity: 0.6, threshold: 30 });
      const fanR = S.nac[0][0] * E.r * 0.99;
      const fanM = fanMat();
      const fan = new THREE.Mesh(new THREE.CircleGeometry(fanR, 64).rotateY(-Math.PI / 2), fanM);
      fan.position.x = S.nac[0][1] * E.len;
      fan.renderOrder = 3;
      part.add(fan);
      const lip = new THREE.Mesh(new THREE.TorusGeometry(E.r * 0.9, 3, 8, 96).rotateY(Math.PI / 2), M.lipGlow);
      lip.position.x = -1.5;
      lip.visible = false;
      part.add(lip);
      const mouth = glowSprite(E.r * 3.2);
      mouth.position.set(-30, 0, 0);
      part.add(mouth);
      // the pylon, up into the wing
      const wy = WY(ez) - 0.04 * CH(ez);
      const ny = E.y + E.r * 0.9;
      const xA = E.x + E.len * 0.12;
      const xB = LE(ez) + CH(ez) * 0.55;
      const pyl = plate([[xA, ny - 10], [E.x + E.len * 0.9, ny - 10], [xB, Math.min(wy, ny + 30) - 6], [xB, wy + 28], [LE(ez) - 20, wy + 28], [xA + 40, ny + 40]], 34, { bevel: 8, round: 3 });
      pyl.translate(0, 0, s * ez - 17);
      pane(pyl, M.wings);
      engines.push({ s, z: ez, g: eg, fan: fanM, lip, mouth, inner: ez === E.z[0] });
    }
  }
  // the flap-track fairings: the canoes that say « airliner » (not on the 737-200's small wing: two only)
  for (const s of [1, -1]) {
    const list = key === "b737" ? [hw + 300, hw + 700] : [hw + 250, zk, lerp(zk, semi, 0.35), lerp(zk, semi, 0.65)];
    for (const z of list) {
      const c = CH(z);
      const geo = new THREE.CapsuleGeometry(c * 0.035 + 6, c * 0.6, 6, 14).rotateZ(Math.PI / 2).scale(1, 1.25, 0.8);
      pane(geo, M.wings).position.set(LE(z) + c * 0.82, WY(z) - 0.06 * c - 10, s * z);
    }
  }
  // the belly fairing (the wide-bodies), between the wings
  if (key !== "b737") {
    const fr = [];
    const x0 = W.x - 200;
    const x1 = W.x + W.root + 450;
    for (let x = x0; x <= x1; x += 50) {
      const u = (x - x0) / (x1 - x0);
      const b = smooth(0, 0.28, u) * smooth(1, 0.7, u);
      const s0 = section(x);
      const ring = [];
      for (let j = 0; j < 40; j++) {
        const a = (2 * Math.PI * j) / 40;
        const c = Math.cos(a);
        const sn = Math.sin(a);
        ring.push([x, s0.mid - s0.hh * 0.86 + (sn < 0 ? 0.24 : 0.12) * s0.hh * b * sn, (0.22 * hw + 0.86 * hw * b) * Math.sign(c) * Math.pow(Math.abs(c), 0.8)]);
      }
      fr.push(ring);
    }
    pane(skin(fr, { wrap: true }), M.hull);
  }
  asShell(panes, 20);

  /* ── a few lines of structure ── */
  const frames = [];
  const outline = [];
  const run = (list, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) list.push(...pts[i], ...pts[i + 1]);
    if (closed) list.push(...pts.at(-1), ...pts[0]);
  };
  const along = (fn, x0, x1, step = 50) => {
    const pts = [];
    for (let x = x0; x <= x1; x += step) pts.push(fn(x));
    return pts;
  };
  const LIFT = 1.5;
  const fx0 = P.nose + 2.6 * hw;
  const fx1 = P.tail - 4.8 * hw;
  const nFrames = Math.max(5, Math.round((fx1 - fx0) / 640));
  for (let k = 0; k <= nFrames; k++) run(frames, ringAt(lerp(fx0, fx1, k / nFrames)).filter((_, j) => j % 2 === 0), true);
  run(frames, along((x) => onSkin(x, Math.PI / 2, LIFT), P.nose + 30, P.tail - 30, 45));
  run(frames, along((x) => onSkin(x, -Math.PI / 2, LIFT), P.nose + 30, P.tail - 2.2 * hw, 45));
  const decks = [[P.floor, S.win.y]];
  if (P.upper) decks.push([P.upper, S.win.y]);
  const xWin0 = P.doors[0][1] - 40;
  const xWin1 = P.doors.filter((d) => d[0] !== "W").at(-1)[1] + 120;
  for (const side of [1, -1]) {
    for (const [floorY, wy] of decks) {
      for (const dy of [-S.win.h * 0.75, S.win.h * 0.78]) {
        run(P.upper ? outline : frames, along((x) => onSkin(x, sideA(side, angleOfY(x, floorY + wy + dy)), 0.8), xWin0, xWin1, 50));
      }
      // the floor, seen through the skin (the A380's upper deck firm: two decks at a glance)
      run(floorY === P.upper ? outline : frames, along((x) => {
        const s0 = section(x);
        const dy = floorY - s0.mid;
        return [x, floorY, side * Math.sqrt(Math.max(0, s0.w * s0.w * (1 - (dy * dy) / (s0.hh * s0.hh)))) * 0.97];
      }, xWin0 - 80, xWin1 + 80, 100));
    }
  }
  // the cockpit's panes (and the 737's eyebrow windows), drawn on the skin
  const cockpit = [];
  for (const side of [1, -1]) {
    for (const [u0, u1, a0, a1] of S.panes) {
      const x0 = P.nose + u0 * hw;
      const x1 = P.nose + u1 * hw;
      const lean = 0.035 * hw;
      const A_ = (a) => sideA(side, a * DEG);
      const pts = [];
      for (let k = 0; k <= 6; k++) pts.push(onSkin(lerp(x0, x0 + lean, k / 6), A_(lerp(a0, a1, k / 6)), LIFT));
      for (let k = 0; k <= 6; k++) pts.push(onSkin(lerp(x0 + lean, x1 + lean, k / 6), A_(a1), LIFT));
      for (let k = 0; k <= 6; k++) pts.push(onSkin(lerp(x1 + lean, x1, k / 6), A_(lerp(a1, a0, k / 6)), LIFT));
      for (let k = 0; k <= 6; k++) pts.push(onSkin(lerp(x1, x0, k / 6), A_(a0), LIFT));
      run(outline, pts);
      cockpit.push({ side, x0, x1, a0, a1 });
    }
  }
  // the outline of what flies: the wing's edges and spars, the tail's
  for (const s of [1, -1]) {
    const at = (z, fr) => [LE(z) + fr * CH(z), WY(z), s * z];
    run(outline, [at(hw, 0), at(zk, 0), at(semi, 0), at(semi, 1), at(zk, 1), at(hw, 1)]);
    for (const fr of [0.15, 0.62]) run(frames, [at(hw + 40, fr), at(zk, fr), at(semi - 40, fr)]);
    const ST = S.stab;
    const stLE0 = P.tail - ST.back;
    const st = (z, fr) => [stLE0 + z * Math.tan(ST.sweep * DEG) + fr * lerp(ST.root, ST.tip, z / ST.semi), P.axis + ST.y * HH + z * Math.tan(ST.dihedral * DEG), s * z];
    run(outline, [st(hw * 0.5, 0), st(ST.semi, 0), st(ST.semi, 1), st(hw * 0.5, 1)]);
  }
  const fn = (y, fr) => [finLE(y) + fr * finCh(y), y, 0];
  run(outline, [fn(finBase + 10, 0), fn(finBase + P.tailFin, 0), fn(finBase + P.tailFin, 1), fn(finBase + 10, 1)]);
  const segments = (list, material, order = 2) => {
    const geo = new LineSegmentsGeometry();
    geo.setPositions(list);
    const lines = new LineSegments2(geo, material);
    lines.frustumCulled = false;
    lines.renderOrder = order;
    g.add(lines);
    return lines;
  };
  segments(frames, M.frames);
  segments(outline, M.outline);

  /* ── the A350's mask: the black band round its windscreen ── */
  if (S.mask) {
    const rows = [];
    const n = 14;
    const xa = P.nose + 0.36 * hw;
    const xb = P.nose + 1.3 * hw;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = lerp(xa, xb, u);
      const lo = lerp(38, 70, u * u);
      const hi = lerp(90, 82, u);
      const row = [];
      for (let j = 0; j <= 16; j++) {
        const a = lerp(lo, Math.max(lo, hi), j / 16) * DEG;
        row.push(onSkin(x, a, 0.6));
      }
      for (let j = 16; j >= 0; j--) {
        const a = lerp(lo, Math.max(lo, hi), j / 16) * DEG;
        row.push(onSkin(x, Math.PI - a, 0.6));
      }
      rows.push(row);
    }
    const mask = new THREE.Mesh(skin(rows), M.mask);
    mask.renderOrder = 21;
    mask.frustumCulled = false;
    g.add(mask);
  }

  /* ── the doors: their outline on the skin, their leaf, their slide ── */
  const doors = [];
  const doorAnchors = {};
  const footAnchors = {};
  const roundRect = (cx, y0, w, h, rr = 16, step = 6) => {
    const pts = [];
    const arc = (ox, oy, a0) => {
      for (let k = 0; k <= step; k++) {
        const a = a0 + (k / step) * (Math.PI / 2);
        pts.push([ox + rr * Math.cos(a), oy + rr * Math.sin(a)]);
      }
    };
    arc(cx + w / 2 - rr, y0 + rr, -Math.PI / 2);
    arc(cx + w / 2 - rr, y0 + h - rr, 0);
    arc(cx - w / 2 + rr, y0 + h - rr, Math.PI / 2);
    arc(cx - w / 2 + rr, y0 + rr, Math.PI);
    pts.push(pts[0]);
    return pts;
  };
  const onSide = (side, lift) => ([xx, yy]) => onSkin(xx, sideA(side, angleOfY(xx, yy)), lift);
  const densify = (pts2, step = 20) => {
    const out = [];
    for (let i = 0; i < pts2.length - 1; i++) {
      const [a, b] = [pts2[i], pts2[i + 1]];
      const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
    }
    out.push(pts2.at(-1));
    return out;
  };
  const slides = [];
  let seed = 11;
  P.doors.forEach(([id, x, deck], index) => {
    for (const [sideKey, side] of [["L", 1], ["R", -1]]) {
      const full = id + sideKey;
      const hatch = id === "W";
      const sillY = (deck ? P.upper : P.floor) + (hatch ? 50 : 0);
      const dw = hatch ? 51 : P.door.w;
      const dh = hatch ? 91 : P.door.h;
      const sillP = onSkin(x, sideA(side, angleOfY(x, sillY)), 0);
      const door = { id, full, side, x, deck, index, hatch, sillY, sillZ: sillP[2], w: dw, h: dh };
      // its outline, its cross (condemned), its ring (marked) — one material each, so each can change colour
      door.mat = lineMat(BRAND.ink, 2, { opacity: 0.55 });
      const ring2 = densify(roundRect(x, sillY, dw, dh, hatch ? 12 : 18));
      const geo = new LineSegmentsGeometry();
      const list = [];
      run(list, ring2.map(onSide(side, LIFT + 0.4)));
      geo.setPositions(list);
      door.outline = new LineSegments2(geo, door.mat);
      door.outline.renderOrder = 3;
      door.outline.frustumCulled = false;
      g.add(door.outline);
      const cross = [];
      run(cross, densify([[x - dw / 2 + 10, sillY + 10], [x + dw / 2 - 10, sillY + dh - 10]]).map(onSide(side, LIFT + 0.6)));
      run(cross, densify([[x + dw / 2 - 10, sillY + 10], [x - dw / 2 + 10, sillY + dh - 10]]).map(onSide(side, LIFT + 0.6)));
      const cgeo = new LineSegmentsGeometry();
      cgeo.setPositions(cross);
      door.cross = new LineSegments2(cgeo, door.mat);
      door.cross.renderOrder = 3;
      door.cross.visible = false;
      door.cross.frustumCulled = false;
      g.add(door.cross);
      const mk = [];
      run(mk, densify(roundRect(x, sillY - 26, dw + 56, dh + 52, 34)).map(onSide(side, LIFT + 1.2)));
      const mgeo = new LineSegmentsGeometry();
      mgeo.setPositions(mk);
      door.ring = new LineSegments2(mgeo, M.mark);
      door.ring.renderOrder = 3;
      door.ring.visible = false;
      door.ring.frustumCulled = false;
      g.add(door.ring);
      // its porthole, lit by the fire behind it when it stays shut (Haneda)
      door.flame = glowSprite(70);
      const ph = onSkin(x, sideA(side, angleOfY(x, sillY + dh * 0.72)), 4);
      door.flame.position.set(...ph);
      g.add(door.flame);
      // its leaf: a plug door that moves out and swings forward along the skin (the 737's hatch is taken in)
      door.pivot = new THREE.Group();
      door.pivot.position.set(x - dw / 2, sillY, sillP[2]);
      if (side < 0) door.pivot.scale.z = -1;
      g.add(door.pivot);
      door.leafPart = makePart(`leaf-${full}`);
      const leafGeo = plate(roundRect(dw / 2, 0, dw, dh, hatch ? 10 : 16).slice(0, -1), 9, { bevel: 2, round: 2 });
      addMesh(door.leafPart, leafGeo, M.leaf, { edgeOpacity: 0.7, threshold: 30, pos: [0, 0, -4] });
      door.pivot.add(door.leafPart);
      door.leafPart.visible = false;
      // the anchors: the sill's centre, outside; the foot of its slide
      const a = new THREE.Object3D();
      a.position.set(x, sillY, sillP[2]);
      g.add(a);
      doorAnchors[`${key}:${full}`] = a;
      const reach = key === "b737" ? SLIDE.reach737 : deck ? SLIDE.reachUpper : SLIDE.reach;
      const footA = new THREE.Object3D();
      footA.position.set(x, 0, sillP[2] + side * reach);
      g.add(footA);
      footAnchors[`${key}:${full}`] = footA;
      door.reach = reach;
      // its slide (not the hatch's: from the 737's overwing exit, you walk out onto the wing)
      if (!hatch) {
        const tube = deck ? S.tube * 1.15 : S.tube;
        const L = Math.hypot(reach, sillY) * 1.02;
        const sl = buildSlide({ w: S.lane, tube, L, seed: seed++, double: key !== "b737" });
        sl.group = new THREE.Group();
        sl.group.position.set(x, sillY, sillP[2]);
        if (side < 0) sl.group.rotation.y = Math.PI;
        sl.group.add(sl.tilt, sl.part, sl.gulp.mesh);
        sl.group.visible = false;
        g.add(sl.group);
        sl.final = Math.atan2(sillY, reach * 1.0);
        sl.door = door;
        door.slide = sl;
        slides.push(sl);
      }
      doors.push(door);
    }
  });

  /* ── the windows, one row a deck and a side; the cockpit's panes faintly; the emergency lights inside ── */
  const winLen = xWin1 - xWin0;
  {
    const pos = [];
    const uv = [];
    const win = [];
    const idx = [];
    const rand = rng(key.length * 7 + 3);
    const quad = (c, nrm, w, h, x, y, k) => {
      const n = V(...nrm).normalize();
      const right = V(1, 0, 0);
      const up = V().crossVectors(n, right).normalize();
      if (up.y < 0) up.negate();
      const b = pos.length / 3;
      for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
        const p = V(...c).addScaledVector(right, (u - 0.5) * w).addScaledVector(up, (v - 0.5) * h);
        pos.push(p.x, p.y, p.z);
        uv.push(u, v);
        win.push(x, y, k);
      }
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    };
    for (const side of [1, -1]) {
      for (const [di, [floorY]] of decks.entries()) {
        const upperDeck = di === 1;
        for (let x = xWin0 + 60; x <= xWin1 - 60; x += S.win.pitch) {
          const nearDoor = P.doors.some(([, xd, dk]) => (upperDeck ? dk === 1 : dk === 0) && Math.abs(xd - x) < P.door.w / 2 + 40);
          if (nearDoor) continue;
          const y = floorY + S.win.y;
          const p = onSkin(x, sideA(side, angleOfY(x, y)), 1.2);
          const s0 = section(x);
          quad(p, [0, (p[1] - s0.mid) / s0.hh, p[2] / s0.w], S.win.w, S.win.h, x, y, (side > 0 ? 0.62 : 0.45) * (0.82 + 0.36 * rand()));
        }
      }
      // the door's own porthole
      for (const [, xd, dk] of P.doors) {
        const y = (dk ? P.upper : P.floor) + P.door.h * 0.72;
        const p = onSkin(xd, sideA(side, angleOfY(xd, y)), 1.2);
        const s0 = section(xd);
        quad(p, [0, (p[1] - s0.mid) / s0.hh, p[2] / s0.w], 18, 22, xd, y, side > 0 ? 0.5 : 0.4);
      }
    }
    for (const { side, x0, x1, a0, a1 } of cockpit) {
      const xm = (x0 + x1) / 2;
      const am = ((a0 + a1) / 2) * DEG;
      const p = onSkin(xm, sideA(side, am), 0.8);
      const s0 = section(xm);
      quad(p, [0, Math.sin(am), side * Math.cos(am)], (x1 - x0) * 0.8, (a1 - a0) * DEG * s0.hh * 0.8, xm, P.floor + 80, 0.18);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute("aWin", new THREE.Float32BufferAttribute(win, 3));
    geo.setIndex(idx);
    const mesh = new THREE.Mesh(geo, M.windows);
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    g.add(mesh);
  }
  const emergPts = (() => {
    const pos = [];
    const k = [];
    for (const [floorY, ceil] of [[P.floor, S.ceil], ...(P.upper ? [[P.upper, S.ceilU]] : [])]) {
      for (let x = xWin0; x <= xWin1; x += 260) {
        const s0 = section(x);
        for (const side of [1, -1]) {
          const y = floorY + ceil * 0.7;
          const dy = y - s0.mid;
          const zz = Math.sqrt(Math.max(0, s0.w * s0.w * (1 - (dy * dy) / (s0.hh * s0.hh)))) * 0.72;
          pos.push(x, y, side * zz);
          k.push(0.55, 14);
        }
      }
    }
    for (const [, xd, dk] of P.doors) {
      for (const side of [1, -1]) {
        const y = (dk ? P.upper : P.floor) + P.door.h + 12;
        const s0 = section(xd);
        const dy = y - s0.mid;
        const zz = Math.sqrt(Math.max(0, s0.w * s0.w * (1 - (dy * dy) / (s0.hh * s0.hh)))) * 0.9;
        pos.push(xd, y, side * zz);
        k.push(1, 22);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aK", new THREE.Float32BufferAttribute(k, 2));
    const pts = new THREE.Points(geo, M.emerg);
    pts.frustumCulled = false;
    pts.renderOrder = 5;
    g.add(pts);
    return pts;
  })();

  /* ── the people aboard: small heads of glass, row after row, deck by deck ── */
  {
    const head = new THREE.SphereGeometry(10, 8, 6);
    const pos = [];
    const nor = [];
    const add = (rows, seats, floorY, pitch) => {
      for (const [r0, r1] of rows) {
        for (let x = r0; x <= r1; x += pitch) {
          if (P.doors.some(([, xd, dk]) => (floorY === P.floor ? dk === 0 : dk === 1) && Math.abs(xd - x) < 110)) continue;
          for (const z of seats) {
            const gi = head.clone().translate(x, floorY + 112, z).toNonIndexed();
            pos.push(...gi.attributes.position.array);
            nor.push(...gi.attributes.normal.array);
          }
        }
      }
    };
    add(S.rows, S.seats, P.floor, S.seatPitch);
    if (P.upper) add(S.rowsU, S.seatsU, P.upper, S.seatPitch);
    const merged = new THREE.BufferGeometry();
    merged.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    merged.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    const mesh = new THREE.Mesh(merged, M.pax);
    mesh.frustumCulled = false;
    mesh.renderOrder = 9;
    g.add(mesh);
  }

  /* ── the smoke in the cabin: the near wall of a tube inside the hull ── */
  {
    const x0 = P.nose + 2.0 * hw;
    const x1 = P.tail - 4.2 * hw;
    const rows = [];
    for (let x = x0; x <= x1; x += 120) rows.push(Array.from({ length: 48 }, (_, j) => {
      const a = (2 * Math.PI * j) / 48;
      const s0 = section(x);
      return [x, s0.mid + s0.hh * 0.9 * Math.sin(a), s0.w * 0.9 * Math.cos(a)];
    }));
    const mesh = new THREE.Mesh(skin(rows, { wrap: true }), M.cabinSmoke);
    mesh.renderOrder = 12;
    mesh.frustumCulled = false;
    g.add(mesh);
  }

  /* ── the gear: struts and wheels, solid, three greys ── */
  for (const G of S.gear) {
    for (const s of G.z ? [1, -1] : [1]) {
      const z = s * G.z;
      const top = G.top === "wing" ? WY(Math.abs(z)) - 0.05 * CH(Math.abs(z)) : section(G.x).mid - section(G.x).hh * 0.85;
      const part = makePart("gear");
      g.add(part);
      const strut = cyl(G.r * 0.17, top - G.r, 1.2, 20);
      addMesh(part, strut, M.steel, { pos: [G.x, G.r + (top - G.r) / 2, z], edgeOpacity: 0.5 });
      const axles = G.axles;
      for (let a = 0; a < axles; a++) {
        const ax = G.x + (a - (axles - 1) / 2) * G.r * 2.5;
        for (const dz of [-G.pair, G.pair]) {
          addMesh(part, cyl(G.r, G.r * 0.62, 3, 40).rotateX(Math.PI / 2), M.rubber, { pos: [ax, G.r, z + dz], edgeOpacity: 0.45 });
          addMesh(part, cyl(G.r * 0.55, G.r * 0.64, 1.5, 32).rotateX(Math.PI / 2), M.hub, { pos: [ax, G.r, z + dz], edges: false });
        }
      }
      if (axles > 1) addMesh(part, box(G.r * 2.5 * (axles - 1) + 30, 14, 14, 3), M.steel, { pos: [G.x, G.r, z], edges: false });
    }
  }

  /* ── the two pilots, glass, lit by their instruments ── */
  const pilots = new THREE.Group();
  {
    const [u0, , a0] = S.panes[1];
    const xp = P.nose + (u0 + 0.42) * hw;
    const sw = section(P.nose + u0 * hw);
    const yb = sw.mid + sw.hh * Math.sin(a0 * DEG) - 108; // the head's top just under the windscreen's sill
    for (const z of [-48, 48]) {
      const trunk = new THREE.Mesh(new THREE.CapsuleGeometry(17, 40, 4, 12).scale(1, 1, 0.75).translate(xp, yb + 40, z), M.pilot);
      const headM = new THREE.Mesh(new THREE.SphereGeometry(11, 14, 10).translate(xp - 3, yb + 88, z), M.pilot);
      for (const m of [trunk, headM]) {
        m.renderOrder = 10;
        pilots.add(m);
      }
    }
    const panel = glowSprite(140);
    panel.position.set(xp - 75, yb + 55, 0);
    pilots.add(panel);
    pilots.userData.panel = panel;
    pilots.userData.at = [xp, yb + 88, 0];
    pilots.visible = false;
    g.add(pilots);
  }

  return {
    key, P, S, g, doors, slides, engines, pilots, emergPts, doorAnchors, footAnchors, section, onSkin, angleOfY, winLen, xWin0,
    WY, LE, CH,
  };
}

/* ───────────────────────────────────────────────────────────── the Dash 8 of the coast guard */

function buildDash(M) {
  const g = new THREE.Group(); // its TAIL at the origin, its nose toward −x (it stood on the runway, facing the same way)
  const Lb = DASH.len;
  const r = 132;
  const section = (x) => {
    // x from −Lb (nose) to 0 (tail)
    const u = (x + Lb) / Lb;
    const w = r * (u < 0.12 ? Math.sqrt(u / 0.12) * 0.98 + 0.02 : u > 0.62 ? lerp(1, 0.18, (u - 0.62) / 0.38) : 1);
    const mid = 260 + (u > 0.62 ? (u - 0.62) * 220 : 0) - (u < 0.12 ? (0.12 - u) * 160 : 0);
    return { w, mid };
  };
  const rows = [];
  for (let x = -Lb; x <= 0; x += 40) {
    const s = section(x);
    rows.push(Array.from({ length: 40 }, (_, j) => {
      const a = (2 * Math.PI * j) / 40;
      return [x, s.mid + s.w * 1.05 * Math.sin(a), s.w * Math.cos(a)];
    }));
  }
  const panes = [];
  const pane = (geo) => {
    const m = new THREE.Mesh(geo, M.dashGlass);
    m.frustumCulled = false;
    g.add(m);
    panes.push(m);
    return m;
  };
  pane(skin(rows, { wrap: true }));
  // the high wing, straight; its engines under it; the T-tail
  const wx = -Lb * 0.55;
  const wy = 260 + r * 1.02;
  for (const s of [1, -1]) {
    pane(lifting(s, [0, 400, DASH.span / 2 - 10, DASH.span / 2], (z) => wx + z * 0.03, (z) => lerp(270, 160, z / (DASH.span / 2)), () => wy, () => 0.15));
    const ng = cyl(42, 360, 3, 32, 36).rotateZ(-Math.PI / 2).translate(wx - 120, wy - 40, s * 400);
    pane(ng);
    // a prop that stands still: six blades as lines
    const blades = [];
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      blades.push(wx - 305, wy - 40, s * 400, wx - 305, wy - 40 + 200 * Math.sin(a), s * 400 + 200 * Math.cos(a));
    }
    const bg = new LineSegmentsGeometry();
    bg.setPositions(blades);
    const bl = new LineSegments2(bg, M.dashLines);
    bl.renderOrder = 2;
    g.add(bl);
    pane(lifting(s, [0, 280, 370], (z) => -300 + z * 0.4, (z) => lerp(220, 120, z / 370), () => 260 + 290 + 420, () => 0.1));
  }
  {
    const rr = [];
    for (const [y, lead, ch] of [[300, -560, 520], [500, -470, 400], [720, -380, 300], [970, -300, 220]]) {
      const row = [];
      for (let j = 0; j < FOIL; j++) {
        const [x, t] = foil(lead, ch, 0.1, j);
        row.push([x, y, t]);
      }
      rr.push(row);
    }
    pane(skin(rr, { wrap: true }));
  }
  asShell(panes, 20);
  const outline = [];
  for (const z of [-r, r]) for (let x = -Lb + 300; x < -60; x += 600) outline.push(x, 260, z, x + 300, 260, z);
  const og = new LineSegmentsGeometry();
  og.setPositions(outline);
  const ol = new LineSegments2(og, M.dashLines);
  ol.renderOrder = 2;
  g.add(ol);
  // its gear: small, solid
  const part = makePart("dash-gear");
  g.add(part);
  for (const [x, z] of [[wx, 160], [wx, -160], [-Lb + 260, 0]]) addMesh(part, cyl(38, 24, 2, 28).rotateX(Math.PI / 2), M.rubber, { pos: [x, 38, z], edgeOpacity: 0.4 });
  const fire = makeFire(28); // drawn in the set's frame (world): buildAvion adds them
  const embers = makeEmbers(40, 88);
  return { g, panes, fire, embers };
}

/* ───────────────────────────────────────────────────────────── the sites */

/** The runway: two edges and the lines that do not move; the lamps and the centre line that slide with `run` (wrapped). */
function buildRunway(M) {
  const g = new THREE.Group();
  const still = [];
  const half = RUNWAY.w / 2;
  const X0 = -160000;
  const X1 = 60000;
  for (const z of [half, -half]) still.push(X0, 1, z, X1, 1, z);
  // the grass beyond the shoulders: a few long faint strokes (the ground is lines, never a slab)
  const rand = rng(34);
  for (const s of [1, -1]) {
    for (let k = 0; k < 9; k++) {
      const z = s * (half + 900 + Math.pow(rand(), 1.4) * 14000);
      still.push(X0, 0.5, z, X1, 0.5, z);
    }
  }
  const sg = new LineSegmentsGeometry();
  sg.setPositions(still);
  const stillLines = new LineSegments2(sg, M.ground);
  stillLines.renderOrder = 2;
  stillLines.frustumCulled = false;
  g.add(stillLines);
  // what slides: a frame of x wrapped by the lamps' pitch
  const slide = new THREE.Group();
  g.add(slide);
  const P0 = RUNWAY.pitch;
  const dash = [];
  for (let x = Math.floor(X0 / P0) * P0; x <= X1; x += P0) dash.push(x, 1.5, 0, x + P0 * 0.55, 1.5, 0);
  const dg = new LineSegmentsGeometry();
  dg.setPositions(dash);
  const centre = new LineSegments2(dg, M.paint);
  centre.renderOrder = 2;
  centre.frustumCulled = false;
  slide.add(centre);
  const pos = [];
  const k = [];
  for (let x = Math.floor(X0 / P0) * P0; x <= X1; x += P0) {
    for (const z of [half + 80, -half - 80]) {
      pos.push(x, 14, z);
      k.push(1, 46);
    }
    pos.push(x + P0 / 2, 6, 0);
    k.push(0.5, 30);
    pos.push(x, 6, 0);
    k.push(0.5, 30);
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  lg.setAttribute("aK", new THREE.Float32BufferAttribute(k, 2));
  const lamps = new THREE.Points(lg, M.lamps);
  lamps.renderOrder = 8;
  lamps.frustumCulled = false;
  slide.add(lamps);
  // the runway's own frame (not wrapped): the Dash 8 stands in it
  const track = new THREE.Group();
  g.add(track);
  return { g, slide, track, lamps };
}

/** The trial hangar: a hall of X-ray (portal frames, purlins, a floor grid), dark — its emergency lights alone. */
function buildHangar(M) {
  const g = new THREE.Group();
  const Lh = HANGAR.len;
  const Wh = HANGAR.w;
  const Hh = HANGAR.h;
  const eave = Hh * 0.8;
  const lines = [];
  const nFr = 10;
  for (let k = 0; k <= nFr; k++) {
    const x = -Lh / 2 + (k * Lh) / nFr;
    lines.push(x, 0, Wh / 2, x, eave, Wh / 2, x, eave, Wh / 2, x, Hh, 0, x, Hh, 0, x, eave, -Wh / 2, x, eave, -Wh / 2, x, 0, -Wh / 2);
  }
  for (const [y, z] of [[eave, Wh / 2], [eave, -Wh / 2], [Hh, 0], [eave + (Hh - eave) / 2, Wh / 4], [eave + (Hh - eave) / 2, -Wh / 4], [0, -Wh / 2], [0, Wh / 2]]) lines.push(-Lh / 2, y, z, Lh / 2, y, z);
  // the back wall's posts
  for (let k = 0; k <= 8; k++) {
    const z = -Wh / 2 + (k * Wh) / 8;
    const top = Math.abs(z) > Wh / 2 - 1 ? eave : eave + (Hh - eave) * (1 - Math.abs(z) / (Wh / 2));
    lines.push(Lh / 2, 0, z, Lh / 2, top, z);
  }
  const fg = new LineSegmentsGeometry();
  fg.setPositions(lines);
  const frame = new LineSegments2(fg, M.hall);
  frame.renderOrder = 2;
  frame.frustumCulled = false;
  g.add(frame);
  const grid = [];
  const step = 600;
  for (let x = -Lh / 2; x <= Lh / 2 + 1; x += step) grid.push(x, 1, -Wh / 2, x, 1, Wh / 2);
  for (let z = -Wh / 2; z <= Wh / 2 + 1; z += step) grid.push(-Lh / 2, 1, z, Lh / 2, 1, z);
  const gg = new LineSegmentsGeometry();
  gg.setPositions(grid);
  const gl = new LineSegments2(gg, M.grid);
  gl.renderOrder = 2;
  gl.frustumCulled = false;
  g.add(gl);
  // the emergency lights: dim points high on the walls
  const pos = [];
  const k = [];
  for (let i = 0; i <= nFr; i++) {
    const x = -Lh / 2 + (i * Lh) / nFr;
    for (const z of [Wh / 2, -Wh / 2]) {
      pos.push(x, eave * 0.82, z);
      k.push(0.8, 40);
    }
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  lg.setAttribute("aK", new THREE.Float32BufferAttribute(k, 2));
  const lamps = new THREE.Points(lg, M.hallLamps);
  lamps.renderOrder = 8;
  lamps.frustumCulled = false;
  g.add(lamps);
  return { g };
}

/** The apron at night: the marks on the ground, the terminal's glass front behind the plane, the jet bridge to 1L. */
function buildApron(M) {
  const g = new THREE.Group();
  const marks = [];
  marks.push(-9000, 1, 0, 4500, 1, 0); // the lead-in line
  marks.push(-3720, 1, -260, -3720, 1, 260); // the stop bar, ahead of the nose
  for (const z of [-4500 + 600, 3800]) marks.push(-9000, 1, z, 9000, 1, z); // the service road
  const sx = 4300;
  const sz = 3400;
  marks.push(-sx, 1, -sz, sx, 1, -sz, sx, 1, -sz, sx, 1, sz, sx, 1, sz, -sx, 1, sz, -sx, 1, sz, -sx, 1, -sz);
  const mg = new LineSegmentsGeometry();
  mg.setPositions(marks);
  const ml = new LineSegments2(mg, M.ground);
  ml.renderOrder = 2;
  ml.frustumCulled = false;
  g.add(ml);
  // the terminal: a glass front, mullions every 4.5 m, two floors
  const T = [];
  const zT = APRON.terminal;
  for (let x = -9000; x <= 9000; x += 450) T.push(x, 0, zT, x, 1500, zT);
  for (const y of [0, 500, 1000, 1500]) T.push(-9000, y, zT, 9000, y, zT);
  T.push(-9000, 1500, zT, -9000, 1500, zT - 2500, 9000, 1500, zT, 9000, 1500, zT - 2500);
  const tg = new LineSegmentsGeometry();
  tg.setPositions(T);
  const tl = new LineSegments2(tg, M.hall);
  tl.renderOrder = 2;
  tl.frustumCulled = false;
  g.add(tl);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(18000, 1500).translate(0, 750, zT), M.terminal);
  front.renderOrder = 3;
  g.add(front);
  // the jet bridge: its rotunda, its tunnel in three telescoping sections, its drive column, its cab
  const B = APRON.bridge;
  const [bx, by, bz] = B.from;
  const bridge = new THREE.Group();
  g.add(bridge);
  const bPanes = [];
  const bLines = [];
  const tubeBox = (z0, z1, w, h) => {
    const geo = new THREE.BoxGeometry(w, h, Math.abs(z1 - z0));
    const m = new THREE.Mesh(geo, M.bridgeGlass);
    m.position.set(bx, by + h / 2 - 20, (z0 + z1) / 2);
    m.frustumCulled = false;
    const e = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(geo)), M.bridgeLines);
    e.renderOrder = 2;
    m.add(e);
    bPanes.push(m);
    return m;
  };
  const rot = new THREE.Mesh(cyl(160, by + 280, 4, 40), M.bridgeGlass);
  rot.position.set(bx, (by + 280) / 2, bz + 260);
  const rotE = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(new THREE.CylinderGeometry(160, 160, by + 280, 12, 1))), M.bridgeLines);
  rotE.renderOrder = 2;
  rot.add(rotE);
  bridge.add(rot);
  const s1 = tubeBox(bz + 100, bz - 800, 300, 320);
  const s2 = tubeBox(0, -800, 280, 300);
  const s3 = tubeBox(0, -760, 260, 280);
  const cab = tubeBox(0, -260, 330, 330);
  bridge.add(s1, s2, s3, cab);
  const col = new THREE.Group();
  const colPart = makePart("bridge-col");
  col.add(colPart);
  addMesh(colPart, box(40, by - 40, 40, 4), M.steel, { pos: [0, (by - 40) / 2, 0], edgeOpacity: 0.5 });
  for (const dx of [-70, 70]) addMesh(colPart, cyl(40, 30, 2, 28).rotateZ(Math.PI / 2), M.rubber, { pos: [dx, 40, 0], edgeOpacity: 0.4 });
  bridge.add(col);
  return { g, bridge, s2, s3, cab, col, bz, bPanes, bLines };
}

/** The sky: black, a thin horizon, and Manchester's morning — a low band of ink ahead (never a colour). */
const skyMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: { uInk: { value: INK.clone() }, uDawn: { value: 0 }, uLine: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uDawn, uLine; varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float up = max(d.y, 0.0);
        float line = uLine * 0.03 * exp(-abs(d.y) / 0.0025);
        float az = atan(d.z, -d.x);
        float band = uDawn * (0.05 + 0.06 * exp(-az * az / 0.6)) * exp(-up / 0.05) * smoothstep(-0.02, 0.003, d.y);
        float glow = uDawn * 0.012 * exp(-up / 0.3) * step(0.0, d.y);
        gl_FragColor = vec4(uInk * (line + band + glow), 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the set */

export function buildAvion() {
  const group = new THREE.Group();
  group.name = "avion";

  /* ── the materials, shared by the three airliners (one is shown at a time) ── */
  const M = {
    hull: glass(BRAND.ink, { base: 0, rim: 0.11, power: 3, edge: 0.3, spec: 0.22, through: 0.2 }),
    wings: glass(BRAND.ink, { base: 0.002, rim: 0.09, power: 2.6, edge: 0.28, spec: 0.25, through: 0.18 }),
    pax: glass(BRAND.ink, { base: 0.004, rim: 0.3, power: 2.2, edge: 0.18 }),
    pilot: glass(BRAND.ink, { base: 0.03, rim: 0.5, power: 2, edge: 0.3, spec: 0.3 }),
    dashGlass: glass(BRAND.ink, { base: 0, rim: 0.12, power: 2.6, edge: 0.32, spec: 0.2, through: 0.2 }),
    bridgeGlass: glass(BRAND.ink, { base: 0.006, rim: 0.06, power: 2.5, edge: 0.15 }),
    frames: lineMat(BRAND.ink, 1.8, { opacity: 0.2 }),
    outline: lineMat(BRAND.ink, 2.1, { opacity: 0.6 }),
    mark: lineMat(BRAND.veille, 3, { opacity: 1 }),
    ground: lineMat(BRAND.ink, 1.8, { opacity: 0.16, fog: true }),
    paint: lineMat(BRAND.ink, 2.2, { opacity: 0.3, fog: true }),
    grid: lineMat(BRAND.ink, 1.8, { opacity: 0.09, fog: true }),
    hall: lineMat(BRAND.ink, 1.9, { opacity: 0.2, fog: true }),
    dashLines: lineMat(BRAND.ink, 1.9, { opacity: 0.45 }),
    bridgeLines: lineMat(BRAND.ink, 1.9, { opacity: 0.42 }),
    nacelle: solid(0x7a8187, { rough: 0.5, metal: 0.3, coat: 0.3, coatRough: 0.45 }),
    steel: solid(0x7d858b, { rough: 0.45, metal: 0.4, env: 1 }),
    hub: solid(0xa9b0b4, { rough: 0.4, metal: 0.35, env: 1.1 }),
    rubber: solid(0x2b3034, { rough: 0.9, env: 0.5 }),
    leaf: solid(0x3b4146, { rough: 0.6, metal: 0.2, double: true }),
    windows: windowMat(),
    cabinSmoke: cabinSmokeMat(),
    emerg: lampMat(BRAND.ink),
    lamps: lampMat(BRAND.ink),
    hallLamps: lampMat(BRAND.ink),
    lipGlow: new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
    mask: new THREE.MeshBasicMaterial({ color: 0x050607, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide, fog: false }),
    terminal: new THREE.MeshBasicMaterial({ color: new THREE.Color(BRAND.ink).multiplyScalar(0.018), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }),
  };
  M.emerg.uniforms.uMax.value = 9;
  M.hallLamps.uniforms.uMax.value = 10;

  /* ── the three airliners ── */
  const planes = VARIANT_KEY.map((k) => buildPlane(k, M));
  const doorAnchors = {};
  const footAnchors = {};
  for (const pl of planes) {
    group.add(pl.g);
    Object.assign(doorAnchors, pl.doorAnchors);
    Object.assign(footAnchors, pl.footAnchors);
  }

  /* ── the fire outside, its plume and embers, its light; the cabin fire's place per site ── */
  const fire = makeFire(48);
  const plume = makePlume(44);
  const embers = makeEmbers(70, 47);
  const fireLight = new THREE.PointLight(BRAND.signal, 0, 0, 2);
  group.add(fire.mesh, plume.mesh, embers.points, fireLight);
  const A_fire = new THREE.Object3D();
  group.add(A_fire);

  /* ── the evacuees, the one hurt ── */
  const crowdMax = Math.max(...VARIANT_KEY.map((k) => SPEC[k].crowd));
  const crowd = makeCrowd(crowdMax);
  const hurt = new THREE.Group();
  {
    const mat = glass(BRAND.signal, { base: 0.08, rim: 0.6, power: 2, edge: 0.3 });
    hurt.userData.mat = mat;
    const parts = [
      new THREE.CapsuleGeometry(18, 42, 4, 12).scale(1, 1, 0.7).rotateX(-0.35).translate(0, 62, -6),
      new THREE.SphereGeometry(12, 14, 10).translate(0, 108, -18),
      new THREE.CapsuleGeometry(8, 60, 3, 8).rotateX(Math.PI / 2).translate(-10, 14, 32),
      new THREE.CapsuleGeometry(8, 60, 3, 8).rotateX(Math.PI / 2).translate(10, 14, 32),
    ];
    for (const geo of parts) {
      const m = new THREE.Mesh(geo, mat);
      m.renderOrder = 8;
      hurt.add(m);
    }
    const halo = glowSprite(220);
    halo.position.set(0, 50, 0);
    hurt.add(halo);
    hurt.userData.halo = halo;
    hurt.visible = false;
  }

  /* ── the Dash 8, the sites, the sky ── */
  const dash = buildDash(M);
  const runway = buildRunway(M);
  const hangar = buildHangar(M);
  const apron = buildApron(M);
  runway.track.add(dash.g);
  dash.g.position.x = DASH.x;
  group.add(runway.g, hangar.g, apron.g, dash.fire.mesh, dash.embers.points);
  // the Dash 8 stands on the runway at every site that has one; the track slides even where the runway's lines are off
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), skyMat());
  sky.frustumCulled = false;
  sky.renderOrder = 100;
  group.add(sky);
  const thump = glowSprite(400);
  group.add(thump);

  /* ── the anchors the chapters read ── */
  const engineR = new THREE.Object3D();
  const nose = new THREE.Object3D();
  const gather = new THREE.Object3D();
  gather.position.set(...GATHER.at);
  const cockpitA = new THREE.Object3D();
  group.add(engineR, nose, gather, cockpitA);

  /* ── which group each door belongs to, per site; each plane's crowd lanes ── */
  const roleOf = (siteKey, full) => {
    const o = OPEN[siteKey];
    return o.A.includes(full) ? "A" : o.B.includes(full) ? "B" : o.C.includes(full) ? "C" : o.shut.includes(full) ? "S" : null;
  };
  const roles = SITE_KEY.map((s) => planes.map((pl) => pl.doors.map((d) => roleOf(s, d.full))));
  const lanesOf = SITE_KEY.map((s, si) => planes.map((pl, vi) => pl.doors.map((d, i) => (d.slide && ["A", "B", "C"].includes(roles[si][vi][i]) ? i : -1)).filter((i) => i >= 0).slice(0, LANES)));
  // the crowd lives in the shown plane's frame
  for (const pl of planes) pl.crowdHome = pl.g;

  /* ── the slide's state from its door's number ── */
  const tmpV = V();
  function slideSet(sl, k, gulp, time, px, rollFirst) {
    const vis = k > 0.3;
    sl.group.visible = vis;
    if (!vis) return 0;
    const fall = smooth(0.3, 0.45, k);
    const unroll = smooth(0.45, 0.7, k);
    const tension = smooth(0.6, 1.0, k);
    const round = 0.4 + 0.6 * smooth(0.55, 0.95, k);
    sl.X.visible = round > 0.75;
    const steep = 70 * DEG;
    const th = lerp(steep, sl.final, tension);
    const room = (sl.door.sillY - sl.r * 0.6) / Math.max(Math.sin(th), 1e-3);
    const cut = Math.min(unroll * sl.L, room, sl.L);
    sl.U.uCut.value = Math.max(1, cut);
    sl.U.uRound.value = round;
    sl.U.uLamp.value = smooth(0.5, 0.8, k);
    sl.tilt.rotation.x = th;
    // the tilt frame sits just outside and under the sill once the pack has dropped
    const hx = 0;
    const hy = lerp(30, -10, fall);
    const hz = lerp(-40, 14, fall);
    sl.tilt.position.set(hx, hy, hz);
    sl.tilt.visible = unroll > 0.001;
    // the pack: falls, then rides the front edge with what is still folded
    const left = clamp01(1 - cut / sl.L);
    const sx = lerp(100, sl.w * 0.96, smooth(0.45, 0.56, k));
    const sy = 18 + 30 * Math.sqrt(left);
    const sz = 22 + 24 * Math.sqrt(left);
    sl.bundle.scale.set(sx, sy, sz);
    const c = Math.cos(th);
    const s = Math.sin(th);
    sl.part.position.set(hx, hy - cut * s + sy * 0.4 * c, hz + cut * c + sy * 0.4 * s);
    sl.part.rotation.x = unroll > 0.001 ? th : lerp(0, 0.4, fall);
    sl.part.visible = left > 0.025 || unroll < 0.001;
    // the air it swallows: toward the head, while it inflates
    const ga = gulp * smooth(0.38, 0.5, k) * (rollFirst ? 1 : 1);
    sl.gulp.mesh.visible = ga > 0.003;
    if (sl.gulp.mesh.visible) {
      const U = sl.gulp.uniforms;
      U.uAmount.value = ga;
      U.uTime.value = time;
      U.uSpread.value = sl.w * 0.32;
      tmpV.set(0, sl.r * 0.8, 70).applyAxisAngle(AX, th);
      U.uAt.value.set(hx + tmpV.x, hy + tmpV.y, hz + tmpV.z);
    }
    return smooth(0.93, 1.0, k);
  }
  const AX = V(1, 0, 0);

  /* ───────────────────────────────────────────────────────── set: every number, every frame (no allocation) */
  let shownCrowd = null;
  function set(p = {}, time = 0, px = 2000) {
    const v = Math.min(2, Math.max(0, Math.round(p.variant ?? 0)));
    const site = Math.min(3, Math.max(0, Math.round(p.site ?? 0)));
    const siteKey = SITE_KEY[site];
    const amount = clamp01(p.amount ?? 1);
    const alt = p.alt ?? 0;
    const pl = planes[v];
    const P = pl.P;
    planes.forEach((q, i) => {
      q.g.visible = i === v;
      q.g.position.y = alt;
    });
    if (shownCrowd !== pl) {
      pl.g.add(crowd.mesh, crowd.bags, hurt);
      shownCrowd = pl;
    }

    /* the X-ray */
    for (const mat of [M.hull, M.wings]) mat.uniforms.uAmount.value = amount;
    M.frames.opacity = M.frames.userData.base * amount;
    M.outline.opacity = M.outline.userData.base * amount;
    M.mask.opacity = 0.8 * amount * (1 - 0.65 * clamp01(p.pilots ?? 0));
    M.pax.uniforms.uAmount.value = clamp01(p.pax ?? 0) * Math.max(amount, 0.35);

    /* the cabin seen from outside: lights, emergency lights, smoke, the breach */
    const lights = clamp01(p.lights ?? 0);
    const emerg = clamp01(p.emerg ?? 0);
    const smoke = Math.max(0, p.smoke ?? 0);
    const breach = clamp01(p.breach ?? 0);
    const levelOf = (floorY, ceil) => floorY + ceil - (ceil - 120) * Math.min(smoke, 1) - 60 * clamp01((smoke - 1) * 2) + (smoke < 0.02 ? 400 : 0);
    const W = M.windows.uniforms;
    W.uLights.value = lights;
    W.uEmerg.value = emerg;
    W.uAmount.value = lerp(0.45, 1, amount);
    W.uSmokeY.value = levelOf(P.floor, pl.S.ceil);
    W.uSmokeU.value = P.upper ? levelOf(P.upper, pl.S.ceilU) : 1e5;
    W.uUpper.value = P.upper ? P.upper - 10 : 1e5;
    W.uBreach.value = breach;
    W.uTime.value = time;
    const fireX = site === 2 ? P.engines.x + P.engines.len * 0.7 : P.wing.x + 300;
    W.uFireX.value = fireX;
    W.uLen.value = pl.winLen;
    const C = M.cabinSmoke.uniforms;
    C.uAmount.value = smoke > 0.02 ? clamp01(smoke * 3) : 0;
    C.uSmokeY.value = W.uSmokeY.value;
    C.uSmokeU.value = W.uSmokeU.value;
    C.uUpper.value = W.uUpper.value;
    C.uFloor.value = P.floor;
    C.uTime.value = time;
    C.uFireX.value = fireX;
    C.uBreach.value = breach;
    C.uLen.value = pl.winLen;
    if (breach > 0.002) C.uAmount.value = Math.max(C.uAmount.value, 1);
    M.emerg.uniforms.uAmount.value = emerg * (1 - 0.6 * clamp01(smoke - 0.6)) * 1.2;
    M.emerg.uniforms.uScale.value = px;

    /* the doors and their slides */
    const shut = clamp01(p.shut ?? 0);
    const gulp = clamp01(p.gulp ?? 0);
    const mark = Math.round(p.mark ?? 0);
    const bridge = clamp01(p.bridge ?? 0);
    const disarmed = site === 3 ? smooth(0.35, 0.6, bridge) : 0;
    const R = roles[site][v];
    const breath = 0.86 + 0.14 * Math.sin(time * 1.1);
    pl.doors.forEach((d, i) => {
      const role = R[i];
      const k = role === "A" ? p.doorA ?? 0 : role === "B" ? p.doorB ?? 0 : role === "C" ? p.doorC ?? 0 : 0;
      // the outline: ink; signal while shut on the fire (Haneda) or jammed (Manchester's 1R); signal and crossed — the
      // condemned doors of the trial (hangar), on both decks: lines only, never a fill
      const jam = role === "C" && site === 2 ? smooth(0.03, 0.06, k) * (1 - smooth(0.3, 0.36, k)) : 0;
      const fireShut = role === "S" && site === 0 ? shut : 0;
      const condemned = role === "S" && site === 1 ? shut : 0;
      const hot = Math.max(jam, fireShut, condemned);
      d.mat.color.copy(INK).lerp(SIGNAL, hot);
      if (condemned > 0) d.mat.color.multiplyScalar(1 + 0.25 * condemned);
      d.mat.opacity = lerp(0.55, 0.95, hot) * Math.max(amount, 0.4);
      d.mat.linewidth = lerp(2, 3, condemned);
      d.cross.visible = condemned > 0.02;
      d.ring.visible = mark === 1 + 2 * d.index + (d.side > 0 ? 0 : 1);
      d.flame.visible = fireShut > 0.01;
      if (d.flame.visible) d.flame.material.color.copy(SIGNAL).multiplyScalar(1.3 * fireShut * breath);
      // the leaf: out, then forward; jammed: ajar; the hatch: taken in
      let swing = 0;
      if (role === "C" && site === 2) swing = 0.16 * smooth(0.0, 0.05, k) + 0.84 * smooth(0.3, 0.36, k);
      else swing = ramp(k, 0, 0.3);
      d.leafPart.visible = swing > 0.002;
      if (d.leafPart.visible) {
        if (d.hatch) {
          const u = smooth(0, 1, swing);
          d.leafPart.position.set(0, -12 * u, -60 * u);
          d.leafPart.scale.set(1, 1 - smooth(0.7, 1, swing), 1);
        } else {
          const out = smooth(0, 0.3, swing);
          const turn = smooth(0.25, 1, swing);
          d.leafPart.position.set(0, 4 * out, 26 * out);
          d.leafPart.rotation.y = -168 * DEG * turn;
          d.leafPart.scale.set(1, 1, 1);
        }
      }
      if (d.slide) {
        const sk = role === "C" && site === 2 && k < 0.3 ? 0 : k;
        d.open = slideSet(d.slide, sk * (1 - disarmed), gulp, time, px) || 0;
        d.slide.group.visible = d.slide.group.visible && sk * (1 - disarmed) > 0.3;
        // the jammed pack, stuck in the sill (Manchester's 1R)
        if (jam > 0.01 && d.slide) {
          d.slide.group.visible = true;
          d.slide.tilt.visible = false;
          d.slide.gulp.mesh.visible = false;
          d.slide.part.visible = true;
          d.slide.bundle.scale.set(100, 45, 32);
          d.slide.part.position.set(0, 10, 2);
          d.slide.part.rotation.x = 0.2;
        }
      } else d.open = 0;
    });

    /* the evacuees */
    const lanes = lanesOf[site][v];
    const CU = crowd.uniforms;
    const evac = clamp01(p.evac ?? 0);
    CU.uEvac.value = evac;
    CU.uN.value = pl.S.crowd;
    CU.uNs.value = lanes.length;
    CU.uMode.value = site === 0 ? 1 : 0;
    CU.uBags.value = clamp01(p.bags ?? 0);
    CU.uAmount.value = 1;
    for (let j = 0; j < LANES; j++) {
      const di = lanes[j];
      if (di === undefined) {
        CU.uOpen.value[j] = 0;
        continue;
      }
      const d = pl.doors[di];
      const sl = d.slide;
      CU.uOpen.value[j] = d.open;
      CU.uLaneW.value[j] = sl.double ? sl.w * 0.19 : 0;
      const out = d.side;
      CU.uOut.value[j].set(0, 0, out);
      const th = sl.final;
      CU.uHead.value[j].set(d.x, d.sillY - Math.sin(th) * 90 + sl.yBed + 4, d.sillZ + out * (14 + Math.cos(th) * 90));
      CU.uFoot.value[j].set(d.x, Math.max(4, sl.yBed + 4), d.sillZ + out * (d.reach - 40));
      if (site === 0 && out < 0) CU.uCtrl.value[j].set(P.nose - 1500, 0, -800);
      else CU.uCtrl.value[j].set(d.x, 0, d.sillZ + out * (d.reach + 700));
    }
    const anyCrowd = lanes.length > 0 && evac > 0.0005;
    crowd.mesh.visible = anyCrowd;
    crowd.bags.visible = anyCrowd && CU.uBags.value > 0.001;
    // the one hurt: sitting at the foot of the first slide, signal
    const hk = clamp01(p.hurt ?? 0);
    hurt.visible = hk > 0.01 && lanes.length > 0;
    if (hurt.visible) {
      const d = pl.doors[lanes[0]];
      hurt.position.set(d.x + 260, 0, d.sillZ + d.side * (d.reach + 120));
      hurt.rotation.y = d.side > 0 ? 0.6 : Math.PI + 0.6;
      hurt.userData.mat.uniforms.uAmount.value = hk;
      hurt.userData.halo.visible = true;
      hurt.userData.halo.material.color.copy(SIGNAL).multiplyScalar(0.35 * hk * breath);
    }

    /* the engines: the right one still turning (Tokyo); the 737's left one fails (Manchester) */
    const spin = clamp01(p.spin ?? 0);
    for (const e of pl.engines) {
      const right = e.s < 0 && e.inner;
      const life = right ? spin : 0;
      e.fan.uniforms.uLife.value = life;
      e.fan.uniforms.uPhase.value = right ? time * 0.11 * (1 - smooth(0.2, 0.8, spin)) : 0;
      e.lip.visible = right && spin > 0.01;
      e.mouth.visible = right && spin > 0.01;
      if (e.mouth.visible) e.mouth.material.color.copy(SIGNAL).multiplyScalar(0.55 * spin * (0.88 + 0.12 * Math.sin(time * 0.9)));
    }
    M.lipGlow.color.copy(SIGNAL).multiplyScalar(0.9 * spin);
    const th = clamp01(p.thump ?? 0);
    thump.visible = th > 0.004 && v === 2;
    if (thump.visible) {
      const e = pl.engines.find((q) => q.s > 0);
      thump.position.set(P.engines.x + P.engines.len * 0.55, P.engines.y + alt, P.engines.z[0] + 40);
      thump.scale.setScalar(260 + 520 * th);
      thump.material.color.copy(INK).lerp(SIGNAL, 0.55).multiplyScalar(2.2 * th);
      void e;
    }

    /* the fire outside, its plume, its light */
    const fk = clamp01(p.fire ?? 0);
    const F = fire.uniforms;
    let R0;
    if (site === 2) {
      // Manchester: the left engine and the wing over it, the fire trailing aft
      R0 = 190;
      F.uC.value.set(P.engines.x + P.engines.len * 0.8, P.engines.y * 0.55 + alt, P.engines.z[0] + 20);
      F.uShape.value.set(1.9, 1.1, 1.0);
    } else {
      // Haneda (and anywhere else): under the fuselage at the wing's root, left and under
      R0 = 260;
      F.uC.value.set(P.wing.x + 250, 120 + alt, pl.P.r * 0.55);
      F.uShape.value.set(2.6, 1.1, 1.35);
    }
    const Rf = R0 * (0.45 + 0.55 * Math.pow(fk, 0.8));
    F.uR.value = Rf;
    F.uFire.value = fk;
    F.uTime.value = time;
    F.uJit.value = (time * 556.2) % 1;
    fire.mesh.visible = fk > 0.004;
    A_fire.position.copy(F.uC.value);
    const PL = plume.uniforms;
    PL.uAmount.value = smooth(0.05, 0.5, fk);
    PL.uBase.value.copy(F.uC.value);
    PL.uBase.value.y += Rf * F.uShape.value.y * 1.0;
    PL.uH.value = 900 + 2600 * fk;
    PL.uR0.value = Rf * (site === 2 ? 1.1 : 1.6);
    PL.uGrow.value = 0.32;
    PL.uLean.value.set(site === 2 ? 0.55 : 0.32, site === 2 ? -0.15 : -0.12);
    PL.uTime.value = time;
    PL.uJit.value = (time * 431.7) % 1;
    plume.mesh.visible = PL.uAmount.value > 0.004;
    const EU = embers.uniforms;
    EU.uT.value = time;
    EU.uScale.value = px;
    EU.uAmount.value = smooth(0.05, 0.4, fk);
    EU.uC.value.copy(F.uC.value);
    EU.uR.value = Rf;
    EU.uShape.value.copy(F.uShape.value);
    embers.points.visible = fk > 0.004;
    fireLight.position.copy(F.uC.value);
    fireLight.position.y += Rf * 1.2;
    fireLight.intensity = fk > 0.004 ? 2.6e5 * Math.pow(fk, 1.2) * (0.95 + 0.05 * Math.sin(time * 1.3)) : 0;

    /* the pilots */
    const pk = clamp01(p.pilots ?? 0);
    pl.pilots.visible = pk > 0.004;
    M.pilot.uniforms.uAmount.value = pk;
    pl.pilots.userData.panel.visible = pk > 0.004;
    pl.pilots.userData.panel.material.color.copy(INK).multiplyScalar(0.35 * pk);

    /* the sites */
    const runOn = site === 0 || site === 2;
    runway.g.visible = true;
    runway.slide.visible = runOn;
    runway.g.children[0].visible = runOn;
    const r = p.run ?? 0;
    const per = RUNWAY.pitch;
    // the plane runs toward −x: what lies on the runway comes toward +x as `run` grows. The Dash 8 stands at
    // x = DASH.x + run − 2·DASH.hit: at DASH.hit its tail meets the nose (x = DASH.x − DASH.hit), as runAt expects
    runway.slide.position.x = ((r % per) + per) % per;
    runway.track.position.x = r - 2 * DASH.hit;
    M.lamps.uniforms.uAmount.value = site === 2 ? 0.45 : 1.15;
    M.lamps.uniforms.uScale.value = px;
    M.hallLamps.uniforms.uAmount.value = 0.9;
    M.hallLamps.uniforms.uScale.value = px;
    hangar.g.visible = site === 1;
    apron.g.visible = site === 3;
    sky.material.uniforms.uDawn.value = site === 2 ? 1 : 0;
    sky.material.uniforms.uLine.value = site === 1 ? 0 : site === 2 ? 1.4 : 0.7;
    sky.visible = site !== 1;
    // the jet bridge: its sections telescope toward the door
    {
      const b = smooth(0, 1, bridge);
      apron.bridge.visible = site === 3 && bridge > 0.002;
      const head = lerp(apron.bz - 1200, P.r + 15, b); // where the cab's face stands (z)
      const z1 = apron.bz - 800;
      const span = z1 - head;
      apron.s2.position.z = z1 - span * 0.3;
      apron.s3.position.z = z1 - span * 0.65;
      apron.cab.position.z = head + 130;
      apron.col.position.set(APRON.bridge.from[0], 0, z1 - span * 0.55);
      M.bridgeGlass.uniforms.uAmount.value = 1;
    }

    /* the Dash 8 */
    const dk = p.dash ?? 0;
    dash.g.visible = dk > 0.01 && runOn;
    if (dash.g.visible) {
      const wreck = smooth(1.15, 1.8, dk);
      M.dashGlass.uniforms.uAmount.value = lerp(1, 0.35, wreck);
      M.dashLines.opacity = M.dashLines.userData.base * lerp(1, 0.4, wreck);
      dash.g.rotation.y = 0.45 * wreck;
      dash.g.rotation.z = -0.05 * wreck;
      dash.g.position.y = -30 * wreck;
      const DF = dash.fire.uniforms;
      DF.uFire.value = wreck;
      DF.uR.value = 70 + 25 * wreck;
      DF.uC.value.set(DASH.x + r - 2 * DASH.hit - DASH.len * 0.45, 30, 0);
      DF.uShape.value.set(2.6, 0.55, 1.5);
      DF.uTime.value = time;
      DF.uJit.value = (time * 377.3) % 1;
      dash.fire.mesh.visible = wreck > 0.01;
      const DE = dash.embers.uniforms;
      DE.uT.value = time;
      DE.uScale.value = px;
      DE.uAmount.value = wreck * 0.7;
      DE.uC.value.copy(DF.uC.value);
      DE.uR.value = DF.uR.value;
      DE.uShape.value.copy(DF.uShape.value);
      dash.embers.points.visible = wreck > 0.01;
    }
    if (!dash.g.visible) {
      dash.fire.mesh.visible = false;
      dash.embers.points.visible = false;
    }

    /* the anchors */
    const er = pl.engines.find((q) => q.s < 0 && q.inner);
    engineR.position.set(P.engines.x, P.engines.y + alt, -P.engines.z[0]);
    void er;
    nose.position.set(P.nose, P.axis + alt, 0);
    cockpitA.position.set(pl.pilots.userData.at[0], pl.pilots.userData.at[1] + alt, 0);
  }
  set();

  return {
    group,
    A: {
      door: (variant, id) => doorAnchors[`${variant}:${id}`],
      foot: (variant, id) => footAnchors[`${variant}:${id}`],
      engineR, nose, gather, cockpit: cockpitA, fire: A_fire,
    },
    set,
  };
}
