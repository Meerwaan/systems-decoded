// CR01 — canal.js : ONE slice of the core, magnified — the physics of the film (plan.js SLICE, FUEL, CHANNEL, ROD, SLAB_CANAL, DRIVE).
// A clay maquette cut open by the plane x = 0 (the −x half removed, the cut faces toward the key light):
//   · three graphite columns along z, stacked blocks with their joints, between a low plate and a top plate
//   · two FUEL channels (z ±44): the tube, a stack of pellets (their light IS the power: pLow at the bottom, pHigh at the top),
//     the water ring around them — the lightest clay — that turns into vapour from the top down (`steam`: dark ring, rising bubbles)
//   · the ROD channel (z 0): from the top, the absorber (darkest), a water column, the graphite DISPLACER (the part in fault, red),
//     the bottom water column. `rod` brings it all down; at ROD.expel the displacer's foot reaches the bottom: the water there is
//     pushed out through the bore of the low plate, and the neutrons it swallowed now pass.
//   · the NEUTRONS (`flux`): short trails of light born in the fuel (as many as the power at their height), that fly along the cut
//     face into the neighbouring columns. In water a share is swallowed (the trail collapses into a small dark puff), fewer in
//     vapour; in the absorber all of them; in the xenon (dark grains in the fuel) too; through graphite they pass, slowed.
//   · the LOUPE (`split` 0 → 1): five big clay nuclei over the left fuel; a neutron breaks the first, three fly off, break two more…
//   · `solo`: everything but the rod and its water sinks under the table · `newRod`: the displacer grows down to the foot (no more
//     water under the graphite) · `rep`: graphite and rod sink, the left fuel rod stays alone in a block of water (a French PWR).
// Everything is a function of S and time only (seeded hashes, no Math.random, no clock); update() allocates nothing.
//   buildCanal() → { group, A, haloR, update(S, time, px) }
//   A: focus, fault (the displacer's foot), rod (the absorber's tip), displacer (its centre), waterLow (the bottom water column),
//      fuel (the left fuel channel, mid-height), atoms (the loupe of `split`), top (top of the core zone), bottom (its bottom)
//   reads S: rod steam pLow pHigh flux split xenon fault newRod solo rep depuis
import * as THREE from "three";
import { clay, clayEdges, alarm, setAlarm, heal, safe, RECON } from "@kit/reconstitution.js";
import { SLICE, FUEL, CHANNEL, ROD, SLAB_CANAL, DRIVE } from "./plan.js";

const X = SLICE.depth / 2; // what stays of the slice: x 0 … 22
const HW = SLICE.column / 2 - 0.5; // half a column (a 1 cm joint between two)
const Y0 = SLICE.y0;
const Y1 = SLICE.y1;
const ZE = FUEL[1] + SLICE.column / 2 - 0.5; // the slice's outer faces (±65.5)
const R_TUBE = CHANNEL.r; // a channel's tube, outside
const R_TUBE_IN = 10.5; // a fuel tube, inside: the water ring runs from the cladding to here
const R_CLAD = 5.6;
const R_PELLET = 5.0;
const R_BORE = ROD.r + 0.6; // the rod channel's sleeve, inside (its water fills it)
const PELLETS = 24;
const PELLET_H = (Y1 - Y0) / PELLETS;
const BLOCKS = 6;
const NX = -1.5; // the plane the neutrons fly in, just in front of the cut
const CLIP = 1; // nothing of the rod is drawn under this (the table)

// the neutrons: speed in fuel and water, then slowed in graphite (cm/s), the length of their trail (s)
const V_FAST = 64;
const V_SLOW = 27;
const TAU = 0.22;
const N_NEU = 220;
const PUFF = 0.7; // how long a swallowed neutron's dark puff lasts

// THREE VALUES of grey, wider than clay()`s own range (under the hard key its tones all land mid-grey): graphite mid, water light,
// absorber and vapour near black. Still clay: matte, no metal.
const G = { graphite: 0x625f5b, plate: 0x3d3c3a, tube: 0x363533, water: 0xe2ded5, vapour: 0x191817, absorber: 0x1d1c1b, pellet: 0xa9a59d };
const tinted = (hex, o) => {
  const m = clay(o);
  m.color.setHex(hex);
  return m;
};
const sm = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const cl01 = (x) => Math.min(1, Math.max(0, x));
const powerAt = (lo, hi, y) => lo + (hi - lo) * sm(92, 148, y); // the low half, the high half
const vapAt = (front, y) => sm(front - 22, front + 22, y); // the share of vapour at y
/** How far a neutron born `a` seconds ago has flown: fast to the tube (t1 = sTube / V_FAST), slowed beyond. */
const along = (a, t1, sTube) => (a <= t1 ? V_FAST * a : sTube + V_SLOW * (a - t1));
/** A seeded hash of two integers → [0, 1). */
function hash(a, b) {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b + 0x632be5ab) | 0, 0xc2b2ae35);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/* ── shapes in the cut: drawn in (x, z), extruded along y. Shape coordinates are (x, −z) (rotateX(−π/2) maps them back). ── */
function slabShape(z0, z1, grooves, depth = X) {
  const s = new THREE.Shape();
  s.moveTo(0, -z0);
  s.lineTo(depth, -z0);
  s.lineTo(depth, -z1);
  s.lineTo(0, -z1);
  for (const [zc, r] of [...grooves].sort((a, b) => b[0] - a[0])) {
    s.lineTo(0, -zc - r);
    s.absarc(0, -zc, r, -Math.PI / 2, Math.PI / 2, false);
  }
  s.closePath();
  return s;
}
function halfDisk(zc, r) {
  const s = new THREE.Shape();
  s.moveTo(0, -zc - r);
  s.absarc(0, -zc, r, -Math.PI / 2, Math.PI / 2, false);
  s.closePath();
  return s;
}
function halfRing(zc, r1, r2) {
  const s = new THREE.Shape();
  s.moveTo(0, -zc - r2);
  s.absarc(0, -zc, r2, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(0, -zc + r1);
  s.absarc(0, -zc, r1, Math.PI / 2, -Math.PI / 2, true);
  s.closePath();
  return s;
}
/** The shape extruded from y 0 to y h (with a chamfer `bevel` that keeps the total height). */
function prism(shape, h, bevel = 0) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: bevel ? h - 2 * bevel : h,
    curveSegments: 22,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
  });
  g.rotateX(-Math.PI / 2);
  if (bevel) g.translate(0, bevel, 0);
  return g;
}

/** Clay that sinks into the black above y0 … y1 (world y): what rises behind the header. */
function fadeUp(mat, y0, y1) {
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("void main() {", "varying float vFadeY;\nvoid main() {")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n  vFadeY = (modelMatrix * vec4(transformed, 1.0)).y;");
    sh.fragmentShader = sh.fragmentShader
      .replace("void main() {", "varying float vFadeY;\nvoid main() {")
      .replace("#include <tonemapping_fragment>", `gl_FragColor.rgb *= 1.0 - smoothstep(${y0.toFixed(1)}, ${y1.toFixed(1)}, vFadeY);\n#include <tonemapping_fragment>`);
  };
  mat.customProgramCacheKey = () => `canal-fade-${y0}-${y1}`;
  return mat;
}

/* ── the neutrons' trails (additive light) and the puffs of the swallowed ones (a dark spot with a faint rim) ── */
const quadVS = /* glsl */ `
  attribute float aK;
  varying vec2 vUv; varying float vK;
  void main() {
    vUv = uv; vK = aK;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }`;
function trailMaterial(k) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(RECON.papier).multiplyScalar(k) } },
    vertexShader: quadVS,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec2 vUv; varying float vK;
      void main() {
        float u = clamp(vUv.x, 0.0, 1.0);
        float v = abs(vUv.y - 0.5) * 2.0;
        float w = mix(0.3, 1.0, u);              // the tail thins out
        float core = 1.0 - smoothstep(w * 0.4, w, v);
        float a = core * pow(u, 1.4) * clamp(vK, 0.0, 1.0);
        gl_FragColor = vec4(uColor * a, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}
function puffMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uRim: { value: new THREE.Color(RECON.papier).multiplyScalar(0.55) } },
    vertexShader: quadVS,
    fragmentShader: /* glsl */ `
      uniform vec3 uRim; varying vec2 vUv; varying float vK;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float disc = 1.0 - smoothstep(0.35, 0.8, r);
        float rim = smoothstep(0.62, 0.8, r) * (1.0 - smoothstep(0.8, 1.0, r));
        float a = (0.82 * disc + 0.32 * rim) * clamp(vK, 0.0, 1.0);
        vec3 c = uRim * (0.32 * rim) / max(0.82 * disc + 0.32 * rim, 0.001);
        gl_FragColor = vec4(c, a);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}
function flashMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(RECON.papier).multiplyScalar(2.2) } },
    vertexShader: quadVS,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec2 vUv; varying float vK;
      void main() {
        float r = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
        float a = pow(1.0 - r, 2.2) * clamp(vK, 0.0, 1.0);
        gl_FragColor = vec4(uColor * a, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}
/** An instanced quad (x −1 … 0: the tail to the head, uv.x 0 → 1) with a per-instance strength `aK`. */
function quads(count, mat, centred = false) {
  const geo = new THREE.PlaneGeometry(1, 1);
  if (!centred) geo.translate(-0.5, 0, 0);
  const aK = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
  aK.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("aK", aK);
  const m = new THREE.InstancedMesh(geo, mat, count);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.instanceMatrix.array.fill(0);
  m.frustumCulled = false;
  m.renderOrder = 4;
  return { mesh: m, M: m.instanceMatrix.array, K: aK.array, aK };
}
// column-major writers into an instanceMatrix array (no allocation)
function writeTrail(M, i, x, hy, hz, dy, dz, L, W) {
  const o = i * 16;
  M[o] = 0; M[o + 1] = dy * L; M[o + 2] = dz * L; M[o + 3] = 0;
  M[o + 4] = 0; M[o + 5] = -dz * W; M[o + 6] = dy * W; M[o + 7] = 0;
  M[o + 8] = 1; M[o + 9] = 0; M[o + 10] = 0; M[o + 11] = 0;
  M[o + 12] = x; M[o + 13] = hy; M[o + 14] = hz; M[o + 15] = 1;
}
function writeFacing(M, i, x, y, z, s) {
  const o = i * 16;
  M[o] = 0; M[o + 1] = 0; M[o + 2] = s; M[o + 3] = 0;
  M[o + 4] = 0; M[o + 5] = s; M[o + 6] = 0; M[o + 7] = 0;
  M[o + 8] = 1; M[o + 9] = 0; M[o + 10] = 0; M[o + 11] = 0;
  M[o + 12] = x; M[o + 13] = y; M[o + 14] = z; M[o + 15] = 1;
}
function writeBall(M, i, x, y, z, sx, sy = sx) {
  const o = i * 16;
  M[o] = sx; M[o + 1] = 0; M[o + 2] = 0; M[o + 3] = 0;
  M[o + 4] = 0; M[o + 5] = sy; M[o + 6] = 0; M[o + 7] = 0;
  M[o + 8] = 0; M[o + 9] = 0; M[o + 10] = sx; M[o + 11] = 0;
  M[o + 12] = x; M[o + 13] = y; M[o + 14] = z; M[o + 15] = 1;
}
const hideAt = (M, i) => M.fill(0, i * 16, i * 16 + 16);

/* ── the chain of `split`, in the loupe's plane (u: along z, v: along y, cm) ── */
const NUC = [[-10, 0], [3, 10], [4, -9], [15, 11], [15, -7]];
const BREAK = [0.25, 0.5, 0.53, 0.76, 0.79];
const NUC_R = 4.4;
// [from (u, v), to (u, v), split at start, split at arrival, the nucleus it breaks (−1: flies out of the loupe)]
const CHAIN = [
  [[-22, -5], NUC[0], 0.05, 0.25, 0],
  [NUC[0], NUC[1], 0.26, 0.5, 1],
  [NUC[0], NUC[2], 0.27, 0.53, 2],
  [NUC[0], [-6, -20.5], 0.26, 0.47, -1],
  [NUC[1], NUC[3], 0.51, 0.76, 3],
  [NUC[1], [-3, 20.5], 0.51, 0.72, -1],
  [NUC[2], NUC[4], 0.54, 0.79, 4],
  [NUC[2], [-8, -19.5], 0.54, 0.74, -1],
  [NUC[3], [20.5, 7], 0.77, 0.94, -1],
  [NUC[3], [9, 19.5], 0.78, 0.96, -1],
  [NUC[4], [21, -3], 0.8, 0.96, -1],
  [NUC[4], [10, -19], 0.81, 0.98, -1],
];
const LOUPE = { x: -17, y: 128, z: FUEL[0], r: 25 };

export function buildCanal() {
  const group = new THREE.Group();
  const mesh = (geo, mat, parent, { x = 0, y = 0, z = 0, edges = true, shadow = true, eo } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = shadow;
    if (edges) m.add(clayEdges(geo, eo));
    parent.add(m);
    return m;
  };

  /* ── the graphite, the plates, the rod channel's sleeve, the drive above: all that sinks for `solo` and `rep` ── */
  const slab = new THREE.Group();
  group.add(slab);
  const gMat = tinted(G.graphite);
  const blockH = (Y1 - Y0) / BLOCKS;
  for (const zc of [FUEL[0], ROD.z, FUEL[1]]) {
    const geo = prism(slabShape(zc - HW, zc + HW, [[zc, R_TUBE]]), blockH - 0.7);
    for (let i = 0; i < BLOCKS; i++) mesh(geo, gMat, slab, { y: Y0 + i * blockH + 0.35 });
  }
  const plateMat = tinted(G.plate);
  const grooves = [[FUEL[0], R_TUBE], [ROD.z, R_TUBE], [FUEL[1], R_TUBE]];
  const plateGeo = prism(slabShape(-ZE, ZE, grooves), SLAB_CANAL.low[1] - SLAB_CANAL.low[0]);
  mesh(plateGeo, plateMat, slab, { y: SLAB_CANAL.low[0] });
  mesh(plateGeo, plateMat, slab, { y: SLAB_CANAL.top[0] });
  const tubeMat = tinted(G.tube);
  mesh(prism(halfRing(ROD.z, R_BORE, R_TUBE), SLAB_CANAL.top[1]), tubeMat, slab);
  const drive = mesh(prism(halfRing(ROD.z, R_BORE, R_TUBE), DRIVE.y1 - DRIVE.y0), fadeUp(tinted(G.tube), 244, 272), slab, {
    y: DRIVE.y0,
    edges: false,
  });

  /* ── the two fuel channels ── */
  const waterMat = tinted(G.water, { rough: 0.78 });
  const vapourMat = tinted(G.vapour);
  vapourMat.emissive = new THREE.Color(RECON.alarme); vapourMat.emissiveIntensity = 0; const VAP_BASE = new THREE.Color(G.vapour), VAP_RED = new THREE.Color(0x5c1714);
  const cladMat = tinted(G.tube);
  const pelletMats = [];
  for (let i = 0; i < PELLETS; i++) {
    const m = tinted(G.pellet);
    m.emissive = new THREE.Color(RECON.papier);
    m.emissiveIntensity = 0;
    pelletMats.push(m);
  }
  const ringGeo = [];
  const fuel = [];
  for (let k = 0; k < 2; k++) {
    const zc = FUEL[k];
    const g = new THREE.Group();
    group.add(g);
    mesh(prism(halfRing(zc, R_TUBE_IN, R_TUBE), SLAB_CANAL.top[1]), tubeMat, g);
    mesh(prism(halfRing(zc, R_PELLET, R_CLAD), Y1 - Y0), cladMat, g, { y: Y0, edges: false });
    ringGeo[k] = prism(halfRing(zc, R_CLAD, R_TUBE_IN), 1);
    const water = mesh(ringGeo[k], waterMat, g, { y: Y0 });
    const vapour = mesh(ringGeo[k], vapourMat, g, { y: Y1 });
    const pGeo = prism(halfDisk(zc, R_PELLET - 0.45), PELLET_H, 0.45);
    for (let i = 0; i < PELLETS; i++) mesh(pGeo, pelletMats[i], g, { y: Y0 + i * PELLET_H, eo: { opacity: 0.2 } });
    // the light of the power spills on the cut faces around the fuel: a low one and a high one
    const lights = [75, 165].map((y) => {
      const L = new THREE.PointLight(RECON.papier, 0, 80, 1);
      L.position.set(-15, y, zc);
      g.add(L);
      return L;
    });
    fuel.push({ g, water, vapour, lights });
  }

  /* ── the French reactor (`rep`): the left fuel rod alone in a block of water — no graphite ── */
  const pool = new THREE.Group();
  group.add(pool);
  const poolGeo = prism(slabShape(FUEL[0] - HW, FUEL[0] + HW, [[FUEL[0], R_TUBE]]), 1);
  const poolWater = mesh(poolGeo, waterMat, pool);
  const poolVapour = mesh(poolGeo, vapourMat, pool);

  /* ── the rod: absorber, link, displacer (THE part in fault), and the channel's water columns ── */
  const rodG = new THREE.Group();
  group.add(rodG);
  const absMat = safe(fadeUp(tinted(G.absorber), 244, 272)); // the absorber that brakes: green when the system works (S.ok)
  const TIP = 28;
  const absTipM = mesh(prism(halfDisk(ROD.z, ROD.r), TIP), absMat, rodG);
  const absBody = mesh(prism(halfDisk(ROD.z, ROD.r), ROD.absorber - TIP), absMat, rodG, { edges: false });
  const linkGeo = prism(halfDisk(ROD.z, 1.7), ROD.waterTop);
  linkGeo.translate(-0.5, 0, 0);
  const link = mesh(linkGeo, tinted(G.plate), rodG);
  const dispMat = alarm({ tone: -0.08, noOk: true }); // 05/11: only the absorber goes green with `ok`; the displacer turns red (fault), green only on heal
  dispMat.userData.clayBase.setHex(G.graphite); // it IS graphite: the same grey as the columns until it turns red
  const displacer = mesh(prism(halfDisk(ROD.z, ROD.r), 1), dispMat, rodG);
  const colGeo = prism(halfDisk(ROD.z, R_BORE), 1);
  const waterMid = mesh(colGeo, waterMat, rodG);
  const waterLow = mesh(colGeo, waterMat, rodG);
  // the water pushed out through the bore of the low plate while the displacer comes down
  const drips = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), waterMat, 6);
  drips.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  drips.frustumCulled = false;
  rodG.add(drips);

  /* ── vapour bubbles, xenon grains ── */
  const N_BUB = 64;
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), clay({ tone: 1 }), N_BUB);
  bubbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bubbles.frustumCulled = false;
  group.add(bubbles);
  const bub = [];
  for (let b = 0; b < N_BUB; b++) {
    bub.push({
      ch: b < N_BUB / 2 ? 0 : 1,
      side: b % 2 ? 1 : -1,
      lat: 6.5 + 3.2 * hash(b, 11),
      T: 1.6 + 1.0 * hash(b, 12),
      ph: 30 * hash(b, 13),
    });
  }
  const N_XE = 44;
  const xenonM = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), clay({ tone: -1 }), N_XE);
  xenonM.frustumCulled = false;
  group.add(xenonM);
  const xe = [];
  for (let j = 0; j < N_XE; j++) {
    xe.push({
      ch: j < N_XE / 2 ? 0 : 1,
      y: Y0 + 5 + (Y1 - Y0 - 10) * hash(j, 21),
      dz: (hash(j, 22) - 0.5) * 7,
      thr: 0.6 * hash(j, 23),
      r: 0.75 + 0.45 * hash(j, 24),
    });
  }

  /* ── the neutrons ── */
  const trails = quads(N_NEU * 2, trailMaterial(2.6));
  const puffs = quads(N_NEU, puffMaterial(), true);
  puffs.mesh.renderOrder = 3;
  group.add(trails.mesh, puffs.mesh);
  const neu = [];
  for (let i = 0; i < N_NEU; i++) {
    const T = 1.5 + 0.9 * hash(i, 31);
    neu.push({ T, ph: 40 * hash(i, 32) });
  }

  /* ── the loupe of `split` ── */
  const loupe = new THREE.Group();
  loupe.position.set(LOUPE.x, LOUPE.y, LOUPE.z);
  group.add(loupe);
  const discGeo = new THREE.CylinderGeometry(LOUPE.r, LOUPE.r, 1.2, 72);
  discGeo.rotateZ(Math.PI / 2);
  const disc = mesh(discGeo, tinted(0x161615), loupe, { x: 3, shadow: false });
  disc.receiveShadow = true;
  const rimGeo = new THREE.TorusGeometry(LOUPE.r, 1.1, 10, 96);
  rimGeo.rotateY(Math.PI / 2);
  mesh(rimGeo, clay({ tone: 0.35 }), loupe, { x: 2.4, edges: false, shadow: false });
  const nucMat = tinted(0xd6d2c9);
  const fragMat = tinted(0x8f8c87);
  const nucGeo = new THREE.SphereGeometry(NUC_R, 28, 18);
  const fragGeo = new THREE.SphereGeometry(NUC_R * 0.8, 22, 14);
  const nuclei = NUC.map(([u, v], j) => {
    const whole = mesh(nucGeo, nucMat, loupe, { y: v, z: u, edges: false, shadow: false });
    const a = mesh(fragGeo, fragMat, loupe, { y: v, z: u, edges: false, shadow: false });
    const b = mesh(fragGeo, fragMat, loupe, { y: v, z: u, edges: false, shadow: false });
    const ang = 0.9 + 1.3 * j; // the direction the two halves fly apart
    return { u, v, whole, a, b, cu: Math.cos(ang), cv: Math.sin(ang) };
  });
  const lTrails = quads(CHAIN.length, trailMaterial(2.2));
  const flashes = quads(NUC.length, flashMaterial(), true);
  loupe.add(lTrails.mesh, flashes.mesh);

  /* ── anchors ── */
  const anchor = (x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    group.add(o);
    return o;
  };
  const A = {
    focus: anchor(0, 125, 0),
    fault: anchor(-2, Y1 - ROD.waterTop - ROD.displacer, ROD.z),
    rod: anchor(-2, Y1, ROD.z),
    displacer: anchor(-2, Y1 - ROD.waterTop - ROD.displacer / 2, ROD.z),
    waterLow: anchor(-1, Y0 + ROD.waterLow / 2, ROD.z),
    fuel: anchor(-1, (Y0 + Y1) / 2, FUEL[0]),
    atoms: anchor(LOUPE.x, LOUPE.y, LOUPE.z),
    top: anchor(0, Y1, 0),
    bottom: anchor(0, Y0, 0),
  };

  /** A segment [a, b] of a unit-height column: hidden when empty. */
  const span = (m, a, b) => {
    if (b - a < 0.05) {
      m.visible = false;
      return;
    }
    m.visible = true;
    m.position.y = a;
    m.scale.y = b - a;
  };
  const sink = (g, k, depth) => {
    g.position.y = -depth * k * k;
    g.visible = k < 0.999;
  };

  return {
    group, A, haloR: 46,
    update(S, time) {
      const solo = cl01(S.solo);
      const rep = cl01(S.rep);
      const flux = cl01(S.flux);
      const xenon = cl01(S.xenon);
      const pLow = Math.max(0, S.pLow);
      const pHigh = Math.max(0, S.pHigh);

      /* what sinks */
      const kSlab = Math.max(solo, rep);
      sink(slab, kSlab, 270);
      drive.visible = kSlab < 0.02;
      sink(fuel[0].g, solo, 270);
      sink(fuel[1].g, kSlab, 270);
      const wCh0 = (1 - solo) * (1 - solo);
      const wCh1 = (1 - kSlab) * (1 - kSlab);
      sink(rodG, rep, 380);
      rodG.position.y -= 26 * solo; // alone, it stands on its halo — and thickens: a display piece, its lengths still true
      rodG.scale.x = rodG.scale.z = 1 + 0.7 * solo;

      /* the rod */
      const off = ROD.travel * cl01(S.rod) * (1 - 0.72 * solo);
      const absTip = Y1 - off;
      const dispTop = absTip - ROD.waterTop;
      const dispBot = dispTop - ROD.displacer - ROD.waterLow * cl01(S.newRod);
      const clipL = CLIP - rodG.position.y; // the table, in the rod's frame
      absTipM.position.y = absTip;
      absBody.position.y = absTip + TIP;
      link.position.y = dispTop;
      link.visible = dispTop + ROD.waterTop > clipL;
      span(displacer, Math.max(dispBot, clipL), dispTop);
      span(waterMid, Math.max(dispTop, clipL), Math.min(absTip, SLAB_CANAL.top[1]));
      // the bottom water: pushed down through the bore while the foot comes down, gone once it reaches the bottom
      const push = cl01((ROD.travel * cl01(S.rod)) / ROD.waterLow);
      const ex = solo < 0.5 && rep < 0.5 && push > 0 && push < 1 ? Math.sin(Math.PI * push) : 0;
      const wlBot = Math.max(clipL, Y0 - 13 * ex);
      span(waterLow, wlBot, dispBot);
      setAlarm(dispMat, S.fault);
      heal(dispMat, S.depuis);
      { const vr = cl01(S.viol ?? 0); vapourMat.color.copy(VAP_BASE).lerp(VAP_RED, Math.min(1, vr * 1.4)); vapourMat.emissiveIntensity = 0.9 * vr; } // 05/11 piège: the steam turns red on « vapeur »
      drips.visible = ex > 0.02;
      if (drips.visible) {
        const M = drips.instanceMatrix.array;
        for (let j = 0; j < 6; j++) {
          const T = 0.42 + 0.2 * hash(j, 41);
          const tt = time + 5 * hash(j, 42);
          const age = (tt / T) % 1;
          const y = Y0 - 2 - 34 * age;
          const s = ex * sm(0, 0.15, age) * (y > 1.5 ? 1 : 0);
          if (s < 0.01) hideAt(M, j);
          else writeBall(M, j, -0.2, y, ROD.z + (hash(j, 43) - 0.5) * 9, 1.15 * s, 3.4 * s);
        }
        drips.instanceMatrix.needsUpdate = true;
      }
      const ry = rodG.position.y;
      A.fault.position.y = dispBot + ry;
      A.rod.position.y = absTip + ry;
      A.displacer.position.y = (dispTop + dispBot) / 2 + ry;
      A.waterLow.position.y = (wlBot + Math.max(wlBot, dispBot)) / 2 + ry;

      /* water and vapour: the vapour takes the ring from the top down */
      const front = 240 - 230 * cl01(S.steam);
      const wTop = Math.min(Y1, Math.max(Y0, front));
      for (let k = 0; k < 2; k++) {
        span(fuel[k].water, Y0, wTop);
        span(fuel[k].vapour, wTop, Y1);
      }
      pool.visible = rep > 0.01;
      if (pool.visible) {
        const top = Y1 * sm(0, 0.8, rep);
        span(poolWater, 0, Math.min(top, wTop));
        span(poolVapour, Math.min(top, wTop), top);
      }

      /* the power: the light of the pellets, and on the faces around */
      for (let i = 0; i < PELLETS; i++) {
        const p = Math.min(1.2, powerAt(pLow, pHigh, Y0 + (i + 0.5) * PELLET_H));
        pelletMats[i].emissiveIntensity = 0.05 + 0.75 * Math.pow(p, 1.4);
      }
      for (let k = 0; k < 2; k++) {
        const w = k ? wCh1 : wCh0;
        fuel[k].lights[0].intensity = 2.5 * pLow * w;
        fuel[k].lights[1].intensity = 2.5 * pHigh * w;
      }

      /* bubbles */
      {
        const M = bubbles.instanceMatrix.array;
        const on = sm(0.02, 0.1, S.steam);
        for (let b = 0; b < N_BUB; b++) {
          const q = bub[b];
          const w = q.ch ? wCh1 : wCh0;
          if (on * w < 0.01 || front > Y1 + 12) {
            hideAt(M, b);
            continue;
          }
          const tt = time + q.ph;
          const c = Math.floor(tt / q.T);
          const age = tt - c * q.T;
          const r1 = hash(b * 7 + 1, c);
          const lo = Math.max(Y0 + 2, front - 14);
          const yb = lo + (Y1 - lo) * Math.pow(r1, 1.5);
          const y = yb + (12 + 9 * hash(b * 7 + 2, c)) * age;
          const s = (0.65 + 0.75 * hash(b * 7 + 3, c)) * (0.75 + 0.5 * sm(Y0, Y1, y)) * sm(0, 0.2, age) * (1 - sm(Y1 - 7, Y1 - 1.5, y)) * on * w;
          if (s < 0.05) hideAt(M, b);
          else writeBall(M, b, -0.3, y + fuel[q.ch].g.position.y, FUEL[q.ch] + q.side * q.lat, s);
        }
        bubbles.instanceMatrix.needsUpdate = true;
      }

      /* xenon */
      xenonM.visible = xenon > 0.001;
      if (xenonM.visible) {
        const M = xenonM.instanceMatrix.array;
        for (let j = 0; j < N_XE; j++) {
          const q = xe[j];
          const s = q.r * sm(q.thr, q.thr + 0.3, xenon) * (q.ch ? wCh1 : wCh0);
          if (s < 0.02) hideAt(M, j);
          else writeBall(M, j, -0.55, q.y + fuel[q.ch].g.position.y, FUEL[q.ch] + q.dz, s);
        }
        xenonM.instanceMatrix.needsUpdate = true;
      }

      /* the neutrons */
      const rodOn = rep < 0.5 && solo < 0.5;
      const TM = trails.M, TK = trails.K, PM = puffs.M, PK = puffs.K;
      for (let i = 0; i < N_NEU; i++) {
        const iA = i * 2, iB = i * 2 + 1;
        TK[iA] = TK[iB] = PK[i] = 0;
        if (flux < 0.003) continue;
        const q = neu[i];
        const tt = time + q.ph;
        const c = Math.floor(tt / q.T);
        const age = tt - c * q.T;
        const h0 = i * 16;
        const ch = hash(h0, c) < 0.5 ? 0 : 1;
        const w = ch ? wCh1 : wCh0;
        if (w < 0.003) continue;
        const zc = FUEL[ch];
        const y0 = Y0 + 6 + (Y1 - Y0 - 12) * hash(h0 + 1, c);
        const pw = powerAt(pLow, pHigh, y0);
        const r2 = hash(h0 + 2, c);
        const a0 = sm(r2 - 0.07, r2 + 0.07, pw * 0.92 + 0.03) * w * flux;
        if (a0 < 0.003) continue;
        const toward = hash(h0 + 3, c) < 0.64;
        const dirZ = toward ? -Math.sign(zc) : Math.sign(zc);
        const th = (hash(h0 + 4, c) - 0.5) * 1.7;
        const adz = Math.cos(th);
        const dz = adz * dirZ;
        const dy = Math.sin(th);
        const z0 = zc + (hash(h0 + 5, c) - 0.5) * 6;
        const sTube = R_TUBE / adz;
        let sEnd = toward ? (rep > 0.5 ? (HW - 0.5) / adz : 82 / adz) : (ZE - 1 - Math.abs(zc)) / adz;
        if (dy > 0.001) sEnd = Math.min(sEnd, (Y1 - 2 - y0) / dy);
        else if (dy < -0.001) sEnd = Math.min(sEnd, (y0 - Y0 - 2) / -dy);
        sEnd = Math.min(sEnd, 95);
        // its fate: the first thing on its way that swallows it (smooth thresholds: a change of state fades, never pops)
        let sAbs = 1e9;
        let kAbs = 0;
        if (xenon > 0.001) {
          const r = hash(h0 + 6, c);
          const k = sm(r - 0.05, r + 0.05, xenon * 0.72);
          if (k > 0.02) {
            sAbs = (0.8 + 3.6 * hash(h0 + 7, c)) / adz;
            kAbs = k;
          }
        }
        if (!kAbs) {
          const s0 = R_CLAD / adz, s1 = R_TUBE_IN / adz;
          const f = vapAt(front, y0 + dy * 0.5 * (s0 + s1));
          const P = 0.5 * (1 - f) + 0.06 * f;
          const r = hash(h0 + 8, c);
          const k = sm(r - 0.05, r + 0.05, P);
          if (k > 0.02) {
            sAbs = s0 + hash(h0 + 9, c) * (s1 - s0);
            kAbs = k;
          }
        }
        if (!kAbs && toward && rodOn) {
          const sR0 = (Math.abs(zc) - R_BORE) / adz;
          const yR = y0 + dy * sR0;
          if (sR0 < sEnd && yR > Y0 && yR < Y1) {
            const wA = sm(absTip - 2.5, absTip + 2.5, yR);
            const wD = Math.max(0, sm(dispBot - 2.5, dispBot + 2.5, yR) - sm(dispTop - 2.5, dispTop + 2.5, yR));
            const wW = Math.max(0, 1 - wA - wD);
            const P = wA + 0.55 * wW;
            const r = hash(h0 + 10, c);
            const k = sm(r - 0.05, r + 0.05, P);
            if (k > 0.02) {
              sAbs = sR0 + (wA > 0.5 ? 0.6 : 1 + 13 * hash(h0 + 11, c)) / adz;
              kAbs = k;
            }
          }
        }
        if (sAbs >= sEnd) kAbs = 0;
        // where it is: fast through fuel and water, slowed in graphite
        const t1 = sTube / V_FAST;
        const s = along(age, t1, sTube);
        const sT = along(Math.max(0, age - TAU), t1, sTube);
        if (sT >= sEnd) continue;
        const fadeIn = sm(0, 0.1, age);
        const yOff = fuel[ch].g.position.y;
        const base = a0 * fadeIn;
        if (!kAbs || s <= sAbs) {
          const hd = Math.min(s, sEnd);
          const aP = base * (1 - sm(sEnd - 7, sEnd, s));
          if (aP > 0.003 && hd - sT > 0.05) {
            writeTrail(TM, iA, NX, y0 + dy * hd + yOff, z0 + dz * hd, dy, dz, hd - sT, 3.0);
            TK[iA] = aP;
          }
          continue;
        }
        // past the point where it may be swallowed: the share that passes goes on, the swallowed share collapses into a puff
        const hd = Math.min(s, sEnd);
        const aP = base * (1 - kAbs) * (1 - sm(sEnd - 7, sEnd, s));
        if (aP > 0.003 && hd - sT > 0.05) {
          writeTrail(TM, iA, NX, y0 + dy * hd + yOff, z0 + dz * hd, dy, dz, hd - sT, 3.0);
          TK[iA] = aP;
        }
        if (sT < sAbs) {
          writeTrail(TM, iB, NX, y0 + dy * sAbs + yOff, z0 + dz * sAbs, dy, dz, sAbs - sT, 3.0);
          TK[iB] = base * kAbs;
        }
        const tA = sAbs <= sTube ? sAbs / V_FAST : t1 + (sAbs - sTube) / V_SLOW;
        const pa = (age - tA) / PUFF;
        if (pa >= 0 && pa < 1) {
          writeFacing(PM, i, NX + 0.3, y0 + dy * sAbs + yOff, z0 + dz * sAbs, 4.5 + 4 * pa);
          PK[i] = a0 * kAbs * Math.pow(1 - pa, 1.3);
        }
      }
      trails.mesh.instanceMatrix.needsUpdate = true;
      puffs.mesh.instanceMatrix.needsUpdate = true;
      trails.aK.needsUpdate = true;
      puffs.aK.needsUpdate = true;
      trails.mesh.visible = puffs.mesh.visible = flux >= 0.003;

      /* the loupe */
      const sp = S.split;
      const open = sm(0, 0.05, sp) * (1 - sm(0.9, 1, sp));
      loupe.visible = open > 0.001;
      if (loupe.visible) {
        loupe.scale.setScalar(0.25 + 0.75 * open);
        for (let j = 0; j < NUC.length; j++) {
          const n = nuclei[j];
          const b = BREAK[j];
          const broken = sp >= b;
          n.whole.visible = !broken;
          n.a.visible = n.b.visible = broken;
          const f = sm(b, b + 0.12, sp);
          const d = 1.6 + 3.2 * f;
          n.a.position.set(0, n.v + n.cv * d, n.u + n.cu * d);
          n.b.position.set(0, n.v - n.cv * d, n.u - n.cu * d);
          const fl = broken ? 1 - sm(b, b + 0.08, sp) : 0;
          if (fl > 0.01) {
            writeFacing(flashes.M, j, -4.5, n.v, n.u, 11 + 6 * (1 - fl));
            flashes.K[j] = fl;
          } else flashes.K[j] = 0;
        }
        for (let j = 0; j < CHAIN.length; j++) {
          const C = CHAIN[j];
          const fu = C[0][0], fv = C[0][1], tu = C[1][0], tv = C[1][1], s0 = C[2], s1 = C[3], hit = C[4];
          const e = (sp - s0) / (s1 - s0);
          if (e <= 0 || e >= 1) {
            lTrails.K[j] = 0;
            continue;
          }
          const du = tu - fu, dv = tv - fv;
          const len = Math.hypot(du, dv);
          const ux = du / len, vy = dv / len;
          // from the surface of the nucleus it leaves to the surface of the one it breaks
          const a0 = j ? NUC_R : 0;
          const a1 = hit >= 0 ? NUC_R * 0.4 : 0;
          const hd = a0 + e * (len - a0 - a1);
          const tl = Math.min(hd - a0 * 0.8, 7);
          writeTrail(lTrails.M, j, -1.2, fv + vy * hd, fu + ux * hd, vy, ux, tl, 2.6);
          lTrails.K[j] = sm(0, 0.08, e) * (hit < 0 ? 1 - sm(0.8, 1, e) : 1);
        }
        lTrails.mesh.instanceMatrix.needsUpdate = true;
        lTrails.aK.needsUpdate = true;
        flashes.mesh.instanceMatrix.needsUpdate = true;
        flashes.aK.needsUpdate = true;
      }
    },
  };
}
