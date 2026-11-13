// DOSSIER 047 — Lave-vaisselle : THE DISHWASHER AROUND THE SYSTEM, seen like an X-ray — and the dish, the crust.
//
//   buildCuve() → { group, A, update(P, time, px) }
//   group    stands at the origin (plan.js coordinates); world.js hides it on the bench
//   A        anchors: dish, crust, door, lamp, rack, floor (the tub floor in front of the sump)
//   P        shell door eco dish crust crack ghosts jets turn passes mood
//
// What is glass (one shell, order 21): the cabinet's sides and back, the tub's walls and ceiling, the door, the upper
// arm and its riser. What is only lines: the base, the tub floor (it slopes to the sump: a slab of glass seen from
// under it would veil the whole picture), the baskets' wires, tines and wheels. What is SOLID: the gratin dish
// (glazed ceramic, three greys) and its burnt crust (signal) — the threat of the film and what the eye must find
// first. The crust is lit from below by a light of its own (seen from under the dish, the key never reaches it), glows
// where the jets of the arm hit it, splits into plates that fall onto the filters (`crack`), and washes away (`crust`).
// The water that falls back from it: streaks (never dots). The sponge and the brush that are NOT there: glass ghosts.
// The eco lamp: a small veille light with a place, on the door's top edge, seen from the front and from above.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, edgesOf, solid, glow, setGlow, box, cyl, lathe, lineMat, anchor } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { DW, BASE, TUB, DOOR, RACK, RACK2, DISH, ARM, SUMP, FILTERS } from "./plan.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);

/** The dish leans with its FRONT edge higher: its opening looks down and toward the door, where the cameras stand
 *  (plan.js says « front edge lower »: then a low camera at the front only grazes the crust). */
const TILT = -DISH.tilt * DEG;
/** The jets of the arm, as model.js aims them (in the arm's turning frame): x = ±(4 + 4k), ending ≈ ±1 cm in z. */
const NJ = ARM.jets * 2;
const JET = Array.from({ length: NJ }, (_, i) => {
  const s = i < ARM.jets ? 1 : -1;
  return [s * (4 + (i % ARM.jets) * 4), s * 1.0];
});

/* ───────────────────────────────────────────── seeded value noise (build time only) */
function hash3(x, y, z) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const u = smooth(x - xi), v = smooth(y - yi), w = smooth(z - zi);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  return l(l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v), l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
const fbm = (x, y, z) => 0.6 * vnoise(x, y, z) + 0.3 * vnoise(x * 2.1 + 5.2, y * 2.1, z * 2.1 + 1.3) + 0.1 * vnoise(x * 4.3, y * 4.3 + 2, z * 4.3);

/* ───────────────────────────────────────────── a rounded rectangle, always the same number of points */
const NC = 6, NX = 12, NZ = 8;
const NR = 4 * NC + 2 * NX + 2 * NZ;
const NR1 = NR;
/** The ring of half extents (a, b), corner radius r, in the x–z plane: NR points, counter-clockwise seen from +y. */
function ring(a, b, r, m = 1) {
  const NC = 6 * m, NX = 12 * m, NZ = 8 * m;
  a = Math.max(a, 0.02);
  b = Math.max(b, 0.02);
  const k = Math.max(0, Math.min(r, a, b));
  const cx = a - k, cz = b - k;
  const pts = [];
  const corner = (sx, sz, q) => {
    for (let j = 0; j < NC; j++) {
      const t = (q + j / NC) * (Math.PI / 2);
      pts.push([sx * cx + k * Math.cos(t), sz * cz + k * Math.sin(t)]);
    }
  };
  const straight = (x0, z0, x1, z1, n) => {
    for (let j = 0; j < n; j++) pts.push([x0 + ((x1 - x0) * j) / n, z0 + ((z1 - z0) * j) / n]);
  };
  corner(1, 1, 0); straight(cx, b, -cx, b, NX);
  corner(-1, 1, 1); straight(-a, cz, -a, -cz, NZ);
  corner(-1, -1, 2); straight(-cx, -b, cx, -b, NX);
  corner(1, -1, 3); straight(a, -cz, a, cz, NZ);
  return pts;
}

/* ───────────────────────────────────────────── the dish (upright frame: its base at y 0, its opening up) */
const DA = DISH.w / 2, DB = DISH.d / 2, DR = 4.5; // the outer rounded rectangle at the rim
/** [offset from the rim's outline, y, shade]: outside from the middle of the base, the foot, the wall, the rolled
 *  lip, then inside down the wall to the middle of the inner bottom. shade 0 the outer glaze, 1 the lip, 2 inside. */
const DISH_PROFILE = [
  [-DB + 0.02, 0.3, 0], [-7, 0.22, 0], [-3.5, 0.08, 0], [-2.0, 0.0, 0], [-1.75, 0.3, 0], [-1.25, 1.6, 0], [-0.65, 3.4, 0], [-0.2, 4.9, 0],
  [0.25, 5.5, 1], [0.7, 5.95, 1], [0.5, 6.3, 1], [-0.1, 6.35, 1], [-0.6, 6.05, 1],
  [-0.85, 5.4, 2], [-1.25, 3.6, 2], [-1.7, 2.2, 2], [-2.2, 1.2, 2], [-2.8, 0.86, 2], [-4.2, 0.8, 2], [-7, 0.8, 2], [-DB + 0.02, 0.8, 2],
];
const IN_A = DA - 2.8, IN_B = DB - 2.8; // the inner bottom's flat
/** The crust's rings along the inner surface: [offset, y, wall weight 0 bottom → 1 wall]. */
const CRUST_RINGS1 = [
  [-DB + 0.03, 0.8, 0], [-9.6, 0.8, 0], [-8.4, 0.8, 0], [-7.2, 0.8, 0], [-6.1, 0.8, 0], [-5.1, 0.8, 0], [-4.2, 0.8, 0], [-3.4, 0.81, 0],
  [-2.85, 0.86, 0.3], [-2.45, 1.05, 0.65], [-2.12, 1.45, 0.9], [-1.9, 1.95, 1], [-1.7, 2.45, 1], [-1.5, 3.05, 1], [-1.32, 3.7, 1], [-1.15, 4.35, 1], [-1.0, 5.0, 1],
];
const WALL01 = 9; // the first crust ring up the wall

function loft(profile, color) {
  const pos = [], col = [], idx = [], inner = [];
  const shades = [new THREE.Color(0x67615a), new THREE.Color(0xc0b9ac), new THREE.Color(0xe2dccf)];
  for (const [o, y, s] of profile) {
    for (const [x, z] of ring(DA + o, DB + o, DR + o)) {
      pos.push(x, y, z);
      inner.push(s === 2 ? 1 : s === 1 ? 0.35 : 0);
      const c = color ? color : shades[s];
      col.push(c.r, c.g, c.b);
    }
  }
  for (let j = 0; j < profile.length - 1; j++)
    for (let i = 0; i < NR; i++) {
      const a = j * NR + i, b = j * NR + ((i + 1) % NR), c = a + NR, d = b + NR;
      idx.push(a, c, b, b, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("aInner", new THREE.Float32BufferAttribute(inner, 1));
  g.setIndex(idx);
  return g;
}

/** The crust, whole, then cut in plates: each plate its own mesh, centred on its own middle (so it can open, peel, fall). */
function crustPlates(seed = 47) {
  const R = rng(seed);
  // twice as fine as the dish, both ways: the lumps need it
  const NR = 2 * NR1;
  const CRUST_RINGS = CRUST_RINGS1.flatMap((r, j, all) => (j ? [all[j - 1].map((v, e) => (v + r[e]) / 2), r] : [r]));
  const WALL0 = 2 * WALL01;
  const rows = CRUST_RINGS.length;
  const P = new Float32Array(rows * NR * 3); // where each vertex sits (upright frame)
  const H = new Float32Array(rows * NR * 3); // where it sits on the dish (the shader's noise and the jets' hits read it)
  const C = new Float32Array(rows * NR * 3);
  const base = CRUST_RINGS.map(([o, y]) => ring(DA + o, DB + o, DR + o, 2).map(([x, z]) => [x, y, z]));
  const sig = new THREE.Color(BRAND.signal);
  // how high up the wall each column of the crust reaches: a torn edge
  const reach = Array.from({ length: NR }, (_, i) => {
    const [x, , z] = base[WALL0][i];
    return WALL0 + 0.6 + (rows - 5 - WALL0 - 0.6) * clamp01(1.25 * (0.75 * vnoise(x * 0.16 + 3.3, 1.7, z * 0.16 - 2.1) + 0.25 * vnoise(x * 0.5, 4.1, z * 0.5)) - 0.2);
  });
  for (let j = 0; j < rows; j++) {
    const w = CRUST_RINGS[j][2];
    for (let i = 0; i < NR; i++) {
      // the vertex climbs the wall no higher than its column's edge
      const top = reach[i];
      const jj = Math.min(j, top);
      const j0 = Math.floor(jj), j1 = Math.min(rows - 1, j0 + 1), f = jj - j0;
      const p0 = base[j0][i], p1 = base[j1][i];
      const x = p0[0] + (p1[0] - p0[0]) * f, y = p0[1] + (p1[1] - p0[1]) * f, z = p0[2] + (p1[2] - p0[2]) * f;
      // the way into the hollow: up off the bottom, in off the walls
      const prev = base[j0][(i + NR - 1) % NR], next = base[j0][(i + 1) % NR];
      let nx = next[2] - prev[2], nz = -(next[0] - prev[0]);
      const nl = Math.hypot(nx, nz) || 1;
      nx = -nx / nl; nz = -nz / nl; // inward
      const ww = w * (j < top ? 1 : CRUST_RINGS[Math.min(rows - 1, Math.ceil(jj))][2]);
      let dx = nx * ww, dy = (1 - ww) + 0.35 * ww, dz = nz * ww;
      const dl = Math.hypot(dx, dy, dz) || 1;
      dx /= dl; dy /= dl; dz /= dl;
      // the crust: lumps, thicker where it baked, thin and burnt where it ends
      const lump = fbm(x * 0.32 + 11, y * 0.32, z * 0.32 - 4);
      const blister = Math.max(0, vnoise(x * 0.9 + 2, y * 0.9 + 7, z * 0.9) - 0.5) * 3.2;
      const grit = vnoise(x * 1.5 + 1, y * 1.5, z * 1.5 + 9);
      const edge = clamp01((top - jj) / 1.6);
      const t = 0.07 + (0.2 + 0.6 * lump * lump + 0.4 * blister + 0.22 * grit) * smooth(edge);
      const k = (j * NR + i) * 3;
      P[k] = x + dx * t; P[k + 1] = y + dy * t; P[k + 2] = z + dz * t;
      H[k] = x; H[k + 1] = y; H[k + 2] = z;
      // its colour: signal, darker where it burnt (patches, and the torn edge), a little lighter on the blisters
      const burnt = clamp01((vnoise(x * 0.45 - 9, 3.3, z * 0.45 + 6) - 0.52) * 3.2) * 0.62 + (1 - smooth(clamp01((top - jj) / 2.6))) * 0.55;
      const v = (0.62 + 0.38 * lump + 0.25 * blister) * (1 - Math.min(0.8, burnt));
      C[k] = sig.r * v; C[k + 1] = sig.g * v; C[k + 2] = sig.b * v;
    }
  }
  // smooth normals over the whole crust, before it is cut
  const idx = [];
  for (let j = 0; j < rows - 1; j++)
    for (let i = 0; i < NR; i++) {
      const a = j * NR + i, b = j * NR + ((i + 1) % NR);
      idx.push(a, a + NR, b, b, a + NR, b + NR);
    }
  const whole = new THREE.BufferGeometry();
  whole.setAttribute("position", new THREE.BufferAttribute(P, 3));
  whole.setIndex(idx);
  whole.computeVertexNormals();
  const N = whole.getAttribute("normal").array;
  for (let k = 0; k < N.length; k += 3) if (!(Math.hypot(N[k], N[k + 1], N[k + 2]) > 0.5)) { N[k] = 0; N[k + 1] = 1; N[k + 2] = 0; }

  // the plates: a jittered 4 × 3 grid of seeds over the inner bottom, cells warped by noise so the cracks wander.
  // Each triangle is CUT along the cells' borders (the cut on an edge depends on its two ends only: neighbours agree).
  const seeds = [];
  for (let gz = 0; gz < 3; gz++)
    for (let gx = 0; gx < 4; gx++)
      seeds.push([-IN_A + ((gx + 0.5 + (R() - 0.5) * 0.7) * 2 * IN_A) / 4, -IN_B + ((gz + 0.5 + (R() - 0.5) * 0.7) * 2 * IN_B) / 3]);
  const rec = (v) => {
    const k = v * 3, x = H[k], y = H[k + 1], z = H[k + 2];
    const wx = x + 2.2 * (vnoise(x * 0.35 + 7, y * 0.3, z * 0.35) - 0.5), wz = z + 2.2 * (vnoise(x * 0.35, y * 0.3 + 4, z * 0.35 - 7) - 0.5);
    return [P[k], P[k + 1], P[k + 2], x, y, z, N[k], N[k + 1], N[k + 2], C[k], C[k + 1], C[k + 2], wx, wz];
  };
  const recs = Array.from({ length: rows * NR }, (_, v) => rec(v));
  const d2 = (r, s) => (r[12] - seeds[s][0]) ** 2 + (r[13] - seeds[s][1]) ** 2;
  const nearest = (r) => {
    let best = 0;
    for (let s = 1; s < seeds.length; s++) if (d2(r, s) < d2(r, best)) best = s;
    return best;
  };
  const near = recs.map(nearest);
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const clip = (poly, s, t) => {
    const f = (r) => d2(r, s) - d2(r, t);
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
      if (fa <= 0) out.push(a);
      if ((fa <= 0) !== (fb <= 0)) out.push(lerp(a, b, fa / (fa - fb)));
    }
    return out;
  };
  const bins = seeds.map(() => []);
  for (let t = 0; t < idx.length; t += 3) {
    const tri = [idx[t], idx[t + 1], idx[t + 2]];
    const cells = new Set(tri.map((v) => near[v]));
    if (cells.size === 1) {
      bins[near[tri[0]]].push(tri.map((v) => recs[v]));
      continue;
    }
    for (const s of cells) {
      let poly = tri.map((v) => recs[v]);
      for (let u = 0; u < seeds.length && poly.length >= 3; u++) if (u !== s) poly = clip(poly, s, u);
      for (let i = 1; i < poly.length - 1; i++) bins[s].push([poly[0], poly[i], poly[i + 1]]);
    }
  }

  // each plate a CHUNK: its lumpy face, the flat face it was baked on (dark, burnt), and its torn sides between them
  const dark = 0.32;
  const keyOf = (r) => `${Math.round(r[3] * 1e3)},${Math.round(r[4] * 1e3)},${Math.round(r[5] * 1e3)}`;
  const flat = (pa, pb, pc) => {
    const ux = pb[0] - pa[0], uy = pb[1] - pa[1], uz = pb[2] - pa[2], wx = pc[0] - pa[0], wy = pc[1] - pa[1], wz = pc[2] - pa[2];
    const x = uy * wz - uz * wy, y = uz * wx - ux * wz, z = ux * wy - uy * wx;
    const l = Math.hypot(x, y, z);
    return l > 1e-9 ? [x / l, y / l, z / l] : [0, 1, 0];
  };
  const top = (r) => [r[0], r[1], r[2]];
  const bot = (r) => [r[3], r[4], r[5]];
  return bins.filter((b) => b.length).map((tris) => {
    const pos = [], nor = [], home = [], col = [];
    const mid = new THREE.Vector3();
    let n = 0;
    for (const tr of tris) for (const r of tr) mid.x += r[3], mid.y += r[4], mid.z += r[5], n++;
    mid.multiplyScalar(1 / n);
    const vtx = (p, r, nn, c) => {
      pos.push(p[0] - mid.x, p[1] - mid.y, p[2] - mid.z);
      nor.push(nn[0], nn[1], nn[2]);
      home.push(r[3], r[4], r[5]);
      col.push(r[9] * c, r[10] * c, r[11] * c);
    };
    const edges = new Map();
    for (const [a, b, c] of tris) {
      for (const r of [a, b, c]) vtx(top(r), r, [r[6], r[7], r[8]], 1); // the lumpy face, smooth
      const nb = flat(bot(a), bot(c), bot(b));
      for (const r of [a, c, b]) vtx(bot(r), r, nb, dark); // the face it was baked on
      for (const [u, w] of [[a, b], [b, c], [c, a]]) {
        const ku = keyOf(u), kw = keyOf(w);
        if (ku === kw) continue;
        const key = ku < kw ? `${ku}|${kw}` : `${kw}|${ku}`;
        edges.set(key, edges.has(key) ? null : [u, w]);
      }
    }
    for (const e of edges.values()) {
      if (!e) continue; // shared by two triangles: inside the plate
      const [u, w] = e;
      const ns = flat(top(u), bot(u), top(w));
      vtx(top(u), u, ns, dark * 1.4); vtx(bot(u), u, ns, dark); vtx(top(w), w, ns, dark * 1.4);
      vtx(top(w), w, ns, dark * 1.4); vtx(bot(u), u, ns, dark); vtx(bot(w), w, ns, dark);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute("aHome", new THREE.Float32BufferAttribute(home, 3));
    return { geometry: g, mid };
  });
}

/** The crust's material: lit like a solid, plus its own light from under the dish (relief), plus the jets' hits,
 *  and a dissolve that washes it away by patches (`uCrust` < 1). */
function crustMaterial() {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
  mat.userData.finish = false;
  const U = {
    uHits: { value: Array.from({ length: NJ }, () => new THREE.Vector4(0, -100, 0, 0)) },
    uGlow: { value: 1 }, uCrust: { value: 1 }, uHot: { value: new THREE.Color(BRAND.signal).lerp(new THREE.Color(0xffffff), 0.35) },
    uUnder: { value: new THREE.Vector3(-0.8, -0.3, 0.5).normalize() }, // grazing: the lumps cast their light and their shade
  };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec3 aHome; varying vec3 vHome;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvHome = aHome;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", /* glsl */ `#include <common>
        uniform vec4 uHits[${NJ}]; uniform float uGlow, uCrust; uniform vec3 uHot, uUnder; varying vec3 vHome;
        float sdHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float sdNoise(vec3 x) {
          vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(sdHash(i), sdHash(i + vec3(1, 0, 0)), f.x), mix(sdHash(i + vec3(0, 1, 0)), sdHash(i + vec3(1, 1, 0)), f.x), f.y),
                     mix(mix(sdHash(i + vec3(0, 0, 1)), sdHash(i + vec3(1, 0, 1)), f.x), mix(sdHash(i + vec3(0, 1, 1)), sdHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
        }`)
      .replace("#include <clipping_planes_fragment>", /* glsl */ `#include <clipping_planes_fragment>
        if (uCrust < 0.999) {
          float sdN = 0.65 * sdNoise(vHome * 0.42 + 3.0) + 0.35 * sdNoise(vHome * 1.4);
          if (sdN > uCrust * 1.15 - 0.08) discard;
        }`)
      .replace("#include <emissivemap_fragment>", /* glsl */ `#include <emissivemap_fragment>
        {
          vec3 sdL = normalize((viewMatrix * vec4(uUnder, 0.0)).xyz);
          float sdSh = clamp(dot(normal, sdL) * 0.5 + 0.5, 0.0, 1.0);
          float sdHit = 0.0;
          for (int i = 0; i < ${NJ}; i++) { vec2 dd = vHome.xz - uHits[i].xz; sdHit += uHits[i].w * exp(-dot(dd, dd) / 4.5); }
          sdHit = clamp(sdHit, 0.0, 1.4);
          totalEmissiveRadiance += vColor.rgb * uGlow * (0.18 + 0.95 * sdSh * sdSh) + uHot * sdHit * (0.45 + 0.6 * sdSh);
        }`);
  };
  mat.customProgramCacheKey = () => "sd-047-crust";
  return { mat, U };
}

/* ───────────────────────────────────────────── a soft dot for the lamp's halo and the splashes */
let DOT = null;
function softDot() {
  if (DOT) return DOT;
  if (typeof document === "undefined") return (DOT = null);
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.18, "rgba(255,255,255,0.6)");
  gr.addColorStop(0.5, "rgba(255,255,255,0.14)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  DOT = new THREE.CanvasTexture(c);
  return DOT;
}
function glint(color, k) {
  const mat = new THREE.SpriteMaterial({ map: softDot(), color: new THREE.Color(color).multiplyScalar(k), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false });
  const s = new THREE.Sprite(mat);
  s.renderOrder = 5;
  return s;
}

/* ═════════════════════════════════════════════════════════════ the dishwasher */

export function buildCuve() {
  const group = new THREE.Group();
  group.name = "cuve";
  const glasses = []; // every glass material: they fade with `shell`
  const panes = []; // every glass mesh: ONE shell
  const fams = []; // every family of lines: { mat, base, k } (k: follows shell or not)

  /* ── lines: segments collected by family, one mesh each ── */
  const seg = (list, a, b) => list.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const run = (list, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) seg(list, pts[i], pts[i + 1]);
    if (closed) seg(list, pts.at(-1), pts[0]);
  };
  const frame = (list, xa, xb, ya, yb, za, zb) => {
    for (const y of [ya, yb]) run(list, [[xa, y, za], [xb, y, za], [xb, y, zb], [xa, y, zb]], true);
    for (const [x, z] of [[xa, za], [xb, za], [xb, zb], [xa, zb]]) seg(list, [x, ya, z], [x, yb, z]);
  };
  const circle = (list, c, r, axis, n = 20) => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU, u = r * Math.cos(a), v = r * Math.sin(a);
      pts.push(axis === "x" ? [c[0], c[1] + u, c[2] + v] : axis === "z" ? [c[0] + u, c[1] + v, c[2]] : [c[0] + u, c[1], c[2] + v]);
    }
    run(list, pts, true);
  };
  const lines = (list, width, opacity, parent, shelled = true) => {
    if (!list.length) return null;
    const mat = lineMat(BRAND.ink, width, { opacity });
    const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(list), mat);
    mesh.renderOrder = 2;
    mesh.frustumCulled = false;
    parent.add(mesh);
    fams.push({ mat, base: opacity, shelled });
    return mesh;
  };
  const pane = (material, w, h, d, pos, parent = group, r = 0.2) => {
    const mesh = new THREE.Mesh(box(w, h, d, r), material);
    mesh.position.set(...pos);
    parent.add(mesh);
    panes.push(mesh);
    return mesh;
  };
  const mk = (o) => {
    const m = glass(BRAND.ink, o);
    glasses.push(m);
    return m;
  };
  // flat boards: almost nothing face-on (a veil over the dish otherwise), a lip on their edges
  const fxPanel = mk({ base: 0.002, rim: 0.1, power: 2.4, edge: 0.18, through: 0.2 });
  const fxTub = mk({ base: 0.002, rim: 0.13, power: 2.4, edge: 0.22, spec: 0.1, through: 0.22 }); // stainless, a hint of the softbox
  const fxDoor = mk({ base: 0.003, rim: 0.12, power: 2.2, edge: 0.22, through: 0.24 });
  const fxTube = mk({ base: 0.002, rim: 0.11, power: 2.6, edge: 0.16, spec: 0.08, through: 0.2 }); // round and small: the upper arm, its riser

  const S = [], F = [], W = []; // strong, fine, faint (the machine)

  /* ═════════════ 1 · THE CABINET and THE BASE ═════════════ */
  const T = 0.7;
  for (const sx of [-1, 1]) pane(fxPanel, T, DW.y1 - BASE.y1, DW.z1 - DW.z0, [sx * (DW.x1 - T / 2), (BASE.y1 + DW.y1) / 2, (DW.z0 + DW.z1) / 2]);
  pane(fxPanel, DW.x1 - DW.x0 - 2 * T, DW.y1 - BASE.y1, T, [0, (BASE.y1 + DW.y1) / 2, DW.z0 + T / 2]);
  frame(F, DW.x0, DW.x1, BASE.y1, DW.y1, DW.z0, DW.z1);
  // the base: lines only, faint — the circuit lives in it
  frame(W, DW.x0, DW.x1, 0.6, BASE.y1, DW.z0, DW.z1);
  for (const [x, z] of [[-26.5, -25.5], [26.5, -25.5], [-26.5, 24.5], [26.5, 24.5]]) {
    circle(W, [x, 0.3, z], 1.3, "y", 14);
    seg(W, [x, 0.3, z], [x, 2.6, z]);
  }
  run(W, [[DW.x0 + 1, 0.4, DOOR.z1 - 1.2], [DW.x1 - 1, 0.4, DOOR.z1 - 1.2], [DW.x1 - 1, DOOR.y0 - 0.3, DOOR.z1 - 1.2], [DW.x0 + 1, DOOR.y0 - 0.3, DOOR.z1 - 1.2]], true); // the kick plate

  /* ═════════════ 2 · THE TUB (stainless: walls of glass, a floor of lines) ═════════════ */
  const TT = 0.5;
  for (const sx of [-1, 1]) pane(fxTub, TT, TUB.y1 - TUB.y0, TUB.z1 - TUB.z0, [sx * (TUB.x1 + TT / 2), (TUB.y0 + TUB.y1) / 2, (TUB.z0 + TUB.z1) / 2]);
  pane(fxTub, TUB.x1 - TUB.x0, TUB.y1 - TUB.y0, TT, [0, (TUB.y0 + TUB.y1) / 2, TUB.z0 - TT / 2]);
  pane(fxTub, TUB.x1 - TUB.x0, TT, TUB.z1 - TUB.z0, [0, TUB.y1 + TT / 2, (TUB.z0 + TUB.z1) / 2]);
  // its edges: the back corners and the ceiling strong enough to say « a box », the front rim where the door seals
  frame(F, TUB.x0, TUB.x1, TUB.y0, TUB.y1, TUB.z0, TUB.z1);
  // the floor slopes to the sump: its outline, the dip around the micro filter, the creases that run into it
  const MF = FILTERS.micro;
  const dip = [[MF.x0 - 2, TUB.y0 - 0.35, MF.z0 - 2], [MF.x1 + 2, TUB.y0 - 0.35, MF.z0 - 2], [MF.x1 + 2, TUB.y0 - 0.35, Math.min(TUB.z1 - 1, MF.z1 + 2)], [MF.x0 - 2, TUB.y0 - 0.35, Math.min(TUB.z1 - 1, MF.z1 + 2)]];
  run(W, dip, true);
  for (const [corner, to] of [[[TUB.x0, TUB.y0, TUB.z0], dip[0]], [[TUB.x1, TUB.y0, TUB.z0], dip[1]], [[TUB.x1, TUB.y0, TUB.z1], dip[2]], [[TUB.x0, TUB.y0, TUB.z1], dip[3]], [[0, TUB.y0, TUB.z0], [0, TUB.y0 - 0.35, MF.z0 - 2]]]) seg(W, corner, to);
  // the rails the baskets roll on, along the side walls
  for (const sx of [-1, 1])
    for (const y of [RACK.y0 - 1.2, RACK2.y0 - 1.2]) {
      seg(F, [sx * (TUB.x1 - 0.2), y, TUB.z0 + 1], [sx * (TUB.x1 - 0.2), y, TUB.z1 - 0.5]);
      seg(W, [sx * (TUB.x1 - 0.2), y - 1.1, TUB.z0 + 1], [sx * (TUB.x1 - 0.2), y - 1.1, TUB.z1 - 0.5]);
    }

  /* ═════════════ 3 · THE BASKETS ═════════════ */
  const R = [], R2 = [], RG = []; // the lower basket's sides, the upper basket, the lower bottom grid (seen from under: faint)
  const basket = (B, list, grid, front, tines) => {
    const { x0, x1, z0, z1, y0, y1 } = B;
    // the bottom: a frame, sparse wires both ways (never a harrow)
    run(list, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], true);
    for (let x = x0 + 6.25; x < x1 - 1; x += 6.25) seg(grid, [x, y0, z0], [x, y0, z1]);
    for (let z = z0 + 7.8; z < z1 - 1; z += 7.8) seg(grid, [x0, y0, z], [x1, y0, z]);
    // the sides: a top rail (lower at the front), uprights
    const yf = front;
    run(list, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1 - 4], [x1, yf, z1], [x0, yf, z1], [x0, y1, z1 - 4]], true);
    for (let x = x0; x <= x1 + 0.01; x += 5) {
      seg(list, [x, y0, z0], [x, y1, z0]);
      if (Math.round((x - x0) / 5) % 2 === 0) seg(list, [x, y0, z1], [x, yf, z1]); // the front: half as many
    }
    for (const x of [x0, x1]) for (let z = z0 + 5; z < z1 - 4; z += 5) seg(list, [x, y0, z], [x, y1, z]);
    for (const x of [x0, x1]) run(list, [[x, (y0 + y1) / 2, z0], [x, (y0 + y1) / 2, z1 - 2]]);
    // the wheels on their rails
    for (const x of [x0 - 0.9, x1 + 0.9]) for (const z of [z0 + 4, z0 + 16, z1 - 16, z1 - 4]) circle(list, [x, y0 - 0.2, z], 1.3, "x", 14);
    // the tines: two fold-down rows, behind and in front of the dish, leaning back a little
    if (tines) for (const z of tines) for (let x = x0 + 3; x < x1 - 2; x += 3.6) seg(list, [x, y0, z], [x, y0 + 9.5, z - 1.4]);
  };
  basket(RACK, R, RG, RACK.y0 + 8, [RACK.z0 + 4.5]); // no tines in front: they would stand between the camera and the dish
  basket(RACK2, R2, R2, RACK2.y1 - 4, null);
  lines(R, 1.8, 0.3, group);
  lines(RG, 1.8, 0.15, group);
  lines(R2, 1.8, 0.13, group);
  const A_rack = anchor(group, 0, RACK.y0, 0);

  /* the upper arm (glass, it turns) and its riser up the back wall */
  const arm2 = new THREE.Group();
  arm2.position.set(...RACK2.arm);
  group.add(arm2);
  const a2 = pane(fxTube, 40, 1.3, 3.4, [0, 0, 0], arm2, 0.5);
  pane(fxTube, 3.6, 1.8, 3.6, [0, 0.4, 0], arm2, 0.8);
  const a2lines = [];
  run(a2lines, [[-20, -0.65, -1.7], [20, -0.65, -1.7], [20, -0.65, 1.7], [-20, -0.65, 1.7]], true);
  run(a2lines, [[-20, 0.65, -1.7], [20, 0.65, -1.7], [20, 0.65, 1.7], [-20, 0.65, 1.7]], true);
  lines(a2lines, 1.8, 0.16, arm2);
  void a2;
  const riser = [[0, TUB.y0 + 1, TUB.z0 + 1.6], [0, RACK2.arm[1] - 1.8, TUB.z0 + 1.6], [0, RACK2.arm[1] - 1.8, -1.5]];
  {
    const v = new THREE.Mesh(cyl(1.15, riser[1][1] - riser[0][1], 0.1, 20), fxTube);
    v.position.set(0, (riser[0][1] + riser[1][1]) / 2, riser[0][2]);
    const h = new THREE.Mesh(cyl(1.15, riser[2][2] - riser[1][2], 0.1, 20), fxTube);
    h.rotation.x = Math.PI / 2;
    h.position.set(0, riser[1][1], (riser[1][2] + riser[2][2]) / 2);
    group.add(v, h);
    panes.push(v, h);
    run(W, riser);
  }

  /* ═════════════ 4 · THE DOOR (it turns about its hinge, top toward +z) ═════════════ */
  const doorPivot = new THREE.Group();
  doorPivot.position.set(0, DOOR.hinge[0], DOOR.hinge[1]);
  group.add(doorPivot);
  const dp = (x, y, z) => [x, y - DOOR.hinge[0], z - DOOR.hinge[1]];
  const DS = [], DF = [];
  // the panel: an outer skin and the inner liner, the control strip on top
  pane(fxDoor, DOOR.x1 - DOOR.x0, DOOR.y1 - DOOR.y0, 1.2, dp(0, (DOOR.y0 + DOOR.y1) / 2, DOOR.z1 - 0.6), doorPivot, 0.4);
  pane(fxDoor, TUB.x1 - TUB.x0 - 1, 79 - TUB.y0 - 1, 1.0, dp(0, (TUB.y0 + 79) / 2, DOOR.z0 + 0.5), doorPivot, 0.4);
  pane(fxDoor, DOOR.x1 - DOOR.x0 - 0.4, 3, DOOR.z1 - DOOR.z0 - 0.4, dp(0, DOOR.y1 - 1.5, (DOOR.z0 + DOOR.z1) / 2), doorPivot, 0.5);
  {
    const { x0, x1, y0, y1, z0, z1 } = DOOR;
    const L = (x, y, z) => dp(x, y, z);
    for (const z of [z0, z1]) run(DS, [L(x0, y0, z), L(x1, y0, z), L(x1, y1, z), L(x0, y1, z)], true);
    for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) seg(DS, L(x, y, z0), L(x, y, z1));
    // the control strip: its seam under the top edge, a display, four buttons on the top face, the grip in front
    run(DF, [L(x0, y1 - 3, z1), L(x1, y1 - 3, z1)]);
    run(DF, [L(-6, y1, z0 + 1.2), L(6, y1, z0 + 1.2), L(6, y1, z0 + 3.4), L(-6, y1, z0 + 3.4)], true);
    for (const x of [10, 14, 18, 22]) {
      const pts = [];
      for (let i = 0; i < 12; i++) pts.push(L(x + 0.9 * Math.cos((i / 12) * TAU), y1, (z0 + z1) / 2 + 0.9 * Math.sin((i / 12) * TAU)));
      run(DF, pts, true);
    }
    run(DF, [L(-12, y1 - 1.6, z1), L(12, y1 - 1.6, z1)]);
    // the gasket where the door meets the tub, the inner liner's ridge
    run(DF, [L(TUB.x0 + 0.6, TUB.y0 + 0.6, z0), L(TUB.x1 - 0.6, TUB.y0 + 0.6, z0), L(TUB.x1 - 0.6, TUB.y1 - 0.6, z0), L(TUB.x0 + 0.6, TUB.y1 - 0.6, z0)], true);
    run(DF, [L(TUB.x0 + 3, TUB.y0 + 3, z0 - 0.05), L(TUB.x1 - 3, TUB.y0 + 3, z0 - 0.05)]);
  }
  lines(DS, 2.0, 0.62, doorPivot);
  lines(DF, 1.8, 0.3, doorPivot);
  // THE ECO LAMP: a small bezel, a veille core, a halo — a light with a place, on the top edge
  const lampAt = dp(...DOOR.lamp);
  const bezel = new THREE.Mesh(cyl(1.0, 0.5, 0.15, 24), solid(0x3a3835, { rough: 0.5, metal: 0.2 }));
  bezel.position.set(lampAt[0], DOOR.y1 - DOOR.hinge[0] - 0.2, lampAt[2]);
  const lampMat = glow(BRAND.veille, 0);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 10), lampMat);
  lamp.position.set(lampAt[0], DOOR.y1 - DOOR.hinge[0] + 0.05, lampAt[2]);
  const halo = glint(BRAND.veille, 1.1);
  halo.position.copy(lamp.position);
  halo.position.y += 0.4;
  halo.scale.setScalar(5.5);
  doorPivot.add(bezel, lamp, halo);

  lines(S, 2.0, 0.42, group);
  lines(F, 1.8, 0.26, group);
  lines(W, 1.8, 0.14, group);

  /* ═════════════ 5 · THE GRATIN DISH, upside down over the arm, and its crust ═════════════ */
  const dish = new THREE.Group();
  dish.name = "dish";
  dish.position.set(...DISH.centre);
  dish.rotation.x = TILT;
  group.add(dish);
  const flip = new THREE.Group(); // the dish's upright frame: its base at y 0, its opening up — turned over
  flip.position.y = DISH.base - DISH.centre[1];
  flip.rotation.x = Math.PI;
  dish.add(flip);
  const dishMat = solid(0xffffff, { rough: 0.5, metal: 0, coat: 0.2, coatRough: 0.45, env: 0.7, double: true });
  dishMat.vertexColors = true;
  dishMat.userData.finish = false; // glazed ceramic: no machining grain
  // its inside, turned to the floor, never sees the key: the light of the tub from under it (the same as the crust's)
  const UNDER = { uUnderK: { value: 0.45 }, uUnder: { value: new THREE.Vector3(-0.45, -0.7, 0.55).normalize() } };
  dishMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, UNDER);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aInner; varying float vInner;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvInner = aInner;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uUnderK; uniform vec3 uUnder; varying float vInner;")
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        { vec3 sdL = normalize((viewMatrix * vec4(uUnder, 0.0)).xyz); float sdSh = clamp(dot(normal, sdL) * 0.5 + 0.5, 0.0, 1.0);
          totalEmissiveRadiance += vColor.rgb * vInner * uUnderK * (0.1 + 0.9 * sdSh * sdSh); }`);
  };
  dishMat.customProgramCacheKey = () => "sd-047-dish";
  const body = toCreasedNormals(loft(DISH_PROFILE), 38 * DEG);
  const bodyMesh = new THREE.Mesh(body, dishMat);
  bodyMesh.castShadow = true;
  flip.add(bodyMesh);
  // the handles at the short ends, under the lip
  const handleMat = solid(0xa9a295, { rough: 0.5, metal: 0, coat: 0.2, coatRough: 0.45, env: 0.7 });
  handleMat.userData.finish = false;
  const DL = [];
  for (const sx of [-1, 1]) {
    const hg = box(4.2, 1.1, 9.5, 0.5);
    const h = new THREE.Mesh(hg, handleMat);
    h.position.set(sx * (DA + 1.3), 5.55, 0);
    flip.add(h);
    const e = edgesOf(hg, { color: BRAND.ink, width: 1.8, opacity: 0.4 });
    h.add(e);
  }
  // its edges: the lip, the foot, the inner edge of the lip
  for (const [o, y] of [[0.7, 5.95], [-2.0, 0.0], [-0.6, 6.05]]) run(DL, ring(DA + o, DB + o, DR + o).map(([x, z]) => [x, y, z]), true);
  const dishLines = lines(DL, 1.8, 0.45, flip, false);
  void dishLines;

  // the crust, in plates
  const { mat: crustMat, U: CU } = crustMaterial();
  const plates = crustPlates().map(({ geometry, mid }) => {
    const m = new THREE.Mesh(geometry, crustMat);
    m.castShadow = false;
    group.add(m);
    return { m, mid, restPos: new THREE.Vector3(), landPos: new THREE.Vector3(), restQ: new THREE.Quaternion(), peelQ: new THREE.Quaternion(), landQ: new THREE.Quaternion(), delay: 0, peel: 0 };
  });
  // where they rest (on the dish) and where they land (around the coarse filter, on the micro filter, under the arm)
  dish.updateMatrix();
  flip.updateMatrix();
  const M = new THREE.Matrix4().multiplyMatrices(dish.matrix, flip.matrix);
  const Minv = M.clone().invert();
  const Mq = new THREE.Quaternion().setFromRotationMatrix(M);
  const RL = rng(4701);
  const order = plates.map((p, i) => [Math.hypot(p.mid.x + 2, p.mid.z * 1.4) + RL() * 6, i]).sort((a, b) => a[0] - b[0]);
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), ax = new THREE.Vector3();
  order.forEach(([, i], n) => {
    const p = plates[i];
    p.restPos.copy(p.mid).applyMatrix4(M);
    p.restQ.copy(Mq);
    ax.set(RL() - 0.5, 0, RL() - 0.5).normalize();
    p.peelQ.copy(Mq).multiply(qa.setFromAxisAngle(ax, (5 + RL() * 6) * DEG));
    p.delay = 0.1 + 0.42 * (n / Math.max(1, plates.length - 1));
    // a heap around the coarse filter: a ring of places, lower ones first, nothing above y 16.7
    const ang = (n / plates.length) * TAU * 1.13 + RL() * 0.5;
    const rad = FILTERS.coarse.r + 2.6 + RL() * 3.2 + (n % 3) * 0.6;
    p.landPos.set(SUMP.x + rad * Math.cos(ang), FILTERS.micro.y + 0.32 + (n % 4) * 0.22, SUMP.z + rad * Math.sin(ang) * 0.85);
    p.landPos.z = Math.min(FILTERS.micro.z1 - 2, Math.max(FILTERS.micro.z0 + 1.5, p.landPos.z));
    const up = RL() < 0.55; // more than half land on their burnt face down… the others turned over, the orange up
    qb.setFromAxisAngle(ax.set(0, 1, 0), RL() * TAU);
    p.landQ.copy(qb).multiply(qa.setFromAxisAngle(ax.set(1, 0, 0), (up ? 0 : Math.PI) + (RL() - 0.5) * 10 * DEG));
  });

  // the splashes where the jets hit, the water that falls back off the crust
  const splashes = Array.from({ length: NJ }, () => {
    const s = glint(BRAND.ink, 1.25);
    s.visible = false;
    group.add(s);
    return s;
  });
  const NS = 34;
  const RS = rng(4702);
  const drops = Array.from({ length: NS }, () => {
    const u = new THREE.Vector3((RS() * 2 - 1) * (IN_A - 0.5), 1.3, (RS() * 2 - 1) * (IN_B - 0.5)).applyMatrix4(M);
    return { x: u.x, y: u.y, z: u.z, phase: RS(), len: 1.8 + RS() * 1.8, v: 38 + RS() * 18 };
  });
  const dropGeo = new LineSegmentsGeometry().setPositions(new Float32Array(NS * 6));
  dropGeo.setColors(new Float32Array(NS * 6));
  const dropMat = lineMat(0xffffff, 2.0, { opacity: 1, additive: true, vertexColors: true });
  const dropLines = new LineSegments2(dropGeo, dropMat);
  dropLines.renderOrder = 4;
  dropLines.frustumCulled = false;
  group.add(dropLines);
  const dropPos = dropGeo.attributes.instanceStart.data;
  const dropCol = dropGeo.attributes.instanceColorStart.data;
  const INK = new THREE.Color(BRAND.ink);

  /* ═════════════ 6 · THE GHOSTS: the sponge and the brush that are not there ═════════════ */
  const ghost = (meshes, pos, rot) => {
    const g = new THREE.Group();
    g.position.set(...pos);
    g.rotation.set(...rot);
    const mat = glass(BRAND.ink, { base: 0.006, rim: 0.5, power: 2.2, edge: 0.5, spec: 0.35, through: 0.2 });
    const edges = [];
    for (const [geo, p, r] of meshes) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(...p);
      if (r) m.rotation.set(...r);
      const e = edgesOf(geo, { color: BRAND.ink, width: 1.8, opacity: 0.5 });
      m.add(e);
      edges.push(e.material);
      g.add(m);
    }
    asShell(g.children, 12);
    group.add(g);
    return { g, mat, edges, y: pos[1] };
  };
  const sponge = ghost([[box(11, 3.2, 7, 1.1), [0, 0, 0]], [box(11, 1.1, 7, 0.35), [0, 2.2, 0]]], [-11, 43, 9], [0.15, 0.35, -0.12]);
  const brush = ghost([
    [lathe([[0, -11], [0.85, -11], [0.95, -9], [0.7, 4], [0.9, 6.5], [0, 6.5]], 24, { bevel: 0.15 }), [0, 0, 0]], // the handle
    [cyl(2.3, 1.6, 0.3, 32), [0, 7.3, 0]], // the head
    [lathe([[0, 0], [2.6, 0], [3.2, 2.4], [2.9, 3.1], [0, 3.4]], 32, { bevel: 0.2 }), [0, 8.1, 0]], // the bristles
  ], [10, 44.5, 5], [0.25, -0.4, 1.15]);

  /* ── one shell for the machine's glass ── */
  asShell(panes, 21);

  const A = {
    dish: anchor(dish, 0, 0, 0),
    crust: anchor(dish, 0, DISH.crust - DISH.centre[1], 0),
    door: anchor(doorPivot, 0, 60 - DOOR.hinge[0], DOOR.z1 - DOOR.hinge[1]),
    lamp,
    rack: A_rack,
    floor: anchor(group, 0, TUB.y0, 18),
  };

  const V = new THREE.Vector3();
  const fade = (G, a, gone) => {
    G.g.visible = a > 0.01;
    G.mat.uniforms.uAmount.value = a;
    for (let i = 0; i < G.edges.length; i++) G.edges[i].opacity = 0.5 * a;
    G.g.position.y = G.y - 1.5 * gone; // it sinks a little as it goes
  };
  return {
    group, A,
    update(P = {}, time = 0, px = 1) {
      const { shell = 1, door = 0, eco = 0, dish: dv = 1, crust = 1, crack = 0, ghosts = 0, jets = 0, turn = 0, mood = 1 } = P;
      /* the X-ray */
      for (const m of glasses) m.uniforms.uAmount.value = shell;
      for (const f of fams) f.mat.opacity = f.base * (f.shelled ? shell : 1) * (f.shelled ? 1 : dv > 0.01 ? 1 : 0);
      arm2.rotation.y = turn * TAU * 0.82;
      doorPivot.rotation.x = clamp01(door) * DOOR.open * DEG;
      /* the eco lamp */
      setGlow(lampMat, 1.9 * eco);
      halo.material.opacity = 0.55 * eco;
      halo.visible = eco > 0.01;
      /* the dish and its crust */
      const seen = dv > 0.01;
      dish.visible = seen;
      CU.uCrust.value = crust;
      CU.uGlow.value = (0.8 + 0.2 * jets) * (0.88 + 0.12 * mood);
      const open = smooth(ramp(crack, 0, 0.18));
      const scale = 1 - 0.045 * open;
      for (const p of plates) {
        const m = p.m;
        m.visible = seen && crust > 0.01;
        if (!m.visible) continue;
        const u = ramp(crack, p.delay, p.delay + 0.46);
        m.scale.setScalar(scale);
        if (u <= 0) {
          m.position.copy(p.restPos);
          m.quaternion.copy(p.restQ);
          continue;
        }
        const peel = smooth(ramp(u, 0, 0.22));
        const w = ramp(u, 0.22, 1);
        m.quaternion.slerpQuaternions(p.restQ, p.peelQ, peel);
        if (w > 0) m.quaternion.slerp(p.landQ, smooth(w));
        m.position.set(
          p.restPos.x + (p.landPos.x - p.restPos.x) * smooth(w),
          p.restPos.y - 0.5 * peel + (p.landPos.y - p.restPos.y + 0.5 * peel) * w * w,
          p.restPos.z + (p.landPos.z - p.restPos.z) * smooth(w),
        );
      }
      /* the jets' hits: where each jet of the arm meets the dish, in the dish's frame */
      const phi = -turn * TAU, c = Math.cos(phi), s = Math.sin(phi);
      const live = jets * (1 - 0.85 * open) * (seen ? 1 : 0);
      for (let i = 0; i < NJ; i++) {
        const x = JET[i][0], z = JET[i][1];
        V.set(ARM.hub[0] + x * c + z * s, DISH.crust - 0.4, ARM.hub[2] - x * s + z * c).applyMatrix4(Minv);
        const ex = IN_A - Math.abs(V.x), ez = IN_B - Math.abs(V.z), e = Math.min(ex, ez);
        const inside = Math.abs(V.x) < DA - 1.2 && Math.abs(V.z) < DB - 1.2;
        const amt = inside ? live * crust : 0;
        const yu = e >= 0 ? 1.25 : Math.min(5.2, 1.25 + -e * 2.3);
        CU.uHits.value[i].set(V.x, yu, V.z, amt);
        const sp = splashes[i];
        sp.visible = amt > 0.01;
        if (sp.visible) {
          sp.position.set(V.x, yu - 0.3, V.z).applyMatrix4(M);
          // a breathing splash, each its own beat (no flicker: slow, smooth)
          const breathe = 0.82 + 0.18 * Math.sin(time * 9 + i * 1.7);
          sp.scale.setScalar(2.4 * breathe * (0.6 + 0.4 * amt));
          sp.material.opacity = 0.8 * amt;
        }
      }
      /* the water that falls back: streaks from under the crust to the tub floor */
      const fall = jets * (seen ? 1 : 0);
      const pa = dropPos.array, ca = dropCol.array;
      for (let k = 0; k < NS; k++) {
        const d = drops[k];
        const range = d.y - (TUB.y0 + 0.4);
        const q = (time * d.v / range + d.phase) % 1;
        const y = d.y - q * range;
        const env = Math.sin(Math.PI * q) * fall;
        const o = k * 6;
        pa[o] = d.x; pa[o + 1] = y + d.len; pa[o + 2] = d.z;
        pa[o + 3] = d.x; pa[o + 4] = y; pa[o + 5] = d.z;
        const top = 0.08 * env, low = 0.85 * env;
        ca[o] = INK.r * top; ca[o + 1] = INK.g * top; ca[o + 2] = INK.b * top;
        ca[o + 3] = INK.r * low; ca[o + 4] = INK.g * low; ca[o + 5] = INK.b * low;
      }
      dropPos.needsUpdate = true;
      dropCol.needsUpdate = true;
      dropLines.visible = fall > 0.01;
      /* the ghosts: one sweep — the sponge (0 → 0.6), then the brush (0.45 → 1) */
      const ga = ramp(ghosts, 0, 0.15) * (1 - ramp(ghosts, 0.4, 0.6));
      const gb = ramp(ghosts, 0.45, 0.6) * (1 - ramp(ghosts, 0.85, 1));
      fade(sponge, ga, ramp(ghosts, 0.4, 0.6));
      fade(brush, gb, ramp(ghosts, 0.85, 1));
      void px;
    },
  };
}
