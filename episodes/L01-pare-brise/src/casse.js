// DOSSIER L01 — the FRACTURES: every way a glass breaks in this film, draped on the pane that breaks.
//
//   buildCasse() → { mount(name, root, onSurface), update(p, time, px) }
//
//   mount(name, root, onSurface)   world.js hands each pane once, at build time: its root (a PANE FRAME — see verre.js:
//                                  x across, y up the slant, z toward the inside) and its `onSurface(x, y, out, outN)`
//                                  (null: a flat pane, z = 0). Names: "hero" (the windshield), "side" (the side
//                                  window), "sample" (the 30 cm sample), "witness" (the tempered witness), "plain" (in
//                                  the car's windshield frame: the ORDINARY pane of before), "plainLine" (at the cut end)
//   update(p, time, px)            p = { web, rings, stick, webOn, webAt, grains, grainsOn, chip, creep, resin, bubble, nickel,
//                                        plain, blades, plainOn }   — each number's meaning is in world.js · FIRST;
//                                  webOn: "hero" | "sample" | "side" · webAt: "head" (in the car: IMPACT.head) | "test" (on the
//                                  test frame: IMPACT.test) — where the web starts on the windshield · grainsOn: "side" | "witness"
//                                  | "hero" · plainOn: "plain" | "plainLine"
//
// Where each fracture starts is plan.js · IMPACT (cm in the pane's plane): head (the hook, in the car), test (the 10 kg
// head on the frame), ball (the sample), chip (the gravel), side (the side window), witness.
//
// HOW EACH ONE IS DRAWN
//   · THE WEB (laminated: hero, sample, laminated side window). A seeded crack network, baked once per pane on its
//     surface: ~28 RADIALS that wander and fork, RINGS that join neighbouring radials (polygonal arcs, staggered, not
//     all present), a crushed STAR at the impact. Every crack is a camera-facing ribbon (never under 2.2 px, soft edges,
//     its own facet catching the key light: some radials flash, some stay dim), drawn in BOTH glasses (outer face and
//     inner face: the depth of the glass) and blended "brightest wins" (no bead at the joints). `web` pushes the radial
//     front out (a hot tip while it runs), `rings` closes the rings one after the other, innermost first. Between the
//     cracks, the SHARDS: one facet per cell, each tilted a hair, so the mosaic catches the light — and every shard stays
//     where it is. `stick` lights the FILM along every crack (veille, in the mid-plane) and washes the cells: it holds.
//   · THE GRAINS (tempered: side window, witness, the what-if windshield). A Voronoi of ≈ 0.75 cm cells (≥ 40 in any
//     5 cm square) computed in the shader from a seeded table of sites: the craze runs from the impact in a flash (a
//     bright front), then whitens. Seen from far, the lines melt into an even frost (fwidth): it never shimmers. On the
//     side window only, the grains DETACH (cell by cell, the top first, crumbs left in the frame) and fall as solid
//     grains; the witness keeps its grains in place (they are counted), the windshield goes white and stays.
//   · THE GRAVEL (`chip`), its star and bullseye on the OUTER glass only, the crack that RUNS from it by jolts (`creep`),
//     the RESIN that fills it veille and fades it (`resin`); the BUBBLE in the film and its halo of lifted film; the
//     grain of NICKEL SULFIDE in the core of the side window; the ORDINARY PANE of before, which goes to BLADES (signal).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { edgesOf } from "@kit/build3d.js";
import { IMPACT, WS, SIDE, DROP, PANE } from "./plan.js";

const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
/** The key light of the stage (from −x, +y, +z), in world space: what every facet glints against. */
const KEY = new THREE.Vector3(-0.55, 0.75, 0.6).normalize();
/** The bubble in the film: lower part of the windshield, passenger side of the centre, above the black band. */
const BUBBLE = [18, -30];

/* ───────────────────────────── the panes ───────────────────────────── */

// `face`: how far from the mid-plane the cracks lie (just proud of each glass face: verre.js draws 2 × 0.55 cm of
// glass around 0.3 cm of film — WS.drawn). `trap`: the windshield is a trapezoid (wTop at the top).
const FACE_LAM = WS.drawn.glass + WS.drawn.film / 2 + 0.05;
const FACE_ONE = 0.34;
const PANES = {
  hero: { w: WS.w, wTop: WS.wTop, h: WS.h, face: FACE_LAM },
  side: { w: SIDE.w, h: SIDE.h, face: FACE_ONE },
  sample: { w: DROP.sample, h: DROP.sample, face: FACE_LAM },
  witness: { w: PANE.witness, h: PANE.witness, face: FACE_ONE },
  plain: { w: PANE.plain[0], h: PANE.plain[1] },
  plainLine: { w: PANE.plain[0], h: PANE.plain[1] },
};
const halfW = (P, y) => THREE.MathUtils.lerp(P.w / 2, (P.wTop ?? P.w) / 2, clamp01(y / P.h + 0.5));
const insideOf = (P) => (x, y, m = 0) => Math.abs(y) <= P.h / 2 - m && Math.abs(x) <= halfW(P, y) - m;

/** A point of the pane at (x, y): on its surface, or on z = 0 for a flat pane. */
const placer = (surf) => (x, y, out, outN) => {
  if (surf) surf(x, y, out, outN);
  else {
    out.set(x, y, 0);
    outN.set(0, 0, 1);
  }
  return out;
};

/* ───────────────────────────── crack ribbons ───────────────────────────── */

// One shader for every crack. Per segment end: its surface point, the other end, the surface normal; `aR` the distance
// that the front must have reached (radials, creep), `aU` the position along a ring segment (rings), `aGate` when it
// may start (rings, star cracks), `aKind` 0 front-driven · 1 ring · 2 star, `aW` its width factor, `aSeed` its facet.
const CRACK_VS = /* glsl */ `
uniform float uPx, uMinPx, uWidth, uFace, uDent, uDentR;
attribute vec3 aOther, aN;
attribute float aSide, aAcross, aR, aU, aD, aGate, aKind, aW, aSeed;
varying float vAcross, vR, vU, vGate, vKind, vFade, vGlint;
void main() {
  float dn = uDent * exp(-aD * aD / max(uDentR * uDentR, 0.01));
  vec3 p = position + aN * (uFace - dn);
  vec3 q = aOther + aN * (uFace - dn);
  vec4 pv = modelViewMatrix * vec4(p, 1.0);
  vec3 qv = (modelViewMatrix * vec4(q, 1.0)).xyz;
  vec3 dir = qv - pv.xyz;
  dir /= max(length(dir), 1e-4);
  vec3 eye = pv.xyz / max(length(pv.xyz), 1e-4);
  vec3 perp = cross(dir, eye);
  perp /= max(length(perp), 1e-4);
  float pix = max(-pv.z, 0.1) / max(uPx, 1.0);
  float ww = uWidth * aW;
  float wd = max(ww, uMinPx * pix);
  vFade = clamp(ww / max(uMinPx * pix, 1e-4), 0.0, 1.0);
  pv.xyz += perp * (aSide * 0.5 * wd) - dir * (0.5 * wd);
  gl_Position = projectionMatrix * pv;
  // the facet of the crack (the crack runs through the glass: its plane holds the crack's direction and the normal)
  vec3 dW = mat3(modelMatrix) * (aOther - position);
  dW /= max(length(dW), 1e-4);
  vec3 nW = normalize(mat3(modelMatrix) * aN);
  float tilt = (aSeed - 0.5) * 1.5;
  vec3 c = cross(dW, nW);
  vec3 f = c * cos(tilt) + nW * sin(tilt);
  f /= max(length(f), 1e-4);
  vec3 wp = (modelMatrix * vec4(p, 1.0)).xyz;
  vec3 V = cameraPosition - wp;
  V /= max(length(V), 1e-4);
  vec3 L = normalize(vec3(${KEY.x.toFixed(4)}, ${KEY.y.toFixed(4)}, ${KEY.z.toFixed(4)}));
  vGlint = pow(clamp(abs(dot(reflect(-L, f), V)), 0.0, 1.0), 6.0);
  vAcross = aAcross; vR = aR; vU = aU; vGate = aGate; vKind = aKind;
}`;
const CRACK_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uAmount, uFront, uRings, uRingSpeed, uStar, uTip, uSoft, uPow, uBase, uGlintK, uDark;
varying float vAcross, vR, vU, vGate, vKind, vFade, vGlint;
void main() {
  float vis;
  if (vKind < 0.5) vis = 1.0 - smoothstep(uFront - 0.45, uFront, vR);
  else if (vKind < 1.5) {
    float t = (uRings - vGate) * uRingSpeed;
    vis = (1.0 - smoothstep(t - 0.06, t, vU)) * step(vR, uFront + 0.3);
  } else vis = smoothstep(vGate, vGate + 0.1, uStar);
  vis *= uAmount;
  if (vis < 0.002) discard;
  float a = clamp(abs(vAcross), 0.0, 1.0);
  float prof = pow(clamp(1.0 - smoothstep(uSoft, 1.0, a), 0.0, 1.0), uPow);
  if (uDark > 0.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, uDark * prof * vis); return; } // the shadow side: definition on a bright film
  float tip = vKind < 0.5 ? uTip * exp(-max(uFront - vR, 0.0) / 1.4) : 0.0;
  float k = (uBase + uGlintK * vGlint) * mix(0.72, 1.0, vFade) + tip * 1.5;
  gl_FragColor = vec4(uColor * (k * prof * vis), 1.0);
}`;

/** Shared by every crack material: the stage's pixel scale (set once per update). */
const PX = { value: 1500 };

function crackMaterial({ color = INK, width = 0.11, minPx = 2.2, face = 0, soft = 0.25, pow = 1, base = 0.55, glint = 1.4, order = 10 } = {}) {
  const m = new THREE.ShaderMaterial({
    vertexShader: CRACK_VS,
    fragmentShader: CRACK_FS,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation, // the brightest wins: segments overlap at every joint and must not add up there
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    uniforms: {
      uPx: PX,
      uMinPx: { value: minPx },
      uWidth: { value: width },
      uFace: { value: face },
      uDent: { value: 0 },
      uDentR: { value: 6 },
      uColor: { value: new THREE.Color(color) },
      uAmount: { value: 1 },
      uFront: { value: 0 },
      uRings: { value: 0 },
      uRingSpeed: { value: 6 },
      uStar: { value: 0 },
      uTip: { value: 0 },
      uSoft: { value: soft },
      uPow: { value: pow },
      uBase: { value: base },
      uGlintK: { value: glint },
      uDark: { value: 0 },
    },
  });
  m.userData.order = order;
  return m;
}

/**
 * Bakes crack segments into ribbon geometry on a pane. seg = { a:[x,y], b:[x,y], ra, rb, ua, ub, kind, gate, w, seed };
 * `c` the centre the dent is measured from; `xf(x, y)` → [x, y] an optional jitter of the plane (the second glass).
 */
function bakeCracks(segs, place, c, xf = null) {
  const n = segs.length;
  const V = n * 4;
  const A = (k) => new Float32Array(V * k);
  const pos = A(3), oth = A(3), nor = A(3), side = A(1), across = A(1), r = A(1), u = A(1), d = A(1), gate = A(1), kind = A(1), w = A(1), seed = A(1);
  const idx = new Uint32Array(n * 6);
  const pa = new THREE.Vector3(), na = new THREE.Vector3(), pb = new THREE.Vector3(), nb = new THREE.Vector3();
  segs.forEach((s, i) => {
    const [ax, ay] = xf ? xf(s.a[0], s.a[1]) : s.a;
    const [bx, by] = xf ? xf(s.b[0], s.b[1]) : s.b;
    place(ax, ay, pa, na);
    place(bx, by, pb, nb);
    const da = Math.hypot(ax - c[0], ay - c[1]);
    const db = Math.hypot(bx - c[0], by - c[1]);
    // A−, A+, B+, B− (B's stored side is flipped: its direction to the other end is reversed)
    const ends = [
      [pa, na, pb, -1, -1, s.ra, s.ua, da],
      [pa, na, pb, 1, 1, s.ra, s.ua, da],
      [pb, nb, pa, -1, 1, s.rb, s.ub, db],
      [pb, nb, pa, 1, -1, s.rb, s.ub, db],
    ];
    ends.forEach(([P, N, O, sd, ac, rr, uu, dd], k) => {
      const j = i * 4 + k;
      pos.set([P.x, P.y, P.z], j * 3);
      oth.set([O.x, O.y, O.z], j * 3);
      nor.set([N.x, N.y, N.z], j * 3);
      side[j] = sd;
      across[j] = ac;
      r[j] = rr;
      u[j] = uu;
      d[j] = dd;
      gate[j] = s.gate;
      kind[j] = s.kind;
      w[j] = s.w;
      seed[j] = s.seed;
    });
    idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aOther", new THREE.BufferAttribute(oth, 3));
  g.setAttribute("aN", new THREE.BufferAttribute(nor, 3));
  for (const [name, arr] of Object.entries({ aSide: side, aAcross: across, aR: r, aU: u, aD: d, aGate: gate, aKind: kind, aW: w, aSeed: seed }))
    g.setAttribute(name, new THREE.BufferAttribute(arr, 1));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  return g;
}

/** Pushes a polyline [{x, y, r, u}] as segments. */
function pushLine(segs, pts, o) {
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    segs.push({
      a: [a.x, a.y], b: [b.x, b.y], ra: a.r, rb: b.r, ua: a.u ?? 0, ub: b.u ?? 0,
      kind: o.kind, gate: o.gate ?? 0, seed: Math.min(1, Math.max(0, (o.seed ?? 0.5) + (o.jit ?? 0) * (((i * 0.6180339) % 1) - 0.5))),
      w: typeof o.w === "function" ? o.w((a.r + b.r) / 2) : o.w ?? 1,
    });
  }
}
const angDiff = (a, b) => {
  let d = a - b;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  return d;
};

/* ───────────────────────────── the web ───────────────────────────── */

/**
 * The crack network of a laminated glass struck at `c`. rings[0] is the edge of the crushed star; radials run out to
 * `R` at most (each its own length), clipped by the pane. Returns { segs, cells, star } in the pane's plane.
 */
function makeWeb(seed, { c, R, rings, nRad, inside, branch = 0.55 }) {
  const rnd = rng(seed);
  const [cx, cy] = c;
  const rOf = (x, y) => Math.hypot(x - cx, y - cy);
  const K = rings.length;
  const star = rings[0];
  const segs = [];
  const base = rnd() * TAU;
  const rads = [];
  for (let i = 0; i < nRad; i++) {
    const a0 = base + ((i + (rnd() - 0.5) * 0.75) / nRad) * TAU;
    const L = Math.max(rings[K - 1] * 1.15, R * (0.42 + 0.58 * rnd()));
    let x = cx + Math.cos(a0) * star * 0.3;
    let y = cy + Math.sin(a0) * star * 0.3;
    let a = a0;
    const pts = [{ x, y, r: rOf(x, y) }];
    for (let guard = 0; guard < 400; guard++) {
      const r = rOf(x, y);
      if (r >= L) break;
      const step = 0.5 + r * 0.075;
      const radA = Math.atan2(y - cy, x - cx);
      a += (rnd() - 0.5) * 0.3 + angDiff(radA, a) * 0.16;
      if (rnd() < 0.09) a += (rnd() - 0.5) * 0.7; // a kink
      const nx = x + Math.cos(a) * step;
      const ny = y + Math.sin(a) * step;
      if (!inside(nx, ny, 0.8)) break;
      x = nx;
      y = ny;
      pts.push({ x, y, r: rOf(x, y) });
    }
    rads.push({ pts, a0, seed: rnd() });
  }
  rads.sort((p, q) => p.a0 - q.a0);
  const Rmax = Math.max(...rads.map((q) => q.pts[q.pts.length - 1].r));
  const taper = (r) => 1.35 - 0.6 * Math.min(1, r / Rmax);
  for (const q of rads) pushLine(segs, q.pts, { kind: 0, w: taper, seed: q.seed, jit: 0.15 });

  /** The point where radial i crosses radius ρ (first crossing), or null. */
  const at = (i, rho) => {
    const pts = rads[i].pts;
    for (let k = 0; k + 1 < pts.length; k++) {
      const p = pts[k], q = pts[k + 1];
      if (p.r <= rho && q.r >= rho) {
        const t = (rho - p.r) / Math.max(1e-6, q.r - p.r);
        return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, r: rho };
      }
    }
    return null;
  };
  /** The radial i's own points strictly between radii r0 and r1, outward. */
  const between = (i, r0, r1) => rads[i].pts.filter((p) => p.r > r0 && p.r < r1);

  /* branches: a few radials fork in their outer part */
  for (const q of rads) {
    if (rnd() > branch || q.pts.length < 8) continue;
    const startK = Math.floor(q.pts.length * (0.45 + 0.35 * rnd()));
    const s = q.pts[startK];
    if (s.r < rings[Math.min(2, K - 1)]) continue;
    const prev = q.pts[startK - 1];
    let a = Math.atan2(s.y - prev.y, s.x - prev.x) + (rnd() < 0.5 ? -1 : 1) * (0.32 + 0.35 * rnd());
    let x = s.x, y = s.y;
    const L = s.r + (Rmax - s.r) * (0.25 + 0.45 * rnd());
    const pts = [{ x, y, r: s.r }];
    for (let guard = 0; guard < 200; guard++) {
      const r = rOf(x, y);
      if (r >= L) break;
      a += (rnd() - 0.5) * 0.24;
      const step = 0.5 + r * 0.07;
      const nx = x + Math.cos(a) * step, ny = y + Math.sin(a) * step;
      if (!inside(nx, ny, 0.8) || rOf(nx, ny) < r) break;
      x = nx;
      y = ny;
      pts.push({ x, y, r: rOf(x, y) });
    }
    if (pts.length > 2) pushLine(segs, pts, { kind: 0, w: (r) => 0.75 * taper(r), seed: rnd(), jit: 0.2 });
  }

  /* rings: polygonal arcs between neighbouring radials, staggered; ring 0 is the edge of the crushed star */
  const ringSeg = rads.map(() => []);
  for (let k = 0; k < K; k++) {
    const rho = rings[k];
    const present = k === 0 ? 0.85 : 0.99 - 0.36 * (k / (K - 1));
    for (let i = 0; i < nRad; i++) {
      const j = (i + 1) % nRad;
      const fa = k === 0 ? 1 : 1 + (rnd() - 0.5) * 0.14;
      const fb = k === 0 ? 1 : 1 + (rnd() - 0.5) * 0.14;
      const A = at(i, rho * fa);
      const B = at(j, rho * fb);
      const drawn = rnd() < present;
      if (!A || !B) continue;
      const tA = Math.atan2(A.y - cy, A.x - cx);
      let tB = Math.atan2(B.y - cy, B.x - cx);
      while (tB < tA) tB += TAU;
      if (tB - tA > Math.PI * 0.8) continue;
      const bulge = (rnd() - 0.35) * 0.09;
      const m = 4;
      const pts = [{ x: A.x, y: A.y, r: rho, u: 0 }];
      let ok = true;
      for (let s = 1; s <= m; s++) {
        const t = s / (m + 1);
        const th = tA + (tB - tA) * t;
        const rr = (A.r + (B.r - A.r) * t) * (1 + bulge * Math.sin(Math.PI * t)) + (rnd() - 0.5) * 0.035 * rho;
        const x = cx + Math.cos(th) * rr, y = cy + Math.sin(th) * rr;
        if (!inside(x, y, 0.5)) ok = false;
        pts.push({ x, y, r: rho, u: t });
      }
      pts.push({ x: B.x, y: B.y, r: rho, u: 1 });
      if (!ok) continue;
      if (rnd() < 0.5) pts.forEach((p) => (p.u = 1 - p.u)); // it grows from either radial
      const gate = k === 0 ? 0 : ((k - 1) / Math.max(1, K - 1)) * 0.8 + rnd() * 0.1;
      const rec = { k, pts, rA: A.r, rB: B.r, gate, drawn, seed: rnd() };
      ringSeg[i].push(rec);
      if (drawn) pushLine(segs, pts, { kind: 1, gate, w: k === 0 ? 0.7 : 1.05, seed: rec.seed, jit: 0.1 });
    }
  }

  /* the cells (the shards): between two present rings of a sector; ring 0 is always a boundary (the star's edge) */
  const cells = [];
  const starPoly = [];
  for (let i = 0; i < nRad; i++) {
    const j = (i + 1) % nRad;
    let list = ringSeg[i].filter((s) => s.k === 0 || s.drawn).sort((p, q) => p.k - q.k);
    if (!list.length || list[0].k !== 0) {
      const A = at(i, star), B = at(j, star);
      if (!A || !B) continue;
      list = [{ k: 0, pts: [{ x: A.x, y: A.y }, { x: B.x, y: B.y }], rA: star, rB: star, gate: 0 }, ...list.filter((s) => s.k !== 0)];
    }
    starPoly.push(...list[0].pts.slice(0, -1));
    for (let s = 0; s + 1 < list.length; s++) {
      const lo = list[s], hi = list[s + 1];
      const poly = [
        ...lo.pts.slice(0, 1),
        ...between(i, lo.rA, hi.rA),
        ...hi.pts,
        ...between(j, lo.rB, hi.rB).reverse(),
        ...lo.pts.slice(1).reverse(),
      ];
      cells.push({ poly, gate: hi.gate, rOut: Math.max(hi.rA, hi.rB), seed: rnd() });
    }
  }

  /* the crushed star: short cracks packed in the first ring */
  for (let s = 0; s < 46; s++) {
    const rr = star * Math.sqrt(rnd()) * 1.05;
    const th = rnd() * TAU;
    const x = cx + Math.cos(th) * rr, y = cy + Math.sin(th) * rr;
    const dir = th + (rnd() - 0.5) * 1.6;
    const len = star * (0.15 + 0.3 * rnd());
    const x2 = x + Math.cos(dir) * len, y2 = y + Math.sin(dir) * len;
    pushLine(segs, [{ x, y, r: rOf(x, y) }, { x: x2, y: y2, r: rOf(x2, y2) }], { kind: 2, gate: (rr / star) * 0.55 + rnd() * 0.3, w: 0.55, seed: rnd() });
  }
  return { segs, cells, star: starPoly, Rmax, c };
}

/* the shards: one facet per cell */
const SHARD_VS = /* glsl */ `
attribute float aSeed, aGate, aROut, aStar;
uniform float uFace, uDent, uDentR;
attribute float aD;
varying float vSeed, vGate, vROut, vStar, vSpec;
void main() {
  float dn = uDent * exp(-aD * aD / max(uDentR * uDentR, 0.01));
  vec3 p = position + normal * (uFace - dn);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * viewMatrix * wp;
  vec3 nW = normalize(mat3(modelMatrix) * normal);
  // each shard is tilted a hair, its own way: the mosaic catches the key light shard by shard
  vec3 t1 = normalize(cross(nW, abs(nW.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
  vec3 t2 = cross(nW, t1);
  float a = aSeed * 6.2831853;
  vec3 n = normalize(nW + (t1 * cos(a) + t2 * sin(a)) * (0.06 + 0.1 * fract(aSeed * 7.31)));
  vec3 V = normalize(cameraPosition - wp.xyz);
  vec3 L = normalize(vec3(${KEY.x.toFixed(4)}, ${KEY.y.toFixed(4)}, ${KEY.z.toFixed(4)}));
  vSpec = pow(clamp(abs(dot(reflect(-L, n), V)), 0.0, 1.0), 18.0);
  vSeed = aSeed; vGate = aGate; vROut = aROut; vStar = aStar;
}`;
const SHARD_FS = /* glsl */ `
uniform vec3 uInk, uVeille;
uniform float uAmount, uFront, uRings, uRingSpeed, uStar, uStick;
varying float vSeed, vGate, vROut, vStar, vSpec;
void main() {
  float vis = vStar > 0.5 ? smoothstep(0.0, 0.6, uStar) : smoothstep(0.0, 1.0, (uRings - vGate) * uRingSpeed - 0.6) * step(vROut, uFront + 0.3);
  vis *= uAmount;
  if (vis < 0.002) discard;
  float shade = fract(vSeed * 13.7);
  vec3 col; float a;
  if (vStar > 0.5) { col = uInk * 0.62; a = 0.62; }                 // crushed: white, powdery
  else {
    float s2 = shade * shade;
    col = uInk * (0.04 + 0.16 * s2 + 1.1 * vSpec) + uVeille * (0.1 * uStick);
    a = 0.015 + 0.13 * s2 + 0.5 * vSpec + 0.06 * uStick;
  }
  gl_FragColor = vec4(col, clamp(a, 0.0, 0.9) * vis);
}`;

function bakeShards(web, place, xf = null) {
  const pos = [], nor = [], seed = [], gate = [], rout = [], star = [], dd = [];
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  const [cx, cy] = web.c;
  const put = (x, y, s, g, ro, st) => {
    const [px, py] = xf ? xf(x, y) : [x, y];
    place(px, py, v, n);
    pos.push(v.x, v.y, v.z);
    nor.push(n.x, n.y, n.z);
    seed.push(s);
    gate.push(g);
    rout.push(ro);
    star.push(st);
    dd.push(Math.hypot(px - cx, py - cy));
  };
  const fan = (poly, s, g, ro, st) => {
    let mx = 0, my = 0;
    for (const p of poly) {
      mx += p.x;
      my += p.y;
    }
    mx /= poly.length;
    my /= poly.length;
    for (let k = 0; k < poly.length; k++) {
      const a = poly[k], b = poly[(k + 1) % poly.length];
      put(mx, my, s, g, ro, st);
      put(a.x, a.y, s, g, ro, st);
      put(b.x, b.y, s, g, ro, st);
    }
  };
  for (const c of web.cells) if (c.poly.length >= 3) fan(c.poly, c.seed, c.gate, c.rOut, 0);
  if (web.star.length >= 3) fan(web.star, 0.5, 0, 0, 1);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
  g.setAttribute("aGate", new THREE.Float32BufferAttribute(gate, 1));
  g.setAttribute("aROut", new THREE.Float32BufferAttribute(rout, 1));
  g.setAttribute("aStar", new THREE.Float32BufferAttribute(star, 1));
  g.setAttribute("aD", new THREE.Float32BufferAttribute(dd, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  return g;
}
function shardMaterial(face) {
  const m = new THREE.ShaderMaterial({
    vertexShader: SHARD_VS,
    fragmentShader: SHARD_FS,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uFace: { value: face }, uDent: { value: 0 }, uDentR: { value: 6 },
      uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() },
      uAmount: { value: 1 }, uFront: { value: 0 }, uRings: { value: 0 }, uRingSpeed: { value: 6 }, uStar: { value: 0 }, uStick: { value: 0 },
    },
  });
  return m;
}

/** The dark edge under a set of cracks (normal blending): what keeps them readable on lit glass. */
function darkUnder(geo, face, { width = 0.3, minPx = 4.2, amount = 0.42 } = {}) {
  const mat = crackMaterial({ face, width, minPx, soft: 0, pow: 1.5 });
  Object.assign(mat, { blending: THREE.NormalBlending, blendEquation: THREE.AddEquation });
  mat.uniforms.uDark.value = amount;
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = 9;
  m.frustumCulled = false;
  return m;
}

/** A whole web on a pane: shards, film halo (mid-plane), cracks in both glasses. Returns { group, set(web, rings, stick, k) }. */
function buildWebView(web, place, { face, dent, dentR }) {
  const group = new THREE.Group();
  const rot = (1.4 * Math.PI) / 180;
  const [cx, cy] = web.c;
  // the second glass: the same network, turned 1.4° about the impact and spread 1.5 %: the depth of the pane
  const xf = (x, y) => {
    const dx = (x - cx) * 1.015, dy = (y - cy) * 1.015;
    return [cx + dx * Math.cos(rot) - dy * Math.sin(rot), cy + dx * Math.sin(rot) + dy * Math.cos(rot)];
  };
  const gIn = bakeCracks(web.segs, place, web.c);
  const gOut = bakeCracks(web.segs, place, web.c, xf);
  const shards = new THREE.Mesh(bakeShards(web, place, xf), shardMaterial(-face));
  const halo = new THREE.Mesh(gIn, crackMaterial({ color: VEILLE, width: 0.32, minPx: 3.6, face: 0, soft: 0, pow: 2.2, base: 1, glint: 0 }));
  const inner = new THREE.Mesh(gIn, crackMaterial({ face }));
  const outer = new THREE.Mesh(gOut, crackMaterial({ face: -face }));
  // under the bright cores, a soft dark edge (normal blending): the cracks keep their line on the lit film
  const darkMat = crackMaterial({ face: -face, width: 0.3, minPx: 4.2, soft: 0, pow: 1.5 });
  Object.assign(darkMat, { blending: THREE.NormalBlending, blendEquation: THREE.AddEquation });
  darkMat.uniforms.uDark.value = 0.42;
  const dark = new THREE.Mesh(gOut, darkMat);
  dark.renderOrder = 9;
  shards.renderOrder = 8;
  halo.renderOrder = 9;
  inner.renderOrder = outer.renderOrder = 10;
  for (const o of [shards, dark, halo, inner, outer]) o.frustumCulled = false;
  group.add(shards, dark, halo, inner, outer);
  const cracks = [inner, outer, dark];
  return {
    group,
    set(w, rings, stick) {
      const e = 1 - Math.pow(1 - clamp01(w), 2.2);
      const front = web.Rmax * e + 0.01;
      const star = smooth(0, 0.12, w);
      const tip = w > 0.003 && w < 0.999 ? 1 - smooth(0.6, 1, w) : 0;
      const dn = dent * smooth(0, 0.3, w);
      for (const m of cracks) {
        const u = m.material.uniforms;
        u.uFront.value = front;
        u.uRings.value = rings;
        u.uStar.value = star;
        u.uTip.value = tip;
        u.uDent.value = dn;
        u.uDentR.value = dentR;
      }
      // the film: along every crack (veille), only where the crack already is
      const hu = halo.material.uniforms;
      halo.visible = stick > 0.003;
      hu.uFront.value = front;
      hu.uRings.value = rings;
      hu.uStar.value = star;
      hu.uDent.value = dn * 0.5;
      hu.uDentR.value = dentR;
      hu.uAmount.value = 0.6 * clamp01(stick);
      const su = shards.material.uniforms;
      su.uFront.value = front;
      su.uRings.value = rings;
      su.uStar.value = star;
      su.uStick.value = clamp01(stick);
      su.uDent.value = dn;
      su.uDentR.value = dentR;
    },
  };
}

/* ───────────────────────────── the grains (tempered) ───────────────────────────── */

const GRAIN = 0.75; // cm: ≈ 44 cells in a 5 cm square (R43: ≥ 40)
const GRAINS_VS = /* glsl */ `
uniform float uFace;
attribute vec2 aXY;
varying vec2 vXY;
void main() {
  vXY = aXY;
  vec3 p = position + normal * uFace;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const GRAINS_FS = /* glsl */ `
uniform sampler2D uSites;
uniform vec2 uN, uOrigin, uImpact;
uniform float uCell, uFrontR, uFrontGlow, uWhite, uFall, uAmount, uMinPx, uLineW, uAlpha;
uniform vec3 uInk;
varying vec2 vXY;
vec4 site(ivec2 c) { return texelFetch(uSites, clamp(c, ivec2(0), ivec2(uN) - 1), 0); }
vec2 cpos(ivec2 c) { ivec2 k = clamp(c, ivec2(0), ivec2(uN) - 1); return vec2(k) + site(k).xy; }
void main() {
  float d0 = distance(vXY, uImpact);
  if (d0 > uFrontR) discard;
  vec2 g = (vXY - uOrigin) / uCell;
  ivec2 ci = ivec2(floor(g));
  float md = 1e4; vec2 mr = vec2(0.0); ivec2 mc = ci;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    ivec2 c = ci + ivec2(i, j);
    vec2 r = cpos(c) - g;
    float d = dot(r, r);
    if (d < md) { md = d; mr = r; mc = clamp(c, ivec2(0), ivec2(uN) - 1); }
  }
  float ed = 1e4;
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
    ivec2 c = clamp(mc + ivec2(i, j), ivec2(0), ivec2(uN) - 1);
    vec2 r = cpos(c) - g;
    vec2 dd = r - mr;
    float l2 = dot(dd, dd);
    if (l2 > 1e-5) ed = min(ed, dot(0.5 * (mr + r), dd * inversesqrt(l2)));
  }
  vec4 ms = site(mc);
  if (ms.z < uFall) discard; // that grain has gone
  float fw = max(length(fwidth(g)), 1e-4);
  float lw = max(uLineW / uCell, uMinPx * fw * 0.5);
  float line = 1.0 - smoothstep(lw - 0.5 * fw, lw + 0.5 * fw, ed);
  float far = smoothstep(0.14, 0.5, fw);
  line = mix(line, 0.42, far); // seen from far: an even frost, never a shimmer
  float shade = ms.w;
  float front = uFrontGlow * exp(-max(uFrontR - d0, 0.0) / 1.6);
  float crush = 1.0 - smoothstep(0.6, 1.8, d0);
  vec3 col = uInk * ((0.10 + 0.16 * shade) * uWhite + line * (0.55 + 0.6 * uWhite) + front * 1.6 + crush * 0.5);
  float a = uWhite * (0.22 + 0.2 * shade) * uAlpha + line * 0.7 + front * 0.6 + crush * 0.5;
  gl_FragColor = vec4(col, clamp(a, 0.0, 0.96) * uAmount);
}`;

/** The table of sites (one per cell of a GRAIN grid): xy their place in the cell, z when it falls (9: never), w its shade. */
function makeSites(seed, P, { fall }) {
  const nx = Math.ceil(P.w / GRAIN) + 1;
  const ny = Math.ceil(P.h / GRAIN) + 1;
  const rnd = rng(seed);
  const data = new Float32Array(nx * ny * 4);
  const origin = [-P.w / 2 - GRAIN * 0.5, -P.h / 2 - GRAIN * 0.5];
  const inside = insideOf(P);
  const falling = [];
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const k = (j * nx + i) * 4;
      const sx = 0.18 + 0.64 * rnd();
      const sy = 0.18 + 0.64 * rnd();
      const x = origin[0] + (i + sx) * GRAIN;
      const y = origin[1] + (j + sy) * GRAIN;
      let t = 9;
      if (fall && inside(x, y, 0)) {
        const edge = !inside(x, y, 1.3);
        const yN = clamp01(y / P.h + 0.5);
        t = edge && rnd() < 0.5 ? 9 : 0.5 + 0.17 * rnd() + 0.09 * (1 - yN); // the top first; crumbs stay in the frame
        if (t < 2) falling.push(x, y, t, rnd(), rnd(), rnd(), rnd());
      }
      data[k] = sx;
      data[k + 1] = sy;
      data[k + 2] = t;
      data[k + 3] = rnd();
    }
  const tex = new THREE.DataTexture(data, nx, ny, THREE.RGBAFormat, THREE.FloatType);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return { tex, nx, ny, origin, falling };
}

/** The pane's own shape as a grid on its surface (with its plane coordinates in `aXY`). */
function paneGrid(P, place, nu = 48, nv = 32) {
  const pos = [], nor = [], xy = [], idx = [];
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  for (let j = 0; j <= nv; j++)
    for (let i = 0; i <= nu; i++) {
      const y = (j / nv - 0.5) * P.h;
      const x = (i / nu - 0.5) * 2 * halfW(P, y);
      place(x, y, v, n);
      pos.push(v.x, v.y, v.z);
      nor.push(n.x, n.y, n.z);
      xy.push(x, y);
    }
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i;
      idx.push(a, a + 1, a + nu + 2, a, a + nu + 2, a + nu + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("aXY", new THREE.Float32BufferAttribute(xy, 2));
  g.setIndex(idx);
  return g;
}

const FALL_VS = /* glsl */ `
attribute vec2 aSite;
attribute float aT;
attribute vec4 aRnd;
uniform float uFall, uCell, uThick, uG;
uniform vec3 uDown;
varying vec3 vN;
varying float vShade;
mat3 rotAxis(vec3 a, float t) {
  float c = cos(t), s = sin(t), k = 1.0 - c;
  return mat3(c + a.x * a.x * k, a.y * a.x * k + a.z * s, a.z * a.x * k - a.y * s,
              a.x * a.y * k - a.z * s, c + a.y * a.y * k, a.z * a.y * k + a.x * s,
              a.x * a.z * k + a.y * s, a.y * a.z * k - a.x * s, c + a.z * a.z * k);
}
void main() {
  float tau = uFall - aT;
  vN = vec3(0.0, 0.0, 1.0); vShade = aRnd.w;
  if (tau <= 0.0 || tau > 0.75) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
  vec3 ax = aRnd.xyz - 0.5;
  ax /= max(length(ax), 1e-3);
  mat3 R = rotAxis(ax, tau * (5.0 + 9.0 * aRnd.w));
  vec3 sz = vec3(uCell * (0.72 + 0.22 * aRnd.x), uCell * (0.72 + 0.22 * aRnd.y), uThick);
  vec3 lp = R * (position * sz);
  vec3 c = vec3(aSite, 0.0) + uDown * (0.5 * uG * tau * tau) + vec3(0.0, 0.0, 1.0) * (aRnd.z - 0.45) * 26.0 * tau;
  vec4 wp = modelMatrix * vec4(c + lp, 1.0);
  gl_Position = projectionMatrix * viewMatrix * wp;
  vN = normalize(mat3(modelMatrix) * (R * normal));
}`;
const FALL_FS = /* glsl */ `
uniform vec3 uInk;
varying vec3 vN;
varying float vShade;
void main() {
  vec3 L = normalize(vec3(${KEY.x.toFixed(4)}, ${KEY.y.toFixed(4)}, ${KEY.z.toFixed(4)}));
  float diff = abs(dot(normalize(vN), L));
  gl_FragColor = vec4(uInk * (0.12 + 0.5 * diff + 0.14 * vShade), 1.0);
}`;

/** The craze of a tempered pane (two faces) and, if it falls, its falling grains. */
function buildGrainsView(seed, P, place, { fall }) {
  const S = makeSites(seed, P, { fall });
  const geo = paneGrid(P, place);
  const mk = (face) => {
    const m = new THREE.Mesh(
      geo,
      new THREE.ShaderMaterial({
        vertexShader: GRAINS_VS,
        fragmentShader: GRAINS_FS,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uFace: { value: face }, uSites: { value: S.tex }, uN: { value: new THREE.Vector2(S.nx, S.ny) },
          uOrigin: { value: new THREE.Vector2(...S.origin) }, uImpact: { value: new THREE.Vector2() }, uCell: { value: GRAIN },
          uFrontR: { value: 0 }, uFrontGlow: { value: 0 }, uWhite: { value: 0 }, uFall: { value: 0 }, uAmount: { value: 1 },
          uMinPx: { value: 2.2 }, uLineW: { value: 0.035 }, uAlpha: { value: 1 }, uInk: { value: INK.clone() },
        },
      }),
    );
    m.renderOrder = 9;
    m.frustumCulled = false;
    return m;
  };
  const group = new THREE.Group();
  const faces = [mk(P.face), mk(-P.face)];
  group.add(...faces);
  let falling = null;
  if (fall && S.falling.length) {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const ig = new THREE.InstancedBufferGeometry();
    ig.index = box.index;
    ig.setAttribute("position", box.attributes.position);
    ig.setAttribute("normal", box.attributes.normal);
    const n = S.falling.length / 7;
    const site = new Float32Array(n * 2), t = new Float32Array(n), r4 = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      const f = S.falling.slice(i * 7, i * 7 + 7);
      site.set([f[0], f[1]], i * 2);
      t[i] = f[2];
      r4.set([f[3], f[4], f[5], f[6]], i * 4);
    }
    ig.setAttribute("aSite", new THREE.InstancedBufferAttribute(site, 2));
    ig.setAttribute("aT", new THREE.InstancedBufferAttribute(t, 1));
    ig.setAttribute("aRnd", new THREE.InstancedBufferAttribute(r4, 4));
    ig.instanceCount = n;
    falling = new THREE.Mesh(
      ig,
      new THREE.ShaderMaterial({
        vertexShader: FALL_VS,
        fragmentShader: FALL_FS,
        uniforms: { uFall: { value: 0 }, uCell: { value: GRAIN }, uThick: { value: 0.42 }, uG: { value: 900 }, uDown: { value: new THREE.Vector3(0, -1, 0) }, uInk: { value: INK.clone() } },
      }),
    );
    falling.frustumCulled = false;
    group.add(falling);
  }
  const maxR = Math.hypot(P.w, P.h);
  return {
    group,
    falling,
    set(grains, impact, { white = 0.55, root = null } = {}) {
      const front = maxR * smooth(0, 0.16, grains) + 0.01;
      const glow = grains > 0.003 ? 1 - smooth(0.12, 0.22, grains) : 0;
      const wh = smooth(0.04, 0.4, grains);
      for (const m of faces) {
        const u = m.material.uniforms;
        u.uImpact.value.set(impact[0], impact[1]);
        u.uFrontR.value = front;
        u.uFrontGlow.value = glow;
        u.uWhite.value = wh;
        u.uAlpha.value = white / 0.55;
        u.uFall.value = fall ? grains : 0;
      }
      if (falling) {
        falling.visible = grains > 0.5;
        falling.material.uniforms.uFall.value = grains;
        if (root) {
          root.updateWorldMatrix(true, false);
          root.getWorldQuaternion(_q).invert();
          falling.material.uniforms.uDown.value.set(0, -1, 0).applyQuaternion(_q);
        }
      }
    },
  };
}
const _q = new THREE.Quaternion();

/* ───────────────────────────── light that has a place ───────────────────────────── */

const GLOW_VS = /* glsl */ `
uniform float uSize;
varying vec2 vP;
void main() {
  vP = position.xy * 2.0;
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xy += position.xy * uSize;
  gl_Position = projectionMatrix * mv;
}`;
const GLOW_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uAmount, uCore;
varying vec2 vP;
void main() {
  float r = clamp(length(vP), 0.0, 1.0);
  float core = exp(-r * r * 60.0) * uCore;
  float halo = exp(-r * 4.0) * (1.0 - r);
  gl_FragColor = vec4(uColor * (core + halo) * uAmount, 1.0);
}`;
/** A point of light: a bright core and a long soft trail (additive). `size` its diameter in cm. */
function makeGlow(color, size, core = 2) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      vertexShader: GLOW_VS,
      fragmentShader: GLOW_FS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uSize: { value: size }, uColor: { value: new THREE.Color(color) }, uAmount: { value: 0 }, uCore: { value: core } },
    }),
  );
  m.renderOrder = 12;
  m.frustumCulled = false;
  return m;
}

/** A small disc lying on the pane around (cx, cy), at `z` from the mid-plane; `frag` paints it from vXY (cm from cx, cy). */
function surfDisc(place, cx, cy, R, z, frag, uniforms, { order = 9, blending = THREE.NormalBlending } = {}) {
  const segs = 64, rs = 10;
  const pos = [], xy = [], idx = [];
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  for (let j = 0; j <= rs; j++)
    for (let i = 0; i <= segs; i++) {
      const r = (j / rs) * R, a = (i / segs) * TAU;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      place(cx + x, cy + y, v, n);
      pos.push(v.x + n.x * z, v.y + n.y * z, v.z + n.z * z);
      xy.push(x, y);
    }
  for (let j = 0; j < rs; j++)
    for (let i = 0; i < segs; i++) {
      const a = j * (segs + 1) + i;
      idx.push(a, a + 1, a + segs + 2, a, a + segs + 2, a + segs + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aXY", new THREE.Float32BufferAttribute(xy, 2));
  g.setIndex(idx);
  const m = new THREE.Mesh(
    g,
    new THREE.ShaderMaterial({
      vertexShader: `attribute vec2 aXY; varying vec2 vXY; void main(){ vXY = aXY; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending,
      uniforms,
    }),
  );
  m.renderOrder = order;
  m.frustumCulled = false;
  return m;
}
const RAGGED = /* glsl */ `
float ragged(vec2 p) { float a = atan(p.y, p.x); return 0.5 * sin(5.0 * a + 1.3) + 0.3 * sin(9.0 * a + 0.4) + 0.2 * sin(17.0 * a + 2.1); }`;

/* ───────────────────────────── the gravel ───────────────────────────── */

function buildChip(place, face) {
  const [kx, ky] = IMPACT.chip;
  const rnd = rng(431);
  const group = new THREE.Group();
  const pt = new THREE.Vector3(), nn = new THREE.Vector3();
  place(kx, ky, pt, nn);
  const hit = pt.clone().addScaledVector(nn, -face - 0.55); // on the outer glass
  const normal = nn.clone();

  // the stone: a small faceted pebble, solid, signal
  const rock = new THREE.IcosahedronGeometry(0.85, 1);
  const rp = rock.attributes.position;
  for (let i = 0; i < rp.count; i++) {
    const s = 0.75 + 0.45 * ((Math.sin(rp.getX(i) * 7.1 + rp.getY(i) * 3.3) + Math.sin(rp.getZ(i) * 5.7)) * 0.25 + 0.5);
    rp.setXYZ(i, rp.getX(i) * s, rp.getY(i) * s * 0.8, rp.getZ(i) * s);
  }
  rock.computeVertexNormals();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x3a160b, emissive: SIGNAL, emissiveIntensity: 0.55, roughness: 0.55, metalness: 0.1, flatShading: true, transparent: true });
  const stone = new THREE.Mesh(rock, stoneMat);
  // its trail: a ribbon from where it was to where it is
  const trailG = new THREE.BufferGeometry();
  trailG.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(12), 3));
  trailG.setAttribute("aAlong", new THREE.Float32BufferAttribute([0, 0, 1, 1], 1));
  trailG.setAttribute("aSide", new THREE.Float32BufferAttribute([-1, 1, 1, -1], 1));
  trailG.setIndex([0, 1, 2, 0, 2, 3]);
  const trail = new THREE.Mesh(
    trailG,
    new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        uniform vec3 uA, uB; uniform float uW, uPx;
        attribute float aAlong, aSide; varying float vAlong, vSide;
        void main() {
          vec4 a = modelViewMatrix * vec4(uA, 1.0), b = modelViewMatrix * vec4(uB, 1.0);
          vec3 dir = b.xyz - a.xyz; dir /= max(length(dir), 1e-4);
          vec4 p = mix(a, b, aAlong);
          vec3 perp = cross(dir, p.xyz / max(length(p.xyz), 1e-4)); perp /= max(length(perp), 1e-4);
          float wd = max(uW * aAlong, 2.4 * max(-p.z, 0.1) / max(uPx, 1.0));
          p.xyz += perp * aSide * 0.5 * wd;
          gl_Position = projectionMatrix * p; vAlong = aAlong; vSide = aSide;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying float vAlong, vSide;
        void main() {
          float prof = 1.0 - smoothstep(0.1, 1.0, abs(vSide));
          gl_FragColor = vec4(uColor * (pow(clamp(vAlong, 0.0, 1.0), 1.6) * prof * uAmount), 1.0);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.MaxEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      uniforms: { uA: { value: new THREE.Vector3() }, uB: { value: new THREE.Vector3() }, uW: { value: 1.3 }, uPx: PX, uColor: { value: SIGNAL.clone().multiplyScalar(1.5) }, uAmount: { value: 0 } },
    }),
  );
  trail.frustumCulled = false;
  trail.renderOrder = 11;
  const flash = makeGlow(BRAND.ink, 9, 3);
  flash.position.copy(hit);

  // the star: a bullseye and its legs, on the outer glass only (that is why the resin can save it)
  const segs = [];
  const ring = [];
  for (let s = 0; s <= 12; s++) {
    const a = (s / 12) * TAU;
    const r = 0.75 + 0.1 * Math.sin(a * 3 + 1);
    ring.push({ x: kx + Math.cos(a) * r, y: ky + Math.sin(a) * r, r: 0, u: 0 });
  }
  pushLine(segs, ring, { kind: 2, gate: 0.05, w: 0.8, seed: 0.7 });
  for (let l = 0; l < 8; l++) {
    const a = (l / 8) * TAU + (rnd() - 0.5) * 0.5;
    const len = 1.2 + 2.2 * rnd();
    const k = 0.45 + 0.2 * rnd();
    const a2 = a + (rnd() - 0.5) * 0.5;
    const p0 = { x: kx + Math.cos(a) * 0.5, y: ky + Math.sin(a) * 0.5, r: 0 };
    const p1 = { x: kx + Math.cos(a) * len * k, y: ky + Math.sin(a) * len * k, r: 0 };
    const p2 = { x: p1.x + Math.cos(a2) * len * (1 - k), y: p1.y + Math.sin(a2) * len * (1 - k), r: 0 };
    pushLine(segs, [p0, p1], { kind: 2, gate: 0.15 + 0.2 * rnd(), w: 0.7, seed: rnd() });
    pushLine(segs, [p1, p2], { kind: 2, gate: 0.4 + 0.3 * rnd(), w: 0.55, seed: rnd() });
  }
  const starMat = crackMaterial({ face: -face, width: 0.08, base: 0.9 });
  const starGeo = bakeCracks(segs, place, IMPACT.chip);
  const star = new THREE.Mesh(starGeo, starMat);
  const starDark = darkUnder(starGeo, -face, { width: 0.22, minPx: 4, amount: 0.5 });
  star.frustumCulled = false;
  star.renderOrder = 10;
  const crushU = { uColor: { value: INK.clone() }, uAmount: { value: 0 } };
  const crush = surfDisc(place, kx, ky, 0.85, -face - 0.02, /* glsl */ `
    uniform vec3 uColor; uniform float uAmount; varying vec2 vXY;
    void main() { float r = length(vXY) / 0.85; float a = (1.0 - smoothstep(0.55, 1.0, r)) * 0.7 * uAmount; if (a < 0.002) discard; gl_FragColor = vec4(uColor * 0.9, a); }`, crushU, { order: 9 });

  // the crack that runs: from the star toward the lower right edge, in jolts
  const P = PANES.hero;
  const inside = insideOf(P);
  const cpts = [{ x: kx + 0.6, y: ky - 0.4, r: 0 }];
  let a = -0.62, x = cpts[0].x, y = cpts[0].y, len = 0;
  for (let g = 0; g < 200; g++) {
    a += (rnd() - 0.5) * 0.28 + (-0.62 - a) * 0.08;
    const nx = x + Math.cos(a) * 0.9, ny = y + Math.sin(a) * 0.9;
    if (!inside(nx, ny, 1.2)) break;
    len += Math.hypot(nx - x, ny - y);
    x = nx;
    y = ny;
    cpts.push({ x, y, r: len });
  }
  const creepLen = len;
  const csegs = [];
  pushLine(csegs, cpts, { kind: 0, w: (r) => 1.5 - 0.6 * (r / creepLen), seed: 0.62, jit: 0.3 });
  const creepMat = crackMaterial({ face: -face, width: 0.09, base: 0.9 });
  const creepGeo = bakeCracks(csegs, place, IMPACT.chip);
  const creep = new THREE.Mesh(creepGeo, creepMat);
  const creepDark = darkUnder(creepGeo, -face, { width: 0.26, minPx: 4.2, amount: 0.5 });
  creep.frustumCulled = false;
  creep.renderOrder = 10;

  // the resin: fills the star veille, then cures almost invisible
  const resinU = { uColor: { value: VEILLE.clone() }, uAmount: { value: 0 } };
  const resin = surfDisc(place, kx, ky, 2.6, -face - 0.03, /* glsl */ `
    ${RAGGED}
    uniform vec3 uColor; uniform float uAmount; varying vec2 vXY;
    void main() {
      float r = length(vXY) / (2.2 * (1.0 + 0.08 * ragged(vXY)));
      float a = (1.0 - smoothstep(0.5, 1.0, r)) * uAmount;
      if (a < 0.002) discard;
      gl_FragColor = vec4(uColor * (0.6 + 0.6 * (1.0 - r)), clamp(a, 0.0, 0.85));
    }`, resinU, { order: 11 });

  group.add(stone, trail, flash, starDark, star, crush, creepDark, creep, resin);
  const away = normal.clone().multiplyScalar(-1); // outward: where the gravel comes from
  const from = hit.clone().addScaledVector(away, 170).add(new THREE.Vector3(-34, 26, 0));
  const tmp = new THREE.Vector3();
  return {
    group,
    all: [stone, trail, flash, starDark, star, crush, creepDark, creep, resin],
    set(chip, cr, rs) {
      // the stone
      if (chip > 0.003 && chip < 0.8) {
        stone.visible = true;
        if (chip <= 0.5) {
          const u = chip / 0.5;
          stone.position.lerpVectors(from, hit, u);
          stone.position.y += 6 * Math.sin(Math.PI * u);
          trail.visible = true;
          tmp.copy(from).sub(hit);
          const tl = Math.min(1, 55 / tmp.length());
          trail.material.uniforms.uA.value.lerpVectors(from, hit, Math.max(0, u - tl));
          trail.material.uniforms.uA.value.y += 6 * Math.sin(Math.PI * Math.max(0, u - tl));
          trail.material.uniforms.uB.value.copy(stone.position);
          trail.material.uniforms.uAmount.value = smooth(0, 0.15, u);
          stoneMat.opacity = 1;
        } else {
          const t = (chip - 0.5) / 0.3;
          stone.position.copy(hit).addScaledVector(away, 22 * t).add(tmp.set(7 * t, -16 * t * t, 0));
          trail.visible = false;
          stoneMat.opacity = 1 - smooth(0.6, 1, t);
        }
        stone.rotation.set(chip * 17, chip * 11, chip * 5);
      }
      const fl = Math.exp(-(((chip - 0.507) / 0.014) ** 2));
      flash.visible = fl > 0.01;
      flash.material.uniforms.uAmount.value = 1.6 * fl;
      // the star
      const st = smooth(0.5, 1, chip);
      star.visible = starDark.visible = crush.visible = chip > 0.5;
      const fade = 1 - 0.85 * smooth(0.45, 1, rs);
      const u = star.material.uniforms;
      u.uStar.value = st;
      u.uColor.value.copy(INK).lerp(VEILLE, smooth(0, 0.4, rs));
      u.uAmount.value = fade;
      starDark.material.uniforms.uStar.value = st;
      starDark.material.uniforms.uAmount.value = fade;
      crushU.uAmount.value = smooth(0.5, 0.7, chip) * fade;
      // the crack that runs, by jolts (the warm, the cold)
      creep.visible = creepDark.visible = cr > 0.003;
      const n = 5;
      const f = clamp01(cr) * n;
      const k = Math.min(n, Math.floor(f));
      const jolt = (k + (k < n ? smooth(0, 0.35, f - k) : 0)) / n;
      const cu = creep.material.uniforms;
      cu.uFront.value = creepLen * jolt + 0.6;
      cu.uTip.value = cr < 0.999 ? 1 - smooth(0.25, 0.7, f - k) : 0;
      creepDark.material.uniforms.uFront.value = cu.uFront.value;
      // the resin
      resin.visible = rs > 0.003;
      resinU.uAmount.value = smooth(0, 0.35, rs) * (1 - 0.82 * smooth(0.5, 1, rs));
    },
  };
}

/* ───────────────────────────── the bubble ───────────────────────────── */

function buildBubble(place) {
  const [bx, by] = BUBBLE;
  const pt = new THREE.Vector3(), nn = new THREE.Vector3();
  place(bx, by, pt, nn);
  const lensMat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `varying vec3 vN, vW; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount; varying vec3 vN, vW;
      void main() {
        vec3 V = normalize(cameraPosition - vW); vec3 N = normalize(vN);
        float rim = pow(clamp(1.0 - abs(dot(N, V)), 0.0, 1.0), 2.2);
        vec3 L = normalize(vec3(${KEY.x.toFixed(4)}, ${KEY.y.toFixed(4)}, ${KEY.z.toFixed(4)}));
        float sp = pow(clamp(dot(reflect(-L, N), V), 0.0, 1.0), 40.0);
        gl_FragColor = vec4(uInk * (1.3 * rim + 2.2 * sp + 0.02), clamp(0.02 + 0.9 * rim + sp, 0.0, 1.0) * uAmount);
      }`,
    transparent: true,
    depthWrite: false,
    uniforms: { uInk: { value: INK.clone() }, uAmount: { value: 0 } },
  });
  const lens = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20), lensMat);
  lens.position.copy(pt);
  lens.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nn);
  lens.renderOrder = 11;
  const aurU = { uColor: { value: VEILLE.clone() }, uR: { value: 0 }, uIn: { value: 0 }, uAmount: { value: 0 } };
  const aur = surfDisc(place, bx, by, 8, 0.02, /* glsl */ `
    ${RAGGED}
    uniform vec3 uColor; uniform float uR, uIn, uAmount; varying vec2 vXY;
    void main() {
      float r = length(vXY);
      float edge = uR * (1.0 + 0.07 * ragged(vXY) + 0.03 * sin(31.0 * atan(vXY.y, vXY.x)));
      float fw = max(fwidth(r), 1e-3);
      float inside = 1.0 - smoothstep(edge - fw, edge + fw, r);
      float lip = exp(-pow((r - edge) / max(0.12, 1.2 * fw), 2.0));
      float a = (inside * 0.16 * (0.4 + 0.6 * smoothstep(uIn, edge, r)) + lip * 0.32) * uAmount * step(uIn * 0.9, r);
      if (a < 0.002) discard;
      gl_FragColor = vec4(uColor * (0.45 + 0.5 * lip), clamp(a, 0.0, 0.6));
    }`, aurU, { order: 9 });
  const group = new THREE.Group();
  group.add(aur, lens);
  return {
    group,
    all: [aur, lens],
    set(b) {
      const r = 2.1 * smooth(0, 0.55, b);
      lens.visible = aur.visible = b > 0.003;
      lens.scale.set(Math.max(r, 0.01), Math.max(r * 0.9, 0.01), Math.max(0.22 * smooth(0, 0.5, b), 0.01));
      lensMat.uniforms.uAmount.value = smooth(0, 0.25, b);
      aurU.uR.value = r + 2.6 * smooth(0.3, 1, b);
      aurU.uIn.value = r;
      aurU.uAmount.value = smooth(0.25, 0.6, b);
    },
  };
}

/* ───────────────────────────── the grain of nickel sulfide ───────────────────────────── */

function buildNickel(place, P) {
  const [nx, ny] = IMPACT.side;
  const pt = new THREE.Vector3(), nn = new THREE.Vector3();
  place(nx, ny, pt, nn);
  const grainMat = new THREE.MeshStandardMaterial({ color: 0x2a1209, emissive: SIGNAL, emissiveIntensity: 1.1, roughness: 0.3, metalness: 0.45, flatShading: true });
  const grain = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), grainMat);
  grain.position.copy(pt);
  const halo = makeGlow(BRAND.signal, 4.5, 1.2);
  halo.position.copy(pt);
  const flash = makeGlow(BRAND.ink, 10, 3);
  flash.position.copy(pt);
  // the first cracks around it, in the core, just before it gives
  const rnd = rng(77);
  const segs = [];
  for (let l = 0; l < 9; l++) {
    const a = (l / 9) * TAU + (rnd() - 0.5) * 0.5;
    const len = 0.6 + 1.2 * rnd();
    pushLine(segs, [{ x: nx + Math.cos(a) * 0.25, y: ny + Math.sin(a) * 0.25, r: 0 }, { x: nx + Math.cos(a) * len, y: ny + Math.sin(a) * len, r: 0 }], { kind: 2, gate: rnd() * 0.6, w: 0.6, seed: rnd() });
  }
  const starMat = crackMaterial({ face: 0, width: 0.05 });
  const star = new THREE.Mesh(bakeCracks(segs, place, IMPACT.side), starMat);
  star.frustumCulled = false;
  star.renderOrder = 10;
  const group = new THREE.Group();
  group.add(grain, halo, flash, star);
  return {
    group,
    all: [grain, halo, flash, star],
    set(k, grains) {
      const on = k > 0.003 && grains < 0.2;
      grain.visible = halo.visible = star.visible = on;
      const s = smooth(0, 0.5, k);
      grain.scale.setScalar(Math.max(0.01, s));
      grain.rotation.set(k * 3, k * 2, 0);
      // the stress builds slowly around it (no blinking), then it gives
      halo.material.uniforms.uAmount.value = on ? 0.45 * s + 0.9 * smooth(0.55, 0.95, k) : 0;
      grainMat.emissiveIntensity = 1.1 + 0.8 * smooth(0.55, 0.95, k);
      starMat.uniforms.uStar.value = smooth(0.82, 1, k);
      const fl = Math.exp(-(((k - 0.985) / 0.012) ** 2));
      flash.visible = k > 0.9 && grains < 0.2 && fl > 0.01;
      flash.material.uniforms.uAmount.value = 1.5 * fl;
    },
  };
}

/* ───────────────────────────── the ordinary pane of before: blades ───────────────────────────── */

function makeBladePieces(seed, w, h, c) {
  const rnd = rng(seed);
  const [cx, cy] = c;
  const n = 11;
  const base = rnd() * TAU;
  const hx = w / 2, hy = h / 2;
  const rays = [];
  for (let i = 0; i < n; i++) {
    const a = base + ((i + (rnd() - 0.5) * 0.6) / n) * TAU;
    const dx = Math.cos(a), dy = Math.sin(a);
    const tx = dx > 0 ? (hx - cx) / dx : dx < 0 ? (-hx - cx) / dx : 1e9;
    const ty = dy > 0 ? (hy - cy) / dy : dy < 0 ? (-hy - cy) / dy : 1e9;
    const t = Math.min(tx, ty);
    rays.push({ a, dx, dy, t, r1: t * (0.26 + 0.16 * rnd()), r2: t * (0.56 + 0.2 * rnd()) });
  }
  rays.sort((p, q) => p.a - q.a);
  const P = (ray, r) => ({ x: cx + ray.dx * r, y: cy + ray.dy * r });
  const corners = [[hx, hy], [-hx, hy], [-hx, -hy], [hx, -hy]].map(([x, y]) => ({ x, y, a: Math.atan2(y - cy, x - cx) }));
  const pieces = [];
  const far = Math.max(...rays.map((r) => r.t));
  for (let i = 0; i < n; i++) {
    const A = rays[i], B = rays[(i + 1) % n];
    let a0 = A.a, a1 = B.a;
    while (a1 <= a0) a1 += TAU;
    const tri = [{ x: cx, y: cy }, P(A, A.r1), P(B, B.r1)];
    const m1 = rnd() < 0.5;
    const q = [P(A, A.r1), P(A, A.r2), P(B, B.r2), P(B, B.r1)];
    const mids = m1 ? [[q[0], q[1], q[2]], [q[0], q[2], q[3]]] : [[q[0], q[1], q[3]], [q[1], q[2], q[3]]];
    const cs = corners.filter((k) => {
      let ka = k.a;
      while (ka < a0) ka += TAU;
      return ka < a1;
    }).sort((p, q2) => {
      let pa = p.a, qa = q2.a;
      while (pa < a0) pa += TAU;
      while (qa < a0) qa += TAU;
      return pa - qa;
    });
    const outer = [P(A, A.r2), P(A, A.t), ...cs, P(B, B.t), P(B, B.r2)];
    for (const poly of [tri, ...mids, outer]) {
      let mx = 0, my = 0;
      for (const p of poly) {
        mx += p.x;
        my += p.y;
      }
      mx /= poly.length;
      my /= poly.length;
      const d = Math.hypot(mx - cx, my - cy);
      pieces.push({ poly, cx: mx, cy: my, near: 1 - d / far, rnd: [rnd(), rnd(), rnd(), rnd()] });
    }
  }
  return pieces;
}
/** A convex polygon (around its centroid) extruded `t` thick: flat-shaded. */
function slab(poly, mx, my, t) {
  const pos = [];
  const n = poly.length;
  const z0 = -t / 2, z1 = t / 2;
  for (let k = 0; k < n; k++) {
    const a = poly[k], b = poly[(k + 1) % n];
    const ax = a.x - mx, ay = a.y - my, bx = b.x - mx, by = b.y - my;
    pos.push(0, 0, z1, ax, ay, z1, bx, by, z1);
    pos.push(0, 0, z0, bx, by, z0, ax, ay, z0);
    pos.push(ax, ay, z0, bx, by, z0, bx, by, z1, ax, ay, z0, bx, by, z1, ax, ay, z1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

function buildPlain(seed, P, c, { floor }) {
  const group = new THREE.Group();
  const pieces = makeBladePieces(seed, P.w, P.h, c);
  const mat = new THREE.MeshStandardMaterial({ color: 0x9ba7a4, emissive: SIGNAL, emissiveIntensity: 0, roughness: 0.22, metalness: 0, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false });
  const meshes = pieces.map((pc) => {
    const g = slab(pc.poly, pc.cx, pc.cy, 0.45);
    const m = new THREE.Mesh(g, mat);
    m.renderOrder = 8;
    const e = edgesOf(g, { color: BRAND.signal, width: 2.2, opacity: 0 });
    e.material.color.multiplyScalar(1.5);
    e.renderOrder = 11;
    m.add(e);
    m.userData = { pc, e, axis: new THREE.Vector3(pc.rnd[0] - 0.5, pc.rnd[1] - 0.5, pc.rnd[2] - 0.5).normalize(), out: new THREE.Vector3(pc.cx - c[0], pc.cy - c[1], 0).normalize() };
    group.add(m);
    return m;
  });
  // the whole sheet before it breaks: its outline (ordinary glass, ink)
  const outline = edgesOf(new THREE.PlaneGeometry(P.w, P.h), { color: BRAND.ink, width: 2, opacity: 0.6 });
  group.add(outline);
  const flash = makeGlow(BRAND.ink, 14, 3);
  flash.position.set(c[0], c[1], 0.5);
  group.add(flash);
  const down = new THREE.Vector3();
  const q = new THREE.Quaternion(), q2 = new THREE.Quaternion();
  const zAxis = new THREE.Vector3(0, 0, 1);
  return {
    group,
    all: [...meshes, outline, flash],
    set(plain, blades, root) {
      const on = plain > 0.003 || blades > 0.003;
      const k = smooth(0, 0.12, blades); // the cracks show, the sheet turns into blades (signal)
      const tau = clamp01((blades - 0.1) / 0.9);
      if (root) {
        root.updateWorldMatrix(true, false);
        root.getWorldQuaternion(q).invert();
        down.set(0, -1, 0).applyQuaternion(q);
      } else down.set(0, -1, 0);
      mat.opacity = on ? THREE.MathUtils.lerp(0.15 * clamp01(plain + blades), 0.78, k) : 0;
      mat.color.setHex(0x9ba7a4).lerp(_dark, k);
      mat.emissiveIntensity = 0.5 * k;
      outline.visible = on && k < 0.99;
      outline.material.opacity = 0.6 * clamp01(plain + blades) * (1 - k);
      for (const m of meshes) {
        const { pc, e, axis, out } = m.userData;
        m.visible = on;
        e.material.opacity = k;
        const move = smooth(0.12, 0.5, pc.near);
        const [r0, r1, r2, r3] = pc.rnd;
        m.position.set(pc.cx, pc.cy, 0);
        if (tau <= 0) {
          m.quaternion.identity();
          continue;
        }
        if (floor) {
          // on the line: they jump, scatter, and land flat on the rollers
          const T = 0.45 + 0.25 * r0;
          const s = Math.min(1, tau / T);
          const hmax = (8 + 26 * pc.near) * move;
          const hgt = tau < T ? 4 * hmax * s * (1 - s) : 0;
          m.position.addScaledVector(out, s * (6 + 28 * pc.near) * move * (0.7 + 0.6 * r1));
          m.position.addScaledVector(down, -hgt);
          q.setFromAxisAngle(axis, Math.sin(Math.PI * s) * (0.8 + 1.6 * r2) * move);
          q2.setFromAxisAngle(zAxis, s * (r3 - 0.5) * 1.6 * move);
          m.quaternion.copy(q2).multiply(q);
        } else {
          // in the car: toward your face
          m.position.z += tau * (40 + 120 * pc.near) * move * (0.75 + 0.5 * r1);
          m.position.addScaledVector(out, tau * 18 * pc.near * move);
          m.position.addScaledVector(down, 0.5 * 80 * tau * tau * move);
          m.quaternion.setFromAxisAngle(axis, tau * (1 + 2.4 * r2) * move);
        }
      }
      const fl = Math.exp(-(((blades - 0.03) / 0.022) ** 2));
      flash.visible = on && fl > 0.01;
      flash.material.uniforms.uAmount.value = 1.5 * fl;
    },
  };
}
const _dark = new THREE.Color(0x3c140a);

/* ───────────────────────────── the mounts ───────────────────────────── */

// The webs: hero struck by your head (IMPACT.head) or by the test head (IMPACT.test), the sample by the ball, the
// laminated side window by the window-breaker. Ring radii in cm: ring 0 is the crushed star.
const WEBS = {
  head: { seed: 1043, at: IMPACT.head, R: 56, rings: [2.2, 3.2, 4.4, 5.8, 7.4, 9.4, 11.8, 14.8, 18.5, 23.5], nRad: 34, dent: 0.55, dentR: 7 },
  test: { seed: 2087, at: IMPACT.test, R: 64, rings: [2.4, 3.5, 4.8, 6.3, 8.1, 10.3, 13, 16.4, 20.5, 26], nRad: 36, dent: 0.6, dentR: 8 },
  sample: { seed: 311, at: IMPACT.ball, R: 17, rings: [1.0, 1.7, 2.6, 3.7, 5, 6.6, 8.6, 11], nRad: 24, dent: 0.35, dentR: 3.5 },
  side: { seed: 517, at: IMPACT.side, R: 34, rings: [0.9, 1.8, 3, 4.6, 6.8, 9.5], nRad: 18, dent: 0.2, dentR: 3 },
};

export function buildCasse() {
  const mounts = {};

  const mount = (name, root, surf) => {
    const P = PANES[name] ?? { w: 100, h: 60, face: FACE_ONE };
    const place = placer(surf);
    const g = new THREE.Group();
    root.add(g);
    const m = { g, root, all: [] };
    const add = (view) => {
      g.add(view.group);
      m.all.push(view.group);
      return view;
    };
    const webOf = (key) => {
      const W = WEBS[key];
      const web = makeWeb(W.seed, { c: W.at, R: W.R, rings: W.rings, nRad: W.nRad, inside: insideOf(P) });
      return add(buildWebView(web, place, { face: P.face, dent: W.dent, dentR: W.dentR }));
    };
    if (name === "hero") {
      m.webHead = webOf("head");
      m.webTest = webOf("test");
      m.grains = add(buildGrainsView(901, P, place, { fall: false }));
      m.chip = add(buildChip(place, P.face));
      m.bubble = add(buildBubble(place));
    } else if (name === "side") {
      m.web = webOf("side");
      m.grains = add(buildGrainsView(733, P, place, { fall: true }));
      m.nickel = add(buildNickel(place, P));
    } else if (name === "sample") {
      m.web = webOf("sample");
    } else if (name === "witness") {
      m.grains = add(buildGrainsView(655, P, place, { fall: false }));
    } else if (name === "plain" || name === "plainLine") {
      m.plain = add(buildPlain(name === "plain" ? 2203 : 2251, P, name === "plain" ? IMPACT.head : [0, 0], { floor: name === "plainLine" }));
    }
    mounts[name] = m;
  };

  const hideAll = (m) => m.all.forEach((c) => (c.visible = false));

  return {
    mount,
    update(p, time, px) {
      PX.value = px || 1500;
      for (const m of Object.values(mounts)) hideAll(m);

      /* the web */
      const w = mounts[p.webOn];
      if (w && p.web > 0.003) {
        const view = p.webOn === "hero" ? (p.webAt === "test" ? w.webTest : w.webHead) : w.web;
        if (view) {
          view.group.visible = true;
          view.set(p.web, p.rings, p.stick);
        }
      }

      /* the grains */
      const gr = mounts[p.grainsOn];
      if (gr && gr.grains && p.grains > 0.003) {
        gr.grains.group.visible = true;
        const impact = p.grainsOn === "hero" ? (p.webAt === "test" ? IMPACT.test : IMPACT.head) : p.grainsOn === "side" ? IMPACT.side : IMPACT.witness;
        gr.grains.set(p.grains, impact, { white: p.grainsOn === "hero" ? 0.9 : 0.55, root: gr.root });
      }

      /* the gravel, the crack that runs, the resin, the bubble: on the windshield */
      const hero = mounts.hero;
      if (hero) {
        if (p.chip > 0.003 || p.creep > 0.003 || p.resin > 0.003) {
          hero.chip.group.visible = true;
          hero.chip.all.forEach((o) => (o.visible = false));
          hero.chip.set(p.chip, p.creep, p.resin);
        }
        if (p.bubble > 0.003) {
          hero.bubble.group.visible = true;
          hero.bubble.set(p.bubble);
        }
      }

      /* the grain of nickel sulfide: in the side window */
      const side = mounts.side;
      if (side && p.nickel > 0.003) {
        side.nickel.group.visible = true;
        side.nickel.set(p.nickel, p.grainsOn === "side" ? p.grains : 0);
      }

      /* the ordinary pane of before */
      const pl = mounts[p.plainOn];
      if (pl && pl.plain && (p.plain > 0.003 || p.blades > 0.003)) {
        pl.plain.group.visible = true;
        pl.plain.set(p.plain, p.blades, pl.root);
      }
    },
  };
}
