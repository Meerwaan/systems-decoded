// DOSSIER L05 — the A320 of flight 1549 like an X-ray, at its TRUE scale, and the Canada geese that fly into it.
//
//   buildAvion() → { group, A, update(p, time, px, ctx) }
//   p    the world's state S — avion.js reads: shell cabin pax brace flaps gearDown nacL nacR geese flame packs doors
//        rafts wingExits evac saved sink damage spray seal safety feed cold (their meaning: FIRST, in world.js)
//        — and, to stay in step with systemes.js: n1L n1R (the right fan's speed, the flames), gen apu (which way `feed` runs)
//   ctx  { t: the time of the day on the track (s after 15:00), camera, alt (cm, the axis above the river), speed (m/s), high }
//   A    anchors (Object3D in the plane's frame): nose, tail, doorL1, doorR1, wingL (the overwing exits, left),
//        belly (the aft hull that takes the blow), card (the safety card's pocket), intakeL, intakeR, cabin (its middle)
//   makeRaft() → { group } — a slide-raft, inflated, SOLID, alone (the bench's lineup: world.js puts it there); its
//        long axis along x, centred, its floor on y = 0
//
// THE PLANE'S FRAME (plan.js · A320): nose −x, up +y, left side +z, the fuselage axis y = 0, x = 0 the wing's root.
// world.js pitches and banks `group`'s parent and slides New York under it: avion.js never moves the plane itself.
// Every number that moves is read in `update` and written into uniforms or positions: NO allocation there.
//
// THE DA HERE (docs/L05-decors.md § avion.js): one shell of glass (fuselage, wings and their fences, fin, stabiliser,
// pylons, belly fairing) and a few lines of structure (frames, the window belt, the floor, the doors and exits, the
// cockpit's panes). SOLID: the right nacelle (and the left one, `nacL`, when systemes.js's engine is not in its place),
// the flaps and their rails, the gear, the door leaves, the slide-rafts (packs folded in L1 / R1, then inflated: warm
// light grey, a veille line round their top tube), the overwing hatches, the safety card and its seat. The people are
// GPU crowds of glass: 150 seated (`pax`, bent by `brace`), 155 out on the wings and in the two front rafts (`evac`),
// taken by the boats (`saved`). The threat in signal: the geese's rim, the flames, the aft hull's dent and its glow.
//
// Recopied (never imported) from episodes/L03-evacuation-avion/src/avion.js — spline, skin, foil, lifting (l. 51–110),
// the glow sprite (l. 170–196), fanMat (l. 199), windowMat (l. 233), the crowd's figure (l. 746) and its glass
// (l. 803), buildPlane's hull, wing, tail, pylons, frames, doors and windows (l. 981–1460) — and from
// episodes/023-eolienne-de-secours/src/avion.js: makeSpray's streaks (l. 277), here fired once.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glass, asShell, lineMat, box, cyl, lathe, plate, makePart, addMesh, setPartOpacity, mergeGeometries } from "@kit/build3d.js";
import { A320 } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const f = (x) => Number(x).toFixed(4);
const OFF = "gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return;";
const NOISE = /* glsl */ `
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 q = fract(p); q = q * q * (3.0 - 2.0 * q);
    return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), q.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), q.x), q.y);
  }`;

/* ───────────────────────────────────────────────────────────── shapes (L03 avion.js l. 51–110) */

/** A smooth curve through [x, value] knots (Hermite, tangents from the neighbours). */
function spline(knots) {
  const p = [...knots].sort((a, b) => a[0] - b[0]);
  const m = p.map((_, i) => {
    const a = p[Math.max(0, i - 1)];
    const b = p[Math.min(p.length - 1, i + 1)];
    return (b[1] - a[1]) / (b[0] - a[0]);
  });
  return (x) => {
    if (x <= p[0][0]) return p[0][1];
    if (x >= p.at(-1)[0]) return p.at(-1)[1];
    let i = 0;
    while (p[i + 1][0] < x) i++;
    const h = p[i + 1][0] - p[i][0];
    const u = (x - p[i][0]) / h;
    return (2 * u ** 3 - 3 * u * u + 1) * p[i][1] + (u ** 3 - 2 * u * u + u) * h * m[i] + (3 * u * u - 2 * u ** 3) * p[i + 1][1] + (u ** 3 - u * u) * h * m[i + 1];
  };
}

/** A skin through rows of points (`rows[i][j]` = [x, y, z]). `wrap`: each row closes on itself. Its normals point IN. */
function skin(rows, { wrap = false } = {}) {
  const n = rows[0].length;
  const pos = new Float32Array(rows.length * n * 3);
  rows.forEach((row, i) => row.forEach((p, j) => pos.set(p, (i * n + j) * 3)));
  const index = [];
  for (let i = 0; i < rows.length - 1; i++) {
    for (let j = 0; j < (wrap ? n : n - 1); j++) {
      const a = i * n + j;
      const b = i * n + ((j + 1) % n);
      index.push(a, b, b + n, a, b + n, a + n);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

const FOIL = 26;
function foil(lead, chord, thick, j) {
  const a = (2 * Math.PI * j) / FOIL;
  const c = Math.cos(a);
  const u = 0.5 - 0.5 * c;
  const t = Math.sin(a) * (0.62 + 0.38 * c) * chord * thick * 0.5;
  return [lead + u * chord, t];
}
/** A horizontal lifting surface for one side `s` (+1 left, −1 right): stations along z, closed at the tip. */
function lifting(s, zs, LE, CH, Y, TH) {
  const rows = zs.map((z, i) => {
    const end = i === zs.length - 1;
    const row = [];
    for (let j = 0; j < FOIL; j++) {
      const [x, t] = foil(LE(z), CH(z), TH(z) * (end ? 0.05 : 1), j);
      row.push([x, Y(z) + t, s * (z + (end ? 4 : 0))]);
    }
    return row;
  });
  return skin(rows, { wrap: true });
}

// THE A320's SECTION, as knots: [distance in half-widths, width, keel, crest] — width in half-widths, keel and crest in
// half-heights (2.07 m) about the axis. The nose: the Airbus nose of L03's A350, a touch longer (a narrow-body's).
// The tail: the cone sweeps up to the APU's exhaust, its end ≈ 0.35 m above the axis (systemes.js's APU, y 30, Ø 70,
// stays inside the glass).
const NOSE = [[0, 0.008, -0.2, -0.13], [0.05, 0.19, -0.4, 0.05], [0.18, 0.37, -0.58, 0.25], [0.4, 0.55, -0.73, 0.45], [0.71, 0.72, -0.85, 0.63], [1.1, 0.86, -0.935, 0.79], [1.56, 0.95, -0.978, 0.9], [2.05, 0.99, -0.996, 0.97], [2.62, 1, -1, 1]];
const TAIL = [[5.6, 1, -1, 1], [4.4, 0.99, -0.94, 1], [3.3, 0.94, -0.77, 0.99], [2.2, 0.84, -0.54, 0.94], [1.25, 0.66, -0.34, 0.82], [0.5, 0.42, -0.18, 0.6], [0.12, 0.24, -0.08, 0.46], [0, 0.12, -0.04, 0.38]];
// The CFM56-5B's long-duct nacelle, normalised ([r / nacelle radius, x / length]): lip, the fat barrel, the mixed nozzle, its plug
const NAC = [[0.8, 0.12], [0.8, 0.03], [0.84, 0.008], [0.9, -0.002], [0.96, 0.012], [0.995, 0.08], [1, 0.3], [0.99, 0.55], [0.94, 0.78], [0.84, 0.93], [0.74, 0.97], [0.58, 0.975], [0.4, 0.995], [0.14, 1.03], [0, 1.045]];
// The cockpit's panes: [x0, x1 in half-widths from the nose, angle low, angle high (degrees from the side)]
const PANES = [[0.52, 0.72, 46, 80], [0.74, 0.94, 38, 70], [0.96, 1.16, 34, 64], [1.18, 1.34, 34, 58]];
const HH = 207; //  the fuselage's half-height (4.14 m)
const FLOOR = -75; // the cabin's floor (plan.js)
const WATER = -A320.float.axisY; // the river afloat, in the plane's frame
const DOOR = { w: 81, h: 185 }; // type C (L1, R1, L2, R2)
const HATCH = { w: 51, h: 91, sill: -60 }; // the overwing exits (type III)

/* ───────────────────────────────────────────────────────────── light: sprites, fan, windows (L03 l. 170–270) */

let GLOW_TEX = null;
function glowTexture() {
  if (GLOW_TEX) return GLOW_TEX;
  const n = 64;
  const data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const r = Math.hypot((x + 0.5) / n - 0.5, (y + 0.5) / n - 0.5) * 2;
      const v = Math.max(0, Math.exp(-r * r * 9) * 0.75 + Math.exp(-r * 3.2) * 0.25 - 0.012 * r) * (r < 1 ? 1 : 0);
      const k = Math.round(255 * Math.min(1, v));
      data.set([k, k, k, k], (y * n + x) * 4);
    }
  }
  GLOW_TEX = new THREE.DataTexture(data, n, n);
  GLOW_TEX.needsUpdate = true;
  GLOW_TEX.magFilter = GLOW_TEX.minFilter = THREE.LinearFilter;
  return GLOW_TEX;
}
/** A billboard of light: `sprite.material.color` is its colour × its strength (keep it under 3). */
function glowSprite(size) {
  const mat = new THREE.SpriteMaterial({ map: glowTexture(), color: 0x000000, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const s = new THREE.Sprite(mat);
  s.scale.set(size, size, 1);
  s.renderOrder = 7;
  s.visible = false;
  return s;
}

/** The fan seen down an intake: alive a smooth blur, slow its blades, melted into their mean under the pixel. */
const fanMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uLife: { value: 0 }, uPhase: { value: 0 }, uInk: { value: INK.clone() } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uLife, uPhase; uniform vec3 uInk; varying vec2 vUv;
      void main() {
        vec2 q = (vUv - 0.5) * 2.0;
        float r = length(q);
        if (r > 1.0) discard;
        float th = atan(q.y, q.x);
        float b = fract((th + r * 0.9) / 6.2831853 * 24.0 + uPhase * 24.0);
        float tri = abs(b - 0.5) * 2.0;
        float fw = max(fwidth(tri), 1e-4);
        float blade = smoothstep(0.42 - fw, 0.42 + fw, tri);
        float show = smoothstep(0.06, 0.25, 1.0 / (fw * 24.0));
        blade = mix(0.58, blade, show);
        float spin = smoothstep(0.15, 0.85, uLife);
        float lit = mix(mix(0.03, 0.16, blade), 0.1 + 0.05 * exp(-r * r * 6.0), spin);
        lit += 0.18 * (1.0 - smoothstep(0.0, 0.2, r)); // the spinner
        lit += 0.06 * exp(-pow((r - 0.93) / 0.05, 2.0));
        float edge = 1.0 - smoothstep(0.96, 1.0, r);
        gl_FragColor = vec4(uInk * lit * edge, 1.0);
      }`,
  });

/** The cabin's windows: a rounded rectangle of light, its core and a soft spill; `uLights` warm ink. */
const windowMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uInk: { value: INK.clone() }, uLights: { value: 0 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec3 aWin; varying vec2 vUv; varying float vK;
      void main() { vUv = uv; vK = aWin.z; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uLights, uAmount; varying vec2 vUv; varying float vK;
      void main() {
        if (uAmount < 0.003) discard;
        vec2 q = (vUv - 0.5) * 2.0;
        vec2 d = abs(q) - vec2(0.42, 0.5) + 0.32;
        float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 0.32;
        float fw = max(fwidth(sd), 1e-4);
        float core = 1.0 - smoothstep(-fw, fw, sd);
        float spill = exp(-max(sd, 0.0) * 4.0) * 0.16;
        float lit = vK * (0.06 + 0.9 * uLights);
        gl_FragColor = vec4(uInk * lit * (core * 0.95 + spill) * uAmount, 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the people: glass figures (L03 l. 746–815) */

/** A standing person, 1.7 m, feet at the origin, facing +z (aPart: 0 limbs, 1 trunk, 2 head). */
function standingGeometry() {
  const parts = [];
  const tag = (geo, k) => {
    const g = geo.toNonIndexed();
    g.deleteAttribute("uv");
    g.setAttribute("aPart", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(k), 1));
    return g;
  };
  for (const x of [-10, 10]) parts.push(tag(new THREE.CapsuleGeometry(8, 66, 3, 8).translate(x, 42, 0), 0));
  parts.push(tag(new THREE.CapsuleGeometry(19, 48, 4, 12).scale(1, 1, 0.7).translate(0, 108, 0), 1));
  for (const x of [-25, 25]) parts.push(tag(new THREE.CapsuleGeometry(6, 52, 3, 8).rotateZ(x > 0 ? -0.12 : 0.12).translate(x, 104, 0), 0));
  parts.push(tag(new THREE.SphereGeometry(12, 14, 10).translate(0, 152, 2), 2));
  return mergeGeometries(parts);
}
/** A seated person, the hip at the origin, facing −x (the plane's nose): legs (0) stay, trunk and arms (1), head (2) bend. */
function seatedGeometry() {
  const parts = [];
  const tag = (geo, k) => {
    const g = geo.toNonIndexed();
    g.deleteAttribute("uv");
    g.setAttribute("aPart", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(k), 1));
    return g;
  };
  for (const z of [-9, 9]) {
    parts.push(tag(new THREE.CapsuleGeometry(7, 34, 3, 8).rotateZ(Math.PI / 2).translate(-21, 0, z), 0)); // thigh
    parts.push(tag(new THREE.CapsuleGeometry(6, 34, 3, 8).rotateZ(0.08).translate(-44, -21, z), 0)); //      shin
  }
  parts.push(tag(new THREE.CapsuleGeometry(16, 36, 4, 12).scale(1, 1, 0.72).rotateZ(-0.12).translate(4, 32, 0), 1));
  for (const z of [-21, 21]) parts.push(tag(new THREE.CapsuleGeometry(5.5, 34, 3, 8).rotateZ(0.5).translate(-10, 30, z), 1));
  parts.push(tag(new THREE.SphereGeometry(11, 14, 10).translate(7, 72, 0), 2));
  return mergeGeometries(parts);
}
/** Glass people (over, not added: a crowd never burns to white where it thickens); `uTint` toward veille per figure. */
const PEOPLE_FRAG = /* glsl */ `
  uniform vec3 uInk, uVeille; uniform float uAmount; varying vec3 vN; varying vec3 vV; varying float vTint; varying float vHead;
  void main() {
    if (uAmount < 0.003) discard;
    float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
    float a = clamp(0.16 + 0.75 * pow(g, 1.8) + (vHead > 1.5 ? 0.14 : 0.0), 0.0, 0.85) * uAmount;
    vec3 col = mix(uInk * 0.74, uVeille * 0.95, clamp(vTint, 0.0, 1.0));
    gl_FragColor = vec4(col * a, a);
  }`;
function peopleMat(uniforms, vertexShader) {
  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader,
    fragmentShader: PEOPLE_FRAG,
  });
}

/* ───────────────────────────────────────────────────────────── the slide-raft (L03's slide, rebuilt as a raft) */

/**
 * A slide-raft, inflated, in its own frame: its HEAD at the origin (the sill), out along +z, its floor on the water
 * (y 0). Two stacked tubes round a rounded rectangle, the floor between them, the head tube that rises to the sill;
 * the veille line on the top tube: it is what saves them. `mats` its own materials (it fades alone).
 */
const RAFT = { w: 200, L: 430, z0: 26, r: 21, r2: 16, corner: 70 };
function raftBody() {
  const g = new THREE.Group();
  const { w, L, z0, r, r2, corner } = RAFT;
  const ring = (inset, y) => {
    const pts = [];
    const hw = w / 2 - inset;
    const a0 = z0 + inset;
    const a1 = z0 + L - inset;
    const c = corner - inset * 0.5;
    const arc = (cx, cz, t0) => {
      for (let k = 0; k <= 8; k++) {
        const t = t0 + (k / 8) * (Math.PI / 2);
        pts.push(V(cx + c * Math.cos(t), y, cz + c * Math.sin(t)));
      }
    };
    arc(hw - c, a1 - c, 0);
    arc(-hw + c, a1 - c, Math.PI / 2);
    arc(-hw + c, a0 + c, Math.PI);
    arc(hw - c, a0 + c, 1.5 * Math.PI);
    return new THREE.CatmullRomCurve3(pts, true, "centripetal");
  };
  const tubeMat = solid(0xcbbd9b, { rough: 0.45, env: 0.3 });
  const floorMat = solid(0xb0a68c, { rough: 0.8, env: 0.3, double: true });
  const low = new THREE.Mesh(new THREE.TubeGeometry(ring(0, r), 96, r, 16, true), tubeMat);
  const high = new THREE.Mesh(new THREE.TubeGeometry(ring(3, r * 2 + r2 * 0.55), 96, r2, 14, true), tubeMat);
  const head = new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.95, w - 30, 6, 16).rotateZ(Math.PI / 2).translate(0, r * 1.9, z0 * 0.4), tubeMat);
  const floorGeo = new THREE.ShapeGeometry(
    (() => {
      const s = new THREE.Shape();
      ring(r * 0.6, 0).getPoints(64).forEach((p, i) => (i ? s.lineTo(p.x, p.z) : s.moveTo(p.x, p.z)));
      return s;
    })(),
  ).rotateX(-Math.PI / 2).translate(0, 6, 0);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  // the veille line on the top tube, and its handline
  const topPts = ring(3, r * 2 + r2 * 1.5).getPoints(120).flatMap((p) => [p.x, p.y, p.z]);
  const lg = new LineGeometry();
  lg.setPositions(topPts);
  const lineM = lineMat(BRAND.veille, 2.4, { opacity: 0.95 });
  const line = new Line2(lg, lineM);
  line.computeLineDistances();
  line.renderOrder = 3;
  for (const m of [low, high, head, floor]) {
    m.castShadow = false;
    m.receiveShadow = true;
    g.add(m);
  }
  g.add(line);
  return { g, mats: [tubeMat, floorMat, lineM] };
}

/** A slide-raft, inflated, SOLID, alone: its long axis along x, centred, its floor on y = 0 (the bench's lineup). */
export function makeRaft() {
  const group = new THREE.Group();
  group.name = "raft";
  const { g } = raftBody();
  g.rotation.y = Math.PI / 2;
  g.position.x = -(RAFT.z0 + RAFT.L / 2);
  group.add(g);
  return { group };
}

/* ───────────────────────────────────────────────────────────── the geese */

/** A Canada goose, 1 m long, 1.7 m across: facing +x, up +y, its wings along ±z (aWing −1 / +1 flaps, aTone its grey). */
function gooseGeometry() {
  const parts = [];
  const tag = (geo, tone, wing) => {
    const g = geo.toNonIndexed();
    g.deleteAttribute("uv");
    const n = g.attributes.position.count;
    g.setAttribute("aTone", new THREE.Float32BufferAttribute(new Float32Array(n).fill(tone), 1));
    g.setAttribute("aWing", new THREE.Float32BufferAttribute(new Float32Array(n).fill(wing), 1));
    return g;
  };
  parts.push(tag(new THREE.SphereGeometry(1, 18, 12).scale(46, 15, 17), 0.42, 0)); //                       body
  parts.push(tag(new THREE.SphereGeometry(1, 12, 8).scale(30, 9, 13).translate(-6, -8, 0), 0.62, 0)); //      pale belly
  parts.push(tag(new THREE.CapsuleGeometry(4.6, 34, 3, 8).rotateZ(-1.36).translate(58, 8, 0), 0.07, 0)); //  black neck
  parts.push(tag(new THREE.SphereGeometry(1, 12, 8).scale(9, 6.5, 6).translate(80, 12, 0), 0.07, 0)); //       head
  parts.push(tag(new THREE.ConeGeometry(2.8, 9, 8).rotateZ(-Math.PI / 2).translate(92, 11, 0), 0.07, 0)); //  bill
  for (const z of [-4.6, 4.6]) parts.push(tag(new THREE.SphereGeometry(1, 8, 6).scale(4.5, 3.2, 1.6).translate(78, 9.5, z), 0.95, 0)); // the white chin strap
  parts.push(tag(new THREE.BoxGeometry(16, 3, 16).translate(-50, 2, 0), 0.1, 0)); //                          tail
  for (const s of [-1, 1]) {
    const w = new THREE.BoxGeometry(1, 1, 1, 2, 1, 8);
    const p = w.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getZ(i) + 0.5; // 0 at the body → 1 at the tip
      const span = 8 + u * 78;
      const chord = lerp(32, 13, u);
      const x = p.getX(i) * chord - 0.28 * (span - 8) + 4;
      p.setXYZ(i, x, p.getY(i) * lerp(4, 1.6, u) + 4, s * span);
    }
    w.computeVertexNormals();
    parts.push(tag(w, 0.32, s));
  }
  return mergeGeometries(parts);
}

/* ───────────────────────────────────────────────────────────── the airframe */

function buildA320(M, g) {
  const P = A320;
  const Fz = P.fuse;
  const hw = Fz.r;
  const nose = Fz.noseX;
  const tail = Fz.tailX;

  /* ── the section, station by station ── */
  const knots = [...NOSE.map(([d, ...v]) => [nose + d * hw, ...v]), ...TAIL.map(([d, ...v]) => [tail - d * hw, ...v])];
  const [fw, fk, fc] = [1, 2, 3].map((k) => spline(knots.map((row) => [row[0], row[k]])));
  const section = (x) => {
    const keel = fk(x) * HH;
    const crest = fc(x) * HH;
    return { w: fw(x) * hw, mid: (keel + crest) / 2, hh: (crest - keel) / 2 };
  };
  const onSkin = (x, a, lift = 0) => {
    const s = section(x);
    return [x, s.mid + (s.hh + lift) * Math.sin(a), (s.w + lift) * Math.cos(a)];
  };
  const angleOfY = (x, y) => {
    const s = section(x);
    return Math.asin(Math.max(-1, Math.min(1, (y - s.mid) / s.hh)));
  };
  const sideA = (side, a) => (side > 0 ? a : Math.PI - a);
  const AROUND = 72;
  const ringAt = (x) => Array.from({ length: AROUND }, (_, j) => onSkin(x, (2 * Math.PI * j) / AROUND));
  const xs = [];
  for (let x = nose; x < nose + 2.8 * hw; x += hw / 28) xs.push(x);
  for (let x = nose + 2.8 * hw; x < tail - 5.6 * hw; x += 60) xs.push(x);
  for (let x = tail - 5.6 * hw; x < tail; x += hw / 9) xs.push(x);
  xs.push(tail);

  const panes = [];
  const pane = (geometry, material) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    g.add(mesh);
    panes.push(mesh);
    return mesh;
  };
  pane(skin(xs.map(ringAt), { wrap: true }), M.hull);

  /* ── the wing (25°, a kink at the engine), its fences, the stabiliser, the fin ── */
  const W = P.wing;
  const semi = W.tipZ;
  const tanS = Math.tan(W.sweep * DEG);
  const zk = hw + 0.3 * (semi - hw);
  const LE = (z) => W.rootLE + (z - hw) * tanS;
  const CH = (z) => (z <= hw ? W.rootChord : z <= zk ? lerp(W.rootChord, 0.6 * W.rootChord, (z - hw) / (zk - hw)) : lerp(0.6 * W.rootChord, W.tipChord, (z - zk) / (semi - zk)));
  const WY = (z) => W.rootY + Math.max(0, z - hw * 0.5) * Math.tan(W.dihedral * DEG);
  const TH = (z) => lerp(0.14, 0.1, z / semi);
  const top = (x, z) => WY(z) + 0.5 * TH(z) * CH(z) * Math.sin(Math.PI * clamp01((x - LE(z)) / CH(z))) * 0.95; // the upper skin, roughly
  const wingZs = [hw * 0.45, hw, (hw + zk) / 2, zk, lerp(zk, semi, 0.33), lerp(zk, semi, 0.66), semi - 25, semi];
  const wingGeos = [];
  for (const s of [1, -1]) {
    const wg = lifting(s, wingZs, LE, CH, WY, TH);
    wingGeos.push(wg);
    pane(wg, M.wings);
    // the wingtip fence of 2009: a small arrow-head plate, above and below the tip
    const tipLE = LE(semi);
    const tipY = WY(semi);
    const rows = [];
    for (const [k, dy] of [[0, -58], [1, -16], [2, 40], [3, 92]]) {
      const row = [];
      const edge = k === 0 || k === 3;
      const chord = W.tipChord * (edge ? 0.5 : 0.95);
      const lead = tipLE + 10 + Math.abs(dy) * 0.55 + (edge ? 30 : 0);
      for (let j = 0; j < FOIL; j++) {
        const [x, t0] = foil(lead, chord, edge ? 0.004 : 0.08, j);
        row.push([x, tipY + dy, s * (semi + 5 + t0)]);
      }
      rows.push(row);
    }
    pane(skin(rows, { wrap: true }), M.wings);
  }
  const ST = { le: 1580, root: 380, tip: 130, semi: P.tail.tailplaneSpan / 2, sweep: 29, y: 45, dihedral: 6 };
  const stLE = (z) => ST.le + z * Math.tan(ST.sweep * DEG);
  const stCH = (z) => lerp(ST.root, ST.tip, z / ST.semi);
  const stY = (z) => ST.y + z * Math.tan(ST.dihedral * DEG);
  for (const s of [1, -1]) pane(lifting(s, [0, ST.semi * 0.35, ST.semi * 0.7, ST.semi - 12, ST.semi], stLE, stCH, stY, () => 0.1), M.wings);
  const FIN = { le: P.tail.finLE, root: 600, tip: 200, sweep: 34 };
  const finBase = (() => {
    const s = section(FIN.le + FIN.root * 0.5);
    return s.mid + s.hh - 16;
  })();
  const finH = P.tail.finTop - finBase;
  const finLE = (y) => FIN.le + (y - finBase) * Math.tan(FIN.sweep * DEG);
  const finCh = (y) => lerp(FIN.root, FIN.tip, (y - finBase) / finH);
  {
    const rows = [];
    const ys = [finBase - 40, finBase, finBase + finH * 0.2, finBase + finH * 0.55, finBase + finH - 18, finBase + finH];
    ys.forEach((y, i) => {
      const yy = Math.max(finBase, y);
      const end = i === ys.length - 1;
      const dorsal = i === 0 ? 260 : 0;
      const row = [];
      for (let j = 0; j < FOIL; j++) {
        const [x, t] = foil(finLE(yy) - (i === 0 ? 40 : 0) - dorsal, finCh(yy) + (i === 0 ? 70 : 0) + dorsal, 0.1 * (end ? 0.05 : 1), j);
        row.push([x, y + (end ? 4 : 0), t]);
      }
      rows.push(row);
    });
    pane(skin(rows, { wrap: true }), M.wings);
  }

  /* ── the engines: nacelle (solid), its fan; the pylon of glass ── */
  const E = P.engine;
  const nacR = E.nacD / 2;
  const nacGeo = lathe(NAC.map(([r, y]) => [r * nacR, y * E.len]), 72, { bevel: 1.4 }).rotateZ(-Math.PI / 2);
  const engines = [];
  for (const s of [1, -1]) {
    const part = makePart(s > 0 ? "nacL" : "nacR");
    part.position.set(E.x, E.y, s * E.z);
    g.add(part);
    const mat = solid(0x7c8389, { rough: 0.5, metal: 0.3, coat: 0.3, coatRough: 0.45 });
    addMesh(part, nacGeo, mat, { edgeOpacity: 0.6, threshold: 30 });
    const fanM = fanMat();
    const fan = new THREE.Mesh(new THREE.CircleGeometry(NAC[0][0] * nacR * 0.99, 64).rotateY(-Math.PI / 2), fanM);
    fan.position.x = NAC[0][1] * E.len;
    fan.renderOrder = 3;
    part.add(fan);
    // the pylon, up into the wing
    const wy = WY(E.z) - 0.04 * CH(E.z);
    const ny = E.y + nacR * 0.9;
    const xA = E.x + E.len * 0.12;
    const xB = LE(E.z) + CH(E.z) * 0.55;
    const pyl = plate([[xA, ny - 10], [E.x + E.len * 0.92, ny - 10], [xB, Math.min(wy, ny + 30) - 6], [xB, wy + 24], [LE(E.z) - 20, wy + 24], [xA + 40, ny + 36]], 30, { bevel: 7, round: 3 });
    pyl.translate(0, 0, s * E.z - 15);
    pane(pyl, M.wings);
    engines.push({ s, part, fan: fanM });
  }
  // the belly fairing, between the wings
  {
    const fr = [];
    const x0 = W.rootLE - 160;
    const x1 = W.rootLE + W.rootChord + 260;
    for (let x = x0; x <= x1; x += 40) {
      const u = (x - x0) / (x1 - x0);
      const b = smooth(0, 0.3, u) * smooth(1, 0.7, u);
      const s0 = section(x);
      const ring = [];
      for (let j = 0; j < 40; j++) {
        const a = (2 * Math.PI * j) / 40;
        const c = Math.cos(a);
        const sn = Math.sin(a);
        ring.push([x, s0.mid - s0.hh * 0.84 + (sn < 0 ? 0.22 : 0.1) * s0.hh * b * sn, (0.22 * hw + 0.84 * hw * b) * Math.sign(c) * Math.pow(Math.abs(c), 0.8)]);
      }
      fr.push(ring);
    }
    pane(skin(fr, { wrap: true }), M.hull);
  }
  asShell(panes, 20);

  /* ── the flaps (solid, on their hinge under the trailing edge) and their rails ── */
  const flaps = [];
  for (const s of [1, -1]) {
    for (const [z0, z1] of [[P.flap.span[0], zk], [zk + 10, P.flap.span[1]]]) {
      const zsF = [z0, (z0 + z1) / 2, z1];
      const c = (z) => 0.26 * CH(z);
      const rows = zsF.map((z) => {
        const row = [];
        for (let j = 0; j < FOIL; j++) {
          const [x, t] = foil(LE(z) + CH(z) - c(z) - 4, c(z), 0.13, j);
          row.push([x, WY(z) - 4 + t, s * z]);
        }
        return row;
      });
      // close the two ends
      // each end closed on a point inside the section
      const cap = (row, z) => row.map(() => [row[0][0] + c(z) * 0.4, row[0][1], s * z]);
      const geo = skin([cap(rows[0], z0), ...rows, cap(rows[2], z1)], { wrap: true });
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, M.flap);
      mesh.material.side = THREE.DoubleSide;
      mesh.castShadow = true;
      g.add(mesh);
      const hingeA = V(LE(z0) + CH(z0) - c(z0), WY(z0) - 6, s * z0);
      const hingeB = V(LE(z1) + CH(z1) - c(z1), WY(z1) - 6, s * z1);
      const axis = hingeB.clone().sub(hingeA).normalize();
      const pivot = hingeA.clone().lerp(hingeB, 0.5);
      flaps.push({ mesh, axis, pivot, s, chord: c((z0 + z1) / 2) });
    }
    for (const z of [330, 540, 760, 1000, 1220]) {
      const c = CH(z);
      const geo = new THREE.CapsuleGeometry(c * 0.03 + 6, c * 0.55, 6, 14).rotateZ(Math.PI / 2).scale(1, 1.3, 0.75);
      const m = new THREE.Mesh(geo, M.rail);
      m.position.set(LE(z) + c * 0.84, WY(z) - 0.06 * c - 9, s * z);
      g.add(m);
    }
  }

  /* ── a few lines of structure ── */
  const frames = [];
  const outline = [];
  const run = (list, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) list.push(...pts[i], ...pts[i + 1]);
    if (closed) list.push(...pts.at(-1), ...pts[0]);
  };
  const along = (fn, x0, x1, step = 50) => {
    const pts = [];
    for (let x = x0; x <= x1; x += step) pts.push(fn(x));
    return pts;
  };
  const LIFT = 1.5;
  const fx0 = nose + 2.7 * hw;
  const fx1 = tail - 4.6 * hw;
  const nFrames = 12;
  for (let k = 0; k <= nFrames; k++) run(frames, ringAt(lerp(fx0, fx1, k / nFrames)).filter((_, j) => j % 2 === 0), true);
  run(frames, along((x) => onSkin(x, Math.PI / 2, LIFT), nose + 30, tail - 30, 40));
  run(frames, along((x) => onSkin(x, -Math.PI / 2, LIFT), nose + 30, tail - 2.2 * hw, 40));
  const winY = FLOOR + 97;
  const xWin0 = P.doors.L1[0] + 70;
  const xWin1 = P.doors.L2[0] - 60;
  for (const side of [1, -1]) {
    for (const dy of [-26, 26]) run(frames, along((x) => onSkin(x, sideA(side, angleOfY(x, winY + dy)), 0.8), xWin0 - 100, xWin1 + 120, 40));
    // the floor, seen through the skin
    run(frames, along((x) => {
      const s0 = section(x);
      const dy = FLOOR - s0.mid;
      return [x, FLOOR, side * Math.sqrt(Math.max(0, s0.w * s0.w * (1 - (dy * dy) / (s0.hh * s0.hh)))) * 0.97];
    }, nose + 1.2 * hw, tail - 3.4 * hw, 80));
  }
  const cockpit = [];
  for (const side of [1, -1]) {
    for (const [u0, u1, a0, a1] of PANES) {
      const x0 = nose + u0 * hw;
      const x1 = nose + u1 * hw;
      const lean = 0.04 * hw;
      const A_ = (a) => sideA(side, a * DEG);
      const pts = [];
      for (let k = 0; k <= 6; k++) pts.push(onSkin(lerp(x0, x0 + lean, k / 6), A_(lerp(a0, a1, k / 6)), LIFT));
      for (let k = 0; k <= 6; k++) pts.push(onSkin(lerp(x0 + lean, x1 + lean, k / 6), A_(a1), LIFT));
      for (let k = 0; k <= 6; k++) pts.push(onSkin(lerp(x1 + lean, x1, k / 6), A_(lerp(a1, a0, k / 6)), LIFT));
      for (let k = 0; k <= 6; k++) pts.push(onSkin(lerp(x1, x0, k / 6), A_(a0), LIFT));
      run(outline, pts);
      cockpit.push({ side, x0, x1, a0, a1 });
    }
  }
  for (const s of [1, -1]) {
    const at = (z, fr) => [LE(z) + fr * CH(z), WY(z), s * z];
    run(outline, [at(hw, 0), at(zk, 0), at(semi, 0), at(semi, 1), at(zk, 1), at(hw, 1)]);
    for (const fr of [0.15, 0.62]) run(frames, [at(hw + 40, fr), at(zk, fr), at(semi - 40, fr)]);
    const st = (z, fr) => [stLE(z) + fr * stCH(z), stY(z), s * z];
    run(outline, [st(hw * 0.4, 0), st(ST.semi, 0), st(ST.semi, 1), st(hw * 0.4, 1)]);
  }
  const fn = (y, fr) => [finLE(y) + fr * finCh(y), y, 0];
  run(outline, [fn(finBase + 10, 0), fn(finBase + finH, 0), fn(finBase + finH, 1), fn(finBase + 10, 1)]);

  /* ── the doors and the overwing exits: their outline on the skin ── */
  const roundRect = (cx, y0, w, h, rr = 16, step = 6) => {
    const pts = [];
    const arc = (ox, oy, a0) => {
      for (let k = 0; k <= step; k++) {
        const a = a0 + (k / step) * (Math.PI / 2);
        pts.push([ox + rr * Math.cos(a), oy + rr * Math.sin(a)]);
      }
    };
    arc(cx + w / 2 - rr, y0 + rr, -Math.PI / 2);
    arc(cx + w / 2 - rr, y0 + h - rr, 0);
    arc(cx - w / 2 + rr, y0 + h - rr, Math.PI / 2);
    arc(cx - w / 2 + rr, y0 + rr, Math.PI);
    pts.push(pts[0]);
    return pts;
  };
  const onSide = (side, lift) => ([xx, yy]) => onSkin(xx, sideA(side, angleOfY(xx, yy)), lift);
  const densify = (pts2, step = 18) => {
    const out = [];
    for (let i = 0; i < pts2.length - 1; i++) {
      const [a, b] = [pts2[i], pts2[i + 1]];
      const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
    }
    out.push(pts2.at(-1));
    return out;
  };
  const doorX = { L1: P.doors.L1[0], R1: P.doors.R1[0], L2: P.doors.L2[0], R2: P.doors.R2[0] };
  const hatchX = P.overwing.x;
  for (const side of [1, -1]) {
    for (const x of [doorX.L1, doorX.L2]) run(outline, densify(roundRect(x, FLOOR, DOOR.w, DOOR.h, 18)).map(onSide(side, LIFT + 0.4)));
    for (const x of hatchX) run(outline, densify(roundRect(x, HATCH.sill, HATCH.w, HATCH.h, 12)).map(onSide(side, LIFT + 0.4)));
  }
  const segments = (list, material, order = 2) => {
    const geo = new LineSegmentsGeometry();
    geo.setPositions(list);
    const lines = new LineSegments2(geo, material);
    lines.frustumCulled = false;
    lines.renderOrder = order;
    g.add(lines);
    return lines;
  };
  segments(frames, M.frames);
  segments(outline, M.outline);

  /* ── the windows, one row a side; the cockpit's panes faintly ── */
  {
    const pos = [];
    const uv = [];
    const win = [];
    const idx = [];
    const rand = rng(1549);
    const quad = (c, nrm, w, h, x, y, k) => {
      const n = V(...nrm).normalize();
      const right = V(1, 0, 0);
      const up = V().crossVectors(n, right).normalize();
      if (up.y < 0) up.negate();
      const b = pos.length / 3;
      for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
        const p = V(...c).addScaledVector(right, (u - 0.5) * w).addScaledVector(up, (v - 0.5) * h);
        pos.push(p.x, p.y, p.z);
        uv.push(u, v);
        win.push(x, y, k);
      }
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    };
    for (const side of [1, -1]) {
      for (let x = xWin0; x <= xWin1; x += 53.3) {
        if (hatchX.some((xh) => Math.abs(xh - x) < HATCH.w / 2 + 6)) continue;
        const p = onSkin(x, sideA(side, angleOfY(x, winY)), 1.2);
        const s0 = section(x);
        quad(p, [0, (p[1] - s0.mid) / s0.hh, p[2] / s0.w], 23, 32, x, winY, (side > 0 ? 0.62 : 0.45) * (0.82 + 0.36 * rand()));
      }
      for (const x of [doorX.L1, doorX.L2]) {
        const y = FLOOR + DOOR.h * 0.74;
        const p = onSkin(x, sideA(side, angleOfY(x, y)), 1.2);
        const s0 = section(x);
        quad(p, [0, (p[1] - s0.mid) / s0.hh, p[2] / s0.w], 18, 22, x, y, side > 0 ? 0.5 : 0.4);
      }
      for (const x of hatchX) {
        const y = HATCH.sill + HATCH.h * 0.62;
        const p = onSkin(x, sideA(side, angleOfY(x, y)), 1.4);
        const s0 = section(x);
        quad(p, [0, (p[1] - s0.mid) / s0.hh, p[2] / s0.w], 21, 30, x, y, side > 0 ? 0.6 : 0.45);
      }
    }
    for (const { side, x0, x1, a0, a1 } of cockpit) {
      const xm = (x0 + x1) / 2;
      const am = ((a0 + a1) / 2) * DEG;
      const p = onSkin(xm, sideA(side, am), 0.8);
      const s0 = section(xm);
      quad(p, [0, Math.sin(am), side * Math.cos(am)], (x1 - x0) * 0.8, (a1 - a0) * DEG * s0.hh * 0.8, xm, 0, 0.16);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute("aWin", new THREE.Float32BufferAttribute(win, 3));
    geo.setIndex(idx);
    const mesh = new THREE.Mesh(geo, M.windows);
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    g.add(mesh);
  }

  /* ── the gear (only on LaGuardia's runway): struts and wheels, solid, three greys ── */
  const gear = [];
  const groundY = -A320.ground.axisY;
  for (const G of [{ x: 120, z: 380, pair: 46, r: 57, main: true }, { x: -1250, z: 0, pair: 22, r: 37, main: false }]) {
    for (const s of G.z ? [1, -1] : [1]) {
      const z = s * G.z;
      const topY = G.main ? WY(G.z) - 0.05 * CH(G.z) : section(G.x).mid - section(G.x).hh * 0.86;
      const leg = new THREE.Group();
      leg.position.set(G.x, topY, z);
      g.add(leg);
      const part = makePart("gear");
      leg.add(part);
      const L = topY - (groundY + G.r);
      addMesh(part, cyl(G.r * 0.17, L, 1.2, 20), M.steel, { pos: [0, -L / 2, 0], edgeOpacity: 0.5 });
      for (const dz of [-G.pair, G.pair]) {
        addMesh(part, cyl(G.r, G.r * 0.62, 3, 40).rotateX(Math.PI / 2), M.rubber, { pos: [0, -L, dz], edgeOpacity: 0.45 });
        addMesh(part, cyl(G.r * 0.55, G.r * 0.64, 1.5, 32).rotateX(Math.PI / 2), M.hub, { pos: [0, -L, dz], edges: false });
      }
      leg.visible = false;
      gear.push({ leg, s, main: G.main });
    }
  }

  return { section, onSkin, angleOfY, sideA, LE, CH, WY, TH, top, zk, semi, engines, flaps, gear, wingGeos, roundRect, densify, onSide, doorX, hatchX, winY };
}

/* ───────────────────────────────────────────────────────────── buildAvion */

export function buildAvion() {
  const group = new THREE.Group();
  group.name = "avion";
  const RES = new THREE.Vector2(BRAND.W, BRAND.H); // read now: the long's 16:9 frame is already set (main.js)

  const M = {
    hull: glass(BRAND.ink, { base: 0, rim: 0.14, power: 2.8, edge: 0.34, spec: 0.22, through: 0.22 }),
    wings: glass(BRAND.ink, { base: 0.002, rim: 0.11, power: 2.5, edge: 0.3, spec: 0.25, through: 0.2 }),
    seats: glass(BRAND.ink, { base: 0, rim: 0.14, power: 2, edge: 0.1 }),
    frames: lineMat(BRAND.ink, 1.8, { opacity: 0.22 }),
    outline: lineMat(BRAND.ink, 2.1, { opacity: 0.6 }),
    flap: solid(0x9aa1a6, { rough: 0.48, metal: 0.25, env: 0.9 }),
    rail: solid(0x5b6268, { rough: 0.55, metal: 0.2 }),
    steel: solid(0x7d858b, { rough: 0.45, metal: 0.4, env: 1 }),
    hub: solid(0xa9b0b4, { rough: 0.4, metal: 0.35, env: 1.1 }),
    rubber: solid(0x2b3034, { rough: 0.9, env: 0.5 }),
    windows: windowMat(),
  };
  const air = buildA320(M, group);
  const { section, onSkin, angleOfY, sideA, LE, CH, WY, TH, top, engines, flaps, gear, roundRect, densify, onSide, doorX, hatchX } = air;
  const E = A320.engine;
  const nacMid = (s) => V(E.x, E.y, s * E.z);

  /* ── the door leaves (L1, R1), the packs, the slide-rafts ── */
  const fronts = [];
  for (const side of [1, -1]) {
    const x = doorX.L1;
    const sill = onSkin(x, sideA(side, angleOfY(x, FLOOR)), 0);
    const pivot = new THREE.Group();
    pivot.position.set(x - DOOR.w / 2, FLOOR, sill[2]);
    group.add(pivot);
    const leafPart = makePart(`leaf${side > 0 ? "L1" : "R1"}`);
    const leafGeo = plate(roundRect(DOOR.w / 2, 0, DOOR.w, DOOR.h, 16).slice(0, -1), 9, { bevel: 2, round: 2 });
    addMesh(leafPart, leafGeo, solid(0x3b4146, { rough: 0.6, metal: 0.2, double: true }), { edgeOpacity: 0.7, threshold: 30, pos: [0, 0, side > 0 ? -4 : -5] });
    pivot.add(leafPart);
    leafPart.visible = false;
    // the pack: the slide-raft folded in its case on the door's lower inside — outlined veille
    const pack = makePart(`pack${side}`);
    addMesh(pack, box(70, 34, 24, 4), solid(0x6f685b, { rough: 0.8, env: 0.6 }), { edgeColor: BRAND.veille, edgeOpacity: 0.95, edgeWidth: 2.4, threshold: 30 });
    pack.position.set(x, FLOOR + 22, side * (Math.abs(sill[2]) - 20));
    group.add(pack);
    setPartOpacity(pack, 0);
    // the raft: its head at the sill, on the river
    const raft = raftBody();
    const holder = new THREE.Group();
    holder.position.set(x, WATER, side * (Math.abs(sill[2]) + 4));
    if (side < 0) holder.rotation.y = Math.PI;
    holder.add(raft.g);
    holder.visible = false;
    group.add(holder);
    fronts.push({ side, pivot, leafPart, pack, holder, raft, z: sill[2] });
  }

  /* ── the overwing hatches: taken out and laid on the wing ── */
  const hatches = [];
  for (const side of [1, -1]) {
    for (const x of hatchX) {
      const yc = HATCH.sill + HATCH.h / 2;
      const p = onSkin(x, sideA(side, angleOfY(x, yc)), 2);
      const part = makePart("hatch");
      addMesh(part, plate(roundRect(0, -HATCH.h / 2, HATCH.w, HATCH.h, 12).slice(0, -1), 6, { bevel: 1.5, round: 2 }), solid(0x464d53, { rough: 0.6, metal: 0.2, double: true }), { edgeOpacity: 0.7, threshold: 30, pos: [0, 0, -3] });
      const holder = new THREE.Group();
      holder.add(part);
      holder.visible = false;
      group.add(holder);
      const zOn = 300 + (x - hatchX[0]) * 0.5;
      hatches.push({ holder, side, closed: V(...p), open: V(x + 70, top(x + 70, zOn) + 4, side * (zOn + 60)), x });
    }
  }

  /* ── the seated passengers (150: 12 in front, four abreast, then six abreast) and their seats ── */
  const seated = [];
  {
    let x = -1060;
    for (let row = 0; row < 26; row++) {
      const zs = row < 3 ? [-120, -62, 62, 120] : [-140, -91, -42, 42, 91, 140];
      for (const z of zs) seated.push([x, z]);
      x += row < 3 ? 96 : 86;
    }
  }
  const PAX = seated.length; // 150
  const HIP = FLOOR + 44;
  const paxU = { uBrace: { value: 0 }, uEvac: { value: 0 }, uAmount: { value: 0 }, uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() } };
  {
    const geo = new THREE.InstancedBufferGeometry().copy(seatedGeometry());
    const a = new Float32Array(PAX * 4);
    const rand = rng(150);
    seated.forEach(([x, z], i) => a.set([x, z, 0.04 + 0.92 * rand(), rand()], i * 4));
    geo.setAttribute("aSeat", new THREE.InstancedBufferAttribute(a, 4));
    geo.instanceCount = PAX;
    const mesh = new THREE.Mesh(
      geo,
      peopleMat(
        paxU,
        /* glsl */ `
        uniform float uBrace, uEvac; attribute vec4 aSeat; attribute float aPart;
        varying vec3 vN; varying vec3 vV; varying float vTint; varying float vHead;
        void main() {
          if (uEvac > 0.0005 && uEvac >= aSeat.z) { ${OFF} }
          vec3 p = position; vec3 n = normal;
          if (aPart > 0.5) {
            // bent forward over the knees, the head down on the seat ahead: about the hip, toward the nose (−x)
            float a = uBrace * (1.0 + 0.16 * (aSeat.w - 0.5)) + (aPart > 1.5 ? uBrace * 0.3 : 0.0);
            float c = cos(a), s = sin(a);
            p.xy = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
            n.xy = vec2(n.x * c - n.y * s, n.x * s + n.y * c);
          }
          p += vec3(aSeat.x, ${f(HIP)}, aSeat.y);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vN = normalize(normalMatrix * n);
          vV = normalize(-mv.xyz);
          vTint = 0.0;
          vHead = aPart;
          gl_Position = projectionMatrix * mv;
        }`,
      ),
    );
    mesh.frustumCulled = false;
    mesh.renderOrder = 9;
    group.add(mesh);
    paxU.mesh = mesh;
  }
  const seatMesh = (() => {
    const parts = [];
    for (const [x, z] of seated) {
      parts.push(new THREE.BoxGeometry(9, 74, 44).translate(x + 24, HIP + 20, z));
      parts.push(new THREE.BoxGeometry(46, 9, 44).translate(x + 2, HIP - 8, z));
    }
    const m = new THREE.Mesh(mergeGeometries(parts.map((p) => (p.deleteAttribute("uv"), p))), M.seats);
    m.frustumCulled = false;
    m.renderOrder = 8;
    group.add(m);
    return m;
  })();

  /* ── the evacuees: 155 out — on both wings and in the two front rafts — then taken by the boats ── */
  const OUT = 155;
  const evU = { uEvac: { value: 0 }, uSaved: { value: 0 }, uAmount: { value: 1 }, uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() } };
  {
    const geo = new THREE.InstancedBufferGeometry().copy(standingGeometry());
    const aE = new Float32Array(OUT * 4);
    const aSpot = new Float32Array(OUT * 3);
    const aExit = new Float32Array(OUT * 3);
    const rand = rng(2009);
    const exitL = onSkin(hatchX[0], sideA(1, angleOfY(hatchX[0], HATCH.sill)), 4);
    let i = 0;
    const put = (n, t0, t1, spot, exit) => {
      for (let k = 0; k < n; k++, i++) {
        const turn = lerp(t0, t1, (k + 0.5 * rand()) / n);
        aE.set([turn, 0.03 + 0.94 * rand(), rand() * 6.283, rand()], i * 4);
        aSpot.set(spot(k, n), i * 3);
        aExit.set(exit, i * 3);
      }
    };
    const onWing = (s) => (k, n) => {
      // a crowd standing near the exits, spreading outboard: shoulder to shoulder at the root, thinner out
      const z = lerp(250, 1120, Math.pow(rand(), 0.8));
      const fr = 0.15 + 0.62 * rand();
      const x = LE(z) + fr * CH(z);
      return [x, top(x, z) + 2, s * z];
    };
    const inRaft = (side) => (k, n) => {
      const cols = 4;
      const c = k % cols;
      const r = Math.floor(k / cols);
      const rows = Math.ceil(n / cols);
      const x = doorX.L1 + (c - (cols - 1) / 2) * 38 + (rand() - 0.5) * 14;
      const z = RAFT.z0 + 60 + (r / Math.max(1, rows - 1)) * (RAFT.L - 120) + (rand() - 0.5) * 12;
      return [x, WATER + 8, side * (Math.abs(fronts[0].z) + 4 + z)];
    };
    const sillL = [doorX.L1, FLOOR, fronts[0].z + 20];
    const sillR = [doorX.R1, FLOOR, fronts[1].z - 20];
    const exitR = [exitL[0], exitL[1], -exitL[2]];
    put(32, 0.0, 0.48, onWing(1), exitL); //   the first ones out: on the LEFT wing (evac 0.3 ≈ twenty of them)
    put(42, 0.22, 0.98, inRaft(1), sillL); //  the raft at L1
    put(42, 0.26, 1.0, inRaft(-1), sillR); //  the raft at R1
    put(OUT - i, 0.34, 0.96, onWing(-1), exitR); // the right wing
    geo.setAttribute("aE", new THREE.InstancedBufferAttribute(aE, 4));
    geo.setAttribute("aSpot", new THREE.InstancedBufferAttribute(aSpot, 3));
    geo.setAttribute("aExit", new THREE.InstancedBufferAttribute(aExit, 3));
    geo.instanceCount = OUT;
    const mesh = new THREE.Mesh(
      geo,
      peopleMat(
        evU,
        /* glsl */ `
        uniform float uEvac, uSaved; attribute vec4 aE; attribute vec3 aSpot; attribute vec3 aExit; attribute float aPart;
        varying vec3 vN; varying vec3 vV; varying float vTint; varying float vHead;
        void main() {
          float on = step(0.0005, uEvac) * step(aE.x, uEvac);
          float gone = step(0.0005, uSaved) * step(aE.y, uSaved);
          if (on < 0.5 || gone > 0.5) { ${OFF} }
          float q = clamp((uEvac - aE.x) / 0.035, 0.0, 1.0);
          q = q * q * (3.0 - 2.0 * q);
          vec3 at = mix(aExit, aSpot, q);
          float yaw = aE.z;
          float c = cos(yaw), s = sin(yaw);
          vec3 p = position;
          p.y *= mix(0.55, 1.0, q); // they come out crouched
          vec3 n = normal;
          p.xz = vec2(p.x * c + p.z * s, -p.x * s + p.z * c);
          n.xz = vec2(n.x * c + n.z * s, -n.x * s + n.z * c);
          p += at;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vN = normalize(normalMatrix * n);
          vV = normalize(-mv.xyz);
          vTint = smoothstep(aE.y - 0.12, aE.y - 0.01, uSaved) * step(0.0005, uSaved);
          vHead = aPart;
          gl_Position = projectionMatrix * mv;
        }`,
      ),
    );
    mesh.frustumCulled = false;
    mesh.renderOrder = 9;
    mesh.visible = false;
    group.add(mesh);
    evU.mesh = mesh;
  }

  /* ── the geese: a V far ahead, then the flock, then — periodic — the strike: past the nose, two into each intake ── */
  const BIRDS = 24;
  const PER = 4.5; // s: one pass of the stream (the strike, slowed ≈ ×5: a bird must be seen)
  const RUN = 9000; // cm a bird travels in one pass, toward the plane (+x)
  const gooseU = {
    uG: { value: 0 }, uTime: { value: 0 }, uFar: { value: 40000 }, uAmount: { value: 0 },
    uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() },
  };
  const intakes = [nacMid(1), nacMid(1), nacMid(-1), nacMid(-1)];
  {
    const geo = new THREE.InstancedBufferGeometry().copy(gooseGeometry());
    const aS = new Float32Array(BIRDS * 3);
    const aV = new Float32Array(BIRDS * 3);
    const aP = new Float32Array(BIRDS * 4);
    const rand = rng(1527);
    for (let i = 0; i < BIRDS; i++) {
      // the V: its apex toward the plane, its legs trailing away (−x)
      const leg = i % 2 ? 1 : -1;
      const k = Math.floor((i + 1) / 2);
      aV.set([-k * 140 + (rand() - 0.5) * 50, 30 + (rand() - 0.5) * 80 + k * 9, leg * k * 150 + (rand() - 0.5) * 40], i * 3);
      let sx, sy, sz;
      if (i < 4) {
        // into an intake: two a side, a little off its centre, arriving at the lip
        const c = intakes[i];
        sx = c.x + 20 - RUN * 0.978;
        sy = c.y + (i % 2 ? 30 : -24);
        sz = c.z + (i % 2 ? -26 : 30);
      } else {
        // past the plane: over the cockpit and the wings, under the engines, never through the glass
        const lane = i < 10 ? 4 : i % 4;
        sx = A320.fuse.noseX - 3200 - rand() * 2600;
        if (lane === 0) [sy, sz] = [250 + rand() * 170, (rand() > 0.5 ? 1 : -1) * (170 + rand() * 260)];
        else if (lane === 1) [sy, sz] = [190 + rand() * 260, (rand() > 0.5 ? 1 : -1) * (700 + rand() * 900)];
        else if (lane === 2) [sy, sz] = [-470 - rand() * 220, (rand() - 0.5) * 2200];
        else if (lane === 3) [sy, sz] = [160 + rand() * 300, (rand() > 0.5 ? 1 : -1) * (300 + rand() * 300)];
        else [sy, sz] = [-420 - rand() * 220, 260 + rand() * 1050]; // under the left wing, beside its engine
      }
      aS.set([sx, sy, sz], i * 3);
      aP.set([i / BIRDS + (rand() - 0.5) * 0.04, rand(), i < 4 ? 1 : 0, 0.92 + 0.16 * rand()], i * 4);
    }
    geo.setAttribute("aS", new THREE.InstancedBufferAttribute(aS, 3));
    geo.setAttribute("aV", new THREE.InstancedBufferAttribute(aV, 3));
    geo.setAttribute("aP", new THREE.InstancedBufferAttribute(aP, 4));
    geo.instanceCount = BIRDS;
    const mat = new THREE.ShaderMaterial({
      uniforms: gooseU,
      vertexShader: /* glsl */ `
        uniform float uG, uTime, uFar; attribute vec3 aS; attribute vec3 aV; attribute vec4 aP; attribute float aTone; attribute float aWing;
        varying vec3 vN; varying vec3 vV; varying float vTone;
        void main() {
          float m = smoothstep(0.62, 0.97, uG);
          float u = fract(uTime / ${f(PER)} + aP.x);
          vec3 stream = aS + vec3(u * ${f(RUN)}, 0.0, 0.0);
          vec3 vee = aV + vec3(${f(A320.fuse.noseX)} - uFar, 18.0 * sin(uTime * 0.9 + aP.y * 6.28), 0.0);
          vec3 at = mix(vee, stream, m);
          // into the intake: gone at the lip; past the plane: gone aft of the tail; all of them born far
          float sc = aP.w * mix(1.0, (1.0 - smoothstep(0.955, 0.975, u) * aP.z) * (1.0 - smoothstep(0.8, 0.95, u) * (1.0 - aP.z)) * smoothstep(0.0, 0.05, u), m);
          if (sc < 0.01) { ${OFF} }
          // the wingbeat (slowed with the rest), and the body bobbing with it
          float beat = sin(uTime * 6.2831853 * 1.25 + aP.y * 6.2831853);
          vec3 p = position;
          vec3 n = normal;
          if (abs(aWing) > 0.5) {
            float a = aWing * beat * 0.62;
            float c = cos(a), s = sin(a);
            p.yz = vec2(p.y * c + p.z * s, -p.y * s + p.z * c);
            n.yz = vec2(n.y * c + n.z * s, -n.y * s + n.z * c);
          }
          p.y -= beat * 3.0;
          p *= sc;
          vec4 mv = modelViewMatrix * vec4(at + p, 1.0);
          vN = normalize(normalMatrix * n);
          vV = normalize(-mv.xyz);
          vTone = aTone;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uSignal; uniform float uAmount; varying vec3 vN; varying vec3 vV; varying float vTone;
        void main() {
          if (uAmount < 0.003) discard;
          vec3 n = normalize(vN); vec3 v = normalize(vV);
          vec3 L = normalize((viewMatrix * vec4(-0.45, 0.8, 0.5, 0.0)).xyz);
          float k = 0.28 + 0.72 * max(dot(n, L), 0.0);
          float g = clamp(1.0 - abs(dot(n, v)), 0.0, 1.0);
          vec3 col = uInk * vTone * k * 1.05 + uSignal * pow(g, 3.0) * 0.5 + uInk * pow(g, 6.0) * 0.2;
          gl_FragColor = vec4(col * uAmount, 1.0);
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 6;
    mesh.visible = false;
    group.add(mesh);
    gooseU.mesh = mesh;
  }
  // the feathers: a puff at each intake's lip when its bird goes in, drifting aft along the nacelle
  const featherU = { uTime: { value: 0 }, uOn: { value: 0 }, uScale: { value: 1500 }, uInk: { value: INK.clone() } };
  {
    const N = 120;
    const aC = new Float32Array(N * 3);
    const aF = new Float32Array(N * 4);
    const rand = rng(41);
    const birdPh = [];
    for (let i = 0; i < 4; i++) birdPh.push(i / BIRDS); // the same phases as the intake birds (without their jitter: close enough)
    for (let i = 0; i < N; i++) {
      const k = i % 4;
      const c = intakes[k];
      const a = rand() * 6.283;
      aC.set([c.x - 6, c.y + Math.sin(a) * 92, c.z + Math.cos(a) * 92], i * 3);
      aF.set([birdPh[k] + (rand() - 0.5) * 0.004, rand(), rand(), rand()], i * 4);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(aC, 3));
    geo.setAttribute("aF", new THREE.Float32BufferAttribute(aF, 4));
    const pts = new THREE.Points(
      geo,
      new THREE.ShaderMaterial({
        uniforms: featherU,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          uniform float uTime, uOn, uScale; attribute vec4 aF; varying float vA;
          void main() {
            float u = fract(uTime / ${f(PER)} + aF.x);
            float life = fract(u - 0.975) / 0.42;
            vA = uOn * step(life, 1.0) * (1.0 - life) * smoothstep(0.0, 0.04, life);
            if (vA < 0.002) { ${OFF} }
            vec3 d = normalize(vec3(aF.y - 0.75, aF.z - 0.5, aF.w - 0.5) + 1e-3);
            vec3 p = position + d * 70.0 * sqrt(life) + vec3(520.0 * life * life, -70.0 * life * life, 0.0);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = clamp(uScale * 9.0 / max(-mv.z, 1.0), 2.0, 14.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uInk; varying float vA;
          void main() {
            vec2 q = gl_PointCoord * 2.0 - 1.0;
            float r = dot(q, q);
            if (r > 1.0) discard;
            gl_FragColor = vec4(uInk * exp(-r * 2.5) * vA * 0.75, 1.0);
          }`,
      }),
    );
    pts.frustumCulled = false;
    pts.renderOrder = 7;
    pts.visible = false;
    group.add(pts);
    featherU.mesh = pts;
  }

  /* ── the flames the hit engines spit: a heart at the nozzle, a tail that flows aft ── */
  const FL = 380;
  const flameGeo = (() => {
    const pts = [];
    for (let k = 0; k <= 16; k++) {
      const u = k / 16;
      pts.push(new THREE.Vector2(Math.max(0.5, 44 * (1 - 0.7 * u) * (0.75 + 0.25 * Math.sin(Math.PI * Math.min(1, u * 2.2)))), u * FL));
    }
    return new THREE.LatheGeometry(pts, 32).rotateZ(-Math.PI / 2);
  })();
  const flames = [1, -1].map((s) => {
    const U = { uAmt: { value: 0 }, uTime: { value: 0 }, uInk: { value: INK.clone() }, uSig: { value: SIGNAL.clone() }, uSeed: { value: s > 0 ? 0 : 3.7 } };
    const mesh = new THREE.Mesh(
      flameGeo,
      new THREE.ShaderMaterial({
        uniforms: U,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        vertexShader: /* glsl */ `
          varying vec3 vP; varying vec3 vN; varying vec3 vV;
          void main() {
            vP = position;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uInk, uSig; uniform float uAmt, uTime, uSeed; varying vec3 vP; varying vec3 vN; varying vec3 vV;
          ${NOISE}
          void main() {
            if (uAmt < 0.003) discard;
            float u = clamp(vP.x / ${f(FL)}, 0.0, 1.0);
            float face = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
            float core = pow(face, 1.6);
            float flow = 0.45 + 0.55 * vnoise(vec2(u * 5.0 - uTime * 2.1 + uSeed, atan(vP.z, vP.y) * 1.2 + uSeed));
            float k = exp(-u * 2.4) * (1.0 - smoothstep(0.7, 1.0, u)) * flow * core;
            vec3 col = mix(uInk * 1.4, uSig * 1.25, smoothstep(0.03, 0.32, u));
            gl_FragColor = vec4(col * k * uAmt, 1.0);
          }`,
      }),
    );
    mesh.position.set(E.x + E.len * 1.035, E.y - 4, s * E.z);
    mesh.renderOrder = 7;
    mesh.frustumCulled = false;
    mesh.visible = false;
    const heart = glowSprite(150);
    heart.position.set(E.x + E.len * 1.06, E.y - 4, s * E.z);
    group.add(mesh, heart);
    return { U, mesh, heart, s };
  });

  /* ── the aft hull that takes the blow: the lower skin dented in, its frames bent, a signal glow under the aft cabin ── */
  const dentU = { uDamage: { value: 0 }, uSig: { value: SIGNAL.clone() } };
  const DX = [620, 1560];
  {
    const rows = [];
    const dents = [];
    for (let x = DX[0]; x <= DX[1]; x += 30) {
      const row = [];
      for (let j = 0; j <= 28; j++) {
        const a = lerp(-172, -8, j / 28) * DEG;
        const p = onSkin(x, a, -1);
        row.push(p);
        const ux = smooth(DX[0], DX[0] + 260, x) * smooth(DX[1], DX[1] - 300, x);
        const ua = Math.pow(Math.sin(Math.PI * (j / 28)), 1.4);
        const crumple = 0.7 + 0.3 * Math.sin(x * 0.031) * Math.sin(j * 1.7);
        dents.push(46 * ux * ua * crumple);
      }
      rows.push(row);
    }
    const geo = skin(rows);
    geo.setAttribute("aDent", new THREE.Float32BufferAttribute(dents, 1));
    const mesh = new THREE.Mesh(
      geo,
      new THREE.ShaderMaterial({
        uniforms: dentU,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        vertexShader: /* glsl */ `
          uniform float uDamage; attribute float aDent; varying vec3 vN; varying vec3 vV; varying float vD;
          void main() {
            // the skin's normals point IN: pushed along them
            vec3 p = position + normalize(normal) * aDent * uDamage;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            vD = aDent / 46.0;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uSig; uniform float uDamage; varying vec3 vN; varying vec3 vV; varying float vD;
          void main() {
            if (uDamage < 0.003) discard;
            float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
            float k = (0.03 + 0.36 * pow(g, 2.2)) * (0.3 + 0.7 * vD);
            gl_FragColor = vec4(uSig * k * uDamage, 1.0);
          }`,
      }),
    );
    mesh.renderOrder = 7;
    mesh.frustumCulled = false;
    mesh.visible = false;
    group.add(mesh);
    dentU.mesh = mesh;
  }
  const bentMat = lineMat(BRAND.signal, 2.2, { opacity: 0 });
  {
    const list = [];
    for (let k = 0; k < 5; k++) {
      const x = lerp(DX[0] + 220, DX[1] - 240, k / 4);
      const pts = [];
      for (let j = 0; j <= 20; j++) {
        const a = lerp(-165, -15, j / 20) * DEG;
        const ua = Math.pow(Math.sin(Math.PI * (j / 20)), 1.4);
        const ux = smooth(DX[0], DX[0] + 260, x) * smooth(DX[1], DX[1] - 300, x);
        pts.push(onSkin(x + Math.sin(j * 1.3 + k) * 8 * ua, a, -2 - 40 * ux * ua * (0.75 + 0.25 * Math.sin(j * 2.1 + k))));
      }
      for (let i = 0; i < pts.length - 1; i++) list.push(...pts[i], ...pts[i + 1]);
    }
    const geo = new LineSegmentsGeometry();
    geo.setPositions(list);
    const lines = new LineSegments2(geo, bentMat);
    lines.renderOrder = 3;
    lines.frustumCulled = false;
    lines.visible = false;
    group.add(lines);
    dentU.lines = lines;
  }
  const aftGlow = glowSprite(560);
  aftGlow.position.set(1120, FLOOR - 40, 0);
  group.add(aftGlow);

  /* ── the spray of the touchdown: sheets of water thrown up and out from the aft belly and the nacelles, once ── */
  const SPRAY = 340;
  const sprayU = { uSpray: { value: 0 }, uScale: { value: 1500 }, uRes: { value: RES }, uInk: { value: INK.clone() } };
  {
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const aO = new Float32Array(SPRAY * 3);
    const aD = new Float32Array(SPRAY * 3);
    const aK = new Float32Array(SPRAY * 4);
    const rand = rng(1843);
    for (let i = 0; i < SPRAY; i++) {
      let o;
      let d;
      if (i < SPRAY * 0.6) {
        // the aft belly: it touches first
        const x = lerp(500, 1650, rand());
        const s0 = section(x);
        const sd = rand() > 0.5 ? 1 : -1;
        o = [x, s0.mid - s0.hh * 0.95, sd * s0.w * 0.4 * rand()];
        d = [0.35 + 0.5 * rand(), 0.7 + 0.6 * rand(), sd * (0.6 + 0.9 * rand())];
      } else {
        const s = rand() > 0.5 ? 1 : -1;
        o = [E.x + 80 + rand() * 300, E.y - 100, s * E.z + (rand() - 0.5) * 120];
        d = [0.5 + 0.6 * rand(), 0.5 + 0.7 * rand(), s * (0.4 + 0.9 * rand())];
      }
      const n = Math.hypot(...d);
      aO.set(o, i * 3);
      aD.set(d.map((v) => v / n), i * 3);
      aK.set([0.42 * Math.pow(rand(), 1.4), 0.4 + 0.25 * rand(), lerp(500, 1900, Math.pow(rand(), 1.2)), lerp(28, 90, rand())], i * 4);
    }
    geo.setAttribute("aO", new THREE.InstancedBufferAttribute(aO, 3));
    geo.setAttribute("aD", new THREE.InstancedBufferAttribute(aD, 3));
    geo.setAttribute("aK", new THREE.InstancedBufferAttribute(aK, 4));
    geo.instanceCount = SPRAY;
    const mesh = new THREE.Mesh(
      geo,
      new THREE.ShaderMaterial({
        uniforms: sprayU,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          uniform float uSpray, uScale; uniform vec2 uRes; attribute vec3 aO; attribute vec3 aD; attribute vec4 aK;
          varying vec2 vQ; varying float vA;
          void main() {
            float life = clamp((uSpray - aK.x) / aK.y, 0.0, 1.0);
            vA = pow(1.0 - life, 1.3) * smoothstep(0.0, 0.05, life) * step(0.0005, uSpray);
            if (vA < 0.002) { ${OFF} }
            float fly = 1.0 - (1.0 - life) * (1.0 - life);
            vec3 c = aO + aD * aK.z * fly;
            c.y -= 520.0 * life * life;
            float h = aK.z * 0.18 * mix(1.0, 0.45, life);
            vec3 way = normalize(aD * aK.z * 2.0 * (1.0 - life) + vec3(0.0, -1040.0 * life, 0.0) + vec3(1e-3, 0.0, 0.0));
            vec4 a = projectionMatrix * modelViewMatrix * vec4(c - way * h, 1.0);
            vec4 b = projectionMatrix * modelViewMatrix * vec4(c + way * h, 1.0);
            vQ = position.xy;
            if (a.w < 1.0 || b.w < 1.0) { ${OFF} }
            vec2 run = (b.xy / b.w - a.xy / a.w) * uRes;
            float len = length(run);
            run = len > 1e-4 ? run / len : vec2(1.0, 0.0);
            vec4 p = position.x < 0.0 ? a : b;
            float wide = max(2.0, aK.w * mix(1.0, 1.8, life) * uScale / p.w);
            p.xy += vec2(-run.y, run.x) * position.y * (wide / uRes) * p.w;
            gl_Position = p;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uInk; varying vec2 vQ; varying float vA;
          void main() {
            float a = (1.0 - vQ.y * vQ.y) * pow(clamp(1.0 - abs(vQ.x), 0.0, 1.0), 0.8);
            gl_FragColor = vec4(uInk * a * vA * 0.42, 1.0);
          }`,
      }),
    );
    mesh.frustumCulled = false;
    mesh.renderOrder = 7;
    mesh.visible = false;
    group.add(mesh);
    sprayU.mesh = mesh;
  }

  /* ── the openings under the waterline (what the ditching button shuts): marked ink, their doors swing shut ── */
  const sealMat = lineMat(BRAND.ink, 3, { opacity: 0 });
  const sealFlaps = [];
  {
    const list = [];
    // [x, angle (deg from the side, negative = under), side, w, h]: the outflow valve (aft, right), the packs' ram-air
    // inlets (under the wing root), the avionics' vents (forward), the emergency ram-air inlet
    const SPOTS = [[1150, -38, -1, 46, 40], [80, -70, 1, 52, 26], [80, -70, -1, 52, 26], [-1240, -52, -1, 30, 22], [320, -80, 1, 34, 20]];
    for (const [x, aDeg, side, w, h] of SPOTS) {
      const a = sideA(side, aDeg * DEG);
      const yc = section(x).mid + section(x).hh * Math.sin(aDeg * DEG);
      // its edge, and a ring well clear of it: the mark reads from across the river
      for (const [mw, mh, rad] of [[w, h, 8], [w + 46, h + 46, 26]]) {
        const rr = densify(roundRect(x, yc - mh / 2, mw, mh, rad)).map(([xx, yy]) => onSkin(xx, sideA(side, angleOfY(xx, yy)), 3));
        for (let i = 0; i < rr.length - 1; i++) list.push(...rr[i], ...rr[i + 1]);
      }
      // its door: a small plate hinged at its forward edge, open outward
      const c = onSkin(x - w / 2, a, 1.5);
      const hinge = new THREE.Group();
      hinge.position.set(...c);
      const nrm = V(0, Math.sin(aDeg * DEG), side * Math.cos(aDeg * DEG)).normalize();
      hinge.quaternion.setFromUnitVectors(V(0, 0, 1), nrm);
      const part = makePart("seal");
      addMesh(part, box(w, h, 3, 1), solid(0x6a7177, { rough: 0.55, metal: 0.25 }), { pos: [w / 2, 0, 0], edgeOpacity: 0.8 });
      hinge.add(part);
      hinge.visible = false;
      group.add(hinge);
      sealFlaps.push({ hinge, part, side });
    }
    const geo = new LineSegmentsGeometry();
    geo.setPositions(list);
    const lines = new LineSegments2(geo, sealMat);
    lines.renderOrder = 3;
    lines.frustumCulled = false;
    lines.visible = false;
    group.add(lines);
    sealMat.userData.lines = lines;
  }

  /* ── the safety card in a seat's back pocket (row 12, left), and that seat ── */
  const cardPart = makePart("card");
  {
    const [cx, cy, cz] = A320.card;
    const seatMat = solid(0x30363b, { rough: 0.75, env: 0.5 });
    addMesh(cardPart, box(10, 92, 46, 3), seatMat, { pos: [cx - 9, cy - 4, cz], edgeOpacity: 0.6 }); // the seat back
    addMesh(cardPart, box(3, 26, 40, 1), solid(0x262b30, { rough: 0.85 }), { pos: [cx + 1.5, cy - 14, cz], edgeOpacity: 0.5 }); // the pocket
    // the card: pictograms only (a plane seen from above and its exits, the brace position, the raft), no word
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 360;
    const k = cv.getContext("2d");
    k.fillStyle = "#e4dfd2";
    k.fillRect(0, 0, 256, 360);
    k.fillStyle = "#2a2f33";
    k.fillRect(10, 10, 236, 26);
    k.strokeStyle = "#2a2f33";
    k.lineWidth = 5;
    // the plane from above, its exits
    k.beginPath();
    k.moveTo(128, 50);
    k.quadraticCurveTo(146, 62, 146, 92);
    k.lineTo(146, 180);
    k.lineTo(228, 140);
    k.lineTo(228, 158);
    k.lineTo(146, 210);
    k.lineTo(140, 250);
    k.lineTo(166, 262);
    k.lineTo(166, 272);
    k.lineTo(128, 266);
    k.lineTo(90, 272);
    k.lineTo(90, 262);
    k.lineTo(116, 250);
    k.lineTo(110, 210);
    k.lineTo(28, 158);
    k.lineTo(28, 140);
    k.lineTo(110, 180);
    k.lineTo(110, 92);
    k.quadraticCurveTo(110, 62, 128, 50);
    k.stroke();
    k.fillStyle = "#2a2f33";
    for (const [x, y] of [[100, 82], [148, 82], [100, 168], [148, 168], [100, 186], [148, 186], [100, 240], [148, 240]]) k.fillRect(x, y, 8, 12);
    // the brace position, the raft
    k.lineWidth = 4;
    k.strokeRect(14, 288, 108, 62);
    k.strokeRect(134, 288, 108, 62);
    k.beginPath();
    k.arc(52, 310, 7, 0, 7);
    k.moveTo(58, 316);
    k.lineTo(84, 330);
    k.lineTo(84, 344);
    k.moveTo(40, 318);
    k.lineTo(40, 344);
    k.stroke();
    k.beginPath();
    k.ellipse(188, 330, 40, 11, 0, 0, 7);
    k.stroke();
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const cardMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0 });
    cardMat.userData = { base: 1, transparent: false, depthWrite: true, finish: false }; // what setPartOpacity reads
    addMesh(cardPart, new THREE.PlaneGeometry(21, 29.5).rotateY(Math.PI / 2), cardMat, { pos: [cx + 0.6, cy - 2, cz], edges: false });
    cardPart.userData.cardMat = cardMat;
    group.add(cardPart);
    setPartOpacity(cardPart, 0);
  }

  /* ── the current: veille dashes on a dark conductor, from what makes it to the cockpit ── */
  const feedLine = (pts, color, width, o) => {
    const geo = new LineGeometry();
    geo.setPositions(pts.flat());
    const mat = lineMat(color, width, o);
    mat.worldUnits = true;
    mat.linewidth = width;
    const line = new Line2(geo, mat);
    line.computeLineDistances();
    line.renderOrder = 5;
    line.frustumCulled = false;
    line.visible = false;
    group.add(line);
    return line;
  };
  const C = A320.cockpit;
  const AV = A320.avionics;
  const busTo = [[100, FLOOR - 40, 0], [AV.x + 60, FLOOR - 50, 0], [AV.x, AV.y, 0], [C.floorX - 20, C.floorY + 30, 0]];
  const PATHS = {
    engines: [1, -1].map((s) => [[E.x + E.len * 0.55, E.y + 70, s * E.z], [E.x + E.len * 0.75, WY(E.z) - 10, s * E.z], [60, WY(260) - 8, s * 260], [100, FLOOR - 40, s * 40], ...busTo]),
    apu: [[[A320.apu.x - 40, A320.apu.y - 20, 0], [1700, FLOOR - 30, 0], [1200, FLOOR - 40, 0], ...busTo]],
  };
  const feeds = {};
  for (const [k, list] of Object.entries(PATHS)) {
    feeds[k] = list.map((pts) => ({
      wire: feedLine(pts, 0x23292e, 11, { opacity: 0.95 }),
      dash: feedLine(pts, BRAND.veille, 6, { opacity: 1, dashed: true, dashSize: 34, gapSize: 26 }),
    }));
  }

  /* ── the frost on the upper skin of the wings ── */
  const frostU = { uCold: { value: 0 } };
  {
    const mat = new THREE.ShaderMaterial({
      uniforms: frostU,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        varying vec3 vP; varying float vUp; varying vec3 vN; varying vec3 vV;
        void main() {
          vP = position;
          vUp = -normal.y; // the skin's normals point in: the upper skin's point down
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uCold; varying vec3 vP; varying float vUp; varying vec3 vN; varying vec3 vV;
        ${NOISE}
        void main() {
          if (uCold < 0.003 || vUp < 0.35) discard;
          float n = vnoise(vP.xz / 55.0) * 0.6 + vnoise(vP.xz / 14.0) * 0.4;
          float fw = max(fwidth(vP.x / 14.0), 1e-4);
          n = mix(0.5, n, 1.0 - smoothstep(0.4, 1.2, fw));
          float k = smoothstep(0.38, 0.75, n) * smoothstep(0.35, 0.7, vUp) * uCold * 0.11;
          gl_FragColor = vec4(vec3(0.913, 0.894, 0.847) * k, 1.0);
        }`,
    });
    for (const geo of air.wingGeos) {
      const m = new THREE.Mesh(geo, mat);
      m.renderOrder = 6;
      m.frustumCulled = false;
      group.add(m);
    }
  }

  /* ── the anchors the chapters read ── */
  const A = {};
  const anchor = (name, x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    group.add(o);
    A[name] = o;
  };
  anchor("nose", A320.fuse.noseX, 0, 0);
  anchor("tail", A320.fuse.tailX, 0, 0);
  anchor("doorL1", ...A320.doors.L1);
  anchor("doorR1", ...A320.doors.R1);
  anchor("wingL", 0, A320.overwing.y, A320.fuse.r);
  anchor("belly", 1000, -A320.fuse.r, 0);
  anchor("card", ...A320.card);
  anchor("intakeL", E.x, E.y, E.z);
  anchor("intakeR", E.x, E.y, -E.z);
  anchor("cabin", 0, 0, 0);

  const q = new THREE.Quaternion();
  const tv = V();
  const AFT = V(1, 0, 0);

  return {
    group,
    A,
    update(p, time, px) {
      const shell = clamp01(p.shell ?? 1);
      M.hull.uniforms.uAmount.value = shell;
      M.wings.uniforms.uAmount.value = shell;
      M.frames.opacity = 0.22 * shell;
      M.outline.opacity = 0.6 * Math.max(shell, 0.25);
      M.windows.uniforms.uLights.value = clamp01(p.cabin ?? 0);
      M.windows.uniforms.uAmount.value = Math.max(0.15, shell);

      /* the nacelles, their fans; the flames */
      for (let i = 0; i < 2; i++) {
        const e = engines[i];
        const n1 = (i === 0 ? p.n1L : p.n1R) ?? 82;
        e.part.visible = (i === 0 ? p.nacL : p.nacR) > 0.5;
        e.fan.uniforms.uLife.value = clamp01(n1 / 45);
        e.fan.uniforms.uPhase.value = (time * 0.32 * (n1 / 100)) % 1;
      }
      const fl = clamp01(p.flame ?? 0);
      for (let i = 0; i < 2; i++) {
        const F = flames[i];
        const a = fl * (i === 0 ? 1 : 0.55);
        F.U.uAmt.value = a;
        F.U.uTime.value = time;
        F.mesh.visible = a > 0.003;
        F.heart.visible = a > 0.003;
        const breathe = 0.85 + 0.15 * Math.sin(time * 1.7 + i * 2);
        F.heart.material.color.copy(SIGNAL).multiplyScalar(1.15 * a * breathe);
      }

      /* the flaps, the gear */
      const fp = clamp01(p.flaps ?? 0);
      for (let i = 0; i < flaps.length; i++) {
        const F = flaps[i];
        q.setFromAxisAngle(F.axis, -F.s * 0.5 * fp);
        tv.copy(F.pivot).applyQuaternion(q);
        F.mesh.position.copy(F.pivot).sub(tv).addScaledVector(AFT, 0.45 * F.chord * fp);
        F.mesh.position.y -= 6 * fp;
        F.mesh.quaternion.copy(q);
      }
      const gd = clamp01(p.gearDown ?? 0);
      for (let i = 0; i < gear.length; i++) {
        const G = gear[i];
        G.leg.visible = gd > 0.01;
        if (G.main) G.leg.rotation.set(G.s * (1 - gd) * 1.5, 0, 0);
        else G.leg.rotation.set(0, 0, -(1 - gd) * 1.6);
      }

      /* the front doors, their packs and rafts; the overwing hatches */
      const dr = clamp01(p.doors ?? 0);
      const rf = clamp01(p.rafts ?? 0);
      const pk = clamp01(p.packs ?? 0);
      for (let i = 0; i < fronts.length; i++) {
        const D = fronts[i];
        D.leafPart.visible = dr > 0.004;
        const out = smooth(0, 0.25, dr);
        const swing = smooth(0.15, 1, dr);
        D.pivot.position.z = D.z + D.side * 14 * out;
        D.pivot.rotation.y = -D.side * 2.75 * swing;
        setPartOpacity(D.pack, rf > 0.04 ? 0 : pk);
        D.holder.visible = rf > 0.008;
        const unroll = smooth(0, 0.55, rf);
        const fat = smooth(0.15, 1, rf);
        D.holder.scale.set(lerp(0.45, 1, fat), lerp(0.08, 1, fat), Math.max(0.02, unroll));
      }
      const we = clamp01(p.wingExits ?? 0);
      for (let i = 0; i < hatches.length; i++) {
        const H = hatches[i];
        H.holder.visible = we > 0.004;
        const u = smooth(0, 1, we);
        H.holder.position.lerpVectors(H.closed, H.open, u);
        H.holder.position.y += Math.sin(Math.PI * u) * 45;
        H.holder.rotation.set(-H.side * (Math.PI / 2) * u, H.side > 0 ? 0 : Math.PI, 0);
      }

      /* the people */
      paxU.uAmount.value = clamp01(p.pax ?? 0);
      paxU.uBrace.value = clamp01(p.brace ?? 0);
      paxU.uEvac.value = clamp01(p.evac ?? 0);
      paxU.mesh.visible = paxU.uAmount.value > 0.003;
      M.seats.uniforms.uAmount.value = 0.75 * paxU.uAmount.value;
      seatMesh.visible = paxU.uAmount.value > 0.003;
      evU.uEvac.value = clamp01(p.evac ?? 0);
      evU.uSaved.value = clamp01(p.saved ?? 0);
      evU.mesh.visible = evU.uEvac.value > 0.0005 && evU.uSaved.value < 0.999;

      /* the geese, their feathers */
      const gs = clamp01(p.geese ?? 0);
      gooseU.uG.value = gs;
      gooseU.uTime.value = time;
      gooseU.uAmount.value = smooth(0.01, 0.25, gs);
      gooseU.uFar.value = gs <= 0.3 ? 40000 : Math.exp(lerp(Math.log(40000), Math.log(600), smooth(0.3, 0.6, gs)));
      gooseU.mesh.visible = gs > 0.01;
      featherU.uTime.value = time;
      featherU.uOn.value = smooth(0.85, 1, gs);
      featherU.uScale.value = px;
      featherU.mesh.visible = featherU.uOn.value > 0.003;

      /* the aft hull, the spray */
      const dm = clamp01(p.damage ?? 0);
      dentU.uDamage.value = dm;
      dentU.mesh.visible = dm > 0.003;
      dentU.lines.visible = dm > 0.003;
      bentMat.opacity = 0.85 * dm;
      aftGlow.visible = dm > 0.003;
      aftGlow.material.color.copy(SIGNAL).multiplyScalar(0.55 * dm * (0.85 + 0.15 * Math.sin(time * 1.1)));
      const sp = clamp01(p.spray ?? 0);
      sprayU.uSpray.value = sp;
      sprayU.uScale.value = px;
      sprayU.mesh.visible = sp > 0.0005 && sp < 0.999;

      /* the openings the button shuts */
      const se = clamp01(p.seal ?? 0);
      const mark = smooth(0.02, 0.22, se) * (1 - 0.65 * smooth(0.88, 1, se));
      const shut = smooth(0.45, 0.85, se);
      sealMat.opacity = 0.95 * mark;
      sealMat.userData.lines.visible = mark > 0.003;
      for (let i = 0; i < sealFlaps.length; i++) {
        const S = sealFlaps[i];
        S.hinge.visible = mark > 0.003;
        S.part.rotation.y = -0.6 * (1 - shut);
        setPartOpacity(S.part, Math.min(1, mark * 1.4));
      }

      /* the card */
      const sf = clamp01(p.safety ?? 0);
      setPartOpacity(cardPart, sf);
      cardPart.userData.cardMat.emissiveIntensity = 0.38 * sf;

      /* the current */
      const fd = clamp01(p.feed ?? 0);
      const fromApu = (p.apu ?? 0) > 0.5;
      const run = -((time * 150) % 60);
      for (let j = 0; j < 2; j++) {
        const amt = fd * (j === 1 ? (fromApu ? 1 : 0) : fromApu ? 0 : clamp01(p.gen ?? 1));
        const L = j === 1 ? feeds.apu : feeds.engines;
        for (let i = 0; i < L.length; i++) {
          L[i].wire.visible = amt > 0.003;
          L[i].dash.visible = amt > 0.003;
          L[i].wire.material.opacity = 0.95 * amt;
          L[i].dash.material.opacity = amt;
          L[i].dash.material.dashOffset = run;
        }
      }

      /* the cold */
      frostU.uCold.value = clamp01(p.cold ?? 0);
    },
  };
}
