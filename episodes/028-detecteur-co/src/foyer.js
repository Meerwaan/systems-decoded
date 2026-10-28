// DOSSIER 028 — Détecteur de CO : THE FLAT AROUND THE BEDROOM, at night, an X-ray.
//   buildFoyer() → { group, A, update(P, time, px) }
//   group   in the flat's coordinates (floor y = 0), the same as 022's chambre.js (world.js builds the bedroom itself:
//           nothing here redraws it — the door's frame and leaf, the window's sash are laid ON its walls)
//   A       anchors: boiler · burner · flue · leak · door · window · kids · out · smoke · head
//   P       { shell, fade, flame, leak, co, window, air, kids, kidsOut, me, mePose, breath, smoke, ache }
//
// WHAT IS HERE, drawn in chambre.js's own stroke (same glass, same three line weights, the same grid) so that a cut
// from one to the other does not show:
//   · THE CORRIDOR behind the bedroom's back wall, its floor a grid; THE BEDROOM'S DOOR in that wall, wide open.
//   · THE WALL BOILER on the corridor's far wall: a tall white casing of glass (its little window on the flame, its
//     controls, the pipes and the gas tap under it, the flue straight up through the ceiling). Solid inside it, only
//     the burner and its FLAME — nine small tongues, a white heart, a slow breath — and the light it throws, a light
//     that has a place: the boiler glows.
//   · THE GAS. `leak`: soft signal ribbons leaving its underside, along the corridor, through the door, toward your
//     head (and a second bundle to the children's room) — puffs travel along them at 40 cm/s from frame 0: the first
//     picture is an event. They widen and pale as they go: the gas mixes. `co`: the gas in the air of the three rooms,
//     a marched volume of slow billows at EVERY height (never a layer on the floor or under the ceiling), denser — not
//     higher — from 0.5 to 1, capped so that your face, the detector and the boiler always read through it.
//   · THE ACHE: a slow throb at your upper temple (022's sleeping figure; only the light is here).
//   · THE WINDOW's sash (022's window, the +x wall) opening inward round its +z edge; THE FRESH AIR, veille ribbons
//     pouring in by the opening and pushing the haze back.
//   · THE CHILDREN'S ROOM: its walls, its door, two small beds, two children of glass asleep on their backs, breathing.
//   · YOU, AWAKE: three figures of glass — sitting on the bed's edge, your head turned to the wall where the detector
//     sounds · standing at the window, a hand on its handle (it follows the sash half way, then lets it swing) ·
//     outside, facing the garden camera.
//   · OUTSIDE: the garden, a grid on the ground (none under the corridor that juts out), a low fence of lines; the
//     two children standing either side of you; your breaths, veille plumes that rise and dissolve every 3.4 s.
//   · THE SMOKE DETECTOR on the bedroom's ceiling: a white disc, solid, its little light off. `smoke` lights its
//     outline in ink and opens a clear bubble round it in the haze: the gas goes round it, it sees nothing.
// Three colours: signal the gas, the flame, the ache · veille the fresh air and your breath outside · ink the rest.
// Shell orders (`asShell`): you awake 12 · the children 16 (022: you asleep 10, pillow 14, duvet 18, table 22, headboard 26).
// Draw order of the matter: the haze 7, the ribbons 8 (both before every shell: glass is never hidden by gas, it
// adds over it), the glows 30 and the breath 31 (after).
// Centimetres, y up. Everything is a function of the state and of `time`; `update` allocates nothing.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glass, asShell, box, cyl, lathe, placed, lineMat, fatLine, makePart, addMesh, setPartOpacity, mergeGeometries, anchor } from "@kit/build3d.js";
import { ROOM, BED, WINDOW, HALL, DOOR, BOILER, LEAK, KIDS, OUTSIDE, SMOKE, YOU, DETECTOR } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const STROKE = { strong: { w: 2.4, a: 0.74 }, fine: { w: 1.9, a: 0.42 }, faint: { w: 1.8, a: 0.2 } };
const ORDER = { me: 12, kids: 16 };
const CEIL = HALL.h;
const BACK = ROOM.z0; // the bedroom's back wall (z = −125): the corridor's near side
const [BX, BY, BZ] = BOILER.at; // the centre of the casing's underside
const CASE = { x0: BX - BOILER.w / 2, x1: BX + BOILER.w / 2, y0: BY, y1: BY + BOILER.h, z0: BZ - BOILER.d / 2, z1: BZ + BOILER.d / 2 };
const BURN = { at: BOILER.burner, w: 24, d: 8, h: 3 }; // the burner bar, centred on BOILER.burner
const OPEN = 78 * DEG; // the sash, wide open (inward)
const SASH = { w: WINDOW.z1 - WINDOW.z0, h: WINDOW.y1 - WINDOW.y0, y: (WINDOW.y0 + WINDOW.y1) / 2 };
const HANDLE = [-3.2, 0, -(SASH.w - 9)]; // on the sash, its own frame (the hinge at its origin, the pane toward −z)

/* ───────────────────────────────────────────────────────────── glass and lines, baked where they stand (022's chambre.js) */

function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  return o;
}
function makeSet() {
  const L = { strong: [], fine: [], faint: [] };
  const buckets = new Map();
  const into = (material, g) => {
    if (!buckets.has(material)) buckets.set(material, []);
    buckets.get(material).push(g);
  };
  const seg = (list, a, b) => list.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const run = (list, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) seg(list, pts[i], pts[i + 1]);
    if (closed) seg(list, pts[pts.length - 1], pts[0]);
  };
  const edgesInto = (list, geometry) => {
    const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, 28).attributes.position;
    for (let i = 0; i < e.count; i += 2) seg(list, [e.getX(i), e.getY(i), e.getZ(i)], [e.getX(i + 1), e.getY(i + 1), e.getZ(i + 1)]);
  };
  const piece = (material, geometry, { pos, rotX, rotY, rotZ, lines = false } = {}) => {
    const g = placed(geometry, { pos, rotX, rotY, rotZ });
    if (lines) edgesInto(L[lines], g);
    into(material, bare(g));
  };
  const slab = (material, xa, xb, ya, yb, za, zb, { r = 0.25, lines = false } = {}) => piece(material, box(xb - xa, yb - ya, zb - za, r), { pos: [(xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2], lines });
  const sheet = (material, a, b, c, d) => {
    const n = V(...b).sub(V(...a)).cross(V(...d).sub(V(...a))).normalize();
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(Array.from({ length: 6 }, () => [n.x, n.y, n.z]).flat(), 3));
    into(material, g);
  };
  const circle = (list, c, r, axis = "y", n = 32) => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const u = r * Math.cos(a);
      const v = r * Math.sin(a);
      pts.push(axis === "y" ? [c[0] + u, c[1], c[2] + v] : axis === "z" ? [c[0] + u, c[1] + v, c[2]] : [c[0], c[1] + u, c[2] + v]);
    }
    run(list, pts, true);
  };
  const build = (parent, order, glasses, lines) => {
    for (const [material, list] of buckets) {
      const mesh = new THREE.Mesh(list.length > 1 ? mergeGeometries(list) : list[0], material);
      mesh.frustumCulled = false;
      parent.add(mesh);
      if (order != null) asShell(mesh, order);
      if (!glasses.includes(material)) glasses.push(material);
    }
    for (const name of Object.keys(L)) {
      if (!L[name].length) continue;
      const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(L[name]), lineMat(BRAND.ink, STROKE[name].w, { opacity: STROKE[name].a }));
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;
      parent.add(mesh);
      lines.push(mesh.material);
    }
  };
  return { L, seg, run, piece, slab, sheet, circle, build };
}
/** A rectangle with round corners, flat at height y: its points, in order. */
function rrect(x0, x1, z0, z1, r, y, n = 5) {
  const pts = [];
  const corner = (cx, cz, from) => {
    for (let i = 0; i <= n; i++) {
      const a = from + (i / n) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]);
    }
  };
  corner(x1 - r, z1 - r, 0);
  corner(x0 + r, z1 - r, Math.PI / 2);
  corner(x0 + r, z0 + r, Math.PI);
  corner(x1 - r, z0 + r, 1.5 * Math.PI);
  return pts;
}

/** A floor that is only its grid (022's, cell for cell: its lines run on from one room to the next). `hole`: a rect left bare. */
function gridMaterial({ cell = 25, major = 4, reach = 300, centre = [0, 0], hole = [0, 0, 0, 0] }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK }, uCell: { value: cell }, uMajor: { value: major }, uReach: { value: reach }, uCentre: { value: new THREE.Vector2(...centre) }, uHole: { value: new THREE.Vector4(...hole) }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uCell, uMajor, uReach, uAmount; uniform vec2 uCentre; uniform vec4 uHole; varying vec2 vP;
      float lines(float q) {
        float fw = max(fwidth(q), 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return smoothstep(3.0, 11.0, 1.0 / fw) * (1.0 - smoothstep(0.0, fw * 1.5, d));
      }
      float level(vec2 q) { return max(lines(q.x), lines(q.y)); }
      void main() {
        if (uAmount < 0.002) discard;
        if (vP.x > uHole.x && vP.x < uHole.z && vP.y > uHole.y && vP.y < uHole.w) discard;
        float g = max(level(vP / uCell) * 0.42, level(vP / (uCell * uMajor)));
        vec2 r = (vP - uCentre) / uReach;
        gl_FragColor = vec4(uColor * (g * (0.3 + 0.7 * exp(-dot(r, r))) * uAmount), 1.0);
      }`,
  });
}
function floorPlane(material, x0, x1, z0, z1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2), material);
  m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
  m.frustumCulled = false;
  return m;
}

/* ───────────────────────────────────────────────────────────── a head and a figure of glass (022's chambre.js, the same glass as you asleep) */

const SKULL = [
  { c: [0, 2.2, -1.5], r: [7.6, 8.5, 9.7] },
  { c: [0, -3.8, 2.0], r: [6.5, 7.4, 6.5], k: 1.8 },
  { c: [0, -8.4, 4.4], r: [2.8, 2.1, 2.3], k: 2.2 },
  { c: [0, 2.6, 6.3], r: [5.9, 1.4, 2.4], k: 1.0 },
  { c: [4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 },
  { c: [-4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 },
  { c: [0, 0.2, 7.3], r: [0.95, 3.0, 1.55], k: 0.8 },
  { c: [0, -2.7, 8.1], r: [1.3, 1.35, 2.3], k: 1.0 },
  { c: [0, -6.5, 6.5], r: [2.6, 1.1, 1.7], k: 1.8 },
];
let HEAD_GEO = null;
function headGeometry() {
  if (HEAD_GEO) return HEAD_GEO;
  const far = (d, c, r) => {
    const ax = d.x / r[0], ay = d.y / r[1], az = d.z / r[2];
    const bx = c[0] / r[0], by = c[1] / r[1], bz = c[2] / r[2];
    const a = ax * ax + ay * ay + az * az;
    const b = ax * bx + ay * by + az * bz;
    const disc = b * b - a * (bx * bx + by * by + bz * bz - 1);
    return disc > 0 ? Math.max(0, (b + Math.sqrt(disc)) / a) : 0;
  };
  const smax = (a, b, k) => {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.max(a, b) + h * h * k * 0.25;
  };
  const ico = new THREE.IcosahedronGeometry(1, 20);
  ico.deleteAttribute("uv");
  ico.deleteAttribute("normal");
  const g = mergeVertices(ico, 1e-5);
  const at = g.attributes.position;
  const d = V();
  for (let i = 0; i < at.count; i++) {
    d.fromBufferAttribute(at, i).normalize();
    let r = far(d, SKULL[0].c, SKULL[0].r);
    for (let j = 1; j < SKULL.length; j++) r = smax(r, far(d, SKULL[j].c, SKULL[j].r), SKULL[j].k);
    at.setXYZ(i, d.x * r, d.y * r, d.z * r);
  }
  g.computeVertexNormals();
  HEAD_GEO = g;
  return g;
}
function glassFigure({ order, k = 1.22, through = 0.2, hands = "real" }) {
  const fig = makeFigure({ shell: true, hands, order, glassK: k, through, skin: BRAND.ink });
  fig.ghost(true);
  const HEADY = 76.5;
  const headGeo = headGeometry();
  const head = glass(BRAND.ink, { base: 0.006 * k, rim: 0.5 * k, power: 2.4, edge: 0.42 * k, spec: 0.65 * k, through: 0.06 });
  fig.head.geometry = headGeo;
  fig.head.material = head;
  fig.head.position.set(0, HEADY, 2);
  asShell(fig.head, order);
  for (const layer of fig.head.children) if (layer.userData.shell) layer.geometry = headGeo;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.6, 9, 24, 1, true), fig.body);
  neck.position.set(0, HEADY - 12.5, 0.7);
  neck.rotation.x = 10 * DEG;
  neck.scale.z = 0.92;
  fig.torso.add(neck);
  asShell(neck, order);
  fig.headGlass = head;
  return fig;
}
/** Where the mouth of a posed figure is (in its parent's frame), and which way it breathes out. */
function mouthOf(fig) {
  fig.group.updateMatrixWorld(true);
  const head = V().setFromMatrixPosition(fig.head.matrixWorld);
  const q = new THREE.Quaternion();
  fig.head.getWorldQuaternion(q);
  const s = fig.group.scale.x;
  const front = V(0, 0, 1).applyQuaternion(q);
  const up = V(0, 1, 0).applyQuaternion(q);
  return { at: head.addScaledVector(front, 9.5 * s).addScaledVector(up, -4.2 * s), dir: front };
}

/* ───────────────────────────────────────────────────────────── the gas, the air: ribbons that face the eye (012's fire.js) */

/** Catmull-Rom through `ctrl`, `u` from 0 to ctrl.length − 1. */
function spline(ctrl, u) {
  const last = ctrl.length - 1;
  const i = Math.min(last - 1, Math.max(0, Math.floor(u)));
  const t = u - i;
  const p0 = ctrl[Math.max(0, i - 1)];
  const p1 = ctrl[i];
  const p2 = ctrl[i + 1];
  const p3 = ctrl[Math.min(last, i + 2)];
  return p1.map((_, k) => 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t * t * t));
}
/** `m` points along the curve through `ctrl`, evenly spaced in length, and the length run at each (cm). */
function resample(ctrl, m) {
  const N = 240;
  const dense = [];
  for (let i = 0; i <= N; i++) dense.push(spline(ctrl, (i / N) * (ctrl.length - 1)));
  const len = [0];
  for (let i = 1; i <= N; i++) len.push(len[i - 1] + Math.hypot(...dense[i].map((v, k) => v - dense[i - 1][k])));
  const out = [];
  const cm = [];
  let j = 0;
  for (let i = 0; i < m; i++) {
    const want = (i / (m - 1)) * len[N];
    while (j < N - 1 && len[j + 1] < want) j++;
    const t = clamp01((want - len[j]) / Math.max(len[j + 1] - len[j], 1e-6));
    out.push(dense[j].map((v, k) => v + (dense[j + 1][k] - v) * t));
    cm.push(want);
  }
  return { pts: out, cm };
}
/** Ribbons gathered into one mesh: each a line of points, the shader lays a band along it turned to the eye. */
function ribbons() {
  const P = [];
  const T = [];
  const R = [];
  const W = [];
  const index = [];
  let count = 0;
  const tangent = (pts, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const l = Math.hypot(...d) || 1;
    return [d[0] / l, d[1] / l, d[2] / l];
  };
  return {
    /** `pts`, `cm` from resample · `seed` · `width(s)`: half its width, cm · `gain`: how much of the material's density it has */
    add({ pts, cm }, { seed, width, gain = 1 }) {
      for (let i = 0; i < pts.length; i++) {
        const s = i / (pts.length - 1);
        for (const side of [-1, 1]) {
          P.push(...pts[i]);
          T.push(...tangent(pts, i));
          R.push(s, side, seed, cm[i]);
          W.push(width(s), gain);
        }
        if (i < pts.length - 1) index.push(count, count + 1, count + 2, count + 1, count + 3, count + 2);
        count += 2;
      }
    },
    mesh(material, order) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
      geo.setAttribute("aTan", new THREE.Float32BufferAttribute(T, 3));
      geo.setAttribute("aRib", new THREE.Float32BufferAttribute(R, 4));
      geo.setAttribute("aWide", new THREE.Float32BufferAttribute(W, 2));
      geo.setIndex(index);
      const mesh = new THREE.Mesh(geo, material);
      mesh.frustumCulled = false;
      mesh.renderOrder = order;
      return mesh;
    },
  };
}
/**
 * The matter of a ribbon: one colour laid OVER the picture (never added: added up, signal goes salmon), more or less
 * dense; along it, puffs that travel at `speed` cm/s, `lambda` cm apart — the same speed all the way, whatever its length.
 *   floor   how much of it is left between two puffs        pale   how much it pales toward its end (it mixes)
 *   start / end   where it comes to full density · [from, to] where it thins out      sway   how far it wanders (cm, at its end)
 *   uHead   how far along it has come (0 → 1.3): the fresh air pours in
 */
const ribbonMat = ({ hue, gain, dense, lambda, speed, floor = 0.25, pale = 0.5, start = 0.04, end = [0.72, 1], sway = 6, cap = 0.7 }) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 }, uAmount: { value: 0 }, uHead: { value: 2 },
      uHue: { value: hue.clone().multiplyScalar(gain) }, uDense: { value: dense },
      uWave: { value: new THREE.Vector4(lambda, speed, floor, pale) }, uAlong: { value: new THREE.Vector4(start, end[0], end[1], cap) }, uSway: { value: sway },
    },
    vertexShader: /* glsl */ `
      uniform float uTime, uAmount, uSway;
      attribute vec3 aTan; attribute vec4 aRib; attribute vec2 aWide;
      varying vec4 vR; varying float vCm;
      void main() {
        float s = aRib.x;
        vec3 p = position;
        // it wanders, more and more as it goes — slowly
        float w1 = sin(uTime * 0.43 + aRib.z * 40.0 + s * 5.0);
        float w2 = cos(uTime * 0.31 + aRib.z * 23.0 + s * 3.5);
        p += vec3(w1, 0.4 * w2, w2) * (uSway * s * s);
        vec3 pw = (modelMatrix * vec4(p, 1.0)).xyz;
        vec3 tw = (modelMatrix * vec4(aTan, 0.0)).xyz;
        tw /= max(length(tw), 1e-5);
        vec3 eye = cameraPosition - pw;
        eye /= max(length(eye), 1e-3);
        vec3 across = cross(tw, eye);
        float sine = length(across);
        across /= max(sine, 1e-4);
        vR = vec4(s, aRib.y, aRib.z, aWide.y * smoothstep(0.1, 0.4, sine));
        vCm = aRib.w;
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        if (uAmount > 0.003) gl_Position = projectionMatrix * viewMatrix * vec4(pw + across * (aRib.y * aWide.x), 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue; uniform vec4 uWave, uAlong; uniform float uTime, uDense, uAmount, uHead;
      varying vec4 vR; varying float vCm;
      void main() {
        float s = vR.x;
        float x = vR.y;
        float across = max(exp(-2.4 * x * x) - 0.0907, 0.0) * 1.1;
        across *= 0.82 + 0.18 * sin(x * 4.4 + s * 9.0 + vR.z * 50.0 - uTime * 0.45);
        float puff = 0.5 + 0.5 * sin(6.2832 * (vCm / uWave.x - uTime * uWave.y / uWave.x + vR.z * 7.0));
        puff = puff * puff * (3.0 - 2.0 * puff);
        float along = smoothstep(0.0, uAlong.x, s) * (1.0 - smoothstep(uAlong.y, uAlong.z, s)) * (1.0 - uWave.w * s) * (1.0 - smoothstep(uHead - 0.22, uHead, s));
        float a = across * along * (uWave.z + (1.0 - uWave.z) * puff) * vR.w * uAmount * uDense;
        gl_FragColor = vec4(uHue, clamp(a, 0.0, uAlong.w));
      }`,
  });

/** A bundle of strands along one path: each strand offset from it, more and more as it goes (the gas spreads). */
function bundle(R, rand, ctrl, { strands, spread, width, gain = 1, m = 44, lift = 0.35 }) {
  for (let j = 0; j < strands; j++) {
    const o = [rand() - 0.5, (rand() - 0.5) * 2 * lift, rand() - 0.5];
    const l = Math.hypot(...o) || 1;
    const amp = 0.6 + 0.4 * rand();
    const phase = rand() * TAU;
    const pts = ctrl.map((p, i) => {
      const s = i / (ctrl.length - 1);
      const k = (spread[0] + (spread[1] - spread[0]) * Math.pow(s, 0.9)) * amp;
      const curl = 0.35 * Math.sin(phase + s * 4.0);
      return [p[0] + (o[0] / l) * k + curl * k * 0.3, p[1] + (o[1] / l) * k, p[2] + (o[2] / l) * k - curl * k * 0.3];
    });
    R.add(resample(pts, m), { seed: rand(), width, gain: gain * (0.75 + 0.25 * rand()) });
  }
}

/* ───────────────────────────────────────────────────────────── the gas in the rooms: a marched volume */

/** A block of noise that tiles (three octaves of value noise), to march the haze through (012's). */
function noiseBlock(size, seed) {
  const rand = rng(seed);
  const lattice = (cells) => {
    const g = new Float32Array(cells * cells * cells);
    for (let i = 0; i < g.length; i++) g[i] = rand();
    const at = (x, y, z) => g[((x % cells) * cells + (y % cells)) * cells + (z % cells)];
    const ease = (t) => t * t * (3 - 2 * t);
    const lerp = (a, b, t) => a + (b - a) * t;
    return (u, v, w) => {
      const x = u * cells;
      const y = v * cells;
      const z = w * cells;
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const zi = Math.floor(z);
      const fx = ease(x - xi);
      const fy = ease(y - yi);
      const fz = ease(z - zi);
      return lerp(
        lerp(lerp(at(xi, yi, zi), at(xi, yi, zi + 1), fz), lerp(at(xi, yi + 1, zi), at(xi, yi + 1, zi + 1), fz), fy),
        lerp(lerp(at(xi + 1, yi, zi), at(xi + 1, yi, zi + 1), fz), lerp(at(xi + 1, yi + 1, zi), at(xi + 1, yi + 1, zi + 1), fz), fy),
        fx,
      );
    };
  };
  const o1 = lattice(4);
  const o2 = lattice(8);
  const o3 = lattice(16);
  const data = new Uint8Array(size * size * size);
  let i = 0;
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x + 0.5) / size;
        const v = (y + 0.5) / size;
        const w = (z + 0.5) / size;
        const value = (o1(u, v, w) + 0.5 * o2(u, v, w) + 0.25 * o3(u, v, w)) / 1.75;
        data[i++] = Math.round(255 * clamp01(0.5 + (value - 0.5) * 2.1));
      }
    }
  }
  const tex = new THREE.Data3DTexture(data, size, size, size);
  tex.format = THREE.RedFormat;
  tex.type = THREE.UnsignedByteType;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = tex.wrapR = THREE.RepeatWrapping;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return tex;
}

/**
 * The CO in the air of the three rooms (the corridor, the bedroom, the children's room — their union: an inner wall
 * makes no seam). The eye's ray is marched through the flat's box; the gas is everywhere in the rooms at every height
 * (a thin floor of it), in slow billows that `co` makes denser, never higher. Nothing within a metre of the eye (a
 * close-up never sits behind a veil), a clear bubble in front of the CO detector (its green never turns khaki) and,
 * with `smoke`, round the smoke detector (the gas goes round it). `air` pushes it back from the window. Laid over
 * the picture (one dull signal), capped: the subject always reads through it.
 */
function makeHaze() {
  const X0 = HALL.x0;
  const X1 = HALL.x1;
  const Z0 = HALL.z0;
  const Z1 = ROOM.z1;
  const uniforms = {
    uNoise: { value: noiseBlock(48, 2810) }, uHue: { value: SIGNAL.clone().multiplyScalar(0.62) }, uTime: { value: 0 },
    uMin: { value: new THREE.Vector3(X0, 0, Z0) }, uMax: { value: new THREE.Vector3(X1, CEIL, Z1) },
    uAmount: { value: 0 }, uLo: { value: 0.6 }, uFront: { value: 400 }, uSmoke: { value: 0 },
    uDet: { value: new THREE.Vector3(DETECTOR.at[0], DETECTOR.at[1], DETECTOR.at[2] + 8) },
    uSmk: { value: new THREE.Vector3(SMOKE.at[0], SMOKE.at[1] - 8, SMOKE.at[2]) },
  };
  const geo = new THREE.BoxGeometry(X1 - X0, CEIL, Z1 - Z0);
  geo.translate((X0 + X1) / 2, CEIL / 2, (Z0 + Z1) / 2);
  const f = (v) => Number(v).toFixed(2);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.BackSide, // its far walls cover it whether the eye is inside the flat or out in the garden
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */ `
        varying vec3 vP, vEye;
        void main() {
          vP = position;
          vEye = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        precision highp sampler3D;
        uniform sampler3D uNoise; uniform vec3 uHue, uMin, uMax, uDet, uSmk; uniform float uTime, uAmount, uLo, uFront, uSmoke;
        varying vec3 vP, vEye;
        float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        // inside a room, softly near its outer walls; the inner walls are crossed (each room reaches 8 cm past them)
        float inBox(vec3 p, vec3 lo, vec3 hi) { vec3 d = min(p - lo, hi - p); return smoothstep(0.0, 8.0, min(min(d.x, d.y), d.z)); }
        float rooms(vec3 p) {
          float hall = inBox(p, vec3(${f(HALL.x0)}, -8.0, ${f(HALL.z0)}), vec3(${f(HALL.x1)}, ${f(CEIL + 8)}, ${f(BACK + 8)}));
          float bed = inBox(p, vec3(${f(-ROOM.x - 8)}, -8.0, ${f(BACK - 8)}), vec3(${f(ROOM.x)}, ${f(CEIL + 8)}, ${f(ROOM.z1)}));
          float kids = inBox(p, vec3(${f(KIDS.room.x0)}, -8.0, ${f(KIDS.room.z0 - 8)}), vec3(${f(KIDS.room.x1 + 8)}, ${f(CEIL + 8)}, ${f(KIDS.room.z1)}));
          return max(hall, max(bed, kids));
        }
        void main() {
          if (uAmount < 0.003) discard;
          vec3 rd = vP - vEye;
          rd /= max(length(rd), 1e-4);
          rd += (1.0 - step(1e-5, abs(rd))) * 1e-5; // never a division by zero
          vec3 t0 = (uMin - vEye) / rd;
          vec3 t1 = (uMax - vEye) / rd;
          vec3 ta = min(t0, t1);
          vec3 tb = max(t0, t1);
          float tn = max(max(ta.x, ta.y), max(ta.z, 0.0));
          float tf = min(tb.x, min(tb.y, tb.z));
          if (tf <= tn) discard;
          const int STEPS = 30;
          float ds = (tf - tn) / float(STEPS);
          // each instant of the shutter starts its march elsewhere: sixteen coarse marches make one fine one
          float j = hash(gl_FragCoord.xy + fract(uTime * 13.7) * 61.0);
          vec3 drift = vec3(0.0085, 0.0021, -0.0062) * uTime;
          float through = 1.0;
          float light = 0.0;
          for (int i = 0; i < STEPS; i++) {
            float t = tn + (float(i) + j) * ds;
            vec3 p = vEye + rd * t;
            float m = rooms(p);
            if (m > 0.0) {
              float n1 = textureLod(uNoise, p / 360.0 + drift, 0.0).r;
              float n2 = textureLod(uNoise, p / 130.0 - 1.6 * drift + 0.37, 0.0).r;
              float n = 0.66 * n1 + 0.34 * n2;
              float wisp = smoothstep(uLo, uLo + 0.2, n);
              float rho = wisp * sqrt(wisp) * m;
              rho *= smoothstep(25.0, 115.0, t); // never a veil on a close-up
              rho *= smoothstep(9.0, 30.0, length(p - uDet)); // the detector's face stays clear
              rho *= 1.0 - uSmoke * (1.0 - smoothstep(12.0, 36.0, length(p - uSmk))); // it goes round the smoke detector
              float bedroom = smoothstep(${f(BACK - 30)}, ${f(BACK + 10)}, p.z);
              rho *= 1.0 - bedroom * smoothstep(uFront - 40.0, uFront + 70.0, p.x); // the fresh air pushes it back from the window
              float a = 1.0 - exp(-rho * ds * 0.0016 * uAmount);
              light += through * a * mix(0.72, 1.12, wisp);
              through *= 1.0 - a;
            }
          }
          float alpha = 1.0 - through;
          // the cap, reached softly: the subject always reads through it
          float capped = 0.32 * (1.0 - exp(-alpha / 0.32));
          float k = capped / max(alpha, 1e-4);
          gl_FragColor = vec4(uHue * (light * k), capped);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── lights that have a place */

/**
 * A ball of light with no edge, always facing the eye: a small heart, a soft body, a long tail; `uRing` adds a soft
 * ring that grows from it (0 → 1 its radius, its strength). World-sized (`uSize`, cm). Additive.
 */
function makeGlow({ color, size, order = 30, depthTest = true }) {
  const uniforms = { uColor: { value: new THREE.Color(color) }, uSize: { value: size }, uAmount: { value: 0 }, uRing: { value: new THREE.Vector2(0, 0) }, uCore: { value: 1 } };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uSize, uAmount; varying vec2 vUv;
        void main() {
          vUv = position.xy;
          vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          mv.xy += position.xy * uSize;
          gl_Position = uAmount > 0.002 ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount, uCore; uniform vec2 uRing; varying vec2 vUv;
        void main() {
          float r2 = dot(vUv, vUv);
          float r = sqrt(r2);
          float edge = 1.0 - smoothstep(0.6, 1.0, r);
          float core = exp(-r2 / 0.006) * uCore;
          float body = 0.5 * exp(-r2 / 0.04);
          float tail = 0.24 / (1.0 + r2 / 0.02) * edge;
          float dr = (r - 0.85 * uRing.x) / 0.07;
          float ring = uRing.y * exp(-dr * dr) * edge;
          gl_FragColor = vec4(uColor * ((core * 1.6 + body + tail + ring) * uAmount), 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return { mesh, uniforms };
}

/** The burner's flames: one camera-facing tongue per port, standing up; "the brightest wins" (never added: no salmon). */
function flameMat({ hue, gain, height, width, root = 0.45 }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uAmount: { value: 1 }, uHue: { value: hue.clone() }, uGain: { value: gain }, uSize: { value: new THREE.Vector3(height, width, root) } },
    vertexShader: /* glsl */ `
      uniform float uTime, uAmount; uniform vec3 uSize;
      attribute vec3 aBase; attribute vec2 aSeed;
      varying vec2 vQ; varying float vS;
      void main() {
        // alive but calm: each breathes on its own slow clock
        float breath = 1.0 + 0.08 * sin(uTime * 1.7 + aSeed.x * 6.2832) + 0.05 * sin(uTime * 2.6 + aSeed.y * 6.2832);
        float h = uSize.x * (0.86 + 0.28 * aSeed.y) * breath * (0.35 + 0.65 * uAmount);
        vec4 mvb = modelViewMatrix * vec4(aBase, 1.0);
        vec3 up = (modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
        up /= max(length(up), 1e-5);
        vec3 rt = cross(up, vec3(0.0, 0.0, 1.0));
        rt = length(rt) > 1e-3 ? normalize(rt) : vec3(1.0, 0.0, 0.0);
        float lean = 0.1 * sin(uTime * 1.1 + aSeed.x * 9.0);
        vec3 p = mvb.xyz + up * (position.y * h) + rt * (position.x * uSize.y + lean * position.y * position.y * h);
        vQ = position.xy;
        vS = aSeed.x;
        gl_Position = uAmount > 0.003 ? projectionMatrix * vec4(p, 1.0) : vec4(2.0, 2.0, 2.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue, uSize; uniform float uGain, uTime, uAmount;
      varying vec2 vQ; varying float vS;
      void main() {
        float v = vQ.y;
        float prof = mix(0.45, 1.0, smoothstep(0.0, 0.3, v)) * pow(clamp(1.0 - v * v * v, 0.0, 1.0), 0.6);
        float w = max(prof, 1e-3);
        float across = exp(-3.2 * vQ.x * vQ.x / (w * w));
        float lick = 0.08 * sin(9.0 * v - 2.2 * uTime + vS * 30.0);
        float along = smoothstep(0.0, 0.06, v) * (1.0 - smoothstep(0.5, 1.0, v + lick));
        float hot = 1.0 - smoothstep(0.0, uSize.z, v);
        gl_FragColor = vec4(uHue * (across * along * uGain * mix(0.72, 1.15, hot) * uAmount), 1.0);
      }`,
  });
}

/** Your breaths outside: soft veille puffs leaving each mouth, every 3.4 s, rising and dissolving. */
function makeBreath(mouths) {
  const PER = 3;
  const base = new THREE.PlaneGeometry(2, 2);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute("position", base.getAttribute("position"));
  const at = [];
  const dir = [];
  const seed = [];
  mouths.forEach((m, i) => {
    for (let k = 0; k < PER; k++) {
      at.push(m.at.x, m.at.y, m.at.z);
      dir.push(m.dir.x, m.dir.y, m.dir.z, m.scale);
      seed.push(0.29 * i + 0.055 * k, k);
    }
  });
  geo.setAttribute("aAt", new THREE.InstancedBufferAttribute(new Float32Array(at), 3));
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(new Float32Array(dir), 4));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(seed), 2));
  geo.instanceCount = mouths.length * PER;
  const uniforms = { uTime: { value: 0 }, uAmount: { value: 0 }, uColor: { value: VEILLE.clone() } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uAmount;
        attribute vec3 aAt; attribute vec4 aDir; attribute vec2 aSeed;
        varying vec2 vUv; varying float vA;
        void main() {
          float age = fract(uTime / 3.4 + aSeed.x);
          float s = aDir.w;
          // out in front of the mouth, then up, carried a little sideways (the night air): it never sits on a face turned to the camera
          vec3 side = normalize(cross(vec3(0.0, 1.0, 0.0), aDir.xyz) + vec3(1e-4, 0.0, 0.0));
          vec3 p = aAt + aDir.xyz * (s * (8.0 + 6.0 * age)) + side * (s * (4.0 + 22.0 * age)) + vec3(0.0, s * (6.0 + 34.0 * age + 10.0 * age * age), 0.0);
          float r = s * (3.0 + 13.0 * age);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          mv.xy += position.xy * r;
          vUv = position.xy;
          vA = uAmount * smoothstep(0.1, 0.3, age) * (1.0 - smoothstep(0.45, 1.0, age)) * (1.0 - 0.25 * aSeed.y);
          gl_Position = vA > 0.002 ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying vec2 vUv; varying float vA;
        void main() {
          float r2 = dot(vUv, vUv);
          float a = exp(-r2 * 2.6) * (1.0 - smoothstep(0.7, 1.0, sqrt(r2)));
          gl_FragColor = vec4(uColor * (a * vA * 0.6), 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 31;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the flat */

export function buildFoyer() {
  const group = new THREE.Group();
  group.name = "foyer";
  const rand = rng(2802);
  const shellGlass = []; // every glass the flat's X-ray drives…
  const shellLines = []; // …and every family of lines
  const grids = [];

  /* ═════════════ 1 · THE CORRIDOR, THE CHILDREN'S ROOM: floors (grids), walls (sheets of glass and their outline) ═════════════ */

  const hallFloor = gridMaterial({ reach: 420, centre: [0, -220] });
  const kidsFloor = gridMaterial({ reach: 260, centre: [-320, 0] });
  grids.push(hallFloor, kidsFloor);
  group.add(floorPlane(hallFloor, HALL.x0, HALL.x1, HALL.z0, BACK), floorPlane(kidsFloor, KIDS.room.x0, KIDS.room.x1, KIDS.room.z0, KIDS.room.z1));

  const walls = makeSet();
  const wallGlass = glass(BRAND.ink, { base: 0, rim: 0.075, power: 3.6 });
  const wall = (a, b, y0 = 0, y1 = CEIL) => walls.sheet(wallGlass, [a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]);
  const { x0: HX0, x1: HX1, z0: HZ0 } = HALL;
  const { x0: KX0, x1: KX1, z1: KZ1 } = KIDS.room;
  wall([HX0, HZ0], [HX1, HZ0]); // the corridor's far wall, where the boiler hangs
  wall([HX0, HZ0], [HX0, KZ1]); // the far end: the corridor's and the children's room's
  wall([HX1, HZ0], [HX1, BACK]); // the near end
  wall([ROOM.x, BACK], [HX1, BACK]); // the corridor's wall on the garden side
  wall([KX0, KZ1], [KX1, KZ1]); // the children's room's front wall
  const KD = KIDS.door;
  wall([KX0, BACK], [KD.x0, BACK]);
  wall([KD.x1, BACK], [KX1, BACK]);
  wall([KD.x0, BACK], [KD.x1, BACK], KD.h, CEIL); // its lintel
  // where the walls meet the floor, their corners, the ceiling's edge, a skirting
  walls.run(walls.L.fine, [[HX0, 0, KZ1], [HX0, 0, HZ0], [HX1, 0, HZ0], [HX1, 0, BACK], [ROOM.x, 0, BACK]]);
  walls.run(walls.L.fine, [[HX0, 0, KZ1], [KX1, 0, KZ1]]);
  walls.run(walls.L.fine, [[KX0, 0, BACK], [KD.x0, 0, BACK]]);
  walls.run(walls.L.fine, [[KD.x1, 0, BACK], [-ROOM.x, 0, BACK]]);
  for (const [x, z] of [[HX0, HZ0], [HX1, HZ0], [HX1, BACK], [HX0, KZ1], [KX1, KZ1]]) walls.seg(walls.L.fine, [x, 0, z], [x, CEIL, z]);
  walls.seg(walls.L.faint, [HX0, 0, BACK], [HX0, CEIL, BACK]);
  walls.run(walls.L.faint, [[HX0, CEIL, KZ1], [HX0, CEIL, HZ0], [HX1, CEIL, HZ0], [HX1, CEIL, BACK], [HX0, CEIL, BACK]]);
  walls.run(walls.L.faint, [[HX0, CEIL, KZ1], [KX1, CEIL, KZ1]]);
  walls.run(walls.L.faint, [[HX0, 9, HZ0], [HX1, 9, HZ0]]); // a skirting
  walls.run(walls.L.faint, [[HX0, 9, KZ1], [HX0, 9, HZ0]]);
  // the doors' frames: the bedroom's (in 022's back wall) and the children's
  for (const d of [DOOR, KD]) {
    walls.run(walls.L.strong, [[d.x0, 0, BACK], [d.x0, d.h, BACK], [d.x1, d.h, BACK], [d.x1, 0, BACK]]);
    walls.run(walls.L.faint, [[d.x0 + 5, 0, BACK - 0.5], [d.x0 + 5, d.h - 5, BACK - 0.5], [d.x1 - 5, d.h - 5, BACK - 0.5], [d.x1 - 5, 0, BACK - 0.5]]);
  }
  walls.build(group, null, shellGlass, shellLines);

  // the leaves, wide open: the bedroom's into the corridor (hinged at its +x jamb), the children's into their room
  const leafGlass = glass(BRAND.ink, { base: 0, rim: 0.16, power: 2.6, edge: 0.14 });
  const leaf = (d, hingeX, angle) => {
    const g = new THREE.Group();
    g.position.set(hingeX, 0, BACK);
    g.rotation.y = angle;
    const w = d.x1 - d.x0 - 1;
    const s = makeSet();
    s.slab(leafGlass, -w, 0, 0.5, d.h - 1.5, -2, 2, { r: 0.6 });
    s.run(s.L.fine, [[-w, 0.5, 2], [-w, d.h - 1.5, 2], [0, d.h - 1.5, 2], [0, 0.5, 2]], true);
    s.run(s.L.faint, [[-w + 9, 14, 2.2], [-w + 9, d.h - 14, 2.2], [-9, d.h - 14, 2.2], [-9, 14, 2.2]], true);
    s.run(s.L.fine, [[-w + 6, 100, 3.5], [-w + 15, 100, 3.5]]); // its handle
    s.build(g, null, shellGlass, shellLines);
    group.add(g);
    return g;
  };
  leaf(DOOR, DOOR.x1, -96 * DEG);
  leaf(KD, KD.x1, 96 * DEG);

  /* ═════════════ 2 · THE BOILER: a white casing of glass, its window, its controls, its pipes and gas tap, its flue ═════════════ */

  const boiler = makeSet();
  const caseGlass = glass(BRAND.ink, { base: 0.003, rim: 0.3, power: 2.3, edge: 0.32, spec: 0.35, through: 0.25 });
  boiler.slab(caseGlass, CASE.x0, CASE.x1, CASE.y0, CASE.y1, CASE.z0, CASE.z1, { r: 2.6, lines: "strong" });
  const FZ = CASE.z1 + 0.3; // its front face
  const [, BUY] = BURN.at;
  boiler.run(boiler.L.fine, rrect(BX - 7, BX + 7, BUY - 4.5, BUY + 6.5, 1.8, 0).map(([x, , y]) => [x, y, FZ]), true); // the little window on the flame
  boiler.run(boiler.L.faint, [[CASE.x0 + 2, CASE.y0 + 10, FZ], [CASE.x1 - 2, CASE.y0 + 10, FZ]]); // the control strip
  boiler.circle(boiler.L.fine, [BX - 12, CASE.y0 + 5, FZ], 2.0, "z", 20);
  boiler.circle(boiler.L.fine, [BX - 5.5, CASE.y0 + 5, FZ], 2.0, "z", 20);
  boiler.run(boiler.L.fine, [[BX + 4, CASE.y0 + 3, FZ], [BX + 15, CASE.y0 + 3, FZ], [BX + 15, CASE.y0 + 7.5, FZ], [BX + 4, CASE.y0 + 7.5, FZ]], true); // its display
  boiler.run(boiler.L.faint, [[CASE.x0 + 2, CASE.y1 - 6, FZ], [CASE.x1 - 2, CASE.y1 - 6, FZ]]);
  // the pipes under it, into the wall; the gas tap on the gas pipe
  const pipeGlass = glass(BRAND.ink, { base: 0.003, rim: 0.42, power: 2.2, edge: 0.3 });
  const PZ = CASE.z0 + 9;
  for (const [dx, r] of [[-15, 1.3], [-6, 1.1], [3, 1.1], [13, 1.5]]) {
    const x = BX + dx;
    boiler.piece(pipeGlass, cyl(r, 46, 0.05, 20), { pos: [x, CASE.y0 - 23, PZ] });
    boiler.piece(pipeGlass, cyl(r, PZ - HALL.z0, 0.05, 20), { pos: [x, CASE.y0 - 46, (PZ + HALL.z0) / 2], rotX: Math.PI / 2 });
    boiler.circle(boiler.L.faint, [x, CASE.y0 - 46, HALL.z0 + 0.4], r + 1.2, "z", 16);
  }
  const GX = BX + 13; // the gas pipe; its tap halfway down
  boiler.circle(boiler.L.fine, [GX, CASE.y0 - 20, PZ], 2.6, "y", 18);
  boiler.run(boiler.L.strong, [[GX, CASE.y0 - 20, PZ + 2.6], [GX, CASE.y0 - 20, PZ + 10], [GX + 6, CASE.y0 - 20, PZ + 10]]);
  // the flue, straight up through the ceiling
  const FL = BOILER.flue;
  const flueGlass = glass(BRAND.ink, { base: 0.003, rim: 0.4, power: 2.2, edge: 0.3, spec: 0.3 });
  boiler.piece(flueGlass, cyl(FL.r, FL.top - CASE.y1, 0.2, 40), { pos: [BX, (CASE.y1 + FL.top) / 2, BZ] });
  boiler.circle(boiler.L.fine, [BX, CASE.y1 + 0.5, BZ], FL.r + 1.2, "y", 28);
  boiler.circle(boiler.L.fine, [BX, CEIL, BZ], FL.r + 2.6, "y", 28); // its collar in the ceiling
  boiler.circle(boiler.L.faint, [BX, FL.top, BZ], FL.r, "y", 28);
  boiler.build(group, null, shellGlass, shellLines);

  // solid inside it: the burner — a bar, its ports on top (the flame stands on them)
  const burner = makePart("burner");
  burner.position.set(...BURN.at);
  group.add(burner);
  addMesh(burner, box(BURN.w, BURN.h, BURN.d, 0.5), solid(0x6c7378, { rough: 0.5, metal: 0.35 }), { pos: [0, -BURN.h / 2, 0], edgeOpacity: 0.55 });
  addMesh(burner, box(BURN.w - 2, 0.7, 2.4, 0.2), solid(0xb3b8bb, { rough: 0.45, metal: 0.3 }), { pos: [0, 0.2, 0], edges: false });
  addMesh(burner, cyl(1.1, 7, 0.1, 20), solid(0x4b5257, { rough: 0.6 }), { pos: [BURN.w / 2 - 3, -BURN.h - 3.5, 0], edges: false }); // its feed

  // the flames: nine tongues, a body and a white heart
  const PORTS = 9;
  const tongue = new THREE.PlaneGeometry(2, 1).translate(0, 0.5, 0);
  const fgeo = new THREE.InstancedBufferGeometry();
  fgeo.index = tongue.index;
  fgeo.setAttribute("position", tongue.getAttribute("position"));
  const fBase = [];
  const fSeed = [];
  for (let i = 0; i < PORTS; i++) {
    fBase.push(BURN.at[0] - (BURN.w - 4) / 2 + ((BURN.w - 4) * i) / (PORTS - 1), BURN.at[1] + 0.5, BURN.at[2] + 0.4);
    fSeed.push(rand(), rand());
  }
  fgeo.setAttribute("aBase", new THREE.InstancedBufferAttribute(new Float32Array(fBase), 3));
  fgeo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array(fSeed), 2));
  fgeo.instanceCount = PORTS;
  const flameSkins = [flameMat({ hue: SIGNAL, gain: 1.15, height: 6.4, width: 1.45 }), flameMat({ hue: INK, gain: 1.1, height: 2.6, width: 0.6, root: 0.6 })];
  const flames = new THREE.Group();
  flameSkins.forEach((m, i) => {
    const mesh = new THREE.Mesh(fgeo, m);
    mesh.frustumCulled = false;
    mesh.renderOrder = 4 + i;
    flames.add(mesh);
  });
  group.add(flames);
  const glowBoiler = makeGlow({ color: BRAND.signal, size: 34 });
  glowBoiler.mesh.position.set(BURN.at[0], BURN.at[1] + 3, CASE.z1 + 1);
  group.add(glowBoiler.mesh);
  const flameLight = new THREE.PointLight(BRAND.signal, 0, 70, 2);
  flameLight.position.set(BURN.at[0], BURN.at[1] + 4, BURN.at[2] + 3);
  group.add(flameLight);

  /* ═════════════ 3 · THE GAS: the leak (ribbons), the haze (a volume) ═════════════ */

  const leakR = ribbons();
  const [LX, LY, LZ] = LEAK.from;
  // to you: under the casing, along the corridor, through the door (its middle, at head height), down to above your head
  bundle(leakR, rand, [[LX, LY - 1, LZ], [LX - 1, LY - 8, LZ + 18], [LX - 3, LY + 2, -215], [LX - 6, 142, -160], [LEAK.door[0], LEAK.door[1], LEAK.door[2]], [104, 142, -116], [62, 124, -108], [28, 104, -96], [YOU.head[0] - 4, YOU.head[1] + 16, YOU.head[2] - 4]], {
    strands: 16, spread: [3, 44], width: (s) => 1.6 + 10 * Math.pow(s, 0.8),
  });
  // to the children: along the corridor, through their door, down between their beds
  const KDM = (KD.x0 + KD.x1) / 2;
  bundle(leakR, rand, [[LX, LY - 1, LZ], [LX - 12, LY - 9, -291], [40, 110, -290], [-110, 118, -278], [-250, 124, -215], [KDM, 122, BACK], [KDM - 18, 100, -82], [KDM - 24, 72, -46]], {
    strands: 9, spread: [3, 40], width: (s) => 1.6 + 9 * Math.pow(s, 0.8), gain: 0.8, m: 56,
  });
  const leakMat = ribbonMat({ hue: SIGNAL, gain: 0.85, dense: 0.5, lambda: 80, speed: 40, floor: 0.18, pale: 0.25, start: 0.03, end: [0.86, 1], sway: 7, cap: 0.55 });
  const leak = leakR.mesh(leakMat, 8);
  group.add(leak);

  const haze = makeHaze();
  group.add(haze.mesh);

  /* ═════════════ 4 · THE ACHE: a slow throb at your upper temple ═════════════ */

  const ACHE_AT = [YOU.head[0] - 2.5, YOU.head[1] + 8.2, YOU.head[2] - 3.5];
  const ache = makeGlow({ color: BRAND.signal, size: 16, order: 30, depthTest: false });
  ache.mesh.position.set(...ACHE_AT);
  group.add(ache.mesh);

  /* ═════════════ 5 · THE WINDOW's sash, THE FRESH AIR ═════════════ */

  const sash = new THREE.Group(); // the hinge: the window's +z edge, inside the frame
  sash.position.set(WINDOW.x - 1.5, SASH.y, WINDOW.z1);
  const sashSet = makeSet();
  const paneGlass = glass(BRAND.ink, { base: 0, rim: 0.2, power: 2.4, edge: 0.22, spec: 0.3 });
  sashSet.slab(paneGlass, -2.2, 0, -SASH.h / 2 + 1, SASH.h / 2 - 1, -SASH.w + 1, -0.5, { r: 0.5 });
  sashSet.run(sashSet.L.strong, [[-1, -SASH.h / 2 + 1, -0.5], [-1, SASH.h / 2 - 1, -0.5], [-1, SASH.h / 2 - 1, -SASH.w + 1], [-1, -SASH.h / 2 + 1, -SASH.w + 1]], true);
  sashSet.run(sashSet.L.faint, [[-1.2, -SASH.h / 2 + 7, -6], [-1.2, SASH.h / 2 - 7, -6], [-1.2, SASH.h / 2 - 7, -SASH.w + 7], [-1.2, -SASH.h / 2 + 7, -SASH.w + 7]], true);
  sashSet.build(sash, null, shellGlass, shellLines);
  const handle = makePart("handle");
  handle.position.set(...HANDLE);
  sash.add(handle);
  addMesh(handle, box(1.6, 2.4, 2.4, 0.4), solid(0x8d9397, { rough: 0.5 }), { pos: [0.6, 0, 0], edgeOpacity: 0.5 });
  addMesh(handle, box(1.4, 12, 1.6, 0.5), solid(0xb4b9bc, { rough: 0.45 }), { pos: [-1.6, -5, 0], edgeOpacity: 0.5 });
  group.add(sash);

  const airR = ribbons();
  for (let j = 0; j < 10; j++) {
    const y = WINDOW.y0 + 10 + rand() * (SASH.h - 20);
    const z = WINDOW.z0 + 12 + rand() * (SASH.w - 24);
    const fall = 20 + 40 * rand();
    const off = (rand() - 0.5) * 70;
    const ctrl = [[WINDOW.x + 40, y + 8, z * 0.8], [WINDOW.x + 8, y, z], [WINDOW.x - 50, y - fall * 0.4, z + off * 0.4], [WINDOW.x - 125, y - fall * 0.8, z + off * 0.8], [WINDOW.x - 200, y - fall, z + off]];
    airR.add(resample(ctrl, 40), { seed: rand(), width: (s) => 2 + 9 * Math.pow(s, 0.8), gain: 0.75 + 0.25 * rand() });
  }
  const airMat = ribbonMat({ hue: VEILLE, gain: 0.8, dense: 0.26, lambda: 70, speed: 60, floor: 0.32, pale: 0.6, start: 0.12, end: [0.6, 1], sway: 10, cap: 0.3 });
  const air = airR.mesh(airMat, 8);
  group.add(air);

  /* ═════════════ 6 · THE CHILDREN'S ROOM: two small beds, two children asleep ═════════════ */

  const kidsRoom = makeSet();
  const flank = glass(BRAND.ink, { base: 0, rim: 0.2, power: 2.4 });
  const quilt = glass(BRAND.ink, { base: 0.01, rim: 0.46, power: 1.9, edge: 0.3 });
  const kidPillow = glass(BRAND.ink, { base: 0.006, rim: 0.3, power: 2.2, edge: 0.2 });
  const { w: KW, d: KDd, top: KT } = KIDS.bed;
  const kidsAsleep = [];
  for (const [bx, , bz] of KIDS.beds) {
    const x0 = bx - KW / 2;
    const x1 = bx + KW / 2;
    const z0 = bz - KDd;
    const z1 = bz;
    kidsRoom.run(kidsRoom.L.strong, rrect(x0, x1, z0, z1, 5, KT), true);
    kidsRoom.run(kidsRoom.L.fine, rrect(x0, x1, z0, z1, 5, KT - 15), true);
    kidsRoom.run(kidsRoom.L.faint, rrect(x0 + 2, x1 - 2, z0 + 2, z1 - 2, 3, 9), true);
    for (const x of [x0 + 6, x1 - 6]) for (const z of [z0 + 6, z1 - 6]) kidsRoom.run(kidsRoom.L.faint, [[x - 2, 9, z], [x - 1.6, 0, z], [x + 1.6, 0, z], [x + 2, 9, z]]);
    kidsRoom.sheet(flank, [x0, 9, z0 + 5], [x0, 9, z1 - 5], [x0, KT, z1 - 5], [x0, KT, z0 + 5]);
    kidsRoom.sheet(flank, [x1, 9, z0 + 5], [x1, 9, z1 - 5], [x1, KT, z1 - 5], [x1, KT, z0 + 5]);
    kidsRoom.sheet(flank, [x0 + 5, 9, z1], [x1 - 5, 9, z1], [x1 - 5, KT, z1], [x0 + 5, KT, z1]);
    kidsRoom.slab(flank, x0 - 3, x1 + 3, 9, 66, z0 - 3, z0 - 0.5, { r: 1.5, lines: "fine" }); // its headboard
    kidsRoom.slab(kidPillow, bx - 18, bx + 18, KT, KT + 5, z0 + 4, z0 + 26, { r: 2.4 });
    // the quilt: a gentle mound over the child, its hem, its quilting
    const qz0 = z0 + 30;
    const qz1 = z1 - 3;
    const NX = 18;
    const NZ = 22;
    const qpos = [];
    const qidx = [];
    for (let j = 0; j <= NZ; j++) {
      for (let i = 0; i <= NX; i++) {
        const u = -1 + (2 * i) / NX;
        const v = j / NZ;
        const x = bx + u * (KW / 2 - 1);
        const z = qz0 + v * (qz1 - qz0);
        const ridge = (11.5 - 5 * v) * Math.exp(-(u * u) / 0.26) + 1.5;
        const hang = -8 * smooth(0.82, 1, Math.abs(u));
        qpos.push(x, KT + ridge + hang, z);
      }
    }
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
      const a = j * (NX + 1) + i;
      qidx.push(a, a + NX + 1, a + 1, a + 1, a + NX + 1, a + NX + 2);
    }
    const qg = new THREE.BufferGeometry();
    qg.setAttribute("position", new THREE.Float32BufferAttribute(qpos, 3));
    qg.setIndex(qidx);
    qg.computeVertexNormals();
    kidsRoom.piece(quilt, qg, {});
    const rowAt = (v) => Array.from({ length: NX + 1 }, (_, i) => [qpos[(Math.round(v * NZ) * (NX + 1) + i) * 3], qpos[(Math.round(v * NZ) * (NX + 1) + i) * 3 + 1] + 0.3, qpos[(Math.round(v * NZ) * (NX + 1) + i) * 3 + 2]]);
    kidsRoom.run(kidsRoom.L.fine, rowAt(0));
    for (const v of [0.33, 0.66]) kidsRoom.run(kidsRoom.L.faint, rowAt(v));

    // the child, on its back, its head on the pillow toward −z
    const kid = glassFigure({ order: ORDER.kids, k: 1.1, through: 0.18, hands: "flat" });
    kid.group.scale.setScalar(0.62);
    kid.group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(1, 0, 0), V(0, 0, -1), V(0, 1, 0)));
    kid.group.position.set(bx, KT + 6.6, z1 - 10);
    kid.reach("L", V(19, 96, 4), V(0.6, -1, -0.2));
    kid.reach("R", V(-19, 96, 4), V(-0.6, -1, -0.2));
    kid.head.rotation.set(-6 * DEG, (bx < -300 ? 14 : -14) * DEG, 0);
    group.add(kid.group);
    kidsAsleep.push({ fig: kid, trunk: kid.torso.children[0], seed: rand() * TAU });
  }
  kidsRoom.build(group, null, shellGlass, shellLines);

  /* ═════════════ 7 · YOU, AWAKE: on the bed's edge · at the window · outside ═════════════ */

  // 0 · sitting on the bed's edge (the bedside table's side), facing −x; your head turned over your right shoulder to the wall where the detector sounds
  const meBed = glassFigure({ order: ORDER.me });
  meBed.group.rotation.y = -90 * DEG;
  meBed.group.position.set(-BED.x + 13, BED.top + 3 - 90 + 2, -42);
  meBed.leg("L", V(9, 36, 46), V(0, 0, 1));
  meBed.leg("R", V(-9, 36, 41), V(0, 0, 1), V(-0.15, 0, 1));
  meBed.reach("L", V(15, 99, 28), V(0.5, -1, -0.2), { dir: V(0, -0.3, 1), palm: V(0, -1, 0) }); // on your knee
  meBed.reach("R", V(-25, 86, -8), V(-0.4, -1, -0.4), { dir: V(-0.3, -1, 0.2), palm: V(0, -1, 0) }); // pushing on the mattress
  meBed.lean(4, -4, -34);
  meBed.head.rotation.set(-16 * DEG, -52 * DEG, 0);
  meBed.grip("L", 0.25);
  meBed.grip("R", 0.15);
  group.add(meBed.group);

  // 1 · standing at the window, beside it, your right hand on its handle
  const meWin = glassFigure({ order: ORDER.me });
  const WIN_AT = [146, 0, -88];
  meWin.group.rotation.y = 46 * DEG;
  meWin.group.position.set(...WIN_AT);
  meWin.leg("L", V(9, 8, 4));
  meWin.leg("R", V(-9, 8, -5), V(0, 0, 1), V(-0.2, 0, 1));
  meWin.reach("L", V(21, 93, 6));
  meWin.lean(6, 0, 0);
  meWin.group.updateMatrix();
  const winInv = meWin.group.matrix.clone().invert();
  group.add(meWin.group);
  const handleAt = (k, out) => {
    // the handle, in the flat's frame, the sash open by k (0 → 1)
    const th = OPEN * k;
    const c = Math.cos(th);
    const s = Math.sin(th);
    return out.set(sash.position.x + HANDLE[0] * c + HANDLE[2] * s, SASH.y, sash.position.z - HANDLE[0] * s + HANDLE[2] * c);
  };
  const RELEASE = 0.5; // the hand follows the handle this far, then lets the sash swing on
  const tmpA = V();
  const tmpB = V();
  const UPV = V(0, 1, 0);
  const grip = { k: 1, bar: 0.8 };
  const winHand = (k) => {
    const held = Math.min(k, RELEASE);
    handleAt(held, tmpA).applyMatrix4(winInv);
    const away = smooth(RELEASE, 0.95, k);
    tmpB.set(-22, 96, 8);
    tmpA.lerp(tmpB, away);
    grip.k = 1 - away * 2;
    if (away < 0.5) meWin.hold("R", tmpA, UPV, grip);
    else {
      meWin.grip("R", 0.2);
      meWin.reach("R", tmpA);
    }
  };
  winHand(0);

  // 2 · outside, facing the garden camera; the children either side
  const OUT_FACE = 62 * DEG;
  const meOut = glassFigure({ order: ORDER.me });
  meOut.group.rotation.y = OUT_FACE;
  meOut.group.position.set(...OUTSIDE.me);
  meOut.leg("L", V(10, 8, 2), V(0, 0, 1), V(0.15, 0, 1));
  meOut.leg("R", V(-10, 8, -2), V(0, 0, 1), V(-0.15, 0, 1));
  meOut.reach("L", V(23, 94, 5));
  meOut.reach("R", V(-23, 94, 5));
  meOut.lean(-3, 0, 0);
  meOut.head.rotation.set(-4 * DEG, 0, 0);
  group.add(meOut.group);
  const kidsStanding = OUTSIDE.kids.map(([x, y, z], i) => {
    const kid = glassFigure({ order: ORDER.kids, k: 1.1, through: 0.18, hands: "flat" });
    kid.group.scale.setScalar(0.62);
    kid.group.rotation.y = OUT_FACE + (i ? -10 : 12) * DEG;
    kid.group.position.set(x, y, z);
    kid.leg("L", V(9, 8, 1));
    kid.leg("R", V(-9, 8, -1));
    kid.reach("L", V(22, 95, 6));
    kid.reach("R", V(-22, 95, 6));
    kid.head.rotation.set(-10 * DEG, (i ? 8 : -8) * DEG, 0);
    group.add(kid.group);
    return kid;
  });
  const breath = makeBreath([meOut, ...kidsStanding].map((f) => ({ ...mouthOf(f), scale: f.group.scale.x })));
  group.add(breath.mesh);

  /* ═════════════ 8 · OUTSIDE: the garden's grid, a low fence ═════════════ */

  const { x0: OX0, x1: OX1, z0: OZ0, z1: OZ1 } = OUTSIDE;
  const outFloor = gridMaterial({ reach: 330, centre: [OUTSIDE.me[0], OUTSIDE.me[2]], hole: [OX0 - 1, OZ0 - 1, HX1, BACK] });
  grids.push(outFloor);
  const outPlane = floorPlane(outFloor, OX0, OX1, OZ0, OZ1);
  outPlane.renderOrder = 9; // after the haze (it is outside)
  group.add(outPlane);
  const garden = makeSet();
  const FX = OX1 - 30;
  for (let z = OZ0 + 10; z <= OZ1 - 10; z += 36) garden.seg(garden.L.faint, [FX, 0, z], [FX, 92, z]);
  for (let x = HX1 + 10; x <= FX; x += 36) garden.seg(garden.L.faint, [x, 0, OZ0 + 10], [x, 92, OZ0 + 10]);
  for (const y of [38, 80]) {
    garden.run(garden.L.faint, [[HX1, y, OZ0 + 10], [FX, y, OZ0 + 10], [FX, y, OZ1 - 10]]);
  }
  garden.run(garden.L.faint, [[ROOM.x, 0.4, -24], [OUTSIDE.me[0] - 40, 0.4, 10], [FX - 40, 0.4, 60]]); // a path from the window
  garden.build(group, null, shellGlass, shellLines);

  /* ═════════════ 9 · THE SMOKE DETECTOR on the bedroom's ceiling: white, solid, its little light off ═════════════ */

  const smokeDet = makePart("smoke");
  smokeDet.position.set(SMOKE.at[0], SMOKE.at[1], SMOKE.at[2]);
  group.add(smokeDet);
  const SR = SMOKE.r;
  const smokeWhite = solid(0xd8d4ca, { rough: 0.55, coat: 0.2 });
  smokeWhite.emissive = new THREE.Color(BRAND.ink).multiplyScalar(0.16); // white plastic in a dark room, seen from below: it still reads white
  const SH = SMOKE.h;
  addMesh(smokeDet, lathe([[0.001, 0], [SR, 0], [SR, -0.9], [SR - 0.4, -1.6], [SR - 1.2, -SH + 0.5], [SR - 2.2, -SH], [0.001, -SH]], 64, { bevel: 0.15 }), smokeWhite, { edgeOpacity: 0.35 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    addMesh(smokeDet, box(1.6, 0.5, 0.35, 0.1), solid(0x9da2a4, { rough: 0.6 }), { pos: [(SR - 0.5) * Math.cos(a), -1.35, (SR - 0.5) * Math.sin(a)], rot: [0, -a, 0], edges: false });
  }
  addMesh(smokeDet, cyl(0.45, 0.4, 0.05, 16), solid(0x3b4044, { rough: 0.5 }), { pos: [1.9, -SH - 0.1, 0.9], edges: false }); // its little light, off
  const ringPts = Array.from({ length: 65 }, (_, i) => [SMOKE.at[0] + (SR + 0.6) * Math.cos((i / 64) * TAU), SMOKE.at[1] - 1.0, SMOKE.at[2] + (SR + 0.6) * Math.sin((i / 64) * TAU)]);
  const smokeRing = fatLine(ringPts, { color: BRAND.ink, width: 2.6, opacity: 0, hdr: 1.3 });
  smokeRing.renderOrder = 32;
  group.add(smokeRing);

  /* ═════════════ the anchors ═════════════ */

  const A = {
    boiler: anchor(group, BX, (CASE.y0 + CASE.y1) / 2, CASE.z1),
    burner: anchor(group, ...BURN.at),
    flue: anchor(group, BX, FL.top, BZ),
    leak: anchor(group, ...LEAK.from),
    door: anchor(group, (DOOR.x0 + DOOR.x1) / 2, DOOR.h / 2, DOOR.z),
    window: anchor(group, WINDOW.x, SASH.y, (WINDOW.z0 + WINDOW.z1) / 2),
    kids: anchor(group, (KIDS.beds[0][0] + KIDS.beds[1][0]) / 2, KT + 20, KIDS.beds[0][2] - KDd + 20),
    out: anchor(group, OUTSIDE.me[0], 190, OUTSIDE.me[2]),
    smoke: anchor(group, SMOKE.at[0], SMOKE.at[1] - SMOKE.h, SMOKE.at[2]),
    head: anchor(group, YOU.head[0], YOU.head[1] + 14, YOU.head[2]),
  };

  const lineBase = shellLines.map((m) => m.opacity);
  const amountOf = (fig, a) => {
    fig.group.visible = a > 0.01;
    if (!fig.group.visible) return;
    fig.body.uniforms.uAmount.value = a;
    fig.headGlass.uniforms.uAmount.value = a;
  };

  return {
    group, A,
    update(P, time = 0, px = 1) {
      const fade = clamp01(P.fade ?? 1);
      group.visible = fade > 0.004;
      if (!group.visible) return;
      void px;

      // the X-ray of the flat: glass, lines, grids
      const sh = clamp01(P.shell ?? 1) * fade;
      for (let i = 0; i < shellGlass.length; i++) shellGlass[i].uniforms.uAmount.value = sh;
      for (let i = 0; i < shellLines.length; i++) shellLines[i].opacity = lineBase[i] * sh;
      for (let i = 0; i < grids.length; i++) grids[i].uniforms.uAmount.value = 0.2 * sh;
      setPartOpacity(handle, sh);

      // the flame and its light
      const fl = clamp01(P.flame ?? 1) * fade;
      flames.visible = fl > 0.003;
      for (let i = 0; i < flameSkins.length; i++) {
        flameSkins[i].uniforms.uTime.value = time;
        flameSkins[i].uniforms.uAmount.value = fl;
      }
      const glowBreath = 0.94 + 0.06 * Math.sin(time * 1.3);
      glowBoiler.uniforms.uAmount.value = 0.62 * fl * glowBreath;
      glowBoiler.mesh.visible = fl > 0.003;
      flameLight.intensity = 22 * fl * glowBreath;
      setPartOpacity(burner, fade);

      // the leak
      const lk = clamp01(P.leak ?? 0) * fade;
      leak.visible = lk > 0.003;
      leakMat.uniforms.uTime.value = time;
      leakMat.uniforms.uAmount.value = lk;

      // the haze: denser, never higher; pushed back by the air; it goes round the smoke detector when it is shown
      const co = clamp01(P.co ?? 0);
      const ai = clamp01(P.air ?? 0);
      const hz = smooth(0, 0.5, co) * fade;
      haze.mesh.visible = hz > 0.003;
      haze.uniforms.uAmount.value = hz;
      haze.uniforms.uLo.value = 0.62 - 0.13 * clamp01((co - 0.5) * 2);
      haze.uniforms.uTime.value = time;
      haze.uniforms.uFront.value = 270 - 380 * smooth(0, 1, ai);
      haze.uniforms.uSmoke.value = clamp01(P.smoke ?? 0);

      // the ache: one throb every 1.6 s, a soft ring leaving it
      const ac = clamp01(P.ache ?? 0) * fade;
      ache.mesh.visible = ac > 0.003;
      const ph = (time / 1.6) % 1;
      const throb = Math.pow(0.5 + 0.5 * Math.cos(ph * TAU), 3);
      ache.uniforms.uAmount.value = ac * (0.45 + 0.55 * throb);
      ache.uniforms.uRing.value.set(ph, 0.55 * (1 - ph) * (1 - ph));

      // the window and the air
      const wk = clamp01(P.window ?? 0);
      sash.rotation.y = OPEN * smooth(0, 1, wk);
      airMat.uniforms.uTime.value = time;
      airMat.uniforms.uAmount.value = ai * fade;
      airMat.uniforms.uHead.value = 0.05 + 1.3 * ai;
      air.visible = ai * fade > 0.003;

      // the children: asleep in their beds, or outside
      const kd = clamp01(P.kids ?? 1) * fade;
      const out = (P.kidsOut ?? 0) >= 0.5;
      for (let i = 0; i < kidsAsleep.length; i++) {
        const k = kidsAsleep[i];
        amountOf(k.fig, out ? 0 : kd);
        if (!out && kd > 0.01) k.trunk.scale.z = 0.62 * (1 + 0.04 * Math.sin(time * 1.25 + k.seed));
      }
      for (let i = 0; i < kidsStanding.length; i++) amountOf(kidsStanding[i], out ? kd : 0);

      // you, awake
      const me = clamp01(P.me ?? 0) * fade;
      const pose = Math.min(2, Math.max(0, Math.round(P.mePose ?? 0)));
      amountOf(meBed, pose === 0 ? me : 0);
      amountOf(meWin, pose === 1 ? me : 0);
      amountOf(meOut, pose === 2 ? me : 0);
      if (pose === 1 && me > 0.01) winHand(smooth(0, 1, wk));

      // your breaths, outside
      const br = clamp01(P.breath ?? 0) * fade;
      breath.mesh.visible = br > 0.003;
      breath.uniforms.uTime.value = time;
      breath.uniforms.uAmount.value = br;

      // the smoke detector: always there, its outline lit when it is shown
      setPartOpacity(smokeDet, fade);
      const sm = clamp01(P.smoke ?? 0);
      smokeRing.material.opacity = 0.9 * sm * fade;
      smokeRing.visible = sm * fade > 0.003;
    },
  };
}
