// DOSSIER L03 — the decorator's file: the life of the places (docs/recette-decorateur.md). Nothing here is a system,
// nothing stands in front of one, nothing is solid, everything is ink. Journal: docs/journal/L03-habillage.md.
//
//   dressPiste()  → { group, update({ amount, site, fire, run }, time, px) }   the outside
//   dressCabine() → { group, update({ layout, lights, smoke, cut }, time, px) } the inside
//
// THE OUTSIDE — what the bare runway did not have:
//   · HANEDA LIVES AROUND IT (site 0). Runway 34R runs north-north-west (the nose, −x): on its right (−z, where most
//     shots look past the hull) lies Tokyo Bay — dark water, then the far shore of Chiba strung low on the horizon;
//     ahead and to the right, the towers of Odaiba and Shinagawa, a red-less obstruction light breathing slowly on the
//     tallest; on its left (+z) the terminals and the control tower. All of it pinned at the far plane (it is 7 to
//     20 km away: the camera's far plane is 4 km), dim, still — the runway's world, sliding with `run` like the runway.
//   · THE PARALLEL TAXIWAY (site 0): its two rows of edge lamps 200 m off on the bay side — the airfield's depth
//     behind the hull. They slide with `run` (wrapped by their pitch, as the runway's own lamps).
//   · THE RESCUE COMES (site 0): two crash tenders leave once the A350 has stopped (cue `stop`), come down that
//     taxiway, beacon breathing, headlights on, and park abreast of the plane; two more beacons stand far off. In the
//     plane's frame: they exist only from the stop until the loop (cue `toloop`), so a first frame outside (hook2,
//     hook3) never sees them and the loop stays exact.
//   · MANCHESTER'S MORNING (site 2): a few lights left on, far and dim; two fire tenders that come in once the 737 has
//     stopped (cue `thump` + 3.5 s) and park on the far side.
//   · THE APRON AT NIGHT (site 3): cones at the wingtips and the tail (a parked airliner), two floodlight heads high
//     over the stand, a baggage train parked by the terminal.
//   · THE HANGAR (site 1) stays as it is: dark, its emergency lights alone — that is the trial.
//
// THE INSIDE — what people leave when they run (wide A350, narrow 737):
//   · the safety card in every seat-back pocket (a magazine every few seats); the seat belts left open on the
//     cushions — both melt away where one row spans a few pixels, as the cabin's own rows do
//   · a few things dropped: blankets and pillows on seats (the A350 flew in from Sapporo at night), a cup on the floor,
//     a newspaper, and one phone lying face up under a seat, its screen still lit
//   · NEVER in an aisle (the floor line runs there), never near your seat or your bag (the bag shots, the thumbnail),
//     never in the 737's passage at the hatch. Outline plates (2 px rims) and faint glass; nothing under 1.8 px
//     (a plate smaller than 5 px on screen fades out), nothing that moves.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { lineMat } from "@kit/build3d.js";
import { PLANES, CAB, SMOKE, YOU, SITE } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const INK = new THREE.Color(BRAND.ink);

// the film's own moments (episode.json · cues): the rescue starts when the plane has stopped, and is gone at the loop
const CUE = (typeof window !== "undefined" && window.__EPISODE && window.__EPISODE.cues) || {};
const T_STOP = CUE.stop ?? 384.04; // « finit » : the A350 stops at Haneda
const T_THUMP = CUE.thump ?? 222.0; // « sourd » : the 737 aborts; it stops ≈ 3 s later
const T_LOOP = CUE.toloop ?? 530.54; // the cut back to the first frame
// SD_KIT='{"nodress":1}' npm run look …: the sets bare, for the before / after board
const BARE = typeof window !== "undefined" && !!(window.__SD_KIT && window.__SD_KIT.nodress);

/* ───────────────────────────────────────────────────────────── shaders */

/** Still points of light, at least 2.4 px; `pin` puts them on the far plane (they are kilometres beyond it). */
function pointsMat({ k = 1, fade = 1e7, near = 0, pin = false } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(k) }, uAmount: { value: 1 }, uFade: { value: fade }, uNear: { value: near }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uFade, uNear, uTime; attribute float aK; attribute float aPx; attribute float aBr; varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float dist = max(1.0, -mv.z);
        // an obstruction light breathes slowly (0.4 Hz), never blinks
        float br = 1.0 - aBr * (0.32 - 0.32 * sin(uTime * 2.5 + position.x * 0.0007));
        vA = aK * br * exp(-dist / max(uFade, 1.0)) * smoothstep(uNear, uNear * 1.6 + 1.0, dist) * step(0.0, -mv.z);
        vec4 p = projectionMatrix * mv;
        ${pin ? "p.z = p.w * 0.99995;" : ""}
        gl_Position = p;
        gl_PointSize = aPx;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vA;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float d = clamp(length(q) * 2.0, 0.0, 1.0);
        float a = (1.0 - d * d) * (1.0 - d * d);
        gl_FragColor = vec4(uColor * a * vA * uAmount, 1.0);
      }`,
  });
}
function pointCloud(list, mat, order) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(list.flatMap((p) => p.at), 3));
  geo.setAttribute("aK", new THREE.Float32BufferAttribute(list.map((p) => p.k), 1));
  geo.setAttribute("aPx", new THREE.Float32BufferAttribute(list.map((p) => p.px), 1));
  geo.setAttribute("aBr", new THREE.Float32BufferAttribute(list.map((p) => p.br ?? 0), 1));
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = order;
  return pts;
}

/** A light that has a place, facing the camera: a bright core and a long tail (as kit/lib/details.js · glow). */
const GLOW_QUAD = new THREE.PlaneGeometry(1, 1);
function glowMesh(size, k, order) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(k) }, uAmount: { value: 1 }, uSize: { value: size } },
    vertexShader: /* glsl */ `
      uniform float uSize; varying vec2 vQ;
      void main() {
        vQ = position.xy * 2.0;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vQ;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        float a = (0.85 * exp(-r2 * 60.0) + 0.3 * exp(-sqrt(r2) * 5.2)) * (1.0 - r2);
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(GLOW_QUAD, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
}

// how many pixels one step of `pitch` along the cabin (x) spans here (as cabine.js): the rows melt where it is small
const SPAN = /* glsl */ `
  float spanPx(vec3 w, float pitch) {
    vec4 a = projectionMatrix * viewMatrix * vec4(w, 1.0);
    vec4 b = projectionMatrix * viewMatrix * vec4(w + vec3(pitch, 0.0, 0.0), 1.0);
    if (a.w < 1.0 || b.w < 1.0) return 1e4;
    return length((b.xy / b.w - a.xy / a.w) * 0.5 * uView);
  }`;
// the smoke between the eye and this point (as cabine.js · smokeT): what lies in or behind the layer drowns
const SMOKE_T = /* glsl */ `
  float smokeT(vec3 w) {
    if (uSmoke.z <= 0.0) return 1.0;
    float a = min(cameraPosition.y, w.y);
    float b = max(cameraPosition.y, w.y);
    float inside = b - a < 0.01 ? step(uSmoke.x, a) * step(a, uSmoke.y) : clamp((min(b, uSmoke.y) - max(a, uSmoke.x)) / (b - a), 0.0, 1.0);
    return exp(-uSmoke.z * inside * length(w - cameraPosition));
  }`;
// what every cabin dressing fades by: the rows melting (`uPitch`), too close to the eye, too far, the smoke
const CABIN_FADE = /* glsl */ `
  float cabinFade(vec3 w) {
    float dist = length(w - cameraPosition);
    float f = smoothstep(uNear.x, uNear.y, dist) * (1.0 - smoothstep(uFar.x, uFar.y, dist));
    if (uPitch > 0.0) f *= smoothstep(7.0, 16.0, spanPx(w, uPitch));
    return f * smokeT(w);
  }`;
const CABIN_U = () => ({
  uAmount: { value: 1 },
  uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) },
  uSmoke: { value: new THREE.Vector3(1e4, 1e4, 0) },
  uNear: { value: new THREE.Vector2(110, 240) },
  uFar: { value: new THREE.Vector2(1300, 2400) },
  uPitch: { value: 0 },
});

/**
 * Flat things (a card, a strap, a newspaper): a quad that draws its own outline, about 2 px wide whatever its
 * distance, over a faint fill — and fades out entirely before it would be smaller than ~5 px (a dot that crawls).
 */
function plateMat({ k = 1, pitch = 0 } = {}) {
  const U = CABIN_U();
  U.uPitch.value = pitch;
  U.uColor = { value: INK.clone().multiplyScalar(k) };
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: U,
    vertexShader: /* glsl */ `
      uniform float uPitch; uniform vec2 uView, uNear, uFar; uniform vec3 uSmoke;
      attribute float aK; varying vec2 vUv; varying float vK;
      ${SPAN}
      ${SMOKE_T}
      ${CABIN_FADE}
      void main() {
        vUv = uv;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vK = aK * cabinFade(w.xyz);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount;
      varying vec2 vUv; varying float vK;
      void main() {
        vec2 fw = max(fwidth(vUv), vec2(1e-5));
        float ex = min(vUv.x, 1.0 - vUv.x) / fw.x;
        float ey = min(vUv.y, 1.0 - vUv.y) / fw.y;
        float rim = 1.0 - smoothstep(0.9, 2.1, min(ex, ey));
        float big = smoothstep(5.0, 12.0, min(1.0 / fw.x, 1.0 / fw.y)); // its smaller side on screen, in px
        float a = (0.4 * rim + 0.035) * big * vK;
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
}

/** Round things (a cup, a pillow, a blanket): faint glass, a rim where the surface turns away. */
function rimMat({ k = 1 } = {}) {
  const U = CABIN_U();
  U.uColor = { value: INK.clone().multiplyScalar(k) };
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: U,
    vertexShader: /* glsl */ `
      uniform float uPitch; uniform vec2 uView, uNear, uFar; uniform vec3 uSmoke;
      varying vec3 vN; varying vec3 vW; varying float vF;
      ${SPAN}
      ${SMOKE_T}
      ${CABIN_FADE}
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vF = cabinFade(w.xyz);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount;
      varying vec3 vN; varying vec3 vW; varying float vF;
      void main() {
        vec3 V = normalize(cameraPosition - vW);
        float c = abs(dot(normalize(vN), V));
        float rim = pow(clamp(1.0 - c, 0.0, 1.0), 2.3);
        float a = (0.012 + 0.32 * rim) * vF;
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
}

/** Plates: [{ c, u, v, k }] — centre, half-width vector, half-height vector (cm). One geometry for all. */
function plates(list, mat, order) {
  const pos = [];
  const uv = [];
  const kk = [];
  for (const { c, u, v, k = 1 } of list) {
    const P = (a, b) => [c[0] + a * u[0] + b * v[0], c[1] + a * u[1] + b * v[1], c[2] + a * u[2] + b * v[2]];
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]]) {
      pos.push(...P(a, b));
      uv.push((a + 1) / 2, (b + 1) / 2);
      kk.push(k);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute("aK", new THREE.Float32BufferAttribute(kk, 1));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
}

/** One mesh from many placed geometries (position + normal only). */
function merged(list, mat, order) {
  const pos = [];
  const nor = [];
  for (const g0 of list) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    pos.push(...g.attributes.position.array);
    nor.push(...g.attributes.normal.array);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
}

/** Edges of boxes as one line mesh: [{ at, size, rotY }] (cm), lines ≥ 1.9 px. */
function boxLines(list, { width = 1.9, opacity = 0.3 } = {}) {
  const seg = [];
  const m = new THREE.Matrix4();
  for (const { at, size, rotY = 0 } of list) {
    const e = new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)).attributes.position;
    m.makeRotationY(rotY).setPosition(...at);
    const p = new THREE.Vector3();
    for (let i = 0; i < e.count; i++) {
      p.set(e.getX(i), e.getY(i), e.getZ(i)).applyMatrix4(m);
      seg.push(p.x, p.y, p.z);
    }
  }
  return lineSegs(seg, { width, opacity });
}
function lineSegs(seg, { width = 1.9, opacity = 0.3 } = {}) {
  const mat = lineMat(BRAND.ink, width, { opacity });
  const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(seg), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  return { mesh, mat };
}

/* ───────────────────────────────────────────────────────────── THE OUTSIDE */

/**
 * A crash tender (≈ 11 m, X-ray outline), its front toward +x: cab, body, the roof monitor, its wheels; a beacon on the
 * cab (breathing slowly: a beacon that flashes would be a flicker) and two headlights.
 */
function makeTender(len = 1100) {
  const g = new THREE.Group();
  const L = len / 2;
  const { mesh, mat } = boxLines([
    { at: [L - 125, 190, 0], size: [250, 260, 250] }, // the cab
    { at: [-130, 205, 0], size: [len - 260, 290, 250] }, // the body (tank, pumps)
    { at: [L - 330, 375, 0], size: [140, 50, 70] }, // the roof monitor's base
  ], { opacity: 0.34 });
  g.add(mesh);
  // the wheels: three axles, a ring on each side
  const ring = [];
  for (const x of [L - 160, -L + 420, -L + 190])
    for (const z of [128, -128])
      for (let i = 0; i < 14; i++) {
        const a0 = (i / 14) * Math.PI * 2;
        const a1 = ((i + 1) / 14) * Math.PI * 2;
        ring.push(x + 62 * Math.cos(a0), 62 + 62 * Math.sin(a0), z, x + 62 * Math.cos(a1), 62 + 62 * Math.sin(a1), z);
      }
  // the monitor's nozzle, pointing ahead
  ring.push(L - 330, 400, 0, L - 140, 430, 0);
  const wheels = lineSegs(ring, { opacity: 0.26 });
  g.add(wheels.mesh);
  const beacon = glowMesh(900, 1.5, 9);
  beacon.position.set(L - 120, 345, 0);
  const headL = glowMesh(380, 1.0, 9);
  headL.position.set(L + 6, 110, 95);
  const headR = glowMesh(380, 1.0, 9);
  headR.position.set(L + 6, 110, -95);
  g.add(beacon, headL, headR);
  return { g, lines: [mat, wheels.mat], beacon: beacon.material, heads: [headL.material, headR.material] };
}

/** A route along x at `z`, from `x0` to `x1`, between t0 and t0 + dur (eased both ends): what a tender drives. */
const drive = (t, { t0, dur, x0, x1 }) => lerp(x0, x1, smooth(t0, t0 + dur, t));

export function dressPiste() {
  const group = new THREE.Group();
  group.name = "habillage-piste";
  const rand = rng(316);
  const A350 = PLANES.a350;

  /* ── HANEDA: the runway's world (slides with `run`) ── */
  const haneda = new THREE.Group();
  group.add(haneda);
  const hanedaFar = pointsMat({ k: 1.2, fade: 6e6, pin: true });
  {
    const list = [];
    // the far shore across the bay (Chiba, Urayasu): a low string of lights 13 to 21 km off, in towns
    for (let n = 0; n < 2600 && list.length < 1500; n++) {
      const th = lerp(-162, -18, rand()) * DEG;
      const town = 0.5 + 0.5 * Math.sin(th * 9 + 1.3) * Math.sin(th * 3.7 + 0.4);
      if (rand() > 0.2 + 0.8 * town) continue;
      const r = 1.3e6 + Math.pow(rand(), 0.8) * 0.8e6;
      const y = Math.pow(rand(), 3) * 2600;
      list.push({ at: [Math.cos(th) * r, y, Math.sin(th) * r], k: 0.4 + 0.6 * rand() * rand(), px: 2.6 + rand() * 0.8 });
    }
    // Odaiba and Shinagawa, ahead and to the right: towers, their lit windows, the tallest with its obstruction light
    for (let i = 0; i < 26; i++) {
      const th = lerp(-172, -112, rand()) * DEG;
      const r = 6.5e5 + rand() * 4.5e5;
      const cx = Math.cos(th) * r;
      const cz = Math.sin(th) * r;
      const tx = -Math.sin(th); // the facade runs across the line of sight
      const tz = Math.cos(th);
      const w = 2500 + rand() * 4000;
      const h = 5000 + Math.pow(rand(), 1.6) * 19000;
      for (let y = 600; y < h; y += 420)
        for (let s = -w / 2; s <= w / 2; s += 650) {
          if (rand() > 0.3) continue;
          list.push({ at: [cx + tx * s, y, cz + tz * s], k: 0.4 + 0.4 * rand(), px: 2.6 + rand() * 0.4 });
        }
      if (h > 14000) list.push({ at: [cx, h + 150, cz], k: 1.3, px: 3.6, br: 1 });
    }
    haneda.add(pointCloud(list, hanedaFar, 1));
  }
  // the terminals and the tower, on the left (+z), 1 km off: within the far plane, drawn as they are
  const hanedaNear = pointsMat({ k: 1, fade: 2.6e5 });
  const towerLines = [];
  {
    const list = [];
    for (const [x0, x1, zf] of [[-115000, -60000, 98000], [-45000, 15000, 104000], [30000, 70000, 112000]]) {
      for (const y of [450, 950, 1450]) {
        for (let x = x0; x <= x1; x += 900) {
          if (rand() > 0.62) continue;
          list.push({ at: [x, y, zf], k: 0.45 + 0.4 * rand(), px: 2.8 });
        }
      }
    }
    // the control tower: a shaft, its cab ringed with light, the light on top breathing
    const TX = -30000;
    const TZ = 90000;
    for (const dz of [-380, 380]) towerLines.push(TX, 0, TZ + dz, TX, 9800, TZ + dz * 0.8);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      list.push({ at: [TX + 700 * Math.cos(a), 10300, TZ + 700 * Math.sin(a)], k: 0.55, px: 2.8 });
    }
    list.push({ at: [TX, 11600, TZ], k: 0.9, px: 3.4, br: 1 });
    haneda.add(pointCloud(list, hanedaNear, 1));
  }
  const tower = lineSegs(towerLines, { opacity: 0.16 });
  haneda.add(tower.mesh);

  // the parallel taxiway on the bay side: its two rows of edge lamps (wrapped by their pitch, as the runway's lamps)
  const taxi = new THREE.Group();
  group.add(taxi);
  const TAXI = { z: -20000, half: 1500, pitch: 6000 };
  const taxiMat = pointsMat({ k: 1, fade: 3e5 });
  {
    const list = [];
    for (let x = -160000; x <= 60000; x += TAXI.pitch)
      for (const s of [1, -1]) list.push({ at: [x + (s > 0 ? 0 : TAXI.pitch / 2), 30, TAXI.z + s * TAXI.half], k: 0.95, px: 3.2 });
    taxi.add(pointCloud(list, taxiMat, 2));
  }

  // the rescue (the plane's frame): two tenders down the taxiway, two beacons far off
  const tenders = [makeTender(1150), makeTender(1050)];
  const HANEDA_RUN = [
    { t0: T_STOP + 0.4, dur: 34, x0: -45000, x1: 2500, z: TAXI.z + 400 },
    { t0: T_STOP + 4.4, dur: 34, x0: -45000, x1: -3000, z: TAXI.z + 400 },
  ];
  for (const td of tenders) group.add(td.g);
  const farBeacons = [
    { at: [-70000, 320, -55000], k: 1.3, size: 2400, ph: 0.7 },
    { at: [36000, 320, -62000], k: 1.2, size: 2400, ph: 2.9 },
  ].map((b) => {
    const m = glowMesh(b.size, b.k, 9);
    m.position.set(...b.at);
    group.add(m);
    return { mesh: m, ph: b.ph };
  });

  /* ── MANCHESTER: a few lights left on, far, and the fire service ── */
  const manc = new THREE.Group();
  group.add(manc);
  const mancFar = pointsMat({ k: 1, fade: 3.5e6, pin: true });
  {
    const list = [];
    for (let n = 0; n < 1400 && list.length < 420; n++) {
      const th = rand() * Math.PI * 2;
      if (Math.sin(th) > 0.55) continue; // not behind the camera's side (+z): nothing there is ever seen
      const town = 0.5 + 0.5 * Math.sin(th * 7 + 2.1);
      if (rand() > 0.15 + 0.85 * town) continue;
      const r = 4.5e5 + Math.pow(rand(), 0.7) * 9e5;
      list.push({ at: [Math.cos(th) * r, Math.pow(rand(), 3) * 1500, Math.sin(th) * r], k: 0.3 + 0.35 * rand(), px: 2.6 + rand() * 0.5 });
    }
    manc.add(pointCloud(list, mancFar, 1));
  }
  const mancTenders = [makeTender(1000), makeTender(1000)];
  const MANC_RUN = [
    { t0: T_THUMP + 3.5, dur: 26, x0: -40000, x1: 3500, z: -13000 },
    { t0: T_THUMP + 6.5, dur: 26, x0: -40000, x1: -2500, z: -13000 },
  ];
  for (const td of mancTenders) group.add(td.g);

  /* ── THE APRON at night: cones, floodlights, a baggage train ── */
  const apron = new THREE.Group();
  group.add(apron);
  const coneMat = rimMat({ k: 1.6 });
  coneMat.uniforms.uNear.value.set(300, 600);
  coneMat.uniforms.uFar.value.set(9000, 16000);
  {
    const tipX = A350.wing.x + (A350.wing.span / 2) * Math.tan(A350.wing.sweep * DEG);
    // where a ramp agent puts them on a parked airliner: before each engine, at the wingtips, behind the tail
    const eng = A350.engines;
    const at = [[eng.x - 420, eng.z[0]], [eng.x - 420, -eng.z[0]], [tipX + 250, A350.wing.span / 2 + 200], [tipX + 250, -A350.wing.span / 2 - 200], [A350.tail + 350, 0]];
    const geos = at.map(([x, z]) => new THREE.ConeGeometry(17, 72, 18, 1, true).translate(x, 36, z));
    apron.add(merged(geos, coneMat, 3));
  }
  // the floodlight masts beyond the terminal's glass: their heads, 25 m up
  const masts = [[-2000, 2500, -9000], [6000, 2500, -9500]].map((p) => {
    const m = glowMesh(800, 1.1, 4);
    m.position.set(...p);
    apron.add(m);
    return m.material;
  });
  const baggage = boxLines([
    // at the aft cargo door, on the right side (seen under the belly, through the hull): a tug and three carts
    { at: [2900, 85, -760], size: [260, 150, 150] },
    ...[0, 1, 2].map((i) => ({ at: [2520 - 380 * i, 90, -760], size: [300, 140, 150] })),
  ], { opacity: 0.2 });
  apron.add(baggage.mesh);

  const setTender = (td, path, t, a, ph) => {
    const on = a * smooth(path.t0 - 0.1, path.t0 + 1.4, t) * (t < T_LOOP - 0.02 ? 1 : 0);
    td.g.visible = on > 0.003;
    if (!td.g.visible) return;
    td.g.position.set(drive(t, path), 0, path.z);
    for (let i = 0; i < td.lines.length; i++) td.lines[i].opacity = td.lines[i].userData.base * on;
    td.beacon.uniforms.uAmount.value = on * (0.55 + 0.45 * Math.sin(t * 3.3 + ph));
    for (let i = 0; i < td.heads.length; i++) td.heads[i].uniforms.uAmount.value = on;
  };

  return {
    group,
    update(p = {}, time = 0) {
      const amount = clamp01(p.amount ?? 1);
      const site = Math.round(p.site ?? 0);
      const run = p.run ?? 0;
      group.visible = !BARE && amount > 0.003 && site !== SITE.HANGAR;
      if (!group.visible) return;

      /* Haneda */
      const H = site === SITE.HANEDA;
      haneda.visible = H;
      taxi.visible = H;
      if (H) {
        haneda.position.x = run;
        taxi.position.x = ((run % TAXI.pitch) + TAXI.pitch) % TAXI.pitch;
        hanedaFar.uniforms.uAmount.value = amount;
        hanedaFar.uniforms.uTime.value = time;
        hanedaNear.uniforms.uAmount.value = amount;
        hanedaNear.uniforms.uTime.value = time;
        tower.mat.opacity = tower.mat.userData.base * amount;
        taxiMat.uniforms.uAmount.value = amount;
      }
      for (let i = 0; i < tenders.length; i++) {
        if (H) setTender(tenders[i], HANEDA_RUN[i], time, amount, i * 1.9);
        else tenders[i].g.visible = false;
      }
      for (let i = 0; i < farBeacons.length; i++) {
        const b = farBeacons[i];
        const on = H ? amount * smooth(T_STOP + 2, T_STOP + 4, time) * (time < T_LOOP - 0.02 ? 1 : 0) : 0;
        b.mesh.visible = on > 0.003;
        b.mesh.material.uniforms.uAmount.value = on * (0.55 + 0.45 * Math.sin(time * 3.0 + b.ph));
      }

      /* Manchester */
      const M = site === SITE.MANCHESTER;
      manc.visible = M;
      if (M) {
        manc.position.x = run;
        mancFar.uniforms.uAmount.value = amount;
      }
      for (let i = 0; i < mancTenders.length; i++) {
        if (M) setTender(mancTenders[i], MANC_RUN[i], time, amount, 0.8 + i * 2.3);
        else mancTenders[i].g.visible = false;
      }

      /* the apron */
      const P = site === SITE.APRON;
      apron.visible = P;
      if (P) {
        coneMat.uniforms.uAmount.value = amount;
        for (let i = 0; i < masts.length; i++) masts[i].uniforms.uAmount.value = amount;
        baggage.mat.opacity = baggage.mat.userData.base * amount;
      }
    },
  };
}

/* ───────────────────────────────────────────────────────────── THE INSIDE */

/**
 * One layout's leftovers. `C` its plan (CAB.wide / CAB.narrow), `cols` its seat centres (z), `sw` a seat's width,
 * `depth` its cushion, `lean` its back (°), `skip(row, z)` the seats never dressed, `extra` the rows aft of door 2.
 */
function dressLayout({ C, cols, sw, depth, lean, skip, extra = [], loose }) {
  const g = new THREE.Group();
  const rand = rng(C === CAB.wide ? 5101 : 7703);
  const rowX = (i) => C.x0 + i * C.pitch;
  const backs = [];
  for (let i = 0; i < C.rows; i++) backs.push({ row: i, xb: rowX(i) });
  extra.forEach((xb, i) => backs.push({ row: C.rows + i, xb }));

  const sl = Math.sin(lean * DEG);
  const cl = Math.cos(lean * DEG);
  const cards = [];
  const belts = [];
  for (const { row, xb } of backs)
    for (const z of cols) {
      if (skip(row, z)) continue;
      // the seat back's rear face (as cabine.js builds it): leaning `lean`° aft, centred at y 86
      const face = (y) => xb + 4.4 + 4.6 + (y - 86) * Math.tan(lean * DEG) + 0.8;
      // the safety card, standing proud of the pocket; every fourth seat a magazine beside it
      const yc = 70;
      cards.push({ c: [face(yc), yc, z - 5 + rand() * 3], u: [0, 0, 7.5], v: [sl * 12, cl * 12, 0], k: 0.95 });
      if (rand() < 0.25) cards.push({ c: [face(64) + 0.4, 64, z + 8], u: [0, 0, 9.5], v: [sl * 13, cl * 13, 0], k: 0.7 });
      // the belt, left open: two straps from the back corners lying across the cushion, the tongue and the buckle
      const yb = 53.2;
      const x0 = xb - 9;
      for (const s of [1, -1]) {
        const za = z + s * (sw / 2 - 5);
        const zb = z + s * (2 + rand() * 4);
        const xa = x0;
        const xe = x0 - 18 - rand() * 8;
        const mx = (xa + xe) / 2;
        const mz = (za + zb) / 2;
        const dx = xe - xa;
        const dz = zb - za;
        const len = Math.hypot(dx, dz);
        const ux = dx / len;
        const uz = dz / len;
        belts.push({ c: [mx, yb, mz], u: [ux * len * 0.5, 0, uz * len * 0.5], v: [-uz * 2.2, 0, ux * 2.2], k: 0.8 });
        belts.push({ c: [xe + ux * 3, yb + 0.2, zb + uz * 3], u: [ux * 3.2, 0, uz * 3.2], v: [-uz * 2.8, 0, ux * 2.8], k: 1 }); // metal end
      }
    }
  const cardMat = plateMat({ k: 0.85, pitch: C.pitch });
  const beltMat = plateMat({ k: 0.75, pitch: C.pitch });
  g.add(plates(cards, cardMat, 23), plates(belts, beltMat, 23));

  // the few things dropped (loose: what, row, z — on a seat or on the floor under it)
  const flat = [];
  const round = [];
  let phone = null;
  for (const it of loose) {
    const xb = rowX(it.row);
    const xc = xb - depth / 2; // the cushion's middle
    if (it.kind === "blanket") {
      // a crumpled blanket on the cushion: a low lumpy body
      const geo = new THREE.SphereGeometry(1, 18, 10);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i);
        const y = p.getY(i);
        const z = p.getZ(i);
        const bump = 1 + 0.16 * Math.sin(x * 5 + z * 3 + it.z) + 0.1 * Math.sin(z * 7 - x * 2);
        p.setXYZ(i, x * 21 * bump, y * 6 * bump, z * 17 * bump);
      }
      geo.computeVertexNormals();
      geo.rotateY((it.turn ?? 20) * DEG).translate(xc, 58, it.z);
      round.push(geo);
    } else if (it.kind === "pillow") {
      const geo = new THREE.SphereGeometry(1, 18, 10).scale(15, 5.5, 10).rotateY((it.turn ?? -15) * DEG).translate(xc + 6, 58.5, it.z);
      round.push(geo);
    } else if (it.kind === "cup") {
      // a paper cup on its side on the floor, under the seat
      const geo = new THREE.CylinderGeometry(3.7, 2.7, 9.5, 16, 1, true).rotateZ(90 * DEG).rotateY((it.turn ?? 30) * DEG).translate(xb - 20, 3.6, it.z);
      round.push(geo);
    } else if (it.kind === "paper") {
      // a newspaper on the floor (or a seat: `y`), folded open: two leaves meeting at a crease
      const y = it.y ?? 0.6;
      const a = (it.turn ?? 10) * DEG;
      const ux = Math.cos(a);
      const uz = Math.sin(a);
      for (const s of [1, -1])
        flat.push({ c: [xc + s * ux * 15, y + 1.2, it.z + s * uz * 15], u: [ux * 14.5, -s * 1.1, uz * 14.5], v: [-uz * 19, 0, ux * 19], k: 0.8 });
    } else if (it.kind === "phone") {
      const a = (it.turn ?? 25) * DEG;
      const at = [xb - 22, 0.9, it.z];
      flat.push({ c: at, u: [Math.cos(a) * 3.6, 0, Math.sin(a) * 3.6], v: [-Math.sin(a) * 7.4, 0, Math.cos(a) * 7.4], k: 1 });
      phone = glowMesh(34, 0.75, 25);
      phone.position.set(at[0], 4, at[2]);
    }
  }
  const looseFlat = plateMat({ k: 1 });
  const looseRound = rimMat({ k: 1 });
  if (flat.length) g.add(plates(flat, looseFlat, 23));
  if (round.length) g.add(merged(round, looseRound, 23));
  if (phone) g.add(phone);
  return { g, mats: [cardMat, beltMat, looseFlat, looseRound], phone: phone?.material ?? null, C };
}

export function dressCabine() {
  const group = new THREE.Group();
  group.name = "habillage-cabine";

  // WIDE (A350): the seats as cabine.js places them; your rows and the seats around your bag stay bare
  const W = CAB.wide;
  const wSw = 43;
  const wDepth = 46;
  const xD2 = W.x0 + W.rows * W.pitch + 50;
  const wide = dressLayout({
    C: W,
    cols: [YOU.z, YOU.z + wSw, YOU.z + 2 * wSw, -46, 0, 46, -YOU.z, -YOU.z - wSw, -YOU.z - 2 * wSw],
    sw: wSw,
    depth: wDepth,
    lean: 9,
    extra: Array.from({ length: 5 }, (_, i) => xD2 + 60 + wDepth + i * W.pitch),
    // rows 3 to 7 around you (your seat, your bag, the thumbnail's frame): nothing on them, nothing behind them; the
    // centre block's first two rows sit where the first frame's floor line meets the door: left bare
    skip: (row, z) => (row >= 3 && row <= 7 && z > -30) || (row <= 1 && Math.abs(z) <= 46),
    loose: [
      { kind: "blanket", row: 2, z: -261, turn: 25 },
      { kind: "pillow", row: 2, z: -218 },
      { kind: "cup", row: 2, z: 240, turn: 40 },
      { kind: "paper", row: 1, z: -250, turn: 8 },
      { kind: "blanket", row: 10, z: 218, turn: -15 },
      { kind: "pillow", row: 11, z: 0, turn: 20 },
      { kind: "cup", row: 12, z: -20, turn: -30 },
      { kind: "paper", row: 12, z: 236, turn: -12 },
      { kind: "blanket", row: 13, z: -175, turn: 35 },
      { kind: "phone", row: 10, z: -228, turn: 32 },
    ],
  });
  // NARROW (737, a summer morning): cards, open belts, two newspapers — the hatch's rows left bare (the passage shot)
  const N = CAB.narrow;
  const narrow = dressLayout({
    C: N,
    cols: [62, 103, 144, -62, -103, -144],
    sw: 41,
    depth: 54,
    lean: 5,
    skip: (row, z) => z < 0 && row >= N.hatch.row - 1 && row <= N.hatch.row + 2,
    loose: [
      { kind: "paper", row: 2, z: 103, y: 53, turn: 6 },
      { kind: "paper", row: 12, z: -103, y: 53, turn: -9 },
    ],
  });
  group.add(wide.g, narrow.g);
  const layouts = [wide, narrow];

  return {
    group,
    update(p = {}, time = 0) {
      const li = Math.round(p.layout ?? 0) === 1 ? 1 : 0;
      group.visible = !BARE;
      wide.g.visible = li === 0;
      narrow.g.visible = li === 1;
      const L = layouts[li];
      const C = L.C;
      // the smoke, as cabine.js has it: its underside comes down from the ceiling to 1,20 m, then to 60 cm
      const sm = Math.max(0, p.smoke ?? 0);
      const bottom = C.h - clamp01(sm) * (C.h - SMOKE.line) - Math.max(0, sm - 1) * 2 * (SMOKE.line - SMOKE.low);
      const dens = clamp01(sm * 4) > 0.002 ? 0.011 * clamp01(sm * 4) : 0;
      // the things are seen by the same light as the seats: a little brighter with the cabin lights on
      const a = 0.75 + 0.25 * clamp01(p.lights ?? 0);
      for (let i = 0; i < L.mats.length; i++) {
        L.mats[i].uniforms.uAmount.value = a;
        L.mats[i].uniforms.uSmoke.value.set(bottom, C.h, dens);
      }
      if (L.phone) L.phone.uniforms.uAmount.value = 1;
    },
  };
}
