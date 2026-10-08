// DOSSIER 011 — Fusible pyro : the road, the wall, the car seen like an X-ray, you at the wheel, the airbags,
// and the one who comes to your door.
//
//   buildCar() → { group, A, update(p, time, px) }      p = { shell, wall, you, crush, debris, bags, rescuer, reach, live }
//
// THE FRAME IS THE CAR'S. The cabin stays where plan.js puts it whatever `crush` is — so the battery, its
// junction box, the fuse, the control unit (pack.js, model.js) and every camera pose stay true without any
// of them knowing about the crash. It is the wall and the road that come to the car: at `crush` 1 the wall's
// face stands at z = WALL.z + CRUSH.depth, and the ground has tipped a little around the front axle — the
// tail lifts, the rear wheels stay on the road. Everything ahead of the front axle folds, in the shaders
// (glass and lines share `crushed`): the nose first, then the whole bonnet, in pleats that belong to the sheet.
//
// The body is ONE skin lofted through sections (a shoulder, a tumblehome, a glass roof, wheel arches), drawn
// with a glass that knows its panes from its panels; every line of the body is taken on that same skin.
// `live` is a wave: a signal light that leaves the point where the cable is pinched and wins the shell,
// line after line, behind a hot front — at 1 your door and its handle burn brightest.
//
// Not drawn here: the battery, its box, the cables, the drive units, the control unit (pack.js), the fuse (model.js).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeGeometries as mergeBare } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, glass, asShell, lineMat, fatLine, box, cyl, lathe, placed, anchor, makePart, addMesh, setPartOpacity, SOFTBOX } from "@kit/build3d.js";
import { CAR, WALL, CRUSH, YOU, RESCUER, DOOR_HANDLE, WHEEL, CABLE } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const FIERY = new THREE.Color(1, 0.42, 0.16); // the hottest the live body gets: still signal, never cream
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const AHEAD = V(0, 0, 1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const NOSE = CAR.nose;
const TAIL = CAR.tail;
const FOLD = { z: CAR.front, len: CAR.front - CAR.nose, amp: 28 }; // what folds: from the front axle to the bumper (`amp`: how high the bonnet can stand, cm)
const PLEATS = [0.3, 0.62, 0.86]; // its creases, along the sheet: a crest, a hollow, a crest
const WARP = 0.12; // how far a crease wanders across the car
const ARCH = 39.5; // the radius of a wheel arch
const LIFT = 1.7 * DEG; // how far the ground tips under the car at the height of the crash
const DOOR = { z0: -70, z1: 47.5 }; // your door: its two cuts
const PINCH = CABLE.pinch;
const TO_HANDLE = Math.hypot(DOOR_HANDLE[0] - PINCH[0], DOOR_HANDLE[1] - PINCH[1], DOOR_HANDLE[2] - PINCH[2]);
const LIVE_AT_HANDLE = 0.8; // the value of `live` at which the wave gets to the handle

/* ───────────────────────────────────────────────────────────── the crash, as the shaders see it */

// Everything ahead of the front axle is pushed back toward it: the nose first (a high power of u), then
// evenly. The sheet that has nowhere to go buckles — pleats fixed in the metal, as high as the squeeze is
// strong where they stand. `fold`: how high it buckles here (cm): the glass facets there, a crease shows.
const CRUSH_GLSL = /* glsl */ `
  const float FOLD_Z = ${FOLD.z.toFixed(1)}; const float FOLD_LEN = ${FOLD.len.toFixed(1)}; const float FOLD_DEPTH = ${CRUSH.depth.toFixed(1)}; const float FOLD_AMP = ${FOLD.amp.toFixed(1)};
  // the bonnet's pleats, along the sheet (0 at the axle → 1 at the bumper): a tent that stands up, a hollow,
  // a smaller tent behind the bumper — straight between their creases (${PLEATS.join(", ")})
  float pleat(float u) {
    if (u < ${PLEATS[0].toFixed(2)}) return u / ${PLEATS[0].toFixed(2)};
    if (u < ${PLEATS[1].toFixed(2)}) return mix(1.0, -0.1, (u - ${PLEATS[0].toFixed(2)}) / ${(PLEATS[1] - PLEATS[0]).toFixed(2)});
    if (u < ${PLEATS[2].toFixed(2)}) return mix(-0.1, 0.6, (u - ${PLEATS[1].toFixed(2)}) / ${(PLEATS[2] - PLEATS[1]).toFixed(2)});
    return mix(0.6, 0.0, (u - ${PLEATS[2].toFixed(2)}) / ${(1 - PLEATS[2]).toFixed(2)});
  }
  vec3 crushed(vec3 p, float c, out float fold) {
    fold = 0.0;
    float s = FOLD_Z - p.z;
    if (c <= 0.0005 || s <= 0.0) return p;
    float u = clamp(s / FOLD_LEN, 0.0001, 1.0);
    float e = 3.2 - 1.95 * c;
    float strain = clamp(FOLD_DEPTH * c * e * pow(u, e - 1.0) / FOLD_LEN, 0.0, 1.0);
    float amp = FOLD_AMP * sqrt(strain) * (0.78 + 0.22 * cos(p.x * 0.017));
    float h = pleat(clamp(u + ${WARP.toFixed(2)} * u * (1.0 - u) * sin(p.x * 0.035), 0.0, 1.0)); // a crease is not ruled straight across
    float up = smoothstep(46.0, 62.0, p.y);                                   // the bonnet buckles; the bumper only shortens
    float side = smoothstep(62.0, 86.0, abs(p.x)) * smoothstep(34.0, 52.0, p.y); // the wings bulge
    fold = amp * max(up, side) * smoothstep(0.0, 0.1, u);
    vec3 r = p;
    r.z += FOLD_DEPTH * c * pow(u, e);
    r.y += amp * h * up * (1.0 - 0.45 * side);
    r.x += sign(p.x) * amp * 0.3 * abs(h) * side;
    return r;
  }
  // when the wave of the live body gets here: 0 at the pinch, LIVE_AT_HANDLE at your handle, under 1 at the tail
  float arrival(vec3 p, vec3 pinch, float toHandle) {
    float d = distance(p, pinch);
    return d < toHandle ? ${LIVE_AT_HANDLE.toFixed(2)} * d / toHandle : ${LIVE_AT_HANDLE.toFixed(2)} + 0.17 * (1.0 - exp(-(d - toHandle) / 110.0));
  }`;

/* ───────────────────────────────────────────────────────────── the body: sections along the car */

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

// one half section, from the lower edge to the centre line: the flank · the side glass · the rail (A-pillar, cant rail, C-pillar) · the roof
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

/** Where the sections are cut: fine where the nose folds and at both ends, on the circle of each arch, every 6 cm elsewhere. */
function stations() {
  const zs = [];
  for (const d of [0, 0.35, 0.9, 1.7, 2.8, 4.2, 6]) zs.push(NOSE + d, TAIL - d);
  for (let z = NOSE + 8.5; z < FOLD.z; z += 2.5) zs.push(z);
  for (let z = FOLD.z; z < TAIL - 6; z += 6) zs.push(z);
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
 *   · folds with the crash, and facets where it has buckled
 *   · knows its panes (side windows, screen, glass roof, rear screen — cut in the skin's own coordinates,
 *     `aUV` = z and the row of the section) from its panels: a panel carries a little light of its own and a
 *     strong lip, a pane is clear, with the slanted streaks of a window and the studio's softbox in it
 *   · turns signal behind the wave of `uLive`.
 */
function bodyGlass({ rim = 0.3, power = 2.4, edge = 0.3, spec = 0.45, through = 0.22 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: INK.clone() }, uLiveColor: { value: SIGNAL.clone() }, uBase: { value: 1 }, uRim: { value: rim }, uPower: { value: power }, uAmount: { value: 1 },
      uEdge: { value: edge }, uSpec: { value: spec }, uGain: { value: 1 }, uCrush: { value: 0 }, uLive: { value: 0 },
      uPinch: { value: V(...PINCH) }, uHandle: { value: TO_HANDLE },
      uBoxC: { value: BOX.c }, uBoxU: { value: BOX.u }, uBoxV: { value: BOX.v }, uBoxSize: { value: BOX.size },
    },
    vertexShader: /* glsl */ `
      uniform float uCrush, uHandle; uniform vec3 uPinch;
      attribute vec2 aUV;
      varying vec3 vN; varying vec3 vV; varying vec3 vView; varying vec3 vP; varying vec2 vUV; varying float vFold; varying float vArr;
      ${CRUSH_GLSL}
      void main() {
        float fold;
        vec3 p = crushed(position, uCrush, fold);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vView = mv.xyz;
        vP = position;
        vUV = aUV;
        vFold = fold;
        vArr = arrival(position, uPinch, uHandle);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uLiveColor, uBoxC, uBoxU, uBoxV, uBoxSize; uniform float uBase, uRim, uPower, uAmount, uEdge, uSpec, uGain, uLive;
      varying vec3 vN; varying vec3 vV; varying vec3 vView; varying vec3 vP; varying vec2 vUV; varying float vFold; varying float vArr;
      float inside(float a, float b, float x, float w) { return smoothstep(a - w, a + w, x) * (1.0 - smoothstep(b - w, b + w, x)); }
      void main() {
        if (uAmount < 0.003) discard; // faded out, a shell must not hide the ones behind it
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        if (vFold > 0.2) {
          // buckled sheet is faceted: its true face, from the picture itself
          vec3 nf = normalize(cross(dFdx(vView), dFdy(vView)) + vec3(0.0, 0.0, 1e-6));
          if (dot(nf, n) < 0.0) nf = -nf;
          n = normalize(mix(n, nf, smoothstep(0.2, 1.4, vFold)));
        }
        float facing = dot(n, v);
        float g = clamp(1.0 - abs(facing), 0.0, 1.0); // clamp before pow
        float r = vUV.y; float z = vUV.x;
        float sidePane = inside(${(R_SH + 0.7).toFixed(1)}, ${(R_P1 - 0.2).toFixed(1)}, r, 0.25) * inside(-84.0, 168.0, z, 1.2) * (1.0 - inside(43.0, 52.0, z, 0.8));
        float topPane = smoothstep(${(R_P2 + 0.2).toFixed(1)}, ${(R_P2 + 0.9).toFixed(1)}, r) * inside(-97.0, 189.0, z, 1.2) * (1.0 - inside(-17.0, -10.0, z, 0.8)) * (1.0 - inside(106.0, 113.0, z, 0.8));
        float pane = max(sidePane, topPane);
        float fres = pow(g, uPower);
        float lip = smoothstep(0.6, 0.97, g) * (1.0 - 0.6 * smoothstep(0.2, 1.4, vFold)); // (every facet of a buckled sheet has a lip: together they would burn white)
        float panel = (0.022 * uBase + uRim * fres + uEdge * lip) * mix(0.5, 1.0, smoothstep(15.0, 70.0, vP.y)); // a flank fades toward the road
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
        // a buckled sheet is read by its faces: those that look at the key light catch it, the others stay dark
        vec3 toKey = normalize((viewMatrix * vec4(-0.42, 0.73, 0.54, 0.0)).xyz);
        panel += 0.2 * smoothstep(0.2, 1.4, vFold) * pow(clamp(dot(facing < 0.0 ? -n : n, toKey), 0.0, 1.0), 1.5);
        float light = mix(panel, glz, pane);
        float lit = smoothstep(0.0, 0.02, uLive - vArr) * step(0.0005, uLive);
        vec3 col = mix(uColor, uLiveColor, 0.9 * lit);
        gl_FragColor = vec4(col * light * (1.0 + 0.7 * lit) * uAmount * uGain, 1.0);
      }`,
  });
  mat.userData.through = through;
  return mat;
}

/**
 * The lines of the body, in screen pixels (the instanced quads of LineSegments2): they fold with the crash,
 * step back with depth (full strength on the near side of the car, `far` on its far side), and turn signal
 * behind the wave of `uLive`, white-hot at its front. `instanceF`: x — 1 on your door (at `uDoor` 1 it is
 * wider and brighter than the rest); y — 1 on a crease, seen only where the sheet has buckled.
 */
function bodyLines({ width = 2, hdr = 1, far = 0.3, reach = 330, centre = [0, 80, 0] } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: INK.clone().multiplyScalar(hdr) }, uLiveColor: { value: SIGNAL.clone().multiplyScalar(2.1) }, uHot: { value: FIERY.clone().multiplyScalar(3) },
      uWidth: { value: width }, uRes: { value: RES }, uAmount: { value: 1 }, uFar: { value: far }, uCentre: { value: V(...centre) }, uReach: { value: reach },
      uCrush: { value: 0 }, uLive: { value: 0 }, uDoor: { value: 0 }, uPinch: { value: V(...PINCH) }, uHandle: { value: TO_HANDLE },
    },
    vertexShader: /* glsl */ `
      uniform float uWidth, uReach, uCrush, uHandle, uDoor; uniform vec2 uRes; uniform vec3 uCentre, uPinch;
      attribute vec3 instanceStart; attribute vec3 instanceEnd; attribute vec2 instanceF;
      varying vec2 vUv; varying float vDepth; varying float vArr; varying float vShow; varying float vDoor;
      ${CRUSH_GLSL}
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
        float f0; float f1;
        vec4 start = modelViewMatrix * vec4(crushed(instanceStart, uCrush, f0), 1.0);
        vec4 end = modelViewMatrix * vec4(crushed(instanceEnd, uCrush, f1), 1.0);
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
        clip.xy += offset * (uWidth * (1.0 + 0.9 * uDoor * instanceF.x) / uRes.y) * clip.w;
        gl_Position = clip;
        float z = position.y < 0.5 ? start.z : end.z;
        vDepth = ((viewMatrix * modelMatrix * vec4(uCentre, 1.0)).z - z) / uReach;
        vArr = arrival(position.y < 0.5 ? instanceStart : instanceEnd, uPinch, uHandle);
        vShow = mix(1.0, smoothstep(0.5, 2.6, position.y < 0.5 ? f0 : f1), instanceF.y);
        vDoor = instanceF.x;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uLiveColor, uHot; uniform float uAmount, uFar, uLive, uDoor;
      varying vec2 vUv; varying float vDepth; varying float vArr; varying float vShow; varying float vDoor;
      void main() {
        if (uAmount * vShow < 0.003) discard;
        if (abs(vUv.y) > 1.0) { // round ends
          float b = abs(vUv.y) - 1.0;
          if (vUv.x * vUv.x + b * b > 1.0) discard;
        }
        float k = clamp(0.5 + 0.5 * vDepth, 0.0, 1.0);
        float fade = mix(1.0, uFar, k * k * (3.0 - 2.0 * k));
        float behind = uLive - vArr;
        float lit = smoothstep(0.0, 0.012, behind) * step(0.0005, uLive);
        float lead = lit * exp(-max(behind, 0.0) * 26.0) * (1.0 - smoothstep(0.9, 1.0, uLive)); // the front of the wave, white-hot
        vec3 c = mix(uColor, uLiveColor * (1.0 + 0.9 * uDoor * vDoor), lit) + uHot * lead;
        gl_FragColor = vec4(c, uAmount * vShow * mix(fade, max(fade, 0.75), lit));
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
      depthTest: false,
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

/**
 * What the crash throws: shards — flakes of glass and paint that leave the line where the bumper meets the
 * wall, fast at first and then afloat, turning on themselves and catching the key light as they turn (the
 * film is in slow motion: with `k` held they still drift and turn, slowly). All of it in the shader.
 */
function makeShards(count, seed) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-0.5, -0.36, 0, 0.62, -0.2, 0, -0.08, 0.56, 0], 3));
  const origin = new Float32Array(count * 3);
  const dir = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // reach (cm), spin, phase, size (cm)
  const d = V();
  for (let i = 0; i < count; i++) {
    const x = (rand() * 2 - 1) * 90;
    const y = 22 + rand() * 62;
    origin.set([x, y, WALL.z + 1.5 + rand() * 7], i * 3);
    d.set((x / 90) * 0.9 + (rand() - 0.5) * 0.7, 0.2 + ((y - 46) / 40) * 0.45 + rand() * 0.75, 0.3 + rand() * 0.95).normalize();
    dir.set([d.x, d.y, d.z], i * 3);
    seeds.set([36 + Math.pow(rand(), 1.6) * 240, 2 + rand() * 7, rand() * 6.283, 1.7 + Math.pow(rand(), 2) * 6.2], i * 4);
  }
  geo.setAttribute("aOrigin", new THREE.InstancedBufferAttribute(origin, 3));
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(dir, 3));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  geo.instanceCount = count;
  const uniforms = { uK: { value: 0 }, uTime: { value: 0 }, uAmount: { value: 0 }, uColor: { value: INK.clone() } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uK, uTime; attribute vec3 aOrigin; attribute vec3 aDir; attribute vec4 aSeed; varying float vGlint;
        vec3 turn(vec3 v, vec3 axis, float a) { return v * cos(a) + cross(axis, v) * sin(a) + axis * dot(axis, v) * (1.0 - cos(a)); }
        void main() {
          float k = clamp(uK, 0.0, 1.0);
          float fly = 1.0 - (1.0 - k) * (1.0 - k); // fast at first, then afloat
          float a = aSeed.z + aSeed.y * (fly * 2.4 + uTime * 0.11);
          vec3 axis = normalize(vec3(sin(aSeed.z * 3.1), cos(aSeed.z * 1.7), sin(aSeed.z * 5.3 + 1.0)) + vec3(0.02, 0.01, 0.03));
          vec3 n = turn(vec3(0.0, 0.0, 1.0), axis, a);
          vec3 p = aOrigin + aDir * (aSeed.x * fly + 1.5 * sin(uTime * 0.23 + aSeed.z)) + turn(position * aSeed.w, axis, a);
          p.y -= 30.0 * k * k * fract(aSeed.z * 7.7);
          p.y = max(p.y, 0.7); // they come to rest on the road
          vGlint = abs(dot(n, normalize(vec3(-0.5, 0.62, 0.6))));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying float vGlint;
        void main() {
          if (uAmount < 0.003) discard;
          gl_FragColor = vec4(uColor * (0.1 + 1.6 * pow(clamp(vGlint, 0.0, 1.0), 4.0)) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/**
 * …and dust: long thin streaks that leave the same line, each drawn along its own way (not a rain: they
 * fan out from the crash), long while it is fast, shorter as it slows.
 */
function makeStreaks(count, seed) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)); // x: along the streak · y: across
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const origin = new Float32Array(count * 3);
  const dir = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // reach (cm), half-length (cm), phase, width (cm)
  const d = V();
  for (let i = 0; i < count; i++) {
    const x = (rand() * 2 - 1) * 88;
    const y = 20 + rand() * 60;
    origin.set([x, y, WALL.z + 2 + rand() * 8], i * 3);
    d.set((x / 88) * 1.1 + (rand() - 0.5) * 0.9, 0.1 + ((y - 46) / 40) * 0.4 + rand() * 0.8, 0.25 + rand()).normalize();
    dir.set([d.x, d.y, d.z], i * 3);
    seeds.set([50 + Math.pow(rand(), 1.4) * 250, 5 + rand() * 13, rand() * 6.283, 0.9 + rand() * 1.8], i * 4);
  }
  geo.setAttribute("aOrigin", new THREE.InstancedBufferAttribute(origin, 3));
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(dir, 3));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  geo.instanceCount = count;
  const uniforms = { uK: { value: 0 }, uTime: { value: 0 }, uAmount: { value: 0 }, uScale: { value: 1600 }, uRes: { value: RES }, uColor: { value: INK.clone().multiplyScalar(0.55) } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uK, uTime, uScale; uniform vec2 uRes; attribute vec3 aOrigin; attribute vec3 aDir; attribute vec4 aSeed; varying vec2 vQ; varying float vA;
        void main() {
          float k = clamp(uK, 0.0, 1.0);
          float fly = 1.0 - (1.0 - k) * (1.0 - k);
          vec3 c = aOrigin + aDir * aSeed.x * fly * (1.0 + 0.05 * sin(uTime * 0.25 + aSeed.z));
          c.y = max(c.y - 16.0 * k * k * fract(aSeed.z * 5.1), 1.0);
          float h = aSeed.y * mix(0.3, 1.0, fly) * (1.0 - 0.45 * k);
          vec4 a = projectionMatrix * modelViewMatrix * vec4(c - aDir * h, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(c + aDir * h, 1.0);
          vQ = position.xy;
          vA = 0.45 + 0.55 * fract(aSeed.z * 9.1);
          if (a.w < 1.0 || b.w < 1.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          vec2 run = (b.xy / b.w - a.xy / a.w) * uRes;
          float len = length(run);
          run = len > 1e-4 ? run / len : vec2(1.0, 0.0); // seen end-on it has no direction: never divide by its length
          vec4 p = position.x < 0.0 ? a : b;
          float wide = max(2.0, aSeed.w * uScale / p.w);
          p.xy += vec2(-run.y, run.x) * position.y * (wide / uRes) * p.w;
          gl_Position = p;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying vec2 vQ; varying float vA;
        void main() {
          if (uAmount < 0.003) discard;
          float a = (1.0 - vQ.y * vQ.y) * pow(clamp(1.0 - abs(vQ.x), 0.0, 1.0), 1.3);
          gl_FragColor = vec4(uColor * a * vA * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/**
 * An airbag: a closed cushion around its axis (+z: the way it bursts), in three states of the same mesh —
 * folded in its housing, half out (a crumpled thing, deep pleats running from the middle), full (taut: the
 * pleats are gone, a welt runs round its seam, a tether dimples its face). `fill(k)` goes through them.
 */
function makeBag({ R, depth, lobes, wide = 1, tall = 1, square = 2, material }) {
  // seen along its axis, a bag is not always a disc: `square` above 2 gives it the rounded corners of a pillow (as it fills)
  const SQUARED = { folded: 0, half: 0.5, full: 1 };
  const corner = (th) => Math.pow(Math.pow(Math.abs(Math.cos(th)), square) + Math.pow(Math.abs(Math.sin(th)), square), -1 / square) - 1;
  const NU = 72;
  const NV = 36;
  const count = NU * (NV - 1) + 2;
  const ring = (j, i) => 1 + (j - 1) * NU + (i % NU);
  const index = [];
  for (let i = 0; i < NU; i++) index.push(0, ring(1, i + 1), ring(1, i), count - 1, ring(NV - 1, i), ring(NV - 1, i + 1));
  for (let j = 1; j < NV - 1; j++) for (let i = 0; i < NU; i++) index.push(ring(j, i), ring(j, i + 1), ring(j + 1, i), ring(j, i + 1), ring(j + 1, i + 1), ring(j + 1, i));
  const STATES = {
    folded: (sn, cs, th) => [0.2 * R * Math.pow(sn, 0.5) * (1 + 0.28 * Math.sin(2 * lobes * th) * sn), 0.1 * depth * (0.5 - 0.5 * cs)],
    half: (sn, cs, th) => [
      0.6 * R * Math.pow(sn, 0.8) * (1 + 0.24 * Math.sin(lobes * th + 2.2 * cs) * sn + 0.09 * Math.sin((2 * lobes + 1) * th + 1.3) * sn + 0.13 * Math.sin(2 * th + 0.9) * sn),
      0.62 * depth * (0.5 - 0.5 * cs) * (1 + 0.18 * Math.sin(3 * th + 0.7) * sn) + 0.04 * depth * Math.sin(lobes * th) * sn,
    ],
    full: (sn, cs, th) => [
      // a welt round its seam, and the last of the pleats: short gathers that run from the seam
      R * Math.pow(sn, 0.55) * (1 + 0.045 * Math.exp(-((cs / 0.06) ** 2)) + (0.012 * Math.sin(lobes * th) + 0.007 * Math.sin(3 * lobes * th + 1)) * sn * Math.exp(-((cs / 0.45) ** 2))),
      // its face is held back by a tether: a long dimple across it
      depth * (0.5 - 0.5 * Math.sign(cs) * Math.pow(Math.abs(cs), 0.7)) - (cs < 0 ? 0.15 * depth * Math.exp(-(((sn * Math.cos(th)) / 0.62) ** 2) - ((sn * Math.sin(th)) / 0.3) ** 2) : 0),
    ],
  };
  const shape = (state) => {
    const p = new Float32Array(count * 3);
    for (let j = 0; j <= NV; j++) {
      const phi = (Math.PI * j) / NV;
      const sn = Math.max(0, Math.sin(phi));
      const cs = Math.cos(phi);
      for (let i = 0; i < (j === 0 || j === NV ? 1 : NU); i++) {
        const th = (2 * Math.PI * i) / NU;
        const [r0, zz] = STATES[state](sn, cs, th);
        const rr = r0 * (1 + SQUARED[state] * corner(th));
        const k = j === 0 ? 0 : j === NV ? count - 1 : ring(j, i);
        p.set([wide * rr * Math.cos(th), tall * rr * Math.sin(th), zz], k * 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setIndex(index);
    g.computeVertexNormals();
    return g;
  };
  const geo = shape("folded");
  const half_ = shape("half");
  const full = shape("full");
  geo.morphAttributes.position = [half_.attributes.position, full.attributes.position];
  geo.morphAttributes.normal = [half_.attributes.normal, full.attributes.normal];
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;
  mesh.castShadow = true; // one bag on the other, each fold on the next: cloth is read by its shadows
  mesh.visible = false;
  return {
    mesh,
    fill(k) {
      mesh.visible = k > 0.004;
      mesh.scale.setScalar(0.35 + 0.65 * smooth(0, 0.12, k)); // it comes out of its housing
      mesh.morphTargetInfluences[0] = k < 0.5 ? k / 0.5 : 1 - (k - 0.5) / 0.5;
      mesh.morphTargetInfluences[1] = k < 0.5 ? 0 : (k - 0.5) / 0.5;
    },
  };
}

/** A ribbon `width` wide through moving points (a belt): `lay(points, normals)` — Vector3s, the ribbon lies flat against each normal. */
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

/* ───────────────────────────────────────────────────────────── the set */

export function buildCar() {
  const group = new THREE.Group();
  const A = {};
  const fx = {};

  /* ═════════════ 1 · THE ROAD AND THE WALL — they come to the car ═════════════ */

  const tilt = new THREE.Group(); // the ground tips around the front axle
  tilt.position.set(0, 0, CAR.front);
  const slide = new THREE.Group(); // …and comes back with the wall: plan coordinates inside
  slide.position.set(0, 0, -CAR.front);
  tilt.add(slide);
  group.add(tilt);

  // no floor under an X-ray: a grid, the two edges of the lane (they stop at the wall), a little light under the car
  fx.ground = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vP = vec2(position.x, -position.y); // x and z on the road
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vP;
      // one family of lines, never under a pixel and a half: thinner, they shimmer
      float lines(float x, float cell) {
        float q = x / cell;
        float w = max(fwidth(q) * 1.5, 1e-5);
        return 1.0 - smoothstep(0.0, w, abs(fract(q - 0.5) - 0.5));
      }
      void main() {
        if (uAmount < 0.003) discard;
        float g = max(lines(vP.x, 50.0), lines(vP.y, 50.0)) * 0.38 + max(lines(vP.x, 250.0), lines(vP.y, 250.0));
        float fade = exp(-length(vP - vec2(0.0, -60.0)) / 620.0);
        float w = max(fwidth(vP.x) * 1.5, 0.01);
        float edge = (1.0 - smoothstep(2.2, 2.2 + w, abs(abs(vP.x) - 185.0))) * step(${WALL.z.toFixed(1)}, vP.y) * exp(-max(0.0, vP.y + 235.0) / 1100.0);
        float pool = pow(clamp(1.0 - length(vec2(vP.x / 190.0, (vP.y - 10.0) / 360.0)), 0.0, 1.0), 2.0);
        gl_FragColor = vec4(uColor * (g * fade * 0.19 + edge * 0.2 + pool * 0.03) * uAmount, 1.0);
      }`,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(5200, 5200), fx.ground);
  ground.rotation.x = -Math.PI / 2;
  slide.add(ground);

  // the wall: the one solid thing on this road — matt, dark, its edges broken so that they catch the light
  const wallPart = makePart("wall");
  fx.concrete = solid(0x545a61, { rough: 0.96, env: 0.25 }); // (darker, the grade crushes its lit face into the background: a wall has to be seen)
  addMesh(wallPart, box(WALL.w, WALL.h, WALL.thick, 2.2), fx.concrete, { pos: [0, WALL.h / 2, WALL.z - WALL.thick / 2], edgeOpacity: 0.8, edgeWidth: 2.2 });
  // the joints of its formwork
  for (const pts of [[[-130, 3, 0], [-130, WALL.h - 3, 0]], [[0, 3, 0], [0, WALL.h - 3, 0]], [[130, 3, 0], [130, WALL.h - 3, 0]], [[-WALL.w / 2 + 3, 115, 0], [WALL.w / 2 - 3, 115, 0]]]) {
    const joint = fatLine(pts.map(([x, y]) => [x, y, WALL.z + 0.4]), { width: 1.8, opacity: 0.2 });
    wallPart.userData.part.mats.add(joint.material);
    wallPart.add(joint);
  }
  slide.add(wallPart);
  A.wallFace = anchor(slide, 0, 150, WALL.z + 1);

  // what the crash throws
  fx.shards = makeShards(170, 21);
  slide.add(fx.shards.mesh);
  fx.dust = makeStreaks(150, 33);
  slide.add(fx.dust.mesh);

  /* ═════════════ 2 · THE CAR — its skin ═════════════ */

  const car = new THREE.Group();
  group.add(car);

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
    car.add(fx.skinMesh);
  }

  /* ── its lines, taken on the skin ── */
  const L = { strong: { p: [], f: [] }, fine: { p: [], f: [] }, lamp: { p: [], f: [] } };
  const seg = (l, a, b, door = 0, crease = 0) => {
    l.p.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    l.f.push(door, crease);
  };
  const run = (l, pts, door, crease) => {
    for (let i = 0; i < pts.length - 1; i++) seg(l, pts[i], pts[i + 1], door, crease);
  };
  const between = (z0, z1) => [z0, ...ZS.filter((z) => z > z0 + 0.2 && z < z1 - 0.2), z1];
  /** Along the car at row `r` (a number, or a function of z). */
  const along = (l, r, z0, z1, side, door = 0) => run(l, between(z0, z1).map((z) => pt(z, typeof r === "function" ? r(z) : r, side)), door, 0);
  /** Across it at `z`, from row `r0` to row `r1`. */
  const across = (l, z, r0, r1, side, door = 0) => {
    const pts = [];
    for (let r = r0; r < r1 - 1e-6; r += 0.5) pts.push(pt(z, r, side));
    pts.push(pt(z, r1, side));
    run(l, pts, door, 0);
  };
  const SILL = 0.9; // the row where a door ends, just above the lower edge
  for (const s of [-1, 1]) {
    const mine = s < 0 ? 1 : 0; // your door is on the −x side
    along(L.strong, 0, NOSE, TAIL, s); // the lower edge: bumpers, arches, sills
    along(L.strong, R_SH, NOSE + 6, TAIL - 5, s); // the shoulder
    // the top of the side glass: A-pillar, cant rail, C-pillar — and the edge of the glass roof
    along(L.strong, R_P1, -84, DOOR.z0, s);
    along(L.strong, R_P1, DOOR.z0, DOOR.z1, s, mine);
    along(L.strong, R_P1, DOOR.z1, 168, s);
    along(L.fine, R_P2, -97, 189, s);
    across(L.strong, -97, R_P2, R_TOP, s); // the foot of the screen
    across(L.fine, -13.5, R_P2, R_TOP, s); // its header
    across(L.fine, 109.5, R_P2, R_TOP, s);
    across(L.strong, 189, R_P2, R_TOP, s); // the foot of the rear screen
    // doors: yours is drawn stronger (it is the one that lights up)
    const cut = mine ? L.strong : L.fine;
    across(cut, DOOR.z0, SILL, R_P1, s, mine);
    across(cut, DOOR.z1, SILL, R_P1, s, mine);
    along(cut, SILL, DOOR.z0, DOOR.z1, s, mine);
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
    seg(L.lamp, pt(-206, 6.4, s), pt(-204, 7.5, s));
    along(L.lamp, 7.2, 204, 234.3, s);
    // the creases of the crash: on the crest and in the hollow of each pleat
    PLEATS.forEach((u0, i) => {
      const pts = [];
      for (let r = 4; r <= R_TOP; r += 0.5) {
        const x = pt(FOLD.z - FOLD.len * u0, r, s)[0];
        pts.push(pt(FOLD.z - FOLD.len * (u0 - WARP * u0 * (1 - u0) * Math.sin(0.035 * x)), r, s));
      }
      run(i === 1 ? L.strong : L.lamp, pts, 0, 1); // a crest catches the light
    });
  }
  seg(L.lamp, pt(234.3, 7.2, -1), pt(234.3, 7.2, 1)); // the light bar across the tail
  // the charging flap, on your side of the tail
  along(L.fine, 5.2, 196, 211, -1);
  along(L.fine, 6.8, 196, 211, -1);
  across(L.fine, 196, 5.2, 6.8, -1);
  across(L.fine, 211, 5.2, 6.8, -1);
  // the floor: its outline only (glass under the cabin would lie over the battery)
  run(L.fine, [[-83, CAR.floor + 0.5, -104], [-83, CAR.floor + 0.5, 176], [83, CAR.floor + 0.5, 176], [83, CAR.floor + 0.5, -104], [-83, CAR.floor + 0.5, -104]], 0, 0);

  fx.strong = bodyLines({ width: 2.4, far: 0.32 });
  fx.fine = bodyLines({ width: 1.8, far: 0.26 });
  fx.lamp = bodyLines({ width: 2.8, hdr: 1.7, far: 0.6 });
  fx.bodyLines = [fx.strong, fx.fine, fx.lamp];
  for (const [name, material] of [["strong", fx.strong], ["fine", fx.fine], ["lamp", fx.lamp]]) {
    const geo = new LineSegmentsGeometry().setPositions(L[name].p);
    geo.setAttribute("instanceF", new THREE.InstancedBufferAttribute(new Float32Array(L[name].f), 2));
    const mesh = new THREE.Mesh(geo, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    car.add(mesh);
  }

  /* ═════════════ 3 · WHAT SAYS "CAR": wheels, seats, dashboard, steering wheel, belt ═════════════ */

  fx.inner = glass(BRAND.ink, { base: 0.003, rim: 0.13, power: 2.6, edge: 0.2, through: 0.12 }); // seats, dashboard
  fx.tyre = glass(BRAND.ink, { base: 0.012, rim: 0.3, power: 2.2, edge: 0.3, through: 0.15 });
  fx.trim = glass(BRAND.ink, { base: 0.006, rim: 0.3, power: 2.6, edge: 0.45, spec: 0.6, through: 0.2 }); // the door mirrors
  fx.kitLines = []; // the kit's own line materials, faded with the shell
  const kitLines = (positions, width, opacity) => {
    const lines = new LineSegments2(new LineSegmentsGeometry().setPositions(positions), lineMat(BRAND.ink, width, { opacity }));
    lines.renderOrder = 2;
    fx.kitLines.push(lines.material);
    return lines;
  };
  /** The edges of a piece (its own outline when its edges are broken), as a flat list of segments. */
  const edgesInto = (list, geometry, threshold = 28) => {
    const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, threshold).attributes.position;
    for (let i = 0; i < e.count; i++) list.push(e.getX(i), e.getY(i), e.getZ(i));
  };

  /* ── the wheels ── */
  const circle = (list, r, x, n = 48) => {
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * i) / n;
      const b = (2 * Math.PI * (i + 1)) / n;
      list.push(x, r * Math.cos(a), r * Math.sin(a), x, r * Math.cos(b), r * Math.sin(b));
    }
  };
  fx.wheels = [];
  const tyres = [];
  for (const z of [CAR.front, CAR.rear]) {
    for (const s of [-1, 1]) {
      const w = new THREE.Group();
      // the tyre and the dish of the rim, turned on one profile (its axis along x, its face outward)
      const tyre = new THREE.Mesh(lathe([[6, 10.5], [21.5, 11.5], [23, 12.2], [30, 12.4], [33, 10.6], [34, 6], [34, -6], [33, -10.6], [30, -12.4], [23, -12.2], [21.5, -9.5]], 56).rotateZ((-s * Math.PI) / 2), fx.tyre);
      const lines = [];
      for (const [r, x] of [[33.4, 10.6], [33.4, -10.6]]) circle(lines, r, s * x);
      circle(lines, 22.6, s * 12.3);
      circle(lines, 6, s * 10.6, 24);
      for (let k = 0; k < 5; k++) {
        for (const da of [-0.11, 0.11]) {
          const a = (2 * Math.PI * k) / 5 + 0.3;
          lines.push(s * 10.7, 6 * Math.cos(a + da * 2.4), 6 * Math.sin(a + da * 2.4), s * 11.9, 21.8 * Math.cos(a + da), 21.8 * Math.sin(a + da));
        }
      }
      w.add(tyre, kitLines(lines, 1.9, 0.55));
      w.position.set(s * 78.5, CAR.wheel, z);
      w.userData = { side: s, front: z < 0 };
      car.add(w);
      tyres.push(tyre);
      fx.wheels.push(w);
    }
  }

  /* ── seats, dashboard, steering column: glass and fine lines ── */
  const TILT = 22 * DEG; // the steering wheel leans back
  const AXIS = V(0, Math.sin(TILT), Math.cos(TILT)); // its column, toward you
  const HUB = V(WHEEL.x, WHEEL.y, WHEEL.z);
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
  piece(box(134, 12, 50, 5), { pos: [0, 48, 106] }); // the rear bench: the junction box is under it
  piece(box(134, 58, 10, 5), { pos: [0, 83, 142], rotX: 26 * DEG });
  for (const x of [-38, 38]) piece(box(24, 15, 8, 3.5), { pos: [x, 121, 158], rotX: 16 * DEG });
  piece(box(164, 14, 26, 6), { pos: [0, 90, -80], rotX: -8 * DEG }); // the dashboard
  piece(cyl(3.2, 32, 0.6, 20).rotateX(Math.PI / 2), { pos: [HUB.x, HUB.y - AXIS.y * 19, HUB.z - AXIS.z * 19], rotX: -TILT });
  const cabin = new THREE.Mesh(mergeBare(cabinGlass), fx.inner);
  car.add(cabin, kitLines(cabinLines, 1.8, 0.4));

  // the door mirrors
  const mirrors = [-1, 1].map((s) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), fx.trim);
    m.scale.set(4.6, 5.6, 9.5);
    m.position.set(s * 99, 99.5, -76);
    car.add(m);
    return m;
  });

  asShell(cabin, 15);
  asShell(tyres, 16);
  asShell([fx.skinMesh, ...mirrors], 20);

  /* ── the few solid things: the steering wheel, the screen, the belt, the door handles ── */
  const fit = makePart("fittings");
  fx.rim = solid(0x7b8086, { rough: 0.55, metal: 0.1 });
  fx.dark = solid(0x3d4349, { rough: 0.7 });
  {
    const local = [new THREE.TorusGeometry(18.5, 1.6, 14, 72), placed(box(13, 2.6, 1.8, 0.6), { pos: [-11.5, -0.8, 0] }), placed(box(13, 2.6, 1.8, 0.6), { pos: [11.5, -0.8, 0] }), placed(box(3, 13, 1.8, 0.6), { pos: [0, -11, 0] })];
    const o = { pos: [HUB.x, HUB.y, HUB.z], rotX: -TILT };
    addMesh(fit, mergeBare(local.map((g) => bare(placed(g, o)))), fx.rim, { edges: false });
    addMesh(fit, placed(cyl(7.4, 5, 0.9, 40).rotateX(Math.PI / 2), o), fx.dark, { edgeOpacity: 0.5, edgeWidth: 1.8 });
    // the screen in the middle of the dashboard: at a glance, an electric car
    addMesh(fit, placed(box(40, 24, 1.4, 0.5), { pos: [0, 106, -66], rotX: -10 * DEG }), fx.dark, { edgeOpacity: 0.55, edgeWidth: 1.8 });
    fx.screen = glow(BRAND.ink, 0.22);
    addMesh(fit, placed(new THREE.PlaneGeometry(37, 21), { pos: [0, 106 + 0.15, -66 + 0.85], rotX: -10 * DEG }), fx.screen, { edges: false });
  }
  A.wheel = anchor(car, HUB.x, HUB.y, HUB.z);
  // the door handles: yours is the one the film ends up on
  fx.handle = solid(0x9a9fa4, { rough: 0.4, metal: 0.4 });
  fx.handle.emissive = SIGNAL.clone();
  fx.handle.emissiveIntensity = 0;
  fx.handles = solid(0x9a9fa4, { rough: 0.4, metal: 0.4 });
  const handleGeo = box(2.2, 2.6, 15, 0.8);
  addMesh(fit, handleGeo, fx.handle, { pos: [DOOR_HANDLE[0] + 1.1, DOOR_HANDLE[1], DOOR_HANDLE[2]], edgeOpacity: 0.6, edgeWidth: 1.8 });
  for (const [s, z] of [[1, DOOR_HANDLE[2]], [-1, 112], [1, 112]]) addMesh(fit, handleGeo, fx.handles, { pos: [s * (-DOOR_HANDLE[0] - 1.1), DOOR_HANDLE[1] + (z > 100 ? 2 : 0), z], edgeOpacity: 0.6, edgeWidth: 1.8 });
  A.doorHandle = anchor(car, ...DOOR_HANDLE);
  // the belt
  fx.belt = solid(0x9d998f, { rough: 0.85, double: true });
  const strap = makeRibbon(34, 4.8, fx.belt);
  const lap = makeRibbon(20, 4.8, fx.belt);
  fit.userData.part.mats.add(fx.belt);
  fit.add(strap.mesh, lap.mesh);
  car.add(fit);

  /* ═════════════ 4 · YOU, AT THE WHEEL ═════════════ */

  const you = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.8, through: 0.2 });
  you.group.rotation.y = Math.PI; // you look toward the nose (−z): your left is the door (−x)
  car.add(you.group);
  A.youHead = anchor(you.head, 0, 0, 0);
  const SEAT = V(YOU.head[0], 48, YOU.head[2] - 31); // your hips: reclined 24°, they put your head where the plan says
  const RIM = { r: 18.5, e1: V(1, 0, 0), e2: V().crossVectors(AXIS, V(1, 0, 0)) }; // the rim's own plane: across, and up along it
  // in your own frame (x and z turned round)
  const RIM_AXIS = V(-RIM.e2.x, RIM.e2.y, -RIM.e2.z);
  const OVER_RIM = V(AXIS.x, -AXIS.y, AXIS.z); // across the rim, away from you
  const PALMS = { L: V(-1, 0, 0), R: V(1, 0, 0) }; // each palm faces the hub
  const KNEE = V(0, 1, 0.3);
  const TOE = V(0, 0.55, 0.85);
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
  const strapPts = Array.from({ length: 6 }, () => V());
  const strapNor = Array.from({ length: 6 }, () => V());
  const lapPts = Array.from({ length: 5 }, () => V());
  const lapNor = Array.from({ length: 5 }, () => V());
  const chest = V();
  // where your own frame stands in the car (it slides with your hips), and the way from the car into it
  let gx = 0;
  let gy = 0;
  let gz = 0;
  const mine = (x, y, z, out) => out.set(-(x - gx), y - gy, -(z - gz));
  /** A point of your trunk, in the car. */
  const onTrunk = (p, out) => {
    out.copy(p).applyMatrix4(you.torso.matrix);
    return out.set(you.group.position.x - out.x, you.group.position.y + out.y, you.group.position.z - out.z);
  };
  /** `c`: the crash throws you forward into your belt · `b`: the bag throws your hands off the rim. */
  function poseYou(c, b) {
    const e = c * c * (3 - 2 * c);
    gx = SEAT.x;
    gy = SEAT.y - you.HIP;
    gz = SEAT.z - 4.5 * e; // your hips slide as far as the belt gives
    you.group.position.set(gx, gy, gz);
    you.leg("L", mine(-48, 40, -90, v1), KNEE, TOE);
    you.leg("R", mine(-29, 41, -95, v1), KNEE, TOE);
    you.lean(mix(-24, -2, e), 0, 0); // the trunk tips forward from the hips…
    you.head.position.set(0, 76.5 - 1.3 * e, 1 + 5.5 * e); // …and the head goes on toward the wheel
    const off = smooth(0.15, 0.7, b);
    for (let i = 0; i < 2; i++) {
      const s = i ? "R" : "L";
      const sx = i ? 1 : -1; // in the car, your left hand is on the −x side
      v1.copy(HUB).addScaledVector(RIM.e1, sx * RIM.r * 0.985).addScaledVector(RIM.e2, RIM.r * 0.17); // a quarter past nine
      v1.x += sx * 15 * off;
      v1.y -= 5 * off;
      v1.z += 9 * off;
      you.hold(s, mine(v1.x, v1.y, v1.z, v2), RIM_AXIS, { palm: PALMS[s], dir: OVER_RIM, k: mix(0.92, 0.25, off), bar: 1.6 });
    }
    // the belt follows the trunk
    chest.set(0, 0, 1).transformDirection(you.torso.matrix);
    chest.set(-chest.x, chest.y, -chest.z);
    strapPts[0].copy(BELT.ring);
    for (let i = 0; i < 4; i++) onTrunk(BELT.strap[i], strapPts[i + 1]);
    strapPts[5].copy(BELT.buckle);
    strapNor[0].set(0.3, 1, -0.2).normalize();
    strapNor[1].set(0, 1, 0).lerp(chest, 0.35).normalize();
    for (let i = 2; i < 6; i++) strapNor[i].copy(chest);
    strap.lay(strapPts, strapNor);
    lapPts[0].copy(BELT.buckle);
    for (let i = 0; i < 3; i++) onTrunk(BELT.lap[i], lapPts[i + 1]);
    lapPts[4].copy(BELT.anchor);
    for (let i = 0; i < 5; i++) lapNor[i].copy(chest).lerp(UP, 0.45).normalize();
    lap.lay(lapPts, lapNor);
  }

  /* ═════════════ 5 · THE AIRBAGS ═════════════ */

  // a pale cloth — but not ink at full strength: under the key it would burn out, and a bag is read by its shading
  fx.cloth = solid(new THREE.Color(BRAND.ink).multiplyScalar(0.58), { rough: 1, env: 0.2, double: true });
  const bagAt = (bag, at, toward, back) => {
    const g = new THREE.Group();
    g.position.copy(at).addScaledVector(toward, back);
    g.quaternion.setFromUnitVectors(AHEAD, toward);
    g.add(bag.mesh);
    car.add(g);
    return g;
  };
  const bagDriver = makeBag({ R: 30, depth: 27, lobes: 7, material: fx.cloth });
  const bagPassenger = makeBag({ R: 28, depth: 46, lobes: 6, wide: 1.16, tall: 0.94, square: 3.4, material: fx.cloth }); // a pillow, not a ball
  const DASH = V(-WHEEL.x, 96, -71); // where the passenger's bag bursts from the dashboard
  const OUT = V(0, 0.42, 0.9075).normalize();
  A.bagDriver = anchor(bagAt(bagDriver, HUB, AXIS, 2.5), 0, 0, 15);
  A.bagPassenger = anchor(bagAt(bagPassenger, DASH, OUT, 0), 0, 0, 24);

  /* ═════════════ 6 · THE ONE WHO COMES TO YOUR DOOR ═════════════ */

  const helper = makeFigure({ shell: true, hands: "real", order: 26, glassK: 1.9, through: 0.2 });
  helper.group.position.set(RESCUER.x, 0, RESCUER.z);
  helper.group.rotation.y = Math.PI / 2; // he faces your door (+x): his right is toward the tail
  helper.shadow.visible = true;
  helper.group.visible = false;
  car.add(helper.group);
  A.rescuerHead = anchor(helper.head, 0, 0, 0);
  A.rescuerHand = anchor(helper.arms.R.hand, 0, -1.5, 18.5); // his fingertips
  // your handle, in his own frame: 2 cm short of it, his open hand is 19 cm long from the wrist and hangs 2 cm under it
  const GAP = 2;
  const H_WRIST = V(-(DOOR_HANDLE[2] - RESCUER.z) - 1.5, DOOR_HANDLE[1] + 2, DOOR_HANDLE[0] - GAP - RESCUER.x - 18.9);
  const H_DIR = V(0, -0.05, 1).normalize();
  const H_PALM = V(0.6, -0.8, 0).normalize();
  function poseHelper(r) {
    const e = r * r * (3 - 2 * r);
    helper.leg("L", v1.set(10, 8, 4 + 8 * e)); // half a step toward the door
    helper.leg("R", v1.set(-10, 8, -4));
    helper.lean(17 * e, 0, -9 * e);
    helper.reach("L", v1.set(22, 92 + 2 * e, 3 + 5 * e));
    v1.set(-21.5, 92, 3).lerp(H_WRIST, e);
    v1.y += 7 * Math.sin(Math.PI * e); // his hand comes up, then down onto the handle
    helper.reach("R", v1, null, { dir: v3.set(0, -0.92, 0.25).lerp(H_DIR, e).normalize(), palm: v4.set(1, 0, 0).lerp(H_PALM, e).normalize() });
    helper.grip("L", 0.12);
    helper.grip("R", 0.12);
  }

  /* ═════════════ 7 · THE BODY MADE LIVE ═════════════ */

  const sprites = makeSprites(4); // 0: where the cable is pinched · 1: the head of the wave on its way to your door · 2: your handle · 3: the blow itself
  car.add(sprites.points);
  A.pinch = anchor(car, ...PINCH);
  // the way the head takes: down to the floor, out to the sill, up the front cut of your door, along its shoulder to the handle
  const WAY = [PINCH, [-60, 31, -104], [-88, 34, -96], [-90, 60, -76], [-90.5, 93, -70], [DOOR_HANDLE[0], DOOR_HANDLE[1], DOOR_HANDLE[2]]].map((p) => ({ p, d: Math.hypot(p[0] - PINCH[0], p[1] - PINCH[1], p[2] - PINCH[2]) }));
  const SIG = SIGNAL.clone().multiplyScalar(2.4);
  const HEAD = FIERY.clone().multiplyScalar(2.8);
  const BLOW = INK.clone().multiplyScalar(1.5);

  A.nose = anchor(car, 0, 46, NOSE);
  A.roof = anchor(car, 0, CAR.roof, 34);
  A.rearSeat = anchor(car, 0, 56, 104);

  const last = { c: -1, b: -1, r: -1 };
  poseYou(0, 0);
  poseHelper(0);

  return {
    group, A, fx,
    /**
     * shell    the X-ray of the car: its skin, its lines, wheels, seats, steering wheel, belt (0–1)
     * wall     the wall and the road (0–1)
     * you      you at the wheel (0 / 1)
     * crush    0 the bumper touches the wall → 1 the nose folded by CRUSH.depth (the wall has come that far), you thrown into your belt
     * debris   shards and dust (0–1: how far they have flown, and how many)
     * bags     the two airbags: 0 folded away → 0.5 crumpled, half out → 1 full
     * rescuer  the one at your door (0 / 1)      reach   his hand: 0 at his side → 1 two centimetres from your handle
     * live     the body made live: 0 → 0.8 the wave gets to your handle → 1 the whole shell, your door brightest
     */
    update({ shell = 1, wall = 1, you: showYou = 1, crush = 0, debris = 0, bags = 0, rescuer = 0, reach = 0, live = 0 } = {}, time = 0, px = 1600) {
      const c = clamp01(crush);
      const b = clamp01(bags);
      const lv = clamp01(live);
      const sh = clamp01(shell);

      // the world comes to the car, and tips under it
      const theta = LIFT * smooth(0.05, 0.6, c) * (1 - 0.55 * smooth(0.7, 1, c));
      tilt.rotation.x = theta;
      slide.position.z = -CAR.front + CRUSH.depth * c;
      setPartOpacity(wallPart, clamp01(wall));
      fx.ground.uniforms.uAmount.value = clamp01(wall);
      ground.visible = wall > 0.003;
      A.nose.position.z = NOSE + CRUSH.depth * c;

      // the shell
      car.visible = sh > 0.003 || showYou > 0.5 || b > 0.004;
      fx.skin.uniforms.uAmount.value = sh;
      fx.skin.uniforms.uCrush.value = c;
      fx.skin.uniforms.uLive.value = lv;
      fx.inner.uniforms.uAmount.value = sh;
      fx.tyre.uniforms.uAmount.value = sh;
      fx.trim.uniforms.uAmount.value = sh;
      const door = smooth(LIVE_AT_HANDLE - 0.04, 1, lv);
      fx.strong.uniforms.uAmount.value = 0.8 * sh;
      fx.fine.uniforms.uAmount.value = 0.48 * sh;
      fx.lamp.uniforms.uAmount.value = 0.9 * sh;
      for (let i = 0; i < 3; i++) {
        const u = fx.bodyLines[i].uniforms;
        u.uCrush.value = c;
        u.uLive.value = lv;
        u.uDoor.value = door;
      }
      for (let i = 0; i < fx.kitLines.length; i++) fx.kitLines[i].opacity = fx.kitLines[i].userData.base * sh;
      setPartOpacity(fit, sh);
      fx.handle.emissiveIntensity = 2.6 * door;

      // the wheels: the front ones are driven back and splay, the rear ones hang down to the road as the tail lifts
      const e = c * c * (3 - 2 * c);
      for (let i = 0; i < 4; i++) {
        const w = fx.wheels[i];
        const s = w.userData.side;
        if (w.userData.front) {
          w.position.z = CAR.front + 12 * e;
          w.rotation.y = s * 9 * DEG * e;
          w.rotation.z = -s * 3 * DEG * e;
        } else w.position.y = CAR.wheel - (CAR.rear - CAR.front) * Math.sin(theta);
      }

      // you, and the bags
      you.group.visible = showYou > 0.5;
      if (c !== last.c || b !== last.b) {
        poseYou(c, b);
        last.c = c;
        last.b = b;
      }
      bagDriver.fill(b);
      bagPassenger.fill(b);

      // the one at your door
      helper.group.visible = rescuer > 0.5;
      if (rescuer > 0.5 && reach !== last.r) {
        poseHelper(clamp01(reach));
        last.r = reach;
      }

      // the body made live: its source, the head of the wave on its way to your door, the heart on your handle
      const on = lv > 0.0005;
      const breath = 1 + 0.07 * Math.sin(time * 1.3); // slow: a light that blinks reads as a fault
      sprites.uniforms.uScale.value = px;
      sprites.put(0, PINCH[0], PINCH[1], PINCH[2], SIG, on ? (0.5 + 0.7 * Math.exp(-lv / 0.08)) * smooth(0, 0.03, lv) * breath * sh : 0, 95);
      const radius = (lv / LIVE_AT_HANDLE) * TO_HANDLE;
      let j = 1;
      while (j < WAY.length - 1 && WAY[j].d < radius) j++;
      const u = clamp01((radius - WAY[j - 1].d) / (WAY[j].d - WAY[j - 1].d));
      const p0 = WAY[j - 1].p;
      const p1 = WAY[j].p;
      sprites.put(1, mix(p0[0], p1[0], u), mix(p0[1], p1[1], u), mix(p0[2], p1[2], u), HEAD, on && lv < LIVE_AT_HANDLE + 0.02 ? smooth(0, 0.04, lv) * (1 - smooth(LIVE_AT_HANDLE - 0.03, LIVE_AT_HANDLE + 0.02, lv)) * sh : 0, 62);
      sprites.put(2, DOOR_HANDLE[0] - 1, DOOR_HANDLE[1], DOOR_HANDLE[2], SIG, door * (1.05 + 0.5 * Math.exp(-Math.max(0, lv - LIVE_AT_HANDLE) / 0.05)) * breath * sh, 80 + 40 * door);
      // what the crash throws — and, while the first shards leave, the blow: a light that has a place, where the bumper meets the wall
      const d = clamp01(debris);
      sprites.put(3, 0, 50, NOSE + CRUSH.depth * c + 5, BLOW, smooth(0, 0.05, d) * Math.exp(-d / 0.28) * clamp01(wall), 200);
      sprites.flush();
      fx.shards.mesh.visible = d > 0.003;
      fx.shards.uniforms.uK.value = d;
      fx.shards.uniforms.uTime.value = time;
      fx.shards.uniforms.uAmount.value = smooth(0, 0.07, d);
      fx.dust.mesh.visible = d > 0.003;
      fx.dust.uniforms.uK.value = d;
      fx.dust.uniforms.uTime.value = time;
      fx.dust.uniforms.uScale.value = px;
      fx.dust.uniforms.uAmount.value = 0.5 * smooth(0, 0.1, d);
    },
  };
}
