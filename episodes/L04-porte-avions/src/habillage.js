// DOSSIER L04 — the decorator's file: the life of the places (docs/recette-decorateur.md). Nothing here is a system,
// nothing stands in front of one, nothing is solid, everything is ink. Journal: docs/journal/L04-habillage.md.
//
//   dressMer()  → { group, update({ amount, night, mist }, time, px) }        LEVEL: in the PONT place, beside `sky`
//   dressPont() → { group, update({ amount, night, parked, lso, under, explode, cutaway, wind,
//                                   hangar, curtain, lift, detectors }, time, px) }   the SHIP's frame: it heels with it
//
// THE SEA — the Charles de Gaulle never sails alone:
//   · THE GROUP AROUND IT: a frigate on the starboard bow (≈ 3 km) and the replenishment ship on the starboard quarter
//     (≈ 3 km) — two fine silhouettes on the horizon by day, a handful of still lights by night. They keep station:
//     still in the level frame. Placed out of the three first-frame candidates (hook1 looks abeam, hook3 ahead, hook2
//     aft-starboard: the frigate at 50° and the tanker at 140° fall outside hook1 and hook3).
// THE DECK — what lives on a flight deck between two launches:
//   · THE PARKED AIRCRAFT ARE TIED DOWN: chocks at every wheel, four chains to the deck's pad-eyes (two at the nose) —
//     a carrier at sea lashes everything; and a fuel hose from the deck edge to the second one (it is being refuelled).
//   · THE DECK'S TRACTORS AND FIRE TROLLEYS: one tractor waiting at the island's foot, one aft by the parking; two
//     wheeled extinguishers. Never on a catapult's track, never on the
//     angled runway, never ahead of your nose on the bow catapult.
//   · THE GALLERIES AND THEIR SAFETY NETS along the deck's edges (and the one under the landing officer's platform, into
//     which he jumps): a coarse mesh that leaves before its cells get small (rail and posts carry it from afar), gone near the lens.
//   · THE STEAM THAT TRAILS on the bow catapult's slot (it leaks and vents between launches, the wind over the deck
//     lays it aft): soft low wisps ahead of your nose, never on you, never under the glass deck.
// THE HANGAR — a spare engine on its cradle, a ground power unit, a tractor, tool chests: a workshop asleep.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { lineMat, mergeGeometries } from "@kit/build3d.js";
import * as PLAN from "./plan.js";

const { SHIP, CAT, PARK, HANGAR, LSO, ANGLED_DIR, RAFALE } = PLAN;
const CUT_Z = PLAN.CUT ? PLAN.CUT.z : PLAN.MASSES.rows[0] - 180;
const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const INK = new THREE.Color(BRAND.ink);
// SD_KIT='{"nodress":1}' npm run look …: the sets bare, for the before / after board
const BARE = typeof window !== "undefined" && !!(window.__SD_KIT && window.__SD_KIT.nodress);
const V3 = new THREE.Vector3();

/* ───────────────────────────────────────────────────────────── the X-ray props */

// One material for every small thing on the deck and in the hangar: a box draws its own edges (≈ 2 px whatever its
// distance) over a faint fill, a round side its two rims and a soft fresnel, a disc its rim. Each prop belongs to a
// CLUSTER (its centre and size, baked per vertex): the whole cluster fades out before it spans 14 px on screen, and
// near the lens; any face seen too small (edge-on, far) fades by itself — nothing thinner than ~2 px ever shows.
function xrayMat({ k = 1, px = [14, 34], near = [250, 600] } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: INK.clone().multiplyScalar(k) }, uAmount: { value: 1 }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) },
      uPx: { value: new THREE.Vector2(...px) }, uNear: { value: new THREE.Vector2(...near) }, uCut: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform vec2 uView, uPx, uNear; uniform float uCut;
      attribute vec3 aC; attribute float aS; attribute float aK; attribute float aB;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying float vF; varying float vK;
      void main() {
        vUv = uv; vK = aK;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vec3 c = (modelMatrix * vec4(aC, 1.0)).xyz;
        float dist = max(1.0, length(c - cameraPosition));
        float spanPx = aS * projectionMatrix[1][1] * 0.5 * uView.y / dist;
        vF = aB * smoothstep(uPx.x, uPx.y, spanPx) * smoothstep(uNear.x, uNear.y, dist);
        if (uCut > 0.5 && aC.z < ${CUT_Z.toFixed(1)}) vF = 0.0; // the cut across the hull: what is ahead of it is gone
        vN = normalize(mat3(modelMatrix) * normal);
        vV = cameraPosition - w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying float vF; varying float vK;
      void main() {
        if (vF * uAmount < 0.002) discard;
        vec2 fw = max(fwidth(vUv), vec2(1e-5));
        float edge = 0.0;
        float fill = 0.0;
        if (vK < 0.5) { // a face of a box: its four edges
          float ex = min(vUv.x, 1.0 - vUv.x) / fw.x;
          float ey = min(vUv.y, 1.0 - vUv.y) / fw.y;
          float big = smoothstep(4.0, 10.0, min(1.0 / fw.x, 1.0 / fw.y));
          edge = (1.0 - smoothstep(0.9, 2.1, min(ex, ey))) * big;
          fill = 0.03 * big;
        } else if (vK < 1.5) { // a round side: the rims at its two ends, a soft fresnel
          float ey = min(vUv.y, 1.0 - vUv.y) / fw.y;
          edge = (1.0 - smoothstep(0.9, 2.1, ey)) * smoothstep(4.0, 10.0, 1.0 / fw.y);
          float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
          fill = (0.02 + 0.28 * pow(clamp(f, 0.0, 1.0), 3.0)) * smoothstep(14.0, 36.0, 1.0 / fw.x);
        } else { // a disc: its rim
          float r = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
          float fr = max(fwidth(r), 1e-5);
          edge = (1.0 - smoothstep(0.9, 2.1, (1.0 - r) / fr)) * smoothstep(4.0, 10.0, 1.0 / fr);
          fill = 0.025;
        }
        gl_FragColor = vec4(uColor * (0.5 * edge + fill) * vF * uAmount, 1.0);
      }`,
  });
}

/** Collects the props' pieces, each tagged with its cluster; `mesh(mat, order)` bakes them into one draw. */
function props() {
  const parts = [];
  let C = [0, 0, 0];
  let S = 100;
  let B = 1;
  let base = new THREE.Matrix4();
  const tmp = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const local = (at = [0, 0, 0], rot = [0, 0, 0]) => tmp.compose(V3.set(...at), q.setFromEuler(e.set(rot[0], rot[1], rot[2], "YXZ")), new THREE.Vector3(1, 1, 1));
  const push = (geo, m, kind) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.applyMatrix4(m);
    const n = g.attributes.position.count;
    const aC = new Float32Array(n * 3);
    const aS = new Float32Array(n).fill(S);
    const aK = new Float32Array(n).fill(kind);
    const aB = new Float32Array(n).fill(B);
    for (let i = 0; i < n; i++) aC.set(C, i * 3);
    const o = new THREE.BufferGeometry();
    o.setAttribute("position", g.attributes.position);
    o.setAttribute("normal", g.attributes.normal);
    o.setAttribute("uv", g.attributes.uv);
    o.setAttribute("aC", new THREE.BufferAttribute(aC, 3));
    o.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
    o.setAttribute("aK", new THREE.BufferAttribute(aK, 1));
    o.setAttribute("aB", new THREE.BufferAttribute(aB, 1));
    parts.push(o);
  };
  const api = {
    /** A new cluster: its place and heading (the props' frame: length along z, +y up), its size, its brightness. */
    begin(at, yaw = 0, size = 300, k = 1) {
      base = new THREE.Matrix4().compose(new THREE.Vector3(...at), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)), new THREE.Vector3(1, 1, 1));
      C = [...at];
      S = size;
      B = k;
      return api;
    },
    box(w, h, d, at = [0, 0, 0], rot = [0, 0, 0]) {
      push(new THREE.BoxGeometry(w, h, d), base.clone().multiply(local(at, rot)), 0);
      return api;
    },
    /** A cylinder along `axis` ("x", "y", "z"): its side and its two discs. */
    cyl(r, h, at = [0, 0, 0], axis = "y", segs = 20) {
      const rot = axis === "x" ? [0, 0, 90 * DEG] : axis === "z" ? [90 * DEG, 0, 0] : [0, 0, 0];
      const m = base.clone().multiply(local(at, rot));
      push(new THREE.CylinderGeometry(r, r, h, segs, 1, true), m, 1);
      for (const s of [1, -1]) push(new THREE.CircleGeometry(r, segs).rotateX(-s * 90 * DEG).translate(0, (s * h) / 2, 0), m.clone(), 2);
      return api;
    },
    mesh(mat, order) {
      const mesh = new THREE.Mesh(mergeGeometries(parts), mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = order;
      return mesh;
    },
  };
  return api;
}

/** A deck tractor (tow tractor), its nose toward its local −z: a low body, a seat, four wheels. */
function tractor(P, at, yaw) {
  P.begin(at, yaw, 360, 1);
  P.box(160, 62, 290, [0, 58, 0]); //                           the body
  P.box(150, 18, 90, [0, 98, -80]); //                          the bonnet's top
  P.box(56, 62, 12, [0, 120, 52]); //                           the seat's back
  P.box(60, 12, 56, [0, 94, 76]); //                            the seat
  P.box(12, 52, 12, [0, 120, 8], [-30 * DEG, 0, 0]); //         the steering column
  for (const x of [-72, 72]) for (const z of [-100, 100]) P.cyl(30, 24, [x, 30, z], "x");
}
/** A wheeled fire extinguisher: a big bottle standing on a two-wheel frame, its handle. */
function extinguisher(P, at, yaw) {
  P.begin(at, yaw, 160, 1);
  P.cyl(24, 110, [0, 85, 0], "y");
  P.box(60, 10, 60, [0, 26, 0]);
  for (const x of [-38, 38]) P.cyl(25, 10, [x, 25, 8], "x");
  P.box(10, 90, 10, [0, 95, 38], [-18 * DEG, 0, 0]);
  P.box(54, 10, 10, [0, 138, 52]);
}

/* ───────────────────────────────────────────────────────────── lines that leave with the distance */

/** Fine lines (chains, hoses, the escorts' outlines): `w` px wide (≥ 1.8), dimmed by the distance of `centre` to the eye. */
function fadeLines(positions, { w = 1.8, opacity = 0.4, near = [0, 0], far = [1800, 3400], order = 62 } = {}) {
  const mat = lineMat(BRAND.ink, w, { opacity, additive: true });
  const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(positions), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  const c = new THREE.Vector3();
  const n = positions.length / 3;
  for (let i = 0; i < n; i++) c.x += positions[i * 3] / n, c.y += positions[i * 3 + 1] / n, c.z += positions[i * 3 + 2] / n;
  const wc = new THREE.Vector3();
  mesh.userData.want = 0;
  mesh.onBeforeRender = (renderer, scene, camera) => {
    wc.copy(c).applyMatrix4(mesh.matrixWorld);
    const d = wc.distanceTo(camera.position);
    const k = (near[1] > 0 ? smooth(near[0], near[1], d) : 1) * (1 - smooth(far[0], far[1], d));
    mat.opacity = mesh.userData.want * k;
  };
  return mesh;
}

/* ───────────────────────────────────────────────────────────── the safety nets */

// A strip of net hung outboard of an edge: `vS` = (cm along the edge, cm out from it). A diamond mesh of ropes ≥ 1.8 px
// that leaves before its cells pass under 14 px (no grey sheet: the rail and the posts carry it from afar), a rail on its outer edge, a post every 3 m that melts
// the same way; the whole strip fades when it spans fewer than 8 px across, and within 9 to 18 m of the lens.
const NET_W = 170;
function netMat(near = [900, 1800]) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 }, uCut: { value: 0 }, uNear: { value: new THREE.Vector2(...near) } },
    vertexShader: /* glsl */ `
      uniform vec2 uNear; attribute vec2 aS; varying vec2 vS; varying float vNear; varying float vZ;
      void main() {
        vS = aS; vZ = position.z;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vNear = smoothstep(uNear.x, uNear.y, length(w.xyz - cameraPosition));
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uCut; varying vec2 vS; varying float vNear; varying float vZ;
      void main() {
        if (uCut > 0.5 && vZ < ${CUT_Z.toFixed(1)}) discard;
        vec2 q = vec2(vS.x + vS.y, vS.x - vS.y) / 30.0;
        vec2 fq = max(fwidth(q), vec2(1e-5));
        vec2 g = abs(fract(q - 0.5) - 0.5) / fq;
        float cellPx = 1.0 / max(fq.x, fq.y);
        float mesh = (1.0 - smoothstep(0.9, 1.9, min(g.x, g.y))) * smoothstep(14.0, 24.0, cellPx);
        float fv = max(fwidth(vS.y), 1e-5);
        float rail = 1.0 - smoothstep(0.9, 2.1, (${NET_W.toFixed(1)} - vS.y) / fv);
        float p = vS.x / 300.0;
        float fp = max(fwidth(p), 1e-5);
        float post = (1.0 - smoothstep(0.9, 2.1, abs(fract(p - 0.5) - 0.5) / fp)) * smoothstep(16.0, 30.0, 1.0 / fp);
        float strip = smoothstep(3.0, 8.0, ${NET_W.toFixed(1)} / fv);
        float a = (0.2 * mesh + 0.006 + 0.32 * rail + 0.22 * post) * strip * vNear;
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
}
/** The strip along a polyline [[x, z], …] (ship's frame), only where `keep(z)`; it hangs outboard (away from x = 0). */
function netStrip(pts, keep, out, y0 = -25, y1 = -75, step = 150) {
  const { pos, aS, idx } = out;
  let along = 0;
  let prev = -1;
  let prevZ = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    let nx = -(bz - az) / len;
    let nz = (bx - ax) / len;
    if (nx * (ax + bx) < 0) (nx = -nx), (nz = -nz); // outboard
    const n = Math.max(1, Math.round(len / step));
    for (let j = i === 0 ? 0 : 1; j <= n; j++) {
      const u = j / n;
      const x = ax + (bx - ax) * u;
      const z = az + (bz - az) * u;
      const s = along + len * u;
      const v = pos.length / 3;
      pos.push(x, y0, z, x + nx * NET_W, y1, z + nz * NET_W);
      aS.push(s, 0, s, NET_W);
      if (prev >= 0 && keep(z) && keep(prevZ)) idx.push(prev, prev + 1, v, v, prev + 1, v + 1);
      prev = v;
      prevZ = z;
    }
    along += len;
  }
}

/* ───────────────────────────────────────────────────────────── the steam on the slot */

// Soft wisps born along the bow catapult's slot, laid aft by the wind over the deck (slowly: the film's time), rising a
// little as they go, dying before they reach your nose. Each is a stretched glow (a core and a tail along +z), faint;
// it leaves before it spans 12 px (a dot that crawls) and beyond 90 m.
function steamMat() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(0.22) }, uAmount: { value: 0 }, uTime: { value: 0 }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) } },
    vertexShader: /* glsl */ `
      uniform float uTime; uniform vec2 uView;
      attribute vec4 aSeed; attribute vec3 aBirth; attribute vec2 aCorner;
      varying vec2 vQ; varying float vA;
      void main() {
        float life = fract(aSeed.x + uTime / (3.2 + 1.6 * aSeed.w));
        vec3 c = aBirth + vec3(aSeed.y * life * 18.0, 5.0 + life * (12.0 + 26.0 * aSeed.w), life * 620.0);
        float size = aSeed.z * (0.55 + 0.9 * life);
        vec3 cw = (modelMatrix * vec4(c, 1.0)).xyz;
        vec3 along = normalize(mat3(modelMatrix) * vec3(0.0, 0.0, 1.0));
        vec3 toCam = cameraPosition - cw;
        float dist = max(1.0, length(toCam));
        vec3 side = cross(along, toCam / dist);
        float sl = length(side);
        side = sl > 0.05 ? side / sl : vec3(0.0, 1.0, 0.0);
        vec3 p = cw + along * aCorner.x * size * 3.0 + side * aCorner.y * size * 0.5;
        float spanPx = size * projectionMatrix[1][1] * 0.5 * uView.y / dist;
        vA = (0.55 + 0.45 * aSeed.w) * smoothstep(0.0, 0.2, life) * (1.0 - smoothstep(0.6, 1.0, life))
           * smoothstep(9.0, 26.0, spanPx) * (1.0 - smoothstep(6000.0, 9000.0, dist)) * smoothstep(150.0, 450.0, dist);
        vQ = aCorner;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vQ; varying float vA;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        float a = exp(-r2 * 3.2) * (1.0 - r2);
        gl_FragColor = vec4(uColor * a * vA * uAmount, 1.0);
      }`,
  });
}

/* ───────────────────────────────────────────────────────────── points of light far away */

function lightsMat() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aK; attribute float aPx; varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float dist = max(1.0, -mv.z);
        vA = aK * (1.0 - smoothstep(450000.0, 560000.0, dist)) * step(0.0, -mv.z);
        gl_Position = projectionMatrix * mv;
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

/** A faint fill for a profile (a far ship's side): additive, still. */
function fillMat() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(0.035) }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `varying float vF;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vF = 1.0 - smoothstep(450000.0, 560000.0, length(w.xyz - cameraPosition));
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `uniform vec3 uColor; uniform float uAmount; varying float vF;
      void main() { gl_FragColor = vec4(uColor * vF * uAmount, 1.0); }`,
  });
}

/* ═════════════════════════════════════════════════════════════ THE SEA ═════════════════════════════════════════════════════════════ */

// Profiles in metres: (along the ship, bow at −, height above the water). The escorts' bows point the carrier's way (−z).
const FREGATE = {
  // a FREMM-type frigate, ≈ 142 m: the long low hull, the bridge, the pyramid mast, the funnel, the hangar, the flight deck
  outline: [[-71, 8.5], [-58, 7], [-38, 7], [-38, 12], [-26, 12], [-24, 21], [-13, 21], [-10, 31], [-6, 40], [-3, 31], [1, 17], [16, 17], [18, 23], [26, 23], [28, 15], [48, 15], [50, 7], [71, 7], [71, 0], [-67, 0]],
  lights: [[-6, 40, 1.0, 3.2], [71, 7.5, 0.7, 2.8], [-20, 21, 0.45, 2.6], [40, 15.5, 0.4, 2.6]],
};
const RAVITAILLEUR = {
  // a replenishment ship, ≈ 194 m: the forward castle and its mast, two refuelling gantries amidships, the aft block and funnel
  outline: [[-97, 12], [-84, 11], [-84, 24], [-74, 24], [-72, 32], [-68, 32], [-66, 24], [-56, 24], [-56, 11], [-26, 11], [-26, 30], [-22, 30], [-22, 11], [18, 11], [18, 30], [22, 30], [22, 11], [52, 11], [52, 22], [64, 22], [66, 30], [72, 30], [74, 22], [86, 22], [86, 11], [97, 10], [97, 0], [-94, 0]],
  lights: [[-70, 32, 1.0, 3.2], [69, 30, 0.8, 3.0], [-24, 30, 0.45, 2.6], [20, 30, 0.45, 2.6], [97, 10.5, 0.6, 2.6]],
};
// where they keep station (cm, level frame: x to starboard, z astern), and their length scale
const ESCORTS = [
  { ship: FREGATE, at: [240000, -200000] }, //      starboard bow, ≈ 3.1 km (50°)
  { ship: RAVITAILLEUR, at: [190000, 230000] }, //  starboard quarter, ≈ 3.0 km (140°)
];

export function dressMer() {
  const group = new THREE.Group();
  group.name = "habillage-mer";
  const outlines = [];
  const fillGeos = [];
  const pts = [];
  for (const { ship, at } of ESCORTS) {
    const [x0, z0] = at;
    const wl = SHIP.sea;
    const P = (a, h) => [x0, wl + h * 100, z0 + a * 100];
    const pos = [];
    const o = ship.outline;
    for (let i = 0; i < o.length; i++) pos.push(...P(...o[i]), ...P(...o[(i + 1) % o.length]));
    const L = fadeLines(pos, { w: 1.9, opacity: 0.32, far: [450000, 560000], order: 64 });
    outlines.push(L);
    group.add(L);
    // the fill: the profile as a flat polygon in the ship's vertical plane
    const shape = new THREE.Shape(o.map(([a, h]) => new THREE.Vector2(a * 100, h * 100)));
    const g = new THREE.ShapeGeometry(shape);
    // shape (a, h) → (x0, wl + h, z0 + a)
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const a = p.getX(i);
      const h = p.getY(i);
      p.setXYZ(i, x0, wl + h, z0 + a);
    }
    fillGeos.push(g);
    for (const [a, h, k, px] of ship.lights) pts.push({ at: P(a, h), k, px });
  }
  const fill = new THREE.Mesh(mergeGeometries(fillGeos.map((g) => g.toNonIndexed())), fillMat());
  fill.frustumCulled = false;
  fill.renderOrder = 63;
  group.add(fill);
  const lgeo = new THREE.BufferGeometry();
  lgeo.setAttribute("position", new THREE.Float32BufferAttribute(pts.flatMap((q) => q.at), 3));
  lgeo.setAttribute("aK", new THREE.Float32BufferAttribute(pts.map((q) => q.k), 1));
  lgeo.setAttribute("aPx", new THREE.Float32BufferAttribute(pts.map((q) => q.px), 1));
  const lights = new THREE.Points(lgeo, lightsMat());
  lights.frustumCulled = false;
  lights.renderOrder = 66;
  group.add(lights);
  if (BARE) group.visible = false;

  return {
    group,
    /** amount: the sea (`sea`); night 0 → 1; mist: the far ships fade into it. */
    update({ amount = 1, night = 0, mist = 0 } = {}) {
      if (BARE) return;
      group.visible = amount > 0.003;
      if (!group.visible) return;
      const veil = 1 - 0.85 * clamp01(mist);
      const day = 1 - clamp01(night);
      for (const L of outlines) L.userData.want = 0.32 * amount * veil * (0.25 + 0.75 * day);
      fill.material.uniforms.uAmount.value = amount * veil * day;
      lights.material.uniforms.uAmount.value = amount * veil * smooth(0.3, 0.9, night) * 1.6;
    },
  };
}

/* ═════════════════════════════════════════════════════════════ THE DECK ═════════════════════════════════════════════════════════════ */

/** Where a parked aircraft's frame stands (bord.js: its origin under the nose wheel, 4.3 m ahead of PARK's middle). */
function parkFrame([x, z, yaw]) {
  const r = yaw * DEG;
  return { x: x - 430 * Math.sin(r), z: z - 430 * Math.cos(r), r };
}
/** A point of the parked aircraft's frame (nose toward its −z) in the ship's frame. */
const inPark = (f, lx, y, lz) => [f.x + lx * Math.cos(f.r) + lz * Math.sin(f.r), y, f.z - lx * Math.sin(f.r) + lz * Math.cos(f.r)];

export function dressPont() {
  const group = new THREE.Group();
  group.name = "habillage-pont";
  const rand = rng(404);

  /* ── the deck's props ── */
  const D = props();
  const F = PARK.map(parkFrame);
  // chocks at every wheel of every parked aircraft (fore and aft of each tyre)
  F.forEach((f) => {
    const wheels = [[-128, 38, 530], [128, 38, 530], [0, 27, 0]];
    for (const [lx, r, lz] of wheels) {
      const c = inPark(f, lx, 0, lz);
      D.begin(c, f.r, 140, 0.9);
      for (const s of [-1, 1]) D.box(lx === 0 ? 40 : 34, 18, 22, [0, 9, s * (r + 13)]);
    }
  });
  // the tractors: one waiting at the island's foot, one aft by the parking (none forward: from the first frame, hook3,
  // one stood right beside your fin)
  tractor(D, [1350, 0, -850], 90 * DEG);
  tractor(D, [1320, 0, 5250], 8 * DEG);
  // two wheeled extinguishers: by the island, by the aft parking
  extinguisher(D, [1720, 0, -560], -70 * DEG);
  extinguisher(D, [1180, 0, 4420], 15 * DEG);
  const deckMat = xrayMat({ k: 0.55 });
  const deckMesh = D.mesh(deckMat, 62);
  group.add(deckMesh);

  /* ── the chains (and the fuel hose of the second aircraft): fine lines that leave with the distance ── */
  const chainSets = [];
  F.forEach((f, i) => {
    const pos = [];
    const add = (a, b) => pos.push(...a, ...b);
    // four chains from the main gear legs to pad-eyes out on the deck, two from the nose gear
    for (const s of [-1, 1]) {
      const leg = inPark(f, s * 118, 62, 530);
      add(leg, inPark(f, s * 280, 2, 530 - 130));
      add(leg, inPark(f, s * 280, 2, 530 + 130));
      const nose = inPark(f, s * 14, 48, 6);
      add(nose, inPark(f, s * 170, 2, -110));
    }
    if (i === 1) {
      // the fuel hose: from the deck-edge station to the aircraft's flank, lying on the deck in a loose curve
      const a = [2150, 1, 8150];
      const b = inPark(f, 80, 110, 640);
      const mid = [(a[0] + b[0]) / 2 - 120, 1, (a[2] + b[2]) / 2 + 90];
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(...a), new THREE.Vector3(...mid), new THREE.Vector3(b[0] + 60, 1, b[2] + 30), new THREE.Vector3(...b)]);
      const cp = curve.getPoints(18);
      for (let j = 0; j < cp.length - 1; j++) add(cp[j].toArray(), cp[j + 1].toArray());
    }
    const L = fadeLines(pos, { w: 1.8, opacity: 0.4, near: [250, 500], far: [1700, 3200], order: 62 });
    chainSets.push(L);
    group.add(L);
  });

  /* ── the safety nets along the edges, and under the landing officer's platform ── */
  const out = { pos: [], aS: [], idx: [] };
  const deck = SHIP.deck;
  const starboard = [[400, -12600], [1200, -10500], [2000, -6000], [2300, -1000], [2300, 6000], [1900, 9000], [1500, 13075]];
  const port = [[-500, -12600], [-1300, -10500], [-2000, -8200], [-3350, -6650], [-3550, -5000], [-3050, 0], [-2400, 6000], [-1800, 10500], [-1400, 13075]];
  void deck;
  // starboard: not the bow (the sea you fall into), not under the island, not across the two lifts' openings
  netStrip(starboard, (z) => (z > -10200 && z < -4500) || (z > 1900 && z < 2600) || (z > 4700 && z < 11800), out);
  // port: not the bow, not at the mirror's sponson nor the landing officer's (his own net is below)
  netStrip(port, (z) => (z > -10200 && z < 7000) || (z > 8900 && z < 9700) || (z > 11200 && z < 12600), out);
  const netGeo = new THREE.BufferGeometry();
  netGeo.setAttribute("position", new THREE.Float32BufferAttribute(out.pos, 3));
  netGeo.setAttribute("aS", new THREE.Float32BufferAttribute(out.aS, 2));
  netGeo.setIndex(out.idx);
  const netM = netMat();
  const nets = new THREE.Mesh(netGeo, netM);
  nets.frustumCulled = false;
  nets.renderOrder = 62;
  group.add(nets);
  // the landing officer's net: outboard of his platform (bord.js: 320 × 260, at x −40, z 30 in his frame; outboard = −x)
  const lsoNet = (() => {
    const o2 = { pos: [], aS: [], idx: [] };
    const yaw = Math.atan2(-ANGLED_DIR[0], -ANGLED_DIR[2]);
    const at = LSO.at;
    const P = (lx, lz) => [at[0] + lx * Math.cos(yaw) + lz * Math.sin(yaw), 0, at[2] - lx * Math.sin(yaw) + lz * Math.cos(yaw)];
    const a = P(-200, 160);
    const b = P(-200, -100);
    netStrip([[a[0], a[2]], [b[0], b[2]]], () => true, o2, at[1] - 12, at[1] - 70, 60);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(o2.pos, 3));
    g.setAttribute("aS", new THREE.Float32BufferAttribute(o2.aS, 2));
    g.setIndex(o2.idx);
    const m = new THREE.Mesh(g, netMat([220, 420]));
    m.frustumCulled = false;
    m.renderOrder = 62;
    return m;
  })();
  group.add(lsoNet);

  /* ── the steam trailing on the bow catapult's slot ── */
  const N = 44;
  const sPos = [];
  const sSeed = [];
  const sBirth = [];
  const sCorner = [];
  const sIdx = [];
  const c0 = CAT[0];
  for (let i = 0; i < N; i++) {
    // born between 8 m ahead of your nose and the bow; it travels 6.2 m aft at most: never reaches the nose
    const s = 800 + 1300 + rand() * (6900 - 1300);
    const birth = [c0.from[0] + (rand() - 0.5) * 16, 0, c0.from[2] - s];
    const seed = [rand(), (rand() - 0.5) * 2, 55 + rand() * 55, rand()];
    const v = sPos.length / 3;
    for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      sPos.push(0, 0, 0);
      sSeed.push(...seed);
      sBirth.push(...birth);
      sCorner.push(cx, cy);
    }
    sIdx.push(v, v + 1, v + 2, v, v + 2, v + 3);
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute("position", new THREE.Float32BufferAttribute(sPos, 3));
  sGeo.setAttribute("aSeed", new THREE.Float32BufferAttribute(sSeed, 4));
  sGeo.setAttribute("aBirth", new THREE.Float32BufferAttribute(sBirth, 3));
  sGeo.setAttribute("aCorner", new THREE.Float32BufferAttribute(sCorner, 2));
  sGeo.setIndex(sIdx);
  const steamM = steamMat();
  const steam = new THREE.Mesh(sGeo, steamM);
  steam.frustumCulled = false;
  steam.renderOrder = 64;
  group.add(steam);

  /* ── the hangar: a workshop asleep (inside the hull's shells: drawn before them, order 43) ── */
  const H = props();
  const fl = HANGAR.floor;
  // a spare engine on its cradle (port side, in the gap between two sleeping aircraft)
  H.begin([-1060, fl, 1720], 0, 420, 1);
  H.box(120, 40, 380, [0, 30, 0]);
  for (const x of [-52, 52]) for (const z of [-160, 160]) H.cyl(14, 10, [x, 14, z], "x");
  H.box(14, 50, 14, [0, 70, -120]).box(14, 50, 14, [0, 70, 120]);
  H.cyl(46, 330, [0, 135, 0], "z", 24);
  // a ground power unit on wheels (port side, forward)
  H.begin([-1020, fl, -2700], 90 * DEG, 260, 1);
  H.box(110, 100, 210, [0, 74, 0]).box(110, 12, 60, [0, 130, -60]);
  for (const x of [-48, 48]) for (const z of [-80, 80]) H.cyl(22, 14, [x, 22, z], "x");
  // a tractor waiting (aft, port), and tool chests in the aft starboard corner
  tractor(H, [-1020, fl, 6650], 0);
  for (const [z, h] of [[6930, 104], [7060, 92]]) {
    H.begin([1330, fl, z], 90 * DEG, 160, 0.9);
    H.box(110, h, 56, [0, h / 2 + 8, 0]).box(104, 3, 52, [0, h * 0.35 + 8, 0]).box(104, 3, 52, [0, h * 0.68 + 8, 0]);
  }
  const hangarMat = xrayMat({ k: 0.9, near: [200, 450] });
  const hangarMesh = H.mesh(hangarMat, 43);
  group.add(hangarMesh);

  if (BARE) group.visible = false;

  return {
    group,
    /**
     * amount the ship's X-ray (`ship`) · night · parked (the aircraft on deck: their chocks and chains) · lso (his
     * platform, his net) · under (the glass deck: the steam leaves) · explode (the catapult opened: the steam leaves) ·
     * cutaway (the cut: what is ahead of it goes) · wind (lays the steam) · hangar, curtain, lift, detectors, under:
     * how much of the hangar shows (as navire.js).
     */
    update({ amount = 1, night = 0, parked = 0.6, lso = 0, under = 0, explode = 0, cutaway = 0, wind = 0.4, hangar = 0, curtain = 0, lift = 0, detectors = 0 } = {}, time = 0) {
      if (BARE) return;
      group.visible = amount > 0.003;
      if (!group.visible) return;
      const cutOn = cutaway > 0.5 ? 1 : 0;
      const dimN = 1 - 0.7 * night; // by night the deck's things sink into the dark: the lights carry the ship
      deckMat.uniforms.uAmount.value = amount * dimN;
      deckMat.uniforms.uCut.value = cutOn;
      const pk = clamp01(parked / 0.6);
      for (const L of chainSets) L.userData.want = 0.3 * amount * dimN * pk;
      netM.uniforms.uAmount.value = amount * (1 - 0.65 * night);
      netM.uniforms.uCut.value = cutOn;
      lsoNet.material.uniforms.uAmount.value = amount * (1 - 0.5 * night) * clamp01(lso);
      lsoNet.visible = lso > 0.01;
      // the steam: day and wind; gone under the glass deck, with the catapult opened, in the cut
      const sk = amount * (1 - 0.6 * night) * (0.5 + 0.5 * clamp01(wind / 0.4)) * (1 - smooth(0.05, 0.3, under)) * (1 - smooth(0.02, 0.2, explode)) * (1 - smooth(0.02, 0.2, cutaway));
      steam.visible = sk > 0.003;
      steamM.uniforms.uAmount.value = sk;
      steamM.uniforms.uTime.value = time;
      // the hangar shows as navire.js shows it
      const inner = smooth(0.25, 0.6, under);
      const show = Math.max(clamp01(hangar), inner * 0.6, cutaway, clamp01(curtain), lift > 0.001 ? 0.6 : 0, clamp01(detectors) * 0.5);
      hangarMesh.visible = amount * show > 0.003;
      hangarMat.uniforms.uAmount.value = amount * show * (0.4 + 0.6 * clamp01(hangar));
      hangarMat.uniforms.uCut.value = cutOn;
    },
  };
}
// a reference the linter keeps: RAFALE's frame is the one the parked aircraft use (bord.js)
void RAFALE;
