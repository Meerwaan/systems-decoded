// CR03 — reservoir.js : TANK N° 5 IN SECTION, ≈ 1:2 — the mechanism of the fault (plan.js BAY, IMPACT, PANEL, DEBRIS, CULPRIT).
// « Le noir chaud »: a clay maquette (clay(), clayEdges()), cut open by the plane x = 0 — only x ≥ 0 is built, every cut face looks
// toward −x (cameras between az −50 and −80). THE CUT PASSES THROUGH THE IMPACT AND THROUGH THE PANEL'S CENTRE (x = 0): the dent, the
// front and the bulge are all drawn in the section, where a 270 px thumbnail reads them (the panel is cut in half, like CR02's pipe).
//   · the BAY of the integral tank lying in the air: the intrados (a light skin, riveted underneath, raised by `dent`), the extrados,
//     the stringers seen end on in the cut (inverted T, along x), two RIBS (I-section, dark) at z ±60, the rear SPAR. Under it, the void.
//   · THE KEROSENE, 94 % full: one opaque plane just behind the cut — deep amber, darker at the bottom and against the walls, a light
//     meniscus that barely moves under a thin air gap. Its bottom follows the dent, the bulge, the open hole.
//   · `hit`: the TYRE PIECE (black rubber, torn outline, tread underneath, steel cords out of one edge) flies in from low left, tumbling,
//     and lands flat on the intrados at the impact; `dent` pushes the skin in (and the stringers, the rivets, the liner with it). Once
//     the front is on its way (`wave`), the piece drops back and lies on the floor.
//   · `wave`: THE FRONT — a red line (2 cm core) that leaves the dent as a half circle and sweeps the kerosene toward the panel, a red
//     wake behind it, a darker band just ahead (contrast on the amber), stronger toward +z; the liquid it has crossed slightly lighter.
//     As it reaches the panel, a red spot over it (`bulge` keeps a pressure there until the panel goes).
//   · `bulge`: the half PANEL domes downward; `tear` (× (1 − kevlar)): its rivets jump, it drops and turns over, lands dome up on the
//     floor; `gush` (× the hole open): the kerosene out of the hole — an amber jet, a wider spray, drops falling to the floor.
//     Culprit 2 (CULPRIT.tank5): the panel AND the lip of its hole in alarm red (S.fault), green by heal(S.depuis).
//   · `kevlar`: the LINER, light clay woven in fine lines, settles against the walls (bottom, top, ribs) — the same hit then bulges
//     the panel a little and never tears it; veille green under `depuis`.
// Everything depends on S and time only (seeded, no Math.random, no clock). update() allocates nothing: the deformed grids are
// rewritten only when dent / bulge / kevlar change, with analytic normals.
//   buildReservoir() → { group, A, haloR, update(S, time, px) }
//   A: focus (the bay's middle, in the cut), fault (the panel itself, it moves when it falls), impact (the dent, under the skin),
//      panel (the hole, fixed: where the circle goes), debris (the tyre piece), wave (the front, on its way along the bottom)
//   reads S: hit dent wave bulge tear gush kevlar ok culprit fault depuis (and `kero` if the state has it: the kerosene lights up)
import * as THREE from "three";
import { clay, clayEdges, alarm, setAlarm, heal, RECON } from "@kit/reconstitution.js";
import { box, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { BAY, IMPACT, PANEL, DEBRIS, CULPRIT } from "./plan.js";

/* ───────── dimensions (local, cm of maquette) ───────── */
const SK = 1.5; // skin thickness (magnified)
const Y0 = BAY.y0; // inner face of the intrados (70)
const YO = Y0 - SK; // its outer face (68.5)
const Y1 = BAY.y1; // outer face of the extrados (105)
const YT = Y1 - SK; // its inner face (103.5)
const ZE = 61.25; // the skins' half-span (to the ribs' outer flanges)
const XD = BAY.depth; // 60: chord kept
const RIB = 60; // ribs' centre (z ±)
const RIBT = 1.4;
const RI = RIB - RIBT / 2; // ribs' inner face: 59.3
const SPAR = XD - RIBT; // the rear spar's inner face: 58.6
const TOP = Y0 + (YT - Y0) * BAY.fill; // the free surface (≈ 101.5)
const HZ = IMPACT.at[2]; // the impact, on the cut (x = 0)
const PS = PANEL.size; // 15
const PZ = PANEL.at[2]; // 30
const PZ0 = PZ - PS / 2; // 22.5
const PZ1 = PZ + PS / 2; // 37.5
const PX1 = PS / 2; // the half panel: x 0 … 7.5
const REACH = PZ - HZ; // the front's way: from the dent to the panel (64)
const DENT = { depth: 5, flat: 7, rad: 17 };
const BUL = 4.5; // the panel's dome at bulge 1
const FROM = [-26, 9, -118]; // low left, ABOVE the floor (y 0): the piece comes up into the frame
const STRINGERS_LOW = [-52, -40, -28, -16, -4, 8, 20, 40, 52]; // they leave the panel (22.5 … 37.5) between two of them
const STRINGERS_TOP = [-54, -42, -30, -18, -6, 6, 18, 30, 42, 54];

const clamp01 = (x) => (x == null || x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const dentD = (x, z, k) => DENT.depth * k * (1 - smooth(DENT.flat, DENT.rad, Math.hypot(x, z - HZ)));
function bulgeD(x, z, k) {
  const u = (z - PZ0) / PS;
  const v = (x + PX1) / PS;
  if (u <= 0 || u >= 1 || v <= 0 || v >= 1) return 0;
  return BUL * k * Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
}

/* ───────── a deformable slab: two grids and four sides, y offset by fn(x, z), normals analytic ───────── */
function makeSlab({ x0, x1, nx, z0, z1, nz, top, thick, hole = null, uvScale = 4 }) {
  const NX = nx + 1, NZ = nz + 1, G = NX * NZ;
  const n = 2 * G + 2 * (2 * NZ + 2 * NX);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  const bx = new Float32Array(n), by = new Float32Array(n), bz = new Float32Array(n), kind = new Uint8Array(n);
  let v = 0;
  const put = (x, y, z, k, nxv, nyv, nzv, u, w) => {
    bx[v] = x; by[v] = y; bz[v] = z; kind[v] = k;
    pos[v * 3] = x; pos[v * 3 + 1] = y; pos[v * 3 + 2] = z;
    nor[v * 3] = nxv; nor[v * 3 + 1] = nyv; nor[v * 3 + 2] = nzv;
    uv[v * 2] = u / uvScale; uv[v * 2 + 1] = w / uvScale;
    return v++;
  };
  const X = (i) => x0 + ((x1 - x0) * i) / nx;
  const Z = (j) => z0 + ((z1 - z0) * j) / nz;
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) put(X(i), top, Z(j), 0, 0, 1, 0, X(i), Z(j));
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) put(X(i), top - thick, Z(j), 1, 0, -1, 0, X(i), Z(j));
  const idx = [];
  const inHole = (i, j) => hole && i >= hole[0] && i < hole[1] && j >= hole[2] && j < hole[3];
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nz; j++) {
      if (inHole(i, j)) continue;
      const a = i * NZ + j, b = (i + 1) * NZ + j, c = (i + 1) * NZ + j + 1, d = i * NZ + j + 1;
      idx.push(a, d, b, b, d, c);
      idx.push(G + a, G + b, G + d, G + b, G + c, G + d);
    }
  // sides: −x (the cut), +x, −z, +z
  const sx = (x, nxv, cut) => {
    const s = v;
    for (let j = 0; j < NZ; j++) {
      put(x, top, Z(j), 2, nxv, 0, 0, Z(j), top);
      put(x, top - thick, Z(j), 2, nxv, 0, 0, Z(j), top - thick);
    }
    for (let j = 0; j < nz; j++) {
      if (cut && hole && hole[0] === 0 && j >= hole[2] && j < hole[3]) continue;
      const t = s + 2 * j, b = t + 1, t1 = t + 2, b1 = t + 3;
      if (nxv < 0) idx.push(t, b, t1, t1, b, b1);
      else idx.push(t, t1, b, t1, b1, b);
    }
  };
  const sz = (z, nzv) => {
    const s = v;
    for (let i = 0; i < NX; i++) {
      put(X(i), top, z, 2, 0, 0, nzv, X(i), top);
      put(X(i), top - thick, z, 2, 0, 0, nzv, X(i), top - thick);
    }
    for (let i = 0; i < nx; i++) {
      const t = s + 2 * i, b = t + 1, t1 = t + 2, b1 = t + 3;
      if (nzv < 0) idx.push(t, t1, b, t1, b1, b);
      else idx.push(t, b, t1, t1, b, b1);
    }
  };
  sx(x0, -1, true);
  sx(x1, 1, false);
  sz(z0, -1);
  sz(z1, 1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  geo.boundingSphere.radius += 10;
  const P = geo.attributes.position, N = geo.attributes.normal;
  return {
    geo,
    /** y = base + fn(x, z) on every vertex; top / bottom normals from fn's slope. */
    write(fn) {
      for (let k = 0; k < n; k++) {
        const x = bx[k], z = bz[k];
        const d = fn(x, z);
        pos[k * 3 + 1] = by[k] + d;
        if (kind[k] < 2) {
          const gx = fn(x + 0.5, z) - fn(x - 0.5, z);
          const gz = fn(x, z + 0.5) - fn(x, z - 0.5);
          const l = Math.hypot(gx, 1, gz);
          const s = kind[k] === 0 ? 1 : -1;
          nor[k * 3] = (-s * gx) / l;
          nor[k * 3 + 1] = s / l;
          nor[k * 3 + 2] = (-s * gz) / l;
        }
      }
      P.needsUpdate = true;
      N.needsUpdate = true;
    },
  };
}

/** A geometry whose vertices follow fn(x, z) in y (normals untouched: small slopes). */
function follower(geo) {
  const pos = geo.attributes.position.array;
  const base = Float32Array.from(pos);
  geo.computeBoundingSphere();
  geo.boundingSphere.radius += 10;
  return {
    geo,
    write(fn) {
      for (let k = 0; k < pos.length; k += 3) pos[k + 1] = base[k + 1] + fn(base[k], base[k + 2]);
      geo.attributes.position.needsUpdate = true;
    },
  };
}

/** Planar UVs from the dominant normal (a box's weave keeps one density on every face). */
function planarUV(geo, cell = 3) {
  const p = geo.attributes.position, nrm = geo.attributes.normal;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(nrm.getX(i)), ay = Math.abs(nrm.getY(i)), az = Math.abs(nrm.getZ(i));
    const [u, w] = ax >= ay && ax >= az ? [p.getZ(i), p.getY(i)] : ay >= az ? [p.getX(i), p.getZ(i)] : [p.getX(i), p.getY(i)];
    uv[i * 2] = u / cell;
    uv[i * 2 + 1] = w / cell;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

/** A basket weave (the Kevlar's cloth), grey multiplier, tiled. */
function weaveTexture() {
  const N = 32;
  const data = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const cell = ((x >> 3) + (y >> 3)) & 1;
      const a = cell ? x & 7 : y & 7;
      const b = cell ? y & 7 : x & 7;
      const v = 0.8 + 0.2 * (a === 0 ? 0.2 : 1) * (0.85 + 0.15 * Math.sin((b / 8) * Math.PI));
      const k = (y * N + x) * 4;
      data[k] = data[k + 1] = data[k + 2] = Math.round(v * 255);
      data[k + 3] = 255;
    }
  const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* ───────── the kerosene in the cut, and the front ───────── */
const f = (x) => x.toFixed(3);
const GLSL_SHAPE = /* glsl */ `
  float dentD(float x, float z, float k) { return ${f(DENT.depth)} * k * (1.0 - smoothstep(${f(DENT.flat)}, ${f(DENT.rad)}, length(vec2(x, z - ${f(HZ)})))); }
  float bulgeD(float x, float z, float k) {
    float u = (z - ${f(PZ0)}) / ${f(PS)};
    float v = (x + ${f(PX1)}) / ${f(PS)};
    if (u <= 0.0 || u >= 1.0 || v <= 0.0 || v >= 1.0) return 0.0;
    return ${f(BUL)} * k * sin(3.14159 * u) * sin(3.14159 * v);
  }`;
function keroMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uR: { value: 0 }, uOn: { value: 0 }, uDent: { value: 0 }, uBulge: { value: 0 }, uOpen: { value: 0 },
      uKero: { value: 1 }, uKev: { value: 0 }, uArrive: { value: 0 }, uPress: { value: 0 },
      uAmb: { value: new THREE.Color(RECON.ambre) }, uRed: { value: new THREE.Color(RECON.alarme) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vP;
      void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uR, uOn, uDent, uBulge, uOpen, uKero, uKev, uArrive, uPress;
      uniform vec3 uAmb, uRed;
      varying vec3 vP;
      ${GLSL_SHAPE}
      void main() {
        float y = vP.y, z = vP.z;
        float fl = ${f(Y0)} + dentD(0.0, z, uDent) - bulgeD(0.0, z, uBulge) + 0.9 * uKev;
        float hole = step(${f(PZ0)}, z) * step(z, ${f(PZ1)});
        fl = mix(fl, ${f(YO - 2)}, hole * uOpen);
        float tp = ${f(TOP)} + 0.10 * sin(z * 0.11 + uTime * 0.8) + 0.06 * sin(z * 0.27 - uTime * 1.3);
        if (y < fl || y > tp || abs(z) > ${f(RI)}) discard;
        // the liquid: deep amber, darker at the bottom and against the walls, a slow density
        float hN = clamp((y - ${f(Y0)}) / ${f(TOP - Y0)}, 0.0, 1.0);
        vec3 c = uAmb * (0.07 + 0.1 * hN) * (0.62 + 0.5 * uKero);
        float wall = min(min(${f(RI)} - abs(z), y - fl), tp - y);
        c *= 0.6 + 0.4 * smoothstep(0.0, 7.0, wall);
        float n = sin(z * 0.06 + y * 0.05 + uTime * 0.22) * sin(y * 0.17 - z * 0.03 - uTime * 0.15);
        c *= 1.0 + 0.07 * n;
        float men = 1.0 - smoothstep(0.0, max(0.45, 1.5 * fwidth(y)), tp - y);
        c += uAmb * 0.5 * men * (0.6 + 0.4 * uKero);
        // the front: one line, its wake behind, a darker band ahead, stronger toward the panel (+z)
        float hy = ${f(Y0)} + dentD(0.0, ${f(HZ)}, uDent);
        vec2 q = vec2(z - ${f(HZ)}, y - hy);
        float r = length(q);
        float df = r - uR;
        float aw = fwidth(r);
        float hw = max(1.0, 1.2 * aw);
        float core = 1.0 - smoothstep(hw, hw + 1.2 * aw + 0.3, abs(df));
        float trail = df < 0.0 ? exp(df / 8.0) : 0.0;
        float lead = df > 0.0 ? exp(-df / 3.0) : 0.0;
        float dir = mix(0.38, 1.0, smoothstep(-0.5, 0.6, q.x / max(r, 0.001)));
        float on = uOn * dir;
        c *= 1.0 + 0.45 * uOn * step(r, uR) * (0.6 + 0.4 * exp((r - uR) / 18.0));
        c *= 1.0 - 0.55 * lead * on;
        c = mix(c, uRed * 0.5, 0.5 * trail * on);
        c += (uRed * 2.1 + vec3(0.1)) * core * on;
        // the front arrives: a red spot over the panel; the pressure stays while it bulges
        vec2 pq = vec2(z - ${f(PZ)}, y - ${f(Y0)});
        float spot = exp(-dot(pq, pq) / 40.0);
        c = mix(c, uRed * 0.35, clamp(spot * (uArrive + uPress), 0.0, 0.4));
        gl_FragColor = vec4(c, 1.0);
      }`,
    toneMapped: false,
  });
}

/* ───────── the jet and the drops ───────── */
function jetMaterial(k, gain) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAmt: { value: 0 }, uLen: { value: 1 }, uK: { value: k }, uColor: { value: new THREE.Color(RECON.ambre).multiplyScalar(gain) } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying float vF;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vF = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uAmt, uLen, uK; uniform vec3 uColor;
      varying vec2 vUv; varying float vF;
      void main() {
        float down = 1.0 - vUv.y;
        float s = 0.5 + 0.5 * sin(vUv.x * 43.98 + 1.7 * sin(vUv.x * 18.85 + down * 3.0));
        float flow = 0.5 + 0.5 * sin(down * uLen * 0.22 - uTime * 6.0 + vUv.x * 12.566);
        float a = uAmt * uK * (0.45 + 0.55 * s * flow) * (0.3 + 0.7 * vF) * (1.0 - smoothstep(0.55, 1.0, down));
        if (a < 0.004) discard;
        gl_FragColor = vec4(uColor * (0.75 + 0.5 * s), clamp(a, 0.0, 0.92));
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function makeDrops(count, seed) {
  const rand = rng(seed);
  const o = new Float32Array(count * 3), vel = new Float32Array(count * 3), s = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    o[i * 3] = 0.6 + 6.4 * rand();
    o[i * 3 + 1] = YO - 0.5;
    o[i * 3 + 2] = PZ0 + 1 + (PS - 2) * rand();
    vel[i * 3] = -4 + 14 * rand();
    vel[i * 3 + 1] = -(28 + 30 * rand());
    vel[i * 3 + 2] = -9 + 18 * rand();
    s[i * 4] = rand();
    s[i * 4 + 1] = 0.75 + 0.4 * rand();
    s[i * 4 + 2] = 0.7 + 1.3 * rand();
    s[i * 4 + 3] = 0.5 + 0.5 * rand();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(o, 3));
  geo.setAttribute("aVel", new THREE.BufferAttribute(vel, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(s, 4));
  const u = { uTime: { value: 0 }, uAmt: { value: 0 }, uPx: { value: 1000 }, uColor: { value: new THREE.Color(RECON.ambre).multiplyScalar(1.15) } };
  const mat = new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: /* glsl */ `
      uniform float uTime, uAmt, uPx; attribute vec3 aVel; attribute vec4 aSeed; varying float vA;
      void main() {
        float life = aSeed.y;
        float fr = fract(uTime / life + aSeed.x);
        float age = fr * life;
        vec3 p = position + aVel * age + vec3(0.0, -45.0 * age * age, 0.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = clamp(aSeed.z * uPx / max(1.0, -mv.z), 0.0, 40.0);
        gl_Position = projectionMatrix * mv;
        vA = uAmt * aSeed.w * smoothstep(0.0, 0.06, fr) * (1.0 - smoothstep(0.75, 1.0, fr)) * step(0.6, p.y);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float r2 = dot(q, q) * 4.0;
        if (r2 > 1.0 || vA < 0.003) discard;
        gl_FragColor = vec4(uColor * (1.0 + 0.3 * (1.0 - r2)), clamp(vA * (1.0 - r2 * r2), 0.0, 1.0));
      }`,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 6;
  return { points, u };
}

/* ───────── the tyre piece ───────── */
function buildDebris(rubber, cordMat) {
  // a torn arc of the tread: an annular sector of the tyre (outer radius ≈ 1.19 m / 2 at 1:2), extruded across its width; the tread
  // (convex) face up — it is the convex middle that strikes the skin first; torn ends, steel cords out of one of them
  const g = new THREE.Group();
  const rand = rng(52);
  const W = DEBRIS.size[2] * 1.35; // ≈ 16 across: the tyre's width (magnified ≈ 1.35 so that the projectile reads)
  const R1 = 30, R0 = 27.4, half = 0.4;
  const V = (a, r) => new THREE.Vector2(Math.sin(a) * r, Math.cos(a) * r - R1);
  const pts = [];
  for (let i = 0; i <= 16; i++) pts.push(V(-half + (2 * half * i) / 16, R1));
  for (const k of [0.25, 0.55, 0.8]) pts.push(V(half + 0.05 * (rand() - 0.35) - 0.03 * k, R1 - (R1 - R0) * k));
  for (let i = 16; i >= 0; i--) pts.push(V(-half + 0.04 + ((2 * half - 0.07) * i) / 16, R0));
  for (const k of [0.8, 0.5, 0.2]) pts.push(V(-half - 0.05 * (rand() - 0.3) + 0.02 * k, R1 - (R1 - R0) * k));
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: W, bevelEnabled: false, curveSegments: 1 }).translate(0, 0, -W / 2);
  const c = new THREE.Mesh(geo, rubber);
  c.castShadow = true; // never receives: under the wing it would sit in the bay's shadow, dark on dark
  c.add(clayEdges(geo, { opacity: 0.55, threshold: 50 }));
  g.add(c);
  // the tread: three circumferential ribs standing on the arc
  for (const z of [-4.6, 0, 4.6]) {
    const rib = new THREE.ExtrudeGeometry(new THREE.Shape([...Array(13)].map((_, i) => V(-half + 0.06 + ((2 * half - 0.14) * i) / 12, R1 + 0.7)).concat([...Array(13)].map((_, i) => V(half - 0.08 - ((2 * half - 0.14) * i) / 12, R1 - 0.05)))), { depth: 2.6, bevelEnabled: false, curveSegments: 1 }).translate(0, 0, z - 1.3);
    const m = new THREE.Mesh(rib, rubber);
    m.castShadow = true;
    g.add(m);
  }
  // the steel cords out of the torn end (+x)
  const cord = new THREE.CylinderGeometry(0.13, 0.13, 1, 6).rotateZ(Math.PI / 2);
  const end = V(half, (R0 + R1) / 2);
  for (let k = 0; k < 6; k++) {
    const m = new THREE.Mesh(cord, cordMat);
    const len = 1.2 + 1.8 * rand();
    m.scale.set(len, 1, 1);
    m.position.set(end.x + len / 2 - 0.3, end.y, -W / 2 + 2.2 + ((W - 4.4) * k) / 5);
    m.rotation.z = -0.4 + 0.25 * rand();
    m.rotation.y = -0.25 + 0.5 * rand();
    g.add(m);
  }
  return g;
}

export function buildReservoir() {
  const group = new THREE.Group();
  const add = (geo, mat, [x, y, z] = [0, 0, 0], edges = true, parent = group) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    if (edges) m.add(clayEdges(geo));
    parent.add(m);
    return m;
  };

  /* materials: three values of grey — light skins, mid stringers, dark ribs; the panel its own (alarm) */
  const skinMat = clay({ tone: 0.5 });
  const lowMat = clay({ tone: 0.5 });
  const strMat = clay({ tone: 0.05 });
  const ribMat = clay({ tone: -0.45 });
  const rivMat = clay({ tone: 0.85 });
  const panelMat = alarm({ tone: 0.5 });
  const rubber = clay({ tone: -0.45, rough: 0.8, env: 0.7 });
  const cordMat = clay({ tone: 0.7 });
  const linerMat = clay({ tone: 0.9 });
  linerMat.map = weaveTexture();
  linerMat.transparent = true;
  linerMat.emissive = new THREE.Color(RECON.veille);
  linerMat.emissiveIntensity = 0;

  /* THE STRUCTURE */
  // the extrados (static)
  add(box(XD, SK, 2 * ZE, 0.2), skinMat, [XD / 2, YT + SK / 2, 0]);
  // the intrados: a deformable grid, the hole of the half panel cut in it (cells x 0 … 7.5, z 22.5 … 37.5)
  const intrados = makeSlab({ x0: 0, x1: XD, nx: 16, z0: -ZE, z1: ZE, nz: 98, top: Y0, thick: SK, hole: [0, 2, Math.round((PZ0 + ZE) / 1.25), Math.round((PZ1 + ZE) / 1.25)] });
  add(intrados.geo, lowMat, [0, 0, 0], false).frustumCulled = false;
  // the two ribs (I-section: web + flanges against both skins), the rear spar
  for (const s of [-1, 1]) {
    add(box(XD, YT - Y0, RIBT, 0.15), ribMat, [XD / 2, (Y0 + YT) / 2, s * RIB]);
    add(box(XD, 0.7, 4, 0.12), ribMat, [XD / 2, YT - 0.35, s * (RIB + RIBT / 2 - 2)]);
    add(box(XD, 0.7, 4, 0.12), ribMat, [XD / 2, Y0 + 0.35, s * (RIB + RIBT / 2 - 2)]);
  }
  add(box(RIBT, YT - Y0, 2 * RI, 0.15), ribMat, [XD - RIBT / 2, (Y0 + YT) / 2, 0]);
  // the stringers, seen end on in the cut: hanging from the extrados (static, edged) …
  const T = (y, s) => [
    [2.6, 0.5, y + s * 0.25],
    [0.6, 2.8, y + s * 1.9],
    [1.6, 0.5, y + s * 3.55],
  ];
  const topStr = [];
  for (const z of STRINGERS_TOP) for (const [w, h, y] of T(YT, -1)) topStr.push(box(SPAR, h, w, 0.08).translate(SPAR / 2, y, z));
  add(mergeGeometries(topStr), strMat);
  // … and standing on the intrados (they follow the dent)
  const lowStr = [];
  for (const z of STRINGERS_LOW) for (const [w, h, y] of T(Y0, 1)) lowStr.push(new THREE.BoxGeometry(SPAR, h, w, 16, 1, 1).translate(SPAR / 2, y, z));
  const lowStrF = follower(mergeGeometries(lowStr));
  add(lowStrF.geo, strMat, [0, 0, 0], false).frustumCulled = false;
  // rivets: rows under the low stringers (follow the dent), on top of the high ones
  const riv = new THREE.SphereGeometry(0.42, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.6, 1);
  const rivDown = riv.clone().rotateX(Math.PI);
  const RX = [];
  for (let i = 0; i < 16; i++) RX.push(1.9 + 3.75 * i);
  const lowRiv = new THREE.InstancedMesh(rivDown, rivMat, STRINGERS_LOW.length * RX.length);
  lowRiv.frustumCulled = false;
  group.add(lowRiv);
  const topRiv = new THREE.InstancedMesh(riv, rivMat, STRINGERS_TOP.length * RX.length);
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler();
  {
    let k = 0;
    for (const z of STRINGERS_TOP) for (const x of RX) topRiv.setMatrixAt(k++, _m.makeTranslation(x, Y1, z));
    topRiv.instanceMatrix.needsUpdate = true;
  }
  group.add(topRiv);

  /* THE PANEL (culprit 2): the lip of its hole, the half panel (its own group: it falls), its rivets */
  add(box(PX1, SK, 0.35, 0.06), panelMat, [PX1 / 2, YO + SK / 2, PZ0 + 0.175], false);
  add(box(PX1, SK, 0.35, 0.06), panelMat, [PX1 / 2, YO + SK / 2, PZ1 - 0.175], false);
  add(box(0.35, SK, PS, 0.06), panelMat, [PX1 - 0.175, YO + SK / 2, PZ], false);
  const panelG = new THREE.Group();
  const HOME = [0, YO + SK / 2, PZ];
  panelG.position.set(...HOME);
  group.add(panelG);
  const panel = makeSlab({ x0: 0, x1: PX1 - 0.5, nx: 6, z0: -PS / 2 + 0.5, z1: PS / 2 - 0.5, nz: 14, top: SK / 2, thick: SK });
  const panelMesh = add(panel.geo, panelMat, [0, 0, 0], false, panelG);
  panelMesh.frustumCulled = false;
  panelMesh.receiveShadow = false; // it falls under the bay: kept lit
  const PR = [];
  for (const x of [1.1, 3.0, 4.9]) PR.push([x, PZ0 + 1.2], [x, PZ1 - 1.2]);
  for (const z of [25.4, 28.0, 30.6, 33.2, 35.8]) PR.push([PX1 - 1.2, z]);
  const prand = rng(17);
  const PRV = PR.map(([x, z]) => {
    const dx = x - 1.5, dz = z - PZ, l = Math.hypot(dx, dz) || 1;
    return [dx / l + 0.4 * (prand() - 0.5), -0.5 - 0.6 * prand(), dz / l + 0.4 * (prand() - 0.5), 4 + 8 * prand()];
  });
  const panelRiv = new THREE.InstancedMesh(rivDown, rivMat, PR.length);
  panelRiv.frustumCulled = false;
  group.add(panelRiv);

  /* THE KEROSENE: one plane just behind the cut */
  const keroMat = keroMaterial();
  const kH = TOP + 0.6 - (YO - 3);
  const keroGeo = new THREE.PlaneGeometry(2 * RI, kH, 1, 1).rotateY(-Math.PI / 2).translate(0.4, YO - 3 + kH / 2, 0);
  const kero = new THREE.Mesh(keroGeo, keroMat);
  kero.renderOrder = 1;
  group.add(kero);

  /* THE TYRE PIECE */
  const debris = buildDebris(rubber, cordMat);
  group.add(debris);

  /* THE GUSH: a jet, a spray, drops */
  const jetIn = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 6.5, 1, 28, 8, true).translate(0, -0.5, 0), jetMaterial(0.7, 1.1));
  const jetOut = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 14, 1, 28, 8, true).translate(0, -0.5, 0), jetMaterial(0.16, 0.8));
  for (const j of [jetIn, jetOut]) {
    j.position.set(3.6, YO - 0.3, PZ);
    j.renderOrder = 5;
    j.frustumCulled = false;
    group.add(j);
  }
  jetOut.rotation.z = -0.06;
  const JETS = [jetIn, jetOut];
  const drops = makeDrops(120, 31);
  group.add(drops.points);

  /* THE KEVLAR LINER (depuis): bottom (deformable), top, the two ribs */
  const liner = new THREE.Group();
  group.add(liner);
  const LT = 0.9;
  const linerLow = makeSlab({ x0: 0.15, x1: SPAR, nx: 16, z0: -RI, z1: RI, nz: 96, top: Y0 + LT, thick: LT, uvScale: 3 });
  add(linerLow.geo, linerMat, [0, 0, 0], false, liner).frustumCulled = false;
  const linerTop = add(planarUV(new THREE.BoxGeometry(SPAR - 0.15, LT, 2 * RI)), linerMat, [0.15 + (SPAR - 0.15) / 2, YT - LT / 2, 0], false, liner);
  const linerRib = [-1, 1].map((s) => add(planarUV(new THREE.BoxGeometry(SPAR - 0.15, YT - Y0 - 2 * LT, LT)), linerMat, [0.15 + (SPAR - 0.15) / 2, (Y0 + YT) / 2, s * (RI - LT / 2)], false, liner));

  /* the anchors */
  const anchor = (x, y, z, parent = group) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };
  const A = {
    focus: anchor(XD / 2 - 10, (Y0 + Y1) / 2, 0),
    fault: anchor(PX1 / 2, 0, 0, panelG),
    impact: anchor(0, YO, HZ),
    panel: anchor(PX1 / 2, YO + SK / 2, PZ),
    debris: anchor(0, 0, 0, debris),
    wave: anchor(0, Y0 + 4, HZ),
  };

  /* the deformations: rewritten only when their numbers change */
  const cur = { dent: -1, bulge: -1, kev: -1, open: -1 };
  const fSkin = (x, z) => dentD(x, z, cur.dent);
  const fPanel = (x, z) => -bulgeD(x, z + PZ, cur.bulge);
  const fLiner = (x, z) => dentD(x, z, cur.dent) - bulgeD(x, z, cur.bulge) + (1 - cur.kev) * 4;
  function deform(dent, bulge, kev, open) {
    const dDent = dent !== cur.dent, dBul = bulge !== cur.bulge, dKev = kev !== cur.kev, dOpen = open !== cur.open;
    cur.dent = dent; cur.bulge = bulge; cur.kev = kev; cur.open = open;
    if (dDent) {
      intrados.write(fSkin);
      lowStrF.write(fSkin);
      let k = 0;
      for (const z of STRINGERS_LOW) for (const x of RX) lowRiv.setMatrixAt(k++, _m.makeTranslation(x, YO + dentD(x, z, dent), z));
      lowRiv.instanceMatrix.needsUpdate = true;
    }
    if (dBul) panel.write(fPanel);
    if ((dDent || dBul || dKev) && kev > 0.004) linerLow.write(fLiner);
    if (dOpen) {
      // the panel's rivets jump as it tears, scatter and vanish
      const k = smooth(0, 0.55, open);
      for (let i = 0; i < PR.length; i++) {
        const [x, z] = PR[i];
        const v = PRV[i], vx = v[0], vy = v[1], vz = v[2], spin = v[3];
        _p.set(x + vx * 14 * k, YO + vy * 14 * k - 34 * k * k, z + vz * 14 * k);
        _q.setFromEuler(_e.set(spin * k, 0, spin * 0.6 * k));
        const sc = 1 - smooth(0.7, 1, k);
        _s.set(sc, sc, sc);
        panelRiv.setMatrixAt(i, _m.compose(_p, _q, _s));
      }
      panelRiv.instanceMatrix.needsUpdate = true;
    }
  }

  const cy0 = YO; // the piece's top face rides the skin's outer face at its footprint
  return {
    group,
    A,
    haloR: 24,
    update(S, time, px) {
      const c = Math.round(S.culprit ?? 0);
      setAlarm(panelMat, c === CULPRIT.tank5 ? S.fault ?? 0 : 0);
      heal(panelMat, S.depuis ?? 0);
      const hit = clamp01(S.hit), dent = clamp01(S.dent), wave = clamp01(S.wave), bulge = clamp01(S.bulge), kev = clamp01(S.kevlar);
      const open = clamp01(S.tear) * (1 - kev);
      const gushK = clamp01(S.gush) * smooth(0.12, 0.5, open);
      deform(dent, bulge, kev, open);

      // the tyre piece: in from low left, tumbling; flat on the dent at hit 1; drops to the floor as the front goes
      debris.visible = hit > 0.004;
      if (debris.visible) {
        const e = hit;
        const cy = cy0 + dentD(0, HZ, dent) * 0.92;
        const fall = smooth(0.04, 0.8, wave);
        const fy = fall * fall;
        debris.position.set(FROM[0] + (0 - FROM[0]) * e - 8 * fall, FROM[1] + (cy - FROM[1]) * e, FROM[2] + (HZ - FROM[2]) * e - 6 * fall);
        debris.position.y -= (cy - 2.2) * fy;
        const sp = 1 - e;
        debris.rotation.set(sp * 1.6 + 0.5 * Math.sin(Math.PI * fall), sp * 0.8 + 0.25, sp * 4.2 + 0.35 * Math.sin(Math.PI * fall));
      }

      // the panel: domes (its grid), then drops and turns over, dome up on the floor
      panelG.position.set(HOME[0] - 10 * open, HOME[1] - (HOME[1] - 0.75) * Math.pow(open, 1.7), HOME[2] + 10 * open);
      panelG.rotation.set(Math.PI * smooth(0.05, 1, open), 0, 0.5 * Math.sin(Math.PI * open));

      // the kerosene and the front
      const u = keroMat.uniforms;
      u.uTime.value = time;
      u.uR.value = wave * REACH;
      u.uOn.value = smooth(0, 0.04, wave) * (1 - smooth(0.9, 1, wave));
      u.uDent.value = dent;
      u.uBulge.value = bulge;
      u.uOpen.value = open;
      u.uKero.value = S.kero ?? 1;
      u.uKev.value = smooth(0, 1, kev);
      u.uArrive.value = smooth(0.8, 0.95, wave) * (1 - smooth(0.96, 1, wave));
      u.uPress.value = 0.15 * bulge * (1 - smooth(0, 0.3, open)) * (1 - 0.5 * kev);
      A.wave.position.set(0, Y0 + 4, HZ + Math.min(REACH, wave * REACH));

      // the gush
      const L = 66 * Math.min(1, gushK * 1.4);
      for (let i = 0; i < 2; i++) {
        const j = JETS[i];
        j.visible = gushK > 0.005;
        j.scale.y = Math.max(0.01, L);
        j.material.uniforms.uTime.value = time;
        j.material.uniforms.uAmt.value = gushK;
        j.material.uniforms.uLen.value = L;
      }
      drops.points.visible = gushK > 0.005;
      drops.u.uTime.value = time;
      drops.u.uAmt.value = gushK;
      drops.u.uPx.value = px ?? 1000;

      // the liner settles against the walls
      const e = smooth(0, 1, kev);
      liner.visible = kev > 0.004;
      linerMat.opacity = Math.min(1, kev * 1.6);
      linerMat.emissiveIntensity = 0.5 * clamp01(S.depuis) * e;
      linerTop.position.y = YT - LT / 2 - (1 - e) * 4;
      linerRib[0].position.z = -(RI - LT / 2) + (1 - e) * 4;
      linerRib[1].position.z = RI - LT / 2 - (1 - e) * 4;
    },
  };
}
