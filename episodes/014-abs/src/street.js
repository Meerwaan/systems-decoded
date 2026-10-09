// DOSSIER 014 — ABS : the street. A wet road in the rain, a truck stopped in your lane, the car seen like an
// X-ray, and you at the wheel.
//
//   buildStreet() → { group, A, update(p, time, px) }
//   p = { shell, gap, lane, yaw, steer, dive, rain, truck, skid, you, kmh, rolled, brake, pulse }
//
// THE FRAME IS THE CAR'S: it never moves. The road, its paint, the rain and the truck live in two nested groups —
// `pivot` (turns by −yaw around the car) › `slide` (slides by +lane to the right) — and scroll with `gap`: the
// truck's rear face stands at z = CAR.nose − 100·gap, everything fixed to the road is drawn at s = z + 100·gap.
//
// The car is 011's (one skin lofted through sections, a glass that knows its panes from its panels, every line
// taken on that skin, seats, dashboard, you) — without the wall, the crash, the airbags. Three of its wheels are
// drawn here, in glass: the front-left one, its brake and the pedal are the film's system (model.js), solid.
// The truck is the one solid thing of this street: the threat. Signal is its lights, their long reflections in
// the water, and the straight trails of locked wheels.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeGeometries as mergeBare } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, setGlow, glass, asShell, lineMat, box, cyl, lathe, placed, anchor, makePart, addMesh, setPartOpacity, SOFTBOX } from "@kit/build3d.js";
import { CAR, YOU, STEERING, HUB, TYRE, pedalPad, LANE, TRUCK } from "./plan.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const FRONT = V(0, 0, 1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const NOSE = CAR.nose;
const TAIL = CAR.tail;
const ARCH = 39.5; // the radius of a wheel arch
const DOOR = { z0: -70, z1: 47.5 }; // your door: its two cuts
const DIVE = { deg: 2.5, y: CAR.wheel, z: -20 }; // the body pitches about this line: at `dive` 1 the front arch just kisses its tyre
const SPIN = 100 * DEG; // the steering wheel at `steer` ±1
const LOCK = 30 * DEG; // the front wheels at `steer` ±1
const SHUTTER = 0.5 / 30; // how long the stage's shutter stays open (s): what moves is spread over that
const FALL = 820; // how fast the rain falls (cm/s)
const EDGE = LANE.w / 2; // from the middle of your lane to its paint
const LIGHT = { x: 97, y: 99 }; // the truck's tail lamps: one cluster each side, under the floor
// where the four tyres touch the road, in the car's frame: FL (model.js draws that wheel), FR, RL, RR
const WHEELS = [[HUB[0], HUB[2]], [-HUB[0], HUB[2]], [-CAR.track, CAR.rear], [CAR.track, CAR.rear]];

/* ───────────────────────────────────────────────────────────── the body: sections along the car (011) */

/** A smooth function through [z, value] points (a monotone cubic: it never overshoots between two of them). */
function curve(pts) {
  const n = pts.length;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const d = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  const m = ys.map((_, i) => {
    if (i === 0) return d[0];
    if (i === n - 1) return d[n - 2];
    if (d[i - 1] * d[i] <= 0) return 0;
    const w1 = 2 * (xs[i + 1] - xs[i]) + (xs[i] - xs[i - 1]);
    const w2 = xs[i + 1] - xs[i] + 2 * (xs[i] - xs[i - 1]);
    return (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
  });
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

// A low nose, a long screen, a fastback, a high tail: the centre line, the shoulder, the lower edge, the half-width.
const TOP = curve([[-235, 46], [-233.5, 55], [-229, 62], [-218, 67.5], [-190, 76], [-150, 86.5], [-108, 96], [-98, 99.5], [-70, 117], [-40, 133], [-14, 142.5], [14, 145.6], [40, 146], [80, 143.5], [112, 137], [150, 123], [182, 110.5], [196, 107], [218, 106], [229, 103], [233.5, 93], [235, 66]]);
const SH = curve([[-235, 46], [-233.5, 52], [-229, 58], [-218, 63], [-190, 71.5], [-150, 82], [-108, 90.5], [-70, 94], [0, 96], [80, 98], [150, 101], [190, 103], [218, 103.5], [229, 100.5], [233.5, 90], [235, 66]]);
const BOT = curve([[-235, 46], [-233.5, 37], [-229, 28], [-220, 23], [-200, 21], [-100, 20.5], [100, 20.5], [196, 22], [215, 26], [227, 33], [232.5, 46], [235, 66]]);
const WID = curve([[-235, 50], [-233.5, 62], [-229, 71], [-218, 80], [-195, 87], [-150, 91], [-60, 92], [40, 92], [140, 91], [195, 87], [218, 81], [229, 73], [233.5, 64], [235, 52]]);

// one half section, from the lower edge to the centre line: the flank · the side glass · the rail · the roof
const NF = 9;
const NG = 6;
const NR = 5;
const NT = 7;
const ROWS = NF + NG + NR + NT;
const R_SH = NF - 1; // the row of the shoulder
const R_P1 = R_SH + NG; // …of the top of the side glass
const R_P2 = R_P1 + NR; // …of the edge of the roof's glass
const R_TOP = ROWS - 1; // …of the centre line

/** How high the body is cut away over a wheel (−1: not over one). */
function archOver(z) {
  let y = -1;
  for (const zc of [CAR.front, CAR.rear]) {
    const d = Math.abs(z - zc);
    if (d <= ARCH) y = Math.max(y, CAR.wheel + Math.sqrt(ARCH * ARCH - d * d));
  }
  return y;
}

/** The half section at `z`: ROWS points [x, y] into `out`. */
function half(z, out) {
  const w = WID(z);
  const hb = SH(z);
  const top = Math.max(TOP(z), hb);
  const bot = Math.min(BOT(z), hb);
  const low = Math.min(hb, Math.max(bot, archOver(z)));
  for (let i = 0; i < NF; i++) {
    const y = mix(low, hb, i / (NF - 1));
    const a = clamp01((y - bot) / Math.max(1, hb - bot));
    // tucked in at the sill, fullest at mid-height, a hair in again at the shoulder
    const f = a < 0.5 ? 1 - 0.07 * (1 - a / 0.5) ** 2 : 1 - 0.02 * ((a - 0.5) / 0.5) ** 2;
    out[i * 2] = w * f;
    out[i * 2 + 1] = y;
  }
  const rise = top - hb;
  const g = smooth(6, 34, rise); // 0: a bonnet, a deck · 1: the cabin
  const xs = w * 0.98;
  const xr = xs - (0.26 * rise + 4); // the tumblehome
  const p1x = mix(xs, xr + 1, g);
  const p1y = mix(hb, top - 9, g);
  const p2x = Math.max(0, xr - mix(7, 10, g));
  const p2y = top - mix(0.42 * rise, 2.4, g);
  const kx = p1x - mix(2.5, 1.5, g);
  const ky = p2y - mix(0.7, 0.9, g) * Math.min(1, rise / 2);
  let o = NF * 2;
  for (let i = 1; i <= NG; i++, o += 2) {
    const u = i / NG;
    out[o] = mix(xs, p1x, u) + 1.4 * g * Math.sin(Math.PI * u); // a pane is a little barrelled
    out[o + 1] = mix(hb, p1y, u);
  }
  for (let i = 1; i <= NR; i++, o += 2) {
    const u = i / NR;
    const v = 1 - u;
    out[o] = v * v * p1x + 2 * u * v * kx + u * u * p2x;
    out[o + 1] = v * v * p1y + 2 * u * v * ky + u * u * p2y;
  }
  for (let i = 1; i <= NT; i++, o += 2) {
    const u = i / NT;
    out[o] = p2x * (1 - u);
    out[o + 1] = p2y + (top - p2y) * (1 - (1 - u) * (1 - u));
  }
}

/** Where the sections are cut: fine at both ends and over the nose, on the circle of each arch, every 6 cm elsewhere. */
function stations() {
  const zs = [];
  for (const d of [0, 0.35, 0.9, 1.7, 2.8, 4.2, 6]) zs.push(NOSE + d, TAIL - d);
  for (let z = NOSE + 8.5; z < -190; z += 3.5) zs.push(z);
  for (let z = -190; z < TAIL - 6; z += 6) zs.push(z);
  for (const zc of [CAR.front, CAR.rear]) {
    for (let i = 0; i <= 24; i++) zs.push(zc + ARCH * Math.cos((Math.PI * i) / 24));
    zs.push(zc - ARCH - 0.8, zc + ARCH + 0.8);
  }
  zs.push(DOOR.z0, DOOR.z1, -97, -84, -13.5, 52, 109.5, 128, 168, 189, 197);
  zs.sort((a, b) => a - b);
  const out = [];
  for (const z of zs) if (!out.length || z - out.at(-1) > 0.05) out.push(z);
  return out;
}

/* ───────────────────────────────────────────────────────────── materials of our own */

const BOX = (() => {
  const c = V(...SOFTBOX.pos);
  const d = c.length();
  c.normalize();
  const u = V().crossVectors(UP, c).normalize();
  return { c, u, v: V().crossVectors(c, u), size: V(SOFTBOX.w / 2, SOFTBOX.h / 2, d) };
})();

/**
 * The glass of the body: the kit's glass (same uniforms: `asShell` makes its two other layers out of it), which
 * knows its panes (side windows, screen, glass roof, rear screen — cut in the skin's own coordinates, `aUV` = z
 * and the row of the section) from its panels: a panel carries a little light of its own and a strong lip, a
 * pane is clear, with the slanted streaks of a window and the studio's softbox in it.
 */
function bodyGlass({ rim = 0.3, power = 2.4, edge = 0.3, spec = 0.45, through = 0.22 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: INK.clone() }, uBase: { value: 1 }, uRim: { value: rim }, uPower: { value: power }, uAmount: { value: 1 },
      uEdge: { value: edge }, uSpec: { value: spec }, uGain: { value: 1 },
      uBoxC: { value: BOX.c }, uBoxU: { value: BOX.u }, uBoxV: { value: BOX.v }, uBoxSize: { value: BOX.size },
    },
    vertexShader: /* glsl */ `
      attribute vec2 aUV;
      varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec2 vUV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vP = position;
        vUV = aUV;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uBoxC, uBoxU, uBoxV, uBoxSize; uniform float uBase, uRim, uPower, uAmount, uEdge, uSpec, uGain;
      varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec2 vUV;
      float inside(float a, float b, float x, float w) { return smoothstep(a - w, a + w, x) * (1.0 - smoothstep(b - w, b + w, x)); }
      void main() {
        if (uAmount < 0.003) discard; // faded out, a shell must not hide the ones behind it
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        float facing = dot(n, v);
        float g = clamp(1.0 - abs(facing), 0.0, 1.0); // clamp before pow
        float r = vUV.y; float z = vUV.x;
        float sidePane = inside(${(R_SH + 0.7).toFixed(1)}, ${(R_P1 - 0.2).toFixed(1)}, r, 0.25) * inside(-84.0, 168.0, z, 1.2) * (1.0 - inside(43.0, 52.0, z, 0.8));
        float topPane = smoothstep(${(R_P2 + 0.2).toFixed(1)}, ${(R_P2 + 0.9).toFixed(1)}, r) * inside(-97.0, 189.0, z, 1.2) * (1.0 - inside(-17.0, -10.0, z, 0.8)) * (1.0 - inside(106.0, 113.0, z, 0.8));
        float pane = max(sidePane, topPane);
        // a true outline turns away from the eye fast; a flank seen along itself does not, and must not light up whole (a milky wall)
        float turn = smoothstep(0.0015, 0.02, fwidth(g));
        float fres = pow(g, uPower) * mix(0.3, 1.0, turn);
        float lip = smoothstep(0.6, 0.97, g) * mix(0.1, 1.0, turn);
        float panel =(0.022 * uBase + uRim * fres + uEdge * lip) * mix(0.5, 1.0, smoothstep(15.0, 70.0, vP.y)); // a flank fades toward the road
        float glz = 0.004 * uBase + 0.4 * uRim * fres + 0.25 * uEdge * lip;
        float s = fract((vP.z * 0.8 + vP.y * 1.3) / 150.0);
        glz += uBase * 0.035 * (smoothstep(0.0, 0.08, s) * (1.0 - smoothstep(0.16, 0.3, s)) + 0.5 * smoothstep(0.44, 0.48, s) * (1.0 - smoothstep(0.52, 0.58, s)));
        if (uSpec > 0.0) {
          vec3 rf = (vec4(reflect(-v, facing < 0.0 ? -n : n), 0.0) * viewMatrix).xyz;
          float toward = dot(rf, uBoxC);
          vec3 q3 = rf * (uBoxSize.z / max(toward, 1e-3));
          vec2 q = abs(vec2(dot(q3, uBoxU), dot(q3, uBoxV))) / uBoxSize.xy;
          float sp = uSpec * (0.3 + 0.7 * g) * smoothstep(0.0, 0.3, toward) * (1.0 - smoothstep(0.2, 1.9, length(q)));
          panel += 0.3 * sp; glz += sp;
        }
        gl_FragColor = vec4(uColor * mix(panel, glz, pane) * uAmount * uGain, 1.0);
      }`,
  });
  mat.userData.through = through;
  return mat;
}

/**
 * The lines of the body, in screen pixels (the instanced quads of LineSegments2): they step back with depth —
 * full strength on the near side of the car, `far` on its far side.
 */
function bodyLines({ width = 2, hdr = 1, far = 0.3, reach = 330, centre = [0, 80, 0] } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: INK.clone().multiplyScalar(hdr) }, uWidth: { value: width }, uRes: { value: RES }, uAmount: { value: 1 },
      uFar: { value: far }, uCentre: { value: V(...centre) }, uReach: { value: reach },
    },
    vertexShader: /* glsl */ `
      uniform float uWidth, uReach; uniform vec2 uRes; uniform vec3 uCentre;
      attribute vec3 instanceStart; attribute vec3 instanceEnd;
      varying vec2 vUv; varying float vDepth;
      // an end behind the eye is brought back in front of it (as LineMaterial does), or the quad turns inside out
      void trim(const in vec4 start, inout vec4 end) {
        float a = projectionMatrix[2][2];
        float b = projectionMatrix[3][2];
        float nearEstimate = -0.5 * b / a;
        float alpha = (nearEstimate - start.z) / (end.z - start.z);
        end.xyz = mix(start.xyz, end.xyz, alpha);
      }
      void main() {
        vUv = uv;
        vec4 start = modelViewMatrix * vec4(instanceStart, 1.0);
        vec4 end = modelViewMatrix * vec4(instanceEnd, 1.0);
        if (start.z < 0.0 && end.z >= 0.0) trim(start, end);
        else if (end.z < 0.0 && start.z >= 0.0) trim(end, start);
        vec4 clipStart = projectionMatrix * start;
        vec4 clipEnd = projectionMatrix * end;
        float aspect = uRes.x / uRes.y;
        vec2 dir = clipEnd.xy / (abs(clipEnd.w) > 1e-6 ? clipEnd.w : 1e-6) - clipStart.xy / (abs(clipStart.w) > 1e-6 ? clipStart.w : 1e-6);
        dir.x *= aspect;
        float len = length(dir);
        dir = len > 1e-7 ? dir / len : vec2(1.0, 0.0); // a segment seen end-on has no direction: never divide by its length
        vec2 offset = vec2(dir.y, -dir.x);
        dir.x /= aspect;
        offset.x /= aspect;
        if (position.x < 0.0) offset *= -1.0;
        if (position.y < 0.0) offset -= dir; else if (position.y > 1.0) offset += dir;
        vec4 clip = position.y < 0.5 ? clipStart : clipEnd;
        clip.xy += offset * (uWidth / uRes.y) * clip.w;
        gl_Position = clip;
        float z = position.y < 0.5 ? start.z : end.z;
        vDepth = ((viewMatrix * modelMatrix * vec4(uCentre, 1.0)).z - z) / uReach;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uFar;
      varying vec2 vUv; varying float vDepth;
      void main() {
        if (uAmount < 0.003) discard;
        if (abs(vUv.y) > 1.0) { // round ends
          float b = abs(vUv.y) - 1.0;
          if (vUv.x * vUv.x + b * b > 1.0) discard;
        }
        float k = clamp(0.5 + 0.5 * vDepth, 0.0, 1.0);
        gl_FragColor = vec4(uColor, uAmount * mix(1.0, uFar, k * k * (3.0 - 2.0 * k)));
      }`,
  });
}

/** Lights that have a place: a bright core and a long tail, one point each. `across`: the whole halo, in cm (0: off). */
function makeSprites(count) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  const uniforms = { uScale: { value: 1600 } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uScale; attribute vec3 aColor; attribute float aSize; varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vColor = aColor;
          gl_Position = aSize > 0.0 ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0);
          gl_PointSize = clamp(aSize * uScale / max(1.0, -mv.z), 10.0, 300.0);
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          float n = clamp(1.0 - length(gl_PointCoord - 0.5) * 2.0, 0.0, 1.0);
          gl_FragColor = vec4(vColor * (0.78 * pow(n, 6.0) + 0.22 * n * n), 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 7;
  return {
    points, uniforms,
    put(i, x, y, z, colour, k, across) {
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      col[i * 3] = colour.r * k; col[i * 3 + 1] = colour.g * k; col[i * 3 + 2] = colour.b * k;
      size[i] = k > 0.004 ? across : 0;
    },
    flush() {
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aColor.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
    },
  };
}

/** A ribbon `width` wide through points (a belt): `lay(points, normals)` — Vector3s, the ribbon lies flat against each normal. */
function makeRibbon(count, width, material) {
  const n = count + 1;
  const pos = new Float32Array(n * 6);
  const nor = new Float32Array(n * 6);
  const index = [];
  for (let i = 0; i < count; i++) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setIndex(index);
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  const p = V();
  const q = V();
  const t = V();
  const w = V();
  const nn = V();
  // a Catmull-Rom arc between b and c
  const cr = (a, b, c, d, u, u2, u3) => 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (3 * b - a - 3 * c + d) * u3);
  const arc = (a, b, c, d, u, out) => {
    const u2 = u * u;
    const u3 = u2 * u;
    return out.set(cr(a.x, b.x, c.x, d.x, u, u2, u3), cr(a.y, b.y, c.y, d.y, u, u2, u3), cr(a.z, b.z, c.z, d.z, u, u2, u3));
  };
  return {
    mesh,
    lay(pts, normals) {
      const m = pts.length - 1;
      for (let i = 0; i < n; i++) {
        const s = Math.min(m - 1e-4, (i / count) * m);
        const k = Math.floor(s);
        const u = s - k;
        const a = pts[Math.max(0, k - 1)];
        const d = pts[Math.min(m, k + 2)];
        arc(a, pts[k], pts[k + 1], d, u, p);
        arc(a, pts[k], pts[k + 1], d, u + 0.02, q);
        t.subVectors(q, p).normalize();
        nn.copy(normals[k]).lerp(normals[k + 1], u);
        w.crossVectors(t, nn).normalize().multiplyScalar(width / 2);
        nn.crossVectors(w, t).normalize();
        const o = i * 6;
        pos[o] = p.x - w.x; pos[o + 1] = p.y - w.y; pos[o + 2] = p.z - w.z;
        pos[o + 3] = p.x + w.x; pos[o + 4] = p.y + w.y; pos[o + 5] = p.z + w.z;
        nor[o] = nor[o + 3] = nn.x; nor[o + 1] = nor[o + 4] = nn.y; nor[o + 2] = nor[o + 5] = nn.z;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.normal.needsUpdate = true;
    },
  };
}

/** Position and normal only, not indexed: what every piece is reduced to before the pieces of one material are merged. */
function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  return o;
}

/** The edges of a piece (its own outline when its edges are broken), as a flat list of segments. */
function edgesInto(list, geometry, threshold = 28) {
  const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, threshold).attributes.position;
  for (let i = 0; i < e.count; i++) list.push(e.getX(i), e.getY(i), e.getZ(i));
}

/* ───────────────────────────────────────────────────────────── shared GLSL */

// From the road's frame into the car's (x, z). uCar = (how far the road has slid to the right, cos and sin of the car's yaw).
const TO_CAR = /* glsl */ `
  vec2 toCar(vec2 p) { vec2 q = p + vec2(uCar.x, 0.0); return vec2(q.x * uCar.y - q.y * uCar.z, q.x * uCar.z + q.y * uCar.y); }`;
// A quad drawn from a to b (clip space), `wide` px across: position.x is −1 at a, +1 at b; position.y ±1 across.
const STREAK = /* glsl */ `
  vec4 streak(vec4 a, vec4 b, float wide, vec2 res) {
    vec2 run = (b.xy / b.w - a.xy / a.w) * res;
    float len = length(run);
    run = len > 1e-4 ? run / len : vec2(1.0, 0.0); // seen end-on it has no direction: never divide by its length
    vec4 c = position.x < 0.0 ? a : b;
    c.xy += vec2(-run.y, run.x) * position.y * (wide / res) * c.w;
    return c;
  }`;

/* ───────────────────────────────────────────────────────────── the wet road */

/**
 * No floor under an X-ray: a grid and the paint of the lanes, which go by with `uScroll` and are spread over the
 * way they travel while the shutter is open (`uSmear`) — and the water, read by what it mirrors: the truck's tail
 * lamps drawn out into long signal streaks toward the eye, the headlamps laid down as a sheet of ink. Locked
 * wheels leave straight signal trails. Everything in one shader, in the road's own frame.
 */
function makeRoad() {
  const geo = new THREE.PlaneGeometry(9000, 44000).rotateX(-Math.PI / 2).translate(0, 0, -14000);
  const uniforms = {
    uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uAmount: { value: 1 }, uRain: { value: 1 },
    uScroll: { value: 0 }, uSmear: { value: 0 }, uCar: { value: new THREE.Vector4(0, 1, 0, 0) },
    uTruckZ: { value: -4000 }, uTruck: { value: 1 }, uBreath: { value: 1 }, uSkid: { value: 0 }, uWake: { value: 1 },
    uWheel: { value: WHEELS.map(([x, z]) => new THREE.Vector2(x, z)) },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        varying vec2 vP; varying vec3 vCam;
        void main() {
          vP = position.xz;
          vCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz; // the eye, in the road's frame
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uSignal; uniform float uAmount, uRain, uScroll, uSmear, uTruckZ, uTruck, uBreath, uSkid, uWake;
        uniform vec4 uCar; uniform vec2 uWheel[4];
        varying vec2 vP; varying vec3 vCam;
        ${TO_CAR}
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        // one family of lines: never under a pixel and a half, spread over the smear with the same light, gone before they crowd
        float lines(float x, float cell, float smear) {
          float q = x / cell;
          float f = fwidth(q);
          float w = max(f * 1.5, 1e-5);
          float d = abs(fract(q - 0.5) - 0.5);
          float reach = max(w, 0.5 * smear / cell);
          return (w / reach) * (1.0 - smoothstep(reach - w, reach, d)) * (1.0 - smoothstep(0.12, 0.4, f));
        }
        // a painted line, halfW cm each side of d = 0: never under 1.8 px — thinner, it keeps its light and loses its strength
        float band(float d, float halfW) {
          float w = max(fwidth(d), 1e-4);
          float h = max(halfW, 0.9 * w);
          return (halfW / h) * (1.0 - smoothstep(h - 0.6 * w, h + 0.6 * w, abs(d)));
        }
        // dashes len long every period, spread over the smear
        float dash(float s, float period, float len, float smear) {
          float d = abs(mod(s - 0.5 * len + 0.5 * period, period) - 0.5 * period);
          float e = max(fwidth(s), 0.5 * smear) + 1e-3;
          return 1.0 - smoothstep(0.5 * len - e, 0.5 * len + e, d);
        }
        void main() {
          if (uAmount < 0.003) discard;
          float s = vP.y + uScroll; // along the road, fixed to it
          vec2 pc = toCar(vP);
          float near = length(pc - vec2(0.0, -60.0));
          // the headlamps: two beams that widen and merge
          float ahead = ${NOSE.toFixed(1)} - pc.y;
          float wB = 62.0 + 0.2 * max(ahead, 0.0);
          float bl = (pc.x - 60.0) / wB; float br = (pc.x + 60.0) / wB;
          float beam = 0.5 * (exp(-bl * bl) + exp(-br * br)) * smoothstep(-10.0, 240.0, ahead) * exp(-max(ahead, 0.0) / 1500.0);
          // the grid
          float g = max(lines(vP.x, 50.0, 0.0), lines(s, 50.0, uSmear)) * 0.38 + max(lines(vP.x, 250.0, 0.0), lines(s, 250.0, uSmear));
          float ink = g * (0.26 * exp(-near / 700.0) + 0.26 * beam);
          // the paint: your lane's edge, the dashes to your left, the double line, the lanes that come the other way
          float paint = band(vP.x - ${EDGE.toFixed(1)}, 7.5) + band(vP.x + ${EDGE.toFixed(1)}, 7.5) * dash(s, 1300.0, 300.0, uSmear)
            + 0.8 * (band(vP.x + ${(3 * EDGE - 13).toFixed(1)}, 6.0) + band(vP.x + ${(3 * EDGE + 13).toFixed(1)}, 6.0))
            + 0.6 * band(vP.x + ${(5 * EDGE).toFixed(1)}, 7.5) * dash(s + 650.0, 1300.0, 300.0, uSmear) + 0.6 * band(vP.x + ${(7 * EDGE).toFixed(1)}, 7.5);
          ink += paint * (0.36 * exp(-near / 3000.0) + 0.05 + 0.7 * beam);
          // the water: long streaks along the road (slow enough along z not to shimmer as it goes by)
          float nx = vP.x / 7.0;
          float tex = mix(noise(vec2(nx, s / 760.0)), 0.5, smoothstep(0.35, 1.2, fwidth(nx)));
          ink += uRain * beam * (0.04 + 0.14 * tex);
          // a little light under the car
          float pool = clamp(1.0 - length(vec2(pc.x / 190.0, (pc.y - 10.0) / 360.0)), 0.0, 1.0);
          ink += 0.03 * pool * pool;
          // the truck's lamps in the water: mirrored toward the eye (a wet road draws a light out into a streak), and laid along the road
          vec3 P = vec3(vP.x, 0.0, vP.y);
          vec3 v = normalize(vCam - P);
          float refl = 0.0;
          for (int i = 0; i < 2; i++) {
            vec3 Lp = vec3(i == 0 ? -${LIGHT.x.toFixed(1)} : ${LIGHT.x.toFixed(1)}, ${LIGHT.y.toFixed(1)}, uTruckZ + 6.0);
            vec3 h = normalize(normalize(Lp - P) + v);
            float hy = max(h.y, 0.02);
            float e = (h.x * h.x + h.z * h.z) / (hy * hy * 0.0064);
            // …and its streak on the road, from the lamp's foot toward the eye's: the two lie on one line
            vec2 rel = P.xz - Lp.xz;
            vec2 toEye = normalize(vCam.xz - Lp.xz + vec2(0.0, 1e-3));
            float run = dot(rel, toEye);
            float off = (rel.x * toEye.y - rel.y * toEye.x) / (15.0 + 0.014 * max(run, 0.0));
            float dl = length(rel);
            refl += smoothstep(-20.0, 50.0, P.z - Lp.z) * (1.3 * exp(-min(e, 30.0)) / (1.0 + dl * dl / 1440000.0) + 0.42 * exp(-off * off) * smoothstep(-10.0, 60.0, run) * exp(-max(run, 0.0) / 700.0));
          }
          // not under the car: seen through its glass, a streak across the cabin would be read as part of it
          vec2 under = 1.0 - smoothstep(vec2(95.0, 245.0), vec2(150.0, 330.0), abs(pc));
          refl *= 1.0 - 0.92 * under.x * under.y;
          vec3 col = uInk * ink + uSignal * refl * uTruck * uRain * (0.8 + 0.2 * uBreath) * (0.55 + 0.6 * tex);
          // behind each tyre: the track it opens in the water (two fine edges) — or, locked, a straight signal trail
          float trail = 0.0; float wake = 0.0;
          for (int i = 0; i < 4; i++) {
            vec2 d = vP - uWheel[i];
            float behind = smoothstep(-8.0, 12.0, d.y);
            trail += band(d.x, 9.0) * behind * exp(-max(d.y, 0.0) / 1600.0);
            wake += (band(d.x - 9.5, 1.7) + band(d.x + 9.5, 1.7) + 0.2 * band(d.x, 9.5)) * behind * exp(-max(d.y, 0.0) / 600.0);
          }
          col += uSignal * trail * uSkid * 1.15 + uInk * wake * 0.2 * uRain * uWake * (1.0 - uSkid);
          gl_FragColor = vec4(col * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the rain */

/**
 * Streaks in the air. Each drop is fixed to the road's frame (it falls, and goes by with `uScroll`), wrapped in a
 * box that stays ahead of the eye; it is drawn as the stretch it covers while the shutter is open: slanted by the
 * car's speed, never a dot. None inside the cabin; those that cross the headlamps' beams catch their light.
 */
function makeRain(count, seed) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i++) seeds[i] = rand();
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  geo.instanceCount = count;
  const uniforms = {
    uTime: { value: 0 }, uScroll: { value: 0 }, uAmount: { value: 1 }, uScale: { value: 1600 }, uRes: { value: RES }, uColor: { value: INK.clone().multiplyScalar(0.72) },
    uBox: { value: V(2200, 1000, 2400) }, uSpeed: { value: 0 }, uCar: { value: new THREE.Vector4(0, 1, 0, 0) },
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
        uniform float uTime, uScroll, uAmount, uScale, uSpeed; uniform vec2 uRes; uniform vec3 uBox; uniform vec4 uCar;
        attribute vec4 aSeed; varying vec2 vQ; varying float vA;
        ${TO_CAR}
        ${STREAK}
        void main() {
          vQ = position.xy;
          vA = 0.0;
          mat4 inv = inverse(modelMatrix);
          vec3 eye = (inv * vec4(cameraPosition, 1.0)).xyz;
          vec3 look = normalize((inv * vec4(-viewMatrix[0][2], -viewMatrix[1][2], -viewMatrix[2][2], 0.0)).xyz);
          vec3 centre = eye + look * (0.42 * uBox.z);
          float fall = ${FALL.toFixed(1)} * (0.85 + 0.3 * aSeed.w);
          vec3 p0 = aSeed.xyz * uBox - vec3(0.0, fall * uTime, uScroll);
          vec3 p = centre + mod(p0 - centre + 0.5 * uBox, uBox) - 0.5 * uBox;
          vec3 q = (p - centre) / uBox + 0.5;
          float edge = smoothstep(0.0, 0.08, q.x) * (1.0 - smoothstep(0.92, 1.0, q.x)) * smoothstep(0.0, 0.08, q.y) * (1.0 - smoothstep(0.92, 1.0, q.y)) * smoothstep(0.0, 0.08, q.z) * (1.0 - smoothstep(0.92, 1.0, q.z));
          // its way through the car's frame: down, and back as fast as the car goes
          vec3 vel = vec3(0.0, -fall, uSpeed);
          vec4 a = projectionMatrix * viewMatrix * modelMatrix * vec4(p - vel * 0.022, 1.0);
          vec4 b = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
          if (a.w < 1.0 || b.w < 1.0 || p.y < 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          float truePx = 0.55 * uScale / b.w;
          gl_Position = streak(a, b, clamp(truePx, 2.0, 3.4), uRes); // (a drop a hand from the lens is not a slab)
          vec2 c = toCar(p.xz);
          float inside = step(abs(c.x), 98.0) * step(abs(c.y), 242.0) * step(p.y, 152.0);
          float ahead = ${NOSE.toFixed(1)} - c.y;
          float wB = 80.0 + 0.2 * max(ahead, 0.0);
          float beam = exp(-c.x * c.x / (wB * wB)) * smoothstep(0.0, 200.0, ahead) * exp(-max(ahead, 0.0) / 1300.0) * (1.0 - smoothstep(70.0, 200.0 + 0.05 * max(ahead, 0.0), p.y));
          vA = uAmount * edge * smoothstep(50.0, 200.0, b.w) * clamp(truePx / 2.0, 0.12, 1.0) * (1.0 - inside) * smoothstep(0.0, 14.0, p.y) * (0.35 + 0.65 * aSeed.x) * (1.0 + 2.4 * beam);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying vec2 vQ; varying float vA;
        void main() {
          if (vA < 0.002) discard;
          gl_FragColor = vec4(uColor * (1.0 - vQ.y * vQ.y) * (0.3 + 0.7 * smoothstep(-1.0, 1.0, vQ.x)) * vA, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the spray */

/**
 * The water the tyres throw: behind each wheel a plume of mist (soft puffs that leave the contact patch, rise,
 * widen and thin out — a mist that has a place) and drops on their arcs, drawn as streaks. Both are periodic in
 * the shader: alive from the first frame. Long at 80 km/h, nothing at rest (`uSpeed` = kmh / 80). With `uSkid`
 * the wheel is locked: no plume behind it, a low wave ploughed AHEAD of the tyre and thrown aside.
 */
function makeSpray(seed) {
  const rand = rng(seed);
  const quad = () => {
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    return geo;
  };
  const fill = (geo, per) => {
    const n = WHEELS.length * per;
    const origin = new Float32Array(n * 3);
    const seeds = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      const [x, z] = WHEELS[Math.floor(i / per)];
      origin.set([x, 0, z], i * 3);
      seeds.set([((i % per) + rand()) / per, rand() * 2 - 1, rand(), rand()], i * 4); // phase (evenly spread), aside, two more
    }
    geo.setAttribute("aOrigin", new THREE.InstancedBufferAttribute(origin, 3));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
    geo.instanceCount = n;
    return geo;
  };
  const uniforms = { uTime: { value: 0 }, uSpeed: { value: 1 }, uSkid: { value: 0 }, uAmount: { value: 1 }, uScale: { value: 1600 }, uRes: { value: RES } };
  const common = { transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending };

  const mist = new THREE.Mesh(
    fill(quad(), 36),
    new THREE.ShaderMaterial({
      ...common,
      uniforms: { ...uniforms, uColor: { value: INK.clone().multiplyScalar(0.18) } },
      vertexShader: /* glsl */ `
        uniform float uTime, uSpeed, uSkid, uAmount;
        attribute vec3 aOrigin; attribute vec4 aSeed; varying vec2 vQ; varying float vA;
        void main() {
          float u = fract(aSeed.x + uTime * (0.8 + 0.3 * aSeed.z));
          float sp = uSpeed;
          // thrown back: it leaves the tyre low, rises, then hangs and widens…
          vec3 back = vec3(aSeed.y * (4.0 + 40.0 * u), 5.0 + (26.0 + 26.0 * aSeed.w) * pow(u, 0.7) * sp * (1.0 - 0.4 * u), 22.0 + 520.0 * sp * pow(u, 0.9));
          float sizeBack = mix(15.0, 112.0, pow(u, 0.8)) * (0.7 + 0.5 * aSeed.w);
          // …or ploughed ahead of a locked tyre: a low crescent — its middle leads, its two ends are thrown aside and left behind
          vec3 wave = vec3(aSeed.y * (8.0 + 88.0 * sqrt(u)), 5.0 + 18.0 * sp * sin(3.1416 * min(1.0, 1.6 * u)) * (0.5 + 0.5 * aSeed.w), -(26.0 + 120.0 * sp * pow(u, 0.6)) * (1.0 - 0.75 * aSeed.y * aSeed.y * sqrt(u)));
          float sizeWave = mix(30.0, 78.0, u); // wide enough to melt into one low bank, not a row of balls
          float size = mix(sizeBack, sizeWave, uSkid) * (0.45 + 0.55 * sp);
          vec3 c = aOrigin + mix(back, wave, uSkid);
          c.y = max(c.y, 0.36 * size); // it sits on the road
          vec4 mv = modelViewMatrix * vec4(c, 1.0);
          mv.xy += position.xy * size * 0.5;
          gl_Position = projectionMatrix * mv;
          vQ = position.xy;
          vA = uAmount * smoothstep(0.0, 0.07, u) * pow(1.0 - u, 1.15) * (1.0 + 0.6 * exp(-u / 0.14)) * (1.0 + 0.3 * uSkid) * smoothstep(0.03, 0.3, sp) * smoothstep(70.0, 240.0, -mv.z); // never a veil over the lens
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying vec2 vQ; varying float vA;
        void main() {
          float a = clamp(1.0 - length(vQ), 0.0, 1.0);
          if (a * vA < 0.001) discard;
          gl_FragColor = vec4(uColor * a * a * vA, 1.0);
        }`,
    }),
  );
  const drops = new THREE.Mesh(
    fill(quad(), 96),
    new THREE.ShaderMaterial({
      ...common,
      uniforms: { ...uniforms, uColor: { value: INK.clone().multiplyScalar(0.4) } },
      vertexShader: /* glsl */ `
        uniform float uTime, uSpeed, uSkid, uAmount, uScale; uniform vec2 uRes;
        attribute vec3 aOrigin; attribute vec4 aSeed; varying vec2 vQ; varying float vA;
        ${STREAK}
        void main() {
          vQ = position.xy;
          vA = 0.0;
          float life = fract(aSeed.x + uTime * 1.7);
          float t = life * 0.6;
          float sp = uSpeed;
          vec3 v0 = mix(vec3(aSeed.y * 70.0, 70.0 + 260.0 * aSeed.z, 260.0 + 620.0 * aSeed.w), vec3(aSeed.y * 300.0, 40.0 + 150.0 * aSeed.z, -(160.0 + 380.0 * aSeed.w)), uSkid) * sp;
          vec3 c = aOrigin + vec3(aSeed.y * 9.0, 4.0, mix(18.0, -24.0, uSkid)) + v0 * t + vec3(0.0, -450.0 * t * t, 0.0);
          vec3 vel = v0 + vec3(0.0, -900.0 * t, 1e-3);
          vec3 run = normalize(vel) * max(2.5, length(vel) * 0.009);
          vec4 a = projectionMatrix * modelViewMatrix * vec4(c - run, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(c + run, 1.0);
          if (a.w < 1.0 || b.w < 1.0 || c.y < 1.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          float truePx = 0.8 * uScale / b.w;
          gl_Position = streak(a, b, max(2.0, truePx), uRes);
          vA = uAmount * smoothstep(0.0, 0.05, life) * (1.0 - life) * smoothstep(0.03, 0.3, sp) * clamp(truePx / 2.0, 0.15, 1.0) * (0.4 + 0.6 * aSeed.z) * smoothstep(50.0, 160.0, b.w);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying vec2 vQ; varying float vA;
        void main() {
          if (vA < 0.002) discard;
          gl_FragColor = vec4(uColor * (1.0 - vQ.y * vQ.y) * (1.0 - vQ.x * vQ.x) * vA, 1.0);
        }`,
    }),
  );
  for (const m of [mist, drops]) {
    m.frustumCulled = false;
    m.renderOrder = 6;
  }
  return { mist, drops, uniforms: [mist.material.uniforms, drops.material.uniforms] };
}

/* ───────────────────────────────────────────────────────────── the truck */

/**
 * A semi-trailer seen from behind: the two doors of its box and their lock rods, the underrun bar at the height
 * of your bonnet, twin wheels behind their mud flaps, its tail lamps. Solid and dark — the threat. Its rear face
 * is z = 0, it runs toward −z. `set(amount, near, breath, px)`: `near` 0–1 brings out the small hardware as it comes close.
 */
function makeTruck() {
  const root = new THREE.Group();
  const part = makePart("truck");
  root.add(part);
  const { half: HW, floor: FLOOR, top: ROOF, bar: BAR } = TRUCK;
  const MID = (FLOOR + ROOF) / 2;
  const TALL = ROOF - FLOOR;
  const LONG = 1360;
  const M = {
    panel: solid(0x3a4047, { rough: 0.86, env: 0.3 }), // three greys: the box,
    door: solid(0x4c525a, { rough: 0.8, env: 0.35 }), //   its doors (they take the headlamps),
    frame: solid(0x282d32, { rough: 0.82, env: 0.3 }), //  the frame, the chassis
    steel: solid(0x9aa0a6, { rough: 0.42, metal: 0.45 }),
    rubber: solid(0x15181b, { rough: 0.95, env: 0.2 }),
    plate: solid(0xb9b4a8, { rough: 0.7 }),
  };
  const G = { panel: [], door: [], frame: [], steel: [], rubber: [], plate: [] };
  const strong = []; // the lines that draw the truck from far away
  const detail = []; // …and those of its hardware, which only come out close
  const put = (bucket, geometry, o, lines = strong) => {
    const g = placed(geometry, o);
    if (lines) edgesInto(lines, g);
    G[bucket].push(bare(g));
  };

  // the box, its rear frame, the two doors
  put("panel", box(HW * 2, TALL, LONG, 3), { pos: [0, MID, -LONG / 2 - 2.5] });
  for (const s of [-1, 1]) put("frame", box(9, TALL + 6, 6, 1), { pos: [s * (HW - 4.5), MID, 0] });
  put("frame", box(HW * 2, 12, 6, 1), { pos: [0, ROOF - 3, 0] });
  put("frame", box(HW * 2, 14, 7, 1), { pos: [0, FLOOR + 5, 0.5] });
  for (const s of [-1, 1]) {
    put("door", box(113.5, TALL - 26, 3, 0.8), { pos: [s * 57.9, MID + 1, 1.6] });
    // two lock rods a door: keepers at both ends, three guides, a handle folded toward the middle of the door
    for (const x of [30, 86]) {
      put("steel", cyl(1.9, TALL - 12, 0.4, 16), { pos: [s * x, MID + 1, 5.3] }, detail);
      for (const y of [FLOOR + 8, ROOF - 7]) put("frame", box(9, 6, 5.5, 0.8), { pos: [s * x, y, 4.6] }, detail);
      for (const y of [FLOOR + 62, MID + 5, ROOF - 62]) put("frame", box(6.5, 4, 5, 0.6), { pos: [s * x, y, 4.4] }, null);
      const toward = x < 58 ? 1 : -1;
      put("steel", box(27, 3.2, 2.4, 0.6), { pos: [s * (x + toward * 13), FLOOR + 84, 7.2], rotZ: s * toward * 0.1 }, detail);
      put("frame", box(6, 10, 3.4, 0.6), { pos: [s * (x + toward * 25), FLOOR + 85, 5.2] }, null);
    }
    for (const y of [FLOOR + 40, FLOOR + 108, FLOOR + 176, FLOOR + 244]) put("frame", box(12, 7, 4, 1), { pos: [s * (HW - 4.5), y, 3] }, detail);
  }
  // under the floor: the cross-member that carries the lamps, the chassis rails, the number plate
  put("frame", box(HW * 2 - 6, 18, 14, 1.5), { pos: [0, LIGHT.y, -6] });
  for (const s of [-1, 1]) {
    put("frame", box(12, 24, LONG - 60, 1), { pos: [s * 46, FLOOR - 14, -LONG / 2] }, null);
    put("frame", box(50, 16, 6, 1.2), { pos: [s * LIGHT.x, LIGHT.y, 2.5] });
  }
  put("plate", box(52, 11, 1.2, 0.3), { pos: [0, LIGHT.y, 1.9] }, detail);
  // the underrun bar and what holds it
  put("steel", box(HW * 2 - 12, 11, 11, 1.6), { pos: [0, BAR, -5] });
  for (const s of [-1, 1]) {
    put("frame", box(9, LIGHT.y - BAR - 6, 10, 1), { pos: [s * 46, (LIGHT.y + BAR) / 2 - 3, -7] });
    put("frame", box(7, 58, 7, 1), { pos: [s * 46, (LIGHT.y + BAR) / 2 + 2, -29], rotX: -0.75 }, null);
  }
  // three axles of twin wheels, the mud flaps behind the last one
  const tyre = lathe([[28, 11.5], [44, 13], [49.5, 11], [51, 6], [51, -6], [49.5, -11], [44, -13], [28, -11.5]], 28).rotateZ(Math.PI / 2);
  const hubcap = cyl(28.5, 9, 1.2, 24).rotateZ(Math.PI / 2);
  const twins = (z, y, lines) => {
    for (const s of [-1, 1]) {
      for (const x of [HW - 14, HW - 43]) put("rubber", tyre, { pos: [s * x, y, z] }, x > HW - 20 ? lines : null);
      put("frame", hubcap, { pos: [s * (HW - 9), y, z] }, null);
    }
  };
  [-135, -268, -401].forEach((z, i) => twins(z, 51, i === 0 ? detail : null));
  for (const s of [-1, 1]) {
    put("rubber", box(62, 76, 1.6, 0.5), { pos: [s * (HW - 29), 58, -72] });
    put("steel", box(62, 3.2, 2.4, 0.5), { pos: [s * (HW - 29), 23, -71.5] }, null);
    // along the flanks: the side guards, the landing gear
    for (const y of [60, 88]) put("steel", box(4, 7, 560, 1), { pos: [s * (HW - 2), y, -800] }, null);
    for (const z of [-560, -800, -1040]) put("frame", box(4, 44, 6, 0.8), { pos: [s * (HW - 3), 78, z] }, null);
    put("frame", box(10, 96, 10, 1), { pos: [s * 52, 50, -1060] }, null);
  }
  // the tractor: a cab, its deflector, two axles
  put("panel", box(HW * 2 - 6, 268, 215, 9), { pos: [0, 216, -LONG - 172] });
  put("panel", box(HW * 2 - 12, 56, 150, 9), { pos: [0, 366, -LONG - 128], rotX: -0.2 }, null);
  put("frame", box(92, 30, 600, 2), { pos: [0, 78, -LONG - 20] }, null);
  twins(-LONG + 110, 51, null);
  for (const s of [-1, 1]) put("rubber", tyre, { pos: [s * (HW - 16), 51, -LONG - 205] }, null);

  for (const k of Object.keys(G)) addMesh(part, mergeBare(G[k]), M[k], { edges: false });
  const lines = (list, width, opacity) => {
    const l = new LineSegments2(new LineSegmentsGeometry().setPositions(list), lineMat(BRAND.ink, width, { opacity, fog: true }));
    l.renderOrder = 2;
    part.userData.part.mats.add(l.material);
    part.add(l);
    return l.material;
  };
  lines(strong, 2.1, 0.6);
  const fine = lines(detail, 1.8, 0.42);

  // the lamps: in each cluster a tail lamp (steady), a hazard lamp (it breathes), a third one hardly lit; two markers up at the corners
  const L = { tail: glow(BRAND.signal, 2.4), hazard: glow(BRAND.signal, 2.4), low: glow(BRAND.signal, 0.45), marker: glow(BRAND.signal, 1.8) };
  const lens = box(13, 10, 2.2, 0.6);
  for (const s of [-1, 1]) {
    addMesh(part, lens, L.hazard, { pos: [s * (LIGHT.x + 15), LIGHT.y, 6], edges: false });
    addMesh(part, lens, L.tail, { pos: [s * LIGHT.x, LIGHT.y, 6], edges: false });
    addMesh(part, lens, L.low, { pos: [s * (LIGHT.x - 15), LIGHT.y, 6], edges: false });
    addMesh(part, box(8, 4.5, 2, 0.5), L.marker, { pos: [s * (HW - 9), ROOF - 3, 3.6], edges: false });
    addMesh(part, box(9, 7, 1.4, 0.4), L.low, { pos: [s * (HW - 14), BAR, 1.2], edges: false }); // the reflectors at the ends of the bar
    for (const z of [-90, -380, -670, -960, -1250]) addMesh(part, box(1.6, 3.6, 7, 0.4), L.marker, { pos: [s * (HW + 0.6), FLOOR + 6, z], edges: false }); // side markers
  }
  const halos = makeSprites(4);
  root.add(halos.points);
  const SIG = SIGNAL.clone().multiplyScalar(2.0);

  return {
    root, part,
    set(amount, near, breath, px) {
      setPartOpacity(part, amount);
      fine.opacity = fine.userData.base * amount * near;
      setGlow(L.hazard, 0.5 + 2.3 * breath);
      halos.points.visible = amount > 0.004;
      halos.uniforms.uScale.value = px;
      for (let i = 0; i < 2; i++) {
        const s = i ? 1 : -1;
        halos.put(i, s * (LIGHT.x + 7), LIGHT.y, 11, SIG, amount * (0.62 + 0.3 * breath), 190);
        halos.put(2 + i, s * (HW - 9), ROOF - 3, 8, SIG, amount * 0.3, 62);
      }
      halos.flush();
    },
  };
}

/* ───────────────────────────────────────────────────────────── the set */

export function buildStreet() {
  const group = new THREE.Group();
  const A = {};
  const fx = {};

  /* ═════════════ 1 · THE ROAD, THE RAIN, THE TRUCK — they come to the car ═════════════ */

  const pivot = new THREE.Group(); // the world turns around the car (`yaw`)…
  const slide = new THREE.Group(); // …and slides to its right (`lane`)
  pivot.add(slide);
  group.add(pivot);

  const road = makeRoad();
  const rain = makeRain(2400, 7);
  const truck = makeTruck();
  slide.add(road.mesh, rain.mesh, truck.root);
  A.truck = anchor(truck.root, 0, (TRUCK.floor + TRUCK.top) / 2, 2);
  A.lights = anchor(truck.root, -LIGHT.x, LIGHT.y, 8);
  A.truckTop = anchor(truck.root, 0, TRUCK.top, 2);
  A.left = anchor(slide, -LANE.w, 0, NOSE - 2000);

  // your headlamps: a real light on the truck (no shadow), which fades with distance less than a true one would
  const lamp = new THREE.SpotLight(BRAND.ink, 0, 0, 0.5, 0.85, 1);
  lamp.position.set(0, 66, NOSE + 6);
  lamp.target.position.set(0, 70, NOSE - 3000);
  group.add(lamp, lamp.target);

  /* ═════════════ 2 · THE CAR — its skin ═════════════ */

  const car = new THREE.Group(); // what stays where the plan puts it: wheels, seats, the steering wheel, you
  const tilt = new THREE.Group(); // …and what dips under braking (`dive`): the body alone
  tilt.position.set(0, DIVE.y, DIVE.z);
  const body = new THREE.Group();
  body.position.set(0, -DIVE.y, -DIVE.z);
  tilt.add(body);
  car.add(tilt);
  group.add(car);

  const spray = makeSpray(11);
  car.add(spray.mist, spray.drops);

  const ZS = stations();
  const COLS = ROWS * 2 - 1;
  const SEC = new Float32Array(ROWS * 2);
  let secZ = NaN;
  const sect = (z) => {
    if (z !== secZ) half(z, SEC);
    secZ = z;
    return SEC;
  };
  /** A point of the skin: at `z`, at row `r` of the section (fractions welcome), on side −1 or +1. */
  const pt = (z, r, side) => {
    const s = sect(z);
    const i = Math.min(ROWS - 2, Math.floor(r));
    const u = r - i;
    return [side * mix(s[i * 2], s[i * 2 + 2], u), mix(s[i * 2 + 1], s[i * 2 + 3], u), z];
  };

  fx.skin = bodyGlass();
  {
    const pos = new Float32Array(ZS.length * COLS * 3);
    const uv = new Float32Array(ZS.length * COLS * 2);
    const index = [];
    ZS.forEach((z, s) => {
      const sec = sect(z);
      for (let j = 0; j < COLS; j++) {
        const r = ROWS - 1 - Math.abs(j - (ROWS - 1)); // from your sill, over the roof, to the other sill: nothing under the car
        const k = s * COLS + j;
        pos.set([(j < ROWS - 1 ? -1 : 1) * sec[r * 2], sec[r * 2 + 1], z], k * 3);
        uv.set([z, r], k * 2);
        if (s < ZS.length - 1 && j < COLS - 1) index.push(k, k + COLS, k + 1, k + 1, k + COLS, k + COLS + 1);
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aUV", new THREE.BufferAttribute(uv, 2));
    geo.setIndex(index);
    geo.computeVertexNormals();
    // where the side glass has no height (bonnet, deck) its rows lie on one line: no face, no normal — never hand the shader a null one
    const nrm = geo.attributes.normal;
    for (let i = 0; i < nrm.count; i++) if (nrm.getX(i) ** 2 + nrm.getY(i) ** 2 + nrm.getZ(i) ** 2 < 1e-8) nrm.setXYZ(i, 0, 1, 0);
    fx.skinMesh = new THREE.Mesh(geo, fx.skin);
    fx.skinMesh.frustumCulled = false;
    body.add(fx.skinMesh);
  }

  /* ── its lines, taken on the skin ── */
  const L = { strong: [], fine: [], lamp: [] };
  const run = (l, pts) => {
    for (let i = 0; i < pts.length - 1; i++) l.push(pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0], pts[i + 1][1], pts[i + 1][2]);
  };
  const between = (z0, z1) => [z0, ...ZS.filter((z) => z > z0 + 0.2 && z < z1 - 0.2), z1];
  /** Along the car at row `r` (a number, or a function of z). */
  const along = (l, r, z0, z1, side) => run(l, between(z0, z1).map((z) => pt(z, typeof r === "function" ? r(z) : r, side)));
  /** Across it at `z`, from row `r0` to row `r1`. */
  const across = (l, z, r0, r1, side) => {
    const pts = [];
    for (let r = r0; r < r1 - 1e-6; r += 0.5) pts.push(pt(z, r, side));
    pts.push(pt(z, r1, side));
    run(l, pts);
  };
  const SILL = 0.9; // the row where a door ends, just above the lower edge
  for (const s of [-1, 1]) {
    along(L.strong, 0, NOSE, TAIL, s); // the lower edge: bumpers, arches, sills
    along(L.strong, R_SH, NOSE + 6, TAIL - 5, s); // the shoulder
    along(L.strong, R_P1, -84, 168, s); // the top of the side glass: A-pillar, cant rail, C-pillar
    along(L.fine, R_P2, -97, 189, s); // the edge of the glass roof
    across(L.strong, -97, R_P2, R_TOP, s); // the foot of the screen
    across(L.fine, -13.5, R_P2, R_TOP, s); // its header
    across(L.fine, 109.5, R_P2, R_TOP, s);
    across(L.strong, 189, R_P2, R_TOP, s); // the foot of the rear screen
    // doors: yours (−x) is drawn stronger
    const cut = s < 0 ? L.strong : L.fine;
    across(cut, DOOR.z0, SILL, R_P1, s);
    across(cut, DOOR.z1, SILL, R_P1, s);
    along(cut, SILL, DOOR.z0, DOOR.z1, s);
    along(L.fine, SILL, DOOR.z1, 128, s);
    across(L.fine, 52, R_SH, R_P1, s); // the B-pillar
    across(L.fine, 128, 0, R_P1, s); // the rear door, cut by the arch
    // the bonnet and the boot
    along(L.fine, R_P1 + 2.5, -224, -99, s);
    across(L.fine, -224, R_P1 + 2.5, R_TOP, s);
    across(L.fine, 197, R_P2, R_TOP, s);
    // lamps: a blade of light at each corner
    along(L.lamp, (z) => mix(6.0, 7.5, (z + 232) / 28), -232, -204, s);
    along(L.lamp, (z) => mix(6.0, 6.4, (z + 232) / 28), -232, -206, s);
    run(L.lamp, [pt(-206, 6.4, s), pt(-204, 7.5, s)]);
    along(L.lamp, 7.2, 204, 234.3, s);
  }
  run(L.lamp, [pt(234.3, 7.2, -1), pt(234.3, 7.2, 1)]); // the light bar across the tail
  // the floor: its outline only (glass under the cabin would lie over the pedal and the brake lines)
  run(L.fine, [[-83, CAR.floor + 0.5, -104], [-83, CAR.floor + 0.5, 176], [83, CAR.floor + 0.5, 176], [83, CAR.floor + 0.5, -104], [-83, CAR.floor + 0.5, -104]]);

  fx.strong = bodyLines({ width: 2.4, far: 0.32 });
  fx.fine = bodyLines({ width: 1.8, far: 0.26 });
  fx.lamp = bodyLines({ width: 2.8, hdr: 1.7, far: 0.6 });
  for (const [name, material] of [["strong", fx.strong], ["fine", fx.fine], ["lamp", fx.lamp]]) {
    const mesh = new THREE.Mesh(new LineSegmentsGeometry().setPositions(L[name]), material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    body.add(mesh);
  }

  /* ═════════════ 3 · WHAT SAYS "CAR": three wheels, seats, dashboard, steering wheel, belt ═════════════ */

  fx.inner = glass(BRAND.ink, { base: 0.003, rim: 0.13, power: 2.6, edge: 0.2, through: 0.12 }); // seats, dashboard
  fx.tyre = glass(BRAND.ink, { base: 0.012, rim: 0.32, power: 2.2, edge: 0.4, through: 0.15 });
  fx.trim = glass(BRAND.ink, { base: 0.006, rim: 0.3, power: 2.6, edge: 0.45, spec: 0.6, through: 0.2 }); // the door mirrors
  fx.kitLines = []; // the kit's own line materials, faded with the shell
  const kitLines = (positions, width, opacity) => {
    const lines = new LineSegments2(new LineSegmentsGeometry().setPositions(positions), lineMat(BRAND.ink, width, { opacity }));
    lines.renderOrder = 2;
    fx.kitLines.push(lines.material);
    return lines;
  };

  /* ── the wheels: glass, crisp circles — and ONE painted mark on the sidewall. No spoke, nothing fine that turns:
     the mark is drawn in a shader on a ring that does not turn, so that it can be spread over the arc it sweeps
     while the shutter is open (an even band at speed), and stand sharp the instant the wheel locks. ── */
  const circle = (list, r, x, n = 56) => {
    for (let i = 0; i < n; i++) {
      const a = (TAU * i) / n;
      const b = (TAU * (i + 1)) / n;
      list.push(x, r * Math.cos(a), r * Math.sin(a), x, r * Math.cos(b), r * Math.sin(b));
    }
  };
  fx.mark = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(0.62) }, uAngle: { value: 0 }, uSmear: { value: 0 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vYZ;
      void main() {
        vYZ = position.yz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAngle, uSmear, uAmount; varying vec2 vYZ;
      void main() {
        if (uAmount < 0.003) discard;
        float r = length(vYZ);
        float ring = smoothstep(24.2, 25.6, r) * (1.0 - smoothstep(31.2, 32.6, r));
        float phi = atan(-vYZ.y, vYZ.x); // 0 at the top, growing toward the front: the way a rolling wheel turns
        float h = min(3.1416, 0.42 + 0.5 * uSmear);
        float d = abs(mod(phi - uAngle + 0.5 * uSmear + 3.1416, 6.2832) - 3.1416);
        float e = 0.05 + 0.3 * min(uSmear, 1.0);
        gl_FragColor = vec4(uColor * ring * (0.42 / h) * (1.0 - smoothstep(h - e, h + e, d)) * uAmount, 1.0);
      }`,
  });
  fx.wheels = {};
  const tyres = [];
  const PROFILE = [[6, 9.3], [TYRE.rim, 10.2], [23, 10.8], [30, 11], [33, 9.4], [34, 5.3], [34, -5.3], [33, -9.4], [30, -11], [23, -10.8], [TYRE.rim, -8.4]];
  for (const [name, s, z] of [["wheelFR", 1, CAR.front], ["wheelRL", -1, CAR.rear], ["wheelRR", 1, CAR.rear]]) {
    const w = new THREE.Group();
    // the tyre and the dish of the rim, turned on one profile (its axis along x, its face outward)
    const tyre = new THREE.Mesh(lathe(PROFILE, 56).rotateZ((-s * Math.PI) / 2), fx.tyre);
    const lines = [];
    for (const x of [9.4, -9.4]) circle(lines, 33.4, s * x);
    circle(lines, 22.6, s * 10.9);
    circle(lines, 6, s * 9.4, 24);
    const mark = new THREE.Mesh(new THREE.RingGeometry(23.6, 33, 72).rotateY(Math.PI / 2).translate(s * 11.3, 0, 0), fx.mark);
    mark.renderOrder = 5;
    w.add(tyre, kitLines(lines, 2, 0.6), mark);
    w.position.set(s * CAR.track, CAR.wheel, z);
    car.add(w);
    tyres.push(tyre);
    fx.wheels[name] = w;
    A[name] = anchor(w, 0, 0, 0);
  }

  /* ── seats, dashboard, steering column: glass and fine lines ── */
  const TILT = 22 * DEG; // the steering wheel leans back
  const AXIS = V(0, Math.sin(TILT), Math.cos(TILT)); // its column, toward you
  const HUBV = V(STEERING.x, STEERING.y, STEERING.z);
  const cabinGlass = [];
  const cabinLines = [];
  const piece = (geometry, o) => {
    const g = placed(geometry, o);
    edgesInto(cabinLines, g);
    cabinGlass.push(bare(g));
  };
  for (const x of [YOU.x, -YOU.x]) {
    piece(box(50, 10, 48, 4), { pos: [x, 36, -13] });
    piece(box(48, 64, 10, 4.5), { pos: [x, 71, 9.6], rotX: 24 * DEG });
    piece(box(26, 17, 9, 4), { pos: [x, 119.5, 30.5], rotX: 12 * DEG });
  }
  piece(box(134, 12, 50, 5), { pos: [0, 48, 106] }); // the rear bench
  piece(box(134, 58, 10, 5), { pos: [0, 83, 142], rotX: 26 * DEG });
  for (const x of [-38, 38]) piece(box(24, 15, 8, 3.5), { pos: [x, 121, 158], rotX: 16 * DEG });
  piece(box(164, 14, 26, 6), { pos: [0, 90, -80], rotX: -8 * DEG }); // the dashboard (the pedal hangs under it: nothing lower)
  piece(cyl(3.2, 32, 0.6, 20).rotateX(Math.PI / 2), { pos: [HUBV.x, HUBV.y - AXIS.y * 19, HUBV.z - AXIS.z * 19], rotX: -TILT });
  const cabin = new THREE.Mesh(mergeBare(cabinGlass), fx.inner);
  car.add(cabin, kitLines(cabinLines, 1.8, 0.4));

  // the door mirrors
  const mirrors = [-1, 1].map((s) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), fx.trim);
    m.scale.set(4.6, 5.6, 9.5);
    m.position.set(s * 99, 99.5, -76);
    body.add(m);
    return m;
  });

  asShell(cabin, 15);
  asShell(tyres, 16);
  asShell([fx.skinMesh, ...mirrors], 20);

  /* ── the few solid things: the steering wheel (it turns with `steer`), the screen, the belt, the door handles ── */
  const fit = makePart("fittings");
  fx.rim = solid(0x7b8086, { rough: 0.55, metal: 0.1 });
  fx.dark = solid(0x3d4349, { rough: 0.7 });
  fx.pale = solid(0xc9c4b8, { rough: 0.6 });
  const RIM_R = 18.5;
  const steering = new THREE.Group(); // its own frame: the rim in the xy plane, its column along −z
  steering.position.copy(HUBV);
  steering.rotation.set(-TILT, 0, 0);
  fit.add(steering);
  {
    const spokes = [new THREE.TorusGeometry(RIM_R, 1.6, 14, 72), placed(box(13, 2.6, 1.8, 0.6), { pos: [-11.5, -0.8, 0] }), placed(box(13, 2.6, 1.8, 0.6), { pos: [11.5, -0.8, 0] }), placed(box(3, 13, 1.8, 0.6), { pos: [0, -11, 0] })];
    steering.add(addMesh(fit, mergeBare(spokes.map(bare)), fx.rim, { edges: false }));
    steering.add(addMesh(fit, cyl(7.4, 5, 0.9, 40).rotateX(Math.PI / 2), fx.dark, { edgeOpacity: 0.5, edgeWidth: 1.8 }));
    // the mark at twelve o'clock: what says how far the wheel has been turned
    steering.add(addMesh(fit, placed(new THREE.TorusGeometry(RIM_R, 1.75, 10, 10, 0.34), { rotZ: Math.PI / 2 - 0.17 }), fx.pale, { edges: false }));
    // the screen in the middle of the dashboard
    addMesh(fit, placed(box(32, 19, 1.4, 0.5), { pos: [0, 105, -66], rotX: -10 * DEG }), fx.dark, { edgeOpacity: 0.55, edgeWidth: 1.8 });
    fx.screen = glow(BRAND.ink, 0.2);
    addMesh(fit, placed(new THREE.PlaneGeometry(29, 16), { pos: [0, 105 + 0.15, -66 + 0.85], rotX: -10 * DEG }), fx.screen, { edges: false });
  }
  A.hands = anchor(car, HUBV.x, HUBV.y, HUBV.z);
  // the belt
  fx.belt = solid(0x9d998f, { rough: 0.85, double: true });
  const strap = makeRibbon(34, 4.8, fx.belt);
  const lap = makeRibbon(20, 4.8, fx.belt);
  fit.userData.part.mats.add(fx.belt);
  fit.add(strap.mesh, lap.mesh);
  car.add(fit);
  // on the body: the door handles, the headlamps' own glow
  const trim = makePart("trim");
  fx.handles = solid(0x9a9fa4, { rough: 0.4, metal: 0.4 });
  const handleGeo = box(2.2, 2.6, 15, 0.8);
  for (const [s, z] of [[-1, 34], [1, 34], [-1, 112], [1, 112]]) addMesh(trim, handleGeo, fx.handles, { pos: [s * 91.9, 93 + (z > 100 ? 2 : 0), z], edgeOpacity: 0.6, edgeWidth: 1.8 });
  body.add(trim);
  const lamps = makeSprites(2);
  body.add(lamps.points);
  A.bumper = anchor(body, 0, 46, NOSE);

  /* ═════════════ 4 · YOU, AT THE WHEEL ═════════════ */

  const you = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.8, through: 0.2 });
  you.group.rotation.y = Math.PI; // you look toward the nose (−z): your left is the door (−x)
  car.add(you.group);
  fit.userData.part.mats.add(you.flesh); // your head and your hands fade with the rest
  A.head = anchor(you.head, 0, 0, 0);
  A.foot = anchor(you.legs.R.foot, 0, 0, 0);
  const SEAT = V(YOU.head[0], 48, YOU.head[2] - 31); // your hips: reclined 24°, they put your head where the plan says
  const E1 = V(1, 0, 0); // the rim's own plane: across the car…
  const E2 = V().crossVectors(AXIS, E1); // …and up along it
  const OVER_RIM = V(AXIS.x, -AXIS.y, AXIS.z); // across the rim, away from you (in your own frame: x and z turned round)
  const KNEE_L = V(0.45, 1, 0.2); // the left knee leans toward the door
  const KNEE_R = V(-0.4, 1, 0.3); // the right knee leans toward the middle of the car: clear of the column
  const TOE_L = V(0, 0.12, 1).normalize();
  const TOE_R = V(0, 0.7, 0.71).normalize();
  // the ball of your right foot, from its ankle, once the foot points along TOE_R; and the way the pad faces (the car's frame)
  const SOLE = V(0, -7.6, 11).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(FRONT, TOE_R));
  const PAD_N = V(0, 0.447, 0.894);
  const HAND_AT = [Math.PI - 0.172, 0.172]; // where each hand holds the rim, from its +x: a quarter past nine
  const v1 = V();
  const v2 = V();
  const v3 = V();
  const v4 = V();
  // the belt: what it is tied to in the car, and the points of your trunk it runs over (in the trunk's own frame)
  const BELT = {
    ring: V(-80, 113, 40), buckle: V(YOU.x + 19, 46, -14), anchor: V(-66, 42, -10),
    strap: [V(15, 57.5, -1), V(9.5, 47, 10.2), V(0, 31, 10.4), V(-10.5, 13, 9.8)],
    lap: [V(-11.5, 1, 9.2), V(0, -1.5, 11), V(11.5, 1, 9.2)],
  };
  // where your own frame stands in the car, and the way from the car into it
  const gx = SEAT.x;
  const gy = SEAT.y - you.HIP;
  const gz = SEAT.z;
  you.group.position.set(gx, gy, gz);
  const mine = (x, y, z, out) => out.set(-(x - gx), y - gy, -(z - gz));
  const turned = (v, out) => out.set(-v.x, v.y, -v.z); // a direction of the car, in your frame
  /** A point of your trunk, in the car. */
  const onTrunk = (p, out) => {
    out.copy(p).applyMatrix4(you.torso.matrix);
    return out.set(gx - out.x, gy + out.y, gz - out.z);
  };
  /** Your hands on the rim, turned by `spin` (radians, counter-clockwise seen from your seat). */
  function poseHands(spin) {
    for (let i = 0; i < 2; i++) {
      const a = HAND_AT[i] + spin;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      v1.copy(HUBV).addScaledVector(E1, RIM_R * ca).addScaledVector(E2, RIM_R * sa); // where the hand is, on the rim
      turned(v3.copy(E1).multiplyScalar(-sa).addScaledVector(E2, ca), v3); // the rim there: the bar the hand closes on
      turned(v4.copy(E1).multiplyScalar(-ca).addScaledVector(E2, -sa), v4); // the palm faces the hub
      you.hold(i ? "R" : "L", mine(v1.x, v1.y, v1.z, v2), v3, { palm: v4, dir: OVER_RIM, k: 0.92, bar: 1.6 });
    }
  }
  /** Your right foot on the pedal's pad (`pad`: where plan.js says it is). */
  function poseFoot(pad) {
    mine(pad[0] + PAD_N.x * 1.8, pad[1] + PAD_N.y * 1.8, pad[2] + PAD_N.z * 1.8, v1).sub(SOLE);
    you.leg("R", v1, KNEE_R, TOE_R);
  }
  you.leg("L", mine(-56, 38.5, -44, v1), KNEE_L, TOE_L); // the left foot drawn back, flat on the floor: nothing of that leg stands between the door's side and the pedal
  you.lean(-24, 0, 0);
  you.head.position.set(0, 76.5, 1);
  poseHands(0);
  poseFoot(pedalPad(0, 0, 0));
  {
    const chest = V(0, 0, 1).transformDirection(you.torso.matrix);
    chest.set(-chest.x, chest.y, -chest.z);
    const strapPts = [BELT.ring.clone(), ...BELT.strap.map((p) => onTrunk(p, V())), BELT.buckle.clone()];
    const strapNor = [V(0.3, 1, -0.2).normalize(), V(0, 1, 0).lerp(chest, 0.35).normalize(), chest, chest, chest, chest];
    strap.lay(strapPts, strapNor);
    const lapPts = [BELT.buckle.clone(), ...BELT.lap.map((p) => onTrunk(p, V())), BELT.anchor.clone()];
    lap.lay(lapPts, lapPts.map(() => chest.clone().lerp(UP, 0.45).normalize()));
  }

  const HEAD = INK.clone().multiplyScalar(1.5);
  const last = { steer: 0, brake: 0, pulse: 0, at: -1 };

  return {
    group, A, fx,
    /**
     * shell   everything drawn here — road, rain, truck, body, wheels, you (1 → 0: gone)
     * gap     metres from your bumper to the truck's rear: the road, the rain and the truck come with it
     * lane    metres the car has moved to the left: the road and the truck slide to the right
     * yaw     degrees the car has turned to the left: the world turns around it
     * steer   −1 full right … 1 full left: the steering wheel in your hands (100°), the front-right wheel (30°)
     * dive    the nose dips: the body alone, 2.5° at 1 (seats, wheels, you and the system stay put)
     * rain    streaks in the air, the water's reflections, the spray (0–1)
     * truck   the truck and its lamps (0–1)
     * skid    locked wheels: the marks stand still and sharp, a wave ahead of each tyre, straight signal trails (0–1)
     * you     0 nobody · 1 you
     * kmh     how fast the rain slants, how long the spray is, how much the road's lines are spread
     * rolled  metres the wheels have rolled: where their marks are
     * brake, pulse   your right foot follows plan.js's pedalPad(brake, pulse, time)
     */
    update({ shell = 1, gap = 38, lane = 0, yaw = 0, steer = 0, dive = 0, rain: wet = 1, truck: lorry = 1, skid = 0, you: showYou = 1, kmh = 80, rolled = 0, brake = 0, pulse = 0 } = {}, time = 0, px = 1600) {
      const sh = clamp01(shell);
      const rn = clamp01(wet);
      const sk = clamp01(skid);
      const speed = (Math.max(0, kmh) / 3.6) * 100; // cm/s
      const sp = Math.min(1.4, Math.max(0, kmh) / 80);
      const th = yaw * DEG;
      const co = Math.cos(th);
      const si = Math.sin(th);
      const slid = lane * 100;
      const scroll = gap * 100;
      const breath = 0.5 + 0.5 * Math.sin(time * 2.4); // slow: a light that blinks reads as a fault

      // the world comes to the car
      group.visible = sh > 0.003;
      pivot.rotation.y = -th;
      slide.position.x = slid;
      let u = road.uniforms;
      u.uAmount.value = sh;
      u.uRain.value = rn;
      u.uScroll.value = scroll;
      u.uSmear.value = speed * SHUTTER;
      u.uCar.value.set(slid, co, si, 0);
      u.uTruckZ.value = NOSE - scroll;
      u.uTruck.value = clamp01(lorry);
      u.uBreath.value = breath;
      u.uSkid.value = sk;
      u.uWake.value = smooth(0.03, 0.3, sp);
      for (let i = 0; i < 4; i++) u.uWheel.value[i].set(WHEELS[i][0] * co + WHEELS[i][1] * si - slid, -WHEELS[i][0] * si + WHEELS[i][1] * co);
      u = rain.uniforms;
      rain.mesh.visible = rn * sh > 0.003;
      u.uAmount.value = rn * sh;
      u.uTime.value = time;
      u.uScroll.value = scroll;
      u.uScale.value = px;
      u.uSpeed.value = speed;
      u.uCar.value.set(slid, co, si, 0);
      truck.root.position.z = NOSE - scroll;
      truck.set(clamp01(lorry) * sh, smooth(34, 16, gap), breath, px);
      lamp.intensity = 1800 * sh;

      // the spray
      for (let i = 0; i < 2; i++) {
        u = spray.uniforms[i];
        u.uTime.value = time;
        u.uSpeed.value = sp;
        u.uSkid.value = sk;
        u.uAmount.value = rn * sh;
        u.uScale.value = px;
      }
      spray.mist.visible = spray.drops.visible = rn * sh * sp > 0.003;

      // the body
      tilt.rotation.x = -DIVE.deg * DEG * dive;
      fx.skin.uniforms.uAmount.value = sh;
      fx.inner.uniforms.uAmount.value = sh;
      fx.tyre.uniforms.uAmount.value = sh;
      fx.trim.uniforms.uAmount.value = sh;
      fx.strong.uniforms.uAmount.value = 0.8 * sh;
      fx.fine.uniforms.uAmount.value = 0.48 * sh;
      fx.lamp.uniforms.uAmount.value = 0.9 * sh;
      for (let i = 0; i < fx.kitLines.length; i++) fx.kitLines[i].opacity = fx.kitLines[i].userData.base * sh;
      setPartOpacity(fit, sh);
      setPartOpacity(trim, sh);
      lamps.uniforms.uScale.value = px;
      for (let i = 0; i < 2; i++) lamps.put(i, (i ? 1 : -1) * 70, 62, NOSE + 9, HEAD, 0.55 * sh, 70);
      lamps.flush();

      // the wheels: their marks turn with `rolled`, spread by the speed unless they are locked; the front one steers
      u = fx.mark.uniforms;
      u.uAmount.value = sh;
      u.uAngle.value = ((100 * rolled) / CAR.wheel) % TAU;
      u.uSmear.value = (speed / CAR.wheel / 30) * (1 - sk);
      fx.wheels.wheelFR.rotation.y = LOCK * steer;

      // you
      you.group.visible = showYou > 0.5;
      you.body.uniforms.uAmount.value = sh;
      steering.rotation.z = SPIN * steer;
      if (steer !== last.steer) {
        poseHands(SPIN * steer);
        last.steer = steer;
      }
      const at = pulse > 0.001 ? time : -1; // a trembling pedal moves with time
      if (brake !== last.brake || pulse !== last.pulse || at !== last.at) {
        poseFoot(pedalPad(brake, pulse, time));
        last.brake = brake;
        last.pulse = pulse;
        last.at = at;
      }
    },
  };
}
