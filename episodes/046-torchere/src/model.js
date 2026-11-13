// DOSSIER 046 — Torchère : THE SYSTEM, the flare network, solid — three greys (cast iron dark, machined mid, the hero
// light), fine edges, metal ≤ 0.5, at its places in plan.js (docs/046-decors.md → « src/model.js »).
//
//   buildSystem() → { root, A, parts, update(P, time, px) }
//   root   world coordinates (the origin is the stack's foot): world.js re-parents it, in place, scene ↔ bench
//   parts  valve0 valve1 valve2 header drum seal stack tip — each its own materials (setPartOpacity)
//   A      anchors: valve0..2, manifold, header, drum, liquid, seal, water, foot, stack, tip, pilot
//   P      bench (0 | 1) · explode · section · relief · flow · liquid · bubbles · purge · air ·
//          litValves · litHeader · litDrum · litSeal · litStack — all 0 → 1 (world.js FIRST says what each does)
//
// What it is made of:
//   · three relief valves on their columns' flank: body, bonnet, an open yoke with the spring in it (the hero of the
//     valve, light), the stem and spring washer that LIFT with `relief` (the spring shortens); the outlet line down to
//   · the header: the manifold along z (the three lines come down into it), the rack run, elbows with their flanges,
//     slim supports (on the bench there is no rack)
//   · the knock-out drum on its saddles, nozzles on top, a drain below; in SECTION its front quarter goes: the gas
//     crosses it at mid-height, signal drops fall out of it and lie as a pool at the bottom (`liquid`)
//   · the water seal (the heart, light): the dip pipe going down under the water, the water (dark, a veille line round
//     it), the level glass on its flank, the bubbles rising round the dip pipe (veille: the purge · signal: the gas)
//   · the stack, dark, on its base and skirt, flanged in sections, its platform and railing under the tip, the three
//     pilot lines running up it · the tip (light): barrel, flame ring, wind shield, the three pilot heads (the hero one
//     at PILOT.at) · in SECTION a slot up its height shows the purge rising (a veille thread, slow heads) · `air`:
//     three signal arrows come down at the tip and are pushed back up, the purge puffing out of it
//   · the GAS (`flow`): a sheath of light on the camera's side of every pipe it runs in — a head that advances (a bright
//     core on the surface) and a trail that stays lit behind it, slow pulses running forward; three heads first, down
//     the three valve lines into the manifold (flow 0 → FLOWAT.header), then one along the path (plan.js FLOWAT)
//   · a back-light: an ink halo set BEHIND the stack from wherever the camera is (onBeforeRender, the idea of CR02's
//     derrick) — the stack always reads dark on light; it fades when the stack is not in the line of sight
//   · `explode` (bench): valves up, tip up (the kit), the drum and the seal one step toward the camera (+z)
//   · `lit…`: the part the voice names — its edges turn veille, its body glows faintly veille
// Everything depends on P and `time` only; update() allocates nothing (it runs sixteen times per frame).
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, glass, setGlow, explode, cyl, box, plate, anchor, mergeGeometries } from "@kit/build3d.js";
import { STACK, TIP, PILOT, SEAL, KO, HEADER, VALVES, FLOWAT } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (x) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const H2 = (BRAND.H / 2).toFixed(1);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const UP = new THREE.Vector3(0, 1, 0);

/* ── the greys: three values, and every part makes its own ── */
const GREY = { dark: 0x30363c, mid: 0x5e666e, light: 0xa4abb1 };
const greys = () => ({
  dark: solid(GREY.dark, { rough: 0.6, metal: 0.3 }),
  mid: solid(GREY.mid, { rough: 0.5, metal: 0.35 }),
  light: solid(GREY.light, { rough: 0.42, metal: 0.3 }),
});

/* ── the places ── */
const MX = HEADER.manifold.x; // the manifold's x
const HY = HEADER.y; // the rack's height
const XI = HEADER.path[1][0]; // the drum's inlet nozzle (x)
const XO = HEADER.path[3][0]; // the drum's outlet nozzle (x)
const XY = HEADER.path[4][1]; // the cross-over to the seal (y)
const [KX, KY] = KO.at;
const KTOP = KY + KO.r; // the drum's top
const KMID = KY + 55; // where the gas crosses the drum (over the liquid)
const NZ = KTOP + 48; // where the drum's nozzles meet their pipes (flanges)
const SX = SEAL.at[0];
const SCYL = SEAL.y1 - SEAL.r / 2; // the seal's shell up to here, then its head
const STN = SEAL.y1 + 18; // where the dip pipe's line meets the seal's nozzle (flanges)
const OUTY = 340; // the seal's outlet and the stack's inlet
const STK = { base: 16, skirt: 126, top: 1795, wall: 6 }; // the stack's shell from `skirt` to `top`
const PLAT = 1700; // the platform under the tip
const PR = Math.hypot(PILOT.at[0], PILOT.at[2]); // the pilots' radius round the tip
const PHI0 = Math.atan2(PILOT.at[0], PILOT.at[2]); // the hero pilot's angle
const STRIPE = new THREE.Vector3(-0.45, 0.55, 0.7).normalize(); // where the gas's band of light faces (the bench's camera side)
const STEP = 0; // the drum and the seal, a step toward the camera in the exploded view — 0: VIEW.drum / VIEW.seal serve scene and bench alike
const FULL = 0.85; // a gas stream inside a vessel: lit all round, at half the band's light
const LIFT = 15; // the valves' stem lift, wide open (cm in the valve's frame, a maquette)
const VS = 1.5; // the valves drawn half as large again: three of them must read on a 15 m network

/** The gas path as the eye follows it: plan.js HEADER.path, the drum crossed at mid-height (the section shows it). */
const GAS = [
  [MX, HY, 0], [XI, HY, 0], [XI, KTOP, 0], [XI, KMID, 0], [XO, KMID, 0], [XO, KTOP, 0], [XO, XY, 0], [SX, XY, 0],
  [SX, SEAL.dip, 0], [SX, SEAL.water + 70, 0], [SX + SEAL.r, OUTY, 0], [-STACK.r, OUTY, 0], [0, OUTY, 0], [0, TIP.y1, 0],
].map((p) => new THREE.Vector3(...p));
const CUM = [0];
for (let i = 1; i < GAS.length; i++) CUM.push(CUM[i - 1] + GAS[i].distanceTo(GAS[i - 1]));
/** `flow` at each vertex the voice names (FLOWAT); between two, the head runs at constant speed. */
const KEYS = [[FLOWAT.header, 0], [FLOWAT.drum, 2], [FLOWAT.drumOut, 5], [FLOWAT.seal, 8], [FLOWAT.sealOut, 9], [FLOWAT.stack, 12], [FLOWAT.tip, 13]];
function sOfFlow(f) {
  if (f <= KEYS[0][0]) return 0;
  for (let k = 1; k < KEYS.length; k++) {
    if (f <= KEYS[k][0]) {
      const [fa, ia] = KEYS[k - 1];
      const [fb, ib] = KEYS[k];
      return CUM[ia] + (CUM[ib] - CUM[ia]) * clamp01((f - fa) / Math.max(1e-6, fb - fa));
    }
  }
  return CUM[CUM.length - 1];
}
/** The s of a point lying on the gas path. */
function sOn(p) {
  const v = new THREE.Vector3(...p);
  for (let i = 0; i < GAS.length - 1; i++) {
    const a = GAS[i];
    const b = GAS[i + 1];
    const ab = a.distanceTo(b);
    if (Math.abs(a.distanceTo(v) + v.distanceTo(b) - ab) < 0.5) return CUM[i] + a.distanceTo(v);
  }
  return 0;
}
// where the head sits on each segment: on the pipe's lit side (a pipe), or on the path (inside a vessel)
const ON_PIPE = { 0: 46, 1: 46, 5: 46, 6: 46, 7: 46, 10: 46, 12: STACK.r };
const SURF = GAS.slice(0, -1).map((a, i) => {
  const r = ON_PIPE[i];
  if (!r) return new THREE.Vector3();
  const d = GAS[i + 1].clone().sub(a).normalize();
  return STRIPE.clone().addScaledVector(d, -STRIPE.dot(d)).normalize().multiplyScalar(r + 2);
});

/* ─────────────────────────────────────────── shaders: light that has a place */

/** The gas's sheath: additive, lit on its band (aSide), behind the head (aS < uHead), the head itself brightest. */
function sheathMat() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL.clone() }, uHead: { value: -1e5 }, uOn: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aS; attribute float aSide;
      varying float vS; varying float vSide; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vS = aS; vSide = aSide;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uHead, uOn, uTime;
      varying float vS; varying float vSide; varying vec3 vN; varying vec3 vV;
      void main() {
        float gap = vS - uHead;
        float behind = 1.0 - smoothstep(-10.0, 10.0, gap);
        float pulse = 0.5 + 0.5 * sin(6.2831853 * (vS - uTime * 110.0) / 320.0);
        float trail = behind * (0.2 + 0.16 * pulse + 0.42 * exp(min(gap, 0.0) / 380.0));
        float head = 1.15 * exp(-gap * gap / 3000.0);
        float band = smoothstep(0.74, 0.95, vSide);
        float face = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        float k = uOn * (trail + head) * band * (0.4 + 0.6 * face);
        gl_FragColor = vec4(uColor * min(k, 1.5), 1.0);
      }`,
  });
}

/** A light seen from anywhere: a bright core and a long tail, `uRadius` cm or `uMinPx` pixels if that is more. */
function haloMat(color, radius, minPx) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uAmt: { value: 0 }, uRadius: { value: radius }, uMinPx: { value: minPx } },
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
      uniform vec3 uColor; uniform float uAmt; varying vec3 vN; varying vec3 vV;
      void main() {
        float n = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        gl_FragColor = vec4(uColor * uAmt * (0.75 * pow(n, 12.0) + 0.3 * pow(n, 3.0)), 1.0);
      }`,
  });
}

/** A thread of light (centre line + normal, pushed out by max(aRad, uMinPx px)): the water's line, the purge. */
const THREAD_VS = /* glsl */ `
  attribute float aRad; attribute float aS; uniform float uMinPx;
  varying float vS; varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 c = modelViewMatrix * vec4(position, 1.0);
    float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
    vec4 mv = modelViewMatrix * vec4(position + normal * max(aRad, uMinPx * cmPerPx), 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vS = aS;
    gl_Position = projectionMatrix * mv;
  }`;
function threadMat(fragment, uniforms) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: VEILLE.clone() }, uAmt: { value: 0 }, uMinPx: { value: 2.2 }, uTime: { value: 0 }, ...uniforms },
    vertexShader: THREAD_VS,
    fragmentShader: fragment,
  });
}
/** The thread's geometry: a ring of radius R at height y, or (R = 0) a line up the y axis from y to y + len. */
function threadGeo({ R = 0, y = 0, len = 0, rad = 3, along = 96, round = 8 }) {
  const pos = [];
  const nrm = [];
  const rads = [];
  const ss = [];
  const idx = [];
  for (let i = 0; i <= along; i++) {
    const u = i / along;
    for (let j = 0; j <= round; j++) {
      const v = (j / round) * Math.PI * 2;
      if (R > 0) {
        const a = u * Math.PI * 2;
        const rx = Math.sin(a);
        const rz = Math.cos(a);
        pos.push(R * rx, y, R * rz);
        nrm.push(Math.cos(v) * rx, Math.sin(v), Math.cos(v) * rz);
        ss.push(u);
      } else {
        pos.push(0, y + u * len, 0);
        nrm.push(Math.cos(v), 0, Math.sin(v));
        ss.push(y + u * len);
      }
      rads.push(rad);
    }
  }
  for (let i = 0; i < along; i++) {
    for (let j = 0; j < round; j++) {
      const a = i * (round + 1) + j;
      const b = a + round + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("aRad", new THREE.Float32BufferAttribute(rads, 1));
  g.setAttribute("aS", new THREE.Float32BufferAttribute(ss, 1));
  g.setIndex(idx);
  return g;
}

/** A bubble: bright at its rim, clear in its middle. */
function bubbleMat() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: VEILLE.clone() }, uAmt: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmt; varying vec3 vN; varying vec3 vV;
      void main() {
        float n = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        gl_FragColor = vec4(uColor * uAmt * (0.3 + 1.4 * pow(1.0 - n, 2.0)), 1.0);
      }`,
  });
}

/* ─────────────────────────────────────────── pieces */

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _d = new THREE.Vector3();

/** A straight cylinder from a to b, in a part. */
function tube(part, a, b, r, mat, o = {}) {
  _a.set(...a);
  _b.set(...b);
  const len = _a.distanceTo(_b);
  const m = addMesh(part, cyl(r, len, o.bevel ?? Math.min(2.5, r * 0.12), o.segs ?? 28, o.top ?? r), mat, {
    pos: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], edges: o.edges,
  });
  m.quaternion.setFromUnitVectors(UP, _d.copy(_b).sub(_a).normalize());
  return m;
}
/** A flange (a short wide disc) centred at p, across direction d. */
function flange(part, p, d, r, mat, h = 9) {
  const m = addMesh(part, cyl(r, h, 1.6, 32), mat, { pos: p });
  m.quaternion.setFromUnitVectors(UP, _d.set(...d).normalize());
  return m;
}
/** The quarter-torus basis of a bend at `corner`, coming in along dIn, leaving along dOut. */
function bendMatrix(corner, dIn, dOut, R) {
  const X = dOut.clone().negate();
  const Y = dIn.clone();
  const Z = new THREE.Vector3().crossVectors(X, Y);
  const C = corner.clone().addScaledVector(dIn, -R).addScaledVector(dOut, R);
  return new THREE.Matrix4().makeBasis(X, Y, Z).setPosition(C);
}

/** The gas's sheath along a straight piece (s from s0) or a bend; aSide: how much a point faces the band. */
function sheathStraight(a, b, rs, s0, full) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const dir = B.clone().sub(A).normalize();
  const g = new THREE.CylinderGeometry(rs, rs, len, 28, 1, true);
  const p = g.attributes.position;
  const S = [];
  for (let i = 0; i < p.count; i++) S.push(s0 + p.getY(i) + len / 2);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir));
  g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
  const sp = STRIPE.clone().addScaledVector(dir, -STRIPE.dot(dir)).normalize();
  const n = g.attributes.normal;
  const side = [];
  for (let i = 0; i < n.count; i++) side.push(full ? FULL : n.getX(i) * sp.x + n.getY(i) * sp.y + n.getZ(i) * sp.z);
  g.setAttribute("aS", new THREE.Float32BufferAttribute(S, 1));
  g.setAttribute("aSide", new THREE.Float32BufferAttribute(side, 1));
  return g;
}
function sheathBend(corner, dIn, dOut, R, rs, sCorner, full) {
  const g = new THREE.TorusGeometry(R, rs, 12, 14, Math.PI / 2);
  const p = g.attributes.position;
  const S = [];
  const ang = [];
  for (let i = 0; i < p.count; i++) {
    const a = Math.atan2(p.getY(i), p.getX(i));
    ang.push(a);
    S.push(sCorner - R + (a / (Math.PI / 2)) * 2 * R);
  }
  const M = bendMatrix(corner, dIn, dOut, R);
  g.applyMatrix4(M);
  const basis = new THREE.Matrix3().setFromMatrix4(M);
  const n = g.attributes.normal;
  const side = [];
  const t = new THREE.Vector3();
  const sp = new THREE.Vector3();
  for (let i = 0; i < n.count; i++) {
    t.set(-Math.sin(ang[i]), Math.cos(ang[i]), 0).applyMatrix3(basis).normalize();
    sp.copy(STRIPE).addScaledVector(t, -STRIPE.dot(t)).normalize();
    side.push(full ? FULL : n.getX(i) * sp.x + n.getY(i) * sp.y + n.getZ(i) * sp.z);
  }
  g.setAttribute("aS", new THREE.Float32BufferAttribute(S, 1));
  g.setAttribute("aSide", new THREE.Float32BufferAttribute(side, 1));
  return g;
}

/**
 * A pipe run through right-angled corners: straight pieces, quarter-torus bends (radius R), flanges at the bends and
 * the ends if asked; and, if `sheath` is given, the gas's sheath on it (s from s0 at its first point).
 */
function run(part, pts, r, mat, o = {}) {
  const V = pts.map((p) => new THREE.Vector3(...p));
  const R = o.R ?? r * 1.6;
  const n = V.length;
  const dirs = [];
  for (let i = 0; i < n - 1; i++) dirs.push(V[i + 1].clone().sub(V[i]).normalize());
  let s = o.s0 ?? 0;
  for (let i = 0; i < n - 1; i++) {
    const a = V[i].clone().addScaledVector(dirs[i], i > 0 ? R : 0);
    const b = V[i + 1].clone().addScaledVector(dirs[i], i < n - 2 ? -R : 0);
    const len = V[i].distanceTo(V[i + 1]);
    if (o.pipe !== false) tube(part, a.toArray(), b.toArray(), r, mat);
    if (o.sheath) {
      const m = new THREE.Mesh(sheathStraight(a.toArray(), b.toArray(), o.full ? r : r + 1.6, s + (i > 0 ? R : 0), o.full), o.sheath);
      m.renderOrder = 4;
      part.add(m);
    }
    if (i < n - 2) {
      if (o.pipe !== false) {
        const tg = new THREE.TorusGeometry(R, r, 14, 16, Math.PI / 2).applyMatrix4(bendMatrix(V[i + 1], dirs[i], dirs[i + 1], R));
        addMesh(part, tg, mat, { edges: false });
        if (o.flanges) {
          flange(part, V[i + 1].clone().addScaledVector(dirs[i], -R).toArray(), dirs[i].toArray(), r * 1.3, o.flangeMat ?? mat);
          flange(part, V[i + 1].clone().addScaledVector(dirs[i + 1], R).toArray(), dirs[i + 1].toArray(), r * 1.3, o.flangeMat ?? mat);
        }
      }
      if (o.sheath) {
        const m = new THREE.Mesh(sheathBend(V[i + 1], dirs[i], dirs[i + 1], R, o.full ? r : r + 1.6, s + len, o.full), o.sheath);
        m.renderOrder = 4;
        part.add(m);
      }
    }
    s += len;
  }
  if (o.ends && o.pipe !== false) {
    flange(part, V[0].clone().addScaledVector(dirs[0], 5).toArray(), dirs[0].toArray(), r * 1.3, o.flangeMat ?? mat);
    flange(part, V[n - 1].clone().addScaledVector(dirs[n - 2], -5).toArray(), dirs[n - 2].toArray(), r * 1.3, o.flangeMat ?? mat);
  }
  return s;
}

/**
 * A vessel turned round y from a closed wall profile ([r, y], the wall's cross-section), over [phi0, phi0 + len]:
 * its surfaces, and (capMat) the two cut faces at its ends. A wedge is the same without its cut faces.
 */
function vessel(holder, part, profile, phi0, phiLen, mat, capMat, segs) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
  const loop = [...pts, pts[0].clone()];
  const geo = toCreasedNormals(new THREE.LatheGeometry(loop, segs, phi0, phiLen), 35 * DEG);
  const shell = addMesh(part, geo, mat, { threshold: 30 });
  holder.add(shell);
  if (capMat) {
    capMat.side = THREE.DoubleSide;
    const caps = [phi0, phi0 + phiLen].map((phi) => {
      const g = new THREE.ShapeGeometry(new THREE.Shape(pts));
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const r = p.getX(i);
        p.setXYZ(i, r * Math.sin(phi), p.getY(i), r * Math.cos(phi));
      }
      g.computeVertexNormals();
      return g;
    });
    const capMesh = addMesh(part, mergeGeometries(caps), capMat, { edges: false });
    holder.add(capMesh);
  }
  return shell;
}
/** The outer surface alone over [phi0, phi0 + len]: what a cut wedge becomes in glass. */
function skin(profileOuter, phi0, phiLen, segs) {
  return new THREE.LatheGeometry(profileOuter.map(([r, y]) => new THREE.Vector2(r, y)), segs, phi0, phiLen);
}
/** A quarter ellipse (r, b) from angle a0 to a1 (degrees) above y0: points of a vessel's head. */
function head(r, b, y0, a0, a1, n = 9) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = (a0 + ((a1 - a0) * i) / n) * DEG;
    out.push([Math.max(0, r * Math.cos(t)), y0 + b * Math.sin(t)]);
  }
  return out;
}

/* ─────────────────────────────────────────── the system */

export function buildSystem() {
  const root = new THREE.Group();
  const sheaths = []; // every gas material, to tick its time
  const mainGas = sheathMat();
  sheaths.push(mainGas);
  const wedges = []; // { part, solid: [mats], lines: [mats], glass } — the front quarters that open with `section`

  /* ── the three relief valves ── */
  const valveGas = [];
  const valveLen = [];
  const valvePaths = [];
  const valveMoving = [];
  const valves = VALVES.map((v, i) => {
    const part = makePart(`valve${i}`, { lift: 160, delay: 0.04 * i, span: 0.55 });
    const g = greys();
    const [vx, vy, vz] = v.at;
    const at = (x, y, z = 0) => [x, y, z]; // the valve's own frame (a holder at v.at, scaled VS)
    // the inlet: out of the column's flank, an elbow up into the body's bottom
    run(part, [at(-62, -92), at(0, -92), at(0, -30)], 15, g.mid, { R: 22 });
    flange(part, at(0, -32), [0, 1, 0], 22, g.mid, 7);
    // the body (cast), the outlet nozzle toward +x and its flange
    addMesh(part, cyl(27, 58, 3, 40), g.mid, { pos: at(0, 0) });
    addMesh(part, box(30, 34, 30, 5), g.mid, { pos: at(14, -4) });
    tube(part, at(20, 0), at(31, 0), 18, g.mid);
    flange(part, at(33, 0), [1, 0, 0], 24, g.mid, 7);
    // the bonnet, its flange; the open yoke (two posts across the camera's line), the top plate, the cap
    addMesh(part, cyl(31, 7, 1.5, 40), g.mid, { pos: at(0, 32) });
    addMesh(part, cyl(21, 22, 2, 32, 16), g.dark, { pos: at(0, 46) });
    const across = [Math.cos(55 * DEG), Math.sin(55 * DEG)]; // posts on the line perpendicular to the bench camera (az ≈ −55)
    for (const k of [-1, 1]) addMesh(part, box(7, 62, 7, 1.5), g.dark, { pos: at(k * 18 * across[0], 88, k * 18 * across[1]) });
    addMesh(part, cyl(24, 8, 1.5, 32), g.dark, { pos: at(0, 122) });
    addMesh(part, cyl(19, 5, 1, 32), g.mid, { pos: at(0, 115.5) }); // the upper spring washer (fixed)
    addMesh(part, cyl(11, 18, 2, 24, 8), g.mid, { pos: at(0, 135) });
    const lever = addMesh(part, box(36, 4, 6, 1), g.dark, { pos: at(-14, 146) });
    lever.rotation.z = -12 * DEG;
    // what lifts: the stem, the lower spring washer; the spring (light, the hero of the valve) shortens
    const moving = new THREE.Group();
    moving.position.set(0, 0, 0);
    part.add(moving);
    const stem = addMesh(part, cyl(3.4, 112, 0.6, 16), g.light, { pos: at(0, 88), edges: false });
    const washer = addMesh(part, cyl(17, 4, 1, 32), g.mid, { pos: at(0, 61) });
    moving.add(stem, washer);
    const helix = [];
    for (let k = 0; k <= 160; k++) {
      const t = k / 160;
      const a = t * Math.PI * 2 * 6.5;
      helix.push(new THREE.Vector3(12 * Math.sin(a), t * 50, 12 * Math.cos(a)));
    }
    const springGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 320, 2.6, 8, false);
    const spring = addMesh(part, springGeo, g.light, { pos: at(0, 63), edges: false });
    spring.userData.y0 = spring.position.y;
    valveMoving.push({ moving, spring });
    const holder = new THREE.Group();
    holder.position.set(vx, vy, vz);
    holder.scale.setScalar(VS);
    for (const c of [...part.children]) holder.add(c);
    part.add(holder);
    // the outlet line: along x to the manifold's x, down into the manifold (0 and 2 then along it to the tee)
    const pts = [[vx + 37 * VS, vy, vz], [MX, vy, vz], [MX, HY, vz]];
    const mat = sheathMat();
    sheaths.push(mat);
    valveGas.push(mat);
    const L = run(part, pts, 18, g.mid, { R: 22, sheath: mat, s0: 0 });
    valveLen.push(L + Math.abs(vz));
    valvePaths.push([...pts.map((p) => new THREE.Vector3(...p)), new THREE.Vector3(MX, HY, 0)]);
    return part;
  });

  /* ── the header: the manifold, the rack run, its supports ── */
  const header = makePart("header", { lift: 0 });
  const hg = greys();
  tube(header, [MX, HY, -820], [MX, HY, 820], 40, hg.mid);
  for (const z of [-820, 820]) flange(header, [MX, HY, z], [0, 0, 1], 54, hg.mid, 10);
  // the two outer valves' gas along the manifold, toward the tee
  for (const [i, z] of [[0, VALVES[0].at[2]], [2, VALVES[2].at[2]]]) {
    const m = new THREE.Mesh(sheathStraight([MX, HY, z], [MX, HY, 0], 41.6, valveLen[i] - Math.abs(z), false), valveGas[i]);
    m.renderOrder = 4;
    header.add(m);
  }
  run(header, [GAS[0].toArray(), GAS[1].toArray(), [XI, NZ, 0]], HEADER.r, hg.mid, { R: 74, flanges: true, sheath: mainGas, s0: 0 });
  flange(header, [XI, NZ + 5, 0], [0, 1, 0], 60, hg.mid);
  // supports: under the rack run, under the manifold (on the bench there is no rack)
  for (const [x, z, y] of [[-1600, 0, HY - HEADER.r], [MX, -480, HY - 40], [MX, 480, HY - 40]]) {
    addMesh(header, box(16, y - 6, 16, 2), hg.dark, { pos: [x, (y - 6) / 2 + 6, z] });
    addMesh(header, box(54, 6, 54, 1.5), hg.dark, { pos: [x, 3, z] });
    addMesh(header, box(70, 8, 22, 2), hg.dark, { pos: [x, y - 4, z] });
  }

  /* ── the knock-out drum, lying along x ── */
  const drum = makePart("drum", { lift: 0 });
  const dg = greys();
  const drumHolder = new THREE.Group();
  drumHolder.position.set(KX, KY, 0);
  drumHolder.rotation.z = -Math.PI / 2; // its lathe axis (y) along +x
  drum.add(drumHolder);
  const R = KO.r;
  const HL = KO.len / 2;
  const drumWall = [
    ...head(R, R / 2, -HL, -90, 0), ...head(R, R / 2, HL, 0, 90),
    ...head(R - 7, R / 2 - 7, HL, 90, 0), ...head(R - 7, R / 2 - 7, -HL, 0, -90),
  ];
  const drumOuter = [...head(R, R / 2, -HL, -90, 0), ...head(R, R / 2, HL, 0, 90)];
  // after the turn, a lathe angle φ faces (y, z) = (−sin φ, cos φ): the open quarter faces the camera, a little up
  const DW0 = -82 * DEG;
  const DWL = 130 * DEG;
  vessel(drumHolder, drum, drumWall, DW0 + DWL, Math.PI * 2 - DWL, dg.dark, dg.light, 60);
  const dWedge = { part: drum, mats: [solid(GREY.dark, { rough: 0.6, metal: 0.3 })] };
  const dw = vessel(drumHolder, drum, drumWall, DW0, DWL, dWedge.mats[0], null, 26);
  dWedge.lines = [dw.children[0].material];
  dWedge.glass = new THREE.Mesh(skin(drumOuter, DW0, DWL, 26), glass(BRAND.ink, { base: 0, rim: 0.22, edge: 0.45 }));
  drumHolder.add(dWedge.glass);
  wedges.push(dWedge);
  // nozzles on top, their flanges; the drain below; the saddles
  for (const x of [XI, XO]) {
    tube(drum, [x, KTOP - 20, 0], [x, NZ - 5, 0], HEADER.r, dg.mid);
    flange(drum, [x, NZ - 4, 0], [0, 1, 0], 60, dg.mid);
  }
  run(drum, [[KX - 120, KY - R + 6, 0], [KX - 120, 46, 0], [KX - 40, 46, 0]], 11, dg.mid, { R: 18 });
  flange(drum, [KX - 34, 46, 0], [1, 0, 0], 17, dg.mid, 6);
  for (const x of [KX - HL + 130, KX + HL - 130]) {
    const outline = [[-130, 0], [130, 0], [130, KY - Math.sqrt((R + 1) ** 2 - 130 ** 2)]];
    for (let k = 0; k <= 16; k++) {
      const u = 130 - (260 * k) / 16;
      outline.push([u, KY - Math.sqrt((R + 1) ** 2 - u * u)]);
    }
    const sad = addMesh(drum, plate(outline, 36, { bevel: 2 }), dg.mid, { pos: [x - 18, 0, 0] });
    sad.rotation.y = Math.PI / 2;
    sad.position.set(x - 18, 0, 0);
    addMesh(drum, box(60, 8, 300, 2), dg.dark, { pos: [x, 4, 0] });
  }
  // inside: the gas crossing (its sheath, full round), the drops, the pool
  run(drum, [GAS[2].toArray(), GAS[3].toArray(), GAS[4].toArray(), GAS[5].toArray()], 11, null, {
    pipe: false, sheath: mainGas, s0: CUM[2], full: true, R: 30,
  });
  run(drum, [[XI, NZ, 0], [XI, KTOP - 4, 0]], HEADER.r, null, { pipe: false, sheath: mainGas, s0: sOn([XI, NZ, 0]) });
  run(drum, [[XO, KTOP - 4, 0], [XO, NZ, 0]], HEADER.r, null, { pipe: false, sheath: mainGas, s0: sOn([XO, KTOP, 0]) - 4 });
  const LR = R - 8;
  const LH = KO.level;
  const aH = Math.acos((LR - LH) / LR);
  const seg = [];
  for (let k = 0; k <= 28; k++) {
    const a = -aH + (2 * aH * k) / 28;
    seg.push(new THREE.Vector2(LR * Math.sin(a), LR - LR * Math.cos(a)));
  }
  const poolGeo = new THREE.ExtrudeGeometry(new THREE.Shape(seg), { depth: KO.len, bevelEnabled: false, curveSegments: 4 });
  const poolMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: SIGNAL.clone() }, uH: { value: 1 }, uR: { value: LR } },
    vertexShader: /* glsl */ `
      uniform float uH, uR; varying float vTop;
      void main() {
        float vv = min(position.y, uH);
        float c = sqrt(max(uR * uR - (uR - vv) * (uR - vv), 0.0));
        vec3 p = vec3(clamp(position.x, -c, c), vv, position.z);
        vTop = step(uH - 0.02, vv);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vTop;
      void main() { gl_FragColor = vec4(uColor * mix(0.24, 0.78, vTop), 1.0); }`,
  });
  const pool = new THREE.Mesh(poolGeo, poolMat);
  pool.rotation.y = Math.PI / 2; // its extrusion (z) along +x
  pool.position.set(KX - HL, KY - LR, 0);
  drum.add(pool);
  const dropMat = glow(BRAND.signal, 1.5);
  const dropGeo = new THREE.SphereGeometry(6, 10, 8);
  const drops = [];
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(dropGeo, dropMat);
    m.scale.set(1, 2.4, 1);
    drops.push(m);
    drum.add(m);
  }

  /* ── the water seal: the heart ── */
  const seal = makePart("seal", { lift: 0 });
  const sg = greys();
  const sealHolder = new THREE.Group();
  sealHolder.position.set(SX, 0, SEAL.at[1]);
  seal.add(sealHolder);
  const SR = SEAL.r;
  const sealWall = [
    [0, 10], [SR, 10], ...head(SR, SR / 2, SCYL, 0, 90),
    ...head(SR - 6, SR / 2 - 6, SCYL, 90, 0), [SR - 6, 16], [0, 16],
  ];
  const sealOuter = [[SR, 10], ...head(SR, SR / 2, SCYL, 0, 90)];
  const SW0 = -99 * DEG; // the open quarter faces az ≈ −34 (VIEW.seal)
  const SWL = 130 * DEG;
  vessel(sealHolder, seal, sealWall, SW0 + SWL, Math.PI * 2 - SWL, sg.light, sg.light, 60);
  const sWedge = { part: seal, mats: [solid(GREY.light, { rough: 0.42, metal: 0.3 })] };
  const sw = vessel(sealHolder, seal, sealWall, SW0, SWL, sWedge.mats[0], null, 26);
  sWedge.lines = [sw.children[0].material];
  sWedge.glass = new THREE.Mesh(skin(sealOuter, SW0, SWL, 26), glass(BRAND.ink, { base: 0, rim: 0.22, edge: 0.45 }));
  sealHolder.add(sWedge.glass);
  wedges.push(sWedge);
  // its manway, on the open quarter: it goes with it
  {
    const phi = -52 * DEG;
    const dir = [Math.sin(phi), 0, Math.cos(phi)];
    const at = (r, y) => [SX + r * dir[0], y, r * dir[2]];
    for (const [m, r, h, rr] of [[tube, 0, 0, 0], [flange, SR + 26, 10, 44], [flange, SR + 34, 7, 40]]) {
      const mesh = m === tube ? tube(seal, at(SR - 10, 130), at(SR + 22, 130), 32, sWedge.mats[0]) : flange(seal, at(r, 130), dir, rr, sWedge.mats[0], h);
      sWedge.lines.push(mesh.children[0].material);
    }
    const hinge = addMesh(seal, box(10, 26, 10, 2), sWedge.mats[0], { pos: at(SR + 34, 172) });
    sWedge.lines.push(hinge.children[0].material);
  }
  addMesh(seal, cyl(SR + 14, 10, 2, 60), sg.dark, { pos: [SX, 5, 0] }); // its base ring
  // the water: dark, still; in the open quarter only a veil of it; its line, veille, all round
  const waterMat = solid(0x181c1f, { rough: 0.32, metal: 0, env: 0.6 });
  waterMat.userData.finish = false;
  vessel(sealHolder, seal, [[0, 16], [SR - 6.5, 16], [SR - 6.5, SEAL.water], [0, SEAL.water]], SW0 + SWL, Math.PI * 2 - SWL, waterMat, waterMat, 60);
  const veilMat = glow(BRAND.veille, 0.07, { additive: true, double: true });
  const veil = new THREE.Mesh(new THREE.LatheGeometry([[0, 16], [SR - 7, 16], [SR - 7, SEAL.water], [0, SEAL.water]].map(([r, y]) => new THREE.Vector2(r, y)), 26, SW0, SWL), veilMat);
  sealHolder.add(veil);
  const lineMat = threadMat(/* glsl */ `
    uniform vec3 uColor; uniform float uAmt; varying float vS; varying vec3 vN; varying vec3 vV;
    void main() {
      float n = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
      gl_FragColor = vec4(uColor * uAmt * (0.35 + 0.9 * n), 1.0);
    }`);
  const waterLine = new THREE.Mesh(threadGeo({ R: SR - 7, y: SEAL.water, rad: 2.2, along: 120, round: 6 }), lineMat);
  waterLine.position.set(SX, 0, 0);
  seal.add(waterLine);
  // the dip pipe: its line from the drum's outlet, over, down through the seal's head, under the water
  run(seal, [[XO, NZ, 0], [XO, XY, 0], [SX, XY, 0], [SX, STN, 0]], HEADER.r, sg.mid, {
    R: 50, flanges: true, ends: true, sheath: mainGas, s0: sOn([XO, NZ, 0]), flangeMat: sg.mid,
  });
  addMesh(seal, cyl(62, 10, 2, 40), sg.mid, { pos: [SX, SEAL.y1 + 7, 0] }); // the seal's top nozzle flange
  run(seal, [[SX, STN, 0], [SX, SEAL.dip, 0]], HEADER.r, sg.dark, { sheath: mainGas, s0: sOn([SX, STN, 0]) });
  addMesh(seal, cyl(HEADER.r + 6, 10, 2, 40), sg.dark, { pos: [SX, SEAL.dip + 5, 0] }); // its lip
  // the outlet, above the water, toward the stack
  run(seal, [[SX + SR - 6, OUTY, 0], [-126, OUTY, 0]], HEADER.r, sg.mid, { sheath: mainGas, s0: sOn([SX + SR, OUTY, 0]) - 6 });
  flange(seal, [-130, OUTY, 0], [1, 0, 0], 60, sg.mid, 8);
  // the level glass on its flank, the camera's side: veille up to the water
  const gPhi = 45 * DEG; // just past the open quarter: on the silhouette's edge, in front of nothing
  const gx = SX + (SR + 22) * Math.sin(gPhi);
  const gz = (SR + 22) * Math.cos(gPhi);
  for (const y of [110, 330]) tube(seal, [SX + (SR - 4) * Math.sin(gPhi), y, (SR - 4) * Math.cos(gPhi)], [gx, y, gz], 5, sg.mid);
  addMesh(seal, cyl(8, 236, 1.5, 20), sg.mid, { pos: [gx, 220, gz] });
  const gaugeMat = glow(BRAND.veille, 1.1);
  addMesh(seal, cyl(5.2, SEAL.water - 104, 0.5, 16), gaugeMat, { pos: [gx, (SEAL.water + 104) / 2, gz], edges: false });
  addMesh(seal, box(14, 14, 14, 3), sg.mid, { pos: [gx, 102, gz] });
  addMesh(seal, box(14, 14, 14, 3), sg.mid, { pos: [gx, 338, gz] });
  // the bubbles, round the dip pipe, on the open side
  const bubMat = bubbleMat();
  const bubGeo = new THREE.SphereGeometry(1, 16, 12);
  const bubbles = [];
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(bubGeo, bubMat);
    bubbles.push(m);
    seal.add(m);
  }

  /* ── the stack ── */
  const stack = makePart("stack", { lift: 0 });
  const kg = greys();
  const stackHolder = new THREE.Group();
  stack.add(stackHolder);
  const R0 = STACK.r;
  const stackWall = [[R0, STK.skirt], [R0, STK.top], [R0 - STK.wall, STK.top], [R0 - STK.wall, STK.skirt]];
  const KW0 = -65 * DEG; // the slot faces az ≈ −40 (VIEW.stack)
  const KWL = 50 * DEG;
  vessel(stackHolder, stack, stackWall, KW0 + KWL, Math.PI * 2 - KWL, kg.dark, kg.light, 64);
  const kWedge = { part: stack, mats: [solid(GREY.dark, { rough: 0.6, metal: 0.3 })] };
  const kw = vessel(stackHolder, stack, stackWall, KW0, KWL, kWedge.mats[0], null, 12);
  kWedge.lines = [kw.children[0].material];
  kWedge.glass = new THREE.Mesh(skin([[R0, STK.skirt], [R0, STK.top]], KW0, KWL, 12), glass(BRAND.ink, { base: 0, rim: 0.2, edge: 0.4 }));
  stackHolder.add(kWedge.glass);
  wedges.push(kWedge);
  addMesh(stack, cyl(118, STK.base, 2.5, 64), kg.mid, { pos: [0, STK.base / 2, 0] });
  addMesh(stack, cyl(112, STK.skirt - STK.base, 3, 64, R0 + 1), kg.dark, { pos: [0, (STK.skirt + STK.base) / 2, 0] });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    addMesh(stack, cyl(4.5, 12, 1, 12), kg.light, { pos: [102 * Math.sin(a), STK.base + 6, 102 * Math.cos(a)], edges: false });
  }
  for (const y of [546, 966, 1386, STK.top - 4]) addMesh(stack, cyl(R0 + 8, 10, 2, 64), kg.mid, { pos: [0, y, 0] });
  // the platform under the tip, its brackets and railing
  const ring = new THREE.Shape();
  ring.absarc(0, 0, 172, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, R0 + 1, 0, Math.PI * 2, true);
  ring.holes.push(hole);
  const deck = addMesh(stack, plate(ring, 8, { bevel: 1.5, curveSegments: 48 }), kg.mid, { pos: [0, PLAT, 0] });
  deck.rotation.x = -Math.PI / 2;
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const br = addMesh(stack, plate([[0, 0], [92, 0], [0, -64]], 6, { bevel: 1 }), kg.dark);
    br.position.set(R0 * Math.sin(a) - 3 * Math.cos(a), PLAT, R0 * Math.cos(a) + 3 * Math.sin(a));
    br.rotation.y = a - Math.PI / 2; // its x along the radius, under the deck
  }
  const rail = addMesh(stack, new THREE.TorusGeometry(166, 2.8, 8, 96), kg.mid, { pos: [0, PLAT + 100, 0], edges: false });
  rail.rotation.x = Math.PI / 2;
  const rail2 = addMesh(stack, new THREE.TorusGeometry(166, 2.2, 8, 96), kg.mid, { pos: [0, PLAT + 52, 0], edges: false });
  rail2.rotation.x = Math.PI / 2;
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    addMesh(stack, box(4.5, 100, 4.5, 1), kg.mid, { pos: [166 * Math.sin(a), PLAT + 54, 166 * Math.cos(a)], edges: false });
  }
  // the inlet nozzle at its foot, from the seal
  tube(stack, [-R0 + 4, OUTY, 0], [-118, OUTY, 0], HEADER.r, kg.mid);
  flange(stack, [-118, OUTY, 0], [1, 0, 0], 60, kg.mid, 8);
  run(stack, [[-126, OUTY, 0], [-R0, OUTY, 0]], HEADER.r, null, { pipe: false, sheath: mainGas, s0: sOn([-126, OUTY, 0]) });
  // the gas up its flank
  run(stack, [[0, OUTY, 0], [0, STK.top, 0]], R0, null, { pipe: false, sheath: mainGas, s0: CUM[12] });
  // the pilot lines up the stack (the tip carries their last metres)
  const pilotPhi = [PHI0, PHI0 + (120 * DEG), PHI0 - (120 * DEG)];
  for (const a of pilotPhi) {
    const s = Math.sin(a);
    const c = Math.cos(a);
    tube(stack, [(R0 + 13) * s, 30, (R0 + 13) * c], [(R0 + 13) * s, PLAT - 2, (R0 + 13) * c], 4.5, kg.mid);
    addMesh(stack, box(10, 10, 10, 2), kg.mid, { pos: [(R0 + 13) * s, 26, (R0 + 13) * c] });
  }
  // the purge: a thread of veille rising in it, slow heads; out of the tip when the air comes
  const purgeMat = threadMat(/* glsl */ `
    uniform vec3 uColor; uniform float uAmt, uTime, uExit, uTop; varying float vS; varying vec3 vN; varying vec3 vV;
    void main() {
      float n = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
      float q = fract((vS - uTime * 34.0) / 230.0) - 0.5;
      float heads = exp(-q * q * 230.0 * 230.0 / 1800.0);
      float out_ = 1.0 - step(uTop, vS) * (1.0 - uExit * clamp(1.0 - (vS - uTop) / 230.0, 0.0, 1.0));
      gl_FragColor = vec4(uColor * uAmt * out_ * (0.3 + 1.0 * heads) * (0.4 + 0.6 * n), 1.0);
    }`, { uExit: { value: 0 }, uTop: { value: TIP.y1 } });
  const purge = new THREE.Mesh(threadGeo({ y: OUTY, len: TIP.y1 + 230 - OUTY, rad: 6, along: 80, round: 10 }), purgeMat);
  purge.renderOrder = 4;
  stack.add(purge);

  /* ── the tip: the hero of the scene, light ── */
  const tip = makePart("tip", { lift: 140, delay: 0.25, span: 0.55 });
  const tg = greys();
  addMesh(tip, cyl(R0 + 6, 8, 1.5, 64), tg.mid, { pos: [0, STK.top + 6, 0] });
  addMesh(tip, cyl(R0 + 2, 26, 2, 64, 77), tg.light, { pos: [0, STK.top + 23, 0] });
  addMesh(tip, cyl(77, TIP.y1 - STK.top - 36, 2, 64), tg.light, { pos: [0, (TIP.y1 + STK.top + 36) / 2, 0] });
  addMesh(tip, cyl(82, 7, 1.5, 64), tg.light, { pos: [0, TIP.y1 - 3, 0] }); // the flame ring
  const shield = [[TIP.r - 4, TIP.y1 - 78], [TIP.r, TIP.y1 - 78], [TIP.r, TIP.y1 + 8], [TIP.r - 4, TIP.y1 + 8]];
  const shieldHolder = new THREE.Group();
  tip.add(shieldHolder);
  vessel(shieldHolder, tip, shield, 0, Math.PI * 2, tg.light, null, 72);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    const rib = addMesh(tip, box(12, 54, 4, 1), tg.mid, { pos: [83 * Math.sin(a), TIP.y1 - 40, 83 * Math.cos(a)] });
    rib.rotation.y = a + Math.PI / 2;
  }
  for (const a of pilotPhi) {
    const s = Math.sin(a);
    const c = Math.cos(a);
    tube(tip, [(R0 + 13) * s, PLAT - 2, (R0 + 13) * c], [PR * s, PLAT + 70, PR * c], 4.5, tg.mid);
    tube(tip, [PR * s, PLAT + 70, PR * c], [PR * s, PILOT.at[1] - 32, PR * c], 5.5, tg.mid);
    addMesh(tip, cyl(11, 24, 2, 24), tg.light, { pos: [PR * s, PILOT.at[1] - 20, PR * c] });
    addMesh(tip, cyl(9, 8, 1.5, 24, 6.5), tg.mid, { pos: [PR * s, PILOT.at[1] - 4, PR * c] });
  }
  run(tip, [[0, STK.top + 8, 0], [0, TIP.y1 - 6, 0]], 77, null, { pipe: false, sheath: mainGas, s0: CUM[12] + STK.top + 8 - OUTY });
  // the air: three arrows trying to come down into the tip, flat to the bench camera (az −40)
  const arrowShape = [[-7, 0], [-7, 62], [-21, 62], [0, 100], [21, 62], [7, 62], [7, 0]];
  const arrowGeo = plate(arrowShape, 6, { bevel: 1 }).translate(0, -100, -3).rotateZ(Math.PI); // its point at y 0, pointing DOWN, the shaft above
  const arrowMats = [];
  const arrows = [];
  for (let i = 0; i < 3; i++) {
    const mat = glow(BRAND.signal, 0, { additive: true, double: true });
    arrowMats.push(mat);
    const m = new THREE.Mesh(arrowGeo, mat);
    m.rotation.y = -40 * DEG;
    arrows.push(m);
    tip.add(m);
  }
  const across = new THREE.Vector3(Math.cos(-40 * DEG), 0, -Math.sin(-40 * DEG)); // the screen's right at az −40

  /* ── the gas heads (signal): one on the path, three down the valve lines ── */
  const headMat = haloMat(BRAND.signal, 34, 8);
  const headBall = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), headMat);
  headBall.renderOrder = 5;
  root.add(headBall);
  const vHeads = valves.map(() => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), haloMat(BRAND.signal, 26, 7));
    m.renderOrder = 5;
    root.add(m);
    return m;
  });

  /* ── the back-light: an ink halo set behind the stack from wherever the camera is ── */
  const backMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uAmt: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy * 2.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmt; varying vec2 vP;
      void main() {
        float r2 = dot(vP, vP);
        float k = 0.62 * exp(-r2 * 4.2) + 0.38 * exp(-r2 * 13.0);
        gl_FragColor = vec4(uColor * uAmt * k, 1.0);
      }`,
  });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), backMat);
  back.frustumCulled = false; // placed in onBeforeRender
  back.renderOrder = -1;
  root.add(back);
  const camP = new THREE.Vector3();
  const fwd = new THREE.Vector3();
  const base = new THREE.Vector3();
  const near = new THREE.Vector3();
  const hdir = new THREE.Vector3();
  const bx = new THREE.Vector3();
  const bz = new THREE.Vector3();
  const bsc = new THREE.Vector3();
  let backAmt = 0;
  back.onBeforeRender = (renderer, scene, camera) => {
    camP.setFromMatrixPosition(camera.matrixWorld);
    fwd.set(0, 0, -1).transformDirection(camera.matrixWorld);
    base.setFromMatrixPosition(stack.matrixWorld);
    const dx = camP.x - base.x;
    const dz = camP.z - base.z;
    const hf = fwd.x * fwd.x + fwd.z * fwd.z;
    const t = hf > 1e-4 ? -(dx * fwd.x + dz * fwd.z) / hf : 0;
    const y = Math.min(1750, Math.max(260, camP.y + t * fwd.y - base.y));
    near.set(base.x, base.y + y, base.z);
    hdir.copy(near).sub(camP);
    const dist = Math.max(1, hdir.length());
    const cosA = hdir.dot(fwd) / dist;
    backMat.uniforms.uAmt.value = backAmt * smooth((cosA - 0.93) / 0.06) * (1 - 0.85 * smooth((camP.distanceTo(base) - 3500) / 3500)); // only while the stack is near the line of sight, softer far away
    hdir.y = 0;
    if (hdir.lengthSq() < 1e-4) hdir.set(0, 0, 1);
    hdir.normalize();
    bx.set(hdir.z, 0, -hdir.x);
    const w = 300 + 0.2 * dist;
    near.addScaledVector(hdir, 200 + 0.22 * dist);
    back.matrixWorld.makeBasis(bx, UP, hdir).scale(bsc.set(w, w * 2.6, 1)).setPosition(near);
  };

  root.add(...valves, header, drum, seal, stack, tip);
  const parts = { valve0: valves[0], valve1: valves[1], valve2: valves[2], header, drum, seal, stack, tip };
  const list = Object.values(parts);

  /* ── what lights when the voice names it: edges turn veille, the body glows faintly ── */
  const litOf = (ps) => {
    const solids = [];
    const lines = [];
    for (const p of ps) {
      for (const m of p.userData.part.mats) {
        if (m.isMeshStandardMaterial) solids.push(m);
        else if (m.isLineMaterial) {
          m.userData.c0 = m.color.clone();
          lines.push(m);
        }
      }
    }
    return { solids, lines };
  };
  const LIT = {
    litValves: litOf(valves), litHeader: litOf([header]), litDrum: litOf([drum]), litSeal: litOf([seal]), litStack: litOf([stack, tip]),
  };
  const LITKEYS = Object.keys(LIT);
  const LINE_VEILLE = VEILLE.clone().multiplyScalar(1.4);
  for (const w of wedges) {
    for (const m of w.mats) { m.transparent = true; m.userData.transparent = true; }
    for (const m of w.lines) m.userData.lineBase = m.userData.base;
  }

  const A = {
    valve0: anchor(valves[0], ...VALVES[0].at), valve1: anchor(valves[1], ...VALVES[1].at), valve2: anchor(valves[2], ...VALVES[2].at),
    manifold: anchor(header, MX, HY, 0), header: anchor(header, (MX + XI) / 2, HY, 0),
    drum: anchor(drum, KX, KY, 0), liquid: anchor(drum, KX, KY - KO.r + KO.level, 0),
    seal: anchor(seal, SX, SEAL.y1, SEAL.at[1]), water: anchor(seal, SX, SEAL.water, SEAL.at[1]),
    foot: anchor(stack, 0, OUTY, 0), stack: anchor(stack, 0, 1100, 0), tip: anchor(tip, 0, TIP.y1, 0), pilot: anchor(tip, ...PILOT.at),
  };

  const hp = new THREE.Vector3();
  const segOf = (s) => {
    let i = 0;
    while (i < CUM.length - 2 && CUM[i + 1] < s) i++;
    return i;
  };

  return {
    root, A, parts,
    update(p, time) {
      /* the exploded view: valves and tip up (the kit), the drum and the seal one step toward the camera */
      const ex = p.bench ? clamp01(p.explode) : 0;
      explode(list, ex);
      const step = STEP * smooth((ex - 0.12) / 0.6);
      drum.position.z = step;
      seal.position.z = step;

      /* the section: the front quarters go, solid → glass */
      const sec = smooth(p.section);
      for (const w of wedges) {
        const po = w.part.userData.part.opacity;
        const a = (1 - sec) * po;
        for (const m of w.mats) {
          m.opacity = m.userData.base * a;
          m.depthWrite = a > 0.55;
        }
        for (const m of w.lines) m.opacity = m.userData.lineBase * (1 - 0.6 * sec) * po;
        w.glass.material.uniforms.uAmount.value = sec * po;
        w.glass.visible = sec > 0.01;
        w.mats[0].visible = a > 0.004;
      }
      veil.visible = sec > 0.01;
      setGlow(veilMat, 0.03 * sec);

      /* the valves: the stem and the lower washer lift, the spring shortens */
      const lift = LIFT * smooth(p.relief);
      for (const v of valveMoving) {
        v.moving.position.y = lift;
        v.spring.position.y = v.spring.userData.y0 + lift;
        v.spring.scale.y = (50 - lift) / 50;
      }

      /* the gas: three heads down the valve lines (flow 0 → header), then one along the path */
      const f = clamp01(p.flow);
      const on = smooth(f / 0.004);
      const fv = clamp01(f / Math.max(1e-6, FLOWAT.header));
      for (let i = 0; i < 3; i++) {
        const m = valveGas[i];
        m.uniforms.uTime.value = time;
        m.uniforms.uHead.value = fv * valveLen[i];
        m.uniforms.uOn.value = on;
        // the head on the valve's own path
        const pts = valvePaths[i];
        let s = fv * valveLen[i];
        let k = 0;
        while (k < pts.length - 2 && s > pts[k].distanceTo(pts[k + 1])) { s -= pts[k].distanceTo(pts[k + 1]); k++; }
        const segLen = Math.max(1e-6, pts[k].distanceTo(pts[k + 1]));
        vHeads[i].position.lerpVectors(pts[k], pts[k + 1], clamp01(s / segLen));
        vHeads[i].position.addScaledVector(STRIPE, 20);
        vHeads[i].position.y += valves[i].position.y;
        vHeads[i].material.uniforms.uAmt.value = on * (1 - smooth((fv - 0.85) / 0.15)) * 1.4;
        vHeads[i].visible = vHeads[i].material.uniforms.uAmt.value > 0.01;
      }
      const sHead = f > FLOWAT.header ? sOfFlow(f) : -1e5;
      mainGas.uniforms.uTime.value = time;
      mainGas.uniforms.uHead.value = sHead;
      mainGas.uniforms.uOn.value = smooth((f - FLOWAT.header) / 0.01);
      if (f > FLOWAT.header) {
        const i = segOf(sHead);
        hp.copy(GAS[i]).lerp(GAS[i + 1], clamp01((sHead - CUM[i]) / Math.max(1e-6, CUM[i + 1] - CUM[i]))).add(SURF[i]);
        if (i >= 2 && i <= 10) hp.z += step;
        if (i === 12 && hp.y > STK.top) hp.y += tip.position.y;
        headBall.position.copy(hp);
        headMat.uniforms.uAmt.value = 1.5 * (1 - smooth((f - 0.97) / 0.03));
      } else headMat.uniforms.uAmt.value = 0;
      headBall.visible = headMat.uniforms.uAmt.value > 0.01;

      /* the drum: the pool rises, drops fall out of the gas while it fills */
      const liq = clamp01(p.liquid);
      poolMat.uniforms.uH.value = Math.max(0.6, KO.level * liq);
      pool.visible = liq > 0.004;
      const dropsOn = liq > 0.01 && liq < 0.995;
      const yPool = KY - LR + KO.level * liq;
      for (let i = 0; i < drops.length; i++) {
        const m = drops[i];
        m.visible = dropsOn;
        if (!dropsOn) continue;
        const u = (time * 0.85 + i * 0.618) % 1;
        const y0 = KMID - 22;
        m.position.set(XI + 70 + (XO - XI - 140) * ((i * 0.41 + 0.13) % 1), y0 - (y0 - yPool) * u * u, 30 + ((i * 0.29) % 1) * 90);
        m.scale.set(1, 1.6 + 2.2 * u, 1);
      }
      setGlow(dropMat, 1.5);

      /* the seal: bubbles round the dip pipe — veille (the purge) or signal (the gas through, faster, bigger) */
      const gasIn = f >= FLOWAT.seal - 0.004 ? 1 : 0;
      const bAmt = Math.max(clamp01(p.bubbles), gasIn);
      bubMat.uniforms.uColor.value.copy(gasIn ? SIGNAL : VEILLE);
      bubMat.uniforms.uAmt.value = 1.25 * bAmt;
      const rise = SEAL.water - SEAL.dip - 4;
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        const active = bAmt > 0.01 && (gasIn || i % 2 === 0);
        b.visible = active;
        if (!active) continue;
        const u = (time * (gasIn ? 1.15 : 0.42) + i * 0.618) % 1;
        const phi = -34 * DEG + (((i * 0.37) % 1) - 0.5) * 2.3 + 0.12 * Math.sin(time * 2.1 + i);
        const rad = HEADER.r + 16 + 48 * ((i * 0.53) % 1) + 5 * Math.sin(time * 4.3 + i * 1.7);
        b.position.set(SX + rad * Math.sin(phi), SEAL.dip + 2 + u * rise, rad * Math.cos(phi));
        const size = (gasIn ? 9 + 7 * ((i * 0.71) % 1) : 6) * (0.65 + 0.5 * u) * smooth(u / 0.08) * (1 - smooth((u - 0.9) / 0.1));
        b.scale.setScalar(Math.max(0.01, size));
      }
      lineMat.uniforms.uAmt.value = 1.3;
      setGlow(gaugeMat, 1.1);

      /* the purge up the stack, out of the tip when the air comes */
      purgeMat.uniforms.uTime.value = time;
      purgeMat.uniforms.uAmt.value = 0.85 * clamp01(p.purge);
      purgeMat.uniforms.uExit.value = clamp01(p.air);
      purge.visible = p.purge > 0.01;

      /* the air: three arrows come down at the tip, slow, and are pushed back up */
      const air = clamp01(p.air);
      for (let i = 0; i < 3; i++) {
        const u = (time * 0.42 + i / 3) % 1;
        const down = u < 0.55 ? 1 - (1 - u / 0.55) ** 2 : 1 - smooth((u - 0.55) / 0.45);
        const y = TIP.y1 + 300 - 220 * down;
        const off = (i - 1) * 80;
        arrows[i].position.set(across.x * off, y + 20 * Math.abs(i - 1), across.z * off);
        const fade = smooth(u / 0.12) * (1 - smooth((u - 0.82) / 0.18));
        setGlow(arrowMats[i], 1.15 * air * fade);
        arrows[i].visible = air * fade > 0.01;
      }

      /* the part the voice names */
      for (let k = 0; k < LITKEYS.length; k++) {
        const key = LITKEYS[k];
        const v = smooth(p[key] ?? 0);
        const L = LIT[key];
        for (const m of L.solids) m.emissive.copy(VEILLE).multiplyScalar(0.07 * v);
        for (const m of L.lines) m.color.copy(m.userData.c0).lerp(LINE_VEILLE, 0.85 * v);
      }

      /* the back-light: full in the scene, softer on the bench */
      backAmt = p.bench ? 0.22 : 0.85;
    },
  };
}
