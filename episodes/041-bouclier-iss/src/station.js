// DOSSIER 041 — AROUND, X-ray: the International Space Station, and what lives near it (docs/041-decors.md § station.js).
// True size, one place (plan.js): the origin is the impact point on the lab's +z flank, the station flies toward −x.
//   · the station (`ship`, the only thing the dodge moves): a faithful maquette of glass and fine lines, no solid surface —
//     the line of pressurised modules along x (Harmony with Columbus and Kibo, THE LAB, Unity with Tranquility and its
//     Cupola, Zarya, Zvezda), the truss across (z) above the lab, a lattice of 109 m, its four pairs of arrays (cells drawn
//     in the shader, melted to an even grey before they crowd), the radiators; Crew Dragon at the front, Soyuz under
//     Zarya, Progress at the back. The lab alone is detailed: its racks on the −z side, its end cones, a window left open
//     40 × 40 cm around the origin (the coupon of whipple.js is its wall there), its bumper 11.4 cm off the hull
//   · the shield on every module (`shield`, `ram`): the bumpers' panel seams, ink and faint at rest (it is already there),
//     veille once named; `ram` draws the ones that face the debris (the front cones, the flanks) thicker and brighter and
//     the Earth side paler — TP-2003-210788: not the same everywhere
//   · « toi » (`you`): a figure of glass in a dense glass sleeping bag along the lab's +z wall, the head nearest the
//     impact, the arms afloat in front (the posture of weightless sleep); it breathes (the bag swells a hair, 4.2 s)
//   · the cabin's air (`cabin`): a volume of pale ink light, ray-marched through the lab, denser against the +z wall; the
//     sleeper cuts a dark silhouette in it (dark on a halo)
//   · the crew (`crew`, `shelter`): six paler figures at their posts; the seven float through the hatches to Dragon (4)
//     and Soyuz (3); the hatches close on a veille ring. `capsules` picks the two capsules out
//   · the dodge: Progress's two short ink jets (`burn`), the station pushed aside (`dodge`), the baseball-size debris, a
//     signal light with a long trail, passing under the lab (`flyby`)
//   · far away, Kosmos 1408 (`kosmos`): the dead satellite tumbling, the hit (a light that has a place), its cloud of
//     1 500 signal streaks spreading along its orbit
//   · the next file (`teaser`, seen on the bench set): a tank of glass under seals, its turret roof alone in veille
// The Earth is NOT here: 026's dome (world.js). `flown` is the decorator's (what slides on the Earth).
// Three colours: ink the station, the crew, the capsules, the jets, the tank; veille the shield, the closed hatches, the
// tank's roof; signal the threats (the flyby, the Kosmos flash and cloud).
// update() is called sixteen times a frame: no allocation in it — uniforms, transforms, preallocated vectors.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, lineMat, anchor, mergeGeometries } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { rng } from "@kit/rng.js";
import { HERO, SLEEPER, MODULES, DRAGON, SOYUZ, PROGRESS, TRUSS, CREW, DODGE, FLYBY, KOSMOS, TEASER } from "./plan.js";
import { dressStation } from "./habillage.js"; // the decorator: the Earth at night under the station, the lab's loose things

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const VIEWPORT = new THREE.Vector2(BRAND.W, BRAND.H);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
/** How far the eye is from a part's axis a–b (the station lifted by dy): no allocation. */
const segDist = (e, a, b, dy) => {
  const px = e.x - a.x;
  const py = e.y - dy - a.y;
  const pz = e.z - a.z;
  const bx = b.x - a.x;
  const by = b.y - a.y;
  const bz = b.z - a.z;
  const t = Math.min(1, Math.max(0, (px * bx + py * by + pz * bz) / Math.max(1e-6, bx * bx + by * by + bz * bz)));
  return Math.hypot(px - bx * t, py - by * t, pz - bz * t);
};
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const [HX, HY, AZ] = HERO.centre; // the lab's axis: x along the station, at y 0, z −224.4
const BUMP = 11.4; // the bumper's standoff (TP-2003-210788 fig. 3-13)
const WIN = HERO.window; // the window left open around the origin, ±20 cm
const TILT = 58 * DEG; // the arrays turned about the truss (they track the sun): their faces toward the front and up
const RAD = 32 * DEG; // the radiators, hanging aft and down
const AIR = [(SLEEPER.head[0] + SLEEPER.feet[0]) / 2, (SLEEPER.head[1] + SLEEPER.feet[1]) / 2, (SLEEPER.head[2] + SLEEPER.feet[2]) / 2]; // the halo's centre

/* ───────────────────────────────────────────────────────────── geometry helpers (build time only) */

/** A module's own frame: x along its axis, from `at`. `at(x, r, a)`: a point at radius r, angle a (a = 90° faces +z
 *  for a module along x). */
function frame(at, axis = [1, 0, 0]) {
  const q = new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), V(...axis).normalize());
  const m = new THREE.Matrix4().compose(V(...at), q, V(1, 1, 1));
  const p = V();
  return {
    m, q,
    at: (x, r, a) => p.set(x, r * Math.cos(a), r * Math.sin(a)).applyMatrix4(m).toArray(),
    xyz: (x, y, z) => p.set(x, y, z).applyMatrix4(m).toArray(),
  };
}

/** A surface of revolution about x: `profile` [[x, r]…] (a point written twice is a crisp corner); `extra` angles to
 *  cut along; `hole(x, a)` leaves that quad out (the lab's window). */
function revolve(profile, { seg = 48, extra = [], hole = null } = {}) {
  const raw = [];
  for (let j = 0; j <= seg; j++) raw.push((j / seg) * TAU);
  raw.push(...extra);
  raw.sort((p, q) => p - q);
  const A = raw.filter((a, i) => i === 0 || a - raw[i - 1] > 1e-5);
  const pos = [];
  const idx = [];
  for (const [x, r] of profile) for (const a of A) pos.push(x, r * Math.cos(a), r * Math.sin(a));
  const n = A.length;
  for (let i = 0; i < profile.length - 1; i++) {
    for (let j = 0; j < n - 1; j++) {
      if (hole && hole((profile[i][0] + profile[i + 1][0]) / 2, (A[j] + A[j + 1]) / 2)) continue;
      const a0 = i * n + j;
      idx.push(a0, a0 + n, a0 + 1, a0 + 1, a0 + n, a0 + n + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Fine lines in screen pixels (≥ 1.8 px), one draw for a whole list of segments. */
function segments(list, material, parent, order = 2) {
  if (!list.length) return null;
  const geo = new LineSegmentsGeometry();
  geo.setPositions(list);
  const lines = new LineSegments2(geo, material);
  lines.frustumCulled = false;
  lines.renderOrder = order;
  parent.add(lines);
  return lines;
}
function ring(out, F, x, r, n = 48, hole = null) {
  for (let j = 0; j < n; j++) {
    const a0 = (j / n) * TAU;
    const a1 = ((j + 1) / n) * TAU;
    if (hole && hole(x, (a0 + a1) / 2)) continue;
    out.push(...F.at(x, r, a0), ...F.at(x, r, a1));
  }
}
function polyline(out, pts, closed = false) {
  for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) out.push(...pts[i], ...pts[(i + 1) % pts.length]);
}

/* ───────────────────────────────────────────────────────────── materials */

/** The arrays and radiators: a faint even fill, the bays' seams and the cells, each melted into the fill before it
 *  crowds under ~6 px (fwidth) — fine lines that would shimmer. `mast`: the gap down the middle of a wing. */
function panelMat({ fill = 0.07, bays = 32, cells = 8, mast = 0.09 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 }, uFill: { value: fill }, uBays: { value: bays }, uCells: { value: cells }, uMast: { value: mast } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uFill, uBays, uCells, uMast; varying vec2 vUv;
      float seam(float x, float w) {
        float fw = max(fwidth(x), 1e-5);
        return 1.0 - smoothstep(w * 0.5 - 0.5, w * 0.5 + 0.5, abs(fract(x + 0.5) - 0.5) / fw);
      }
      void main() {
        if (uAmount < 0.003) discard;
        float gap = uMast > 0.0 ? step(0.5 - uMast * 0.5, vUv.y) * step(vUv.y, 0.5 + uMast * 0.5) : 0.0;
        float bx = vUv.x * uBays;
        float keepB = 1.0 - smoothstep(0.1, 0.18, fwidth(bx));
        float cx = vUv.x * uBays * 3.0; float cy = vUv.y * uCells;
        float keepC = 1.0 - smoothstep(0.08, 0.16, max(fwidth(cx), fwidth(cy)));
        float lines = 0.2 * seam(bx, 1.9) * keepB + 0.08 * max(seam(cx, 1.8), seam(cy, 1.8)) * keepC;
        // what the seams gave, given back to the fill once they have melted: the wing keeps its value from afar
        float k = uFill * (1.0 + 0.6 * (1.0 - keepB)) + lines;
        gl_FragColor = vec4(uColor * k * (1.0 - gap) * uAmount, 1.0);
      }`,
  });
}

/** The cabin's air: the ray from the eye through the lab's volume (a cylinder along x, of radius uR, ±uL long), its
 *  length inside and a density higher against the +z wall (« derrière ta paroi, ton air »). Drawn on the back faces:
 *  it works from inside too. What writes depth before it (the sleeper's shell, the bag) cuts a dark silhouette in it. */
function airMat(R, L) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uC: { value: V(HX, HY, AZ) }, uR: { value: R }, uL: { value: L }, uAmount: { value: 0 }, uColor: { value: INK.clone() },
      uS: { value: V(...AIR) }, uSig: { value: V(170, 110, 95) }, // the halo: around the sleeper, against the +z wall
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    vertexShader: /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uC, uColor, uS, uSig; uniform float uR, uL, uAmount; varying vec3 vW;
      void main() {
        if (uAmount < 0.003) discard;
        vec3 ro = cameraPosition; vec3 rd = vW - ro; float tEnd = length(rd); rd /= max(tEnd, 1e-3);
        vec2 o = ro.yz - uC.yz; vec2 d = rd.yz;
        float a = max(dot(d, d), 1e-6); float b = dot(o, d); float c = dot(o, o) - uR * uR;
        float disc = b * b - a * c;
        if (disc <= 0.0) discard;
        float s = sqrt(max(disc, 0.0));
        float t0 = (-b - s) / a; float t1 = (-b + s) / a;
        float inv = 1.0 / (abs(rd.x) > 1e-5 ? rd.x : 1e-5);
        float ta = (uC.x - uL - ro.x) * inv; float tb = (uC.x + uL - ro.x) * inv;
        t0 = max(max(t0, min(ta, tb)), 0.0); t1 = min(min(t1, max(ta, tb)), tEnd);
        if (t1 <= t0) discard;
        float acc = 0.0;
        for (int i = 0; i < 8; i++) {
          vec3 p = ro + rd * mix(t0, t1, (float(i) + 0.5) / 8.0);
          vec3 q = (p - uS) / uSig;
          float ends = 1.0 - smoothstep(0.8, 1.0, abs(p.x - uC.x) / uL);
          acc += (0.06 + exp(-dot(q, q))) * ends;
        }
        float k = acc / 8.0 * clamp((t1 - t0) / (2.0 * uR), 0.0, 1.2);
        gl_FragColor = vec4(uColor * k * uAmount, 1.0);
      }`,
  });
}

/** A short ink jet: bright at the nozzle, gone in a few metres; brighter where it faces the eye (its core). */
function jetMat(len) {
  return new THREE.ShaderMaterial({
    uniforms: { uAmount: { value: 0 }, uColor: { value: INK.clone() }, uLen: { value: len } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uLen; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        vS = clamp(position.y / uLen, 0.0, 1.0);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        if (uAmount < 0.003) discard;
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float k = pow(clamp(1.0 - vS, 0.0, 1.0), 2.2) * (0.18 + 0.82 * pow(f, 1.6)) * 1.7 * uAmount;
        gl_FragColor = vec4(uColor * k, 1.0);
      }`,
  });
}

/** A ball of light with no edge, always facing the eye (026's makeGlow): a white-hot heart, a soft body, a short tail.
 *  `size` its radius in cm, never under `min` nor over `max` pixels. `at` is in the scene's frame. */
function makeGlow({ hue, heart = INK, size, min, max, order = 6 }) {
  const uniforms = {
    uView: { value: VIEWPORT }, uCenter: { value: V() }, uHue: { value: hue.clone() }, uHeart: { value: heart.clone() },
    uSize: { value: size }, uMin: { value: min }, uMax: { value: max }, uAmount: { value: 0 },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform vec3 uCenter; uniform float uSize, uMin, uMax, uAmount; uniform vec2 uView; varying vec2 vUv;
        void main() {
          vUv = position.xy;
          vec4 c = projectionMatrix * viewMatrix * vec4(uCenter, 1.0);
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (uAmount > 0.001 && c.w > 20.0) {
            float s = clamp(uSize * 0.5 * uView.y * projectionMatrix[1][1] / c.w, uMin, uMax);
            gl_Position = vec4(c.xy / c.w + position.xy * s / (uView * 0.5), c.z / c.w, 1.0);
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHue, uHeart; uniform float uAmount; varying vec2 vUv;
        void main() {
          float r2 = dot(vUv, vUv);
          float heart = exp(-r2 / 0.0045);
          float body = exp(-r2 / 0.05) * 0.4;
          float tail = 0.16 / (1.0 + r2 / 0.012) * (1.0 - smoothstep(0.5, 1.0, sqrt(min(r2, 1.0))));
          gl_FragColor = vec4((uHeart * heart * 2.4 + uHue * (body + tail)) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return { mesh, uniforms, at: uniforms.uCenter.value };
}

/** Streaks that fly out of a point: instance i is at `uCenter + aVel·uK`, drawn as the line it covered over the last
 *  `uLen` of k — head bright, tail gone, `uWidth` px wide, never shorter than `uMinPx` (a dot would hop). */
function makeStreaks(count, { width = 2.2, minPx = 3, len = 0.15, color = SIGNAL, gain = 1 } = {}) {
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 0, 1, 0, 1, 1, 0], 3));
  geo.setIndex([0, 1, 2, 2, 1, 3]);
  const vel = new Float32Array(count * 3);
  const bright = new Float32Array(count);
  geo.setAttribute("aVel", new THREE.InstancedBufferAttribute(vel, 3));
  geo.setAttribute("aBright", new THREE.InstancedBufferAttribute(bright, 1));
  geo.instanceCount = count;
  const uniforms = {
    uCenter: { value: V() }, uK: { value: 0 }, uLen: { value: len }, uWidth: { value: width }, uMinPx: { value: minPx },
    uView: { value: VIEWPORT }, uAmount: { value: 0 }, uColor: { value: color.clone().multiplyScalar(gain) }, uHeart: { value: INK.clone() },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform vec3 uCenter; uniform float uK, uLen, uWidth, uMinPx, uAmount; uniform vec2 uView;
        attribute vec3 aVel; attribute float aBright; varying float vU; varying float vV; varying float vB;
        void main() {
          vU = position.x; vV = position.y; vB = aBright;
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (uAmount < 0.002 || aBright <= 0.0) return;
          vec4 ch = projectionMatrix * viewMatrix * vec4(uCenter + aVel * uK, 1.0);
          vec4 ct = projectionMatrix * viewMatrix * vec4(uCenter + aVel * max(0.0, uK - uLen), 1.0);
          if (ch.w < 10.0 || ct.w < 10.0) return;
          vec2 hv = uView * 0.5;
          vec2 hp = ch.xy / ch.w * hv; vec2 tp = ct.xy / ct.w * hv;
          vec2 d = hp - tp; float l = length(d);
          vec2 dir = l > 0.001 ? d / l : vec2(1.0, 0.0);
          l = max(l, uMinPx);
          vec2 nrm = vec2(-dir.y, dir.x);
          vec2 p = hp - dir * l * (1.0 - position.x) + dir * (position.x - 0.5) * uWidth + nrm * position.y * uWidth * 0.5 * mix(0.4, 1.0, position.x);
          gl_Position = vec4(p / hv, clamp(ch.z / ch.w, -1.0, 1.0), 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor, uHeart; uniform float uAmount; varying float vU; varying float vV; varying float vB;
        void main() {
          float across = clamp(1.0 - vV * vV, 0.0, 1.0);
          float u = clamp(vU, 0.0, 1.0);
          vec3 c = uColor + uHeart * 0.7 * smoothstep(0.82, 1.0, u) * across;
          gl_FragColor = vec4(c * pow(u, 1.5) * across * vB * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  return { mesh, uniforms, vel, bright };
}

/** The tank's own patch of floor: a soft pool of light and a fine grid that fades out (the bench's floor is far away). */
function floorMat(R, cell) {
  return new THREE.ShaderMaterial({
    uniforms: { uAmount: { value: 0 }, uColor: { value: INK.clone() }, uR: { value: R }, uCell: { value: cell } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uR, uCell; varying vec2 vP;
      void main() {
        float r = length(vP) / uR;
        if (r > 1.0 || uAmount < 0.003) discard;
        vec2 g = vP / uCell; vec2 fw = max(fwidth(g), vec2(1e-4));
        vec2 d = abs(fract(g + 0.5) - 0.5) / fw;
        float line = (1.0 - clamp(min(d.x, d.y) / 1.9, 0.0, 1.0)) * (1.0 - smoothstep(0.12, 0.25, max(fw.x, fw.y)));
        float fade = pow(clamp(1.0 - r, 0.0, 1.0), 1.3);
        float pool = pow(clamp(1.0 - r * 1.4, 0.0, 1.0), 2.0);
        gl_FragColor = vec4(uColor * (0.11 * line * fade + 0.13 * pool) * uAmount, 1.0);
      }`,
  });
}

/* ───────────────────────────────────────────────────────────── the station */

/**
 * buildStation() → { group, ship, A, update(P, time, px, eye) }
 *   group  added to the scene as it is; `ship` (inside it) is the station itself, the only thing the dodge moves
 *   A      anchors: hero (the lab's centre), head (the sleeper's head), cabin, dragon, soyuz, progress, front (the front of
 *          Dragon), flyby (the baseball-size debris), kosmos (the satellite), teaser (the tank)
 *   update P = { shell, you, cabin, shield, ram, crew, shelter, capsules, burn, dodge, flyby, kosmos, teaser, flown,
 *                bench } — sixteen times a frame: no allocation.
 */
export function buildStation() {
  const group = new THREE.Group();
  const ship = new THREE.Group();
  group.add(ship);
  const dress = dressStation(); group.add(dress.group); // (not in `ship`: the Earth does not dodge — it moves the lab's things itself)
  const S = { racks: [], cap: [], hatch: [] }; // the lab's racks, the capsules, the hatches: faded with the station only
  const caps = []; // Dragon and Soyuz, their own glass (`capsules`)
  // PARTS. What comes near the camera fades out on its own (« ce qui ne sert pas au plan est invisible »): each side module,
  // each pair of arrays, each set of radiators, the outboard truss — a true-size station is all around a camera that flies
  // from the bille to the whole. The line of modules, the lab, the capsules never fade. Each part has its own materials;
  // `a`–`b` its axis, `R` its reach around it.
  const parts = [];
  const newPart = (a = null, b = null, R = 0) => {
    const p = {
      a: a && V(...a), b: b && V(...b), R, hulls: [],
      S: { outline: [], rings: [], truss: [], wing: [], shF: [], shM: [], shN: [] },
      m: {
        hull: glass(BRAND.ink, { base: 0, rim: 0.12, power: 2.8, edge: 0.3, spec: 0.2, through: 0.2 }),
        outline: lineMat(BRAND.ink, 2, { opacity: 0.5 }),
        rings: lineMat(BRAND.ink, 1.8, { opacity: 0.26 }),
        truss: lineMat(BRAND.ink, 1.8, { opacity: 0.4 }),
        wing: lineMat(BRAND.ink, 2, { opacity: 0.55 }),
        shF: lineMat(BRAND.ink, 2, { opacity: 0.1 }),
        shM: lineMat(BRAND.ink, 1.8, { opacity: 0.1 }),
        shN: lineMat(BRAND.ink, 1.8, { opacity: 0.1 }),
        wingP: panelMat({ fill: 0.07, bays: 32, cells: 8, mast: 0.09 }),
        radP: panelMat({ fill: 0.085, bays: 8, cells: 2, mast: 0 }),
        smallP: panelMat({ fill: 0.08, bays: 8, cells: 3, mast: 0 }),
      },
    };
    parts.push(p);
    return p;
  };
  const main = newPart();
  let cur = main;

  // the shield's seams go to one of three lists by the way their panel faces: the front and the flanks (where the
  // debris come from: drawn thicker on `ram`), the Earth side (paler), the rest
  const nW = V();
  const shieldSeg = (F, ax, a, p, q) => {
    const n = nW.set(ax, Math.cos(a), Math.sin(a)).normalize().applyQuaternion(F.q);
    const list = Math.max(-n.x, Math.abs(n.z)) > 0.6 ? cur.S.shF : n.y < -0.5 ? cur.S.shN : cur.S.shM;
    list.push(...p, ...q);
  };
  /** The bumper's panels over a module's barrel, at radius R: rings every ≈ 1.1 m, twelve seams around. */
  function shieldPanels(F, x0, x1, R, hole = null) {
    const nx = Math.max(2, Math.round((x1 - x0) / 160));
    for (let i = 0; i <= nx; i++) {
      const x = lerp(x0, x1, i / nx);
      for (let j = 0; j < 48; j++) {
        const a0 = (j / 48) * TAU;
        const a1 = ((j + 1) / 48) * TAU;
        if (hole && hole(x, (a0 + a1) / 2)) continue;
        shieldSeg(F, 0, (a0 + a1) / 2, F.at(x, R, a0), F.at(x, R, a1));
      }
    }
    for (let j = 0; j < 8; j++) {
      const a = ((j + 0.5) / 8) * TAU;
      for (let i = 0; i < nx * 2; i++) {
        const p = lerp(x0, x1, i / (nx * 2));
        const q = lerp(x0, x1, (i + 1) / (nx * 2));
        if (hole && hole((p + q) / 2, a)) continue;
        shieldSeg(F, 0, a, F.at(p, R, a), F.at(q, R, a));
      }
    }
  }
  /** A ring of the shield on an end cone: s −1 the low-x end, +1 the other (its normal leans along the axis). */
  function shieldCone(F, x, R, s) {
    for (let j = 0; j < 40; j++) {
      const a0 = (j / 40) * TAU;
      const a1 = ((j + 1) / 40) * TAU;
      const am = (a0 + a1) / 2;
      const n = nW.set(s * 0.75, 0.66 * Math.cos(am), 0.66 * Math.sin(am)).normalize().applyQuaternion(F.q);
      const list = Math.max(-n.x, Math.abs(n.z)) > 0.6 ? cur.S.shF : n.y < -0.5 ? cur.S.shN : cur.S.shM;
      list.push(...F.at(x, R, a0), ...F.at(x, R, a1));
    }
  }
  /** A pressurised module: a barrel with end cones and their berthing rings, its glass, its outline, its shield. */
  function pressurised(F, L, r, { cone = 0.09, end = 0.5, shield = true, profile = null } = {}) {
    const h = L / 2;
    const c = Math.min(cone * L, 0.45 * r);
    const prof = profile ?? [[-h, 0], [-h, r * end], [-h, r * end], [-h + c, r], [-h + c, r], [h - c, r], [h - c, r], [h, r * end], [h, r * end], [h, 0]];
    cur.hulls.push(revolve(prof, { seg: 48 }).applyMatrix4(F.m));
    ring(cur.S.outline, F, -h + c, r, 48);
    ring(cur.S.outline, F, h - c, r, 48);
    ring(cur.S.outline, F, -h, r * end, 32);
    ring(cur.S.outline, F, h, r * end, 32);
    if (shield) {
      shieldPanels(F, -h + c, h - c, r + BUMP);
      shieldCone(F, -h + c * 0.5, r * (1 + end) * 0.5 + BUMP, -1);
      shieldCone(F, h - c * 0.5, r * (1 + end) * 0.5 + BUMP, 1);
    }
  }
  /** A short connecting tube between two modules (a CBM vestibule, a PMA): glass and its two rings. */
  function adapter(x0, x1, r0, r1) {
    const F = frame([(x0 + x1) / 2, 0, AZ]);
    const h = (x1 - x0) / 2;
    cur.hulls.push(revolve([[-h, r0], [-h, r0], [h, r1], [h, r1]], { seg: 32 }).applyMatrix4(F.m));
    ring(cur.S.outline, F, -h, r0, 32);
    ring(cur.S.outline, F, h, r1, 32);
    ring(cur.S.rings, F, 0, (r0 + r1) / 2, 32);
  }

  /* ── THE LAB (the hero): its barrel cut finely around the window, its cones, its bumper, its racks ── */
  const labF = frame(HERO.centre);
  const LH = HERO.length / 2;
  const LC = 63;
  const LE = 104; // the berthing ring's radius
  const winAt = (r) => (x, a) => Math.abs(x) < WIN && Math.abs(a - Math.PI / 2) < WIN / r;
  const xs = [];
  for (let k = 0; k <= 30; k++) xs.push(-(LH - LC) + (k / 30) * 2 * (LH - LC));
  xs.push(-WIN, WIN);
  xs.sort((p, q) => p - q);
  const barrel = (r) => xs.map((x) => [x, r]);
  const labGeo = revolve([[-LH, 0], [-LH, LE], [-LH, LE], [xs[0], HERO.r], ...barrel(HERO.r), [xs[xs.length - 1], HERO.r], [LH, LE], [LH, LE], [LH, 0]], {
    seg: 96, extra: [Math.PI / 2 - WIN / HERO.r, Math.PI / 2 + WIN / HERO.r], hole: winAt(HERO.r),
  }).applyMatrix4(labF.m);
  ring(main.S.outline, labF, -(LH - LC), HERO.r, 64);
  ring(main.S.outline, labF, LH - LC, HERO.r, 64);
  ring(main.S.outline, labF, -LH, LE, 40);
  ring(main.S.outline, labF, LH, LE, 40);
  ring(main.S.outline, labF, -LH + 8, LE * 0.8, 32);
  ring(main.S.outline, labF, LH - 8, LE * 0.8, 32);
  const RB = HERO.r + BUMP - 0.1; // the bumper's outer face (the coupon's is 224.4)
  const bumperGeo = revolve(barrel(RB), { seg: 96, extra: [Math.PI / 2 - WIN / RB, Math.PI / 2 + WIN / RB], hole: winAt(RB) }).applyMatrix4(labF.m);
  shieldPanels(labF, -(LH - LC), LH - LC, RB + 0.6, winAt(RB));
  shieldCone(labF, -LH + LC * 0.5, (HERO.r + LE) * 0.5 + BUMP, -1);
  shieldCone(labF, LH - LC * 0.5, (HERO.r + LE) * 0.5 + BUMP, 1);
  // the racks, the −z side only: six bays, their faces on a plane 1 m off the axis, their tops running back to the hull
  {
    const zf = AZ - 100;
    const zb = AZ - 178;
    const x0 = -318;
    for (let k = 0; k <= 6; k++) {
      const x = x0 + k * 106;
      S.racks.push(x, -92, zf, x, 92, zf);
      S.racks.push(x, 92, zf, x, 92 * 0.86, zb, x, -92, zf, x, -92 * 0.86, zb);
    }
    S.racks.push(x0, 92, zf, -x0, 92, zf, x0, -92, zf, -x0, -92, zf);
    for (let k = 0; k < 6; k++) {
      const x = x0 + k * 106;
      S.racks.push(x + 8, 18, zf, x + 98, 18, zf); // a shelf
      S.racks.push(x + 8, -40, zf, x + 98, -40, zf);
    }
  }

  /* ── the other modules, along the line (plan.js) ── */
  const M = MODULES;
  pressurised(frame([M.harmony.x, 0, AZ]), M.harmony.length, M.harmony.r);
  pressurised(frame([M.unity.x, 0, AZ]), M.unity.length, M.unity.r);
  {
    const h = M.zarya.length / 2;
    const r = M.zarya.r;
    pressurised(frame([M.zarya.x, 0, AZ]), M.zarya.length, r, {
      profile: [[-h, 0], [-h, 75], [-h, 75], [-h + 45, 145], [-h + 45, 145], [-h + 330, 145], [-h + 330, 145], [-h + 420, r], [-h + 420, r], [h - 45, r], [h - 45, r], [h, 140], [h, 140], [h, 0]],
    });
  }
  {
    const h = M.zvezda.length / 2;
    const r = M.zvezda.r;
    pressurised(frame([M.zvezda.x, 0, AZ]), M.zvezda.length, r, {
      profile: [[-h, 0], [-h, 70], [-h, 70], [-h + 30, 112], [-h + 85, 130], [-h + 140, 112], [-h + 170, 96], [-h + 170, 96], [-h + 185, 145], [-h + 185, 145], [-h + 560, 145], [-h + 560, 145], [-h + 615, r], [-h + 615, r], [h - 50, r], [h - 50, r], [h, 120], [h, 120], [h, 0]],
    });
  }
  {
    const m = M.columbus;
    cur = newPart([m.x, 0, AZ + m.side * 220], [m.x, 0, AZ + m.side * (220 + m.length)], m.r + 20);
    pressurised(frame([m.x, 0, AZ + m.side * (220 + m.length / 2)], [0, 0, m.side]), m.length, m.r);
  }
  // Tranquility on Unity, mirrored like Columbus and Kibo (−z), its Cupola on the nadir: the seven windows of the ISS
  const NODE3 = { x: M.unity.x, z: AZ - (220 + 335), r: 220, length: 670 };
  cur = newPart([NODE3.x, 0, AZ - 220], [NODE3.x, 0, AZ - 220 - NODE3.length], 380);
  pressurised(frame([NODE3.x, 0, NODE3.z], [0, 0, -1]), NODE3.length, NODE3.r);
  {
    const F = frame([NODE3.x, -NODE3.r + 4, NODE3.z], [0, -1, 0]);
    cur.hulls.push(revolve([[0, 148], [0, 148], [62, 148], [62, 148], [112, 92], [112, 92], [118, 0]], { seg: 6 * 8 }).applyMatrix4(F.m));
    ring(cur.S.outline, F, 62, 148, 6);
    ring(cur.S.outline, F, 112, 92, 6);
    ring(cur.S.outline, F, 117, 42, 24); // the round window on top
    for (let k = 0; k < 6; k++) {
      const a = ((k + 0.5) / 6) * TAU;
      cur.S.outline.push(...F.at(62, 148, (k / 6) * TAU), ...F.at(112, 92, (k / 6) * TAU));
      cur.S.rings.push(...F.at(70, 136, a - 0.32), ...F.at(104, 98, a - 0.26), ...F.at(70, 136, a + 0.32), ...F.at(104, 98, a + 0.26));
    }
  }
  // Kibo's logistics module on top, its exposed platform at the end (frames of lines)
  {
    const m = M.kibo;
    cur = newPart([m.x, 0, AZ + m.side * 220], [m.x, 0, AZ + m.side * (220 + m.length + 500)], 470);
    pressurised(frame([m.x, 0, AZ + m.side * (220 + m.length / 2)], [0, 0, m.side]), m.length, m.r);
    const zk = AZ + M.kibo.side * (220 + M.kibo.length * 0.75);
    pressurised(frame([M.kibo.x, M.kibo.r + 200, zk], [0, 1, 0]), 400, 210, { shield: false });
    const ze = AZ + M.kibo.side * (220 + M.kibo.length);
    const z1 = ze + M.kibo.side * 500;
    const bx = [M.kibo.x - 250, M.kibo.x + 250];
    const by = [-60, 60];
    for (const x of bx) for (const y of by) cur.S.outline.push(x, y, ze, x, y, z1);
    for (const z of [ze, z1]) polyline(cur.S.outline, [[bx[0], by[0], z], [bx[1], by[0], z], [bx[1], by[1], z], [bx[0], by[1], z]], true);
    for (let k = 1; k < 4; k++) {
      const z = lerp(ze, z1, k / 4);
      cur.S.rings.push(bx[0], by[1], z, bx[1], by[1], z);
    }
  }
  cur = main;
  // the vestibules and adapters that tie the line together
  adapter(M.harmony.x + M.harmony.length / 2, -LH, 108, 108);
  adapter(M.unity.x + M.unity.length / 2, M.zarya.x - M.zarya.length / 2, 112, 78);
  adapter(M.zarya.x + M.zarya.length / 2, M.zvezda.x - M.zvezda.length / 2, 100, 70);
  adapter(DRAGON.at[0] + DRAGON.length / 2, M.harmony.x - M.harmony.length / 2, 80, 110); // PMA-2 and its docking adapter

  /* ── the capsules: Crew Dragon at the front, Soyuz under Zarya; Progress at the back (part of the station's glass) ── */
  const dragonF = frame(DRAGON.at, DRAGON.axis);
  {
    const h = DRAGON.length / 2;
    caps.push(revolve([[-h, 0], [-h, 66], [-h, 66], [-h + 22, 80], [-h + 22, 80], [30, 196], [30, 196], [44, 184], [44, 184], [h, 184], [h, 184], [h, 0]], { seg: 48 }).applyMatrix4(dragonF.m));
    for (const [x, r] of [[-h + 22, 80], [30, 196], [44, 184], [h, 184], [-h, 66]]) ring(S.cap, dragonF, x, r, 48);
    ring(S.cap, dragonF, 130, 184, 48);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU + Math.PI / 4;
      S.cap.push(...dragonF.at(44, 184, a), ...dragonF.at(h, 184, a)); // the trunk's seams
      S.cap.push(...dragonF.at(h - 70, 184, a), ...dragonF.at(h, 236, a)); // its fins
    }
  }
  const soyuzF = frame(SOYUZ.at, SOYUZ.axis);
  {
    const h = SOYUZ.length / 2;
    caps.push(revolve([[-h, 0], [-h, 38], [-h, 38], [-h + 18, 78], [-h + 50, 105], [-h + 105, 116], [-h + 160, 105], [-h + 195, 78], [-h + 210, 52], [-h + 210, 52], [-h + 222, 72], [25, 108], [25, 108], [40, 112], [40, 112], [60, 128], [60, 128], [h - 20, 128], [h - 20, 128], [h, 140], [h, 140], [h, 0]], { seg: 48 }).applyMatrix4(soyuzF.m));
    for (const [x, r] of [[-h + 105, 116], [-h + 210, 52], [25, 108], [60, 128], [h - 20, 128], [h, 140]]) ring(S.cap, soyuzF, x, r, 48);
  }
  const progressF = frame(PROGRESS.at, PROGRESS.axis);
  {
    const h = PROGRESS.length / 2;
    main.hulls.push(revolve([[-h, 0], [-h, 38], [-h, 38], [-h + 16, 78], [-h + 52, 106], [-h + 130, 114], [-h + 220, 104], [-h + 262, 86], [-h + 262, 86], [-h + 330, 86], [-h + 330, 86], [-h + 345, 128], [-h + 345, 128], [h - 20, 128], [h - 20, 128], [h, 140], [h, 140], [h, 0]], { seg: 40 }).applyMatrix4(progressF.m));
    for (const [x, r] of [[-h + 130, 114], [-h + 262, 86], [-h + 345, 128], [h - 20, 128], [h, 140]]) ring(main.S.outline, progressF, x, r, 40);
  }

  /* ── the truss: a lattice of 109 m across the lab's zenith, its struts, its rotary joints ── */
  {
    const y0 = TRUSS.y;
    const w = TRUSS.w / 2;
    const CX = [-w, w, w, -w];
    const CY = [y0 - w, y0 - w, y0 + w, y0 + w];
    const [z0, z1] = TRUSS.z;
    const n = Math.round((z1 - z0) / 300);
    const trussP = newPart([0, y0, z0], [0, y0, AZ - 2650], 340);
    const trussS = newPart([0, y0, AZ + 2650], [0, y0, z1], 340);
    const T = (z) => (z < AZ - 2650 ? trussP : z > AZ + 2650 ? trussS : main).S.truss;
    for (let i = 0; i <= n; i++) {
      const z = lerp(z0, z1, i / n);
      for (let c = 0; c < 4; c++) T(z).push(CX[c], CY[c], z, CX[(c + 1) % 4], CY[(c + 1) % 4], z);
      if (i === n) break;
      const z2 = lerp(z0, z1, (i + 1) / n);
      for (let c = 0; c < 4; c++) {
        const a = i % 2 ? c : (c + 1) % 4;
        const b = i % 2 ? (c + 1) % 4 : c;
        T((z + z2) / 2).push(CX[c], CY[c], z, CX[c], CY[c], z2);
        T((z + z2) / 2).push(CX[a], CY[a], z, CX[b], CY[b], z2);
      }
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) main.S.truss.push(sx * 110, HERO.r - 6, AZ + sz * 90, sx * 130, y0 - w, AZ + sz * 140);
    for (const zj of [AZ - 2650, AZ + 2650]) {
      for (const dz of [-30, 30]) {
        const F = frame([0, y0, zj + dz], [0, 0, 1]);
        ring(main.S.outline, F, 0, w * 1.45, 40);
      }
    }
  }

  /* ── the arrays: four pairs at the truss's ends, the radiators on its inner segments; Zvezda's, Soyuz's, Progress's ── */
  const plane = (kind, c, e, wv, len, wid) => {
    const mat = cur.m[kind];
    const g = new THREE.PlaneGeometry(len, wid);
    const n = new THREE.Vector3().crossVectors(e, wv).normalize();
    g.applyMatrix4(new THREE.Matrix4().makeBasis(e, wv, n).setPosition(c));
    const mesh = new THREE.Mesh(g, mat);
    mesh.renderOrder = 6;
    ship.add(mesh);
    const p = (u, v) => c.clone().addScaledVector(e, u * len * 0.5).addScaledVector(wv, v * wid * 0.5).toArray();
    polyline(cur.S.wing, [p(-1, -1), p(1, -1), p(1, 1), p(-1, 1)], true);
    return p;
  };
  {
    const e = V(Math.cos(TILT), Math.sin(TILT), 0);
    const zw = V(0, 0, 1);
    const [len, wid] = TRUSS.wing;
    for (const za of TRUSS.arrays) {
      const pivot = V(0, TRUSS.y, za + AZ);
      cur = newPart(pivot.clone().addScaledVector(e, -(150 + len)).toArray(), pivot.clone().addScaledVector(e, 150 + len).toArray(), wid * 0.5 + 120);
      for (const s of [-1, 1]) {
        const es = e.clone().multiplyScalar(s);
        const p = plane("wingP", pivot.clone().addScaledVector(es, 150 + len / 2), es, zw, len, wid);
        cur.S.wing.push(...p(-1, 0), ...p(1, 0)); // the mast
        cur.S.wing.push(...pivot.clone().addScaledVector(es, 60).toArray(), ...p(-1, 0));
      }
    }
    const d = V(Math.sin(RAD), -Math.cos(RAD), 0);
    for (const sz of [-1, 1]) {
      const base = V(0, TRUSS.y - TRUSS.w / 2, AZ + sz * 1350);
      cur = newPart(base.toArray(), base.clone().addScaledVector(d, 2450).toArray(), 620);
      for (const dz of [-340, 0, 340]) plane("radP", base.clone().add(V(0, 0, dz)).addScaledVector(d, 100 + 1150), d, zw, 2300, 320);
    }
    cur = main;
    // Zvezda's two wings, along ±z, turned like the big ones
    const wv = V(Math.cos(TILT), Math.sin(TILT), 0);
    for (const s of [-1, 1]) plane("smallP", V(M.zvezda.x + 450, 0, AZ + s * (M.zvezda.r + 40 + 530)), V(0, 0, s), wv, 1060, 330);
    // Soyuz's and Progress's small wings on their service modules
    for (const s of [-1, 1]) plane("smallP", V(SOYUZ.at[0] + s * (150 + 250), SOYUZ.at[1] - 250, AZ), V(s, 0, 0), V(0, 1, 0), 500, 110);
    for (const s of [-1, 1]) plane("smallP", V(PROGRESS.at[0] + 200, 0, AZ + s * (150 + 250)), V(0, 0, s), V(1, 0, 0), 500, 110);
  }

  /* ── the hatches of the shelter: a veille ring where each capsule meets the station, shut on `shelter` 1 ── */
  {
    const F = frame([DRAGON.at[0] + DRAGON.length / 2 + 4, 0, AZ]);
    ring(S.hatch, F, 0, 58, 40);
    S.hatch.push(...F.at(0, 58, 0), ...F.at(0, 58, Math.PI));
    const G = frame([SOYUZ.at[0], SOYUZ.at[1] + SOYUZ.length / 2 + 4, AZ], [0, -1, 0]);
    ring(S.hatch, G, 0, 34, 32);
    S.hatch.push(...G.at(0, 34, 0), ...G.at(0, 34, Math.PI));
  }

  /* ── the glass and the lines ── */
  const labMat = glass(BRAND.ink, { base: 0, rim: 0.16, power: 2.6, edge: 0.42, spec: 0.3, through: 0.22 });
  const capMat = glass(BRAND.ink, { base: 0, rim: 0.14, power: 2.6, edge: 0.36, spec: 0.25, through: 0.2 });
  const bumperMat = glass(BRAND.ink, { base: 0, rim: 0.06, power: 3, edge: 0.2, spec: 0.1 });
  const shells = [];
  for (const p of parts) {
    if (p.hulls.length) {
      const mesh = new THREE.Mesh(mergeGeometries(p.hulls), p.m.hull);
      ship.add(mesh);
      shells.push(mesh);
    }
    for (const key of Object.keys(p.S)) segments(p.S[key], p.m[key], ship, 2);
  }
  const lab = new THREE.Mesh(labGeo, labMat);
  const capsule = new THREE.Mesh(mergeGeometries(caps), capMat);
  const bumper = new THREE.Mesh(bumperGeo, bumperMat);
  ship.add(lab, capsule, bumper);
  asShell([...shells, lab, capsule], 20);
  asShell(bumper, 22); // after the hull: both surfaces show, the bumper a hand's breadth outside

  const fx = {
    outline: main.m.outline,
    racks: lineMat(BRAND.ink, 1.8, { opacity: 0.24 }),
    cap: lineMat(BRAND.ink, 2, { opacity: 0.5 }),
    hatch: lineMat(BRAND.veille, 3, { opacity: 0, hdr: 1.4 }),
  };
  for (const key of Object.keys(S)) segments(S[key], fx[key], ship, key === "hatch" ? 4 : 2);

  /* ── « toi » : the sleeper in his bag along the +z wall, the head nearest the impact ── */
  const BAG_ORDER = 14;
  const you = makeFigure({ shell: true, hands: "flat", order: 10, glassK: 1.25, through: 0.12 }); // bright lips: dark on the halo, never a stick
  // the neutral posture of weightless sleep: the arms afloat in front, a little up; the trunk barely forward
  you.reach("L", V(22, 140, 44), V(0.5, -0.6, 0.1), { dir: V(0.1, 0.3, 1), palm: V(0, -1, 0.2) });
  you.reach("R", V(-21, 135, 46), V(-0.5, -0.6, 0.1), { dir: V(-0.1, 0.25, 1), palm: V(0, -1, 0.2) });
  you.leg("L", V(8, 9, 4));
  you.leg("R", V(-8, 11, 2));
  you.lean(5, 0, 0);
  // lying along +x, head toward −x (the front), on his back (the face up, +y), his right side to the +z wall: seen in
  // profile from outside as from the cabin
  const youQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(0, 0, -1), V(-1, 0, 0), V(0, 1, 0)));
  const [shx, shy, shz] = SLEEPER.head;
  const youAt = V(shx + 166.5, shy - 1, shz); // the head's centre is 166.5 cm up the figure, 1 cm in front
  // the hands of glass (the head alone stays solid: the life the shield protects); a solid mitten close up is a blob
  for (const m of you.skin) {
    if (m === you.head) continue;
    m.material = you.body;
    m.castShadow = false;
    asShell(m, 10);
  }
  you.group.quaternion.copy(youQ);
  you.group.position.copy(youAt);
  ship.add(you.group);
  you.flesh.transparent = true;
  // the bag: denser glass than the body, from the feet to the armpits, quilted; it stays on the wall if you leave it
  const bagGroup = new THREE.Group();
  bagGroup.quaternion.copy(youQ);
  bagGroup.position.copy(youAt);
  ship.add(bagGroup);
  const BAG = [[0.5, -10], [12, -8], [17, 4], [19.5, 30], [22.5, 60], [25.5, 92], [27, 112], [26, 124], [23.5, 131]];
  const bagMat = glass(BRAND.ink, { base: 0.004, rim: 0.5, power: 2.0, edge: 0.42, spec: 0.45, through: 0.3 });
  const bag = new THREE.Mesh(new THREE.LatheGeometry(BAG.map(([r, y]) => new THREE.Vector2(r, y)), 40), bagMat);
  bag.position.z = 1;
  bagGroup.add(bag);
  asShell(bag, BAG_ORDER);
  const bagLines = lineMat(BRAND.ink, 1.8, { opacity: 0.3 });
  {
    const q = [];
    const rAt = (y) => {
      for (let i = 1; i < BAG.length; i++) if (BAG[i][1] >= y) return lerp(BAG[i - 1][0], BAG[i][0], (y - BAG[i - 1][1]) / (BAG[i][1] - BAG[i - 1][1]));
      return BAG[BAG.length - 1][0];
    };
    for (const y of [22, 50, 78, 104, 131]) {
      const r = rAt(y) + 0.4;
      for (let j = 0; j < 28; j++) {
        const a0 = (j / 28) * TAU;
        const a1 = ((j + 1) / 28) * TAU;
        q.push(r * Math.sin(a0), y, r * Math.cos(a0), r * Math.sin(a1), y, r * Math.cos(a1));
      }
    }
    segments(q, bagLines, bag, 3);
    // the two tethers from the bag's back to the wall (+z in the station)
    const t = [];
    for (const y of [40, 108]) t.push(-rAt(y), y, 1, -rAt(y) - 24, y, 1); // local −x is the station's +z
    segments(t, bagLines, bagGroup, 3);
  }
  // the cabin's air
  const air = new THREE.Mesh(new THREE.CylinderGeometry(200, 200, HERO.length - 2 * LC, 40, 1, false), airMat(200, (HERO.length - 2 * LC) / 2));
  air.rotation.z = Math.PI / 2;
  air.position.set(...HERO.centre);
  air.renderOrder = 16; // after the sleeper's and the bag's shells (their silhouette), before the hull's
  ship.add(air);

  /* ── the crew: six paler figures afloat at their posts; on `shelter` the seven go through the hatches ── */
  const CEN = V(0, 95, 0); // a figure's middle, in its own frame
  const r = rng(41);
  const pathOf = (pts) => {
    const P = pts.map((p) => V(...p));
    const L = [0];
    for (let i = 1; i < P.length; i++) L.push(L[i - 1] + P[i].distanceTo(P[i - 1]));
    return { P, L, total: L[L.length - 1] };
  };
  const along = (path, u, out) => {
    const s = u * path.total;
    let i = 1;
    while (i < path.L.length - 1 && path.L[i] < s) i++;
    return out.lerpVectors(path.P[i - 1], path.P[i], clamp01((s - path.L[i - 1]) / Math.max(1e-6, path.L[i] - path.L[i - 1])));
  };
  const gateD = [DRAGON.at[0] + DRAGON.length / 2 + 55, 0, AZ];
  const gateS = [[SOYUZ.at[0], 0, AZ], [SOYUZ.at[0], SOYUZ.at[1] + SOYUZ.length / 2 + 10, AZ]];
  const dx = DRAGON.at[0] + 75;
  const DSEAT = [[dx, -50, AZ - 50], [dx, 50, AZ - 50], [dx, -50, AZ + 50], [dx, 50, AZ + 50]];
  const sy = SOYUZ.at[1] - 10;
  const SSEAT = [[SOYUZ.at[0] - 45, sy, AZ - 32], [SOYUZ.at[0] + 45, sy, AZ - 32], [SOYUZ.at[0], sy, AZ + 48]];
  const inDragon = CREW.dragon - 1; // the sleeper is the fourth
  const crew = CREW.posts.map((post, i) => {
    const f = makeFigure({ shell: true, hands: "ball", order: 11, glassK: 1, spec: 0, through: 0.08 });
    f.flesh.transparent = true;
    f.reach("L", V(20 + r() * 12, 112 + r() * 26, 14 + r() * 26));
    f.reach("R", V(-20 - r() * 12, 108 + r() * 28, 12 + r() * 28));
    f.leg("L", V(9, 10 + r() * 14, -4 - r() * 14));
    f.leg("R", V(-9, 8 + r() * 16, -2 - r() * 14));
    f.lean(r() * 16 - 4, 0, 0);
    f.group.rotation.set((r() - 0.5) * 50 * DEG, r() * TAU, (r() - 0.5) * 40 * DEG, "YXZ");
    const off = CEN.clone().applyQuaternion(f.group.quaternion);
    const hub = post[2] > AZ + 150 ? [M.columbus.x, 0, AZ] : [post[0], 0, AZ];
    const path = pathOf(i < inDragon ? [post, hub, gateD, DSEAT[i]] : [post, hub, ...gateS, SSEAT[i - inDragon]]);
    f.body.uniforms.uAmount.value = 0;
    ship.add(f.group);
    return { f, off, path, delay: [0.02, 0.1, 0.05, 0.0, 0.12, 0.07][i] ?? 0.05, phase: r() * TAU };
  });
  const youOff = CEN.clone().applyQuaternion(youQ);
  const youStart = youAt.clone().add(youOff);
  const youPath = pathOf([youStart.toArray(), [youStart.x - 60, 0, AZ + 40], [-300, 0, AZ], gateD, DSEAT[inDragon]]);

  /* ── the dodge: Progress's jets, the debris going by ── */
  const JET = { len: 620, at: PROGRESS.at[0] + PROGRESS.length / 2 + 6 };
  const jetM = jetMat(JET.len);
  const jetGeo = new THREE.LatheGeometry([new THREE.Vector2(16, 0), new THREE.Vector2(34, 80), new THREE.Vector2(70, 320), new THREE.Vector2(105, JET.len)], 24);
  const jetGlow = [];
  for (const s of [-1, 1]) {
    const jet = new THREE.Mesh(jetGeo, jetM);
    jet.rotation.z = -Math.PI / 2; // its length along +x: the exhaust goes aft, the push forward (a prograde burn raises the orbit)
    jet.position.set(JET.at, s * 44, AZ);
    jet.renderOrder = 7;
    ship.add(jet);
    const g = makeGlow({ hue: INK, size: 60, min: 6, max: 18 });
    group.add(g.mesh);
    jetGlow.push({ g, y: s * 44 });
  }
  {
    const nozzles = [];
    for (const s of [-1, 1]) {
      const F = frame([JET.at - 4, s * 44, AZ]);
      ring(nozzles, F, 0, 14, 16);
      ring(nozzles, F, -18, 9, 16);
    }
    segments(nozzles, fx.outline, ship, 2);
  }
  const flyHead = makeGlow({ hue: SIGNAL, heart: INK, size: 40, min: 15, max: 30, order: 8 });
  const flyTrail = makeStreaks(1, { width: 8, minPx: 60, len: 0.18, color: SIGNAL, gain: 1.3 });
  flyTrail.vel.set([FLYBY.to[0] - FLYBY.from[0], FLYBY.to[1] - FLYBY.from[1], FLYBY.to[2] - FLYBY.from[2]]);
  flyTrail.bright[0] = 1;
  flyTrail.uniforms.uCenter.value.set(...FLYBY.from);
  const flyAt = new THREE.Object3D();
  group.add(flyHead.mesh, flyTrail.mesh, flyAt);

  /* ── far away: Kosmos 1408, the hit, its cloud ── */
  const sat = new THREE.Group();
  sat.position.set(...KOSMOS.at);
  group.add(sat);
  const satGlass = glass(BRAND.ink, { base: 0.01, rim: 0.3, power: 2.2, edge: 0.4 });
  const satBody = new THREE.Mesh(new THREE.BoxGeometry(520, 220, 220), satGlass);
  satBody.renderOrder = 6;
  sat.add(satBody);
  const satLines = lineMat(BRAND.ink, 2, { opacity: 0 });
  segments([...new THREE.EdgesGeometry(satBody.geometry).attributes.position.array], satLines, sat, 3);
  const satWing = panelMat({ fill: 0.1, bays: 6, cells: 2, mast: 0 });
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(200, 620), satWing);
    w.rotation.x = Math.PI / 2;
    w.position.set(0, 0, s * (110 + 320));
    w.renderOrder = 6;
    sat.add(w);
    const z0 = s * 120;
    const z1 = s * 740;
    segments([-100, 0, z0, 100, 0, z0, 100, 0, z0, 100, 0, z1, 100, 0, z1, -100, 0, z1, -100, 0, z1, -100, 0, z0], satLines, sat, 3);
  }
  const satGlint = makeGlow({ hue: INK, size: 120, min: 4, max: 10 });
  satGlint.at.set(...KOSMOS.at);
  const flash = makeGlow({ hue: SIGNAL, heart: INK, size: 5200, min: 18, max: 170, order: 8 });
  flash.at.set(...KOSMOS.at);
  const cloud = makeStreaks(KOSMOS.count, { width: 2.2, minPx: 3.5, len: 0.2, color: SIGNAL, gain: 1 });
  {
    const k = rng(1408);
    const gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-6, k()))) * Math.cos(TAU * k());
    const al = V(...KOSMOS.along).normalize();
    const up = V(0, 1, 0);
    const cross = V().crossVectors(al, up).normalize();
    const v = V();
    for (let i = 0; i < KOSMOS.count; i++) {
      v.copy(al).multiplyScalar(gauss() * 0.5).addScaledVector(up, gauss() * 0.06).addScaledVector(cross, gauss() * 0.05).multiplyScalar(KOSMOS.spread);
      cloud.vel.set([v.x, v.y, v.z], i * 3);
      cloud.bright[i] = 0.3 + 0.5 * k() * k();
    }
    cloud.uniforms.uCenter.value.set(...KOSMOS.at);
  }
  group.add(satGlint.mesh, flash.mesh, cloud.mesh);

  /* ── the next file (042): a tank of glass under seals in the dark, its turret roof alone in veille ── */
  const tank = new THREE.Group();
  tank.position.set(...TEASER.at);
  tank.rotation.y = TEASER.heading * DEG;
  group.add(tank);
  const tankGlass = glass(BRAND.ink, { base: 0, rim: 0.16, power: 2.6, edge: 0.4, spec: 0.25, through: 0.18 });
  const tankLines = lineMat(BRAND.ink, 1.8, { opacity: 0 });
  const roofLines = lineMat(BRAND.veille, 3, { opacity: 0, hdr: 1.5 });
  const tankParts = [];
  const tankEdges = [];
  const addTankPart = (geo, threshold = 25) => {
    const m = new THREE.Mesh(geo, tankGlass);
    tank.add(m);
    tankParts.push(m);
    tankEdges.push(...new THREE.EdgesGeometry(geo, threshold).attributes.position.array);
  };
  const extrudeXY = (pts, depth, z0) => {
    const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 10 });
    g.translate(0, 0, z0);
    return g;
  };
  addTankPart(extrudeXY([[-345, 48], [292, 48], [345, 92], [345, 128], [205, 182], [-318, 182], [-345, 150]], 236, -118));
  for (const s of [-1, 1]) {
    const sh = new THREE.Shape();
    sh.moveTo(-300, 4);
    sh.lineTo(300, 4);
    sh.absarc(300, 50, 46, -Math.PI / 2, Math.PI / 2, false);
    sh.lineTo(-300, 96);
    sh.absarc(-300, 50, 46, Math.PI / 2, (3 * Math.PI) / 2, false);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 62, bevelEnabled: false, curveSegments: 10 });
    g.translate(0, 0, s > 0 ? 120 : -182);
    addTankPart(g, 40);
  }
  const TURRET = [[-150, -150], [95, -150], [205, -72], [205, 72], [95, 150], [-150, 150]];
  {
    const g = extrudeXY(TURRET, 78, 0);
    g.rotateX(-Math.PI / 2); // the footprint (x, z) flat, its height up
    g.translate(0, 182, 0);
    addTankPart(g);
    const gun = new THREE.CylinderGeometry(8, 9.5, 400, 16, 1, false);
    gun.rotateZ(-Math.PI / 2);
    gun.translate(205 + 30 + 200, 222, 0);
    addTankPart(gun, 40);
    addTankPart(new THREE.BoxGeometry(34, 48, 74).translate(220, 222, 0));
  }
  asShell(tankParts, 20);
  // the road wheels, the sprocket and the idler, on the tracks' outer faces
  for (const s of [-1, 1]) {
    const z = s * 183;
    for (let k = 0; k < 7; k++) {
      const x = -255 + k * 85;
      for (let j = 0; j < 20; j++) {
        const a0 = (j / 20) * TAU;
        const a1 = ((j + 1) / 20) * TAU;
        tankEdges.push(x + 30 * Math.cos(a0), 40 + 30 * Math.sin(a0), z, x + 30 * Math.cos(a1), 40 + 30 * Math.sin(a1), z);
      }
    }
  }
  segments(tankEdges, tankLines, tank, 2);
  {
    // the roof: the turret's top outlined, its hatch; a faint veille over it
    const y = 260.6;
    const q = [];
    polyline(q, TURRET.map(([x, z]) => [x, y, -z]), true);
    for (let j = 0; j < 24; j++) {
      const a0 = (j / 24) * TAU;
      const a1 = ((j + 1) / 24) * TAU;
      q.push(-40 + 30 * Math.cos(a0), y, 62 + 30 * Math.sin(a0), -40 + 30 * Math.cos(a1), y, 62 + 30 * Math.sin(a1));
    }
    segments(q, roofLines, tank, 4);
  }
  const roofFill = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(TURRET.map(([x, z]) => new THREE.Vector2(x, z)))).rotateX(Math.PI / 2).translate(0, 260.4, 0),
    new THREE.MeshBasicMaterial({ color: VEILLE, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
  );
  roofFill.renderOrder = 4;
  tank.add(roofFill);
  // the seals: three ink bands across, over the deck, over the turret, over the front
  const sealMat = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  {
    const pos = [];
    const band = (x, path, half = 13) => {
      for (let i = 0; i < path.length - 1; i++) {
        const [z0, y0] = path[i];
        const [z1, y1] = path[i + 1];
        pos.push(x - half, y0, z0, x + half, y0, z0, x - half, y1, z1, x - half, y1, z1, x + half, y0, z0, x + half, y1, z1);
      }
    };
    const hullBand = (top) => [[-185, 4], [-185, 98], [-120, 98], [-120, top], [120, top], [120, 98], [185, 98], [185, 4]];
    band(-250, hullBand(184));
    band(268, hullBand(160));
    band(30, [[-185, 4], [-185, 98], [-120, 98], [-120, 184], [-152, 184], [-152, 262], [152, 262], [152, 184], [120, 184], [120, 98], [185, 98], [185, 4]]);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    const seal = new THREE.Mesh(g, sealMat);
    seal.renderOrder = 4;
    tank.add(seal);
  }
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1300, 64), floorMat(1300, 100));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.5;
  floor.renderOrder = 1;
  tank.add(floor);

  /* ── the anchors ── */
  const A = {
    hero: anchor(ship, ...HERO.centre),
    head: anchor(you.head, 0, 0, 0),
    cabin: anchor(ship, HX, HY, AZ),
    dragon: anchor(ship, ...DRAGON.at),
    soyuz: anchor(ship, ...SOYUZ.at),
    progress: anchor(ship, ...PROGRESS.at),
    front: anchor(ship, DRAGON.at[0] - DRAGON.length / 2, 0, AZ),
    flyby: anchor(flyAt, 0, 0, 0),
    kosmos: anchor(group, ...KOSMOS.at),
    teaser: anchor(group, TEASER.at[0], TEASER.at[1] + 120, TEASER.at[2]),
  };

  const tmp = V();
  const hue = new THREE.Color();
  const flyFrom = V(...FLYBY.from);
  const flyTo = V(...FLYBY.to);
  const jetBase = JET.at + 8;

  return {
    group, ship, A,
    update(P, time = 0, px = 1000, eye = null) {
      dress.update(P, time, px, eye);
      const onBench = (P.bench ?? 0) > 0.5;
      const sh = onBench ? 0 : clamp01(P.shell ?? 0);
      const yo = onBench ? 0 : clamp01(P.you ?? 0);
      const cr = onBench ? 0 : clamp01(P.crew ?? 0);
      const sl = clamp01(P.shelter ?? 0);
      const shield = onBench ? 0 : clamp01(P.shield ?? 0);
      const ram = clamp01(P.ram ?? 0);
      const caps01 = clamp01(P.capsules ?? 0);
      const dy = DODGE.dy * clamp01(P.dodge ?? 0);
      ship.visible = !onBench && (sh > 0.002 || yo > 0.002 || cr > 0.002 || shield > 0.002);
      ship.position.y = dy;

      // the station's glass and lines
      labMat.uniforms.uAmount.value = sh * (1 - 0.55 * cr * smooth(0.02, 0.12, sl) * (1 - smooth(0.88, 1, sl)));
      bumperMat.uniforms.uAmount.value = sh * (1 + 0.7 * shield);
      bumperMat.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.85 * shield);
      capMat.uniforms.uAmount.value = sh * (1 + 0.9 * caps01);
      fx.racks.opacity = 0.24 * sh;
      fx.cap.opacity = Math.min(1, (0.5 + 0.45 * caps01) * sh);
      fx.cap.linewidth = 2 + 1.2 * caps01;

      // the shield: ink and faint at rest, veille once named; the front and the flanks thicker, the Earth side paler
      // each part fades out when the camera comes within a few metres of it
      hue.copy(INK).lerp(VEILLE, shield);
      const rest = 0.1 * sh * (1 - shield);
      const fF = Math.min(1, rest + shield * (0.28 + 0.4 * ram));
      const fM = rest + shield * 0.24;
      const fN = rest + shield * 0.24 * (1 - 0.7 * ram);
      const wF = 2 + 1.4 * ram * shield;
      const focus = 1 - 0.55 * cr * smooth(0.02, 0.12, sl) * (1 - smooth(0.88, 1, sl));
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const near = p.a && eye ? smooth(p.R + 150, p.R + 1100, segDist(eye, p.a, p.b, dy)) : 1;
        const k = sh * near * focus;
        const m = p.m;
        m.hull.uniforms.uAmount.value = k;
        m.outline.opacity = 0.5 * k;
        m.rings.opacity = 0.26 * k;
        m.truss.opacity = 0.4 * k;
        m.wing.opacity = 0.55 * k;
        m.wingP.uniforms.uAmount.value = k;
        m.radP.uniforms.uAmount.value = k;
        m.smallP.uniforms.uAmount.value = k;
        m.shF.color.copy(hue);
        m.shM.color.copy(hue);
        m.shN.color.copy(hue);
        m.shF.opacity = fF * near;
        m.shF.linewidth = wF;
        m.shM.opacity = fM * near;
        m.shN.opacity = fN * near;
      }
      fx.hatch.opacity = onBench ? 0 : smooth(0.88, 1, sl);

      // « toi », his bag, his breath; the air
      const youMove = smooth(0.06, 0.78, sl);
      you.group.visible = yo > 0.002;
      bagGroup.visible = yo > 0.002;
      you.body.uniforms.uAmount.value = yo;
      you.flesh.opacity = yo;
      you.flesh.depthWrite = yo > 0.99;
      bagMat.uniforms.uAmount.value = yo * (1 - 0.45 * youMove);
      bagLines.opacity = 0.3 * yo * (1 - 0.45 * youMove);
      const breath = 0.014 * Math.sin((TAU * time) / 4.2) * (1 - youMove);
      bag.scale.set(1 + breath, 1, 1 + breath * 1.6);
      along(youPath, youMove, tmp);
      you.group.position.copy(tmp).sub(youOff);
      const airK = onBench ? 0 : clamp01(P.cabin ?? 0);
      air.visible = airK > 0.002;
      air.material.uniforms.uAmount.value = 0.18 * airK;
      air.material.uniforms.uC.value.set(HX, HY + dy, AZ);
      air.material.uniforms.uS.value.set(AIR[0], AIR[1] + dy, AIR[2]);

      // the crew, and the shelter
      for (let i = 0; i < crew.length; i++) {
        const c = crew[i];
        c.f.group.visible = cr > 0.002;
        c.f.body.uniforms.uAmount.value = cr * (1 + 1.6 * sl * (1 - sl)); // brighter while they float
        c.f.flesh.opacity = cr;
        c.f.flesh.depthWrite = cr > 0.99;
        along(c.path, smooth(c.delay, c.delay + 0.72, sl), tmp);
        c.f.group.position.copy(tmp).sub(c.off);
        c.f.group.position.y += 2.5 * Math.sin(time * 0.8 + c.phase) * (1 - sl);
      }

      // the dodge: Progress's jets (they move with the station), the debris going by (it does not)
      const burn = onBench ? 0 : clamp01(P.burn ?? 0);
      jetM.uniforms.uAmount.value = burn * (1 + 0.04 * Math.sin(time * 2.1));
      for (let i = 0; i < jetGlow.length; i++) {
        const j = jetGlow[i];
        j.g.at.set(jetBase, j.y + dy, AZ);
        j.g.uniforms.uAmount.value = 0.9 * burn;
      }
      const fb = clamp01(P.flyby ?? 0);
      const flying = !onBench && fb > 0.001 && fb < 0.999 ? 1 : 0;
      flyAt.position.lerpVectors(flyFrom, flyTo, fb);
      flyHead.at.copy(flyAt.position);
      flyHead.uniforms.uAmount.value = flying * smooth(0.0, 0.03, fb) * (1 - smooth(0.96, 0.999, fb));
      flyTrail.uniforms.uK.value = fb;
      flyTrail.uniforms.uAmount.value = flyHead.uniforms.uAmount.value;

      // Kosmos 1408: the satellite (0.1), the hit (0.3), the cloud spreading along its orbit (→ 1)
      const ko = onBench ? 0 : clamp01(P.kosmos ?? 0);
      const satK = smooth(0.0, 0.1, ko) * (1 - smooth(0.295, 0.31, ko));
      sat.visible = satK > 0.002;
      sat.rotation.set(0.35 + time * 0.021, 0.6 + time * 0.047, 0.2);
      satGlass.uniforms.uAmount.value = satK;
      satLines.opacity = 0.7 * satK;
      satWing.uniforms.uAmount.value = satK;
      satGlint.uniforms.uAmount.value = 0.55 * satK;
      // the hit: it swells in two hundredths of k, dies small (its heart ≤ 2.9: above 3 it bleeds)
      flash.uniforms.uAmount.value = ko <= 0.28 ? 0 : ko < 0.305 ? smooth(0.28, 0.305, ko) * 1.2 : 1.2 * Math.pow(1 - smooth(0.305, 0.46, ko), 2);
      flash.uniforms.uSize.value = 5200 * (0.4 + 0.6 * smooth(0.28, 0.32, ko));
      const k = clamp01((ko - 0.3) / 0.7);
      cloud.uniforms.uK.value = 1 - Math.pow(1 - k, 1.6);
      cloud.uniforms.uAmount.value = ko > 0.3 ? smooth(0.3, 0.34, ko) * 0.9 : 0;

      // the next file's tank (it stays on the bench)
      const tz = clamp01(P.teaser ?? 0);
      tank.visible = tz > 0.002;
      tankGlass.uniforms.uAmount.value = tz;
      tankLines.opacity = 0.5 * tz;
      roofLines.opacity = 0.95 * tz;
      roofFill.material.opacity = 0.09 * tz;
      sealMat.opacity = 0.28 * tz;
      floor.material.uniforms.uAmount.value = tz;
      void px;
      void eye;
    },
  };
}
