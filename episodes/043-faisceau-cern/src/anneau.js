// DOSSIER 043 — anneau.js : AROUND, X-ray, and the TRAIN — the ring's tunnel and its arc magnets, the beam pipe all round,
// the train of 2 496 bunches, the grain and its shower, the struck coil, one bunch drawn big and its twentieth, the 3 600
// loss monitors, the grain's bar, the alert's pulse to point 6, the comment's 37 grains; far away, the 044 teaser.
//
//   buildAnneau() → { group, A, update(p, time, px, eye) }
//   p = { shell, ring, beam, gap, dump, grain, spray, coil, hero, slice, sensors, loss, alert, sweep, grains, teaser }
//   A = anchors (world cm): grain, coilHit, hero, monitor, alertEnd, tally, teaser
//
// How it is drawn (docs/journal/043-anneau.md):
//  · its own glass (`xglass`): a surface seen from behind (the eye inside a magnet, the pipe, the tunnel) keeps only a
//    trace of its light — the X-ray never washes the frame white; what grazes the lens fades out; far away the lip widens
//    and softens (no shimmer) and the details go out, the ring's body stays.
//  · every piece of an arc magnet is built straight in the beam's frame (x along s, y up, z out) and BENT onto the ring
//    (a straight cylinder would let the pipe leave its coil). The 42 magnets outside the insertion are merged per material.
//  · the train is placed by its shader from `gap` and `dump`: nothing per bunch in `update`. A bunch is gone the instant
//    it passes point 6 (what sortie.js's stream picks up). Far away, a ribbon of light carries the train: white bunches,
//    the black gap, the wagons while they read.
//  · lines are ribbons drawn in pixels (≥ 2 px), each set fading with the distance to the eye where a shot needs it.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, setGlow, asShell, mergeGeometries, fatLine, edgesOf } from "@kit/build3d.js";
import { makePool } from "@kit/atmo.js";
import { rng } from "@kit/rng.js";
import { RING, C, PIPE, MAGNET, TUNNEL, BEAM, GRAIN, STRUCK, BLM, GRAIN_GROUP, S6, INSERTION, TEASER, ringAt, wrap } from "./plan.js";
import { dressTunnel } from "./habillage.js";

const TAU = Math.PI * 2;
const R0 = RING.r, CX = RING.centre[0], CZ = RING.centre[2];
const INK = new THREE.Color(BRAND.ink), VEILLE = new THREE.Color(BRAND.veille), SIGNAL = new THREE.Color(BRAND.signal);
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** Where things stand on the ring (arc s, cm downstream of the grain). */
const HERO_S = 100; // the bunch drawn big: 40 cm upstream of where its twentieth strikes
const HIT_S = STRUCK.hitS; // the shower's and the twentieth's hit on magnet 0's coil (inner lower side)
const GROUP_LEN = C / BLM.groups; // one group of 6 monitors every 47 cm
const RUNG = { from: 21, step: 4.6, len: 7, r: 1.15 }; // the 6 monitors of a group: bars lying across the cryostat's flank
const MON_S = GRAIN_GROUP * GROUP_LEN + RUNG.from + 2.5 * RUNG.step; // the grain's group, its middle
const MOUNT = { out: BLM.offset[2], up: BLM.offset[1] }; // upper outer flank of the cryostat
const CABLE = { out: 44.5, up: 17 }; // the alert runs just under the monitors
const GAUGE = { h: 20, w: 3.2, thr: 0.7 };
const TALLY = { from: -30, step: -12, up: PIPE.r + 3, ring: 2.3, ringUp: 6.2, n: 37 };
const TALLY_EYE = new THREE.Vector3(-0.87, 0, 0.5); // the rings face the tally's camera (world.js VIEW.tally, az −60)

/** A point in the beam's frame — arc s, `out` from the beam (outward +), `up` — in the world. */
function bp(s, out = 0, up = 0, o = [0, 0, 0]) {
  const th = s / R0, rad = R0 + out;
  o[0] = CX - rad * Math.sin(th);
  o[1] = up;
  o[2] = CZ + rad * Math.cos(th);
  return o;
}
/** Bend a piece built straight in the beam's frame (x along s from s0, y up, z out) onto the ring. */
function bend(geo, s0, loc = false) {
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  const L = loc ? new Float32Array(pos.count * 2) : null;
  for (let i = 0; i < pos.count; i++) {
    const s = s0 + pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (L) { L[i * 2] = s; L[i * 2 + 1] = Math.atan2(y, z); }
    const th = s / R0, sn = Math.sin(th), cs = Math.cos(th), rad = R0 + z;
    pos.setXYZ(i, CX - rad * sn, y, CZ + rad * cs);
    if (nor) {
      const nx = nor.getX(i), ny = nor.getY(i), nz = nor.getZ(i);
      nor.setXYZ(i, -nx * cs - nz * sn, ny, -nx * sn + nz * cs);
    }
  }
  if (L) geo.setAttribute("aLoc", new THREE.BufferAttribute(L, 2));
  geo.computeBoundingSphere();
  return geo;
}
/** An open tube along x (the beam), radius r; theta range as CylinderGeometry's (θ π→2π is the upper half). */
const tube = (r, len, radial, steps, t0 = 0, tl = TAU) => new THREE.CylinderGeometry(r, r, len, radial, steps, true, t0, tl).rotateZ(-Math.PI / 2);
/** A flat strip along x at height y, from z0 to z1 (the coil's midplane faces). */
const strip = (len, z0, z1, y, steps) => new THREE.PlaneGeometry(len, z1 - z0, steps, 1).rotateX(-Math.PI / 2).translate(0, y, (z0 + z1) / 2);

const RING_U = { uCentre: { value: new THREE.Vector3(...RING.centre) }, uR: { value: R0 }, uC: { value: C } };
const RING_GLSL = /* glsl */ `
  uniform vec3 uCentre; uniform float uR; uniform float uC;
  vec3 ringN(float s) { float th = s / uR; return vec3(-sin(th), 0.0, cos(th)); }
  vec3 ringT(float s) { float th = s / uR; return vec3(-cos(th), 0.0, -sin(th)); }
`;
/** The monitors' light along the ring: 0.3 standby, then a wave from point 6 round both ways, a crest at its front. */
const LEVEL_GLSL = /* glsl */ `
  uniform float uSensors; uniform float uS6;
  float sensorLevel(float s) {
    float base = 0.3 * clamp(uSensors / 0.3, 0.0, 1.0);
    if (uSensors <= 0.3) return base;
    float w = clamp((uSensors - 0.3) / 0.7, 0.0, 1.0) * 0.52 * uC;
    float d6 = abs(mod(s - uS6 + 0.5 * uC, uC) - 0.5 * uC);
    float lit = 1.0 - smoothstep(w - 120.0, w + 120.0, d6);
    float x = (d6 - w) / 380.0;
    float crest = uSensors < 0.995 ? exp(-x * x) : 0.0;
    return base + 0.7 * lit + 0.9 * crest * (1.0 - 0.5 * lit);
  }
`;

/**
 * The X-ray glass of this ring. Like the kit's `glass` (light where the surface turns away from the eye, a crisp lip),
 * plus: a face seen from BEHIND (the eye inside the shell) keeps only `back` of its light — from inside a magnet or the
 * pipe, every wall grazes the eye and the kit's glass washes the frame white; what grazes the lens fades (`near`);
 * far away the rim widens and the lip goes (`powerFar`: no shimmer of sub-pixel slivers); `far` puts the details out;
 * `uAmount` holds near the eye, `uFar` far from it (`mix`: shell → ring).
 */
function xglass({ rim = 0.3, power = 5, powerFar = 2.2, edge = 0.3, back = 0.12, near = [10, 50], far = [1e7, 2e7], mix = [2500, 7000], color = INK, tube = true } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    defines: tube ? { TUBE: 1 } : {},
    uniforms: {
      ...RING_U,
      uColor: { value: new THREE.Color(color) }, uRim: { value: rim }, uPower: { value: power }, uPowerFar: { value: powerFar },
      uEdge: { value: edge }, uBack: { value: back }, uAmount: { value: 1 }, uFar: { value: 1 },
      uFade: { value: new THREE.Vector4(near[0], near[1], far[0], far[1]) }, uMix: { value: new THREE.Vector2(...mix) },
    },
    vertexShader: /* glsl */ `
      uniform vec3 uCentre;
      varying vec3 vN; varying vec3 vV; varying vec3 vT; varying float vDist;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vDist = length(mv.xyz);
        vec2 r = (modelMatrix * vec4(position, 1.0)).xz - uCentre.xz;
        r /= max(length(r), 1e-3);
        vT = mat3(viewMatrix) * vec3(-r.y, 0.0, r.x); // the ring's tangent here: the axis of every tube of this set
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uRim, uPower, uPowerFar, uEdge, uBack, uAmount, uFar; uniform vec4 uFade; uniform vec2 uMix;
      varying vec3 vN; varying vec3 vV; varying vec3 vT; varying float vDist;
      void main() {
        float amt = mix(uAmount, uFar, smoothstep(uMix.x, uMix.y, vDist)) * smoothstep(uFade.x, uFade.y, vDist) * (1.0 - smoothstep(uFade.z, uFade.w, vDist));
        if (amt < 0.003) discard;
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        #ifdef TUBE
          // a tube seen along its length grazes the eye everywhere: judge the turn in its cross-section only, so it
          // draws as two outlines that run to the vanishing point, never as a glowing funnel
          vec3 t = normalize(vT);
          vec3 vp = v - dot(v, t) * t;
          float lp = length(vp);
          v = lp > 1e-4 ? vp / lp : v;
        #endif
        float facing = dot(n, v);
        float g = clamp(1.0 - abs(facing), 0.0, 1.0);
        float farK = smoothstep(1500.0, 14000.0, vDist);
        float light = uRim * pow(g, mix(uPower, uPowerFar, farK)) + uEdge * (1.0 - farK) * smoothstep(0.82, 0.985, g);
        light *= facing >= 0.0 ? 1.0 : uBack;
        gl_FragColor = vec4(uColor * light * amt, 1.0);
      }`,
  });
}

/**
 * Lines as ribbons in screen pixels (`width` ≥ 2), additive: `segs` [ax, ay, az, bx, by, bz, …], `params` two numbers at
 * each end [pa0, pa1, pb0, pb1, …] handed to `lineColor()` as vP. Trimmed at the eye (segments round the camera are
 * safe). `fade` [in0, in1, out0, out1]: in with the distance to the eye, then out; `mix`: uAmount near → uFar far.
 */
function ribbon(segs, params, { width = 2, color = INK, fade = [-2, -1, 1e7, 2e7], mix = [1e7, 2e7], decl = "", frag = "vec3 lineColor() { return uColor * vP.x; }", uniforms = {} } = {}) {
  const n = segs.length / 6;
  const A = new Float32Array(n * 12), B = new Float32Array(n * 12), Q = new Float32Array(n * 8), P = new Float32Array(n * 8);
  const idx = new Uint32Array(n * 6);
  const QS = [0, -1, 0, 1, 1, -1, 1, 1];
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 4; k++) {
      const v = i * 4 + k, e = QS[k * 2];
      for (let c = 0; c < 3; c++) {
        A[v * 3 + c] = segs[i * 6 + c];
        B[v * 3 + c] = segs[i * 6 + 3 + c];
      }
      Q[v * 2] = e;
      Q[v * 2 + 1] = QS[k * 2 + 1];
      P[v * 2] = params ? params[i * 4 + e * 2] : 1;
      P[v * 2 + 1] = params ? params[i * 4 + e * 2 + 1] : 0;
    }
    const b = i * 4;
    idx[i * 6] = b; idx[i * 6 + 1] = b + 1; idx[i * 6 + 2] = b + 2;
    idx[i * 6 + 3] = b + 2; idx[i * 6 + 4] = b + 1; idx[i * 6 + 5] = b + 3;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(A, 3));
  geo.setAttribute("aA", new THREE.BufferAttribute(A, 3));
  geo.setAttribute("aB", new THREE.BufferAttribute(B, 3));
  geo.setAttribute("aQ", new THREE.BufferAttribute(Q, 2));
  geo.setAttribute("aP", new THREE.BufferAttribute(P, 2));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, // the quads wind clockwise on screen
    uniforms: {
      uRes: { value: RES }, uWidth: { value: width }, uColor: { value: new THREE.Color(color) }, uAmount: { value: 1 }, uFar: { value: 1 },
      uFade: { value: new THREE.Vector4(...fade) }, uMix: { value: new THREE.Vector2(...mix) }, ...uniforms,
    },
    vertexShader: /* glsl */ `
      attribute vec3 aA; attribute vec3 aB; attribute vec2 aQ; attribute vec2 aP;
      uniform vec2 uRes; uniform float uWidth;
      varying vec2 vP; varying float vDist; varying float vSide;
      void main() {
        vec4 a = modelViewMatrix * vec4(aA, 1.0);
        vec4 b = modelViewMatrix * vec4(aB, 1.0);
        const float NZ = -0.4;
        if (a.z > NZ && b.z > NZ) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
        if (a.z > NZ) a = mix(a, b, (a.z - NZ) / (a.z - b.z));
        if (b.z > NZ) b = mix(b, a, (b.z - NZ) / (b.z - a.z));
        vec4 ca = projectionMatrix * a; vec4 cb = projectionMatrix * b;
        vec2 d = (cb.xy / cb.w - ca.xy / ca.w) * uRes;
        float L = length(d);
        d = L > 1e-5 ? d / L : vec2(1.0, 0.0);
        vec2 nn = vec2(-d.y, d.x);
        vec4 c = aQ.x < 0.5 ? ca : cb;
        c.xy += (nn * aQ.y + d * (aQ.x < 0.5 ? -0.5 : 0.5)) * uWidth / uRes * c.w;
        gl_Position = c;
        vP = aP; vSide = aQ.y;
        vDist = length((aQ.x < 0.5 ? a : b).xyz);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uFar; uniform vec4 uFade; uniform vec2 uMix;
      varying vec2 vP; varying float vDist; varying float vSide;
      ${decl}
      ${frag}
      void main() {
        float amt = mix(uAmount, uFar, smoothstep(uMix.x, uMix.y, vDist)) * smoothstep(uFade.x, uFade.y, vDist) * (1.0 - smoothstep(uFade.z, uFade.w, vDist));
        if (amt < 0.003) discard;
        vec3 col = lineColor() * amt * (1.0 - 0.45 * smoothstep(0.35, 1.0, abs(vSide)));
        if (col.r + col.g + col.b < 0.0015) discard;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  return mesh;
}
/** Segment accumulators for `ribbon`. */
const lineSet = () => ({ s: [], p: [] });
function seg(L, a, b, pa = 1, pb = pa, qa = 0, qb = qa) {
  L.s.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  L.p.push(pa, qa, pb, qb);
}
/** A circle (or an arc) round the beam's axis at arc s: centre offset (out0, up0), radius r, angles from +out toward +up. */
function circle(L, s, r, { out0 = 0, up0 = 0, a0 = 0, a1 = TAU, n = 32, k = 1 } = {}) {
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const q = bp(s, out0 + r * Math.cos(a), up0 + r * Math.sin(a));
    if (prev) seg(L, prev, q, k);
    prev = q;
  }
}
/** A line along the ring from s0 to s1 at (out, up), cut every `step` cm (it follows the curve). */
function along(L, s0, s1, out, up, step = 40, k = 1) {
  const n = Math.max(1, Math.ceil(Math.abs(s1 - s0) / step));
  let prev = bp(s0, out, up);
  for (let i = 1; i <= n; i++) {
    const q = bp(s0 + ((s1 - s0) * i) / n, out, up);
    seg(L, prev, q, k);
    prev = q;
  }
}

/** A ball of light without an edge (brightest where it faces the eye). */
function soft(color, k = 1, power = 2) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color).multiplyScalar(k) }, uPower: { value: power }, uK: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower, uK; varying vec3 vN; varying vec3 vV;
      void main() { float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower); gl_FragColor = vec4(uColor * f * uK, 1.0); }`,
  });
}

/** A floor of grid lines only (never a solid floor in an X-ray set): `polar` along the ring's tunnel, else flat round `centre`. */
function gridMat({ polar, cell = 30, fadeD = 800, radius = 200 }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    defines: polar ? { POLAR: 1 } : {},
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 0.1 }, uCell: { value: cell }, uFadeD: { value: fadeD }, uRadius: { value: radius } },
    vertexShader: /* glsl */ `
      attribute vec2 aG; varying vec2 vG; varying float vDist;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        #ifdef POLAR
          vG = aG;
        #else
          vG = position.xz;
        #endif
        vDist = length(mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uCell, uFadeD, uRadius; varying vec2 vG; varying float vDist;
      float lines(float x, float cell) {
        float q = x / cell;
        float w = max(fwidth(q) * 1.4, 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return (1.0 - smoothstep(0.0, w, d)) * (1.0 - smoothstep(0.12, 0.45, w));
      }
      void main() {
        float g = 0.45 * max(lines(vG.x, uCell), lines(vG.y, uCell)) + max(lines(vG.x, uCell * 5.0), lines(vG.y, uCell * 5.0));
        #ifdef POLAR
          float edge = smoothstep(-176.0, -150.0, vG.y) * (1.0 - smoothstep(30.0, 56.0, vG.y));
        #else
          float edge = 1.0 - smoothstep(uRadius * 0.6, uRadius, length(vG));
        #endif
        gl_FragColor = vec4(uColor * g * edge * exp(-vDist / uFadeD) * uAmount, 1.0);
      }`,
  });
}

/** Embers falling off what heats (the kit's recipe, 003/shaft.js): born again every period, alive on the first frame. */
function makeEmbers({ count = 26, seed = 43 } = {}) {
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) seeds.set([rand(), 1.4 + rand() * 1.2, 0.12 + Math.pow(rand(), 2) * 0.3, rand() * TAU], i * 4);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uScale: { value: 1 }, uAmount: { value: 0 }, uOrigin: { value: new THREE.Vector3() }, uHot: { value: new THREE.Color(1, 0.62, 0.38).multiplyScalar(2.4) }, uCool: { value: SIGNAL.clone().multiplyScalar(1.8) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale; uniform vec3 uOrigin; attribute vec4 aSeed; varying float vAge;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          vAge = age;
          float o = 0.6 + 2.2 * age;
          vec3 p = uOrigin + vec3(cos(aSeed.w) * o, -(2.0 * age + 7.0 * age * age), sin(aSeed.w) * o);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aSeed.z * uScale / max(0.5, -mv.z), 1.5, 9.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; uniform float uAmount; varying float vAge;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - d), 1.6) * sin(3.14159 * vAge) * uAmount;
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.0, 0.7, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  return { points, uniforms };
}

export function buildAnneau() {
  const group = new THREE.Group();
  group.name = "anneau";
  const rand = rng(4300);

  /* ── the arc magnets: 42 outside the insertion, bent onto the ring, merged per material ── */
  const mids = [];
  for (let i = 0; i < MAGNET.count; i++) {
    const mid = MAGNET.firstAt + i * MAGNET.period + MAGNET.length / 2;
    const w = wrap(mid);
    if (w > INSERTION.from - MAGNET.length / 2 && w < INSERTION.to + MAGNET.length / 2) continue;
    mids.push(mid);
  }
  const ML = MAGNET.length, H = ML / 2, ST = 12;
  const { rIn, rOut } = MAGNET.coil;
  const coilPieces = (inflate = 0) => [
    tube(rOut + inflate, ML, 14, ST, Math.PI + 0.06, Math.PI - 0.12), tube(rIn - inflate, ML, 10, ST, Math.PI + 0.06, Math.PI - 0.12), // upper half-shell
    tube(rOut + inflate, ML, 14, ST, 0.06, Math.PI - 0.12), tube(rIn - inflate, ML, 10, ST, 0.06, Math.PI - 0.12), // lower half-shell
    strip(ML, -rOut - inflate, -rIn + inflate, 0.35, ST), strip(ML, rIn - inflate, rOut + inflate, 0.35, ST),
    strip(ML, -rOut - inflate, -rIn + inflate, -0.35, ST), strip(ML, rIn - inflate, rOut + inflate, -0.35, ST),
  ];
  const cryoGeo = mergeGeometries(mids.map((m) => bend(tube(MAGNET.cryo.r, ML, 48, ST), m)));
  const yokeGeo = mergeGeometries(mids.map((m) => bend(tube(MAGNET.yoke.r, ML, 36, ST), m)));
  const coilGeo = mergeGeometries(mids.flatMap((m) => coilPieces().map((g) => bend(g, m))));
  const cryoMat = xglass({ rim: 0.46, power: 4.5, powerFar: 2.5, edge: 0.5, back: 0.06, near: [18, 70], mix: [700, 3500] });
  const yokeMat = xglass({ rim: 0.2, power: 5, edge: 0.2, back: 0.05, near: [12, 45], far: [1600, 3000] });
  const coilMat = xglass({ rim: 0.52, power: 4, edge: 0.45, back: 0.15, near: [6, 22], far: [1800, 3400] });
  const cryo = new THREE.Mesh(cryoGeo, cryoMat), yoke = new THREE.Mesh(yokeGeo, yokeMat), coils = new THREE.Mesh(coilGeo, coilMat);
  for (const m of [cryo, yoke, coils]) m.frustumCulled = false;
  asShell(coils, 13);
  asShell(yoke, 15);
  asShell(cryo, 17);
  group.add(coils, yoke, cryo);

  /* ── the pipe, all round (glass), and the tunnel seen from outside (glass, only when the eye is out of it) ── */
  const pipeMat = xglass({ rim: 0.48, power: 5, powerFar: 2.5, edge: 0.42, back: 0.15, near: [4, 16], far: [2600, 6500] });
  const pipe = new THREE.Mesh(new THREE.TorusGeometry(R0, PIPE.r, 16, 2880).rotateX(Math.PI / 2).translate(CX, 0, CZ), pipeMat);
  pipe.frustumCulled = false;
  asShell(pipe, 11);
  const tunMat = xglass({ rim: 0.1, power: 5, powerFar: 2.6, edge: 0.05, back: 0 });
  const tunnelShell = new THREE.Mesh(new THREE.TorusGeometry(R0 - TUNNEL.inward, TUNNEL.r, 28, 720).rotateX(Math.PI / 2).translate(CX, TUNNEL.up, CZ), tunMat);
  tunnelShell.frustumCulled = false;
  asShell(tunnelShell, 19);
  group.add(pipe, tunnelShell);

  /* ── the magnets' lines: flanges, coil ends, the empty twin aperture, the interconnect bellows, the supports ── */
  const MR = lineSet(), MD = lineSet();
  for (const m of mids) {
    for (const e of [m - H, m + H]) {
      circle(MR, e, MAGNET.cryo.r, { n: 44, k: 0.62 });
      circle(MR, e, MAGNET.cryo.r - 3, { n: 44, k: 0.26 });
      circle(MR, e, MAGNET.yoke.r, { n: 36, k: 0.34 });
      for (const [a0, a1] of [[0.06, Math.PI - 0.06], [Math.PI + 0.06, TAU - 0.06]]) {
        circle(MR, e, rOut, { a0, a1, n: 14, k: 0.8 });
        circle(MR, e, rIn, { a0, a1, n: 12, k: 0.55 });
        for (const a of [a0, a1]) seg(MR, bp(e, rIn * Math.cos(a), rIn * Math.sin(a)), bp(e, rOut * Math.cos(a), rOut * Math.sin(a)), 0.6);
      }
      circle(MD, e, rOut, { out0: -MAGNET.twin, n: 20, k: 0.26 }); // the other beam's aperture: empty, fine lines
      circle(MD, e, rIn, { out0: -MAGNET.twin, n: 16, k: 0.18 });
    }
    for (const up of [rOut, -rOut]) along(MD, m - H, m + H, -MAGNET.twin, up, 60, 0.16);
    for (let b = 1; b <= 3; b++) circle(MD, m + H + (b * (MAGNET.period - ML)) / 4, 24, { n: 28, k: 0.36 });
    for (const sx of [m - 170, m + 170]) {
      for (const side of [-1, 1]) seg(MD, bp(sx, side * 22, -MAGNET.cryo.r + 4), bp(sx, side * 34, TUNNEL.floor), 0.4);
      seg(MD, bp(sx, -40, TUNNEL.floor), bp(sx, 40, TUNNEL.floor), 0.4);
      seg(MD, bp(sx, -27, -72), bp(sx, 27, -72), 0.28);
    }
  }
  const magRings = ribbon(MR.s, MR.p, { width: 2, fade: [20, 70, 2000, 3600], mix: [500, 2200] });
  const magLines = ribbon(MD.s, MD.p, { width: 2, fade: [20, 70, 700, 1500] });
  group.add(magRings, magLines);

  /* ── the tunnel inside: its sections (arcs above the floor), four lines along its walls, the floor's grid ── */
  const TL = lineSet();
  const floorA = Math.asin((TUNNEL.floor - TUNNEL.up) / TUNNEL.r); // ≈ −52°: the arcs stop at the floor
  for (let i = 0; i < 90; i++) circle(TL, MAGNET.firstAt - 19 + (i * C) / 90, TUNNEL.r, { out0: -TUNNEL.inward, up0: TUNNEL.up, a0: floorA, a1: Math.PI - floorA, n: 40, k: i % 2 ? 0.28 : 0.45 });
  for (const [a, k] of [[Math.PI / 2, 0.42], [0.18, 0.3], [Math.PI - 0.18, 0.3], [Math.PI - 0.62, 0.22]]) {
    along(TL, 0, C, -TUNNEL.inward + TUNNEL.r * Math.cos(a), TUNNEL.up + TUNNEL.r * Math.sin(a), 40, k);
  }
  const tunLines = ribbon(TL.s, TL.p, { width: 2, fade: [30, 140, 1100, 2400] });
  group.add(tunLines);
  const habit = dressTunnel(); group.add(habit.group); // the tunnel's life (habillage.js)
  const floor = (() => {
    const N = 1440, out0 = -TUNNEL.inward - 117, out1 = -TUNNEL.inward + 117;
    const pos = new Float32Array((N + 1) * 2 * 3), g = new Float32Array((N + 1) * 2 * 2), idx = [];
    for (let i = 0; i <= N; i++) {
      const s = -C / 2 + (i * C) / N;
      [out0, out1].forEach((o, j) => {
        const q = bp(s, o, TUNNEL.floor);
        pos.set(q, (i * 2 + j) * 3);
        g.set([s, o], (i * 2 + j) * 2);
      });
      if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 2, i * 2 + 1, i * 2 + 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aG", new THREE.BufferAttribute(g, 2));
    geo.setIndex(idx);
    const mesh = new THREE.Mesh(geo, gridMat({ polar: true, cell: 30, fadeD: 900 }));
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;
    return mesh;
  })();
  group.add(floor);

  /* ── the train: 2 496 bunches of white light, placed by the shader ── */
  const TU = {
    uHead: { value: 0 }, uSlot: { value: BEAM.slot }, uDumpLen: { value: 0 }, uTrainLen: { value: C - BEAM.gap }, uS6: { value: S6 },
    uSweep: { value: 0 }, uHeroS: { value: HERO_S }, uHero: { value: 0 }, uBeam: { value: 1 }, uSensors: { value: 0.3 },
  };
  const beadGeo = new THREE.InstancedBufferGeometry().copy(new THREE.CapsuleGeometry(BEAM.r, BEAM.len, 3, 10));
  const placeOf = new Float32Array(BEAM.n);
  for (let k = 0; k < BEAM.n; k++) placeOf[k] = Math.floor(k / BEAM.perWagon) * (BEAM.perWagon + BEAM.between) + (k % BEAM.perWagon);
  beadGeo.setAttribute("aPlace", new THREE.InstancedBufferAttribute(placeOf, 1));
  beadGeo.instanceCount = BEAM.n;
  const beadMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { ...RING_U, ...TU, uK: { value: 1.7 }, uInk: { value: INK.clone() }, uRed: { value: SIGNAL.clone() }, uPipe: { value: PIPE.r - BEAM.r }, uFadeOut: { value: new THREE.Vector2(4000, 7000) } },
    vertexShader: /* glsl */ `
      ${RING_GLSL}
      attribute float aPlace;
      uniform float uHead, uSlot, uDumpLen, uS6, uSweep, uHeroS, uHero, uPipe; uniform vec2 uFadeOut;
      varying vec3 vN; varying vec3 vV; varying float vA; varying float vRed;
      void main() {
        float D = (aPlace + 0.5) * uSlot;
        float s = uHead - D;
        vec3 t = ringT(s), n = ringN(s);
        vec3 c = uCentre + uR * n;
        float past = mod(s - uS6, uC);
        float sw = (uSweep > 0.001 && past < 600.0) ? uSweep * past / 600.0 : 0.0;
        c += n * sw * uPipe;
        vRed = (uSweep > 0.001 && past < 600.0) ? 0.85 * smoothstep(0.0, 0.2, uSweep) : 0.0;
        float keep = D < uDumpLen ? 0.0 : 1.0;
        float dh = abs(mod(s - uHeroS + 0.5 * uC, uC) - 0.5 * uC);
        keep *= 1.0 - uHero * (1.0 - smoothstep(14.0, 30.0, dh));
        float dist = distance(c, cameraPosition);
        keep *= smoothstep(10.0, 26.0, dist) * (1.0 - smoothstep(uFadeOut.x, uFadeOut.y, dist));
        vA = keep * (1.0 - 0.35 * smoothstep(400.0, 3000.0, dist));
        vec3 lp = position * step(0.002, keep);
        vec3 wp = c + t * lp.y + n * lp.x + vec3(0.0, lp.z, 0.0);
        vN = normalize(mat3(viewMatrix) * (t * normal.y + n * normal.x + vec3(0.0, normal.z, 0.0)));
        vec4 mv = viewMatrix * vec4(wp, 1.0);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uRed; uniform float uK, uBeam;
      varying vec3 vN; varying vec3 vV; varying float vA; varying float vRed;
      void main() {
        float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        vec3 core = mix(uInk, vec3(1.0), smoothstep(0.5, 0.95, f));
        vec3 col = mix(core, uRed, vRed) * uK * uBeam * (0.32 + 0.68 * f) * vA * (1.0 - 0.5 * vRed);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const beads = new THREE.Mesh(beadGeo, beadMat);
  beads.frustumCulled = false;
  beads.renderOrder = 4;
  group.add(beads);

  /* ── far away: the ring as a line of light that carries the train (white), the gap (black), the wagons ── */
  const RL = lineSet();
  for (let i = 0; i < 1440; i++) {
    const s0 = (i * C) / 1440, s1 = ((i + 1) * C) / 1440;
    seg(RL, bp(s0), bp(s1), s0, s1);
  }
  const ringLine = ribbon(RL.s, RL.p, {
    width: 5,
    fade: [3000, 6000, 1e7, 2e7],
    uniforms: { ...RING_U, ...TU, uBase: { value: 0.12 }, uTrainK: { value: 1.8 } },
    decl: "uniform float uC, uHead, uSlot, uDumpLen, uTrainLen, uBase, uTrainK, uBeam;",
    frag: /* glsl */ `
      vec3 lineColor() {
        float s = vP.x;
        float w = max(fwidth(s), 0.01);
        float D = mod(uHead - s, uC);
        float inT = (1.0 - smoothstep(uTrainLen - w, uTrainLen + w, D)) * smoothstep(uDumpLen - w, uDumpLen + w, D);
        float q = D / (uSlot * 55.0), wq = w / (uSlot * 55.0), fq = fract(q);
        float pat = smoothstep(0.0, wq, fq) * (1.0 - smoothstep(48.0 / 55.0 - wq, 48.0 / 55.0, fq));
        pat = mix(pat, 48.0 / 55.0, smoothstep(0.2, 0.5, wq));
        return uColor * (uBase + uTrainK * uBeam * inT * mix(1.0, pat, 0.85));
      }`,
  });
  ringLine.renderOrder = 4;
  group.add(ringLine);

  /* ── the grain: a signal bead with a gradient of light, falling from the pipe's top to the beam ── */
  const grainCore = new THREE.Mesh(new THREE.SphereGeometry(GRAIN.r, 20, 14), soft(SIGNAL, 2.6, 0.9));
  const grainHalo = new THREE.Mesh(new THREE.SphereGeometry(GRAIN.r * 3.4, 24, 16), soft(SIGNAL, 0.8, 3));
  grainCore.renderOrder = grainHalo.renderOrder = 5;
  group.add(grainCore, grainHalo);

  /* ── the shower: protons torn off by the grain, streaks downstream that strike the pipe's wall and the coil ── */
  const NSP = 120;
  const spSeed = new Float32Array(NSP * 4), spSeed2 = new Float32Array(NSP * 2);
  for (let i = 0; i < NSP; i++) {
    spSeed.set([rand(), 0.55 + rand() * 0.6, 20 + 280 * Math.pow(rand(), 1.8), rand() * TAU], i * 4);
    spSeed2.set([rand(), rand()], i * 2);
  }
  const spA = new THREE.InstancedBufferAttribute(spSeed, 4), spB = new THREE.InstancedBufferAttribute(spSeed2, 2);
  const SPU = { uT: { value: 0 }, uSpray: { value: 0 }, uOrigin: { value: new THREE.Vector3() }, uWall: { value: PIPE.r - 0.1 } };
  const SP_GLSL = /* glsl */ `
    ${RING_GLSL}
    attribute vec4 aSeed; attribute vec2 aSeed2;
    uniform float uT, uSpray, uWall; uniform vec3 uOrigin;
    vec3 sprayHit() { vec3 n = ringN(aSeed.z); return uCentre + uR * n + uWall * (cos(aSeed.w) * n + sin(aSeed.w) * vec3(0.0, 1.0, 0.0)); }
    float sprayLife() { return fract(uT / aSeed.y + aSeed.x); }
    float sprayOn() { return step(aSeed2.x, 0.1 + 0.9 * uSpray) * step(0.01, uSpray); }
  `;
  const streakGeo = new THREE.InstancedBufferGeometry().copy(new THREE.CylinderGeometry(1, 1, 1, 6, 1, true).translate(0, 0.5, 0));
  streakGeo.setAttribute("aSeed", spA);
  streakGeo.setAttribute("aSeed2", spB);
  streakGeo.instanceCount = NSP;
  const streakMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { ...RING_U, ...SPU, uColor: { value: SIGNAL.clone().multiplyScalar(2.7) } },
    vertexShader: /* glsl */ `
      ${SP_GLSL}
      varying float vAlong; varying float vA;
      void main() {
        float f = sprayLife() / 0.5;
        vec3 H = sprayHit();
        vec3 path = H - uOrigin; float L = max(length(path), 1.0); vec3 dir = path / L;
        float head = clamp(f, 0.0, 1.0) * L, tail = max(0.0, head - 16.0);
        float vis = sprayOn() * step(f, 1.0);
        vec3 up = abs(dir.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 b1 = normalize(cross(dir, up)), b2 = cross(dir, b1);
        float rad = 0.14 * vis;
        vec3 wp = uOrigin + dir * mix(tail, head, position.y) + (b1 * position.x + b2 * position.z) * rad;
        vAlong = position.y;
        vA = vis * (0.45 + 0.55 * sqrt(uSpray));
        gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vAlong; varying float vA;
      void main() { gl_FragColor = vec4(uColor * vA * (0.18 + 0.82 * vAlong * vAlong), 1.0); }`,
  });
  const streaks = new THREE.Mesh(streakGeo, streakMat);
  const sparkGeo = new THREE.InstancedBufferGeometry().copy(new THREE.IcosahedronGeometry(1, 1));
  sparkGeo.setAttribute("aSeed", spA);
  sparkGeo.setAttribute("aSeed2", spB);
  sparkGeo.instanceCount = NSP;
  const sparkMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { ...RING_U, ...SPU, uColor: { value: SIGNAL.clone().multiplyScalar(2.6) } },
    vertexShader: /* glsl */ `
      ${SP_GLSL}
      varying vec3 vN; varying vec3 vV; varying float vA;
      void main() {
        float g = (sprayLife() - 0.5) / 0.28;
        float vis = sprayOn() * step(0.0, g) * step(g, 1.0);
        float rad = (0.3 + 0.7 * g) * (0.55 + 0.6 * aSeed2.y) * vis;
        vec4 mv = viewMatrix * vec4(sprayHit() + position * rad, 1.0);
        vN = normalize(mat3(viewMatrix) * normal); vV = normalize(-mv.xyz);
        vA = vis * (1.0 - g) * (1.0 - g) * (0.5 + 0.5 * sqrt(uSpray));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV; varying float vA;
      void main() { float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0); gl_FragColor = vec4(uColor * f * f * vA, 1.0); }`,
  });
  const sparks = new THREE.Mesh(sparkGeo, sparkMat);
  for (const m of [streaks, sparks]) { m.frustumCulled = false; m.renderOrder = 5; }
  group.add(streaks, sparks);

  /* ── the struck coil (magnet 0): it heats signal through its glass, from the hit out; a few slow embers ── */
  const hitP = bp(HIT_S, rIn * Math.cos(STRUCK.hitAngle), rIn * Math.sin(STRUCK.hitAngle));
  const m0 = mids.find((m) => Math.abs(m - (MAGNET.firstAt + H)) < 1);
  const hotGeo = mergeGeometries(coilPieces(0.25).filter((g, i) => i === 1 || i === 3).map((g) => bend(g, m0, true)));
  const hotMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: SIGNAL.clone() }, uHit: { value: new THREE.Vector2(HIT_S, Math.atan2(Math.sin(STRUCK.hitAngle), Math.cos(STRUCK.hitAngle))) }, uCoil: { value: 0 }, uBreath: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec2 aLoc; varying vec2 vLoc; varying vec3 vN; varying vec3 vV;
      void main() { vLoc = aLoc; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform vec2 uHit; uniform float uCoil, uBreath; varying vec2 vLoc; varying vec3 vN; varying vec3 vV;
      void main() {
        float da = mod(vLoc.y - uHit.y + 3.14159265, 6.2831853) - 3.14159265;
        vec2 q = vec2(vLoc.x - uHit.x, da * 8.0);
        float r = 4.0 + 24.0 * uCoil;
        float x = length(q) / r, xc = length(q) / (1.6 + 4.5 * uCoil);
        float facing = abs(dot(normalize(vN), normalize(vV)));
        float hot = 0.45 * exp(-x * x) + 0.9 * exp(-xc * xc);
        gl_FragColor = vec4(uColor * hot * uCoil * uBreath * (0.55 + 0.45 * facing), 1.0);
      }`,
  });
  const hot = new THREE.Mesh(hotGeo, hotMat);
  hot.frustumCulled = false;
  hot.renderOrder = 5;
  group.add(hot);
  const embers = makeEmbers();
  embers.uniforms.uOrigin.value.set(...hitP);
  embers.points.renderOrder = 6;
  group.add(embers.points);

  /* ── the hero: ONE bunch drawn big, a few hundred grains of light; its twentieth leaves its head and strikes the coil ── */
  const NH = 560, heroRest = new Float32Array(NH * 3), heroInfo = new Float32Array(NH * 2);
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-6, rand()))) * Math.cos(TAU * rand());
  const xs = [];
  for (let i = 0; i < NH; i++) {
    const x = Math.max(-9, Math.min(9, gauss() * 3.3));
    const r = Math.min(2.5, Math.abs(gauss()) * 0.9 * (1 - 0.35 * (x / 9) ** 2)), a = rand() * TAU;
    heroRest.set([x, r * Math.sin(a), r * Math.cos(a)], i * 3);
    heroInfo[i * 2 + 1] = 0.1 + Math.pow(rand(), 2) * 0.16;
    xs.push([x, i]);
  }
  xs.sort((a, b) => b[0] - a[0]);
  for (let j = 0; j < NH / 20; j++) heroInfo[xs[j][1] * 2] = 1; // the head's twentieth
  const heroGeo = new THREE.BufferGeometry();
  heroGeo.setAttribute("position", new THREE.BufferAttribute(heroRest, 3));
  heroGeo.setAttribute("aInfo", new THREE.BufferAttribute(heroInfo, 2));
  const HF = ringAt(HERO_S);
  const heroP = HF.p.slice();
  const tv = new THREE.Vector3(...HF.t), nv = new THREE.Vector3(...HF.n), uv = new THREE.Vector3(0, 1, 0);
  const hitL = new THREE.Vector3(hitP[0] - heroP[0], hitP[1] - heroP[1], hitP[2] - heroP[2]);
  const heroMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uHero: { value: 0 }, uSlice: { value: 0 }, uPx: { value: 1000 }, uHitL: { value: new THREE.Vector3(hitL.dot(tv), hitL.dot(uv), hitL.dot(nv)) }, uInk: { value: INK.clone().multiplyScalar(1.5) }, uRed: { value: SIGNAL.clone().multiplyScalar(2.4) } },
    vertexShader: /* glsl */ `
      attribute vec2 aInfo; uniform float uHero, uSlice, uPx; uniform vec3 uHitL; varying float vRed; varying float vA;
      void main() {
        vec3 p = position * (0.6 + 0.4 * uHero);
        if (aInfo.x > 0.5) {
          vec3 off = position - vec3(position.x, 0.0, 0.0);
          vec3 detach = vec3(position.x + 3.0, 0.0, 0.0) + off * 1.3 + normalize(uHitL - position) * 1.6;
          float a = clamp(uSlice / 0.4, 0.0, 1.0), b = clamp((uSlice - 0.4) / 0.6, 0.0, 1.0);
          p = mix(p, detach, a * a * (3.0 - 2.0 * a));
          p = mix(p, uHitL + off * 0.22, b * b * (3.0 - 2.0 * b));
        }
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = clamp(aInfo.y * uPx / max(1.0, -mv.z), 1.6, 30.0);
        vRed = aInfo.x * smoothstep(0.02, 0.45, uSlice);
        vA = uHero;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uRed; varying float vRed; varying float vA;
      void main() { vec2 q = gl_PointCoord - 0.5; float a = exp(-dot(q, q) * 14.0); gl_FragColor = vec4(mix(uInk, uRed, vRed) * a * vA, 1.0); }`,
  });
  const heroPts = new THREE.Points(heroGeo, heroMat);
  heroPts.matrixAutoUpdate = false;
  heroPts.matrix.makeBasis(tv, uv, nv).setPosition(...heroP);
  heroPts.frustumCulled = false;
  heroPts.renderOrder = 5;
  const contact = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 12), soft(SIGNAL, 2.8, 1.4));
  const contactHalo = new THREE.Mesh(new THREE.SphereGeometry(2.6, 18, 12), soft(SIGNAL, 0.9, 3));
  contact.position.set(...hitP);
  contactHalo.position.set(...hitP);
  contact.renderOrder = contactHalo.renderOrder = 6;
  group.add(heroPts, contact, contactHalo);

  /* ── the 3 600 loss monitors: 6 bars lying across the cryostat's upper outer flank in each of the 600 groups ── */
  const NS = BLM.count;
  const sS = new Float32Array(NS), sG = new Float32Array(NS);
  for (let g = 0, k = 0; g < BLM.groups; g++) for (let j = 0; j < BLM.perGroup; j++, k++) { sS[k] = g * GROUP_LEN + RUNG.from + j * RUNG.step; sG[k] = g; }
  const senGeo = new THREE.InstancedBufferGeometry().copy(new THREE.CylinderGeometry(RUNG.r, RUNG.r, RUNG.len, 12, 1));
  senGeo.setAttribute("aS", new THREE.InstancedBufferAttribute(sS, 1));
  senGeo.setAttribute("aG", new THREE.InstancedBufferAttribute(sG, 1));
  senGeo.instanceCount = NS;
  const SU = { uSensors: TU.uSensors, uS6: TU.uS6, uPulse: { value: 0 }, uGrain: { value: GRAIN_GROUP }, uMount: { value: new THREE.Vector2(MOUNT.out, MOUNT.up) } };
  const senMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { ...RING_U, ...SU, uVeille: { value: VEILLE.clone() }, uRed: { value: SIGNAL.clone() }, uInk: { value: INK.clone() }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      ${RING_GLSL}
      ${LEVEL_GLSL}
      attribute float aS; attribute float aG;
      uniform float uPulse, uGrain; uniform vec2 uMount;
      varying vec3 vN; varying vec3 vV; varying float vA; varying float vLvl; varying float vRed;
      void main() {
        vec3 t = ringT(aS), n = ringN(aS), up = vec3(0.0, 1.0, 0.0);
        float rm = length(uMount);
        vec3 rd = (n * uMount.x + up * uMount.y) / rm, cd = (up * uMount.x - n * uMount.y) / rm;
        vec3 c = uCentre + uR * n + rd * (rm + 1.6);
        float isG = 1.0 - step(0.5, abs(aG - uGrain));
        float dist = distance(c, cameraPosition);
        vA = (isG + (1.0 - isG) * 0.55 * smoothstep(500.0, 1600.0, dist)) * (1.0 - smoothstep(2600.0, 4200.0, dist));
        vLvl = sensorLevel(aS) * (1.0 + 0.35 * isG);
        vRed = isG * uPulse;
        vec3 wp = c + cd * position.y + t * position.x + rd * position.z;
        vN = normalize(mat3(viewMatrix) * (cd * normal.y + t * normal.x + rd * normal.z));
        vec4 mv = viewMatrix * vec4(wp, 1.0);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv * step(0.002, vA);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uVeille, uRed, uInk; uniform float uAmount;
      varying vec3 vN; varying vec3 vV; varying float vA; varying float vLvl; varying float vRed;
      void main() {
        float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        vec3 body = uInk * 0.035 * (0.3 + 0.7 * f);
        vec3 col = body + mix(uVeille, uRed, vRed) * (vLvl * 1.35 + vRed * 2.0) * (0.35 + 0.65 * f);
        gl_FragColor = vec4(col * vA * uAmount, 1.0);
      }`,
  });
  const sensors = new THREE.Mesh(senGeo, senMat);
  sensors.frustumCulled = false;
  sensors.renderOrder = 5;
  group.add(sensors);
  // far away: one dot of light per group — the ring dotted
  const dotPos = new Float32Array(BLM.groups * 3), dotS = new Float32Array(BLM.groups);
  for (let g = 0; g < BLM.groups; g++) {
    dotS[g] = g * GROUP_LEN + RUNG.from + 2.5 * RUNG.step;
    dotPos.set(bp(dotS[g], MOUNT.out * 1.04, MOUNT.up * 1.04), g * 3);
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.BufferAttribute(dotPos, 3));
  dotGeo.setAttribute("aS", new THREE.BufferAttribute(dotS, 1));
  const dotMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { ...RING_U, ...SU, uPx: { value: 1000 }, uAmount: { value: 1 }, uColor: { value: VEILLE.clone() } },
    vertexShader: /* glsl */ `
      ${RING_GLSL}
      ${LEVEL_GLSL}
      attribute float aS; uniform float uPx; varying float vA; varying float vLvl;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float dist = length(mv.xyz);
        vA = smoothstep(2200.0, 4600.0, dist);
        vLvl = sensorLevel(aS);
        gl_PointSize = clamp(26.0 * uPx / max(1.0, dist), 2.6, 7.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vA; varying float vLvl;
      void main() { vec2 q = gl_PointCoord - 0.5; float a = 1.0 - smoothstep(0.22, 0.5, length(q)); gl_FragColor = vec4(uColor * (0.15 + vLvl * 1.7) * a * vA * uAmount, 1.0); }`,
  });
  const dots = new THREE.Points(dotGeo, dotMat);
  dots.frustumCulled = false;
  dots.renderOrder = 5;
  group.add(dots);

  /* ── the grain's monitor: its bar (veille, signal over the threshold), the threshold, ONE impulse ── */
  const MF = ringAt(MON_S);
  const mountP = bp(MON_S, (MOUNT.out * (47.5 + 1.6)) / 47.5, (MOUNT.up * (47.5 + 1.6)) / 47.5);
  const gaugeBase = bp(MON_S, (MOUNT.out * (47.5 + 1.6)) / 47.5 + 1.5, MOUNT.up + 6);
  const gauge = new THREE.Group();
  gauge.position.set(...gaugeBase);
  gauge.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(-MF.t[0], 0, -MF.t[2]), uv, new THREE.Vector3(...MF.n)));
  const fillLo = new THREE.Mesh(new THREE.BoxGeometry(GAUGE.w - 1, 1, 1.2).translate(0, 0.5, 0), glow(BRAND.veille, 1.1));
  const fillHi = new THREE.Mesh(new THREE.BoxGeometry(GAUGE.w - 1, 1, 1.2).translate(0, 0.5, 0), glow(BRAND.signal, 1.5));
  const thrMat = glow(BRAND.ink, 1.3);
  const thr = new THREE.Mesh(new THREE.BoxGeometry(GAUGE.w + 2.4, 0.5, 1.6), thrMat);
  thr.position.y = GAUGE.h * GAUGE.thr;
  fillHi.position.y = GAUGE.h * GAUGE.thr;
  const frame = fatLine([[-GAUGE.w / 2, 0, 0], [GAUGE.w / 2, 0, 0], [GAUGE.w / 2, GAUGE.h, 0], [-GAUGE.w / 2, GAUGE.h, 0], [-GAUGE.w / 2, 0, 0]], { color: BRAND.ink, width: 2, opacity: 0.55 });
  gauge.add(fillLo, fillHi, thr, frame);
  group.add(gauge);
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), soft(SIGNAL, 1.5, 2.6));
  pulse.position.set(...mountP);
  pulse.renderOrder = 6;
  group.add(pulse);

  /* ── the alert: a head of veille light and its trail, along the cable under the monitors, to point 6 upstream ── */
  const alertLen = wrap(MON_S - S6);
  const AL = lineSet();
  for (let i = 0; i < 360; i++) {
    const s0 = MON_S - (i * alertLen) / 360, s1 = MON_S - ((i + 1) * alertLen) / 360;
    seg(AL, bp(s0, CABLE.out, CABLE.up), bp(s1, CABLE.out, CABLE.up), s0, s1);
  }
  const AU = { uHeadS: { value: MON_S }, uTrail: { value: 1100 }, uOn: { value: 0 } };
  const alertLine = ribbon(AL.s, AL.p, {
    width: 4.5,
    color: VEILLE.clone().multiplyScalar(2.2),
    uniforms: AU,
    decl: "uniform float uHeadS, uTrail, uOn;",
    frag: /* glsl */ `
      vec3 lineColor() {
        float b = vP.x - uHeadS;
        float w = max(fwidth(vP.x), 0.5);
        return uColor * smoothstep(-w, w, b) * exp(-max(b, 0.0) / uTrail) * uOn;
      }`,
  });
  const alertHead = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), soft(VEILLE, 2.6, 1.6));
  const alertHalo = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), soft(VEILLE, 0.8, 3));
  alertHead.renderOrder = alertHalo.renderOrder = 6;
  group.add(alertLine, alertHead, alertHalo);

  /* ── the comment's tally: 37 grains in a row over the empty pipe, each with its little ring that empties ── */
  const taPos = new Float32Array(TALLY.n * 3), taI = new Float32Array(TALLY.n);
  const TR = lineSet();
  const e1 = new THREE.Vector3().crossVectors(uv, TALLY_EYE).normalize();
  for (let i = 0; i < TALLY.n; i++) {
    const s = TALLY.from + i * TALLY.step;
    const q = bp(s, 0, TALLY.up);
    taPos.set(q, i * 3);
    taI[i] = i;
    const c = bp(s, 0, TALLY.up + TALLY.ringUp);
    let prev = null;
    for (let k = 0; k <= 28; k++) {
      const a = Math.PI / 2 - (k / 28) * TAU;
      const r = [c[0] + TALLY.ring * Math.cos(a) * e1.x, c[1] + TALLY.ring * Math.sin(a), c[2] + TALLY.ring * Math.cos(a) * e1.z];
      if (prev) seg(TR, prev, r, i, i, (k - 1) / 28, k / 28);
      prev = r;
    }
  }
  const taGeo = new THREE.InstancedBufferGeometry().copy(new THREE.SphereGeometry(0.75, 16, 12));
  taGeo.setAttribute("aPos", new THREE.InstancedBufferAttribute(taPos, 3));
  taGeo.setAttribute("aI", new THREE.InstancedBufferAttribute(taI, 1));
  taGeo.instanceCount = TALLY.n;
  const GU = { uGrains: { value: 0 } };
  const taMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { ...GU, uColor: { value: SIGNAL.clone().multiplyScalar(2.4) } },
    vertexShader: /* glsl */ `
      attribute vec3 aPos; attribute float aI; uniform float uGrains; varying vec3 vN; varying vec3 vV; varying float vA;
      void main() {
        float k = uGrains - aI;
        float pop = clamp(k * 3.0, 0.0, 1.0);
        vA = pop * (1.0 + 0.7 * exp(-max(k, 0.0) * 2.5));
        vec4 mv = viewMatrix * vec4(aPos + position * (0.4 + 0.6 * pop) * step(0.001, pop), 1.0);
        vN = normalize(mat3(viewMatrix) * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV; varying float vA;
      void main() { float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0); gl_FragColor = vec4(uColor * (0.25 + 0.75 * pow(f, 1.3)) * vA, 1.0); }`,
  });
  const tally = new THREE.Mesh(taGeo, taMat);
  tally.frustumCulled = false;
  tally.renderOrder = 5;
  const tallyRings = ribbon(TR.s, TR.p, {
    width: 4,
    uniforms: { ...GU, uVeilleC: { value: VEILLE.clone().multiplyScalar(1.6) } },
    decl: "uniform float uGrains; uniform vec3 uVeilleC;",
    frag: /* glsl */ `
      vec3 lineColor() {
        float k = uGrains - vP.x;
        if (k <= 0.0) return vec3(0.0);
        float drain = clamp((k - 0.2) / 1.8, 0.0, 1.0);
        return mix(uColor * 0.9, uVeilleC, step(drain, vP.y)) * clamp(k * 3.0, 0.0, 1.0);
      }`,
  });
  group.add(tally, tallyRings);

  /* ── far away, on its own floor: the 044 teaser — a glass vest under seals, a stone that turns into a flattened bullet ── */
  const teaser = new THREE.Group();
  teaser.position.set(...TEASER.at);
  const tFloor = new THREE.Mesh(new THREE.CircleGeometry(220, 64).rotateX(-Math.PI / 2), gridMat({ polar: false, cell: 20, fadeD: 700, radius: 220 }));
  tFloor.renderOrder = 1;
  const pool = makePool({ radius: 80, color: BRAND.veille });
  const vestShape = (() => {
    const half = [[0, 40], [8, 56], [14, 57], [16, 47], [21, 38], [23, 34], [23, 4], [20, 0]];
    const pts = [...half, ...half.slice().reverse().map(([x, y]) => [-x, y])];
    return new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  })();
  const vestMats = [];
  const panel = (z, depth, rim) => {
    const geo = new THREE.ExtrudeGeometry(vestShape, { depth, bevelEnabled: false, curveSegments: 2 }).translate(0, 4, z);
    const mat = xglass({ rim, power: 3, edge: 0.3, back: 0.4, near: [-2, -1], tube: false });
    vestMats.push(mat);
    const mesh = new THREE.Mesh(geo, mat);
    asShell(mesh, 21);
    const ed = edgesOf(geo, { color: BRAND.ink, width: 2, opacity: 0.7 });
    vestMats.push(ed.material);
    return [mesh, ed];
  };
  const plateOutline = fatLine([[-11, 20, 6.4], [11, 20, 6.4], [12, 26, 6.4], [12, 44, 6.4], [9, 48, 6.4], [-9, 48, 6.4], [-12, 44, 6.4], [-12, 26, 6.4], [-11, 20, 6.4]], { color: BRAND.ink, width: 2, opacity: 0.45 });
  const tape = [
    fatLine([[-26, 54, 8.6], [26, 10, 8.6]], { color: BRAND.ink, width: 2, opacity: 0.8 }),
    fatLine([[-26, 49.5, 8.6], [26, 5.5, 8.6]], { color: BRAND.ink, width: 2, opacity: 0.8 }),
    fatLine([[-26, 10, 8.4], [-14, 21, 8.4]], { color: BRAND.ink, width: 2, opacity: 0.5 }),
  ];
  const stand = fatLine([[0, 0, 0], [0, 4, 0]], { color: BRAND.ink, width: 2, opacity: 0.4 });
  vestMats.push(plateOutline.material, stand.material, ...tape.map((l) => l.material));
  /* the stone → the flattened bullet: one lathe on a sphere's rings (axis local +y, heel up) — a copper shank, its
     mushroomed head, the petals curled back toward the heel — turned so the teaser's lens (az −30) sees it three-quarters,
     the nose pushed into the plate; a soft ink halo behind it (a flat petal disc read « grey leaf », the stone « stone ») */
  const STONE_C = new THREE.Color(0x8d877d), COPPER = new THREE.Color(0xc77c4c);
  const stone = (() => {
    const geo = new THREE.SphereGeometry(1, 72, 40);
    const pos = geo.attributes.position, bullet = new Float32Array(pos.count * 3);
    const RS = 1.75, HH = 3.6, HC = -0.15, HN = -1.2; // shank radius · heel · where the head starts · the flattened nose
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const r = 3.1 * (1 + 0.16 * Math.sin(5.1 * x + 2.3 * y) * Math.cos(4.2 * z - 1.1 * x) + 0.08 * Math.sin(9 * y));
      pos.setXYZ(i, x * r, y * r * 0.9, z * r * 0.8);
      const s = Math.acos(Math.max(-1, Math.min(1, y))) / Math.PI, ph = Math.atan2(z, x);
      const lobe = 0.5 + 0.5 * Math.cos(6 * ph + 0.5 * Math.sin(2 * ph)); //   six petals, a little uneven
      const rc = 3.1 + 1.3 * Math.pow(lobe, 0.8) + 0.12 * Math.sin(13 * ph);
      const tip = HC + 0.25 + 0.7 * lobe; //                                   the petals' tips curl back up
      let rho, h;
      if (s < 0.14) { const u = s / 0.14; rho = RS * u; h = HH - 0.12 * u * u; } // the heel
      else if (s < 0.42) { const u = (s - 0.14) / 0.28; rho = RS; h = HH - 0.12 + (HC - HH + 0.12) * u; } // the shank
      else if (s < 0.72) { const u = (s - 0.42) / 0.3; rho = RS + (rc - RS) * u; h = HC + (tip - HC) * Math.pow(u, 1.6); } // the petals
      else { const u = (s - 0.72) / 0.28, k = Math.min(1, u / 0.3); rho = rc * Math.pow(1 - u, 0.9); h = tip + (HN - tip) * k * k * (3 - 2 * k) - 0.12 * u; } // rim, then the nose
      bullet.set([rho * Math.cos(ph), h, rho * Math.sin(ph)], i * 3);
    }
    geo.computeVertexNormals();
    const bg = new THREE.BufferGeometry();
    bg.setAttribute("position", new THREE.BufferAttribute(bullet, 3));
    bg.setIndex(geo.index);
    bg.computeVertexNormals();
    geo.morphAttributes.position = [new THREE.BufferAttribute(bullet, 3)];
    geo.morphAttributes.normal = [bg.attributes.normal];
    const mesh = new THREE.Mesh(geo, solid(STONE_C.getHex(), { rough: 0.62, metal: 0.15 }));
    mesh.updateMorphTargets();
    mesh.castShadow = true;
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.6, 0.45, 0.66).normalize());
    return mesh;
  })();
  const halo = makePool({ radius: 13, color: BRAND.ink });
  halo.mesh.rotation.x = 0;
  halo.mesh.position.set(0.6, 36.6, 4.8);
  halo.uniforms.uAmount.value = 0;
  stone.position.set(0, 36, 10.4);
  for (const l of [plateOutline, stand, ...tape]) l.renderOrder = 3;
  teaser.add(tFloor, pool.mesh, ...panel(1.5, 3, 0.36), ...panel(-6, 2, 0.2), plateOutline, ...tape, stand, halo.mesh, stone);
  group.add(teaser);

  const A = {
    grain: GRAIN.at.slice(),
    coilHit: hitP.slice(),
    hero: heroP.slice(),
    monitor: gaugeBase.slice(),
    alertEnd: ringAt(S6).p.slice(),
    tally: bp(TALLY.from + 18 * TALLY.step, 0, TALLY.up),
    teaser: [TEASER.at[0], TEASER.at[1] + 40, TEASER.at[2]],
  };

  const headP = [0, 0, 0];
  function update(p, time, px, eye) {
    /* the eye in the ring's frame: out of the tunnel, the tunnel's glass may show */
    const rr = Math.hypot(eye.x - CX, eye.z - CZ);
    const eyeRadT = Math.hypot(rr - R0 + TUNNEL.inward, eye.y - TUNNEL.up);
    /* X-ray: near the eye `shell`, far from it `ring` */
    for (const m of [cryoMat, yokeMat, coilMat]) {
      m.uniforms.uAmount.value = p.shell;
      m.uniforms.uFar.value = p.ring;
    }
    cryoMat.uniforms.uFar.value = 0.8 * p.ring;
    pipeMat.uniforms.uAmount.value = Math.max(p.shell, 0.35 * p.ring);
    pipeMat.uniforms.uFar.value = 0.5 * p.ring;
    tunMat.uniforms.uAmount.value = tunMat.uniforms.uFar.value = 0.7 * p.ring * smooth(TUNNEL.r + 20, TUNNEL.r + 160, eyeRadT);
    magLines.material.uniforms.uAmount.value = magLines.material.uniforms.uFar.value = p.shell;
    magRings.material.uniforms.uAmount.value = p.shell;
    magRings.material.uniforms.uFar.value = 0.45 * p.shell;
    tunLines.material.uniforms.uAmount.value = tunLines.material.uniforms.uFar.value = 0.55 * p.shell;
    habit.update({ shell: p.shell }, time, px);
    floor.material.uniforms.uAmount.value = 0.12 * p.shell;
    tunnelShell.visible = tunMat.uniforms.uAmount.value > 0.003;
    /* the train */
    const g = BEAM.gap;
    TU.uHead.value = wrap(S6 + p.gap + p.dump * (C - g) - g / 2);
    TU.uDumpLen.value = p.dump * (C - g);
    TU.uSweep.value = p.sweep;
    TU.uHero.value = clamp01(p.hero);
    TU.uBeam.value = p.beam;
    beads.visible = p.beam > 0.005;
    ringLine.material.uniforms.uAmount.value = ringLine.material.uniforms.uFar.value = p.ring;
    ringLine.visible = p.ring > 0.005;
    /* the grain: appears at the pipe's top (0 → 0.1), falls to the beam (→ 1), burns brighter as it is struck */
    const fall = clamp01((p.grain - 0.1) / 0.9);
    grainCore.visible = grainHalo.visible = p.grain > 0.005;
    grainCore.position.set(GRAIN.at[0], GRAIN.at[1] + GRAIN.top * (1 - fall), GRAIN.at[2]);
    grainHalo.position.copy(grainCore.position);
    const gk = clamp01(p.grain / 0.1) * (0.8 + 0.5 * fall);
    grainCore.material.uniforms.uK.value = gk;
    grainHalo.material.uniforms.uK.value = gk * (0.7 + 0.6 * p.spray);
    /* the shower */
    SPU.uT.value = time;
    SPU.uSpray.value = p.spray;
    SPU.uOrigin.value.copy(grainCore.position);
    streaks.visible = sparks.visible = p.spray > 0.01;
    /* the struck coil */
    hotMat.uniforms.uCoil.value = clamp01(p.coil);
    hotMat.uniforms.uBreath.value = 0.93 + 0.07 * Math.sin(time * 1.7);
    hot.visible = p.coil > 0.005;
    embers.uniforms.uT.value = time;
    embers.uniforms.uScale.value = px;
    embers.uniforms.uAmount.value = smooth(0.15, 0.6, p.coil);
    embers.points.visible = p.coil > 0.15;
    /* the hero bunch and its twentieth */
    heroPts.visible = p.hero > 0.005;
    heroMat.uniforms.uHero.value = clamp01(p.hero);
    heroMat.uniforms.uSlice.value = clamp01(p.slice);
    heroMat.uniforms.uPx.value = px;
    const ck = smooth(0.86, 1, p.slice) * clamp01(p.hero);
    contact.visible = contactHalo.visible = ck > 0.005;
    contact.material.uniforms.uK.value = ck;
    contactHalo.material.uniforms.uK.value = ck;
    /* the monitors */
    sensors.visible = p.sensors > 0.005 || p.loss > 0.7;
    senMat.uniforms.uAmount.value = Math.max(0.15, p.shell);
    dotMat.uniforms.uPx.value = px;
    dotMat.uniforms.uAmount.value = p.ring;
    dots.visible = p.ring > 0.005 && p.sensors > 0.005;
    TU.uSensors.value = p.sensors;
    /* the grain's bar: veille to the threshold, signal past it; the threshold turns signal; ONE impulse */
    gauge.visible = p.loss > 0.005;
    const lo = Math.min(p.loss, GAUGE.thr), hi = Math.max(0, Math.min(p.loss, 1) - GAUGE.thr);
    fillLo.scale.y = Math.max(0.001, lo * GAUGE.h);
    fillHi.scale.y = Math.max(0.001, hi * GAUGE.h);
    fillHi.visible = hi > 0.001;
    setGlow(thrMat, p.loss > GAUGE.thr ? 1.9 : 1.2, p.loss > GAUGE.thr ? SIGNAL : INK);
    const pu = clamp01((p.loss - GAUGE.thr) / 0.16);
    pulse.visible = pu > 0.001 && pu < 0.999;
    pulse.scale.setScalar(3 + 14 * pu);
    pulse.material.uniforms.uK.value = (1 - pu) * (1 - pu);
    SU.uPulse.value = Math.sin(Math.PI * pu);
    /* the alert's head and trail, grain → point 6 */
    const on = p.alert > 0.001 && p.alert < 0.999;
    const sh = MON_S - clamp01(p.alert) * alertLen;
    AU.uHeadS.value = sh;
    AU.uOn.value = on ? smooth(0, 0.02, p.alert) * smooth(1, 0.97, p.alert) : 0;
    alertLine.visible = alertHead.visible = alertHalo.visible = on;
    bp(sh, CABLE.out, CABLE.up, headP);
    alertHead.position.set(headP[0], headP[1], headP[2]);
    alertHalo.position.copy(alertHead.position);
    const hr = Math.min(170, Math.max(2.2, 0.006 * alertHead.position.distanceTo(eye)));
    alertHead.scale.setScalar(hr);
    alertHalo.scale.setScalar(hr * 3.2);
    alertHead.material.uniforms.uK.value = alertHalo.material.uniforms.uK.value = AU.uOn.value;
    /* the tally */
    GU.uGrains.value = Math.max(0, Math.min(TALLY.n, p.grains));
    tally.visible = tallyRings.visible = p.grains > 0.001;
    /* the teaser */
    teaser.visible = p.teaser > 0.005;
    const va = clamp01(p.teaser / 0.4), mo = smooth(0.4, 1, p.teaser);
    for (const m of vestMats) {
      if (m.uniforms?.uAmount) m.uniforms.uAmount.value = va;
      else m.opacity = m.userData.base * va;
    }
    pool.uniforms.uAmount.value = 0.32 * va;
    stone.morphTargetInfluences[0] = mo;
    stone.position.z = 10.4 - 1.8 * mo;
    stone.material.color.copy(STONE_C).lerp(COPPER, mo);
    stone.material.metalness = 0.15 + 0.5 * mo;
    stone.material.roughness = 0.62 - 0.3 * mo;
    halo.uniforms.uAmount.value = 0.5 * mo;
  }

  return { group, A, update };
}
