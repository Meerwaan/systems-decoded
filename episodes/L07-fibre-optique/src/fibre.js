// DOSSIER L07 — fibre.js : THE SOLID SYSTEMS, on the bench (place BANC). One item at a time (S.item, world.js · ITEM).
//
//   buildFibre() → { group, items, A, update(S, time, px) }
//   group   added by world.js to the BANC place, at the origin (the bench's pool centred on it, its top at y = 0)
//   items   one Group per ITEM: cable, fibre, principe, hist, docs, subsea, multi, splice, coupler, plug —
//           update() shows the one S.item names, hides the others (and only updates that one)
//   A       anchors: glassEnd, coreEnd, rayHead, bendLeak, histEnd, histMarks[3], subseaEnd, splicePoint, arcPoint,
//           couplerIn, couplerOut, ferrule, ont
//   update  reads: item, explode, named, pulse, flow, core, ray, steep, bend, leak, dim, clear, impure, doc, docIn,
//           layers, assemble, cleave, skew, align, arc, fused, sleeve, split, upstream, turns, plug, bevel, ont, mood
//
// THE LIGHT: one material for every light that runs in a fibre (`flowMat`): dashes with a bright head and a trail,
// read along the mesh's local x, `pulse` their presence, `flow` their speed (one period every 1/3 s at flow 1: a
// dash moves a tenth of its period per frame — never a jump). A steady fill (`uBase`) is the core lit (`core`).
// THE BEND: FIBRE and PRINCIPE bend in the vertex shader (`bendPos`, the same in JS for the rays drawn through them):
// past `uBendX` (on the side `uBendDir`), the axis follows an arc of radius `uBendR` over `uBendA` radians, toward +y.
// Glass here is SOLID glass (translucent, light, thick), never an X-ray shell — only the plug's wall is X-ray.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, edgesOf, lathe, box, cyl, makePart, addMesh, setPartOpacity, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { FIBER, CABLE, PRINCIPE, HIST, DOCS, SUBSEA, MULTI, SPLICE, COUPLER, PLUG } from "./plan.js";

const DEG = Math.PI / 180;
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const settle = (u) => { const e = ease(u); return e + Math.sin(Math.PI * u) ** 2 * 0.05 * (u > 0.5 ? 1 : 0.2); };
const bump = (x, c, w) => Math.exp(-((x - c) * (x - c)) / (w * w));

/* three greys (and the glass, the lightest): the system reads by its shading */
const GREY = { dark: 0x5f676b, mid: 0x868e92, light: 0xabb2b5, pale: 0xc8cdcf, glass: 0xd6dddf };

/* ───────────────────────────── shaders ───────────────────────────── */

const BEND_GLSL = /* glsl */ `
uniform float uBendA, uBendR, uBendX, uBendDir;
vec3 bendPos(vec3 p, inout vec3 n) {
  float s = (p.x - uBendX) * uBendDir;
  if (s <= 0.0 || uBendA < 1e-4) return p;
  float t = min(s, uBendR * uBendA);
  float a = t / max(uBendR, 1e-3);
  float ca = cos(a), sa = sin(a);
  vec2 fwd = vec2(uBendDir * ca, sa);
  vec2 nrm = vec2(-uBendDir * sa, ca);
  vec2 c = vec2(uBendX + uBendDir * uBendR * sa, uBendR * (1.0 - ca));
  vec2 q = c + fwd * (s - t) + nrm * p.y;
  vec2 ex = uBendDir * fwd;
  n = vec3(ex * n.x + nrm * n.y, n.z);
  return vec3(q, p.z);
}`;
const bendUniforms = (R = 1, X = 0, dir = 1) => ({ uBendA: { value: 0 }, uBendR: { value: R }, uBendX: { value: X }, uBendDir: { value: dir } });
const NOBEND = bendUniforms();

/** The same bend, in JS (for rays and anchors drawn through a bent tube). Writes into `out` (x, y). */
function bendXY(x, y, U, out) {
  const A = U.uBendA.value, R = U.uBendR.value, X = U.uBendX.value, dir = U.uBendDir.value;
  const s = (x - X) * dir;
  if (s <= 0 || A < 1e-4) return out.set(x, y, 0);
  const t = Math.min(s, R * A), a = t / R, ca = Math.cos(a), sa = Math.sin(a);
  return out.set(X + dir * R * sa + dir * ca * (s - t) - dir * sa * y, R * (1 - ca) + sa * (s - t) + ca * y, 0);
}

/** Patch a lit material so it bends with `U`. Its mesh must cast no shadow while bent (the depth pass is straight). */
function bendable(mat, U) {
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\n" + BEND_GLSL)
      .replace("#include <beginnormal_vertex>", "#include <beginnormal_vertex>\nvec3 bN = objectNormal; vec3 bP = bendPos(position, bN); objectNormal = bN;")
      .replace("#include <begin_vertex>", "vec3 transformed = bP;");
  };
  mat.customProgramCacheKey = () => "sd-l07-bend";
  return mat;
}

const FLOW_VS = /* glsl */ `
${BEND_GLSL}
varying float vX; varying float vFacing;
void main() {
  vec3 n = normal;
  vec3 p = bendPos(position, n);
  vX = position.x;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFacing = abs(dot(normalize(normalMatrix * n), normalize(-mv.xyz)));
  gl_Position = projectionMatrix * mv;
}`;
const FLOW_FS = /* glsl */ `
uniform vec3 uColor;
uniform float uTime, uPeriod, uSpeed, uDuty, uBase, uDash, uDir, uX0, uHalf, uFront, uDimX, uDimK, uCutX, uCutK, uEdge;
varying float vX; varying float vFacing;
void main() {
  float d = (vX - uX0) * uDir;
  float u = fract((d - uTime * uSpeed) / uPeriod);
  float dash = pow(smoothstep(1.0 - uDuty, 1.0, u), 2.0) * (1.0 - smoothstep(0.95, 1.0, u));
  float env = uHalf > 0.0 ? exp2(-max(d, 0.0) / uHalf) : 1.0;
  env *= 1.0 - smoothstep(uFront - 25.0, uFront, d);
  env *= vX < uDimX ? uDimK : 1.0;
  env *= vX > uCutX ? uCutK : 1.0;
  float body = mix(1.0, smoothstep(0.05, 0.8, vFacing), uEdge);
  float k = (uBase + uDash * dash) * env * body;
  if (k < 0.002) discard;
  gl_FragColor = vec4(uColor * k, 1.0);
}`;
const FLOWS = []; // every flow material: their clock is set once per update

/** The light in a fibre (see the head of the file). `bend`: the bend uniforms of the item, or none. */
function flowMat(color, { k = 2, period = 60, speed, duty = 0.4, base = 0, dash = 1, dir = 1, x0 = 0, half = 0, edge = 0.6, bend = NOBEND } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      ...bend,
      uColor: { value: new THREE.Color(color).multiplyScalar(k) }, uTime: { value: 0 },
      uPeriod: { value: period }, uSpeed: { value: speed ?? period * 3 }, uDuty: { value: duty },
      uBase: { value: base }, uDash: { value: dash }, uDir: { value: dir }, uX0: { value: x0 }, uHalf: { value: half },
      uFront: { value: 1e7 }, uDimX: { value: -1e7 }, uDimK: { value: 1 }, uCutX: { value: 1e7 }, uCutK: { value: 1 }, uEdge: { value: edge },
    },
    vertexShader: FLOW_VS, fragmentShader: FLOW_FS,
  });
  FLOWS.push(mat);
  return mat;
}
const lightMesh = (geo, mat, order = 6) => {
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = order;
  m.frustumCulled = false;
  return m;
};

/** A ball of light (heart + hue, a soft tail): the light that has a place (makeBall, 015). */
function makeBall(heart, hue) {
  const H2 = (BRAND.H / 2).toFixed(1);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uHeart: { value: new THREE.Color(heart) }, uHue: { value: new THREE.Color(hue) }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
      vertexShader: /* glsl */ `
        uniform float uRadius, uMinPx; varying vec2 vUv;
        void main() {
          vUv = position.xy;
          vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
          c.xy += position.xy * r;
          gl_Position = projectionMatrix * c;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv;
        void main() {
          float r2 = dot(vUv, vUv);
          float core = exp(-r2 / 0.012);
          float body = 0.42 * exp(-r2 / 0.09);
          float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
          gl_FragColor = vec4((uHeart * (core * 2.4) + uHue * (body + tail)) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  mesh.visible = false;
  return mesh;
}
const shine = (ball, amount, radius, minPx = 0) => {
  ball.visible = amount > 0.004;
  const u = ball.material.uniforms;
  u.uAmount.value = amount;
  u.uRadius.value = radius;
  u.uMinPx.value = minPx;
};

/* a ray drawn along a precomputed path: aS = distance along it, aOut = 1 once it has left the core */
const RAY_VS = /* glsl */ `
attribute float aS; attribute float aOut; varying float vS; varying float vOut; varying float vFacing;
void main() {
  vS = aS; vOut = aOut;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFacing = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
  gl_Position = projectionMatrix * mv;
}`;
const RAY_FS = /* glsl */ `
uniform vec3 uIn, uOut; uniform float uHead, uTrail, uAmount, uOutK;
varying float vS; varying float vOut; varying float vFacing;
void main() {
  float ahead = 1.0 - smoothstep(uHead - 0.5, uHead + 1.0, vS);
  float back = max(uHead - vS, 0.0);
  float k = ahead * (0.3 + 0.7 * exp(-back / uTrail)) * (1.0 + 2.0 * exp(-back / 6.0));
  k *= mix(1.0, uOutK, vOut) * uAmount * mix(0.5, 1.0, smoothstep(0.1, 0.7, vFacing));
  if (k < 0.002) discard;
  gl_FragColor = vec4(mix(uIn, uOut, vOut) * k, 1.0);
}`;

/** A tube along a polyline of [x, y, z] points, `aS` its distance from `s0`; extra constant attributes per vertex. */
function polyTube(pts, r, { seg = 10, s0 = 0, attrs = {}, perPoint = null } = {}) {
  const geos = [];
  let s = s0;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion();
  const finish = (g, sOf, i) => {
    const n = g.attributes.position.count;
    const sA = new Float32Array(n);
    for (let k = 0; k < n; k++) sA[k] = sOf(k);
    g.setAttribute("aS", new THREE.BufferAttribute(sA, 1));
    const all = { ...attrs, ...(perPoint ? perPoint(i) : {}) };
    for (const key in all) g.setAttribute(key, new THREE.BufferAttribute(new Float32Array(n).fill(all[key]), 1));
    g.deleteAttribute("uv");
    geos.push(g);
  };
  for (let i = 0; i < pts.length - 1; i++) {
    a.fromArray(pts[i]);
    b.fromArray(pts[i + 1]);
    const L = a.distanceTo(b);
    if (L < 1e-4) continue;
    const g = new THREE.CylinderGeometry(r, r, L, seg, 1, true);
    const pos = g.attributes.position;
    const s1 = s;
    const ys = Array.from({ length: pos.count }, (_, k) => pos.getY(k));
    q.setFromUnitVectors(up, d.subVectors(b, a).normalize());
    g.applyQuaternion(q);
    g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    finish(g, (k) => s1 + ys[k] + L / 2, i);
    s += L;
    if (i < pts.length - 2) {
      const j = new THREE.SphereGeometry(r, seg, 5).translate(b.x, b.y, b.z);
      const sj = s;
      finish(j, () => sj, i);
    }
  }
  return { geo: mergeGeometries(geos), len: s - s0 };
}

/* ───────────────────────────── shapes ───────────────────────────── */

/** A lathe turned about x: profile [[r, x], …]. */
const latheX = (profile, seg = 64, o = {}) => lathe(profile, seg, o).rotateZ(-Math.PI / 2);
/** A rod along x from x0 to x1, radius r, with rings every `step` cm (so that it can bend), its two ends capped. */
function rodX(r, x0, x1, step = 2.5, seg = 40, taper = null) {
  const prof = [[0, x0], [r, x0]];
  for (let x = x0 + step; x < x1 - 1e-3; x += step) prof.push([taper ? taper(x) : r, x]);
  prof.push([taper ? taper(x1) : r, x1], [0, x1]);
  return lathe(prof, seg, { crease: 40 }).rotateZ(-Math.PI / 2);
}
/** A hollow tube along x (r0 inside, r1 outside), its rims broken. */
const tubeX = (r0, r1, x0, x1, bevel = 0.4, seg = 72) => latheX([[r0, x0], [r1, x0], [r1, x1], [r0, x1], [r0, x0]], seg, { bevel, round: 2 });
/** A plain cylinder along x, centred on x = 0. */
const cylX = (r, len, bevel = 0.1, seg = 48) => cyl(r, len, bevel, seg).rotateZ(-Math.PI / 2);
/** A helix of `n` strands at radius R along x (x0 → x1), one turn every `pitch` cm, each a tube of radius r. */
function helixX(n, R, r, x0, x1, pitch, phase = 0, splay = null) {
  const geos = [];
  for (let i = 0; i < n; i++) {
    const pts = [];
    for (let x = x0; x <= x1 + 1e-3; x += 6) {
      const a = phase + (i / n) * Math.PI * 2 + ((x - x0) / pitch) * Math.PI * 2;
      const rr = R + (splay ? splay(x) : 0);
      pts.push(new THREE.Vector3(x, Math.sin(a) * rr, Math.cos(a) * rr));
    }
    geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 2, r, 8, false));
  }
  return mergeGeometries(geos);
}

/** Keep each material's own colour, so a layer can be named (lit) or dimmed without allocation. */
function remember(part) {
  for (const m of part.userData.part.mats) {
    m.userData.c0 = m.color.clone();
    if (m.isLineMaterial) m.userData.w0 = m.linewidth;
  }
  return part;
}
/** named: 1 this layer is the one named (edges veille), 0 another is (dimmed to half), -1 none. */
function nameLayer(part, state) {
  for (const m of part.userData.part.mats) {
    if (!m.userData.c0) continue;
    if (m.isLineMaterial) {
      m.color.copy(state === 1 ? VEILLE : m.userData.c0);
      m.linewidth = state === 1 ? m.userData.w0 * 1.5 : m.userData.w0;
      m.opacity = (m.userData.base ?? 1) * (state === 0 ? 0.45 : 1) * part.userData.part.opacity;
    } else if (!m.isShaderMaterial) {
      m.color.copy(m.userData.c0).multiplyScalar(state === 0 ? 0.5 : state === 1 ? 1.12 : 1);
    }
  }
}

/** A page of the dossier, drawn once on a canvas (reconstitution, never a facsimile). */
function pageTexture(draw) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1440;
  const g = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const paint = () => {
    g.fillStyle = "#e9e4d8";
    g.fillRect(0, 0, 1024, 1440);
    draw(g);
    tex.needsUpdate = true;
  };
  paint();
  return { tex, paint };
}
const MONO = "'JetBrains Mono', 'Consolas', monospace";
const COND = "'Barlow Condensed', 'Arial Narrow', sans-serif";
function textLines(g, x, y, w, rows, gap, r) {
  g.fillStyle = "rgba(29,34,38,0.42)";
  for (let i = 0; i < rows; i++) {
    const len = i % 7 === 6 ? w * (0.35 + 0.3 * r()) : w * (0.88 + 0.12 * r());
    g.fillRect(x, y + i * gap, len, gap * 0.34);
  }
}
function stamp(g, x, y, lines) {
  g.save();
  g.translate(x, y);
  g.rotate(-0.08);
  g.strokeStyle = "rgba(29,34,38,0.55)";
  g.lineWidth = 5;
  g.strokeRect(-150, -52, 300, 104);
  g.fillStyle = "rgba(29,34,38,0.62)";
  g.font = `600 34px ${MONO}`;
  g.textAlign = "center";
  g.fillText(lines[0], 0, -6);
  g.font = `500 26px ${MONO}`;
  g.fillText(lines[1], 0, 32);
  g.restore();
}

/* ───────────────────────────── the items ───────────────────────────── */

export function buildFibre() {
  FLOWS.length = 0;
  const group = new THREE.Group();
  const items = {};
  const A = {};
  const mk = (name, at = [0, 0, 0]) => {
    const g = new THREE.Group();
    g.position.set(at[0], at[1], at[2]);
    items[name] = g;
    group.add(g);
    return g;
  };
  const anchorAt = (name, parent, x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    A[name] = o;
    return o;
  };
  const glassMat = (o = {}) => {
    const m = solid(o.color ?? GREY.glass, { rough: 0.16, metal: 0, coat: 1, coatRough: 0.12, opacity: o.opacity ?? 0.5, env: 1.4 });
    m.depthWrite = false;
    m.userData.depthWrite = false;
    return m;
  };
  const tmp = new THREE.Vector3();

  /* ═════════ CABLE — the telescope: jacket, yarns, resin (the two coatings), glass ═════════ */
  const cable = mk("cable", CABLE.at);
  const CL = CABLE.len / 2;
  const cJacket = makePart("jacket");
  addMesh(cJacket, tubeX(CABLE.jacket[0] / 2, CABLE.jacket[1] / 2, -CL, CL, 0.8), solid(GREY.dark, { rough: 0.82 }));
  const cYarn = makePart("yarn");
  const ry = (CABLE.yarn[0] + CABLE.yarn[1]) / 4;
  const splay = (x) => (x > CL - 4 ? (x - (CL - 4)) * 0.3 : 0);
  addMesh(cYarn, helixX(16, ry - 3.6, 1.35, -CL, CL + 26, 520, 0, splay), solid(GREY.light, { rough: 0.9 }), { edges: false });
  addMesh(cYarn, helixX(22, ry + 2.6, 1.35, -CL, CL + 20, 520, 0.4, splay), solid(GREY.mid, { rough: 0.9 }), { edges: false });
  const cResin = makePart("resin");
  const hardR = FIBER.hard / 2, softR = FIBER.soft / 2, glR = FIBER.glass / 2, coR = FIBER.core / 2;
  addMesh(cResin, latheX([[0, -CL], [hardR, -CL], [hardR, CL + 38], [softR + 0.4, CL + 43], [0, CL + 43]], 64, { bevel: 0.5, round: 2 }), solid(GREY.light, { rough: 0.38, coat: 0.6 }));
  addMesh(cResin, latheX([[0, CL + 42], [softR, CL + 42], [softR, CL + 52], [glR + 0.3, CL + 57], [0, CL + 57]], 64, { bevel: 0.4, round: 2 }), solid(GREY.pale, { rough: 0.45 }));
  const cGlass = makePart("glass");
  const cGlassEnd = CL + 84;
  addMesh(cGlass, latheX([[0, -CL], [glR, -CL], [glR, cGlassEnd], [0, cGlassEnd]], 64, { bevel: 0.6, round: 3 }), glassMat({ opacity: 0.55 }));
  const cCoreMat = solid(0x30363a, { rough: 0.5 });
  addMesh(cGlass, cylX(coR * 1.6, CABLE.len + 83.5, 0.05, 24), cCoreMat, { pos: [cGlassEnd / 2 - CL / 2 + 0.2 - 0.0, 0, 0], edges: false });
  cGlass.children[cGlass.children.length - 1].position.x = (cGlassEnd - CL) / 2 - 0.3;
  const cCoreGlow = lightMesh(cylX(coR * 1.7, CABLE.len + 83, 0, 16), flowMat(BRAND.veille, { k: 2.2, x0: -CL, base: 0, dash: 0 }));
  cCoreGlow.position.x = (cGlassEnd - CL) / 2 - 0.3;
  cGlass.add(cCoreGlow);
  const cLayers = [cJacket, cYarn, cResin, cGlass];
  for (const p of cLayers) cable.add(remember(p));
  const cOff = [CABLE.explode.jacket, CABLE.explode.yarn, CABLE.explode.resin, CABLE.explode.glass];
  const cDelay = [0, 0, 0.18, 0.34];

  /* ═════════ FIBRE — glass, two coatings cut back 40 cm from its end, the core, the pulses; it can bend ═════════ */
  const fibre = mk("fibre", FIBER.at);
  const FL = FIBER.len / 2;
  const FB = bendUniforms(26, 40, -1); // the bend: the part x < 40 lifts into a hairpin, the end (+x) stays in place
  const F_BEND_MAX = 150 * DEG;
  const fGlassMat = bendable(glassMat({ opacity: 0.46 }), FB);
  const fGlass = new THREE.Mesh(rodX(glR, -FL, FL - 0.6, 2.5, 48), fGlassMat);
  fGlass.renderOrder = 3;
  const fCoreMat = bendable(solid(0x2d3337, { rough: 0.5 }), FB);
  const fCore = new THREE.Mesh(rodX(coR, -FL, FL - 0.5, 2.5, 16), fCoreMat);
  const hardTaper = (x) => (x < FL - 46 ? hardR : hardR - (hardR - softR) * ramp(x, FL - 46, FL - 41));
  const softTaper = (x) => (x < FL - 41 ? softR : softR - (softR - glR - 0.2) * ramp(x, FL - 41, FL - 36));
  const fHardMat = bendable(solid(GREY.light, { rough: 0.38, coat: 0.6, opacity: 0.72 }), FB);
  const fSoftMat = bendable(solid(GREY.pale, { rough: 0.45, opacity: 0.8 }), FB);
  fHardMat.depthWrite = false;
  fSoftMat.depthWrite = false;
  const fHard = new THREE.Mesh(rodX(hardR, -FL, FL - 41, 2.5, 56, hardTaper), fHardMat);
  const fSoft = new THREE.Mesh(rodX(softR, -FL, FL - 36, 2.5, 56, softTaper), fSoftMat);
  fHard.renderOrder = 4;
  fSoft.renderOrder = 3;
  fibre.add(fCore, fSoft, fGlass, fHard);
  // the polished end face: the cladding, the core dot that lights
  const fEnd = makePart("fibreEnd");
  addMesh(fEnd, cylX(glR, 0.8, 0.22, 64), solid(0xbfc8cb, { rough: 0.22, coat: 1 }), { pos: [FL - 0.4, 0, 0], edgeOpacity: 0.7 });
  const fDotMat = new THREE.MeshBasicMaterial({ color: 0x2b3134, toneMapped: false });
  const fDot = new THREE.Mesh(new THREE.CircleGeometry(coR, 40).rotateY(Math.PI / 2), fDotMat);
  fDot.position.x = FL + 0.03;
  fEnd.add(fDot);
  fibre.add(fEnd);
  const fDotBall = makeBall(0xffffff, BRAND.veille);
  fDotBall.position.set(FL + 0.3, 0, 0);
  fibre.add(fDotBall);
  // the light: a bright core, a faint glow around it in the glass
  const fPulse = flowMat(BRAND.veille, { k: 2.4, x0: -FL, period: 60, bend: FB, edge: 0.3 });
  const fHalo = flowMat(BRAND.veille, { k: 0.28, x0: -FL, period: 60, bend: FB, edge: 1, duty: 0.5 });
  fibre.add(lightMesh(rodX(coR * 1.5, -FL, FL - 0.3, 2.5, 16), fPulse, 6), lightMesh(rodX(2.4, -FL, FL - 0.6, 2.5, 24), fHalo, 5));
  for (const m of [fPulse, fHalo]) {
    m.uniforms.uDimX.value = FL - 40;
    m.uniforms.uDimK.value = 0.6;
    m.uniforms.uCutX.value = FB.uBendX.value;
  }
  // the leak: a sheaf of light (signal) leaving the outer side of the bend's apex
  const fLeak = new THREE.Group();
  const leakMat = flowMat(BRAND.signal, { k: 2.2, period: 22, duty: 0.55, half: 14, edge: 0.5 });
  {
    FB.uBendA.value = F_BEND_MAX;
    const apex = bendXY(FB.uBendX.value - FB.uBendR.value * F_BEND_MAX * 0.5, 0, FB, new THREE.Vector3());
    const cen = new THREE.Vector3(FB.uBendX.value, FB.uBendR.value, 0);
    const out = apex.clone().sub(cen).normalize();
    const R = rng(71);
    for (let i = 0; i < 11; i++) {
      const len = 26 + 30 * R();
      const m = lightMesh(new THREE.CylinderGeometry(0.32, 0.32, len, 8, 1, true).rotateZ(-Math.PI / 2).translate(len / 2, 0, 0), leakMat, 6);
      const a = Math.atan2(out.y, out.x) + (i / 10 - 0.5) * 80 * DEG;
      m.position.copy(apex).addScaledVector(out, glR - 1);
      m.rotation.set(0, (R() - 0.5) * 0.5, a, "YZX");
      fLeak.add(m);
    }
    FB.uBendA.value = 0;
  }
  fibre.add(fLeak);
  anchorAt("glassEnd", fibre, FL, 0, 0);
  anchorAt("coreEnd", fibre, FL, 0, 0);
  const fBendMeshes = [fCore, fSoft, fGlass, fHard];

  /* ═════════ PRINCIPE — two glasses, the frontier, the ray that ricochets (or crosses, or leaves the bend) ═════════ */
  const pr = mk("principe", PRINCIPE.at);
  const PL = PRINCIPE.len / 2, rc = PRINCIPE.core / 2, rk = PRINCIPE.clad / 2;
  const PB = bendUniforms(PRINCIPE.bend.r, 0, 1);
  const P_BEND_MAX = PRINCIPE.bend.arc * DEG;
  const PGLASS_FS = /* glsl */ `
    uniform vec3 uColor; uniform float uFill, uRim, uLine, uAmount; varying float vFacing;
    void main() {
      float g = clamp(1.0 - vFacing, 0.0, 1.0);
      float k = uFill + uRim * pow(g, 3.0) + uLine * smoothstep(0.86, 0.985, g);
      gl_FragColor = vec4(uColor * k * uAmount, 1.0);
    }`;
  const pGlass = (fill, rim, line, color = BRAND.ink) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { ...PB, uColor: { value: new THREE.Color(color) }, uFill: { value: fill }, uRim: { value: rim }, uLine: { value: line }, uAmount: { value: 1 } },
    vertexShader: FLOW_VS, fragmentShader: PGLASS_FS,
  });
  const pClad = lightMesh(rodX(rk, -PL, PL, 3, 72), pGlass(0.018, 0.2, 0.32), 2);
  const pCoreM = lightMesh(rodX(rc, -PL, PL, 3, 72), pGlass(0.05, 0.22, 1.05), 3);
  // a solid ring at each end: the two glasses read as rods, not as lines
  const pEnds = makePart("principeEnds");
  const pRingMat = solid(GREY.pale, { rough: 0.3, coat: 0.6 });
  const pCoreFace = solid(0x7d8589, { rough: 0.3 });
  addMesh(pEnds, tubeX(rc, rk, -PL - 1.2, -PL, 0.3), pRingMat);
  addMesh(pEnds, cylX(rc - 0.1, 1.0, 0.2), pCoreFace, { pos: [-PL - 0.6, 0, 0] });
  pr.add(pClad, pCoreM, pEnds);
  // the three paths, marched once in 2D (x, y)
  const march = ({ x = -PL - 14, y = 0, ang, bendOn = false }) => {
    const pts = [[x, y, 0]], out = [0], hits = [];
    let dx = Math.cos(ang), dy = Math.sin(ang), s = 0, left = -1, outS = 0;
    const step = 0.25;
    const inside = (px, py) => {
      if (px < -PL) return true;
      if (!bendOn || px < 0) return Math.abs(py) <= rc;
      const r = Math.hypot(px, py - PRINCIPE.bend.r);
      return r >= PRINCIPE.bend.r - rc && r <= PRINCIPE.bend.r + rc;
    };
    for (let i = 0; i < 8000; i++) {
      const nx = x + dx * step, ny = y + dy * step;
      if (left < 0 && !inside(nx, ny)) {
        if (!bendOn || nx < 0) {
          if (Math.abs(Math.atan2(Math.abs(dy), dx)) < 15 * DEG) { // caught: it ricochets
            pts.push([x, y, 0]); out.push(0); hits.push({ s, x, y, out: 0 });
            dy = -dy;
            continue;
          }
        }
        // it crosses the frontier: refracted a little away from the normal, then lost
        pts.push([x, y, 0]); out.push(0); hits.push({ s, x, y, out: 1 });
        left = s;
        const a = Math.atan2(dy, dx);
        const tilt = bendOn ? -6 * DEG : -5 * DEG * Math.sign(dy);
        dx = Math.cos(a + tilt); dy = Math.sin(a + tilt);
      }
      x = nx; y = ny; s += step;
      if (left >= 0 && s - left > 150) { pts.push([x, y, 0]); out.push(1); break; }
      if (left < 0 && x > PL + 4 && !bendOn) { pts.push([x, y, 0]); out.push(0); break; }
    }
    return { pts, out, hits, total: s, left };
  };
  const pathA = march({ ang: -PRINCIPE.graze * DEG });
  const pathB = march({ x: -PL - 8, ang: -PRINCIPE.steep * DEG });
  const pathC = march({ ang: -PRINCIPE.graze * DEG, bendOn: true });
  const rays = [pathA, pathB, pathC].map((p) => {
    // the points after the crossing are "out": give each segment the out of its end
    const { geo } = polyTube(p.pts, 1.15, { perPoint: (i) => ({ aOut: p.out[i + 1] ?? 1 }) });
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uIn: { value: VEILLE.clone().multiplyScalar(2.3) }, uOut: { value: SIGNAL.clone().multiplyScalar(2.1) }, uHead: { value: 0 }, uTrail: { value: 260 }, uAmount: { value: 0 }, uOutK: { value: 1 } },
      vertexShader: RAY_VS, fragmentShader: RAY_FS,
    });
    const mesh = lightMesh(geo, mat, 8);
    pr.add(mesh);
    const balls = p.hits.map((h) => {
      const b = makeBall(0xffffff, h.out ? BRAND.signal : BRAND.veille);
      b.position.set(h.x, h.y, 0);
      pr.add(b);
      return b;
    });
    // cumulative lengths of the polyline, to place the head
    const cum = [0];
    for (let i = 1; i < p.pts.length; i++) cum.push(cum[i - 1] + Math.hypot(p.pts[i][0] - p.pts[i - 1][0], p.pts[i][1] - p.pts[i - 1][1]));
    return { ...p, mesh, mat, balls, cum, len: cum[cum.length - 1] };
  });
  const headBall = makeBall(0xffffff, BRAND.veille);
  pr.add(headBall);
  A.rayHead = headBall;
  const leakHit = pathC.hits.find((h) => h.out) ?? { x: 0, y: rc };
  anchorAt("bendLeak", pr, leakHit.x, leakHit.y, 0);
  const pointAt = (ray, s, out) => {
    const c = ray.cum, p = ray.pts;
    let i = 1;
    while (i < c.length - 1 && c[i] < s) i++;
    const u = clamp01((s - c[i - 1]) / Math.max(1e-3, c[i] - c[i - 1]));
    return out.set(p[i - 1][0] + (p[i][0] - p[i - 1][0]) * u, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * u, 0);
  };

  /* ═════════ HIST — the 1960s rod, true length (20 m), the light that halves every 3 m ═════════ */
  const hist = mk("hist", HIST.at);
  const hR = HIST.d / 2;
  const hRodMat = solid(0x8a9491, { rough: 0.2, coat: 1, opacity: 0.55, env: 1.3 });
  hRodMat.depthWrite = false;
  hRodMat.userData.depthWrite = false;
  const hOld = new THREE.Color(0x8a9491), hNew = new THREE.Color(GREY.glass);
  const hRod = new THREE.Mesh(latheX([[0, 0], [hR, 0], [hR, HIST.len], [0, HIST.len]], 48, { bevel: 0.6, round: 2 }), hRodMat);
  hRod.renderOrder = 3;
  hist.add(hRod);
  const hRodEdges = edgesOf(hRod.geometry, { color: BRAND.ink, width: 2, opacity: 0.75 });
  hRod.add(hRodEdges);
  const hLight = flowMat(BRAND.veille, { k: 2.4, x0: 0, period: 90, half: HIST.half, edge: 0.5 });
  const hHalo = flowMat(BRAND.veille, { k: 0.35, x0: 0, period: 90, half: HIST.half, edge: 1, duty: 0.5 });
  hist.add(lightMesh(cylX(hR * 0.32, HIST.len, 0, 16).translate(HIST.len / 2, 0, 0), hLight, 6));
  hist.add(lightMesh(cylX(hR * 0.85, HIST.len, 0, 24).translate(HIST.len / 2, 0, 0), hHalo, 5));
  const hLamp = makeBall(0xffffff, BRAND.veille);
  hLamp.position.set(-4, 0, 0);
  const hOut = makeBall(0xffffff, BRAND.veille);
  hOut.position.set(HIST.len + 3, 0, 0);
  hist.add(hLamp, hOut);
  // the impurities (iron, copper, water): signal motes in the old glass
  const hImpMat = glow(BRAND.signal, 1.8);
  const hImp = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.0, 1), hImpMat, 90);
  {
    const R = rng(1966), m4 = new THREE.Matrix4();
    for (let i = 0; i < 90; i++) {
      const a = R() * Math.PI * 2, r = Math.sqrt(R()) * hR * 0.8, x = Math.pow(R(), 1.35) * HIST.len;
      const s = 0.7 + R() * 0.8;
      hImp.setMatrixAt(i, m4.makeScale(s, s, s).setPosition(x, Math.sin(a) * r, Math.cos(a) * r));
    }
  }
  hImp.renderOrder = 5;
  hist.add(hImp);
  // a rule on the bench: a tick every metre, the 3, 6 and 20 m marks long and bright
  const hRule = new THREE.Group();
  const tickMat = glow(BRAND.ink, 0.55);
  const markMat = glow(BRAND.ink, 1.0);
  const ruleZ = 30;
  const tickGeo = [], markGeo = [];
  tickGeo.push(new THREE.BoxGeometry(HIST.len, 0.2, 1.2).translate(HIST.len / 2, 0, ruleZ));
  for (let x = 0; x <= HIST.len; x += 100) {
    const major = HIST.marks.includes(x) || x === 0;
    (major ? markGeo : tickGeo).push(new THREE.BoxGeometry(major ? 3.2 : 1.8, 0.2, major ? 34 : 12).translate(x, 0, ruleZ + (major ? 6 : 6)));
  }
  hRule.add(new THREE.Mesh(mergeGeometries(tickGeo), tickMat), new THREE.Mesh(mergeGeometries(markGeo), markMat));
  hRule.position.y = 0.4 - HIST.at[1];
  hist.add(hRule);
  anchorAt("histEnd", hist, HIST.len, 0, 0);
  A.histMarks = HIST.marks.map((m) => {
    const o = new THREE.Object3D();
    o.position.set(m, 0.4 - HIST.at[1], ruleZ + 23);
    hist.add(o);
    return o;
  });

  /* ═════════ DOCS — two pieces of the dossier, flat, reconstitutions ═════════ */
  const docs = mk("docs", DOCS.at);
  const pageKao = pageTexture((g) => {
    const r = rng(1966);
    g.fillStyle = "#1d2226";
    g.font = `500 30px ${MONO}`;
    g.fillText("PROC. IEE · VOL. 113 · N° 7 · 1966", 80, 110);
    g.fillRect(80, 132, 864, 3);
    g.font = `700 64px ${COND}`;
    g.fillText("Dielectric-fibre surface waveguides", 80, 220);
    g.fillText("for optical frequencies", 80, 290);
    g.font = `500 36px ${MONO}`;
    g.fillText("K. C. KAO · G. A. HOCKHAM", 80, 360);
    textLines(g, 80, 430, 405, 30, 30, r);
    textLines(g, 540, 430, 405, 13, 30, r);
    // the line that matters: the losses are impurities, not the glass itself
    g.fillStyle = "rgba(255,91,46,0.85)";
    g.fillRect(526, 832, 440, 118);
    g.fillStyle = "#1d2226";
    g.font = `700 50px ${COND}`;
    g.fillText("pertes : des impuretés —", 546, 882);
    g.fillText("fer, cuivre, eau", 546, 934);
    textLines(g, 540, 990, 405, 10, 30, r);
    g.font = `500 24px ${MONO}`;
    g.fillStyle = "rgba(29,34,38,0.6)";
    g.fillText("RECONSTITUTION", 80, 1390);
    stamp(g, 780, 1300, ["PIÈCE 01", "DOSSIER L07"]);
  });
  const pageCorning = pageTexture((g) => {
    g.strokeStyle = "rgba(29,34,38,0.12)";
    g.lineWidth = 2;
    for (let y = 120; y < 1400; y += 44) { g.beginPath(); g.moveTo(40, y); g.lineTo(984, y); g.stroke(); }
    g.strokeStyle = "rgba(255,91,46,0.5)";
    g.beginPath(); g.moveTo(130, 40); g.lineTo(130, 1400); g.stroke();
    g.fillStyle = "#1d2226";
    g.font = `500 32px ${MONO}`;
    g.fillText("CORNING · AOÛT 1970", 160, 104);
    g.font = `600 40px ${COND}`;
    g.fillText("Fibre d'essai — atténuation mesurée", 160, 210);
    g.fillStyle = "rgba(29,34,38,0.45)";
    for (let i = 0; i < 5; i++) g.fillRect(160, 260 + i * 44, 520 + ((i * 97) % 220), 12);
    g.fillStyle = "#1d2226";
    g.font = `700 220px ${COND}`;
    g.fillText("1 km", 170, 720);
    g.font = `700 120px ${COND}`;
    g.fillText("17 dB/km", 180, 930);
    g.strokeStyle = "rgba(40,190,120,0.95)";
    g.lineWidth = 9;
    g.beginPath(); g.ellipse(410, 890, 290, 110, -0.04, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "rgba(29,34,38,0.45)";
    for (let i = 0; i < 6; i++) g.fillRect(160, 1060 + i * 44, 460 + ((i * 131) % 300), 12);
    g.font = `500 24px ${MONO}`;
    g.fillStyle = "rgba(29,34,38,0.6)";
    g.fillText("RECONSTITUTION", 160, 1390);
    stamp(g, 790, 1300, ["PIÈCE 02", "DOSSIER L07"]);
  });
  const pages = [pageKao, pageCorning].map((pg) => {
    const p = makePart("page");
    const mat = new THREE.MeshStandardMaterial({ map: pg.tex, roughness: 0.92, emissive: 0xffffff, emissiveMap: pg.tex, emissiveIntensity: 0.32 });
    mat.userData.finish = false;
    mat.userData.base = 1;
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(DOCS.page[0], DOCS.page[1]).rotateX(-Math.PI / 2), mat);
    sheet.position.y = 0.32;
    sheet.receiveShadow = true;
    p.add(sheet);
    addMesh(p, box(DOCS.page[0] + 0.4, 0.3, DOCS.page[1] + 0.4, 0.1), solid(0x9a9890, { rough: 0.9 }), { edgeOpacity: 0.35 });
    docs.add(p);
    return p;
  });
  let fontsDone = false;

  /* ═════════ SUBSEA — the section, from the centre out ═════════ */
  const sub = mk("subsea", SUBSEA.at);
  const SL = SUBSEA.len / 2;
  const sRt = SUBSEA.tube / 2, sRw = SUBSEA.wires / 2, sRc = SUBSEA.copper / 2, sRj = SUBSEA.jacket / 2;
  const sFib = makePart("sFibres");
  {
    const geos = [], glows = [];
    const n = SUBSEA.fibres;
    for (let i = 0; i < n; i++) {
      const inner = i < 3;
      const a = (i / (inner ? 3 : n - 3)) * Math.PI * 2 + (inner ? 0.5 : 0);
      const r = inner ? 0.85 : 2.55;
      geos.push(cylX(0.62, SUBSEA.len + 40, 0.15, 16).translate(20, Math.sin(a) * r, Math.cos(a) * r));
      glows.push(cylX(0.72, SUBSEA.len + 40, 0, 12).translate(20, Math.sin(a) * r, Math.cos(a) * r));
    }
    addMesh(sFib, mergeGeometries(geos), solid(GREY.glass, { rough: 0.3, coat: 0.7 }), { edges: false });
    const sPulseGeo = mergeGeometries(glows);
    sFib.add(lightMesh(sPulseGeo, flowMat(BRAND.veille, { k: 2.2, x0: -SL, period: 50, edge: 0.4 }), 6));
  }
  const sTube = makePart("sTube");
  addMesh(sTube, tubeX(sRt - 0.7, sRt, -SL, SL + 24, 0.25), solid(GREY.pale, { rough: 0.35, metal: 0.2 }));
  const sWire = makePart("sWires");
  addMesh(sWire, tubeX(sRt, sRw - 4.5, -SL, SL + 12, 0.3), solid(0x3a4044, { rough: 0.85 }), { edgeOpacity: 0.4 });
  addMesh(sWire, helixX(SUBSEA.wireCount, sRw - 2.25, 2.15, -SL, SL + 12, 900), solid(GREY.light, { rough: 0.4, metal: 0.2 }), { edges: false });
  const sCopper = makePart("sCopper");
  addMesh(sCopper, tubeX(sRw, sRc, -SL, SL, 0.3), solid(0xb9b5ad, { rough: 0.32, metal: 0.25 }));
  const sJacket = makePart("sJacket");
  addMesh(sJacket, tubeX(sRc, sRj, -SL, SL - 14, 1.2), solid(GREY.dark, { rough: 0.78 }));
  const sParts = [sTube, sWire, sCopper, sJacket];
  for (const p of [sFib, ...sParts]) sub.add(remember(p));
  const sOff = [36, 0, -38, -82];
  const sFibOff = 70;
  anchorAt("subseaEnd", sub, SL + 40, 0, 0);

  /* ═════════ MULTI — 72 marked fibres → 6 tubes → around a strength member → a jacket ═════════ */
  const multi = mk("multi", MULTI.at);
  const ML = MULTI.len / 2;
  const mTubeR = MULTI.tube / 2, mRing = MULTI.ring / 2, mFibR = 1.05;
  const markMats = [];
  for (let j = 0; j < MULTI.perTube; j++) {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = "#c9d0d2";
    g.fillRect(0, 0, 4, 256);
    g.fillStyle = "#1b1f22";
    const rings = 1 + (j % 3), w = 22 + (j % 2) * 18;
    for (let k = 0; k < rings; k++) g.fillRect(0, k * (w + 18), 4, w);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.repeat.set(1, MULTI.len / (10 + j * 2.6));
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42 });
    m.userData.finish = false;
    markMats.push(m);
  }
  const mFibGeo = new THREE.CylinderGeometry(mFibR, mFibR, MULTI.len, 12).rotateZ(-Math.PI / 2);
  const mSlots = []; // a fibre's place in its tube
  for (let j = 0; j < MULTI.perTube; j++) {
    const inner = j < 3;
    const a = (j / (inner ? 3 : 9)) * Math.PI * 2 + (inner ? 0.6 : 0);
    const r = inner ? 1.25 : 3.65;
    mSlots.push([Math.sin(a) * r, Math.cos(a) * r]);
  }
  const mFibres = [];
  const mTubes = [];
  const mTubeMats = [];
  for (let k = 0; k < MULTI.tubes; k++) {
    const t = makePart("tube" + k);
    const mat = solid(GREY.pale, { rough: 0.3, coat: 0.8, opacity: 0.42 });
    mat.depthWrite = false;
    mat.userData.depthWrite = false;
    addMesh(t, tubeX(mTubeR - 0.8, mTubeR, -ML + 10, ML - 18, 0.3), mat, { edgeOpacity: 0.6 });
    multi.add(t);
    mTubes.push(t);
    mTubeMats.push(mat);
    for (let j = 0; j < MULTI.perTube; j++) {
      const f = new THREE.Mesh(mFibGeo, markMats[j]);
      f.castShadow = false;
      multi.add(f);
      mFibres.push({ mesh: f, k, j });
    }
  }
  const mCentral = makePart("central");
  addMesh(mCentral, cylX(4.6, MULTI.len - 40, 0.6), solid(GREY.mid, { rough: 0.6 }));
  multi.add(mCentral);
  const mJacket = makePart("mJacket");
  addMesh(mJacket, tubeX(MULTI.jacket / 2 - 4, MULTI.jacket / 2, -ML, ML - 70, 1.2), solid(GREY.dark, { rough: 0.8 }));
  multi.add(mJacket);
  const R6 = rng(606);
  const mLoose = mFibres.map(() => [(R6() - 0.5) * 40, (R6() - 0.5) * 9, (R6() - 0.5) * 9]);

  /* ═════════ SPLICE — the cleaver, the splicer (V-grooves, electrodes, two cameras, the screen), the sleeve ═════════ */
  const sp = mk("splice", SPLICE.at);
  const fr = SPLICE.fiber / 2, fcr = fr * (9 / 125), fcoat = fr * (245 / 125);
  const spBody = makePart("splicer");
  addMesh(spBody, box(170, 18, 96, 2), solid(GREY.dark, { rough: 0.7 }), { pos: [0, -21, 0] });
  for (const s of [-1, 1]) {
    addMesh(spBody, box(42, 12, 22, 1), solid(GREY.mid, { rough: 0.45, metal: 0.3 }), { pos: [s * 34, -fr - 6.2, 0] });
    addMesh(spBody, box(42, 0.6, 2.2, 0.1), solid(0x15191b), { pos: [s * 34, -fr - 0.1, 0], edges: false }); // the V
    addMesh(spBody, box(34, 9, 26, 1.2), solid(GREY.light, { rough: 0.5 }), { pos: [s * 74, fcoat + 3.5, 0] }); // the clamp lids
    addMesh(spBody, box(34, 9, 26, 1.2), solid(GREY.mid, { rough: 0.5 }), { pos: [s * 74, -fcoat - 3.5, 0] });
    // the electrodes, tips at z = ±electrode
    const e = lathe([[0, -22], [3.4, -22], [3.4, 2], [1.0, 19], [0, 21]], 48, { bevel: 0.25 }).rotateX(s > 0 ? -Math.PI / 2 : Math.PI / 2);
    addMesh(spBody, e, solid(GREY.pale, { rough: 0.3, metal: 0.5 }), { pos: [0, 0, s * (SPLICE.electrode + 21)] });
    addMesh(spBody, box(16, 16, 26, 1.5), solid(GREY.mid, { rough: 0.6 }), { pos: [0, 0, s * (SPLICE.electrode + 52)] });
    // the two cameras, looking at the joint from above at ±45° about x
    const cam = new THREE.Group();
    const a = s * SPLICE.cam * DEG;
    cam.position.set(0, Math.cos(a) * 44, Math.sin(a) * 44);
    cam.lookAt(0, 0, 0);
    const camPart = makePart("cam");
    addMesh(camPart, box(14, 14, 22, 1.4), solid(GREY.mid, { rough: 0.5 }), { pos: [0, 0, -4] });
    addMesh(camPart, cyl(4.2, 8, 0.4, 32).rotateX(Math.PI / 2), solid(GREY.dark, { rough: 0.3 }), { pos: [0, 0, 10] });
    const lens = new THREE.Mesh(new THREE.CircleGeometry(3, 32), glow(BRAND.ink, 0.5));
    lens.position.z = 14.1;
    camPart.add(lens);
    cam.add(camPart);
    spBody.add(cam);
  }
  sp.add(spBody);
  // the screen: what the two cameras see, the two fibres magnified side by side (view X, view Y)
  const scrU = { uAlign: { value: 0 }, uFused: { value: 0 }, uSkew: { value: 0 }, uArc: { value: 0 }, uOn: { value: 1 } };
  const scrMat = new THREE.ShaderMaterial({
    uniforms: { ...scrU, uInk: { value: INK }, uVeille: { value: VEILLE }, uSignal: { value: SIGNAL } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: /* glsl */ `
      uniform float uAlign, uFused, uSkew, uArc, uOn; uniform vec3 uInk, uVeille, uSignal; varying vec2 vUv;
      void main() {
        float side = step(0.5, vUv.x);
        vec2 p = vec2(fract(vUv.x * 2.0) * 2.0 - 1.0, vUv.y * 2.0 - 1.0);
        p.x *= 1.2;
        float off = (1.0 - uAlign) * (side < 0.5 ? 0.24 : -0.17);
        float gap = 0.2 * (1.0 - uFused);
        float r = 0.3;
        float faceL = -gap * 0.5 + p.y * uSkew * 0.22;
        float inL = step(p.x, faceL) * step(abs(p.y), r);
        float inR = step(gap * 0.5, p.x) * step(abs(p.y - off), r);
        vec3 col = vec3(0.03, 0.038, 0.042);
        float shL = 0.25 + 0.5 * (1.0 - pow(clamp(abs(p.y) / r, 0.0, 1.0), 2.0));
        float shR = 0.25 + 0.5 * (1.0 - pow(clamp(abs(p.y - off) / r, 0.0, 1.0), 2.0));
        col = mix(col, uInk * shL * 0.8, inL);
        col = mix(col, uInk * shR * 0.8, inR);
        float cl = inL * (1.0 - smoothstep(0.022, 0.04, abs(p.y)));
        float cr = inR * (1.0 - smoothstep(0.022, 0.04, abs(p.y - off)));
        col = mix(col, uVeille * 0.85, max(cl, cr));
        col += mix(uInk, vec3(1.0), 0.5) * uArc * 1.2 * exp(-dot(p, p) / 0.03);
        col = mix(col, uInk * 0.35, 1.0 - smoothstep(0.002, 0.005, abs(vUv.x - 0.5)));
        col += uInk * 0.05 * (1.0 - smoothstep(0.003, 0.007, abs(p.y)));
        gl_FragColor = vec4(col * uOn, 1.0);
      }`,
  });
  scrMat.userData.finish = false;
  const screen = new THREE.Group();
  const scrFrame = makePart("screen");
  addMesh(scrFrame, box(104, 46, 5, 1.5), solid(GREY.dark, { rough: 0.6 }), { pos: [0, 0, -2.6] });
  const scrPlane = new THREE.Mesh(new THREE.PlaneGeometry(98, 40), scrMat);
  scrPlane.position.z = 0.05;
  scrFrame.add(scrPlane);
  addMesh(scrFrame, box(6, 30, 6, 1), solid(GREY.mid), { pos: [0, -38, -4] });
  screen.add(scrFrame);
  screen.position.set(0, 50, -78);
  screen.rotation.set(-10 * DEG, -30 * DEG, 0, "YXZ");
  sp.add(screen);
  // the two fibres: coated in the clamps, bare in the grooves; the left one has the cleaved face (skew)
  const mkSpliceFibre = (withFace) => {
    const g = new THREE.Group();
    const p = makePart("sfib");
    addMesh(p, latheX([[0, -230], [fcoat, -230], [fcoat, -58], [fr + 0.3, -54], [0, -54]], 48, { bevel: 0.3 }), solid(GREY.light, { rough: 0.4, coat: 0.6 }));
    const gm = glassMat({ opacity: 0.5 });
    addMesh(p, latheX([[0, -56], [fr, -56], [fr, -0.5], [0, -0.5]], 48), gm, { edgeOpacity: 0.5 });
    addMesh(p, cylX(fcr * 1.4, 56, 0.02, 12), solid(0x2c3236, { rough: 0.5 }), { pos: [-28.4, 0, 0], edges: false });
    const face = makePart("face");
    addMesh(face, cylX(fr, 0.6, 0.12, 48), solid(0xc2cbce, { rough: 0.2, coat: 1 }), { edgeOpacity: 0.6 });
    face.position.x = -0.3;
    p.add(face);
    g.add(p);
    return { g, face: withFace ? face : null };
  };
  const spL = mkSpliceFibre(true);
  const spR = mkSpliceFibre(false);
  spR.g.rotation.y = Math.PI;
  sp.add(spL.g, spR.g);
  const spLight = flowMat(BRAND.veille, { k: 2.2, x0: -230, period: 40, edge: 0.4 });
  const spLightMesh = lightMesh(cylX(fcr * 1.6, 460, 0, 12), spLight, 6);
  sp.add(spLightMesh);
  // the arc: a light that has a place, between the two electrode tips, through the gap
  const arcBall = makeBall(0xffffff, BRAND.ink);
  const hotBall = makeBall(0xffffff, BRAND.signal);
  sp.add(arcBall, hotBall);
  const arcMat = glow(0xffffff, 2.2, { additive: true });
  const arcPts = [];
  {
    const R = rng(1414);
    for (let i = 0; i <= 10; i++) arcPts.push([(R() - 0.5) * 1.6, (R() - 0.5) * 1.6, -SPLICE.electrode + 0.5 + (i / 10) * (2 * SPLICE.electrode - 1)]);
  }
  const arcLine = new THREE.Mesh(polyTube(arcPts, 0.32, { seg: 6 }).geo, arcMat);
  arcLine.renderOrder = 7;
  sp.add(arcLine);
  // the sleeve (manchon): parked on the left fibre, slides over the joint, shrinks
  const spSleeve = makePart("sleeve");
  const slMat = solid(GREY.pale, { rough: 0.25, coat: 1, opacity: 0.4 });
  slMat.depthWrite = false;
  slMat.userData.depthWrite = false;
  addMesh(spSleeve, tubeX(8.2, 9.6, -SPLICE.sleeve / 2, SPLICE.sleeve / 2, 0.6), slMat, { edgeOpacity: 0.7 });
  addMesh(spSleeve, box(SPLICE.sleeve - 4, 1.6, 1.6, 0.4), solid(GREY.mid, { metal: 0.45, rough: 0.4 }), { pos: [0, 7.4, 0] });
  sp.add(spSleeve);
  // the cleaver: clamps, a blade that scores from below, an anvil that breaks from above, the scrap that falls
  const clv = new THREE.Group();
  clv.position.set(SPLICE.cleaver[0], SPLICE.cleaver[1], SPLICE.cleaver[2]);
  const clvBody = makePart("cleaver");
  addMesh(clvBody, box(96, 14, 60, 2), solid(GREY.dark, { rough: 0.7 }), { pos: [0, -23, 0] });
  for (const x of [-34, 24]) addMesh(clvBody, box(16, 12, 22, 1.2), solid(GREY.mid, { rough: 0.5 }), { pos: [x, -fr - 6, 0] });
  clv.add(clvBody);
  const clvPads = [-34, 24].map((x) => {
    const p = makePart("pad");
    addMesh(p, box(16, 8, 22, 1.2), solid(GREY.light, { rough: 0.5 }), { pos: [0, 0, 0] });
    p.position.set(x, 0, 0);
    clv.add(p);
    return p;
  });
  const clvBlade = makePart("blade");
  addMesh(clvBlade, cyl(9, 1.4, 0.3, 64).rotateZ(Math.PI / 2), solid(GREY.pale, { rough: 0.25, metal: 0.5 }));
  clv.add(clvBlade);
  const clvAnvil = makePart("anvil");
  addMesh(clvAnvil, box(9, 9, 16, 1), solid(GREY.mid, { rough: 0.45 }));
  clv.add(clvAnvil);
  const clvFib = makePart("cfib");
  addMesh(clvFib, latheX([[0, -120], [fcoat, -120], [fcoat, -64], [fr + 0.3, -60], [0, -60]], 48, { bevel: 0.3 }), solid(GREY.light, { rough: 0.4, coat: 0.6 }));
  addMesh(clvFib, latheX([[0, -61], [fr, -61], [fr, 4.6], [0, 4.6]], 48), glassMat({ opacity: 0.5 }), { edgeOpacity: 0.5 });
  const clvFace = makePart("cface");
  addMesh(clvFace, cylX(fr, 0.6, 0.12, 48), solid(0xc2cbce, { rough: 0.2, coat: 1 }), { edgeOpacity: 0.6 });
  clvFace.position.x = 4.8;
  clvFib.add(clvFace);
  clv.add(clvFib);
  const clvScrap = makePart("scrap");
  addMesh(clvScrap, latheX([[0, 0], [fr, 0], [fr, 40], [0, 40]], 48), glassMat({ opacity: 0.5 }), { edgeOpacity: 0.5 });
  clvScrap.position.x = 5;
  clv.add(clvScrap);
  const scoreMark = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 2.6), glow(BRAND.signal, 2.2));
  scoreMark.position.set(5, -fr - 0.05, 0);
  clv.add(scoreMark);
  const scoreBall = makeBall(0xffffff, BRAND.signal);
  scoreBall.position.set(5, -fr, 0);
  clv.add(scoreBall);
  sp.add(clv);
  anchorAt("splicePoint", sp, 0, 0, 0);
  anchorAt("arcPoint", sp, 0, 0, 0);

  /* ═════════ COUPLER — a block of glass: one guide in, five stages of splits, 32 out ═════════ */
  const cp = mk("coupler", COUPLER.at);
  const CX = COUPLER.len / 2;
  const cpBlock = makePart("block");
  const cpBlockMat = solid(GREY.glass, { rough: 0.14, coat: 1, opacity: 0.26, env: 1.4 });
  cpBlockMat.depthWrite = false;
  cpBlockMat.userData.depthWrite = false;
  addMesh(cpBlock, box(COUPLER.len, COUPLER.h, COUPLER.w + 30, 0.8), cpBlockMat, { edgeOpacity: 0.75 });
  cp.add(cpBlock);
  const outZ = (i) => (i / (COUPLER.outs - 1) - 0.5) * 2 * COUPLER.fan * 0.62;
  const stageX = [-44, -24, -4, 16, 34];
  const treeGeos = [];
  let treeMax = 0;
  const radius = [0.95, 0.85, 0.75, 0.65, 0.55, 0.5];
  const addGuide = (pts, level, lo, hi, s0) => {
    const { geo, len } = polyTube(pts, radius[level], { seg: 8, s0, attrs: { aLevel: level, aLo: lo, aHi: hi } });
    treeGeos.push(geo);
    treeMax = Math.max(treeMax, s0 + len);
    return s0 + len;
  };
  const sCurve = (x0, z0, x1, z1, n = 12) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, e = u * u * (3 - 2 * u);
      pts.push([x0 + (x1 - x0) * u, 0, z0 + (z1 - z0) * e]);
    }
    return pts;
  };
  const meanZ = (lo, hi) => (outZ(lo) + outZ(hi)) / 2;
  const sIn = addGuide([[-CX - 110, 0, 0], [stageX[0], 0, 0]], 0, 0, 31, 0);
  const grow = (level, lo, hi, x0, z0, s0) => {
    if (level === 5) {
      const s1 = addGuide([[x0, 0, z0], [CX, 0, z0]], 5, lo, hi, s0);
      const z2 = z0 * 1.9;
      addGuide(sCurve(CX, z0, CX + 130, z2, 10), 5, lo, hi, s1);
      return;
    }
    const mid = (lo + hi + 1) / 2;
    const xN = level < 4 ? stageX[level + 1] : CX - 8;
    for (const [a, b] of [[lo, mid - 1], [mid, hi]]) {
      const s1 = addGuide(sCurve(x0, z0, xN, meanZ(a, b)), level + 1, a, b, s0);
      grow(level + 1, a, b, xN, meanZ(a, b), s1);
    }
  };
  grow(0, 0, 31, stageX[0], 0, sIn);
  const cpU = { uTime: { value: 0 }, uFront: { value: 0 }, uDownK: { value: 0 }, uUpK: { value: 0 }, uTurn: { value: 0 }, uTurnOn: { value: 0 } };
  const cpMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...cpU, uDown: { value: VEILLE.clone().multiplyScalar(2.4) }, uUp: { value: INK.clone().multiplyScalar(1.5) }, uBaseC: { value: INK.clone().multiplyScalar(0.16) } },
    vertexShader: /* glsl */ `
      attribute float aS, aLevel, aLo, aHi; varying float vS, vLevel, vLo, vHi, vFacing;
      void main() {
        vS = aS; vLevel = aLevel; vLo = aLo; vHi = aHi;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vFacing = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uDown, uUp, uBaseC; uniform float uTime, uFront, uDownK, uUpK, uTurn, uTurnOn;
      varying float vS, vLevel, vLo, vHi, vFacing;
      float pick(float i) { return step(vLo - 0.5, i) * step(i, vHi + 0.5); }
      void main() {
        float body = mix(0.45, 1.0, smoothstep(0.1, 0.8, vFacing));
        float lit = 1.0 - smoothstep(uFront - 8.0, uFront, vS);
        float share = pow(0.64, vLevel);
        float u = fract((vS - uTime * 150.0) / 50.0);
        float dash = pow(smoothstep(0.55, 1.0, u), 2.0) * (1.0 - smoothstep(0.95, 1.0, u));
        vec3 c = uBaseC;
        c += uDown * uDownK * lit * share * (0.5 + 1.2 * dash);
        float u2 = fract((-vS - uTime * 150.0) / 50.0 + 0.5);
        float dash2 = pow(smoothstep(0.6, 1.0, u2), 2.0) * (1.0 - smoothstep(0.95, 1.0, u2));
        float i0 = floor(uTurn); float f = fract(uTurn);
        float sel = mix(pick(i0), pick(mod(i0 + 1.0, 32.0)), smoothstep(0.75, 1.0, f));
        sel = mix(1.0, sel, uTurnOn);
        c += uUp * uUpK * sel * (0.2 + 1.1 * dash2);
        gl_FragColor = vec4(c * body, 1.0);
      }`,
  });
  const cpTree = lightMesh(mergeGeometries(treeGeos), cpMat, 6);
  cp.add(cpTree);
  // the fibres outside the block: solid, under their light
  const cpFib = makePart("cpFibres");
  {
    const geos = [cylX(radius[0] * 0.8, 110, 0.05, 12).translate(-CX - 55, 0, 0)];
    for (let i = 0; i < COUPLER.outs; i++) {
      const z0 = outZ(i);
      const pts = sCurve(CX, z0, CX + 130, z0 * 1.9, 10).map((p) => new THREE.Vector3(...p));
      geos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, radius[5] * 0.78, 6, false));
    }
    addMesh(cpFib, mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)).map((g) => { g.deleteAttribute("uv"); return g; })), solid(GREY.pale, { rough: 0.4 }), { edges: false });
  }
  cp.add(cpFib);
  anchorAt("couplerIn", cp, -CX, 0, 0);
  anchorAt("couplerOut", cp, CX, 0, 0);

  /* ═════════ PLUG — your wall socket, the green connector, its ferrule polished at 8°, the box ═════════ */
  const pl = mk("plug", PLUG.at);
  const tilt = Math.tan(PLUG.bevel * DEG);
  const FZ = 20; // the ferrule's face, home (z)
  // the wall: X-ray (the surroundings), a pane of glass and its edges
  const wallGeo = new THREE.BoxGeometry(420, 300, 10);
  const wall = new THREE.Mesh(wallGeo, glass(BRAND.ink, { base: 0, rim: 0.12, edge: 0.4, spec: 0.3, through: 0.2 }));
  wall.position.set(-40, 110 - PLUG.at[1] + 40, -5);
  asShell(wall);
  wall.add(edgesOf(wallGeo, { color: BRAND.ink, width: 1.8, opacity: 0.4 }));
  pl.add(wall);
  // the socket (PTO): a box on the wall, the adapter's collar
  const pto = makePart("pto");
  addMesh(pto, box(116, 116, 30, 4), solid(0xa9afb1, { rough: 0.55 }), { pos: [0, 0, 15] });
  addMesh(pto, box(102, 102, 12, 2), solid(GREY.mid, { rough: 0.5 }), { pos: [0, 0, 36] });
  addMesh(pto, box(92, 92, 1, 0.3), solid(0x15191b, { rough: 0.9 }), { pos: [0, 0, 42.2], edges: false });
  pl.add(remember(pto));
  // the mating ferrule inside the adapter (its face on the same 8° plane)
  const ferruleGeo = (z0, z1, faceAtStart, half) => {
    const g = new THREE.CylinderGeometry(PLUG.ferrule / 2, PLUG.ferrule / 2, z1 - z0, 64, 1, false, half ? 0 : 0, half ? Math.PI : Math.PI * 2).rotateX(Math.PI / 2).translate(0, 0, (z0 + z1) / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      if (faceAtStart && Math.abs(z - z0) < 1e-3) pos.setZ(i, z0 + pos.getY(i) * tilt);
      if (!faceAtStart && Math.abs(z - z1) < 1e-3) pos.setZ(i, z1 + pos.getY(i) * tilt);
    }
    g.computeVertexNormals();
    return g;
  };
  const ceramic = () => solid(0xd2d4d0, { rough: 0.32, coat: 0.5 });
  const mate = makePart("mate");
  const mateFull = addMesh(mate, ferruleGeo(-14, FZ - 0.4, false, false), ceramic(), { edgeOpacity: 0.6 });
  const mateHalf = addMesh(mate, ferruleGeo(-14, FZ - 0.4, false, true), ceramic(), { edgeOpacity: 0.6 });
  pl.add(mate);
  // the green connector: body, boot, cable; its ferrule, the fibre inside
  const conn = new THREE.Group();
  const connBody = makePart("connBody");
  const green = solid(BRAND.veille, { rough: 0.42, coat: 0.4 });
  addMesh(connBody, box(PLUG.body[0], PLUG.body[1], 200, 5), green, { pos: [0, 0, 140], edgeColor: 0x0d2a1d });
  addMesh(connBody, box(PLUG.body[0] * 0.8, PLUG.body[1] * 0.18, 150, 2), solid(0x3fcf8a, { rough: 0.5 }), { pos: [0, PLUG.body[1] * 0.55, 150], edgeColor: 0x0d2a1d });
  addMesh(connBody, lathe([[0, 0], [30, 0], [30, 30], [14, 180], [0, 180]], 48, { bevel: 1.5 }).rotateX(Math.PI / 2).translate(0, 0, 240), solid(0x34b97a, { rough: 0.55 }), { edgeColor: 0x0d2a1d });
  addMesh(connBody, cylX(14, 520, 1, 32).rotateY(Math.PI / 2).translate(0, 0, 420 + 260), solid(GREY.dark, { rough: 0.7 }));
  conn.add(remember(connBody));
  const ferr = makePart("ferrule");
  const ferrFull = addMesh(ferr, ferruleGeo(FZ, 60, true, false), ceramic(), { edgeOpacity: 0.6 });
  const ferrHalf = addMesh(ferr, ferruleGeo(FZ, 60, true, true), ceramic(), { edgeOpacity: 0.6 });
  conn.add(ferr);
  // the section (seen at `bevel`): the cut plane x = 0 of both ferrules, the fibre lying in it
  const section = makePart("section");
  const secMat = solid(0xe1e2dd, { rough: 0.6 });
  const secShape = (z0, z1, faceAtStart) => {
    const h = PLUG.ferrule / 2;
    const pts = faceAtStart ? [[z0 - h * tilt, -h], [z1, -h], [z1, h], [z0 + h * tilt, h]] : [[z0, -h], [z1 - h * tilt, -h], [z1 + h * tilt, h], [z0, h]];
    const s = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)));
    return new THREE.ShapeGeometry(s).rotateY(-Math.PI / 2);
  };
  const secA = new THREE.Mesh(secShape(FZ, 60, true), secMat);
  const secB = new THREE.Mesh(secShape(-14, FZ - 0.4, false), secMat);
  secA.position.x = secB.position.x = -0.05;
  section.add(secA, secB);
  section.userData.part.mats.add(secMat);
  pl.add(section);
  const fibR = 0.62;
  const plFib = new THREE.Mesh(new THREE.CylinderGeometry(fibR, fibR, 74, 16).rotateX(Math.PI / 2).translate(0, 0, 23), solid(GREY.pale, { rough: 0.3 }));
  plFib.position.x = -0.2;
  section.add(plFib);
  section.userData.part.mats.add(plFib.material);
  // the light: in from the cable (toward −z), through the face; a small reflection goes off at 2 × 8°, and (ghost)
  // the one a straight face would send straight back
  const LIN = 380;
  const plIn = flowMat(BRAND.veille, { k: 2.4, x0: 0, period: 40, edge: 0.3 });
  const plInMesh = lightMesh(new THREE.CylinderGeometry(fibR * 0.9, fibR * 0.9, LIN, 12, 1, true).rotateZ(-Math.PI / 2).translate(LIN / 2, 0, 0), plIn, 6);
  plInMesh.rotation.y = Math.PI / 2;
  plInMesh.position.set(-0.4, 0, FZ + LIN);
  const plOn = flowMat(BRAND.veille, { k: 2.0, x0: -LIN, period: 40, edge: 0.3 });
  const plOnMesh = lightMesh(new THREE.CylinderGeometry(fibR * 0.9, fibR * 0.9, 34, 12, 1, true).rotateZ(-Math.PI / 2).translate(17, 0, 0), plOn, 6);
  plOnMesh.rotation.y = Math.PI / 2;
  plOnMesh.position.set(-0.4, 0, FZ);
  const plRef = flowMat(BRAND.veille, { k: 1.1, x0: -LIN, period: 40, half: 22, edge: 0.3 });
  const plRefMesh = lightMesh(new THREE.CylinderGeometry(0.42, 0.42, 60, 10, 1, true).rotateZ(-Math.PI / 2).translate(30, 0, 0), plRef, 7);
  plRefMesh.position.set(-0.6, 0, FZ);
  plRefMesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -Math.sin(2 * PLUG.bevel * DEG), Math.cos(2 * PLUG.bevel * DEG)));
  const plGhost = flowMat(BRAND.ink, { k: 0.55, x0: -LIN, period: 40, half: 30, edge: 0.3, duty: 0.3 });
  const plGhostMesh = lightMesh(new THREE.CylinderGeometry(0.36, 0.36, 70, 10, 1, true).rotateZ(-Math.PI / 2).translate(35, 0, 0), plGhost, 7);
  plGhostMesh.position.set(-0.7, 2.2, FZ);
  plGhostMesh.rotation.y = -Math.PI / 2;
  const plFaceBall = makeBall(0xffffff, BRAND.veille);
  plFaceBall.position.set(-0.8, 0, FZ);
  conn.add(plInMesh);
  pl.add(plOnMesh, plRefMesh, plGhostMesh, plFaceBall, conn);
  // the optical box (ONT), on the bench, its lights
  const ontG = new THREE.Group();
  ontG.position.set(PLUG.ont[0], -PLUG.at[1] + 26, PLUG.ont[2]);
  const ontBody = makePart("ont");
  addMesh(ontBody, box(160, 50, 120, 5), solid(GREY.dark, { rough: 0.6 }), { pos: [0, 0, 0] });
  addMesh(ontBody, box(150, 3, 110, 1), solid(GREY.mid, { rough: 0.5 }), { pos: [0, 26, 0] });
  ontG.add(ontBody);
  const ontLeds = [];
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(box(9, 4, 1.6, 0.6), glow(BRAND.veille, 0.08));
    m.position.set(-45 + i * 22, 6, 60.6);
    ontG.add(m);
    ontLeds.push(m);
  }
  pl.add(ontG);
  anchorAt("ferrule", pl, 0, 0, FZ);
  anchorAt("ont", pl, PLUG.ont[0], -PLUG.at[1] + 52, PLUG.ont[2]);

  // the system is the subject: the bench's fog is for the floor and the grid, never for it
  group.traverse((o) => {
    const ms = o.material ? [o.material].flat() : [];
    for (const m of ms) if (m.fog) { m.fog = false; m.needsUpdate = true; }
  });

  const order = ["cable", "fibre", "principe", "hist", "docs", "subsea", "multi", "splice", "coupler", "plug"];
  const scratch = new THREE.Vector3();
  const DOT_DARK = new THREE.Color(0.17, 0.19, 0.2), DOT_LIT = VEILLE.clone().multiplyScalar(2.2);

  return {
    group, items, A,
    update(S, time) {
      const it = Math.round(S.item);
      for (let i = 0; i < order.length; i++) items[order[i]].visible = i === it;
      const ft = time * S.flow;
      for (let i = 0; i < FLOWS.length; i++) FLOWS[i].uniforms.uTime.value = ft;
      const named = Math.round(S.named);

      if (it === 0) {
        /* CABLE */
        for (let i = 0; i < 4; i++) {
          const u = settle(clamp01((S.explode - cDelay[i]) / 0.62));
          cLayers[i].position.x = cOff[i] * u;
          nameLayer(cLayers[i], named === 0 ? -1 : named === i + 1 || (named === 5 && i === 3) ? 1 : 0);
        }
        const lit = Math.max(S.core, named === 5 ? 1 : 0);
        cCoreGlow.material.uniforms.uBase.value = lit * 0.9;
        cCoreGlow.material.uniforms.uDash.value = S.pulse * 1.4;
        cCoreGlow.visible = lit + S.pulse > 0.01;
      } else if (it === 1) {
        /* FIBRE */
        const bendA = clamp01(S.bend) * F_BEND_MAX;
        FB.uBendA.value = bendA;
        for (let i = 0; i < fBendMeshes.length; i++) fBendMeshes[i].castShadow = false;
        fPulse.uniforms.uBase.value = S.core * 0.85;
        fPulse.uniforms.uDash.value = S.pulse * 1.5;
        fHalo.uniforms.uBase.value = S.core * 0.5;
        fHalo.uniforms.uDash.value = S.pulse;
        const lost = 1 - 0.8 * clamp01(S.leak) * clamp01(S.bend);
        fPulse.uniforms.uCutK.value = fHalo.uniforms.uCutK.value = lost;
        // the end face: the core dot from dark to lit, a small ball that does not drool
        fDotMat.color.lerpColors(DOT_DARK, DOT_LIT, clamp01(S.core));
        shine(fDotBall, clamp01(S.core) * 0.42 * lost, FIBER.core * 1.3);
        const lk = clamp01(S.leak) * ramp(S.bend, 0.85, 1);
        fLeak.visible = lk > 0.01;
        leakMat.uniforms.uDash.value = lk * 1.3;
        leakMat.uniforms.uBase.value = lk * 0.25;
      } else if (it === 2) {
        /* PRINCIPE */
        PB.uBendA.value = clamp01(S.bend) * P_BEND_MAX;
        const wB = clamp01(S.steep) * (1 - ramp(S.bend, 0.5, 0.7));
        const wC = ramp(S.bend, 0.5, 0.7);
        const wA = (1 - wB) * (1 - wC);
        const w = [wA, wB, wC];
        let hx = 0, hy = 0, hw = 0;
        for (let r = 0; r < 3; r++) {
          const ray = rays[r];
          const vis = w[r] > 0.01 && S.ray > 0.001;
          ray.mesh.visible = vis;
          const head = clamp01(S.ray) * ray.len;
          ray.mat.uniforms.uHead.value = head;
          ray.mat.uniforms.uAmount.value = w[r];
          ray.mat.uniforms.uOutK.value = r === 2 ? Math.max(0.15, clamp01(S.leak)) : 1;
          for (let b = 0; b < ray.balls.length; b++) {
            const hs = ray.hits[b].s;
            const flash = vis && head > hs ? Math.exp(-(head - hs) / 22) : 0;
            shine(ray.balls[b], flash * w[r] * (ray.hits[b].out ? 1.1 : 0.8), 6 + 8 * flash, 3);
          }
          if (vis && w[r] > hw) {
            pointAt(ray, head, scratch);
            hx = scratch.x; hy = scratch.y; hw = w[r];
          }
        }
        A.rayHead.position.set(hx, hy, 0);
        shine(headBall, S.ray > 0.001 && S.ray < 0.999 ? 0.75 * hw : 0, 5, 3);
      } else if (it === 3) {
        /* HIST */
        const clear = clamp01(S.clear);
        hRodMat.color.lerpColors(hOld, hNew, clear);
        const half = clear < 0.001 ? HIST.half : HIST.half / Math.max(1e-3, 1 - clear * 0.999);
        const front = clamp01(S.dim) * (HIST.len + 60);
        for (const m of [hLight, hHalo]) {
          m.uniforms.uHalf.value = Math.min(half, 1e6);
          m.uniforms.uFront.value = front;
        }
        const on = clamp01(S.dim);
        hLight.uniforms.uBase.value = on * 0.8;
        hLight.uniforms.uDash.value = on * S.pulse * 1.2 + on * 0.6;
        hHalo.uniforms.uBase.value = on * 0.6;
        hHalo.uniforms.uDash.value = on * 0.5;
        shine(hLamp, on * 0.9, 9, 3);
        const atEnd = front >= HIST.len ? Math.pow(2, -HIST.len / half) : 0;
        shine(hOut, on * atEnd * 0.9, 9, 3);
        const imp = clamp01(S.impure) * (1 - clear);
        hImp.visible = imp > 0.01;
        hImpMat.color.copy(SIGNAL).multiplyScalar(1.8 * imp);
      } else if (it === 4) {
        /* DOCS */
        if (!fontsDone && typeof document !== "undefined" && document.fonts && document.fonts.status === "loaded") {
          fontsDone = true;
          pageKao.paint();
          pageCorning.paint();
        }
        const d = Math.round(S.doc);
        const e = ease(clamp01(S.docIn));
        for (let i = 0; i < 2; i++) {
          const p = pages[i];
          const on = d === i + 1;
          p.visible = on;
          if (on) {
            p.position.set(-70 * (1 - e), 0, 18 * (1 - e));
            p.rotation.y = 14 * DEG * (1 - e);
          }
        }
      } else if (it === 5) {
        /* SUBSEA */
        const ex = settle(clamp01(S.explode));
        sFib.position.x = sFibOff * ex;
        for (let i = 0; i < 4; i++) {
          const u = ease(clamp01(S.layers - i));
          const p = sParts[i];
          p.visible = u > 0.001;
          p.position.x = -320 * (1 - u) + sOff[i] * ex;
          nameLayer(p, named === 0 ? -1 : named === i + 1 ? 1 : 0);
        }
        nameLayer(sFib, named === 0 ? -1 : 0);
      } else if (it === 6) {
        /* MULTI */
        const a = S.assemble;
        const e1 = ease(clamp01(a)), e2 = ease(clamp01(a - 1)), e3 = ease(clamp01(a - 2));
        const ringR = mRing + (64 - mRing) * (1 - e2);
        for (let k = 0; k < MULTI.tubes; k++) {
          const an = (k / MULTI.tubes) * Math.PI * 2 + 0.3;
          mTubes[k].position.set(-60 * (1 - e2) * 0 , Math.sin(an) * ringR, Math.cos(an) * ringR);
        }
        for (let i = 0; i < mFibres.length; i++) {
          const f = mFibres[i];
          const t = mTubes[f.k].position;
          const sl = mSlots[f.j], lo = mLoose[i];
          const spread = 1 + 2.4 * (1 - e1);
          f.mesh.position.set(t.x - 210 * (1 - e1) + lo[0] * (1 - e1) + 12, t.y + sl[0] * spread + lo[1] * (1 - e1), t.z + sl[1] * spread + lo[2] * (1 - e1));
        }
        mCentral.visible = a > 0.95;
        mCentral.position.x = -300 * (1 - e2);
        mJacket.visible = a > 1.95;
        mJacket.position.x = -360 * (1 - e3);
      } else if (it === 7) {
        /* SPLICE */
        const gap = 7 * (1 - clamp01(S.fused));
        const al = clamp01(S.align);
        spL.g.position.set(-gap / 2, 0, 0);
        spR.g.position.set(gap / 2, (1 - al) * 1.7, -(1 - al) * 1.3);
        spL.face.rotation.z = clamp01(S.skew) * 7 * DEG;
        spLightMesh.visible = S.pulse > 0.01 && S.fused > 0.98;
        spLight.uniforms.uDash.value = S.pulse * 1.4;
        const arc = clamp01(S.arc);
        shine(arcBall, arc * 1.1, 4 + 6 * arc, 4);
        arcLine.visible = arc > 0.02;
        arcMat.color.setRGB(2.2 * arc, 2.2 * arc, 2.2 * arc);
        shine(hotBall, arc * 0.7, 3.5, 2);
        // the sleeve: parked on the left fibre, then over the joint, then shrunk
        const sv = S.sleeve;
        spSleeve.position.x = -92 * (1 - ease(clamp01(sv)));
        const sh = 1 - 0.42 * ease(clamp01(sv - 1));
        spSleeve.scale.set(1, sh, sh);
        // the cleaver: shown while the joint is not being made
        const making = S.align > 0.01 || S.arc > 0.01 || S.fused > 0.01 || S.sleeve > 0.01;
        clv.visible = !making;
        if (!making) {
          const c = S.cleave;
          const clamp = ease(clamp01(c));
          for (let i = 0; i < 2; i++) clvPads[i].position.y = fr + 4 + 9 * (1 - clamp);
          clvBlade.position.set(5, -fr - 9.2 - 6 * (1 - bump(c, 2, 0.35)), 0);
          clvAnvil.position.set(5, fr + 4.5 + 10 * (1 - ease(ramp(c, 2.4, 2.75))) - 0.6 * ramp(c, 2.75, 2.9), 0);
          const brk = ease(ramp(c, 2.7, 3));
          clvScrap.position.set(5 + 6 * brk, -16 * brk, 0);
          clvScrap.rotation.z = -22 * DEG * brk;
          clvScrap.visible = brk < 0.999;
          clvFace.rotation.z = clamp01(S.skew) * 7 * DEG;
          scoreMark.visible = c > 1.85 && c < 2.75;
          shine(scoreBall, bump(c, 2, 0.12) * 0.9, 3.5, 2);
        }
        scrU.uAlign.value = al;
        scrU.uFused.value = clamp01(S.fused);
        scrU.uSkew.value = clamp01(S.skew);
        scrU.uArc.value = arc;
      } else if (it === 8) {
        /* COUPLER */
        cpU.uTime.value = ft;
        cpU.uFront.value = clamp01(S.split) * (treeMax + 10);
        cpU.uDownK.value = S.split > 0.001 ? 1 : 0;
        cpU.uUpK.value = clamp01(S.upstream);
        cpU.uTurnOn.value = S.turns > 0.001 ? 1 : 0;
        cpU.uTurn.value = (time * 2.2 * Math.max(S.turns, 0.001)) % 32;
      } else if (it === 9) {
        /* PLUG */
        const e = ease(clamp01(S.plug));
        conn.position.z = (1 - e) * 280;
        const bv = clamp01(S.bevel);
        const cut = bv > 0.01;
        setPartOpacity(connBody, 1 - 0.86 * bv);
        setPartOpacity(pto, 1 - 0.88 * bv);
        setPartOpacity(section, Math.max(0.005, bv));
        ferrFull.visible = mateFull.visible = !cut;
        ferrHalf.visible = mateHalf.visible = cut;
        section.visible = cut;
        const pulse = S.pulse * bv;
        plIn.uniforms.uDash.value = pulse * 1.4;
        plOn.uniforms.uDash.value = pulse * 1.2;
        plRef.uniforms.uDash.value = pulse * 1.0;
        plGhost.uniforms.uDash.value = pulse * 0.9;
        plInMesh.visible = plOnMesh.visible = plRefMesh.visible = plGhostMesh.visible = pulse > 0.01;
        shine(plFaceBall, pulse * 0.35, 2.2, 2);
        const o = clamp01(S.ont);
        for (let i = 0; i < 4; i++) {
          const k = o * (i === 1 ? 1.5 + 0.35 * Math.sin(time * 2.4) : 1.1);
          ontLeds[i].material.color.copy(VEILLE).multiplyScalar(0.08 + k);
        }
      }
    },
  };
}
