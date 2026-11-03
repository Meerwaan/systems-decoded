// DOSSIER L05 — New York at TRUE scale under the plane, 15 January 2009, ≈ 15:30, −7 °C: the Hudson (its water, its
// current, its cold), Manhattan and the boroughs as X-ray blocks, LaGuardia and Teterboro, the George Washington
// Bridge, the helicopter, the ferries, the fireboat and the Coast Guard, the winter sky and its low sun; far below, a
// cloud deck when the plane is "high".
//
//   buildHudson() → { group, A, update(p, time, px, ctx) }
//   p    the world's state S — hudson.js reads: city river riverLit airports lgaSig boats heli cold flow high haze
//   ctx  { t (the time of the day on the track), camera, alt, speed, high }
//   A    anchors in the geographic frame: ditch (the origin), lga13, lga31, lga04, teb01, gwb, pier, strike
//   makeFerry() → { group } — a New York ferry, SOLID, alone, 1 : 1 (bow toward −x, waterline at y 0)
//
// THE GEOGRAPHIC FRAME (plan.js · GEO, in KM there): x EAST, y up (0 = the river), z SOUTH, origin = the ditching
// point. world.js rotates and slides `group` so that the plane stands at the origin of the scene: hudson.js never
// moves its group. Everything that must not depend on where the group stands is drawn in shaders that read the eye in
// the geographic frame (`uToGeo`, the inverse of the group's world matrix, set in update):
//   · the dome, at infinity, centred on the eye: the winter sky (dark above, a pale band on the horizon, brighter
//     toward the sun), the sun low in the south-west (228°, 12°: 15:30 EST on 15 January at 40.7° N), the ground as a
//     GRID (no solid ground under an X-ray set), the far city as a soft MASS (a density map drawn from the blocks: what
//     lies past the blocks' reach is never a shimmer of specks), and the cloud deck when `high` lifts the plane
//   · the water (opaque ribbons): ripples that leave before they get under ten pixels, the sky and the sun mirrored,
//     a crisp bank line, the current in dashes running south (`flow`), the river lit veille along its length
//     (`riverLit`, a front from the north down to the bay), a breath of vapour seen grazing (`cold`)
//   · the blocks (instanced, ≈ 18 000): a glass of our own — a faint fill by face (roofs and the sunny side lighter),
//     edges a pixel and a half wide drawn in the shader, floors every 3.8 m; each leaves before it shimmers. A depth
//     pass first (as asShell does): only the nearest face lights up, a tower hides what is behind it.
// Solid (three greys, fine edges): the boats (veille: the rescue), the helicopter (ringed signal). Ink: everything else.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glow, glass, asShell, box, cyl, lathe, plate, edgesOf, fatLine, lineMat, mergeGeometries, placed } from "@kit/build3d.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { GEO, KM, DAY, pathAt } from "./plan.js";
import { dressHudson } from "./habillage.js"; // the decorator's dressing (steam, the ferries' exhaust, the traffic)

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
// the sun at 15:30 EST, 15 January 2009, New York (40.7° N): azimuth ≈ 228° (south-west), ≈ 12° high
const SUN_AZ = 228 * DEG;
const SUN_EL = 12 * DEG;
const SUN = new THREE.Vector3(Math.sin(SUN_AZ) * Math.cos(SUN_EL), Math.sin(SUN_EL), -Math.cos(SUN_AZ) * Math.cos(SUN_EL)).normalize();
const PX0 = 1766; // pixels per unit at unit distance when nobody says (fov 34, 1080 px)

/* ─────────────────────────────────────────────────────────── shared GLSL */
const NOISE = /* glsl */ `
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
  }`;
const FOGF = /* glsl */ `
  float fogKeep() {
    #ifdef FOG_EXP2
      return exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    #else
      return 1.0;
    #endif
  }`;
const withFog = (u) => THREE.UniformsUtils.merge([THREE.UniformsLib.fog, u]);

/* ─────────────────────────────────────────────────────────── the geography */
/** A polyline [x, z] (km) with widths (km), smoothed (Catmull-Rom), `n` steps a segment → [[x, z, w], …]. */
function densify(axis, width, n = 12) {
  const out = [];
  const P = (i) => axis[Math.max(0, Math.min(axis.length - 1, i))];
  for (let i = 0; i < axis.length - 1; i++) {
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1]), width[i] + (width[i + 1] - width[i]) * t]);
    }
  }
  out.push([...axis[axis.length - 1], width[width.length - 1]]);
  return out;
}
// the Hudson goes on into the Upper Bay; the Harlem River closes Manhattan to the north-east (a simplified outline)
const HUDSON = densify([...GEO.hudson.axis, [-1.7, 11.0], [-1.6, 13.5]], [...GEO.hudson.width, 3.2, 4.4]);
const EAST = densify(GEO.eastRiver.axis, GEO.eastRiver.width);
const HARLEM = densify([[4.95, -4.75], [5.25, -6.4], [5.75, -8.6], [6.25, -10.8], [6.55, -12.3], [6.1, -13.3]], [0.22, 0.2, 0.2, 0.19, 0.2, 0.22]);
const RIVERS = [HUDSON, EAST, HARLEM];
/** km to the nearest water (negative inside). */
function toWater(x, z) {
  let best = 1e9;
  for (const r of RIVERS)
    for (let i = 0; i < r.length - 1; i++) {
      const [ax, az, aw] = r[i];
      const [bx, bz, bw] = r[i + 1];
      const dx = bx - ax;
      const dz = bz - az;
      const l2 = dx * dx + dz * dz || 1e-9;
      const u = clamp01(((x - ax) * dx + (z - az) * dz) / l2);
      const d = Math.hypot(x - ax - dx * u, z - az - dz * u) - (aw + (bw - aw) * u) / 2;
      if (d < best) best = d;
    }
  return best;
}
const inside = (poly, x, z) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};
// Manhattan's street grid: the avenues run 29° east of north (a), the streets across (b)
const GA = [Math.sin(29 * DEG), -Math.cos(29 * DEG)];
const GB = [Math.cos(29 * DEG), Math.sin(29 * DEG)];
const fromGrid = (u, v) => [GA[0] * u + GB[0] * v, GA[1] * u + GB[1] * v];
const PARK = { u: [0.885, 4.99], v: [1.5, 2.3] }; // Central Park: 59th to 110th Street, Central Park West to Fifth Avenue
const AIRFIELDS = [
  { x: [9.55, 12.75], z: [-2.05, 0.75] }, // LaGuardia
  { x: [-5.45, -3.95], z: [-10.6, -7.5] }, // Teterboro
];

/** The blocks: [x km, z km, w cm (local x), d cm (local z), h cm, rotY, lift cm]. Deterministic. */
function genCity() {
  const R = rng(1549);
  const out = [];
  const keepOff = []; // the landmarks' footprints: nothing else there
  // the two spires that say "Manhattan" in a third of a second (heights in metres: roof, then mast or spire)
  const mark = (u, v, tiers) => {
    const [x, z] = fromGrid(u, v);
    keepOff.push([x, z]);
    for (const [w, d, y0, y1] of tiers) out.push([x, z, w * 100, d * 100, (y1 - y0) * 100, -29 * DEG, y0 * 100]);
  };
  mark(-1.13, 2.45, [[130, 90, 0, 25], [90, 62, 25, 320], [42, 34, 320, 373], [8, 8, 373, 443]]); // the Empire State Building
  mark(-0.48, 2.95, [[62, 62, 0, 200], [42, 42, 200, 255], [22, 22, 255, 282], [5, 5, 282, 319]]); //   the Chrysler Building
  const nearMark = (x, z) => keepOff.some(([a, b]) => Math.hypot(x - a, z - b) < 0.09);
  // Manhattan: blocks of 80 m × 260 m, two to five buildings each
  for (let i = -100; i < 175; i++) {
    for (let j = 0; j < 18; j++) {
      const u0 = i * 0.0805 + 0.009;
      const u1 = i * 0.0805 + 0.0715;
      const v0 = -0.5 + j * 0.27 + 0.015;
      const v1 = -0.5 + j * 0.27 + 0.255;
      const [cx, cz] = fromGrid((u0 + u1) / 2, (v0 + v1) / 2);
      if (!inside(GEO.manhattan, cx, cz) || toWater(cx, cz) < 0.07) continue;
      const um = (u0 + u1) / 2;
      const vm = (v0 + v1) / 2;
      if (um > PARK.u[0] - 0.01 && um < PARK.u[1] && vm > PARK.v[0] && vm < PARK.v[1]) continue;
      const tall = smooth(-2.0, -1.5, um) * (1 - smooth(0.8, 1.15, um)) + (1 - smooth(-6.3, -5.8, um)) * 1.05;
      const harlem = smooth(4.6, 5.4, um);
      const n = 2 + Math.floor(R() * 4);
      let v = v0;
      for (let k = 0; k < n; k++) {
        const span = k === n - 1 ? v1 - v : ((v1 - v0) / n) * (0.7 + 0.6 * R());
        const va = v + 0.003 + R() * 0.004;
        const vb = Math.min(v1, v + span) - 0.003 - R() * 0.004;
        v += span;
        if (vb - va < 0.012) continue;
        const ua = u0 + R() * 0.006;
        const ub = u1 - R() * 0.006;
        const [x, z] = fromGrid((ua + ub) / 2, (va + vb) / 2);
        if (toWater(x, z) < 0.05 || nearMark(x, z)) continue;
        const r = R();
        let h = (1 - tall) * (16 + 46 * Math.pow(r, 1.7)) + tall * (35 + 225 * Math.pow(r, 2.3));
        h *= 1 - 0.45 * harlem;
        out.push([x, z, (vb - va) * KM, (ub - ua) * KM, h * 100, -29 * DEG, 0]);
      }
    }
  }
  // the other shores: New Jersey, the Bronx, Queens, Brooklyn — low and sparser, a few clusters of towers
  const cell = 0.17;
  for (let x = -9; x < 15.5; x += cell)
    for (let z = -17; z < 13.5; z += cell) {
      const jx = x + (R() - 0.5) * 0.05;
      const jz = z + (R() - 0.5) * 0.05;
      const r0 = R();
      const r1 = R();
      const r2 = R();
      if (inside(GEO.manhattan, jx, jz) || toWater(jx, jz) < 0.11) continue;
      if (AIRFIELDS.some((a) => jx > a.x[0] && jx < a.x[1] && jz > a.z[0] && jz < a.z[1])) continue;
      const dist = Math.hypot(jx - 2, jz + 0.5);
      const jersey = jx < 1.8 && toWater(jx, jz) > 0 && jx < 0.2 + 0.32 * -jz * (jz < 0 ? 1 : 0) + (jz >= 0 ? 0 : 0);
      const pKeep = 0.55 + 0.4 * Math.exp(-dist / 8);
      if (r0 > pKeep) continue;
      let h = 7 + 9 * Math.pow(r1, 1.5) + 14 * Math.pow(r1, 6);
      // clusters: the Jersey City waterfront, Long Island City, Downtown Brooklyn
      if (jx > -3.0 && jx < -1.9 && jz > 6.2 && jz < 8.6 && toWater(jx, jz) < 0.6) h = 40 + 150 * Math.pow(r1, 1.6);
      if (jx > 3.9 && jx < 4.9 && jz > -0.4 && jz < 1.3) h = 25 + 120 * Math.pow(r1, 2.2);
      if (jx > 1.6 && jx < 3.0 && jz > 8.3 && jz < 9.6) h = 25 + 110 * Math.pow(r1, 2.2);
      // parks and yards: one square kilometre in eight is empty
      const hk = Math.sin(Math.floor(jx / 0.8) * 127.1 + Math.floor(jz / 0.8) * 311.7) * 43758.5453;
      if (hk - Math.floor(hk) < 0.12 && h < 30) continue;
      const rot = (jersey ? 0 : jz > -4.5 ? -12 : 4) * DEG + (R() - 0.5) * 6 * DEG;
      if (h > 30 || R() < 0.07) {
        // a tower, or an apartment slab over the low streets
        const hh = h > 30 ? h : 25 + 35 * R();
        out.push([jx, jz, (28 + 30 * r2) * 100, (h > 30 ? 28 + 30 * R() : 70 + 40 * R()) * 100, hh * 100, rot, 0]);
        continue;
      }
      // a block of attached houses: two or three rows of different heights
      const w = 95 + 50 * r2;
      const d = 60 + 70 * R();
      const rows = 2 + Math.floor(R() * 2);
      for (let k = 0; k < rows; k++) {
        const off = (k / rows - 0.5 + 0.5 / rows) * d;
        const ox = Math.sin(rot) * off;
        const oz = Math.cos(rot) * off;
        out.push([jx + ox / 1000, jz + oz / 1000, w * (0.85 + 0.15 * R()) * 100, (d / rows - 4) * 100, h * (0.7 + 0.6 * R()) * 100, rot, 0]);
      }
    }
  // LaGuardia: the terminal along the field, its control tower
  out.push([11.3, 0.05, 60000, 12000, 2200, -44 * DEG, 0]);
  out.push([11.1, -0.15, 1200, 1200, 6200, 0, 0]);
  out.push([11.1, -0.15, 2200, 2200, 900, 0, 6200]);
  return out;
}

/* ─────────────────────────────────────────────────────────── the blocks: glass of our own */
const blockMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true,
    uniforms: withFog({ uInk: { value: INK.clone() }, uSun: { value: SUN.clone() }, uAmount: { value: 1 }, uPx: { value: PX0 }, uFar: { value: 1650000 }, uEdge: { value: 0.3 }, uFill: { value: 1 } }),
    vertexShader: /* glsl */ `
      uniform vec3 uSun; uniform float uPx, uFar;
      varying vec3 vLoc; varying vec3 vSize; varying vec3 vN; varying vec3 vV; varying vec3 vNL; varying float vFade; varying float vSunK;
      #include <fog_pars_vertex>
      void main() {
        vSize = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vLoc = position * vSize;
        vNL = normal;
        vec3 nGeo = normalize(mat3(instanceMatrix) * normal);
        vSunK = max(dot(nGeo, uSun), 0.0);
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vec4 mvPosition = viewMatrix * wp;
        vN = normalize(mat3(viewMatrix) * mat3(modelMatrix) * nGeo);
        vV = -mvPosition.xyz;
        float dist = length(mvPosition.xyz);
        float s = max(vSize.x, max(vSize.y, vSize.z));
        vFade = smoothstep(1.2, 4.0, s * uPx / max(dist, 1.0)) * (1.0 - smoothstep(uFar * 0.8, uFar, dist));
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount, uEdge, uFill;
      varying vec3 vLoc; varying vec3 vSize; varying vec3 vN; varying vec3 vV; varying vec3 vNL; varying float vFade; varying float vSunK;
      #include <fog_pars_fragment>
      ${FOGF}
      void main() {
        float a = vFade * uAmount;
        if (a < 0.003) discard;
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        float g = clamp(1.0 - abs(dot(n, v)), 0.0, 1.0);
        vec3 an = abs(vNL);
        vec2 q; vec2 hs;
        if (an.y > 0.5) { q = vLoc.xz; hs = vSize.xz * 0.5; }
        else if (an.x > 0.5) { q = vec2(vLoc.z, vLoc.y - vSize.y * 0.5); hs = vec2(vSize.z, vSize.y) * 0.5; }
        else { q = vec2(vLoc.x, vLoc.y - vSize.y * 0.5); hs = vec2(vSize.x, vSize.y) * 0.5; }
        vec2 fw = max(fwidth(q), vec2(1e-3));
        vec2 de = (hs - abs(q)) / (fw * 1.5);
        float edge = max(1.0 - smoothstep(0.0, 1.0, de.x), 1.0 - smoothstep(0.0, 1.0, de.y));
        float facePx = 2.0 * min(hs.x / fw.x, hs.y / fw.y);
        edge *= smoothstep(5.0, 14.0, facePx);
        float floors = 0.0;
        if (an.y < 0.5) {
          float fq = vLoc.y / 380.0;
          float ff = max(fwidth(fq), 1e-4);
          floors = (1.0 - smoothstep(0.0, ff * 1.2, abs(fract(fq - 0.5) - 0.5))) * smoothstep(6.0, 14.0, 1.0 / ff);
        }
        float top = step(0.5, vNL.y);
        float fill = 0.01 + 0.022 * top + 0.035 * vSunK + 0.07 * pow(g, 3.0);
        float tall = smoothstep(4000.0, 16000.0, vSize.y);
        float k = fogKeep();
        float lum = (fill * uFill + floors * 0.04) * k + edge * uEdge * (1.0 + 1.3 * tall) * pow(k, 0.35);
        gl_FragColor = vec4(uInk * lum * a, 1.0);
      }`,
  });

/* ─────────────────────────────────────────────────────────── the water */
const waterMat = (shared, own) =>
  new THREE.ShaderMaterial({
    fog: true,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: own.offset ?? 1,
    polygonOffsetUnits: own.offset ?? 1,
    uniforms: { ...withFog({}), ...shared, uFlowOn: { value: own.flow ?? 0 }, uLitOn: { value: own.lit ?? 0 }, uLitLen: { value: own.len ?? 1 } },
    vertexShader: /* glsl */ `
      attribute float aS; attribute float aU;
      varying vec3 vGeo; varying vec3 vWorld; varying float vS; varying float vU;
      #include <fog_pars_vertex>
      void main() {
        vGeo = position; vS = aS; vU = aU;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uVeille, uSun; uniform mat3 uToGeo;
      uniform float uTime, uFlow, uFlowOn, uLit, uLitOn, uLitLen, uCold, uAmount;
      varying vec3 vGeo; varying vec3 vWorld; varying float vS; varying float vU;
      #include <fog_pars_fragment>
      ${NOISE}
      // one train of ripples: its slope, gone before its wavelength gets under ten pixels
      vec2 wave(vec2 p, vec2 dir, float L, float slope, float spd) {
        float ph = dot(p, dir) * 6.2831853 / L - uTime * spd;
        float fw = max(fwidth(ph), 1e-5);
        float trainK = 0.25 + 0.75 * vnoise(p / (L * 3.3) + dir * 17.0); // trains come and go: never a striped floor
        return dir * slope * cos(ph) * smoothstep(0.6, 0.25, fw) * trainK;
      }
      void main() {
        vec2 p = vGeo.xz;
        vec2 g = wave(p, vec2(0.31, 0.95), 5200.0, 0.05, 0.9) + wave(p, vec2(-0.6, 0.8), 2100.0, 0.05, 1.4)
          + wave(p, vec2(0.906, 0.423), 830.0, 0.06, 2.3) + wave(p, vec2(-0.2, -0.98), 310.0, 0.05, 3.7) + wave(p, vec2(0.75, -0.661), 120.0, 0.04, 6.0);
        vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
        vec3 v = normalize(uToGeo * (cameraPosition - vWorld));
        float nv = clamp(dot(n, v), 0.0, 1.0);
        vec3 r = reflect(-v, n);
        float ry = max(r.y, 0.0);
        float sunA = 0.5 + 0.5 * dot(normalize(r.xz + vec2(1e-5)), normalize(uSun.xz));
        float skyR = (0.13 * exp(-ry / 0.05) + 0.045 * exp(-ry / 0.3) + 0.012) * (0.55 + 0.9 * sunA * sunA);
        float fres = 0.02 + 0.98 * pow(clamp(1.0 - nv, 0.0, 1.0), 5.0);
        float cs = clamp(dot(r, uSun), 0.0, 1.0);
        float glint = pow(cs, 900.0) * 2.2 + pow(cs, 160.0) * 0.05;
        float lum = min(0.026 + fres * (skyR * 1.4 + glint), 2.4);
        vec3 col = uInk * lum;
        // the bank: a crisp line a pixel and a half wide
        float au = abs(vU);
        float fu = max(fwidth(vU), 1e-5);
        float bank = 1.0 - smoothstep(0.0, fu * 1.6, 1.0 - au);
        float shore = exp(-(1.0 - au) / 0.06);
        // chosen: lit veille from the north, down its length
        float front = uLit * (uLitLen + 60000.0);
        float lit = uLitOn * clamp((front - vS) / 60000.0, 0.0, 1.0);
        col += uInk * (bank * 0.42 + shore * 0.012) * (1.0 - lit);
        col += uVeille * (bank * 1.3 + shore * 0.05 + 0.006) * lit;
        // the current: streaks of foam scattered along the river, of every length, drifting south (never a row of
        // dashes: that is a runway's centre line)
        float l = (vU * 0.5 + 0.5) * 14.0;
        float li = floor(l);
        float flw = max(fwidth(l), 1e-5);
        float sq = (vS - uTime * 600.0) / 7000.0 + hash12(vec2(li, 3.0)) * 7.0;
        float ci = floor(sq);
        float cf = fract(sq);
        float sw = max(fwidth(sq), 1e-5);
        float len = 0.3 + 0.55 * hash12(vec2(ci, li + 9.0));
        float lat = fract(l) - 0.2 - 0.6 * hash12(vec2(li + 5.0, ci));
        float hw = max(0.03, flw * 0.9);
        float across = (1.0 - smoothstep(hw - flw * 0.75, hw + flw * 0.75, abs(lat))) * (0.03 / hw);
        float dash = step(0.5, hash12(vec2(li, ci))) * smoothstep(0.0, 0.12 * len + sw, cf) * (1.0 - smoothstep(0.55 * len, len, cf));
        col += uInk * across * dash * smoothstep(0.1, 0.04, sw) * smoothstep(0.9, 0.75, abs(vU)) * uFlow * uFlowOn * 0.2;
        // the cold: a breath of vapour off the water, seen grazing
        float graze = pow(clamp(1.0 - abs(v.y), 0.0, 1.0), 6.0);
        float wisp = vnoise(p / 9000.0 + vec2(uTime * 0.03, -uTime * 0.05)) * vnoise(p / 2600.0 - vec2(uTime * 0.02, 0.0));
        col += uInk * uCold * graze * (0.015 + 0.08 * wisp);
        #ifdef FOG_EXP2
          col = mix(col, fogColor, 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth));
        #endif
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });

/** A ribbon of water from densified points: aS (cm from its first point), aU (−1 … 1 across). */
function ribbonGeo(pts) {
  const pos = [];
  const aS = [];
  const aU = [];
  const idx = [];
  let s = 0;
  pts.forEach(([x, z, w], i) => {
    const [ax, az] = pts[Math.max(0, i - 1)];
    const [bx, bz] = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(bx - ax, bz - az) || 1;
    const nx = -(bz - az) / l;
    const nz = (bx - ax) / l;
    if (i) s += Math.hypot(x - pts[i - 1][0], z - pts[i - 1][1]) * KM;
    pos.push((x + (nx * w) / 2) * KM, 0, (z + (nz * w) / 2) * KM, (x - (nx * w) / 2) * KM, 0, (z - (nz * w) / 2) * KM);
    aS.push(s, s);
    aU.push(1, -1);
    if (i) idx.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i - 1, 2 * i + 1, 2 * i);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aS", new THREE.Float32BufferAttribute(aS, 1));
  g.setAttribute("aU", new THREE.Float32BufferAttribute(aU, 1));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return { g, len: s };
}

/* ─────────────────────────────────────────────────────────── the dome: sky, sun, grid, far city, cloud deck */
const domeMat = (massTex, massBox) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uInk: { value: INK.clone() }, uSun: { value: SUN.clone() }, uToGeo: { value: new THREE.Matrix4() },
      uMass: { value: massTex }, uMassBox: { value: massBox }, uCity: { value: 1 }, uGround: { value: 1 },
      uDeck: { value: 300000 }, uDeckAmt: { value: 0 }, uHaze: { value: 1 }, uCold: { value: 0.3 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position; // the dome follows the eye: the horizon stays far
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSun; uniform mat4 uToGeo; uniform sampler2D uMass; uniform vec4 uMassBox;
      uniform float uCity, uGround, uDeck, uDeckAmt, uHaze, uCold;
      varying vec3 vDir;
      ${NOISE}
      float lines(float q) { float w = max(fwidth(q) * 1.5, 1e-5); float d = abs(fract(q - 0.5) - 0.5); return 1.0 - smoothstep(0.0, w, d); }
      float level(vec2 p, float cell) {
        vec2 q = p / cell; vec2 fw = fwidth(q);
        return smoothstep(5.0, 18.0, 1.0 / max(max(fw.x, fw.y), 1e-5)) * max(lines(q.x), lines(q.y));
      }
      float cloud(vec2 p) { return 0.6 * vnoise(p / 650000.0) + 0.3 * vnoise(p / 260000.0 + 3.1) + 0.1 * vnoise(p / 90000.0 + 7.7); }
      void main() {
        vec3 d = normalize(mat3(uToGeo) * normalize(vDir));
        vec3 eye = (uToGeo * vec4(cameraPosition, 1.0)).xyz;
        float h = max(eye.y, 30.0);
        float dip = sqrt(2.0 * h / 6.371e8); // the true depression of the horizon
        float e = d.y + dip;
        float w = max(fwidth(e), 1e-6);
        float sky = smoothstep(-w, w, e);
        float es = max(e, 0.0);
        float ee = min(e, 0.0);
        vec2 hz = normalize(d.xz + vec2(1e-6));
        float toward = 0.5 + 0.5 * dot(hz, normalize(uSun.xz));
        float cs = clamp(dot(d, uSun), -1.0, 1.0);
        float ang = acos(cs);
        // the winter sky: black above, a pale band on the horizon, brighter toward the low sun
        float band = (0.26 * exp(-es / 0.025) + 0.07 * exp(-es / 0.2) + 0.012) * (0.45 + 1.1 * toward * toward) * (0.85 + 0.15 * uHaze);
        float sun = 2.6 * (1.0 - smoothstep(0.006, 0.0105, ang)) + 0.55 * exp(-ang / 0.025) + 0.14 * exp(-ang / 0.16);
        vec3 col = uInk * sky * (band + sun);
        // the ground: a grid (never a slab), the far city as a soft mass, a haze that rises to the horizon
        float below = 1.0 - sky;
        float t = h / max(-d.y, 1e-5);
        vec2 p = eye.xz + d.xz * t;
        float grid = max(max(level(p, 10000.0) * 0.3, level(p, 50000.0) * 0.55), level(p, 250000.0));
        float far = exp(-t / (1500000.0 + 8.0 * h));
        vec2 mu = (p - uMassBox.xy) / (uMassBox.zw - uMassBox.xy);
        float inBox = step(0.0, mu.x) * step(mu.x, 1.0) * step(0.0, mu.y) * step(mu.y, 1.0);
        float mass = texture2D(uMass, clamp(mu, 0.0, 1.0)).r * inBox * smoothstep(900000.0, 1500000.0, t) * exp(-t / 4000000.0);
        float haze = (0.12 * exp(ee / 0.01) + 0.025 * exp(ee / 0.07)) * (0.5 + 0.9 * toward * toward) * (1.0 + 0.4 * uCold);
        float ground = (grid * 0.13 * far + mass * 0.2 * uCity) * uGround + haze;
        // high: the cloud deck far below, lumpy, lit from the low sun; it hides the ground
        float deck = 0.0;
        if (uDeckAmt > 0.001 && eye.y > uDeck) {
          float td = (eye.y - uDeck) / max(-d.y, 1e-5);
          vec2 pd = eye.xz + d.xz * td;
          float c = cloud(pd);
          float lit = c - cloud(pd - normalize(uSun.xz) * 200000.0);
          float fade = exp(-td / 5000000.0);
          float puff = smoothstep(0.3, 0.75, c);
          deck = (0.012 + 0.11 * puff + 0.55 * max(lit, 0.0) * puff * (0.4 + 0.6 * toward)) * fade + 0.06 * (1.0 - fade) * (0.4 + toward);
          ground = mix(ground, deck, uDeckAmt);
        }
        col += uInk * below * ground;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });

/* ─────────────────────────────────────────────────────────── the runways */
const runwayMat = (len, wid) =>
  new THREE.ShaderMaterial({
    transparent: true,
    fog: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
    uniforms: withFog({ uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uLen: { value: len }, uWid: { value: wid }, uAmount: { value: 1 }, uSig: { value: 0 } }),
    vertexShader: /* glsl */ `
      varying vec2 vQ;
      uniform float uLen, uWid;
      #include <fog_pars_vertex>
      void main() {
        vQ = vec2((uv.x - 0.5) * uLen, (uv.y - 0.5) * uWid);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSignal; uniform float uLen, uWid, uAmount, uSig;
      varying vec2 vQ;
      #include <fog_pars_fragment>
      ${FOGF}
      ${NOISE}
      // a band centred on c, half-width hw, never thinner than a pixel (its light kept: it fades as it would shrink)
      float bandM(float x, float c, float hw) {
        float fw = max(fwidth(x), 1e-3);
        float h = max(hw, fw * 0.9);
        return (1.0 - smoothstep(h - fw * 0.75, h + fw * 0.75, abs(x - c))) * (hw / h);
      }
      float span(float x, float a, float b) { float fw = max(fwidth(x), 1e-3); return smoothstep(a - fw, a + fw, x) * (1.0 - smoothstep(b - fw, b + fw, x)); }
      void main() {
        float xe = uLen * 0.5 - abs(vQ.x); // cm from the nearer end
        float ay = abs(vQ.y);
        float edge = bandM(ay, uWid * 0.5 - 110.0, 45.0);
        float center = bandM(ay, 0.0, 45.0) * span(fract(vQ.x / 6100.0), 0.0, 0.6) * span(xe, 60000.0, 1e9);
        float keys = span(xe, 600.0, 5100.0) * span(ay, 300.0, 2100.0) * span(fract((ay - 300.0) / 360.0), 0.0, 0.5);
        float aim = span(xe, 30500.0, 35000.0) * span(ay, 600.0, 1500.0);
        float marks = max(max(edge, center), max(keys, aim));
        float fq = max(fwidth(vQ.x), fwidth(vQ.y));
        marks *= 1.0 - 0.6 * smoothstep(80.0, 400.0, fq);
        float asphalt = 0.07 + 0.02 * vnoise(vQ / 900.0) + 0.008 * vnoise(vQ / 140.0) * smoothstep(40.0, 10.0, fq);
        vec3 mc = mix(uInk, uSignal, uSig) * (0.5 + 0.5 * uSig);
        vec3 col = uInk * asphalt + mc * marks * 0.55 + uSignal * uSig * edge * 0.6;
        float k = fogKeep();
        gl_FragColor = vec4(col * k, uAmount);
      }`,
  });

/** Points of light: a core and a halo, never smaller than uMin pixels; nothing makes them twinkle. */
const lightsMat = (color, { size = 60, min = 2.4, k = 1.6 } = {}) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true,
    uniforms: withFog({ uColor: { value: new THREE.Color(color) }, uPx: { value: PX0 }, uSize: { value: size }, uMin: { value: min }, uK: { value: k }, uAmount: { value: 1 } }),
    vertexShader: /* glsl */ `
      uniform float uPx, uSize, uMin; varying float vA;
      #include <fog_pars_vertex>
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float s = uSize * uPx / max(-mvPosition.z, 1.0);
        gl_PointSize = clamp(max(s, uMin), 1.0, 64.0);
        vA = clamp(s / uMin, 0.4, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uAmount; varying float vA;
      #include <fog_pars_fragment>
      ${FOGF}
      void main() {
        vec2 q = gl_PointCoord * 2.0 - 1.0; float r2 = dot(q, q);
        if (r2 > 1.0) discard;
        gl_FragColor = vec4(uColor * (exp(-r2 * 9.0) * uK + exp(-r2 * 3.0) * 0.22) * vA * uAmount * (0.35 + 0.65 * fogKeep()), 1.0);
      }`,
  });

/** One sprite: a glow (a heart and a long tail) or a ring — its size in pixels between uMin and uMax. */
const spriteMat = (color, { mode = 0, r = 100000, min = 30, max = 260, k = 1.6 } = {}) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uPx: { value: PX0 }, uR: { value: r }, uMin: { value: min }, uMax: { value: max }, uK: { value: k }, uAmount: { value: 1 }, uMode: { value: mode } },
    vertexShader: /* glsl */ `
      uniform float uPx, uR, uMin, uMax; varying float vS;
      void main() {
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        vS = 2.0 * clamp(uR * uPx / max(-mv.z, 1.0), uMin, uMax);
        gl_PointSize = vS;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uAmount, uMode; varying float vS;
      void main() {
        vec2 q = gl_PointCoord * 2.0 - 1.0; float r = length(q);
        if (r > 1.0) discard;
        float l;
        if (uMode < 0.5) l = (exp(-r * r * 60.0) * uK + 0.45 * exp(-r * r * 9.0) + 0.16 * exp(-r * 3.5)) * (1.0 - smoothstep(0.75, 1.0, r));
        else { float px = 2.0 / vS; float x = (r - 0.84) / (1.6 * px); l = exp(-x * x) * uK + 0.12 * exp(-pow((r - 0.84) / 0.08, 2.0)); }
        gl_FragColor = vec4(uColor * l * uAmount, 1.0);
      }`,
  });
const sprite = (mat) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 6;
  return pts;
};

/* ─────────────────────────────────────────────────────────── the boats (SOLID) */
const GREY = { dark: 0x2e3135, mid: 0x6c7074, light: 0xaeb1ad, glass: 0x15181b };
/** A boat, solid, bow toward −x, waterline at y 0: "ferry" (a NY Waterway catamaran, ≈ 28 m), "fire" (a fireboat), "cg" (a Coast Guard response boat). */
function makeBoat(kind = "ferry") {
  const group = new THREE.Group();
  const mats = [];
  const M = (c, o = {}) => {
    const m = solid(c, { rough: 0.55, metal: 0.15, ...o });
    mats.push(m);
    return m;
  };
  const dark = M(GREY.dark);
  const mid = M(GREY.mid);
  const light = M(GREY.light);
  const win = M(GREY.glass, { rough: 0.2, metal: 0.4 });
  const lineM = [];
  const add = (geo, mat, x, y, z, edges = true) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
    if (edges) {
      const e = edgesOf(geo, { opacity: 0.55, width: 2 });
      e.position.copy(mesh.position);
      lineM.push(e.material);
      group.add(e);
    }
    return mesh;
  };
  // a hull's side profile (x, y), raked at the bow, given its width across
  const hull = (L, top, bot, rake, wdt) => plate([[-L / 2, top], [L / 2, top], [L / 2, bot], [-L / 2 + rake, bot]], wdt, { bevel: 12 }).translate(0, 0, -wdt / 2);
  const stripe = glow(VEILLE, 1.15);
  mats.push(stripe);
  let L;
  let B;
  if (kind === "ferry") {
    L = 2800;
    B = 900;
    add(hull(2700, 160, -150, 320, 240), dark, 0, 0, 330);
    add(hull(2700, 160, -150, 320, 240), dark, 0, 0, -330);
    add(box(2600, 120, 900, 20), dark, 30, 210, 0);
    add(box(2640, 40, 930, 12), M(0x1b1d20), 30, 165, 0, false);
    add(box(1900, 260, 840, 30), mid, 230, 400, 0);
    add(box(1830, 92, 852, 6), win, 230, 430, 0, false);
    add(box(1250, 230, 700, 30), light, 380, 645, 0);
    add(box(1190, 80, 712, 6), win, 380, 665, 0, false);
    add(box(460, 200, 560, 25), light, -120, 860, 0);
    add(box(470, 80, 566, 6), win, -120, 890, 0, false);
    add(cyl(9, 320, 2, 12), mid, -120, 1120, 0, false);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(22, 16, 10), glow(VEILLE, 2.2));
    mats.push(beacon.material);
    beacon.position.set(-120, 1290, 0);
    group.add(beacon);
    for (const z of [-452, 452]) add(box(2300, 16, 8, 3), stripe, 160, 292, z, false);
  } else if (kind === "fire") {
    L = 3300;
    B = 820;
    add(hull(3300, 220, -200, 520, 820), dark, 0, 0, 0);
    add(box(1500, 300, 640, 30), mid, 300, 370, 0);
    add(box(1440, 90, 652, 6), win, 300, 420, 0, false);
    add(box(520, 240, 520, 25), light, -60, 640, 0);
    add(box(530, 80, 526, 6), win, -60, 670, 0, false);
    add(box(160, 780, 160, 20), mid, 650, 910, 0);
    add(cyl(30, 260, 4, 16).rotateZ(Math.PI / 2.4), light, 560, 1320, 0, false);
    add(cyl(26, 200, 4, 16).rotateZ(Math.PI / 2.2), light, -480, 560, 220, false);
    add(cyl(26, 200, 4, 16).rotateZ(Math.PI / 2.2), light, -480, 560, -220, false);
    for (const z of [-414, 414]) add(box(2700, 16, 8, 3), stripe, 100, 210, z, false);
  } else {
    L = 1300;
    B = 420;
    add(hull(1300, 120, -90, 300, 420), dark, 0, 0, 0);
    add(box(420, 200, 330, 20), light, 120, 220, 0);
    add(box(426, 70, 336, 5), win, 120, 250, 0, false);
    add(box(140, 30, 260, 6), stripe, 120, 340, 0, false);
    add(box(1260, 50, 440, 20), M(0x1b1d20), 0, 100, 0, false);
  }
  return { group, mats, lineM, L, B };
}

export function makeFerry() {
  const b = makeBoat("ferry");
  return { group: b.group };
}

/** The water around a boat: where its hull meets it, and its wake while it runs (additive, in the boat's frame). */
const foamMat = (L, B) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true,
    uniforms: withFog({ uInk: { value: INK.clone() }, uL: { value: L }, uB: { value: B }, uWake: { value: 0 }, uAmt: { value: 1 } }),
    vertexShader: /* glsl */ `
      varying vec2 vP;
      #include <fog_pars_vertex>
      void main() {
        vP = position.xz; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uL, uB, uWake, uAmt; varying vec2 vP;
      #include <fog_pars_fragment>
      ${FOGF}
      void main() {
        float e = length(vP / vec2(uL * 0.5 + 160.0, uB * 0.5 + 130.0));
        float ring = exp(-pow((e - 1.0) / 0.09, 2.0)) * 0.16 + exp(-pow((e - 1.0) / 0.35, 2.0)) * 0.04;
        float x = vP.x - uL * 0.45;
        float arm = abs(abs(vP.y) - (uB * 0.5 + max(x, 0.0) * 0.36));
        float sp = 160.0 + max(x, 0.0) * 0.06;
        float vee = step(0.0, x) * exp(-arm * arm / (sp * sp)) * exp(-max(x, 0.0) / (uL * 2.2));
        float trail = step(0.0, x) * exp(-vP.y * vP.y / (uB * uB * 0.35)) * exp(-max(x, 0.0) / (uL * 1.3));
        float edgeF = (1.0 - smoothstep(0.6, 1.0, abs(vP.y) / (uB * 3.0))) * (1.0 - smoothstep(uL * 3.6, uL * 5.0, vP.x));
        gl_FragColor = vec4(uInk * (ring * uAmt + (vee * 0.4 + trail * 0.22) * uWake * edgeF) * fogKeep(), 1.0);
      }`,
  });

/* ─────────────────────────────────────────────────────────── the helicopter (SOLID) */
function makeHeli() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(lathe([[0, -420], [70, -380], [105, -200], [110, 60], [80, 260], [30, 380], [0, 400]], 32, { bevel: 4 }).rotateZ(Math.PI / 2), solid(0x8e9195, { rough: 0.5, metal: 0.2 }));
  const boom = new THREE.Mesh(cyl(24, 620, 3, 16, 14).rotateZ(Math.PI / 2), solid(0x5d6064, { rough: 0.6 }));
  boom.position.set(640, 40, 0);
  const fin = new THREE.Mesh(box(120, 190, 14, 4), solid(0x5d6064));
  fin.position.set(930, 120, 0);
  const skidM = solid(0x2e3135);
  const skids = [-80, 80].map((z) => {
    const s = new THREE.Mesh(box(460, 10, 12, 3), skidM);
    s.position.set(-20, -150, z);
    return s;
  });
  const mast = new THREE.Mesh(cyl(14, 70, 2, 12), skidM);
  mast.position.set(-40, 140, 0);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(560, 560, 4, 48), glass(BRAND.ink, { base: 0.02, rim: 0.2, edge: 0.6 }));
  disc.position.set(-40, 180, 0);
  asShell(disc, 18);
  group.add(body, boom, fin, ...skids, mast, disc);
  [body, boom].forEach((m) => {
    const e = edgesOf(m.geometry, { opacity: 0.5, width: 2, threshold: 40 });
    e.position.copy(m.position);
    group.add(e);
  });
  return group;
}

/* ─────────────────────────────────────────────────────────── the George Washington Bridge (X-ray) */
function makeBridge() {
  const group = new THREE.Group();
  const [ax, az] = GEO.gwb.a;
  const [bx, bz] = GEO.gwb.b;
  const L = Math.hypot(bx - ax, bz - az) * KM;
  group.position.set(ax * KM, 0, az * KM);
  group.rotation.y = -Math.atan2(bz - az, bx - ax);
  const deckY = GEO.gwb.deck * 100;
  const top = GEO.gwb.towers * 100;
  const half = 1650;
  const parts = [];
  for (const x of [0, L]) {
    for (const z of [-half, half]) parts.push(placed(box(1100, top, 1000, 60), { pos: [x, top / 2, z] }));
    for (const y of [deckY - 900, deckY + 3600, top - 400]) parts.push(placed(box(900, 700, 2 * half, 60), { pos: [x, y, 0] }));
  }
  const side = [-19000, L + 19000];
  parts.push(placed(box(side[1] - side[0], 1100, 3600, 60), { pos: [(side[0] + side[1]) / 2, deckY - 550, 0] }));
  const geo = mergeGeometries(parts);
  const mat = glass(BRAND.ink, { base: 0.0, rim: 0.32, edge: 0.45, through: 0.25 });
  const shell = new THREE.Mesh(geo, mat);
  asShell(shell, 16);
  const edges = edgesOf(geo, { opacity: 0.5, width: 2 });
  group.add(shell, edges);
  // the cables: one per side (two close together, seen as one), down to the anchorages
  const sag = deckY + 900;
  const lines = [];
  for (const z of [-half, half]) {
    const pts = [[side[0], deckY - 300, z], [0, top - 150, z]];
    for (let k = 1; k < 24; k++) {
      const u = k / 24;
      pts.push([u * L, sag + (top - 150 - sag) * Math.pow(2 * u - 1, 2), z]);
    }
    pts.push([L, top - 150, z], [side[1], deckY - 300, z]);
    const c = fatLine(pts, { color: BRAND.ink, width: 2, opacity: 0.6, fog: true });
    group.add(c);
    lines.push(c.material);
  }
  // the suspenders, every 45 m of the main span
  const seg = [];
  for (let x = 4500; x < L - 2000; x += 4500) {
    const u = x / L;
    const y = sag + (top - 150 - sag) * Math.pow(2 * u - 1, 2);
    for (const z of [-half, half]) seg.push(x, y, z, x, deckY, z);
  }
  const sg = new LineSegmentsGeometry();
  sg.setPositions(seg);
  const sus = new LineSegments2(sg, lineMat(BRAND.ink, 2, { opacity: 0.22, fog: true }));
  sus.renderOrder = 3;
  group.add(sus);
  lines.push(sus.material, edges.material);
  return { group, shell: mat, lines };
}

/* ─────────────────────────────────────────────────────────── the berths of the nine boats, around the plane afloat */
// [forward m, left m, the bow's direction (forward, left)] in the plane's frame — the first ferry noses into the left
// wing's leading edge; the others close the ring; 7 the fireboat, 8 the Coast Guard
const BERTHS = [
  [13.8, 19.8, -0.7, -0.7, "ferry"],
  [13.8, -19.8, -0.7, 0.7, "ferry"],
  [-6, 34, 0, -1, "ferry"],
  [-6, -34, 0, 1, "ferry"],
  [42, 4, -1, 0, "ferry"],
  [-40, 24, 0.6, -0.8, "ferry"],
  [-42, -26, 0.5, 0.86, "ferry"],
  [60, -32, -0.8, 0.6, "fire"],
  [-24, 54, 0.3, -0.95, "cg"],
];

/* ─────────────────────────────────────────────────────────── the set */
export function buildHudson() {
  const group = new THREE.Group();
  const PA = [0, 0, 0, 0, 0, 0, 0];

  /* the blocks */
  const list = genCity();
  const n = list.length;
  const geoBox = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const bMat = blockMat();
  const blocks = new THREE.InstancedMesh(geoBox, bMat, n);
  const hMat = bMat.clone();
  hMat.uniforms = bMat.uniforms;
  Object.assign(hMat, { colorWrite: false, depthWrite: true, blending: THREE.NoBlending });
  const hold = new THREE.InstancedMesh(geoBox, hMat, n);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const ax = new THREE.Vector3(0, 1, 0);
  const vp = new THREE.Vector3();
  const vs = new THREE.Vector3();
  list.forEach(([x, z, w, d, h, rot, lift], i) => {
    m4.compose(vp.set(x * KM, lift, z * KM), q.setFromAxisAngle(ax, rot), vs.set(w, h, d));
    blocks.setMatrixAt(i, m4);
  });
  hold.instanceMatrix = blocks.instanceMatrix;
  blocks.frustumCulled = hold.frustumCulled = false;
  hold.renderOrder = 10;
  blocks.renderOrder = 12;
  group.add(hold, blocks);

  /* the far city's mass: a density map of the blocks, blurred */
  const MB = { x0: -13, z0: -21, x1: 21, z1: 16, n: 256 };
  const dens = new Float32Array(MB.n * MB.n);
  for (const [x, z, w, d, h] of list) {
    const i = Math.floor(((x - MB.x0) / (MB.x1 - MB.x0)) * MB.n);
    const j = Math.floor(((z - MB.z0) / (MB.z1 - MB.z0)) * MB.n);
    if (i >= 0 && j >= 0 && i < MB.n && j < MB.n) dens[j * MB.n + i] += ((w * d) / 1e7) * (0.5 + Math.min(h / 6000, 3));
  }
  let src = dens;
  for (let pass = 0; pass < 3; pass++) {
    const dst = new Float32Array(src.length);
    for (let j = 0; j < MB.n; j++)
      for (let i = 0; i < MB.n; i++) {
        let s = 0;
        for (let dj = -1; dj <= 1; dj++)
          for (let di = -1; di <= 1; di++) s += src[Math.min(MB.n - 1, Math.max(0, j + dj)) * MB.n + Math.min(MB.n - 1, Math.max(0, i + di))];
        dst[j * MB.n + i] = s / 9;
      }
    src = dst;
  }
  let mx = 0;
  for (const v of src) mx = Math.max(mx, v);
  const tex = new Uint8Array(MB.n * MB.n * 4);
  src.forEach((v, k) => {
    const c = Math.round(255 * Math.sqrt(v / (mx || 1)));
    tex.set([c, c, c, 255], k * 4);
  });
  const massTex = new THREE.DataTexture(tex, MB.n, MB.n, THREE.RGBAFormat);
  massTex.magFilter = massTex.minFilter = THREE.LinearFilter;
  massTex.needsUpdate = true;

  /* the dome */
  const dMat = domeMat(massTex, new THREE.Vector4(MB.x0 * KM, MB.z0 * KM, MB.x1 * KM, MB.z1 * KM));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), dMat);
  dome.frustumCulled = false;
  // drawn just after the blocks' depth: a tower hides the bright horizon behind it — the skyline stands dark on its
  // halo, its edges lit (the solids, the water, the runways wrote their depth before: they hide it too)
  dome.renderOrder = 11;
  group.add(dome);

  /* the water */
  const WU = {
    uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() }, uSun: { value: SUN.clone() }, uToGeo: { value: new THREE.Matrix3() },
    uTime: { value: 0 }, uFlow: { value: 0 }, uLit: { value: 0 }, uCold: { value: 0.3 }, uAmount: { value: 1 },
  };
  const waters = [HUDSON, EAST, HARLEM].map((pts, i) => {
    const { g, len } = ribbonGeo(pts);
    const m = new THREE.Mesh(g, waterMat(WU, { flow: i === 0 ? 1 : 0, lit: i === 0 ? 1 : 0, len, offset: 1 + i }));
    m.frustumCulled = false;
    group.add(m);
    return m;
  });

  /* the airports: runways, their lights; LaGuardia's signal glow ("derrière toi") */
  const RW = 4570;
  const runways = [];
  const addRunway = ([a, b], lga) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) * KM;
    const mat = runwayMat(L, RW);
    const r = new THREE.Mesh(new THREE.PlaneGeometry(L, RW).rotateX(-Math.PI / 2), mat);
    r.position.set(((a[0] + b[0]) / 2) * KM, 2, ((a[1] + b[1]) / 2) * KM);
    r.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    r.renderOrder = 1;
    group.add(r);
    // the lights: both edges every 61 m, a bar across each threshold
    const pos = [];
    for (let x = -L / 2; x <= L / 2 + 1; x += 6100) pos.push(x, 40, RW / 2 + 150, x, 40, -RW / 2 - 150);
    for (const x of [-L / 2 - 200, L / 2 + 200]) for (let zz = -RW / 2; zz <= RW / 2; zz += 380) pos.push(x, 40, zz);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    const lm = lightsMat(BRAND.ink, { size: 70, min: 2.2, k: 1.5 });
    const pts = new THREE.Points(g, lm);
    pts.frustumCulled = false;
    pts.renderOrder = 5;
    r.add(pts);
    runways.push({ mesh: r, mat, lights: lm, lga });
  };
  addRunway(GEO.lga.r04, true);
  addRunway(GEO.lga.r13, true);
  addRunway(GEO.teb.r01, false);
  const lgaGlow = sprite(spriteMat(BRAND.signal, { mode: 0, r: 110000, min: 30, max: 200, k: 1.2 }));
  lgaGlow.position.set(11.1 * KM, 6000, -0.75 * KM);
  group.add(lgaGlow);
  const lgaRing = sprite(spriteMat(BRAND.signal, { mode: 1, r: 130000, min: 22, max: 150, k: 0.9 }));
  lgaRing.position.copy(lgaGlow.position);
  group.add(lgaRing);

  /* the George Washington Bridge */
  const bridge = makeBridge();
  group.add(bridge.group);

  /* the helicopter of the TCAS alarm, ringed signal: from the river's west side, flying north up the Hudson */
  const heli = makeHeli();
  const heliRing = sprite(spriteMat(BRAND.signal, { mode: 1, r: 2600, min: 30, max: 90, k: 1.3 }));
  heliRing.renderOrder = 8;
  heli.add(heliRing);
  group.add(heli);
  const HELI = { at: [3.55, -7.6], alt: 33000, dir: [0.389, -0.922], v: 2500 };

  /* the boats */
  const boats = BERTHS.map(([f, l, bf, bl, kind]) => {
    const b = makeBoat(kind);
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(b.L * 6, b.B * 6).rotateX(-Math.PI / 2).translate(b.L * 2.2, 3, 0), foamMat(b.L, b.B));
    foam.renderOrder = 4;
    foam.frustumCulled = false;
    b.group.add(foam);
    b.mats.forEach((m) => (m.userData.base0 = m.opacity));
    group.add(b.group);
    return { ...b, foam, f, l, bf, bl };
  });
  const dress = dressHudson({ list, boats }); group.add(dress.group);

  /* anchors */
  const A = {};
  const anchorAt = (name, x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x * KM, y, z * KM);
    group.add(o);
    A[name] = o;
  };
  anchorAt("ditch", 0, 0, 0);
  anchorAt("lga04", GEO.lga.r04[0][0], 0, GEO.lga.r04[0][1]);
  anchorAt("lga13", GEO.lga.r13[0][0], 0, GEO.lga.r13[0][1]);
  anchorAt("lga31", GEO.lga.r13[1][0], 0, GEO.lga.r13[1][1]);
  anchorAt("teb01", GEO.teb.r01[0][0], 0, GEO.teb.r01[0][1]);
  anchorAt("gwb", (GEO.gwb.a[0] + GEO.gwb.b[0]) / 2, GEO.gwb.deck * 100, (GEO.gwb.a[1] + GEO.gwb.b[1]) / 2);
  anchorAt("pier", GEO.ferryPier[0], 0, GEO.ferryPier[1]);
  anchorAt("strike", GEO.strike[0], 0, GEO.strike[1]);

  const toGeo = new THREE.Matrix4();
  const lightCol = new THREE.Color();

  return {
    group,
    A,
    update(p, time, px, ctx = {}) {
      const P = px || PX0;
      const high = clamp01(ctx.high ?? p.high ?? 0);
      const gone = smooth(0.2, 0.75, high); // the ground leaves as the deck comes
      const deckA = smooth(0.35, 0.85, high);
      const city = clamp01(p.city ?? 1) * (1 - gone);
      const river = clamp01(p.river ?? 1) * (1 - gone);
      const lgaSig = clamp01(p.lgaSig ?? 0);
      const airports = Math.max(clamp01(p.airports ?? 0), lgaSig) * (1 - gone);
      const cold = clamp01(p.cold ?? 0);
      const t = ctx.t ?? DAY.contact;

      group.updateWorldMatrix(true, false);
      toGeo.copy(group.matrixWorld).invert();

      // the dome
      const du = dMat.uniforms;
      du.uToGeo.value.copy(toGeo);
      du.uCity.value = clamp01(p.city ?? 1);
      du.uGround.value = 1 - gone;
      du.uDeckAmt.value = deckA;
      du.uDeck.value = Math.max(150000, (ctx.alt ?? 86000) - 380000);
      du.uHaze.value = p.haze ?? 1;
      du.uCold.value = cold;

      // the blocks
      blocks.visible = hold.visible = city > 0.003;
      bMat.uniforms.uAmount.value = city;
      bMat.uniforms.uPx.value = P;

      // the water
      WU.uToGeo.value.setFromMatrix4(toGeo);
      WU.uTime.value = time;
      WU.uFlow.value = clamp01(p.flow ?? 0);
      WU.uLit.value = clamp01(p.riverLit ?? 0);
      WU.uCold.value = cold;
      WU.uAmount.value = river;
      for (const w of waters) w.visible = river > 0.003;

      // the airports
      for (const r of runways) {
        const sig = r.lga ? lgaSig : 0;
        r.mesh.visible = airports > 0.003;
        r.mat.uniforms.uAmount.value = airports;
        r.mat.uniforms.uSig.value = sig;
        r.lights.uniforms.uAmount.value = airports;
        r.lights.uniforms.uPx.value = P;
        lightCol.copy(INK).lerp(SIGNAL, sig);
        r.lights.uniforms.uColor.value.copy(lightCol);
      }
      lgaGlow.visible = lgaRing.visible = lgaSig > 0.003 && gone < 0.99;
      lgaGlow.material.uniforms.uAmount.value = lgaSig;
      lgaRing.material.uniforms.uAmount.value = lgaSig;
      lgaGlow.material.uniforms.uPx.value = lgaRing.material.uniforms.uPx.value = P;

      // the bridge
      bridge.group.visible = city > 0.003;
      bridge.shell.uniforms.uAmount.value = city;
      for (const m of bridge.lines) m.opacity = m.userData.base * city;

      // the helicopter
      const hv = clamp01(p.heli ?? 0);
      heli.visible = hv > 0.003;
      if (heli.visible) {
        const s = ((t - DAY.tcas) * HELI.v) / KM;
        heli.position.set((HELI.at[0] + HELI.dir[0] * s) * KM, HELI.alt + 300 * Math.sin(time * 0.7), (HELI.at[1] + HELI.dir[1] * s) * KM);
        heli.rotation.y = Math.atan2(HELI.dir[1], -HELI.dir[0]) + 0.04 * Math.sin(time * 0.5);
        heliRing.material.uniforms.uAmount.value = hv;
        heliRing.material.uniforms.uPx.value = P;
      }

      // the boats, around the plane afloat
      const nb = Math.max(0, p.boats ?? 0) * (1 - gone);
      let anyBoat = false;
      for (let i = 0; i < boats.length; i++) {
        const b = boats[i];
        const a = clamp01(nb - i);
        b.group.visible = a > 0.001;
        if (!b.group.visible) continue;
        if (!anyBoat) {
          pathAt(t, PA);
          anyBoat = true;
        }
        const h = PA[3];
        const Fx = Math.sin(h);
        const Fz = -Math.cos(h);
        const Lx = -Math.cos(h);
        const Lz = -Math.sin(h);
        const Dx = b.bf * Fx + b.bl * Lx;
        const Dz = b.bf * Fz + b.bl * Lz;
        const e = 1 - Math.pow(1 - a, 3);
        const back = (1 - e) * 45000; // it comes from 450 m, its bow first
        b.group.position.set(PA[0] + (b.f * Fx + b.l * Lx) * 100 - Dx * back, 8 * Math.sin(time * 1.1 + i * 1.7), PA[2] + (b.f * Fz + b.l * Lz) * 100 - Dz * back);
        b.group.rotation.set(0.012 * Math.sin(time * 0.9 + i), Math.atan2(Dz, -Dx), 0.008 * Math.sin(time * 1.3 + i * 2.1));
        const op = smooth(0, 0.12, a);
        for (const m of b.mats) {
          m.opacity = op * (m.userData.base0 ?? 1);
          m.transparent = op < 0.999;
        }
        for (const m of b.lineM) m.opacity = 0.55 * op;
        b.foam.material.uniforms.uAmt.value = op;
        b.foam.material.uniforms.uWake.value = smooth(0, 0.1, a) * (1 - smooth(0.75, 1, a));
      }
      dress.update(p, time, px, ctx);
    },
  };
}
