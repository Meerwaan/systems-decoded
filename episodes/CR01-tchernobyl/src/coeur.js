// CR01 — coeur.js : the RBMK core in section, ≈ 1:10 (plan.js CORE, SLAB_LOW, SLAB_TOP, PIPES, VAULT, RODS). « La reconstitution »:
// matte clay under one hard light from −x, the −x half cut away by the plane x = 0, the cut faces toward the light.
//   buildCoeur() → { group, A, haloR, update(S, time, px) }
//   A: focus, fault (the lower half of the stack, where the power runs away), low, high, slab (rides on the slab), rods (the tips' mean
//      point, follows the rods), pipes (rides on the slab)
//   reads S: pLow pHigh rodsIn scram fault blast slab blast2 fire
//
// What it is made of:
//   · the graphite stack: 19 square columns across (a cylinder of columns: its outline is STEPPED), 8 courses high. In the cut face,
//     one groove per column — 10 fuel channels (narrow) and 9 rod channels (wide, a rod in each, the middle one at z = 0)
//   · the light of the power lives at the back of the grooves (a strip per channel): lower half `pLow`, upper half `pHigh`, papier;
//     the lower half turns alarm red with `fault` (the ONE red part: its clay reddens a little too)
//   · the lower plate and its legs, the upper slab (« un disque géant »: thick, light), the channel pipes on it, the concrete vault (dark)
//   · the rods: a dark absorber, a thin neck, a LIGHT foot (the « pied net » the camera follows down)
//   · the night's end: blast (pipes twist, steam jets, two flashes with a place, channels to white), slab (lifts, tilts, pipes ride on it),
//     blast2 (a flash, graphite blocks thrown on slow ballistic arcs that land flat around, sparks), fire (the top of the stack glows
//     block by block, embers rise, dark smoke)
// Everything depends on S and `time` only; update() allocates nothing (it runs sixteen times per frame).
import * as THREE from "three";
import { box, cyl, mergeGeometries } from "@kit/build3d.js";
import { clay, clayEdges, alarm, setAlarm, safe, RECON } from "@kit/reconstitution.js";
import { rng } from "@kit/rng.js";
import { CORE, SLAB_LOW, SLAB_TOP, PIPES, VAULT, RODS } from "./plan.js";

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

/* ───────── the layout of the cut face ───────── */
const NCOL = 19; // columns across the diameter
const C = (2 * CORE.r) / NCOL; // ≈ 6.2: one column
const U = (NCOL * C) / 2; // = CORE.r
const colZ = (i) => (i - (NCOL - 1) / 2) * C;
const isRod = (i) => i % 2 === 1; // 9 rod channels (the middle column, i = 9, is one), 10 fuel channels
const ROD_G = { w: 4.0, d: 2.7 }; // the rod's groove in the cut face (width along z, depth into +x)
const FUEL_G = { w: 1.6, d: 1.6 };
const groove = (i) => (isRod(i) ? ROD_G : FUEL_G);
const ROD_R = 1.85; // thick: a rod is a dark bar you follow, not a line
const ROD_X = 0.75; // the rod's axis: sunk in its groove, a little proud of the cut
const NL = 8; // courses of graphite
const LH = (CORE.y1 - CORE.y0) / NL;
const YMID = (CORE.y0 + CORE.y1) / 2; // where the lower half ends
const SLAB_MID = (SLAB_TOP.y0 + SLAB_TOP.y1) / 2;
const SLAB_H = SLAB_TOP.y1 - SLAB_TOP.y0;

// how deep the stepped outline goes at column i (the cut runs through the middle of the first row of columns)
const vmax = (i) => {
  const z = Math.abs(colZ(i));
  const J = Math.floor(Math.sqrt(Math.max(0, CORE.r * CORE.r - z * z)) / C + 1e-6);
  return (J + 0.5) * C;
};

// the outline [u = z, v = x] of the cut edge, from u0 to u1, with a notch per channel (or none)
function cutEdge(u0, u1, notched) {
  const pts = [[u0, 0]];
  if (notched)
    for (let i = 0; i < NCOL; i++) {
      const g = groove(i);
      const z = colZ(i);
      pts.push([z - g.w / 2, 0], [z - g.w / 2, g.d], [z + g.w / 2, g.d], [z + g.w / 2, 0]);
    }
  pts.push([u1, 0]);
  return pts;
}
const stackOutline = (notched) => {
  const pts = cutEdge(-U, U, notched);
  for (let i = NCOL - 1; i >= 0; i--) {
    const z = colZ(i);
    const v = vmax(i);
    pts.push([z + C / 2, v], [z - C / 2, v]);
  }
  return pts;
};
const discOutline = (R, notched, seg = 64) => {
  const pts = cutEdge(-R, R, notched);
  for (let k = 1; k < seg; k++) {
    const a = (k / seg) * Math.PI;
    pts.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  return pts;
};

// shape (u = z, v = x) extruded along w → y: a proper rotation (x' = v, y' = w, z' = u)
const ROT = new THREE.Matrix4().set(0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1);
function prism(outline, y0, h) {
  const clean = outline.filter((p, k) => {
    const q = outline[(k + 1) % outline.length];
    return Math.abs(p[0] - q[0]) > 1e-4 || Math.abs(p[1] - q[1]) > 1e-4;
  });
  const shape = new THREE.Shape(clean.map(([u, v]) => new THREE.Vector2(u, v)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 1, steps: 1 });
  geo.applyMatrix4(ROT);
  geo.translate(0, y0, 0);
  return geo;
}

/* ───────── the light in the channels ───────── */
const stripMat = () =>
  new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0, 0, 0) },
      uWhite: { value: new THREE.Color(2.4, 2.35, 2.2) },
      uFlash: { value: 0 },
      uTime: { value: 0 },
      uPulse: { value: 0.3 },
      uY0: { value: 0 },
      uY1: { value: 1 },
      uRise: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float aPhase; attribute float aShade;
      varying float vY; varying float vPhase; varying float vShade;
      void main() {
        vY = position.y; vPhase = aPhase; vShade = aShade;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uWhite; uniform float uFlash, uTime, uPulse, uY0, uY1, uRise;
      varying float vY; varying float vPhase; varying float vShade;
      void main() {
        float t = clamp((vY - uY0) / max(uY1 - uY0, 0.001), 0.0, 1.0);
        float ramp = mix(1.0, uRise, t);
        // a slow wave of light that climbs the channel (11 cm/s, 17 cm apart: far under a seventh of a period per frame)
        float w = 0.5 + 0.5 * sin(6.2831853 * ((vY - uTime * 11.0) / 17.0 + vPhase));
        float pulse = 1.0 + uPulse * (w * w - 0.38);
        vec3 c = uColor * ramp * pulse * (0.55 + 0.45 * clamp(vShade, 0.0, 1.0));
        gl_FragColor = vec4(mix(c, uWhite, clamp(uFlash, 0.0, 1.0)), 1.0);
      }`,
  });

// one strip per channel at the back of its groove, three vertices across (the middle brighter: a lit bore)
function stripGeometry(y0, y1) {
  const pos = [];
  const phase = [];
  const shade = [];
  const idx = [];
  for (let i = 0; i < NCOL; i++) {
    const g = groove(i);
    const z = colZ(i);
    const x = g.d - 0.05;
    const half = g.w / 2 - 0.04;
    const ph = (i * 0.618) % 1;
    const b = pos.length / 3;
    [-half, 0, half].forEach((dz, k) => {
      pos.push(x, y0, z + dz, x, y1, z + dz);
      phase.push(ph, ph);
      shade.push(k === 1 ? 1 : 0, k === 1 ? 1 : 0);
    });
    // columns of vertices b+0/1 (edge), b+2/3 (middle), b+4/5 (edge); faces toward −x
    for (let k = 0; k < 2; k++) {
      const a = b + 2 * k;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aPhase", new THREE.Float32BufferAttribute(phase, 1));
  geo.setAttribute("aShade", new THREE.Float32BufferAttribute(shade, 1));
  geo.setIndex(idx);
  return geo;
}

/* ───────── what flies: steam, smoke, embers, sparks (points placed in the shader, from a seed and the time) ───────── */
function makePuffs({ count, seed, origin, vel, life = 1, size = [2, 10], rise = 0, wobble = 0, soft = 1.6, color, additive = false, burst = false, maxPx = 320 }) {
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
    uColor: { value: new THREE.Color(color) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uS, uAmount, uPx, uLife, uSize0, uSize1, uRise, uWobble, uMaxPx, uBurst;
      attribute vec3 aVel; attribute vec4 aSeed; varying float vA;
      void main() {
        float life = uLife * aSeed.y;
        float f = uBurst > 0.5 ? clamp(uS, 0.0, 1.0) : fract(uTime / life + aSeed.x);
        float age = f * life;
        vec3 p = position + aVel * age + vec3(0.0, 0.5 * uRise * age * age, 0.0);
        p.x += uWobble * f * sin(uTime * 0.9 + aSeed.x * 17.0);
        p.z += uWobble * f * cos(uTime * 0.7 + aSeed.x * 11.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float size = mix(uSize0, uSize1, f) * aSeed.z;
        gl_PointSize = clamp(size * uPx / max(1.0, -mv.z), 0.0, uMaxPx);
        gl_Position = projectionMatrix * mv;
        float fade = uBurst > 0.5
          ? smoothstep(0.0, 0.03, f) * (1.0 - smoothstep(0.55, 1.0, f))
          : smoothstep(0.0, 0.1, f) * pow(clamp(1.0 - f, 0.0, 1.0), 1.4);
        vA = uAmount * aSeed.w * fade;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uSoft; varying float vA;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float r2 = dot(q, q) * 4.0;
        if (r2 > 1.0 || vA < 0.002) discard;
        float a = vA * pow(clamp(1.0 - r2, 0.0, 1.0), uSoft);
        gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0));
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 5;
  return { points, u: uniforms };
}

// a light that has a place: a bright core and a long tail (computed, not drawn: no DOM)
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

/* ───────── the top of the stack, burning block by block (seen once the slab is gone) ───────── */
const fireMat = () =>
  new THREE.ShaderMaterial({
    uniforms: { uFire: { value: 0 }, uTime: { value: 0 }, uColor: { value: new THREE.Color(RECON.alarme) } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uFire, uTime; uniform vec3 uColor; varying vec2 vP;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 cell = floor(vec2(vP.y, vP.x) / ${C.toFixed(4)} + vec2(0.5, 0.5));
        vec2 f = fract(vec2(vP.y, vP.x) / ${C.toFixed(4)} + vec2(0.5, 0.5));
        float h = hash(cell);
        float joint = smoothstep(0.0, 0.1, f.x) * smoothstep(1.0, 0.9, f.x) * smoothstep(0.0, 0.1, f.y) * smoothstep(1.0, 0.9, f.y);
        float live = 0.72 + 0.28 * sin(uTime * (0.5 + 0.4 * h) + h * 31.0);
        float k = uFire * (0.25 + 0.75 * h * h) * live * joint;
        gl_FragColor = vec4(vec3(0.035) + uColor * 1.15 * k, 1.0);
      }`,
  });

export function buildCoeur() {
  const group = new THREE.Group();
  const add = (geo, mat, x, y, z, parent = group, o = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = o.cast ?? true;
    m.receiveShadow = true;
    if (o.edges !== false) m.add(clayEdges(o.edgeGeo ?? geo, { opacity: o.edgeOpacity }));
    parent.add(m);
    return m;
  };

  /* the graphite stack: the lower four courses (the part in fault) and the upper four, each its own matter */
  const lowMat = alarm({ tone: -1, noOk: true }); // 05/11: only the rods go green with `ok`, never the burning bottom
  const highMat = clay({ tone: -1 });
  // graphite under the hard light: dark, so that the light of the channels is the brightest thing in the face
  lowMat.userData.clayBase.multiplyScalar(0.55);
  highMat.color.multiplyScalar(0.55);
  const sEdge = { edgeOpacity: 0.16 };
  const courses = (k0, k1, notched) => mergeGeometries(Array.from({ length: k1 - k0 }, (_, k) => prism(stackOutline(notched), CORE.y0 + (k0 + k) * LH, LH)));
  add(courses(0, NL / 2, true), lowMat, 0, 0, 0, group, { ...sEdge, edgeGeo: courses(0, NL / 2, false) });
  add(courses(NL / 2, NL, true), highMat, 0, 0, 0, group, { ...sEdge, edgeGeo: courses(NL / 2, NL, false) });

  /* the light of the power, at the back of every groove */
  const lowStrip = stripMat();
  Object.assign(lowStrip.uniforms.uY0, { value: CORE.y0 });
  Object.assign(lowStrip.uniforms.uY1, { value: YMID });
  const highStrip = stripMat();
  Object.assign(highStrip.uniforms.uY0, { value: YMID });
  Object.assign(highStrip.uniforms.uY1, { value: CORE.y1 });
  add(stripGeometry(CORE.y0 + 0.25, YMID), lowStrip, 0, 0, 0, group, { cast: false, edges: false });
  add(stripGeometry(YMID, CORE.y1 - 0.25), highStrip, 0, 0, 0, group, { cast: false, edges: false });

  /* the lower plate, its legs (the water comes in from below) */
  const plateMat = clay({ tone: -1 });
  plateMat.color.multiplyScalar(0.7); // dark: the red above it is the subject
  add(prism(discOutline(SLAB_LOW.r, false), SLAB_LOW.y0, SLAB_LOW.y1 - SLAB_LOW.y0), plateMat, 0, 0, 0);
  const legMat = clay({ tone: -0.6 });
  const legGeo = cyl(2.6, SLAB_LOW.y0, 0.3, 24);
  [1, 5, 9, 13, 17].forEach((i) => add(legGeo, legMat, 7, SLAB_LOW.y0 / 2, colZ(i)));
  const legGeo2 = cyl(2.6, SLAB_LOW.y0, 0.3, 24);
  [3, 9, 15].forEach((i) => add(legGeo2, legMat, 34, SLAB_LOW.y0 / 2, colZ(i)));

  /* the concrete vault, a U open toward −x */
  const wall = clay({ tone: -1 });
  wall.color.multiplyScalar(0.42); // concrete in the dark: it frames, it never competes
  const vEdge = { edgeOpacity: 0.14 };
  add(box(VAULT.wall, VAULT.y1, VAULT.half * 2 + VAULT.wall, 0.6), wall, VAULT.half, VAULT.y1 / 2, 0, group, vEdge);
  add(box(VAULT.half, VAULT.y1, VAULT.wall, 0.6), wall, VAULT.half / 2, VAULT.y1 / 2, -VAULT.half, group, vEdge);
  add(box(VAULT.half, VAULT.y1, VAULT.wall, 0.6), wall, VAULT.half / 2, VAULT.y1 / 2, VAULT.half, group, vEdge);

  /* the fire on top of the stack (under the slab until it flies) */
  const fire = fireMat();
  const topGeo = new THREE.ShapeGeometry(new THREE.Shape(stackOutline(false).map(([u, v]) => new THREE.Vector2(u, v))));
  topGeo.applyMatrix4(ROT); // the shape lies in (z, x) at y = 0, facing +y
  const top = add(topGeo, fire, 0, CORE.y1 + 0.2, 0, group, { cast: false, edges: false });
  top.receiveShadow = false;

  /* the upper slab, « un disque géant », and the channel pipes riding on it */
  const slab = new THREE.Group();
  slab.position.y = SLAB_MID;
  group.add(slab);
  add(prism(discOutline(SLAB_TOP.r, true), -SLAB_H / 2, SLAB_H), clay({ tone: 0.62 }), 0, 0, 0, slab, { edgeGeo: prism(discOutline(SLAB_TOP.r, false), -SLAB_H / 2, SLAB_H) });
  const pipeMat = clay({ tone: -0.55 }); // they recede: the slab is the light thing up there
  const pipeGeo = cyl(2.2, PIPES.y1 - PIPES.y0, 0.3, 24);
  const flangeGeo = cyl(3.2, 2.4, 0.3, 24);
  const prand = rng(41);
  const pipes = [];
  const pipeAt = [];
  for (let i = 0; i < NCOL; i += 4) pipeAt.push([3, colZ(i)]); // 5 on the cut row, the others behind: few and thick
  for (const i of [1, 5, 9, 13, 17]) pipeAt.push([22, colZ(i)]);
  for (const i of [4, 8, 10, 14]) pipeAt.push([41, colZ(i)]);
  pipeAt.slice(0, PIPES.count).forEach(([x, z]) => {
    const p = new THREE.Group();
    p.position.set(x, SLAB_H / 2, z);
    slab.add(p);
    add(pipeGeo, pipeMat, 0, (PIPES.y1 - PIPES.y0) / 2, 0, p);
    add(flangeGeo, pipeMat, 0, 1.1, 0, p);
    pipes.push({ g: p, ax: (prand() - 0.5) * 0.55, az: (prand() - 0.5) * 0.55 });
  });

  /* the rods: dark absorber, a neck, a light foot. The group's origin is the tip. */
  const rodMat = clay({ tone: -1 });
  rodMat.color.multiplyScalar(0.62); // the darkest thing on the table: dark on the light of the channels
  // above the slab a withdrawn rod is inside the machine, not in the picture: its absorber is cut off at `uClipTop` (world y)
  const absMat = safe(rodMat.clone()); // the rods that brake: green when the system works (S.ok)
  safe(rodMat);
  const clipTop = { value: SLAB_TOP.y1 };
  absMat.onBeforeCompile = (sh) => {
    sh.uniforms.uClipTop = clipTop;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vClipY;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvClipY = (modelMatrix * vec4(transformed, 1.0)).y;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vClipY;\nuniform float uClipTop;")
      .replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\nif (vClipY > uClipTop) discard;");
  };
  absMat.customProgramCacheKey = () => "coeur-rod-clip";
  const footMat = clay({ tone: 0.5 });
  const FOOT = 8;
  const NECK = 2.4;
  const ABS = 92; // long enough to run up through the slab from the deepest tip
  const footGeo = cyl(ROD_R, FOOT, 0.35, 24);
  const neckGeo = cyl(0.7, NECK, 0.15, 16);
  const absGeo = cyl(ROD_R, ABS, 0.35, 24);
  const rods = [];
  let nRod = 0;
  for (let i = 0; i < NCOL; i++) if (isRod(i)) nRod++;
  let k = 0;
  for (let i = 0; i < NCOL; i++) {
    if (!isRod(i)) continue;
    const r = new THREE.Group();
    r.position.set(ROD_X, RODS.park, colZ(i));
    group.add(r);
    add(footGeo, footMat, 0, FOOT / 2, 0, r);
    add(neckGeo, rodMat, 0, FOOT + NECK / 2, 0, r);
    const ab = add(absGeo, absMat, 0, FOOT + NECK + ABS / 2, 0, r, { edges: false });
    ab.castShadow = false;
    // the order they go in: the middle rod (z = 0) first, then alternating sides — they come and go one by one, spread out
    rods.push({ g: r, rank: ((k - (nRod - 1) / 2 + nRod) * 4) % nRod, lean: ((k * 0.37) % 1) - 0.5 });
    k++;
  }

  /* graphite thrown by the second explosion: slow ballistic arcs, landing flat around the vault */
  const brand = rng(7);
  const blockGeo = box(C * 0.9, LH * 0.95, C * 0.9, 0.35);
  const blockMat = clay({ tone: -0.3 });
  const blocks = [];
  for (let b = 0; b < 26; b++) {
    const m = add(blockGeo, blockMat, 0, 0, 0);
    const sc = 1 + 0.8 * brand();
    m.scale.setScalar(sc);
    m.visible = false;
    const p0 = [3 + 40 * brand(), CORE.y1 + 4, (brand() - 0.5) * 100];
    const side = b % 4;
    let land;
    if (side < 2) land = [-150 + 300 * brand(), (side ? 1 : -1) * (145 + 130 * brand())];
    else if (side === 2) land = [-80 - 170 * brand(), (brand() - 0.5) * 240];
    else land = [150 + 110 * brand(), (brand() - 0.5) * 300];
    const q = () => (1 + Math.floor(brand() * 3)) * (Math.PI / 2) * (brand() < 0.5 ? -1 : 1);
    blocks.push({ m, p0, land, yl: (LH * 0.95 * sc) / 2, h: 110 + 190 * brand(), rx: q(), ry: brand() * TAU, rz: q(), d: 0.12 * brand() });
  }

  /* steam (blast), sparks (blast2), embers and smoke (fire) */
  const fuelTops = [];
  for (let i = 0; i < NCOL; i += 2) fuelTops.push(colZ(i));
  const steamTop = makePuffs({
    count: 200, seed: 3, life: 1.5, size: [8, 58], rise: 30, wobble: 6, soft: 2.6, color: new THREE.Color(RECON.papier).multiplyScalar(1.05),
    origin: (r, o) => {
      const p = pipeAt[Math.floor(r() * PIPES.count)];
      o[0] = p[0]; o[1] = SLAB_H / 2 + (PIPES.y1 - PIPES.y0); o[2] = p[1];
    },
    vel: (r, v) => { v[0] = (r() - 0.5) * 30; v[1] = 90 + 70 * r(); v[2] = (r() - 0.5) * 30; },
  });
  slab.add(steamTop.points);
  const steamSeam = makePuffs({
    count: 180, seed: 5, life: 1.3, size: [7, 46], rise: 40, wobble: 5, soft: 2.6, color: new THREE.Color(RECON.papier).multiplyScalar(1.05),
    origin: (r, o) => { o[0] = 0.5; o[1] = CORE.y1 + 1; o[2] = fuelTops[Math.floor(r() * fuelTops.length)]; },
    vel: (r, v) => { v[0] = -60 - 50 * r(); v[1] = 25 + 40 * r(); v[2] = (r() - 0.5) * 40; },
  });
  group.add(steamSeam.points);
  const sparks = makePuffs({
    count: 140, seed: 9, life: 2.4, size: [1.6, 0.9], rise: -60, burst: true, soft: 1.2, additive: true, color: new THREE.Color(RECON.alarme).multiplyScalar(1.25), maxPx: 18,
    origin: (r, o) => { o[0] = 5 + 45 * r(); o[1] = CORE.y1 + 2; o[2] = (r() - 0.5) * 100; },
    vel: (r, v, o) => {
      const a = r() * TAU;
      const s = 50 + 90 * r();
      v[0] = Math.cos(a) * s * 0.8 + o[0] * 0.3; v[1] = 70 + 120 * r(); v[2] = Math.sin(a) * s;
    },
  });
  group.add(sparks.points);
  const coreTop = (r, o) => {
    const z = (r() - 0.5) * 2 * (U - 4);
    o[0] = r() * Math.sqrt(Math.max(0, CORE.r * CORE.r - z * z)) * 0.95;
    o[1] = CORE.y1 + 1;
    o[2] = z;
  };
  const embers = makePuffs({
    count: 190, seed: 11, life: 4.5, size: [2.4, 1.2], rise: 4, wobble: 10, soft: 1.2, additive: true, color: new THREE.Color(RECON.alarme).multiplyScalar(1.25), maxPx: 22,
    origin: coreTop,
    vel: (r, v) => { v[0] = (r() - 0.5) * 10; v[1] = 22 + 26 * r(); v[2] = (r() - 0.5) * 10; },
  });
  group.add(embers.points);
  const smoke = makePuffs({
    count: 80, seed: 13, life: 6.5, size: [16, 90], rise: 2, wobble: 18, soft: 1.8, color: new THREE.Color(RECON.papier).multiplyScalar(0.22),
    origin: coreTop,
    vel: (r, v) => { v[0] = 4 + (r() - 0.5) * 10; v[1] = 26 + 18 * r(); v[2] = (r() - 0.5) * 12; },
  });
  group.add(smoke.points);

  /* two flashes that have a place: the tubes bursting (blast), the second explosion (blast2) */
  const tex = glowTexture();
  const flashMat = new THREE.SpriteMaterial({ map: tex, color: 0x000000, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
  const flash = new THREE.Sprite(flashMat);
  flash.position.set(14, CORE.y1 + 6, 0);
  flash.renderOrder = 6;
  group.add(flash);

  const anchor = (x, y, z, parent = group) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };
  const A = {
    focus: anchor(0, 80, 0),
    fault: anchor(4, (CORE.y0 + YMID) / 2, 0),
    low: anchor(1, (CORE.y0 + YMID) / 2, 0),
    high: anchor(1, (YMID + CORE.y1) / 2, 0),
    slab: anchor(0, SLAB_H / 2, 0, slab),
    rods: anchor(ROD_X, RODS.park, 0),
    pipes: anchor(6, SLAB_H / 2 + (PIPES.y1 - PIPES.y0) / 2, 0, slab),
  };

  const PAP = new THREE.Color(RECON.papier);
  const ALR = new THREE.Color(RECON.alarme);

  return {
    group, A, haloR: 70,
    update(S, time, px) {
      const pLow = clamp01(S.pLow ?? 0);
      const pHigh = clamp01(S.pHigh ?? 0);
      const fault = clamp01(S.fault ?? 0);
      const blast = clamp01(S.blast ?? 0);
      const lift = clamp01(S.slab ?? 0);
      const blast2 = clamp01(S.blast2 ?? 0);
      const burn = clamp01(S.fire ?? 0);

      // two flashes with a place, and the channels whitening under them
      const fl = 0.45 * bump(blast, 0.14, 0.14) + bump(blast, 0.74, 0.16) + 1.15 * bump(blast2, 0.05, 0.07);
      const breath = 1 + 0.07 * Math.sin((TAU * time) / 2.8);

      // the power: papier, the lower half going to alarm red with `fault`
      // papier: « à peine un pour cent » must read dim (0.03 → 0.04), « en flèche » bright, never past 1.6
      const kPl = Math.min(1.6, 0.01 + 2.2 * Math.pow(pLow, 1.15));
      const kAl = (0.36 + 0.56 * pLow) * breath; // past ≈ 1 the tone mapping turns the red pink
      lowStrip.uniforms.uColor.value.setRGB(
        PAP.r * kPl * (1 - fault) + ALR.r * kAl * fault,
        PAP.g * kPl * (1 - fault) + ALR.g * kAl * fault,
        PAP.b * kPl * (1 - fault) + ALR.b * kAl * fault,
      );
      lowStrip.uniforms.uRise.value = 1 - 0.45 * fault; // in fault, the bottom burns brightest
      // the same curve up top; in fault it is held lower, so the white never outshines the red bottom (t7: pHigh 0.9)
      const kPhFree = Math.min(1.6, 0.01 + 2.2 * Math.pow(pHigh, 1.15));
      const kPh = kPhFree + (Math.min(1.0, 0.01 + 1.25 * Math.pow(pHigh, 1.15)) - kPhFree) * fault;
      highStrip.uniforms.uColor.value.setRGB(PAP.r * kPh, PAP.g * kPh, PAP.b * kPh);
      lowStrip.uniforms.uTime.value = highStrip.uniforms.uTime.value = time;
      lowStrip.uniforms.uFlash.value = highStrip.uniforms.uFlash.value = Math.min(0.7, 0.6 * fl);
      setAlarm(lowMat, fault * (0.5 + 0.3 * pLow)); // V3 (05/11): the lower half is PAINTED alarm red and glows — the fault reads at 270 px

      // the rods: `rodsIn` takes them in one by one (half-way down), `scram` drives them all toward the bottom
      const nIn = clamp01(S.rodsIn ?? 0) * rods.length;
      const scram = clamp01(S.scram ?? 0);
      let sum = 0;
      for (let i = 0; i < rods.length; i++) {
        const r = rods[i];
        const w = smooth(0, 1, nIn - r.rank);
        const base = 0.5 * w;
        const depth = base + (1 - base) * scram;
        const y = RODS.park - RODS.travel * depth;
        r.g.position.y = y;
        r.g.rotation.x = 0.05 * blast2 * r.lean;
        sum += y;
      }
      A.rods.position.y = sum / rods.length;

      // the slab: a hop when the steam explodes, then the flight (its shape is reconstituted: no angle is given)
      slab.position.y = SLAB_MID + SLAB_TOP.lift * lift + 2.5 * bump(blast, 0.74, 0.2);
      slab.rotation.x = 0.17 * lift;
      clipTop.value = SLAB_TOP.y1 + 400 * lift;
      slab.rotation.z = -0.07 * lift;
      for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];
        p.g.rotation.x = p.ax * blast;
        p.g.rotation.z = p.az * blast;
      }

      // the graphite thrown out
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const s = clamp01((blast2 - b.d) / (1 - b.d));
        b.m.visible = blast2 > b.d + 0.002;
        if (!b.m.visible) continue;
        const e = 1 - (1 - s) * (1 - s) * 0.35; // a touch faster at the start
        const u = Math.min(1, e);
        b.m.position.set(b.p0[0] + (b.land[0] - b.p0[0]) * u, b.p0[1] + (b.yl - b.p0[1]) * u + 4 * b.h * u * (1 - u), b.p0[2] + (b.land[1] - b.p0[2]) * u);
        b.m.rotation.set(b.rx * u, b.ry * u, b.rz * u);
      }

      // what flies
      const pxs = px || 1000;
      steamTop.u.uTime.value = steamSeam.u.uTime.value = embers.u.uTime.value = smoke.u.uTime.value = time;
      steamTop.u.uPx.value = steamSeam.u.uPx.value = sparks.u.uPx.value = embers.u.uPx.value = smoke.u.uPx.value = pxs;
      const steam = smooth(0.02, 0.2, blast) * (1 - 0.55 * smooth(0.3, 1, lift));
      steamTop.u.uAmount.value = 0.4 * steam;
      steamSeam.u.uAmount.value = 0.42 * steam * (1 - 0.7 * lift);
      steamTop.points.visible = steamSeam.points.visible = steam > 0.003;
      sparks.u.uS.value = blast2;
      sparks.u.uAmount.value = blast2 > 0 && blast2 < 1 ? 1 : 0;
      sparks.points.visible = blast2 > 0.001 && blast2 < 0.999;
      embers.u.uAmount.value = burn;
      smoke.u.uAmount.value = 0.5 * burn;
      embers.points.visible = smoke.points.visible = burn > 0.003;

      // the top of the stack, burning (only seen once the slab has gone)
      fire.uniforms.uFire.value = burn;
      fire.uniforms.uTime.value = time;
      top.visible = lift > 0.02 || blast2 > 0.01;

      // the flash
      const fk = Math.min(2.6, 2.4 * fl);
      flash.visible = fk > 0.01;
      flashMat.color.setRGB(fk, fk * 0.96, fk * 0.9);
      const fs = 90 + 120 * Math.min(1, fl);
      flash.scale.set(fs, fs, 1);
    },
  };
}
