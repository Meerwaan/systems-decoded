// DOSSIER L05 — Hudson : the dressing of New York (the decorator's file — docs/recette-decorateur.md).
// Thursday 15 January 2009, 15:27, −7 °C, the sun low in the south-west. Nothing here is the system, nothing stands in
// front of the geese, the engine or the plane. What the bare city did not have, and what it had that afternoon:
//   · STEAM OVER THE ROOFS — at −7 °C every boiler stack, every tower's vents breathe a white plume that rises, leans
//     with the north-west wind and comes apart: it says « winter, people inside, a city alive », and gives the flat
//     rows of blocks a height. Soft columns, never points; they follow `city` (and the ground leaving under `high`),
//     a little stronger with `cold`.
//   · THE FERRIES' EXHAUST — a diesel catamaran in the cold trails a short white breath from its stern: the ferries
//     are running, they came at full power. It rides each boat, follows the boat (its fade-in) and the wind.
//
//   (Tried and left out: the traffic on the West Side Highway and the bridge — lights too small to be seen in any shot.)
//
//   dressHudson({ list, boats }) → { group, update(p, time, px, ctx) }
//   `list`  hudson.js's blocks ([x km, z km, w, d, h, rot, lift] — cm): the plumes rise from real roofs
//   `boats` hudson.js's boats ({ group, foam, L, … }): the exhaust rides each one
//   group   in the GEOGRAPHIC frame (hudson.js's `group`: x east, y up, z south, cm)
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { KM } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const DEG = Math.PI / 180;
const PX0 = 1766;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
// the wind that afternoon: from the north-west, ≈ 8 knots — it blows TOWARD the south-east (compass 120°)
const WIND = [Math.sin(120 * DEG), -Math.cos(120 * DEG)]; // geographic x (east), z (south)

const FOGF = /* glsl */ `
  float fogKeep() {
    #ifdef FOG_EXP2
      return exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    #else
      return 1.0;
    #endif
  }`;
const NOISE = /* glsl */ `
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
  }`;
const withFog = (u) => THREE.UniformsUtils.merge([THREE.UniformsLib.fog, u]);

/* ───────────────────────────── a plume: a ribbon turned to the camera around its own bent axis ───────────────────────────── */
/** Plumes as one geometry: each a column of `seg` rungs. `src` = [{ at: [x, y, z] cm, H, w, bend, seed }]. */
function plumeGeo(src, seg = 14) {
  const pos = [], q = [], s = [], idx = [];
  src.forEach((p, k) => {
    const o = k * (seg + 1) * 2;
    for (let i = 0; i <= seg; i++) {
      const h = i / seg;
      for (const a of [-1, 1]) {
        pos.push(p.at[0], p.at[1], p.at[2]);
        q.push(h, a);
        s.push(p.H, p.w, p.seed, p.bend);
      }
      if (i < seg) {
        const v = o + i * 2;
        idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
      }
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aQ", new THREE.Float32BufferAttribute(q, 2));
  g.setAttribute("aS", new THREE.Float32BufferAttribute(s, 4));
  g.setIndex(idx);
  return g;
}
/** Steam: a soft column, widest where it comes apart, billows that climb slowly (never a flicker). `k` ≤ 0.5. */
const plumeMat = (k) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: true,
    uniforms: withFog({ uColor: { value: INK.clone() }, uK: { value: k }, uAmount: { value: 1 }, uTime: { value: 0 }, uWind: { value: new THREE.Vector2(...WIND) }, uPx: { value: PX0 } }),
    vertexShader: /* glsl */ `
      uniform float uTime, uPx; uniform vec2 uWind;
      attribute vec2 aQ; attribute vec4 aS;
      varying vec2 vQ; varying float vSeed; varying float vThin;
      #include <fog_pars_vertex>
      vec3 axisAt(float h) {
        float sway = sin(uTime * 0.21 + aS.z * 6.28 + h * 2.2) * 0.07 * h;
        vec2 w = uWind * aS.w * pow(max(h, 0.0), 1.4) + vec2(-uWind.y, uWind.x) * sway;
        return position + vec3(w.x, h, w.y) * vec3(aS.x, aS.x, aS.x);
      }
      void main() {
        float h = aQ.x;
        vec4 mv = modelViewMatrix * vec4(axisAt(h), 1.0);
        vec3 m1 = (modelViewMatrix * vec4(axisAt(max(0.0, h - 0.06)), 1.0)).xyz;
        vec3 m2 = (modelViewMatrix * vec4(axisAt(min(1.0, h + 0.06)), 1.0)).xyz;
        vec3 T = m2 - m1;
        vec3 side = cross(T, mv.xyz);
        float sl = length(side);
        side = sl > 1e-6 ? side / sl : vec3(1.0, 0.0, 0.0);
        float w = aS.y * (0.45 + 1.7 * h);
        float minW = 3.0 * max(-mv.z, 1.0) / uPx; // never thinner than three pixels across
        vThin = clamp(w / minW, 0.25, 1.0);
        mv.xyz += side * max(w, minW) * aQ.y;
        vQ = aQ; vSeed = aS.z;
        gl_Position = projectionMatrix * mv;
        vec4 mvPosition = mv;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uAmount, uTime;
      varying vec2 vQ; varying float vSeed; varying float vThin;
      #include <fog_pars_fragment>
      ${FOGF}
      ${NOISE}
      void main() {
        float x = vQ.y, h = vQ.x;
        float across = exp(-x * x * 3.4) * (1.0 - x * x);
        float along = smoothstep(0.0, 0.16, h) * (1.0 - smoothstep(0.22, 0.95, h));
        float n = vnoise(vec2(x * 1.3 + vSeed * 17.0, h * 3.2 - uTime * 0.11 + vSeed * 9.0));
        float a = across * along * (0.2 + 1.1 * n * n) * vThin;
        gl_FragColor = vec4(uColor * a * uK * uAmount * fogKeep(), 1.0);
      }`,
  });

/* ───────────────────────────── the dressing ───────────────────────────── */
export function dressHudson({ list = [], boats = [] } = {}) {
  const group = new THREE.Group();
  group.name = "habillage";
  const R = rng(1549);

  /* 1 · steam over the roofs: from real roofs — towers of Manhattan (big plumes), and the rows of the boroughs (small ones) */
  const tall = list.filter((b) => b[4] + b[6] > 9000);
  const low = list.filter((b) => b[4] + b[6] > 1400 && b[4] + b[6] < 4000);
  const src = [];
  const take = (arr, n, H, w) => {
    for (let i = 0; i < n && arr.length; i++) {
      const b = arr[Math.floor(R() * arr.length)];
      const [x, z, bw, bd, h, , lift] = b;
      // a stack near a corner of the roof, not its centre
      const ox = (R() - 0.5) * 0.5 * bw, oz = (R() - 0.5) * 0.5 * bd;
      src.push({ at: [x * KM + ox, lift + h - 200, z * KM + oz], H: H[0] + R() * (H[1] - H[0]), w: w[0] + R() * (w[1] - w[0]), bend: 0.3 + 0.35 * R(), seed: R() });
    }
  };
  take(tall, 34, [9000, 18000], [1400, 2600]);
  take(low, 520, [5000, 9000], [900, 1600]); // ≈ one roof in forty breathing, over the whole city
  const plumes = new THREE.Mesh(plumeGeo(src), plumeMat(0.26));
  plumes.frustumCulled = false;
  plumes.renderOrder = 13; // after the blocks' depth (10), the dome (11), the blocks (12): a tower hides the plume behind it
  group.add(plumes);

  /* 2 · the ferries' exhaust: a short white breath from each boat's stern, leaning with the wind */
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  const exhaust = boats.map((b, i) => {
    box.makeEmpty();
    for (const c of b.group.children) if (c !== b.foam) box.union(tmp.setFromObject(c));
    const sx = box.max.x - box.min.x;
    const top = box.max.y;
    const at = [box.min.x + 0.68 * sx, top - 40, (box.min.z + box.max.z) / 2];
    const m = new THREE.Mesh(plumeGeo([{ at, H: 1100 + 250 * R(), w: 200, bend: 0.7, seed: i * 0.137 + R() }], 10), plumeMat(0.26));
    m.frustumCulled = false;
    m.renderOrder = 14;
    b.group.add(m);
    return { b, m, wind: m.material.uniforms.uWind.value };
  });

  const Y = new THREE.Vector3(0, 1, 0);
  const w3 = new THREE.Vector3();

  return {
    group,
    update(p, time, px, ctx = {}) {
      const P = px || PX0;
      const gone = smooth(0.2, 0.75, clamp01(ctx.high ?? p.high ?? 0)); // the ground leaves as the cloud deck comes
      const city = clamp01(p.city ?? 1) * (1 - gone);
      const cold = clamp01(p.cold ?? 0.3);

      const pu = plumes.material.uniforms;
      plumes.visible = city > 0.003;
      pu.uAmount.value = city * (0.75 + 0.5 * cold);
      pu.uTime.value = time;
      pu.uPx.value = P;

      for (const e of exhaust) {
        const a = e.b.group.visible ? e.b.foam.material.uniforms.uAmt.value : 0;
        e.m.visible = a > 0.003;
        if (!e.m.visible) continue;
        const u = e.m.material.uniforms;
        u.uAmount.value = a * (1 - gone);
        u.uTime.value = time;
        u.uPx.value = P;
        // the wind in the boat's own frame (it turns with the boat)
        w3.set(WIND[0], 0, WIND[1]).applyAxisAngle(Y, -e.b.group.rotation.y);
        e.wind.set(w3.x, w3.z);
      }
    },
  };
}
