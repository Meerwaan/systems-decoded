// DOSSIER L06 — Blackout : THE TWO PLACES AT TRUE SCALE, at night, seen like X-rays.
// Brief: docs/L06-decors.md § terrain.js. Numbers: world.js · FIRST (each one commented there). Journal: docs/journal/L06-terrain.md.
//
//   buildEms() → {            the TERRAIN place: the Ems, the double 380 kV line that crosses it on two 84 m towers,
//     group,                  the corridor across the plain on both sides, Meyer Werft's hall and the ship of glass,
//     A: { towerW, towerE,    the wind farm on the eastern horizon. The line along x (east +x), the river along z.
//          mid,               mid-river, on the lowest conductors (follows `raise`, like towerW / towerE)
//          hall, ship,        the hall's middle, the ship's middle (in the hall)
//          hook,              under the corridor, plan.js · EMS.hook (the first frame's spot)
//          far },             the corridor's far east end (the trip's flash)
//     update(S, time, px)
//   }
//   reads: shell emsCut hall ship pass gap raise wind lineLoad tripRun
//
//   buildQuartier() → {       the QUARTIER place: your street in France, X-ray buildings and their lit windows, your
//     group,                  room (the lamp, the TV, the socket, the switch, you), the lift, the poste source and its
//     A: { window, lamp,      feeders under the street, the hospital far away.
//          socket, switchAt, you, lift,
//          cells,             Object3D: where world.js mounts model.js's HERO (the row of HTA cells, along x, fronts +z)
//          poste, hospital },
//     update(S, time, px)
//   }
//   reads: town lights shed relit tv lift feed poste room you socket prio
//
// HOW IT IS DRAWN
//   · THIS line is German: DONAU towers (two phases on the lower crossarm, one on the upper), the brick `makePylon` of
//     L02/ligne.js set for it — 55 m suspension towers on the plain, two 84 m TENSION towers at the crossing (the
//     conductors pull on horizontal strings at the arm tips, a jumper loops under each arm)
//   · a conductor is a ribbon drawn in screen space ("the brightest wins"): four sub-conductors per bundle that merge
//     far away. Live at normal load = clear ink · over its limit = signal, big dashes running west · off = a dark tube
//   · every other line (dikes, hall, ship, the dotted ghost, the lattice that grows under the towers) is the same
//     ribbon with a plain ink shader: never under 1.8 px, fading with distance
//   · the ground is a grid drawn to the horizon, the river an opaque dark surface with the wires mirrored in it
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, anchor, solid, box, cyl, edgesOf, mergeGeometries } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { makePylon } from "../../L02-poste-haute-tension/src/ligne.js";
import { EMS, HALL, SHIP, WINDFARM, QUARTIER, HERO } from "./plan.js";
import { dressEms, dressQuartier } from "./habillage.js"; // the dressing (decorator): its own group, its own update

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, u) => a + (b - a) * u;
/** A sagging wire between two points (a parabola), as points. */
const para = (a, b, sag, n = 20) =>
  Array.from({ length: n + 1 }, (_, k) => {
    const u = k / n;
    return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 4 * sag * u * (1 - u), lerp(a[2], b[2], u)];
  });
const off = (pts, dy, dz) => pts.map(([x, y, z]) => [x, y + dy, z + dz]);

/* ───────────────────────────── the ribbon: a line drawn in screen space ───────────────────────────── */

const RIBBON_VS = /* glsl */ `
  uniform float uPx, uMinPx, uHaloPx, uHaloK, uMirror, uWater; uniform vec2 uView;
  attribute vec3 aOther; attribute float aEnd; attribute float aSide; attribute float aDist; attribute float aR; attribute float aTag;
  varying float vX; varying float vMax; varying float vDist; varying float vDepth; varying float vTag; varying vec3 vW; varying vec2 vS;
  void main() {
    vec4 wa = modelMatrix * vec4(position, 1.0);
    vec4 wb = modelMatrix * vec4(aOther, 1.0);
    vW = wa.xyz; vS = wa.xz; vTag = aTag; vDist = aDist;
    if (uMirror > 0.5) {
      // the wire's image in the water: mirrored under the surface; vS is where the eye meets the surface
      wa.y = 2.0 * uWater - wa.y; wb.y = 2.0 * uWater - wb.y;
      float k = (cameraPosition.y - uWater) / max(cameraPosition.y - wa.y, 1.0);
      vS = cameraPosition.xz + (wa.xz - cameraPosition.xz) * k;
    }
    vec4 a = viewMatrix * wa;
    vec4 b = viewMatrix * wb;
    const float NEAR = 8.0;
    vX = 0.0; vMax = 2.0; vDepth = 1.0;
    if (a.z > -NEAR && b.z > -NEAR) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    // a wire that passes beside the camera: each end is slid along its segment to the near plane, never projected behind
    if (a.z > -NEAR) a = mix(a, b, (a.z + NEAR) / (a.z - b.z));
    if (b.z > -NEAR) b = mix(b, a, (b.z + NEAR) / (b.z - a.z));
    vec4 ca = projectionMatrix * a;
    vec4 cb = projectionMatrix * b;
    vec2 run = (cb.xy / cb.w - ca.xy / ca.w) * uView * (aEnd > 0.5 ? -1.0 : 1.0);
    float l = length(run);
    vec2 n = l > 1e-4 ? vec2(-run.y, run.x) / l : vec2(0.0, 1.0);
    float depth = max(-a.z, NEAR);
    float core = max(aR * uPx / depth, uMinPx);
    float total = core + uHaloPx + core * uHaloK;
    ca.xy += n * aSide * total * 2.0 / uView * ca.w;
    gl_Position = ca;
    vX = aSide * total / core;
    vMax = total / core;
    vDepth = depth;
  }`;

// THE CONDUCTORS. vTag: 0 the first circuit (+z) · 1 the second (−z) · 2 the earth wire (never live).
// uLoad 0 ink → 1 signal with dashes running toward −x. uCut (x: circuit 1, y: circuit 2) 0 → 1: across the river the
// light dies from the east tower to the west one (a head that backs away); on the plain the same circuit is off east of
// the river as soon as the cut starts, west of it when it ends — unless the corridor is loaded (uLoad: the hook).
// uFront: the dark that runs west along the eastern corridor after the trip (everything east of it is off).
const LINE_FS = /* glsl */ `
  uniform vec3 uSigC, uInkC; uniform vec2 uCut;
  uniform float uLoad, uTime, uAmount, uFar, uTx, uFront, uWestK, uDashP, uDashV, uDashK, uMirror, uHalf;
  varying float vX; varying float vMax; varying float vDist; varying float vDepth; varying float vTag; varying vec3 vW; varying vec2 vS;
  void main() {
    float a = abs(vX);
    float aa = max(fwidth(vX), 1e-3);
    float inCore = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, a);
    float tube = sqrt(clamp(1.0 - a * a, 0.0, 1.0));
    float rim = pow(clamp(a, 0.0, 1.0), 3.0);
    float centre = 1.0 - smoothstep(0.0, 0.55, a);
    float x = vW.x;
    float load = clamp(uLoad, 0.0, 1.0);
    float cut = vTag < 0.5 ? uCut.x : uCut.y;
    float head = mix(uTx + 520.0, -uTx - 520.0, cut);
    float cross = 1.0 - smoothstep(uTx + 432.0, uTx + 470.0, abs(x));
    float liveCross = 1.0 - smoothstep(head - 220.0, head + 220.0, x);
    float moving = step(0.004, cut) * (1.0 - step(0.996, cut));
    float tip = liveCross * exp(-max(head - x, 0.0) / 2200.0) * moving;
    float liveCorr = max(load, x > 0.0 ? 1.0 - smoothstep(0.0, 0.06, cut) : 1.0 - smoothstep(0.94, 1.0, cut));
    liveCorr *= 1.0 - smoothstep(uFront - 5000.0, uFront + 5000.0, x);
    liveCorr *= x < 0.0 ? uWestK : 1.0;
    float live = mix(liveCorr, liveCross, cross) * (1.0 - step(1.5, vTag));
    // the dashes: clear on a darker conductor, gone (a plain wire) before a period gets under a few pixels
    float perPx = max(fwidth(x), 1e-3);
    float res = smoothstep(5.0, 12.0, uDashP / perPx);
    float ph = fract((x + uTime * uDashV) / uDashP);
    float dash = smoothstep(0.0, 0.1, ph) * (1.0 - smoothstep(0.5, 0.6, ph));
    float pulse = mix(0.72, 0.06 + 1.3 * dash, res * uDashK);
    vec3 inkLive = uInkC * (0.6 + 0.4 * tube) + vec3(0.22) * centre;
    vec3 sigLive = (uSigC * (1.0 + 0.5 * tube) + vec3(1.0, 0.85, 0.75) * 0.5 * centre) * pulse;
    vec3 lit = mix(inkLive, sigLive, load) * (1.0 + 1.6 * tip);
    vec3 dead = uInkC * (0.1 + 0.12 * tube + 0.22 * rim);
    vec3 c = mix(dead, lit, live);
    float h = clamp((a - 1.0) / max(vMax - 1.0, 1e-3), 0.0, 1.0);
    float halo = live * mix(0.14, 0.4 * pulse, load) * pow(1.0 - h, 2.4);
    vec3 col = c * inCore + mix(uInkC, uSigC, load) * halo * (1.0 - inCore);
    if (uMirror > 0.5) {
      if (abs(vS.x) > uHalf) discard;
      float rr = 1.0 - smoothstep(0.3, 1.2, fwidth(vS.y) * 0.011);
      float rip = 0.5 + 0.5 * sin(vS.y * 0.011 + 2.2 * sin(vS.x * 0.0045 + uTime * 0.6) + uTime * 0.8);
      col *= 0.2 * mix(1.0, 0.7 + 0.3 * rip, rr); // a surface, not a mirror — and never dashes: dashes are current
    }
    gl_FragColor = vec4(col * uAmount * exp(-vDepth / uFar), 1.0);
  }`;

// A PLAIN LINE: uColor × its own brightness (vTag); dashes along its length (uDash); cut under a height (uClipY: the
// lattice that grows out of the ground); a halo (uGlow) for the few that are lights.
const PLAIN_FS = /* glsl */ `
  uniform vec3 uColor; uniform float uAmount, uFar, uDash, uDashP, uClipY, uGlow;
  varying float vX; varying float vMax; varying float vDist; varying float vDepth; varying float vTag; varying vec3 vW; varying vec2 vS;
  void main() {
    if (vW.y < uClipY) discard;
    float a = abs(vX);
    float aa = max(fwidth(vX), 1e-3);
    float inCore = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, a);
    float k = 1.0;
    if (uDash > 0.5) {
      float fw = max(fwidth(vDist), 1e-3) / uDashP;
      float ph = fract(vDist / uDashP);
      float d = smoothstep(0.0, fw + 0.02, ph) * (1.0 - smoothstep(0.56, 0.58 + fw, ph));
      k = mix(0.56, d, smoothstep(4.0, 9.0, 1.0 / fw));
    }
    float h = clamp((a - 1.0) / max(vMax - 1.0, 1e-3), 0.0, 1.0);
    float l = inCore + uGlow * 0.4 * pow(1.0 - h, 2.4) * (1.0 - inCore);
    gl_FragColor = vec4(uColor * l * k * vTag * uAmount * exp(-vDepth / uFar), 1.0);
  }`;

function ribbonMat(fs, uniforms = {}, { minPx = 1.0, haloPx = 0, haloK = 0, far = 600000, depthTest = true, shared = null } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPx: { value: 1500 }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) }, uMirror: { value: 0 }, uWater: { value: EMS.water },
      uAmount: { value: 1 }, uFar: { value: far }, uTime: { value: 0 },
      ...Object.fromEntries(Object.entries(uniforms).map(([k, v]) => [k, { value: v }])),
      ...shared,
      uMinPx: { value: minPx }, uHaloPx: { value: haloPx }, uHaloK: { value: haloK },
    },
    vertexShader: RIBBON_VS,
    fragmentShader: fs,
    transparent: true,
    depthWrite: false,
    depthTest,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
  });
}
const plainMat = (color, o = {}, k = 1) => ribbonMat(PLAIN_FS, { uColor: new THREE.Color(color).multiplyScalar(k), uDash: o.dash ? 1 : 0, uDashP: o.dashP ?? 900, uClipY: o.clipY ?? -1e9, uGlow: o.glow ?? 0 }, o);

/** Collects polylines into one ribbon mesh: `add(points, radius cm, tag, dist0)` → the distance at its end; `done(material)`. */
function makeRibbons() {
  const P = [];
  const O = [];
  const E = [];
  const S = [];
  const D = [];
  const R = [];
  const T = [];
  const index = [];
  let n = 0;
  return {
    add(pts, r, tag = 1, dist0 = 0) {
      let dist = dist0;
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        for (const [end, side] of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
          P.push(...(end ? b : a));
          O.push(...(end ? a : b));
          E.push(end);
          S.push(side);
          D.push(end ? dist + l : dist);
          R.push(r);
          T.push(tag);
        }
        index.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
        n += 4;
        dist += l;
      }
      return dist;
    },
    done(material, order = 5) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
      geo.setAttribute("aOther", new THREE.Float32BufferAttribute(O, 3));
      geo.setAttribute("aEnd", new THREE.Float32BufferAttribute(E, 1));
      geo.setAttribute("aSide", new THREE.Float32BufferAttribute(S, 1));
      geo.setAttribute("aDist", new THREE.Float32BufferAttribute(D, 1));
      geo.setAttribute("aR", new THREE.Float32BufferAttribute(R, 1));
      geo.setAttribute("aTag", new THREE.Float32BufferAttribute(T, 1));
      geo.setIndex(index);
      const mesh = new THREE.Mesh(geo, material);
      mesh.frustumCulled = false;
      mesh.renderOrder = order;
      return mesh;
    },
  };
}

/* ───────────────────────────── a light that has a place · the ground · the horizon ───────────────────────────── */

const QUAD = new THREE.PlaneGeometry(1, 1);
/** A camera-facing light: a bright core, a long tail, never smaller than `minPx`. */
function makeGlow({ core = [1, 0.9, 0.82], tail = SIGNAL, size = 100, minPx = 12, k = 1.6 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uCore: { value: new THREE.Color(...core).multiplyScalar(k) }, uTail: { value: new THREE.Color(tail).multiplyScalar(k * 0.7) },
      uSize: { value: size }, uMinPx: { value: minPx }, uPx: { value: 1500 }, uAmount: { value: 1 },
    },
    vertexShader: /* glsl */ `
      uniform float uSize, uMinPx, uPx; varying vec2 vQ;
      void main() {
        vQ = position.xy * 2.0;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float s = max(uSize, uMinPx * max(-mv.z, 1.0) / uPx);
        mv.xy += position.xy * s;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCore, uTail; uniform float uAmount; varying vec2 vQ;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        float r = sqrt(r2);
        vec3 c = uCore * exp(-r2 * 70.0) + uTail * (0.55 * exp(-r * 6.5) + 0.12 * exp(-r * 2.2)) * (1.0 - r2);
        gl_FragColor = vec4(c * uAmount, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(QUAD, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 8;
  return { mesh, u: mat.uniforms };
}

/** The ground: two grids (cell, big) drawn to the horizon, each line ≥ 1.8 px, gone before its cells get under a few pixels. */
function makeGround({ size = 2400000, cell = 5000, big = 25000, y = -2, gapX = 0, k = 0.09 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 }, uCell: { value: cell }, uBig: { value: big }, uGapX: { value: gapX }, uK: { value: k }, uFar: { value: size * 0.3 } },
    vertexShader: /* glsl */ `
      varying vec3 vW; varying float vDepth;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vec4 mv = viewMatrix * w;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uCell, uBig, uGapX, uK, uFar; varying vec3 vW; varying float vDepth;
      float grid(vec2 p, float cell, float w) {
        vec2 g = p / cell;
        vec2 fw = max(fwidth(g), vec2(1e-6));
        vec2 d = abs(fract(g - 0.5) - 0.5) / fw; // to the nearest line, in pixels
        vec2 l = (1.0 - smoothstep(w * 0.5, w * 0.5 + 1.0, d)) * (1.0 - smoothstep(0.1, 0.34, fw));
        return max(l.x, l.y);
      }
      void main() {
        if (abs(vW.x) < uGapX) discard;
        float g = 0.55 * grid(vW.xz, uCell, 1.8) + grid(vW.xz, uBig, 2.0);
        gl_FragColor = vec4(uColor * g * uK * uAmount * exp(-max(vDepth, 0.0) / uFar), 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2), mat);
  mesh.position.y = y;
  mesh.renderOrder = -5;
  mesh.frustumCulled = false;
  return mesh;
}

/** The night's horizon, drawn at infinity: a low band of ink where the plain ends, nothing above. */
function makeHorizon(k = 1) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: k } },
    vertexShader: /* glsl */ `
      varying vec3 vD;
      void main() {
        vD = position;
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec3 vD;
      void main() {
        float h = normalize(vD).y;
        float band = exp(-abs(h) * 42.0) * (h > 0.0 ? 1.0 : 0.3);
        gl_FragColor = vec4(uColor * (0.06 * band + 0.012 * exp(-max(h, 0.0) * 7.0)) * uAmount, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return mesh;
}

/** Light glass for instanced things far away (the wind farm): a faint body, a rim, fading with distance. */
function farGlass(base, rim) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: INK.clone() }, uBase: { value: base }, uRim: { value: rim }, uAmount: { value: 1 }, uFar: { value: 700000 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vDepth;
      void main() {
        mat4 m = modelViewMatrix;
        #ifdef USE_INSTANCING
          m = modelViewMatrix * instanceMatrix;
        #endif
        vec4 mv = m * vec4(position, 1.0);
        vN = normalize(mat3(m) * normal);
        vV = normalize(-mv.xyz);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uBase, uRim, uAmount, uFar; varying vec3 vN; varying vec3 vV; varying float vDepth;
      void main() {
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        gl_FragColor = vec4(uColor * (uBase + uRim * g * g) * uAmount * exp(-max(vDepth, 0.0) / uFar), 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

/** A skin through rings of points (same count each): an open strip from ring to ring. */
function loft(rings) {
  const pos = [];
  const idx = [];
  const m = rings[0].length;
  for (const r of rings) for (const p of r) pos.push(p[0], p[1], p[2]);
  for (let i = 0; i + 1 < rings.length; i++)
    for (let k = 0; k + 1 < m; k++) {
      const a = i * m + k;
      idx.push(a, a + m, a + 1, a + 1, a + m, a + m + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ───────────────────────────── the ship (Norwegian Pearl's size): a skin of glass, and its outline ───────────────────────────── */
// Local frame: the waterline at y = 0, the length along z, THE BOW TOWARD −z (downstream), the middle at the origin.
// The radar mast, amidships, is the highest point: SHIP.air above the water — it passes right under the wires at `pass` 0.5.
const SHIP_Y = { deck: 1350, mid: 2900, top: 4300, funnel: 5350 };
function shipShape() {
  const L = SHIP.L;
  const B = SHIP.beam / 2;
  const D = -SHIP.draft;
  const { deck, mid, top, funnel } = SHIP_Y;
  const RAKE = 900;
  const z = (u) => L / 2 - u * L;
  const hb = (u) => B * (u < 0.05 ? lerp(0.8, 1, u / 0.05) : u < 0.66 ? 1 : Math.pow(clamp01((1 - u) / 0.34), 0.6));
  const rake = (u, y) => smooth(0.78, 1, u) * RAKE * ((y - D) / (deck - D));
  const inset = (u) => Math.max(hb(u) - 110, 10);

  // the hull, and the two blocks of decks: glass
  const N = 44;
  const hull = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const w = Math.max(hb(u), 14);
    const zz = z(u);
    hull.push([[-w, deck, zz - rake(u, deck)], [-w, D + 260, zz - rake(u, D + 260)], [-w * 0.86, D, zz], [w * 0.86, D, zz], [w, D + 260, zz - rake(u, D + 260)], [w, deck, zz - rake(u, deck)]]);
  }
  const block = (u0, u1, y0, y1, n = 20) => {
    const rings = [];
    const cap = (u) => [[0, y0, z(u)], [0, y1, z(u)], [0, y1, z(u)], [0, y0, z(u)]];
    rings.push(cap(u0));
    for (let i = 0; i <= n; i++) {
      const u = lerp(u0, u1, i / n);
      const w = inset(u);
      rings.push([[-w, y0, z(u)], [-w, y1, z(u)], [w, y1, z(u)], [w, y0, z(u)]]);
    }
    rings.push(cap(u1));
    return loft(rings);
  };
  const FUN = { u0: 0.265, u1: 0.305, w: 420 };
  const funnelGeo = new THREE.BoxGeometry(FUN.w * 2, funnel - top, (FUN.u1 - FUN.u0) * L).translate(0, (funnel + top) / 2, z((FUN.u0 + FUN.u1) / 2));
  const glassGeos = [loft(hull), block(0.06, 0.88, deck, mid), block(0.13, 0.83, mid, top), funnelGeo];

  // its lines: `add(points, brightness, main)` — `main`: part of the OUTLINE (the dotted ghost draws only these)
  const lines = (add) => {
    const side = (y, u0, u1, w, n = 32) => [1, -1].map((s) => Array.from({ length: n + 1 }, (_, i) => {
      const u = lerp(u0, u1, i / n);
      return [s * w(u), y, z(u) - (y <= deck ? rake(u, y) : 0)];
    }));
    const hbw = (u) => Math.max(hb(u), 6);
    for (const l of side(0, 0, 1, hbw)) add(l, 0.75, true); //                       the waterline
    for (const l of side(deck, 0, 1, hbw)) add(l, 0.9, true); //                     the sheer
    add([[0, D, z(1)], [0, 0, z(1) - rake(1, 0)], [0, deck, z(1) - RAKE]], 0.9, true); // the stem
    const w0 = hbw(0);
    add([[-w0, 0, z(0)], [-w0, deck, z(0)], [w0, deck, z(0)], [w0, 0, z(0)]], 0.8, true); // the transom
    const ends = (u, y0, y1) => add([[-inset(u), y0, z(u)], [-inset(u), y1, z(u)], [inset(u), y1, z(u)], [inset(u), y0, z(u)]], 0.8, true);
    for (const l of side(mid, 0.06, 0.88, inset)) add(l, 0.6, true);
    for (const l of side(top, 0.13, 0.83, inset)) add(l, 0.9, true);
    ends(0.06, deck, mid);
    ends(0.88, deck, mid);
    ends(0.13, mid, top);
    ends(0.83, mid, top);
    for (let y = deck + 310; y < top - 100; y += 310) if (Math.abs(y - mid) > 150) for (const l of side(y, y < mid ? 0.06 : 0.13, y < mid ? 0.88 : 0.83, inset, 24)) add(l, 0.3, false); // the decks
    const f0 = z(FUN.u0);
    const f1 = z(FUN.u1);
    for (const [sx, zz] of [[1, f0], [1, f1], [-1, f1], [-1, f0]]) add([[sx * FUN.w, top, zz], [sx * FUN.w, funnel, zz]], 0.8, true);
    add([[FUN.w, funnel, f0], [FUN.w, funnel, f1], [-FUN.w, funnel, f1], [-FUN.w, funnel, f0], [FUN.w, funnel, f0]], 0.8, true);
    add([[0, top, 0], [0, SHIP.air, 0]], 1, true); //                                 the radar mast, amidships
    add([[-260, SHIP.air - 420, 0], [260, SHIP.air - 420, 0]], 0.8, true);
    add([[0, D, z(0)], [0, D, z(1)]], 0.35, false); //                                the keel
  };
  return { glassGeos, lines };
}

/* ═════════════════════════════ buildEms ═════════════════════════════ */

const HANG = 410; //  a suspension string and its yoke (L02/ligne.js): arm → the bundle's centre
const TENS = 430; //  a tension string, in line with the conductor
const SUBS = [[-22, -22], [-22, 22], [22, -22], [22, 22]]; // the bundle: four sub-conductors, [dy, dz]
const SUB_R = 1.7;
const DASH = { p: 3200, v: 7000 }; // the dashes of a loaded line: 32 m long, 70 m/s toward −x (0.073 period per frame)

export function buildEms() {
  const group = new THREE.Group();
  const C = EMS.corridor;
  const RAISE = EMS.tower.raised - EMS.tower.h;
  const PX = []; // every uPx to refresh
  const track = (mat) => (PX.push(mat.uniforms.uPx), mat);

  /* ── the night: the plain as a grid, its horizon, the river ── */
  const dx = EMS.dike.x;
  const dh = EMS.dike.h;
  const W2 = EMS.width / 2;
  const ground = makeGround({ gapX: dx + 1300 });
  const horizon = makeHorizon();
  const waterMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: INK.clone() }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime; varying vec3 vW;
      void main() {
        vec3 v = cameraPosition - vW;
        float dist = max(length(v), 1.0);
        float fres = pow(1.0 - clamp(v.y / dist, 0.0, 1.0), 5.0);
        // long slow streaks drifting downstream, gone before they would shimmer
        float soft = 1.0 - smoothstep(60.0, 260.0, max(fwidth(vW.z), 1e-3));
        float s = 0.5 + 0.5 * sin(vW.z * 0.0042 + 3.0 * sin(vW.x * 0.0011) - uTime * 0.35);
        float sheen = fres * (0.7 + 0.3 * mix(0.5, s, soft)) * exp(-dist / 380000.0);
        gl_FragColor = vec4(uColor * (0.005 + 0.05 * sheen), 1.0);
      }`,
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(EMS.width, 1040000).rotateX(-Math.PI / 2), waterMat);
  water.position.y = EMS.water;
  water.frustumCulled = false;
  group.add(horizon, ground, water);

  // the banks and the dikes, as lines running to the horizon, and ribs that give them their profile
  const rbLand = makeRibbons();
  const ZS = [-520000, -320000, -180000, -100000, -55000, -30000, -15000, -6000, 0, 6000, 15000, 30000, 55000, 100000, 180000, 320000, 520000];
  const along = (x, y) => ZS.map((z) => [x, y, z]);
  for (const s of [1, -1]) {
    rbLand.add(along(s * W2, EMS.water + 6), 10, 0.7);
    rbLand.add(along(s * (dx - 1300), 0), 8, 0.26);
    rbLand.add(along(s * (dx - 220), dh), 10, 0.55);
    rbLand.add(along(s * (dx + 220), dh), 10, 0.55);
    rbLand.add(along(s * (dx + 1300), 0), 8, 0.26);
    for (let z = -150000; z <= 150000; z += 10000) rbLand.add([[s * W2, EMS.water + 6, z], [s * (dx - 1300), 0, z], [s * (dx - 220), dh, z], [s * (dx + 220), dh, z], [s * (dx + 1300), 0, z]], 6, 0.2);
  }
  const landMat = track(plainMat(BRAND.ink, { minPx: 0.95, far: 420000 }));
  group.add(rbLand.done(landMat, 2));

  /* ── the towers: Donau, 55 m on the plain (suspension), 84 m at the crossing (tension) ── */
  const ORD = { h: C.h, arms: [3800, 3800, 4750], reach: [900, 1800, 1300] };
  const CROSS = { h: EMS.tower.h, arms: [7000, 7000, 7900], reach: [1050, 2100, 1550] };
  const mk = (x, spec, tension) => ({ x, tension, arms: spec.arms, reach: spec.reach, peak: spec.h, spec });
  const line = []; // west → east
  for (let i = C.n; i >= 1; i--) line.push(mk(-EMS.tower.x - i * C.span, ORD, false));
  line.push(mk(-EMS.tower.x, CROSS, true), mk(EMS.tower.x, CROSS, true));
  for (let i = 1; i <= C.n; i++) line.push(mk(EMS.tower.x + i * C.span, ORD, false));
  const iW = C.n;
  const iE = C.n + 1;

  const lift = new THREE.Group(); // what rises with `raise`: the two crossing towers, their span, their strings
  group.add(lift);
  const pylons = [];
  const feet = [];
  for (const t of line) {
    const p = makePylon({ h: t.spec.h, arms: t.spec.arms, reach: t.spec.reach, earthWire: t.spec.h });
    p.group.position.x = t.x;
    (t.tension ? lift : group).add(p.group);
    pylons.push(p);
    if (t.tension) feet.push(p.group.children[p.group.children.length - 1]); // its four footings: hidden once the tower stands on its new section
  }

  /* ── the conductors ── */
  const PH = [];
  for (const c of [0, 1]) for (const j of [0, 1, 2]) PH.push([c, j, c ? -1 : 1]);
  const attach = (t, j, s, dir) => (t.tension ? [t.x + dir * TENS, t.arms[j] - 25, s * t.reach[j]] : [t.x, t.arms[j] - HANG, s * t.reach[j]]);
  const spanInto = (rb, t0, t1, sag) => {
    for (const [c, j, s] of PH) {
      const pts = para(attach(t0, j, s, 1), attach(t1, j, s, -1), sag, 22);
      for (const [dy, dz] of SUBS) rb.add(off(pts, dy, dz), SUB_R, c);
    }
    rb.add(para([t0.x, t0.peak, 0], [t1.x, t1.peak, 0], sag * 0.55, 14), 1.2, 2); // the earth wire
  };
  const rbCorr = makeRibbons();
  for (let k = 0; k + 1 < line.length; k++) if (k + 1 < iW || k > iE) spanInto(rbCorr, line[k], line[k + 1], 1050);
  const rbFlankW = makeRibbons();
  const rbFlankE = makeRibbons();
  spanInto(rbFlankW, line[iW - 1], line[iW], 900);
  spanInto(rbFlankE, line[iE], line[iE + 1], 900);
  const rbCross = makeRibbons();
  spanInto(rbCross, line[iW], line[iE], CROSS.arms[0] - 25 - 22 - EMS.wireLow); // the lowest sub-conductors at EMS.wireLow at mid-river
  const rbRig = makeRibbons(); // ink, rigid with the crossing towers: the tension strings, the lattice that grows under them
  for (const t of [line[iW], line[iE]]) {
    for (const [c, j, s] of PH) {
      const y = t.arms[j];
      const zz = s * t.reach[j];
      const loop = para([t.x - TENS, y - 25, zz], [t.x + TENS, y - 25, zz], HANG - 25, 10); // the jumper under the arm
      for (const [dy, dz] of SUBS) rbCross.add(off(loop, dy, dz), SUB_R, c);
      for (const dir of [1, -1]) for (const dz of [-24, 24]) rbRig.add([[t.x + dir * 12, y, zz + dz], [t.x + dir * TENS, y - 25, zz + dz]], 7, 0.6);
      for (const dir of [1, -1]) rbRig.add([[t.x + dir * TENS, y - 25, zz - 40], [t.x + dir * TENS, y - 25, zz + 40]], 5, 0.6);
    }
    // the section added in 2007: the legs go on down with the same slope, braced like the rest
    const base = CROSS.h * 0.075;
    const slope = (base - CROSS.h * 0.026) / (CROSS.arms[0] - 500);
    const hw = (y) => base - slope * y;
    const c = (y, sx, sz) => [t.x + sx * hw(y), y, sz * hw(y)];
    const CORNERS = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
    const levels = [0, -650, -1300, -1950, -RAISE];
    for (let i = 0; i + 1 < levels.length; i++)
      for (let k = 0; k < 4; k++) {
        const [sx, sz] = CORNERS[k];
        const [tx, tz] = CORNERS[(k + 1) % 4];
        rbRig.add([c(levels[i], sx, sz), c(levels[i + 1], sx, sz)], 9, 0.78);
        rbRig.add([c(levels[i], sx, sz), c(levels[i + 1], tx, tz)], 6, 0.45);
        rbRig.add([c(levels[i], tx, tz), c(levels[i + 1], sx, sz)], 6, 0.45);
        rbRig.add([c(levels[i + 1], sx, sz), c(levels[i + 1], tx, tz)], 6, i + 2 === levels.length ? 0.78 : 0.45);
      }
  }
  const lineMat = track(
    ribbonMat(
      LINE_FS,
      { uSigC: SIGNAL.clone(), uInkC: INK.clone(), uCut: new THREE.Vector2(0, 0), uLoad: 0, uTx: EMS.tower.x, uFront: 1e9, uWestK: 1, uDashP: DASH.p, uDashV: DASH.v, uDashK: 0, uHalf: W2 },
      { minPx: 1.2, haloPx: 4, haloK: 1.2, far: 620000 },
    ),
  );
  const LU = lineMat.uniforms;
  const mirrorMat = ribbonMat(LINE_FS, {}, { minPx: 1.5, haloPx: 6, haloK: 2, depthTest: false, shared: { ...LU, uMirror: { value: 1 }, uAmount: { value: 1 } } });
  const corr = rbCorr.done(lineMat);
  const flankW = rbFlankW.done(lineMat);
  const flankE = rbFlankE.done(lineMat);
  flankW.matrixAutoUpdate = flankE.matrixAutoUpdate = false;
  const cross = rbCross.done(lineMat);
  const mirror = new THREE.Mesh(cross.geometry, mirrorMat);
  mirror.frustumCulled = false;
  mirror.renderOrder = 6;
  const rigMat = track(plainMat(BRAND.ink, { minPx: 0.95, clipY: 0 }));
  group.add(corr, flankW, flankE);
  lift.add(cross, mirror, rbRig.done(rigMat, 2));
  /** One end of a span rises with the crossing tower, the other stays: a shear along x. */
  const shear = (mesh, dy, xFix, xMov) => {
    const k = dy / (xMov - xFix);
    const e = mesh.matrix.elements;
    e[1] = k;
    e[13] = -k * xFix;
    mesh.matrixWorldNeedsUpdate = true;
  };

  /* ── the trip's flash, at the corridor's far east end: a light that has a place ── */
  const flash = makeGlow({ size: 15000, minPx: 44, k: 2.1 });
  flash.mesh.position.set(EMS.far[0], C.h * 0.7, 0);
  group.add(flash.mesh);

  /* ── Meyer Werft's hall: an X-ray box and its frames ── */
  const [hx, , hz] = HALL.at;
  const hwd = HALL.W / 2;
  const hl = HALL.L / 2;
  const hh = HALL.H;
  const hallGlass = glass(BRAND.ink, { base: 0.003, rim: 0.14, power: 2.6, edge: 0.18, through: 0.25 });
  const hallBox = new THREE.Mesh(new THREE.BoxGeometry(HALL.W, hh, HALL.L).translate(hx, hh / 2, hz), hallGlass);
  asShell(hallBox, 20);
  const rbHall = makeRibbons();
  const NF = 12;
  for (let i = 0; i <= NF; i++) {
    const z = hz - hl + (i / NF) * HALL.L;
    const end = i === 0 || i === NF;
    rbHall.add([[hx - hwd, 0, z], [hx - hwd, hh, z], [hx + hwd, hh, z], [hx + hwd, 0, z]], 14, end ? 0.85 : 0.42);
    rbHall.add([[hx - hwd, hh - 520, z], [hx + hwd, hh - 520, z]], 9, 0.3); // the truss's lower chord
    for (let k = 0; k < 8; k++) {
      const x0 = hx - hwd + (k / 8) * HALL.W;
      rbHall.add([[x0, k % 2 ? hh : hh - 520, z], [x0 + HALL.W / 8, k % 2 ? hh - 520 : hh, z]], 6, 0.2);
    }
  }
  for (const s of [-1, 1]) {
    rbHall.add([[hx + s * hwd, hh, hz - hl], [hx + s * hwd, hh, hz + hl]], 14, 0.85);
    rbHall.add([[hx + s * hwd, 0, hz - hl], [hx + s * hwd, 0, hz + hl]], 12, 0.6);
    rbHall.add([[hx + s * hwd, hh - 1100, hz - hl], [hx + s * hwd, hh - 1100, hz + hl]], 8, 0.3); // the crane rails
  }
  for (const k of [-0.25, 0, 0.25]) rbHall.add([[hx + k * HALL.W, hh, hz - hl], [hx + k * HALL.W, hh, hz + hl]], 7, 0.22);
  rbHall.add([[hx - hwd, 0, hz - hl], [hx + hwd, 0, hz - hl]], 12, 0.6);
  rbHall.add([[hx - hwd, 0, hz + hl], [hx + hwd, 0, hz + hl]], 12, 0.6);
  const zd = hz - hl; // the great door, on the downstream end
  rbHall.add([[hx - 2500, 0, zd], [hx - 2500, 6400, zd], [hx + 2500, 6400, zd], [hx + 2500, 0, zd]], 12, 0.75);
  for (const y of [1600, 3200, 4800]) rbHall.add([[hx - 2500, y, zd], [hx + 2500, y, zd]], 6, 0.3);
  const hallMat = track(plainMat(BRAND.ink, { minPx: 0.95 }));
  const hallLines = rbHall.done(hallMat, 2);
  group.add(hallBox, hallLines);

  /* ── the ship of glass in the hall, and its dotted ghost on the river ── */
  const shape = shipShape();
  const shipGlass = glass(BRAND.ink, { base: 0.004, rim: 0.3, power: 2.4, edge: 0.3, through: 0.2 });
  const ship = new THREE.Group();
  ship.position.set(hx, EMS.water, hz);
  const shipMeshes = shape.glassGeos.map((g) => new THREE.Mesh(g, shipGlass));
  asShell(shipMeshes, 10);
  const rbShip = makeRibbons();
  shape.lines((pts, k) => rbShip.add(pts, 9, k));
  const shipMat = track(plainMat(BRAND.ink, { minPx: 0.95 }));
  ship.add(...shipMeshes, rbShip.done(shipMat, 2));
  group.add(ship);

  const rbGhost = makeRibbons();
  shape.lines((pts, k, main) => main && rbGhost.add(pts, 34, 0.55 + 0.45 * k));
  const ghostMat = track(plainMat(BRAND.ink, { minPx: 1.5, dash: true, dashP: 1300 }, 1.3));
  const ghost = rbGhost.done(ghostMat, 6);
  ghost.position.y = EMS.water;
  group.add(ghost);

  // the clearance: a signal bracket from the mast's top to the lowest wires (drawn in a unit height, scaled to the gap)
  const rbGap = makeRibbons();
  rbGap.add([[-750, 0, 0], [0, 0, 0], [0, 1, 0], [-750, 1, 0]], 24);
  rbGap.add([[0, 0.5, 0], [420, 0.5, 0]], 24);
  const gapMat = track(plainMat(BRAND.signal, { minPx: 2, haloPx: 5, haloK: 1, glow: 1 }, 1.7));
  const gapMesh = rbGap.done(gapMat, 7);
  const yMast = EMS.water + SHIP.air;
  gapMesh.position.set(0, yMast, 0);
  group.add(gapMesh);

  /* ── the wind farm on the eastern horizon: a tower and three light blades, instanced ── */
  const WF = WINDFARM;
  const towerGeo = new THREE.CylinderGeometry(110, 210, WF.hub, 10, 1, true).translate(0, WF.hub / 2, 0);
  const millBody = new THREE.InstancedMesh(towerGeo, farGlass(0.07, 0.6), WF.n);
  const blade = new THREE.CylinderGeometry(50, 190, WF.r, 6, 1).scale(0.3, 1, 1).translate(0, WF.r / 2 + 120, 0);
  const rotorGeo = new THREE.BufferGeometry();
  {
    const pos = [];
    const nor = [];
    for (let k = 0; k < 3; k++) {
      const g = blade.clone().rotateX((k * Math.PI * 2) / 3).toNonIndexed();
      pos.push(...g.attributes.position.array);
      nor.push(...g.attributes.normal.array);
    }
    const nacelle = new THREE.BoxGeometry(900, 330, 330).translate(380, 0, 0).toNonIndexed();
    pos.push(...nacelle.attributes.position.array);
    nor.push(...nacelle.attributes.normal.array);
    rotorGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    rotorGeo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  }
  const rotors = new THREE.InstancedMesh(rotorGeo, farGlass(0.2, 0.55), WF.n);
  const mills = [];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < WF.n; i++) {
    const m = [WF.x0 + ((WF.x1 - WF.x0) * i) / (WF.n - 1), (((i * 7919) % 13) / 13 - 0.5) * 2 * WF.z];
    mills.push(m);
    dummy.position.set(m[0], 0, m[1]);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    millBody.setMatrixAt(i, dummy.matrix);
  }
  millBody.frustumCulled = rotors.frustumCulled = false;
  millBody.renderOrder = rotors.renderOrder = 3;
  group.add(millBody, rotors);

  const A = {
    towerW: anchor(group, -EMS.tower.x, EMS.tower.h, 0),
    towerE: anchor(group, EMS.tower.x, EMS.tower.h, 0),
    mid: anchor(group, 0, EMS.wireLow, 0),
    hall: anchor(group, HALL.at[0], HALL.H / 2, HALL.at[2]),
    ship: anchor(group, HALL.at[0], EMS.water + SHIP.air / 2, HALL.at[2]),
    hook: anchor(group, EMS.hook[0], 0, EMS.hook[2]),
    far: anchor(group, EMS.far[0], C.h * 0.7, 0),
  };

  return {
    group,
    A,
    update(S, time, px) {
      (group.userData.dress ??= dressEms(group)).update(S, time, px);
      const shell = clamp01(S.shell);
      const dy = RAISE * clamp01(S.raise);
      for (let i = 0; i < PX.length; i++) PX[i].value = px;

      // the towers; the crossing ones rise on their new section, the flanking spans follow
      lift.position.y = dy;
      shear(flankW, dy, line[iW - 1].x, line[iW].x - TENS);
      shear(flankE, dy, line[iE + 1].x, line[iE].x + TENS);
      for (let i = 0; i < pylons.length; i++) {
        pylons[i].state.amount = shell;
        pylons[i].state.px = px;
      }
      feet[0].visible = feet[1].visible = dy < 20;
      rigMat.uniforms.uAmount.value = shell;
      A.towerW.position.y = A.towerE.position.y = EMS.tower.h + dy;
      A.mid.position.y = EMS.wireLow + dy;

      // the conductors
      const load = clamp01(S.lineLoad);
      const t = S.tripRun;
      LU.uTime.value = time;
      LU.uLoad.value = load;
      LU.uCut.value.set(clamp01(S.emsCut), clamp01(S.emsCut - 1));
      LU.uFront.value = t > 0.2 ? lerp(EMS.far[0] + 6000, EMS.tower.x - 6000, clamp01((t - 0.2) / 0.8)) : 1e9;
      LU.uDashK.value = load * (1 - smooth(0.2, 0.25, t));
      LU.uWestK.value = 1 - smooth(0.9, 1, t);

      // the flash: it swells, holds (a slow breath at 0.14), dies small
      const up = smooth(0, 0.12, t);
      const die = 1 - smooth(0.2, 0.42, t);
      flash.mesh.visible = t > 0.002 && t < 0.42;
      flash.u.uPx.value = px;
      flash.u.uAmount.value = up * die * (1 + 0.08 * Math.sin(time * 1.3));
      flash.u.uSize.value = 15000 * (0.3 + 0.7 * up) * (0.2 + 0.8 * die);
      flash.u.uMinPx.value = 44 * (0.3 + 0.7 * up) * (0.15 + 0.85 * die);

      // the place
      landMat.uniforms.uAmount.value = shell;
      waterMat.uniforms.uTime.value = time;
      const hall = clamp01(S.hall) * shell;
      hallBox.visible = hallLines.visible = hall > 0.003;
      hallGlass.uniforms.uAmount.value = hall;
      hallMat.uniforms.uAmount.value = hall;
      const shipK = clamp01(S.ship);
      ship.visible = shipK > 0.003;
      shipGlass.uniforms.uAmount.value = shipK;
      shipMat.uniforms.uAmount.value = shipK * 0.8;

      // the ghost outline glides downstream, under the wires at 0.5; the bracket of its clearance
      const p = S.pass;
      const g = smooth(0, 0.04, p) * (1 - smooth(0.96, 1, p));
      ghost.visible = g > 0.003;
      ghost.position.z = SHIP.from * (1 - 2 * p);
      ghostMat.uniforms.uAmount.value = g;
      const gap = clamp01(S.gap);
      gapMesh.visible = gap > 0.003;
      gapMesh.scale.y = EMS.wireLow + dy - yMast;
      gapMat.uniforms.uAmount.value = gap;

      // the wind
      const w = time * 0.9 * S.wind;
      for (let i = 0; i < mills.length; i++) {
        dummy.position.set(mills[i][0] - 420, WF.hub, mills[i][1]);
        dummy.rotation.set(w + i * 1.7, 0, 0);
        dummy.updateMatrix();
        rotors.setMatrixAt(i, dummy.matrix);
      }
      rotors.instanceMatrix.needsUpdate = true;
    },
  };
}

/* ═════════════════════════════ buildQuartier ═════════════════════════════ */

const hash = (i, k = 0) => {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// THE WINDOWS, the street lamps and their pools of light: instanced quads. aInfo: its feeder (0 the priority one · 1 the
// first step · 2), its rank (when its light goes as `shed` runs 0 → 1: by its distance from the poste), its half (0: back
// at `relit` 0.5 · 1: back at 1), its brightness. aKind: 0 a window · 1 a lamp (a glow that faces the eye) · 2 a pool on the ground.
const WIN_VS = /* glsl */ `
  uniform float uPx;
  attribute vec4 aInfo; attribute float aKind;
  varying vec2 vUv; varying vec4 vInfo; varying float vKind; varying float vDepth;
  void main() {
    vUv = uv; vInfo = aInfo; vKind = aKind;
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    if (aKind > 0.5 && aKind < 1.5) {
      mv = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      mv.xy += position.xy * max(70.0, 9.0 * max(-mv.z, 1.0) / uPx);
    }
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
const WIN_FS = /* glsl */ `
  uniform vec3 uInkC, uVeiC; uniform float uLights, uShed, uRelit, uPrio, uFar;
  varying vec2 vUv; varying vec4 vInfo; varying float vKind; varying float vDepth;
  void main() {
    float off = smoothstep(vInfo.y, vInfo.y + 0.1, uShed);
    float back = vInfo.z < 0.5 ? smoothstep(0.3, 0.42, uRelit) : smoothstep(0.8, 0.92, uRelit);
    float on = abs(vInfo.x - 1.0) < 0.5 ? 1.0 - off * (1.0 - back) : 1.0;
    vec2 q = vUv * 2.0 - 1.0;
    float r2 = clamp(dot(q, q), 0.0, 1.0);
    float shape;
    if (vKind > 1.5) shape = 0.16 * (1.0 - r2) * (1.0 - r2);
    else if (vKind > 0.5) shape = (1.5 * exp(-r2 * 26.0) + 0.3 * exp(-sqrt(r2) * 5.0)) * (1.0 - r2);
    else {
      vec2 e = 1.0 - smoothstep(vec2(0.84), vec2(1.0), abs(q));
      float mull = 1.0 - 0.4 * (1.0 - smoothstep(0.03, 0.09, abs(q.x)));
      shape = e.x * e.y * mull * (0.6 + 0.4 * (1.0 - vUv.y));
    }
    vec3 c = mix(uInkC, uVeiC, vInfo.x < 0.5 ? uPrio * 0.85 : 0.0);
    gl_FragColor = vec4(c * shape * vInfo.w * mix(0.03, 1.0, on) * uLights * exp(-max(vDepth, 0.0) / uFar), 1.0);
  }`;

// THE CABLES under the street. vTag: 0 the priority feeder · 1 feeder 1 (the first step) · 2 feeder 2 · 3 the wire from
// your socket. vDist: the distance from the poste (feeders), from the socket (3). Heads of light run from the poste
// (uFeed); feeder 1 dies behind a front that leaves the poste (uShedD) and comes back (uBack); the priority feeder
// turns veille as far as uPrioD; the socket's wire is lit behind a head at uSockD.
const CABLE_FS = /* glsl */ `
  uniform vec3 uInkC, uVeiC; uniform float uTime, uAmount, uFar, uFeed, uPrioD, uShedD, uBack, uSockD;
  varying float vX; varying float vMax; varying float vDist; varying float vDepth; varying float vTag; varying vec3 vW; varying vec2 vS;
  void main() {
    float a = abs(vX);
    float aa = max(fwidth(vX), 1e-3);
    float inCore = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, a);
    float tube = sqrt(clamp(1.0 - a * a, 0.0, 1.0));
    float h = clamp((a - 1.0) / max(vMax - 1.0, 1e-3), 0.0, 1.0);
    float halo = pow(1.0 - h, 2.4) * (1.0 - inCore);
    vec3 col;
    if (vTag > 2.5) {
      float on = 1.0 - smoothstep(uSockD - 12.0, uSockD, vDist);
      float head = on * exp(-max(uSockD - vDist, 0.0) / max(60.0, uSockD * 0.04));
      col = uInkC * ((0.5 + 0.3 * tube) * on + 1.5 * head) * inCore + uInkC * (0.25 * on + 0.9 * head) * halo;
    } else {
      float first = step(0.5, vTag) * (1.0 - step(1.5, vTag));
      float live = mix(1.0, max(smoothstep(uShedD - 250.0, uShedD, vDist), uBack), first);
      float ph = fract((vDist - uTime * 420.0) / 1400.0);
      float head = pow(ph, 6.0) * (1.0 - smoothstep(0.96, 1.0, ph));
      float prio = (1.0 - step(0.5, vTag)) * (1.0 - smoothstep(uPrioD - 80.0, uPrioD, vDist));
      vec3 base = mix(uInkC, uVeiC, prio);
      float k = 0.1 + (0.42 + 1.7 * head) * live * uFeed + 0.55 * prio;
      col = base * k * (0.7 + 0.3 * tube) * inCore + base * (0.5 * head * live * uFeed + 0.3 * prio) * halo;
    }
    gl_FragColor = vec4(col * uAmount * exp(-vDepth / uFar), 1.0);
  }`;

/** A wall plate (8.2 cm) facing its local +z: a French "socket" (a round well, two holes, the earth pin) or a "switch"
 *  (a rocker). SOLID and small: the voice names them. Three greys, a little light of their own (the room's lamp). */
function wallPlate(kind) {
  const g = new THREE.Group();
  const white = solid(0xd9d5c9, { rough: 0.55 });
  const mid = solid(0x8d8e89, { rough: 0.6 });
  const dark = solid(0x1d2022, { rough: 0.8 });
  const metal = solid(0xc9c6bb, { rough: 0.35, metal: 0.5 });
  const mats = [white, mid, dark, metal];
  const plateGeo = box(8.2, 8.2, 1, 0.3);
  const plate = new THREE.Mesh(plateGeo, white);
  const rim = edgesOf(plateGeo, { width: 1.8, opacity: 0.5 });
  plate.position.z = rim.position.z = 0.5;
  g.add(plate, rim);
  const round = (r, len, mat, x, y, z) => {
    const m = new THREE.Mesh(cyl(r, len, Math.min(0.06, r * 0.2), 40), mat);
    m.rotation.x = Math.PI / 2;
    m.position.set(x, y, z);
    g.add(m);
  };
  if (kind === "socket") {
    round(1.95, 0.5, mid, 0, 0, 1.05);
    round(0.27, 0.2, dark, -0.95, 0, 1.3);
    round(0.27, 0.2, dark, 0.95, 0, 1.3);
    round(0.24, 1.3, metal, 0, 0.95, 1.75);
  } else {
    const rockerGeo = box(4.4, 6.4, 0.9, 0.25);
    const rocker = new THREE.Mesh(rockerGeo, mid);
    const re = edgesOf(rockerGeo, { width: 1.8, opacity: 0.45 });
    rocker.position.z = re.position.z = 1.2;
    rocker.rotation.x = re.rotation.x = 0.1;
    g.add(rocker, re);
  }
  for (const m of mats) {
    m.emissive = m.color.clone();
    m.emissiveIntensity = 0.3;
  }
  return { group: g, mats };
}

/** A building's light as `shed` and `relit` run: the same law as the windows' shader. */
const lightOf = (rank, half, shed, relit) => 1 - smooth(rank, rank + 0.1, shed) * (1 - (half ? smooth(0.8, 0.92, relit) : smooth(0.3, 0.42, relit)));

export function buildQuartier() {
  const group = new THREE.Group();
  const Q = QUARTIER;
  const P = Q.poste;
  const F = Q.floor;
  const PX = [];
  const track = (mat) => (PX.push(mat.uniforms.uPx), mat);
  const [cx, , cz] = P.cells;
  const fy = Q.feeders.y;
  const fz = Q.feeders.z;
  const SH = Q.lift.shaft;
  group.add(makeHorizon(0.8), makeGround({ size: 260000, cell: 500, big: 2500, k: 0.075 }));

  /* ── the feeders under the street (20 kV): from the cells out to the street, west, a tap to each block ── */
  const rbFeed = makeRibbons();
  const trunk = (tag, x0, z, xEnd) => {
    rbFeed.add([[x0, 40, cz], [x0, fy, cz], [x0, fy, z], [xEnd, fy, z]], 6, tag, 0);
    const d0 = 40 - fy + (z - cz);
    return (x) => d0 + (x0 - x);
  };
  const tap = (tag, at, x, z, zEnd) => {
    rbFeed.add([[x, fy, z], [x, fy, zEnd], [x, 30, zEnd]], 6, tag, at(x));
    return at(x) + (z - zEnd);
  };
  const f1 = trunk(1, cx + 30, fz, SH[0]); // the FIRST STEP: your building, the lift's, b3, far2
  const D1 = { b3: tap(1, f1, 3900, fz, -150), far2: tap(1, f1, 3000, fz, -3250), home: tap(1, f1, -300, fz, -150), lift: tap(1, f1, SH[0], fz, -150) };
  const rank = (d) => (0.8 * (d - D1.b3)) / (D1.lift - D1.b3);
  const RANK = { home: rank(D1.home), lift: 0.8, b3: 0, far2: rank(D1.far2) };
  const HALF = { home: 1, lift: 1, b3: 0, far2: 0 };
  const f2 = trunk(2, cx + 90, fz + 45, -1000);
  tap(2, f2, 2000, fz + 45, -150);
  tap(2, f2, -1000, fz + 45, -3150);
  const f0 = trunk(0, cx + 150, fz - 45, Q.hospital.at[0]); // the priority one, as far as the hospital
  const L0 = tap(0, f0, Q.hospital.at[0], fz - 45, Q.hospital.at[2] + Q.hospital.d / 2 - 150);
  const cableU = { uInkC: INK.clone(), uVeiC: VEILLE.clone(), uFeed: 0, uPrioD: 0, uShedD: 0, uBack: 0, uSockD: 0 };
  const feedMat = track(ribbonMat(CABLE_FS, cableU, { minPx: 1.35, haloPx: 3.5, haloK: 1, far: 90000 }));
  const FU = feedMat.uniforms;
  const feeders = rbFeed.done(feedMat, 5);
  // « la machine sur laquelle ta prise est branchée » : from your socket down the wall, under the street, to the poste
  const rbSock = makeRibbons();
  const [sx, sy, sz] = Q.socket;
  const LS = rbSock.add([[sx, sy, sz], [sx - 6, sy, sz], [sx - 6, fy, sz], [sx - 6, fy, fz + 90], [cx - 30, fy, fz + 90], [cx - 30, fy, cz], [cx - 30, 40, cz]], 0.45, 3);
  const sockMat = track(ribbonMat(CABLE_FS, cableU, { minPx: 1.4, haloPx: 4, haloK: 0.3, far: 90000 })); // a house wire: from 50 cm, a halo as wide as the core is a pipe
  const SU = sockMat.uniforms;
  const sockWire = rbSock.done(sockMat, 5);
  group.add(feeders, sockWire);

  /* ── the buildings: glass, their edges, their storeys ── */
  const HO = Q.hospital;
  const hosp = { x0: HO.at[0] - HO.w / 2, x1: HO.at[0] + HO.w / 2, z0: HO.at[2] - HO.d / 2, z1: HO.at[2] + HO.d / 2, floors: Math.round(HO.h / F), feeder: 0 };
  const blocks = [
    { id: "home", x0: Q.home.x0, x1: Q.home.x1, z0: Q.home.z0, z1: 0, floors: Q.home.floors, feeder: 1 },
    { id: "lift", x0: Q.lift.x0, x1: Q.lift.x1, z0: -1300, z1: 0, floors: Q.lift.floors, feeder: 1 },
    ...Q.blocks.map((b) => ({ ...b, z1: b.z1 ?? 0 })),
  ];
  const boxGeo = (b) => new THREE.BoxGeometry(b.x1 - b.x0, b.floors * F, b.z1 - b.z0).translate((b.x0 + b.x1) / 2, (b.floors * F) / 2, (b.z0 + b.z1) / 2);
  const shaftH = Q.lift.top + Q.lift.cabin + 60;
  const townGlass = glass(BRAND.ink, { base: 0.002, rim: 0.12, power: 2.8, edge: 0.14, through: 0.2 });
  const town = new THREE.Mesh(mergeGeometries([...blocks.map(boxGeo), boxGeo(hosp), new THREE.BoxGeometry(190, shaftH, 190).translate(SH[0], shaftH / 2, SH[2])]), townGlass);
  asShell(town, 20);
  const edgeBox = (rb, x0, x1, y0, y1, z0, z1, k, r = 6) => {
    for (const y of [y0, y1]) rb.add([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0, y, z0]], r, k);
    for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) rb.add([[x, y0, z], [x, y1, z]], r, k);
  };
  const storeys = (rb, b) => {
    edgeBox(rb, b.x0, b.x1, 0, b.floors * F, b.z0, b.z1, 0.6);
    for (let f = 1; f < b.floors; f++) rb.add([[b.x0, f * F, b.z0], [b.x1, f * F, b.z0], [b.x1, f * F, b.z1], [b.x0, f * F, b.z1], [b.x0, f * F, b.z0]], 4, 0.15);
  };
  const rbTown = makeRibbons();
  for (const b of blocks) storeys(rbTown, b);
  edgeBox(rbTown, SH[0] - 95, SH[0] + 95, 0, shaftH, SH[2] - 95, SH[2] + 95, 0.45, 4); // the lift's shaft, its cables
  rbTown.add([[SH[0], 0, SH[2]], [SH[0], shaftH, SH[2]]], 2.5, 0.3);
  for (const z of [150, 780]) rbTown.add([[-14000, 1, z], [10500, 1, z]], 5, 0.3); // the street's kerbs
  const rbHosp = makeRibbons();
  storeys(rbHosp, hosp);

  /* ── the lit windows, the street lamps ── */
  const inst = [];
  const put = (x, y, z, w, h, rotY, rotX, info, kind) => inst.push({ x, y, z, w, h, rotY, rotX, info, kind });
  let seed = 0;
  const R = Q.room;
  const windowsOf = (b, rk, half, lit, skip) => {
    const face = (len, at) => {
      const n = Math.max(1, Math.floor(len / 290));
      for (let f = 0; f < b.floors; f++)
        for (let k = 0; k < n; k++) {
          const id = ++seed;
          if (hash(id, 1) > lit) continue;
          const [x, y, z, r] = at((k + 0.5) / n, f * F + 165);
          if (skip && skip(x, y, z)) continue;
          put(x, y, z, 110, 135, r, 0, [b.feeder, rk + 0.05 * hash(id, 2), half, 0.4 + 0.6 * hash(id, 3)], 0);
        }
    };
    face(b.x1 - b.x0, (u, y) => [lerp(b.x0, b.x1, u), y, b.z1 + 3, 0]);
    // a gable that faces a neighbour across a two-metre gap is a blind wall
    const blind = (x, west) => blocks.some((o) => o !== b && Math.abs((west ? o.x1 : o.x0) - x) < 500 && o.z0 < b.z1 && o.z1 > b.z0);
    if (!blind(b.x0, true)) face(b.z1 - b.z0, (u, y) => [b.x0 - 3, y, lerp(b.z0, b.z1, u), -Math.PI / 2]);
    if (!blind(b.x1, false)) face(b.z1 - b.z0, (u, y) => [b.x1 + 3, y, lerp(b.z0, b.z1, u), Math.PI / 2]);
  };
  for (const b of blocks) windowsOf(b, RANK[b.id] ?? 0, HALF[b.id] ?? 0, 0.62, b.id === "home" ? (x, y, z) => z > -10 && Math.abs(y - (R.floorY + 165)) < 10 && x > 180 && x < 520 : null);
  windowsOf(hosp, 0, 0, 0.86);
  const home = [1, RANK.home, 1];
  put(Q.window[0], Q.window[1], -2, 220, 150, 0, 0, [...home, 0.2], 0); //                                  your window, lit from inside (faint: we look in)
  put((R.x0 + R.x1) / 2, R.floorY + 1.5, -R.depth / 2, 520, 400, 0, -Math.PI / 2, [...home, 0.7], 2); //    the lamp's pool on your floor
  const rbLamps = [];
  for (let x = -3300; x <= 6100; x += 1175) {
    const own = x > 4900 ? [2, 0, 0] : x > 3000 ? [1, RANK.b3, 0] : x > 1000 ? [2, 0, 0] : x > -1000 ? home : [1, RANK.lift, 1];
    rbLamps.push([[x, 0, 830], [x, 700, 830], [x, 725, 730]]);
    put(x, 716, 722, 1, 1, 0, 0, [...own, 1], 1);
    put(x, 1.5, 560, 950, 950, 0, -Math.PI / 2, [...own, 0.8], 2);
  }
  for (const l of rbLamps) rbTown.add(l, 4, 0.4);
  const winGeo = new THREE.PlaneGeometry(1, 1);
  const winMat = track(
    new THREE.ShaderMaterial({
      uniforms: { uPx: { value: 1500 }, uInkC: { value: INK.clone() }, uVeiC: { value: VEILLE.clone() }, uLights: { value: 1 }, uShed: { value: 0 }, uRelit: { value: 0 }, uPrio: { value: 0 }, uFar: { value: 70000 } },
      vertexShader: WIN_VS,
      fragmentShader: WIN_FS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  );
  const WU = winMat.uniforms;
  const wins = new THREE.InstancedMesh(winGeo, winMat, inst.length);
  const info = new Float32Array(inst.length * 4);
  const kind = new Float32Array(inst.length);
  const dummy = new THREE.Object3D();
  inst.forEach((w, i) => {
    dummy.position.set(w.x, w.y, w.z);
    dummy.rotation.set(w.rotX, w.rotY, 0);
    dummy.scale.set(w.w, w.h, 1);
    dummy.updateMatrix();
    wins.setMatrixAt(i, dummy.matrix);
    info.set(w.info, i * 4);
    kind[i] = w.kind;
  });
  winGeo.setAttribute("aInfo", new THREE.InstancedBufferAttribute(info, 4));
  winGeo.setAttribute("aKind", new THREE.InstancedBufferAttribute(kind, 1));
  wins.frustumCulled = false;
  wins.renderOrder = 6;
  const townMat = track(plainMat(BRAND.ink, { minPx: 0.95, far: 90000 }));
  const hospMat = track(plainMat(BRAND.ink, { minPx: 1.1, far: 90000 }));
  group.add(town, rbTown.done(townMat, 2), rbHosp.done(hospMat, 2), wins);

  /* ── your room, second floor: the lamp, the TV, the socket, the switch ── */
  const roomGroup = new THREE.Group();
  const rbRoom = makeRibbons();
  const ry = R.floorY;
  const rh = 270;
  edgeBox(rbRoom, R.x0, R.x1, ry, ry + rh, -R.depth, 0, 0.5, 1.1);
  const [wx, wy] = Q.window;
  rbRoom.add([[wx - 110, wy - 75, 0], [wx + 110, wy - 75, 0], [wx + 110, wy + 75, 0], [wx - 110, wy + 75, 0], [wx - 110, wy - 75, 0]], 2.2, 1);
  rbRoom.add([[wx, wy - 75, 0], [wx, wy + 75, 0]], 1.4, 0.7);
  rbRoom.add([[Q.lamp[0], ry + rh, Q.lamp[2]], [Q.lamp[0], Q.lamp[1] + 6, Q.lamp[2]]], 0.6, 0.7); // the lamp's cord
  edgeBox(rbRoom, Q.tv[0] - 70, Q.tv[0] + 70, ry, ry + 55, Q.tv[2] - 16, Q.tv[2] + 16, 0.35, 0.9); // the TV's cabinet
  edgeBox(rbRoom, Q.tv[0] - 46, Q.tv[0] + 46, Q.tv[1] - 27, Q.tv[1] + 27, Q.tv[2] - 5, Q.tv[2], 0.6, 0.8);
  edgeBox(rbRoom, 300, 520, ry, ry + 42, -250, -170, 0.3, 0.9); //                                   a sofa, facing the TV
  edgeBox(rbRoom, 300, 520, ry + 42, ry + 85, -186, -170, 0.3, 0.9);
  const roomMat = track(plainMat(BRAND.ink, { minPx: 0.95, far: 90000 }));
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(5.5, 20, 14), new THREE.MeshBasicMaterial({ color: INK.clone(), fog: false }));
  bulb.position.set(...Q.lamp);
  const lampGlow = makeGlow({ core: [1, 0.95, 0.86], tail: INK, size: 190, minPx: 11, k: 1.5 });
  lampGlow.mesh.position.set(...Q.lamp);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(88, 50), new THREE.MeshBasicMaterial({ color: INK.clone(), fog: false }));
  screen.position.set(Q.tv[0], Q.tv[1], Q.tv[2] + 0.5);
  const socket = wallPlate("socket");
  socket.group.position.set(sx + 0.2, sy, sz);
  const sw = wallPlate("switch");
  sw.group.position.set(Q.switchAt[0] + 0.2, Q.switchAt[1], Q.switchAt[2]);
  socket.group.rotation.y = sw.group.rotation.y = Math.PI / 2; // on the room's west wall, facing +x
  const plateMats = [...socket.mats, ...sw.mats];
  roomGroup.add(rbRoom.done(roomMat, 2), bulb, lampGlow.mesh, screen, socket.group, sw.group);
  const fig = makeFigure({ shell: true, glassK: 0.85, order: 12 }); // you, of glass from head to hands, at your window
  fig.ghost(true);
  fig.group.position.set(...Q.you);
  group.add(roomGroup, fig.group);

  /* ── the lift: a lit cabin in its shaft ── */
  const cabin = new THREE.Group();
  cabin.position.set(SH[0], 0, SH[2]);
  const cabGeo = new THREE.BoxGeometry(150, Q.lift.cabin, 150).translate(0, Q.lift.cabin / 2, 0);
  const cabEdges = edgesOf(cabGeo, { width: 2, opacity: 0.9 });
  const cabLight = new THREE.Mesh(new THREE.PlaneGeometry(120, 120).rotateX(Math.PI / 2).translate(0, Q.lift.cabin - 8, 0), new THREE.MeshBasicMaterial({ color: INK.clone(), side: THREE.DoubleSide, fog: false }));
  const cabGlow = makeGlow({ core: [1, 0.95, 0.86], tail: INK, size: 420, minPx: 12, k: 1.3 });
  cabGlow.mesh.position.y = Q.lift.cabin * 0.6;
  cabin.add(cabEdges, cabLight, cabGlow.mesh);
  group.add(cabin);

  /* ── the poste source: an X-ray hall, the other cells of the row, the transformer outside, the 63 kV line ── */
  const posteGroup = new THREE.Group();
  const px0 = P.at[0] - P.w / 2;
  const px1 = P.at[0] + P.w / 2;
  const pz0 = P.at[2] - P.d / 2;
  const pz1 = P.at[2] + P.d / 2;
  const posteGlass = glass(BRAND.ink, { base: 0.002, rim: 0.12, power: 2.8, edge: 0.16, through: 0.25 });
  const posteHall = new THREE.Mesh(new THREE.BoxGeometry(P.w, P.h, P.d).translate(P.at[0], P.h / 2, P.at[2]), posteGlass);
  const cellsGlass = glass(BRAND.ink, { base: 0.003, rim: 0.15, power: 2.6, edge: 0.1 });
  const others = [];
  const rbPoste = makeRibbons();
  const rowX = cx + HERO.cell.w * HERO.n + 40; // the hero's four steps stand first; the row goes on, in glass
  for (let x = rowX; x + 60 < px1 - 150; x += 62) others.push(new THREE.BoxGeometry(58, HERO.cell.h, HERO.cell.d - 2).translate(x + 29, HERO.cell.h / 2, cz));
  const otherCells = new THREE.Mesh(mergeGeometries(others), cellsGlass);
  asShell(otherCells, 14);
  asShell(posteHall, 20);
  const rowEnd = rowX + others.length * 62;
  // (radii in true centimetres: the camera comes within a few metres of these — a fat radius is a pipe on the floor)
  edgeBox(rbPoste, rowX, rowEnd, 0, HERO.cell.h, cz - HERO.cell.d / 2, cz + HERO.cell.d / 2, 0.3, 0.8);
  for (let k = 1; k < others.length; k++) rbPoste.add([[rowX + k * 62, 0, cz + HERO.cell.d / 2], [rowX + k * 62, HERO.cell.h, cz + HERO.cell.d / 2], [rowX + k * 62, HERO.cell.h, cz - HERO.cell.d / 2]], 0.6, 0.2);
  edgeBox(rbPoste, px0, px1, 0, P.h, pz0, pz1, 0.7, 1.6);
  for (let x = px0 + 550; x < px1 - 10; x += 550) rbPoste.add([[x, 0, pz0], [x, P.h, pz0], [x, P.h, pz1], [x, 0, pz1]], 1.2, 0.22);
  rbPoste.add([[8000, 0, pz1], [8000, 300, pz1], [8280, 300, pz1], [8280, 0, pz1]], 1.2, 0.5); // its door, away from the cells
  const tx = P.transfo[0];
  const tz = P.transfo[2];
  const HT = { y: 1500, gap: 400, poles: [9750, 22000, 34500, 47000, 59500] };
  for (const x of HT.poles) {
    for (const s of [-1, 1]) rbPoste.add([[x, 0, tz + s * 330], [x, HT.y + 230, tz + s * 330]], 9, 0.6);
    rbPoste.add([[x, HT.y + 130, tz - 560], [x, HT.y + 130, tz + 560]], 9, 0.6);
    rbPoste.add([[x, HT.y - 500, tz - 330], [x, HT.y + 130, tz + 330]], 5, 0.3);
    rbPoste.add([[x, HT.y - 500, tz + 330], [x, HT.y + 130, tz - 330]], 5, 0.3);
    for (const k of [-1, 0, 1]) rbPoste.add([[x, HT.y + 130, tz + k * HT.gap], [x, HT.y, tz + k * HT.gap]], 4, 0.5);
  }
  const rbHT = makeRibbons();
  for (const k of [-1, 0, 1]) {
    for (let i = 0; i + 1 < HT.poles.length; i++) rbHT.add(para([HT.poles[i], HT.y, tz + k * HT.gap], [HT.poles[i + 1], HT.y, tz + k * HT.gap], 330, 16), 1.4, 0);
    rbHT.add(para([HT.poles[0], HT.y, tz + k * HT.gap], [tx + 90, 530, tz + k * 95], 70, 10), 1.4, 0); // down to the bushings
  }
  const htMat = track(
    ribbonMat(
      LINE_FS,
      { uSigC: SIGNAL.clone(), uInkC: INK.clone(), uCut: new THREE.Vector2(0, 0), uLoad: 0, uTx: 1e7, uFront: 1e9, uWestK: 1, uDashP: DASH.p, uDashV: DASH.v, uDashK: 0, uHalf: 0 },
      { minPx: 1.1, haloPx: 3, haloK: 1, far: 140000 },
    ),
  );
  const posteMat = track(plainMat(BRAND.ink, { minPx: 0.95, far: 140000 }));
  // the transformer: solid, sober (three greys)
  const transfo = new THREE.Group();
  transfo.position.set(tx, 0, tz);
  const tankM = solid(0x5a6368, { rough: 0.62, metal: 0.3 });
  const finM = solid(0x394045, { rough: 0.7, metal: 0.3 });
  const paleM = solid(0xb9b5a8, { rough: 0.5, metal: 0.2 });
  const at = (mesh, x, y, z) => (mesh.position.set(x, y, z), transfo.add(mesh), mesh);
  const tankGeo = box(300, 300, 420, 6);
  at(new THREE.Mesh(tankGeo, tankM), 0, 190, 0);
  at(edgesOf(tankGeo, { width: 1.8, opacity: 0.55 }), 0, 190, 0);
  at(new THREE.Mesh(box(330, 30, 460, 3), finM), 0, 20, 0);
  const fins = [];
  for (const s of [-1, 1]) for (let k = 0; k < 10; k++) fins.push(new THREE.BoxGeometry(5, 240, 46).translate(-120 + k * 26.7, 185, s * 236));
  at(new THREE.Mesh(mergeGeometries(fins), finM), 0, 0, 0);
  const cons = at(new THREE.Mesh(cyl(42, 300, 4, 32), paleM), -70, 400, 0); // the conservator
  cons.rotation.x = Math.PI / 2;
  for (const k of [-1, 0, 1]) {
    at(new THREE.Mesh(cyl(16, 190, 1.5, 24, 8), paleM), 90, 435, k * 95); // the 63 kV bushings
    at(new THREE.Mesh(cyl(7, 60, 1, 16), paleM), -120, 370, k * 60);
  }
  for (const m of transfo.children) if (m.material.isMeshStandardMaterial) m.castShadow = m.receiveShadow = true;
  posteGroup.add(posteHall, otherCells, rbPoste.done(posteMat, 2), rbHT.done(htMat, 5), transfo);
  group.add(posteGroup);

  const A = {
    window: anchor(group, ...Q.window),
    lamp: anchor(group, ...Q.lamp),
    socket: anchor(group, ...Q.socket),
    switchAt: anchor(group, ...Q.switchAt),
    you: anchor(group, Q.you[0], Q.you[1] + 150, Q.you[2]),
    lift: anchor(group, ...Q.lift.shaft),
    cells: anchor(group, ...P.cells),
    poste: anchor(group, P.at[0], P.h / 2, P.at[2]),
    hospital: anchor(group, Q.hospital.at[0], Q.hospital.h / 2, Q.hospital.at[2]),
  };
  return {
    group,
    A,
    update(S, time, px) {
      (group.userData.dress ??= dressQuartier(group)).update(S, time, px);
      for (let i = 0; i < PX.length; i++) PX[i].value = px;
      const townK = clamp01(S.town);
      const shed = clamp01(S.shed);
      const relit = clamp01(S.relit);
      const prio = clamp01(S.prio);
      const room = clamp01(S.room);
      const poste = clamp01(S.poste);
      const homeOn = lightOf(RANK.home, 1, shed, relit);
      const liftOn = lightOf(RANK.lift, 1, shed, relit);

      // the town and its windows: feeder 1 goes dark street after street from the poste, comes back by halves
      townGlass.uniforms.uAmount.value = townK;
      townMat.uniforms.uAmount.value = townK;
      hospMat.uniforms.uAmount.value = Math.max(townK, prio);
      hospMat.uniforms.uColor.value.copy(INK).lerp(VEILLE, prio);
      WU.uLights.value = clamp01(S.lights);
      WU.uShed.value = shed;
      WU.uRelit.value = relit;
      WU.uPrio.value = prio;

      // your room: « ta lumière » follows your feeder
      roomGroup.visible = room > 0.003;
      roomMat.uniforms.uAmount.value = room * (0.45 + 0.55 * homeOn);
      bulb.material.color.copy(INK).multiplyScalar(0.05 + 2.3 * homeOn);
      lampGlow.u.uPx.value = px;
      lampGlow.u.uAmount.value = room * homeOn;
      const tv = clamp01(S.tv) * homeOn * (0.62 + 0.26 * Math.sin(time * 0.7) + 0.12 * Math.sin(time * 1.9 + 1));
      screen.material.color.copy(INK).multiplyScalar(0.02 + 0.95 * tv);
      for (let i = 0; i < plateMats.length; i++) plateMats[i].emissiveIntensity = 0.1 + 0.3 * homeOn;
      const you = clamp01(S.you) * room;
      fig.group.visible = you > 0.01;
      fig.body.uniforms.uAmount.value = you;

      // the lift
      cabin.position.y = Q.lift.top * clamp01(S.lift);
      const cab = 0.05 + 0.95 * liftOn;
      cabLight.material.color.copy(INK).multiplyScalar(1.3 * cab);
      cabGlow.u.uPx.value = px;
      cabGlow.u.uAmount.value = cab;
      cabEdges.material.opacity = townK * (0.35 + 0.55 * cab);

      // the poste source
      posteGroup.visible = poste > 0.003;
      posteGlass.uniforms.uAmount.value = poste;
      cellsGlass.uniforms.uAmount.value = poste;
      posteMat.uniforms.uAmount.value = poste;
      htMat.uniforms.uAmount.value = poste;
      transfo.visible = poste > 0.5;

      // the feeders, the wire from your socket
      const feed = clamp01(S.feed);
      feeders.visible = feed > 0.003 || prio > 0.003;
      FU.uTime.value = time;
      FU.uAmount.value = Math.max(feed, prio);
      FU.uFeed.value = feed;
      FU.uPrioD.value = prio * L0 * 1.03;
      FU.uShedD.value = (D1.b3 - 600 + (shed / 0.8) * (D1.lift - D1.b3 + 600)) * smooth(0, 0.04, shed);
      FU.uBack.value = smooth(0.3, 0.42, relit);
      const sock = clamp01(S.socket);
      sockWire.visible = sock > 0.003;
      SU.uSockD.value = Math.pow(sock, 2.2) * LS * 1.02;
    },
  };
}
