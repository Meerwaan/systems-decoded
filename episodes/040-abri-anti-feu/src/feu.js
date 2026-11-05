// DOSSIER 040 — L'abri anti-feu : THE FIRE — the front, its smoke and embers, its light, and its RADIATION. Everything
// here is the threat, and the threat is signal.
//
//   buildFire() → { group, rays, light, A, update(p, time, px) }
//     group   the front, the far flank's line, the smoke, the embers: added to the crest set (world frame, plan.js)
//     rays    { group, update }: the TEN radiation rays and the lick, in the SHELTER's frame — world.js re-parents it
//             with the system (on your pad, or on the bench: the principe is shown on the bench, rays from off-frame −z)
//     light   a THREE.PointLight (signal) that follows the front: it lights the alu, the ground, the crews
//
//   p = {
//     front    metres: where the front's foot is, along z (0 at your feet · −200 the canyon floor · +40 gone past)
//     fire     0–1 the front's strength: flame height and brightness
//     lean     0 upright → 1 laid over by the wind toward +z (it « rabat » the flames on you, it rolls over the dome)
//     flank    0–1 the far flank's own line of fire, far below at +z (never joined to the front: no closed ring)
//     smoke    0–1 the smoke column over the front, lit from under
//     embers   0–1 embers flying with the wind toward +z (a few at the lens)
//     rays     0–1 the ten rays visible (from the front toward the dome)
//     bounce   0 they all go in · 1 nine bounce back off the foil toward the fire (« plus de 9 sur 10 »), veille
//     leak     0 the tenth ray stops at the foil · 1 it goes in and dies across the air gap before reaching you
//     lick     0–1 one tongue of flame plastered on the dome's corner (SHELTER.glue) — the chute's limit
//     bench    1 on the bench: the front, the smoke, the embers and the light hide; the rays stay
//   }
//
// THE RECIPE (012-gaziniere/src/fire.js, whose head says why): nothing is a hard cone, nothing is a veil, and nothing
// is ADDED in the flames — signal over signal goes past what the tone curve keeps orange and comes out salmon. So:
//   the flames  ribbons that face the eye, drawn « the brightest wins » (MaxEquation): a body of pure signal lit by
//               its thickness, a heart of pure ink at the foot, the tips eaten by noise that flows UP the tongue —
//               the wall is a mass cut out on the black, with dark holes and tongues, never a slab. Some tongues tear
//               off the wall and roll forward with the wind (the « rabat »): it moves by itself from frame 1.
//   the smoke   dark puffs laid over the picture (normal blending), lit from under in a dull signal. A column behind
//               the wall (drawn before the flames, which win over it) and a ceiling ahead of the tips (drawn after:
//               it eats the tips and keeps the top of the frame dark for the header).
//   the embers  streaks along their run (makeEmbers of L04-porte-avions/src/bord.js), periodic: alive from frame 1.
// No fuel on your pad: no tongue roots inside it (the bulldozer scraped it) — the front rolls OVER it.
// `update` writes uniforms and transforms only: it is called for every instant of the shutter.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { fatLine, anchor } from "@kit/build3d.js";
import { ridgeY, RIDGE, FIRE, RAYS, SHELTER, PAD } from "./plan.js";

const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const HOT = new THREE.Color(1, 0.42, 0.16); // the hottest an ember gets: still signal, never cream
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const n = (x) => Number(x).toFixed(4);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ── GLSL shared: the ridge's height (the same pure function as plan.js) and a value noise ── */
const RIDGE_GLSL = /* glsl */ `
  float ridgeY(float x, float z) {
    float a = abs(z) - ${n(RIDGE.flat)};
    float fl = z < 0.0 ? ${n(RIDGE.floorMinus)} : ${n(RIDGE.floorPlus)};
    float drop = a <= 0.0 ? 0.0 : max(fl, -${n(RIDGE.slope)} * a - a * a / 90000.0);
    float along = -0.012 * max(0.0, abs(x) - 9000.0);
    float wob = 60.0 * sin(x / 2300.0) + 40.0 * sin(x / 870.0 + 1.2) * clamp(a / 2000.0, 0.0, 1.0);
    return drop + along + wob * (a > 0.0 ? 1.0 : 0.15);
  }`;
const NOISE_GLSL = /* glsl */ `
  float hash2(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 q = fract(p); q = q * q * (3.0 - 2.0 * q);
    return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), q.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), q.x), q.y);
  }`;

/* ───────────────────────────────────────────────────────────── 1 · the tongues */

/** Kinds of tongue: 0 the foot (short, dense, white heart) · 1 the body · 2 the tall ones · 3 torn off, rolling. */
function tongueGeometry(list) {
  const geo = new THREE.InstancedBufferGeometry();
  const ROWS = 16;
  const pos = [];
  const idx = [];
  for (let j = 0; j <= ROWS; j++) pos.push(-1, j / ROWS, 0, 1, j / ROWS, 0);
  for (let j = 0; j < ROWS; j++) idx.push(2 * j, 2 * j + 1, 2 * j + 3, 2 * j, 2 * j + 3, 2 * j + 2);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const root = new Float32Array(list.length * 3);
  const size = new Float32Array(list.length * 4);
  list.forEach((t, i) => {
    root.set([t.x, t.dz, t.kind], i * 3);
    size.set([t.len, t.wid, t.s1, t.s2], i * 4);
  });
  geo.setAttribute("aRoot", new THREE.InstancedBufferAttribute(root, 3));
  geo.setAttribute("aSize", new THREE.InstancedBufferAttribute(size, 4));
  geo.instanceCount = list.length;
  return geo;
}

/** One material per set of tongues (each its own uniforms: the front, the flank, the lick). */
function tongueMat({ gain = 1.2, heart = 1.25, fade = [0.55, 1.02], ground = 1, pad = null, near = [320, 950] } = {}) {
  const P = pad ?? [1e7, 1e7, 1e7 + 1, 1e7 + 1];
  const uniforms = {
    uTime: { value: 0 }, uFrontZ: { value: 0 }, uFire: { value: 1 }, uLean: { value: 0 },
    uUp: { value: new THREE.Vector3(0, 1, 0) }, uWind: { value: new THREE.Vector3(0, 0, 1) },
    uOrigin: { value: new THREE.Vector3() }, uGround: { value: ground }, uPad: { value: new THREE.Vector4(...P) },
    uHue: { value: SIGNAL.clone() }, uCore: { value: INK.clone() }, uGain: { value: gain }, uHeart: { value: heart },
    uFade: { value: new THREE.Vector2(...fade) }, uNear: { value: new THREE.Vector2(...near) },
  };
  const make = (depthPass) => new THREE.ShaderMaterial({
    uniforms,
    defines: depthPass ? { DEPTH_PASS: "" } : {},
    transparent: true,
    depthWrite: depthPass,
    colorWrite: !depthPass,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    vertexShader: /* glsl */ `
      ${RIDGE_GLSL}
      uniform float uTime, uFrontZ, uFire, uLean, uGround; uniform vec3 uUp, uWind, uOrigin; uniform vec4 uPad; uniform vec2 uNear;
      attribute vec3 aRoot; attribute vec4 aSize;
      varying vec2 vUV; varying vec4 vK;
      vec3 dirAt(float a) { return uUp * cos(a) + uWind * sin(a); }
      void main() {
        float s = position.y;
        float u = position.x;
        float kind = aRoot.z;
        float ph = aSize.z * 6.2832;
        vec3 foot = uOrigin + vec3(aRoot.x, 0.0, uFrontZ + aRoot.y);
        if (uGround > 0.5) foot.y = ridgeY(foot.x, foot.z) - 25.0;
        // no fuel on the scraped pad: nothing roots there
        vec2 out2 = max(vec2(0.0), max(uPad.xy - foot.xz, foot.xz - uPad.zw));
        float fuel = smoothstep(0.0, 180.0, length(out2));
        // every tongue breathes on its own slow clock
        float breath = 1.0 + 0.11 * sin(uTime * 1.7 + ph) + 0.07 * sin(uTime * 2.9 + aSize.w * 6.2832);
        float L = aSize.x * uFire * breath * fuel;
        float W = aSize.y * mix(0.55, 1.0, uFire);
        // the wind lays it over: the root less, the tip more
        float sway = 0.10 * sin(uTime * 1.1 + ph) + 0.05 * sin(uTime * 2.3 + aSize.w * 20.0);
        float tipA = uLean * 1.40 + sway;
        float rootA = uLean * 0.80 + 0.5 * sway;
        vec3 base = foot;
        float fade = 1.0;
        if (kind > 2.5) {
          // torn off the wall: a parcel of flame that rolls forward with the wind, sinking, and burns out
          float life = fract(aSize.z * 3.17 + uTime * (0.20 + 0.12 * aSize.w));
          float hgt = mix(mix(0.42, 0.24, uLean), mix(0.36, 0.08, uLean), life);
          base = foot + uUp * (aSize.x * uFire * hgt) + uWind * (aSize.x * uFire * (0.08 + 1.25 * life * (0.3 + uLean)));
          L *= 0.5 * (1.0 - 0.55 * life);
          W *= 0.9 - 0.3 * life;
          fade = smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.55, 1.0, life));
          tipA = uLean * 1.48 + sway;
          rootA = uLean * 1.2;
        }
        vec3 p1 = base + dirAt(rootA) * (0.5 * L);
        vec3 p2 = p1 + dirAt(tipA) * (0.5 * L);
        vec3 P = (1.0 - s) * (1.0 - s) * base + 2.0 * (1.0 - s) * s * p1 + s * s * p2;
        vec3 T = 2.0 * (1.0 - s) * (p1 - base) + 2.0 * s * (p2 - p1);
        vec3 lat = normalize(cross(uUp, uWind));
        P += lat * (0.07 * L * s * s * sin(uTime * 1.3 + ph + s * 3.0));
        // a drop: narrow at its root, full a quarter of the way, a rounded point
        float prof = mix(0.55, 1.0, smoothstep(0.0, 0.25, s)) * pow(clamp(1.0 - s * s * s, 0.0, 1.0), 0.6);
        vec4 wp = modelMatrix * vec4(P, 1.0);
        vec3 wt = mat3(modelMatrix) * T;
        vec3 side = cross(wt, cameraPosition - wp.xyz);
        side /= max(length(side), 1e-4);
        wp.xyz += side * (u * W * prof);
        vUV = vec2(u, s);
        // nothing burns in the lens: what passes over the camera dies away before it fills the frame
        float near = smoothstep(uNear.x, uNear.y, length(cameraPosition - wp.xyz));
        vK = vec4(aSize.z, aSize.w, kind, fade * near * smoothstep(0.0, 30.0, L));
        gl_Position = L < 2.0 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      ${NOISE_GLSL}
      uniform float uTime, uGain, uHeart; uniform vec3 uHue, uCore; uniform vec2 uFade;
      varying vec2 vUV; varying vec4 vK;
      void main() {
        float u = vUV.x, s = vUV.y;
        float sd = vK.x * 17.0;
        // noise that flows UP the tongue: the licks travel, the holes open and close
        float n1 = vnoise(vec2(u * 1.5 + sd, s * 2.6 - uTime * 1.25 + sd * 0.7));
        float n2 = vnoise(vec2(u * 3.4 - sd, s * 6.0 - uTime * 2.2 + sd));
        float nn = 0.62 * n1 + 0.38 * n2;
        float edge = 1.0 - abs(u);
        float shape = smoothstep(0.03, 0.24, edge - (0.2 + 0.9 * s) * nn);
        // dark holes that open and close as they travel up (never at the very root)
        float hole = smoothstep(0.52, 0.68, vnoise(vec2(u * 2.2 + sd * 3.0, s * 4.2 - uTime * 1.6))) * smoothstep(0.1, 0.32, s);
        shape *= 1.0 - 0.9 * hole;
        float along = smoothstep(0.0, 0.05, s) * (1.0 - smoothstep(uFade.x, uFade.y, s + 0.38 * (nn - 0.5)));
        // lit by its thickness: the most through its middle, nothing at its outline
        float body = sqrt(clamp(1.0 - u * u, 0.0, 1.0));
        float I = shape * along * body * vK.w;
        vec3 c = uHue * (I * uGain * mix(1.12, 0.45, s));
        // the white heart at the foot (pure ink: never mixed with the signal, the brightest wins)
        float hk = vK.z < 0.5 ? 1.0 : (vK.z < 1.5 ? 0.55 : 0.0);
        float heart = hk * (1.0 - smoothstep(0.03, 0.3, s + 0.22 * nn)) * smoothstep(0.42, 0.85, edge - 0.25 * nn) * vK.w;
        vec3 o = max(c, uCore * (heart * uHeart));
        #ifdef DEPTH_PASS
        if (max(o.r, max(o.g, o.b)) < 0.32) discard; // only the bright body hides what is behind it
        #endif
        gl_FragColor = vec4(o, 1.0);
      }`,
  });
  // two passes over the same tongues: the colour (« the brightest wins », no depth), then the depth of the bright body
  // alone — so the smoke laid over the picture afterwards hides behind the flames instead of veiling them
  return { material: make(false), depth: make(true), uniforms };
}

/** The front's tongues, across the whole crest (denser near your pad: that is where the camera goes close). */
function frontTongues(rand) {
  const list = [];
  const W = FIRE.width / 2;
  const D = FIRE.depth;
  const H = FIRE.height;
  const spread = (k) => Math.sign(k) * Math.pow(Math.abs(k), 1.35) * W; // k in −1…1 → x, a little denser at 0
  const row = (count, kind, dz0, dz1, len0, len1, wid0, wid1) => {
    for (let i = 0; i < count; i++) {
      const k = ((i + 0.2 + 0.6 * rand()) / count) * 2 - 1;
      list.push({ x: spread(k), dz: dz0 + (dz1 - dz0) * rand(), kind, len: len0 + (len1 - len0) * rand(), wid: wid0 + (wid1 - wid0) * rand(), s1: rand(), s2: rand() });
    }
  };
  // (`wid` is the HALF-width: neighbours barely overlap, or « the brightest wins » fills every gap into a slab)
  row(270, 0, -0.3 * D, 0, 0.08 * H, 0.22 * H, 50, 90); //        the foot: short, dense, white-hot
  row(150, 1, -0.8 * D, -0.1 * D, 0.45 * H, 0.9 * H, 80, 150); //  the body
  row(70, 2, -0.6 * D, -0.15 * D, 0.85 * H, 1.2 * H, 60, 100); //  the tall tongues
  row(140, 3, -0.5 * D, 0, 0.55 * H, 0.95 * H, 70, 130); //        torn off, rolling forward
  return list;
}

/** The far flank's own low line: short tongues, never joined to the front. */
function flankTongues(rand) {
  const list = [];
  for (let i = 0; i < 240; i++) {
    const x = ((i + rand()) / 240 - 0.5) * FIRE.width * 0.55;
    const kind = rand() < 0.5 ? 0 : 1;
    list.push({ x, dz: (rand() - 0.5) * 500, kind, len: 260 + 420 * rand(), wid: 160 + 160 * rand(), s1: rand(), s2: rand() });
  }
  return list;
}

/* ───────────────────────────────────────────────────────────── 2 · the smoke */

function smokeMesh(rand, { count, dz, rise, size, order, glow, base = [0.028, 0.024, 0.022] }) {
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const puff = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const k = rand() * 2 - 1;
    puff.set([Math.sign(k) * Math.pow(Math.abs(k), 1.5) * FIRE.width * 0.5, dz[0] + (dz[1] - dz[0]) * rand(), rand(), size[0] + (size[1] - size[0]) * rand()], i * 4);
  }
  geo.setAttribute("aPuff", new THREE.InstancedBufferAttribute(puff, 4));
  geo.instanceCount = count;
  const uniforms = {
    uTime: { value: 0 }, uFrontZ: { value: 0 }, uFootY: { value: 0 }, uSmoke: { value: 0 }, uLean: { value: 0 }, uFire: { value: 1 },
    uRise: { value: new THREE.Vector2(...rise) }, uHue: { value: SIGNAL.clone() }, uGlow: { value: glow }, uBase: { value: new THREE.Vector3(...base) },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uTime, uFrontZ, uFootY, uSmoke, uLean, uFire; uniform vec2 uRise;
        attribute vec4 aPuff; varying vec2 vQ; varying vec3 vS;
        void main() {
          float sd = aPuff.z;
          float life = fract(sd * 7.31 + uTime * (0.035 + 0.025 * fract(sd * 13.7)));
          float H = ${n(FIRE.height)} * mix(0.6, 1.0, uFire);
          vec3 c = vec3(aPuff.x + 400.0 * sin(uTime * 0.21 + sd * 30.0) * life,
                        uFootY + H * (uRise.x + uRise.y * life),
                        uFrontZ + aPuff.y + life * mix(600.0, 5200.0, uLean));
          float R = aPuff.w * (0.55 + 1.25 * life);
          float a = sd * 6.2832 + uTime * 0.08 * (fract(sd * 5.1) - 0.5);
          vec2 q = mat2(cos(a), sin(a), -sin(a), cos(a)) * position.xy;
          vec4 mv = modelViewMatrix * vec4(c, 1.0);
          mv.xy += q * R;
          gl_Position = projectionMatrix * mv;
          vQ = position.xy;
          // x: how much there is · y: how lit from under (the young puffs, just over the flames) · z: seed
          vS = vec3(uSmoke * smoothstep(0.0, 0.16, life) * (1.0 - smoothstep(0.68, 1.0, life)), (1.0 - smoothstep(0.0, 0.5, life)) * uFire, sd);
        }`,
      fragmentShader: /* glsl */ `
        ${NOISE_GLSL}
        uniform vec3 uHue, uBase; uniform float uTime, uGlow; varying vec2 vQ; varying vec3 vS;
        void main() {
          float r = length(vQ);
          float nn = 0.6 * vnoise(vQ * 2.1 + vec2(vS.z * 31.0, uTime * 0.05)) + 0.4 * vnoise(vQ * 4.3 - vec2(vS.z * 17.0, 0.0));
          float a = (1.0 - smoothstep(0.25, 1.0, r + 0.5 * (nn - 0.5))) * vS.x * 0.86;
          float under = clamp(0.35 - 0.75 * vQ.y, 0.0, 1.0);
          vec3 col = mix(uBase, uHue * 0.26, under * vS.y * uGlow * (0.6 + 0.4 * nn));
          gl_FragColor = vec4(col, a);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── 3 · the embers (after L04's makeEmbers) */

function makeEmbers(rand, count, lens) {
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const all = count + lens;
  const pos = new Float32Array(all * 3);
  const info = new Float32Array(all * 4);
  for (let i = 0; i < all; i++) {
    const toLens = i >= count;
    const k = rand() * 2 - 1;
    const x = toLens ? (rand() - 0.5) * 900 : Math.sign(k) * Math.pow(Math.abs(k), 1.8) * FIRE.width * 0.3;
    pos.set([x, -FIRE.depth * 0.4 * rand(), 60 + rand() * FIRE.height * 0.45], i * 3);
    info.set([rand(), toLens ? 0.38 + 0.2 * rand() : 0.22 + 0.22 * rand(), toLens ? 1 : 0, (rand() - 0.5) * 2], i * 4);
  }
  geo.setAttribute("aPos", new THREE.InstancedBufferAttribute(pos, 3));
  geo.setAttribute("aInfo", new THREE.InstancedBufferAttribute(info, 4));
  geo.instanceCount = all;
  const uniforms = { uAmount: { value: 0 }, uTime: { value: 0 }, uFrontZ: { value: 0 }, uFootY: { value: 0 }, uLean: { value: 0 }, uRes: { value: RES }, uColor: { value: HOT.clone().multiplyScalar(2.0) } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uAmount, uTime, uFrontZ, uFootY, uLean; uniform vec2 uRes; attribute vec3 aPos; attribute vec4 aInfo;
        varying vec2 vQ; varying float vA;
        void main() {
          float sd = aInfo.x;
          float life = fract(sd + uTime * aInfo.y);
          vec3 start = vec3(aPos.x, uFootY + aPos.z, uFrontZ + aPos.y);
          vec3 c, way;
          float k = 1.0;
          if (aInfo.z > 0.5) {
            // at the lens: from the wall to just beside the camera, which it passes
            vec3 cam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
            vec3 aim = cam + vec3(aInfo.w * 150.0, -60.0 + 140.0 * fract(sd * 9.0), -40.0);
            way = aim - start;
            c = start + way * (life * 0.97) + vec3(0.0, 180.0 * sin(life * 3.1416), 0.0);
            k = (1.0 - smoothstep(2600.0, 5200.0, length(way))) * smoothstep(0.0, 0.08, life) * (1.0 - smoothstep(0.86, 0.97, life));
          } else {
            float run = mix(900.0, 3600.0, uLean) * (0.6 + 0.8 * fract(sd * 5.3));
            float up = 1000.0 * (0.6 + fract(sd * 3.1));
            c = start + vec3(220.0 * sin(uTime * 1.3 + sd * 40.0) * life, up * life * (1.0 - 0.45 * life), run * life);
            way = vec3(0.0, up * (1.0 - 0.9 * life), run);
            k = pow(1.0 - life, 1.2) * smoothstep(0.0, 0.08, life);
          }
          way /= max(length(way), 1e-3);
          float h = 14.0 + 12.0 * fract(sd * 7.7);
          vec4 a = projectionMatrix * modelViewMatrix * vec4(c - way * h, 1.0);
          vec4 b = projectionMatrix * modelViewMatrix * vec4(c + way * h, 1.0);
          vQ = position.xy;
          vA = uAmount * k;
          if (a.w < 5.0 || b.w < 5.0 || vA < 0.003) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          vec2 run2 = (b.xy / b.w - a.xy / a.w) * uRes;
          float len = length(run2);
          run2 = len > 1e-4 ? run2 / len : vec2(1.0, 0.0);
          vec4 p = position.x < 0.0 ? a : b;
          // ≈ 3.4 px wide, wider when it passes close (never a hair at 270 px)
          float wpx = 3.4 * clamp(900.0 / p.w, 1.0, 3.0);
          p.xy += vec2(-run2.y, run2.x) * position.y * (wpx / uRes) * p.w;
          gl_Position = p;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying vec2 vQ; varying float vA;
        void main() {
          float a = (1.0 - vQ.y * vQ.y) * pow(clamp(1.0 - abs(vQ.x), 0.0, 1.0), 1.1);
          gl_FragColor = vec4(uColor * a * vA, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 9;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── 4 · the rays (in the shelter's frame) */

/** The dome the rays strike: model.js's surface on its crest line (x ≈ 0) — y = h · (1 − (z/L)⁴)^¼, a low tunnel
 *  whose fire END is a near-vertical rounded wall: the rays strike that end, which faces the fire and sends them back. */
const DOME = { a: SHELTER.w / 2, b: SHELTER.h, c: SHELTER.len / 2 };
const endAt = (t) => new THREE.Vector3(0, DOME.b * Math.pow(Math.max(0, 1 - t ** 4), 0.25), -DOME.c * t);
const endNormal = (p) => new THREE.Vector3(0, p.y ** 3 / DOME.b ** 4, p.z ** 3 / DOME.c ** 4).normalize();
const LEAK = 5; // the tenth ray, the one that goes in: it strikes on the section's outline (x ≈ 0)

function buildRays() {
  const group = new THREE.Group();
  group.name = "rayons";
  const Z = new THREE.Vector3(0, 0, 1);
  // ten strike points along the fire-side quarter of the dome, near its crest line (the section shows them on its outline)
  const hits = [];
  for (let i = 0; i < RAYS.n; i++) {
    // on the END that faces the fire (a face that looks at −z sends the rays back to it, not over the top), 8 → 30 cm up
    const p = endAt(0.999 - (0.05 * i) / (RAYS.n - 1));
    p.x = i === LEAK ? -0.6 : 1.5 + (i % 3) * 1.2; // the tenth just in front of the cut: it shows on the section's face
    hits.push(p);
  }
  const centre = hits.reduce((s, h) => s.add(h), new THREE.Vector3()).multiplyScalar(1 / hits.length);
  const from = new THREE.Vector3(...RAYS.from);
  const D = from.clone().sub(centre).normalize(); // toward the fire: the rays come in parallel along −D
  const dist = from.distanceTo(centre);
  const PERP = new THREE.Vector3(0, -D.z, D.y).normalize(); // across the rays, in the section's plane
  const holder = (at, dir) => {
    const o = new THREE.Object3D();
    o.position.copy(at);
    o.quaternion.setFromUnitVectors(Z, dir);
    group.add(o);
    return o;
  };
  const coreIn = { color: BRAND.signal, width: 8, opacity: 0, hdr: 1.8 };
  const dashIn = { color: BRAND.signal, width: 11, opacity: 0, hdr: 2.4, dashed: true, dashSize: 0.07, gapSize: 0.13 };
  const coreBack = { color: BRAND.veille, width: 5, opacity: 0, hdr: 1.15 };
  const dashBack = { color: BRAND.veille, width: 7.5, opacity: 0, hdr: 1.7, dashed: true, dashSize: 0.09, gapSize: 0.16 };
  const unit = [[0, 0, 0], [0, 0, 1]];
  const R = hits.map((hit, i) => {
    // from a wall, not a point: the sources spread across `RAYS.spread`, the rays converge on the end of the dome
    const src = hit.clone().addScaledVector(D, dist).addScaledVector(PERP, ((i % 2 ? i : RAYS.n - 1 - i) / (RAYS.n - 1) - 0.5) * RAYS.spread);
    const din = hit.clone().sub(src).normalize();
    const inH = holder(src, din);
    const a = fatLine(unit, coreIn);
    const ad = fatLine(unit, dashIn);
    inH.add(a, ad);
    // the normal of the ellipsoid, and the ray it sends back
    const nrm = endNormal(hit);
    const out = din.clone().addScaledVector(nrm, -2 * din.dot(nrm)).normalize();
    let backH = null, b = null, bd = null;
    if (i !== LEAK) {
      backH = holder(hit, out);
      b = fatLine(unit, coreBack);
      bd = fatLine(unit, dashBack);
      backH.add(b, bd);
    }
    return { din, inH, a, ad, backH, b, bd, len: src.distanceTo(hit), back: dist * (0.42 + 0.06 * (i % 3)) };
  });
  // the tenth: through the foil and the silica, paler across the air gap, dead before the inner layers
  const leakHit = hits[LEAK];
  const leakH = holder(leakHit, R[LEAK].din);
  const leakLine = fatLine([[0, 0, -0.4], [0, 0, 2.2], [0, 0, 4.4], [0, 0, 6.4]], { color: 0xffffff, width: 6.5, opacity: 0, additive: true, vertexColors: true });
  leakLine.geometry.setColors([...SIGNAL.toArray().map((v) => v * 1.6), ...SIGNAL.toArray().map((v) => v * 1.25), ...SIGNAL.toArray().map((v) => v * 0.45), 0, 0, 0]);
  leakH.add(leakLine);
  const leakSpot = anchor(group, leakHit.x, leakHit.y, leakHit.z);

  // the lick: ONE tongue plastered on the corner of the hem where the glue goes first
  const lickT = tongueMat({ gain: 1.35, heart: 1.2, fade: [0.5, 1.02], ground: 0, near: [0, 1] });
  const g = SHELTER.glue;
  const gn = new THREE.Vector3(g[0] / DOME.a ** 2, Math.max(g[1], 6) / DOME.b ** 2, g[2] / DOME.c ** 2).normalize();
  lickT.uniforms.uOrigin.value.set(g[0], g[1], g[2]).addScaledVector(gn, 5);
  lickT.uniforms.uUp.value.copy(gn).multiplyScalar(0.45).add(new THREE.Vector3(0, 1, 0)).normalize();
  lickT.uniforms.uWind.value.set(-0.85, 0.2, -0.45).normalize(); // it climbs onto the dome, laid over the corner
  const lickGeo = tongueGeometry([
    { x: 0, dz: 0, kind: 0, len: 30, wid: 6.5, s1: 0.31, s2: 0.62 },
    { x: -4, dz: -3, kind: 1, len: 19, wid: 4.5, s1: 0.77, s2: 0.18 },
  ]);
  const lick = new THREE.Mesh(lickGeo, lickT.material);
  lick.frustumCulled = false;
  lick.renderOrder = 6;
  group.add(lick);
  const lickSpot = anchor(group, g[0], g[1] + 20, g[2]);

  const all = R.flatMap((r) => [r.a, r.ad, r.b, r.bd]).filter(Boolean);
  return {
    group, R, leakH, leakLine, lick, lickT, leakSpot, lickSpot, all,
    update(p, time) {
      const rays = clamp01(p.rays ?? 0);
      const bounce = clamp01(p.bounce ?? 0);
      const leak = clamp01(p.leak ?? 0);
      const lk = clamp01(p.lick ?? 0);
      const run = -time * 0.42; // the dashes run along each ray, toward the dome then away from it (≤ 1/7 period a frame)
      R.forEach((r, i) => {
        // they arrive one after the other, from the fire to the foil
        const grow = smooth(0.0, 0.65, rays * 1.25 - i * 0.025);
        const on = rays > 0.004 && grow > 0.004;
        r.inH.visible = on;
        if (on) {
          r.inH.scale.set(1, 1, r.len * grow);
          r.a.material.opacity = 0.92 * smooth(0, 0.3, rays);
          r.ad.material.opacity = 0.95 * smooth(0, 0.3, rays);
          r.ad.material.dashOffset = run;
        }
        if (r.backH) {
          const gb = smooth(0, 0.7, bounce * 1.3 - (i % 5) * 0.06) * (grow > 0.98 ? 1 : 0);
          const onB = on && gb > 0.004;
          r.backH.visible = onB;
          if (onB) {
            r.backH.scale.set(1, 1, r.back * gb);
            r.b.material.opacity = 0.9 * smooth(0, 0.3, rays);
            r.bd.material.opacity = 0.95 * smooth(0, 0.3, rays);
            r.bd.material.dashOffset = run;
          }
        }
      });
      const lg = smooth(0, 1, leak) * (rays > 0.5 ? 1 : 0);
      leakH.visible = lg > 0.004;
      if (leakH.visible) {
        leakH.scale.set(1, 1, Math.max(0.05, lg));
        leakLine.material.opacity = 0.9 + 0.1 * Math.sin(time * 2.1);
      }
      lick.visible = lk > 0.004;
      lickT.uniforms.uTime.value = time;
      lickT.uniforms.uFire.value = lk;
      lickT.uniforms.uLean.value = 0.72 + 0.06 * Math.sin(time * 1.7);
    },
  };
}

/* ───────────────────────────────────────────────────────────── the fire */

export function buildFire() {
  const rand = rng(4040);
  const group = new THREE.Group();
  group.name = "feu";

  // the front: four sets of tongues in one draw; your pad gives them nothing to root in
  const half = [PAD.w / 2 + 40, PAD.l / 2 + 40];
  const frontM = tongueMat({ gain: 1.1, heart: 1.1, fade: [0.4, 1.02], pad: [-half[0], -half[1], half[0], half[1]] });
  const front = new THREE.Mesh(tongueGeometry(frontTongues(rand)), frontM.material);
  front.frustumCulled = false;
  front.renderOrder = 5;
  const frontZ = new THREE.Mesh(front.geometry, frontM.depth);
  frontZ.frustumCulled = false;
  frontZ.renderOrder = 6;
  front.add(frontZ);
  // the far flank's line
  const flankM = tongueMat({ gain: 1.05, heart: 1.0, fade: [0.45, 1.02] });
  const flank = new THREE.Mesh(tongueGeometry(flankTongues(rand)), flankM.material);
  flank.frustumCulled = false;
  flank.renderOrder = 5;
  const flankZ = new THREE.Mesh(flank.geometry, flankM.depth);
  flankZ.frustumCulled = false;
  flankZ.renderOrder = 6;
  flank.add(flankZ);
  flankM.uniforms.uFrontZ.value = FIRE.flankZ;
  // the smoke: a column behind the wall (the flames win over it), a ceiling ahead of the tips (it eats them)
  const smokeBack = smokeMesh(rand, { count: 170, dz: [-2600, -500], rise: [0.5, 3.4], size: [700, 1700], order: 3, glow: 1 });
  const smokeFront = smokeMesh(rand, { count: 110, dz: [-2800, 400], rise: [0.95, 2.4], size: [600, 1400], order: 8, glow: 0.7 });
  // once the front has gone past: the scraped crest smokes — thin wisps where it was, not following it
  const smokeCrest = smokeMesh(rand, { count: 120, dz: [-1500, 1500], rise: [0.02, 0.55], size: [260, 640], order: 8, glow: 0.3, base: [0.13, 0.115, 0.105] }); // grey: it reads on the black
  smokeCrest.uniforms.uFrontZ.value = 0;
  smokeCrest.uniforms.uFootY.value = 0;
  smokeCrest.uniforms.uFire.value = 0.5;
  const embers = makeEmbers(rand, 640, 40);
  group.add(front, flank, smokeBack.mesh, smokeFront.mesh, smokeCrest.mesh, embers.mesh);

  const light = new THREE.PointLight(BRAND.signal, 0, 0, 1);
  light.castShadow = false;
  group.add(light);

  const rays = buildRays();
  const A = {
    front: anchor(group, 0, 0, 0), //  the wall's face, half-way up, at your x
    flank: anchor(group, 0, ridgeY(0, FIRE.flankZ) + 300, FIRE.flankZ),
    leak: rays.leakSpot, //            where the tenth ray goes in (shelter frame)
    lick: rays.lickSpot, //            the tongue on the glued corner (shelter frame)
  };

  return {
    group, light, A,
    rays: { group: rays.group, update: (p, time) => rays.update(p, time) },
    update(p, time) {
      const bench = (p.bench ?? 0) > 0.5;
      const fz = (p.front ?? -200) * 100;
      const fire = clamp01(p.fire ?? 0);
      const lean = clamp01(p.lean ?? 0);
      const fl = clamp01(p.flank ?? 0);
      const sm = clamp01(p.smoke ?? 0);
      const em = clamp01(p.embers ?? 0);
      const footY = ridgeY(0, fz);

      front.visible = !bench && fire > 0.004;
      const fu = frontM.uniforms;
      fu.uTime.value = time;
      fu.uFrontZ.value = fz;
      fu.uFire.value = fire;
      fu.uLean.value = lean;
      fu.uGain.value = 1.1 * (0.55 + 0.45 * fire);

      flank.visible = !bench && fl > 0.004;
      const ku = flankM.uniforms;
      ku.uTime.value = time;
      ku.uFire.value = fl;
      ku.uLean.value = 0.25;

      for (const s of [smokeBack, smokeFront]) {
        s.mesh.visible = !bench && sm > 0.004;
        const u = s.uniforms;
        u.uTime.value = time;
        u.uFrontZ.value = fz;
        u.uFootY.value = footY;
        u.uSmoke.value = sm;
        u.uLean.value = lean;
        u.uFire.value = fire;
      }
      const after = sm * smooth(4, 18, p.front ?? -200);
      smokeCrest.mesh.visible = !bench && after > 0.004;
      smokeCrest.uniforms.uTime.value = time;
      smokeCrest.uniforms.uSmoke.value = 0.55 * after;
      // the wind lays the smoke down too: ahead of the tips, the ceiling comes down with `lean` (it keeps the header dark)
      smokeFront.uniforms.uRise.value.x = 0.95 - 0.55 * lean;

      embers.mesh.visible = !bench && em > 0.004 && fire > 0.004;
      const eu = embers.uniforms;
      eu.uTime.value = time;
      eu.uFrontZ.value = fz;
      eu.uFootY.value = footY;
      eu.uLean.value = lean;
      eu.uAmount.value = em * (0.4 + 0.6 * fire);

      // the light has a place: just over the wall, a little ahead of it (where the flames lean)
      light.visible = !bench;
      light.intensity = bench ? 0 : 3400 * fire * (0.94 + 0.04 * Math.sin(time * 1.3) + 0.02 * Math.sin(time * 2.7));
      light.position.set(0, footY + FIRE.height * 0.32, fz + FIRE.height * 0.25 * lean);
      A.front.position.set(0, footY + FIRE.height * 0.35, fz);
    },
  };
}
