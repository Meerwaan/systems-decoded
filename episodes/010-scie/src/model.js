// DOSSIER 010 — the blade of a table saw, its arbor block, and the brake cartridge that waits beside its teeth.
// Centimetres, y up. The blade stands in the plane x = 0; its top runs toward +z (you): seen from −x, where the
// camera mostly stands, it turns CLOCKWISE — the teeth come down at the front, rise again at the back.
//   · the blade: a steel plate, four expansion slots, forty teeth and their carbide tips, a flange and a nut.
//     Stopped (`blur` 0) it is that plate; at speed it is a disc and a crown of smeared teeth worked out in a
//     shader from the SAME tooth profile — between the two, each tooth simply stretches along its own path.
//   · the arbor block (cast iron, on the far side of the blade): it carries the arbor, its pulley, and the
//     cartridge on two pins; it swings about ARBOR.pivot, behind the blade.
//   · the cartridge, behind the blade and below it, where the teeth rise: a closed housing, and draped over its
//     corner the block of aluminium — the hero — its face hollowed to the blade's radius, 2.5 mm from the teeth.
//     Inside: the spring in its tube, pushing the block; a steel leaf along the tube, hooked over the spring's
//     plunger; a small black piece that pins the leaf shut; and over the black piece, a wire as thin as a hair,
//     stretched between two heavy conductors. Behind it all, the board and its capacitors.
//   The wire burns → the black piece is free → the leaf springs open → the plunger throws the block into the teeth.
// Groups: group → swing (about the pivot) → rig (origin: the blade's centre) → spin (the blade) + cart (the
// cartridge). On the bench the very same rig hangs from benchGroup, on a small stand.
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makePart, addMesh, solid, setPartOpacity, box, cyl, lathe, plate, chamfer, placed, mergeGeometries, fatLine, anchor } from "@kit/build3d.js";
import { BLADE, ARBOR, CARTRIDGE, TOUCH, KIT } from "./plan.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const HOT = new THREE.Color(1, 0.96, 0.88);
const KEY = [-30, 52, 38]; // where the studio's key light stands (kit/lib/stage.js)
const TOP = [-0.5, 0.86, -0.1]; // a second box, overhead and a little behind: its bow falls on the part of the blade that stands above the table
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const into = (frame, mesh) => (frame.add(mesh), mesh);
const f4 = (x) => x.toFixed(4);

/* ─────────────────────────────────────────────────────────── the blade's numbers */

const R = BLADE.r;
const TEETH = BLADE.teeth;
const PITCH = TAU / TEETH; // ≈ 2 cm of rim
const HALF = 0.11; // half the plate's thickness; the carbide is as wide as the kerf
const GULLET = 1; // how deep the gullets go under the tips' circle
// One tooth, read along its pitch in the direction it travels (0 → 1): at each depth under the tips' circle,
// where its steel begins (its back, rising gently to the tip) and where it ends (its face, leaning forward,
// then the round of the gullet). The plate is cut from these two tables, and the shader smears the same ones.
const BACK_T = [[0, 0.81], [0.07, 0.78], [0.34, 0.4], [0.62, 0.2], [0.93, 0.085], [1, 0]];
const FRONT_T = [[0, 0.86], [0.72, 0.795], [0.9, 0.84], [0.98, 0.93], [1, 1]];
const TIP_S = FRONT_T[0][1];
const CARBIDE = 0.18; // the tip, in pitches: 3.6 mm of carbide brazed on the face
const SLOT = { half: 0.08, hole: 0.3, depth: 3.4 };
const DARK = 0.55; // at full speed the plate is this much darker than stopped: the clear ring of its teeth is what reads
// angles on the blade are counted from its top, toward +z: the way it turns. With `turn` 0, a tip stands on TOUCH.
const TOUCH_A = Math.atan2(TOUCH[2] - BLADE.z, TOUCH[1] - BLADE.y);
const A0 = TOUCH_A - (3 + TIP_S) * PITCH;
/** A point of the blade's plane, [z, y]: at angle `alpha`, radius `r`, and `off` cm further along the rotation. */
const onBlade = (alpha, r, off = 0) => [r * Math.sin(alpha) + off * Math.cos(alpha), r * Math.cos(alpha) - off * Math.sin(alpha)];

/* ─────────────────────────────────────────────────────────── the cartridge's numbers
   Everything in it is drawn from the blade's centre, seen from the cartridge's own: `pol(radius, degrees)`,
   degrees counted from +z toward +y — the cartridge sits around 217°, and the teeth pass it going DOWN the scale. */

const C = CARTRIDGE;
const CO = [C.centre[0] - BLADE.x, C.centre[1] - BLADE.y, C.centre[2] - BLADE.z]; // the cartridge, from the blade's centre
const B = [BLADE.z - C.centre[2], BLADE.y - C.centre[1]]; // the blade's centre, from the cartridge's: [z, y]
const D2 = C.d / 2;
const HH = C.h / 2;
const W2 = C.w / 2;
const FACE = R + C.gap; // the block's hollow face
const BACK = FACE + 2.45; // its back
const WALL = BACK + 0.2; // the housing's own hollow, behind it
const pol = (r, deg) => [B[0] + r * Math.cos(deg * DEG), B[1] + r * Math.sin(deg * DEG)];
const arc = (r, from, to, step = 1.5) => {
  const n = Math.max(1, Math.ceil(Math.abs(to - from) / step));
  return Array.from({ length: n + 1 }, (_, i) => pol(r, from + ((to - from) * i) / n));
};
const around = ([cz, cy], r, from, to, step = 15) => {
  const n = Math.max(1, Math.ceil(Math.abs(to - from) / step));
  return Array.from({ length: n + 1 }, (_, i) => [cz + r * Math.cos((from + ((to - from) * i) / n) * DEG), cy + r * Math.sin((from + ((to - from) * i) / n) * DEG)]);
};
const PV = pol(17.2, 207); // the pin the block turns on — downstream of the bite: the teeth drag the block INTO the blade
const PIN2 = [-4.6, 3.7]; // the second pin: it only locates the cartridge
const AXIS = 226; // the spring pushes along this radius, at the block's free end
const SB = pol(20.9, AXIS); // the foot of its tube
const PSI = (270 - AXIS) * DEG; // how far the tube leans from upright
const SPRING = { foot: 0.3, len: 4.4, turns: 8, r: 0.74, wire: 0.16, head: 0.8 }; // foot + len + head = 5.5: the plunger rests on the block's back
const LEAF = { z: -1.25, from: 0.5, to: 5.05, x: -0.1, w: 0.8, open: 26 * DEG };
const WIRE = { x: 0.62, z: -1.9, from: 0.6, to: 4.65 }; // in the tube's frame: stretched along it, just beyond the leaf
const WIRE_MID = (WIRE.from + WIRE.to) / 2;
const THROW = { pawl: 5.83 * DEG, bite: 4.5 * DEG, lever: 5.6 }; // the block's swing, and how far the plunger follows per radian
// Opened, the cartridge is a ROW across the picture of a camera at az −58, in front of the blade: block · spring · wire · board.
const ROW_AZ = 58 * DEG;
const ROW = [Math.cos(ROW_AZ), Math.sin(ROW_AZ)]; // x, z: along the row
const NEAR = [-Math.sin(ROW_AZ), Math.cos(ROW_AZ)]; // toward that camera
const rowAt = (s, y = 0) => [NEAR[0] * 11 + ROW[0] * (s + 1.15) - CO[0], -9.6 + y - CO[1], NEAR[1] * 11 + ROW[1] * (s + 1.15) - CO[2]];
const SPOT = { block: -11.5, spring: -4.5, wire: 1.5, pcb: 9 }; // cm along the row
/** On the bench, opened: where each part of the cartridge stands — what a camera aims at ([x, y, z]). */
export const OPENED = Object.fromEntries(Object.entries(SPOT).map(([name, s]) => [name, rowAt(s).map((v, i) => v + CO[i] + KIT.blade[i])]));

/* ─────────────────────────────────────────────────────────── materials
   Three values of grey: what carries is dark (cast iron, the board), what works is in between (steel, the
   housing, the tube), what is machined is clear — and the block of aluminium is the clearest thing of all. */
const metals = () => ({
  hero: solid(0xeef0f1, { rough: 0.34, metal: 0.35, env: 1.1 }),
  carbide: solid(0xc6cbce, { rough: 0.45, metal: 0.3, env: 0.9 }),
  fine: solid(0xb2b8bd, { rough: 0.46, metal: 0.38, env: 1 }),
  steel: solid(0x8a929a, { rough: 0.5, metal: 0.35, env: 1 }),
  tube: solid(0x616a72, { rough: 0.55, metal: 0.35, env: 0.9 }),
  shell: solid(0x545d66, { rough: 0.62, metal: 0.05, coat: 0.25, coatRough: 0.5, env: 0.8 }),
  panel: solid(0x687179, { rough: 0.6, metal: 0.05, env: 0.8 }),
  cast: solid(0x30373e, { rough: 0.62, metal: 0.25, env: 0.8 }),
  dark: solid(0x1c2227, { rough: 0.6, metal: 0.05, env: 0.6 }),
  block: solid(0x4a535b, { rough: 0.65, metal: 0.05, env: 0.7 }),
  black: solid(0x0c1013, { rough: 0.8, metal: 0, env: 0.35 }),
  matt: solid(0x2a3036, { rough: 0.95, metal: 0, env: 0.35 }),
});

/* ─────────────────────────────────────────────────────────── geometry */

const v2 = ([a, b]) => new THREE.Vector2(a, b);
const shapeOf = (points, holes = []) => {
  const shape = new THREE.Shape(points.map(v2));
  for (const hole of holes) shape.holes.push(new THREE.Path(hole.map(v2)));
  return shape;
};
/** An outline drawn in the blade's plane ([z, y] points, or a Shape) given a thickness along x, centred on x = `xc`. */
const flat = (outline, depth, xc = 0, o) => plate(outline, depth, o).rotateY(-Math.PI / 2).translate(xc + depth / 2, 0, 0);
/** A closed polygon with every corner rounded. */
const rounded = (pts, r, steps = 3) => {
  const last = pts[pts.length - 1];
  const start = [(pts[0][0] + last[0]) / 2, (pts[0][1] + last[1]) / 2];
  return chamfer([start, ...pts, start], r, steps).slice(0, -1);
};
/** A turned piece (drawn standing on y = 0) laid along x: its foot at `x0`, growing toward −x (`way` −1) or +x, its axis through (y, z). */
const laid = (g, x0 = 0, way = -1, y = 0, z = 0) => g.rotateZ((-way * Math.PI) / 2).translate(x0, y, z);
/** A geometry drawn standing on y = 0, set at `p` and turned to stand along `dir`. */
const aimed = (geometry, p, dir) => geometry.clone().applyMatrix4(new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()), V(1, 1, 1)));
/** A hex head on its washer, standing on y = 0. `r`: across corners / 2. */
const bolt = (r, h = r * 0.75) => mergeGeometries([cyl(r * 1.45, 0.1, 0.03, 20).translate(0, 0.05, 0), cyl(r, h, 0.05, 6).translate(0, 0.1 + h / 2, 0)]);
const ring2 = ([cz, cy], r, n = 28) => Array.from({ length: n }, (_, i) => [cz + r * Math.cos((i / n) * TAU), cy + r * Math.sin((i / n) * TAU)]);

/** Lists of geometries by material ("steel", or "steel:hw" for small hardware: fainter edges), merged into one mesh each. */
function bins(part, frame, m) {
  const lists = new Map();
  return {
    put(key, ...geos) {
      if (!lists.has(key)) lists.set(key, []);
      lists.get(key).push(...geos.flat());
      return this;
    },
    flush() {
      for (const [key, geos] of lists) {
        const [name, small] = key.split(":");
        into(frame, addMesh(part, geos.length > 1 ? mergeGeometries(geos) : geos[0], m[name], { edgeOpacity: small ? 0.36 : name === "hero" ? 0.5 : 0.55 }));
      }
      lists.clear();
    },
  };
}

/** The blade's plate: forty teeth, four slots that end in a round hole, the arbor's hole. */
function bladeShape() {
  const pts = [];
  for (let k = 0; k < TEETH; k++) {
    const a = (s) => A0 + (k + s) * PITCH;
    if (k % (TEETH / 4) === 0) {
      // an expansion slot, cut from the bottom of this gullet toward the centre
      const a0 = a(0);
      const b0 = Math.asin(SLOT.half / SLOT.hole);
      pts.push(onBlade(a0, R - GULLET, -SLOT.half));
      for (let i = 0; i <= 12; i++) {
        const b = b0 + ((TAU - 2 * b0) * i) / 12;
        pts.push(onBlade(a0, R - SLOT.depth + SLOT.hole * Math.cos(b), -SLOT.hole * Math.sin(b)));
      }
      pts.push(onBlade(a0, R - GULLET, SLOT.half));
    } else pts.push(onBlade(a(0), R - GULLET));
    for (let i = BACK_T.length - 2; i >= 0; i--) pts.push(onBlade(a(BACK_T[i][1]), R - BACK_T[i][0]));
    for (let i = 0; i < FRONT_T.length - 1; i++) pts.push(onBlade(a(FRONT_T[i][1]), R - FRONT_T[i][0]));
  }
  return shapeOf(pts, [ring2([0, 0], 0.8, 32)]);
}

/** A compression spring standing on y = 0: `turns` of wire over `length`. */
function coil({ r, wire, turns, len }) {
  class Helix extends THREE.Curve {
    getPoint(t, target = new THREE.Vector3()) {
      const a = t * turns * TAU;
      return target.set(r * Math.sin(a), t * len, r * Math.cos(a));
    }
  }
  return new THREE.TubeGeometry(new Helix(), turns * 30, wire, 10, false);
}

/** A slot milled through the block, following its curve: radius `rm` ± `hw`, from `f0` to `f1` degrees. */
const arcSlot = (rm, hw, f0, f1) => [...arc(rm + hw, f0, f1, 1.2), ...around(pol(rm, f1), hw, f1 + 30, f1 + 150, 30), ...arc(rm - hw, f1, f0, 1.2), ...around(pol(rm, f0), hw, f0 + 210, f0 + 330, 30)];

/** Where a circle of radius `r` round the blade's centre cuts the corner of a box (its front at `zEdge`, its top at `yEdge`): the points of the cut. */
const cornerCut = (r, zEdge, yEdge) => {
  const y = B[1] - Math.sqrt(r * r - (B[0] - zEdge) ** 2);
  const z = B[0] - Math.sqrt(r * r - (B[1] - yEdge) ** 2);
  const f0 = Math.atan2(y - B[1], zEdge - B[0]) / DEG + 360;
  const f1 = Math.atan2(yEdge - B[1], z - B[0]) / DEG + 360;
  return [[zEdge, y], ...arc(r, f0, f1).slice(1, -1), [z, yEdge]];
};

/**
 * The bite, in the metal. The block is milled through with slots so that it CRUSHES: what lies on the blade's side
 * of a slot is driven back into it, and the free end is wrapped round the blade. The mesh and its edge lines are
 * moved together, in place (nothing is allocated). `centre`: the blade's centre in the mesh's frame, [z, y];
 * `rm` ± `hw`: where the slots are. → crush(k), k 0 → 1.
 */
function makeCrush(mesh, centre, rm, hw) {
  const pos = mesh.geometry.attributes.position;
  const rest = pos.array.slice();
  const seg = mesh.children.find((child) => child.isLineSegments2).geometry.attributes.instanceStart.data; // both ends of every edge, interleaved
  const restSeg = seg.array.slice();
  const warp = (src, dst, k) => {
    for (let i = 0; i < src.length; i += 3) {
      const dy = src[i + 1] - centre[1];
      const dz = src[i + 2] - centre[0];
      const r = Math.hypot(dy, dz);
      const f = Math.atan2(-dy, -dz) / DEG + 180;
      const shut = 0.52 * k * smooth(ramp(f, 208, 224)) * clamp01((rm + hw - r) / (2 * hw));
      const curl = 0.35 * k * smooth(ramp(f, 229, 237));
      const to = (r + shut - curl) / Math.max(r, 1e-3);
      dst[i + 1] = centre[1] + dy * to;
      dst[i + 2] = centre[0] + dz * to;
    }
  };
  let last = 0;
  return (k) => {
    if (k === last) return;
    last = k;
    warp(rest, pos.array, k);
    pos.needsUpdate = true;
    warp(restSeg, seg.array, k);
    seg.needsUpdate = true;
  };
}

/** The two pins the cartridge hangs on, and their clips — around the cartridge's centre. */
const pins = () => [PV, PIN2].flatMap(([z, y], i) => [laid(cyl(i ? 0.36 : 0.42, 5.9, 0.06, 20), 0.25, -1, y, z), laid(cyl(i ? 0.56 : 0.64, 0.12, 0.04, 20), -W2 - 0.14, -1, y, z)]);

/* ─────────────────────────────────────────────────────────── the blade's steel: one shader for the plate, the disc and the crown
   A turned and ground plate: two clearer bands; the studio's key light drawn out by the grinding into a bow that
   stays where it is while the blade turns under it (and breathes a little once it spins); the small signal the
   blade carries, slow rings of veille light. The crown adds the teeth: how much of each pixel a tooth covers
   while the picture is taken — `uSmear` pitches of travel — and how much of that is carbide. */
const piecewise = (name, table) =>
  `float ${name}(float d) { float v = ${f4(table[0][1])}; ${table
    .slice(1)
    .map(([d1, v1], i) => `v = mix(v, ${f4(v1)}, clamp((d - ${f4(table[i][0])}) / ${f4(d1 - table[i][0])}, 0.0, 1.0));`)
    .join(" ")} return v; }`;
const STEEL_HEAD = /* glsl */ `
  varying vec3 vLocal; varying vec3 vAy; varying vec3 vAz;
  uniform float uBlur, uSignal, uTime, uTurn, uSmear, uCrown; uniform vec3 uKey, uTop, uVeille;
  float sdTip = 0.0; // how much of this pixel is carbide
  float sdLit = 0.0; // …and how much of it belongs to the clear ring the teeth melt into
  // At full speed nothing of this is see-through: a dark plate, and round it the carbide drawn out into ONE clear
  // band, a tooth high, with a few lines turned in it. (d: depth under the tips' circle, cm.)
  float sdBand(float d) { return smoothstep(1.02, 0.76, d); }
  vec3 sdRing(float d, vec3 plate) {
    float line = 0.5 + 0.5 * sin(d * 21.0 + 0.6);
    return mix(plate, mix(vec3(0.66, 0.69, 0.71), vec3(0.33, 0.35, 0.37), 0.55 * line * line * line), sdBand(d));
  }
  ${piecewise("sdBack", BACK_T)}
  ${piecewise("sdFront", FRONT_T)}
  // how much of [0, x] a row of teeth covers, each from a to a + l of its pitch
  float sdRun(float x, float a, float l) { return floor(x) * l + clamp(fract(x) - a, 0.0, l); }
  // a softbox mirrored in a plate ground round and round: two wedges of light, along the half-vector's shadow on the plate
  float sdBow(vec3 along, vec3 nrm, vec3 toEye, vec3 toLight) {
    vec3 hv = normalize(toLight + toEye);
    float nh = dot(nrm, hv);
    float inPlane = sqrt(clamp(1.0 - nh * nh, 0.0, 1.0));
    float s = clamp(dot(along, hv) / max(inPlane, 1e-3), -1.0, 1.0);
    return pow(clamp(1.0 - s * s, 0.0, 1.0), 26.0) * smoothstep(0.12, 0.4, inPlane) * smoothstep(-0.1, 0.3, dot(nrm, toLight));
  }
`;
const STEEL_BODY = /* glsl */ `
  {
    float r0 = length(vLocal.yz);
    float ground = smoothstep(${f4(R - 3.7)}, ${f4(R - 3.3)}, r0);
    float boss = 1.0 - smoothstep(3.3, 3.7, r0);
    diffuseColor.rgb *= 1.0 + 0.15 * ground + 0.1 * boss - 0.05 * (1.0 - ground) * (1.0 - boss);
    // at speed the plate goes dark (the ring round it is what reads), and its turning marks show: rings stay rings
    diffuseColor.rgb *= mix(1.0, ${f4(DARK)}, uBlur) * (1.0 + 0.08 * uBlur * sin(r0 * 7.5));
  }
`;
const STEEL_RIM = /* glsl */ `
  {
    float d = ${f4(R)} - length(vLocal.yz);
    diffuseColor.rgb = sdRing(d, diffuseColor.rgb * ${f4(DARK)});
    sdLit = sdBand(d);
    sdTip = sdLit;
  }
`;
const STEEL_CROWN = /* glsl */ `
  {
    vec2 p = vLocal.yz;
    float r0 = max(length(p), 1.0);
    float pix = max(length(dFdx(p)), length(dFdy(p)));
    float d = ${f4(R)} - r0;
    float a = sdBack(d);
    float b = sdFront(d);
    float q = (atan(p.y, p.x) - ${f4(A0)}) / ${f4(PITCH)};
    float w = max(uSmear, 1.4 * pix / (r0 * ${f4(PITCH)}));
    float cov = (sdRun(q + 0.5 * w, a, b - a) - sdRun(q - 0.5 * w, a, b - a)) / w;
    float ac = max(a, b - ${f4(CARBIDE)});
    float lc = (b - ac) * (1.0 - smoothstep(0.7, 0.78, d));
    float tip = (sdRun(q + 0.5 * w, ac, lc) - sdRun(q - 0.5 * w, ac, lc)) / w;
    float even = smoothstep(0.7, 1.0, uBlur); // toward full speed no tooth is left: they close into the ring
    float inside = smoothstep(-0.7 * pix, 0.7 * pix, d);
    float carbide = clamp(tip / max(cov, 1e-3), 0.0, 1.0);
    float alpha = mix(clamp(cov, 0.0, 1.0), 1.0, even) * inside * uCrown;
    if (alpha < 0.004) discard;
    vec3 plate = diffuseColor.rgb * mix(1.0, ${f4(DARK)}, uBlur);
    diffuseColor.rgb = mix(mix(plate, vec3(0.63, 0.66, 0.68), carbide), sdRing(d, plate), even);
    sdLit = even * sdBand(d);
    sdTip = mix(carbide, sdBand(d), even);
    diffuseColor.a *= alpha;
  }
`;
const STEEL_LIGHT = /* glsl */ `
  {
    vec2 p = vLocal.yz;
    float r0 = length(p);
    vec3 along = normalize(-p.y * vAy + p.x * vAz + vec3(1e-6)); // the way the plate was ground: round and round
    vec3 toEye = normalize(vViewPosition);
    float bow = sdBow(along, normal, toEye, normalize((viewMatrix * vec4(uKey, 0.0)).xyz)) + 0.55 * sdBow(along, normal, toEye, normalize((viewMatrix * vec4(uTop, 0.0)).xyz));
    float ang = atan(p.y, p.x) + 6.2832 * uTurn; // an angle that does not turn with the blade
    float shimmer = 1.0 + uBlur * (0.16 * sin(2.0 * ang - uTime * 0.8) + 0.08 * sin(r0 * 1.9 + uTime * 0.55));
    float rings = 1.0 + 0.12 * uBlur * sin(r0 * 7.5);
    totalEmissiveRadiance += vec3(0.93, 0.96, 1.0) * bow * (0.06 + 0.5 * uBlur) * shimmer * rings * smoothstep(2.6, 4.2, r0) * (1.0 + 0.8 * sdTip);
    totalEmissiveRadiance += vec3(0.9, 0.89, 0.84) * 0.2 * sdLit; // the ring is the clearest thing of the picture: it carries a little light of its own
    float breath = 0.78 + 0.22 * sin(uTime * 1.4);
    float wave = 0.5 + 0.5 * sin(r0 * 0.9 - uTime * 1.5);
    totalEmissiveRadiance += uVeille * uSignal * breath * (0.02 + 0.17 * wave * wave * wave) * smoothstep(1.2, 3.4, r0);
  }
`;
/** `kind`: "plate" (the stopped blade, and the disc it becomes) · "crown" (the teeth, drawn out: see-through until they close into a ring) · "rim" (that ring, solid). */
function bladeSteel(U, kind = "plate") {
  const crown = kind === "crown";
  const mat = solid(0xa1a9b0, { rough: 0.45, metal: 0.28, env: 1, double: kind !== "plate" });
  if (kind === "rim") mat.polygonOffset = false;
  if (crown) {
    Object.assign(mat, { transparent: true, depthWrite: false, polygonOffset: false });
    Object.assign(mat.userData, { transparent: true, depthWrite: false });
  }
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLocal; varying vec3 vAy; varying vec3 vAz;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocal = position; vAy = (modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz; vAz = (modelViewMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${STEEL_HEAD}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n${crown ? STEEL_CROWN : kind === "rim" ? STEEL_RIM : STEEL_BODY}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${STEEL_LIGHT}`);
  };
  mat.customProgramCacheKey = () => `sd010-${kind}`;
  return mat;
}

/* ─────────────────────────────────────────────────────────── light that has a place */

/** A ball of light with no edge: brightest where it faces the eye, nothing at its rim. */
const softGlow = (power = 2.2) =>
  new THREE.ShaderMaterial({
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

/**
 * What the bite throws out, where the teeth enter the aluminium — the film is in slow motion, everything here is slow.
 *   sparks  born again every period: alive whenever `uAmount` is up, a pure function of time
 *   chips   flakes of aluminium: each leaves in its turn as `uBite` goes up, then hangs there, turning in the light
 */
function makeSpray({ count, seed, chips }) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4); // phase, period (s), size (cm), a number of its own
  for (let i = 0; i < count; i++) {
    const f = (217 + rand() * 21) * DEG; // along the bite, from the block's free end
    const r = R - 0.1 - rand() * 0.5;
    const side = rand() < 0.5 ? -1 : 1;
    pos.set([side * (0.2 + rand() * 0.8), r * Math.sin(f), r * Math.cos(f)], i * 3);
    // thrown sideways out of the kerf, and back the way the teeth came from; little goes on with them (the block is there)
    const back = rand() * (chips ? 3.2 : 5.5);
    const out = rand() * (chips ? 2.2 : 3.2);
    const wide = (chips ? 1.2 : 2.2) + rand() * (chips ? 4 : 6);
    vel.set([side * wide, back * Math.cos(f) + out * Math.sin(f) + (rand() - 0.5) * 3, -back * Math.sin(f) + out * Math.cos(f) + (rand() - 0.5) * 3], i * 3);
    seeds.set([rand(), 1.3 + rand() * 1.3, chips ? 0.07 + Math.pow(rand(), 2) * 0.13 : 0.1 + Math.pow(rand(), 2) * 0.2, rand()], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aVel", new THREE.BufferAttribute(vel, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = {
    uT: { value: 0 }, uAmount: { value: 0 }, uBite: { value: 0 },
    uHot: { value: chips ? new THREE.Color(0xeef0f1).multiplyScalar(1.5) : HOT.clone().multiplyScalar(4.5) },
    uCool: { value: chips ? new THREE.Color(0xeef0f1).multiplyScalar(1.1) : SIGNAL.clone().multiplyScalar(2.6) },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: chips
        ? /* glsl */ `
        uniform float uT, uBite; attribute vec3 aVel; attribute vec4 aSeed; varying float vAge; varying float vK;
        void main() {
          float u = clamp((uBite - 0.55 * aSeed.x) / 0.45, 0.0, 1.0);
          float run = 1.0 - (1.0 - u) * (1.0 - u);
          vec3 p = position + aVel * (run + 0.05 * sin(uT * 0.5 + aSeed.w * 6.28));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          vAge = 0.25;
          vK = smoothstep(0.0, 0.12, u) * (0.55 + 0.45 * sin(uT * 1.1 + aSeed.w * 40.0));
          gl_PointSize = u <= 0.0 ? 0.0 : max(2.2, aSeed.z * projectionMatrix[1][1] * ${H2} / max(0.5, -mv.z));
        }`
        : /* glsl */ `
        uniform float uT, uAmount; attribute vec3 aVel; attribute vec4 aSeed; varying float vAge; varying float vK;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          float run = age - 0.42 * age * age; // it leaves fast, the air holds it back
          vec3 p = position + aVel * aSeed.y * run + vec3(0.0, -1.8 * age * age * aSeed.y, 0.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          vAge = age;
          vK = sin(3.14159 * age) * uAmount;
          gl_PointSize = max(2.2, aSeed.z * projectionMatrix[1][1] * ${H2} / max(0.5, -mv.z));
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; varying float vAge; varying float vK;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - d), 1.6) * vK;
          if (a < 0.003) discard;
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.0, 0.7, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 5;
  return { points, uniforms };
}

/* ─────────────────────────────────────────────────────────── the saw */

/**
 * → { group, benchGroup, A, update(p, time, px) }, p (see FIRST in world.js):
 *   bench    1: the blade and its cartridge hang from benchGroup (the blade's centre on KIT.blade) — the same ones
 *   turn     the blade's angle, in turns (its top toward +z). Under `blur` 0.5, keep it slower than 0.2 turn/s: teeth that hop from one place to the next flicker
 *   blur     1 at full speed: a disc, a crown of smeared teeth · 0 every tooth sharp. In between each tooth is drawn out along its path
 *   signal   the small signal the blade carries: slow rings of veille light on its plate
 *   lid      the cartridge's housing: 1 closed → 0 gone
 *   wire     1 whole → 0 burnt through: it parts in the middle, its two ends draw back · flash: the light of it (0–1.5)
 *   pawl     0 → 1: the black piece is free, the leaf springs open, the spring throws the block into the teeth (6 mm into them at its free end)
 *   bite     0 → 1: the teeth dig on (12 mm), the block is dragged round its pin onto the blade; chips, slow sparks
 *   drop     0 → 1: blade, arbor block and cartridge swing down about ARBOR.pivot (in the saw only)
 *   explode  0 → 1: the housing lifts and dissolves, the parts come out in a row in front of the blade
 *   lit…     the part the voice names glows faintly veille
 */
export function buildSaw() {
  const group = new THREE.Group();
  const benchGroup = new THREE.Group();
  const fx = {};

  const swing = new THREE.Group(); // what the blade's momentum swings down
  swing.position.set(...ARBOR.pivot);
  group.add(swing);
  const kit = new THREE.Group(); // on the bench
  kit.position.set(...KIT.blade);
  benchGroup.add(kit);
  const HOME = [BLADE.x - ARBOR.pivot[0], BLADE.y - ARBOR.pivot[1], BLADE.z - ARBOR.pivot[2]];
  const rig = new THREE.Group(); // origin: the blade's centre
  rig.position.set(...HOME);
  swing.add(rig);
  const spin = new THREE.Group();
  rig.add(spin);

  /* ── the blade ── */
  const U = {
    uBlur: { value: 1 }, uSignal: { value: 0 }, uTime: { value: 0 }, uTurn: { value: 0 }, uSmear: { value: 1.6 }, uCrown: { value: 1 },
    uKey: { value: V(...KEY).normalize() }, uTop: { value: V(...TOP).normalize() }, uVeille: { value: VEILLE.clone() },
  };
  const sharp = makePart("blade");
  spin.add(sharp);
  const plateMat = bladeSteel(U);
  addMesh(sharp, flat(bladeShape(), HALF * 2, 0, { bevel: 0.03, round: 1 }), plateMat, { edgeOpacity: 0.6, edgeWidth: 1.8 });
  {
    // the carbide: brazed on each face, wider than the plate, its corner on the tips' circle
    const tip = flat([[0.015, 0.012], [-0.115, -0.72], [-0.475, -0.72], [-0.345, -0.03]], BLADE.kerf, 0, { bevel: 0.035, round: 1 });
    const tips = [];
    for (let k = 0; k < TEETH; k++) {
      const a = A0 + (k + TIP_S) * PITCH;
      tips.push(placed(tip, { pos: [0, R * Math.cos(a), R * Math.sin(a)], rotX: a }));
    }
    addMesh(sharp, mergeGeometries(tips), metals().carbide, { edgeOpacity: 0.5, edgeWidth: 1.8 });
  }
  const plateLine = [...sharp.userData.part.mats].find((mat) => mat.isLineMaterial);
  plateLine.userData.rest = plateLine.color.clone();

  // at speed: the plate is a disc (it writes its depth: a blade is not see-through), the teeth a crown round it
  // (its rim is ground to a knife: a square one would show its wall, a dark ring between the plate and its teeth)
  const disc = new THREE.Mesh(laid(lathe([[0.8, -0.1], [R - GULLET - 0.6, -0.1], [R - GULLET, 0], [R - GULLET - 0.6, 0.1], [0.8, 0.1]], 128, { crease: 40 }), 0), bladeSteel(U));
  disc.castShadow = true;
  disc.receiveShadow = true;
  const crown = new THREE.Mesh(new THREE.RingGeometry(R - GULLET - 0.14, R + 0.06, 256, 1).rotateY(Math.PI / 2), bladeSteel(U, "crown"));
  crown.renderOrder = 1;
  // …and at full speed the crown has closed into a ring: the same ring, solid — it hides what is behind it, like the plate
  const rim = new THREE.Mesh(new THREE.RingGeometry(R - GULLET - 0.14, R, 256, 1).rotateY(Math.PI / 2), bladeSteel(U, "rim"));
  rim.receiveShadow = true;
  spin.add(disc, crown, rim);

  const hub = makePart("hub");
  spin.add(hub);
  {
    const m = metals();
    const b = bins(hub, hub, m);
    b.put("fine", laid(lathe([[0.82, 0], [2.7, 0], [2.7, 0.22], [2.2, 0.38], [0.82, 0.38]], 64, { bevel: 0.05, round: 2 }), -HALF, -1)); // the outer flange
    b.put("steel", laid(lathe([[0.8, 0.38], [1.5, 0.38], [1.5, 0.95], [1.32, 1.1], [0.8, 1.1]], 48, { bevel: 0.06, round: 2 }), -HALF, -1)); // the arbor nut (drawn round: it spins)
    b.put("fine", laid(lathe([[0, 1.28], [0.2, 1.28], [0.3, 1.4], [0.62, 1.4], [0.79, 1.3], [0.79, 0.3], [0, 0.3]].reverse(), 40, { bevel: 0.03 }), -HALF, -1)); // the end of the arbor
    b.put("fine", laid(lathe([[0.82, 0], [2.7, 0], [2.7, 0.3], [2, 0.55], [0.82, 0.55]], 64, { bevel: 0.05, round: 2 }), HALF, 1)); // the arbor's own flange
    b.flush();
  }

  /* ── the arbor block: cast iron, on the far side of the blade ── */
  const arbor = makePart("arbor");
  swing.add(arbor);
  {
    const m = metals();
    const b = bins(arbor, arbor, m);
    const [, py, pz] = ARBOR.pivot;
    const w = (z, y) => [z - pz, y - py]; // a point of the saw, seen from the pivot
    const bc = w(BLADE.z, BLADE.y);
    const cc = w(C.centre[2], C.centre[1]);
    // from the pivot's eye to the arbor's bearing, and a lobe hanging under them: the cartridge is pinned on it
    const outline = [
      ...around([0, 0], 2.6, 95, 265),
      ...chamfer([[-0.23, -2.59], [cc[0] - 7.4, cc[1] - 6.1], [cc[0] + 7.4, cc[1] - 6.1], [bc[0] + 2.45 * Math.cos(-75 * DEG), bc[1] + 2.45 * Math.sin(-75 * DEG)]], 1.8, 4).slice(1, -1),
      ...around(bc, 2.45, -75, 95),
    ];
    const windowHole = rounded([[4, 1.2], [5.4, -1.6], [20.6, 0.3], [19, 3]], 0.7); // a window cast in it, above the cartridge
    b.put("cast", flat(shapeOf(outline, [windowHole, ring2([0, 0], 1.1), ring2(bc, 0.9)]), 2.2, 3.8, { bevel: 0.22 }));
    b.put("cast", laid(lathe([[1.08, 0], [2.6, 0], [2.6, 3.2], [1.08, 3.2]], 56, { bevel: 0.2, round: 2 }), 2.3, 1)); // the pivot's eye
    b.put("fine", laid(cyl(1.05, 9.6, 0.12, 40), 3.5)); // the pivot shaft
    b.put("steel:hw", laid(cyl(1.6, 0.45, 0.1, 40), 1.9), laid(cyl(1.6, 0.45, 0.1, 40), 5.9)); // its collars
    b.put("cast", laid(lathe([[0.9, 0], [2.1, 0], [2.1, 0.5], [2.45, 0.5], [2.45, 4.4], [2, 4.4], [2, 4.8], [0.9, 4.8]], 64, { bevel: 0.1, round: 2 }), 1, 1, bc[1], bc[0])); // the bearing housing
    b.put("fine", laid(cyl(0.79, 9.7, 0.08, 32), 5.45, -1, bc[1], bc[0])); // the arbor
    const pulley = [[0.8, 0], [2.3, 0], [2.3, 0.3]];
    for (let i = 0; i < 4; i++) pulley.push([1.96, 0.55 + i * 0.5], [2.3, 0.8 + i * 0.5]);
    pulley.push([2.3, 2.6], [0.8, 2.6]);
    b.put("tube", laid(lathe(pulley, 64, { bevel: 0.04 }), 6.7, 1, bc[1], bc[0]));
    for (const g of pins()) b.put("fine:hw", g.translate(CO[0] + HOME[0], CO[1] + HOME[1], CO[2] + HOME[2]));
    b.flush();
  }

  /* ── on the bench: a matt stand — a post behind the blade, a bracket with the two pins behind the cartridge ── */
  const stand = makePart("stand");
  kit.add(stand);
  {
    const m = metals();
    const b = bins(stand, stand, m);
    const floor = -KIT.blade[1];
    b.put("matt", box(11.5, 0.9, 35, 0.35).translate(3, floor + 0.45, -7.5));
    b.put("matt", flat([[-2.9, floor + 0.9], [2.9, floor + 0.9], ...around([0, 0], 1.9, -30, 210)], 1.2, 1.9, { bevel: 0.2 }));
    b.put("matt", flat(rounded([[CO[2] - 7, floor + 0.9], [CO[2] + 7, floor + 0.9], [CO[2] + 7, CO[1] + 5.4], [CO[2] - 7, CO[1] + 5.4]], 1.2), 0.8, 3.1, { bevel: 0.2 }));
    b.put("fine:hw", laid(cyl(0.79, 0.9, 0.05, 28), 0.95));
    for (const g of pins()) b.put("fine:hw", g.translate(...CO));
    b.flush();
  }

  /* ── the cartridge ── */
  const cart = new THREE.Group();
  cart.position.set(...CO);
  rig.add(cart);
  /** A part of the cartridge in its slot: the slot stands on the part's own middle (`home`, in the cartridge), and carries it to its place in the row. */
  const slot = (name, home, target, turn = 0) => {
    const g = new THREE.Group();
    g.position.set(...home);
    cart.add(g);
    const part = makePart(name);
    g.add(part);
    const frame = new THREE.Group(); // the cartridge's own frame, seen from the slot
    frame.position.set(-home[0], -home[1], -home[2]);
    part.add(frame);
    return { g, part, frame, home, target, turn };
  };
  /** The spring's frame: its origin at the foot of the tube, y up the tube toward the block, −z the side the leaf is on. */
  const tubeFrame = (s) => {
    const frame = new THREE.Group();
    frame.position.set(0, SB[1], SB[0]);
    frame.rotation.x = PSI;
    s.frame.add(frame);
    return frame;
  };
  const up = [Math.sin(PSI), Math.cos(PSI)]; // the tube's own "up", [z, y]
  const inTube = (y, z) => [0, SB[1] + y * up[1] - z * up[0], SB[0] + y * up[0] + z * up[1]];

  // the housing: one moulded piece (it fades as a whole, with its own materials), a cover screwed on it
  const lid = slot("lid", [0, 0, 0], [0, 0, 0]);
  {
    const m = metals();
    const b = bins(lid.part, lid.frame, m);
    b.put("shell", flat(rounded([[D2, -HH], ...cornerCut(WALL, D2, HH), [-D2, HH], [-D2, -HH]], 0.5), C.w, 0, { bevel: 0.22 }));
    b.put("panel", flat(rounded([[D2 - 0.7, -HH + 0.7], ...cornerCut(WALL + 0.7, D2 - 0.7, HH - 0.7), [-D2 + 0.7, HH - 0.7], [-D2 + 0.7, -HH + 0.7]], 0.3), 0.14, -W2 - 0.05, { bevel: 0.05 }));
    for (const y of [-2.9, -2.3, -1.7]) b.put("shell:hw", box(0.12, 0.24, 2.8, 0.05).translate(-W2 - 0.14, y, -3)); // three ribs: a grip
    for (const [z, y] of [[-5, -3.8], [5, -3.8], [-5, 1.3]]) b.put("fine:hw", aimed(bolt(0.24, 0.14), V(-W2 - 0.1, y, z), V(-1, 0, 0)));
    for (const [z, y] of [PV, PIN2]) b.put("shell:hw", laid(lathe([[0.48, 0], [0.92, 0], [0.92, 0.16], [0.48, 0.16]], 32, { bevel: 0.04 }), -W2 - 0.1, -1, y, z)); // the bosses the pins come through
    b.flush();
  }

  // the block of aluminium: a crescent hugging the blade, three slots milled through it, an eye for its pin
  const blockMid = pol((FACE + BACK) / 2, 219);
  const block = slot("block", [0, blockMid[1], blockMid[0]], rowAt(SPOT.block), -51.5 * DEG);
  const pawl = new THREE.Group(); // it turns on its pin
  pawl.position.set(0, PV[1], PV[0]);
  block.frame.add(pawl);
  {
    const rel = (pts) => pts.map(([z, y]) => [z - PV[0], y - PV[1]]);
    const outline = [...arc(FACE, 236, 201), pol(FACE + 0.75, 199.7), pol(BACK - 0.5, 199.9), ...arc(BACK, 201.3, 205.5), ...around(PV, 0.95, 75, 300), ...arc(BACK, 213, 236), pol(BACK - 0.9, 237.3)];
    const holes = [arcSlot(14.2, 0.32, 226.8, 233.2), arcSlot(14.2, 0.32, 217.6, 224), arcSlot(14.2, 0.32, 209.4, 214.8), ring2(PV, 0.45)];
    const mesh = into(pawl, addMesh(block.part, flat(shapeOf(rel(outline), holes.map(rel)), 1.9, 0, { bevel: 0.07 }), metals().hero, { edgeOpacity: 0.55 }));
    fx.crush = makeCrush(mesh, [B[0] - PV[0], B[1] - PV[1]], 14.2, 0.32);
  }

  // the spring: its tube (a cup, a guide ring, half a shell behind), the coil, the plunger — and the steel leaf that holds it
  const springMid = inTube(2.6, 0);
  const spring = slot("spring", springMid, rowAt(SPOT.spring), -PSI);
  {
    const m = metals();
    const frame = tubeFrame(spring);
    const b = bins(spring.part, frame, m);
    b.put("tube", lathe([[0, 0], [1.12, 0], [1.12, 1], [0.98, 1], [0.98, 0.14], [0, 0.14]], 48, { bevel: 0.05 }));
    b.put("tube", lathe([[0.98, 3.6], [1.12, 3.6], [1.12, 4.05], [0.98, 4.05], [0.98, 3.6]], 48, { bevel: 0.04 }));
    b.flush();
    const shell = toCreasedNormals(new THREE.LatheGeometry([[0.99, 0.95], [1.11, 0.95], [1.11, 3.65], [0.99, 3.65], [0.99, 0.95]].map(v2), 20, 25 * DEG, 130 * DEG), 0.6);
    into(frame, addMesh(spring.part, shell, solid(0x4c555d, { rough: 0.6, metal: 0.3, env: 0.8, double: true }), { edgeOpacity: 0.4 }));
    fx.coil = into(frame, addMesh(spring.part, coil(SPRING), m.fine, { edges: false }));
    fx.coil.position.y = SPRING.foot - 0.12;
    fx.plunger = into(frame, addMesh(spring.part, lathe([[0, 0], [0.9, 0], [0.9, 0.28], [0.5, 0.28], [0.5, 0.64], [0.36, SPRING.head], [0, SPRING.head]], 40, { bevel: 0.05 }), m.fine, { edgeOpacity: 0.5 }));
    // the leaf: riveted on the cup, lying along the tube, its end hooked over the plunger's rim. It wants to spring open
    fx.leaf = new THREE.Group();
    fx.leaf.position.set(0, LEAF.from, LEAF.z);
    frame.add(fx.leaf);
    const len = LEAF.to - LEAF.from;
    const leaf = mergeGeometries([box(LEAF.w, len + 0.14, 0.16, 0.04).translate(LEAF.x, len / 2 + 0.07, 0), box(LEAF.w, 0.14, 0.7, 0.04).translate(LEAF.x, len + 0.07, 0.27)]);
    into(fx.leaf, addMesh(spring.part, leaf, solid(0xd9dde0, { rough: 0.3, metal: 0.4, env: 1.2 }), { edgeOpacity: 0.7 }));
    into(frame, addMesh(spring.part, aimed(bolt(0.2, 0.12), V(LEAF.x, 0.5, LEAF.z - 0.05), V(0, 0, -1)), m.steel, { edgeOpacity: 0.36 }));
  }

  // the trigger: two heavy conductors standing out of a terminal block, the wire stretched between them,
  // and under the middle of the wire the small black piece that pins the leaf shut
  const wireMid = inTube(WIRE_MID, WIRE.z);
  const trigger = slot("trigger", [WIRE.x, wireMid[1], wireMid[2]], rowAt(SPOT.wire), Math.PI / 2 - PSI);
  {
    const m = metals();
    const frame = tubeFrame(trigger);
    const b = bins(trigger.part, frame, m);
    b.put("block", box(0.6, 5, 1, 0.1).translate(1.17, WIRE_MID, WIRE.z - 0.05));
    for (const y of [WIRE.from, WIRE.to]) {
      b.put("hero", box(1.15, 0.7, 0.7, 0.09).translate(0.925, y, WIRE.z));
      b.put("steel:hw", aimed(bolt(0.22, 0.12), V(0.62, y, WIRE.z - 0.35), V(0, 0, -1))); // the screw that pinches the wire
    }
    b.flush();
    // when the voice names the wire, it is the wire that lights up, and the two conductors that hold it — not the block they stand in
    fx.posts = { solids: [m.hero], lines: [frame.children.find((child) => child.material === m.hero).children[0].material] };
    fx.black = into(frame, addMesh(trigger.part, box(1.45, 0.7, 0.5, 0.08), m.black, { edgeColor: BRAND.ink, edgeOpacity: 0.85 }));
    fx.black.position.set(0.225, WIRE_MID, LEAF.z - 0.35);
    // the wire, 0.25 mm of it: a line that never gets thinner than a line. Two halves — it parts in the middle
    const half = (WIRE.to - WIRE.from) / 2;
    fx.wire = [1, -1].map((way) => {
      const g = new THREE.Group();
      g.position.set(WIRE.x, way > 0 ? WIRE.from : WIRE.to, WIRE.z);
      const line = fatLine([[0, 0, 0], [0, way * half, 0]], { color: 0xffffff, width: 3.4 });
      line.renderOrder = 4;
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), softGlow(2.6)); // its molten end
      bead.position.y = way * half;
      bead.renderOrder = 5;
      g.add(line, bead);
      frame.add(g);
      return { g, line, bead, way };
    });
    // the flash of it: a core that swells and dies small, a wider breath of veille round it, and their light on what is near
    fx.core = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), softGlow(3.2));
    fx.halo = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), softGlow(3));
    fx.lamp = new THREE.PointLight(0xc8ffe2, 0, 18, 2);
    for (const o of [fx.core, fx.halo, fx.lamp]) {
      o.position.set(WIRE.x - 0.1, WIRE_MID, WIRE.z);
      o.renderOrder = 6;
      frame.add(o);
    }
    fx.wireAt = anchor(frame, WIRE.x, WIRE_MID, WIRE.z);
  }

  // the electronics: a board against the far wall, two capacitors, the thyristor that empties them into the wire
  const pcb = slot("pcb", [1.2, -0.8, -1.45], rowAt(SPOT.pcb));
  {
    const m = metals();
    const b = bins(pcb.part, pcb.frame, m);
    b.put("dark", flat(rounded([[-5.5, -4.3], [2.6, -4.3], [2.6, -0.2], [0.2, 2.7], [-5.5, 2.7]], 0.3), 0.16, 1.58, { bevel: 0.04 }));
    for (const z of [-4.45, -2.75]) {
      b.put("tube", cyl(0.75, 2.5, 0.12, 36).translate(0.72, -2.85, z));
      b.put("fine:hw", cyl(0.6, 0.08, 0.03, 36).translate(0.72, -1.58, z));
    }
    b.put("black", box(0.42, 1.45, 1, 0.06).translate(1.25, 0.6, -4.5)); // the thyristor
    b.put("fine:hw", box(0.1, 1.95, 1, 0.03).translate(1.45, 0.85, -4.5)); // its tab
    b.put("black", box(0.2, 1.4, 1.4, 0.04).translate(1.4, 0.7, -2.3)); // the chip that listens to the blade
    b.put("tube", box(0.85, 0.95, 3, 0.1).translate(1.05, 2.05, -3.5)); // the plug to the saw
    for (const [z, y, tall] of [[-0.9, 1.6, 0], [-0.9, 0.9, 0], [-0.9, 0.2, 0], [-1.2, -1.2, 1], [-0.5, -1.2, 1], [1.6, -3.4, 0], [1.6, -2.7, 0]]) {
      b.put("fine:hw", box(0.12, tall ? 0.6 : 0.28, tall ? 0.28 : 0.6, 0.03).translate(1.44, y, z));
    }
    b.flush();
  }
  const SLOTS = [[block, 0.08, 0.68], [spring, 0.18, 0.78], [trigger, 0.28, 0.88], [pcb, 0.38, 1]];

  /* ── the bite: sparks, chips, a glow where the teeth enter ── */
  fx.sparks = makeSpray({ count: 140, seed: 11, chips: false });
  fx.chips = makeSpray({ count: 70, seed: 23, chips: true });
  fx.burn = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), softGlow(2.4));
  fx.burn.position.set(0, R * Math.sin(231 * DEG), R * Math.cos(231 * DEG));
  fx.burn.renderOrder = 5;
  rig.add(fx.sparks.points, fx.chips.points, fx.burn);

  /* ── what lights up when the voice names a part: its metal, and the lines of its edges ── */
  const whole = (part) => ({ solids: [...part.userData.part.mats].filter((mat) => mat.isMeshStandardMaterial), lines: [...part.userData.part.mats].filter((mat) => mat.isLineMaterial) });
  const lamps = [whole(block.part), whole(spring.part), fx.posts].map(({ solids, lines }) => {
    for (const line of lines) line.userData.rest = line.color.clone();
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.glow = 0.2 * (1 - 0.85 * Math.min(1, 0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b));
    }
    return { solids, lines, on: -1 };
  });
  const light = (lamp, k) => {
    if (lamp.on === k) return;
    lamp.on = k;
    for (const mat of lamp.solids) {
      mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k);
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.45 * k);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };
  const WIRE_REST = new THREE.Color(0xf6f3ea).multiplyScalar(1.15);
  const WIRE_LIT = VEILLE.clone().multiplyScalar(1.9);
  const WIRE_HOT = HOT.clone().multiplyScalar(2.4);

  const A = {
    blade: anchor(rig, 0, 0, 0),
    top: anchor(rig, 0, R, 0),
    tooth: anchor(spin, -BLADE.kerf / 2, R * Math.cos(TOUCH_A), R * Math.sin(TOUCH_A)),
    cartridge: anchor(cart, 0, 0, 0),
    block: anchor(block.g, 0, 0, 0),
    spring: anchor(spring.g, 0, 0, 0),
    wire: fx.wireAt,
    pcb: anchor(pcb.g, 0, 0, 0),
    pivot: anchor(group, ...ARBOR.pivot),
  };

  let benched = false;
  return {
    group, benchGroup, A,
    update(p, time = 0) {
      const onBench = p.bench > 0.5;
      if (onBench !== benched) {
        benched = onBench;
        (onBench ? kit : swing).add(rig);
        rig.position.set(...(onBench ? [0, 0, 0] : HOME));
      }
      swing.rotation.x = clamp01(p.drop) * ARBOR.drop * DEG;
      spin.rotation.x = TAU * p.turn;

      /* the blade: sharp, or drawn out by its own speed */
      const blur = clamp01(p.blur);
      setPartOpacity(sharp, 1 - smooth(ramp(blur, 0.05, 0.17)));
      disc.visible = blur > 0.02;
      rim.visible = blur > 0.985;
      crown.visible = disc.visible && !rim.visible;
      U.uBlur.value = blur;
      U.uSmear.value = 1.6 * Math.pow(blur, 1.5);
      U.uCrown.value = smooth(ramp(blur, 0.02, 0.12));
      U.uTime.value = time;
      U.uTurn.value = p.turn;
      U.uSignal.value = p.signal;
      plateLine.color.copy(plateLine.userData.rest).lerp(VEILLE, 0.45 * clamp01(p.signal) * (0.78 + 0.22 * Math.sin(time * 1.4)));

      /* the cartridge: closed, seen through, or laid out in a row */
      const k = clamp01(p.explode);
      setPartOpacity(lid.part, clamp01(p.lid) * (1 - smooth(ramp(k, 0.04, 0.4))));
      lid.g.position.y = 3.2 * ease(ramp(k, 0, 0.4));
      for (const [s, from, to] of SLOTS) {
        const u = ease(ramp(k, from, from + (to - from) * 0.7)); // out of the blade's plane first…
        const v = ease(ramp(k, from + (to - from) * 0.3, to)); // …then along the row
        s.g.position.set(mix(s.home[0], s.target[0], u), mix(s.home[1], s.target[1], u), mix(s.home[2], s.target[2], v));
        s.g.rotation.x = s.turn * v;
      }

      /* the wire, and the light of its burning */
      const whole = clamp01(p.wire);
      const flash = Math.max(0, p.flash);
      const litWire = clamp01(p.litWire);
      const molten = 4 * whole * (1 - whole);
      for (const { g, line, bead, way } of fx.wire) {
        g.visible = whole > 0.02;
        g.scale.y = Math.max(0.02, Math.pow(whole, 0.8));
        g.rotation.x = -way * 0.45 * (1 - whole); // its ends curl away from the leaf as they draw back
        line.material.color.copy(WIRE_REST).lerp(WIRE_LIT, litWire).lerp(WIRE_HOT, Math.min(1, flash + molten));
        bead.visible = molten > 0.02;
        bead.scale.set(1, 1 / g.scale.y, 1);
        bead.material.uniforms.uColor.value.copy(HOT).multiplyScalar(Math.min(2.6, 2.4 * molten));
      }
      fx.core.visible = fx.halo.visible = flash > 0.01;
      fx.core.scale.setScalar(0.14 + 0.42 * flash);
      fx.core.material.uniforms.uColor.value.copy(HOT).multiplyScalar(Math.min(3, 3.2 * flash));
      fx.halo.scale.setScalar(0.5 + 1.9 * flash);
      fx.halo.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(Math.min(1.3, 1.05 * flash));
      fx.lamp.intensity = 13 * flash;

      /* the release: the black piece flies, the leaf opens, the spring throws the block; then the teeth dig on */
      const go = clamp01(p.pawl);
      const bite = clamp01(p.bite);
      const swingIn = THROW.pawl * go + THROW.bite * bite;
      pawl.rotation.x = -swingIn;
      fx.crush(bite);
      const reach = SPRING.len + THROW.lever * swingIn;
      fx.coil.scale.y = (reach + 0.12) / SPRING.len;
      fx.plunger.position.y = SPRING.foot + reach;
      fx.leaf.rotation.x = -LEAF.open * smooth(ramp(go, 0, 0.3));
      const free = ease(ramp(go, 0.02, 0.55));
      fx.black.position.set(0.225, WIRE_MID + 0.7 * free, LEAF.z - 0.35 - 2.1 * free);
      fx.black.rotation.x = -2.4 * free;

      fx.sparks.points.visible = bite > 0.01;
      fx.sparks.uniforms.uT.value = time;
      // (they fly only while the teeth still move: under a stopped blade — the chute, the kit "à la poubelle" — they were reborn for ever)
      fx.sparks.uniforms.uAmount.value = Math.min(1, bite * 1.6) * Math.min(1, blur / 0.1);
      fx.chips.points.visible = bite > 0.01;
      fx.chips.uniforms.uT.value = time;
      fx.chips.uniforms.uBite.value = bite;
      const burning = 4 * bite * (1 - bite);
      fx.burn.visible = bite > 0.01;
      fx.burn.scale.setScalar(1 + 1.6 * burning);
      fx.burn.material.uniforms.uColor.value.copy(HOT).lerp(SIGNAL, 0.5).multiplyScalar(0.95 * burning + 0.32 * bite);

      light(lamps[0], clamp01(p.litBlock));
      light(lamps[1], clamp01(p.litSpring));
      light(lamps[2], Math.max(litWire, 0.8 * Math.min(1, flash)));
    },
  };
}
