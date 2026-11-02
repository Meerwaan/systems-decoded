// DOSSIER 034 — Boîte noire : the system — the flight recorder, SOLID. Centimetres, y up. Its frame (plan.js): the
// base centre at the origin (the point that touches the bottom), the FRONT (the beacon) toward −x, up +y, width on z.
//
//   buildSystem() → { root, A, parts, update(P, time, px) }
//   root   a THREE.Group, re-parented by world.js: on the bottom (turned by spin / tilt), in the A330's tail, on the bench
//   A      anchors: beacon (its nose), pile, chassis, boards, module (its centre), board (the memory), steel, insul,
//          absorb (a point of each layer on its cut face, the one that faces VIEW.section), centre
//   parts  { beacon, pile, chassis, boards, module, steel, insul, absorb, board } — each with ITS OWN materials
//   P      { bench, explode, xray, sep, apart, section, heat, crush, flex, hold, ping, charge, read, shine,
//            litBeacon, litPile, litCase, litCore, litSteel, litInsul, litAbsorb } (meaning: FIRST in world.js)
//
// What it is made of:
//   the chassis   six panels of burnt-orange paint (the signal hue darkened: a solid, never a flat glare) — their
//                 seams are its detail —, two reflective bands, the handle up front, the connector at the back, the
//                 saddle the module sits in. NOT protected. `xray` turns it to glass; `apart` breaks it on the bottom.
//   the boards    four dark cards standing inside, their chips on the camera's side (+z).
//   the module    the hero: a squat cylinder (axis x) on top, the lightest orange, its band and two steel straps.
//                 Inside, as a canister in a canister (Honeywell's patent): the paint, hardened STEEL (the lightest
//                 grey, its cut face machined), INSULATION (matte ink, grained), the HEAT ABSORBER (mid grey), and at
//                 the heart the MEMORY board (dark, its chips). `section` lifts a wedge out of each layer — stepped:
//                 the outer the wider — toward the camera of VIEW.section, and the layers part by a hair.
//   the beacon    a light-grey cylinder on the module's front face; its nose: the water switch (two studs) and the
//                 veille flash, once a second (PING, the same phase as fond.js); its battery inside, with a gauge.
//   the effects   the flame (`heat`: tongues licking the steel, the steel's cut face glowing signal from the outside
//                 in, dying in the insulation — the heat stops there), the pressure arrows (`crush`), the dent that
//                 springs back (`flex`), the steel that holds (`hold`, veille), the memory read (`read`: veille heads
//                 of light running up and out of the cut), the bands catching the light (`shine`).
// update() is called sixteen times a frame: no allocation in it — uniforms, colours and transforms only.
import * as THREE from "three";
import { toCreasedNormals, mergeGeometries as mergeRaw } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, glass, asShell, edgesOf, box, cyl, anchor, mergeGeometries, placed } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { CHASSIS, BOARDS, MODULE, BEACON, LAYERS, PING } from "./plan.js";

const DEG = Math.PI / 180;
const ALONG_X = [0, 0, -Math.PI / 2]; // a y-axis piece (cyl) laid along x
const ALONG_Z = [Math.PI / 2, 0, 0]; //  …along z
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const LIT = VEILLE.clone().multiplyScalar(1.35);

/* the paint: the signal hue, darkened — the chassis a little darker than the module (the hero) */
const PAINT = new THREE.Color(0x9c3a1b);
const PAINT_HERO = new THREE.Color(0xc04a20);
const DEAD = new THREE.Color(0x3b3532); //  the paint once broken on the bottom: dead grey
const DEAD_GREY = new THREE.Color(0x45443f);

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// leaves fast, arrives with a slight overshoot and settles: parts have weight (kit/build3d.js `explode`)
const settle = (u) => easeInOut(u) + Math.sin(Math.PI * u) * Math.sin(Math.PI * u) * 0.055 * (u > 0.5 ? 1 : 0.25);
const win = (k, a, b) => settle(clamp01((k - a) / (b - a)));

/* ───────────── textures (computed, seeded) ───────────── */
function radialTexture() {
  const n = 64;
  const data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const d = Math.hypot(x - n / 2 + 0.5, y - n / 2 + 0.5) / (n / 2);
      const a = clamp01(1 - d);
      const v = Math.min(1, a * a * a * 1.4 + a * a * 0.25); // a bright heart, a long soft tail
      data.set([255, 255, 255, Math.round(255 * v)], (y * n + x) * 4);
    }
  }
  const t = new THREE.DataTexture(data, n, n);
  t.needsUpdate = true;
  return t;
}
function grainTexture(seed) {
  const n = 64;
  const r = rng(seed);
  const data = new Uint8Array(n * n * 4);
  for (let i = 0; i < n * n; i++) {
    const v = Math.round(255 * (0.78 + 0.22 * r()));
    data.set([v, v, v, 255], i * 4);
  }
  const t = new THREE.DataTexture(data, n, n);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2.5, 2.5);
  t.needsUpdate = true;
  return t;
}

/* ───────────── the module's shells: lathes around x, cut open by a wedge ───────────── */
// LatheGeometry puts a profile point (r, y) at (r·sinφ, y, r·cosφ); turned about z by −90°, its axis is x and the
// point lands at (y, −r·sinφ, r·cosφ). φ = 315° is then (+y, +z): up and toward the camera of VIEW.section.
const CUT = 315 * DEG;
function turn(profiles, phiStart, phiLength, segments) {
  const geos = profiles.map((pts) => {
    const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), segments, phiStart, phiLength);
    g.rotateZ(-Math.PI / 2);
    return toCreasedNormals(g, 40 * DEG);
  });
  return geos.length > 1 ? mergeRaw(geos) : geos[0];
}
/** The flat face where a lathe is cut, at angle φ: its profile polygon, in the half-plane of φ. */
function capGeo(pts, phi) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([r, y]) => new THREE.Vector2(r, y))));
  g.rotateY(phi - Math.PI / 2);
  g.rotateZ(-Math.PI / 2);
  return g;
}
/** A closed canister (outer radius / half-length, inner cavity): its two lathe surfaces and its cut profile. */
const canister = (rIn, rOut, hIn, hOut) => ({
  surfaces: [
    [[0, -hOut], [rOut, -hOut], [rOut, hOut], [0, hOut]],
    [[0, hIn], [rIn, hIn], [rIn, -hIn], [0, -hIn]],
  ],
  face: [[0, -hOut], [rOut, -hOut], [rOut, hOut], [0, hOut], [0, hIn], [rIn, hIn], [rIn, -hIn], [0, -hIn]],
});
const ring = (rIn, rOut, y0, y1) => [[[rIn, y0], [rOut, y0], [rOut, y1], [rIn, y1], [rIn, y0]]];

/* the steel shell flexes (`flex`) and the flame heats it from the outside in (`heat`): one patch, shared uniforms */
const SHELL = { uFlex: { value: 0 }, uHeat: { value: 0 }, uHeatCol: { value: SIGNAL.clone().multiplyScalar(1.0) } };
function patchShell(mat, dent = true) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, SHELL);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uFlex;\nvarying vec3 vLoc;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vLoc = position;
        ${dent ? `{
          float r = length(transformed.yz);
          float a = r > 0.01 ? atan(transformed.y, transformed.z) : 0.0;
          float lobe = pow(0.5 + 0.5 * cos(4.0 * a), 2.0);
          float along = 1.0 - smoothstep(3.5, 6.4, abs(transformed.x));
          transformed.yz *= 1.0 - uFlex * 0.1 * lobe * (0.35 + 0.65 * along) * smoothstep(4.6, 5.9, r);
        }` : ""}`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uHeat;\nuniform vec3 uHeatCol;\nvarying vec3 vLoc;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float sdHot = uHeat * pow(clamp((length(vLoc.yz) - 4.25) / 1.75, 0.0, 1.0), 1.6);
        diffuseColor.rgb *= 1.0 - 0.8 * sdHot; // what glows from the heat stops reflecting the studio`,
      )
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n        totalEmissiveRadiance += uHeatCol * sdHot;");
  };
  mat.customProgramCacheKey = () => (dent ? "sd034-shell-dent" : "sd034-shell");
  return mat;
}

/* ───────────── fading a set of solids (the kit's setPartOpacity, on a sub-group) ───────────── */
function fader(root) {
  const mats = new Set();
  const casters = [];
  root.traverse((o) => {
    if (o.material && !o.userData.shell) mats.add(o.material);
    if (o.isMesh && o.castShadow) casters.push(o);
  });
  return { root, mats: [...mats], casters, a: 1 };
}
function fade(f, a) {
  if (Math.abs(f.a - a) < 1e-4) return;
  f.a = a;
  f.root.visible = a > 0.004;
  for (const m of f.mats) {
    m.opacity = (m.userData.base ?? 1) * a;
    const tr = !!m.userData.transparent || a < 0.999;
    if (m.transparent !== tr) {
      m.transparent = tr;
      m.needsUpdate = true;
    }
    m.depthWrite = (m.userData.depthWrite ?? true) && a > 0.55;
  }
  for (const c of f.casters) c.castShadow = a > 0.6;
}
/** The edge lines of a sub-tree, with their colour at rest (to lerp them toward veille when the part is named). */
function linesOf(root) {
  const out = [];
  root.traverse((o) => {
    const m = o.material;
    if (m?.isLineMaterial && !out.some((e) => e.mat === m)) out.push({ mat: m, base: m.color.clone() });
  });
  return out;
}
function lightLines(lines, k) {
  for (const e of lines) e.mat.color.lerpColors(e.base, LIT, k * 0.9);
}
/** A glass twin for the X-ray: the shell and its fine ink outline. */
function ghostOf(group, geometry, pos, rot, order) {
  const mat = glass(BRAND.ink, { base: 0.004, rim: 0.32, power: 2.4, edge: 0.55, spec: 0.25, through: 0.25 });
  const mesh = new THREE.Mesh(geometry, mat);
  if (pos) mesh.position.set(...pos);
  if (rot) mesh.rotation.set(...rot);
  asShell([mesh], order);
  const lines = edgesOf(geometry, { color: BRAND.ink, width: 1.8, opacity: 0.6 });
  mesh.add(lines);
  group.add(mesh);
  return { mesh, mat, line: lines.material };
}

export function buildSystem() {
  const root = new THREE.Group();
  const R = rng(34);
  const glowTex = radialTexture();

  /* ── materials (each part its own) ── */
  const paint = (c, o = {}) => solid(c.clone(), { rough: 0.5, metal: 0.12, coat: 0.2, coatRough: 0.45, ...o });
  const darkMetal = () => solid(0x575b5d, { rough: 0.42, metal: 0.45 });
  const tape = () => solid(0xd8d2c3, { rough: 0.45, metal: 0.1 }); // the reflective bands: ink, a little glossy

  /* ════════════════ THE CHASSIS — six panels, the bands, handle, connector, saddle ════════════════ */
  const chassis = makePart("chassis");
  const cSolid = new THREE.Group();
  const cGhost = new THREE.Group();
  chassis.add(cSolid, cGhost);
  const cPaint = paint(PAINT);
  const cDark = darkMetal();
  const cTape = tape();
  const T = 0.8; // the sheet
  const L = CHASSIS.len, H = CHASSIS.h, W = CHASSIS.w;
  const HB = H - T; // the body's height, under the lid
  const panels = [];
  const panel = (name, pos) => {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(...pos);
    cSolid.add(g);
    const p = { g, home: new THREE.Vector3(...pos), qHome: new THREE.Quaternion(), to: null, qTo: null };
    panels.push(p);
    return p;
  };
  const put = (grp, geo, mat, pos, rot, o) => {
    const m = addMesh(chassis, geo, mat, { pos, rot, ...o });
    grp.add(m);
    return m;
  };
  const screw = (grp, pos, rot) => put(grp, cyl(0.34, 0.18, 0.06, 16), cDark, pos, rot, { edgeOpacity: 0.55 });

  // the bottom: recessed between the side lips, two runners under it (the box stands on them: y ≥ 0)
  const pBottom = panel("bottom", [0, 0.45 + T / 2, 0]);
  put(pBottom.g, box(L - 0.2, T, W - 2 * T, 0.2), cPaint, [0, 0, 0]);
  for (const z of [-4, 4]) put(pBottom.g, box(L - 3, 0.45, 1.4, 0.15), cDark, [0, -T / 2 - 0.225, z]);
  // the two sides, floor to lid, with a raised service plate between the bands and their screws
  const sides = [];
  for (const s of [1, -1]) {
    const p = panel(s > 0 ? "sideP" : "sideM", [0, HB / 2, s * (W / 2 - T / 2)]);
    put(p.g, box(L, HB, T, 0.28), cPaint, [0, 0, 0]);
    put(p.g, box(12, 7.4, 0.14, 0.06), cPaint, [0, 0.4, s * (T / 2 + 0.07)]);
    for (const bx of CHASSIS.bands) put(p.g, box(CHASSIS.band, HB - 0.3, 0.12, 0.04), cTape, [bx, 0, s * (T / 2 + 0.06)], null, { edgeOpacity: 0.5 });
    for (const sx of [-14.6, -3.2, 3.2, 14.6]) for (const sy of [-4.9, 4.9]) screw(p.g, [sx, sy, s * (T / 2 + 0.05)], [Math.PI / 2, 0, 0]);
    sides.push(p);
  }
  // the front: the handle and the two hold-down knobs
  const pFront = panel("front", [-L / 2 + T / 2, 0.45 + (HB - 0.45) / 2, 0]);
  put(pFront.g, box(T, HB - 0.45, W - 2 * T, 0.22), cPaint, [0, 0, 0]);
  for (const z of [-3.6, 3.6]) put(pFront.g, cyl(0.38, 1.7, 0.08, 20), cDark, [-T / 2 - 0.85, 2.3, z], ALONG_X);
  put(pFront.g, cyl(0.44, 8.2, 0.1, 24), cDark, [-T / 2 - 1.75, 2.3, 0], ALONG_Z);
  for (const z of [-4.2, 4.2]) {
    put(pFront.g, cyl(0.8, 0.9, 0.12, 24), cDark, [-T / 2 - 0.45, -4.0, z], ALONG_X);
    put(pFront.g, cyl(0.4, 0.5, 0.06, 6), cDark, [-T / 2 - 1.15, -4.0, z], ALONG_X);
  }
  // the back: the connector and its two guide pins
  const pBack = panel("back", [L / 2 - T / 2, 0.45 + (HB - 0.45) / 2, 0]);
  put(pBack.g, box(T, HB - 0.45, W - 2 * T, 0.22), cPaint, [0, 0, 0]);
  put(pBack.g, box(1.4, 4.2, 7.6, 0.25), cDark, [T / 2 + 0.7, -0.6, 0]);
  put(pBack.g, box(0.3, 3.0, 6.2, 0.08), solid(0x2a2e30, { rough: 0.8 }), [T / 2 + 1.45, -0.6, 0], null, { edgeOpacity: 0.5 });
  for (const z of [-4.6, 4.6]) put(pBack.g, cyl(0.3, 1.6, 0.05, 16), cDark, [T / 2 + 0.8, -0.6, z], ALONG_X);
  // the lid: the bands across it, the saddle the module sits in, its screws
  const pLid = panel("lid", [0, HB + T / 2, 0]);
  put(pLid.g, box(L + 0.2, T, W + 0.2, 0.25), cPaint, [0, 0, 0]);
  for (const bx of CHASSIS.bands) put(pLid.g, box(CHASSIS.band, 0.12, W + 0.1, 0.04), cTape, [bx, T / 2 + 0.06, 0], null, { edgeOpacity: 0.5 });
  for (const z of [-4.6, 4.6]) put(pLid.g, box(9.5, 2.1, 1.6, 0.3), cDark, [MODULE.at[0], T / 2 + 1.05, z]);
  for (const sx of [-14.8, 14.8, -12.4]) for (const sz of [-5.6, 5.6]) screw(pLid.g, [sx, T / 2 + 0.05, sz]);
  const cLines = linesOf(cSolid);
  const cFade = fader(cSolid);
  // its glass twin (the body; the lid's follows the lid)
  const cGhostBody = ghostOf(cGhost, box(L, HB, W, 0.28), [0, HB / 2, 0], null, 18);
  const lidGhostG = new THREE.Group();
  cGhost.add(lidGhostG);
  const cGhostLid = ghostOf(lidGhostG, box(L + 0.2, T, W + 0.2, 0.25), [0, 0, 0], null, 18);
  // where each panel lies once broken on the bottom (`apart`): around where it stood, flat, turned
  const lay = (p, pos, euler) => {
    p.to = new THREE.Vector3(...pos);
    p.qTo = new THREE.Quaternion().setFromEuler(new THREE.Euler(...euler, "YXZ"));
  };
  lay(pBottom, [1.5, 0.45 + T / 2, -1], [0.12, 0, 0]);
  lay(sides[0], [6, T / 2, 21], [0.35, -Math.PI / 2, 0]);
  lay(sides[1], [21, T / 2 + 0.3, -17], [-0.5, Math.PI / 2, 0.04]);
  lay(pFront, [-27, 1.1, -8], [0.9, 0, Math.PI / 2]);
  lay(pBack, [31, 1.1, 7], [-0.6, 0, -Math.PI / 2 + 0.05]);
  lay(pLid, [-17, T / 2 + 2.1, 17], [0.7, Math.PI, 0.05]);

  /* ════════════════ THE BOARDS — four dark cards, their chips toward +z ════════════════ */
  const boards = makePart("boards");
  const bPcb = solid(0x7b8781, { rough: 0.6, metal: 0.05 });
  const bChip = solid(0x23292b, { rough: 0.5, metal: 0.2 });
  const cards = [];
  const boardsSolid = new THREE.Group();
  boards.add(boardsSolid);
  BOARDS.z.forEach((z, i) => {
    const sg = new THREE.Group();
    const gg = new THREE.Group();
    const home = new THREE.Vector3(0, 1.4 + BOARDS.h / 2, z);
    boardsSolid.add(sg);
    boards.add(gg);
    sg.add(addMesh(boards, box(BOARDS.len, BOARDS.h, 0.3, 0.06), bPcb, { edgeOpacity: 0.7 }));
    const chips = [];
    for (let c = 0; c < 9; c++) {
      const w = 1.6 + R() * 3.2, h = 1.0 + R() * 2.2;
      const cx = -BOARDS.len / 2 + 2 + (c + 0.5) * ((BOARDS.len - 4) / 9);
      const cy = -2.2 + R() * 5.4;
      chips.push(placed(box(Math.min(w, 2.6), h, 0.45, 0.06), { pos: [cx, cy, 0.37] }));
    }
    chips.push(placed(box(BOARDS.len - 6, 0.9, 0.7, 0.1), { pos: [0, -BOARDS.h / 2 + 0.2, 0] })); // the edge connector
    sg.add(addMesh(boards, mergeGeometries(chips), bChip, { edgeOpacity: 0.6 }));
    const ghost = ghostOf(gg, box(BOARDS.len, BOARDS.h, 0.3, 0.06), null, null, 14);
    // fanned out of the chassis in the exploded view; scattered on the bottom (`apart`)
    const fan = new THREE.Vector3(1.5 * i, 13 + 4 * i, z * 0.8);
    const to = new THREE.Vector3([-6, 25, -33, 3][i], 0.2, [27, -3, 5, -25][i]);
    const qTo = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, [0.4, -0.9, 1.9, 0.2][i], 0, "YXZ"));
    cards.push({ sg, gg, home, fan, to, qTo, ghost });
  });
  const cardLines = linesOf(boardsSolid);
  const boardsFade = fader(boardsSolid);

  /* ════════════════ THE MODULE — the hero, and its layers ════════════════ */
  const module = makePart("module");
  const steel = makePart("steel");
  const insul = makePart("insul");
  const absorb = makePart("absorb");
  const board = makePart("board");
  module.add(steel, insul, absorb, board);
  const MR = MODULE.r, MH = MODULE.len / 2;
  const SKIN = 0.12; // the paint on the steel
  const [rs, rsi] = [MR - SKIN, LAYERS.steel[1]];
  const [ri, rii] = LAYERS.insul;
  const [ra, rai] = LAYERS.absorb;
  const lay3 = {
    skin: canister(rs, MR, MH - SKIN, MH),
    steel: canister(rsi, rs, rsi, MH - SKIN),
    insul: canister(rii, ri, rii, rsi),
    absorb: canister(rai, ra, rai, rii),
  };
  // the wedge lifted out of each layer: the outer the wider (stepped, so each layer shows its own face)
  const WID = { skin: 104 * DEG, steel: 104 * DEG, insul: 86 * DEG, absorb: 68 * DEG };
  const heroPaint = () => patchShell(paint(PAINT_HERO));
  const steelMat = () => patchShell(solid(0xc3c7c7, { rough: 0.3, metal: 0.45, double: true }));
  const grain = grainTexture(7);
  const insulMat = () => {
    const m = patchShell(solid(0xa59e8e, { rough: 0.96, metal: 0, double: true }), false);
    m.map = grain;
    return m;
  };
  const absorbMat = () => solid(0x6a6d69, { rough: 0.58, metal: 0.25, double: true });
  const pieces = {}; // name → { keep: [meshes], wedge: Group, fade }
  const cutLayer = (part, name, mat, wedgeMat, faceMat, wedgeFaceMat) => {
    const { surfaces, face } = lay3[name];
    const w = WID[name];
    const a0 = CUT + w / 2, len = 2 * Math.PI - w;
    const keep = new THREE.Group();
    const wedge = new THREE.Group();
    part.add(keep, wedge);
    keep.add(addMesh(part, turn(surfaces, a0, len, 72), mat, { threshold: 30 }));
    keep.add(addMesh(part, capGeo(face, a0), faceMat));
    keep.add(addMesh(part, capGeo(face, a0 + len), faceMat));
    wedge.add(addMesh(part, turn(surfaces, CUT - w / 2, w, 28), wedgeMat, { threshold: 30 }));
    wedge.add(addMesh(part, capGeo(face, CUT - w / 2), wedgeFaceMat));
    wedge.add(addMesh(part, capGeo(face, CUT + w / 2), wedgeFaceMat));
    pieces[name] = { keep, wedge, fade: fader(wedge) };
  };
  // the module whole (section 0): one painted canister, seamless
  const intact = addMesh(steel, turn([lay3.skin.surfaces[0]], 0, 2 * Math.PI, 96), heroPaint(), { threshold: 30 });
  const skinMat = heroPaint();
  const steelCut = steelMat();
  cutLayer(steel, "skin", skinMat, heroPaint(), steelCut, steelMat());
  cutLayer(steel, "steel", steelCut, steelMat(), steelCut, steelMat());
  const insulM = insulMat();
  cutLayer(insul, "insul", insulM, insulMat(), insulM, insulMat());
  const absorbM = absorbMat();
  cutLayer(absorb, "absorb", absorbM, absorbMat(), absorbM, absorbMat());
  // the memory board at the heart: dark, its chips, its connector
  const [bl, bw, bt] = LAYERS.board;
  const memPcb = solid(0x1f2725, { rough: 0.55, metal: 0.05 });
  const memChip = solid(0x101314, { rough: 0.45, metal: 0.25 });
  addMesh(board, box(bl, bt, bw, 0.04), memPcb, { edgeOpacity: 0.75 });
  const memChips = [];
  for (const [cx, cz, sx, sz] of [[-0.85, -0.45, 1.2, 1.0], [0.55, -0.45, 1.2, 1.0], [-0.85, 0.75, 1.2, 0.7], [0.55, 0.75, 1.2, 0.7], [1.55, 0.1, 0.35, 1.9]]) {
    memChips.push(placed(box(sx, 0.22, sz, 0.03), { pos: [cx, bt / 2 + 0.11, cz] }));
  }
  addMesh(board, mergeGeometries(memChips), memChip, { edgeOpacity: 0.7, edgeWidth: 1.8 });
  const memLines = linesOf(board);
  // the module's own: its reflective band, two steel straps, the bolts on its ends
  const rings = new THREE.Group();
  module.add(rings);
  const mTape = patchShell(tape());
  const mStrap = patchShell(darkMetal());
  rings.add(addMesh(module, turn(ring(MR - 0.02, MR + 0.14, -1.0, 1.0), 0, 2 * Math.PI, 96), mTape, { edgeOpacity: 0.5 }));
  for (const x of [-4.1, 4.1]) {
    rings.add(addMesh(module, turn(ring(MR - 0.02, MR + 0.32, x - 0.5, x + 0.5), 0, 2 * Math.PI, 96), mStrap));
    rings.add(addMesh(module, box(1.0, 1.0, 1.6, 0.15), mStrap, { pos: [x, MR + 0.55, 0] })); // the strap's buckle
  }
  for (const s of [-1, 1]) { // a boss on each end: the lid of the canister
    rings.add(addMesh(module, cyl(2.7, 0.35, 0.1, 48), mStrap, { pos: [s * (MH + 0.17), 0, 0], rot: ALONG_X }));
    rings.add(addMesh(module, cyl(1.2, 0.5, 0.1, 6), mStrap, { pos: [s * (MH + 0.3), 0, 0], rot: ALONG_X }));
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    for (const s of [-1, 1]) rings.add(addMesh(module, cyl(0.32, 0.2, 0.05, 6), mStrap, { pos: [s * (MH + 0.08), Math.sin(a) * 4.6, Math.cos(a) * 4.6], rot: ALONG_X }));
  }
  const ringFade = fader(rings);
  const mLines = linesOf(rings);
  // the shell of light around it: the core named (litCore), the steel that held (hold)
  const coreShellMat = glass(BRAND.veille, { base: 0, rim: 0.75, power: 2.2, edge: 0.6, spec: 0 });
  const coreShell = new THREE.Mesh(turn([canister(0, MR + 0.45, 0, MH + 0.45).surfaces[0]], 0, 2 * Math.PI, 96), coreShellMat);
  asShell([coreShell], 12);
  module.add(coreShell);

  /* ════════════════ THE BEACON — on the module's front face; its battery inside ════════════════ */
  const beacon = makePart("beacon");
  const bSolid = new THREE.Group();
  const bGhost = new THREE.Group();
  beacon.add(bSolid, bGhost);
  const BC = new THREE.Vector3((BEACON.from + BEACON.to) / 2, BEACON.y, 0); // its centre
  const half = BEACON.len / 2; // local x: +half at the module's face, −half at the nose
  beacon.position.copy(BC);
  const bBody = solid(0xa9aaa2, { rough: 0.42, metal: 0.35 });
  const bDark = darkMetal();
  const bNose = solid(0x7e807b, { rough: 0.4, metal: 0.4 });
  const bput = (geo, mat, pos, rot, o) => bSolid.add(addMesh(beacon, geo, mat, { pos, rot, ...o }));
  bput(cyl(2.5, 0.5, 0.1, 40), bDark, [half - 0.25, 0, 0], ALONG_X); //            the flange on the module
  bput(cyl(BEACON.r, BEACON.len - 1.6, 0.14, 48), bBody, [0.55, 0, 0], ALONG_X); // the body
  for (const x of [half - 1.6, -0.6]) bput(cyl(BEACON.r + 0.14, 0.6, 0.06, 48), bDark, [x, 0, 0], ALONG_X); // two clamps
  bput(cyl(BEACON.r - 0.05, 0.9, 0.12, 48, BEACON.r - 0.4), bNose, [-half + 1.2, 0, 0], [0, 0, Math.PI / 2]); // the nose, tapering
  bput(cyl(BEACON.r - 0.42, 0.35, 0.08, 40), bNose, [-half + 0.58, 0, 0], ALONG_X);
  for (const z of [-0.62, 0.62]) bput(cyl(0.2, 0.55, 0.05, 16), solid(0xd6d3c8, { rough: 0.3, metal: 0.4 }), [-half + 0.15, 0.1, z], ALONG_X); // the water switch
  const bLines = linesOf(bSolid);
  const bFade = fader(bSolid);
  const bGhostBody = ghostOf(bGhost, cyl(BEACON.r, BEACON.len - 0.4, 0.14, 48), [0.2, 0, 0], ALONG_X, 16);
  // the flash at its nose: a lens and a soft light that has a place
  const lensMat = glow(BRAND.veille, 0.5);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), lensMat);
  lens.position.set(-half + 0.39, -0.35, 0);
  lens.rotation.y = -Math.PI / 2;
  beacon.add(lens);
  const flashMat = new THREE.SpriteMaterial({ map: glowTex, color: VEILLE.clone(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false });
  const flash = new THREE.Sprite(flashMat);
  flash.position.set(-half - 0.3, -0.35, 0);
  beacon.add(flash);

  // its battery: a dark cell inside, a five-step gauge of veille along it
  const pile = makePart("pile");
  const PH = new THREE.Vector3(BEACON.pile.x - BC.x, 0, 0); // its place inside the beacon
  pile.position.copy(PH);
  beacon.add(pile);
  const pBody = solid(0x737873, { rough: 0.45, metal: 0.3 });
  addMesh(pile, cyl(BEACON.pile.r, BEACON.pile.len, 0.12, 40), pBody, { rot: ALONG_X });
  addMesh(pile, cyl(0.45, 0.4, 0.06, 20), solid(0xc9c6bb, { rough: 0.35, metal: 0.4 }), { pos: [-BEACON.pile.len / 2 - 0.2, 0, 0], rot: ALONG_X });
  const gauge = [];
  for (let i = 0; i < 5; i++) {
    const m = glow(0x252a28, 1);
    const seg = addMesh(pile, turn(ring(BEACON.pile.r - 0.02, BEACON.pile.r + 0.12, -0.36, 0.36), 0, 2 * Math.PI, 40), m, { edges: false });
    seg.position.x = BEACON.pile.len / 2 - 0.75 - i * 0.92; // fills from the back (+x)
    gauge.push(m);
  }
  const pLines = linesOf(pile);
  const GAUGE_OFF = new THREE.Color(0x252a28);

  /* ════════════════ THE EFFECTS ════════════════ */
  // the flame: tongues hugging the module's sides and ends — the heat stops at the insulation (patchShell)
  const flameU = { uTime: { value: 0 }, uHeat: { value: 0 }, uCol: { value: SIGNAL.clone() } };
  const flameMat = new THREE.ShaderMaterial({
    uniforms: flameU,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute float aSeed; varying vec2 vUv; varying float vSeed;
      void main() { vUv = uv; vSeed = aSeed; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uHeat; uniform vec3 uCol; varying vec2 vUv; varying float vSeed;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      void main() {
        if (uHeat < 0.002) discard;
        float y = vUv.y; float x = vUv.x - 0.5;
        float t = uTime * 1.3 + vSeed * 7.0;
        float n = noise(vec2(vUv.x * 2.0 + vSeed * 13.0, y * 1.8 - t));
        float n2 = noise(vec2(vUv.x * 4.5 - vSeed * 5.0, y * 4.0 - t * 1.7));
        float reach = clamp(uHeat * (0.6 + 0.4 * n2), 0.05, 1.0);
        float yy = y / reach; //                         0 → 1 along the tongue
        float sway = (n - 0.5) * 0.45 * yy + sin(t * 0.8 + yy * 3.0) * 0.05 * yy;
        float halfW = 0.3 * pow(clamp(1.0 - yy, 0.0, 1.0), 0.75) * (0.8 + 0.4 * n2) * smoothstep(0.0, 0.1, yy + 0.02);
        float d = abs(x + sway);
        float body = (1.0 - smoothstep(halfW * 0.35, max(halfW, 0.002), d)) * (1.0 - step(1.0, yy));
        float heart = body * (1.0 - smoothstep(0.0, 0.55, yy)) * (1.0 - smoothstep(0.0, max(halfW * 0.6, 0.002), d));
        gl_FragColor = vec4(uCol * (body * 0.8 + heart * 1.2) * min(uHeat * 1.5, 1.0), 1.0);
      }`,
  });
  {
    const quads = [];
    const tongue = (w, h, pos, ry, seed) => {
      const g = new THREE.PlaneGeometry(w, h);
      g.translate(0, h / 2, 0);
      g.rotateY(ry);
      g.translate(...pos);
      g.setAttribute("aSeed", new THREE.Float32BufferAttribute(new Array(4).fill(seed), 1));
      quads.push(g);
    };
    let s = 0;
    for (const zs of [1, -1]) {
      for (const x of [-4.2, -0.6, 3.4]) tongue(5, 10.5, [x, -MR + 0.6, zs * (MR + 0.45)], 0, s++ * 0.37);
    }
    for (const xs of [1, -1]) for (const z of [-2.2, 2.2]) tongue(4.6, 11.5, [xs * (MH + 0.4), -MR + 0.6, z], Math.PI / 2, s++ * 0.37);
    const flames = new THREE.Mesh(mergeRaw(quads), flameMat);
    flames.renderOrder = 6;
    flames.frustumCulled = false;
    module.add(flames);
  }
  // its embers: slow streaks rising off it
  const EMB = 18;
  const emberMat = glow(BRAND.signal, 2.2, { additive: true });
  const embers = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 5), emberMat, EMB);
  embers.frustumCulled = false;
  const emberSeed = Array.from({ length: EMB }, () => [R(), (R() - 0.5) * 2 * (MH + 1), R() < 0.5 ? -1 : 1, R()]);
  module.add(embers);
  // the pressure: thick signal arrows squeezing it from every side
  const arrowGeo = mergeRaw([
    new THREE.ConeGeometry(1.3, 2.3, 24).rotateX(Math.PI).translate(0, 1.15, 0),
    new THREE.CylinderGeometry(0.58, 0.58, 3.8, 20).translate(0, 2.3 + 1.9, 0),
  ].map((g) => g.toNonIndexed()));
  const arrowMat = glow(BRAND.signal, 1.25, { opacity: 1 });
  const arrows = [];
  for (const x of [-3.1, 3.1]) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + (x > 0 ? Math.PI / 8 : 0);
      const u = new THREE.Vector3(0, Math.sin(a), Math.cos(a));
      arrows.push({ base: new THREE.Vector3(x, 0, 0).addScaledVector(u, MR), u, cut: u.y > 0.1 && u.z > 0.1 });
    }
  }
  for (const s of [-1, 1]) for (const y of [-2.6, 2.6]) arrows.push({ base: new THREE.Vector3(s * MH, y, s > 0 ? 0 : 2.2), u: new THREE.Vector3(s, 0, 0), cut: false });
  const UP = new THREE.Vector3(0, 1, 0);
  for (const ar of arrows) ar.q = new THREE.Quaternion().setFromUnitVectors(UP, ar.u);
  const arrowMesh = new THREE.InstancedMesh(arrowGeo, arrowMat, arrows.length);
  arrowMesh.frustumCulled = false;
  arrowMesh.renderOrder = 4;
  module.add(arrowMesh);
  // the memory read: heads of veille light running up from the board and out through the cut
  const READ = 7;
  const readU = { uTime: { value: 0 }, uRead: { value: 0 }, uCol: { value: VEILLE.clone() } };
  const readMat = new THREE.ShaderMaterial({
    uniforms: readU,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aT; attribute float aSeed; varying float vT; varying float vSeed;
      void main() { vT = aT; vSeed = aSeed; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uRead; uniform vec3 uCol; varying float vT; varying float vSeed;
      void main() {
        if (uRead < 0.002 || vT > uRead * 1.05) discard;
        float h = fract(uTime * 0.55 + vSeed) * 1.4 - 0.2;
        float head = smoothstep(h - 0.32, h, vT) * (1.0 - smoothstep(h, h + 0.03, vT));
        float fadeEnd = 1.0 - smoothstep(0.75, 1.0, vT);
        gl_FragColor = vec4(uCol * (0.22 + 1.7 * head) * fadeEnd * min(uRead * 2.0, 1.0), 1.0);
      }`,
  });
  {
    const geos = [];
    const dir = new THREE.Vector3(0, Math.sin(58 * DEG), Math.cos(58 * DEG));
    for (let i = 0; i < READ; i++) {
      const len = 12 + R() * 5;
      const g = new THREE.CylinderGeometry(0.075, 0.075, len, 6, 12, true);
      const pos = g.attributes.position;
      const t = new Float32Array(pos.count);
      for (let v = 0; v < pos.count; v++) t[v] = pos.getY(v) / len + 0.5;
      g.setAttribute("aT", new THREE.BufferAttribute(t, 1));
      g.setAttribute("aSeed", new THREE.Float32BufferAttribute(new Array(pos.count).fill(i / READ + R() * 0.1), 1));
      g.translate(0, len / 2, 0);
      const sx = (R() - 0.5) * 0.35;
      const d = dir.clone().add(new THREE.Vector3(sx, 0, 0)).normalize();
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, d));
      g.translate(-1.45 + (i / (READ - 1)) * 2.9, bt / 2 + 0.2, (R() - 0.5) * 0.8);
      geos.push(g);
    }
    const lines = new THREE.Mesh(mergeRaw(geos), readMat);
    lines.renderOrder = 7;
    lines.frustumCulled = false;
    board.add(lines);
  }
  // the bands catch the light (`shine`): a glint that runs along each band, up the near side and over the top
  const glintMat = () => new THREE.SpriteMaterial({ map: glowTex, color: INK.clone(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false });
  const glints = CHASSIS.bands.map((bx) => {
    const s = new THREE.Sprite(glintMat());
    s.scale.setScalar(4);
    chassis.add(s);
    return { s, bx };
  });
  const mGlint = new THREE.Sprite(glintMat());
  mGlint.scale.setScalar(3.6);
  module.add(mGlint);

  /* ════════════════ assembly ════════════════ */
  const rest = new THREE.Group(); // what stays on the bottom when the module rises (sep)
  rest.add(chassis, boards, beacon);
  module.position.set(...MODULE.at);
  root.add(rest, module);
  const parts = { beacon, pile, chassis, boards, module, steel, insul, absorb, board };

  // anchors: on the vertical cut face (the one VIEW.section looks at), half-way through each layer
  const onFace = (part, name, r) => {
    const a = CUT - WID[name] / 2 - 4 * DEG;
    return anchor(part, -1.5, -r * Math.sin(a), r * Math.cos(a));
  };
  const A = {
    beacon: anchor(beacon, -half - 0.2, 0, 0),
    pile: anchor(pile, 0, 0, 0),
    chassis: anchor(chassis, 0, H, 0),
    boards: anchor(cards[2].sg, 0, BOARDS.h / 2, 0),
    module: anchor(module, 0, 0, 0),
    board: anchor(board, 0, 0, 0),
    steel: onFace(steel, "steel", (rs + rsi) / 2),
    insul: onFace(insul, "insul", (ri + rii) / 2),
    absorb: onFace(absorb, "absorb", (ra + rai) / 2),
    centre: anchor(root, 0, 12.5, 0),
  };

  /* ── what update() moves, allocated once ── */
  const BEX = new THREE.Vector3(-14, 10, 12); //  the beacon: forward and up
  const PEX = new THREE.Vector3(-9, 3, 0); //  its battery: further out of it
  const CEX = new THREE.Vector3(6, 0, -6); //  the chassis: back, on the floor
  const LEX = new THREE.Vector3(2, 12, -14); // its lid: up, behind the boards
  const MEX = new THREE.Vector3(-6, 8, 12); // the module: lifted a little, at the centre
  const BDROP = new THREE.Vector3(-13.5, BEACON.r, 2); // the beacon fallen on the bottom when the module rises
  const QDROP = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.35, 0));
  const BAPART = new THREE.Vector3(-21, BEACON.r, 9);
  const QAPART = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 1.1, 0.12));
  const QID = new THREE.Quaternion();
  const QLID = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.55, 0, 0.18)); // the lid, lifted, turns toward the eye
  const BIS = new THREE.Vector3(0, Math.SQRT1_2, Math.SQRT1_2); // the cut's bisector (module frame)
  const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _m = new THREE.Matrix4();
  const _c = new THREE.Color();
  const lastLit = { c: -1, b: -1, p: -1, m: -1, k: -1 };

  return {
    root, A, parts,
    update(P = {}, time = 0) {
      const k = P.explode ?? 0, x = P.xray ?? 0, ap = P.apart ?? 0, sep = P.sep ?? 0, sec = P.section ?? 0;
      const heat = P.heat ?? 0, crush = P.crush ?? 0, hold = P.hold ?? 0, read = P.read ?? 0, shine = P.shine ?? 0;
      const litB = P.litBeacon ?? 0, litP = P.litPile ?? 0, litC = P.litCase ?? 0, litK = P.litCore ?? 0;

      /* the exploded view: each part in its window, in the voice's order */
      const eb = win(k, 0, 0.45), ep = win(k, 0.15, 0.6), ec = win(k, 0.3, 0.85), em = win(k, 0.5, 1);
      rest.position.y = -sep;
      module.position.set(MODULE.at[0] + MEX.x * em, MODULE.at[1] + MEX.y * em, MODULE.at[2] + MEX.z * em);

      // the beacon: forward and up (bench); fallen in front when the module has left (sep); broken away (apart)
      const drop = smooth(0, 40, sep);
      _v.copy(BC).addScaledVector(BEX, eb);
      _v.lerp(BDROP, drop).lerp(BAPART, ap);
      beacon.position.copy(_v);
      beacon.quaternion.slerpQuaternions(QID, QDROP, drop).slerp(QAPART, ap);
      pile.position.copy(PH).addScaledVector(PEX, ep);

      // the chassis: back on the floor, its lid up; its panels scattered and dead on the bottom (apart)
      chassis.position.copy(CEX).multiplyScalar(ec);
      const ae = easeInOut(ap);
      for (const p of panels) {
        p.g.position.copy(p.home);
        p.g.quaternion.copy(QID);
        if (p.g === pLid.g) {
          p.g.position.addScaledVector(LEX, ec);
          p.g.quaternion.slerp(QLID, ec);
        }
        if (ae > 0) {
          p.g.position.lerp(p.to, ae);
          p.g.quaternion.slerp(p.qTo, ae);
        }
      }
      lidGhostG.position.copy(pLid.g.position);
      lidGhostG.quaternion.copy(pLid.g.quaternion);
      cPaint.color.lerpColors(PAINT, DEAD, ap);
      cTape.color.setHex(0xd8d2c3).lerp(DEAD_GREY, ap);
      bBody.color.setHex(0xa9aaa2).lerp(DEAD_GREY, ap * 0.8);

      // the boards: out of the chassis in a fan, toward the back; scattered on the bottom (apart)
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const u = win(k, 0.36 + i * 0.05, 0.85);
        _v.copy(c.home).addScaledVector(CEX, ec).addScaledVector(c.fan, u);
        if (ae > 0) _v.lerp(c.to, ae);
        c.sg.position.copy(_v);
        c.gg.position.copy(_v);
        c.sg.quaternion.slerpQuaternions(QID, c.qTo, ae);
        c.gg.quaternion.copy(c.sg.quaternion);
      }

      /* the X-ray: the chassis, its boards and the beacon turn to glass; the module stays solid */
      const xs = 1 - x;
      fade(cFade, xs);
      fade(bFade, xs);
      fade(boardsFade, xs);
      const gx = x * (1 - ap);
      const lc = litC * (1 - x * 0.5);
      for (const g of [cGhostBody, cGhostLid]) {
        g.mat.uniforms.uAmount.value = Math.max(gx, litC * 0.6);
        g.mat.uniforms.uColor.value.lerpColors(INK, VEILLE, litC);
        g.line.opacity = 0.6 * Math.max(gx, litC * 0.8);
        g.line.color.lerpColors(INK, VEILLE, litC);
      }
      cGhost.visible = gx > 0.004 || litC > 0.004;
      for (const c of cards) {
        c.ghost.mat.uniforms.uAmount.value = gx * 0.9;
        c.ghost.mat.uniforms.uColor.value.lerpColors(INK, VEILLE, litC);
        c.ghost.line.opacity = 0.55 * gx;
        c.ghost.line.color.lerpColors(INK, VEILLE, litC);
        c.gg.visible = gx > 0.004;
      }
      bGhostBody.mat.uniforms.uAmount.value = Math.max(gx, litB * 0.6);
      bGhostBody.mat.uniforms.uColor.value.lerpColors(INK, VEILLE, litB);
      bGhostBody.line.opacity = 0.6 * Math.max(gx, litB * 0.8);
      bGhost.visible = gx > 0.004 || litB > 0.004;

      /* the part the voice names glows faintly veille */
      if (lastLit.c !== lc) {
        lastLit.c = lc;
        lightLines(cLines, lc);
        lightLines(cardLines, lc);
        bPcb.emissive.copy(VEILLE).multiplyScalar(0.22 * lc);
        bChip.emissive.copy(VEILLE).multiplyScalar(0.12 * lc);
      }
      if (lastLit.b !== litB) {
        lastLit.b = litB;
        lightLines(bLines, litB);
        bBody.emissive.copy(VEILLE).multiplyScalar(0.18 * litB);
      }
      if (lastLit.p !== litP) {
        lastLit.p = litP;
        lightLines(pLines, litP);
        pBody.emissive.copy(VEILLE).multiplyScalar(0.25 * litP);
      }
      const charge = clamp01(P.charge ?? 1);
      for (let i = 0; i < gauge.length; i++) {
        const f = clamp01(charge * gauge.length - i); // this step's share of the charge
        _c.copy(GAUGE_OFF).lerp(VEILLE, f).multiplyScalar(f > 0 ? 1 + 0.2 * f : 1);
        gauge[i].color.copy(_c).multiplyScalar(f > 0 ? 0.12 + 0.88 * Math.max(litP, ep) : 1);
      }

      /* the ping: a clean breath of light at the nose, a tenth of a second, once a second (fond.js: the same phase) */
      const ph = (((time - PING.at) / PING.period) % 1 + 1) % 1;
      const env = (P.ping ?? 0) * smooth(0, 0.015, ph) * (1 - smooth(0.03, 0.1, ph)) * (1 - ap);
      lensMat.color.copy(VEILLE).multiplyScalar(0.35 + 2.4 * env);
      flashMat.opacity = Math.min(1, env * 1.2);
      flash.scale.setScalar(2.5 + 5.5 * env);
      flash.visible = env > 0.002;

      /* the module cut open: a wedge out of each layer, toward the camera; the layers part by a hair */
      const open = sec > 0.001;
      intact.visible = !open;
      for (const n of ["skin", "steel", "insul", "absorb"]) {
        const pc = pieces[n];
        pc.keep.visible = open;
        const d = { skin: 10, steel: 10, insul: 8, absorb: 6.5 }[n] * easeInOut(clamp01(sec * 1.25));
        pc.wedge.position.copy(BIS).multiplyScalar(d);
        fade(pc.fade, open ? 1 - smooth(0.3, 0.85, sec) : 0);
      }
      insul.visible = absorb.visible = board.visible = open || read > 0.001;
      const sp = easeInOut(sec);
      insul.scale.setScalar(1 - 0.055 * sp);
      absorb.scale.setScalar(1 - 0.11 * sp);
      fade(ringFade, 1 - smooth(0, 0.3, sec));

      /* the steel: it flexes and springs back, it glows from the flame, it holds */
      SHELL.uFlex.value = P.flex ?? 0;
      SHELL.uHeat.value = heat * (0.9 + 0.1 * Math.sin(time * 2.6));
      const lS = Math.max(P.litSteel ?? 0, hold * sec), lI = P.litInsul ?? 0, lA = P.litAbsorb ?? 0;
      steelCut.emissive.copy(VEILLE).multiplyScalar(0.42 * lS);
      insulM.emissive.copy(VEILLE).multiplyScalar(0.3 * lI);
      absorbM.emissive.copy(VEILLE).multiplyScalar(0.38 * lA);
      for (const m of [steelCut, insulM, absorbM]) m.emissiveIntensity = 1;
      coreShellMat.uniforms.uAmount.value = Math.max(litK * 0.85, hold) * (1 - sec);
      coreShell.visible = coreShellMat.uniforms.uAmount.value > 0.004;
      if (lastLit.m !== litK + hold) {
        lastLit.m = litK + hold;
        lightLines(mLines, Math.min(1, litK + hold) * 0.7);
      }

      /* the memory read */
      readU.uTime.value = time;
      readU.uRead.value = read;
      memPcb.emissive.copy(VEILLE).multiplyScalar(0.55 * read);
      if (lastLit.k !== read) {
        lastLit.k = read;
        lightLines(memLines, read);
      }

      /* the flame and its embers */
      flameU.uTime.value = time;
      flameU.uHeat.value = heat;
      embers.visible = heat > 0.002;
      if (embers.visible) {
        for (let i = 0; i < EMB; i++) {
          const [ph0, ex, side, sp2] = emberSeed[i];
          const life = (time * (0.16 + 0.1 * sp2) + ph0) % 1;
          _v.set(ex + 0.7 * Math.sin(time * 0.8 + i), -MR + 1 + life * 13, side * (MR + 0.6 + 1.2 * life));
          const s = heat * Math.sin(Math.PI * life);
          _s.set(s, s, s);
          _m.compose(_v, QID, _s);
          embers.setMatrixAt(i, _m);
        }
        embers.instanceMatrix.needsUpdate = true;
      }

      /* the pressure arrows */
      arrowMesh.visible = crush > 0.002;
      if (arrowMesh.visible) {
        arrowMat.opacity = Math.min(1, crush * 2.5);
        for (let i = 0; i < arrows.length; i++) {
          const ar = arrows[i];
          const gap = 0.7 + 11 * (1 - crush) * (1 - crush) + 0.35 * Math.sin(time * 2.1 + i * 1.7);
          const s = (0.55 + 0.45 * crush) * (ar.cut ? 1 - sec : 1);
          _v.copy(ar.base).addScaledVector(ar.u, gap);
          _s.set(s, s, s);
          _m.compose(_v, ar.q, _s);
          arrowMesh.setMatrixAt(i, _m);
        }
        arrowMesh.instanceMatrix.needsUpdate = true;
      }

      /* the bands catch the light: a glint up the near side and over the top, the tape brighter */
      cTape.emissive.copy(INK).multiplyScalar(0.2 * shine);
      mTape.emissive.copy(INK).multiplyScalar(0.2 * shine);
      for (let i = 0; i < glints.length; i++) {
        const g = glints[i];
        const u = shine * 1.35 - 0.12 - i * 0.12; // 0 → 1 along the band: up the +z side (13), across the top (13)
        const on = shine > 0.001 && u > 0 && u < 1;
        g.s.visible = on;
        if (!on) continue;
        const s = u * 26;
        if (s < H) g.s.position.set(g.bx, s, W / 2 + 0.25);
        else g.s.position.set(g.bx, H + 0.25, W / 2 - (s - H));
        g.s.material.opacity = Math.sin(Math.PI * u) * 0.9;
      }
      {
        const u = shine * 1.3 - 0.2;
        const on = shine > 0.001 && u > 0 && u < 1 && !open;
        mGlint.visible = on;
        if (on) {
          const a = -0.9 + u * 2.8; // from low on the near side, over the top
          mGlint.position.set(0, (MR + 0.3) * Math.sin(a), (MR + 0.3) * Math.cos(a));
          mGlint.material.opacity = Math.sin(Math.PI * u) * 0.85;
        }
      }
    },
  };
}
