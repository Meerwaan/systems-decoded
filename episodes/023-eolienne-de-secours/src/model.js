// DOSSIER 023 — Éolienne de secours : the system. The RAT (ram air turbine) as ONE object, re-parented between the
// plane's belly and the bench. Its sizes are ILLUSTRATIVE (plan.js: the A330's were not found, none is ever shown).
// Its root's origin: the arm's hinge, inside the bay, just above the door (the belly skin at y = −12). Nose toward −x,
// the plane's left flank (the camera's side) toward +z.
//   · THE BAY — a glass box (a piece of belly), the dark coaming of the opening in the skin, the hinge brackets, the
//     clevis the spring actuator hangs from, the hangers of the three hydraulic lines
//   · THE DOOR — a panel flush with the skin, hinged on its +z edge, that swings down and out
//   · THE ARM — a tapered strut on a hinge barrel. Stowed it lies along the bay (9° nose-up, so that the pod fits),
//     out it hangs nearly plumb, 100° further down
//   · THE SPRING — the actuator that pushes the arm out: body, rod, and a helical spring around them that you SEE
//     open up (62 cm stowed, 154 cm out); the helix is laid in the shader, its wire keeps its thickness
//   · THE PROPELLER — two broad twisted blades on a hub and a blunt spinner, the clearest grey of all: the hero.
//     Stowed, its blades lie flat along the bay just above the door. Spinning, a veil of veille over its disc
//   · THE PUMP — behind the propeller, bolted to the gearbox (the nacelle stays on the arm): a ribbed body, two
//     fittings on its shoulder (pressure, return), whose two pipes climb the arm to the hinge barrel
//   · THE THREE LINES — the plane's three circuits running through the bay's roof, camera side. Only the middle one
//     (HYD.live, the « green ») comes out of the barrel: it is the only one the RAT can feed
//   · on the bench only: a curved patch of belly skin round the opening, on two thin glass posts
// Three values of grey: bay, arm, actuator body dark · door, gearbox, pump, spring in between · blades and rod clear.
// Light: VEILLE is what the RAT gives (its disc, the pressure climbing the arm into ONE line, what the voice names) ·
// SIGNAL the circuits left without pressure · INK a circuit the engines still hold.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glass, asShell, edgesOf, fatLine, lineMat, makePart, addMesh, setPartOpacity, anchor, box, cyl, lathe, plate, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { DOOR, ARM, PROP, PUMP, LINES, HYD, BENCHAT } from "./plan.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.05 * (u > 0.5 ? 1 : 0.25);
const f1 = (x) => x.toFixed(1);
const f3 = (x) => x.toFixed(3);
const glsl3 = (c) => `vec3(${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)})`;

/* ─────────────────────────────────────────────────────────── where everything is (root frame, cm) */

const SKIN = DOOR.y; //                                  −12: the belly's outer surface
const HOLE = { x0: -16, x1: 210, z: DOOR.w / 2 }; //      the opening in the skin (the stowed propeller is 110 cm of blades at the end of a 150 cm arm)
const BAYBOX = { x0: -34, x1: 226, y1: 60, z0: -58, z1: 44 }; // the bay above it, a glass box
const A0 = Math.asin(24 / ARM.len) / DEG; //             the arm stowed: 9.2° above +x (its end at y = 24: the pod stands upright inside)
const TRAVEL = ARM.travel; //                            100° down: out, the arm hangs at −90.8°
const REL = TRAVEL - A0; //                              the pod turned on the arm, so that out it faces the wind exactly
const DOOR_OPEN = 95; //                                 degrees, fully open (a little past plumb)
const BARREL = { r: 13, half: 14 }; //                   the hinge barrel, along z
const BRACKET_Z = 16; //                                 the two hinge brackets, each side of it
const F = [112, 52]; //                                  where the spring actuator hangs (aft, under the roof)
const LUG = [62, 10]; //                                 where it takes the arm (arm frame)
const BODY = 44; //                                      the actuator's body, from F
const COIL = { R: 7.2, r: 1.25, turns: 10, from: 7, gap: 7 }; // the spring: coil radius, wire, turns, seats
const PLANE = -16; //                                    the propeller's plane, head frame (axis x, wind from −x)
const PIPE_Z = 11; //                                    the two pipes on the arm, camera side
const RACC = [14, 25]; //                                the pump's two fittings, head frame x
const ROOF = { y: 38, z: [-24, -36, -48], x0: BAYBOX.x0, x1: 250 }; // the three circuits through the bay, on its far side (index HYD.live = 1: the middle)
const LIVE = HYD.live ?? 1;
const OPEN = { door: 55, doorX: -40, tilt: 18, spring: [70, -30, 0], prop: 38, pump: 48, lines: [-40, -6, 30], rise: 10, spread: 1.5 }; // the exploded view (bench): the bay fades, the parts gather round the arm

/* ─────────────────────────────────────────────────────────── geometry */

/** Twist a geometry (and its outline) about its y axis by `fn(y)` radians: a blade's pitch, root to tip. */
function twisted(geo, fn) {
  for (const g of [geo, geo.userData.edges]) {
    if (!g) continue;
    const p = g.attributes.position;
    const n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      const a = fn(p.getY(i));
      const c = Math.cos(a);
      const s = Math.sin(a);
      const x = p.getX(i);
      const z = p.getZ(i);
      p.setXYZ(i, x * c + z * s, p.getY(i), -x * s + z * c);
      if (n) {
        const nx = n.getX(i);
        const nz = n.getZ(i);
        n.setXYZ(i, nx * c + nz * s, n.getY(i), -nx * s + nz * c);
      }
    }
    p.needsUpdate = true;
  }
  return geo;
}

/** One blade, in the head frame: its span along +y, its chord along z, its thickness along x — twisted 36° at the root, 13° at the tip. */
function bladeGeometry() {
  const R = PROP.r;
  const lead = [[-6.2, 10], [-8.2, 16], [-8.8, 26], [-8.8, 40], [-8.2, 49], [-6.4, R - 1.6]];
  const trail = [[6.8, R - 1.6], [9.4, 48], [10.2, 36], [10.2, 24], [9, 16], [6.6, 10]];
  const tip = Array.from({ length: 7 }, (_, i) => {
    const a = Math.PI - (i / 6) * Math.PI;
    return [0.2 + 6.6 * Math.cos(a), R - 1.6 + 1.6 * Math.sin(a)];
  });
  const outline = [...lead, ...tip.slice(1, -1), ...trail];
  const geo = plate(outline, 3.2, { bevel: 0.9, round: 2, curveSegments: 8 }).translate(0, 0, -1.6);
  twisted(geo, (y) => (36 - 23 * clamp01((y - 10) / (R - 10))) * DEG);
  return geo.rotateY(-Math.PI / 2); // chord → z, thickness → x
}

/** A tube along points, with `aU` running u0 → u1 along it (what the head of light reads). */
function pipeGeometry(points, r, u0 = 0, u1 = 1, radial = 14) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "centripetal");
  const n = Math.max(8, Math.round(curve.getLength() / 2.5));
  const geo = new THREE.TubeGeometry(curve, n, r, radial, false);
  const count = geo.attributes.position.count;
  const u = new Float32Array(count);
  for (let k = 0; k < count; k++) u[k] = u0 + ((u1 - u0) * Math.floor(k / (radial + 1))) / n;
  geo.setAttribute("aU", new THREE.BufferAttribute(u, 1));
  return { geo, length: curve.getLength() };
}

/** The spring's wire: a grid of (along the helix, round the wire); the vertex shader lays it on the helix of the moment. */
function helixGeometry(perTurn = 30, radial = 10) {
  const n = COIL.turns * perTurn;
  const helix = [];
  const index = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= radial; j++) helix.push(i / n, (j / radial) * TAU);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      index.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const geo = new THREE.BufferGeometry();
  const count = helix.length / 2;
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aHelix", new THREE.Float32BufferAttribute(helix, 2));
  geo.setIndex(index);
  return geo;
}

/* ─────────────────────────────────────────────────────────── matter that is drawn */

/** A lit solid whose program is patched: `attr` and `vertex` in the vertex shader, `decl` and `light` in the fragment. */
function patched(mat, key, uniforms, { attr = "", vertex = "", decl = "", light = "" }) {
  mat.userData.U = uniforms;
  mat.customProgramCacheKey = () => key;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader.replace("#include <common>", `#include <common>\n${attr}`).replace("#include <begin_vertex>", `#include <begin_vertex>\n${vertex}`);
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>\n${decl}`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n{ ${light} }`);
  };
  return mat;
}

/** A hydraulic line: dim signal when dead, a breath of ink under engine pressure, and — the live one — veille from the pump, a head of light running ahead. */
const PIPE = {
  attr: /* glsl */ `attribute float aU; varying float vU;`,
  vertex: /* glsl */ `vU = aU;`,
  decl: /* glsl */ `uniform float uPress, uHead, uDead, uInk, uSteady; varying float vU;`,
  light: /* glsl */ `
    float u = vU;
    float behind = 1.0 - smoothstep(uHead - 0.004, uHead + 0.004, u);
    float dh = (u - uHead) / 0.022;
    float head = exp(-dh * dh) * step(0.001, uHead) * (1.0 - step(0.999, uHead));
    float source = exp(-u / 0.035);
    float live = uPress * (behind * (0.34 + 0.4 * exp(-max(uHead - u, 0.0) / 0.12)) + 1.5 * head + 0.7 * source) + uSteady;
    totalEmissiveRadiance += ${glsl3(VEILLE)} * live + ${glsl3(SIGNAL)} * uDead + ${glsl3(INK)} * uInk;`,
};

/** The spring's wire, laid on its helix in the vertex shader: `uLen` its length of the moment, `uY0` where it starts. */
function springMaterial() {
  const U = { uLen: { value: 50 }, uY0: { value: COIL.from }, uLit: { value: 0 } };
  const mat = solid(0xaab1b7, { rough: 0.36, metal: 0.45 });
  mat.userData.U = U;
  mat.customProgramCacheKey = () => "023-spring";
  const k = COIL.R * TAU * COIL.turns;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nattribute vec2 aHelix; uniform float uLen, uY0;`)
      .replace(
        "#include <beginnormal_vertex>",
        /* glsl */ `
        float hA = ${f3(TAU * COIL.turns)} * aHelix.x;
        vec3 hC = vec3(${f3(COIL.R)} * cos(hA), uY0 + uLen * aHelix.x, ${f3(COIL.R)} * sin(hA));
        vec3 hT = normalize(vec3(-${f3(k)} * sin(hA), max(uLen, 1.0), ${f3(k)} * cos(hA)));
        vec3 hN = vec3(-cos(hA), 0.0, -sin(hA));
        vec3 hB = normalize(cross(hT, hN));
        vec3 objectNormal = cos(aHelix.y) * hN + sin(aHelix.y) * hB;
        #ifdef USE_TANGENT
          vec3 objectTangent = hT;
        #endif`,
      )
      .replace("#include <begin_vertex>", `vec3 transformed = hC + ${f3(COIL.r)} * objectNormal;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nuniform float uLit;`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\ntotalEmissiveRadiance += ${glsl3(VEILLE)} * 0.2 * uLit;`);
  };
  return mat;
}

/** The disc the blades sweep, once they spin: a veil of veille, brighter just behind each blade and in a band near the tips. Always flat in the propeller's plane. */
function discMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uTurn: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.yz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTurn, uAmount; varying vec2 vP;
      void main() {
        float r = length(vP);
        float phi = atan(vP.y, vP.x);
        float d = mod(uTurn - phi, 3.14159265);              // how far behind the nearest blade (two blades: every half turn)
        float smear = exp(-d / 0.55);
        float body = smoothstep(${f1(PROP.hub + 1)}, ${f1(PROP.hub + 9)}, r) * (1.0 - smoothstep(${f1(PROP.r - 3)}, ${f1(PROP.r + 1.5)}, r));
        float rr = clamp(r / ${f1(PROP.r)}, 0.0, 1.0);
        float t = (r - ${f1(PROP.r - 4)}) / 3.2;
        float band = exp(-t * t);
        float light = body * (0.05 + 0.16 * smear) * (0.5 + 0.5 * rr) + 0.2 * band * (0.55 + 0.45 * smear);
        gl_FragColor = vec4(${glsl3(VEILLE)} * light * uAmount, 1.0);
      }`,
  });
}

/* ─────────────────────────────────────────────────────────── the system */

/**
 * → { root, A, parts, update(P, time, px) }. `root`: its origin is the arm's hinge (world.js stands it in the plane's
 * bay, at BAY.at, or on the bench, at BENCHAT). `A`: anchors that follow their parts, opened or not.
 * P (see FIRST in world.js):
 *   bench     1 on the bench (the patch of skin and its glass posts), 0 in the plane
 *   door      0 shut, flush with the belly → 1 open (it swings out fast: at 0.5 it is already at 71°, clear of the arm)
 *   arm       0 stowed in the bay → 1 out, hanging in the wind; the spring opens with it
 *   turn      the propeller's angle, in turns. Under `arm` 0.25 the blades settle to the nearest half turn: along the bay
 *   whirl     the disc of the spinning blades, a veil of veille (0–1): with a fast `turn`
 *   wind      (bench) fine streaks of air coming from −x through the disc: ink, veille once through
 *   press     the pump's pressure: the pump and the live line light up veille from the pump outward (0–1)
 *   flow      a head of veille light from the pump up the arm into the live line, out of the bay (0–1; in the plane it
 *             reaches the bay's exit at 0.15, so that avion.js can carry it on)
 *   lines     the three circuits under engine pressure: ink at 1, dim signal at 0
 *   explode   (bench) 0 → 1: the door up top, the lines in a row under it, the spring aft, the propeller forward, the pump
 *             out of its nacelle
 *   litDoor, litArm (arm and spring), litProp, litPump   0–1: the part the voice is naming glows faintly veille
 */
export function buildSystem() {
  const root = new THREE.Group();
  root.name = "rat";
  const grp = (parent = root) => {
    const g = new THREE.Group();
    parent.add(g);
    return g;
  };
  const partIn = (name) => {
    const part = makePart(name);
    root.add(part); // parts stay empty groups: their meshes live in the moving groups (a part never hides another)
    return part;
  };
  /** A mesh of `part` (its materials, its shadows) that lives in `group`. */
  const piece = (part, group, geometry, material, o = {}) => {
    const mesh = addMesh(part, geometry, material, o);
    group.add(mesh);
    return mesh;
  };
  const lits = { door: [], arm: [], prop: [], pump: [] };
  const litSolid = (key, color, o) => {
    const mat = solid(color, o);
    mat.emissive = VEILLE.clone();
    mat.emissiveIntensity = 0;
    lits[key].push(mat);
    return mat;
  };

  /* ══ THE BAY: glass, the coaming, brackets, the actuator's clevis, the hangers ══ */
  const bayG = grp();
  const bayDark = solid(0x30363c, { rough: 0.68, metal: 0.25 });
  const bayMid = solid(0x4b5259, { rough: 0.6, metal: 0.3 });
  const bay = makePart("bay"); // not one of the RAT's parts: it fades out of the exploded view
  root.add(bay);
  const still = (geometry, material, o = {}) => piece(bay, bayG, geometry, material, { edgeOpacity: o.edgeOpacity ?? 0.4, edgeColor: BRAND.ink, edgeWidth: 1.8 });
  const coaming = new THREE.Shape([
    new THREE.Vector2(BAYBOX.x0, BAYBOX.z0),
    new THREE.Vector2(BAYBOX.x1, BAYBOX.z0),
    new THREE.Vector2(BAYBOX.x1, BAYBOX.z1),
    new THREE.Vector2(BAYBOX.x0, BAYBOX.z1),
  ]);
  coaming.holes.push(new THREE.Path([new THREE.Vector2(HOLE.x0, -HOLE.z), new THREE.Vector2(HOLE.x0, HOLE.z), new THREE.Vector2(HOLE.x1, HOLE.z), new THREE.Vector2(HOLE.x1, -HOLE.z)]));
  still(plate(coaming, 3, { bevel: 0.6, round: 1 }).rotateX(Math.PI / 2).translate(0, SKIN + 3, 0), bayDark, { edgeOpacity: 0.55 });
  const bracketShape = new THREE.Shape();
  bracketShape.moveTo(-11, BAYBOX.y1);
  bracketShape.lineTo(-11, 0);
  bracketShape.absarc(0, 0, 11, Math.PI, 0, false);
  bracketShape.lineTo(11, BAYBOX.y1);
  for (const s of [-1, 1]) still(plate(bracketShape, 4, { bevel: 0.6, round: 1 }).translate(0, 0, s > 0 ? BRACKET_Z : -BRACKET_Z - 4), bayMid, { edgeOpacity: 0.45 });
  still(cyl(4.2, 2 * BRACKET_Z + 10, 0.6, 24).rotateX(Math.PI / 2), bayMid, { edgeOpacity: 0.35 }); // the hinge pin
  const clevis = new THREE.Shape();
  clevis.moveTo(-7, BAYBOX.y1);
  clevis.lineTo(-7, F[1]);
  clevis.absarc(F[0] - F[0], F[1], 7, Math.PI, 0, false);
  clevis.lineTo(7, BAYBOX.y1);
  for (const s of [-1, 1]) still(plate(clevis, 2.5, { bevel: 0.5, round: 1 }).translate(F[0], 0, s > 0 ? 6.5 : -9), bayMid, { edgeOpacity: 0.45 });
  still(box(30, 4, 24, 1).translate(F[0], BAYBOX.y1 - 2, 0), bayDark, { edgeOpacity: 0.4 });
  for (const x of [72, 150, 206]) still(box(5, BAYBOX.y1 - ROOF.y + 3, ROOF.z[2] - ROOF.z[0] + 12, 1).translate(x, (BAYBOX.y1 + ROOF.y - 3) / 2, (ROOF.z[0] + ROOF.z[2]) / 2), bayDark, { edgeOpacity: 0.35 });
  // the glass: a piece of belly
  const bayGlass = glass(BRAND.ink, { base: 0.01, rim: 0.2, power: 2.6, edge: 0.4, spec: 0.3, through: 0.22 });
  const bayW = BAYBOX.x1 - BAYBOX.x0;
  const bayH = BAYBOX.y1 - SKIN;
  const bayD = BAYBOX.z1 - BAYBOX.z0;
  const bayShape = box(bayW, bayH, bayD, 4).translate((BAYBOX.x0 + BAYBOX.x1) / 2, (BAYBOX.y1 + SKIN) / 2, (BAYBOX.z0 + BAYBOX.z1) / 2);
  const bayBox = new THREE.Mesh(bayShape, bayGlass);
  const bayLines = edgesOf(bayShape, { color: BRAND.ink, width: 1.8, opacity: 0.32 });
  bayBox.add(bayLines);
  bayG.add(bayBox);

  /* ══ the bench only: four thin glass posts under the coaming (a piece of belly on a museum mount) ══ */
  const benchG = grp();
  const postGlass = glass(BRAND.ink, { base: 0.01, rim: 0.24, power: 2.4, edge: 0.45, spec: 0.4, through: 0.2 });
  const floorY = -BENCHAT[1];
  const posts = [];
  for (const [x, z] of [[BAYBOX.x0 + 7, BAYBOX.z0 + 6], [BAYBOX.x1 - 7, BAYBOX.z0 + 6]]) {
    const top = SKIN;
    const shape = mergeGeometries([cyl(2.4, top - floorY - 4, 0.3, 24).translate(x, (top + floorY + 4) / 2, z), cyl(10, 4, 0.8, 40).translate(x, floorY + 2, z), cyl(5, 3, 0.4, 24).translate(x, top - 1.5, z)]);
    const post = new THREE.Mesh(shape, postGlass);
    post.add(edgesOf(shape, { color: BRAND.ink, width: 1.8, opacity: 0.28 }));
    benchG.add(post);
    posts.push(post);
  }
  asShell([bayBox], 14);
  asShell(posts, 16);

  /* ══ THE DOOR ══ */
  const door = partIn("door");
  const doorPivot = grp();
  doorPivot.position.set(0, SKIN, HOLE.z);
  const doorMat = litSolid("door", 0x868d94, { rough: 0.5, metal: 0.3 });
  const doorRib = litSolid("door", 0x50575e, { rough: 0.6, metal: 0.3 });
  const DL = HOLE.x1 - HOLE.x0 - 1.2;
  const DW = 2 * HOLE.z - 1.2;
  const DX = (HOLE.x0 + HOLE.x1) / 2;
  piece(door, doorPivot, box(DL, 3, DW, 0.9).translate(DX, 1.5, -DW / 2 - 0.6), doorMat, { edgeOpacity: 0.5 });
  for (const z of [-0.3, -0.7]) piece(door, doorPivot, box(DL - 26, 3.5, 3, 0.6).translate(DX, 4.6, z * DW), doorRib, { edgeOpacity: 0.4 });
  for (const x of [HOLE.x0 + 18, DX, HOLE.x1 - 18]) piece(door, doorPivot, box(3, 3.5, DW - 14, 0.6).translate(x, 4.6, -DW / 2), doorRib, { edgeOpacity: 0.4 });
  piece(door, doorPivot, cyl(2.3, DL, 0.4, 24).rotateZ(Math.PI / 2).translate(DX, 1.6, -0.2), doorRib, { edgeOpacity: 0.35 }); // the piano hinge

  /* ══ THE ARM, its barrel and its pod ══ */
  const arm = partIn("arm");
  const armPivot = grp();
  const armMat = litSolid("arm", 0x3d434a, { rough: 0.55, metal: 0.35 });
  const armMid = litSolid("arm", 0x5c636a, { rough: 0.5, metal: 0.35 });
  piece(arm, armPivot, cyl(BARREL.r, 2 * BARREL.half, 1.2, 48).rotateX(Math.PI / 2), armMid, { edgeOpacity: 0.45 });
  piece(arm, armPivot, cyl(9, ARM.len - 14, 1.2, 40, 7.2).rotateZ(-Math.PI / 2).translate(8 + (ARM.len - 14) / 2, 0, 0), armMat, { edgeOpacity: 0.45 });
  piece(arm, armPivot, mergeGeometries([box(12, 6, 7, 1).translate(LUG[0], 7.5, 0), cyl(4.4, 9, 0.5, 24).rotateX(Math.PI / 2).translate(LUG[0], LUG[1], 0)]), armMid, { edgeOpacity: 0.4 }); // the actuator's lug
  for (const s of [38, 78, 104]) piece(arm, armPivot, box(4.5, 15, 13, 1).translate(s, 0, PIPE_Z - 1), armMid, { edgeOpacity: 0.35 }); // pipe clamps
  const head = grp(armPivot);
  head.position.set(ARM.len, 0, 0);
  head.rotation.z = REL * DEG;
  // the nacelle: the gearbox the propeller turns, and the pump's flange (it stays on the arm)
  const along = (profile, seg = 64, bevel = 0.8) => lathe(profile, seg, { bevel, round: 2 }).rotateZ(-Math.PI / 2); // a profile [r, x] turned round the head's x axis
  piece(arm, head, along([[0, -8], [13.2, -8], [14.6, -6.5], [14.6, 4.5], [16.2, 4.8], [16.2, 8.2], [0, 8.2]]), armMid, { edgeOpacity: 0.45 });
  piece(arm, head, cyl(8.5, 9, 0.8, 32).translate(0, 12, 0), armMat, { edgeOpacity: 0.4 }); // where the strut enters the gearbox

  /* ══ THE PUMP, behind ══ */
  const pump = partIn("pump");
  const pumpG = grp(head);
  const pumpMat = litSolid("pump", 0x7a8188, { rough: 0.48, metal: 0.38 });
  const pumpDark = litSolid("pump", 0x555c63, { rough: 0.55, metal: 0.35 });
  piece(pump, pumpG, along([[0, 8.4], [12.6, 8.4], [12.6, 17.6], [14.8, 18], [14.8, 20.6], [12.6, 21], [12.6, 29], [11, 31.6], [8, 34], [4, 35.6], [0, 36]]), pumpMat, { edgeOpacity: 0.45 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.5;
    piece(pump, pumpG, cyl(1.5, 3, 0.3, 12).rotateZ(Math.PI / 2).translate(9.6, 13.9 * Math.cos(a), 13.9 * Math.sin(a)), pumpDark, { edges: false }); // flange bolts
  }
  const raccDir = new THREE.Vector3(0, 12.8, PIPE_Z).normalize();
  for (const x of RACC) {
    const nut = mergeGeometries([cyl(3.7, 4.6, 0.4, 6).translate(0, 15.4, 0), cyl(2.8, 4, 0.3, 20).translate(0, 12.2, 0)]);
    const m = piece(pump, pumpG, nut, pumpDark, { edgeOpacity: 0.4 });
    m.position.set(x, 0, 0);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), raccDir);
  }

  /* ══ THE PROPELLER ══ */
  const prop = partIn("prop");
  const spin = grp(head);
  spin.position.x = PLANE;
  const bladeMat = litSolid("prop", 0xc6cbd0, { rough: 0.42, metal: 0.3 });
  const hubMat = litSolid("prop", 0x8e959c, { rough: 0.45, metal: 0.35 });
  const blade = bladeGeometry();
  piece(prop, spin, blade, bladeMat, { edgeOpacity: 0.55 });
  piece(prop, spin, blade.clone().rotateX(Math.PI), bladeMat, { edgeOpacity: 0.55 });
  piece(prop, spin, cyl(PROP.hub, 16, 1.4, 48).rotateZ(Math.PI / 2), hubMat, { edgeOpacity: 0.45 });
  piece(prop, spin, lathe([[PROP.hub, 8], [11.6, 10], [10, 12], [7, 13.8], [3.5, 14.8], [0, 15.2]], 48, { bevel: 0.6, round: 2 }).rotateZ(Math.PI / 2), hubMat, { edgeOpacity: 0.35 }); // the spinner
  for (const s of [1, -1]) piece(prop, spin, cyl(4.8, 7, 0.5, 24).translate(0, s * (PROP.hub + 2.5), 0), hubMat, { edgeOpacity: 0.35 }); // the blade roots
  const disc = new THREE.Mesh(new THREE.RingGeometry(PROP.hub, PROP.r + 2, 120, 1).rotateY(Math.PI / 2), discMaterial());
  disc.renderOrder = 7;
  disc.visible = false;
  head.add(disc);

  /* ══ THE SPRING ACTUATOR ══ */
  const spring = partIn("spring");
  const springG = grp();
  const bodyMat = litSolid("arm", 0x3a4047, { rough: 0.55, metal: 0.35 });
  const rodMat = litSolid("arm", 0xc0c6cb, { rough: 0.3, metal: 0.5 });
  const seatMat = litSolid("arm", 0x6b7279, { rough: 0.5, metal: 0.35 });
  piece(spring, springG, mergeGeometries([cyl(5.4, BODY - 4, 0.8, 32).translate(0, 4 + (BODY - 4) / 2, 0), cyl(4.4, 8, 0.5, 24).rotateX(Math.PI / 2)]), bodyMat, { edgeOpacity: 0.4 });
  piece(spring, springG, cyl(COIL.R + 2.2, 1.8, 0.4, 32).translate(0, COIL.from - 0.9, 0), seatMat, { edgeOpacity: 0.35 });
  const rod = piece(spring, springG, new THREE.CylinderGeometry(2.2, 2.2, 1, 24).translate(0, 0.5, 0), rodMat, { edges: false });
  const collar = piece(spring, springG, cyl(COIL.R + 2.2, 1.8, 0.4, 32), seatMat, { edgeOpacity: 0.35 });
  const eye = piece(spring, springG, cyl(3.6, 7, 0.4, 20).rotateX(Math.PI / 2), seatMat, { edgeOpacity: 0.3 });
  const springMat = springMaterial();
  const coil = new THREE.Mesh(helixGeometry(), springMat);
  coil.frustumCulled = false;
  coil.castShadow = false;
  coil.receiveShadow = true;
  spring.userData.part.mats.add(springMat);
  springG.add(coil);
  const springAnchor = anchor(springG, 0, 40, 0);

  /* ══ THE LINES ══ */
  const lines = partIn("lines");
  const linesG = grp();
  const pipeMat = (key, dead = true) => {
    const U = { uPress: { value: 0 }, uHead: { value: 0 }, uDead: { value: 0 }, uInk: { value: 0 }, uSteady: { value: 0 } };
    const mat = patched(solid(0x4a5158, { rough: 0.5, metal: 0.35 }), `023-pipe-${key}`, U, PIPE);
    mat.userData.dead = dead;
    return mat;
  };
  // on the arm (arm frame): pressure and return, from the barrel down to the pump's two fittings
  const pressPath = [[10, -4, PIPE_Z], [108, -4, PIPE_Z], [116, -2.2, PIPE_Z], [122, 6, PIPE_Z], [127, 12, PIPE_Z], [131, 14, PIPE_Z], [137.5, 14, PIPE_Z]];
  const retPath = [[10, 4, PIPE_Z], [102, 4, PIPE_Z], [110, 6.5, PIPE_Z], [117, 16, PIPE_Z], [123, 23.6, PIPE_Z], [128, 25, PIPE_Z], [137.5, 25, PIPE_Z]];
  // the live circuit, out of the barrel's +z end and up into the roof: its share of u (the arm's pipe is 0 → U_ARM)
  const livePath = [[0, 0, -BARREL.half - 1], [0, 0, -21], [4, 3, -27], [12, 18, -33], [24, 33, ROOF.z[LIVE]], [40, ROOF.y, ROOF.z[LIVE]], [ROOF.x1, ROOF.y, ROOF.z[LIVE]]];
  const armLen = pipeGeometry(pressPath, LINES.r).length;
  const liveLen = pipeGeometry(livePath, LINES.r).length;
  const U_ARM = armLen / (armLen + liveLen);
  const pressMat = pipeMat("press", false);
  const retMat = pipeMat("ret", false);
  piece(lines, armPivot, pipeGeometry([...pressPath].reverse(), LINES.r, 0, U_ARM).geo, pressMat, { edges: false });
  piece(lines, armPivot, pipeGeometry(retPath, LINES.r).geo, retMat, { edges: false });
  const roofMats = [];
  const roofOf = (i) => {
    const mat = pipeMat(i === LIVE ? "live" : "dead");
    roofMats.push(mat);
    const path = i === LIVE ? livePath : [[ROOF.x0, ROOF.y, ROOF.z[i]], [ROOF.x1, ROOF.y, ROOF.z[i]]];
    const m = piece(lines, linesG, pipeGeometry(path, LINES.r, i === LIVE ? U_ARM : 0, 1).geo, mat, { edges: false });
    m.userData.z = ROOF.z[i];
    return m;
  };
  const roofPipes = ROOF.z.map((_, i) => roofOf(i));
  // the fittings where the plane carries the lines on (and, forward, where the two others come through the wall)
  const fitMat = solid(0x5d646b, { rough: 0.5, metal: 0.38 });
  lines.userData.part.mats.add(fitMat);
  const ends = ROOF.z.map((z, i) => {
    const g = grp(linesG);
    g.position.z = z;
    piece(lines, g, cyl(3.8, 4, 0.4, 6).rotateZ(Math.PI / 2).translate(ROOF.x1 - 2, ROOF.y, 0), fitMat, { edgeOpacity: 0.35 });
    if (i !== LIVE) piece(lines, g, cyl(3.8, 4, 0.4, 6).rotateZ(Math.PI / 2).translate(ROOF.x0 + 2, ROOF.y, 0), fitMat, { edgeOpacity: 0.35 });
    return g;
  });

  /* ══ THE WIND (bench): streaks from −x through the disc, drawn as two crossed ribbons each, moved in the shader ══ */
  const STREAKS = 18;
  const windGeo = (() => {
    const rand = rng(23);
    const pos = [];
    const seed = [];
    const index = [];
    let v = 0;
    for (let i = 0; i < STREAKS; i++) {
      const a = (i / STREAKS) * TAU + rand() * 0.3;
      const r = 17 + ((i * 7) % STREAKS) * 2.3 + rand() * 4;
      const y = r * Math.cos(a);
      const z = r * Math.sin(a);
      const s0 = rand();
      const s1 = 0.85 + 0.3 * rand();
      for (const [dy, dz] of [[1, 0], [0, 1]]) {
        for (const [u, side] of [[0, -1], [0, 1], [1, 1], [1, -1]]) {
          pos.push(u, y + side * dy, z + side * dz); // x = 0 tail → 1 head; the ribbon's half-width is scaled in the shader
          seed.push(s0, s1, side);
        }
        index.push(v, v + 1, v + 2, v, v + 2, v + 3);
        v += 4;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 3));
    geo.setIndex(index);
    return geo;
  })();
  const WU = { uTime: { value: 0 }, uAmount: { value: 0 } };
  const W = { from: -230, to: 60, len: 90, half: 0.55 };
  const windMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: WU,
    vertexShader: /* glsl */ `
      uniform float uTime; attribute vec3 aSeed; varying float vU; varying float vX; varying float vFade; varying float vSide;
      void main() {
        float ph = fract(aSeed.x + uTime * 0.6 * aSeed.y);
        float head = ${f1(W.from)} + ph * ${f1(W.to - W.from)};
        vec3 p = position;
        p.x = head - (1.0 - position.x) * ${f1(W.len)};
        vU = position.x; vX = p.x; vSide = aSeed.z;
        vFade = smoothstep(0.0, 0.14, ph) * (1.0 - smoothstep(0.8, 1.0, ph));
        // the ribbon's two edges were laid ±1 cm: bring them to ±half
        vec3 c = vec3(p.x, position.y, position.z);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(c, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount; varying float vU; varying float vX; varying float vFade; varying float vSide;
      void main() {
        float through = smoothstep(${f1(PLANE - 30)}, ${f1(PLANE + 6)}, vX);
        vec3 col = mix(${glsl3(INK)} * 0.55, ${glsl3(VEILLE)} * 1.3, through);
        float along = vU * vU;
        gl_FragColor = vec4(col * along * vFade * uAmount, 1.0);
      }`,
  });
  // the ribbons' edges: ±W.half instead of ±1
  {
    const p = windGeo.attributes.position;
    const sd = windGeo.attributes.aSeed;
    for (let i = 0; i < p.count; i += 4) {
      // each quad: two vertices at side −1, two at +1, offset along y (first ribbon) or z (second)
      const ribbonZ = (i / 4) % 2 === 1;
      for (let k = 0; k < 4; k++) {
        const side = sd.getZ(i + k);
        if (ribbonZ) p.setZ(i + k, p.getZ(i + k) - side + side * W.half);
        else p.setY(i + k, p.getY(i + k) - side + side * W.half);
      }
    }
  }
  const windMesh = new THREE.Mesh(windGeo, windMat);
  windMesh.frustumCulled = false;
  windMesh.renderOrder = 6;
  windMesh.visible = false;
  head.add(windMesh);

  /* ══ anchors ══ */
  const A = {
    hinge: anchor(root, 0, 0, 0),
    door: anchor(doorPivot, DX, 1.5, -HOLE.z),
    spring: springAnchor,
    arm: anchor(armPivot, ARM.len / 2, 0, 0),
    hub: anchor(spin, 0, 0, 0),
    blade: anchor(spin, 0, PROP.r - 4, 0),
    pump: anchor(pumpG, 22, 0, 0),
    lines: anchor(linesG, 120, ROOF.y, ROOF.z[LIVE]),
    live: anchor(linesG, ROOF.x1, ROOF.y, ROOF.z[LIVE]),
  };

  const UP = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3();
    const parts = { door, arm, spring, prop, pump, lines };

  return {
    root, A, parts,
    update(P, time = 0) {
      const bench = (P.bench ?? 0) > 0.5;
      const doorK = clamp01(P.door ?? 0);
      const armK = clamp01(P.arm ?? 0);
      const e = clamp01(P.explode ?? 0);
      const turn = P.turn ?? 0;
      const whirl = clamp01(P.whirl ?? 0);
      const wind = bench ? clamp01(P.wind ?? 0) : 0;
      const press = clamp01(P.press ?? 0);
      const flow = clamp01(P.flow ?? 0);
      const linesK = clamp01(P.lines ?? 0);

      const away = 1 - smooth(ramp(e, 0, 0.3)); // the bay and its posts leave the exploded view
      benchG.visible = bench && away > 0.004;
      postGlass.uniforms.uAmount.value = away;
      for (const post of posts) post.children[0].material.opacity = 0.28 * away;
      bayGlass.uniforms.uAmount.value = (bench ? 1 : 0.55) * away;
      bayBox.visible = away > 0.004;
      bayLines.material.opacity = bayLines.material.userData.base * (bench ? 1 : 0.55) * away;
      setPartOpacity(bay, away);

      // the exploded view: each part in its own window
      const win = (a, b) => settle(clamp01((e - a) / b));
      const uDoor = win(0, 0.5);
      const uSpring = win(0.1, 0.55);
      const uProp = win(0.2, 0.55);
      const uPump = win(0.3, 0.55);
      const uLines = win(0.42, 0.55);

      // the door swings out fast, then settles past plumb
      const opened = -DOOR_OPEN * DEG * (1 - (1 - doorK) * (1 - doorK));
      doorPivot.rotation.x = opened + (OPEN.tilt * DEG - opened) * uDoor; // exploded: it lies up top, tilted to the camera
      doorPivot.position.set(OPEN.doorX * uDoor, SKIN + OPEN.door * uDoor, HOLE.z);

      // the arm, and the pod that hangs from it
      const th = (A0 - armK * TRAVEL) * DEG;
      armPivot.rotation.z = th;
      const free = smooth(ramp(armK, 0, 0.25));
      const snapped = Math.round(turn * 2) / 2;
      const angle = TAU * (snapped + (turn - snapped) * free);
      spin.rotation.x = angle;
      spin.position.x = PLANE - OPEN.prop * uProp;
      pumpG.position.x = OPEN.pump * uPump;
      const propOn = prop.userData.part.opacity;
      disc.visible = whirl * propOn > 0.004;
      disc.position.x = spin.position.x;
      disc.material.uniforms.uTurn.value = angle;
      disc.material.uniforms.uAmount.value = whirl * propOn;

      // the spring actuator: from the clevis to the arm's lug
      const c = Math.cos(th);
      const s = Math.sin(th);
      const px = LUG[0] * c - LUG[1] * s;
      const py = LUG[0] * s + LUG[1] * c;
      dir.set(px - F[0], py - F[1], 0);
      const L = dir.length();
      dir.multiplyScalar(1 / L);
      springG.position.set(F[0] + OPEN.spring[0] * uSpring, F[1] + OPEN.spring[1] * uSpring, OPEN.spring[2] * uSpring);
      springG.quaternion.setFromUnitVectors(UP, dir);
      const rodFrom = BODY - 6;
      rod.position.y = rodFrom;
      rod.scale.y = Math.max(1, L - rodFrom);
      collar.position.y = L - COIL.gap + 0.9;
      eye.position.y = L;
      springMat.userData.U.uLen.value = L - COIL.from - COIL.gap;
      springAnchor.position.y = L / 2;

      // the lines: the roof row moves up and spreads in the exploded view
      linesG.position.set(OPEN.lines[0] * uLines, OPEN.lines[1] * uLines, OPEN.lines[2] * uLines);
      const spread = 1 + (OPEN.spread - 1) * uLines;
      const mid = ROOF.z[LIVE];
      for (let i = 0; i < roofPipes.length; i++) {
        const dz = (ROOF.z[i] - mid) * (spread - 1);
        const dy = (i - LIVE) * OPEN.rise * uLines;
        roofPipes[i].position.set(0, dy, dz);
        ends[i].position.set(0, dy, ROOF.z[i] + dz);
      }
      // light in the lines: the head runs from the pump (0) to the bay's exit (1); in the plane it gets there at 0.15
      const headU = bench ? flow : clamp01(flow / 0.15);
      const linesOn = lines.userData.part.opacity;
      for (const mat of [pressMat, retMat, ...roofMats]) {
        const U = mat.userData.U;
        const live = mat === pressMat || mat === roofMats[LIVE];
        U.uPress.value = live ? press * linesOn : 0;
        U.uHead.value = headU;
        U.uSteady.value = mat === retMat ? press * 0.2 * smooth(ramp(headU, 0.1, 0.5)) * linesOn : 0;
        U.uDead.value = mat.userData.dead ? (1 - linesK) * 0.11 * (live ? 1 - press : 1) * linesOn : 0;
        U.uInk.value = mat.userData.dead ? linesK * 0.09 * (live ? 1 - press : 1) * linesOn : 0;
      }

      // what the voice names
      const lit = { door: P.litDoor ?? 0, arm: P.litArm ?? 0, prop: P.litProp ?? 0, pump: (P.litPump ?? 0) + 0.25 * press };
      for (const key in lits) for (const mat of lits[key]) mat.emissiveIntensity = 0.13 * clamp01(lit[key]);
      springMat.userData.U.uLit.value = clamp01(lit.arm);

      // the wind (bench): streaks flowing aft through the disc, ink, veille once through
      windMesh.visible = wind > 0.004 && armK > 0.9;
      WU.uTime.value = time;
      WU.uAmount.value = wind;
    },
  };
}
