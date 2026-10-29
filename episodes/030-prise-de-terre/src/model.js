// DOSSIER 030 — Prise de terre : the system, the EARTHING CHAIN (régime TT). Centimetres, y up.
//   buildModel() → { root, parts, A, update(P, time, px) }   (docs/030-decors.md, « src/model.js »)
// From the machine to the ground, in the order the fault current takes it:
//   · the earth screw on the casing: a stamped earth tab, a boss, a serrated washer, the ring lug crimped on the PE, a pan-head screw
//   · the protective conductor (PE): green-and-yellow — drawn as bands of veille and ink, never yellow — down the back panel,
//     into the cord (a dark sheath), along the floor, into the plug
//   · the plug (2P+T: a round dark body, two pins, the earth HOLE at the top) and the socket (white, its well, two holes,
//     its earth PIN at the top: in France the pin is the socket's, and it enters the plug)
//   · the PE of the circuit in the wall, up to the consumer unit: the 30 mA differential (two modules, its handle, its test
//     button, no text) on its rail, phase and neutral through it; under it the main earthing terminal (a copper bar, screws)
//   · the earthing conductor (bare copper), the test link (two terminal blocks and a link bar), through the slab, down the
//     footing to the loop
//   · the earth electrode: a bare copper loop at the bottom of the trench, AROUND the foundations
// Laid out twice: IN PLACE (bench 0, PLACE of plan.js, the laundry's frame — the real runs, metres long, the loop round the
// corner of the house) and ON THE BENCH (bench 1, BENCH: one column, top = the casing, bottom = the earth).
// Three values of grey: dark (what holds and insulates: plug, rail, feet, cord), mid (galvanised steel, terminal blocks),
// clear (what conducts and what is moulded white: copper, the socket, the differential); the lug is the clearest of all.
// Copper is a clear grey (as on 008): the film has three colours and copper is none of them.
// LIGHT runs on one ruler, `s` (cm from the lug): a veille head for `run` (it lights what it has passed), veille dashes running
// down behind a front for `leak` — at most a seventh of their period per frame — and rings in the ground.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, glass, edgesOf, box, cyl, lathe, plate, mergeGeometries, anchor } from "@kit/build3d.js";
import { PLACE, BENCH, SYSTEM, CORD_IN, LOOP, ROOM, FOUND } from "./plan.js";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const BLACK = new THREE.Color(0, 0, 0);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// leaves, arrives with a slight overshoot and settles: parts have weight (as kit/lib/build3d.js)
const settle = (u) => easeInOut(u) + Math.sin(Math.PI * u) * Math.sin(Math.PI * u) * 0.05 * (u > 0.5 ? 1 : 0.25);
const H2 = (BRAND.H / 2).toFixed(1);
const onZ = (g) => g.rotateX(Math.PI / 2); // a geometry drawn along +y, turned to stand along +z

/* ─────────────────────────────────────────────────────────── materials: one set per part */
const TONE = { hero: 0xeef0f1, clear: 0xc6cbcf, white: 0xd4d1c9, enamel: 0xc9c6be, mid: 0x8b939a, dark: 0x353c43, black: 0x23292e, copper: 0xbcc2c6 };
const kitOf = () => ({
  hero: solid(TONE.hero, { rough: 0.3, metal: 0.42, env: 1.15 }),
  clear: solid(TONE.clear, { rough: 0.4, metal: 0.4 }),
  copper: solid(TONE.copper, { rough: 0.36, metal: 0.45, env: 1.05 }),
  white: bare(solid(TONE.white, { rough: 0.45, coat: 0.35, coatRough: 0.3 })),
  enamel: bare(solid(TONE.enamel, { rough: 0.4, coat: 0.45, coatRough: 0.25 })),
  mid: solid(TONE.mid, { rough: 0.5, metal: 0.35 }),
  dark: bare(solid(TONE.dark, { rough: 0.62, metal: 0.1 })),
  black: bare(solid(TONE.black, { rough: 0.72 })),
});
// moulded plastic and enamel keep a bare surface: the machining grain of the studio (`finish`) would stripe them
const bare = (m) => ((m.userData.finish = false), m);
const cordMat = () => bare(solid(0x2a3035, { rough: 0.55, double: true })); // double: an open end of the sheath reads as a dark core

/** The green-and-yellow conductor: two helical bands — `uA` the green-and-yellow one (veille when lit), `uB` ink. Wide bands,
 *  melted into their mean before they get finer than a few pixels: nothing shimmers. Lit, the veille band glows. */
function stripedMat(pitch) {
  const mat = solid(0x3a4046, { rough: 0.42, metal: 0, double: true });
  mat.userData.finish = false;
  const U = { uA: { value: new THREE.Color(0x3a4046) }, uB: { value: new THREE.Color(0x8a8984) }, uGlowA: { value: new THREE.Color(0, 0, 0) }, uGlowB: { value: new THREE.Color(0, 0, 0) }, uPitch: { value: pitch } };
  mat.userData.stripe = U;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aS; attribute float aA; uniform float uPitch; varying float vQ;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvQ = aS / uPitch + aA;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform vec3 uA, uB, uGlowA, uGlowB; varying float vQ;
        float sdBand(float q) {
          float w = clamp(fwidth(q) * 1.3, 0.002, 0.5);
          float f = fract(q);
          float b = smoothstep(0.0, w, f) * (1.0 - smoothstep(0.5, 0.5 + w, f));
          return mix(b, 0.5, smoothstep(0.14, 0.42, w));
        }`,
      )
      .replace("vec4 diffuseColor = vec4( diffuse, opacity );", "float sdB = sdBand(vQ);\nvec4 diffuseColor = vec4( mix(uB, uA, sdB), opacity );")
      .replace("vec3 totalEmissiveRadiance = emissive;", "vec3 totalEmissiveRadiance = emissive + mix(uGlowB, uGlowA, sdB);");
  };
  mat.customProgramCacheKey = () => "sd030-stripe";
  return mat;
}

/** A ghost: the X-ray of what is missing (on the bench, the chain beyond the socket when `chain` is 0). */
const ghostMat = () => glass(BRAND.ink, { base: 0.012, rim: 0.55, power: 2.2, edge: 0.4 });

/** Fade one material (setPartOpacity, for a single material and without hiding anything). */
function fadeMat(mat, a) {
  const o = mat.userData.base * a;
  if (mat.opacity === o) return;
  mat.opacity = o;
  const transparent = mat.userData.transparent || a < 0.999;
  if (mat.transparent !== transparent) {
    mat.transparent = transparent;
    mat.needsUpdate = true;
  }
  mat.depthWrite = mat.userData.depthWrite && a > 0.55;
}

/* ─────────────────────────────────────────────────────────── light that has a place */

/** A light seen from anywhere: a bright core and a long tail, `uRadius` cm or `uMinPx` pixels if that is more (as on 008). */
const haloMaterial = (core = 0.75) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uRadius: { value: 1 }, uMinPx: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uRadius, uMinPx; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        vec4 mv = modelViewMatrix * vec4(position * r, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main() {
        float n = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        gl_FragColor = vec4(uColor * (${core.toFixed(2)} * pow(n, 14.0) + ${(1 - core).toFixed(2)} * pow(n, 4.0)), 1.0);
      }`,
  });

/**
 * The light along a conductor (one material per layout, shared by its runs). Its vertices lie ON the path; the shader pushes
 * them out by their radius, or by `uMinPx` pixels if that is more — a line of light is never thinner than a line.
 *   uGrow              what exists of the chain (s, cm): beyond it, nothing (in place, the chain grows from the socket)
 *   uUnder             what lies under the floor (local y < 0) shows only with the cut-away
 *   uRunS / uRunOn     the head that runs from the lug; uTrail: what it has passed stays lit, up to uTrailMax
 *   uLeakS / uLeakOn   the fault current: behind its front, dashes run DOWN the chain (toward the earth)
 *   uDash              1 dashes · 0 melted into a plain line (the camera sweeping along: dashes crossed fast twist)
 *   uJoin / uFar       past the junction, along the loop, the light thins out with distance
 * `period` (cm) and `speed` (cm/s): a dash moves speed/30 per frame — under a seventh of its period (the trap of 004).
 */
function sheathMaterial({ period, speed, head, front }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: {
      uColor: { value: VEILLE.clone() }, uTime: { value: 0 }, uMinPx: { value: 2.6 }, uGrow: { value: 1e9 }, uUnder: { value: 1 },
      uRunS: { value: -1e4 }, uRunOn: { value: 0 }, uTrail: { value: 0 }, uTrailMax: { value: 1e9 },
      uLeakS: { value: -1e4 }, uLeakOn: { value: 0 }, uDash: { value: 1 }, uJoin: { value: 1e9 }, uFar: { value: 400 },
    },
    vertexShader: /* glsl */ `
      attribute float aS; attribute float aRad; uniform float uMinPx;
      varying float vS; varying float vY; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 c = modelViewMatrix * vec4(position, 1.0);
        float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
        vec4 mv = modelViewMatrix * vec4(position + normal * max(aRad, uMinPx * cmPerPx), 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vS = aS;
        vY = position.y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uGrow, uUnder, uRunS, uRunOn, uTrail, uTrailMax, uLeakS, uLeakOn, uDash, uJoin, uFar;
      varying float vS; varying float vY; varying vec3 vN; varying vec3 vV;
      // bars of light, their ends softened over what a pixel covers, melted into their mean once too small to count (008)
      float bars(float x, float duty) {
        float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
        float q = fract(x);
        float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
        return mix(b, duty, smoothstep(0.12, 0.4, w));
      }
      void main() {
        if (vS > uGrow) discard;
        float under = vY < -0.5 ? uUnder : 1.0;
        if (under < 0.004) discard;
        float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.3);
        float far = vS > uJoin ? exp(-(vS - uJoin) / uFar) : 1.0;
        float passed = 1.0 - smoothstep(uRunS - ${front.toFixed(2)}, uRunS + ${front.toFixed(2)}, vS);
        float trail = uTrail * passed * (1.0 - step(uTrailMax, vS)) * (0.3 + 0.7 * far);
        float g = vS - uRunS;
        float head = uRunOn * 1.5 * exp(-g * g / ${head.toFixed(2)});
        float behind = 1.0 - smoothstep(uLeakS - ${front.toFixed(2)}, uLeakS + ${front.toFixed(2)}, vS);
        float dash = mix(0.5, bars((vS - uTime * ${speed.toFixed(2)}) / ${period.toFixed(2)}, 0.5), uDash);
        float l = vS - uLeakS;
        float leak = uLeakOn * (behind * (0.28 + 1.15 * dash) * (0.35 + 0.65 * far) + 1.2 * exp(-l * l / ${head.toFixed(2)}));
        gl_FragColor = vec4(uColor * min(trail + head + leak, 3.0) * body * under, 1.0);
      }`,
  });
}

/** The fault current leaving the loop in place: rings in planes across the copper, at stations along the two arms, that
 *  widen and die out — thin lines (as on 008), never a veil. Only in the soil, under the slab: `uY0` is the station's
 *  height, the plane's local y is the world's. */
const stationRingMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
    uniforms: { uColor: { value: VEILLE.clone() }, uRing: { value: new THREE.Vector4(0, 0, 0, 0) }, uY0: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform vec4 uRing; uniform float uY0; varying vec2 vP;
      float ring(float rho, float r, float k) {
        float w = max(0.9 + 0.012 * r, 1.4 * fwidth(rho));
        float d = (rho - r) / w;
        return k * exp(-d * d);
      }
      void main() {
        float y = uY0 + vP.y;
        float soil = 1.0 - smoothstep(${(FOUND.footing.top - 12).toFixed(1)}, ${(FOUND.footing.top - 2).toFixed(1)}, y);
        float rho = length(vP);
        float a = soil * (ring(rho, uRing.x, uRing.y) + ring(rho, uRing.z, uRing.w));
        if (a < 0.002) discard;
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
  });

/** On the bench: rings on the grid round the turn of loop (its distance field), widening and dying out. */
const benchRingMaterial = (hx, hz, rc) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
    uniforms: { uColor: { value: VEILLE.clone() }, uRing: { value: new THREE.Vector4(0, 0, 0, 0) } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform vec4 uRing; varying vec2 vP;
      float box(vec2 p) { vec2 q = abs(p) - vec2(${(hx - rc).toFixed(2)}, ${(hz - rc).toFixed(2)}); return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - ${rc.toFixed(2)}; }
      float ring(float rho, float r, float k) {
        float w = max(0.5 + 0.02 * r, 1.3 * fwidth(rho));
        float d = (rho - r) / w;
        return k * exp(-d * d);
      }
      void main() {
        float rho = box(vP);
        if (rho < 0.3) discard;
        float a = ring(rho, uRing.x, uRing.y) + ring(rho, uRing.z, uRing.w);
        if (a < 0.002) discard;
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
  });

/* ─────────────────────────────────────────────────────────── conductors: a run on a ruler */

/** A polyline with its corners rounded — the way a wire is bent — and no stretch longer than `stride` (as on 008). */
function bent(points, cut = 4, steps = 6, stride = 3) {
  const P = points.map((p) => V(...p));
  const out = [];
  const push = (p) => {
    const last = out[out.length - 1];
    if (last) {
      const d = last.distanceTo(p);
      if (d < 1e-4) return;
      const n = Math.ceil(d / stride);
      for (let i = 1; i < n; i++) out.push(last.clone().lerp(p, i / n));
    }
    out.push(p);
  };
  P.forEach((p, i) => {
    const a = P[i - 1];
    const b = P[i + 1];
    if (!a || !b) return push(p.clone());
    const u = a.clone().sub(p);
    const v = b.clone().sub(p);
    const k = Math.min(Array.isArray(cut) ? cut[i] : cut, u.length() / 2.2, v.length() / 2.2);
    const from = p.clone().addScaledVector(u.normalize(), k);
    const to = p.clone().addScaledVector(v.normalize(), k);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      push(from.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(p, 2 * t * (1 - t)).addScaledVector(to, t * t));
    }
  });
  return out;
}

/** A run: dense centre points at rest (P), where they are now (C), their ruler (S, cm, from s0), their frames (N, B). */
function makeRun(points, s0 = 0) {
  const n = points.length;
  const P = new Float32Array(n * 3);
  const S = new Float32Array(n);
  const N = new Float32Array(n * 3);
  const B = new Float32Array(n * 3);
  const T = V(), T0 = V(), Nv = V(), Bv = V(), axis = V();
  const q = new THREE.Quaternion();
  let s = s0;
  for (let i = 0; i < n; i++) {
    const p = points[i];
    P.set([p.x, p.y, p.z], i * 3);
    if (i) s += p.distanceTo(points[i - 1]);
    S[i] = s;
    T.subVectors(points[Math.min(n - 1, i + 1)], points[Math.max(0, i - 1)]).normalize();
    if (i === 0) Nv.set(Math.abs(T.x) > 0.9 ? 0 : 1, 0, Math.abs(T.x) > 0.9 ? 1 : 0);
    else {
      axis.crossVectors(T0, T);
      const sin = axis.length();
      if (sin > 1e-7) Nv.applyQuaternion(q.setFromAxisAngle(axis.divideScalar(sin), Math.atan2(sin, T0.dot(T))));
    }
    Nv.addScaledVector(T, -Nv.dot(T)).normalize();
    T0.copy(T);
    Bv.crossVectors(T, Nv);
    N.set([Nv.x, Nv.y, Nv.z], i * 3);
    B.set([Bv.x, Bv.y, Bv.z], i * 3);
  }
  return { n, P, C: P.slice(), S, N, B, s0, s1: s, tubes: [], key: NaN, w: null };
}

/** A tube round a run. kind: "solid" (a round), "striped" (+ aS, aA for the bands), "sheath" / "shell" (vertices on the path). */
function tubeOn(run, r, radial = 10, kind = "solid") {
  const ring = radial + 1;
  const count = run.n * ring;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const nor = new Float32Array(count * 3);
  const aS = new Float32Array(count);
  const aX = new Float32Array(count);
  for (let i = 0; i < run.n; i++) {
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const k = i * ring + j;
      for (let e = 0; e < 3; e++) nor[k * 3 + e] = run.N[i * 3 + e] * c + run.B[i * 3 + e] * s;
      aS[k] = run.S[i];
      aX[k] = kind === "sheath" ? r : j / radial;
    }
  }
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  if (kind !== "solid") geo.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
  if (kind === "striped") geo.setAttribute("aA", new THREE.BufferAttribute(aX, 1));
  if (kind === "sheath") geo.setAttribute("aRad", new THREE.BufferAttribute(aX, 1));
  const index = [];
  for (let i = 1; i < run.n; i++) {
    for (let j = 0; j < radial; j++) {
      const a = (i - 1) * ring + j;
      index.push(a, a + 1, a + ring, a + ring, a + 1, a + ring + 1);
    }
  }
  geo.setIndex(index);
  const tube = { geo, r: kind === "sheath" || kind === "shell" ? 0 : r, radial };
  run.tubes.push(tube);
  writeTube(run, tube);
  geo.computeBoundingSphere();
  return geo;
}
function writeTube(run, t) {
  const pos = t.geo.attributes.position.array;
  const nor = t.geo.attributes.normal.array;
  const ring = t.radial + 1;
  for (let i = 0; i < run.n; i++) {
    const cx = run.C[i * 3], cy = run.C[i * 3 + 1], cz = run.C[i * 3 + 2];
    for (let j = 0; j < ring; j++) {
      const k = (i * ring + j) * 3;
      pos[k] = cx + nor[k] * t.r;
      pos[k + 1] = cy + nor[k + 1] * t.r;
      pos[k + 2] = cz + nor[k + 2] * t.r;
    }
  }
  t.geo.attributes.position.needsUpdate = true;
}
/** Draw a tube only as far as `s` along its run (the chain growing, segment by segment). */
function drawUpTo(run, geo, radial, s) {
  let k = 0;
  while (k < run.n - 1 && run.S[k + 1] <= s) k++;
  geo.setDrawRange(0, k * radial * 6);
}
/** Where a run is, `s` cm along its ruler (clamped to its ends). */
function along(run, s, out) {
  const S = run.S;
  if (s <= S[0]) return out.set(run.C[0], run.C[1], run.C[2]);
  for (let i = 1; i < run.n; i++) {
    if (s <= S[i]) {
      const u = (s - S[i - 1]) / Math.max(1e-6, S[i] - S[i - 1]);
      const a = (i - 1) * 3;
      const b = i * 3;
      return out.set(run.C[a] + (run.C[b] - run.C[a]) * u, run.C[a + 1] + (run.C[b + 1] - run.C[a + 1]) * u, run.C[a + 2] + (run.C[b + 2] - run.C[a + 2]) * u);
    }
  }
  const e = (run.n - 1) * 3;
  return out.set(run.C[e], run.C[e + 1], run.C[e + 2]);
}

/* ─────────────────────────────────────────────────────────── small shapes */
const circle = (r, segs = 40, cw = false) => new THREE.Path().absarc(0, 0, r, 0, Math.PI * 2, cw);
function roundRect(w, h, r) {
  const s = new THREE.Shape();
  const x = w / 2 - r;
  const y = h / 2 - r;
  s.moveTo(-x, -h / 2);
  s.lineTo(x, -h / 2);
  s.absarc(x, -y, r, -Math.PI / 2, 0, false);
  s.lineTo(w / 2, y);
  s.absarc(x, y, r, 0, Math.PI / 2, false);
  s.lineTo(-x, h / 2);
  s.absarc(-x, y, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-w / 2, -y);
  s.absarc(-x, -y, r, Math.PI, Math.PI * 1.5, false);
  return s;
}
/** A pan-head screw standing on y = 0, `r` its radius. */
const pan = (r, h = r * 0.7) => lathe([[0, 0], [r, 0], [r, h * 0.42], [r * 0.82, h * 0.86], [r * 0.4, h], [0, h]], 32, { bevel: 0.03 });
/** Lists of geometries by material ("mid", or "mid:hw" for small hardware: fainter edges), merged into one mesh each. */
function bins(part, M, parent = part) {
  const lists = new Map();
  const made = [];
  return {
    put(key, ...geos) {
      if (!lists.has(key)) lists.set(key, []);
      lists.get(key).push(...geos.flat());
      return this;
    },
    flush() {
      for (const [key, geos] of lists) {
        const [name, small] = key.split(":");
        const mesh = addMesh(part, mergeGeometries(geos), M[name], { edgeOpacity: small ? 0.34 : name === "hero" ? 0.45 : 0.52 });
        if (parent !== part) parent.add(mesh);
        made.push(mesh);
      }
      lists.clear();
      return made;
    },
  };
}

/* ─────────────────────────────────────────────────────────── the pieces (each in its own frame, +z out of what holds it) */

/** The earth screw, in the frame of A.cosse: the panel at z = −2, the lug's barrel pointing down (−y). */
function buildCosse(part, M) {
  const b = bins(part, M);
  b.put("mid", box(2.8, 3.6, 0.26, 0.1).translate(0, -0.6, -1.87)); // the stamped earth tab on the panel
  b.put("mid", onZ(cyl(0.72, 1.2, 0.1, 32)).translate(0, 0, -1.15)); // the boss
  // the serrated washer
  const teeth = new THREE.Shape();
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const r = i % 2 ? 0.98 : 0.84;
    if (i === 0) teeth.moveTo(r * Math.cos(a), r * Math.sin(a));
    else teeth.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  teeth.holes.push(circle(0.3, 24, true));
  b.put("clear:hw", plate(teeth, 0.12, { bevel: 0.03 }).translate(0, 0, -0.55));
  // the ring lug: its eye and its tongue, flat, then the crimped barrel
  const lug = new THREE.Shape();
  lug.moveTo(0.44, -1.45);
  lug.lineTo(0.44, -0.72);
  lug.absarc(0, 0, 0.86, -57 * (Math.PI / 180), 237 * (Math.PI / 180), false);
  lug.lineTo(-0.44, -1.45);
  lug.lineTo(0.44, -1.45);
  lug.holes.push(circle(0.33, 24, true));
  b.put("hero", plate(lug, 0.14, { bevel: 0.04 }).translate(0, 0, -0.43));
  b.put("hero", lathe([[0, -0.78], [0.4, -0.78], [0.4, -0.32], [0.32, -0.16], [0.32, 0.16], [0.4, 0.32], [0.4, 0.78], [0, 0.78]], 32, { bevel: 0.05 }).translate(0, -2.1, -0.08));
  // the screw: a pan head and its cross
  b.put("clear", onZ(pan(0.62, 0.42)).translate(0, 0, -0.29));
  b.flush();
  const cross = mergeGeometries([box(0.13, 0.66, 0.1, 0.03), box(0.66, 0.13, 0.1, 0.03)]).translate(0, 0, 0.1);
  addMesh(part, cross, M.black, { edges: false });
}

/** The socket, in its frame: its back on the wall at z = 0, its face at z = 3.8, the well 1.5 deep; the earth pin at the top. */
const SOCK = { face: 3.8, floor: 2.3, pinY: 1.0, holes: 0.95 };
function buildSocket(part, M) {
  const b = bins(part, M);
  b.put("white", box(7.6, 7.6, SOCK.floor, 0.35).translate(0, 0, SOCK.floor / 2));
  const face = roundRect(8.2, 8.2, 1.3);
  face.holes.push(circle(2.05, 48, true));
  b.put("white", plate(face, SOCK.face - SOCK.floor, { bevel: 0.24 }).translate(0, 0, SOCK.floor));
  b.flush();
  // the two holes: dark, so the face reads at a glance
  addMesh(part, mergeGeometries([-1, 1].map((s) => onZ(cyl(0.3, 0.04, 0.01, 24)).translate(s * SOCK.holes, 0, SOCK.floor + 0.03))), M.black, { edges: false });
  // the earth pin and its root (`pin`)
  const pinG = new THREE.Group();
  part.add(pinG);
  const pb = bins(part, M, pinG);
  pb.put("hero", onZ(lathe([[0, 0], [0.36, 0], [0.36, 1.28], [0.26, 1.48], [0, 1.52]], 32, { bevel: 0.04 })).translate(0, SOCK.pinY, SOCK.floor));
  pb.put("mid:hw", onZ(cyl(0.64, 0.12, 0.03, 24)).translate(0, SOCK.pinY, SOCK.floor + 0.06)); // its dark root makes it stand out of the white
  pb.flush();
  return { pinG };
}

/** The plug, in its frame: its face at z = 0 (against the well's floor when plugged), its body toward +z, the cord out of
 *  its back at z = 5.2. Two pins toward −z; the earth HOLE at the top, ringed in metal. */
const PLUG = { back: 5.2 };
function buildPlug(part, M) {
  const b = bins(part, M);
  b.put("dark", onZ(lathe([[0, 0], [1.86, 0], [1.95, 0.22], [1.95, 2.3], [1.84, 2.5], [1.84, 3.25], [1.6, 3.6], [0.82, 4.0], [0.62, PLUG.back], [0, PLUG.back]], 64, { bevel: 0.1 })));
  b.put("dark", ...[0.7, 1.15, 1.6].map((z) => onZ(cyl(1.99, 0.14, 0.04, 64)).translate(0, 0, z))); // grip rings
  b.put("clear", ...[-1, 1].map((s) => onZ(lathe([[0, -1.9], [0.17, -1.9], [0.24, -1.8], [0.24, 0.05], [0, 0.05]], 28, { bevel: 0.03 })).translate(s * SOCK.holes, 0, 0)));
  b.put("clear:hw", onZ(lathe([[0.38, -0.05], [0.5, -0.05], [0.5, 0.02], [0.38, 0.02]], 32, { bevel: 0.015 })).translate(0, SOCK.pinY, 0));
  b.flush();
  addMesh(part, onZ(cyl(0.38, 0.05, 0.01, 24)).translate(0, SOCK.pinY, -0.03), M.black, { edges: false });
}

/** The consumer unit's piece, in the frame of the differential: its body centred, its nose toward +z; the rail behind it;
 *  phase and neutral through it, top and bottom. Returns its handle (a pivot) and its window. */
const DIFF = { w: 3.6, back: -3.25, nose: 3.25, pivot: [0, 0.75, 3.25] };
function buildTableau(part, M) {
  const b = bins(part, M);
  // two modules, a seam between them: the profile of a modular device (90 mm, its nose 45 mm), extruded across
  const profile = [[DIFF.back, -4.25], [1.2, -4.25], [1.2, -2.25], [DIFF.nose, -2.25], [DIFF.nose, 2.25], [1.2, 2.25], [1.2, 4.25], [DIFF.back, 4.25]];
  for (const s of [-1, 1]) b.put("white", plate(profile, DIFF.w / 2 - 0.03, { bevel: 0.12 }).rotateY(-Math.PI / 2).translate(s > 0 ? DIFF.w / 2 : 0, 0, 0));
  // the rail (35 mm top hat), across
  b.put("mid", box(12, 2.4, 0.12, 0.03).translate(1.6, 0, DIFF.back - 0.75), ...[-1, 1].map((s) => box(12, 0.12, 0.75, 0.03).translate(1.6, s * 1.2, DIFF.back - 0.4)), ...[-1, 1].map((s) => box(12, 0.55, 0.12, 0.03).translate(1.6, s * 1.5, DIFF.back - 0.06)));
  b.put("mid:hw", box(0.7, 0.5, 0.25, 0.08).translate(0.85, -1.75, DIFF.nose + 0.1)); // the test button
  b.flush();
  // the terminals' screw holes, and phase and neutral through it — two short dark stubs, top and bottom: it measures their difference
  addMesh(part, mergeGeometries([-1, 1].flatMap((s) => [4.25, -4.25].map((y) => cyl(0.32, 0.04, 0.01, 20).translate(s * 0.9, y + Math.sign(y) * 0.02, -1.4)))), M.black, { edges: false });
  const wires = [];
  for (const s of [-1, 1]) for (const y of [1, -1]) wires.push(cyl(0.3, 3.4, 0.06, 20).translate(s * 0.9, y * (4.25 + 1.6), -1.4));
  addMesh(part, mergeGeometries(wires), M.dark, { edgeOpacity: 0.35 });
  // the handle: on a pivot in the nose, up when closed
  const handle = new THREE.Group();
  handle.position.set(...DIFF.pivot);
  part.add(handle);
  const hb = bins(part, M, handle);
  hb.put("black", box(1.0, 2.0, 0.9, 0.18).translate(0, 0.85, 0), cyl(0.42, 1.1, 0.06, 24).rotateZ(Math.PI / 2));
  hb.flush();
  // the window that lights when it sees the difference (no text)
  const winMat = glow(BRAND.veille, 0, {});
  const win = addMesh(part, box(1.1, 0.55, 0.08, 0.04), winMat, { edges: false, pos: [-0.85, -1.75, DIFF.nose + 0.03] });
  return { handle, winMat, win };
}

/** The main earthing terminal, in its frame: a copper bar, five screws on its front, two insulating feet. */
function buildBorne(part, M) {
  const b = bins(part, M);
  b.put("copper", box(10, 1.4, 1.2, 0.14));
  b.put("clear:hw", ...[-3.6, -1.8, 0, 1.8, 3.6].map((x) => onZ(pan(0.4, 0.3)).translate(x, 0, 0.6)));
  b.put("dark", ...[-1, 1].map((s) => box(1.3, 1.5, 1.4, 0.15).translate(s * 4.2, 0, -1.3)), box(11, 2.2, 0.3, 0.08).translate(0, 0, -2.15));
  b.flush();
}

/** The test link, in its frame: the conductor runs along y through it (cut here), two terminal blocks, a link bar on two
 *  studs across the cut — take the bar off and the earth can be measured alone (008, testJoint, smaller). */
const LINK = { half: 4.9, block: 2.9 };
function buildBarrette(part, M) {
  const b = bins(part, M);
  b.put("dark", box(5.6, 10.6, 0.9, 0.3).translate(0, 0, -2.55));
  for (const s of [-1, 1]) {
    b.put("mid", box(3.3, 3.3, 2.4, 0.25).translate(0, s * LINK.block, -1.0));
    b.put("mid", cyl(0.66, 0.8, 0.08, 24).translate(0, s * (LINK.half - 0.35), 0)); // the boss the wire enters by
    b.put("clear:hw", onZ(cyl(0.26, 1.7, 0.05, 16)).translate(0, s * LINK.block, 0.85)); // the stud
    b.put("clear:hw", onZ(cyl(0.56, 0.42, 0.06, 6)).translate(0, s * LINK.block, 1.72)); // its nut
    b.put("mid:hw", pan(0.42, 0.3).rotateZ(Math.PI / 2).translate(-1.65, s * LINK.block, -1.0)); // the screw that bites the wire
  }
  const bar = [];
  for (const end of [1, -1]) for (let i = 0; i <= 14; i++) bar.push([1.0 * end * Math.cos((i / 14) * Math.PI), end * (LINK.block + 1.0 * Math.sin((i / 14) * Math.PI))]);
  b.put("hero", plate(bar, 0.45, { bevel: 0.1 }).translate(0, 0, 1.05));
  b.flush();
}

/** The clamp at the junction, in the frame of the loop's wire (along x), the earthing conductor arriving from +y. */
function clampGeo() {
  return {
    mid: [box(2.6, 1.7, 2.3, 0.22)],
    "clear:hw": [pan(0.45, 0.32).translate(0.75, 0.85, 0), pan(0.45, 0.32).translate(-0.75, 0.85, 0)],
  };
}

/* ─────────────────────────────────────────────────────────── the layouts */

const COSSE_END = [0, -2.95, -0.08]; // where the PE leaves the lug's barrel, in the lug's frame
const PLUGGED = SOCK.floor; // the plug's face on the well's floor
const PULLED = 6; // `plug` 0: pulled out this far (the pins clear the socket's face, the well and its pin show above the plug)
const off = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];

// IN PLACE (the laundry's frame). The socket: its back on the wall at z = 0.
const PL = (() => {
  const C = PLACE.cosse;
  const S = [PLACE.plug[0], PLACE.plug[1], 0];
  const borne = PLACE.borne;
  const bar = PLACE.barrette;
  const J = PLACE.join;
  const back = S[2] + PLUGGED + PLUG.back;
  return {
    cosse: C, socket: S, plug: [S[0], S[1], S[2] + PLUGGED], diff: PLACE.diff, borne, barrette: bar, join: J,
    peM: [off(C, COSSE_END), [C[0], C[1] - 5, 3.3], [C[0], 40, 3.0], [C[0] + 1, 22, 2.8], [CORD_IN[0], 16, 2.5], [CORD_IN[0], CORD_IN[1] + 0.4, 2.3]],
    cord: [[CORD_IN[0], CORD_IN[1] + 0.4, 2.3], [CORD_IN[0], 13.2, 1.0], [-23.5, 8, 0.9], [-27, 1.6, 1.0], [-34, 0.55, 1.1], [-50, 0.55, 1.5], [-58, 0.6, 2.6], [-62.5, 1.4, 5.2], [S[0] - 0.4, 7, 10], [S[0] - 0.2, 20, 12.4], [S[0], S[1] - 3.5, 12.4], [S[0], S[1], back + 2.4], [S[0], S[1], back - 0.2]],
    bridge: [[S[0], S[1], back - 0.2], [S[0], S[1], S[2] + PLUGGED], [S[0], S[1] - 0.6, 0.5]],
    peW: [[S[0], S[1] - 0.6, 0.5], [S[0], S[1] - 1, -2], [S[0], S[1] + 3, -6], [S[0], 214, -6], [-180, 214, -6], [-180, 142, -6], [-178.5, 136.5, -2], [-174, 133.4, 2.6], [borne[0] - 3.6, borne[1] + 0.25, borne[2] + 0.75]],
    terreA: [[borne[0] + 3.6, borne[1] - 0.2, borne[2] + 0.75], [borne[0] + 3.6, borne[1] - 2.6, borne[2] + 0.6], [borne[0] + 1.5, borne[1] - 6, borne[2] + 0.2], [bar[0], borne[1] - 10.5, bar[2]], [bar[0], bar[1] + LINK.half, bar[2]]],
    link: [[bar[0], bar[1] + LINK.half, bar[2]], [bar[0], bar[1] + LINK.block, bar[2] + 1.6], [bar[0], bar[1] - LINK.block, bar[2] + 1.6], [bar[0], bar[1] - LINK.half, bar[2]]],
    terreB: [[bar[0], bar[1] - LINK.half, bar[2]], [bar[0], 0.5, bar[2]]],
    terreC: [[bar[0], 0.5, bar[2]], [bar[0], -4, 2.2], [bar[0], -10, -4.5], [bar[0], FOUND.footing.top, J[2]], [J[0], J[1] + 1.05, J[2]]],
    armA: [J, [ROOM.x1 + 520, J[1], J[2]]],
    armB: [J, LOOP.corner, [LOOP.corner[0], J[1], ROOM.z1 + 520]],
  };
})();

// ON THE BENCH (the bench's frame): one column. The socket on a stub of wall (a glass plate behind it).
const BL = (() => {
  const C = BENCH.cosse;
  const S = BENCH.socket;
  const borne = BENCH.borne;
  const bar = BENCH.barrette;
  const back = S[2] + PLUGGED + PLUG.back;
  const cordEnd = [-1.5, 57.0, -1.0];
  return {
    cosse: C, socket: S, plug: [S[0], S[1], S[2] + PLUGGED], diff: BENCH.diff, borne, barrette: bar,
    stubFace: C[2] - 2.0, // the panel's inner face (the lug's tab sits on it)
    cordEnd,
    peM: [off(C, COSSE_END), [C[0], C[1] - 4.3, -0.85], [-2.4, 58.4, -1.3], [cordEnd[0] - 0.15, cordEnd[1] + 0.35, cordEnd[2] - 0.1]],
    // the cord goes round the socket's right side, never across its face, and comes into the plug's back
    cord: [[cordEnd[0] - 0.15, cordEnd[1] + 0.35, cordEnd[2] - 0.1], [1.5, 56.2, -0.2], [4.8, 54.0, 2.5], [6.0, 50.8, 6.4], [5.6, 48.2, 9.2], [2.2, S[1], back + 1.9], [S[0], S[1], back + 0.6], [S[0], S[1], back - 0.2]],
    bridge: [[S[0], S[1], back - 0.2], [S[0], S[1], S[2] + PLUGGED], [S[0], S[1] - 0.6, 0.4]],
    peW: [[S[0], S[1] - 0.6, 0.4], [S[0], S[1] - 1.4, -0.9], [0.4, 43, -1.0], [0.9, 40.4, -0.8], [1.5, 35.5, -0.1], [2.1, 30.5, 0.9], [borne[0] - 3.6, borne[1] + 1.4, borne[2] + 0.7], [borne[0] - 3.6, borne[1] + 0.25, borne[2] + 0.75]],
    terreA: [[borne[0] + 3.6, borne[1] - 0.2, borne[2] + 0.75], [borne[0] + 3.6, borne[1] - 1.9, borne[2] + 0.6], [borne[0] + 1.6, borne[1] - 4.2, borne[2] + 0.2], [bar[0], bar[1] + LINK.half + 1.4, bar[2]], [bar[0], bar[1] + LINK.half, bar[2]]],
    link: [[bar[0], bar[1] + LINK.half, bar[2]], [bar[0], bar[1] + LINK.block, bar[2] + 1.6], [bar[0], bar[1] - LINK.block, bar[2] + 1.6], [bar[0], bar[1] - LINK.half, bar[2]]],
    terreB: [[bar[0], bar[1] - LINK.half, bar[2]], [bar[0], 7.6, bar[2] + 0.3], [BENCH.join[0], 3.6, BENCH.join[2] - 0.4], [BENCH.join[0], 1.32, BENCH.join[2]]],
  };
})();
// The turn of loop on the bench: a rounded rectangle round a stub of footing (glass), in the loop's own frame (its centre
// at BENCH.loop.at, the bench level), passing through the junction (BENCH.join).
const BLOOP = { at: [BENCH.loop.at[0], 0, BENCH.loop.at[2]], hx: 12, hz: BENCH.join[2] - BENCH.loop.at[2], rc: 3.4, r: 0.42 };
BLOOP.y = BLOOP.r;
BLOOP.join = [BENCH.join[0] - BLOOP.at[0], BLOOP.y, BENCH.join[2] - BLOOP.at[2]];
function benchLoopArms() {
  const { hx, hz, rc, y } = BLOOP;
  const pts = [];
  const step = 0.5;
  const push = (x, z) => pts.push(V(x, y, z));
  const [jx] = BLOOP.join;
  // walk the rounded rectangle from the junction, counter-clockwise seen from above (+x along the front first)
  const legs = [
    [jx, hz, hx - rc, hz], null, [hx, hz - rc, hx, -(hz - rc)], null, [hx - rc, -hz, -(hx - rc), -hz], null, [-hx, -(hz - rc), -hx, hz - rc], null, [-(hx - rc), hz, jx, hz],
  ];
  const corners = [[hx - rc, hz - rc, 90, 0], [hx - rc, -(hz - rc), 0, -90], [-(hx - rc), -(hz - rc), -90, -180], [-(hx - rc), hz - rc, -180, -270]];
  let c = 0;
  for (const leg of legs) {
    if (leg) {
      const [x0, z0, x1, z1] = leg;
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / step));
      for (let i = pts.length ? 1 : 0; i <= n; i++) push(x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n);
    } else {
      const [cx, cz, a0, a1] = corners[c++];
      for (let i = 1; i <= 12; i++) {
        const a = ((a0 + ((a1 - a0) * i) / 12) * Math.PI) / 180;
        push(cx + rc * Math.cos(a), cz + rc * Math.sin(a));
      }
    }
  }
  const half = Math.floor(pts.length / 2);
  return [pts.slice(0, half + 1), pts.slice(half).reverse()];
}

/* ─────────────────────────────────────────────────────────── the explosion: one column that unrolls downward
   Each knot is a height of the column; at `explode` 0 it is gathered behind the stub of casing, then it comes down to its
   place in its own window (the cord, the plug and the socket, the unit, the test link, the loop). Pieces ride their knot;
   conductors are warped in between, so they unroll like a wire paid out. */
const KNOTS = [
  { y: 59, z: -1, delay: -1 }, // the stub's bottom edge: never moves
  { y: 57, z: -1, delay: -1 }, // the cord's end at the stub
  { y: 53, z: 4, delay: 0.06 }, // the cord
  { y: 47, z: 2, delay: 0.16 }, // the plug and the socket
  { y: 32, z: 0.5, delay: 0.3 }, // the unit
  { y: 26, z: 1, delay: 0.32 }, // the main earthing terminal
  { y: 15, z: 1, delay: 0.45 }, // the test link
  { y: 2, z: 1, delay: 0.58 }, // the loop
];
const SPAN = 0.42;
const GATHER = { y: 65, z: -7.5 };

/* ─────────────────────────────────────────────────────────── the system */

export function buildModel() {
  const root = new THREE.Group();
  root.name = "earthing-chain";
  const placeG = new THREE.Group();
  const benchG = new THREE.Group();
  root.add(placeG, benchG);

  /* ── the pieces: one each ── */
  const stub = makePart("stub");
  const cosse = makePart("cosse");
  const socket = makePart("socket");
  const plug = makePart("plug");
  const tableau = makePart("tableau");
  const borne = makePart("borne");
  const barrette = makePart("barrette");
  const pe = makePart("pe");
  const terre = makePart("terre");
  const loop = makePart("loop");
  const parts = { stub, cosse, pe, plug, socket, tableau, borne, barrette, terre, loop };
  root.add(...Object.values(parts));
  const M = {};
  for (const k of Object.keys(parts)) M[k] = kitOf();

  // the stub of casing: the back panel's corner, its inner face (where the lug is) toward +z; its side and top folded back.
  // White enamel; the side return shows the outside of the sheet from the camera's side.
  const STUB = { w: 18, h: 14, t: 0.35, ret: 2.4 };
  const [SX, SY] = BENCH.stub.at;
  {
    const b = bins(stub, M.stub);
    const face = BL.stubFace - BENCH.stub.at[2]; // the panel's inner face, in the stub's frame
    // the panel, broken off on its right and bottom like an interrupted view (a zigzag: « a piece of something bigger »)
    const W2 = STUB.w / 2;
    const H2s = STUB.h / 2;
    const outline = [[-W2, H2s], [W2, H2s]];
    for (let i = 1; i <= 9; i++) outline.push([W2 - (i % 2 ? 0.55 : 0), H2s - (STUB.h * i) / 9]);
    for (let i = 1; i <= 11; i++) outline.push([W2 - (STUB.w * i) / 11, -H2s + (i % 2 ? 0.55 : 0)]);
    outline.reverse(); // counter-clockwise
    b.put("enamel", plate(outline, STUB.t, { bevel: 0.06 }).translate(0, 0, face - STUB.t));
    b.put("enamel", box(STUB.t, STUB.h - 0.6, STUB.ret, 0.08).translate(-W2 + STUB.t / 2, 0.3, face - STUB.ret / 2));
    b.put("enamel", box(STUB.w - 1, STUB.t, STUB.ret, 0.08).translate(-0.5, H2s - STUB.t / 2, face - STUB.ret / 2));
    b.put("enamel", box(STUB.w - 3, 0.6, 0.2, 0.08).translate(1.5, -4.6, face + 0.08)); // a pressed rib
    b.flush();
    addMesh(stub, mergeGeometries([[6.6, 3.8], [6.6, -3.0]].map(([x, y]) => onZ(cyl(0.42, 0.06, 0.01, 24)).translate(x, y, face + 0.03))), M.stub.black, { edges: false });
  }
  // the phase wire that touches the casing at its corner (its sleeve worn through: a bit of bare copper), and the neutral, cut
  const FAULT_B = [-8.15, 71.85, BL.stubFace + 0.3];
  {
    const at = (p) => V(p[0] - SX, p[1] - SY, p[2] - BENCH.stub.at[2]);
    const e = BL.cordEnd;
    const phase = makeRun(bent([[e[0] + 0.1, e[1] + 0.1, e[2] - 0.1], [-3.8, 58.6, BL.stubFace + 0.35], [-6.6, 61.2, BL.stubFace + 0.32], [-7.7, 66, BL.stubFace + 0.32], [-7.95, 70.2, BL.stubFace + 0.32], [-8.05, 71.2, BL.stubFace + 0.32]], 1.2, 6, 0.6).map((p) => at([p.x, p.y, p.z])));
    addMesh(stub, tubeOn(phase, 0.26, 10), M.stub.dark, { edges: false }).frustumCulled = false;
    const neutral = makeRun(bent([[e[0] + 0.25, e[1], e[2]], [1.4, 58.3, BL.stubFace + 0.34], [5.6, 59.7, BL.stubFace + 0.32], [8.9, 60.2, BL.stubFace + 0.32]], 1.4, 6, 0.6).map((p) => at([p.x, p.y, p.z])));
    addMesh(stub, tubeOn(neutral, 0.26, 10), M.stub.mid, { edges: false }).frustumCulled = false;
    const bare = cyl(0.2, 0.75, 0.04, 16).translate(FAULT_B[0] - SX, FAULT_B[1] - SY - 0.25, FAULT_B[2] - BENCH.stub.at[2]);
    addMesh(stub, bare, M.stub.copper, { edges: false });
  }
  const stubFault = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), haloMaterial(0.7));
  stubFault.position.set(FAULT_B[0] - SX, FAULT_B[1] - SY, FAULT_B[2] - BENCH.stub.at[2] + 0.2);
  stubFault.renderOrder = 6;
  stubFault.frustumCulled = false;
  stub.add(stubFault);
  // its edges turn signal with `live`
  const stubLines = [];
  stub.traverse((o) => {
    if (o.isLineSegments2 || o.material?.isLineMaterial) stubLines.push({ mat: o.material, base: o.material.color.clone() });
  });

  buildCosse(cosse, M.cosse);
  const { pinG } = buildSocket(socket, M.socket);
  // the stub of wall behind the socket on the bench: a plate of glass
  const wallPlate = new THREE.Mesh(box(13, 13, 1.6, 0.1), glass(BRAND.ink, { base: 0.01, rim: 0.32, power: 2.4, edge: 0.5 }));
  wallPlate.position.set(0, -0.5, -0.8);
  wallPlate.renderOrder = 8;
  const wallEdges = edgesOf(wallPlate.geometry, { color: BRAND.ink, opacity: 0.32, width: 1.8 });
  wallPlate.add(wallEdges);
  socket.add(wallPlate);
  buildPlug(plug, M.plug);
  const { handle, winMat } = buildTableau(tableau, M.tableau);
  const diffHalo = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), haloMaterial(0.6));
  diffHalo.position.set(-0.85, -1.75, DIFF.nose + 0.3);
  diffHalo.renderOrder = 6;
  diffHalo.frustumCulled = false;
  tableau.add(diffHalo);
  buildBorne(borne, M.borne);
  buildBarrette(barrette, M.barrette);

  /* ── the conductors, in place ── */
  const pePlace = new THREE.Group();
  const peBench = new THREE.Group();
  pe.add(pePlace, peBench);
  const terrePlace = new THREE.Group();
  const terreBench = new THREE.Group();
  terre.add(terrePlace, terreBench);
  const loopPlace = new THREE.Group();
  const loopBench = new THREE.Group(); // the turn of loop, the footing stub, the rings: moved and scaled as one piece
  loop.add(loopPlace, loopBench);

  const stripePlace = stripedMat(2.6);
  const stripeBench = stripedMat(1.8);
  const stripeBench2 = stripedMat(1.8); // the PE beyond the socket on the bench: it can turn ghost
  const cordP = cordMat();
  const cordB = cordMat();
  for (const m of [stripePlace, stripeBench, stripeBench2, cordP, cordB]) pe.userData.part.mats.add(m);
  const cuP = M.terre.copper; // the earthing conductor above the floor
  const cuPU = solid(TONE.copper, { rough: 0.36, metal: 0.45, env: 1.05 }); // …and under it (shown with the cut-away)
  const cuB = M.terre.copper.clone();
  cuB.userData = { ...M.terre.copper.userData };
  terre.userData.part.mats.add(cuPU).add(cuB);
  const loopCuP = M.loop.copper;
  const loopCuB = M.loop.copper.clone();
  loopCuB.userData = { ...M.loop.copper.userData };
  loop.userData.part.mats.add(loopCuB);

  const solidTube = (part, group, run, r, mat, radial = 10, kind = "solid") => {
    const mesh = new THREE.Mesh(tubeOn(run, r, radial, kind), mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    part.userData.part.meshes.push(mesh);
    group.add(mesh);
    return mesh;
  };

  // the ruler, in place
  const R = {};
  const mk = (pts, s0, cut = 5, stride = 3) => makeRun(bent(pts, cut, 6, stride), s0);
  R.peM = mk(PL.peM, 0, 3, 2);
  R.cord = mk(PL.cord, R.peM.s1, [0, 1.2, 2.5, 4, 6, 6, 4, 5, 6, 5, 3, 2.4, 0], 2);
  R.bridge = mk(PL.bridge, R.cord.s1, 0.5, 1);
  R.peW = mk(PL.peW, R.bridge.s1, [0, 1.5, 3, 7, 7, 6, 4, 3, 0], 3);
  R.terreA = mk(PL.terreA, R.peW.s1, 2.5, 2);
  R.link = mk(PL.link, R.terreA.s1, 0.8, 1);
  R.terreB = mk(PL.terreB, R.link.s1, 0, 3);
  R.terreC = mk(PL.terreC, R.terreB.s1, [0, 4, 4, 6, 0], 3);
  R.armA = mk(PL.armA, R.terreC.s1, 0, 8);
  R.armB = mk(PL.armB, R.terreC.s1, [0, 26, 0], 8);
  const SP = {
    plug: R.cord.s1, sock: R.bridge.s1, borne: R.peW.s1, bar: R.terreA.s1, barEnd: R.link.s1, join: R.terreC.s1,
    end: R.terreC.s1 + Math.max(R.armA.s1, R.armB.s1) - R.terreC.s1, reach: R.terreC.s1 + 320,
  };
  const peMeshP = solidTube(pe, pePlace, R.peM, 0.4, stripePlace, 10, "striped");
  solidTube(pe, pePlace, R.cord, 0.5, cordP, 12);
  const peWallMesh = solidTube(pe, pePlace, R.peW, 0.4, stripePlace, 10, "striped");
  const terreAP = solidTube(terre, terrePlace, R.terreA, 0.42, cuP, 10);
  const terreBP = solidTube(terre, terrePlace, R.terreB, 0.42, cuP, 10);
  const terreCP = solidTube(terre, terrePlace, R.terreC, 0.42, cuPU, 10);
  const armAP = solidTube(loop, loopPlace, R.armA, 0.55, loopCuP, 12);
  const armBP = solidTube(loop, loopPlace, R.armB, 0.55, loopCuP, 12);
  void peMeshP;
  // the clamp at the junction, in place
  const clampP = new THREE.Group();
  clampP.position.set(...PL.join);
  loopPlace.add(clampP);
  {
    const b = bins(loop, M.loop, clampP);
    for (const [k, list] of Object.entries(clampGeo())) b.put(k, ...list);
    b.flush();
  }
  // the light, in place
  const lightP = sheathMaterial({ period: 24, speed: 88, head: 700, front: 6 });
  const sheathP = [];
  for (const k of ["peM", "cord", "bridge", "peW", "terreA", "link", "terreB", "terreC", "armA", "armB"]) {
    const r = k === "cord" ? 0.85 : k.startsWith("arm") ? 0.95 : 0.75;
    const mesh = new THREE.Mesh(tubeOn(R[k], r, 8, "sheath"), lightP);
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    placeG.add(mesh);
    sheathP.push(mesh);
  }
  // the rings in the ground: stations across the two arms (planes square to the copper), the nearest to the junction first
  const stations = [];
  {
    const disc = new THREE.PlaneGeometry(150, 150);
    const [jx, jy, jz] = PL.join;
    const cx = LOOP.corner[0];
    const list = [
      [jx + 30, 0, 30], [jx + 95, 0, 95], [jx + 185, 0, 185], [jx + 300, 0, 300],
      [jx - 45, 0, 45], [cx, 1, (jx - cx) + 70], [cx, 1, (jx - cx) + 170],
    ];
    for (const [x, alongZ, dist] of list) {
      const mesh = new THREE.Mesh(disc, stationRingMaterial());
      if (alongZ) mesh.position.set(cx, jy, jz + (dist - (jx - cx)));
      else {
        mesh.position.set(x, jy, jz);
        mesh.rotation.y = Math.PI / 2;
      }
      mesh.material.uniforms.uY0.value = jy;
      mesh.userData.dist = dist;
      mesh.frustumCulled = false;
      mesh.renderOrder = 5;
      mesh.visible = false;
      placeG.add(mesh);
      stations.push(mesh);
    }
  }

  /* ── the conductors, on the bench ── */
  const Q = {};
  const mkB = (pts, s0, cut = 1.5, stride = 0.6) => makeRun(bent(pts, cut, 6, stride), s0);
  Q.peM = mkB(BL.peM, 0, 1.0, 0.4);
  Q.cord = mkB(BL.cord, Q.peM.s1, [0, 1.5, 2, 2, 1.5, 1.2, 0.4, 0], 0.5);
  Q.bridge = mkB(BL.bridge, Q.cord.s1, 0.3, 0.4);
  Q.peW = mkB(BL.peW, Q.bridge.s1, [0, 0.8, 1.2, 1.5, 2, 2, 1, 0], 0.5);
  Q.terreA = mkB(BL.terreA, Q.peW.s1, 1.2, 0.5);
  Q.link = mkB(BL.link, Q.terreA.s1, 0.5, 0.4);
  Q.terreB = mkB(BL.terreB, Q.link.s1, [0, 1.6, 1.6, 0], 0.5);
  const [armA0, armB0] = benchLoopArms();
  Q.armA = makeRun(armA0, Q.terreB.s1);
  Q.armB = makeRun(armB0, Q.terreB.s1);
  const SB = { plug: Q.cord.s1, sock: Q.bridge.s1, borne: Q.peW.s1, bar: Q.terreA.s1, barEnd: Q.link.s1, join: Q.terreB.s1, end: Q.terreB.s1 + Math.max(Q.armA.s1, Q.armB.s1) - Q.terreB.s1 };
  SB.reach = SB.end;
  // the cord follows the plug when it is pulled: a weight per point, 1 at the plug, 0 some cm back
  const plugWeight = (run, sEnd, reach) => {
    run.w = new Float32Array(run.n);
    for (let i = 0; i < run.n; i++) run.w[i] = smooth(clamp01(1 - (sEnd - run.S[i]) / reach));
  };
  plugWeight(R.cord, R.cord.s1, 16);
  plugWeight(Q.cord, Q.cord.s1, 9);
  R.bridge.w = new Float32Array(R.bridge.n).map((_, i) => (R.bridge.S[i] < R.bridge.S[0] + PLUG.back + 0.2 ? 1 : 0));
  Q.bridge.w = new Float32Array(Q.bridge.n).map((_, i) => (Q.bridge.S[i] < Q.bridge.S[0] + PLUG.back + 0.2 ? 1 : 0));
  for (const k of ["peM", "cord", "bridge", "peW", "terreA", "link", "terreB"]) Q[k].bench = true;

  solidTube(pe, peBench, Q.peM, 0.27, stripeBench, 10, "striped");
  solidTube(pe, peBench, Q.cord, 0.42, cordB, 12);
  const peW_B = solidTube(pe, peBench, Q.peW, 0.27, stripeBench2, 10, "striped");
  const terreAB = solidTube(terre, terreBench, Q.terreA, 0.32, cuB, 10);
  const terreBB = solidTube(terre, terreBench, Q.terreB, 0.32, cuB, 10);
  const armAB = solidTube(loop, loopBench, Q.armA, BLOOP.r, loopCuB, 12);
  const armBB = solidTube(loop, loopBench, Q.armB, BLOOP.r, loopCuB, 12);
  const clampB = new THREE.Group();
  clampB.position.set(...BLOOP.join);
  clampB.scale.setScalar(0.8);
  loopBench.add(clampB);
  const clampMat = { mid: M.loop.mid, clear: M.loop.clear };
  {
    const b = bins(loop, clampMat, clampB);
    for (const [k, list] of Object.entries(clampGeo())) b.put(k, ...list);
    b.flush();
  }
  // the stub of footing the loop goes round: glass, its edges
  const footing = new THREE.Mesh(box(2 * BLOOP.hx - 6, 7, 2 * BLOOP.hz - 2.4, 0.15), glass(BRAND.ink, { base: 0.012, rim: 0.36, power: 2.4, edge: 0.55 }));
  footing.position.set(0, 3.5, 0);
  footing.renderOrder = 8;
  footing.add(edgesOf(footing.geometry, { color: BRAND.ink, opacity: 0.42, width: 1.8 }));
  loopBench.add(footing);
  // the ghosts (chain 0 on the bench): what is missing beyond the socket, in X-ray glass
  const ghosts = [];
  const ghostOf = (mesh, parent) => {
    const g = new THREE.Mesh(mesh.geometry, ghostMat());
    g.frustumCulled = false;
    g.renderOrder = 9;
    g.position.copy(mesh.position);
    g.quaternion.copy(mesh.quaternion);
    g.visible = false;
    (parent ?? mesh.parent).add(g);
    ghosts.push(g);
    return g;
  };
  for (const m of [peW_B, terreAB, terreBB, armAB, armBB]) ghostOf(m);
  const ghostPieces = [borne, barrette];
  const ghostPieceMeshes = [];
  for (const part of ghostPieces) {
    for (const m of [...part.children]) {
      if (!m.isMesh) continue;
      const g = ghostOf(m, part);
      g.add(edgesOf(m.geometry, { color: BRAND.ink, opacity: 0.3, width: 1.8 }));
      ghostPieceMeshes.push(g);
    }
  }
  for (const m of [...clampB.children]) if (m.isMesh) ghostOf(m, clampB);
  // the light, on the bench
  const lightB = sheathMaterial({ period: 6, speed: 21, head: 9, front: 1.2 });
  const sheathB = [];
  for (const k of ["peM", "cord", "bridge", "peW", "terreA", "link", "terreB", "armA", "armB"]) {
    const r = k === "cord" ? 0.7 : 0.52;
    const mesh = new THREE.Mesh(tubeOn(Q[k], r, 8, "sheath"), lightB);
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    (k.startsWith("arm") ? loopBench : benchG).add(mesh);
    sheathB.push(mesh);
  }
  const ringsB = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), benchRingMaterial(BLOOP.hx, BLOOP.hz, BLOOP.rc));
  ringsB.rotation.x = -Math.PI / 2;
  ringsB.position.y = 0.2;
  ringsB.renderOrder = 5;
  ringsB.frustumCulled = false;
  ringsB.visible = false;
  loopBench.add(ringsB);

  /* ── heads of light: the run (two, along the two arms) and the leak's front ── */
  const ball = new THREE.SphereGeometry(1, 32, 20);
  const heads = [0, 1, 2, 3].map(() => {
    const m = new THREE.Mesh(ball, haloMaterial(0.72));
    m.renderOrder = 6;
    m.frustumCulled = false;
    m.visible = false;
    root.add(m);
    return m;
  });

  /* ── anchors ── */
  const A = {
    stub: anchor(stub, 0, 0, BL.stubFace - BENCH.stub.at[2] + 0.2),
    cosse: anchor(cosse, 0, 0, 0),
    pe: new THREE.Object3D(),
    plug: anchor(plug, 0, 0, PLUG.back * 0.5),
    socket: anchor(socket, 0, 0, SOCK.face),
    pin: anchor(socket, 0, SOCK.pinY, SOCK.floor + 1.4),
    diff: anchor(tableau, DIFF.pivot[0], DIFF.pivot[1], DIFF.pivot[2] + 0.6),
    borne: anchor(borne, 0, 0, 0.8),
    barrette: anchor(barrette, 0, 0, 1.5),
    terre: new THREE.Object3D(),
    loop: new THREE.Object3D(),
    centre: new THREE.Object3D(),
  };
  root.add(A.pe, A.terre, A.loop, A.centre);

  /* ── what the acts switch, and the lit parts ── */
  const emit = (mats, k, hue = VEILLE) => {
    for (const m of mats) if (m.emissive) m.emissive.copy(hue).multiplyScalar(k);
  };
  const litMats = {
    cosse: Object.values(M.cosse),
    prise: [...Object.values(M.plug), ...Object.values(M.socket)],
    borne: Object.values(M.borne),
    terre: [...Object.values(M.barrette), cuP, cuPU, cuB],
    loop: [loopCuP, loopCuB, M.loop.mid],
  };
  const stubMats = Object.values(M.stub);
  const fadeMats = (mats, a) => {
    for (const m of mats) if (m.userData.base !== undefined) fadeMat(m, a);
  };
  const lineMatsOf = (part) => [...part.userData.part.mats].filter((m) => m.isLineMaterial);
  const borneLines = lineMatsOf(borne);
  const barLines = lineMatsOf(barrette);
  const clampMats = [M.loop.mid, M.loop.clear, ...lineMatsOf(loop)];

  /* ── the explosion: knot offsets, written in place ── */
  const KY = Float32Array.from(KNOTS.map((k) => k.y));
  const KDY = new Float32Array(KNOTS.length);
  const KDZ = new Float32Array(KNOTS.length);
  const KE = new Float32Array(KNOTS.length);
  const KU = new Float32Array(KNOTS.length);
  const setKnots = (ex) => {
    for (let k = 0; k < KNOTS.length; k++) {
      const kn = KNOTS[k];
      const u = kn.delay < 0 ? 1 : clamp01((ex - kn.delay) / SPAN);
      const e = kn.delay < 0 ? 1 : settle(u);
      KU[k] = u;
      KE[k] = e;
      KDY[k] = (GATHER.y - kn.y) * (1 - e);
      KDZ[k] = (GATHER.z - kn.z) * (1 - e);
    }
  };
  const warp = (y, out) => {
    // out[0] dy, out[1] dz
    if (y >= KY[0]) return ((out[0] = KDY[0]), (out[1] = KDZ[0]), out);
    const L = KY.length - 1;
    if (y <= KY[L]) return ((out[0] = KDY[L]), (out[1] = KDZ[L]), out);
    for (let k = 1; k <= L; k++) {
      if (y >= KY[k]) {
        const u = (y - KY[k]) / (KY[k - 1] - KY[k]);
        out[0] = KDY[k] + (KDY[k - 1] - KDY[k]) * u;
        out[1] = KDZ[k] + (KDZ[k - 1] - KDZ[k]) * u;
        return out;
      }
    }
    return out;
  };
  const wv = [0, 0];
  const deform = (run, ex, pz) => {
    const key = ex * 4096 + pz;
    if (run.key === key) return;
    run.key = key;
    const { P, C, n, w } = run;
    for (let i = 0; i < n; i++) {
      let dy = 0;
      let dz = 0;
      if (run.bench) {
        warp(P[i * 3 + 1], wv);
        dy = wv[0];
        dz = wv[1];
      }
      if (w) dz += pz * w[i];
      C[i * 3] = P[i * 3];
      C[i * 3 + 1] = P[i * 3 + 1] + dy;
      C[i * 3 + 2] = P[i * 3 + 2] + dz;
    }
    for (const t of run.tubes) writeTube(run, t);
  };
  const knotOf = (y) => KNOTS.findIndex((k) => k.y === y);
  const kSock = knotOf(47);
  const kDiff = knotOf(32);
  const kBorne = knotOf(26);
  const kBar = knotOf(15);
  const kLoop = knotOf(2);
  const place = (part, p, k, dzExtra = 0) => {
    if (k < 0) return part.position.set(p[0], p[1], p[2] + dzExtra);
    const e = KE[k];
    part.position.set(p[0], p[1] + (GATHER.y - p[1]) * (1 - e), p[2] + (GATHER.z - p[2]) * (1 - e) + dzExtra);
    part.visible = KU[k] > 0.0005;
  };

  /* ── the paces: run and leak go from the lug (0) to the loop (1), piece by piece ── */
  const PACE = [0, 0.24, 0.28, 0.52, 0.64, 0.8, 1];
  SP.at = [0, SP.plug, SP.sock, SP.borne, SP.barEnd, SP.join, SP.reach];
  SB.at = [0, SB.plug, SB.sock, SB.borne, SB.barEnd, SB.join, SB.reach];
  const paceS = (u, S) => {
    const at = S.at;
    if (u <= 0) return 0;
    for (let i = 1; i < PACE.length; i++) if (u <= PACE[i]) return at[i - 1] + ((at[i] - at[i - 1]) * (u - PACE[i - 1])) / (PACE[i] - PACE[i - 1]);
    return S.reach;
  };
  // the chain growing in place, from the socket to the loop: the wall's PE, then the terminal, the earthing conductor, the loop
  const GK = [0, 0.42, 0.5, 0.74, 1];
  const GAT = [SP.sock, SP.borne, SP.borne + 8, SP.join, SP.end];
  const growS = (c) => {
    const k = GK;
    const at = GAT;
    if (c <= 0) return SP.sock;
    for (let i = 1; i < k.length; i++) if (c <= k[i]) return at[i - 1] + ((at[i] - at[i - 1]) * (c - k[i - 1])) / (k[i] - k[i - 1]);
    return 1e9;
  };

  /* ── the camera sweeping along a conductor melts its dashes (measured between two consecutive instants) ── */
  let now = 0;
  const guard = (mesh, U, period) => {
    const last = { t: NaN, p: V(), d: V() };
    const p = V();
    const d = V();
    const ref = V();
    mesh.onBeforeRender = (renderer, scene, camera) => {
      if (!camera.isPerspectiveCamera) return;
      camera.getWorldPosition(p);
      camera.getWorldDirection(d);
      const dt = now - last.t;
      let melt = 0;
      if (dt > 1e-4 && dt < 0.05 && U.uLeakOn.value > 0.004) {
        A.centre.getWorldPosition(ref);
        const dist = Math.max(40, p.distanceTo(ref));
        const w = (Math.acos(Math.min(1, Math.max(-1, d.dot(last.d)))) + p.distanceTo(last.p) / dist) / dt; // rad/s
        melt = smooth(ramp((w * dist) / (30 * period), 0.12, 0.32));
      }
      U.uDash.value = 1 - melt;
      last.t = now;
      last.p.copy(p);
      last.d.copy(d);
    };
  };
  guard(sheathP[0], lightP.uniforms, 24);
  guard(sheathB[0], lightB.uniforms, 6);

  const tmp = V();
  const hue = new THREE.Color();
  const breath = (t) => 1 + 0.04 * Math.sin(t * 1.3);
  let lastBench = -1;

  const RUNS_B = [Q.peM, Q.cord, Q.bridge, Q.peW, Q.terreA, Q.link, Q.terreB];
  const RUNS_P = [R.peM, R.cord, R.bridge, R.peW, R.terreA, R.link, R.terreC];
  const ARMS_B = [Q.armA, Q.armB];
  const ARMS_P = [R.armA, R.armB];
  const setH = (m, run, local, onB, k, rad, minPx, under) => {
    along(run, sNow, tmp);
    if (local) tmp.applyMatrix4(loopBench.matrix);
    const u = !onB && tmp.y < -0.5 ? under : 1;
    if (u < 0.004) return;
    m.visible = true;
    m.position.copy(tmp);
    m.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(k * u);
    m.material.uniforms.uRadius.value = rad;
    m.material.uniforms.uMinPx.value = minPx;
  };
  let sNow = 0;
  const borneFade = [...Object.values(M.borne), ...borneLines];
  const barFade = [...Object.values(M.barrette), ...barLines];
  const benchTubes = [peW_B, terreAB, terreBB, armAB, armBB];
  const tableauMats = [M.tableau.white];
  const ring = { u: 0, k: 0 };
  // the rings: periodic in time (the current keeps flowing), each born at nothing — no pop, no blink
  const ringAt = (time, j, period) => {
    const u = (((time / period + j * 0.5) % 1) + 1) % 1;
    ring.u = u;
    ring.k = smooth(ramp(u, 0, 0.12)) * Math.pow(1 - u, 1.3);
    return ring;
  };

  /** Put the heads of light (run: heads 0, 1; leak: 2, 3) where they are along the ruler. */
  const putHead = (h, h2, s, R0, S, onB, k, rad, minPx, under) => {
    h.visible = h2.visible = false;
    if (k < 0.004) return;
    const runs = onB ? RUNS_B : RUNS_P;
    const arms = onB ? ARMS_B : ARMS_P;
    sNow = s;
    if (s >= S.join) {
      loopBench.updateMatrix();
      setH(h, arms[0], onB, onB, k, rad, minPx, under);
      setH(h2, arms[1], onB, onB, k, rad, minPx, under);
      return;
    }
    let run = runs[runs.length - 1];
    for (const r of runs) {
      if (s <= r.s1) {
        run = r;
        break;
      }
    }
    if (!onB && run === R.terreC && s < R.terreB.s1) run = R.terreB;
    setH(h, run, false, onB, k, rad, minPx, under);
  };

  return {
    root, parts, A,
    /** Every frame, sixteen times a frame: P is plain numbers (docs/030-decors.md). No allocation here. */
    update(P, time) {
      now = time;
      const onB = P.bench > 0.5;
      if (onB !== lastBench) {
        lastBench = onB;
        placeG.visible = pePlace.visible = terrePlace.visible = loopPlace.visible = !onB;
        benchG.visible = peBench.visible = terreBench.visible = loopBench.visible = onB;
        stub.visible = onB;
        wallPlate.visible = onB;
      }
      const ex = onB ? clamp01(P.explode) : 1;
      const whole = P.chain > 0.5;
      const plugZ = (1 - smooth(clamp01(P.plug))) * PULLED;
      const pinOn = P.pin > 0.5;
      pinG.visible = pinOn;
      const t = breath(time);

      /* the pieces and the conductors, where this layout has them */
      if (onB) {
        setKnots(ex);
        stub.position.set(...BENCH.stub.at);
        place(cosse, BL.cosse, -1);
        place(socket, BL.socket, kSock);
        place(plug, BL.plug, kSock, plugZ);
        place(tableau, BL.diff, kDiff);
        place(borne, BL.borne, kBorne);
        place(barrette, BL.barrette, kBar);
        const e = KE[kLoop];
        loopBench.position.set(BLOOP.at[0] - 4 * (1 - e), BLOOP.at[1] + (GATHER.y - 2) * (1 - e), BLOOP.at[2] + (GATHER.z - 1) * (1 - e));
        loopBench.scale.setScalar(0.6 + 0.4 * e);
        loopBench.visible = KU[kLoop] > 0.0005;
        for (const k in Q) deform(Q[k], ex, plugZ);
      } else {
        place(cosse, PL.cosse, -1);
        place(socket, PL.socket, -1);
        place(plug, PL.plug, -1, plugZ);
        place(tableau, PL.diff, -1);
        place(borne, PL.borne, -1);
        place(barrette, PL.barrette, -1);
        socket.visible = plug.visible = tableau.visible = cosse.visible = true;
        deform(R.cord, 1, plugZ);
        deform(R.bridge, 1, plugZ);
      }

      /* the chain: in place it grows from the socket; on the bench, what is beyond the socket turns ghost */
      const S = onB ? SB : SP;
      const L = onB ? lightB.uniforms : lightP.uniforms;
      let grow = 1e9;
      if (!onB) {
        grow = growS(clamp01(P.chain));
        peWallMesh.visible = grow > SP.sock + 0.5;
        drawUpTo(R.peW, peWallMesh.geometry, 10, grow);
        drawUpTo(R.terreA, terreAP.geometry, 10, grow);
        drawUpTo(R.terreB, terreBP.geometry, 10, grow);
        drawUpTo(R.terreC, terreCP.geometry, 10, grow);
        drawUpTo(R.armA, armAP.geometry, 12, grow);
        drawUpTo(R.armB, armBP.geometry, 12, grow);
        const bOn = smooth(ramp(grow, SP.borne - 1, SP.borne + 8));
        const lOn = smooth(ramp(grow, SP.bar - 2, SP.bar + 10));
        const jOn = smooth(ramp(grow, SP.join - 4, SP.join + 6));
        borne.visible = bOn > 0.004;
        barrette.visible = lOn > 0.004;
        fadeMats(borneFade, bOn);
        fadeMats(barFade, lOn);
        for (const gm of ghosts) gm.visible = false;
        for (const part of ghostPieces) for (const m of part.children) if (m.isMesh && m.material.isMeshStandardMaterial) m.visible = true;
        const under = clamp01(P.under);
        fadeMat(cuPU, under);
        fadeMat(loopCuP, under);
        fadeMats(clampMats, under * jOn);
        terreCP.visible = under > 0.004;
        loopPlace.visible = under > 0.004;
        clampP.visible = jOn > 0.004;
        L.uUnder.value = under;
      } else {
        const c = smooth(clamp01(P.chain));
        const g = 1 - c;
        fadeMat(stripeBench2, c);
        fadeMat(cuB, c);
        fadeMat(loopCuB, c);
        fadeMats(borneFade, c);
        fadeMats(barFade, c);
        fadeMats(clampMats, c);
        for (const m of benchTubes) m.visible = c > 0.004;
        for (const part of ghostPieces) for (const m of part.children) if (m.isMesh && m.material.isMeshStandardMaterial) m.visible = c > 0.004;
        for (const m of clampB.children) if (m.isMesh && m.material.isMeshStandardMaterial) m.visible = c > 0.004;
        for (const gm of ghosts) {
          gm.visible = g > 0.004;
          gm.material.uniforms.uAmount.value = 0.85 * g;
        }
        borne.visible = barrette.visible = true;
        if (KU[kBorne] < 0.0005) borne.visible = false;
        if (KU[kBar] < 0.0005) barrette.visible = false;
        L.uUnder.value = 1;
      }
      L.uGrow.value = grow;
      L.uTime.value = time;
      L.uJoin.value = S.join;
      L.uFar.value = onB ? 1e6 : 420;

      /* run: a head from the lug; it stops at the plug (behind the pin if there is one) when the chain is not whole */
      const run = clamp01(P.run);
      const stopAt = whole ? S.reach : pinOn ? S.sock : S.plug;
      let sRun;
      let headK;
      if (whole) {
        sRun = paceS(run, S);
        headK = run > 0 ? 1.6 * (1 - smooth(ramp(run, 0.9, 1))) : 0;
      } else {
        sRun = stopAt * Math.min(1, run / 0.8);
        headK = run > 0 ? 1.6 * (1 - smooth(ramp(run, 0.8, 1))) : 0;
      }
      L.uRunS.value = sRun;
      L.uRunOn.value = headK * 0.6;
      L.uTrail.value = run > 0 ? 0.55 * smooth(ramp(run, 0, 0.04)) * (whole ? 1 : 0.6 + 0.4 * (1 - smooth(ramp(run, 0.8, 1)))) : 0;
      L.uTrailMax.value = stopAt + 0.01;
      putHead(heads[0], heads[1], sRun, null, S, onB, headK, onB ? 1.5 : 6, 11, clamp01(P.under));

      /* leak: the fault current by the earth, only where the chain is whole */
      const leak = whole ? clamp01(P.leak) : 0;
      const sLeak = paceS(leak, S);
      const leakOn = leak > 0 ? smooth(ramp(leak, 0, 0.05)) : 0;
      L.uLeakS.value = sLeak;
      L.uLeakOn.value = leakOn;
      putHead(heads[2], heads[3], sLeak, null, S, onB, leakOn * (leak < 1 ? 1.25 : 0.7), onB ? 1.3 : 5, 9, clamp01(P.under));
      const taken = smooth(ramp(leak, 0.78, 0.9));
      // the rings: periodic in time (the current keeps flowing), each born at nothing — no pop, no blink
      if (onB) {
        ringsB.visible = taken > 0.004;
        const v = ringsB.material.uniforms.uRing.value;
        for (let j = 0; j < 2; j++) {
          const { u, k } = ringAt(time, j, 1.6);
          v.setComponent(j * 2, 0.8 + 16 * (1 - (1 - u) * (1 - u)));
          v.setComponent(j * 2 + 1, 1.0 * k * taken);
        }
      } else {
        const amount = taken * clamp01(P.under);
        for (const m of stations) {
          m.visible = amount > 0.004;
          if (!m.visible) continue;
          const v = m.material.uniforms.uRing.value;
          const fade = amount * (0.45 + 0.55 * Math.exp(-m.userData.dist / 260));
          for (let j = 0; j < 2; j++) {
            const { u, k } = ringAt(time - m.userData.dist / 500, j, 1.8);
            v.setComponent(j * 2, 3 + 48 * (1 - (1 - u) * (1 - u)));
            v.setComponent(j * 2 + 1, 0.8 * k * fade);
          }
        }
      }

      /* the green-and-yellow conductor: bands of veille and ink, lit by `pe` (and by what the voice names) */
      const pv = clamp01(Math.max(P.pe, 0.6 * leakOn));
      const lp = clamp01(P.litPe);
      for (const m of [stripePlace, stripeBench, stripeBench2]) {
        const U = m.userData.stripe;
        U.uA.value.setHex(0x3a4046).lerp(hue.copy(VEILLE).multiplyScalar(0.55), pv);
        U.uB.value.setHex(0x8a8984).lerp(INK, pv);
        U.uGlowA.value.copy(VEILLE).multiplyScalar(0.95 * Math.pow(pv, 1.15) + 0.45 * lp);
        U.uGlowB.value.copy(INK).multiplyScalar(0.05 * pv);
      }

      /* the parts the voice names, and those the run has passed */
      const passed = (s) => (run > 0 && sRun >= s && s <= stopAt ? 0.45 * L.uTrail.value : 0);
      emit(litMats.cosse, 0.42 * Math.max(clamp01(P.litCosse), passed(0.01)));
      emit(litMats.prise, 0.24 * Math.max(clamp01(P.litPrise), passed(S.plug)));
      emit(litMats.borne, 0.34 * Math.max(clamp01(P.litBorne), passed(S.borne)));
      emit(litMats.terre, 0.34 * Math.max(clamp01(P.litTerre), passed(S.barEnd)));
      emit(litMats.loop, 0.36 * Math.max(clamp01(P.litBoucle), passed(S.join)));

      /* the differential: it sees (veille), it trips (the handle falls) */
      const ddr = clamp01(P.ddr);
      handle.rotation.x = 0.42 + (Math.PI - 0.84) * smooth(clamp01(P.trip));
      winMat.color.copy(VEILLE).multiplyScalar(0.12 + 1.5 * ddr * t);
      emit(tableauMats, 0.16 * ddr);
      diffHalo.visible = ddr > 0.01;
      diffHalo.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(0.9 * ddr * t);
      diffHalo.material.uniforms.uRadius.value = 1.2;
      diffHalo.material.uniforms.uMinPx.value = 16;

      /* on the bench, the stub of casing carries the fault: live tints the sheet, fault lights its corner */
      if (onB) {
        const live = clamp01(P.live);
        const fault = clamp01(P.fault);
        emit(stubMats, 0.035 * live, SIGNAL);
        for (const l of stubLines) l.mat.color.copy(l.base).lerp(SIGNAL, 0.85 * live);
        stubFault.visible = fault > 0.01;
        stubFault.material.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(2.1 * fault * t).lerp(hue.setRGB(2.2, 1.9, 1.7), 0.18 * fault);
        stubFault.material.uniforms.uRadius.value = 0.9;
        stubFault.material.uniforms.uMinPx.value = 13;
      }

      /* the anchors that are not on a piece */
      const runs = onB ? Q : R;
      along(runs.cord, (runs.cord.s0 + runs.cord.s1) / 2, A.pe.position);
      if (onB) along(Q.terreB, (Q.terreB.s0 + Q.terreB.s1) / 2, A.terre.position);
      else along(R.terreB, (R.terreB.s0 + R.terreB.s1) / 2, A.terre.position);
      if (onB) {
        loopBench.updateMatrix();
        A.loop.position.set(...BLOOP.join).applyMatrix4(loopBench.matrix);
        A.centre.position.set(SYSTEM.centre[0], SYSTEM.centre[1], SYSTEM.centre[2]);
      } else {
        A.loop.position.set(...PL.join);
        A.centre.position.set(PL.plug[0], PL.plug[1], PL.plug[2]);
      }
    },
  };
}
