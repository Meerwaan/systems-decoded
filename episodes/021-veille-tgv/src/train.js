// DOSSIER 021 — the line and its train: a TGV Duplex like an X-ray, at night on the high-speed line.
//
//   buildTrain() → { group, mount, A, update(P, time, px) }
//   P = { run, kmh, shell, cab, pax, you, phone, traction, brake, radio, display, mood }   (their meaning: FIRST, in world.js)
//
// THE TRAIN STANDS STILL at the origin, nose toward −x, its LEFT side toward +z (the camera's side); the world comes
// to it: `run` (true metres) slides everything of the line toward +x. Two power cars and eight double-deck trailers at
// true scale, a shell of glass and fine lines — and SOLID inside only what the story is about:
//   · the cab: its EMPTY seat (the brightest thing in the night, lit by the desk), the desk of glass with its knee
//     space open toward the seat (the system stands in it: `mount`), the speed display, the back wall and its door,
//     CLOSED. Nobody, ever (docs/021-decors.md, « le tact »).
//   · the traction chain: the pantograph up against the contact wire, the roof line, the transformer, the motor
//     blocks of the power car's bogies — and the current flowing in it, heads of ink light (`traction`).
//   · the brake pipe under the floors, and every bogie's wheels, discs and pads (`brake`).
//   · the radio antenna on the roof (`radio`); the 393 passengers as small heads of glass (`pax`); you at a window.
// The line: two tracks (rails drawn solid with a bright head line; sleepers and ballast drawn in ONE ground shader,
// smeared along their way by the speed, so nothing fine hops from frame to frame), the far-side masts every 63 m
// and their arms over both tracks, the contact wire (a continuous line), the fields' grid to the horizon, a dome of
// night with a low band of ink at the horizon. Everything periodic wraps on `run` (negative allowed).
//
// Draw order (what a shell of glass hides): solids and opaque shaders first; then the ground (1), lines (2–3),
// current (5), halos (6), radio (7), passengers (8), you (9–10), the cab's glass (13–14), windows (17–18),
// the hull (19–20), the night (100).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, setGlow, glass, asShell, lineMat, edgesOf, box, cyl, lathe, plate, anchor, makePart, addMesh, mergeGeometries } from "@kit/build3d.js";
import { TRACK, CATENARY, WORLD, POWER, CAB, ANTENNA, PANTO, TRACTION, BOGIES, PIPE, TRAILERS, REAR, DECKS, PAX, YOU, CAB_PEDAL } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
// the key light's direction (stage.js): the opaque shaders of the line shade by it
const KEY = V(-30, 52, 38).normalize();
// everything periodic of the line wraps on this (cm): masts 6 300, fields 4 000 / 1 000, sleepers 60, ballast 40
const LOOP = 252000;

/* ───────────────────────────────────────────────────────────── shapes */

// a smooth curve through [x, value] knots (the idiom of 007 and 015)
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

/** A skin through rows of points (`rows[i][j]` = [x, y, z]); `wrap`: each row closes on itself. */
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

/** A surface sampled on a (u, v) grid: `fn(u, v)` → [x, y, z]. */
function grid(fn, nu, nv) {
  const pos = [];
  const index = [];
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) pos.push(...fn(i / nu, j / nv));
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const a = i * (nv + 1) + j;
      const b = a + nv + 1;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

/* ── the sections. Each is a super-ellipse: half-width `w`, widest at `mid`, `up` above it and `down` below,
      `eu` / `el` how square its upper and lower halves are (0.25 a box with round corners → 1 an ellipse).
      The sides lean in toward the roof (tumblehome). Angle a: 0 → +z (the left side), π/2 → the top. ── */
const TUMBLE = 0.1;
function onSec(s, a) {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  const up = sn >= 0;
  const e = up ? s.eu : s.el;
  const cc = Math.sign(c) * Math.abs(c) ** e;
  const ss = Math.sign(sn) * Math.abs(sn) ** e;
  const th = up ? 1 - TUMBLE * Math.abs(sn) ** 1.5 : 1;
  return [s.x, s.mid + (up ? s.up : s.down) * ss, s.w * cc * th];
}
/** Where the side of a section is at height y (z ≥ 0). */
function zOnSide(s, y) {
  if (y >= s.mid) {
    const sa = clamp01((y - s.mid) / s.up) ** (1 / s.eu);
    return s.w * Math.sqrt(Math.max(0, 1 - sa * sa)) ** s.eu * (1 - TUMBLE * sa ** 1.5);
  }
  const sa = clamp01((s.mid - y) / s.down) ** (1 / s.el);
  return s.w * Math.sqrt(Math.max(0, 1 - sa * sa)) ** s.el;
}

// THE POWER CAR (front one; the rear one is its mirror). Its nose: a long sloping bonnet from a rounded tip, the
// windscreen raked on (plan.js: CAB.screen, its foot and head), the roof. The tip stands 1.7 m ahead of POWER.nose:
// a bonnet of 1.4 m ahead of the windscreen is a toad, not a TGV (journal: « À changer ailleurs »).
const TIP = -1330;
const [SCREEN_X0, SCREEN_Y0, SCREEN_X1, SCREEN_Y1] = CAB.screen;
const PCF = {
  crest: spline([[TIP, 92], [TIP + 5, 110], [TIP + 18, 129], [-1240, 152], [-1160, 182], [-1060, 222], [SCREEN_X0, SCREEN_Y0], [-900, 320], [SCREEN_X1, SCREEN_Y1], [-800, 396], [-740, 404], [-660, POWER.roof], [1070, POWER.roof], [1100, POWER.roof - 8]]),
  sill: spline([[TIP, 88], [TIP + 5, 70], [TIP + 18, 54], [-1250, 42], [-1160, 37], [-900, 40], [-855, 50], [-818, 80], [-790, 95], [1100, 95]]),
  w: spline([[TIP, 5], [TIP + 5, 40], [TIP + 18, 70], [-1250, 102], [-1170, 123], [-1070, 137], [-960, 143], [-880, POWER.w / 2], [1060, POWER.w / 2], [1100, POWER.w / 2 - 4]]),
  mid: spline([[TIP, 0.5], [-1180, 0.42], [-960, 0.38], [-800, 0.36], [1100, 0.36]]),
  eu: spline([[TIP, 1], [-1180, 0.85], [-960, 0.66], [-820, 0.5], [-720, 0.42], [1100, 0.42]]),
  el: spline([[TIP, 0.9], [-1180, 0.55], [-900, 0.3], [1100, 0.25]]),
};
function pcSection(x) {
  const sill = PCF.sill(x);
  const crest = PCF.crest(x);
  const mid = sill + (crest - sill) * PCF.mid(x);
  return { x, w: PCF.w(x), mid, up: crest - mid, down: mid - sill, eu: PCF.eu(x), el: PCF.el(x) };
}
const PC_X = (() => {
  const xs = new Set();
  for (const d of [0, 0.8, 2.5, 5, 9, 14, 20, 28, 38, 50, 64, 80, 98, 118, 140, 165, 190, 220, 250, 280, 310, 340]) xs.add(TIP + d);
  for (let x = SCREEN_X0; x <= -700; x += 15) xs.add(x);
  for (let x = -680; x <= 1060; x += 60) xs.add(x);
  for (const x of [SCREEN_X1, -430, 1080, 1100]) xs.add(x);
  return [...xs].filter((x) => x <= 1100).sort((a, b) => a - b);
})();
const AROUND = 64;
const ANG = (j, n) => (2 * Math.PI * j) / n;

// THE TRAILERS: one section, the lower deck dropping low between the bogies, the ends rounded toward the gangways.
const AROUND_T = 48;
function carSection(x, a, b) {
  const e = Math.min(x - a, b - x);
  const low = smooth(250, 380, e);
  const crest = DECKS.roof - 14 * (1 - smooth(0, 60, e));
  const sill = lerp(104, 40, low);
  const mid = 212;
  return { x, w: DECKS.w / 2 - 6 * (1 - smooth(0, 45, e)), mid, up: crest - mid, down: mid - sill, eu: 0.4, el: lerp(0.3, 0.22, low) };
}
function carStations(a, b) {
  const xs = new Set();
  for (const e of [0, 4, 10, 18, 30, 45, 60, 100, 150, 200, 240, 260, 280, 300, 320, 340, 360, 380, 420]) {
    xs.add(a + e);
    xs.add(b - e);
  }
  for (let x = a + 500; x < b - 460; x += 90) xs.add(x);
  return [...xs].filter((x) => x >= a && x <= b).sort((p, q) => p - q);
}
const REAR_C = (REAR[0] + REAR[1]) / 2; // the rear power car is the front one turned around this x
const mirror = (pts) => pts.map(([x, y, z]) => [REAR_C - x, y, z]);
const MIRROR = new THREE.Matrix4().makeTranslation(REAR_C, 0, 0).multiply(new THREE.Matrix4().makeScale(-1, 1, 1));

/* ───────────────────────────────────────────────────────────── shaders */

// one soft light: a bright core in a long tail, always facing the eye (a lamp, the cab's air)
function haloMat(color, k) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color).multiplyScalar(k) }, uAmount: { value: 1 }, uSize: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uSize; varying vec2 vQ;
      void main() {
        vQ = position.xy;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vQ;
      void main() {
        if (uAmount < 0.003) discard;
        float r = length(vQ);
        float a = (0.9 * exp(-r * r / 0.004) + 0.22 * exp(-r / 0.2)) * (1.0 - smoothstep(0.75, 1.0, r));
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
}
function halo(parent, at, size, material) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.position.set(...at);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  mesh.onBeforeRender = () => (material.uniforms.uSize.value = size);
  parent.add(mesh);
  return mesh;
}

// the current: heads of light running along a conductor (its length `aS`, in cm), each with a short tail behind it;
// they move a twelfth of their spacing per frame, never more (CLAUDE.md, « des tirets qui courent »)
const flowMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone() }, uTime: { value: 0 }, uAmount: { value: 1 }, uSpeed: { value: 420 }, uPeriod: { value: 170 } },
    vertexShader: /* glsl */ `
      attribute float aS; varying float vS; varying float vF;
      void main() {
        vS = aS;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        vF = clamp(abs(dot(n, normalize(-mv.xyz))), 0.0, 1.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uAmount, uSpeed, uPeriod; varying float vS; varying float vF;
      void main() {
        if (uAmount < 0.003) discard;
        float f = fract((vS - uTime * uSpeed) / uPeriod);
        float head = pow(f, 7.0) * (1.0 - smoothstep(0.955, 1.0, f));
        float light = (0.22 + 2.4 * head) * (0.5 + 0.5 * vF);
        gl_FragColor = vec4(uColor * light * uAmount, 1.0);
      }`,
  });
function flowTube(points, r) {
  const path = new THREE.CurvePath();
  for (let i = 0; i < points.length - 1; i++) path.add(new THREE.LineCurve3(V(...points[i]), V(...points[i + 1])));
  const L = path.getLength();
  const geo = new THREE.TubeGeometry(path, Math.max(8, Math.ceil(L / 5)), r, 10, false);
  const uv = geo.attributes.uv;
  const s = new Float32Array(uv.count);
  for (let i = 0; i < uv.count; i++) s[i] = uv.getX(i) * L;
  geo.setAttribute("aS", new THREE.BufferAttribute(s, 1));
  return geo;
}

// the passengers: small heads and shoulders of glass, instanced — a rim, a lip, nothing inside: a crowd of outlines
const paxMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone() }, uPax: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aCar; uniform float uPax; varying vec3 vN; varying vec3 vV; varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        vV = normalize(-mv.xyz);
        vA = clamp((uPax * 1.35 - aCar) / 0.35, 0.0, 1.0); // car by car, front to back, as uPax rises
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV; varying float vA;
      void main() {
        if (vA < 0.003) discard;
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float light = 0.02 + 0.75 * pow(g, 2.0) + 0.7 * smoothstep(0.6, 0.94, g);
        gl_FragColor = vec4(uColor * light * vA, 1.0);
      }`,
  });

// the trailers' windows, lit faintly from inside, car by car with the passengers
const winGlowMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uPax: { value: 0 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aCar; attribute vec2 aQ; uniform float uPax; varying float vA; varying vec2 vQ;
      void main() {
        vA = clamp((uPax * 1.35 - aCar) / 0.35, 0.0, 1.0);
        vQ = aQ;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vA; varying vec2 vQ;
      void main() {
        float a = vA * uAmount;
        if (a < 0.003) discard;
        // brighter toward the middle of the pane, never a flat sticker
        vec2 q = abs(vQ * 2.0 - 1.0);
        float body = 1.0 - 0.45 * max(q.x * q.x, q.y * q.y);
        gl_FragColor = vec4(uColor * 0.075 * body * body * a, 1.0);
      }`,
  });

// the brake pipe: ink; behind the head of the emergency braking, veille
const pipeMat = () =>
  new THREE.ShaderMaterial({
    uniforms: { uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() }, uHead: { value: -1e6 }, uOn: { value: 0 }, uKey: { value: KEY } },
    vertexShader: /* glsl */ `
      varying float vX; varying vec3 vN;
      void main() {
        vX = (modelMatrix * vec4(position, 1.0)).x;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uVeille, uKey; uniform float uHead, uOn; varying float vX; varying vec3 vN;
      void main() {
        float lam = 0.55 + 0.45 * max(dot(normalize(vN), uKey), 0.0);
        float behind = (1.0 - smoothstep(uHead - 25.0, uHead + 25.0, vX)) * uOn;
        float head = exp(-max(uHead - vX, 0.0) / 240.0) * behind;
        vec3 col = mix(uInk * 0.3, uVeille * 0.62, behind) * lam + uVeille * 1.5 * head;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });

// the masts: an opaque, unlit ink shaded by the key, sinking into the fog, faded out before they wrap
const mastMat = () =>
  new THREE.ShaderMaterial({
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uInk: { value: INK.clone() }, uKey: { value: KEY.clone() } }]),
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uKey; uniform float fogDensity; varying vec3 vN; varying vec3 vW;
      void main() {
        float lam = 0.16 + 0.62 * max(dot(normalize(vN), uKey), 0.0);
        float dist = length(vW - cameraPosition);
        float fog = exp(-pow(dist * fogDensity, 2.0));
        float ends = 1.0 - smoothstep(56000.0, 76000.0, abs(vW.x));
        gl_FragColor = vec4(uInk * 0.34 * lam * fog * ends, 1.0);
      }`,
  });

// THE GROUND, in one shader: on each track the sleepers (60 cm apart) and the ballast; around it the fields' grid
// to the horizon. Everything that crosses the line of travel is box-filtered over the way it goes during the
// shutter (`uSmear`, cm): at 255 km/h the sleepers are an even band, at 0 they are sharp — never bars that hop.
const groundMat = () =>
  new THREE.ShaderMaterial({
    fog: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { uInk: { value: INK.clone() }, uRun: { value: 0 }, uSmear: { value: 0 }, uAmount: { value: 1 }, uTip: { value: TIP }, uOther: { value: TRACK.other } },
    ]),
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uRun, uSmear, uAmount, uTip, uOther, fogDensity; varying vec3 vW;
      // a family of lines 1.8 px wide, spread over the smear with the same light
      float lines(float x, float cell, float smear) {
        float q = x / cell;
        float w = max(fwidth(q) * 1.8, 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        float reach = max(w, 0.5 * smear / cell);
        return (w / reach) * (1.0 - smoothstep(reach - w, reach, d));
      }
      // a size of grid leaves before its cells get too small to draw: no shimmer, no grey slab at the horizon
      float lod(float x, float cell) { return smoothstep(5.0, 14.0, cell / max(fwidth(x), 1e-4)); }
      // how much of [x − s/2, x + s/2] bars [0, w] (one every P) cover: exact, so a moving bar never hops
      float bars(float x, float P, float w, float S) {
        float s = max(S, fwidth(x) * 1.2);
        float a = x - 0.5 * s;
        float b = x + 0.5 * s;
        float Fa = floor(a / P) * w + min(mod(a, P), w);
        float Fb = floor(b / P) * w + min(mod(b, P), w);
        return clamp((Fb - Fa) / s, 0.0, 1.0);
      }
      float band(float z, float hw) { float f = max(fwidth(z), 1e-3); return 1.0 - smoothstep(hw - f, hw + f, abs(z)); }
      float edge(float z, float at) { float f = max(fwidth(z), 1e-3) * 1.8; return 1.0 - smoothstep(0.0, f, abs(abs(z) - at)); }
      void main() {
        float x = vW.x - uRun;
        float z = vW.z;
        float dist = length(vW - cameraPosition);
        float fog = exp(-pow(dist * fogDensity, 2.0));
        float bed = 0.0;
        for (int k = 0; k < 2; k++) {
          float dz = z - (k == 0 ? 0.0 : uOther);
          float sleepers = bars(x + 18.0, 60.0, 24.0, uSmear) * band(dz, 130.0);
          float ballast = band(dz, 175.0);
          float grain = max(lines(x, 40.0, uSmear), lines(dz, 40.0, 0.0)) * min(lod(x, 40.0), lod(dz, 40.0));
          bed += sleepers * 0.13 + ballast * (0.016 + 0.03 * grain) + edge(dz, 175.0) * 0.1;
        }
        // the headlights' pool on our track, ahead of the nose (it stays with the train: the sleepers run through it)
        float ahead = uTip - vW.x;
        float wide = 150.0 + 0.045 * max(ahead, 0.0);
        float pool = smoothstep(0.0, 500.0, ahead) * exp(-max(ahead, 0.0) / 3000.0) * exp(-z * z / (wide * wide));
        bed *= 1.0 + 3.2 * pool;
        // the fields, on both sides of the line (masked over the tracks and the masts' row)
        float outer = smoothstep(260.0, 460.0, z) + 1.0 - smoothstep(-1080.0, -900.0, z);
        float f1 = max(lines(x, 4000.0, uSmear), lines(z, 4000.0, 0.0)) * min(lod(x, 4000.0), lod(z, 4000.0));
        float f2 = max(lines(x, 1000.0, uSmear), lines(z, 1000.0, 0.0)) * min(lod(x, 1000.0), lod(z, 1000.0));
        float fields = (f1 * 0.085 + f2 * 0.03) * outer;
        gl_FragColor = vec4(uInk * (bed + fields + pool * 0.04) * fog * uAmount, 1.0);
      }`,
  });

// THE NIGHT: black, and a thin band of ink very low at the horizon. No blue, no moon. Drawn at infinity, last.
const nightMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: { uInk: { value: INK.clone() }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount; varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float air = 0.06 * exp(-abs(d.y) / 0.0035) + step(0.0, d.y) * 0.018 * exp(-d.y / 0.07);
        gl_FragColor = vec4(uInk * air * uAmount, 1.0);
      }`,
  });

// the radio's rings: a shell of veille that only shows at its rim — from any side, a ring — fading downward
const ringMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: VEILLE.clone() }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vY = normal.y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        if (uAmount < 0.003) discard;
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float light = 0.7 * pow(g, 9.0) + 0.55 * smoothstep(0.9, 0.995, g);
        gl_FragColor = vec4(uColor * light * smoothstep(-0.25, 0.35, vY) * uAmount, 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the train */

export function buildTrain() {
  const group = new THREE.Group();
  const train = new THREE.Group(); // stands still at the origin
  const world = new THREE.Group(); // the line: it does not move either — `run` slides what is drawn on it
  group.add(train, world);
  const A = {};
  const fx = {};

  /* ── the metals: three values of grey, little metal (a mirror only shows a black studio) ── */
  const cast = solid(0x69737b, { rough: 0.58, metal: 0.3, coat: 0.3, coatRough: 0.45 });
  const steel = solid(0x8d959b, { rough: 0.42, metal: 0.4, env: 1.1 });
  const bright = solid(0xaab1b6, { rough: 0.38, metal: 0.35, env: 1.15 });
  const dark = solid(0x2c3237, { rough: 0.85, env: 0.5 });
  const graphite = solid(0x40474e, { rough: 0.7, metal: 0.15, env: 0.7 });

  /* ═════════════ 1 · THE SHELL OF GLASS ═════════════ */
  fx.hull = glass(BRAND.ink, { base: 0, rim: 0.1, power: 3, edge: 0.3, spec: 0, through: 0.2 });
  const hullPanes = [];
  const pane = (geometry, material = fx.hull, parent = train) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    parent.add(mesh);
    hullPanes.push(mesh);
    return mesh;
  };

  // the power cars: closed at the tip on a point
  const pcRows = [Array.from({ length: AROUND }, () => [TIP - 0.4, PCF.sill(TIP) + (PCF.crest(TIP) - PCF.sill(TIP)) * 0.5, 0]), ...PC_X.map((x) => {
    const s = pcSection(x);
    return Array.from({ length: AROUND }, (_, j) => onSec(s, ANG(j, AROUND)));
  })];
  const pcGeo = skin(pcRows, { wrap: true });
  pane(pcGeo);
  const rearGeo = pcGeo.clone().applyMatrix4(MIRROR);
  rearGeo.computeVertexNormals();
  pane(rearGeo);

  // the trailers, and the bellows between every two cars
  const carSecs = TRAILERS.map(([a, b]) => [a + 14, b - 14]);
  for (const [a, b] of carSecs) {
    const rows = carStations(a, b).map((x) => {
      const s = carSection(x, a, b);
      return Array.from({ length: AROUND_T }, (_, j) => onSec(s, ANG(j, AROUND_T)));
    });
    pane(skin(rows, { wrap: true }));
  }
  fx.bellows = glass(BRAND.ink, { base: 0, rim: 0.05, power: 3, edge: 0.07, spec: 0, through: 0.15 });
  const joints = [(POWER.back + TRAILERS[0][0]) / 2, ...TRAILERS.slice(1).map(([a]) => a), (TRAILERS.at(-1)[1] + REAR[0]) / 2];
  // the gangways: a short bellows between two cars, narrower and lower than them (seen end on, never a frame)
  for (const x of joints) {
    const rows = [-22, -12, 0, 12, 22].map((dx) => {
      const s = { x: x + dx, w: 108, mid: 230, up: 150, down: 120, eu: 0.5, el: 0.4 };
      return Array.from({ length: AROUND_T }, (_, j) => onSec(s, ANG(j, AROUND_T)));
    });
    pane(skin(rows, { wrap: true }), fx.bellows);
  }

  /* ── lines: the outline of every car, a few frames, the windows ── */
  const outline = [];
  const frames = [];
  const faint = [];
  const run = (list, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) list.push(...pts[i], ...pts[i + 1]);
    if (closed) list.push(...pts.at(-1), ...pts[0]);
  };
  const pcAlong = (a, x0, x1) => PC_X.filter((x) => x >= x0 && x <= x1).map((x) => onSec(pcSection(x), a));
  const both = (list, pts) => {
    run(list, pts);
    run(list, mirror(pts));
  };
  for (const a of [0, Math.PI]) both(outline, pcAlong(a, TIP + 5, 1100)); // the waist: from the nose along the whole car
  both(outline, pcAlong(Math.PI / 2, TIP + 2, 1100)); // the crest: the bonnet's long slope, the windscreen, the roof
  for (const a of [Math.PI / 2 - 1.0, Math.PI / 2 + 1.0]) both(outline, pcAlong(a, SCREEN_X1, 1100)); // the roof's shoulders
  for (const a of [-Math.PI / 2 - 1.2, -Math.PI / 2 + 1.2]) both(outline, pcAlong(a, -1200, 1100)); // the skirts
  both(frames, pcAlong(-Math.PI / 2, TIP + 2, -1080)); // under the nose
  for (const x of [-430, 0, 560]) both(frames, Array.from({ length: AROUND / 2 + 1 }, (_, j) => onSec(pcSection(x), ANG(j * 2, AROUND))));
  both(outline, Array.from({ length: AROUND / 2 + 1 }, (_, j) => onSec(pcSection(1100), ANG(j * 2, AROUND))));

  // the windscreen: one pane, wrapping a little round its corners
  const A0 = 0.62;
  const screenAt = (u, v) => onSec(pcSection(lerp(SCREEN_X0, SCREEN_X1, u)), lerp(A0, Math.PI - A0, v));
  const screenBorder = [
    ...Array.from({ length: 25 }, (_, k) => screenAt(0, k / 24)),
    ...Array.from({ length: 9 }, (_, k) => screenAt(k / 8, 1)),
    ...Array.from({ length: 25 }, (_, k) => screenAt(1, 1 - k / 24)),
    ...Array.from({ length: 9 }, (_, k) => screenAt(1 - k / 8, 0)),
  ];
  both(outline, screenBorder);
  // the side windows of the cab: their front edge raked like the windscreen
  const SIDEWIN = [[-880, CAB.side[1] + 5], [CAB.side[2] - 5, CAB.side[1] + 5], [CAB.side[2] - 5, 352], [-800, 352]];
  const sideAt = (side) => (u, v) => {
    const xb = lerp(SIDEWIN[0][0], SIDEWIN[1][0], u);
    const xt = lerp(SIDEWIN[3][0], SIDEWIN[2][0], u);
    const x = lerp(xb, xt, v);
    const y = lerp(SIDEWIN[0][1], SIDEWIN[3][1], v);
    return [x, y, side * zOnSide(pcSection(x), y)];
  };
  for (const side of [1, -1]) {
    const f = sideAt(side);
    both(outline, [...Array.from({ length: 9 }, (_, k) => f(k / 8, 0)), ...Array.from({ length: 7 }, (_, k) => f(1, k / 6)), ...Array.from({ length: 9 }, (_, k) => f(1 - k / 8, 1)), ...Array.from({ length: 7 }, (_, k) => f(0, 1 - k / 6))]);
  }
  // the dark band of the face: from the windscreen's lower corners down to the headlights, and across the nose
  const HEAD = { x: -1225, a: 0.1 };
  const pcPoint = (x, a) => onSec(pcSection(x), a);
  for (const side of [1, -1]) {
    const aS = side > 0 ? A0 : Math.PI - A0;
    const aH = side > 0 ? HEAD.a : Math.PI - HEAD.a;
    both(outline, Array.from({ length: 21 }, (_, k) => pcPoint(lerp(SCREEN_X0, HEAD.x + 22, k / 20), lerp(aS, aH, k / 20))));
    both(frames, Array.from({ length: 21 }, (_, k) => pcPoint(lerp(HEAD.x - 30, TIP + 3, k / 20), side > 0 ? lerp(HEAD.a, 0.02, k / 20) : Math.PI - lerp(HEAD.a, 0.02, k / 20))));
  }

  // the trailers' lines: skirts, shoulders, ends, the two decks' floors, the windows
  const winQuads = []; // [car, side, x0, x1, y0, y1]
  carSecs.forEach(([a, b], c) => {
    const xs = carStations(a, b);
    const along = (ang) => xs.map((x) => onSec(carSection(x, a, b), ang));
    for (const ang of [Math.PI / 2 - 1.0, Math.PI / 2 + 1.0, -Math.PI / 2 - 1.15, -Math.PI / 2 + 1.15]) run(outline, along(ang));
    for (const x of [a, b]) run(outline, Array.from({ length: AROUND_T + 1 }, (_, j) => onSec(carSection(x, a, b), ANG(j, AROUND_T))));
    for (const side of [1, -1]) {
      for (const y of [DECKS.lower, DECKS.upper]) {
        const inside = xs.filter((x) => y > DECKS.lower || Math.min(x - a, b - x) > 380);
        run(faint, inside.map((x) => [x, y, side * (zOnSide(carSection(x, a, b), y) - 6)]));
      }
      for (let x = a + 165; x + 86 <= b - 165; x += 190) winQuads.push([c, side, x, x + 86, 302, 372]);
      for (let x = a + 420; x + 86 <= b - 420; x += 190) winQuads.push([c, side, x, x + 86, 118, 188]);
    }
  });
  const winGeo = [];
  for (const [c, side, x0, x1, y0, y1] of winQuads) {
    const [a, b] = carSecs[c];
    const at = (u, v) => {
      const x = lerp(x0, x1, u);
      const y = lerp(y0, y1, v);
      return [x, y, side * (zOnSide(carSection(x, a, b), y) - 0.6)];
    };
    run(faint, [at(0, 0), at(1, 0), at(1, 1), at(0, 1)], true);
    const g = grid(at, 2, 2);
    const n = g.attributes.position.count;
    g.setAttribute("aCar", new THREE.Float32BufferAttribute(new Array(n).fill(c / (TRAILERS.length - 1)), 1));
    const q = [];
    for (let i = 0; i <= 2; i++) for (let j = 0; j <= 2; j++) q.push(i / 2, j / 2);
    g.setAttribute("aQ", new THREE.Float32BufferAttribute(q, 2));
    g.deleteAttribute("normal");
    winGeo.push(g);
  }
  fx.winGlow = winGlowMat();
  const winGlow = new THREE.Mesh(mergeGeometries(winGeo), fx.winGlow);
  winGlow.renderOrder = 17;
  winGlow.frustumCulled = false;
  train.add(winGlow);

  const segments = (list, material) => {
    const geo = new LineSegmentsGeometry();
    geo.setPositions(list);
    const lines = new LineSegments2(geo, material);
    lines.frustumCulled = false;
    lines.renderOrder = 2;
    train.add(lines);
    return lines;
  };
  fx.outline = lineMat(BRAND.ink, 2.1, { opacity: 0.62 });
  fx.frames = lineMat(BRAND.ink, 1.9, { opacity: 0.28 });
  fx.faint = lineMat(BRAND.ink, 1.8, { opacity: 0.2 });
  segments(outline, fx.outline);
  segments(frames, fx.frames);
  segments(faint, fx.faint);
  const shellLines = [fx.outline, fx.frames, fx.faint];

  /* ── the windows of the power cars: clear panes with the studio faintly mirrored in them; the cab's lit air ── */
  fx.pane = glass(BRAND.ink, { base: 0, rim: 0.08, power: 2.6, edge: 0.12, spec: 0.06 });
  fx.cabAir = glow(BRAND.ink, 1, { additive: true, double: true });
  fx.cabAirSide = glow(BRAND.ink, 1, { additive: true, double: true });
  const windowPanes = [];
  const screenGeo = grid(screenAt, 10, 28);
  const sideGeos = [1, -1].map((side) => grid(sideAt(side), 12, 8));
  for (const g of [screenGeo, ...sideGeos]) {
    for (const geo of [g, g.clone().applyMatrix4(MIRROR)]) {
      const m = new THREE.Mesh(geo, fx.pane);
      m.renderOrder = 18;
      m.frustumCulled = false;
      train.add(m);
      windowPanes.push(m);
    }
  }
  const air = (geo, mat) => {
    const m = new THREE.Mesh(geo, mat);
    m.renderOrder = 17;
    train.add(m);
    return m;
  };
  air(screenGeo, fx.cabAir);
  for (const g of sideGeos) air(g, fx.cabAirSide);

  /* ── the headlights: two clusters low on the face, each two lamps in a dark recess, lit faintly ink ── */
  const lamps = new THREE.Group();
  train.add(lamps);
  fx.lamp = glow(BRAND.ink, 1.25);
  fx.lampHalo = haloMat(BRAND.ink, 0.42);
  const recess = solid(0x1b2024, { rough: 0.5, metal: 0.2 });
  const normalAt = (x, a) => {
    const p = V(...pcPoint(x, a));
    const dx = V(...pcPoint(x + 1, a)).sub(p);
    const da = V(...pcPoint(x, a + 0.01)).sub(p);
    const n = dx.cross(da).normalize();
    const out = V(0, p.y - pcSection(x).mid, p.z);
    if (n.dot(out) < 0) n.negate();
    return { p, n };
  };
  for (const side of [1, -1]) {
    const ac = side > 0 ? HEAD.a : Math.PI - HEAD.a;
    const lens = new THREE.Mesh(
      grid((u, v) => {
        const { p, n } = normalAt(lerp(HEAD.x - 34, HEAD.x + 22, u), ac + (side > 0 ? 1 : -1) * lerp(-0.07, 0.07, v));
        return p.addScaledVector(n, 0.5).toArray();
      }, 8, 3),
      recess,
    );
    lens.material.side = THREE.DoubleSide;
    lamps.add(lens);
    for (const dx of [-20, 6]) {
      const { p, n } = normalAt(HEAD.x + dx, ac);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(4.6, 32), fx.lamp);
      disc.position.copy(p).addScaledVector(n, 1.2);
      disc.quaternion.setFromUnitVectors(V(0, 0, 1), n);
      lamps.add(disc);
      halo(lamps, disc.position.toArray(), 26, fx.lampHalo);
    }
  }
  // the rear power car's lamps: off (a dark recess only)
  for (const child of lamps.children.filter((c) => c.material === recess)) {
    const back = new THREE.Mesh(child.geometry.clone().applyMatrix4(MIRROR), recess);
    train.add(back);
  }

  /* ═════════════ 2 · THE CAB ═════════════ */
  const cab = makePart("cab");
  train.add(cab);
  fx.inner = glass(BRAND.ink, { base: 0, rim: 0.16, power: 2.4, edge: 0.42, spec: 0, through: 0.22 });
  const innerPanes = [];
  const innerEdges = [];
  const inner = (geometry, pos, rotZ = 0) => {
    const mesh = new THREE.Mesh(geometry, fx.inner);
    mesh.position.set(...pos);
    mesh.rotation.z = rotZ;
    const e = edgesOf(geometry, { color: BRAND.ink, width: 1.9, opacity: 0.42 });
    mesh.add(e);
    innerEdges.push(e.material);
    train.add(mesh);
    innerPanes.push(mesh);
    return mesh;
  };
  const { x: DX, top: DT, w: DW } = CAB.desk;
  const DBACK = DX - 85; // the desk's back face, behind the countdown box
  const FL = POWER.floor;
  // the desk: its top, the apron over the knee space, two cheeks, the back face, the instrument panel raked up to the windscreen
  inner(box(DX - DBACK, 6, DW, 1.5), [(DX + DBACK) / 2, DT - 3, 0]);
  inner(box(4, 30, DW, 1.2), [DX - 2, DT - 21, 0]);
  for (const s of [1, -1]) inner(box(DX - DBACK, DT - 6 - FL, 25, 1.5), [(DX + DBACK) / 2, (DT - 6 + FL) / 2, s * (DW / 2 - 12.5)]);
  inner(box(4, DT - 6 - FL, DW - 50, 1.2), [DBACK + 2, (DT - 6 + FL) / 2, 0]);
  const slope = Math.atan2(38, 70);
  inner(box(80, 4, DW, 1.2), [DBACK - 36, DT + 18, 0], -slope);
  // the cab's floor: its outline only (a slab of glass seen at a grazing angle is a white board across the picture)
  {
    const floor = [];
    run(floor, [[SCREEN_X0 + 40, FL, 128], [CAB.wall, FL, 128], [CAB.wall, FL, -128], [SCREEN_X0 + 40, FL, -128]], true);
    segments(floor, fx.frames);
  }
  // the back wall, its doorway left open in it: the door is a solid of its own, closed
  {
    const s = pcSection(CAB.wall);
    const top = s.mid + s.up - 8;
    const half = zOnSide(s, 300) - 7;
    const { w: dw, h: dh } = CAB.door;
    const corner = 55;
    const pts = [[-half, FL], [-dw / 2, FL], [-dw / 2, FL + dh], [dw / 2, FL + dh], [dw / 2, FL], [half, FL], [half, top - corner]];
    for (let k = 1; k <= 8; k++) {
      const t = (k / 8) * (Math.PI / 2);
      pts.push([half - corner + corner * Math.cos(t), top - corner + corner * Math.sin(t)]);
    }
    for (let k = 0; k <= 8; k++) {
      const t = Math.PI / 2 + (k / 8) * (Math.PI / 2);
      pts.push([-half + corner + corner * Math.cos(t), top - corner + corner * Math.sin(t)]);
    }
    const wall = plate(pts.map(([u, v]) => [-u, v]), 3, { bevel: 0.6 }).rotateY(Math.PI / 2);
    inner(wall, [CAB.wall, 0, 0]);
  }
  asShell(innerPanes, 14);

  // the door, closed: a solid leaf in its frame, its handle on the cab's side
  const doorMat = solid(0x5a626a, { rough: 0.62, metal: 0.2 });
  addMesh(cab, box(4, CAB.door.h - 2, CAB.door.w - 2, 1.2), doorMat, { pos: [CAB.wall + 1, FL + CAB.door.h / 2, 0], edgeOpacity: 0.6 });
  addMesh(cab, box(2.4, 2.6, 15, 1), bright, { pos: [CAB.wall - 2.6, FL + 100, 18], edgeOpacity: 0.5 });
  addMesh(cab, box(4, 5, 5, 1), bright, { pos: [CAB.wall - 1.5, FL + 100, 26], edgeOpacity: 0.4 });
  addMesh(cab, box(6, CAB.door.h + 3, 4, 1), graphite, { pos: [CAB.wall - 1, FL + CAB.door.h / 2, CAB.door.w / 2 + 2], edgeOpacity: 0.5 });
  addMesh(cab, box(6, CAB.door.h + 3, 4, 1), graphite, { pos: [CAB.wall - 1, FL + CAB.door.h / 2, -CAB.door.w / 2 - 2], edgeOpacity: 0.5 });
  addMesh(cab, box(6, 4, CAB.door.w + 8, 1), graphite, { pos: [CAB.wall - 1, FL + CAB.door.h + 2, 0], edgeOpacity: 0.5 });

  // THE EMPTY SEAT: a pedestal, a cushion, a reclined back with its wings, a headrest, two armrests. Fabric of a mid
  // grey, the lightest thing of the cab; the desk's glow lights its face (`cab`).
  fx.fabric = solid(0x8e9499, { rough: 0.86, env: 0.7 });
  fx.trim = solid(0x4b5258, { rough: 0.55, metal: 0.25 });
  const SX = CAB.seat.x;
  const SY = CAB.seat.y;
  addMesh(cab, box(46, 3, 44, 1), fx.trim, { pos: [SX + 2, FL + 1.5, 0], edgeOpacity: 0.5 });
  addMesh(cab, cyl(5.5, SY - 12 - FL - 6, 0.8, 32), steel, { pos: [SX + 2, (FL + 3 + SY - 15) / 2 + 1.5, 0], edgeOpacity: 0.45 });
  addMesh(cab, box(42, 3.5, 40, 1), fx.trim, { pos: [SX, SY - 13, 0], edgeOpacity: 0.5 });
  addMesh(cab, box(52, 11, 53, 4.5), fx.fabric, { pos: [SX, SY - 5.5, 0], edgeOpacity: 0.5 });
  addMesh(cab, box(6, 7, 50, 3), fx.fabric, { pos: [SX - 25, SY - 3, 0], edgeOpacity: 0.4 }); // the front roll of the cushion
  const back = new THREE.Group(); // reclined 12° back toward +x, from the back of the cushion
  back.position.set(SX + 24, SY - 4, 0);
  back.rotation.z = -12 * DEG;
  cab.add(back);
  const inBack = (geo, mat, pos, o = {}) => {
    const mesh = addMesh(cab, geo, mat, { pos, edgeOpacity: o.edge ?? 0.45 });
    back.add(mesh);
    return mesh;
  };
  const BH = CAB.seat.back - SY; // the back's height, headrest included
  inBack(box(10, BH * 0.74, 50, 4), fx.fabric, [3, BH * 0.37 + 2, 0]);
  for (const s of [1, -1]) inBack(box(10, BH * 0.52, 8, 3.5), fx.fabric, [-2.5, BH * 0.33, s * 23]); // the wings
  inBack(box(9, BH * 0.19, 31, 4), fx.fabric, [3, BH * 0.89 + 3, 0]); // the headrest
  for (const s of [1, -1]) inBack(cyl(0.9, 8, 0.2, 12), steel, [3, BH * 0.78, s * 8]);
  inBack(box(12, 14, 46, 2), fx.trim, [8.5, BH * 0.3, 0]); // its shell behind
  for (const s of [1, -1]) {
    addMesh(cab, box(31, 4.5, 7, 2), fx.trim, { pos: [SX - 6, SY + 22, s * 30], edgeOpacity: 0.5 });
    addMesh(cab, box(5, 20, 4, 1.2), fx.trim, { pos: [SX + 14, SY + 12, s * 30], edgeOpacity: 0.45 });
  }
  addMesh(cab, cyl(1, 12, 0.3, 12).rotateZ(Math.PI / 2), steel, { pos: [SX - 18, SY - 12, 26], edgeOpacity: 0.4 }); // the height lever

  // the desk's light: screens of ink on the raked panel, the speed display (veille when `display`), and the light
  // they throw on the empty seat
  fx.screens = glow(BRAND.ink, 0.3, { additive: true });
  for (const z of [-42, 42]) {
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(34, 20), fx.screens);
    scr.position.set(DBACK - 36 + 3, DT + 18 + 2.4, z);
    scr.rotation.set(0, Math.PI / 2, 0);
    scr.rotateX(-(Math.PI / 2 - slope));
    scr.renderOrder = 4;
    cab.add(scr);
  }
  const [DSX, DSY, DSZ] = CAB.display;
  addMesh(cab, box(4, 15, 28, 1), dark, { pos: [DSX - 2.4, DSY, DSZ], edgeOpacity: 0.6 });
  addMesh(cab, box(6, 5, 8, 1), dark, { pos: [DSX - 2.4, DT + 2, DSZ], edgeOpacity: 0.5 });
  fx.display = glow(BRAND.ink, 0.1);
  const display = new THREE.Mesh(new THREE.PlaneGeometry(24, 11), fx.display);
  display.position.set(DSX - 0.2, DSY, DSZ);
  display.rotation.y = Math.PI / 2;
  cab.add(display);
  fx.lamp_cab = new THREE.PointLight(0xfff1e0, 0, 900, 2);
  fx.lamp_cab.position.set(DX - 12, DT + 26, 0);
  train.add(fx.lamp_cab);
  fx.deskHalo = haloMat(BRAND.ink, 0.16);
  halo(train, [DX - 30, DT + 14, 0], 70, fx.deskHalo);

  /* ═════════════ 3 · THE TRACTION CHAIN, THE ROOF ═════════════ */
  const traction = makePart("traction");
  train.add(traction);
  const strut = (part, a, b, r, material, edge = 0.45) => {
    const from = V(...a);
    const to = V(...b);
    const mesh = addMesh(part, cyl(r, from.distanceTo(to), Math.min(0.6, r * 0.22), 24), material, { edgeOpacity: edge });
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, to.sub(from).normalize());
    return mesh;
  };
  const [TX, TY] = TRACTION.transformer;
  const [TW, TH, TD] = TRACTION.size;
  addMesh(traction, box(TW, TH, TD, 5), cast, { pos: [TX + TW / 2, TY + TH / 2, 0], edgeOpacity: 0.5 });
  for (let k = 0; k < 7; k++) addMesh(traction, box(4, TH - 24, TD + 8, 1), graphite, { pos: [TX + 40 + k * 53, TY + TH / 2, 0], edgeOpacity: 0.35 }); // its cooling ribs
  addMesh(traction, cyl(9, 22, 1.5, 24), bright, { pos: [TX + 300, TY + TH + 11, 0], edgeOpacity: 0.45 }); // the bushing the roof line feeds
  // the pantograph, single-arm, up against the wire
  const RF = POWER.roof;
  const W = CATENARY.wire;
  const PX = PANTO.x;
  const P_HINGE = [PX + 95, RF + 21, 0];
  const P_KNEE = [PX - 60, RF + 69, 0];
  const P_HEAD = [PX + 12, W - 3, 0];
  addMesh(traction, box(130, 6, 120, 2), steel, { pos: [PX + 50, RF + 15, 0], edgeOpacity: 0.5 });
  for (const [x, z] of [[PX, 45], [PX, -45], [PX + 110, 0]]) addMesh(traction, cyl(5, 10, 0.8, 24), bright, { pos: [x, RF + 6, z], edgeOpacity: 0.4 });
  for (const z of [-16, 16]) strut(traction, [P_HINGE[0], P_HINGE[1], z], [P_KNEE[0], P_KNEE[1], z * 0.4], 3.2, steel);
  for (const z of [-1, 1]) strut(traction, [P_KNEE[0], P_KNEE[1], z * 6], [P_HEAD[0], P_HEAD[1] - 2, z * 34], 2.3, steel);
  strut(traction, [P_HINGE[0] + 8, P_HINGE[1] - 4, 0], [PX + 10, RF + 40, 0], 1.6, bright); // its spring and damper
  addMesh(traction, box(9, 4, 190, 1.5), bright, { pos: [P_HEAD[0], W - 2, 0], edgeOpacity: 0.55 });
  for (const s of [1, -1]) strut(traction, [P_HEAD[0], W - 3, s * 95], [P_HEAD[0], W - 14, s * 112], 1.5, bright);
  // the roof line, from the pantograph's foot to the bushing
  const RL = RF + 22;
  strut(traction, [PX + 40, RL, 0], [TX + 300, RL, 0], 3, bright, 0.4);
  for (const x of [PX - 60, PX - 220]) addMesh(traction, cyl(4.5, 16, 0.8, 24), bright, { pos: [x, RF + 9, 0], edgeOpacity: 0.4 });
  strut(traction, [TX + 300, RL, 0], [TX + 300, TY + TH + 20, 0], 3, bright, 0.4);
  // the motor blocks under the power cars, and the cables that feed them
  const MOTOR = [BOGIES[0], BOGIES[1]];
  for (const x of MOTOR) {
    addMesh(traction, box(130, 44, 104, 6), cast, { pos: [x, 66, 0], edgeOpacity: 0.5 });
    for (const s of [1, -1]) addMesh(traction, cyl(22, 12, 2, 40).rotateX(Math.PI / 2), graphite, { pos: [x + s * 40, 66, 58], edgeOpacity: 0.4 });
  }
  const FEED = [
    [[TX + 20, TY + 40, 30], [MOTOR[0] + 40, FL - 10, 30], [MOTOR[0], 92, 30]],
    [[TX + TW - 20, TY + 40, 30], [MOTOR[1] - 40, FL - 10, 30], [MOTOR[1], 92, 30]],
  ];
  for (const path of FEED) for (let i = 0; i < path.length - 1; i++) strut(traction, path[i], path[i + 1], 2.6, graphite, 0.4);
  // the rear power car's pantograph lies down, and its transformer is there, dark
  addMesh(traction, box(TW, TH, TD, 5), cast, { pos: [REAR_C - TX - TW / 2, TY + TH / 2, 0], edgeOpacity: 0.45 });
  addMesh(traction, box(130, 6, 120, 2), steel, { pos: [REAR_C - PX - 50, RF + 15, 0], edgeOpacity: 0.45 });
  for (const z of [-16, 16]) strut(traction, [REAR_C - PX - 95, RF + 21, z], [REAR_C - PX + 70, RF + 25, z * 0.4], 3.2, steel);
  // the antenna, on the roof ahead of the pantograph: a blade and a whip
  const [AX, AY] = ANTENNA.at;
  addMesh(traction, box(26, 3, 16, 1), steel, { pos: [AX, AY + 1.5, 0], edgeOpacity: 0.45 });
  addMesh(traction, plate([[-14, 0], [14, 0], [-2, 17], [-8, 17]], 3, { bevel: 0.5 }), bright, { pos: [AX, AY + 3, -1.5], edgeOpacity: 0.5 });
  addMesh(traction, cyl(1.2, ANTENNA.h, 0.2, 12, 0.6), bright, { pos: [AX + 8, AY + 3 + ANTENNA.h / 2, 0], edgeOpacity: 0.4 });

  // the current: from the wire into the pantograph, along the roof, down into the transformer, out to the motors
  fx.flow = flowMat();
  const flowGeos = [
    flowTube([[PX - 2600, W, 0], [P_HEAD[0], W, 0]], 2.4),
    flowTube([[PX + 2600, W, 0], [P_HEAD[0], W, 0]], 2.4),
    flowTube([P_HEAD, P_KNEE, P_HINGE, [PX + 40, RL, 0], [TX + 300, RL, 0], [TX + 300, TY + TH + 20, 0]], 5.5),
    ...FEED.map((p) => flowTube(p, 5)),
  ];
  const flow = new THREE.Mesh(mergeGeometries(flowGeos), fx.flow);
  flow.renderOrder = 5;
  flow.frustumCulled = false;
  train.add(flow);

  /* ═════════════ 4 · THE BOGIES AND THE BRAKE PIPE ═════════════ */
  const wheelGeo = lathe([[0, -7], [22, -7], [44.5, -7], [46, -6], [46, 5.2], [48.5, 6.2], [49.5, 7.2], [44, 7.8], [22, 7.8], [0, 7.8]], 56, { bevel: 0.5 }).rotateX(Math.PI / 2);
  const gaugeZ = TRACK.gauge / 2 + 3.8;
  const bogieKit = (motor) => {
    const st = [];
    const ca = [];
    const br = [];
    const dk = [];
    const padP = [];
    const padM = [];
    const discs = motor ? [-34, 34] : [-46, -19, 19, 46];
    for (const ax of [-150, 150]) {
      for (const side of [1, -1]) {
        const g = wheelGeo.clone();
        if (side > 0) g.rotateY(Math.PI); // the flange always inside the rail
        st.push(g.translate(ax, 46, side * gaugeZ));
        ca.push(box(24, 22, 20, 3).translate(ax, 46, side * 101));
        ca.push(cyl(7.5, 14, 1, 24).translate(ax, 64, side * 101));
      }
      st.push(cyl(8, 190, 1, 32).rotateX(Math.PI / 2).translate(ax, 46, 0));
      for (const z of discs) {
        br.push(cyl(31, 4.5, 0.6, 48).rotateX(Math.PI / 2).translate(ax, 46, z));
        dk.push(box(10, 18, 16, 2).translate(ax + 36, 46, z));
        padP.push(box(11, 14, 2, 0.4).translate(ax + 24, 46, z + 4.6));
        padM.push(box(11, 14, 2, 0.4).translate(ax + 24, 46, z - 4.6));
      }
    }
    for (const side of [1, -1]) ca.push(box(390, 16, 14, 3).translate(0, 74, side * 101));
    ca.push(box(44, 16, 190, 3).translate(0, 74, 0));
    const merged = { steel: mergeGeometries(st), cast: mergeGeometries(ca), bright: mergeGeometries(br), dark: mergeGeometries(dk), padP: mergeGeometries(padP), padM: mergeGeometries(padM) };
    return merged;
  };
  const wheelMat = solid(0x737b82, { rough: 0.55, metal: 0.25, env: 0.55 }); // a wheel's face is a large flat disc: never a mirror
  const KITS = { motor: bogieKit(true), trailer: bogieKit(false) };
  const edgeCache = new Map();
  const edgeLines = (geo, material) => {
    if (!edgeCache.has(geo)) edgeCache.set(geo, edgesOf(geo, { color: BRAND.ink, width: 1.8, opacity: 0.5 }));
    const e = edgeCache.get(geo);
    const lines = new LineSegments2(e.geometry, e.material);
    lines.renderOrder = 2;
    return lines;
  };
  const bogies = BOGIES.map((x, i) => {
    const kit = i < 2 || i >= BOGIES.length - 2 ? KITS.motor : KITS.trailer;
    const g = new THREE.Group();
    g.position.set(x, 0, 0);
    for (const [name, mat] of [["steel", wheelMat], ["cast", cast], ["bright", bright], ["dark", dark]]) {
      const mesh = new THREE.Mesh(kit[name], mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.add(edgeLines(kit[name], mat));
      g.add(mesh);
    }
    const pad = solid(0x30363b, { rough: 0.8 });
    pad.emissive = new THREE.Color(0, 0, 0);
    const pp = new THREE.Mesh(kit.padP, pad);
    const pm = new THREE.Mesh(kit.padM, pad);
    g.add(pp, pm);
    train.add(g);
    return { x, pad, pp, pm };
  });
  // the brake pipe, along the whole train under the floors
  const pipeTo = Math.min(PIPE.to, REAR[1] - 30);
  fx.pipe = pipeMat();
  const pipe = new THREE.Mesh(cyl(3, pipeTo - PIPE.from, 0.5, 16).rotateZ(Math.PI / 2).translate((PIPE.from + pipeTo) / 2, PIPE.y, PIPE.z), fx.pipe);
  pipe.frustumCulled = false;
  train.add(pipe);
  for (let x = PIPE.from + 400; x < pipeTo; x += 900) addMesh(traction, box(6, 14, 6, 1), graphite, { pos: [x, PIPE.y + 8, PIPE.z], edgeOpacity: 0.3 }); // its brackets

  /* ═════════════ 5 · THE 393, AND YOU ═════════════ */
  const R = rng(2104);
  const seats = [];
  const backs = []; // every seat, taken or not: its back, faint — the rows
  TRAILERS.forEach(([a, b], c) => {
    const slots = [];
    for (let x = a + 190; x <= b - 190; x += PAX.row) for (const z of PAX.zs) slots.push([x, DECKS.upper, z]);
    for (let x = a + 400; x <= b - 400; x += PAX.row) for (const z of PAX.zs) slots.push([x, DECKS.lower, z]);
    // your place, and the one beside it, are not for the crowd
    const yours = c === 0 ? slots.filter(([x, y, z]) => y === YOU.at[1] && z > 0 && Math.abs(x - YOU.at[0]) < PAX.row / 2) : [];
    const free = slots.filter((s) => !yours.includes(s));
    for (let i = free.length - 1; i > 0; i--) {
      const j = Math.floor(R() * (i + 1));
      [free[i], free[j]] = [free[j], free[i]];
    }
    // seven in ten on the upper deck: from above, the rows are full
    const up = free.filter((s) => s[1] === DECKS.upper);
    const low = free.filter((s) => s[1] !== DECKS.upper);
    const nUp = Math.min(up.length, Math.round(PAX.perCar[c] * 0.7));
    for (const s of [...up.slice(0, nUp), ...low.slice(0, PAX.perCar[c] - nUp)]) seats.push([...s, c]);
    for (const s of slots) backs.push([...s, c]);
  });
  const headGeo = (() => {
    const head = new THREE.SphereGeometry(9.2, 20, 14).scale(1, 1.08, 0.92);
    const neck = new THREE.CylinderGeometry(4.6, 5.6, 9, 14).translate(0, -11, 0);
    const shoulders = new THREE.SphereGeometry(1, 24, 12).scale(11, 10, 22).translate(1.5, -21, 0);
    const parts = [head, neck, shoulders].map((g) => g.toNonIndexed());
    for (const g of parts) g.deleteAttribute("uv");
    return mergeGeometries(parts);
  })();
  fx.pax = paxMat();
  const heads = new THREE.InstancedMesh(headGeo, fx.pax, seats.length);
  const aCar = new Float32Array(seats.length);
  {
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sc = V();
    seats.forEach(([x, y, z, c], i) => {
      q.setFromAxisAngle(UP, (R() - 0.5) * 0.4);
      const k = 0.93 + R() * 0.12;
      sc.set(k, k, k);
      m4.compose(V(x + (R() - 0.5) * 12, y + DECKS.head + (R() - 0.5) * 7, z + (R() - 0.5) * 6), q, sc);
      heads.setMatrixAt(i, m4);
      aCar[i] = c / (TRAILERS.length - 1);
    });
  }
  heads.geometry.setAttribute("aCar", new THREE.InstancedBufferAttribute(aCar, 1));
  heads.renderOrder = 8;
  heads.frustumCulled = false;
  train.add(heads);
  fx.backs = paxMat();
  fx.backs.uniforms.uColor.value.multiplyScalar(0.32);
  const backMesh = new THREE.InstancedMesh(box(7, 58, 46, 3.5), fx.backs, backs.length);
  {
    const m4b = new THREE.Matrix4();
    const aCarB = new Float32Array(backs.length);
    backs.forEach(([x, y, z, c], i) => {
      m4b.makeTranslation(x + 17, y + 72, z);
      backMesh.setMatrixAt(i, m4b);
      aCarB[i] = c / (TRAILERS.length - 1);
    });
    backMesh.geometry.setAttribute("aCar", new THREE.InstancedBufferAttribute(aCarB, 1));
  }
  backMesh.renderOrder = 8;
  backMesh.frustumCulled = false;
  train.add(backMesh);

  // you: a body of glass, seated at your window (upper deck, first trailer), facing the nose; your phone in your hand
  const you = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.5, through: 0.2 });
  you.ghost(true);
  you.group.rotation.y = -Math.PI / 2; // you look toward the nose (−x): your left is the window (+z)
  const HIPS = V(YOU.at[0], YOU.at[1] + 46, YOU.at[2]);
  you.group.position.set(HIPS.x, HIPS.y - you.HIP, HIPS.z);
  train.add(you.group);
  {
    const floorY = YOU.at[1] - (HIPS.y - you.HIP); // the floor, in your own frame
    you.lean(-9, 0, 0);
    you.leg("L", V(10, floorY + 8, 46), V(0, 1, 0.3), V(0, 0.5, 0.85));
    you.leg("R", V(-10, floorY + 8, 48), V(0, 1, 0.3), V(0, 0.5, 0.85));
    you.reach("L", V(13, 97, 30), V(0.6, -1, 0), { dir: V(-0.1, -0.15, 1), palm: V(0, -1, 0) });
    you.reach("R", V(-4, 112, 27), V(-0.7, -1, 0), { dir: V(0.35, 0.3, 1), palm: V(0.1, 1, -0.2) });
    you.grip("R", 0.32, 3.5);
  }
  fx.phoneScreen = glow(BRAND.ink, 0);
  const phone = new THREE.Group();
  phone.add(new THREE.Mesh(box(7, 0.9, 14.5, 0.4), dark));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 13.4), fx.phoneScreen);
  screen.rotation.x = Math.PI / 2;
  screen.position.y = -0.48;
  phone.add(screen);
  phone.position.set(0, -2.6, 6.5);
  you.arms.R.hand.add(phone);
  A.you = anchor(you.head, 0, 0, 0);
  A.phone = anchor(phone, 0, -0.5, 0);
  const youMats = [you.body];

  /* ═════════════ 6 · THE RADIO'S RINGS ═════════════ */
  const ringGeo = new THREE.SphereGeometry(1, 48, 24);
  const rings = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(ringGeo, ringMat());
    m.position.set(AX + 8, AY + 3 + ANTENNA.h, 0);
    m.renderOrder = 7;
    m.frustumCulled = false;
    train.add(m);
    return m;
  });

  /* ═════════════ 7 · THE LINE ═════════════ */
  const GY = -18; // the ground: the top of the sleepers, the ballast, the fields
  fx.ground = groundMat();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2 * WORLD.far * 2.6, 2 * WORLD.far * 2.6), fx.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = GY;
  ground.renderOrder = 1;
  ground.frustumCulled = false;
  world.add(ground);

  // the rails: steel, a head, a web, a foot — and the bright line of their heads
  const railShape = [[-7.5, -17], [7.5, -17], [7.5, -15], [0.9, -13.5], [0.9, -4.6], [3.6, -4], [3.6, 0], [-3.6, 0], [-3.6, -4], [-0.9, -4.6], [-0.9, -13.5], [-7.5, -15]];
  const RAIL_L = 2 * WORLD.far * 2.4;
  const railGeo = plate(railShape, RAIL_L, { bevel: 0.3, round: 1 }).rotateY(Math.PI / 2).translate(-RAIL_L / 2, 0, 0);
  const railMat = solid(0x7d858b, { rough: 0.5, metal: 0.25, env: 0.6 });
  fx.railHead = lineMat(BRAND.ink, 1.8, { opacity: 0.5, fog: true });
  fx.wire = lineMat(BRAND.ink, 1.9, { opacity: 0.5, fog: true });
  for (const zc of [0, TRACK.other]) {
    for (const s of [1, -1]) {
      const z = zc + s * TRACK.gauge / 2;
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.z = z;
      rail.receiveShadow = true;
      rail.frustumCulled = false;
      world.add(rail);
      const head = new LineSegments2(new LineSegmentsGeometry().setPositions([-RAIL_L / 2, 0.3, z, RAIL_L / 2, 0.3, z]), fx.railHead);
      head.frustumCulled = false;
      head.renderOrder = 2;
      world.add(head);
    }
    // the contact wire and the messenger above it: continuous lines
    for (const y of [W, W + 125]) {
      const wire = new LineSegments2(new LineSegmentsGeometry().setPositions([-RAIL_L / 2, y, zc, RAIL_L / 2, y, zc]), fx.wire);
      wire.frustumCulled = false;
      wire.renderOrder = 2;
      world.add(wire);
    }
  }

  // the masts, far side only (−z), every 63 m: a column, an arm over both tracks, its stay, the droppers to the wires
  const mastGeo = (() => {
    const CZ = CATENARY.z;
    const H = CATENARY.h;
    const ARM_Y = W + 180;
    const parts = [
      box(30, H - GY, 30, 2).translate(0, (H + GY) / 2, CZ),
      box(60, 20, 60, 3).translate(0, GY + 10, CZ),
      box(12, 12, 60 - CZ, 2).translate(0, ARM_Y, (CZ + 60) / 2),
    ];
    const stay = new THREE.Vector3(0, ARM_Y - (H - 230), -380 - CZ);
    parts.push(box(8, stay.length(), 8, 1).translate(0, stay.length() / 2, 0).applyMatrix4(new THREE.Matrix4().makeRotationX(Math.atan2(stay.z, stay.y))).translate(0, H - 230, CZ));
    for (const zc of [0, TRACK.other]) {
      parts.push(box(6, ARM_Y - W - 6, 6, 1).translate(0, (ARM_Y + W) / 2 + 3, zc));
      parts.push(cyl(5, 22, 1, 16).translate(0, ARM_Y - 18, zc));
    }
    return mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)).map((g) => {
      for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal") g.deleteAttribute(k);
      return g;
    }));
  })();
  const NM = 26;
  const MAST_HALF = (NM / 2) * CATENARY.every;
  const MAST_PHASE = 2600; // at run 0 no mast stands behind the cab: the first frame's windscreen is clear
  fx.mast = mastMat();
  const masts = new THREE.InstancedMesh(mastGeo, fx.mast, NM);
  masts.frustumCulled = false;
  world.add(masts);
  const m4 = new THREE.Matrix4();

  // the night
  fx.night = nightMat();
  const night = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), fx.night);
  night.frustumCulled = false;
  night.renderOrder = 100;
  world.add(night);

  asShell(hullPanes, 20);

  /* ═════════════ the system's place, the anchors ═════════════ */
  const mount = new THREE.Group();
  mount.position.set(...CAB_PEDAL);
  train.add(mount);

  const winC = sideAt(1)(0.5, 0.5);
  Object.assign(A, {
    nose: anchor(train, TIP, PCF.crest(TIP), 0),
    cab: anchor(train, -690, 255, 0),
    seat: anchor(train, SX, SY + 30, 0),
    desk: anchor(train, DX, DT, 0),
    display: anchor(train, DSX, DSY, DSZ),
    door: anchor(train, CAB.wall, FL + CAB.door.h / 2, 0),
    window: anchor(train, ...winC),
    antenna: anchor(train, AX + 8, AY + 3 + ANTENNA.h, 0),
    panto: anchor(train, ...P_HEAD),
    transformer: anchor(train, TX + TW / 2, TY + TH, 0),
    bogie: anchor(train, BOGIES[0], 46, 0),
    pipe: anchor(train, 2000, PIPE.y, PIPE.z),
    pax: anchor(train, 2200, DECKS.upper + DECKS.head + 40, 0),
    tail: anchor(train, REAR_C - TIP, PCF.crest(TIP), 0),
  });

  const tmp = new THREE.Color();
  /** Everything of P (see FIRST in world.js); 16 calls a frame: no allocation. */
  function update(P = {}, time = 0) {
    const runCm = (P.run ?? 0) * 100;
    const wrap = ((runCm % LOOP) + LOOP) % LOOP;
    const kmh = Math.max(0, P.kmh ?? 0);
    const sh = clamp01(P.shell ?? 1);
    const cabK = clamp01(P.cab ?? 0);
    const pax = clamp01(P.pax ?? 0);
    const youOn = (P.you ?? 0) > 0.5;
    const ph = clamp01(P.phone ?? 0);
    const tr = clamp01(P.traction ?? 1);
    const br = clamp01(P.brake ?? 0);
    const ra = clamp01(P.radio ?? 0);
    const di = clamp01(P.display ?? 0);

    // the line: masts, ground (the way the line goes during the shutter, at this speed, is what smears it)
    const off = wrap % CATENARY.every;
    for (let i = 0; i < NM; i++) {
      m4.makeTranslation(-MAST_HALF + MAST_PHASE + i * CATENARY.every + off, 0, 0);
      masts.setMatrixAt(i, m4);
    }
    masts.instanceMatrix.needsUpdate = true;
    fx.ground.uniforms.uRun.value = wrap;
    fx.ground.uniforms.uSmear.value = (kmh / 3.6) * 100 * (0.5 / 30);

    // the shell of glass and its lines
    const glassK = sh;
    fx.hull.uniforms.uAmount.value = glassK;
    fx.bellows.uniforms.uAmount.value = glassK;
    fx.pane.uniforms.uAmount.value = glassK;
    fx.inner.uniforms.uAmount.value = 0.4 + 0.6 * sh;
    for (const m of shellLines) m.opacity = m.userData.base * sh;
    for (const m of innerEdges) m.opacity = m.userData.base * (0.5 + 0.5 * sh);
    for (const m of hullPanes) m.visible = sh > 0.003;
    for (const m of windowPanes) m.visible = sh > 0.003;

    // the cab's light: the screens, the desk's glow, the light on the empty seat, the lit air in its windows
    fx.lamp_cab.intensity = 36000 * cabK;
    fx.lamp_cab.visible = cabK > 0.003;
    setGlow(fx.screens, 0.3 * cabK);
    fx.deskHalo.uniforms.uAmount.value = cabK;
    fx.fabric.emissive.copy(INK).multiplyScalar(0.035 * cabK);
    setGlow(fx.cabAir, 0.02 * cabK * sh);
    setGlow(fx.cabAirSide, 0.04 * cabK * sh);
    // the speed display: dark ink when off, veille when lit
    fx.display.color.copy(INK).multiplyScalar(0.08 * cabK * (1 - di)).add(tmp.copy(VEILLE).multiplyScalar(1.5 * di));

    // the passengers, car by car; their windows with them
    fx.pax.uniforms.uPax.value = pax;
    fx.backs.uniforms.uPax.value = pax;
    heads.visible = pax > 0.003;
    backMesh.visible = pax > 0.003;
    fx.winGlow.uniforms.uPax.value = pax;
    fx.winGlow.uniforms.uAmount.value = sh;
    winGlow.visible = pax > 0.003 && sh > 0.003;

    // you, and your phone
    you.group.visible = youOn;
    for (const m of youMats) m.uniforms.uAmount.value = youOn ? 1 : 0;
    setGlow(fx.phoneScreen, 1.3 * ph);

    // the current
    fx.flow.uniforms.uTime.value = time;
    fx.flow.uniforms.uAmount.value = tr;
    flow.visible = tr > 0.003;

    // the emergency braking: a head of veille along the brake pipe; behind it, each bogie's pads bite
    const on = smooth(0, 0.004, br);
    const headX = PIPE.from + br * (pipeTo - PIPE.from);
    fx.pipe.uniforms.uHead.value = headX;
    fx.pipe.uniforms.uOn.value = on;
    for (const b of bogies) {
      const c = smooth(b.x - 140, b.x + 160, headX) * on;
      b.pad.emissive.copy(VEILLE).multiplyScalar(1.15 * c);
      b.pp.position.z = -1.6 * c;
      b.pm.position.z = 1.6 * c;
    }

    // the radio: three rings leaving the antenna, widening slowly into the night
    for (let i = 0; i < 3; i++) {
      const t = clamp01((ra - 0.25 * i) / 0.65);
      const r = 25 + 1300 * t ** 0.85;
      rings[i].scale.setScalar(r);
      rings[i].material.uniforms.uAmount.value = smooth(0, 0.04, t) * (1 - t) ** 1.1 * 1.1;
      rings[i].visible = t > 0.001 && t < 0.999;
    }
  }
  update({ ...{ run: 0, kmh: 255, shell: 1, cab: 1, traction: 1 } });

  return { group, mount, A, update };
}
