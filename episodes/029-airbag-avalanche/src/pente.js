// DOSSIER 029 — the slope and the avalanche, around you. Centimetres, y up. The brief: docs/029-decors.md,
// « src/pente.js ». The contract: plan.js (the two frames), world.js (FIRST, apply). Journal: docs/journal/029-pente.md.
//
// buildSlope() → { group, A, fig, update(P, time, px) }
//   group   added to the scene's set by world.js, NEVER moved nor turned by it. Inside:
//             · the SKY, a dome at infinity (007's backdrop idiom): a dark sky, a horizon a shade lighter, three planes
//               of far crests in ink lines — and it knows where the mountain is (the slope and its far side beyond the
//               crest, two half-spaces): nothing of the sky is drawn behind the mountain of glass.
//             · the SLOPE'S FRAME (a group tilted by SLOPE about x: x across, h out of the snow, s downhill), holding
//                 - what moves WITH YOU (the frame is yours: plan.js): the slab cut loose and its fissures, the flowing
//                   mass and its blocks, its free surface, the section at x = 0, the powder;
//                 - `still`, the mountain that does not move, slid UPHILL past you by `travel`: its grid (it bends into a
//                   flat valley far below), the bed the slab uncovers, the wall of the crown, the crack and its jets of
//                   snow, the rocks, the crest line, the chalet of the next file.
//             · YOU, of glass, in the world's frame (gravity is the world's): upright on your skis, knocked down, rolled,
//               buried, your left hand to the handle.
//   A       anchors (Object3D): you (your chest), head, pack (ON YOUR BACK: the pack's frame, plan.js PACK_ON_TORSO, no
//           rotation), hand (your left wrist), skis, surface (the flow's surface right above your chest), crown (the break,
//           where it is now), chalet (the next file, far below)
//   fig     the glass figure (kit/lib/figure.js), posed from the numbers below
//   update  sixteen times a frame, no allocation; P is plain numbers (world.js hands them over):
//     shell crack slab travel rush flow sort you fall roll bury reach pull teaser
//
// THE TRAP OF THIS FILE: flying snow and a grid that scrolls make flickering frames. So: snow in flight is always a
// STREAK (the line it covers in a frame, 3 px wide, never drawn shorter than 8 px), the grid's lines across the fall
// line are spread over the distance the mountain covers in one frame (measured between the sixteen calls of a frame),
// every grid level and every fissure pattern leaves before its cells shrink to a few pixels, every line is ≥ 1.8 px,
// every pow / sqrt / division in a shader is bounded. Nothing moves with the clock alone: what tumbles, churns, flies
// is driven by `travel` (and the crack by `crack`) — when they stop, everything stops.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, edgesOf, fatLine, plate } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { rng } from "@kit/rng.js";
import { DEG, SLOPE, slopePt, SLAB, FLOW, BLOCKS, YOU, SKIS, PACK_ON_TORSO, HANDLE, VALLEY } from "./plan.js";
import { dressSlope } from "./habillage.js"; // the decorator: the firs, the low sun

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const C = Math.cos(SLOPE * DEG);
const S = Math.sin(SLOPE * DEG);
const INK = new THREE.Color(BRAND.ink);
const SIG = new THREE.Color(BRAND.signal);
const VEI = new THREE.Color(BRAND.veille);
const VIEWPORT = new THREE.Vector2(BRAND.W, BRAND.H);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const sstep = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const mix = (a, b, u) => a + (b - a) * u;

const HW = SLAB.halfWidth;
const CROWN = SLAB.crown;
const THICK = SLAB.thick;
const CREST = SLAB.top; // the crest line, uphill of the crown: the mountain's top
const GRID_X = 8000; // the mountain's grid, across
/** How far the head of the crack is (cm from x = 0) for a value of `crack`: it starts slow under your skis (at 0.12 it
 *  is ≈ 1 m out, at the edge of the hook's frame) and then runs away to both edges. */
const crackHead = (k) => HW * Math.pow(clamp01(k), 1.5);
/** The valley: the mountain's grid bends from the slope's angle to the flat over [BEND0, BEND1] (s, still frame). */
const BEND0 = 21000;
const BEND1 = 25000;
const GRID_END = 42000;
const bendAngle = (s) => SLOPE * DEG * sstep(BEND0, BEND1, s);
/** The free surface of the flow (h, cm), around you: a slow swell that the slide drives (`ph` = travel × 0.003). */
const waveSurf = (x, s, ph) => 7 * Math.sin(x * 0.009 + s * 0.0045 + ph) + 5 * Math.sin(s * 0.012 - x * 0.004 + 1.7 * ph + 1.3) + 3 * Math.sin((x - s) * 0.02 + 0.6 * ph + 2.1);

/* ───────────────────────────────────────────────────────────── GLSL shared */
const GL = /* glsl */ `
  // one family of lines, a pixel and a half wide, spread over the smear (cells)
  float lineAA(float q, float smear) {
    float w = max(fwidth(q) * 1.5, 1e-5);
    float d = abs(fract(q - 0.5) - 0.5);
    float reach = max(w, 0.5 * smear);
    return (w / reach) * (1.0 - smoothstep(reach - w, reach, d));
  }
  // a level of grid that leaves before its cells get too small to draw (no shimmer, no grey slab far away)
  float level(vec2 p, float cell, float smearS) {
    vec2 q = p / cell;
    vec2 fw = fwidth(q);
    float show = smoothstep(5.0, 18.0, 1.0 / max(max(fw.x, fw.y), 1e-5));
    return show * max(lineAA(q.x, 0.0), lineAA(q.y, smearS / cell));
  }
  // a line at v = 0, hp pixels either side (hp 0.9: 1.8 px)
  float aline(float v, float hp) {
    float w = max(fwidth(v), 1e-5);
    return 1.0 - smoothstep(hp - 0.6, hp + 0.6, abs(v) / w);
  }
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }
  // distance to the nearest border of a Voronoi cell (in cells): the fissures of the slab
  float voronoiEdge(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    vec2 mg = vec2(0.0);
    vec2 mr = vec2(0.0);
    float md = 8.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = g + 0.15 + 0.7 * hash2(n + g) - f;
      float d = dot(r, r);
      if (d < md) { md = d; mr = r; mg = g; }
    }
    md = 8.0;
    for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 r = g + 0.15 + 0.7 * hash2(n + g) - f;
      vec2 dr = r - mr;
      if (dot(dr, dr) > 1e-5) md = min(md, dot(0.5 * (mr + r), dr * inversesqrt(dot(dr, dr))));
    }
    return md;
  }
`;
// THE SNOW AS A SURFACE: a mantle of clear glass that catches the light — a soft fill, a grazing reflection, the low
// sun's sheen, brightest around you and going out far away; a slow undulation of the light (wind ripples: nothing fine,
// nothing to flicker). Additive: no solid floor. The normal comes from the surface itself (derivatives).
const GL_MANTLE = /* glsl */ `
  float mantle(vec3 w, vec2 g, vec3 you) {
    vec3 nrm = normalize(cross(dFdx(w), dFdy(w)));
    vec3 v = normalize(cameraPosition - w);
    float fv = dot(nrm, v);
    nrm *= sign(fv + 1e-6);
    float f = clamp(1.0 - abs(fv), 0.0, 1.0);
    vec3 L = normalize(vec3(-0.45, 0.55, 0.7));
    float sheen = pow(clamp(dot(reflect(-v, nrm), L), 0.0, 1.0), 6.0);
    float d = length(w - you);
    float near = exp(-d / 700.0) + 0.2 * exp(-d / 3800.0);
    float ripple = 0.82 + 0.18 * sin(g.x * 0.0041 + g.y * 0.0113) * sin(g.y * 0.0037 - g.x * 0.0017 + 1.3);
    return near * ripple * (0.024 + 0.075 * f * f * f + 0.07 * sheen);
  }
`;
// the flow's free surface (the same as waveSurf in JS)
const GL_WAVE = /* glsl */ `
  float waveSurf(float x, float s, float ph) {
    return 7.0 * sin(x * 0.009 + s * 0.0045 + ph) + 5.0 * sin(s * 0.012 - x * 0.004 + 1.7 * ph + 1.3) + 3.0 * sin((x - s) * 0.02 + 0.6 * ph + 2.1);
  }
`;
// the section cut, shared by what flows: seen across the slope, the half of the flow on the camera's side is taken away
const GL_CUT = /* glsl */ `
  uniform vec3 uYouW;
  bool cutAway(vec3 w) {
    vec3 e = cameraPosition - uYouW;
    float k = abs(e.x) / max(length(e), 1e-3);
    float cutK = smoothstep(0.90, 0.985, k);
    float at = mix(2000.0, 0.0, cutK);
    return w.x * sign(e.x) > at;
  }
`;

/* ───────────────────────────────────────────────────────────── the sky */

/** The sky at infinity: a dark dome that follows the eye, the horizon a shade lighter, three planes of far crests in
 *  ink lines (each hides the ones behind it). It draws nothing where the mountain itself stands in the way: the slope
 *  { h < 0 } and, beyond the crest, its far side { h < k (s − crest) } — a ray that enters them is not the sky. */
function makeSky() {
  const uniforms = { uInk: { value: INK.clone() }, uAmount: { value: 1 }, uTravel: { value: 0 }, uCrest: { value: CREST }, uBack: { value: 1.4 } };
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 24),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = position;
          vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
          gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk; uniform float uAmount, uTravel, uCrest, uBack;
        varying vec3 vDir;
        const float C = ${C.toFixed(6)}, S = ${S.toFixed(6)};
        bool hidden(vec3 o, vec3 d) {
          float h0 = o.y * C + o.z * S;
          float s0 = -o.y * S + o.z * C + uTravel; // the still frame: the mountain has slid uphill by travel
          float dh = d.y * C + d.z * S;
          float ds = -d.y * S + d.z * C;
          float lo = 0.0;
          float hi = 1e12;
          if (abs(dh) < 1e-6) { if (h0 >= 0.0) return false; } else { float t = -h0 / dh; if (dh > 0.0) hi = min(hi, t); else lo = max(lo, t); }
          float g0 = h0 - uBack * (s0 - uCrest);
          float dg = dh - uBack * ds;
          if (abs(dg) < 1e-6) { if (g0 >= 0.0) return false; } else { float t = -g0 / dg; if (dg > 0.0) hi = min(hi, t); else lo = max(lo, t); }
          if (lo >= hi) return false;
          return lo > 0.0 || hi > 1e11; // from outside: it enters · from inside the snow (X-ray): it never comes out
        }
        float ridge(float az, float base, float amp, float f1, float f2, float f3, float ph) {
          return base + amp * (0.55 * sin(az * f1 + ph) + 0.3 * sin(az * f2 + ph * 1.7) + 0.25 * abs(sin(az * f3 + ph * 2.3)) - 0.12);
        }
        float ln(float v) { float w = max(fwidth(v), 1e-6); return 1.0 - smoothstep(0.5, 1.4, abs(v) / w); }
        void main() {
          vec3 d = normalize(vDir);
          if (hidden(cameraPosition, d)) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
          float e = d.y;
          float az = atan(d.x, d.z + 1e-6);
          float rFar = ridge(az, 0.052, 0.034, 3.0, 8.0, 19.0, 0.4);
          float rMid = ridge(az, 0.036, 0.040, 2.0, 7.0, 15.0, 2.2);
          float rNear = ridge(az, 0.018, 0.034, 4.0, 11.0, 23.0, 4.1);
          float sil = max(max(rFar, rMid), rNear);
          float lines = ln(e - rNear) * 0.26
            + ln(e - rMid) * 0.17 * step(rNear, e)
            + ln(e - rFar) * 0.10 * step(max(rNear, rMid), e);
          float above = max(e - sil, 0.0);
          float air = step(sil, e) * (0.05 * exp(-above / 0.045) + 0.008);
          gl_FragColor = vec4(uInk * (lines + air) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the mountain's grid (still) */

/** The mountain, like an X-ray: no floor, a grid that hugs the slope and bends into the flat valley far below. Its
 *  lines across the fall line spread over the distance the mountain slides in a frame. `uHole`: where the slab has
 *  left (its own plate, moving with you, is drawn instead): x within the crack's run, s from the crown down. */
function makeMountain() {
  const xs = [];
  for (let i = 0; i <= 16; i++) xs.push(-GRID_X + (2 * GRID_X * i) / 16);
  const ss = [];
  for (let s = CREST; s <= GRID_END; s += s < 3000 ? 150 : 300) ss.push(s);
  // the height above the slope's plane: dh/ds = tan of the bend
  const hs = [0];
  for (let i = 1; i < ss.length; i++) {
    const m = (ss[i] + ss[i - 1]) / 2;
    hs.push(hs[i - 1] + Math.tan(bendAngle(m)) * (ss[i] - ss[i - 1]));
  }
  const pos = [];
  const grid = [];
  const index = [];
  for (let j = 0; j < ss.length; j++) for (let i = 0; i < xs.length; i++) {
    pos.push(xs[i], hs[j], ss[j]);
    grid.push(xs[i], ss[j]);
  }
  const W = xs.length;
  for (let j = 0; j < ss.length - 1; j++) for (let i = 0; i < W - 1; i++) {
    const a = j * W + i;
    index.push(a, a + W, a + 1, a + 1, a + W, a + W + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aGrid", new THREE.Float32BufferAttribute(grid, 2));
  geo.setIndex(index);
  const uniforms = {
    uColor: { value: INK.clone() }, uAmount: { value: 1 }, uSmear: { value: 0 }, uFade: { value: 16000 }, uCrest: { value: CREST },
    uHole: { value: new THREE.Vector4(0, CROWN, SLAB.bottom, 0) }, uYou: { value: V(0, 0, 0) },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        attribute vec2 aGrid; varying vec2 vG; varying vec3 vW;
        void main() {
          vG = aGrid;
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor, uYou; uniform float uAmount, uSmear, uFade, uCrest; uniform vec4 uHole;
        varying vec2 vG; varying vec3 vW;
        ${GL}
        ${GL_MANTLE}
        void main() {
          float g = max(max(level(vG, 100.0, uSmear) * 0.5, level(vG, 500.0, uSmear) * 0.7), level(vG, 2500.0, uSmear) * 0.9);
          float dist = length(vW - cameraPosition);
          float fade = exp(-dist / uFade) * (1.0 - smoothstep(6000.0, ${GRID_X.toFixed(1)}, abs(vG.x))) * smoothstep(uCrest, uCrest + 200.0, vG.y)
            * (1.0 - smoothstep(${(GRID_END - 6000).toFixed(1)}, ${GRID_END.toFixed(1)}, vG.y));
          float hole = (1.0 - smoothstep(uHole.x - 2.0, uHole.x, abs(vG.x))) * step(uHole.y, vG.y) * step(vG.y, uHole.z);
          float edges = (1.0 - smoothstep(6000.0, ${GRID_X.toFixed(1)}, abs(vG.x))) * smoothstep(uCrest, uCrest + 200.0, vG.y);
          gl_FragColor = vec4(uColor * (g * 0.17 * fade + mantle(vW, vG, uYou) * edges) * (1.0 - hole) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  /** The height of the grid above the slope's plane at a point of the still frame (the valley's bend). */
  const heightAt = (s) => {
    for (let j = 1; j < ss.length; j++) if (ss[j] >= s) return mix(hs[j - 1], hs[j], (s - ss[j - 1]) / (ss[j] - ss[j - 1]));
    return hs[hs.length - 1];
  };
  return { mesh, uniforms, heightAt };
}

/** The bed the slab uncovers as it leaves (still): the weak layer, 40 cm down, a dimmer grid — only between the crown
 *  and where the slab now begins. */
function makeBed() {
  const geo = new THREE.PlaneGeometry(2 * HW, SLAB.bottom - CROWN, 1, 1).rotateX(-Math.PI / 2).translate(0, -THICK, (SLAB.bottom + CROWN) / 2);
  const uniforms = { uColor: { value: INK.clone() }, uAmount: { value: 0 }, uSmear: { value: 0 }, uHalf: { value: 0 }, uTo: { value: CROWN }, uFade: { value: 12000 } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec2 vG; varying vec3 vW;
        void main() { vG = position.xz; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount, uSmear, uHalf, uTo, uFade;
        varying vec2 vG; varying vec3 vW;
        ${GL}
        void main() {
          float on = (1.0 - smoothstep(uHalf - 2.0, uHalf, abs(vG.x))) * step(${CROWN.toFixed(1)}, vG.y) * (1.0 - smoothstep(uTo - 4.0, uTo, vG.y));
          if (on * uAmount < 0.002) discard;
          float g = max(level(vG, 100.0, uSmear) * 0.5, level(vG, 500.0, uSmear) * 0.8);
          float fade = exp(-length(vW - cameraPosition) / uFade);
          gl_FragColor = vec4(uColor * (g * 0.13 + 0.006) * fade * on * uAmount, 1.0);
        }`,
    }),
  );
  mesh.renderOrder = 1;
  return { mesh, uniforms };
}

/** A vertical face of the snow, 40 cm high, across the slope (the wall of the crown, still; the slab's own upper face,
 *  moving): a faint fill and its lower edge. Only where the crack has run. */
function makeFace(color, fill, edgeK) {
  const geo = new THREE.PlaneGeometry(2 * HW, THICK, 1, 1).translate(0, -THICK / 2, 0);
  const uniforms = { uColor: { value: color.clone() }, uAmount: { value: 0 }, uHalf: { value: 0 }, uFade: { value: 12000 } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec2 vP; varying vec3 vW;
        void main() { vP = position.xy; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount, uHalf, uFade;
        varying vec2 vP; varying vec3 vW;
        ${GL}
        void main() {
          float on = 1.0 - smoothstep(uHalf - 2.0, uHalf, abs(vP.x));
          if (on * uAmount < 0.002) discard;
          float dist = length(vW - cameraPosition);
          float fade = exp(-dist / uFade) * smoothstep(150.0, 700.0, dist); // a wall the lens grazes is not a band across the picture
          float k = ${fill.toFixed(3)} + aline(vP.y + ${THICK.toFixed(1)}, 0.9) * ${edgeK.toFixed(3)};
          gl_FragColor = vec4(uColor * k * fade * on * uAmount, 1.0);
        }`,
    }),
  );
  mesh.renderOrder = 2;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── lines of light */

/**
 * A line of light along a straight path (`uO` + `uD` × u, u from the geometry), its width in PIXELS whatever its
 * distance: a core and a halo. It is lit where |u| < uHead, bright near the head and falling back to a steady line
 * behind it (`uSteady`): the crack across the slope (both ways from x = 0), the line under the chalet.
 */
function makeRibbon({ from, to, color, segments = 240, core = 1.6, halo = 9, steady = 0.9, trail = 1.9, decay = 180 }) {
  const u = [];
  const side = [];
  const index = [];
  for (let i = 0; i <= segments; i++) {
    const t = from + ((to - from) * i) / segments;
    for (const s of [-1, 1]) {
      u.push(t);
      side.push(s);
    }
    if (i < segments) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(u.length * 3), 3));
  geo.setAttribute("aU", new THREE.Float32BufferAttribute(u, 1));
  geo.setAttribute("aSide", new THREE.Float32BufferAttribute(side, 1));
  geo.setIndex(index);
  const uniforms = {
    uO: { value: V(0, 0, 0) }, uD: { value: V(1, 0, 0) }, uHead: { value: 0 }, uAmount: { value: 1 }, uColor: { value: color.clone() },
    uView: { value: VIEWPORT }, uHalf: { value: halo }, uCore: { value: core }, uSteady: { value: steady }, uTrail: { value: trail }, uDecay: { value: decay },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform vec3 uO, uD; uniform vec2 uView; uniform float uHalf;
        attribute float aU; attribute float aSide; varying float vU; varying float vPx;
        void main() {
          vec4 a = projectionMatrix * modelViewMatrix * vec4(uO + uD * aU, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(uO + uD * (aU + 10.0), 1.0);
          vU = aU;
          vPx = aSide * uHalf;
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (a.w > 1.0 && b.w > 1.0) {
            vec2 run = (b.xy / b.w - a.xy / a.w) * uView;
            float l = length(run);
            vec2 n = l > 1e-4 ? vec2(-run.y, run.x) / l : vec2(0.0, 1.0);
            a.xy += n * aSide * uHalf * 2.0 / uView * a.w;
            gl_Position = a;
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uHead, uAmount, uCore, uSteady, uTrail, uDecay;
        varying float vU; varying float vPx;
        void main() {
          float behind = uHead - abs(vU);
          float lit = smoothstep(0.0, 18.0, behind);
          float near = exp(-max(behind, 0.0) / uDecay);
          float d = abs(vPx);
          float core = 1.0 - smoothstep(uCore - 0.6, uCore + 0.6, d);
          float halo = exp(-d / 3.2) * near;
          float k = (core * (uSteady + uTrail * near) + halo * 0.7) * lit;
          gl_FragColor = vec4(uColor * min(k, 2.8) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/** A ball of light that has a place: a white-hot heart, a body of its colour, a long soft tail — always facing the eye,
 *  its size in centimetres, never under `min` nor over `max` pixels. Emission ≤ 3. */
function makeGlow({ color, radius = 30, min = 10, max = 90 }) {
  const uniforms = {
    uCenter: { value: V(0, 0, 0) }, uRadius: { value: radius }, uMin: { value: min }, uMax: { value: max }, uPx: { value: 1000 },
    uAmount: { value: 0 }, uColor: { value: color.clone() }, uHeart: { value: INK.clone() }, uView: { value: VIEWPORT },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform vec3 uCenter; uniform float uRadius, uMin, uMax, uPx; uniform vec2 uView;
        varying vec2 vUv;
        void main() {
          vec4 c = projectionMatrix * modelViewMatrix * vec4(uCenter, 1.0);
          float r = clamp(uRadius * uPx / max(c.w, 1.0), uMin, uMax);
          vUv = position.xy;
          c.xy += position.xy * r * 2.0 / uView * c.w;
          gl_Position = c.w > 1.0 ? c : vec4(2.0, 2.0, 2.0, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor, uHeart; uniform float uAmount;
        varying vec2 vUv;
        void main() {
          float r2 = dot(vUv, vUv);
          if (r2 > 1.0) discard;
          float heart = exp(-r2 / 0.006) * 1.3;
          float body = exp(-r2 / 0.05) * 0.95;
          float tail = exp(-sqrt(r2) / 0.3) * 0.28 * (1.0 - r2);
          gl_FragColor = vec4((uHeart * heart + uColor * (body + tail)) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── snow in flight: streaks only */

const STREAK_FRAG = /* glsl */ `
  uniform vec3 uColor; varying float vA; varying float vSide;
  void main() { gl_FragColor = vec4(uColor * vA * (1.0 - abs(vSide)), 1.0); }`;
// a quad from `a` (the tail) to `b` (the head), 3 px wide: the line a grain covers while the shutter is open
const STREAK_QUAD = /* glsl */ `
  bool streak(vec3 tail, vec3 head, vec2 corner, vec2 view, out vec4 pos, out float len, out float w) {
    vec4 a = projectionMatrix * modelViewMatrix * vec4(tail, 1.0);
    vec4 b = projectionMatrix * modelViewMatrix * vec4(head, 1.0);
    pos = vec4(2.0, 2.0, 2.0, 1.0);
    len = 0.0;
    w = 1.0;
    if (a.w < 40.0 || b.w < 40.0) return false;
    vec2 run = (b.xy / b.w - a.xy / a.w) * view * 0.5;
    len = length(run);
    vec2 n = len > 1e-3 ? vec2(-run.y, run.x) / len : vec2(0.0, 1.0);
    vec4 c = mix(a, b, corner.x);
    c.xy += n * corner.y * (3.0 / view) * c.w;
    pos = c;
    w = min(a.w, b.w);
    return true;
  }`;

function streakGeometry(count, perSeed) {
  const corner = [];
  const index = [];
  const seeds = [];
  for (let i = 0; i < count; i++) {
    const s = perSeed(i);
    for (const c of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
      corner.push(...c);
      seeds.push(...s);
    }
    index.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 3, i * 4 + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(count * 12), 3));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute(corner, 2));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 4));
  geo.setIndex(index);
  return geo;
}

/** The powder (`rush`), around you and above the flow: pale signal streaks that run downhill past you. Their place is
 *  driven by the slide (`uTravel`, cm), their length by its pace — never by the clock alone. */
function makePowder({ count = 640, seed = 41 }) {
  const rand = rng(seed);
  const min = [-1000, -30, -1500];
  const size = [2000, 330, 3100];
  const geo = streakGeometry(count, () => [rand(), 0.45 + rand() * 0.55, rand(), rand()]);
  const box = [];
  const r2 = rng(seed + 1);
  for (let i = 0; i < count; i++) {
    const p = [min[0] + r2() * size[0], min[1] + Math.pow(r2(), 1.6) * size[1], min[2] + r2() * size[2]];
    for (let k = 0; k < 4; k++) box.push(...p);
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(box, 3));
  const uniforms = {
    uTravel: { value: 0 }, uLen: { value: 0 }, uAmount: { value: 0 }, uShare: { value: 1 }, uColor: { value: SIG.clone().multiplyScalar(0.8).add(INK.clone().multiplyScalar(0.2)) },
    uMin: { value: V(...min) }, uSize: { value: V(...size) }, uView: { value: VIEWPORT }, uYouW: { value: V(0, 0, 0) },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uTravel, uLen, uAmount, uShare; uniform vec3 uMin, uSize; uniform vec2 uView;
        attribute vec4 aSeed; attribute vec2 aCorner; varying float vA; varying float vSide;
        ${STREAK_QUAD}
        void main() {
          float k = 0.65 + 0.7 * aSeed.x; // not all at one speed: that is the depth of the cloud
          vec3 p = position;
          p.z += uTravel * k;
          p.y += 18.0 * sin(uTravel * 0.0021 * k + aSeed.w * 6.2832);
          p = uMin + mod(p - uMin, uSize);
          vec3 q = (p - uMin) / uSize;
          float inside = smoothstep(0.0, 0.12, q.x) * smoothstep(1.0, 0.88, q.x) * smoothstep(0.0, 0.08, q.y) * smoothstep(1.0, 0.75, q.y) * smoothstep(0.0, 0.1, q.z) * smoothstep(1.0, 0.9, q.z);
          vec3 tail = p - vec3(0.0, 0.08, 1.0) * uLen * k;
          vec4 pos; float len; float w;
          vSide = aCorner.y;
          vA = 0.0;
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (aSeed.z < uShare && streak(tail, p, aCorner, uView, pos, len, w)) {
            gl_Position = pos;
            // never shorter than a streak (a dot hops), never a slab across the lens
            vA = aSeed.y * inside * uAmount * (1.0 - aCorner.x) * smoothstep(8.0, 40.0, len) * smoothstep(150.0, 500.0, w) * clamp(900.0 / w, 0.25, 1.0);
          }
        }`,
      fragmentShader: STREAK_FRAG,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 8;
  return { mesh, uniforms };
}

/** The jets of snow the crack throws, one a metre along it (still frame): each fires as the head of the crack passes
 *  it, rises and falls back over the next few metres of the crack's run — streaks along their own path. */
function makeJets({ seed = 77 }) {
  const rand = rng(seed);
  const anchors = [];
  for (let x = 35; x < HW; x += 70) anchors.push(x, -x);
  const per = 7;
  const count = anchors.length * per;
  const jet = [];
  const geo = streakGeometry(count, (i) => {
    const xa = anchors[Math.floor(i / per)];
    jet.push([xa + (rand() - 0.5) * 50, 25 + Math.pow(rand(), 0.7) * 110, (rand() - 0.3) * 110, (rand() - 0.5) * 70]);
    return [rand(), 0.5 + rand() * 0.5, rand(), 0];
  });
  const aJet = [];
  for (const j of jet) for (let k = 0; k < 4; k++) aJet.push(...j);
  geo.setAttribute("aJet", new THREE.Float32BufferAttribute(aJet, 4));
  const uniforms = {
    uHead: { value: 0 }, uSpan: { value: 380 }, uCrown: { value: CROWN }, uAmount: { value: 1 }, uColor: { value: SIG.clone().multiplyScalar(1.1).add(INK.clone().multiplyScalar(0.32)) },
    uView: { value: VIEWPORT },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uHead, uSpan, uCrown, uAmount; uniform vec2 uView;
        attribute vec4 aSeed; attribute vec4 aJet; attribute vec2 aCorner; varying float vA; varying float vSide;
        ${STREAK_QUAD}
        vec3 at(float u) {
          float uu = clamp(u, 0.0, 1.0);
          return vec3(aJet.x + aJet.w * uu, aJet.y * (1.0 - (2.0 * uu - 1.0) * (2.0 * uu - 1.0)), uCrown + 6.0 + aJet.z * uu);
        }
        void main() {
          float u = (uHead - abs(aJet.x) - aSeed.z * 50.0) / (uSpan * (0.7 + 0.6 * aSeed.x));
          vSide = aCorner.y;
          vA = 0.0;
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          vec4 pos; float len; float w;
          if (u > 0.0 && u < 1.0 && streak(at(u - 0.2), at(u), aCorner, uView, pos, len, w)) {
            gl_Position = pos;
            vA = aSeed.y * uAmount * (1.0 - aCorner.x) * smoothstep(8.0, 30.0, len) * pow(clamp(1.0 - u, 0.0, 1.0), 0.8) * smoothstep(0.0, 0.08, u);
          }
        }`,
      fragmentShader: STREAK_FRAG,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 8;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── what moves with you */

/** The slab cut loose (moving with you): its top, the same grid as the mountain (at travel 0 they are one), and its
 *  fissures — Voronoi borders that appear from the crown downhill and open by a finger (`slab`). */
function makePlate() {
  const geo = new THREE.PlaneGeometry(2 * HW, SLAB.bottom - CROWN, 1, 1).rotateX(-Math.PI / 2).translate(0, 0.4, (SLAB.bottom + CROWN) / 2);
  const uniforms = {
    uInk: { value: INK.clone() }, uSig: { value: SIG.clone() }, uAmount: { value: 1 }, uHalf: { value: 0 }, uSlab: { value: 0 }, uFlow: { value: 0 }, uFade: { value: 16000 },
    uYou: { value: V(0, 0, 0) },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec2 vG; varying vec3 vW;
        void main() { vG = position.xz; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uSig, uYou; uniform float uAmount, uHalf, uSlab, uFlow, uFade;
        varying vec2 vG; varying vec3 vW;
        ${GL}
        ${GL_MANTLE}
        void main() {
          float on = 1.0 - smoothstep(uHalf - 2.0, uHalf, abs(vG.x));
          // the flow takes over near you
          float foot = (1.0 - smoothstep(${(FLOW.halfWidth - 100).toFixed(1)}, ${(FLOW.halfWidth + 400).toFixed(1)}, abs(vG.x)))
            * smoothstep(${(-FLOW.back - 400).toFixed(1)}, ${(-FLOW.back).toFixed(1)}, vG.y) * (1.0 - smoothstep(${FLOW.ahead.toFixed(1)}, ${(FLOW.ahead + 400).toFixed(1)}, vG.y));
          on *= 1.0 - uFlow * foot;
          if (on * uAmount < 0.002) discard;
          float dist = length(vW - cameraPosition);
          float fade = exp(-dist / uFade);
          float g = max(max(level(vG, 100.0, 0.0) * 0.5, level(vG, 500.0, 0.0) * 0.7), level(vG, 2500.0, 0.0) * 0.9) * 0.17;
          // the fissures: borders of irregular cells, elongated across the slope
          vec2 cellP = vec2(vG.x / 270.0, (vG.y - ${CROWN.toFixed(1)}) / 205.0 + 0.37);
          float dc = voronoiEdge(cellP) * 235.0; // cm to the nearest border
          float cmPx = max(fwidth(dc), 1e-4);
          float open = uSlab * 1.8; // a finger, either side
          float hp = clamp(open / cmPx, 0.9, 1.25); // the secondary fissures stay fine lines: the step is the crack
          float fis = 1.0 - smoothstep(hp - 0.6, hp + 0.6, dc / cmPx);
          fis *= smoothstep(16.0, 44.0, 235.0 / cmPx); // far away the pattern would shimmer: it leaves
          float reach = uSlab * 5200.0;
          fis *= smoothstep(0.0, 0.12, uSlab) * (1.0 - smoothstep(reach * 0.7, reach + 1.0, vG.y - ${CROWN.toFixed(1)}));
          fis *= (1.0 - 0.75 * smoothstep(1500.0, 4500.0, dist)) * smoothstep(120.0, 450.0, dist); // far: a net; at the lens: zigzags
          vec3 col = uInk * (g + mantle(vW, vG, uYou)) + uSig * fis * (0.12 + 0.22 * uSlab);
          gl_FragColor = vec4(col * fade * on * uAmount, 1.0);
        }`,
    }),
  );
  mesh.renderOrder = 2;
  return { mesh, uniforms };
}

/** The flowing mass's free surface, around you (moving with you): a slow swell that the slide drives, a dim signal grid
 *  on it. It is glass: you stay seen through it. */
function makeFlowSurface() {
  const w = FLOW.halfWidth + 250;
  const s0 = -FLOW.back - 250;
  const s1 = FLOW.ahead + 250;
  const geo = new THREE.PlaneGeometry(2 * w, s1 - s0, 56, 80).rotateX(-Math.PI / 2).translate(0, 0, (s0 + s1) / 2);
  const uniforms = { uSig: { value: SIG.clone() }, uAmount: { value: 0 }, uFlow: { value: 0 }, uPh: { value: 0 }, uSlip: { value: 0 }, uYouW: { value: V(0, 0, 0) } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uFlow, uPh; varying vec2 vG; varying vec3 vW;
        ${GL_WAVE}
        void main() {
          vec3 p = position;
          p.y += waveSurf(p.x, p.z, uPh) * uFlow;
          vG = p.xz;
          vec4 w = modelMatrix * vec4(p, 1.0);
          vW = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uSig; uniform float uAmount, uSlip;
        varying vec2 vG; varying vec3 vW;
        ${GL}
        ${GL_CUT}
        void main() {
          if (cutAway(vW)) discard;
          float edge = (1.0 - smoothstep(${(FLOW.halfWidth - 50).toFixed(1)}, ${(FLOW.halfWidth + 250).toFixed(1)}, abs(vG.x)))
            * smoothstep(${(-FLOW.back - 250).toFixed(1)}, ${(-FLOW.back + 50).toFixed(1)}, vG.y) * (1.0 - smoothstep(${(FLOW.ahead - 50).toFixed(1)}, ${(FLOW.ahead + 250).toFixed(1)}, vG.y));
          float g = level(vec2(vG.x, vG.y - uSlip), 100.0, 0.0);
          gl_FragColor = vec4(uSig * (g * 0.11 + 0.01) * edge * uAmount, 1.0);
        }`,
    }),
  );
  mesh.renderOrder = 5;
  return { mesh, uniforms };
}

/** THE SECTION, in the plane x = 0 (the plane you stand in), seen from either side only (it melts away seen from the
 *  front): the slab's top and the weak layer (dashed, it is the still mountain: it scrolls), the old snowpack in bands,
 *  the step of the crown; once the avalanche runs, the flow's free surface (signal, irregular), its bed, and between
 *  them a hatch — the snow that moves. */
function makeSection() {
  const geo = new THREE.PlaneGeometry(5200, 420, 1, 1).rotateY(Math.PI / 2).translate(0, -125, 0);
  // after rotateY(+90): the plane's local x → −z… keep (s, h) as varyings from the vertex itself
  const uniforms = {
    uInk: { value: INK.clone() }, uSig: { value: SIG.clone() }, uAmount: { value: 1 }, uT: { value: 0 }, uFlow: { value: 0 }, uBed: { value: FLOW.bed },
    uSmear: { value: 0 }, uCrack: { value: 0 }, uPh: { value: 0 }, uYouW: { value: V(0, 0, 0) },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec2 vP; varying vec3 vW;
        void main() { vP = vec2(position.z, position.y); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uSig; uniform float uAmount, uT, uFlow, uBed, uSmear, uCrack, uPh;
        varying vec2 vP; varying vec3 vW;
        ${GL}
        ${GL_WAVE}
        ${GL_CUT}
        float painted(float z, float period, float on) { float k = floor(z / period); return k * on + min(z - k * period, on); }
        float dashes(float z, float period, float on, float smear) {
          float s = max(max(smear, fwidth(z) * 1.5), 1.0);
          return clamp((painted(z + 0.5 * s, period, on) - painted(z - 0.5 * s, period, on)) / s, 0.0, 1.0);
        }
        void main() {
          vec3 e = cameraPosition - uYouW;
          float side = smoothstep(0.55, 0.85, abs(e.x) / max(length(e), 1e-3));
          if (side * uAmount < 0.003) discard;
          float s = vP.x;
          float h = vP.y;
          float fk = smoothstep(0.0, 1.0, uFlow);
          float bedE = uBed * (0.35 + 0.65 * fk);
          float crownStill = ${CROWN.toFixed(1)} - uT;
          float inFlow = fk * smoothstep(${(-FLOW.back - 200).toFixed(1)}, ${(-FLOW.back).toFixed(1)}, s) * (1.0 - smoothstep(${FLOW.ahead.toFixed(1)}, ${(FLOW.ahead + 200).toFixed(1)}, s));
          float surf = waveSurf(0.0, s, uPh) * fk;
          // the old snowpack, in bands — not where the flow has dug it out
          float bands = 0.0;
          for (int i = 0; i < 4; i++) { float hb = -100.0 - 65.0 * float(i); bands += aline(h - hb, 0.9) * (0.11 - 0.018 * float(i)); }
          bands *= 1.0 - inFlow * step(bedE, h);
          // the weak layer (still: it scrolls), dashed and darker; brighter where the slab has uncovered it
          float bareStrip = step(crownStill, s) * step(s, ${CROWN.toFixed(1)});
          float weak = aline(h + ${THICK.toFixed(1)}, 0.9) * mix(dashes(s + uT, 46.0, 26.0, uSmear) * 0.09, 0.2, bareStrip) * (1.0 - inFlow * step(bedE, h + ${THICK.toFixed(1)}));
          // the slab's top: the moving slab below its crown, the still snow above the crown's step — not the bare strip
          float top = aline(h, 0.9) * 0.26 * clamp(step(${CROWN.toFixed(1)}, s) + step(s, crownStill), 0.0, 1.0) * (1.0 - inFlow);
          float step0 = step(-${THICK.toFixed(1)}, h) * step(h, 0.0);
          float crownLine = aline(s - crownStill, 1.1) * step0 * uCrack;
          float slabFace = aline(s - ${CROWN.toFixed(1)}, 0.9) * step0 * 0.3 * smoothstep(0.0, 12.0, uT) * (1.0 - fk);
          // the flow: its free surface, its bed, and the hatch of the moving snow between them
          float surfLine = aline(h - surf, 1.05) * inFlow;
          float bedLine = aline(h - bedE, 0.9) * inFlow;
          float between = step(bedE, h) * step(h, surf) * inFlow;
          float hatch = lineAA((s + h) / 26.0, 0.0) * between;
          float region = smoothstep(-2600.0, -2000.0, s) * (1.0 - smoothstep(2000.0, 2600.0, s)) * smoothstep(-330.0, -290.0, h);
          vec3 col = uInk * (bands + weak + top + slabFace) + uSig * (crownLine * 0.95 + surfLine * 0.62 + bedLine * 0.3 + hatch * 0.07 + between * 0.012);
          gl_FragColor = vec4(col * region * side * uAmount, 1.0);
        }`,
    }),
  );
  mesh.renderOrder = 4;
  return { mesh, uniforms };
}

/** The blocks of the broken slab: big, middle and small, ONE instanced geometry, all of it in the vertex shader. At
 *  `flow` 0 each is a flat chunk of slab lying in it; at 1 it has its own shape and tumbles (its angle ∝ `travel` over
 *  its size: the small ones spin faster); `sort` takes each from its mixed depth to its sorted one — the big on top,
 *  the small at the bed — moving ONLY up or down its own column; the columns of the big and middle blocks never
 *  overlap, nor a small grain's a bigger one's: nothing passes through anything. They keep out of your body (a
 *  capsule). Dark faces, signal edges drawn from each block's own box coordinates (≥ 1.8 px, gone on a grain too small
 *  to carry them), a lighter lip on top, a rim. */
function makeBlocks() {
  const rand = rng(29);
  const list = [];
  const reserved = (x, s, r) => Math.abs(x) < 80 + r && s > -150 - r && s < 170 + r;
  const clear = (x, s, r, among) => among.every((b) => Math.hypot(b.x - x, b.s - s) > b.r + r + 6);
  const place = (cls, dims, region, mixD, sortH, among, given) => {
    const r = 0.56 * Math.max(dims[0], dims[2]);
    let x = given?.x;
    let s = given?.s;
    if (x === undefined) {
      for (let k = 0; k < 60; k++) {
        x = region[0] + rand() * (region[1] - region[0]);
        s = region[2] + rand() * (region[3] - region[2]);
        if (!reserved(x, s, r) && clear(x, s, r, among)) break;
      }
    }
    const b = { cls, x, s, r, dims, mixD, sortH };
    list.push(b);
    return b;
  };
  const bigDims = (size) => [size, size * (0.4 + rand() * 0.08), size * (0.72 + rand() * 0.18)];
  const big = [];
  // the big ones the section sees (x > 0, s around you), and two on the other side for the shots from your right
  const given = [
    { x: 300, s: 60, size: 160, mix: 0.85 },
    { x: 390, s: -240, size: 140, mix: 0.5 },
    { x: 440, s: 340, size: 175, mix: 0.68 },
    { x: -270, s: 90, size: 170, mix: 0.55 },
    { x: -400, s: -280, size: 140, mix: 0.3 },
  ];
  for (let i = 0; i < BLOCKS.count.big; i++) {
    const g = given[i];
    const size = g ? g.size : BLOCKS.big[0] + rand() * (BLOCKS.big[1] - BLOCKS.big[0]);
    const dims = bigDims(size);
    big.push(place(2, dims, [-650, 650, -650, 1100], g ? g.mix : 0.25 + rand() * 0.6, -dims[1] * 0.22, big, g));
  }
  const mids = [];
  for (let i = 0; i < BLOCKS.count.mid; i++) {
    const size = BLOCKS.mid[0] + rand() * (BLOCKS.mid[1] - BLOCKS.mid[0]);
    const dims = [size, size * (0.5 + rand() * 0.15), size * (0.7 + rand() * 0.25)];
    const near = i < 24;
    mids.push(place(1, dims, near ? (i < 14 ? [60, 560, -380, 560] : [-520, 520, -480, 700]) : [-680, 680, -880, 1380], rand(), -(78 + rand() * 38), [...big, ...mids]));
  }
  const smalls = [];
  for (let i = 0; i < BLOCKS.count.small; i++) {
    const size = BLOCKS.small[0] + rand() * (BLOCKS.small[1] - BLOCKS.small[0]);
    const dims = [size, size * (0.6 + rand() * 0.4), size * (0.65 + rand() * 0.35)];
    const near = i < 500;
    smalls.push(place(0, dims, near ? (i < 380 ? [40, 540, -330, 520] : [-470, 0, -440, 640]) : [-690, 690, -880, 1380], rand(), -(168 + rand() * 40), [...big, ...mids]));
  }
  const all = [...big, ...mids, ...smalls];
  const box = new THREE.BoxGeometry(1, 1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = box.index;
  geo.setAttribute("position", box.attributes.position);
  geo.setAttribute("normal", box.attributes.normal);
  const aCol = [];
  const aDim = [];
  const aSpin = [];
  const aSeed = [];
  for (const b of all) {
    aCol.push(b.x, b.s, b.mixD, b.sortH);
    aDim.push(...b.dims);
    const ax = V(rand() - 0.5, rand() - 0.5, rand() - 0.5);
    ax.x += 1.4 * Math.sign(ax.x || 1); // they mostly roll about an axis across the slope (head over heels, like you)
    ax.normalize();
    aSpin.push(ax.x, ax.y, ax.z, (0.55 + rand() * 0.8) * (rand() < 0.8 ? 1 : -1));
    aSeed.push(rand(), rand(), rand(), b.cls);
  }
  geo.setAttribute("aCol", new THREE.InstancedBufferAttribute(new Float32Array(aCol), 4));
  geo.setAttribute("aDim", new THREE.InstancedBufferAttribute(new Float32Array(aDim), 3));
  geo.setAttribute("aSpin", new THREE.InstancedBufferAttribute(new Float32Array(aSpin), 4));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(aSeed), 4));
  geo.instanceCount = all.length;
  const uniforms = {
    uSig: { value: SIG.clone() }, uAmount: { value: 0 }, uT: { value: 0 }, uSort: { value: 0 }, uFlow: { value: 0 }, uBed: { value: FLOW.bed },
    uYouA: { value: V(0, 0, 0) }, uYouB: { value: V(0, 0, 0) }, uYouR: { value: 40 }, uYouW: { value: V(0, 0, 0) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uT, uSort, uFlow, uBed; uniform vec3 uYouA, uYouB; uniform float uYouR;
      attribute vec4 aCol; attribute vec3 aDim; attribute vec4 aSpin; attribute vec4 aSeed;
      varying vec3 vQ; varying vec3 vN; varying vec3 vW;
      mat3 rotAxis(vec3 a, float t) {
        float c = cos(t), s = sin(t), ic = 1.0 - c;
        return mat3(c + a.x * a.x * ic, a.y * a.x * ic + a.z * s, a.z * a.x * ic - a.y * s,
                    a.x * a.y * ic - a.z * s, c + a.y * a.y * ic, a.z * a.y * ic + a.x * s,
                    a.x * a.z * ic + a.y * s, a.y * a.z * ic - a.x * s, c + a.z * a.z * ic);
      }
      float h3(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      void main() {
        float fk = smoothstep(0.0, 1.0, uFlow);
        vec3 q = position;
        vQ = q;
        // a broken chunk, not a brick: each corner pushed its own way (the same push for the three faces it joins)
        vec3 c3 = sign(q) + aSeed.xyz * 9.0;
        vec3 jit = (vec3(h3(c3), h3(c3 + 3.1), h3(c3 + 7.7)) - 0.5) * 0.24;
        vec3 dims = mix(vec3(aDim.x, ${THICK.toFixed(1)}, aDim.z), aDim, fk);
        vec3 local = (q + jit) * dims;
        float ang = (aSpin.w * uT / max(aDim.x, 34.0) * 0.9 + aSeed.x * 6.2832) * fk;
        mat3 R = rotAxis(aSpin.xyz, ang);
        vec3 p = R * local;
        vN = R * normalize(normal / dims);
        float bedE = uBed * (0.35 + 0.65 * fk);
        float hTop = -dims.y * 0.22;
        float hBot = bedE + dims.y * 0.55;
        float hMix = mix(hTop, hBot, aCol.z);
        float hSort = aCol.w * (bedE / uBed);
        float h = mix(hMix, hSort, smoothstep(0.0, 1.0, uSort));
        h = mix(-${(THICK / 2).toFixed(1)}, h, fk);
        vec3 c = vec3(aCol.x, h, aCol.y);
        c.z += 9.0 * sin(uT * 0.0031 + aSeed.x * 6.2832) * fk;
        c.x += 5.0 * sin(uT * 0.0023 + aSeed.y * 6.2832) * fk;
        // out of your way: never inside your body
        vec3 ab = uYouB - uYouA;
        float t = clamp(dot(c - uYouA, ab) / max(dot(ab, ab), 1e-3), 0.0, 1.0);
        vec3 pc = uYouA + ab * t;
        vec3 d = c - pc;
        float L = length(d);
        float r = uYouR + 0.5 * max(dims.x, max(dims.y, dims.z));
        if (L < r) c = pc + (L > 1e-2 ? d / L : vec3(0.0, 1.0, 0.0)) * r;
        vec4 w = modelMatrix * vec4(c + p, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * vN);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSig; uniform float uAmount;
      varying vec3 vQ; varying vec3 vN; varying vec3 vW;
      ${GL_CUT}
      void main() {
        if (cutAway(vW)) discard;
        if (!gl_FrontFacing) { gl_FragColor = vec4(uSig * 0.006, uAmount); return; } // the inside of a block the section opens
        vec3 n = normalize(vN);
        vec3 v = normalize(cameraPosition - vW);
        vec3 L = normalize(vec3(-0.5, 0.75, 0.45));
        float diff = max(dot(n, L), 0.0);
        float rim = pow(clamp(1.0 - abs(dot(n, v)), 0.0, 1.0), 2.5);
        float top = smoothstep(0.55, 0.95, n.y);
        vec3 a = abs(vQ);
        vec3 fw = max(fwidth(vQ), vec3(1e-5));
        float e1; float e2; float px;
        if (a.x >= a.y && a.x >= a.z) { e1 = (0.5 - a.y) / fw.y; e2 = (0.5 - a.z) / fw.z; px = 1.0 / max(fw.y, fw.z); }
        else if (a.y >= a.z) { e1 = (0.5 - a.x) / fw.x; e2 = (0.5 - a.z) / fw.z; px = 1.0 / max(fw.x, fw.z); }
        else { e1 = (0.5 - a.x) / fw.x; e2 = (0.5 - a.y) / fw.y; px = 1.0 / max(fw.x, fw.y); }
        float edge = (1.0 - smoothstep(0.9, 1.9, min(e1, e2))) * smoothstep(6.0, 16.0, px);
        float k = 0.01 + 0.045 * diff + 0.07 * rim + 0.03 * top; // dark faces (the output is linear: 0.1 already reads mid-grey)
        vec3 col = uSig * (k + edge * (0.75 + 0.35 * top));
        gl_FragColor = vec4(col, uAmount);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms, list: all };
}

/** THE STEP the crack opens: the slab's slice (moving with you, at the crown), 40 cm of snow in signal — brightest at
 *  its top lip, falling to a darker foot — only where the crack has run; it drops as the slab gives way. */
function makeTranche() {
  const geo = new THREE.PlaneGeometry(2 * HW, THICK, 1, 1).translate(0, -THICK / 2, 0);
  const uniforms = { uSig: { value: SIG.clone() }, uInk: { value: INK.clone() }, uAmount: { value: 0 }, uHalf: { value: 0 }, uFade: { value: 9000 } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec2 vP; varying vec3 vW;
        void main() { vP = position.xy; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uSig, uInk; uniform float uAmount, uHalf, uFade;
        varying vec2 vP; varying vec3 vW;
        ${GL}
        void main() {
          float behind = uHalf - abs(vP.x);
          float on = smoothstep(0.0, 30.0, behind);
          if (on * uAmount < 0.002) discard;
          float dist = length(vW - cameraPosition);
          float fade = exp(-dist / uFade) * smoothstep(40.0, 160.0, dist);
          float up = clamp((vP.y + ${THICK.toFixed(1)}) / ${THICK.toFixed(1)}, 0.0, 1.0);
          float fill = 0.04 + 0.24 * up * up;
          float lip = aline(vP.y, 1.1);
          float foot = aline(vP.y + ${THICK.toFixed(1)}, 0.9) * 0.35;
          float hot = exp(-max(behind, 0.0) / 220.0); // fresh near the running head
          vec3 col = uSig * (fill * (0.7 + 0.6 * hot) + lip * 1.2 + foot) + uInk * lip * 0.25 * hot;
          gl_FragColor = vec4(col * fade * on * uAmount, 1.0);
        }`,
    }),
  );
  mesh.renderOrder = 3;
  return { mesh, uniforms };
}

/** THE POWDER CURTAIN: dense, bright streaks thrown up out of the crack along its whole run (still frame: it is the
 *  crown's), rising up to three metres and drifting back uphill — the threat behind you. Their rise is driven by the
 *  crack's run and the slide (`uPhase`, cm), never by the clock alone; streaks only, 3 px wide, never shorter than 8. */
function makeCurtain({ count = 2600, seed = 91 }) {
  const rand = rng(seed);
  const base = [];
  const geo = streakGeometry(count, (i) => {
    const wide = i >= 2100;
    const x = wide ? (rand() * 2 - 1) * HW : (rand() * 2 - 1) * Math.pow(rand(), 0.6) * 900; // densest near you
    const s = -150 + rand() * 170;
    for (let k = 0; k < 4; k++) base.push(x, 0, s);
    return [0.55 + rand() * 0.9, 0.45 + rand() * 0.55, rand(), rand()];
  });
  geo.setAttribute("position", new THREE.Float32BufferAttribute(base, 3));
  const uniforms = {
    uPhase: { value: 0 }, uHead: { value: 0 }, uLen: { value: 40 }, uAmount: { value: 0 }, uShare: { value: 0 }, uCrown: { value: CROWN },
    uColor: { value: SIG.clone().multiplyScalar(1.25).add(INK.clone().multiplyScalar(0.38)) }, uView: { value: VIEWPORT },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uPhase, uHead, uLen, uAmount, uShare, uCrown; uniform vec2 uView;
        attribute vec4 aSeed; attribute vec2 aCorner; varying float vA; varying float vSide;
        ${STREAK_QUAD}
        void main() {
          const float H = 270.0;
          float y = mod(uPhase * aSeed.x + aSeed.w * H, H);
          float u = y / H;
          // thrown up and back uphill, fanning out: a billow, not rain
          float sx = position.x >= 0.0 ? 1.0 : -1.0;
          vec3 vel = vec3(sx * 30.0 * aSeed.w, H * (0.6 + 0.3 * aSeed.x), -150.0 * aSeed.x);
          vec3 p = vec3(position.x, 0.0, uCrown + position.z) + vel * (u * (1.0 - 0.35 * u));
          p.x += 18.0 * sin(u * 3.0 + aSeed.w * 6.2832);
          vec3 dir = normalize(vel * (1.0 - 0.7 * u));
          vec3 tail = p - dir * uLen * (0.6 + 0.4 * aSeed.x) * (1.0 - 0.5 * u);
          vec4 pos; float len; float w;
          vSide = aCorner.y;
          vA = 0.0;
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (aSeed.z < uShare && streak(tail, p, aCorner, uView, pos, len, w)) {
            gl_Position = pos;
            float born = smoothstep(0.0, 60.0, uHead - abs(position.x));
            vA = aSeed.y * uAmount * born * (1.0 - aCorner.x) * smoothstep(8.0, 30.0, len) * smoothstep(0.0, 0.06, u) * pow(1.0 - u, 1.4)
              * smoothstep(120.0, 420.0, w) * clamp(1200.0 / w, 0.3, 1.0);
          }
        }`,
      fragmentShader: STREAK_FRAG,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 8;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── far: rocks, the crest, the chalet */

function makeRocks(seed = 13) {
  const rand = rng(seed);
  const group = new THREE.Group();
  const mat = glass(BRAND.ink, { base: 0.004, rim: 0.32, power: 2.2, edge: 0.42 });
  const meshes = [];
  const spots = [
    [-2100, -1800], [2300, -900], [-3000, 1200], [1950, 2600], [-2500, 4800], [3300, 6200], [-1900, 8800], [2600, 11500], [-3600, 14000], [4200, -2100],
  ];
  for (const [x, s] of spots) {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const k = 0.75 + 0.5 * Math.abs(Math.sin(p.getX(i) * 12.9 + p.getY(i) * 78.2 + p.getZ(i) * 37.7 + x) * 43758.5 % 1);
      p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
    }
    geo.computeVertexNormals();
    const sx = 260 + rand() * 380;
    const sy = 110 + rand() * 170;
    const sz = 240 + rand() * 360;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(sx, sy, sz);
    mesh.rotation.y = rand() * Math.PI;
    mesh.position.set(x, -sy * 0.35, s);
    const lines = edgesOf(geo, { color: BRAND.ink, width: 1.8, opacity: 0.32, threshold: 20 });
    mesh.add(lines);
    group.add(mesh);
    meshes.push(mesh);
  }
  asShell(meshes, 22);
  return { group, mat, edges: meshes.map((m) => m.children.find((c) => c.isLineSegments2)) };
}

/** The chalet of the next file (030, the earth electrode), far down on the valley floor: glass walls and roof, fine ink
 *  lines; under it a line of veille that goes down into the ground (no green-and-yellow: we have three colours). */
function makeChalet() {
  const group = new THREE.Group(); // upright in the world (world.js never turns it: the still frame is tilted, so it is turned back)
  group.rotation.x = -SLOPE * DEG;
  const w = VALLEY.w;
  const d = VALLEY.w * 0.78;
  const wallH = VALLEY.h * 0.52;
  const roofH = VALLEY.h * 0.48;
  const mat = glass(BRAND.ink, { base: 0.006, rim: 0.3, power: 2.4, edge: 0.4 });
  const walls = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, d).translate(0, wallH / 2, 0), mat);
  const shape = new THREE.Shape([new THREE.Vector2(-w / 2 - 60, 0), new THREE.Vector2(w / 2 + 60, 0), new THREE.Vector2(0, roofH)]);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: d + 120, bevelEnabled: false }).translate(0, wallH, -(d + 120) / 2), mat);
  const lineMats = [];
  for (const m of [walls, roof]) {
    const e = edgesOf(m.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.6 });
    lineMats.push(e.material);
    m.add(e);
  }
  // a door and two windows, as lines
  const facade = d / 2 + 1;
  const outline = (pts) => fatLine(pts, { color: BRAND.ink, width: 1.8, opacity: 0.45 });
  const door = outline([[-60, 0, facade], [-60, 210, facade], [60, 210, facade], [60, 0, facade]]);
  const win1 = outline([[-330, 120, facade], [-330, 250, facade], [-190, 250, facade], [-190, 120, facade], [-330, 120, facade]]);
  const win2 = outline([[190, 120, facade], [190, 250, facade], [330, 250, facade], [330, 120, facade], [190, 120, facade]]);
  for (const l of [door, win1, win2]) lineMats.push(l.material);
  group.add(walls, roof, door, win1, win2);
  asShell([walls, roof], 23);
  // the line into the ground: from the wall's foot, straight down
  const earth = makeRibbon({ from: 0, to: 1100, color: VEI, segments: 60, core: 1.5, halo: 8, steady: 1.0, trail: 1.6, decay: 160 });
  earth.uniforms.uO.value.set(w / 2 - 80, 0, d / 2 - 40);
  earth.uniforms.uD.value.set(0, -1, 0);
  const head = makeGlow({ color: VEI, radius: 40, min: 8, max: 40 });
  group.add(earth.mesh, head.mesh);
  return { group, mat, lineMats, earth, head };
}

/* ───────────────────────────────────────────────────────────── you: skis and poles */

function skiGeometry() {
  const L = SKIS.len;
  const pts = [];
  const base = (z) => (z > 62 ? Math.pow((z - 62) / 23, 2) * 9 : z < -68 ? Math.pow((-68 - z) / 17, 2) * 3 : 0);
  const zs = [];
  for (let z = -L / 2; z <= L / 2 + 0.01; z += 5) zs.push(z);
  for (const z of zs) pts.push([z, base(z)]);
  for (const z of [...zs].reverse()) pts.push([z, base(z) + 1.8]);
  return plate(pts, SKIS.w, { bevel: 0.5, round: 1 }).rotateY(-Math.PI / 2).translate(SKIS.w / 2, 0, 0);
}

/* ───────────────────────────────────────────────────────────── the set */

export function buildSlope() {
  const group = new THREE.Group();
  const sky = makeSky();
  group.add(sky.mesh);
  const slope = new THREE.Group(); // the slope's frame: +z (s) goes downhill, +y (h) out of the snow
  slope.rotation.x = SLOPE * DEG;
  group.add(slope);
  const still = new THREE.Group(); // the mountain that does not move: slid uphill past you by `travel`
  slope.add(still);

  const mountain = makeMountain();
  const bed = makeBed();
  const wall = makeFace(INK, 0.01, 0.22); // the still snow's edge, uphill of the gap
  wall.mesh.position.z = CROWN;
  const crackLine = makeRibbon({ from: -HW, to: HW, color: SIG, segments: 520, core: 2.1, halo: 12, steady: 1.0, trail: 1.7 });
  crackLine.uniforms.uO.value.set(0, 0.8, CROWN);
  const heads = [makeGlow({ color: SIG, radius: 26, min: 9, max: 70 }), makeGlow({ color: SIG, radius: 26, min: 9, max: 70 })];
  const jets = makeJets({});
  const rocks = makeRocks();
  const crestPts = [];
  for (let i = 0; i <= 48; i++) {
    const x = -GRID_X + (2 * GRID_X * i) / 48;
    crestPts.push([x, 25 * Math.sin(x * 0.0011) + 12 * Math.sin(x * 0.0037 + 1), CREST]);
  }
  const crest = fatLine(crestPts, { color: BRAND.ink, width: 2, opacity: 0.42 });
  const chalet = makeChalet();
  const chaletS = VALLEY.chalet[2];
  chalet.group.position.set(VALLEY.chalet[0], mountain.heightAt(chaletS), chaletS);
  const curtain = makeCurtain({});
  still.add(curtain.mesh, mountain.mesh, bed.mesh, wall.mesh, crackLine.mesh, heads[0].mesh, heads[1].mesh, jets.mesh, rocks.group, crest, chalet.group);
  const dress = dressSlope({ heightAt: mountain.heightAt });
  still.add(dress.group);

  const plateM = makePlate();
  const slabFace = makeTranche(); // the slab's slice, in signal: the step
  const surface = makeFlowSurface();
  const section = makeSection();
  const blocks = makeBlocks();
  const powder = makePowder({});
  slope.add(plateM.mesh, slabFace.mesh, surface.mesh, section.mesh, blocks.mesh, powder.mesh);

  /* ── you ── */
  const fig = makeFigure({ hands: "real", shell: true });
  const youRoot = new THREE.Group(); // the pivot: your chest
  youRoot.add(fig.group);
  group.add(youRoot);
  const CHEST = YOU.chest[1];
  fig.group.position.set(0, -CHEST, 0);
  const skiMat = glass(BRAND.ink, { base: 0.012, rim: 0.42, power: 2.2, edge: 0.6, spec: 0.5 });
  const skiGeo = skiGeometry();
  const skis = ["L", "R"].map(() => {
    const m = new THREE.Mesh(skiGeo, skiMat);
    const e = edgesOf(skiGeo, { color: BRAND.ink, width: 1.8, opacity: 0.55 });
    m.add(e);
    fig.group.add(m);
    return m;
  });
  const skiEdgeMat = skis[0].children[0].material;
  skis[1].children[0].material = skiEdgeMat;
  const poleMat = glass(BRAND.ink, { base: 0.01, rim: 0.4, power: 2.2, edge: 0.55 });
  const poleGeo = new THREE.CylinderGeometry(0.9, 0.7, 1, 10, 1).translate(0, -0.5, 0);
  const basketGeo = new THREE.TorusGeometry(4.2, 0.6, 6, 18).rotateX(Math.PI / 2);
  const poles = ["L", "R"].map(() => {
    const g = new THREE.Group();
    const shaft = new THREE.Mesh(poleGeo, poleMat);
    const basket = new THREE.Mesh(basketGeo, poleMat);
    g.add(shaft, basket);
    fig.group.add(g);
    return { g, shaft, basket };
  });
  asShell([...skis, ...poles.flatMap((p) => [p.shaft, p.basket])], 21);

  const A = {
    you: new THREE.Object3D(), head: new THREE.Object3D(), pack: new THREE.Object3D(), hand: new THREE.Object3D(),
    skis: new THREE.Object3D(), surface: new THREE.Object3D(), crown: new THREE.Object3D(), chalet: new THREE.Object3D(),
  };
  A.you.position.set(0, YOU.chest[1] - fig.HIP, 7);
  fig.torso.add(A.you);
  A.pack.position.set(...PACK_ON_TORSO);
  fig.torso.add(A.pack);
  fig.head.add(A.head);
  fig.group.add(A.hand, A.skis);
  slope.add(A.surface);
  still.add(A.crown);
  A.crown.position.set(0, 0, CROWN);
  chalet.group.add(A.chalet);
  A.chalet.position.set(0, VALLEY.h * 0.5, 0);

  /* ── scratch (no allocation in update) ── */
  const DOWN = V(0, -S, C); // downhill along the surface, in the world (and in your frame standing)
  const tA = V(0, 0, 0);
  const tB = V(0, 0, 0);
  const tC = V(0, 0, 0);
  const toe = V(0, 0, 0);
  const fwd = V(0, 0, 1);
  const handleP = V(0, 0, 0);
  const handleAxis = V(1, 0, 0);
  const palm = V(0, 0, 0);
  const fingers = V(0, 0, 0);
  const restBar = V(0, 0, 0);
  const off = V(0, 0, 0);
  const upY = V(0, 1, 0);
  const wristL = V(0, 0, 0);
  const wristR = V(0, 0, 0);
  const ankle = V(0, 0, 0);
  const qTmp = new THREE.Quaternion();
  const youW = V(0, 0, 0);
  const headW = V(0, 0, 0);
  const feetW = V(0, 0, 0);
  const toSlope = (w, out) => out.set(w.x, w.y * C + w.z * S, -w.y * S + w.z * C); // world → slope frame (x, h, s)
  const SIDES = ["L", "R"];
  const AROUND = [blocks.uniforms, surface.uniforms, section.uniforms, powder.uniforms];
  const HOLD = { palm, dir: fingers, k: 0, bar: 1.3 };
  let lastTime = -1;
  let lastTravel = 0;
  let lastPhase = 0;
  let vTravel = 0; // cm/s, measured between the calls of one frame
  let vPhase = 0;

  /** Your limbs, posed from the numbers. All in the figure's own frame. */
  function pose(fallE, roll, bury, reach, pull, crouch) {
    const curl = sstep(0.35, 1, bury) * fallE;
    const a = roll * Math.PI * 2;
    fig.lean(14 * (1 - fallE) + 30 * curl, 0, 0);
    // legs: on the skis (knees bent, ankles flexed along the fall line) · thrown about by the roll · drawn up, curled
    for (let i = 0; i < 2; i++) {
      const s = SIDES[i];
      const sx = i ? -1 : 1;
      const ph = i ? 2.1 : 0;
      const standX = sx * 10;
      const fx = sx * (11 + 9 * Math.sin(a + ph));
      const fy = 14 + 12 * Math.sin(a * 1.0 + ph + 1.1);
      const fz = 10 + 20 * Math.sin(a * 2.0 + ph);
      ankle.set(mix(standX, fx, fallE), mix(8.5 + crouch, fy, fallE), mix(3, fz, fallE));
      ankle.set(mix(ankle.x, sx * 11, curl), mix(ankle.y, 62, curl), mix(ankle.z, 36, curl));
      toe.copy(DOWN).lerp(tC.set(0, -0.35, 1), fallE).normalize();
      fig.leg(s, ankle, fwd, toe);
    }
    // arms
    const hang = 1 - fallE; // the hands hold the poles while you stand
    for (let i = 0; i < 2; i++) {
      const s = SIDES[i];
      const sx = i ? -1 : 1;
      const ph = i ? 1.3 : 4.0;
      const w = s === "L" ? wristL : wristR;
      w.set(
        mix(sx * 26, sx * (36 + 14 * Math.sin(a * 1.0 + ph)), fallE),
        mix(100, 150 + 26 * Math.sin(a * 2.0 + ph + 0.7), fallE),
        mix(20, 10 + 22 * Math.sin(a + ph + 2.0), fallE),
      );
      w.set(mix(w.x, sx * 13, curl), mix(w.y, 158, curl), mix(w.z, 25, curl));
    }
    // the right one goes out as a counterweight while the left goes to the handle
    const rK = sstep(0, 1, reach);
    wristR.set(mix(wristR.x, -50, rK), mix(wristR.y, 132, rK), mix(wristR.z, -8, rK));
    fig.grip("R", 0.35 + 0.4 * hang * (1 - rK));
    fig.reach("R", wristR);
    if (reach > 0.002) {
      // the handle, in the torso's frame (the pack's frame + PACK_ON_TORSO, no rotation), drawn down and out by `pull`
      handleP.set(PACK_ON_TORSO[0] + HANDLE.at[0], PACK_ON_TORSO[1] + HANDLE.at[1], PACK_ON_TORSO[2] + HANDLE.at[2] + 1.0);
      handleP.addScaledVector(off.set(...HANDLE.dir), HANDLE.pull * pull);
      fig.torso.updateMatrix();
      handleP.applyMatrix4(fig.torso.matrix);
      handleAxis.set(1, 0, 0).applyQuaternion(fig.torso.quaternion);
      palm.set(0, 0, -1).applyQuaternion(fig.torso.quaternion);
      fingers.set(0, -1, 0).applyQuaternion(fig.torso.quaternion);
      // from where the hand was (a bar held there), along the way, to the handle — it closes on the last stretch
      restBar.copy(wristL).add(off.set(0, -6, 4));
      restBar.lerp(handleP, sstep(0, 1, reach));
      HOLD.k = sstep(0.7, 1, reach);
      fig.hold("L", restBar, handleAxis, HOLD);
    } else {
      fig.grip("L", 0.35 + 0.4 * hang);
      fig.reach("L", wristL);
    }
  }

  return {
    group, A, fig,
    update(P, time, px) {
      const { shell = 1, crack = 0, slab = 0, travel = 0, rush = 0, flow = 0, sort = 0, you = 1, fall = 0, roll = 0, bury = 0, reach = 0, pull = 0, teaser = 0 } = P;
      const T = Math.max(0, travel) * 100; // cm
      const head = crackHead(crack);
      const phase = T * 1.2 + head * 0.25; // the powder's run: the slide, and the crack while it runs
      const dt = time - lastTime;
      if (dt > 1e-5 && dt < 0.006) {
        vTravel = (T - lastTravel) / dt;
        vPhase = (phase - lastPhase) / dt;
      }
      lastTime = time;
      lastTravel = T;
      lastPhase = phase;
      const perFrame = Math.abs(vTravel) / 30; // cm the mountain slides in one frame
      const fk = sstep(0, 1, flow);

      /* the still mountain */
      still.position.z = -T;
      sky.uniforms.uAmount.value = shell;
      sky.uniforms.uTravel.value = T;
      mountain.uniforms.uAmount.value = shell;
      mountain.uniforms.uSmear.value = perFrame;
      mountain.uniforms.uHole.value.set(crack > 0 ? head : 0, CROWN, SLAB.bottom + T, 0);
      bed.uniforms.uAmount.value = shell * sstep(0, 8, T);
      bed.uniforms.uSmear.value = perFrame;
      bed.uniforms.uHalf.value = head;
      bed.uniforms.uTo.value = CROWN + T;
      // the gap the crack opens: the still lip stands uphill of the slab's slice
      const gap = crack > 0 ? 3 + 9 * slab : 0;
      const drop = 12 * slab * (1 - fk);
      wall.mesh.position.z = CROWN - gap;
      wall.uniforms.uAmount.value = shell * (crack > 0 ? 1 : 0);
      wall.uniforms.uHalf.value = head;
      crackLine.uniforms.uO.value.z = CROWN - gap;
      jets.uniforms.uCrown.value = CROWN - gap;
      curtain.uniforms.uCrown.value = CROWN - gap;
      curtain.uniforms.uHead.value = head;
      curtain.uniforms.uPhase.value = head * 0.45 + T; // a fast crack: the billow climbs at most ~1/8 of its height a frame
      curtain.uniforms.uLen.value = Math.min(220, Math.max(Math.abs(vPhase) / 30 * 1.4, 30 + 60 * rush));
      curtain.uniforms.uAmount.value = sstep(0, 0.5, rush) * (0.55 + 0.45 * rush) * (1 - sstep(1500, 4000, T));
      curtain.uniforms.uShare.value = 0.15 + 0.85 * rush;
      curtain.mesh.visible = crack > 0 && rush > 0.003;
      crackLine.uniforms.uHead.value = head;
      crackLine.uniforms.uAmount.value = crack > 0 ? 1 : 0;
      crackLine.mesh.visible = crack > 0;
      const glowOn = sstep(0, 0.015, crack) * (1 - sstep(0.94, 1, crack));
      for (let i = 0; i < 2; i++) {
        heads[i].uniforms.uCenter.value.set((i ? -1 : 1) * head, 3, CROWN - gap);
        heads[i].uniforms.uAmount.value = glowOn;
        heads[i].uniforms.uPx.value = px;
        heads[i].mesh.visible = glowOn > 0.003;
      }
      jets.uniforms.uHead.value = head + T * 0.6;
      jets.mesh.visible = crack > 0;
      rocks.mat.uniforms.uAmount.value = shell;
      for (const e of rocks.edges) if (e) e.material.opacity = 0.32 * shell;
      crest.material.opacity = 0.42 * shell;
      dress.update({ shell }, time, px);

      /* the chalet of the next file */
      const tOn = sstep(0.05, 0.6, teaser);
      chalet.group.visible = teaser > 0.01;
      chalet.mat.uniforms.uAmount.value = tOn;
      for (const m of chalet.lineMats) m.opacity = (m.userData.base ?? 0.6) * tOn;
      const line = sstep(0.6, 1, teaser);
      chalet.earth.uniforms.uHead.value = 1100 * line;
      chalet.earth.mesh.visible = line > 0.001;
      chalet.head.uniforms.uCenter.value.set(VALLEY.w / 2 - 80, -1100 * line, VALLEY.w * 0.39 - 40);
      chalet.head.uniforms.uAmount.value = line * (1 - sstep(0.97, 1, line) * 0.6);
      chalet.head.uniforms.uPx.value = px;
      chalet.head.mesh.visible = line > 0.001;

      /* the slab cut loose, moving with you */
      plateM.uniforms.uAmount.value = shell * (crack > 0 ? 1 : 0);
      plateM.uniforms.uHalf.value = head;
      plateM.uniforms.uSlab.value = slab;
      plateM.uniforms.uFlow.value = fk;
      plateM.mesh.visible = crack > 0;
      plateM.mesh.position.y = -drop;
      slabFace.mesh.position.set(0, -drop, CROWN);
      slabFace.uniforms.uAmount.value = (crack > 0 ? 1 : 0) * (1 - fk);
      slabFace.uniforms.uHalf.value = head;

      /* you */
      youRoot.visible = you > 0.01;
      const fallE = sstep(0, 1, fall);
      const crouch = 13 * (1 - fallE);
      pose(fallE, roll, bury, reach, pull, crouch);
      const hc = YOU.lying + (YOU.chestDown - YOU.lying) * bury;
      tA.set(0, CHEST - crouch, 0); // standing: the chest above your boots
      tB.set(0, hc * C, hc * S); // lying: in the flow, chest up (slopePt(0, hc, 0))
      youRoot.position.lerpVectors(tA, tB, fallE);
      youRoot.rotation.set(-(90 - SLOPE) * DEG * fallE - Math.PI * 2 * roll, 0, 0);
      fig.group.position.y = -CHEST;
      // the skis on the feet, the poles in the hands (they go once you are down, or once the left hand leaves)
      for (let i = 0; i < 2; i++) {
        const foot = fig.legs[SIDES[i]].foot;
        skis[i].quaternion.copy(foot.quaternion);
        skis[i].position.copy(foot.position).add(off.set(0, -5.2, -4).applyQuaternion(foot.quaternion));
      }
      skiMat.uniforms.uAmount.value = 1 - 0.85 * fallE; // down in the flow, your skis are no longer the subject
      skiEdgeMat.opacity = 0.55 * (1 - 0.9 * fallE);
      const poleOn = (1 - fallE) * (1 - sstep(0, 0.4, reach));
      poleMat.uniforms.uAmount.value = poleOn;
      for (let i = 0; i < 2; i++) {
        const s = SIDES[i];
        const p = poles[i];
        p.g.visible = poleOn > 0.01;
        if (!p.g.visible) continue;
        const grip = fig.arms[s].at;
        tA.copy(grip).add(off.set(0, -1, 3));
        tB.set(s === "L" ? 34 : -34, crouch + 2 + 16 * S / C, -16); // the tip, in the snow beside and behind you
        tC.subVectors(tA, tB);
        const len = tC.length();
        p.g.position.copy(tA);
        p.g.quaternion.setFromUnitVectors(upY, tC.normalize());
        p.shaft.scale.set(1, len, 1);
        p.basket.position.set(0, -len + 9, 0);
      }
      A.hand.position.copy(fig.arms.L.at);
      A.skis.position.set(0, crouch + 2, 4);

      /* where you are, for what flows around you */
      youRoot.updateMatrixWorld(true);
      fig.torso.getWorldPosition(tC);
      A.you.getWorldPosition(youW);
      fig.head.getWorldPosition(headW);
      feetW.copy(fig.legs.L.foot.position).add(fig.legs.R.foot.position).multiplyScalar(0.5);
      fig.group.localToWorld(feetW);
      toSlope(headW, tA);
      toSlope(feetW, tB);
      blocks.uniforms.uYouA.value.copy(tA);
      blocks.uniforms.uYouB.value.copy(tB);
      blocks.uniforms.uYouR.value = 34;
      for (let i = 0; i < AROUND.length; i++) AROUND[i].uYouW.value.copy(youW);
      mountain.uniforms.uYou.value.copy(youW);
      plateM.uniforms.uYou.value.copy(youW);

      /* the flow */
      const ph = T * 0.003;
      blocks.uniforms.uAmount.value = sstep(0.02, 0.3, flow);
      blocks.mesh.visible = flow > 0.02;
      blocks.uniforms.uT.value = T;
      blocks.uniforms.uSort.value = sort;
      blocks.uniforms.uFlow.value = flow;
      surface.uniforms.uAmount.value = shell * fk;
      surface.uniforms.uFlow.value = fk;
      surface.uniforms.uPh.value = ph;
      surface.uniforms.uSlip.value = T * 0.12;
      surface.mesh.visible = fk > 0.003;
      section.uniforms.uAmount.value = shell;
      section.uniforms.uT.value = T;
      section.uniforms.uFlow.value = flow;
      section.uniforms.uSmear.value = Math.max(perFrame, rush * 6);
      section.uniforms.uCrack.value = crack > 0 ? 1 : 0;
      section.uniforms.uPh.value = ph;
      powder.uniforms.uTravel.value = phase;
      powder.uniforms.uLen.value = Math.min(260, Math.max(Math.abs(vPhase) / 30 * 1.6, rush * 45)); // flying snow is never a dot (a still frame too)
      powder.uniforms.uAmount.value = rush;
      powder.uniforms.uShare.value = 0.25 + 0.75 * rush;
      powder.mesh.visible = rush > 0.003;
      jets.uniforms.uAmount.value = 0.6 + 0.4 * clamp01(rush * 2 + 0.3);
      A.surface.position.set(0, waveSurf(0, 0, ph) * fk, 0);
    },
  };
}
