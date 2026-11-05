// DOSSIER 036 — the storm and the wind. Three things, three frames (docs/036-decors.md, « src/vent.js »):
//
//   buildWind() → { group, flow, disc, update(P, time, px) }
//   group   THE WORLD'S FRAME (plan.js): the rain, slanted along −WIND and falling, ink, fine; the gusts, long soft veins
//           of signal, rare, far — behind the rotor more than in front of it. `storm` doses both.
//   flow    BLADE A'S FRAME (rotor-fixed, NOT pitched: world.js mounts it in model.js's A.root[0]). At y = SECTION.y, the
//           principle, « une pale, c'est une aile » : the blade cut across (a slab of solid grey, its contour veille), the
//           wind's filets meeting it (ink, a real potential flow: a Joukowski wing, Kutta circulation), the pull on the
//           rotor (`lift`, a veille arrow along +x, as long as the profile lifts), the arc 0 → 90 and its needle (`gauge`).
//   disc    THE NACELLE'S FRAME (world.js mounts it in model.js's root): the fall, `slip` — filets that come from +z, run
//           through the rotor disc and slide along the three feathered blades without pushing them.
//   P       storm flow lift gauge slip pitchA pitchB pitchC rpm (+ rotor, turns: the disc's filets turn with the rotor
//           when world.js passes it — see docs/journal/036-vent.md, « À changer ailleurs »)
//
// THE RAIN is 020's (episodes/020-taipei-101/src/tour.js, `makeStreaks`, not exported: COPIED here, with three additions —
// `near` (where the streaks fade in, as a fraction of the cube), and a clear zone: what lies in front of the hub, or of
// the section, is dimmed (`uClear`, `uClearR`, `uShield`): the rain never veils what the shot is about).
//
// THE SECTION. The profile is a Joukowski wing (circle centre μ = (−0.15, 0.06): ≈ 19 % thick, 3 % camber), scaled to
// SECTION.chord, its pitch axis at mid-chord, its suction side downwind (−z). The relative wind comes « de biais »: at
// pitch 0 from 25° off the rotor plane (the wind and the blade's own speed); its angle follows the pitch so that at 90
// the wing meets it at its zero-lift angle — the wind back along the axis (≈ +z), the profile by its edge, the filets
// straight. The filets are true streamlines, precomputed for pitch 0, 10 … 90 and blended; along them, heads of light
// spaced in TIME OF FLIGHT: they leave upstream in a line and those over the suction side reach the trailing edge first
// — the picture of lift. The pull (`lift` × the profile's lift, sin(α+β) / its value at pitch 0): 1 → 0.5 → 0.
// The flow is an illustration of the principle (the image simplifies: no stall, no tip, no wake): `sources` says so.
//
// Three colours: ink (rain, filets, the arc), veille (the wing's contour, the pull, the needle), signal (the gusts).
// Everything depends on P and `time`; update() is called sixteen times a frame: it writes into arrays made here.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { fatLine, lineMat, solid, glow } from "@kit/build3d.js";
import { WIND, SECTION, HUB, BLADE, BEARING } from "./plan.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const ORDER = { rain: 46, filets: 4 };
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const fract = (x) => x - Math.floor(x);

/* ───────────────────────────────────────────────────────────── the storm (020's streaks) */

/**
 * COPIED FROM 020 (tour.js, makeStreaks). What the wind carries, in a cube that follows the eye (each streak stays where
 * it is in the world: it is the cube's window that moves). Each is drawn as the line it is — a head, a tail upwind —
 * never thinner than `px[0]` pixels: rain when thin, a vein of wind when wide. Its length is many times what it covers
 * in one frame: it slides along itself, it never hops. Several cubes, each four times the last.
 * Added here: `near` (fade-in band, fraction of the cube) and the clear zone (uClear, uClearR, uShield).
 */
function makeStreaks({ count, half, seed, shared, len, speed, wide, px, gain, near = [0.14, 0.3] }) {
  const rand = rng(seed);
  const base = [];
  const seeds = [];
  const corner = [];
  const index = [];
  for (let i = 0; i < count; i++) {
    const p = [(rand() * 2 - 1) * half, (rand() * 2 - 1) * half, (rand() * 2 - 1) * half];
    const s = [rand(), rand(), rand()];
    for (const c of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
      base.push(...p);
      seeds.push(...s);
      corner.push(...c);
    }
    index.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 3, i * 4 + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(base, 3));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 3));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute(corner, 2));
  geo.setIndex(index);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        uHalf: { value: half }, uLen: { value: len * half }, uSpeed: { value: speed * half }, uWide: { value: wide * half },
        uPx: { value: new THREE.Vector2(...px) }, uGain: { value: gain }, uNear: { value: new THREE.Vector2(...near) },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uAmount, uDense, uHalf, uLen, uSpeed, uWide, uGain, uClearR, uShield; uniform vec2 uView, uPx, uNear; uniform vec3 uDir, uColor, uClear;
        attribute vec3 aSeed; attribute vec2 aCorner;
        varying vec3 vCol; varying vec2 vUv;
        void main() {
          float k = 0.72 + 0.28 * aSeed.x; // not all at one speed: that is the depth of the air
          vec3 p = position + uDir * (uSpeed * k * uTime);
          vec3 rel = mod(p - cameraPosition + uHalf, 2.0 * uHalf) - uHalf; // the copy of this streak nearest to the eye
          vec3 w = cameraPosition + rel;
          float dist = length(rel) / uHalf;
          // (a ball inside the cube: a streak is gone before the cube's wall takes it to the other side)
          float seen = smoothstep(uNear.x, uNear.y, dist) * (1.0 - smoothstep(0.7, 0.98, dist)) * (1.0 - smoothstep(uDense - 0.1, uDense, aSeed.z)) * smoothstep(0.0, 300.0, w.y);
          float len = uLen * (0.55 + 0.9 * aSeed.y);
          vec4 a = projectionMatrix * viewMatrix * vec4(w, 1.0);              // its head
          vec4 b = projectionMatrix * viewMatrix * vec4(w - uDir * len, 1.0); // its tail, upwind
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          vCol = vec3(0.0); vUv = vec2(0.0);
          if (seen * uAmount > 0.002 && a.w > 30.0 && b.w > 30.0) {
            float focal = 0.5 * uView.y * projectionMatrix[1][1];
            vec2 pa = a.xy / a.w * uView * 0.5;
            vec2 run = b.xy / b.w * uView * 0.5 - pa;
            float l = length(run);
            vec2 dir = l > 1e-3 ? run / l : vec2(-1.0, 0.0);
            float real = uWide * focal / a.w;            // half its width, in pixels
            float wide = clamp(real, uPx.x, uPx.y);
            float lpx = max(l, 8.0 * wide);              // seen end on it is a short stroke, never a dot
            vec2 q = pa + dir * (lpx * aCorner.x) + vec2(-dir.y, dir.x) * aCorner.y * wide;
            gl_Position = vec4(q / (uView * 0.5), mix(a.z / a.w, b.z / b.w, aCorner.x), 1.0);
            vUv = aCorner;
            float thin = clamp(real / uPx.x, 0.3, 1.0);  // drawn wider than it is, it pays for it in light
            // the clear zone: nothing in front of what the shot is about (the hub, the section)
            vec4 c = projectionMatrix * viewMatrix * vec4(uClear, 1.0);
            float shield = 0.0;
            if (c.w > 30.0 && a.w < c.w + uClearR) {
              vec2 pc = c.xy / c.w * uView * 0.5;
              float rpx = max(uClearR * focal / c.w, 1.0);
              shield = 1.0 - smoothstep(0.7, 1.25, length(pa - pc) / rpx);
            }
            vCol = uColor * ((0.35 + 0.65 * aSeed.y) * thin * seen * uAmount * uGain * (1.0 - uShield * shield));
          }
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vCol; varying vec2 vUv;
        void main() {
          float along = smoothstep(0.0, 0.07, vUv.x) * pow(clamp(1.0 - vUv.x, 0.0, 1.0), 1.4);
          float across = pow(clamp(1.0 - abs(vUv.y), 0.0, 1.0), 1.5);
          gl_FragColor = vec4(vCol * along * across, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = ORDER.rain;
  return mesh;
}

/* ───────────────────────────────────────────────────────────── filets: polylines rewritten in place */

/** `lines` polylines of `pts` points each, one LineSegments2, colour per point (additive: black is nothing).
 *  `put(j, i, x, y, z, b, colour)` writes point i of line j; `done()` flags the buffers. No allocation after build. */
function makeFilets(lines, pts, width) {
  const segs = lines * (pts - 1);
  const geo = new LineSegmentsGeometry();
  geo.setPositions(new Float32Array(segs * 6));
  geo.setColors(new Float32Array(segs * 6));
  const mat = lineMat(0xffffff, width, { vertexColors: true, additive: true });
  const mesh = new LineSegments2(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = ORDER.filets;
  const PB = geo.attributes.instanceStart.data;
  const CB = geo.attributes.instanceColorStart.data;
  const pos = PB.array;
  const col = CB.array;
  const put = (j, i, x, y, z, b, c) => {
    const s = j * (pts - 1) + i;
    const r = c.r * b, g = c.g * b, bl = c.b * b;
    if (i < pts - 1) {
      const o = s * 6;
      pos[o] = x; pos[o + 1] = y; pos[o + 2] = z;
      col[o] = r; col[o + 1] = g; col[o + 2] = bl;
    }
    if (i > 0) {
      const o = (s - 1) * 6 + 3;
      pos[o] = x; pos[o + 1] = y; pos[o + 2] = z;
      col[o] = r; col[o + 1] = g; col[o + 2] = bl;
    }
  };
  const done = (positions = true) => {
    if (positions) PB.needsUpdate = true;
    CB.needsUpdate = true;
  };
  return { mesh, mat, put, done };
}

/* ───────────────────────────────────────────────────────────── the wing: a Joukowski profile and its flow */

const JK = { mx: -0.15, my: 0.06 };
JK.R = Math.hypot(1 - JK.mx, JK.my);
JK.beta = Math.asin(JK.my / JK.R);
const jmap = (r, i) => {
  const m = r * r + i * i;
  return [r + r / m, i - i / m];
};

/** The complex velocity's conjugate in the circle's plane: [u, v]. Free stream 1 at angle a, circulation G. */
function jvel(zr, zi, ca, sa, G) {
  const pr = zr - JK.mx, pi = zi - JK.my;
  const m = Math.max(pr * pr + pi * pi, 1e-6);
  const qr = (pr * pr - pi * pi) / (m * m), qi = (-2 * pr * pi) / (m * m);
  const R2 = JK.R * JK.R;
  const t2r = R2 * (ca * qr - sa * qi), t2i = R2 * (ca * qi + sa * qr);
  const k = G / (TAU * m);
  const wr = ca - t2r + k * pi, wi = -sa - t2i + k * pr;
  return [wr, -wi];
}
function jpsi(zr, zi, ca, sa, G) {
  const pr = zr - JK.mx, pi = zi - JK.my;
  const m = Math.max(pr * pr + pi * pi, 1e-9);
  return pi * ca - pr * sa + (JK.R * JK.R * (sa * pr - ca * pi)) / m + (G / TAU) * Math.log(Math.sqrt(m));
}

/** The relative wind's angle of attack at a pitch (degrees → radians), and how much the wing lifts (1 at pitch 0). */
const INFLOW0 = 25; // degrees off the rotor plane at pitch 0: the wind and the blade's own speed
const attack = (pitch) => {
  const a0 = (INFLOW0 - SECTION.twist) * DEG; // at pitch 0
  const a90 = -JK.beta; // at 90: the zero-lift angle
  return a0 + (a90 - a0) * Math.min(1, Math.max(0, pitch / 90));
};
const LIFT0 = Math.sin(attack(0) + JK.beta);
const lifting = (pitch) => Math.max(0, Math.sin(attack(pitch) + JK.beta) / LIFT0);

/** The profile's outline (local: chord along x, leading edge at +x, suction side at −z), its scale and its streamlines. */
function buildWing({ keys, lanes, pts }) {
  // the outline, from the trailing edge round
  const raw = [];
  let xmin = Infinity, xmax = -Infinity;
  for (let i = 0; i < 180; i++) {
    const a = (i / 180) * TAU - JK.beta;
    const [r, im] = jmap(JK.mx + JK.R * Math.cos(a), JK.my + JK.R * Math.sin(a));
    raw.push([r, im]);
    xmin = Math.min(xmin, r);
    xmax = Math.max(xmax, r);
  }
  const k = SECTION.chord / (xmax - xmin);
  const xc = (xmin + xmax) / 2; // the pitch axis at mid-chord
  const local = (r, im) => [-k * (r - xc), -k * im]; // [x, z]
  const outline = raw.map(([r, im]) => local(r, im));

  // the streamlines: for each key (pitch 0, 10 … 90) and each lane (a value of ψ off the wing's own), integrated in
  // the circle's plane (normalised speed, RK4), mapped, resampled evenly along their length; with their time of flight
  const KX = new Float32Array(keys.length * lanes.length * pts);
  const KZ = new Float32Array(KX.length);
  const KT = new Float32Array(KX.length);
  const L0 = 7, L1 = 8, h = 0.02;
  keys.forEach((pitch, ki) => {
    const al = attack(pitch);
    const ca = Math.cos(al), sa = Math.sin(al);
    const G = 2 * TAU * JK.R * Math.sin(al + JK.beta); // Kutta: 4πR sin(α+β)
    const psiWing = (G / TAU) * Math.log(JK.R);
    const dir = (zr, zi) => {
      const [u, v] = jvel(zr, zi, ca, sa, G);
      const l = Math.hypot(u, v) || 1e-9;
      return [u / l, v / l];
    };
    lanes.forEach((dPsi, li) => {
      // the start, far upstream on a line across the stream: where ψ = ψ(wing) + dPsi
      const at = (n) => [JK.mx - L0 * ca - n * sa, JK.my - L0 * sa + n * ca];
      let lo = dPsi - 4, hi = dPsi + 4;
      for (let it = 0; it < 50; it++) {
        const mid = (lo + hi) / 2;
        const [r, im] = at(mid);
        if (jpsi(r, im, ca, sa, G) - psiWing > dPsi) hi = mid;
        else lo = mid;
      }
      let [zr, zi] = at((lo + hi) / 2);
      const line = [];
      const times = [];
      let t = 0;
      let prev = jmap(zr, zi);
      line.push(prev);
      times.push(0);
      for (let step = 0; step < 4000; step++) {
        const [k1x, k1y] = dir(zr, zi);
        const [k2x, k2y] = dir(zr + (h / 2) * k1x, zi + (h / 2) * k1y);
        const [k3x, k3y] = dir(zr + (h / 2) * k2x, zi + (h / 2) * k2y);
        const [k4x, k4y] = dir(zr + h * k3x, zi + h * k3y);
        zr += (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
        zi += (h / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
        // never inside the circle
        const pr = zr - JK.mx, pi = zi - JK.my, rr = Math.hypot(pr, pi);
        if (rr < JK.R * 1.003) {
          zr = JK.mx + (pr / rr) * JK.R * 1.003;
          zi = JK.my + (pi / rr) * JK.R * 1.003;
        }
        const z = jmap(zr, zi);
        // the speed in the wing's plane: |dw/dζ| / |dz/dζ|
        const [u, v] = jvel(zr, zi, ca, sa, G);
        const m = zr * zr + zi * zi;
        const dr = 1 - (zr * zr - zi * zi) / (m * m), di = (2 * zr * zi) / (m * m);
        const speed = Math.min(3, Math.max(0.18, Math.hypot(u, v) / Math.max(Math.hypot(dr, di), 1e-3)));
        t += Math.hypot(z[0] - prev[0], z[1] - prev[1]) / speed;
        line.push(z);
        times.push(t);
        prev = z;
        if ((zr - JK.mx) * ca + (zi - JK.my) * sa > L1) break;
      }
      // resample evenly along its length (in the wing's plane)
      const acc = [0];
      for (let i = 1; i < line.length; i++) acc.push(acc[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]));
      const total = acc[acc.length - 1];
      let seg = 0;
      for (let i = 0; i < pts; i++) {
        const s = (i / (pts - 1)) * total;
        while (seg < acc.length - 2 && acc[seg + 1] < s) seg++;
        const f = Math.min(1, Math.max(0, (s - acc[seg]) / Math.max(acc[seg + 1] - acc[seg], 1e-9)));
        const r = line[seg][0] + (line[seg + 1][0] - line[seg][0]) * f;
        const im = line[seg][1] + (line[seg + 1][1] - line[seg][1]) * f;
        const [x, zz] = local(r, im);
        const o = (ki * lanes.length + li) * pts + i;
        KX[o] = x;
        KZ[o] = zz;
        KT[o] = times[seg] + (times[seg + 1] - times[seg]) * f;
      }
    });
  });
  return { outline, k, KX, KZ, KT };
}

/* ───────────────────────────────────────────────────────────── the blade's chord, for the fall's filets */

const chordAt = (y) => (y < BLADE.atMax ? 210 + (BLADE.chordMax - 210) * (y / BLADE.atMax) : BLADE.chordMax + (BLADE.chordTip - BLADE.chordMax) * ((y - BLADE.atMax) / (BLADE.len - BLADE.atMax)));
const twistAt = (y) => BLADE.twist * Math.pow(Math.max(0, 1 - y / BLADE.len), 0.6);

export function buildWind() {
  /* ═════════════ 1 · THE STORM (world frame): rain, ink, falling along −WIND; gusts, signal, far ═════════════ */
  const group = new THREE.Group();
  const clock = { value: 0 };
  const view = { value: new THREE.Vector2(BRAND.W, BRAND.H) };
  const clear = { value: new THREE.Vector3(0, -1e6, 0) };
  const clearR = { value: 700 };
  const fall = new THREE.Vector3(-WIND[0], -1.3, -WIND[2]).normalize(); // ≈ 38° off the vertical: rain in a gale
  const drift = new THREE.Vector3(-WIND[0], -0.05, -WIND[2]).normalize();
  const rainU = { uTime: clock, uAmount: { value: 1 }, uDense: { value: 1 }, uDir: { value: fall }, uColor: { value: INK.clone() }, uView: view, uClear: clear, uClearR: clearR, uShield: { value: 0.92 } };
  const gustU = { uTime: clock, uAmount: { value: 1 }, uDense: { value: 0.6 }, uDir: { value: drift }, uColor: { value: SIGNAL.clone() }, uView: view, uClear: clear, uClearR: clearR, uShield: { value: 1 } };
  const storm = new THREE.Group();
  // rain: per frame a streak covers about a seventh of its own length; from arm's length to well behind the rotor
  for (const [i, half] of [1200, 4800, 19200].entries()) storm.add(makeStreaks({ count: 9000, half, seed: 361 + i, shared: rainU, len: 0.1, speed: 0.4, wide: 0.0011, px: [1.8, 2.8], gain: 0.55 }));
  // gusts: few, long, wide and soft, drifting; they fade in only far from the eye (behind the rotor from the road)
  for (const [i, half] of [36000, 96000].entries()) storm.add(makeStreaks({ count: [900, 500][i], half, seed: 371 + i, shared: gustU, len: 0.5, speed: 0.3, wide: 0.007, px: [4, 26], gain: 0.32, near: [0.28, 0.46] }));
  group.add(storm);

  /* ═════════════ 2 · THE PRINCIPLE (blade A's frame): the section, the filets, the pull, the arc ═════════════ */
  const flow = new THREE.Group();
  const station = new THREE.Group();
  station.position.y = SECTION.y;
  flow.add(station);
  const profile = new THREE.Group(); // turned by pitchA + twist, like the glass blade there
  station.add(profile);

  const KEYS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  const LANES = [-2.3, -1.25, -0.5, 0.16, 0.7, 1.5, 2.5]; // ψ off the wing's: below (pressure side, upwind) → above
  const NP = 96;
  const wing = buildWing({ keys: KEYS, lanes: LANES, pts: NP });
  const LEN = wing.k; // one unit of the wing's plane, in cm (chord ≈ 4 units)

  // the cut: a slab of the blade, solid, three greys' middle; its contour veille on both faces
  const shape = new THREE.Shape(wing.outline.map(([x, z]) => new THREE.Vector2(x, z)));
  const slabGeo = new THREE.ExtrudeGeometry(shape, { depth: 10, bevelEnabled: false, curveSegments: 1 });
  slabGeo.translate(0, 0, -5);
  slabGeo.rotateX(Math.PI / 2);
  const slabMat = solid(0x6c7279, { rough: 0.55, metal: 0.15, double: true, opacity: 0.999 });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  profile.add(slab);
  const loop = [...wing.outline, wing.outline[0]];
  const rims = [5.5, -5.5].map((y) => fatLine(loop.map(([x, z]) => [x, y, z]), { color: BRAND.veille, width: 4.5, hdr: 1.5 }));
  profile.add(...rims);

  // the filets, in the profile's frame (their inflow follows the pitch)
  const filets = makeFilets(LANES.length, NP, 3.2);
  profile.add(filets.mesh);
  const RATE = 3.6; // wing units per second of the free stream (≈ 0.9 chord/s: readable, never a blur)
  const SPACING = 5.5; // time of flight between two heads of light
  const phase = LANES.map((_, j) => 0.04 * j); // the heads leave upstream almost in a line

  // the pull: along +x (the way the blade moves), from just off the leading edge
  const pull = new THREE.Group();
  pull.position.set(15, 0, -75); // beside the wing, on its suction side: the arrow runs along it, clear of the needle
  station.add(pull);
  const shaft = fatLine([[0, 0, 0], [1, 0, 0]], { color: BRAND.veille, width: 8, hdr: 1.2 });
  pull.add(shaft);
  const headMat = glow(BRAND.veille, 1.25, { opacity: 0.999 });
  const head = new THREE.Mesh(new THREE.ConeGeometry(15, 40, 24), headMat);
  head.rotation.z = -Math.PI / 2; // the cone's tip along +x
  pull.add(head);
  const PULL = SECTION.chord * 0.85;

  // the arc 0 → 90 round the section, three ticks, and the needle on the pitch
  const GR = SECTION.chord * 0.8;
  const arcPts = [];
  for (let i = 0; i <= 48; i++) {
    const a = (SECTION.twist + (i / 48) * 90) * DEG;
    arcPts.push([Math.cos(a) * GR, 0, Math.sin(a) * GR]);
  }
  const dial = new THREE.Group();
  station.add(dial);
  const arc = fatLine(arcPts, { color: BRAND.ink, width: 3.5 });
  dial.add(arc);
  const ticks = [0, 45, 90].map((d) => {
    const a = (SECTION.twist + d) * DEG;
    return fatLine([[Math.cos(a) * (GR - 16), 0, Math.sin(a) * (GR - 16)], [Math.cos(a) * (GR + 22), 0, Math.sin(a) * (GR + 22)]], { color: BRAND.ink, width: 3.5 });
  });
  dial.add(...ticks);
  const needleG = new THREE.Group();
  const needle = fatLine([[GR - 22, 0, 0], [GR + 28, 0, 0]], { color: BRAND.ink, width: 5, hdr: 1.3 }); // ink: green is the wing and its pull only
  needleG.add(needle);
  dial.add(needleG);
  const dialMats = [arc.material, ...ticks.map((t) => t.material)];

  /* ═════════════ 3 · THE FALL (nacelle's frame): the wind slides past the feathered blades ═════════════ */
  const disc = new THREE.Group();
  const spin = new THREE.Group(); // the hub's frame: turns with the rotor
  spin.position.set(...HUB.at);
  disc.add(spin);
  const SPANS = [900, 2000, 3100];
  const SN = 56;
  const Z0 = 1400, Z1 = -1800; // from upwind to downwind (blade frame z: +z upwind)
  const slipLines = 3 * SPANS.length * 2;
  const slip = makeFilets(slipLines, SN, 3.6);
  spin.add(slip.mesh);
  // static geometry, in the hub frame: each blade k turned by −2πk/3 about z, its flange at BEARING.r
  const slipS = new Float32Array(slipLines * SN); // where each point is along the wind (cm from Z0), for the heads
  {
    let j = 0;
    for (let kb = 0; kb < 3; kb++) {
      const th = (kb / 3) * TAU; // blade k points at θ = 2πk/3 from up, clockwise seen from upwind
      for (const y of SPANS) {
        const c = chordAt(y), thick = 0.22 * c, tw = twistAt(y) * DEG;
        for (const side of [-1, 1]) {
          for (let i = 0; i < SN; i++) {
            const z = Z0 + ((Z1 - Z0) * i) / (SN - 1);
            const near = Math.exp(-((z / (0.75 * c)) ** 2));
            const bump = Math.sqrt(Math.max(0, 1 - (z / (0.55 * c)) ** 2));
            const x = -z * Math.tan(tw) * near + side * (24 + (thick / 2) * Math.max(bump, near * 0.6));
            const r = BEARING.r + y;
            // blade frame (x across, y along, z wind) → hub frame
            const hx = Math.cos(th) * x + Math.sin(th) * r;
            const hy = -Math.sin(th) * x + Math.cos(th) * r;
            slip.put(j, i, hx, hy, z, 0, INK);
            slipS[j * SN + i] = Z0 - z;
          }
          j++;
        }
      }
    }
    slip.done();
  }
  const slipPhase = Array.from({ length: slipLines }, (_, j) => fract(j * 0.618));

  const sectionAt = new THREE.Vector3();
  const hubAt = new THREE.Vector3();

  return {
    group, flow, disc,
    update({ storm: st = 1, flow: fl = 0, lift = 0, gauge: ga = 0, slip: sl = 0, pitchA = 0, rotor = 0 } = {}, time = 0, px = 1600) {
      void px;
      /* the storm */
      storm.visible = st > 0.01;
      clock.value = time;
      rainU.uAmount.value = smooth(0, 0.6, st);
      rainU.uDense.value = 0.3 + 0.75 * st;
      // the gusts come in waves (a slow breath, never a flicker): how many veins are out rises and falls
      gustU.uAmount.value = smooth(0.2, 1, st);
      gustU.uDense.value = (0.25 + 0.45 * (0.5 + 0.5 * Math.sin(time * 1.13) * Math.sin(time * 0.47 + 1.3))) * st;
      // the clear zone: the section when the principle is on, otherwise the hub
      if (fl > 0.01) {
        station.updateWorldMatrix(true, false);
        sectionAt.setFromMatrixPosition(station.matrixWorld);
        clear.value.copy(sectionAt);
        clearR.value = SECTION.chord * 4;
        rainU.uShield.value = 1;
      } else if (st > 0.01) {
        spin.updateWorldMatrix(true, false);
        hubAt.setFromMatrixPosition(spin.matrixWorld);
        clear.value.copy(hubAt);
        clearR.value = 720;
        rainU.uShield.value = 0.92;
      }

      /* the principle */
      station.visible = fl > 0.01;
      if (station.visible) {
        const p = Math.min(90, Math.max(0, pitchA));
        profile.rotation.y = -(p + SECTION.twist) * DEG;
        slabMat.opacity = fl;
        for (const r of rims) r.material.opacity = fl;
        // the filets: two keys blended, heads of light in time of flight
        const kf = p / 10;
        const k0 = Math.min(KEYS.length - 2, Math.floor(kf));
        const t = kf - k0;
        const run = time * RATE;
        for (let j = 0; j < LANES.length; j++) {
          const o0 = (k0 * LANES.length + j) * NP, o1 = ((k0 + 1) * LANES.length + j) * NP;
          for (let i = 0; i < NP; i++) {
            const x = wing.KX[o0 + i] + (wing.KX[o1 + i] - wing.KX[o0 + i]) * t;
            const z = wing.KZ[o0 + i] + (wing.KZ[o1 + i] - wing.KZ[o0 + i]) * t;
            const tof = wing.KT[o0 + i] + (wing.KT[o1 + i] - wing.KT[o0 + i]) * t;
            const f = i / (NP - 1);
            const env = smooth(0, 0.16, f) * (1 - smooth(0.78, 1, f));
            const u = fract((run - tof) / SPACING + phase[j]);
            const headB = (1 - u) * (1 - u) * (1 - u);
            filets.put(j, i, x, 0, z, fl * env * (0.55 + 1.1 * headB), INK);
          }
        }
        filets.done();
        // the pull
        const pl = lift * lifting(p);
        pull.visible = pl > 0.01;
        shaft.scale.x = Math.max(0.01, pl * PULL);
        head.position.x = pl * PULL;
        head.scale.setScalar(Math.min(1, pl * 3));
        shaft.material.opacity = Math.min(1, lift * 2);
        headMat.opacity = Math.min(1, lift * 2);
        // the dial
        dial.visible = ga > 0.01;
        needleG.rotation.y = profile.rotation.y;
        for (const m of dialMats) m.opacity = ga;
        needle.material.opacity = ga;
      }

      /* the fall */
      disc.visible = sl > 0.01;
      if (disc.visible) {
        spin.rotation.z = -TAU * rotor;
        const run = time * 2400; // the wind, about real: 24 m/s
        let j = 0;
        for (let kb = 0; kb < 3; kb++) {
          for (let sp = 0; sp < SPANS.length; sp++) {
            for (let side = 0; side < 2; side++) {
              for (let i = 0; i < SN; i++) {
                const f = i / (SN - 1);
                const env = smooth(0, 0.2, f) * (1 - smooth(0.7, 1, f));
                const u = fract((run - slipS[j * SN + i]) / 1500 + slipPhase[j]);
                const b = sl * env * (0.85 + 0.6 * (1 - u) * (1 - u) * (1 - u));
                // colours only: rewrite the point where it already is
                slipColour(slip, j, i, b);
              }
              j++;
            }
          }
        }
        slip.done(false);
      }
    },
  };

  function slipColour(f, j, i, b) {
    const col = f.mesh.geometry.attributes.instanceColorStart.data.array;
    const s = j * (SN - 1) + i;
    const r = INK.r * b, g = INK.g * b, bl = INK.b * b;
    if (i < SN - 1) {
      const o = s * 6;
      col[o] = r; col[o + 1] = g; col[o + 2] = bl;
    }
    if (i > 0) {
      const o = (s - 1) * 6 + 3;
      col[o] = r; col[o + 1] = g; col[o + 2] = bl;
    }
  }
}
