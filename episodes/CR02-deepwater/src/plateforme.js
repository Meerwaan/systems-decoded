// CR02 — plateforme.js : the rig at night, its sea, the riser down to the seabed (plan.js SEA, PONTOONS, COLUMNS, DECK, DRILL,
// DERRICK, RISER, SEABED_BOP, JET). « Le noir chaud »: satin clay maquette under the studio key and the amber spot. Nothing is cut:
// the SEA stops at the aquarium edge x = SEA.cut, so a camera at x < SEA.cut sees under the surface (the riser, the BOP, the seabed).
//   buildPlateforme() → { group, A, haloR, update(S, time, px) }
//   A: focus, fault (the BOP proxy on the seabed: the halo's place), hole (the rotary table), crown (the derrick's top),
//      riser (the riser's mid-point), bop (the BOP proxy), deck
//   reads S: jet spill blast fire sink lamps
//
// What it is made of:
//   · group (fixed): the SEA — a shader surface, warm black, its swell in the normals, the rig's lights mirrored in broken columns, an
//     amber glitter path; seen from below a dark ceiling where the light plays — the light line of the aquarium edge, motes in the water,
//     the RISER (it follows the sinking rig), the BOP proxy on the wellhead
//   · rig (a pivot at the waterline: it lists and goes down with `sink`) → body: pontoons, columns, deck, machines, crane, helideck,
//     the drill floor and its rotary table, the DERRICK (one merged lattice: legs, girts, X braces, crown), the lamps
//   · the blowout: `jet` a tube of mud (shader: dark, wet glints running up, the red gas through its tears and inside, a head that
//     flares and tears) + a red light at the hole that lights the lattice from inside + instanced drops falling back + a red mist at
//     the head · `spill` the mud sheet on the drill floor, then on the deck (glossy, boiling) · `blast` a flash that has a place and a
//     fireball · `fire` flames, a hot core, embers, dark smoke, the deck glowing in cells · `sink` the hull lists and goes under
//   · a back-light: an amber halo set BEHIND the derrick from wherever the camera is (onBeforeRender) — the tower always reads dark on light
// Everything depends on S and `time` only; update() allocates nothing (it runs sixteen times per frame).
import * as THREE from "three";
import { box, cyl, mergeGeometries, fatLine } from "@kit/build3d.js";
import { clay, clayEdges, RECON } from "@kit/reconstitution.js";
import { rng } from "@kit/rng.js";
import { SEA, PONTOONS, COLUMNS, DECK, DRILL, DERRICK, RISER, SEABED_BOP, JET } from "./plan.js";

const TAU = Math.PI * 2;
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const bump = (x, c, w) => {
  const u = (x - c) / w;
  return u * u < 1 ? (1 - u * u) * (1 - u * u) : 0;
};
const UP = new THREE.Vector3(0, 1, 0);

const C_AMBER = new THREE.Color(RECON.ambre);
const C_RED = new THREE.Color(RECON.alarme);
const C_PAPER = new THREE.Color(RECON.papier);
const C_BG = new THREE.Color(RECON.bg);
const C_FIRE = C_RED.clone().lerp(C_AMBER, 0.35); // the fire's body: red going amber
const C_HOT = C_AMBER.clone().lerp(C_PAPER, 0.45); // the fire's core: amber going white
const C_MUD = new THREE.Color(0x1d120c); // brown-black drilling mud

const GLSL_NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float pnoise(vec2 p, float per) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    float i0 = mod(i.x, per); float i1 = mod(i.x + 1.0, per);
    return mix(mix(hash(vec2(i0, i.y)), hash(vec2(i1, i.y)), f.x), mix(hash(vec2(i0, i.y + 1.0)), hash(vec2(i1, i.y + 1.0)), f.x), f.y);
  }`;

/* ───────── a beam between two points (the lattice is baked from them) ───────── */
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _q = new THREE.Quaternion();
function beam(a, b, t) {
  _a.set(...a);
  _b.set(...b);
  const len = _a.distanceTo(_b);
  const g = new THREE.BoxGeometry(t, len, t);
  _q.setFromUnitVectors(UP, _b.clone().sub(_a).normalize());
  g.applyQuaternion(_q);
  g.translate((_a.x + _b.x) / 2, (_a.y + _b.y) / 2, (_a.z + _b.z) / 2);
  return g;
}

/* ───────── what flies: flames, smoke, embers, mist, motes (points placed in the shader, from a seed and the time) ───────── */
function makePuffs({ count, seed, origin, vel, life = 1, size = [2, 10], rise = 0, wobble = 0, soft = 1.6, color, additive = false, burst = false, maxPx = 320, clip = false, top = [1e5, 1e5 + 1], hot = null, edge = null, vmax = 1 }) {
  const rand = rng(seed);
  const o = new Float32Array(count * 3);
  const v = new Float32Array(count * 3);
  const s = new Float32Array(count * 4);
  const tmpO = [0, 0, 0];
  const tmpV = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    origin(rand, tmpO, i);
    vel(rand, tmpV, tmpO, i);
    o.set(tmpO, i * 3);
    v.set(tmpV, i * 3);
    s[i * 4] = rand();
    s[i * 4 + 1] = 0.7 + 0.6 * rand();
    s[i * 4 + 2] = 0.6 + 0.8 * rand();
    s[i * 4 + 3] = 0.45 + 0.55 * rand();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(o, 3));
  geo.setAttribute("aVel", new THREE.BufferAttribute(v, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(s, 4));
  const uniforms = {
    uTime: { value: 0 },
    uS: { value: 0 },
    uAmount: { value: 0 },
    uPx: { value: 1000 },
    uLife: { value: life },
    uSize0: { value: size[0] },
    uSize1: { value: size[1] },
    uRise: { value: rise },
    uWobble: { value: wobble },
    uSoft: { value: soft },
    uMaxPx: { value: maxPx },
    uBurst: { value: burst ? 1 : 0 },
    uOff: { value: new THREE.Vector3() },
    uClip: { value: clip ? SEA.y : -1e5 }, // world y under which nothing shows (the fire goes out under the sea)
    uTop0: { value: top[0] },
    uTop1: { value: top[1] }, // world y over which it fades into the black (under the header)
    uColor: { value: new THREE.Color(color) },
    uRamp: { value: hot && edge ? 1 : 0 }, // retouche: the fireball's colour runs hot core → fire → smoke, by speed (rim) and age
    uHot: { value: new THREE.Color(hot ?? color) },
    uEdge: { value: new THREE.Color(edge ?? color) },
    uVmax: { value: vmax },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uS, uAmount, uPx, uLife, uSize0, uSize1, uRise, uWobble, uMaxPx, uBurst, uClip, uTop0, uTop1;
      uniform vec3 uOff; uniform float uVmax;
      attribute vec3 aVel; attribute vec4 aSeed; varying float vA; varying float vF; varying float vK;
      void main() {
        float life = uLife * aSeed.y;
        float f = uBurst > 0.5 ? clamp(uS, 0.0, 1.0) : fract(uTime / life + aSeed.x);
        float age = f * life;
        vec3 p = position + uOff + aVel * age + vec3(0.0, 0.5 * uRise * age * age, 0.0);
        p.x += uWobble * f * sin(uTime * 0.9 + aSeed.x * 17.0);
        p.z += uWobble * f * cos(uTime * 0.7 + aSeed.x * 11.0);
        vec4 wp = modelMatrix * vec4(p, 1.0);
        vec4 mv = viewMatrix * wp;
        float size = mix(uSize0, uSize1, f) * aSeed.z;
        gl_PointSize = clamp(size * uPx / max(1.0, -mv.z), 0.0, uMaxPx);
        gl_Position = projectionMatrix * mv;
        float fade = uBurst > 0.5
          ? smoothstep(0.0, 0.04, f) * (1.0 - smoothstep(0.6, 1.0, f))
          : smoothstep(0.0, 0.1, f) * pow(clamp(1.0 - f, 0.0, 1.0), 1.4);
        float keep = step(uClip, wp.y) * (1.0 - smoothstep(uTop0, uTop1, wp.y));
        vA = uAmount * aSeed.w * fade * keep;
        vF = f;
        vK = clamp(length(aVel) / uVmax, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uHot, uEdge; uniform float uSoft, uRamp; varying float vA; varying float vF; varying float vK;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float r2 = dot(q, q) * 4.0;
        if (r2 > 1.0 || vA < 0.002) discard;
        float a = vA * pow(clamp(1.0 - r2, 0.0, 1.0), uSoft);
        vec3 col = uColor;
        if (uRamp > 0.5) {
          float heat = (1.0 - smoothstep(0.35, 0.8, vK)) * (1.0 - smoothstep(0.12, 0.6, vF)) * (1.0 - 0.6 * r2);
          col = mix(uColor, uHot, clamp(1.5 * heat, 0.0, 1.0));
          float soot = clamp(0.95 * smoothstep(0.5, 1.0, vK) + 0.9 * smoothstep(0.3, 0.95, vF) + 0.3 * r2 - 0.15, 0.0, 1.0);
          col = mix(col, uEdge, soot);
        }
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 5;
  return { points, u: uniforms };
}

// a light that has a place: a bright core and a long tail (computed, not drawn)
function glowTexture() {
  const N = 64;
  const data = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const r = Math.hypot((x + 0.5) / N - 0.5, (y + 0.5) / N - 0.5) * 2;
      const a = Math.min(1, Math.exp(-r * r * 26) * 0.9 + Math.exp(-r * 4.2) * 0.45) * (1 - smooth(0.82, 1, r));
      const k = (y * N + x) * 4;
      data[k] = data[k + 1] = data[k + 2] = 255;
      data[k + 3] = Math.round(a * 255);
    }
  const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
const glowSprite = (tex, scale) => {
  const mat = new THREE.SpriteMaterial({ map: tex, color: 0x000000, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
  const s = new THREE.Sprite(mat);
  s.scale.set(scale, scale, 1);
  s.renderOrder = 6;
  return s;
};

/* ───────── the lamps: small lights with a place, a size in cm, never past a few pixels' blur ───────── */
function makeLamps(points, size) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
  const uniforms = { uAmount: { value: 1 }, uPx: { value: 1000 }, uSize: { value: size }, uColor: { value: C_AMBER.clone().lerp(C_PAPER, 0.35).multiplyScalar(1.7) } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uPx, uSize;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(uSize * uPx / max(1.0, -mv.z), 3.0, 70.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float r = length(q) * 2.0;
        if (r > 1.0 || uAmount < 0.002) discard;
        float a = exp(-r * r * 14.0) + 0.22 * exp(-r * 3.5) * (1.0 - r);
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
  const p = new THREE.Points(geo, mat);
  p.frustumCulled = false;
  p.renderOrder = 6;
  return { points: p, u: uniforms };
}

/* ───────── the sea: warm black and glossy from above, a dark ceiling from below ───────── */
function seaMaterial() {
  const uniforms = {
    uTime: { value: 0 },
    uO: { value: new THREE.Vector3() }, // the rig's axis on the waterline, world (follows the sinking)
    uJet: { value: 0 },
    uFire: { value: 0 },
    uLamps: { value: 1 },
    uFoam: { value: 1 },
    uL: { value: new THREE.Vector3(0.84, 0.2, -0.5).normalize() }, // a low light behind the rig: the glitter path
    uBg: { value: C_BG.clone() },
    uAmb: { value: C_AMBER.clone() },
    uRed: { value: C_RED.clone() },
    uFireC: { value: C_FIRE.clone() },
    uPap: { value: C_PAPER.clone() },
  };
  const cols = COLUMNS.at.map(([x, z]) => `vec2(${x.toFixed(1)}, ${z.toFixed(1)})`).join(", ");
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uJet, uFire, uLamps, uFoam;
      uniform vec3 uO, uL, uBg, uAmb, uRed, uFireC, uPap;
      varying vec3 vW;
      const vec2 COLS[4] = vec2[4](${cols});
      vec2 wave(vec2 p, float lod) {
        vec2 g = vec2(0.0);
        vec2 d; float k;
        d = normalize(vec2(1.0, 0.3));   k = 0.045; g += d * (1.1 * k * cos(dot(d, p) * k + uTime * 0.55));
        d = normalize(vec2(0.6, -0.8));  k = 0.07;  g += d * (0.75 * k * cos(dot(d, p) * k + uTime * 0.72 + 1.7));
        d = normalize(vec2(-0.3, 1.0));  k = 0.11;  g += d * (0.42 * k * cos(dot(d, p) * k + uTime * 0.93 + 0.4));
        d = normalize(vec2(0.9, 0.5));   k = 0.21;  g += d * (0.2 * lod * k * cos(dot(d, p) * k + uTime * 1.31 + 2.2));
        d = normalize(vec2(-0.7, 0.6));  k = 0.37;  g += d * (0.11 * lod * k * cos(dot(d, p) * k + uTime * 1.83 + 4.1));
        return g;
      }
      float lightAt(vec3 P, vec3 R, float h, vec2 c, float rr) {
        float t = (h - P.y) / max(R.y, 0.03);
        vec2 q = P.xz + R.xz * t - c;
        return exp(-dot(q, q) / (rr * rr));
      }
      void main() {
        vec2 p = vW.xz;
        float cmpx = length(fwidth(p));
        float lod = 1.0 - smoothstep(1.2, 4.5, cmpx);
        vec2 g = wave(p, lod);
        vec2 c = uO.xz;
        float rr = length(p - c);
        float far = smoothstep(820.0, 1260.0, rr);
        // the waterline around the columns: a thin light line where they pierce the surface
        float foam = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 dq = abs(p - (COLS[i] + c)) - vec2(${(COLUMNS.r - 3).toFixed(1)});
          float dd = length(max(dq, 0.0)) - 3.0;
          foam += exp(-max(dd, 0.0) / 1.1) * step(-0.4, dd);
        }
        foam *= uFoam * (0.75 + 0.25 * sin(uTime * 1.1 + rr * 0.3));
        vec3 col;
        if (gl_FrontFacing) {
          vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
          vec3 V = normalize(cameraPosition - vW);
          float ndv = clamp(dot(N, V), 0.0, 1.0);
          float fres = 0.03 + 0.97 * pow(1.0 - ndv, 5.0);
          vec3 R = reflect(-V, N);
          // the night: warm black, a little lighter toward the horizon
          vec3 refl = uBg * (0.9 + 2.2 * pow(clamp(1.0 - R.y, 0.0, 1.0), 6.0));
          if (R.y > 0.0) {
            float hy = uO.y;
            // the deck's corner lamps and the derrick's floods: small sources, the swell breaks them into columns
            float lampR = lightAt(vW, R, hy + 83.0, c + vec2(-74.0, 65.0), 5.0) + lightAt(vW, R, hy + 83.0, c + vec2(-74.0, -65.0), 5.0)
              + lightAt(vW, R, hy + 83.0, c + vec2(74.0, 65.0), 5.0) + lightAt(vW, R, hy + 83.0, c + vec2(0.0, 65.0), 5.0)
              + 0.8 * lightAt(vW, R, hy + 140.0, c, 12.0);
            refl += uAmb * uLamps * (0.9 * lampR + 0.05 * lightAt(vW, R, hy + 150.0, c, 120.0));
            refl += uRed * uJet * (1.1 * lightAt(vW, R, hy + 110.0, c, 8.0) + 0.9 * lightAt(vW, R, hy + 170.0, c, 10.0));
            refl += uFireC * uFire * (0.75 * lightAt(vW, R, hy + 92.0, c, 34.0) + 0.5 * lightAt(vW, R, hy + 170.0, c, 24.0));
          }
          // the glitter path of a low amber light behind the rig
          float sp = max(dot(R, uL), 0.0);
          float glit = pow(sp, 420.0) * 1.0 * lod;
          col = uBg * 0.3 + fres * refl * 1.3 + uAmb * glit * (0.3 + 0.7 * fres) * (1.0 - far);
          col += uPap * foam * 0.45;
        } else {
          // from below: a dark ceiling where the light from above plays (bands from the swell), warmer and redder near the rig
          float caus = pow(clamp(0.5 + 3.2 * (g.x * 0.62 + g.y * 0.78), 0.0, 1.0), 2.0);
          float nearL = exp(-rr * rr / (300.0 * 300.0));
          float nearJ = exp(-rr * rr / (150.0 * 150.0));
          col = uBg * 0.5 + uAmb * (0.004 + 0.012 * caus) * (1.0 - far);
          col += uAmb * uLamps * (0.012 + 0.05 * caus) * nearL;
          col += (uRed * uJet * 0.16 + uFireC * uFire * 0.4) * nearJ * (0.3 + 0.7 * caus);
          col += uPap * foam * 0.22;
        }
        col = mix(col, uBg * 0.85, far);
        gl_FragColor = vec4(min(col, vec3(3.0)), 1.0);
      }`,
  });
  return { mat, u: uniforms };
}

/* ───────── the jet: a tube of mud, the gas red inside it ───────── */
function jetMaterial() {
  const uniforms = {
    uTime: { value: 0 },
    uLen: { value: 1 },
    uR: { value: JET.r },
    uFrom: { value: JET.from },
    uSpeed: { value: 62 },
    uGas: { value: 1 },
    uMud: { value: C_MUD.clone().multiplyScalar(1.4) },
    uHi: { value: C_AMBER.clone().lerp(C_PAPER, 0.55).multiplyScalar(0.5) },
    uRed: { value: C_RED.clone() },
    uKey: { value: new THREE.Vector3(-0.55, 0.6, 0.55).normalize() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uTime, uLen, uR, uFrom, uSpeed;
      varying vec3 vW; varying vec3 vNw; varying float vU; varying float vA; varying float vS;
      void main() {
        float u = position.y;                       // 0 at the hole → 1 at the jet's head
        float a = atan(position.z, position.x);
        float s = u * uLen - uTime * uSpeed;        // along the jet, travelling up with the mud
        float b = 0.16 * sin(s * 0.23 + a * 2.0) + 0.1 * sin(s * 0.51 - a * 3.0 + 1.3) + 0.06 * sin(s * 1.1 + a * 5.0 + 2.1);
        float head = smoothstep(0.7, 1.0, u);
        float r = uR * (0.78 + 0.62 * u + 1.9 * head * head) * (1.0 + b * (0.7 + 1.2 * head));
        vec3 p = vec3(position.x * r, uFrom + u * uLen, position.z * r);
        float sway = u * u * uR * 0.55;
        p.x += sway * (sin(uTime * 1.3 + u * 3.0) + 0.5 * sin(uTime * 2.3 + u * 6.0));
        p.z += sway * cos(uTime * 1.05 + u * 2.6);
        vec4 w = modelMatrix * vec4(p, 1.0);
        vW = w.xyz;
        vNw = normalize(mat3(modelMatrix) * vec3(position.x, -0.6 * head, position.z));
        vU = u; vA = a; vS = s;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uGas; uniform vec3 uMud, uHi, uRed, uKey;
      varying vec3 vW; varying vec3 vNw; varying float vU; varying float vA; varying float vS;
      ${GLSL_NOISE}
      void main() {
        float ax = (vA + 3.14159265) / 6.2831853;
        float n = 0.62 * pnoise(vec2(ax * 7.0, vS * 0.075), 7.0) + 0.38 * pnoise(vec2(ax * 14.0, vS * 0.17 + 3.0), 14.0);
        float tear = smoothstep(0.6, 1.0, vU);
        float hole = n - (1.08 - 0.62 * tear);      // > 0: torn open
        if (hole > 0.0 && tear > 0.02) discard;
        if (!gl_FrontFacing) { gl_FragColor = vec4(uRed * uGas * (0.75 + 0.6 * n), 1.0); return; }
        vec3 N = normalize(vNw);
        vec3 V = normalize(cameraPosition - vW);
        float lam = 0.3 + 0.7 * clamp(dot(N, uKey), 0.0, 1.0);
        float fres = pow(1.0 - clamp(abs(dot(N, V)), 0.0, 1.0), 4.0);
        float streak = smoothstep(0.74, 0.95, pnoise(vec2(ax * 9.0, vS * 0.045 + 7.0), 9.0));
        float thin = smoothstep(0.4, 0.78, n);
        vec3 col = uMud * lam + uHi * (0.22 * fres + 0.7 * streak * lam);
        col += uRed * uGas * (2.1 * thin * (0.6 + 0.4 * tear) + 0.45 * fres + 1.2 * (1.0 - smoothstep(0.0, 0.1, vU)));
        col += uRed * uGas * smoothstep(-0.14, 0.0, hole) * tear * 1.5;
        gl_FragColor = vec4(min(col, vec3(2.8)), 1.0);
      }`,
  });
  return { mat, u: uniforms };
}

/* ───────── the drops: instanced mud, ballistic in the vertex shader (lit like the clay: they catch the key) ───────── */
function makeDrops(count, seed) {
  const rand = rng(seed);
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const d = new Float32Array(count * 4);
  const e = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    d.set([rand(), rand(), rand(), rand()], i * 4);
    e.set([rand() * TAU, rand(), rand(), rand()], i * 4);
  }
  geo.setAttribute("aD", new THREE.InstancedBufferAttribute(d, 4));
  geo.setAttribute("aE", new THREE.InstancedBufferAttribute(e, 4));
  const u = { uTime: { value: 0 }, uTop: { value: JET.from }, uAmt: { value: 0 } };
  const mat = new THREE.MeshStandardMaterial({ color: C_MUD.clone().multiplyScalar(1.6), roughness: 0.22, metalness: 0, envMapIntensity: 1.1 });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>
        attribute vec4 aD; attribute vec4 aE; uniform float uTime, uTop, uAmt;`)
      .replace("#include <begin_vertex>", `
        float life = 1.25 * (0.75 + 0.5 * aD.y);
        float f = fract(uTime / life + aD.x);
        float age = f * life;
        float sp = 6.0 + 17.0 * aD.z * aD.z;
        vec2 dir = vec2(cos(aE.x), sin(aE.x));
        float vy = 6.0 + 34.0 * aE.y;
        float g = 150.0;
        vec3 c = vec3(dir.x * sp * age, uTop - 6.0 * aE.z + vy * age - 0.5 * g * age * age, dir.y * sp * age);
        float vNow = vy - g * age;
        float fl = (abs(c.x) < ${DRILL.half.toFixed(1)} && abs(c.z) < ${DRILL.half.toFixed(1)}) ? ${(DRILL.floor + 0.3).toFixed(1)} : ${(DECK.y1 + 0.3).toFixed(1)};
        float alive = step(aD.w, uAmt) * step(fl, c.y) * smoothstep(0.0, 0.05, f);
        float sz = (0.34 + 0.46 * aE.w) * alive;
        vec3 transformed = position * sz;
        transformed.y *= 1.8 + 2.6 * clamp(abs(vNow) / 70.0, 0.0, 1.5);
        transformed += c;`);
  };
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const I = new THREE.Matrix4();
  for (let i = 0; i < count; i++) mesh.setMatrixAt(i, I);
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return { mesh, u };
}

/* ───────── the mud sheet: glossy clay-dark, a ragged edge that spreads, a slow boil in its reflections ───────── */
function sheetMaterial(halfX, halfZ) {
  const u = { uTime: { value: 0 }, uRad: { value: 0 }, uBox: { value: new THREE.Vector2(halfX, halfZ) } };
  const mat = new THREE.MeshStandardMaterial({ color: C_MUD.clone().multiplyScalar(1.25), roughness: 0.4, metalness: 0, envMapIntensity: 0.12, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>
        varying vec2 vSp;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
        vSp = position.xz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>
        varying vec2 vSp; uniform float uTime, uRad; uniform vec2 uBox;`)
      .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>
        float ang = atan(vSp.y, vSp.x);
        float edge = uRad * (1.0 + 0.11 * sin(ang * 5.0 + 1.3) + 0.06 * sin(ang * 9.0 - 0.7 + uTime * 0.4) + 0.04 * sin(ang * 17.0 + 2.0));
        if (length(vSp) > edge || abs(vSp.x) > uBox.x || abs(vSp.y) > uBox.y) discard;`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
        float sw1 = sin(dot(vSp, vec2(0.31, 0.19)) + uTime * 1.3), sw2 = sin(dot(vSp, vec2(-0.17, 0.36)) - uTime * 0.9);
        float sw3 = sin(dot(vSp, vec2(0.23, -0.29)) + 1.7 + uTime * 1.1);
        normal = normalize(normal + 0.045 * vec3(sw1 + 0.6 * sw3, 0.0, sw2 - 0.5 * sw3));`)
      .replace("#include <color_fragment>", `#include <color_fragment>
        float rr = length(vSp) / max(edge, 1e-3);
        diffuseColor.rgb *= mix(0.82, 1.0, smoothstep(0.0, 0.7, rr)) + 0.6 * smoothstep(0.86, 0.98, rr);`);
  };
  return { mat, u };
}

/* ───────── the deck burning, cell by cell (CR01's fireMat, on a plate) ───────── */
function burnMaterial(cell) {
  const u = { uFire: { value: 0 }, uTime: { value: 0 }, uColor: { value: C_FIRE.clone() } };
  const mat = new THREE.ShaderMaterial({
    uniforms: u,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uFire, uTime; uniform vec3 uColor; varying vec2 vP;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 cell = floor(vP / ${cell.toFixed(2)});
        vec2 f = fract(vP / ${cell.toFixed(2)});
        float h = hash(cell);
        float joint = smoothstep(0.0, 0.12, f.x) * smoothstep(1.0, 0.88, f.x) * smoothstep(0.0, 0.12, f.y) * smoothstep(1.0, 0.88, f.y);
        float live = 0.7 + 0.3 * sin(uTime * (0.5 + 0.4 * h) + h * 31.0);
        float reach = 1.0 - smoothstep(30.0 + 70.0 * uFire, 40.0 + 90.0 * uFire, length(vP) + 14.0 * h);
        float k = uFire * reach * (0.2 + 0.8 * h * h) * live * joint;
        if (k < 0.003) discard;
        gl_FragColor = vec4(uColor * 1.1 * k, 1.0);
      }`,
  });
  return { mat, u };
}

export function buildPlateforme() {
  const group = new THREE.Group();
  group.name = "plateforme";
  // the rig pivots at the waterline (it lists from there) and goes down; `body` keeps plan.js's coordinates
  const rig = new THREE.Group();
  rig.position.set(0, SEA.y, 0);
  group.add(rig);
  const body = new THREE.Group();
  body.position.set(0, -SEA.y, 0);
  rig.add(body);

  const add = (parent, geo, mat, x, y, z, o = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = o.cast ?? true;
    m.receiveShadow = true;
    if (o.edges !== false) m.add(clayEdges(o.edgeGeo ?? geo, { opacity: o.eo ?? 0.3, threshold: o.threshold }));
    parent.add(m);
    return m;
  };

  /* ───── the hull: pontoons, columns, the deck box ───── */
  const hullMat = clay({ tone: -0.55 });
  const deckMat = clay({ tone: -0.3 });
  const plantMat = clay({ tone: -0.8 });
  plantMat.color.multiplyScalar(0.85); // the machines: they frame, they never compete with the derrick
  const ph = PONTOONS.y1 - PONTOONS.y0;
  for (const z of PONTOONS.z) add(body, box(PONTOONS.length, ph, PONTOONS.w, 7), hullMat, 0, (PONTOONS.y0 + PONTOONS.y1) / 2, z);
  const colH = COLUMNS.y1 - PONTOONS.y1;
  const colGeo = box(2 * COLUMNS.r, colH, 2 * COLUMNS.r, 4);
  for (const [x, z] of COLUMNS.at) add(body, colGeo, hullMat, x, (PONTOONS.y1 + COLUMNS.y1) / 2, z);
  // a brace between the pontoons, fore and aft (under water: seen through the aquarium edge)
  for (const x of [-62, 62]) add(body, cyl(3, 2 * PONTOONS.z[1] - PONTOONS.w, 0.4, 24), hullMat, x, PONTOONS.y1 + 6, 0).rotation.x = Math.PI / 2;
  const dh = DECK.y1 - DECK.y0;
  add(body, box(DECK.size[0], dh, DECK.size[2], 1.5), deckMat, 0, (DECK.y0 + DECK.y1) / 2, 0);

  /* ───── the deck: machines, the pipe rack, the crane, the helideck (generic, sober) ───── */
  const Y = DECK.y1;
  add(body, box(30, 12, 26, 1), plantMat, 46, Y + 6, -38);
  add(body, box(22, 9, 22, 1), plantMat, 50, Y + 4.5, 18);
  add(body, box(16, 15, 12, 1), plantMat, 20, Y + 7.5, -46);
  add(body, box(42, 5, 16, 0.8), plantMat, -34, Y + 2.5, -50); // the pipe rack
  add(body, box(12, 7, 30, 0.8), plantMat, -56, Y + 3.5, -10);
  const craneMat = clay({ tone: 0.15 });
  add(body, cyl(3.6, 18, 0.5, 24), craneMat, -62, Y + 9, -54);
  add(body, box(8, 5, 8, 1), craneMat, -62, Y + 20, -54);
  {
    const boom = beam([-62, Y + 21, -54], [-122, Y + 52, -70], 2.2);
    add(body, boom, craneMat, 0, 0, 0, { eo: 0.4 });
  }
  const heliMat = clay({ tone: -0.05 });
  add(body, cyl(19, 1.4, 0.3, 8), heliMat, 84, Y + 13, 50);
  add(body, beam([70, Y, 40], [80, Y + 12, 48], 1.6), heliMat, 0, 0, 0, { eo: 0.2 });
  add(body, beam([70, Y, 60], [80, Y + 12, 54], 1.6), heliMat, 0, 0, 0, { eo: 0.2 });

  /* ───── the drill floor: the substructure, the floor plate, the rotary table ───── */
  const subMat = clay({ tone: -0.1 });
  const floorMat = clay({ tone: 0.25 });
  const tableMat = clay({ tone: -0.85 });
  add(body, box(2 * DRILL.half, DRILL.floor - Y - 1, 2 * DRILL.half, 0.6), subMat, 0, (Y + DRILL.floor - 1) / 2, 0);
  add(body, box(2 * DRILL.half + 2, 1, 2 * DRILL.half + 2, 0.3), floorMat, 0, DRILL.floor - 0.5, 0);
  add(body, cyl(DRILL.table, 0.8, 0.2, 40), tableMat, 0, DRILL.floor + 0.4, 0, { eo: 0.45 });

  /* ───── the derrick: one merged lattice — four legs leaning in, a girt at every bay, X braces on every face, the crown ───── */
  const H = DERRICK.y1 - DERRICK.y0;
  const half = (y) => DERRICK.base + (DERRICK.top - DERRICK.base) * ((y - DERRICK.y0) / H);
  const corner = (k, y) => {
    const s = [[-1, -1], [1, -1], [1, 1], [-1, 1]][k % 4];
    const w = half(y);
    return [s[0] * w, y, s[1] * w];
  };
  const parts = [];
  for (let k = 0; k < 4; k++) parts.push(beam(corner(k, DERRICK.y0), corner(k, DERRICK.y1), 1.7));
  for (let i = 0; i <= DERRICK.bays; i++) {
    const y = DERRICK.y0 + (H * i) / DERRICK.bays;
    for (let k = 0; k < 4; k++) parts.push(beam(corner(k, y), corner(k + 1, y), i === 0 ? 1.3 : 0.95));
  }
  for (let i = 0; i < DERRICK.bays; i++) {
    const y0 = DERRICK.y0 + (H * i) / DERRICK.bays;
    const y1 = DERRICK.y0 + (H * (i + 1)) / DERRICK.bays;
    for (let k = 0; k < 4; k++) {
      // the V-door: the face toward −x keeps its lowest bay open (where pipe comes in)
      if (i === 0 && k === 3) continue;
      parts.push(beam(corner(k, y0), corner(k + 1, y1), 0.72));
      parts.push(beam(corner(k + 1, y0), corner(k, y1), 0.72));
    }
  }
  const lattice = mergeGeometries(parts);
  const derrickMat = clay({ tone: 0.72 });
  derrickMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>
        varying float vDY;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
        vDY = transformed.y;`);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>
        varying float vDY;`)
      .replace("#include <color_fragment>", `#include <color_fragment>
        diffuseColor.rgb *= 1.0 - 0.55 * smoothstep(${(DERRICK.y1 - 40).toFixed(1)}, ${(DERRICK.y1 + 4).toFixed(1)}, vDY);`);
  };

  add(body, lattice, derrickMat, 0, 0, 0, { eo: 0.5 });
  const crownMat = clay({ tone: 0.45 });
  add(body, box(2 * DERRICK.top + 3, 2.6, 2 * DERRICK.top + 3, 0.4), crownMat, 0, DERRICK.y1 + 1.3, 0, { eo: 0.45 });
  {
    const sheave = cyl(1.7, 1.2, 0.2, 24);
    sheave.rotateZ(Math.PI / 2);
    for (const z of [-2.2, 0, 2.2]) add(body, sheave, crownMat, 0, DERRICK.y1 + 4, z, { eo: 0.3 });
  }

  /* ───── the lamps: the deck's edge, the helideck, the derrick's floods, the crown ───── */
  const lampPts = [];
  for (const sx of [-1, 0, 1]) for (const sz of [-1, 1]) lampPts.push([sx * 74, Y + 1.5, sz * 65]);
  for (const sz of [-0.5, 0.5]) for (const sx of [-1, 1]) lampPts.push([sx * 74, Y + 1.5, sz * 65]);
  for (const a of [0, 1, 2, 3]) lampPts.push([84 + 17 * Math.cos(a * TAU / 4 + 0.4), Y + 14.5, 50 + 17 * Math.sin(a * TAU / 4 + 0.4)]);
  for (const y of [520, 566]) for (let k = 0; k < 4; k++) {
    const c = corner(k, y);
    lampPts.push([c[0] * 1.12, y, c[2] * 1.12]);
  }
  lampPts.push([0, DERRICK.y1 + 6.5, 0], [-122, Y + 52, -70]);
  const lamps = makeLamps(lampPts, 2.8);
  body.add(lamps.points);

  /* ───── the riser, from the BOP's top to the moon pool (it follows the rig when it sinks) and the BOP proxy ───── */
  const riserLen = RISER.y1 - RISER.y0;
  const riserParts = [new THREE.CylinderGeometry(RISER.r, RISER.r, riserLen, 24, 1, true)];
  const nJ = 10;
  for (let i = 1; i < nJ; i++) {
    const g = new THREE.CylinderGeometry(RISER.r * 1.32, RISER.r * 1.32, 2.2, 24);
    g.translate(0, -riserLen / 2 + (riserLen * i) / nJ, 0);
    riserParts.push(g);
  }
  const riserGeo = mergeGeometries(riserParts.map((g) => g.toNonIndexed()));
  const riserMat = clay({ tone: 0.5 });
  const riser = add(group, riserGeo, riserMat, 0, (RISER.y0 + RISER.y1) / 2, 0, { eo: 0.35 });

  const bopG = new THREE.Group();
  bopG.position.set(SEABED_BOP.at[0], 0, SEABED_BOP.at[2]);
  group.add(bopG);
  {
    const [bw, bh, bd] = SEABED_BOP.size;
    const frameMat = clay({ tone: 0.3 });
    const stackMat = clay({ tone: -0.25 });
    const podMat = clay({ tone: 0.6 });
    const headMat = clay({ tone: -0.6 });
    add(bopG, cyl(3.2, 4, 0.3, 32), headMat, 0, 2, 0); // the wellhead
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) add(bopG, box(1.4, bh * 0.62, 1.4, 0.2), frameMat, (sx * bw) / 2, bh * 0.31, (sz * bd) / 2);
    add(bopG, box(bw + 1.4, 1.2, bd + 1.4, 0.3), frameMat, 0, bh * 0.08, 0);
    add(bopG, box(bw + 1.4, 1.2, bd + 1.4, 0.3), frameMat, 0, bh * 0.6, 0);
    add(bopG, box(bw * 0.62, bh * 0.45, bd * 0.62, 0.5), stackMat, 0, bh * 0.3, 0); // the lower stack
    for (const y of [0.16, 0.3, 0.44]) add(bopG, box(bw * 0.94, bh * 0.07, 3.2, 0.3), stackMat, 0, bh * y, 0); // the rams' bonnets
    add(bopG, box(bw * 0.5, bh * 0.26, bd * 0.5, 0.5), stackMat, 0, bh * 0.68, 0); // the LMRP
    add(bopG, cyl(bw * 0.27, bh * 0.14, 0.4, 32), frameMat, 0, bh * 0.88, 0); // the annular
    for (const sz of [-1, 1]) add(bopG, box(3, 8, 4.4, 0.4), podMat, 0, bh * 0.68, sz * (bd * 0.5 + 0.4)); // the two pods
  }

  /* ───── the sea: the surface from the aquarium edge on, its light line, the motes in the water ───── */
  const seaW = SEA.reach;
  const seaGeo = new THREE.PlaneGeometry(seaW, seaW);
  seaGeo.rotateX(-Math.PI / 2);
  const sea = seaMaterial();
  const seaMesh = new THREE.Mesh(seaGeo, sea.mat);
  seaMesh.position.set(SEA.cut + seaW / 2, SEA.y, 0);
  group.add(seaMesh);
  const edge = fatLine([[SEA.cut, SEA.y + 0.1, -1150], [SEA.cut, SEA.y + 0.1, 1150]], { color: RECON.papier, width: 2.2, opacity: 0.55 });
  group.add(edge);
  const motes = makePuffs({
    count: 220, seed: 21, life: 9, size: [1.1, 1.3], wobble: 4, soft: 1.3, color: C_PAPER.clone().multiplyScalar(0.9), maxPx: 8,
    origin: (r, o) => { o[0] = SEA.cut + 6 + 700 * r() * r(); o[1] = 12 + (SEA.y - 30) * r(); o[2] = (r() - 0.5) * 760; },
    vel: (r, v) => { v[0] = (r() - 0.5) * 2; v[1] = (r() - 0.35) * 1.6; v[2] = (r() - 0.5) * 2; },
  });
  group.add(motes.points);

  /* ───── the blowout ───── */
  // the jet: a tube of mud out of the hole, up the derrick's axis
  const jetGeo = new THREE.CylinderGeometry(1, 1, 1, 40, 72, true);
  jetGeo.translate(0, 0.5, 0);
  const jetM = jetMaterial();
  const jet = new THREE.Mesh(jetGeo, jetM.mat);
  jet.frustumCulled = false;
  jet.renderOrder = 1;
  body.add(jet);
  // the source: a red light that has a place at the hole, and a red light inside the tower
  const tex = glowTexture();
  const holeGlow = glowSprite(tex, 22);
  holeGlow.position.set(0, DRILL.floor + 2, 0);
  body.add(holeGlow);
  const redLight = new THREE.PointLight(C_RED.clone(), 0, 420, 2);
  redLight.position.set(0, DRILL.floor + 24, 0);
  body.add(redLight);
  // the drops falling back, the red mist where the jet tears
  const drops = makeDrops(520, 31);
  body.add(drops.mesh);
  const mist = makePuffs({
    count: 110, seed: 33, life: 1.4, size: [6, 26], rise: -30, wobble: 5, soft: 2.2, additive: true, color: C_RED.clone().multiplyScalar(0.55), maxPx: 260, clip: true,
    origin: (r, o) => { o[0] = (r() - 0.5) * 4; o[1] = 0; o[2] = (r() - 0.5) * 4; },
    vel: (r, v) => { const a = r() * TAU; const s = 8 + 22 * r(); v[0] = Math.cos(a) * s; v[1] = 4 + 16 * r(); v[2] = Math.sin(a) * s; },
  });
  body.add(mist.points);
  // the mud on the drill floor, then on the deck
  const floorSheet = sheetMaterial(DRILL.half + 1, DRILL.half + 1);
  const fsGeo = new THREE.PlaneGeometry(2 * DRILL.half + 2, 2 * DRILL.half + 2);
  fsGeo.rotateX(-Math.PI / 2);
  const floorMud = add(body, fsGeo, floorSheet.mat, 0, DRILL.floor + 0.12, 0, { edges: false, cast: false });
  const deckSheet = sheetMaterial(DECK.size[0] / 2 - 0.5, DECK.size[2] / 2 - 0.5);
  const dsGeo = new THREE.PlaneGeometry(DECK.size[0], DECK.size[2]);
  dsGeo.rotateX(-Math.PI / 2);
  const deckMud = add(body, dsGeo, deckSheet.mat, 0, Y + 0.12, 0, { edges: false, cast: false });

  // the explosion: a flash that has a place, a fireball
  const flash = glowSprite(tex, 120); // the red swell
  flash.position.set(0, DRILL.floor + 22, 0);
  body.add(flash);
  const flashCore = glowSprite(tex, 30); // the white core
  flashCore.position.set(0, DRILL.floor + 20, 0);
  body.add(flashCore);
  const ball = makePuffs({
    count: 150, seed: 41, life: 1, size: [10, 44], burst: true, soft: 1.3, additive: false, color: C_RED.clone().lerp(C_AMBER, 0.62), maxPx: 420, clip: true,
    hot: C_HOT.clone().lerp(C_PAPER, 0.25), edge: new THREE.Color(0x24150e), vmax: 95,
    origin: (r, o) => { o[0] = (r() - 0.5) * 10; o[1] = DRILL.floor + 14 + r() * 16; o[2] = (r() - 0.5) * 10; },
    vel: (r, v) => {
      const a = r() * TAU;
      const e = Math.acos(2 * r() - 1);
      const s = 40 + 46 * r();
      v[0] = Math.sin(e) * Math.cos(a) * s; v[1] = Math.cos(e) * s * 0.8 + 18; v[2] = Math.sin(e) * Math.sin(a) * s;
    },
  });
  body.add(ball.points);
  const ballCore = makePuffs({
    count: 60, seed: 43, life: 1, size: [10, 36], burst: true, soft: 1.8, additive: true, color: C_HOT.clone().multiplyScalar(0.7), maxPx: 360, clip: true,
    origin: (r, o) => { o[0] = (r() - 0.5) * 6; o[1] = DRILL.floor + 18 + r() * 10; o[2] = (r() - 0.5) * 6; },
    vel: (r, v) => { const a = r() * TAU; const s = 14 + 22 * r(); v[0] = Math.cos(a) * s; v[1] = 10 + 20 * r(); v[2] = Math.sin(a) * s; },
  });
  body.add(ballCore.points);

  // the fire: on the deck and in the tower — flames, a hot core, embers, dark smoke; the deck glowing in cells
  const fireSpot = (r, o) => {
    if (r() < 0.42) { // in the tower: along the legs and up the axis
      const y = DERRICK.y0 + 4 + (H - 20) * r() * r();
      const w = half(y) * (0.3 + 0.7 * r());
      const a = r() * TAU;
      o[0] = Math.cos(a) * w; o[1] = y; o[2] = Math.sin(a) * w;
    } else { // on the floor and the deck around it
      const a = r() * TAU;
      const rr = 6 + 58 * Math.sqrt(r());
      o[0] = Math.cos(a) * rr * 1.1; o[2] = Math.sin(a) * rr * 0.95;
      o[1] = Math.abs(o[0]) < DRILL.half && Math.abs(o[2]) < DRILL.half ? DRILL.floor + 1 : Y + 1;
    }
  };
  const flames = makePuffs({
    count: 340, seed: 51, life: 1.15, size: [10, 34], rise: 22, wobble: 5, soft: 1.6, additive: true, color: C_FIRE.clone().multiplyScalar(0.95), maxPx: 300, clip: true,
    origin: fireSpot, vel: (r, v) => { v[0] = (r() - 0.5) * 8; v[1] = 26 + 34 * r(); v[2] = (r() - 0.5) * 8; },
  });
  body.add(flames.points);
  const hot = makePuffs({
    count: 180, seed: 53, life: 0.8, size: [6, 18], rise: 12, wobble: 3, soft: 2.0, additive: true, color: C_HOT.clone().multiplyScalar(0.8), maxPx: 220, clip: true,
    origin: fireSpot, vel: (r, v) => { v[0] = (r() - 0.5) * 5; v[1] = 18 + 22 * r(); v[2] = (r() - 0.5) * 5; },
  });
  body.add(hot.points);
  const embers = makePuffs({
    count: 200, seed: 55, life: 4, size: [1.6, 0.9], rise: 3, wobble: 12, soft: 1.2, additive: true, color: C_RED.clone().multiplyScalar(1.25), maxPx: 16, clip: true, top: [700, 790],
    origin: fireSpot, vel: (r, v) => { v[0] = (r() - 0.5) * 14; v[1] = 28 + 30 * r(); v[2] = (r() - 0.5) * 14; },
  });
  body.add(embers.points);
  const smoke = makePuffs({
    count: 110, seed: 57, life: 7, size: [22, 120], rise: 2, wobble: 22, soft: 1.8, color: C_PAPER.clone().multiplyScalar(0.17), maxPx: 520, clip: true, top: [640, 820],
    origin: (r, o) => { o[0] = (r() - 0.5) * 50; o[1] = DRILL.floor + 20 + 90 * r(); o[2] = (r() - 0.5) * 50; },
    vel: (r, v) => { v[0] = 10 + 10 * r(); v[1] = 26 + 16 * r(); v[2] = (r() - 0.5) * 12; },
  });
  body.add(smoke.points);
  const burn = burnMaterial(7);
  const burnGeo = new THREE.PlaneGeometry(DECK.size[0] - 2, DECK.size[2] - 2);
  burnGeo.rotateX(-Math.PI / 2);
  const burnDeck = new THREE.Mesh(burnGeo, burn.mat);
  burnDeck.position.set(0, Y + 0.25, 0);
  body.add(burnDeck);

  /* ───── the back-light: an amber halo set behind the derrick, seen from wherever the camera is ───── */
  const back = glowSprite(tex, 1);
  back.renderOrder = -1;
  back.frustumCulled = false; // placed in onBeforeRender: its matrix before that is not where it draws
  group.add(back);
  const backAt = new THREE.Vector3();
  const backDir = new THREE.Vector3();
  let backScale = 560;
  back.onBeforeRender = (renderer, scene, camera) => {
    // the derrick's middle in the world (the rig may have sunk), then 380 cm further from the camera
    backAt.set(0, 532, 0);
    body.localToWorld(backAt);
    backDir.copy(backAt).sub(camera.position).normalize();
    backAt.addScaledVector(backDir, 380);
    back.matrixWorld.makeScale(backScale, backScale, 1);
    back.matrixWorld.setPosition(backAt);
  };

  /* ───── the anchors ───── */
  const A = {};
  const anchor = (name, parent, x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    A[name] = o;
  };
  anchor("focus", group, 0, 520, 0);
  anchor("fault", bopG, 0, SEABED_BOP.size[1] / 2, 0);
  anchor("hole", body, ...DRILL.hole);
  anchor("crown", body, 0, DERRICK.y1, 0);
  anchor("riser", group, 0, (RISER.y0 + RISER.y1) / 2, 0);
  anchor("bop", bopG, 0, SEABED_BOP.size[1] / 2, 0);
  anchor("deck", body, 0, DECK.y1, 0);

  const riserTop = new THREE.Vector3();
  const riserDir = new THREE.Vector3();
  const backCol = new THREE.Color();
  const pts = [motes, mist, ball, ballCore, flames, hot, embers, smoke];

  return {
    group, A, haloR: 26,
    update(S, time, px) {
      const j = clamp01(S.jet ?? 0);
      const sp = clamp01(S.spill ?? 0);
      const b = clamp01(S.blast ?? 0);
      const f = clamp01(S.fire ?? 0);
      const s = clamp01(S.sink ?? 0);
      const lm = clamp01(S.lamps ?? 1);
      const pxs = px || 1000;
      for (let i = 0; i < pts.length; i++) {
        pts[i].u.uTime.value = time;
        pts[i].u.uPx.value = pxs;
      }
      lamps.u.uPx.value = pxs;

      // the sinking: from the waterline the hull lists toward +z, drifts off a little and goes down
      const ss = s * s * (3 - 2 * s);
      const drop = 262 * ss;
      const th = 0.3 * smooth(0, 0.75, s);
      const ph2 = -0.07 * s;
      const drift = 36 * ss;
      rig.position.set(drift, SEA.y - drop, 0);
      rig.rotation.set(th, 0, ph2);
      const under = smooth(0.55, 0.95, s); // the lights go under

      // the riser follows the moon pool (bottom fixed on the BOP)
      const hy = DECK.y0 - SEA.y;
      riserTop.set(-hy * Math.sin(ph2) + drift, SEA.y - drop + hy * Math.cos(ph2) * Math.cos(th), hy * Math.cos(ph2) * Math.sin(th));
      riserDir.set(riserTop.x, riserTop.y - RISER.y0, riserTop.z);
      const len = Math.max(20, riserDir.length());
      riserDir.multiplyScalar(1 / len);
      riser.quaternion.setFromUnitVectors(UP, riserDir);
      riser.position.set(riserTop.x / 2, (riserTop.y + RISER.y0) / 2, riserTop.z / 2);
      riser.scale.set(1, len / riserLen, 1);

      // the jet: out of the hole, up the axis, a breathing that never stops
      const gas = 1 - under;
      const L = (JET.to - JET.from + 8) * j * (0.955 + 0.03 * Math.sin(time * 5.3) + 0.015 * Math.sin(time * 11.9 + 1.3));
      jet.visible = j > 0.003 && gas > 0.01;
      jetM.u.uLen.value = Math.max(0.5, L);
      jetM.u.uTime.value = time;
      jetM.u.uGas.value = (0.62 + 0.38 * j) * gas;
      jetM.u.uR.value = JET.r * (0.75 + 0.25 * smooth(0, 0.4, j));
      const head = JET.from + L;
      drops.u.uTime.value = time;
      drops.u.uTop.value = head;
      drops.u.uAmt.value = smooth(0.2, 0.85, j) * gas;
      drops.mesh.visible = j > 0.2 && gas > 0.01;
      mist.u.uOff.value.set(0, head - 4, 0);
      mist.u.uAmount.value = 0.75 * smooth(0.25, 0.8, j) * gas;
      mist.points.visible = j > 0.25 && gas > 0.01;
      const hk = j * gas * (1.15 + 0.12 * Math.sin(time * 3.7));
      holeGlow.visible = hk > 0.01;
      holeGlow.material.color.setRGB(hk * 1.3, hk * 0.32, hk * 0.26);

      // the mud on the floor, then over its edge onto the deck
      const fr = (DRILL.half + 9) * smooth(0, 0.45, sp);
      floorSheet.u.uRad.value = fr;
      floorSheet.u.uTime.value = time;
      floorMud.visible = fr > 0.3;
      const dr = 98 * smooth(0.42, 1, sp);
      deckSheet.u.uRad.value = dr;
      deckSheet.u.uTime.value = time;
      deckMud.visible = dr > 0.3;

      // the explosion: two frames of swelling, a core that has a place, the ball of fire
      const fl = bump(b, 0.12, 0.12) + 0.45 * bump(b, 0.42, 0.3);
      const fk = Math.min(2.4, 2.2 * fl);
      flash.visible = flashCore.visible = fk > 0.01;
      flash.material.color.setRGB(fk * 0.9, fk * 0.16, fk * 0.12);
      flashCore.material.color.setRGB(fk, fk * 0.9, fk * 0.78);
      const fsz = 50 + 110 * Math.min(1, fl);
      flash.scale.set(fsz, fsz, 1);
      flashCore.scale.set(fsz * 0.32, fsz * 0.32, 1);
      ball.u.uS.value = ballCore.u.uS.value = b;
      ball.u.uAmount.value = b > 0 && b < 1 ? 0.85 : 0;
      ballCore.u.uAmount.value = b > 0 && b < 1 ? 0.9 : 0;
      ball.points.visible = ballCore.points.visible = b > 0.001 && b < 0.999;

      // the fire
      const fb = f * (0.88 + 0.12 * Math.sin(time * 1.4)); // a slow breathing, never a flicker
      flames.u.uAmount.value = 0.95 * fb;
      hot.u.uAmount.value = 0.8 * fb;
      embers.u.uAmount.value = f;
      smoke.u.uAmount.value = 0.62 * f;
      flames.points.visible = hot.points.visible = embers.points.visible = smoke.points.visible = f > 0.003;
      burn.u.uFire.value = f;
      burn.u.uTime.value = time;
      burnDeck.visible = f > 0.003;

      // the light inside the tower: the gas, then the fire, then the flash
      const kJ = 1300 * j * gas * (0.92 + 0.08 * Math.sin(time * 2.9));
      const kF = 7000 * fb * (1 - under);
      const kX = 60000 * fl;
      redLight.intensity = kJ + kF + kX;
      redLight.color.copy(C_RED).lerp(C_FIRE, (kF + 0.4 * kX) / (kJ + kF + kX + 1));

      // the lamps
      const lk = lm * (1 - under);
      lamps.u.uAmount.value = lk;
      lamps.points.visible = lk > 0.002;

      // the back-light: amber (the rig's lights in the night air), redder with the jet, the fire's glow
      backCol.copy(C_AMBER).multiplyScalar(0.2 * lk);
      backCol.r += 0.16 * j * gas + 0.42 * fb * C_FIRE.r + 0.08 * fl;
      backCol.g += 0.03 * j * gas + 0.42 * fb * C_FIRE.g + 0.012 * fl;
      backCol.b += 0.03 * j * gas + 0.42 * fb * C_FIRE.b + 0.01 * fl;
      backCol.multiplyScalar(1 - 0.85 * under);
      back.material.color.copy(backCol);
      back.visible = backCol.r > 0.002;
      backScale = 560 + 220 * f;

      // the sea: its swell, the rig's lights mirrored in it, its foam at the columns
      sea.u.uTime.value = time;
      sea.u.uO.value.set(group.position.x + drift, group.position.y + SEA.y - drop, group.position.z);
      sea.u.uJet.value = j * gas;
      sea.u.uFire.value = fb * (1 - under);
      sea.u.uLamps.value = lk;
      sea.u.uFoam.value = 1 - smooth(0.02, 0.2, s);
      motes.u.uAmount.value = 0.4;
    },
  };
}
