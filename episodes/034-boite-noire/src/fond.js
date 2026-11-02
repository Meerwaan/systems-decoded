// DOSSIER 034 — Boîte noire : the Atlantic at night, from the surface to 3 900 m, at TRUE scale.
//
//   buildFond() → { group, A, update(P, time, px), fog(d) }
//   group  added to the scene by world.js; the box is at its origin (world.js hangs it there) — THE SEA MOVES:
//          surface at y = +depth·100, bottom at y = −(DEEP.floor − depth)·100 (plan.js)
//   A      anchors (Object3D, moved with the sea): tail (the tail section's centre), field (BEAM.at on the bottom),
//          lamp (the head of the light that comes down), surface (above the box)
//   P      { depth, rush, wreck, ping, range, beam, shell, pool, mood }   (meaning: FIRST in world.js)
//   fog(d) the fog's density for a camera at distance d — and, called right after update() by world.apply, it also
//          sets what depends on how far the camera stands (the snow, the wide lines): a pure function of d.
//
// What it draws, all of it X-ray (no solid floor, no blue — the night is black):
//   · the marine snow: motes in a 9 m cube that follows the camera, drawn as streaks — rising while the box sinks
//     (`rush` +), falling while it rises (−), floating at 0. Three layers cross-faded by `rush`: nothing jumps when it
//     changes. It is what says « under water » and « it moves » from frame 1.
//   · the surface seen from below: a faint wavy net of ink, only near (depth < ≈ 150 m); far, a circle.
//   · the bottom: an abyssal plain in LINES (contours at five scales, each shown only while its cells are wide enough
//     on screen; ripples of sediment around the box), the halo the box lies on (`pool`), the lamp's spot.
//   · the wreck of glass: 023's tail section (fin, stabilisers, rear cone — its skin and lines, copied), broken clean at
//     the front; it sinks behind the box (`wreck` 0, signal edge of its break under `mood`), then lies on the bottom
//     among two barrels of fuselage, a panel of windows and an engine (`wreck` 1).
//   · the beacon's rings: a sphere of veille born at its nose on every flash (PING, same phase as model.js), growing
//     at the screen's pace whatever the distance, stopped by the reach; the reach itself, a dome over the bottom
//     (`range`), its footprint, and — once the box would be under 6 px — a point of light where it lies.
//   · the light that comes down (`beam`): a lamp (white core, long trail), a very faint cone, the spot on the bottom
//     and the wreck lit by it.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, asShell, lineMat } from "@kit/build3d.js";
import { FUSE, TAIL } from "../../023-eolienne-de-secours/src/plan.js";
import { DEEP, WRECK, BEAM, PING, REC, BEACON } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/* ───────────────────────────────────────── 023's skin of the A330, copied (its rear part) ───────────────────────── */

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
// [x, half-width, keel, crest] — 023's BODY, from the wing box aft
const BODY = [
  [-2220, 282, -282, 282],
  [1480, 282, -282, 282],
  [1800, 279, -262, 282],
  [2100, 266, -200, 279],
  [2400, 236, -115, 270],
  [2650, 186, -25, 254],
  [2850, 118, 60, 228],
  [2950, 62, 112, 200],
  [2980, 30, 138, 184],
];
const body = [1, 2, 3].map((k) => spline(BODY.map((row) => [row[0], row[k]])));
const AROUND = 64;
function section(x) {
  const [w, keel, crest] = body.map((f) => f(x));
  return { w, mid: (keel + crest) / 2, hh: (crest - keel) / 2 };
}
function onSkin(x, a, lift = 0) {
  const s = section(x);
  return [x, s.mid + (s.hh + lift) * Math.sin(a), (s.w + lift) * Math.cos(a)];
}
const STAB = { le: 2120, root: 560, tip: 190, semi: TAIL.stab / 2, y: 55, tan: Math.tan(32 * DEG), dihedral: 6, thick: 0.1 };
const stabLE = (z) => STAB.le + z * STAB.tan;
const stabChord = (z) => lerp(STAB.root, STAB.tip, z / STAB.semi);
const stabY = (z) => STAB.y + z * Math.tan(STAB.dihedral * DEG);
const FIN = { le: 1880, root: 880, tip: 330, y: 250, h: TAIL.fin, tan: Math.tan(38 * DEG), thick: 0.1 };
const finLE = (y) => FIN.le + (y - FIN.y) * FIN.tan;
const finChord = (y) => lerp(FIN.root, FIN.tip, (y - FIN.y) / FIN.h);
const foilAround = 24;
function foil(lead, chord, thick, j) {
  const a = (2 * Math.PI * j) / foilAround;
  const c = Math.cos(a);
  const u = 0.5 - 0.5 * c;
  const t = Math.sin(a) * (0.62 + 0.38 * c) * chord * thick * 0.5;
  return [lead + u * chord, t];
}
function lifting(s, zs, LE, CH, Y, TH) {
  const rows = zs.map((z, i) => {
    const end = i === zs.length - 1;
    const row = [];
    for (let j = 0; j < foilAround; j++) {
      const [x, t] = foil(LE(z), CH(z), TH(z) * (end ? 0.05 : 1), j);
      row.push([x, Y(z) + t, s * (z + (end ? 4 : 0))]);
    }
    return row;
  });
  return skin(rows, { wrap: true });
}
const run = (list, pts, closed = false) => {
  for (let i = 0; i < pts.length - 1; i++) list.push(...pts[i], ...pts[i + 1]);
  if (closed) list.push(...pts.at(-1), ...pts[0]);
};
function segments(list, material, parent) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(list);
  const lines = new LineSegments2(geo, material);
  lines.frustumCulled = false;
  lines.renderOrder = 2;
  parent.add(lines);
  return lines;
}
const circle = (r, y = 0, n = 128) => Array.from({ length: n }, (_, k) => [r * Math.cos((2 * Math.PI * k) / n), y, r * Math.sin((2 * Math.PI * k) / n)]);

/* ───────────────────────────────────────── shaders ───────────────────────────────────────── */

const NOISE = /* glsl */ `
  float hash2(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), u.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) { return vnoise(p) * 0.6 + vnoise(p * 2.03 + 3.1) * 0.27 + vnoise(p * 4.1 + 7.7) * 0.13; }
  // an anti-aliased line on the integer levels of h, faded where the levels crowd under the pixel
  float levels(float h) {
    float fw = max(fwidth(h), 1e-5);
    float f = fract(h);
    float d = min(f, 1.0 - f) / fw;
    return (1.0 - smoothstep(0.55, 1.5, d)) * (1.0 - smoothstep(0.18, 0.45, fw));
  }
`;

// THE BOTTOM: contours at five scales, ripples near the box, the halo under it, the lamp's spot
const floorMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: INK.clone() }, uAmount: { value: 1 }, uSee: { value: 1000 }, uPool: { value: 0 },
      uLamp: { value: new THREE.Vector3() }, uLit: { value: 0 }, uLampR: { value: BEAM.radius },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec2 vP;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vP = position.xy; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uLamp; uniform float uAmount, uSee, uPool, uLit, uLampR; varying vec3 vW; varying vec2 vP;
      ${NOISE}
      void main() {
        vec2 p = vec2(vP.x, -vP.y); // the plane's own (x, z): the sea only moves in y
        float dist = length(cameraPosition - vW);
        float fp = max(length(fwidth(p)), 1e-4); // cm per pixel here
        float lines = 0.0;
        // five scales of contours: each shows once its cells are wide on screen, and steps back when they are huge
        for (int k = 0; k < 5; k++) {
          float S = 70.0 * pow(10.0, float(k));
          float cell = S / fp;
          float w = smoothstep(22.0, 80.0, cell) * (1.0 - 0.55 * smoothstep(500.0, 3000.0, cell));
          lines = max(lines, levels(fbm(p / S + float(k) * 17.3) * 4.0) * w);
        }
        // ripples of sediment around where the box lies
        float r = length(p);
        float rip = (p.x * 0.93 + p.y * 0.37) / 11.0 + 1.1 * sin(p.y / 47.0 + 0.7 * sin(p.x / 63.0));
        lines = max(lines, levels(rip) * 0.8 * smoothstep(380.0, 110.0, r) * smoothstep(9.0, 30.0, 11.0 / fp));
        float fade = exp(-dist / uSee);
        // the lamp's spot (the wreck field is lit), the halo the box lies on
        vec2 dl = p - uLamp.xz;
        float spot = uLit * exp(-dot(dl, dl) / (uLampR * uLampR));
        float halo = uPool * pow(clamp(1.0 - r / 80.0, 0.0, 1.0), 2.4);
        float c = (lines * (0.3 + 0.45 * spot) + 0.035 * spot) * uAmount * fade + halo;
        gl_FragColor = vec4(uColor * c, 1.0);
      }`,
  });

// THE SURFACE from below: a faint wavy net, only near
const surfaceMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uTime; varying vec3 vW;
      ${NOISE}
      void main() {
        if (uAmount < 0.003) discard;
        // the swell from below: long crests, gently bent, drifting
        vec2 p = vW.xz;
        float h = (p.x * 0.8 + p.y * 0.6) / 260.0 + 0.35 * sin(p.y / 310.0 + uTime * 0.3) + 0.22 * sin(p.x / 170.0 - uTime * 0.25);
        float net = levels(h);
        float dist = length(cameraPosition - vW);
        float fade = exp(-dist / 4200.0);
        // where the eye looks straight up, the sky's last light (Snell's window), very faint
        float up = clamp((vW.y - cameraPosition.y) / max(dist, 1.0), 0.0, 1.0);
        float c = (net * 0.2 + 0.05 * pow(up, 6.0)) * fade * uAmount;
        gl_FragColor = vec4(uColor * c, 1.0);
      }`,
  });

// A SPHERE OF LIGHT that draws only its silhouette (a ring on screen), cut under the bottom. `uK` > 0: its radius
// grows with the camera's distance (k · phase · distance: the same pace on screen at any scale), up to `uReach`.
const sphereMat = (color) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uAlpha: { value: 0 }, uFloorY: { value: -1e9 },
      uPh: { value: 0 }, uK: { value: 0 }, uReach: { value: 1 }, uLine: { value: 0.9 },
    },
    vertexShader: /* glsl */ `
      uniform float uPh, uK, uReach; varying vec3 vW; varying vec3 vN;
      void main() {
        vec3 c = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        float r = uK > 0.0 ? min(uReach, 2.0 + uK * uPh * length(cameraPosition - c)) : uReach;
        vec4 w = vec4(c + mat3(modelMatrix) * position * r, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * position);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAlpha, uFloorY, uLine; varying vec3 vW; varying vec3 vN;
      void main() {
        if (uAlpha < 0.003 || vW.y < uFloorY) discard;
        vec3 v = normalize(cameraPosition - vW);
        float g = clamp(1.0 - abs(dot(normalize(vN), v)), 0.0, 1.0);
        float l = 0.16 * pow(g, 3.0) + uLine * smoothstep(0.8, 0.985, g);
        gl_FragColor = vec4(uColor * l * uAlpha, 1.0);
      }`,
  });

// THE MARINE SNOW: motes in a cube that follows the camera, drawn as streaks along their run
const snowMat = (dir) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uAmount: { value: 0 }, uScale: { value: 1 }, uDir: { value: dir }, uV: { value: 70 },
      uCube: { value: 900 }, uStreak: { value: 0.09 }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) },
      uColor: { value: INK.clone().multiplyScalar(2.4) }, uLamp: { value: new THREE.Vector3() }, uLit: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime, uAmount, uScale, uDir, uV, uCube, uStreak, uLit; uniform vec2 uView; uniform vec3 uLamp;
      attribute vec4 aSeed; varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
      void main() {
        vec3 vel = vec3(0.0, uDir * uV * (0.6 + 0.8 * aSeed.y), 0.0);
        vec3 wob = vec3(sin(uTime * 0.37 * aSeed.y + aSeed.x * 6.28), cos(uTime * 0.29 * aSeed.y + aSeed.x * 4.1), sin(uTime * 0.33 + aSeed.x * 9.4)) * 2.5;
        vec3 lo = cameraPosition - 0.5 * uCube;
        vec3 p = position * uCube + vel * mod(uTime, 1000.0) + wob;
        p = lo + mod(p - lo, vec3(uCube));
        vec3 q = (p - lo) / uCube;
        float edge = smoothstep(0.0, 0.12, q.x) * smoothstep(1.0, 0.88, q.x) * smoothstep(0.0, 0.12, q.y) * smoothstep(1.0, 0.88, q.y) * smoothstep(0.0, 0.12, q.z) * smoothstep(1.0, 0.88, q.z);
        float near = smoothstep(18.0, 70.0, length(p - cameraPosition));
        vec4 mv = viewMatrix * vec4(p, 1.0);
        vec4 c0 = projectionMatrix * mv;
        vec4 c1 = projectionMatrix * viewMatrix * vec4(p - vel * uStreak, 1.0);
        vec2 runv = c1.w > 0.0 && c0.w > 0.0 ? (c0.xy / c0.w - c1.xy / c1.w) * 0.5 * uView : vec2(0.0);
        float len = min(length(runv), 160.0);
        float size = max(2.2, aSeed.z * uScale / max(0.5, -mv.z));
        gl_PointSize = size + len;
        gl_Position = c0;
        gl_Position.xy -= (len > 0.5 ? normalize(runv) * len : vec2(0.0)) / uView * c0.w;
        vDir = len > 0.5 ? normalize(runv) : vec2(1.0, 0.0);
        vDot = size / (size + len);
        vHalf = 0.5 * (1.0 - vDot);
        // the lamp's cone lights the snow under it
        vec2 dl = p.xz - uLamp.xz;
        float lit = uLit * exp(-dot(dl, dl) / 9.0e6) * step(p.y, uLamp.y);
        vA = aSeed.w * uAmount * edge * near * pow(vDot, 0.3) * (1.0 + 2.5 * lit);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
      void main() {
        if (vA < 0.002) discard;
        vec2 q = gl_PointCoord - 0.5;
        q.y = -q.y;
        float along = max(abs(dot(q, vDir)) - vHalf, 0.0);
        float across = dot(q, vec2(-vDir.y, vDir.x));
        float d = length(vec2(along, across)) / (0.5 * vDot);
        float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.0);
        gl_FragColor = vec4(uColor * a * vA, 1.0);
      }`,
  });

// THE LAMP: a quad that faces the camera about the vertical — a white core, a halo, a long trail up its cable
const lampMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uAmount: { value: 0 }, uCore: { value: 45 }, uHalo: { value: 260 }, uTrail: { value: 9000 }, uColor: { value: INK.clone() } },
    vertexShader: /* glsl */ `
      uniform float uHalo, uTrail; varying vec2 vQ;
      void main() {
        vec3 c = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vec3 right = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]) * vec3(1.0, 0.0, 1.0) + vec3(1e-4, 0.0, 0.0));
        float W = uHalo * 3.0;
        float x = position.x * W;
        float y = mix(-W * 0.5, uTrail, position.y + 0.5);
        vQ = vec2(x, y);
        gl_Position = projectionMatrix * viewMatrix * vec4(c + right * x + vec3(0.0, y, 0.0), 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount, uCore, uHalo, uTrail; uniform vec3 uColor; varying vec2 vQ;
      void main() {
        if (uAmount < 0.003) discard;
        float W = uHalo * 1.5;
        float r = length(vQ);
        float core = exp(-pow(r / uCore, 2.0)) * 2.4;
        float halo = 0.55 * (1.0 / (1.0 + pow(r / (uHalo * 0.35), 2.0))) * (1.0 - smoothstep(W * 0.6, W, r));
        float up = clamp(vQ.y / uTrail, 0.0, 1.0);
        float trail = vQ.y > 0.0 ? 0.5 * exp(-pow(vQ.x / (uCore * 0.6), 2.0)) * pow(1.0 - up, 2.0) : 0.0;
        gl_FragColor = vec4(uColor * (core + halo + trail) * uAmount, 1.0);
      }`,
  });

// THE CONE of the lamp: a very faint ink bell, brighter near the lamp and on its edges
const coneMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uAmount: { value: 0 }, uColor: { value: INK.clone() } },
    vertexShader: /* glsl */ `
      varying float vH; varying vec3 vW; varying vec3 vN;
      void main() { vH = position.y + 0.5; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount; uniform vec3 uColor; varying float vH; varying vec3 vW; varying vec3 vN;
      void main() {
        if (uAmount < 0.003) discard;
        vec3 v = normalize(cameraPosition - vW);
        float g = clamp(1.0 - abs(dot(normalize(vN), v)), 0.0, 1.0);
        float c = (0.018 + 0.05 * pow(g, 4.0)) * (0.3 + 0.7 * vH);
        gl_FragColor = vec4(uColor * c * uAmount, 1.0);
      }`,
  });

// THE BOX AS A POINT: where the recorder lies, once it would be smaller than a few pixels
const dotMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: VEILLE.clone() }, uPx: { value: 2400 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uPx; varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float boxPx = 34.0 * uPx / max(1.0, -mv.z);
        vA = smoothstep(9.0, 4.0, boxPx);
        gl_PointSize = 30.0;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float c = exp(-d * d * 22.0) * 2.2 + 0.35 * pow(clamp(1.0 - d, 0.0, 1.0), 2.0);
        gl_FragColor = vec4(uColor * c * vA * uAmount, 1.0);
      }`,
  });

/* ───────────────────────────────────────── the wreck of glass ───────────────────────────────────────── */

// the tail section, in 023's frame, re-centred on TC; the break is at BREAK (jagged)
const BREAK = 1300;
const TC = [2150, 300, 0];
function buildTail() {
  const g = new THREE.Group();
  g.rotation.order = "YXZ";
  const inner = new THREE.Group();
  inner.position.set(-TC[0], -TC[1], -TC[2]);
  g.add(inner);
  const hull = glass(BRAND.ink, { base: 0.004, rim: 0.2, power: 2.6, edge: 0.45, spec: 0.3, through: 0.26 });
  const wings = glass(BRAND.ink, { base: 0.006, rim: 0.18, power: 2.4, edge: 0.42, spec: 0.35, through: 0.22 });
  const R = rng(34);
  const jag = Array.from({ length: AROUND }, (_, j) => 16 * Math.sin(j * 2.3 + 0.4) + (R() - 0.5) * 62 * (0.4 + 0.6 * Math.abs(Math.sin(j * 0.37))));
  const xs = [];
  for (let x = BREAK; x < 2980; x += 40) xs.push(x);
  xs.push(2980);
  const rings = xs.map((x, i) =>
    Array.from({ length: AROUND }, (_, j) => {
      const a = (2 * Math.PI * j) / AROUND;
      return onSkin(i === 0 ? x + jag[j] : x, a);
    }),
  );
  const meshes = [];
  const pane = (geo, mat) => {
    const m = new THREE.Mesh(geo, mat);
    m.frustumCulled = false;
    inner.add(m);
    meshes.push(m);
    return m;
  };
  pane(skin(rings, { wrap: true }), hull);
  const stabs = [1, -1].map((s) => pane(lifting(s, [0, 300, 600, STAB.semi - 20, STAB.semi], stabLE, stabChord, stabY, () => STAB.thick), wings));
  {
    const rows = [];
    const ys = [FIN.y - 40, FIN.y, FIN.y + 220, FIN.y + 480, FIN.y + FIN.h - 20, FIN.y + FIN.h];
    ys.forEach((y, i) => {
      const yy = Math.max(FIN.y, y);
      const end = i === ys.length - 1;
      const row = [];
      for (let j = 0; j < foilAround; j++) {
        const [x, t] = foil(finLE(yy) - (i === 0 ? 30 : 0), finChord(yy) + (i === 0 ? 60 : 0), FIN.thick * (end ? 0.05 : 1), j);
        row.push([x, y + (end ? 4 : 0), t]);
      }
      rows.push(row);
    });
    pane(skin(rows, { wrap: true }), wings);
  }
  asShell(meshes, 20);
  // lines: frames and the crown; the outline of the fin and the stabilisers; the break, its own (signal while it sinks)
  const frames = [];
  const outline = [];
  const brk = [];
  for (const x of [1500, 1850, 2200, 2550]) run(frames, Array.from({ length: AROUND / 2 }, (_, j) => onSkin(x, (4 * Math.PI * j) / AROUND, 1)), true);
  const along = (fn, x0, x1, step = 40) => {
    const pts = [];
    for (let x = x0; x <= x1; x += step) pts.push(fn(x));
    return pts;
  };
  run(frames, along((x) => onSkin(x, Math.PI / 2, 1), BREAK + 80, 2970));
  run(frames, along((x) => onSkin(x, -Math.PI / 2, 1), BREAK + 80, 2600));
  for (const s of [1, -1]) run(frames, along((x) => { const a = Math.asin(Math.max(-1, Math.min(1, (25 - section(x).mid) / section(x).hh))); return onSkin(x, s > 0 ? a : Math.PI - a, 1); }, BREAK + 80, 2250, 50));
  const fn = (y, f) => [finLE(y) + f * finChord(y), y, 0];
  run(outline, [fn(FIN.y + 10, 0), fn(FIN.y + FIN.h, 0), fn(FIN.y + FIN.h, 1), fn(FIN.y + 10, 1)]);
  // the rudder's hinge line
  run(frames, [fn(FIN.y + 20, 0.7), fn(FIN.y + FIN.h - 10, 0.66)]);
  const stabLines = [1, -1].map((s) => {
    const list = [];
    const st = (z, f) => [stabLE(z) + f * stabChord(z), stabY(z), s * z];
    run(list, [st(240, 0), st(STAB.semi, 0), st(STAB.semi, 1), st(240, 1)]);
    run(list, [st(260, 0.7), st(STAB.semi - 30, 0.68)]);
    return list;
  });
  run(outline, along((x) => onSkin(x, 0, 0.5), 2930, 2980, 10));
  run(brk, rings[0].map((p) => [p[0], p[1] * 1.004, p[2] * 1.004]), true);
  const mats = {
    hull, wings,
    frames: lineMat(BRAND.ink, 1.8, { opacity: 0.26 }),
    outline: lineMat(BRAND.ink, 2.2, { opacity: 0.75 }),
    brk: lineMat(BRAND.ink, 2.4, { opacity: 0.8 }),
  };
  segments(frames, mats.frames, inner);
  segments(outline, mats.outline, inner);
  const stabOut = stabLines.map((l) => segments(l, mats.outline, inner));
  segments(brk, mats.brk, inner);
  return { g, mats, stabs, stabOut };
}

// a broken barrel of fuselage, its axis along x: the skin over [a0, a1], jagged ends, its frames, a window belt
function buildBarrel({ len, a0, a1, seed, frames: nf = 4, windows = false, hoops = false }) {
  const g = new THREE.Group();
  const R = rng(seed);
  const r = FUSE.r;
  const nA = 36;
  const N = 8;
  const jl = Array.from({ length: nA + 1 }, () => (R() - 0.5) * 110);
  const jr = Array.from({ length: nA + 1 }, () => (R() - 0.5) * 110);
  const at = (x, a, l = 0) => [x, (r + l) * Math.sin(a), (r + l) * Math.cos(a)];
  const rows = [];
  for (let i = 0; i <= N; i++) {
    const x = -len / 2 + (len * i) / N;
    rows.push(Array.from({ length: nA + 1 }, (_, j) => {
      const a = a0 + ((a1 - a0) * j) / nA;
      const xx = i === 0 ? x + jl[j] : i === N ? x + jr[j] : x;
      return at(xx, a);
    }));
  }
  const mat = glass(BRAND.ink, { base: 0, rim: 0.13, power: 3, edge: 0.34, spec: 0.2, through: 0.24 });
  const mesh = new THREE.Mesh(skin(rows), mat);
  mesh.frustumCulled = false;
  g.add(mesh);
  asShell(mesh, 20);
  const lines = [];
  const edge = [];
  for (let k = 0; k < nf; k++) {
    const x = -len / 2 + (len * (k + 0.5)) / nf;
    const pts = [];
    const b0 = hoops ? a0 - 0.3 * Math.PI - 0.15 * k : a0; // hoops: frames that outlived their skin, broken too
    const b1 = hoops ? a1 + 0.25 * Math.PI + 0.1 * k : a1;
    for (let j = 0; j <= 40; j++) pts.push(at(x, b0 + ((b1 - b0) * j) / 40, 1));
    run(lines, pts);
  }
  run(edge, rows[0]);
  run(edge, rows[N]);
  run(edge, rows.map((row) => row[0]));
  run(edge, rows.map((row) => row[nA]));
  if (windows) {
    const aw = Math.asin(25 / r);
    for (let k = -4; k <= 4; k++) {
      const x = k * 53.3;
      if (Math.abs(x) > len / 2 - 60) continue;
      const pts = [];
      for (let j = 0; j <= 12; j++) {
        const t = (2 * Math.PI * j) / 12;
        pts.push(at(x + 11 * Math.cos(t), aw + (16 / r) * Math.sin(t), 1));
      }
      run(lines, pts);
    }
  }
  const mats = { mat, lines: lineMat(BRAND.ink, 1.8, { opacity: 0.3 }), edge: lineMat(BRAND.ink, 2.0, { opacity: 0.6 }) };
  segments(lines, mats.lines, g);
  segments(edge, mats.edge, g);
  return { g, mats };
}

// an engine, lying: the nacelle of glass (023's numbers: r 150, length 520), its fan, its spinner
function buildEngine() {
  const g = new THREE.Group();
  const rOf = (u) => (u < 0.08 ? lerp(132, 150, u / 0.08) : u < 0.55 ? 150 : lerp(150, 100, (u - 0.55) / 0.45));
  const L = 520;
  const rows = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    rows.push(Array.from({ length: 40 }, (_, j) => {
      const a = (2 * Math.PI * j) / 40;
      return [-L / 2 + u * L, rOf(u) * Math.sin(a), rOf(u) * Math.cos(a)];
    }));
  }
  const mat = glass(BRAND.ink, { base: 0, rim: 0.14, power: 3, edge: 0.36, spec: 0.25, through: 0.24 });
  const mesh = new THREE.Mesh(skin(rows, { wrap: true }), mat);
  mesh.frustumCulled = false;
  g.add(mesh);
  asShell(mesh, 20);
  const lines = [];
  const ring = (x, r, n = 48) => Array.from({ length: n }, (_, j) => [x, r * Math.sin((2 * Math.PI * j) / n), r * Math.cos((2 * Math.PI * j) / n)]);
  run(lines, ring(-L / 2 + 60, 128), true);
  run(lines, ring(-L / 2, 132), true);
  run(lines, ring(L / 2, 100), true);
  for (let k = 0; k < 18; k++) {
    const a = (2 * Math.PI * k) / 18;
    run(lines, [[-L / 2 + 60, 30 * Math.sin(a), 30 * Math.cos(a)], [-L / 2 + 66, 125 * Math.sin(a + 0.25), 125 * Math.cos(a + 0.25)]]);
  }
  run(lines, [[-L / 2 + 10, 0, 0], [-L / 2 + 60, 30, 0]]);
  run(lines, [[-L / 2 + 10, 0, 0], [-L / 2 + 60, -30, 0]]);
  const mats = { mat, lines: lineMat(BRAND.ink, 1.8, { opacity: 0.34 }) };
  segments(lines, mats.lines, g);
  return { g, mats };
}

/* ───────────────────────────────────────── the sea ───────────────────────────────────────── */

export function buildFond() {
  const group = new THREE.Group();
  const sea = new THREE.Group(); // everything on the bottom: moves with `depth`
  group.add(sea);

  // the bottom: one plane of lines, 1 000 km wide
  // (two planes: varyings interpolated over a 1 000 km triangle are centimetres off near the camera — the near one is
  //  fine-grained and used up close, the far one only for the wide shots; they share their uniforms)
  const fmat = floorMat();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1.2e6, 1.2e6, 48, 48), fmat);
  const floorFar = new THREE.Mesh(new THREE.PlaneGeometry(1.2e8, 1.2e8, 1, 1), fmat);
  for (const f of [floor, floorFar]) {
    f.rotation.x = -Math.PI / 2;
    f.position.y = -0.6;
    f.frustumCulled = false;
    f.renderOrder = 1;
    sea.add(f);
  }
  const fu = fmat.uniforms;

  // the surface, seen from below (placed apart: y = depth·100)
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(1.2e6, 1.2e6, 32, 32), surfaceMat());
  surface.rotation.x = -Math.PI / 2;
  surface.frustumCulled = false;
  group.add(surface);
  const su = surface.material.uniforms;

  // the water column, for the wide shots: the bottom's and the surface's circles, a glass drum between them
  const COL = 260000;
  const colMat = lineMat(BRAND.ink, 2.0, { opacity: 0 });
  const colLines = [];
  run(colLines, circle(COL, 0, 160), true);
  const colBottom = segments(colLines, colMat, sea);
  const topLines = [];
  run(topLines, circle(COL, 0, 160), true);
  const colTopMat = lineMat(BRAND.ink, 2.0, { opacity: 0 });
  const colTop = segments(topLines, colTopMat, group);
  const drumMat = glass(BRAND.ink, { base: 0, rim: 0.16, power: 4, edge: 0.3 });
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(COL, COL, 1, 96, 1, true), drumMat);
  drum.frustumCulled = false;
  sea.add(drum);

  // the marine snow: three layers (rising, falling, floating) over the same motes
  const SNOW = 2600;
  const snowGeo = new THREE.BufferGeometry();
  {
    const R = rng(3409);
    const pos = new Float32Array(SNOW * 3);
    const seeds = new Float32Array(SNOW * 4);
    for (let i = 0; i < SNOW; i++) {
      pos.set([R(), R(), R()], i * 3);
      seeds.set([R(), R(), 0.12 + Math.pow(R(), 2.4) * 0.5, 0.3 + R() * 0.7], i * 4);
    }
    snowGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    snowGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  }
  const snow = [1, -1, 0].map((dir) => {
    const pts = new THREE.Points(snowGeo, snowMat(dir));
    pts.frustumCulled = false;
    pts.renderOrder = 4;
    group.add(pts);
    return pts;
  });

  // the wreck: the tail (sinking, then on the bottom), the debris field
  const tail = buildTail();
  group.add(tail.g);
  const LAY = [
    { len: 620, a0: -0.35 * Math.PI, a1: 1.05 * Math.PI, seed: 11, frames: 5, rot: [0.2, 0.75, 0.1], y: 170 }, // a barrel, broken open
    { len: 560, a0: -0.1 * Math.PI, a1: 0.42 * Math.PI, seed: 12, frames: 3, windows: true, rot: [-1.25, -0.4, 0], y: 90 }, // a panel of windows
    { len: 480, a0: 0.15 * Math.PI, a1: 0.85 * Math.PI, seed: 13, frames: 5, hoops: true, rot: [0.1, 2.1, 0.05], y: 110 }, // hoops of frames
  ];
  const debris = WRECK.pieces.map((p, i) => {
    const piece = i < 3 ? buildBarrel(LAY[i]) : buildEngine();
    const lay = LAY[i] ?? { rot: [0.25, -0.9, 0.06], y: 125 };
    piece.g.position.set(p[0], lay.y, p[2]);
    piece.g.rotation.set(...lay.rot);
    sea.add(piece.g);
    return piece;
  });

  // the rings: born at the beacon's nose — hung on the box's pivot once world.js has added it (it follows spin, tilt)
  const ringBox = new THREE.Group();
  ringBox.position.set(BEACON.to, BEACON.y, 0);
  group.add(ringBox);
  const ring = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), sphereMat(VEILLE.clone().multiplyScalar(2.2)));
  ring.frustumCulled = false;
  ring.renderOrder = 5;
  ringBox.add(ring);
  const ru = ring.material.uniforms;
  ru.uReach.value = PING.reach;
  let pivot = null;
  // the reach: a dome over the bottom, its footprint, the box as a point
  const reach = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 48), sphereMat(VEILLE.clone().multiplyScalar(1.3)));
  reach.position.set(0, REC.centre[1], 0);
  reach.frustumCulled = false;
  reach.renderOrder = 5;
  group.add(reach);
  const reu = reach.material.uniforms;
  reu.uReach.value = PING.reach;
  reu.uLine.value = 0.7;
  const footMat = lineMat(BRAND.veille, 2.2, { opacity: 0 });
  const foot = [];
  run(foot, circle(PING.reach, 30, 160), true);
  segments(foot, footMat, sea);
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, REC.centre[1], 0]), 3));
  const dot = new THREE.Points(dotGeo, dotMat());
  dot.frustumCulled = false;
  dot.renderOrder = 9;
  group.add(dot);
  const du = dot.material.uniforms;

  // the light that comes down: the lamp, its cone (apex at the lamp, base on the bottom)
  const lamp = new THREE.Object3D();
  sea.add(lamp);
  const lampQuad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lampMat());
  lampQuad.frustumCulled = false;
  lampQuad.renderOrder = 6;
  lamp.add(lampQuad);
  const lu = lampQuad.material.uniforms;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 64, 1, true), coneMat());
  cone.frustumCulled = false;
  cone.renderOrder = 3;
  sea.add(cone);
  const cu = cone.material.uniforms;

  const field = new THREE.Object3D();
  field.position.set(BEAM.at[0], 0, BEAM.at[2]);
  sea.add(field);
  const A = { tail: tail.g, field, lamp, surface };

  // what update() leaves for fog(d)
  const st = { shell: 1, floorGap: 0, beam: 0 };
  const tailCol = new THREE.Color();

  return {
    group, A,
    fog(d) {
      // the fog only touches the solid box: a 30 m tail of glass reads from 1.5 m away, the column from 11 km
      const D = Math.max(1, d);
      // the snow lives near the camera: gone from the wide, diagrammatic shots
      const snowK = 1 - smooth(20000, 120000, D);
      for (const s of snow) s.material.uniforms.uAmount.value *= snowK;
      // the bottom fades with distance on the camera's scale (and with how far below the box it is)
      fu.uSee.value = Math.max(4000, D * 2.6);
      floor.visible = D <= 40000;
      floorFar.visible = D > 40000;
      // the column's circles and drum: only for the wide shots
      const wide = smooth(120000, 500000, D) * st.shell;
      colMat.opacity = 0.55 * wide;
      colTopMat.opacity = 0.55 * wide;
      drumMat.uniforms.uAmount.value = 0.8 * wide;
      colBottom.visible = colTop.visible = drum.visible = wide > 0.005;
      return 0.45 / Math.max(5000, D * 2.4);
    },
    update(P = {}, time = 0, px = 1) {
      const depth = P.depth ?? DEEP.first;
      const floorY = -(DEEP.floor - depth) * 100;
      const shell = clamp01(P.shell ?? 1);
      const w = clamp01(P.wreck ?? 0);
      const mood = clamp01(P.mood ?? 0);
      st.shell = shell;
      sea.position.y = floorY;
      surface.position.y = depth * 100;
      colTop.position.y = depth * 100;
      drum.scale.y = Math.max(1, DEEP.floor * 100);
      drum.position.y = (DEEP.floor * 100) / 2;

      // the snow
      const rush = Math.max(-1, Math.min(1, P.rush ?? 0));
      const amt = [Math.max(0, rush), Math.max(0, -rush), 1 - Math.abs(rush)];
      snow.forEach((s, k) => {
        const u = s.material.uniforms;
        u.uTime.value = time;
        u.uScale.value = px;
        u.uAmount.value = amt[k] * shell * 0.9;
        s.visible = amt[k] * shell > 0.01;
      });

      // the surface: a faint net, only while it is near
      su.uTime.value = time;
      su.uAmount.value = shell * (1 - smooth(60, 170, depth));
      surface.visible = su.uAmount.value > 0.003;

      // the bottom; the halo the box lies on, while it lies there
      fu.uAmount.value = shell;
      fu.uPool.value = clamp01(P.pool ?? 0) * 0.5 * (1 - smooth(50, 400, -floorY));

      // the tail: sinking near the box, slower than it (it climbs as the box goes down), turning slowly → on the bottom
      const fall = (depth - DEEP.first) * 100;
      const sinkY = SINK.at[1] + fall * 0.25;
      const turn = fall * 0.00008;
      tail.g.position.set(
        lerp(SINK.at[0] - fall * 0.04, WRECK.tail[0], w),
        lerp(sinkY, floorY + 205, w),
        lerp(SINK.at[2], WRECK.tail[2], w),
      );
      tail.g.rotation.set(lerp(SINK.rx + turn, -90 * DEG, w), lerp(SINK.ry + turn * 0.6, 0.55, w), lerp(SINK.rz, 4 * DEG, w));
      const lying = w > 0.5;
      tail.stabs[1].visible = tail.stabOut[1].visible = !lying; // lying on its side, the lower stabiliser is gone into the silt
      // lit by the lamp once it is near the bottom
      const b = clamp01(P.beam ?? 0);
      const lit = smooth(0.55, 1, b);
      st.beam = lit;
      const gain = (1 + 1.4 * lit * w) * shell;
      const edgeK = mood * (1 - w);
      tailCol.copy(INK).lerp(SIGNAL, 0.18 * edgeK);
      for (const m of [tail.mats.hull, tail.mats.wings]) {
        m.uniforms.uAmount.value = gain;
        m.uniforms.uColor.value.copy(tailCol);
      }
      tail.mats.frames.opacity = 0.26 * shell * (1 + 0.8 * lit * w);
      tail.mats.outline.opacity = 0.75 * shell;
      tail.mats.brk.color.copy(INK).lerp(SIGNAL, edgeK);
      tail.mats.brk.opacity = (0.5 + 0.2 * edgeK) * shell;
      tail.g.visible = shell > 0.005;
      for (const piece of debris) {
        piece.mats.mat.uniforms.uAmount.value = (0.45 + 1.9 * lit) * shell;
        piece.mats.lines.opacity = shell * (0.24 + 0.36 * lit);
        if (piece.mats.edge) piece.mats.edge.opacity = 0.6 * shell;
        piece.g.visible = shell > 0.005;
      }

      // the rings: one a ping, growing at the screen's pace, stopped by the reach
      if (!pivot) {
        pivot = group.children.find((c) => c.isGroup && c.rotation.order === "YZX" && c !== tail.g) ?? null;
        if (pivot) {
          pivot.add(ringBox);
          ringBox.position.set(BEACON.to - REC.centre[0], BEACON.y - REC.centre[1], -REC.centre[2]);
        }
      }
      const ping = clamp01(P.ping ?? 0);
      const ph = (((time - PING.at) / PING.period) % 1 + 1) % 1;
      ru.uPh.value = ph;
      ru.uK.value = 700 / (0.8 * Math.max(1, px));
      ru.uAlpha.value = ping * Math.pow(1 - ph, 1.4) * smooth(0, 0.04, ph);
      ru.uFloorY.value = floorY;
      ring.visible = ping > 0.01;
      // the reach: a dome over the bottom (it pulses faintly as each ring dies on it)
      const range = clamp01(P.range ?? 0);
      reu.uFloorY.value = floorY;
      reu.uAlpha.value = range * (0.55 + 0.25 * ping * Math.pow(1 - ph, 3));
      reach.visible = range > 0.01;
      footMat.opacity = 0.6 * range;
      // the box as a point: veille while its beacon lives, ink once it is dead
      du.uPx.value = px;
      du.uColor.value.copy(ping > 0.01 ? VEILLE : INK).multiplyScalar(ping > 0.01 ? 1 : 0.8);
      du.uAmount.value = Math.max(range, 1.4);

      // the light that comes down: its head from the surface down to BEAM.stop above the bottom
      // once the recorder is off the bottom (the module rising), the lamp rides a few metres above it
      const top = depth * 100 - floorY;
      const gap = -floorY;
      const follow = smooth(40, 700, gap);
      const head = lerp(top + (BEAM.stop - top) * b, Math.max(BEAM.stop, gap + 650), follow);
      const lx = lerp(BEAM.at[0], -260, follow);
      const lz = lerp(BEAM.at[2], -180, follow);
      lamp.position.set(lx, head, lz);
      lu.uAmount.value = b > 0.003 ? 1 : 0;
      lampQuad.visible = b > 0.003;
      cone.visible = b > 0.003;
      cone.scale.set(BEAM.radius, Math.max(1, head), BEAM.radius);
      cone.position.set(lx, head / 2, lz);
      cu.uAmount.value = shell * (0.35 + 0.65 * lit);
      fu.uLamp.value.set(lx, head, lz);
      fu.uLit.value = lit;
      for (const s of snow) {
        s.material.uniforms.uLamp.value.set(lx, head + floorY, lz);
        s.material.uniforms.uLit.value = lit;
      }
    },
  };
}

/** The tail's attitude while it sinks (Euler YXZ, rad): nose (the break) down. Set on the first-frame planche. */
// Its centre, relative to the box (= WRECK.tailSink: plan.js should carry these numbers): above, behind and a little
// to the right of the box for the az −28 family of first frames; its fin seen flat from the camera, its break down-left.
const SINK = { at: [1250, 3080, -2120], rx: 0.91, ry: -0.5, rz: 35 * DEG };
