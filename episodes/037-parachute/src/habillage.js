// DOSSIER 037 — Le parachute de secours : THE DRESSING of the sky (docs/recette-decorateur.md). What a real fall over
// the countryside has and the bare sky does not, in two touches, never on you nor in front of you:
//   · a layer of fair-weather cumulus ≈ 1 km above the ground. From the hook you see it far below, between you and the
//     fields; at ≈ 55 m/s you fall through it a few seconds later (« à quatre secondes du sol »), its puffs rushing up
//     past the edges of the frame — the speed, without a word. Seen from under you (« tu tournes »), it is the sky.
//   · their shadows on the countryside: dark patches lying on the squares, offset by the sun. Cloud above, shadow
//     below, parallax between them: the ground is a real ground, a kilometre down.
// X-ray like the rest: the puffs are faint ink glass (a thin fill, a brighter soft rim), the shadows only darken.
// NOTHING FOLLOWS THE CLOCK: everything is placed by `alt` (the ground's plane, −alt · 100) — the last frame is the
// first frame. Both fade around YOU: a cone from the camera to your body (and to the canopy once you hang under it)
// where nothing is drawn, so your silhouette always stands on the bare countryside or the bare sky.
//
//   dressSky() → { group, update(p, time) }   (ciel.js adds `group` to its own, at the origin, never turned)
//   p, the world's state (plain numbers, read only): alt (the ground), sky (0 on the bench), strata (the principle's
//   pressure layers want the air to themselves), hang (the canopy above you widens the clear cone)
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";

const INK = new THREE.Color(BRAND.ink);
const DEG = Math.PI / 180;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/** OFF (04/11, decorator's planche, 24 images read): at 270 px the puffs read as flat pebbles, not cumulus, and the
 *  hook frame gains nothing (one puff, under the header). Turned on again only after the rework the journal describes
 *  (docs/journal/037-habillage.md) and a planche where image 0 is at least as strong as without. */
export const ENABLED = { puffs: false, shadows: false };
/** The cloud layer: heights above the ground (m), how far it spreads around your fall (m), the puffs' widths (m). */
const LAYER = { base: 950, top: 1150, r: [55, 1000], w: [60, 150], count: 70 };
/** The sun, for the shadows: where it stands (azimuth) and how high (elevation), degrees. */
const SUN = { az: 210, el: 55 };
/** The clear cone around you: your body's reach (cm) — your middle in the scene — and, hanging, the canopy's. */
const CLEAR = { body: [0, -10, 0], r: 100, canopy: [0, 330, 0], rc: 480 };

// one cumulus, in its quad's coordinates (q in −1…1): seven round heaps and six small ones on their edges, from a seed
const CLOUD_GLSL = /* glsl */ `
  float h1(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
  float cloud(vec2 q, float s) {
    float f = 0.0;
    // its body: four heaps side by side on a flat base
    for (int i = 0; i < 4; i++) {
      float k = float(i);
      vec2 c = vec2(-0.42 + 0.28 * k + (h1(s + k * 1.7) - 0.5) * 0.12, -0.12 + h1(s + k * 3.1) * 0.12);
      float r = 0.2 + 0.1 * h1(s + k * 5.3);
      vec2 d = q - c;
      f += exp(-dot(d, d) / (r * r));
    }
    // the cauliflower: small heaps along its top and flanks
    for (int i = 0; i < 9; i++) {
      float k = float(i) + 7.0;
      float a = 0.15 + 2.85 * (float(i) + h1(s + k * 2.3) * 0.8) / 9.0;
      vec2 c = vec2(cos(a) * 0.5, sin(a) * 0.34 - 0.06);
      float r = 0.1 + 0.07 * h1(s + k * 4.1);
      vec2 d = q - c;
      f += 0.9 * exp(-dot(d, d) / (r * r));
    }
    return f * smoothstep(-0.4, -0.27, q.y); // a cumulus has a flat base
  }
  // nothing in the cone from the eye to you: v the fragment, b your middle (both in view space), r your reach (cm)
  float clearOf(vec3 v, vec3 b, float r) {
    float ang = acos(clamp(dot(normalize(v), normalize(b)), -1.0, 1.0));
    float R = atan(r / max(length(b), 1.0)) + 0.02;
    return smoothstep(R, R + 0.07, ang);
  }`;

function shared() {
  return {
    uGround: { value: 0 },
    uAmount: { value: 1 },
    uClear: { value: new THREE.Vector3(...CLEAR.body) },
    uClearR: { value: CLEAR.r },
  };
}

/** The puffs: camera-facing quads, one per cloud, their centres riding on the ground's plane. */
function makePuffs(clouds, u) {
  const n = clouds.length;
  const pos = new Float32Array(n * 4 * 3), corner = new Float32Array(n * 4 * 2), size = new Float32Array(n * 4 * 2), seed = new Float32Array(n * 4);
  const idx = [];
  const C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  clouds.forEach((c, i) => {
    for (let k = 0; k < 4; k++) {
      const v = i * 4 + k;
      pos.set([c.x, c.h, c.z], v * 3);
      corner.set(C[k], v * 2);
      size.set([c.w * 50, c.w * 50 * 0.62], v * 2); // half-sizes, cm: wider than tall
      seed[v] = c.seed;
    }
    idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aCorner", new THREE.BufferAttribute(corner, 2));
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 2));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  g.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...u, uColor: { value: INK.clone() } },
    transparent: true,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */ `
      uniform float uGround; uniform vec3 uClear;
      attribute vec2 aCorner; attribute vec2 aSize; attribute float aSeed;
      varying vec2 vQ; varying float vSeed; varying vec3 vView; varying vec3 vBody;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position.x, uGround + position.y, position.z, 1.0);
        mv.xy += aCorner * aSize;
        vQ = aCorner; vSeed = aSeed; vView = mv.xyz;
        vBody = (viewMatrix * vec4(uClear, 1.0)).xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uClearR;
      varying vec2 vQ; varying float vSeed; varying vec3 vView; varying vec3 vBody;
      ${CLOUD_GLSL}
      void main() {
        float f = cloud(vQ, vSeed);
        // X-ray glass: a fine bright outline, a fainter one inside (its heaps), a thin fill
        float fw = max(fwidth(f), 1e-4);
        float rim = 1.0 - smoothstep(1.0 * fw, 2.2 * fw, abs(f - 0.55));
        float inner = 1.0 - smoothstep(1.0 * fw, 2.0 * fw, abs(f - 1.25));
        float fill = smoothstep(0.55, 1.0, f);
        float d = length(vView);
        float a = (0.09 * fill + 0.36 * rim + 0.14 * inner) * uAmount * clearOf(vView, vBody, uClearR) * smoothstep(2500.0, 8000.0, d);
        if (a < 0.002) discard;
        gl_FragColor = vec4(uColor, a);
      }`,
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -30; // after the dome, before you: never drawn over your body
  return mesh;
}

/** Their shadows: flat patches on the ground, under each cloud pushed away from the sun. */
function makeShadows(clouds, u) {
  const n = clouds.length;
  const off = Math.cos(SUN.el * DEG) / Math.sin(SUN.el * DEG);
  const sx = -Math.sin(SUN.az * DEG), sz = -Math.cos(SUN.az * DEG); // away from the sun
  const pos = new Float32Array(n * 4 * 3), q = new Float32Array(n * 4 * 2), seed = new Float32Array(n * 4);
  const idx = [];
  const C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  clouds.forEach((c, i) => {
    const cx = c.x + sx * c.h * off, cz = c.z + sz * c.h * off;
    const hw = c.w * 50, hd = c.w * 50 * 0.75;
    for (let k = 0; k < 4; k++) {
      const v = i * 4 + k;
      // the patch's long side across the sun's direction
      const a = C[k][0] * hw, b = C[k][1] * hd;
      pos.set([cx + a * sz - b * sx, 0, cz - a * sx - b * sz], v * 3);
      q.set(C[k], v * 2);
      seed[v] = c.seed;
    }
    idx.push(i * 4, i * 4 + 2, i * 4 + 1, i * 4, i * 4 + 3, i * 4 + 2);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aQ", new THREE.BufferAttribute(q, 2));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  g.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...u },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
    vertexShader: /* glsl */ `
      uniform float uGround; uniform vec3 uClear;
      attribute vec2 aQ; attribute float aSeed;
      varying vec2 vQ; varying float vSeed; varying vec3 vView; varying vec3 vBody;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position.x, uGround + 40.0, position.z, 1.0);
        vQ = aQ; vSeed = aSeed; vView = mv.xyz;
        vBody = (viewMatrix * vec4(uClear, 1.0)).xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount, uClearR;
      varying vec2 vQ; varying float vSeed; varying vec3 vView; varying vec3 vBody;
      ${CLOUD_GLSL}
      void main() {
        float f = cloud(vQ, vSeed);
        float a = 0.4 * smoothstep(0.35, 1.0, f) * uAmount * clearOf(vView, vBody, uClearR);
        if (a < 0.002) discard;
        gl_FragColor = vec4(0.0, 0.0, 0.0, a);
      }`,
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -40;
  return mesh;
}

export function dressSky({ tone = 1 } = {}) {
  const rand = rng(1037);
  const clouds = [];
  for (let tries = 0; clouds.length < LAYER.count && tries < 2000; tries++) {
    const a = rand() * Math.PI * 2;
    const r = LAYER.r[0] + (LAYER.r[1] - LAYER.r[0]) * Math.sqrt(rand());
    const w = LAYER.w[0] + (LAYER.w[1] - LAYER.w[0]) * rand();
    const c = { x: Math.cos(a) * r * 100, z: Math.sin(a) * r * 100, h: (LAYER.base + (LAYER.top - LAYER.base) * rand()) * 100, w, seed: 3 + rand() * 40 };
    // fair weather: scattered, never piled into one sheet
    if (clouds.some((o) => Math.hypot(o.x - c.x, o.z - c.z) < (o.w + c.w) * 50 * 0.9)) continue;
    clouds.push(c);
  }
  const group = new THREE.Group();
  group.name = "habillage";
  const pu = shared(), su = shared();
  const puffs = makePuffs(clouds, pu);
  const shadows = makeShadows(clouds, su);
  group.add(shadows, puffs);

  return {
    group,
    update(p) {
      const alt = Math.max(0, p.alt ?? 1350);
      const on = clamp01(p.sky ?? 1) * (1 - clamp01(p.strata ?? 0)) * tone;
      const hang = clamp01(p.hang ?? 0);
      for (const u of [pu, su]) {
        u.uGround.value = -alt * 100;
        u.uClear.value.set(0, CLEAR.body[1] + (CLEAR.canopy[1] - CLEAR.body[1]) * hang, 0);
        u.uClearR.value = CLEAR.r + (CLEAR.rc - CLEAR.r) * hang;
      }
      pu.uAmount.value = on;
      su.uAmount.value = on * smooth(30, 150, alt); // on the field itself, no patch darkens the grass under the rig
      puffs.visible = ENABLED.puffs && on > 0.002;
      shadows.visible = ENABLED.shadows && su.uAmount.value > 0.002;
    },
  };
}
