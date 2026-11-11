// DOSSIER 044 — Le gilet pare-balles : THE SYSTEM, solid (docs/044-decors.md § gilet.js).
//   · the vest on the body (`vest`): a soft carrier of cordura, darkest grey — the front pocket (two skins and a piped
//     gusset round its edge), the back carrier, two shoulder straps, two elastic side straps on each flank with their
//     velcro tabs (the flank stays open between them: rue.js's ribs show there). Fine stitches, no text, ever.
//   · the front panel (PANEL, 32 × 42 × 1.2 cm), in its own group (`out` slides it to the bench): the housse, sealed,
//     matt, a flange round its edge (two halves, `housse` opens them along ±x), and 24 woven layers, lighter. Every
//     layer is a real sheet: its plain weave (yarn pitch 0.4 cm drawn, a maquette) is drawn in the shader with fwidth —
//     the yarns fade into an even grained grey before they get finer than 2 px, never a moiré —, its seams (a box
//     stitch 1.4 cm in, two lines across) dotted on it.
//   · ONE displacement field moves everything that is fabric (layers, housse, both skins of the pocket, the section):
//     x += coneAt(y, z) (plan.js's own profile, 4.4 cm at the axis at `cone` 1) + the fold that runs out (`ring`, a
//     0.22 cm ripple on each layer, each a little late on the one before). Normals follow it analytically.
//   · the cut (`section`): a plane in the panel's own frame swept from beyond its edge (0) to the impact (1): what is
//     at z above it is discarded, fabric, pocket and straps; the stack's face on the plane is ONE strip that draws the
//     24 leaves (a light lip each), which melt into 6 strata, then into an even grey, as they get thinner on screen.
//   · the bullet: 9 mm round nose (lathe), the lightest solid; in flight a ball of light never under 7 px and a signal
//     wake with a hot heart (after 041's bille); its mushroom is a morph target (the nose squashed into a petalled
//     crown 1.7 × 0.8 cm, the base intact). After contact its front sits against the first whole layer.
//   · the yarns at work: `pierce` tears the front layers (a hole the bullet's size, frayed by the weave, wider deeper
//     as the nose spreads); `breaks` 36 broken yarn ends spring out of the hole (signal ribbons ≥ 2 px, 0 → 0.5 out,
//     0.5 → 1 they droop and dim; never a count that changes); `tense` the crossed yarns through the tip, veille, on
//     the layers that hold; `ring` the fold; `share` a veille band that crosses the thickness, a glow left behind it.
//   · on the bench: the 24 layers along the bullet's path like the pages of a book (`explode`, ±EXPLODE.fan about
//     their seam edge z −16), `litHousse` / `litSeams` / `litWeave`, the heart yarn (`fiber`: four twisted filaments
//     drawn out of the top edge of the first layer, the free end curled), `solo` + `spread` (the strain running along
//     the crossed yarns of one layer: a cross, then a star), the strength test (`test`, `load`), the two faces (`faces`).
// Three colours: ink the structure; veille what takes the strain; signal the bullet, its wake, what snaps.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { solid, glow, lineMat, edgesOf, anchor, box, plate } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { PANEL, IMPACT, SECTION, CONE, BULLET, OUT, EXPLODE, TEST } from "./plan.js";

const DEG = Math.PI / 180;
const N = PANEL.n;
const PITCH = PANEL.pitch; //                      0.05: one layer
const THICK = PITCH * 0.84; //                     a layer's own sheet
const STACK = PANEL.wear - PANEL.strike; //        1.2
const Y0 = PANEL.y - PANEL.h / 2, Y1 = PANEL.y + PANEL.h / 2; // 94 → 136
const Z0 = PANEL.z - PANEL.w / 2, Z1 = PANEL.z + PANEL.w / 2; // −16 → 16
const IY = IMPACT[1], IZ = IMPACT[2];
const CUT_OFF = Z1 + 4; //                         the section plane parked beyond everything
const FLANGE = 0.7; //                             the housse's sealed edge, outside the stack
const HOUSSE_AWAY = 30, HOUSSE_TURN = 18 * DEG; // the open housse steps back off the stack's line of sight
const FAN = 2.6; //                                 the pages' fan: 0 → 2 × EXPLODE.fan × FAN degrees, first to last
const HG = 0.005; //                               the housse stands this far off the stack (no two faces on one plane)
// the carrier's front pocket: outer face of its front skin, its back skin (the « dos de la poche »), its outline
const POCKET = { y0: 91.2, y1: 139, z: 17.6, rc: 2.6, t: 0.22, bulge: 0.55 };
POCKET.xF = PANEL.strike - PANEL.cover - HG - 0.03 - POCKET.t; // −11.575
POCKET.xB = PANEL.wear + PANEL.cover + HG + 0.04; //               −9.835
const BACK = { xF: 9.75, xB: 11.42 }; //           the back carrier (its armour hidden inside)
const VEL = { y: [101, 126.5], z: [10.4, 17.0], h: 5.8 }; // the side straps' heights, their velcro fields
const VIEWPORT = new THREE.Vector2(BRAND.W, BRAND.H);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// leaves fast, settles with a hair of overshoot: a sheet has weight
const settle = (u) => {
  const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  return e + Math.sin(Math.PI * u) ** 2 * 0.05 * (u > 0.5 ? 1 : 0.25);
};
const f5 = (x) => Number(x).toFixed(5);
// fabric is never machined: the kit's grain stays off it
const bare = (mat) => ((mat.userData.finish = false), mat);

/* ───────────────────────────────────────────────────────────────── geometry */

/** Nodes from a to b through c, tight at c (where the cone and the hole need them), looser away. */
function refine(a, b, c, h0, g, hmax, extra = []) {
  const out = [c];
  for (const dir of [-1, 1]) {
    const end = dir < 0 ? a : b;
    let x = c;
    for (;;) {
      const h = Math.min(hmax, h0 + g * Math.abs(x - c));
      const nx = x + dir * h;
      if (dir < 0 ? nx <= end + h * 0.4 : nx >= end - h * 0.4) {
        if (dir < 0) out.unshift(end);
        else out.push(end);
        break;
      }
      x = nx;
      if (dir < 0) out.unshift(x);
      else out.push(x);
    }
  }
  const all = [...out, ...extra.filter((v) => v > a && v < b)].sort((p, q) => p - q);
  return all.filter((v, i) => i === 0 || v - all[i - 1] > 0.02);
}

/** A rounded rectangle in (y, z): the warp that lays a grid's corners on their arcs. */
const roundWarp = (y0, y1, z0, z1, rc) => (y, z) => {
  const cy = Math.min(Math.max(y, y0 + rc), y1 - rc), cz = Math.min(Math.max(z, z0 + rc), z1 - rc);
  const dy = y - cy, dz = z - cz;
  if (dy === 0 || dz === 0) return [y, z];
  const r = Math.hypot(dy, dz);
  const k = Math.max(Math.abs(dy), Math.abs(dz)) / r;
  return [cy + dy * k, cz + dz * k];
};
function rrectLoop(y0, y1, z0, z1, rc, seg = 8) {
  const pts = [];
  const corner = (cy, cz, a0) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      pts.push([cy + Math.sin(a) * rc, cz + Math.cos(a) * rc]);
    }
  };
  corner(y0 + rc, z1 - rc, Math.PI); //        bottom, +z side
  corner(y1 - rc, z1 - rc, -Math.PI / 2); //   top, +z side
  corner(y1 - rc, z0 + rc, 0); //               top, −z side
  corner(y0 + rc, z0 + rc, Math.PI / 2); //    bottom, −z side
  return pts;
}

/** A thin sheet in the y-z plane: its front face at x = xAt(y, z) (normal −x), its back face t behind, and its rims. */
function sheet(ys, zs, t, { xAt = () => 0, warp = null } = {}) {
  const ny = ys.length, nz = zs.length;
  const pos = [], idx = [];
  const at = (i, j) => (warp ? warp(ys[i], zs[j]) : [ys[i], zs[j]]);
  for (const back of [false, true]) {
    const base = pos.length / 3;
    for (let i = 0; i < ny; i++)
      for (let j = 0; j < nz; j++) {
        const [y, z] = at(i, j);
        pos.push(xAt(y, z) + (back ? t : 0), y, z);
      }
    for (let i = 0; i < ny - 1; i++)
      for (let j = 0; j < nz - 1; j++) {
        const a = base + i * nz + j, b = a + nz, c = a + 1, d = b + 1;
        if (back) idx.push(a, b, c, c, b, d);
        else idx.push(a, c, b, c, d, b);
      }
  }
  // the rims, round the border (bottom → +z side → top → −z side)
  const loop = [];
  for (let j = 0; j < nz; j++) loop.push([0, j]);
  for (let i = 1; i < ny; i++) loop.push([i, nz - 1]);
  for (let j = nz - 2; j >= 0; j--) loop.push([ny - 1, j]);
  for (let i = ny - 2; i > 0; i--) loop.push([i, 0]);
  const base = pos.length / 3;
  for (const [i, j] of loop) {
    const [y, z] = at(i, j);
    const x = xAt(y, z);
    pos.push(x, y, z, x + t, y, z);
  }
  const L = loop.length;
  for (let m = 0; m < L; m++) {
    const fu = base + 2 * m, bu = fu + 1, fv = base + 2 * ((m + 1) % L), bv = fv + 1;
    idx.push(fu, bu, fv, bu, bv, fv);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** The piped edge of a pocket: a soft band from its front skin to its back skin, bulging out round the outline. */
function gusset(loop, xF, xB, bulge) {
  const K = 9, L = loop.length;
  const pos = [], idx = [];
  for (let m = 0; m < L; m++) {
    const [y, z] = loop[m];
    const [ya, za] = loop[(m + L - 1) % L], [yb, zb] = loop[(m + 1) % L];
    let ny = -(zb - za), nz = yb - ya; // outward (the loop turns counter-clockwise in (z, y))
    const l = Math.hypot(ny, nz) || 1;
    ny /= l;
    nz /= l;
    if (ny * (y - (POCKET.y0 + POCKET.y1) / 2) + nz * z < 0) (ny = -ny), (nz = -nz);
    for (let k = 0; k <= K; k++) {
      const u = k / K, o = bulge * Math.sin(Math.PI * u);
      pos.push(mix(xF, xB, u), y + ny * o, z + nz * o);
    }
  }
  for (let m = 0; m < L; m++)
    for (let k = 0; k < K; k++) {
      const a = m * (K + 1) + k, b = ((m + 1) % L) * (K + 1) + k;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** A strap: a soft flat band (width along `side`, thickness across) swept along a path; returns its two outer edges. */
function band(points, side, w, t) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "centripetal");
  const S = 48;
  const pos = [], idx = [], edgeA = [], edgeB = [];
  const s = new THREE.Vector3(...side).normalize();
  const T = new THREE.Vector3(), n = new THREE.Vector3(), P = new THREE.Vector3();
  for (let i = 0; i <= S; i++) {
    curve.getPointAt(i / S, P);
    curve.getTangentAt(i / S, T);
    n.crossVectors(T, s).normalize();
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      pos.push(P.x + s.x * a * w / 2 + n.x * b * t / 2, P.y + s.y * a * w / 2 + n.y * b * t / 2, P.z + s.z * a * w / 2 + n.z * b * t / 2);
    }
    edgeA.push([P.x - s.x * w / 2 + n.x * t / 2, P.y - s.y * w / 2 + n.y * t / 2, P.z - s.z * w / 2 + n.z * t / 2]);
    edgeB.push([P.x + s.x * w / 2 + n.x * t / 2, P.y + s.y * w / 2 + n.y * t / 2, P.z + s.z * w / 2 + n.z * t / 2]);
  }
  for (let i = 0; i < S; i++)
    for (let c = 0; c < 4; c++) {
      const a = i * 4 + c, b = i * 4 + ((c + 1) % 4);
      idx.push(a, a + 4, b, b, a + 4, b + 4);
    }
  idx.push(0, 1, 2, 0, 2, 3, S * 4, S * 4 + 2, S * 4 + 1, S * 4, S * 4 + 3, S * 4 + 2);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return { geo, edges: [edgeA, edgeB] };
}

/** Polylines → segment pairs, split on the section plane: what is beyond it fades as the cut comes. */
function splitAtCut(polys, closed = []) {
  const near = [], far = [];
  const c = SECTION.z;
  polys.forEach((pl, n) => {
    const L = pl.length, last = closed[n] ? L : L - 1;
    for (let i = 0; i < last; i++) {
      const a = pl[i], b = pl[(i + 1) % L];
      if ((a[2] <= c) === (b[2] <= c)) (a[2] <= c ? near : far).push(...a, ...b);
      else {
        const u = (c - a[2]) / (b[2] - a[2]);
        const m = [mix(a[0], b[0], u), mix(a[1], b[1], u), c];
        (a[2] <= c ? near : far).push(...a, ...m);
        (b[2] <= c ? near : far).push(...m, ...b);
      }
    }
  });
  return { near, far };
}
function lines(flat, color, width, opacity) {
  const g = new LineSegmentsGeometry();
  g.setPositions(flat.length ? flat : [0, 0, 0, 0, 0, 0]);
  const obj = new LineSegments2(g, lineMat(color, width, { opacity }));
  obj.renderOrder = 2;
  obj.visible = flat.length > 0;
  obj.userData.on = flat.length > 0;
  return obj;
}

/* ───────────────────────────────────────────────────────────────── shaders: the fabric */

// both stages: the displacement field (plan.js's coneProfile, the fold), the hole
const COMMON = /* glsl */ `
uniform vec2 uImp;
uniform float uConeD, uRing, uCut, uPierce, uMush, uK;
varying vec3 vP;
#define SD_N ${f5(N)}
#define SD_R ${f5(CONE.R)}
#define SD_CK ${f5(CONE.k)}
#define SD_BUMP 0.22
float sdProf(float r) {
  if (r >= SD_R) return 0.0;
  float u = clamp(1.0 - r / SD_R, 0.0, 1.0);
  float rd = min(1.0, r / 1.2);
  return pow(u, SD_CK) * (0.92 + 0.08 * rd * rd);
}
float sdProfD(float r) {
  if (r >= SD_R) return 0.0;
  float u = clamp(1.0 - r / SD_R, 1e-5, 1.0);
  float rd = min(1.0, r / 1.2);
  float g = 0.92 + 0.08 * rd * rd;
  float dg = r < 1.2 ? 0.16 * rd / 1.2 : 0.0;
  return -SD_CK / SD_R * pow(u, SD_CK - 1.0) * g + pow(u, SD_CK) * dg;
}
// the fold on layer kf: its radius and its strength (each layer a little late on the one before)
vec2 sdRingAt(float kf) {
  float q = clamp(uRing * 1.35 - 0.35 * clamp(kf, 0.0, SD_N - 1.0) / (SD_N - 1.0), 0.0, 1.0);
  float a = smoothstep(0.0, 0.05, q) * (1.0 - smoothstep(0.82, 1.0, q)) * step(0.002, uRing);
  return vec2(q * SD_R, a);
}
// x displacement at (y, z) and its gradient
vec3 sdField(vec2 yz, float kf) {
  vec2 d = yz - uImp;
  float r = length(d);
  vec2 dir = d / max(r, 1e-4);
  vec2 ring = sdRingAt(kf);
  float e = (r - ring.x) / 0.75;
  float g = exp(-e * e);
  float f = uConeD * sdProf(r) + SD_BUMP * ring.y * g;
  float df = uConeD * sdProfD(r) + SD_BUMP * ring.y * g * (-2.0 * e / 0.75);
  return vec3(f, df * dir);
}
// the hole torn through layer kf (0: whole): the round nose's size in front, wider deeper as the nose spreads
float sdHoleR(float kf) {
  if (uPierce < 0.0005) return 0.0;
  float kp = uPierce * SD_N;
  float fr = clamp(kp - max(kf, 0.0), 0.0, 1.0);
  float depth = clamp(kf / max(kp, 1.0), 0.0, 1.0);
  return fr * (0.47 + 0.3 * uMush + 0.12 * uMush * depth);
}
// its edge, frayed by the weave
float sdJag(vec2 d, float kf) {
  if (dot(d, d) < 1e-8) return 1.0;
  float a = atan(d.y, d.x);
  return 1.0 + 0.16 * sin(5.0 * a + kf * 1.3) + 0.1 * sin(11.0 * a + kf * 2.1) + 0.06 * sin(23.0 * a - kf * 0.7);
}`;

const FRAG = /* glsl */ `
uniform float uShare, uTense, uSpread, uDot, uWeaveLit, uSeamLit, uLit, uTorn;
uniform vec3 uVeille, uSignal;
float sdH2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float sdN2(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(sdH2(i), sdH2(i + vec2(1.0, 0.0)), f.x), mix(sdH2(i + vec2(0.0, 1.0)), sdH2(i + vec2(1.0, 1.0)), f.x), f.y);
}
// « chaque couche prend sa part »: a band across the thickness, and a glow left on the layers it has passed
float sdShare(float kf) {
  if (uShare < 0.002) return 0.0;
  float c = uShare * (SD_N + 3.0) - 1.5;
  float e = (kf - c) / 1.5;
  return exp(-e * e) + 0.1 * (1.0 - smoothstep(c - 0.5, c + 0.5, kf));
}
// the strain along the crossed yarns from the impact: w how many neighbours share it, L how far along them it runs
float sdTens(vec2 p, float w, float L, float lod, float over, float sz, float sy) {
  vec2 iq = floor(p / ${f5(PANEL.weave)});
  vec2 ii = floor(uImp / ${f5(PANEL.weave)});
  float dj = abs(iq.y - ii.y) * ${f5(PANEL.weave)};
  float di = abs(iq.x - ii.x) * ${f5(PANEL.weave)};
  float tw = exp(-dj / w) * exp(-abs(p.x - uImp.x) / L);
  float tf = exp(-di / w) * exp(-abs(p.y - uImp.y) / L);
  float nearV = tw * (0.45 + 0.55 * sz) * (0.6 + 0.4 * (1.0 - over)) + tf * (0.45 + 0.55 * sy) * (0.6 + 0.4 * over);
  float wc = max(w, ${f5(PANEL.weave)});
  float farV = 0.55 * (exp(-abs(p.y - uImp.y) / wc) * exp(-abs(p.x - uImp.x) / L) + exp(-abs(p.x - uImp.x) / wc) * exp(-abs(p.y - uImp.y) / L));
  return mix(farV, nearV, lod);
}
// a stitched line at distance d from a point, t along it: (the groove, the thread)
vec2 sdStitch(float d, float t, float period) {
  float fw = max(fwidth(d), 1e-4);
  float hw = 0.06;
  float thread = (1.0 - smoothstep(hw, hw + 1.5 * fw, d)) * clamp(2.5 * hw / fw, 0.0, 1.0);
  float groove = (1.0 - smoothstep(0.13, 0.13 + 1.5 * fw, d)) * clamp(0.3 / fw, 0.0, 1.0);
  float s = t / period;
  float ds = fwidth(s);
  float dash = 1.0 - smoothstep(0.3 - ds, 0.3 + ds, abs(fract(s) - 0.5));
  dash = mix(dash, 0.6, smoothstep(0.25, 0.5, ds));
  return vec2(groove, thread * dash);
}
// the layer's seams: a box stitch ${PANEL.stitch} cm in, two lines across
vec2 sdSeamL(vec2 p) {
  float yA = ${f5(Y0 + PANEL.stitch)}, yB = ${f5(Y1 - PANEL.stitch)}, zA = ${f5(Z0 + PANEL.stitch)}, zB = ${f5(Z1 - PANEL.stitch)};
  float inY = step(yA - 0.06, p.x) * step(p.x, yB + 0.06);
  float inZ = step(zA - 0.06, p.y) * step(p.y, zB + 0.06);
  float dv = min(abs(p.y - zA), abs(p.y - zB)) + (1.0 - inY) * 9.0;
  float dh = min(min(abs(p.x - yA), abs(p.x - yB)), min(abs(p.x - ${f5(Y0 + 14)}), abs(p.x - ${f5(Y0 + 28)}))) + (1.0 - inZ) * 9.0;
  return dv < dh ? sdStitch(dv, p.x, 0.62) : sdStitch(dh, p.y, 0.62);
}
// cordura: a coarse basket weave, faded to grain from afar
float sdCordura(vec2 p) {
  vec2 q = p / 0.17;
  vec2 f = fract(q);
  float over = mod(floor(q.x) + floor(q.y), 2.0);
  float h = mix(sin(3.14159 * f.y), sin(3.14159 * f.x), over);
  float lod = 1.0 - smoothstep(0.25, 0.6, fwidth(q.x) + fwidth(q.y));
  return mix(0.97, 0.86 + 0.2 * h, lod) * (0.95 + 0.1 * sdN2(p * 0.9));
}`;

/** Shared uniforms (one object each: every fabric material reads the same value). */
function sharedUniforms() {
  return {
    uImp: { value: new THREE.Vector2(IY, IZ) }, uConeD: { value: 0 }, uRing: { value: 0 }, uCut: { value: CUT_OFF },
    uPierce: { value: 0 }, uMush: { value: 0 }, uShare: { value: 0 }, uTense: { value: 0 }, uWeaveLit: { value: 0 },
    uSeamLit: { value: 0 }, uTorn: { value: 0 }, uVeille: { value: VEILLE.clone() }, uSignal: { value: SIGNAL.clone() },
  };
}

/**
 * A fabric material: a kit solid with the field, the cut, the hole, its weave and its lights.
 *   kind  "layer" | "cap" | "housse" | "pocket" | "plain"
 *   cone  the sheet follows the displacement field · hole  it is torn by `pierce` · velcro  the pocket's two fields
 */
function fabric(color, U, kind, { k = 0, cone = true, hole = false, velcro = false, rough = 0.8, metal = 0, double = false } = {}) {
  const mat = bare(solid(color, { rough, metal, double }));
  const own = { uK: { value: k }, uSpread: { value: 0 }, uDot: { value: 0 }, uLit: { value: 0 } };
  const defs = [`#define SD_${kind.toUpperCase()}`, cone ? "#define SD_CONE" : "", hole ? "#define SD_HOLE" : "", velcro ? "#define SD_VELCRO" : ""].join("\n");
  const kf = kind === "cap" ? "position.x * SD_N - 0.5" : "uK";
  const vNormal = kind === "cap"
    ? /* glsl */ `vec3 sdFd = sdField(vec2(position.y, uCut), ${kf});\n  vec3 objectNormal = vec3(0.0, 0.0, 1.0);`
    : /* glsl */ `
  #ifdef SD_CONE
    vec3 sdFd = sdField(position.yz, ${kf});
  #else
    vec3 sdFd = vec3(0.0);
  #endif
  vec3 objectNormal = vec3(normal);
  objectNormal.yz -= sdFd.yz * objectNormal.x;
  objectNormal = normalize(objectNormal);`;
  const vBegin = kind === "cap"
    ? /* glsl */ `vec3 transformed = vec3(${f5(PANEL.strike)} + position.x * ${f5(STACK)} + sdFd.x, position.y, uCut);\n  vP = position;`
    : /* glsl */ `vec3 transformed = vec3(position);\n  transformed.x += sdFd.x;\n  vP = position;`;
  const discard = kind === "cap"
    ? /* glsl */ `
  float sdKf = vP.x * SD_N;
  float sdRow = floor(min(sdKf, SD_N - 0.001));
  vec2 sdC = vec2(vP.y, uCut) - uImp;
  float sdRc = length(sdC);
  float sdRhC = sdHoleR(sdRow);
  if (sdRhC > 0.0 && sdRc < sdRhC * sdJag(sdC, sdRow)) discard;`
    : /* glsl */ `
  if (vP.z > uCut) discard;
  #ifdef SD_HOLE
  {
    vec2 sdHd = vP.yz - uImp;
    float sdHr = sdHoleR(uK);
    if (sdHr > 0.0 && length(sdHd) < sdHr * sdJag(sdHd, uK)) discard;
  }
  #endif`;
  const color_ = {
    layer: /* glsl */ `
  vec2 sdQ = vP.yz / ${f5(PANEL.weave)};
  vec2 sdF = fract(sdQ);
  vec2 sdI = floor(sdQ);
  float sdOver = mod(sdI.x + sdI.y, 2.0);
  float sdSy = sin(3.14159 * sdF.x), sdSz = sin(3.14159 * sdF.y);
  float sdH = mix(sdSz * (0.62 + 0.38 * sdSy), sdSy * (0.62 + 0.38 * sdSz), sdOver);
  float sdLod = 1.0 - smoothstep(0.22, 0.55, fwidth(sdQ.x) + fwidth(sdQ.y));
  float sdShade = mix(0.95, 0.72 + 0.42 * sdH, sdLod) * (0.96 + 0.08 * sdN2(vP.yz * 1.3));
  vec2 sdSeam = sdSeamL(vP.yz);
  diffuseColor.rgb *= sdShade * (1.0 - 0.28 * sdSeam.x);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.84, 0.83, 0.8), 0.5 * sdSeam.y);`,
    cap: /* glsl */ `
  float sdFl = fract(sdKf);
  float sdFw = fwidth(sdKf);
  float sdL1 = 1.0 - smoothstep(0.22, 0.5, sdFw);
  float sdS = sdKf / 4.0;
  float sdFs = fract(sdS);
  float sdFws = fwidth(sdS);
  float sdL2 = 1.0 - smoothstep(0.22, 0.5, sdFws);
  float sdP1 = 0.9 + 0.42 * (1.0 - smoothstep(0.14, 0.14 + 2.0 * sdFw, sdFl)) - 0.34 * smoothstep(0.84 - 2.0 * sdFw, 0.84, sdFl);
  float sdP2 = 0.93 + 0.34 * (1.0 - smoothstep(0.07, 0.07 + 2.0 * sdFws, sdFs)) - 0.2 * smoothstep(0.88 - 2.0 * sdFws, 0.88, sdFs);
  float sdPat = mix(mix(0.97, sdP2, sdL2), sdP1, sdL1);
  float sdYq = vP.y / ${f5(PANEL.weave)};
  float sdLy = 1.0 - smoothstep(0.25, 0.5, fwidth(sdYq));
  sdPat *= mix(0.96, 0.86 + 0.16 * sin(3.14159 * fract(sdYq)), sdLy * sdL1);
  diffuseColor.rgb *= sdPat;`,
    housse: /* glsl */ `
  float sdDb = min(min(vP.y - ${f5(Y0 - FLANGE)}, ${f5(Y1 + FLANGE)} - vP.y), min(vP.z - ${f5(Z0 - FLANGE)}, ${f5(Z1 + FLANGE)} - vP.z));
  float sdFlg = 1.0 - smoothstep(0.42, ${f5(FLANGE)}, sdDb);
  diffuseColor.rgb *= (0.95 + 0.08 * sdN2(vP.yz * 2.2)) * (1.0 + 0.12 * sdFlg);`,
    pocket: /* glsl */ `
  diffuseColor.rgb *= sdCordura(vP.yz);
  float sdDy = min(vP.y - ${f5(POCKET.y0)}, ${f5(POCKET.y1)} - vP.y);
  float sdDz = ${f5(POCKET.z)} - abs(vP.z);
  vec2 sdSt = sdStitch(abs(min(sdDy, sdDz) - 0.95), sdDy < sdDz ? vP.z : vP.y, 0.5);
  diffuseColor.rgb *= 1.0 - 0.3 * sdSt.x;
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.5, 0.52, 0.55), 0.45 * sdSt.y);
  #ifdef SD_VELCRO
  {
    float sdVz = abs(vP.z);
    float sdVy = min(abs(vP.y - ${f5(VEL.y[0])}), abs(vP.y - ${f5(VEL.y[1])}));
    float sdIn = step(${f5(VEL.z[0])}, sdVz) * step(sdVz, ${f5(VEL.z[1])}) * step(sdVy, ${f5(VEL.h / 2)});
    float sdFuzz = 0.9 + 0.35 * sdN2(vP.yz * 9.0) * (1.0 - smoothstep(0.3, 0.8, fwidth(vP.y * 9.0)));
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.32 * sdFuzz, sdIn);
    float sdVd = min(min(abs(sdVz - ${f5(VEL.z[0])}), abs(sdVz - ${f5(VEL.z[1])})), abs(sdVy - ${f5(VEL.h / 2)}));
    diffuseColor.rgb *= 1.0 - 0.35 * sdStitch(sdVd, vP.y + vP.z, 0.4).x * step(sdVy, ${f5(VEL.h / 2 + 0.2)}) * step(${f5(VEL.z[0] - 0.2)}, sdVz) * step(sdVz, ${f5(VEL.z[1] + 0.2)});
  }
  #endif`,
    plain: /* glsl */ `
  diffuseColor.rgb *= sdCordura(vP.yz + vP.xx * 0.7);`,
  }[kind];
  const emissive_ = {
    layer: /* glsl */ `
  vec2 sdD2 = vP.yz - uImp;
  float sdR2 = length(sdD2);
  vec3 sdE = uVeille * 0.9 * sdShare(uK);
  vec2 sdRg = sdRingAt(uK);
  float sdRe = (sdR2 - sdRg.x) / 0.42;
  sdE += uVeille * 1.3 * sdRg.y * exp(-sdRe * sdRe);
  float sdKp = uPierce * SD_N;
  float sdHold = smoothstep(sdKp - 0.5, sdKp + 0.5, uK);
  sdE += uVeille * 1.35 * uTense * sdHold * exp(-max(uK - sdKp, 0.0) / 5.0) * sdTens(vP.yz, 0.14, 2.0 + 5.0 * uTense, sdLod, sdOver, sdSz, sdSy);
  float sdSp = smoothstep(0.0, 0.12, uSpread);
  if (sdSp > 0.0) {
    float sdW = mix(0.12, 3.2, smoothstep(0.3, 1.0, uSpread));
    float sdL = mix(1.5, 12.0, smoothstep(0.0, 0.5, uSpread));
    sdE += uVeille * 1.5 * sdSp * sdTens(vP.yz, sdW, sdL, sdLod, sdOver, sdSz, sdSy);
    sdE += uSignal * 2.2 * uDot * exp(-sdR2 * sdR2 / 0.06);
  }
  sdE += uVeille * 0.6 * uWeaveLit * mix(0.34, sdH * sdH, sdLod);
  sdE += uVeille * uSeamLit * (1.25 * sdSeam.y + 0.14 * sdSeam.x);
  float sdRh = sdHoleR(uK);
  if (sdRh > 0.0) sdE += uSignal * 1.1 * uTorn * exp(-max(sdR2 - sdRh * sdJag(sdD2, uK), 0.0) / 0.22);
  totalEmissiveRadiance += sdE;`,
    cap: /* glsl */ `
  vec3 sdE = uVeille * 0.95 * sdShare(sdKf - 0.5);
  float sdKp = uPierce * SD_N;
  float sdHold = smoothstep(sdKp - 0.5, sdKp + 0.5, sdRow + 0.5);
  float sdYarn = 0.45 + 0.55 * sin(3.14159 * sdFl);
  float sdTn = uTense * sdHold * exp(-abs(vP.y - uImp.x) / (0.8 + 1.8 * uTense)) * exp(-abs(uCut - uImp.y) / 0.4)
    * exp(-max(sdRow - sdKp, 0.0) / 5.0);
  sdE += uVeille * 1.4 * sdTn * mix(0.5, sdYarn * sdYarn, sdL1);
  vec2 sdRg = sdRingAt(sdKf - 0.5);
  float sdDz = uCut - uImp.y;
  float sdRy = sqrt(max(sdRg.x * sdRg.x - sdDz * sdDz, 0.0));
  float sdRe = (abs(vP.y - uImp.x) - sdRy) / 0.38;
  sdE += uVeille * 1.6 * sdRg.y * exp(-sdRe * sdRe);
  if (sdRhC > 0.0) sdE += uSignal * 1.25 * uTorn * exp(-max(sdRc - sdRhC * sdJag(sdC, sdRow), 0.0) / 0.25);
  totalEmissiveRadiance += sdE;`,
    housse: /* glsl */ `
  vec3 sdE = uVeille * uLit * (0.85 * sdFlg + 0.1);
  #ifdef SD_HOLE
  { vec2 sdHd = vP.yz - uImp; float sdHr = sdHoleR(uK); if (sdHr > 0.0) sdE += uSignal * 1.0 * uTorn * exp(-max(length(sdHd) - sdHr * sdJag(sdHd, uK), 0.0) / 0.2); }
  #endif
  totalEmissiveRadiance += sdE;`,
    pocket: /* glsl */ `
  #ifdef SD_HOLE
  { vec2 sdHd = vP.yz - uImp; float sdHr = sdHoleR(uK); if (sdHr > 0.0) totalEmissiveRadiance += uSignal * 0.9 * uTorn * exp(-max(length(sdHd) - sdHr * sdJag(sdHd, uK), 0.0) / 0.2); }
  #endif`,
    plain: "",
  }[kind];
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U, own);
    shader.vertexShader = `${defs}\n${COMMON}\n${shader.vertexShader
      .replace("#include <beginnormal_vertex>", vNormal)
      .replace("#include <begin_vertex>", vBegin)}`;
    shader.fragmentShader = `${defs}\n${COMMON}\n${FRAG}\n${shader.fragmentShader
      .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>\n${discard}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${color_}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${emissive_}`)}`;
  };
  mat.customProgramCacheKey = () => `gilet-${kind}-${cone}-${hole}-${velcro}`;
  mat.userData.own = own;
  return mat;
}

/** The shadow of a fabric sheet: the same field, the same cut (the part that is cut away casts nothing). */
function fabricDepth(U, own, kind, cone) {
  const mat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  const kf = kind === "cap" ? "position.x * SD_N - 0.5" : "uK";
  const vBegin = kind === "cap"
    ? `vec3 sdFd = sdField(vec2(position.y, uCut), ${kf});\n  vec3 transformed = vec3(${f5(PANEL.strike)} + position.x * ${f5(STACK)} + sdFd.x, position.y, uCut);\n  vP = position;`
    : `${cone ? `vec3 sdFd = sdField(position.yz, ${kf});` : "vec3 sdFd = vec3(0.0);"}\n  vec3 transformed = vec3(position);\n  transformed.x += sdFd.x;\n  vP = position;`;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U, own);
    shader.vertexShader = `${COMMON}\n${shader.vertexShader.replace("#include <begin_vertex>", vBegin)}`;
    shader.fragmentShader = `${COMMON}\n${shader.fragmentShader.replace(
      "#include <clipping_planes_fragment>",
      `#include <clipping_planes_fragment>\n${kind === "cap" ? "" : "if (vP.z > uCut) discard;"}`,
    )}`;
  };
  mat.customProgramCacheKey = () => `gilet-depth-${kind}-${cone}`;
  return mat;
}

function fabricMesh(geo, mat, U, kind, cone = true) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.customDepthMaterial = fabricDepth(U, mat.userData.own, kind, cone);
  mesh.frustumCulled = false; // the shader moves it
  return mesh;
}

/** Fade one mesh (its own material, and its edge lines if it has some). */
function fadeMesh(mesh, a) {
  mesh.visible = a > 0.004;
  const m = mesh.material;
  const base = m.userData.base ?? 1;
  m.opacity = base * a;
  const tr = a < 0.999 || !!m.userData.transparent;
  if (m.transparent !== tr) {
    m.transparent = tr;
    m.needsUpdate = true;
  }
  if (m.userData.depthWrite !== undefined) m.depthWrite = m.userData.depthWrite && a > 0.55;
  if (mesh.castShadow !== undefined && mesh.userData.shadow !== false) mesh.castShadow = a > 0.6;
  for (const c of mesh.children) if (c.isLineSegments2) fadeLine(c, a);
}
function fadeLine(line, a) {
  line.visible = !!line.userData.on && a > 0.004;
  line.material.opacity = (line.material.userData.base ?? 1) * a;
}

/* ───────────────────────────────────────────────────────────────── lights (after 041's bille) */

/** A ball of light with no edge, facing the eye: far away a hot heart that never shrinks under `minPx`. */
function makeHalo(heart, hue, { core = 0, minPx = 7 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: minPx },
      uAmount: { value: 0 }, uH: { value: BRAND.H }, uCore: { value: core },
    },
    vertexShader: /* glsl */ `
      uniform float uRadius, uMinPx, uH, uCore; varying vec2 vUv; varying float vK; varying float vS;
      void main() {
        vUv = position.xy;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        if (c.z > -0.5) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); vUv = vec2(2.0); vK = 0.0; vS = 0.0; return; }
        float depth = -c.z;
        float floorR = uMinPx * depth / (projectionMatrix[1][1] * uH * 0.5);
        float r = max(uRadius, floorR);
        vK = clamp(uRadius / max(r, 1e-4), 0.0, 1.0);
        vS = clamp(uCore / max(r, 1e-4), 0.0, 0.95);
        float k = max(depth - r, 0.5) / depth;
        c.xyz *= k;
        c.xy += position.xy * r * k;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv; varying float vK; varying float vS;
      void main() {
        float r2 = dot(vUv, vUv);
        if (r2 >= 1.0 || uAmount < 0.002) discard;
        float r = sqrt(r2);
        float core = exp(-r2 / mix(0.16, 0.012, vK));
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, r));
        vec3 far = (uHeart * core * 2.2 + uHue * (body + tail)) * max(0.6, vK);
        float g = exp(-max(r - vS, 0.0) / 0.2) * smoothstep(vS * 0.85, vS * 1.02, r) * (1.0 - smoothstep(0.7, 1.0, r));
        vec3 near = uHue * 0.6 * g + uHeart * 0.15 * g * g;
        gl_FragColor = vec4(mix(far, near, smoothstep(0.1, 0.2, vS)) * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  mesh.visible = false;
  return mesh;
}
const shine = (halo, amount, radius) => {
  halo.visible = amount > 0.003;
  halo.material.uniforms.uAmount.value = amount;
  halo.material.uniforms.uRadius.value = radius;
};

/** A tapered streak from `uHead` to `uTail` (never under `uWHead` px at its head), hot at the head: the wake. */
function makeTrail() {
  const n = 24;
  const pos = [];
  for (let i = 0; i <= n; i++) pos.push(i / n, -1, 0, i / n, 1, 0);
  const idx = [];
  for (let i = 0; i < n; i++) idx.push(2 * i, 2 * i + 2, 2 * i + 3, 2 * i, 2 * i + 3, 2 * i + 1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uHead: { value: new THREE.Vector3() }, uTail: { value: new THREE.Vector3(-1, 0, 0) }, uHcm: { value: 0.32 }, uWHead: { value: 6.5 },
      uWTail: { value: 2.4 }, uAmount: { value: 0 }, uView: { value: VIEWPORT },
      uHeart: { value: INK.clone().multiplyScalar(1.5) }, uHue: { value: SIGNAL.clone().multiplyScalar(1.4) },
    },
    vertexShader: /* glsl */ `
      uniform vec3 uHead, uTail; uniform float uHcm, uWHead, uWTail; uniform vec2 uView; varying float vS; varying float vSide;
      void main() {
        vS = position.x; vSide = position.y;
        vec4 mh = modelViewMatrix * vec4(uHead, 1.0);
        vec4 mt = modelViewMatrix * vec4(uTail, 1.0);
        if (mh.z > -1.0) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
        if (mt.z > -1.0) mt = mix(mh, mt, (-1.0 - mh.z) / (mt.z - mh.z));
        vec4 h = projectionMatrix * mh;
        vec4 t = projectionMatrix * mt;
        vec2 d = t.xy / t.w * 0.5 * uView - h.xy / h.w * 0.5 * uView;
        float len = length(d);
        vec2 dir = len > 0.01 ? d / len : vec2(1.0, 0.0);
        float wh = clamp(uHcm * projectionMatrix[1][1] * 0.5 * uView.y / h.w, uWHead, 220.0);
        vec4 c = mix(h, t, position.x);
        c.xy += vec2(-dir.y, dir.x) * position.y * 0.5 * mix(wh, uWTail, position.x) / (0.5 * uView) * c.w;
        gl_Position = c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying float vS; varying float vSide;
      void main() {
        float a = abs(vSide);
        float across = 1.0 - smoothstep(0.15, 1.0, a);
        float core = 1.0 - smoothstep(0.0, 0.35, a);
        float fade = pow(clamp(1.0 - vS, 0.0, 1.0), 1.4);
        vec3 c = uHue * across + uHeart * core * (1.0 - smoothstep(0.0, 0.12, vS)) * 0.8;
        gl_FragColor = vec4(c * fade * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  mesh.visible = false;
  return mesh;
}

/**
 * The broken yarn ends round the hole (instanced ribbons, never under 2 px), a pure function of `uBreak`:
 *   0 → 0.5 they spring out of the hole, straight, bright signal · 0.5 → 1 they droop toward the face and dim.
 * Each is rooted on the torn rim at its own depth, and rides the cone with the panel.
 */
function makeStrands(count, seed) {
  const S = 6;
  const base = new THREE.InstancedBufferGeometry();
  const pos = [], idx = [];
  for (let i = 0; i <= S; i++) pos.push(i / S, -1, 0, i / S, 1, 0);
  for (let i = 0; i < S; i++) idx.push(2 * i, 2 * i + 2, 2 * i + 3, 2 * i, 2 * i + 3, 2 * i + 1);
  base.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  base.setIndex(idx);
  const r = rng(seed);
  const root = new Float32Array(count * 3), shape = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    root[i * 3] = r(); //                                    depth into the torn stack (fraction)
    root[i * 3 + 1] = ((i + r() * 0.8) / count) * Math.PI * 2; // angle round the hole
    root[i * 3 + 2] = 0.95 + r() * 0.3; //                    radius factor on the rim
    shape[i * 4] = 0.35 + r() * r() * 1.05; //                length (cm)
    shape[i * 4 + 1] = 0.3 + r() * 0.9; //                    how much it springs back toward the street
    shape[i * 4 + 2] = (r() - 0.5) * 1.4; //                  curl
    shape[i * 4 + 3] = r(); //                                its own timing
  }
  base.setAttribute("aRoot", new THREE.InstancedBufferAttribute(root, 3));
  base.setAttribute("aShape", new THREE.InstancedBufferAttribute(shape, 4));
  base.instanceCount = count;
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uBreak: { value: 0 }, uImp: { value: new THREE.Vector2(IY, IZ) }, uConeD: { value: 0 }, uPierce: { value: 0 },
      uView: { value: VIEWPORT }, uHot: { value: SIGNAL.clone().multiplyScalar(1.7) }, uHeart: { value: INK.clone().multiplyScalar(1.4) },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aRoot; attribute vec4 aShape;
      uniform float uBreak; uniform vec2 uView;
      varying float vS; varying float vSide; varying float vA;
      ${COMMON}
      vec3 strandAt(float s, float ext, float fall) {
        float th = aRoot.y;
        vec2 rad = vec2(cos(th), sin(th));
        float rh = (0.47 + 0.2 * aRoot.x) * aRoot.z;
        float depth = -0.32 + aRoot.x * (uPierce * ${f5(STACK)} + 0.32);
        vec3 r0 = vec3(${f5(PANEL.strike)} + depth, uImp + rad * rh);
        vec3 d0 = normalize(vec3(-aShape.y, rad));
        vec3 d1 = normalize(vec3(0.5, -1.0 + 0.3 * rad.x, 0.35 * rad.y));
        vec3 side = normalize(vec3(0.0, -rad.y, rad.x));
        vec3 dir = normalize(mix(d0, d1, fall * s));
        vec3 p = r0 + (dir * s + side * aShape.z * s * s * 0.35) * aShape.x * ext;
        float rr = length(r0.yz - uImp);
        p.x += uConeD * sdProf(rr);
        return p;
      }
      void main() {
        vS = position.x; vSide = position.y;
        float b = clamp(uBreak, 0.0, 1.0);
        float ext = smoothstep(0.0, 0.32 + 0.12 * aShape.w, b);
        float fall = smoothstep(0.5, 1.0, b);
        vA = smoothstep(0.0, 0.08, b) * mix(1.0, 0.28, fall);
        vec3 p = strandAt(position.x, ext, fall);
        vec3 q = strandAt(min(position.x + 0.08, 1.0) - (position.x > 0.92 ? 0.08 : 0.0), ext, fall);
        vec4 mp = modelViewMatrix * vec4(p, 1.0);
        vec4 mq = modelViewMatrix * vec4(q, 1.0);
        vec4 h = projectionMatrix * mp;
        vec4 t = projectionMatrix * mq;
        vec2 d = (t.xy / t.w - h.xy / h.w) * 0.5 * uView;
        float len = length(d);
        vec2 dir = len > 1e-4 ? d / len : vec2(1.0, 0.0);
        if (position.x > 0.92) dir = -dir;
        float wpx = max(0.035 * projectionMatrix[1][1] * 0.5 * uView.y / h.w, 2.2) * mix(1.0, 0.55, position.x);
        h.xy += vec2(-dir.y, dir.x) * position.y * 0.5 * wpx / (0.5 * uView) * h.w;
        gl_Position = h;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot, uHeart; varying float vS; varying float vSide; varying float vA;
      void main() {
        if (vA < 0.004) discard;
        float across = 1.0 - smoothstep(0.35, 1.0, abs(vSide));
        vec3 c = mix(uHeart, uHot, smoothstep(0.0, 0.5, vS)) * (1.0 - 0.55 * vS);
        gl_FragColor = vec4(c * across * vA, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(base, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  mesh.visible = false;
  return mesh;
}

/* ───────────────────────────────────────────────────────────────── the bullet */

/** 9 mm round nose, its axis along +x, its tip at the origin; the mushroom as a morph target (same vertices). */
function bulletGeometry() {
  const M = 22, SEG = 48;
  const R = BULLET.d / 2, L = BULLET.len;
  const round = [], mush = [];
  for (let j = 0; j <= M; j++) {
    const t = j / M;
    // the round nose: base centre → base edge → a straight body → an elliptic nose to the tip
    let r, y;
    if (t < 0.06) (r = (t / 0.06) * (R - 0.04)), (y = -L);
    else if (t < 0.1) (r = R - 0.04 + ((t - 0.06) / 0.04) * 0.04), (y = -L + ((t - 0.06) / 0.04) * 0.04);
    else if (t < 0.42) (r = R), (y = mix(-L + 0.04, -L + 0.72, (t - 0.1) / 0.32));
    else {
      const s = (t - 0.42) / 0.58;
      const a = s * (Math.PI / 2);
      r = R * Math.cos(a);
      y = -L + 0.72 + (L - 0.72) * Math.sin(a);
    }
    round.push(new THREE.Vector2(Math.max(r, 0.0001), y));
    // the mushroom: the same base, a body shortened, the nose squashed and opened into a crown
    const Lm = BULLET.mush.len, Rm = BULLET.mush.d / 2;
    let rm, ym;
    if (t < 0.06) (rm = (t / 0.06) * (R - 0.04)), (ym = -Lm);
    else if (t < 0.1) (rm = R - 0.04 + ((t - 0.06) / 0.04) * 0.04), (ym = -Lm + ((t - 0.06) / 0.04) * 0.04);
    else if (t < 0.3) (rm = R), (ym = mix(-Lm + 0.04, -Lm + 0.26, (t - 0.1) / 0.2));
    else if (t < 0.62) {
      const s = (t - 0.3) / 0.32;
      rm = mix(R, Rm, Math.sin(s * Math.PI / 2));
      ym = mix(-Lm + 0.26, -0.16, s);
    } else if (t < 0.72) {
      const s = (t - 0.62) / 0.1;
      rm = Rm - 0.06 * s;
      ym = mix(-0.16, -0.04, s);
    } else {
      const s = (t - 0.72) / 0.28;
      rm = (Rm - 0.06) * (1 - s);
      ym = -0.04 + 0.035 * Math.sin(s * Math.PI) - 0.02 * s;
    }
    mush.push(new THREE.Vector2(Math.max(rm, 0.0001), ym));
  }
  const ga = new THREE.LatheGeometry(round, SEG);
  const gb = new THREE.LatheGeometry(mush, SEG);
  // the crown's petals: the jacket split in six, each a little different
  const pb = gb.attributes.position;
  const P = M + 1;
  const r = rng(44);
  const petal = Array.from({ length: 6 }, () => 0.75 + r() * 0.5);
  for (let i = 0; i <= SEG; i++) {
    const phi = (i / SEG) * Math.PI * 2;
    const k = Math.floor(((phi / (Math.PI * 2)) * 6) % 6);
    const lobe = Math.pow(Math.abs(Math.cos(phi * 3)), 0.6);
    for (let j = 0; j < P; j++) {
      const t = j / M;
      const w = smooth(0.34, 0.66, t) * (1 - smooth(0.8, 1.0, t) * 0.6);
      const f = 1 + w * (0.13 * lobe * petal[k] - 0.07);
      const v = i * P + j;
      pb.setX(v, pb.getX(v) * f);
      pb.setZ(v, pb.getZ(v) * f);
      pb.setY(v, pb.getY(v) - w * 0.05 * (1 - lobe));
    }
  }
  gb.computeVertexNormals();
  const nb = gb.attributes.normal;
  for (let j = 0; j < P; j++) {
    const a = j, b = SEG * P + j; // the lathe's seam: one normal for both columns
    const x = nb.getX(a) + nb.getX(b), y = nb.getY(a) + nb.getY(b), z = nb.getZ(a) + nb.getZ(b);
    const l = Math.hypot(x, y, z) || 1;
    nb.setXYZ(a, x / l, y / l, z / l);
    nb.setXYZ(b, x / l, y / l, z / l);
  }
  ga.rotateZ(-Math.PI / 2);
  gb.rotateZ(-Math.PI / 2);
  ga.morphAttributes.position = [gb.attributes.position];
  ga.morphAttributes.normal = [gb.attributes.normal];
  return ga;
}

/* ───────────────────────────────────────────────────────────────── build */

/**
 * buildGilet() → { group, A, update(p, time, px, eye) } (world.js adds `group` to rue.js's `A.carry`).
 *   p   { vest, out, section, housse, explode, litHousse, litSeams, litWeave, fiber, solo, spread, test, load, faces,
 *         bullet, dist, trail, pierce, breaks, tense, ring, share, cone, mushroom, bench }
 *   A   panel, impact, bullet, housse, layers, first, fiber, test, kevlar, steel, strike, wear
 *   px  stage.pixelScale() (the lens, in pixels) · eye the camera's position
 */
export function buildGilet() {
  const group = new THREE.Group();
  group.name = "gilet";
  const A = {};
  const U = sharedUniforms(); //              the panel's fabric
  const UV = { ...U, uConeD: { value: 0 } }; // the pocket's: it keeps its own cone (the panel may be out of it)

  /* ── the carrier on the body (vest) ── */
  const vest = new THREE.Group();
  vest.name = "vest";
  group.add(vest);
  const vestMeshes = [], vestLines = [];
  const carrierGrey = 0x484e56;
  const loopP = rrectLoop(POCKET.y0, POCKET.y1, -POCKET.z, POCKET.z, POCKET.rc);
  const warpP = roundWarp(POCKET.y0, POCKET.y1, -POCKET.z, POCKET.z, POCKET.rc);
  const pys = refine(POCKET.y0, POCKET.y1, IY, 0.18, 0.24, 2.2);
  const pzs = refine(-POCKET.z, POCKET.z, IZ, 0.18, 0.24, 2.2);
  // the front skin, torn by the bullet; the back skin, the « dos de la poche »; the piped edge between them
  const frontSkin = fabricMesh(sheet(pys, pzs, POCKET.t, { xAt: () => POCKET.xF, warp: warpP }), fabric(carrierGrey, UV, "pocket", { k: -1.5, hole: true, velcro: true, rough: 0.9, double: true }), UV, "pocket");
  const backSkin = fabricMesh(sheet(pys, pzs, POCKET.t, { xAt: () => POCKET.xB, warp: warpP }), fabric(carrierGrey, UV, "pocket", { k: N + 0.5, rough: 0.9, double: true }), UV, "pocket");
  const pocketEdge = fabricMesh(gusset(loopP, POCKET.xF + 0.02, POCKET.xB + POCKET.t - 0.02, POCKET.bulge), fabric(0x40454c, UV, "plain", { cone: false, rough: 0.92, double: true }), UV, "plain", false);
  vest.add(frontSkin, backSkin, pocketEdge);
  vestMeshes.push(frontSkin, backSkin, pocketEdge);
  // the back carrier
  const backFront = fabricMesh(sheet(refine(POCKET.y0, POCKET.y1, 115, 2, 0, 2.2), refine(-POCKET.z, POCKET.z, 0, 2, 0, 2.2), POCKET.t, { xAt: () => BACK.xF, warp: warpP }), fabric(carrierGrey, UV, "plain", { cone: false, rough: 0.9, double: true }), UV, "plain", false);
  const backBack = fabricMesh(sheet(refine(POCKET.y0, POCKET.y1, 115, 2, 0, 2.2), refine(-POCKET.z, POCKET.z, 0, 2, 0, 2.2), POCKET.t, { xAt: () => BACK.xB, warp: warpP }), fabric(carrierGrey, UV, "plain", { cone: false, rough: 0.9, double: true }), UV, "plain", false);
  const backEdge = fabricMesh(gusset(loopP, BACK.xF + 0.02, BACK.xB + POCKET.t - 0.02, POCKET.bulge), fabric(0x40454c, UV, "plain", { cone: false, rough: 0.92, double: true }), UV, "plain", false);
  vest.add(backFront, backBack, backEdge);
  vestMeshes.push(backFront, backBack, backEdge);
  // two shoulder straps over the top, two elastic side straps on each flank (velcro tabs on the front pocket)
  const strapPolys = [];
  const strapMat = () => fabric(0x434950, UV, "plain", { cone: false, rough: 0.9, double: true });
  for (const sz of [1, -1]) {
    const path = [[-11.74, 136.2], [-11.8, 140], [-10.9, 143.6], [-8.3, 146.6], [-4.2, 148.1], [0, 148.5], [4.2, 148.1], [8.3, 146.6], [10.9, 143.6], [11.82, 140], [11.8, 136.2]];
    const b = band(path.map(([x, y]) => [x, y, sz * 8.5]), [0, 0, 1], 4.6, 0.3);
    const m = fabricMesh(b.geo, strapMat(), UV, "plain", false);
    vest.add(m);
    vestMeshes.push(m);
    strapPolys.push(...b.edges);
    for (const ys of VEL.y) {
      const w0 = ys < 110 ? 12.9 : 15.0;
      const sp = [[-11.8, 11.2], [-11.84, 14.5], [-11.72, 17.3], [-11.0, 18.42], [-9.6, 18.5], [-7.0, 16.8], [-4.0, w0 + 0.6], [0, w0], [4.0, w0 + 0.6], [7.0, 16.8], [9.6, 18.5], [11.0, 18.42], [11.84, 17.3], [11.86, 14.5], [11.82, 11.2]];
      const sb = band(sp.map(([x, z]) => [x, ys, sz * z]), [0, 1, 0], 4.4, 0.36);
      const sm = fabricMesh(sb.geo, strapMat(), UV, "plain", false);
      vest.add(sm);
      vestMeshes.push(sm);
      strapPolys.push(...sb.edges);
    }
  }
  const pocketPolys = [loopP.map(([y, z]) => [POCKET.xF - 0.01, y, z]), loopP.map(([y, z]) => [POCKET.xB + POCKET.t + 0.01, y, z]), loopP.map(([y, z]) => [BACK.xF - 0.01, y, z]), loopP.map(([y, z]) => [BACK.xB + POCKET.t + 0.01, y, z])];
  const vs = splitAtCut([...pocketPolys, ...strapPolys], [true, true, true, true]);
  const vestNear = lines(vs.near, BRAND.ink, 1.8, 0.68), vestFar = lines(vs.far, BRAND.ink, 1.8, 0.68);
  vest.add(vestNear, vestFar);
  vestLines.push(vestNear, vestFar);

  /* ── the panel: housse + 24 layers, in its own group (`out` slides it to the bench) ── */
  const panel = new THREE.Group();
  panel.name = "panel";
  group.add(panel);
  A.panel = anchor(panel, PANEL.x, PANEL.y, PANEL.z);
  A.impact = anchor(panel, ...IMPACT);
  A.layers = anchor(panel, PANEL.x, PANEL.y, PANEL.z);

  const lys = refine(Y0, Y1, IY, 0.15, 0.2, 2.0);
  const lzs = refine(Z0, Z1, IZ, 0.15, 0.2, 2.0);
  const layerGeo = sheet(lys, lzs, THICK);
  const layerOutline = splitAtCut([[[-0.003, Y0, Z0], [-0.003, Y1, Z0], [-0.003, Y1, Z1], [-0.003, Y0, Z1]]], [true]);
  const layerFlat = [...layerOutline.near, ...layerOutline.far];
  const layers = [];
  for (let k = 0; k < N; k++) {
    const grey = 0x9c9a94 + (k % 2 ? 0x040404 : 0);
    const mat = fabric(grey, U, "layer", { k, hole: true, rough: 0.66, metal: 0.04 });
    const mesh = fabricMesh(layerGeo, mat, U, "layer");
    const pivot = new THREE.Group(); //   its hinge: the seam edge z −16, so the pages fan about it
    pivot.position.set(PANEL.strike + k * PITCH, 0, Z0);
    mesh.position.set(0, 0, -Z0);
    pivot.add(mesh);
    const edge = lines(layerFlat, BRAND.ink, 1.8, 0.5);
    mesh.add(edge);
    panel.add(pivot);
    const x0 = PANEL.strike + k * PITCH;
    const xEx = PANEL.x + (k - (N - 1) / 2) * EXPLODE.pitch - THICK / 2;
    const fan = 2 * FAN * EXPLODE.fan * DEG * (k / (N - 1)); // the first page flat (its poses hold), the last 36° open
    const delay = 0.28 * (1 - Math.abs(k - (N - 1) / 2) / ((N - 1) / 2));
    layers.push({ k, mesh, mat, pivot, edge, x0, xEx, fan, delay });
  }
  A.first = anchor(layers[0].mesh, 0, PANEL.y, PANEL.z);

  // the section of the whole stack: ONE strip on the cut plane, its 24 leaves drawn in the shader
  const capGeo = (() => {
    const us = Array.from({ length: N * 2 + 1 }, (_, i) => i / (N * 2));
    const ys = refine(Y0, Y1, IY, 0.1, 0.16, 1.4);
    const pos = [], nrm = [], idx = [];
    for (let i = 0; i < ys.length; i++) for (const u of us) pos.push(u, ys[i], 0), nrm.push(0, 0, 1);
    const nu = us.length;
    for (let i = 0; i < ys.length - 1; i++)
      for (let j = 0; j < nu - 1; j++) {
        const a = i * nu + j, b = a + 1, c = a + nu, d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
    g.setIndex(idx);
    return g;
  })();
  const capMat = fabric(0xa6a39c, U, "cap", { rough: 0.7 });
  const cap = fabricMesh(capGeo, capMat, U, "cap");
  panel.add(cap);

  // the housse: two halves, a flange where they are sealed, matt
  const hys = refine(Y0 - FLANGE, Y1 + FLANGE, IY, 0.18, 0.22, 2.0, [Y0 - 0.45, Y0 - 0.25, Y0, Y1, Y1 + 0.25, Y1 + 0.45]);
  const hzs = refine(Z0 - FLANGE, Z1 + FLANGE, IZ, 0.18, 0.22, 2.0, [Z0 - 0.45, Z0 - 0.25, Z0, Z1, Z1 + 0.25, Z1 + 0.45]);
  const dBorder = (y, z) => Math.min(y - (Y0 - FLANGE), Y1 + FLANGE - y, z - (Z0 - FLANGE), Z1 + FLANGE - z);
  const toMid = (y, z) => 1 - smooth(0.22, FLANGE, dBorder(y, z));
  const hWarp = roundWarp(Y0 - FLANGE, Y1 + FLANGE, Z0 - FLANGE, Z1 + FLANGE, 1.0);
  const housseF = new THREE.Group(), housseB = new THREE.Group();
  const hfMesh = fabricMesh(sheet(hys, hzs, PANEL.cover, { xAt: (y, z) => PANEL.strike - HG - PANEL.cover + toMid(y, z) * (PANEL.x - PANEL.strike - 0.002), warp: hWarp }), fabric(0x50555c, U, "housse", { k: -0.6, hole: true, rough: 0.76, double: true }), U, "housse");
  const hbMesh = fabricMesh(sheet(hys, hzs, PANEL.cover, { xAt: (y, z) => PANEL.wear + HG + toMid(y, z) * (PANEL.x - PANEL.wear + 0.002), warp: hWarp }), fabric(0x50555c, U, "housse", { k: N - 0.4, rough: 0.76, double: true }), U, "housse");
  housseF.add(hfMesh);
  housseB.add(hbMesh);
  const hLoop = rrectLoop(Y0 - FLANGE + 0.02, Y1 + FLANGE - 0.02, Z0 - FLANGE + 0.02, Z1 + FLANGE - 0.02, 1.0);
  const hLines = [];
  for (const [g, x] of [[housseF, PANEL.x - 0.13], [housseB, PANEL.x + 0.13]]) {
    const s = splitAtCut([hLoop.map(([y, z]) => [x, y, z])], [true]);
    const ln = lines(s.near, BRAND.ink, 1.8, 0.6), lf = lines(s.far, BRAND.ink, 1.8, 0.6);
    g.add(ln, lf);
    hLines.push(ln, lf);
  }
  panel.add(housseF, housseB);
  A.housse = anchor(housseF, PANEL.strike, Y1, PANEL.z);

  // the broken yarn ends
  const strands = makeStrands(36, 4401);
  panel.add(strands);

  // the heart: one yarn drawn out of the top edge of the first layer — four twisted filaments, its free end curled
  const fiberPath = new THREE.CatmullRomCurve3(
    [[THICK / 2, Y1 - 0.8, 4.2], [-0.2, Y1 + 1.6, 4.3], [-0.7, Y1 + 4.6, 5.2], [-1.3, Y1 + 7.6, 7.2], [-1.8, Y1 + 9.6, 10.2], [-2.1, Y1 + 10.0, 13.2], [-2.3, Y1 + 8.6, 15.4], [-2.3, Y1 + 6.4, 15.6], [-2.2, Y1 + 5.0, 14.2], [-2.1, Y1 + 5.6, 12.7], [-2.1, Y1 + 7.1, 12.6], [-2.2, Y1 + 7.8, 13.9]].map((p) => new THREE.Vector3(...p)),
    false,
    "centripetal",
  );
  const fiberLen = fiberPath.getLength();
  class Twist extends THREE.Curve {
    constructor(k, rh, pitch) {
      super();
      this.k = k;
      this.rh = rh;
      this.pitch = pitch;
      this.T = new THREE.Vector3();
      this.n = new THREE.Vector3();
      this.b = new THREE.Vector3();
    }
    getPoint(t, out = new THREE.Vector3()) {
      fiberPath.getPointAt(t, out);
      fiberPath.getTangentAt(t, this.T);
      this.n.set(1, 0, 0).cross(this.T).normalize(); // the yarn barely moves along x: never parallel
      this.b.crossVectors(this.T, this.n);
      const phi = ((t * fiberLen) / this.pitch) * Math.PI * 2 + (this.k * Math.PI) / 2;
      return out.addScaledVector(this.n, Math.cos(phi) * this.rh).addScaledVector(this.b, Math.sin(phi) * this.rh);
    }
  }
  const fiberMat = bare(solid(0x6c7a72, { rough: 0.45, metal: 0.05 }));
  fiberMat.emissive = VEILLE.clone().multiplyScalar(0.32);
  const fiberU = { uReveal: { value: 0 } };
  fiberMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, fiberU);
    shader.vertexShader = `varying float vS;\n${shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n  vS = uv.x;")}`;
    shader.fragmentShader = `uniform float uReveal; varying float vS;\n${shader.fragmentShader.replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\n  if (vS > uReveal) discard;")}`;
  };
  fiberMat.customProgramCacheKey = () => "gilet-fiber";
  const fiber = new THREE.Group();
  fiber.add(new THREE.Mesh(new THREE.TubeGeometry(fiberPath, 220, 0.04, 8, false), fiberMat));
  for (let k = 0; k < 4; k++) fiber.add(new THREE.Mesh(new THREE.TubeGeometry(new Twist(k, 0.045, 0.5), 440, 0.026, 6, false), fiberMat));
  fiber.children.forEach((m) => (m.castShadow = true));
  layers[0].mesh.add(fiber);
  A.fiber = anchor(layers[0].mesh, -1.8, Y1 + 9.4, 10.6);

  // the two faces: an arrow toward the street, an arrow toward the body, under the panel's lower edge
  const arrowShape = [[0, -0.5], [6.6, -0.5], [6.6, -1.45], [9.8, 0], [6.6, 1.45], [6.6, 0.5], [0, 0.5]];
  const arrowGeo = plate(arrowShape, 0.26, { bevel: 0.05 }).translate(0, 0, -0.13);
  const arrowStreet = new THREE.Mesh(arrowGeo, glow(BRAND.veille, 1.6, { double: true }));
  arrowStreet.rotation.y = Math.PI; // points −x
  const arrowBody = new THREE.Mesh(arrowGeo, glow(BRAND.veille, 1.6, { double: true }));
  const ARROW_Y = POCKET.y0 - 2.6;
  const AX = { street: POCKET.xF - 0.9, body: POCKET.xB + POCKET.t + 0.9 };
  panel.add(arrowStreet, arrowBody);
  A.strike = anchor(panel, AX.street - 9.8, ARROW_Y, PANEL.z);
  A.wear = anchor(panel, AX.body + 9.8, ARROW_Y, PANEL.z);

  /* ── the bullet ── */
  const bullet = new THREE.Group();
  bullet.name = "bullet";
  const bulletMat = solid(0xd6d1c6, { rough: 0.3, metal: 0.45 });
  const slug = new THREE.Mesh(bulletGeometry(), bulletMat);
  slug.morphTargetInfluences = [0];
  slug.castShadow = true;
  bullet.add(slug);
  const halo = makeHalo(INK.clone().multiplyScalar(1.6), SIGNAL.clone().multiplyScalar(1.3), { core: BULLET.d / 2, minPx: 8 });
  halo.position.x = -0.7;
  bullet.add(halo);
  group.add(bullet);
  const trail = makeTrail();
  group.add(trail);
  A.bullet = anchor(bullet, -BULLET.len / 2, 0, 0);

  /* ── the strength test on the halo (test, load) ── */
  const test = new THREE.Group();
  test.name = "test";
  test.position.set(...TEST.at);
  group.add(test);
  const testParts = [];
  const solidBox = (w, h, d, color, x, y, z, o = {}) => {
    const m = new THREE.Mesh(box(w, h, d, o.r ?? 0.2), solid(color, { rough: o.rough ?? 0.6, metal: o.metal ?? 0.1 }));
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    const e = edgesOf(m.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.7 });
    e.userData.on = true;
    m.add(e);
    return m;
  };
  for (const s of [-1, 1]) {
    testParts.push(solidBox(1.6, TEST.bar, 1.6, 0x6d737a, 0, TEST.bar / 2, s * TEST.gap));
    testParts.push(solidBox(9, 0.8, 7, 0x6d737a, 0, 0.4, s * TEST.gap));
  }
  testParts.push(solidBox(1.8, 1.8, TEST.gap * 2 + 1.6, 0x6d737a, 0, TEST.bar + 0.9, 0));
  testParts.forEach((m) => test.add(m));
  const hookMat = () => solid(0x8a8f95, { rough: 0.4, metal: 0.4 });
  const hookGeo = new THREE.TorusGeometry(0.5, 0.13, 8, 20);
  const strandTop = TEST.bar - 0.9;
  const KZ = -TEST.gap / 2, SZ = TEST.gap / 2; // Kevlar on the left from az −88, steel on the right
  const hooks = [];
  for (const z of [KZ, SZ]) {
    const h = new THREE.Mesh(hookGeo, hookMat());
    h.position.set(0, strandTop + 0.2, z);
    test.add(h);
    hooks.push(h);
  }
  // Kevlar: a twisted veille cord
  const kevMat = bare(solid(0x7d867f, { rough: 0.5 }));
  kevMat.emissive = VEILLE.clone().multiplyScalar(0.85);
  kevMat.onBeforeCompile = (shader) => {
    shader.vertexShader = `varying vec3 vKw;\n${shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n  vKw = position;")}`;
    shader.fragmentShader = `varying vec3 vKw;\n${shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
  float kwS = vKw.y * 7.0 + atan(vKw.z, vKw.x + 1e-5) * 3.0 / 3.14159;
  float kwL = 1.0 - smoothstep(0.3, 0.6, fwidth(kwS));
  diffuseColor.rgb *= mix(0.95, 0.78 + 0.34 * abs(sin(kwS * 3.14159)), kwL);`,
    )}`;
  };
  kevMat.customProgramCacheKey = () => "gilet-kevlar";
  const kev = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, TEST.len, 24, 1).translate(0, -TEST.len / 2, 0), kevMat);
  kev.position.set(0, strandTop, KZ);
  kev.castShadow = true;
  test.add(kev);
  // steel: a light wire, ≈ 2.3 × thinner, in two pieces either side of where it breaks
  const steelMat = solid(0xc6cacf, { rough: 0.28, metal: 0.5 });
  const SPLIT = 0.55;
  const steelUp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, TEST.len * SPLIT, 16, 1).translate(0, (-TEST.len * SPLIT) / 2, 0), steelMat);
  const steelLo = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, TEST.len * (1 - SPLIT), 16, 1).translate(0, (TEST.len * (1 - SPLIT)) / 2, 0), steelMat.clone());
  steelUp.position.set(0, strandTop, SZ);
  steelLo.position.set(0, strandTop - TEST.len, SZ);
  steelUp.castShadow = steelLo.castShadow = true;
  test.add(steelUp, steelLo);
  const snapFlash = makeHalo(INK.clone().multiplyScalar(1.4), SIGNAL.clone().multiplyScalar(1.4), { minPx: 6 });
  snapFlash.position.set(0, strandTop - TEST.len * SPLIT, SZ);
  test.add(snapFlash);
  // the blocks: five under the Kevlar, two under the steel (the second breaks it)
  const BH = 4.2, BG = 0.8;
  const blockY = (i) => strandTop - TEST.len - BG - BH / 2 - i * (BH + BG);
  const kevBlocks = [], steelBlocks = [];
  for (let i = 0; i < 5; i++) {
    const b = solidBox(TEST.block, BH, TEST.block, 0x8e939a, 0, blockY(i), KZ, { r: 0.3, rough: 0.7 });
    const ring = new THREE.Mesh(hookGeo, hookMat());
    ring.position.set(0, BH / 2 + BG / 2, 0);
    ring.scale.setScalar(0.8);
    b.add(ring);
    test.add(b);
    kevBlocks.push(b);
  }
  for (let i = 0; i < 2; i++) {
    const b = solidBox(TEST.block, BH, TEST.block, 0x8e939a, 0, blockY(i), SZ, { r: 0.3, rough: 0.7 });
    const ring = new THREE.Mesh(hookGeo, hookMat());
    ring.position.set(0, BH / 2 + BG / 2, 0);
    ring.scale.setScalar(0.8);
    b.add(ring);
    test.add(b);
    steelBlocks.push(b);
  }
  A.test = anchor(test, 0, TEST.bar, 0);
  A.kevlar = anchor(test, 0, strandTop - TEST.len / 2, KZ);
  A.steel = anchor(test, 0, strandTop - TEST.len / 2, SZ);

  // what each fade reaches, listed once (update allocates nothing)
  const treeOf = (root) => {
    const ms = [], ls = [];
    root.traverse((o) => {
      if (o.isLineSegments2) ls.push(o);
      else if (o.isMesh && o.material?.isMeshStandardMaterial) ms.push(o);
    });
    return { root, ms, ls };
  };
  const fadeTree = (t, a) => {
    t.root.visible = a > 0.004;
    for (let i = 0; i < t.ms.length; i++) fadeMesh(t.ms[i], a);
    for (let i = 0; i < t.ls.length; i++) fadeLine(t.ls[i], a);
  };
  const testTree = treeOf(test);
  const kevTrees = kevBlocks.map(treeOf), steelTrees = steelBlocks.map(treeOf);
  const tmp = new THREE.Vector3();

  return {
    group,
    A,
    update(p, time = 0, px = 3000, eye = null) {
      void time;
      const out = clamp01(p.out ?? 0);
      const sec = clamp01(p.section ?? 0);
      const ex = clamp01(p.explode ?? 0);
      const solo = clamp01(p.solo ?? 0);
      const cone = clamp01(p.cone ?? 0);
      const pierce = Math.min(0.45, clamp01(p.pierce ?? 0));
      const mush = clamp01(p.mushroom ?? 0);
      panel.position.set(OUT[0] * out, OUT[1] * out, OUT[2] * out);

      // the field and the lights every fabric reads
      U.uCut.value = UV.uCut.value = mix(CUT_OFF, SECTION.z, sec);
      U.uConeD.value = CONE.depth * cone;
      UV.uConeD.value = CONE.depth * cone * (1 - out);
      U.uRing.value = clamp01(p.ring ?? 0);
      U.uPierce.value = pierce;
      U.uMush.value = mush;
      U.uShare.value = clamp01(p.share ?? 0);
      U.uTense.value = clamp01(p.tense ?? 0);
      U.uWeaveLit.value = clamp01(p.litWeave ?? 0);
      U.uSeamLit.value = clamp01(p.litSeams ?? 0);
      const brk = clamp01(p.breaks ?? 0);
      U.uTorn.value = 0.12 + 0.88 * smooth(0, 0.12, brk) * (1 - smooth(0.6, 1, brk));

      // the vest
      const va = clamp01(p.vest ?? 1);
      vest.visible = va > 0.004;
      for (const m of vestMeshes) fadeMesh(m, va);
      fadeLine(vestNear, va);
      fadeLine(vestFar, va * (1 - sec));

      // is the camera close enough to see the inner layers apart? (far away they are wholly inside the housse)
      let near = true;
      if (eye && ex < 0.001) {
        panel.localToWorld(tmp.set(PANEL.x, PANEL.y, PANEL.z));
        near = (px / Math.max(1, tmp.distanceTo(eye))) * PITCH > 0.3;
      }
      // the layers: in the stack, or fanned along the bullet's path like pages
      const edgeA = smooth(0.04, 0.4, ex) * (1 - sec);
      for (const L of layers) {
        const u = settle(clamp01((ex - L.delay) / 0.72));
        L.pivot.position.x = mix(L.x0, L.xEx, u);
        L.pivot.rotation.y = L.fan * u;
        const a = L.k === 0 ? 1 : 1 - solo;
        const inner = L.k > 0 && L.k < N - 1;
        fadeMesh(L.mesh, inner && !near ? 0 : a);
        if (ex > 0.05) L.mesh.castShadow = false;
        fadeLine(L.edge, a * edgeA);
        L.mat.userData.own.uSpread.value = L.k === 0 ? clamp01(p.spread ?? 0) : 0;
        L.mat.userData.own.uDot.value = L.k === 0 ? smooth(0, 0.15, p.spread ?? 0) : 0;
      }
      cap.visible = sec > 0.004 && ex < 0.004;

      // the housse
      const ho = settle(clamp01(p.housse ?? 0));
      housseF.position.set(-EXPLODE.housse * ho, 0, -HOUSSE_AWAY * ho);
      housseB.position.set(EXPLODE.housse * ho, 0, -HOUSSE_AWAY * ho);
      housseF.rotation.y = -HOUSSE_TURN * ho;
      housseB.rotation.y = HOUSSE_TURN * ho;
      const lh = clamp01(p.litHousse ?? 0);
      hfMesh.material.userData.own.uLit.value = hbMesh.material.userData.own.uLit.value = lh;
      for (let i = 0; i < hLines.length; i++) {
        const ln = hLines[i];
        ln.material.color.lerpColors(INK, VEILLE, lh);
        fadeLine(ln, i % 2 ? 1 - sec : 1);
      }

      // the broken yarn ends ride the panel
      const br = clamp01(p.breaks ?? 0);
      strands.visible = br > 0.003 && ex < 0.01;
      strands.material.uniforms.uBreak.value = br;
      strands.material.uniforms.uConeD.value = CONE.depth * cone;
      strands.material.uniforms.uPierce.value = pierce;

      // the heart yarn
      const fb = clamp01(p.fiber ?? 0);
      fiber.visible = fb > 0.003;
      fiberU.uReveal.value = fb;

      // the two faces: street first (0 → 0.5), then the body (0.5 → 1)
      const fa = clamp01(p.faces ?? 0);
      const aS = smooth(0, 0.45, fa), aB = smooth(0.5, 0.95, fa);
      arrowStreet.visible = aS > 0.004;
      arrowBody.visible = aB > 0.004;
      arrowStreet.material.opacity = aS;
      arrowStreet.material.transparent = aS < 0.999;
      arrowBody.material.opacity = aB;
      arrowBody.material.transparent = aB < 0.999;
      arrowStreet.position.set(AX.street + 2.2 * (1 - aS), ARROW_Y, PANEL.z);
      arrowBody.position.set(AX.body - 2.2 * (1 - aB), ARROW_Y, PANEL.z);

      // the bullet: in flight along the line through the impact; after contact its front on the first whole layer
      const b = clamp01(p.bullet ?? 0);
      const dist = Math.max(0, p.dist ?? 0);
      const flying = dist > 0.001;
      bullet.visible = trail.visible = b > 0.004;
      slug.morphTargetInfluences[0] = flying ? 0 : mush;
      const axis = CONE.depth * cone * 0.92; //                         coneAt on the axis
      const kpx = pierce * STACK; //                                     how deep the tear goes
      if (flying) bullet.position.set(IMPACT[0] - dist, IY, IZ);
      else {
        const kp = Math.min(N - 1, Math.floor(pierce * N));
        const lx = layers[kp].pivot.position.x - layers[kp].x0; //       it rides the layer it stopped in
        bullet.position.set(IMPACT[0] + kpx + axis + lx + panel.position.x, IY + panel.position.y, IZ + panel.position.z);
      }
      fadeMesh(slug, b);
      let big = 0;
      if (eye) {
        bullet.localToWorld(tmp.set(-0.7, 0, 0));
        big = smooth(14, 40, (BULLET.d * px) / Math.max(1, tmp.distanceTo(eye)));
      }
      shine(halo, b * smooth(0.5, 6, dist) * 0.95 * (1 - big), 1.1);
      // the wake: from the base, back up the path; after contact a streak that fades with `trail`
      const tr = clamp01(p.trail ?? 0);
      const len = flying ? BULLET.len : mix(BULLET.len, BULLET.mush.len, mush);
      const tu = trail.material.uniforms;
      tu.uHead.value.set(bullet.position.x - len, bullet.position.y, bullet.position.z);
      tu.uTail.value.set(bullet.position.x - len - (25 + 95 * tr), bullet.position.y, bullet.position.z);
      tu.uAmount.value = b * tr * (flying ? 1 : 0.9);
      trail.visible = tu.uAmount.value > 0.003;

      // the test: a block each at 0.2, the second at 0.4 breaks the steel, five on the Kevlar at 1
      const ta = clamp01(p.test ?? 0);
      test.visible = ta > 0.004;
      if (test.visible) {
        const load = clamp01(p.load ?? 0);
        fadeTree(testTree, ta);
        const snap = smooth(0.4, 0.47, load), fall = smooth(0.4, 0.64, load);
        kev.scale.y = 1 + 0.006 * load;
        for (let i = 0; i < kevBlocks.length; i++) {
          const arr = smooth(0.2 * (i + 1) - 0.1, 0.2 * (i + 1), load);
          kevBlocks[i].position.set(0, blockY(i) - 0.006 * load * TEST.len, KZ - 7 * (1 - settle(arr)));
          fadeTree(kevTrees[i], ta * Math.sqrt(arr));
        }
        steelUp.scale.y = 1 - 0.42 * snap;
        steelLo.position.y = strandTop - TEST.len - fall * fall * 46;
        steelLo.scale.y = 1 - 0.42 * snap;
        fadeMesh(steelLo, ta * (1 - smooth(0.52, 0.64, load)));
        for (let i = 0; i < steelBlocks.length; i++) {
          const arr = smooth(0.2 * (i + 1) - 0.1, 0.2 * (i + 1), load);
          steelBlocks[i].position.set(0, blockY(i) - fall * fall * 46, SZ + 7 * (1 - settle(arr)));
          fadeTree(steelTrees[i], ta * Math.sqrt(arr) * (1 - smooth(0.52, 0.64, load)));
        }
        shine(snapFlash, ta * Math.sin(Math.PI * smooth(0.4, 0.47, load)) * 0.9, 0.9);
      }
    },
  };
}
