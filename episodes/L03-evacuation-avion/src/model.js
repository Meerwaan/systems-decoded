// DOSSIER L03 — the SOLID systems: the slide pack and its insides, the 16 g seat, the cushion and the burner, the
// documents of the rule, twenty figurines. They stand on the bench, one item at a time, at the origin.
//
//   buildModel() → { pack: { group, A }, items, A, set(p, time, px) }
//   pack.group  the slide pack (case, folded slide, bottle, aspirators and their flaps, girt bar, the inflating head
//               tube): world.js hangs it on the bench (at PACK.y above it) OR in the cabin's door (cabine.js · A.bustle).
//               Its local frame (plan.js · PACK): long side along x, up y, its +z face toward the camera / the cabin;
//               its origin at the middle of its BASE. The girt bar runs along its lower +z edge.
//   pack.A      { bottle, valve (the bottle's), asp: [Object3D × 2] (the aspirators' mouths), flaps (the flaps' hinge
//               line in aspirator 1), girt (the girt bar's middle), tube (the head tube's middle) }
//   items       a group standing at the bench's origin: the seat and its sled (item 1), the cushion and the burner
//               (item 2), the document (item 3), the twenty figurines (item 4); only the current item shows
//   A           { seat, dummyHead, cushion, flame, doc, figurines: [Object3D × 20] }
//   p = { place, item, sill, door, arm, explode, named, pulled, drop, gas, jet, see, valve, air, tube, leak, press, sled,
//         sensors, burner, doc, docIn, hl, twenty, oneIn, mood }            (their meaning: FIRST, in world.js)
//   `sill`: in the cabin, the floor brackets in the PACK'S OWN FRAME (a Vector3, recomputed every frame), null on the
//   bench: when `arm` ≥ 0.5 the girt bar's ends reach it. `place`: world.js · SET (0 PISTE, 1 CABINE, 2 BENCH).
//
// THE LOOK (docs/L03-decors.md · model.js): solid, dark or warm grey, light edges, three values of grey — the case dark
// (quilted canvas), the metal mid (bottle, aspirator bodies), the fabric of the slide light, and the FLAPS the lightest
// of all: the smallest part is the secret. Veille = what gets you out (the air the aspirators swallow, the open flaps);
// signal = the threat (air leaking out, the flame); ink = the structure, and the bottle's gas (cold, white).
//
// THE PACK, step by step (`explode`):
//   0      closed: the quilted case, its front flap (rabat) strapped, the bottle lying on the lid (valve and gauge at its
//          +x end), the two aspirators standing in front of it, their hose; the girt bar along the lower front edge
//   0→1    "on l'ouvre": the rabat falls toward the camera (0 → .45; at .12 it has just cracked open), the bottle and the
//          aspirators lift off (.14 →), the lid swings back (.45 → .8), the folded slide rises out (.5 → .95), the girt
//          bar drops to the bench in front (.02 → .4). Lanes, seen 3/4 from +z: bottle on top, aspirators left and right
//          at mid height (nothing in front of them), the folded slide in the middle, the bar low in front
//   1→2    the working rig: the case, the folded slide and the bar fade, the head tube hangs from its stand (flat), the
//          aspirators sit on its top line, the bottle lies on the bench at the right, its valve and gauge toward the
//          camera, its hose up to the aspirators' manifold
// THE ASPIRATOR (each of two, its axis up, its base on the tube): a venturi body, the gas pipe entering from the back
// to a nozzle pointing down at the centre, a ring of 8 flaps hinged at the inlet rim (they swing down, inward). `see`
// fades its front half: the cut faces are lighter, the jet (ink) runs down the throat, the low pressure around the
// nozzle darkens, the air (veille streaks) comes in over the rim through the open flaps and joins the jet.
// THE SEAT (item 1): a triple economy row facing −x on a sled; the dummy in the +z seat (nearest the camera). The sled
// stays at the origin, under the light: it is the TRACK that runs under it (`sled` 0 → 1 accelerating, 1 → 2 the dead
// stop in ≈ 30 cm) — a shot that follows the sled. Put `grid: 0` on that shot (see the journal).
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, box, cyl, lathe, plate, chamfer, makePart, addMesh, setPartOpacity, edgesOf, mergeGeometries, placed, fatLine } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { PACK, TUBE, SEAT, BURNER, DOC, DOCS } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const S = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const mix = (a, b, u) => a + (b - a) * u;
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const UP = new THREE.Vector3(0, 1, 0);
const FONT_D = "'Barlow Condensed', sans-serif";
const FONT_M = "'JetBrains Mono', monospace";

/* ─────────────────────────────────── the greys ─────────────────────────────────── */
const G = {
  case: 0x46433e, // the quilted canvas: the darkest value
  strap: 0x5d5951,
  steel: 0x3d3b38, // the stand, the rails
  metal: 0x88847c, // bottle, aspirator bodies: the middle value
  valve: 0x9b968c,
  hose: 0x2e2c29,
  fabric: 0xb4ac9c, // the slide: warm light grey
  cut: 0xc4bdaf, // the cut faces of an aspirator
  flap: 0xdcd6c9, // THE HERO: the lightest
  girt: 0xaaa59b,
  seat: 0x403d39,
  shell: 0x75716a,
  legs: 0x8a867e,
  dummy: 0x9c978d, // ink grey
  joint: 0x34312d,
  belt: 0xa8a296,
};

/* ─────────────────────────────────── shaders ─────────────────────────────────── */

const FACE_VS = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;

/** A ball of light with no edge (003 · shaft.js): brightest where it faces the eye, nothing at its rim. */
const softGlow = (color, k = 1, power = 2.2) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color).multiplyScalar(k) }, uPower: { value: power }, uAmount: { value: 0 } },
    vertexShader: FACE_VS,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower, uAmount; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * f * uAmount, 1.0);
      }`,
  });

/** A soft darkening (the low pressure behind the nozzle; a scorch): black, its alpha strongest where it faces the eye. */
const softShade = (k = 0.7, power = 1.3) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uAmount: { value: 0 }, uK: { value: k }, uPower: { value: power } },
    vertexShader: FACE_VS,
    fragmentShader: /* glsl */ `
      uniform float uAmount, uK, uPower; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
        gl_FragColor = vec4(0.0, 0.0, 0.0, clamp(f * uK * uAmount, 0.0, 0.95));
      }`,
  });

/** A round soft patch on a plane (a scorch on the cushion): alpha from the middle of its uv square. */
const scorchMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uAmount: { value: 0 } },
    vertexShader: FACE_VS,
    fragmentShader: /* glsl */ `
      uniform float uAmount; varying vec2 vUv;
      void main() {
        float d = length((vUv - 0.5) * vec2(1.0, 1.4)) * 2.0;
        float a = (1.0 - smoothstep(0.15, 1.0, d)) * 0.62 * uAmount;
        gl_FragColor = vec4(0.07, 0.045, 0.03, a);
      }`,
  });

/**
 * Gas flowing in a hose: a skin of light just outside the hose, lit from the valve up to the front (`uFront`, cm along
 * the whole path; this piece starts at `uOff` and is `uLen` long), with soft pulses that run along it (39 cm apart,
 * 90 cm/s: under a seventh of a period per frame).
 */
const flowMat = (len, off) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(0.75) }, uFront: { value: 0 }, uLen: { value: len }, uOff: { value: off }, uT: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: FACE_VS,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uFront, uLen, uOff, uT, uAmount; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
      void main() {
        float s = uOff + vUv.x * uLen;
        float lit = 1.0 - smoothstep(uFront - 8.0, uFront, s);
        float w = 0.5 + 0.5 * sin((s - uT * 90.0) * 0.16);
        float pulse = 0.4 + 0.6 * w * w;
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 2.0);
        gl_FragColor = vec4(uColor * f * lit * pulse * uAmount, 1.0);
      }`,
  });

/** The gas jet in the aspirator's throat: a soft cone of cold light, brightest at the nozzle, slow striations running down. */
const jetMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(1.05) }, uT: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: FACE_VS,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uT, uAmount; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
      void main() {
        float y = 1.0 - vUv.y; // 0 at the nozzle, 1 at the outlet
        float f = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 1.8);
        float along = (1.0 - 0.6 * y) * smoothstep(0.0, 0.06, y) * (1.0 - smoothstep(0.82, 1.0, y));
        float stri = 0.88 + 0.12 * sin(y * 28.0 - uT * 16.0);
        gl_FragColor = vec4(uColor * f * along * stri * uAmount, 1.0);
      }`,
  });

/**
 * Streaks of air: short ribbons that run along a path (a Catmull-Rom through five points [r, y] in the aspirator's frame,
 * turned to the azimuth of each streak) — heads of light with a fading tail, never points. Their width is in cm, but
 * never under `uMinPx` pixels. `uCut` folds them into the back half (the cut view). `uAmount` brings them in one by one.
 */
function makeAirStreaks({ n = 14, pts, color, k = 1.6, len = 0.2, speed = 1.15, width = 0.24, minPx = 2, spread = 4, spreadEnd = 0, phi = null, phiJitter = 0.25, seed = 1 }) {
  const M = 8;
  const rand = rng(seed);
  const V = n * M * 2;
  const pos = new Float32Array(V * 3);
  const us = new Float32Array(V * 2);
  const sd = new Float32Array(V * 4);
  const gate = new Float32Array(V);
  const idx = [];
  for (let i = 0; i < n; i++) {
    const ph = rand();
    const sp = rand();
    const az = phi === null ? rand() * Math.PI * 2 : phi + (rand() - 0.5) * 2 * phiJitter;
    const lat = rand() * 2 - 1;
    const g = (i + 0.3 + rand() * 0.4) / n;
    for (let j = 0; j < M; j++) {
      for (let s = 0; s < 2; s++) {
        const v = (i * M + j) * 2 + s;
        us[v * 2] = j / (M - 1);
        us[v * 2 + 1] = s ? 1 : -1;
        sd.set([ph, sp, az, lat], v * 4);
        gate[v] = g;
      }
      if (j < M - 1) {
        const a = (i * M + j) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aUS", new THREE.BufferAttribute(us, 2));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(sd, 4));
  geo.setAttribute("aGate", new THREE.BufferAttribute(gate, 1));
  geo.setIndex(idx);
  const uniforms = {
    uT: { value: 0 }, uAmount: { value: 0 }, uSpeed: { value: speed }, uLen: { value: len }, uW: { value: width }, uMinPx: { value: minPx }, uPx: { value: 1000 },
    uP: { value: pts.map(([r, y]) => new THREE.Vector2(r, y)) }, uColor: { value: new THREE.Color(color).multiplyScalar(k) }, uSpread: { value: spread }, uSpreadEnd: { value: spreadEnd }, uCut: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uT, uAmount, uSpeed, uLen, uW, uMinPx, uPx, uSpread, uSpreadEnd, uCut;
      uniform vec2 uP[5];
      attribute vec2 aUS; attribute vec4 aSeed; attribute float aGate;
      varying float vA; varying float vSide;
      vec2 cr(vec2 a, vec2 b, vec2 c, vec2 d, float t) {
        return 0.5 * ((2.0 * b) + (-a + c) * t + (2.0 * a - 5.0 * b + 4.0 * c - d) * t * t + (-a + 3.0 * b - 3.0 * c + d) * t * t * t);
      }
      vec2 path(float s) {
        float f = clamp(s, 0.0, 1.0) * 4.0;
        float i = min(floor(f), 3.0);
        float t = f - i;
        if (i < 0.5) return cr(uP[0], uP[0], uP[1], uP[2], t);
        if (i < 1.5) return cr(uP[0], uP[1], uP[2], uP[3], t);
        if (i < 2.5) return cr(uP[1], uP[2], uP[3], uP[4], t);
        return cr(uP[2], uP[3], uP[4], uP[4], t);
      }
      vec3 at(float s) {
        vec2 q = path(s);
        float wgt = mix(1.0 - smoothstep(0.25, 0.5, s), smoothstep(0.5, 0.85, s), uSpreadEnd);
        float r = max(0.3, q.x + aSeed.w * uSpread * wgt);
        float cz = mix(cos(aSeed.z), -abs(cos(aSeed.z)), uCut);
        return vec3(sin(aSeed.z) * r, q.y, cz * r);
      }
      void main() {
        float head = fract(uT * uSpeed * (0.8 + 0.4 * aSeed.y) + aSeed.x);
        float s = head - uLen * (1.0 - aUS.x);
        vec3 p = at(s);
        vec3 p2 = at(s + 0.012);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vec4 mv2 = modelViewMatrix * vec4(p2, 1.0);
        vec2 d = mv2.xy - mv.xy;
        float l = length(d);
        vec2 dir = l > 1e-5 ? d / l : vec2(1.0, 0.0);
        float depth = max(0.5, -mv.z);
        float w = max(uW, uMinPx * depth / max(uPx, 1.0));
        mv.xy += vec2(-dir.y, dir.x) * aUS.y * w * 0.5;
        gl_Position = projectionMatrix * mv;
        float show = smoothstep(aGate - 0.12, aGate, uAmount * 1.08);
        vA = step(0.0, s) * pow(aUS.x, 1.4) * smoothstep(0.0, 0.08, s) * (1.0 - smoothstep(0.86, 1.0, head)) * show * (0.6 + 0.4 * clamp(uAmount, 0.0, 1.0));
        vSide = aUS.y;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA; varying float vSide;
      void main() {
        float edge = 1.0 - vSide * vSide;
        gl_FragColor = vec4(uColor * vA * edge, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/** Embers rising off the flame (003's falling embers turned upward): born again every period, alive from the first frame. */
function makeRisers({ count = 18, seed = 7 } = {}) {
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) seeds.set([rand(), 1.1 + rand() * 1.1, 0.22 + rand() * 0.35, rand() * Math.PI * 2], i * 4);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uScale: { value: 1000 }, uAmount: { value: 0 }, uOrigin: { value: new THREE.Vector3() }, uHot: { value: new THREE.Color(1, 0.82, 0.6).multiplyScalar(1.8) }, uCool: { value: SIGNAL.clone().multiplyScalar(1.5) } };
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
          float out_ = 2.0 + 5.0 * age;
          vec3 p = uOrigin + vec3(cos(aSeed.w) * out_ + 6.0 * age, 18.0 * age + 14.0 * age * age, sin(aSeed.w) * out_);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = max(1.5, aSeed.z * uScale / max(0.5, -mv.z));
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; uniform float uAmount; varying float vAge;
        void main() {
          float d = clamp(length(gl_PointCoord - 0.5) * 2.0, 0.0, 1.0);
          float a = (1.0 - d) * (1.0 - d) * sin(3.14159 * vAge) * uAmount;
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.0, 0.6, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 7;
  return { points, uniforms };
}

/**
 * A flame along a curve (the kerosene burner): a tube whose radius swells from the nozzle and dies at the tip, its
 * surface rippling slowly (no flicker of brightness), soft at its edge. Three layers make it: a warm white core, a
 * signal sheath, a tight halo — their sum stays under 3.
 */
function flameLayer(curve, r0, color, k, power) {
  const geo = new THREE.TubeGeometry(curve, 64, r0, 20, false);
  const uniforms = { uT: { value: 0 }, uAmount: { value: 0 }, uR: { value: r0 }, uColor: { value: new THREE.Color(color).multiplyScalar(k) }, uPower: { value: power } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uT, uR; varying vec3 vN; varying vec3 vV; varying float vU;
      void main() {
        vU = uv.x;
        float swell = mix(0.45, 1.25, smoothstep(0.0, 0.35, uv.x)) * (1.0 - 0.55 * smoothstep(0.55, 1.0, uv.x));
        float ripple = 0.16 * sin(dot(position, vec3(0.31, 0.27, 0.4)) * 1.3 - uT * 6.0) * smoothstep(0.1, 0.6, uv.x);
        vec3 p = position + normal * uR * (swell - 1.0 + ripple);
        p.y += uv.x * uv.x * 1.4 * sin(uT * 2.1);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uPower; varying vec3 vN; varying vec3 vV; varying float vU;
      void main() {
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
        float along = smoothstep(0.0, 0.06, vU) * (1.0 - smoothstep(0.5, 1.0, vU));
        gl_FragColor = vec4(uColor * f * along * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/* ─────────────────────────────────── canvases ─────────────────────────────────── */

/** The quilting of the case, as a bump map: a diamond of stitches. */
function quiltTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#909090";
  g.fillRect(0, 0, 256, 256);
  g.filter = "blur(3px)";
  g.strokeStyle = "#383838";
  g.lineWidth = 7;
  for (let k = -256; k <= 512; k += 64) {
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k + 256, 256);
    g.moveTo(k, 256);
    g.lineTo(k + 256, 0);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 2);
  return t;
}

/** The pressure gauge's face: a light disc, ticks over 230°, no number, no colour. */
function gaugeTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#d4cec1";
  g.beginPath();
  g.arc(128, 128, 126, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#1c1b18";
  for (let i = 0; i <= 23; i++) {
    const a = (-115 + (230 * i) / 23) * DEG - Math.PI / 2;
    const long = i % 4 === 0;
    g.lineWidth = long ? 7 : 3.5;
    g.beginPath();
    g.moveTo(128 + Math.cos(a) * (long ? 82 : 96), 128 + Math.sin(a) * (long ? 82 : 96));
    g.lineTo(128 + Math.cos(a) * 114, 128 + Math.sin(a) * 114);
    g.stroke();
  }
  g.lineWidth = 5;
  g.beginPath();
  g.arc(128, 128, 118, (-115 - 90) * DEG, (115 - 90) * DEG);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** The crash-test target: four quadrants, dark and light. */
function targetTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  for (let q = 0; q < 4; q++) {
    g.fillStyle = q % 2 ? "#d8d2c4" : "#1a1917";
    g.beginPath();
    g.moveTo(64, 64);
    g.arc(64, 64, 62, (q * Math.PI) / 2, ((q + 1) * Math.PI) / 2);
    g.closePath();
    g.fill();
  }
  g.strokeStyle = "#1a1917";
  g.lineWidth = 4;
  g.beginPath();
  g.arc(64, 64, 61, 0, Math.PI * 2);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ─────────────────────────────────── the documents ─────────────────────────────────── */

const DOC_PX = 16; // canvas pixels per cm of paper
const DW = DOC.w * DOC_PX;
const DH = DOC.h * DOC_PX;

function fitFont(g, text, weight, size, family, maxW) {
  let s = size;
  g.font = `${weight} ${s}px ${family}`;
  while (g.measureText(text).width > maxW && s > 10) {
    s -= 2;
    g.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

/**
 * One document: its paper (grain, a header rule, faint filler lines) and its ink on another canvas (transparent),
 * so that the highlights can lie BETWEEN the paper and the ink. Returns the rectangles (cm, in the sheet's own plane:
 * x from the left edge, z from the top edge) of the highlight under the big word and under each line.
 */
function drawDoc(i, paperC, inkC) {
  const d = DOCS[i];
  const r = rng(101 + i);
  const pg = paperC.getContext("2d");
  pg.fillStyle = "#b8b1a1";
  pg.fillRect(0, 0, DW, DH);
  for (let k = 0; k < 5000; k++) {
    pg.fillStyle = r() < 0.5 ? "rgba(40,34,26,0.06)" : "rgba(255,250,240,0.06)";
    pg.fillRect(r() * DW, r() * DH, 2 + r() * 3, 2 + r() * 3);
  }
  // a faint margin and a slight darkening at the edges: a sheet, not a slab
  const grad = pg.createRadialGradient(DW / 2, DH / 2, DH * 0.25, DW / 2, DH / 2, DH * 0.75);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(30,24,18,0.18)");
  pg.fillStyle = grad;
  pg.fillRect(0, 0, DW, DH);
  // filler: grey words of random lengths, nothing legible is made up
  pg.fillStyle = "rgba(28,26,23,0.22)";
  for (let k = 0; k < 4; k++) {
    let x = 64;
    const y = 1110 + k * 34;
    const end = k === 3 ? 64 + 500 * (0.5 + 0.4 * r()) : DW - 64;
    while (x < end) {
      const w = 30 + r() * 110;
      pg.fillRect(x, y, Math.min(w, end - x), 11);
      x += w + 14;
    }
  }

  const g = inkC.getContext("2d");
  g.clearRect(0, 0, DW, DH);
  const ink = "#1b1a17";
  g.fillStyle = ink;
  g.textBaseline = "alphabetic";
  g.textAlign = "left";
  // header
  g.font = `500 24px ${FONT_M}`;
  g.globalAlpha = 0.7;
  g.fillText(`PIÈCE ${String(i + 1).padStart(2, "0")}`, 64, 82);
  g.textAlign = "right";
  g.fillText("DOSSIER L03", DW - 64, 82);
  g.textAlign = "left";
  g.fillRect(64, 98, DW - 128, 3);
  g.globalAlpha = 1;
  // the year, the title
  g.font = `700 200px ${FONT_D}`;
  g.fillText(d.year, 60, 300);
  fitFont(g, d.title, 600, 64, FONT_D, DW - 128);
  g.fillText(d.title, 64, 382);
  g.globalAlpha = 0.75;
  g.fillRect(64, 418, DW - 128, 3);
  g.globalAlpha = 1;
  // the big word
  fitFont(g, d.big, 700, 220, FONT_D, DW - 128);
  const bigW = g.measureText(d.big).width;
  g.fillText(d.big, 62, 650);
  // the lines
  const rects = [{ x: 62 / DOC_PX, z: 676 / DOC_PX, w: bigW / DOC_PX, h: 20 / DOC_PX }];
  const size = Math.min(...d.lines.map((l) => fitFont(g, l, 500, 38, FONT_M, DW - 152)));
  g.font = `500 ${size}px ${FONT_M}`;
  d.lines.forEach((l, k) => {
    const y = 800 + k * 92;
    g.fillText(l, 76, y);
    const w = g.measureText(l).width;
    rects.push({ x: 64 / DOC_PX, z: (y - size * 0.62) / DOC_PX, w: (w + 24) / DOC_PX, h: (size * 1.45) / DOC_PX });
  });
  return rects;
}

/* ═══════════════════════════════════ THE MODEL ═══════════════════════════════════ */

// the floor brackets (cabine.js · A.sill) stand 6.5 cm high, slotted: the armed bar rides GIRT_SEAT above the floor
const GIRT_SEAT = 7.5; // the bar centre inside the brackets' slots (their ears: 4 → 9 cm)
const SILL_AT = new THREE.Vector3();

export function buildModel() {
  const quilt = quiltTexture();

  /* ══════════════ the pack ══════════════ */
  const group = new THREE.Group();
  group.name = "slidePack";
  const body = new THREE.Group(); // all but the girt bar and the rig: what the door pulls out, what falls outside
  group.add(body);

  /* ── the case: bottom, back, ends, the lid (hinged at the back) and the rabat (the front, hinged at the bottom) ── */
  const casePart = makePart("case");
  const caseMat = solid(G.case, { rough: 0.95 });
  caseMat.bumpMap = quilt;
  caseMat.bumpScale = 2.2;
  caseMat.userData.finish = false;
  const strapMat = solid(G.strap, { rough: 0.85 });
  const buckleMat = solid(G.valve, { rough: 0.4, metal: 0.45 });
  const lo = { edgeOpacity: 0.5 };
  addMesh(casePart, box(100, 3, 32, 1.2), caseMat, { pos: [0, 1.5, 0], ...lo });
  addMesh(casePart, box(100, 38, 3, 1.2), caseMat, { pos: [0, 22, -14.5], ...lo });
  for (const s of [-1, 1]) {
    addMesh(casePart, box(3, 38, 26, 1.2), caseMat, { pos: [s * 48.5, 22, 0], ...lo });
    addMesh(casePart, box(6, 38.4, 0.8, 0.3), strapMat, { pos: [s * 30, 22, -16.3], edgeOpacity: 0.35 });
  }
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 41, -16);
  casePart.add(lidPivot);
  const caseOn = (pivot, geo, mat, o) => pivot.add(addMesh(casePart, geo, mat, o));
  caseOn(lidPivot, box(100, 4, 32, 1.5), caseMat, { pos: [0, 2, 16], ...lo });
  for (const s of [-1, 1]) {
    caseOn(lidPivot, box(6, 0.8, 32.4, 0.3), strapMat, { pos: [s * 30, 4.3, 16], edgeOpacity: 0.35 });
    caseOn(lidPivot, box(5, 2.4, 11, 0.6), strapMat, { pos: [s * 18, 5.2, 8], edgeOpacity: 0.35 }); // the bottle's saddles
  }
  const rabatPivot = new THREE.Group();
  rabatPivot.position.set(0, 3, 16);
  casePart.add(rabatPivot);
  caseOn(rabatPivot, box(100, 38, 3, 1.2), caseMat, { pos: [0, 19, -1.5], ...lo });
  for (const s of [-1, 1]) {
    caseOn(rabatPivot, box(6, 38.4, 0.8, 0.3), strapMat, { pos: [s * 30, 19, 0.3], edgeOpacity: 0.35 });
    caseOn(rabatPivot, box(8, 4.5, 1.6, 0.4), buckleMat, { pos: [s * 30, 30, 0.9] });
  }
  body.add(casePart);

  /* ── the folded slide: tight pleats of light canvas, two ties ── */
  const slidePart = makePart("slide");
  const slideMat = solid(G.fabric, { rough: 0.9 });
  slideMat.userData.finish = false;
  const pleats = [];
  for (let i = 0; i < 10; i++) {
    const odd = i % 2;
    pleats.push(placed(box(94 - odd * 1.2, 3.7, 25, 1.75), { pos: [odd ? 0.6 : -0.6, 5.2 + i * 3.75, odd ? 0.5 : -0.5] }));
  }
  addMesh(slidePart, mergeGeometries(pleats), slideMat, { edgeOpacity: 0.32 });
  const tieMat = solid(G.strap, { rough: 0.85 });
  for (const s of [-1, 1]) addMesh(slidePart, box(3, 38.6, 26.6, 0.4), tieMat, { pos: [s * 24, 22, 0], edgeOpacity: 0.3 });
  body.add(slidePart);

  /* ── the bottle: lying along x, its valve, lever and gauge at its +x end ── */
  const bottleG = new THREE.Group();
  const bottlePart = makePart("bottle");
  bottleG.add(bottlePart);
  const bottleMat = solid(G.metal, { rough: 0.42, metal: 0.4 });
  const valveMat = solid(G.valve, { rough: 0.38, metal: 0.45 });
  const ringMat = solid(G.steel, { rough: 0.6, metal: 0.3 });
  const BOTTLE = [[0, -31], [5, -30.4], [7.8, -28.6], [9, -25.5], [9, 24], [8.2, 27], [6, 29.3], [3.4, 30.6], [3.2, 31.5], [0, 31.5]];
  addMesh(bottlePart, lathe(BOTTLE, 64, { bevel: 0.3 }).rotateZ(-Math.PI / 2), bottleMat, { edgeOpacity: 0.55 });
  for (const x of [-14, 14]) addMesh(bottlePart, lathe([[0, -1.2], [9.3, -1.2], [9.3, 1.2], [0, 1.2]], 64, { bevel: 0.25 }).rotateZ(-Math.PI / 2), ringMat, { pos: [x, 0, 0], edgeOpacity: 0.5 });
  addMesh(bottlePart, box(7, 7.5, 7, 0.6), valveMat, { pos: [35, 0, 0] });
  addMesh(bottlePart, cyl(1.4, 3.6, 0.2, 24).rotateZ(-Math.PI / 2), valveMat, { pos: [40.3, 0, 0] });
  const lever = new THREE.Group();
  lever.position.set(35, 3.75, 0);
  bottlePart.add(lever);
  lever.add(addMesh(bottlePart, cyl(0.8, 2, 0.15, 16), valveMat, { pos: [0, 1, 0] }));
  lever.add(addMesh(bottlePart, box(1.4, 1.1, 9, 0.35), ringMat, { pos: [0, 2.3, 2.8] }));
  // the gauge, tilted toward where the camera stands in both arrangements (up and toward +z, a little toward the end)
  const gauge = new THREE.Group();
  gauge.position.set(33.6, 3.6, 3.4);
  gauge.quaternion.setFromUnitVectors(UP, new THREE.Vector3(0.3, 0.6, 0.75).normalize());
  bottlePart.add(gauge);
  gauge.add(addMesh(bottlePart, cyl(3.5, 2.4, 0.3, 40), valveMat, { pos: [0, 1.2, 0] }));
  const faceMat = new THREE.MeshStandardMaterial({ map: gaugeTexture(), roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -1 });
  Object.assign(faceMat.userData, { base: 1, transparent: false, depthWrite: true });
  const face = addMesh(bottlePart, new THREE.CircleGeometry(3.05, 40).rotateX(-Math.PI / 2), faceMat, { pos: [0, 2.42, 0], edges: false });
  gauge.add(face);
  const needle = new THREE.Group();
  needle.position.set(0, 2.55, 0);
  gauge.add(needle);
  needle.add(addMesh(bottlePart, box(0.32, 0.18, 2.5, 0.06), ringMat, { pos: [0, 0, -1.0], edges: false }));
  const valveA = new THREE.Object3D();
  valveA.position.set(35, 4, 0);
  bottleG.add(valveA);
  body.add(bottleG);

  /* ── the aspirators ── */
  const ASP = { top: 28, rim: 7.6, hinge: 27.75, hub: 2.3, out: 9, flapL: 5.3, inlet: 24.5 };
  const ASP_PROFILE = [[6.8, 0], [9.2, 0], [9.2, 1.6], [8, 2.1], [8, 23.5], [8.8, 26.4], [9, 28], [7.6, 28], [7.4, 26], [6.4, 20.5], [4.6, 14], [5.6, 7], [6.8, 0]];
  const halfWall = (start) => toCreasedNormals(new THREE.LatheGeometry(chamfer(ASP_PROFILE, 0.28, 2).map(([r, y]) => new THREE.Vector2(r, y)), 36, start, Math.PI), 40 * DEG);
  const capShape = new THREE.Shape(ASP_PROFILE.slice(0, -1).map(([r, y]) => new THREE.Vector2(r, y)));
  const capR = new THREE.ShapeGeometry(capShape);
  const capL = capR.clone().scale(-1, 1, 1);
  const flapGeo = plate([[-3, 0], [3, 0], [0.9, -ASP.flapL], [-0.9, -ASP.flapL]], 0.5, { bevel: 0.12 }).rotateX(Math.PI / 2).translate(0, 0.5, 0);
  const halfRing = (r, y, from) => {
    const pts = [];
    for (let k = 0; k <= 36; k++) {
      const a = from + (Math.PI * k) / 36;
      pts.push([Math.sin(a) * r, y, Math.cos(a) * r]);
    }
    return pts;
  };
  const AIR_PATH = [[ASP.out + 10, ASP.top + 13], [ASP.out + 3, ASP.top + 5], [4.6, ASP.top + 1.2], [3.4, 13], [3.0, -5]];
  const LEAK_K = 5; // the back flap on the outer side of aspirator 0 (phi 247.5°): the one a debris props open
  const LEAK_PHI = Math.PI / 8 + (LEAK_K * Math.PI) / 4;
  const LEAK_PATH = [[2.6, 12], [4.2, 23], [6.6, 28.8], [ASP.out + 4, ASP.top + 6], [ASP.out + 11, ASP.top + 14]];

  function makeAspirator(i) {
    const g = new THREE.Group();
    const back = makePart(`asp${i}-back`);
    const front = makePart(`asp${i}-front`);
    g.add(back, front);
    const bodyB = solid(G.metal, { rough: 0.45, metal: 0.35, double: true });
    const bodyF = solid(G.metal, { rough: 0.45, metal: 0.35, double: true });
    const capMat = solid(G.cut, { rough: 0.5, metal: 0.2, double: true });
    const innerMat = solid(G.valve, { rough: 0.4, metal: 0.4 });
    const flapB = solid(G.flap, { rough: 0.35, metal: 0.3 });
    const flapF = solid(G.flap, { rough: 0.35, metal: 0.3 });
    addMesh(back, halfWall(Math.PI / 2), bodyB, { edges: false });
    addMesh(front, halfWall(-Math.PI / 2), bodyF, { edges: false });
    // the inside of the back half, dark: the cut reads light on its faces, dark inside, the jet and the air bright in it
    const liner = new THREE.LatheGeometry([[7.52, 28], [7.32, 26], [6.32, 20.5], [4.52, 14], [5.52, 7], [6.72, 0]].map(([r, y]) => new THREE.Vector2(r, y)), 36, Math.PI / 2, Math.PI);
    addMesh(back, liner, solid(0x4a4743, { rough: 0.7, metal: 0.1, double: true }), { edges: false });
    addMesh(back, capR, capMat, { pos: [0, 0, 0.02], edgeColor: 0x1d2226, edgeOpacity: 0.85, edgeWidth: 1.8 });
    addMesh(back, capL, capMat, { pos: [0, 0, 0.02], edgeColor: 0x1d2226, edgeOpacity: 0.85, edgeWidth: 1.8 });
    // the rims, as fine lines (a lathe has no edge of its own to draw)
    for (const [part, from] of [[back, Math.PI / 2], [front, -Math.PI / 2]]) {
      for (const [r, y] of [[9, 28], [9.2, 1.6], [8, 23.5]]) {
        const line = fatLine(halfRing(r, y, from), { color: BRAND.ink, width: 1.8, opacity: 0.55 });
        part.add(line);
        part.userData.part.mats.add(line.material);
      }
    }
    // the gas: a pipe in from the back, an elbow, the nozzle pointing down; the hub the flaps rest on; the outside stub
    addMesh(back, cyl(0.9, 12.5, 0.1, 20).rotateX(Math.PI / 2), innerMat, { pos: [0, ASP.inlet, -6.25], edgeOpacity: 0.4 });
    addMesh(back, new THREE.SphereGeometry(1.15, 20, 14), innerMat, { pos: [0, ASP.inlet, 0], edges: false });
    addMesh(back, lathe([[0, 21], [0.5, 21], [1.25, 23.6], [1.15, 24.5], [0, 24.5]], 32, { bevel: 0.08 }), innerMat, { edgeOpacity: 0.4 });
    addMesh(back, cyl(0.6, 3.4, 0.1, 16), innerMat, { pos: [0, ASP.inlet + 1.7, 0], edges: false });
    addMesh(back, cyl(ASP.hub, 1.1, 0.25, 32), innerMat, { pos: [0, ASP.hinge + 0.2, 0], edgeOpacity: 0.5 });
    // the flaps: 8 around the rim, hinged at it; they swing down, inward
    const flaps = [];
    for (let k = 0; k < 8; k++) {
      const phi = Math.PI / 8 + (k * Math.PI) / 4;
      const isBack = Math.cos(phi) < 0;
      const part = isBack ? back : front;
      const turn = new THREE.Group();
      turn.rotation.y = phi;
      const hinge = new THREE.Group();
      hinge.position.set(0, ASP.hinge, ASP.rim);
      turn.add(hinge);
      part.add(turn);
      hinge.add(addMesh(part, flapGeo, isBack ? flapB : flapF, { edgeColor: 0x1d2226, edgeOpacity: 0.7, edgeWidth: 1.8 }));
      flaps.push(hinge);
    }
    // the jet, the low pressure, the air (and on aspirator 0, the leak)
    const jetM = jetMat();
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 3.2, 20, 28, 8, true), jetM);
    jet.position.y = 11;
    jet.renderOrder = 5;
    g.add(jet);
    const darkM = softShade(0.75, 1.3);
    const dark = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), darkM);
    dark.scale.set(5.2, 6.8, 5.2);
    dark.position.set(0, 18.8, -0.6);
    dark.renderOrder = 4;
    g.add(dark);
    const air = makeAirStreaks({ n: 18, pts: AIR_PATH, color: BRAND.veille, k: 1.9, len: 0.24, width: 0.32, minPx: 2.4, seed: 11 + i });
    g.add(air.mesh);
    let leak = null;
    let debris = null;
    if (i === 0) {
      leak = makeAirStreaks({ n: 12, pts: LEAK_PATH, color: BRAND.signal, k: 2.0, len: 0.26, width: 0.32, minPx: 2.4, spread: 3, spreadEnd: 1, phi: LEAK_PHI, phiJitter: 0.22, speed: 1.3, seed: 29 });
      g.add(leak.mesh);
      const debrisMat = solid(0x4e4a44, { rough: 0.8 });
      debrisMat.emissive = SIGNAL.clone().multiplyScalar(0.35);
      debris = addMesh(back, new THREE.IcosahedronGeometry(1.25, 1).scale(1.1, 0.75, 0.9), debrisMat, { edgeOpacity: 0.6 });
      debris.position.set(0, -0.9, -4.1);
      flaps[LEAK_K].add(debris);
    }
    const mouth = new THREE.Object3D();
    mouth.position.set(0, ASP.top + 0.5, 0);
    g.add(mouth);
    const hinges = new THREE.Object3D();
    hinges.position.set(0, ASP.hinge, 0);
    g.add(hinges);
    return { g, back, front, flaps, flapB, flapF, bodyB, bodyF, jet, jetM, dark, darkM, air, leak, debris, mouth, hinges };
  }
  const asp = [makeAspirator(0), makeAspirator(1)];
  for (const a of asp) body.add(a.g);

  /* ── the closed pack's hose (valve → aspirator 1 → manifold → aspirator 0) ── */
  const hosePart = makePart("hose");
  const hoseMat = solid(G.hose, { rough: 0.7 });
  const CLOSED_HOSE = [[41.5, 54, -8], [45.5, 58.5, -7], [43, 66, -4.5], [33, 69.5, -2.5], [23, 69.5, -2.5]].map((v) => new THREE.Vector3(...v));
  addMesh(hosePart, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(CLOSED_HOSE), 48, 1.3, 12), hoseMat, { edges: false });
  addMesh(hosePart, cyl(1.2, 46, 0.1, 16).rotateZ(Math.PI / 2), hoseMat, { pos: [0, 69.5, -2.5], edges: false });
  body.add(hosePart);

  /* ── the girt bar and its end fittings; the girt (the slide's fabric apron) down to it ── */
  const girtG = new THREE.Group();
  const girtPart = makePart("girt");
  girtG.add(girtPart);
  const girtMat = solid(G.girt, { rough: 0.35, metal: 0.45 });
  const fitMat = solid(G.valve, { rough: 0.4, metal: 0.45 });
  addMesh(girtPart, cyl(PACK.girt.r, PACK.girt.l, 0.2, 24).rotateZ(Math.PI / 2), girtMat, { edgeOpacity: 0.6 });
  for (const s of [-1, 1]) {
    addMesh(girtPart, box(4.2, 3.8, 4.2, 0.5), fitMat, { pos: [s * (PACK.girt.l / 2 + 1.6), 0, 0] });
    addMesh(girtPart, box(2.2, 5, 2.6, 0.4), fitMat, { pos: [s * (PACK.girt.l / 2 + 1.6), -3.6, 0] });
  }
  group.add(girtG);
  const apronPart = makePart("apron");
  const apronMat = solid(G.fabric, { rough: 0.9, double: true });
  const AP_N = 7;
  const apronGeo = new THREE.BufferGeometry();
  const apronPos = new Float32Array(AP_N * 2 * 3);
  const apronNrm = new Float32Array(AP_N * 2 * 3);
  apronGeo.setAttribute("position", new THREE.BufferAttribute(apronPos, 3));
  apronGeo.setAttribute("normal", new THREE.BufferAttribute(apronNrm, 3));
  {
    const idx = [];
    for (let k = 0; k < AP_N - 1; k++) idx.push(k, k + AP_N, k + 1, k + 1, k + AP_N, k + 1 + AP_N);
    apronGeo.setIndex(idx);
  }
  const apron = addMesh(apronPart, apronGeo, apronMat, { edges: false });
  apron.frustumCulled = false;
  group.add(apronPart);

  /* ── the cradle (the bench only) ── */
  const cradlePart = makePart("cradle");
  const steelMat = solid(G.steel, { rough: 0.55, metal: 0.4 });
  addMesh(cradlePart, box(80, 2, 30, 0.5), steelMat, { pos: [0, -PACK.y + 1, 0] });
  for (const s of [-1, 1]) addMesh(cradlePart, box(8, PACK.y - 2, 30, 0.6), steelMat, { pos: [s * 32, -(PACK.y - 2) / 2, 0] });
  group.add(cradlePart);

  /* ── the RIG (explode 2): the stand, the head tube, the hose up to the manifold ── */
  const rigPart = makePart("rig");
  const rigSteel = solid(G.steel, { rough: 0.55, metal: 0.4 });
  const Y_TOP = 58; // the tube's top line: the aspirators sit on it
  for (const s of [-1, 1]) {
    addMesh(rigPart, cyl(2.4, 74, 0.3, 24), rigSteel, { pos: [s * 90, -PACK.y + 37, 0] });
    addMesh(rigPart, box(22, 2, 22, 0.5), rigSteel, { pos: [s * 90, -PACK.y + 1, 0] });
    addMesh(rigPart, box(14, 3, 4, 0.5), rigSteel, { pos: [s * 85, Y_TOP + 4.5, 0] });
    addMesh(rigPart, box(2.6, 5, 3, 0.3), solid(G.strap, { rough: 0.85 }), { pos: [s * 78.7, Y_TOP + 1.5, 0], edgeOpacity: 0.4 });
  }
  const RIG_HOSE = new THREE.CatmullRomCurve3([[122, -1.5, 36.5], [122, 3, 41], [121, 28, 30], [114, 60, 4], [100, 78, -16], [62, 81.5, -15], [23, 80.5, -12.5]].map((v) => new THREE.Vector3(...v)));
  const MANIFOLD = new THREE.LineCurve3(new THREE.Vector3(23, 80.5, -12.5), new THREE.Vector3(-23, 80.5, -12.5));
  const rigHoseMat = solid(G.hose, { rough: 0.7 });
  addMesh(rigPart, new THREE.TubeGeometry(RIG_HOSE, 96, 1.4, 12), rigHoseMat, { edges: false });
  addMesh(rigPart, new THREE.TubeGeometry(MANIFOLD, 8, 1.25, 12), rigHoseMat, { edges: false });
  group.add(rigPart);
  const hoseLen = RIG_HOSE.getLength();
  const flowA = new THREE.Mesh(new THREE.TubeGeometry(RIG_HOSE, 96, 1.8, 12), flowMat(hoseLen, 0));
  const flowB = new THREE.Mesh(new THREE.TubeGeometry(MANIFOLD, 8, 1.65, 12), flowMat(46, hoseLen));
  for (const f of [flowA, flowB]) {
    f.renderOrder = 5;
    f.frustumCulled = false;
    group.add(f);
  }
  const FLOW_END = hoseLen + 46;
  const FLOWS = [flowA, flowB];

  // the head tube: a unit cylinder (axis x) shaped in its vertex shader — an ellipse of constant girth, from a flat
  // hanging curtain (folds) to a full round, its top line fixed under the aspirators
  const tubePart = makePart("tube");
  const tubeMat = solid(0xb9b1a1, { rough: 0.88 });
  tubeMat.userData.finish = false;
  const TU = { uA: { value: TUBE.r }, uB: { value: TUBE.r }, uL: { value: TUBE.l }, uFlat: { value: 0 } };
  tubeMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, TU);
    sh.vertexShader =
      "uniform float uA, uB, uL, uFlat;\n" +
      sh.vertexShader
        .replace(
          "#include <beginnormal_vertex>",
          /* glsl */ `
          vec3 objectNormal = vec3(normal);
          float tSide = 1.0 - step(0.5, abs(normal.x));
          float tAng = atan(position.z, position.y);
          float tPh = position.x * uL * 0.33 + 2.3 * sin(position.x * uL * 0.061) + tAng * 3.0;
          float tAmp = uFlat * 0.75 * tSide;
          if (tSide > 0.5) objectNormal = normalize(vec3(0.0, position.y / max(uB, 0.5), position.z / max(uA, 0.5)));
          objectNormal.x -= tAmp * 0.66 * cos(tPh);
          objectNormal = normalize(objectNormal);
          #ifdef USE_TANGENT
            vec3 objectTangent = vec3(tangent.xyz);
          #endif`,
        )
        .replace(
          "#include <begin_vertex>",
          /* glsl */ `
          vec3 transformed = vec3(position.x * uL, position.y * uB, position.z * uA);
          transformed += objectNormal * tAmp * sin(tPh);`,
        );
  };
  tubeMat.customProgramCacheKey = () => "L03-head-tube";
  const tubeMesh = addMesh(tubePart, new THREE.CylinderGeometry(1, 1, 1, 56, 28, false).rotateZ(-Math.PI / 2), tubeMat, { edges: false });
  tubeMesh.castShadow = false;
  tubeMesh.frustumCulled = false;
  tubePart.userData.part.meshes.length = 0;
  group.add(tubePart);
  const tubeA = new THREE.Object3D();
  group.add(tubeA);
  const girtA = new THREE.Object3D();
  girtG.add(girtA);

  /* ── where each piece stands (pack frame): closed · lanes (explode 1) · rig (explode 2) ── */
  const HOME = {
    bottle: new THREE.Vector3(-2, 54, -8),
    bottleLane: new THREE.Vector3(0, 104, -10),
    bottleRig: new THREE.Vector3(122, -1.5, -6),
    asp: [new THREE.Vector3(-23, 45, 10), new THREE.Vector3(23, 45, 10)],
    aspLane: [new THREE.Vector3(-56, 58, 16), new THREE.Vector3(56, 58, 16)],
    aspRig: [new THREE.Vector3(-23, Y_TOP - 2, 0), new THREE.Vector3(23, Y_TOP - 2, 0)],
    slideLane: new THREE.Vector3(0, 31, 2),
    girt: new THREE.Vector3(0, 3, 18.5),
    girtLane: new THREE.Vector3(0, -PACK.y + 2.6, 64),
  };

  /* ── what the voice names lights up (veille on the part, its edges veille) ── */
  const litOf = (parts, skip = []) => {
    const solids = [];
    const lines = [];
    for (const part of parts)
      for (const m of part.userData.part.mats) {
        if (skip.includes(m)) continue;
        if (m.isLineMaterial) {
          m.userData.baseColor = m.color.clone();
          lines.push(m);
        } else if (m.emissive) solids.push(m);
      }
    return { solids, lines };
  };
  const flapMats = [asp[0].flapB, asp[0].flapF, asp[1].flapB, asp[1].flapF];
  const LIT = [
    null,
    litOf([slidePart]),
    litOf([bottlePart], [faceMat]),
    litOf([asp[0].back, asp[0].front, asp[1].back, asp[1].front], [...flapMats, asp[0].debris.material]),
    litOf([girtPart]),
  ];
  const lightUp = (lit, k) => {
    for (let i = 0; i < lit.solids.length; i++) lit.solids[i].emissive.copy(VEILLE).multiplyScalar(0.12 * k);
    for (let i = 0; i < lit.lines.length; i++) lit.lines[i].color.copy(lit.lines[i].userData.baseColor).lerp(VEILLE, k);
  };

  /* ══════════════ the items ══════════════ */
  const items = new THREE.Group();
  items.name = "benchItems";

  /* ── 1 · the 16 g seat on its sled ── */
  const seatG = new THREE.Group();
  const seatPart = makePart("seat");
  seatG.add(seatPart);
  // the track: two rails (still), and what runs under the sled (ties, marks: irregular, so nothing strobes)
  const railMat = solid(G.steel, { rough: 0.5, metal: 0.4 });
  for (const z of [-40, 40]) {
    addMesh(seatPart, box(1400, 1.2, 10, 0.3), railMat, { pos: [0, 3.1, z], edgeOpacity: 0.5 });
    addMesh(seatPart, box(1400, 7, 1.6, 0.3), railMat, { pos: [0, 7.2, z], edgeOpacity: 0.4 });
    addMesh(seatPart, box(1400, 1.6, 7, 0.3), railMat, { pos: [0, 11.5, z], edgeOpacity: 0.6 });
  }
  const TRACK_P = 520;
  const tieGeos = [];
  const markGeos = [];
  for (let rep = -2; rep < 2; rep++)
    for (const off of [0, 95, 230, 300, 410]) {
      tieGeos.push(placed(box(8, 2.5, 104, 0.4), { pos: [rep * TRACK_P + off, 1.25, 0] }));
      for (const z of [-41, 41]) markGeos.push(placed(box(3, 4.6, 0.4, 0.1), { pos: [rep * TRACK_P + off + 46, 7.2, z + Math.sign(z) * 0.6] }));
    }
  const track = new THREE.Group();
  seatPart.add(track);
  track.add(addMesh(seatPart, mergeGeometries(tieGeos), solid(0x6b675f, { rough: 0.7 }), { edgeOpacity: 0.45 }));
  track.add(addMesh(seatPart, mergeGeometries(markGeos), solid(0xd2ccbf, { rough: 0.6 }), { edges: false }));
  // the sled
  const sledMat = solid(0x5a5752, { rough: 0.55, metal: 0.35 });
  addMesh(seatPart, box(150, 6, 120, 1), sledMat, { pos: [0, 16, 0] });
  for (const x of [-50, 50]) for (const z of [-40, 40]) addMesh(seatPart, box(26, 6, 12, 0.8), sledMat, { pos: [x, 14, z] });
  const targetMat = new THREE.MeshStandardMaterial({ map: targetTexture(), roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -1 });
  Object.assign(targetMat.userData, { base: 1, transparent: false, depthWrite: true });
  for (const x of [-48, 48]) addMesh(seatPart, new THREE.CircleGeometry(2.6, 32), targetMat, { pos: [x, 16, 60.05], edges: false });
  // the row: three economy seats facing −x
  const FLOOR = 19;
  const cushMat = solid(G.seat, { rough: 0.9 });
  cushMat.userData.finish = false;
  const shellMat = solid(G.shell, { rough: 0.55, metal: 0.1 });
  const legMat = solid(G.legs, { rough: 0.4, metal: 0.45 });
  const beltMat = solid(G.belt, { rough: 0.75 });
  const backs = [];
  for (const z of [-50, 0, 50]) {
    addMesh(seatPart, box(46, 10, 46, 3), cushMat, { pos: [-2, FLOOR + 41, z], edgeOpacity: 0.45 });
    const back = new THREE.Group();
    back.position.set(21, FLOOR + 43, z);
    back.rotation.z = -13 * DEG;
    seatPart.add(back);
    back.add(addMesh(seatPart, box(9, 52, 46, 3), cushMat, { pos: [0, 26, 0], edgeOpacity: 0.45 }));
    back.add(addMesh(seatPart, box(3, 54, 47, 1), shellMat, { pos: [5.5, 27, 0] }));
    backs.push(back);
    if (z !== 50) addMesh(seatPart, box(6, 0.8, 30, 0.3), beltMat, { pos: [-6, FLOOR + 46.4, z], edgeOpacity: 0.4 });
  }
  for (const z of [-75, -25, 25, 75]) {
    addMesh(seatPart, box(30, 4, 5, 1.5), shellMat, { pos: [-6, FLOOR + 59, z] });
    addMesh(seatPart, box(4, 17, 4, 1), legMat, { pos: [10, FLOOR + 49, z] });
  }
  for (const z of [-38, 38]) {
    addMesh(seatPart, box(4, 33, 4, 1), legMat, { pos: [-18, FLOOR + 18.5, z] });
    addMesh(seatPart, box(4, 33, 4, 1), legMat, { pos: [16, FLOOR + 18.5, z] });
    addMesh(seatPart, box(46, 3, 4, 1), legMat, { pos: [-1, FLOOR + 1.5, z] });
  }
  for (const x of [-14, 14]) addMesh(seatPart, cyl(2.2, 150, 0.2, 24).rotateX(Math.PI / 2), legMat, { pos: [x, FLOOR + 34, 0] });

  // the dummy, in the +z seat: solid, ink grey, its joints dark and readable
  const DZ = 50;
  const dummyMat = solid(G.dummy, { rough: 0.5, metal: 0.1 });
  const jointMat = solid(G.joint, { rough: 0.6 });
  const dummy = new THREE.Group();
  dummy.position.set(0, 0, DZ);
  seatPart.add(dummy);
  const onDummy = (parent, geo, mat, o) => parent.add(addMesh(seatPart, geo, mat, o));
  const limb = (parent, a, b, r, mat = dummyMat) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...b);
    const len = A.distanceTo(B);
    const m = addMesh(seatPart, new THREE.CapsuleGeometry(r, Math.max(0.1, len - r * 0.4), 8, 20), mat, { edges: false });
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, B.clone().sub(A).normalize());
    parent.add(m);
    return m;
  };
  const ball = (parent, at, r) => onDummy(parent, new THREE.SphereGeometry(r, 24, 16), jointMat, { pos: at, edges: false });
  onDummy(dummy, box(24, 15, 34, 6), dummyMat, { pos: [2, 72, 0], edgeOpacity: 0.35 });
  for (const s of [-1, 1]) {
    ball(dummy, [0, 72, s * 9.5], 7.6);
    limb(dummy, [-2, 72, s * 9.5], [-40, 73, s * 10.5], 7.2);
    ball(dummy, [-40, 73, s * 10.5], 6.3);
    limb(dummy, [-40, 73, s * 10.5], [-45, 28, s * 10.5], 5.3);
    ball(dummy, [-45, 28, s * 10.5], 4.4);
    onDummy(dummy, box(23, 7, 10, 2.5), dummyMat, { pos: [-51, FLOOR + 3.6, s * 10.5], edgeOpacity: 0.35 });
  }
  // the lap belt over the pelvis (it does not move: the pelvis is what it holds)
  for (const s of [-1, 1]) {
    const m = addMesh(seatPart, box(26, 1, 5, 0.3), beltMat, { pos: [1, 69, s * 18], rot: [s * 0.1, s * 0.62, -0.28], edgeOpacity: 0.45 });
    dummy.add(m);
  }
  onDummy(dummy, box(1.2, 5.2, 21, 0.4), beltMat, { pos: [-10.6, 72.5, 0], edgeOpacity: 0.45 });
  onDummy(dummy, box(1.6, 5.8, 7, 0.4), legMat, { pos: [-11.4, 72.5, 0] });
  // the torso turns from the lumbar joint; the head from the neck; the arms from the shoulders
  const torso = new THREE.Group();
  torso.position.set(4, 76, 0);
  dummy.add(torso);
  onDummy(torso, box(18, 12, 30, 5), jointMat, { pos: [-1, 5, 0], edgeOpacity: 0.3 });
  onDummy(torso, box(22, 46, 34, 9), dummyMat, { pos: [0, 30, 0], edgeOpacity: 0.35 });
  for (const y of [22, 30, 38]) onDummy(torso, box(2, 3, 28, 0.8), jointMat, { pos: [-11.2, y, 0], edges: false });
  const neck = new THREE.Group();
  neck.position.set(-1, 53, 0);
  torso.add(neck);
  onDummy(neck, cyl(4.2, 9, 0.4, 24), jointMat, { pos: [0, 4.5, 0], edges: false });
  const headG = new THREE.Group();
  headG.position.set(0, 8.5, 0);
  neck.add(headG);
  const head = onDummy(headG, new THREE.SphereGeometry(10, 40, 28).scale(1.05, 1.18, 0.92), dummyMat, { pos: [-2, 10, 0], edges: false });
  onDummy(headG, box(10, 1.6, 15, 0.6), jointMat, { pos: [-8.6, 4.4, 0], rot: [0, 0, 0.35], edges: false }); // the chin line
  for (const s of [-1, 1]) {
    const t = addMesh(seatPart, new THREE.CircleGeometry(3.1, 36), targetMat, { pos: [-2, 10.5, s * 9.25], rot: [0, s > 0 ? 0 : Math.PI, 0], edges: false });
    headG.add(t);
  }
  const arms = [];
  for (const s of [-1, 1]) {
    ball(torso, [1, 46, s * 20.5], 5.8);
    const upper = new THREE.Group();
    upper.position.set(1, 46, s * 21.5);
    torso.add(upper);
    limb(upper, [0, -2, 0], [0, -22, 0], 4.6);
    const elbow = new THREE.Group();
    elbow.position.set(0, -23, 0);
    upper.add(elbow);
    ball(elbow, [0, 0, 0], 4.6);
    limb(elbow, [0, -2, 0], [0, -21, 0], 4.0);
    onDummy(elbow, box(5, 9, 7, 2), dummyMat, { pos: [0, -25, 0], edgeOpacity: 0.3 });
    arms.push({ upper, elbow });
  }
  void head;
  // the sensors (veille points that read): head, chest, pelvis — a core, a soft halo, a slow ring
  const sensors = [];
  for (const [parent, at, phase] of [[headG, [-2, 10, 9.9], 0], [torso, [-11.6, 34, 9], 0.33], [dummy, [-10.5, 72, 13.5], 0.66]]) {
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 12), glow(BRAND.veille, 2.2, { additive: true, opacity: 0 }));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(3.4, 24, 16), softGlow(BRAND.veille, 1.1, 1.6));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.09, 8, 48), glow(BRAND.veille, 1.4, { additive: true, opacity: 0 }));
    ring.rotation.y = -37 * DEG;
    for (const m of [core, halo, ring]) {
      m.position.set(...at);
      m.renderOrder = 6;
      parent.add(m);
    }
    sensors.push({ core, halo, ring, phase });
  }
  const dummyHead = new THREE.Object3D();
  dummyHead.position.set(-2, 10, 0);
  headG.add(dummyHead);
  // the press (the old static 9 g test): a post, a ram, a plate on the dummy's seat back
  const pressPart = makePart("press");
  seatG.add(pressPart);
  const pressMat = solid(G.steel, { rough: 0.5, metal: 0.4 });
  const ramMat = solid(G.valve, { rough: 0.3, metal: 0.5 });
  addMesh(pressPart, box(30, 2, 30, 0.5), pressMat, { pos: [134, 1, DZ] });
  addMesh(pressPart, box(8, 128, 8, 1), pressMat, { pos: [134, 66, DZ] });
  addMesh(pressPart, cyl(5, 30, 0.3, 32).rotateZ(Math.PI / 2), pressMat, { pos: [115, 101, DZ] });
  const rod = addMesh(pressPart, cyl(2.4, 1, 0.01, 24).rotateZ(Math.PI / 2), ramMat, { edges: false });
  const pressPlate = addMesh(pressPart, box(4, 36, 40, 1), ramMat, { pos: [85, 101, DZ] });
  items.add(seatG);

  /* ── 2 · the cushion and the kerosene burner ── */
  const cushG = new THREE.Group();
  const cushPart = makePart("cushion");
  cushG.add(cushPart);
  const frameMat = solid(G.steel, { rough: 0.5, metal: 0.4 });
  for (const x of [-21, 21]) for (const z of [-23, 23]) addMesh(cushPart, box(3, 26, 3, 0.6), frameMat, { pos: [x, 13, z] });
  for (const z of [-23, 23]) addMesh(cushPart, box(3, 50, 3, 0.6), frameMat, { pos: [36.5, 47, z] });
  for (const x of [-21, 21]) addMesh(cushPart, box(3, 3, 49, 0.6), frameMat, { pos: [x, 24.5, 0] });
  const fabricMat = solid(0x4d4a44, { rough: 0.92 });
  fabricMat.userData.finish = false;
  const cushionSeat = addMesh(cushPart, box(46, 12, 50, 3.5), fabricMat, { pos: [0, 32, 0], edgeOpacity: 0.75, edgeWidth: 2.2 });
  addMesh(cushPart, box(12, 46, 50, 3.5), fabricMat, { pos: [29, 49, 0], edgeOpacity: 0.75, edgeWidth: 2.2 });
  const cushLines = [...cushPart.userData.part.mats].filter((m) => m.isLineMaterial && m.linewidth >= 2.1);
  for (const m of cushLines) m.userData.baseColor = m.color.clone();
  const scorchA = new THREE.Mesh(new THREE.PlaneGeometry(26, 14), scorchMat());
  scorchA.position.set(-23.1, 32, 0);
  scorchA.rotation.y = -Math.PI / 2;
  const scorchB = new THREE.Mesh(new THREE.PlaneGeometry(22, 34), scorchMat());
  scorchB.position.set(-13, 38.1, 0);
  scorchB.rotation.x = -Math.PI / 2;
  for (const m of [scorchA, scorchB]) {
    m.renderOrder = 3;
    cushG.add(m);
  }
  // the burner: a pipe, a flared nozzle BURNER.gap in front of the cushion, a post, its fuel line
  const burnerMat = solid(G.metal, { rough: 0.4, metal: 0.45 });
  const NOZ = -23 - BURNER.gap; // the nozzle's mouth
  addMesh(cushPart, cyl(2.2, 40, 0.2, 32).rotateZ(Math.PI / 2), burnerMat, { pos: [NOZ - 27, 32, 0] });
  addMesh(cushPart, lathe([[2.0, 0], [2.4, 0], [4.4, 7], [3.9, 7.4], [0, 7.4]], 40, { bevel: 0.15 }).rotateZ(-Math.PI / 2), burnerMat, { pos: [NOZ - 7.4, 32, 0] });
  addMesh(cushPart, box(3, 30, 3, 0.6), frameMat, { pos: [NOZ - 30, 15, 0] });
  addMesh(cushPart, box(18, 2, 18, 0.5), frameMat, { pos: [NOZ - 30, 1, 0] });
  addMesh(cushPart, cyl(1.6, 4, 0.2, 20), valveMat, { pos: [NOZ - 38, 36, 0] });
  addMesh(cushPart, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[NOZ - 47, 32, 0], [NOZ - 58, 28, 4], [NOZ - 70, 8, 12], [NOZ - 90, 1.5, 20]].map((v) => new THREE.Vector3(...v))), 32, 1.2, 10), hoseMat, { edges: false });
  // the flame: from the nozzle, it hits the cushion's front edge and licks up over its top
  const FLAME = new THREE.CatmullRomCurve3([[NOZ, 32, 0], [NOZ + 6, 32.4, 0], [-23.5, 36, 0], [-18, 41.5, 0], [-8, 45, 0], [4, 50, 0], [13, 56, 0]].map((v) => new THREE.Vector3(...v)));
  const flames = [flameLayer(FLAME, 7.5, BRAND.signal, 0.45, 1.0), flameLayer(FLAME, 3.6, BRAND.signal, 1.1, 1.3), flameLayer(FLAME, 1.7, new THREE.Color(BRAND.ink).lerp(SIGNAL, 0.25), 1.3, 1.6)];
  for (const f of flames) cushG.add(f.mesh);
  const embers = makeRisers({ count: 18, seed: 7 });
  embers.uniforms.uOrigin.value.set(-20, 40, 0);
  cushG.add(embers.points);
  const flameLight = new THREE.PointLight(BRAND.signal, 0, 110, 0);
  flameLight.position.set(-27, 38, 10);
  cushG.add(flameLight);
  const flameA = new THREE.Object3D();
  flameA.position.set(-23, 36, 0);
  cushG.add(flameA);
  items.add(cushG);

  /* ── 3 · the documents: a sheet on a slanted board, its highlights between the paper and the ink ── */
  const docG = new THREE.Group();
  const deskG = new THREE.Group();
  deskG.rotation.x = 0.2;
  deskG.position.y = 43 * Math.sin(0.2) + 0.2;
  docG.add(deskG);
  const boardMat = solid(0x2f2d2a, { rough: 0.8 });
  const boardPart = makePart("board");
  deskG.add(boardPart);
  addMesh(boardPart, box(66, 1.6, 86, 0.5), boardMat, { pos: [0, 0.8, 0], edgeOpacity: 0.5 });
  addMesh(boardPart, box(60, 9, 4, 0.5), boardMat, { pos: [0, -4.6, -38], edgeOpacity: 0.4 });
  const paperG = new THREE.Group();
  deskG.add(paperG);
  const paperC = document.createElement("canvas");
  const inkC = document.createElement("canvas");
  paperC.width = inkC.width = DW;
  paperC.height = inkC.height = DH;
  const paperTex = new THREE.CanvasTexture(paperC);
  const inkTex = new THREE.CanvasTexture(inkC);
  for (const t of [paperTex, inkTex]) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  }
  const sheetGeo = new THREE.PlaneGeometry(DOC.w, DOC.h).rotateX(-Math.PI / 2);
  const paper = new THREE.Mesh(sheetGeo, new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.92 }));
  paper.position.y = 1.7;
  paper.receiveShadow = true;
  const inkMesh = new THREE.Mesh(sheetGeo, new THREE.MeshStandardMaterial({ map: inkTex, roughness: 0.85, transparent: true, depthWrite: false }));
  inkMesh.position.y = 1.82;
  inkMesh.renderOrder = 3;
  paperG.add(paper, inkMesh);
  const bandGeo = new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0).rotateX(-Math.PI / 2);
  const bandMat = new THREE.MeshBasicMaterial({ color: BRAND.veille, transparent: true, opacity: 0.5, depthWrite: false });
  const bands = [];
  for (let k = 0; k < 4; k++) {
    const b = new THREE.Mesh(bandGeo, bandMat);
    b.position.y = 1.76;
    b.renderOrder = 2;
    paperG.add(b);
    bands.push(b);
  }
  let docShown = -1;
  let typeset = false;
  const docRects = [];
  const showDoc = (i) => {
    const rects = drawDoc(i, paperC, inkC);
    paperTex.needsUpdate = true;
    inkTex.needsUpdate = true;
    docRects.length = 0;
    docRects.push(...rects);
    docShown = i;
  };
  const FONTS = [`700 40px ${FONT_D}`, `600 40px ${FONT_D}`, `500 40px ${FONT_M}`];
  try {
    for (const f of FONTS) document.fonts?.load(f);
  } catch {}
  const fontsReady = () => {
    try {
      return FONTS.every((f) => document.fonts.check(f));
    } catch {
      return true;
    }
  };
  showDoc(0);
  const docA = new THREE.Object3D();
  paperG.add(docA);
  items.add(docG);

  /* ── 4 · twenty figurines of glass, standing in a row ── */
  const twentyG = new THREE.Group();
  const FIG_BODY = lathe([[0, 1.2], [2.3, 1.2], [2.6, 3], [2.4, 8], [2.9, 13], [3.4, 16.2], [2.6, 17.6], [1.2, 18.4], [1.1, 19.2], [0, 19.2]], 40);
  const FIG_HEAD = new THREE.SphereGeometry(2.5, 28, 18);
  const baseMat = solid(G.joint, { rough: 0.6 });
  const figurines = [];
  const figMats = [];
  const figBases = [];
  for (let i = 0; i < 20; i++) {
    const f = new THREE.Group();
    f.position.set((i - 9.5) * 10.5, 0, 0);
    const m = glass(BRAND.ink, { base: 0.004, rim: 0.42, power: 2.2, edge: 0.55, spec: 0.5, through: 0.25 });
    const bodyM = new THREE.Mesh(FIG_BODY, m);
    const headM = new THREE.Mesh(FIG_HEAD, m);
    headM.position.y = 21.9;
    asShell([bodyM, headM], 20);
    const baseM = new THREE.Mesh(cyl(3.3, 1.2, 0.2, 32), baseMat);
    baseM.position.y = 0.6;
    baseM.castShadow = baseM.receiveShadow = true;
    f.add(bodyM, headM, baseM);
    twentyG.add(f);
    figurines.push(f);
    figMats.push(m);
    figBases.push(baseM);
  }
  const oneRing = new THREE.Mesh(new THREE.RingGeometry(3.6, 5.2, 48).rotateX(-Math.PI / 2), softGlow(BRAND.signal, 0.9, 0.01));
  oneRing.material.side = THREE.DoubleSide;
  oneRing.position.set((13 - 9.5) * 10.5, 0.15, 0);
  oneRing.renderOrder = 4;
  twentyG.add(oneRing);
  items.add(twentyG);
  const byItem = [null, seatG, cushG, docG, twentyG];

  /* ══════════════ every frame ══════════════ */
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const vN = new THREE.Vector3();
  const lerp3 = (out, a, b, u) => out.set(mix(a.x, b.x, u), mix(a.y, b.y, u), mix(a.z, b.z, u));
  // a point of the body's own frame into the pack's frame (the body only turns about x)
  const bodyToPack = (out, x, y, z) => {
    const c = Math.cos(body.rotation.x);
    const s = Math.sin(body.rotation.x);
    return out.set(x + body.position.x, y * c - z * s + body.position.y, y * s + z * c + body.position.z);
  };

  return {
    pack: { group, A: { bottle: bottleG, valve: valveA, asp: [asp[0].mouth, asp[1].mouth], flaps: asp[0].hinges, girt: girtA, tube: tubeA } },
    items,
    A: { seat: seatG, dummyHead, cushion: cushionSeat, flame: flameA, doc: docA, figurines },
    set(p, time, px) {
      const t = time;
      const e = p.explode;
      const onBench = p.place === 2;
      const inCabin = p.place === 1;

      /* ── the pack: the case opens, the pieces go to their lanes, then to the rig ── */
      const u = Math.max(0, e - 1);
      rabatPivot.rotation.x = 100 * DEG * S(0, 0.45, e);
      lidPivot.rotation.x = -115 * DEG * S(0.45, 0.8, e);
      setPartOpacity(casePart, 1 - S(0, 0.35, u));
      setPartOpacity(slidePart, 1 - S(0.05, 0.4, u));
      setPartOpacity(girtPart, 1 - S(0, 0.3, u));
      setPartOpacity(hosePart, 1 - S(0.1, 0.22, e));
      setPartOpacity(cradlePart, onBench ? 1 - S(0, 0.35, u) : 0);
      setPartOpacity(rigPart, S(0.35, 0.75, u));
      setPartOpacity(tubePart, S(0.35, 0.75, u));
      slidePart.position.copy(HOME.slideLane).multiplyScalar(S(0.5, 0.95, e));

      // the bottle: lifts to the top lane, then (rig) crosses over everything and comes down at the right, turned 90°
      if (e <= 1) {
        lerp3(bottleG.position, HOME.bottle, HOME.bottleLane, S(0.14, 0.5, e));
        bottleG.rotation.y = 0;
      } else {
        const r = S(0.1, 0.7, u);
        const h = S(0, 0.55, r);
        bottleG.position.set(mix(HOME.bottleLane.x, HOME.bottleRig.x, h), mix(HOME.bottleLane.y, HOME.bottleRig.y, S(0.4, 1, r)), mix(HOME.bottleLane.z, HOME.bottleRig.z, h));
        bottleG.rotation.y = -90 * DEG * h;
      }
      // the aspirators: up, then out to their lanes; then onto the tube's top line
      for (let i = 0; i < 2; i++) {
        const a = asp[i];
        if (e <= 1) {
          const up = S(0.14, 0.4, e);
          const out = S(0.2, 0.6, e);
          a.g.position.set(mix(HOME.asp[i].x, HOME.aspLane[i].x, out), mix(HOME.asp[i].y, HOME.aspLane[i].y, up), mix(HOME.asp[i].z, HOME.aspLane[i].z, out));
        } else lerp3(a.g.position, HOME.aspLane[i], HOME.aspRig[i], S(0.15, 0.75, u));
      }
      // the girt bar: stowed along the lower front edge · armed: at the floor brackets · on the bench: down in front
      if (inCabin && p.sill) lerp3(girtG.position, HOME.girt, SILL_AT.copy(p.sill).setY(p.sill.y + GIRT_SEAT), S(0.35, 0.65, p.arm)); // armed: its end tabs drop into the brackets (cabine.js · A.sill, z 232)
      else {
        girtG.position.set(0, mix(HOME.girt.y, HOME.girtLane.y, S(0.02, 0.2, e)), mix(HOME.girt.z, HOME.girtLane.z, S(0.05, 0.4, e)));
      }
      // in the door: pulled out (−z, outside), then falling under the sill, hanging by its bar
      if (inCabin) {
        const pu = S(0, 1, p.pulled);
        const dr = p.drop * p.drop * (3 - 2 * p.drop);
        const gp = girtG.position;
        body.position.set(mix(0, gp.x, dr), mix(-4 * pu, gp.y - (PACK.h + 28), dr), mix(-46 * pu, gp.z - 30, dr));
        body.rotation.x = -22 * DEG * dr;
      } else {
        body.position.set(0, 0, 0);
        body.rotation.x = 0;
      }
      // the girt fabric, from the bar to the slide's lower front edge
      setPartOpacity(apronPart, onBench ? 1 - S(0.05, 0.25, e) : inCabin ? 1 : 0);
      if (apronPart.visible) {
        const sp = slidePart.position;
        for (let k = 0; k < AP_N; k++) {
          const x = -40 + (80 * k) / (AP_N - 1);
          vA.set(girtG.position.x + x * 1.05, girtG.position.y - 1.0, girtG.position.z - 0.8);
          bodyToPack(vB, sp.x + x, sp.y + 3.8, sp.z + 12.6);
          apronPos[k * 3] = vA.x;
          apronPos[k * 3 + 1] = vA.y;
          apronPos[k * 3 + 2] = vA.z;
          apronPos[(k + AP_N) * 3] = vB.x;
          apronPos[(k + AP_N) * 3 + 1] = vB.y;
          apronPos[(k + AP_N) * 3 + 2] = vB.z;
        }
        // one normal for the whole strip
        vC.set(apronPos[(AP_N - 1) * 3] - apronPos[0], apronPos[(AP_N - 1) * 3 + 1] - apronPos[1], apronPos[(AP_N - 1) * 3 + 2] - apronPos[2]);
        vN.set(apronPos[AP_N * 3] - apronPos[0], apronPos[AP_N * 3 + 1] - apronPos[1], apronPos[AP_N * 3 + 2] - apronPos[2]);
        vN.crossVectors(vN, vC).normalize();
        if (vN.z < 0) vN.negate();
        for (let k = 0; k < AP_N * 2; k++) {
          apronNrm[k * 3] = vN.x;
          apronNrm[k * 3 + 1] = vN.y;
          apronNrm[k * 3 + 2] = vN.z;
        }
        apronGeo.attributes.position.needsUpdate = true;
        apronGeo.attributes.normal.needsUpdate = true;
      }

      /* ── the gas: the valve, the gauge, the flow in the hose ── */
      lever.rotation.y = 90 * DEG * S(0, 0.2, p.gas);
      needle.rotation.y = mix(-115, 115, S(0.05, 1, p.gas)) * DEG;
      const flowOn = S(0, 0.12, p.gas) * S(0.6, 0.95, u);
      for (let i = 0; i < 2; i++) {
        const f = FLOWS[i];
        f.visible = flowOn > 0.003;
        f.material.uniforms.uAmount.value = flowOn;
        f.material.uniforms.uFront.value = p.gas * (FLOW_END + 12);
        f.material.uniforms.uT.value = t;
      }

      /* ── the head tube: flat curtain → full round, its top line under the aspirators ── */
      const tu = clamp01(p.tube);
      const te = tu * tu * (3 - 2 * tu);
      const b = mix(TUBE.r * 1.52, TUBE.r, te);
      TU.uB.value = b;
      TU.uA.value = mix(1.6, TUBE.r, te);
      TU.uFlat.value = 1 - te;
      tubeMesh.position.set(0, Y_TOP - b, 0);
      tubeA.position.set(0, Y_TOP - b, 0);

      /* ── the aspirators: the cut, the flaps, the jet, the low pressure, the air, the leak ── */
      const open = Math.max(p.valve, p.air);
      const leakOpen = 0.42 * S(0.15, 0.55, p.leak);
      for (let i = 0; i < 2; i++) {
        const a = asp[i];
        setPartOpacity(a.front, 1 - p.see);
        for (let k = 0; k < 8; k++) {
          const o = i === 0 && k === LEAK_K ? Math.max(open, leakOpen) : open;
          a.flaps[k].rotation.x = -75 * DEG * o;
        }
        a.jetM.uniforms.uAmount.value = p.jet;
        a.jetM.uniforms.uT.value = t;
        a.jet.visible = p.jet > 0.003;
        a.darkM.uniforms.uAmount.value = S(0.55, 1, p.jet) * p.see;
        a.dark.visible = a.darkM.uniforms.uAmount.value > 0.003;
        const au = a.air.uniforms;
        au.uAmount.value = p.air;
        au.uT.value = t;
        au.uPx.value = px || 1000;
        au.uCut.value = S(0.3, 0.8, p.see);
        a.air.mesh.visible = p.air > 0.003;
        if (a.leak) {
          const lu = a.leak.uniforms;
          lu.uAmount.value = S(0.4, 1, p.leak);
          lu.uT.value = t;
          lu.uPx.value = px || 1000;
          a.leak.mesh.visible = lu.uAmount.value > 0.003;
          a.debris.scale.setScalar(Math.max(0.001, S(0, 0.3, p.leak)));
          a.debris.visible = p.leak > 0.003;
        }
      }
      // what the voice names (1 slide · 2 bottle · 3 aspirators · 4 girt bar · 5 flaps)
      for (let n = 1; n <= 4; n++) lightUp(LIT[n], p.named === n ? 1 : 0);
      const flapLit = 0.45 * open + (p.named === 5 ? 0.38 : 0) + (p.named === 3 ? 0.2 : 0);
      for (let i = 0; i < 4; i++) flapMats[i].emissive.copy(VEILLE).multiplyScalar(flapLit);

      /* ── the items: one at a time ── */
      for (let i = 1; i < byItem.length; i++) byItem[i].visible = i === p.item;

      if (p.item === 1) {
        // the track runs under the still sled: accelerating (0 → 1), then the dead stop in ≈ 30 cm (1 → 2)
        const s1 = clamp01(p.sled);
        const s2 = clamp01(p.sled - 1);
        const stop = Math.min(1, s2 / 0.25);
        const run = SEAT.run * s1 + 32 * (1 - (1 - stop) * (1 - stop));
        track.position.x = run % TRACK_P;
        // the dummy: pressed back while launched; thrown forward at the stop, held by its lap belt, head whipping, then resting
        const f = S(0, 0.42, s2) - 0.97 * S(0.42, 1, s2);
        const uh = s2 - 0.06;
        const fh = S(0, 0.4, uh) - 1.12 * S(0.4, 0.9, uh) + 0.12 * S(0.9, 1, uh);
        const fa = S(0, 0.45, s2 - 0.02) - S(0.45, 1, s2);
        const push = S(0.55, 1, p.press);
        torso.rotation.z = (-10 + 4 * push - 3 * (p.sled < 1 ? s1 : 0) + 52 * f) * DEG;
        neck.rotation.z = (8 + 30 * fh) * DEG;
        for (let i = 0; i < 2; i++) {
          arms[i].upper.rotation.z = (-15 - 62 * fa) * DEG;
          arms[i].elbow.rotation.z = (-72 + 40 * fa) * DEG;
        }
        for (let k = 0; k < 3; k++) backs[k].rotation.z = (-13 + 6 * f + (k === 2 ? 5 * push : 0)) * DEG;
        // the press: in, on, pushing; gone when it is not used
        setPartOpacity(pressPart, S(0, 0.2, p.press));
        const plateX = p.press < 0.55 ? mix(85, 38.6, S(0, 0.55, p.press)) : mix(38.6, 35.3, push);
        pressPlate.position.x = plateX;
        const rodFrom = plateX + 2;
        rod.scale.set(Math.max(0.01, 100 - rodFrom), 1, 1);
        rod.position.set((100 + rodFrom) / 2, 101, DZ);
        // the sensors read
        for (let i = 0; i < 3; i++) {
          const sn = sensors[i];
          const k = p.sensors;
          sn.core.visible = sn.halo.visible = sn.ring.visible = k > 0.003;
          sn.core.material.opacity = k;
          sn.halo.material.uniforms.uAmount.value = k;
          const ph = (t * 0.7 + sn.phase) % 1;
          sn.ring.scale.setScalar(2 + 5 * ph);
          sn.ring.material.opacity = k * 0.8 * (1 - ph) * S(0, 0.15, ph);
        }
      }

      if (p.item === 2) {
        const k = p.burner;
        for (let i = 0; i < 3; i++) {
          const f = flames[i];
          f.uniforms.uAmount.value = k;
          f.uniforms.uT.value = t;
          f.mesh.visible = k > 0.003;
        }
        embers.uniforms.uAmount.value = k;
        embers.uniforms.uT.value = t;
        embers.uniforms.uScale.value = px || 1000;
        embers.points.visible = k > 0.003;
        flameLight.intensity = 1.6 * k * (0.94 + 0.06 * Math.sin(t * 2.3));
        scorchA.material.uniforms.uAmount.value = S(0.3, 1, k);
        scorchB.material.uniforms.uAmount.value = S(0.5, 1, k) * 0.8;
        // the fire-blocking layer holds: its edges turn veille
        for (let i = 0; i < cushLines.length; i++) cushLines[i].color.copy(cushLines[i].userData.baseColor).lerp(VEILLE, S(0.2, 0.7, k));
      }

      if (p.item === 3) {
        if (!typeset && fontsReady()) {
          typeset = true;
          docShown = -1;
        }
        const di = Math.max(0, Math.min(DOCS.length - 1, Math.round(p.doc) - 1));
        if (p.doc >= 1 && di !== docShown) showDoc(di);
        const din = clamp01(p.docIn);
        const de = din * din * (3 - 2 * din);
        paperG.visible = din > 0.003 && p.doc >= 1;
        paperG.position.set(0, 0.6 * (1 - de), -78 * (1 - de));
        paperG.rotation.y = 0.1 * (1 - de);
        // the highlights: the big word's underline as soon as the sweep starts, then each line in order
        bandMat.color.copy(VEILLE).lerp(SIGNAL, p.mood);
        const nl = docRects.length - 1;
        for (let k = 0; k < bands.length; k++) {
          const r = docRects[k];
          const fill = !r ? 0 : k === 0 ? S(0, 0.06, p.hl) : clamp01(p.hl * nl - (k - 1));
          bands[k].visible = fill > 0.003;
          if (r && bands[k].visible) {
            bands[k].position.set(-DOC.w / 2 + r.x, 1.76, -DOC.h / 2 + r.z + r.h / 2);
            bands[k].scale.set(r.w * fill, 1, r.h);
          }
        }
      }

      if (p.item === 4) {
        for (let i = 0; i < 20; i++) {
          const fu = clamp01(p.twenty * 20 - i);
          const fe = fu * fu * (3 - 2 * fu);
          figurines[i].visible = fu > 0.003;
          figurines[i].position.y = -3 * (1 - fe);
          const m = figMats[i];
          m.uniforms.uAmount.value = fe;
          if (i === 13) {
            m.uniforms.uColor.value.copy(INK).lerp(SIGNAL, p.oneIn);
            m.uniforms.uGain.value = 1 + 0.6 * p.oneIn;
          }
          figBases[i].scale.setScalar(Math.max(0.001, fe));
        }
        oneRing.visible = p.oneIn > 0.003;
        oneRing.material.uniforms.uAmount.value = p.oneIn;
      }
    },
  };
}
