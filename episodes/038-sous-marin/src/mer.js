// DOSSIER 038 — Sous-marin : THE SEA, THE ROCK, THE MOUNTAIN, THE SURFACE (docs/038-decors.md, « src/mer.js »).
//
//   buildMer() → { group, A, update(P, time, px), fog(d) }
//   group  added by world.js at the origin (the boat). THE SEA MOVES, the boat does not (plan.js): the surface at
//          y = +depth·100, the rock's contact point at y = (depth − ROCK.depth)·100 and x = SUB.bow − gap·100.
//   A      anchors (Object3D, moving with the sea): contact (the point of the rock the bow hits), summit (the
//          seamount's top), surface (the surface right above the boat)
//   P      { sea, depth, gap, speed, rush, rock, mount, sky, mood, pitch? }  (meaning: FIRST in world.js; `pitch` is
//          optional — when world.js passes it, the foam follows the boat's attitude)
//   fog(d) the fog's density for a camera at distance d (034's), and what depends on how far the camera stands
//
// What it draws, all of it X-ray, nothing solid, no blue (the night is black):
//   · 034's Atlantic, imported as it is (034-boite-noire/src/fond.js, never edited): its marine snow (rising /
//     falling / floating), its surface seen from below, its bottom in lines. ITS WRECK IS NOT OURS and is taken out
//     of its group once built: the tail section (fond.A.tail) and the rings' box (the Groups hung on fond.group
//     other than its sea), the debris (the Groups inside its sea), the box's point (the Points with `uPx`), the
//     reach's dome (the Mesh with `uReach`). Its snow layers are found by their `uDir` uniform.
//   · the snow that STREAKS along the boat (`speed`): two layers (a near cube, a wide one) whose motes run toward
//     +x as streaks — 034's snow only runs vertically. 034's own layers give way to them as `speed` grows.
//   · THE WALL (ROCK): the seamount's flank coming out of the black beyond the bow. Not a rock: its relief told by
//     lines — wavy strata at two scales, the contours of its lumps and ledges, a few boulders of glass with their
//     edges; a glass that shows only where the face turns away (the shoulder at its top, its sides); under `mood`
//     that rim is signal, and the strata around the point the bow will hit warm to signal. Fine and dark: the boat
//     is the subject. At the shock (`gap` 0), sediment drifts off the face around the contact.
//   · THE WHOLE SEAMOUNT (`mount`): contour rings from the bottom (3 900 m) to the summit (90 m), a flat top, flanks
//     flaring at the foot, lumpy the same way at every level (ridges), a few ridge lines, a faint glass for its
//     silhouette. Schematic: a shape read as « a mountain », no relief invented.
//   · THE SURFACE FROM THE SIDE (`sky`): a water plane of fine swell lines (seen from above; from below, a faint
//     mirror as the boat climbs near it), a low dark sky — a faint light off the horizon, three bands of cloud in
//     strokes —, and the FOAM where the hull breaks the water: a ring around the section of the hull (and of the
//     sail, while only the sail breaks it) at the waterline, computed from SUB / SAIL. The boat never leaps out.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, asShell, lineMat, edgesOf } from "@kit/build3d.js";
import { buildFond } from "../../034-boite-noire/src/fond.js"; // 034's Atlantic at night (imported as it is, never edited)
import { SUB, SAIL, ROCK, SEAMOUNT } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/* ───────────────────────────── noise (JS, for the geometry built once) ───────────────────────────── */
const hash = (i, j) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
function vnoise(x, y) {
  const i = Math.floor(x), j = Math.floor(y);
  const fx = x - i, fy = y - j;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
const fbm = (x, y) => vnoise(x, y) * 0.55 + vnoise(x * 2.1 + 5.2, y * 2.1 + 1.3) * 0.3 + vnoise(x * 4.3 + 9.1, y * 4.3 + 3.7) * 0.15;

function segments(list, material, parent, order = 2) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(list);
  const lines = new LineSegments2(geo, material);
  lines.frustumCulled = false;
  lines.renderOrder = order;
  parent.add(lines);
  return lines;
}

/* ───────────────────────────── shaders ───────────────────────────── */
// (034's NOISE, copied: fond.js does not export it)
const NOISE = /* glsl */ `
  float hash2(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), u.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) { return vnoise(p) * 0.6 + vnoise(p * 2.03 + 3.1) * 0.27 + vnoise(p * 4.1 + 7.7) * 0.13; }
  // an anti-aliased line on the integer levels of h, faded where the levels crowd under the pixel
  float levels(float h) {
    float fw = max(fwidth(h), 1e-5);
    float f = fract(h);
    float d = min(f, 1.0 - f) / fw;
    return (1.0 - smoothstep(0.55, 1.5, d)) * (1.0 - smoothstep(0.18, 0.45, fw));
  }
`;

// THE SNOW THAT STREAKS: 034's snow shader, its run turned into any constant velocity (here +x, along the boat)
const streakMat = ({ cube, near, vel, streak, gain }) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uAmount: { value: 0 }, uScale: { value: 1 }, uVel: { value: new THREE.Vector3(...vel) },
      uCube: { value: cube }, uNear: { value: near }, uStreak: { value: streak }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) },
      uColor: { value: INK.clone().multiplyScalar(gain) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime, uAmount, uScale, uCube, uNear, uStreak; uniform vec3 uVel; uniform vec2 uView;
      attribute vec4 aSeed; varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
      void main() {
        vec3 vel = uVel * (0.7 + 0.6 * aSeed.y);
        vec3 wob = vec3(sin(uTime * 0.37 * aSeed.y + aSeed.x * 6.28), cos(uTime * 0.29 * aSeed.y + aSeed.x * 4.1), sin(uTime * 0.33 + aSeed.x * 9.4)) * 2.5;
        vec3 lo = cameraPosition - 0.5 * uCube;
        vec3 p = position * uCube + vel * mod(uTime, 1000.0) + wob;
        p = lo + mod(p - lo, vec3(uCube));
        vec3 q = (p - lo) / uCube;
        float edge = smoothstep(0.0, 0.12, q.x) * smoothstep(1.0, 0.88, q.x) * smoothstep(0.0, 0.12, q.y) * smoothstep(1.0, 0.88, q.y) * smoothstep(0.0, 0.12, q.z) * smoothstep(1.0, 0.88, q.z);
        float near = smoothstep(uNear, uNear * 3.0, length(p - cameraPosition));
        vec4 mv = viewMatrix * vec4(p, 1.0);
        vec4 c0 = projectionMatrix * mv;
        vec4 c1 = projectionMatrix * viewMatrix * vec4(p - vel * uStreak, 1.0);
        vec2 runv = c1.w > 0.0 && c0.w > 0.0 ? (c0.xy / c0.w - c1.xy / c1.w) * 0.5 * uView : vec2(0.0);
        float len = min(length(runv), 150.0);
        float size = max(2.2, aSeed.z * uScale / max(0.5, -mv.z));
        gl_PointSize = size + len;
        gl_Position = c0;
        gl_Position.xy -= (len > 0.5 ? normalize(runv) * len : vec2(0.0)) / uView * c0.w;
        vDir = len > 0.5 ? normalize(runv) : vec2(1.0, 0.0);
        vDot = size / (size + len);
        vHalf = 0.5 * (1.0 - vDot);
        vA = aSeed.w * uAmount * edge * near * pow(clamp(vDot, 0.0, 1.0), 0.3);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
      void main() {
        if (vA < 0.002) discard;
        vec2 q = gl_PointCoord - 0.5;
        q.y = -q.y;
        float along = max(abs(dot(q, vDir)) - vHalf, 0.0);
        float across = dot(q, vec2(-vDir.y, vDir.x));
        float d = length(vec2(along, across)) / max(0.5 * vDot, 1e-3);
        float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.0);
        gl_FragColor = vec4(uColor * a * vA, 1.0);
      }`,
  });

// THE WALL: strata and relief contours, a glass that lights only where the face turns away, signal under `mood`
const rockMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uAmount: { value: 1 }, uMood: { value: 0 },
      uHot: { value: 2800 }, uLines: { value: 0.38 }, uRim: { value: 0.5 },
    },
    vertexShader: /* glsl */ `
      attribute float aRel; attribute float aEdge; attribute vec3 aMacro;
      varying vec3 vL; varying vec3 vW; varying vec3 vN; varying vec3 vM; varying float vRel; varying float vEdge;
      void main() {
        vL = position; vRel = aRel; vEdge = aEdge;
        vM = normalize(mat3(modelMatrix) * aMacro);
        vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSignal; uniform float uAmount, uMood, uHot, uLines, uRim;
      varying vec3 vL; varying vec3 vW; varying vec3 vN; varying vec3 vM; varying float vRel; varying float vEdge;
      ${NOISE}
      void main() {
        if (uAmount < 0.003 || vEdge < 0.003) discard;
        vec3 v = normalize(cameraPosition - vW);
        vec3 n = normalize(vN);
        if (dot(n, v) < 0.0) n = -n;
        // the rim: a crisp line where the face's own curve (not its relief) turns away from the eye, a soft glow near it
        float fd = dot(normalize(vM), v);
        float g = clamp(1.0 - abs(fd), 0.0, 1.0);
        float sil = 1.0 - smoothstep(0.8, 2.2, abs(fd) / max(fwidth(fd), 1e-5));
        // the strata: wavy beds at two scales (the fine one steps back where it would crowd under the pixel)
        vec2 q = vec2(vL.z, vL.y);
        float warp = fbm(q / 2600.0) * 0.9;
        float s1 = levels(vL.y / 430.0 + warp);
        float s2 = levels(vL.y / 1720.0 + warp * 0.25);
        // the relief: contours of the lumps, the ledges, the blocks
        float rel = levels(vRel / 120.0 + 0.5); // (+0.5: where the relief is calm, exactly 0, no level fills it)
        float lines = max(max(s1 * 0.75, s2), rel * 0.6);
        // a light from the boat's side, high: the ledges and lumps facing it read brighter
        float lam = clamp(dot(n, normalize(vec3(0.75, 0.55, 0.45))), 0.0, 1.0);
        float shade = 0.4 + 0.8 * lam;
        float dist = length(cameraPosition - vW);
        float far = 0.55 + 0.45 * exp(-dist / 30000.0);
        // the menace: where the bow will hit, the beds warm to signal; the face's rim is signal
        float hot = uMood * exp(-dot(q, q) / (uHot * uHot));
        vec3 lineCol = mix(uInk, uSignal, 0.8 * hot);
        float rim = 0.12 * pow(g, 6.0) + 0.9 * sil;
        vec3 rimCol = mix(uInk, uSignal, uMood);
        vec3 c = lineCol * (lines * uLines * shade * far + 0.008) + rimCol * rim * uRim;
        gl_FragColor = vec4(c * vEdge * uAmount, 1.0);
      }`,
  });

// THE SEDIMENT the shock shakes off the face: soft specks drifting off and sinking, periodic (alive at once)
const dustMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uScale: { value: 1 }, uTan: { value: Math.tan(ROCK.lean * DEG) }, uColor: { value: INK.clone().multiplyScalar(0.9) } },
    vertexShader: /* glsl */ `
      uniform float uTime, uAmount, uScale, uTan; attribute vec4 aSeed; varying float vA;
      void main() {
        float ph = fract(uTime * (0.07 + 0.06 * aSeed.y) + aSeed.x);
        float ang = aSeed.z * 6.2832;
        float rad = 250.0 + 1300.0 * aSeed.w;
        vec3 p0 = vec3(0.0, sin(ang) * rad * 0.7 - 150.0, cos(ang) * rad);
        p0.x = -p0.y * uTan + 30.0;
        vec3 p = p0 + vec3(ph * (120.0 + 260.0 * aSeed.y), -ph * ph * (450.0 + 600.0 * aSeed.w), (aSeed.x - 0.5) * 300.0 * ph);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = clamp((16.0 + 30.0 * aSeed.w) * uScale / max(1.0, -mv.z), 2.0, 8.0);
        vA = uAmount * sin(3.14159 * ph) * (0.35 + 0.65 * aSeed.y);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA;
      void main() {
        if (vA < 0.003) discard;
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = pow(clamp(1.0 - d, 0.0, 1.0), 1.6);
        gl_FragColor = vec4(uColor * a * vA, 1.0);
      }`,
  });

// THE WATER PLANE: swell lines (long crests and a finer chop, each fading where it would crowd), a glint at grazing
// angles (the horizon). Seen from above (`uAbove`) or from below (`uBelow`, a faint mirror as the boat nears it).
const waterMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uAbove: { value: 0 }, uBelow: { value: 0 }, uTime: { value: 0 }, uR: { value: 2400000 }, uSky: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAbove, uBelow, uTime, uR, uSky; varying vec3 vW;
      ${NOISE}
      float swell(vec2 p) {
        return (p.x * 0.8 + p.y * 0.6) / 1150.0 + 0.45 * sin(p.y / 1900.0 + uTime * 0.25) + 0.3 * sin(p.x / 1300.0 - uTime * 0.2) + 0.5 * fbm(p / 5200.0);
      }
      void main() {
        bool above = cameraPosition.y > vW.y;
        float amt = above ? uAbove : uBelow;
        if (amt < 0.003) discard;
        vec2 p = vW.xz;
        float dist = length(cameraPosition - vW);
        vec3 v = normalize(cameraPosition - vW);
        // from the side (sky on, the camera above it or at it): a crisp waterline at the horizon (the plane's far rim, 2 to
        // 4 px), the swell in strokes only next to it (its long crests, where they pile up), and away from it the water
        // dark: a few faint crests, broken
        float ay = abs(v.y);
        float near = exp(-ay / 0.02);
        float crest = levels(swell(p / 5.0)) * smoothstep(0.3, 0.55, fbm(p / 9000.0 + 3.0));
        float faint = levels(swell(p)) * smoothstep(0.58, 0.78, fbm(p / 4000.0 + 7.0));
        float r = length(vW.xz);
        float rim = 1.0 - smoothstep(2.0, 4.0, (uR - r) / max(fwidth(r), 1e-3));
        float c = crest * 0.3 * near + faint * 0.045 * (1.0 - near) + 0.55 * rim + 0.035 * exp(-ay / 0.006);
        if (!above && uSky < 0.997) {
          // from below while the boat climbs: the faint mirror, its swell and chop
          float l1 = levels(swell(p));
          float l2 = levels(swell(p * 3.3 + 31.0) + 0.2 * sin(uTime * 0.6 + p.x / 300.0)) * 0.55;
          float graze = pow(clamp(1.0 - ay, 0.0, 1.0), 10.0);
          c = mix(max(l1, l2) * 0.2 * exp(-dist / 60000.0) + 0.07 * graze, c, uSky);
        }
        gl_FragColor = vec4(uColor * c * amt, 1.0);
      }`,
  });

// THE WATER, DARK: the same plane, seen from above, dims what lies under it (the hull below the waterline, the sea);
// the boat's shells hold their depth, so what stands out of the water stays bright
const veilMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount; varying vec3 vW;
      void main() {
        if (uAmount < 0.003 || cameraPosition.y < vW.y) discard;
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAmount);
      }`,
  });

// THE LOW SKY: on a far cylinder over the sea — a faint light rising off the horizon, three bands of cloud in strokes
// (broken: strokes, not rings). Only while the camera is above the water.
const skyMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uSky: { value: 0 }, uSurf: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vL;
      void main() { vL = position; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uSky, uSurf, uTime; varying vec3 vW; varying vec3 vL;
      ${NOISE}
      void main() {
        float a = uSky * smoothstep(uSurf - 300.0, uSurf + 50.0, cameraPosition.y); // (a camera at the waterline sees it too)
        if (a < 0.003) discard;
        float y = vW.y - uSurf;
        float th = atan(vL.z, vL.x) + uTime * 0.0006;
        vec2 ring = vec2(cos(th), sin(th));
        float glow = 0.045 * exp(-max(y, 0.0) / 60000.0) * smoothstep(-2000.0, 4000.0, y);
        float lines = 0.0;
        for (int k = 0; k < 3; k++) {
          float fk = float(k);
          float H = 50000.0 + fk * 50000.0;
          float yk = H + 7000.0 * sin(th * (3.0 + fk) + fk * 1.7) + 10000.0 * (vnoise(ring * 4.5 + fk * 13.0) - 0.5);
          float u = (y - yk) / (3200.0 + 900.0 * fk);
          float band = 1.0 - smoothstep(1.6, 3.2, abs(u));
          // soft banks, not strokes (broken strokes over a horizon read as speed lines)
          float mass = smoothstep(0.45, 0.75, fbm(vec2(th * 40.0 + fk * 5.0, u * 0.8)));
          lines = max(lines, band * mass * (0.85 - 0.18 * fk));
        }
        float c = (glow + 0.055 * lines) * a;
        gl_FragColor = vec4(uColor * c, 1.0);
      }`,
  });

// THE FOAM: a ribbon around the section of the hull at the waterline — bright against the hull, frothing outward
const foamMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 0 }, uTime: { value: 0 }, uLoop: { value: 60 } },
    vertexShader: /* glsl */ `
      attribute float aSide; attribute float aS; varying float vSide; varying float vS;
      void main() { vSide = aSide; vS = aS; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uTime, uLoop; varying float vSide; varying float vS;
      ${NOISE}
      void main() {
        if (uAmount < 0.003) discard;
        float s = clamp(vSide, 0.0, 1.0);
        float froth = vnoise(vec2(vS * uLoop, s * 3.0 - uTime * 0.5)) * 0.6 + vnoise(vec2(vS * uLoop * 3.1 + 7.0, s * 7.0 + uTime * 0.4)) * 0.4;
        float core = pow(1.0 - s, 2.2);
        float lace = smoothstep(0.45, 0.75, froth) * pow(1.0 - s, 0.8) * 0.6;
        float c = (core * (0.55 + 0.45 * froth) + lace) * 0.75 * uAmount;
        gl_FragColor = vec4(uColor * c, 1.0);
      }`,
  });

/* ───────────────────────────── the wall's shape ───────────────────────────── */
const TAN = Math.tan(ROCK.lean * DEG);
// the mesh runs wider than ROCK.width (its sides fade into the black): from the hook's azimuth (70) the line of
// sight beyond the bow meets the face ≈ 45 m toward −z, and a face that curves away there reads as a lone mound
const HALFW = (ROCK.width * 1.5) / 2; // toward +z (the camera side)
const HALFM = HALFW * 1.4; //              toward −z (beyond the bow from the hook's azimuth)
const halfAt = (z) => (z < 0 ? HALFM : HALFW);
// big lumps, read as contour rings (v: height on the face from the contact, z: across)
const LUMPS = [
  { v: 1800, z: -2600, r: 700, a: 520 }, { v: -1700, z: 2400, r: 900, a: 650 }, { v: 3300, z: 1600, r: 650, a: 380 },
  { v: -3600, z: -1900, r: 1100, a: 700 }, { v: 900, z: 4300, r: 800, a: 460 }, { v: 2400, z: -5200, r: 1000, a: 600 },
  { v: -800, z: -4300, r: 700, a: 420 },
];
function relief(v, z) {
  let r = (fbm(z / 3800 + 3.1, v / 3800 + 1.7) - 0.5) * 1500;
  r += (fbm(z / 1100 + 8.3, v / 1100 + 4.4) - 0.5) * 380;
  // the beds: each juts a little at its top (a ledge every ≈ 8 m, wavy)
  const s = v / 820 + 0.9 * fbm(z / 3200 + 11, v / 3200);
  r += 170 * (s - Math.floor(s)) ** 4;
  for (const b of LUMPS) r += b.a * Math.exp(-((v - b.v) ** 2 + (z - b.z) ** 2) / (b.r * b.r));
  // calm where the bow hits: the contact stays the face's own plane
  return r * smooth(500, 1900, Math.hypot(v, z));
}
// the face's x (toward the boat) at (v, z): leaning back, curving away at its sides and its shoulder
const faceX0 = (v, z) => {
  const sh = Math.max(0, v - (ROCK.above - 2600));
  return -v * TAN - (z * z) / (2 * 26000) - (Math.abs(z) / halfAt(z)) ** 4 * 2600 - (sh * sh) / 3600;
};
const faceX = (v, z) => faceX0(v, z) + relief(v, z);
const BOULDERS = [[-900, -1700, 260], [-1250, 1550, 340], [2600, -900, 210], [-2600, 650, 420], [1400, 3000, 300], [450, 2150, 190], [-1900, -3100, 360]];

/* ───────────────────────────── the hull's section at the waterline (for the foam) ───────────────────────────── */
const SAIL_TOP = SUB.r + SAIL.h;
// (sousmarin.js's hullRadius, mirrored here so that this file never waits on the boat's)
function hullR(x) {
  const s = x - SUB.bow;
  if (s < 0 || x > SUB.stern) return 0;
  if (s < SUB.nose) return SUB.r * Math.sqrt(Math.max(0, 1 - ((SUB.nose - s) / SUB.nose) ** 2));
  const t0 = SUB.stern - 200 - SUB.tail;
  if (x <= t0) return SUB.r;
  const u = Math.min(1, (x - t0) / SUB.tail);
  return SUB.hub + (SUB.r - SUB.hub) * (1 - u * u * (3 - 2 * u)) ** 0.8;
}

/** A foam ribbon of `n` points around a closed outline (filled by `fill`): inner edge a little inside the hull,
 *  outer edge `width` out. Its buffers are allocated once; `fill` writes in place. */
function makeFoam(n, width, parent, lift = 0) {
  const pos = new Float32Array(n * 2 * 3);
  const side = new Float32Array(n * 2);
  const s = new Float32Array(n * 2);
  const idx = [];
  for (let i = 0; i < n; i++) {
    side[2 * i] = 0;
    side[2 * i + 1] = 1;
    s[2 * i] = s[2 * i + 1] = i / n;
    const a = 2 * i, b = a + 1, c = (2 * (i + 1)) % (2 * n), d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const geo = new THREE.BufferGeometry();
  const attr = new THREE.BufferAttribute(pos, 3);
  attr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("position", attr);
  geo.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
  geo.setAttribute("aS", new THREE.BufferAttribute(s, 1));
  geo.setIndex(idx);
  const mesh = new THREE.Mesh(geo, foamMat());
  mesh.frustumCulled = false;
  mesh.renderOrder = 31;
  parent.add(mesh);
  const ox = new Float32Array(n), oz = new Float32Array(n);
  return {
    mesh, ox, oz, n,
    /** ox/oz hold the outline (world x, z); writes the ribbon at height y. */
    commit(y) {
      let cx = 0;
      for (let i = 0; i < n; i++) cx += ox[i];
      cx /= n;
      for (let i = 0; i < n; i++) {
        const p = (i + n - 1) % n, q = (i + 1) % n;
        let nx = oz[q] - oz[p], nz = -(ox[q] - ox[p]);
        const l = Math.hypot(nx, nz) || 1;
        nx /= l;
        nz /= l;
        if (nx * (ox[i] - cx) + nz * oz[i] < 0) {
          nx = -nx;
          nz = -nz;
        }
        pos[6 * i] = ox[i] - nx * 25;
        pos[6 * i + 1] = y + lift; // the froth climbs the hull a little: seen from the side, a band, not a flat line
        pos[6 * i + 2] = oz[i] - nz * 25;
        pos[6 * i + 3] = ox[i] + nx * width;
        pos[6 * i + 4] = y;
        pos[6 * i + 5] = oz[i] + nz * width;
      }
      attr.needsUpdate = true;
    },
  };
}

/* ───────────────────────────── the set ───────────────────────────── */
export function buildMer() {
  const group = new THREE.Group();
  const fond = buildFond();
  group.add(fond.group);

  // 034's wreck is not ours: out of its group (its update keeps writing their uniforms, harmlessly)
  const fsea = fond.group.children[0]; // its sea (the bottom, the debris, the lamp)
  for (const c of [...fond.group.children]) {
    if ((c.isGroup && c !== fsea) || (c.isPoints && c.material.uniforms?.uPx) || (c.isMesh && c.material.uniforms?.uReach)) fond.group.remove(c);
  }
  for (const c of [...fsea.children]) if (c.isGroup) fsea.remove(c);
  // its water column for the wide shots (a glass drum, the bottom's and the surface's circles, the reach's
  // footprint): our seamount stands alone
  for (const parent of [fond.group, fsea]) {
    for (const c of [...parent.children]) if (c.isLineSegments2 || c.geometry?.type === "CylinderGeometry") parent.remove(c);
  }
  if (fond.A.tail.parent) fond.A.tail.parent.remove(fond.A.tail);
  const fondSnow = fond.group.children.filter((c) => c.isPoints && c.material.uniforms?.uDir);

  // the snow that streaks along the boat (toward +x, the water running past from bow to stern)
  const streaks = [
    { cube: 1500, count: 1700, near: 120, gain: 2.1, k: 0.85, seed: 3811 },
    { cube: 6000, count: 2600, near: 500, gain: 1.8, k: 0.6, seed: 3812 },
  ].map(({ cube, count, near, gain, k, seed }) => {
    const geo = new THREE.BufferGeometry();
    const R = rng(seed);
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      pos.set([R(), R(), R()], i * 3);
      seeds.set([R(), R(), (0.12 + Math.pow(R(), 2.4) * 0.5) * (cube > 3000 ? 2.2 : 1), 0.3 + R() * 0.7], i * 4);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
    const pts = new THREE.Points(geo, streakMat({ cube, near, vel: [900, 0, 0], streak: 0.07, gain }));
    pts.frustumCulled = false;
    pts.renderOrder = 4;
    pts.userData.k = k;
    group.add(pts);
    return pts;
  });

  // everything fixed to the seabed moves with depth and gap: the wall, its boulders, its sediment, the seamount
  const seaFrame = new THREE.Group();
  group.add(seaFrame);

  /* ── the wall ── */
  const NZ = 190, NV = 160;
  const nVert = (NZ + 1) * (NV + 1);
  const rpos = new Float32Array(nVert * 3), rrel = new Float32Array(nVert), redge = new Float32Array(nVert);
  const rmac = new Float32Array(nVert * 3); // the face's normal without its relief: the rim is its silhouette only
  for (let j = 0; j <= NV; j++) {
    const v = -ROCK.below + ((ROCK.below + ROCK.above) * j) / NV;
    for (let i = 0; i <= NZ; i++) {
      const z = -HALFM + ((HALFM + HALFW) * i) / NZ;
      const k = j * (NZ + 1) + i;
      rpos.set([faceX(v, z), v, z], k * 3);
      rrel[k] = relief(v, z);
      const fv = (faceX0(v + 20, z) - faceX0(v - 20, z)) / 40, fz = (faceX0(v, z + 20) - faceX0(v, z - 20)) / 40;
      const l = Math.hypot(1, fv, fz);
      rmac.set([1 / l, -fv / l, -fz / l], k * 3);
      redge[k] = smooth(halfAt(z), halfAt(z) * 0.68, Math.abs(z)) * smooth(-ROCK.below, -ROCK.below + 3500, v) * smooth(ROCK.above, ROCK.above - 700, v);
    }
  }
  const ridx = [];
  for (let j = 0; j < NV; j++) {
    for (let i = 0; i < NZ; i++) {
      const a = j * (NZ + 1) + i, b = a + 1, c = a + NZ + 1, d = c + 1;
      ridx.push(a, c, b, b, c, d); // the face's normal toward +x (the boat)
    }
  }
  const rockGeo = new THREE.BufferGeometry();
  rockGeo.setAttribute("position", new THREE.BufferAttribute(rpos, 3));
  rockGeo.setAttribute("aRel", new THREE.BufferAttribute(rrel, 1));
  rockGeo.setAttribute("aEdge", new THREE.BufferAttribute(redge, 1));
  rockGeo.setAttribute("aMacro", new THREE.BufferAttribute(rmac, 3));
  rockGeo.setIndex(ridx);
  rockGeo.computeVertexNormals();
  const rmat = rockMat();
  const rock = new THREE.Mesh(rockGeo, rmat);
  rock.frustumCulled = false;
  rock.renderOrder = 30; // after the boat's glass shells: the hull stands dark against the wall's lines
  seaFrame.add(rock);
  const ru = rmat.uniforms;

  // the boulders: low-poly glass, their edges in fine ink lines
  // (no `edge`: a flat facet seen edge-on would light whole, a slab)
  const bGlass = glass(BRAND.ink, { base: 0, rim: 0.12, power: 3 });
  const bEdges = [];
  const bMeshes = [];
  const BR = rng(3815);
  for (const [v, z, r] of BOULDERS) {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const s = 0.78 + 0.4 * hash(p.getX(i) * 7.1 + v, p.getY(i) * 5.3 + z);
      p.setXYZ(i, p.getX(i) * s, p.getY(i) * s * 0.72, p.getZ(i) * s);
    }
    geo.computeVertexNormals();
    const flat = geo.toNonIndexed();
    flat.computeVertexNormals();
    const m = new THREE.Mesh(flat, bGlass);
    m.scale.setScalar(r);
    m.rotation.set(BR() * 3, BR() * 3, BR() * 3);
    m.position.set(faceX(v, z) + 0.35 * r, v + 0.3 * r, z);
    const e = edgesOf(flat, { color: BRAND.ink, width: 1.8, opacity: 0.35, threshold: 18 });
    m.add(e);
    bEdges.push(e);
    bMeshes.push(m);
    seaFrame.add(m);
  }
  asShell(bMeshes, 28);

  // the sediment the shock shakes off around the contact
  const DUST = 420;
  const dustGeo = new THREE.BufferGeometry();
  {
    const R = rng(3816);
    const pos = new Float32Array(DUST * 3);
    const seeds = new Float32Array(DUST * 4);
    for (let i = 0; i < DUST; i++) seeds.set([R(), R(), R(), Math.pow(R(), 0.7)], i * 4);
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  }
  const dust = new THREE.Points(dustGeo, dustMat());
  dust.frustumCulled = false;
  dust.renderOrder = 32;
  seaFrame.add(dust);
  const du = dust.material.uniforms;

  /* ── the whole seamount (schematic): rings of depth, ridge lines, a faint glass ── */
  const mount = new THREE.Group();
  mount.position.set(SEAMOUNT.peak, 0, 0); // its axis; y 0 = the contact's depth (ROCK.depth)
  seaFrame.add(mount);
  const R0 = -SEAMOUNT.peak; // its radius at the contact's depth: the ring passes through the contact
  const prof = (dep) => (dep <= ROCK.depth ? R0 * Math.sqrt(clamp01((dep - SEAMOUNT.summit) / (ROCK.depth - SEAMOUNT.summit))) : R0 + (SEAMOUNT.radius - R0) * ((t) => 0.3 * Math.pow(t, 0.6) + 0.7 * Math.pow(t, 1.7))((dep - ROCK.depth) / (SEAMOUNT.base - ROCK.depth)));
  const yOf = (dep) => (ROCK.depth - dep) * 100;
  const PH = [0.7, 2.3, 4.1, 1.2, 5.5];
  const lump = (th, dep) => {
    let n = 0;
    for (let i = 0; i < 5; i++) n += Math.sin((i + 2) * th + PH[i]) / (i + 2);
    n += 0.5 * Math.sin(3 * th + dep / 700 + 1.3) / 3;
    const w = Math.atan2(Math.sin(th), Math.cos(th));
    return 1 + 0.3 * n * (1 - Math.exp(-(w * w) / 0.15));
  };
  const ringList = [];
  for (const dep of [100, 125, 160, 250, 380, 540, 740, 980, 1260, 1580, 1940, 2340, 2780, 3260, 3800]) {
    const pts = [];
    for (let k = 0; k < 180; k++) {
      const th = (2 * Math.PI * k) / 180;
      const r = prof(dep) * lump(th, dep);
      pts.push([r * Math.cos(th), yOf(dep), -r * Math.sin(th)]);
    }
    for (let k = 0; k < pts.length; k++) ringList.push(...pts[k], ...pts[(k + 1) % pts.length]);
  }
  const ringMat = lineMat(BRAND.ink, 2.0, { opacity: 0 });
  const rings = segments(ringList, ringMat, mount);
  const ridgeList = [];
  for (let m = 0; m < 14; m++) {
    const th = (2 * Math.PI * (m + 0.5 * hash(m, 3))) / 14;
    let last = null;
    for (let dep = SEAMOUNT.summit + 10; dep <= SEAMOUNT.base; dep += 45) {
      const r = prof(dep) * lump(th, dep);
      const p = [r * Math.cos(th), yOf(dep), -r * Math.sin(th)];
      if (last) ridgeList.push(...last, ...p);
      last = p;
    }
  }
  const ridgeMat = lineMat(BRAND.ink, 1.8, { opacity: 0 });
  const ridges = segments(ridgeList, ridgeMat, mount);
  const lathePts = [];
  for (let k = 0; k <= 40; k++) {
    const dep = SEAMOUNT.summit + (SEAMOUNT.base - SEAMOUNT.summit) * Math.pow(k / 40, 1.6);
    lathePts.push(new THREE.Vector2(Math.max(1, prof(dep)), yOf(dep)));
  }
  lathePts.reverse(); // from the foot up: the lathe's normals face out
  const mGlass = glass(BRAND.ink, { base: 0, rim: 0.3, power: 3, edge: 0.12 });
  const mBody = new THREE.Mesh(new THREE.LatheGeometry(lathePts, 96), mGlass);
  mBody.frustumCulled = false;
  mount.add(mBody);
  asShell([mBody], 26);

  /* ── above the water: the plane, the low sky, the foam ── */
  const top = new THREE.Group(); // at the surface: y = depth·100
  group.add(top);
  const wmat = waterMat();
  const waterNear = new THREE.Mesh(new THREE.CircleGeometry(100000, 96), wmat);
  const waterFar = new THREE.Mesh(new THREE.RingGeometry(100000, 2400000, 96, 2), wmat);
  for (const w of [waterNear, waterFar]) {
    w.rotation.x = -Math.PI / 2;
    w.frustumCulled = false;
    w.renderOrder = 30;
    top.add(w);
  }
  const wu = wmat.uniforms;
  const vmat = veilMat();
  const veils = [waterNear, waterFar].map((w) => {
    const m = new THREE.Mesh(w.geometry, vmat);
    m.rotation.x = -Math.PI / 2;
    m.frustumCulled = false;
    m.renderOrder = 29; // after the boat (≤ 20), before the water's lines and the foam
    top.add(m);
    return m;
  });
  const smat = skyMat();
  const skyGeo = new THREE.CylinderGeometry(2200000, 2200000, 700000, 128, 1, true);
  skyGeo.translate(0, 330000, 0);
  const skyDome = new THREE.Mesh(skyGeo, smat);
  skyDome.frustumCulled = false;
  skyDome.renderOrder = 0;
  top.add(skyDome);
  const sku = smat.uniforms;
  const hullFoam = makeFoam(160, 480, group, 70);
  const sailFoam = makeFoam(64, 260, group, 50);
  hullFoam.mesh.material.uniforms.uLoop.value = 70;
  sailFoam.mesh.material.uniforms.uLoop.value = 14;
  const foamLast = { h: NaN, p: NaN };

  // the waterline: in the boat's frame its height at x is (h + x·sin p) / cos p (the boat turned by its pitch)
  function waterline(h, p) {
    const sp = Math.sin(p), cp = Math.cos(p);
    const yw = (x) => (h + x * sp) / cp;
    // the hull: where its radius rises over the waterline
    let xa = NaN, xb = NaN, wmax = 0;
    const STEPS = 220;
    let prevF = -1, prevX = SUB.bow;
    for (let k = 0; k <= STEPS; k++) {
      const x = SUB.bow + ((SUB.stern - SUB.bow) * k) / STEPS;
      const y = yw(x);
      const f = hullR(x) ** 2 - y * y;
      if (f > 0) wmax = Math.max(wmax, Math.sqrt(f));
      if (f > 0 && prevF <= 0) xa = prevX + ((x - prevX) * -prevF) / Math.max(1e-6, f - prevF);
      if (f <= 0 && prevF > 0) xb = prevX + ((x - prevX) * prevF) / Math.max(1e-6, prevF - f);
      prevF = f;
      prevX = x;
    }
    if (Number.isNaN(xb) && !Number.isNaN(xa)) xb = SUB.stern;
    const hasHull = !Number.isNaN(xa) && wmax > 1;
    if (hasHull) {
      const K = hullFoam.n / 2;
      for (let k = 0; k < K; k++) {
        const u = (k + 0.5) / K;
        const x = xa + ((xb - xa) * (1 - Math.cos(Math.PI * u))) / 2;
        const y = yw(x);
        const w = Math.sqrt(Math.max(0, hullR(x) ** 2 - y * y));
        const X = x * cp + y * sp;
        hullFoam.ox[k] = X;
        hullFoam.oz[k] = w;
        hullFoam.ox[hullFoam.n - 1 - k] = X;
        hullFoam.oz[hullFoam.n - 1 - k] = -w;
      }
      hullFoam.commit(h + 3);
    }
    // the sail: while the waterline crosses it (its top out, its foot under)
    const ys = yw(SAIL.x);
    const sailK = smooth(SAIL_TOP, SAIL_TOP - 90, ys) * smooth(SUB.r - 90, SUB.r + 30, ys);
    if (sailK > 0) {
      const K = sailFoam.n / 2;
      for (let k = 0; k < K; k++) {
        const ux = -Math.cos((Math.PI * (k + 0.5)) / K); // −1 the leading edge → +1 the trailing edge (as sousmarin.js)
        const x = SAIL.x + (SAIL.len / 2) * ux;
        const w = (SAIL.w / 2) * Math.sqrt(1 - ux * ux) * (ux < 0 ? 1 : 1 - 0.55 * ux * ux) + 6;
        const X = x * cp + ys * sp;
        sailFoam.ox[k] = X;
        sailFoam.oz[k] = w;
        sailFoam.ox[sailFoam.n - 1 - k] = X;
        sailFoam.oz[sailFoam.n - 1 - k] = -w;
      }
      sailFoam.commit(h + 3);
    }
    foamLast.hull = hasHull ? smooth(0, 70, wmax) : 0;
    foamLast.sail = sailK;
  }

  const A = { contact: new THREE.Object3D(), summit: new THREE.Object3D(), surface: new THREE.Object3D() };
  seaFrame.add(A.contact);
  A.summit.position.set(SEAMOUNT.peak, (ROCK.depth - SEAMOUNT.summit) * 100, 0);
  seaFrame.add(A.summit);
  group.add(A.surface);

  return {
    group, A,
    fog(d) {
      const k = fond.fog(d); // 034's: the bottom, its snow, its fog
      const snowK = 1 - smooth(20000, 120000, Math.max(1, d));
      for (const s of streaks) s.material.uniforms.uAmount.value *= snowK;
      // the boulders and the sediment belong to the wall seen from outside: never through the boat's glass (the close
      // shots inside it, d < 25 m: a boulder 40 m off read as a block falling in the control room), and off when the
      // wall is far from the frame (d > 130 m: scattered round the boat, they read as debris afloat)
      const inK = smooth(1800, 2500, d);
      const bk = inK * (1 - smooth(13000, 19000, d));
      bGlass.uniforms.uAmount.value *= bk;
      for (const e of bEdges) e.material.opacity *= bk;
      for (const m of bMeshes) m.visible = m.visible && bk > 0.003;
      du.uAmount.value *= inK;
      dust.visible = dust.visible && du.uAmount.value > 0.003;
      return k;
    },
    update(P = {}, time = 0, px = 1) {
      const sea = clamp01(P.sea ?? 1);
      const depth = P.depth ?? ROCK.depth;
      const gap = Math.max(0, P.gap ?? 0);
      const speed = clamp01(P.speed ?? 0);
      const rush = Math.max(-1, Math.min(1, P.rush ?? 0));
      const mood = clamp01(P.mood ?? 0);
      const pitch = (P.pitch ?? 0) * DEG;

      // 034's sea. Its rush + is « the snow rises » (its box sank): ours + is « the boat climbs, the snow falls past »
      fond.update({ depth, rush: -rush, wreck: 0, ping: 0, range: 0, beam: 0, shell: sea, pool: 0, mood: 0 }, time, px);
      // its net under the surface gives way to ours seen from the side (its lines read as streaks at the waterline)
      const fsu = fond.A.surface.material.uniforms;
      fsu.uAmount.value *= 1 - clamp01(P.sky ?? 0);
      fond.A.surface.visible = fsu.uAmount.value > 0.003;
      for (const s of fondSnow) {
        s.material.uniforms.uAmount.value *= 1 - speed;
        s.visible = s.visible && speed < 0.99;
      }
      for (const s of streaks) {
        const u = s.material.uniforms;
        u.uTime.value = time;
        u.uScale.value = px;
        u.uAmount.value = speed * sea * s.userData.k;
        s.visible = speed * sea > 0.01;
      }

      seaFrame.position.set(SUB.bow - gap * 100, (depth - ROCK.depth) * 100, 0);

      // the wall
      const r = clamp01(P.rock ?? 1) * sea;
      ru.uAmount.value = r;
      ru.uMood.value = mood;
      rock.visible = r > 0.003;
      bGlass.uniforms.uAmount.value = 0.9 * r;
      for (const e of bEdges) e.material.opacity = 0.35 * r;
      for (const m of bMeshes) m.visible = r > 0.003;
      const dk = r * (1 - smooth(0.2, 2.5, gap));
      du.uAmount.value = dk;
      du.uTime.value = time;
      du.uScale.value = px;
      dust.visible = dk > 0.003;

      // the whole seamount
      const m = clamp01(P.mount ?? 0) * sea;
      ringMat.opacity = 0.45 * m;
      ridgeMat.opacity = 0.2 * m;
      mGlass.uniforms.uAmount.value = 0.8 * m;
      mount.visible = m > 0.003;

      // the surface: from the side (sky), from below as the boat nears it
      const sky = clamp01(P.sky ?? 0) * sea;
      const h = depth * 100;
      top.position.y = h;
      A.surface.position.set(0, h, 0);
      wu.uTime.value = time;
      wu.uSky.value = sky;
      wu.uAbove.value = sky;
      wu.uBelow.value = sea * Math.max(sky, 1 - smooth(25, 150, depth)) * 0.8;
      waterNear.visible = waterFar.visible = wu.uAbove.value + wu.uBelow.value > 0.003;
      vmat.uniforms.uAmount.value = 0.75 * sky;
      for (const m of veils) m.visible = sky > 0.003;
      sku.uSky.value = sky;
      sku.uSurf.value = h;
      sku.uTime.value = time;
      skyDome.visible = sky > 0.003;
      // the foam where the hull breaks the water (recomputed only when the waterline moves)
      if (sky > 0.003) {
        if (h !== foamLast.h || pitch !== foamLast.p) {
          waterline(h, pitch);
          foamLast.h = h;
          foamLast.p = pitch;
        }
        const hu = hullFoam.mesh.material.uniforms, su = sailFoam.mesh.material.uniforms;
        hu.uAmount.value = sky * foamLast.hull;
        su.uAmount.value = sky * foamLast.sail;
        hu.uTime.value = su.uTime.value = time;
        hullFoam.mesh.visible = hu.uAmount.value > 0.003;
        sailFoam.mesh.visible = su.uAmount.value > 0.003;
      } else {
        hullFoam.mesh.visible = sailFoam.mesh.visible = false;
      }
    },
  };
}
