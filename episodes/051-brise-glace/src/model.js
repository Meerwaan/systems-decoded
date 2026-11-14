// DOSSIER 051 — Le brise-glace : THE SYSTEM, solid. A generic heavy icebreaker (≈ 116 m: neither the Xuelong nor
// the Oden — no livery, no name, no flag). Centimetres, the ship frame of plan.js (origin at the waterline amidships,
// bow −z, port −x). docs/051-decors.md, « ## model.js »; journal: docs/journal/051-model.md.
//
//   buildShip() → { root, parts, A, update(S, time, onBench) }
//   parts  { hull, belt, tanksPort, tanksStar, stem, straight, deckhouse, props } — each with ITS OWN materials
//   A      anchors: belt, tankPort, tankStar, stem (the stem's waterline point), push (the arrow's root), props, bridge
//   update reads S.explode, litBelt, litTanks, litStem, straight, push, section, tanks, pump, heel, prop (+ onBench)
//
// THE HULL is a skin through rows: for each height of the midship section (keel → deck) the line runs from the stem
// (STEM.profile: where that height meets the stem) back to the transom. Three zones along it, each its own mesh:
//   the STEM zone (the first 15 m from the stem at every height: the spoon bow, the hero, the lightest grey),
//   the FORE body (to z = 0) and the AFT body (z = 0 → transom) — split at z = 0 so the transverse cutaway
//   (`section`) is the aft half sliding away and a drawn section capping the fore half.
// THE BELT is not painted on: the hull has a 30 cm groove at the waterline and the belt plates fill it, flush —
// lighter steel, plate joints; when it comes off (the exploded view) the groove stays, dark.
// THE TANKS (bench): glass boxes against the sides with veille water whose surface is horizontal in the WORLD (a
// shader discards above a world height: when the hull rolls, the water stays level); the cross pipes carry dashes.
// THE SECTION CAP (ice, `section`): a flat drawn cut at z = 0 — plating, frames, belt, decks, the two tanks and their
// water (same level shader), the cross pipe and its dashes.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, glass, asShell, setGlow, setPartOpacity, anchor, box, cyl, fatLine, lineMat, edgesOf } from "@kit/build3d.js";
import { SHIP, STEM, BELT, TANKS, DECKHOUSE, PROPS, PUSH } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/* ───────────────────────────── the lines of the hull ───────────────────────────── */

const ENTRY = -1200; //   z where the parallel middle body begins (the bow's entrance runs from the stem to here)
const STEMZONE = 1500; // the stem piece: the first 15 m aft of the stem, at every height
const CUT = 0; //         the transverse cutaway (plan: « z = 0 »)
const GROOVE = 30; //     the belt's groove in the hull
const half = SHIP.beam / 2;
const FLARE = 0.14; //    the sides lean out above the waterline (≈ 8°)
const sideX = (y) => half + FLARE * Math.max(0, y);

/** z where a height y meets a stem profile ([z, y] points, deck → keel) */
function stemZ(profile, y) {
  for (let i = 0; i < profile.length - 1; i++) {
    const [z0, y0] = profile[i];
    const [z1, y1] = profile[i + 1];
    if (y <= y0 && y >= y1) return z0 + ((y - y0) / (y1 - y0)) * (z1 - z0);
  }
  return y > profile[0][1] ? profile[0][0] : profile.at(-1)[0];
}
const zEnd = (y) => stemZ(STEM.profile, y);
/** the hull's fullness at (z, y): 0 at the stem, 1 in the middle body; a little taper toward the transom */
function fullness(z, y) {
  const e = zEnd(y);
  const s = clamp01((z - e) / Math.max(1, ENTRY - e));
  let f = 1 - Math.pow(1 - s, 2.4);
  if (z > 2600) f *= 1 - 0.16 * ((z - 2600) / 3000) ** 2;
  return f;
}
/** the bottom rises toward the stern (the run to the propellers): heights under −300 lift, the keel the most */
function rise(z, y) {
  return 450 * smooth(2800, SHIP.stern, z) * clamp01((-y - 300) / 500);
}
const point = (x0, y0, z) => [x0 * fullness(z, y0), y0 + rise(z, y0), z];

/** the midship section, one side, keel → deck: [x, y] (the flat bottom, the bilge, the side, the flare) */
const BILGE = [-67.5, -45, -22.5].map((a) => [1000 + 300 * Math.cos(a * DEG), -500 + 300 * Math.sin(a * DEG)]);
const LOW = [[0, -800], [500, -800], [1000, -800], ...BILGE, [half, -500], [half, -400]];
const BAND = [BELT.bottom, -125, 0, 100, BELT.top].map((y) => [sideX(y), y]);
const HIGH = [400, 650, SHIP.deck].map((y) => [sideX(y), y]);
const PLAIN = [...LOW, ...BAND, ...HIGH]; //                                      the stem piece: no groove
const GROOVED = [...LOW, BAND[0], ...BAND.map(([x, y]) => [x - GROOVE, y]), BAND.at(-1), ...HIGH]; // the hull
const BELTROWS = [[BAND[0][0] - GROOVE, BAND[0][1]], ...BAND, [BAND.at(-1)[0] - GROOVE, BAND.at(-1)[1]]]; // the belt plates

/** columns along the length — each a function of the row's height (the stem meets every height elsewhere) */
const S_STEM = [0, 30, 90, 180, 320, 520, 780, 1100, STEMZONE];
const COL_STEM = S_STEM.map((s) => (y) => zEnd(y) + s);
const COL_FORE = Array.from({ length: 11 }, (_, k) => (y) => {
  const a = zEnd(y) + STEMZONE;
  return a + ((CUT - a) * k) / 10;
});
const COL_AFT = [CUT, 600, 1200, 1800, 2400, 3000, 3500, 3900, 4300, 4650, 4950, 5200, 5420, SHIP.stern].map((z) => () => z);

/** a skin through rows of points (rows[i][j] = [x, y, z]); after the L04's bord.js */
function skin(rows) {
  const n = rows[0].length;
  const pos = new Float32Array(rows.length * n * 3);
  rows.forEach((row, i) => row.forEach((p, j) => pos.set(p, (i * n + j) * 3)));
  const index = [];
  for (let i = 0; i < rows.length - 1; i++) {
    for (let j = 0; j < n - 1; j++) {
      const a = i * n + j;
      index.push(a, a + 1, a + 1 + n, a, a + 1 + n, a + n);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}
/** the whole ring of a column: port deck → keel → starboard deck */
const ringOf = (halfRows, col) => [
  ...halfRows.slice(1).reverse().map(([x, y]) => point(-x, y, col(y))),
  ...halfRows.map(([x, y]) => point(x, y, col(y))),
];
const hullSkin = (halfRows, cols) => skin(cols.map((c) => ringOf(halfRows, c)));
/** one side's strip (the belt) */
const stripSkin = (rows, cols, sgn) => skin(cols.map((c) => (sgn < 0 ? rows.slice().reverse() : rows).map(([x, y]) => point(sgn * x, y, c(y)))));

/** a flat polygon in the deck plane ([x, z] points) at height y */
function deckGeo(pts, y) {
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI / 2); // (x, −z, 0) → (x, 0, z), the face up
  g.translate(0, y, 0);
  return g;
}
/** the deck outline over a run of columns: starboard edge forward → aft, port edge back */
function deckOutline(cols, at = (c) => point(sideX(SHIP.deck), SHIP.deck, c(SHIP.deck))) {
  const star = cols.map((c) => at(c));
  return [...star.map(([x, , z]) => [x, z]), ...star.reverse().map(([x, , z]) => [-x, z])];
}

/** the « presque droite » bow: from its own stem to where the stem piece joins the hull (same seam, same widths) */
function straightRing(t) {
  return [
    ...PLAIN.slice(1).reverse().map(([x, y]) => straightPoint(-x, y, t)),
    ...PLAIN.map(([x, y]) => straightPoint(x, y, t)),
  ];
}
function straightPoint(x0, y0, t) {
  const e = stemZ(STEM.straight.profile, y0);
  const zb = zEnd(y0) + STEMZONE;
  const xb = x0 * fullness(zb, y0);
  return [xb * (1 - Math.pow(1 - t, 2.2)), y0, e + (zb - e) * t];
}
const T_STRAIGHT = [0, 0.04, 0.1, 0.19, 0.31, 0.46, 0.63, 0.81, 1];

/* ───────────────────────────── materials of the house ───────────────────────────── */

const C = {
  hull: 0x4d555d, //  the dark plating
  deck: 0x7d858d, //  the deck faces, lighter
  belt: 0xaab2b9, //  the ice belt: lighter steel (a value, not a colour)
  stem: 0xc6ccd2, //  THE STEM — the hero, the lightest
  house: 0x646c74, // the superstructure
  window: 0x0f1215,
  dark: 0x1b1f23,
  prop: 0x8a9299,
};

/** veille water that stops at a WORLD height (uLevel): its surface stays level when the hull rolls */
function waterMat(uni, k = 1.2) {
  const m = glow(BRAND.veille, k, { double: true });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uLevel = uni.level;
    sh.uniforms.uBand = uni.band;
    sh.vertexShader = "varying float vWy;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\n  vWy = (modelMatrix * vec4(transformed, 1.0)).y;");
    sh.fragmentShader =
      "uniform float uLevel; uniform float uBand; varying float vWy;\n" +
      sh.fragmentShader
        .replace("void main() {", "void main() {\n  if (vWy > uLevel) discard;")
        .replace("vec4 diffuseColor = vec4( diffuse, opacity );", "float sk = 1.0 - clamp((uLevel - vWy) / max(uBand, 1.0), 0.0, 1.0);\n  vec4 diffuseColor = vec4( diffuse * (1.0 + 1.1 * sk * sk), opacity );");
  };
  m.customProgramCacheKey = () => "sd051-water";
  return m;
}

/** segments [[a, b], …] as one fat-line object (the belt's plate joints) */
function segments(pairs, mat) {
  const g = new LineSegmentsGeometry();
  g.setPositions(pairs.flat(2));
  const o = new LineSegments2(g, mat);
  o.renderOrder = 3;
  return o;
}

/** the outline of a skin without its seam at the cut (fore and aft bodies are one hull until the section opens) */
function seamless(part, mesh, { color = BRAND.ink, width = 2, opacity = 0.8 } = {}) {
  const src = new THREE.EdgesGeometry(mesh.geometry, 30).attributes.position.array;
  const kept = [];
  for (let i = 0; i < src.length; i += 6) {
    if (Math.abs(src[i + 2] - CUT) < 1 && Math.abs(src[i + 5] - CUT) < 1) continue;
    for (let k = 0; k < 6; k++) kept.push(src[i + k]);
  }
  const g = new LineSegmentsGeometry();
  g.setPositions(kept);
  const mat = lineMat(color, width, { opacity });
  part.userData.part.mats.add(mat);
  const o = new LineSegments2(g, mat);
  o.renderOrder = 2;
  mesh.add(o);
  return mesh;
}

/** a mesh moved into a sub-group after addMesh registered its materials in the part */
function into(group, mesh) {
  group.add(mesh);
  return mesh;
}

export function buildShip() {
  const root = new THREE.Group();

  /* ── THE HULL: fore body, aft body (its own sub-part: it slides away for the section), deck, transom ── */
  const hull = makePart("hull");
  const hullAft = makePart("hullAft");
  hull.add(hullAft);
  const hullMat = solid(C.hull, { rough: 0.62, metal: 0.2 });
  const hullAftMat = solid(C.hull, { rough: 0.62, metal: 0.2 });
  const deckMat = solid(C.deck, { rough: 0.7, metal: 0.15 });
  const deckAftMat = solid(C.deck, { rough: 0.7, metal: 0.15 });
  const COL_FORE_ALL = [COL_STEM.at(-1), ...COL_FORE.slice(1)];
  const foreGeo = hullSkin(GROOVED, COL_FORE_ALL);
  const aftGeo = hullSkin(GROOVED, COL_AFT);
  seamless(hull, addMesh(hull, foreGeo, hullMat, { edges: false }));
  seamless(hullAft, addMesh(hullAft, aftGeo, hullAftMat, { edges: false }));
  const deckFore = deckGeo(deckOutline(COL_FORE_ALL), SHIP.deck);
  const deckAft = deckGeo(deckOutline(COL_AFT), SHIP.deck);
  addMesh(hull, deckFore, deckMat, { edges: false });
  addMesh(hullAft, deckAft, deckAftMat, { edges: false });
  // the transom: the last column's ring, closed along the deck
  const lastRing = ringOf(GROOVED, COL_AFT.at(-1));
  const transomGeo = new THREE.ShapeGeometry(new THREE.Shape(lastRing.map(([x, y]) => new THREE.Vector2(x, y)))).translate(0, 0, SHIP.stern);
  addMesh(hullAft, transomGeo, hullAftMat);
  // deck fittings: two winches forward of the house, bollards, a rail line along the deck edge
  const fitMat = solid(C.house, { rough: 0.6, metal: 0.3 });
  for (const s of [-1, 1]) {
    addMesh(hull, box(320, 170, 420, 20), fitMat, { pos: [s * 480, SHIP.deck + 85, -3800] });
    addMesh(hull, cyl(45, 90, 6, 20), fitMat, { pos: [s * 1150, SHIP.deck + 45, -1600] });
  }
  const railPts = (sgn, cols) => cols.map((c) => { const [x, y, z] = point(sideX(SHIP.deck), SHIP.deck, c(SHIP.deck)); return [sgn * (x - 25), y + 110, z]; });
  const railMat = lineMat(BRAND.ink, 1.8, { opacity: 0.45 });
  hull.userData.part.mats.add(railMat);
  for (const s of [-1, 1]) {
    const l = fatLine(railPts(s, COL_FORE_ALL), {});
    l.material = railMat;
    hull.add(l);
  }

  /* ── THE BELT: plates flush in the hull's groove, both sides, fore and aft; plate joints; the lit edge ── */
  const belt = makePart("belt");
  const beltAft = makePart("beltAft");
  belt.add(beltAft);
  const beltPort = new THREE.Group();
  const beltStar = new THREE.Group();
  const beltPortAft = new THREE.Group();
  const beltStarAft = new THREE.Group();
  belt.add(beltPort, beltStar);
  beltAft.add(beltPortAft, beltStarAft);
  const beltMat = solid(C.belt, { rough: 0.46, metal: 0.2 });
  const beltAftMat = solid(C.belt, { rough: 0.46, metal: 0.2 });
  const jointMat = lineMat(0x15191c, 1.9, { opacity: 0.7 });
  const jointAftMat = lineMat(0x15191c, 1.9, { opacity: 0.7 });
  belt.userData.part.mats.add(jointMat);
  beltAft.userData.part.mats.add(jointAftMat);
  const BELT_EM = new THREE.Color(0x2c3034); // like the stem: a faint light of its own, so the band reads lighter than the hull from any side
  const beltLitMat = glow(BRAND.veille, 0);
  const beltLitAftMat = glow(BRAND.veille, 0);
  for (const s of [-1, 1]) {
    const gFore = s < 0 ? beltPort : beltStar;
    const gAft = s < 0 ? beltPortAft : beltStarAft;
    into(gFore, seamless(belt, addMesh(belt, stripSkin(BELTROWS, COL_FORE_ALL, s), beltMat, { edges: false })));
    into(gAft, seamless(beltAft, addMesh(beltAft, stripSkin(BELTROWS, COL_AFT, s), beltAftMat, { edges: false })));
    // plate joints: butts every ≈ 7 m, one seam along the middle (≥ 1.8 px: dark on the light steel)
    const butt = (z) => {
      const a = point(s * sideX(BELT.bottom), BELT.bottom, z);
      const b = point(s * sideX(BELT.top), BELT.top, z);
      return [[a[0] + s * 4, a[1] + 8, a[2]], [b[0] + s * 4, b[1] - 8, b[2]]];
    };
    const seam = (cols) => cols.slice(0, -1).map((c, i) => {
      const a = point(s * sideX(-25), -25, c(-25));
      const b = point(s * sideX(-25), -25, cols[i + 1](-25));
      return [[a[0] + s * 4, a[1], a[2]], [b[0] + s * 4, b[1], b[2]]];
    });
    const foreButts = [];
    for (let z = -2600; z < CUT - 100; z += 700) foreButts.push(butt(z));
    const aftButts = [];
    for (let z = CUT + 600; z < SHIP.stern - 200; z += 700) aftButts.push(butt(z));
    gFore.add(segments([...foreButts, ...seam(COL_FORE_ALL)], jointMat));
    gAft.add(segments([...aftButts, ...seam(COL_AFT)], jointAftMat));
    // the lit edges (veille, top and bottom of the band): tubes, so they hold at a distance
    for (const y of [BELT.top, BELT.bottom]) {
      const run = (cols) => new THREE.CatmullRomCurve3(cols.map((c) => { const p = point(s * (sideX(y) + 6), y, c(y)); return new THREE.Vector3(...p); }));
      into(gFore, addMesh(belt, new THREE.TubeGeometry(run(COL_FORE_ALL), 60, 14, 6), beltLitMat, { edges: false }));
      into(gAft, addMesh(beltAft, new THREE.TubeGeometry(run(COL_AFT), 40, 14, 6), beltLitAftMat, { edges: false }));
    }
  }

  /* ── THE STEM: the spoon bow, the lightest piece, its deck; the lit edge (« le cœur ») ── */
  const stem = makePart("stem");
  const stemMat = solid(C.stem, { rough: 0.5, metal: 0.12 });
  // the key comes from astern: the spoon faces forward and down, away from it. A faint light of its own keeps the
  // hero the lightest thing of the ship from the bow (its shading still reads)
  const STEM_EM = new THREE.Color(0x50565c);
  const stemDeckMat = solid(C.deck, { rough: 0.7, metal: 0.15 });
  addMesh(stem, hullSkin(PLAIN, COL_STEM), stemMat, { threshold: 30 });
  addMesh(stem, deckGeo(deckOutline(COL_STEM), SHIP.deck), stemDeckMat, { edges: false });
  // a bulwark around the forecastle: the bow's silhouette reads as a ship's
  const bulMat = solid(C.stem, { rough: 0.5, metal: 0.3, double: true });
  {
    const rows = COL_STEM.map((c) => {
      const [x, y, z] = point(sideX(SHIP.deck), SHIP.deck, c(SHIP.deck));
      return [[-x, y, z], [-x * 1.002, y + 120, z], [x * 1.002, y + 120, z], [x, y, z]];
    });
    // two strips (port, starboard): [deck edge, top] along the columns
    for (const k of [0, 2]) addMesh(stem, skin(rows.map((r) => [r[k === 0 ? 0 : 3], r[k === 0 ? 1 : 2]])), bulMat, { threshold: 30 });
  }
  const stemLitMat = glow(BRAND.veille, 0);
  const stemCurve = new THREE.CatmullRomCurve3(STEM.profile.map(([z, y]) => new THREE.Vector3(0, y, z)));
  addMesh(stem, new THREE.TubeGeometry(stemCurve, 80, 18, 8), stemLitMat, { edges: false });
  // the stem's waterline point: a small lit collar where it rides the ice
  const contactMat = glow(BRAND.veille, 0, { additive: true });
  addMesh(stem, new THREE.SphereGeometry(70, 20, 12), contactMat, { pos: [0, 0, STEM.water], edges: false });

  /* ── THE « PRESQUE DROITE » STEM: signal, solid, at the same waterline point, the same seam ── */
  const straight = makePart("straight");
  const straightMat = solid(BRAND.signal, { rough: 0.62, metal: 0.1 });
  const straightDeckMat = solid(0x8a4a36, { rough: 0.7, metal: 0.1 });
  addMesh(straight, skin(T_STRAIGHT.map((t) => straightRing(t))), straightMat, { threshold: 30, edgeColor: 0x1d2226, edgeOpacity: 0.7 });
  {
    const star = T_STRAIGHT.map((t) => straightPoint(sideX(SHIP.deck), SHIP.deck, t));
    const pts = [...star.map(([x, , z]) => [x, z]), ...star.reverse().map(([x, , z]) => [-x, z])];
    addMesh(straight, deckGeo(pts, SHIP.deck), straightDeckMat, { edges: false });
  }

  /* ── THE TANKS (bench): glass boxes, level water, the cross pipes and their dashes ── */
  const tanksPort = makePart("tanksPort");
  const tanksStar = makePart("tanksStar");
  const TX = half - TANKS.inset - TANKS.width / 2; // the tanks' centre, off the axis
  const TH = TANKS.top - TANKS.bottom;
  const TY = (TANKS.top + TANKS.bottom) / 2;
  const level = { port: { level: { value: -1e5 }, band: { value: 45 } }, star: { level: { value: -1e5 }, band: { value: 45 } } };
  const tankGlass = glass(BRAND.ink, { base: 0.02, rim: 0.45, power: 2.6, edge: 0.6 });
  const pipeGlass = glass(BRAND.ink, { base: 0.02, rim: 0.5, power: 2.2, edge: 0.5 });
  const waterPort = waterMat(level.port);
  const waterStar = waterMat(level.star);
  const dashMats = [];
  const PIPE_IN = TX - TANKS.width / 2; // the tanks' inner walls
  for (const s of [-1, 1]) {
    const part = s < 0 ? tanksPort : tanksStar;
    const water = s < 0 ? waterPort : waterStar;
    const wallLines = lineMat(BRAND.ink, 2, { opacity: 0.85 });
    part.userData.part.mats.add(wallLines);
    for (const z of [TANKS.fore, TANKS.aft]) {
      const g = box(TANKS.width, TH, TANKS.length, 24);
      const shell = addMesh(part, g, tankGlass, { pos: [s * TX, TY, z], edges: false });
      asShell(shell, 12);
      const e = edgesOf(g);
      e.material = wallLines;
      shell.add(e);
      addMesh(part, new THREE.BoxGeometry(TANKS.width - 30, TH - 24, TANKS.length - 30), water, { pos: [s * TX, TY, z], edges: false });
      // the half cross pipe, inner wall → the keel line
      const pg = new THREE.CylinderGeometry(TANKS.pipe, TANKS.pipe, PIPE_IN, 20, 1, true).rotateZ(Math.PI / 2);
      asShell(addMesh(part, pg, pipeGlass, { pos: [(s * PIPE_IN) / 2, TANKS.pipeY, z], edges: false }), 11);
      const dm = lineMat(BRAND.veille, 7, { dashed: true, dashSize: 110, gapSize: 130, hdr: 1.6 });
      dashMats.push(dm);
      part.userData.part.mats.add(dm);
      const a = s < 0 ? [-PIPE_IN, TANKS.pipeY, z] : [0, TANKS.pipeY, z];
      const b = s < 0 ? [0, TANKS.pipeY, z] : [PIPE_IN, TANKS.pipeY, z];
      const dl = fatLine([a, b], { dashed: true });
      dl.material = dm;
      dl.computeLineDistances();
      dm.userData.phase = s < 0 ? 0 : PIPE_IN; // one rhythm across both halves: the starboard half starts where the port one ends
      part.add(dl);
    }
  }

  /* ── THE SUPERSTRUCTURE: tiers, the bridge and its windows, the mast; aft: funnel, crane, helideck ── */
  const deckhouse = makePart("deckhouse");
  const houseAft = makePart("houseAft");
  deckhouse.add(houseAft);
  const houseMat = solid(C.house, { rough: 0.6, metal: 0.25 });
  const houseLight = solid(0x737b83, { rough: 0.6, metal: 0.2 });
  const winMat = solid(C.window, { rough: 0.22, metal: 0.1 });
  const D0 = SHIP.deck;
  addMesh(deckhouse, box(DECKHOUSE.half * 2, 620, DECKHOUSE.to - DECKHOUSE.from, 30), houseMat, { pos: [0, D0 + 310, (DECKHOUSE.from + DECKHOUSE.to) / 2] });
  addMesh(deckhouse, box(DECKHOUSE.half * 2 - 120, 520, 2200, 30), houseLight, { pos: [0, D0 + 620 + 260, -2050] });
  addMesh(deckhouse, box(DECKHOUSE.half * 2 - 240, 220, 1900, 25), houseMat, { pos: [0, D0 + 1140 + 110, -2100] });
  // the bridge, its wings out to the sides, its band of dark windows wrapping the front
  const BR = { y0: DECKHOUSE.top, y1: DECKHOUSE.bridge, z0: DECKHOUSE.from, z1: DECKHOUSE.from + 1100, half: DECKHOUSE.half + 260 };
  addMesh(deckhouse, box(BR.half * 2, BR.y1 - BR.y0, BR.z1 - BR.z0, 30), houseLight, { pos: [0, (BR.y0 + BR.y1) / 2, (BR.z0 + BR.z1) / 2] });
  addMesh(deckhouse, box(BR.half * 2 + 12, 160, 24, 6), winMat, { pos: [0, BR.y0 + 230, BR.z0 - 4], edges: false });
  for (const s of [-1, 1]) addMesh(deckhouse, box(24, 160, BR.z1 - BR.z0 - 160, 6), winMat, { pos: [s * (BR.half + 4), BR.y0 + 230, (BR.z0 + BR.z1) / 2], edges: false });
  // rows of windows on the tiers' fronts
  addMesh(deckhouse, box(DECKHOUSE.half * 2 - 300, 90, 20, 5), winMat, { pos: [0, D0 + 400, DECKHOUSE.from - 4], edges: false });
  addMesh(deckhouse, box(DECKHOUSE.half * 2 - 400, 90, 20, 5), winMat, { pos: [0, D0 + 900, -3154], edges: false });
  for (const s of [-1, 1]) addMesh(deckhouse, box(20, 90, 2000, 5), winMat, { pos: [s * (DECKHOUSE.half + 4), D0 + 400, -1950], edges: false });
  // the mast on the bridge roof: a tapered tower, a yard, a radar dome
  const MZ = BR.z0 + 700;
  addMesh(deckhouse, cyl(90, 1000, 8, 16, 50), houseLight, { pos: [0, BR.y1 + 500, MZ] });
  addMesh(deckhouse, box(1200, 50, 60, 10), houseLight, { pos: [0, BR.y1 + 720, MZ] });
  addMesh(deckhouse, new THREE.SphereGeometry(130, 24, 14), houseLight, { pos: [0, BR.y1 + 1080, MZ] });
  addMesh(deckhouse, box(520, 36, 70, 8), houseMat, { pos: [0, BR.y1 + 860, MZ + 10] });
  // the funnel (raked), its dark top — the aft furniture has its own materials (it fades with the section)
  const houseMat2 = solid(C.house, { rough: 0.6, metal: 0.25 });
  const houseLight2 = solid(0x737b83, { rough: 0.6, metal: 0.2 });
  const [, , FZ] = DECKHOUSE.funnel;
  addMesh(houseAft, box(760, 1500, 1050, 60), houseMat2, { pos: [0, D0 + 750, FZ], rot: [0.08, 0, 0] });
  addMesh(houseAft, box(780, 160, 1070, 30), solid(C.dark, { rough: 0.8, metal: 0.1 }), { pos: [0, D0 + 1440, FZ + 58], rot: [0.08, 0, 0] });
  // a deck crane abaft the funnel
  addMesh(houseAft, cyl(110, 420, 10, 20), houseMat2, { pos: [900, D0 + 210, 2300] });
  addMesh(houseAft, box(90, 90, 1700, 14), houseLight2, { pos: [900, D0 + 700, 2900], rot: [-0.45, 0, 0] });
  // the helideck aft, on its posts, an H and its ring (white paint: ink, no livery)
  const [, , HZ] = DECKHOUSE.heli;
  const HY = D0 + 420;
  addMesh(houseAft, box(2300, 50, 2100, 12), houseLight2, { pos: [0, HY, HZ + 300] });
  for (const sx of [-1, 1]) for (const dz of [-700, 700]) addMesh(houseAft, cyl(45, 400, 6, 12), houseMat2, { pos: [sx * 950, D0 + 200, HZ + 300 + dz] });
  const paint = solid(0x9aa1a8, { rough: 0.8, metal: 0 });
  for (const sx of [-1, 1]) addMesh(houseAft, new THREE.BoxGeometry(70, 8, 620), paint, { pos: [sx * 200, HY + 29, HZ + 300], edges: false });
  addMesh(houseAft, new THREE.BoxGeometry(400, 8, 70), paint, { pos: [0, HY + 29, HZ + 300], edges: false });
  addMesh(houseAft, new THREE.RingGeometry(740, 790, 48).rotateX(-Math.PI / 2), paint, { pos: [0, HY + 29, HZ + 300], edges: false });

  /* ── THE PROPELLERS: shafts, hubs, four blades — which fade into a disc as they speed up — and the rudders ── */
  const props = makePart("props");
  const propMat = solid(C.prop, { rough: 0.45, metal: 0.45 });
  const blades = makePart("blades");
  const discs = makePart("discs");
  props.add(blades, discs);
  const bladeMat = solid(C.prop, { rough: 0.45, metal: 0.45 });
  const discMat = solid(0x6e767e, { rough: 0.55, metal: 0.2, opacity: 0.55, double: true });
  const spinners = [];
  for (const s of [-1, 1]) {
    addMesh(props, cyl(38, 1200, 4, 16), propMat, { pos: [s * PROPS.x, PROPS.y, PROPS.z - 640], rot: [Math.PI / 2, 0, 0] });
    addMesh(props, cyl(75, 260, 10, 24, 40), propMat, { pos: [s * PROPS.x, PROPS.y, PROPS.z + 40], rot: [Math.PI / 2, 0, 0] });
    const spin = new THREE.Group();
    spin.position.set(s * PROPS.x, PROPS.y, PROPS.z);
    blades.add(spin);
    for (let k = 0; k < PROPS.blades; k++) {
      const g = new THREE.SphereGeometry(1, 18, 10).scale(70, (PROPS.r - 60) / 2, 14).rotateY(0.65 * s).translate(0, 60 + (PROPS.r - 60) / 2, 0).rotateZ((k * 2 * Math.PI) / PROPS.blades);
      into(spin, addMesh(blades, g, bladeMat, { edges: false }));
    }
    spinners.push(spin);
    into(spin, addMesh(discs, new THREE.CircleGeometry(PROPS.r, 40), discMat, { edges: false }));
    // the rudder abaft the propeller
    addMesh(props, box(46, 520, 380, 12), propMat, { pos: [s * PROPS.x, PROPS.y - 10, PROPS.z + 330] });
  }

  /* ── THE WEIGHT: an arrow from the contact point, down (veille) — forward with the straight stem (signal) ── */
  const arrow = new THREE.Group();
  arrow.position.set(...PUSH.at);
  const arrowMat = glow(BRAND.veille, 1.6);
  const L = PUSH.length;
  const shaftM = new THREE.Mesh(new THREE.CylinderGeometry(55, 55, L - 280, 20), arrowMat);
  shaftM.position.y = -(L - 280) / 2;
  const headM = new THREE.Mesh(new THREE.ConeGeometry(160, 280, 24).rotateX(Math.PI), arrowMat);
  headM.position.y = -(L - 140);
  const arrowTurn = new THREE.Group();
  arrowTurn.add(shaftM, headM);
  arrow.add(arrowTurn);

  /* ── THE X-RAY of the hull (bench, while the tanks are named): the same skins in glass ── */
  const xray = new THREE.Group();
  const xrayMat = glass(BRAND.ink, { base: 0, rim: 0.32, power: 2.4, edge: 0.45, spec: 0.25, through: 0.3 });
  const xrayLines = lineMat(BRAND.ink, 1.8, { opacity: 0.5 });
  for (const g of [foreGeo, aftGeo, transomGeo]) {
    const m = new THREE.Mesh(g, xrayMat);
    asShell(m, 20);
    const e = edgesOf(g, { threshold: 30 });
    e.material = xrayLines;
    m.add(e);
    xray.add(m);
  }
  {
    const m = new THREE.Mesh(stem.children[0].geometry, xrayMat);
    asShell(m, 20);
    const e = edgesOf(m.geometry, { threshold: 30 });
    e.material = xrayLines;
    m.add(e);
    xray.add(m);
  }
  xray.visible = false;

  /* ── THE SECTION CAP at z = 0 (ice): a drawn cut through the fore half ── */
  const cap = new THREE.Group();
  cap.visible = false;
  {
    const halfSec = PLAIN.slice(1);
    const outline = [[0, -800], ...halfSec, ...halfSec.slice().reverse().map(([x, y]) => [-x, y])];
    const inset = (pts, d) =>
      pts.map((p, i) => {
        const a = pts[(i - 1 + pts.length) % pts.length];
        const b = pts[(i + 1) % pts.length];
        let nx = -(b[1] - a[1]);
        let ny = b[0] - a[0];
        const l = Math.hypot(nx, ny) || 1;
        nx /= l;
        ny /= l;
        return [p[0] + nx * d, p[1] + ny * d];
      });
    const V2 = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
    const shapeOf = (outer, hole) => {
      const sh = new THREE.Shape(V2(outer));
      if (hole) sh.holes.push(new THREE.Path(V2(hole)));
      return sh;
    };
    const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    // the cap is drawn OVER the sea (in the ice, the cut is below the waterline): no depth test, its layers
    // in the order of their offsets; front side only, so it never shows from forward of the cut
    const lay = (shape, mat, z) => {
      const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
      m.position.z = CUT + z;
      mat.depthTest = false;
      mat.depthWrite = false;
      mat.side = THREE.FrontSide;
      m.renderOrder = 30 + Math.round(z * 2);
      cap.add(m);
      return m;
    };
    const o35 = inset(outline, 40);
    const o110 = inset(outline, 120);
    lay(shapeOf(o110), solid(0x121518, { rough: 0.9 }), 3);
    lay(shapeOf(o35, o110), solid(0x30363c, { rough: 0.8, metal: 0.2 }), 4);
    lay(shapeOf(outline, o35), solid(0x5d666f, { rough: 0.55, metal: 0.35 }), 5);
    // the belt in section: drawn thick (true: 50 mm), the lightest band at the waterline
    for (const s of [-1, 1]) {
      const xb = sideX(BELT.bottom);
      const xt = sideX(BELT.top);
      lay(shapeOf([[s * xb, BELT.bottom], [s * xt, BELT.top], [s * (xt - 75), BELT.top], [s * (xb - 75), BELT.bottom]].map(([x, y]) => (s < 0 ? [x, y] : [x, y]))), solid(0xaeb5bc, { rough: 0.45, metal: 0.3, double: true }), 6);
    }
    const frameMat = solid(0x30363c, { rough: 0.8, metal: 0.2, double: true });
    lay(shapeOf(rect(-1260, 240, 1260, 270)), frameMat, 4.5); //            the tween deck
    lay(shapeOf(rect(-PIPE_IN + 20, -560, PIPE_IN - 20, -530)), frameMat, 4.5); // the inner bottom
    // the two tanks: walls, the dark inside, the water (the same level as the bench's tanks)
    const wallMat = solid(0x5d666f, { rough: 0.55, metal: 0.35, double: true });
    for (const s of [-1, 1]) {
      const x0 = s * (TX - TANKS.width / 2);
      const x1 = s * (TX + TANKS.width / 2);
      const [l, r] = s < 0 ? [x1, x0] : [x0, x1];
      lay(shapeOf(rect(l, TANKS.bottom, r, TANKS.top), rect(l + 22, TANKS.bottom + 22, r - 22, TANKS.top - 22)), wallMat, 6);
      lay(shapeOf(rect(l + 22, TANKS.bottom + 22, r - 22, TANKS.top - 22)), solid(0x0d0f11, { rough: 1 }), 5.5);
      const w = waterMat(s < 0 ? level.port : level.star, 1.25);
      lay(shapeOf(rect(l + 22, TANKS.bottom + 22, r - 22, TANKS.top - 22)), w, 7);
    }
    // the cross pipe across the bottom, its dashes
    lay(shapeOf(rect(-PIPE_IN, TANKS.pipeY - 48, PIPE_IN, TANKS.pipeY + 48)), solid(0x262b30, { rough: 0.6, double: true }), 6);
    const dm = lineMat(BRAND.veille, 7, { dashed: true, dashSize: 110, gapSize: 130, hdr: 1.6 });
    dashMats.push(dm);
    const dl = fatLine([[-PIPE_IN, TANKS.pipeY, CUT + 9], [PIPE_IN, TANKS.pipeY, CUT + 9]], { dashed: true });
    dl.material = dm;
    dl.computeLineDistances();
    dm.userData.phase = 0;
    dm.depthTest = false;
    dl.renderOrder = 60;
    cap.add(dl);
    // the cut's outline: an ink line on the plating's edge
    const ol = fatLine([...outline, outline[0]].map(([x, y]) => [x, y, CUT + 10]), { color: BRAND.ink, width: 2, opacity: 0.7 });
    ol.material.depthTest = false;
    ol.renderOrder = 61;
    cap.add(ol);
  }

  root.add(hull, belt, tanksPort, tanksStar, stem, straight, deckhouse, props, arrow, xray, cap);
  const parts = { hull, belt, tanksPort, tanksStar, stem, straight, deckhouse, props };
  const A = {
    belt: anchor(beltPort, -sideX(0), 0, -1800),
    tankPort: anchor(tanksPort, -TX, TY, TANKS.fore),
    tankStar: anchor(tanksStar, TX, TY, TANKS.fore),
    stem: anchor(stem, 0, 0, STEM.water),
    push: anchor(arrow, 0, 0, 0),
    props: anchor(props, 0, PROPS.y, PROPS.z),
    bridge: anchor(deckhouse, 0, DECKHOUSE.bridge, BR.z0 + 500),
  };

  const hueTmp = new THREE.Color();
  const VEILLE = new THREE.Color(BRAND.veille);
  const SIGNAL = new THREE.Color(BRAND.signal);
  const beltEm = new THREE.Color(BRAND.veille);
  const stemEm = new THREE.Color(BRAND.veille);

  return {
    root, parts, A,
    update(S, time, onBench) {
      /* the exploded view (bench only): the tanks stay where they sit, the hull lifts off them, the belt lifts
         off the hull and opens to both sides, the superstructure goes up, the stem goes forward */
      const k = onBench ? S.explode : 0;
      const eHull = smooth(0, 0.6, k);
      const eBelt = smooth(0.15, 0.85, k);
      const eHouse = smooth(0.1, 0.8, k);
      const eStem = smooth(0.3, 1, k);
      const lift = 2000 * eHull;
      hull.position.y = lift;
      props.position.y = lift;
      belt.position.y = lift + 1500 * eBelt;
      beltPort.position.x = -650 * eBelt;
      beltStar.position.x = 650 * eBelt;
      beltPortAft.position.x = -650 * eBelt;
      beltStarAft.position.x = 650 * eBelt;
      deckhouse.position.y = lift + 2500 * eHouse;
      stem.position.set(0, lift, -2200 * eStem);
      straight.position.copy(stem.position);
      xray.position.y = lift;
      arrow.position.set(PUSH.at[0], PUSH.at[1] + lift, PUSH.at[2] - 2200 * eStem);

      /* the cutaway (`section`): the aft half slides astern and fades, the cap shows */
      const sec = S.section;
      const slide = 3200 * smooth(0, 1, sec);
      const aftA = 1 - smooth(0.25, 0.85, sec);
      hullAft.position.z = slide;
      beltAft.position.z = slide;
      houseAft.position.z = slide;
      props.position.z = slide;
      cap.visible = sec > 0.002;

      /* the X-ray (bench, while the tanks are named and the ship is assembled) */
      const xr = onBench ? S.litTanks * (1 - smooth(0, 0.4, S.explode)) : 0;
      const solidA = 1 - xr;
      xray.visible = xr > 0.01;
      xrayMat.uniforms.uAmount.value = xr;
      xrayLines.opacity = 0.5 * xr;

      setPartOpacity(hull, solidA);
      setPartOpacity(hullAft, solidA * aftA);
      setPartOpacity(belt, solidA);
      setPartOpacity(beltAft, solidA * aftA);
      setPartOpacity(houseAft, aftA);
      setPartOpacity(props, aftA);
      setPartOpacity(stem, solidA * (1 - S.straight));
      setPartOpacity(straight, S.straight);

      /* the tanks: seen on the bench only (in the ice the cap draws them) */
      const tankA = onBench ? 1 - smooth(0, 0.3, sec) : 0;
      setPartOpacity(tanksPort, tankA);
      setPartOpacity(tanksStar, tankA);
      const th = -S.heel * DEG; // the roll world.js gives the ship (roll.rotation.z)
      const sn = Math.sin(th);
      const cs = Math.cos(th);
      const fillPort = 0.1 + 0.8 * clamp01((1 - S.tanks) / 2);
      const fillStar = 0.1 + 0.8 * clamp01((1 + S.tanks) / 2);
      const yP = TANKS.bottom + 22 + fillPort * (TH - 44);
      const yS = TANKS.bottom + 22 + fillStar * (TH - 44);
      level.port.level.value = -TX * sn + yP * cs;
      level.star.level.value = TX * sn + yS * cs;
      const wk = 0.7 + 0.3 * S.litTanks;
      setGlow(waterPort, wk);
      setGlow(waterStar, wk);
      // the flow in the pipes: `pump` > 0 runs port → starboard, < 0 back; dashes at ≈ 3 m/s (≤ 1/7 period a frame)
      const p = S.pump;
      const dir = p >= 0 ? 1 : -1;
      const off = -dir * time * 300;
      const da = clamp01(Math.abs(p));
      for (let i = 0; i < dashMats.length; i++) {
        const m = dashMats[i];
        m.dashOffset = off + m.userData.phase;
        m.opacity = da;
        m.visible = da > 0.01;
      }

      /* the lit pieces: a light where the voice points */
      const lb = S.litBelt;
      setGlow(beltLitMat, 1.7 * lb);
      setGlow(beltLitAftMat, 1.7 * lb);
      beltMat.emissive.setRGB(BELT_EM.r + beltEm.r * 0.07 * lb, BELT_EM.g + beltEm.g * 0.07 * lb, BELT_EM.b + beltEm.b * 0.07 * lb);
      beltAftMat.emissive.copy(beltMat.emissive);
      const ls = S.litStem;
      setGlow(stemLitMat, 1.8 * ls);
      setGlow(contactMat, 1.6 * ls);
      stemMat.emissive.setRGB(STEM_EM.r + stemEm.r * 0.05 * ls, STEM_EM.g + stemEm.g * 0.05 * ls, STEM_EM.b + stemEm.b * 0.05 * ls);

      /* the weight: down (veille), or forward against the ice with the straight stem (signal) */
      const pu = S.push;
      arrow.visible = pu > 0.002;
      arrow.scale.setScalar(Math.max(0.001, pu));
      arrowTurn.rotation.x = S.straight * Math.PI / 2;
      hueTmp.copy(VEILLE).lerp(SIGNAL, S.straight);
      setGlow(arrowMat, 1.7, hueTmp);

      /* the propellers: blades while slow, a fading disc past half power */
      const pr = S.prop;
      // one steady speed (a speed that followed `prop` would jump the blades whenever it changed): still at 0
      const ang = pr > 0.02 ? time * 2 * Math.PI * 0.8 : 0;
      spinners[0].rotation.z = ang;
      spinners[1].rotation.z = -ang;
      const disc = smooth(0.45, 0.8, pr);
      setPartOpacity(blades, aftA * (1 - disc));
      setPartOpacity(discs, aftA * disc);
    },
  };
}
