// DOSSIER 025 — ESP : the road. A French country road at night, wet: one lane each way, its verges and their
// DITCHES, the edge of the wood; a boar standing in your lane, a moose (the hook's C, and 1997); 014's car
// (011's body) seen like an X-ray, its four wheels of glass, its engine and drive shafts, and you at the wheel.
// On the road: the two arrows (where you steer, where the car points), the rear's trails when it lets go, the
// turn the braked wheel gives back; in 1997, the car on two wheels; far over the wood, the next file's rocket.
//
//   buildRoute() → { group, A, update(P, time, px) }
//   P = { shell, gap, lane, yaw, aim, steer, kmh, rolled, rain, boar, moose, mooseAt, you, slide, arrows, alarm,
//         moment, gas, tip, rocket, bFR }
//
// THE FRAME IS THE CAR'S (014): it never moves. The road, its paint, the rain, the wood and the animals live in two
// nested groups — `pivot` (turns by −yaw around the car) › `slide` (slides by +lane to the right) — and scroll with
// `gap`: the animals stand at z = CAR.nose − 100·gap, everything fixed to the road is drawn at s = z + 100·gap.
// world.js turns the whole group back by +yaw·(1 − onboard) (plan.js, « two frames »).
// Three colours. signal: the animal's eyes in the beams and their streaks in the water, the rear's trails, the
// car's arrow when it no longer goes where you steer, the rocket's broken trail. veille: the car's arrow while it
// agrees, the turn given back, the front-right rim when its brake bites, the pod falling under the rocket. ink: the
// rest — and where your steering wheel asks to go. Nothing is solid here but the steering wheel and the belt
// (model.js brings the system); the animals are glass over a dark fill, so that the beams behind them cut a shape.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeGeometries as mergeBare } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, setGlow, glass, asShell, lineMat, box, cyl, lathe, placed, anchor, makePart, addMesh, setPartOpacity, SOFTBOX } from "@kit/build3d.js";
import { CAR, YOU, STEERING, HUB, HUBS, TYRE, ENGINE, LANE, ROAD, BOAR, MOOSE, ARROW } from "./plan.js";
import { dressRoute } from "./habillage.js"; // the decorator: the delineators, the sign, a borne, the countryside

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
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
const SPIN = 100 * DEG; // the steering wheel at `steer` ±1
const LOCK = 30 * DEG; // the front wheels at `steer` ±1
const SHUTTER = 0.5 / 30; // how long the stage's shutter stays open (s): what moves is spread over that
const FALL = 820; // how fast the rain falls (cm/s)
// where the four tyres touch the road, in the car's frame: FL, FR, RL, RR
const WHEELS = [[HUB[0], HUB[2]], [-HUB[0], HUB[2]], [-CAR.track, CAR.rear], [CAR.track, CAR.rear]];
const TIP_X = CAR.track + 11; // 1997: the car tips about the line where its right tyres touch the road…
const TIP = 40 * DEG; //          …by this much at `tip` 1 (the tipping point: never on its roof)
const BOAR_TURN = -0.15; // the boar stands across your lane, a little turned (its head, toward your lamps, turns more)
const MOOSE_TURN = -0.2;
const ARROW_FROM = 260;
const ARROW_LEN = 0.6 * ARROW.len; // 5.4 m: from VIEW.top their heads stay in the frame // the arrows start this far ahead of the car's centre (past its nose)
const WOOD = { span: 14000, back: 3000 }; // the trees are wrapped in a window from 110 m ahead to 30 m behind the car

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
          float keep = clamp(0.45 * eye.y, 200.0, 1200.0); // seen from high up, the drops near the lens would be slabs across the frame
          vA = uAmount * edge * smoothstep(0.25 * keep, keep, b.w) * mix(1.0, 1.0 - smoothstep(180.0, 420.0, p.y), smoothstep(450.0, 1000.0, eye.y)) * clamp(truePx / 2.0, 0.12, 1.0) * (1.0 - inside) * smoothstep(0.0, 14.0, p.y) * (0.35 + 0.65 * aSeed.x) * (1.0 + 2.4 * beam);
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

/* ───────────────────────────────────────────────────────────── the wet country road */

const ED = ROAD.edge; //                  your lane's edge line, on your right
const MID = -LANE.w / 2; //               the centre line, dashed
const OTHER = ROAD.otherEdge; //          the other lane's edge
const DW = ROAD.ditch.w;
const DD = ROAD.ditch.depth;
const DR = ED + ROAD.verge; //            the right ditch: DR → DR + DW
const DL = OTHER - ROAD.verge - DW; //    the left ditch: DL → DL + DW
const TREES = ROAD.trees; //              the edge of the wood, beyond each edge line
/** The ground's height across the road (cm): flat — but for the two ditches, a smooth trough. */
const DITCHES = [DR, DL];
const groundY = (x) => {
  for (const x0 of DITCHES) {
    const t = (x - x0) / DW;
    if (t > 0 && t < 1) return -DD * 0.5 * (1 - Math.cos(TAU * t));
  }
  return 0;
};
/** How much of the headlamps reaches a point of the car's frame (the same beams as the road's shader). */
const beamAt = (x, z) => {
  const ahead = NOSE - z;
  if (ahead < -10) return 0;
  const w = 62 + 0.2 * Math.max(ahead, 0);
  const bl = (x - 60) / w;
  const br = (x + 60) / w;
  return 0.5 * (Math.exp(-bl * bl) + Math.exp(-br * br)) * smooth(-10, 240, ahead) * Math.exp(-Math.max(ahead, 0) / 2000);
};

/** The road's ground: a strip across (fine through the ditches, so their trough is round), two rows along. */
function roadGeometry() {
  const xs = new Set();
  for (let x = -4500; x <= 4500; x += 100) xs.add(x);
  for (const x0 of [DR, DL]) for (let i = 0; i <= 28; i++) xs.add(x0 + (DW * i) / 28);
  const X = [...xs].sort((a, b) => a - b);
  const Z = [-36000, 8000];
  const pos = new Float32Array(X.length * 2 * 3);
  const index = [];
  X.forEach((x, i) => {
    const y = groundY(x);
    pos.set([x, y, Z[0], x, y, Z[1]], i * 6);
    if (i < X.length - 1) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  return geo;
}

/**
 * No floor under an X-ray: a grid, the paint, the two ditches, and the water, read by what it mirrors. A French
 * country road: your edge line, the dashed centre line, the other lane's edge; beyond them the verges (the grid
 * alone), the ditches (their two lips, their walls hatched along the road, a thread of water at the bottom). The
 * headlamps lay two beams on it; the animal's eyes, lit by them, mirror into two signal streaks; the rear tyres,
 * when the rear lets go, leave signal trails that curve out (`uSlide`). Everything in one shader, in the road's frame.
 */
function makeRoad() {
  const uniforms = {
    uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uAmount: { value: 1 }, uRain: { value: 1 },
    uScroll: { value: 0 }, uSmear: { value: 0 }, uCar: { value: new THREE.Vector4(0, 1, 0, 0) },
    uEye: { value: [0, 1, 2, 3].map(() => new THREE.Vector4(0, 50, -3000, 0)) },
    uSlide: { value: 0 }, uTrail: { value: 800 }, uWake: { value: 1 },
    uWheel: { value: WHEELS.map(([x, z]) => new THREE.Vector2(x, z)) },
  };
  const mesh = new THREE.Mesh(
    roadGeometry(),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec2 vP; varying vec3 vCam;
        void main() {
          vP = position.xz;
          vCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz; // the eye, in the road's frame
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uSignal; uniform float uAmount, uRain, uScroll, uSmear, uSlide, uTrail, uWake;
        uniform vec4 uCar; uniform vec2 uWheel[4]; uniform vec4 uEye[4];
        varying vec2 vP; varying vec3 vCam;
        ${TO_CAR}
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        float lines(float x, float cell, float smear) {
          float q = x / cell;
          float f = fwidth(q);
          float w = max(f * 1.5, 1e-5);
          float d = abs(fract(q - 0.5) - 0.5);
          float reach = max(w, 0.5 * smear / cell);
          return (w / reach) * (1.0 - smoothstep(reach - w, reach, d)) * (1.0 - smoothstep(0.12, 0.4, f));
        }
        float band(float d, float halfW) {
          float w = max(fwidth(d), 1e-4);
          float h = max(halfW, 0.9 * w);
          return (halfW / h) * (1.0 - smoothstep(h - 0.6 * w, h + 0.6 * w, abs(d)));
        }
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
          float far = exp(-near / 3600.0);
          // the headlamps: two beams that widen and merge — the only light of the night
          float ahead = ${NOSE.toFixed(1)} - pc.y;
          float wB = 62.0 + 0.2 * max(ahead, 0.0);
          float bl = (pc.x - 60.0) / wB; float br = (pc.x + 60.0) / wB;
          float beam = 0.5 * (exp(-bl * bl) + exp(-br * br)) * smoothstep(-10.0, 240.0, ahead) * exp(-max(ahead, 0.0) / 2000.0);
          float onRoad = smoothstep(${(OTHER - 20).toFixed(1)}, ${(OTHER + 5).toFixed(1)}, vP.x) * (1.0 - smoothstep(${(ED - 5).toFixed(1)}, ${(ED + 20).toFixed(1)}, vP.x));
          // the grid (the asphalt and the grass alike: there is no floor)
          float g = max(lines(vP.x, 50.0, 0.0), lines(s, 50.0, uSmear)) * 0.38 + max(lines(vP.x, 250.0, 0.0), lines(s, 250.0, uSmear));
          float ink = g * (0.22 * exp(-near / 700.0) + 0.04 * far + 0.26 * beam);
          // the paint: your edge line, the dashed centre line, the other lane's edge
          float paint = band(vP.x - ${ED.toFixed(1)}, 7.5) + band(vP.x - ${OTHER.toFixed(1)}, 7.5) + band(vP.x - ${MID.toFixed(1)}, 6.5) * dash(s, 1300.0, 300.0, uSmear);
          ink += paint * (0.3 * exp(-near / 3000.0) + 0.06 * far + 0.05 + 0.7 * beam);
          // the ditches: their lips, their walls hatched along the road, a thread of water at the bottom
          float tR = (vP.x - ${DR.toFixed(1)}) / ${DW.toFixed(1)};
          float tL = (vP.x - ${DL.toFixed(1)}) / ${DW.toFixed(1)};
          float inD = step(0.0, tR) * step(tR, 1.0) + step(0.0, tL) * step(tL, 1.0);
          float lips = band(vP.x - ${DR.toFixed(1)}, 4.0) + band(vP.x - ${(DR + DW).toFixed(1)}, 4.0) + band(vP.x - ${DL.toFixed(1)}, 4.0) + band(vP.x - ${(DL + DW).toFixed(1)}, 4.0);
          float walls = max(lines(s, 60.0, uSmear), 0.5 * lines(vP.x, 35.0, 0.0)) * inD; // ribs across the trough follow its curve
          float bottom = band(vP.x - ${(DR + DW / 2).toFixed(1)}, 8.0) + band(vP.x - ${(DL + DW / 2).toFixed(1)}, 8.0);
          float wash = inD * (0.5 + 0.5 * cos(6.2832 * clamp(tR * step(0.0, tR) * step(tR, 1.0) + tL * step(0.0, tL) * step(tL, 1.0), 0.0, 1.0))); // the trough: lighter at its lips, dark at its bottom
          ink += (0.45 * lips + 0.75 * walls) * (0.2 * far + 0.08 + 0.6 * beam) + 0.035 * wash * (far + 2.0 * beam);
          // the water: long streaks along the road (slow enough along z not to shimmer as it goes by), and in the ditches
          float nx = vP.x / 7.0;
          float tex = mix(noise(vec2(nx, s / 760.0)), 0.5, smoothstep(0.35, 1.2, fwidth(nx)));
          ink += uRain * beam * (0.04 + 0.14 * tex) * onRoad;
          ink += bottom * (0.05 * far + 0.02 + 0.5 * beam) * (0.45 + 0.55 * uRain) * (0.6 + 0.4 * tex);
          // a little light under the car
          float pool = clamp(1.0 - length(vec2(pc.x / 190.0, (pc.y - 10.0) / 360.0)), 0.0, 1.0);
          ink += 0.03 * pool * pool;
          // the eyes in the water: mirrored toward the eye (a wet road draws a light out into a streak)
          vec3 P = vec3(vP.x, 0.0, vP.y);
          vec3 v = normalize(vCam - P + vec3(0.0, 1e-3, 0.0));
          float refl = 0.0;
          for (int i = 0; i < 4; i++) {
            float k = uEye[i].w;
            if (k < 0.002) continue;
            vec3 Lp = uEye[i].xyz;
            vec3 h = normalize(normalize(Lp - P + vec3(0.0, 1e-3, 0.0)) + v);
            float hy = max(h.y, 0.02);
            float e = (h.x * h.x + h.z * h.z) / (hy * hy * 0.0036);
            vec2 rel = P.xz - Lp.xz;
            vec2 toEye = normalize(vCam.xz - Lp.xz + vec2(0.0, 1e-3));
            float run = dot(rel, toEye);
            float off = (rel.x * toEye.y - rel.y * toEye.x) / (5.0 + 0.009 * max(run, 0.0));
            float dl = length(rel);
            refl += k * (0.8 * exp(-min(e, 30.0)) / (1.0 + dl * dl / 360000.0) + 0.22 * exp(-off * off) * smoothstep(-10.0, 40.0, run) * exp(-max(run, 0.0) / 300.0));
          }
          vec2 under = 1.0 - smoothstep(vec2(95.0, 245.0), vec2(150.0, 330.0), abs(pc));
          refl *= (1.0 - 0.92 * under.x * under.y) * onRoad;
          vec3 col = uInk * ink + uSignal * refl * uRain * (0.55 + 0.6 * tex);
          // behind each tyre: the track it opens in the water (two fine edges)
          float wake = 0.0;
          for (int i = 0; i < 4; i++) {
            vec2 d = vP - uWheel[i];
            float behind = smoothstep(-8.0, 12.0, d.y);
            wake += (band(d.x - 9.5, 1.7) + band(d.x + 9.5, 1.7) + 0.2 * band(d.x, 9.5)) * behind * exp(-max(d.y, 0.0) / 600.0);
          }
          // the rear lets go: each rear tyre's trail curves out, from the line it held to where it is now
          float trail = 0.0;
          for (int i = 2; i < 4; i++) {
            vec2 W = uWheel[i];
            float x0 = i == 2 ? ${(-CAR.track).toFixed(1)} : ${CAR.track.toFixed(1)};
            float a = (vP.y - W.y) / uTrail;
            float u = clamp(a, 0.0, 1.0);
            float xc = W.x + (x0 - W.x) * u * u;
            float slope = 2.0 * (x0 - W.x) * u / uTrail;
            float dd = (vP.x - xc) / sqrt(1.0 + slope * slope);
            float span = smoothstep(-0.01, 0.02, a) * (1.0 - smoothstep(0.65, 1.0, a));
            trail += band(dd, 9.0) * span * mix(1.0, 0.4, u);
          }
          col += uSignal * trail * uSlide * 1.15 * onRoad + uInk * wake * 0.2 * uRain * uWake * (1.0 - uSlide);
          gl_FragColor = vec4(col * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the edge of the wood */

/**
 * Trunks of glass along both verges, two to three deep, fixed to the road (they come with `uScroll`, wrapped in
 * a window ahead of the car and faded at both of its ends). No crown: each fades into the night above two or
 * three metres. The beams catch the ones they sweep. One instanced draw; the decorator dresses the rest.
 */
function makeWood(seed) {
  const rand = rng(seed);
  const trees = [];
  for (const side of [1, -1]) {
    const x0 = side > 0 ? ED + TREES : OTHER - TREES;
    for (let row = 0; row < 3; row++) {
      for (let s = -WOOD.back; s < WOOD.span - WOOD.back; s += 280 + 340 * rand()) {
        const x = x0 + side * (row * 260 + 160 * rand());
        trees.push([x, s + 120 * rand(), 9 + 16 * rand() + (row === 0 ? 4 : 0), 420 + 420 * rand()]);
      }
    }
  }
  const base = new THREE.CylinderGeometry(1, 1, 1, 12, 1, true).translate(0, 0.5, 0);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute("position", base.getAttribute("position"));
  geo.setAttribute("normal", base.getAttribute("normal"));
  geo.setAttribute("aTree", new THREE.InstancedBufferAttribute(new Float32Array(trees.flat()), 4));
  geo.instanceCount = trees.length;
  const uniforms = { uInk: { value: INK.clone() }, uAmount: { value: 1 }, uScroll: { value: 0 }, uCar: { value: new THREE.Vector4(0, 1, 0, 0) } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uScroll; uniform vec4 uCar;
        attribute vec4 aTree; varying vec3 vN; varying vec3 vV; varying float vH; varying float vK; varying float vHigh;
        ${TO_CAR}
        void main() {
          float z = ${(-WOOD.span + WOOD.back).toFixed(1)} + mod(aTree.y - uScroll + ${(WOOD.span - WOOD.back).toFixed(1)}, ${WOOD.span.toFixed(1)});
          vec3 p = vec3(aTree.x + position.x * aTree.z, position.y * aTree.w, z + position.z * aTree.z);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          vH = position.y;
          vec2 c = toCar(p.xz);
          float ahead = ${NOSE.toFixed(1)} - c.y;
          float wB = 90.0 + 0.24 * max(ahead, 0.0);
          float beam = exp(-c.x * c.x / (wB * wB)) * smoothstep(0.0, 300.0, ahead) * exp(-max(ahead, 0.0) / 2400.0);
          float ends = smoothstep(${(-WOOD.span + WOOD.back).toFixed(1)}, ${(-WOOD.span + WOOD.back + 2500).toFixed(1)}, z) * (1.0 - smoothstep(${(WOOD.back - 900).toFixed(1)}, ${WOOD.back.toFixed(1)}, z));
          vHigh = smoothstep(500.0, 1400.0, cameraPosition.y);
          vK = ends * (0.5 + 2.2 * beam) * (1.0 - 0.3 * vHigh);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk; uniform float uAmount; varying vec3 vN; varying vec3 vV; varying float vH; varying float vK; varying float vHigh;
        void main() {
          if (uAmount < 0.003 || vK < 0.003) discard;
          float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
          float light = 0.006 + 0.3 * pow(g, 2.4) + 0.22 * smoothstep(0.62, 0.97, g);
          float up = smoothstep(0.0, 0.05, vH) * (1.0 - smoothstep(mix(0.3, 0.04, vHigh), mix(0.95, 0.22, vHigh), vH)); // into the night above
          gl_FragColor = vec4(uInk * light * up * vK * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the animals */

/**
 * The glass of an animal: rim and lip like the kit's glass, and the face turned to the headlamps lit by them
 * (`uLamp`: where the lamps are, in the animal's own frame; `uLit`: how much of the beams reaches it).
 */
function beastGlass() {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: INK.clone() }, uAmount: { value: 1 }, uGain: { value: 1 }, uBase: { value: 0.004 }, uSpec: { value: 0 },
      uLamp: { value: V(0, 60, 2000) }, uLit: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vNl; varying vec3 vPl;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vNl = normal;
        vPl = position;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uLamp; uniform float uAmount, uGain, uBase, uLit;
      varying vec3 vN; varying vec3 vV; varying vec3 vNl; varying vec3 vPl;
      void main() {
        if (uAmount < 0.003) discard;
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        vec3 L = normalize(uLamp - vPl + vec3(0.0, 1e-3, 0.0));
        float lit = max(dot(normalize(vNl + vec3(0.0, 1e-5, 0.0)), L), 0.0);
        float light = uBase + 0.26 * pow(g, 3.0) + 0.55 * smoothstep(0.8, 0.985, g) + uLit * (0.02 + 0.26 * lit * lit * lit);
        gl_FragColor = vec4(uColor * light * uAmount * uGain, 1.0);
      }`,
  });
  mat.userData.through = 0.12;
  return mat;
}

/**
 * An animal of glass built from soft volumes: `body` and `head` lists of pieces (geometries in the root's frame,
 * and in the head's), `legs`, the lines (bristles, antlers), its eyes in the head's frame. A dark fill under the
 * glass hides what is behind it — the headlamps behind a boar make a silhouette, not a ghost.
 */
function makeAnimal({ pieces, headPieces, headAt, headTurn, headTilt, lines, eyes, eyeSize, order }) {
  const root = new THREE.Group();
  const head = new THREE.Group();
  head.position.set(...headAt);
  head.rotation.set(0, headTurn, headTilt, "YXZ");
  root.add(head);
  const mat = beastGlass();
  const fillMat = new THREE.MeshBasicMaterial({ color: BRAND.bg, transparent: true, opacity: 0.86, depthWrite: true });
  const glassMeshes = [];
  const fills = [];
  for (const [parent, list] of [[root, pieces], [head, headPieces]]) {
    const geo = mergeBare(list.map(bare));
    const m = new THREE.Mesh(geo, mat);
    const f = new THREE.Mesh(geo, fillMat);
    f.renderOrder = 4;
    parent.add(f, m);
    glassMeshes.push(m);
    fills.push(f);
  }
  asShell(glassMeshes, order);
  const lineMats = [];
  for (const [parent, list, width, opacity] of lines) {
    const l = new LineSegments2(new LineSegmentsGeometry().setPositions(list(parent === head)), lineMat(BRAND.ink, width, { opacity }));
    l.renderOrder = order + 1;
    lineMats.push(l.material);
    (parent === "head" ? head : root).add(l);
  }
  const eyeSprites = makeSprites(2);
  head.add(eyeSprites.points);
  // where the eyes are in the root's frame (the head never moves on the root): for the water's mirror
  root.updateMatrixWorld(true);
  const eyesRoot = eyes.map((e) => V(...e).applyMatrix4(head.matrix));
  const SIG = SIGNAL.clone().multiplyScalar(2.1);
  return {
    root, head, mat, eyesRoot,
    set(amount, lit, lampLocal, px) {
      const a = clamp01(amount);
      root.visible = a > 0.003;
      mat.uniforms.uAmount.value = a;
      mat.uniforms.uLit.value = lit;
      mat.uniforms.uLamp.value.copy(lampLocal);
      fillMat.opacity = 0.86 * a;
      for (let i = 0; i < lineMats.length; i++) lineMats[i].opacity = lineMats[i].userData.base * a * (0.6 + 0.4 * lit);
      eyeSprites.uniforms.uScale.value = px;
      for (let i = 0; i < 2; i++) eyeSprites.put(i, eyes[i][0], eyes[i][1], eyes[i][2], SIG, a * (0.08 + 0.92 * lit), eyeSize);
      eyeSprites.flush();
    },
  };
}

const ell = (rx, ry, rz, x, y, z, rotZ = 0, rotY = 0) => {
  const g = new THREE.SphereGeometry(1, 30, 20);
  g.scale(rx, ry, rz);
  return placed(g, { pos: [x, y, z], rotZ, rotY });
};
/** A tapered limb from a to b ([x, y, z]), radius r0 at a → r1 at b. */
const limbGeo = (a, b, r0, r1) => {
  const A3 = V(...a);
  const B3 = V(...b);
  const len = A3.distanceTo(B3);
  const g = new THREE.CylinderGeometry(r1, r0, len, 14, 1, false).translate(0, len / 2, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(UP, V().subVectors(B3, A3).normalize());
  g.applyQuaternion(q).translate(...a);
  return g;
};

/** THE BOAR: all in its front — a deep chest, high shoulders, a long wedge of a head carried low; a back that slopes
 *  down to small hindquarters, thin short legs. Its body across your lane, its head turned toward your lamps. */
function makeBoar() {
  const legs = [];
  for (const [x, z, k] of [[26, 10, 1], [26, -10, 1], [-44, 9, 0.9], [-44, -9, 0.9]]) {
    legs.push(limbGeo([x, 40, z], [x + 1, 16, z], 7 * k, 4.2 * k));
    legs.push(limbGeo([x + 1, 17, z], [x + 3, 3, z], 3.6, 2.8));
    legs.push(ell(3.6, 3, 3.4, x + 4, 2.6, z)); // the hoof
  }
  const pieces = [
    ell(34, 33, 23, 16, 54, 0, -0.1), //    the chest and the high shoulders
    ell(46, 25, 21, -16, 50, 0, 0.12), //   the barrel, sloping down to the rear
    ell(22, 21, 17, -46, 46, 0), //         the small hindquarters
    limbGeo([-66, 52, 0], [-72, 30, 0], 2.0, 1.0), // the tail, hanging
    ...legs,
  ];
  // the head, in its own frame: from the neck (x 0) to the snout (x 56), carried low
  const headPieces = [
    placed(new THREE.CylinderGeometry(6.5, 20, 52, 28, 1, false).rotateZ(-Math.PI / 2).translate(26, 0, 0).scale(1, 1, 0.78), {}),
    ell(18, 20, 15, 4, 0, 0), //              the jowls, where the head meets the shoulders
    placed(new THREE.CylinderGeometry(7, 7, 3, 24).rotateZ(-Math.PI / 2), { pos: [52.5, 0, 0] }), // the snout's disc
    placed(new THREE.ConeGeometry(5, 14, 12), { pos: [6, 19, 8], rotX: 0.3, rotZ: 0.45 }), //  the ears, pricked back
    placed(new THREE.ConeGeometry(5, 14, 12), { pos: [6, 19, -8], rotX: -0.3, rotZ: 0.45 }),
  ];
  // its crest of bristles, along the spine — tallest over the shoulders —, and the tusks
  const crest = () => {
    const l = [];
    const spine = (x) => (x > -4 ? 54 + 33 * Math.sqrt(Math.max(0, 1 - ((x - 16) / 34) ** 2)) : 50 + 25 * Math.sqrt(Math.max(0, 1 - ((x + 16) / 46) ** 2)) + 0.12 * (x + 16));
    for (let i = 0; i < 22; i++) {
      const x = -58 + i * 4.6;
      const y = spine(x) - 1;
      const tall = 3 + 7 * smooth(-30, 10, x) * (1 - smooth(30, 46, x));
      l.push(x, y, 0, x - 1.5, y + tall, 0);
    }
    return l;
  };
  const tusks = () => [47, -5, 6, 51, 3, 9.5, 47, -5, -6, 51, 3, -9.5];
  return makeAnimal({
    pieces, headPieces, headAt: [42, 56, 0], headTurn: -0.38, headTilt: -0.52,
    lines: [[null, crest, 2.2, 0.62], ["head", tusks, 2.6, 0.75]],
    eyes: [[30, 8, 8.4], [30, 8, -8.4]], eyeSize: 34, order: 9,
  });
}

/** THE MOOSE: long legs, a hump, a long muzzle, palmate antlers drawn as ink lines. */
function makeMoose() {
  const legs = [];
  for (const [x, z] of [[62, 17], [62, -17], [-72, 18], [-72, -18]]) {
    legs.push(limbGeo([x, 132, z], [x, 64, z], 10, 6.5));
    legs.push(limbGeo([x, 66, z], [x + 3, 5, z], 6, 4));
    legs.push(ell(6, 4, 5.5, x + 4, 4, z));
  }
  const pieces = [
    ell(92, 44, 36, -6, 150, 0), //            the barrel
    ell(46, 52, 34, 52, 168, 0, -0.15), //     the hump
    limbGeo([78, 170, 0], [112, 204, 0], 20, 13), // the neck
    ell(8, 16, 6, 104, 158, 0), //             the bell
    ...legs,
  ];
  const headPieces = [
    placed(new THREE.CylinderGeometry(11, 15, 52, 22, 1, false).rotateZ(-Math.PI / 2).translate(26, 0, 0).scale(1, 1, 0.8), {}),
    ell(13, 12, 11, 52, -4, 0), //             the heavy nose
    placed(new THREE.ConeGeometry(5, 15, 10), { pos: [2, 15, 9], rotX: 0.6 }),
    placed(new THREE.ConeGeometry(5, 15, 10), { pos: [2, 15, -9], rotX: -0.6 }),
  ];
  // the antlers: on each side a palm (its outline) and its tines, spreading out and up
  const antlers = () => {
    const l = [];
    const seg = (a, b) => l.push(...a, ...b);
    for (const s of [1, -1]) {
      const base = [8, 12, s * 7];
      const root = [6, 18, s * 26];
      seg(base, root);
      const palm = [[6, 18, s * 26], [-2, 30, s * 40], [2, 42, s * 58], [12, 44, s * 70], [20, 34, s * 64], [16, 22, s * 44], [6, 18, s * 26]];
      for (let i = 0; i < palm.length - 1; i++) seg(palm[i], palm[i + 1]);
      for (const [p, q] of [[[-2, 30, s * 40], [-10, 44, s * 44]], [[2, 42, s * 58], [-4, 56, s * 64]], [[12, 44, s * 70], [10, 58, s * 80]], [[20, 34, s * 64], [32, 40, s * 78]], [[16, 22, s * 44], [28, 22, s * 56]]]) seg(p, q);
    }
    return l;
  };
  return makeAnimal({
    pieces, headPieces, headAt: [112, 204, 0], headTurn: -0.5, headTilt: -0.55,
    lines: [["head", antlers, 2.6, 0.7]],
    eyes: [[22, 8, 9.5], [22, 8, -9.5]], eyeSize: 30, order: 9,
  });
}

/* ───────────────────────────────────────────────────────────── the arrows, the turn given back */

/** A flat arrow lying on the road, from `r0` cm ahead of the car's centre, `len` long, along −z. */
function arrowGeo(len, w, r0) {
  const hl = 4.6 * w;
  const hw = 2.8 * w;
  const s = new THREE.Shape();
  s.moveTo(-w / 2, r0);
  s.lineTo(w / 2, r0);
  s.lineTo(w / 2, r0 + len - hl);
  s.lineTo(hw / 2, r0 + len - hl);
  s.lineTo(0, r0 + len);
  s.lineTo(-hw / 2, r0 + len - hl);
  s.lineTo(-w / 2, r0 + len - hl);
  s.closePath();
  return new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2);
}

const MOMENT = { r: 300, w: 30, from: 68 * DEG, sweep: 80 * DEG };
/**
 * The turn the braked wheel gives back: an arc of veille around the car on the road, from its front-right corner,
 * sweeping to the RIGHT (against the spin) as `moment` grows; its tip is a head of light, an arrowhead on it.
 */
function makeMoment() {
  const uniforms = { uColor: { value: VEILLE.clone() }, uTip: { value: MOMENT.from }, uAmount: { value: 0 } };
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(MOMENT.r - MOMENT.w / 2, MOMENT.r + MOMENT.w / 2, 96, 1, MOMENT.from - MOMENT.sweep - 0.05, MOMENT.sweep + 0.1).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec2 vQ;
        void main() { vQ = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uTip, uAmount; varying vec2 vQ;
        void main() {
          if (uAmount < 0.003) discard;
          float a = atan(-vQ.y, vQ.x);
          float shown = smoothstep(uTip - 0.004, uTip + 0.02, a) * (1.0 - smoothstep(${(MOMENT.from - 0.02).toFixed(3)}, ${(MOMENT.from + 0.01).toFixed(3)}, a));
          float head = exp(-max(a - uTip, 0.0) / 0.35);
          gl_FragColor = vec4(uColor * (0.32 + 1.15 * head) * shown * uAmount, 1.0);
        }`,
    }),
  );
  ring.position.y = 7;
  ring.renderOrder = 3;
  const tri = new THREE.BufferGeometry();
  tri.setAttribute("position", new THREE.Float32BufferAttribute([46, 0, 0, -18, 0, -40, -18, 0, 40], 3));
  const headMat = new THREE.MeshBasicMaterial({ color: VEILLE.clone().multiplyScalar(1.45), transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false });
  const tip = new THREE.Mesh(tri, headMat);
  tip.renderOrder = 3;
  const group = new THREE.Group();
  group.add(ring, tip);
  return {
    group,
    set(m) {
      const k = clamp01(m);
      group.visible = k > 0.003;
      const a = MOMENT.from - MOMENT.sweep * smooth(0, 1, k);
      uniforms.uTip.value = a;
      uniforms.uAmount.value = Math.min(1, k * 4);
      tip.position.set(MOMENT.r * Math.cos(a), 7.5, -MOMENT.r * Math.sin(a));
      tip.rotation.y = a - Math.PI / 2;
      headMat.opacity = Math.min(1, k * 4);
    },
  };
}

/* ───────────────────────────────────────────────────────────── the engine, the drive */

/** Ink heads that flow along a tube (a drive shaft), `period` cm apart, at `speed` cm/s (≤ a seventh of a period per frame). */
function flowMat(len, period = 18, speed = 60) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone() }, uTime: { value: 0 }, uGas: { value: 1 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying float vU;
      void main() { vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uGas, uAmount; varying float vU;
      void main() {
        if (uAmount < 0.003) discard;
        float f = fract(vU * ${(len / period).toFixed(3)} - uTime * ${(speed / period).toFixed(4)});
        float pulse = smoothstep(0.0, 0.1, f) * (1.0 - smoothstep(0.1, 0.5, f));
        gl_FragColor = vec4(uColor * (0.22 + 2.3 * pulse * uGas) * uAmount, 1.0);
      }`,
  });
}

/* ───────────────────────────────────────────────────────────── the rocket (the next file) */

const SKY = { at: [-900, 700, -17000], lean: 1500, rise: 8200, fall: 2200 };
/** Its trail: a strip drawn on screen along a fixed path, from the trees to its head; it breaks; a point falls away. */
function makeRocket() {
  const N = 96;
  const pos = new Float32Array((N + 1) * 2 * 3);
  const u = new Float32Array((N + 1) * 2);
  const side = new Float32Array((N + 1) * 2);
  const index = [];
  for (let i = 0; i <= N; i++) {
    u[i * 2] = u[i * 2 + 1] = i / N;
    side[i * 2] = -1;
    side[i * 2 + 1] = 1;
    if (i < N) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aU", new THREE.BufferAttribute(u, 1));
  geo.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
  geo.setIndex(index);
  const uniforms = {
    uColor: { value: INK.clone() }, uRes: { value: RES }, uTop: { value: 0 }, uCut: { value: 2 }, uFade: { value: 1 },
    uP0: { value: V(...SKY.at) }, uLean: { value: SKY.lean }, uRise: { value: SKY.rise },
  };
  const trail = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform vec3 uP0; uniform float uLean, uRise; uniform vec2 uRes;
        attribute float aU; attribute float aSide; varying float vU;
        vec3 path(float u) { return uP0 + vec3(uLean * u * u, uRise * u, 0.0); }
        void main() {
          vU = aU;
          vec4 a = projectionMatrix * modelViewMatrix * vec4(path(aU), 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(path(aU + 0.004), 1.0);
          if (a.w < 1.0 || b.w < 1.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          vec2 run = (b.xy / b.w - a.xy / a.w) * uRes;
          float len = length(run);
          run = len > 1e-4 ? run / len : vec2(0.0, 1.0);
          float wide = mix(3.4, 6.0, aU);
          a.xy += vec2(-run.y, run.x) * aSide * (wide / uRes) * a.w;
          gl_Position = a;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uTop, uCut, uFade; varying float vU;
        void main() {
          float k = smoothstep(0.0, 0.12, vU) * (1.0 - smoothstep(uTop - 0.012, uTop, vU)) * mix(0.25, 1.0, vU / max(uTop, 0.01));
          k *= 1.0 - smoothstep(uCut - 0.03, uCut, vU); // the top of a broken trail, dissolving downward
          if (k * uFade < 0.002) discard;
          gl_FragColor = vec4(uColor * 0.85 * k * uFade, 1.0);
        }`,
    }),
  );
  trail.frustumCulled = false;
  trail.renderOrder = 3;
  const lights = makeSprites(3);
  const group = new THREE.Group();
  group.add(trail, lights.points);
  const at = (k, out) => out.set(SKY.at[0] + SKY.lean * k * k, SKY.at[1] + SKY.rise * k, SKY.at[2]);
  const head = V();
  const top = V();
  const HEAD = INK.clone().multiplyScalar(1.6);
  const FLARE = SIGNAL.clone().multiplyScalar(2.2);
  const POD = VEILLE.clone().multiplyScalar(1.7);
  return {
    group, head,
    set(rk, px) {
      group.visible = rk > 0.003;
      const climb = smooth(0, 0.7, rk);
      const brk = smooth(0.7, 0.8, rk);
      const fall = smooth(0.8, 1, rk);
      uniforms.uTop.value = 0.02 + 0.98 * climb;
      uniforms.uCut.value = rk < 0.7 ? 2 : 1 - 0.08 * brk - 0.1 * fall; // the trail breaks under its head
      uniforms.uFade.value = 1 - 0.35 * fall;
      at(climb, head);
      at(1, top);
      lights.uniforms.uScale.value = px;
      lights.put(0, head.x, head.y, head.z, HEAD, Math.min(1, rk * 30) * (1 - brk), 650);
      lights.put(1, top.x, top.y, top.z, FLARE, Math.sin(Math.PI * brk) * (rk < 0.8 ? 1 : 0), 900);
      const pod = smooth(0.76, 0.82, rk);
      lights.put(2, top.x + 240 * fall, top.y - SKY.fall * fall, top.z, POD, pod, 560);
      lights.flush();
      if (rk >= 0.8) head.set(top.x + 240 * fall, top.y - SKY.fall * fall, top.z);
    },
  };
}

/* ───────────────────────────────────────────────────────────── the set */

export function buildRoute() {
  const group = new THREE.Group();
  const A = {};
  const fx = {};

  /* ═════════════ 1 · THE ROAD, THE RAIN, THE WOOD, THE ANIMALS — they come to the car ═════════════ */

  const pivot = new THREE.Group(); // the world turns around the car (`yaw`)…
  const slide = new THREE.Group(); // …and slides to its right (`lane`)
  pivot.add(slide);
  group.add(pivot);

  const road = makeRoad();
  const rain = makeRain(2400, 7);
  const wood = makeWood(31);
  slide.add(road.mesh, rain.mesh, wood.mesh);
  const boar = makeBoar();
  boar.root.rotation.y = BOAR_TURN;
  const moose = makeMoose();
  moose.root.rotation.y = MOOSE_TURN;
  slide.add(boar.root, moose.root);
  A.boar = anchor(boar.root, 0, BOAR.h / 2, 0);
  A.moose = anchor(moose.root, 0, MOOSE.h * 0.7, 0);
  const rocket = makeRocket();
  pivot.add(rocket.group); // far over the wood, in the road's orientation (it does not scroll: it is too far to)
  A.rocket = anchor(pivot, ...SKY.at);
  const dress = dressRoute(); slide.add(dress.road); pivot.add(dress.far); // habillage.js

  // your headlamps: a real light on what is solid ahead (no shadow)
  const lamp = new THREE.SpotLight(BRAND.ink, 0, 0, 0.5, 0.85, 1);
  lamp.position.set(0, 66, NOSE + 6);
  lamp.target.position.set(0, 70, NOSE - 3000);
  group.add(lamp, lamp.target);

  /* ═════════════ 2 · THE CAR — its skin ═════════════ */

  const roll = new THREE.Group(); // 1997: the car tips about its right tyres' contact line (`tip`)
  roll.position.set(TIP_X, 0, 0);
  group.add(roll);
  const car = new THREE.Group(); // wheels, seats, the steering wheel, you, the body
  car.position.set(-TIP_X, 0, 0);
  roll.add(car);
  const body = new THREE.Group();
  car.add(body);

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
  const along = (l, r, z0, z1, side) => run(l, between(z0, z1).map((z) => pt(z, typeof r === "function" ? r(z) : r, side)));
  const across = (l, z, r0, r1, side) => {
    const pts = [];
    for (let r = r0; r < r1 - 1e-6; r += 0.5) pts.push(pt(z, r, side));
    pts.push(pt(z, r1, side));
    run(l, pts);
  };
  const SILL = 0.9;
  for (const s of [-1, 1]) {
    along(L.strong, 0, NOSE, TAIL, s);
    along(L.strong, R_SH, NOSE + 6, TAIL - 5, s);
    along(L.strong, R_P1, -84, 168, s);
    along(L.fine, R_P2, -97, 189, s);
    across(L.strong, -97, R_P2, R_TOP, s);
    across(L.fine, -13.5, R_P2, R_TOP, s);
    across(L.fine, 109.5, R_P2, R_TOP, s);
    across(L.strong, 189, R_P2, R_TOP, s);
    const cut = s < 0 ? L.strong : L.fine;
    across(cut, DOOR.z0, SILL, R_P1, s);
    across(cut, DOOR.z1, SILL, R_P1, s);
    along(cut, SILL, DOOR.z0, DOOR.z1, s);
    along(L.fine, SILL, DOOR.z1, 128, s);
    across(L.fine, 52, R_SH, R_P1, s);
    across(L.fine, 128, 0, R_P1, s);
    along(L.fine, R_P1 + 2.5, -224, -99, s);
    across(L.fine, -224, R_P1 + 2.5, R_TOP, s);
    across(L.fine, 197, R_P2, R_TOP, s);
    along(L.lamp, (z) => mix(6.0, 7.5, (z + 232) / 28), -232, -204, s);
    along(L.lamp, (z) => mix(6.0, 6.4, (z + 232) / 28), -232, -206, s);
    run(L.lamp, [pt(-206, 6.4, s), pt(-204, 7.5, s)]);
    along(L.lamp, 7.2, 204, 234.3, s);
  }
  run(L.lamp, [pt(234.3, 7.2, -1), pt(234.3, 7.2, 1)]);
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

  /* ═════════════ 3 · WHAT SAYS "CAR": four wheels, seats, dashboard, steering wheel, belt, the engine ═════════════ */

  fx.inner = glass(BRAND.ink, { base: 0.003, rim: 0.13, power: 2.6, edge: 0.2, through: 0.12 });
  fx.tyre = glass(BRAND.ink, { base: 0.012, rim: 0.32, power: 2.2, edge: 0.4, through: 0.15 });
  fx.trim = glass(BRAND.ink, { base: 0.006, rim: 0.3, power: 2.6, edge: 0.45, spec: 0.6, through: 0.2 });
  fx.engine = glass(BRAND.ink, { base: 0.004, rim: 0.24, power: 2.4, edge: 0.4, through: 0.12 });
  fx.kitLines = [];
  const kitLines = (positions, width, opacity) => {
    const lines = new LineSegments2(new LineSegmentsGeometry().setPositions(positions), lineMat(BRAND.ink, width, { opacity }));
    lines.renderOrder = 2;
    fx.kitLines.push(lines.material);
    return lines;
  };

  /* ── the four wheels: glass, crisp circles, one painted mark (014). model.js puts the solid brakes inside. ── */
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
        float phi = atan(-vYZ.y, vYZ.x);
        float h = min(3.1416, 0.42 + 0.5 * uSmear);
        float d = abs(mod(phi - uAngle + 0.5 * uSmear + 3.1416, 6.2832) - 3.1416);
        float e = 0.05 + 0.3 * min(uSmear, 1.0);
        gl_FragColor = vec4(uColor * ring * (0.42 / h) * (1.0 - smoothstep(h - e, h + e, d)) * uAmount, 1.0);
      }`,
  });
  fx.wheels = {};
  const tyres = [];
  const PROFILE = [[6, 9.3], [TYRE.rim, 10.2], [23, 10.8], [30, 11], [33, 9.4], [34, 5.3], [34, -5.3], [33, -9.4], [30, -11], [23, -10.8], [TYRE.rim, -8.4]];
  fx.bite = glow(BRAND.veille, 0, { additive: true }); // the front-right rim, when its brake bites
  for (const [name, s, z] of [["wheelFL", -1, CAR.front], ["wheelFR", 1, CAR.front], ["wheelRL", -1, CAR.rear], ["wheelRR", 1, CAR.rear]]) {
    const w = new THREE.Group();
    const tyre = new THREE.Mesh(lathe(PROFILE, 56).rotateZ((-s * Math.PI) / 2), fx.tyre);
    const lines = [];
    for (const x of [9.4, -9.4]) circle(lines, 33.4, s * x);
    circle(lines, 22.6, s * 10.9);
    circle(lines, 6, s * 9.4, 24);
    const mark = new THREE.Mesh(new THREE.RingGeometry(23.6, 33, 72).rotateY(Math.PI / 2).translate(s * 11.3, 0, 0), fx.mark);
    mark.renderOrder = 5;
    w.add(tyre, kitLines(lines, 2, 0.6), mark);
    if (name === "wheelFR") {
      const bite = new THREE.Mesh(new THREE.TorusGeometry(TYRE.rim - 0.8, 1.3, 8, 72).rotateY(Math.PI / 2).translate(s * 10.6, 0, 0), fx.bite);
      bite.renderOrder = 5;
      w.add(bite);
    }
    w.position.set(s * CAR.track, CAR.wheel, z);
    car.add(w);
    tyres.push(tyre);
    fx.wheels[name] = w;
  }
  A.wheelFR = anchor(fx.wheels.wheelFR, 0, 0, 0);

  /* ── seats, dashboard, steering column: glass and fine lines ── */
  const TILT = 22 * DEG;
  const AXIS = V(0, Math.sin(TILT), Math.cos(TILT));
  const HUBV = V(STEERING.x, STEERING.y, STEERING.z);
  const cabinGlass = [];
  const cabinLines = [];
  const piece = (geometry, o, into = cabinGlass, edges = cabinLines) => {
    const g = placed(geometry, o);
    edgesInto(edges, g);
    into.push(bare(g));
  };
  for (const x of [YOU.x, -YOU.x]) {
    piece(box(50, 10, 48, 4), { pos: [x, 36, -13] });
    piece(box(48, 64, 10, 4.5), { pos: [x, 71, 9.6], rotX: 24 * DEG });
    piece(box(26, 17, 9, 4), { pos: [x, 119.5, 30.5], rotX: 12 * DEG });
  }
  piece(box(134, 12, 50, 5), { pos: [0, 48, 106] });
  piece(box(134, 58, 10, 5), { pos: [0, 83, 142], rotX: 26 * DEG });
  for (const x of [-38, 38]) piece(box(24, 15, 8, 3.5), { pos: [x, 121, 158], rotX: 16 * DEG });
  piece(box(164, 14, 26, 6), { pos: [0, 90, -80], rotX: -8 * DEG });
  piece(cyl(3.2, 32, 0.6, 20).rotateX(Math.PI / 2), { pos: [HUBV.x, HUBV.y - AXIS.y * 19, HUBV.z - AXIS.z * 19], rotX: -TILT });
  const cabin = new THREE.Mesh(mergeBare(cabinGlass), fx.inner);
  car.add(cabin, kitLines(cabinLines, 1.8, 0.4));

  /* ── the engine between the front wheels, and its two drive shafts (« il coupe les gaz ») ── */
  const engineGlass = [];
  const engineLines = [];
  const [EX, EY, EZ] = ENGINE.at;
  const [EW, EH, ED_] = ENGINE.size;
  piece(box(EW, EH, ED_, 4), { pos: [EX, EY, EZ] }, engineGlass, engineLines); //                the block
  piece(box(EW - 14, 10, ED_ - 12, 3), { pos: [EX, EY + EH / 2 + 5, EZ] }, engineGlass, engineLines); // its head
  piece(cyl(14, 20, 2, 32).rotateZ(Math.PI / 2), { pos: [EX + EW / 2 + 6, EY - 10, EZ + 12] }, engineGlass, engineLines); // the gearbox's bell
  const engine = new THREE.Mesh(mergeBare(engineGlass), fx.engine);
  car.add(engine, kitLines(engineLines, 1.8, 0.45));
  const SHAFT = [];
  const joints = [];
  for (const s of [-1, 1]) {
    const a = V(EX + s * (EW / 2 - 2), CAR.wheel + 1, HUBS.FR[2] - 6);
    const b = V(s * (CAR.track - 15), CAR.wheel, HUBS.FR[2]);
    SHAFT.push([a, b]);
  }
  const shaftLen = SHAFT[0][0].distanceTo(SHAFT[0][1]);
  fx.flow = flowMat(shaftLen);
  for (const [a, b] of SHAFT) {
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 8, 3.2, 12, false), fx.flow);
    tube.renderOrder = 4;
    car.add(tube);
    for (const p of [a, b]) {
      const joint = new THREE.Mesh(new THREE.SphereGeometry(4.2, 16, 12), fx.engine);
      joint.position.copy(p);
      car.add(joint);
      joints.push(joint);
    }
  }
  fx.heart = makeSprites(1); // the engine running: a light that has a place, in the block
  car.add(fx.heart.points);
  A.engine = anchor(car, EX, EY, EZ);

  // the door mirrors
  const mirrors = [-1, 1].map((s) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), fx.trim);
    m.scale.set(4.6, 5.6, 9.5);
    m.position.set(s * 99, 99.5, -76);
    body.add(m);
    return m;
  });

  asShell([engine, ...joints], 14);
  asShell(cabin, 15);
  asShell(tyres, 16);
  asShell([fx.skinMesh, ...mirrors], 20);

  /* ── the few solid things: the steering wheel (it turns with `steer`), the screen, the belt, the door handles ── */
  const fit = makePart("fittings");
  fx.rim = solid(0x7b8086, { rough: 0.55, metal: 0.1 });
  fx.dark = solid(0x3d4349, { rough: 0.7 });
  fx.pale = solid(0xc9c4b8, { rough: 0.6 });
  const RIM_R = 18.5;
  const steering = new THREE.Group();
  steering.position.copy(HUBV);
  steering.rotation.set(-TILT, 0, 0);
  fit.add(steering);
  {
    const spokes = [new THREE.TorusGeometry(RIM_R, 1.6, 14, 72), placed(box(13, 2.6, 1.8, 0.6), { pos: [-11.5, -0.8, 0] }), placed(box(13, 2.6, 1.8, 0.6), { pos: [11.5, -0.8, 0] }), placed(box(3, 13, 1.8, 0.6), { pos: [0, -11, 0] })];
    steering.add(addMesh(fit, mergeBare(spokes.map(bare)), fx.rim, { edges: false }));
    steering.add(addMesh(fit, cyl(7.4, 5, 0.9, 40).rotateX(Math.PI / 2), fx.dark, { edgeOpacity: 0.5, edgeWidth: 1.8 }));
    steering.add(addMesh(fit, placed(new THREE.TorusGeometry(RIM_R, 1.75, 10, 10, 0.34), { rotZ: Math.PI / 2 - 0.17 }), fx.pale, { edges: false }));
  }
  A.steering = anchor(car, HUBV.x, HUBV.y, HUBV.z);
  fx.belt = solid(0x9d998f, { rough: 0.85, double: true });
  const strap = makeRibbon(34, 4.8, fx.belt);
  const lap = makeRibbon(20, 4.8, fx.belt);
  fit.userData.part.mats.add(fx.belt);
  fit.add(strap.mesh, lap.mesh);
  car.add(fit);
  const trim = makePart("trim");
  fx.handles = solid(0x9a9fa4, { rough: 0.4, metal: 0.4 });
  const handleGeo = box(2.2, 2.6, 15, 0.8);
  for (const [s, z] of [[-1, 34], [1, 34], [-1, 112], [1, 112]]) addMesh(trim, handleGeo, fx.handles, { pos: [s * 91.9, 93 + (z > 100 ? 2 : 0), z], edgeOpacity: 0.6, edgeWidth: 1.8 });
  body.add(trim);
  const lamps = makeSprites(2);
  body.add(lamps.points);
  A.nose = anchor(car, 0, 60, NOSE);
  A.tail = anchor(car, 0, 60, TAIL);

  /* ═════════════ 4 · YOU, AT THE WHEEL ═════════════ */

  const you = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.8, through: 0.2 });
  you.group.rotation.y = Math.PI;
  car.add(you.group);
  fit.userData.part.mats.add(you.flesh);
  A.you = anchor(you.head, 0, 0, 0);
  const SEAT = V(YOU.head[0], 48, YOU.head[2] - 31);
  const E1 = V(1, 0, 0);
  const E2 = V().crossVectors(AXIS, E1);
  const OVER_RIM = V(AXIS.x, -AXIS.y, AXIS.z);
  const KNEE_L = V(0.45, 1, 0.2);
  const KNEE_R = V(-0.4, 1, 0.3);
  const TOE = V(0, 0.12, 1).normalize();
  const HAND_AT = [Math.PI - 0.172, 0.172];
  const v1 = V();
  const v2 = V();
  const v3 = V();
  const v4 = V();
  const BELT = {
    ring: V(-80, 113, 40), buckle: V(YOU.x + 19, 46, -14), anchor: V(-66, 42, -10),
    strap: [V(15, 57.5, -1), V(9.5, 47, 10.2), V(0, 31, 10.4), V(-10.5, 13, 9.8)],
    lap: [V(-11.5, 1, 9.2), V(0, -1.5, 11), V(11.5, 1, 9.2)],
  };
  const gx = SEAT.x;
  const gy = SEAT.y - you.HIP;
  const gz = SEAT.z;
  you.group.position.set(gx, gy, gz);
  const mine = (x, y, z, out) => out.set(-(x - gx), y - gy, -(z - gz));
  const turned = (v, out) => out.set(-v.x, v.y, -v.z);
  const onTrunk = (p, out) => {
    out.copy(p).applyMatrix4(you.torso.matrix);
    return out.set(gx - out.x, gy + out.y, gz - out.z);
  };
  function poseHands(spin) {
    for (let i = 0; i < 2; i++) {
      const a = HAND_AT[i] + spin;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      v1.copy(HUBV).addScaledVector(E1, RIM_R * ca).addScaledVector(E2, RIM_R * sa);
      turned(v3.copy(E1).multiplyScalar(-sa).addScaledVector(E2, ca), v3);
      turned(v4.copy(E1).multiplyScalar(-ca).addScaledVector(E2, -sa), v4);
      you.hold(i ? "R" : "L", mine(v1.x, v1.y, v1.z, v2), v3, { palm: v4, dir: OVER_RIM, k: 0.92, bar: 1.6 });
    }
  }
  // both feet flat on the floor: the ESP brakes without you
  you.leg("L", mine(-56, 38.5, -44, v1), KNEE_L, TOE);
  you.leg("R", mine(-22, 38.5, -52, v1), KNEE_R, TOE);
  you.lean(-24, 0, 0);
  you.head.position.set(0, 76.5, 1);
  poseHands(0);
  {
    const chest = V(0, 0, 1).transformDirection(you.torso.matrix);
    chest.set(-chest.x, chest.y, -chest.z);
    const strapPts = [BELT.ring.clone(), ...BELT.strap.map((p) => onTrunk(p, V())), BELT.buckle.clone()];
    const strapNor = [V(0.3, 1, -0.2).normalize(), V(0, 1, 0).lerp(chest, 0.35).normalize(), chest, chest, chest, chest];
    strap.lay(strapPts, strapNor);
    const lapPts = [BELT.buckle.clone(), ...BELT.lap.map((p) => onTrunk(p, V())), BELT.anchor.clone()];
    lap.lay(lapPts, lapPts.map(() => chest.clone().lerp(UP, 0.45).normalize()));
  }

  /* ═════════════ 5 · THE ARROWS AND THE TURN GIVEN BACK (on the road, around the car) ═════════════ */

  const arrowMat = (c, opacity) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const want = new THREE.Mesh(arrowGeo(ARROW_LEN, ARROW.w, ARROW_FROM), arrowMat(INK.clone(), 0.8));
  want.position.y = 4;
  want.renderOrder = 3;
  const goesMat = arrowMat(VEILLE.clone(), 0.9);
  const goes = new THREE.Mesh(arrowGeo(ARROW_LEN, ARROW.w, ARROW_FROM), goesMat);
  goes.position.y = 5.5;
  goes.renderOrder = 4;
  group.add(want, goes); // in the car's frame: `goes` IS its heading; `want` is turned by aim − yaw
  const moment = makeMoment();
  car.add(moment.group);

  const HEAD = INK.clone().multiplyScalar(1.5);
  const ENGINE_GLOW = INK.clone().multiplyScalar(0.9);
  const MIXED = new THREE.Color();
  const last = { steer: NaN };
  const lampBoar = V();
  const lampMoose = V();

  /** Where the headlamps are, seen from an animal standing in the slide group at (x, z) turned by `turn`. */
  const lampFor = (x, z, turn, co, si, slid, out) => {
    // the lamps' middle, in the road's frame: R(yaw)·(0, NOSE) − slid
    const lx = NOSE * si - slid - x;
    const lz = NOSE * co - z;
    const c = Math.cos(-turn);
    const s = Math.sin(-turn);
    return out.set(lx * c + lz * s, 66, -lx * s + lz * c);
  };
  /** How much of the beams reaches a point of the road's frame. */
  const beamOf = (x, z, co, si, slid) => {
    const qx = x + slid;
    return beamAt(qx * co - z * si, qx * si + z * co);
  };

  return {
    group, A, fx,
    update({ shell = 1, gap = 18, lane = 0, yaw = 0, aim = 0, steer = 0, kmh = 80, rolled = 0, rain: wet = 1, boar: b = 0, moose: m = 0, mooseAt = 0,
      you: showYou = 1, slide: sl = 0, arrows = 0, alarm = 0, moment: mo = 0, gas = 1, tip = 0, rocket: rk = 0, bFR = 0 } = {}, time = 0, px = 1600) {
      const sh = clamp01(shell);
      const rn = clamp01(wet);
      const slip = clamp01(sl);
      const speed = (Math.max(0, kmh) / 3.6) * 100; // cm/s
      const sp = Math.min(1.4, Math.max(0, kmh) / 80);
      const th = yaw * DEG;
      const co = Math.cos(th);
      const si = Math.sin(th);
      const slid = lane * 100;
      const scroll = gap * 100;

      // the world comes to the car
      pivot.rotation.y = -th;
      slide.position.x = slid;
      let u = road.uniforms;
      road.mesh.visible = sh > 0.003;
      u.uAmount.value = sh;
      u.uRain.value = rn;
      u.uScroll.value = scroll;
      u.uSmear.value = speed * SHUTTER;
      u.uCar.value.set(slid, co, si, 0);
      u.uSlide.value = slip;
      u.uTrail.value = 700 + 22 * Math.min(60, Math.abs(yaw));
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
      u = wood.uniforms;
      wood.mesh.visible = sh > 0.003;
      u.uAmount.value = sh;
      u.uScroll.value = scroll;
      u.uCar.value.set(slid, co, si, 0);
      lamp.intensity = 1800 * sh;
      dress.update({ shell: sh, scroll, slid, co, si }, time, px);

      // the animals: at `gap` metres from your bumper, lit by the beams; their eyes in the water
      const zA = NOSE - scroll;
      const bx = BOAR.x;
      boar.root.position.set(bx, 0, zA);
      const litB = beamOf(bx, zA, co, si, slid);
      boar.set(b * sh, Math.min(1, 1.6 * litB), lampFor(bx, zA, BOAR_TURN, co, si, slid, lampBoar), px);
      const mx = mix(MOOSE.x, MOOSE.verge, clamp01(mooseAt));
      moose.root.position.set(mx, groundY(mx), zA);
      const litM = Math.max(0.25 * smooth(0.5, 1, mooseAt), beamOf(mx, zA, co, si, slid));
      moose.set(m * sh, Math.min(1, 1.6 * litM), lampFor(mx, zA, MOOSE_TURN, co, si, slid, lampMoose), px);
      const eyes = road.uniforms.uEye.value;
      for (let i = 0; i < 2; i++) {
        const e = boar.eyesRoot[i];
        const cb = Math.cos(BOAR_TURN);
        const sb = Math.sin(BOAR_TURN);
        eyes[i].set(bx + e.x * cb + e.z * sb, e.y, zA - e.x * sb + e.z * cb, b * sh * litB * 0.9);
        const f = moose.eyesRoot[i];
        const cm = Math.cos(MOOSE_TURN);
        const sm = Math.sin(MOOSE_TURN);
        eyes[2 + i].set(mx + f.x * cm + f.z * sm, f.y, zA - f.x * sm + f.z * cm, m * sh * litM * 0.6);
      }

      // the spray
      for (let i = 0; i < 2; i++) {
        u = spray.uniforms[i];
        u.uTime.value = time;
        u.uSpeed.value = sp;
        u.uSkid.value = 0;
        u.uAmount.value = rn * sh * (1 - smooth(0.05, 0.3, tip));
        u.uScale.value = px;
      }
      spray.mist.visible = spray.drops.visible = rn * sh * sp * (1 - tip) > 0.003;

      // the body
      car.visible = sh > 0.003;
      roll.rotation.z = -TIP * smooth(0, 1, clamp01(tip));
      fx.skin.uniforms.uAmount.value = sh;
      fx.inner.uniforms.uAmount.value = sh;
      fx.tyre.uniforms.uAmount.value = sh;
      fx.trim.uniforms.uAmount.value = sh;
      fx.engine.uniforms.uAmount.value = sh;
      fx.strong.uniforms.uAmount.value = 0.8 * sh;
      fx.fine.uniforms.uAmount.value = 0.48 * sh;
      fx.lamp.uniforms.uAmount.value = 0.9 * sh;
      for (let i = 0; i < fx.kitLines.length; i++) fx.kitLines[i].opacity = fx.kitLines[i].userData.base * sh;
      setPartOpacity(fit, sh);
      setPartOpacity(trim, sh);
      lamps.uniforms.uScale.value = px;
      for (let i = 0; i < 2; i++) lamps.put(i, (i ? 1 : -1) * 70, 62, NOSE + 9, HEAD, 0.55 * sh, 70);
      lamps.flush();

      // the engine and the drive
      const g = clamp01(gas);
      fx.flow.uniforms.uTime.value = time;
      fx.flow.uniforms.uGas.value = g;
      fx.flow.uniforms.uAmount.value = sh;
      fx.heart.uniforms.uScale.value = px;
      fx.heart.put(0, EX, EY, EZ, ENGINE_GLOW, sh * g * (0.55 + 0.15 * Math.sin(time * 2.4)), 60);
      fx.heart.flush();

      // the wheels: their marks turn with `rolled`, spread by the speed; the front ones steer
      u = fx.mark.uniforms;
      u.uAmount.value = sh;
      u.uAngle.value = ((100 * rolled) / CAR.wheel) % TAU;
      u.uSmear.value = speed / CAR.wheel / 30;
      fx.wheels.wheelFL.rotation.y = LOCK * steer;
      fx.wheels.wheelFR.rotation.y = LOCK * steer;
      setGlow(fx.bite, 1.3 * clamp01(bFR) * sh);

      // you
      you.group.visible = showYou > 0.5;
      you.body.uniforms.uAmount.value = sh;
      steering.rotation.z = SPIN * steer;
      if (steer !== last.steer) {
        poseHands(SPIN * steer);
        last.steer = steer;
      }

      // the arrows: where you steer (ink, in the road's frame) and where the car points (veille → signal)
      const ar = clamp01(arrows);
      want.visible = goes.visible = ar > 0.003;
      want.rotation.y = (aim - yaw) * DEG;
      want.material.opacity = 0.8 * ar;
      goesMat.opacity = 0.9 * ar;
      goesMat.color.copy(MIXED.copy(VEILLE).lerp(SIGNAL, clamp01(alarm)));
      moment.set(mo);

      // the next file, far in the sky
      rocket.set(clamp01(rk), px);
      A.rocket.position.copy(rocket.head);
    },
  };
}
