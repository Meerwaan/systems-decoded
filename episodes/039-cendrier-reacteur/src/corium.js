// DOSSIER 039 — the THREAT: the corium (the molten core) and what it does, from the vessel's belly to the sheet in
// the chamber; the heat it pushes into the floor; the steam. Frame: plan.js (centimetres, y up). Built for
// docs/039-decors.md § corium.js.
//   belly    the vessel's lower head reddening, seen from underneath: a warm gradient centred on its lowest point
//   breach   the hole it pierces there, its lip white hot · pour: ≈ 0.3 a drop that swells, lets go and falls
//            (periodic: alive from frame 0) → 1 a continuous stream down to the pool, its splash
//   pit      the melt pooling in the pit (a puddle that runs to the wall, then rises to ≈ 80 cm), eating the
//            sacrificial concrete (a glow where it touches); the plug stays readable under it, a hotter circle ·
//            fume: slow ink fumes over it
//   flow     the melt's front: 0 → 0.2 down the drop under the plug, 0.2 → 1 a tongue along the channel to its mouth
//   mass · spread   the melt in the chamber, ONE body: spread 0 a thick heap, 1 a thin sheet over the 170 m²
//            (volume about kept). Its front grows from the channel's mouth while the melt comes in by the channel
//            (flow ≥ 0.9), from HEAP.at otherwise (the « principe »: the same body, heap to sheet, in place)
//   arrows   the heat going down into the floor: signal arrows under the melt, tight and long when it is thick,
//            sparse and short when it is thin (read from the body's thickness)
//   cool     the sheet under the water: orange → a dark crust, a few veins · steam: ink steam rising where the
//            water touches it (gated by model.js's `water` ≥ 0.8: the edges first, then all over)
//   blast    the counter-example (« trop tôt »): water poured on the pool in the pit (→ 0.3), then a steam
//            explosion tinted signal that swells and falls back (→ 1). A hypothesis: nothing more than a puff.
// THE MATTER. Every body of melt shares one shader (`lava`): a crust broken into domed plates lit by the key light,
// cracks of bright orange whose cores go white hot, zones that are fully molten, the cracks' light spilling onto
// the plates' rims. Never a flat orange slab. Nothing emits above 3 (it would bleed). Everything moves slowly,
// and everything is a function of `time` and the numbers: no clock, no Math.random, nothing allocated in update().
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { anchor } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { VESSEL, PIT, PLUG, SHAFT, CHANNEL, CHAMBER, HEAP, FLOOD } from "./plan.js";

const SIG = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const WHITE = SIG.clone().lerp(INK, 0.62); // white hot: the signal pushed toward the ink
const CRUST = new THREE.Color(0x2c2420);
const STEAM = INK.clone().multiplyScalar(0.8);
const FUMES = INK.clone().multiplyScalar(0.32);
const VIEWPORT = new THREE.Vector2(BRAND.W, BRAND.H);

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const sm = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ───────────────────────────── GLSL ───────────────────────────── */

const NOISE = /* glsl */ `
float sdH(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 sdH2(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float sdN(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(sdH(i), sdH(i + vec2(1.0, 0.0)), u.x), mix(sdH(i + vec2(0.0, 1.0)), sdH(i + vec2(1.0, 1.0)), u.x), u.y);
}
float sdF(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * sdN(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s / 0.9375; }
// x: distance to the nearest plate centre · y: F2 − F1 (0 on a crack) · zw: the offset from that centre
vec4 sdV(vec2 p) {
  vec2 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0; vec2 r1 = vec2(0.0);
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y)); vec2 r = g + 0.12 + 0.76 * sdH2(i + g) - f; float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; r1 = r; } else if (d < d2) { d2 = d; }
  }
  d1 = sqrt(d1); d2 = sqrt(d2);
  return vec4(d1, d2 - d1, -r1);
}`;

const LAVA = /* glsl */ `
uniform vec3 uCrust, uHot, uWhite; uniform float uCool, uCell;
// q: where on the crust (cm, advected by the caller) · heat ≥ 0 · n: the body's normal (world) · w: world position
vec3 lava(vec2 q, float heat, vec3 n, vec3 w) {
  vec2 uv = q / uCell;
  uv += 0.75 * vec2(sdN(uv * 0.55 + 3.1), sdN(uv * 0.55 + 7.7)) - 0.375;
  vec4 v = sdV(uv);
  vec4 v2 = sdV(uv * 2.3 + 5.0);
  float big = sdF(q / (uCell * 3.6) + 11.0);
  float h = heat * (0.6 + 0.75 * big) * (1.0 - 0.82 * uCool);
  float hc = clamp(h, 0.0, 1.0);
  float wc = mix(0.025, 0.15, hc);
  float fw = max(fwidth(v.y), 1e-4);
  float crack = 1.0 - smoothstep(wc - fw, wc + fw, v.y);
  float fw2 = max(fwidth(v2.y), 1e-4);
  float w2 = wc * 0.4;
  // the plates' own small cracks: they fade out before they would go under a pixel
  float crack2 = (1.0 - smoothstep(w2 - fw2, w2 + fw2, v2.y)) * smoothstep(0.3, 0.75, hc) * (1.0 - smoothstep(0.05, 0.12, fw2));
  float core = 1.0 - smoothstep(0.0, wc * 0.4 + fw, v.y);
  float melt = smoothstep(0.8, 1.12, h);
  // the plate is domed: its normal leans out toward its rim (analytic: nothing that shimmers)
  vec2 dir = v.zw / max(v.x, 1e-3);
  float tilt = 0.85 * (1.0 - smoothstep(0.0, 0.3, v.y)) + 0.25 * clamp(v.x, 0.0, 1.0);
  vec3 nb = normalize(n + vec3(dir.x, 0.0, dir.y) * tilt);
  vec3 L = normalize(vec3(-0.55, 0.78, 0.42));
  vec3 V = normalize(cameraPosition - w);
  float dif = max(dot(nb, L), 0.0);
  float spec = pow(clamp(dot(reflect(-L, nb), V), 0.0, 1.0), 16.0);
  float spill = exp(-v.y / (wc * 1.1 + 0.02)) * hc;
  float grain = 0.8 + 0.4 * sdN(uv * 3.3 + 1.3);
  vec3 crust = uCrust * (0.35 + 1.35 * dif) * grain + vec3(0.05) * spec * (1.0 - 0.6 * uCool)
             + uHot * (0.4 * spill + 0.08 * hc * hc);
  vec3 molten = uHot * (0.8 + 0.45 * big) * (0.8 + 0.4 * sdN(uv * 1.7 + vec2(0.0, 3.0)));
  vec3 hot = mix(uHot * (0.95 + 0.45 * hc), mix(uHot, uWhite, 0.45) * 1.9, core * smoothstep(0.55, 1.1, h));
  vec3 col = mix(crust, molten, melt * (1.0 - crack));
  col = mix(col, uHot * (0.7 + 0.3 * hc), crack2 * (1.0 - melt));
  col = mix(col, hot, crack);
  return min(col, vec3(3.0));
}`;

const END = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>`;

/** The plain vertex shader for a body seen from outside (world position, world normal); `uWob` sways a stream. */
const VS_BODY = /* glsl */ `
uniform float uTime, uWob, uPulse;
varying vec3 vW; varying vec3 vN; varying vec2 vUv;
void main() {
  // uPulse: bulges that run down a stream (the melt comes in gulps), read from the world height
  float wy = (modelMatrix * vec4(position, 1.0)).y;
  float bulge = 1.0 + uPulse * (0.5 + 0.5 * sin(wy * 0.045 + uTime * 14.0)) * (0.75 + 0.25 * sin(wy * 0.013 - uTime * 3.0));
  vec4 wp = modelMatrix * vec4(position.x * bulge, position.y, position.z * bulge, 1.0);
  wp.x += sin(wp.y * 0.05 + uTime * 4.0) * uWob;
  wp.z += cos(wp.y * 0.043 + uTime * 3.1) * uWob;
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const baseU = () => ({
  uCrust: { value: CRUST }, uHot: { value: SIG }, uWhite: { value: WHITE }, uCool: { value: 0 }, uCell: { value: 50 },
  uTime: { value: 0 }, uWob: { value: 0 }, uPulse: { value: 0 },
});

/** A drop, a stream, the fall in the shaft: a glowing body, white hot where it faces the eye, orange at its edges,
 *  streaks running down it. */
function moltenMat(flow) {
  const uniforms = { ...baseU(), uFlow: { value: flow }, uK: { value: 1 } };
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VS_BODY,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot, uWhite; uniform float uTime, uFlow, uK;
      varying vec3 vW; varying vec3 vN;
      ${NOISE}
      void main() {
        vec3 n = normalize(vN); vec3 V = normalize(cameraPosition - vW);
        float f = abs(dot(n, V));
        float s = sdN(vec2(n.x * 1.7 + n.z * 1.1 + vW.x / 40.0, vW.y / 60.0 + uTime * uFlow));
        vec3 col = mix(uHot * (0.9 + 0.5 * s), mix(uHot, uWhite, 0.5) * 2.0, pow(f, 3.0) * (0.45 + 0.6 * s));
        gl_FragColor = vec4(min(col * uK, vec3(3.0)), 1.0);
        ${END}
      }`,
  });
}

/** The halo round a stream: additive, its light where the body faces the eye. */
function haloMat() {
  const uniforms = { ...baseU(), uK: { value: 0 } };
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VS_BODY,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot; uniform float uK;
      varying vec3 vW; varying vec3 vN;
      void main() {
        float f = abs(dot(normalize(vN), normalize(cameraPosition - vW)));
        gl_FragColor = vec4(uHot * pow(f, 2.6) * uK, 1.0);
        ${END}
      }`,
  });
}

/** Embers and droplets: points that fly under gravity, drawn as streaks (a dot hopping reads as flicker).
 *  Periodic (`uDriven` 0: alive from frame 0) or driven by a number (`uDriven` 1, `uAge` 0–1: the blast). */
function makeSparks({ count, seed, size = [1, 2.6] }) {
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4);
  const dirs = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    seeds.set([rand(), 0.5 + rand() * 0.9, size[0] + Math.pow(rand(), 2) * (size[1] - size[0]), rand()], i * 4);
    const th = rand() * Math.PI * 2;
    const up = rand();
    const s = Math.sqrt(1 - up * up);
    dirs.set([Math.cos(th) * s, up, Math.sin(th) * s, rand() * Math.PI * 2], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  geo.setAttribute("aDir", new THREE.BufferAttribute(dirs, 4));
  const u = {
    uTime: { value: 0 }, uLife: { value: 1 }, uG: { value: 900 }, uVS: { value: 0 }, uSpawn: { value: 0 }, uFloor: { value: -1e4 },
    uAmount: { value: 0 }, uStreak: { value: 0.028 }, uScale: { value: 2000 }, uDriven: { value: 0 }, uAge: { value: 0 },
    uO: { value: new THREE.Vector3() }, uV0: { value: new THREE.Vector3() }, uView: { value: VIEWPORT },
    uHotC: { value: WHITE.clone().multiplyScalar(2.6) }, uCoolC: { value: SIG.clone().multiplyScalar(2.0) },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms: u,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uLife, uG, uVS, uSpawn, uFloor, uAmount, uStreak, uScale, uDriven, uAge;
        uniform vec3 uO, uV0; uniform vec2 uView;
        attribute vec4 aSeed; attribute vec4 aDir;
        varying float vA; varying float vAge; varying vec2 vDir; varying float vHalf; varying float vDot;
        vec3 place(float tau) {
          vec3 off = vec3(cos(aDir.w), 0.0, sin(aDir.w)) * uSpawn * sqrt(fract(aSeed.x * 7.13 + aSeed.w));
          vec3 v = uV0 + aDir.xyz * uVS * aSeed.y;
          return uO + off + v * tau + vec3(0.0, -0.5 * uG * tau * tau, 0.0);
        }
        void main() {
          float age = uDriven > 0.5 ? clamp(uAge * (0.7 + 0.45 * aSeed.y), 0.0, 1.0) : fract(uTime / (uLife * (0.75 + 0.3 * aSeed.y)) + aSeed.x);
          float tau = age * uLife;
          vec3 p = place(tau);
          vec3 q = place(max(tau - uStreak, 0.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vec4 c0 = projectionMatrix * mv;
          vec4 c1 = projectionMatrix * modelViewMatrix * vec4(q, 1.0);
          vec2 run = (c0.w > 0.0 && c1.w > 0.0) ? (c0.xy / c0.w - c1.xy / c1.w) * 0.5 * uView : vec2(0.0);
          float len = min(length(run), 120.0);
          float size = clamp(aSeed.z * uScale / max(1.0, -mv.z), 1.8, 7.0);
          gl_PointSize = size + len;
          gl_Position = c0;
          gl_Position.xy -= (len > 0.5 ? normalize(run) * len : vec2(0.0)) / uView * c0.w;
          vDir = len > 0.5 ? normalize(run) : vec2(1.0, 0.0);
          vDot = size / (size + len);
          vHalf = 0.5 * (1.0 - vDot);
          vAge = age;
          float on = smoothstep(aSeed.w, aSeed.w + 0.1, uAmount * 1.1);
          float env = smoothstep(0.0, 0.05, age) * (1.0 - smoothstep(0.75, 1.0, age));
          vA = on * env * step(uFloor, p.y) * sqrt(vDot);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHotC, uCoolC; varying float vA; varying float vAge; varying vec2 vDir; varying float vHalf; varying float vDot;
        void main() {
          if (vA < 0.002) discard;
          vec2 q = gl_PointCoord - 0.5;
          q.y = -q.y;
          float along = max(abs(dot(q, vDir)) - vHalf, 0.0);
          float across = dot(q, vec2(-vDir.y, vDir.x));
          float d = length(vec2(along, across)) / max(0.5 * vDot, 1e-3);
          float a = pow(max(0.0, 1.0 - d), 1.6);
          gl_FragColor = vec4(mix(uHotC, uCoolC, smoothstep(0.0, 0.45, vAge)) * a * vA, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 9;
  return { points, u };
}

/** Fumes, steam, the blast: soft round puffs lit from the key side, their underside tinted by the melt below.
 *  Mode 0: they rise through a box (fumes over the pit, steam over the sheet: `uReach` lets only those near the
 *  chamber's walls live — the water rises round the edges first). Mode 1 (`uBurst`): a cloud round a centre. */
function makePuffs({ count, seed, size }) {
  const rand = rng(seed);
  const a = new Float32Array(count * 4);
  const b = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    a.set([rand(), rand(), rand(), rand()], i * 4);
    b.set([size[0] + rand() * (size[1] - size[0]), 0.7 + rand() * 0.6, rand(), rand()], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(a, 4));
  geo.setAttribute("aSeed2", new THREE.BufferAttribute(b, 4));
  const u = {
    uTime: { value: 0 }, uLife: { value: 8 }, uRise: { value: 300 }, uAmount: { value: 0 }, uAlpha: { value: 0.2 }, uScale: { value: 2000 },
    uSizeK: { value: 1 }, uBurst: { value: 0 }, uBR: { value: 0 }, uSink: { value: 0 }, uReach: { value: 1e5 },
    uMin: { value: new THREE.Vector3() }, uSize: { value: new THREE.Vector3(1, 1, 1) }, uC: { value: new THREE.Vector3() },
    uRect: { value: new THREE.Vector4(-1e5, -1e5, 1e5, 1e5) },
    uTop: { value: STEAM.clone() }, uBot: { value: SIG.clone().multiplyScalar(1.3) }, uTint: { value: 0 }, uCrisp: { value: 0 },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms: u,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        uniform float uTime, uLife, uRise, uAmount, uAlpha, uScale, uSizeK, uBurst, uBR, uSink, uReach;
        uniform vec3 uMin, uSize, uC; uniform vec4 uRect;
        attribute vec4 aSeed; attribute vec4 aSeed2;
        varying float vA; varying float vY; varying float vS;
        void main() {
          vS = aSeed.w;
          vec3 p; float size; float a;
          if (uBurst < 0.5) {
            float age = fract(uTime / (uLife * aSeed2.y) + aSeed.w);
            p = uMin + aSeed.xyz * uSize;
            p.y += age * uRise;
            p.x += sin(uTime * 0.21 + aSeed.w * 6.283) * 18.0 * (0.4 + age);
            p.z += cos(uTime * 0.17 + aSeed.x * 6.283) * 18.0 * (0.4 + age);
            size = aSeed2.x * uSizeK * (0.55 + 0.9 * age);
            a = pow(sin(3.14159 * age), 1.3);
            float de = min(min(p.x - uRect.x, uRect.z - p.x), min(p.z - uRect.y, uRect.w - p.z));
            a *= 1.0 - smoothstep(uReach - 80.0, uReach, de);
            vY = 1.0 - age;
          } else {
            float th = aSeed.x * 6.2832; float ph = acos(clamp(1.0 - aSeed.y, -1.0, 1.0));
            vec3 dir = vec3(sin(ph) * cos(th), cos(ph) * 0.75 + 0.25, sin(ph) * sin(th));
            p = uC + dir * uBR * (0.3 + 0.7 * aSeed.z);
            p.y -= uSink * (0.5 + 0.5 * aSeed.z);
            p.x += sin(uTime * 0.5 + aSeed.w * 6.283) * 10.0;
            size = aSeed2.x * uSizeK * (0.7 + 0.5 * aSeed.z);
            a = 1.0;
            vY = 1.0 - clamp((p.y - uC.y) / max(uBR, 1.0), 0.0, 1.0);
          }
          a *= smoothstep(aSeed2.w, aSeed2.w + 0.15, uAmount * 1.15) * uAlpha;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          a *= smoothstep(120.0, 380.0, -mv.z); // nothing the camera brushes past
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(size * uScale / max(1.0, -mv.z), 2.0, 900.0);
          vA = a;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop, uBot; uniform float uTint, uCrisp, uTime;
        varying float vA; varying float vY; varying float vS;
        ${NOISE}
        void main() {
          vec2 c = gl_PointCoord * 2.0 - 1.0; c.y = -c.y;
          float r2 = dot(c, c);
          if (r2 > 1.0 || vA < 0.003) discard;
          vec3 n = vec3(c, sqrt(max(1.0 - r2, 0.0)));
          float alpha = pow(1.0 - r2, 1.1);
          float bil = 1.0;
          if (uCrisp > 0.0) {
            // a billow: a lobed rim (cauliflower), sharp but antialiased, small curls shaded inside
            float r = sqrt(r2);
            vec2 dir = c / max(r, 1e-3);
            float lobe = sdN(dir * 2.2 + vec2(vS * 41.0, vS * 17.0 + uTime * 0.12));
            float rr = r / (0.66 + 0.3 * lobe);
            float fw = max(fwidth(rr), 1e-3);
            float body = 1.0 - smoothstep(0.93 - fw, 0.93 + fw, rr);
            n = normalize(vec3(c * 1.15, sqrt(max(1.0 - rr * rr, 0.0)) + 0.05));
            bil = 0.72 + 0.56 * sdN(c * 3.4 + vec2(vS * 23.0, uTime * 0.18));
            alpha = mix(alpha, body * (0.8 + 0.2 * (1.0 - rr * rr)), uCrisp);
          }
          float lit = (0.3 + 0.85 * max(dot(n, normalize(vec3(-0.45, 0.65, 0.6))), 0.0)) * bil;
          float low = clamp((0.5 - 0.5 * c.y) * 0.9 - 0.25 + vY * 0.45, 0.0, 1.0) * uTint;
          vec3 col = mix(uTop * lit, uBot, low);
          gl_FragColor = vec4(col, alpha * vA);
          ${END}
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 8;
  return { points, u };
}

/** A light that has a place: a bright heart and a long soft tail (one point sprite, additive). */
function makeBall(color) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
  const u = { uSize: { value: 100 }, uScale: { value: 2000 }, uK: { value: 0 }, uCol: { value: new THREE.Color(color) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms: u,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uSize, uScale;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(uSize * uScale / max(1.0, -mv.z), 1.0, 1000.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uCol; uniform float uK;
        void main() {
          vec2 c = gl_PointCoord * 2.0 - 1.0; float r2 = dot(c, c);
          if (r2 > 1.0) discard;
          float a = (exp(-r2 * 18.0) + 0.28 * exp(-r2 * 4.0)) * (1.0 - r2);
          gl_FragColor = vec4(uCol * uK * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 9;
  return { points, u };
}

/* ───────────────────────────── the build ───────────────────────────── */

export function buildCorium() {
  const group = new THREE.Group();
  const timed = []; // every material whose uTime runs with the film

  /* ── the belly: a skin just outside 005's vessel, its lower hemisphere, ONE face (seen from underneath) ── */
  const bellyU = { ...baseU(), uCrust: { value: new THREE.Color(0x2a221e) }, uC: { value: new THREE.Vector3(0, VESSEL.belly, 0) }, uR: { value: VESSEL.r + 2.5 }, uAmt: { value: 0 }, uHole: { value: 0 } };
  timed.push(bellyU);
  const bellyMat = new THREE.ShaderMaterial({
    uniforms: bellyU,
    vertexShader: VS_BODY,
    transparent: true,
    depthWrite: false,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot, uWhite, uC, uCrust; uniform float uR, uAmt, uHole, uTime;
      varying vec3 vW; varying vec3 vN;
      ${NOISE}
      void main() {
        vec3 d = normalize(vW - uC);
        float arc = acos(clamp(-d.y, -1.0, 1.0)) * uR;          // along the skin, from the lowest point
        float heat = uAmt * exp(-pow(arc / (uR * 0.85), 2.0));
        float mott = sdF(vec2(vW.x, vW.z) / 34.0 + vec2(vW.y / 50.0, uTime * 0.025));
        float veins = 1.0 - smoothstep(0.0, 0.09, abs(sdN(vec2(vW.x + vW.y, vW.z - vW.y) / 26.0) - 0.5));
        heat *= 0.5 + 0.8 * mott + 0.35 * veins;
        float ring = uHole > 0.5 ? exp(-pow((arc - uHole) / (2.5 + 0.12 * uHole), 2.0)) : 0.0;
        float inHole = uHole > 0.5 ? 1.0 - smoothstep(uHole - 1.5, uHole + 0.5, arc) : 0.0;
        float fr = 1.0 - abs(dot(normalize(vN), normalize(cameraPosition - vW)));
        // dark steel where it is still cold, red where it heats, a few hot spots; the hole's lip white hot
        vec3 dull = uCrust * (0.6 + 0.9 * fr) + uHot * (0.04 + 1.05 * heat);
        vec3 col = mix(dull, mix(uHot, uWhite, 0.3) * 1.5, clamp(heat * heat * 0.3, 0.0, 1.0));
        col = mix(col, mix(uHot, uWhite, 0.55) * 2.0, clamp(ring, 0.0, 1.0));
        col = mix(col, uHot * (1.15 + 0.5 * sdN(vW.xz / 7.0 + uTime * 0.5)), inHole);
        float a = clamp(0.55 * uAmt + heat * 1.3 + ring + inHole, 0.0, 1.0) * (1.0 - smoothstep(uR * 1.2, uR * 1.55, arc));
        gl_FragColor = vec4(min(col, vec3(3.0)), a);
        ${END}
      }`,
  });
  const belly = new THREE.Mesh(new THREE.SphereGeometry(VESSEL.r + 2.5, 72, 28, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), bellyMat);
  belly.position.set(0, VESSEL.belly, 0);
  belly.renderOrder = 4;
  group.add(belly);

  /* ── the drop and its neck, the stream, its halo, the collar where it lands ── */
  const dropMat = moltenMat(1.5);
  const drop = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), dropMat);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1, 1, 24, 4, true).translate(0, -0.5, 0), dropMat);
  const streamMat = moltenMat(4.0);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 28, 48, true).translate(0, -0.5, 0), streamMat);
  const streamHaloMat = haloMat();
  const streamHalo = new THREE.Mesh(stream.geometry, streamHaloMat);
  streamHalo.renderOrder = 7;
  const collarMat = moltenMat(1.2);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(1, 0.34, 12, 40).rotateX(Math.PI / 2), collarMat);
  timed.push(dropMat.uniforms, streamMat.uniforms, streamHaloMat.uniforms, collarMat.uniforms);
  group.add(drop, neck, stream, streamHalo, collar);

  const embers = makeSparks({ count: 46, seed: 39, size: [0.9, 2.2] }); // from the belly round the hole
  const spray = makeSparks({ count: 64, seed: 391, size: [1, 2.8] }); //   where the stream lands
  const impact = makeBall(SIG.clone().lerp(WHITE, 0.4));
  const globs = makeSparks({ count: 26, seed: 3913, size: [1.8, 3.8] }); // gobs that fall beside the stream
  group.add(embers.points, spray.points, impact.points, globs.points);

  /* ── the pool in the pit: a puddle that runs to the wall, then rises ── */
  const poolU = {
    ...baseU(), uRp: { value: 0 }, uLobe: { value: 16 }, uWall: { value: 0 }, uPlugR: { value: PLUG.r }, uImpact: { value: 0 }, uImpAmp: { value: 0 },
    uSwirl: { value: 0 }, uWallR: { value: PIT.r - 1 }, uRingR: { value: PLUG.ring + 4 }, uRingK: { value: 0 }, uInk: { value: INK },
  };
  poolU.uCell.value = 46;
  timed.push(poolU);
  const poolMat = new THREE.ShaderMaterial({
    uniforms: poolU,
    vertexShader: VS_BODY,
    fragmentShader: /* glsl */ `
      uniform float uTime, uRp, uLobe, uWall, uPlugR, uImpact, uImpAmp, uSwirl, uWallR, uRingR, uRingK; uniform vec3 uInk;
      varying vec3 vW; varying vec3 vN;
      ${NOISE}
      ${LAVA}
      void main() {
        float r = length(vW.xz);
        float rr = r + (sdF(vW.xz / 60.0 + 2.0) - 0.5) * uLobe;
        if (rr > uRp) discard;
        float heat = 0.82;
        heat += 0.45 * exp(-pow((uRp - rr) / 18.0, 2.0)) * (1.0 - uWall);       // the puddle's running rim
        heat += 0.4 * smoothstep(uWallR - 40.0, uWallR - 2.0, r) * uWall;        // where it eats the wall
        heat += 0.5 * exp(-pow((r - uPlugR) / 9.0, 2.0)) + 0.18 * (1.0 - smoothstep(uPlugR * 0.9, uPlugR * 1.1, r)); // the plug: a hotter circle under the bath
        heat += uImpAmp * exp(-pow((r - uImpact) / 14.0, 2.0));                  // a drop has just landed
        float ang = 0.035 * uTime + uSwirl / (1.0 + r / 45.0);                    // slow convection; a vortex as it drains
        float c = cos(ang), s = sin(ang);
        vec2 q = vec2(c * vW.x - s * vW.z, s * vW.x + c * vW.z);
        vec3 col = lava(q, heat, vec3(0.0, 1.0, 0.0), vW);
        // the plug's ring, read through the bath: a pale line (under 1: no bloom) between two dark bands
        float dr = abs(r - uRingR);
        float fwr = max(fwidth(r), 0.05);
        float band = 1.0 - smoothstep(6.0, 10.0 + fwr, dr);
        float line = 1.0 - smoothstep(2.4 - fwr, 3.6 + fwr, dr);
        col = mix(col, uCrust * 0.45, band * uRingK);
        col = mix(col, uInk * 0.82, line * uRingK);
        gl_FragColor = vec4(col, 1.0);
        ${END}
      }`,
  });
  const pool = new THREE.Mesh(new THREE.RingGeometry(0.5, PIT.r - 1, 144, 30).rotateX(-Math.PI / 2), poolMat);
  group.add(pool);
  // the glow on the lining, just over the bath: seen from inside the pit only
  const wallU = { ...baseU(), uK: { value: 0 } };
  const wallMat = new THREE.ShaderMaterial({
    uniforms: wallU,
    vertexShader: VS_BODY,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot; uniform float uK; varying vec2 vUv;
      void main() { gl_FragColor = vec4(uHot * pow(1.0 - vUv.y, 2.4) * uK, 1.0); ${END} }`,
  });
  const wallGlow = new THREE.Mesh(new THREE.CylinderGeometry(PIT.r - 1.5, PIT.r - 1.5, 1, 120, 1, true).translate(0, 0.5, 0), wallMat);
  wallGlow.renderOrder = 7;
  group.add(wallGlow);
  const fumes = makePuffs({ count: 26, seed: 393, size: [70, 140] });
  fumes.u.uTop.value.copy(FUMES);
  fumes.u.uLife.value = 9;
  fumes.u.uRise.value = 380;
  fumes.u.uAlpha.value = 0.085;
  group.add(fumes.points);

  /* ── the flow: the fall under the plug, then a tongue along the channel ── */
  const fallMat = moltenMat(3.0);
  const fall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 28, 24, true).translate(0, -0.5, 0), fallMat);
  fall.position.set(0, PLUG.y, 0);
  timed.push(fallMat.uniforms);
  const [, cy0, cz0] = CHANNEL.from;
  const [, cy1, cz1] = CHANNEL.to;
  const CH_LEN = Math.hypot(cz1 - cz0, cy1 - cy0);
  const CH_DY = (cy1 - cy0) / CH_LEN;
  const CH_DZ = (cz1 - cz0) / CH_LEN;
  const tongueU = { ...baseU(), uF: { value: 0 }, uHW: { value: (CHANNEL.w - 12) / 2 }, uT: { value: 15 } };
  tongueU.uCell.value = 32;
  timed.push(tongueU);
  const tongueMat = new THREE.ShaderMaterial({
    uniforms: tongueU,
    vertexShader: /* glsl */ `
      uniform float uF, uHW, uT, uTime;
      varying vec3 vW; varying vec3 vN; varying vec2 vQ; varying float vHeat; varying float vT;
      float thick(vec2 xu) {
        float x = clamp(xu.x / uHW, -1.0, 1.0);
        float ahead = uF - 34.0 * x * x - xu.y;
        float t = uT * smoothstep(0.0, 24.0, ahead);
        t *= 1.0 + 0.6 * exp(-pow((ahead - 28.0) / 26.0, 2.0));
        return t * (1.0 - 0.35 * pow(abs(x), 4.0));
      }
      void main() {
        vec3 p = position;
        float t = thick(p.xz);
        float e = 4.0;
        float tx = thick(p.xz + vec2(e, 0.0)) - thick(p.xz - vec2(e, 0.0));
        float tz = thick(p.xz + vec2(0.0, e)) - thick(p.xz - vec2(0.0, e));
        vN = normalize(mat3(modelMatrix) * normalize(vec3(-tx, 2.0 * e, -tz)));
        p.y += t > 0.3 ? t : -2.0;
        vT = t;
        vec4 wp = modelMatrix * vec4(p, 1.0);
        vW = wp.xyz;
        float ahead = uF - position.z;
        vHeat = 0.9 + 0.55 * exp(-pow(ahead / 70.0, 2.0)) - 0.18 * smoothstep(150.0, 600.0, ahead);
        vQ = vec2(position.x, position.z - uF * 0.55 - uTime * 6.0);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN; varying vec2 vQ; varying float vHeat; varying float vT;
      ${NOISE}
      ${LAVA}
      void main() {
        if (vT < 0.6) discard;
        gl_FragColor = vec4(lava(vQ, vHeat, normalize(vN), vW), 1.0);
        ${END}
      }`,
  });
  const tongue = new THREE.Mesh(new THREE.PlaneGeometry(CHANNEL.w - 12, CH_LEN, 12, 170).rotateX(-Math.PI / 2).translate(0, 0, CH_LEN / 2), tongueMat);
  const run = new THREE.Group();
  run.position.set(0, cy0 + 0.6, cz0);
  run.rotation.x = Math.atan2(cy0 - cy1, cz1 - cz0);
  run.add(tongue);
  tongue.frustumCulled = false;
  const landing = makeBall(SIG.clone().lerp(WHITE, 0.3));
  landing.points.position.set(0, cy0 + 14, cz0);
  group.add(fall, run, landing.points);

  /* ── the chamber: ONE body, heap → sheet ── */
  const W = CHAMBER.x1 - CHAMBER.x0;
  const L = CHAMBER.z1 - CHAMBER.z0;
  const ZC = (CHAMBER.z0 + CHAMBER.z1) / 2;
  const bodyU = {
    ...baseU(), uSrc: { value: new THREE.Vector3(...HEAP.at) }, uR: { value: 0 }, uH: { value: 0 }, uShape: { value: 0 }, uLobe: { value: 60 },
    uEdge: { value: 40 }, uAdv: { value: 1 },
  };
  bodyU.uCell.value = 60;
  timed.push(bodyU);
  const PROFILE = /* glsl */ `
    uniform vec3 uSrc; uniform float uR, uH, uShape, uLobe, uEdge;
    float rOf(vec2 xz) { return length(xz - uSrc.xz) + (sdF(xz / 230.0 + 3.1) - 0.5) * uLobe; }
    float profile(vec2 xz) {
      float r = rOf(xz);
      float s = clamp(r / max(uR, 1.0), 0.0, 1.0);
      float dome = sqrt(max(1.0 - s * s, 0.0)) * (0.78 + 0.4 * sdF(xz / 110.0 + 5.0));
      float inside = uR - r;
      float flatP = smoothstep(0.0, uEdge, inside) * (1.0 + 0.4 * exp(-pow((inside - uEdge) / uEdge, 2.0)));
      return uH * mix(dome, flatP, uShape);
    }`;
  const bodyVS = /* glsl */ `
    uniform float uTime, uAdv;
    varying vec3 vW; varying vec3 vN; varying vec2 vQ; varying float vHeat;
    ${NOISE}
    ${PROFILE}
    void main() {
      vec4 wp = modelMatrix * vec4(position, 1.0);
      float h = profile(wp.xz);
      float e = 7.0;
      float hx = profile(wp.xz + vec2(e, 0.0)) - profile(wp.xz - vec2(e, 0.0));
      float hz = profile(wp.xz + vec2(0.0, e)) - profile(wp.xz - vec2(0.0, e));
      vN = normalize(vec3(-hx, 2.0 * e, -hz));
      float r = rOf(wp.xz);
      wp.y += h > 0.3 ? h : -3.0;
      vW = wp.xyz;
      float inside = uR - r;
      vHeat = 0.92 + 0.5 * exp(-pow(inside / 70.0, 2.0)) - 0.22 * smoothstep(150.0, 900.0, inside) * uShape
            - 0.1 * (1.0 - uShape);
      vQ = uSrc.xz + (wp.xz - uSrc.xz) * uAdv + vec2(uTime * 2.0, uTime * 1.3);
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;
  const bodyFS = /* glsl */ `
    varying vec3 vW; varying vec3 vN; varying vec2 vQ; varying float vHeat;
    ${NOISE}
    ${LAVA}
    ${PROFILE}
    void main() {
      if (rOf(vW.xz) > uR || uH < 0.5) discard;
      gl_FragColor = vec4(lava(vQ, vHeat, normalize(vN), vW), 1.0);
      ${END}
    }`;
  const bodyMat = new THREE.ShaderMaterial({ uniforms: bodyU, vertexShader: bodyVS, fragmentShader: bodyFS });
  // the same body again, drawn after the heat arrows (which show through the slab): only while they are on
  const bodyOverMat = new THREE.ShaderMaterial({ uniforms: bodyU, vertexShader: bodyVS, fragmentShader: bodyFS, transparent: true });
  const bodyGeo = new THREE.PlaneGeometry(W, L, 100, 170).rotateX(-Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set((CHAMBER.x0 + CHAMBER.x1) / 2, CHAMBER.floor, ZC);
  body.frustumCulled = false;
  const bodyOver = new THREE.Mesh(bodyGeo, bodyOverMat);
  bodyOver.position.copy(body.position);
  bodyOver.frustumCulled = false;
  bodyOver.renderOrder = 6;
  group.add(body, bodyOver);

  /* ── the heat arrows: under the melt, in the slab, seen through it ── */
  const arrowU = { uHot: { value: SIG }, uWhite: { value: WHITE }, uTime: { value: 0 }, uK: { value: 0 }, uWob: { value: 0 }, uPulse: { value: 0 } };
  timed.push(arrowU);
  const arrowMat = new THREE.ShaderMaterial({
    uniforms: arrowU,
    vertexShader: VS_BODY,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot, uWhite; uniform float uTime, uK;
      varying vec3 vW;
      void main() {
        float band = 0.5 + 0.5 * sin((vW.y / 46.0 + uTime * 1.1) * 6.2832);
        vec3 col = mix(uHot * 1.5, mix(uHot, uWhite, 0.35) * 2.2, smoothstep(0.55, 1.0, band));
        gl_FragColor = vec4(col * min(uK, 1.0), clamp(uK, 0.0, 1.0));
        ${END}
      }`,
  });
  const N_ARROWS = 11;
  const shaftGeo = new THREE.CylinderGeometry(1, 1, 1, 14, 1).translate(0, -0.5, 0);
  const headGeo = new THREE.ConeGeometry(1, 1, 18).rotateX(Math.PI).translate(0, -0.5, 0);
  const shafts = [];
  const heads = [];
  for (let i = 0; i < N_ARROWS; i++) {
    const s = new THREE.Mesh(shaftGeo, arrowMat);
    const h = new THREE.Mesh(headGeo, arrowMat);
    s.renderOrder = h.renderOrder = 5;
    shafts.push(s);
    heads.push(h);
    group.add(s, h);
  }

  /* ── steam over the sheet; the blast in the pit ── */
  const steam = makePuffs({ count: 72, seed: 395, size: [140, 280] });
  steam.u.uMin.value.set(CHAMBER.x0 + 40, FLOOD.level - 60, CHAMBER.z0 + 40);
  steam.u.uSize.value.set(W - 80, 40, L - 80);
  steam.u.uRect.value.set(CHAMBER.x0, CHAMBER.z0, CHAMBER.x1, CHAMBER.z1);
  steam.u.uLife.value = 6;
  steam.u.uRise.value = 440;
  steam.u.uAlpha.value = 0.24;
  group.add(steam.points);

  const waterU = { ...baseU(), uK: { value: 0 }, uInk: { value: INK } };
  timed.push(waterU);
  const waterMat = new THREE.ShaderMaterial({
    uniforms: waterU,
    vertexShader: VS_BODY,
    transparent: true,
    depthWrite: false,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uTime, uK;
      varying vec3 vW; varying vec3 vN;
      ${NOISE}
      void main() {
        vec3 n = normalize(vN); float f = abs(dot(n, normalize(cameraPosition - vW)));
        float rim = pow(1.0 - f, 2.0);
        float s = sdN(vec2(n.x * 2.0 + n.z, vW.y / 50.0 + uTime * 5.0));
        gl_FragColor = vec4(uInk * (0.55 + 1.0 * rim + 0.35 * s), (0.14 + 0.7 * rim) * uK);
        ${END}
      }`,
  });
  const POURS = [[-205, 150, 9], [170, -175, 7]]; // x, z, radius: two jets beside the vessel, falling into the pit
  const WATER_TOP = PIT.top + 320;
  const jets = POURS.map(([x, z]) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 20, 24, true).translate(0, -0.5, 0), waterMat);
    m.position.set(x, WATER_TOP, z);
    m.renderOrder = 7;
    group.add(m);
    return m;
  });
  const blast = makePuffs({ count: 54, seed: 397, size: [130, 230] });
  blast.u.uBurst.value = 1;
  blast.u.uTop.value.copy(INK).multiplyScalar(0.92);
  blast.u.uBot.value.copy(SIG).multiplyScalar(1.6);
  blast.u.uAlpha.value = 0.5;
  blast.u.uCrisp.value = 1; // volutes, not a haze
  const flash = makeBall(SIG.clone().lerp(WHITE, 0.5));
  const drops = makeSparks({ count: 70, seed: 399, size: [1.4, 3.2] });
  drops.u.uDriven.value = 1;
  drops.u.uLife.value = 1.1;
  drops.u.uVS.value = 520;
  drops.u.uV0.value.set(0, 320, 0);
  drops.u.uG.value = 981;
  group.add(blast.points, flash.points, drops.points);

  /* ── the melt lights what is round it ── */
  const pitLight = new THREE.PointLight(BRAND.signal, 0, 0, 2);
  const sheetLight = new THREE.PointLight(BRAND.signal, 0, 0, 2);
  group.add(pitLight, sheetLight);

  const A = {
    breach: anchor(group, 0, VESSEL.low, 0),
    drop: anchor(group, 0, VESSEL.low, 0),
    pit: anchor(group, 0, 10, 0),
    front: anchor(group, 0, cy1, cz1),
    sheet: anchor(group, 0, CHAMBER.floor + 10, ZC),
    blast: anchor(group, 0, 60, 0),
  };

  // the area of the slab within a radius of a point (50 cm cells): what the melt's thickness is divided by
  const areaWithin = (sx, sz, R) => {
    let n = 0;
    const R2 = R * R;
    for (let i = 0; i < 20; i++) {
      const x = CHAMBER.x0 + (i + 0.5) * 50 - sx;
      for (let j = 0; j < 34; j++) {
        const z = CHAMBER.z0 + (j + 0.5) * 50 - sz;
        if (x * x + z * z < R2) n++;
      }
    }
    return n * 2500;
  };
  const VFULL = W * L * CHAMBER.sheet; // the melt, spread over the whole slab at `sheet` thick
  const MOUTH_X = CHANNEL.to[0];
  const MOUTH_Z = CHAMBER.z0;
  const DROP_T = 1.6; // s: one drop swells, lets go, falls
  const G = 981;

  /** P: belly breach pour pit fume flow mass spread arrows cool steam blast — 0–1; water (model.js), read only. */
  function update(P, time, px) {
    for (let i = 0; i < timed.length; i++) timed[i].uTime.value = time;

    /* the pit's pool: its radius, then its depth */
    const pitOn = P.pit > 0.004;
    const Rp = PIT.r * clamp01(P.pit / 0.3);
    const depth = pitOn ? 1.2 + 78.8 * clamp01((P.pit - 0.12) / 0.88) : 0;
    const poolY = pitOn ? depth + 0.6 : 0.6;

    /* the belly and its hole */
    const hole = P.breach > 0.01 ? 3 + 22 * P.breach : 0;
    belly.visible = P.belly > 0.01 || P.breach > 0.01;
    bellyU.uAmt.value = P.belly;
    bellyU.uHole.value = hole;
    const low = VESSEL.low - 2.5;

    /* the drop: swells (ph 0 → 0.5), lets go, falls at g, lands */
    const dropA = P.pour > 0.01 ? 1 - sm(0.55, 0.66, P.pour) : 0;
    const ph = (time / DROP_T + 0.35) % 1;
    const rdMax = 13 + 6 * P.breach;
    const neckMax = 16;
    const yDetach = low - neckMax - rdMax;
    const tauHit = Math.sqrt((2 * Math.max(yDetach - rdMax - poolY, 1)) / G);
    const phHit = 0.5 + tauHit / DROP_T;
    if (dropA > 0.01) {
      let rd, yc, nl, nr, stretch = 1;
      if (ph < 0.5) {
        const k = ph / 0.5;
        rd = rdMax * (0.35 + 0.65 * Math.pow(k, 0.7));
        nl = neckMax * k * k;
        nr = rd * (0.75 - 0.4 * k);
        yc = low - nl - rd * 0.9;
      } else {
        const tau = (ph - 0.5) * DROP_T;
        rd = rdMax;
        yc = yDetach - 0.5 * G * tau * tau;
        stretch = 1 + Math.min(0.9, (G * tau) / 1200);
        nl = neckMax * Math.max(0, 1 - tau / 0.12);
        nr = rd * 0.32 * Math.max(0, 1 - tau / 0.12) + 2.5;
      }
      const alive = ph < phHit;
      drop.visible = alive;
      drop.scale.set(rd * dropA, rd * stretch * dropA, rd * dropA);
      drop.position.set(0, yc, 0);
      neck.visible = nl > 0.5;
      neck.position.set(0, low + 1, 0);
      neck.scale.set(nr * dropA, nl + 1, nr * dropA);
      A.drop.position.set(0, alive ? yc : low, 0);
    } else {
      drop.visible = neck.visible = false;
      A.drop.position.set(0, low, 0);
    }
    const ti = (((ph - phHit) % 1) + 1) % 1 * DROP_T; // s since the last drop landed
    const ringOn = dropA * (ti < 0.9 ? 1 - ti / 0.9 : 0) * (pitOn ? 1 : 0);
    poolU.uImpact.value = 12 + 120 * ti;
    poolU.uImpAmp.value = 0.6 * ringOn;

    /* the stream: it runs down from the hole, thickens */
    const sLen = sm(0.5, 0.66, P.pour);
    const rs = (4 + 8 * P.breach) * (0.35 + 0.65 * sm(0.5, 0.75, P.pour));
    const streamOn = sLen > 0.005;
    const fallTo = Math.min(poolY, low - 1);
    stream.visible = streamHalo.visible = streamOn;
    if (streamOn) {
      const len = (low + 2 - fallTo) * sLen;
      stream.position.set(0, low + 2, 0);
      stream.scale.set(rs, len, rs);
      streamHalo.position.copy(stream.position);
      streamHalo.scale.set(rs * 2.8, len, rs * 2.8);
    }
    streamMat.uniforms.uWob.value = streamHaloMat.uniforms.uWob.value = streamOn ? 0.18 * rs : 0;
    streamHaloMat.uniforms.uK.value = 0.32 * sLen;
    // it comes in gulps (bulges running down it, from frame 0), gobs falling beside it
    streamMat.uniforms.uPulse.value = streamHaloMat.uniforms.uPulse.value = streamOn ? 0.34 * sm(0.5, 0.75, P.pour) : 0;
    globs.u.uAmount.value = sm(0.6, 0.9, sLen);
    globs.u.uO.value.set(0, low - 3, 0);
    globs.u.uV0.value.set(0, -60, 0);
    globs.u.uVS.value = 30;
    globs.u.uSpawn.value = rs * 2.2 + 3;
    globs.u.uG.value = G;
    globs.u.uLife.value = Math.sqrt((2 * Math.max(low - fallTo, 10)) / G) + 0.04;
    globs.u.uFloor.value = fallTo;
    const landed = sm(0.96, 1, sLen);
    collar.visible = landed > 0.01;
    collar.position.set(0, poolY + 1, 0);
    collar.scale.set(rs * 2.3 * landed, rs * 1.2 * landed, rs * 2.3 * landed);
    spray.u.uAmount.value = landed;
    spray.u.uO.value.set(0, poolY + 2, 0);
    spray.u.uV0.value.set(0, 140 + 10 * rs, 0);
    spray.u.uVS.value = 200 + 14 * rs;
    spray.u.uSpawn.value = rs * 1.4;
    spray.u.uLife.value = 0.75;
    spray.u.uG.value = G;
    spray.u.uFloor.value = poolY - 1;
    const dropFlash = dropA * Math.exp(-ti * 7) * (pitOn ? 1 : 0.6);
    impact.points.position.set(0, poolY + 4, 0);
    impact.u.uK.value = Math.max(1.5 * landed, 1.3 * dropFlash);
    impact.u.uSize.value = landed > 0.01 ? rs * 11 : 70;

    /* embers from round the hole */
    embers.u.uAmount.value = clamp01(P.belly * 1.2) * sm(0.05, 0.3, Math.max(P.breach, P.pour));
    embers.u.uO.value.set(0, low, 0);
    embers.u.uSpawn.value = 8 + hole * 1.6;
    embers.u.uV0.value.set(0, -30, 0);
    embers.u.uVS.value = 28;
    embers.u.uG.value = 700;
    embers.u.uLife.value = 1.2;
    embers.u.uFloor.value = poolY;

    /* the pool */
    pool.visible = pitOn;
    pool.position.y = poolY;
    poolU.uRp.value = Math.max(Rp, 1);
    poolU.uLobe.value = Rp < PIT.r - 20 ? 16 : 0;
    poolU.uWall.value = sm(0.26, 0.32, P.pit);
    poolU.uSwirl.value = 3 * sm(0, 0.2, P.flow);
    // the plug's ring under the bath: on `plug` > 0.2 when world.js passes it, else once the bath covers the floor
    poolU.uRingK.value = (P.plug !== undefined ? sm(0.2, 0.3, P.plug) : sm(0.3, 0.45, P.pit));
    wallGlow.visible = pitOn && poolU.uWall.value > 0.01;
    wallGlow.position.y = poolY - 1;
    wallGlow.scale.y = 26 + 22 * clamp01(P.pit);
    wallU.uK.value = 0.9 * poolU.uWall.value;
    A.pit.position.set(0, poolY, 0);
    fumes.u.uAmount.value = pitOn ? P.fume : 0;
    fumes.u.uMin.value.set(-PIT.r * 0.7, poolY + 10, -PIT.r * 0.7);
    fumes.u.uSize.value.set(PIT.r * 1.4, 60, PIT.r * 1.4);
    fumes.u.uTint.value = 0.25;

    /* the flow: the fall under the plug, then the tongue */
    const fallK = sm(0, 0.2, P.flow);
    fall.visible = P.flow > 0.002;
    fall.scale.set(26, Math.max(1, (PLUG.y - SHAFT.bottom) * fallK), 26);
    const F = P.flow > 0.17 ? 30 * sm(0.17, 0.2, P.flow) + clamp01((P.flow - 0.2) / 0.8) * (CH_LEN - 30) : 0;
    tongue.visible = F > 1;
    tongueU.uF.value = F;
    landing.u.uK.value = 1.3 * sm(0.15, 0.2, P.flow);
    landing.u.uSize.value = 140;
    A.front.position.set(0, cy0 + CH_DY * F + 16, cz0 + CH_DZ * F);

    /* the chamber's body */
    const fromMouth = sm(0.5, 0.9, P.flow);
    const sx = MOUTH_X * fromMouth + HEAP.at[0] * (1 - fromMouth);
    const sz = MOUTH_Z * fromMouth + HEAP.at[2] * (1 - fromMouth);
    const bodyOn = P.mass > 0.01;
    let thick = 0;
    if (bodyOn) {
      const rMax = fromMouth > 0.5 ? Math.hypot(500, L) + 80 : Math.hypot(W / 2, Math.max(CHAMBER.z1 - sz, sz - CHAMBER.z0)) + 80;
      const r0 = (1 - fromMouth) * HEAP.r * (0.55 + 0.45 * Math.sqrt(P.mass)) + fromMouth * 110;
      const R = r0 + (rMax - r0) * P.spread;
      const shape = Math.max(sm(0, 0.3, P.spread), 0.8 * fromMouth);
      const A_ = Math.max(areaWithin(sx, sz, R), 2500);
      const fill = 0.667 + (0.92 - 0.667) * shape;
      thick = Math.min(HEAP.h + (45 - HEAP.h) * fromMouth, Math.max(6, (P.mass * VFULL) / (A_ * fill)));
      bodyU.uSrc.value.set(sx, CHAMBER.floor, sz);
      bodyU.uR.value = R;
      bodyU.uH.value = thick;
      bodyU.uShape.value = shape;
      bodyU.uLobe.value = Math.min(80, 0.25 * R);
      bodyU.uEdge.value = Math.min(120, Math.max(30, 1.5 * thick)) * (0.6 + 0.4 * shape);
      bodyU.uAdv.value = Math.min(1, Math.pow(HEAP.r / R, 0.3));
      bodyU.uCool.value = P.cool;
      A.sheet.position.set(sx, CHAMBER.floor + thick, fromMouth > 0.5 ? Math.min(MOUTH_Z + R * 0.45, ZC) : sz);
      sheetLight.position.set(sx, CHAMBER.floor + 260, fromMouth > 0.5 ? Math.min(MOUTH_Z + R * 0.42, ZC + 300) : sz);
    }
    body.visible = bodyOn;
    sheetLight.intensity = bodyOn ? 6e5 * clamp01(P.mass) * (1 - 0.85 * P.cool) : 0;

    /* the arrows: tight and long when thick, sparse and short when thin */
    const arrowsOn = bodyOn && P.arrows > 0.01;
    bodyOver.visible = arrowsOn;
    arrowU.uK.value = P.arrows;
    const tk = clamp01((thick - CHAMBER.sheet) / (HEAP.h - CHAMBER.sheet));
    const sp = 96 + (48 - 96) * tk;
    const len = 34 + (150 - 34) * tk;
    const head = 18 + 12 * tk;
    const hr = 9 + 6 * tk;
    const sr = 3.5 + 2.2 * tk;
    // from a low camera (el ≈ 8°, looking from +z) the sheet, seen over the chamber's front wall, hides the arrows
    // that lie too far behind it: as it spreads, the row comes 6 m from the front — just under the wall's top line,
    // above the captions (at 1.5 m it fell into them)
    const zRow = sz + (CHAMBER.z1 - 600 - sz) * sm(0.3, 0.9, P.spread);
    for (let i = 0; i < N_ARROWS; i++) {
      const x = sx + (i - (N_ARROWS - 1) / 2) * sp;
      const yTop = CHAMBER.floor - 6;
      shafts[i].visible = heads[i].visible = arrowsOn;
      shafts[i].position.set(x, yTop, zRow);
      shafts[i].scale.set(sr, Math.max(1, len - head), sr);
      heads[i].position.set(x, yTop - (len - head), zRow);
      heads[i].scale.set(hr, head, hr);
    }

    /* steam: where the water touches the sheet */
    const wet = sm(0.76, 0.84, P.water);
    steam.u.uAmount.value = bodyOn ? P.steam * wet : 0;
    steam.u.uReach.value = 90 + 1100 * sm(0.8, 1.0, P.water);
    steam.u.uTint.value = 0.3 * (1 - P.cool);

    /* the blast: water poured on the pool, then the steam explosion */
    const b = P.blast;
    const jetK = sm(0, 0.05, b) * (1 - sm(0.3, 0.42, b));
    const jetFront = sm(0, 0.15, b);
    for (let i = 0; i < jets.length; i++) {
      jets[i].visible = jetK > 0.01;
      const r = POURS[i][2];
      jets[i].scale.set(r, Math.max(1, (WATER_TOP - poolY) * jetFront), r);
    }
    waterU.uK.value = jetK;
    const swell = sm(0.12, 0.3, b);
    const boom = sm(0.3, 0.62, b);
    const fallBack = sm(0.62, 1, b);
    const into = sm(0.28, 0.42, b);
    blast.u.uAmount.value = swell * (1 - sm(0.85, 1, b));
    blast.u.uBR.value = 30 + 80 * swell + 340 * boom;
    blast.u.uSink.value = 170 * fallBack;
    blast.u.uSizeK.value = 0.45 + 0.75 * boom + 0.3 * fallBack;
    blast.u.uAlpha.value = 0.62 * (1 - 0.6 * fallBack);
    blast.u.uTint.value = 0.5 - 0.3 * fallBack; // white steam, lit signal from the melt beneath
    blast.u.uC.value.set(POURS[0][0] * (1 - into), poolY + 20 + 30 * into, POURS[0][1] * (1 - into));
    const pulse = sm(0.3, 0.4, b) * (1 - sm(0.42, 0.75, b));
    flash.points.position.set(0, poolY + 60, 0);
    flash.u.uK.value = 2.2 * pulse;
    flash.u.uSize.value = 220 + 520 * boom;
    drops.u.uAge.value = sm(0.3, 0.8, b);
    drops.u.uAmount.value = sm(0.3, 0.33, b) * (1 - sm(0.75, 0.85, b));
    drops.u.uO.value.set(0, poolY + 4, 0);
    drops.u.uSpawn.value = PIT.r * 0.6;
    drops.u.uFloor.value = poolY - 2;
    A.blast.position.set(0, poolY + 60 + 120 * boom, 0);

    /* the light it throws */
    const pitGlow = (pitOn ? sm(0, 0.3, P.pit) : 0) + 0.5 * sLen + 0.25 * P.belly + 2.5 * pulse;
    pitLight.position.set(0, poolY + 140, 0);
    pitLight.intensity = 5e4 * pitGlow;

    /* the points know how big a pixel is */
    for (let i = 0; i < SCALED.length; i++) SCALED[i].uScale.value = px;
  }
  timed.push(embers.u, spray.u, globs.u, fumes.u, steam.u, blast.u, drops.u); // the particles run with the film too
  const SCALED = [embers.u, spray.u, globs.u, impact.u, fumes.u, landing.u, steam.u, blast.u, flash.u, drops.u];

  return { group, A, update };
}
