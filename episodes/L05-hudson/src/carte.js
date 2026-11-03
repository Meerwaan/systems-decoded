// DOSSIER L05 — the MAQUETTE: New York at 1 : 2 000 on a table in the dark (the Hudson, the East River, Manhattan's
// blocks, LaGuardia, Teterboro, the bridge), the plane's glyph flying its track at the maquette's height, the options
// offered and refused, the radio, the route planned to Charlotte, the fifteen simulator passes of Toulouse and the one
// with 35 s of delay, the boats converging; and, at its own spot, the certification BASIN and its model airliner.
//
//   buildCarte() → { group, A, update(p, time, px, ctx) }
//   p    the world's state S — carte.js reads: spot route glyph opt optNo riverLit airports radio jam charlotte sims
//        simLate boatsMap dropK dropFast flow
//   ctx  { t: the time of the day on the track (s after 15:00) — the glyph stands at pathAt(t); camera (optional): the
//        glyph keeps a readable size on screen (else the camera is caught at its first draw) }
//   A    anchors (Object3D, in the group): ditch, strike, lga04, lga13, lga31, teb01, gwb, glyph (moves with the plane),
//        tracon (where the radio line goes: off the maquette's east edge), charlotte (off the south-west edge),
//        basin (the basin's water centre), model (the model airliner)
//
// THE FRAME: the geographic frame scaled by MAP.k / KM (1 km = 50 cm; heights at the same scale: 860 m → 43 cm), its
// origin the ditching point at the table's surface (y = 0); x east, z south. The basin stands at BASIN.at.
// A maquette: no distance, no height, no name is ever written on it (the chapters put labels in HTML).
//
// THE LOOK: the table is a solid (the land a dark grey, the water a darker hollow with its banks drawn), the city is
// glass (Manhattan dense on its avenues' grid, Central Park left empty; the other boroughs low and sparse), the bridge
// and the glyph are solid. Every line has a width on screen (≥ 4.5 px at 1920), never thinner. Colours: ink the
// structure and the plans (the route, Charlotte, the radio), veille what saves (the river chosen, an option offered,
// the passes that reach a runway, the boats), signal the threat (a refused option, the jammed radio, the late pass).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { solid, glass, asShell, lineMat, fatLine, box, plate, lathe, makePart, addMesh, setPartOpacity, mergeGeometries } from "@kit/build3d.js";
import { makeSurface } from "@kit/atmo.js";
import { rng } from "@kit/rng.js";
import { GEO, MAP, KM, BASIN, DAY, SIMS, DEG, pathAt } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const lerp = (a, b, u) => a + (b - a) * u;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

const K = MAP.k; //                  table cm per km
const G2M = K / KM; //               geographic cm → table cm
const TB = { x0: MAP.x[0] * K, x1: MAP.x[1] * K, z0: MAP.z[0] * K, z1: MAP.z[1] * K }; // the maquette's edges (cm)
const WATER_Y = 0.3; //              the rivers' surface on the table (a hollow drawn darker, not cut)
const OUT = new Float64Array(7);
const T0 = DAY.cleared;
const T1 = DAY.contact;

/* ───────────────────────────────────────────────────────────── small tools */

/** A soft round light (a head that moves, a mark): a sprite with a radial gradient — a heart and a tail, never a disc. */
let GLOW_TEX = null;
function glowTex() {
  if (GLOW_TEX) return GLOW_TEX;
  const n = 64;
  const data = new Uint8Array(n * n * 4);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) / n) * 2 - 1;
      const y = ((j + 0.5) / n) * 2 - 1;
      const r = Math.min(1, Math.hypot(x, y));
      const v = clamp01(Math.exp(-r * r * 22) * 0.95 + Math.exp(-r * r * 4) * 0.4) * (1 - r * r);
      const o = (j * n + i) * 4;
      data[o] = data[o + 1] = data[o + 2] = Math.round(255 * v);
      data[o + 3] = Math.round(255 * v);
    }
  }
  GLOW_TEX = new THREE.DataTexture(data, n, n);
  GLOW_TEX.needsUpdate = true;
  return GLOW_TEX;
}
function makeGlow(color, size) {
  const mat = new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(color), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
  const s = new THREE.Sprite(mat);
  s.scale.setScalar(size);
  s.renderOrder = 7;
  s.visible = false;
  return s;
}

/**
 * A line of `n` segments whose points are rewritten in place (no allocation): the route as it grows, an option's
 * pointer, the radio. Width on screen (px at 1920), dashes in table centimetres, optional colour per point (fades).
 */
function dynLine(n, { color = BRAND.ink, width = 4, opacity = 1, dashed = false, dash = 8, gap = 6, colors = false, order = 4 } = {}) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(new Float32Array(n * 6));
  let col = null;
  if (colors) {
    col = new Float32Array(n * 6).fill(1);
    geo.setColors(col);
  }
  const mat = lineMat(color, width, { opacity, dashed, dashSize: dash, gapSize: gap, vertexColors: colors });
  const line = new LineSegments2(geo, mat);
  line.frustumCulled = false;
  line.renderOrder = order;
  let dist = null;
  if (dashed) {
    line.computeLineDistances();
    dist = geo.attributes.instanceDistanceStart.data.array;
  }
  const P = geo.attributes.instanceStart.data;
  const D = dashed ? geo.attributes.instanceDistanceStart.data : null;
  const C = colors ? geo.attributes.instanceColorStart.data : null;
  const pos = P.array;
  const head = new THREE.Vector3();
  const L = {
    line, geo, mat, n, head,
    /** Segment i from (ax, ay, az) to (bx, by, bz). */
    seg(i, ax, ay, az, bx, by, bz) {
      const o = i * 6;
      pos[o] = ax; pos[o + 1] = ay; pos[o + 2] = az;
      pos[o + 3] = bx; pos[o + 4] = by; pos[o + 5] = bz;
    },
    /** Draw `m` segments; recompute the dashes' distances. */
    done(m) {
      geo.instanceCount = Math.max(0, Math.min(n, m));
      P.needsUpdate = true;
      if (dist) {
        let d = 0;
        for (let i = 0; i < m; i++) {
          const o = i * 6;
          dist[2 * i] = d;
          d += Math.hypot(pos[o + 3] - pos[o], pos[o + 4] - pos[o + 1], pos[o + 5] - pos[o + 2]);
          dist[2 * i + 1] = d;
        }
        D.needsUpdate = true;
      }
      line.visible = m > 0;
    },
    /** The brightness at each end of segment i (vertex colours: 0 black, 1 the material's colour). */
    fade(i, a, b) {
      const o = i * 6;
      col[o] = col[o + 1] = col[o + 2] = a;
      col[o + 3] = col[o + 4] = col[o + 5] = b;
      C.needsUpdate = true;
    },
    /** A fixed polyline `src` (m points, xyz) shown up to `u` (0–1), its head exactly at u: a trace that grows. */
    reveal(src, m, u) {
      if (u <= 0) return L.done(0);
      const f = clamp01(u) * (m - 1);
      const i = Math.min(m - 2, Math.floor(f));
      const fr = f - i;
      for (let j = 0; j < i; j++) {
        const s = j * 3;
        L.seg(j, src[s], src[s + 1], src[s + 2], src[s + 3], src[s + 4], src[s + 5]);
      }
      const s = i * 3;
      head.set(lerp(src[s], src[s + 3], fr), lerp(src[s + 1], src[s + 4], fr), lerp(src[s + 2], src[s + 5], fr));
      L.seg(i, src[s], src[s + 1], src[s + 2], head.x, head.y, head.z);
      L.done(i + 1);
    },
  };
  return L;
}

/** Point in polygon ([x, z] list). */
const inside = (poly, x, z) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};

/* ───────────────────────────────────────────────────────────── the water */

/** A river as a ribbon along its axis (km), its width interpolated: centre samples, both banks, and the strip. */
function ribbon(axisKm, widthKm, n = 160) {
  const curve = new THREE.CatmullRomCurve3(axisKm.map(([x, z]) => new THREE.Vector3(x * K, 0, z * K)), false, "centripetal");
  const c = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = curve.getPoint(t);
    const f = t * (widthKm.length - 1);
    const j = Math.min(widthKm.length - 2, Math.floor(f));
    c.push([p.x, p.z, (lerp(widthKm[j], widthKm[j + 1], f - j) * K) / 2]);
  }
  const left = [], right = [], pos = [], uv = [];
  let along = 0;
  for (let i = 0; i <= n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n, i + 1)];
    let tx = b[0] - a[0], tz = b[1] - a[1];
    const l = Math.hypot(tx, tz) || 1;
    tx /= l; tz /= l;
    if (i > 0) along += Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]);
    const w = c[i][2];
    left.push([c[i][0] - tz * w, c[i][1] + tx * w]);
    right.push([c[i][0] + tz * w, c[i][1] - tx * w]);
    pos.push(left[i][0], 0, left[i][1], right[i][0], 0, right[i][1]);
    uv.push(along, -1, along, 1);
  }
  const index = [];
  for (let i = 0; i < n; i++) index.push(2 * i, 2 * i + 2, 2 * i + 1, 2 * i + 1, 2 * i + 2, 2 * i + 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(index);
  return { c, left, right, geo };
}

/** Distance (cm) from (x, z) to a ribbon's water: < 0 inside. */
function waterDist(rib, x, z) {
  let best = Infinity;
  const c = rib.c;
  for (let i = 0; i < c.length - 1; i++) {
    const ax = c[i][0], az = c[i][1], bx = c[i + 1][0], bz = c[i + 1][1];
    const dx = bx - ax, dz = bz - az;
    const u = clamp01(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1));
    const d = Math.hypot(x - ax - u * dx, z - az - u * dz) - lerp(c[i][2], c[i + 1][2], u);
    if (d < best) best = d;
  }
  return best;
}

/** The water's surface: dark, a hair lighter at the banks; the current as soft streaks running downstream (`flow`);
 *  `lit` the river chosen, veille along its length. Clipped to the table's edges. */
function waterMat() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uLit: { value: 0 }, uFlow: { value: 0 }, uTime: { value: 0 }, uAmount: { value: 1 },
      uBase: { value: new THREE.Color(0x05080a) }, uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() },
      uBox: { value: new THREE.Vector4(TB.x0, TB.x1, TB.z0, TB.z1) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vW;
      void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uLit, uFlow, uTime, uAmount; uniform vec3 uBase, uInk, uVeille; uniform vec4 uBox;
      varying vec2 vUv; varying vec3 vW;
      float lane(float y, float c, float ph) {
        float d = abs(y - c);
        float on = 1.0 - smoothstep(0.04, 0.11, d);
        float s = fract((vUv.x - uTime * 14.0 + ph) / 120.0);
        return on * smoothstep(0.0, 0.3, s) * (1.0 - smoothstep(0.45, 0.75, s));
      }
      void main() {
        if (vW.x < uBox.x || vW.x > uBox.y || vW.z < uBox.z || vW.z > uBox.w) discard;
        float across = clamp(abs(vUv.y), 0.0, 1.0);
        vec3 c = uBase * (1.0 + 0.9 * across * across);
        float streak = lane(vUv.y, -0.52, 0.0) + lane(vUv.y, 0.0, 23.0) + lane(vUv.y, 0.52, 41.0);
        vec3 fc = mix(uInk, uVeille, uLit);
        c += fc * streak * 0.085 * uFlow;
        float core = 1.0 - across * across;
        c = mix(c, uVeille * (0.07 + 0.13 * core * core), uLit * 0.92);
        gl_FragColor = vec4(c * uAmount, 1.0);
      }`,
  });
}

/* ───────────────────────────────────────────────────────────── the blocks (merged boxes, no allocation later) */

/** Boxes written straight into arrays: centre (x, z), half-sizes along u (ux, uz) and across, height h — four sides
 *  and a top (nobody sees under a block on a table). Also the top's outline for the edges. */
function blockWriter() {
  const pos = [], nrm = [], edge = [];
  const quad = (a, b, c, d, n) => {
    for (const p of [a, b, c, a, c, d]) pos.push(p[0], p[1], p[2]);
    for (let i = 0; i < 6; i++) nrm.push(n[0], n[1], n[2]);
  };
  return {
    push(x, z, hu, hv, h, ux, uz, withEdge) {
      const vx = -uz, vz = ux; // across
      const P = (su, sv, y) => [x + su * hu * ux + sv * hv * vx, y, z + su * hu * uz + sv * hv * vz];
      const b = [P(-1, -1, 0), P(1, -1, 0), P(1, 1, 0), P(-1, 1, 0)];
      const t = [P(-1, -1, h), P(1, -1, h), P(1, 1, h), P(-1, 1, h)];
      quad(t[0], t[3], t[2], t[1], [0, 1, 0]);
      quad(b[0], b[1], t[1], t[0], [-vx, 0, -vz]);
      quad(b[1], b[2], t[2], t[1], [ux, 0, uz]);
      quad(b[2], b[3], t[3], t[2], [vx, 0, vz]);
      quad(b[3], b[0], t[0], t[3], [-ux, 0, -uz]);
      if (withEdge) for (let i = 0; i < 4; i++) edge.push(...t[i], ...t[(i + 1) % 4]);
    },
    geometry() {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
      return g;
    },
    edges: edge,
  };
}

/* ───────────────────────────────────────────────────────────── shapes */

const mirror = (half) => [...half, ...half.slice(1, -1).reverse().map(([x, z]) => [-x, z])];
/** The airliner seen from above, 30 cm long (nose −z): a map symbol, not a model. */
const GLYPH_TOP = mirror([[0, -15], [0.85, -14.3], [1.35, -12.6], [1.5, -3.2], [13.4, 4.2], [13.4, 5.6], [1.5, 2.6], [1.25, 9.6], [5.2, 13.1], [5.2, 14.2], [0.7, 14.0], [0, 15]]);
/** A boat from above, 8 cm (nose −z). */
const BOAT_TOP = mirror([[0, -4.4], [1.0, -2.9], [1.45, -1.0], [1.45, 3.7], [1.15, 4.1], [0, 4.1]]);
const flatGeo = (outline, thick, bevel) => plate(outline.map(([x, z]) => [x, -z]), thick, { bevel, round: 2 }).rotateX(-Math.PI / 2);

/* ───────────────────────────────────────────────────────────── the simulator passes */

/** A flight from (x, z) at compass psi: the turn back (the shortest way — left, from the strike) at radius R (cm) until
 *  the approach point is dead ahead, then straight legs through the waypoints; the corners rounded (Chaikin), then
 *  resampled every 4 cm. Returns [x, z] points. */
function fly(x, z, psi, waypoints, R) {
  const coarse = [[x, z]];
  const ds = 8;
  const ax = waypoints[0][0], az = waypoints[0][1];
  for (let n = 0; n < 300; n++) {
    const dp = wrap(Math.atan2(ax - x, -(az - z)) - psi);
    if (Math.abs(dp) <= ds / R) break;
    psi += Math.sign(dp) * (ds / R);
    x += ds * Math.sin(psi);
    z -= ds * Math.cos(psi);
    if (n % 2) coarse.push([x, z]);
  }
  coarse.push([x, z]);
  for (const w of waypoints) coarse.push([w[0], w[1]]);
  let pts = coarse;
  for (let k = 0; k < 4; k++) {
    const next = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      next.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  const out = [pts[0]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let d = 4 - carry;
    while (d <= l) {
      out.push([lerp(a[0], b[0], d / l), lerp(a[1], b[1], d / l)]);
      d += 4;
    }
    carry = l - (d - 4);
  }
  out.push(pts[pts.length - 1]);
  return out;
}
const RWY = {
  lga04: [GEO.lga.r04[0], GEO.lga.r04[1]],
  lga22: [GEO.lga.r04[1], GEO.lga.r04[0]],
  lga13: [GEO.lga.r13[0], GEO.lga.r13[1]],
  lga31: [GEO.lga.r13[1], GEO.lga.r13[0]],
  teb01: [GEO.teb.r01[0], GEO.teb.r01[1]],
};
/** A landing on runway `r`: an approach point on its extended centreline, the threshold, a short roll. */
const landing = (r, before = 75) => {
  const [a, b] = RWY[r];
  const ax = a[0] * K, az = a[1] * K, bx = b[0] * K, bz = b[1] * K;
  const l = Math.hypot(bx - ax, bz - az);
  const dx = (bx - ax) / l, dz = (bz - az) / l;
  return [[ax - dx * before, az - dz * before], [ax, az], [ax + dx * 40, az + dz * 40]];
};
// fifteen retained, eight reach a runway (report p. 50) — which runway each aimed at is NOT a fact drawn: no label
const PASSES = [
  { to: "lga22", R: 50, ok: 1 }, { to: "lga13", R: 62, ok: 1 }, { to: "teb01", R: 58, ok: 1 }, { to: "lga22", R: 74, ok: 1 },
  { to: "lga31", R: 66, ok: 1 }, { to: "lga04", R: 56, ok: 1 }, { to: "teb01", R: 76, ok: 1 }, { to: "lga13", R: 80, ok: 1 },
  { to: "lga22", R: 88, ok: 0, f: 0.7 }, { to: "lga13", R: 94, ok: 0, f: 0.62 }, { to: "teb01", R: 86, ok: 0, f: 0.74 },
  { to: "lga04", R: 100, ok: 0, f: 0.8 }, { to: "lga31", R: 84, ok: 0, f: 0.67 }, { to: "teb01", R: 96, ok: 0, f: 0.58 },
  { to: "lga22", R: 70, ok: 0, f: 0.84 },
];

/** [x, z] points → xyz Float32Array, the height falling from y0 to 0 over the first `f` of the length (cut there). */
function withHeight(pts, y0, f = 1) {
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = len[len.length - 1] * f;
  const out = [];
  for (let i = 0; i < pts.length && len[i] <= L + 1e-6; i++) {
    const u = len[i] / L;
    // a glide that flattens near the ground (the flare)
    const y = y0 * Math.max(0, 1 - u) * (0.55 + 0.45 * (1 - u));
    out.push(pts[i][0], Math.max(0.6, y), pts[i][1]);
  }
  return new Float32Array(out);
}

/* ───────────────────────────────────────────────────────────── the basin */

const WATER = -6; //                the basin's water level (local y)
const MR = 3.15; //                 the model's fuselage radius (60 cm long, an A320's proportions)
/** The two drops, in the basin's local frame (x along the basin, the model's nose +x): where it starts, its height
 *  above the water, when it touches (uT), how far it slides, how hard it stops. A: nearly flat; B: the real sink. */
const DROP = [
  { x0: -185, xT: -25, h0: 8, uT: 0.6, slide: 0.4, pitch: 7, after: 2.5, spray: 90, H: [1.5, 6], vz: [4, 20], life: [0.1, 0.22], ring: 70 },
  { x0: -205, xT: -45, h0: 32, uT: 0.55, slide: 0.24, pitch: 9.5, after: 1.5, spray: 300, H: [6, 36], vz: [12, 66], life: [0.12, 0.3], ring: 120 },
];
/** Where the model is at u (fills M: x, belly height above the water, pitch°). */
function dropAt(D, u, M) {
  if (u <= D.uT) {
    const s = u / D.uT;
    M.x = lerp(D.x0, D.xT, s);
    M.h = D.h0 * (1 - s);
    M.pitch = D.pitch;
    M.tau = -1;
    return M;
  }
  const v = (D.xT - D.x0) / D.uT; //    speed in cm per unit of u
  const tau = Math.min(u - D.uT, D.slide);
  const a = v / D.slide;
  M.x = D.xT + v * tau - 0.5 * a * tau * tau;
  const s = tau / D.slide;
  M.tau = (u - D.uT) / (1 - D.uT);
  if (D.h0 > 20) {
    // the hard one: the tail digs, the nose slams down, a small rebound, it settles low
    M.h = -3.2 * Math.sin(Math.PI * Math.min(1, s * 1.6)) * (1 - 0.4 * s) - 1.2 * smooth(0, 1, s);
    M.pitch = lerp(D.pitch, -2.5, smooth(0, 0.35, s)) + 4 * smooth(0.35, 0.7, s) * (1 - smooth(0.7, 1, s)) + D.after * smooth(0.7, 1, s);
  } else {
    M.h = -1.4 * smooth(0, 1, s);
    M.pitch = lerp(D.pitch, D.after, smooth(0, 1, s));
  }
  return M;
}

function buildModel() {
  const part = makePart("model");
  const skin = solid(0xd2cdc2, { rough: 0.42, metal: 0.08, coat: 0.35 });
  const dark = solid(0x7b8287, { rough: 0.5, metal: 0.2 });
  // the fuselage, nose +x
  const fus = lathe([[0, -30], [0.7, -29.4], [1.7, -26.2], [2.8, -21.5], [MR, -17], [MR, 20], [2.95, 23.8], [2.35, 26.8], [1.35, 29.1], [0, 30]], 48, { crease: 30 });
  fus.rotateZ(-Math.PI / 2);
  addMesh(part, fus, skin, { edgeOpacity: 0.55 });
  // the wings (swept, low on the fuselage), the tailplane, the fin
  const wing = flatGeo(mirror([[0, 4.2], [27.1, -8.4], [27.1, -11.0], [0, -5.9]]).map(([s, f]) => [f, s]), 0.7, 0.2);
  addMesh(part, wing, skin, { pos: [0, -1.9, 0], edgeOpacity: 0.6 });
  const tail = flatGeo(mirror([[0, -23.2], [9.9, -27.6], [9.9, -29.2], [0, -28.4]]).map(([s, f]) => [f, s]), 0.45, 0.12);
  addMesh(part, tail, skin, { pos: [0, 0.6, 0], edgeOpacity: 0.6 });
  const fin = plate([[-20.8, 2.2], [-27.4, 12.4], [-29.6, 12.4], [-29.8, 2.2]], 0.5, { bevel: 0.15 });
  addMesh(part, fin.translate(0, 0, -0.25), skin, { edgeOpacity: 0.6 });
  // two engines under the wings
  for (const s of [1, -1]) {
    const nac = lathe([[0, -3.2], [1.45, -3.2], [1.65, -2.2], [1.6, 2.2], [1.1, 3.4], [0, 3.4]], 32, { crease: 30 });
    nac.rotateZ(-Math.PI / 2);
    addMesh(part, nac, dark, { pos: [3.2, -4.1, 9.2 * s], edgeOpacity: 0.5 });
    addMesh(part, box(3.4, 1.8, 0.5, 0.15), dark, { pos: [1.6, -2.7, 9.2 * s], edges: false });
  }
  return part;
}

/* ───────────────────────────────────────────────────────────── build */

export function buildCarte() {
  const group = new THREE.Group();
  const mapG = new THREE.Group();
  group.add(mapG);
  const R = rng(1549);

  /* ── the table: a solid, the land its top ── */
  const tablePart = makePart("table");
  mapG.add(tablePart);
  const W = TB.x1 - TB.x0, Dp = TB.z1 - TB.z0;
  const land = solid(0x1d2226, { rough: 0.9, env: 0.4 });
  const tableMesh = addMesh(tablePart, box(W + 36, 30, Dp + 36, 3), land, { pos: [(TB.x0 + TB.x1) / 2, -15, (TB.z0 + TB.z1) / 2], edgeOpacity: 0.5 });
  tableMesh.castShadow = false;
  // the glyph keeps ≈ 6 % of the picture's height whatever the camera: fitted when the table draws (it draws first),
  // with the very camera that draws — no frame late, no camera handed over
  tableMesh.renderOrder = -1;
  tableMesh.onBeforeRender = (r, s, camera) => {
    if (camera.isPerspectiveCamera && mapG.visible) fitGlyph(camera);
  };

  /* ── the water: the Hudson (lit when chosen, its current), the East River and the Upper Bay ── */
  const hud = ribbon(GEO.hudson.axis, GEO.hudson.width);
  const east = ribbon([...GEO.eastRiver.axis, [12.2, -2.35], [13.9, -2.2]], [...GEO.eastRiver.width, 1.7, 1.8]);
  const BAY = [[-3.9, 9.4], [-3.5, 8.0], [-2.4, 7.7], [-1.6, 8.45], [-0.6, 8.7], [0.6, 8.8], [1.6, 8.5], [2.7, 8.9], [3.6, 9.4]].map(([x, z]) => [x * K, z * K]);
  const hudMat = waterMat();
  const eastMat = waterMat();
  const hudMesh = new THREE.Mesh(hud.geo, hudMat);
  hudMesh.position.y = WATER_Y;
  const eastMesh = new THREE.Mesh(east.geo, eastMat);
  eastMesh.position.y = WATER_Y - 0.02;
  const bayGeo = new THREE.ShapeGeometry(new THREE.Shape(BAY.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2);
  const bayUv = bayGeo.attributes.uv;
  for (let i = 0; i < bayUv.count; i++) bayUv.setXY(i, bayGeo.attributes.position.getZ(i), 0.8);
  const bayMesh = new THREE.Mesh(bayGeo, eastMat);
  bayMesh.position.y = WATER_Y - 0.06;
  for (const m of [hudMesh, eastMesh, bayMesh]) {
    m.renderOrder = 1;
    m.receiveShadow = false;
    mapG.add(m);
  }
  // the banks: a fine line each side, the Hudson's own (they turn veille with it)
  const clipPts = (list) => list.filter(([x, z]) => x >= TB.x0 - 1 && x <= TB.x1 + 1 && z >= TB.z0 - 1 && z <= TB.z1 + 1).map(([x, z]) => [x, WATER_Y + 0.25, z]);
  const hudBanks = [hud.left, hud.right].map((b) => fatLine(clipPts(b), { color: BRAND.ink, width: 2.6, opacity: 0.55 }));
  const bankMat = lineMat(BRAND.ink, 2.6, { opacity: 0.55 });
  hudBanks.forEach((l) => {
    l.material = bankMat;
    mapG.add(l);
  });
  for (const b of [east.left, east.right]) mapG.add(fatLine(clipPts(b), { color: BRAND.ink, width: 2.4, opacity: 0.42 }));
  const isWater = (x, z, margin) => waterDist(hud, x, z) < margin || waterDist(east, x, z) < margin || inside(BAY, x, z);

  /* ── the airports: their fields (a lighter patch), their runways (lines that light when offered) ── */
  const LGA_F = [[9.75, 0.45], [11.15, -2.05], [12.65, -0.45], [11.5, 0.75]].map(([x, z]) => [x * K, z * K]);
  const TEB_F = [[-5.3, -7.55], [-4.2, -7.75], [-4.05, -10.45], [-5.05, -10.45]].map(([x, z]) => [x * K, z * K]);
  const fieldMat = solid(0x2a3035, { rough: 0.85, env: 0.4 });
  const fieldPart = makePart("fields");
  mapG.add(fieldPart);
  for (const f of [LGA_F, TEB_F]) addMesh(fieldPart, flatGeo(f, 0.35, 0.1), fieldMat, { edgeOpacity: 0.3 });
  const rwyLine = (r, w = 5) => {
    const [a, b] = RWY[r];
    const l = fatLine([[a[0] * K, 0.7, a[1] * K], [b[0] * K, 0.7, b[1] * K]], { color: BRAND.ink, width: w, opacity: 0.9 });
    mapG.add(l);
    return l;
  };
  const RWL = [{ l: rwyLine("lga04"), opts: 0 }, { l: rwyLine("lga13"), opts: 1 }, { l: rwyLine("teb01"), opts: 3 }]; // opts 1: offered as 13 or 31
  const thrRing = new THREE.Mesh(new THREE.RingGeometry(0.72, 1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  thrRing.renderOrder = 6;
  thrRing.visible = false;
  mapG.add(thrRing);

  /* ── the city: Manhattan dense on its avenues (Central Park empty), the other boroughs low and sparse ── */
  const MAN = GEO.manhattan.map(([x, z]) => [x * K, z * K]);
  const ax = [0.296, -0.955]; //            along the island (north-north-east)
  const pr = [0.955, 0.296]; //             across it
  const PARK = { c: [2.8 * K, -2.8 * K], half: [2.0 * K, 0.42 * K] }; // Central Park, in (along, across)
  const inPark = (x, z) => {
    const dx = x - PARK.c[0], dz = z - PARK.c[1];
    return Math.abs(dx * ax[0] + dz * ax[1]) < PARK.half[0] && Math.abs(dx * pr[0] + dz * pr[1]) < PARK.half[1];
  };
  const manW = blockWriter();
  let umin = Infinity, umax = -Infinity, vmin = Infinity, vmax = -Infinity;
  for (const [x, z] of MAN) {
    const u = x * ax[0] + z * ax[1], v = x * pr[0] + z * pr[1];
    umin = Math.min(umin, u); umax = Math.max(umax, u); vmin = Math.min(vmin, v); vmax = Math.max(vmax, v);
  }
  const PU = 8, PV = 15;
  for (let u = umin; u < umax; u += PU) {
    for (let v = vmin; v < vmax; v += PV) {
      const cu = u + PU / 2, cv = v + PV / 2;
      const x = cu * ax[0] + cv * pr[0], z = cu * ax[1] + cv * pr[1];
      if (!inside(MAN, x, z) || isWater(x, z, 2) || inPark(x, z)) continue;
      const r = R();
      const mid = Math.exp(-(((z + 15) / 80) ** 2)); //   Midtown
      const down = Math.exp(-(((z - 375) / 40) ** 2)); //  Downtown
      const up = smooth(-250, -650, z); //                 Harlem and north: low
      let h = 1.4 + 2.6 * r * (1 - 0.5 * up) + (11 * mid + 10 * down) * r * r;
      const tower = h > 6.5;
      const hu = (tower ? 2.2 : 3.0) + R() * 0.4, hv = (tower ? 4.2 : 6.2) + R() * 0.6;
      h = Math.max(1, h);
      manW.push(x, z, hu, hv, h, ax[0], ax[1], h > 3.5);
    }
  }
  const otherW = blockWriter();
  for (let x = TB.x0 + 8; x < TB.x1 - 6; x += 13) {
    for (let z = TB.z0 + 8; z < TB.z1 - 6; z += 10) {
      // each district its own grid angle (a slow field), the blocks on it
      const ang = 0.5 * Math.sin(x * 0.0035 + 1.3) + 0.35 * Math.cos(z * 0.0028 + 0.4);
      const ux = Math.cos(ang), uz = Math.sin(ang);
      const jx = x + (R() - 0.5) * 2, jz = z + (R() - 0.5) * 2;
      if (R() > 0.8) continue;
      if (inside(MAN, jx, jz) || isWater(jx, jz, 5) || inside(LGA_F, jx, jz) || inside(TEB_F, jx, jz)) continue;
      const nearShore = jx < 0 && waterDist(hud, jx, jz) < 60 ? 1 : 0; // the New Jersey waterfront rises a little
      const h = 0.6 + 0.9 * R() + nearShore * 3 * R() * R();
      otherW.push(jx, jz, 4.6, 3.3, h, ux, uz, false);
    }
  }
  const manGlass = glass(BRAND.ink, { base: 0.05, rim: 0.5, power: 2.0, edge: 0.4 });
  const otherGlass = glass(BRAND.ink, { base: 0.016, rim: 0.2, power: 2.2, edge: 0.18 });
  const manMesh = new THREE.Mesh(manW.geometry(), manGlass);
  const otherMesh = new THREE.Mesh(otherW.geometry(), otherGlass);
  asShell([manMesh, otherMesh], 20);
  mapG.add(manMesh, otherMesh);
  const manEdgesGeo = new LineSegmentsGeometry().setPositions(new Float32Array(manW.edges));
  const manEdges = new LineSegments2(manEdgesGeo, lineMat(BRAND.ink, 1.4, { opacity: 0.32 }));
  manEdges.renderOrder = 2;
  mapG.add(manEdges);

  /* ── the George Washington Bridge: its towers, its deck, its cables ── */
  const gwbPart = makePart("gwb");
  mapG.add(gwbPart);
  const steel = solid(0x8e959a, { rough: 0.55, metal: 0.25 });
  const ga = [GEO.gwb.a[0] * K, GEO.gwb.a[1] * K], gb = [GEO.gwb.b[0] * K, GEO.gwb.b[1] * K];
  const glen = Math.hypot(gb[0] - ga[0], gb[1] - ga[1]);
  const gdx = (gb[0] - ga[0]) / glen, gdz = (gb[1] - ga[1]) / glen;
  const deckY = (GEO.gwb.deck / 1000) * K, towerH = (GEO.gwb.towers / 1000) * K;
  const gang = Math.atan2(-gdz, gdx);
  addMesh(gwbPart, box(glen + 16, 0.9, 2.2, 0.2), steel, { pos: [(ga[0] + gb[0]) / 2, deckY, (ga[1] + gb[1]) / 2], rot: [0, gang, 0], edgeOpacity: 0.6 });
  for (const t of [0.04, 0.96]) {
    addMesh(gwbPart, box(1.6, towerH, 3.0, 0.2), steel, { pos: [lerp(ga[0], gb[0], t), towerH / 2, lerp(ga[1], gb[1], t)], rot: [0, gang, 0], edgeOpacity: 0.6 });
  }
  const cable = [];
  for (let i = 0; i <= 24; i++) {
    const t = lerp(0.04, 0.96, i / 24);
    const s = (i / 24) * 2 - 1;
    cable.push([lerp(ga[0], gb[0], t), deckY + 0.6 + (towerH - deckY - 0.6) * s * s, lerp(ga[1], gb[1], t)]);
  }
  mapG.add(fatLine(cable, { color: BRAND.ink, width: 2.2, opacity: 0.85 }));

  /* ── the route flown (ink), its veille part down the river once chosen, its trace on the table ── */
  const sample = (from, to, dt) => {
    const out = [];
    for (let t = from; t <= to + 1e-6; t += dt) {
      pathAt(Math.min(t, to), OUT);
      out.push(OUT[0] * G2M, Math.max(0.6, OUT[1] * G2M), OUT[2] * G2M);
    }
    return new Float32Array(out);
  };
  const ROUTE = sample(T0, T1, 0.5);
  const NR = ROUTE.length / 3;
  const ROUTE_G = ROUTE.slice();
  for (let i = 1; i < ROUTE_G.length; i += 3) ROUTE_G[i] = 0.5;
  const RIVER = sample(DAY.hudson, T1, 0.5);
  const NV = RIVER.length / 3;
  const route = dynLine(NR, { color: BRAND.ink, width: 6, opacity: 0.95 });
  const routeV = dynLine(NV, { color: BRAND.veille, width: 7, opacity: 1, order: 5 });
  const routeG = dynLine(NR, { color: BRAND.ink, width: 3, opacity: 0.3, order: 3 });
  mapG.add(route.line, routeV.line, routeG.line);

  /* ── the glyph: a solid airliner symbol, its shadow straight under it, a thread to the table ── */
  const glyphRoot = new THREE.Group();
  mapG.add(glyphRoot);
  const glyphScale = new THREE.Group();
  glyphRoot.add(glyphScale);
  const glyphPart = makePart("glyph");
  glyphScale.add(glyphPart);
  const glyphMat = solid(0xe2ddd1, { rough: 0.42, metal: 0.05, coat: 0.4 });
  const gm = addMesh(glyphPart, flatGeo(GLYPH_TOP, 2.6, 0.6).translate(0, -1.3, 0), glyphMat, { edgeOpacity: 0.5, edgeWidth: 2 });
  const finG = plate([[9.8, 0], [13.6, 0], [14.6, 5.2], [12.6, 5.2]], 0.7, { bevel: 0.2 }).rotateY(-Math.PI / 2).translate(0.35, 0.8, 0);
  addMesh(glyphPart, finG, glyphMat, { edgeOpacity: 0.8 });
  gm.castShadow = false;
  glyphPart.traverse((o) => (o.castShadow = false));
  glyphPart.userData.part.meshes.length = 0; // a symbol casts no studio shadow: its own, straight under it
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6, depthWrite: false, fog: false });
  const shadow = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(GLYPH_TOP.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2), shadowMat);
  shadow.renderOrder = 2;
  mapG.add(shadow);
  const thread = dynLine(1, { color: BRAND.ink, width: 2.4, opacity: 0.6, order: 3 });
  mapG.add(thread.line);
  const foot = new THREE.Mesh(new THREE.RingGeometry(0.7, 1, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: BRAND.ink, transparent: true, opacity: 0.55, depthWrite: false, fog: false }));
  foot.renderOrder = 3;
  mapG.add(foot);
  const strikeMark = makeGlow(BRAND.signal, 26);
  mapG.add(strikeMark);
  pathAt(DAY.strike, OUT);
  const SX = OUT[0] * G2M, SY = OUT[1] * G2M, SZ = OUT[2] * G2M, SPSI = OUT[3];
  strikeMark.position.set(SX, SY, SZ);

  /* ── the options: a dotted pointer from the glyph to the runway offered (veille), struck when refused (signal) ── */
  const optLine = dynLine(1, { color: BRAND.veille, width: 6, dashed: true, dash: 9, gap: 6, order: 5 });
  const cross = dynLine(2, { color: BRAND.signal, width: 7, order: 6 });
  mapG.add(optLine.line, cross.line);
  const OPT_T = [null, GEO.lga.r13[0], GEO.lga.r13[1], GEO.teb.r01[0], [0, 0]].map((p) => (p ? [p[0] * K, p[1] * K] : null));

  /* ── the radio: a dotted line from the glyph to the controller, off the east edge; jammed, it breaks (signal) ── */
  const TR = [TB.x1 + 130, 60, -2 * K];
  const NRAD = 28;
  const radA = dynLine(NRAD, { color: BRAND.ink, width: 5, dashed: true, dash: 7, gap: 5, colors: true, order: 5 });
  const radB = dynLine(NRAD, { color: BRAND.ink, width: 5, dashed: true, dash: 7, gap: 5, colors: true, order: 5 });
  mapG.add(radA.line, radB.line);
  const sparkA = makeGlow(BRAND.signal, 16);
  const sparkB = makeGlow(BRAND.signal, 16);
  mapG.add(sparkA, sparkB);

  /* ── the route planned to Charlotte: from the glyph, west then south-west over the land, off the edge ── */
  const CH = [TB.x0 - 120, 110, TB.z1 + 110];
  const NCH = 40;
  const chLine = dynLine(NCH, { color: BRAND.ink, width: 5, dashed: true, dash: 12, gap: 8, colors: true, order: 4 });
  mapG.add(chLine.line);
  const CHP = new Float32Array((NCH + 1) * 3);

  /* ── the fifteen passes (Toulouse) and the late one ── */
  const passes = PASSES.map((ps, i) => {
    const way = landing(ps.to, 14 + (i % 3) * 8);
    const pts = fly(SX, SZ, SPSI, way, ps.R);
    const src = withHeight(pts, SY, ps.ok ? 1 : ps.f);
    const L = dynLine(src.length / 3, { color: BRAND.ink, width: 4.5, opacity: 0.9, order: 4 });
    mapG.add(L.line);
    const headG = makeGlow(BRAND.ink, 11);
    mapG.add(headG);
    return { ...ps, src, m: src.length / 3, L, headG };
  });
  const lateSrc = (() => {
    const head = [];
    for (let t = DAY.strike; t <= DAY.strike + SIMS.delay; t += 1) {
      pathAt(t, OUT);
      head.push([OUT[0] * G2M, OUT[2] * G2M, OUT[1] * G2M]);
    }
    pathAt(DAY.strike + SIMS.delay, OUT);
    const rest = fly(OUT[0] * G2M, OUT[2] * G2M, OUT[3], landing("lga13", 18), 80).slice(1);
    const tail = withHeight(rest, OUT[1] * G2M, 0.72);
    const out = [];
    for (const [x, z, y] of head) out.push(x, y, z);
    for (let i = 0; i < tail.length; i++) out.push(tail[i]);
    return new Float32Array(out);
  })();
  const late = dynLine(lateSrc.length / 3, { color: BRAND.signal, width: 6, opacity: 1, order: 6 });
  mapG.add(late.line);
  const lateHead = makeGlow(BRAND.signal, 15);
  const lateEnd = makeGlow(BRAND.signal, 20);
  mapG.add(lateHead, lateEnd);
  const failDots = passes.filter((p) => !p.ok).map(() => {
    const d = makeGlow(BRAND.ink, 9);
    mapG.add(d);
    return d;
  });

  /* ── the boats: nine tokens (seven ferries, the fireboat, the Coast Guard) converging on the plane ── */
  const boatMat = solid(0x2c8a63, { rough: 0.5, env: 0.8 });
  boatMat.emissive = VEILLE.clone();
  boatMat.emissiveIntensity = 0.42;
  const boatGeo = mergeGeometries([flatGeo(BOAT_TOP, 1.0, 0.25), box(1.7, 1.0, 3.4, 0.2).translate(0, 1.4, 0.6)]);
  const BOATS = [
    { s: [0.75, -0.45], a: 0.7, d: 0.0 }, { s: [0.72, -0.28], a: 1.6, d: 0.06 }, { s: [-0.7, -0.75], a: 3.7, d: 0.1 },
    { s: [0.8, -0.62], a: 2.4, d: 0.14 }, { s: [-0.78, -0.42], a: 4.4, d: 0.19 }, { s: [-0.86, 0.62], a: 5.1, d: 0.24 },
    { s: [0.7, 0.22], a: 0.05, d: 0.28 }, { s: [-0.4, 2.6], a: 5.75, d: 0.31 }, { s: [-0.72, 4.2], a: 2.95, d: 0.37 },
  ].map((b, i) => {
    const part = makePart(`boat${i}`);
    const mesh = addMesh(part, boatGeo, boatMat, { edgeOpacity: 0.7, edgeColor: 0x0c1a14 });
    mesh.castShadow = false;
    part.scale.setScalar(2.4);
    mapG.add(part);
    return { ...b, sx: b.s[0] * K, sz: b.s[1] * K, r: 52 + (i % 3) * 12, part, psi: 0 };
  });
  const wakes = dynLine(BOATS.length * 2, { color: BRAND.ink, width: 3.2, opacity: 0.8, colors: true, order: 3 });
  mapG.add(wakes.line);

  /* ══════════════════ the BASIN: a test tank in the dark, still water, a model airliner touching it ══════════════════ */
  const basinG = new THREE.Group();
  basinG.position.set(BASIN.at[0], BASIN.at[1], BASIN.at[2]);
  group.add(basinG);
  const BL = BASIN.len, BW = BASIN.w, BD = BASIN.depth;
  const floor = makeSurface({ radius: 2600, cell: 20, fade: 520, lift: 1 });
  floor.group.position.y = -BD - 0.5;
  floor.grid.uAmount.value = 0.18;
  basinG.add(floor.group);
  // the tank: glass walls (X-ray) and their edges; its water a dark, still surface; the water's body a faint glass
  const tankGeo = new THREE.BoxGeometry(BL, BD + 12, BW);
  const HW = BD + 12;
  const wall = (w, x, z, ry) => new THREE.PlaneGeometry(w, HW).rotateY(ry).translate(x, 0, z);
  const wallsGeo = mergeGeometries([wall(BL, 0, BW / 2, 0), wall(BL, 0, -BW / 2, Math.PI), wall(BW, BL / 2, 0, Math.PI / 2), wall(BW, -BL / 2, 0, -Math.PI / 2)]);
  const tankGlass = glass(BRAND.ink, { base: 0.004, rim: 0.22, power: 2.6, edge: 0.4 }); // walls only: an open tank (a lid would light up flat)
  const tank = new THREE.Mesh(wallsGeo, tankGlass);
  tank.position.y = -BD / 2 + 6;
  asShell(tank, 20);
  basinG.add(tank);
  const tankEdges = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(tankGeo)), lineMat(BRAND.ink, 2.4, { opacity: 0.7 }));
  tankEdges.position.copy(tank.position);
  tankEdges.renderOrder = 2;
  basinG.add(tankEdges);
  const rim = fatLine([[-BL / 2, WATER, BW / 2], [BL / 2, WATER, BW / 2], [BL / 2, WATER, -BW / 2], [-BL / 2, WATER, -BW / 2], [-BL / 2, WATER, BW / 2]], { color: BRAND.ink, width: 2.2, opacity: 0.55 });
  basinG.add(rim);
  const waterSurf = new THREE.Mesh(new THREE.PlaneGeometry(BL - 1, BW - 1).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x0a1115, roughness: 0.85, metalness: 0, envMapIntensity: 0.3 }));
  waterSurf.position.y = WATER;
  waterSurf.receiveShadow = true;
  basinG.add(waterSurf);
  // the model
  const model = buildModel();
  basinG.add(model);
  model.traverse((o) => {
    if (o.isMesh && !o.material.isLineMaterial) o.castShadow = true;
  });
  // the two descents drawn behind it (A ink, nearly flat; B signal, steep) — no ratio written
  const M = { x: 0, h: 0, pitch: 0, tau: -1 };
  const trajSrc = DROP.map((D) => {
    const out = [];
    for (let i = 0; i <= 140; i++) {
      dropAt(D, i / 140, M);
      out.push(M.x, WATER + MR + Math.max(0, M.h) + 0.2, 0);
    }
    return new Float32Array(out);
  });
  const trajA = dynLine(140, { color: BRAND.ink, width: 4, dashed: true, dash: 5, gap: 3.5, opacity: 0.85, order: 5 });
  const trajB = dynLine(140, { color: BRAND.signal, width: 5, dashed: true, dash: 5, gap: 3.5, opacity: 1, order: 5 });
  basinG.add(trajA.line, trajB.line);
  // the spray: points thrown from where the hull meets the water as it slides (one cloud per drop)
  const sprays = DROP.map((D, di) => {
    const r = rng(77 + di);
    const n = D.spray;
    const org = new Float32Array(n * 3), vel = new Float32Array(n * 3), born = new Float32Array(n), life = new Float32Array(n), size = new Float32Array(n);
    const Mm = { x: 0, h: 0, pitch: 0, tau: 0 };
    for (let i = 0; i < n; i++) {
      const e = D.uT + r() * r() * (1 - D.uT) * 0.55;
      dropAt(D, e, Mm);
      const side = r() < 0.5 ? -1 : 1;
      const wingish = r() < 0.3 ? 1 : 0;
      org.set([Mm.x - 6 - r() * 18, WATER + 0.3, side * (MR * 0.9 + r() * (wingish ? 20 : 3))], i * 3);
      const H = lerp(D.H[0], D.H[1], r() * r());
      vel.set([lerp(-6, 30, r()), 4 * H, side * lerp(D.vz[0], D.vz[1], r())], i * 3);
      born[i] = e;
      life[i] = lerp(D.life[0], D.life[1], r());
      size[i] = lerp(di ? 1.5 : 1.1, di ? 4.2 : 2.2, r());
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(org, 3));
    geo.setAttribute("aVel", new THREE.BufferAttribute(vel, 3));
    geo.setAttribute("aBorn", new THREE.BufferAttribute(born, 1));
    geo.setAttribute("aLife", new THREE.BufferAttribute(life, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uU: { value: 0 }, uPx: { value: 1000 }, uColor: { value: INK.clone() } },
      vertexShader: /* glsl */ `
        uniform float uU, uPx; attribute vec3 aVel; attribute float aBorn, aLife, aSize; varying float vA;
        void main() {
          float s = (uU - aBorn) / aLife;
          float on = step(0.0, s) * step(s, 1.0);
          s = clamp(s, 0.0, 1.0);
          vec3 p = position + vec3(aVel.x * s * (1.0 - 0.35 * s), aVel.y * s * (1.0 - s), aVel.z * s * (1.0 - 0.35 * s));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vA = on * (1.0 - s * s * s);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = on * aSize * (1.0 - 0.5 * s * s) * uPx / max(1.0, -mv.z);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA;
        void main() {
          vec2 q = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(q, q);
          if (r2 > 1.0) discard;
          gl_FragColor = vec4(uColor * 0.95 * (1.0 - r2 * r2) * vA, 1.0);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.MaxEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    pts.renderOrder = 8;
    pts.visible = false;
    basinG.add(pts);
    return { pts, mat };
  });
  // the ripples and the wake
  const ringMats = [0, 1].map(() => new THREE.MeshBasicMaterial({ color: BRAND.ink, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  const rings = ringMats.map((m) => {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 72).rotateX(-Math.PI / 2), m);
    r.position.y = WATER + 0.15;
    r.renderOrder = 6;
    r.visible = false;
    basinG.add(r);
    return r;
  });
  const wake = dynLine(2, { color: BRAND.ink, width: 3, opacity: 0.6, colors: true, order: 5 });
  basinG.add(wake.line);

  /* ── the anchors ── */
  const A = {};
  const anchor = (name, x, y, z, parent = group) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    A[name] = o;
  };
  anchor("ditch", 0, 0, 0);
  anchor("strike", SX, SY, SZ);
  anchor("lga04", GEO.lga.r04[0][0] * K, 0, GEO.lga.r04[0][1] * K);
  anchor("lga13", GEO.lga.r13[0][0] * K, 0, GEO.lga.r13[0][1] * K);
  anchor("lga31", GEO.lga.r13[1][0] * K, 0, GEO.lga.r13[1][1] * K);
  anchor("teb01", GEO.teb.r01[0][0] * K, 0, GEO.teb.r01[0][1] * K);
  anchor("gwb", (ga[0] + gb[0]) / 2, towerH, (ga[1] + gb[1]) / 2);
  anchor("tracon", TR[0], TR[1], TR[2]);
  anchor("charlotte", CH[0], CH[1], CH[2]);
  anchor("basin", BASIN.at[0], BASIN.at[1] + WATER, BASIN.at[2]);
  anchor("glyph", 0, 0, 0, glyphRoot);
  A.model = model;

  /* ══════════════════ per frame (no allocation) ══════════════════ */
  const tmp = new THREE.Vector3();
  const GS = { s: 1.4, x: 0, y: 0, z: 0, on: false };
  // the radio's arc from the glyph (RG) to the controller, and its fade off the edge — made once, not per frame
  const RG = { x: 0, y: 0, z: 0 };
  const radPt = (u) => tmp.set(lerp(RG.x, TR[0], u), lerp(RG.y, TR[1], u) + 26 * Math.sin(Math.PI * u), lerp(RG.z, TR[2], u));
  const fadeAt = (u) => 1 - smooth(0.82, 1, u);
  function fitGlyph(camera, x = GS.x, y = GS.y, z = GS.z) {
    tmp.set(x, y, z);
    const d = camera.position.distanceTo(tmp);
    const s = Math.min(3.6, Math.max(1.4, (0.1 * d * 2 * Math.tan((camera.fov * DEG) / 2)) / MAP.glyph));
    if (Math.abs(s - GS.s) < 1e-4) return;
    GS.s = s;
    glyphScale.scale.setScalar(s);
    glyphScale.updateMatrixWorld(true);
    shadow.scale.setScalar(s);
    shadow.updateMatrixWorld(true);
    foot.scale.setScalar(3.2 * s);
    foot.updateMatrixWorld(true);
    if (GS.on) {
      thread.seg(0, x, y - 1.2 * s, z, x, 0.5, z);
      thread.done(1);
    }
  }
  const col = new THREE.Color();

  function updateMap(p, time, px, ctx) {
    const t = ctx.t;
    pathAt(t, OUT);
    const gx = OUT[0] * G2M, gz = OUT[2] * G2M;
    const afloat = t >= T1;
    let gy = afloat ? 2 : Math.max(2, OUT[1] * G2M);
    const psi = OUT[3];
    const ga = clamp01(p.glyph);

    // the glyph: at its place, its heading, pitch and bank (its size: fitGlyph, when the table draws)
    if (ctx.camera) fitGlyph(ctx.camera, gx, gy, gz);
    const s = GS.s;
    if (afloat) gy = WATER_Y + 0.9 * s;
    GS.x = gx; GS.y = gy; GS.z = gz; GS.on = ga > 0.01 && gy > 4;
    glyphRoot.visible = ga > 0.01;
    glyphRoot.position.set(gx, gy, gz);
    glyphRoot.rotation.set(afloat ? 0 : OUT[4] * DEG, -psi, afloat ? 0 : -OUT[5] * DEG, "YXZ");
    glyphScale.scale.setScalar(s);
    setPartOpacity(glyphPart, ga);
    shadow.visible = foot.visible = ga > 0.01;
    shadow.position.set(gx, 0.45, gz);
    shadow.rotation.y = -psi;
    shadow.scale.setScalar(s);
    shadowMat.opacity = 0.6 * ga * (afloat ? 0 : 1);
    foot.position.set(gx, 0.5, gz);
    foot.scale.setScalar(3.2 * s);
    foot.material.opacity = 0.55 * ga * smooth(4, 10, gy);
    if (GS.on) {
      thread.seg(0, gx, gy - 1.2 * s, gz, gx, 0.5, gz);
      thread.done(1);
      thread.mat.opacity = 0.6 * ga;
    } else thread.done(0);

    // the route flown, up to `route` (−1: where the plane is); its veille part once the river is chosen
    const te = Math.min(T1, p.route < 0 ? t : p.route);
    const showRoute = p.route !== 0 && te > T0;
    const uR = showRoute ? (te - T0) / (T1 - T0) : 0;
    route.reveal(ROUTE, NR, uR);
    routeG.reveal(ROUTE_G, NR, uR);
    const lit = clamp01(p.riverLit);
    const uV = showRoute && lit > 0.01 ? (te - DAY.hudson) / (T1 - DAY.hudson) : 0;
    routeV.reveal(RIVER, NV, uV);
    routeV.mat.opacity = lit;
    const struck = showRoute && te >= DAY.strike ? 1 : 0;
    const simOn = Math.max(clamp01(p.sims * 6), clamp01(p.simLate * 6));
    strikeMark.visible = struck > 0 || simOn > 0;
    strikeMark.material.opacity = Math.max(struck, simOn) * (0.85 + 0.15 * Math.sin(time * 2.4));

    // the water: the Hudson chosen (veille), the current running south
    hudMat.uniforms.uLit.value = lit;
    hudMat.uniforms.uFlow.value = clamp01(p.flow) + 0.0;
    hudMat.uniforms.uTime.value = time;
    eastMat.uniforms.uTime.value = time;
    col.copy(INK).lerp(VEILLE, lit);
    bankMat.color.copy(col);
    bankMat.opacity = lerp(0.55, 1, lit);
    bankMat.linewidth = lerp(2.6, 4, lit);

    // the airports and the option offered
    const opt = Math.round(p.opt);
    const no = clamp01(p.optNo);
    const air = clamp01(p.airports);
    col.copy(VEILLE).lerp(SIGNAL, smooth(0, 0.35, no));
    for (let i = 0; i < RWL.length; i++) {
      const l = RWL[i].l;
      const o = RWL[i].opts;
      const on = (o === 1 && (opt === 1 || opt === 2)) || (o === 3 && opt === 3);
      l.material.color.copy(on ? col : INK);
      l.material.opacity = on ? 1 : 0.9 * air;
      l.visible = on || air > 0.01;
    }
    const target = opt >= 1 && opt <= 4 ? OPT_T[opt] : null;
    if (target && ga > 0.01) {
      const ty = opt === 4 ? WATER_Y + 0.5 : 0.8;
      optLine.seg(0, gx, gy, gz, target[0], ty, target[1]);
      optLine.done(1);
      optLine.mat.color.copy(opt === 4 ? VEILLE : col);
      optLine.mat.opacity = 1 - 0.35 * smooth(0.4, 1, no);
      optLine.mat.dashOffset = -time * 18;
      thrRing.visible = true;
      thrRing.position.set(target[0], ty + 0.3, target[1]);
      thrRing.scale.setScalar(opt === 4 ? 16 : 11);
      thrRing.material.color.copy(opt === 4 ? VEILLE : col).multiplyScalar(0.9 + 0.15 * Math.sin(time * 2.2));
      if (no > 0.01 && opt !== 4) {
        // the cross: on the pointer, three quarters of the way to the runway, lying flat
        const cx = lerp(gx, target[0], 0.72), cy = lerp(gy, ty, 0.72), cz = lerp(gz, target[1], 0.72);
        const dx = target[0] - gx, dz = target[1] - gz;
        const l = Math.hypot(dx, dz) || 1;
        const ux = dx / l, uz = dz / l;
        const a = 13 * smooth(0, 0.5, no);
        const c1x = (ux - uz) * 0.7071, c1z = (uz + ux) * 0.7071, c2x = (ux + uz) * 0.7071, c2z = (uz - ux) * 0.7071;
        cross.seg(0, cx - c1x * a, cy, cz - c1z * a, cx + c1x * a, cy, cz + c1z * a);
        cross.seg(1, cx - c2x * a, cy, cz - c2z * a, cx + c2x * a, cy, cz + c2z * a);
        cross.done(2);
      } else cross.done(0);
    } else {
      optLine.done(0);
      cross.done(0);
      thrRing.visible = false;
    }

    // the radio: out to the controller (radio), broken in its middle when jammed (jam)
    const rad = clamp01(p.radio);
    const jam = clamp01(p.jam);
    if (rad > 0.01 && ga > 0.01) {
      const gap = 0.11 * smooth(0, 0.6, jam);
      const g0 = 0.46 - gap, g1 = 0.46 + gap;
      RG.x = gx;
      RG.y = gy;
      RG.z = gz;
      let na = 0, nb = 0;
      for (let i = 0; i < NRAD; i++) {
        const u0 = (i / NRAD) * rad, u1 = ((i + 1) / NRAD) * rad;
        // first part [0, g0], second part [g1, rad]
        const a0 = Math.min(u0, g0), a1 = Math.min(u1, g0);
        if (a1 > a0) {
          const p0 = radPt(a0);
          const x0 = p0.x, y0 = p0.y, z0 = p0.z;
          const p1 = radPt(a1);
          radA.seg(na, x0, y0, z0, p1.x, p1.y, p1.z);
          radA.fade(na, fadeAt(a0), fadeAt(a1));
          na++;
        }
        const b0 = Math.max(u0, g1), b1 = Math.max(u1, g1);
        if (b1 > b0 && u1 > g1) {
          const p0 = radPt(b0);
          const x0 = p0.x, y0 = p0.y, z0 = p0.z;
          const p1 = radPt(b1);
          radB.seg(nb, x0, y0, z0, p1.x, p1.y, p1.z);
          radB.fade(nb, fadeAt(b0), fadeAt(b1));
          nb++;
        }
      }
      radA.done(na);
      radB.done(nb);
      col.copy(INK).lerp(SIGNAL, smooth(0, 0.4, jam));
      radA.mat.color.copy(col);
      radB.mat.color.copy(col);
      radA.mat.dashOffset = radB.mat.dashOffset = -time * 16;
      const sp = jam > 0.01 && rad > g1;
      sparkA.visible = sparkB.visible = sp;
      if (sp) {
        const k = smooth(0, 0.3, jam) * (1 - 0.35 * smooth(0.5, 1, jam));
        sparkA.position.copy(radPt(g0));
        sparkB.position.copy(radPt(g1));
        sparkA.material.opacity = sparkB.material.opacity = k;
      }
    } else {
      radA.done(0);
      radB.done(0);
      sparkA.visible = sparkB.visible = false;
    }

    // Charlotte: the plan, from the glyph west then south-west, off the edge
    const ch = clamp01(p.charlotte);
    if (ch > 0.01 && ga > 0.01) {
      const p1x = gx - 260, p1y = gy + 20, p1z = gz - 40;
      const p2x = TB.x0 + 40, p2y = 90, p2z = TB.z1 - 260;
      for (let i = 0; i <= NCH; i++) {
        const u = i / NCH, v = 1 - u;
        const b0 = v * v * v, b1 = 3 * v * v * u, b2 = 3 * v * u * u, b3 = u * u * u;
        CHP[i * 3] = b0 * gx + b1 * p1x + b2 * p2x + b3 * CH[0];
        CHP[i * 3 + 1] = b0 * gy + b1 * p1y + b2 * p2y + b3 * CH[1];
        CHP[i * 3 + 2] = b0 * gz + b1 * p1z + b2 * p2z + b3 * CH[2];
      }
      chLine.reveal(CHP, NCH + 1, ch);
      for (let i = 0; i < NCH; i++) chLine.fade(i, 1 - smooth(0.72, 1, i / NCH), 1 - smooth(0.72, 1, (i + 1) / NCH));
      chLine.mat.dashOffset = -time * 14;
    } else chLine.done(0);

    // the fifteen passes: drawn together from the strike; eight reach a runway and turn veille, seven stop short and dim
    const sims = clamp01(p.sims);
    let fi = 0;
    for (let i = 0; i < passes.length; i++) {
      const ps = passes[i];
      const u = sims > 0 ? clamp01((sims - 0.015 * i) / 0.79) : 0;
      ps.L.reveal(ps.src, ps.m, u);
      const arrive = smooth(0.9, 1, u);
      if (ps.ok) {
        ps.L.mat.color.copy(INK).lerp(VEILLE, arrive);
        ps.L.mat.opacity = 0.9;
        ps.L.mat.linewidth = lerp(4.5, 5.5, arrive);
      } else {
        ps.L.mat.color.copy(INK);
        ps.L.mat.opacity = 0.9 - 0.5 * arrive;
        const d = failDots[fi++];
        d.visible = arrive > 0.01;
        d.position.set(ps.src[ps.m * 3 - 3], ps.src[ps.m * 3 - 2], ps.src[ps.m * 3 - 1]);
        d.material.opacity = 0.7 * arrive;
      }
      ps.headG.visible = u > 0.001 && u < 0.999;
      if (ps.headG.visible) {
        ps.headG.position.copy(ps.L.head);
        ps.headG.material.opacity = 0.9 * (1 - smooth(0.9, 1, u));
      }
    }
    const lu = clamp01(p.simLate);
    const lm = lateSrc.length / 3;
    late.reveal(lateSrc, lm, lu);
    lateHead.visible = lu > 0.001 && lu < 0.999;
    if (lateHead.visible) lateHead.position.copy(late.head);
    lateEnd.visible = lu > 0.97;
    lateEnd.position.set(lateSrc[lm * 3 - 3], lateSrc[lm * 3 - 2] + 0.5, lateSrc[lm * 3 - 1]);
    lateEnd.material.opacity = smooth(0.97, 1, lu) * (0.85 + 0.15 * Math.sin(time * 2.4));

    // the boats: from their piers to a ring around the plane, a wake behind each while it runs
    const bm = clamp01(p.boatsMap);
    let nw = 0;
    for (let i = 0; i < BOATS.length; i++) {
      const b = BOATS[i];
      const u = clamp01((bm - b.d) / 0.55);
      const on = bm > b.d + 0.001;
      b.part.visible = on;
      if (!on) continue;
      const e = 1 - (1 - u) * (1 - u) * (1 - u);
      const tx = gx + b.r * Math.cos(b.a), tz = gz + b.r * Math.sin(b.a);
      const x = lerp(b.sx, tx, e), z = lerp(b.sz, tz, e);
      const dx = tx - b.sx, dz = tz - b.sz;
      const heading = Math.atan2(dx, -dz);
      b.part.position.set(x, WATER_Y + 0.1, z);
      b.part.rotation.y = -heading;
      b.part.scale.setScalar(2.4 * smooth(0, 0.08, u));
      const speed = 3 * (1 - u) * (1 - u); // de/du
      const L = 40 * Math.min(1, speed);
      if (L > 0.5) {
        const l = Math.hypot(dx, dz) || 1;
        const ux = dx / l, uz = dz / l;
        const sx = x - ux * 10, sz = z - uz * 10;
        const y = WATER_Y + 0.3;
        wakes.seg(nw, sx, y, sz, sx - ux * L - uz * L * 0.32, y, sz - uz * L + ux * L * 0.32);
        wakes.fade(nw, 0.9, 0);
        nw++;
        wakes.seg(nw, sx, y, sz, sx - ux * L + uz * L * 0.32, y, sz - uz * L - ux * L * 0.32);
        wakes.fade(nw, 0.9, 0);
        nw++;
      }
    }
    wakes.done(nw);
  }

  function updateBasin(p, time, px) {
    const fast = p.dropFast > 0.0005;
    const di = fast ? 1 : 0;
    const D = DROP[di];
    const u = clamp01(fast ? p.dropFast : p.dropK);
    dropAt(D, u, M);
    model.position.set(M.x, WATER + MR + M.h, 0);
    model.rotation.set(0, 0, M.pitch * DEG);
    // the descents: A while it flies (and kept, fainter, under B), B in signal
    trajA.reveal(trajSrc[0], 141, fast ? 1 : Math.min(u, DROP[0].uT + 0.02));
    trajA.mat.opacity = fast ? 0.45 : 0.85;
    trajA.line.visible = fast ? p.dropK > 0.5 : u > 0.002;
    trajB.reveal(trajSrc[1], 141, fast ? Math.min(u, DROP[1].uT + 0.02) : 0);
    // the spray
    for (let i = 0; i < 2; i++) {
      const on = i === di && u > DROP[i].uT;
      sprays[i].pts.visible = on;
      sprays[i].mat.uniforms.uU.value = u;
      sprays[i].mat.uniforms.uPx.value = px;
    }
    // the ripples (two rings from the touch) and the wake
    if (M.tau >= 0) {
      for (let i = 0; i < 2; i++) {
        const s = clamp01(M.tau * 1.6 - i * 0.25);
        rings[i].visible = s > 0.001 && s < 0.999;
        rings[i].position.x = D.xT - 8;
        rings[i].scale.setScalar(6 + s * D.ring);
        ringMats[i].opacity = 0.55 * (1 - s) * (1 - s);
      }
      const back = Math.max(D.xT - 20, M.x - 110);
      const spread = Math.min(26, (M.x - back) * 0.3);
      wake.seg(0, M.x - 24, WATER + 0.2, MR, back, WATER + 0.2, MR + spread);
      wake.seg(1, M.x - 24, WATER + 0.2, -MR, back, WATER + 0.2, -MR - spread);
      wake.fade(0, 0.85, 0);
      wake.fade(1, 0.85, 0);
      wake.done(M.x - 24 > back + 1 ? 2 : 0);
    } else {
      rings[0].visible = rings[1].visible = false;
      wake.done(0);
    }
  }

  return {
    group,
    A,
    update(p, time, px, ctx) {
      const spot = Math.round(p.spot);
      mapG.visible = spot === 0;
      basinG.visible = spot === 1;
      if (spot === 1) updateBasin(p, time, px);
      else updateMap(p, time, px, ctx);
    },
  };
}
