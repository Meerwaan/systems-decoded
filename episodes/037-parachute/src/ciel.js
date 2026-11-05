// DOSSIER 037 — Le parachute de secours : THE SKY AND THE COUNTRYSIDE. Everything that is neither you nor the rig, in
// the scene's frame: world.js adds `group` at the origin and never turns it (docs/037-decors.md, ciel.js).
//   buildSky() → { group, A, update(p, time, px) }
//   group    added to the scene by world.js at the origin, never turned (the diver turns, the world does not)
//   A        anchors: ground (a point of the ground under you, y = −alt · 100), field (the landing field's centre)
//   update(p, time, px) — p, plain numbers (sixteen times a frame: nothing allocated here):
//     alt      metres above the ground: the horizon's depression, the countryside's size, the ground's plane; it is
//              also the air's travel (the streaks run with it: alt falling = air rushing up past you)
//     vz       the fall's speed, m/s: the streaks' length (55: long, 5: short, 0: none)
//     sky      the dome, the countryside and the air shown (0 on the bench)
//     threat   the ground coming up: the roads turn signal first (0.05 → 0.45), then the hedges (0.45 → 0.95), the
//              haze warms a little — each line is ink or signal, never in between for long
//     strata   the principle's pressure layers: sheets of grains, closer and denser lower down (0–1)
//     gate     the window's sheet at ALT.gate above the ground, veille (0–1)
//     mood     read, unused: the light is the stage's (the countryside keeps its three colours whatever the mood)
//
// WHAT IS HERE
//   · the dome, at infinity (copied from 026/sky.js's domeMat, itself 007's backdropMat — copied, not imported): black
//     above, a thin pale band of air over a fine bright horizon line, the horizon at the true depression `alt` gives
//     (the Earth's curve: the rays that miss the ground are sky). Under it, where each ray meets the ground: THE
//     COUNTRYSIDE IN SQUARES — blocks of parcels (a Voronoi of jittered seeds, each turned its own way), in each one
//     strips of fields of 120 to 420 m in four dark values of ink (a wood the darkest; some ploughed, their furrows a
//     soft wave), hedges in fine lines on most edges, three families of winding roads a little brighter, villages in
//     dots; haze toward the horizon. Every line is never thinner than a pixel and a half and, drawn wider, dimmer
//     (it keeps its energy); a detail leaves before it gets smaller than a few pixels (no shimmer in the fall). THE
//     LANDING FIELD (HOME, around the origin) is drawn on purpose: ploughed along z, its hedge on x = +28 m where the
//     real one stands.
//   · the pressure layers (`strata`), in the dome too: horizontal sheets at fixed heights above the ground (LAYERS:
//     140 m apart up high, 40 m near the ground), 1.6 km wide around you, each a faint sheet of grains and a fine rim;
//     brighter and denser lower down. As `alt` falls they rise through you.
//   · the air going by (026's makeStreaks, along y): fine ink streaks, their length the speed, their travel the altitude.
//   · the window (`gate`): a real sheet at 225 m above the ground (GATE.r), veille — a fine grid (12 m, and 60 m), a
//     bright rim, a faint fill brighter under you; it breathes slowly.
//   · near the ground (alt < GROUND.near), real geometry on the landing field: the morning grass (tufts, short where
//     the cameras look at the rig), a fence and a hedge with two trees along x = +26 to +29 m, a soft contact under the
//     rig. Lines of light (X-ray): no solid ground, the furrows are the grid.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { lineMat } from "@kit/build3d.js";
import { makeContact } from "@kit/atmo.js";
import { DEG, GATE, ALT, GROUND, STRATA } from "./plan.js";
import { dressSky } from "./habillage.js"; // the clouds and their shadows (the decorator)

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const VIEWPORT = new THREE.Vector2(BRAND.W, BRAND.H);
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** The landing field, metres, in the scene's frame (the dome draws it, the near geometry stands on its edge). */
const HOME = { x: [-120, 28], z: [-90, 110] };
/** The hedge and the fence of the landing field (cm): along z, on its +x edge. */
const HEDGE = { x: 2850, fence: 2620, z: [-6000, 6000] };
/** The pressure layers: heights above the ground (m), spaced STRATA.step[1] near the ground → STRATA.step[0] at 2 km. */
const LAYERS = (() => {
  const out = [];
  const [hi, lo] = STRATA.step;
  for (let h = 18; h < 4600 && out.length < 48; h += lo + (hi - lo) * Math.min(h / 2000, 1)) out.push(h);
  return out;
})();
/** How wide the layers are around you (m): their rims stack like contour lines toward the horizon. */
const LAYER_R = 2400;

/* ───────────────────────────────────────────────────────────── the dome */

const domeMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uInk: { value: INK.clone() },
      uSig: { value: SIGNAL.clone() },
      uGround: { value: -ALT.first * 100 }, // cm: the ground's plane
      uAmount: { value: 1 },
      uRoad: { value: 0 }, // the roads turned signal (0–1)
      uHedge: { value: 0 }, // the hedges turned signal (0–1)
      uHaze: { value: 0 }, // the haze warmed (0–1)
      uDim: { value: 0 }, // the countryside dimmed under the layers
      uStrata: { value: 0 },
      uLayers: { value: Float32Array.from({ length: 48 }, (_, i) => LAYERS[i] ?? 1e6) },
      uCount: { value: LAYERS.length },
      uHome: { value: new THREE.Vector4(HOME.x[0], HOME.x[1], HOME.z[0], HOME.z[1]) },
      uPool: { value: 0 }, // the morning light on the grass round the rig (alt ≈ 0)
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position; // the dome follows the eye: the horizon stays far
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSig;
      uniform float uGround, uAmount, uRoad, uHedge, uHaze, uDim, uStrata, uPool;
      uniform float uLayers[48];
      uniform int uCount;
      uniform vec4 uHome;
      varying vec3 vDir;
      const float EARTH = 6.371e6; // m
      const float CELL = 900.0; //    m: the blocks of parcels

      float hash1(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec2 hash2(vec2 p) { float a = hash1(p); return vec2(a, hash1(p + a + 17.13)); }
      // a line of true width wt (m) at distance dist (m), never thinner than a pixel and a half — drawn wider, dimmer
      float line(float dist, float wt, float fp) {
        float w = max(wt, 1.5 * fp);
        return (1.0 - smoothstep(0.5 * w, 0.5 * w + fp, dist)) * (wt / w);
      }
      // the furrows of a ploughed field: a soft wave across x, gone before it gets finer than a few pixels
      float furrows(float x, float fx) {
        return (0.5 + 0.5 * cos(x * 7.854)) * (1.0 - smoothstep(0.12, 0.3, fx / 0.8)); // 0.8 m apart
      }

      // three families of winding roads, a few per kilometre and a half
      float roads(vec2 q, float fp) {
        float r = 0.0;
        for (int k = 0; k < 3; k++) {
          float th = float(k) * 1.07 + 0.35;
          vec2 dir = vec2(cos(th), sin(th));
          float s = dot(q, dir);
          float n = dot(q, vec2(-dir.y, dir.x));
          float P = 1250.0 + 420.0 * float(k);
          float c = floor(n / P + 0.5);
          float ph = hash1(vec2(c, float(k) * 7.0 + 1.0)) * 6.283;
          float m = 190.0 * sin(s / 700.0 + ph) + 70.0 * sin(s / 260.0 + 1.7 * ph);
          float slope = 190.0 / 700.0 * cos(s / 700.0 + ph) + 70.0 / 260.0 * cos(s / 260.0 + 1.7 * ph);
          float dn = abs(n - c * P - m) / sqrt(1.0 + slope * slope);
          r = max(r, line(dn, 7.0, fp) * step(0.22, hash1(vec2(c + 0.5, float(k) + 3.5))));
        }
        return r;
      }

      // the countryside at q (m): the field's value, its hedges, its houses
      void land(vec2 q, vec2 fw, out float field, out float hedge, out float town) {
        float fp = max(fw.x, fw.y);
        float fa = sqrt(fw.x * fw.y); // a field is an area: seen grazing, it stays a band toward the horizon
        // the block: the nearest jittered seed, and the border with the second nearest
        vec2 g = floor(q / CELL);
        float d1 = 1e12, d2 = 1e12;
        vec2 s1 = vec2(0.0), s2 = vec2(1.0), id = vec2(0.0);
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
          vec2 c = g + vec2(float(i), float(j));
          vec2 s = (c + 0.15 + 0.7 * hash2(c)) * CELL;
          float dd = dot(q - s, q - s);
          if (dd < d1) { d2 = d1; s2 = s1; d1 = dd; s1 = s; id = c; } else if (dd < d2) { d2 = dd; s2 = s; }
        }
        float border = abs(dot(q - 0.5 * (s1 + s2), normalize(s2 - s1 + 1e-3)));
        // the block's own direction, and its strips of fields
        float a = (hash1(id + 3.7) - 0.5) * 1.3;
        float ca = cos(a), sa = sin(a);
        vec2 l = vec2(ca * (q.x - s1.x) - sa * (q.y - s1.y), sa * (q.x - s1.x) + ca * (q.y - s1.y));
        float W = mix(100.0, 200.0, hash1(id + 9.1));
        float si = floor(l.x / W);
        float L = mix(120.0, 340.0, hash1(id + vec2(si * 1.37, 0.5)));
        float off = hash1(id * 1.7 + vec2(si, 2.0)) * L;
        float v = (l.y + off) / L;
        vec2 fid = id * 31.0 + vec2(si, floor(v));
        float hv = hash1(fid);
        float tone = hv < 0.16 ? 0.015 : hv < 0.45 ? 0.032 : hv < 0.76 ? 0.052 : 0.076;
        if (hash1(fid + 0.7) < 0.38 && hv >= 0.16) tone *= 0.72 + 0.56 * furrows(l.x, fp);
        // the hedges: the block's border always, most strip edges, half of the field ends; a wood is always hedged
        float ex = W * (0.5 - abs(fract(l.x / W) - 0.5));
        float ey = L * (0.5 - abs(fract(v) - 0.5));
        float hasX = step(hash1(id + vec2(floor(l.x / W + 0.5) * 2.3, 7.0)), 0.72);
        float hasY = step(hash1(id + vec2(si * 1.9 + floor(v + 0.5) * 5.1, 3.0)), 0.55);
        if (hv < 0.16) { hasX = 1.0; hasY = 1.0; }
        float show = smoothstep(3.5, 9.0, 120.0 / fp);
        hedge = show * max(line(border, 4.0, fp), max(line(ex, 3.0, fp) * hasX, line(ey, 3.0, fp) * hasY));
        // fields leave toward their mean before they get smaller than a few pixels
        field = mix(0.045, tone, smoothstep(2.0, 6.0, 100.0 / fa));
        // a farm in a corner of some fields: three to five roofs, the scale of the height
        town = 0.0;
        if (hash1(fid + 4.4) < 0.07) {
          vec2 fc = vec2((si + 0.5) * W, (floor(v) + 0.5) * L - off);
          vec2 fq = l - fc - (hash2(fid) - 0.5) * vec2(W, L) * 0.6;
          vec2 jit = (hash2(floor(fq / 14.0) + fid * 0.37) - 0.5) * 5.0;
          fq += jit;
          vec2 hc = floor(fq / 14.0);
          float on = step(length(hc + 0.5), 1.6) * step(0.35, hash1(hc + fid));
          vec2 e = abs(fract(fq / 14.0) - 0.5) * 14.0;
          float crisp = on * (1.0 - smoothstep(4.5 - fp, 4.5 + fp, e.x)) * (1.0 - smoothstep(3.0 - fp, 3.0 + fp, e.y));
          float mean = step(length(fq), 30.0) * 0.12;
          town = mix(mean, crisp, smoothstep(0.8, 2.5, 4.5 / fp)) * 0.26;
        }
        // a village, in some blocks: houses in dots around a centre
        if (hash1(id + 5.5) < 0.3) {
          vec2 vc = s1 + (hash2(id + 2.0) - 0.5) * 260.0;
          float rr = length(q - vc) / 170.0;
          if (rr < 1.0) {
            vec2 hc = floor(l / 16.0);
            float on = step(0.42 + 0.5 * rr * rr, hash1(hc + id));
            vec2 e = abs(fract(l / 16.0) - 0.5) * 16.0;
            float crisp = on * (1.0 - smoothstep(4.0 - fp, 4.0 + fp, e.x)) * (1.0 - smoothstep(3.0 - fp, 3.0 + fp, e.y));
            float mean = (1.0 - rr * rr) * 0.5 * 0.19;
            town = max(town, mix(mean, crisp, smoothstep(1.0, 3.0, 4.0 / fp)) * 0.24);
            field = mix(field, 0.06, 1.0 - rr);
            hedge *= rr;
          }
        }
        // the landing field: ploughed along z, its four hedges (the real one stands on its +x edge)
        if (q.x > uHome.x && q.x < uHome.y && q.y > uHome.z && q.y < uHome.w) {
          field = 0.05 * (0.7 + 0.6 * furrows(q.x, fw.x));
          float eh = min(min(q.x - uHome.x, uHome.y - q.x), min(q.y - uHome.z, uHome.w - q.y));
          hedge = line(eh, 3.0, fp);
          town = 0.0;
        }
      }

      void main() {
        vec3 d = normalize(vDir);
        float h = max(cameraPosition.y - uGround, 1.0) * 0.01; // the eye above the ground, m
        float dip = sqrt(2.0 * h / EARTH); //                     the true depression of the horizon
        float e = asin(clamp(d.y, -1.0, 1.0)) + dip; //          radians from the horizon: + the sky, − the ground
        float w = max(fwidth(e), 1e-6);
        float skyK = smoothstep(-w, w, e);
        float es = max(e, 0.0);
        float ee = min(e, 0.0);

        // the sky: black above, the faintest rise toward the horizon, a thin pale band of air, a fine bright line
        float s = max(0.8 * w, 0.0004);
        float limb = exp(-0.5 * e * e / (s * s)) * 0.36;
        float air = skyK * (0.12 * exp(-es / 0.010) + 0.026 * exp(-es / 0.22));
        vec3 col = uInk * (limb + air);

        // the ground: where the ray meets the Earth (its curve: the rays over the horizon miss it)
        float dy = -d.y;
        float t = min(2.0 * h / max(dy + sqrt(max(dy * dy - 2.0 * h / EARTH, 0.0)), 1e-5), 3.0e5);
        vec2 q = cameraPosition.xz * 0.01 + d.xz * t;
        vec2 fw = fwidth(q);
        float field, hedge, town;
        land(q, fw, field, hedge, town);
        float fp = max(fw.x, fw.y);
        float road = roads(q, fp) * smoothstep(3.0, 8.0, 300.0 / fp);
        if (q.x > uHome.x - 12.0 && q.x < uHome.y + 12.0 && q.y > uHome.z - 12.0 && q.y < uHome.w + 12.0) road = 0.0;
        float dimK = 1.0 - 0.65 * uDim;
        vec3 ground = uInk * (field + town) * dimK
          + mix(uInk, uSig * 1.15, uHedge) * hedge * 0.12 * dimK
          + mix(uInk, uSig * 1.15, uRoad) * road * 0.19 * dimK;
        // haze toward the horizon, and a low mist just under it
        float hz = 1.0 - exp(-t / (3500.0 + 9.0 * h));
        vec3 hazeCol = mix(uInk, uSig, 0.45 * uHaze) * (0.055 + 0.15 * exp(ee / 0.022));
        ground = mix(ground, hazeCol, hz);
        // the morning light on the grass round the rig: the subject on its halo
        float rp = length(q - vec2(0.0, -0.1));
        ground += uInk * uPool * (0.11 * exp(-rp * rp / 1.1) + 0.035 * exp(-rp / 4.0));
        col += (1.0 - skyK) * ground;

        // the pressure layers: sheets at fixed heights above the ground, around you
        if (uStrata > 0.001) {
          float pa = length(fwidth(d)); // radians per pixel
          vec3 str = vec3(0.0);
          for (int k = 0; k < 48; k++) {
            if (k >= uCount) break;
            float hk = uLayers[k];
            float dh = hk - h; // m, + above the eye
            if (dh * d.y <= 0.0) continue;
            float tk = dh / d.y; // m along the ray
            vec2 pk = cameraPosition.xz * 0.01 + d.xz * tk;
            float edge = ${LAYER_R.toFixed(1)} - length(pk);
            if (edge < -60.0) continue;
            float fpk = max(tk * pa / max(abs(d.y), 0.03), 1e-3);
            float thick = 1.0 - clamp(hk / 3200.0, 0.0, 1.0); // denser lower down
            vec2 gc = floor(pk / 6.0);
            vec2 gp = (gc + 0.2 + 0.6 * hash2(gc + float(k) * 3.1)) * 6.0;
            float gd = length(pk - gp);
            float rad = 0.35 + 0.25 * thick;
            float crisp = 1.0 - smoothstep(rad - 0.5 * fpk, rad + 0.5 * fpk, gd);
            float mean = 3.1416 * rad * rad / 36.0;
            float grains = mix(crisp * (1.0 - smoothstep(2.5, 6.0, rad / fpk)) + mean * smoothstep(2.5, 6.0, rad / fpk), mean, smoothstep(0.4 * rad, 1.6 * rad, fpk));
            float inside = smoothstep(0.0, 80.0, edge);
            float fade = exp(-tk / 9000.0);
            float v = inside * (0.004 + grains * (0.1 + 0.2 * thick)) + line(abs(edge), 5.0, fpk) * (0.07 + 0.12 * thick);
            str += uInk * v * fade;
          }
          col += str * uStrata;
        }
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the air going by */

/**
 * The air going by (026's makeStreaks, copied): each mote is drawn as the line it covers — its head bright, its tail
 * gone — three pixels wide whatever its distance. `uTravel`: cm the air has risen past you (alt · 100: alt falling, the
 * air runs up) · `uLen`: cm of streak, negative (the tail under the head: the air goes up) · `uShare`: how many are drawn.
 * Seen from far (a camera more than ≈ 60 m off the origin) they melt away: a cloud of streaks round a dot is noise.
 */
function makeStreaks({ count, seed, min, size, len, ref }) {
  const rand = rng(seed);
  const base = [];
  const seeds = [];
  const corner = [];
  const index = [];
  for (let i = 0; i < count; i++) {
    const p = [min[0] + rand() * size[0], min[1] + rand() * size[1], min[2] + rand() * size[2]];
    const s = [rand(), 0.3 + rand() * 0.7, rand()];
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
  const uniforms = {
    uTravel: { value: 0 }, uLen: { value: 0 }, uAmount: { value: 0 }, uShare: { value: 1 }, uRef: { value: ref }, uColor: { value: INK.clone() },
    uMin: { value: new THREE.Vector3(...min) }, uSize: { value: new THREE.Vector3(...size) }, uView: { value: VIEWPORT },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uTravel, uLen, uAmount, uShare, uRef; uniform vec3 uMin, uSize; uniform vec2 uView;
        attribute vec3 aSeed; attribute vec2 aCorner; varying float vA; varying float vSide;
        void main() {
          float k = 0.6 + 0.4 * aSeed.x; // not all at one speed: that is the depth of the air
          vec3 p = position;
          p.y -= uTravel * k;
          p = uMin + mod(p - uMin, uSize);
          vec3 q = (p - uMin) / uSize;
          float inside = smoothstep(0.0, 0.12, q.x) * smoothstep(1.0, 0.88, q.x) * smoothstep(0.0, 0.1, q.y) * smoothstep(1.0, 0.9, q.y) * smoothstep(0.0, 0.12, q.z) * smoothstep(1.0, 0.88, q.z);
          vec4 a = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(p + vec3(0.0, uLen * k, 0.0), 1.0);
          vSide = aCorner.y;
          vA = 0.0;
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (aSeed.z < uShare && a.w > 40.0 && b.w > 40.0) {
            vec2 run = (b.xy / b.w - a.xy / a.w) * uView * 0.5;
            float l = length(run);
            vec2 n = l > 1e-3 ? vec2(-run.y, run.x) / l : vec2(0.0, 1.0);
            vec4 c = mix(a, b, aCorner.x);
            c.xy += n * aCorner.y * (3.0 / uView) * c.w;
            gl_Position = c;
            // (close to the lens a streak would be a slab: not drawn there; behind the header it melts into the black)
            float header = 1.0 - 0.7 * smoothstep(0.45, 0.62, c.y / c.w);
            float far = 1.0 - smoothstep(5000.0, 9000.0, length(cameraPosition));
            vA = aSeed.y * inside * uAmount * (1.0 - aCorner.x) * smoothstep(8.0, 60.0, l) * clamp(uRef / c.w, 0.2, 1.0) * smoothstep(150.0, 600.0, min(a.w, b.w)) * header * far;
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA; varying float vSide;
        void main() { gl_FragColor = vec4(uColor * vA * (1.0 - abs(vSide)), 1.0); }`,
    }),
  );
  mesh.frustumCulled = false;
  return { mesh, uniforms, len };
}

/* ───────────────────────────────────────────────────────────── the window at 225 m */

function makeGate() {
  const uniforms = { uColor: { value: VEILLE.clone() }, uAmount: { value: 0 }, uBreath: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy * 0.01; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uBreath; varying vec2 vP;
      float line(float dist, float wt, float fp) {
        float w = max(wt, 1.5 * fp);
        return (1.0 - smoothstep(0.5 * w, 0.5 * w + fp, dist)) * (wt / w);
      }
      // one family of grid lines each way, each leaving before its cells get smaller than a few pixels (per axis:
      // seen grazing, the lines that run away go first)
      float grid(vec2 p, vec2 fw, float cell, float wt) {
        vec2 dd = abs(fract(p / cell - 0.5) - 0.5) * cell;
        // (seen from a few metres, a line never gets wider than three pixels: a grid, not green bands)
        float lx = line(dd.x, min(wt, 3.0 * fw.x), fw.x) * smoothstep(5.0, 14.0, cell / fw.x);
        float ly = line(dd.y, min(wt, 3.0 * fw.y), fw.y) * smoothstep(5.0, 14.0, cell / fw.y);
        return max(lx, ly);
      }
      void main() {
        vec2 fw = max(fwidth(vP), vec2(1e-4));
        float fp = max(fw.x, fw.y);
        float r = length(vP);
        float R = ${(GATE.r / 100).toFixed(1)};
        float inside = 1.0 - smoothstep(R - 1.0, R + 1.0, r);
        float under = exp(-r / 140.0); // brighter under you
        float g = max(grid(vP, fw, 12.0, 0.35) * 0.2, grid(vP, fw, 60.0, 0.8) * 0.36);
        float v = inside * (0.012 + 0.03 * under + g * (0.75 + 0.6 * under) * uBreath + 0.12 * exp(-(R - r) / 35.0))
          + line(abs(R - r), 3.0, fp) * 1.1;
        gl_FragColor = vec4(uColor * v * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(GATE.r * 1.01, 160), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 6;
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── near the ground: the landing field */

/** Separate segments drawn in screen pixels, each end its own brightness (a far tuft is dimmer, a blade's tip too). */
function segs(list, mat) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(list.pos);
  geo.setColors(list.col);
  const line = new LineSegments2(geo, mat);
  line.frustumCulled = false;
  line.renderOrder = 3;
  return line;
}

function makeField() {
  const rand = rng(3711);
  const ground = new THREE.Group(); // on the ground plane, at the origin's foot
  ground.name = "landing-field";
  const grass = { pos: [], col: [] };
  const hedge = { pos: [], col: [] };
  const fence = { pos: [], col: [] };
  const put = (list, a, b, ka, kb) => {
    list.pos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    list.col.push(ka, ka, ka, kb, kb, kb);
  };

  // ── the morning grass: tufts of blades arching out (026's steppe grass), short where the cameras look at the rig
  const tuft = (x, z, k, tall) => {
    const n = 7 + Math.floor(rand() * 6);
    for (let i = 0; i < n; i++) {
      const phi = rand() * TAU;
      const spread = rand();
      let th = (5 + 34 * spread * spread) * DEG;
      const droop = (6 + rand() * 12) * DEG;
      const len = (tall * (0.55 + 0.45 * rand())) / 3;
      let p = [x + Math.cos(phi) * 2 * spread, 0.4, z + Math.sin(phi) * 2 * spread];
      for (let s = 0; s < 3; s++) {
        const q = [p[0] + Math.cos(phi) * Math.sin(th) * len, p[1] + Math.cos(th) * len, p[2] + Math.sin(phi) * Math.sin(th) * len];
        put(grass, p, q, k * (1 - 0.2 * s), k * (1 - 0.2 * (s + 1)));
        p = q;
        th += droop;
      }
    }
  };
  for (let i = 0; i < 420; i++) {
    const r = 70 + 3000 * Math.pow(rand(), 1.7);
    const a = rand() * TAU;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    const az = Math.atan2(x, z) / DEG; // the cameras stand between az −80 and 0
    const lane = az > -85 && az < 5 && r < 450;
    const tall = lane ? 4 + rand() * 5 : r < 300 ? 8 + rand() * 8 : 14 + rand() * 22;
    tuft(x, z, (0.3 + 0.3 * rand()) * (1 - 0.75 * smooth(400, 3000, r)), tall);
  }
  // the grass margin along the hedge: taller, denser
  for (let i = 0; i < 160; i++) tuft(HEDGE.fence - 700 + rand() * 900, HEDGE.z[0] + rand() * (HEDGE.z[1] - HEDGE.z[0]), 0.45 + 0.35 * rand(), 26 + rand() * 30);

  // ── the hedge: bushes of forked twigs every ≈ 1.4 m, and two trees standing out of it
  const twig = (list, a, phi, th, len, k, depth) => {
    const b = [a[0] + Math.cos(phi) * Math.sin(th) * len, a[1] + Math.cos(th) * len, a[2] + Math.sin(phi) * Math.sin(th) * len];
    put(list, a, b, k, k * 0.85);
    if (depth <= 0) return;
    const n = depth > 2 ? 3 : 2;
    for (let i = 0; i < n; i++) twig(list, b, phi + (rand() - 0.5) * 1.6, Math.max(0.05, th + (rand() - 0.4) * 0.7), len * (0.55 + 0.2 * rand()), k * 0.85, depth - 1);
  };
  for (let z = HEDGE.z[0]; z < HEDGE.z[1]; z += 120 + rand() * 50) {
    const x = HEDGE.x + (rand() - 0.5) * 60;
    const k = 0.55 + 0.3 * rand();
    const tall = 150 + rand() * 120;
    for (let i = 0; i < 5; i++) twig(hedge, [x + (rand() - 0.5) * 40, 0, z + (rand() - 0.5) * 40], rand() * TAU, (8 + rand() * 30) * DEG, tall * 0.45, k, 2);
  }
  for (const [x, z, tall] of [[HEDGE.x + 60, -2300, 980], [HEDGE.x + 40, 3400, 820]]) {
    put(hedge, [x, 0, z], [x, tall * 0.4, z], 0.8, 0.75);
    for (let i = 0; i < 4; i++) twig(hedge, [x, tall * 0.4, z], (i / 4) * TAU + rand(), (18 + rand() * 22) * DEG, tall * 0.3, 0.72, 4);
  }

  // ── the fence: posts every 3.5 m, three wires
  const posts = [];
  for (let z = HEDGE.z[0]; z <= HEDGE.z[1]; z += 350) {
    const x = HEDGE.fence + (rand() - 0.5) * 10;
    posts.push([x, z]);
    put(fence, [x, 0, z], [x, 125, z], 0.75, 0.75);
  }
  for (const y of [50, 85, 118]) for (let i = 1; i < posts.length; i++) put(fence, [posts[i - 1][0], y, posts[i - 1][1]], [posts[i][0], y, posts[i][1]], 0.55, 0.55);

  const mats = [
    [lineMat(BRAND.ink, 1.8, { opacity: 0.5, vertexColors: true }), 0.5],
    [lineMat(BRAND.ink, 1.8, { opacity: 0.42, vertexColors: true }), 0.42],
    [lineMat(BRAND.ink, 2.0, { opacity: 0.5, vertexColors: true }), 0.5],
  ];
  ground.add(segs(grass, mats[0][0]), segs(hedge, mats[1][0]), segs(fence, mats[2][0]));

  // a soft contact under the rig once it lies on the grass
  const contact = makeContact({ amount: 0 });
  contact.scale.set(70, 100, 1);
  contact.position.set(0, 0.3, -2);
  ground.add(contact);

  return {
    ground,
    update(alt) {
      const k = 1 - smooth(GROUND.near * 0.6, GROUND.near, alt);
      ground.visible = k > 0.002;
      for (let i = 0; i < mats.length; i++) mats[i][0].opacity = mats[i][1] * k;
      const down = 1 - smooth(0.2, 1.5, alt);
      contact.material.uniforms.uAmount.value = 0.5 * down;
      contact.visible = down > 0.01;
    },
  };
}

/* ───────────────────────────────────────────────────────────── the whole */

export function buildSky() {
  const group = new THREE.Group();
  group.name = "sky";

  const domeMaterial = domeMat();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), domeMaterial);
  dome.frustumCulled = false;
  dome.renderOrder = -50; // first: everything else is in front of it
  group.add(dome);

  // the air: close around you (short streaks), and further out (long ones)
  const streaks = [
    makeStreaks({ count: 150, seed: 37, min: [-1500, -1800, -1500], size: [3000, 3600, 3000], len: 6, ref: 1400 }),
    makeStreaks({ count: 200, seed: 73, min: [-6500, -7000, -6500], size: [13000, 14000, 13000], len: 20, ref: 6000 }),
  ];
  for (const s of streaks) group.add(s.mesh);

  const gate = makeGate();
  group.add(gate.mesh);

  const field = makeField();
  const A = { ground: new THREE.Group(), field: new THREE.Group() };
  A.ground.name = "ground";
  A.field.name = "field";
  A.ground.add(field.ground);
  group.add(A.ground, A.field);
  const dress = dressSky(); group.add(dress.group);

  return {
    group, A,
    update(p, time = 0) {
      const alt = Math.max(0, p.alt ?? ALT.first);
      const y = -alt * 100;
      const on = clamp01(p.sky ?? 1);
      const vz = Math.max(0, p.vz ?? 0);
      const threat = clamp01(p.threat ?? 0);
      const strata = clamp01(p.strata ?? 0);

      // the dome
      const u = domeMaterial.uniforms;
      u.uGround.value = y;
      u.uAmount.value = on;
      u.uRoad.value = smooth(0.05, 0.45, threat);
      u.uHedge.value = smooth(0.45, 0.95, threat);
      u.uHaze.value = threat;
      u.uStrata.value = strata;
      u.uDim.value = strata;
      u.uPool.value = 1 - smooth(0.5, 6, alt);
      dome.visible = on > 0.002;

      // the air: its length the speed, its travel the altitude
      const amount = smooth(0.5, 25, vz) * 0.5 * on;
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        s.uniforms.uTravel.value = alt * 100;
        s.uniforms.uLen.value = -vz * s.len;
        s.uniforms.uAmount.value = amount;
        s.mesh.visible = amount > 0.002;
      }

      // the window: 225 m above the ground, breathing slowly
      const g = clamp01(p.gate ?? 0) * on;
      gate.mesh.position.y = y + ALT.gate * 100;
      gate.uniforms.uAmount.value = g;
      gate.uniforms.uBreath.value = 0.85 + 0.15 * Math.sin(time * 2.1);
      gate.mesh.visible = g > 0.002;

      // the ground under you, and the landing field near it
      A.ground.position.y = y;
      A.field.position.y = y;
      field.update(on > 0.002 ? alt : 1e9);
      dress.update(p, time);
    },
  };
}
