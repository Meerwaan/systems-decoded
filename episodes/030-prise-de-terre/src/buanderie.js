// DOSSIER 030 — the laundry room, seen like an X-ray. A back wall of glass (the plane z = 0, the room on the +z side,
// its thickness behind it), a left wall (x = ROOM.x0), the ceiling in lines; the floor is wet tiles — a grid of joints
// and a puddle that shines where something stands in it, never a slab. Against the back wall, THE WASHING MACHINE in
// its spin cycle: its casing of sheet metal (glass and edges; it is what goes LIVE, in a wave from the fault), its lid
// (le capot, metal too), its control panel and its door (plastic and glass: NEVER live), and behind the door the drum
// (solid, inox) with the laundry pressed round its wall. Inside the casing the phase wire climbs the left panel and,
// where its sleeve is worn, touches a stiffener of the sheet (FAULT). In the wall, the circuit's phase and neutral run
// from the consumer unit (a box of glass, high on the wall) to the socket (low, left of the machine). You, barefoot in
// the puddle at the machine's right, a body of glass, your right hand going to the lid; and the way the current would
// take through you. Cut away under the floor (`under`): the slab, the soil, the footings under the two walls, running
// on past the room.
// The system (model.js) hangs on `mount` (this set's origin): PLACE of plan.js is in this frame.
// Three colours. signal: the live casing, the fault, the current through you. veille: nothing here (the system is
// model.js's). ink: the rest. Centimetres, y up. Everything is a function of the state and of `time`; `update` runs
// sixteen times a frame and allocates nothing.
//
// Shell orders (see `asShell`): you 10 · the door 14 · the unit's box 18 · the casing 22 · what is in the wall 24 ·
// under the floor 26 · the walls 30. The walls go LAST: from anywhere, what is in the room shows through them.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, glass, asShell, box, cyl, lathe, anchor, lineMat, edgesOf } from "@kit/build3d.js";
import { ROOM, MACHINE, HUBLOT, DRUM, CAPOT, FAULT, PHASE, CORD_IN, SOCKET, TABLEAU, YOU, PUDDLE, CONDUIT, FOUND, LOOP, PLACE } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const WHITE = new THREE.Color(1, 0.9, 0.78);
const HOT = new THREE.Color(1, 0.62, 0.38);
const TAU = Math.PI * 2;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const lerp = (a, b, u) => a + (b - a) * u;

const ORDER = { you: 10, door: 14, board: 18, machine: 22, inwall: 24, under: 26, wall: 30 };
const LINE = { strong: { w: 2.2, a: 0.62 }, fine: { w: 1.8, a: 0.38 }, faint: { w: 1.8, a: 0.2 }, ghost: { w: 1.8, a: 0.09 } };
const [MX, , MZ] = MACHINE.at;
const HW = MACHINE.w / 2;
const HD = MACHINE.d / 2;
const LID = { y0: CAPOT.y - 2, y1: CAPOT.y }; // the lid: 2 cm of metal on top of the casing
const SPIN = TAU * 2.5; // the drum, stylised: 2.5 turns a second (the shutter blurs it)
const DMAX = 104; // the farthest point of the casing from FAULT: where the wave has covered all the metal
// FAULT and the drum, in the machine's own frame (its origin: the middle of its foot print, on the floor)
const FL = V(FAULT[0] - MX, FAULT[1], FAULT[2] - MZ);
const DL = V(DRUM.at[0] - MX, DRUM.at[1], DRUM.at[2] - MZ);
const DRUM_Z0 = DL.z - DRUM.depth / 2; // its back
const DRUM_Z1 = DL.z + DRUM.depth / 2; // its mouth, behind the door

/* ───────────────────────────── lines: families of fine segments, one mesh each ───────────────────────────── */

function makeLines() {
  const L = { strong: [], fine: [], faint: [], ghost: [] };
  const seg = (f, a, b) => L[f].push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const run = (f, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) seg(f, pts[i], pts[i + 1]);
    if (closed) seg(f, pts[pts.length - 1], pts[0]);
  };
  const rect = (f, x0, y0, x1, y1, z) => run(f, [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], true);
  /** A circle of radius `r` round c, in the plane whose normal is `axis`. */
  const ring = (f, c, r, axis = "z", n = 48) =>
    run(
      f,
      Array.from({ length: n }, (_, i) => {
        const a = r * Math.cos((i / n) * TAU);
        const b = r * Math.sin((i / n) * TAU);
        return axis === "y" ? [c[0] + a, c[1], c[2] + b] : axis === "z" ? [c[0] + a, c[1] + b, c[2]] : [c[0], c[1] + a, c[2] + b];
      }),
      true,
    );
  /** A long edge that leaves the room: drawn at `f` up to `cut` (a fraction of a → b), then fading out to nothing. */
  const fading = (a, b, cut, f = "fine") => {
    const at = (u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
    const steps = [f, "faint", "ghost"];
    seg(f, a, at(cut));
    for (let i = 1; i < 3; i++) seg(steps[i], at(cut + ((1 - cut) * (i - 1)) / 2), at(cut + ((1 - cut) * i) / 2));
  };
  /** The outline of a geometry (its crest lines if it has broken edges). */
  const edgesInto = (f, geometry) => {
    const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, 28).attributes.position;
    for (let i = 0; i < e.count; i += 2) seg(f, [e.getX(i), e.getY(i), e.getZ(i)], [e.getX(i + 1), e.getY(i + 1), e.getZ(i + 1)]);
  };
  /** Into the scene; `mats` collects [material, its opacity] for the fades. */
  const build = (parent, mats) => {
    for (const name of Object.keys(L)) {
      if (!L[name].length) continue;
      const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(L[name]), lineMat(BRAND.ink, LINE[name].w, { opacity: LINE[name].a }));
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;
      parent.add(mesh);
      mats.push([mesh.material, LINE[name].a]);
    }
  };
  return { L, seg, run, rect, ring, fading, edgesInto, build };
}

/** A set of glass pieces sharing one material: ONE shell (asShell), one mesh. */
function glassPieces(parent, material, geometries, order) {
  const meshes = geometries.map((g) => {
    const m = new THREE.Mesh(g, material);
    parent.add(m);
    return m;
  });
  asShell(meshes, order);
  return meshes;
}

/* ───────────────────────────── the casing's metal: glass that goes live in a wave ───────────────────────────── */

/**
 * The X-ray glass of the casing, in the machine's own frame (its geometry is baked there): ink, and inside the front
 * of the wave — `uFront` cm from FAULT — signal. A faint fill keeps the live panels readable as panels; a crest runs
 * at the front while it spreads. Same uniforms as the kit's `glass` where asShell needs them (uAmount, uGain, uBase, uSpec).
 */
function liveGlass({ base = 0, rim = 0.25, power = 3.5, edge = 0.1, fill = 0.03, through = 0.22 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: INK.clone() }, uHot: { value: SIGNAL.clone() }, uFault: { value: FL.clone() },
      uFront: { value: -20 }, uSoft: { value: 9 }, uBase: { value: base }, uRim: { value: rim }, uPower: { value: power },
      uEdge: { value: edge }, uFill: { value: fill }, uHotK: { value: 1.5 }, uAmount: { value: 1 }, uGain: { value: 1 }, uSpec: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vL;
      void main() {
        vL = position;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uHot, uFault; uniform float uFront, uSoft, uBase, uRim, uPower, uEdge, uFill, uHotK, uAmount, uGain, uSpec;
      varying vec3 vN; varying vec3 vV; varying vec3 vL;
      void main() {
        if (uAmount < 0.003) discard;
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float d = distance(vL, uFault);
        float w = 1.0 - smoothstep(uFront - uSoft, uFront + 0.5, d);
        float crest = exp(-pow((d - uFront) / uSoft, 2.0)) * step(0.5, uFront);
        vec3 col = mix(uColor, uHot * uHotK, w);
        float light = uBase + uFill * w + uRim * pow(g, uPower) + uEdge * smoothstep(0.6, 0.97, g) + 0.08 * crest;
        gl_FragColor = vec4(col * light * uAmount * uGain, 1.0);
      }`,
  });
  mat.userData.through = through;
  return mat;
}

/** Edge lines that take the wave too: cut into short pieces, sorted by their distance from FAULT into bands, one material a band. */
function bandedLines(parent, flat, { width = 2.2, opacity = 0.85, bands = 14 } = {}) {
  const lists = Array.from({ length: bands }, () => []);
  const a = V();
  const b = V();
  const m = V();
  for (let i = 0; i < flat.length; i += 6) {
    a.set(flat[i], flat[i + 1], flat[i + 2]);
    b.set(flat[i + 3], flat[i + 4], flat[i + 5]);
    const n = Math.max(1, Math.ceil(a.distanceTo(b) / 3.5));
    for (let k = 0; k < n; k++) {
      const p0 = a.clone().lerp(b, k / n);
      const p1 = a.clone().lerp(b, (k + 1) / n);
      m.copy(p0).add(p1).multiplyScalar(0.5);
      const band = Math.min(bands - 1, Math.floor((m.distanceTo(FL) / DMAX) * bands));
      lists[band].push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
    }
  }
  const out = [];
  lists.forEach((list, i) => {
    if (!list.length) return;
    const mat = lineMat(BRAND.ink, width, { opacity });
    const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(list), mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    parent.add(mesh);
    out.push({ mat, d: ((i + 0.5) / bands) * DMAX, opacity });
  });
  return out;
}

/* ───────────────────────────── lights that have a place ───────────────────────────── */

/** The fault: a ball of light facing the eye — a small white heart, a body, a long signal tail. `uSize` its radius, cm. */
function makeFlare(at) {
  const uniforms = { uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) }, uCenter: { value: at.clone() }, uWhite: { value: WHITE }, uHot: { value: HOT }, uSignal: { value: SIGNAL }, uSize: { value: 3 }, uAmount: { value: 0 } };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform vec3 uCenter; uniform float uSize, uAmount; uniform vec2 uView; varying vec2 vUv;
        void main() {
          vUv = position.xy;
          vec4 c = projectionMatrix * viewMatrix * modelMatrix * vec4(uCenter, 1.0);
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (uAmount > 0.001 && c.w > 1.0) {
            float s = clamp(uSize * 0.5 * uView.y * projectionMatrix[1][1] / c.w, 22.0, 300.0);
            gl_Position = vec4(c.xy / c.w + position.xy * s / (uView * 0.5), c.z / c.w, 1.0);
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uWhite, uHot, uSignal; uniform float uAmount; varying vec2 vUv;
        void main() {
          float r2 = dot(vUv, vUv);
          float edge = 1.0 - smoothstep(0.45, 1.0, sqrt(r2));
          float core = exp(-r2 / 0.006);
          float body = exp(-r2 / 0.05);
          float tail = 1.0 / (1.0 + r2 / 0.012) * edge;
          gl_FragColor = vec4((uWhite * 2.4 * core + uHot * 0.4 * body + uSignal * (0.55 * body + 0.45 * tail)) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 5; // before the shells write their depth: seen through the glass, hidden by the drum
  return { mesh, uniforms };
}

/* ───────────────────────────── the floor: tile joints, and the puddle ───────────────────────────── */

function floorMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone() }, uCell: { value: 30 }, uAmount: { value: 0.16 }, uFade: { value: 300 }, uC: { value: new THREE.Vector2(PUDDLE.at[0], PUDDLE.at[2]) }, uO: { value: new THREE.Vector2(ROOM.x0, 0) } },
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uCell, uAmount, uFade; uniform vec2 uC, uO; varying vec3 vW;
      // a joint: a pixel and a half wide; gone where the tiles get smaller than a few pixels (far, or seen grazing)
      float joints(float x) {
        float q = x / uCell;
        float fw = fwidth(q);
        float w = max(fw * 1.5, 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return (1.0 - smoothstep(0.0, w, d)) * (1.0 - smoothstep(0.08, 0.25, fw));
      }
      void main() {
        if (vW.x < uO.x || vW.z < uO.y) discard;
        vec2 p = vW.xz - uO;
        float g = max(joints(p.x), joints(p.y));
        float fade = exp(-length(vW.xz - uC) / uFade);
        gl_FragColor = vec4(uColor * g * fade * uAmount, 1.0);
      }`,
  });
}

/**
 * The puddle: additive, nothing where nothing shines. Its rim (the meniscus catches the light), the ripples the spin
 * sends from the machine's front feet, the rings the current sends from your feet (`uBody`), and what it mirrors:
 * the eye's ray, bounced on the water, followed to the casing — its vertical edges and its foot come back as streaks,
 * signal where the wave has made it live, fading with height and shaken by the ripples. Never the studio.
 */
function puddleMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uInk: { value: INK.clone() }, uHot: { value: SIGNAL.clone() }, uFault: { value: V(...FAULT) },
      uC: { value: new THREE.Vector2(PUDDLE.at[0], PUDDLE.at[2]) }, uR: { value: PUDDLE.r },
      uMeA: { value: new THREE.Vector2() }, uMeB: { value: new THREE.Vector2() },
      uFootA: { value: new THREE.Vector2(YOU.feet[0][0], YOU.feet[0][2]) }, uFootB: { value: new THREE.Vector2(YOU.feet[1][0], YOU.feet[1][2]) },
      uBox0: { value: V() }, uBox1: { value: V() },
      uT: { value: 0 }, uSpin: { value: 0 }, uFront: { value: -20 }, uBody: { value: 0 }, uAmount: { value: 1 },
    },
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uHot, uFault, uBox0, uBox1; uniform vec2 uC, uMeA, uMeB, uFootA, uFootB;
      uniform float uR, uT, uSpin, uFront, uBody, uAmount; varying vec3 vW;
      // rings leaving a point: a seventh of their spacing a frame at most; gone when they get finer than the pixel
      float ripple(float dist, float lam, float f, float decay) {
        float q = dist / lam;
        float aa = 1.0 - smoothstep(0.2, 0.5, fwidth(q));
        return pow(0.5 + 0.5 * cos(6.2832 * (q - uT * f)), 6.0) * exp(-dist / decay) * aa;
      }
      // the eye's ray bounced on the water, against one face of the casing
      void face(vec3 o, vec3 r, float t, inout float best, inout vec3 hit) {
        if (t > 0.0 && t < best) {
          vec3 h = o + r * t;
          if (h.y > 0.0 && h.y < uBox1.y && h.x > uBox0.x - 0.5 && h.x < uBox1.x + 0.5 && h.z > uBox0.z - 0.5 && h.z < uBox1.z + 0.5) { best = t; hit = h; }
        }
      }
      void main() {
        vec2 rel = vW.xz - uC;
        float r = length(rel);
        float a = atan(rel.y, rel.x);
        float er = uR * (0.8 + 0.09 * sin(3.0 * a + 1.3) + 0.06 * sin(5.0 * a + 0.4) + 0.04 * sin(9.0 * a + 2.1));
        float fw = max(fwidth(r), 1e-3);
        if (r > er + 1.0 + 2.0 * fw) discard;
        float inside = 1.0 - smoothstep(er - 0.5 - 2.0 * fw, er, r);
        float rim = exp(-pow((r - er + 0.9) / max(1.3 * fw, 0.6), 2.0));
        float rip = ripple(distance(vW.xz, uMeA), 5.0, 2.4, 40.0) + ripple(distance(vW.xz, uMeB), 5.0, 2.4, 40.0);
        float rings = ripple(distance(vW.xz, uFootA), 16.0, 1.7, 60.0) + ripple(distance(vW.xz, uFootB), 16.0, 1.7, 60.0);

        vec3 I = normalize(vW - cameraPosition);
        float above = step(I.y, -0.001); // seen from under the floor, the water mirrors nothing
        vec3 R = vec3(I.x, -I.y, I.z);
        R.xz += 0.012 * uSpin * vec2(sin(vW.x * 0.8 + uT * 6.0), sin(vW.z * 0.7 - uT * 5.0));
        float best = 1e5; vec3 hit = vec3(0.0);
        if (R.z < -1e-4) face(vW, R, (uBox1.z - vW.z) / R.z, best, hit);
        if (R.x > 1e-4 && vW.x < uBox0.x) face(vW, R, (uBox0.x - vW.x) / R.x, best, hit);
        if (R.x < -1e-4 && vW.x > uBox1.x) face(vW, R, (uBox1.x - vW.x) / R.x, best, hit);
        vec3 mirror = vec3(0.0);
        if (best < 1e4) {
          float onFront = step(abs(hit.z - uBox1.z), 0.6);
          float e = onFront > 0.5 ? min(abs(hit.x - uBox0.x), abs(hit.x - uBox1.x)) : min(abs(hit.z - uBox0.z), abs(hit.z - uBox1.z));
          float streak = 0.9 * exp(-pow(e / 1.8, 2.0)) + 0.55 * exp(-pow((hit.y - 2.5) / 1.6, 2.0)) + 0.07;
          float fade = exp(-hit.y / 24.0);
          float w = 1.0 - smoothstep(uFront - 9.0, uFront + 0.5, distance(hit, uFault));
          float fres = 0.3 + 0.7 * pow(clamp(1.0 + I.y, 0.0, 1.0), 2.0);
          mirror = mix(uInk * 0.3, uHot * 1.35, w) * streak * fade * fres;
        }
        // your legs in the water: two faint columns where the bounced ray passes close to your ankles
        float legs = 0.0;
        for (int k = 0; k < 2; k++) {
          vec2 f = k == 0 ? uFootA : uFootB;
          vec2 dxz = f - vW.xz;
          float rr = max(dot(R.xz, R.xz), 1e-5);
          float tl = max(dot(dxz, R.xz) / rr, 0.0);
          vec3 q = vW + R * tl;
          float off = length(q.xz - f);
          legs += exp(-pow(off / 5.0, 2.0)) * exp(-q.y / 30.0) * step(q.y, 60.0);
        }
        vec3 col = uInk * (0.008 + 0.3 * rim + 0.09 * rip * uSpin + 0.16 * legs * above) + mirror * above + uHot * 1.1 * rings * uBody;
        gl_FragColor = vec4(col * inside * uAmount, 1.0);
      }`,
  });
}

/** Drops hopping off the floor round the machine's front feet while it spins: each is born again every period. */
function makeDrops({ count = 46, seed = 30 } = {}) {
  const rand = rng(seed);
  const base = new Float32Array(count * 2);
  const seeds = new Float32Array(count * 4); // phase, period (s), height (cm), size (cm)
  for (let i = 0; i < count; i++) {
    const foot = i % 3; // the two front feet, and the front edge between them
    const x = foot === 2 ? MX + (rand() - 0.5) * 50 : MX + (foot ? 1 : -1) * (HW - 5) + (rand() - 0.5) * 9;
    const z = MZ + HD + 1 + rand() * 7;
    base.set([x, z], i * 2);
    seeds.set([rand(), 0.3 + rand() * 0.28, 0.7 + Math.pow(rand(), 1.5) * 2.2, 0.32 + rand() * 0.35], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aBase", new THREE.BufferAttribute(base, 2));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = { uT: { value: 0 }, uScale: { value: 1 }, uAmount: { value: 0 }, uColor: { value: INK.clone().multiplyScalar(1.5) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale, uAmount; attribute vec2 aBase; attribute vec4 aSeed; varying float vA;
        void main() {
          float u = fract(uT / aSeed.y + aSeed.x);
          vec3 p = vec3(aBase.x, 0.3 + aSeed.z * 4.0 * u * (1.0 - u), aBase.y);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aSeed.w * uScale / max(0.5, -mv.z), 1.8, 7.0);
          vA = uAmount * smoothstep(0.0, 0.1, u) * smoothstep(1.0, 0.8, u);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          gl_FragColor = vec4(uColor * pow(max(0.0, 1.0 - d), 1.5) * vA, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 4;
  return { points, uniforms };
}

/** Grains of soil, still: a cloud of faint dots in the block under the floor. */
function makeGrains({ count = 520, seed = 31, min, size } = {}) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  const sz = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos.set([min[0] + rand() * size[0], min[1] + rand() * size[1], min[2] + rand() * size[2]], i * 3);
    sz[i] = 0.5 + Math.pow(rand(), 2) * 1.1;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
  const uniforms = { uScale: { value: 1 }, uAmount: { value: 0 }, uColor: { value: INK.clone().multiplyScalar(0.5) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uScale; attribute float aSize;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(aSize * uScale / max(0.5, -mv.z), 1.8, 5.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount;
        void main() { float d = length(gl_PointCoord - 0.5) * 2.0; gl_FragColor = vec4(uColor * pow(max(0.0, 1.0 - d), 1.4) * uAmount, 1.0); }`,
    }),
  );
  points.frustumCulled = false;
  return { points, uniforms };
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════════════ */

export function buildBuanderie() {
  const group = new THREE.Group();
  group.name = "buanderie";
  const mount = new THREE.Group(); // the laundry's origin: the system hangs here, PLACE is in this frame
  group.add(mount);
  const shells = []; // [material, gain] — the glass `shell` fades
  const lineMats = []; // [material, opacity] — the lines `shell` fades

  /* ═════════════ 1 · THE FLOOR: tile joints, the puddle, the drops — and a mask: nothing under it shows ═════════════ */

  const tiles = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1200), floorMaterial());
  tiles.rotation.x = -Math.PI / 2;
  tiles.position.set(-20, 0.02, 420);
  tiles.renderOrder = 1;
  group.add(tiles);
  const puddleMat = puddleMaterial();
  const puddle = new THREE.Mesh(new THREE.PlaneGeometry(PUDDLE.r * 2.2, PUDDLE.r * 2.2), puddleMat);
  puddle.rotation.x = -Math.PI / 2;
  puddle.position.set(PUDDLE.at[0], 0.12, PUDDLE.at[2]);
  puddle.renderOrder = 3;
  group.add(puddle);
  const drops = makeDrops();
  group.add(drops.points);
  // an invisible floor that only writes depth, drawn before anything: from above the floor, what lies below it is hidden
  const mask = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshBasicMaterial({ colorWrite: false }));
  mask.rotation.x = -Math.PI / 2;
  mask.position.y = -0.6;
  mask.renderOrder = -100;
  group.add(mask);

  /* ═════════════ 2 · THE ROOM: two walls of glass, the ceiling in lines ═════════════ */

  const { x0, x1, z1, h, thick } = ROOM;
  const room = makeLines();
  const wallGlass = glass(BRAND.ink, { base: 0, rim: 0.07, power: 4, through: 0.3 });
  shells.push([wallGlass, 1]);
  glassPieces(
    group,
    wallGlass,
    [box(x1 - x0, h, thick, 0.1).translate((x0 + x1) / 2, h / 2, -thick / 2), box(thick, h, z1, 0.1).translate(x0 - thick / 2, h / 2, z1 / 2)],
    ORDER.wall,
  );
  room.rect("strong", x0, 0, x1, h, 0); // the back wall, its face on the room's side…
  room.rect("fine", x0 - thick, 0, x1, h, -thick); // …and its back
  room.run("strong", [[x0, 0, 0], [x0, 0, z1]]); // the left wall: its foot, its top, its front edge
  room.run("fine", [[x0, h, 0], [x0, h, z1]]);
  room.run("faint", [[x0, 0, z1], [x0, h, z1]]);
  room.run("faint", [[x0 - thick, 0, -thick], [x0 - thick, 0, z1], [x0 - thick, h, z1], [x0 - thick, h, -thick]]);
  room.run("faint", [[x0 - thick, h, z1], [x0, h, z1]]);
  room.seg("faint", [x0, 8, 0.3], [x1, 8, 0.3]); // the skirting
  room.seg("faint", [x0 + 0.3, 8, 0], [x0 + 0.3, 8, z1]);
  room.seg("fine", [x1, 0, 0], [x1, 0, z1 * 0.6]); // where the room goes on, to the right
  room.seg("ghost", [x1, h, 0], [x1, h, z1 * 0.6]);
  room.seg("ghost", [x0, h, z1], [x1, h, z1]); // the ceiling's front edge

  /* ═════════════ 3 · IN THE WALL: the socket's box, the circuit (phase, neutral) in its conduit ═════════════ */

  const [SX, SY] = SOCKET.at;
  const inwallGlass = glass(BRAND.ink, { base: 0.003, rim: 0.3, power: 2.4, through: 0.2 });
  shells.push([inwallGlass, 1]);
  const R = CONDUIT.run;
  const Z = CONDUIT.z;
  const [TX] = PLACE.wall[2]; // where the PE turns down to the unit: the circuit keeps to the outside of it
  const wire = (k) => [
    [TX - 1.2 - k, TABLEAU.rowY + 6, 4],
    [TX - 1.2 - k, TABLEAU.at[1] + TABLEAU.h / 2 + 6, 4],
    [TX - 1.2 - k, TABLEAU.at[1] + TABLEAU.h / 2 + 10, Z],
    [TX - 1.2 - k, R + k, Z],
    [SX + k, R + k, Z],
    [SX + k, SY + 6, Z],
    [SX + k, SY + 3.5, -1],
  ];
  const tube = (pts, r) => {
    const path = new THREE.CurvePath();
    for (let i = 0; i < pts.length - 1; i++) path.add(new THREE.LineCurve3(V(...pts[i]), V(...pts[i + 1])));
    return new THREE.TubeGeometry(path, 160, r, 12, false);
  };
  glassPieces(group, inwallGlass, [tube(wire(1.3).slice(2, 6), 2.4), cyl(3.5, 4.6, 0.3, 32).rotateX(Math.PI / 2).translate(SX, SY, -2.3)], ORDER.inwall);
  room.ring("fine", [SX, SY, -4.6], 3.5, "z", 32);
  const wireMat = lineMat(BRAND.ink, 2.0, { opacity: 0.5 });
  lineMats.push([wireMat, 0.5]);
  for (const k of [1.3, 2.6]) {
    const l = new Line2(new LineGeometry().setPositions(wire(k).flat()), wireMat);
    l.frustumCulled = false;
    l.renderOrder = 3;
    group.add(l);
  }

  /* ═════════════ 4 · THE CONSUMER UNIT'S BOX: glass on the wall (its rail and what is on it are model.js's) ═════════════ */

  const [BX, BY] = TABLEAU.at;
  const boardGlass = glass(BRAND.ink, { base: 0.005, rim: 0.34, power: 2.6, edge: 0.25, through: 0.25 });
  shells.push([boardGlass, 1]);
  const boardGeo = box(TABLEAU.w, TABLEAU.h, TABLEAU.d, 0.8).translate(BX, BY, TABLEAU.d / 2);
  glassPieces(group, boardGlass, [boardGeo], ORDER.board);
  room.edgesInto("strong", boardGeo);
  room.rect("fine", BX - TABLEAU.w / 2 + 1.6, BY - TABLEAU.h / 2 + 1.6, BX + TABLEAU.w / 2 - 1.6, BY + TABLEAU.h / 2 - 1.6, TABLEAU.d + 0.1); // its cover
  room.rect("fine", BX - TABLEAU.w / 2 + 3.5, TABLEAU.rowY - 6.5, BX + TABLEAU.w / 2 - 3.5, TABLEAU.rowY + 6.5, TABLEAU.d + 0.1); // the window the row shows through
  room.build(group, lineMats);

  /* ═════════════ 5 · THE WASHING MACHINE ═════════════ */

  const machine = new THREE.Group();
  machine.name = "machine";
  machine.position.set(MX, 0, MZ);
  group.add(machine);
  // its metal: casing, lid, the stiffener the phase wire touches — one live shell, geometry baked in the machine's frame
  const metal = liveGlass();
  const casingGeo = box(MACHINE.w, LID.y0 - 2, MACHINE.d, 2.2).translate(0, (LID.y0 + 2) / 2, 0);
  const lidGeo = box(MACHINE.w + 0.6, LID.y1 - LID.y0, MACHINE.d + 0.8, 0.7).translate(0, (LID.y0 + LID.y1) / 2, 0.2);
  const stiffGeo = box(1.2, 62, 3.2, 0.3).translate(-HW + 1.4, 40, FL.z);
  glassPieces(machine, metal, [casingGeo, lidGeo, stiffGeo], ORDER.machine);
  // its edges, and the lines drawn on its front: they take the wave too
  const mLines = makeLines();
  mLines.edgesInto("strong", casingGeo);
  mLines.edgesInto("strong", lidGeo);
  mLines.edgesInto("fine", stiffGeo);
  const F = HD + 0.05; // the front face
  mLines.seg("fine", [-HW + 1, 71, F], [HW - 1, 71, F]); // the control panel's seam
  mLines.rect("fine", -27, 73, -9, 81, F); // the detergent drawer
  mLines.seg("fine", [-25, 74.5, F + 0.1], [-11, 74.5, F + 0.1]);
  mLines.ring("fine", [HUBLOT.at[0] - MX, HUBLOT.at[1], F], HUBLOT.r + 5.5, "z", 56); // the door's opening in the sheet
  mLines.rect("fine", 15, 3.5, 26, 12.5, F); // the filter's flap
  mLines.seg("faint", [-HW + 1, 3, F], [HW - 1, 3, F]);
  const bandsStrong = bandedLines(machine, mLines.L.strong, { width: 2.3, opacity: 0.85 });
  const bandsFine = bandedLines(machine, [...mLines.L.fine, ...mLines.L.faint], { width: 1.9, opacity: 0.5 });
  const bands = [...bandsStrong, ...bandsFine];

  // feet (adjustable, standing in the water), the cord's grommet at the back
  const steel = solid(0x5d646b, { rough: 0.45, metal: 0.4 });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const foot = new THREE.Mesh(cyl(2.2, 2.6, 0.35, 24), steel);
    foot.position.set(sx * (HW - 5), 1.3, sz * (HD - 5));
    machine.add(foot);
  }
  const grommet = new THREE.Mesh(cyl(1.4, 2, 0.3, 20).rotateX(Math.PI / 2), solid(0x30363b, { rough: 0.6 }));
  grommet.position.set(CORD_IN[0] - MX, CORD_IN[1], CORD_IN[2] - MZ);
  machine.add(grommet);

  // the control panel (plastic: never live) — a knob, a small window of light, the programme's lights; `trip` puts them out
  const plastic = solid(0x7d858b, { rough: 0.42, env: 0.8 });
  const knob = new THREE.Mesh(cyl(3.4, 2.2, 0.35, 40).rotateX(Math.PI / 2), plastic);
  knob.position.set(17, 77, F + 1.1);
  knob.add(edgesOf(knob.geometry, { color: 0x1d2226, width: 1.8, opacity: 0.8, threshold: 40 }));
  machine.add(knob);
  const screenMat = glow(BRAND.ink, 0.55);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.4), screenMat);
  screen.position.set(1, 77.5, F + 0.08);
  machine.add(screen);
  const ledMats = [0, 1, 2, 3].map(() => glow(BRAND.ink, 0.25));
  ledMats.forEach((m, i) => {
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), m);
    led.position.set(-3.5 + i * 2.4, 73.6, F + 0.1);
    machine.add(led);
  });
  const notch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 0.3), glow(BRAND.ink, 0.6));
  notch.position.set(17 + 1.1, 77 + 1.1, F + 2.25);
  notch.rotation.z = -0.8;
  machine.add(notch);

  // the door: a ring of plastic, a bowl of glass that bulges into the drum, its hinge, its handle — never live
  const ring = new THREE.Mesh(
    lathe([[16, 0], [22, 0], [22.3, 1.8], [21, 3.4], [17.6, 3.7], [16, 2.5], [16, 0]], 96, { bevel: 0.25 }).rotateX(Math.PI / 2),
    plastic,
  );
  ring.position.set(HUBLOT.at[0] - MX, HUBLOT.at[1], HD);
  ring.add(edgesOf(ring.geometry, { color: 0x1d2226, width: 1.8, opacity: 0.75, threshold: 35 }));
  machine.add(ring);
  const doorGlass = glass(BRAND.ink, { base: 0, rim: 0.28, power: 2.2, edge: 0.45, spec: 0.6, through: 0.15 });
  shells.push([doorGlass, 1]);
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(22, 64, 18, 0, TAU, 0, 0.82).rotateX(-Math.PI / 2), doorGlass);
  bowl.position.set(HUBLOT.at[0] - MX, HUBLOT.at[1], HD + 3.4 + 22 * Math.cos(0.82));
  asShell([bowl], ORDER.door);
  machine.add(bowl);
  const hinge = new THREE.Mesh(box(2.4, 9, 3, 0.4), plastic);
  hinge.position.set(-23.6, HUBLOT.at[1], HD + 1.6);
  const handle = new THREE.Mesh(box(3, 10, 3.2, 0.6), plastic);
  handle.position.set(21.5, HUBLOT.at[1], HD + 3.2);
  machine.add(hinge, handle);

  // the drum (inox: nothing on it that turns but the laundry), its mouth, its three lifters
  const drum = new THREE.Group();
  drum.position.copy(DL);
  machine.add(drum);
  const inox = solid(0x8a9198, { rough: 0.4, metal: 0.45, double: true });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(DRUM.r, DRUM.r, DRUM.depth, 72, 1, true).rotateX(Math.PI / 2), inox);
  const back = new THREE.Mesh(new THREE.CircleGeometry(DRUM.r, 72), solid(0x6f767d, { rough: 0.45, metal: 0.4 }));
  back.position.z = -DRUM.depth / 2 + 0.2;
  const hub = new THREE.Mesh(cyl(5, 1.6, 0.4, 40).rotateX(Math.PI / 2), solid(0x969ca2, { rough: 0.4, metal: 0.4 }));
  hub.position.z = -DRUM.depth / 2 + 1;
  const mouth = new THREE.Mesh(
    lathe([[18.5, 0], [DRUM.r + 0.6, 0], [DRUM.r + 0.6, 2.2], [18.5, 2.2], [18.5, 0]], 96, { bevel: 0.3 }).rotateX(Math.PI / 2),
    solid(0xadb3b9, { rough: 0.35, metal: 0.4 }),
  );
  mouth.position.z = DRUM.depth / 2 - 2.2;
  mouth.add(edgesOf(mouth.geometry, { color: 0x1d2226, width: 1.8, opacity: 0.6, threshold: 35 }));
  drum.add(wall, back, hub, mouth);
  const lifterMat = solid(0x9ea4aa, { rough: 0.4, metal: 0.4 });
  for (const a of [Math.PI / 2, Math.PI / 2 + TAU / 3, Math.PI / 2 - TAU / 3]) {
    const lifter = new THREE.Mesh(box(4.4, 3.2, DRUM.depth - 9, 0.9), lifterMat);
    lifter.position.set(Math.cos(a) * (DRUM.r - 2), Math.sin(a) * (DRUM.r - 2), -2);
    lifter.rotation.z = a + Math.PI / 2;
    drum.add(lifter);
  }
  // the laundry: in the spin, pressed round the wall and turning with it; as the drum stops, it falls into a heap
  const cloth = solid(0xb7b0a3, { rough: 0.95, env: 0.5 });
  const lRand = rng(32);
  const laundry = Array.from({ length: 14 }, (_, i) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 14), cloth);
    drum.add(mesh);
    const ringA = (i / 14) * TAU + (lRand() - 0.5) * 0.25;
    const z = -DRUM.depth / 2 + 6 + lRand() * (DRUM.depth - 13);
    const heapA = -Math.PI / 2 + (lRand() - 0.5) * 1.9;
    const heapR = 9 + lRand() * 9;
    return {
      mesh, ringA, z,
      ringR: DRUM.r - 3.6 - lRand() * 1.2,
      ringS: [2.6 + lRand() * 1.4, 6 + lRand() * 3.5, 5 + lRand() * 3],
      heap: V(Math.cos(heapA) * heapR, Math.sin(heapA) * heapR - 1.5, z * 0.85),
      heapS: (() => { const q = 5 + lRand() * 2.2; return [q, q, q * (0.85 + lRand() * 0.3)]; })(),
    };
  });

  // the phase wire, up the left panel; at FAULT its sleeve is worn through and the bare copper touches the stiffener
  const phasePts = PHASE.map((p) => V(p[0] - MX, p[1], p[2] - MZ));
  const phaseCurve = new THREE.CatmullRomCurve3(phasePts, false, "centripetal");
  const phase = new THREE.Mesh(new THREE.TubeGeometry(phaseCurve, 90, 0.55, 10, false), solid(0x6c747b, { rough: 0.55 }));
  machine.add(phase);
  // the bare part: the stretch of the curve closest to FAULT
  let tF = 0;
  let dBest = 1e9;
  for (let i = 0; i <= 400; i++) {
    const d = phaseCurve.getPoint(i / 400).distanceTo(FL);
    if (d < dBest) [dBest, tF] = [d, i / 400];
  }
  const barePts = [-0.018, -0.009, 0, 0.009, 0.018].map((dt) => phaseCurve.getPoint(clamp01(tF + dt)));
  const bare = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(barePts), 12, 0.6, 10, false), solid(0x9b9284, { rough: 0.6, metal: 0.2, env: 0.4 }));
  machine.add(bare);
  const flare = makeFlare(FL);
  machine.add(flare.mesh);

  /* ═════════════ 6 · YOU: barefoot in the puddle, a body of glass, your right hand going to the lid ═════════════ */

  const you = makeFigure({ shell: true, hands: "real", order: ORDER.you, glassK: 1.15, through: 0.2 });
  you.group.name = "buanderie-you";
  you.group.position.set(...YOU.at);
  const YAW = -Math.PI / 2; // facing −x: your own +z is the room's −x, your left (+x) the room's +z
  you.group.rotation.y = YAW;
  group.add(you.group);
  shells.push([you.body, 1]);
  /** A point of the room in your own frame. */
  const toYou = (w, out = V()) => out.set(w[2] - YOU.at[2], w[1], YOU.at[0] - w[0]);
  const footR = toYou(YOU.feet[0]);
  const footL = toYou(YOU.feet[1]);
  you.leg("R", V(footR.x, 8, footR.z - 4.5));
  you.leg("L", V(footL.x, 8, footL.z - 4.5), V(0.1, 0, 1));
  // the hand: where it hangs; where it hovers, the palm 3 cm above the lid; where it lands (CAPOT.touch)
  const DIR = V(0, -0.15, 1).normalize(); // fingers toward the machine, a little down
  const TOUCH = toYou(CAPOT.touch);
  const PALM_Y = 1.45; // from the palm's middle to its skin
  const wristFor = (palm, out) => out.copy(palm).addScaledVector(DIR, -5.5);
  const W_REST = V(-21, 92, 4);
  const W_HOVER = wristFor(V(TOUCH.x, CAPOT.y + 3 + PALM_Y, TOUCH.z - 4), V());
  const W_TOUCH = wristFor(V(TOUCH.x, CAPOT.y + PALM_Y + 0.15, TOUCH.z), V());
  const DIR_REST = V(0.05, -1, 0.15).normalize();
  const PALM_REST = V(1, 0, 0);
  const PALM_DOWN = V(0, -1, 0);
  const wrist = V();
  const dir = V();
  const palm = V();
  const BEND = V(-0.6, -1, -0.2);
  // the way the current would take through you, then takes: hand → arm → trunk → each leg → the soles
  const pathMat = lineMat(BRAND.signal, 2.8, { opacity: 0, dashed: true, dashSize: 1.6, gapSize: 2.2, hdr: 1.7 });
  const headMat = lineMat(BRAND.signal, 3.6, { opacity: 0, dashed: true, dashSize: 4.5, gapSize: 17, hdr: 2.4 });
  for (const m of [pathMat, headMat]) m.depthTest = false; // drawn through the glass of the body
  const paths = [0, 1, 2, 3].map((i) => {
    const l = new Line2(new LineGeometry().setPositions(new Array(30).fill(0)), i < 2 ? pathMat : headMat);
    l.frustumCulled = false;
    l.renderOrder = 6;
    you.group.add(l);
    return l;
  });
  const pathPts = [new Array(30).fill(0), new Array(30).fill(0)];
  const pTmp = V();
  const chest = V();
  const sole = V(0, -6.5, 5);
  let pathKey = -1;
  const layPath = () => {
    const arm = you.arms.R;
    chest.copy(arm.sh).add(you.arms.L.sh).multiplyScalar(0.5);
    chest.y -= 14;
    for (const [k, s] of [[0, "R"], [1, "L"]]) {
      const leg = you.legs[s];
      const pts = pathPts[k];
      const put = (i, p) => {
        pts[i * 3] = p.x;
        pts[i * 3 + 1] = p.y;
        pts[i * 3 + 2] = p.z;
      };
      put(0, pTmp.copy(arm.at).addScaledVector(arm.dir ?? DIR, 5.5).addScaledVector(PALM_DOWN, PALM_Y * 0.5));
      put(1, arm.at);
      put(2, arm.elbow);
      put(3, arm.sh);
      put(4, chest);
      put(5, pTmp.set(0, you.HIP + 4, 0));
      put(6, leg.hip);
      put(7, leg.knee);
      put(8, leg.ankle);
      put(9, pTmp.copy(leg.ankle).add(sole));
      for (const l of [paths[k], paths[k + 2]]) {
        l.geometry.setPositions(pts);
        l.computeLineDistances();
      }
    }
  };

  /* ═════════════ 7 · UNDER THE FLOOR: the slab, the soil, the footings running on past the room ═════════════ */

  const below = new THREE.Group();
  below.name = "under";
  group.add(below);
  const underGlass = glass(BRAND.ink, { base: 0.003, rim: 0.22, power: 3, edge: 0.2, through: 0.12 }); // seen grazing from inside the soil, a stronger rim is a grey haze
  const slabGlass = glass(BRAND.ink, { base: 0, rim: 0.05, power: 5, through: 0.08 });
  const FT = FOUND.footing;
  const FW = FT.w / 2;
  const FZ = FOUND.z;
  const FX = LOOP.x0; // the left footing's axis
  const RUN = 420; // how far the footings run on past the room before they fade into the night
  const backFooting = box(x1 + RUN - (FX - FW), FT.top - FT.bottom, FT.w, 0.4).translate((FX - FW + x1 + RUN) / 2, (FT.top + FT.bottom) / 2, FZ);
  const leftFooting = box(FT.w, FT.top - FT.bottom, z1 + RUN - (FZ + FW), 0.4).translate(FX, (FT.top + FT.bottom) / 2, (FZ + FW + z1 + RUN) / 2);
  glassPieces(below, underGlass, [backFooting, leftFooting], ORDER.under);
  const slabGeo = box(x1 - (x0 - thick), FOUND.slab, z1 + thick, 0.2).translate((x0 - thick + x1) / 2, -FOUND.slab / 2, (z1 - thick) / 2);
  glassPieces(below, slabGlass, [slabGeo], ORDER.under + 1);
  const ul = makeLines();
  const sl = FOUND.slab;
  ul.rect("fine", x0 - thick, -sl, x1, 0, z1); // the slab's cut edges, toward the camera
  ul.run("fine", [[x0 - thick, -sl, -thick], [x0 - thick, -sl, z1]]);
  ul.run("faint", [[x1, -sl, -thick], [x1, -sl, z1]]);
  ul.seg("faint", [x0 - thick, -sl, -thick], [x1, -sl, -thick]);
  // the footings' long edges, drawn strong under the room, fading as they leave it
  const cutX = (x1 - (FX - FW)) / (x1 + RUN - (FX - FW));
  const cutZ = (z1 - (FZ + FW)) / (z1 + RUN - (FZ + FW));
  for (const y of [FT.top, FT.bottom]) {
    for (const z of [FZ - FW, FZ + FW]) ul.fading([FX - FW, y, z], [x1 + RUN, y, z], cutX, "strong");
    for (const x of [FX - FW, FX + FW]) ul.fading([x, y, FZ + FW], [x, y, z1 + RUN], cutZ, "strong");
  }
  for (const [x, z] of [[FX - FW, FZ - FW], [FX - FW, FZ + FW], [FX + FW, FZ + FW]]) ul.seg("fine", [x, FT.top, z], [x, FT.bottom, z]); // the corner
  ul.seg("fine", [FX - FW, FT.top, FZ - FW], [FX + FW, FT.top, FZ - FW]);
  ul.seg("fine", [FX - FW, FT.bottom, FZ - FW], [FX - FW, FT.bottom, FZ + FW]);
  // the trench the loop lies in: its floor, a little wider than the footing
  const TB = FT.bottom - 3;
  for (const z of [FZ - FW - 8, FZ + FW + 8]) ul.fading([FX - FW - 8, TB, z], [x1 + RUN, TB, z], cutX, "faint");
  for (const x of [FX - FW - 8, FX + FW + 8]) ul.fading([x, TB, FZ - FW - 8], [x, TB, z1 + RUN], cutZ, "faint");
  // the soil: a block cut away under the room — its strata on the two faces the camera sees, its grains
  const SOIL = { x0: -380, x1: 260, z0: -120, z1: 360, y0: -132 };
  const wavy = (f, y, along, a, b, fixed) => {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const u = lerp(a, b, i / 40);
      const yy = y + 2.6 * Math.sin(u * 0.021 + y) + 1.4 * Math.sin(u * 0.057 + 2 * y);
      pts.push(along === "x" ? [u, yy, fixed] : [fixed, yy, u]);
    }
    ul.run(f, pts);
  };
  for (const y of [-40, -74, -112]) {
    wavy("faint", y, "x", SOIL.x0, SOIL.x1, SOIL.z1);
    wavy("faint", y, "z", SOIL.z0, SOIL.z1, SOIL.x0);
  }
  ul.run("faint", [[SOIL.x0, 0, SOIL.z1], [SOIL.x0, SOIL.y0, SOIL.z1], [SOIL.x1, SOIL.y0, SOIL.z1], [SOIL.x1, 0, SOIL.z1]]);
  ul.run("faint", [[SOIL.x0, SOIL.y0, SOIL.z1], [SOIL.x0, SOIL.y0, SOIL.z0], [SOIL.x0, 0, SOIL.z0]]);
  const underLines = [];
  ul.build(below, underLines);
  const grains = makeGrains({ min: [SOIL.x0, SOIL.y0, SOIL.z0], size: [SOIL.x1 - SOIL.x0, -SOIL.y0 - FOUND.slab - 2, SOIL.z1 - SOIL.z0] });
  below.add(grains.points);

  /* ═════════════ anchors ═════════════ */

  const A = {
    machine: anchor(machine, 0, CAPOT.y, 0),
    capot: anchor(machine, CAPOT.touch[0] - MX, CAPOT.touch[1], CAPOT.touch[2] - MZ),
    hublot: anchor(machine, HUBLOT.at[0] - MX, HUBLOT.at[1], HUBLOT.at[2] - MZ),
    fault: anchor(machine, FL.x, FL.y, FL.z),
    drum: anchor(machine, DL.x, DL.y, DL.z),
    you: anchor(you.head, 0, 0, 0),
    hand: anchor(you.arms.R.hand, 0, 0, 5.5),
    feet: anchor(group, (YOU.feet[0][0] + YOU.feet[1][0]) / 2, 3, (YOU.feet[0][2] + YOU.feet[1][2]) / 2),
    socket: anchor(group, ...SOCKET.at),
    tableau: anchor(group, ...TABLEAU.at),
    under: anchor(group, ...LOOP.corner),
    floor: anchor(group, PUDDLE.at[0], 0, PUDDLE.at[2]),
  };

  const pos = V();
  const ringP = V();
  const tilesU = tiles.material.uniforms;
  const pu = puddleMat.uniforms;

  return {
    group, mount, A,
    /** Every frame, sixteen times a frame: P is plain numbers (docs/030-decors.md, « src/buanderie.js »). */
    update(P, time, px = 1) {
      const shell = clamp01(P.shell);
      const s = clamp01(P.spin);
      const live = clamp01(P.live);
      const fault = clamp01(P.fault);
      const trip = clamp01(P.trip);
      const u = clamp01(P.under);
      const body = clamp01(P.body);

      /* the room */
      for (const [m, g] of shells) m.uniforms.uAmount.value = g * shell;
      for (const [m, a] of lineMats) m.opacity = a * shell;
      tilesU.uAmount.value = 0.16 * shell;

      /* the spin: the machine shakes — a tremor at the frame rate (a steady blur) over a slow sway */
      const tremor = Math.sin(TAU * 30 * time);
      const sway = Math.sin(TAU * 1.13 * time);
      const sway2 = Math.sin(TAU * 1.71 * time + 1.1);
      machine.position.set(MX + s * (0.3 * tremor + 0.32 * sway + 0.16 * sway2), 0, MZ + s * (0.22 * Math.sin(TAU * 30 * time + 1.6) + 0.18 * sway2));
      machine.rotation.set(s * 0.0022 * sway2, 0, s * 0.004 * sway);
      // the laundry: on the ring, it turns at the drum's speed; off it, it lies in its heap
      const e = s * s * (3 - 2 * s);
      for (const l of laundry) {
        const a = l.ringA + SPIN * time;
        ringP.set(Math.cos(a) * l.ringR, Math.sin(a) * l.ringR, l.z);
        pos.copy(l.heap).lerp(ringP, e);
        l.mesh.position.copy(pos);
        l.mesh.rotation.set(0, 0, a); // in the heap the blob is round about z: its turn does not show
        l.mesh.scale.set(lerp(l.heapS[0], l.ringS[0], e), lerp(l.heapS[1], l.ringS[1], e), lerp(l.heapS[2], l.ringS[2], e));
      }

      /* the live metal: the wave leaves FAULT and covers the casing and the lid; held, it barely breathes */
      const front = live > 0.001 ? live * DMAX : -20;
      const breath = 0.94 + 0.06 * Math.sin(TAU * 0.35 * time);
      for (const m of [metal]) {
        m.uniforms.uFront.value = front;
        m.uniforms.uHotK.value = 1.5 * breath;
        m.uniforms.uAmount.value = shell;
      }
      for (const b of bands) {
        const w = 1 - smooth(front - 9, front + 0.5, b.d);
        const crest = front > 0.5 ? Math.exp(-(((b.d - front) / 8) ** 2)) : 0;
        b.mat.color.copy(INK).lerp(SIGNAL, w).multiplyScalar(1 + (0.75 * breath - 0.05) * w + 0.9 * crest);
        b.mat.opacity = b.opacity * shell;
      }
      // the fault: a light that has a place — it swells for a couple of frames as the wire touches, then stays small
      const pop = fault > 0 && fault < 0.7 ? Math.sin((Math.PI * fault) / 0.7) : 0;
      flare.uniforms.uSize.value = 3.6 * (1 + 1.2 * pop);
      flare.uniforms.uAmount.value = smooth(0, 0.2, fault) * (0.92 + 0.08 * Math.sin(TAU * 0.5 * time)) * shell;
      // the control panel: lit while the circuit is on
      const on = (1 - trip) * shell;
      screenMat.color.copy(INK).multiplyScalar(0.55 * on);
      ledMats.forEach((m, i) => m.color.copy(INK).multiplyScalar((i === 3 ? 1.3 : 0.22) * on));
      notch.material.color.copy(INK).multiplyScalar(0.6 * on);
      machine.visible = shell > 0.01;

      /* the floor */
      pu.uT.value = time;
      pu.uSpin.value = s;
      pu.uFront.value = front;
      pu.uBody.value = smooth(0.3, 0.5, body);
      pu.uAmount.value = shell;
      const mx = machine.position.x;
      const mz = machine.position.z;
      pu.uBox0.value.set(mx - HW, 0, mz - HD);
      pu.uBox1.value.set(mx + HW, LID.y1, mz + HD);
      pu.uMeA.value.set(mx - HW + 5, mz + HD - 5);
      pu.uMeB.value.set(mx + HW - 5, mz + HD - 5);
      drops.uniforms.uT.value = time;
      drops.uniforms.uScale.value = px;
      drops.uniforms.uAmount.value = s * shell;
      drops.points.visible = s > 0.01 && shell > 0.01;
      mask.visible = u < 0.003;

      /* you: the trunk leans as the hand goes out (an arm is 57 cm: the lid is 83 from your shoulder, standing) */
      const r = clamp01(P.reach);
      const t = clamp01(P.touch);
      const er = r * r * (3 - 2 * r);
      you.lean(3 + 23 * er + 5 * t, -2 * er, 12 * er);
      wrist.copy(W_REST).lerp(W_HOVER, er).lerp(W_TOUCH, t);
      dir.copy(DIR_REST).lerp(DIR, er).normalize();
      palm.copy(PALM_REST).lerp(PALM_DOWN, er).normalize();
      you.reach("R", wrist, BEND, { dir, palm });
      you.grip("R", 0.12 * (1 - t));
      you.reach("L", ringP.set(21, 91, 1));
      you.group.visible = shell > 0.01;
      // the current's way through you: dotted (0–0.3), then heads that run down it (0.3–1)
      const key = Math.round(r * 1e4) + 2e4 * Math.round(t * 1e4);
      if (key !== pathKey && body > 0.002) {
        pathKey = key;
        layPath();
      }
      const dotted = smooth(0, 0.3, body);
      const heads = smooth(0.3, 0.5, body);
      pathMat.opacity = 0.95 * dotted * (1 - 0.55 * heads) * shell;
      headMat.opacity = heads * shell;
      headMat.dashOffset = -time * 62; // a period is 21.5 cm: about a tenth of it a frame
      for (let i = 0; i < 4; i++) paths[i].visible = (i < 2 ? dotted : heads) > 0.004 && shell > 0.01;

      /* under the floor */
      below.visible = u > 0.003 && shell > 0.01;
      underGlass.uniforms.uAmount.value = u * shell;
      slabGlass.uniforms.uAmount.value = u * shell;
      for (const [m, a] of underLines) m.opacity = a * u * shell;
      grains.uniforms.uAmount.value = u * shell;
      grains.uniforms.uScale.value = px;
    },
  };
}
