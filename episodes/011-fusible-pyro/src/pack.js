// DOSSIER 011 — Fusible pyro : what is SOLID in the X-ray of the car (the shell itself is car.js, the fuse is model.js).
// Centimetres, y up, the nose toward −z. From the ground up:
//   · the traction battery: a tray, its rails, ten modules. Their cells are drawn in the shader of each module's top
//     (a quincunx of caps, each with its own shoulder for the light — and melted into their mean once under the pixel),
//     and between them, in every slot, THE CHARGE: a signal glow that breathes slowly and never goes out
//   · the junction box at its rear end: the battery's post → a shunt → [the seat of the pyro fuse] → a T-bar → two
//     contactors (cylinders lying down) → the lugs of the two cables. A one-line diagram made of copper. Its cover is a
//     part of its own (`box`)
//   · the orange cables (signal, dark and matt — the colour means "high voltage"), to the two drive units; inside,
//     while `hv` is up, wide dashes of signal light running away from the battery
//   · the crash (`crush`): the front drive unit is driven back, the front cable folds; `cable`: its sheath torn where
//     it is jammed on the body's sheet steel — bare strands on steel, slow sparks while `hv` is up
//   · the airbag control unit on the tunnel and its three thin wires (the wheel's bag, the passenger's, the fuse):
//     `ecu` lights it veille, `order` sends a head of veille light down the three wires at once
// Three greys (cast · mid · machined) and copper is the clearest of all: the film has three colours, copper is none.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makePart, addMesh, solid, glow, setGlow, setPartOpacity, box, cyl, plate, mergeGeometries, anchor } from "@kit/build3d.js";
import { PACK, BOX, FUSE, DRIVE, CABLE, ECU, WHEEL } from "./plan.js";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const P3 = (list) => list.map((p) => V(...p));
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const INK = new THREE.Color(BRAND.ink);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const H2 = (BRAND.H / 2).toFixed(1);
const f1 = (x) => x.toFixed(3);

/** How far the crash drives the front drive unit back (cm, at `crush` 1). */
export const BACK = 18;
/** model.js's copper bar: along x through FUSE.home (the current runs toward +x), `half` long each side, its top at `top`, a fixing hole `hole` from its centre. */
const FB = { half: 8.5, top: FUSE.home[1] - 0.6, t: 0.32, hole: 7.3 };
/** …and where the order's wire enters the plug on top of the fuse. */
const PLUG = [FUSE.home[0], FUSE.home[1] + 3.1, FUSE.home[2] - 1.5];
const BAR = { w: 2.2, t: 0.4 };
const CAB = { r: 1.2, copper: 0.74, period: 12, speed: 38 }; // a dash moves 1.27 cm a frame: a ninth of its period — it runs, it does not strobe
const TEAR = 5;
const TOUCH = [10.5, 36.45, -108.3]; // the middle of the stretch of cable the crash lays on the body's sheet steel (the plan's pinch, on the sheet) // half the length of sheath the pinch strips, cm
const CELL = { p: 4.8, r: 2.2 }; // the cells: their pitch and radius (a quincunx)
const FILL = 0.9069 * ((2 * CELL.r) / CELL.p) ** 2; // how much of a module's top its caps cover

// One set of materials per part: a part fades without taking its neighbours along.
const metals = () => ({
  cast: solid(0x262d33, { rough: 0.62, metal: 0.3, coat: 0.25, coatRough: 0.5, env: 0.9 }),
  mid: solid(0x5d666f, { rough: 0.64, metal: 0.25, env: 0.9 }),
  machined: solid(0x8d969e, { rough: 0.72, metal: 0.15, env: 0.7 }), // matt: a flat machined top mirrors the key light at az −40 and bleeds
  copper: solid(0xd9dcdd, { rough: 0.6, metal: 0.15, env: 0.8, double: true }), // matt, like the fuse's own bar: a mirror-flat top bleeds
});

/* ─────────────────────────────────────────────────────────── geometry */

/** A hex head on its washer, standing on y = 0. */
const bolt = (r, h = r * 0.75) => mergeGeometries([cyl(r * 1.45, 0.16, 0.04, 16).translate(0, 0.08, 0), cyl(r, h, 0.07, 6).translate(0, 0.16 + h / 2, 0)]);
/** A round laid along x (its +y end toward −x), or along z (its +y end toward +z). */
const alongX = (g) => g.rotateZ(Math.PI / 2);
const alongZ = (g) => g.rotateX(Math.PI / 2);

/** A polyline with its corners rounded — the way a cable or a bar is bent — and no stretch longer than `stride`. */
function bent(points, cut = 4, steps = 6, stride = 30) {
  const out = [];
  const push = (p) => {
    const last = out[out.length - 1];
    if (last) {
      const n = Math.ceil(last.distanceTo(p) / stride);
      for (let i = 1; i < n; i++) out.push(last.clone().lerp(p, i / n));
    }
    out.push(p);
  };
  points.forEach((p, i) => {
    const a = points[i - 1];
    const b = points[i + 1];
    if (!a || !b) return push(p.clone());
    const u = a.clone().sub(p);
    const v = b.clone().sub(p);
    const k = Math.min(cut.length ? cut[i] : cut, u.length() / 2.2, v.length() / 2.2);
    const from = p.clone().addScaledVector(u.normalize(), k);
    const to = p.clone().addScaledVector(v.normalize(), k);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      push(from.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(p, 2 * t * (1 - t)).addScaledVector(to, t * t));
    }
  });
  return out;
}

/** `n` points evenly spaced along a polyline. → { pts, len } */
function resample(points, n) {
  const at = [0];
  for (let i = 1; i < points.length; i++) at.push(at[i - 1] + points[i].distanceTo(points[i - 1]));
  const len = at[at.length - 1];
  const pts = [];
  let k = 0;
  for (let i = 0; i < n; i++) {
    const s = (len * i) / (n - 1);
    while (k < points.length - 2 && at[k + 1] < s) k++;
    pts.push(points[k].clone().lerp(points[k + 1], clamp01((s - at[k]) / Math.max(1e-6, at[k + 1] - at[k]))));
  }
  return { pts, len };
}

/** A frame carried along a path, without twist: T along it, N "up" (it leans at a joggle), S across. `s`: cm from the start. */
function frames(points) {
  const n = points.length;
  const out = [];
  const T = V();
  const T0 = V();
  const N = V(0, 1, 0);
  const axis = V();
  const q = new THREE.Quaternion();
  let s = 0;
  for (let i = 0; i < n; i++) {
    T.subVectors(points[Math.min(n - 1, i + 1)], points[Math.max(0, i - 1)]).normalize();
    if (i === 0) {
      if (Math.abs(T.y) > 0.9) N.set(0, 0, 1);
    } else {
      axis.crossVectors(T0, T);
      const sin = axis.length();
      if (sin > 1e-7) N.applyQuaternion(q.setFromAxisAngle(axis.divideScalar(sin), Math.atan2(sin, T0.dot(T))));
      s += points[i].distanceTo(points[i - 1]);
    }
    N.addScaledVector(T, -N.dot(T)).normalize();
    T0.copy(T);
    out.push({ p: points[i], T: T.clone(), N: N.clone(), S: new THREE.Vector3().crossVectors(T, N), s });
  }
  return out;
}

/**
 * A round swept along `points`. `s0`…: `aS` is the ruler (cm along the path, scaled so that the whole is `len` if given),
 * `aA` the angle round it. `onPath`: the vertices are left ON the path, their radius beside them (`aRad`) — the shader
 * pushes them out, by that radius or by a number of pixels if that is more.
 */
function sweep(points, radius, { radial = 14, onPath = false, len = 0 } = {}) {
  const fr = frames(points);
  const total = fr[fr.length - 1].s;
  const k = len ? len / total : 1;
  const ring = radial + 1;
  const pos = [];
  const nor = [];
  const aS = [];
  const aA = [];
  const aRad = [];
  const index = [];
  const d = V();
  fr.forEach((f, i) => {
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      d.copy(f.N).multiplyScalar(Math.cos(a)).addScaledVector(f.S, Math.sin(a));
      if (onPath) pos.push(f.p.x, f.p.y, f.p.z);
      else pos.push(f.p.x + d.x * radius, f.p.y + d.y * radius, f.p.z + d.z * radius);
      nor.push(d.x, d.y, d.z);
      aS.push(f.s * k);
      aA.push(a);
      aRad.push(radius);
    }
    if (i) {
      for (let j = 0; j < radial; j++) {
        const a = (i - 1) * ring + j;
        index.push(a, a + 1, a + ring, a + ring, a + 1, a + ring + 1);
      }
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("aS", new THREE.Float32BufferAttribute(aS, 1));
  geo.setAttribute("aA", new THREE.Float32BufferAttribute(aA, 1));
  geo.setAttribute("aRad", new THREE.Float32BufferAttribute(aRad, 1));
  geo.setIndex(index);
  return geo;
}
/** The same sweep in another shape, beside the first: the shader blends from one to the other (`uMorph`). */
function paired(geo, other = geo) {
  geo.setAttribute("aPos2", other.attributes.position.clone());
  geo.setAttribute("aNor2", other.attributes.normal.clone());
  return geo;
}

/** A flat copper bar bent along `points`: `w` wide, `t` thick, flat facets (its long edges are what the light and the line hold). */
function ribbon(points, w = BAR.w, t = BAR.t) {
  const fr = frames(points);
  const pos = [];
  const corner = (f, k, out) => out.copy(f.p).addScaledVector(f.S, (k === 0 || k === 3 ? 0.5 : -0.5) * w).addScaledVector(f.N, (k < 2 ? 0.5 : -0.5) * t);
  const a = V();
  const b = V();
  const c = V();
  const d = V();
  const tri = (p, q, r) => pos.push(p.x, p.y, p.z, q.x, q.y, q.z, r.x, r.y, r.z);
  for (let i = 0; i < fr.length - 1; i++) {
    for (let k = 0; k < 4; k++) {
      corner(fr[i], k, a);
      corner(fr[i], (k + 1) % 4, b);
      corner(fr[i + 1], (k + 1) % 4, c);
      corner(fr[i + 1], k, d);
      tri(a, d, b);
      tri(b, d, c);
    }
  }
  for (const [f, flip] of [[fr[0], false], [fr[fr.length - 1], true]]) {
    corner(f, 0, a);
    corner(f, 1, b);
    corner(f, 2, c);
    corner(f, 3, d);
    if (flip) tri(a, c, b), tri(a, d, c);
    else tri(a, b, c), tri(a, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}
/** The strip of light that lies on such a bar: `aS` along it, `aU` −1…1 across. */
function strip(points, half = BAR.w / 2 - 0.04, lift = BAR.t / 2 + 0.03) {
  const fr = frames(points);
  const pos = [];
  const aS = [];
  const aU = [];
  const index = [];
  fr.forEach((f, i) => {
    for (const u of [-1, 1]) {
      pos.push(f.p.x + f.N.x * lift + f.S.x * half * u, f.p.y + f.N.y * lift + f.S.y * half * u, f.p.z + f.N.z * lift + f.S.z * half * u);
      aS.push(f.s);
      aU.push(u);
    }
    if (i) index.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i, 2 * i - 1, 2 * i + 1);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aS", new THREE.Float32BufferAttribute(aS, 1));
  geo.setAttribute("aU", new THREE.Float32BufferAttribute(aU, 1));
  geo.setIndex(index);
  return geo;
}

/* ─────────────────────────────────────────────────────────── materials that do one more thing */

/** Lines added to a lit material's own shader (it keeps the studio's light, its shadows, its fades). */
function inject(mat, key, { uniforms = {}, vpars = "", vnormal = "", vbegin = "", vend = "", fpars = "", color = "", rough = "", normal = "", emissive = "" }) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${vpars}`)
      .replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>\n${vnormal}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n${vbegin}`)
      .replace("#include <project_vertex>", `#include <project_vertex>\n${vend}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${fpars}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${color}`)
      .replace("#include <metalnessmap_fragment>", `#include <metalnessmap_fragment>\n${rough}`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${normal}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${emissive}`);
  };
  mat.customProgramCacheKey = () => `sd011-${key}`;
  return mat;
}

// What stands over the battery takes its glow from below: on what faces down, and up the foot of what stands on it.
const UNDER = {
  vpars: "varying float vWy;",
  vend: "vWy = (modelMatrix * vec4(transformed, 1.0)).y;",
  fpars: "varying float vWy; uniform float uUnder; uniform vec3 uSignal;",
  emissive: /* glsl */ `{
    vec3 wn = inverseTransformDirection(normal, viewMatrix);
    totalEmissiveRadiance += uSignal * uUnder * clamp(0.3 - 0.7 * wn.y, 0.0, 1.0) * exp(-max(vWy - ${f1(PACK.y1)}, 0.0) / 5.5) * 0.3;
  }`,
};
const underlit = (mat, U, key = "under") => inject(mat, key, { ...UNDER, uniforms: { uUnder: U.under, uSignal: U.signal } });

/**
 * The top of a module: its cells, and the charge between them. `half`: half the field the cells stand in (x, z), counted
 * from the module's centre (`aC`, per vertex); `y0`: the foot of a module — the glow is strongest there, in the slots.
 */
function cellMaterial(U, half, y0) {
  // matt: seen at a grazing angle (a macro on the fuse, el 16) a glossy top mirrors the softbox — a pink sheen behind the subject
  const mat = solid(0x858e96, { rough: 0.84, metal: 0.1, env: 0.4 });
  const RC = f1(CELL.r);
  const P = f1(CELL.p);
  const ROW2 = f1(CELL.p * Math.sqrt(3));
  return inject(mat, "cells", {
    uniforms: { uGlow: U.glow, uTime: U.time, uSignal: U.signal },
    vpars: "attribute vec2 aC; varying vec3 vL; varying vec2 vC; varying vec3 vNo;",
    vbegin: "vL = position; vC = aC; vNo = normal;",
    fpars: "varying vec3 vL; varying vec2 vC; varying vec3 vNo; uniform float uGlow, uTime; uniform vec3 uSignal;",
    color: /* glsl */ `
      vec2 cq = vL.xz - vC; // cm from the centre of the module
      float cw = max(max(fwidth(cq.x), fwidth(cq.y)), 1e-4); // what a pixel covers there
      float cTop = smoothstep(0.5, 0.8, vNo.y);
      vec2 chh = abs(cq);
      float cField = cTop * (1.0 - smoothstep(${f1(half[0])} - cw, ${f1(half[0])} + cw, chh.x)) * (1.0 - smoothstep(${f1(half[1])} - cw, ${f1(half[1])} + cw, chh.y));
      vec2 cs = vec2(${P}, ${ROW2});
      vec2 ca = mod(cq + 0.5 * cs, cs) - 0.5 * cs; // to the nearest cell of one row in two…
      vec2 cb = mod(cq, cs) - 0.5 * cs; //            …and of the other, half a step aside
      vec2 cd = dot(ca, ca) < dot(cb, cb) ? ca : cb;
      vec2 cc = abs(cq - cd); // where that cell stands: only whole cells
      float cIn = step(cc.x, ${f1(half[0] - CELL.r)}) * step(cc.y, ${f1(half[1] - CELL.r)});
      float cr = length(cd);
      float cMelt = smoothstep(0.14, 0.42, cw / ${P}); // too small to count: their mean
      float cCap = cIn * (1.0 - smoothstep(${RC} - cw, ${RC} + cw, cr));
      float cBtn = 1.0 - smoothstep(0.4 * ${RC} - cw, 0.4 * ${RC} + cw, cr);
      float cAlb = mix(cCap * mix(0.62, 1.0, cBtn) * (1.0 - 0.3 * smoothstep(0.78 * ${RC}, ${RC}, cr)), ${f1(FILL * 0.72)}, cMelt);
      diffuseColor.rgb *= mix(0.16, mix(0.24, cAlb, cField), cTop);`,
    normal: /* glsl */ `
      float cSl = cField * cCap * (1.0 - cMelt) * smoothstep(0.5 * ${RC}, ${RC}, cr) * 0.85; // the shoulder of each cap
      normal = normalize(normal + (viewMatrix[0].xyz * cd.x + viewMatrix[2].xyz * cd.y) * (cSl / ${RC}));`,
    emissive: /* glsl */ `
      float cNv = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
      float cBreath = uGlow * (0.86 + 0.14 * sin(uTime * 1.5 - vC.y * 0.02 + vC.x * 0.008)) * mix(0.28, 1.0, smoothstep(70.0, 480.0, length(vViewPosition)));
      float cGap = cField * mix(1.0 - cCap, ${f1(1 - FILL)}, cMelt); // between the cells, down to the bed: seen from above more than from the side
      float cFlank = cField * mix(cCap * smoothstep(0.62 * ${RC}, ${RC}, cr) * 0.14, 0.03, cMelt);
      float cSide = (1.0 - cTop) * (0.14 + 0.62 * exp(-max(vL.y - ${f1(y0)}, 0.0) / 2.8));
      totalEmissiveRadiance += uSignal * cBreath * (cGap * (0.3 + 0.7 * pow(cNv, 1.3)) * 0.62 + cFlank + cSide);`,
  });
}

/**
 * The orange sheath (its vertices on the path, like the dashes': the shader blends the AXIS of the two shapes and rebuilds
 * the round about it — two finished tubes blended collapse where the fold turns their frames round): it takes the cable's
 * second shape (`uMorph`: folded by the crash), and where the pinch strips it
 * (`uTear`, round `uTearS` on the ruler) it shrinks to the copper, ragged, scorched, the bare strands clear.
 */
function sheathMaterial(U) {
  const mat = solid(0xb4421f, { rough: 0.8, metal: 0, env: 0.6 });
  mat.emissive.copy(SIGNAL);
  mat.emissiveIntensity = 0;
  const HALF = f1(TEAR);
  return inject(mat, "sheath", {
    uniforms: { uMorph: U.morph, uTear: U.tear, uTearS: U.tearS, uUnder: U.under, uSignal: U.signal },
    vpars: `attribute vec3 aPos2; attribute vec3 aNor2; attribute float aS; attribute float aA; uniform float uMorph, uTear, uTearS; varying float vS; varying float vA; ${UNDER.vpars}`,
    vnormal: "vec3 mN = mix(normal, aNor2, uMorph); objectNormal = dot(mN, mN) > 0.01 ? normalize(mN) : normal;", // never the normal of nothing
    vbegin: /* glsl */ `
      transformed = mix(position, aPos2, uMorph) + objectNormal * (${f1(CAB.r)} - ${f1(CAB.r - CAB.copper)} * uTear * (1.0 - smoothstep(${HALF} - 1.8, ${HALF} + 0.5, abs(aS - uTearS))));
      vS = aS; vA = aA;`,
    vend: UNDER.vend,
    fpars: `uniform float uTear, uTearS; varying float vS; varying float vA; float tBare; ${UNDER.fpars}`,
    color: /* glsl */ `
      float tEdge = ${HALF} - 0.4 + 0.55 * sin(vA * 5.0 + 1.0) + 0.3 * sin(vA * 11.0);
      float tAt = abs(vS - uTearS);
      tBare = uTear * (1.0 - smoothstep(tEdge - 0.12, tEdge + 0.12, tAt));
      float tScorch = uTear * (1.0 - smoothstep(tEdge, tEdge + 3.0, tAt)) * (1.0 - tBare);
      diffuseColor.rgb = mix(diffuseColor.rgb * (1.0 - 0.8 * tScorch), vec3(0.9, 0.91, 0.92) * (0.8 + 0.2 * sin(vA * 9.0 + vS * 5.5)), tBare);`,
    rough: "roughnessFactor = mix(roughnessFactor, 0.34, tBare); metalnessFactor = mix(metalnessFactor, 0.45, tBare);",
    emissive: `totalEmissiveRadiance *= 1.0 - tBare; ${UNDER.emissive}`,
  });
}

/**
 * The high voltage: wide dashes of signal light running in the cables, away from the battery. A sheath just over the
 * orange one (its vertices on the path: never thinner than `uMinPx`), bright along its axis: light seen inside a tube.
 * `uHv` 1 → 0: the dashes shorten and go out. Past the pinch (`uCut` at `uCutS`) nothing goes on.
 */
const flowMaterial = (U) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: U.signal, uTime: U.time, uHv: U.hv, uMorph: U.morph, uCut: U.tear, uCutS: U.tearS, uMinPx: { value: 2.4 } },
    vertexShader: /* glsl */ `
      attribute vec3 aPos2; attribute vec3 aNor2; attribute float aS; attribute float aRad; uniform float uMorph, uMinPx;
      varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 p = mix(position, aPos2, uMorph);
        vec3 n = mix(normal, aNor2, uMorph);
        n = dot(n, n) > 0.01 ? normalize(n) : normal;
        vec4 c = modelViewMatrix * vec4(p, 1.0);
        float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
        vec4 mv = modelViewMatrix * vec4(p + n * max(aRad, uMinPx * cmPerPx), 1.0);
        vN = normalize(normalMatrix * n);
        vV = normalize(-mv.xyz);
        vS = aS;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uHv, uCut, uCutS; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.5);
        float x = (vS - uTime * ${f1(CAB.speed)}) / ${f1(CAB.period)};
        float duty = 0.56 * (0.3 + 0.7 * uHv);
        float w = clamp(fwidth(x) * 1.5, 0.02, 0.5);
        float q = fract(x);
        float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
        b *= 0.5 + 0.5 * clamp(q / duty, 0.0, 1.0); // a dash is brighter at its head: it says which way it runs, even on a still
        b = mix(b, duty * 0.75, smoothstep(0.12, 0.4, w));
        float beyond = 1.0 - uCut * smoothstep(uCutS - 2.0, uCutS + 2.0, vS);
        gl_FragColor = vec4(uColor * uHv * beyond * (0.14 + 2.4 * b) * body, 1.0);
      }`,
  });

/** The dashes on the copper bars of the junction box: those of the fuse's own bar (model.js: same period, same pace, a lane they darken between them — light only shows on dark). */
const barFlowMaterial = (U) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    uniforms: { uColor: U.signal, uTime: U.time, uHv: U.hv },
    vertexShader: /* glsl */ `
      attribute float aS; attribute float aU; varying float vS; varying float vU;
      void main() {
        vS = aS; vU = aU;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uHv; varying float vS; varying float vU;
      void main() {
        if (uHv < 0.004) discard;
        float x = (vS - uTime * 7.0) / 2.1; // 0.23 cm a frame: a ninth of the period
        float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
        float q = fract(x);
        float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(0.56, 0.56 + w, q));
        b = mix(b, 0.56, smoothstep(0.12, 0.4, w));
        float across = 1.0 - smoothstep(0.76, 1.0, abs(vU));
        b *= across;
        gl_FragColor = vec4(uColor * (1.6 * b), uHv * mix(0.4 * across, 1.0, b));
      }`,
  });

/**
 * A signal wire of the airbag control unit: thin, grey — never under `uMinPx` — and the order running down it:
 * a head of veille light at `uHead` (cm from the unit), the way it came left lit behind it.
 */
const wireMaterial = (U) =>
  new THREE.ShaderMaterial({
    uniforms: { uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() }, uHead: { value: 0 }, uOn: { value: 0 }, uMinPx: { value: 1.2 } },
    vertexShader: /* glsl */ `
      attribute float aS; attribute float aRad; uniform float uMinPx;
      varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 c = modelViewMatrix * vec4(position, 1.0);
        float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
        vec4 mv = modelViewMatrix * vec4(position + normal * max(aRad, uMinPx * cmPerPx), 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vS = aS;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uVeille; uniform float uHead, uOn; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        float body = 0.4 + 0.6 * pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.2);
        float behind = 1.0 - smoothstep(uHead - 2.0, uHead + 2.0, vS);
        float g = vS - uHead;
        gl_FragColor = vec4((uInk * 0.24 + uVeille * uOn * (1.5 * behind + 2.6 * exp(-g * g / 36.0))) * body, 1.0);
      }`,
  });

/** A light seen from anywhere: a bright core and a long tail, on a unit sphere the shader sizes — `uRadius` cm, or `uMinPx` pixels if that is more. */
const haloMaterial = (core = 0.8) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uRadius: { value: 1 }, uMinPx: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uRadius, uMinPx; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        vec4 mv = modelViewMatrix * vec4(position * r, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main() {
        float n = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        gl_FragColor = vec4(uColor * (${core.toFixed(2)} * pow(n, 14.0) + ${(1 - core).toFixed(2)} * pow(n, 4.0)), 1.0);
      }`,
  });
const BALL = new THREE.SphereGeometry(1, 28, 18);
function halo(parent, at, radius, minPx = 0, core = 0.8) {
  const mesh = new THREE.Mesh(BALL, haloMaterial(core));
  mesh.material.uniforms.uRadius.value = radius;
  mesh.material.uniforms.uMinPx.value = minPx;
  mesh.position.set(...at);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  parent.add(mesh);
  return mesh;
}

/**
 * Sparks off bare copper on steel: slow (the film is in slow motion), thrown up, falling back, each one born again in
 * its turn — alive from the first frame, a pure function of `uT`.
 */
function makeSparks(origin, { count = 84, seed = 11 } = {}) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const life = new Float32Array(count * 4); // phase, period (s), size (cm), the share of its period it lives
  for (let i = 0; i < count; i++) {
    pos.set([origin[0] + (rand() - 0.5) * 2.2, origin[1] + rand() * 0.5, origin[2] + (rand() - 0.5) * 3.6], i * 3);
    const a = rand() * Math.PI * 2;
    const out = 5 + rand() * 24;
    vel.set([Math.cos(a) * out - 5, 16 + rand() * 34, Math.sin(a) * out + 7], i * 3); // rather toward the camera's side
    life.set([rand(), 0.9 + rand() * 1.2, 0.3 + Math.pow(rand(), 2) * 0.7, 0.5 + rand() * 0.45], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aVel", new THREE.BufferAttribute(vel, 3));
  geo.setAttribute("aLife", new THREE.BufferAttribute(life, 4));
  const uniforms = { uT: { value: 0 }, uScale: { value: 1 }, uAmount: { value: 0 }, uHot: { value: new THREE.Color(1, 0.88, 0.66).multiplyScalar(4.5) }, uCool: { value: SIGNAL.clone().multiplyScalar(2.6) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale; attribute vec3 aVel; attribute vec4 aLife; varying float vAge;
        void main() {
          float age = fract(uT / aLife.y + aLife.x) / aLife.w; // past 1: waiting for its turn
          vAge = age;
          float tau = clamp(age, 0.0, 1.0) * aLife.y * aLife.w; // seconds since it left
          vec3 p = position + aVel * (tau - 0.2 * tau * tau) + vec3(0.0, -30.0 * tau * tau, 0.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = age > 1.0 ? 0.0 : max(2.0, aLife.z * uScale / max(0.5, -mv.z));
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; uniform float uAmount; varying float vAge;
        void main() {
          if (vAge > 1.0) discard;
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - d), 1.6) * sin(3.14159 * clamp(vAge, 0.0, 1.0));
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.0, 0.55, vAge)) * a * uAmount, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 6;
  return { points, uniforms };
}

/* ─────────────────────────────────────────────────────────── the pieces */

/** A contactor: a cylinder lying along x, its terminal head at the +x end (`dir` −1: at the −x end), two studs on top of it. Centre of the cylinder at (x, y, z). → the y of a bar laid on its head */
function contactor(part, m, x, y, z, dir = 1) {
  const at = (g, dx = 0, dy = 0, dz = 0) => g.translate(x + dir * dx, y + dy, z + dz);
  addMesh(part, at(alongX(cyl(3.3, 6.4, 0.35, 40)), -1), m.cast, { edgeOpacity: 0.55 });
  addMesh(part, mergeGeometries([at(alongX(cyl(3.42, 0.5, 0.1, 40)), -3), at(alongX(cyl(3.42, 0.5, 0.1, 40)), 1)]), m.machined, { edges: false });
  addMesh(part, mergeGeometries([at(alongX(cyl(2.7, 0.9, 0.2, 32)), -4.65), at(box(1.3, 1.3, 1.9, 0.15), -5.5, 0.4), at(box(6.4, 0.8, 5.4, 0.2), -1, -3.5)]), m.mid, { edgeOpacity: 0.5 });
  addMesh(part, mergeGeometries([at(alongX(cyl(3.45, 2.6, 0.35, 40)), 3.5), at(box(2.6, 0.9, 5.8, 0.15), 3.5, 3)]), m.machined, { edgeOpacity: 0.6 });
  const top = 3.45;
  const studs = [];
  for (const dz of [-1.75, 1.75]) {
    studs.push(at(cyl(0.5, 1.5, 0.08, 16), 3.5, top + 0.75, dz), at(cyl(0.95, 0.55, 0.08, 6), 3.5, top + BAR.t + 0.3, dz), at(cyl(1.25, 0.12, 0.03, 16), 3.5, top + BAR.t + 0.06, dz));
  }
  addMesh(part, mergeGeometries(studs), m.copper, { edges: false });
  return y + top + BAR.t / 2;
}

/**
 * A drive unit (motor, reduction gear, inverter), drawn round its own point: the half-shafts leave on the motor's axis
 * (`sy` under that point, 5 cm behind it), the orange cable enters at (6, 0, 18), facing +z. Dark castings, machined faces clearer.
 */
function driveUnit(name, sy) {
  const part = makePart(name);
  const m = metals();
  const sz = 5;
  const on = (g, x, dy = 0, dz = 0) => g.translate(x, sy + dy, sz + dz); // on the motor's axis
  addMesh(part, on(alongX(cyl(12.5, 30, 0.9, 56)), -9), m.cast, { edgeOpacity: 0.5 });
  const fins = [];
  for (let i = 0; i < 6; i++) fins.push(on(alongX(cyl(13.3, 1.1, 0.3, 56)), -20 + i * 4.3));
  addMesh(part, mergeGeometries(fins), m.mid, { edges: false });
  addMesh(part, on(alongX(cyl(13.4, 9, 1, 56)), 10.5), m.cast, { edgeOpacity: 0.5 }); // the reduction gear
  // machined faces: the end bell, the gear's cover, the two outputs
  const faces = [on(alongX(cyl(11, 1.4, 0.3, 56)), -24.6), on(alongX(cyl(11.6, 1.2, 0.3, 56)), 15.5), on(alongX(cyl(4.4, 2.6, 0.4, 32)), 17), on(alongX(cyl(4.4, 2.2, 0.4, 32)), -26)];
  addMesh(part, mergeGeometries(faces), m.machined, { edgeOpacity: 0.7 });
  const small = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.39;
    small.push(alongX(bolt(0.8)).translate(-25.3, sy + Math.cos(a) * 9.4, sz + Math.sin(a) * 9.4));
    small.push(bolt(0.8).rotateZ(-Math.PI / 2).translate(16.1, sy + Math.cos(a) * 10, sz + Math.sin(a) * 10));
  }
  // the half-shafts and their boots
  addMesh(part, mergeGeometries([on(alongX(cyl(1.7, 20, 0.2, 20)), 28.5), on(alongX(cyl(1.7, 14, 0.2, 20)), -34)]), m.machined, { edges: false });
  addMesh(part, mergeGeometries([on(cyl(3.6, 5, 0.6, 24, 2.2).rotateZ(-Math.PI / 2), 21.5), on(alongX(cyl(3.6, 5, 0.6, 24, 2.2)), -29.5)]), m.cast, { edges: false });
  // the inverter: a box on top, its machined cover, its ribs; and the leg that carries the cable's socket down the back
  addMesh(part, mergeGeometries([box(34, 13.2, 26, 0.9).translate(-4, 7.6, -3), box(26, 14, 9, 0.9).translate(2, 3.5, 12.5)]), m.cast, { edgeOpacity: 0.55 });
  addMesh(part, box(30, 0.7, 22, 0.25).translate(-4, 14.45, -3), m.machined, { edgeOpacity: 0.7 });
  const ribs = [];
  for (let i = 0; i < 5; i++) ribs.push(box(1.1, 0.7, 17, 0.2).translate(-14 + i * 5, 15.05, -3));
  addMesh(part, mergeGeometries(ribs), m.mid, { edges: false });
  for (const [x, z] of [[-17.5, -12.5], [9.5, -12.5], [-17.5, 6.5], [9.5, 6.5]]) small.push(bolt(0.7).translate(x, 14.8, z));
  addMesh(part, mergeGeometries(small), m.copper, { edges: false });
  // its mounts: two arms and their bushes
  addMesh(part, mergeGeometries([box(5, 5, 9, 0.6).translate(-21, 7, -15), box(5, 5, 9, 0.6).translate(13, 7, -15)]), m.cast, { edgeOpacity: 0.5 });
  addMesh(part, mergeGeometries([alongX(cyl(3.1, 6, 0.4, 28)).translate(-21, 7, -19.5), alongX(cyl(3.1, 6, 0.4, 28)).translate(13, 7, -19.5)]), m.machined, { edgeOpacity: 0.6 });
  // the socket the orange cable plugs into, and the cable's own collar (orange: high voltage)
  addMesh(part, box(9, 7.4, 2.2, 0.5).translate(6, 0, 17.2), m.mid, { edgeOpacity: 0.6 });
  const collar = solid(0xb4421f, { rough: 0.7, metal: 0 });
  addMesh(part, alongZ(cyl(2.05, 2.6, 0.3, 28)).translate(6, 0, 19.2), collar, { edgeOpacity: 0.35, edgeColor: 0x2a0d05 });
  return part;
}

/* ─────────────────────────────────────────────────────────── the set */

/**
 * → { group, A, update(p, time, px) }, p = { pack, box, hv, cable, ecu, order, crush, shell } (see world.js):
 *   pack    0–1: everything the high voltage lives in (battery, junction box, cables, drive units) — and the charge with it
 *   box     the junction box's COVER alone: 1 closed → 0 gone (contactors, bars, shunt stay: the fuse is seen among them)
 *   hv      the dashes in the cables and on the bars: 1 running → 0 none (the sheaths stay orange, dull)
 *   crush   the front drive unit driven back BACK cm, the front cable folded behind it
 *   cable   the fold jammed on the body's sheet steel (which appears): sheath torn, copper bare; sparks and a glow while hv is up
 *   ecu     the control unit: three bars light one after the other, then the whole panel (veille)
 *   order   a head of veille light on each of the three wires, 0 at the unit → 1 at the two bags and at the fuse
 */
export function buildPack() {
  const group = new THREE.Group();
  const A = {};
  const U = {
    time: { value: 0 }, glow: { value: 1 }, under: { value: 1 }, signal: { value: SIGNAL.clone() },
    hv: { value: 1 }, morph: { value: 0 }, tear: { value: 0 }, tearS: { value: 1e6 }, live: { value: 0 },
  };
  const fades = []; // the parts `pack` fades

  /* ── the battery: tray, rails, modules, the charge ── */
  const battery = makePart("battery");
  const RAIL = 5;
  const cx = (PACK.x0 + PACK.x1) / 2;
  const cz = (PACK.z0 + PACK.z1) / 2;
  const MOD = { y0: PACK.y0 + 3, y1: PACK.y1 - 1.4, slot: 2, edge: 1.6, spine: 8 };
  let bed;
  {
    const m = metals();
    const w = PACK.x1 - PACK.x0;
    const l = PACK.z1 - PACK.z0;
    const h = PACK.y1 - PACK.y0 - 1;
    const ym = PACK.y0 + 1 + h / 2;
    addMesh(battery, box(w - 1, 1.4, l - 1, 0.3).translate(cx, PACK.y0 + 0.7, cz), m.cast, { edgeOpacity: 0.4 });
    const rails = [
      box(RAIL, h, l, 0.6).translate(PACK.x0 + RAIL / 2, ym, cz),
      box(RAIL, h, l, 0.6).translate(PACK.x1 - RAIL / 2, ym, cz),
      box(w - 2 * RAIL + 1, h, RAIL, 0.6).translate(cx, ym, PACK.z0 + RAIL / 2),
      box(w - 2 * RAIL + 1, h, RAIL, 0.6).translate(cx, ym, PACK.z1 - RAIL / 2),
    ];
    addMesh(battery, mergeGeometries(rails), m.mid, { edgeOpacity: 0.65 });
    // the lugs that bolt it under the sills, and the bosses of the cover's screws along the rails
    const lugs = [];
    const bosses = [];
    for (let i = 0; i < 6; i++) {
      const z = PACK.z0 + 22 + (i * (l - 44)) / 5;
      for (const side of [-1, 1]) lugs.push(box(4.6, 2.4, 9, 0.5).translate(cx + side * (w / 2 + 1.7), PACK.y0 + 5.2, z));
    }
    for (let i = 0; i < 14; i++) {
      const z = PACK.z0 + 8 + (i * (l - 16)) / 13;
      for (const side of [-1, 1]) bosses.push(cyl(1.05, 0.5, 0.14, 12).translate(cx + side * (w / 2 - RAIL / 2), PACK.y1 + 0.2, z));
    }
    for (let i = 0; i < 6; i++) {
      const x = PACK.x0 + 17 + (i * (w - 34)) / 5;
      for (const side of [-1, 1]) bosses.push(cyl(1.05, 0.5, 0.14, 12).translate(x, PACK.y1 + 0.2, cz + side * (l / 2 - RAIL / 2)));
    }
    addMesh(battery, mergeGeometries(lugs), m.machined, { edgeOpacity: 0.6 });
    addMesh(battery, mergeGeometries(bosses), m.machined, { edges: false });

    // ten modules: two columns either side of the spine, five rows
    const inW = w - 2 * RAIL;
    const inL = l - 2 * RAIL;
    const mw = (inW - MOD.spine - 2 * MOD.edge) / 2;
    const ml = (inL - 2 * MOD.edge - 4 * MOD.slot) / 5;
    const half = [mw / 2 - 1.85, ml / 2 - 1.28];
    const blocks = [];
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const x = cx + side * (MOD.spine / 2 + mw / 2);
        const z = cz - inL / 2 + MOD.edge + ml / 2 + i * (ml + MOD.slot);
        const g = box(mw, MOD.y1 - MOD.y0, ml, 0.5).translate(x, (MOD.y0 + MOD.y1) / 2, z);
        const centre = new Float32Array(g.attributes.position.count * 2);
        for (let k = 0; k < centre.length; k += 2) centre[k] = x, centre[k + 1] = z;
        g.setAttribute("aC", new THREE.BufferAttribute(centre, 2));
        blocks.push(g);
        if (side < 0 && i === 2) A.module = anchor(group, x, MOD.y1, z);
      }
    }
    addMesh(battery, mergeGeometries(blocks), cellMaterial(U, half, MOD.y0), { edgeOpacity: 0.5, edgeColor: BRAND.ink });
    // the bed of light they stand over (seen down the slots), and the spine's cover between the two columns
    bed = glow(BRAND.signal, 1);
    addMesh(battery, new THREE.PlaneGeometry(inW, inL).rotateX(-Math.PI / 2).translate(cx, PACK.y0 + 1.5, cz), bed, { edges: false });
    addMesh(battery, box(MOD.spine - 2, 0.9, inL - 4, 0.25).translate(cx, MOD.y1 - 0.45, cz), m.machined, { edgeOpacity: 0.6 });
    const screws = [];
    for (let i = 0; i < 10; i++) screws.push(cyl(0.8, 0.35, 0.1, 10).translate(cx, MOD.y1 + 0.1, cz - inL / 2 + 12 + (i * (inL - 24)) / 9));
    addMesh(battery, mergeGeometries(screws), m.mid, { edges: false });
  }
  group.add(battery);
  fades.push(battery);
  A.pack = anchor(group, cx, PACK.y1, cz);

  /* ── the junction box: its base, what stands in it, its cover ── */
  const bx = (BOX.x0 + BOX.x1) / 2;
  const bz = (BOX.z0 + BOX.z1) / 2;
  const bw = BOX.x1 - BOX.x0;
  const bl = BOX.z1 - BOX.z0;
  const FLOOR = BOX.y0 + 1.2;
  const [fx, , fz] = FUSE.home;
  const x0 = fx - FB.half; // the two ends of the fuse's bar: the current comes in at x0, leaves at x1
  const x1 = fx + FB.half;
  const yA = FB.top - FB.t - BAR.t / 2; // my bars lap its ends from under, a bolt through its hole
  const yL = 34.4; // the bars under the cables' lugs
  const xS = x1 + 3; // the studs of the two contactors
  const frontLug = [CABLE.front[0][0], 35, BOX.z0 + 7.2]; // the bolt of the front cable's lug…
  const rearLug = [CABLE.rear[0][0], 35, BOX.z1 - 4.1]; // …and of the rear one's
  const base = makePart("junction-base");
  const inner = makePart("junction-inner");
  const cover = makePart("junction-cover");
  const strips = [];
  {
    const m = metals();
    addMesh(base, box(bw - 1, 1.2, bl - 1, 0.3).translate(bx, BOX.y0 + 0.6, bz), m.cast, { edgeOpacity: 0.5 });
    const wx = bw / 2 - 1.1;
    const wz = bl / 2 - 1.1;
    const walls = [
      box(1.2, 2.4, bl - 1, 0.25).translate(bx - wx, FLOOR + 1.2, bz),
      box(1.2, 2.4, bl - 1, 0.25).translate(bx + wx, FLOOR + 1.2, bz),
      box(bw - 2.4, 2.4, 1.2, 0.25).translate(bx, FLOOR + 1.2, bz - wz),
      box(bw - 2.4, 2.4, 1.2, 0.25).translate(bx, FLOOR + 1.2, bz + wz),
      // the two posts the cables' glands stand on
      box(5.6, 4.8, 1.8, 0.4).translate(frontLug[0], FLOOR + 4.6, bz - wz),
      box(5.6, 4.8, 1.8, 0.4).translate(rearLug[0], FLOOR + 4.6, bz + wz),
    ];
    addMesh(base, mergeGeometries(walls), underlit(m.mid, U), { edgeOpacity: 0.6 });
    addMesh(base, mergeGeometries([alongZ(cyl(2.05, 3.2, 0.3, 28)).translate(frontLug[0], 35, BOX.z0 - 1), alongZ(cyl(2.05, 3.2, 0.3, 28)).translate(rearLug[0], 35, BOX.z1 + 1)]), m.machined, { edgeOpacity: 0.6 });
  }
  {
    const m = metals();
    const small = []; // bolts, nuts: clear, no outline
    const posts = []; // insulators: dark
    const bars = [];
    const bar = (pts, cut = 0.8) => {
      const path = bent(P3(pts), cut, 5, 30);
      bars.push(ribbon(path));
      strips.push(strip(path));
    };
    const stand = (x, z, top, r = 1.25) => posts.push(cyl(r, top - FLOOR, 0.2, 20).translate(x, (top + FLOOR) / 2, z), cyl(r + 0.35, 0.5, 0.12, 20).translate(x, (top + FLOOR) / 2, z));
    // the battery's post, through the floor of the box
    const rx = x0 - 11;
    addMesh(inner, cyl(2.5, 1.7, 0.3, 28).translate(rx, FLOOR + 0.85, fz), m.cast, { edgeOpacity: 0.5 });
    addMesh(inner, cyl(1.4, yA - BAR.t / 2 - FLOOR, 0.15, 24).translate(rx, (yA - BAR.t / 2 + FLOOR) / 2, fz), m.copper, { edgeOpacity: 0.5 });
    small.push(bolt(0.75).translate(rx, yA + BAR.t / 2, fz));
    // …the shunt: the bar necks down to a strip of dull alloy, a sense block astride it…
    const sx = (rx + x0) / 2 - 0.4;
    bars.push(ribbon(P3([[rx - 1.5, yA, fz], [sx - 1.9, yA, fz]])), ribbon(P3([[sx + 1.9, yA, fz], [x0 + 2.6, yA, fz]])));
    strips.push(strip(P3([[rx - 1.5, yA, fz], [x0 + 2.6, yA, fz]])));
    addMesh(inner, box(4.4, BAR.t - 0.08, 1.5, 0.1).translate(sx, yA, fz), m.mid, { edgeOpacity: 0.5 });
    addMesh(inner, mergeGeometries([box(2.6, 0.9, 2.8, 0.15).translate(sx, yA + 0.7, fz), box(1.2, 0.7, 1.4, 0.1).translate(sx, yA + 1.45, fz - 0.4)]), m.cast, { edgeOpacity: 0.5 });
    // …the two ends of the fuse's bar, each bolted through its hole on a bar of mine, over an insulator…
    for (const x of [fx - FB.hole, fx + FB.hole]) {
      small.push(bolt(0.62).translate(x, FB.top, fz));
      stand(x, fz, yA - BAR.t / 2);
    }
    // …a step up to the crossbar that feeds the two contactors (each one's "out" stud in line with the lug of its cable)
    const zF = frontLug[2] + 1.75;
    const zR = rearLug[2] - 1.75;
    const yT = contactor(inner, m, xS + 3.5, FLOOR + 3.9, zF, -1);
    contactor(inner, m, xS + 3.5, FLOOR + 3.9, zR, -1);
    A.contactor = anchor(group, xS + 4.5, FLOOR + 7.3, zR);
    bar([[x1 - 2.6, yA, fz], [xS - 1.25, yA, fz], [xS - 1.25, yT - BAR.t, fz], [xS + 1.05, yT - BAR.t, fz]]);
    bars.push(ribbon(P3([[xS, yT, zF + 0.65], [xS, yT, zR - 0.65]])));
    strips.push(strip(P3([[xS, yT, fz], [xS, yT, zF + 0.65]])), strip(P3([[xS, yT, fz], [xS, yT, zR - 0.65]])));
    small.push(bolt(0.7).translate(xS, yT + BAR.t / 2, fz));
    // each contactor's way out, down to the lug of its cable (the rear one's runs low along the back wall, on two insulators)
    for (const [lug, feet] of [[frontLug, []], [rearLug, [x0 + 4, x0 - 7]]]) {
      bar([[xS + 1.1, yT, lug[2]], [xS - 1.9, yT, lug[2]], [xS - 3.9, yL, lug[2]], [lug[0] - 1.3, yL, lug[2]]]);
      for (const x of feet) stand(x, lug[2], yL - BAR.t / 2, 0.95);
    }
    addMesh(inner, mergeGeometries(bars), m.copper, { edgeOpacity: 0.8 });
    addMesh(inner, mergeGeometries(posts), m.cast, { edgeOpacity: 0.45 });
    // the lugs crimped on the two cables
    const lugY = yL + BAR.t / 2 + 0.2;
    const lugs = [
      alongZ(cyl(1.12, 3.4, 0.15, 20)).translate(frontLug[0], 35, frontLug[2] - 3.3),
      box(2.7, 0.4, 3.8, 0.12).translate(frontLug[0], lugY, frontLug[2] - 0.1),
      alongZ(cyl(1.12, 3.4, 0.15, 20)).translate(rearLug[0], 35, rearLug[2] + 3.3),
      box(2.7, 0.4, 3.8, 0.12).translate(rearLug[0], lugY, rearLug[2] + 0.1),
    ];
    addMesh(inner, mergeGeometries(lugs), m.machined, { edgeOpacity: 0.6 });
    small.push(bolt(0.75).translate(frontLug[0], lugY + 0.2, frontLug[2]), bolt(0.75).translate(rearLug[0], lugY + 0.2, rearLug[2]));
    addMesh(inner, mergeGeometries(small), m.copper, { edges: false });
    // the measuring board in the free corner, and the pre-charge resistor behind it
    const cxB = bx - bw / 2 + 12;
    const czB = bz - bl / 2 + 7.5;
    addMesh(inner, box(13, 0.35, 8.5, 0.1).translate(cxB, FLOOR + 0.55, czB), m.cast, { edgeOpacity: 0.5 });
    addMesh(inner, mergeGeometries([box(3, 0.55, 3, 0.1).translate(cxB - 3, FLOOR + 1, czB + 1.2), box(1.6, 0.8, 4.6, 0.1).translate(cxB + 3.4, FLOOR + 1.1, czB + 0.6), box(5, 1.3, 1.5, 0.15).translate(cxB - 0.8, FLOOR + 1.35, czB - 3)]), m.mid, { edgeOpacity: 0.5 });
    const fins = [box(10, 1.6, 3.4, 0.3).translate(cxB, FLOOR + 1.2, bz + bl / 2 - 7.5)];
    for (let i = 0; i < 6; i++) fins.push(box(0.7, 2.6, 4.2, 0.15).translate(cxB - 4 + i * 1.6, FLOOR + 1.5, bz + bl / 2 - 7.5));
    addMesh(inner, mergeGeometries(fins), m.mid, { edgeOpacity: 0.45 });
    // the dashes on the bars
    const light = new THREE.Mesh(mergeGeometries(strips), barFlowMaterial(U));
    light.renderOrder = 4;
    inner.add(light);
  }
  {
    const m = metals();
    const body = underlit(solid(0x3a4249, { rough: 0.72, metal: 0.2, env: 0.8 }), U, "cover");
    const top = BOX.y1 + 0.1;
    addMesh(cover, mergeGeometries([box(bw + 0.6, top - FLOOR - 0.4, bl + 0.6, 1.3).translate(bx, (top + FLOOR + 0.4) / 2, bz), box(bw + 2.6, 1, bl + 2.6, 0.35).translate(bx, FLOOR + 0.7, bz)]), body, { edgeOpacity: 0.6 });
    addMesh(cover, mergeGeometries([box(bw - 12, 0.5, 2.2, 0.2).translate(bx, top + 0.2, bz - 9), box(bw - 12, 0.5, 2.2, 0.2).translate(bx, top + 0.2, bz + 9)]), m.mid, { edgeOpacity: 0.5 });
    addMesh(cover, box(22, 0.3, 9, 0.12).translate(bx - 14, top + 0.1, bz), m.mid, { edgeOpacity: 0.6 });
    const screws = [];
    for (const sx of [-1, -0.34, 0.34, 1]) for (const sz of [-1, 1]) screws.push(bolt(0.7).translate(bx + sx * (bw / 2 - 3), FLOOR + 1.2, bz + sz * (bl / 2 + 0.75)));
    for (const sx of [-1, 1]) screws.push(bolt(0.7).translate(bx + sx * (bw / 2 + 0.75), FLOOR + 1.2, bz));
    addMesh(cover, mergeGeometries(screws), m.copper, { edges: false });
  }
  group.add(base, inner, cover);
  fades.push(base, inner);
  A.box = anchor(group, bx, BOX.y1, bz);
  A.fuseSeat = anchor(group, ...FUSE.home);

  /* ── the orange cables ── */
  const cables = makePart("cables");
  const N = 240;
  const endF = [6, DRIVE.front[1], DRIVE.front[2] + 18]; // the socket of the front drive unit…
  const endR = [-6, DRIVE.rear[1], DRIVE.rear[2] - 18]; // …and of the rear one (the same unit, turned round)
  const lead = [[frontLug[0], 35, BOX.z0 + 1.6], [frontLug[0], 35, BOX.z0 - 3], CABLE.front[1], CABLE.front[2]];
  const rest = resample(bent(P3([...lead, CABLE.front[3], [endF[0], endF[1], endF[2] + 4], [endF[0], endF[1], endF[2] - 0.6]]), 7), N);
  // folded by the crash: it bows up in the tunnel, comes down on the body's sheet steel — where it is jammed — and loops back up into its socket
  const contact = [[10.9, 36.45, -104.6], [10.2, 36.45, -111.4]];
  const folded = resample(
    bent(P3([...lead, [13.5, 43, -78], [12.4, 39.6, -95.5], ...contact, [7.6, 40.8, -109], [endF[0], endF[1], endF[2] + BACK + 4.2], [endF[0], endF[1], endF[2] + BACK - 0.6]]), [0, 4, 7, 7, 7, 4, 2.2, 1.6, 2, 2, 0]),
    N,
  );
  const touch = V(...TOUCH);
  const tearAt = folded.pts.reduce((best, p, i) => (p.distanceTo(touch) < folded.pts[best].distanceTo(touch) ? i : best), 0);
  U.tearS.value = (rest.len * tearAt) / (N - 1);
  const rear = resample(bent(P3([[rearLug[0], 35, BOX.z1 - 1.6], [rearLug[0], 35, BOX.z1 + 3], [endR[0] - 0.5, endR[1] - 0.6, endR[2] - 5], [endR[0], endR[1], endR[2] + 0.6]]), 3.5), 28);
  const sheath = sheathMaterial(U);
  const lit = flowMaterial(U);
  for (const geo of [paired(sweep(rest.pts, CAB.r, { onPath: true, len: rest.len }), sweep(folded.pts, CAB.r, { onPath: true })), paired(sweep(rear.pts, CAB.r, { onPath: true }))]) {
    const mesh = addMesh(cables, geo, sheath, { edges: false });
    mesh.frustumCulled = false;
    mesh.castShadow = false; // its shadow would be that of a line
  }
  const dashes = new THREE.Mesh(
    mergeGeometries([paired(sweep(rest.pts, CAB.r + 0.12, { onPath: true, len: rest.len }), sweep(folded.pts, CAB.r + 0.12, { onPath: true })), paired(sweep(rear.pts, CAB.r + 0.12, { onPath: true }))]),
    lit,
  );
  dashes.frustumCulled = false;
  dashes.renderOrder = 4;
  cables.add(dashes);
  group.add(cables);
  fades.push(cables);
  A.cableFront = anchor(group, CABLE.front[2][0], CABLE.front[2][1] + CAB.r, -20);
  A.pinch = anchor(group, ...CABLE.pinch);

  /* ── the body's sheet steel, where the cable is jammed (it shows with `cable`), the sparks, the glow of the contact ── */
  const tole = makePart("sheet");
  const SHEET = 35.7; // its top
  {
    const steel = inject(solid(0x6c757d, { rough: 0.5, metal: 0.4, double: true }), "sheet", {
      uniforms: { uLive: U.live, uSignal: U.signal },
      vpars: "varying vec3 vL;",
      vbegin: "vL = position;",
      fpars: "varying vec3 vL; uniform float uLive; uniform vec3 uSignal;",
      // under tension: the light of the contact spreads over the steel
      emissive: `totalEmissiveRadiance += uSignal * uLive * (0.025 + 0.75 * exp(-length(vL - vec3(${f1(TOUCH[0])}, ${f1(SHEET)}, ${f1(TOUCH[2])})) / 5.0));`,
    });
    const pieces = [
      box(36, 0.35, 16.4, 0.1).translate(12, SHEET - 0.175, -105.8),
      box(36, 6.6, 0.35, 0.1).translate(12, SHEET - 3.3, -113.8),
      box(0.35, 7, 16.4, 0.1).translate(29.8, SHEET + 3.3, -105.8),
      box(30, 0.5, 1.4, 0.2).translate(11, SHEET + 0.2, -99.6),
    ];
    addMesh(tole, mergeGeometries(pieces), steel, { edgeOpacity: 0.7 });
  }
  group.add(tole);
  const sparks = makeSparks([TOUCH[0], SHEET + 0.5, TOUCH[2]]);
  group.add(sparks.points);
  const arcGlow = halo(group, [TOUCH[0], SHEET + 0.6, TOUCH[2]], 3.4, 7, 0.8);

  /* ── the drive units ── */
  const driveF = driveUnit("drive-front", 34 - DRIVE.front[1]);
  driveF.position.set(...DRIVE.front);
  const driveR = driveUnit("drive-rear", 34 - DRIVE.rear[1]);
  driveR.position.set(...DRIVE.rear);
  driveR.rotation.y = Math.PI;
  group.add(driveF, driveR);
  fades.push(driveF, driveR);
  A.driveFront = anchor(driveF, -4, 15, -5);
  A.driveRear = anchor(driveR, -4, 15, -5);

  /* ── the airbag control unit, its three wires, the order ── */
  const unit = makePart("ecu");
  const [ex, ey, ez] = ECU;
  const PANEL = [9.4, 11.6];
  const m = metals();
  const housing = solid(0x6f7880, { rough: 0.5, metal: 0.35, env: 1 });
  housing.emissive.copy(VEILLE);
  housing.emissiveIntensity = 0;
  addMesh(unit, box(13, 3.4, 16.5, 0.5).translate(ex, ey, ez), housing, { edgeOpacity: 0.7 });
  const ears = [];
  const earBolts = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      ears.push(box(2.6, 0.8, 3, 0.2).translate(ex + sx * 7.4, ey - 1.3, ez + sz * 5.6));
      earBolts.push(bolt(0.6).translate(ex + sx * 7.6, ey - 0.9, ez + sz * 5.6));
    }
  }
  addMesh(unit, mergeGeometries(ears), m.mid, { edgeOpacity: 0.5 });
  addMesh(unit, mergeGeometries(earBolts), m.copper, { edges: false });
  addMesh(unit, mergeGeometries([box(9, 2.6, 2.2, 0.3).translate(ex, ey - 0.1, ez - 9.2), box(5, 2.6, 2.2, 0.3).translate(ex, ey - 0.1, ez + 9.2)]), m.cast, { edgeOpacity: 0.5 });
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(...PANEL).rotateX(-Math.PI / 2).translate(ex, ey + 1.78, ez),
    new THREE.ShaderMaterial({
      uniforms: { uEcu: { value: 0 }, uVeille: { value: VEILLE.clone() }, uInk: { value: INK.clone() } },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: /* glsl */ `
        uniform float uEcu; uniform vec3 uVeille, uInk; varying vec2 vUv;
        float rect(vec2 p, vec2 h, float w) { vec2 d = abs(p) - h; return 1.0 - smoothstep(-w, w, max(d.x, d.y)); }
        void main() {
          vec2 p = (vUv - 0.5) * vec2(${f1(PANEL[0])}, ${f1(PANEL[1])}); // cm: x across the car, y toward its nose
          float w = max(max(fwidth(p.x), fwidth(p.y)), 1e-4);
          float frame = rect(p, vec2(${f1(PANEL[0] / 2 - 0.45)}, ${f1(PANEL[1] / 2 - 0.45)}), w) - rect(p, vec2(${f1(PANEL[0] / 2 - 0.9)}, ${f1(PANEL[1] / 2 - 0.9)}), w);
          float chip = rect(p - vec2(0.0, 1.5), vec2(1.9), w) - rect(p - vec2(0.0, 1.5), vec2(1.0), w);
          float bars = 0.0;
          float lit = 0.0;
          for (int i = 0; i < 3; i++) {
            float b = rect(p - vec2(float(i - 1) * 2.5, -3.1), vec2(0.95, 0.45), w);
            bars += b;
            lit += b * smoothstep(0.1 + float(i) * 0.26, 0.22 + float(i) * 0.26, uEcu); // it makes up its mind: one, two, three
          }
          float done = smoothstep(0.84, 1.0, uEcu);
          float marks = clamp(frame + chip + bars, 0.0, 1.0);
          gl_FragColor = vec4(uInk * (0.012 + 0.09 * marks) + uVeille * (2.3 * lit + done * (2.3 * (frame + chip) + 0.16)), 1.0);
        }`,
    }),
  );
  unit.add(panel);
  const unitGlow = halo(group, [ex, ey + 2.4, ez], 10, 11, 0.55);
  group.add(unit);
  A.ecu = anchor(group, ex, ey + 1.8, ez);

  // the three wires: two leave by the front connector and part at the dashboard, one by the rear, to the junction box
  const routes = {
    wheel: [[ex - 1.3, ey, ez - 10.2], [ex - 1.3, ey + 0.3, ez - 24], [ex - 1.3, 41, -52], [ex - 1.3, 80, -74], [WHEEL.x + 9, 84, -78], [WHEEL.x, WHEEL.y - 11.8, WHEEL.z - 29.5], [WHEEL.x, WHEEL.y - 0.8, WHEEL.z - 2.2]],
    bag: [[ex + 1.3, ey, ez - 10.2], [ex + 1.3, ey + 0.3, ez - 24], [ex + 1.3, 41, -52], [ex + 1.3, 80, -74], [-WHEEL.x - 11, 88, -78], [-WHEEL.x, 95, -72.5]],
    fuse: [[ex, ey, ez + 10.2], [ex - 8, ey + 0.2, ez + 20], [ex - 8, 40.2, BOX.z0 - 10], [fx - 8, 39.8, BOX.z0 + 2], [fx, PLUG[1], PLUG[2] - 5], PLUG],
  };
  const wires = {};
  for (const [name, route] of Object.entries(routes)) {
    const n = 96;
    const { pts, len } = resample(bent(P3(route), 5, 6, 30), n);
    const mat = wireMaterial(U);
    const mesh = new THREE.Mesh(sweep(pts, 0.3, { radial: 8, onPath: true }), mat);
    mesh.frustumCulled = false;
    group.add(mesh);
    const flat = new Float32Array(n * 3);
    pts.forEach((p, i) => p.toArray(flat, i * 3));
    wires[name] = { mat, len, n, pts: flat, head: halo(group, route[0], 4, 19, 0.6), at: new THREE.Object3D() };
    group.add(wires[name].at);
  }
  A.orderFuse = wires.fuse.at;
  A.orderBag = wires.wheel.at;
  const along = (wire, f, out) => {
    const x = clamp01(f) * (wire.n - 1);
    const i = Math.min(wire.n - 2, Math.floor(x));
    const u = x - i;
    const a = wire.pts;
    out.set(a[i * 3] + (a[i * 3 + 3] - a[i * 3]) * u, a[i * 3 + 1] + (a[i * 3 + 4] - a[i * 3 + 1]) * u, a[i * 3 + 2] + (a[i * 3 + 5] - a[i * 3 + 2]) * u);
  };

  return {
    group,
    A,
    update(p = {}, time = 0, px = 2376) {
      const amount = clamp01(p.pack ?? 1);
      const hv = clamp01(p.hv ?? 1);
      const crush = clamp01(p.crush ?? 0);
      const torn = clamp01(p.cable ?? 0);
      const ecu = clamp01(p.ecu ?? 0);
      const order = clamp01(p.order ?? 0);
      U.time.value = time;

      // the charge: it only follows `pack` — it breathes, it never goes out
      const breath = 0.9 + 0.1 * Math.sin(time * 1.5);
      U.glow.value = amount;
      U.under.value = amount * breath;
      setGlow(bed, 0.45 * breath);
      for (const part of fades) setPartOpacity(part, amount);
      setPartOpacity(cover, clamp01(p.box ?? 1) * amount);

      // the high voltage outside the battery
      U.hv.value = hv * amount;
      sheath.emissiveIntensity = 0.1 * hv;
      dashes.visible = U.hv.value > 0.002;

      // the crash: the drive unit driven back, the cable folded; the pinch
      driveF.position.z = DRIVE.front[2] + BACK * crush;
      U.morph.value = crush;
      U.tear.value = torn;
      setPartOpacity(tole, smooth(ramp(torn, 0, 0.5)) * amount);
      const live = hv * smooth(ramp(torn, 0.6, 1)) * amount;
      U.live.value = live;
      sparks.points.visible = live > 0.004;
      sparks.uniforms.uT.value = time;
      sparks.uniforms.uScale.value = px;
      sparks.uniforms.uAmount.value = live;
      arcGlow.visible = live > 0.004;
      arcGlow.material.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(live * (0.75 + 0.1 * Math.sin(time * 2.3) + 0.06 * Math.sin(time * 3.7 + 1)));

      // the control unit and its order
      panel.material.uniforms.uEcu.value = ecu;
      housing.emissiveIntensity = 0.04 * ecu;
      unitGlow.visible = ecu > 0.004;
      unitGlow.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(0.4 * smooth(ecu));
      const on = smooth(ramp(order, 0, 0.03));
      const arrived = smooth(ramp(order, 0.94, 1));
      for (const name in wires) {
        const wire = wires[name];
        wire.mat.uniforms.uHead.value = order * wire.len;
        wire.mat.uniforms.uOn.value = on;
        wire.mat.uniforms.uMinPx.value = 1.2 + 0.9 * on;
        along(wire, order, wire.at.position);
        wire.head.position.copy(wire.at.position);
        wire.head.visible = on > 0.004;
        wire.head.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(2 * on * (1 - 0.5 * arrived));
      }
    },
  };
}
