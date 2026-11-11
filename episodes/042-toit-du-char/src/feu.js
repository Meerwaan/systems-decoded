// DOSSIER 042 — the FIRE, and the next file. Centimetres, Y up, in the frame of plan.js (origin: the caisson's centre).
//
//   the column   what leaves by the roof (« le feu monte en colonne… au-dessus de vous »): a real volume, marched —
//                a white-hot mouth on the opening (PANEL x, z), a signal body that opens (FIRE.spread) and rolls at the
//                top, edges eaten by a slow turbulence that climbs, a top that dissolves into a dull ember and almost no
//                smoke. While the panel still sits on its push (blow < 0.1) the middle is under it: the flames leave by
//                its rim and lick up round it, the gap under it a white slit. It only ever leaves UPWARD.
//                It is marched twice: once before the glass of the tank, dimmed (what is seen through the X-ray turret:
//                from inside, « une lueur au-dessus du toit », never a white slab), once after it at full light where
//                nothing of glass stands in front — so the turret is cut out against the column. The march stops on
//                the flying panel (its flight is caisson.js's, recomputed here): the panel stays a plate in the fire.
//                Everything that climbs fades into the black before the header (screen y < 450): the labels keep their
//                contrast whatever the camera does.
//   fall         the column drops back into the opening from its top and dies; a few embers stay, falling.
//   the embers   streaks, not points: each is drawn from where it was 50 ms ago to where it is.
//   the glow     on the ground under the turret, on the grid's own lines (the ground is a grid, not a floor).
//   the teaser   (043, far away on its own floor): a glass tunnel in perspective, a thin beam that runs down it
//                (0 → 0.4), the glass silhouette of a launched train riding the beam (0.4 → 0.7), and at its end a
//                massive block that lights up and swallows them both (0.7 → 1: the train goes in, the beam's tail runs
//                in after it and goes out, the block's port ring stays veille). No figure, no logo.
//
// Nothing here is a hard cone, nothing is a veil; "the brightest wins" (MaxEquation) where light lies over light, so
// signal stays orange. `update` only writes uniforms and transforms: it is called for every instant of the shutter.
//
//   buildFeu() → { group, A, update(P, time, px, eye) }
//   P = { column, fall, blow, teaser, bench }    (blow: the panel's lift, read to open the column's mouth)
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, asShell, edgesOf, fatLine, solid, glow, setGlow, box, anchor } from "@kit/build3d.js";
import { PANEL, FIRE, TEASER, GROUND } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VIEW = new THREE.Vector2(BRAND.W, BRAND.H);
const TAU = Math.PI * 2;
const n = (x) => Number(x).toFixed(5);
const v3 = (c) => `vec3(${n(c.r)}, ${n(c.g)}, ${n(c.b)})`;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** The roof opening's half sizes (the panel covers it exactly). */
const HX = (PANEL.x[1] - PANEL.x[0]) / 2;
const HZ = (PANEL.z[1] - PANEL.z[0]) / 2;
/** Full light under HEAD.x, black from HEAD.y — in gl_FragCoord (from the bottom): 600 and 430 px from the top (the
 *  header ends at 410). */
const HEAD = new THREE.Vector2(BRAND.H - 600, BRAND.H - 430);
/** The panel's lift above its seat, as caisson.js flies it — for the march to stop behind the plate. */
const panelUp = (b) => (b < 0.15 ? (b / 0.15) * 40 : 40 + ((b - 0.15) / 0.85) ** 1.6 * PANEL.flight.up);
/** The column's height (cm above the opening): 0.15 the licks (≈ 0.7 m) · 0.4 a jet of 3 m · 1 FIRE.height. */
const columnHeight = (c) => (c < 0.4 ? (FIRE.height / 3) * (c / 0.4) : (FIRE.height / 3) * (1 + (2 * (c - 0.4)) / 0.6));
/** The ground's grid cell (char.js draws a GridHelper of 4000 cm in 80): the glow lights the same lines. */
const GRID_CELL = 50;

const GLSL = /* glsl */ `
  const float HX = ${n(HX)}; const float HZ = ${n(HZ)};
  const vec3 INK = ${v3(INK)}; const vec3 SIG = ${v3(SIGNAL)};`;

/* ───────────────────────────────────────────────────────────── a block of tileable noise (three octaves in one tap) */

function noiseVolume(size, seed) {
  const rand = rng(seed);
  const ease = (t) => t * t * (3 - 2 * t);
  const lattice = (cells) => {
    const g = new Float32Array(cells * cells * cells);
    for (let i = 0; i < g.length; i++) g[i] = rand();
    const at = (x, y, z) => g[((x % cells) * cells + (y % cells)) * cells + (z % cells)];
    return (u, v, w) => {
      const x = u * cells, y = v * cells, z = w * cells;
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      const fx = ease(x - xi), fy = ease(y - yi), fz = ease(z - zi);
      const l = (a, b, t) => a + (b - a) * t;
      return l(
        l(l(at(xi, yi, zi), at(xi, yi, zi + 1), fz), l(at(xi, yi + 1, zi), at(xi, yi + 1, zi + 1), fz), fy),
        l(l(at(xi + 1, yi, zi), at(xi + 1, yi, zi + 1), fz), l(at(xi + 1, yi + 1, zi), at(xi + 1, yi + 1, zi + 1), fz), fy),
        fx,
      );
    };
  };
  const o1 = lattice(4), o2 = lattice(8), o3 = lattice(16);
  const data = new Uint8Array(size * size * size);
  let i = 0;
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x + 0.5) / size, v = (y + 0.5) / size, w = (z + 0.5) / size;
        const value = (o1(u, v, w) + 0.5 * o2(u, v, w) + 0.25 * o3(u, v, w)) / 1.75;
        data[i++] = Math.round(255 * clamp01(0.5 + (value - 0.5) * 2.1));
      }
    }
  }
  const tex = new THREE.Data3DTexture(data, size, size, size);
  tex.format = THREE.RedFormat;
  tex.type = THREE.UnsignedByteType;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.RepeatWrapping;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}

/* ───────────────────────────────────────────────────────────── 1 · the column, marched */

/**
 * One draw of the column. `through`: its light (1 where nothing stands in front; 0.3 behind the tank's glass) ·
 * `steps`: how finely it is marched. The box it is drawn on is fitted to the column every frame (uBox0, uBox1).
 */
const columnMat = (SH, { through, steps }) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation, // light over light: the brightest wins, signal stays signal
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    defines: { STEPS: steps },
    uniforms: { ...SH, uThrough: { value: through }, uTint: { value: through < 1 ? 1 : 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      precision highp float; precision highp sampler3D;
      ${GLSL}
      uniform sampler3D uNoise;
      uniform vec3 uBase, uBox0, uBox1;
      uniform vec4 uPanel; // the flying panel: its centre (column frame) and its turn about z
      uniform vec2 uHead;
      uniform float uTime, uH, uCap, uGap, uGain, uThrough, uRoll, uTint;
      varying vec3 vWorld;

      float tap(vec3 p) { return texture(uNoise, p).r; }

      // x: how much fire · y: how hot (0 a dull ember → 1 white)
      vec2 field(vec3 p) {
        float H = max(uH, 8.0);
        float h = p.y;
        float u = h / H;
        if (u > 1.3) return vec2(0.0);
        float grow = smoothstep(0.0, 1.0, clamp(u, 0.0, 1.0));
        float roll = uRoll * smoothstep(0.58, 0.95, u);
        // a rectangle at the mouth (the opening), rounder and wider as it climbs; the top rolls out
        float wx = HX * (mix(1.0, 2.5, grow) + 0.95 * roll);
        float wz = HZ * (mix(1.0, 1.35, grow) + 0.45 * roll);
        vec2 e = abs(vec2(p.x / wx, p.z / wz));
        float pw = mix(6.0, 2.0, smoothstep(0.0, 0.4, u));
        float r = pow(pow(e.x, pw) + pow(e.y, pw), 1.0 / pw);
        if (r > 1.9) return vec2(0.0);
        // the turbulence climbs: big billows, finer licks warped by them
        float big = tap(vec3(p.x, h - uTime * 190.0, p.z) * (1.0 / 900.0) + vec3(0.13, 0.0, 0.57));
        float fine = tap(vec3(p.x, h - uTime * 320.0, p.z) * (1.0 / 260.0) + vec3(0.71, 0.29, 0.05) + (big - 0.5) * 0.25);
        float amp = mix(0.3, 0.75, smoothstep(0.0, 0.8, u));
        float rr = r + (big - 0.5) * amp * 1.6 + (fine - 0.5) * 0.5;
        float full = 1.0 - smoothstep(0.78, 1.0, rr);
        // under the panel the whole sheet burns; above it, while it still sits, the flames climb its rim
        float ring = smoothstep(0.7, 0.92, rr) * (1.0 - smoothstep(1.0, 1.16, rr));
        float under = (1.0 - step(uGap, h)) * uCap;
        float shape = mix(full, max(ring, full * under), uCap);
        float top = 1.0 - smoothstep(0.66, 1.0, u + (big - 0.5) * 0.45 + (fine - 0.5) * 0.3);
        float dens = shape * top * (0.6 + 0.8 * fine);
        // white only at the mouth and in a thin heart low in the jet; signal in its body, streaked by the licks that
        // climb it; a dull ember at its edges and its top
        float mid = 1.0 - smoothstep(0.25, 1.1, rr);
        float licks = 0.5 + 0.9 * fine * fine + 0.3 * big;
        float T = min(mid * mix(0.74, 0.36, smoothstep(0.0, 0.65, u)) * licks, 0.72) * (1.0 - 0.6 * uCap); // (white: the mouth only)
        T = max(T, (1.0 - smoothstep(0.0, 35.0 + 0.06 * H, h)) * (1.0 - smoothstep(0.5, 1.05, rr)) * (1.0 - 0.75 * uCap));
        T = max(T, uCap * ring * 0.42 * (1.0 - smoothstep(0.0, 1.0, u)) * licks);
        T = max(T, under * 0.62); // the slit under the panel: hot signal (the white would bloom over the whole close-up)
        return vec2(dens, clamp(T, 0.0, 1.0));
      }

      vec3 heat(float T) {
        vec3 c = mix(INK * 0.03, SIG * 0.18, smoothstep(0.0, 0.08, T)); // the smoke: barely
        c = mix(c, SIG * 1.0, smoothstep(0.08, 0.4, T));
        c = mix(c, SIG * 1.25, smoothstep(0.45, 0.7, T));
        return mix(c, INK * 1.9, smoothstep(0.8, 0.97, T)); // (a narrow step: the white replaces the orange, no pink band)
      }

      // where the ray meets the panel (a plate, solid): the march stops there
      float panelHit(vec3 ro, vec3 rd) {
        float s = sin(-uPanel.w), c = cos(-uPanel.w);
        vec3 o = ro - uPanel.xyz;
        vec3 q = vec3(c * o.x - s * o.y, s * o.x + c * o.y, o.z);
        vec3 d = vec3(c * rd.x - s * rd.y, s * rd.x + c * rd.y, rd.z);
        d = mix(d, vec3(1e-5), step(abs(d), vec3(1e-5)));
        vec3 hb = vec3(HX, 2.5, HZ);
        vec3 a = (-hb - q) / d, b = (hb - q) / d;
        vec3 lo = min(a, b), hi = max(a, b);
        float tn = max(max(lo.x, lo.y), lo.z), tf = min(min(hi.x, hi.y), hi.z);
        return tf > max(tn, 0.0) ? max(tn, 0.0) : 1e9;
      }

      void main() {
        vec3 ro = cameraPosition - uBase;
        vec3 rd = normalize(vWorld - cameraPosition);
        vec3 d = mix(rd, vec3(1e-5), step(abs(rd), vec3(1e-5)));
        vec3 a = (uBox0 - ro) / d, b = (uBox1 - ro) / d;
        vec3 lo = min(a, b), hi = max(a, b);
        float ta = max(max(lo.x, lo.y), max(lo.z, 0.0));
        float tb = min(min(hi.x, hi.y), hi.z);
        tb = min(tb, panelHit(ro, rd));
        if (tb <= ta) discard;
        float ds = (tb - ta) / float(STEPS);
        // a different offset at every instant of the shutter: the steps melt into one another
        float j = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))) + fract(uTime * 7.31));
        vec3 col = vec3(0.0);
        float tr = 1.0;
        for (int i = 0; i < STEPS; i++) {
          vec3 p = ro + rd * (ta + (float(i) + j) * ds);
          vec2 f = field(p);
          if (f.x > 0.003) {
            float al = 1.0 - exp(-f.x * 0.014 * ds);
            col += tr * al * heat(f.y);
            tr *= 1.0 - al;
            if (tr < 0.03) break;
          }
        }
        // through the glass: an orange glow, never a white slab
        col = mix(col, SIG * max(max(col.r, col.g), col.b), uTint);
        float fade = 1.0 - smoothstep(uHead.x, uHead.y, gl_FragCoord.y);
        gl_FragColor = vec4(col * (uGain * uThrough * fade), 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── 2 · the embers: streaks */

function makeEmbers(count, seed) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(12), 3));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute([0, -1, 0, 1, 1, -1, 1, 1], 2));
  geo.setIndex([0, 2, 1, 1, 2, 3]);
  const s = new Float32Array(count * 4);
  const k = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    s.set([rand(), 1.3 + rand() * 1.6, rand() * 2 - 1, rand() * 2 - 1], i * 4); // phase · period (s) · where on the mouth (x, z)
    k.set([rand(), rand() * TAU, 0.3 + rand() * 0.9, 0.7 + rand() * 0.8], i * 4); // reach · heading · spread · size
  }
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(s, 4));
  geo.setAttribute("aKick", new THREE.InstancedBufferAttribute(k, 4));
  geo.instanceCount = count;
  const uniforms = {
    uTime: { value: 0 }, uReach: { value: 300 }, uFall: { value: 0 }, uAmount: { value: 0 },
    uBase: { value: new THREE.Vector3(...FIRE.base) }, uView: { value: VIEW }, uHead: { value: HEAD },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      ${GLSL}
      uniform float uTime, uReach, uFall, uAmount; uniform vec3 uBase; uniform vec2 uView;
      attribute vec2 aCorner; attribute vec4 aSeed, aKick;
      varying vec2 vQ; varying float vGlow, vAge;
      vec3 at(float age) {
        // they climb with the column and slow down; when it dies they barely rise and sink back
        float reach = uReach * mix(0.3, 1.15, aKick.x) * (1.0 - 0.6 * uFall);
        float y = max(reach * (1.0 - (1.0 - age) * (1.0 - age)) - uFall * 0.6 * reach * age * age, 0.0);
        float spread = aKick.z * (25.0 + 0.3 * max(y, 0.0)) * age;
        vec2 lat = vec2(aSeed.z * HX, aSeed.w * HZ) * 0.9 + vec2(cos(aKick.y), sin(aKick.y)) * spread;
        lat += vec2(sin(age * 5.0 + aKick.y * 3.0), cos(age * 4.0 + aKick.x * 6.0)) * 14.0 * age;
        return uBase + vec3(lat.x, y, lat.y);
      }
      void main() {
        float age = fract(uTime / aSeed.y + aSeed.x);
        vec4 ch = projectionMatrix * viewMatrix * vec4(at(age), 1.0);
        vec4 ct = projectionMatrix * viewMatrix * vec4(at(max(age - 0.05 / aSeed.y, 0.0)), 1.0);
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        vQ = vec2(0.0); vGlow = 0.0; vAge = age;
        if (uAmount > 0.003 && ch.w > 10.0 && ct.w > 10.0) {
          vec2 ph = (ch.xy / ch.w * 0.5 + 0.5) * uView;
          vec2 pt = (ct.xy / ct.w * 0.5 + 0.5) * uView;
          float focal = 0.5 * uView.y * projectionMatrix[1][1];
          float w = clamp(aKick.w * 3.0 * focal / ch.w, 1.2, 3.0); // half its width, px (never under 2.4 px across)
          vec2 run = ph - pt;
          float l = length(run);
          vec2 dir = l > 0.5 ? run / l : vec2(0.0, 1.0);
          vec2 p = mix(pt, ph, aCorner.x) + dir * (aCorner.x * 2.0 - 1.0) * w + vec2(-dir.y, dir.x) * aCorner.y * w;
          gl_Position = vec4(p / uView * 2.0 - 1.0, ch.z / ch.w, 1.0);
          vQ = aCorner;
          vGlow = sin(3.14159 * age) * (0.8 + 0.4 * aKick.x);
        }
      }`,
    fragmentShader: /* glsl */ `
      ${GLSL}
      uniform float uAmount; uniform vec2 uHead;
      varying vec2 vQ; varying float vGlow, vAge;
      void main() {
        float across = 1.0 - vQ.y * vQ.y;
        float a = across * across * mix(0.3, 1.0, vQ.x) * vGlow * uAmount;
        vec3 c = mix(INK * 2.2, SIG * 1.8, smoothstep(0.05, 0.45, vAge));
        float fade = 1.0 - smoothstep(uHead.x, uHead.y, gl_FragCoord.y);
        gl_FragColor = vec4(c * (a * fade), 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 26;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── 3 · light on a grid */

/**
 * A disc on a floor that lights its grid's lines (and, very little, the dark between them) with `hue`: the column's
 * glow on the tank's ground, the teaser's own floor. `fall`: [radius where it stops, how wide the fade] · `pool`: a
 * soft light round `uAt` (the column's glow; the halo the teaser's block stands on).
 */
const gridMat = ({ hue, cell, fill = 0.06, line = 0.7, reach = 1050 }) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uHue: { value: hue.clone() }, uAt: { value: new THREE.Vector2() }, uPool: { value: new THREE.Vector3(400, 500, 0) },
      uAmount: { value: 0 }, uLines: { value: 0 }, uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue, uPool; uniform vec2 uAt; uniform float uAmount, uLines, uTime; varying vec3 vW;
      const float CELL = ${n(cell)}; const float REACH = ${n(reach)};
      void main() {
        vec2 q = vW.xz - uAt;
        float r = length(q);
        // the pool: a soft heart and a long tail (uPool: its heart, its tail, in cm)
        float pool = 0.75 * exp(-r * r / max(uPool.x * uPool.x, 1.0)) + 0.25 / (1.0 + r * r / max(uPool.y * uPool.y, 1.0));
        float edge = 1.0 - smoothstep(0.65 * REACH, REACH, r);
        vec2 g = abs(fract(vW.xz / CELL + 0.5) - 0.5) * CELL;
        vec2 w = max(fwidth(vW.xz), vec2(1e-3));
        vec2 ln = 1.0 - smoothstep(w * 0.9, w * 1.8, g);
        float l = max(ln.x, ln.y);
        l = mix(l, 0.3, smoothstep(CELL / 10.0, CELL / 5.0, max(w.x, w.y))); // finer than five pixels: the mean
        float a = (pool * uAmount * (${n(fill)} + ${n(line)} * l) + uLines * l * 0.5) * edge * (0.95 + 0.05 * sin(uTime * 1.6));
        gl_FragColor = vec4(uHue * a, 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── 4 · the teaser's beam: a capsule on the picture */

const beamMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    uniforms: {
      uA: { value: new THREE.Vector3() }, uB: { value: new THREE.Vector3() }, uView: { value: VIEW },
      uK: { value: new THREE.Vector3(0, 0, 0) }, uBall: { value: 0 }, uRadius: { value: 1.6 }, uRef: { value: 2600 },
    },
    vertexShader: /* glsl */ `
      uniform vec3 uA, uB; uniform vec2 uView; uniform float uRadius, uRef;
      attribute vec2 aCorner;
      varying vec2 vPa, vPb, vR;
      void main() {
        vec4 ca = projectionMatrix * viewMatrix * vec4(uA, 1.0);
        vec4 cb = projectionMatrix * viewMatrix * vec4(uB, 1.0);
        const float NEAR = 8.0;
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        vPa = vec2(0.0); vPb = vec2(1.0); vR = vec2(1.0);
        if (ca.w > NEAR || cb.w > NEAR) {
          if (ca.w < NEAR) ca = mix(ca, cb, (NEAR - ca.w) / (cb.w - ca.w));
          if (cb.w < NEAR) cb = mix(cb, ca, (NEAR - cb.w) / (ca.w - cb.w));
          vec2 pa = (ca.xy / ca.w * 0.5 + 0.5) * uView;
          vec2 pb = (cb.xy / cb.w * 0.5 + 0.5) * uView;
          vR = clamp(uRadius * sqrt(uRef / vec2(ca.w, cb.w)), vec2(1.1), vec2(3.2));
          float reach = 6.0 * 4.0 * max(vR.x, vR.y) + 4.0;
          vec2 run = pb - pa;
          float l = length(run);
          vec2 dir = l > 1e-3 ? run / l : vec2(0.0, 1.0);
          vec2 p = mix(pa, pb, aCorner.x) + dir * (aCorner.x * 2.0 - 1.0) * reach + vec2(-dir.y, dir.x) * aCorner.y * reach;
          gl_Position = vec4(p / uView * 2.0 - 1.0, mix(ca.z / ca.w, cb.z / cb.w, aCorner.x), 1.0);
          vPa = pa; vPb = pb;
        }
      }`,
    fragmentShader: /* glsl */ `
      ${GLSL}
      uniform vec3 uK; uniform float uBall;
      varying vec2 vPa, vPb, vR;
      void main() {
        vec2 p = gl_FragCoord.xy;
        vec2 ba = vPb - vPa;
        float t = clamp(dot(p - vPa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
        float d = length(p - vPa - ba * t);
        float r = max(mix(vR.x, vR.y, t), 1.0);
        // a core with a clear edge and a white heart, the hot sheath, a long halo
        float core = 1.0 - smoothstep(r - 0.7, r + 0.7, d);
        float sheath = exp(-d * d / (r * r * 5.0));
        float x = d / (r * 3.0);
        float halo = pow(1.0 + x * x, -1.5);
        vec3 col = SIG * (halo * uK.x + sheath * uK.y) + mix(SIG, INK, 0.6) * (core * uK.z);
        // its head: a ball of light where the beam is now (and where it strikes the block)
        float dh = length(p - vPb);
        float rh = r * 4.0;
        float ball = exp(-dh * dh / (rh * rh)) + 0.3 * pow(1.0 + dh * dh / (rh * rh * 9.0), -1.2);
        col = max(col, mix(SIG, INK, 0.55) * (ball * uBall));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });

function quad(material, order) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(12), 3));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute([0, -1, 0, 1, 1, -1, 1, 1], 2));
  geo.setIndex([0, 2, 1, 1, 2, 3]);
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
}

/** A launched train, a silhouette: a power car with a long nose (+x) and one car behind. Its nose tip at x 0, floor at y 0. */
function makeTrain(mat, lines) {
  const train = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(0, 10);
  s.lineTo(0, 138);
  s.quadraticCurveTo(0, 150, 12, 150);
  s.lineTo(230, 150);
  s.bezierCurveTo(322, 150, 396, 116, 418, 46);
  s.quadraticCurveTo(426, 0, 392, 0);
  s.lineTo(10, 0);
  s.quadraticCurveTo(0, 0, 0, 10);
  const noseGeo = new THREE.ExtrudeGeometry(s, { depth: 100, bevelEnabled: true, bevelThickness: 6, bevelSize: 6, bevelSegments: 2, curveSegments: 18 });
  noseGeo.translate(-424, 0, -50);
  const power = new THREE.Mesh(noseGeo, mat);
  const car = new THREE.Mesh(box(380, 150, 112, 14), mat);
  car.position.set(-424 - 30 - 190, 75, 0);
  train.add(power, car);
  asShell([power, car], 17);
  // the band of windows, both sides
  for (const z of [-58, 58]) {
    for (const [a, b] of [[-404, -170], [-820, -468]]) {
      const l = fatLine([[a, 108, z], [b, 108, z]], { color: BRAND.signal, width: 2.6, opacity: 0.8 });
      lines.push(l);
      train.add(l);
    }
  }
  return train;
}

/* ───────────────────────────────────────────────────────────── the builder */

export function buildFeu() {
  const group = new THREE.Group();
  const noise = noiseVolume(64, 42);

  /* ── the column ── */
  const column = new THREE.Group();
  column.position.set(...FIRE.base);
  const SH = {
    uNoise: { value: noise }, uTime: { value: 0 }, uBase: { value: new THREE.Vector3(...FIRE.base) },
    uBox0: { value: new THREE.Vector3() }, uBox1: { value: new THREE.Vector3() }, uPanel: { value: new THREE.Vector4() },
    uHead: { value: HEAD }, uH: { value: 100 }, uCap: { value: 1 }, uGap: { value: 0 }, uGain: { value: 0 }, uRoll: { value: 0 },
  };
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const behindGlass = new THREE.Mesh(boxGeo, columnMat(SH, { through: 0.3, steps: 26 }));
  behindGlass.renderOrder = 6; // before the tank's glass: what is seen through it, dimmed
  const open = new THREE.Mesh(boxGeo, columnMat(SH, { through: 1, steps: 44 }));
  open.renderOrder = 26; // after the glass's depth: only where nothing of glass stands in front
  column.add(behindGlass, open);
  group.add(column);

  const embers = makeEmbers(70, 17);
  group.add(embers.mesh);

  /* ── the glow on the ground ── */
  const poolMat = gridMat({ hue: SIGNAL, cell: GRID_CELL, fill: 0.06, line: 0.7, reach: 1050 });
  poolMat.uniforms.uAt.value.set(-60, 0); // under the turret's rear, toward the gun: it lights the underside of both
  poolMat.uniforms.uPool.value.set(420, 520, 0);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1050, 72).rotateX(-Math.PI / 2), poolMat);
  pool.position.set(-60, GROUND.y + 0.4, 0);
  pool.renderOrder = 4;
  group.add(pool);

  /* ── the 043 teaser: on its own floor, far away ── */
  const teaser = new THREE.Group();
  teaser.position.set(...TEASER.at);
  const AXIS = TEASER.r + 20; //                    the beam's height above the teaser's floor
  // the tunnel: from its near end (−x, toward the camera, off the picture) to the block's face (+x) on the teaser's
  // origin — the point the camera looks at. The whole maquette is turned 10° about y: at the acts' az −40 → −56 the
  // camera looks down the tunnel 30° to 14° off its axis — the tunnel runs out of the picture at the bottom left, the
  // block's face is seen three-quarters
  teaser.rotation.y = 10 * (Math.PI / 180);
  const X1 = 0, X0 = X1 - TEASER.tunnel;
  const BLOCK = { l: 600, h: 280, w: 400 };
  const BX = X1 + BLOCK.l / 2; //                   the block's centre (x)

  // the floor: a grid, and a halo under the block
  const floorMat = gridMat({ hue: INK, cell: 100, fill: 0.5, line: 0.5, reach: 2600 });
  floorMat.uniforms.uPool.value.set(700, 1100, 0);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(2600, 96).rotateX(-Math.PI / 2), floorMat);
  floor.position.set(BX - 500, 0.3, 0);
  floor.renderOrder = 4;
  teaser.add(floor);

  // the tunnel: glass, and its frames every 1.5 m
  const tunnelMat = glass(BRAND.ink, { base: 0, rim: 0.22, power: 2.6, edge: 0.5, through: 0.18 });
  const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(TEASER.r, TEASER.r, TEASER.tunnel, 64, 1, true).rotateZ(Math.PI / 2), tunnelMat);
  tunnel.position.y = AXIS;
  asShell([tunnel], 20);
  teaser.add(tunnel);
  const tunnelLines = [];
  for (let x = X0; x <= X1 - 100; x += 150) {
    const pts = [];
    for (let i = 0; i <= 48; i++) pts.push([x, AXIS + (TEASER.r + 1.5) * Math.cos((i / 48) * TAU), (TEASER.r + 1.5) * Math.sin((i / 48) * TAU)]);
    const ring = fatLine(pts, { width: 2, opacity: 0.4 });
    tunnelLines.push(ring);
    teaser.add(ring);
  }
  for (const z of [-0.7, 0.7]) {
    // the two rails along its floor
    const rail = fatLine([[X0, AXIS - TEASER.r * Math.cos(Math.asin(z)) + 2, z * TEASER.r], [X1, AXIS - TEASER.r * Math.cos(Math.asin(z)) + 2, z * TEASER.r]], { width: 2, opacity: 0.32 });
    tunnelLines.push(rail);
    teaser.add(rail);
  }

  // the beam (drawn before the glass: it shows through the tunnel and the train)
  const bMat = beamMat();
  const beam = quad(bMat, 5);
  group.add(beam); // in world coordinates (uA, uB)

  // the train
  // the train is the beam's energy: signal glass, so that it reads apart from the ink tunnel it rides in
  const trainMat = glass(BRAND.signal, { base: 0.03, rim: 0.55, power: 2.0, edge: 0.9, spec: 0, through: 0.25 });
  const trainLines = [];
  const train = makeTrain(trainMat, trainLines);
  train.position.y = AXIS - 75;
  teaser.add(train);

  // the block, solid: three greys — its mass, the plate on its face, the ring of its port — and its port ring, veille
  const blockMat = solid(0x5f666c, { rough: 0.66, metal: 0.2 });
  const plateMat = solid(0x959ba0, { rough: 0.5, metal: 0.3 });
  const ringMat = solid(0xc2c6c9, { rough: 0.38, metal: 0.4 });
  const portMat = solid(0x14171a, { rough: 0.9, metal: 0 });
  const blockGeo = box(BLOCK.l, BLOCK.h, BLOCK.w, 6);
  const blockMesh = new THREE.Mesh(blockGeo, blockMat);
  blockMesh.position.set(BX, BLOCK.h / 2, 0);
  const blockEdges = edgesOf(blockGeo, { width: 2, opacity: 0.7 });
  blockMesh.add(blockEdges);
  const plateGeo = box(14, 230, 230, 3);
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.set(X1 - 7, AXIS + 5, 0);
  const plateEdges = edgesOf(plateGeo, { width: 2, opacity: 0.6 });
  plate.add(plateEdges);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(TEASER.r * 0.62, 9, 16, 72).rotateY(Math.PI / 2), ringMat);
  ring.position.set(X1 - 16, AXIS, 0);
  const port = new THREE.Mesh(new THREE.CircleGeometry(TEASER.r * 0.6, 48).rotateY(-Math.PI / 2), portMat);
  port.position.set(X1 - 15, AXIS, 0);
  const liveMat = glow(BRAND.veille, 0, { additive: true });
  const live = new THREE.Mesh(new THREE.TorusGeometry(TEASER.r * 0.62 + 16, 2.6, 8, 96).rotateY(Math.PI / 2), liveMat);
  live.position.set(X1 - 17, AXIS, 0);
  live.renderOrder = 7;
  teaser.add(blockMesh, plate, ring, port, live);
  const SOLIDS = [blockMat, plateMat, ringMat].map((m) => [m, m.color.clone()]);
  for (const m of [blockMat, plateMat, ringMat, portMat]) m.userData.finish = false; // a block this big: no tool marks
  group.add(teaser);

  const A = {
    column: anchor(column, 0, FIRE.height * 0.5, 0),
    top: anchor(column, 0, FIRE.height, 0),
    teaser: anchor(teaser, 0, AXIS, 0),
    block: anchor(teaser, X1, AXIS, 0),
  };

  // where the beam's ends stand along the tunnel, in the teaser's frame (x), turned into world points in update
  const BEAM_FROM = X0 - 300; // its tail: just behind the near end, off the picture (in front of the lens)
  const BEAM_IN = X1 - 40; //    its head where it strikes: just before the block's face
  const ux = Math.cos(teaser.rotation.y), uz = -Math.sin(teaser.rotation.y); // the tunnel's axis, in the world
  const tx = TEASER.at[0], ty = TEASER.at[1] + AXIS, tz = TEASER.at[2];

  return {
    group, A,
    /** Every frame, sixteen times: depends on P and time only, allocates nothing. */
    update(P, time) {
      const on = P.bench ? 0 : 1;

      /* ── the column ── */
      const mouth = clamp01(P.blow / 0.05); // no mouth, no column
      const c = clamp01(P.column) * mouth * on;
      const fall = clamp01(P.fall);
      const alive = c * (1 - smooth(0.9, 1, fall));
      column.visible = alive > 0.002;
      pool.visible = column.visible;
      if (column.visible) {
        const H = Math.max(25, columnHeight(c) * (1 - smooth(0, 1, fall) * 0.97));
        const b = clamp01(P.blow);
        const up = panelUp(b);
        const roll = smooth(0.55, 1, c);
        const hx = HX * (2.1 + 0.95 * roll) * 1.25 + 30;
        const hz = HZ * (1.35 + 0.45 * roll) * 1.25 + 30;
        const y1 = H * 1.3 + 30;
        SH.uBox0.value.set(-hx, 1, -hz); // (its floor a hair over the turret's roof: seen from under the roof, it is behind glass)
        SH.uBox1.value.set(hx, y1, hz);
        open.scale.set(2 * hx, y1 - 1, 2 * hz);
        open.position.y = (y1 + 1) / 2;
        behindGlass.scale.copy(open.scale);
        behindGlass.position.y = open.position.y;
        SH.uTime.value = time;
        SH.uH.value = H;
        SH.uRoll.value = roll * (1 - fall);
        SH.uCap.value = 1 - smooth(0.07, 0.16, b);
        SH.uGap.value = Math.max(0, up - 2.5);
        SH.uPanel.value.set(PANEL.flight.drift[0] * b, up - 1.25, PANEL.flight.drift[2] * b, b * PANEL.flight.turns * TAU * 0.3);
        SH.uGain.value = 1.12 * smooth(0, 0.06, c) * (1 - 0.45 * fall);
        poolMat.uniforms.uAmount.value = Math.min(1, c * 1.1) * (1 - fall);
        poolMat.uniforms.uTime.value = time;
      }
      const ember = on * (smooth(0.1, 0.45, c) * (1 - fall) + 0.3 * smooth(0.05, 0.3, c) * smooth(0, 0.3, fall) * (1 - smooth(0.85, 1, fall)));
      embers.mesh.visible = ember > 0.003;
      embers.uniforms.uTime.value = time;
      embers.uniforms.uReach.value = 160 + columnHeight(c) * 0.85;
      embers.uniforms.uFall.value = fall;
      embers.uniforms.uAmount.value = ember;

      /* ── the teaser ── */
      const t = on * clamp01(P.teaser);
      const shown = t > 0.002;
      teaser.visible = shown;
      beam.visible = shown;
      if (!shown) return;
      const come = smooth(0, 0.05, t);
      tunnelMat.uniforms.uAmount.value = come;
      for (const l of tunnelLines) l.material.opacity = l.material.userData.base * come;
      // the block: in the dark at first, it lights up just before its word
      const lit = 0.3 + 0.7 * smooth(0.56, 0.7, t);
      for (const [m, base] of SOLIDS) m.color.copy(base).multiplyScalar(lit * come);
      blockEdges.material.opacity = 0.7 * lit * come;
      plateEdges.material.opacity = 0.6 * lit * come;
      floorMat.uniforms.uAmount.value = (0.1 + 0.16 * smooth(0.56, 0.7, t)) * come;
      floorMat.uniforms.uLines.value = 0.16 * come;
      floorMat.uniforms.uAt.value.set(BX, 0);
      setGlow(liveMat, 1.7 * smooth(0.72, 0.84, t));
      // the beam: it runs (0 → 0.4), holds, then its tail runs into the block and it goes out (0.72 → 0.94)
      const head = t < 0.4 ? X0 - 1200 + (t / 0.4) * (BEAM_IN - X0 + 1200) : BEAM_IN;
      const tail = BEAM_FROM + smooth(0.72, 0.94, t) * (BEAM_IN - BEAM_FROM);
      const beamOn = smooth(0, 0.03, t) * (1 - smooth(0.9, 0.95, t));
      bMat.uniforms.uA.value.set(tx + tail * ux, ty, tz + tail * uz);
      bMat.uniforms.uB.value.set(tx + head * ux, ty, tz + head * uz);
      bMat.uniforms.uK.value.set(0.32 * beamOn, 0.75 * beamOn, 2.2 * beamOn);
      const strike = smooth(0.38, 0.42, t);
      bMat.uniforms.uBall.value = beamOn * (t < 0.4 ? 1.3 : 0.8 + 1.1 * smooth(0.68, 0.74, t) * (1 - smooth(0.78, 0.9, t))) * (1 - 0.3 * strike * (1 - smooth(0.66, 0.7, t)));
      // the train: launched, on the beam, from the near end; the block swallows it, slowing it down
      const trainOn = smooth(0.4, 0.46, t) * (1 - smooth(0.93, 0.95, t));
      train.visible = trainOn > 0.002;
      if (train.visible) {
        const LEN = 834;
        let nose;
        if (t < 0.7) nose = X0 - 250 + ((t - 0.4) / 0.3) * (X1 - X0 + 250);
        else {
          const s = clamp01((t - 0.7) / 0.244);
          nose = X1 + LEN * (1 - (1 - s) * (1 - s));
        }
        train.position.x = nose;
        trainMat.uniforms.uAmount.value = trainOn;
        for (const l of trainLines) l.material.opacity = l.material.userData.base * trainOn;
      }
    },
  };
}
