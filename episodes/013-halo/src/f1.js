// DOSSIER 013 — Halo : the rest of the car. A 2020 Formula 1 seen like an X-ray, around the survival cell
// that model.js builds (solid, not drawn here: its place is left empty — z −76 → 198).
//
//   buildCar() → { group, A, update(p, time, px) }      p = { shell, ahead, split, rival, fire }
//
// THE FRAME IS THE CAR'S: the cell never moves, the barrier comes to it (`ahead`, metres). So everything the
// barrier reaches leaves the car — and there is ONE law for it, `flung` in the shaders (`fling` for the wheels):
// a piece knows the `ahead` at which the face of the beams gets to it (`hitOf`, from plan.js: 29° across the
// car's path). From then on it stays WITH the barrier — in the car's frame it goes back as fast as the barrier
// comes —, bounces to the track side, slides along the steel, rises, turns on itself and comes to rest lying
// flat. Carbon does not fold, it comes apart: the skin is cut into rigid shards, its lines into sticks. With a
// barrier at 29° on the right the car is eaten on a diagonal: the right end of the front wing, the right front
// wheel, the nose, the right pod … the left front wheel last. One piece in twelve goes over the top beam; what flies fades out above two metres (the header is there).
//
//   glass   the nose and the front wing · the side pods, the bargeboards · the engine cover · the rear wing ·
//           the wishbones · four open wheels (a painted band on each wall shows them turn)
//   lines   taken on those same skins; the floor is its outline only (glass under the car would be a slab)
//   solid   what the voice calls "l'arrière": the engine, the gearbox, the exhaust — three greys
//
// Everything behind z = SPLIT.z is ONE group (`rear`): `split` tears it off the cell, hoses and looms snapping.
import * as THREE from "three";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glass, asShell, fatLine, box, cyl, lathe, placed, anchor, makePart, addMesh, setPartOpacity, SOFTBOX } from "@kit/build3d.js";
import { CAR, CELL, SPLIT, RIVAL, RAIL, FIRE } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.42, 0.16); // the hottest a spark gets: still signal, never cream
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/* ───────────────────────────────────────────────────────────── the barrier, as the car meets it */

const SIN = Math.sin(RAIL.angle * DEG);
const COS = Math.cos(RAIL.angle * DEG);
const FACE = 6; // the track-side face of the beams, from the barrier's centre line (cm)
const RANGE = 2.2; // metres of the barrier's travel a thrown piece takes to come to rest
const REST = 1; // …and how high it lies on the track (cm)
/** The `ahead` at which the face of the beams reaches the point (x, z) of the car. */
const hitOf = (x, z) => (z - RAIL.cross - (x * COS) / SIN + FACE / SIN) / 100;
const NEVER = -1;

// `gone`: 0 the piece is still on the car → 1 it lies on the track. `spun`: a direction of the piece, turned.
// `flung`: a point `p` of the piece whose centre is `c`. tip = the axis (level) and the angle that lay it flat,
// whole turns added; fly = how far from the steel it ends (cm, negative: over the top, on the other side), how
// far along it, how high it goes, how much it turns about the vertical.
const FLUNG_GLSL = /* glsl */ `
  uniform float uAhead; uniform float uTime;
  const vec3 BN = vec3(${COS.toFixed(5)}, 0.0, ${(-SIN).toFixed(5)}); // out of the barrier, toward the track
  const vec3 BT = vec3(${SIN.toFixed(5)}, 0.0, ${COS.toFixed(5)});   // along it, the way the car was going
  vec3 turn(vec3 v, vec3 axis, float a) { float c = cos(a); float s = sin(a); return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c); }
  float gone(float hit) { return clamp((hit - uAhead) / clamp(hit, 0.05, ${RANGE.toFixed(2)}), 0.0, 1.0); }
  vec3 spun(vec3 r, vec4 tip, vec4 fly, float v) {
    float e = 1.0 - (1.0 - v) * (1.0 - v);
    float air = 4.0 * v * (1.0 - v);
    r = turn(r, tip.xyz, tip.w * e + 0.3 * air * sin(uTime * 0.19 + fly.w * 5.0)); // held in the air, it still turns — slowly
    return turn(r, vec3(0.0, 1.0, 0.0), fly.w * e);
  }
  vec3 flung(vec3 p, vec3 c, vec4 tip, vec4 fly, float hit, float v) {
    if (v <= 0.0) return p;
    float e = 1.0 - (1.0 - v) * (1.0 - v); // fast at first, then afloat
    float air = 4.0 * v * (1.0 - v);
    float en = fly.x < 0.0 ? smoothstep(0.25, 1.0, v) : e; // one that goes over the barrier rises above it first
    vec3 q = c + vec3(0.0, 0.0, -100.0 * (hit - uAhead)) + BN * (fly.x * en) + BT * (fly.y * e);
    q.y = mix(c.y, ${REST.toFixed(1)}, v * v) + fly.z * air;
    vec3 at = q + spun(p - c, tip, fly, v);
    at.y = max(at.y, 0.4);
    return at;
  }`;

/** Where a thrown piece goes: [from the steel, along it, how high, turn about the vertical]. One in twelve goes over. */
function flight(rand) {
  const over = rand() < 0.083;
  return [over ? -(30 + rand() * 110) : 14 + Math.pow(rand(), 1.4) * 190, rand() * rand() * 260 - 25, over ? 105 + rand() * 60 : 10 + Math.pow(rand(), 2.4) * 120, (rand() - 0.5) * 9];
}
// what flies fades into the dark before it is as high as the header's labels (≈ 1.7 m in the hook's frame)
const FADE_GLSL = /* glsl */ `float lowEnough(float y) { return 1.0 - smoothstep(140.0, 205.0, y); }`;
const turns = (rand) => (Math.floor(rand() * 3) - 1) * 2 * Math.PI;
/** The turn that lays a sheet flat (its normal up), whole turns added: [axis, angle]. */
function flat(nx, ny, nz, rand) {
  let ax = -nz;
  let az = nx;
  const l = Math.hypot(ax, az);
  if (l < 1e-3) {
    const r = rand() * 6.283;
    ax = Math.cos(r);
    az = Math.sin(r);
  } else {
    ax /= l;
    az /= l;
  }
  return [ax, 0, az, Math.acos(Math.min(1, Math.max(-1, ny))) + turns(rand)];
}
/** …and the one that lays a stick level (`d`: its direction, a unit vector). */
function level(dx, dy, dz, rand) {
  let ax = -dz;
  let az = dx;
  const l = Math.hypot(ax, az);
  if (l < 1e-3) return [1, 0, 0, Math.PI / 2 + turns(rand)];
  return [ax / l, 0, az / l, -Math.asin(Math.min(1, Math.max(-1, dy))) + turns(rand)];
}

/* ───────────────────────────────────────────────────────────── the shape of the car */

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

// the nose cone, bolted on the cell's front bulkhead: long, slim, falling to a thumb tip
const NOSE_TOP = curve([[198, 46], [240, 42.5], [285, 35.5], [318, 28.5], [335, 24.5]]);
const NOSE_BOT = curve([[198, 13], [240, 15], [285, 17.5], [318, 19], [335, 20.5]]);
const NOSE_W = curve([[198, 16], [240, 14], [285, 11], [318, 8.2], [335, 6.4]]);
// the side pods and, behind the cell, the engine cover: half-width at the shoulder, height of the shoulder, the spine
const POD_W = curve([[-205, 11], [-170, 17], [-140, 26], [-110, 42], [-76, 60], [-40, 72], [0, 77], [40, 76], [84, 70]]);
const POD_H = curve([[-205, 22], [-170, 26], [-140, 30], [-110, 36], [-76, 46], [-40, 52], [0, 56.5], [40, 58.5], [84, 57]]);
const SPINE = curve([[-205, 37], [-190, 44], [-160, 58], [-130, 72], [-100, 84], [-76, 90]]);
const SPINE_W = curve([[-205, 6], [-150, 8], [-76, 11.5]]);
/** The cell's own flank (model.js draws it): the pods end against it. */
const cellHalf = (z) => (z <= 46 ? CELL.half : mix(CELL.half, CELL.halfFront, clamp01((z - 46) / (CELL.z1 - 46))));

const NK = 7; // rows of a flank, from its foot to its shoulder
const NT = 6; // …of the top of a pod, from the shoulder to the cell
const NS = 9; // …of the engine cover, from the shoulder up to the spine
const NC = 3; // …of the spine's crown
const flank = (z, out) => {
  const W = POD_W(z);
  const H = POD_H(z);
  const front = smooth(10, 84, z); // toward its mouth a pod is cut away underneath
  const x0 = W - 8 - 12 * front;
  const y0 = 8 + 15 * front;
  for (let i = 0; i < NK; i++) {
    const t = i / (NK - 1);
    out.push([mix(x0, W, 1 - (1 - t) ** 2.2), mix(y0, H - 7, t)]);
  }
};
/** Half a section of a side pod at `z` (−76 … 84): [x, y] from the foot of the flank to the cell. */
function podHalf(z) {
  const W = POD_W(z);
  const H = POD_H(z);
  const out = [];
  flank(z, out);
  const xin = cellHalf(z) + 1;
  for (let i = 1; i <= NT; i++) {
    const u = i / NT;
    if (u <= 0.5) {
      const q = u / 0.5;
      const r = 1 - q;
      out.push([r * r * W + 2 * q * r * (W - 0.5) + q * q * (W - 11), r * r * (H - 7) + 2 * q * r * (H + 0.5) + q * q * (H + 1.4)]);
    } else out.push([mix(W - 11, xin, (u - 0.5) / 0.5), mix(H + 1.4, H + 2.2, (u - 0.5) / 0.5)]);
  }
  return out;
}
/** Half a section of the engine cover at `z` (−205 … −76): from the foot of the flank, over the shoulder, up to the spine. */
function coverHalf(z) {
  const W = POD_W(z);
  const H = POD_H(z);
  const T = SPINE(z);
  const ws = SPINE_W(z);
  const out = [];
  flank(z, out);
  for (let i = 1; i <= NS; i++) {
    const f = Math.pow(i / NS, 0.8);
    out.push([mix(W, ws, f), H - 7 + (T - 4 - (H - 7)) * Math.pow(f, 1.8)]);
  }
  for (let i = 1; i <= NC; i++) {
    const a = ((i / NC) * Math.PI) / 2;
    out.push([ws * Math.cos(a), T - 4 + 4 * Math.sin(a)]);
  }
  return out;
}

/* ───────────────────────────────────────────────────────────── skins and lines that can come apart */

const BOXL = (() => {
  const c = V(...SOFTBOX.pos);
  const d = c.length();
  c.normalize();
  const u = V().crossVectors(UP, c).normalize();
  return { c, u, v: V().crossVectors(c, u), size: V(SOFTBOX.w / 2, SOFTBOX.h / 2, d) };
})();

/**
 * The glass of the car: the kit's glass (same uniforms: `asShell` makes its two other layers out of it), whose
 * pieces can be thrown — a shard that turns catches the key light as it turns — and which takes the colour of
 * the fire on what looks at it (`uFire`).
 */
function carGlass({ color = INK, base = 0.01, rim = 0.32, power = 2.3, edge = 0.34, spec = 0.4, through = 0.22 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: color.clone() }, uBase: { value: base }, uRim: { value: rim }, uPower: { value: power }, uAmount: { value: 1 },
      uEdge: { value: edge }, uSpec: { value: spec }, uGain: { value: 1 },
      uAhead: { value: 60 }, uTime: { value: 0 }, uFire: { value: 0 }, uFireAt: { value: V(...FIRE.seat) }, uSignal: { value: SIGNAL.clone() },
      uBoxC: { value: BOXL.c }, uBoxU: { value: BOXL.u }, uBoxV: { value: BOXL.v }, uBoxSize: { value: BOXL.size },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aCentre; attribute vec4 aTip; attribute vec4 aFly; attribute float aHit;
      varying vec3 vN; varying vec3 vV; varying vec3 vW; varying vec3 vWN; varying float vGone;
      ${FLUNG_GLSL}
      void main() {
        float v = gone(aHit);
        vec3 p = flung(position, aCentre, aTip, aFly, aHit, v);
        vec3 n = v > 0.0 ? spun(normal, aTip, aFly, v) : normal;
        vec4 w = modelMatrix * vec4(p, 1.0);
        vec4 mv = viewMatrix * w;
        vN = normalize(normalMatrix * n);
        vV = normalize(-mv.xyz);
        vW = w.xyz;
        vWN = mat3(modelMatrix) * n;
        vGone = v;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uSignal, uFireAt, uBoxC, uBoxU, uBoxV, uBoxSize; uniform float uBase, uRim, uPower, uAmount, uEdge, uSpec, uGain, uFire;
      varying vec3 vN; varying vec3 vV; varying vec3 vW; varying vec3 vWN; varying float vGone;
      ${FADE_GLSL}
      void main() {
        if (uAmount < 0.003 || (vGone > 0.0 && vW.y > 205.0)) discard; // faded out, a shell must not hide the ones behind it
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        float facing = dot(n, v);
        float g = clamp(1.0 - abs(facing), 0.0, 1.0); // clamp before pow
        float light = uBase + uRim * pow(g, uPower) + uEdge * smoothstep(0.6, 0.97, g);
        if (uSpec > 0.0) {
          vec3 r = (vec4(reflect(-v, facing < 0.0 ? -n : n), 0.0) * viewMatrix).xyz;
          float toward = dot(r, uBoxC);
          vec3 p = r * (uBoxSize.z / max(toward, 1e-3));
          vec2 q = abs(vec2(dot(p, uBoxU), dot(p, uBoxV))) / uBoxSize.xy;
          light += uSpec * (0.3 + 0.7 * g) * smoothstep(0.0, 0.3, toward) * (1.0 - smoothstep(0.2, 1.9, length(q)));
        }
        if (vGone > 0.0) {
          // a shard is read by its glint: the face that looks at the key light catches it
          vec3 toKey = normalize((viewMatrix * vec4(-0.42, 0.73, 0.54, 0.0)).xyz);
          light = (light * mix(1.0, 0.22, vGone) + (0.012 + 0.5 * pow(clamp(abs(dot(n, toKey)), 0.0, 1.0), 6.0)) * (1.0 - 0.8 * vGone * vGone)) * lowEnough(vW.y);
        }
        vec3 toFire = uFireAt - vW;
        float d = length(toFire);
        float lick = uFire * exp(-d / 240.0) * (0.35 + 0.65 * abs(dot(normalize(vWN + vec3(0.0, 1e-5, 0.0)), toFire / max(d, 1.0))));
        vec3 col = mix(uColor, uSignal, clamp(1.5 * lick, 0.0, 0.92)) * light * (1.0 + 1.2 * lick);
        gl_FragColor = vec4(col * uAmount * uGain, 1.0);
      }`,
  });
  mat.userData.through = through;
  return mat;
}

/**
 * The lines of the car, in screen pixels (instanced quads, as LineSegments2): each stick has its own width and
 * strength (`instanceLook`), can be thrown like any piece, steps back with depth (full on the near side of what
 * it draws, `far` on its far side — `centre` and `reach` in the mesh's own frame) and takes the colour of the fire.
 */
function carLines({ color = INK, hdr = 1, far = 0.3, reach = 250, centre = [0, 40, 100] } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: color.clone().multiplyScalar(hdr) }, uSignal: { value: SIGNAL.clone().multiplyScalar(1.7) }, uRes: { value: RES }, uAmount: { value: 1 }, uFar: { value: far },
      uCentre: { value: V(...centre) }, uReach: { value: reach }, uAhead: { value: 60 }, uTime: { value: 0 }, uFire: { value: 0 }, uFireAt: { value: V(...FIRE.seat) },
    },
    vertexShader: /* glsl */ `
      uniform float uReach; uniform vec2 uRes; uniform vec3 uCentre;
      attribute vec3 instanceStart; attribute vec3 instanceEnd; attribute vec4 instanceTip; attribute vec4 instanceFly; attribute float instanceHit; attribute vec2 instanceLook;
      varying vec2 vUv; varying float vDepth; varying float vAlpha; varying vec3 vW;
      ${FLUNG_GLSL}
      ${FADE_GLSL}
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
        float v = gone(instanceHit);
        vec3 mid = 0.5 * (instanceStart + instanceEnd);
        vec3 a = flung(instanceStart, mid, instanceTip, instanceFly, instanceHit, v);
        vec3 b = flung(instanceEnd, mid, instanceTip, instanceFly, instanceHit, v);
        vec4 start = modelViewMatrix * vec4(a, 1.0);
        vec4 end = modelViewMatrix * vec4(b, 1.0);
        if (start.z < 0.0 && end.z >= 0.0) trim(start, end);
        else if (end.z < 0.0 && start.z >= 0.0) trim(end, start);
        vec4 clipStart = projectionMatrix * start;
        vec4 clipEnd = projectionMatrix * end;
        float aspect = uRes.x / uRes.y;
        vec2 dir = clipEnd.xy / (abs(clipEnd.w) > 1e-6 ? clipEnd.w : 1e-6) - clipStart.xy / (abs(clipStart.w) > 1e-6 ? clipStart.w : 1e-6);
        dir.x *= aspect;
        float len = length(dir);
        dir = len > 1e-7 ? dir / len : vec2(1.0, 0.0); // a stick seen end-on has no direction: never divide by its length
        vec2 offset = vec2(dir.y, -dir.x);
        dir.x /= aspect;
        offset.x /= aspect;
        if (position.x < 0.0) offset *= -1.0;
        if (position.y < 0.0) offset -= dir; else if (position.y > 1.0) offset += dir;
        vec4 clip = position.y < 0.5 ? clipStart : clipEnd;
        clip.xy += offset * (instanceLook.x / uRes.y) * clip.w;
        gl_Position = clip;
        float z = position.y < 0.5 ? start.z : end.z;
        vDepth = ((viewMatrix * modelMatrix * vec4(uCentre, 1.0)).z - z) / uReach;
        vW = (modelMatrix * vec4(position.y < 0.5 ? a : b, 1.0)).xyz;
        vAlpha = instanceLook.y * (v > 0.0 ? mix(0.6, 0.32, v) * lowEnough(vW.y) : 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uSignal, uFireAt; uniform float uAmount, uFar, uFire;
      varying vec2 vUv; varying float vDepth; varying float vAlpha; varying vec3 vW;
      void main() {
        float al = uAmount * vAlpha;
        if (al < 0.003) discard;
        if (abs(vUv.y) > 1.0) { // round ends
          float b = abs(vUv.y) - 1.0;
          if (vUv.x * vUv.x + b * b > 1.0) discard;
        }
        float k = clamp(0.5 + 0.5 * vDepth, 0.0, 1.0);
        float fade = mix(1.0, uFar, k * k * (3.0 - 2.0 * k));
        float lick = clamp(1.7 * uFire * exp(-distance(vW, uFireAt) / 230.0), 0.0, 0.95);
        gl_FragColor = vec4(mix(uColor, uSignal, lick), al * mix(fade, max(fade, 0.7), lick));
      }`,
  });
}

/**
 * A skin: grids of points turned into triangles and — where it `breaks` — cut into shards, a few quads each,
 * laid like bricks. Every vertex of a shard carries the shard's centre, the turn that lays it flat, its flight
 * and the `ahead` at which the barrier reaches it.
 */
function makeSkin(seed) {
  const rand = rng(seed);
  const pos = [];
  const nor = [];
  const cen = [];
  const tip = [];
  const fly = [];
  const hit = [];
  const centres = []; // [x, y, z, hit] of every shard: where the smaller flakes come from
  const a = V();
  const b = V();
  const n = V();
  const skin = {
    centres,
    /** `pts[i][j]` = [x, y, z]. `wrap`: the rows close on themselves (a tube). `block`: quads to a shard, each way. */
    grid(pts, { breaks = true, wrap = false, block = 3, hold = null } = {}) {
      const nu = pts.length;
      const nv = pts[0].length;
      const at = (i, j) => pts[Math.min(nu - 1, Math.max(0, i))][wrap ? (j + nv) % nv : Math.min(nv - 1, Math.max(0, j))];
      const nrm = pts.map((row, i) =>
        row.map((_, j) => {
          const p0 = at(i - 1, j);
          const p1 = at(i + 1, j);
          const q0 = at(i, j - 1);
          const q1 = at(i, j + 1);
          n.crossVectors(a.set(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]), b.set(q1[0] - q0[0], q1[1] - q0[1], q1[2] - q0[2]));
          return n.lengthSq() < 1e-10 ? [0, 1, 0] : n.normalize().toArray(); // a row gathered in one point has no face: never hand the shader a null normal
        }),
      );
      const cu = nu - 1;
      const cv = wrap ? nv : nv - 1;
      const bu = breaks ? block + (rand() < 0.5 ? 1 : 0) : 1e9;
      const bv = breaks ? block + (rand() < 0.5 ? 1 : 0) : 1e9;
      // a shard: half a block of quads, cut along one of its diagonals — a triangle with a stepped edge, not a sheet of paper
      const TRIS = [[[0, 0], [1, 0], [0, 1]], [[0, 1], [1, 0], [1, 1]]];
      const shards = new Map();
      const flips = new Map();
      for (let i = 0; i < cu; i++) {
        for (let j = 0; j < cv; j++) {
          const jb = Math.floor(j / bv);
          const io = i + (jb % 2) * Math.floor(bu / 2);
          const ib = Math.floor(io / bu);
          const block = ib * 4096 + jb;
          if (!flips.has(block)) flips.set(block, rand() < 0.5);
          TRIS.forEach((tri, t) => {
            const u = (io - ib * bu + (t + 1) / 3) / bu;
            const w = (j - jb * bv + (t + 1) / 3) / bv;
            const key = breaks ? block * 2 + ((flips.get(block) ? u > w : u + w > 1) ? 1 : 0) : 0;
            if (!shards.has(key)) shards.set(key, []);
            shards.get(key).push(tri.map(([di, dj]) => [i + di, wrap ? (j + dj) % nv : j + dj]));
          });
        }
      }
      for (const tris of shards.values()) {
        let cx = 0;
        let cy = 0;
        let cz = 0;
        n.set(0, 0, 0);
        for (const tri of tris) {
          const [p, q, r] = tri.map(([i, j]) => pts[i][j]);
          cx += (p[0] + q[0] + r[0]) / 3;
          cy += (p[1] + q[1] + r[1]) / 3;
          cz += (p[2] + q[2] + r[2]) / 3;
          n.add(a.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]).cross(b.set(r[0] - p[0], r[1] - p[1], r[2] - p[2])));
        }
        cx /= tris.length;
        cy /= tris.length;
        cz /= tris.length;
        if (n.lengthSq() < 1e-10) n.set(0, 1, 0);
        n.normalize();
        const h = breaks ? (hold ? hold(cx, cz, hitOf(cx, cz)) : hitOf(cx, cz)) + (rand() - 0.5) * 0.05 : NEVER;
        const t = breaks ? flat(n.x, n.y, n.z, rand) : [1, 0, 0, 0];
        const f = breaks ? flight(rand) : [0, 0, 0, 0];
        if (breaks) centres.push([cx, cy, cz, h]);
        for (const tri of tris) {
          for (const [i, j] of tri) {
            pos.push(...pts[i][j]);
            nor.push(...nrm[i][j]);
            cen.push(cx, cy, cz);
            tip.push(...t);
            fly.push(...f);
            hit.push(h);
          }
        }
      }
      return skin;
    },
    /** A rod from `p` to `q` (a wishbone, a link). `breaks`: the barrier snaps it in two splinters. */
    tube(p, q, r = 1.6, breaks = false, sides = 8) {
      a.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]).normalize();
      b.crossVectors(a, Math.abs(a.y) > 0.9 ? V(1, 0, 0) : UP).normalize();
      n.crossVectors(a, b);
      const ring = (c) => Array.from({ length: sides }, (_, j) => {
        const phi = (2 * Math.PI * j) / sides;
        return [c[0] + r * (Math.cos(phi) * b.x + Math.sin(phi) * n.x), c[1] + r * (Math.cos(phi) * b.y + Math.sin(phi) * n.y), c[2] + r * (Math.cos(phi) * b.z + Math.sin(phi) * n.z)];
      });
      return skin.grid([ring(p), ring(q)], { breaks, wrap: true, block: 64 });
    },
    build(material) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
      geo.setAttribute("aCentre", new THREE.Float32BufferAttribute(cen, 3));
      geo.setAttribute("aTip", new THREE.Float32BufferAttribute(tip, 4));
      geo.setAttribute("aFly", new THREE.Float32BufferAttribute(fly, 4));
      geo.setAttribute("aHit", new THREE.Float32BufferAttribute(hit, 1));
      const mesh = new THREE.Mesh(geo, material);
      mesh.frustumCulled = false; // its shards leave it
      return mesh;
    },
  };
  return skin;
}

/** Lines: polylines cut into sticks (9 cm at most where they break: a stick is thrown whole). */
function makeLines(seed) {
  const rand = rng(seed);
  const P = [];
  const tip = [];
  const fly = [];
  const hit = [];
  const look = [];
  const lines = {
    /** `w`: width in pixels (never under 1.8) · `a`: strength, a number or a function of the point. */
    run(pts, { w = 2, a = 1, breaks = true, hold = null } = {}) {
      for (let i = 0; i < pts.length - 1; i++) {
        const p = pts[i];
        const q = pts[i + 1];
        const len = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
        if (len < 1e-4) continue;
        const cuts = breaks ? Math.max(1, Math.ceil(len / 9)) : 1;
        for (let k = 0; k < cuts; k++) {
          const s = [mix(p[0], q[0], k / cuts), mix(p[1], q[1], k / cuts), mix(p[2], q[2], k / cuts)];
          const e = [mix(p[0], q[0], (k + 1) / cuts), mix(p[1], q[1], (k + 1) / cuts), mix(p[2], q[2], (k + 1) / cuts)];
          const m = [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2, (s[2] + e[2]) / 2];
          P.push(...s, ...e);
          tip.push(...(breaks ? level((q[0] - p[0]) / len, (q[1] - p[1]) / len, (q[2] - p[2]) / len, rand) : [1, 0, 0, 0]));
          fly.push(...(breaks ? flight(rand) : [0, 0, 0, 0]));
          hit.push(breaks ? (hold ? hold(m[0], m[2], hitOf(m[0], m[2])) : hitOf(m[0], m[2])) + (rand() - 0.5) * 0.05 : NEVER);
          look.push(w, typeof a === "function" ? a(m) : a);
        }
      }
      return lines;
    },
    /** A circle of radius `r` around the x axis, at `x` (a wheel is drawn with them: they may turn, nothing shows). */
    circle(r, x, o, n = 72) {
      return lines.run(Array.from({ length: n + 1 }, (_, i) => [x, r * Math.cos((2 * Math.PI * i) / n), r * Math.sin((2 * Math.PI * i) / n)]), { ...o, breaks: false });
    },
    build(material) {
      const geo = new LineSegmentsGeometry().setPositions(P);
      geo.setAttribute("instanceTip", new THREE.InstancedBufferAttribute(new Float32Array(tip), 4));
      geo.setAttribute("instanceFly", new THREE.InstancedBufferAttribute(new Float32Array(fly), 4));
      geo.setAttribute("instanceHit", new THREE.InstancedBufferAttribute(new Float32Array(hit), 1));
      geo.setAttribute("instanceLook", new THREE.InstancedBufferAttribute(new Float32Array(look), 2));
      const mesh = new THREE.Mesh(geo, material);
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;
      return mesh;
    },
  };
  return lines;
}

/** The smallest of what the barrier throws: flakes of carbon, born where the skin breaks, unseen until then. */
function makeFlakes(count, seed, centres) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-0.5, -0.36, 0, 0.62, -0.2, 0, -0.08, 0.56, 0], 3));
  const origin = new Float32Array(count * 3);
  const tip = new Float32Array(count * 4);
  const fly = new Float32Array(count * 4);
  const seeds = new Float32Array(count * 2); // hit, size (cm)
  for (let i = 0; i < count; i++) {
    const c = centres[Math.floor(rand() * centres.length)];
    origin.set([c[0] + (rand() - 0.5) * 14, Math.max(3, c[1] + (rand() - 0.5) * 10), c[2] + (rand() - 0.5) * 14], i * 3);
    tip.set([-1, 0, 0, Math.PI / 2 + turns(rand) + (rand() < 0.5 ? 2 * Math.PI : 0)], i * 4);
    const f = flight(rand);
    f[2] *= 1.25;
    fly.set(f, i * 4);
    seeds.set([c[3] + (rand() - 0.5) * 0.08, 1.8 + Math.pow(rand(), 2) * 5.4], i * 2);
  }
  geo.setAttribute("aOrigin", new THREE.InstancedBufferAttribute(origin, 3));
  geo.setAttribute("aTip", new THREE.InstancedBufferAttribute(tip, 4));
  geo.setAttribute("aFly", new THREE.InstancedBufferAttribute(fly, 4));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 2));
  geo.instanceCount = count;
  const uniforms = { uAhead: { value: 60 }, uTime: { value: 0 }, uAmount: { value: 1 }, uColor: { value: INK.clone() } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aOrigin; attribute vec4 aTip; attribute vec4 aFly; attribute vec2 aSeed; varying float vLight;
        ${FLUNG_GLSL}
        ${FADE_GLSL}
        void main() {
          float v = gone(aSeed.x);
          if (v <= 0.0) { vLight = 0.0; gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          vec3 p = flung(aOrigin + position * aSeed.y, aOrigin, aTip, aFly, aSeed.x, v);
          vec3 n = spun(vec3(0.0, 0.0, 1.0), aTip, aFly, v);
          float glint = abs(dot(n, normalize(vec3(-0.5, 0.62, 0.6))));
          vLight = (0.08 + 1.1 * pow(clamp(glint, 0.0, 1.0), 4.0)) * smoothstep(0.0, 0.04, v) * (1.0 - 0.7 * v * v) * lowEnough((modelMatrix * vec4(p, 1.0)).y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying float vLight;
        void main() {
          if (uAmount * vLight < 0.003) discard;
          gl_FragColor = vec4(uColor * vLight * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/** What a tear throws: shards that leave a ring, fast at first and then afloat, turning, and come to rest on the track. */
function makeBurst(count, seed, at) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-0.5, -0.36, 0, 0.62, -0.2, 0, -0.08, 0.56, 0], 3));
  const origin = new Float32Array(count * 3);
  const dir = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // reach (cm), spin, phase, size (cm)
  const d = V();
  for (let i = 0; i < count; i++) {
    const [x, y, z] = at(rand);
    origin.set([x, y, z], i * 3);
    d.set((x / 60) * 0.8 + (rand() - 0.5) * 0.9, ((y - 40) / 45) * 0.5 + 0.15 + rand() * 0.7, -0.15 - rand() * 0.9).normalize();
    dir.set([d.x, d.y, d.z], i * 3);
    seeds.set([24 + Math.pow(rand(), 1.6) * 190, 2 + rand() * 7, rand() * 6.283, 1.6 + Math.pow(rand(), 2) * 5.6], i * 4);
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
          float fly = 1.0 - (1.0 - k) * (1.0 - k);
          float a = aSeed.z + aSeed.y * (fly * 2.4 + uTime * 0.11 * (1.0 - k));
          vec3 axis = normalize(vec3(sin(aSeed.z * 3.1), cos(aSeed.z * 1.7), sin(aSeed.z * 5.3 + 1.0)) + vec3(0.02, 0.01, 0.03));
          vec3 n = turn(vec3(0.0, 0.0, 1.0), axis, a);
          vec3 p = aOrigin + aDir * (aSeed.x * fly + 1.5 * sin(uTime * 0.23 + aSeed.z) * (1.0 - k)) + turn(position * aSeed.w, axis, a);
          p.y = max(mix(p.y, 0.7, k * k * k), 0.7); // they come to rest on the track
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
  mesh.visible = false;
  return { mesh, uniforms };
}

/**
 * Sparks: thin streaks that leave one point over and over (alive on the first frame, and slow: the film is in
 * slow motion), each drawn along its own way, long while it is fast, dying as it goes.
 */
function makeSparks(count, seed, at) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)); // x: along the streak · y: across
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const dir = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // reach (cm), half-length (cm), phase, width (cm)
  const d = V();
  for (let i = 0; i < count; i++) {
    d.set((rand() - 0.5) * 1.1, 0.05 + rand() * 0.95, -(0.35 + rand())).normalize(); // thrown back and up: the tyres turn that way where they meet
    dir.set([d.x, d.y, d.z], i * 3);
    seeds.set([26 + Math.pow(rand(), 1.4) * 120, 3 + rand() * 8, rand(), 0.55 + rand() * 0.8], i * 4);
  }
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(dir, 3));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
  geo.instanceCount = count;
  const uniforms = { uAt: { value: V(...at) }, uTime: { value: 0 }, uAmount: { value: 0 }, uScale: { value: 1600 }, uRes: { value: RES }, uColor: { value: HOT.clone().multiplyScalar(2.2) } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uScale; uniform vec2 uRes; uniform vec3 uAt; attribute vec3 aDir; attribute vec4 aSeed; varying vec2 vQ; varying float vA;
        void main() {
          float life = fract(aSeed.z + uTime * (0.22 + 0.2 * fract(aSeed.z * 7.3)));
          float fly = 1.0 - (1.0 - life) * (1.0 - life);
          vec3 c = uAt + aDir * aSeed.x * fly;
          c.y -= 26.0 * life * life;
          float h = aSeed.y * mix(1.0, 0.35, life);
          vec3 way = normalize(aDir + vec3(0.0, -0.9 * life, 0.0));
          vec4 a = projectionMatrix * modelViewMatrix * vec4(c - way * h, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(c + way * h, 1.0);
          vQ = position.xy;
          vA = pow(1.0 - life, 1.5) * smoothstep(0.0, 0.05, life);
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
  mesh.renderOrder = 7;
  mesh.visible = false;
  return { mesh, uniforms };
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

/** The band painted on a tyre's wall: two broad arcs with soft ends — still, they show; turning, the shutter draws a ring. */
function bandMat(color) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    uniforms: { uColor: { value: color.clone() }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vQ;
      void main() {
        vQ = position.yz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vQ;
      void main() {
        if (uAmount < 0.003) discard;
        float r = length(vQ);
        float arcs = smoothstep(0.2, 0.8, abs(vQ.y) / max(r, 1.0));
        float ring = smoothstep(21.5, 23.0, r) * (1.0 - smoothstep(28.6, 30.1, r));
        gl_FragColor = vec4(uColor * (0.03 + 0.17 * arcs) * ring * uAmount, 1.0);
      }`,
  });
}

/* ───────────────────────────────────────────────────────────── the pieces */

function buildNose(skin, lines) {
  const zs = [];
  for (let z = CELL.z1; z < 327; z += 6.45) zs.push(z);
  zs.push(328, 330.5, 332.6, 334, 334.8, CAR.nose);
  const N = 24;
  const at = (z, phi) => {
    const k = z <= 327 ? 1 : Math.sqrt(Math.max(0, 1 - ((z - 327) / 8.02) ** 2)); // the tip is rounded off
    const top = NOSE_TOP(z);
    const bot = NOSE_BOT(z);
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    return [NOSE_W(z) * k * Math.sign(c) * Math.abs(c) ** 0.62, (top + bot) / 2 + ((top - bot) / 2) * k * Math.sign(s) * Math.abs(s) ** 0.62, z];
  };
  skin.grid(zs.map((z) => Array.from({ length: N }, (_, j) => at(z, (2 * Math.PI * j) / N))), { wrap: true, block: 3 });
  for (const [phi, w, a] of [[45, 2.5, 1], [135, 2.5, 1], [225, 1.9, 0.65], [315, 1.9, 0.65]]) lines.run(zs.map((z) => at(z, phi * DEG)), { w, a });
  for (const [z, w, a] of [[CELL.z1, 2.6, 1], [262, 1.9, 0.55]]) lines.run(Array.from({ length: N + 1 }, (_, j) => at(z, (2 * Math.PI * j) / N)), { w, a });
}

const PILLARS = hitOf(7.6, 311); // when the barrier is at the pillars that carry the front wing
/** The far (left) half of the front wing cannot stay once they are gone: it lets go from the middle outward. */
const wingHold = (x, z, h) => Math.max(h, PILLARS - 0.12 - 0.5 * (Math.max(0, x) / 100));
const zLE = (ax) => (ax < 25 ? 324 : 324 - 12 * ((ax - 25) / 73) ** 1.3); // the front wing's leading edge sweeps back toward its ends
/** The front wing: a main plane right across, three flaps a side rising behind it, the end plates, the two pillars. `from`: only its end beyond that x (the other car's). */
function buildFrontWing(skin, lines, { sides = [-1, 1], from = 0, breaks = true, fade = null } = {}) {
  const hold = breaks ? wingHold : null;
  const o = { breaks, block: 2, hold };
  const al = (a) => (fade ? (p) => a * fade(p) : a);
  const span = (x0, x1, n) => Array.from({ length: n }, (_, i) => mix(x0, x1, i / (n - 1)));
  const main = (x, w) => [x, 8.6 + 2.6 * w - 1.7 * Math.sin(Math.PI * w), zLE(Math.abs(x)) - 22 * w];
  const xsMain = from ? span(from, 98, 9) : span(-98, 98, 37);
  skin.grid(xsMain.map((x) => [0, 0.34, 0.67, 1].map((w) => main(x, w))), o);
  lines.run(xsMain.map((x) => main(x, 0)), { w: 2.6, a: al(1), breaks, hold });
  lines.run(xsMain.map((x) => main(x, 1)), { w: 1.9, a: al(0.6), breaks, hold });
  for (const s of sides) {
    const xs = span(Math.max(from, 27), 97, from ? 8 : 15);
    for (let k = 1; k <= 3; k++) {
      const flap = (ax, w) => {
        const ck = 0.45 + 0.55 * smooth(27, 46, ax); // a flap narrows to a tip beside the neutral middle of the wing
        const lift = 1 - 0.3 * smooth(58, 97, ax);
        return [s * ax, 11.2 + 4.9 * (k - 1) * lift + 5.8 * lift * w - 0.9 * Math.sin(Math.PI * w), zLE(ax) - 20 - 12.6 * (k - 1) * ck - 14.6 * ck * w];
      };
      skin.grid(xs.map((ax) => [0, 0.5, 1].map((w) => flap(ax, w))), o);
      lines.run(xs.map((ax) => flap(ax, 0)), { w: 1.9, a: al(0.7), breaks, hold });
      if (k === 3) lines.run(xs.map((ax) => flap(ax, 1)), { w: 2.4, a: al(1), breaks, hold });
      if (!from) lines.run([flap(27, 0), flap(27, 1)], { w: 1.9, a: 0.7, breaks, hold });
    }
    const plate = (tz, ty) => [s * (98.6 + 2.2 * ty * tz), mix(6.4, mix(19, 31.5, smooth(0, 1, tz)), ty), mix(327, 262, tz)];
    const tzs = [0, 0.17, 0.34, 0.5, 0.67, 0.84, 1];
    skin.grid(tzs.map((tz) => [0, 0.34, 0.67, 1].map((ty) => plate(tz, ty))), o);
    lines.run([plate(0, 0), ...tzs.map((tz) => plate(tz, 1)), plate(1, 0), plate(0, 0)], { w: 2.5, a: 1, breaks, hold });
    if (!from) {
      const pillar = (z, t) => [s * 7.6, mix(10.4, NOSE_BOT(z) + 0.6, t), z];
      skin.grid([300, 311, 322].map((z) => [0, 0.5, 1].map((t) => pillar(z, t))), o);
      lines.run([pillar(322, 0), pillar(322, 1)], { w: 1.9, a: 0.7, breaks, hold });
      lines.run([pillar(300, 0), pillar(300, 1)], { w: 1.9, a: 0.5, breaks, hold });
    }
  }
}

function buildPods(skin, lines) {
  const zs = [];
  for (let z = 84; z > SPLIT.z - 0.01; z -= 8) zs.push(z);
  for (const s of [-1, 1]) {
    const rows = zs.map((z) => podHalf(z).map(([x, y]) => [s * x, y, z]));
    skin.grid(rows, { block: 3 });
    lines.run(rows.map((r) => r[NK - 1]), { w: 2.5, a: 1 }); // the shoulder
    lines.run(rows.map((r) => r[0]), { w: 1.9, a: 0.6 }); // the foot of the flank
    lines.run(rows.map((r) => r[NK + 2]), { w: 1.9, a: 0.45 }); // the edge of the top
    const m = rows[0];
    lines.run([...m, [m.at(-1)[0], m[0][1], 84], m[0]], { w: 2.5, a: 1 }); // the mouth of the pod
    lines.run(rows.at(-1), { w: 2.4, a: 0.9 }); // where the rear end is bolted on
    // the floor: its outline only, from the tray under the nose to the tear
    lines.run([[s * 13, 6, 170], [s * 30, 6, 156], [s * 56, 6, 132], [s * 80, 6, 108], [s * 80, 6, SPLIT.z]], { w: 2.2, a: 0.85 });
    // the bargeboard: a blade that stands on the floor's leading edge
    const ts = [0, 0.2, 0.4, 0.6, 0.8, 1];
    const blade = (t, ty) => [s * (36 + 34 * t ** 1.3), mix(6.5, 15 + 17 * t, ty), 150 - 46 * t];
    skin.grid(ts.map((t) => [0, 0.5, 1].map((ty) => blade(t, ty))), { block: 2 });
    lines.run([blade(0, 0), ...ts.map((t) => blade(t, 1)), blade(1, 0)], { w: 1.9, a: 0.7 });
  }
  lines.run([[-13, 6, 170], [13, 6, 170]], { w: 1.9, a: 0.6 });
}

function buildCover(skin, lines) {
  const zs = [];
  for (let z = SPLIT.z; z > -204; z -= 6.45) zs.push(z);
  zs.push(-205);
  const R = NK + NS + NC;
  const J = 2 * R - 1;
  const rows = zs.map((z) => {
    const h = coverHalf(z);
    return Array.from({ length: J }, (_, j) => {
      const r = R - 1 - Math.abs(j - (R - 1));
      return [(j < R - 1 ? -1 : 1) * h[r][0], h[r][1], z];
    });
  });
  const o = { breaks: false };
  skin.grid(rows, o);
  lines.run(rows.map((r) => r[R - 1]), { w: 2.6, a: 1, ...o }); // the spine
  for (const j of [NK - 1, J - NK]) lines.run(rows.map((r) => r[j]), { w: 2.2, a: 0.85, ...o }); // the shoulders
  for (const j of [0, J - 1]) lines.run(rows.map((r) => r[j]), { w: 1.9, a: 0.55, ...o });
  lines.run(rows[0], { w: 2.6, a: 1, ...o }); // the torn edge
  lines.run(rows.at(-1), { w: 1.9, a: 0.6, ...o });
  // the floor between the rear wheels, and the diffuser that rises out of it
  for (const s of [-1, 1]) lines.run([[s * 80, 6, SPLIT.z], [s * 80, 6, -126], [s * 57, 6, -137], [s * 53, 6.5, -166], [s * 51, 17.5, -203]], { w: 2.2, a: 0.85, ...o });
  lines.run([[-51, 17.5, -203], [51, 17.5, -203]], { w: 2.2, a: 0.8, ...o });
  for (const x of [-34, -17, 17, 34]) lines.run([[x, 6, -168], [x * 1.02, 17.5, -203]], { w: 1.9, a: 0.5, ...o });
  return rows[0];
}

function buildRearWing(skin, lines) {
  const o = { breaks: false };
  const xs = Array.from({ length: 9 }, (_, i) => -48 + 12 * i);
  const main = (x, w) => [x, 76 + 2.5 * w - 8.5 * Math.sin(Math.PI * w ** 0.85), -190 - 31 * w];
  const flap = (x, w) => [x, 80.5 + 7.2 * w, -219.5 - 12 * w];
  skin.grid(xs.map((x) => [0, 0.2, 0.4, 0.6, 0.8, 1].map((w) => main(x, w))), o);
  skin.grid(xs.map((x) => [0, 0.5, 1].map((w) => flap(x, w))), o);
  lines.run(xs.map((x) => main(x, 0)), { w: 2.5, a: 1, ...o });
  lines.run(xs.map((x) => main(x, 1)), { w: 1.9, a: 0.6, ...o });
  lines.run(xs.map((x) => flap(x, 1)), { w: 2.6, a: 1, ...o });
  for (const s of [-1, 1]) {
    const bottom = (z) => (z > -196 ? mix(60, 52, (-186 - z) / 10) : z > -206 ? mix(52, 30, (-196 - z) / 10) : 30);
    const plate = (tz, ty) => {
      const z = mix(-186, -232, tz);
      return [s * 49, mix(bottom(z), 88, ty), z];
    };
    const tzs = [0, 0.11, 0.22, 0.33, 0.435, 0.6, 0.8, 1];
    skin.grid(tzs.map((tz) => [0, 0.34, 0.67, 1].map((ty) => plate(tz, ty))), o);
    lines.run([...tzs.map((tz) => plate(tz, 1)), ...[...tzs].reverse().map((tz) => plate(tz, 0)), plate(0, 1)], { w: 2.5, a: 1, ...o });
  }
  // the pillar that carries it, on the crash structure
  const pillar = (tz, ty) => [0, mix(39, 69, ty), mix(-195, -208, tz) - 3 * Math.sin(Math.PI * ty)];
  skin.grid([0, 0.5, 1].map((tz) => [0, 0.34, 0.67, 1].map((ty) => pillar(tz, ty))), o);
  lines.run([0, 0.34, 0.67, 1].map((ty) => pillar(0, ty)), { w: 1.9, a: 0.7, ...o });
  lines.run([0, 0.34, 0.67, 1].map((ty) => pillar(1, ty)), { w: 1.9, a: 0.5, ...o });
}

/** Wishbones and links: glass rods, a line down each. `links`: [[from], [to]] pairs. */
function buildArms(skin, lines, links, o = {}) {
  for (const [p, q] of links) {
    skin.tube(p, q, 1.6, !!o.breaks);
    lines.run([p, q], { w: 2.2, a: 0.75, breaks: false, ...o });
  }
}
const STUB = 0.42; // a torn corner keeps this much of each link, from the wheel: the rest stays on the car until the barrier gets to it
/** A link cut in two: [the part on the wheel's side, the part on the car's]. */
const cutLink = ([p, q], at = STUB) => {
  const [out, inn] = Math.abs(p[0]) > Math.abs(q[0]) ? [p, q] : [q, p];
  const c = [mix(out[0], inn[0], at), mix(out[1], inn[1], at), mix(out[2], inn[2], at)];
  return [[out, c], [c, inn]];
};
const FRONT_ARMS = (s) => [
  [[s * 16.5, 44, 216], [s * 65, 46.5, 195]], [[s * 18, 43, 168], [s * 65, 46.5, 195]], // the upper wishbone
  [[s * 14, 17, 220], [s * 66, 19, 197]], [[s * 16, 16, 170], [s * 66, 19, 197]], // the lower one
  [[s * 64, 21, 196], [s * 17, 45, 190]], // the push rod
  [[s * 65, 34, 207], [s * 15, 33, 214]], // the track rod
];
const REAR_ARMS = (s) => [
  [[s * 9, 43, -150], [s * 57, 46.5, -164]], [[s * 8, 41, -188], [s * 57, 46.5, -164]],
  [[s * 12, 15, -147], [s * 58.5, 17.5, -164]], [[s * 8.5, 17, -192], [s * 58.5, 17.5, -164]],
  [[s * 56, 44, -162], [s * 12, 17, -156]], // the pull rod
  [[s * 57, 30, -178], [s * 9, 28, -190]], // the toe link
];

/**
 * A wheel, its axis along x, its outer face toward `side`: a broad slick (thick glass, its shoulders drawn),
 * the dish of the rim, the band painted on each wall. Everything that turns (`spin`) is round: nothing strobes.
 */
function makeWheel(hw, side, M) {
  const group = new THREE.Group();
  const spin = new THREE.Group();
  group.add(spin);
  const R = CAR.wheelR;
  const turnedOut = (g) => g.rotateZ((-side * Math.PI) / 2); // a lathe turns around y: lay it along x, its top toward the outer face
  const tyre = new THREE.Mesh(turnedOut(lathe([[17.2, hw - 3.2], [20.5, hw - 0.9], [25, hw], [29.8, hw - 0.5], [R - 1, hw - 2.4], [R, hw - 6], [R, -(hw - 6)], [R - 1, -(hw - 2.4)], [29.8, -(hw - 0.5)], [25, -hw], [20.5, -(hw - 0.9)], [17.2, -(hw - 3.2)]], 64)), M.tyre);
  const dish = new THREE.Mesh(turnedOut(lathe([[17.2, -(hw - 3.2)], [15.7, -(hw - 4)], [15.4, hw - 10], [7, hw - 12.5], [5, hw - 8.5], [0.01, hw - 8.5]], 48)), M.rim);
  const lip = new THREE.Mesh(turnedOut(lathe([[17.2, hw - 3.2], [16.2, hw - 5], [15.4, hw - 10]], 48)), M.rim);
  const lines = makeLines(7);
  lines.circle(R - 0.4, side * (hw - 4.4), { w: 2.5, a: 0.95 });
  lines.circle(R - 0.4, -side * (hw - 4.4), { w: 2.5, a: 0.95 });
  lines.circle(17.2, side * (hw - 3.2), { w: 2.3, a: 0.9 });
  lines.circle(17.2, -side * (hw - 3.2), { w: 1.9, a: 0.6 });
  lines.circle(5.4, side * (hw - 8.5), { w: 1.9, a: 0.7 }, 36);
  spin.add(tyre, dish, lip, lines.build(M.lines));
  for (const x of [hw + 0.25, -(hw + 0.25)]) {
    const band = new THREE.Mesh(new THREE.RingGeometry(21, 30.5, 72).rotateY(Math.PI / 2), M.band);
    band.position.x = x;
    band.renderOrder = 17;
    spin.add(band);
  }
  return { group, spin, glass: [tyre, dish, lip] };
}

/** A hose or a loom torn at the split: fixed at `root`, it stretches after what leaves (`dir` ±1 along z), snaps, whips, then hangs. */
function makeHose(parent, root, dir, L, { color = BRAND.ink, width = 3, droop = 0.9, sway = 0.2, snap = 0.12, opacity = 0.8, hdr = 1 }) {
  const g = new THREE.Group();
  g.position.set(...root);
  const N = 12;
  const taut = fatLine(Array.from({ length: N + 1 }, (_, i) => [0, -0.05 * L * Math.sin((Math.PI * i) / N), (dir * L * 1.25 * i) / N]), { color, width, opacity, hdr });
  const loose = fatLine(Array.from({ length: N + 1 }, (_, i) => {
    const t = i / N;
    return [sway * L * t * t, -droop * L * t * t * (0.6 + 0.4 * t), dir * L * (t - 0.42 * t * t)];
  }), { color, width, opacity, hdr });
  g.add(taut, loose);
  parent.add(g);
  return {
    set(sp, sh) {
      const on = sp > 0.004 && sh > 0.003;
      const torn = sp >= snap;
      taut.visible = on && !torn;
      loose.visible = on && torn;
      if (!on) return;
      if (torn) {
        const u = (sp - snap) / (1 - snap);
        loose.rotation.x = -dir * 0.75 * Math.exp(-5.5 * u) * Math.cos(13 * u); // the whip of a hose let go, dying out
        loose.material.opacity = loose.material.userData.base * sh;
      } else {
        taut.scale.setScalar(0.08 + 0.92 * (sp / snap));
        taut.material.opacity = taut.material.userData.base * sh;
      }
    },
  };
}

/* ───────────────────────────────────────────────────────────── the car */

const PIVOT_Z = -150; // what the rear end turns about as it leaves: a point of the track under its gearbox
const TOUCH = V(...RIVAL.touch);
const CONTACT = V(RIVAL.touch[0] + 14.7, CAR.wheelR + 3, (RIVAL.touch[2] + CAR.rear) / 2); // where the two tyres rub: wall against wall
const TEAR = V(0, 42, SPLIT.z - 3);

export function buildCar() {
  const group = new THREE.Group();
  const A = {};
  const fx = {};
  const glasses = []; // every material that knows `uAhead`, `uTime`, `uFire`
  const liners = [];
  const carGlassOf = (o) => {
    const m = carGlass(o);
    glasses.push(m);
    return m;
  };
  const carLinesOf = (o) => {
    const m = carLines(o);
    liners.push(m);
    return m;
  };

  /* ═════════════ 1 · AHEAD OF THE TEAR — the nose, the front wing, the pods: what the barrier takes apart ═════════════ */

  const skinF = makeSkin(101);
  const linesF = makeLines(202);
  buildNose(skinF, linesF);
  buildFrontWing(skinF, linesF);
  buildPods(skinF, linesF);
  for (const s of [-1, 1]) buildArms(skinF, linesF, FRONT_ARMS(s).map((link) => cutLink(link)[1]), { breaks: true });
  fx.skin = carGlassOf({ base: 0.008, rim: 0.3, power: 2.4, edge: 0.4, spec: 0.2, through: 0.22 });
  fx.lines = carLinesOf({ far: 0.3, reach: 240, centre: [0, 40, 130] });
  const skinFront = skinF.build(fx.skin);
  group.add(skinFront, linesF.build(fx.lines));
  fx.flakes = makeFlakes(170, 41, skinF.centres);
  group.add(fx.flakes.mesh);

  /* ── the four wheels' materials ── */
  fx.tyre = glass(BRAND.ink, { base: 0.02, rim: 0.36, power: 2.1, edge: 0.42, spec: 0.22, through: 0.22 });
  fx.rim = glass(BRAND.ink, { base: 0.012, rim: 0.42, power: 2.4, edge: 0.55, spec: 0.6, through: 0.2 });
  fx.band = bandMat(INK);
  fx.wheelLines = carLinesOf({ far: 0.34, reach: 38, centre: [0, 0, 0] });
  const WHEEL = { tyre: fx.tyre, rim: fx.rim, lines: fx.wheelLines, band: fx.band };
  const wheelGlass = [];

  /* ── the front corners: a wheel and its wishbones, torn off as one ── */
  fx.arms = carGlassOf({ base: 0.03, rim: 0.5, power: 2, edge: 0.6, spec: 0.3, through: 0.2 });
  fx.armLines = carLinesOf({ far: 0.4, reach: 90, centre: [0, 0, 0] });
  const armGlass = [];
  const corners = [-1, 1].map((s) => {
    const home = V(s * CAR.trackF, CAR.wheelR, CAR.front);
    const g = new THREE.Group();
    g.position.copy(home);
    const wheel = makeWheel(CAR.wheelWF / 2, s, WHEEL);
    wheelGlass.push(...wheel.glass);
    const sk = makeSkin(300 + s);
    const ln = makeLines(310 + s);
    buildArms(sk, ln, FRONT_ARMS(s).map((link) => cutLink(link)[0].map(([x, y, z]) => [x - home.x, y - home.y, z - home.z])));
    const arms = sk.build(fx.arms);
    armGlass.push(arms);
    g.add(wheel.group, arms, ln.build(fx.armLines));
    group.add(g);
    A[s > 0 ? "wheelFL" : "wheelFR"] = anchor(g, 0, 0, 0);
    // the tyre gives 20 cm before the corner lets go (the left one goes earlier: when the barrier has taken its wishbones); it ends lying on its wall
    const reach = (CAR.wheelWF / 2) * COS + CAR.wheelR * SIN;
    const f = s < 0
      ? { hit: hitOf(home.x, home.z) + (reach - 20) / (100 * SIN), B: 8, S: -15, H: 46, yaw: 1.9, axis: V(0, 0, 1), angle: -(Math.PI / 2 + 2 * Math.PI), rest: CAR.wheelWF / 2 }
      : { hit: Math.max(hitOf(home.x, home.z) + (reach - 20) / (100 * SIN), hitOf(s * 30, 200) - 0.1), B: 95, S: 42, H: 72, yaw: -2.6, axis: V(0, 0, 1), angle: Math.PI / 2 + 2 * Math.PI, rest: CAR.wheelWF / 2 };
    return { g, home, wheel, f };
  });

  /* ═════════════ 2 · THE REAR END — one group: it tears off at z = SPLIT.z ═════════════ */

  const rearPivot = new THREE.Group();
  rearPivot.rotation.order = "YXZ";
  rearPivot.position.set(0, 0, PIVOT_Z);
  const rear = new THREE.Group(); // plan coordinates inside
  rear.position.set(0, 0, -PIVOT_Z);
  rearPivot.add(rear);
  group.add(rearPivot);

  const skinR = makeSkin(111);
  const linesR = makeLines(212);
  const tearRing = buildCover(skinR, linesR);
  buildRearWing(skinR, linesR);
  for (const s of [-1, 1]) buildArms(skinR, linesR, REAR_ARMS(s));
  fx.skinRear = carGlassOf({ base: 0.008, rim: 0.3, power: 2.4, edge: 0.4, spec: 0.2, through: 0.22 });
  fx.linesRear = carLinesOf({ far: 0.32, reach: 150, centre: [0, 45, -150] });
  const skinRear = skinR.build(fx.skinRear);
  rear.add(skinRear, linesR.build(fx.linesRear));

  const rearWheels = [-1, 1].map((s) => {
    const wheel = makeWheel(CAR.wheelWR / 2, s, WHEEL);
    wheel.group.position.set(s * CAR.trackR, CAR.wheelR, CAR.rear);
    wheelGlass.push(...wheel.glass);
    rear.add(wheel.group);
    A[s > 0 ? "wheelRL" : "wheelRR"] = anchor(wheel.group, 0, 0, 0);
    return wheel;
  });

  /* ── solid in all that glass: the engine, the gearbox ── */
  fx.block = solid(0x2c3136, { rough: 0.6, metal: 0.3 }); // dark: the block, the carbon of the crash structure
  fx.cast = solid(0x4d545b, { rough: 0.52, metal: 0.4 }); // mid: what is cast — the plenum, the gearbox
  fx.mach = solid(0x878e95, { rough: 0.36, metal: 0.5 }); // light: what is machined — covers, faces, the exhaust
  const E = { edgeOpacity: 0.5, edgeWidth: 1.9 };
  const engine = makePart("engine");
  const gearbox = makePart("gearbox");
  addMesh(engine, box(42, 21, 50, 1.4), fx.block, { pos: [0, 19.5, -103.5], ...E }); // crankcase and sump
  for (const s of [-1, 1]) {
    addMesh(engine, placed(box(15, 25, 47, 1.4), { pos: [s * 15.5, 38.5, -103.5], rotZ: -s * 42 * DEG }), fx.block, E); // a bank of three cylinders
    addMesh(engine, placed(box(13.5, 4.6, 45, 1.2), { pos: [s * 25.4, 49.4, -103.5], rotZ: -s * 42 * DEG }), fx.mach, E); // its cam cover
  }
  addMesh(engine, box(27, 12, 38, 4.5), fx.cast, { pos: [0, 57.5, -104], ...E }); // the plenum, in the V
  addMesh(engine, placed(cyl(6.2, 28, 1, 28), { pos: [0, 71, -89], rotX: 52 * DEG }), fx.cast, E); // the intake, up to the air box
  addMesh(engine, box(46, 36, 2.4, 0.9), fx.mach, { pos: [0, 28, -78.2], ...E }); // the face that is bolted on the cell
  addMesh(engine, placed(cyl(7.2, 12, 1, 28).rotateX(Math.PI / 2), { pos: [0, 51, -133] }), fx.mach, E); // the turbo
  addMesh(gearbox, placed(cyl(15.5, 14, 1.2, 32, 19.5).rotateX(Math.PI / 2), { pos: [0, 28, -135] }), fx.cast, E); // the bell housing
  addMesh(gearbox, placed(cyl(12, 58, 1.2, 4, 21.2).rotateY(Math.PI / 4).rotateX(Math.PI / 2), { pos: [0, 28, -171] }), fx.cast, E); // the casing, tapering to the tail
  addMesh(gearbox, placed(cyl(8.6, 26, 1.2, 28).rotateZ(Math.PI / 2), { pos: [0, 30, -164] }), fx.mach, E); // the differential
  for (const s of [-1, 1]) addMesh(gearbox, placed(cyl(2.3, 40, 0.4, 16).rotateZ(Math.PI / 2), { pos: [s * 33, 31.5, -164] }), fx.block, { edges: false }); // a drive shaft
  addMesh(gearbox, placed(cyl(6.4, 32, 1, 4, 11.3).rotateY(Math.PI / 4).rotateX(Math.PI / 2), { pos: [0, 30, -216] }), fx.block, E); // the crash structure
  addMesh(gearbox, placed(cyl(4.3, 80, 0.6, 20).rotateX(Math.PI / 2), { pos: [0, 49.5, -178], rotX: -4.3 * DEG }), fx.mach, E); // the exhaust
  rear.add(engine, gearbox);

  A.rear = anchor(rear, 0, 45, PIVOT_Z);
  A.engine = anchor(rear, 0, 38, -104);
  A.torn = anchor(group, 0, 40, SPLIT.z);
  A.nose = anchor(group, 0, 24, CAR.nose);
  A.wingF = anchor(group, 0, 14, 314);

  /* ── what the tear leaves: hoses and looms, on both of its lips ── */
  const hoses = [
    // on the cell
    makeHose(group, [-15, 22, SPLIT.z], -1, 34, { width: 3.2, droop: 0.8, sway: -0.25, snap: 0.1 }),
    makeHose(group, [10, 16, SPLIT.z], -1, 26, { width: 2.6, droop: 0.6, sway: 0.3, snap: 0.07, opacity: 0.65 }),
    makeHose(group, [19, 41, SPLIT.z], -1, 44, { width: 3, droop: 1, sway: 0.35, snap: 0.15 }),
    makeHose(group, [-9, 50, SPLIT.z], -1, 30, { width: 2.4, droop: 0.9, sway: -0.15, snap: 0.09, opacity: 0.65 }),
    makeHose(group, [2, 46, SPLIT.z], -1, 38, { color: BRAND.signal, width: 3.4, droop: 0.75, sway: 0.1, snap: 0.13, opacity: 0.95, hdr: 1.5 }), // the fuel line: the fire is born here
    // on the engine
    makeHose(rear, [-17, 30, SPLIT.z - 2], 1, 30, { width: 3, droop: 1, sway: -0.3, snap: 0.1 }),
    makeHose(rear, [14, 20, SPLIT.z - 2], 1, 24, { width: 2.6, droop: 0.8, sway: 0.25, snap: 0.07, opacity: 0.65 }),
    makeHose(rear, [6, 47, SPLIT.z - 2], 1, 40, { width: 3, droop: 1.1, sway: 0.2, snap: 0.15 }),
    makeHose(rear, [-22, 44, SPLIT.z - 2], 1, 28, { width: 2.4, droop: 0.9, sway: -0.3, snap: 0.12, opacity: 0.65 }),
  ];
  // …and what it throws
  fx.burst = makeBurst(150, 57, (rand) => {
    const p = tearRing[Math.floor(rand() * tearRing.length)];
    const k = 0.35 + 0.65 * rand(); // from the ring of the engine cover, and from inside it
    return [p[0] * k, 30 + (p[1] - 30) * k, SPLIT.z - 2 - rand() * 10];
  });
  group.add(fx.burst.mesh);

  /* ═════════════ 3 · THE OTHER CAR — its front-left wheel, the end of its wing ═════════════ */

  const rivalG = new THREE.Group(); // its origin: the centre of that wheel
  group.add(rivalG);
  fx.rivalTyre = glass(BRAND.signal, { base: 0.012, rim: 0.3, power: 2.3, edge: 0.5, spec: 0.15, through: 0.2 });
  fx.rivalRim = glass(BRAND.signal, { base: 0.008, rim: 0.36, power: 2.4, edge: 0.6, spec: 0.4, through: 0.2 });
  fx.rivalBand = bandMat(SIGNAL);
  fx.rivalWheelLines = carLinesOf({ color: SIGNAL, hdr: 1.7, far: 0.4, reach: 38, centre: [0, 0, 0] });
  const rivalWheel = makeWheel(CAR.wheelWF / 2, 1, { tyre: fx.rivalTyre, rim: fx.rivalRim, lines: fx.rivalWheelLines, band: fx.rivalBand });
  rivalG.add(rivalWheel.group);
  const rivalCar = new THREE.Group(); // that car's own plan: its wheel is at (trackF, wheelR, front)
  rivalCar.position.set(-CAR.trackF, -CAR.wheelR, -CAR.front);
  rivalG.add(rivalCar);
  const skinV = makeSkin(121);
  const linesV = makeLines(222);
  const inboard = (p) => clamp01((p[0] - 44) / 34); // the rest of that car is not there: what goes toward it fades
  buildFrontWing(skinV, linesV, { sides: [1], from: 52, breaks: false, fade: inboard });
  for (const [p, q] of FRONT_ARMS(1)) {
    buildArms(skinV, linesV, [cutLink([p, q], 0.55)[0]], { a: inboard }); // from the wheel, a little over half of each link
  }
  fx.rivalSkin = carGlassOf({ color: SIGNAL, base: 0.015, rim: 0.36, power: 2.2, edge: 0.5, spec: 0.25, through: 0.2 });
  fx.rivalLines = carLinesOf({ color: SIGNAL, hdr: 1.7, far: 0.45, reach: 90, centre: [CAR.trackF, CAR.wheelR, CAR.front + 60] });
  const rivalSkin = skinV.build(fx.rivalSkin);
  rivalCar.add(rivalSkin, linesV.build(fx.rivalLines));
  A.rival = anchor(rivalG, 0, 0, 0);
  const RIVAL_FROM = V(RIVAL.touch[0] - 95, RIVAL.touch[1], RIVAL.touch[2] - 230); // it comes from behind, on the right

  fx.sparks = makeSparks(46, 73, [CONTACT.x, CONTACT.y, CONTACT.z]);
  group.add(fx.sparks.mesh);
  const sprites = makeSprites(2); // 0: where the two tyres rub · 1: the tear, as it opens
  group.add(sprites.points);
  const SPARK = HOT.clone().multiplyScalar(2.6);
  const FLASH = INK.clone().multiplyScalar(1.5);

  /* ── one shell: only the nearest surface of all this glass lights up (wheels first: the body never hides them) ── */
  asShell([...wheelGlass, ...rivalWheel.glass], 16);
  asShell([skinFront, skinRear, ...armGlass, rivalSkin], 20);
  for (const mesh of [skinFront, skinRear, ...armGlass]) for (const layer of mesh.children) layer.frustumCulled = false;

  const q1 = new THREE.Quaternion();
  const q2 = new THREE.Quaternion();
  /** The law of the shaders, for a whole corner of the car: thrown from `home` once the barrier is at `f.hit`. */
  function fling(g, home, f, ahead, time) {
    const gone = f.hit - ahead;
    if (gone <= 0) {
      g.position.copy(home);
      g.quaternion.identity();
      return;
    }
    const v = clamp01(gone / Math.min(RANGE, Math.max(0.05, f.hit)));
    const e = 1 - (1 - v) * (1 - v);
    const air = 4 * v * (1 - v);
    g.position.set(home.x + COS * f.B * e + SIN * f.S * e, mix(home.y, f.rest, v * v) + f.H * air, home.z - 100 * gone - SIN * f.B * e + COS * f.S * e);
    q1.setFromAxisAngle(f.axis, f.angle * e + 0.3 * air * Math.sin(time * 0.19 + f.yaw * 5));
    q2.setFromAxisAngle(UP, f.yaw * e);
    g.quaternion.multiplyQuaternions(q2, q1);
  }

  return {
    group, A, fx,
    /**
     * shell   the X-ray of the car — glass, lines, wheels, engine, gearbox, the other car's wheel: 1 → 0 nothing of this file is left (0–1)
     * ahead   metres between the barrier and its final place. The wheels turn with it; whatever the barrier's face reaches is thrown
     *         (≈ 5.4 the right end of the front wing · 4.2 the right front wheel · 3.75 the tip of the nose · 3.3 → 2.9 the left half of the wing · 2.6 → 0.85 the right pod · 1.9 the left front wheel)
     * split   the rear end: 0 bolted on → 0.12 a gap, hoses stretched → 0.3 in the air, a metre away, turning → 1 lying across the track behind the cell
     * rival   the other car's front-left wheel: 0 nowhere → 1 against your right-rear wheel, sparks
     * fire    a signal light on what looks at the fire (0–1)
     */
    update({ shell = 1, ahead = 60, split = 0, rival = 0, fire = 0 } = {}, time = 0, px = 1600) {
      const sh = clamp01(shell);
      const a = Math.max(0, ahead);
      const sp = clamp01(split);
      const rv = clamp01(rival);
      const fr = clamp01(fire);
      group.visible = sh > 0.003;

      // the rear end: a kick, a flight that turns it across the track, a landing on its sump
      const away = 1 - Math.pow(1 - sp, 2.2);
      const hop = sp < 0.7 ? 38 * Math.sin((Math.PI * sp) / 0.7) : 7 * Math.sin((Math.PI * (sp - 0.7)) / 0.3);
      rearPivot.position.set(70 * smooth(0.08, 0.9, sp), hop - 1.1 * smooth(0.7, 1, sp), PIVOT_Z - 180 * away);
      rearPivot.rotation.set(
        (5 * smooth(0.55, 1, sp) + 13 * Math.sin(Math.PI * clamp01(sp / 0.7))) * DEG,
        100 * (1 - Math.pow(1 - sp, 1.8)) * DEG,
        16 * Math.sin(Math.PI * clamp01(sp / 0.62)) * DEG,
      );
      // …its right wheel, the one that was struck, folded under it
      const bent = smooth(0.4, 0.75, sp);
      rearWheels[0].group.rotation.set(0, -14 * bent * DEG, -26 * bent * DEG);
      rearWheels[0].group.position.y = CAR.wheelR + 6 * bent;

      // the wheels turn with the road; a corner the barrier has reached is thrown, its wheel stopped as it was
      const road = 100 / CAR.wheelR;
      for (let i = 0; i < 2; i++) {
        rearWheels[i].spin.rotation.x = -road * a;
        const c = corners[i];
        fling(c.g, c.home, c.f, a, time);
        c.wheel.spin.rotation.x = -road * Math.max(a, c.f.hit);
      }

      // the other car
      const come = rv * rv * (3 - 2 * rv);
      const seen = smooth(0, 0.12, rv) * sh;
      rivalG.visible = seen > 0.003;
      rivalG.position.lerpVectors(RIVAL_FROM, TOUCH, come);
      rivalWheel.spin.rotation.x = -road * a + 1.3;
      fx.rivalTyre.uniforms.uAmount.value = seen;
      fx.rivalRim.uniforms.uAmount.value = seen;
      fx.rivalBand.uniforms.uAmount.value = seen;
      const rub = smooth(0.9, 1, rv) * sh;
      fx.sparks.mesh.visible = rub > 0.003;
      fx.sparks.uniforms.uAmount.value = rub;
      fx.sparks.uniforms.uTime.value = time;
      fx.sparks.uniforms.uScale.value = px;

      // amounts
      for (let i = 0; i < glasses.length; i++) {
        const u = glasses[i].uniforms;
        u.uAmount.value = sh;
        u.uAhead.value = a;
        u.uTime.value = time;
        u.uFire.value = fr;
      }
      for (let i = 0; i < liners.length; i++) {
        const u = liners[i].uniforms;
        u.uAmount.value = sh;
        u.uAhead.value = a;
        u.uTime.value = time;
        u.uFire.value = fr;
      }
      fx.rivalSkin.uniforms.uAmount.value = seen;
      fx.rivalLines.uniforms.uAmount.value = seen;
      fx.rivalWheelLines.uniforms.uAmount.value = seen;
      fx.tyre.uniforms.uAmount.value = sh;
      fx.rim.uniforms.uAmount.value = sh;
      fx.band.uniforms.uAmount.value = sh;
      fx.flakes.uniforms.uAmount.value = sh;
      fx.flakes.uniforms.uAhead.value = a;
      fx.flakes.uniforms.uTime.value = time;
      setPartOpacity(engine, sh);
      setPartOpacity(gearbox, sh);

      // the tear: hoses, shards, and — as it opens — a light that has a place
      for (let i = 0; i < hoses.length; i++) hoses[i].set(sp, sh);
      fx.burst.mesh.visible = sp > 0.003 && sh > 0.003;
      fx.burst.uniforms.uK.value = smooth(0.01, 0.85, sp);
      fx.burst.uniforms.uTime.value = time;
      fx.burst.uniforms.uAmount.value = smooth(0.01, 0.08, sp) * (1 - 0.45 * smooth(0.6, 1, sp)) * sh;
      sprites.uniforms.uScale.value = px;
      sprites.put(0, CONTACT.x, CONTACT.y, CONTACT.z, SPARK, rub * (1 + 0.08 * Math.sin(time * 1.3)), 120);
      sprites.put(1, TEAR.x, TEAR.y, TEAR.z, FLASH, smooth(0, 0.035, sp) * Math.exp(-sp / 0.11) * sh, 240);
      sprites.flush();
    },
  };
}
