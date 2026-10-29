// DOSSIER L03 — the INSIDE of the airliner at night: the cabin seen like an X-ray, its passengers of glass, its light.
//
//   buildCabine() → { group, A, set(p, time, px) }
//   p = { layout, lights, emerg, smoke, fire, breach, pax, floor, glow, signs, crowd, you, bag, bins, obstacles, dolls,
//         crew, pa, door, arm, hatch, wider, panels, extinguisher, cut, mood }   (their meaning: FIRST, in world.js)
//   A = { bustle   Object3D in the 1L door's lower inner part, MOVING WITH THE DOOR, turned 180° about y (its local +z
//                  faces the cabin, −z): world.js hangs the slide pack (model.js) on it — PACK_IN_DOOR is its place
//                  when the door is shut
//         sill     Object3D at the floor brackets, on the floor at the door's sill (fixed to the cabin): where the
//                  girt bar hooks when armed
//         lever    Object3D at the arming lever's pivot (on the door)
//         you      { head, hands } Object3D on your figure (seated at YOU, wide layout)
//         bag      Object3D at your bag's centre
//         hatch    Object3D at the overwing hatch's centre (narrow layout)
//         exit     Object3D at the floor where the line turns into the door (wide: 1L) }
//   …and, added by the set: exitNarrow, door (the 1L panel), crew (head), megaphone, speaker, sign (over 1L), doll,
//   window (a left window, aft: the fire behind it), line120 (the cut's 1,20 m), passage, extinguisher, bins, door2.
//
// THE CABIN'S FRAME (plan.js · CAB): the floor is y = 0, forward −x, the LEFT wall +z. Door 1L at x = 0 on the left wall;
// the rows run aft (+x) from CAB.x0 every `pitch` (rowX is the seat BACK; the cushion runs forward of it). Two LAYOUTS
// (`layout`, one shown): wide (A350: 3-3-3, two aisles) and narrow (737: 3-3, one aisle, the right overwing hatch).
//
// HOW IT IS DRAWN (docs/journal/L03-cabine.md):
//   · structure: TUBES OF LIGHT (never thinner than 1.9 px), not lines — they dim as they thin, and the ones that repeat
//     row after row (frames, windows, lamps, seats) melt away where one pitch spans fewer than ~8 px: the cabin seen
//     down its length is a soft depth, never a grating that crawls
//   · seats and passengers: glass shells (`asShell`) in our own shader (the same light as the kit's glass, plus that
//     fade and the smoke); the seats near you, your bag, the lever, the brackets, the hatch: SOLID
//   · THE SMOKE: a volume marched in a shader (as 012's gas layer): sheets that roll from frame 1, a soft hanging
//     underside, dark and warm, almost no light of its own. It is drawn right after the solids and tested against their
//     depth (a seat in front of it hides it); what glows (glass, tubes, lamps, signs) is dimmed by the smoke between it
//     and the eye, in its own shader: a lamp in the smoke drowns
//   · THE FLOOR LINE: a tube of light at the floor with its soft pool, drawn after the smoke (it is never in it)
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, box, cyl, lathe, addMesh, makePart, setPartOpacity, mergeGeometries, anchor, asShell } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { makeMotes, makeContact } from "@kit/atmo.js";
import { rng } from "@kit/rng.js";
import { CAB, SMOKE, YOU, CREW } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);

/* ─────────────────────────────────────────────────────────── the order things are drawn in */
const ORDER = { smoke: 5, rods: 6, windows: 6, lamps: 7, flames: 7, line: 8, figures: 10, dolls: 12, crowd: 14, seats: 22, glass: 24 };

/* ─────────────────────────────────────────────────────────── shared GLSL */
// how many pixels one step of `pitch` along the cabin (world x) spans at this point: the rows melt where it is small
const SPAN = /* glsl */ `
  float spanPx(vec3 w, float pitch) {
    vec4 a = projectionMatrix * viewMatrix * vec4(w, 1.0);
    vec4 b = projectionMatrix * viewMatrix * vec4(w + vec3(pitch, 0.0, 0.0), 1.0);
    if (a.w < 1.0 || b.w < 1.0) return 1e4;
    return length((b.xy / b.w - a.xy / a.w) * 0.5 * uView);
  }`;
// how much light gets through the smoke between the eye and this point: the share of the segment inside the layer
// (between its underside and the ceiling) times its length — an average of the volume, enough to drown a lamp
const SMOKE_T = /* glsl */ `
  float smokeT(vec3 w) {
    if (uSmoke.z <= 0.0) return 1.0;
    float a = min(cameraPosition.y, w.y);
    float b = max(cameraPosition.y, w.y);
    float inside = b - a < 0.01 ? step(uSmoke.x, a) * step(a, uSmoke.y) : clamp((min(b, uSmoke.y) - max(a, uSmoke.x)) / (b - a), 0.0, 1.0);
    float xa = min(cameraPosition.x, w.x);
    float xb = max(cameraPosition.x, w.x);
    float inX = xb - xa < 0.01 ? step(uSmokeX.x, xa) * step(xa, uSmokeX.y) : clamp((min(xb, uSmokeX.y) - max(xa, uSmokeX.x)) / (xb - xa), 0.0, 1.0);
    return exp(-uSmoke.z * inside * inX * length(w - cameraPosition));
  }`;

/**
 * Glass, as the kit's (`glass()`: a rim where the surface turns away, a crisp lip), plus: the rows that melt with
 * distance (`pitch`), a far fade, the smoke in front of it, and a cut (`uClipX`). It keeps the uniforms `asShell` needs.
 * `decl` / `body`: GLSL that moves the vertex (`pos`, `nrm` in object space; `alive` multiplies the light).
 */
function glassMat(U, { color = BRAND.ink, base = 0, rim = 0.24, power = 2.3, edge = 0.25, pitch = 0, far = [700, 2600, 0.22], near = [14, 60], decl = "", body = "", uniforms = {} } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uBase: { value: base }, uRim: { value: rim }, uPower: { value: power }, uEdge: { value: edge },
      uAmount: { value: 1 }, uGain: { value: 1 }, uSpec: { value: 0 }, uPitch: { value: pitch }, uFar: { value: new THREE.Vector3(...far) }, uNear: { value: new THREE.Vector2(...near) },
      uClipX: U.uClipX, uView: U.uView, uSmoke: U.uSmoke, uSmokeX: U.uSmokeX, ...uniforms,
    },
    vertexShader: /* glsl */ `
      uniform float uPitch; uniform vec2 uView; uniform vec3 uFar; uniform vec3 uSmoke; uniform vec2 uSmokeX; uniform vec2 uNear;
      ${decl}
      varying vec3 vN; varying vec3 vV; varying float vX; varying float vFade;
      ${SPAN}
      ${SMOKE_T}
      void main() {
        vec3 pos = position; vec3 nrm = normal; float alive = 1.0;
        ${body}
        vec4 w = modelMatrix * vec4(pos, 1.0);
        vec4 mv = viewMatrix * w;
        vN = normalMatrix * nrm;
        vV = -mv.xyz;
        vX = w.x;
        float f = alive;
        if (uPitch > 0.0) f *= smoothstep(4.0, 11.0, spanPx(w.xyz, uPitch));
        float dEye = length(w.xyz - cameraPosition);
        f *= 1.0 - (1.0 - uFar.z) * smoothstep(uFar.x, uFar.y, dEye);
        f *= smoothstep(uNear.x, uNear.y, dEye);
        vFade = f * smokeT(w.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uBase, uRim, uPower, uEdge, uAmount, uGain, uClipX;
      varying vec3 vN; varying vec3 vV; varying float vX; varying float vFade;
      void main() {
        if (uAmount < 0.003 || vFade < 0.003 || vX < uClipX) discard;
        vec3 n = vN / max(length(vN), 1e-5);
        vec3 v = vV / max(length(vV), 1e-5);
        float g = clamp(1.0 - abs(dot(n, v)), 0.0, 1.0);
        float light = uBase + uRim * pow(g, uPower) + uEdge * smoothstep(0.6, 0.97, g);
        gl_FragColor = vec4(uColor * light * uAmount * uGain * vFade, 1.0);
      }`,
  });
  mat.userData.through = 0;
  return mat;
}

/* ─────────────────────────────────────────────────────────── tubes of light (the structure) */
/** Segments [{ a, b, r, rep, k }] as thin open tubes in one geometry. `rep`: the pitch they repeat at (0: they don't). */
function rodGeometry(segs, radial = 6, overlap = true) {
  const pos = [];
  const nrm = [];
  const aR = [];
  const aRep = [];
  const aK = [];
  const idx = [];
  const A = V3();
  const B = V3();
  const D = V3();
  const U1 = V3();
  const U2 = V3();
  for (const s of segs) {
    A.set(...s.a);
    B.set(...s.b);
    D.subVectors(B, A);
    const L = D.length();
    if (L < 1e-3) continue;
    D.divideScalar(L);
    const r = s.r ?? 0.6;
    if (overlap) {
      A.addScaledVector(D, -r); // overlap at the joints: no gap where a polyline turns
      B.addScaledVector(D, r);
    }
    U1.set(0, 1, 0);
    if (Math.abs(D.y) > 0.9) U1.set(1, 0, 0);
    U1.cross(D).normalize();
    U2.crossVectors(D, U1);
    const base = pos.length / 3;
    for (let e = 0; e < 2; e++) {
      const P = e ? B : A;
      for (let i = 0; i < radial; i++) {
        const th = (i / radial) * Math.PI * 2;
        const c = Math.cos(th);
        const sn = Math.sin(th);
        const nx = U1.x * c + U2.x * sn;
        const ny = U1.y * c + U2.y * sn;
        const nz = U1.z * c + U2.z * sn;
        pos.push(P.x + nx * r, P.y + ny * r, P.z + nz * r);
        nrm.push(nx, ny, nz);
        aR.push(r);
        aRep.push(s.rep ?? 0);
        aK.push(s.k ?? 1);
      }
    }
    for (let i = 0; i < radial; i++) {
      const j = (i + 1) % radial;
      idx.push(base + i, base + j, base + radial + i, base + j, base + radial + j, base + radial + i);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("aR", new THREE.Float32BufferAttribute(aR, 1));
  g.setAttribute("aRep", new THREE.Float32BufferAttribute(aRep, 1));
  g.setAttribute("aK", new THREE.Float32BufferAttribute(aK, 1));
  g.setIndex(idx);
  return g;
}

/** The tubes' light: never thinner than `minPx` (and dimmer as they would be thinner), melting where they repeat densely. */
function rodMat(U, color, { minPx = 1.9, far = [1100, 3200, 0.35], gain = 1 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color).multiplyScalar(gain) }, uAmount: { value: 1 }, uMinPx: { value: minPx }, uFar: { value: new THREE.Vector3(...far) },
      uClipX: U.uClipX, uView: U.uView, uSmoke: U.uSmoke, uSmokeX: U.uSmokeX,
    },
    vertexShader: /* glsl */ `
      attribute float aR; attribute float aRep; attribute float aK;
      uniform vec2 uView; uniform float uMinPx; uniform vec3 uFar; uniform vec3 uSmoke; uniform vec2 uSmokeX;
      varying float vK; varying vec3 vN; varying vec3 vV; varying float vX;
      ${SPAN}
      ${SMOKE_T}
      void main() {
        vec4 w0 = modelMatrix * vec4(position, 1.0);
        float depth = max(1.0, -(viewMatrix * w0).z);
        float cmPerPx = depth / max(projectionMatrix[1][1] * uView.y * 0.5, 1.0);
        float rr = max(aR, 0.5 * uMinPx * cmPerPx);
        vec4 w = modelMatrix * vec4(position + normal * (rr - aR), 1.0);
        vec4 mv = viewMatrix * w;
        float k = aK * sqrt(aR / rr);
        if (aRep > 0.0) k *= smoothstep(5.0, 13.0, spanPx(w.xyz, aRep));
        float dEye = length(w.xyz - cameraPosition);
        k *= 1.0 - (1.0 - uFar.z) * smoothstep(uFar.x, uFar.y, dEye);
        k *= smoothstep(18.0, 80.0, dEye); // a tube grazing the lens is a white bar
        vK = k * smokeT(w.xyz);
        vN = normalMatrix * normal;
        vV = -mv.xyz;
        vX = w.x;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uClipX;
      varying float vK; varying vec3 vN; varying vec3 vV; varying float vX;
      void main() {
        if (vX < uClipX || uAmount < 0.003 || vK < 0.002) discard;
        float f = clamp(abs(dot(vN / max(length(vN), 1e-5), vV / max(length(vV), 1e-5))), 0.0, 1.0);
        gl_FragColor = vec4(uColor * vK * uAmount * (0.45 + 0.55 * f), 1.0);
      }`,
  });
}

function rods(U, segs, color, o = {}) {
  const mesh = new THREE.Mesh(rodGeometry(segs, o.radial ?? 6), rodMat(U, color, o));
  mesh.frustumCulled = false;
  mesh.renderOrder = ORDER.rods;
  return mesh;
}

/* ─────────────────────────────────────────────────────────── flat things of light (windows, signs, lamps…) */
/**
 * Quads, each with its own centre, two axes and size, and a few numbers (`aA`): one draw for all the windows of a wall,
 * all the signs, all the speakers. `frag` writes `col` from `vUv` (0–1), `vA`, `vX`; light gets the smoke and the fade.
 */
function quads(U, items, { decl = "", frag, uniforms = {}, pitch = 0, double = true, far = [800, 2800, 0.3] }) {
  const pos = [];
  const uv = [];
  const aA = [];
  const idx = [];
  for (const it of items) {
    const [cx, cy, cz] = it.c;
    const [ux, uy, uz] = it.u; // half-width axis (scaled)
    const [vx, vy, vz] = it.v; // half-height axis (scaled)
    const b = pos.length / 3;
    for (const [s, t] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      pos.push(cx + ux * s + vx * t, cy + uy * s + vy * t, cz + uz * s + vz * t);
      uv.push((s + 1) / 2, (t + 1) / 2);
      aA.push(...(it.a ?? [0, 0, 0, 0]));
    }
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("aA", new THREE.Float32BufferAttribute(aA, 4));
  g.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: double ? THREE.DoubleSide : THREE.FrontSide,
    uniforms: { uAmount: { value: 1 }, uTime: U.uTime, uClipX: U.uClipX, uView: U.uView, uSmoke: U.uSmoke, uSmokeX: U.uSmokeX, uPitch: { value: pitch }, uFar: { value: new THREE.Vector3(...far) }, ...uniforms },
    vertexShader: /* glsl */ `
      attribute vec4 aA; uniform vec2 uView; uniform vec3 uSmoke; uniform vec2 uSmokeX; uniform float uPitch; uniform vec3 uFar;
      varying vec2 vUv; varying vec4 vA; varying float vX; varying float vFade; varying float vY;
      ${SPAN}
      ${SMOKE_T}
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vUv = uv; vA = aA; vX = w.x; vY = w.y;
        float f = smokeT(w.xyz);
        if (uPitch > 0.0) f *= smoothstep(5.0, 13.0, spanPx(w.xyz, uPitch));
        f *= 1.0 - (1.0 - uFar.z) * smoothstep(uFar.x, uFar.y, length(w.xyz - cameraPosition));
        vFade = f;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount, uClipX, uTime; ${decl}
      varying vec2 vUv; varying vec4 vA; varying float vX; varying float vFade; varying float vY;
      float fill(float sd) { float fw = max(fwidth(sd), 1e-4); return 1.0 - smoothstep(-fw, fw, sd); }
      float stroke(float sd, float w) { float fw = max(fwidth(sd), 1e-4); return 1.0 - smoothstep(w - fw, w + fw * 1.5, abs(sd)); }
      float rbox(vec2 p, vec2 h, float r) { vec2 d = abs(p) - h + r; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r; }
      float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0); return length(pa - ba * h); }
      void main() {
        if (vX < uClipX || uAmount < 0.003 || vFade < 0.002) discard;
        vec3 col = vec3(0.0);
        ${frag}
        gl_FragColor = vec4(col * uAmount * vFade, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  return mesh;
}

/* ─────────────────────────────────────────────────────────── the smoke: noise to march through */
/** A block of noise that tiles (three octaves of value noise) — 012's, a little larger. */
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
let NOISE = null;

/**
 * THE SMOKE, one slab under the ceiling of a cabin. Marched front to back: what is near hides what is far; its
 * underside hangs in billows and rolls forward (it moves from frame 1); three to five sheets stacked in it; dark,
 * warm, nearly no light of its own — lit a little from below, warmer where the fire is (the left side). Two meshes of
 * the same slab: seen from below or from in front (the eye outside it), its near faces are drawn and TESTED against the
 * solids' depth (a seat in front of the smoke hides it); with the eye inside it, its far faces, over everything.
 */
function makeSmoke(U, C, x0, x1) {
  NOISE ??= noiseBlock(48, 3107);
  const half = C.w / 2;
  const shared = {
    uNoise: { value: NOISE }, uTime: U.uTime, uMin: { value: V3(x0, 60, -half) }, uMax: { value: V3(x1, C.h, half) },
    uBottom: { value: C.h }, uBillow: { value: 44 }, uSoft: { value: 16 }, uAmount: { value: 0 }, uFire: { value: 0 },
    uHue: { value: SIGNAL.clone().multiplyScalar(0.09) }, uWarm: { value: SIGNAL.clone().multiplyScalar(0.26) },
    uHalfW: { value: half }, uCurve: { value: new THREE.Vector2(C.bins - 10, (half - (half - 140 * (C.w / 560))) / Math.pow(C.h - C.bins + 10, 2)) },
  };
  const make = (inside) => {
    const uniforms = { ...shared, uOn: { value: 0 } };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: !inside,
      side: inside ? THREE.BackSide : THREE.FrontSide,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */ `
        varying vec3 vP;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vP = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        precision highp sampler3D;
        uniform sampler3D uNoise; uniform vec3 uMin, uMax, uHue, uWarm; uniform vec2 uCurve;
        uniform float uTime, uBottom, uBillow, uSoft, uAmount, uFire, uOn, uHalfW;
        varying vec3 vP;
        float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        void main() {
          if (uOn < 0.5 || uAmount < 0.002) discard;
          vec3 eye = cameraPosition;
          vec3 rd = vP - eye;
          rd /= max(length(rd), 1e-4);
          rd += (1.0 - step(1e-5, abs(rd))) * 1e-5; // never a division by zero
          vec3 t0 = (uMin - eye) / rd;
          vec3 t1 = (uMax - eye) / rd;
          vec3 ta = min(t0, t1);
          vec3 tb = max(t0, t1);
          float tn = max(max(ta.x, ta.y), max(ta.z, 0.0));
          float tf = min(min(tb.x, min(tb.y, tb.z)), tn + 2600.0);
          if (tf <= tn) discard;
          const int STEPS = 26;
          // each instant of the shutter starts its march elsewhere: sixteen coarse marches make one fine one
          float j = hash(gl_FragCoord.xy + fract(uTime * 13.7) * 61.0);
          // the underside rolls forward and the inside drifts: alive on the first frame
          vec3 d1 = vec3(0.034, 0.006, 0.010) * uTime;
          vec3 d2 = vec3(-0.018, -0.014, 0.026) * uTime;
          float through = 1.0;
          vec3 col = vec3(0.0);
          for (int i = 0; i < STEPS; i++) {
            // denser near the eye
            float tA = tn + (tf - tn) * pow(float(i) / float(STEPS), 1.6);
            float tB = tn + (tf - tn) * pow(float(i + 1) / float(STEPS), 1.6);
            float ds = tB - tA;
            vec3 p = eye + rd * mix(tA, tB, j);
            float n1 = textureLod(uNoise, p / 430.0 + d1, 0.0).r;
            float under = uBottom + uBillow * (n1 - 0.5);
            float h = clamp((p.y - under) / uSoft, 0.0, 1.0);
            // the cabin's section: the walls curve in toward the ceiling
            float wallZ = uHalfW - uCurve.y * pow(max(p.y - uCurve.x, 0.0), 2.0);
            float inCabin = 1.0 - smoothstep(wallZ - 25.0, wallZ, abs(p.z));
            if (h * inCabin > 0.0) {
              float n2 = textureLod(uNoise, p / 150.0 + d2 + 0.37, 0.0).r;
              // three to five sheets, stacked at different depths
              float sheet = 0.6 + 0.4 * sin((p.y - uBottom) * 0.13 + n1 * 5.0 + p.x * 0.0023 + uTime * 0.11);
              float rho = h * h * (3.0 - 2.0 * h) * clamp(0.32 + 1.6 * (n2 - 0.5), 0.03, 1.0) * sheet * inCabin * uAmount;
              float a = 1.0 - exp(-rho * ds * 0.03);
              float deep = clamp((p.y - under) / 38.0, 0.0, 1.0);
              float lit = mix(1.35, 0.05, sqrt(deep)) * (0.45 + 0.55 * n2);
              float warm = uFire * smoothstep(-0.2, 1.0, p.z / uHalfW) * (1.0 - deep);
              col += through * a * (uHue * lit + uWarm * warm);
              through *= 1.0 - a;
              if (through < 0.02) break;
            }
          }
          gl_FragColor = vec4(col, 1.0 - through);
        }`,
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0), mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = ORDER.smoke;
    mesh.onBeforeRender = (renderer, scene, camera) => {
      const c = camera.position;
      const mn = shared.uMin.value;
      const mx = shared.uMax.value;
      const isIn = c.y > mn.y && c.y < mx.y && c.x > mn.x && c.x < mx.x && Math.abs(c.z) < mx.z;
      uniforms.uOn.value = isIn === inside ? 1 : 0;
    };
    return mesh;
  };
  const group = new THREE.Group();
  const outer = make(false);
  const inner = make(true);
  group.add(outer, inner);
  return {
    group,
    U: shared,
    /** `bottom`: the underside's mean height; `amount`; the slab from x0 (a cut moves it) to x1. */
    set(bottom, amount, billow, soft, xMin, fire) {
      shared.uBottom.value = bottom;
      shared.uAmount.value = amount;
      shared.uBillow.value = billow;
      shared.uSoft.value = soft;
      shared.uFire.value = fire;
      const lo = bottom - billow * 0.5 - 2;
      shared.uMin.value.set(xMin, lo, -C.w / 2);
      shared.uMax.value.set(x1, C.h, C.w / 2);
      for (const m of [outer, inner]) {
        m.position.set(xMin, lo, 0);
        m.scale.set(Math.max(1, x1 - xMin), Math.max(1, C.h - lo), C.w);
      }
      group.visible = amount > 0.002;
    },
  };
}

/* ─────────────────────────────────────────────────────────── the passengers (one shell of glass, moved in its shader) */
const PAX = {
  // the trunk of figure.js, from the hips (its own frame: facing −x, up y, its left +z), and the head
  trunk: [[0.1, -4], [11, -4], [12.2, 6], [11.2, 20], [14.2, 37], [17.4, 51], [16.6, 57], [7, 61.5], [4.8, 65.5], [0.1, 65.5]],
  hipSeated: 47,
  hipStanding: 90,
  gap: 58, // cm between two people in a queue
};
const CROWD_GLSL = /* glsl */ `
  attribute vec2 aHome; attribute vec4 aPath; attribute vec3 aLen; attribute float aPart;
  uniform float uCrowd, uTotal, uPax;
  vec3 rotZ(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x * c - p.y * s, p.x * s + p.y * c, p.z); }`;
const CROWD_BODY = /* glsl */ `
  float st = smoothstep(0.0, 1.0, clamp(uCrowd / 0.15, 0.0, 1.0));
  float g = max(uCrowd - 0.15, 0.0) / 0.85 * uTotal - aPath.w;
  float L1 = aLen.x; float L2 = aLen.y; float L3 = aLen.z; float LT = L1 + L2 + L3;
  float gg = clamp(g, 0.0, LT + 80.0);
  vec2 p0 = aHome; vec2 p1 = vec2(aHome.x, aPath.x); vec2 p2 = vec2(aPath.y, aPath.x); vec2 p3 = vec2(aPath.y, aPath.z);
  vec2 at;
  if (gg < L1) at = mix(p0, p1, gg / max(L1, 1e-3));
  else if (gg < L1 + L2) at = mix(p1, p2, (gg - L1) / max(L2, 1e-3));
  else at = mix(p2, p3, clamp((gg - L1 - L2) / max(L3, 1e-3), 0.0, 1.0)) + (p3 - p2) / max(L3, 1e-3) * max(gg - LT, 0.0);
  // facing: forward (−x) in the row and the aisle, toward the door at the end
  vec2 d3 = (p3 - p2) / max(L3, 1e-3);
  vec2 face = normalize(mix(vec2(-1.0, 0.0), d3, smoothstep(L1 + L2 - 45.0, L1 + L2 + 25.0, gg)) + vec2(-1e-4, 0.0));
  float walking = step(0.0, g) * (1.0 - smoothstep(LT, LT + 40.0, gg));
  float phase = gg / 68.0 * 3.14159;
  float gone = smoothstep(LT - 10.0, LT + 60.0, gg);
  float hipY = mix(${PAX.hipSeated.toFixed(1)}, ${PAX.hipStanding.toFixed(1)}, st) + walking * 1.6 * abs(sin(phase));
  float lean = mix(-0.17, 0.0, st) + 0.07 * walking;
  float sw = 0.36 * sin(phase) * walking;
  float aL = mix(-1.5708, 0.0, st) + sw;
  float aR = mix(-1.5708, 0.0, st) - sw;
  float bL = aL + 0.55 * max(0.0, sin(phase + 1.2)) * walking;
  float bR = aR + 0.55 * max(0.0, sin(phase + 1.2 + 3.14159)) * walking;
  if (aPart < 0.5) { pos = rotZ(pos, lean); nrm = rotZ(nrm, lean); }
  else {
    bool left = aPart < 2.5;
    float a = left ? aL : aR;
    float b = left ? bL : bR;
    bool shin = (aPart > 1.5 && aPart < 2.5) || aPart > 3.5;
    if (!shin) { pos = rotZ(pos, a); nrm = rotZ(nrm, a); }
    else { pos = rotZ(pos, b) + rotZ(vec3(0.0, -44.0, 0.0), a); nrm = rotZ(nrm, b); }
  }
  pos *= 1.0 - gone;
  float cy = -face.x; float sy = face.y;
  pos = vec3(pos.x * cy + pos.z * sy, pos.y, -pos.x * sy + pos.z * cy);
  nrm = vec3(nrm.x * cy + nrm.z * sy, nrm.y, -nrm.x * sy + nrm.z * cy);
  pos += vec3(at.x, hipY, at.y);
  alive = (1.0 - gone) * uPax;`;

/** The shape of one passenger, in parts (0 trunk + head, 1 thigh L, 2 shin L, 3 thigh R, 4 shin R). */
function paxParts() {
  const trunk = new THREE.LatheGeometry(PAX.trunk.map(([r, y]) => new THREE.Vector2(r, y)), 12);
  trunk.scale(0.62, 1, 1); // its depth is x here (it faces −x): shoulders, not a skittle
  const head = new THREE.SphereGeometry(10.2, 10, 7).translate(-1, 76.5, 0);
  const thigh = (z) => new THREE.CapsuleGeometry(6.4, 31, 2, 7).translate(0, -22, z);
  const shin = (z) => new THREE.CapsuleGeometry(5, 34, 2, 7).translate(0, -22, z);
  return [[trunk, 0], [head, 0], [thigh(9), 1], [shin(9), 2], [thigh(-9), 3], [shin(-9), 4]];
}

function crowdGeometry(list) {
  const parts = paxParts();
  const pos = [];
  const nrm = [];
  const home = [];
  const path = [];
  const len = [];
  const part = [];
  const idx = [];
  for (const p of list) {
    for (const [geo, k] of parts) {
      const base = pos.length / 3;
      const P = geo.attributes.position.array;
      const N = geo.attributes.normal.array;
      for (let i = 0; i < P.length; i += 3) {
        pos.push(P[i], P[i + 1], P[i + 2]);
        nrm.push(N[i], N[i + 1], N[i + 2]);
        home.push(p.home[0], p.home[1]);
        path.push(p.aisle, p.doorX, p.exitZ, p.order);
        len.push(...p.L);
        part.push(k);
      }
      const I = geo.index.array;
      for (let i = 0; i < I.length; i++) idx.push(base + I[i]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("aHome", new THREE.Float32BufferAttribute(home, 2));
  g.setAttribute("aPath", new THREE.Float32BufferAttribute(path, 4));
  g.setAttribute("aLen", new THREE.Float32BufferAttribute(len, 3));
  g.setAttribute("aPart", new THREE.Float32BufferAttribute(part, 1));
  g.setIndex(idx);
  return g;
}

/** Where a passenger is on its way out (the same as CROWD_BODY, for the figures moved on the CPU). Writes into `out`. */
function walkOf(p, crowd, total, out) {
  const st = smooth(0, 1, crowd / 0.15);
  const g = (Math.max(crowd - 0.15, 0) / 0.85) * total - p.order;
  const [L1, L2, L3] = p.L;
  const LT = L1 + L2 + L3;
  const gg = Math.min(Math.max(g, 0), LT + 80);
  let x;
  let z;
  if (gg < L1) {
    x = p.home[0];
    z = lerp(p.home[1], p.aisle, gg / Math.max(L1, 1e-3));
  } else if (gg < L1 + L2) {
    x = lerp(p.home[0], p.doorX, (gg - L1) / Math.max(L2, 1e-3));
    z = p.aisle;
  } else {
    x = p.doorX;
    z = lerp(p.aisle, p.exitZ, clamp01((gg - L1 - L2) / Math.max(L3, 1e-3)));
  }
  const turn = smooth(L1 + L2 - 45, L1 + L2 + 25, gg);
  const dz = Math.sign(p.exitZ - p.aisle) || 1;
  let fx = lerp(-1, 0, turn);
  let fz = lerp(0, dz, turn);
  const n = Math.hypot(fx, fz) || 1;
  fx /= n;
  fz /= n;
  out.st = st;
  out.x = x;
  out.z = z;
  out.yaw = Math.atan2(fx, fz); // a figure looks toward its +z
  out.walk = g > 0 ? 1 - smooth(LT, LT + 40, gg) : 0;
  out.phase = (gg / 68) * Math.PI;
  out.gone = smooth(LT - 10, LT + 60, gg);
  return out;
}

/* ─────────────────────────────────────────────────────────── a seated figure of glass, posed on the CPU */
function poser(fig) {
  const T = { aL: V3(), aR: V3(), hL: V3(), hR: V3(), bend: V3(0, 1, 0.25), toe: V3(0, -0.15, 1) };
  let last = "";
  return function pose(st, walk = 0, phase = 0, hands = null) {
    const key = `${st.toFixed(3)}|${walk.toFixed(3)}|${phase.toFixed(2)}|${hands ? hands.key : ""}`;
    if (key === last) return;
    last = key;
    const s = Math.sin(phase) * walk;
    fig.group.position.y = lerp(PAX.hipSeated - 90, 0, st) + walk * 1.6 * Math.abs(Math.sin(phase));
    T.aL.set(lerp(9, 8.6, st), lerp(51, 8, st) + 5 * Math.max(0, s), lerp(44, 0, st) + 17 * s);
    T.aR.set(lerp(-9, -8.6, st), lerp(51, 8, st) + 5 * Math.max(0, -s), lerp(44, 0, st) - 17 * s);
    fig.leg("L", T.aL, T.bend, T.toe);
    fig.leg("R", T.aR, T.bend, T.toe);
    T.hL.set(lerp(11, 20.5, st), lerp(99, 92, st), lerp(28, 3, st) - 9 * s);
    T.hR.set(lerp(-11, -20.5, st), lerp(99, 92, st), lerp(28, 3, st) + 9 * s);
    if (hands?.L) T.hL.copy(hands.L);
    if (hands?.R) T.hR.copy(hands.R);
    fig.reach("L", T.hL);
    fig.reach("R", T.hR);
    fig.lean(lerp(-10, 0, st) + 4 * walk, 0, 0);
  };
}

/* ─────────────────────────────────────────────────────────── one cabin */
function buildLayout(U, C, wide) {
  const g = new THREE.Group();
  const half = C.w / 2;
  const rand = rng(wide ? 4417 : 7331);
  const sw = wide ? 43 : 41; // a seat's width
  const depth = wide ? 46 : 54; // its cushion, forward of the back (narrow: the 27 cm passage at the hatch)
  const cols = wide ? [YOU.z, YOU.z + sw, YOU.z + 2 * sw, -46, 0, 46, -YOU.z, -YOU.z - sw, -YOU.z - 2 * sw] : [62, 103, 144, -62, -103, -144];
  const blocks = wide ? [cols.slice(0, 3), cols.slice(3, 6), cols.slice(6, 9)] : [cols.slice(0, 3), cols.slice(3, 6)];
  const aisleZ = wide ? [110.5, -110.5] : [0];
  const aisleOf = (z) => (wide ? (z >= 0 ? aisleZ[0] : aisleZ[1]) : 0);
  const lineZ = wide ? [147, -147] : [34];
  const rowX = (i) => C.x0 + i * C.pitch;
  const xF = -150; // the forward bulkhead
  const xD2 = rowX(C.rows) + 50; // the second pair of doors, past the last row
  const extraRows = wide ? 5 : 0; // the cabin goes on aft of door 2 (wide): it fades into the dark
  const extraX = (i) => xD2 + 60 + depth + i * C.pitch;
  const xB = wide ? extraX(extraRows - 1) + 140 : xD2 + 110;
  const door = C.door;
  const HX = wide ? 0 : rowX(C.hatch.row) + 14; // narrow: the hatch's centre — at the passage behind row 7's back
  const winY = wide ? 122 : 108;
  const binTop = C.bins + (wide ? 38 : 33);
  const lipZ = half - 62;

  /* ── the section of the cabin (one side, z ≥ 0): floor, wall, the bin under the ceiling, the ceiling ── */
  const profile = wide
    ? [[half - 10, 0], [half - 1, 30], [half + 4, 80], [half + 5, 130], [half + 1, 165], [lipZ, C.bins], [lipZ, binTop], [half - 92, C.h - 14], [half - 140, C.h - 2], [0, C.h]]
    : [[half - 9, 0], [half - 1, 30], [half + 2, 80], [half + 2, 120], [half - 1, 148], [lipZ, C.bins], [lipZ, binTop], [half - 86, C.h - 10], [half - 120, C.h - 2], [0, C.h]];

  /* ── the floor: dark and matt (seen grazing it must not turn into a grey slab) ── */
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x080b0d, roughness: 0.95, metalness: 0, envMapIntensity: 0.12 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0), floorMat);
  floor.receiveShadow = true;
  floor.scale.set(xB - xF + 40, 1, 2 * (half - 6));
  floor.position.set(xF - 20, 0, 0);
  g.add(floor);

  /* ── the structure, tubes of light ── */
  const segs = [];
  const poly = (pts, o) => {
    for (let i = 0; i + 1 < pts.length; i++) segs.push({ a: pts[i], b: pts[i + 1], ...o });
  };
  const doorsAt = wide ? [0, xD2] : [0, xD2];
  const nearDoor = (x, m = 75) => doorsAt.some((d) => Math.abs(x - d) < m) || (!wide && Math.abs(x - HX) < 40);
  // frames every two rows, both sides: the profile from the floor to the ceiling's middle
  for (let x = xF + 30; x < xB - 20; x += 2 * C.pitch) {
    if (nearDoor(x, 70)) continue;
    for (const s of [1, -1]) poly(profile.map(([z, y]) => [x, y, s * z]), { r: 0.55, rep: 2 * C.pitch, k: 0.32 });
  }
  // what runs the length of the cabin: the floor's edge, the window belt, the bins' lips, the ceiling's edge
  const run = (y, z, k, r = 0.6) => {
    for (const s of [1, -1]) segs.push({ a: [xF, y, s * z], b: [xB, y, s * z], r, k });
  };
  run(0.6, half - 10, 0.3);
  run(winY - 26, half + 4, 0.22);
  run(winY + 26, half + 3, 0.22);
  run(C.bins, lipZ, 0.55, 0.7);
  run(binTop, lipZ, 0.32);
  run(C.h - 14, half - 92, 0.28);
  if (wide) {
    // the centre bins, over the middle block
    for (const s of [1, -1]) {
      segs.push({ a: [xF + 160, C.bins + 7, s * 72], b: [xB, C.bins + 7, s * 72], r: 0.7, k: 0.5 });
      segs.push({ a: [xF + 160, C.bins + 44, s * 72], b: [xB, C.bins + 44, s * 72], r: 0.6, k: 0.3 });
    }
    for (let x = xF + 160; x < xB - 20; x += 2 * C.pitch) {
      poly([[x, C.h, -60], [x, C.bins + 44, -72], [x, C.bins + 7, -72], [x, C.bins + 7, 72], [x, C.bins + 44, 72], [x, C.h, 60]], { r: 0.55, rep: 2 * C.pitch, k: 0.28 });
    }
  }
  // the forward bulkhead, its section
  for (const s of [1, -1]) poly(profile.map(([z, y]) => [xF, y, s * z]), { r: 0.7, k: 0.45 });
  segs.push({ a: [xF, 0.6, -half + 10], b: [xF, 0.6, half - 10], r: 0.7, k: 0.45 });
  // the galley, forward: a counter and its cupboards (wide: across the front; narrow: on the right)
  const galley = (z0, z1) => {
    const x0 = xF + 4;
    const x1 = xF + 76;
    const boxLines = (y0, y1) => {
      poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [x1, y0, z0]], { r: 0.6, k: 0.42 });
      poly([[x0, y1, z0], [x1, y1, z0]], { r: 0.6, k: 0.3 });
      poly([[x0, y1, z1], [x1, y1, z1]], { r: 0.6, k: 0.3 });
    };
    boxLines(0, 102);
    boxLines(142, wide ? 214 : 186);
    for (let z = z0 + 38; z < z1 - 10; z += 38) segs.push({ a: [x1, 4, z], b: [x1, 98, z], r: 0.5, k: 0.2 });
  };
  if (wide) galley(-150, 150);
  else galley(-150, -40);
  // the door frames on the walls (1L 1R, 2L 2R)
  const doorFrame = (x, s, w, h) => {
    const z = s * (half + 2);
    poly([[x - w / 2, 0, z], [x - w / 2, h - 12, z], [x - w / 2 + 12, h, z], [x + w / 2 - 12, h, z], [x + w / 2, h - 12, z], [x + w / 2, 0, z]], { r: 0.8, k: 0.6 });
  };
  for (const x of doorsAt) for (const s of [1, -1]) doorFrame(x, s, door.w + 8, door.h + 6);
  if (!wide) {
    // the overwing hatch's frame (right wall), its sill 50 cm up
    const z = -(half + 1);
    const { w, h, sill } = C.hatch;
    poly([[HX - w / 2, sill, z], [HX - w / 2, sill + h, z], [HX + w / 2, sill + h, z], [HX + w / 2, sill, z], [HX - w / 2, sill, z]], { r: 0.9, k: 0.75 });
  }
  g.add(rods(U, segs, BRAND.ink));

  /* ── the windows: rounded panes; on the left the fire behind them (signal), and a soft spill on the wall ── */
  const wins = [];
  const rowsAll = [];
  for (let i = 0; i < C.rows; i++) rowsAll.push(rowX(i));
  for (let i = 0; i < extraRows; i++) rowsAll.push(extraX(i));
  const WW = wide ? 24 : 21;
  const WH = wide ? 34 : 29;
  for (const xb of rowsAll) {
    const x = xb - 30;
    if (nearDoor(x, 85)) continue;
    for (const s of [1, -1]) {
      const z = s * (half + 3);
      wins.push({ c: [x, winY, z], u: [WW * 1.2, 0, 0], v: [0, WH * 1.2, 0], a: [s, rand(), 0, 0] });
    }
  }
  const windowU = { uFire: { value: 0 }, uHot: { value: new THREE.Vector2(rowX(2), rowX(C.rows)) }, uLight: { value: 0 }, uSig: { value: SIGNAL.clone() }, uInk: { value: INK.clone() }, uHalf: { value: new THREE.Vector3(WW / 2, WH / 2, wide ? 8 : 7) } };
  const windows = quads(U, wins, {
    pitch: C.pitch,
    uniforms: windowU,
    decl: "uniform float uFire, uLight; uniform vec2 uHot; uniform vec3 uSig, uInk, uHalf;",
    frag: /* glsl */ `
      vec2 p = (vUv - 0.5) * uHalf.xy * 2.0 * 2.4;
      float sd = rbox(p, uHalf.xy, uHalf.z);
      float core = fill(sd);
      float frame = stroke(sd + 1.6, 0.7);
      float spill = exp(-max(sd, 0.0) / 7.0) * (1.0 - core);
      float prof = 0.25 + 0.75 * smoothstep(uHot.x, uHot.y, vX);
      float breath = 0.82 + 0.18 * sin(uTime * 0.55 + vA.y * 6.2832);
      float fire = uFire * step(0.0, vA.x) * prof * breath;
      float low = 0.75 + 0.5 * clamp(0.5 - p.y / (2.0 * uHalf.y), 0.0, 1.0); // the fire is below: the pane is hotter at its foot
      col = uSig * fire * (core * 1.25 * low + spill * 0.16) + uInk * (frame * (0.09 + 0.08 * uLight) + core * 0.012);`,
  });
  windows.renderOrder = ORDER.windows;
  g.add(windows);

  /* ── the exit signs (a lit pictogram, no word: a frame, an arrow, a door), over the doors and in the aisles ── */
  const signs = [];
  const sign = (c, n, dir) => {
    // n: the way it faces (x or z axis, ±); the panel is 32 × 15 cm
    const u = Math.abs(n[0]) > 0.5 ? [0, 0, 16] : [16, 0, 0];
    signs.push({ c, u, v: [0, 7.5, 0], a: [dir, 0, 0, 0] });
  };
  for (const x of doorsAt) {
    sign([x, door.h + 18, half - 6], [0, 0, -1], 1);
    sign([x, door.h + 18, -half + 6], [0, 0, 1], -1);
  }
  if (!wide) sign([HX, C.hatch.sill + C.hatch.h + 16, -half + 8], [0, 0, 1], 1);
  for (const z of aisleZ) {
    for (let i = 3; i < C.rows; i += 5) sign([rowX(i) + 20, C.h - (wide ? 40 : 30), z], [1, 0, 0], rowX(i) < xD2 / 2 ? 1 : -1);
  }
  const signU = { uSigns: { value: 0 }, uVeille: { value: VEILLE.clone() } };
  const signMesh = quads(U, signs, {
    uniforms: signU,
    far: [900, 3200, 0.45],
    decl: "uniform float uSigns; uniform vec3 uVeille;",
    frag: /* glsl */ `
      vec2 p = (vUv - 0.5) * vec2(32.0, 15.0);
      if ((vA.x < 0.0) != !gl_FrontFacing) p.x = -p.x;
      float panel = rbox(p, vec2(15.0, 6.6), 2.0);
      float frame = stroke(panel, 0.55);
      float inside = fill(panel);
      float doorG = stroke(rbox(p - vec2(8.0, 0.0), vec2(3.2, 4.4), 0.4), 0.55);
      float arrow = min(seg(p, vec2(-11.0, 0.0), vec2(1.0, 0.0)), min(seg(p, vec2(1.0, 0.0), vec2(-2.4, 3.0)), seg(p, vec2(1.0, 0.0), vec2(-2.4, -3.0))));
      float glyph = max(doorG, fill(arrow - 0.75));
      col = uVeille * uSigns * (glyph * 1.7 + frame * 0.7 + inside * 0.06);`,
  });
  signMesh.renderOrder = ORDER.lamps;
  g.add(signMesh);

  /* ── the emergency lamps (small, high: on the bins' lips and over the doors) and the ceiling lamps (with `signs`) ── */
  const lampPos = [];
  const lampA = [];
  for (let x = xF + 120; x < xB; x += 2 * C.pitch) {
    if (nearDoor(x, 60)) continue;
    for (const s of [1, -1]) {
      lampPos.push(x, C.bins - 1.5, s * (lipZ - 2));
      lampA.push(0, 14, rand(), 0);
    }
  }
  for (const x of doorsAt) {
    for (const s of [1, -1]) {
      for (const dx of [-door.w / 2 - 6, door.w / 2 + 6]) {
        lampPos.push(x + dx, door.h + 4, s * (half - 8));
        lampA.push(0, 12, rand(), 0);
      }
    }
  }
  for (let x = xF + 200; x < xB; x += 3 * C.pitch) {
    for (const z of wide ? [-40, 40] : [0]) {
      lampPos.push(x, C.h - 2, z);
      lampA.push(1, 22, rand(), 0);
    }
  }
  const lampGeo = new THREE.BufferGeometry();
  lampGeo.setAttribute("position", new THREE.Float32BufferAttribute(lampPos, 3));
  lampGeo.setAttribute("aA", new THREE.Float32BufferAttribute(lampA, 4));
  const lampU = { uEmerg: { value: 0 }, uHigh: { value: 0 }, uScale: { value: 1000 }, uInk: { value: INK.clone() }, uAmount: { value: 1 } };
  const lamps = new THREE.Points(
    lampGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { ...lampU, uClipX: U.uClipX, uView: U.uView, uSmoke: U.uSmoke },
      vertexShader: /* glsl */ `
        attribute vec4 aA; uniform float uEmerg, uHigh, uScale; uniform vec2 uView; uniform vec3 uSmoke; uniform vec2 uSmokeX; uniform float uClipX;
        varying float vK;
        ${SPAN}
        ${SMOKE_T}
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vec4 mv = viewMatrix * w;
          float k = aA.x < 0.5 ? uEmerg : uHigh * 0.7;
          k *= smoothstep(6.0, 16.0, spanPx(w.xyz, 162.0));
          // a lamp in the smoke drowns (more than the average says: it goes first)
          k *= smokeT(w.xyz) * (1.0 - 0.55 * smoothstep(uSmoke.x - 5.0, uSmoke.x + 45.0, w.y) * step(0.0001, uSmoke.z));
          k *= step(uClipX, w.x);
          vK = k;
          gl_PointSize = clamp(uScale * aA.y / max(1.0, -mv.z), 3.0, 72.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk; uniform float uAmount; varying float vK;
        void main() {
          if (vK < 0.002) discard;
          vec2 q = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(q, q);
          if (r2 > 1.0) discard;
          float core = exp(-r2 * 46.0);
          float halo = exp(-r2 * 4.5) * 0.22;
          gl_FragColor = vec4(uInk * (core * 2.4 + halo) * vK * uAmount, 1.0);
        }`,
    }),
  );
  lamps.frustumCulled = false;
  lamps.renderOrder = ORDER.lamps;
  g.add(lamps);

  /* ── the public-address speakers in the ceiling: a round grille that breathes while it lives ── */
  const spk = [];
  for (let x = xF + 260; x < xB; x += 3 * C.pitch) {
    for (const z of wide ? [-118, 118] : [-60, 60]) spk.push({ c: [x, C.h - (wide ? 7 : 5), z], u: [10, 0, 0], v: [0, 0, 10], a: [rand(), 0, 0, 0] });
  }
  const spkU = { uPa: { value: 0 }, uInk: { value: INK.clone() } };
  const speakers = quads(U, spk, {
    pitch: 3 * C.pitch,
    uniforms: spkU,
    decl: "uniform float uPa; uniform vec3 uInk;",
    frag: /* glsl */ `
      vec2 p = (vUv - 0.5) * 20.0;
      float r = length(p);
      float rim = stroke(r - 9.0, 0.45);
      float disc = fill(r - 8.6);
      float slots = 0.5 + 0.5 * cos(r * 6.2832 / 2.1);
      slots = mix(slots, 0.5, smoothstep(0.25, 0.7, fwidth(r / 2.1)));
      float live = uPa * (0.55 + 0.45 * sin(uTime * 1.25 + vA.x * 6.2832));
      col = uInk * (rim * (0.16 + 0.3 * live) + disc * slots * 0.42 * live + disc * 0.015);`,
  });
  speakers.renderOrder = ORDER.lamps;
  g.add(speakers);

  /* ── the cabin lights: a warm wash along the ceiling's edges ── */
  const cove = quads(
    U,
    [1, -1].map((s) => ({ c: [(xF + xB) / 2, C.h - 16, s * (half - 96)], u: [(xB - xF) / 2, 0, 0], v: [0, 0, 26], a: [s, 0, 0, 0] })),
    {
      uniforms: { uLights: { value: 0 }, uInk: { value: INK.clone() } },
      decl: "uniform float uLights; uniform vec3 uInk;",
      frag: /* glsl */ `
        float v = (vUv.y - 0.5) * 2.0;
        float ends = smoothstep(0.0, 0.03, vUv.x) * smoothstep(1.0, 0.97, vUv.x);
        col = uInk * uLights * 0.15 * exp(-v * v * 3.0) * ends;`,
    },
  );
  cove.renderOrder = ORDER.lamps;
  g.add(cove);

  /* ── the seats: glass, row after row; the ones near you SOLID ── */
  const seatShape = (lean = 9) => {
    const parts = [];
    parts.push(box(depth - 4, 11, sw - 5, 3, 2).translate(-depth / 2 + 1, 47, 0)); // the cushion
    const back = box(9, 74, sw - 5, 3.5, 2);
    back.rotateZ(-lean * DEG);
    back.translate(1.5 + 37 * Math.sin(lean * DEG) * 0.5, 86, 0);
    parts.push(back);
    parts.push(box(depth - 10, 4.5, 5, 1.6, 2).translate(-depth / 2 + 3, 63, sw / 2)); // the armrest on its left
    parts.push(box(4, 41, 4, 1, 1).translate(-depth + 9, 20.5, sw / 2 - 5)); // a leg
    parts.push(box(4, 41, 4, 1, 1).translate(-6, 20.5, sw / 2 - 5));
    return parts;
  };
  const SHAPE = seatShape(wide ? 9 : 5);
  const blockEnd = (z) => box(depth - 10, 4.5, 5, 1.6, 2).translate(-depth / 2 + 3, 63, z);
  const isSolid = (row, z) => {
    if (wide) return row >= 4 && row <= 7 && (z === YOU.z || z === YOU.z + sw || z === YOU.z + 2 * sw || z === 46 || z === 0);
    return (row === C.hatch.row || row === C.hatch.row + 1) && z < 0;
  };
  const glassSeats = [];
  const solidSeats = [];
  const solidCushions = [];
  let widerSeat = null;
  const seatAt = (row, xb, z) => {
    const solidOne = isSolid(row, z);
    const blockMin = blocks.find((b) => b.includes(z)).reduce((m, c) => Math.min(m, c), 1e9);
    const parts = SHAPE.map((geo) => geo.clone().translate(xb, 0, z));
    if (z === blockMin) parts.push(blockEnd(-sw / 2).translate(xb, 0, z));
    if (!wide && row === C.hatch.row + 1 && z === -144) {
      widerSeat = { parts, xb, z };
      return;
    }
    if (solidOne) {
      solidSeats.push(...parts.filter((_, i) => i !== 0));
      solidCushions.push(parts[0]);
    } else glassSeats.push(...parts);
  };
  for (let i = 0; i < C.rows; i++) for (const z of cols) seatAt(i, rowX(i), z);
  for (let i = 0; i < extraRows; i++) for (const z of cols) seatAt(C.rows + i, extraX(i), z);
  const seatGlass = glassMat(U, { rim: 0.2, power: 2.1, edge: 0.3, pitch: C.pitch, far: [1100, 3200, 0.3], near: [35, 140] });
  const seatMesh = new THREE.Mesh(mergeGeometries(glassSeats), seatGlass);
  seatMesh.frustumCulled = false;
  asShell(seatMesh, ORDER.seats);
  g.add(seatMesh);
  const near = makePart("seats-near");
  const frameMat = solid(0x2a2e31, { rough: 0.72, env: 0.6 });
  const cushionMat = solid(0x3a3e41, { rough: 0.86, env: 0.4 });
  addMesh(near, mergeGeometries(solidSeats), frameMat, { edgeOpacity: 0.42 });
  addMesh(near, mergeGeometries(solidCushions), cushionMat, { edgeOpacity: 0.38 });
  g.add(near);
  let wider = null;
  if (widerSeat) {
    wider = makePart("seat-wider");
    addMesh(wider, mergeGeometries(widerSeat.parts.slice(1)), solid(0x2a2e31, { rough: 0.72, env: 0.6 }), { edgeOpacity: 0.42 });
    addMesh(wider, widerSeat.parts[0], solid(0x3a3e41, { rough: 0.86, env: 0.4 }), { edgeOpacity: 0.38 });
    g.add(wider);
  }

  /* ── the passengers: everyone in one shell of glass, moved in its shader; a few near you are figures ── */
  const exits = (z, xHome) => {
    const side = wide ? Math.sign(z) || 1 : 1;
    const doorX = wide && xHome > xD2 ? xD2 : 0;
    return { aisle: aisleOf(z), doorX, exitZ: side * (half + 50) };
  };
  const people = [];
  const skip = new Set();
  // the figures (posed on the CPU): wide, around you
  const figSeats = wide ? [[5, YOU.z], [5, YOU.z + sw], [6, YOU.z + sw], [6, 46], [7, YOU.z]] : [];
  for (const [r, z] of figSeats) skip.add(`${r}|${z}`);
  skip.add(`${YOU.row}|${YOU.z}`);
  const allRows = [];
  for (let i = 0; i < C.rows; i++) allRows.push([i, rowX(i)]);
  for (let i = 0; i < extraRows; i++) allRows.push([C.rows + i, extraX(i)]);
  for (const [r, xb] of allRows) {
    for (const z of cols) {
      if (!wide && r === C.hatch.row + 1 && z === -144) continue; // the seat that goes (`wider`): nobody in it
      if (wide && r === YOU.row && z === YOU.z) continue; // you
      const home = [xb - 24, z];
      const e = exits(z, home[0]);
      people.push({ row: r, z, home, ...e, fig: skip.has(`${r}|${z}`) });
    }
  }
  // the queues: per exit, the front rows first, the aisle seat first
  const queues = new Map();
  for (const p of people) {
    const key = `${p.doorX}|${p.exitZ}`;
    if (!queues.has(key)) queues.set(key, []);
    queues.get(key).push(p);
  }
  let total = 0;
  for (const q of queues.values()) {
    q.sort((a, b) => (a.doorX === 0 ? a.home[0] - b.home[0] : b.home[0] - a.home[0]) || Math.abs(a.z - a.aisle) - Math.abs(b.z - b.aisle));
    q.forEach((p, k) => {
      p.order = k * PAX.gap;
      p.L = [Math.abs(p.aisle - p.home[1]) + 0.01, Math.abs(p.home[0] - p.doorX) + 0.01, Math.abs(p.exitZ - p.aisle) + 0.01];
      total = Math.max(total, p.order + p.L[0] + p.L[1] + p.L[2] + 90);
    });
  }
  const crowdU = { uCrowd: { value: 0 }, uTotal: { value: total }, uPax: { value: 1 } };
  const crowdMat = glassMat(U, { rim: 0.26, power: 2.3, edge: 0.22, decl: CROWD_GLSL, body: CROWD_BODY, uniforms: crowdU, far: [1100, 3200, 0.3], near: [30, 120] });
  const crowd = new THREE.Mesh(crowdGeometry(people.filter((p) => !p.fig)), crowdMat);
  crowd.frustumCulled = false;
  asShell(crowd, ORDER.crowd);
  g.add(crowd);
  const figs = people
    .filter((p) => p.fig)
    .map((p) => {
      const fig = makeFigure({ shell: true, hands: "flat", order: ORDER.figures, glassK: 0.8, spec: 0, through: 0.08 });
      fig.ghost(true);
      const root = new THREE.Group();
      root.add(fig.group);
      g.add(root);
      return { p, fig, root, pose: poser(fig), w: {} };
    });

  /* ── the floor line: a tube of light along each aisle, into the doors (and the hatch); its soft pool ── */
  const linePaths = [];
  const curveIn = (x, zLine, s, ahead) => {
    // from the aisle line into the door at x on side s: ahead −1 if the door is forward of the line's run
    const z0 = zLine;
    const zz = s * (half - 6);
    return [[x - ahead * 70, z0], [x - ahead * 30, z0 + s * 12], [x - ahead * 8, z0 + s * 40], [x, z0 + s * 80], [x, zz]];
  };
  if (wide) {
    for (const [i, zl] of lineZ.entries()) {
      const s = i === 0 ? 1 : -1;
      // door 1 (forward) ← the aisle → door 2
      const fwd = curveIn(0, zl, s, -1).reverse();
      const aft = curveIn(xD2, zl, s, 1);
      linePaths.push({ pts: [...fwd, ...aft], ends: [true, true] });
      // the rows aft of door 2: their own run into it, from behind
      linePaths.push({ pts: [[xB - 60, zl], ...curveIn(xD2, zl, s, -1)], ends: [false, true] });
    }
  } else {
    const zl = lineZ[0];
    linePaths.push({ pts: [...curveIn(0, zl, 1, -1).reverse(), ...curveIn(xD2, zl, 1, 1)], ends: [true, true] });
    // the branch to the overwing hatch, through the passage
    linePaths.push({ pts: [[HX - 40, zl], [HX - 12, zl - 6], [HX, zl - 30], [HX, -half + 10]], ends: [false, true] });
  }
  const lineSegs = [];
  const haloPos = [];
  const haloA = [];
  const haloIdx = [];
  for (const { pts, ends } of linePaths) {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => V3(x, 2.2, z)), false, "centripetal", 0.5);
    const L = curve.getLength();
    const n = Math.max(8, Math.ceil(L / 7));
    const P = curve.getSpacedPoints(n);
    const dist = (s) => Math.min(ends[0] ? s : 1e5, ends[1] ? L - s : 1e5);
    for (let i = 0; i < n; i++) {
      const sa = (i / n) * L;
      const sb = ((i + 1) / n) * L;
      lineSegs.push({ a: P[i].toArray(), b: P[i + 1].toArray(), sa, sb, da: dist(sa), db: dist(sb) });
    }
    for (let i = 0; i <= n; i++) {
      const a = P[Math.max(0, i - 1)];
      const b = P[Math.min(n, i + 1)];
      const tx = b.x - a.x;
      const tz = b.z - a.z;
      const tl = Math.hypot(tx, tz) || 1;
      const nx = -tz / tl;
      const nz = tx / tl;
      const s = (i / n) * L;
      const base = haloPos.length / 3;
      for (const v of [-1, 1]) {
        haloPos.push(P[i].x + nx * v * 24, 0.45, P[i].z + nz * v * 24);
        haloA.push(v, dist(s), s, 0);
      }
      if (i < n) haloIdx.push(base, base + 1, base + 3, base, base + 3, base + 2);
    }
  }
  const lineU = { uFloor: { value: 0 }, uGlow: { value: 0 }, uVeille: { value: VEILLE.clone() }, uAmount: { value: 1 } };
  const lineGeo = rodGeometry(lineSegs.map((s) => ({ a: s.a, b: s.b, r: 1.1 })), 6, false); // end to end: an overlap would add up into false beads
  {
    // each tube vertex: its distance along the line and to the nearest exit
    const aS = [];
    const aD = [];
    for (const s of lineSegs) {
      for (let k = 0; k < 6; k++) (aS.push(s.sa), aD.push(s.da));
      for (let k = 0; k < 6; k++) (aS.push(s.sb), aD.push(s.db));
    }
    lineGeo.setAttribute("aS", new THREE.Float32BufferAttribute(aS, 1));
    lineGeo.setAttribute("aD", new THREE.Float32BufferAttribute(aD, 1));
  }
  const lineTube = new THREE.Mesh(
    lineGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { ...lineU, uTime: U.uTime, uView: U.uView, uClipX: U.uClipX },
      vertexShader: /* glsl */ `
        attribute float aR; attribute float aS; attribute float aD;
        uniform vec2 uView;
        varying float vS; varying float vD; varying float vF; varying vec3 vN; varying vec3 vV; varying float vX;
        void main() {
          vec4 w0 = modelMatrix * vec4(position, 1.0);
          float depth = max(1.0, -(viewMatrix * w0).z);
          float cmPerPx = depth / max(projectionMatrix[1][1] * uView.y * 0.5, 1.0);
          float rr = max(aR, 0.5 * 2.4 * cmPerPx);
          vec4 w = modelMatrix * vec4(position + normal * (rr - aR), 1.0);
          vec4 mv = viewMatrix * w;
          vS = aS; vD = aD; vF = sqrt(aR / rr); vX = w.x;
          vN = normalMatrix * normal; vV = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uVeille; uniform float uFloor, uGlow, uTime, uAmount, uClipX;
        varying float vS; varying float vD; varying float vF; varying vec3 vN; varying vec3 vV; varying float vX;
        void main() {
          if (vX < uClipX) discard;
          float f = clamp(abs(dot(vN / max(length(vN), 1e-5), vV / max(length(vV), 1e-5))), 0.0, 1.0);
          // the lamps of the strip, every 16 cm, melting into an even line where they would be finer than the pixels
          float bead = 0.5 + 0.5 * cos(6.2832 * vS / 16.0);
          float beads = mix(0.5 + 0.5 * smoothstep(0.25, 0.85, bead), 0.75, smoothstep(0.12, 0.4, fwidth(vS / 16.0)));
          // near an exit the rhythm changes: dashes that run into the door (34 cm, 24 cm/s: a seventh of a dash a frame at most)
          float nearExit = 1.0 - smoothstep(110.0, 210.0, vD);
          float dash = 0.5 + 0.5 * sin(6.2832 * (vD + uTime * 24.0) / 34.0);
          float runk = mix(0.3 + 0.9 * smoothstep(0.15, 0.85, dash), 0.75, smoothstep(0.12, 0.4, fwidth(vD / 34.0)));
          float elec = uFloor * mix(beads, runk * 1.25, nearExit);
          float k = (elec * 1.7 + uGlow * 0.55) * vF;
          gl_FragColor = vec4(uVeille * k * (0.55 + 0.45 * f) * uAmount, 1.0);
        }`,
    }),
  );
  lineTube.frustumCulled = false;
  lineTube.renderOrder = ORDER.line;
  g.add(lineTube);
  const haloGeo = new THREE.BufferGeometry();
  haloGeo.setAttribute("position", new THREE.Float32BufferAttribute(haloPos, 3));
  haloGeo.setAttribute("aA", new THREE.Float32BufferAttribute(haloA, 4));
  haloGeo.setIndex(haloIdx);
  const lineHalo = new THREE.Mesh(
    haloGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { ...lineU, uClipX: U.uClipX },
      vertexShader: /* glsl */ `
        attribute vec4 aA; varying vec4 vA; varying float vX;
        void main() { vec4 w = modelMatrix * vec4(position, 1.0); vA = aA; vX = w.x; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uVeille; uniform float uFloor, uGlow, uAmount, uClipX; varying vec4 vA; varying float vX;
        void main() {
          if (vX < uClipX) discard;
          float a = exp(-vA.x * vA.x * 4.0);
          float nearExit = 1.0 - smoothstep(110.0, 210.0, vA.y);
          gl_FragColor = vec4(uVeille * (a * (uFloor * (0.2 + 0.14 * nearExit) + uGlow * 0.1) + exp(-vA.x * vA.x * 1.2) * uGlow * 0.07) * uAmount, 1.0);
        }`,
    }),
  );
  lineHalo.frustumCulled = false;
  lineHalo.renderOrder = ORDER.line;
  g.add(lineHalo);

  /* ── the fire entering (breach): tongues of flame at the left wall's foot and through the floor, embers ── */
  const flames = [];
  for (let x = rowX(1); x < (wide ? xD2 + 40 : xB - 60); x += 34 + rand() * 30) {
    flames.push({ c: [x, 0, half - 14 - rand() * 18], s: [16 + rand() * 12, 38 + rand() * 40], seed: rand() });
    if (rand() < 0.45) flames.push({ c: [x + 12, 0, half - 40 - rand() * 80], s: [12 + rand() * 8, 24 + rand() * 26], seed: rand() });
  }
  const fPos = [];
  const fA = [];
  const fB = [];
  const fIdx = [];
  for (const f of flames) {
    const b = fPos.length / 3;
    for (const [s, t] of [[-1, 0], [1, 0], [1, 1], [-1, 1]]) {
      fPos.push(...f.c);
      fA.push(s, t, f.s[0], f.s[1]);
      fB.push(f.seed, 0, 0, 0);
    }
    fIdx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  const flameGeo = new THREE.BufferGeometry();
  flameGeo.setAttribute("position", new THREE.Float32BufferAttribute(fPos, 3));
  flameGeo.setAttribute("aA", new THREE.Float32BufferAttribute(fA, 4));
  flameGeo.setAttribute("aB", new THREE.Float32BufferAttribute(fB, 4));
  flameGeo.setIndex(fIdx);
  const flameU = { uBreach: { value: 0 }, uFront: { value: V3(xB, xB - rowX(1), 0) }, uSig: { value: SIGNAL.clone() }, uInk: { value: INK.clone() } };
  const flameMesh = new THREE.Mesh(
    flameGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { ...flameU, uTime: U.uTime, uClipX: U.uClipX, uSmoke: U.uSmoke },
      vertexShader: /* glsl */ `
        attribute vec4 aA; attribute vec4 aB; uniform float uBreach, uTime; uniform vec3 uFront; uniform vec3 uSmoke; uniform vec2 uSmokeX;
        varying vec2 vQ; varying float vOn; varying float vSeed; varying float vX;
        ${SMOKE_T}
        void main() {
          // the fire comes in from the back and gains the cabin, end to end
          float on = smoothstep(0.0, 160.0, uBreach * uFront.y - (uFront.x - position.x));
          vec3 toCam = cameraPosition - position; toCam.y = 0.0;
          vec3 right = normalize(vec3(-toCam.z, 0.0, toCam.x) + vec3(1e-4, 0.0, 0.0));
          float h = aA.w * (0.25 + 0.75 * on) * (0.9 + 0.1 * sin(uTime * 1.1 + aB.x * 9.0));
          vec3 p = position + right * aA.x * aA.z * 1.8 + vec3(0.0, aA.y * h * 1.15 - 4.0, 0.0);
          vQ = aA.xy; vOn = on * step(0.001, on) * smokeT(p); vSeed = aB.x; vX = position.x;
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uSig, uInk; uniform float uTime, uClipX; varying vec2 vQ; varying float vOn; varying float vSeed; varying float vX;
        void main() {
          if (vOn < 0.002 || vX < uClipX) discard;
          float y = clamp(vQ.y * 1.15 - 0.04, 0.0, 1.0);
          vec2 q = vec2(vQ.x * 1.8, y);
          float off = 0.22 * sin(y * 5.0 - uTime * 2.4 + vSeed * 20.0) * y + 0.08 * sin(y * 11.0 - uTime * 3.1 + vSeed * 7.0) * y;
          float wdt = pow(clamp(1.0 - y, 0.0, 1.0), 0.75) * (0.75 + 0.25 * sin(y * 7.0 - uTime * 1.7 + vSeed * 3.0));
          float d = abs(q.x - off) / max(wdt, 1e-3);
          float body = (1.0 - smoothstep(0.15, 1.05, d)) * (1.0 - smoothstep(0.35, 1.0, y)) * (0.65 + 0.35 * sin(y * 9.0 - uTime * 2.2 + vSeed * 13.0));
          float core = (1.0 - smoothstep(0.0, 0.5, d)) * (1.0 - smoothstep(0.02, 0.32, y));
          float halo = exp(-q.x * q.x * 0.9 - y * 3.2) * 0.3;
          gl_FragColor = vec4((uSig * (body * 0.85 + halo) + uInk * core * 0.55) * vOn, 1.0);
        }`,
    }),
  );
  flameMesh.frustumCulled = false;
  flameMesh.renderOrder = ORDER.flames;
  g.add(flameMesh);
  const embers = makeMotes({ count: 260, seed: wide ? 81 : 82, min: [rowX(1), 0, half - 150], size: [xB - rowX(1), 210, 140], psize: [0.6, 1.6], color: BRAND.signal, drift: [-6, 22, -3] });
  embers.points.renderOrder = ORDER.flames;
  g.add(embers.points);

  /* ── the door (1L) from inside: its panel of glass, the bustle (glass: the pack reads through it), the handle, the
        arming lever and the floor brackets (SOLID); it moves out, then swings forward ── */
  const doorRoot = new THREE.Group();
  doorRoot.position.set(0, 0, half);
  g.add(doorRoot);
  const slideG = new THREE.Group();
  doorRoot.add(slideG);
  const hingeG = new THREE.Group();
  hingeG.position.set(-door.w / 2 - 8, 0, 16);
  slideG.add(hingeG);
  const panel = new THREE.Group();
  panel.position.set(door.w / 2 + 8, 0, -16);
  hingeG.add(panel);
  const doorGlass = glassMat(U, { rim: 0.28, power: 2.2, edge: 0.34, far: [800, 3000, 0.4] });
  const dg = [];
  dg.push(box(door.w - 6, door.h - 6, 22, 9, 2).translate(0, door.h / 2, -11)); // the panel
  if (wide) dg.push(box(door.w - 2, 86, 20, 4, 2).translate(0, 52, -30)); // the bustle, its lower inner part
  const panelMesh = new THREE.Mesh(mergeGeometries(dg), doorGlass);
  asShell(panelMesh, ORDER.glass);
  panel.add(panelMesh);
  // its window, its handle (solid), its lever (solid)
  const paneSegs = [];
  {
    const cy = door.h - 52;
    const n = 20;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([10 * Math.cos(a), cy + 14 * Math.sin(a), -23]);
    }
    for (let i = 0; i < n; i++) paneSegs.push({ a: pts[i], b: pts[i + 1], r: 0.7, k: 0.7 });
  }
  panel.add(rods(U, paneSegs, BRAND.ink));
  const doorParts = makePart("door-solids");
  const metal = solid(0x6c6f71, { rough: 0.42, metal: 0.4, env: 1 });
  const dark = solid(0x2b2e31, { rough: 0.6, metal: 0.2 });
  addMesh(doorParts, box(5, 46, 5, 2), metal, { pos: [-door.w / 2 + 22, 112, -26], edgeOpacity: 0.5 }); // the grab handle
  addMesh(doorParts, box(6, 6, 9, 2), metal, { pos: [-door.w / 2 + 22, 136, -20], edgeOpacity: 0.5 });
  addMesh(doorParts, box(6, 6, 9, 2), metal, { pos: [-door.w / 2 + 22, 88, -20], edgeOpacity: 0.5 });
  addMesh(doorParts, box(18, 30, 3, 1.5), dark, { pos: [28, 104, -23.5], edgeOpacity: 0.5 }); // the lever's plate
  panel.add(doorParts);
  const leverPivot = new THREE.Group();
  leverPivot.position.set(28, 98, -27);
  panel.add(leverPivot);
  const leverPart = makePart("lever");
  addMesh(leverPart, cyl(3.4, 3, 0.4, 24).rotateX(Math.PI / 2), metal, { edgeOpacity: 0.5 });
  addMesh(leverPart, box(3.2, 20, 2.6, 1), solid(0x9a968e, { rough: 0.45, metal: 0.3 }), { pos: [0, 10, -1.2], edgeOpacity: 0.5 });
  addMesh(leverPart, new THREE.SphereGeometry(2.6, 20, 14), solid(0x9a968e, { rough: 0.45, metal: 0.3 }), { pos: [0, 20.5, -1.2], edges: false });
  leverPivot.add(leverPart);
  const armLamp = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.4), glow(BRAND.veille, 1.6));
  armLamp.position.set(28, 116, -25.2);
  armLamp.rotation.y = Math.PI;
  panel.add(armLamp);
  // the bustle anchor: the pack's place when the door is shut (PACK_IN_DOOR), turned toward the cabin
  const bustle = new THREE.Object3D();
  bustle.position.set(0, 15, -18);
  bustle.rotation.y = Math.PI;
  panel.add(bustle);
  // the floor brackets at the sill (fixed to the cabin)
  const sillParts = makePart("sill");
  for (const dx of [-42, 42]) {
    addMesh(sillParts, box(12, 4.5, 9, 1.2), metal, { pos: [dx, 2.25, 0], edgeOpacity: 0.55 });
    for (const dz of [-3, 3]) addMesh(sillParts, box(9, 5, 1.8, 0.5), metal, { pos: [dx, 6.5, dz], edgeOpacity: 0.5 });
  }
  sillParts.position.set(0, 0, half - 48);
  g.add(sillParts);
  const sill = anchor(g, 0, 0, half - 48);

  /* ── the other doors (1R, 2L, 2R) from inside: panels of glass, shut ── */
  const others = [];
  for (const [x, s] of [[0, -1], [xD2, 1], [xD2, -1]]) {
    others.push(box(door.w - 6, door.h - 6, 22, 9, 2).translate(x, door.h / 2, s * (half - 11)));
  }
  const otherMesh = new THREE.Mesh(mergeGeometries(others), glassMat(U, { rim: 0.22, power: 2.2, edge: 0.3, far: [800, 3000, 0.3] }));
  asShell(otherMesh, ORDER.glass);
  g.add(otherMesh);

  return {
    g, C, wide, half, rowX, xF, xB, xD2, HX, cols, sw, depth, aisleZ, lipZ, winY, rand,
    floor, windows, windowU, signU, lampU, spkU, cove, seatGlass, crowdU, crowdMat, figs, total, lineU, flameU, embers,
    doorRoot, slideG, hingeG, panel, leverPivot, armLamp, bustle, sill, near, wider, doorGlass,
    smoke: makeSmoke(U, C, xF, xB),
  };
}

/* ─────────────────────────────────────────────────────────── the cabin */
export function buildCabine() {
  const group = new THREE.Group();
  const U = { uTime: { value: 0 }, uClipX: { value: -1e6 }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) }, uSmoke: { value: V3(1e4, 1e4, 0) }, uSmokeX: { value: new THREE.Vector2(-1e6, 1e6) } };
  const layouts = [buildLayout(U, CAB.wide, true), buildLayout(U, CAB.narrow, false)];
  for (const l of layouts) {
    group.add(l.g);
    l.g.add(l.smoke.group);
  }
  const W = layouts[0];
  const N = layouts[1];
  const YOU_X = W.rowX(YOU.row);

  /* ── you: a figure of glass at your seat (wide), your head solid ── */
  const you = makeFigure({ shell: true, hands: "flat", order: ORDER.figures - 1, glassK: 1.1, spec: 0, through: 0.12, skin: 0x8d887f });
  you.ghost(true); // glass from head to hands…
  you.head.material = you.flesh; // …but your head stays solid: the one you find first
  asShell(you.head, false);
  you.flesh.transparent = true;
  const youRoot = new THREE.Group();
  youRoot.add(you.group);
  W.g.add(youRoot);
  const poseYou = poser(you);
  const youHead = anchor(you.head, 0, 0, 0);
  const youHands = anchor(you.arms.R.hand, 0, 0, 0);

  /* ── your bag: SOLID — a cabin backpack, its pocket, its straps, its handle ── */
  const BAG = { h: 42, w: 30, d: 19 };
  const bagG = new THREE.Group();
  const bagPart = makePart("bag");
  const bagBody = solid(0x3b3f42, { rough: 0.78, env: 0.55 });
  const bagPocket = solid(0x2d3134, { rough: 0.82, env: 0.5 });
  const bagStrap = solid(0x24272a, { rough: 0.7, env: 0.5 });
  const bagTrim = solid(0x6f7174, { rough: 0.45, metal: 0.3 });
  // its frame: upright, the handle on top, the pocket toward −x (its front), the straps on +x (its back)
  addMesh(bagPart, box(BAG.d, BAG.h, BAG.w, 5.5, 3), bagBody, { pos: [0, BAG.h / 2, 0], edgeOpacity: 0.45 });
  addMesh(bagPart, box(5, BAG.h * 0.48, BAG.w * 0.78, 2.5, 3), bagPocket, { pos: [-BAG.d / 2 - 1.5, BAG.h * 0.32, 0], edgeOpacity: 0.5 });
  addMesh(bagPart, box(1.2, 1.2, BAG.w * 0.7, 0.5, 1), bagTrim, { pos: [-BAG.d / 2 - 4.2, BAG.h * 0.55, 0], edgeOpacity: 0.6 }); // the zip
  for (const z of [-8, 8]) addMesh(bagPart, box(2.4, BAG.h * 0.8, 5.5, 1.1, 2), bagStrap, { pos: [BAG.d / 2 + 1.2, BAG.h * 0.5, z], edgeOpacity: 0.45 });
  const handle = new THREE.TorusGeometry(4.6, 1.1, 10, 24, Math.PI);
  addMesh(bagPart, handle, bagStrap, { pos: [0, BAG.h - 0.5, 0], rot: [0, Math.PI / 2, 0], edgeOpacity: 0.4 });
  bagPart.position.y = -BAG.h / 2; // the group's origin at the bag's centre
  bagG.add(bagPart);
  const bagShadow = makeContact({ amount: 0.55 });
  bagShadow.scale.set(BAG.d * 1.8, BAG.w * 1.6, 1);
  W.g.add(bagShadow);
  W.g.add(bagG);
  const bagAnchor = anchor(bagG, 0, 0, 0);
  const BAGP = {
    under: V3(YOU_X - 88, BAG.d / 2 + 0.5, YOU.z - 4), // lying on its back under the seat in front, its top toward you
    seat: V3(YOU_X - 52, BAG.h / 2 + 0.5, YOU.z - 26), // at your feet, on the aisle side, upright: your hand on it
  };

  /* ── the crew member at the front door: glass, a hand on the lever while it moves; the megaphone (solid) raised ── */
  const crew = makeFigure({ shell: true, hands: "flat", order: ORDER.figures, glassK: 1.1, spec: 0, through: 0.12 });
  crew.ghost(true);
  const crewRoot = new THREE.Group();
  crewRoot.add(crew.group);
  W.g.add(crewRoot);
  const poseCrew = poser(crew);
  const mega = makePart("megaphone");
  const megaMat = solid(0xb9b3a7, { rough: 0.55, env: 0.8 });
  const megaDark = solid(0x2c2f32, { rough: 0.6 });
  addMesh(mega, lathe([[0.1, 0], [5.2, 0], [5.6, 10], [12.5, 30], [12.8, 31.5], [0.1, 31.5]], 40, { bevel: 0.4 }), megaMat, { rot: [Math.PI / 2, 0, 0], edgeOpacity: 0.4 });
  addMesh(mega, box(3.2, 13, 4.2, 1.2), megaDark, { pos: [0, -8, 6], edgeOpacity: 0.4 });
  crew.group.add(mega);
  const crewHead = anchor(crew.head, 0, 0, 0);
  const megaAnchor = anchor(mega, 0, 0, 30);

  /* ── the trial: obstacles in the aisles (bags, blankets, pillows), three dolls in arms of glass ── */
  const obstacles = [];
  const oRand = rng(5521);
  const addObstacle = (L, kind, x, z) => {
    const part = makePart(`obstacle-${kind}`);
    let geo;
    let mat;
    let y;
    if (kind === 0) {
      geo = box(26 + oRand() * 10, 20, 36 + oRand() * 8, 4, 2);
      mat = solid(0x34373a, { rough: 0.78 });
      y = 10;
    } else if (kind === 1) {
      geo = box(58 + oRand() * 14, 5.5, 44 + oRand() * 10, 2.5, 2);
      mat = solid(0x6b6760, { rough: 0.95, env: 0.4 });
      y = 2.75;
    } else {
      geo = box(34, 10, 24, 5, 3);
      mat = solid(0xa59f94, { rough: 0.95, env: 0.5 });
      y = 5;
    }
    addMesh(part, geo, mat, { edgeOpacity: 0.4 });
    part.position.set(x, y, z);
    part.rotation.y = (oRand() - 0.5) * 1.4;
    part.userData.rest = y;
    L.g.add(part);
    obstacles.push({ L, part, kind, k: obstacles.filter((o) => o.L === L && o.kind === kind).length });
  };
  for (const L of layouts) {
    for (const z of L.aisleZ) {
      for (const [row, kind] of [[1, 0], [9, 0], [13, 0], [3, 1], [7, 1], [11, 1], [5, 2], [10, 2], [14, 2]]) {
        addObstacle(L, kind, L.rowX(row) - 20 + (oRand() - 0.5) * 30, z + (oRand() - 0.5) * 24);
      }
    }
  }
  const dolls = [];
  const armGlass = glassMat(U, { rim: 0.36, power: 2.2, edge: 0.34, far: [700, 2600, 0.3] });
  for (const [row, z] of [[2, 175], [9, -46], [12, -175]]) {
    const dg = new THREE.Group();
    const part = makePart("doll");
    const dollMat = solid(0xc4beb2, { rough: 0.7, env: 0.7 });
    addMesh(part, lathe([[0.1, 0], [5.2, 0], [6, 8], [4.6, 15], [3, 18], [0.1, 18]], 28, { bevel: 0.6 }), dollMat, { edgeOpacity: 0.4 });
    addMesh(part, new THREE.SphereGeometry(4.6, 24, 16), dollMat, { pos: [0, 22, 0], edges: false });
    part.rotation.z = 60 * DEG; // lying back in the arms
    dg.add(part);
    const arms = [];
    for (const s of [1, -1]) {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(3.8, 24, 4, 10).rotateZ(Math.PI / 2).translate(2, -3 + s * 4, s * 9), armGlass);
      m.rotation.y = s * 0.5;
      arms.push(m);
      dg.add(m);
    }
    asShell(arms, ORDER.dolls);
    dg.position.set(W.rowX(row) - 34, 62, z);
    W.g.add(dg);
    dolls.push(dg);
  }

  /* ── Dubai: the bins open, arms raised toward them, bags pulled out ── */
  const binDoors = [];
  for (let x = W.xF + 200; x < W.xD2 - 60; x += 2 * W.C.pitch) {
    for (const s of [1, -1]) binDoors.push({ x, s });
  }
  const binGeo = mergeGeometries(
    binDoors.map(({ x, s }) => {
      const geo = box(2 * W.C.pitch - 8, 36, 2.2, 1, 1).translate(x + W.C.pitch, 0, 0);
      const n = geo.attributes.position.count;
      geo.setAttribute("aHinge", new THREE.Float32BufferAttribute(new Array(n).fill(0).flatMap(() => [s * W.lipZ, W.C.bins + 38, s]), 3));
      return geo.translate(0, W.C.bins + 19, s * W.lipZ);
    }),
  );
  const binU = { uOpen: { value: 0 } };
  const binMat = glassMat(U, {
    rim: 0.12, power: 2.6, edge: 0.18, pitch: 2 * W.C.pitch, far: [900, 3000, 0.25], near: [80, 260], uniforms: binU,
    decl: "attribute vec3 aHinge; uniform float uOpen;",
    body: /* glsl */ `
      float a = -uOpen * 1.25 * aHinge.z; // up and out over the aisle
      vec2 r = vec2(pos.z - aHinge.x, pos.y - aHinge.y);
      float c = cos(a), s = sin(a);
      pos.z = aHinge.x + r.x * c - r.y * s;
      pos.y = aHinge.y + r.x * s + r.y * c;
      vec2 rn = vec2(nrm.z, nrm.y);
      nrm.z = rn.x * c - rn.y * s; nrm.y = rn.x * s + rn.y * c;`,
  });
  const binMesh = new THREE.Mesh(binGeo, binMat);
  binMesh.frustumCulled = false;
  asShell(binMesh, ORDER.glass + 1);
  W.g.add(binMesh);
  const reach = [];
  const binBags = [];
  for (const [row, z] of [[2, YOU.z], [4, -YOU.z], [8, YOU.z], [10, -YOU.z], [12, YOU.z], [3, 46], [9, -46]]) {
    const x = W.rowX(row) - 24;
    const s = Math.sign(z);
    const lip = Math.abs(z) > 100 ? s * (W.lipZ + 18) : s * 50;
    const top = Math.abs(z) > 100 ? W.C.bins + 12 : W.C.bins + 18;
    for (const side of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(4.2, 50, 4, 10), armGlass);
      reach.push({ m, from: V3(x + side * 2, 140, z + side * 18 - s * 4), to: V3(x + side * 10, top, lip), mid: V3() });
      W.g.add(m);
    }
    const bp = makePart("bin-bag");
    addMesh(bp, box(36, 22, 28, 4, 2), solid(0x34373a, { rough: 0.78 }), { edgeOpacity: 0.4 });
    bp.userData.home = V3(x, W.C.bins + 14, Math.abs(z) > 100 ? s * (W.lipZ + 30) : s * 40);
    bp.userData.out = V3(x, W.C.bins - 14, Math.abs(z) > 100 ? s * (W.lipZ - 22) : s * 92);
    W.g.add(bp);
    binBags.push(bp);
  }
  asShell(reach.map((r) => r.m), ORDER.dolls + 1);

  /* ── the 737's overwing hatch (SOLID, 22 kg), the figure that pulls it in, the wing outside; the panels, the
        extinguishers ── */
  const H = N.C.hatch;
  const hatchG = new THREE.Group();
  const hatchPart = makePart("hatch");
  const hatchMat = solid(0x4a4d50, { rough: 0.6, metal: 0.25 });
  const hatchIn = solid(0x2e3134, { rough: 0.7 });
  addMesh(hatchPart, box(H.w, H.h, 9, 5, 3), hatchMat, { edgeOpacity: 0.55 });
  addMesh(hatchPart, box(H.w - 10, H.h - 12, 2, 3, 2), hatchIn, { pos: [0, 0, 5], edgeOpacity: 0.45 });
  addMesh(hatchPart, box(26, 4, 4, 1.5), metal(), { pos: [0, H.h / 2 - 14, 8], edgeOpacity: 0.6 }); // the handle at its top
  addMesh(hatchPart, box(4, 12, 4, 1.5), metal(), { pos: [-H.w / 2 + 7, -6, 7.5], edgeOpacity: 0.6 });
  addMesh(hatchPart, box(4, 12, 4, 1.5), metal(), { pos: [H.w / 2 - 7, -6, 7.5], edgeOpacity: 0.6 });
  hatchG.add(hatchPart);
  N.g.add(hatchG);
  const hatchAnchor = anchor(hatchG, 0, 0, 0);
  const HATCH = { home: V3(N.HX, H.sill + H.h / 2, -N.half - 1), held: V3(N.HX, 122, -N.half + 52), out: V3(N.HX + 30, 20, -N.half - 260) };
  const helper = makeFigure({ shell: true, hands: "flat", order: ORDER.figures, glassK: 1.1, spec: 0, through: 0.12 });
  helper.ghost(true);
  const helperRoot = new THREE.Group();
  helperRoot.add(helper.group);
  helperRoot.position.set(N.HX, 0, -78);
  helperRoot.rotation.y = Math.PI; // facing −z: the hatch
  N.g.add(helperRoot);
  const poseHelper = poser(helper);
  const wingSegs = [];
  {
    const z0 = -N.half - 6;
    const LE = [[N.HX - 150, 34, z0], [N.HX - 40, 30, z0 - 420]];
    const TE = [[N.HX + 160, 38, z0], [N.HX + 150, 34, z0 - 420]];
    wingSegs.push({ a: LE[0], b: LE[1], r: 0.9, k: 0.8 }, { a: TE[0], b: TE[1], r: 0.9, k: 0.8 }, { a: LE[1], b: TE[1], r: 0.9, k: 0.6 });
    wingSegs.push({ a: [N.HX - 150, 34, z0], b: [N.HX + 160, 38, z0], r: 0.9, k: 0.5 });
  }
  const wing = rods(U, wingSegs, BRAND.ink);
  N.g.add(wing);
  // the panels lit veille ("qui brûlent moins"): their seams, walls and ceiling
  const panelSegs = [];
  for (let x = N.xF + 40; x < N.xB - 40; x += 2 * N.C.pitch) {
    for (const s of [1, -1]) {
      panelSegs.push({ a: [x, 22, s * (N.half + 1)], b: [x, 148, s * (N.half - 1)], r: 0.6, rep: 2 * N.C.pitch, k: 0.7 });
    }
    panelSegs.push({ a: [x, N.C.h - 2, -100], b: [x, N.C.h - 2, 100], r: 0.6, rep: 2 * N.C.pitch, k: 0.6 });
  }
  for (const s of [1, -1]) {
    panelSegs.push({ a: [N.xF, 22, s * (N.half - 1)], b: [N.xB, 22, s * (N.half - 1)], r: 0.6, k: 0.6 });
    panelSegs.push({ a: [N.xF, 148, s * (N.half - 1)], b: [N.xB, 148, s * (N.half - 1)], r: 0.6, k: 0.6 });
    panelSegs.push({ a: [N.xF, N.C.h - 4, s * 100], b: [N.xB, N.C.h - 4, s * 100], r: 0.6, k: 0.55 });
  }
  const panels = rods(U, panelSegs, BRAND.veille, { far: [700, 2600, 0.35] });
  N.g.add(panels);
  const extinguishers = [-62, -24].map((z) => {
    const part = makePart("extinguisher");
    const red = solid(0x8f897e, { rough: 0.5, metal: 0.2, env: 0.9 });
    addMesh(part, cyl(7, 42, 1.2, 40), red, { pos: [0, 24, 0], edgeOpacity: 0.45 });
    addMesh(part, cyl(2.4, 6, 0.4, 20), metal(), { pos: [0, 48, 0], edgeOpacity: 0.5 });
    addMesh(part, box(10, 2, 3, 0.6), metal(), { pos: [2, 52, 0], edgeOpacity: 0.5 });
    addMesh(part, box(3, 22, 12, 1), solid(0x2b2e31, { rough: 0.6 }), { pos: [-8.5, 26, 0], edgeOpacity: 0.4 }); // its bracket
    part.position.set(N.xF + 10, 50, z);
    N.g.add(part);
    return part;
  });

  /* ── anchors ── */
  const A = {
    bustle: W.bustle,
    sill: W.sill,
    lever: W.leverPivot,
    you: { head: youHead, hands: youHands },
    bag: bagAnchor,
    hatch: hatchAnchor,
    exit: anchor(W.g, 0, 0, W.half - 30),
    exitNarrow: anchor(N.g, 0, 0, N.half - 26),
    door: anchor(W.panel, 0, CAB.wide.door.h / 2, -12),
    crew: crewHead,
    megaphone: megaAnchor,
    speaker: anchor(W.g, W.xF + 260 + 3 * 3 * W.C.pitch, W.C.h - 7, 118),
    sign: anchor(W.g, 0, CAB.wide.door.h + 18, W.half - 6),
    doll: anchor(dolls[0], 0, 0, 0),
    window: anchor(W.g, W.rowX(12) - 30, W.winY, W.half + 3),
    line120: anchor(W.g, W.rowX(0) - 50, SMOKE.line, 0),
    passage: anchor(N.g, N.HX, 40, -100),
    extinguisher: anchor(extinguishers[0], 0, 30, 0),
    bins: anchor(W.g, W.rowX(8), W.C.bins + 10, W.lipZ),
    door2: anchor(W.g, W.xD2, 0, W.half - 30),
  };

  /* ── the cut's mark: a fine veille line at 1,20 m across the section ── */
  const cutLines = layouts.map((L) => {
    const r = rods(U, [{ a: [0, SMOKE.line, -L.half + 6], b: [0, SMOKE.line, L.half - 6], r: 0.35, k: 1 }], BRAND.veille, { minPx: 1.9, far: [3000, 6000, 1] });
    r.material.uniforms.uClipX = { value: -1e6 }; // drawn on the cut itself
    L.g.add(r);
    return r;
  });

  const tmp = { w: {} };
  const vA = V3();
  const vB = V3();
  const hands = { key: "", L: V3(), R: V3() };
  const yUp = V3(0, 1, 0);

  /** A point of the cabin in a figure's own frame (its root at `root`, turned by `yaw`, its group lowered by `gy`). */
  const toLocal = (out, root, yaw, gy, x, y, z) => {
    const dx = x - root.position.x;
    const dz = z - root.position.z;
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    return out.set(dx * c - dz * s, y - gy, dx * s + dz * c);
  };

  function set(p, time = 0, px = 2000) {
    U.uTime.value = time;
    const li = Math.round(p.layout) === 1 ? 1 : 0;
    layouts.forEach((l, i) => (l.g.visible = i === li));
    const L = layouts[li];
    const C = L.C;

    /* the cut: the section sweeps aft to just in front of the first row */
    const cut = clamp01(p.cut ?? 0);
    const clipX = cut > 0.001 ? lerp(L.xF - 40, L.rowX(0) - L.depth - 6, smooth(0, 1, cut)) : -1e6;
    U.uClipX.value = clipX;
    L.floor.scale.x = L.xB - Math.max(L.xF - 20, clipX) + 20;
    L.floor.position.x = Math.max(L.xF - 20, clipX);
    for (const cl of cutLines) {
      cl.visible = cut > 0.5;
      cl.position.x = clipX + 0.5;
      cl.material.uniforms.uAmount.value = smooth(0.5, 0.9, cut);
    }
    const front = cut < 0.5; // what stands in front of the first row: the door, the crew, the galley's solids

    /* the smoke */
    const sm = Math.max(0, p.smoke ?? 0);
    const bottom = C.h - clamp01(sm) * (C.h - SMOKE.line) - Math.max(0, sm - 1) * 2 * (SMOKE.line - SMOKE.low);
    const amount = clamp01(sm * 4);
    const billow = lerp(44, 4, smooth(0.4, 0.9, cut));
    const soft = lerp(16, 4, smooth(0.4, 0.9, cut));
    L.smoke.set(bottom, amount, billow, soft, Math.max(L.xF, clipX), clamp01(p.fire ?? 0));
    U.uSmoke.value.set(bottom, C.h, amount > 0.002 ? 0.011 * amount : 0);
    U.uSmokeX.value.set(Math.max(L.xF, clipX), L.xB);

    /* the light */
    const lights = clamp01(p.lights ?? 0);
    const emerg = clamp01(p.emerg ?? 0);
    L.cove.material.uniforms.uLights.value = lights;
    L.lampU.uEmerg.value = emerg;
    L.lampU.uHigh.value = clamp01(p.signs ?? 0);
    L.lampU.uScale.value = px;
    L.signU.uSigns.value = clamp01(p.signs ?? 0);
    L.spkU.uPa.value = clamp01(p.pa ?? 0);
    L.windowU.uFire.value = clamp01(p.fire ?? 0) * (1 + 0.6 * clamp01(p.breach ?? 0));
    L.windowU.uLight.value = lights;
    L.seatGlass.uniforms.uGain.value = 0.75 + 0.45 * lights + 0.15 * emerg;
    L.crowdMat.uniforms.uGain.value = 0.8 + 0.35 * lights;

    /* the floor line */
    L.lineU.uFloor.value = clamp01(p.floor ?? 0);
    L.lineU.uGlow.value = clamp01(p.glow ?? 0);

    /* the fire coming in */
    const breach = clamp01(p.breach ?? 0);
    L.flameU.uBreach.value = breach;
    L.embers.uniforms.uAmount.value = breach * 0.8;
    L.embers.update(time, px, 1 / 30);

    /* the passengers */
    const pax = clamp01(p.pax ?? 0);
    const crowdK = clamp01(p.crowd ?? 0);
    L.crowdU.uCrowd.value = crowdK;
    L.crowdU.uPax.value = pax;
    L.crowdMat.uniforms.uAmount.value = pax > 0.002 ? 1 : 0;
    for (const f of L.figs) {
      const w = walkOf(f.p, crowdK, L.total, f.w);
      f.root.position.set(w.x, 0, w.z);
      f.root.rotation.y = w.yaw;
      f.pose(w.st, w.walk, w.phase);
      f.fig.body.uniforms.uAmount.value = pax * (1 - w.gone);
      f.root.visible = pax > 0.002 && w.gone < 0.995 && (w.x > clipX || !front);
    }

    /* you, your bag (wide) */
    const youK = clamp01(p.you ?? 0);
    const stand = smooth(1, 1.45, p.you ?? 0);
    const step = smooth(1.4, 2, p.you ?? 0);
    youRoot.visible = li === 0 && youK > 0.002;
    you.body.uniforms.uAmount.value = youK;
    you.flesh.opacity = youK;
    you.flesh.depthWrite = youK > 0.6;
    youRoot.position.set(lerp(YOU_X - 24, YOU_X - 40, step), 0, lerp(YOU.z, W.aisleZ[0] + 6, step));
    youRoot.rotation.y = -Math.PI / 2;
    const bagK = smooth(0, 1, clamp01(p.bag ?? 0));
    const gy = lerp(PAX.hipSeated - 90, 0, stand);
    // the bag's way: from under the seat in front, lifted, to your hand (seated: at your feet; standing: hanging)
    vA.copy(BAGP.seat);
    if (stand > 0) {
      // standing: hanging from your right hand, beside your hip (aisle side)
      vB.set(youRoot.position.x - 4, 50, youRoot.position.z - 26);
      vA.lerp(vB, stand);
    }
    bagG.position.copy(BAGP.under).lerp(vA, bagK);
    bagG.position.y += 16 * Math.sin(Math.PI * bagK) * (1 - stand);
    bagG.rotation.set(0, 0, lerp(-Math.PI / 2, 0, smooth(0.1, 0.7, bagK)));
    bagG.visible = li === 0;
    bagShadow.position.set(bagG.position.x, 0.4, bagG.position.z);
    bagShadow.material.uniforms.uAmount.value = 0.55 * (1 - smooth(10, 40, bagG.position.y - BAG.h / 2)) * (bagK > 0.5 ? 1 : 0.85);
    bagShadow.visible = li === 0;
    if (bagK > 0.5) {
      // the right hand on the handle (figure's own frame: the root turned by −90°)
      toLocal(hands.R, youRoot, youRoot.rotation.y, gy, bagG.position.x, bagG.position.y + BAG.h / 2 + 3, bagG.position.z);
      hands.key = `${hands.R.x.toFixed(1)},${hands.R.y.toFixed(1)},${hands.R.z.toFixed(1)}`;
      poseYou(stand, 0, 0, { key: hands.key, R: hands.R });
    } else poseYou(stand, 0, 0);

    /* the crew member: 0 → 1 there (a hand on the lever while it moves) · 1 → 2 turned aft, the megaphone up */
    const crewK = Math.max(0, p.crew ?? 0);
    const turn = smooth(1, 1.35, crewK);
    crewRoot.visible = li === 0 && crewK > 0.002 && front;
    crew.body.uniforms.uAmount.value = clamp01(crewK);
    crewRoot.position.set(lerp(25, CREW.at[0] + 10, turn), 0, lerp(222, CREW.at[2], turn));
    crewRoot.rotation.y = lerp(0, Math.PI / 2, turn);
    const armK = clamp01(p.arm ?? 1);
    const onLever = clamp01(Math.min(armK, 1 - armK) * 12) * (1 - turn);
    mega.visible = turn > 0.02;
    mega.position.set(-8, lerp(118, 160, turn), lerp(18, 26, turn));
    mega.rotation.set(lerp(-1.2, 0, turn), 0, 0);
    setPartOpacity(mega, turn);
    {
      // the lever's knob, in the crew's frame
      W.leverPivot.getWorldPosition(vB);
      toLocal(hands.L, crewRoot, crewRoot.rotation.y, 0, vB.x, vB.y + 12, vB.z);
      hands.L.lerp(vA.set(20.5, 92, 3), 1 - onLever);
      hands.R.set(-6, lerp(92, 150, turn), lerp(3, 22, turn));
      if (turn < 0.02) hands.R.set(-20.5, 92, 3);
      hands.key = `${hands.L.x.toFixed(1)},${hands.L.y.toFixed(1)},${hands.L.z.toFixed(1)}|${hands.R.y.toFixed(1)}`;
      poseCrew(1, 0, 0, { key: hands.key, L: hands.L, R: hands.R });
    }

    /* the door, the lever */
    for (const l of layouts) {
      const d = clamp01(p.door ?? 0);
      const k1 = smooth(0, 0.3, d);
      const k2 = smooth(0.3, 1, d);
      l.slideG.position.set(0, 4 * k1, 14 * k1);
      l.hingeG.rotation.y = -168 * DEG * k2;
      l.panel.rotation.y = 168 * DEG * k2; // the arm turns, the panel stays parallel to the skin
      l.doorRoot.visible = front;
      l.leverPivot.rotation.z = lerp(55, -40, armK) * DEG;
      setGlow(l.armLamp.material, 1.6 * armK);
    }

    /* the trial */
    const obs = clamp01(p.obstacles ?? 0);
    for (const o of obstacles) {
      if (o.L !== L) continue;
      const u = clamp01((obs - o.kind / 3 - o.k * 0.025) / 0.14);
      o.part.visible = u > 0.002;
      o.part.position.y = o.part.userData.rest + 38 * (1 - u) * (1 - u);
      setPartOpacity(o.part, smooth(0, 0.35, u));
    }
    const dk = clamp01(p.dolls ?? 0);
    dolls.forEach((d, i) => {
      const u = smooth(i * 0.2, i * 0.2 + 0.5, dk);
      d.visible = li === 0 && u > 0.002 && d.position.x > clipX;
      d.scale.setScalar(0.6 + 0.4 * u);
    });

    /* Dubai */
    const binsK = clamp01(p.bins ?? 0);
    binU.uOpen.value = binsK;
    binMesh.visible = li === 0 && binsK > 0.01; // shut, the bins are their tubes: glass this close to the lens only blows out
    for (const r of reach) {
      r.m.visible = li === 0 && binsK > 0.01;
      vA.copy(r.from);
      vB.copy(r.from).lerp(r.to, smooth(0.1, 0.9, binsK));
      vB.y = lerp(r.from.y - 30, vB.y, smooth(0, 0.6, binsK));
      r.m.position.copy(vA).add(vB).multiplyScalar(0.5);
      r.mid.subVectors(vB, vA);
      const len = r.mid.length();
      r.m.quaternion.setFromUnitVectors(yUp, r.mid.normalize());
      r.m.scale.set(1, Math.max(0.2, len / 58), 1);
    }
    for (const b of binBags) {
      b.visible = li === 0 && binsK > 0.01;
      b.position.copy(b.userData.home).lerp(b.userData.out, smooth(0.4, 1, binsK));
    }

    /* the 737: the hatch, the seat that goes, the panels, the extinguishers */
    const hk = clamp01(p.hatch ?? 0);
    if (hk < 0.5) hatchG.position.copy(HATCH.home).lerp(HATCH.held, smooth(0, 0.5, hk));
    else hatchG.position.copy(HATCH.held).lerp(HATCH.out, smooth(0.5, 1, hk));
    // lifted over the seat backs and turned edge-on (51 cm does not go through a 27 cm passage flat), then thrown out
    const ry = 1.15 * smooth(0.1, 0.5, hk) * (1 - smooth(0.5, 0.65, hk)) + 0.6 * smooth(0.55, 1, hk);
    hatchG.rotation.set(-0.18 * smooth(0, 0.5, hk) + 2.2 * smooth(0.55, 1, hk), ry, 0);
    hatchG.visible = li === 1 && hk < 0.985;
    setPartOpacity(hatchPart, 1 - smooth(0.85, 0.98, hk));
    wing.material.uniforms.uAmount.value = smooth(0.55, 0.9, hk);
    helperRoot.visible = li === 1 && hk > 0.01;
    helper.body.uniforms.uAmount.value = smooth(0.0, 0.1, hk);
    {
      const held = hk < 0.5 ? 1 : 1 - smooth(0.55, 0.75, hk);
      // its two side grips, wherever the hatch is turned
      const ex = Math.cos(hatchG.rotation.y) * (H.w / 2 - 7);
      const ez = -Math.sin(hatchG.rotation.y) * (H.w / 2 - 7);
      toLocal(hands.L, helperRoot, helperRoot.rotation.y, 0, hatchG.position.x - ex, hatchG.position.y - 4, hatchG.position.z - ez + 6);
      toLocal(hands.R, helperRoot, helperRoot.rotation.y, 0, hatchG.position.x + ex, hatchG.position.y - 4, hatchG.position.z + ez + 6);
      vA.set(16, 118, 34);
      vB.set(-16, 118, 34);
      hands.L.lerp(vA, 1 - held);
      hands.R.lerp(vB, 1 - held);
      hands.key = `${hands.L.x.toFixed(1)},${hands.L.y.toFixed(1)},${hands.L.z.toFixed(1)}|${hands.R.x.toFixed(1)}`;
      poseHelper(1, 0, 0, { key: hands.key, L: hands.L, R: hands.R });
    }
    if (N.wider) {
      const wk = clamp01(p.wider ?? 0);
      N.wider.position.set(36 * smooth(0, 0.8, wk), 0, -10 * smooth(0, 0.8, wk));
      setPartOpacity(N.wider, 1 - smooth(0.3, 0.95, wk));
    }
    panels.material.uniforms.uAmount.value = clamp01(p.panels ?? 0);
    const ek = clamp01(p.extinguisher ?? 0);
    extinguishers.forEach((e, i) => {
      const u = smooth(i * 0.5, i * 0.5 + 0.4, ek);
      e.visible = li === 1 && u > 0.002 && front;
      setPartOpacity(e, u);
      e.position.y = 50 + 20 * (1 - u);
    });
  }
  set({ layout: 0, emerg: 1, signs: 1, pax: 1, floor: 1, smoke: 0.55, fire: 0.6, pa: 1, arm: 1, crowd: 0.1 }, 0, 2000);

  return { group, A, set };
}

/** Kit metal, a fresh material each time (a part that fades owns its materials). */
function metal() {
  return solid(0x6c6f71, { rough: 0.42, metal: 0.4, env: 1 });
}
function setGlow(mat, k) {
  if (!mat.userData.hue) return;
  mat.color.copy(mat.userData.hue).multiplyScalar(k);
}
