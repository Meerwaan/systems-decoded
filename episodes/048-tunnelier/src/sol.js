// DOSSIER 048 — Tunnelier : the GROUND, seen like an X-ray — the block of soil under the street, cut along its near
// face (z = GROUND.z1), the water table, the tunnel already lined behind the machine, the soil's face at the
// cutterhead, the column that loosens above it, the depth scale. plan.js coordinates (sol.js owns y −60 → −3000).
//
//   buildGround() → { group, A, update(p, time, px) }
//   A       anchors (Object3D): face · faceTop · water · scale · scaleTen · lining · loose
//   update  p = { soil, face, loose, water, depth, tunnel, rams }
//     soil    the X-ray of the block: its glass, its edges, the strata's lines (0–1)
//     face    the soil's face at the cutterhead: 0 it stands · → 1 it slides toward the head in blocks (face loss:
//             blocks detach under the crown and slip toward the head) · → −1 it is pushed back (too much pressure)
//     loose   the column that loosens above the face, a signal wash rising from the crown toward the road (0–1):
//             soil that relaxes, NEVER a void, NEVER a collapse reaching the street
//     water   the water table: its level line, its ▽ and the slow ink dashes of the water in the soil (0–1)
//     depth   the depth scale down the section's face: a tick every 10 m, NO figure (the chip says the rule) (0–1)
//     tunnel  the tunnel already lined behind the machine: its rings of glass (0–1)
//     rams    model.js's thrust stroke (0–1): the cutterhead moves −x by TBM.rams.stroke × rams, the face with it
//
// What reads, and why (docs/048-decors.md): the soil is the machine's BACKGROUND — dark and fine. Nothing here is a
// solid slab: the block is a glass box with fine edges, its cut face a drawing (strata, grain, the water) whose lines
// stop wherever they would cross the machine or the tunnel (a ray test toward the tunnel's axis), so the solid
// machine always reads clean through it. The only solids are the few blocks of earth at the crown of the face (the
// same brown as the chamber's earth) and the grains that run from them. The loosened column is light (≤ 0.3,
// additive), a bell resting on the crown, its front climbing — soil that relaxes, never a void. Everything moves by
// decimetres at most: the contre-vérification (docs/faits/048-contre-verification.md) holds for the image.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, edgesOf, glow, solid, lineMat, box, anchor } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { GROUND, TBM, TROUGH } from "./plan.js";

const G = GROUND;
const AY = TBM.axisY;
const R = TBM.r;
const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ───────────────────────── the cut face: strata, grain, water — a drawing, masked around the machine ───────────────────────── */
function makeSectionFace() {
  const w = G.x1 - G.x0;
  const h = G.top - G.bottom;
  const geo = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uInk: { value: INK.clone() },
      uSoil: { value: 1 }, uWater: { value: 1 }, uTime: { value: 0 },
      uAY: { value: AY }, uR: { value: R + 4 }, uX0: { value: 0 }, uX1: { value: TBM.ring.x1 }, uXEnd: { value: G.x1 },
      uLayers: { value: new THREE.Vector4(...G.layers) },
      uWaterY: { value: G.water }, uSymX: { value: G.scale.x + 260 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform vec4 uLayers;
      uniform float uSoil, uWater, uTime, uAY, uR, uX0, uX1, uXEnd, uWaterY, uSymX;
      varying vec3 vW;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      // a line w pixels wide along d = 0 (d in cm): never thinner than the pixel, never aliased
      float lineAA(float d, float w) { float fw = max(fwidth(d), 1e-4); return clamp(0.5 * w - abs(d) / fw + 0.5, 0.0, 1.0); }
      float strokeAA(float d, float w, float pxs) { return clamp(0.5 * w - d / pxs + 0.5, 0.0, 1.0); }
      float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
      // the strata undulate gently (illustrative geology: no names)
      float wav(float x, float k) { return 26.0 * sin(x * 0.0019 + k * 1.7) + 13.0 * sin(x * 0.0047 + k * 2.9) + 5.0 * sin(x * 0.013 + k * 0.7); }
      void main() {
        if (uSoil < 0.003) discard;
        float x = vW.x, y = vW.y;
        // does the eye's ray through this point meet the machine or the lining (a cylinder along x)? then no line here
        vec3 D = vW - cameraPosition;
        vec2 c = cameraPosition.yz - vec2(uAY, 0.0);
        float t = max(-dot(c, D.yz) / max(dot(D.yz, D.yz), 1e-2), 0.0);
        vec3 P = cameraPosition + t * D;
        float rr = length(P.yz - vec2(uAY, 0.0));
        float around = 1.0 - smoothstep(uR * 0.97, uR * 1.14, rr);
        float inMachine = smoothstep(uX0 - 90.0, uX0 - 20.0, P.x) * (1.0 - smoothstep(uX1 - 20.0, uX1 + 40.0, P.x));
        float inLining = smoothstep(uX1 - 20.0, uX1 + 40.0, P.x) * (1.0 - smoothstep(uXEnd - 40.0, uXEnd, P.x));
        float keep = 1.0 - around * (0.92 * inMachine + 0.6 * inLining);

        // the strata's lines, and which layer this point is in
        float strata = 0.0, layer = 0.0;
        for (int k = 0; k < 4; k++) {
          float yk = uLayers[k] + wav(x, float(k));
          strata += lineAA(y - yk, 2.0);
          layer += step(y, yk);
        }
        // each layer its grain: dots (the marl in flat lenses) that dissolve before they get a few pixels small
        float cell = layer < 0.5 ? 26.0 : layer < 1.5 ? 44.0 : layer < 2.5 ? 60.0 : layer < 3.5 ? 50.0 : 78.0;
        vec2 st = (layer > 1.5 && layer < 2.5) ? vec2(3.2, 1.0) : vec2(1.0);
        vec2 q = vec2(x, y) / (cell * st);
        vec2 id = floor(q) + layer * 17.0;
        vec2 f = fract(q) - 0.5;
        float hh = hash(id);
        vec2 o = (vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5) * 0.5;
        float dist = length((f - o) * st) * cell;
        float rad = cell * (0.06 + 0.05 * hh);
        float fwd = max(fwidth(dist), 1e-3);
        float dotv = (1.0 - smoothstep(rad - fwd, rad + fwd, dist)) * step(0.3, hh);
        float pxs = max(max(fwidth(x), fwidth(y)), 1e-3);
        float grain = dotv * smoothstep(8.0, 18.0, cell / pxs);

        // the water table: its line, its ▽, and below it slow dashes — water in the soil
        float wl = lineAA(y - uWaterY, 2.6);
        vec2 ps = vec2(x - uSymX, y - uWaterY);
        float sym = strokeAA(min(min(seg(ps, vec2(-34.0, 60.0), vec2(34.0, 60.0)), seg(ps, vec2(34.0, 60.0), vec2(0.0, 6.0))), seg(ps, vec2(0.0, 6.0), vec2(-34.0, 60.0))), 2.4, pxs);
        sym = max(sym, strokeAA(min(seg(ps, vec2(-24.0, -18.0), vec2(24.0, -18.0)), seg(ps, vec2(-12.0, -36.0), vec2(12.0, -36.0))), 2.2, pxs));
        float below = uWaterY - y;
        float q2 = below / 72.0;
        float row = floor(q2);
        float dy = (fract(q2) - 0.5) * 72.0;
        float hr = hash(vec2(row, 4.2));
        float ph = (x + uTime * (5.0 + 3.0 * hr) + hr * 300.0) / 120.0;
        float dl = abs(fract(ph) - 0.5) * 120.0;
        float fwx = max(fwidth(x), 1e-3);
        float dash = lineAA(dy, 2.0) * (1.0 - smoothstep(20.0 - fwx, 20.0 + fwx, dl));
        dash *= step(0.0, row) * exp(-below / 520.0) * smoothstep(6.0, 14.0, 120.0 / fwx);

        float soil = (strata * 0.3 + grain * 0.08) * uSoil;
        float water = (wl * 0.5 + sym * 0.6 + dash * 0.3) * uWater * uSoil;
        gl_FragColor = vec4(uInk * (soil + water) * keep, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((G.x0 + G.x1) / 2, (G.top + G.bottom) / 2, G.z1 + 0.5);
  mesh.renderOrder = 6; // before every shell's depth hold: nothing hides it but the solids
  return { mesh, mat };
}

/* ───────────────────────── the loosened column: a bell of light resting on the crown ───────────────────────── */
const COL = {
  yTop: G.top - 12,
  cx: [(G.loose.x0 + G.loose.x1) / 2, (G.loose.x0 + G.loose.x1) / 2 * 0.4 + TROUGH.x * 0.6],
  hx: [(G.loose.x1 - G.loose.x0) / 2, G.loose.topWidth / 2],
  hz: [400, 600],
};
const colAt = (s) => {
  const k = Math.pow(s, 1.4);
  return { cx: COL.cx[0] + (COL.cx[1] - COL.cx[0]) * s, hx: COL.hx[0] + (COL.hx[1] - COL.hx[0]) * k, hz: COL.hz[0] + (COL.hz[1] - COL.hz[0]) * k };
};
const crownY = (z) => AY + Math.sqrt(Math.max(R * R - z * z, 0)) + 6;

function makeColumn() {
  const NA = 72, NS = 44;
  const pos = [], sAttr = [], idx = [];
  for (let j = 0; j <= NS; j++) {
    const s = j / NS;
    const c = colAt(s);
    for (let i = 0; i <= NA; i++) {
      const a = (i / NA) * Math.PI * 2;
      const yb = crownY(COL.hz[0] * Math.sin(a));
      pos.push(c.cx + c.hx * Math.cos(a), yb + (COL.yTop - yb) * s, c.hz * Math.sin(a));
      sAttr.push(s);
    }
  }
  for (let j = 0; j < NS; j++)
    for (let i = 0; i < NA; i++) {
      const a = j * (NA + 1) + i, b = a + NA + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aS", new THREE.Float32BufferAttribute(sAttr, 1));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: SIGNAL.clone() }, uFront: { value: 0.5 }, uAmt: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aS; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        vS = aS;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uFront, uAmt; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        if (uAmt < 0.003) discard;
        float facing = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        // a volume, not a cup: what faces the eye carries the light (the depth of glowing soil behind it), the flanks fade
        float vol = pow(facing, 1.3);
        float body = 1.0 - smoothstep(uFront - 0.03, uFront + 0.07, vS);
        float dens = 0.35 + 0.65 * clamp(1.0 - vS / max(uFront, 0.05), 0.0, 1.0); // densest at the crown
        float crest = exp(-pow((vS - uFront) / 0.055, 2.0)) * smoothstep(0.02, 0.1, uFront);
        float I = (body * dens * 0.06 + crest * 0.08) * vol;
        gl_FragColor = vec4(uColor * I * uAmt, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 5;
  return { mesh, mat };
}

/* ───────────────────────── the lining: rings of glass, their joints, the rails and the conveyor ───────────────────────── */
function makeLining() {
  const L = G.lining;
  const rO = TBM.ring.rOut;
  const group = new THREE.Group();
  const len = L.x1 - L.x0;
  const tubeGeo = new THREE.CylinderGeometry(rO, rO, len, 96, 1, true).rotateZ(-Math.PI / 2);
  const tubeMat = glass(BRAND.ink, { base: 0, rim: 0.2, power: 2.6, edge: 0.3, through: 0.25 });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.position.set((L.x0 + L.x1) / 2, AY, 0);
  asShell([tube], 24);
  group.add(tube);

  // the joints: a circle at every ring, seven longitudinal joints per ring, staggered from one ring to the next;
  // they dim with the distance from the machine (additive: dark = gone), so the far rings never clump into a slab
  const pos = [], col = [];
  const fade = (x) => 0.16 + 0.84 * Math.exp(-(x - L.x0) / 1500);
  const seg = (a, b, ka, kb) => {
    pos.push(...a, ...b);
    col.push(ka, ka, ka, kb, kb, kb);
  };
  const N = 64;
  const n = Math.round(len / L.width);
  for (let k = 0; k <= n; k++) {
    const x = L.x0 + k * L.width;
    const kx = fade(x);
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
      seg([x, AY + rO * Math.cos(a0), rO * Math.sin(a0)], [x, AY + rO * Math.cos(a1), rO * Math.sin(a1)], kx, kx);
    }
    if (k === n) break;
    for (let j = 0; j < TBM.ring.segments; j++) {
      const a = ((j + (k % 2) * 0.5) / TBM.ring.segments) * Math.PI * 2 + 0.2;
      const p = [AY + rO * Math.cos(a), rO * Math.sin(a)];
      seg([x, p[0], p[1]], [x + L.width, p[0], p[1]], 0.6 * kx, 0.6 * fade(x + L.width));
    }
  }
  // the track on the invert, the belt conveyor hung on the far wall, its brackets every two rings
  const yT = AY - TBM.ring.rIn + 70;
  for (const z of [-72, 72]) for (let x = L.x0; x < L.x1; x += 360) seg([x, yT, z], [x + 360, yT, z], 0.7 * fade(x), 0.7 * fade(x + 360));
  const zC = -330, yC = AY + 30;
  for (let x = L.x0; x < L.x1; x += 360) {
    seg([x, yC, zC], [x + 360, yC, zC], 0.6 * fade(x), 0.6 * fade(x + 360));
    seg([x, yC - 22, zC], [x + 360, yC - 22, zC], 0.45 * fade(x), 0.45 * fade(x + 360));
    seg([x, yC - 22, zC], [x, yC - 70, zC - 70], 0.45 * fade(x), 0.45 * fade(x));
  }
  const lg = new LineSegmentsGeometry();
  lg.setPositions(pos);
  lg.setColors(col);
  const jointMat = lineMat(BRAND.ink, 1.8, { vertexColors: true, additive: true, opacity: 0.7 });
  const joints = new LineSegments2(lg, jointMat);
  joints.renderOrder = 3;
  group.add(joints);
  return { group, tubeMat, jointMat };
}

/* ───────────────────────── the depth scale: a thread drawn from the road down, a tick every 10 m, no figure ───────────────────────── */
function makeScale() {
  const S = G.scale;
  const group = new THREE.Group();
  group.position.set(S.x, 0, S.z + 1.5);
  const spineMat = glow(BRAND.ink, 0.75, { opacity: 0 });
  const span = S.from - S.to;
  const spine = new THREE.Mesh(new THREE.BoxGeometry(4, span, 2).translate(0, -span / 2, 0), spineMat);
  spine.position.y = S.from;
  group.add(spine);
  const ticks = [];
  for (let y = S.from; y >= S.to; y -= S.step) {
    const m = glow(BRAND.ink, 0.95, { opacity: 0 });
    const t = new THREE.Mesh(new THREE.BoxGeometry(170, 6, 2).translate(35, 0, 0), m);
    t.position.y = y;
    t.userData.k = (S.from - y) / span; // where the thread reaches it
    group.add(t);
    ticks.push(t);
  }
  return { group, spine, spineMat, ticks, span };
}

/* ───────────────────────── the face: blocks of earth at the crown, and the grains that run from them ───────────────────────── */
function makeFace() {
  const group = new THREE.Group(); // at x = the cutterhead's face (it follows the rams' stroke)
  const rand = rng(48);
  const blocks = [];
  // the wall itself: a thin slab of glass the size of the bore — two bright lines in profile, a faint disc face-on
  const slabMat = glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.4, edge: 0.4 });
  const slab = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 36, 96, 1).rotateZ(Math.PI / 2), slabMat);
  slab.position.set(-19, AY, 0);
  slab.renderOrder = 7;
  group.add(slab);
  const bands = [
    { r0: 408, r1: 489, t: 52, n: 8 },
    { r0: 326, r1: 405, t: 40, n: 6 },
  ];
  bands.forEach((b, bi) => {
    // cells of uneven widths along the band: a cracked wall, not a row of tiles
    const wts = Array.from({ length: b.n }, () => 0.6 + rand() * 0.8);
    const sum = wts.reduce((a, v) => a + v, 0);
    let acc = 0;
    for (let i = 0; i < b.n; i++) {
      const span = (wts[i] / sum) * 2 * b.t;
      const th = (-b.t + acc + span / 2) * DEG;
      acc += span;
      const rho = (b.r0 + b.r1) / 2 + (rand() - 0.5) * 12;
      const arc = span * DEG * rho;
      const thick = 22 + rand() * 22;
      // tight at rest (a wall with its cracks), each block a little skewed: earth, not bricks
      const geo = box(thick, (b.r1 - b.r0) * (0.92 + rand() * 0.05), arc * (0.9 + rand() * 0.06), 6);
      geo.applyMatrix4(new THREE.Matrix4().makeShear(0, 0, (rand() - 0.5) * 0.2, (rand() - 0.5) * 0.25, 0, (rand() - 0.5) * 0.2));
      const tone = [0x57473a, 0x4b3d32, 0x5f4d3e][Math.floor(rand() * 3)];
      const mat = solid(tone, { rough: 0.95 });
      mat.userData.finish = false; // earth: no machining grain
      mat.emissive = SIGNAL.clone(); // a block that lets go glows faintly signal: the threat, read at 270 px
      mat.emissiveIntensity = 0;
      const mesh = new THREE.Mesh(geo, mat);
      const edges = edgesOf(geo, { color: BRAND.ink, width: 1.8, opacity: 0.3 });
      mesh.add(edges);
      const pivot = new THREE.Group();
      pivot.add(mesh);
      const base = { x: -thick / 2 - 4, y: AY + rho * Math.cos(th), z: rho * Math.sin(th), rx: th + (rand() - 0.5) * 0.06, ry: (rand() - 0.5) * 0.08, rz: (rand() - 0.5) * 0.06 };
      pivot.position.set(base.x, base.y, base.z);
      pivot.rotation.set(base.rx, base.ry, base.rz);
      group.add(pivot);
      blocks.push({
        pivot, mat, edges, base,
        delay: clamp01(0.55 * (Math.abs(th) / (60 * DEG)) + 0.28 * bi + 0.14 * rand()),
        dx: 16 + rand() * 18, dy: (22 + rand() * 34) * (1 - 0.25 * bi), tilt: (7 + rand() * 9) * DEG,
      });
    }
  });

  // the grains: short streaks of earth running down in front of the head (the 16 sub-frames blur them into trails)
  const NG = 60;
  const grainMat = solid(0x8a7058, { rough: 0.9 });
  grainMat.userData.finish = false;
  const grains = new THREE.InstancedMesh(new THREE.BoxGeometry(7, 1, 7), grainMat, NG);
  grains.frustumCulled = false;
  const gs = [];
  for (let i = 0; i < NG; i++) {
    const th = (rand() - 0.5) * 100 * DEG;
    const rho = 300 + rand() * 170;
    gs.push({ x: -8 - rand() * 14, y0: AY + rho * Math.cos(th) - 40, z: rho * Math.sin(th), L: 140 + rand() * 160, T: 1.3 + rand() * 0.8, ph: rand(), on: rand() });
  }
  group.add(grains);
  return { group, blocks, grains, gs, slabMat };
}

/* ───────────────────────── motes in the column: the relaxed soil easing down, slowly ───────────────────────── */
function makeMotes() {
  const NM = 64;
  const rand = rng(4801);
  const mat = glow(BRAND.signal, 1.6, { additive: true });
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(4, 22, 4), mat, NM);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  const ms = [];
  for (let i = 0; i < NM; i++) ms.push({ s0: rand(), a: rand() * Math.PI * 2, rr: Math.sqrt(rand()) * 0.85, v: 0.008 + rand() * 0.008 });
  mesh.setColorAt(0, new THREE.Color(0, 0, 0));
  return { mesh, ms };
}

export function buildGround() {
  const group = new THREE.Group();

  /* the block of soil: a glass box that barely shows (the drawing on its cut face says what it is), its fine edges */
  const w = G.x1 - G.x0, h = G.top - G.bottom, d = G.z1 - G.z0;
  const blockGeo = new THREE.BoxGeometry(w, h, d);
  const blockMat = glass(BRAND.ink, { base: 0, rim: 0.04, power: 4 });
  const block = new THREE.Mesh(blockGeo, blockMat);
  block.position.set((G.x0 + G.x1) / 2, (G.top + G.bottom) / 2, (G.z0 + G.z1) / 2);
  asShell([block], 60); // last of the shells: it hides no glass drawn before it (the street's, the lining's)
  const blockLines = edgesOf(blockGeo, { color: BRAND.ink, width: 1.8, opacity: 0.3 });
  block.add(blockLines);
  group.add(block);

  const section = makeSectionFace();
  group.add(section.mesh);
  const column = makeColumn();
  group.add(column.mesh);
  const motes = makeMotes();
  group.add(motes.mesh);
  const lining = makeLining();
  group.add(lining.group);
  const scale = makeScale();
  group.add(scale.group);
  const face = makeFace();
  group.add(face.group);

  const A = {
    face: anchor(face.group, -20, AY, 0),
    faceTop: anchor(face.group, -20, AY + R, 0),
    water: anchor(group, G.scale.x + 260, G.water, G.z1),
    scale: anchor(group, G.scale.x, -1000, G.scale.z),
    scaleTen: anchor(group, G.scale.x + 120, -1000, G.scale.z),
    lining: anchor(group, 2400, AY + TBM.ring.rOut, 0),
    loose: anchor(group, COL.cx[0], (AY + R + G.top) / 2, 0),
  };

  // what update moves, allocated once
  const m4 = new THREE.Matrix4();
  const tint = new THREE.Color();
  const zero = new THREE.Matrix4().makeScale(0, 0, 0);

  return {
    group, A,
    update(p = {}, time = 0, px = 1) {
      void px;
      const soil = clamp01(p.soil ?? 1);
      const fF = Math.max(-1, Math.min(1, p.face ?? 0));
      const lo = clamp01(p.loose ?? 0);
      const wa = clamp01(p.water ?? 0);
      const de = clamp01(p.depth ?? 0);
      const tu = clamp01(p.tunnel ?? 1);
      const xF = -TBM.rams.stroke * clamp01(p.rams ?? 0);

      /* the block and its cut face */
      blockMat.uniforms.uAmount.value = soil;
      block.visible = soil > 0.003;
      blockLines.material.opacity = 0.3 * soil;
      const U = section.mat.uniforms;
      U.uSoil.value = soil;
      U.uWater.value = wa;
      U.uTime.value = time;
      U.uX0.value = xF;
      section.mesh.visible = soil > 0.003;

      /* the face follows the head; its blocks slide toward it (face > 0) or are pushed back a hair (face < 0) */
      face.group.position.x = xF;
      face.group.visible = soil > 0.003;
      face.slabMat.uniforms.uAmount.value = soil;
      for (const b of face.blocks) {
        const u = fF > 0 ? smooth(0.55 * b.delay, 0.55 * b.delay + 0.45, fF) : 0;
        const back = fF < 0 ? -fF : 0;
        b.pivot.position.set(b.base.x + u * b.dx - back * 14, b.base.y - u * b.dy, b.base.z);
        b.pivot.rotation.set(b.base.rx, b.base.ry, b.base.rz - u * b.tilt);
        b.edges.material.color.copy(INK).lerp(SIGNAL, Math.max(u, back * 0.7));
        b.edges.material.opacity = (0.3 + 0.6 * Math.max(u, back)) * soil;
        b.mat.emissiveIntensity = 0.13 * Math.max(u, back * 0.6);
        b.mat.opacity = soil;
        b.mat.transparent = soil < 0.999;
      }
      for (let i = 0; i < face.gs.length; i++) {
        const g = face.gs[i];
        const act = fF > 0 ? smooth(g.on * 0.8, g.on * 0.8 + 0.25, fF) : 0;
        if (act < 0.01 || soil < 0.01) {
          face.grains.setMatrixAt(i, zero);
          continue;
        }
        const k = (time / g.T + g.ph) % 1;
        const len = (10 + 40 * k) * act * Math.sin(Math.PI * Math.min(k * 1.15, 1));
        m4.makeScale(act, Math.max(len, 0.001), act);
        m4.setPosition(g.x, g.y0 - g.L * k * k, g.z);
        face.grains.setMatrixAt(i, m4);
      }
      face.grains.instanceMatrix.needsUpdate = true;

      /* the loosened column: its front climbs from the crown toward the road with `loose` */
      const amt = smooth(0, 0.06, lo) * soil;
      column.mat.uniforms.uFront.value = lo;
      column.mat.uniforms.uAmt.value = amt;
      column.mesh.visible = amt > 0.003;
      motes.mesh.visible = amt > 0.003;
      if (motes.mesh.visible) {
        for (let i = 0; i < motes.ms.length; i++) {
          const m = motes.ms[i];
          const s = (((m.s0 - time * m.v) % 1) + 1) % 1;
          const k = smooth(lo, lo - 0.1, s) * smooth(0, 0.05, s) * amt;
          if (k < 0.01) {
            motes.mesh.setMatrixAt(i, zero);
            continue;
          }
          const c = colAt(s);
          const yb = crownY(COL.hz[0] * Math.sin(m.a) * m.rr);
          m4.makeScale(1, 1, 1);
          m4.setPosition(c.cx + c.hx * m.rr * Math.cos(m.a), yb + (COL.yTop - yb) * s, c.hz * m.rr * Math.sin(m.a));
          motes.mesh.setMatrixAt(i, m4);
          motes.mesh.setColorAt(i, tint.setScalar(0.32 * k));
        }
        motes.mesh.instanceMatrix.needsUpdate = true;
        motes.mesh.instanceColor.needsUpdate = true;
      }

      /* the depth scale: the thread is drawn from the road down; each tick lights as it is reached */
      scale.group.visible = de > 0.003 && soil > 0.003;
      scale.spine.scale.y = Math.max(de, 0.001);
      scale.spineMat.opacity = smooth(0, 0.1, de) * soil;
      for (const t of scale.ticks) {
        const k = smooth(t.userData.k * 0.92, t.userData.k * 0.92 + 0.08, de);
        t.scale.x = Math.max(k, 0.001);
        t.material.opacity = k * soil;
      }

      /* the lining */
      lining.group.visible = tu > 0.003 && soil > 0.003;
      lining.tubeMat.uniforms.uAmount.value = tu * soil;
      lining.jointMat.opacity = 0.7 * tu * soil;
    },
  };
}
