// DOSSIER 026 — Soyouz MS-10 : THE ROCKET AND ITS PAD. A Soyuz-FG at about its true size (centimetres, rounded from
// public drawings — no length is ever written on screen), seen like an X-ray: a shell of glass and a few lines of
// structure, hanging under the escape head of model.js. The origin is the base of the descent module, the rocket's
// axis is y (plan.js). What makes it read from far away is what burns — the ring of nozzles seen from below, the jets,
// the trail — and booster D, the only thing of it in signal.
//
//   the stack    the lower fairing that stays and the service module in it (its folded panels, its nozzle), the third
//                stage and its instrument bay, its engine hanging in the open lattice, the core — widest at its top,
//                narrowing to its foot — and its four chambers and four verniers
//   the cross    four boosters (B +z, V +x, G −z, D −x): long oblique cones whose noses rest in a socket on the core,
//                four chambers and two verniers each, a small fin. `sep` opens the three good ones about their foot (the
//                noses swing out, a puff of gas at each nose: the cross seen from the ground) and lets them fall; `bad`
//                swings D about its nose instead — its foot out, its nose back IN: contact at exactly 1, then it rebounds
//   the strike   a light that has a place at IMPACT (a white heart of a few pixels, a signal sheath, a long halo), slow
//                sparks, and the mark it leaves on the core's skin
//   the fault    inside D's nose, the fitting of its upper joint (« une pièce ») bends a few degrees and glows signal
//   the fire     the core's jet and the boosters' (ink: a hot heart that cools along the jet; up there, where the air is
//                thin, it opens into a wide pale plume) and the trail, which keeps its place in the sky when the rocket
//                turns: it leaves the engines along the axis and bends back to where the sky had it
//   the pad      Baïkonour at night, a group apart (world.js lays it on the ground): the deck around the flame pit (a
//                black well), the four arms that hold the rocket by its boosters and fall back as it rises, the two
//                halves of the service gantry lowered, two masts, the smoke that rolls out of the pit at the launch
//
// Two frames are used to build: the GROUP's (the rocket's own: x, y, z of plan.js) and, for each booster, a RADIAL one —
// x the distance from the core's axis toward the booster, y the same heights, z across — turned to its azimuth by its
// seat. The four boosters share their geometry; each has its own motion.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glass, asShell, lineMat, edgesOf, anchor, cyl, box, mergeGeometries } from "@kit/build3d.js";
import { DEG, around, SKIRT, SM, STAGE3, TRUSS, CORE, BOOSTERS, IMPACT, FAULT, ENGINES, PAD } from "./plan.js";
import { dressPad } from "./habillage.js"; // the decorator: the pad at night (its lights, the cosmodrome, the stars)

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VIEWPORT = new THREE.Vector2(BRAND.W, BRAND.H);
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/* ───────────────────────────────────────────────────────────── shapes (build time) */

/** A smooth curve through [x, value] knots (007/src/jet.js). */
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

/** A skin through rows of points (`rows[i][j]` = [x, y, z]); `wrap`: each row closes on itself (007/src/jet.js). */
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

const lathe = (profile, segments = 64) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.01), y)), segments);

/** The core's radius at height y: out of the lattice it widens to its widest, holds it down to the waist (where the
 *  boosters' noses lean on it), then narrows to its foot. */
const SHOULDER = CORE.top - 90;
function coreR(y) {
  if (y > SHOULDER) return lerp(TRUSS.r, CORE.r, smooth(CORE.top, SHOULDER, y));
  if (y > CORE.waist) return CORE.r;
  return lerp(CORE.r, CORE.foot, clamp01((CORE.waist - y) / (CORE.waist - CORE.bottom)));
}

/** A booster from its foot: [height above the foot, radius] — a short drum, the long cone, and a nose that closes on
 *  its inner side, against the core (its apex is the ball of its upper joint). */
const BLEN = BOOSTERS.top - BOOSTERS.bottom;
const bRadius = spline([[0, 134], [40, 134], [330, 132], [700, 123], [1100, 104], [1450, 80], [1750, 54], [1880, 37], [1925, 24], [1946, 11], [1955, 0]]);
/** Its inner side runs along the core, a hand's width off it; at both ends it closes in on it. */
const bInner = (h) => coreR(BOOSTERS.bottom + h) + 2.5 + 7 * Math.sin(Math.PI * clamp01(h / BLEN));
/** The section at height h above the foot, in the radial frame: its centre (distance from the core's axis), radius, height. */
const bSection = (h) => {
  const r = Math.max(0, bRadius(h));
  return { c: bInner(h) + r, r, y: BOOSTERS.bottom + h };
};
const bRing = (h, n = 40) => {
  const { c, r, y } = bSection(h);
  return Array.from({ length: n }, (_, j) => {
    const a = (TAU * j) / n;
    return [c + r * Math.cos(a), y, r * Math.sin(a)];
  });
};
const FOOT = bSection(0); // its foot: c ≈ 240, the plan's BOOSTERS.out
const APEX = bSection(BLEN); // its apex, against the core at y = BOOSTERS.top
/** Where D turns when it goes wrong: the upper joint, a metre under its apex. */
const D_PIVOT = (() => {
  const s = bSection(BLEN - 105);
  return [s.c, s.y];
})();
const D_ARM = APEX.y - D_PIVOT[1]; // how far the apex stands above that pivot

/** A ring in the group's frame (around the rocket's axis, the camera's azimuth convention). */
const ringY = (y, r, n = 64) => Array.from({ length: n }, (_, j) => around((360 * j) / n, r, y));
/** A ring in a booster's radial frame (about a centre on its x axis). */
const ringX = (c, y, r, n = 32) =>
  Array.from({ length: n }, (_, j) => {
    const a = (TAU * j) / n;
    return [c + r * Math.cos(a), y, r * Math.sin(a)];
  });
const run = (list, pts, closed = false) => {
  for (let i = 0; i < pts.length - 1; i++) list.push(...pts[i], ...pts[i + 1]);
  if (closed) list.push(...pts.at(-1), ...pts[0]);
};

/** A jet (or a plume) turned about −y from its nozzle plane: [radius, depth] points, depth growing; uv.y = depth / length. */
function jetGeometry(profile, segments = 40) {
  const geo = new THREE.LatheGeometry(profile.map(([r, d]) => new THREE.Vector2(Math.max(r, 0.5), -d)), segments);
  const L = profile.at(-1)[1];
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setY(i, clamp01(-pos.getY(i) / L));
  return geo;
}

/* ───────────────────────────────────────────────────────────── light */

/**
 * What burns behind a nozzle: brightest where it faces the eye (its axis), a hot heart near the nozzle that cools
 * along the jet, no edge anywhere (007/src/model.js `flameMaterial`, in ink). `uFlow` runs a slow ripple down it.
 */
const jetMat = ({ power = 3, hot = 2.2, cool = 0.8, hotLen = 0.25, ripple = 0.08 } = {}) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uAmount: { value: 0 }, uHot: { value: INK.clone().multiplyScalar(hot) }, uCool: { value: INK.clone().multiplyScalar(cool) },
      uPower: { value: power }, uHotLen: { value: hotLen }, uRipple: { value: ripple }, uFlow: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vT;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vT = uv.y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot, uCool; uniform float uAmount, uPower, uHotLen, uRipple, uFlow;
      varying vec3 vN; varying vec3 vV; varying float vT;
      void main() {
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float body = pow(f, uPower);
        float along = clamp(1.0 - vT, 0.0, 1.0);
        float lip = smoothstep(0.0, 0.035, vT);
        float hot = 1.0 - smoothstep(0.0, uHotLen, vT);
        float rip = 1.0 - uRipple + uRipple * sin(vT * 38.0 - uFlow);
        vec3 col = mix(uCool, uHot, hot * body);
        gl_FragColor = vec4(col * body * along * along * lip * rip * uAmount, 1.0);
      }`,
  });

/** The trail, in numbers (cm): its length, how far down it takes to bend back to the sky, its radius at the engines and how it grows. */
const TRAIL = { len: 60000, bend: 1800, r0: 140, grow: 1.25 };

/**
 * The trail: a tube whose centre line is computed in the vertex shader — it leaves the engines along the rocket's axis
 * and bends, over `uBend`, to the direction the sky had it before the rocket turned (`uTilt`, the counter-turn of the
 * stack). Pale ink, thickest through its middle, widening as it goes, puffs that move down it with `uScroll` (flown).
 */
const trailMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: INK.clone().multiplyScalar(0.2) }, uAmount: { value: 0 }, uTilt: { value: 0 }, uScroll: { value: 0 },
      uLen: { value: TRAIL.len }, uBend: { value: TRAIL.bend }, uR0: { value: TRAIL.r0 }, uGrow: { value: TRAIL.grow },
    },
    vertexShader: /* glsl */ `
      uniform float uTilt, uScroll, uLen, uBend, uR0, uGrow;
      attribute float aS;
      varying vec3 vN; varying vec3 vV; varying float vS; varying float vU;
      void main() {
        float s = aS * uLen;
        // the centre line, summed in twelve steps: it starts down the rocket's axis and turns by uTilt over uBend
        vec2 c = vec2(0.0);
        float h = s / 12.0;
        for (int i = 0; i < 12; i++) {
          float a = uTilt * (1.0 - exp(-(float(i) + 0.5) * h / uBend));
          c += vec2(sin(a), -cos(a)) * h;
        }
        float a = uTilt * (1.0 - exp(-s / uBend));
        vec3 out1 = vec3(cos(a), sin(a), 0.0);
        float r = (uR0 + uGrow * pow(max(s, 0.0), 0.72)) * (1.0 + 0.06 * sin((s + uScroll) / 640.0) * smoothstep(0.0, 2000.0, s));
        vec3 dir = out1 * position.x + vec3(0.0, 0.0, 1.0) * position.z;
        vec4 mv = modelViewMatrix * vec4(vec3(c, 0.0) + dir * r, 1.0);
        vN = normalize(normalMatrix * dir);
        vV = normalize(-mv.xyz);
        vS = s;
        vU = aS;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uScroll;
      varying vec3 vN; varying vec3 vV; varying float vS; varying float vU;
      void main() {
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float body = pow(f, 1.4);
        float root = smoothstep(150.0, 1900.0, vS);
        float far = exp(-vS / 26000.0) * (1.0 - smoothstep(0.7, 1.0, vU));
        float puff = 0.7 + 0.3 * sin((vS + uScroll) / 430.0) * sin((vS + 0.77 * uScroll) / 181.0 + 1.7);
        gl_FragColor = vec4(uColor * body * root * far * puff * uAmount, 1.0);
      }`,
  });

function makeTrail() {
  const NS = 80;
  const NA = 24;
  const pos = [];
  const along = [];
  const index = [];
  for (let i = 0; i < NS; i++) {
    const s = Math.pow(i / (NS - 1), 2); // dense near the engines, where it bends
    for (let j = 0; j < NA; j++) {
      const a = (TAU * j) / NA;
      pos.push(Math.cos(a), 0, Math.sin(a));
      along.push(s);
    }
  }
  for (let i = 0; i < NS - 1; i++) {
    for (let j = 0; j < NA; j++) {
      const a = i * NA + j;
      const b = i * NA + ((j + 1) % NA);
      index.push(a, b, b + NA, a, b + NA, a + NA);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aS", new THREE.Float32BufferAttribute(along, 1));
  geo.setIndex(index);
  const mesh = new THREE.Mesh(geo, trailMat());
  mesh.frustumCulled = false; // its vertices are moved in the shader
  mesh.renderOrder = 4;
  return mesh;
}

/**
 * A light that has a place, always facing the eye (008/src/bolt.js `makeHead`, centred on its own mesh): a white heart
 * of two or three pixels, a sheath of hot air around it, a long halo. `uSize`: the halo's radius in cm, kept between
 * `uMin` and `uMax` pixels.
 */
function makeFlash() {
  const uniforms = {
    uView: { value: VIEWPORT }, uSize: { value: 120 }, uMin: { value: 34 }, uMax: { value: 340 }, uAmount: { value: 0 }, uHeart: { value: 0 }, uSheath: { value: 13 }, uHalo: { value: 0.16 },
    uHue: { value: SIGNAL.clone() }, uInk: { value: INK.clone() },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uSize, uMin, uMax, uAmount; uniform vec2 uView; varying vec2 vUv; varying float vPx;
        void main() {
          vUv = position.xy;
          vPx = 1.0;
          vec4 c = projectionMatrix * modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (uAmount > 0.001 && c.w > 1.0) {
            float s = clamp(uSize * 0.5 * uView.y * projectionMatrix[1][1] / c.w, uMin, uMax);
            vPx = s;
            gl_Position = vec4(c.xy / c.w + position.xy * s / (uView * 0.5), c.z / c.w, 1.0);
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHue, uInk; uniform float uAmount, uHeart, uSheath, uHalo; varying vec2 vUv; varying float vPx;
        void main() {
          float r = length(vUv);
          float p = r * vPx; // pixels from the centre
          float heart = exp(-p * p / 5.0) * uHeart;
          float sheath = exp(-p * p / (2.0 * uSheath * uSheath));
          float halo = uHalo / (1.0 + r * r / 0.02) * (1.0 - smoothstep(0.55, 1.0, r));
          gl_FragColor = vec4((uInk * heart * 2.6 + uHue * (sheath * 0.85 + halo)) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/**
 * Slow sparks out of the strike: each is born again every period, so the whole spray is a pure function of time and
 * alive on any frame; a white point that cools to signal as it flies off the core and falls behind (the rocket pulls
 * away from what it loses).
 */
function makeSparks({ count = 30, seed = 11 } = {}) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  const dir = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // phase, period (s), speed (cm/s), size (px)
  for (let i = 0; i < count; i++) {
    const th = (rand() - 0.5) * 2.3; // spread about −x, away from the core
    const up = (rand() - 0.42) * 1.5;
    const v = new THREE.Vector3(-Math.cos(th), up, Math.sin(th)).normalize();
    dir.set([v.x, v.y, v.z], i * 3);
    seeds.set([rand(), 0.9 + rand() * 0.9, 50 + rand() * 140, 2.2 + rand() * 2.6], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uAmount: { value: 0 }, uHot: { value: INK.clone().multiplyScalar(2.4) }, uCool: { value: SIGNAL.clone().multiplyScalar(1.7) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT; attribute vec3 aDir; attribute vec4 aSeed; varying float vAge;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          float t = age * aSeed.y;
          vec3 p = position + aDir * aSeed.z * t + vec3(0.0, -70.0, 0.0) * t * t;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aSeed.w;
          vAge = age;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; uniform float uAmount; varying float vAge;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(clamp(1.0 - d, 0.0, 1.0), 1.4) * pow(clamp(1.0 - vAge, 0.0, 1.0), 1.3) * smoothstep(0.0, 0.06, vAge);
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.08, 0.55, vAge)) * a * uAmount, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 6;
  return { points, uniforms };
}

/**
 * The mark the strike leaves on the core: a patch of the skin around IMPACT, a burn that fades out from the point of
 * contact and a few soft cracks running out of it — faint, signal (it is the damage, not a light).
 */
function makeDent() {
  const ARC = 60;
  const H = 320;
  const R = CORE.r + 1.2;
  const az = Math.atan2(IMPACT[0], IMPACT[2]) / DEG; // −90: the side D strikes
  const geo = new THREE.CylinderGeometry(R, R, H, 28, 10, true, (az - ARC / 2) * DEG, ARC * DEG);
  const uniforms = { uAmount: { value: 0 }, uColor: { value: SIGNAL.clone().multiplyScalar(0.9) }, uR: { value: R }, uAz: { value: az * DEG }, uCrack: { value: 1 } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount, uR, uAz, uCrack; varying vec3 vP;
        void main() {
          vec2 q = vec2((atan(vP.x, vP.z) - uAz) * uR, vP.y);
          float d = length(q);
          float burn = exp(-d * d / (2.0 * 20.0 * 20.0));
          float a = atan(q.y, q.x + 1e-4);
          float crack = pow(clamp(abs(sin(a * 2.5 + 0.7 * sin(a * 6.0 + 1.0))), 0.0, 1.0), 22.0) * smoothstep(10.0, 22.0, d) * exp(-d / 30.0) * uCrack;
          float ring = exp(-pow((d - 34.0) / 6.0, 2.0)) * 0.25;
          gl_FragColor = vec4(uColor * (burn * 0.7 + crack * 0.45 + ring) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.position.y = IMPACT[1];
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/** Smoke that rolls out of the flame pit at the launch: big soft puffs born again and again around the pit (pad frame). */
function makeSmoke({ count = 46, seed = 23 } = {}) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  const dir = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // phase, period (s), reach (cm), size
  const PH = PAD.pit[0];
  for (let i = 0; i < count; i++) {
    let p;
    let d;
    if (i < 12) {
      // the trench's mouth, behind the pit: the big rolling cloud
      p = [(rand() - 0.5) * 1400, -250 + rand() * 200, -PH - 200 - rand() * 500];
      d = [(rand() - 0.5) * 0.6, 0.18 + rand() * 0.2, -1];
    } else {
      // over the rim, all around: what the flame throws back up out of the pit
      const a = rand() * TAU;
      const r = PH * (0.75 + rand() * 0.35);
      p = [Math.sin(a) * r, -150 + rand() * 250, Math.cos(a) * r];
      d = [Math.sin(a), 0.35 + rand() * 0.45, Math.cos(a)];
    }
    const v = new THREE.Vector3(...d).normalize();
    pos.set(p, i * 3);
    dir.set([v.x, v.y, v.z], i * 3);
    seeds.set([rand(), 4.2 + rand() * 3.4, 900 + rand() * 2000, 0.6 + rand() * 0.8], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uAmount: { value: 0 }, uScale: { value: 1000 }, uColor: { value: INK.clone().multiplyScalar(0.016) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale; attribute vec3 aDir; attribute vec4 aSeed; varying float vA;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          vec3 p = position + aDir * aSeed.z * (1.0 - exp(-age * 2.6)) + vec3(0.0, 260.0, 0.0) * age;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = min(700.0, mix(300.0, 1100.0, sqrt(age)) * aSeed.w * uScale / max(1.0, -mv.z));
          vA = sin(3.14159 * age);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = exp(-d * d * 3.2) * (1.0 - smoothstep(0.8, 1.0, d));
          gl_FragColor = vec4(uColor * a * vA * uAmount, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 7;
  return { points, uniforms };
}

/* ───────────────────────────────────────────────────────────── the rocket */

/**
 * buildLauncher() → { group, pad, A, update(P, time, px) }
 *   group  the rocket, origin = the module's base (plan.js): world.js turns it (`tilt`), throws it (`sway`) and lets it
 *          fall away down its axis (`apart`). The sensors (model.js) are mounted in it by world.js.
 *   pad    the launch pad, its deck at its own y 0: world.js lays it on the ground (y = −alt · 1e5)
 *   A      anchors: impact (on the core), fault and boosterD (on booster D: they go where it goes), engines, waist, top
 */
export function buildLauncher() {
  const group = new THREE.Group();
  group.name = "launcher";
  const fx = {};
  const A = {};

  /* ── materials ── */
  // the rocket's shell: dim along its length (seen side on, most of a long tube turns away from the eye — at a figure's
  // strength each stage would be two neon tubes), a long streak of the studio's softbox down each tube
  const hullGlass = () => glass(BRAND.ink, { base: 0.006, rim: 0.12, power: 3, edge: 0.3, spec: 0.22, through: 0.2 });
  fx.hull = hullGlass();
  fx.good = hullGlass(); // the three good boosters: they fade as they fall away
  fx.bad = hullGlass(); // booster D: it turns signal
  fx.inner = glass(BRAND.ink, { base: 0, rim: 0.14, power: 2.6, edge: 0.34, spec: 0, through: 0.15 });
  // flat fins: at a grazing angle the rim of a flat pane would be a grey slab
  const finGlass = () => glass(BRAND.ink, { base: 0.002, rim: 0.05, power: 3, edge: 0.12, spec: 0, through: 0.15 });
  fx.goodFin = finGlass();
  fx.badFin = finGlass();
  fx.outline = lineMat(BRAND.ink, 2.1, { opacity: 0.5 });
  fx.frames = lineMat(BRAND.ink, 1.8, { opacity: 0.2 });
  fx.truss = lineMat(BRAND.ink, 2, { opacity: 0.6 });
  fx.goodLines = lineMat(BRAND.ink, 2, { opacity: 0.46 });
  fx.badLines = lineMat(BRAND.ink, 2.2, { opacity: 0.62 });
  const hullPanes = [];
  const innerPanes = [];
  const pane = (geometry, material, parent, list = hullPanes) => {
    const mesh = new THREE.Mesh(geometry, material);
    parent.add(mesh);
    list.push(mesh);
    return mesh;
  };
  const segments = (list, material, parent) => {
    const geo = new LineSegmentsGeometry();
    geo.setPositions(list);
    const lines = new LineSegments2(geo, material);
    lines.frustumCulled = false;
    lines.renderOrder = 2;
    parent.add(lines);
    return lines;
  };

  /* ── the stack, from the head down: the lower fairing, the service module in it, the third stage, the lattice, the core ── */
  pane(lathe([[150, SKIRT.top], [150.4, -130], [150, -248], [147, -280], [141, -306], [STAGE3.r + 1, SKIRT.bottom]]), fx.hull, group);
  // the third stage, closed at its foot by its aft dome (seen through the lattice)
  pane(lathe([[STAGE3.r + 1, STAGE3.top], [STAGE3.r, STAGE3.top - 14], [STAGE3.r, STAGE3.bottom + 12], [STAGE3.r - 4, STAGE3.bottom], [104, STAGE3.bottom - 16], [58, STAGE3.bottom - 30], [0, STAGE3.bottom - 35]]), fx.hull, group);
  // the core, its forward dome inside the lattice, its base closed by the plate the chambers hang from
  const coreProfile = [[0, CORE.top + 32], [64, CORE.top + 26], [112, CORE.top + 12]];
  for (let y = CORE.top; y >= CORE.bottom - 0.5; ) {
    coreProfile.push([coreR(y), y]);
    y -= y > SHOULDER - 40 ? 15 : y > CORE.waist - 60 ? 70 : 160;
  }
  coreProfile.push([coreR(CORE.bottom), CORE.bottom], [CORE.foot - 8, CORE.bottom - 6], [0, CORE.bottom - 8]);
  pane(lathe(coreProfile, 72), fx.hull, group);

  // the service module inside the lower fairing: its body, its flared aft skirt, its nozzle, its two folded panels
  pane(lathe([[108, SM.top], [110, SM.top - 22], [126, SM.top - 48], [SM.r, SM.top - 64], [SM.r, SM.bottom + 8], [SM.r - 6, SM.bottom], [0, SM.bottom - 2]]), fx.inner, group, innerPanes);
  pane(lathe([[9, SM.bottom - 2], [13, SM.bottom - 14], [19, SM.bottom - 34]], 32), fx.inner, group, innerPanes);
  const panels = [];
  for (const side of [-1, 1]) {
    const panel = pane(new THREE.BoxGeometry(5, 150, 70), fx.inner, group, innerPanes);
    panel.position.set(side * (SM.r + 4), SM.top - 150, 0);
    // its cells: two columns, five rows
    const x = side * (SM.r + 7);
    for (const z of [-35, 0, 35]) run(panels, [[x, SM.top - 75, z], [x, SM.top - 225, z]]);
    for (let k = 0; k <= 5; k++) run(panels, [[x, SM.top - 75 - 30 * k, -35], [x, SM.top - 75 - 30 * k, 35]]);
  }
  // the third stage's engine, four chambers hanging in the lattice (cold: it lights only later)
  const s3bells = [];
  for (const [x, z] of [[-36, -36], [36, -36], [36, 36], [-36, 36]]) s3bells.push(lathe([[9, -6], [11, -16], [17, -42], [21, -66], [22, -74]], 28).translate(x, STAGE3.bottom - 34, z));
  pane(mergeGeometries(s3bells), fx.inner, group, innerPanes);

  // its chambers: four, and four verniers on its flanks — what burns, seen from below
  const coreBells = [];
  const coreFire = [];
  for (const [x, z] of [[-50, -50], [50, -50], [50, 50], [-50, 50]]) {
    coreBells.push(lathe([[13, -6], [16, -18], [25, -46], [32, -70], [34, -80]], 32).translate(x, CORE.bottom, z));
    coreFire.push(new THREE.CircleGeometry(24, 28).rotateX(Math.PI / 2).translate(x, CORE.bottom - 66, z));
  }
  for (const az of [0, 90, 180, -90]) {
    const [x, , z] = around(az, 86, 0);
    coreBells.push(lathe([[6, -6], [8, -18], [12, -42], [14, -62]], 24).translate(x, CORE.bottom, z));
    coreFire.push(new THREE.CircleGeometry(9.5, 20).rotateX(Math.PI / 2).translate(x, CORE.bottom - 50, z));
  }
  pane(mergeGeometries(coreBells), fx.hull, group);
  fx.fireCore = new THREE.MeshBasicMaterial({ color: INK.clone(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const coreDiscs = new THREE.Mesh(mergeGeometries(coreFire), fx.fireCore);
  coreDiscs.renderOrder = 5;
  group.add(coreDiscs);

  // its lines: the seams, the power ring the noses lean on, two conduits down the core, the lattice, the panels
  const outline = [];
  const frames = [];
  for (const [y, r] of [[SKIRT.top, 150], [SKIRT.bottom, STAGE3.r + 1], [STAGE3.top - 90, STAGE3.r + 0.5], [STAGE3.bottom, STAGE3.r - 2], [CORE.waist + 10, CORE.r + 0.6], [CORE.bottom, coreR(CORE.bottom) + 0.5]]) run(outline, ringY(y, r), true);
  for (const [y, r] of [[-250, 150.2], [STAGE3.top - 360, STAGE3.r + 0.5], [SHOULDER, CORE.r + 0.5], [-1560, CORE.r + 0.5], [-2880, coreR(-2880) + 0.5], [-3560, coreR(-3560) + 0.5]]) run(frames, ringY(y, r, 56), true);
  for (const az of [45, -135]) {
    const pts = [];
    for (let y = SHOULDER; y >= CORE.bottom; y -= 120) pts.push(around(az, coreR(y) + 3.5, y));
    pts.push(around(az, coreR(CORE.bottom) + 3.5, CORE.bottom));
    run(frames, pts);
  }
  // the instrument bay at the top of the third stage: a band of racks (the first sensor sits in it)
  for (let k = 0; k < 16; k++) run(frames, [around(k * 22.5 + 11, STAGE3.r + 0.4, STAGE3.top - 12), around(k * 22.5 + 11, STAGE3.r + 0.4, STAGE3.top - 86)]);
  frames.push(...panels);
  const truss = [];
  run(truss, ringY(TRUSS.top, TRUSS.r), true);
  run(truss, ringY(TRUSS.bottom, TRUSS.r), true);
  for (let k = 0; k < 12; k++) {
    const a = k * 30;
    run(truss, [around(a, TRUSS.r, TRUSS.top), around(a + 15, TRUSS.r, TRUSS.bottom), around(a + 30, TRUSS.r, TRUSS.top)]);
  }
  for (const [x, z] of [[-36, -36], [36, -36], [36, 36], [-36, 36]]) run(truss, ringX(x, STAGE3.bottom - 108, 22, 20).map(([px, py, pz]) => [px, py, pz + z]), true);
  segments(outline, fx.outline, group);
  segments(frames, fx.frames, group);
  segments(truss, fx.truss, group);
  // the rims of the core's chambers
  const rims = [];
  for (const [x, z] of [[-50, -50], [50, -50], [50, 50], [-50, 50]]) run(rims, ringX(x, CORE.bottom - 80, 34, 24).map(([px, py, pz]) => [px, py, pz + z]), true);
  segments(rims, fx.outline, group);

  // the socket on the core where D's nose rests (the other half of its upper joint): small, solid — the others' would
  // read as rivets on the power ring from afar
  fx.socket = solid(0x555c63, { rough: 0.6, metal: 0.3 });
  for (const az of [BOOSTERS.az.D]) {
    const geo = cyl(9, 10, 1, 28);
    const cup = new THREE.Mesh(geo, fx.socket);
    cup.position.set(...around(az, CORE.r + 3, BOOSTERS.top - 6));
    cup.rotation.set(0, (az - 90) * DEG, -Math.PI / 2);
    cup.add(edgesOf(geo, { width: 1.8, opacity: 0.5 }));
    cup.castShadow = true;
    group.add(cup);
  }

  /* ── the four boosters (Korolev's cross) ── */
  const boosterGeo = (() => {
    const hs = [0, 18, 40, 110, 210, 330, 460, 600, 750, 900, 1050, 1200, 1350, 1500, 1640, 1760, 1840, 1880, 1905, 1922, 1935, 1944, 1950, 1955];
    const base = Array.from({ length: 40 }, () => [FOOT.c, BOOSTERS.bottom - 2, 0]); // its base, closed: the plate the chambers hang from
    return skin([base, ...hs.map((h) => bRing(h, 40))], { wrap: true });
  })();
  const nozzleGeo = (() => {
    const list = [];
    for (const [x, z] of [[-44, -44], [44, -44], [44, 44], [-44, 44]]) list.push(lathe([[12, -6], [15, -16], [22, -40], [29, -66], [31, -80]], 28).translate(FOOT.c + x, BOOSTERS.bottom, z));
    for (const z of [-72, 72]) list.push(lathe([[6, -6], [8, -16], [12, -38], [13, -55]], 20).translate(FOOT.c + 98, BOOSTERS.bottom, z));
    return mergeGeometries(list);
  })();
  const fireGeo = (() => {
    const list = [];
    for (const [x, z] of [[-44, -44], [44, -44], [44, 44], [-44, 44]]) list.push(new THREE.CircleGeometry(22, 24).rotateX(Math.PI / 2).translate(FOOT.c + x, BOOSTERS.bottom - 62, z));
    for (const z of [-72, 72]) list.push(new THREE.CircleGeometry(8.5, 16).rotateX(Math.PI / 2).translate(FOOT.c + 98, BOOSTERS.bottom - 44, z));
    return mergeGeometries(list);
  })();
  // the small triangular fin on its outer side, at the foot
  const finPts = (() => {
    const a = bSection(30);
    const b = bSection(470);
    return [[a.c + a.r, a.y, 0], [b.c + b.r, b.y, 0], [a.c + a.r + 118, a.y - 6, 0]];
  })();
  const finGeo = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(finPts.flat(), 3));
  finGeo.computeVertexNormals();
  const boosterLines = (() => {
    const list = [];
    for (const h of [0, 40, 330, 1100, 1880]) run(list, bRing(h, 48), true);
    // the conduit down its outer side, from the drum to the nose
    const conduit = [];
    for (let h = 40; h <= 1880; h += 80) {
      const s = bSection(h);
      conduit.push([s.c + s.r + 3, s.y, 0]);
    }
    run(list, conduit);
    run(list, finPts, true);
    for (const [x, z] of [[-44, -44], [44, -44], [44, 44], [-44, 44]]) run(list, ringX(FOOT.c + x, BOOSTERS.bottom - 80, 31, 20).map(([px, py, pz]) => [px, py, pz + z]), true);
    return list;
  })();
  // jets: the four chambers of a booster burn as one
  const boosterJetGeo = jetGeometry([[78, 0], [92, 90], [97, 320], [86, 760], [58, 1250], [24, 1650], [3, 1900]]);
  fx.boosterJet = jetMat({ power: 3.2, hot: 1.9, cool: 0.65, hotLen: 0.3 });
  // the gas each good booster vents at its nose as it lets go: the cross that is seen from the ground
  const puffGeo = jetGeometry([[4, 0], [26, 50], [60, 200], [88, 450], [88, 650], [50, 820], [4, 900]], 28);
  fx.puff = jetMat({ power: 1.6, hot: 0.55, cool: 0.32, hotLen: 0.25, ripple: 0 });
  // the fitting of the upper joint, inside the nose: a bracket on the nose's frame, a rod, the ball that seats in the
  // core's socket. Booster D's is the faulty one (« une pièce faussée, au montage »): it bends at its kink and glows.
  const FIT = { pin: [183, -1979], kink: 28, len: 64, lean: Math.atan2(0.406, 0.914), r: 3.4, ball: 5.8 };
  fx.fitDim = solid(0x5c636a, { rough: 0.5, metal: 0.3 });
  fx.fitD = solid(0x5c636a, { rough: 0.5, metal: 0.3 });
  fx.fitDark = new THREE.Color(0x5c636a);
  fx.fitHot = new THREE.Color(0x2a1a14); // under its glow the part goes dark: what shows is the signal, not a pink
  fx.fitD.emissive = SIGNAL.clone();
  fx.fitD.emissiveIntensity = 0;
  fx.fitEdges = [];
  function fitting(parent, mat, faulty) {
    const g = new THREE.Group();
    g.position.set(FIT.pin[0], FIT.pin[1], 0);
    g.rotation.z = FIT.lean; // its local +y runs up the rod, toward the apex
    parent.add(g);
    const put = (geometry, at, rot, into = g) => {
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(...at);
      if (rot) mesh.rotation.set(...rot);
      mesh.castShadow = true;
      const e = edgesOf(geometry, { width: 1.8, opacity: 0.55 });
      if (faulty) fx.fitEdges.push(e.material);
      mesh.add(e);
      into.add(mesh);
      return mesh;
    };
    put(box(16, 10, 20, 1), [0, -9, 0]);
    put(cyl(5.4, 15, 0.5, 24), [0, 0, 0], [Math.PI / 2, 0, 0]);
    put(cyl(FIT.r, FIT.kink, 0.4, 20), [0, FIT.kink / 2, 0]);
    const kink = new THREE.Group();
    kink.position.y = FIT.kink;
    g.add(kink);
    put(cyl(4.6, 6, 0.5, 20), [0, 0, 0], null, kink);
    put(cyl(FIT.r, FIT.len - FIT.kink, 0.4, 20), [0, (FIT.len - FIT.kink) / 2, 0], null, kink);
    put(new THREE.SphereGeometry(FIT.ball, 24, 16), [0, FIT.len - FIT.kink, 0], null, kink);
    return kink;
  }

  fx.fireBooster = new THREE.MeshBasicMaterial({ color: INK.clone(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  fx.boosters = {};
  const boosterPanes = { good: [], bad: [] };
  for (const [name, az] of Object.entries(BOOSTERS.az)) {
    const D = name === "D";
    const seat = new THREE.Group(); // turns the radial frame to its azimuth: local +x → (sin az, 0, cos az)
    seat.rotation.y = (az - 90) * DEG;
    group.add(seat);
    const motion = new THREE.Group(); // what `sep` / `bad` move
    seat.add(motion);
    const body = new THREE.Mesh(boosterGeo, D ? fx.bad : fx.good);
    const fin = new THREE.Mesh(finGeo, D ? fx.badFin : fx.goodFin);
    const bells = new THREE.Mesh(nozzleGeo, D ? fx.bad : fx.good);
    motion.add(body, fin, bells);
    boosterPanes[D ? "bad" : "good"].push(body, fin, bells);
    const fire = new THREE.Mesh(fireGeo, fx.fireBooster);
    fire.renderOrder = 5;
    motion.add(fire);
    segments(boosterLines, D ? fx.badLines : fx.goodLines, motion);
    const jet = new THREE.Mesh(boosterJetGeo, fx.boosterJet);
    jet.position.set(FOOT.c, BOOSTERS.bottom - 80, 0);
    jet.renderOrder = 5;
    motion.add(jet);
    let puff = null;
    if (!D) {
      puff = new THREE.Mesh(puffGeo, fx.puff);
      puff.position.set(APEX.c + 6, APEX.y + 2, 0);
      puff.rotation.z = 130 * DEG; // out and up
      puff.renderOrder = 5;
      motion.add(puff);
    }
    const kink = fitting(motion, D ? fx.fitD : fx.fitDim, D);
    fx.boosters[name] = { seat, motion, fire, jet, puff, kink };
  }

  asShell(innerPanes, 14);
  asShell([...hullPanes, ...boosterPanes.good, ...boosterPanes.bad], 20);

  /* ── the strike: its light, its sparks, its mark ── */
  fx.flash = makeFlash();
  fx.flash.mesh.position.set(IMPACT[0] - 3, IMPACT[1], IMPACT[2]);
  fx.sparks = makeSparks();
  fx.sparks.points.position.set(IMPACT[0] - 4, IMPACT[1], IMPACT[2]);
  fx.dent = makeDent();
  group.add(fx.flash.mesh, fx.sparks.points, fx.dent.mesh);

  /* ── the fire: the core's jet, its plume up where the air is thin, the trail ── */
  fx.coreJet = jetMat({ power: 3.4, hot: 2.1, cool: 0.7, hotLen: 0.3 });
  const coreJet = new THREE.Mesh(jetGeometry([[96, 0], [116, 110], [124, 380], [112, 900], [84, 1500], [44, 2150], [4, 2650]]), fx.coreJet);
  coreJet.position.y = ENGINES.core;
  coreJet.renderOrder = 5;
  fx.plume = jetMat({ power: 1.25, hot: 0.55, cool: 0.4, hotLen: 0.12, ripple: 0.05 });
  const plume = new THREE.Mesh(jetGeometry([[150, 0], [480, 260], [860, 900], [990, 1800], [900, 2800], [560, 3800], [10, 4700]], 48), fx.plume);
  plume.position.y = ENGINES.core;
  plume.renderOrder = 5;
  const trail = makeTrail();
  trail.position.y = ENGINES.core;
  group.add(coreJet, plume, trail);
  fx.trail = trail.material;

  /* ── anchors ── */
  A.impact = anchor(group, ...IMPACT);
  A.fault = anchor(fx.boosters.D.motion, -FAULT[0], FAULT[1], FAULT[2]); // D's radial frame: x runs toward −x
  A.boosterD = anchor(fx.boosters.D.motion, APEX.c, APEX.y, 0);
  A.engines = anchor(group, 0, ENGINES.core, 0);
  A.waist = anchor(group, 0, CORE.waist, 0);
  A.top = anchor(group, 0, SKIRT.top, 0);

  /* ───────────────────────────────────────────────────────────── the pad (its deck at its own y 0) */
  const pad = new THREE.Group();
  pad.name = "pad";
  fx.padBright = lineMat(BRAND.ink, 2.4, { opacity: 0.7 });
  fx.padLines = lineMat(BRAND.ink, 2, { opacity: 0.42 });
  fx.padFaint = lineMat(BRAND.ink, 1.8, { opacity: 0.17 });
  const PH = PAD.pit[0];
  const DH = PAD.pit[1];
  const DEEP = 2400;
  const bright = [];
  const lines = [];
  const faint = [];
  // the deck: its edge, the joints of its slabs, the rim of the pit
  run(bright, [[-PH, 0, -PH], [PH, 0, -PH], [PH, 0, PH], [-PH, 0, PH]], true);
  run(lines, [[-DH, 0, -DH], [DH, 0, -DH], [DH, 0, DH], [-DH, 0, DH]], true);
  for (let k = -DH + 600; k < DH; k += 600) {
    for (const [a, b] of Math.abs(k) < PH ? [[-DH, -PH], [PH, DH]] : [[-DH, DH]]) {
      run(faint, [[k, 0, a], [k, 0, b]]);
      run(faint, [[a, 0, k], [b, 0, k]]);
    }
  }
  // the pit: its walls going down into the dark, and the ridge at its bottom that splits the flame
  for (const [x, z] of [[-PH, -PH], [PH, -PH], [PH, PH], [-PH, PH]]) run(faint, [[x, 0, z], [x, -DEEP, z]]);
  run(faint, [[-PH, -DEEP / 2, -PH], [PH, -DEEP / 2, -PH], [PH, -DEEP / 2, PH], [-PH, -DEEP / 2, PH]], true);
  run(lines, [[-PH + 90, -1750, 0], [PH - 90, -1750, 0]]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) run(faint, [[sx * (PH - 90), -1750, 0], [sx * (PH - 90), -DEEP, sz * PH]]);
  // a black well inside it: the steppe drawn at infinity must not show through the hole (only its far walls are drawn)
  fx.well = new THREE.Mesh(new THREE.BoxGeometry(2 * PH + 8, DEEP, 2 * PH + 8), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide, fog: false }));
  fx.well.position.y = -DEEP / 2 - 3;
  pad.add(fx.well);

  // the four arms (« la tulipe »), in line with the boosters: each pivots at the rim and holds its booster high up; a
  // counterweight under the deck swings it back as the rocket rises
  fx.arms = [];
  const gripY = PAD.arms - PAD.deck;
  const grip = bSection(PAD.arms - BOOSTERS.bottom);
  for (const az of Object.values(BOOSTERS.az)) {
    const seat = new THREE.Group();
    seat.rotation.y = (az - 90) * DEG;
    pad.add(seat);
    const arm = new THREE.Group();
    arm.position.x = PH + 60;
    seat.add(arm);
    fx.arms.push(arm);
    const gx = grip.c + grip.r + 16 - (PH + 60);
    const chord = (z0, z1) => [[0, 0, z0], [gx, gripY, z1]];
    const A0 = chord(62, 40);
    const B0 = chord(-62, -40);
    const L = [];
    const F = [];
    run(L, A0);
    run(L, B0);
    const at = (c, t) => c[0].map((v, i) => lerp(v, c[1][i], t));
    for (let k = 0; k < 9; k++) run(F, [at(A0, k / 9), at(B0, (k + 0.5) / 9), at(A0, (k + 1) / 9)]);
    // the shoe that bears on the booster
    run(L, [[gx, gripY - 80, 40], [gx, gripY + 70, 40], [gx, gripY + 70, -40], [gx, gripY - 80, -40]]);
    run(L, [[gx - 26, gripY - 50, 0], [gx, gripY, 0]]);
    // the counterweight, under the deck outside the pit
    const cw = [[30, -40], [520, -40], [520, -560], [30, -560]];
    for (const z of [-70, 70]) run(F, cw.map(([x, y]) => [x, y, z]), true);
    for (const [x, y] of cw) run(F, [[x, y, -70], [x, y, 70]]);
    segments(L, fx.padLines, arm);
    segments(F, fx.padFaint, arm);
  }

  // two masts behind the rocket (the cable mast, the fuelling mast), a boom at the top toward it
  fx.masts = [];
  for (const [az, h, boom] of [[118, 2900, 520], [-152, 2500, 470]]) {
    const seat = new THREE.Group();
    seat.rotation.y = (az - 90) * DEG;
    pad.add(seat);
    const mast = new THREE.Group();
    mast.position.x = 780;
    seat.add(mast);
    fx.masts.push(mast);
    const L = [];
    const F = [];
    const w = 75;
    const corners = [[-w, -w], [w, -w], [w, w], [-w, w]];
    for (const [x, z] of corners) run(L, [[x, 0, z], [x, h, z]]);
    for (let y = 0; y <= h; y += 290) run(F, corners.map(([x, z]) => [x, Math.min(y, h), z]), true);
    for (let y = 0; y + 290 <= h; y += 290) {
      for (let k = 0; k < 4; k++) {
        const [x0, z0] = corners[k];
        const [x1, z1] = corners[(k + 1) % 4];
        run(F, [y % 580 === 0 ? [x0, y, z0] : [x1, y, z1], y % 580 === 0 ? [x1, y + 290, z1] : [x0, y + 290, z0]]);
      }
    }
    run(L, [[-w, h - 60, -30], [-w - boom, h - 110, -30], [-w - boom, h - 110, 30], [-w, h - 60, 30]]);
    segments(L, fx.padLines, mast);
    segments(F, fx.padFaint, mast);
  }

  // the two halves of the service gantry, lowered: two long lattices lying on the deck, one on each side
  for (const az of [90, -90]) {
    const seat = new THREE.Group();
    seat.rotation.y = (az - 90) * DEG;
    pad.add(seat);
    const L = [];
    const F = [];
    const x0 = PH + 260;
    const x1 = x0 + 3000;
    const w = 430;
    const h = 480;
    const box8 = (x) => [[x, 0, -w], [x, 0, w], [x, h, w], [x, h, -w]];
    run(L, box8(x0), true);
    run(L, box8(x1), true);
    for (const [y, z] of [[0, -w], [0, w], [h, w], [h, -w]]) run(L, [[x0, y, z], [x1, y, z]]);
    for (let x = x0 + 375; x < x1; x += 375) run(F, box8(x), true);
    for (let x = x0; x + 375 <= x1; x += 375) {
      run(F, [[x, h, -w], [x + 375, h, w]]);
      run(F, [[x, 0, w], [x + 375, h, w]]);
      run(F, [[x, 0, -w], [x + 375, h, -w]]);
    }
    segments(L, fx.padLines, seat);
    segments(F, fx.padFaint, seat);
  }
  segments(bright, fx.padBright, pad);
  segments(lines, fx.padLines, pad);
  segments(faint, fx.padFaint, pad);
  fx.smoke = makeSmoke();
  pad.add(fx.smoke.points);
  const dress = dressPad(); pad.add(dress.group);

  /* ───────────────────────────────────────────────────────────── every frame */
  const goods = ["B", "V", "G"].map((name) => fx.boosters[name]);
  const all = Object.values(fx.boosters);
  const ROT = (motion, px, py, a, dx, dy) => {
    // turn by `a` about (px, py) of the radial frame, then move by (dx, dy)
    const c = Math.cos(a);
    const s = Math.sin(a);
    motion.rotation.z = a;
    motion.position.set(px - (px * c - py * s) + dx, py - (px * s + py * c) + dy, 0);
  };

  return {
    group,
    pad,
    A,
    fx,
    /** P = { shell, sep, bad, impact, fault, burn, boost, trail, tilt, apart, alt, pad, flown, airspeed } — sixteen times a frame, nothing allocated */
    update(P, time = 0, px = 1000) {
      const shell = clamp01(P.shell ?? 1);
      const sep = clamp01(P.sep ?? 0);
      const bad = Math.min(2, Math.max(0, P.bad ?? 0));
      const impact = clamp01(P.impact ?? 0);
      const fault = clamp01(P.fault ?? 0);
      const burn = clamp01(P.burn ?? 0);
      const boost = clamp01(P.boost ?? 0);
      const alt = P.alt ?? 50;
      const padK = clamp01(P.pad ?? 0);
      const expand = smooth(2, 30, alt); // up where the air is thin, a jet opens into a wide plume

      /* the shell */
      const goodK = 1 - smooth(0.8, 0.97, sep);
      const badK = 1 - smooth(1.8, 1.97, bad);
      fx.hull.uniforms.uAmount.value = shell;
      fx.inner.uniforms.uAmount.value = shell;
      fx.good.uniforms.uAmount.value = shell * goodK;
      fx.goodFin.uniforms.uAmount.value = shell * goodK;
      fx.bad.uniforms.uAmount.value = shell * badK;
      fx.badFin.uniforms.uAmount.value = shell * badK;
      const line = 0.12 + 0.88 * shell;
      fx.outline.opacity = fx.outline.userData.base * line;
      fx.frames.opacity = fx.frames.userData.base * line;
      fx.truss.opacity = fx.truss.userData.base * line;
      fx.goodLines.opacity = fx.goodLines.userData.base * line * goodK;
      // D turns signal the moment it goes wrong
      const hotD = smooth(0.03, 0.12, bad);
      fx.bad.uniforms.uColor.value.copy(INK).lerp(SIGNAL, hotD);
      fx.badFin.uniforms.uColor.value.copy(INK).lerp(SIGNAL, hotD);
      fx.badLines.color.copy(INK).lerp(SIGNAL, hotD).multiplyScalar(1 + 0.5 * hotD);
      fx.badLines.opacity = Math.min(1, fx.badLines.userData.base * (1 + 0.4 * hotD)) * line * badK;

      /* the three good boosters: their noses swing out about their foot (the cross), then they fall away */
      const open = 0.3 * smooth(0, 0.3, sep) + 1.25 * Math.pow(smooth(0.22, 1, sep), 1.5);
      const drop = 4800 * Math.pow(smooth(0.12, 1, sep), 2);
      const out = 450 * smooth(0.08, 1, sep);
      for (let i = 0; i < goods.length; i++) {
        const b = goods[i];
        ROT(b.motion, FOOT.c, BOOSTERS.bottom, -open, out, -drop);
        b.motion.visible = goodK > 0.003;
        b.puff.scale.setScalar(0.3 + 0.7 * smooth(0, 0.4, sep));
      }
      fx.puff.uniforms.uAmount.value = smooth(0.02, 0.08, sep) * (1 - smooth(0.26, 0.46, sep)) * goodK;

      /* D: about its upper joint — its foot swings out, its nose back IN: the gap it opened closes at exactly 1 */
      const d = fx.boosters.D;
      if (bad <= 1) {
        const theta = 0.14 * smooth(0, 1, bad);
        const gap = 60 * Math.sin(Math.PI * bad);
        ROT(d.motion, D_PIVOT[0], D_PIVOT[1], theta, gap + D_ARM * Math.sin(theta) - 4 * smooth(0.9, 1, bad), 0);
      } else {
        const u = bad - 1;
        const theta = 0.14 + 1.5 * Math.pow(u, 1.4);
        ROT(d.motion, D_PIVOT[0], D_PIVOT[1], theta, D_ARM * Math.sin(theta) + 520 * u, -5200 * u * u);
      }
      d.motion.visible = badK > 0.003;

      /* the strike */
      const flash = smooth(0.45, 1, impact);
      const ember = smooth(0.12, 0.35, impact);
      const fu = fx.flash.uniforms;
      fu.uAmount.value = 0.4 * ember + 0.6 * flash;
      fu.uHeart.value = smooth(0.55, 0.95, impact);
      fu.uSize.value = 50 + 110 * flash;
      fu.uSheath.value = 9 + 11 * flash; // the hot air around the heart: wide at the blow, a small ember after
      fu.uHalo.value = 0.14 + 0.22 * flash;
      fx.sparks.uniforms.uAmount.value = smooth(0.4, 0.9, impact);
      fx.sparks.uniforms.uT.value = time;
      fx.dent.uniforms.uAmount.value = smooth(0.15, 0.25, impact) * (0.75 + 0.25 * flash);
      fx.dent.uniforms.uCrack.value = 1 - 0.85 * flash; // the cracks show once the light has gone
      fx.flash.mesh.visible = impact > 0.005;
      fx.sparks.points.visible = impact > 0.4;
      fx.dent.mesh.visible = impact > 0.15;

      /* the faulty part */
      d.kink.rotation.z = -8 * DEG * fault;
      fx.fitD.emissiveIntensity = 1.25 * fault;
      fx.fitD.color.copy(fx.fitDark).lerp(fx.fitHot, fault);
      for (let i = 0; i < fx.fitEdges.length; i++) fx.fitEdges[i].color.copy(INK).lerp(SIGNAL, fault).multiplyScalar(1 + 0.8 * fault);

      /* the fire — its ripples and its slow breath run with `flown`: when the story stops the clock, the jets hold still */
      const flown = P.flown ?? 0;
      const breath = 0.95 + 0.05 * Math.sin(flown * 0.04 + 0.5);
      fx.coreJet.uniforms.uAmount.value = burn * breath;
      fx.coreJet.uniforms.uFlow.value = flown * 0.12;
      coreJet.visible = burn > 0.005;
      coreJet.scale.set(1 + 0.35 * expand, 1 - 0.2 * expand, 1 + 0.35 * expand);
      fx.plume.uniforms.uAmount.value = burn * expand * 0.14;
      fx.plume.uniforms.uFlow.value = flown * 0.07;
      plume.visible = burn * expand > 0.005;
      fx.boosterJet.uniforms.uAmount.value = boost * breath;
      fx.boosterJet.uniforms.uFlow.value = flown * 0.12;
      for (let i = 0; i < all.length; i++) {
        all[i].jet.visible = boost > 0.005;
        all[i].jet.scale.set(1 + 0.3 * expand, 1 - 0.15 * expand, 1 + 0.3 * expand);
      }
      fx.fireCore.color.copy(INK).multiplyScalar(2.3 * burn);
      coreDiscs.visible = burn > 0.005;
      fx.fireBooster.color.copy(INK).multiplyScalar(2.1 * boost);
      const tu = fx.trail.uniforms;
      tu.uAmount.value = clamp01(P.trail ?? 0);
      tu.uTilt.value = (P.tilt ?? 0) * DEG;
      tu.uScroll.value = flown * 30; // puffs move down the trail at 0.3 of the climb (a seventh of their period per frame, at most, below ≈ 150 m of flown per second)
      trail.visible = tu.uAmount.value > 0.005;

      /* the pad */
      pad.visible = padK > 0.01;
      if (pad.visible) {
        fx.padBright.opacity = fx.padBright.userData.base * padK;
        fx.padLines.opacity = fx.padLines.userData.base * padK;
        fx.padFaint.opacity = fx.padFaint.userData.base * padK;
        const lift = Math.max(0, (alt - PAD.alt) * 1e5); // cm the rocket has risen out of its arms
        const fall = smooth(0, 700, lift);
        for (let i = 0; i < fx.arms.length; i++) fx.arms[i].rotation.z = -1.1 * fall;
        for (let i = 0; i < fx.masts.length; i++) fx.masts[i].rotation.z = -0.3 * fall;
        fx.smoke.uniforms.uAmount.value = padK * smooth(0.05, 0.7, Math.max(burn, boost));
        fx.smoke.uniforms.uT.value = time;
        fx.smoke.uniforms.uScale.value = px;
        fx.smoke.points.visible = fx.smoke.uniforms.uAmount.value > 0.003;
        dress.update(P, time, px);
      }
    },
  };
}
