// DOSSIER 032 — the place, seen like an X-ray: a public hall today, its emergency door, the crowd that pushes, you
// pressed against the door — and, at the same place (`era` 1), the same door in 1883 (Sunderland): the narrow stairs
// coming down to it, the door opening INWARD, held ajar by a bolt, children of glass packed on the steps (a
// reconstruction: no plan of Victoria Hall is used).
//
//   buildSalle() → { group, A, update(P, time, px) }
//   A   leaf    Object3D that moves with the door leaf: anything placed in it at the CLOSED-door coordinates of plan.js
//               swings with the door (world.js hangs the system's `root` there)
//       frame   Object3D on the frame (static): world.js hangs the system's `fixed` (the strike) there
//       you     { hip, chest, head } on your figure (the hip where it meets the bar) · sign (the pictogram's centre)
//       gap     1883: the gap between the ajar leaf and the latch jamb, at a child's height · top (1883: top of the stairs)
//   P   { era, shell, crowd, press, flow, you, push, swing, arcIn, arcOut, sign, outside, bolt, slip } (FIRST, world.js)
//
// How it is drawn (docs/journal/032-salle.md):
//   · No `glass` on the big flat faces (walls, leaf, stairs): seen edge-on its rim turns a wall into a white slab. They
//     are « panes » that only show face-on (|n·v|²), and fine lines carry the structure.
//   · Three layers of glass, one behind the other, ranked: YOU (shell, order 10, the brightest) · the FRONT ROW (seven
//     posed figures, order 12, pale) · the CROWD (39 figures instanced from three baked poses, order 14, the palest,
//     fading with distance). Each later shell is hidden behind the earlier ones: the crowd never veils you.
//   · The crowd is alive from frame 1: a surge runs from the back to the door (period 1.5 s, ∝ `press`), every figure
//     leaning into it; the leaf trembles a few millimetres. `flow` pours everyone out through the door, then away to +x.
//   · Nothing is allocated in `update` (16 calls per frame): scalars, preallocated objects, uniforms.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { solid, glow, lineMat, box, cyl, edgesOf, mergeGeometries } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { makeSurface } from "@kit/atmo.js";
import { rng } from "@kit/rng.js";
import { dressSalle } from "./habillage.js";
import { WALL, HALL, DOOR, SIGN, OUTSIDE, YOU, STAIR, AJAR, BAR, FACE } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);

/** Render order of the glass: what is drawn first is never hidden by what comes after (asShell). */
const ORDER = { you: 10, slip: 11, front: 12, crowd: 14, leaf: 24 };
/** The surge: one wave every 1.5 s, running from the back of the hall to the door. */
const SURGE = { w: (2 * Math.PI * 59) / 88.8, k: (2 * Math.PI) / 340 };
/** How far in front of your hip's centre its front is, leaning as you do (the hip meets the bar there). */
const HIP_DEPTH = 9.2;
const YOU_Z = FACE + BAR.out + BAR.r + HIP_DEPTH;
const YOU_LEAN = 16;

/* ───────────── materials ───────────── */

/** A pane: a flat face of the X-ray that shows face-on and vanishes edge-on (the opposite of `glass`: no slab). */
function pane(k, { color = BRAND.ink, front = false } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: front ? THREE.FrontSide : THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uK: { value: k }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uAmount; varying vec3 vN; varying vec3 vV;
      void main() {
        if (uAmount < 0.003) discard;
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        gl_FragColor = vec4(uColor * (uK * uAmount * f * f), 1.0);
      }`,
  });
}

/** A soft light laid on something (a pool on the floor, the glow of a doorway): `shape` says how it falls off in uv. */
function softLight(color, k, shape) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uK: { value: k }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uAmount; varying vec2 vUv;
      void main() {
        if (uAmount < 0.003) discard;
        vec2 q = vUv;
        float a = 0.0;
        ${shape}
        gl_FragColor = vec4(uColor * (uK * uAmount * clamp(a, 0.0, 1.0)), 1.0);
      }`,
  });
}

/** The glass of the crowd: `glass` (kit) read through each instance's matrix, its brightness in `instanceColor.r`. */
function crowdGlass({ rim = 0.24, power = 2.3, edge = 0.16, base = 0.0 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uBase: { value: base }, uRim: { value: rim }, uPower: { value: power }, uEdge: { value: edge }, uAmount: { value: 1 }, uNear: { value: new THREE.Vector2(70, 260) } },
    vertexShader: /* glsl */ `
      uniform vec2 uNear; varying vec3 vN; varying vec3 vV; varying float vK;
      void main() {
        vec4 p = vec4(position, 1.0);
        vec3 n = normal;
        #ifdef USE_INSTANCING
          p = instanceMatrix * p;
          n = mat3(instanceMatrix) * n;
        #endif
        vK = 1.0;
        #ifdef USE_INSTANCING_COLOR
          vK = instanceColor.r;
        #endif
        vec4 mv = modelViewMatrix * p;
        vK *= smoothstep(uNear.x, uNear.y, -mv.z); // the ones the camera brushes past vanish: never a wall of glass in front
        vN = normalize(normalMatrix * n);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uBase, uRim, uPower, uEdge, uAmount; varying vec3 vN; varying vec3 vV; varying float vK;
      void main() {
        if (uAmount < 0.003 || vK < 0.003) discard;
        float facing = dot(normalize(vN), normalize(vV));
        float g = clamp(1.0 - abs(facing), 0.0, 1.0);
        float light = uBase + uRim * pow(g, uPower) + uEdge * smoothstep(0.6, 0.97, g);
        gl_FragColor = vec4(uColor * light * uAmount * vK, 1.0);
      }`,
  });
}

/* ───────────── lines ───────────── */

/** A bundle of fine segments ([x0,y0,z0,x1,y1,z1]…), one draw. Its opacity is `mat.userData.base` × the place's shell. */
function lines(arr, { color = BRAND.ink, width = 2, opacity = 0.35, fog = true } = {}) {
  const g = new LineSegmentsGeometry();
  g.setPositions(arr);
  const obj = new LineSegments2(g, lineMat(color, width, { opacity, fog }));
  obj.renderOrder = 2;
  return obj;
}
const seg = (a, x0, y0, z0, x1, y1, z1) => a.push(x0, y0, z0, x1, y1, z1);
/** A rectangle in a plane of constant z. */
const rectZ = (a, x0, y0, x1, y1, z) => {
  seg(a, x0, y0, z, x1, y0, z);
  seg(a, x1, y0, z, x1, y1, z);
  seg(a, x1, y1, z, x0, y1, z);
  seg(a, x0, y1, z, x0, y0, z);
};
/** A rectangle lying at height y. */
const rectY = (a, x0, z0, x1, z1, y) => {
  seg(a, x0, y, z0, x1, y, z0);
  seg(a, x1, y, z0, x1, y, z1);
  seg(a, x1, y, z1, x0, y, z1);
  seg(a, x0, y, z1, x0, y, z0);
};

/* ───────────── the figures ───────────── */

/** Poses of the crowd (figure's own frame: it faces +z, +x its left): pressing on the back ahead of it. */
const POSES = [
  // 0 — both hands flat on the back ahead, leaning in
  (f) => {
    f.leg("L", V(8.6, 8, 10));
    f.leg("R", V(-8.6, 8, -14));
    f.lean(17, 0, 4);
    f.reach("L", V(15, 126, 33), V(0.8, -0.5, 0), { dir: V(0, 1, 0.25), palm: V(0, 0, 1) });
    f.reach("R", V(-16, 120, 34), V(-0.8, -0.5, 0), { dir: V(0, 1, 0.25), palm: V(0, 0, 1) });
  },
  // 1 — one arm up over the heads, the other pushing
  (f) => {
    f.leg("L", V(9, 8, -10));
    f.leg("R", V(-8, 8, 9));
    f.lean(11, -3, -8);
    f.reach("L", V(20, 186, 24), V(1, 0, -0.2), { dir: V(0, 1, 0.3), palm: V(0, 0, 1) });
    f.reach("R", V(-14, 124, 32), V(-0.8, -0.5, 0), { dir: V(0, 1, 0.3), palm: V(0, 0, 1) });
  },
  // 2 — elbows in, shoulder first, braced against the push
  (f) => {
    f.leg("L", V(10, 8, 4));
    f.leg("R", V(-10, 8, -16));
    f.lean(13, 4, 14);
    f.reach("L", V(10, 132, 22), V(1, -0.6, 0), { dir: V(0, 1, 0.2), palm: V(0, 0, 1) });
    f.reach("R", V(-11, 134, 21), V(-1, -0.6, 0), { dir: V(0, 1, 0.2), palm: V(0, 0, 1) });
  },
];

/** One baked pose: every mesh of a posed figure, in the figure's frame, merged (position, normal) — head and hands too. */
function bakePose(pose) {
  const f = makeFigure({ hands: "flat" });
  pose(f);
  f.group.updateMatrixWorld(true);
  const meshes = [];
  f.group.traverse((o) => {
    if (o.isMesh && !o.userData.shell && (o.material === f.body || o.material === f.flesh)) meshes.push(o);
  });
  let nv = 0;
  let ni = 0;
  for (const m of meshes) {
    nv += m.geometry.attributes.position.count;
    ni += m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count;
  }
  const pos = new Float32Array(nv * 3);
  const nrm = new Float32Array(nv * 3);
  const idx = new Uint32Array(ni);
  const v = new THREE.Vector3();
  const nm = new THREE.Matrix3();
  let ov = 0;
  let oi = 0;
  for (const m of meshes) {
    const g = m.geometry;
    const P = g.attributes.position;
    const N = g.attributes.normal;
    nm.getNormalMatrix(m.matrixWorld);
    for (let i = 0; i < P.count; i++) {
      v.fromBufferAttribute(P, i).applyMatrix4(m.matrixWorld);
      pos.set([v.x, v.y, v.z], (ov + i) * 3);
      v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize();
      nrm.set([v.x, v.y, v.z], (ov + i) * 3);
    }
    if (g.index) for (let j = 0; j < g.index.count; j++) idx[oi++] = g.index.array[j] + ov;
    else for (let j = 0; j < P.count; j++) idx[oi++] = ov + j;
    ov += P.count;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeBoundingSphere();
  return geo;
}

/** Where a figure is on its way out (`u` 0 at home → 1 gone): to its lane at the door, through it, then away to +x
 *  outside, clear of the open leaf. Writes OUT.x, OUT.z. */
const OUT = { x: 0, z: 0, yaw: 0 };
function placeOut(hx, hz, gx, r, u) {
  if (u < 0.4) {
    const s = u / 0.4;
    OUT.x = lerp(hx, gx, s);
    OUT.z = lerp(hz, 40, s);
    return;
  }
  // out into the light, in file, then fanning out a little to +x (the open leaf stands at +x, up to 1 m outside)
  const s = (u - 0.4) / 0.6;
  OUT.z = 40 - (420 + 120 * r) * s;
  OUT.x = lerp(gx, gx * 0.5, Math.min(1, s * 4)) + Math.max(0, s - 0.35) * Math.max(0, s - 0.35) * (180 + 260 * r);
}
/** The same, with the way the figure faces (toward where it goes). */
function walkOut(hx, hz, gx, r, u, homeYaw) {
  placeOut(hx, hz, gx, r, Math.min(1, u + 0.02));
  const nx = OUT.x;
  const nz = OUT.z;
  placeOut(hx, hz, gx, r, u);
  const dx = nx - OUT.x;
  const dz = nz - OUT.z;
  OUT.yaw = dx * dx + dz * dz > 0.01 ? Math.atan2(dx, dz) : homeYaw;
}
/** How far along its way out a figure is: the ones nearest the door (`o` 0) go first. */
const progress = (flow, o) => clamp01(flow * 2.2 - o * 1.2);

export function buildSalle() {
  const group = new THREE.Group();
  group.name = "salle";
  const placeLines = []; // line materials that fade with the place's shell
  const placePanes = []; // pane materials that fade with it
  const addLines = (parent, arr, o) => {
    const l = lines(arr, o);
    parent.add(l);
    placeLines.push(l.material);
    return l;
  };
  const addPane = (parent, geo, k, o) => {
    const mat = pane(k, o);
    const m = new THREE.Mesh(geo, mat);
    m.renderOrder = 3;
    parent.add(m);
    placePanes.push(mat);
    return m;
  };

  /* ── the floor: a grid, in the hall and outside ── */
  const floor = makeSurface({ radius: 1700, cell: 50, fade: 900 });
  group.add(floor.group);
  // matte and dark: a floor that mirrors the studio turns into a grey slab seen low (règles d'image)
  Object.assign(floor.group.children[0].material, { color: new THREE.Color(0x060708), roughness: 1, envMapIntensity: 0 });

  /* ── the wall of the door (both eras) ── */
  const wall = new THREE.Group();
  group.add(wall);
  const OX = DOOR.w / 2 + DOOR.frame; // the opening, frame included
  const OY = DOOR.h + DOOR.frame;
  const T = WALL.thick / 2;
  {
    const w = [];
    for (const z of [T, -T]) {
      seg(w, WALL.x0, 0, z, -OX, 0, z);
      seg(w, OX, 0, z, WALL.x1, 0, z);
      seg(w, WALL.x0, WALL.h, z, WALL.x1, WALL.h, z);
      seg(w, -OX, 0, z, -OX, OY, z);
      seg(w, -OX, OY, z, OX, OY, z);
      seg(w, OX, OY, z, OX, 0, z);
    }
    for (const [x, y] of [[-OX, 0], [-OX, OY], [OX, OY], [OX, 0], [WALL.x0, WALL.h], [WALL.x1, WALL.h]]) seg(w, x, y, T, x, y, -T);
    seg(w, -DOOR.w / 2, 0.3, 0, DOOR.w / 2, 0.3, 0); // the threshold
    addLines(wall, w, { opacity: 0.42, width: 2 });
    // its two faces: three panes each, around the opening
    for (const z of [T, -T]) {
      addPane(wall, new THREE.PlaneGeometry(-OX - WALL.x0, WALL.h).translate((WALL.x0 - OX) / 2, WALL.h / 2, z), 0.022);
      addPane(wall, new THREE.PlaneGeometry(WALL.x1 - OX, WALL.h).translate((WALL.x1 + OX) / 2, WALL.h / 2, z), 0.022);
      addPane(wall, new THREE.PlaneGeometry(2 * OX, WALL.h - OY).translate(0, (WALL.h + OY) / 2, z), 0.022);
    }
  }

  /* ── the hall of today: side walls, back wall, ceiling, panel joints ── */
  const today = new THREE.Group();
  group.add(today);
  const dress = dressSalle(); today.add(dress.group); // habillage.js: what the crowd runs from
  {
    const H = HALL.h;
    const X = HALL.half;
    const Z = HALL.depth;
    const w = [];
    for (const x of [-X, X]) {
      seg(w, x, 0, T, x, 0, Z);
      seg(w, x, H, T, x, H, Z);
      seg(w, x, 0, Z, x, H, Z);
    }
    seg(w, -X, 0, Z, X, 0, Z);
    seg(w, -X, H, Z, X, H, Z);
    addLines(today, w, { opacity: 0.3 });
    // the ceiling: rows of light panels, in lines; the joints of the wall's cladding
    const c = [];
    for (const x of [-560, -190, 190, 560]) for (const z of [230, 560, 890, 1220]) rectY(c, x - 70, z - 30, x + 70, z + 30, H - 0.5);
    for (let x = -760; x <= 760; x += 190) if (Math.abs(x) > OX + 20) seg(c, x, 0, T + 0.5, x, H, T + 0.5);
    seg(c, WALL.x0, 12, T + 0.5, -OX, 12, T + 0.5); // the skirting
    seg(c, OX, 12, T + 0.5, WALL.x1, 12, T + 0.5);
    addLines(today, c, { opacity: 0.2 });
    for (const x of [-X, X]) addPane(today, new THREE.PlaneGeometry(Z, H).rotateY(Math.PI / 2).translate(x, H / 2, Z / 2), 0.016);
    addPane(today, new THREE.PlaneGeometry(2 * X, H).translate(0, H / 2, Z), 0.012);
  }

  /* ── the frame (dormant): solid, dark, fine — it does not move ── */
  const frame = new THREE.Group();
  frame.name = "frame";
  group.add(frame);
  const frameMat = solid(0x5d5953, { rough: 0.5, metal: 0.3 });
  for (const [geo, x, y] of [
    [box(DOOR.frame, OY, DOOR.frameDepth, 0.6), -(DOOR.w + DOOR.frame) / 2, OY / 2],
    [box(DOOR.frame, OY, DOOR.frameDepth, 0.6), (DOOR.w + DOOR.frame) / 2, OY / 2],
    [box(2 * OX, DOOR.frame, DOOR.frameDepth, 0.6), 0, DOOR.h + DOOR.frame / 2],
  ]) {
    const m = new THREE.Mesh(geo, frameMat);
    m.position.set(x, y, 0);
    m.castShadow = true;
    m.receiveShadow = true;
    const e = edgesOf(geo, { opacity: 0.55, width: 1.8 });
    m.add(e);
    frame.add(m);
  }

  /* ── the leaf, on its hinge: today the axis is on the outside face, in 1883 on the room face ── */
  const hinge = new THREE.Group();
  group.add(hinge);
  const leaf = new THREE.Group();
  leaf.name = "leaf";
  hinge.add(leaf);
  const leafPane = pane(0.05);
  {
    const m = new THREE.Mesh(new THREE.BoxGeometry(DOOR.w, DOOR.h, DOOR.t).translate(0, DOOR.h / 2, 0), leafPane);
    m.renderOrder = ORDER.leaf;
    leaf.add(m);
    const w = [];
    const t = DOOR.t / 2;
    for (const z of [t, -t]) rectZ(w, -DOOR.w / 2, 0.4, DOOR.w / 2, DOOR.h, z);
    for (const [x, y] of [[-DOOR.w / 2, 0.4], [DOOR.w / 2, 0.4], [-DOOR.w / 2, DOOR.h], [DOOR.w / 2, DOOR.h]]) seg(w, x, y, t, x, y, -t);
    leaf.add((leaf.outline = lines(w, { opacity: 0.8, width: 2.2 })));
    // the kick plate, both faces
    const k = [];
    for (const z of [t + 0.3, -t - 0.3]) rectZ(k, -DOOR.w / 2 + 4, 3, DOOR.w / 2 - 4, 30, z);
    leaf.add((leaf.plate = lines(k, { opacity: 0.35, width: 1.8 })));
  }
  // the hinges (paumelles): three knuckles on the axis
  const knuckleMat = solid(0x7a766e, { rough: 0.45, metal: 0.4 });
  for (const y of [22, 105, 188]) {
    const m = new THREE.Mesh(cyl(1.5, 11, 0.3, 24), knuckleMat);
    m.position.set(0, y, 0);
    hinge.add(m);
  }

  /* ── 1883: the bolt, on the leaf's room face at its free edge, shot down into the floor ── */
  const boltG = new THREE.Group();
  leaf.add(boltG);
  const boltMat = solid(BRAND.signal, { rough: 0.45, metal: 0.25 });
  boltMat.emissive = SIGNAL.clone().multiplyScalar(0.35);
  const boltX = -DOOR.w / 2 + 6;
  const boltZ = DOOR.t / 2 + 2.6;
  const keeperMat = solid(0x4a4743, { rough: 0.55, metal: 0.3 });
  for (const y of [14, 30]) {
    const m = new THREE.Mesh(box(6, 4, 3.4, 0.4), keeperMat);
    m.position.set(boltX, y, boltZ - 1);
    boltG.add(m);
  }
  const rod = new THREE.Group();
  boltG.add(rod);
  {
    const r = new THREE.Mesh(cyl(1.4, 40, 0.3, 24), boltMat);
    r.position.y = 20;
    rod.add(r);
    const h = new THREE.Mesh(cyl(1.1, 8, 0.3, 16).rotateZ(Math.PI / 2), boltMat);
    h.position.set(-3.6, 36, 0);
    rod.add(h);
    const re = edgesOf(r.geometry, { color: BRAND.signal, opacity: 0.6, width: 1.8 });
    re.position.copy(r.position);
    rod.add(re);
  }
  rod.position.set(boltX, 0, boltZ);
  const boltSocket = new THREE.Mesh(new THREE.CircleGeometry(5, 32).rotateX(-Math.PI / 2), softLight(BRAND.signal, 1.6, "a = pow(clamp(1.0 - length(q - 0.5) * 2.0, 0.0, 1.0), 1.6);"));
  boltSocket.position.set(boltX, 0.6, boltZ);
  boltG.add(boltSocket);

  /* ── the exit sign above the door: a running figure toward a door, drawn, no text — veille ── */
  const signG = new THREE.Group();
  signG.position.set(SIGN.at[0], SIGN.at[1], SIGN.at[2]);
  group.add(signG);
  const signMat = glow(BRAND.veille, 1.5);
  const signPanel = new THREE.Mesh(new THREE.PlaneGeometry(SIGN.w, SIGN.h), signMat);
  signPanel.position.z = 2.2;
  signG.add(signPanel);
  {
    const housing = new THREE.Mesh(box(SIGN.w + 4, SIGN.h + 4, 4, 0.5), solid(0x2a2c2b, { rough: 0.6 }));
    signG.add(housing);
    const dark = new THREE.MeshBasicMaterial({ color: 0x06100b });
    const bar = (w, h, x, y, deg) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), dark);
      m.position.set(x, y, 2.4);
      m.rotation.z = deg * DEG;
      signG.add(m);
    };
    const u = SIGN.h / 22; // drawn on a 44 × 22 panel
    const head = new THREE.Mesh(new THREE.CircleGeometry(2.1 * u, 20), dark);
    head.position.set(-5 * u, 6.4 * u, 2.4);
    signG.add(head);
    bar(2.8 * u, 8 * u, -7 * u, 1.6 * u, -28); // the trunk, leaning toward the door
    bar(1.7 * u, 6.2 * u, -3.2 * u, 3 * u, -70); // the arm ahead
    bar(1.7 * u, 6.2 * u, -10.6 * u, 2.4 * u, 62); // the arm behind
    bar(2 * u, 7.6 * u, -4.4 * u, -4.4 * u, -38); // the leg ahead
    bar(2 * u, 7.6 * u, -11.4 * u, -4 * u, 52); // the leg behind
    // the door it runs to (open), at the right
    bar(1.5 * u, 15 * u, 8 * u, 0, 0);
    bar(1.5 * u, 15 * u, 16 * u, 0, 0);
    bar(9.5 * u, 1.5 * u, 12 * u, 6.8 * u, 0);
    bar(1.5 * u, 13 * u, 11 * u, -0.4 * u, 18);
  }
  // the green it throws on the wall around it
  const signHaloMat = softLight(BRAND.veille, 0.32, "a = pow(clamp(1.0 - length((q - 0.5) * vec2(2.0, 3.2)), 0.0, 1.0), 2.0);");
  const signHalo = new THREE.Mesh(new THREE.PlaneGeometry(130, 80), signHaloMat);
  signHalo.position.z = 0.2;
  signG.add(signHalo);

  /* ── outside: the light the open door lets in ── */
  const outPoolMat = softLight(BRAND.ink, 0.5, "a = pow(clamp(1.0 - length(q - 0.5) * 2.0, 0.0, 1.0), 1.5);");
  const outPool = new THREE.Mesh(new THREE.CircleGeometry(OUTSIDE.r, 64).rotateX(-Math.PI / 2), outPoolMat);
  outPool.position.set(OUTSIDE.at[0], 0.8, OUTSIDE.at[2]);
  group.add(outPool);
  // the glow in the doorway, seen from the hall only
  const doorGlowMat = softLight(BRAND.ink, 0.42, "a = (1.0 - smoothstep(0.25, 0.5, abs(q.x - 0.5))) * (0.45 + 0.55 * (1.0 - q.y));");
  doorGlowMat.side = THREE.FrontSide;
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(DOOR.w - 4, DOOR.h - 2).translate(0, DOOR.h / 2, -T - 1), doorGlowMat);
  group.add(doorGlow);
  // the patch it throws on the hall's floor, widening away from the door
  const beamMat = softLight(BRAND.ink, 0.2, "a = pow(clamp(1.0 - q.y, 0.0, 1.0), 1.6) * (1.0 - smoothstep(0.3, 0.5, abs(q.x - 0.5)));");
  const beam = new THREE.Mesh(
    (() => {
      const g = new THREE.BufferGeometry();
      const L = 380;
      g.setAttribute("position", new THREE.Float32BufferAttribute([-48, 0, 3, 48, 0, 3, 150, 0, L, -150, 0, L], 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
      g.setIndex([0, 2, 1, 0, 3, 2]);
      return g;
    })(),
    beamMat,
  );
  beamMat.side = THREE.DoubleSide;
  beam.position.y = 0.9;
  group.add(beam);

  /* ── the ghost leaves and their arcs on the floor: signal toward the hall, veille toward the exit ── */
  const arcPivot = new THREE.Group(); // at the hinge axis (moves with the era)
  group.add(arcPivot);
  const arcs = [];
  for (const [side, color] of [[1, BRAND.signal], [-1, BRAND.veille]]) {
    // the ribbon: a band around the hinge, between the leaf's width ± 2.5 cm, its angle (0 → 1 = 95°) in aA
    const N = 48;
    const P = [];
    const A = [];
    const S = [];
    const I = [];
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * DOOR.open * DEG;
      for (const [r, s] of [[DOOR.w - 2.5, -1], [DOOR.w + 2.5, 1]]) {
        P.push(-Math.cos(th) * r, 0, side * Math.sin(th) * r);
        A.push(i / N);
        S.push(s);
      }
      if (i < N) I.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute("aA", new THREE.Float32BufferAttribute(A, 1));
    g.setAttribute("aS", new THREE.Float32BufferAttribute(S, 1));
    g.setIndex(I);
    const bandMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uColor: { value: new THREE.Color(color) }, uK: { value: 0 }, uReveal: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aA; attribute float aS; varying float vA; varying float vS;
        void main() { vA = aA; vS = aS; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uK, uReveal; varying float vA; varying float vS;
        void main() {
          if (uK < 0.003 || vA > uReveal + 0.002) discard;
          float across = 1.0 - smoothstep(0.55, 1.0, abs(vS));
          float head = 0.6 + 0.4 * smoothstep(uReveal - 0.3, uReveal, vA);
          gl_FragColor = vec4(uColor * (1.5 * uK * across * head), 1.0);
        }`,
    });
    const band = new THREE.Mesh(g, bandMat);
    band.position.y = 0.7;
    band.renderOrder = 4;
    arcPivot.add(band);
    // its arrowhead, on the leaf's path at the tip of the ribbon
    const tipMat = glow(color, 1.6, { opacity: 0 });
    const tipShape = new THREE.Shape([new THREE.Vector2(0, 8), new THREE.Vector2(-5.5, -4), new THREE.Vector2(5.5, -4)]);
    const tip = new THREE.Mesh(new THREE.ShapeGeometry(tipShape).rotateX(-Math.PI / 2).rotateY(Math.PI), tipMat);
    tip.renderOrder = 4;
    arcPivot.add(tip);
    // the ghost leaf, pivoting on the axis
    const piv = new THREE.Group();
    arcPivot.add(piv);
    const ghostMat = pane(0.16, { color });
    const ghost = new THREE.Mesh(new THREE.BoxGeometry(DOOR.w, DOOR.h, 1.5).translate(-DOOR.w / 2, DOOR.h / 2, 0), ghostMat);
    ghost.renderOrder = 5;
    piv.add(ghost);
    const gl = [];
    rectZ(gl, -DOOR.w, 0.5, 0, DOOR.h, 0);
    const ghostLines = lines(gl, { color, opacity: 0, width: 2.4 });
    piv.add(ghostLines);
    arcs.push({ side, bandMat, tip, tipMat, piv, ghostMat, lineMat: ghostLines.material });
  }

  /* ── 1883: the stairs coming down to the door (a reconstruction) ── */
  const past = new THREE.Group();
  group.add(past);
  const TOPZ = STAIR.landing + STAIR.steps * STAIR.run;
  const TOPY = STAIR.steps * STAIR.rise;
  const SW = STAIR.half;
  {
    const treads = [];
    const n = [];
    const p = [];
    for (let i = 0; i < STAIR.steps; i++) {
      const z = STAIR.landing + i * STAIR.run;
      const y = (i + 1) * STAIR.rise;
      treads.push(new THREE.PlaneGeometry(2 * SW, STAIR.run).rotateX(-Math.PI / 2).translate(0, y, z + STAIR.run / 2));
      treads.push(new THREE.PlaneGeometry(2 * SW, STAIR.rise).translate(0, y - STAIR.rise / 2, z));
      seg(n, -SW, y, z, SW, y, z); // the nosing: the rhythm that says « stairs »
      for (const x of [-SW, SW]) {
        seg(p, x, y - STAIR.rise, z, x, y, z);
        seg(p, x, y, z, x, y, z + STAIR.run);
      }
    }
    treads.push(new THREE.PlaneGeometry(2 * SW, 160).rotateX(-Math.PI / 2).translate(0, TOPY, TOPZ + 80));
    seg(n, -SW, TOPY, TOPZ + 160, SW, TOPY, TOPZ + 160);
    addPane(past, mergeGeometries(treads), 0.022);
    addLines(past, n, { opacity: 0.62, width: 2.2 });
    // the two walls of the stairwell, their handrails, their tops
    const wl = [];
    const WH = TOPY + 240;
    for (const x of [-SW, SW]) {
      seg(wl, x, 0, T, x, 0, STAIR.landing);
      seg(wl, x, TOPY, TOPZ, x, TOPY, TOPZ + 160);
      seg(wl, x, WH, T, x, WH, TOPZ + 160);
      seg(wl, x, 90, T, x, 90, STAIR.landing);
      seg(wl, x, 90, STAIR.landing, x, TOPY + 90, TOPZ);
      seg(wl, x, TOPY + 90, TOPZ, x, TOPY + 90, TOPZ + 160);
      seg(wl, x, 0, T, x, WH, T);
      seg(wl, x, TOPY, TOPZ + 160, x, WH, TOPZ + 160);
    }
    addLines(past, p, { opacity: 0.4 });
    addLines(past, wl, { opacity: 0.32 });
    for (const x of [-SW, SW]) addPane(past, new THREE.PlaneGeometry(TOPZ + 160 - T, WH).rotateY(Math.PI / 2).translate(x, WH / 2, (TOPZ + 160 + T) / 2), 0.02);
  }

  /* ── YOU: a figure of glass pressed against the leaf, chest on it, arms caught, hip on the bar ── */
  const you = makeFigure({ shell: true, hands: "flat", order: ORDER.you, glassK: 1.25, spec: 0.45, through: 0.14 });
  you.ghost(true);
  you.leg("L", V(9, 8, -6));
  you.leg("R", V(-9.5, 8, -16), V(0, 0, 1), V(-0.2, 0, 1));
  you.lean(YOU_LEAN, 4, 10);
  you.head.position.set(4.5, 166.5 - 90, -7.5); // cheek to the glass, turned aside
  you.reach("L", V(23, 180, 18.5), V(1, -0.2, -0.3), { dir: V(0.1, 1, 0), palm: V(0, 0, 1) }); // flat on the glass, high
  you.reach("R", V(-36, 128, 18.5), V(-1, -0.4, -0.4), { dir: V(-0.2, 1, 0), palm: V(0, 0, 1) }); // pinned, elbow out
  you.group.rotation.y = YOU.face;
  group.add(you.group);
  const A = {
    leaf,
    frame,
    you: { hip: new THREE.Object3D(), chest: new THREE.Object3D(), head: new THREE.Object3D() },
    sign: signG,
    gap: new THREE.Object3D(),
    top: new THREE.Object3D(),
  };
  A.you.hip.position.set(0, BAR.y, HIP_DEPTH);
  you.group.add(A.you.hip);
  A.you.chest.position.set(0, 128 - 90, 10);
  you.torso.add(A.you.chest);
  you.head.add(A.you.head);
  {
    // the gap: between the latch jamb and the free edge of the leaf held ajar, at a child's height
    const th = AJAR.deg * DEG;
    const fx = DOOR.hingeX - Math.cos(th) * DOOR.w;
    const fz = DOOR.t / 2 + Math.sin(th) * DOOR.w;
    A.gap.position.set((DOOR.latchX + fx) / 2, 100 * AJAR.child, fz / 2);
  }
  A.top.position.set(0, TOPY + 120, TOPZ + 60);
  group.add(A.gap, A.top);

  /* ── the FRONT ROW: seven posed figures (today behind you; in 1883 children packed on the landing) ── */
  const front = [];
  const FRONT_TODAY = [[-26, 64, 0], [14, 70, 0], [52, 62, 2], [90, 76, 1], [-6, 110, 1], [34, 112, 0], [74, 120, 2]];
  const FRONT_1883 = [[40, 20, 0], [16, 30, 2], [-6, 40, 0], [60, 42, 1], [36, 50, 0], [12, 58, 2], [-16, 62, 0]];
  for (let i = 0; i < FRONT_TODAY.length; i++) {
    const f = makeFigure({ shell: true, hands: "flat", order: ORDER.front, glassK: 0.42, spec: 0, through: 0.06 });
    f.ghost(true);
    POSES[FRONT_TODAY[i][2]](f);
    f.group.rotation.order = "YXZ";
    group.add(f.group);
    const [hx, hz] = FRONT_TODAY[i];
    const d = Math.hypot(hx, hz);
    front.push({ f, hx, hz, d, yaw: Math.atan2(-hx, -hz), o: 0.03 + i * 0.025, gx: Math.max(-28, Math.min(28, hx * 0.3)), r: (i * 0.37) % 1, cx: FRONT_1883[i][0], cz: FRONT_1883[i][1] });
  }

  /* ── 1883: the one child who slips through the gap ── */
  const slipper = makeFigure({ shell: true, hands: "flat", order: ORDER.slip, glassK: 1.15, spec: 0.3, through: 0.1 }); // the one the sentence is about: the brightest child
  slipper.ghost(true);
  slipper.leg("L", V(8.6, 8, 9));
  slipper.leg("R", V(-8.6, 8, -11));
  slipper.lean(8, 0, 0);
  slipper.reach("L", V(22, 98, 6), V(1, -0.4, 0), { dir: V(0, -0.3, 1), palm: V(-1, 0, 0) });
  slipper.reach("R", V(-20, 100, 10), V(-1, -0.4, 0), { dir: V(0, -0.3, 1), palm: V(1, 0, 0) });
  slipper.group.scale.setScalar(AJAR.child);
  slipper.group.rotation.order = "YXZ";
  group.add(slipper.group);
  const SLIP = [[-36, 64], [-46, 34], [-43, 8], [-36, -90]]; // from the landing, through the gap, out

  /* ── the CROWD: 39 figures, three baked poses, instanced; one shell (its own depth layer, instanced too) ── */
  const crowdMat = crowdGlass({ rim: 0.15, edge: 0.1 });
  const holdMat = Object.assign(crowdMat.clone(), { uniforms: crowdMat.uniforms, colorWrite: false, depthWrite: true, blending: THREE.NoBlending });
  const rand = rng(32);
  const back = [];
  {
    // today: a funnel — tight at the door, looser and wider at the back; the latch-side corner by the door kept clear
    const ROWS = [[150, 3, 95], [200, 4, 125], [258, 4, 160], [322, 4, 195], [392, 5, 235], [470, 5, 280], [556, 5, 330], [650, 5, 385], [752, 4, 440]];
    for (const [z, n, hw] of ROWS) {
      const x0 = z < 220 ? -40 : -hw;
      const x1 = hw;
      for (let j = 0; j < n; j++) {
        const hx = lerp(x0, x1, (j + 0.5) / n) + (rand() - 0.5) * 0.45 * ((x1 - x0) / n);
        const hz = z + (rand() - 0.5) * 26;
        back.push({ hx, hz, p: Math.floor(rand() * 3), r: rand(), ph: rand() * 1.2 });
      }
    }
    // 1883: three abreast on the first thirteen steps, facing down to the door
    let k = 0;
    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < 3 && k < back.length; j++, k++) {
        const b = back[k];
        b.cx = [-46, 0, 46][j] + (i % 2 ? 8 : -8) + (rand() - 0.5) * 8;
        b.cz = STAIR.landing + i * STAIR.run + STAIR.run / 2 + (rand() - 0.5) * 6;
        b.cy = (i + 1) * STAIR.rise;
        b.row = i;
      }
    }
  }
  let maxD = 0;
  for (const b of back) {
    b.d = Math.hypot(b.hx, b.hz);
    maxD = Math.max(maxD, b.d);
    b.yaw = Math.atan2(-b.hx, -b.hz);
    b.gx = Math.max(-30, Math.min(30, b.hx * 0.12)) + (b.r - 0.5) * 16;
  }
  for (const b of back) b.o = 0.15 + 0.85 * (b.d - 140) / (maxD - 140);
  const poseGeos = POSES.map(bakePose);
  const crowdMeshes = [];
  for (let p = 0; p < 3; p++) {
    const list = back.filter((b) => b.p === p);
    list.forEach((b, j) => (b.slot = j));
    const n = Math.max(1, list.length);
    const m = new THREE.InstancedMesh(poseGeos[p], crowdMat, n);
    const h = new THREE.InstancedMesh(poseGeos[p], holdMat, n);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    h.instanceMatrix = m.instanceMatrix;
    m.count = h.count = list.length;
    for (let j = 0; j < n; j++) m.setColorAt(j, INK);
    m.renderOrder = ORDER.crowd;
    h.renderOrder = ORDER.crowd - 1;
    m.frustumCulled = h.frustumCulled = false;
    group.add(h, m);
    crowdMeshes.push(m, h);
    for (const b of list) b.mesh = m;
  }
  const dummy = new THREE.Object3D();
  dummy.rotation.order = "YXZ";
  const shade = new THREE.Color();
  let lastEra = -1;
  let lastFlow = 0;

  return {
    group,
    A,
    update(P, time, px) {
      const era = (P.era ?? 0) > 0.5 ? 1 : 0;
      const shell = clamp01(P.shell ?? 1);
      const press = clamp01(P.press ?? 0);
      const crowdK = clamp01(P.crowd ?? 0);
      const flow = era ? 0 : clamp01(P.flow ?? 0);
      const swing = clamp01(P.swing ?? 0);

      /* the place */
      today.visible = era === 0 && shell > 0.01;
      if (today.visible) dress.update(P, time, px); // the dressing of today (habillage.js): the threat at the back, the smoke
      past.visible = era === 1 && shell > 0.01;
      wall.visible = shell > 0.01;
      for (let i = 0; i < placeLines.length; i++) placeLines[i].opacity = placeLines[i].userData.base * shell;
      for (let i = 0; i < placePanes.length; i++) placePanes[i].uniforms.uAmount.value = shell;
      floor.grid.uAmount.value = (era ? 0.08 : 0.15) * (0.35 + 0.65 * shell);
      const leafK = 0.35 + 0.65 * shell;
      leafPane.uniforms.uAmount.value = leafK;
      leaf.outline.material.opacity = 0.8 * leafK;
      leaf.plate.material.opacity = 0.35 * leafK;

      /* the leaf: outward today (the axis on the outside face), inward in 1883 (on the room face), never less than the
         bolt holds it; under the press it trembles a few millimetres in its frame, with the surge that reaches it */
      const hz = era ? DOOR.t / 2 : -DOOR.t / 2;
      hinge.position.set(DOOR.hingeX, 0, hz);
      leaf.position.set(-DOOR.hingeX, 0, -hz);
      const atDoor = Math.sin(SURGE.w * time + SURGE.k * 40);
      const tremble = press * (0.12 + 0.18 * Math.max(0, atDoor)) * Math.sin((time * (2 * Math.PI * 444)) / 88.8) * (1 - swing);
      const bolt = clamp01(P.bolt ?? 0);
      hinge.rotation.y = era ? Math.max(AJAR.deg * bolt, DOOR.open * swing) * DEG + tremble * 0.3 * DEG : -(DOOR.open * swing + tremble) * DEG;
      boltG.visible = era === 1 && bolt > 0.01;
      rod.position.y = 12 * (1 - smooth(0.3, 1, bolt)) - 6 * smooth(0.3, 1, bolt);
      boltSocket.material.uniforms.uAmount.value = smooth(0.6, 1, bolt);

      /* the ghosts and their arcs */
      arcPivot.position.set(DOOR.hingeX, 0, hz);
      for (let i = 0; i < arcs.length; i++) {
        const a = arcs[i];
        const k = clamp01(a.side > 0 ? P.arcIn ?? 0 : P.arcOut ?? 0);
        const on = Math.min(1, k * 5);
        const th = DOOR.open * k * DEG;
        a.bandMat.uniforms.uK.value = on;
        a.bandMat.uniforms.uReveal.value = k;
        a.piv.rotation.y = a.side * th;
        a.piv.visible = k > 0.003;
        a.ghostMat.uniforms.uAmount.value = on;
        a.lineMat.opacity = 0.85 * on;
        // the arrowhead rides the free edge's path, pointing along it
        a.tip.visible = k > 0.003;
        a.tip.position.set(-Math.cos(th) * DOOR.w, 0.9, a.side * Math.sin(th) * DOOR.w);
        a.tip.rotation.y = Math.atan2(Math.sin(th), a.side * Math.cos(th));
        a.tipMat.opacity = on;
      }

      /* the sign, the light outside (today only) */
      const sign = era ? 0 : clamp01(P.sign ?? 0);
      signG.visible = era === 0 && shell > 0.01;
      signMat.color.copy(VEILLE).multiplyScalar(0.25 + 1.3 * sign);
      signHaloMat.uniforms.uAmount.value = sign;
      const outside = era ? 0 : clamp01(P.outside ?? 0);
      outPoolMat.uniforms.uAmount.value = outside;
      doorGlowMat.uniforms.uAmount.value = outside * smooth(0.02, 0.3, swing);
      beamMat.uniforms.uAmount.value = outside * smooth(0.05, 0.5, swing);

      /* you: hip on the bar (it follows the bar's stroke), a centimetre of the surge, and out first when the crowd flows */
      const youK = era ? 0 : clamp01(P.you ?? 0);
      you.group.visible = youK > 0.01;
      you.body.uniforms.uAmount.value = youK;
      if (youK > 0.01) {
        const surgeYou = press * 2.4 * Math.sin(SURGE.w * time + SURGE.k * 30);
        const stumble = 34 * smooth(0, 0.6, swing);
        let x = YOU.at[0];
        let z = YOU_Z - BAR.stroke * clamp01(P.push ?? 0) - surgeYou - stumble;
        let yaw = YOU.face;
        const u = progress(flow, 0);
        if (u > 0) {
          walkOut(x, z, 0, 0.5, u, yaw);
          x = OUT.x;
          z = OUT.z;
          yaw = OUT.yaw;
        }
        you.group.position.set(x, 0, z);
        you.group.rotation.y = yaw;
      }

      /* the front row */
      const lastEraChanged = era !== lastEra;
      const flowing = flow > 0 || lastFlow > 0;
      for (let i = 0; i < front.length; i++) {
        const F = front[i];
        const g = F.f.group;
        g.visible = crowdK > 0.01;
        F.f.body.uniforms.uAmount.value = crowdK;
        const lit = era ? 0 : smooth(0.33, 0.6, progress(flow, F.o)); // brighter once out in the light
        F.f.body.uniforms.uRim.value = era ? 0.32 : 0.18 + 0.2 * lit;
        F.f.body.uniforms.uEdge.value = era ? 0.26 : 0.15 + 0.15 * lit;
        if (!g.visible) continue;
        const w = Math.sin(SURGE.w * time + SURGE.k * F.d + i * 0.4);
        if (era) {
          g.scale.setScalar(AJAR.child);
          g.position.set(F.cx, 0, F.cz - press * (1.5 + 1.5 * w));
          g.rotation.set((3 + 2 * w) * press * DEG, Math.PI + (F.cx - 20) * 0.004, 0);
        } else {
          g.scale.setScalar(1);
          const u = progress(flow, F.o);
          const d = press * 9 * w + 22 * smooth(0, 0.6, swing);
          let x = F.hx - (F.hx / F.d) * d;
          let z = F.hz - (F.hz / F.d) * d;
          let yaw = F.yaw;
          if (u > 0) {
            walkOut(x, z, F.gx, F.r, u, yaw);
            x = OUT.x;
            z = OUT.z;
            yaw = OUT.yaw;
          }
          g.position.set(x, u > 0.02 ? 1.4 * Math.abs(Math.sin(time * 6 + i)) : 0, z);
          g.rotation.set((1 - u) * (4 * w) * press * DEG, yaw, 0);
        }
      }

      /* the child who slips through (1883) */
      const slipK = era ? crowdK : 0;
      slipper.group.visible = slipK > 0.01;
      slipper.body.uniforms.uAmount.value = slipK;
      if (slipK > 0.01) {
        const s = clamp01(P.slip ?? 0) * 3;
        const k = Math.min(2, Math.floor(s));
        const f = s - k;
        const x = lerp(SLIP[k][0], SLIP[k + 1][0], f);
        const z = lerp(SLIP[k][1], SLIP[k + 1][1], f);
        const squeeze = Math.sin(Math.PI * clamp01((s - 0.6) / 1.5));
        slipper.group.position.set(x, 0, z);
        slipper.group.rotation.set(4 * DEG, Math.PI - 55 * DEG * squeeze, 0);
      }

      /* the crowd */
      crowdMat.uniforms.uAmount.value = crowdK;
      // in 1883 the children are the subject: brighter than today's crowd, which stays the palest glass of the hall
      crowdMat.uniforms.uRim.value = era ? 0.27 : 0.15;
      crowdMat.uniforms.uEdge.value = era ? 0.18 : 0.1;
      for (let i = 0; i < crowdMeshes.length; i++) crowdMeshes[i].visible = crowdK > 0.01;
      if (crowdK > 0.01) {
        for (let i = 0; i < back.length; i++) {
          const b = back[i];
          const w = Math.sin(SURGE.w * time + SURGE.k * b.d + b.ph);
          if (era) {
            dummy.position.set(b.cx, b.cy, b.cz - press * (1 + w));
            dummy.rotation.set((4 + 3 * w) * press * DEG, Math.PI + b.cx * 0.002, 0);
            dummy.scale.setScalar(AJAR.child);
          } else {
            const u = progress(flow, b.o);
            const d = press * 20 * w + 14 * smooth(0, 0.6, swing);
            let x = b.hx - (b.hx / b.d) * d;
            let z = b.hz - (b.hz / b.d) * d;
            let yaw = b.yaw;
            if (u > 0) {
              walkOut(x, z, b.gx, b.r, u, yaw);
              x = OUT.x;
              z = OUT.z;
              yaw = OUT.yaw;
            }
            dummy.position.set(x, u > 0.02 ? 1.6 * Math.abs(Math.sin(time * 6 + i)) : 0, z);
            dummy.rotation.set((1 - u) * (3 + 5 * w) * press * DEG, yaw, 0);
            dummy.scale.setScalar(1);
          }
          dummy.updateMatrix();
          b.mesh.setMatrixAt(b.slot, dummy.matrix);
          if (lastEraChanged || flowing) {
            // the far ones paler: today by their distance to the door, in 1883 by their step; once out in the light,
            // brighter (pale glass on a lit floor vanishes)
            const out = era ? 0 : smooth(0.33, 0.6, progress(flow, b.o));
            const k = era ? 1 - 0.03 * b.row : (1 - 0.55 * clamp01((b.d - 150) / 650)) * (1 + 1.6 * out);
            b.mesh.setColorAt(b.slot, shade.setScalar(k));
          }
        }
        for (let i = 0; i < crowdMeshes.length; i += 2) {
          crowdMeshes[i].instanceMatrix.needsUpdate = true;
          if (lastEraChanged || flowing) crowdMeshes[i].instanceColor.needsUpdate = true;
        }
        lastEra = era;
        lastFlow = flow;
      }
    },
  };
}

