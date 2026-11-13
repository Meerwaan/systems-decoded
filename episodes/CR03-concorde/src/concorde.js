// CR03 — concorde.js : THE AIRCRAFT, whole, plein, ≈ 1:20 (plan.js PLANE, ENGINES, GEAR, NOSE_GEAR, TANK5, CULPRIT). « Le noir chaud »:
// satin clay under the studio key and the amber spot; the part in fault in alarm red (CULPRIT), the wing tanks green with `ok`.
// LOCAL FRAME: origin on the ground at the main gear, on the centreline; the NOSE toward −x, the LEFT wing toward +z; world.js places
// the group every frame from S.run / alt / pitch / bank (rotation order "YZX": the group's own position and rotation are not ours).
//   buildConcorde() → { group, A, haloR, update(S, time, px) }
//   A: focus (the fuselage's middle), fault (re-parented onto the culprit), nose (the drooped tip), tank5, panel (tank 5's panel, it
//      flies with it), tyre2 (its centre), gearLeft (the left leg, mid-height, it retracts with it), engine1, engine2 (their
//      compressor faces), nozzles (between the four exits), fire (the trail's root), chunk (the flying tyre piece)
//   reads S: run n1 n2 n3 n4 gear burst chunk surge cutaway tear leak fire ok culprit fault depuis (and the group's pitch / bank, to
//      keep the trails level in the world)
//
// What it is made of:
//   · the airframe, the lightest clay of the frame: an elliptic fuselage turned on its axis, the nose (32 long) DROOPED 5° about a low
//     hinge, a dark windscreen, the swept fin; THE OGIVAL DELTA generated from its planform (an S-curved leading edge: a strake swept
//     ≈ 80° at the root, ≈ 58° mid-span, closing on the tip; a straight trailing edge), thin biconvex section, anhedral; its outline
//     and the elevons drawn as fine light lines (from below as from above)
//   · four Olympus 593 in two twin nacelles built of walls (inner, splitter, outer, two bottom doors) with raked intakes, dark ducts
//     and the compressor faces inside; `cutaway` swings the LEFT outer wall up and the two doors down: the two engine bodies (turned
//     drums in stepped bands) and their faces (16 twisted blades, a blur disc that takes over with speed); round nozzles, the amber
//     reheat (a short bright dart with shock diamonds, a glow at the exit); `surge`: flame puffs out of intakes 1 and 2
//   · the gear: two long legs with braces and four-wheel bogies (they swing inward to retract), the twin nose gear (it swings
//     forward); tyre n° 2 squashes, its strips of rubber flap in the wind (`burst`); the tyre piece flies up and forward to the
//     intrados under tank 5, hits, drops and vanishes (`chunk`)
//   · the wing tanks: patches in faint relief, conformal to the intrados (safe(): green with `ok`); TANK 5 and its panel (alarm):
//     `tear` bulges the panel (a dome under it) then tears it off, tumbling; a dark hole is left
//   · the trails, kept LEVEL in the world (a pivot that cancels pitch and bank): the kerosene (`leak`: a thin falling thread < 0.15,
//     then the pale jet and its mist streaming back), THE FIRE (`fire`: two additive tubes whose noise runs back, tears and undulates —
//     red at heart, darker in the tail, ≈ 400 long at 1 — flames puffs at the root, brown-black smoke, a red glow and a red light
//     that paints the intrados and the ground). No spark, no flash: a continuous trail.
// Everything depends on S and `time` only; update() allocates nothing (it runs sixteen times per frame).
import * as THREE from "three";
import { box, plate, lathe, mergeGeometries, fatLine } from "@kit/build3d.js";
import { clay, clayEdges, alarm, setAlarm, heal, safe, RECON } from "@kit/reconstitution.js";
import { rng } from "@kit/rng.js";
import { PLANE, ENGINES, GEAR, NOSE_GEAR, TANK5, CULPRIT } from "./plan.js";

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

const C_AMBER = new THREE.Color(RECON.ambre);
const C_RED = new THREE.Color(RECON.alarme);
const C_PAPER = new THREE.Color(RECON.papier);
const C_FIRE = C_RED.clone().lerp(C_AMBER, 0.38); // red going amber: the fire's hottest
const C_HOT = C_AMBER.clone().lerp(C_PAPER, 0.4); // the reheat's core
const C_SMOKE = new THREE.Color(0x1b110c); // brown-black

/* ───────────── the planform: the ogival delta (x, z), the section, the anhedral ───────────── */
const WG = PLANE.wing; // le −52 (root), te 116, span 64, y 18 (the intrados at the root)
const ROOT_Z = 7;
const TIP_Z = 64.4;
const LE_PTS = [[-52, 7], [-38, 9.5], [-24, 14.5], [-12, 21], [-2, 28], [8, 35], [20, 42], [36, 49.5], [54, 55.8], [72, 60.4], [90, 63.3], [104, TIP_Z]];
const LE_TAB = new THREE.CatmullRomCurve3(LE_PTS.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "centripetal").getSpacedPoints(240).map((p) => [p.x, p.z]);
/** x of the leading edge at span z (≥ 0). */
function leX(z) {
  if (z <= LE_TAB[0][1]) return LE_TAB[0][0];
  for (let i = 1; i < LE_TAB.length; i++) {
    const [x1, z1] = LE_TAB[i];
    if (z <= z1) {
      const [x0, z0] = LE_TAB[i - 1];
      return x0 + ((x1 - x0) * (z - z0)) / Math.max(1e-6, z1 - z0);
    }
  }
  return LE_TAB[LE_TAB.length - 1][0];
}
const teX = (z) => WG.te - 3 * clamp01((z - ROOT_Z) / (TIP_Z - ROOT_Z));
const anh = (z) => {
  const k = clamp01((z - ROOT_Z) / (TIP_Z - ROOT_Z));
  return 2.6 * k * k;
};
const tmaxAt = (le, te) => Math.max(0.35, 0.03 * (te - le));
function thickAt(x, z) {
  z = Math.abs(z);
  const le = leX(z);
  const te = teX(z);
  const u = clamp01((x - le) / Math.max(1, te - le));
  return tmaxAt(le, te) * 4 * u * (1 - u);
}
/** y of the intrados at (x, z): what the tanks, the gear and the nacelles are set against. */
const lowerY = (x, z) => WG.y - anh(Math.abs(z)) - 0.15 * thickAt(x, z);

/** One half-wing (sign +1 left, −1 right): top and bottom skins over the planform, a crisp tip. Returns the stations too. */
function wingGeometry(sign) {
  const st = [[WG.le, 3]];
  for (let i = 0; i < LE_TAB.length; i += 5) if (LE_TAB[i][1] > 4) st.push(LE_TAB[i]);
  if (st[st.length - 1] !== LE_TAB[LE_TAB.length - 1]) st.push(LE_TAB[LE_TAB.length - 1]);
  const M = 18;
  const R = M + 1;
  const pos = [];
  const idx = [];
  const flip = sign < 0;
  const tri = (a, b, c) => (flip ? idx.push(a, c, b) : idx.push(a, b, c));
  const skin = (top) => {
    const base = pos.length / 3;
    for (const [xl, z] of st) {
      const te = teX(z);
      const T = tmaxAt(xl, te);
      for (let j = 0; j <= M; j++) {
        const u = 0.5 * (1 - Math.cos((Math.PI * j) / M));
        const t = T * 4 * u * (1 - u);
        pos.push(xl + (te - xl) * u, WG.y - anh(z) + (top ? 0.85 : -0.15) * t, sign * z);
      }
    }
    return base;
  };
  const top = skin(true);
  const bot = skin(false);
  for (let i = 0; i < st.length - 1; i++)
    for (let j = 0; j < M; j++) {
      const a = i * R + j;
      const b = a + 1;
      const c = a + R;
      const d = c + 1;
      tri(top + a, top + c, top + b);
      tri(top + b, top + c, top + d);
      tri(bot + a, bot + b, bot + c);
      tri(bot + b, bot + d, bot + c);
    }
  const n = st.length - 1;
  const copyRow = (base) => {
    const at = pos.length / 3;
    for (let j = 0; j <= M; j++) {
      const k = (base + n * R + j) * 3;
      pos.push(pos[k], pos[k + 1], pos[k + 2]);
    }
    return at;
  };
  const capT = copyRow(top);
  const capB = copyRow(bot);
  for (let j = 0; j < M; j++) {
    tri(capT + j, capB + j, capT + j + 1);
    tri(capT + j + 1, capB + j, capB + j + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return { geo, st };
}

/** A patch of skin in faint relief under the intrados (a tank's outline): a box mapped onto the surface, clipped by the leading edge. */
function skinSlab(x0, x1, z0, z1, off = 0.08, th = 0.32, nx = 10, nz = 4) {
  const geo = new THREE.BoxGeometry(1, 1, 1, nx, 1, nz);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const bx = p.getX(i) + 0.5;
    const by = p.getY(i) + 0.5;
    const bz = p.getZ(i) + 0.5;
    const z = lerp(z0, z1, bz);
    const az = Math.abs(z);
    const xa = Math.max(x0, leX(az) + 2.5);
    const xb = Math.min(x1, teX(az) - 12);
    const x = lerp(xa, Math.max(xa + 0.5, xb), bx);
    const ys = lowerY(x, az);
    p.setXYZ(i, x, by > 0.5 ? ys - off + 0.05 : ys - off - th, z);
  }
  geo.computeVertexNormals();
  return geo;
}

/** A cylinder from a to b (braces, struts). */
function cylBetween(a, b, r, seg = 12) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const g = new THREE.CylinderGeometry(r, r, A.distanceTo(B), seg);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()));
  g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
  return g;
}

/** A mesh with its fine light edges (clayEdges), shadows on. */
function put(parent, geo, mat, { pos = [0, 0, 0], rot = null, edges = true, edgeOpacity, shadow = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  m.castShadow = m.receiveShadow = shadow;
  if (edges) m.add(clayEdges(geo, edgeOpacity != null ? { opacity: edgeOpacity } : {}));
  parent.add(m);
  return m;
}
const group0 = (parent, [x, y, z] = [0, 0, 0]) => {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
};
const anchor = (parent, x, y, z) => {
  const o = new THREE.Object3D();
  o.position.set(x, y, z);
  parent.add(o);
  return o;
};

/* ───────────── what streams and flies (shaders that read time only) ───────────── */
const GLSL_NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float pnoise(vec2 p, float per) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    float i0 = mod(i.x, per); float i1 = mod(i.x + 1.0, per);
    return mix(mix(hash(vec2(i0, i.y)), hash(vec2(i1, i.y)), f.x), mix(hash(vec2(i0, i.y + 1.0)), hash(vec2(i1, i.y + 1.0)), f.x), f.y);
  }`;

/** A trail: a tube along +x from its pivot, `uL` long, its radius uR0 → uR1, its noise running back (holes where it tears), its
    centreline undulating (a wave that travels back, measured in units so that two trails of the same fire share it). */
function makeStream({ r0, r1, grow = 0.8, wave = 0, waveL = 400, rise = 0, tear = -1, soft = 1.4, freq = 0.05, scroll = 6, bands = 0, hot, mid, tail, additive = true, radial = 20, segs = 64 }) {
  const geo = new THREE.CylinderGeometry(1, 1, 1, radial, segs, true);
  geo.translate(0, 0.5, 0);
  geo.rotateZ(-Math.PI / 2); // axis y → x, from 0 to 1
  const uniforms = {
    uTime: { value: 0 }, uL: { value: 1 }, uAmount: { value: 0 },
    uR0: { value: r0 }, uR1: { value: r1 }, uGrow: { value: grow }, uWave: { value: wave }, uWaveL: { value: waveL }, uRise: { value: rise },
    uTear: { value: tear }, uSoft: { value: soft }, uFreq: { value: freq }, uScroll: { value: scroll }, uBands: { value: bands },
    uHot: { value: new THREE.Color(hot) }, uMid: { value: new THREE.Color(mid) }, uTail: { value: new THREE.Color(tail) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uL, uR0, uR1, uGrow, uWave, uWaveL, uRise;
      varying float vU; varying float vAng; varying vec3 vN; varying vec3 vV;
      void main() {
        float u = clamp(position.x, 0.0, 1.0);
        float ang = atan(position.z, position.y);
        float L = max(uL, 0.001);
        float x = u * L;
        float r = mix(uR0, uR1, pow(u, uGrow));
        r *= 1.0 + 0.16 * sin(x * 0.045 - uTime * 4.1 + ang * 2.0) + 0.09 * sin(x * 0.11 - uTime * 7.3 - ang * 3.0);
        float w = uWave * min(1.0, x / uWaveL);
        vec3 c = vec3(x, uRise * x * x / uWaveL + w * sin(x * 0.018 - uTime * 2.4), 0.8 * w * sin(x * 0.013 - uTime * 1.9 + 1.3));
        vec3 p = c + vec3(0.0, position.y * r, position.z * r);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vN = normalMatrix * vec3(0.0, position.y, position.z);
        vV = -mv.xyz;
        vU = u; vAng = ang;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${GLSL_NOISE}
      uniform vec3 uHot, uMid, uTail;
      uniform float uTime, uL, uAmount, uTear, uSoft, uFreq, uScroll, uBands;
      varying float vU; varying float vAng; varying vec3 vN; varying vec3 vV;
      void main() {
        float facing = abs(dot(normalize(vN), normalize(vV)));
        float core = pow(clamp(facing, 0.0, 1.0), uSoft);
        float s = vU * uL * uFreq - uTime * uScroll;
        float n = 0.6 * pnoise(vec2(vAng * 1.2732, s), 8.0) + 0.4 * pnoise(vec2(vAng * 2.5465 + 3.0, s * 2.1 + 5.0), 16.0);
        float keep = uTear < 0.0 ? 1.0 : smoothstep(uTear - 0.16, uTear + 0.16, n + 0.3 * (1.0 - vU));
        float fade = smoothstep(0.0, 0.04, vU) * (1.0 - smoothstep(0.58, 1.0, vU));
        vec3 col = mix(uHot, uMid, smoothstep(0.0, 0.3, vU));
        col = mix(col, uTail, smoothstep(0.35, 1.0, vU));
        float band = 1.0;
        if (uBands > 0.0) band = 0.45 + 0.55 * pow(abs(cos(vU * 3.14159 * uBands)), 6.0);
        col *= 0.8 + 0.4 * band;
        float a = uAmount * core * keep * fade * band * (0.75 + 0.5 * n);
        if (a < 0.003) discard;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = additive ? 6 : 4;
  return { mesh, u: uniforms };
}

/** Points placed in the shader from a seed and the time (CR02's idiom): flames, smoke, mist. */
function makePuffs({ count, seed, origin, vel, life = 1, size = [2, 10], rise = 0, wobble = 0, soft = 1.6, color, additive = false, maxPx = 320 }) {
  const rand = rng(seed);
  const o = new Float32Array(count * 3);
  const v = new Float32Array(count * 3);
  const s = new Float32Array(count * 4);
  const tO = [0, 0, 0];
  const tV = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    origin(rand, tO, i);
    vel(rand, tV, tO, i);
    o.set(tO, i * 3);
    v.set(tV, i * 3);
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
    uTime: { value: 0 }, uAmount: { value: 0 }, uPx: { value: 1000 }, uLife: { value: life }, uSize0: { value: size[0] }, uSize1: { value: size[1] },
    uRise: { value: rise }, uWobble: { value: wobble }, uSoft: { value: soft }, uMaxPx: { value: maxPx }, uColor: { value: new THREE.Color(color) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uAmount, uPx, uLife, uSize0, uSize1, uRise, uWobble, uMaxPx;
      attribute vec3 aVel; attribute vec4 aSeed; varying float vA;
      void main() {
        float life = uLife * aSeed.y;
        float f = fract(uTime / life + aSeed.x);
        float age = f * life;
        vec3 p = position + aVel * age + vec3(0.0, 0.5 * uRise * age * age, 0.0);
        p.y += uWobble * f * sin(uTime * 0.9 + aSeed.x * 17.0);
        p.z += uWobble * f * cos(uTime * 0.7 + aSeed.x * 11.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = clamp(mix(uSize0, uSize1, f) * aSeed.z * uPx / max(1.0, -mv.z), 0.0, uMaxPx);
        gl_Position = projectionMatrix * mv;
        vA = uAmount * aSeed.w * smoothstep(0.0, 0.1, f) * pow(clamp(1.0 - f, 0.0, 1.0), 1.4);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uSoft; varying float vA;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float r2 = dot(q, q) * 4.0;
        if (r2 > 1.0 || vA < 0.002) discard;
        gl_FragColor = vec4(uColor, clamp(vA * pow(clamp(1.0 - r2, 0.0, 1.0), uSoft), 0.0, 1.0));
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = additive ? 6 : 4;
  return { points, u: uniforms };
}

// a light that has a place: a bright core and a long tail
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
  s.renderOrder = 7;
  return s;
};

/* ───────────── the aircraft ───────────── */
export function buildConcorde() {
  const group = new THREE.Group();
  const B = PLANE.body; // r 7.2, h 16.6, y 25
  const EY = B.h / 2 / B.r; // the section's height / width
  const E = ENGINES;
  const YC = 12.8; // the engines' axis height

  // materials: three values of clay (the airframe the lightest), the dark of the openings, the parts that can be at fault
  const skinMat = clay({ tone: 0.42 });
  const wingMat = clay({ tone: 0.3 });
  const finMat = clay({ tone: 0.36 });
  const nacMat = clay({ tone: -0.02 });
  const darkMat = clay({ tone: -0.55 });
  const oleoMat = clay({ tone: 0.55 });
  const hubMat = clay({ tone: 0.15 });
  const nozMat = clay({ tone: -0.4, double: true });
  const coreMat = clay({ tone: 0.5 });
  const tyreDark = clay({ tone: -1 });
  tyreDark.color.multiplyScalar(0.55);
  const blackMat = clay({ tone: -1, rough: 0.35 });
  blackMat.color.multiplyScalar(0.28);
  const ductMat = blackMat.clone();
  ductMat.side = THREE.BackSide;
  const tankMat = safe(clay({ tone: -0.12 }), 0.6);
  const tank5Mat = alarm({ tone: -0.12 });
  const tyreMat = alarm({ tone: -1, noOk: true });
  tyreMat.userData.clayBase.multiplyScalar(0.55);
  tyreMat.color.copy(tyreMat.userData.clayBase);
  const engMat = alarm({ tone: -0.02, noOk: true });
  const gearMat = alarm({ tone: -0.4, noOk: true });
  const lineO = { color: RECON.papier, width: 1.8, opacity: 0.36 };
  const lineF = { color: RECON.papier, width: 1.8, opacity: 0.22 };

  /* ── the fuselage, the drooped nose, the windscreen, the fin ── */
  const turn = (prof, seg = 48) => {
    const g = new THREE.LatheGeometry(prof.map(([x, r]) => new THREE.Vector2(r, x)), seg);
    g.rotateZ(-Math.PI / 2); // axis y → x
    g.scale(1, EY, 1);
    return g;
  };
  const FUS = [[-140, 5.1], [-132, 6.0], [-124, 6.7], [-114, 7.1], [-100, 7.2], [70, 7.2], [86, 6.9], [100, 6.2], [114, 4.9], [126, 3.4], [133, 2.0], [136, 0.8], [136.05, 0]];
  const NOSE = [[-172, 0], [-171.6, 0.3], [-169, 0.85], [-165, 1.65], [-158, 2.8], [-150, 3.9], [-140, 5.1]];
  const fusGeo = turn(FUS);
  fusGeo.translate(0, B.y, 0);
  put(group, fusGeo, skinMat, { edges: false }).userData.recv = true;
  const hinge = [-140, B.y - 5.1 * EY]; // the droop hinge, low on the section
  const nosePivot = group0(group, [hinge[0], hinge[1], 0]);
  nosePivot.rotation.z = PLANE.droop * DEG; // 5°: the tip goes down
  const noseGeo = turn(NOSE);
  noseGeo.translate(-hinge[0], B.y - hinge[1], 0);
  put(nosePivot, noseGeo, skinMat, { edges: false }).userData.recv = true;
  // the windscreen, uncovered by the lowered visor: a dark wedge on the top of the cockpit
  put(group, box(7, 1.3, 5.4, 0.4), blackMat, { pos: [-135.2, B.y + 5.75 * EY - 0.45, 0], rot: [0, 0, 0.3], edgeOpacity: 0.5 });
  // the fin: swept, tall, no tailplane; the rudder's hinge drawn on both sides
  const finOutline = [[74, 0.5], [100, -0.5], [118, -3.5], [132, -6.5], [128, 28.5], [111, 28.5]];
  const finGeo = plate(finOutline, 1.6, { bevel: 0.35 });
  finGeo.translate(0, 0, -0.8);
  put(group, finGeo, finMat, { pos: [0, B.y + B.h / 2 - 1.7, 0] }).userData.recv = true;
  for (const s of [1, -1]) {
    const fy = B.y + B.h / 2 - 1.7;
    group.add(fatLine([[121.5, fy - 1.5, s * 0.86], [118.2, fy + 27.5, s * 0.86]], lineF));
    group.add(fatLine([[120.4, fy + 12, s * 0.86], [129.6, fy + 12, s * 0.86]], lineF));
  }

  /* ── the ogival delta, both halves; its outline; the elevons; the gear wells ── */
  for (const s of [1, -1]) {
    const { geo, st } = wingGeometry(s);
    const w = new THREE.Mesh(geo, wingMat);
    w.castShadow = w.receiveShadow = true;
    w.userData.recv = true;
    group.add(w);
    const outline = st.filter(([, z]) => z >= 4).map(([x, z]) => [x, WG.y - anh(z), s * z]);
    outline.push([teX(TIP_Z), WG.y - anh(TIP_Z), s * TIP_Z], [teX(4), WG.y - anh(4), s * 4]);
    group.add(fatLine(outline, lineO));
    // the elevons: three per side, their hinge line and their splits, under and over the wing
    for (const under of [true, false]) {
      const yAt = (x, z) => (under ? lowerY(x, z) - 0.06 : WG.y - anh(z) + 0.85 * thickAt(x, z) + 0.06);
      const pts = [];
      const H = (z) => teX(z) - 10;
      for (const [za, zb] of [[10, 30], [30.6, 47.5], [48.1, 61]]) {
        pts.push([teX(za), yAt(teX(za) - 0.3, za), s * za]);
        for (let k = 0; k <= 4; k++) {
          const z = lerp(za, zb, k / 4);
          pts.push([H(z), yAt(H(z), z), s * z]);
        }
        pts.push([teX(zb), yAt(teX(zb) - 0.3, zb), s * zb]);
      }
      group.add(fatLine(pts, lineF));
    }
    // the main gear's well, dark, in the intrados
    put(group, skinSlab(-4, 8, s > 0 ? 14.5 : -23.5, s > 0 ? 23.5 : -14.5, 0.02, 0.12, 4, 2), blackMat, { edgeOpacity: 0.3 });
  }

  /* ── the wing tanks (safe: green with `ok`), tank 5 and its panel ── */
  const TANKS = [[10, 46, 7.5, 13.5], [50, 98, 8, 21], [-6, 19, 24, 37], [26, 92, 40, 56], [-34, -6, 8, 24]];
  TANKS.forEach(([x0, x1, z0, z1], i) => {
    for (const s of [1, -1]) {
      const isT5 = s > 0 && i === TANKS.length - 1;
      const zz0 = s > 0 ? z0 : -z1;
      const zz1 = s > 0 ? z1 : -z0;
      put(group, skinSlab(x0, x1, zz0, zz1), isT5 ? tank5Mat : tankMat, { edgeOpacity: 0.42 });
    }
  });
  const T5C = [-20, 16];
  // the panel (magnified ≈ 2×): a plate in the intrados, a dome under it that bulges, both torn off together
  const PZ = TANK5.panel[1];
  const PX = TANK5.panel[0];
  const PY = lowerY(PX, PZ);
  const hole = put(group, skinSlab(PX - TANK5.panelSize / 2, PX + TANK5.panelSize / 2, PZ - TANK5.panelSize / 2, PZ + TANK5.panelSize / 2, 0.04, 0.1, 2, 2), blackMat, { edgeOpacity: 0.5 });
  hole.visible = false;
  const panelHome = new THREE.Vector3(PX, PY - 0.42, PZ);
  const panelG = group0(group, [panelHome.x, panelHome.y, panelHome.z]);
  put(panelG, box(TANK5.panelSize, 0.26, TANK5.panelSize, 0.1), tank5Mat, { edgeOpacity: 0.6 });
  const domeGeo = new THREE.SphereGeometry(TANK5.panelSize * 0.62, 20, 8, 0, TAU, Math.PI / 2, Math.PI / 2);
  domeGeo.scale(1, 1, 1);
  const dome = put(panelG, domeGeo, tank5Mat, { edges: false, pos: [0, -0.1, 0] });
  dome.scale.set(1, 0.001, 1);

  /* ── the four engines: two twin nacelles of walls, the intakes, the nozzles, the faces; the left engines' bodies ── */
  const NAC = { zi: 22, zm: 30, zo: 38, x0: 20, x1: 113, th: 0.7 };
  const prof = (yT) => [[NAC.x0, yT], [27.5, 8.6], [29.5, E.y0], [102, E.y0], [110, 9.4], [NAC.x1, 10.4], [NAC.x1, yT]];
  const BOT = [[27.5, 8.6], [29.5, 8], [102, 8], [110, 9.4], [113, 10.4], [113, 11.1], [110, 10.1], [102, 8.7], [29.8, 8.7], [28.2, 9.3]];
  const doorW = NAC.zm - 0.25 - (NAC.zi + NAC.th);
  const walls = {}; // the left nacelle's moving walls
  for (const s of [1, -1]) {
    const L = s > 0;
    const yT = (z) => lowerY(70, z) + 0.3;
    const inner = plate(prof(yT(NAC.zi)), NAC.th, { bevel: 0.22 });
    put(group, inner, L ? engMat : nacMat, { pos: [0, 0, L ? NAC.zi : -NAC.zi - NAC.th] });
    const split = plate(prof(yT(NAC.zm)), 0.5, { bevel: 0.18 });
    put(group, split, nacMat, { pos: [0, 0, L ? NAC.zm - 0.25 : -NAC.zm - 0.25] });
    // the outer wall: hinged along its top (the left one swings up and out with `cutaway`)
    const yo = yT(NAC.zo);
    const outerGeo = plate(prof(yo), NAC.th, { bevel: 0.22 });
    outerGeo.translate(0, -yo, -NAC.th);
    const outerPivot = group0(group, [0, yo, s * NAC.zo + (L ? 0 : NAC.th)]);
    put(outerPivot, outerGeo, nacMat);
    // the two bottom doors: hinged on the walls, they fall open
    const dGeo = plate(BOT, doorW, { bevel: 0.2 });
    const dOut = group0(group, [0, 0, L ? NAC.zo - NAC.th : -NAC.zm + 0.25]);
    put(dOut, dGeo.clone().translate(0, -E.y0, L ? -doorW : 0), nacMat, { pos: [0, E.y0, 0] });
    const dIn = group0(group, [0, 0, L ? NAC.zi + NAC.th : -NAC.zo + NAC.th]);
    put(dIn, dGeo.clone().translate(0, -E.y0, 0), nacMat, { pos: [0, E.y0, 0] });
    if (L) Object.assign(walls, { outerPivot, dOut, dIn });
    // the rear bulkhead, the nozzles (round, the secondary buckets), a dark disc inside each
    put(group, box(0.6, yT(NAC.zm) - 8.6, NAC.zo - NAC.zi, 0.15), darkMat, { pos: [112.6, (yT(NAC.zm) + 8.6) / 2, s * NAC.zm], edgeOpacity: 0.25 });
  }
  const nozGeo = lathe([[3.55, 0], [3.8, 3.2], [3.45, 7.5], [3.2, 9]], 40, { crease: 30 });
  nozGeo.rotateZ(-Math.PI / 2);
  const discGeo = new THREE.CircleGeometry(3.4, 32);
  discGeo.rotateY(Math.PI / 2);
  const ductGeo = new THREE.CylinderGeometry(3.6, 3.4, 23, 20, 1, true);
  ductGeo.rotateZ(Math.PI / 2);
  // the compressor face: a spinner, 16 twisted blades, a blur disc
  const bladeGeo = mergeGeometries(
    Array.from({ length: 16 }, (_, k) => {
      const g = new THREE.BoxGeometry(0.95, 2.05, 0.16);
      g.rotateY(35 * DEG);
      g.translate(0, 2.25, 0);
      g.rotateX((k * TAU) / 16);
      return g;
    }),
  );
  const spinGeo = lathe([[0, -2.1], [0.75, -1.2], [1.25, -0.1], [1.25, 0.5]], 32, { crease: 40 });
  spinGeo.rotateZ(-Math.PI / 2);
  const blurGeo = new THREE.CylinderGeometry(3.3, 3.3, 0.5, 40);
  blurGeo.rotateZ(Math.PI / 2);
  const CORE = [[0, 45.2], [3.0, 45.2], [3.0, 47], [2.75, 47.4], [2.75, 52], [2.55, 52.4], [2.55, 57], [2.35, 57.4], [2.35, 62], [3.1, 64], [3.1, 72.5], [2.5, 74.5], [2.85, 75.5], [2.85, 82], [2.6, 83.5], [2.6, 107], [2.3, 110], [0, 110]];
  const coreGeo = lathe(CORE.map(([r, x]) => [r, x]), 48, { crease: 30 });
  coreGeo.rotateZ(-Math.PI / 2);
  const tex = glowTexture();
  const faces = [];
  const bladeMats = [];
  const blurMats = [];
  const ducts = [];
  const reheat = [];
  const rhGlow = [];
  for (let i = 0; i < 4; i++) {
    const z = E.z[i];
    // nozzle, dark disc inside
    put(group, nozGeo, nozMat, { pos: [112, YC, z], edgeOpacity: 0.3 });
    put(group, discGeo, blackMat, { pos: [113.5, YC, z], edges: false });
    // dark intake duct (seen from inside only), the face at its end
    const duct = new THREE.Mesh(ductGeo, ductMat);
    duct.position.set(32.5, YC, z);
    group.add(duct);
    ducts.push(duct);
    const face = group0(group, [44, YC, z]);
    const bm = clay({ tone: 0.55 });
    bm.transparent = true;
    const blm = clay({ tone: 0.35 });
    blm.transparent = true;
    blm.opacity = 0;
    blm.depthWrite = false;
    put(face, bladeGeo, bm, { edges: false });
    put(face, spinGeo, clay({ tone: 0.2 }), { edges: false });
    put(face, blurGeo, blm, { edges: false, shadow: false });
    faces.push(face);
    bladeMats.push(bm);
    blurMats.push(blm);
    // the engine body (left engines only: the right ones are never opened)
    if (i < 2) put(group, coreGeo, i === 1 ? engMat : coreMat, { pos: [0, YC, z], edgeOpacity: 0.3 });
    // the reheat: a short bright dart, shock diamonds, a glow at the exit
    const rh = makeStream({ r0: 2.5, r1: 0.6, grow: 1, tear: -1, soft: 1.5, bands: 3.5, freq: 0.2, scroll: 0, hot: C_HOT.clone().multiplyScalar(1.05), mid: C_AMBER.clone().multiplyScalar(1.0), tail: C_AMBER.clone().multiplyScalar(0.55), radial: 16, segs: 24 });
    rh.mesh.position.set(121, YC, z);
    group.add(rh.mesh);
    reheat.push(rh);
    const g = glowSprite(tex, 12);
    g.position.set(122, YC, z);
    group.add(g);
    rhGlow.push(g);
  }

  /* ── the gear ── */
  const R = GEAR.tyre.r;
  const tyreGeo = (r, w) => {
    const g = lathe([[r * 0.56, -w / 2], [r * 0.86, -w / 2], [r * 0.98, -w * 0.35], [r, 0], [r * 0.98, w * 0.35], [r * 0.86, w / 2], [r * 0.56, w / 2]], 40, { crease: 50 });
    g.rotateX(Math.PI / 2);
    return g;
  };
  const hubGeo = (r, w) => {
    const g = new THREE.CylinderGeometry(r * 0.58, r * 0.58, w * 0.82, 28);
    g.rotateX(Math.PI / 2);
    return g;
  };
  const mainTyre = tyreGeo(R, GEAR.tyre.w);
  const mainHub = hubGeo(R, GEAR.tyre.w);
  const spinners = [];
  const noseSpinners = [];
  const legs = [];
  let tyre2Squash = null;
  const strips = [];
  for (const s of [1, -1]) {
    const L = s > 0;
    const yTop = lowerY(0, GEAR.track) + 0.8;
    const pivot = group0(group, [0, yTop, s * GEAR.track]);
    legs.push(pivot);
    const lm = L ? gearMat : darkMat;
    const y = (v) => v - yTop; // world height → pivot local
    put(pivot, cylBetween([0, 0, 0], [0, y(9.2), 0], 0.95), lm, { edgeOpacity: 0.3 });
    put(pivot, cylBetween([0, y(9.6), 0], [0, y(3.4), 0], 0.62), L ? gearMat : oleoMat, { edgeOpacity: 0.3 });
    put(pivot, cylBetween([0, y(12), 0], [0, -0.3, -s * 6.5], 0.34, 8), lm, { edges: false });
    put(pivot, cylBetween([0, y(12.5), 0], [-8.5, -0.3, 0], 0.34, 8), lm, { edges: false });
    put(pivot, box(GEAR.bogie.dx * 2 + 2.2, 0.8, 0.95, 0.2), lm, { pos: [0, y(R), 0], edgeOpacity: 0.3 });
    for (const dx of [-GEAR.bogie.dx, GEAR.bogie.dx]) {
      put(pivot, cylBetween([dx, y(R), -GEAR.bogie.dz - 1], [dx, y(R), GEAR.bogie.dz + 1], 0.3, 8), darkMat, { edges: false });
      for (const dz of [-GEAR.bogie.dz, GEAR.bogie.dz]) {
        const isT2 = L && dx < 0 && dz < 0;
        const squash = group0(pivot, [dx, y(R), dz]);
        const spin = group0(squash, [0, 0, 0]);
        put(spin, mainTyre, isT2 ? tyreMat : tyreDark, { edgeOpacity: 0.22 });
        put(spin, mainHub, hubMat, { edgeOpacity: 0.3 });
        spinners.push(spin);
        if (isT2) {
          tyre2Squash = squash;
          // the strips of rubber, not spinning: they trail back from the tyre's rear and flap
          for (let k = 0; k < 5; k++) {
            const a = (15 + k * 30) * DEG; // over the top of the tyre, rear to front
            const p = group0(squash, [Math.cos(a) * R * 0.95, Math.sin(a) * R * 0.95, (k % 2 ? 0.4 : -0.4)]);
            const g = box(3.4 + 0.7 * (k % 3), 0.9, 0.16, 0.06);
            g.translate((3.4 + 0.7 * (k % 3)) / 2, 0, 0);
            put(p, g, tyreMat, { edges: false });
            p.userData.a = a;
            p.userData.k = k;
            p.visible = false;
            strips.push(p);
          }
        }
      }
    }
  }
  // the nose gear: twin wheels, it swings forward to retract
  const NR = 2.0;
  const nYTop = B.y - B.h / 2 + 0.6;
  const nosePiv = group0(group, [NOSE_GEAR.x, nYTop, 0]);
  put(nosePiv, cylBetween([0, 0, 0], [0, 7.5 - nYTop, 0], 0.62), darkMat, { edgeOpacity: 0.3 });
  put(nosePiv, cylBetween([0, 7.8 - nYTop, 0], [0, NR - nYTop, 0], 0.42), oleoMat, { edgeOpacity: 0.3 });
  put(nosePiv, cylBetween([0, 11 - nYTop, 0], [-6, -0.2, 0], 0.26, 8), darkMat, { edges: false });
  const noseTyre = tyreGeo(NR, 1.2);
  const noseHub = hubGeo(NR, 1.2);
  for (const dz of [-NOSE_GEAR.dz, NOSE_GEAR.dz]) {
    const spin = group0(nosePiv, [0, NR - nYTop, dz]);
    put(spin, noseTyre, tyreDark, { edgeOpacity: 0.22 });
    put(spin, noseHub, hubMat, { edges: false });
    noseSpinners.push(spin);
  }

  /* ── the tyre piece: a ragged slab of rubber, magnified to read ── */
  const chunkGeo = new THREE.BoxGeometry(2.4, 0.55, 1.7, 3, 1, 3);
  {
    const r = rng(17);
    const p = chunkGeo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.8 + 0.4 * r()), p.getY(i) * (0.7 + 0.6 * r()), p.getZ(i) * (0.75 + 0.5 * r()));
    chunkGeo.computeVertexNormals();
  }
  const chunk = put(group, chunkGeo, tyreMat, { edgeOpacity: 0.7 }); // a piece OF tyre 2: red with it
  chunk.visible = false;
  const CH0 = new THREE.Vector3(GEAR.tyre2[0] - 1, GEAR.tyre.r * 1.9, GEAR.tyre2[2]);
  const CH1 = new THREE.Vector3(PX + 4, lowerY(PX + 4, PZ - 1) - 0.6, PZ - 1);

  /* ── the trails: a pivot kept level in the world, at the fire's root; another at the hole of tank 5 ── */
  const FIRE_ROOT = [2, 14.6, 16.8];
  const firePivot = group0(group, FIRE_ROOT);
  firePivot.rotation.order = "XZY";
  const holePivot = group0(group, [PX, PY - 0.5, PZ]);
  holePivot.rotation.order = "XZY";
  // the kerosene: a thread falling (< 0.15: the 1979 case), then the pale jet and its mist
  const drip = makeStream({ r0: 0.32, r1: 0.55, grow: 1, rise: -0.5, waveL: 40, tear: 0.28, soft: 0.9, freq: 0.6, scroll: 9, hot: C_PAPER.clone().multiplyScalar(0.9), mid: C_PAPER.clone().multiplyScalar(0.85), tail: C_PAPER.clone().multiplyScalar(0.7), additive: false, radial: 10, segs: 32 });
  holePivot.add(drip.mesh);
  const jet = makeStream({ r0: 1.1, r1: 15, grow: 0.7, rise: -0.03, wave: 3, tear: 0.42, soft: 1.1, freq: 0.06, scroll: 6, hot: C_PAPER.clone().multiplyScalar(0.92), mid: C_PAPER.clone().multiplyScalar(0.8), tail: C_PAPER.clone().multiplyScalar(0.6), additive: false });
  holePivot.add(jet.mesh);
  const mist = makePuffs({
    count: 80, seed: 35, life: 1.0, size: [2.5, 30], rise: 0, wobble: 3, soft: 1.7, color: C_PAPER.clone().multiplyScalar(0.8), maxPx: 300,
    origin: (r, o) => { o[0] = (r() - 0.5) * 2; o[1] = (r() - 0.5) * 1.5; o[2] = (r() - 0.5) * 2; },
    vel: (r, v) => { v[0] = 220 + 90 * r(); v[1] = -4 - 8 * r(); v[2] = (r() - 0.5) * 8; },
  });
  holePivot.add(mist.points);
  // THE FIRE
  const smoke = makePuffs({
    count: 150, seed: 31, life: 1.6, size: [10, 84], rise: 6, wobble: 6, soft: 1.7, color: C_SMOKE, maxPx: 440,
    origin: (r, o) => { o[0] = 6 + 40 * r(); o[1] = -3 + 6 * r(); o[2] = (r() - 0.5) * 8; },
    vel: (r, v) => { v[0] = 200 + 80 * r(); v[1] = 4 + 10 * r(); v[2] = (r() - 0.5) * 14; },
  });
  smoke.points.renderOrder = 3;
  firePivot.add(smoke.points);
  const outer = makeStream({ r0: 3.8, r1: 38, grow: 0.8, wave: 9, rise: 0.05, tear: 0.36, soft: 1.15, freq: 0.05, scroll: 7, hot: C_RED.clone().lerp(C_AMBER, 0.15).multiplyScalar(0.95), mid: C_RED.clone().multiplyScalar(0.9), tail: C_RED.clone().multiplyScalar(0.5) });
  firePivot.add(outer.mesh);
  const core = makeStream({ r0: 1.6, r1: 7, grow: 0.8, wave: 9, rise: 0.05, tear: 0.3, soft: 2.0, freq: 0.07, scroll: 9, hot: C_FIRE.clone().multiplyScalar(0.8), mid: C_RED.clone().multiplyScalar(0.9), tail: C_RED.clone().multiplyScalar(0.5) });
  firePivot.add(core.mesh);
  const flames = makePuffs({
    count: 110, seed: 33, life: 0.6, size: [5, 26], rise: 0, wobble: 2, soft: 1.5, additive: true, color: C_RED.clone().lerp(C_AMBER, 0.2).multiplyScalar(0.55), maxPx: 260,
    origin: (r, o) => { o[0] = (r() - 0.3) * 6; o[1] = (r() - 0.5) * 4; o[2] = (r() - 0.5) * 4; },
    vel: (r, v) => { v[0] = 180 + 120 * r(); v[1] = (r() - 0.5) * 12; v[2] = (r() - 0.5) * 12; },
  });
  firePivot.add(flames.points);
  const rootGlow = glowSprite(tex, 16);
  rootGlow.position.set(4, 0, 0);
  firePivot.add(rootGlow);
  const fireLight = new THREE.PointLight(C_RED.clone(), 0, 320, 2);
  fireLight.position.set(30, -5, 0);
  firePivot.add(fireLight);
  // the surge: flame puffs out of intakes 1 and 2
  const surge = makePuffs({
    count: 70, seed: 37, life: 0.4, size: [3, 18], rise: 0, wobble: 1, soft: 1.5, additive: true, color: C_FIRE.clone().multiplyScalar(0.9), maxPx: 200,
    origin: (r, o, i) => { o[0] = 21 + 2 * r(); o[1] = YC + (r() - 0.5) * 5; o[2] = (i % 2 ? E.z[0] : E.z[1]) + (r() - 0.5) * 5; },
    vel: (r, v) => { v[0] = -(30 + 60 * r()); v[1] = (r() - 0.5) * 20; v[2] = (r() - 0.5) * 20; },
  });
  group.add(surge.points);
  // under the wing nothing is lost in its shadow: only the airframe receives shadows (the gear, the nacelles, the engines read)
  group.traverse((m) => {
    if (m.isMesh && !m.userData.recv) m.receiveShadow = false;
  });
  const pts = [mist, smoke, flames, surge];
  const streams = [drip, jet, outer, core, ...reheat];

  /* ── anchors ── */
  const A = {
    focus: anchor(group, 0, B.y, 0),
    fault: anchor(group, 0, 0, 0),
    nose: anchor(nosePivot, PLANE.nose - hinge[0], B.y - hinge[1], 0),
    tank5: anchor(group, T5C[0], lowerY(T5C[0], T5C[1]), T5C[1]),
    panel: anchor(panelG, 0, 0, 0),
    tyre2: anchor(tyre2Squash, 0, 0, 0),
    gearLeft: anchor(legs[0], 0, (9.2 - legs[0].position.y) / 2, 0),
    engine1: anchor(faces[0], 0, 0, 0),
    engine2: anchor(faces[1], 0, 0, 0),
    nozzles: anchor(group, 121, YC, 0),
    fire: anchor(firePivot, 0, 0, 0),
    chunk: anchor(chunk, 0, 0, 0),
  };
  const faultOf = { [CULPRIT.tank5]: A.panel, [CULPRIT.tyre2]: A.tyre2, [CULPRIT.engine2]: A.engine2, [CULPRIT.gear]: A.gearLeft };
  let lastC = -1;
  const N = [1, 1, 1, 1];

  return {
    group,
    A,
    haloR: 24,
    update(S, time, px) {
      const pxs = px || 1000;
      // the part in fault
      const c = Math.round(S.culprit ?? 0);
      const F = clamp01(S.fault ?? 0);
      setAlarm(tank5Mat, c === CULPRIT.tank5 ? F : 0);
      heal(tank5Mat, c === CULPRIT.tank5 ? clamp01(S.depuis ?? 0) : 0);
      setAlarm(tyreMat, c === CULPRIT.tyre2 ? F : 0);
      setAlarm(engMat, c === CULPRIT.engine2 ? F : 0);
      setAlarm(gearMat, c === CULPRIT.gear ? F : 0);
      if (c !== lastC) {
        lastC = c;
        (faultOf[c] ?? A.focus).add(A.fault);
        A.fault.position.set(0, 0, 0);
      }

      // the gear: legs swing inward, the nose gear forward; the wheels roll with the distance
      const g = clamp01(S.gear ?? 1);
      legs[0].rotation.x = (1 - g) * Math.PI * 0.5;
      legs[1].rotation.x = -(1 - g) * Math.PI * 0.5;
      nosePiv.rotation.z = -(1 - g) * Math.PI * 0.5;
      const run = S.run ?? 0;
      for (let i = 0; i < spinners.length; i++) spinners[i].rotation.z = run / R;
      for (let i = 0; i < noseSpinners.length; i++) noseSpinners[i].rotation.z = run / NR;

      // tyre 2: squashed, its strips flapping
      const b = clamp01(S.burst ?? 0);
      tyre2Squash.scale.set(1, 1 - 0.3 * b, 1);
      tyre2Squash.position.y = R * (1 - 0.3 * b) - legs[0].position.y;
      for (let i = 0; i < strips.length; i++) {
        const p = strips[i];
        p.visible = b > 0.02;
        const k = p.userData.k;
        p.rotation.z = p.userData.a * 0.5 - 0.17 + 0.35 * Math.sin(time * 8.7 + k * 1.9) * b;
        p.rotation.y = (0.55 * Math.sin(time * 6.1 + k * 2.3) + (k % 2 ? 0.35 : -0.35)) * b;
        p.scale.set(0.15 + 0.85 * b, 1, 1);
      }

      // the tyre piece: up and forward to the intrados, the hit, it drops and vanishes
      const k = clamp01(S.chunk ?? 0);
      chunk.visible = b > 0.3 && k > 0.001 && k < 0.999;
      if (k < 0.85) {
        const q = k / 0.85;
        const e = 1 - (1 - q) * (1 - q);
        chunk.position.set(lerp(CH0.x, CH1.x, e) - 6 * Math.sin(Math.PI * e), lerp(CH0.y, CH1.y, e), lerp(CH0.z, CH1.z, e));
        chunk.scale.setScalar(1);
      } else {
        const q = (k - 0.85) / 0.15;
        chunk.position.set(CH1.x + 7 * q, CH1.y - 6 * q - 8 * q * q, CH1.z + 1.5 * q);
        chunk.scale.setScalar(Math.max(0.001, 1 - q));
      }
      chunk.rotation.set(k * 9, k * 6, k * 4);

      // tank 5's panel: it bulges, then is torn off and tumbles away
      const t = clamp01(S.tear ?? 0);
      dome.scale.y = 0.001 + 1.1 * smooth(0, 0.3, t);
      hole.visible = t > 0.3;
      panelG.visible = t < 0.995;
      if (t <= 0.3) {
        panelG.position.copy(panelHome);
        panelG.rotation.set(0, 0, 0);
      } else {
        const p = (t - 0.3) / 0.7;
        panelG.position.set(panelHome.x + 16 * p * p, panelHome.y - 1.5 * p - 20 * p * p, panelHome.z + 2 * p);
        panelG.rotation.set(p * 4, 0, p * 6.5);
      }

      // the engines: the blades (blur with speed; a spin-down that never runs backward), the reheat, the surge, the cutaway
      N[0] = clamp01(S.n1 ?? 1);
      N[1] = clamp01(S.n2 ?? 1);
      N[2] = clamp01(S.n3 ?? 1);
      N[3] = clamp01(S.n4 ?? 1);
      for (let i = 0; i < 4; i++) {
        const n = N[i];
        faces[i].rotation.x = 14 * (1 - n * n) + 9 * time * smooth(0.45, 0.75, n);
        const bl = smooth(0.3, 0.7, n);
        bladeMats[i].opacity = 1 - 0.85 * bl;
        blurMats[i].opacity = 0.72 * bl;
        const r = smooth(0.05, 0.6, n);
        const rh = reheat[i];
        rh.mesh.visible = r > 0.01;
        rh.u.uAmount.value = 0.85 * r;
        rh.u.uL.value = 5 + 13 * n;
        rhGlow[i].visible = r > 0.01;
        rhGlow[i].material.color.copy(C_AMBER).multiplyScalar(0.9 * r);
        rhGlow[i].scale.setScalar(8 + 6 * n);
      }
      const cut = smooth(0, 1, clamp01(S.cutaway ?? 0));
      walls.outerPivot.rotation.x = -2.0 * cut;
      walls.dOut.rotation.x = -1.65 * cut;
      walls.dIn.rotation.x = 1.65 * cut;
      ducts[0].visible = ducts[1].visible = cut < 0.02;
      const sg = clamp01(S.surge ?? 0);
      const pulse = smooth(0.55, 0.95, Math.max(Math.sin(time * 7.9), Math.sin(time * 5.3 + 1.7)));
      surge.u.uAmount.value = 0.9 * sg * pulse;
      surge.points.visible = sg > 0.003;

      // the trails, level in the world: cancel the group's pitch and bank (world: Ry · Rz · Rx → here Rx⁻¹ · Rz⁻¹)
      firePivot.rotation.set(-group.rotation.x, 0, -group.rotation.z);
      holePivot.rotation.set(-group.rotation.x, 0, -group.rotation.z);
      const L = clamp01(S.leak ?? 0);
      const dk = smooth(0.003, 0.03, L) * (1 - smooth(0.14, 0.3, L));
      drip.mesh.visible = dk > 0.003;
      drip.u.uAmount.value = 0.85 * dk;
      drip.u.uL.value = 40;
      const jk = smooth(0.12, 0.45, L);
      jet.mesh.visible = jk > 0.003;
      jet.u.uAmount.value = 0.4 * jk;
      jet.u.uL.value = 60 + 260 * L;
      mist.u.uAmount.value = 0.28 * jk;
      mist.points.visible = jk > 0.003;
      const f = clamp01(S.fire ?? 0);
      const fk = smooth(0, 0.15, f);
      const on = f > 0.003;
      outer.mesh.visible = core.mesh.visible = smoke.points.visible = flames.points.visible = rootGlow.visible = on;
      outer.u.uL.value = 400 * f;
      core.u.uL.value = 170 * f;
      outer.u.uAmount.value = 1.25 * fk;
      core.u.uAmount.value = 0.65 * fk;
      smoke.u.uAmount.value = 0.5 * smooth(0, 0.25, f);
      flames.u.uAmount.value = 0.55 * fk;
      rootGlow.material.color.copy(C_RED).multiplyScalar(0.45 * fk);
      fireLight.intensity = 420 * fk * (0.9 + 0.1 * Math.sin(time * 3.1));

      for (let i = 0; i < pts.length; i++) {
        pts[i].u.uTime.value = time;
        pts[i].u.uPx.value = pxs;
      }
      for (let i = 0; i < streams.length; i++) streams[i].u.uTime.value = time;
    },
  };
}
