// DOSSIER 032 — the system: the panic bar and its lock (EN 1125, a rim device with an END box), SOLID.
//
//   buildSystem() → { root, fixed, A, parts, update(P, time, px) }
//   root    everything that moves with the LEAF (the bar on its two arms, the pivot bracket, the box and its cover,
//           the bolt, the spring, the load arrows, the ghost hand; on the bench the « slab », a section of the leaf) —
//           written in the CLOSED-door coordinates of plan.js: world.js hangs it on salle.A.leaf, or on the bench
//   fixed   what stays on the FRAME: the strike (gâche) and, on the bench, a section of the jamb
//   A       anchors: bar, barEnd, pivot, box, pene, gache, spring, hand, centre
//   parts   { bar, arms, bracket, box, cover, pene, spring, gache, slab } — each with ITS OWN materials
//   P       { bench, slab, explode, push, pene, see, load, jam, ghost, hand, tapAt,
//             litBar, litPivot, litBox, litPene, litGache, litSpring }   (meaning: FIRST, in world.js)
//
// THE MECHANISM, as built (docs/journal/032-model.md). Both arms turn about ONE axis along x, above the bar
// (y 101.5, z 6): they hang forward and down to the bar, so pushing the bar swings it back toward the face AND a little
// down — a lever. The hinge-end arm turns on an axle held by the clevis (bracket: two cheeks, an axle, two washers);
// the box-end arm's axle enters the box through its end and carries the CAM inside. In the box, along the bolt's axis:
// the bolt (pêne, a latch bolt, its bevel facing outside) and its short tail · the COLLAR, the rod and the crosshead
// that the cam drives (they follow `push`) · the return SPRING between the collar and a fixed bulkhead (it squeezes
// with `push`). `pene` moves the bolt alone: pushed while jammed, a gap opens between the bolt's tail and the collar —
// the lever pulls, the bolt stays caught — until `pene` lets it go.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, box, cyl, lathe, plate, makePart, addMesh, setPartOpacity, edgesOf, mergeGeometries } from "@kit/build3d.js";
import { DOOR, FACE, BAR, BOX, PENE, GACHE, SYSTEM } from "./plan.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => x * x * (3 - 2 * x);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles — parts have weight
const settle = (u) => ease(u) + Math.sin(Math.PI * u) * Math.sin(Math.PI * u) * 0.055 * (u > 0.5 ? 1 : 0.25);

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HALF = Math.PI / 2;

/* ── the geometry of the lever (scene cm) ── */
const AXIS = { y: 101.5, z: 6 }; //            the arms' common axis (along x)
const BARZ = FACE + BAR.out; //               13.5: the bar's axis at rest
const ARMV = { dy: BAR.y - AXIS.y, dz: BARZ - AXIS.z }; // from the axis to the bar's axis
const ARMLEN = Math.hypot(ARMV.dy, ARMV.dz);
// the turn that brings the bar `stroke` closer to the face: −dy·sinθ + dz·cosθ = dz − stroke
const PHI = Math.atan2(-ARMV.dy, ARMV.dz);
const THETA = Math.acos((ARMV.dz - BAR.stroke) / ARMLEN) - PHI;
const BX0 = -25.8; //                          the tube (the end caps beyond)
const BX1 = 42.6;
const ARMX = [-26.6, 40];
/* ── the box (end box at the latch end) ── */
const BOXC = [BOX.at[0], 97, FACE + 3.5]; //    centre; 20 × 13 × 7 (a little taller than plan.js: the axle and the cam)
const BOXS = [BOX.size[0], 13, BOX.size[2]];
const BOXZ0 = FACE + 1.2; //                   the cover sits on the base plate
const BULK = -35; //                           the spring's fixed seat
const COLLAR = -43.6; //                       at rest (it travels +4 with push)
const TRAVEL = 4;
const PZ = PENE.z;
const PY = PENE.y;

/** A ball of light with no edge: brightest where it faces the eye, nothing at its rim. */
function softGlow(power = 2.2) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uPower: { value: power } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * f, 1.0);
      }`,
  });
}
function halo(r, power = 2.2) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), softGlow(power));
  m.renderOrder = 6;
  m.visible = false;
  return m;
}

/** A light running along the bar: a faint trail behind a bright head (local x of the sleeve = scene x). */
function sleeveMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uHead: { value: 0 }, uHeadK: { value: 0 }, uTrail: { value: 0 } },
    vertexShader: /* glsl */ `
      varying float vX; varying vec3 vN; varying vec3 vV;
      void main() {
        vX = position.x;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uHead, uHeadK, uTrail; varying float vX; varying vec3 vN; varying vec3 vV;
      void main() {
        float facing = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float behind = smoothstep(uHead + 1.5, uHead - 1.5, vX);
        float q = (vX - uHead) / 2.6;
        float head = uHeadK * exp(-q * q);
        float a = (uTrail * behind + head) * (0.3 + 0.7 * facing);
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
  });
}

/** A helix along −x from x = 0, `len` long: a real coil of wire (a tube on a spiral). */
class Helix extends THREE.Curve {
  constructor(len, r, turns) {
    super();
    Object.assign(this, { len, r, turns });
  }
  getPoint(t, target = new THREE.Vector3()) {
    const a = t * this.turns * Math.PI * 2;
    return target.set(-t * this.len, this.r * Math.cos(a), this.r * Math.sin(a));
  }
}

/** A capsule of radius `r`, `len` long between its two centres, along y from 0. */
function capsule(r, len, r1 = r) {
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const a = -HALF + (i / 8) * HALF;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * HALF;
    pts.push([r1 * Math.cos(a), len + r1 * Math.sin(a)]);
  }
  pts[0][0] = 0;
  pts[pts.length - 1][0] = 0;
  return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(Math.max(0, x), y)), 20);
}
/** That geometry turned so that its y axis points along `dir`, and moved to `at`. */
function along(geo, dir, at) {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize());
  return geo.applyQuaternion(q).translate(...at);
}

/** An outline in the (x, z) plane, given a height along y (centred on y = 0). */
function slabXZ(points, h, bevel = 0.25) {
  return plate(points, h, { bevel, round: 2 }).rotateX(HALF).translate(0, h / 2, 0);
}

export function buildSystem() {
  const root = new THREE.Group();
  root.name = "system";
  const fixed = new THREE.Group();
  fixed.name = "system-fixed";

  // three greys, metal ≤ 0.5: the bar the lightest (the hero), the bolt light (its bevel reads), the strike cast dark
  const M = {
    bar: () => solid(0xcdc8be, { rough: 0.3, metal: 0.45 }),
    cap: () => solid(0xa49f96, { rough: 0.38, metal: 0.4 }),
    arm: () => solid(0x8d887f, { rough: 0.42, metal: 0.4 }),
    dark: () => solid(0x4a4743, { rough: 0.62, metal: 0.3 }),
    cover: () => solid(0x5f5b55, { rough: 0.64, metal: 0.2, env: 0.6 }),
    pin: () => solid(0xb9b4ab, { rough: 0.3, metal: 0.45 }),
    pene: () => solid(0xd8d3c9, { rough: 0.26, metal: 0.42 }),
    gache: () => solid(0x3c3a37, { rough: 0.74, metal: 0.22, double: true }),
    steel: () => solid(0xb3aea5, { rough: 0.34, metal: 0.45 }),
    inner: () => solid(0x8a857d, { rough: 0.45, metal: 0.35 }),
  };
  const screw = (part, mat, x, y, z, r = 0.55) =>
    addMesh(part, lathe([[0, 0], [r, 0], [r, 0.18], [r * 0.7, 0.42], [0, 0.48]], 24, { bevel: 0.05 }).rotateX(HALF), mat, { pos: [x, y, z], edgeOpacity: 0.5 });

  /* ───────── the lever: the bar on its two arms, turning about AXIS ───────── */
  const lever = new THREE.Group(); // origin on the axis; its children in the lever's frame (y, z from the axis)
  const leverMove = new THREE.Group(); // the exploded offset
  leverMove.add(lever);
  root.add(leverMove);
  lever.position.set(0, AXIS.y, AXIS.z);
  const BY = ARMV.dy;
  const BZ = ARMV.dz;

  const bar = makePart("bar");
  const barMat = M.bar();
  addMesh(bar, cyl(BAR.r, BX1 - BX0, 0.12, 56).rotateZ(-HALF), barMat, { pos: [(BX0 + BX1) / 2, BY, BZ] });
  const capMat = M.cap();
  const capProfile = [[0, 0], [2.35, 0], [2.35, 1.1], [2.05, 1.45], [1.35, 1.85], [0, 1.95]];
  addMesh(bar, lathe(capProfile, 48, { bevel: 0.12, round: 2 }).rotateZ(-HALF), capMat, { pos: [BX1, BY, BZ] });
  addMesh(bar, lathe(capProfile, 48, { bevel: 0.12, round: 2 }).rotateZ(HALF), capMat, { pos: [BX0, BY, BZ] });
  lever.add(bar);

  const arms = makePart("arms");
  const armMat = M.arm();
  const armA = Math.atan2(BZ, BY); // turns the y axis onto the arm
  for (const x of ARMX) {
    addMesh(arms, box(1.6, ARMLEN, 2.8, 0.45).rotateX(armA).translate(0, BY / 2, BZ / 2), armMat, { pos: [x, 0, 0] });
    addMesh(arms, cyl(1.7, 1.4, 0.18, 36).rotateZ(-HALF), armMat, { pos: [x, 0, 0] }); // the hub on the axle
    addMesh(arms, cyl(2.65, 2.2, 0.22, 44).rotateZ(-HALF), armMat, { pos: [x + (x < 0 ? 0.4 : 0), BY, BZ] }); // the boss round the bar
  }
  lever.add(arms);

  // the light that runs along the bar (`litBar`)
  const sleeveMat = sleeveMaterial();
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(BAR.r * 1.07, BAR.r * 1.07, BX1 - BX0, 40, 1, true).rotateZ(-HALF).translate((BX0 + BX1) / 2, 0, 0), sleeveMat);
  sleeve.position.set(0, BY, BZ);
  sleeve.renderOrder = 5;
  sleeve.visible = false;
  lever.add(sleeve);
  const barHalo = halo(3.2, 2.0);
  lever.add(barHalo);

  /* ── the ghost hand (the fall: « tu pousses, n'importe où ») — glass, palm on the bar, it follows the bar ── */
  const handG = new THREE.Group();
  lever.add(handG);
  const handMat = glass(BRAND.ink, { base: 0.03, rim: 0.85, power: 2.2, edge: 0.8, spec: 0.5, through: 0.15 });
  const handMeshes = [];
  const handAdd = (geo) => {
    const m = new THREE.Mesh(geo, handMat);
    handG.add(m);
    handMeshes.push(m);
  };
  {
    // in the hand's frame: palm facing −z (against the bar), fingers up, the wrist under it, the forearm down and back
    const outline = [[-3.6, -4.6], [3.4, -4.6], [4.1, -1.0], [4.0, 3.8], [-4.0, 3.9], [-4.3, -1.0]];
    handAdd(plate(outline, 2.5, { bevel: 1.05, round: 3 }).translate(0, 0, BAR.r + 0.35));
    const fingers = [[-2.95, 3.6, 6.6, 0.88], [-0.98, 4.0, 7.4, 0.95], [1.0, 3.9, 7.0, 0.93], [2.95, 3.4, 5.6, 0.82]];
    for (const [x, y, len, r] of fingers) handAdd(along(capsule(r, len, r * 0.88), [x * 0.03, 1, -0.22], [x, y, BAR.r + 1.45]));
    handAdd(along(capsule(1.15, 5.0, 1.0), [-1, 0.75, -0.25], [-3.6, -2.4, BAR.r + 1.6])); // the thumb, toward the box
    handAdd(along(capsule(2.7, 21, 3.3), [0, -0.5, 0.86], [0, -4.4, BAR.r + 1.8])); // wrist and forearm
  }
  asShell(handMeshes, 22);
  const palm = new THREE.Object3D();
  palm.position.set(0, 0, BAR.r + 1.6);
  handG.add(palm);

  /* ───────── the pivot bracket (chape) at the hinge end ───────── */
  const bracketMove = new THREE.Group();
  root.add(bracketMove);
  const bracket = makePart("bracket");
  const brDark = M.dark();
  const brPin = M.pin();
  addMesh(bracket, box(7, 13.5, 1.2, 0.3), brDark, { pos: [ARMX[1], 99.5, FACE + 0.6] });
  for (const x of [ARMX[1] - 1.3, ARMX[1] + 1.3]) addMesh(bracket, box(1, 7.2, 5.6, 0.42), brDark, { pos: [x, AXIS.y - 0.4, FACE + 1.2 + 2.8] });
  addMesh(bracket, cyl(0.62, 5.2, 0.1, 24).rotateZ(-HALF), brPin, { pos: [ARMX[1], AXIS.y, AXIS.z] }); // the axle
  addMesh(bracket, cyl(1.12, 0.45, 0.12, 32).rotateZ(-HALF), brPin, { pos: [ARMX[1] + 2.75, AXIS.y, AXIS.z] }); // its head
  for (const x of [ARMX[1] - 2.0, ARMX[1] + 2.0]) addMesh(bracket, cyl(1.45, 0.28, 0.06, 32).rotateZ(-HALF), brPin, { pos: [x, AXIS.y, AXIS.z], edgeOpacity: 0.6 }); // washers
  screw(bracket, brPin, ARMX[1], 94.3, FACE + 1.2);
  screw(bracket, brPin, ARMX[1], 104.9, FACE + 1.2);
  bracketMove.add(bracket);
  const pivotHalo = halo(2.2, 2.4);
  pivotHalo.position.set(ARMX[1], AXIS.y, AXIS.z + 1.5);
  bracketMove.add(pivotHalo);

  /* ───────── the box: base plate, walls, the cam, the rod; its cover apart ───────── */
  const boxP = makePart("box");
  const bxDark = M.dark();
  const bxInner = M.inner();
  const bxPin = M.pin();
  addMesh(boxP, box(BOXS[0] + 0.5, BOXS[1] + 0.5, 1.2, 0.3), bxDark, { pos: [BOXC[0], BOXC[1], FACE + 0.6] });
  const wallZ = (BOXZ0 + FACE + BOXS[2] - 0.4) / 2;
  const wallD = FACE + BOXS[2] - 0.4 - BOXZ0;
  addMesh(boxP, box(1, BOXS[1] - 0.6, wallD, 0.2), bxDark, { pos: [BOXC[0] - BOXS[0] / 2 + 0.7, BOXC[1], wallZ] }); // latch end (the bolt goes through)
  addMesh(boxP, box(1, BOXS[1] - 0.6, wallD, 0.2), bxDark, { pos: [BOXC[0] + BOXS[0] / 2 - 0.7, BOXC[1], wallZ] });
  addMesh(boxP, box(0.8, BOXS[1] - 0.6, wallD, 0.2), bxInner, { pos: [BULK, BOXC[1], wallZ] }); // the spring's seat
  addMesh(boxP, cyl(0.62, 7.4, 0.1, 24).rotateZ(-HALF), bxPin, { pos: [-29.6, AXIS.y, AXIS.z] }); // the box arm's axle
  addMesh(boxP, cyl(1.45, 0.28, 0.06, 32).rotateZ(-HALF), bxPin, { pos: [BOXC[0] + BOXS[0] / 2 + 0.15, AXIS.y, AXIS.z], edgeOpacity: 0.6 });
  // the cam on that axle: it turns with the arm
  const cam = new THREE.Group();
  cam.position.set(-31.6, AXIS.y, AXIS.z);
  boxP.add(cam);
  addMesh(boxP, cyl(1.5, 1.2, 0.12, 32).rotateZ(-HALF), bxPin, { pos: [0, 0, 0] });
  cam.add(boxP.children[boxP.children.length - 1]);
  addMesh(boxP, box(1.2, 4.4, 2.2, 0.5).translate(0, -2.2, 0), bxPin, {});
  cam.add(boxP.children[boxP.children.length - 1]);
  // the tail the cam drives: collar, rod, crosshead (they slide +x with `push`)
  const tail = new THREE.Group();
  boxP.add(tail);
  addMesh(boxP, cyl(1.95, 0.8, 0.12, 36).rotateZ(-HALF), bxInner, { pos: [COLLAR, PY, PZ] });
  tail.add(boxP.children[boxP.children.length - 1]);
  addMesh(boxP, cyl(0.5, 10.2, 0.08, 20).rotateZ(-HALF), bxPin, { pos: [COLLAR + 0.4 + 5.1, PY, PZ] });
  tail.add(boxP.children[boxP.children.length - 1]);
  addMesh(boxP, box(1.4, 2.8, 2.6, 0.3), bxInner, { pos: [-32.9, PY, PZ] });
  tail.add(boxP.children[boxP.children.length - 1]);
  root.add(boxP);
  const boxHalo = halo(3.2, 2.2);
  boxHalo.position.set(BOXC[0], BOXC[1], BOXZ0 + BOXS[2]);
  root.add(boxHalo);

  // the cover: solid, or glass (`see`) — the two in one moving group, never in the same part
  const coverMove = new THREE.Group();
  root.add(coverMove);
  const cover = makePart("cover");
  const cvMat = M.cover();
  const cvPin = M.pin();
  const coverZ = BOXZ0 + (BOXS[2] - 1.2) / 2;
  addMesh(cover, box(BOXS[0], BOXS[1], BOXS[2] - 1.2, 0.9, 4), cvMat, { pos: [BOXC[0], BOXC[1], coverZ] });
  for (const x of [BOXC[0] - BOXS[0] / 2 + 1.6, BOXC[0] + BOXS[0] / 2 - 1.6])
    for (const y of [BOXC[1] - BOXS[1] / 2 + 1.5, BOXC[1] + BOXS[1] / 2 - 1.5]) screw(cover, cvPin, x, y, FACE + BOXS[2] - 0.02, 0.5);
  coverMove.add(cover);
  const coverGlassMat = glass(BRAND.ink, { base: 0.012, rim: 0.4, edge: 0.6, spec: 0.35 });
  const coverGlass = new THREE.Mesh(new THREE.BoxGeometry(BOXS[0], BOXS[1], BOXS[2] - 1.2), coverGlassMat);
  coverGlass.position.set(BOXC[0], BOXC[1], coverZ);
  asShell([coverGlass], 18);
  coverMove.add(coverGlass);
  const coverLineMat = edgesOf(new THREE.BoxGeometry(BOXS[0], BOXS[1], BOXS[2] - 1.2), { color: BRAND.ink, width: 1.8, opacity: 0.55 });
  coverLineMat.position.copy(coverGlass.position);
  coverMove.add(coverLineMat);

  /* ───────── the bolt (pêne): a latch bolt, its bevel toward outside (−z); local x 0 is its tip ───────── */
  const peneMove = new THREE.Group();
  root.add(peneMove);
  const pene = makePart("pene");
  const peMat = M.pene();
  const [PL, PH, PD] = PENE.size;
  addMesh(pene, slabXZ([[0, PD / 2], [PL, PD / 2], [PL, -PD / 2], [2.3, -PD / 2]], PH, 0.18), peMat, {});
  addMesh(pene, box(3.4, 1.6, 1.6, 0.2), peMat, { pos: [PL + 1.6, 0, 0] }); // its tail, to the collar
  peneMove.add(pene);
  const peneHalo = halo(2.0, 2.4);
  peneHalo.position.set(-0.3, 0, PD / 2 + 0.3);
  peneMove.add(peneHalo);
  const tipA = new THREE.Object3D();
  peneMove.add(tipA);

  /* ───────── the spring (ressort de rappel): a real coil, squeezed by `push` in the vertex shader ───────── */
  const springMove = new THREE.Group();
  root.add(springMove);
  const spring = makePart("spring");
  const SPRLEN = BULK - 0.4 - (COLLAR + 0.4); //  7.8 at rest
  const helix = new Helix(SPRLEN, 1.45, 7);
  const tubular = 7 * 30;
  const springGeo = new THREE.TubeGeometry(helix, tubular, 0.21, 10, false);
  const cx = new Float32Array(springGeo.attributes.position.count);
  for (let i = 0, k = 0; i <= tubular; i++) for (let j = 0; j <= 10; j++) cx[k++] = -(i / tubular) * SPRLEN;
  springGeo.setAttribute("aCx", new THREE.BufferAttribute(cx, 1));
  const spMat = M.steel();
  const squeeze = { value: 1 };
  spMat.onBeforeCompile = (shader) => {
    shader.uniforms.uSq = squeeze;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aCx; uniform float uSq;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n  transformed.x = aCx * uSq + (transformed.x - aCx);");
  };
  spMat.customProgramCacheKey = () => "sd-032-spring";
  const springMesh = addMesh(spring, springGeo, spMat, { pos: [BULK - 0.4, PY, PZ], edges: false });
  springMesh.castShadow = false;
  springMove.add(spring);
  const springHalo = halo(2.2, 2.4);
  springHalo.position.set(BULK - 0.4 - SPRLEN / 2, PY, PZ + 1.8);
  springMove.add(springHalo);

  /* ───────── on the frame: the strike (gâche) — cast, dark, its notch where the bolt goes ───────── */
  const gacheMove = new THREE.Group();
  fixed.add(gacheMove);
  const gache = makePart("gache");
  const gaMat = M.gache();
  const gaPin = M.pin();
  const GX0 = GACHE.at[0] - GACHE.size[0] / 2; // −60
  const GX1 = GACHE.at[0] + GACHE.size[0] / 2; // −51
  const GZ = [FACE, FACE + 7.5]; //                z 2.5 → 10
  const GY = [GACHE.at[1] - GACHE.size[1] / 2, GACHE.at[1] + GACHE.size[1] / 2];
  addMesh(gache, box(4, GY[1] - GY[0], GZ[1] - GZ[0], 0.4), gaMat, { pos: [GX0 + 2, GACHE.at[1], (GZ[0] + GZ[1]) / 2] });
  {
    const s = new THREE.Shape([new THREE.Vector2(-GZ[1], GY[0]), new THREE.Vector2(-GZ[0], GY[0]), new THREE.Vector2(-GZ[0], GY[1]), new THREE.Vector2(-GZ[1], GY[1])]);
    const h = new THREE.Path([new THREE.Vector2(-(PZ + 1.85), PY - 2.05), new THREE.Vector2(-(PZ + 1.85), PY + 2.05), new THREE.Vector2(-(PZ - 1.85), PY + 2.05), new THREE.Vector2(-(PZ - 1.85), PY - 2.05)]);
    s.holes.push(h);
    addMesh(gache, plate(s, GX1 - GX0 - 4, { bevel: 0.3, round: 2 }).rotateY(HALF).translate(GX0 + 4, 0, 0), gaMat, {});
  }
  screw(gache, gaPin, GACHE.at[0] - 1, GY[0] + 1.8, GZ[1] - 0.02, 0.6);
  screw(gache, gaPin, GACHE.at[0] - 1, GY[1] - 1.8, GZ[1] - 0.02, 0.6);
  gacheMove.add(gache);
  const gacheHalo = halo(2.2, 2.4);
  gacheHalo.position.set(GX1 + 0.4, PY, PZ + 1.2);
  gacheMove.add(gacheHalo);
  // the jam: where the bolt bears on the strike's outer lip — a light with a place, signal
  const jamHalo = halo(3.0, 1.7);
  jamHalo.position.set(GX1 + 0.2, PY, PZ - PD / 2 + 0.1);
  gacheMove.add(jamHalo);
  const pinchMat = glow(BRAND.signal, 2.4, { opacity: 0 });
  const pinch = new THREE.Mesh(new THREE.BoxGeometry(0.45, PH + 0.5, 0.45), pinchMat);
  pinch.position.set(GX1 + 0.15, PY, PZ - PD / 2 - 0.1);
  pinch.renderOrder = 6;
  gacheMove.add(pinch);
  const gacheA = new THREE.Object3D();
  gacheA.position.set(GX1, PY, PZ);
  gacheMove.add(gacheA);

  /* ───────── on the bench only: a section of the leaf (« slab ») and of the jamb, in glass ───────── */
  const slab = makePart("slab");
  const slabMat = glass(BRAND.ink, { base: 0.008, rim: 0.3, edge: 0.5, spec: 0.25 });
  const SLABH = 60;
  const slabGeo = new THREE.BoxGeometry(DOOR.w, SLABH, DOOR.t);
  const slabMesh = new THREE.Mesh(slabGeo, slabMat);
  slabMesh.position.set(0, 96, 0);
  slab.add(slabMesh);
  asShell([slabMesh], 20);
  const slabLines = edgesOf(slabGeo, { color: BRAND.ink, width: 2, opacity: 0.62 });
  slabLines.position.copy(slabMesh.position);
  slab.add(slabLines);
  slab.userData.part.mats.add(slabLines.material);
  root.add(slab);
  const jambMat = glass(BRAND.ink, { base: 0.008, rim: 0.3, edge: 0.5 });
  const jambGeo = new THREE.BoxGeometry(DOOR.frame, SLABH, DOOR.frameDepth);
  const jamb = new THREE.Group();
  const jambMesh = new THREE.Mesh(jambGeo, jambMat);
  jamb.add(jambMesh);
  asShell([jambMesh], 20);
  const jambLines = edgesOf(jambGeo, { color: BRAND.ink, width: 1.8, opacity: 0.42 });
  jamb.add(jambLines);
  jamb.position.set(DOOR.latchX - DOOR.frame / 2, 96, 0);
  fixed.add(jamb);

  /* ───────── the load: the crowd's weight on the leaf, signal arrows toward the exit (−z) ───────── */
  const loadG = new THREE.Group();
  root.add(loadG);
  const arrowMat = glow(BRAND.signal, 1.7, { opacity: 0 });
  const arrowGeo = mergeGeometries([cyl(1.25, 10, 0.1, 24).translate(0, 5, 0), cyl(3.1, 6.2, 0.1, 32, 0.05).translate(0, 13.1, 0)]).rotateX(-HALF); // +y → −z: the head points to the exit
  const ARROWS = { bench: [[-36, 117], [0, 119], [36, 117], [-36, 75], [0, 73], [36, 75]], door: [[-40, 122], [-18, 124], [38, 120], [-40, 70], [-18, 66], [38, 72]] };
  const arrows = ARROWS.bench.map(() => {
    const a = new THREE.Mesh(arrowGeo, arrowMat);
    a.renderOrder = 4;
    loadG.add(a);
    return a;
  });
  let arrowsAt = -1;

  /* ───────── anchors ───────── */
  const A = {};
  const at = (name, parent, x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    A[name] = o;
  };
  at("bar", lever, (BX0 + BX1) / 2, BY, BZ);
  at("barEnd", lever, BX1 + 1.9, BY, BZ);
  at("pivot", bracketMove, ARMX[1], AXIS.y, AXIS.z);
  at("box", coverMove, BOXC[0], BOXC[1], BOXC[2]);
  A.pene = tipA;
  A.gache = gacheA;
  at("spring", springMove, BULK - 0.4 - SPRLEN / 2, PY, PZ);
  A.hand = palm;
  at("centre", root, ...SYSTEM.centre);

  const parts = { bar, arms, bracket, box: boxP, cover, pene, spring, gache, slab };

  /* ───────── what lights up when the voice names a part: its solids, the lines of its edges, a halo ───────── */
  const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  const allLines = new Set();
  const allSolids = new Set();
  for (const p of Object.values(parts)) {
    if (p === slab) continue;
    for (const mat of p.userData.part.mats) {
      if (mat.isLineMaterial) {
        mat.userData.rest = mat.color.clone();
        allLines.add(mat);
      } else if (mat.isMeshStandardMaterial) {
        mat.userData.rest = mat.color.clone();
        mat.userData.glowK = 0.012 + 0.03 * Math.min(1, lum(mat.color)); // a hint: on a dark part, any more is a green block
        allSolids.add(mat);
      }
    }
  }
  const lampOf = (list, haloMesh) => {
    const mats = list.flatMap((p) => [...p.userData.part.mats]);
    return { solids: mats.filter((m) => m.isMeshStandardMaterial), lines: mats.filter((m) => m.isLineMaterial), halo: haloMesh, k: -1, s: -1, hot: 0 };
  };
  const tmpC = new THREE.Color();
  /** `k` veille (named), `s` signal (jammed). */
  const light = (lamp, k, s = 0) => {
    if (lamp.k === k && lamp.s === s) return;
    lamp.k = k;
    lamp.s = s;
    tmpC.copy(SIGNAL).multiplyScalar(lamp.hot * s);
    for (const mat of lamp.solids) mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glowK * k * (lamp.boost ?? 1)).add(tmpC);
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.75 * k).lerp(SIGNAL, 0.85 * s);
    if (lamp.halo) {
      lamp.halo.visible = k > 0.003;
      lamp.halo.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(0.32 * k);
    }
  };
  const lamps = {
    bar: lampOf([bar]),
    pivot: lampOf([arms, bracket], pivotHalo),
    box: lampOf([boxP, cover], null),
    pene: Object.assign(lampOf([pene], peneHalo), { hot: 0.07 }),
    gache: lampOf([gache], gacheHalo),
    spring: Object.assign(lampOf([spring], springHalo), { boost: 6 }),
  };

  /* ───────── the ghost: the system as a faint ink outline (1883, « Sans barre ») ───────── */
  let ghostOn = false;
  const ghostSet = (on) => {
    ghostOn = on;
    for (const mat of allSolids) mat.visible = !on;
    for (const line of allLines) if (on) line.color.copy(INK);
    if (!on) for (const lamp of Object.values(lamps)) lamp.k = -1; // repaint the lines on the next light()
    coverGlass.visible = !on;
    coverLineMat.visible = !on;
  };

  const HALOS = [barHalo, pivotHalo, boxHalo, peneHalo, springHalo, gacheHalo, jamHalo];
  // the explode: where each moving group goes, and when (delay, span)
  const EX = [
    { g: coverMove, d: [0, 25, 5], w: [0.0, 0.55] },
    { g: leverMove, d: [0, 6, 28], w: [0.1, 0.6] },
    { g: springMove, d: [0, 13, 18], w: [0.22, 0.55] },
    { g: peneMove, d: [-9, -5, 9], w: [0.18, 0.6] },
    { g: gacheMove, d: [-17, -9, 4], w: [0.3, 0.6] },
    { g: bracketMove, d: [4, 0, 9], w: [0.25, 0.55] },
  ];

  return {
    root, fixed, A, parts,
    update(P, time, px) {
      void px;
      const bench = (P.bench ?? 0) > 0.5;
      const ex = clamp01(P.explode ?? 0);
      const push = clamp01(P.push ?? 0);
      const pn = clamp01(P.pene ?? 0);
      const see = clamp01(P.see ?? 0);
      const load = clamp01(P.load ?? 0);
      const jam = clamp01(P.jam ?? 0);
      const ghost = clamp01(P.ghost ?? 0);
      const hand = clamp01(P.hand ?? 0);

      /* the explode */
      for (const e of EX) {
        const u = settle(clamp01((ex - e.w[0]) / e.w[1]));
        e.g.position.set(e.d[0] * u, e.d[1] * u, e.d[2] * u);
      }
      /* the lever: the bar swings about AXIS, the cam with it, the tail slides, the spring squeezes */
      const sp = smooth(push);
      lever.rotation.x = THETA * sp;
      cam.rotation.x = THETA * sp;
      tail.position.x = TRAVEL * sp;
      squeeze.value = (SPRLEN - TRAVEL * sp) / SPRLEN;
      /* the bolt: thrown (0) → drawn (1); jammed, it trembles a hair */
      const tremble = jam * (0.035 * Math.sin(time * 19.0) + 0.025 * Math.sin(time * 31.0 + 1.3)) * (1 - pn);
      const tipX = PENE.out + (PENE.in - PENE.out) * pn + tremble;
      peneMove.position.x += tipX;
      peneMove.position.y += PY;
      peneMove.position.z += PZ;

      /* the ghost */
      if (ghost > 0.0005) {
        if (!ghostOn) ghostSet(true);
        const a = 0.6 * ghost;
        for (const line of allLines) line.opacity = line.userData.base * a;
        for (const h of HALOS) h.visible = false;
        sleeve.visible = false;
        pinch.visible = false;
        slab.visible = false;
        jamb.visible = false;
        loadG.visible = false;
        handG.visible = false;
        slab.userData.part.opacity = -1;
        return;
      }
      if (ghostOn) {
        ghostSet(false);
        for (const line of allLines) line.opacity = line.userData.base;
        cover.userData.part.opacity = -1; // let setPartOpacity paint it again
        slab.userData.part.opacity = -1;
      }

      /* the cover: solid → glass */
      setPartOpacity(cover, 1 - see);
      coverGlass.visible = see > 0.01 && !ghostOn;
      coverGlassMat.uniforms.uAmount.value = see;
      coverLineMat.visible = see > 0.01 && !ghostOn;
      coverLineMat.material.opacity = 0.55 * see;
      coverGlassMat.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.55 * clamp01(P.litBox ?? 0));

      /* the slab and the jamb (bench only) */
      const sl = bench ? clamp01(P.slab ?? 0) : 0;
      setPartOpacity(slab, sl);
      slabMat.uniforms.uAmount.value = sl;
      jamb.visible = sl > 0.004;
      jambMat.uniforms.uAmount.value = sl;
      jambLines.material.opacity = 0.42 * sl;

      /* the load: arrows that push slowly toward the exit — a push, not a blink */
      const placeAt = bench ? 0 : 1;
      if (arrowsAt !== placeAt) {
        arrowsAt = placeAt;
        const list = bench ? ARROWS.bench : ARROWS.door;
        for (let i = 0; i < arrows.length; i++) arrows[i].position.set(list[i][0], list[i][1], FACE + 21);
      }
      const surge = 0.5 - 0.5 * Math.cos(time * 3.6);
      loadG.visible = load > 0.003 && !ghostOn;
      loadG.position.z = -3.2 * surge * load;
      arrowMat.opacity = load * (0.82 + 0.18 * surge);

      /* the hand: on the bar at tapAt, pressing when the bar is pushed, a hair off it otherwise */
      handG.visible = hand > 0.003 && !ghostOn;
      handMat.uniforms.uAmount.value = hand;
      handG.position.set(THREE.MathUtils.lerp(BX0 + 6, BX1 - 5, (clamp01(((P.tapAt ?? 0) + 1) / 2))), BY, BZ + 3.2 * (1 - sp));
      handG.rotation.x = -THETA * sp; // the palm stays square to the push

      /* what the voice names */
      const lb = clamp01(P.litBar ?? 0);
      light(lamps.bar, lb);
      sleeve.visible = lb > 0.003;
      sleeveMat.uniforms.uColor.value.copy(VEILLE).multiplyScalar(1.0);
      sleeveMat.uniforms.uHead.value = BX0 + (BX1 - BX0) * lb;
      sleeveMat.uniforms.uHeadK.value = 1.5 * smooth(clamp01(lb / 0.08)) * (1 - smooth(clamp01((lb - 0.88) / 0.12)));
      sleeveMat.uniforms.uTrail.value = 0.32 * smooth(clamp01(lb / 0.15));
      barHalo.visible = sleeveMat.uniforms.uHeadK.value > 0.01;
      barHalo.position.set(sleeveMat.uniforms.uHead.value, BY, BZ + 1.2);
      barHalo.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(0.7 * sleeveMat.uniforms.uHeadK.value);
      light(lamps.pivot, clamp01(P.litPivot ?? 0));
      light(lamps.box, clamp01(P.litBox ?? 0));
      light(lamps.pene, clamp01(P.litPene ?? 0) * (1 - jam), jam);
      light(lamps.gache, clamp01(P.litGache ?? 0) * (1 - jam), 0.7 * jam);
      light(lamps.spring, clamp01(P.litSpring ?? 0));
      // the jam's contact: a small hot line and its halo, breathing slowly with the crowd's surge
      const hot = jam * (1 - pn) * (0.85 + 0.15 * surge);
      jamHalo.visible = hot > 0.003;
      jamHalo.material.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(1.3 * hot);
      pinch.visible = hot > 0.003;
      pinchMat.opacity = hot;
    },
  };
}
