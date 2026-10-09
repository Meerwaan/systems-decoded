// DOSSIER 017 — the room: an MRI suite seen like an X-ray. Walls, a ceiling and a door of glass and fine lines;
// no solid floor, a grid; on it, in signal, the line painted round the magnet. In the doorway, you — a body of
// glass — an oxygen cylinder in your arms; by the wall, a trolley and three small iron things; against the
// machine, when the film asks for it, someone of glass held there by the cylinder. Above the ceiling: the roof
// and the open air, where the quench pipe ends.
// Solid: only what the magnet throws — the cylinder (steel: a body, a white shoulder, a valve), keys, scissors,
// a pen. NOT here: the scanner, its table, its pipe, the box with the two buttons (model.js); their place is free.
// Three colours. signal: the line on the floor, the wake of what the magnet pulls. ink: everything else.
// Centimetres, y up, the floor is y = 0; the magnet at the origin, its mouth toward +z, the door in the +z wall.
// Everything is a function of the state and of `time`.
//
// THE CYLINDER'S LAST PLACE. plan.js puts it at the mouth of the tunnel (x = 22). Here it ends flat on the
// machine's front LEFT of the mouth (x = −60), nearly level: it is where someone can stand against the machine
// (the table fills the front of the mouth) on the camera's side of it, and be held by it — the cylinder across
// the chest, 20 cm further out than on the bare front (`PRESS`, the one thing `victim` does to it).
//
// Shell orders (see `asShell`): you 10 · the one who is held 12 · the trolley 14 · the door's frame 22 · its
// leaf 24. The walls, the ceiling and the roof are single sheets and no shell at all: they never hide anything.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glass, asShell, box, cyl, lathe, plate, placed, anchor, lineMat, fatLine, makePart, addMesh, setPartOpacity, mergeGeometries } from "@kit/build3d.js";
import { ROOM, MAGNET, PIPE, BOX, YOU, BOTTLE, LINE } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const ORDER = { you: 10, victim: 12, trolley: 14, frame: 22, leaf: 24 };
const STROKE = { strong: { w: 2.4, a: 0.78 }, fine: { w: 1.9, a: 0.44 }, faint: { w: 1.8, a: 0.2 } };

const { x: RX, z0: Z0, z1: Z1, h: CEIL, roof: ROOF, door: DOOR } = ROOM;
const DX0 = DOOR.x - DOOR.w / 2;
const DX1 = DOOR.x + DOOR.w / 2;
const THICK = 12; // the walls
const FACE = MAGNET.at[2] + MAGNET.half; // the machine's front: the plane of the tunnel's mouth
const WINDOW = { z0: -250, z1: -70, y0: 92, y1: 198 }; // toward the control desk: in the −x wall, at the back (in the door's wall it would stand between the first frame and the machine; nearer, over the trolley)
const TROLLEY = { x: -282, z: 160, w: 42, d: 64, top: 86 }; // against the −x wall: outside the line, and out of every sight line from the door's wall to the machine
/** Where the cylinder ends: flat on the machine's front, left of the mouth — and where whoever it holds stands. */
const STUCK = V(-60, 120, FACE + BOTTLE.r + 3.2); // (on the control pad that stands 2.6 cm out of the front there: model.js)
const PRESS = 20; // …this much further out with someone behind it
const VICTIM = { x: -62, z: FACE + 13.5 };
/**
 * Where you stand at the box. NOT plan.js's YOU.box (x = 92, between the box and the door): there, whatever the camera,
 * the door's jamb stands behind your reaching arm or behind your head. On the far side of the box the picture reads
 * from left to right: the doorway, the box, your arm, you.
 */
const AT_BOX = { x: 44, z: YOU.box[2], yaw: 0.15 };
/** The buttons, as model.js builds them: its box is turned to face the room (its +x is the room's −x); the emergency stop's mushroom ends 9.6 cm out of the box's own plane, the magnet stop 7.2 (both taken half pressed). */
const BUTTONS = { estop: V(BOX.at[0] - BOX.estop[0], BOX.at[1] + BOX.estop[1], BOX.at[2] - 9.6 + 0.9), mstop: V(BOX.at[0] - BOX.mstop[0], BOX.at[1] + BOX.mstop[1], BOX.at[2] - 7.2 + 0.7) };

/* ───────────────────────────────────────────────────────────── a head (012's, hob.js) */

const SKULL = [
  { c: [0, 2.2, -1.5], r: [7.6, 8.5, 9.7] }, // the cranium
  { c: [0, -3.8, 2.0], r: [6.5, 7.4, 6.5], k: 1.8 }, // the face, down to the jaw
  { c: [0, -8.4, 4.4], r: [2.8, 2.1, 2.3], k: 2.2 }, // the chin
  { c: [0, 2.6, 6.3], r: [5.9, 1.4, 2.4], k: 1.0 }, // the brow
  { c: [4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 }, // the cheekbones
  { c: [-4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 },
  { c: [0, 0.2, 7.3], r: [0.95, 3.0, 1.55], k: 0.8 }, // the bridge of the nose
  { c: [0, -2.7, 8.1], r: [1.3, 1.35, 2.3], k: 1.0 }, // its tip
  { c: [0, -6.5, 6.5], r: [2.6, 1.1, 1.7], k: 1.8 }, // the lips: barely
];
function headGeometry() {
  // where a ray from the centre along `d` leaves an ellipsoid (0: it misses it)
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
  return g;
}

/** A figure of glass from head to hands, with a sculpted head and an open neck: 016's « toi ». `k`: how bright. */
function glassFigure(headGeo, { order, k, hands, through = 0.2 }) {
  const fig = makeFigure({ shell: true, hands, order, glassK: k, through, skin: BRAND.ink });
  fig.ghost(true);
  fig.shadow.visible = true;
  const HEADY = 76.5; // the head's centre, in the trunk's frame
  const head = glass(BRAND.ink, { base: 0.006 * k, rim: 0.5 * k, power: 2.4, edge: 0.42 * k, spec: 0.65 * k, through: 0.06 });
  fig.head.geometry = headGeo;
  fig.head.material = head;
  fig.head.position.set(0, HEADY, 2);
  asShell(fig.head, order);
  for (const layer of fig.head.children) if (layer.userData.shell) layer.geometry = headGeo; // (its layers were born with the ball)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.6, 9, 24, 1, true), fig.body); // (open: the round end of a capsule shows through the head like a second ball)
  neck.position.set(0, HEADY - 12.5, 0.7);
  neck.rotation.x = 10 * DEG;
  neck.scale.z = 0.92;
  fig.torso.add(neck);
  asShell(neck, order);
  return { fig, head };
}

/* ───────────────────────────────────────────────────────────── glass and lines, baked where they stand */

/** Position and normal only, not indexed: what every piece of glass is reduced to before the pieces of one material are merged. */
function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  return o;
}

/** A set of glass pieces and of lines: one mesh per glass and one per family of lines (012, hob.js; 016, wall.js). */
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
  /** A circle of radius `r` round (cx, cy, cz), in the plane whose normal is `axis` ("x", "y" or "z"). */
  const ring = (list, cx, cy, cz, r, axis = "y", n = 48) =>
    run(
      list,
      Array.from({ length: n }, (_, i) => {
        const c = r * Math.cos((i / n) * 6.2832);
        const s = r * Math.sin((i / n) * 6.2832);
        return axis === "y" ? [cx + c, cy, cz + s] : axis === "z" ? [cx + c, cy + s, cz] : [cx, cy + c, cz + s];
      }),
      true,
    );
  const edgesInto = (list, geometry) => {
    const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, 28).attributes.position;
    for (let i = 0; i < e.count; i += 2) seg(list, [e.getX(i), e.getY(i), e.getZ(i)], [e.getX(i + 1), e.getY(i + 1), e.getZ(i + 1)]);
  };
  /** A piece of glass; `lines`: its own edges drawn in that family. */
  const piece = (material, geometry, { pos, rotX, rotY, rotZ, lines = false } = {}) => {
    const g = placed(geometry, { pos, rotX, rotY, rotZ });
    if (lines) edgesInto(L[lines], g);
    into(material, bare(g));
  };
  /** A board of glass between two corners. */
  const slab = (material, xa, xb, ya, yb, za, zb, { r = 0.25, lines = false } = {}) => piece(material, box(xb - xa, yb - ya, zb - za, r), { pos: [(xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2], lines });
  /** A single sheet of glass through four corners: a wall has one surface, not six. */
  const sheet = (material, a, b, c, d) => {
    const n = V(...b).sub(V(...a)).cross(V(...d).sub(V(...a))).normalize();
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(Array.from({ length: 6 }, () => [n.x, n.y, n.z]).flat(), 3));
    into(material, g);
  };
  /** Into the scene. `order`: the shell they make together (null: no shell); `glasses` and `lines` collect what a fade drives. */
  const build = (parent, order, glasses, lines) => {
    const panes = [];
    for (const [material, list] of buckets) {
      const mesh = new THREE.Mesh(list.length > 1 ? mergeGeometries(list) : list[0], material);
      mesh.frustumCulled = false;
      parent.add(mesh);
      panes.push(mesh);
      glasses.push(material);
    }
    if (order != null) asShell(panes, order);
    for (const name of Object.keys(L)) {
      if (!L[name].length) continue;
      const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(L[name]), lineMat(BRAND.ink, STROKE[name].w, { opacity: STROKE[name].a }));
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;
      parent.add(mesh);
      lines.push(mesh.material);
    }
  };
  return { L, seg, run, ring, piece, slab, sheet, build };
}

/* ───────────────────────────────────────────────────────────── floors, paint, light */

/**
 * A floor that is only its grid: lines `cell` apart and stronger ones every `major` cells, each family leaving
 * before its lines get too close to draw (seen at a grazing angle, a grid that does not leave is a grey slab).
 * `pool`: a little light on the floor round the origin — what the machine stands on.
 */
function gridMaterial({ cell, major = 5, pool = 0, reach = 300 }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK }, uCell: { value: cell }, uMajor: { value: major }, uPool: { value: pool }, uReach: { value: reach }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vP = w.xz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uCell, uMajor, uPool, uReach, uAmount; varying vec2 vP;
      float lines(float q) {
        float fw = max(fwidth(q), 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return smoothstep(3.0, 11.0, 1.0 / fw) * (1.0 - smoothstep(0.0, fw * 1.5, d));
      }
      float level(vec2 q) { return max(lines(q.x), lines(q.y)); }
      void main() {
        if (uAmount < 0.002) discard;
        float g = max(level(vP / uCell) * 0.42, level(vP / (uCell * uMajor)));
        vec2 r = vP / uReach;
        float near = exp(-dot(r, r));
        gl_FragColor = vec4(uColor * ((g * (0.45 + 0.55 * near) + uPool * near) * uAmount), 1.0);
      }`,
  });
}

/** A band of paint on the floor, following an ellipse: `soft` 0 the paint itself, crisp at any distance · 1 its glow on the floor. */
function paintMaterial(soft, gain) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: SIGNAL }, uSoft: { value: soft }, uGain: { value: gain }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aAcross; varying float vA;
      void main() { vA = aAcross; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uSoft, uGain, uAmount; varying float vA;
      void main() {
        if (uAmount < 0.002) discard;
        float w = clamp(fwidth(vA), 1e-4, 1.0);
        float crisp = smoothstep(0.0, w, vA) * smoothstep(0.0, w, 1.0 - vA);
        float glow = pow(clamp(1.0 - abs(vA * 2.0 - 1.0), 0.0, 1.0), 2.2);
        gl_FragColor = vec4(uColor * (mix(crisp, glow, uSoft) * uGain * uAmount), 1.0);
      }`,
  });
}
/** The band itself: `width` cm, astride the ellipse (rx, rz) round the origin, at height y. */
function ellipseBand(rx, rz, width, y, n = 220) {
  const pos = [];
  const across = [];
  const index = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    const k = Math.hypot(c / rx, s / rz); // the ellipse's own normal: its gradient
    const nx = c / rx / k, nz = s / rz / k;
    pos.push(rx * c - (nx * width) / 2, y, rz * s - (nz * width) / 2, rx * c + (nx * width) / 2, y, rz * s + (nz * width) / 2);
    across.push(0, 1);
    if (i < n) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aAcross", new THREE.Float32BufferAttribute(across, 1));
  g.setIndex(index);
  return g;
}

/**
 * The wake of something the magnet pulls: a cone of light behind it — bright where it faces the eye, nothing at its
 * rim, gone at its tail. Local frame: the thing at the origin, flying toward +z; scale it (radius, radius, length).
 */
function makeWake() {
  const geo = new THREE.CylinderGeometry(1, 0.1, 1, 24, 6, true).rotateX(Math.PI / 2).translate(0, 0, -0.5);
  const uniforms = { uColor: { value: SIGNAL }, uAmount: { value: 0 } };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec3 vN; varying vec3 vV; varying float vT;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vT = -position.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying vec3 vN; varying vec3 vV; varying float vT;
        void main() {
          float f = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 1.7);
          float t = clamp(vT, 0.0, 1.0);
          gl_FragColor = vec4(uColor * (f * smoothstep(0.0, 0.1, t) * pow(1.0 - t, 1.6) * uAmount), 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  mesh.visible = false;
  return { mesh, uniforms };
}

/**
 * The open air, drawn at infinity behind everything (007, jet.js): a horizon — a thin line and the air above it —
 * and three strata of cloud. The dome follows the eye and never turns: the horizon stays level, and stays far.
 */
function skyMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: { uInk: { value: INK }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount; varying vec3 vDir;
      float lines(float q) {
        float fw = max(fwidth(q), 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return smoothstep(3.0, 11.0, 1.0 / fw) * (1.0 - smoothstep(0.0, fw * 1.5, d));
      }
      float level(vec2 q) { return max(lines(q.x), lines(q.y)); }
      float stratum(vec3 d, float at, float width, float k1, float k2, float phase) {
        float az = atan(d.x, d.z + 1e-6);
        float wisp = smoothstep(0.3, 0.9, 0.5 + 0.5 * sin(az * k1 + phase) * sin(az * k2 + phase * 1.7));
        float x = (d.y - at) / width;
        return exp(-x * x) * wisp;
      }
      void main() {
        if (uAmount < 0.002) discard;
        vec3 d = normalize(vDir);
        float up = step(0.0, d.y);
        float air = 0.13 * exp(-abs(d.y) / 0.0024) + up * 0.085 * exp(-d.y / 0.13) + (1.0 - up) * 0.022 * exp(d.y / 0.05);
        float cloud = stratum(d, 0.045, 0.006, 9.0, 23.0, 0.6) * 0.13 + stratum(d, 0.11, 0.009, 7.0, 17.0, 2.1) * 0.09 + stratum(d, 0.21, 0.014, 5.0, 13.0, 4.0) * 0.06;
        // the land: where each ray of the eye meets the ground, its lines leaving before they crowd; none round the building itself
        float t = max(cameraPosition.y, 1.0) / max(-d.y, 1e-4);
        vec2 p = cameraPosition.xz + d.xz * t;
        float land = (1.0 - up) * max(level(p / 600.0) * 0.5, level(p / 3000.0)) * exp(-t / 45000.0) * smoothstep(900.0, 1600.0, length(p));
        gl_FragColor = vec4(uInk * ((air + cloud * up + 0.075 * land) * uAmount), 1.0);
      }`,
  });
}

/* ───────────────────────────────────────────────────────────── the room */

export function buildSuite() {
  const group = new THREE.Group();
  group.name = "suite";
  const fx = {};
  const A = {};
  const shellGlass = []; // every glass the room's fade drives…
  const shellLines = []; // …and every family of lines
  const skyGlass = [];
  const skyLines = [];

  /* ═════════════ 1 · THE FLOOR: a grid the size of the room, nothing under it; and the painted line ═════════════ */

  fx.floor = gridMaterial({ cell: 30, major: 5, pool: 0.3, reach: 250 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2 * RX, Z1 - Z0).rotateX(-Math.PI / 2), fx.floor);
  floor.position.set(0, 0, (Z0 + Z1) / 2);
  floor.frustumCulled = false;
  group.add(floor);

  // the line round the magnet: 9 cm of paint, its glow on the floor, and a stroke that never gets thinner than the screen can draw
  fx.paint = paintMaterial(0, 1.7);
  fx.paintGlow = paintMaterial(1, 0.3);
  const paint = new THREE.Mesh(ellipseBand(LINE.rx, LINE.rz, 9, 0.5), fx.paint);
  const paintGlow = new THREE.Mesh(ellipseBand(LINE.rx, LINE.rz, 56, 0.35), fx.paintGlow);
  paint.renderOrder = 3;
  paintGlow.renderOrder = 3;
  const stroke = fatLine(Array.from({ length: 181 }, (_, i) => [LINE.rx * Math.cos((i / 180) * 6.28319), 0.6, LINE.rz * Math.sin((i / 180) * 6.28319)]), { color: BRAND.signal, width: 2.2, opacity: 1 });
  fx.stroke = stroke.material;
  for (const mesh of [paint, paintGlow, stroke]) {
    mesh.frustumCulled = false;
    group.add(mesh);
  }

  /* ═════════════ 2 · THE WALLS, THE CEILING: sheets of glass, their outline ═════════════ */

  const room = makeSet();
  const wallGlass = glass(BRAND.ink, { base: 0, rim: 0.085, power: 3.6 });
  const ceilGlass = glass(BRAND.ink, { base: 0, rim: 0.05, power: 4 });
  room.sheet(wallGlass, [-RX, 0, Z0], [-RX, 0, Z1], [-RX, CEIL, Z1], [-RX, CEIL, Z0]);
  room.sheet(wallGlass, [RX, 0, Z0], [RX, 0, Z1], [RX, CEIL, Z1], [RX, CEIL, Z0]);
  room.sheet(wallGlass, [-RX, 0, Z0], [RX, 0, Z0], [RX, CEIL, Z0], [-RX, CEIL, Z0]);
  room.sheet(wallGlass, [-RX, 0, Z1], [DX0, 0, Z1], [DX0, CEIL, Z1], [-RX, CEIL, Z1]); // the door's wall: left of the door,
  room.sheet(wallGlass, [DX1, 0, Z1], [RX, 0, Z1], [RX, CEIL, Z1], [DX1, CEIL, Z1]); // right of it,
  room.sheet(wallGlass, [DX0, DOOR.h, Z1], [DX1, DOOR.h, Z1], [DX1, CEIL, Z1], [DX0, CEIL, Z1]); // above it
  room.sheet(ceilGlass, [-RX, CEIL, Z0], [RX, CEIL, Z0], [RX, CEIL, Z1], [-RX, CEIL, Z1]);
  room.run(room.L.fine, [[-RX, 0, Z0], [RX, 0, Z0], [RX, 0, Z1], [-RX, 0, Z1]], true); // where the walls meet the floor
  for (const x of [-RX, RX]) for (const z of [Z0, Z1]) room.seg(room.L.fine, [x, 0, z], [x, CEIL, z]);
  room.run(room.L.faint, [[-RX, CEIL, Z0], [RX, CEIL, Z0], [RX, CEIL, Z1], [-RX, CEIL, Z1]], true);
  // the ceiling, pierced where the quench pipe goes through
  room.ring(room.L.fine, PIPE.from[0], CEIL, PIPE.from[2], PIPE.r + 4);
  // the window toward the control desk: a pane, its frame
  const paneGlass = glass(BRAND.ink, { base: 0.004, rim: 0.16, power: 3, spec: 0.45 });
  const WX = -RX - THICK / 2;
  room.sheet(paneGlass, [WX, WINDOW.y0, WINDOW.z0], [WX, WINDOW.y0, WINDOW.z1], [WX, WINDOW.y1, WINDOW.z1], [WX, WINDOW.y1, WINDOW.z0]);
  for (const [x, family] of [[-RX, room.L.fine], [-RX - THICK, room.L.faint]]) room.run(family, [[x, WINDOW.y0, WINDOW.z0], [x, WINDOW.y0, WINDOW.z1], [x, WINDOW.y1, WINDOW.z1], [x, WINDOW.y1, WINDOW.z0]], true);
  for (const [z, y] of [[WINDOW.z0, WINDOW.y0], [WINDOW.z1, WINDOW.y0], [WINDOW.z1, WINDOW.y1], [WINDOW.z0, WINDOW.y1]]) room.seg(room.L.faint, [-RX, y, z], [-RX - THICK, y, z]);
  // the doorway: its opening on the room's side, on the other side, and the wall's thickness between the two
  room.run(room.L.strong, [[DX0, 0, Z1], [DX0, DOOR.h, Z1], [DX1, DOOR.h, Z1], [DX1, 0, Z1]]);
  room.run(room.L.fine, [[DX0, 0, Z1 + THICK], [DX0, DOOR.h, Z1 + THICK], [DX1, DOOR.h, Z1 + THICK], [DX1, 0, Z1 + THICK]]);
  for (const x of [DX0, DX1]) for (const y of [0, DOOR.h]) room.seg(room.L.fine, [x, y, Z1], [x, y, Z1 + THICK]);
  room.build(group, null, shellGlass, shellLines);

  // its frame: three bars of glass with a lip — what « the doorway » is made of
  const frame = makeSet();
  const frameGlass = glass(BRAND.ink, { base: 0.008, rim: 0.42, power: 2.4, edge: 0.32, through: 0.2 });
  for (const x of [DX0 - 6, DX1]) frame.slab(frameGlass, x, x + 6, 0, DOOR.h + 6, Z1 - 1.5, Z1 + THICK + 1.5, { r: 0.6 });
  frame.slab(frameGlass, DX0, DX1, DOOR.h, DOOR.h + 6, Z1 - 1.5, Z1 + THICK + 1.5, { r: 0.6 });
  frame.build(group, ORDER.frame, shellGlass, shellLines);

  // the leaf: hung on the far jamb, it opens outward (the way a magnet room's door should: a room that fills with gas must not hold it shut)
  const leaf = new THREE.Group();
  leaf.position.set(DX1, 0, Z1 + THICK / 2);
  group.add(leaf);
  const door = makeSet();
  const leafGlass = glass(BRAND.ink, { base: 0.004, rim: 0.3, power: 2.6, edge: 0.25, through: 0.25 });
  door.slab(leafGlass, -DOOR.w + 1, -0.5, 1, DOOR.h - 1.5, -2.2, 2.2, { r: 0.4, lines: "fine" });
  door.run(door.L.faint, [[-76, 118, 0], [-36, 118, 0], [-36, 178, 0], [-76, 178, 0]], true); // its porthole
  for (const side of [-1, 1]) door.run(door.L.strong, [[-DOOR.w + 9, 102, side * 2.3], [-DOOR.w + 9, 102, side * 7], [-DOOR.w + 23, 102, side * 7]]); // its handle
  door.build(leaf, ORDER.leaf, shellGlass, shellLines);

  A.door = anchor(group, DOOR.x, DOOR.h + 6, Z1);
  A.window = anchor(group, -RX, WINDOW.y1, (WINDOW.z0 + WINDOW.z1) / 2);

  /* ═════════════ 3 · THE TROLLEY, and what lies on it ═════════════ */

  const { x: TX, z: TZ, w: TW, d: TD, top: TOP } = TROLLEY;
  const cart = makeSet();
  const cartGlass = glass(BRAND.ink, { base: 0.006, rim: 0.42, power: 2.4, edge: 0.32, through: 0.25 });
  cart.slab(cartGlass, TX - TW / 2, TX + TW / 2, TOP - 3, TOP, TZ - TD / 2, TZ + TD / 2, { r: 0.6, lines: "fine" }); // its top
  cart.slab(cartGlass, TX - TW / 2 + 2, TX + TW / 2 - 2, 26, 28, TZ - TD / 2 + 2, TZ + TD / 2 - 2, { r: 0.5, lines: "faint" }); // a shelf
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const x = TX + sx * (TW / 2 - 2.5);
      const z = TZ + sz * (TD / 2 - 2.5);
      cart.slab(cartGlass, x - 1.3, x + 1.3, 9, TOP - 3, z - 1.3, z + 1.3, { r: 0.4 });
      cart.piece(cartGlass, new THREE.SphereGeometry(4.2, 16, 12), { pos: [x, 4.4, z] }); // a caster
    }
  cart.run(cart.L.fine, [[TX - TW / 2 + 3, TOP - 1, TZ + TD / 2], [TX - TW / 2 + 3, TOP + 8, TZ + TD / 2 + 8], [TX + TW / 2 - 3, TOP + 8, TZ + TD / 2 + 8], [TX + TW / 2 - 3, TOP - 1, TZ + TD / 2]]); // its handle
  cart.build(group, ORDER.trolley, shellGlass, shellLines);
  A.trolley = anchor(group, TX, TOP + 12, TZ);

  // three small iron things, half as large again as life (they are seen from the other end of a room)
  const loose = makePart("loose");
  group.add(loose);
  const steel = solid(0xbfc4c7, { rough: 0.36, metal: 0.5 });
  const dull = solid(0x7c848b, { rough: 0.45, metal: 0.45 });
  const dark = solid(0x2f353a, { rough: 0.6 });
  const SCALE = 1.5;
  const thing = () => {
    const g = new THREE.Group();
    g.scale.setScalar(SCALE);
    loose.add(g);
    return g;
  };
  /** Adds a mesh of the part `loose` under one of its things (what `addMesh` does, one level down). */
  const put = (parent, geometry, material, o) => parent.add(addMesh(loose, geometry, material, o));

  // keys: three on a ring, a tag. Built in the plane xy, the blades toward −y
  const keys = thing();
  const blade = [[0.42, -1.23], [0.42, -5.6], [0, -6.3], [-0.42, -5.6], [-0.42, -4.6], [-0.78, -4.3], [-0.42, -4.0], [-0.42, -3.2], [-0.82, -2.9], [-0.42, -2.6], [-0.42, -1.23]];
  const bow = Array.from({ length: 14 }, (_, i) => {
    const a = (251.1 - (i * 322.2) / 14) * DEG; // the long way round, from one side of the blade to the other
    return [1.3 * Math.cos(a), 1.3 * Math.sin(a)];
  });
  const keyShape = new THREE.Shape([...blade.slice(0, -1), ...bow].map(([x, y]) => new THREE.Vector2(x, y)));
  keyShape.holes.push(new THREE.Path().absarc(0, 0.35, 0.42, 0, Math.PI * 2, true));
  const keyGeo = plate(keyShape, 0.24, { bevel: 0.06, round: 1, curveSegments: 10 }).translate(0, -0.35, -0.12); // its hole at the origin
  put(keys, mergeGeometries([-38, -4, 31].map((turn, i) => placed(keyGeo, { pos: [0, 0, (i - 1) * 0.3], rotZ: turn * DEG }))), steel, { edgeOpacity: 0.3 });
  put(keys, new THREE.TorusGeometry(2.3, 0.2, 8, 30).translate(0, 2.05, 0), dull, { edges: false });
  put(keys, box(2.5, 3.8, 0.5, 0.5).translate(0.9, 5.6, 0).rotateZ(-18 * DEG), dark, { edgeOpacity: 0.6 });

  // scissors: two blades and their loops, a little open. In the plane xy, the points toward +y
  const scissors = thing();
  const half = [[-0.42, -4.9], [0.85, -4.7], [0.8, 0], [0.62, 6], [0.06, 11], [-0.34, 6], [-0.42, 0]];
  const halfGeo = (side) => plate(half.map(([x, y]) => [side * x, y]), 0.26, { bevel: 0.06, round: 1 }).translate(0, 0, -0.13 - side * 0.14); // (drawn mirrored, not scaled by −1: that would turn it inside out)
  const loopGeo = (side) => new THREE.TorusGeometry(1.75, 0.46, 10, 26).translate(side * 0.5, -6.5, 0);
  put(scissors, mergeGeometries([1, -1].map((side) => placed(halfGeo(side), { rotZ: side * 8 * DEG }))), steel, { edgeOpacity: 0.3 });
  put(scissors, mergeGeometries([1, -1].map((side) => placed(loopGeo(side), { rotZ: side * 8 * DEG }))), dark, { edges: false });
  put(scissors, cyl(0.42, 0.7, 0.08, 16).rotateX(Math.PI / 2), dull, { edges: false });

  // a pen: a barrel, a steel point, a clip. Along y, the point toward −y
  const pen = thing();
  put(pen, lathe([[0.1, -4.6], [0.56, -4.6], [0.56, 6.5], [0.42, 6.9], [0.1, 6.9]], 20, { bevel: 0.08 }), dark, { edgeOpacity: 0.55 });
  put(pen, lathe([[0.06, -7.4], [0.3, -6.5], [0.56, -4.6], [0.1, -4.6]], 20), steel, { edges: false });
  put(pen, box(0.3, 4.2, 0.36, 0.08).translate(0.72, 4.3, 0), steel, { edges: false });

  // where each lies on the trolley, where it ends round the mouth of the tunnel, and what it does on the way
  // the fascia round the mouth is a dish (model.js): [radius, z] from the tunnel out to its flat rim
  const DISH = [[34, 73], [34.8, 74.6], [36.6, 76], [40, 78.5], [44.5, 81.5], [50, 84.4], [56.5, 86.7], [62, 88], [80, 87]];
  const dishAt = (r) => {
    for (let i = 1; i < DISH.length; i++) if (r <= DISH[i][0]) return DISH[i - 1][1] + ((r - DISH[i - 1][0]) / (DISH[i][0] - DISH[i - 1][0])) * (DISH[i][1] - DISH[i - 1][1]);
    return DISH[DISH.length - 1][1];
  };
  /** Lying on the dish `r` from the axis, `at` degrees round it (from +x toward +y): where, and turned how — its leading end (±y: `lead`) toward the tunnel. */
  const onDish = (r, at, lead, off) => {
    const out = V(Math.cos(at * DEG), Math.sin(at * DEG), 0);
    const slope = (dishAt(r + 3) - dishAt(r - 3)) / 6;
    const normal = out.clone().multiplyScalar(-slope).add(V(0, 0, 1)).normalize(); // out of the dish, toward the room
    const inward = out.clone().multiplyScalar(-1).add(V(0, 0, -slope)).normalize(); // down its slope, to the tunnel
    const y = inward.clone().multiplyScalar(lead); // the thing's own +y
    return {
      end: V(...MAGNET.at).addScaledVector(out, r).setZ(MAGNET.at[2] + dishAt(r)).addScaledVector(normal, off),
      qEnd: new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V().crossVectors(y, normal), y, normal)),
    };
  };
  const flat = (yaw) => new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, yaw * DEG, 0, "YXZ"));
  const lying = (yaw) => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw * DEG, Math.PI / 2, "YXZ"));
  fx.things = [
    { g: keys, lead: V(0, -1, 0), rest: V(TX + 3, TOP + 0.4, TZ + 19), qRest: flat(75), ...onDish(52, 52, -1, 0.5), drop: V(36, 0.6, FACE + 12), from: 0, to: 0.62, turns: 2, r: 3.2 },
    { g: scissors, lead: V(0, 1, 0), rest: V(TX - 2, TOP + 0.4, TZ - 1), qRest: flat(-62), ...onDish(54, 100, 1, 0.5), drop: V(-8, MAGNET.table.y + 0.6, FACE + 8), from: 0.14, to: 0.8, turns: -1, r: 3.6 }, // (they end on the table)
    { g: pen, lead: V(0, -1, 0), rest: V(TX + 8, TOP + 0.8, TZ - 21), qRest: lying(24), ...onDish(50, -16, -1, 1.0), drop: V(52, 1, FACE + 15), from: 0.3, to: 1, turns: 1, r: 2.4 },
  ].map((it) => {
    const hover = it.rest.clone().add(V(0, 15, 0)).addScaledVector(it.end.clone().sub(it.rest).setY(0).normalize(), 7);
    const travel = it.end.clone().sub(hover).normalize();
    const wake = makeWake();
    wake.mesh.quaternion.setFromUnitVectors(V(0, 0, 1), travel);
    group.add(wake.mesh);
    return { ...it, hover, travel, wake, qFly: new THREE.Quaternion().setFromUnitVectors(it.lead, travel), length: it.end.distanceTo(hover) };
  });
  A.keys = anchor(keys, 0, 0, 0);

  /* ═════════════ 4 · THE CYLINDER: steel, a white shoulder, a valve ═════════════ */

  const bottle = makePart("bottle");
  group.add(bottle);
  const half68 = BOTTLE.len / 2;
  const R = BOTTLE.r;
  addMesh(bottle, lathe([[0.1, -half68], [R - 1.1, -half68], [R, -half68 + 1.3], [R, half68 - 22], [0.1, half68 - 22]], 56, { bevel: 0.35, round: 2 }), solid(0xa9afb3, { rough: 0.4, metal: 0.45 }), { edgeOpacity: 0.5 });
  addMesh(bottle, lathe([[R, half68 - 22], [R - 0.25, half68 - 19], [R - 1.2, half68 - 15.6], [R - 2.8, half68 - 12.6], [R - 4.6, half68 - 10.6], [2.5, half68 - 9.5], [2.5, half68 - 7.6], [0.1, half68 - 7.6]], 56), solid(0xddd9cd, { rough: 0.5 }), { edges: false });
  addMesh(bottle, box(4.4, 5.4, 4.4, 0.5), dull.clone(), { pos: [0, half68 - 4.9, 0], edgeOpacity: 0.6 });
  addMesh(bottle, cyl(1.25, 3.4, 0.2, 20).rotateZ(Math.PI / 2), dull.clone(), { pos: [3.4, half68 - 4.6, 0], edges: false });
  addMesh(bottle, cyl(3.3, 1.3, 0.3, 24), dark.clone(), { pos: [0, half68 - 0.65, 0], edgeOpacity: 0.5 });
  A.bottle = anchor(bottle, 0, 0, 0);
  fx.bottleWake = makeWake();
  group.add(fx.bottleWake.mesh);

  /* ═════════════ 5 · YOU ═════════════ */

  const headGeo = headGeometry();
  const { fig: you, head: youHead } = glassFigure(headGeo, { order: ORDER.you, k: 1.25, hands: "real" });
  fx.youHead = youHead;
  you.group.name = "suite-you";
  group.add(you.group);
  const STRIDE = 2.5; // mid-step, the hips are this much lower

  // in the doorway you face the mouth of the tunnel; at the box, the wall — a little turned toward the buttons
  const [DOORX, , DOORZ] = YOU.door;
  const { x: BOXX, z: BOXZ, yaw: YAW1 } = AT_BOX;
  const YAW0 = Math.atan2(MAGNET.at[0] - DOORX, FACE - DOORZ);
  /** A point of the room, in the frame of someone standing at (x, z) and turned by `yaw`. */
  const local = (p, x, z, yaw, y0 = 0) => {
    const dx = p.x - x;
    const dz = p.z - z;
    return V(dx * Math.cos(yaw) - dz * Math.sin(yaw), p.y - y0, dx * Math.sin(yaw) + dz * Math.cos(yaw));
  };
  const turned = (dir, yaw) => V(dir.x * Math.cos(yaw) + dir.z * Math.sin(yaw), dir.y, -dir.x * Math.sin(yaw) + dir.z * Math.cos(yaw)); // a direction of your own frame, in the room's

  // the cylinder in your arms: across your chest, its valve up by your left shoulder
  const HELD = V(...BOTTLE.held);
  const heldMine = local(HELD, DOORX, DOORZ, YAW0, -STRIDE);
  const axisMine = V(0.5, 0.86, -0.1).normalize();
  const Q_HELD = new THREE.Quaternion().setFromUnitVectors(UP, turned(axisMine, YAW0));
  const arm = (t, dir, palm, k, bend) => ({ t: V(...t), dir: V(...dir).normalize(), palm: V(...palm).normalize(), k, bend: V(...bend) });
  const hang = (side) => [side * 0.35, -1, -0.1];
  // …one hand over it, one under: the kit closes them on a bar of its radius, and they are read back
  you.hold("L", heldMine.clone().addScaledVector(axisMine, 12), axisMine, { bar: R, k: 0.5, palm: V(0, 0, -1), dir: V(-0.86, 0.5, 0) });
  you.hold("R", heldMine.clone().addScaledVector(axisMine, -12), axisMine, { bar: R, k: 0.5, palm: V(0.1, 1, -0.25), dir: V(0.55, -0.35, 0.75) });
  const read = (s, k, bend) => ({ t: you.arms[s].target.clone(), dir: you.arms[s].dir.clone(), palm: you.arms[s].palm.clone(), k, bend: V(...bend) });
  // the buttons, in your frame at the box. The emergency stop is slapped: the palm flat on it, the fingers up. The magnet
  // stop is pressed with the fingers, the hand coming at it from below its lifted flap
  const slap = local(BUTTONS.estop.clone().add(V(0, -4.5, -1.6)), BOXX, BOXZ, YAW1);
  const POKE = V(0, 0.2, 1).normalize();
  const poke = local(BUTTONS.mstop.clone().addScaledVector(POKE, -18.2).add(V(0, 2, 0)), BOXX, BOXZ, YAW1);
  const ARMS = {
    L: {
      carry: read("L", 0.5, hang(1)),
      out: arm([27, 132, 62], [-0.1, 0.08, 1], [-0.75, -0.65, 0], 0, [0.5, -0.6, -0.3]), // stretched after it
      empty: arm([22, 110, 34], [-0.05, 0.3, 1], [-0.5, 0.75, 0.2], 0.1, [0.4, -1, -0.3]), // then half down, the hands open
      rest: arm([21, 92.5, 4], [0.05, -1, 0.12], [-1, 0, 0], 0.15, hang(1)),
    },
    R: {
      carry: read("R", 0.5, hang(-1)),
      out: arm([-8, 126, 64], [0.12, 0.02, 1], [0.75, -0.65, 0], 0, [-0.5, -0.6, -0.3]),
      empty: arm([-22, 107, 32], [0.05, 0.25, 1], [0.5, 0.75, 0.2], 0.1, [-0.4, -1, -0.3]),
      rest: arm([-21, 92.5, 2], [-0.05, -1, 0.12], [1, 0, 0], 0.15, hang(-1)),
    },
  };
  const mine = (x, y, z) => local(V(x, y, z), 0, 0, YAW1).toArray(); // a direction of the room, in your frame at the box
  const PRESS1 = arm(slap.toArray(), mine(0, 1, 0.14), mine(0, -0.1, 1), 0.05, [0.7, -0.7, -0.2]);
  const PRESS2 = arm(poke.toArray(), mine(POKE.x, POKE.y, POKE.z), mine(0, -1, 0.2), 0.22, [0.8, -0.6, -0.1]);
  const LEGS = {
    door: { L: { at: V(9, 8 + STRIDE, 15), toe: V(0, 0, 1) }, R: { at: V(-9, 10.5 + STRIDE, -13), toe: V(0, -0.35, 1) } }, // mid-step: you are coming in
    box: { L: { at: V(9.5, 8, 3), toe: V(0.12, 0, 1) }, R: { at: V(-9.5, 8, -2), toe: V(-0.12, 0, 1) } },
  };
  A.head = anchor(you.head, 0, 12.5, 0);
  A.hand = anchor(you.arms.L.hand, 0, 0, 5); // the one that goes to the buttons
  A.handR = anchor(you.arms.R.hand, 0, 0, 5);
  A.you = anchor(you.group, 0, 120, 0);

  /* ═════════════ 6 · THE ONE WHO IS HELD: paler glass, standing against the machine, whole, still ═════════════ */

  const { fig: held, head: heldHead } = glassFigure(headGeo, { order: ORDER.victim, k: 0.98, hands: "real", through: 0.15 });
  fx.heldHead = heldHead;
  held.group.name = "suite-held";
  held.group.position.set(VICTIM.x, 0, VICTIM.z); // the back to the machine, facing the room
  group.add(held.group);
  // the cylinder lies across the chest, its valve toward the mouth and a little lower
  const AXIS_END = V(0.97, -0.242, 0).normalize();
  const Q_END = new THREE.Quaternion().setFromUnitVectors(UP, AXIS_END);
  const barMine = V(STUCK.x - VICTIM.x, STUCK.y, STUCK.z + PRESS - VICTIM.z);
  held.leg("L", V(10, 8, 2), V(0.1, 0, 1), V(0.2, 0, 1));
  held.leg("R", V(-10, 8, 1), V(-0.1, 0, 1), V(-0.2, 0, 1));
  held.hold("L", barMine.clone().addScaledVector(AXIS_END, 16), AXIS_END, { bar: R, k: 0.62, bend: V(1, -0.5, 0.25) }); // both hands on it
  held.hold("R", barMine.clone().addScaledVector(AXIS_END, -16), AXIS_END, { bar: R, k: 0.62, bend: V(-1, -0.5, 0.25) });
  held.lean(-2, 0, 0);
  held.head.rotation.set(11 * DEG, -14 * DEG, 0); // the eyes on the cylinder, a little toward the room
  A.victim = anchor(held.group, 0, 188, 0);

  /* ═════════════ 7 · ABOVE: the roof, and the open air ═════════════ */

  const roof = makeSet();
  const OVER = 20; // the roof oversails the walls
  const [X0, X1, RZ0, RZ1] = [-RX - THICK - OVER, RX + THICK + OVER, Z0 - THICK - OVER, Z1 + THICK + OVER];
  const roofGlass = glass(BRAND.ink, { base: 0, rim: 0.07, power: 3.6 });
  roof.sheet(roofGlass, [X0, ROOF, RZ0], [X1, ROOF, RZ0], [X1, ROOF, RZ1], [X0, ROOF, RZ1]);
  const edge = [[X0, RZ0], [X1, RZ0], [X1, RZ1], [X0, RZ1]];
  edge.forEach(([x, z], i) => {
    const [nx, nz] = edge[(i + 1) % 4];
    roof.sheet(roofGlass, [x, CEIL + 6, z], [nx, CEIL + 6, nz], [nx, ROOF + 16, nz], [x, ROOF + 16, z]); // its edge, up to the parapet
    roof.seg(roof.L.faint, [x, CEIL + 6, z], [x, ROOF + 16, z]);
  });
  roof.run(roof.L.strong, edge.map(([x, z]) => [x, ROOF + 16, z]), true); // the parapet
  roof.run(roof.L.fine, edge.map(([x, z]) => [x + Math.sign(-x) * 14, ROOF + 16, z + (z < 0 ? 14 : -14)]), true);
  roof.run(roof.L.fine, edge.map(([x, z]) => [x + Math.sign(-x) * 14, ROOF, z + (z < 0 ? 14 : -14)]), true);
  roof.run(roof.L.faint, edge.map(([x, z]) => [x, CEIL + 6, z]), true);
  // where the pipe comes through: a sleeve
  const sleeveGlass = glass(BRAND.ink, { base: 0.006, rim: 0.4, power: 2.4, edge: 0.3 });
  roof.piece(sleeveGlass, new THREE.CylinderGeometry(PIPE.r + 5, PIPE.r + 7, 12, 40, 1, true), { pos: [PIPE.from[0], ROOF + 6, PIPE.from[2]] });
  roof.ring(roof.L.strong, PIPE.from[0], ROOF + 12, PIPE.from[2], PIPE.r + 5);
  roof.ring(roof.L.fine, PIPE.from[0], ROOF, PIPE.from[2], PIPE.r + 7);
  roof.build(group, null, skyGlass, skyLines);
  fx.roofGrid = gridMaterial({ cell: 60, major: 4, pool: 0.25, reach: 420 });
  const roofGrid = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0 - 28, RZ1 - RZ0 - 28).rotateX(-Math.PI / 2), fx.roofGrid);
  roofGrid.position.set((X0 + X1) / 2, ROOF + 0.4, (RZ0 + RZ1) / 2);
  roofGrid.frustumCulled = false;
  group.add(roofGrid);
  fx.sky = skyMaterial();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), fx.sky);
  sky.frustumCulled = false;
  sky.renderOrder = -5;
  group.add(sky);
  A.roof = anchor(group, PIPE.from[0], ROOF + 12, PIPE.from[2]);
  A.line = anchor(group, 110, 0, 255); // the line, between the door and the magnet

  /* ═════════════ every frame ═════════════ */

  const shellBase = shellLines.map((mat) => mat.opacity);
  const skyBase = skyLines.map((mat) => mat.opacity);
  const FALLEN = V(STUCK.x - 6, R, FACE + 24); // at the foot of the machine, once the field is gone
  const Q_FALLEN = new THREE.Quaternion().setFromUnitVectors(UP, V(1, 0, 0.12).normalize());
  const TRAVEL = STUCK.clone().sub(HELD).normalize();
  const Q_FLY = new THREE.Quaternion().setFromUnitVectors(UP, TRAVEL.clone().negate()); // its foot first, the valve behind
  fx.bottleWake.mesh.quaternion.setFromUnitVectors(V(0, 0, 1), TRAVEL);
  const pos = V();
  const end = V();
  const quat = new THREE.Quaternion();
  const spin = new THREE.Quaternion();
  const T = { t: V(), dir: V(), palm: V(), bend: V() };
  const foot = V();
  const toe = V();
  const FRONT = V(0, 0, 1);
  /** One arm, between the poses: `out` stretched after the cylinder, `drop` hands coming down, `carry`, `spot`, and — the right one — `reach`. */
  const blend = (key, s, out, drop, carry, spot, press) => {
    const a = ARMS[s];
    T[key].copy(a.carry[key]).lerp(a.out[key], out).lerp(a.empty[key], drop);
    T[key].lerp(a.rest[key], 1 - carry);
    if (spot > 0) T[key].lerp(press ? press[key] : a.rest[key], spot);
  };
  const PRESSED = { t: V(), dir: V(), palm: V(), bend: V() };
  const KEYS = ["t", "dir", "palm", "bend"];
  const SIDES = ["L", "R"];

  /**
   * shell    the X-ray of the room: walls, ceiling, the door and its frame, the window, the grid, the trolley (0–1).
   *          What lies on the trolley — keys, scissors, a pen — is whole from 0.5 up and gone under 0.25
   * door     the leaf: 0 shut · 1 open (outward)
   * line     the line painted on the floor round the magnet (0–1)
   * you      0 nobody · 1 you
   * spot     0 in the doorway, mid-step, facing the mouth of the tunnel · 1 at the box — on the far side of it from the
   *          door — facing the wall (in between: you walk)
   * reach    at the box, your left hand: 0 down · 1 flat on the emergency stop · 2 its fingers on the magnet stop, from under the flap
   * carry    1: the cylinder is yours — in your arms while `bottle` is 0, your arms stretched after it as it leaves,
   *          then half down, the hands open · 0: your hands are empty, and there is no cylinder at all while `bottle` is 0
   * bottle   0 in your arms → 1 flat on the machine's front, left of the mouth: slow, then faster and faster, turning
   *          foot first on the way and slapping flat at the end; a wake of signal light behind it while it flies
   * loose    keys, scissors, a pen: each lifts off the trolley, points at the magnet, leaves — one after the other — and
   *          ends flat round the mouth of the tunnel (0–1; at 0.4 the keys hover, at 1 all three are stuck)
   * victim   0 nobody · 1 someone of paler glass standing against the machine, the cylinder across the chest (it then
   *          lies 20 cm further out). Only makes sense with `bottle` 1
   * sky      the roof, its parapet, the sleeve round the pipe; a horizon and three strata of cloud (0–1)
   * tesla    at 0, a cylinder that was on the machine (`bottle` 1) has slid to its foot, and what was stuck round the mouth
   *          (`loose` 1) has dropped — they let go under 0.6 T
   */
  function update(P, time, px) {
    const shell = P.shell;
    const b = clamp01(P.bottle);
    const carry = clamp01(P.carry);
    const spot = clamp01(P.spot);
    const who = clamp01(P.victim);

    // the room: glass, lines, grid
    for (let i = 0; i < shellGlass.length; i++) shellGlass[i].uniforms.uAmount.value = shell;
    for (let i = 0; i < shellLines.length; i++) shellLines[i].opacity = shellBase[i] * shell;
    fx.floor.uniforms.uAmount.value = 0.2 * shell;
    leaf.rotation.y = clamp01(P.door) * 100 * DEG;
    setPartOpacity(loose, smooth(0.25, 0.5, shell));

    // the painted line: it breathes, slowly
    const paintK = clamp01(P.line) * (0.95 + 0.05 * Math.sin(time * 1.3));
    fx.paint.uniforms.uAmount.value = paintK;
    fx.paintGlow.uniforms.uAmount.value = paintK;
    fx.stroke.opacity = 0.9 * paintK;

    // above
    const air = clamp01(P.sky);
    for (let i = 0; i < skyGlass.length; i++) skyGlass[i].uniforms.uAmount.value = air;
    for (let i = 0; i < skyLines.length; i++) skyLines[i].opacity = skyBase[i] * air;
    fx.roofGrid.uniforms.uAmount.value = 0.2 * air;
    fx.sky.uniforms.uAmount.value = air;
    sky.visible = air > 0.002;

    // the cylinder: where it ends (further out with someone behind it), and how far along it is
    end.copy(STUCK);
    end.z += PRESS * who;
    const s = Math.pow(b, 2.4);
    pos.copy(HELD).lerp(end, s);
    pos.y -= 10 * Math.sin(Math.PI * s) * (1 - s); // it sags a little as it leaves your arms
    quat.copy(Q_HELD).slerp(Q_FLY, smooth(0.02, 0.42, b)).slerp(Q_END, smooth(0.8, 1, b));
    const fall = smooth(0.9, 1, b) * (1 - smooth(0.05, 0.6, P.tesla));
    if (fall > 0) {
      pos.x = mix(pos.x, FALLEN.x, fall);
      pos.z = mix(pos.z, FALLEN.z, fall * fall);
      pos.y = mix(pos.y, FALLEN.y, fall * fall); // down the machine's front first, then out
      quat.slerp(Q_FALLEN, fall);
    }
    bottle.position.copy(pos);
    bottle.quaternion.copy(quat);
    setPartOpacity(bottle, Math.max(Math.min(carry, clamp01(P.you)), smooth(0, 0.04, b)));
    const flying = Math.pow(Math.sin(Math.PI * clamp01((b - 0.04) / 0.95)), 0.7);
    fx.bottleWake.mesh.visible = flying > 0.01;
    fx.bottleWake.mesh.position.copy(pos);
    fx.bottleWake.mesh.scale.set(R + 1.5, R + 1.5, 34 + 120 * b);
    fx.bottleWake.uniforms.uAmount.value = 0.55 * flying * smooth(0.08, 0.5, b); // (at full strength as it leaves your hands, it is a flash that hides it)

    // what lay on the trolley
    for (let i = 0; i < fx.things.length; i++) {
      const it = fx.things[i];
      const u = clamp01((P.loose - it.from) / (it.to - it.from));
      const up = smooth(0, 0.34, u); // it lifts, and turns to point at the magnet
      const go = Math.pow(clamp01((u - 0.34) / 0.66), 2.6); // then it leaves
      pos.copy(it.rest).lerp(it.hover, up);
      pos.y += 0.7 * Math.sin(time * 2.1 + i * 2) * up * (1 - go);
      pos.lerp(it.end, go);
      quat.copy(it.qRest).slerp(it.qFly, up);
      spin.setFromAxisAngle(it.travel, it.turns * 2 * Math.PI * go);
      quat.premultiply(spin).slerp(it.qEnd, smooth(0.82, 1, go));
      const off = smooth(0.9, 0.999, go) * (1 - smooth(0.05, 0.6, P.tesla)); // the field gone, it drops where it was
      if (off > 0) {
        pos.set(mix(pos.x, it.drop.x, off), mix(pos.y, it.drop.y, off * off), mix(pos.z, it.drop.z, off));
        quat.slerp(it.qRest, off);
      }
      it.g.position.copy(pos);
      it.g.quaternion.copy(quat);
      const wake = Math.pow(Math.sin(Math.PI * clamp01(go)), 0.6) * smooth(0.25, 0.5, shell);
      it.wake.mesh.visible = wake > 0.01;
      it.wake.mesh.position.copy(pos);
      it.wake.mesh.scale.set(it.r * 1.8, it.r * 1.8, 20 + 0.34 * it.length * go); // (wider than the thing: from across the room, it is its wake that says « projectile »)
      it.wake.uniforms.uAmount.value = wake;
    }

    // you: where you stand, which way you face
    const here = clamp01(P.you);
    you.group.visible = here > 0.01;
    if (you.group.visible) {
      you.body.uniforms.uAmount.value = here;
      fx.youHead.uniforms.uAmount.value = here;
      you.shadow.material.uniforms.uAmount.value = 0.5 * here;
      const walk = smooth(0, 1, spot);
      const low = STRIDE * (1 - walk);
      you.group.position.set(mix(DOORX, BOXX, walk), -low, mix(DOORZ, BOXZ, walk));
      you.group.rotation.y = mix(YAW0, YAW1, walk);
      you.shadow.position.y = 0.3 + low;
      // your arms: cradle → stretched after the cylinder → half down, open; hanging if you carry nothing; at the box, the right one on a button
      const out = smooth(0.02, 0.22, b);
      const drop = smooth(0.72, 1, b);
      const r = Math.min(2, Math.max(0, P.reach));
      const r1 = smooth(0, 1, r);
      const r2 = smooth(1, 2, r);
      for (const key of KEYS) PRESSED[key].copy(ARMS.L.rest[key]).lerp(PRESS1[key], r1).lerp(PRESS2[key], r2);
      PRESSED.t.z -= 7 * Math.sin(Math.PI * r2); // off one button before the other
      const lean = mix(mix(mix(-3, 13, out), 5, drop) * carry, 3 + 4 * r1, walk) + 0.4 * Math.sin(time * 1.1);
      you.lean(lean, 0, mix(0, 6 * r1, walk));
      for (const side of SIDES) {
        const press = side === "L" ? PRESSED : null;
        for (const key of KEYS) blend(key, side, out, drop, carry, walk, press);
        you.reach(side, T.t, T.bend, T);
        const cradle = (1 - out) * carry * (1 - walk);
        you.grip(side, mix(mix(mix(0.5, 0, out), 0.1, drop) * carry + 0.15 * (1 - carry), side === "L" ? mix(0.15, 0.05, r1) + 0.2 * r2 : 0.15, walk), mix(1.4, R, cradle));
      }
      // your legs: mid-step in the doorway, two steps to the box, standing there
      for (const side of SIDES) {
        const lift = 7 * Math.sin(Math.PI * clamp01(side === "L" ? spot * 2 : spot * 2 - 1)) * (spot > 0 && spot < 1 ? 1 : 0);
        foot.copy(LEGS.door[side].at).lerp(LEGS.box[side].at, walk);
        foot.y += lift;
        toe.copy(LEGS.door[side].toe).lerp(LEGS.box[side].toe, walk);
        you.leg(side, foot, FRONT, toe);
      }
      you.head.rotation.set(mix(mix(3, -2, out), 8, walk) * DEG, mix(0, 22 * r1 - 6 * r2, walk) * DEG, 0);
    }

    // the one the cylinder holds
    held.group.visible = who > 0.01;
    if (held.group.visible) {
      held.body.uniforms.uAmount.value = 0.9 * who;
      fx.heldHead.uniforms.uAmount.value = 0.9 * who;
      held.shadow.material.uniforms.uAmount.value = 0.45 * who;
    }
  }

  return { group, update, A, fx, you, held };
}
