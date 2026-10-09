// DOSSIER 012 — Gazinière : the fire. Everything here is the GAS, and the gas is signal:
//
//   burning      the crown: one flame per port of the burner, each a soft volume with a white-hot heart at its
//                root (ink), a body (signal) and a tip that dissolves. Under the saucepan they run along its
//                bottom and lick its edge; free, on the bench, they stand up — the thermocouple's tip in one of them.
//                It dies PORT AFTER PORT, from where the foam falls (SPILL.dir), both ways round at once; the last
//                ones, on the far side, waver and go out.
//   not burning  a dull haze leaving the SAME ports, in streaks that spread and rise slowly (methane is lighter
//                than air): under the saucepan, then up around it. A port gives gas only once its flame is dead.
//   the "what if": a column of that haze from the burner, round the hood, up to the ceiling — where it gathers in
//                a layer that thickens downward over the whole room (a real volume: marched through, with noise).
//   the spark    of the light switch: a ball of light with a heart and a long tail, small.
//
// Nothing is a hard cone, nothing is a veil: a flame is lit by its thickness (bright where the eye goes through the
// most of it, nothing at its outline), a streak is a ribbon that always faces the eye, the layer is marched.
// And nothing is ADDED to the picture but the small glows the crown throws around it: signal added to signal goes
// past what the film's tone curve keeps orange, and comes out salmon. So —
//   the flames  "the brightest wins" (one over the other, and the white heart over the orange body)
//   the haze    laid over the picture: one dull colour, more or less opaque
//   the layer   marched front to back, what is near hiding what is far, then laid over the picture
// `update` only writes uniforms: it is called for every instant of the shutter.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { anchor } from "@kit/build3d.js";
import { BURNERS, PARTS, GRATE, HOB, POT, SPILL, SWITCH, CEILING, HOOD, SYSTEM } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VIEW = new THREE.Vector2(BRAND.W, BRAND.H);
const TAU = Math.PI * 2;

/** The ring of ports, in the system's frame (origin: the burner's centre on the top face). */
const R0 = BURNERS[0].r;
const Y0 = PARTS.burner.portsY;
/** The saucepan's bottom above that origin, and its radius. */
const POT_Y = GRATE.y - HOB.top;
const POT_R = POT.r;
/** Where the foam falls: the crown dies from this angle (x = cos, z = sin). The thermocouple's tip stands on it. */
const SPILL_AT = Math.atan2(SPILL.dir[1], SPILL.dir[0]);
/**
 * One flame per slot of the crown model.js cuts: 40 slots, slot i at the angle π/2 − i·2π/40 (its lands are turned
 * half a step from +z). The slot nearest SPILL_AT is 3° from the thermocouple's tip: the tip stands in that flame.
 */
const PORTS = 40;
const portAt = (i) => Math.PI / 2 - (i / PORTS) * TAU;
/** How far round from the spill an angle is (0 … π). */
const fromSpill = (angle) => {
  const d = (((angle - SPILL_AT) % TAU) + TAU) % TAU;
  return Math.min(d, TAU - d);
};
/** The dying front is this wide (radians): the two or three flames on it are the ones that shrink and waver. */
const EDGE = 0.36;
/** The layer of gas, at `fill` = 1, comes down to this height. */
const LAYER_LOW = 140;
const ROOM = { x0: -60, x1: 300, z0: 0, z1: 330 };

const n = (x) => Number(x).toFixed(5);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const CONSTS = /* glsl */ `
  const float R0 = ${n(R0)}; const float Y0 = ${n(Y0)}; const float POT_Y = ${n(POT_Y)}; const float POT_R = ${n(POT_R)};
  const float EDGE = ${n(EDGE)}; const float SPILL_AT = ${n(SPILL_AT)}; const float K_PI = 3.14159265;`;

/* ───────────────────────────────────────────────────────────── 1 · the crown of flame */

/** One tongue: a tube of (t along, angle around), bent and swollen by the vertex shader. One instance per port. */
function makeTongues(rand) {
  const NT = 24;
  const NA = 12;
  const pos = [];
  const index = [];
  // (it stops a hair short of its tip: at the very tip the tube has no width, and a normal would have no direction)
  for (let i = 0; i <= NT; i++) for (let j = 0; j <= NA; j++) pos.push((i / NT) * 0.985, (j / NA) * TAU, 0);
  for (let i = 0; i < NT; i++) {
    for (let j = 0; j < NA; j++) {
      const a = i * (NA + 1) + j;
      const b = a + NA + 1;
      index.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const ports = [];
  // the tip stands between two slots, 3° from the nearer one: that flame bends to it (its root stays in its slot)
  const tipAt = Math.atan2(PARTS.tip.z, PARTS.tip.x);
  const tipR = Math.hypot(PARTS.tip.x, PARTS.tip.z);
  const off = (k) => Math.atan2(Math.sin(tipAt - portAt(k)), Math.cos(tipAt - portAt(k)));
  let hero = 0;
  for (let k = 1; k < PORTS; k++) if (Math.abs(off(k)) < Math.abs(off(hero))) hero = k;
  const bend = [];
  for (let k = 0; k < PORTS; k++) {
    ports.push(portAt(k), fromSpill(portAt(k)), rand(), rand());
    bend.push(k === hero ? tipR * Math.sin(off(k)) : 0);
  }
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aPort", new THREE.InstancedBufferAttribute(new Float32Array(ports), 4));
  geo.setAttribute("aBend", new THREE.InstancedBufferAttribute(new Float32Array(bend), 1));
  geo.setIndex(index);
  geo.instanceCount = PORTS;
  return geo;
}

/**
 * A skin of the flames.
 *   hue           its colour                          gain    its light (HDR)
 *   power         how soft its outline is (1: a thin gas, 3: a dense core)
 *   radius        its width, in widths of the body    share   how much of the tongue's length it covers
 *   fade          [from, to] along it: where it dissolves · root: how far its hot root reaches · dim: its light past the root (the root: 1.15)
 * The skins are laid over each other and over their neighbours with "the brightest wins", never added: where two
 * flames overlap, signal stays signal (added up it goes past 2, and the film's tone curve washes it to salmon),
 * the white heart replaces the orange instead of tinting it pink, and the gap between two teeth stays dark.
 */
const flameMat = (SH, { hue, gain, power, radius = 1, share = 1, fade = [0.5, 1], root = 0.45, dim = 0.75 }) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide, // (the far half of a tube faces away: it gives nothing — see the clamp)
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    uniforms: {
      uTime: SH.uTime, uPot: SH.uPot, uFront: SH.uFront,
      uHue: { value: hue.clone() }, uGain: { value: gain }, uPower: { value: power },
      uShape: { value: new THREE.Vector2(radius, share) }, uFade: { value: new THREE.Vector2(...fade) }, uRoot: { value: new THREE.Vector2(root, dim) },
    },
    vertexShader: /* glsl */ `
      ${CONSTS}
      uniform float uTime, uPot, uFront; uniform vec2 uShape;
      attribute vec4 aPort; // where on the ring (rad) · how far round from the spill (rad) · two seeds
      attribute float aBend; // how far sideways it bends on its way out, cm (the flame of the thermocouple's tip)
      varying vec3 vN, vV, vT; varying vec4 vF;
      // A point of the tongue. t: along it · a: around it · w: 1 its skin, 0 its axis · k: (length, reach under the pan, lean, bend)
      vec3 tongue(float t, float a, float w, vec4 k, vec3 er, vec3 et) {
        float tau = t * uShape.y;
        // free, it leaves outward and stands up (through the thermocouple's tip); under the pan it runs outward along the bottom
        vec2 d1 = mix(vec2(1.7, 1.1), vec2(2.4, 1.9), uPot) * k.x;
        vec2 d2 = mix(vec2(2.1, 3.2), vec2(4.6 * k.y, 2.45), uPot) * k.x;
        vec2 q = 2.0 * (1.0 - tau) * tau * d1 + tau * tau * d2;
        vec2 dq = 2.0 * (1.0 - tau) * d1 + 2.0 * tau * (d2 - d1);
        vec2 tn = dq / max(length(dq), 1e-4);
        // a drop: narrow at the port, full a third of the way, a rounded point — a tooth, not a needle
        float prof = mix(0.5, 1.0, smoothstep(0.0, 0.3, t)) * pow(clamp(1.0 - t * t * t, 0.0, 1.0), 0.6);
        // (as wide as the slots are apart where it is fullest: forty teeth that touch, not a band)
        float wn = mix(0.52, 0.42, uPot) * prof * uShape.x;
        float wb = mix(0.41, 0.47, uPot) * prof * uShape.x;
        float r = R0 + q.x;
        float y = Y0 + q.y;
        // the pan's bottom is a roof — past its edge the flame curls up around it
        float lip = smoothstep(POT_R - 0.4, POT_R + 1.2, r);
        float roof = POT_Y - 0.06 + 2.6 * lip;
        y += uPot * 1.3 * lip;
        y = mix(y, min(y, roof - wn), uPot);
        r += w * cos(a) * wn * -tn.y;
        y += w * cos(a) * wn * tn.x;
        y = mix(y, min(y, roof), uPot);
        return er * r + vec3(0.0, y, 0.0) + et * (w * sin(a) * wb + k.z * tau * tau + k.w * smoothstep(0.0, 0.45, tau));
      }
      void main() {
        float th = aPort.x;
        vec3 er = vec3(cos(th), 0.0, sin(th));
        vec3 et = vec3(-sin(th), 0.0, cos(th));
        float al = smoothstep(uFront, uFront + EDGE, aPort.y);
        float dying = 4.0 * al * (1.0 - al);
        // alive but calm: every flame breathes on its own slow clock, a wave goes round the ring. A dying one wavers.
        float breath = 1.0 + 0.07 * sin(uTime * 1.9 + aPort.z * 6.2832 + th * 2.0) + 0.05 * sin(uTime * 3.1 + aPort.w * 6.2832 - th * 3.0);
        float len = breath * (0.9 + 0.2 * aPort.w) * mix(0.3, 1.0, al) * (1.0 + 0.22 * dying * sin(uTime * 10.5 + aPort.z * 40.0));
        float lean = 0.22 * sin(uTime * 1.3 + aPort.w * 6.2832 + th) + 0.7 * dying * sin(uTime * 8.3 + aPort.w * 31.0);
        vec4 k = vec4(len, 0.85 + 0.45 * aPort.z * aPort.z, lean, aBend); // (a few reach the pan's edge and lick it)
        float t = position.x;
        float a = position.y;
        vec3 p = tongue(t, a, 1.0, k, er, et);
        vec3 c = tongue(t, a, 0.0, k, er, et);
        vec3 nrm = cross(tongue(t, a + 0.15, 1.0, k, er, et) - p, tongue(t + 0.02, a, 1.0, k, er, et) - p);
        if (dot(nrm, p - c) < 0.0) nrm = -nrm;
        nrm /= max(length(nrm), 1e-6);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = (modelViewMatrix * vec4(nrm, 0.0)).xyz;
        vT = (modelViewMatrix * vec4(tongue(t + 0.02, a, 0.0, k, er, et) - c, 0.0)).xyz;
        vV = -mv.xyz;
        vF = vec4(t, a, al, aPort.z);
        gl_Position = al < 0.003 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue; uniform float uGain, uPower, uTime; uniform vec2 uFade, uRoot;
      varying vec3 vN, vV, vT; varying vec4 vF;
      void main() {
        vec3 nn = vN / max(length(vN), 1e-5);
        vec3 vv = vV / max(length(vV), 1e-5);
        // lit by its thickness: the most where the eye goes through the middle, nothing at the outline…
        float nv = clamp(dot(nn, vv), 0.0, 1.0);
        // …and a flame that points at the eye is seen through its whole length: it is full, not a hollow ring
        float endOn = abs(dot(vv, vT / max(length(vT), 1e-5)));
        float body = pow(nv, mix(uPower, 0.3, endOn * endOn));
        float t = vF.x;
        // its tip is eaten by slow licks that travel up it
        float lick = 0.25 * sin(7.0 * t - 2.1 * uTime + 6.2832 * vF.w + 1.7 * sin(2.0 * vF.y + 9.0 * vF.w)) + 0.25 * sin(11.3 * t - 3.1 * uTime + 25.0 * vF.w + 3.0 * vF.y);
        float along = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(uFade.x, uFade.y, t + 0.14 * lick));
        // brightest at its root, deeper toward its tip (the same hue, less of it)
        float hot = 1.0 - smoothstep(0.0, uRoot.x, t);
        gl_FragColor = vec4(uHue * (body * along * uGain * vF.z * mix(uRoot.y, 1.15, hot)), 1.0);
      }`,
  });

/**
 * The light the crown throws on what is around it — a light that has a place: a ring on the hob's top, a ring
 * under the saucepan's bottom (seen only through a pan of glass), a band up the foot of its wall, a sheen on the
 * cap that is brightest at its rim. Each dies round the ring with the flames.
 * `band`: 0 a flat ring (peak radius, width) · 1 the wall of the pan · 2 the cap (peak: its radius).
 */
const glowMat = (SH, { gain, peak = 6.4, wide = 2.2, reach = 14, band = 0 }) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: SH.uTime, uFront: SH.uFront, uHue: { value: SIGNAL.clone() }, uGain: { value: gain }, uRing: { value: new THREE.Vector4(peak, wide, reach, band) }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      ${CONSTS}
      uniform vec3 uHue; uniform float uTime, uFront, uGain, uAmount; uniform vec4 uRing; varying vec3 vP;
      void main() {
        float r = max(length(vP.xz), 0.5);
        float d = abs(mod(atan(vP.z, vP.x) - SPILL_AT + K_PI, 2.0 * K_PI) - K_PI);
        float al = smoothstep(uFront - 0.3, uFront + EDGE + 0.4, d); // light spreads: its edge is wider than the flames'
        float x = (r - uRing.x) / uRing.y;
        float ring = (0.75 * exp(-x * x) + 0.25 / (1.0 + 0.5 * x * x)) * (1.0 - smoothstep(0.55 * uRing.z, uRing.z, r));
        float up = clamp(1.0 - (vP.y - POT_Y) / uRing.z, 0.0, 1.0);
        float rim = clamp(r / uRing.x, 0.0, 1.0);
        float g = uRing.w < 0.5 ? ring : (uRing.w < 1.5 ? up * up * up : rim * rim * rim);
        gl_FragColor = vec4(uHue * (g * al * uGain * uAmount * (0.95 + 0.05 * sin(uTime * 1.3))), 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── 2 · the gas: streaks that face the eye */

/** Catmull-Rom through `ctrl` (points of any dimension), `u` from 0 to ctrl.length − 1. */
function spline(ctrl, u) {
  const last = ctrl.length - 1;
  const i = Math.min(last - 1, Math.max(0, Math.floor(u)));
  const t = u - i;
  const p0 = ctrl[Math.max(0, i - 1)];
  const p1 = ctrl[i];
  const p2 = ctrl[i + 1];
  const p3 = ctrl[Math.min(last, i + 2)];
  return p1.map((_, k) => 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t * t * t));
}

/** `m` points along the curve through `ctrl`, evenly spaced in LENGTH: a puff then travels at one speed all the way. */
function resample(ctrl, m) {
  const N = 200;
  const dense = [];
  for (let i = 0; i <= N; i++) dense.push(spline(ctrl, (i / N) * (ctrl.length - 1)));
  const len = [0];
  for (let i = 1; i <= N; i++) len.push(len[i - 1] + Math.hypot(...dense[i].map((v, k) => v - dense[i - 1][k])));
  const out = [];
  let j = 0;
  for (let i = 0; i < m; i++) {
    const want = (i / (m - 1)) * len[N];
    while (j < N - 1 && len[j + 1] < want) j++;
    const t = clamp01((want - len[j]) / Math.max(len[j + 1] - len[j], 1e-6));
    out.push(dense[j].map((v, k) => v + (dense[j + 1][k] - v) * t));
  }
  return out;
}

/** Streaks gathered into one mesh. Each is a line of points; the shader lays a ribbon along it, turned to the eye. */
function streaks() {
  const P = [];
  const Q = [];
  const TP = [];
  const TQ = [];
  const R = [];
  const W = [];
  const index = [];
  let count = 0;
  const tangent = (pts, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const l = Math.hypot(...d) || 1;
    return [d[0] / l, d[1] / l, d[2] / l];
  };
  return {
    /** `a`: its path under the saucepan · `b`: its path with no saucepan (same count) · `port`: how far round from the spill (−1: not a port's) · `width(s)`: half its width, cm. */
    add(a, b, { seed, port = -1, width }) {
      for (let i = 0; i < a.length; i++) {
        const s = i / (a.length - 1);
        for (const side of [-1, 1]) {
          P.push(...a[i]);
          Q.push(...b[i]);
          TP.push(...tangent(a, i));
          TQ.push(...tangent(b, i));
          R.push(s, side, seed, port);
          W.push(width(s));
        }
        if (i < a.length - 1) index.push(count, count + 1, count + 2, count + 1, count + 3, count + 2);
        count += 2;
      }
    },
    mesh(material) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
      geo.setAttribute("aAlt", new THREE.Float32BufferAttribute(Q, 3));
      geo.setAttribute("aTan", new THREE.Float32BufferAttribute(TP, 3));
      geo.setAttribute("aTanAlt", new THREE.Float32BufferAttribute(TQ, 3));
      geo.setAttribute("aRib", new THREE.Float32BufferAttribute(R, 4));
      geo.setAttribute("aWide", new THREE.Float32BufferAttribute(W, 1));
      geo.setIndex(index);
      const mesh = new THREE.Mesh(geo, material);
      mesh.frustumCulled = false;
      mesh.renderOrder = 3;
      return mesh;
    },
  };
}

/**
 * The haze. Dull signal, no heart: wide soft ribbons, and along each, puffs that travel slowly up it.
 * It is MATTER, not light: each streak is laid OVER the picture (one dull colour, more or less dense), never added.
 * Added up, sixty streaks seen edge-on under the saucepan made a band as bright as a flame, a blaze over the hob seen
 * from the door, and pink in front of the foam. Laid over, however many overlap they only tend to that one dull
 * colour; in front of something bright they tint and dim it, in front of the dark they show.
 *   gain   the colour of the haze where it is opaque (signal × gain)       dense   how opaque one streak is at its densest
 *   puffs / flow   puffs along a streak · how many pass a point per second
 *   sway   how far its end wanders, cm                             top            [from, to] along it: where it thins out to nothing
 *   start  how far along it has come to its full density            source         how much denser it is where it leaves (1: no denser)
 */
const hazeMat = (SH, { gain = 0.33, dense, puffs = 3, flow = 0.25, sway = 2, top = [0.5, 1], start = 0.05, source = 1 }) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: SH.uTime, uPot: SH.uPot, uFront: SH.uFront,
      uHue: { value: SIGNAL.clone().multiplyScalar(gain) }, uDense: { value: dense }, uAmount: { value: 0 }, uHead: { value: 0 },
      uFlow: { value: new THREE.Vector3(puffs, flow, sway) }, uTop: { value: new THREE.Vector4(top[0], top[1], start, source) },
    },
    vertexShader: /* glsl */ `
      ${CONSTS}
      uniform float uTime, uPot, uFront, uAmount; uniform vec3 uFlow;
      attribute vec3 aAlt, aTan, aTanAlt; attribute vec4 aRib; attribute float aWide;
      varying vec4 vR;
      void main() {
        float s = aRib.x;
        vec3 p = mix(aAlt, position, uPot);
        vec3 tn = mix(aTanAlt, aTan, uPot);
        // it wanders, more and more as it goes — slowly
        float w1 = sin(uTime * 0.5 + aRib.z * 40.0 + s * 5.0);
        float w2 = cos(uTime * 0.37 + aRib.z * 23.0 + s * 3.5);
        p += vec3(w1, 0.25 * w2, w2) * (uFlow.z * s * s);
        // a port gives gas only once its flame is dead
        float emit = aRib.w < 0.0 ? 1.0 : 1.0 - smoothstep(uFront, uFront + EDGE, aRib.w);
        // the ribbon is turned to the eye in space: its width runs across both its path and the line of sight.
        // A streak that points at the eye has no width to show (and its ribbon would twist): it fades — its neighbours are there
        vec3 pw = (modelMatrix * vec4(p, 1.0)).xyz;
        vec3 tw = (modelMatrix * vec4(tn, 0.0)).xyz;
        tw /= max(length(tw), 1e-5);
        vec3 eye = cameraPosition - pw;
        eye /= max(length(eye), 1e-3);
        vec3 across = cross(tw, eye);
        float sine = length(across);
        across /= max(sine, 1e-4);
        vR = vec4(s, aRib.y, aRib.z, emit * smoothstep(0.1, 0.4, sine));
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        if (emit * uAmount > 0.003) gl_Position = projectionMatrix * viewMatrix * vec4(pw + across * (aRib.y * aWide), 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue, uFlow; uniform vec4 uTop; uniform float uTime, uDense, uAmount, uHead;
      varying vec4 vR;
      void main() {
        float s = vR.x;
        float x = vR.y;
        float across = max(exp(-2.4 * x * x) - 0.0907, 0.0);
        // threads inside the streak, drifting slowly across it
        across *= 0.8 + 0.2 * sin(x * 4.4 + s * 9.0 + vR.z * 50.0 - uTime * 0.45);
        float puff = 0.5 + 0.5 * sin(6.2832 * (s * uFlow.x - uTime * uFlow.y + vR.z * 7.0));
        puff = puff * puff * (3.0 - 2.0 * puff);
        float along = smoothstep(0.0, uTop.z, s) * (1.0 - smoothstep(uTop.x, uTop.y, s)) * (1.0 - smoothstep(uHead - 0.22, uHead, s)) * mix(uTop.w, 0.6, smoothstep(0.0, 0.3, s));
        gl_FragColor = vec4(uHue, clamp(across * along * (0.5 + 0.5 * puff) * vR.w * uAmount * uDense, 0.0, 0.8));
      }`,
  });

/** The streaks of the burner: two per port, under the saucepan then up around it — or, with no saucepan, gathering above the cap. */
function burnerHaze(rand) {
  const S = streaks();
  const M = 44;
  for (let k = 0; k < PORTS; k++) {
    for (let j = 0; j < 2; j++) {
      const out = rand();
      const high = rand();
      const th = portAt(k) + (rand() - 0.5) * 0.12;
      const drift = (rand() - 0.5) * 0.7;
      const wave = rand() * TAU;
      const curl = 6 + 5 * rand();
      // (radius, height) — it never gathers into tongues: it opens out as it rises and it meanders, a mist, not a blaze
      const potted = [[R0, Y0], [6.4, 2.7], [8.8, 3.5], [11.0 + 0.4 * out, 4.0], [12.2 + out, 6.6], [13.0 + 2 * out, 11], [13.6 + 3.4 * out, 17 + 2 * high], [14 + 5.5 * out, 24 + 4 * high], [14.5 + 8 * out, 30 + 6 * high]];
      const free = [[R0, Y0], [5.8, 2.2], [6.9 + 0.4 * out, 4.0], [7.2 + out, 7.5], [6.8 + 2.4 * out, 12], [6.4 + 4.4 * out, 16 + 2 * high], [6.2 + 6.6 * out, 20 + 3 * high], [6 + 9 * out, 24 + 4 * high], [6 + 11 * out, 27 + 5 * high]];
      const lay = (ctrl) =>
        resample(ctrl, M).map(([r, y], i) => {
          const s = i / (M - 1);
          const a = th + drift * s * s + 0.24 * Math.sin(s * curl + wave) * Math.pow(s, 1.2);
          const rr = r + 1.6 * Math.sin(s * (curl + 2) + 2 * wave) * s;
          return [rr * Math.cos(a), y, rr * Math.sin(a)];
        });
      S.add(lay(potted), lay(free), { seed: rand(), port: fromSpill(portAt(k)), width: (s) => 0.45 + 5.4 * Math.pow(s, 0.8) });
    }
  }
  return S;
}

/** The column, in the kitchen: from around the saucepan, under the hood, out past its front lip, up to the ceiling. */
function columnHaze(rand) {
  const S = streaks();
  const [bx, by, bz] = SYSTEM.home;
  const lip = HOOD.depth; // the canopy's front edge (z): the gas goes round it
  // (x, y, z, radius of the bundle)
  const core = [
    [bx, by + 12, bz, 12.5],
    [bx, by + 30, bz + 1, 11],
    [bx - 1, HOOD.y - 12, bz + 5, 10],
    [bx - 3, HOOD.y - 2.5, lip - 1, 9],
    [bx - 5, HOOD.y + 3, lip + 9, 8],
    [bx - 6, HOOD.y + 20, lip + 13, 10],
    [bx - 5, HOOD.y + 55, lip + 15, 14],
    [bx - 4, CEILING - 14, lip + 17, 20],
    [bx - 3, CEILING - 2, lip + 18, 34],
  ];
  const M = 48;
  const STRANDS = 18;
  const line = resample(core, M);
  for (let j = 0; j < STRANDS; j++) {
    const at = (j / STRANDS) * TAU + rand() * 0.3;
    const inner = 0.25 + 0.75 * Math.sqrt(rand());
    const twist = (rand() - 0.5) * 2.4;
    const pts = line.map(([x, y, z, r], i) => {
      const s = i / (M - 1);
      const a = at + twist * s;
      const k = r * (1 + (inner - 1) * smooth(0, 0.3, s)); // a ring round the saucepan first, then a full column
      // under the canopy it is flat: nothing of it goes through the hood
      const under = y > HOOD.y - 1.5 && y < HOOD.y + 6 ? Math.max(z + k * Math.sin(a), lip + 1.5) : z + k * Math.sin(a);
      return [x + k * Math.cos(a), y, under];
    });
    S.add(pts, pts, { seed: rand(), width: (s) => 7 + 12 * s });
  }
  return { S, top: line[M - 1] };
}

/* ───────────────────────────────────────────────────────────── 3 · the layer under the ceiling: a volume */

/** A block of noise that tiles (three octaves of value noise), for the layer to be marched through. */
function noiseBlock(size, seed) {
  const rand = rng(seed);
  const lattice = (cells) => {
    const g = new Float32Array(cells * cells * cells);
    for (let i = 0; i < g.length; i++) g[i] = rand();
    const at = (x, y, z) => g[((x % cells) * cells + (y % cells)) * cells + (z % cells)];
    const ease = (t) => t * t * (3 - 2 * t);
    return (u, v, w) => {
      const x = u * cells;
      const y = v * cells;
      const z = w * cells;
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const zi = Math.floor(z);
      const fx = ease(x - xi);
      const fy = ease(y - yi);
      const fz = ease(z - zi);
      const lerp = (a, b, t) => a + (b - a) * t;
      return lerp(
        lerp(lerp(at(xi, yi, zi), at(xi, yi, zi + 1), fz), lerp(at(xi, yi + 1, zi), at(xi, yi + 1, zi + 1), fz), fy),
        lerp(lerp(at(xi + 1, yi, zi), at(xi + 1, yi, zi + 1), fz), lerp(at(xi + 1, yi + 1, zi), at(xi + 1, yi + 1, zi + 1), fz), fy),
        fx,
      );
    };
  };
  const o1 = lattice(4);
  const o2 = lattice(8);
  const o3 = lattice(16);
  const data = new Uint8Array(size * size * size);
  let i = 0;
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x + 0.5) / size;
        const v = (y + 0.5) / size;
        const w = (z + 0.5) / size;
        const value = (o1(u, v, w) + 0.5 * o2(u, v, w) + 0.25 * o3(u, v, w)) / 1.75;
        data[i++] = Math.round(255 * clamp01(0.5 + (value - 0.5) * 2.1));
      }
    }
  }
  const tex = new THREE.Data3DTexture(data, size, size, size);
  tex.format = THREE.RedFormat;
  tex.type = THREE.UnsignedByteType;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.RepeatWrapping;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}

/**
 * The gas under the ceiling. The eye's ray is marched through the slab between the layer's underside and the
 * ceiling: what it meets first hides what is behind (the layer has billows, a near one stands in front of a far
 * one), its underside is the brightest and it gets darker deep inside. Laid over the picture, it dims what is in
 * it and leaves alone what is under it.
 */
function makeLayer(source) {
  const uniforms = {
    uNoise: { value: noiseBlock(48, 77) }, uHue: { value: SIGNAL.clone() }, uTime: { value: 0 },
    uMin: { value: new THREE.Vector3(ROOM.x0, LAYER_LOW - 20, ROOM.z0) }, uMax: { value: new THREE.Vector3(ROOM.x1, CEILING, ROOM.z1) },
    uBottom: { value: CEILING }, uSpread: { value: 0 }, uAmount: { value: 0 }, uGain: { value: 0.55 }, uSource: { value: new THREE.Vector2(source[0], source[2]) },
  };
  const geo = new THREE.BoxGeometry(ROOM.x1 - ROOM.x0, CEILING - (LAYER_LOW - 20), ROOM.z1 - ROOM.z0);
  geo.translate((ROOM.x0 + ROOM.x1) / 2, (CEILING + LAYER_LOW - 20) / 2, (ROOM.z0 + ROOM.z1) / 2);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.BackSide, // the far walls of the slab: they cover it whether the eye is outside or inside
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */ `
        varying vec3 vP, vEye;
        void main() {
          vP = position;
          vEye = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        precision highp sampler3D;
        uniform sampler3D uNoise; uniform vec3 uHue, uMin, uMax; uniform vec2 uSource; uniform float uTime, uBottom, uSpread, uAmount, uGain;
        varying vec3 vP, vEye;
        const float BILLOW = 36.0; // how far its underside hangs and rises around uBottom, cm (± half of it)
        float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        void main() {
          vec3 rd = vP - vEye;
          rd /= max(length(rd), 1e-4);
          rd += (1.0 - step(1e-5, abs(rd))) * 1e-5; // never a division by zero
          vec3 lo = vec3(uMin.x, max(uMin.y, uBottom - 0.5 * BILLOW), uMin.z);
          vec3 t0 = (lo - vEye) / rd;
          vec3 t1 = (uMax - vEye) / rd;
          vec3 ta = min(t0, t1);
          vec3 tb = max(t0, t1);
          float tn = max(max(ta.x, ta.y), max(ta.z, 0.0));
          float tf = min(tb.x, min(tb.y, tb.z));
          if (tf <= tn) discard;
          const int STEPS = 22;
          float ds = (tf - tn) / float(STEPS);
          // each instant of the shutter starts its march elsewhere: sixteen coarse marches make one fine one
          float j = hash(gl_FragCoord.xy + fract(uTime * 13.7) * 61.0);
          // toward the light: from below, on the left of the picture — every billow has a bright side and a dark one
          const vec3 TO_LIGHT = vec3(-0.50, -0.62, -0.60);
          vec3 drift = vec3(0.006, -0.002, 0.004) * uTime;
          float through = 1.0;
          float light = 0.0;
          for (int i = 0; i < STEPS; i++) {
            vec3 p = vEye + rd * (tn + (float(i) + j) * ds);
            float n1 = textureLod(uNoise, p / 520.0 + drift, 0.0).r;
            float under = uBottom + BILLOW * (n1 - 0.5); // its underside is not a plane: it hangs in billows
            float h = clamp((p.y - under) / 10.0, 0.0, 1.0);
            float spread = 1.0 - smoothstep(0.55 * uSpread, uSpread, length(p.xz - uSource));
            if (h * spread > 0.0) {
              float n2 = textureLod(uNoise, p / 170.0 - 1.7 * drift + 0.37, 0.0).r;
              vec3 q = p + TO_LIGHT * 24.0;
              float hl = clamp((q.y - uBottom - BILLOW * (textureLod(uNoise, q / 520.0 + drift, 0.0).r - 0.5)) / 10.0, 0.0, 1.0);
              float rho = h * h * (3.0 - 2.0 * h) * clamp(0.5 + 1.3 * (n2 - 0.5), 0.1, 1.0) * spread * uAmount;
              float a = 1.0 - exp(-rho * ds * 0.0065);
              // bright where the way to the light is clear, dark where it goes deeper in; darker deep inside
              float lit = mix(0.16, 1.0, clamp(0.5 + 0.9 * (h - hl) + 0.5 * (1.0 - h), 0.0, 1.0));
              light += through * a * lit;
              through *= 1.0 - a;
            }
          }
          gl_FragColor = vec4(uHue * (light * uGain), 1.0 - through);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 40; // over everything: the glass of the kitchen is in it
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── 4 · the spark */

/** A ball of light with no edge, always facing the eye: a small white-hot heart, a soft body, a long tail, four thin rays. `size`: its radius, cm. */
function makeSpark(at) {
  const uniforms = { uView: { value: VIEW }, uCenter: { value: new THREE.Vector3(...at) }, uInk: { value: INK.clone() }, uSize: { value: 10 }, uAmount: { value: 0 } };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false, // a spark behind a hand is no spark
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform vec3 uCenter; uniform float uSize, uAmount; uniform vec2 uView; varying vec2 vUv;
        void main() {
          vUv = position.xy;
          vec4 c = projectionMatrix * viewMatrix * modelMatrix * vec4(uCenter, 1.0);
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (uAmount > 0.001 && c.w > 1.0) {
            float s = clamp(uSize * 0.5 * uView.y * projectionMatrix[1][1] / c.w, 30.0, 260.0);
            gl_Position = vec4(c.xy / c.w + position.xy * s / (uView * 0.5), c.z / c.w, 1.0);
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk; uniform float uAmount; varying vec2 vUv;
        void main() {
          float r2 = dot(vUv, vUv);
          float edge = 1.0 - smoothstep(0.5, 1.0, sqrt(r2));
          float core = exp(-r2 / 0.007);
          float body = 0.55 * exp(-r2 / 0.05);
          float tail = 0.22 / (1.0 + r2 / 0.012) * edge;
          vec2 q = abs(vUv);
          float rays = 0.9 * (exp(-q.y * q.y / 0.0012 - q.x * 2.6) + exp(-q.x * q.x / 0.0012 - q.y * 2.6)) * edge;
          gl_FragColor = vec4(uInk * ((core * 2.6 + rays + body + tail) * uAmount), 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 41;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the fire */

export function buildFire() {
  const rand = rng(1207);
  const crown = new THREE.Group(); // in the system's frame: world.js moves it with the system, to the hob or to the bench
  const room = new THREE.Group(); // in the kitchen's frame
  const drawn = new THREE.Group(); // all of the crown that is drawn (its light stays outside: a light never leaves the scene)
  crown.add(drawn);
  const SH = { uTime: { value: 0 }, uPot: { value: 1 }, uFront: { value: -EDGE } };

  /* the crown: three skins of the same tongues — the mantle, the body, the white heart.
     Signal and ink do not mix (a third of ink in signal is salmon): the body is pure signal, brighter at its root,
     the heart pure ink with a short edge, and neither goes past what the bloom picks up — a pink wash otherwise. */
  const tongues = makeTongues(rand);
  const skins = [
    flameMat(SH, { hue: SIGNAL, gain: 0.36, power: 1.6, radius: 2.3, share: 1.08, fade: [0.3, 1], root: 0.4, dim: 0.6 }),
    flameMat(SH, { hue: SIGNAL, gain: 1.05, power: 0.7, fade: [0.7, 1.03], root: 0.5, dim: 0.7 }),
    flameMat(SH, { hue: INK, gain: 1.22, power: 1.4, radius: 0.62, share: 0.5, fade: [0.45, 1], root: 0.6, dim: 0.9 }),
  ];
  const flames = new THREE.Group();
  skins.forEach((material, i) => {
    const mesh = new THREE.Mesh(tongues, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 4 + i;
    flames.add(mesh);
  });

  /* its light on what is around it */
  const flat = (inner, outer, y) => new THREE.RingGeometry(inner, outer, 96, 1).rotateX(-Math.PI / 2).translate(0, y, 0);
  const onHob = new THREE.Mesh(flat(3.9, 15, 0.07), glowMat(SH, { gain: 0.24, peak: 6.2, wide: 2.2, reach: 15 }));
  const underPot = new THREE.Mesh(flat(2, POT_R, POT_Y - 0.03), glowMat(SH, { gain: 0.12, peak: 7.2, wide: 2.0, reach: 10.4 }));
  const onCap = new THREE.Mesh(flat(0.3, PARTS.burner.capR - 0.36, PARTS.burner.capTop + 0.015), glowMat(SH, { gain: 0.3, peak: PARTS.burner.capR - 0.34, band: 2 }));
  const onWall = new THREE.Mesh(new THREE.CylinderGeometry(POT_R + 0.06, POT_R + 0.06, 3.4, 96, 1, true).translate(0, POT_Y + 1.7, 0), glowMat(SH, { gain: 0.22, reach: 3.4, band: 1 }));
  for (const mesh of [onHob, underPot, onWall, onCap]) mesh.renderOrder = 2;
  const light = new THREE.PointLight(BRAND.signal, 0, 90, 2);
  light.castShadow = false;
  crown.add(light);
  const LIGHT = 28;

  /* the gas */
  const hazeMaterial = hazeMat(SH, { dense: 0.36, puffs: 3, flow: 0.25, sway: 2.2, top: [0.32, 0.96], start: 0.015, source: 2.2 });
  const haze = burnerHaze(rand).mesh(hazeMaterial);
  drawn.add(flames, onHob, underPot, onWall, onCap, haze);

  /* the room: the column, the layer, the spark */
  const col = columnHaze(rand);
  const columnMaterial = hazeMat(SH, { dense: 0.2, puffs: 3.5, flow: 0.2, sway: 5, top: [0.94, 1.02], start: 0.26 });
  const column = col.S.mesh(columnMaterial);
  const layer = makeLayer(col.top);
  const spark = makeSpark([SWITCH.x - 0.6, SWITCH.y, SWITCH.z]);
  room.add(column, layer.mesh, spark.mesh);

  /* what a label can point at */
  const side = SPILL_AT - 0.75; // a flame on the camera's side that is not the first to die
  const A = {
    flame: anchor(crown, 0, 0, 0),
    haze: anchor(crown, 0, 0, 0),
    layer: anchor(room, 150, CEILING - 12, 150),
    spark: anchor(room, SWITCH.x - 0.6, SWITCH.y, SWITCH.z),
  };
  const put = (o, r, y) => o.position.set(r * Math.cos(side), y, r * Math.sin(side));

  return {
    crown, room, A,
    /** p: { bench, flame, gas, pot, spill, fill, spark, explode } — see FIRST in world.js. Uniforms only. */
    update(p, time) {
      const shown = !(p.explode > 0.05); // its parts apart on the bench: no fire, no gas
      const pot = p.pot > 0.5 ? 1 : 0;
      const flame = shown ? clamp01(p.flame) : 0;
      const gas = shown ? clamp01(p.gas) : 0;
      const fill = shown ? clamp01(p.fill) : 0;
      const sparked = shown ? Math.min(1.5, Math.max(0, p.spark)) : 0;
      drawn.visible = shown;
      room.visible = shown;
      SH.uTime.value = time;
      SH.uPot.value = pot;
      // The dying front: an angle from the spill, both ways round. −EDGE: every flame whole · π + EDGE: none left.
      // It runs fast at first and creeps over the last ones, on the far side.
      SH.uFront.value = -EDGE + (Math.PI + 2 * EDGE) * (1 - Math.pow(flame, 1.35));

      const lit = flame > 0.002;
      flames.visible = lit;
      onHob.visible = lit && !(p.bench > 0.5); // (on the bench there is no hob for the light to fall on)
      underPot.visible = onWall.visible = lit && pot === 1;
      onCap.visible = lit;
      // what is left of the light stands where the last flames are: on the far side from the spill
      light.intensity = LIGHT * Math.pow(flame, 0.8) * (0.95 + 0.05 * Math.sin(time * 1.3));
      light.position.set(-SPILL.dir[0] * R0 * (1 - flame), pot ? 3.4 : 4.8, -SPILL.dir[1] * R0 * (1 - flame));

      haze.visible = gas > 0.002;
      hazeMaterial.uniforms.uAmount.value = smooth(0, 0.2, gas);
      hazeMaterial.uniforms.uHead.value = 0.08 + 1.3 * gas; // it reaches further out and up as it comes

      // fill: 0 → 0.26 the column climbs to the ceiling · from 0.14 the layer spreads from where it arrives · then it thickens downward
      column.visible = fill > 0.002;
      columnMaterial.uniforms.uAmount.value = smooth(0, 0.06, fill);
      columnMaterial.uniforms.uHead.value = 0.05 + (1.22 * fill) / 0.26;
      const bottom = CEILING - 3 - (CEILING - 3 - LAYER_LOW) * Math.pow(clamp01((fill - 0.15) / 0.85), 1.1);
      layer.mesh.visible = fill > 0.14;
      layer.uniforms.uTime.value = time;
      layer.uniforms.uBottom.value = bottom;
      layer.uniforms.uAmount.value = clamp01((fill - 0.14) / 0.16);
      layer.uniforms.uSpread.value = 40 + 560 * smooth(0.14, 0.55, fill);

      spark.mesh.visible = sparked > 0.002;
      spark.uniforms.uAmount.value = sparked;
      spark.uniforms.uSize.value = 7 + 6 * sparked;

      put(A.flame, pot ? 6.6 : 6.0, pot ? 3.1 : 3.6);
      put(A.haze, pot ? 12.8 : 6.4, pot ? 11 : 16);
      A.layer.position.y = bottom;
    },
  };
}
