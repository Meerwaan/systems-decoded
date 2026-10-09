// DOSSIER 012 — Gazinière : the gas hob seen like an X-ray, the saucepan that boils over on it — and you.
//
// The hob is let into the worktop of the kitchen of 009 (world.js builds that kitchen without its glass hob):
// its top, its shallow body, the three OTHER burners and their knobs, the cast-iron pan supports, and under the
// top — seen through the glass — the gas rail along the front with three ghost taps: the hero tap is one of four.
// The place of the hero burner, of its knob and of its tap is left free: model.js brings them, solid.
// On the hero burner, a saucepan of glass. Inside it, SOLID, the only things that matter: the water — and the
// foam. The foam is ONE surface drawn by its vertex shader (no simulation: `spill`, `boil` and the time): a dome
// that swells over the rim, a roll that hangs all round it, runs that go down the side on the camera's side
// (SPILL.dir), fall onto the burner and spread on the top round the crown. Steam: slow wisps, never dots.
// And you, of glass (kit/lib/figure.js): at the hob, the fingers of one hand on the hero knob — or in the
// doorway of the right wall, your hand on the light switch (the only solid thing of that wall).
//
//   buildHob() → { group, A, fx, you, update(p, time) }      p = { shell, pot, boil, spill, you, press, flame }
//   A: pot, rim, foam, knob, youHead, youHand, switch, door
//
// Shell orders (see `asShell`): you 10 (the system's own glass is 10 too), the saucepan 18, the hob 22 — the
// kitchen is 24: what is inside is drawn first.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glass, asShell, box, cyl, lathe, placed, anchor, lineMat, mergeGeometries } from "@kit/build3d.js";
import { HOB, GRATE, BURNERS, KNOBS, SYSTEM, PARTS, POT, SPILL, YOU, DOOR, SWITCH, CEILING } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
/** A value along [x, value] keys, straight from one to the next. */
const along = (keys, x) => {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (x < keys[i][0]) return mix(keys[i - 1][1], keys[i][1], (x - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
  return keys[keys.length - 1][1];
};
const glsl = (x) => Number(x).toFixed(5);

const ORDER = { you: 10, pot: 18, hob: 22 };
const LINE = { strong: { w: 2.2, a: 0.72 }, fine: { w: 1.8, a: 0.42 }, faint: { w: 1.8, a: 0.2 } };
const TOP = HOB.top;
const [HX, , HZ] = SYSTEM.home;
const KNOB_Y = 0.6; // a knob floats this far above the top (as the hero's does, in model.js): it goes down by KNOBS.travel

/* ── the saucepan, in ITS OWN frame: its axis, y = 0 its bottom (the top of the pan supports) ── */
const R = POT.r;
const HR = POT.h; // the rim
const WALL = 0.25;
const RIN = R - WALL;
const CB = 0.8; // the round of its bottom corner
const YW = POT.water; // the water's level
const YT = TOP - POT.y0; // the hob's top face, seen from the saucepan
/** Where it pours: an angle round the saucepan's axis, from +x toward +z. The camera's side. */
const TH0 = Math.atan2(SPILL.dir[1], SPILL.dir[0]);
// The way down, as a path in the plane (radius, height), by arc length from the top of the rim: over the lip (to A1),
// down the side (to A2), round the bottom corner (to A3), then a fall toward the burner, leaning in by PSI (to A4).
const PSI = 15 * DEG;
const A1 = (Math.PI / 2) * WALL;
const A2 = A1 + HR - WALL - CB;
const A3 = A2 + PSI * CB;
const A4 = A3 + (CB * (1 - Math.sin(PSI)) - YT - 0.12) / Math.cos(PSI);
// The runs: where (angle), how wide (half, cm), how thick, and how far each has gone for a given `spill` (cm along
// the path). Two fall onto the top, one on each side of the thermocouple's tip — seen from the camera's side, the tip
// and the crown stay in sight between them; the third, in the middle, stops on the side of the saucepan.
const RUNS = [
  { th: TH0 - 17 * DEG, a: 1.35, h: 1.15, keys: [[0.3, 0], [0.6, 8.6], [0.74, A3], [0.84, A4]] },
  { th: TH0 + 19 * DEG, a: 1.25, h: 1.05, keys: [[0.34, 0], [0.6, 6.0], [0.8, A3], [0.92, A4]] },
  { th: TH0 + 0.5 * DEG, a: 1.1, h: 0.9, keys: [[0.4, 0], [0.6, 3.6], [1, 6.2]] },
];
// the foam, for a given `spill`: how thick it lies on the water · the dome above its own edge · the roll over the rim, how thick and how far it hangs
const LEVEL = [[0, 0], [0.12, 1.3], [0.22, HR - YW]];
const DOME = [[0, 0.1], [0.12, 0.8], [0.22, 1.6], [0.3, 3.4], [0.6, 4.6], [1, 4.3]];
const ROLL = [[0.2, 0], [0.3, 1.05], [0.6, 1.35], [1, 1.3]];
const HANG = [[0.2, 0], [0.3, 1.6], [0.6, 2.5], [1, 2.7]];
// the pool on the top: its middle line (a radius from the burner's axis), its half-width, how thick, how far round each
// landing it spreads (radians), and where it stops inward: against the rim of the hero burner's cup (model.js: 5.1)
// …and where a run lands (a radius): the pool rises there in a mound, the run stands in it
const POOL = { rc: 8.2, half: 2.4, thick: 0.5, span: 23 * DEG, inner: 5.25, land: 9.0 };
// a run narrows as it leaves the saucepan (a stream, not a pillar): by NECK.k of its width, between these two points of the path
const NECK = { k: 0.36, from: A2 - 2.2, to: A3 + 1.2 };

/* ───────────────────────────────────────────────────────────── the liquid
   A surface whose vertices are not positions but two parameters: the vertex shader puts each one where the foam is at
   that instant, and finds its normal by looking at its two neighbours. A standard, lit material around it. */

const LIQUID = /* glsl */ `
  uniform float uTime;
  uniform vec4 uFoam;   // x: the height of the foam's edge · y: its dome above that · z: how thick the roll over the rim is · w: how far the roll hangs (cm along the path)
  uniform vec3 uDrip;   // how far each run has gone (cm along the path)
  uniform vec2 uHeave;  // x: the slow billows · y: the domes the big bubbles push up
  uniform vec2 uPool;   // the two pools on the top (0–1)
  uniform vec4 uBub[8]; // the big bubbles: x, z, radius of their dome, its height
  const float kR = ${glsl(R)}; const float kRin = ${glsl(RIN)}; const float kH = ${glsl(HR)}; const float kCR = ${glsl(WALL)}; const float kCB = ${glsl(CB)};
  const float kYT = ${glsl(YT)}; const float kA1 = ${glsl(A1)}; const float kA2 = ${glsl(A2)}; const float kA3 = ${glsl(A3)};
  const float kSinP = ${glsl(Math.sin(PSI))}; const float kCosP = ${glsl(Math.cos(PSI))}; const float kTH0 = ${glsl(TH0)};
  const vec3 RTH = vec3(${RUNS.map((r) => glsl(r.th)).join(", ")});
  const vec3 RAW = vec3(${RUNS.map((r) => glsl(r.a)).join(", ")});
  const vec3 RTK = vec3(${RUNS.map((r) => glsl(r.h)).join(", ")});
  const float kNeck = ${glsl(NECK.k)}; const float kTA = ${glsl(NECK.from)}; const float kTB = ${glsl(NECK.to)};
  const float kPrc = ${glsl(POOL.rc)}; const float kPhalf = ${glsl(POOL.half)}; const float kPthick = ${glsl(POOL.thick)}; const float kPspan = ${glsl(POOL.span)}; const float kPin = ${glsl(POOL.inner)}; const float kLand = ${glsl(POOL.land)};

  float wrapA(float a) { return a - 6.2831853 * floor(a / 6.2831853 + 0.5); }

  // the way down: a point of the saucepan's skin and the way out of it, at t cm from the top of the rim
  void guide(float t, out vec2 p, out vec2 n) {
    if (t < kA1) { float a = t / kCR; n = vec2(sin(a), cos(a)); p = vec2(kR - kCR, kH - kCR) + kCR * n; }
    else if (t < kA2) { n = vec2(1.0, 0.0); p = vec2(kR, kH - kCR - (t - kA1)); }
    else if (t < kA3) { float a = (t - kA2) / kCB; n = vec2(cos(a), -sin(a)); p = vec2(kR - kCB, kCB) + kCB * n; }
    else { n = vec2(kCosP, -kSinP); p = vec2(kR - kCB, kCB) + kCB * n + vec2(-kSinP, -kCosP) * (t - kA3); }
  }
  float lump(float th) { return 0.5 + 0.3 * sin(3.0 * th + 0.7 + 0.21 * uTime) + 0.2 * sin(7.0 * th - 1.3 - 0.17 * uTime); }
  // the roll over the rim at this angle: x how thick, y how far down it hangs. It leans to the side it pours
  vec2 rollAt(float th) {
    float lean = 0.72 + 0.28 * (0.5 + 0.5 * cos(th - kTH0));
    return vec2(uFoam.z * lean * (0.76 + 0.48 * lump(th)), uFoam.w * lean * (0.6 + 0.8 * lump(th + 1.9)));
  }
  // half the width of a run, t cm down
  float runHalf(float a0, float t) { return a0 * (1.0 - kNeck * clamp((t - kTA) / (kTB - kTA), 0.0, 1.0)); }
  // how far down the foam goes at this angle: the roll, or a run (a finger with a round end)
  float reach(float th) {
    float l = rollAt(th).y;
    for (int i = 0; i < 3; i++) {
      float x = abs(kR * wrapA(th - RTH[i]));
      float a0 = RAW[i];
      if (x < a0) {
        float at = runHalf(a0, uDrip[i]); // at its end
        l = max(l, x < at ? uDrip[i] - at + sqrt(max(at * at - x * x, 0.0)) : min(uDrip[i] - at, kTA + (kTB - kTA) * (1.0 - x / a0) / kNeck));
      }
    }
    return l;
  }
  // how thick it lies on the skin, at this angle, t cm down
  float thick(float th, float t) {
    vec2 r = rollAt(th);
    float e = clamp((t / max(r.y, 1e-3) - 0.3) / 0.7, 0.0, 1.0);
    float w = r.x * sqrt(max(1.0 - e * e, 0.0));
    float d = 0.0;
    for (int i = 0; i < 3; i++) {
      float x = kR * wrapA(th - RTH[i]);
      float at = runHalf(RAW[i], uDrip[i]);
      float a = runHalf(RAW[i], t);
      float c = uDrip[i] - at;
      float dt = max(t - c, 0.0);
      float q = 1.0 - (x * x + dt * dt) / (a * a);
      float head = 1.0 + 0.3 * exp(-pow2((t - c) / (1.6 * at))); // a run is heavier at its end
      float flow = 1.0 + 0.1 * sin(1.3 * t - 2.6 * uTime + 2.1 * float(i)); // it runs: slow swells travel down it
      d = max(d, RTK[i] * clamp(uDrip[i] / 2.5, 0.0, 1.0) * head * flow * sqrt(max(q, 0.0)));
    }
    float hi = max(w, d);
    float lo = min(w, d);
    float k = max(0.5 - (hi - lo), 0.0) / 0.5; // where a run leaves the roll, a fillet — only where both are there
    return hi + k * k * 0.125 * clamp(lo / 0.2, 0.0, 1.0);
  }
  // what hangs outside: v 0 where it turns down the side → 1 where it ends
  vec3 curtain(float th, float v) {
    float l = reach(th);
    float t = mix(min(kA1, l), l, v);
    vec2 p; vec2 n;
    guide(t, p, n);
    vec2 q = p + n * thick(th, t);
    q.y = max(q.y + uFoam.x - kH, kYT + 0.06); // below the rim, all of it sits at the foam's own level; at the bottom, it lands on the top
    return vec3(q.x * cos(th), q.y, q.x * sin(th));
  }
  float heave(vec2 xz) {
    float h = uHeave.x * (0.5 * sin(0.55 * xz.x + 0.9 + 0.62 * uTime) * cos(0.48 * xz.y - 0.4 + 0.47 * uTime) + 0.3 * sin(0.9 * xz.x - 0.6 * xz.y + 1.7 - 0.74 * uTime) + 0.2 * cos(1.25 * xz.y + 0.7 * xz.x - 0.58 * uTime + 2.1));
    for (int i = 0; i < 8; i++) {
      vec2 d = xz - uBub[i].xy;
      h += uHeave.y * uBub[i].w * exp(-dot(d, d) / max(uBub[i].z * uBub[i].z, 1e-3));
    }
    return h;
  }
  // what stands over the saucepan's mouth: s 0 on the axis → 1 on its edge, where the curtain starts. ONE convex mass with
  // the roll (a soufflé, not a hat with a brim): a full dome that comes down plumb onto what hangs outside
  vec3 cap(float th, float s) {
    vec3 e = curtain(th, 0.0);
    float a = clamp(s, 0.0, 1.0) * 1.5707963;
    float k = cos(a);
    vec2 xz = length(e.xz) * sin(a) * vec2(cos(th), sin(th));
    float y = e.y + max(uFoam.x + uFoam.y - e.y, 0.02) * pow(max(k, 0.0), 0.85) + heave(xz) * min(1.0, 2.5 * k);
    return vec3(xz.x, y, xz.y);
  }
  vec3 foamAt(float th, float s) { return s <= 1.0 ? cap(th, s) : curtain(th, s - 1.0); }

  // the pool on the top: a kidney round the burner, a across it (0 inner edge → 1 outer edge)
  vec3 poolAt(float th, float a) {
    float m = 0.0;
    float lo = 1e3;
    vec2 LTH = RTH.xy;
    vec2 grown = vec2(0.0);
    for (int i = 0; i < 2; i++) {
      float k = clamp(uPool[i], 0.0, 1.0);
      float x = wrapA(th - LTH[i]) / (kPspan * (0.3 + 0.7 * k));
      float h = kPhalf * pow(k, 0.6) * sqrt(max(1.0 - x * x, 0.0));
      grown[i] = pow(k, 0.3);
      lo = min(lo, h);
      m = max(m, h);
    }
    float f = max(0.8 - (m - lo), 0.0) / 0.8;
    float hw = m + f * f * 0.2 * clamp(lo / 0.4, 0.0, 1.0);
    float lob = 1.0 + 0.14 * sin(5.0 * th + 0.8) + 0.08 * sin(11.0 * th + 2.0);
    float rc = kPrc + 0.45 * sin(2.3 * th + 1.0);
    float e = 2.0 * a - 1.0;
    float rho = rc + (e < 0.0 ? e * min(hw * lob, max(rc - kPin, 0.0)) : e * hw * lob * 1.08);
    vec2 xz = rho * vec2(cos(th), sin(th));
    float deep = kPthick * sqrt(clamp(hw / 1.4, 0.0, 1.0));
    for (int i = 0; i < 2; i++) {
      vec2 d = xz - kLand * vec2(cos(LTH[i]), sin(LTH[i]));
      deep += 0.95 * grown[i] * exp(-dot(d, d) / 2.4); // the mound where a run lands
    }
    float y = kYT + 0.03 + deep * pow(clamp(1.0 - e * e, 0.0, 1.0), 0.45);
    return vec3(xz.x, y, xz.y);
  }
`;

/** Turn a lit material into a liquid: `surf` (GLSL) places a vertex from its two parameters. */
function liquid(mat, key, surf, uniforms) {
  mat.side = THREE.DoubleSide;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${LIQUID}\n  vec3 surf(float a, float b) { return ${surf}(a, b); }`)
      .replace(
        "#include <beginnormal_vertex>",
        /* glsl */ `vec3 P0 = surf(position.x, position.y);
        vec3 dS = surf(position.x, position.y + 0.01) - P0;
        vec3 dT = surf(position.x + 0.004, position.y) - P0;
        vec3 Nq = cross(dT, dS);
        float nq = dot(Nq, Nq);
        vec3 objectNormal = nq > 1e-14 ? Nq * inversesqrt(nq) : vec3(0.0, 1.0, 0.0); // (never normalise nothing: the axis, a fold)`,
      )
      .replace("#include <begin_vertex>", "vec3 transformed = P0;");
    // a sheet, not a closed skin: whichever side the eye is on is its outside
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <normal_fragment_begin>",
      /* glsl */ `float faceDirection = 1.0;
      vec3 normal = normalize( vNormal );
      if ( dot( normal, vViewPosition ) < 0.0 ) normal = - normal;
      vec3 nonPerturbedNormal = normal;`,
    );
    if (!shader.vertexShader.includes("vec3 transformed = P0;") || !shader.vertexShader.includes("vec3 Nq") || !shader.fragmentShader.includes("nonPerturbedNormal = normal;")) throw new Error("hob.js: three's standard shader changed — liquid() no longer fits it");
  };
  mat.customProgramCacheKey = () => `012-liquid-${key}`;
  return mat;
}

/** Fade a lit material (as the kit's setPartOpacity does for a part): it only goes through the transparent pass while it fades. */
function fade(mat, a) {
  mat.opacity = mat.userData.base * a;
  const transparent = mat.userData.transparent || a < 0.999;
  if (mat.transparent !== transparent) {
    mat.transparent = transparent;
    mat.needsUpdate = true;
  }
  mat.depthWrite = mat.userData.depthWrite && a > 0.55;
}

/** A grid of parameters: `cols` × `rows`, each vertex (col, row, 0). `closed`: the last column joins the first. */
function paramGrid(cols, rows, closed) {
  const nc = cols.length;
  const pos = new Float32Array(nc * rows.length * 3);
  rows.forEach((row, j) => cols.forEach((col, i) => pos.set([col, row, 0], (j * nc + i) * 3)));
  const index = [];
  for (let j = 0; j < rows.length - 1; j++)
    for (let i = 0; i < (closed ? nc : nc - 1); i++) {
      const a = j * nc + i;
      const b = j * nc + ((i + 1) % nc);
      index.push(a, a + nc, b, b, a + nc, b + nc);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(pos.length), 3));
  geo.setIndex(index);
  return geo;
}

/** Steam: a tall panel that turns to face the camera round its own height, a few slow wisps drawn in it. They rise, widen and thin out. */
function steamMaterial(seed, base, size, rise = 0.32) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uSeed: { value: seed }, uRise: { value: rise }, uColor: { value: INK.clone() }, uBase: { value: V(...base) }, uSize: { value: new THREE.Vector2(...size) } },
    vertexShader: /* glsl */ `
      uniform vec3 uBase; uniform vec2 uSize; varying vec2 vUv;
      void main() {
        vUv = position.xy;
        vec3 base = (modelMatrix * vec4(uBase, 1.0)).xyz;
        vec2 toCam = cameraPosition.xz - base.xz;
        float len = max(length(toCam), 1e-3);
        vec3 right = vec3(toCam.y, 0.0, -toCam.x) / len;
        gl_Position = projectionMatrix * viewMatrix * vec4(base + right * (position.x * uSize.x) + vec3(0.0, position.y * uSize.y, 0.0), 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uAmount, uSeed, uRise; uniform vec3 uColor; varying vec2 vUv;
      float wisp(float x, float y, float f, float sp, float ph, float amp, float w0) {
        float c = amp * (0.3 + y) * sin(y * f - uTime * sp + ph) + 0.4 * amp * y * sin(y * f * 2.3 - uTime * sp * 1.6 + ph * 1.7);
        float d = (x - c) / (w0 * (0.55 + 1.7 * y));
        return exp(-d * d) * (0.62 + 0.38 * sin(y * 6.0 - uTime * sp * 1.1 + ph * 3.1));
      }
      void main() {
        if (uAmount < 0.003) discard;
        float x = vUv.x; float y = vUv.y;
        float env = smoothstep(0.0, uRise, y) * pow(clamp(1.0 - y, 0.0, 1.0), 2.0) * (1.0 - smoothstep(0.55, 1.0, abs(x)));
        float a = wisp(x, y, 4.2, 0.9, 0.3 + uSeed, 0.3, 0.12) + 0.8 * wisp(x + 0.44, y, 3.1, 0.7, 2.1 + uSeed * 1.3, 0.34, 0.14) + 0.7 * wisp(x - 0.48, y, 5.3, 1.1, 4.4 + uSeed * 0.7, 0.26, 0.1);
        gl_FragColor = vec4(uColor * (a * env * uAmount), 1.0);
      }`,
  });
}

/* ───────────────────────────────────────────────────────────── a head (the one of 009, without its eyes: here you are seen from further) */

const SKULL = [
  { c: [0, 2.2, -1.5], r: [7.6, 8.5, 9.7] }, // the cranium
  { c: [0, -3.8, 2.0], r: [6.5, 7.4, 6.5], k: 1.8 }, // the face, down to the jaw
  { c: [0, -8.4, 4.4], r: [2.8, 2.1, 2.3], k: 2.2 }, // the chin
  { c: [0, 2.6, 6.3], r: [5.9, 1.4, 2.4], k: 1.0 }, // the brow
  { c: [4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 }, // the cheekbones
  { c: [-4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 },
  { c: [0, 0.2, 7.3], r: [0.95, 3.0, 1.55], k: 0.8 }, // the bridge of the nose
  { c: [0, -2.7, 8.1], r: [1.3, 1.35, 2.3], k: 1.0 }, // its tip
  { c: [0, -6.5, 6.5], r: [2.6, 1.1, 1.7], k: 1.8 }, // the lips: barely
]; // (no ears: seen from behind, in glass, they are two rings on a ball)
function headGeometry() {
  // where a ray from the centre along `d` leaves an ellipsoid (0: it misses it)
  const far = (d, c, r) => {
    const ax = d.x / r[0], ay = d.y / r[1], az = d.z / r[2];
    const bx = c[0] / r[0], by = c[1] / r[1], bz = c[2] / r[2];
    const A = ax * ax + ay * ay + az * az;
    const B = ax * bx + ay * by + az * bz;
    const disc = B * B - A * (bx * bx + by * by + bz * bz - 1);
    return disc > 0 ? Math.max(0, (B + Math.sqrt(disc)) / A) : 0;
  };
  const smax = (a, b, k) => {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.max(a, b) + h * h * k * 0.25;
  };
  const ico = new THREE.IcosahedronGeometry(1, 24);
  ico.deleteAttribute("uv");
  ico.deleteAttribute("normal");
  const g = mergeVertices(ico, 1e-5);
  const at = g.attributes.position;
  const d = V();
  for (let i = 0; i < at.count; i++) {
    d.fromBufferAttribute(at, i).normalize();
    let r = far(d, SKULL[0].c, SKULL[0].r);
    for (let j = 1; j < SKULL.length; j++) r = smax(r, far(d, SKULL[j].c, SKULL[j].r), SKULL[j].k);
    at.setXYZ(i, d.x * r, d.y * r, d.z * r);
  }
  g.computeVertexNormals();
  return g;
}

/* ───────────────────────────────────────────────────────────── small makers */

/** Position and normal only, not indexed: what every piece is reduced to before the pieces of one material are merged. */
function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  return o;
}
const lyingX = (g) => g.rotateZ(Math.PI / 2);
const lyingZ = (g) => g.rotateX(Math.PI / 2);

/** A set of glass pieces and of lines, each baked where it stands: one mesh per glass — all of them ONE shell — and one per family of lines. */
function makeSet() {
  const L = { strong: [], fine: [], faint: [] };
  const buckets = new Map();
  const put = (material, geometry) => {
    if (!buckets.has(material)) buckets.set(material, []);
    buckets.get(material).push(bare(geometry));
    return geometry;
  };
  const seg = (list, a, b) => list.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const run = (list, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) seg(list, pts[i], pts[i + 1]);
    if (closed) seg(list, pts[pts.length - 1], pts[0]);
  };
  const ring = (list, cx, y, cz, r, n = 40) => run(list, Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 6.2832), y, cz + r * Math.sin((i / n) * 6.2832)]), true);
  const edgesInto = (list, geometry) => {
    const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, 28).attributes.position;
    for (let i = 0; i < e.count; i += 2) seg(list, [e.getX(i), e.getY(i), e.getZ(i)], [e.getX(i + 1), e.getY(i + 1), e.getZ(i + 1)]);
  };
  const piece = (material, geometry, { pos, rotX, rotY, rotZ, lines = false } = {}) => {
    const g = placed(geometry, { pos, rotX, rotY, rotZ });
    if (lines) edgesInto(L[lines], g);
    return put(material, g);
  };
  /** A board between two corners; `lines`: its own edges drawn in that family. */
  const slab = (material, xa, xb, ya, yb, za, zb, { r = 0.25, lines = false } = {}) =>
    piece(material, box(xb - xa, yb - ya, zb - za, r), { pos: [(xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2], lines });
  /** A smooth line through a few points (a pipe, a lead). */
  const curve = (list, pts, n = 16) => run(list, new THREE.CatmullRomCurve3(pts.map((p) => V(...p)), false, "centripetal").getPoints(n).map((p) => [p.x, p.y, p.z]));
  const build = (parent, order) => {
    const panes = [];
    for (const [material, list] of buckets) {
      const mesh = new THREE.Mesh(list.length > 1 ? mergeGeometries(list) : list[0], material);
      parent.add(mesh);
      panes.push(mesh);
    }
    asShell(panes, order);
    const lines = [];
    for (const name of Object.keys(L)) {
      if (!L[name].length) continue;
      const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(L[name]), lineMat(BRAND.ink, LINE[name].w, { opacity: LINE[name].a }));
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;
      parent.add(mesh);
      lines.push(mesh.material);
    }
    return { glasses: [...buckets.keys()], lines };
  };
  return { L, put, seg, run, ring, curve, piece, slab, build };
}

/* ───────────────────────────────────────────────────────────── the hob */

export function buildHob() {
  const group = new THREE.Group();
  group.name = "hob";
  const A = {};
  const fx = {};
  const xray = new THREE.Group(); // the hob and the wall: glass and lines, they fade with `shell`
  group.add(xray);

  /* ── glass. A flat board seen at a grazing angle is a grey slab across the picture: its lines draw it, not its light ── */
  fx.flat = glass(BRAND.ink, { base: 0.004, rim: 0.03, power: 2.6, edge: 0, through: 0.2 });
  fx.body = glass(BRAND.ink, { base: 0.003, rim: 0.16, power: 2.4, edge: 0.24, through: 0.22 });
  fx.iron = glass(BRAND.ink, { base: 0.004, rim: 0.24, power: 2.4, edge: 0.38, through: 0.2 }); // the pan supports, the rail, the ghost taps
  fx.ghost = glass(BRAND.ink, { base: 0.006, rim: 0.36, power: 2.4, edge: 0.55, through: 0.2 }); // under the top: the rail, the three other taps
  fx.trim = glass(BRAND.ink, { base: 0.004, rim: 0.3, power: 2.6, edge: 0.5, spec: 0.6, through: 0.2 }); // what is round and small: burners, knobs

  /* ═════════════ 1 · THE HOB: its top, its body, three burners, three knobs, the pan supports ═════════════ */

  const H = makeSet();
  const { L } = H;
  const { x0: X0, x1: X1, z0: Z0, z1: Z1 } = HOB;
  H.slab(fx.flat, X0, X1, TOP - 0.8, TOP, Z0, Z1, { r: 0.3 });
  H.run(L.strong, [[X0 + 0.2, TOP + 0.02, Z0 + 0.2], [X1 - 0.2, TOP + 0.02, Z0 + 0.2], [X1 - 0.2, TOP + 0.02, Z1 - 0.2], [X0 + 0.2, TOP + 0.02, Z1 - 0.2]], true);
  H.slab(fx.body, X0 + 2, X1 - 2, TOP - HOB.body, TOP - 0.8, Z0 + 2, Z1 - 2, { r: 0.5 });
  {
    const yb = TOP - HOB.body;
    const c = [[X0 + 2, Z0 + 2], [X1 - 2, Z0 + 2], [X1 - 2, Z1 - 2], [X0 + 2, Z1 - 2]];
    H.run(L.faint, c.map(([x, z]) => [x, yb, z]), true);
    for (const [x, z] of c) H.seg(L.faint, [x, yb, z], [x, TOP - 0.8, z]);
  }

  // the three other burners — the hero's shapes (model.js), in glass: the rim of the cup, the crown, the cap
  for (const b of BURNERS.slice(1)) {
    const capR = b.r * 0.84;
    H.piece(fx.trim, lathe([[0.1, 0], [b.r + 0.7, 0], [b.r + 0.7, 0.3], [b.r + 0.2, 0.36], [b.r, 0.5], [b.r, 1.9], [0.1, 1.9]], 56, { bevel: 0.06, round: 2 }), { pos: [b.x, TOP, b.z] });
    H.piece(fx.trim, lathe([[0.1, 2.04], [capR - 0.25, 2.04], [capR, 2.14], [capR, 2.3], [capR - 0.34, 2.5], [0.1, 2.5]], 56, { bevel: 0.05, round: 2 }), { pos: [b.x, TOP, b.z] });
    H.ring(L.fine, b.x, TOP + 2.3, b.z, capR, 40);
    H.ring(L.fine, b.x, TOP + 1.9, b.z, b.r, 40);
    H.ring(L.faint, b.x, TOP + 0.32, b.z, b.r + 0.7, 44);
  }
  // their knobs, in a row along the front
  for (const b of BURNERS.slice(1)) {
    const y0 = TOP + KNOB_Y;
    const top = y0 + KNOBS.h;
    H.piece(fx.trim, lathe([[0.1, y0], [KNOBS.r, y0], [KNOBS.r, y0 + 0.42], [KNOBS.r - 0.3, y0 + 0.72], [KNOBS.r - 0.4, top - 0.12], [KNOBS.r - 0.52, top], [0.1, top]], 48, { bevel: 0.06, round: 2 }), { pos: [b.knob, 0, KNOBS.z] });
    H.ring(L.fine, b.knob, top, KNOBS.z, KNOBS.r - 0.52, 28);
    H.ring(L.faint, b.knob, y0, KNOBS.z, KNOBS.r, 28);
    H.seg(L.fine, [b.knob, top + 0.02, KNOBS.z - 0.15], [b.knob, top + 0.02, KNOBS.z - KNOBS.r + 0.6]);
  }

  // the pan supports: two cast-iron frames, one over each pair of burners; four fingers reach toward each burner.
  // Thin: over the hero burner they neither hide the flame nor make a slab — and none stands where the foam falls
  {
    const BAR = { w: 0.9, h: 1.3 };
    const ya = GRATE.y - BAR.h;
    const GZ = [Z0 + 2.5, 24.5, Z1 - 10.5]; // the rear bar, the one between the two burners, the front bar
    const bar = (xa, xb, za, zb, family) => {
      H.slab(fx.iron, Math.min(xa, xb) - (xa === xb ? BAR.w / 2 : 0), Math.max(xa, xb) + (xa === xb ? BAR.w / 2 : 0), ya, GRATE.y, Math.min(za, zb) - (za === zb ? BAR.w / 2 : 0), Math.max(za, zb) + (za === zb ? BAR.w / 2 : 0), { r: 0.22 });
      if (family) H.seg(L[family], [xa, GRATE.y + 0.02, za], [xb, GRATE.y + 0.02, zb]);
    };
    for (const [xa, xb, pair] of [[X0 + 1.6, 180.2, [BURNERS[0], BURNERS[2]]], [181.8, X1 - 1.6, [BURNERS[1], BURNERS[3]]]]) {
      for (const z of GZ) bar(xa, xb, z, z, z === GZ[1] ? "faint" : "fine");
      for (const x of [xa, xb]) bar(x, x, GZ[0], GZ[2], "fine");
      for (const x of [xa, xb]) for (const z of GZ) H.piece(fx.iron, cyl(0.5, ya - TOP, 0.08, 16), { pos: [x, (TOP + ya) / 2, z] }); // its feet
      for (const b of pair) {
        const end = b.r * 0.84 + 0.9; // a finger stops short of the cap
        const front = b.z > GZ[1];
        bar(b.x, b.x, b.z + end, front ? GZ[2] : GZ[1], "faint");
        bar(b.x, b.x, front ? GZ[1] : GZ[0], b.z - end, "faint");
        bar(xa, b.x - end, b.z, b.z, "faint");
        bar(b.x + end, xb, b.z, b.z, "faint");
      }
    }
  }

  /* ═════════════ 2 · UNDER THE TOP, through the glass: the gas rail, three ghost taps, their pipes ═════════════ */

  {
    const RY = TOP + PARTS.rail.y;
    const RZ = HZ + PARTS.rail.z;
    const TY = TOP + PARTS.tap.y;
    const TZ = HZ + PARTS.tap.z;
    const xa = X0 + 4;
    const xb = X1 - 3.5;
    H.piece(fx.ghost, lyingX(new THREE.CylinderGeometry(PARTS.rail.r, PARTS.rail.r, xb - xa, 24)), { pos: [(xa + xb) / 2, RY, RZ] });
    H.seg(L.fine, [xa, RY, RZ], [xb, RY, RZ]);
    // where the gas comes from: a pipe from the rail's end to the back of the hob, then down
    H.piece(fx.iron, lyingZ(new THREE.CylinderGeometry(0.6, 0.6, RZ - (Z0 + 4), 16)), { pos: [xb, RY, (RZ + Z0 + 4) / 2] });
    H.run(L.faint, [[xb, RY, RZ], [xb, RY, Z0 + 4], [xb, 34, Z0 + 4]]);
    const m0 = HZ + PARTS.magnet.z0;
    const m1 = HZ + PARTS.magnet.z1;
    for (const b of BURNERS.slice(1)) {
      const kx = b.knob;
      H.piece(fx.ghost, box(PARTS.tap.w, PARTS.tap.h, PARTS.tap.d, 0.3), { pos: [kx, TY, TZ], lines: "fine" });
      H.piece(fx.ghost, lyingZ(cyl(PARTS.magnet.r + 0.1, m0 - m1, 0.08, 24)), { pos: [kx, TY, (m0 + m1) / 2], lines: "faint" }); // its magnet unit
      H.piece(fx.iron, new THREE.CylinderGeometry(0.3, 0.3, TOP + KNOB_Y - (TY + PARTS.tap.h / 2), 12), { pos: [kx, (TOP + KNOB_Y + TY + PARTS.tap.h / 2) / 2, TZ] }); // the spindle, up to the knob
      H.piece(fx.ghost, lyingX(lathe([[PARTS.rail.r, -0.55], [PARTS.rail.r + 0.17, -0.55], [PARTS.rail.r + 0.17, 0.55], [PARTS.rail.r, 0.55]], 24)), { pos: [kx, RY, RZ] }); // the strap that clamps it on the rail
      // its outlet tube to the injector under its burner, and the lead of its thermocouple, to a pin beside its crown
      H.curve(L.faint, [[kx + 1.2, TY + 1.2, TZ - 1], [kx + 2.6, TY + 1.0, TZ - 4.5], [b.x, TY + 0.9, b.z + 5], [b.x, TOP - 3.0, b.z + 0.5]], 18);
      const px = b.x + Math.cos(TH0) * (b.r + 1.3);
      const pz = b.z + Math.sin(TH0) * (b.r + 1.3);
      H.curve(L.faint, [[kx, TY, m1], [kx, TY, m1 - 2.4], [px, TY + 0.7, pz + 1.2], [px, TOP - 1.2, pz], [px, TOP, pz]], 18);
      H.piece(fx.iron, cyl(0.3, 2.9, 0.08, 12), { pos: [px, TOP + 1.45, pz] });
    }
  }

  /* ═════════════ 3 · THE RIGHT WALL: the doorway, its door, the ceiling the gas gathers under ═════════════ */

  {
    const { x: DX, z0: D0, z1: D1, h: DH } = DOOR;
    const AR = 7; // the architrave
    const xf = DX - 2.4;
    H.slab(fx.body, xf, DX, 0, DH, D0 - AR, D0, { r: 0.3 });
    H.slab(fx.body, xf, DX, 0, DH, D1, D1 + AR, { r: 0.3 });
    H.slab(fx.body, xf, DX, DH, DH + AR, D0 - AR, D1 + AR, { r: 0.3 });
    H.run(L.strong, [[xf, 0, D0], [xf, DH, D0], [xf, DH, D1], [xf, 0, D1]]); // the opening
    H.run(L.faint, [[xf, 0, D0 - AR], [xf, DH + AR, D0 - AR], [xf, DH + AR, D1 + AR], [xf, 0, D1 + AR]]);
    // the door itself: wide open, swung back toward the wall on the far side of the opening
    const SW = -120 * DEG;
    const d = [Math.cos(SW), -Math.sin(SW)]; // from its hinges (x, z)
    const leaf = D1 - D0 - 2;
    H.piece(fx.body, box(leaf, DH - 2, 4, 0.4), { pos: [DX - 2 + (d[0] * leaf) / 2, DH / 2, D1 + (d[1] * leaf) / 2], rotY: SW, lines: "faint" });
    H.piece(fx.iron, box(11, 1.6, 1.6, 0.5), { pos: [DX - 2 + d[0] * (leaf - 12) - d[1] * 4.6, 102, D1 + d[1] * (leaf - 12) + d[0] * 4.6], rotY: SW, lines: "faint" }); // its handle
    // the ceiling, on the two walls
    H.run(L.fine, [[-330, CEILING, 0], [300, CEILING, 0], [300, CEILING, 330]]);
    H.seg(L.faint, [300, 236, 0], [300, CEILING, 0]);
  }
  const hobFx = H.build(xray, ORDER.hob);

  // the plate of the light switch: the only solid thing of that wall — the spark will have its place there
  const PLATE = INK.clone().multiplyScalar(0.78);
  fx.plate = solid(PLATE, { rough: 0.55 });
  fx.rocker = solid(INK, { rough: 0.4 });
  {
    const plate = new THREE.Mesh(box(0.8, 8.2, 8.2, 0.3), fx.plate);
    plate.position.set(SWITCH.x + 0.4, SWITCH.y, SWITCH.z);
    const rocker = new THREE.Mesh(box(0.6, 4.6, 3.0, 0.2), fx.rocker);
    rocker.position.set(SWITCH.x - 0.05, SWITCH.y, SWITCH.z);
    rocker.rotation.z = 6 * DEG;
    group.add(plate, rocker);
  }
  A.switch = anchor(group, SWITCH.x, SWITCH.y, SWITCH.z);
  A.door = anchor(group, DOOR.x, DOOR.h, (DOOR.z0 + DOOR.z1) / 2);
  A.knob = anchor(group, HX + PARTS.knob.x, TOP + PARTS.knob.y + KNOB_Y + KNOBS.h, HZ + PARTS.knob.z);

  /* ═════════════ 4 · THE SAUCEPAN: a shell of glass; inside, solid, the water and the foam ═════════════ */

  const pan = new THREE.Group();
  pan.name = "hob-pot";
  pan.position.set(POT.x, POT.y0, POT.z);
  group.add(pan);
  fx.pot = glass(BRAND.ink, { base: 0.004, rim: 0.3, power: 2.4, edge: 0.5, spec: 0.75, through: 0.25 });
  const P = makeSet();
  {
    const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((a0 + ((a1 - a0) * i) / n) * DEG), cy + r * Math.sin((a0 + ((a1 - a0) * i) / n) * DEG)]);
    const profile = [[0.05, 0], ...arc(R - CB, CB, CB, -90, 0, 6), [R, HR - 0.08], [R - 0.08, HR], [RIN + 0.08, HR], [RIN, HR - 0.08], ...arc(RIN - 0.6, 0.95, 0.6, 0, -90, 5), [0.05, 0.35]];
    P.put(fx.pot, lathe(profile, 96, { crease: 35 }));
    P.ring(P.L.strong, 0, HR, 0, R, 72);
    P.ring(P.L.fine, 0, HR, 0, RIN, 72);
    P.ring(P.L.fine, 0, 0.1, 0, R - CB * 0.55, 64);
    // its handle, away from the camera
    const [hx, , hz] = POT.handle.dir;
    const turn = -Math.atan2(hz, hx);
    const len = POT.handle.len;
    P.piece(fx.pot, box(len, 1.0, 2.4, 0.45), { pos: [hx * (R + 0.8 + len / 2), HR - 2.6, hz * (R + 0.8 + len / 2)], rotY: turn, lines: "fine" });
    P.piece(fx.pot, box(1.8, 2.6, 3.4, 0.4), { pos: [hx * (R + 0.6), HR - 2.6, hz * (R + 0.6)], rotY: turn });
  }
  const potFx = P.build(pan, ORDER.pot);
  A.pot = anchor(pan, 0, HR * 0.5, 0);
  A.rim = anchor(pan, R * Math.cos(TH0), HR, R * Math.sin(TH0));
  A.foam = anchor(pan, 0, HR + 3, 0);

  // what the liquid's shaders read
  const BUBS = Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, 1, 0));
  const U = { uTime: { value: 0 }, uFoam: { value: new THREE.Vector4(YW, 0, 0, 0) }, uDrip: { value: V() }, uHeave: { value: new THREE.Vector2() }, uPool: { value: new THREE.Vector2() }, uBub: { value: BUBS } };
  const UW = { uTime: U.uTime, uFoam: { value: new THREE.Vector4(YW, 0, 0, 0) }, uDrip: { value: V() }, uHeave: { value: new THREE.Vector2() }, uPool: { value: new THREE.Vector2() }, uBub: U.uBub };

  // the water: a body you see into, its surface that heaves, the bubbles that climb in it
  const RW = RIN - 0.04;
  fx.water = solid(INK.clone().multiplyScalar(0.2), { rough: 0.2, env: 0.8, opacity: 0.62 });
  const body = new THREE.Mesh(mergeGeometries([bare(new THREE.CylinderGeometry(RW, RW, YW - 0.4, 72, 1, true).translate(0, (YW + 0.4) / 2, 0)), bare(new THREE.CircleGeometry(RW, 72).rotateX(Math.PI / 2).translate(0, 0.4, 0))]), fx.water);
  body.renderOrder = -1; // before any flame: one behind the water is hidden by it, one in front is drawn over it
  fx.surface = liquid(solid(INK.clone().multiplyScalar(0.34), { rough: 0.62, env: 0.5 }), "water", "cap", UW); // (rough: the rim light mirrored in it flares)
  const surface = new THREE.Mesh(paramGrid(Array.from({ length: 96 }, (_, i) => (i / 96) * 6.2831853), Array.from({ length: 19 }, (_, i) => i / 18), true), fx.surface);
  surface.frustumCulled = false;
  surface.receiveShadow = true;
  fx.bubble = solid(INK.clone().multiplyScalar(0.8), { rough: 0.3, env: 0.9 });
  const NB = 26;
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), fx.bubble, NB);
  bubbles.frustumCulled = false;
  const rand = rng(12);
  const BUB = Array.from({ length: NB }, (_, i) => {
    const a = rand() * 6.2832;
    const d = Math.sqrt(rand()) * (i < 8 ? 6.6 : 8.4);
    return { x: d * Math.cos(a), z: d * Math.sin(a), r: i < 8 ? 0.34 + rand() * 0.2 : 0.14 + rand() * 0.16, dome: 0.75 + rand() * 0.55, T: 1.5 + rand() * 1.2, ph: rand(), w: 1.6 + rand() * 1.4 };
  });
  body.name = "hob-water";
  pan.add(body, surface, bubbles);

  // the foam: ink, solid, smooth, a little glossy — milk, or the water of the pasta. One sheet: what lies in the
  // saucepan's mouth (s 0 → 1) and what hangs outside it (s 1 → 2), dense in angle where the runs are
  // (matte: under a varnish, the softbox and the rim light are white-hot patches that bloom on top of the dome)
  const foamy = (albedo = 0.8, inner = 0.15) => {
    const mat = solid(INK.clone().multiplyScalar(albedo), { rough: 0.68, env: 0.5 });
    mat.emissive = INK.clone().multiplyScalar(inner); // light goes through foam: its shaded side is never dark
    return mat;
  };
  const thetas = [];
  const dense = [TH0 - 32 * DEG, TH0 + 34 * DEG];
  for (let a = dense[0]; a < dense[1]; a += 0.008) thetas.push(a);
  for (let a = dense[1]; a < dense[0] + 6.2831853 - 0.02; a += 0.055) thetas.push(a);
  fx.foam = liquid(foamy(), "foam", "foamAt", U);
  const foam = new THREE.Mesh(paramGrid(thetas, [...Array.from({ length: 23 }, (_, i) => i / 22), ...Array.from({ length: 76 }, (_, i) => 1 + (i + 1) / 76)], true), fx.foam);
  foam.frustumCulled = false;
  foam.receiveShadow = true;
  fx.plug = foamy(); // …and its side, seen through the glass, between the water and the rim
  const plug = new THREE.Mesh(new THREE.CylinderGeometry(RW + 0.01, RW + 0.01, 1, 72, 1, true).translate(0, 0.5, 0), fx.plug);
  plug.position.y = YW;
  fx.pool = liquid(foamy(0.62, 0.08), "pool", "poolAt", U); // it lies flat under the key, in the burner's own light: darker, or it burns white
  const pool = new THREE.Mesh(paramGrid(Array.from({ length: 151 }, (_, i) => TH0 - 46 * DEG + (i / 150) * 92 * DEG), Array.from({ length: 17 }, (_, i) => 0.5 - 0.5 * Math.cos((Math.PI * i) / 16)), false), fx.pool);
  pool.frustumCulled = false;
  pool.receiveShadow = true;
  foam.name = "hob-foam";
  plug.name = "hob-plug";
  pool.name = "hob-pool";
  pan.add(foam, plug, pool);

  // the steam: over the saucepan, and where the foam lands on the burner
  const panel = new THREE.PlaneGeometry(2, 1).translate(0, 0.5, 0);
  const steam = [
    { mat: steamMaterial(0, [0, HR + 0.5, 0], [11, 30]), over: 1 },
    { mat: steamMaterial(3, [1.5, HR + 1, -2], [9, 24]), over: 0.75 },
    { mat: steamMaterial(5, [Math.cos(TH0) * 12.2, YT, Math.sin(TH0) * 12.2], [9, 18], 0.1), land: 1 }, // (in front of the saucepan: nearer its axis, the panel is inside the water)
  ];
  for (const s of steam) {
    const mesh = new THREE.Mesh(panel, s.mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 6;
    pan.add(mesh);
  }

  /* ═════════════ 5 · YOU ═════════════ */

  const you = makeFigure({ shell: true, hands: "real", order: ORDER.you, glassK: 1.6, through: 0.2, skin: BRAND.ink });
  you.group.name = "hob-you";
  group.add(you.group);
  you.shadow.visible = true;
  const HEADY = 76.5; // the head's centre, in the trunk's frame
  fx.head = glass(BRAND.ink, { base: 0.006, rim: 0.6, power: 2.4, edge: 0.5, spec: 0.8, through: 0.06 });
  you.head.geometry = headGeometry();
  you.head.material = fx.head;
  you.head.castShadow = false;
  you.head.position.set(0, HEADY, 2);
  asShell(you.head, ORDER.you);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.6, 9, 24, 1, true), you.body); // (a tube, open: the round end of a capsule shows through the head like a second ball)
  neck.position.set(0, HEADY - 12.5, 0.7);
  neck.rotation.x = 10 * DEG;
  neck.scale.z = 0.92;
  you.torso.add(neck);
  asShell(neck, ORDER.you);
  fx.hand = solid(BRAND.ink, { rough: 0.6, env: 0.6 }); // the hand that acts is the only solid thing of you
  A.youHead = anchor(you.head, 0, 12.5, 0);
  A.youHand = anchor(you.arms.L.hand, 0, 1.5, 6);
  /** The hand that acts turns solid, the other one is glass like the rest. */
  function act(side) {
    for (const s of ["L", "R"]) {
      const meshes = you.arms[s].fingers.meshes;
      for (const mesh of meshes) mesh.material = s === side ? fx.hand : you.body;
      asShell(meshes, s === side ? false : ORDER.you);
    }
    you.arms[side].hand.add(A.youHand);
  }

  // AT THE HOB — standing at YOU.hob, facing the wall, the fingers of the hand on the camera's side on the hero knob.
  // (The left one: from where you stand the knob is under your left shoulder; the right arm would cross your body, hidden by it.)
  const HOBHAND = "L";
  const STAND = { x: YOU.hob.x, z: YOU.hob.z, yaw: Math.PI };
  const KNOBTOP = V(HX + PARTS.knob.x, TOP + PARTS.knob.y + KNOB_Y + KNOBS.h + 0.05, HZ + PARTS.knob.z);
  // IN THE DOORWAY — a step inside (YOU.door, moved 12 cm toward the wall and 20 along it: from the cameras on the −x
  // side your arm then shows in front of you, not behind your back), turned toward the kitchen, the right hand on the switch.
  const ENTER = { x: YOU.door.x + 12, z: YOU.door.z + 20, yaw: -160 * DEG };
  const PLATEPT = V(SWITCH.x - 1.3, SWITCH.y, SWITCH.z); // a finger's thickness off the rocker
  const LAY = {
    hob: { dir: V(0.1, -0.8, 0.59).normalize(), palm: V(0, -0.59, -0.8) }, // the hand comes down on the knob, its fingertips press it
    // the palm toward the wall, the fingers up and forward along it: from the room, the back of a whole hand — not a hand seen edge-on
    door: { dir: V(Math.sin(ENTER.yaw) * 0.8, 0.6, Math.cos(ENTER.yaw) * -0.8).normalize(), palm: V(Math.cos(ENTER.yaw), 0, Math.sin(ENTER.yaw)) },
  };
  const GRIP = { hob: [0.4, 2.4], door: [0.1, 3] };
  const at = V();
  const tip = V();
  const foot = V();
  /** A point of the kitchen, in your own frame (you stand at `where`). */
  const toYou = (where, p, out) => {
    const dx = p.x - where.x;
    const dz = p.z - where.z;
    const c = Math.cos(where.yaw);
    const s = Math.sin(where.yaw);
    return out.set(dx * c - dz * s, p.y, dx * s + dz * c);
  };
  /** Where the tip of a finger is, from the wrist, for a hand laid that way: the wrist is then put so that this tip lands where it must. */
  function tipFrom(side, finger, lay, grip) {
    const arm = you.arms[side];
    you.grip(side, grip[0], grip[1]);
    you.reach(side, at.set(arm.side * 20, 110, 25), null, lay);
    const bone = arm.fingers.meshes[2 + finger * 3 + 2];
    bone.geometry.computeBoundingBox();
    return V(0, bone.geometry.boundingBox.max.y * 0.8, 0).applyQuaternion(bone.quaternion).add(bone.position).applyQuaternion(arm.hand.quaternion).add(arm.hand.position).sub(arm.at);
  }
  const OFF = { hob: tipFrom(HOBHAND, 1, LAY.hob, GRIP.hob), door: tipFrom("R", 1, LAY.door, GRIP.door) };

  function poseHob(press) {
    const sg = you.arms[HOBHAND].side;
    you.group.position.set(STAND.x, 0, STAND.z);
    you.group.rotation.y = STAND.yaw;
    you.leg("L", foot.set(9.5, 8, 5));
    you.leg("R", foot.set(-9.5, 8, -4));
    you.head.rotation.set(24 * DEG, 14 * DEG * sg, 0); // the eyes on the burner
    you.reach(HOBHAND === "L" ? "R" : "L", at.set(-sg * 21, 92, 7));
    toYou(STAND, KNOBTOP, tip);
    tip.y -= press * KNOBS.travel;
    you.grip(HOBHAND, GRIP.hob[0], GRIP.hob[1]);
    you.reach(HOBHAND, at.copy(tip).sub(OFF.hob), null, LAY.hob);
    you.lean(10 + 2 * press, 0, 5 * sg);
  }
  function poseDoor() {
    you.group.position.set(ENTER.x, 0, ENTER.z);
    you.group.rotation.y = ENTER.yaw;
    you.leg("L", foot.set(9, 8, 13)); // a step: you have just come in
    you.leg("R", foot.set(-9, 8, -11));
    you.head.rotation.set(3 * DEG, 12 * DEG, 0); // looking into the kitchen
    you.reach("L", at.set(21, 92, 5));
    toYou(ENTER, PLATEPT, tip);
    you.grip("R", GRIP.door[0], GRIP.door[1]);
    you.reach("R", at.copy(tip).sub(OFF.door), null, LAY.door);
    you.lean(3, -2, -8);
  }
  const last = { who: 0, press: NaN, pot: 1 };
  const LIQUIDS = [fx.water, fx.surface, fx.bubble, fx.foam, fx.plug, fx.pool];
  group.userData.hob = { you, A }; // (for a probe of the pose without an image)
  const M = new THREE.Matrix4();

  return {
    group, A, fx, you,
    /**
     * shell  the X-ray of the hob and of the right wall — and the glass of the saucepan: glass and lines (0–1). You do not fade with it
     * pot    the saucepan, its water, its foam: 0 gone → 1 there (in between they fade: tween it rather than cut it)
     * boil   the water boils: its surface heaves, big bubbles push it up and burst, steam rises (0–1)
     * spill  0 nothing · 0.3 the foam swells in a dome above the rim · 0.6 three runs go down the side on the camera's side ·
     *        1 two of them have fallen onto the burner and spread on the top round the crown; steam where they land
     * you    0 nobody · 1 at the hob, your fingers on the hero knob (they go down with `press`) · 2 in the doorway, your hand on the switch
     * flame  (read only for the steam where the foam lands: less of it once the flame is out)
     */
    update({ shell = 1, pot = 1, boil = 0, spill = 0, you: who = 0, press = 0, flame = 0 } = {}, time = 0) {
      // the hob, the wall
      const sh = clamp01(shell);
      xray.visible = sh > 0.004;
      for (let i = 0; i < hobFx.glasses.length; i++) hobFx.glasses[i].uniforms.uAmount.value = sh;
      for (let i = 0; i < hobFx.lines.length; i++) hobFx.lines[i].opacity = hobFx.lines[i].userData.base * sh;
      fx.plate.color.copy(PLATE).multiplyScalar(sh); // (black on black: gone, without a transparent pass)
      fx.rocker.color.copy(INK).multiplyScalar(sh);

      // the saucepan
      const pk = clamp01(pot);
      const here = pk > 0.004;
      pan.visible = here;
      if (here) {
        if (pk !== last.pot) {
          last.pot = pk;
          for (let i = 0; i < LIQUIDS.length; i++) fade(LIQUIDS[i], pk);
        }
        potFx.glasses[0].uniforms.uAmount.value = pk * sh; // its glass leaves with the X-ray
        for (let i = 0; i < potFx.lines.length; i++) potFx.lines[i].opacity = potFx.lines[i].userData.base * pk * sh;
        const sp = clamp01(spill);
        const bo = clamp01(boil);
        const ye = Math.min(YW + along(LEVEL, sp), HR);
        const dome = along(DOME, sp) * (0.8 + 0.2 * bo);
        const roll = along(ROLL, sp);
        U.uTime.value = time;
        U.uFoam.value.set(ye, dome, roll, along(HANG, sp));
        U.uDrip.value.set(along(RUNS[0].keys, sp), along(RUNS[1].keys, sp), along(RUNS[2].keys, sp));
        U.uHeave.value.set(bo * mix(0.3, 0.85, smooth(0.1, 0.4, sp)), bo * 0.9);
        U.uPool.value.set(smooth(0.83, 1, sp), smooth(0.91, 1, sp));
        UW.uHeave.value.set(0.45 * bo, 1.4 * bo);
        foam.visible = plug.visible = sp > 0.002;
        pool.visible = sp > 0.83;
        plug.scale.y = Math.max(1e-3, ye - YW);
        A.foam.position.y = ye + dome + 0.9 * roll;
        // the bubbles: each climbs, swells, and pushes up a dome that bursts
        for (let i = 0; i < NB; i++) {
          const b = BUB[i];
          const u = (((time / b.T + b.ph) % 1) + 1) % 1;
          const r = b.r * (0.5 + 0.6 * u) * bo * smooth(0, 0.12, u) * (1 - smooth(0.9, 1, u));
          M.makeScale(r, r, r).setPosition(b.x + 0.3 * Math.sin(time * b.w + b.ph * 40), 0.7 + u * (YW - 1.3), b.z + 0.3 * Math.cos(time * b.w * 0.8 + b.ph * 23));
          bubbles.setMatrixAt(i, M);
          if (i < 8) BUBS[i].set(b.x, b.z, 1.2 + 0.9 * b.dome, b.dome * smooth(0.7, 0.93, u) * (1 - smooth(0.94, 1, u)));
        }
        bubbles.instanceMatrix.needsUpdate = true;
        // the steam
        const over = bo * (0.55 + 0.45 * smooth(0, 0.3, sp));
        const land = smooth(0.84, 0.96, sp) * (0.4 + 0.6 * clamp01(flame)) * mix(0.3, 1, bo); // less of it once the flame is out, and once nothing boils
        for (let i = 0; i < steam.length; i++) {
          const u = steam[i].mat.uniforms;
          u.uTime.value = time;
          u.uAmount.value = pk * (steam[i].land ? 0.4 * land : 0.09 * steam[i].over * over);
          if (!steam[i].land) u.uBase.value.y = (sp > 0.002 ? ye + dome : YW) - 1.5 + 0.8 * i; // it leaves from the top of the foam, not from inside it
        }
      }

      // you
      const w = who > 1.5 ? 2 : who > 0.5 ? 1 : 0;
      you.group.visible = w > 0;
      if (w && (w !== last.who || (w === 1 && press !== last.press))) {
        if (w !== last.who) act(w === 1 ? HOBHAND : "R");
        last.who = w;
        last.press = press;
        if (w === 1) poseHob(clamp01(press));
        else poseDoor();
      }
    },
  };
}
