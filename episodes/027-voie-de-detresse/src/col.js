// DOSSIER 027 — Voie de détresse : THE PLACE, seen like an X-ray. A mountain road at night: the long descent from the
// top of the col, its paint and its delineators every 25 m (what files past on the first frame); the mountain on the
// LEFT, a dark mass drawn by its contour lines; at the bottom the bend to the LEFT round the mountain's spur, its guard
// rail and its seven chevrons (signal: the threat seen from far away); the shelf the road is cut on, its lip (signal
// near the bottom) and the cliffs that fall from it in contour lines; the valley 120 m below, dark — the lights of a
// town right behind the bend, of hamlets and of a road's lamps say how deep it is; a village and the next file's house,
// its floor a grid that fades round it — and across it the far side, rising to a crest against a sky a shade less
// black (it goes round behind the col too, low: from below the col, its crest stands against the sky alone). The top
// of the col is a fine line across the shelf: from below, its silhouette.
//
//   buildCol() → { group, A, update(P, time, px) }
//   P = { shell, danger, home, lamp, beam } — `lamp`, `beam`: THREE.Vector3 handed by world.js every frame (the
//   headlamps' world position, the truck's forward direction): the pool of the headlamps on the road.
//
// THE GROUND IS A MASK. Nothing here is a lit floor: the road, its verges, the mountain, the cliffs and the valley are
// drawn black and write their depth — they hide what lies behind them — and only their lines give light (paint, grid,
// contours). That is what makes the void a void: past the lip there is nothing, but far down and far away the lights of
// the valley. No glass rim on a large surface: a slope seen at a grazing angle turns into a white slab. No grid on the
// valley's floor out to the horizon: from the road it reads as a plain at the road's own level.
// THE SLOPE IS READ IN TWO VANISHING POINTS: the road's lines (paint, grid, delineators) run to the descent's, 4.6°
// under the horizon; the mountain's contours (absolute altitude) run to the horizon's. The gap between them is 8 %.
// THE LANE'S GROUND IS NOT MINE (docs/027-decors.md): right of the road, x 70 → 835, s 222 → 327, nothing is drawn but
// a black box 1.5 m deep under it — model.js's access, pit, barrier and berm stand in it, and the box keeps the void
// from showing through a gap between their pieces.
// Everything is in the road's frame (plan.js), on the descent's plane — and over the top of the col, where the road
// rounds its crest (`yRoad`). Centimetres; « s » is metres down the road.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, asShell, glow, setGlow, lineMat, anchor } from "@kit/build3d.js";
import { SLOPE, ROAD, CURVE, MOUNTAIN, HOME, PANEL, ACCESS, BED, BERM, RAIL } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const g = (x) => (+x).toFixed(6); // a number written into GLSL
const SHUTTER = 0.5 / 30; // how long the stage's shutter stays open (s)

/* ───────────────────────────────────────────────────────────── the road's line */

const HALF = ROAD.w / 2; //                       350: from the centre line to the road's edge
const AXIS = (ROAD.left + ROAD.right) / 2; //      −175: the dashed centre line
const LINE = ROAD.line; //                        the edge lines, just inside the edges
const R = CURVE.r; //                             the bend's radius at the centre line
const TURN = CURVE.turn * DEG;
const CX = AXIS - R; //                           the bend's centre
const CZ = -100 * CURVE.s;
const V_BEND = 100 * CURVE.s; //                  cm of centre line down to the bend…
const V_TURN = V_BEND + R * TURN; //              …and to its end
const POST = 16000; //                            the road goes on 160 m past the bend (out of every frame)
const V_END = V_TURN + POST;
const H75 = [-Math.sin(TURN), -Math.cos(TURN)]; // its heading past the bend (x, z)…
const R75 = [Math.cos(TURN), -Math.sin(TURN)]; //  …and its right, the outside
const P75 = [CX + R * R75[0], CZ + R * R75[1]]; // the centre line where the bend ends
const FOOT = MOUNTAIN.foot - AXIS; //             −525: the mountain's foot, from the centre line
const S_HOLE = [ACCESS.s0, BERM.s1 + 2]; //        the lane's ground (model.js): s 222 → 327 …
const X_HOLE = [BED.x - 400, RAIL.x + 100]; //     … x 70 → 835 (docs/027-decors.md)

/** A point of the road: `u` cm to the right of its centre line (the outside of the bend), `v` cm along it → [x, z]. */
function roadXZ(u, v) {
  if (v <= V_BEND) return [AXIS + u, -v];
  if (v <= V_TURN) {
    const phi = (v - V_BEND) / R;
    return [CX + (R + u) * Math.cos(phi), CZ - (R + u) * Math.sin(phi)];
  }
  const w = v - V_TURN;
  return [P75[0] + w * H75[0] + u * R75[0], P75[1] + w * H75[1] + u * R75[1]];
}
/** …and back: [u, v] of a point (x, z) of the ground. The same in GLSL below. */
function roadUV(x, z) {
  if (z >= CZ) return [x - AXIS, -z];
  const dx = x - CX;
  const dz = z - CZ;
  const phi = Math.atan2(-dz, dx);
  if (phi <= TURN) return [Math.hypot(dx, dz) - R, V_BEND + R * phi];
  const qx = x - P75[0];
  const qz = z - P75[1];
  return [qx * R75[0] + qz * R75[1], V_TURN + qx * H75[0] + qz * H75[1]];
}
/** The road's height (the descent's plane — and over the col, its crest: the top at s = ROAD.top, the far side
 *  falling away at 8 % so that the sky stands right behind it). */
const ZC = -100 * ROAD.top - 3000;
const KC = SLOPE / 6000;
const ZF = ZC + 6000;
const YF = SLOPE * ZF - KC * 6000 * 6000;
const Z_END = ZF + 4000; // the world's uphill end, behind the crest
const yRoad = (z) => (z <= ZC ? SLOPE * z : z <= ZF ? SLOPE * z - KC * (z - ZC) * (z - ZC) : YF - SLOPE * (z - ZF));
const sz = (s) => -100 * s;

/* ───────────────────────────────────────────────────────────── the shelf's edge, the valley, the far side */

// The lip (x, z), the void on its right as one walks it: down the right side from the col, in front of the berm, up
// the gore to the notch behind the bend (plan.js EDGE: (−150, s 262)), round the bend's outside, on past it. The gore
// keeps left of x 70 (the lane's ground) and gives the bed 1.5 m of shelf on its left; the bend's outside is an arc
// that keeps 1.9 m of verge beyond the road (plan.js EDGE ran across the road past the bend).
const R_LIP = Math.hypot(-150 - CX, 100 * (262 - CURVE.s));
const PHI_LIP = Math.atan2(100 * (262 - CURVE.s), -150 - CX);
const LIP = (() => {
  const pts = [[1150, Z_END], [1150, sz(333)], [60, sz(333)], [60, sz(290)], [45, sz(274)], [-20, sz(266)], [-150, sz(262)]];
  for (let i = 1; i <= 14; i++) {
    const phi = PHI_LIP + ((TURN - PHI_LIP) * i) / 14;
    pts.push([CX + R_LIP * Math.cos(phi), CZ - R_LIP * Math.sin(phi)]);
  }
  const [lx, lz] = pts[pts.length - 1];
  pts.push([lx + POST * H75[0], lz + POST * H75[1]]);
  return pts;
})();
/** The valley floor: 120 m under the shelf's foot (plan.js HOME stands on it). */
const VY = HOME[1] - 50;
// The far side: a ridge round the valley's front and right ([x, z, its height over the floor]), the valley on the
// right as one walks it. Far enough (2.4 km ahead, 1.5 to 2 km to the right) that from the road, high up, the eye
// finds the valley's floor beyond the lip before the far side rises; its crest stands ≈ 4° over the horizon.
const RIDGE = [
  [-360000, -255000, 36000],
  [-170000, -270000, 44000],
  [-50000, -245000, 34000],
  [60000, -238000, 42000],
  [150000, -195000, 31000],
  [205000, -95000, 37000],
  [200000, 10000, 28000],
  [185000, 150000, 24000],
  // round behind the col, low: from up there it is a dark line under the horizon's glow, never over the col's crest
  [130000, 240000, 27000],
  [30000, 300000, 26000],
  [-90000, 320000, 25000],
];
const RISE = 75000; //  the far side rises over 750 m toward its crest…
const FALL = 45000; //  …and falls 450 m behind it
// The road down in the valley (a faint line on its floor, street lamps along it), its hamlets — from the road, high up,
// they are what gives the void its depth — and the village of the next file's house
const VALLEY_ROAD = [
  [-200000, -182000], [-120000, -168000], [-88000, -160000], [-52000, -128000], [-14000, -142000], [26000, -118000],
  [44000, -88000], [16000, -64000], [HOME[0] - 600, HOME[2] - 900], [18000, -24000], [58000, 18000], [96000, 70000],
];
// …and the valley's town, right behind the bend and 120 m down: from the road, high up, the chevrons stand in front of
// its lights — the drop reads in one look
const TOWN = { x: -9000, z: -136000, w: 34000, d: 16000, street: 3000, n: 80 };
const HAMLETS = [
  [-52000, -128000, 9], [-14000, -150000, 7], [26000, -118000, 8], [61000, -160000, 6], [92000, -122000, 5], [-88000, -165000, 6],
];

/* ───────────────────────────────────────────────────────────── a little arithmetic */

/** Seeded value noise (−1…1) and its fractal sum. */
function makeNoise(seed) {
  const rand = rng(seed);
  const perm = new Uint16Array(512);
  const val = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    perm[i] = i;
    val[i] = rand() * 2 - 1;
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const at = (ix, iz) => val[perm[(perm[ix & 255] + (iz & 255)) & 511]];
  const n = (x, z) => {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;
    const sx = fx * fx * (3 - 2 * fx);
    const sz2 = fz * fz * (3 - 2 * fz);
    const a = at(ix, iz);
    const b = at(ix + 1, iz);
    const c = at(ix, iz + 1);
    const d = at(ix + 1, iz + 1);
    return a + (b - a) * sx + (c - a) * sz2 + (a - b - c + d) * sx * sz2;
  };
  return (x, z) => 0.6 * n(x, z) + 0.3 * n(2.03 * x + 17.1, 2.03 * z - 5.3) + 0.1 * n(4.1 * x - 3.7, 4.1 * z + 9.2);
}
const fbm = makeNoise(27);

/** Signed distance from (x, z) to a closed polygon of [x, z]: + inside. */
function polyDist(poly, x, z) {
  let inside = false;
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    const dx = xj - xi;
    const dz = zj - zi;
    const L = dx * dx + dz * dz;
    const t = L > 0 ? clamp01(((x - xi) * dx + (z - zi) * dz) / L) : 0;
    const ex = xi + t * dx - x;
    const ez = zi + t * dz - z;
    best = Math.min(best, ex * ex + ez * ez);
  }
  const d = Math.sqrt(best);
  return inside ? d : -d;
}

/** A polyline [x, z] resampled every `step` cm (its corners kept), with the outward normal at each point (the right of
 *  the way it runs: there lies the void). */
function resample(poly, step) {
  const pts = [];
  for (let i = 0; i < poly.length - 1; i++) {
    const [ax, az] = poly[i];
    const [bx, bz] = poly[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / step));
    for (let k = 0; k < n; k++) pts.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
  }
  pts.push(poly[poly.length - 1]);
  const segN = (a, b) => {
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const l = Math.hypot(dx, dz) || 1;
    return [-dz / l, dx / l];
  };
  return pts.map((p, i) => {
    const a = segN(pts[Math.max(0, i - 1)], pts[Math.max(1, i)]);
    const b = segN(pts[Math.min(pts.length - 2, i)], pts[Math.min(pts.length - 1, i + 1)]);
    const nx = a[0] + b[0];
    const nz = a[1] + b[1];
    const l = Math.hypot(nx, nz) || 1;
    return { x: p[0], z: p[1], nx: nx / l, nz: nz / l };
  });
}

/* ───────────────────────────────────────────────────────────── the mountain: where it stands, how high */

const RF = R + FOOT; //                                    the foot's radius round the bend (1975)
const F75 = [CX + RF * R75[0], CZ + RF * R75[1]]; //       the foot where the bend ends
/** How far a point is from the mountain's foot (the line u = FOOT: straight, round the bend, straight again). */
function footDist(x, z) {
  const dS = z >= CZ ? Math.abs(x - MOUNTAIN.foot) : Math.hypot(x - MOUNTAIN.foot, z - CZ);
  const dx = x - CX;
  const dz = z - CZ;
  const phi = Math.atan2(-dz, dx);
  const dA = phi >= 0 && phi <= TURN ? Math.abs(Math.hypot(dx, dz) - RF) : Math.min(Math.hypot(x - (CX + RF), z - CZ), Math.hypot(x - F75[0], z - F75[1]));
  const qx = x - F75[0];
  const qz = z - F75[1];
  const t = Math.min(POST, Math.max(0, qx * H75[0] + qz * H75[1]));
  const dP = Math.hypot(qx - t * H75[0], qz - t * H75[1]);
  return Math.min(dS, dA, dP);
}
/** The mountain at (x, z): [its height over the shelf (negative outside: the zero is its foot), how near its crest
 *  (0…1)]. A face at MOUNTAIN.rise to a rounded crest 60 m up — lower toward the col, which is a saddle — and a spur
 *  that the bend goes round. Its rock is not a plane: the faces wander a couple of metres (never at the foot). */
function mountainAt(x, z) {
  const d = footDist(x, z);
  if (roadUV(x, z)[0] >= FOOT) return [-0.75 * Math.min(d, 400), 0];
  const s = -z / 100;
  const crest = 1100 + (MOUNTAIN.crest - 1100) * smooth(ROAD.top - 15, ROAD.top + 190, s);
  const raw = MOUNTAIN.rise * d;
  const k = 450;
  const h = -k * Math.log(Math.exp(-raw / k) + Math.exp(-crest / k));
  const rock = fbm(x / 2400, z / 2400) * 240 * smooth(0, 600, d) * (1 - 0.7 * smooth(0.8 * crest, crest, h));
  const y = Math.max(0.2, h + rock);
  return [y, Math.min(1, y / crest)];
}

/** The far side at (x, z): [its height over the valley floor, how near its crest (0…1)]. */
function farAt(x, z) {
  let best = Infinity;
  let sd = 0;
  let top = 0;
  for (let i = 0; i < RIDGE.length - 1; i++) {
    const [ax, az, ah] = RIDGE[i];
    const [bx, bz, bh] = RIDGE[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const L = dx * dx + dz * dz;
    const t = clamp01(((x - ax) * dx + (z - az) * dz) / L);
    const ex = x - (ax + t * dx);
    const ez = z - (az + t * dz);
    const d = Math.hypot(ex, ez);
    if (d < best) {
      best = d;
      const l = Math.sqrt(L);
      sd = (ex * -dz + ez * dx) / l; // + on the right: the valley's side
      top = ah + t * (bh - ah);
    }
  }
  top *= 1 + 0.18 * fbm(x / 60000 + 3.1, z / 60000 - 1.7);
  const u = sd >= 0 ? clamp01(1 - sd / RISE) : clamp01(1 + sd / FALL);
  let h = top * Math.pow(u, sd >= 0 ? 1.7 : 1.2);
  h += fbm(x / 26000, z / 26000) * 0.14 * top * u * (1 - u) * 4; // ridges and gullies, none on the floor nor the crest
  h = Math.max(0, h);
  return [h, top > 0 ? Math.min(1, h / top) : 0];
}

/* ───────────────────────────────────────────────────────────── shared GLSL */

const GLSL_LINES = /* glsl */ `
  // one family of lines, 1.8 px wide, spread over the smear with the same light, gone before they crowd (014)
  float lines(float x, float cell, float smear) {
    float q = x / cell;
    float f = fwidth(q);
    float w = max(f * 1.8, 1e-5);
    float d = abs(fract(q - 0.5) - 0.5);
    float reach = max(w, 0.5 * smear / cell);
    return (w / reach) * (1.0 - smoothstep(reach - w, reach, d)) * (1.0 - smoothstep(0.12, 0.4, f));
  }
  // a painted band halfW cm each side of d = 0: never under 1.8 px — thinner, it keeps its light and loses its strength
  float band(float d, float halfW) {
    float w = max(fwidth(d), 1e-4);
    float h = max(halfW, 0.9 * w);
    return (halfW / h) * (1.0 - smoothstep(h - 0.6 * w, h + 0.6 * w, abs(d)));
  }
  // dashes len long every period, their ends soft over the smear
  float dash(float s, float period, float len, float smear) {
    float d = abs(mod(s - 0.5 * len + 0.5 * period, period) - 0.5 * period);
    float e = max(fwidth(s), 0.5 * smear) + 1.0;
    return 1.0 - smoothstep(0.5 * len - e, 0.5 * len + e, d);
  }
  float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }`;
// the road's own coordinates at a point of the ground: u across (cm from the centre line, + to the right — the outside
// of the bend), v along (cm of centre line from s = 0): straight, the bend to the left, straight again
const GLSL_ROAD = /* glsl */ `
  vec2 roadUV(vec2 p) {
    if (p.y >= ${g(CZ)}) return vec2(p.x - (${g(AXIS)}), -p.y);
    vec2 d = p - vec2(${g(CX)}, ${g(CZ)});
    float phi = atan(-d.y, d.x);
    if (phi <= ${g(TURN)}) return vec2(length(d) - ${g(R)}, ${g(V_BEND)} + ${g(R)} * phi);
    vec2 q = p - vec2(${g(P75[0])}, ${g(P75[1])});
    return vec2(dot(q, vec2(${g(R75[0])}, ${g(R75[1])})), ${g(V_TURN)} + dot(q, vec2(${g(H75[0])}, ${g(H75[1])})));
  }`;
// the headlamps: two beams that widen and merge, down on the road, a little up the rock; nothing above their cut
const GLSL_BEAM = /* glsl */ `
  float beamAt(vec3 P) {
    vec2 f = uBeam.xz;
    float lf = length(f);
    f = lf > 1e-4 ? f / lf : vec2(0.0, -1.0);
    vec3 q = P - uLamp;
    float ahead = dot(q.xz, f);
    float lat = dot(q.xz, vec2(-f.y, f.x));
    float a = max(ahead, 0.0);
    float wB = 75.0 + 0.21 * a;
    float bl = (lat - 95.0) / wB;
    float br = (lat + 95.0) / wB;
    float up = exp(-max(q.y + 0.03 * a, 0.0) / (140.0 + 0.08 * a));
    return 0.5 * (exp(-bl * bl) + exp(-br * br)) * smoothstep(-20.0, 320.0, ahead) * exp(-a / 1700.0) * up;
  }`;

/* ───────────────────────────────────────────────────────────── materials */

/** The shelf: the road (black asphalt, its paint; its grain where the lamps reach) and its verges (a grid), one
 *  surface. `aIn`: (how far inside the lip, how far outside the lane's ground) — below 0, nothing. */
function groundMaterial(U) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { uInk: { value: INK.clone() }, uAmount: U.amount, uSmear: U.smear, uLamp: U.lamp, uBeam: U.beam },
    vertexShader: /* glsl */ `
      attribute vec2 aIn; varying vec3 vW; varying vec2 vIn;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz; vIn = aIn;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount, uSmear; uniform vec3 uLamp, uBeam;
      varying vec3 vW; varying vec2 vIn;
      ${GLSL_LINES}
      ${GLSL_ROAD}
      ${GLSL_BEAM}
      void main() {
        if (vIn.x < 0.0 || vIn.y < 0.0) discard;
        vec2 uv = roadUV(vW.xz);
        float u = uv.x; float v = uv.y;
        float eye = distance(cameraPosition, vW);
        float near = exp(-eye / 2800.0);
        float far = exp(-eye / 32000.0);
        float beam = beamAt(vW);
        float fu = max(fwidth(u), 1e-3);
        float road = (1.0 - smoothstep(${g(HALF)} - fu, ${g(HALF)} + fu, abs(u))) * (1.0 - step(${g(V_END)}, v));
        // the asphalt: black — its grain only where the lamps reach
        float tex = mix(noise(vec2(u, v) / 7.0), 0.5, smoothstep(0.3, 1.0, fwidth(v / 7.0)));
        float asphalt = beam * beam * 0.09 + beam * tex * 0.035;
        // the paint: both edge lines (the right one broken where the lane leaves the road), the dashed centre line
        float leaves = step(${g(100 * ACCESS.s0)}, v) * (1.0 - step(${g(V_BEND)}, v));
        float rightLine = band(u - ${g(HALF - LINE / 2)}, ${g(LINE / 2)}) * mix(1.0, dash(v, 650.0, 300.0, uSmear), leaves);
        float paint = rightLine + band(u + ${g(HALF - LINE / 2)}, ${g(LINE / 2)}) + band(u, 6.5) * dash(v, ${g(ROAD.dash[0] + ROAD.dash[1])}, ${g(ROAD.dash[0])}, uSmear);
        paint *= 1.0 - smoothstep(${g(V_END - 6000)}, ${g(V_END - 1500)}, v); // past the bend the road runs out of the picture
        float lit = 0.07 + 0.11 * near + 0.09 * far + 0.85 * beam;
        // the verges: a grid, down to the lip, up to the mountain's foot, never on the lane's ground
        float grid = max(lines(u, 100.0, 0.0), lines(v, 100.0, uSmear)) * 0.35 + max(lines(u, 500.0, 0.0), lines(v, 500.0, uSmear));
        float verge = (1.0 - road) * smoothstep(${g(FOOT - 40)}, ${g(FOOT - 5)}, u) * smoothstep(0.0, 200.0, vIn.y) * smoothstep(0.0, 40.0, vIn.x);
        float ink = road * (asphalt + paint * lit) + verge * grid * (0.022 * far + 0.085 * near + 0.32 * beam);
        gl_FragColor = vec4(uInk * ink * uAmount, 1.0);
      }`,
  });
}

/** Rock and valley: black, its contours (absolute altitude every `step`, every fourth one stronger), and — where it is
 *  flat — a grid; `aH` = (height over its base: below 0 nothing; how near its crest: the crest line). */
function terrainMaterial(U, { step, k, fade, floor = 0, floorFade = fade, crest = 0, foot = 0, beam = 0 }) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide, // a mask from either side
    uniforms: {
      uInk: { value: INK.clone() }, uAmount: U.amount, uLamp: U.lamp, uBeam: U.beam,
      uStep: { value: step }, uK: { value: k }, uFade: { value: fade }, uFloor: { value: floor }, uFloorFade: { value: floorFade }, uCrest: { value: crest }, uFoot: { value: foot }, uBeamK: { value: beam },
    },
    vertexShader: /* glsl */ `
      attribute vec2 aH; varying vec3 vW; varying vec3 vN; varying vec2 vH;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vH = aH;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount, uStep, uK, uFade, uFloor, uFloorFade, uCrest, uFoot, uBeamK; uniform vec3 uLamp, uBeam;
      varying vec3 vW; varying vec3 vN; varying vec2 vH;
      ${GLSL_LINES}
      ${GLSL_BEAM}
      void main() {
        if (vH.x < 0.0) discard;
        float eye = distance(cameraPosition, vW);
        float fade = exp(-eye / uFade);
        float level = smoothstep(0.985, 0.997, abs(normalize(vN).y));
        float y = vW.y + 0.5 * uStep; // half a step off: a floor never sits on a contour
        float contour = max(0.55 * lines(y, uStep, 0.0), lines(y, 4.0 * uStep, 0.0)) * (1.0 - level);
        float grid = (max(lines(vW.x, 1000.0, 0.0), lines(vW.z, 1000.0, 0.0)) * 0.45 + max(lines(vW.x, 5000.0, 0.0), lines(vW.z, 5000.0, 0.0))) * level;
        float cw = max(fwidth(vH.y), 1e-4);
        float top = (1.0 - smoothstep(cw * 0.6, cw * 1.9, abs(vH.y - 0.97))) * step(0.5, vH.y);
        float fw = max(fwidth(vH.x), 0.5);
        float foot = 1.0 - smoothstep(fw * 0.8, fw * 2.2 + 4.0, vH.x);
        float lit = 1.0 + uBeamK * beamAt(vW);
        // the floor's grid only round the village (it says where the ground is under the houses); elsewhere the valley is
        // dark, its lights alone say how deep it is — a grid out to the horizon reads as a plain at the road's level
        float village = exp(-length(vW.xz - vec2(${g(HOME[0])}, ${g(HOME[2])})) / uFloorFade);
        float ink = ((contour * uK + top * uCrest + foot * uFoot) * fade + grid * uFloor * village) * lit;
        gl_FragColor = vec4(uInk * ink * uAmount, 1.0);
      }`,
  });
}

/** Lights that have a place: a bright core and a long tail, at least `min` px (far chevrons, the lit window). */
function makeHalos(count, min, color) {
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  const uniforms = { uScale: { value: 1600 }, uAmount: { value: 0 }, uColor: { value: new THREE.Color(color) }, uMin: { value: min } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uScale, uMin; attribute float aSize;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aSize * uScale / max(1.0, -mv.z), uMin, 260.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount;
        void main() {
          float n = clamp(1.0 - length(gl_PointCoord - 0.5) * 2.0, 0.0, 1.0);
          gl_FragColor = vec4(uColor * uAmount * (0.75 * pow(n, 7.0) + 0.25 * n * n), 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 8;
  return {
    points, uniforms,
    put(i, x, y, z, across) {
      pos.set([x, y, z], i * 3);
      size[i] = across;
    },
  };
}

/** Still points of light far away (windows, a street lamp): `px` across, never under 2.4 px, never a twinkle. */
function makeSpecks(list, px) {
  const pos = new Float32Array(list.length * 3);
  const k = new Float32Array(list.length);
  list.forEach(([x, y, z, b], i) => {
    pos.set([x, y, z], i * 3);
    k[i] = b;
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aK", new THREE.BufferAttribute(k, 1));
  const uniforms = { uInk: { value: INK.clone() }, uAmount: { value: 1 }, uPx: { value: px } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uPx; attribute float aK; varying float vK;
        void main() {
          vK = aK;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = max(2.6, uPx * (0.8 + 0.4 * aK));
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk; uniform float uAmount; varying float vK;
        void main() {
          float d = clamp(length(gl_PointCoord - 0.5) * 2.0, 0.0, 1.0);
          float a = (1.0 - d * d) * (1.0 - d * d);
          gl_FragColor = vec4(uInk * a * vK * 1.35 * uAmount, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 6;
  return { points, uniforms };
}

/** A heightfield over the grid xs × zs: `at(x, z)` → [y, aH.x, aH.y]. */
function heightfield(xs, zs, at) {
  const nx = xs.length;
  const nz = zs.length;
  const pos = new Float32Array(nx * nz * 3);
  const aH = new Float32Array(nx * nz * 2);
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      const [y, hx, hy] = at(xs[i], zs[j]);
      pos.set([xs[i], y, zs[j]], k * 3);
      aH.set([hx, hy], k * 2);
    }
  const index = [];
  for (let j = 0; j < nz - 1; j++)
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i;
      index.push(a, a + nx, a + 1, a + 1, a + nx, a + nx + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aH", new THREE.BufferAttribute(aH, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}
const span = (a, b, step) => {
  const n = Math.max(1, Math.round((b - a) / step));
  return Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
};

/* ───────────────────────────────────────────────────────────── the set */

export function buildCol() {
  const group = new THREE.Group();
  group.name = "col";
  const A = {};
  // what every shader of the place reads: the X-ray's amount, the smear of what goes by, the headlamps
  const U = { amount: { value: 1 }, smear: { value: 0 }, lamp: { value: V3(0, 75, -145) }, beam: { value: V3(0, 0, -1) } };
  const masks = []; // what hides what is behind it (drawn only while the place is there)

  /* ── the shelf: the road and its verges ── */
  const ground = groundMaterial(U);
  {
    // the descent, from behind the crest of the col down to s 210: the road's whole width and both verges (two
    // columns are enough: across, the shelf is flat; along, it follows the crest)
    const zs = span(Z_END, sz(210), 200);
    const xs = [MOUNTAIN.foot - 30, 1150];
    const pos = [];
    const aIn = [];
    for (const z of zs) for (const x of xs) {
      pos.push(x, yRoad(z) - 0.5, z);
      aIn.push(1e4, 1e4);
    }
    const index = [];
    for (let j = 0; j < zs.length - 1; j++) index.push(j * 2, j * 2 + 1, j * 2 + 2, j * 2 + 1, j * 2 + 3, j * 2 + 2); // facing up (z runs downhill)
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aIn", new THREE.Float32BufferAttribute(aIn, 2));
    geo.setIndex(index);
    const mesh = new THREE.Mesh(geo, ground);
    mesh.frustumCulled = false;
    group.add(mesh);
    masks.push(mesh);
  }
  // the lane's ground (model.js): its outline, the road's right edge on its left until the bend leaves it
  const HOLE = (() => {
    const pts = [[ROAD.right, sz(S_HOLE[0])], [X_HOLE[1], sz(S_HOLE[0])], [X_HOLE[1], sz(S_HOLE[1])], [X_HOLE[0], sz(S_HOLE[1])]];
    const phi0 = Math.acos((X_HOLE[0] - CX) / (R + HALF));
    for (let i = 0; i <= 10; i++) {
      const phi = phi0 * (1 - i / 10);
      pts.push([CX + (R + HALF) * Math.cos(phi), CZ - (R + HALF) * Math.sin(phi)]);
    }
    return pts;
  })();
  {
    // the bottom: the bend, the gore, the berm's front, the road past the bend — the lip and the lane's ground cut it
    const end = LIP[LIP.length - 1];
    const left = [H75[1], -H75[0]];
    const SHELF = [[1150, sz(210)], ...LIP.slice(1), [end[0] + 4000 * left[0], end[1] + 4000 * left[1]], [-19500, end[1] + 4000 * left[1]], [-19500, sz(210)]];
    const xs = span(-19000, 1150, 100);
    const zs = span(sz(210), sz(345), 100);
    const pos = new Float32Array(xs.length * zs.length * 3);
    const aIn = new Float32Array(xs.length * zs.length * 2);
    zs.forEach((z, j) =>
      xs.forEach((x, i) => {
        const k = j * xs.length + i;
        pos.set([x, yRoad(z) - 0.5, z], k * 3);
        const lip = polyDist(SHELF, x, z);
        const hole = -polyDist(HOLE, x, z);
        aIn.set([lip, hole], k * 2);
      }),
    );
    const index = [];
    for (let j = 0; j < zs.length - 1; j++)
      for (let i = 0; i < xs.length - 1; i++) {
        const a = j * xs.length + i;
        index.push(a, a + 1, a + xs.length, a + 1, a + xs.length + 1, a + xs.length); // facing up (z runs downhill)
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aIn", new THREE.BufferAttribute(aIn, 2));
    geo.setIndex(index);
    const mesh = new THREE.Mesh(geo, ground);
    mesh.frustumCulled = false;
    group.add(mesh);
    masks.push(mesh);
  }
  {
    // under the lane's ground: a black box 1.5 m deep (its floor and its walls) — never the void through a gap
    const DEEP = 150;
    const black = new THREE.MeshBasicMaterial({ color: 0x000000, fog: false, side: THREE.DoubleSide });
    const shape = new THREE.Shape(HOLE.map(([x, z]) => new THREE.Vector2(x, z)));
    const floor = new THREE.ShapeGeometry(shape);
    const p = floor.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getY(i);
      p.setXYZ(i, x, yRoad(z) - DEEP, z);
    }
    const walls = [];
    for (let i = 0; i < HOLE.length; i++) {
      const [ax, az] = HOLE[i];
      const [bx, bz] = HOLE[(i + 1) % HOLE.length];
      walls.push(ax, yRoad(az) - 1, az, bx, yRoad(bz) - 1, bz, bx, yRoad(bz) - DEEP, bz, ax, yRoad(az) - 1, az, bx, yRoad(bz) - DEEP, bz, ax, yRoad(az) - DEEP, az);
    }
    const wallGeo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(walls, 3));
    for (const geo of [floor, wallGeo]) {
      const mesh = new THREE.Mesh(geo, black);
      mesh.frustumCulled = false;
      group.add(mesh);
      masks.push(mesh);
    }
  }

  /* ── the mountain on the left: black, its contours, its crest ── */
  {
    const xs = span(-19000, MOUNTAIN.foot + 50, 250);
    const zs = span(sz(360), Z_END, 300);
    const geo = heightfield(xs, zs, (x, z) => {
      const [h, c] = mountainAt(x, z);
      return [yRoad(z) + h, h, c];
    });
    const mesh = new THREE.Mesh(geo, terrainMaterial(U, { step: 500, k: 0.17, fade: 40000, crest: 0.24, foot: 0.08, beam: 3 }));
    mesh.frustumCulled = false;
    group.add(mesh);
    masks.push(mesh);
  }

  /* ── the cliffs that fall from the lip to the valley floor ── */
  const lipPts = resample(LIP, 600);
  {
    const NJ = 12;
    const pos = [];
    const aH = [];
    lipPts.forEach((p, i) => {
      const top = yRoad(p.z) - 1;
      for (let j = 0; j <= NJ; j++) {
        const t = j / NJ;
        const drop = (top - VY + 60) * t;
        const out = 0.12 * drop + (j ? fbm(i * 0.21, j * 0.7) * 650 * Math.pow(t, 0.6) : 0);
        pos.push(p.x + p.nx * out, top - drop, p.z + p.nz * out);
        aH.push(1, 0);
      }
    });
    const index = [];
    for (let i = 0; i < lipPts.length - 1; i++)
      for (let j = 0; j < NJ; j++) {
        const a = i * (NJ + 1) + j;
        index.push(a, a + 1, a + NJ + 1, a + 1, a + NJ + 2, a + NJ + 1);
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aH", new THREE.Float32BufferAttribute(aH, 2));
    geo.setIndex(index);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, terrainMaterial(U, { step: 1000, k: 0.13, fade: 60000 }));
    mesh.frustumCulled = false;
    group.add(mesh);
    masks.push(mesh);
  }

  /* ── the valley and its far side ── */
  {
    const xs = span(-360000, 260000, 5000);
    const zs = span(-340000, 380000, 5000);
    const geo = heightfield(xs, zs, (x, z) => {
      const [h, c] = farAt(x, z);
      return [VY + h, 1, c];
    });
    const mesh = new THREE.Mesh(geo, terrainMaterial(U, { step: 6000, k: 0.1, fade: 420000, floor: 0.2, floorFade: 7000, crest: 0.7 }));
    mesh.frustumCulled = false;
    group.add(mesh);
    masks.push(mesh);
  }

  /* ── the sky: night, a shade less black down at the horizon — the crests stand against it ── */
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 24),
    new THREE.ShaderMaterial({
      uniforms: { uInk: { value: INK.clone() }, uAmount: U.amount },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = position; // the dome follows the eye: always behind everything, the horizon level
          vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
          gl_Position = vec4(p.xy, p.w * 0.999999, p.w);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk; uniform float uAmount; varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float e = d.y;
          float air = e >= 0.0 ? 0.02 * exp(-e / 0.07) + 0.006 * exp(-e / 0.4) : 0.02 * exp(e / 0.006);
          gl_FragColor = vec4(uInk * air * uAmount, 1.0);
        }`,
    }),
  );
  sky.frustumCulled = false;
  sky.renderOrder = -20;
  group.add(sky);

  /* ── the lip: signal where the threat is (round the bottom), a fine ink line up the side ── */
  const lipLine = (pts, colours, width, base) => {
    const geo = new LineGeometry();
    geo.setPositions(pts.flatMap((p) => [p.x, yRoad(p.z) + 8, p.z]));
    geo.setColors(colours);
    const mat = lineMat(0xffffff, width, { vertexColors: true, opacity: base });
    const line = new Line2(geo, mat);
    line.computeLineDistances();
    line.frustumCulled = false;
    line.renderOrder = 4;
    group.add(line);
    return line;
  };
  const lipFine = resample(LIP, 300);
  const hotCol = [];
  const inkCol = [];
  for (const p of lipFine) {
    // signal from s 205 round the bend, dying 60 m past it; the ink line wherever the signal is not
    const s = -p.z / 100;
    const [, v] = roadUV(p.x, p.z);
    const k = p.x > 1000 ? smooth(205, 232, s) : 1 - smooth(V_TURN + 1500, V_TURN + 7000, v);
    hotCol.push(SIGNAL.r * k, SIGNAL.g * k, SIGNAL.b * k);
    const q = 0.5 * (1 - k) + 0.12;
    inkCol.push(INK.r * q, INK.g * q, INK.b * q);
  }
  const hotLip = lipLine(lipFine, hotCol, 2.6, 0.7);
  const inkLip = lipLine(lipFine, inkCol, 1.8, 0.6);

  /* ── the top of the col: a fine line across the shelf where the road goes over — from below, its silhouette ── */
  const crestLine = (() => {
    const z = sz(ROAD.top);
    const pts = span(MOUNTAIN.foot - 10, 1150, 50).flatMap((x) => [x, yRoad(z) + 3, z]);
    const geo = new LineGeometry();
    geo.setPositions(pts);
    const line = new Line2(geo, lineMat(BRAND.ink, 1.8, { opacity: 0.45 }));
    line.frustumCulled = false;
    line.renderOrder = 4;
    group.add(line);
    return line;
  })();

  /* ── the delineators every 25 m, both sides: what files past ── */
  const SPOTS = [];
  for (let s = -300; s <= CURVE.s; s += 25) {
    SPOTS.push([-(HALF + 100), 100 * s]);
    if (s < 190) SPOTS.push([HALF + 100, 100 * s]); // none by the sign nor on the lane's ground
  }
  for (let v = V_BEND + 2500; v < V_END - 3000; v += 2500) SPOTS.push([-(HALF + 100), v]); // round the bend's inside, and on
  const postGeo = [];
  const reflPos = [];
  const reflC = [];
  const reflIdx = [];
  const postMat = glass(BRAND.ink, { base: 0.01, rim: 0.22, power: 2.2, edge: 0.45, through: 0 });
  let postEdges = null;
  for (const [u, v] of SPOTS) {
    const [x, z] = roadXZ(u, v);
    const y = yRoad(z);
    const [x2, z2] = roadXZ(u, v + 100);
    const yaw = Math.atan2(x2 - x, z2 - z);
    postGeo.push(new THREE.BoxGeometry(11, 100, 11).translate(0, 50, 0).rotateY(yaw).translate(x, y, z).toNonIndexed());
    // its reflector, on the face toward the traffic coming down (and seen from behind the truck)
    const c = V3(x - 6.5 * Math.sin(yaw), y + 86, z - 6.5 * Math.cos(yaw));
    const n = reflPos.length / 3;
    const across = V3(Math.cos(yaw), 0, -Math.sin(yaw)).multiplyScalar(5.5);
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      reflPos.push(c.x + across.x * a, c.y + 8 * b, c.z + across.z * a);
      reflC.push(c.x, c.y, c.z);
    }
    reflIdx.push(n, n + 1, n + 2, n, n + 2, n + 3);
  }
  {
    const merged = new THREE.BufferGeometry();
    const all = postGeo.flatMap((geo) => [...geo.attributes.position.array]);
    const nrm = postGeo.flatMap((geo) => [...geo.attributes.normal.array]);
    merged.setAttribute("position", new THREE.Float32BufferAttribute(all, 3));
    merged.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
    const posts = new THREE.Mesh(merged, postMat);
    posts.frustumCulled = false;
    group.add(posts);
    asShell([posts], 21);
    const segs = [];
    for (const geo of postGeo) {
      const e = new THREE.EdgesGeometry(geo, 28).attributes.position;
      for (let i = 0; i < e.count; i++) segs.push(e.getX(i), e.getY(i), e.getZ(i));
    }
    const edges = new LineSegments2(new LineSegmentsGeometry().setPositions(segs), lineMat(BRAND.ink, 1.8, { opacity: 0.32 }));
    edges.frustumCulled = false;
    group.add(edges);
    postEdges = edges;
  }
  const reflMat = new THREE.ShaderMaterial({
    uniforms: { uInk: { value: INK.clone() }, uAmount: U.amount, uLamp: U.lamp, uBeam: U.beam },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform vec3 uLamp, uBeam; attribute vec3 aC; varying float vK;
      ${GLSL_BEAM}
      void main() {
        vK = 0.16 + 1.6 * beamAt(aC);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount; varying float vK;
      void main() { gl_FragColor = vec4(uInk * vK * uAmount, 1.0); }`,
  });
  {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(reflPos, 3));
    geo.setAttribute("aC", new THREE.Float32BufferAttribute(reflC, 3));
    geo.setIndex(reflIdx);
    const refl = new THREE.Mesh(geo, reflMat);
    refl.frustumCulled = false;
    refl.renderOrder = 7;
    group.add(refl);
  }

  /* ── the bend: its guard rail (glass lines) and its seven chevrons (signal) ── */
  const RAIL_U = HALF + 50;
  const CHEV_U = HALF + 90;
  const segs = [];
  {
    const v0 = V_BEND + R * 19 * DEG; // where the rail starts: clear of the lane's ground
    let prev = null;
    for (let v = v0; v <= V_END + 1; v += 200) {
      const [x, z] = roadXZ(RAIL_U, v);
      const y = yRoad(z);
      if (prev) for (const h of [48, 76]) segs.push(prev[0], prev[1] + h, prev[2], x, y + h, z);
      if (Math.round((v - v0) / 200) % 2 === 0) segs.push(x, y, z, x, y + 76, z);
      prev = [x, y, z];
    }
  }
  const CHEVRONS = Array.from({ length: CURVE.chevrons }, (_, i) => (23 + 6 * i) * DEG);
  const plateMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uK: { value: 1 }, uAmount: U.amount },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSignal; uniform float uK, uAmount; varying vec2 vUv;
      void main() {
        if (!gl_FrontFacing) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
        vec2 p = vUv - 0.5;
        // one chevron « < »: the bend goes left
        vec2 q = vec2(p.x, abs(p.y));
        vec2 a = vec2(-0.2, 0.0);
        vec2 ab = vec2(0.4, 0.34);
        float t = clamp(dot(q - a, ab) / dot(ab, ab), 0.0, 1.0);
        float d = length(q - a - t * ab);
        float w = max(fwidth(d), 1e-4);
        float stroke = 1.0 - smoothstep(0.085 - w, 0.085 + w, d);
        vec2 e = abs(p) - vec2(0.46);
        float rim = 1.0 - smoothstep(0.0, 2.0 * max(fwidth(p.x), 1e-4), abs(max(e.x, e.y)));
        gl_FragColor = vec4(uSignal * stroke * uK + uInk * rim * 0.06 * uAmount, 1.0);
      }`,
  });
  const halos = makeHalos(CURVE.chevrons, 9, BRAND.signal);
  const plates = CHEVRONS.map((phi, i) => {
    const [x, z] = [CX + (R + CHEV_U) * Math.cos(phi), CZ - (R + CHEV_U) * Math.sin(phi)];
    const y = yRoad(z);
    const fx = 0.25 * Math.sin(phi);
    const fz = 0.75 + 0.25 * Math.cos(phi);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), plateMat);
    plate.position.set(x, y + 128, z);
    plate.rotation.y = Math.atan2(fx, fz);
    group.add(plate); // not a mask of the place: the threat stays lit with `danger` whatever the X-ray does
    segs.push(x, y, z, x, y + 93, z);
    halos.put(i, x, y + 128, z, 260);
    return plate;
  });
  group.add(halos.points);
  const railLines = new LineSegments2(new LineSegmentsGeometry().setPositions(segs), lineMat(BRAND.ink, 1.8, { opacity: 0.5 }));
  railLines.frustumCulled = false;
  group.add(railLines);

  /* ── the village in the valley, the next file's house, the hamlets beyond ── */
  const rand = rng(11);
  const VILLAGE = [
    [0, 0, 900, 800, 600, 0], // the house of the next file: its window lights (`home`)
    [-1500, -1100, 800, 700, 560, 0.25], [1350, -700, 700, 650, 520, -0.15], [-2700, 400, 1000, 760, 640, 0.1],
    [2500, 900, 760, 700, 540, 0.35], [-600, -2600, 900, 820, 620, -0.3], [1600, -2900, 820, 700, 580, 0.2],
    [-3300, -2200, 700, 640, 500, 0.45], [3600, -1900, 860, 760, 600, -0.1],
  ];
  const houseGeo = [];
  const specks = [];
  for (const [dx, dz, w, d, h, rot] of VILLAGE) {
    const box = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
    const roofH = 0.36 * d;
    const roof = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-d / 2 - 30, 0), new THREE.Vector2(d / 2 + 30, 0), new THREE.Vector2(0, roofH)]), { depth: w + 60, bevelEnabled: false })
      .rotateY(Math.PI / 2)
      .translate(-(w + 60) / 2, h, 0);
    for (const part of [box, roof]) {
      const placedPart = part.rotateY(rot).translate(HOME[0] + dx, VY, HOME[2] + dz);
      houseGeo.push(placedPart.index ? placedPart.toNonIndexed() : placedPart);
    }
    if (dx || dz) {
      // a window or two lit in the others: a few points of light, no more
      const n = 1 + Math.floor(rand() * 2);
      for (let i = 0; i < n; i++) specks.push([HOME[0] + dx + (rand() - 0.5) * w * 0.6, VY + 180 + rand() * 120, HOME[2] + dz + d / 2 + 5, 0.35 + 0.35 * rand()]);
    }
  }
  // a street lamp or two, and the hamlets far beyond the bend
  specks.push([HOME[0] - 900, VY + 500, HOME[2] + 1500, 0.55], [HOME[0] + 2100, VY + 500, HOME[2] - 400, 0.45]);
  for (let i = 0; i < TOWN.n; i++) {
    // along its streets, the way a town's lights line up
    let x = (rand() - 0.5) * TOWN.w;
    let z = (rand() - 0.5) * TOWN.d * (1 - 0.5 * Math.abs(x / TOWN.w));
    if (rand() < 0.5) x = Math.round(x / TOWN.street) * TOWN.street;
    else z = Math.round(z / TOWN.street) * TOWN.street;
    specks.push([TOWN.x + x, VY + 150 + rand() * 300, TOWN.z + z, 0.35 + 0.55 * rand()]);
  }
  for (const [hx, hz, n] of HAMLETS)
    for (let i = 0; i < 2 * n; i++) specks.push([hx + (rand() - 0.5) * 9000, VY + 200, hz + (rand() - 0.5) * 6000, 0.4 + 0.5 * rand()]);
  const village = (() => {
    const merged = new THREE.BufferGeometry();
    merged.setAttribute("position", new THREE.Float32BufferAttribute(houseGeo.flatMap((geo) => [...geo.attributes.position.array]), 3));
    merged.setAttribute("normal", new THREE.Float32BufferAttribute(houseGeo.flatMap((geo) => [...geo.attributes.normal.array]), 3));
    const mesh = new THREE.Mesh(merged, glass(BRAND.ink, { base: 0.004, rim: 0.2, power: 2.4, edge: 0.4, through: 0.2 }));
    mesh.frustumCulled = false;
    group.add(mesh);
    asShell([mesh], 22);
    const seg = [];
    for (const geo of houseGeo) {
      const e = new THREE.EdgesGeometry(geo, 28).attributes.position;
      for (let i = 0; i < e.count; i++) seg.push(e.getX(i), e.getY(i), e.getZ(i));
    }
    const edges = new LineSegments2(new LineSegmentsGeometry().setPositions(seg), lineMat(BRAND.ink, 1.8, { opacity: 0.4 }));
    edges.frustumCulled = false;
    group.add(edges);
    return { mesh, edges };
  })();
  // the valley's road: its lamps, every 60 m or so (no line: on the floor, from the road, it read as a horizon)
  {
    const pts = resample(VALLEY_ROAD, 1500).map((p, i) => {
      const w = 900 * fbm(i * 0.17 + 4.2, 1.3); // it winds
      return { ...p, x: p.x + p.nx * w, z: p.z + p.nz * w };
    });
    pts.forEach((p, i) => {
      if (i % 4 === 1) specks.push([p.x + p.nx * 600, VY + 450, p.z + p.nz * 600, 0.4 + 0.35 * rand()]);
    });
  }
  const lights = makeSpecks(specks, 4.6);
  group.add(lights.points);
  // the house's window, on its front (toward the shelf): a pane that lights, and its halo
  const winMat = glow(BRAND.ink, 0, { additive: true });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(170, 130), winMat);
  win.position.set(HOME[0] - 150, VY + 270, HOME[2] + 400 + 2);
  group.add(win);
  const homeHalo = makeHalos(1, 6, BRAND.ink);
  homeHalo.put(0, win.position.x, win.position.y, win.position.z + 30, 900);
  group.add(homeHalo.points);

  /* ── anchors ── */
  const bendPhi = 34 * DEG;
  A.bend = anchor(group, CX + (R + HALF) * Math.cos(bendPhi), yRoad(CZ - (R + HALF) * Math.sin(bendPhi)) + 60, CZ - (R + HALF) * Math.sin(bendPhi));
  A.chevrons = plates[Math.floor(CURVE.chevrons / 2)];
  A.edge = anchor(group, BED.x, yRoad(sz(333)), sz(333));
  A.ravine = anchor(group, 0, yRoad(-30000) - 6000, -32000);
  A.valley = anchor(group, HOME[0], VY, HOME[2] + 3000);
  A.home = anchor(group, win.position.x, win.position.y, win.position.z);
  A.col = anchor(group, 0, yRoad(sz(ROAD.top)), sz(ROAD.top));
  A.panelSpot = anchor(group, PANEL.x, yRoad(sz(PANEL.s)), sz(PANEL.s));

  // the smear of what goes by: how far the headlamps moved while the shutter was open (measured between two samples of
  // one frame, which are 1/900 s apart — the time stops with `s`: nothing smears)
  let lastT = NaN;
  const lastLamp = V3();

  return {
    group, A,
    update(P, time, px) {
      const shell = P.shell ?? 1;
      const danger = P.danger ?? 0;
      const home = P.home ?? 0;
      group.visible = shell > 0.003 || danger > 0.003 || home > 0.003;
      U.amount.value = shell;
      for (const m of masks) m.visible = shell > 0.003;
      if (P.lamp) {
        const dt = Math.abs(time - lastT);
        if (dt > 1e-6 && dt < 0.02) U.smear.value = Math.min(60, (lastLamp.distanceTo(P.lamp) / dt) * SHUTTER);
        lastLamp.copy(P.lamp);
        lastT = time;
        U.lamp.value.copy(P.lamp);
      }
      if (P.beam) U.beam.value.copy(P.beam);
      // the threat at the bottom
      plateMat.uniforms.uK.value = 0.55 + 1.65 * danger;
      halos.uniforms.uAmount.value = 0.22 + 0.55 * danger;
      halos.uniforms.uScale.value = px;
      hotLip.material.opacity = 0.3 + 0.7 * danger;
      hotLip.material.color.setScalar(0.8 + 0.6 * danger);
      // the X-ray's lines
      inkLip.material.opacity = 0.6 * shell;
      crestLine.material.opacity = 0.45 * shell;
      railLines.material.opacity = 0.5 * shell;
      postEdges.material.opacity = 0.32 * shell;
      postMat.uniforms.uAmount.value = shell;
      village.mesh.material.uniforms.uAmount.value = shell;
      village.edges.material.opacity = 0.4 * shell;
      lights.uniforms.uAmount.value = shell;
      // the next file's window
      setGlow(winMat, 1.7 * home);
      homeHalo.uniforms.uAmount.value = 0.9 * home;
      homeHalo.uniforms.uScale.value = px;
    },
  };
}
