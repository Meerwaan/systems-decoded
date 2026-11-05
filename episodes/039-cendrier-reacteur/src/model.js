// DOSSIER 039 — the SYSTEM, solid: the EPR's core catcher (docs/039-decors.md, § model.js).
//   pit       the reactor pit's sacrificial concrete lining (floor + wall), the zirconia bricks behind it. The wall is
//             cut open by a 110° wedge turned toward the usual cameras (az −95 … +15): its section shows the two
//             layers. The floor is whole (the first frame is taken inside the pit).
//   plug      the melt plug at the floor's centre: a steel collar round a cap of sacrificial concrete, the steel gate
//             under it — the hero, the lightest                                        (« la porte fusible »)
//   channel   the drop under the plug and the open transfer trough to the chamber, lined with zirconia
//   chamber   the spreading chamber's cooling structure: concrete over cast-iron plates, ribs underneath (along z),
//             the central channel, the low side walls and the slots behind them where the water rises; the triggers
//             on the slab. Its far end (z1) is a clean SECTION: from az −18 the water's way reads in cross-section.
//   pool      the IRWST sector: dark concrete basin, cut at both ends, its still water
//   valves    the two passive flooding valves on the pool's inner wall, their levers, cables and pipes
// Frame: plan.js (origin = the pit floor's centre, the path toward +z). Built in place: the same object on the plant
// and on the bench. update() runs sixteen times a frame: no allocation in it.
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, setGlow, cyl, box, lathe, anchor, fatLine, lineMat, mergeGeometries, placed } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { PIT, PLUG, SHAFT, CHANNEL, CHAMBER, CENTRAL, FLOOD, POOL, VALVES, TRIGGERS, PIPES, HEAP } from "./plan.js";

const DEG = Math.PI / 180;
/** Where each part goes in the exploded view (cm, at explode 1), and when it leaves. Nothing may go down: the bench's
 *  floor is at −560, just under the chamber. Seen from az −18 the depth stacks in the frame: the lining rises under the
 *  lifted vessel (batiment.js: +700), the plug comes out of it halfway, the channel stays, the chamber comes forward;
 *  the pool and its valves rise to the right of the vessel — the water waits up there. Nothing in front of the plug. */
const SPREAD = {
  pit: [0, 480, 0], plug: [0, 160, 0], channel: [0, 0, 60], chamber: [0, 0, 380], pool: [0, 500, -1500], valves: [0, 500, -1500],
};
const DELAY = { pit: 0, plug: 0.05, channel: 0.1, chamber: 0.14, pool: 0.18, valves: 0.18 };
const SPAN = 0.78;

/* the wedge cut out of the pit's wall, and what the arc keeps */
const CUT_MID = -40 * DEG;
const CUT_HALF = 55 * DEG;
const ARC0 = CUT_MID + CUT_HALF; // 15°
const ARC = 2 * Math.PI - 2 * CUT_HALF; // 250°
const ERODE = PIT.sac * 0.6; // how far the melt eats the lining at its worst (cm)
const PLUG_ERODE = 22; // the mean of that at the plug's rim

const C = {
  collar: 0xccd0d3, gate: 0xaab0b5, sac: 0x96948e, zirc: 0x76797c, iron: 0x50565d, slab: 0x5d5f5e, basin: 0x3c3f42,
  valve: 0x737a80, lever: 0xbcc1c5, trig: 0xa6abaf,
};
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const TMP = new THREE.Color();

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// leaves fast, arrives with a slight overshoot and settles (the kit's explode())
const settle = (u) => easeInOut(u) + Math.sin(Math.PI * u) * Math.sin(Math.PI * u) * 0.055 * (u > 0.5 ? 1 : 0.25);

/* ───────────── value noise, the same in JS (the erosion's shape) and in GLSL (the surfaces) ───────────── */
function hash3(i, j, k) {
  let h = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k, 1440662683);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise3(x, y, z) {
  const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z);
  const f = (t) => t * t * (3 - 2 * t);
  const u = f(x - i), v = f(y - j), w = f(z - k);
  const L = (a, b, t) => a + (b - a) * t;
  return L(
    L(L(hash3(i, j, k), hash3(i + 1, j, k), u), L(hash3(i, j + 1, k), hash3(i + 1, j + 1, k), u), v),
    L(L(hash3(i, j, k + 1), hash3(i + 1, j, k + 1), u), L(hash3(i, j + 1, k + 1), hash3(i + 1, j + 1, k + 1), u), v),
    w,
  );
}
/** How deep the melt has eaten at a point of the lining, at eaten 1: a dish, rough at a hand's scale. */
const bite = (x, y, z) => ERODE * (0.55 + 0.4 * noise3(x * 0.03, y * 0.03, z * 0.03) + 0.3 * (noise3(x * 0.09 + 7, y * 0.09, z * 0.09) - 0.5));

const GLSL_NOISE = /* glsl */ `
float cnH(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float cnN(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(cnH(i), cnH(i + vec3(1.0, 0.0, 0.0)), f.x), mix(cnH(i + vec3(0.0, 1.0, 0.0)), cnH(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(cnH(i + vec3(0.0, 0.0, 1.0)), cnH(i + vec3(1.0, 0.0, 1.0)), f.x), mix(cnH(i + vec3(0.0, 1.0, 1.0)), cnH(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}`;

let programs = 0;
/** A lit solid whose colour depends on where the fragment stands in its mesh's frame (oP, oN) — 017's idiom. Each
 *  material gets its own program key: two must never share uniforms. */
function patterned(mat, uniforms, decl, colour) {
  const key = `sd039-${programs++}`;
  mat.userData.U = uniforms;
  mat.userData.finish = false; // concrete and bricks are not machined
  mat.customProgramCacheKey = () => key;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 oP; varying vec3 oN;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\noP = position; oN = normal;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 oP; varying vec3 oN;\n${GLSL_NOISE}\n${decl}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n{ ${colour} }`);
  };
  return mat;
}

/** Sacrificial concrete: light, grainy, a few pores; where the melt has eaten (uEaten, inside uR / uY) it darkens. */
function concrete(color, { r = [0, 0], y = [0, 0, 0], scorch = 0, deep = 0 } = {}) {
  const U = {
    uEaten: { value: 0 }, uScorch: { value: scorch }, uDeep: { value: deep }, uR: { value: new THREE.Vector2(...r) }, uY: { value: new THREE.Vector3(...y) },
  };
  return patterned(solid(color, { rough: 0.93, metal: 0 }), U, "uniform float uEaten, uScorch, uDeep; uniform vec2 uR; uniform vec3 uY;", /* glsl */ `
    float fw = length(fwidth(oP));
    float g1 = mix(cnN(oP * 0.08), 0.5, smoothstep(0.12, 0.3, fw * 0.08));
    float g2 = mix(cnN(oP * 0.33 + 5.1), 0.5, smoothstep(0.12, 0.3, fw * 0.33));
    float pore = smoothstep(0.8, 0.88, cnN(oP * 0.6 + 11.0)) * (1.0 - smoothstep(0.1, 0.25, fw * 0.6));
    diffuseColor.rgb *= (0.86 + 0.18 * g1 + 0.12 * (g2 - 0.5) - 0.16 * pore) * (1.0 - uDeep * smoothstep(120.0, 420.0, oP.y));
    float sc = uEaten * uScorch * (1.0 - smoothstep(uR.x, uR.y, length(oP.xz)))
      * smoothstep(uY.x - 1.0, uY.x, oP.y) * (1.0 - smoothstep(uY.y, uY.z, oP.y));
    diffuseColor.rgb *= 1.0 - clamp(sc, 0.0, 1.0) * (0.45 + 0.3 * g2);`);
}

/** Zirconia bricks: 25 × 12.5 cm in running bond, dark joints that melt into their mean under the pixel. `cyl`: the
 *  bricks follow a cylinder round y (their seam turned into the cut); else planar faces. */
function bricks(color, { cyl: round = false } = {}) {
  const beta = CUT_MID - Math.PI; // the atan seam falls in the wedge that is cut away
  const U = { uCyl: { value: round ? 1 : 0 }, uRot: { value: new THREE.Vector2(Math.cos(beta), Math.sin(beta)) } };
  return patterned(solid(color, { rough: 0.8, metal: 0 }), U, "uniform float uCyl; uniform vec2 uRot;", /* glsl */ `
    vec2 q;
    if (abs(oN.y) > 0.6) q = oP.xz;
    else if (uCyl > 0.5) {
      vec2 rp = vec2(oP.x * uRot.x - oP.z * uRot.y, oP.x * uRot.y + oP.z * uRot.x);
      q = vec2(atan(rp.x, rp.y) * length(oP.xz), oP.y);
    } else q = vec2(abs(oN.x) > abs(oN.z) ? oP.z : oP.x, oP.y);
    float row = floor(q.y / 12.5);
    float uu = q.x / 25.0 + 0.5 * mod(row, 2.0);
    float fv = fract(q.y / 12.5); float fu = fract(uu);
    float av = fwidth(q.y / 12.5); float au = fwidth(uu);
    float jv = 1.0 - smoothstep(0.05 - av, 0.05 + av, min(fv, 1.0 - fv));
    float ju = 1.0 - smoothstep(0.025 - au, 0.025 + au, min(fu, 1.0 - fu));
    float joint = mix(max(jv, ju), 0.13, smoothstep(0.12, 0.35, max(av, au * 2.0)));
    float id = cnH(vec3(floor(uu), row, 3.0));
    diffuseColor.rgb *= mix(0.9 + 0.16 * id, 0.42, joint);`);
}

/** A basic veil the kit's setPartOpacity understands (its base opacity tracked). */
function veil(color, opacity, { double = false } = {}) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: double ? THREE.DoubleSide : THREE.FrontSide, fog: false });
  Object.assign(mat.userData, { base: opacity, transparent: true, depthWrite: false });
  return mat;
}

/** Water that reads as water at 270 px (retouche 05/11: the additive ink read as a pale grey block): normal-blended,
 *  a dark veille tint that thickens with depth (h: its depth in the mesh's frame, 0 = flat), a pale sheen where its
 *  faces turn away, and on a surface (band > 0) a few broad, soft reflections, world-fixed, drifting slowly. uK: the
 *  part's opacity × how much it shows; uLit: named; uT: time. */
function waterMat({ deep = 0.06, shallow = 0.16, alpha = 0.8, h = 0, fres = 0.3, band = 0 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    uniforms: {
      uTint: { value: VEILLE.clone() }, uHi: { value: INK.clone() }, uDeep: { value: deep }, uShallow: { value: shallow }, uA: { value: alpha },
      uH: { value: h }, uFres: { value: fres }, uBand: { value: band }, uK: { value: 1 }, uLit: { value: 0 }, uT: { value: 0 },
    },
    vertexShader: /* glsl */ `varying float vY; varying vec3 vW; varying vec3 vN; varying vec3 vV;
      void main() { vY = position.y; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `uniform vec3 uTint, uHi; uniform float uDeep, uShallow, uA, uH, uFres, uBand, uK, uLit, uT; varying float vY; varying vec3 vW; varying vec3 vN; varying vec3 vV;
      ${GLSL_NOISE}
      void main() {
        float t = uH > 0.0 ? clamp(vY / uH, 0.0, 1.0) : 1.0;
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        vec3 col = uTint * mix(uDeep, uShallow, t * t) * (1.0 + 1.4 * uLit);
        float sheen = uFres * g * g;
        float b = 0.0;
        if (uBand > 0.0) {
          float n = cnN(vec3(vW.x * 0.004, uT * 0.04, vW.z * 0.004));
          float s = sin((vW.x * 0.6 + vW.z) * 0.012 + n * 1.5 + uT * 0.25);
          b = uBand * smoothstep(0.84, 0.99, s);
        }
        col += uHi * (sheen + b) + uTint * 0.25 * b;
        gl_FragColor = vec4(col, clamp(uA + sheen + b, 0.0, 1.0) * uK);
      }`,
  });
  Object.assign(mat.userData, { base: 1, transparent: true, depthWrite: false });
  return mat;
}

/** A lathe on part of a turn ([r, y] points), its corners creased. */
function wedge(profile, phi0, phiLen, segments) {
  const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments, phi0, phiLen);
  return toCreasedNormals(geo, 35 * DEG);
}

/** A lathe whose surface the melt eats: a morph target (influence = eaten) moves each vertex by disp(x, y, z, r). */
function eatenLathe(profile, segments, phi0, phiLen, disp) {
  const base = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments, phi0, phiLen);
  base.computeVertexNormals();
  const moved = base.clone();
  const p = moved.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const r = Math.hypot(x, z) || 1;
    const [dr, dy] = disp(x, y, z, r);
    const k = (r + dr) / r;
    p.setXYZ(i, x * k, y + dy, z * k);
  }
  moved.computeVertexNormals();
  base.morphAttributes.position = [p];
  base.morphAttributes.normal = [moved.attributes.normal];
  return base;
}

/** A circle (or arc) of points at height y. */
const arc = (r, y, a0, len, n = 96) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + (len * i) / n;
  return [r * Math.sin(a), y, r * Math.cos(a)];
});

/** A cylinder from a to b ([x,y,z]): static (geometry the length of the segment). */
function rod(part, a, b, r, mat, o = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const mesh = addMesh(part, cyl(r, len, o.bevel ?? 0.6, o.segments ?? 24), mat, o);
  mesh.position.copy(A).add(B).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return mesh;
}

/** A glow line (lit… / guard): a fat line that is only drawn when it shines. */
function glowLine(part, points, width = 5) {
  const line = fatLine(points, { color: BRAND.veille, width, opacity: 1 });
  line.material.userData.noGuard = true;
  line.visible = false;
  part.userData.part.mats.add(line.material);
  part.add(line);
  return line;
}
function shine(line, k, hue = VEILLE) {
  line.visible = k > 0.02;
  if (line.visible) line.material.color.copy(hue).multiplyScalar(k);
}

export function buildSystem() {
  const root = new THREE.Group();
  const R = rng(39);

  /* ═════════════ THE PIT: sacrificial lining, zirconia behind ═════════════ */
  const pit = makePart("pit");
  const rIn = PIT.r, rSac = PIT.r + PIT.sac, rZ = rSac + PIT.zirc;
  const yZ = -PIT.sac - PIT.zirc; // the zirconia's bottom (−62)
  // the lining's materials: the wall's inner face scorches below 150 cm, the floor's top inside r 300
  // (`deep`: the wall darkens toward its top, out of the light of what lies at its foot — a pit, not a drum)
  const wallMat = concrete(0x4a4640, { r: [rIn + ERODE + 6, rIn + ERODE + 12], y: [-1, 90, 150], scorch: 1, deep: 0.55 });
  const floorMat = concrete(C.sac, { r: [rIn - 15, rIn], y: [-PIT.sac + 14, 1, 2], scorch: 1 });
  const rimMat = concrete(C.sac); // the cut faces and the wall's top: fresh section, never eaten
  const zircMat = bricks(C.zirc, { cyl: true });

  // the wall's inner face (it recedes and roughens), from the top down: its normal faces the axis
  const wallProfile = [];
  for (let y = PIT.top; y >= -0.01; y -= 10) wallProfile.push([rIn, Math.max(0, y)]);
  const taper = (phi) => {
    let a = phi - ARC0;
    a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return smooth(0, 8 * DEG, Math.min(a, ARC - a)); // nothing eaten at the cut: its section stays clean
  };
  const wallIn = addMesh(pit, eatenLathe(wallProfile, 140, ARC0, ARC, (x, y, z) => {
    const amp = 1 - smooth(60, 140, y);
    return [bite(x, y, z) * amp * taper(Math.atan2(x, z)), 0];
  }), wallMat, { edges: false });
  // the floor's top, from the wall's foot in to the plug's collar, then down the hole: it sinks, dished
  const floorProfile = [[rSac, 0]];
  for (let r = rIn; r > PLUG.ring + 1; r -= 8) floorProfile.push([r, 0]);
  floorProfile.push([PLUG.ring + 1, 0], [PLUG.ring, 0], [PLUG.ring, -0.6]);
  for (let y = -10; y >= -PIT.sac; y -= 10) floorProfile.push([PLUG.ring, y]);
  const floorTop = addMesh(pit, eatenLathe(floorProfile, 160, 0, 2 * Math.PI, (x, y, z, r) => {
    const amp = r < rIn + 0.5 ? 1 - smooth(rIn - 30, rIn, r) : 0;
    const d = bite(x, 0, z) * amp;
    return [0, y > -0.01 ? -d : -d * (y + PIT.sac) / PIT.sac];
  }), floorMat, { edges: false });
  // the floor's rim (seen in the cut), the wall's top, the two faces of the cut
  addMesh(pit, wedge([[rSac, -PIT.sac], [rSac, 0]], 0, 2 * Math.PI, 160), rimMat, { edgeOpacity: 0.55 });
  addMesh(pit, wedge([[rSac, PIT.top], [rIn, PIT.top]], ARC0, ARC, 140), rimMat, { edgeOpacity: 0.6 });
  for (const [phi, side] of [[ARC0, -1], [ARC0 + ARC, 1]]) {
    const cap = addMesh(pit, box(PIT.sac, PIT.top, 1.2, 0.3), rimMat, { edgeOpacity: 0.6 });
    const rm = rIn + PIT.sac / 2;
    cap.position.set(rm * Math.sin(phi) + side * 0.6 * Math.cos(phi), PIT.top / 2, rm * Math.cos(phi) - side * 0.6 * Math.sin(phi));
    cap.rotation.y = phi - Math.PI / 2;
    const zc = addMesh(pit, box(PIT.zirc, PIT.top - yZ, 1.2, 0.3), zircMat, { edgeOpacity: 0.5 });
    const rz = rSac + PIT.zirc / 2;
    zc.position.set(rz * Math.sin(phi) + side * 0.6 * Math.cos(phi), (PIT.top + yZ) / 2, rz * Math.cos(phi) - side * 0.6 * Math.sin(phi));
    zc.rotation.y = phi - Math.PI / 2;
  }
  // the zirconia: the wall's skin of bricks (cut like the lining) and the layer under the floor (holed for the plug)
  addMesh(pit, wedge([[rSac, yZ], [rZ, yZ], [rZ, PIT.top], [rSac, PIT.top], [rSac, yZ]], ARC0, ARC, 140), zircMat, { edgeOpacity: 0.5 });
  addMesh(pit, wedge([[PLUG.ring, yZ], [rZ, yZ], [rZ, -PIT.sac], [PLUG.ring, -PIT.sac], [PLUG.ring, yZ]], 0, 2 * Math.PI, 160), zircMat, { edgeOpacity: 0.5 });
  const pitLines = [
    glowLine(pit, arc(rIn, PIT.top + 1, ARC0, ARC)),
    glowLine(pit, arc(rSac, PIT.top + 1, ARC0, ARC)),
  ];
  // chips that fall from the eaten wall: seeded, periodic, alive from the first frame they are asked for
  const CHIPS = 12;
  const chipMat = concrete(C.sac);
  const chips = Array.from({ length: CHIPS }, () => {
    const s = 9 + R() * 8;
    const mesh = addMesh(pit, box(s, s * 0.65, s * 0.8, 1.5), chipMat, { edges: false });
    mesh.userData.c = {
      phi: (60 + R() * 170) * DEG, y0: 30 + R() * 85, T: 1.4 + R() * 0.9, ph: R(), spin: [R() * 6 - 3, R() * 6 - 3], drift: 12 + R() * 20,
    };
    mesh.visible = false;
    return mesh;
  });

  /* ═════════════ THE PLUG: collar, cap, gate ═════════════ */
  const plug = makePart("plug");
  const body = new THREE.Group(); // what sinks, sags and drops
  plug.add(body);
  const collarMat = solid(C.collar, { rough: 0.38, metal: 0.45 });
  const capMat = concrete(C.sac);
  const gateMat = solid(C.gate, { rough: 0.42, metal: 0.45 });
  const collar = addMesh(plug, lathe([[PLUG.r, -PIT.sac], [PLUG.ring, -PIT.sac], [PLUG.ring, 0], [PLUG.r, 0], [PLUG.r, -PIT.sac]], 96, { bevel: 1.2 }), collarMat, { edgeOpacity: 0.7 });
  body.add(collar);
  const capPivot = new THREE.Group(); // at the cap's foot: it sags from the top
  capPivot.position.y = -PIT.sac;
  body.add(capPivot);
  const capGeo = cyl(PLUG.r - 0.3, PIT.sac, 1.2, 64);
  capGeo.translate(0, PIT.sac / 2, 0);
  const cap = addMesh(plug, capGeo, capMat, { edgeOpacity: 0.5 });
  capPivot.add(cap);
  const gate = addMesh(plug, cyl(PLUG.ring - 0.5, PLUG.h, 1, 64), gateMat, { edgeOpacity: 0.7 });
  gate.position.y = PLUG.y - PLUG.h / 2;
  body.add(gate);
  // its light: the veille ring that names it, the red heat that has a place (the cap's centre), the open hole's lip
  const ringGlow = glow(BRAND.veille, 0);
  const ring = addMesh(plug, new THREE.RingGeometry(PLUG.ring + 1.5, PLUG.ring + 8, 96).rotateX(-Math.PI / 2), ringGlow, { edges: false });
  ring.position.y = 0.5;
  const hotMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uColor: { value: new THREE.Color(BRAND.signal) }, uK: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 uColor; uniform float uK; varying vec2 vUv; void main(){ float r = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0); float f = pow(1.0 - r, 1.6); gl_FragColor = vec4(uColor * uK * f, 1.0); }",
  });
  Object.assign(hotMat.userData, { base: 1, transparent: true, depthWrite: false });
  plug.userData.part.mats.add(hotMat);
  const hot = new THREE.Mesh(new THREE.PlaneGeometry(2 * PLUG.r, 2 * PLUG.r).rotateX(-Math.PI / 2), hotMat);
  hot.renderOrder = 4;
  hot.visible = false;
  capPivot.add(hot);
  const lipMat = glow(BRAND.signal, 0, { additive: true });
  const lip = addMesh(plug, new THREE.RingGeometry(PLUG.ring - 1, PLUG.ring + 12, 96).rotateX(-Math.PI / 2), lipMat, { edges: false });
  lip.visible = false;

  /* ═════════════ THE CHANNEL: the drop, the open trough ═════════════ */
  const channel = makePart("channel");
  const chanMat = bricks(C.zirc);
  const shaftMat = bricks(C.zirc, { cyl: true });
  const shaftBottom = CHANNEL.from[1] + CHANNEL.h; // the trough's top over the drop (−120)
  addMesh(channel, lathe([[SHAFT.r, shaftBottom], [SHAFT.r + 12, shaftBottom], [SHAFT.r + 12, SHAFT.top], [SHAFT.r, SHAFT.top], [SHAFT.r, shaftBottom]], 64, { bevel: 0.8 }), shaftMat, { edgeOpacity: 0.5 });
  const [, cy0, cz0] = CHANNEL.from;
  const [, cy1, cz1] = CHANNEL.to;
  const slope = Math.atan2(cy0 - cy1, cz1 - cz0);
  const trough = new THREE.Group(); // its own frame: z along the trough, y up its walls
  trough.position.set(0, cy0, cz0);
  trough.rotation.x = slope;
  channel.add(trough);
  const back = -(SHAFT.r + 12);
  const run = (cz1 - cz0) / Math.cos(slope);
  const L = run - back;
  const wt = 15;
  const tw = CHANNEL.w / 2;
  trough.add(addMesh(channel, box(CHANNEL.w + 2 * wt, wt, L, 2), chanMat, { pos: [0, -wt / 2, back + L / 2], edgeOpacity: 0.5 }));
  for (const s of [-1, 1]) trough.add(addMesh(channel, box(wt, CHANNEL.h, L, 2), chanMat, { pos: [s * (tw + wt / 2), CHANNEL.h / 2, back + L / 2], edgeOpacity: 0.5 }));
  trough.add(addMesh(channel, box(CHANNEL.w, CHANNEL.h, wt, 2), chanMat, { pos: [0, CHANNEL.h / 2, back - wt / 2], edgeOpacity: 0.5 }));
  const lipAt = (s, zl) => [s * (tw + wt / 2), cy0 + CHANNEL.h * Math.cos(slope) - zl * Math.sin(slope) + 1.5, cz0 + CHANNEL.h * Math.sin(slope) + zl * Math.cos(slope)];
  const chanLines = [-1, 1].map((s) => glowLine(channel, [lipAt(s, back), lipAt(s, run)]));

  /* ═════════════ THE CHAMBER: the cooling structure, its far end a section ═════════════ */
  const chamber = makePart("chamber");
  const F = CHAMBER.floor;
  const X0 = CHAMBER.x0, X1 = CHAMBER.x1, Z0 = CHAMBER.z0, Z1 = CHAMBER.z1;
  const W = X1 - X0, LZ = Z1 - Z0, CZ = (Z0 + Z1) / 2;
  const TILE = 6; // the sacrificial concrete over the iron
  const yPlate = F - TILE - CHAMBER.plate / 2;
  const yRibTop = F - TILE - CHAMBER.plate; // −361
  const yRibBot = yRibTop - CHAMBER.ribs; // −461
  const yBase = yRibBot - 5;
  const wallTop = F + CHAMBER.side; // −210
  const ironMat = solid(C.iron, { rough: 0.68, metal: 0.2 });
  const slabMat = concrete(C.slab);
  const tiles = [], plates = [];
  const NX = 4, NZ = 8;
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    const x = X0 + (W / NX) * (i + 0.5), z = Z0 + (LZ / NZ) * (j + 0.5);
    tiles.push(placed(box(W / NX - 3, TILE, LZ / NZ - 3, 1), { pos: [x, F - TILE / 2, z] }));
    plates.push(placed(box(W / NX - 1.2, CHAMBER.plate, LZ / NZ - 1.2, 1.5), { pos: [x, yPlate, z] }));
  }
  addMesh(chamber, mergeGeometries(tiles), slabMat, { edgeOpacity: 0.45 });
  addMesh(chamber, mergeGeometries(plates), ironMat, { edgeOpacity: 0.55 });
  const ribs = [];
  for (let k = 0; k < 15; k++) ribs.push(placed(box(8, CHAMBER.ribs, LZ, 1), { pos: [-437.5 + 62.5 * k, (yRibTop + yRibBot) / 2, CZ] }));
  addMesh(chamber, mergeGeometries(ribs), ironMat, { edgeOpacity: 0.55 });
  addMesh(chamber, box(W + 2 * 70, 5, LZ, 1), ironMat, { pos: [0, yBase + 2.5, CZ], edgeOpacity: 0.5 });
  // the side walls, down to the channels' floor; the fins behind them; the outer skins: the slots where the water rises
  const SLOT = [X1 + 20, X1 + 60]; // the slot between the wall and its skin (x, on the +x side; mirrored)
  const wallH = wallTop - yBase;
  const fins = [];
  for (const s of [-1, 1]) {
    addMesh(chamber, box(20, wallH, LZ, 2), ironMat, { pos: [s * (X1 + 10), (wallTop + yBase) / 2, CZ], edgeOpacity: 0.6 });
    addMesh(chamber, box(10, wallH, LZ, 2), ironMat, { pos: [s * (SLOT[1] + 5), (wallTop + yBase) / 2, CZ], edgeOpacity: 0.6 });
    for (let k = 0; k < 20; k++) fins.push(placed(box(10, wallH - 20, 6, 1), { pos: [s * (X1 + 25), (wallTop + yBase) / 2 - 10, Z0 + 42 + 85 * k] }));
  }
  addMesh(chamber, mergeGeometries(fins), ironMat, { edgeOpacity: 0.45 });
  // the end walls over the slab: whole at z1, opened at z0 for the channel's mouth
  addMesh(chamber, box(W, CHAMBER.side, 20, 2), ironMat, { pos: [0, F + CHAMBER.side / 2, Z1 - 10], edgeOpacity: 0.6 });
  const mouthHalf = CHANNEL.w / 2 + 15;
  for (const s of [-1, 1]) addMesh(chamber, box(X1 - mouthHalf, CHAMBER.side, 20, 2), ironMat, { pos: [s * (mouthHalf + X1) / 2, F + CHAMBER.side / 2, Z0 + 10], edgeOpacity: 0.6 });
  // the central channel: a tube under the structure, open at the section
  const central = addMesh(chamber, lathe([[CENTRAL.r - 6, -LZ / 2], [CENTRAL.r, -LZ / 2], [CENTRAL.r, LZ / 2], [CENTRAL.r - 6, LZ / 2], [CENTRAL.r - 6, -LZ / 2]], 48, { bevel: 0.8 }), ironMat, { edgeOpacity: 0.6 });
  central.rotation.x = Math.PI / 2;
  central.position.set(0, CENTRAL.y, CZ);
  const wallLines = [-1, 1].map((s) => glowLine(chamber, [[s * (X1 + 10), wallTop + 1, Z0], [s * (X1 + 10), wallTop + 1, Z1]]));
  const endLine = glowLine(chamber, [[X0, wallTop + 1, Z1 - 10], [X1, wallTop + 1, Z1 - 10]]);

  // the triggers, on the slab by the +x wall: a block in four pieces and its fusible link
  const trigMat = solid(C.trig, { rough: 0.5, metal: 0.3 });
  const linkMat = solid(C.collar, { rough: 0.4, metal: 0.45 });
  const TRIG_H = 30;
  const triggers = TRIGGERS.map(([x, y, z]) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    chamber.add(g);
    const bits = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => {
      const m = addMesh(chamber, box(17.5, TRIG_H, 17.5, 1.5), trigMat, { edgeOpacity: 0.7 });
      m.position.set(sx * 9, TRIG_H / 2, sz * 9);
      m.userData.dir = [sx, sz];
      g.add(m);
      return m;
    });
    const link = addMesh(chamber, cyl(5, 9, 0.8, 24), linkMat, { edgeOpacity: 0.7 });
    link.position.y = TRIG_H + 4.5;
    g.add(link);
    return { g, bits, link };
  });

  // the water in the structure: the channels between the ribs, the slots, the central channel; the overflow; the flood
  const ribWaterMat = veil(BRAND.veille, 0.24); // the water is veille: it is the system's own (retouche 05/11)
  const ribWater = addMesh(chamber, box(W - 4, CHAMBER.ribs, LZ - 2, 1).translate(0, CHAMBER.ribs / 2, 0), ribWaterMat, { edges: false });
  ribWater.position.set(0, yRibBot, CZ);
  const slotMat = veil(BRAND.veille, 0.26);
  const slotH = wallTop - 5 - yBase;
  const slots = [-1, 1].map((s) => {
    const m = addMesh(chamber, box(SLOT[1] - SLOT[0] - 2, slotH, LZ - 2, 1).translate(0, slotH / 2, 0), slotMat, { edges: false });
    m.position.set(s * (SLOT[0] + SLOT[1]) / 2, yBase, CZ);
    return m;
  });
  const frontMat = glow(BRAND.veille, 0);
  const slotFronts = [-1, 1].map((s) => {
    const m = addMesh(chamber, box(SLOT[1] - SLOT[0] - 2, 1.6, LZ - 2, 0.3), frontMat, { edges: false });
    m.position.x = s * (SLOT[0] + SLOT[1]) / 2;
    return m;
  });
  const centralMat = veil(BRAND.veille, 0.34);
  const centralGeo = new THREE.CylinderGeometry(CENTRAL.r - 7, CENTRAL.r - 7, 1, 32).rotateX(Math.PI / 2).translate(0, 0, -0.5);
  const centralWater = addMesh(chamber, centralGeo, centralMat, { edges: false });
  centralWater.position.set(0, CENTRAL.y, Z1 - 0.5);
  const centralFront = addMesh(chamber, new THREE.CircleGeometry(CENTRAL.r - 7, 32), frontMat, { edges: false });
  centralFront.position.set(0, CENTRAL.y, Z1);
  const spillMat = veil(BRAND.veille, 0.3, { double: true });
  const spills = [-1, 1].map((s) => {
    const m = addMesh(chamber, new THREE.PlaneGeometry(LZ - 30, wallTop - (F + CHAMBER.sheet)).rotateY(Math.PI / 2), spillMat, { edges: false });
    m.position.set(s * (X1 - 1.5), (wallTop + F + CHAMBER.sheet) / 2, CZ);
    return m;
  });
  // the flood: a veille surface the crust shows through, its reflections, and a pale waterline along the walls
  const floodMat = waterMat({ deep: 0.09, shallow: 0.09, alpha: 0.3, fres: 0.25, band: 0.1 });
  chamber.userData.part.mats.add(floodMat);
  const floods = [-1, 1].map((s) => {
    const geo = new THREE.PlaneGeometry(W / 2, LZ - 40).rotateX(-Math.PI / 2).translate(-s * W / 4, 0, 0);
    const m = addMesh(chamber, geo, floodMat, { edges: false });
    m.position.set(s * X1, F + CHAMBER.sheet + 4, CZ);
    m.receiveShadow = false;
    m.renderOrder = 3;
    return m;
  });
  const floodFronts = [-1, 1].map(() => addMesh(chamber, box(3, 1.6, LZ - 40, 0.3), frontMat, { edges: false }));
  const WATER_HI = INK.clone().lerp(VEILLE, 0.55);
  const floodRims = [-1, 1].map((s) => {
    const g = new THREE.Group(); // at the wall, at the water's level; scale.x = how far the flood reaches
    g.position.set(s * (X1 - 1), 0, CZ);
    chamber.add(g);
    const zE = LZ / 2 - 20;
    const lines = [
      [[0, 0.6, -zE], [0, 0.6, zE]],
      [[0, 0.6, -zE], [-s * W / 2, 0.6, -zE]],
      [[0, 0.6, zE], [-s * W / 2, 0.6, zE]],
    ].map((pts) => {
      const l = glowLine(chamber, pts, 3);
      g.add(l);
      return l;
    });
    return { g, lines };
  });

  /* ═════════════ THE POOL: an IRWST sector, cut at both ends ═════════════ */
  const pool = makePart("pool");
  const basinMat = concrete(C.basin);
  const PX0 = POOL.x0, PX1 = POOL.x1, PL = POOL.z1 - POOL.z0, PZ = (POOL.z0 + POOL.z1) / 2;
  const wallTopP = POOL.level + 40;
  const pH = wallTopP - POOL.floor;
  addMesh(pool, box(POOL.wall, pH, PL, 2), basinMat, { pos: [PX0 + POOL.wall / 2, (wallTopP + POOL.floor) / 2, PZ], edgeOpacity: 0.65 });
  addMesh(pool, box(POOL.wall, pH, PL, 2), basinMat, { pos: [PX1 - POOL.wall / 2, (wallTopP + POOL.floor) / 2, PZ], edgeOpacity: 0.65 });
  addMesh(pool, box(PX1 - PX0, 30, PL, 2), basinMat, { pos: [(PX0 + PX1) / 2, POOL.floor - 15, PZ], edgeOpacity: 0.65 });
  const wx0 = PX0 + POOL.wall + 0.5, wx1 = PX1 - POOL.wall - 0.5;
  const depth = POOL.level - POOL.floor;
  // the still water: dark veille, deeper toward the floor; its surface flat, a few soft reflections (retouche 05/11)
  const bodyMat = waterMat({ deep: 0.012, shallow: 0.05, alpha: 0.82, h: depth, fres: 0.06 });
  const waterBody = addMesh(pool, box(wx1 - wx0, depth, PL - 1, 0.5).translate(0, depth / 2, 0), bodyMat, { edges: false });
  waterBody.position.set((wx0 + wx1) / 2, POOL.floor, PZ);
  waterBody.renderOrder = 1;
  const surfMat = waterMat({ deep: 0.07, shallow: 0.07, alpha: 0.75, fres: 0.15, band: 0.08 });
  const surface = addMesh(pool, new THREE.PlaneGeometry(wx1 - wx0, PL - 1).rotateX(-Math.PI / 2), surfMat, { edges: false });
  surface.position.set((wx0 + wx1) / 2, POOL.level + 0.3, PZ);
  surface.receiveShadow = false;
  surface.renderOrder = 2;
  const waterline = new THREE.Group(); // the lines of the still water, at its level: its section lips, its rims, two fine reflections
  waterline.position.y = POOL.level;
  pool.add(waterline);
  const wlMats = [];
  const wl = (pts, width, opacity) => {
    const line = fatLine(pts, { color: BRAND.ink, width, opacity });
    line.material.userData.noGuard = true;
    pool.userData.part.mats.add(line.material);
    wlMats.push(line.material);
    waterline.add(line);
  };
  for (const z of [POOL.z0 + 0.5, POOL.z1 - 0.5]) wl([[wx0, 0.5, z], [wx1, 0.5, z]], 3, 0.95);
  for (const x of [wx0, wx1]) wl([[x, 0.5, POOL.z0], [x, 0.5, POOL.z1]], 2.2, 0.75);
  wl([[wx0 + 90, 0.6, POOL.z0 + 300], [wx0 + 260, 0.6, POOL.z0 + 900]], 1.8, 0.28);
  wl([[wx0 + 230, 0.6, POOL.z0 + 700], [wx0 + 380, 0.6, POOL.z0 + 1300]], 1.8, 0.22);

  /* ═════════════ THE VALVES: bodies, levers, cables, pipes ═════════════ */
  const valves = makePart("valves");
  const valveMat = solid(C.valve, { rough: 0.5, metal: 0.42 });
  const leverMat = solid(C.lever, { rough: 0.4, metal: 0.4 });
  const pipeMat = solid(C.iron, { rough: 0.68, metal: 0.2 });
  const fillMat = glow(BRAND.veille, 1.1); // the water in the pipe: veille, like everywhere (retouche 05/11)
  const headMat = glow(BRAND.veille, 3);
  const LEVER = 70;
  const pipeGroup = new THREE.Group(); // the pipes, their water, the cables: gone in the exploded view
  valves.add(pipeGroup);
  const valveSet = VALVES.map(([x, y, z], i) => {
    // flange on the wall, body, flange, the pipe going on
    const f0 = addMesh(valves, cyl(34, 6, 1, 48), valveMat, { edgeOpacity: 0.7 });
    f0.rotation.z = Math.PI / 2;
    f0.position.set(x - 3, y, z);
    const b = addMesh(valves, cyl(24, 42, 1.5, 48), valveMat, { edgeOpacity: 0.65 });
    b.rotation.z = Math.PI / 2;
    b.position.set(x - 27, y, z);
    const f1 = addMesh(valves, cyl(30, 6, 1, 48), valveMat, { edgeOpacity: 0.7 });
    f1.rotation.z = Math.PI / 2;
    f1.position.set(x - 51, y, z);
    addMesh(valves, box(22, 18, 22, 2), valveMat, { pos: [x - 27, y + 24 + 9, z], edgeOpacity: 0.7 });
    // the lever on its pivot: across, held down by the cable; it springs up when the cable lets go
    const pivot = new THREE.Group();
    pivot.position.set(x - 27, y + 24 + 18 + 4, z);
    valves.add(pivot);
    pivot.add(addMesh(valves, cyl(6, 26, 0.8, 24), leverMat, { rot: [Math.PI / 2, 0, 0], edgeOpacity: 0.7 }));
    pivot.add(addMesh(valves, box(LEVER, 8, 8, 1.2), leverMat, { pos: [-LEVER / 2, 0, 0], edgeOpacity: 0.75 }));
    pivot.add(addMesh(valves, box(14, 14, 14, 1.5), leverMat, { pos: [-LEVER, 0, 0], edgeOpacity: 0.75 }));
    // the pipe: its segments, the elbows, the water that fills it (a light core on the dark pipe), its head
    const pts = PIPES[i].map((p) => new THREE.Vector3(...p));
    pts[0] = new THREE.Vector3(x - 54, y, z);
    const segs = [];
    let total = 0;
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], c = pts[k + 1];
      pipeGroup.add(rod(valves, a.toArray(), c.toArray(), 12, pipeMat, { edgeOpacity: 0.5 }));
      if (k > 0) pipeGroup.add(addMesh(valves, new THREE.SphereGeometry(13.5, 24, 12), pipeMat, { pos: a.toArray(), edges: false }));
      const len = a.distanceTo(c);
      const fillGeo = new THREE.CylinderGeometry(12.8, 12.8, 1, 20, 1, true).translate(0, 0.5, 0);
      const fill = addMesh(valves, fillGeo, fillMat, { edges: false });
      fill.position.copy(a);
      fill.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.clone().sub(a).normalize());
      fill.visible = false;
      pipeGroup.add(fill);
      segs.push({ a, c, len, from: total, fill });
      total += len;
    }
    const head = addMesh(valves, new THREE.SphereGeometry(24, 24, 12), headMat, { edges: false });
    head.visible = false;
    pipeGroup.add(head);
    // the cable: lever tip → over the wall's top → the trigger's link
    const geo = new LineGeometry();
    geo.setPositions([0, 0, 0, 1, 1, 1, 2, 2, 2]);
    const cable = new Line2(geo, lineMat(BRAND.ink, 3, { opacity: 0.9 }));
    cable.frustumCulled = false;
    cable.renderOrder = 3;
    valves.userData.part.mats.add(cable.material);
    pipeGroup.add(cable);
    return { pivot, segs, total, head, cable, buf: geo.attributes.instanceStart.data, x, y, z };
  });
  const guide = []; // a small pulley on the wall's top, under each cable
  for (const [, , z] of TRIGGERS) guide.push(addMesh(chamber, cyl(5, 14, 0.6, 20), linkMat, { pos: [X1 + 10, wallTop + 5, z], rot: [Math.PI / 2, 0, 0], edgeOpacity: 0.7 }));

  root.add(pit, plug, channel, chamber, pool, valves);
  const parts = { pit, plug, channel, chamber, pool, valves };

  /* the whole system's rim (guard): every edge line of the solids, ink → veille */
  const rims = [];
  for (const part of Object.values(parts)) for (const mat of part.userData.part.mats) if (mat.isLineMaterial && !mat.userData.noGuard) rims.push({ mat, base: mat.color.clone() });
  const capMats = [wallMat, floorMat]; // the scorched lining

  const A = {
    pit: anchor(pit, 0, PIT.top / 2, 0),
    plug: anchor(plug, 0, 4, 0),
    channel: anchor(channel, 0, (cy0 + cy1) / 2, (cz0 + cz1) / 2),
    mouth: anchor(chamber, 0, F, Z0),
    chamber: anchor(chamber, 0, F, CZ),
    heap: anchor(chamber, HEAP.at[0], HEAP.at[1], HEAP.at[2]),
    pool: anchor(pool, (PX0 + PX1) / 2, POOL.level, PZ),
    valve0: anchor(valves, ...VALVES[0]),
    valve1: anchor(valves, ...VALVES[1]),
    trigger0: anchor(chamber, TRIGGERS[0][0], TRIGGERS[0][1] + TRIG_H / 2, TRIGGERS[0][2]),
    trigger1: anchor(chamber, TRIGGERS[1][0], TRIGGERS[1][1] + TRIG_H / 2, TRIGGERS[1][2]),
    centre: anchor(root, 0, 0, CZ),
  };
  const order = Object.keys(SPREAD);

  /**
   * P: explode 0–1 · eaten 0–1 (the pit's sacrificial lining eaten away) · plug 0 cold → 0.5 red → 1 melted open ·
   * valves 0 shut → 1 open · triggers 0 whole → 1 destroyed · water 0 in the pool → 1 over the melt ·
   * guard 0–1 (the whole system's veille rim: alive) · litPit litPlug litChannel litChamber litPool litValves 0–1
   */
  function update(P, time, px) {
    /* the exploded view */
    for (const k of order) {
      const e = settle(clamp01((P.explode - DELAY[k]) / SPAN));
      const s = SPREAD[k];
      parts[k].position.set(s[0] * e, s[1] * e, s[2] * e);
    }
    const g = P.guard;

    /* the pit: eaten, scorched, crumbling */
    const eaten = clamp01(P.eaten);
    wallIn.morphTargetInfluences[0] = eaten;
    floorTop.morphTargetInfluences[0] = eaten;
    for (const m of capMats) m.userData.U.uEaten.value = eaten;
    for (const m of [wallMat, floorMat, rimMat]) m.emissive.copy(VEILLE).multiplyScalar(0.05 * P.litPit);
    for (const l of pitLines) shine(l, 1.6 * P.litPit);
    const crumble = clamp01(eaten * 4) * (1 - smooth(0.85, 1, eaten));
    for (let i = 0; i < CHIPS; i++) {
      const m = chips[i];
      const c = m.userData.c;
      if ((i + 0.5) / CHIPS >= crumble) {
        m.visible = false;
        continue;
      }
      const u = (time / c.T + c.ph) % 1;
      const fall = Math.min(1, u / 0.32);
      const r = rIn + ERODE * eaten * 0.7 - c.drift * fall;
      const yFloor = -0.6 * ERODE * eaten + 4;
      m.visible = u < 0.9;
      m.position.set(r * Math.sin(c.phi), c.y0 + (yFloor - c.y0) * fall * fall, r * Math.cos(c.phi));
      m.rotation.set(c.spin[0] * fall, c.phi, c.spin[1] * fall);
      const sc = u < 0.75 ? 1 : 1 - (u - 0.75) / 0.15;
      m.scale.setScalar(Math.max(0.01, sc));
    }

    /* the plug: eaten with the floor, red, sagging, gone */
    const pl = clamp01(P.plug);
    const heat = smooth(0.1, 0.5, pl);
    const sag = smooth(0.5, 0.85, pl);
    const open = smooth(0.82, 1, pl);
    const sink = PLUG_ERODE * eaten;
    body.position.y = -sink * 0.5 - 14 * sag - 230 * open * open;
    capPivot.scale.y = Math.max(0.05, (PIT.sac - sink * 0.5 - 22 * sag) / PIT.sac);
    body.visible = open < 0.97;
    const bodyScale = 1 - 0.35 * open;
    body.scale.set(bodyScale, 1, bodyScale);
    collarMat.emissive.copy(SIGNAL).multiplyScalar(0.3 * heat + 0.8 * sag);
    capMat.emissive.copy(SIGNAL).multiplyScalar(0.1 * heat + 1.2 * sag);
    gateMat.emissive.copy(SIGNAL).multiplyScalar(1.2 * sag);
    hot.visible = heat > 0.01;
    hot.position.y = PIT.sac + 0.8;
    hotMat.uniforms.uK.value = 1.7 * heat * (1 - open);
    ring.position.y = 0.5 - sink;
    setGlow(ringGlow, (1.8 * P.litPlug + 0.9 * g) * (1 - heat));
    ring.visible = ringGlow.color.r + ringGlow.color.g > 0.02;
    lip.visible = pl > 0.8;
    lip.position.y = 5 - 0.6 * sink;
    setGlow(lipMat, 2.2 * smooth(0.8, 0.95, pl));

    /* the channel */
    for (const l of chanLines) shine(l, 1.6 * P.litChannel);
    chanMat.emissive.copy(VEILLE).multiplyScalar(0.05 * P.litChannel);

    /* the chamber, its light, its triggers */
    const chamberK = Math.max(1.6 * P.litChamber, 1.8 * g);
    for (const l of wallLines) shine(l, chamberK);
    shine(endLine, chamberK);
    slabMat.emissive.copy(VEILLE).multiplyScalar(0.05 * P.litChamber);
    const tr = clamp01(P.triggers);
    const broke = smooth(0.15, 0.7, tr);
    TMP.copy(VEILLE).multiplyScalar(0.45 * P.litValves * (1 - broke));
    trigMat.emissive.copy(SIGNAL).multiplyScalar(0.9 * smooth(0, 0.5, tr) * (1 - 0.5 * broke)).add(TMP);
    for (const t of triggers) {
      for (const b of t.bits) {
        const [sx, sz] = b.userData.dir;
        b.position.set(sx * (9 + 10 * broke), TRIG_H / 2 - 14 * broke, sz * (9 + 10 * broke));
        b.rotation.set(sz * 0.9 * broke, 0, -sx * 0.9 * broke);
      }
      t.link.position.y = TRIG_H + 4.5 - 30 * broke;
      t.link.visible = broke < 0.9;
    }

    /* the valves: levers, cables, the water's heads in the pipes */
    const va = clamp01(P.valves);
    leverMat.emissive.copy(VEILLE).multiplyScalar(0.5 * P.litValves + 0.25 * va + 0.35 * g);
    valveMat.emissive.copy(VEILLE).multiplyScalar(0.12 * P.litValves);
    const w = clamp01(P.water);
    const w1 = clamp01(w / 0.25);
    const showCable = P.explode < 0.15;
    pipeGroup.visible = P.explode < 0.3;
    const vp = valves.position, cp = chamber.position;
    for (let i = 0; i < valveSet.length; i++) {
      const v = valveSet[i];
      const a = 1.25 * va;
      v.pivot.rotation.z = -a;
      v.cable.visible = showCable;
      if (showCable) {
        const tx = v.pivot.position.x - LEVER * Math.cos(a), ty = v.pivot.position.y + LEVER * Math.sin(a);
        const T = TRIGGERS[i];
        const gx = X1 + 10 + cp.x - vp.x, gy = wallTop + 10 + cp.y - vp.y, gz = T[2] + cp.z - vp.z;
        // the trigger's end: on its link while whole, then dangling down the wall's inner face
        const ex = T[0] + (X1 - 6 - T[0]) * broke + cp.x - vp.x;
        const ey = T[1] + TRIG_H + 9 + (wallTop - 70 - (T[1] + TRIG_H + 9)) * broke + cp.y - vp.y;
        const arr = v.buf.array;
        arr[0] = tx; arr[1] = ty; arr[2] = v.z;
        arr[3] = gx; arr[4] = gy; arr[5] = gz;
        arr[6] = gx; arr[7] = gy; arr[8] = gz;
        arr[9] = ex; arr[10] = ey; arr[11] = gz;
        v.buf.needsUpdate = true;
      }
      const s = w1 * v.total;
      for (const seg of v.segs) {
        const f = clamp01((s - seg.from) / seg.len);
        seg.fill.visible = f > 0.002;
        seg.fill.scale.set(1, Math.max(0.001, seg.len * f), 1);
        if (f > 0 && f < 1) v.head.position.lerpVectors(seg.a, seg.c, f);
      }
      v.head.visible = w1 > 0.002 && w1 < 0.999;
    }

    /* the water in the chamber: central channel → ribs → slots → over the walls → over the melt */
    const w2 = clamp01((w - 0.25) / 0.25);
    const w3 = clamp01((w - 0.5) / 0.3);
    const w4 = clamp01((w - 0.8) / 0.2);
    const op = chamber.userData.part.opacity;
    const cf = smooth(0, 0.65, w2);
    centralWater.visible = cf > 0.002;
    centralWater.scale.set(1, 1, Math.max(0.001, LZ * cf));
    centralFront.visible = cf > 0.002 && cf < 0.999;
    centralFront.position.z = Z1 - LZ * cf - 0.5;
    const rf = smooth(0.4, 1, w2);
    ribWater.visible = rf > 0.002;
    ribWater.scale.y = Math.max(0.001, rf);
    const sf = smooth(0, 1, w3);
    for (const m of slots) {
      m.visible = sf > 0.002 || rf > 0.99;
      m.scale.y = Math.max(0.001, (CHAMBER.ribs * rf * (1 - sf) + slotH * sf) / slotH);
    }
    for (const m of slotFronts) {
      m.visible = sf > 0.002 && sf < 0.999;
      m.position.y = yBase + slotH * sf;
    }
    setGlow(frontMat, 2.2);
    const spill = smooth(0, 0.25, w4) * (1 - smooth(0.7, 1, w4));
    spillMat.opacity = spillMat.userData.base * op * spill;
    for (const m of spills) m.visible = spill > 0.01;
    const reach = smooth(0.05, 0.6, w4);
    const level = F + CHAMBER.sheet + 4 + (FLOOD.level - (F + CHAMBER.sheet + 4)) * smooth(0.45, 1, w4);
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      floods[i].visible = reach > 0.003;
      floods[i].scale.x = Math.max(0.001, reach);
      floods[i].position.y = level;
      floodFronts[i].visible = reach > 0.003 && w4 < 0.66;
      floodFronts[i].position.set(s * (X1 - (W / 2) * reach), level + 0.5, CZ);
      const rim = floodRims[i];
      rim.g.visible = reach > 0.003;
      rim.g.position.y = level;
      rim.g.scale.x = Math.max(0.001, reach);
      for (const l of rim.lines) shine(l, 1.3 * op * smooth(0, 0.15, w4), WATER_HI);
    }
    floodMat.uniforms.uK.value = op * smooth(0, 0.15, w4);
    floodMat.uniforms.uLit.value = 0.3 * g;
    floodMat.uniforms.uT.value = time;

    /* the pool: its level drops a little; named, its lines glow veille */
    const lv = POOL.level - 25 * w;
    surface.position.y = lv + 0.3;
    waterline.position.y = lv;
    waterBody.scale.y = (lv - POOL.floor) / depth;
    for (const m of wlMats) m.color.copy(INK).lerp(VEILLE, Math.min(1, 0.4 + P.litPool * 0.6 + g * 0.4)).multiplyScalar(1 + 0.6 * P.litPool);
    const pk = pool.userData.part.opacity;
    for (const m of [bodyMat, surfMat]) {
      m.uniforms.uK.value = pk;
      m.uniforms.uLit.value = P.litPool;
      m.uniforms.uT.value = time;
    }

    /* the guard: every edge of the solids turns veille */
    const gk = 0.85 * g;
    for (const r of rims) r.mat.color.copy(r.base).lerp(VEILLE, gk);
  }

  return { root, A, parts, update };
}
