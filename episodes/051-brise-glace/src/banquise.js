// DOSSIER 051 — Le brise-glace : THE FIELD — the polar sea and its pack, the sky, the trapped ship (« ton navire »,
// X-ray) and its glass people, the distance line and the map beacons, the easterly, the helicopter of the duel.
// docs/051-decors.md, « ## banquise.js ». Ice frame: everything that belongs to the ice slides by +S.run·100 in z.
// The box PATCH around the icebreaker is left to glace.js: nothing is drawn inside it but water (and the boil astern).
//   buildBanquise() → { root, A, update(S, time) }
//   A       anchors: shok (the trapped ship's deck), shokBow, heli, lineMid (the distance line's middle), beaconIce, beaconShok
//   update  reads S.shell, close, wake, run, apart, shok, crowd, line, wind, heli, ridge, prop, mood (+ fx, fz, fs: the halo)
//
// HOW IT IS DRAWN
//   · THE PACK is ONE plane at the waterline (y 0), a shader: opaque, it writes its depth (it hides whatever is under
//     the water, the glass hull included) and is pushed back by a polygon offset — at 15 km the depth buffer resolves
//     ≈ 20 m, and whatever lies on the water must win. One layer only: no sea and pack fighting each other.
//   · THE FLOES are the cells of a jittered grid (Voronoi, 46 m), hashed with integers — the same hash in JS and GLSL,
//     so the near floes (3D) and the far ones (shader) are the same tiling. Each edge has its own lead (one pair in
//     three is welded: floes of 20 to 90 m); `close` shuts the leads, past 0.8 the edges override and rise. Kilometre
//     leads (a ridged noise) for the map. Every detail melts into its mean grey before it gets under a few pixels.
//   · NEAR THE TRAPPED SHIP (160 m around it) the same cells are extruded (3D floes: a lip that catches the light),
//     pressed against its waterline (the same footprint as the glass hull), jostling from the first frame; the shader
//     leaves those cells to them. Rebuilt only when `close`, `apart` or `shok` changes — never allocated in update.
//   · THE SKY is a dome at infinity, drawn first: black, a low signal glow on the horizon (a lobe toward +z: behind
//     the icebreaker seen from the hook), the haze of the far pack takes the horizon's colour.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, edgesOf, fatLine, anchor, box, cyl, lathe, plate, solid, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { SHOK, HELI, ICE, PATCH, SHIP, WIND, PROPS } from "./plan.js";

const TAU = Math.PI * 2;
const YAW = SHOK.yaw; // 50 wanted (docs/journal/051-banquise.md, « À changer ailleurs »): the hook sees its port bow quarter
const PACK_R = 2800000; // the pack's disc, centred under the eye every frame
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ───────────────────────────────────────────────────────────── the tiling, in JS and GLSL alike */
const CELL = 3200; // the grid of the floes (cm): Voronoi cells of ≈ 32 m (welded pairs: up to 80 m)
const JIT = 0.85;
const NEAR = 15000; // the 3D floes: the cells whose site lies within this of the trapped ship
const mix32 = (x) => {
  x = (x ^ (x >>> 16)) >>> 0;
  x = Math.imul(x, 0x7feb352d) >>> 0;
  x = (x ^ (x >>> 15)) >>> 0;
  x = Math.imul(x, 0x846ca68b) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
};
const keyOf = (cx, cy) => ((cx + 4096) * 8192 + (cy + 4096)) >>> 0;
const h1 = (key, k) => mix32((key ^ Math.imul(k + 1, 0x9e3779b9)) >>> 0) / 4294967296;
const pairKey = (a, b) => mix32((Math.min(a, b) ^ mix32(Math.max(a, b))) >>> 0);
const hv = (cx, cy) => mix32((Math.imul((cx + 1048576) >>> 0, 0x8da6b343) ^ Math.imul((cy + 1048576) >>> 0, 0xd8163841)) >>> 0) / 4294967296;
const vnoise = (x, y) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let fx = x - ix;
  let fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hv(ix, iy) + (hv(ix + 1, iy) - hv(ix, iy)) * fx;
  const b = hv(ix, iy + 1) + (hv(ix + 1, iy + 1) - hv(ix, iy + 1)) * fx;
  return a + (b - a) * fy;
};
/** the floes are not polygons: the tiling is read through a gentle warp (the same in GLSL) */
const WARP = { k: 1900, a: 260 };
const warpX = (x, z) => (vnoise(x / WARP.k + 11.3, z / WARP.k + 4.1) - 0.5) * 2 * WARP.a;
const warpZ = (x, z) => (vnoise(x / WARP.k + 2.7, z / WARP.k + 17.9) - 0.5) * 2 * WARP.a;
/** the lead between two cells: [welded?, its half-width at close 0 (cm)] — read by the shader the same way */
const leadOf = (pk) => (h1(pk, 2) < 0.33 ? 0 : 150 + 650 * h1(pk, 3) ** 2 + (h1(pk, 4) < 0.08 ? 1500 : 0));

const TILING_GLSL = /* glsl */ `
  const float CELL = ${CELL.toFixed(1)};
  uint mix32(uint x) { x ^= x >> 16u; x *= 0x7feb352du; x ^= x >> 15u; x *= 0x846ca68bu; x ^= x >> 16u; return x; }
  uint keyOf(ivec2 c) { return uint(c.x + 4096) * 8192u + uint(c.y + 4096); }
  float h1(uint key, uint k) { return float(mix32(key ^ ((k + 1u) * 0x9e3779b9u))) * (1.0 / 4294967296.0); }
  uint pairKey(uint a, uint b) { return mix32(min(a, b) ^ mix32(max(a, b))); }
  vec2 siteOf(ivec2 c) { uint k = keyOf(c); return (vec2(c) + 0.5 + ${JIT.toFixed(2)} * (vec2(h1(k, 0u), h1(k, 1u)) - 0.5)) * CELL; }
  float leadOf(uint pk) { if (h1(pk, 2u) < 0.33) return 0.0; float h = h1(pk, 3u); return 150.0 + 650.0 * h * h + (h1(pk, 4u) < 0.08 ? 1500.0 : 0.0); }
  float hv(ivec2 c) { return float(mix32(uint(c.x + 1048576) * 0x8da6b343u ^ uint(c.y + 1048576) * 0xd8163841u)) * (1.0 / 4294967296.0); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    ivec2 c = ivec2(i);
    return mix(mix(hv(c), hv(c + ivec2(1, 0)), f.x), mix(hv(c + ivec2(0, 1)), hv(c + ivec2(1, 1)), f.x), f.y);
  }
  vec2 warp(vec2 q) {
    vec2 p = q / ${WARP.k.toFixed(1)};
    return (vec2(vnoise(p + vec2(11.3, 4.1)), vnoise(p + vec2(2.7, 17.9))) - 0.5) * ${(2 * WARP.a).toFixed(1)};
  }
`;

/** What everything of the field shares: the sky's colour toward a direction, the ice's surface, the halo, the haze. */
const SHADE_GLSL = /* glsl */ `
  uniform vec3 uInk, uSignal; uniform float uMood, uFog; uniform vec4 uFocus;
  const vec2 WDIR = normalize(vec2(${WIND.dir[0]}, ${WIND.dir[2]}));
  vec3 skyCol(vec3 d) {
    float az = atan(d.x, d.z + 1e-6); // 0 toward +z: behind the icebreaker, seen from the hook
    float lobe = 0.28 + 0.72 * exp(-az * az / 0.45);
    vec3 glowC = mix(uInk * 0.32, uSignal, uMood);
    float band = exp(-abs(d.y) / 0.022);
    float up = step(0.0, d.y) * exp(-max(d.y, 0.0) / 0.14);
    return glowC * (band * 0.62 + up * 0.13) * lobe + uInk * (0.006 + 0.022 * exp(-abs(d.y) / 0.05));
  }
  // the light the subject stands in: the ice is brighter around it (the halo), dimmer far off
  float halo(vec3 w) { vec2 d = (w.xz - uFocus.xy) / max(uFocus.z, 1000.0); return 0.6 + 0.75 * exp(-dot(d, d) * 1.4); }
  // the snow on a floe: broad drifts, and close up the sastrugi the wind combs along its way
  vec3 iceTop(vec2 q, float px, float tone, vec3 vd, vec3 n) {
    float mid = 1.0 - smoothstep(60.0, 260.0, px);
    float fine = 1.0 - smoothstep(12.0, 70.0, px);
    float drift = vnoise(q / 2300.0) * 0.6 + mix(0.5, vnoise(q / 640.0), mid) * 0.4;
    vec2 w = vec2(dot(q, WDIR), dot(q, vec2(-WDIR.y, WDIR.x)));
    float sast = mix(0.5, vnoise(vec2(w.x / 900.0, w.y / 70.0)) * 0.7 + vnoise(vec2(w.x / 260.0, w.y / 22.0)) * 0.3, fine);
    vec3 col = uInk * (0.25 + 0.08 * (drift - 0.5) + 0.07 * (sast - 0.5)) * tone;
    // toward the horizon, the snow mirrors a little of its glow
    return col + skyCol(reflect(vd, n)) * 0.22 * pow(clamp(1.0 + vd.y, 0.0, 1.0), 10.0);
  }
  // the kilometre leads: the straight edges of a coarse tiling, one in two open, shutting with the pack
  const float BIG = 62000.0;
  vec2 bigSite(ivec2 c) { uint k = keyOf(c + ivec2(1000, 1500)); return (vec2(c) + 0.5 + 0.8 * (vec2(h1(k, 0u), h1(k, 1u)) - 0.5)) * BIG; }
  float bigLead(vec2 q, float close) {
    ivec2 c0 = ivec2(floor(q / BIG));
    float best = 1e20; ivec2 bc = c0; vec2 bs = vec2(0.0);
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      ivec2 c = c0 + ivec2(i, j); vec2 s = bigSite(c); vec2 dv = q - s; float d2 = dot(dv, dv);
      if (d2 < best) { best = d2; bc = c; bs = s; }
    }
    float e = 1e9;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      if (i == 0 && j == 0) continue;
      ivec2 ck = bc + ivec2(i, j); vec2 dv = bigSite(ck) - bs; float L = length(dv);
      uint pk = pairKey(keyOf(bc + ivec2(1000, 1500)), keyOf(ck + ivec2(1000, 1500)));
      if (h1(pk, 5u) < 0.5) e = min(e, 0.5 * L - dot(q - bs, dv / L) - (1.0 - close) * (700.0 + 3200.0 * h1(pk, 6u)));
    }
    return e; // < 0 inside an open lead
  }
  // the haze: thick for an eye at the ice's level, thin from a height (the map stays readable)
  vec3 hazed(vec3 col, vec3 w) {
    vec3 v = w - cameraPosition; float dist = length(v);
    float dens = 0.5 / max(cameraPosition.y * 14.0, 150000.0);
    float edge = smoothstep(0.7, 0.97, length(w.xz - cameraPosition.xz) / ${(PACK_R).toFixed(1)});
    float f = max(1.0 - exp(-pow(dist * dens, 2.0)), edge);
    return mix(col, skyCol(v / max(dist, 1e-3)), clamp(f, 0.0, 1.0));
  }
`;

/* ───────────────────────────────────────────────────────────── the trapped ship's lines (local frame, bow toward −z) */
const HB = SHOK.beam / 2;
const HL = SHOK.length / 2;
/** the waterline half-breadth: a fine bow (−z), a full stern — the floes press against this same curve */
const halfAt = (z) => {
  const u = Math.abs(z) / HL;
  if (u >= 1) return 0;
  const n = z < 0 ? 2.2 : 5;
  return HB * Math.pow(1 - Math.pow(u, n), 1 / n);
};
/** the half-breadth at height y: the stem raked forward above water and aft under it (an ice bow), the stern overhanging */
const halfW = (z, y) => {
  if (y >= 0) return halfAt(z + (z < 0 ? 0.7 : -0.25) * y) * (1 + (0.06 * y) / SHOK.deck);
  const d = Math.min(1, -y / SHOK.draught);
  return halfAt(z + (z < 0 ? 1.4 : -0.6) * y) * (1 - 0.8 * d * d * d);
};
const sheer = (z) => SHOK.deck + 170 * Math.min(1, Math.max(0, (-z / HL - 0.4) / 0.6)) ** 2; // the forecastle rises
/** the footprint's metric: < 1 inside the waterline (+ margin m), the floes are pushed out along the ray to the centre */
const footF = (lx, lz, m) => {
  const a = HB + m;
  const b = HL + m;
  const n = lz < 0 ? 2.2 : 5;
  return Math.pow(Math.abs(lx) / a, n) + Math.pow(Math.abs(lz) / b, n);
};

/** A skin through rows of points (`rows[i][j]` = [x, y, z]). `wrap`: each row closes on itself (from L04 bord.js). */
function skin(rows, { wrap = false } = {}) {
  const n = rows[0].length;
  const pos = new Float32Array(rows.length * n * 3);
  rows.forEach((row, i) => row.forEach((p, j) => pos.set(p, (i * n + j) * 3)));
  const index = [];
  for (let i = 0; i < rows.length - 1; i++) {
    for (let j = 0; j < (wrap ? n : n - 1); j++) {
      const a = i * n + j;
      const b = i * n + ((j + 1) % n);
      index.push(a, b, b + n, a, b + n, a + n);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

/* ───────────────────────────────────────────────────────────── the sky */
function makeSky() {
  const mat = new THREE.ShaderMaterial({
    depthWrite: false,
    depthTest: false,
    side: THREE.BackSide,
    uniforms: { uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uMood: { value: 1 }, uFog: { value: 0 }, uFocus: { value: new THREE.Vector4() } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position; // follows the eye, never turns: the horizon stays level and far
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      ${TILING_GLSL}
      ${SHADE_GLSL}
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        // a few high strata, barely there: the sky is not a flat black
        float az = atan(d.x, d.z + 1e-6);
        float wisp = smoothstep(0.4, 0.9, vnoise(vec2(az * 6.0, 3.0)) * 0.6 + vnoise(vec2(az * 17.0, 9.0)) * 0.4);
        float strata = step(0.0, d.y) * exp(-pow((d.y - 0.05) / 0.025, 2.0)) * wisp;
        vec3 col = skyCol(d) + mix(uInk * 0.2, uSignal * 0.6, uMood) * strata * 0.08 * (0.3 + 0.7 * exp(-az * az / 0.45));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -100; // first: everything draws over it
  return { mesh, u: mat.uniforms };
}

/* ───────────────────────────────────────────────────────────── the pack */
function makePack(U) {
  const mat = new THREE.ShaderMaterial({
    uniforms: U,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 4, // pushed back a few steps of depth: at 15 km, whatever lies on the water wins
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      ${TILING_GLSL}
      ${SHADE_GLSL}
      uniform float uRun, uClose, uWake, uProp, uRidge, uWind, uTime, uNearR;
      uniform vec2 uShok;   // the trapped ship, ice frame (x, z)
      uniform vec4 uPatch;  // ahead, behind, half — the box left to glace.js (ship frame)
      uniform vec4 uProps;  // z, half-spread of the propellers
      varying vec3 vW;
      void main() {
        vec3 view = vW - cameraPosition;
        vec3 vd = normalize(view);
        vec2 q = vec2(vW.x, vW.z - uRun * 100.0); // ice frame
        vec2 fw = fwidth(q);
        float px = max(max(fw.x, fw.y), 1e-3); // how many cm one pixel spans here, the long way (what aliases)
        float pxi = max(sqrt(fw.x * fw.y), 1e-3); // and on average (what is still seen)
        float close = clamp(uClose, 0.0, 1.0);
        float raft = clamp((close - 0.8) / 0.2, 0.0, 1.0);

        // ── the floes: the nearest site, then the leads of its edges ──
        float detail = 1.0 - smoothstep(CELL * 0.12, CELL * 0.4, px);
        float cover = 1.0 - (1.0 - close) * 0.12; // what a far patch of pack averages to
        float tone = 1.0;
        float rim = 0.0;
        float seam = 0.0;
        float nearC = 0.0;
        if (detail > 0.0) {
          vec2 qw = q + warp(q);
          ivec2 c0 = ivec2(floor(qw / CELL));
          float best = 1e20; ivec2 bc = c0; vec2 bs = vec2(0.0);
          for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
            ivec2 c = c0 + ivec2(i, j); vec2 s = siteOf(c); vec2 dv = qw - s; float d2 = dot(dv, dv);
            if (d2 < best) { best = d2; bc = c; bs = s; }
          }
          uint bk = keyOf(bc);
          float e = 1e9, eSeam = 1e9;
          for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
            if (i == 0 && j == 0) continue;
            ivec2 ck = bc + ivec2(i, j); vec2 sk = siteOf(ck); vec2 dv = sk - bs; float L = length(dv);
            vec2 n = dv / L;
            float dd = 0.5 * L - dot(qw - bs, n); // to the bisector
            float base = leadOf(pairKey(bk, keyOf(ck)));
            if (base == 0.0) eSeam = min(eSeam, dd);
            else e = min(e, dd - base * (1.0 - close) + raft * 50.0);
          }
          float aw = fwidth(e) * 0.8 + 1e-3;
          float cov = smoothstep(-aw, aw, e);
          nearC = step(distance(bs, uShok), uNearR); // a 3D floe lies here: leave it the water
          cov *= 1.0 - nearC;
          tone = 0.84 + 0.32 * h1(bk, 7u);
          float fine = 1.0 - smoothstep(60.0, 220.0, pxi);
          rim = (1.0 - smoothstep(30.0, 140.0 + aw, e)) * step(0.0, e) * fine;
          seam = (1.0 - smoothstep(0.0, 40.0 + fwidth(eSeam), eSeam)) * fine;
          cover = mix(cover, cov, detail);
          tone = mix(1.0, tone, detail);
        }

        // ── the kilometre leads: long cracks, open water and new grey ice, that shut with the pack ──
        float eb = bigLead(q, close);
        float lead = 1.0 - smoothstep(-fwidth(eb) - 1.0, fwidth(eb) + 1.0, eb);
        float keep = smoothstep(uNearR * 1.2, uNearR * 2.4, distance(q, uShok)) * smoothstep(16000.0, 30000.0, length(vW.xz));
        lead *= keep;
        float nilas = lead * 0.18; // the young ice in the leads, dark grey
        cover = mix(cover, nilas, lead);

        // ── the channel astern of the icebreaker: open water and brash, closing behind it ──
        float aft = vW.z - uPatch.y;
        float halfW = 1500.0 + 0.004 * max(aft, 0.0);
        float age = exp(-max(aft, 0.0) / (30000.0 + 300000.0 * uWake));
        float chan = uWake * age * smoothstep(-200.0, 600.0, aft) * (1.0 - smoothstep(halfW - 250.0 - px, halfW + 250.0 + px, abs(vW.x)));
        float brash = smoothstep(0.52, 0.66, vnoise(q / 260.0)) * (1.0 - smoothstep(80.0, 300.0, px)) + 0.3 * smoothstep(80.0, 300.0, px);
        cover = mix(cover, brash * 0.55, chan);
        rim *= 1.0 - chan; seam *= 1.0 - chan;

        // ── the box glace.js draws: only water there ──
        float inPatch = step(abs(vW.x), uPatch.z) * step(uPatch.x, vW.z) * step(vW.z, uPatch.y);
        cover *= 1.0 - inPatch; rim *= 1.0 - inPatch; seam *= 1.0 - inPatch;
        if (uPatch.w > 0.5 && abs(vW.x) < 2600.0 && vW.z > -8400.0 && vW.z < -3000.0) discard; // bowWater: the sea see-through at the bow

        // ── colour ──
        vec3 water = uInk * 0.004 + skyCol(reflect(vd, vec3(0.0, 1.0, 0.0))) * (0.05 + 0.6 * pow(clamp(1.0 + vd.y, 0.0, 1.0), 8.0));
        vec3 ice = iceTop(q, pxi, tone, vd, vec3(0.0, 1.0, 0.0));
        vec3 col = mix(water, ice, cover);
        col += uInk * (0.09 * rim + (0.05 + 0.12 * max(raft, uRidge)) * seam) * (1.0 - lead);
        col *= mix(1.0, halo(vW), max(cover, 0.3));

        // the propellers' boil, astern (water: inside the box too)
        float boilK = smoothstep(0.5, 0.95, uProp);
        if (boilK > 0.0) {
          float dz = vW.z - uProps.x;
          float spread = uProps.y + 0.22 * max(dz, 0.0);
          float env = smoothstep(-200.0, 400.0, dz) * (1.0 - smoothstep(3000.0, 7500.0, dz)) * (1.0 - smoothstep(spread * 0.6, spread, abs(vW.x)));
          float churn = vnoise(vec2(vW.x / 210.0, (vW.z - uTime * 260.0) / 240.0)) * 0.6 + vnoise(vec2(vW.x / 90.0 + 4.0, (vW.z - uTime * 330.0) / 110.0)) * 0.4;
          col += uInk * 0.3 * boilK * env * smoothstep(0.42, 0.78, churn);
        }
        gl_FragColor = vec4(hazed(col, vW), 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(PACK_R, 96).rotateX(-Math.PI / 2), mat);
  mesh.renderOrder = -50;
  // centred under the eye as it is drawn: the pack reaches the horizon wherever the camera goes
  mesh.onBeforeRender = (_r, _s, camera) => {
    mesh.matrixWorld.elements[12] = camera.position.x;
    mesh.matrixWorld.elements[14] = camera.position.z;
  };
  mesh.frustumCulled = false;
  return mesh;
}

/* ───────────────────────────────────────────────────────────── the near floes, 3D */
const MAXF = 96; // slots
const RIM = 48; // vertices around one floe at most
const VPF = 1 + RIM * 3; // its centre, the top's rim, the side's top and bottom
const TOP = ICE.freeboard + 15; // the snow on it
const BOT = -40;
function makeFloes(U) {
  const n = MAXF * VPF;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  const floe = new Float32Array(n * 4); // site x, z, phase, jostle (cm)
  const tilt = new Float32Array(n * 2);
  const tone = new Float32Array(n);
  const edge = new Float32Array(n); // ≈ how far into the floe (cm): 0 on its rim
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("aFloe", new THREE.BufferAttribute(floe, 4));
  geo.setAttribute("aTilt", new THREE.BufferAttribute(tilt, 2));
  geo.setAttribute("aTone", new THREE.BufferAttribute(tone, 1));
  geo.setAttribute("aEdge", new THREE.BufferAttribute(edge, 1));
  const index = [];
  for (let f = 0; f < MAXF; f++) {
    const B = f * VPF;
    for (let j = 0; j < RIM; j++) {
      const k = (j + 1) % RIM;
      index.push(B, B + 1 + j, B + 1 + k);
      const st = B + 1 + RIM;
      const sb = B + 1 + 2 * RIM;
      index.push(st + j, sb + j, sb + k, st + j, sb + k, st + k);
    }
  }
  geo.setIndex(index);
  const mat = new THREE.ShaderMaterial({
    uniforms: U,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute vec4 aFloe; attribute vec2 aTilt; attribute float aTone, aEdge;
      uniform float uTime, uClose;
      varying vec3 vW, vN; varying vec2 vQ; varying float vTone, vEdge;
      void main() {
        float open = 1.0 - clamp(uClose, 0.0, 1.0);
        float raft = clamp((uClose - 0.8) / 0.2, 0.0, 1.0);
        vec3 p = position;
        // the pack sways past the hull (all together, slowly), and each floe jostles on its own
        vec2 off = aFloe.w * sqrt(open) * (vec2(0.95, 0.31) * 1.3 * sin(uTime * 0.9 + 0.4) + 0.5 * vec2(sin(uTime * 0.71 + aFloe.z), sin(uTime * 0.53 + aFloe.z * 1.7)));
        p.xz += off;
        p.y += raft * dot(position.xz - aFloe.xy, aTilt);
        vec3 n = normal.y > 0.5 ? normalize(vec3(-aTilt.x * raft, 1.0, -aTilt.y * raft)) : normal;
        vec4 w = modelMatrix * vec4(p, 1.0);
        vW = w.xyz; vN = n; vQ = position.xz + off; vTone = aTone; vEdge = aEdge;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${TILING_GLSL}
      ${SHADE_GLSL}
      varying vec3 vW, vN; varying vec2 vQ; varying float vTone, vEdge;
      void main() {
        vec3 n = normalize(vN);
        vec3 key = normalize(vec3(-0.62, 0.62, 0.48));
        float k = max(dot(n, key), 0.0);
        float px = max(length(fwidth(vQ)), 1e-3);
        vec3 col;
        if (n.y > 0.5) {
          col = iceTop(vQ, px, vTone, normalize(vW - cameraPosition), n) * (0.88 + 0.18 * k);
          col += uInk * 0.09 * (1.0 - smoothstep(30.0, 140.0, vEdge));
        } else {
          col = uInk * (0.1 + 0.42 * k); // the lip catches the key
        }
        col *= halo(vW);
        gl_FragColor = vec4(hazed(col, vW), 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;

  // scratch, allocated once: the polygon being clipped
  const ax = new Float64Array(160);
  const az = new Float64Array(160);
  const bx = new Float64Array(160);
  const bz = new Float64Array(160);
  const cosY = Math.cos((YAW * Math.PI) / 180);
  const sinY = Math.sin((YAW * Math.PI) / 180);
  let count = 0;
  const clip = (sx, sz, nx, nz, c) => {
    // keep dot(p − s, n) ≤ c (Sutherland–Hodgman): a → b, then back
    let m = 0;
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      const di = (ax[i] - sx) * nx + (az[i] - sz) * nz - c;
      const dj = (ax[j] - sx) * nx + (az[j] - sz) * nz - c;
      if (di <= 0) { bx[m] = ax[i]; bz[m] = az[i]; m++; }
      if ((di <= 0) !== (dj <= 0)) {
        const t = di / (di - dj);
        bx[m] = ax[i] + (ax[j] - ax[i]) * t; bz[m] = az[i] + (az[j] - az[i]) * t; m++;
      }
    }
    for (let i = 0; i < m; i++) { ax[i] = bx[i]; az[i] = bz[i]; }
    count = m;
  };

  const attrs = Object.values(geo.attributes);
  // the floe being written (no closure, nothing allocated per rebuild)
  let B = 0, mx = 0, mz = 0, ph = 0, jostle = 0, tx = 0, tz = 0, tn = 1;
  const put = (v, x, y, z, nx, ny, nz, e) => {
    const o = B + v;
    pos[o * 3] = x; pos[o * 3 + 1] = y; pos[o * 3 + 2] = z;
    nor[o * 3] = nx; nor[o * 3 + 1] = ny; nor[o * 3 + 2] = nz;
    floe[o * 4] = mx; floe[o * 4 + 1] = mz; floe[o * 4 + 2] = ph; floe[o * 4 + 3] = jostle;
    tilt[o * 2] = tx; tilt[o * 2 + 1] = tz;
    tone[o] = tn; edge[o] = e;
  };
  const fold = (b) => {
    for (let v = 0; v < VPF; v++) { const o = (b + v) * 3; pos[o] = 0; pos[o + 1] = -500; pos[o + 2] = 0; }
  };
  const last = { apart: NaN, close: NaN, ship: -1 };
  /** Rebuild the near floes for a ship at (cx, cz) (ice frame), a pack at `close`, the hull there or not. */
  function rebuild(cx, cz, close, ship) {
    const open = 1 - clamp01(close);
    const raft = clamp01((close - 0.8) / 0.2) * 50;
    const margin = 120 * open; // the hand of water off the hull, gone when the pack is shut
    let f = 0;
    const c0x = Math.floor((cx - NEAR - WARP.a) / CELL);
    const c1x = Math.floor((cx + NEAR + WARP.a) / CELL);
    const c0z = Math.floor((cz - NEAR - WARP.a) / CELL);
    const c1z = Math.floor((cz + NEAR + WARP.a) / CELL);
    for (let gz = c0z; gz <= c1z; gz++) {
      for (let gx = c0x; gx <= c1x; gx++) {
        if (f >= MAXF) break;
        const key = keyOf(gx, gz);
        const sx = (gx + 0.5 + JIT * (h1(key, 0) - 0.5)) * CELL;
        const sz = (gz + 0.5 + JIT * (h1(key, 1) - 0.5)) * CELL;
        if (Math.hypot(sx - cx, sz - cz) >= NEAR) continue; // the same test as the shader's (tiling space)
        B = f * VPF;
        f++;
        // the cell (tiling space), clipped by the leads of its 8 neighbours
        const r0 = CELL * 1.6;
        count = 4;
        ax[0] = sx - r0; az[0] = sz - r0; ax[1] = sx + r0; az[1] = sz - r0; ax[2] = sx + r0; az[2] = sz + r0; ax[3] = sx - r0; az[3] = sz + r0;
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            if (i === 0 && j === 0) continue;
            const kk = keyOf(gx + i, gz + j);
            const kx = (gx + i + 0.5 + JIT * (h1(kk, 0) - 0.5)) * CELL;
            const kz = (gz + j + 0.5 + JIT * (h1(kk, 1) - 0.5)) * CELL;
            const L = Math.hypot(kx - sx, kz - sz);
            const base = leadOf(pairKey(key, kk));
            clip(sx, sz, (kx - sx) / L, (kz - sz) / L, L / 2 - (base > 0 ? base * open - raft : 0));
          }
        }
        if (count < 3) { fold(B); f--; continue; }
        // edges cut short (they follow the warp), then each point taken back to where the shader draws it
        let per = 0;
        for (let i = 0; i < count; i++) per += Math.hypot(ax[(i + 1) % count] - ax[i], az[(i + 1) % count] - az[i]);
        const step = Math.max(250, per / (RIM - count - 4));
        let m = 0;
        for (let i = 0; i < count && m < RIM - 3; i++) {
          const j = (i + 1) % count;
          const len = Math.hypot(ax[j] - ax[i], az[j] - az[i]);
          const k = Math.max(1, Math.ceil(len / step));
          for (let s = 0; s < k && m < RIM - 3; s++) {
            const t = s / k;
            const x = ax[i] + (ax[j] - ax[i]) * t;
            const z = az[i] + (az[j] - az[i]) * t;
            bx[m] = x - warpX(x, z); bz[m] = z - warpZ(x, z); m++;
          }
        }
        count = m;
        for (let i = 0; i < count; i++) { ax[i] = bx[i]; az[i] = bz[i]; }
        // against the hull: cut along its waterline's tangent, at the point the floe's middle faces
        let pushed = false;
        let mx0 = 0;
        let mz0 = 0;
        for (let i = 0; i < count; i++) { mx0 += ax[i]; mz0 += az[i]; }
        mx0 /= count; mz0 /= count;
        const wx = mx0 - cx;
        const wz = mz0 - cz;
        const lx = wx * cosY - wz * sinY;
        const lz = wx * sinY + wz * cosY;
        if (ship && footF(lx, lz, 1.6 * CELL) < 1) {
          const n = lz < 0 ? 2.2 : 5;
          const F = footF(lx, lz, margin);
          const sc = Math.pow(Math.max(F, 1e-6), -1 / n);
          const bxl = lx * sc;
          const bzl = lz * sc;
          const aa = HB + margin;
          const bb = HL + margin;
          let gx2 = (Math.sign(bxl) * Math.abs(bxl) ** (n - 1)) / aa ** n;
          let gz2 = (Math.sign(bzl) * Math.abs(bzl) ** (n - 1)) / bb ** n;
          const gl = Math.hypot(gx2, gz2) || 1;
          gx2 /= gl; gz2 /= gl;
          // to the ice frame
          const pX = cx + bxl * cosY + bzl * sinY;
          const pZ = cz - bxl * sinY + bzl * cosY;
          const nX = gx2 * cosY + gz2 * sinY;
          const nZ = -gx2 * sinY + gz2 * cosY;
          const before = count;
          clip(pX, pZ, -nX, -nZ, 0);
          pushed = count !== before || F < 1;
          if (count < 3) { fold(B); f--; continue; }
        }
        // the floe's centre and size
        mx = 0;
        mz = 0;
        for (let i = 0; i < count; i++) { mx += ax[i]; mz += az[i]; }
        mx /= count; mz /= count;
        let rad = 0;
        for (let i = 0; i < count; i++) rad += Math.hypot(ax[i] - mx, az[i] - mz);
        rad /= count;
        const rect = Math.max(Math.abs(lx) - HB, Math.abs(lz) - HL, 0);
        jostle = pushed ? 0 : 75 * smooth(400, 2600, rect);
        ph = h1(key, 9) * TAU;
        tx = (h1(key, 10) - 0.5) * 0.024;
        tz = (h1(key, 11) - 0.5) * 0.024;
        tn = 0.84 + 0.32 * h1(key, 7);
        const top = TOP + 4 * h1(key, 12); // no two floes at one height: where they override, no flicker
        put(0, mx, top, mz, 0, 1, 0, rad);
        for (let j = 0; j < RIM; j++) {
          const i = Math.min(j, count - 1);
          const i2 = (i + 1) % count;
          // the side's normal: outward, across the edge from this vertex to the next (polygons may turn either way)
          let ex = az[i2] - az[i];
          let ez = -(ax[i2] - ax[i]);
          const el = Math.hypot(ex, ez) || 1;
          ex /= el; ez /= el;
          if ((ax[i] - mx) * ex + (az[i] - mz) * ez < 0) { ex = -ex; ez = -ez; }
          put(1 + j, ax[i], top, az[i], 0, 1, 0, 0);
          put(1 + RIM + j, ax[i], top, az[i], ex, 0, ez, 0);
          put(1 + 2 * RIM + j, ax[i], BOT, az[i], ex, 0, ez, 0);
        }
      }
    }
    for (; f < MAXF; f++) fold(f * VPF);
    for (const a of attrs) a.needsUpdate = true;
  }
  return {
    mesh,
    set(apart, close, ship) {
      const c = Math.round(clamp01(close) * 500) / 500;
      if (apart === last.apart && c === last.close && ship === last.ship) return;
      last.apart = apart; last.close = c; last.ship = ship;
      rebuild(SHOK.x, -apart * 100, c, ship);
    },
  };
}

/* ───────────────────────────────────────────────────────────── the trapped ship, X-ray */
function makeShok() {
  const group = new THREE.Group();
  const shell = glass(BRAND.ink, { base: 0, rim: 0.26, power: 2.2, edge: 0.75, spec: 0.4, through: 0.25 });
  const smoke = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, depthWrite: false, fog: false });
  const panes = [];
  const lines = [];
  const pane = (geo, edges = false) => {
    const m = new THREE.Mesh(geo, shell);
    group.add(m);
    panes.push(m);
    const s = new THREE.Mesh(geo, smoke); // smoked glass: what lies behind the hull is dimmed, the hull reads
    s.renderOrder = 16;
    group.add(s);
    if (edges) {
      const e = edgesOf(geo, { color: BRAND.ink, width: 1.8, opacity: 0.55 });
      m.add(e);
      lines.push(e.material);
    }
    return m;
  };
  const line = (pts, width = 1.9, opacity = 0.6) => {
    const l = fatLine(pts, { color: BRAND.ink, width, opacity });
    group.add(l);
    lines.push(l.material);
    return l;
  };

  // the hull: sections from the bow (−z) to the stern, each from the port deck edge down to the keel and up again
  const N = 64;
  const M = 10;
  const z0 = -HL - 0.7 * sheer(-HL) - 20;
  const z1 = HL + 0.25 * SHOK.deck + 20;
  const rows = [];
  const zs = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    zs.push(z0 + (z1 - z0) * (0.5 - 0.5 * Math.cos(Math.PI * u)));
  }
  for (const z of zs) {
    const top = sheer(z);
    const half = [];
    for (let j = 0; j <= M; j++) {
      const t = j / M;
      const y = top - (top + SHOK.draught) * (t < 0.5 ? t * t * 2 * 0.62 : 0.31 + (t - 0.5) * 1.38);
      half.push([halfW(z, y), y, z]);
    }
    rows.push([...half.map(([x, y, zz]) => [-x, y, zz]), ...half.slice(0, -1).reverse()]);
  }
  pane(skin(rows));
  // (no deck plate: seen edge-on from the ice, glass flat as a deck is a white bar across the hull)
  // its lines: the sheer, the stem, the transom, the boot top
  const sheerPts = (s) => zs.map((z) => [s * halfW(z, sheer(z)), sheer(z), z]);
  line(sheerPts(-1), 2.1, 0.75);
  line(sheerPts(1), 2.1, 0.75);
  line(Array.from({ length: 9 }, (_, i) => { const y = sheer(-HL) * (1 - i / 8); return [0, y, -HL - 0.7 * y]; }), 2.1, 0.75);
  line([-1, -0.5, 0, 0.5, 1].map((s) => [s * halfW(z1 - 40, sheer(z1 - 40)), sheer(z1 - 40) - (s * s < 1 ? 0 : 0), z1 - 40]), 1.9, 0.6);
  // the waterline: the contact (signal), where the floes press when the pack shuts
  const wl = [];
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * TAU;
    const z = -Math.cos(a) * HL;
    wl.push([Math.sin(a) * halfAt(z) * 1.01, 14, z]);
  }
  const contact = fatLine(wl, { color: BRAND.signal, width: 3.2, opacity: 0, hdr: 1.8 });
  group.add(contact);
  line(wl, 2, 0.5); // the boot top in ink: the hull sits IN the ice

  // the superstructure, forward of amidships: three tiers, the bridge with its wings, the funnel, the mast
  const D = SHOK.deck;
  const tier = (zf, za, half, y0, h) => {
    const g = box(half * 2, h, za - zf, 30);
    g.translate(0, y0 + h / 2, (zf + za) / 2);
    return pane(g, true);
  };
  tier(-2100, 900, 540, D, 260);
  tier(-1900, 300, 500, D + 260, 250);
  tier(-1950, -1150, 640, D + 510, 240); // the bridge, its wings out to the sides
  tier(-1500, -400, 380, D + 750, 150);
  const win = D + 510 + 165;
  line([[-640, win, -1950 - 2], [640, win, -1950 - 2]], 2.4, 0.8); // the bridge windows
  line([[-600, win - 60, -1950 - 2], [600, win - 60, -1950 - 2]], 1.8, 0.45);
  const funnel = new THREE.BoxGeometry(320, 420, 520).applyMatrix4(new THREE.Matrix4().makeShear(0, 0, 0, 0, 0, 0.25)).translate(0, D + 510 + 210, 650);
  pane(funnel, true);
  const mast = cyl(16, 980, 2, 12).translate(0, D + 900 + 490, -1100);
  pane(mast);
  line([[-260, D + 1650, -1100], [260, D + 1650, -1100]], 2, 0.6);
  line([[-180, D + 1350, -1100], [180, D + 1350, -1100]], 1.8, 0.5);
  // the crane on the aft deck, its boom raised over the ice
  pane(cyl(30, 420, 4, 12).translate(-260, D + 210, 2600));
  const boom = cyl(16, 900, 2, 10);
  boom.rotateX(0.95).translate(-260, D + 420 + Math.cos(0.95) * 450, 2600 + Math.sin(0.95) * 450);
  pane(boom);
  // two lifeboats, high on the sides
  for (const s of [-1, 1]) pane(new THREE.CapsuleGeometry(110, 520, 6, 14).rotateX(Math.PI / 2).translate(s * 600, D + 400, -100));
  asShell(panes, 20);

  // the rubble the pack heaps against the hull when it shuts (ice: rises out of the water with close > 0.8)
  const rand = rng(51);
  const bits = [];
  for (let i = 0; i < 90; i++) {
    const side = i % 2 ? 1 : -1;
    const z = (rand() * 2 - 1) * HL * 0.92;
    const off = 40 + rand() ** 1.6 * 320;
    const w = 50 + rand() * 120;
    const g = box(w, 25 + rand() * 45, w * (0.6 + rand() * 0.8), 6, 1);
    g.rotateX((rand() - 0.5) * 1.3).rotateZ((rand() - 0.5) * 1.3).rotateY(rand() * TAU);
    g.translate(side * (halfAt(z) + off), 10 + rand() * 30 * (1 - off / 360), z);
    bits.push(g);
  }
  const rubbleMat = solid(0x8a8984, { rough: 0.9, env: 0.3 });
  const rubble = new THREE.Mesh(mergeGeometries(bits), rubbleMat);
  rubble.castShadow = true;
  group.add(rubble);

  // THE PEOPLE: glass, along the rails — from far, a scale; never a close-up
  const crowd = new THREE.Group();
  group.add(crowd);
  const figs = [];
  const SPOTS = [
    // [x, z, facing (rad, 0 = +z), lean, hands on the rail]
    [-500, 1500, -Math.PI / 2, 6, true], [-500, 2150, -Math.PI / 2, 0, true], [-430, 2850, -2.1, 4, false],
    [-80, 2450, Math.PI, 0, false], [380, 1900, Math.PI / 2, 5, true],
    [-420, -2500, -Math.PI / 2, 8, true], [-160, -2950, Math.PI, 3, true],
    [-600, -1550, -Math.PI / 2, 0, true], [560, -1550, Math.PI / 2, 4, true],
  ].slice(0, SHOK.crowd);
  for (const [x, z, face, lean, rail] of SPOTS) {
    const fig = makeFigure({ shell: true, hands: "flat", order: 12, glassK: 1.15, through: 0.1 });
    const onBridge = z < -1400 && z > -1700;
    fig.group.position.set(x, onBridge ? D + 510 : sheer(z), z);
    fig.group.rotation.y = face;
    if (rail) {
      fig.reach("L", V(19, 104, 30));
      fig.reach("R", V(-19, 104, 30));
    }
    fig.lean(lean);
    crowd.add(fig.group);
    figs.push(fig);
  }
  return { group, shell, lines, contact, crowd, figs, smoke, rubble };
}

/* ───────────────────────────────────────────────────────────── the helicopter (after L04 bord.js: makePedro, door shut, nobody) */
function makeRotorDisc(r, k = 1) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uInk: { value: INK.clone() }, uAmount: { value: 1 }, uK: { value: k } },
    vertexShader: /* glsl */ `varying vec2 vQ; void main() { vQ = position.xy / ${r.toFixed(1)}; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount, uK; varying vec2 vQ;
      void main() {
        if (uAmount < 0.003) discard;
        float r = length(vQ);
        float aa = max(fwidth(r), 1e-4);
        float disc = 1.0 - smoothstep(1.0 - aa * 1.5, 1.0 + aa, r);
        float tips = smoothstep(0.78, 0.985, r) * disc;
        float hub = 1.0 - smoothstep(0.05, 0.11, r);
        gl_FragColor = vec4(uInk * (0.03 * disc + 0.12 * tips + 0.14 * hub) * uAmount * uK, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(r, 72), mat);
  mesh.renderOrder = 7;
  return { mesh, u: mat.uniforms };
}
function makeHeli() {
  const group = new THREE.Group();
  const bob = new THREE.Group();
  group.add(bob);
  const hull = glass(BRAND.ink, { base: 0, rim: 0.2, power: 2.6, edge: 0.5, spec: 0.45, through: 0.2 });
  const panes = [];
  const pane = (geo) => {
    const m = new THREE.Mesh(geo, hull);
    bob.add(m);
    panes.push(m);
    return m;
  };
  const ST = [[-430, 4, -40, -20], [-410, 42, -85, 10], [-360, 85, -105, 60], [-280, 108, -112, 105], [-180, 118, -112, 130], [-60, 120, -112, 150], [80, 118, -108, 150], [200, 108, -96, 135], [300, 88, -70, 115], [380, 62, -40, 95], [430, 40, -10, 80]];
  const NA = 36;
  const rows = ST.map(([z, w, lo, hi]) =>
    Array.from({ length: NA }, (_, j) => {
      const a = (TAU * j) / NA;
      const c = Math.cos(a);
      const s = Math.sin(a);
      return [w * Math.sign(c) * Math.abs(c) ** 0.7, (lo + hi) / 2 + ((hi - lo) / 2) * Math.sign(s) * Math.abs(s) ** 0.8, z];
    }),
  );
  pane(skin(rows, { wrap: true }));
  pane(new THREE.CapsuleGeometry(55, 220, 6, 18).rotateX(Math.PI / 2).translate(0, 168, 120));
  pane(lathe([[0, 0], [52, 0], [24, 560], [0, 560]], 24).rotateX(Math.PI / 2).translate(0, 70, 380));
  pane(new THREE.TorusGeometry(58, 14, 12, 40).rotateY(Math.PI / 2).translate(0, 105, 1000));
  pane(plate([[-40, 0], [70, 0], [40, 175], [5, 175], [-60, 40]], 10, { bevel: 2 }).rotateY(Math.PI / 2).translate(-5, 105, 1010));
  pane(new THREE.BoxGeometry(260, 5, 50).translate(0, 75, 860));
  for (const s of [-1, 1]) pane(new THREE.CylinderGeometry(22, 22, 14, 18).rotateZ(Math.PI / 2).translate(s * 110, -128, 120));
  pane(new THREE.CylinderGeometry(16, 16, 12, 16).rotateZ(Math.PI / 2).translate(0, -128, -300));
  pane(new THREE.CylinderGeometry(12, 15, 70, 16).translate(0, 230, 40));
  const rotor = makeRotorDisc(595);
  rotor.mesh.rotation.x = -Math.PI / 2;
  rotor.mesh.position.set(0, 268, 40);
  bob.add(rotor.mesh);
  const tail = makeRotorDisc(50, 1.4);
  tail.mesh.rotation.y = Math.PI / 2;
  tail.mesh.position.set(0, 105, 1000);
  bob.add(tail.mesh);
  asShell(panes, 20);
  return { group, bob, hull, rotor, tail };
}

/* ───────────────────────────────────────────────────────────── the map's beacons: a point and a ring, sized in pixels */
function makeBeacon(color) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uA: { value: 0 }, uSize: { value: 40 }, uRes: { value: new THREE.Vector2(BRAND.W, BRAND.H) } },
    vertexShader: /* glsl */ `
      uniform float uSize; uniform vec2 uRes; varying vec2 vOff;
      void main() {
        vec4 c = projectionMatrix * modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        vOff = position.xy * uSize;
        c.xy += vOff * 2.0 / uRes * c.w;
        gl_Position = c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uA; varying vec2 vOff;
      void main() {
        float r = length(vOff);
        float core = exp(-pow(r / 6.0, 2.0)) * 1.5;
        float ring = 1.0 - smoothstep(1.4, 2.6, abs(r - 23.0));
        float halo = exp(-r / 11.0) * 0.35;
        gl_FragColor = vec4(uColor * (core + ring * 1.05 + halo) * uA, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 9;
  return mesh;
}

/* ───────────────────────────────────────────────────────────── the easterly: long arrows over the pack */
const ARROWS = 12;
const WIND_SPAN = 700000; // how far one arrow travels before it is born again (cm)
function makeArrow() {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL.clone() }, uA: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uA; varying vec2 vUv;
      void main() {
        float u = vUv.x; float v = abs(vUv.y * 2.0 - 1.0);
        float aw = fwidth(v) * 1.5 + 1e-4;
        float shaft = (1.0 - smoothstep(0.22 - aw, 0.22 + aw, v)) * step(u, 0.86) * smoothstep(0.0, 0.75, u);
        float head = (1.0 - smoothstep(-aw, aw, v - (1.0 - u) / 0.14)) * step(0.8, u);
        float a = max(shaft * (0.25 + 0.75 * u), head);
        gl_FragColor = vec4(uColor * 1.35 * a * uA, 1.0);
      }`,
  });
  const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2); // x along the arrow, its head at +x
  geo.translate(0.5, 0, 0);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(160000, 1, 22000);
  mesh.rotation.y = Math.atan2(-WIND.dir[2], WIND.dir[0]);
  mesh.frustumCulled = false;
  mesh.renderOrder = 8;
  return mesh;
}

export function buildBanquise() {
  const root = new THREE.Group();
  const ice = new THREE.Group(); // the ice frame
  root.add(ice);

  // shared uniforms: the pack and the near floes read the same numbers
  const U = {
    uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uMood: { value: 1 }, uFog: { value: 0 }, uFocus: { value: new THREE.Vector4(0, -60000, 80000, 0) },
    uRun: { value: 0 }, uClose: { value: 0.55 }, uWake: { value: 0.6 }, uProp: { value: 0.3 }, uRidge: { value: 0 }, uWind: { value: 0 }, uTime: { value: 0 },
    uNearR: { value: NEAR }, uShok: { value: new THREE.Vector2(SHOK.x, -120000) },
    uPatch: { value: new THREE.Vector4(PATCH.ahead, PATCH.behind, PATCH.half, 0) },
    uProps: { value: new THREE.Vector4(PROPS.z, PROPS.x + PROPS.r * 2, 0, 0) },
  };

  const sky = makeSky();
  root.add(sky.mesh);
  const pack = makePack(U);
  root.add(pack);
  const floes = makeFloes(U);
  ice.add(floes.mesh);

  // the trapped ship
  const shok = makeShok();
  shok.group.rotation.y = (YAW * Math.PI) / 180;
  ice.add(shok.group);

  // the helicopter of the duel, over the trapped ship, its nose toward the icebreaker (+z)
  const heli = makeHeli();
  heli.group.rotation.y = Math.PI;
  ice.add(heli.group);

  // the map: the distance line (a dark bed under a bright line, over everything) and the two beacons
  const lineBed = fatLine([[0, 0, 0], [0, 0, 1]], { color: 0x000000, width: 11, opacity: 0 });
  const lineInk = fatLine([[0, 0, 0], [0, 0, 1]], { color: BRAND.ink, width: 3.6, opacity: 0 });
  for (const [l, o] of [[lineBed, 8], [lineInk, 9]]) {
    l.material.depthTest = false;
    l.renderOrder = o;
    l.frustumCulled = false;
    root.add(l);
  }
  const beaconIce = makeBeacon(VEILLE);
  beaconIce.position.set(0, 2000, -500);
  root.add(beaconIce);
  const beaconShok = makeBeacon(INK);
  ice.add(beaconShok);
  const lineMid = new THREE.Object3D();
  root.add(lineMid);

  // the easterly
  const winds = new THREE.Group();
  const arrows = Array.from({ length: ARROWS }, () => makeArrow());
  for (const a of arrows) winds.add(a);
  root.add(winds);
  const PERP = [-WIND.dir[2], 0, WIND.dir[0]];

  const A = {
    shok: anchor(shok.group, 0, SHOK.deck, 0),
    shokBow: anchor(shok.group, 0, SHOK.deck, -HL),
    heli: anchor(heli.group, 0, 0, 0),
    lineMid,
    beaconIce: anchor(beaconIce, 0, 0, 0),
    beaconShok: anchor(beaconShok, 0, 0, 0),
  };

  return {
    root, A,
    update(S, time) {
      const run = S.run * 100;
      const sz = -S.apart * 100; // the trapped ship, ice frame
      ice.position.z = run;
      // the field
      U.uPatch.value.w = S.bowWater ?? 0;
      U.uRun.value = S.run;
      U.uClose.value = S.close;
      U.uWake.value = S.wake;
      U.uProp.value = S.prop;
      U.uRidge.value = S.ridge;
      U.uWind.value = S.wind;
      U.uTime.value = time;
      U.uMood.value = S.mood;
      sky.u.uMood.value = S.mood;
      U.uShok.value.set(SHOK.x, sz);
      U.uFocus.value.set(S.fx, S.fz, S.fs, 0);
      floes.set(S.apart, S.close, S.shok > 0.01 ? 1 : 0);

      // the trapped ship and its people
      const a = S.shell * S.shok;
      shok.group.position.set(SHOK.x, 0, sz);
      shok.group.visible = a > 0.004;
      shok.shell.uniforms.uAmount.value = a;
      shok.smoke.opacity = 0.4 * a;
      for (const m of shok.lines) m.opacity = m.userData.base * a;
      const k = clamp01((S.close - 0.8) / 0.2) * S.shok;
      shok.contact.visible = k > 0.004;
      const kr = clamp01((S.close - 0.8) / 0.2);
      shok.rubble.visible = kr > 0.004;
      shok.rubble.position.y = -75 * (1 - kr);
      shok.contact.material.opacity = k * (0.82 + 0.18 * Math.sin(time * 1.7));
      const c = a * S.crowd;
      shok.crowd.visible = c > 0.004;
      for (const f of shok.figs) f.body.uniforms.uAmount.value = c;

      // the helicopter, hovering
      heli.group.visible = S.heli > 0.004;
      heli.group.position.set(SHOK.x + 500, HELI.y, sz + 300);
      heli.bob.position.y = 35 * Math.sin(time * 1.3);
      heli.bob.rotation.z = 0.025 * Math.sin(time * 0.7 + 1);
      heli.hull.uniforms.uAmount.value = S.heli;
      heli.rotor.u.uAmount.value = S.heli;
      heli.tail.u.uAmount.value = S.heli;

      // the distance line, unrolled from the icebreaker's bow to the trapped ship
      const on = S.line > 0.004;
      const fade = smooth(0, 0.25, S.line);
      const x0 = 0;
      const z0 = SHIP.bow;
      const x1 = SHOK.x;
      const z1 = sz + run;
      const dx = x1 - x0;
      const dz = z1 - z0;
      const len = Math.hypot(dx, dz) * Math.min(1, S.line * 1.25);
      for (const l of [lineBed, lineInk]) {
        l.visible = on && len > 1;
        l.position.set(x0, 2000, z0);
        l.rotation.y = Math.atan2(dx, dz);
        l.scale.set(1, 1, Math.max(len, 1));
      }
      lineBed.material.opacity = 0.6 * fade;
      lineInk.material.opacity = fade;
      lineMid.position.set((x0 + x1) / 2, 2000, (z0 + z1) / 2);
      beaconIce.visible = beaconShok.visible = on;
      beaconIce.material.uniforms.uA.value = fade;
      beaconShok.material.uniforms.uA.value = fade;
      beaconShok.position.set(SHOK.x, 2000, sz);

      // the easterly: arrows born upwind, carried along, fading out downwind
      winds.visible = S.wind > 0.004;
      if (winds.visible) {
        const mx = SHOK.x / 2;
        const mz = (sz + run) / 2;
        for (let i = 0; i < ARROWS; i++) {
          const ph = (time * 0.11 + i * 0.618) % 1;
          const across = (i / (ARROWS - 1) - 0.5) * 900000 + ((i * 37) % 11) * 9000;
          const along = (ph - 0.5) * WIND_SPAN;
          arrows[i].position.set(mx + PERP[0] * across + WIND.dir[0] * along, 3000, mz + PERP[2] * across + WIND.dir[2] * along);
          arrows[i].material.uniforms.uA.value = S.wind * Math.sin(Math.PI * ph) ** 0.7;
        }
      }
    },
  };
}
