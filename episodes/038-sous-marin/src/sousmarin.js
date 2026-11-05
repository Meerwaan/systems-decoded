// DOSSIER 038 — Sous-marin : THE BOAT (a Los Angeles class, true scale) and its emergency blow system.
//
//   buildSub() → { root, A, parts, update(P, time, px) }
//   root   the boat's frame (plan.js): origin on the hull's axis at mid-length, bow toward −x, port +z. world.js adds
//          it to the scene and turns it by `pitch`; it never moves.
//   A      anchors (Object3D): bow, sail, bank, valve, cmd, chief (the chief of the watch's head), tankF (the forward
//          port tank: the heart), tankFs, tankA, tankAs, cube, tears[3], centre, weight (the arrow's top), lift (its bottom)
//   parts  { hull, sail, phull, sonar, room, crew, tanksF, tanksA, bank, valves, pipes, cmd, arrows, bubbles }
//   update(P, time, px)  sixteen times a frame, no allocation (docs/038-decors.md: the table of numbers).
//
// What surrounds the system is X-ray glass (the light hull, the sail, the fins, the screw, the sonar sphere, the
// pressure hull, the control room, the crew), held by its lip and by its frames (rings every 4.5 m). The system is
// SOLID, three greys: the four ballast tanks (the two on the camera side open in a window: dark water, green air),
// the bank of six bottles, the manifold and its two valves, the two pipes along the keel, the blow command on its
// panel. The air is veille; the threat (the crushed bow's folds, the tears, the arrows of the sea) is signal.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, edgesOf, solid, glow, setGlow, lineMat, fatLine, makePart, addMesh, setPartOpacity, box, cyl, mergeGeometries } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { rng } from "@kit/rng.js";
import { SUB, SAIL, FINS, PHULL, SONAR, MBT, BANK, VALVE, PIPE, ROOM, CMD, CREW, PRESS, WEIGHT, LIFT, CUBE } from "./plan.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const sstep = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const mix = (a, b, u) => a + (b - a) * u;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const BLACK = new THREE.Color(0);

/** The hull's radius at x (boat frame): a blunt bow (the sonar dome), a cylinder, a tail cone to the shaft. */
export function hullRadius(x) {
  const s = x - SUB.bow; // 0 at the bow
  if (s < 0 || x > SUB.stern) return 0;
  if (s < SUB.nose) return SUB.r * Math.sqrt(Math.max(0, 1 - ((SUB.nose - s) / SUB.nose) ** 2));
  const t0 = SUB.stern - 200 - SUB.tail;
  if (x <= t0) return SUB.r;
  const u = Math.min(1, (x - t0) / SUB.tail);
  return SUB.hub + (SUB.r - SUB.hub) * (1 - u * u * (3 - 2 * u)) ** 0.8;
}

/* ─────────────────────────────── skins: a grid of rows (stations) × columns (angle around x) ─────────────────────────────── */

/** Rows of points → a mesh. `wrap`: each row closes on itself. `skip(i, j)`: leave that cell open (a window). */
function skin(rows, { wrap = false, skip = null } = {}) {
  const n = rows[0].length;
  const pos = new Float32Array(rows.length * n * 3);
  rows.forEach((row, i) => row.forEach((p, j) => pos.set(p, (i * n + j) * 3)));
  const index = [];
  for (let i = 0; i < rows.length - 1; i++) {
    for (let j = 0; j < (wrap ? n : n - 1); j++) {
      if (skip && skip(i, j)) continue;
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
/** A point at angle `a` around the x axis: a = 0 port (+z), 90° up, −90° down. */
const around = (x, r, a, side = 1) => [x, r * Math.sin(a), side * r * Math.cos(a)];
/** Smooth normals again after the positions moved — no allocation (the crushed bow). */
function renormal(geo) {
  const p = geo.attributes.position.array;
  const nAttr = geo.attributes.normal;
  const nm = nAttr.array;
  const idx = geo.index.array;
  nm.fill(0);
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
    const vx = p[c] - p[a], vy = p[c + 1] - p[a + 1], vz = p[c + 2] - p[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    nm[a] += nx; nm[a + 1] += ny; nm[a + 2] += nz;
    nm[b] += nx; nm[b + 1] += ny; nm[b + 2] += nz;
    nm[c] += nx; nm[c + 1] += ny; nm[c + 2] += nz;
  }
  for (let k = 0; k < nm.length; k += 3) {
    const l = Math.hypot(nm[k], nm[k + 1], nm[k + 2]) || 1;
    nm[k] /= l;
    nm[k + 1] /= l;
    nm[k + 2] /= l;
  }
  nAttr.needsUpdate = true;
  geo.attributes.position.needsUpdate = true;
}

/** A unit circle in the yz plane (a frame of the hull), drawn in screen pixels. */
const CIRCLE = (() => {
  const g = new LineGeometry();
  const pts = [];
  for (let i = 0; i <= 72; i++) pts.push(0, Math.sin((i / 72) * TAU), Math.cos((i / 72) * TAU));
  g.setPositions(pts);
  return g;
})();
const SEGMENT = (() => {
  const g = new LineGeometry();
  g.setPositions([0, 0, 0, 1, 0, 0]);
  return g;
})();
const line2 = (geometry, mat, order = 3) => {
  const l = new Line2(geometry, mat);
  l.renderOrder = order;
  return l;
};

/** Discard what is above (side +1) or below (side −1) a level, in the mesh's own frame: the water, the air. */
function cutAt(mat, level, side) {
  mat.userData.finish = false;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uLevel = level;
    shader.uniforms.uSide = { value: side };
    shader.vertexShader = "varying float vCutY;\n" + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n  vCutY = position.y;");
    shader.fragmentShader = "uniform float uLevel; uniform float uSide; varying float vCutY;\n" + shader.fragmentShader.replace("void main() {", "void main() {\n  if ((vCutY - uLevel) * uSide > 0.0) discard;");
  };
  mat.customProgramCacheKey = () => "sd-cut";
  return mat;
}

/** The air running in a pipe: a sleeve over it, wide dashes in centimetres running from the valve, a bright head. */
function flowMat(len) {
  return new THREE.ShaderMaterial({
    uniforms: { uFront: { value: 0 }, uLen: { value: len }, uPhase: { value: 0 }, uK: { value: 1.25 }, uColor: { value: VEILLE.clone() } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uFront, uLen, uPhase, uK; uniform vec3 uColor; varying vec2 vUv;
      void main() {
        if (vUv.x > uFront) discard;
        float s = vUv.x * uLen;
        float d = fract((s - uPhase) / 90.0);
        float dash = smoothstep(0.0, 0.08, d) * (1.0 - smoothstep(0.52, 0.6, d));
        float head = smoothstep(uFront * uLen - 160.0, uFront * uLen, s);
        gl_FragColor = vec4(uColor * uK * (0.3 + 0.7 * dash + 0.9 * head), 1.0);
      }`,
  });
}
function tubeAlong(points, r) {
  const path = new THREE.CurvePath();
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const a = new THREE.Vector3(...points[i]);
    const b = new THREE.Vector3(...points[i + 1]);
    path.add(new THREE.LineCurve3(a, b));
    len += a.distanceTo(b);
  }
  return { geo: new THREE.TubeGeometry(path, Math.max(8, Math.ceil(len / 25)), r, 10, false), len };
}

/** A bubble: bright at its lip, clear inside — a ring of light, never a flat disc. Instanced. */
function bubbleMat() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uK: { value: 0 }, uColor: { value: INK.clone() } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uK; uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main() {
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        gl_FragColor = vec4(uColor * uK * (0.16 + 1.1 * pow(g, 2.2)), 1.0);
      }`,
  });
}

/* ─────────────────────────────────────────────────── the boat ─────────────────────────────────────────────────── */

export function buildSub() {
  const root = new THREE.Group();
  const anchor = (parent, x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };
  const R = SUB.r;
  const NA = 64; // columns around the hull

  /* ── the light hull: glass, one shell ── */
  const hullGlass = glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.6, edge: 0.55, spec: 0.3, through: 0.3 });
  const bowGlass = glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.6, edge: 0.55, spec: 0.3, through: 0.3 });
  const sailGlass = glass(BRAND.ink, { base: 0, rim: 0.32, power: 2.6, edge: 0.6, spec: 0.3, through: 0.3 });
  const hull = new THREE.Group();
  hull.name = "hull";
  root.add(hull);
  const ringRow = (x, r, a0 = 0, a1 = TAU, n = NA, wrap = true) => {
    const row = [];
    for (let j = 0; j < (wrap ? n : n + 1); j++) row.push(around(x, r, a0 + ((a1 - a0) * j) / n));
    return row;
  };

  // the bow: 11 m from its tip, dense near the tip — the part that crushes
  const BOW_LEN = 1100;
  const bowRows = [];
  const BOWN = 46;
  for (let i = 0; i < BOWN; i++) {
    const s = BOW_LEN * (i / (BOWN - 1)) ** 1.5;
    bowRows.push(ringRow(SUB.bow + s, Math.max(0.5, hullRadius(SUB.bow + s))));
  }
  const bowGeo = skin(bowRows, { wrap: true });
  const bowBase = Float32Array.from(bowGeo.attributes.position.array);
  const bowG = new THREE.Group(); // what moves with the bow in the exploded view
  hull.add(bowG);
  const bowMesh = new THREE.Mesh(bowGeo, bowGlass);
  bowG.add(bowMesh);
  // the seeded dents of the crushed skin: per vertex, a fixed bump
  const dent = new Float32Array(bowBase.length / 3);
  {
    const rand = rng(38);
    const lumps = Array.from({ length: 9 }, () => [rand() * BOW_LEN * 0.8, rand() * TAU, 90 + rand() * 160, (rand() - 0.4) * 0.16]);
    for (let v = 0; v < dent.length; v++) {
      const x = bowBase[v * 3] - SUB.bow;
      const a = Math.atan2(bowBase[v * 3 + 1], bowBase[v * 3 + 2]);
      let d = 0;
      for (const [s0, a0, w, k] of lumps) {
        const da = Math.atan2(Math.sin(a - a0), Math.cos(a - a0)) * R;
        d += k * Math.exp(-((x - s0) ** 2 + da * da) / (w * w));
      }
      dent[v] = d;
    }
  }
  const CRUSH_LEN = 800; // « les 6–8 premiers mètres »
  let crushed = -1;
  const crushBow = (k) => {
    const p = bowGeo.attributes.position.array;
    for (let v = 0; v < dent.length; v++) {
      const i3 = v * 3;
      const x = bowBase[i3], y0 = bowBase[i3 + 1], z0 = bowBase[i3 + 2];
      const s = x - SUB.bow;
      const r0 = Math.hypot(y0, z0);
      const w = (1 - sstep(CRUSH_LEN - 150, CRUSH_LEN + 250, s)) * k;
      if (w <= 0 || r0 < 0.6) {
        p[i3 + 1] = y0;
        p[i3 + 2] = z0;
        if (r0 < 0.6) p[i3] = x;
        continue;
      }
      const a = Math.atan2(y0, z0);
      // flattened against the rock (a blunt face), folded like a can (an accordion whose folds wander around)
      const flat = R * (0.74 + 0.26 * sstep(0, CRUSH_LEN, s)) * Math.min(1, 0.25 + s / 60);
      const fold = 0.085 * Math.sin((TAU * s) / 115 + 0.9 * Math.sin(2 * a + s / 230)) * Math.min(1, s / 80);
      const r = mix(r0, flat * (1 + fold + dent[v]), w);
      const droop = -45 * w * (1 - s / (CRUSH_LEN + 250)); // the bow bent down a little
      p[i3] = x;
      p[i3 + 1] = r * Math.sin(a) + droop;
      p[i3 + 2] = r * Math.cos(a);
    }
    renormal(bowGeo);
  };

  // the forward barrel in three tiles (the exploded view lifts the two upper ones), then the rest of the hull
  const X_FWD = SUB.bow + BOW_LEN;
  const X_MID = -1800;
  const tile = (a0, a1, n) => {
    const rows = [X_FWD, (X_FWD + X_MID) / 2, X_MID].map((x) => ringRow(x, R, a0, a1, n, false));
    return new THREE.Mesh(skin(rows), hullGlass);
  };
  const fwdPU = new THREE.Group(), fwdSU = new THREE.Group();
  fwdPU.add(tile(0, Math.PI / 2, 16));
  fwdSU.add(tile(Math.PI / 2, Math.PI, 16));
  const fwdLow = tile(Math.PI, TAU, 32);
  hull.add(fwdPU, fwdSU, fwdLow);
  const mainRows = [];
  const xs = [X_MID, 0, SUB.stern - 200 - SUB.tail];
  for (let i = 1; i <= 40; i++) xs.push(SUB.stern - 200 - SUB.tail + (SUB.tail * i) / 40);
  for (const x of xs) mainRows.push(ringRow(x, hullRadius(x)));
  // the shaft's end: a small cap
  mainRows.push(ringRow(SUB.stern - 190, SUB.hub * 0.6), ringRow(SUB.stern - 180, 2));
  const mainMesh = new THREE.Mesh(skin(mainRows, { wrap: true }), hullGlass);
  hull.add(mainMesh);

  // the fins: a cross of plates at the tail (two planes, the rudder up and down)
  const finMeshes = [];
  const hullLines = []; // every line material of the light hull: they fade with it
  for (let q = 0; q < 4; q++) {
    const r0 = hullRadius(FINS.x) - 10;
    const span = FINS.r - r0;
    const shape = new THREE.Shape();
    shape.moveTo(-FINS.chord / 2, 0);
    shape.lineTo(FINS.chord / 2, 0);
    shape.lineTo(FINS.chord / 2 - 40, span);
    shape.lineTo(-FINS.chord / 2 + 150, span);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 26, bevelEnabled: false });
    g.translate(0, r0, -13);
    g.rotateX((q * Math.PI) / 2);
    g.translate(FINS.x, 0, 0);
    const m = new THREE.Mesh(g, hullGlass);
    const e = edgesOf(g, { color: BRAND.ink, width: 1.8, opacity: 0.4 });
    hullLines.push(e.material);
    m.add(e);
    finMeshes.push(m);
  }
  hull.add(...finMeshes);

  // the screw: a hub and seven blades (glass, they turn with `speed`)
  const screw = new THREE.Group();
  screw.position.x = SUB.screw.x;
  const bladeGeo = new THREE.BoxGeometry(70, SUB.screw.r - 90, 10);
  bladeGeo.translate(0, 90 + (SUB.screw.r - 90) / 2, 0);
  const blades = [];
  for (let b = 0; b < SUB.screw.blades; b++) {
    const m = new THREE.Mesh(bladeGeo, hullGlass);
    const holder = new THREE.Group();
    holder.rotation.x = (b / SUB.screw.blades) * TAU;
    m.rotation.y = 0.55; // their pitch
    holder.add(m);
    screw.add(holder);
    blades.push(m);
  }
  hull.add(screw);

  // the sail and its planes
  const sail = new THREE.Group();
  sail.name = "sail";
  const sailRows = [];
  const SAILN = 40;
  const sailSection = (y, k) => {
    const row = [];
    for (let j = 0; j < SAILN; j++) {
      const f = (j / SAILN) * TAU;
      const ux = Math.cos(f); // −1 the leading edge (toward the bow), +1 the trailing edge
      const half = (SAIL.w / 2) * Math.sin(f) * (ux < 0 ? 1 : 1 - 0.55 * ux * ux) * k;
      row.push([SAIL.x + (SAIL.len / 2) * ux * k, y, half]);
    }
    return row;
  };
  const yTop = R - 20 + SAIL.h;
  for (const [y, k] of [[R - 90, 1], [R + 100, 1], [yTop - 40, 1], [yTop - 10, 0.96], [yTop, 0.86], [yTop + 2, 0.02]]) sailRows.push(sailSection(y, k));
  const sailMesh = new THREE.Mesh(skin(sailRows, { wrap: true }), sailGlass);
  sail.add(sailMesh);
  const sailEdge = fatLine(sailRows[3].concat([sailRows[3][0]]), { color: BRAND.ink, width: 1.8, opacity: 0.55 });
  sail.add(sailEdge);
  const planeGeo = new THREE.BoxGeometry(SAIL.planes.chord, 20, SAIL.planes.span);
  const planes = [1, -1].map((s) => {
    const m = new THREE.Mesh(planeGeo, sailGlass);
    m.position.set(SAIL.planes.x, SAIL.planes.y, s * (SAIL.w / 2 + SAIL.planes.span / 2 - 10));
    const e = edgesOf(planeGeo, { color: BRAND.ink, width: 1.8, opacity: 0.45 });
    m.add(e);
    sail.add(m);
    return { m, e };
  });
  hull.add(sail);
  const sailLineMats = [sailEdge.material, ...planes.map((p) => p.e.material)];
  asShell([bowMesh, fwdPU.children[0], fwdSU.children[0], fwdLow, mainMesh, ...finMeshes, ...blades, sailMesh, ...planes.map((p) => p.m)], 20);

  // the frames: rings every 4.5 m (what says the volume and the scale from 200 m), and the bow's folds (signal, born with `crush`)
  const ringMat = lineMat(BRAND.ink, 1.8, { opacity: 0.3 });
  hullLines.push(ringMat);
  const rings = [];
  const fwdRings = []; // the forward barrel's rings: they leave in the exploded view
  for (let x = SUB.bow + 1300; x < SUB.stern - 300; x += 450) {
    const l = line2(CIRCLE, ringMat);
    l.position.x = x;
    l.scale.setScalar(hullRadius(x) + 3);
    (x < X_MID ? fwdRings : rings).push(l);
    hull.add(l);
  }
  const noseRingMat = lineMat(BRAND.ink, 1.8, { opacity: 0.3 }); // the bow's two frames, intact
  const noseRings = [350, 820].map((s) => {
    const l = line2(CIRCLE, noseRingMat);
    l.position.x = SUB.bow + s;
    l.scale.setScalar(hullRadius(SUB.bow + s) + 3);
    bowG.add(l);
    return l;
  });
  const foldMat = lineMat(BRAND.signal, 2, { opacity: 0, hdr: 1.1 });
  const folds = [];
  {
    const rand = rng(83);
    for (const s of [60, 150, 205, 330, 420, 560, 690]) {
      const l = line2(CIRCLE, foldMat);
      l.userData = { s, ry: (rand() - 0.5) * 0.7, rz: (rand() - 0.5) * 0.8, k: 0.9 + 0.2 * rand() };
      l.position.x = SUB.bow + s;
      l.visible = false;
      bowG.add(l);
      folds.push(l);
    }
  }
  // four lines along the hull (crest, keel, the two flanks), from behind the bow to the tail
  const longMat = lineMat(BRAND.ink, 1.8, { opacity: 0.22 });
  hullLines.push(longMat);
  for (const a of [Math.PI / 2, -Math.PI / 2, 0, Math.PI]) {
    const pts = [];
    for (let x = SUB.bow + 1250; x <= SUB.stern - 220; x += 160) pts.push(around(x, hullRadius(x) + 2, a));
    const l = fatLine(pts, { color: BRAND.ink, width: 1.8 });
    l.material = longMat;
    hull.add(l);
  }

  // the dome's meridians: they say « a nose » seen head-on; the folds take over when it crushes
  const meridianMat = lineMat(BRAND.ink, 1.8, { opacity: 0.26 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.2;
    const pts = [];
    for (let k = 0; k <= 24; k++) {
      const s = 1300 * (k / 24) ** 1.6;
      pts.push(around(SUB.bow + s, hullRadius(SUB.bow + s) + 2, a));
    }
    const l = fatLine(pts, { width: 1.8 });
    l.material = meridianMat;
    bowG.add(l);
  }

  /* ── the sonar sphere in the dome (glass): it splits when the bow crushes ── */
  const sonarGlass = glass(BRAND.ink, { base: 0, rim: 0.26, power: 2.4, edge: 0.4, through: 0.2 });
  const sonar = new THREE.Group();
  sonar.name = "sonar";
  sonar.position.x = SONAR.x;
  const sonarUp = new THREE.Mesh(new THREE.SphereGeometry(SONAR.r, 36, 12, 0, TAU, 0, Math.PI / 2), sonarGlass);
  const sonarDn = new THREE.Mesh(new THREE.SphereGeometry(SONAR.r, 36, 12, 0, TAU, Math.PI / 2, Math.PI / 2), sonarGlass);
  sonar.add(sonarUp, sonarDn);
  asShell([sonarUp, sonarDn], 16);
  const crackMat = lineMat(BRAND.signal, 2.2, { opacity: 0, hdr: 1.8 });
  {
    const rand = rng(5);
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * TAU;
      const j = i % 40 === 0 ? 0 : (rand() - 0.5) * 70;
      pts.push([Math.cos(a) * SONAR.r, j, Math.sin(a) * SONAR.r]);
    }
    const crack = fatLine(pts, { color: BRAND.signal, width: 2.2 });
    crack.material = crackMat;
    sonar.add(crack);
  }
  bowG.add(sonar);

  /* ── the pressure hull (fainter glass), its domed ends ── */
  const phGlass = glass(BRAND.ink, { base: 0, rim: 0.2, power: 2.4, edge: 0.32, through: 0.22 });
  const phRows = [];
  const phR = (x) => {
    if (x < PHULL.from + PHULL.dome) return PHULL.r * Math.sqrt(Math.max(0, 1 - ((PHULL.from + PHULL.dome - x) / PHULL.dome) ** 2));
    if (x > PHULL.to - PHULL.dome) return PHULL.r * Math.sqrt(Math.max(0, 1 - ((x - PHULL.to + PHULL.dome) / PHULL.dome) ** 2));
    return PHULL.r;
  };
  for (let i = 0; i <= 12; i++) phRows.push(ringRow(PHULL.from + (PHULL.dome * i) / 12, Math.max(1, phR(PHULL.from + (PHULL.dome * i) / 12))));
  for (let i = 0; i <= 12; i++) phRows.push(ringRow(PHULL.to - PHULL.dome + (PHULL.dome * i) / 12, Math.max(1, phR(PHULL.to - PHULL.dome + (PHULL.dome * i) / 12))));
  const phull = new THREE.Mesh(skin(phRows, { wrap: true }), phGlass);
  phull.name = "phull";
  asShell([phull], 17);
  root.add(phull);
  const phRingMat = lineMat(BRAND.ink, 1.8, { opacity: 0.18 });
  for (const x of [PHULL.from + PHULL.dome, -2200, -600, 1000, PHULL.to - PHULL.dome]) {
    const l = line2(CIRCLE, phRingMat);
    l.position.x = x;
    l.scale.setScalar(PHULL.r + 2);
    phull.add(l);
  }

  /* ── the control room: its deck, its consoles (glass), the crew of glass ── */
  const roomGlass = glass(BRAND.ink, { base: 0.004, rim: 0.26, power: 2.2, edge: 0.4 });
  const room = new THREE.Group();
  room.name = "room";
  const roomLineMat = lineMat(BRAND.ink, 1.8, { opacity: 0.3 });
  const roomBox = (w, h, d, x, y, z) => {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, roomGlass);
    m.position.set(x, y, z);
    const e = edgesOf(g, { width: 1.8 });
    e.material = roomLineMat;
    m.add(e);
    room.add(m);
    return m;
  };
  const deckHalf = Math.sqrt(PHULL.r ** 2 - ROOM.deck ** 2) - 25;
  // the deck: an outline and a few boards in lines (a flat pane of glass seen grazing is a white slab)
  {
    const x0 = ROOM.x0, x1 = ROOM.x1, y = ROOM.deck, z = deckHalf;
    const pts = [[x0, y, -z], [x1, y, -z], [x1, y, z], [x0, y, z], [x0, y, -z]];
    const deck = fatLine(pts, { width: 1.8 });
    deck.material = roomLineMat;
    room.add(deck);
    for (let x = x0 + 200; x < x1; x += 200) {
      const b = fatLine([[x, y, -z], [x, y, z]], { width: 1.8 });
      b.material = roomLineMat;
      room.add(b);
    }
  }
  // the ballast control panel's console (the command sits in it, solid), the two planesmen's consoles
  roomBox(520, 175, 60, CMD.at[0], ROOM.deck + 87, CMD.at[2] - 50);
  roomBox(60, 140, 150, -3080, ROOM.deck + 70, -120);
  roomBox(60, 140, 150, -3080, ROOM.deck + 70, 120);
  // the seats
  for (const c of CREW) if (c.seated) roomBox(44, 46, 44, c.at[0] + (c.face === 0 ? 12 : 0), ROOM.deck + 23, c.at[2] + (c.face === 90 ? 12 : 0));
  asShell(room.children.filter((m) => m.isMesh), 14);
  root.add(room);

  const crew = new THREE.Group();
  crew.name = "crew";
  const crewMen = CREW.map((c, i) => {
    const fig = makeFigure({ shell: true, glassK: i === 0 ? 0.9 : 0.75, order: 12, through: 0.1 });
    fig.ghost(true);
    const throwG = new THREE.Group(); // at the feet: what the shock tilts toward the bow
    throwG.position.set(c.at[0], c.at[1], c.at[2]);
    const faceG = new THREE.Group();
    faceG.rotation.y = -(90 + c.face) * DEG;
    faceG.add(fig.group);
    throwG.add(faceG);
    crew.add(throwG);
    if (c.seated) {
      fig.group.position.y = -44;
      fig.leg("L", new THREE.Vector3(10, 52, 44));
      fig.leg("R", new THREE.Vector3(-10, 52, 44));
    }
    return { fig, throwG, c, x0: c.at[0], rest: { L: new THREE.Vector3(c.seated ? 17 : 20.5, c.seated ? 118 : 92, c.seated ? 40 : 3), R: new THREE.Vector3(c.seated ? -17 : -20.5, c.seated ? 118 : 92, c.seated ? 40 : 3) } };
  });
  const handTo = new THREE.Vector3();
  const caught = { L: new THREE.Vector3(24, 128, 50), R: new THREE.Vector3(-24, 128, 50) };
  let jolted = -1;
  const poseCrew = (j) => {
    for (const m of crewMen) {
      for (const s of ["L", "R"]) m.fig.reach(s, handTo.copy(m.rest[s]).lerp(caught[s], m.c.seated ? 0.5 * j : j));
      m.fig.lean(m.c.seated ? 14 * j : 22 * j, 0, 0);
    }
  };
  poseCrew(0);
  root.add(crew);

  /* ── THE SYSTEM, SOLID ── */
  const allSolids = []; // every part of the system: `heart` dims them around the forward port tank
  const emissive = (mats, k) => {
    for (const m of mats) if (m.emissive) m.emissive.copy(VEILLE).multiplyScalar(k);
  };

  // the four ballast tanks: half-shells between the two hulls; the two on the camera side (port) open in a window
  const tankPart = (m, side, name, withWindow) => {
    const part = makePart(name);
    const outer = solid(0x959ca2, { rough: 0.5, metal: 0.25, double: true });
    const inner = solid(0x60676d, { rough: 0.6, metal: 0.2, double: true });
    const cap = solid(0xbfc4c8, { rough: 0.45, metal: 0.25, double: true });
    const phis = [];
    for (let j = 0; j <= 24; j++) phis.push(-Math.PI / 2 + (Math.PI * j) / 24);
    const wx0 = m.x0 + 280, wx1 = m.x1 - 70;
    const xsT = withWindow ? [m.x0, wx0, wx1, m.x1] : [m.x0, m.x1];
    const shellRows = (r) => xsT.map((x) => phis.map((f) => around(x, r, f, side)));
    // the window: φ from −55° to +70° (columns 5 → 20 of 24), between wx0 and wx1 (row 1 → 2)
    const skipWin = withWindow ? (i, j) => i === 1 && j >= 5 && j < 20 : null;
    addMesh(part, skin(shellRows(m.rOut), { skip: skipWin }), outer, { edgeOpacity: 0.75, threshold: 40 });
    addMesh(part, skin(shellRows(m.rIn)), inner, { edges: false });
    for (const x of [m.x0, m.x1]) {
      const g = new THREE.RingGeometry(m.rIn, m.rOut, 24, 1, -Math.PI / 2, Math.PI);
      g.rotateY(-Math.PI / 2);
      g.scale(1, 1, side);
      g.translate(x, 0, 0);
      addMesh(part, g, cap, { edgeOpacity: 0.6 });
    }
    for (const y of [1, -1]) {
      const g = new THREE.PlaneGeometry(m.x1 - m.x0, m.rOut - m.rIn);
      g.translate((m.x0 + m.x1) / 2, (y * (m.rIn + m.rOut)) / 2, side * 1);
      addMesh(part, g, cap, { edges: false });
    }
    const T = { part, mats: [outer, inner, cap], m, side, win: null };
    if (withWindow) {
      // what the window shows: dark water below the level, the green air above it, the free surface in a veille line
      const level = { value: m.rOut };
      const shape = new THREE.Shape();
      shape.absarc(0, 0, m.rOut - 8, -Math.PI / 2, Math.PI / 2, false);
      shape.absarc(0, 0, m.rIn + 8, Math.PI / 2, -Math.PI / 2, true);
      const depth = m.x1 - m.x0 - 16;
      const vol = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 24 });
      vol.rotateY(-Math.PI / 2);
      vol.translate(m.x1 - 8, 0, 0);
      const waterMat = cutAt(solid(0x0d1215, { rough: 0.3, metal: 0.1, double: true, opacity: 0.94 }), level, 1);
      const airMat = cutAt(solid(0x1f6e4f, { rough: 0.35, metal: 0, double: true }), level, -1);
      waterMat.depthWrite = false;
      waterMat.userData.depthWrite = false;
      const water = new THREE.Mesh(vol, waterMat);
      const air = new THREE.Mesh(vol, airMat);
      part.add(water, air);
      part.userData.part.mats.add(waterMat);
      const surfMat = lineMat(BRAND.veille, 2.6, { opacity: 0, hdr: 1.6 });
      const surf = line2(SEGMENT, surfMat, 4);
      surf.position.x = wx0 - 30;
      surf.scale.x = wx1 - wx0 + 60;
      part.add(surf);
      part.userData.part.mats.add(surfMat);
      T.win = { level, water, air, airMat, waterMat, surf, surfMat };
    }
    root.add(part);
    allSolids.push(part);
    return T;
  };
  const tFp = tankPart(MBT.fwd, 1, "tankFp", true);
  const tFs = tankPart(MBT.fwd, -1, "tankFs", false);
  const tAp = tankPart(MBT.aft, 1, "tankAp", true);
  const tAs = tankPart(MBT.aft, -1, "tankAs", false);
  const tanks = [tFp, tFs, tAp, tAs];

  // the tears on the forward tanks' lower front: a dark hole, a jagged signal lip (they open with `crush` and stay)
  const tearMats = [];
  const tearOut = []; // where the bubbles leave (on the outer skin), boat frame
  const tearGroups = MBT.fwd.tears.map((t, i) => {
    const side = t[2] > 0 ? 1 : -1;
    const T = side > 0 ? tFp : tFs;
    const n = new THREE.Vector3(0, t[1], t[2]).normalize();
    const g = new THREE.Group();
    g.position.set(t[0], n.y * (MBT.fwd.rOut + 5), n.z * (MBT.fwd.rOut + 5));
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    const rand = rng(200 + i);
    const pts = [];
    for (let k = 0; k < 13; k++) {
      const a = (k / 13) * TAU;
      const rr = (k % 2 ? 0.55 : 1) * (0.75 + 0.35 * rand());
      pts.push([Math.cos(a) * 85 * rr, Math.sin(a) * 42 * rr, 0]);
    }
    const holeShape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x050607, transparent: true, opacity: 1, side: THREE.DoubleSide });
    const hole = new THREE.Mesh(new THREE.ShapeGeometry(holeShape), holeMat);
    const lipMat = lineMat(BRAND.signal, 2.6, { opacity: 1, hdr: 2.0 });
    const lip = fatLine(pts.concat([pts[0]]), { color: BRAND.signal, width: 2.6 });
    lip.material = lipMat;
    g.add(hole, lip);
    g.scale.setScalar(0.001);
    g.visible = false;
    T.part.add(g);
    T.part.userData.part.mats.add(holeMat);
    tearMats.push(lipMat);
    tearOut.push({ g, T });
    return g;
  });

  // the bank of six bottles under the room, their necks, the manifold, the two valves
  const bank = makePart("bank");
  const bottleMat = solid(0x8f979c, { rough: 0.42, metal: 0.35 });
  const bottleCap = solid(0xd0d4d7, { rough: 0.38, metal: 0.35 });
  const bottleGeo = cyl(BANK.r, BANK.len - 2 * BANK.r, 3, 32);
  bottleGeo.rotateZ(Math.PI / 2);
  const domeGeo = new THREE.SphereGeometry(BANK.r, 24, 12);
  const neckX = BANK.x - BANK.len / 2 - 22;
  for (let i = 0; i < BANK.n; i++) {
    const z = (i - (BANK.n - 1) / 2) * BANK.pitch;
    addMesh(bank, bottleGeo, bottleMat, { pos: [BANK.x, BANK.y, z], edgeOpacity: 0.5 });
    addMesh(bank, domeGeo, bottleMat, { pos: [BANK.x - BANK.len / 2 + BANK.r, BANK.y, z], edges: false });
    addMesh(bank, domeGeo, bottleMat, { pos: [BANK.x + BANK.len / 2 - BANK.r, BANK.y, z], edges: false });
    const neck = cyl(9, 40, 1, 16);
    neck.rotateZ(Math.PI / 2);
    addMesh(bank, neck, bottleCap, { pos: [neckX + 4, BANK.y, z], edgeOpacity: 0.5 });
  }
  const manifoldX = neckX - 20;
  const manGeo = cyl(15, BANK.pitch * (BANK.n - 1) + 50, 2, 24);
  manGeo.rotateX(Math.PI / 2);
  addMesh(bank, manGeo, bottleCap, { pos: [manifoldX, BANK.y, 0], edgeOpacity: 0.5 });
  root.add(bank);
  allSolids.push(bank);

  const valves = makePart("valves");
  const valveMat = solid(0xc4c8cc, { rough: 0.38, metal: 0.35 });
  const handleMat = solid(0xe2ded2, { rough: 0.4, metal: 0.2 });
  const valveHandles = [];
  for (const v of [VALVE.f, VALVE.a]) {
    const vx = VALVE.x;
    const bodyGeo = box(56, 64, 56, 6);
    addMesh(valves, bodyGeo, valveMat, { pos: [vx, VALVE.y, v.z], edgeOpacity: 0.55 });
    const link = cyl(12, Math.abs(manifoldX - vx) + 10, 1, 16);
    link.rotateZ(Math.PI / 2);
    addMesh(valves, link, valveMat, { pos: [(vx + manifoldX) / 2, VALVE.y, v.z], edgeOpacity: 0.4 });
    const stem = cyl(7, 30, 1, 12);
    addMesh(valves, stem, valveMat, { pos: [vx, VALVE.y + 46, v.z], edges: false });
    const pivot = new THREE.Group();
    pivot.position.set(vx, VALVE.y + 64, v.z);
    const bar = box(110, 14, 18, 4);
    bar.translate(42, 0, 0);
    const h = new THREE.Mesh(bar, handleMat);
    const he = edgesOf(bar, { color: 0x1d2226, width: 1.8, opacity: 0.8 });
    h.add(he);
    valves.userData.part.mats.add(he.material);
    valves.userData.part.mats.add(handleMat);
    pivot.add(h);
    valves.add(pivot);
    valveHandles.push(pivot);
  }
  root.add(valves);
  allSolids.push(valves);

  // the two pipes along the keel: from each valve down, along, to a tee under the tanks of its end
  const pipes = makePart("pipes");
  const pipeMat = solid(0x30363b, { rough: 0.55, metal: 0.3 });
  const PR = 15; // drawn thicker than PIPE.r: it must read at 270 px (the picture is schematic)
  const teeF = MBT.fwd.x1 - 60, teeA = MBT.aft.x0 + 60;
  const runF = [[VALVE.x, VALVE.y, VALVE.f.z], [VALVE.x - 60, PIPE.y, VALVE.f.z], [teeF, PIPE.y, VALVE.f.z], [teeF, PIPE.y, 0]];
  const runA = [[VALVE.x, VALVE.y, VALVE.a.z], [VALVE.x - 60, PIPE.y, VALVE.a.z], [teeA, PIPE.y, VALVE.a.z], [teeA, PIPE.y, 0]];
  const pipeSolid = (pts) => tubeAlong(pts, PR).geo;
  addMesh(pipes, pipeSolid(runF), pipeMat, { edges: false });
  addMesh(pipes, pipeSolid(runA), pipeMat, { edges: false });
  // the tees: across z, they stretch when the tanks part (exploded view)
  const teeGeo = cyl(PR, 1, 0.5, 16);
  teeGeo.rotateX(Math.PI / 2);
  const tees = [teeF, teeA].map((x) => {
    const m = new THREE.Mesh(teeGeo, pipeMat);
    m.position.set(x, PIPE.y, 0);
    pipes.add(m);
    pipes.userData.part.mats.add(pipeMat);
    return m;
  });
  // the air's sleeves: the main run, then the tee's two branches
  const mkFlow = (pts) => {
    const { geo, len } = tubeAlong(pts, PR + 3.5);
    const mat = flowMat(len);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 1;
    mesh.visible = false;
    pipes.add(mesh);
    return { mesh, mat, len };
  };
  const BR = 340; // a branch's half-length, at rest (it stretches with the tee)
  const flows = {
    F: { run: mkFlow(runF), br: [mkFlow([[teeF, PIPE.y, 0], [teeF, PIPE.y, BR]]), mkFlow([[teeF, PIPE.y, 0], [teeF, PIPE.y, -BR]])] },
    A: { run: mkFlow(runA), br: [mkFlow([[teeA, PIPE.y, 0], [teeA, PIPE.y, BR]]), mkFlow([[teeA, PIPE.y, 0], [teeA, PIPE.y, -BR]])] },
  };
  root.add(pipes);
  allSolids.push(pipes);

  // the emergency blow command on its panel: a handle under a cover; its control line down to the valves
  const cmd = makePart("cmd");
  const panelMat = solid(0x454b50, { rough: 0.55, metal: 0.25 });
  const bezelMat = solid(0x9ba1a6, { rough: 0.45, metal: 0.3 });
  const coverMat = solid(0xd9d5c9, { rough: 0.4, metal: 0.15 });
  const leverMat = solid(0xe9e4d8, { rough: 0.38, metal: 0.2 });
  const [cx, cy, cz] = CMD.at;
  const face = cz + CMD.panel[2] / 2;
  addMesh(cmd, box(...CMD.panel, 5), panelMat, { pos: CMD.at, edgeOpacity: 0.6 });
  addMesh(cmd, box(78, 78, 16, 3), bezelMat, { pos: [cx, cy, face + 8], edgeOpacity: 0.6 });
  const coverPivot = new THREE.Group();
  coverPivot.position.set(cx, cy + 40, face + 20);
  const coverGeo = box(84, 82, 8, 3);
  coverGeo.translate(0, -41, 2);
  const cover = new THREE.Mesh(coverGeo, coverMat);
  const ce = edgesOf(coverGeo, { color: 0x1d2226, width: 1.8, opacity: 0.85 });
  cover.add(ce);
  coverPivot.add(cover);
  cmd.add(coverPivot);
  cmd.userData.part.mats.add(coverMat).add(ce.material);
  const leverPivot = new THREE.Group();
  leverPivot.position.set(cx, cy - 14, face + 14);
  const leverGeo = box(14, 50, 14, 4);
  leverGeo.translate(0, 25, 0);
  const grip = box(44, 14, 16, 5);
  grip.translate(0, 52, 0);
  const lever = new THREE.Mesh(mergeGeometries([leverGeo, grip]), leverMat);
  leverPivot.add(lever);
  cmd.add(leverPivot);
  cmd.userData.part.mats.add(leverMat);
  const lampMat = glow(BRAND.veille, 0);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(7, 12, 8), lampMat);
  lamp.position.set(cx + 60, cy + 48, face + 4);
  cmd.add(lamp);
  const wireMat = lineMat(BRAND.ink, 1.8, { opacity: 0.3 });
  const wire = fatLine([[cx, cy - CMD.panel[1] / 2, cz], [cx, -250, cz], [VALVE.x + 40, -250, cz], [VALVE.x + 40, -250, VALVE.f.z], [VALVE.x, VALVE.y + 40, VALVE.f.z]], { width: 1.8 });
  wire.material = wireMat;
  cmd.add(wire);
  cmd.userData.part.mats.add(wireMat);
  root.add(cmd);
  allSolids.push(cmd);

  /* ── the principle's cube: one cubic metre of water in the forward port tank, chased by the air ── */
  const cubeG = new THREE.Group();
  const cubeGeo = new THREE.BoxGeometry(CUBE.side, CUBE.side, CUBE.side);
  const cubeWaterMat = solid(0x34424a, { rough: 0.3, metal: 0.1, opacity: 0.95 });
  cubeWaterMat.userData.finish = false;
  const cubeWater = new THREE.Mesh(cubeGeo, cubeWaterMat);
  const cubeEdge = edgesOf(cubeGeo, { color: BRAND.ink, width: 3, opacity: 0 });
  cubeWater.add(cubeEdge);
  const cubeAirMat = glow(BRAND.veille, 0, { opacity: 0.85 });
  const cubeAir = new THREE.Mesh(cubeGeo, cubeAirMat);
  const cubeAirEdge = edgesOf(cubeGeo, { color: BRAND.veille, width: 3, opacity: 0 });
  cubeAir.add(cubeAirEdge);
  cubeG.position.set(...CUBE.at);
  cubeWater.renderOrder = 5;
  cubeAir.renderOrder = 6;
  cubeG.add(cubeWater, cubeAir);
  cubeG.visible = false;
  tFp.part.add(cubeG);

  /* ── the bubbles: three sheaves out of the tears, rising and widening ── */
  const PER = 40;
  const bubbleGeo = new THREE.SphereGeometry(1, 16, 10);
  const bMat = bubbleMat();
  const bubbles = new THREE.InstancedMesh(bubbleGeo, bMat, PER * 3);
  bubbles.name = "bubbles";
  bubbles.frustumCulled = false;
  bubbles.renderOrder = 6;
  bubbles.visible = false;
  root.add(bubbles);
  const seeds = new Float32Array(PER * 3 * 3);
  {
    const rand = rng(1038);
    for (let i = 0; i < seeds.length; i++) seeds[i] = rand();
  }
  const mtx = new THREE.Matrix4();
  const qI = new THREE.Quaternion();
  const vP = new THREE.Vector3();
  const vS = new THREE.Vector3();
  const tearPos = new THREE.Vector3();

  /* ── the water running past the hull (`speed`): short streaks along it ── */
  const streaks = [];
  {
    const rand = rng(77);
    for (let i = 0; i < 18; i++) {
      const mat = lineMat(BRAND.ink, 1.8, { opacity: 0 });
      const l = line2(SEGMENT, mat);
      const a = rand() * TAU;
      const rr = R + 40 + rand() * 160;
      l.position.set(0, Math.sin(a) * rr, Math.cos(a) * rr);
      l.userData = { ph: rand(), len: 380 + rand() * 520, rate: 0.55 + rand() * 0.3 };
      streaks.push({ l, mat });
      root.add(l);
    }
  }

  /* ── the arrows: the pressure's rings (signal), the weight (signal, down), the buoyancy (veille, up) ── */
  const arrows = new THREE.Group();
  arrows.name = "arrows";
  root.add(arrows);
  const pressMat = glow(BRAND.signal, 1.5, { opacity: 0 });
  const pressRings = PRESS.stations.map((x) => {
    const r = hullRadius(x);
    const parts = [];
    for (let i = 0; i < PRESS.n; i++) {
      const a = ((i + 0.5) / PRESS.n) * TAU;
      const m = new THREE.Matrix4().makeRotationX(a);
      const head = new THREE.ConeGeometry(44, 100, 16);
      head.rotateZ(Math.PI);
      head.translate(0, r + PRESS.off + 50, 0);
      const shaft = new THREE.CylinderGeometry(16, 16, PRESS.len - 100, 10);
      shaft.translate(0, r + PRESS.off + 100 + (PRESS.len - 100) / 2, 0);
      parts.push(head.applyMatrix4(m), shaft.applyMatrix4(m));
    }
    const mesh = new THREE.Mesh(mergeGeometries(parts), pressMat);
    mesh.position.x = x;
    mesh.userData.r = r + PRESS.off;
    mesh.visible = false;
    arrows.add(mesh);
    return mesh;
  });
  const bigArrow = (color, down) => {
    const mat = glow(color, 1.5, { opacity: 0 });
    const g = new THREE.Group();
    const shaftGeo = new THREE.CylinderGeometry(85, 85, 1, 24);
    shaftGeo.translate(0, down ? -0.5 : 0.5, 0);
    const shaft = new THREE.Mesh(shaftGeo, mat);
    const head = new THREE.Mesh(new THREE.ConeGeometry(240, 440, 28), mat);
    if (down) head.rotation.z = Math.PI;
    g.add(shaft, head);
    g.visible = false;
    arrows.add(g);
    return { g, shaft, head, mat, down };
  };
  const wA = bigArrow(BRAND.signal, true);
  wA.g.position.set(WEIGHT.x, WEIGHT.top, 0);
  const lA = bigArrow(BRAND.veille, false);
  lA.g.position.set(LIFT.x, LIFT.bottom, 0);
  const growArrow = (A_, k, len) => {
    A_.g.visible = k > 0.01;
    if (!A_.g.visible) return;
    A_.mat.opacity = Math.min(1, k * 3);
    const L = Math.max(450, len * k);
    const sgn = A_.down ? -1 : 1;
    A_.shaft.scale.y = L - 430;
    A_.head.position.y = sgn * (L - 220);
  };

  /* ── anchors ── */
  const A = {
    bow: anchor(bowG, SUB.bow, 0, 0),
    sail: anchor(sail, SAIL.x, yTop, 0),
    bank: anchor(bank, BANK.x, BANK.y, 0),
    valve: anchor(valves, VALVE.x, VALVE.y, 0),
    cmd: anchor(cmd, ...CMD.at),
    chief: anchor(crewMen[0].fig.head, 0, 0, 0),
    tankF: anchor(tFp.part, (MBT.fwd.x0 + MBT.fwd.x1) / 2, 0, 380),
    tankFs: anchor(tFs.part, (MBT.fwd.x0 + MBT.fwd.x1) / 2, 0, -380),
    tankA: anchor(tAp.part, (MBT.aft.x0 + MBT.aft.x1) / 2, 0, 360),
    tankAs: anchor(tAs.part, (MBT.aft.x0 + MBT.aft.x1) / 2, 0, -360),
    cube: anchor(cubeG, 0, 0, 0),
    tears: MBT.fwd.tears.map((p, i) => anchor(tearOut[i].T.part, ...p)),
    centre: anchor(root, 0, 0, 0),
    weight: anchor(wA.g, 0, 0, 0),
    lift: anchor(lA.g, 0, 0, 0),
  };
  const parts = {
    hull, sail, phull, sonar, room, crew,
    tanksF: [tFp.part, tFs.part], tanksA: [tAp.part, tAs.part],
    bank, valves, pipes, cmd, arrows, bubbles,
  };

  const setFlow = (F, k, time, lit) => {
    const total = F.run.len + F.br[0].len;
    const front = k * total;
    const u0 = clamp01(front / F.run.len);
    const u1 = clamp01((front - F.run.len) / F.br[0].len);
    const ph = (time * 240) % 90;
    const gain = 1.25 + 0.3 * lit;
    F.run.mesh.visible = u0 > 0.002;
    F.run.mat.uniforms.uFront.value = u0;
    F.run.mat.uniforms.uPhase.value = ph;
    F.run.mat.uniforms.uK.value = gain;
    for (const b of F.br) {
      b.mesh.visible = u1 > 0.002;
      b.mat.uniforms.uFront.value = u1;
      b.mat.uniforms.uPhase.value = ph;
      b.mat.uniforms.uK.value = gain;
    }
  };
  const setTank = (T, air, litK, dimK) => {
    setPartOpacity(T.part, dimK);
    emissive(T.mats, 0.16 * litK);
    if (!T.win) return;
    const w = T.win;
    const top = T.m.rOut - 8;
    const a = clamp01(air);
    const y = top - 2 * top * a;
    w.level.value = y;
    w.air.visible = a > 0.004 && dimK > 0.05;
    w.airMat.emissive.copy(VEILLE).multiplyScalar((0.42 + 0.12 * litK) * dimK);
    w.water.visible = a < 0.996;
    const surf = a > 0.004 && a < 0.996 && dimK > 0.05;
    w.surf.visible = surf;
    if (surf) {
      w.surf.position.y = y;
      w.surf.position.z = T.side * (Math.sqrt(Math.max(0, (T.m.rOut - 4) ** 2 - y * y)) + 2);
      w.surfMat.opacity = dimK;
    }
  };

  return {
    root, A, parts,
    update(P = {}, time = 0) {
      const onBench = (P.bench ?? 0) > 0.5;
      const heart = clamp01(P.heart ?? 0);
      const dim = 1 - 0.82 * heart; // everything but the forward port tank
      const e = onBench ? clamp01(P.explode ?? 0) : 0;
      const es = sstep(0, 1, e);

      /* the light hull */
      const h = clamp01(P.hull ?? 1) * dim;
      hullGlass.uniforms.uAmount.value = h;
      bowGlass.uniforms.uAmount.value = h;
      sailGlass.uniforms.uAmount.value = h;
      hull.visible = h > 0.003;
      ringMat.opacity = 0.3 * h * (1 - es);
      for (const r of fwdRings) r.visible = es < 0.15;
      longMat.opacity = 0.22 * h * (1 - es);
      for (const m of hullLines) if (m !== ringMat && m !== longMat) m.opacity = 0.4 * h;
      for (const m of sailLineMats) m.opacity = 0.5 * h;
      // the exploded view: the bow forward and up, the two upper tiles of the forward barrel off, the sail up
      bowG.position.set(-650 * es, 260 * es, 0);
      fwdPU.position.set(0, 760 * es, 330 * es);
      fwdSU.position.set(0, 760 * es, -420 * es);
      sail.position.y = 1050 * es;
      // the screw turns while the boat runs (a seventh of a turn repeats: no jump when it starts)
      const sp = clamp01(P.speed ?? 0);
      screw.rotation.x = sp > 0.02 ? (time * 5.2) % (TAU / SUB.screw.blades) : 0;
      for (const s of streaks) {
        const u = (time * s.l.userData.rate + s.l.userData.ph) % 1;
        const span = SUB.len + 1600;
        s.l.position.x = SUB.bow - 600 + u * span;
        s.l.scale.x = s.l.userData.len;
        s.mat.opacity = 0.34 * sp * h * Math.sin(Math.PI * u);
        s.l.visible = s.mat.opacity > 0.004;
      }

      /* the crushed bow */
      const k = clamp01(P.crush ?? 0);
      if (Math.abs(k - crushed) > 0.002 || (k === 0 && crushed !== 0) || (k === 1 && crushed !== 1)) {
        crushBow(k);
        crushed = k;
      }
      bowGlass.uniforms.uColor.value.copy(INK).lerp(SIGNAL, 0.2 * k);
      noseRingMat.opacity = 0.3 * h * (1 - sstep(0.05, 0.4, k)) * (1 - es);
      meridianMat.opacity = 0.26 * h * (1 - sstep(0.02, 0.25, k)) * (1 - es);
      for (const r of noseRings) r.visible = noseRingMat.opacity > 0.004;
      const kf = sstep(0.1, 0.7, k);
      foldMat.opacity = 0.75 * kf * clamp01(P.hull ?? 1) * (0.4 + 0.6 * dim);
      for (const f of folds) {
        f.visible = kf > 0.01;
        const s = f.userData.s;
        f.scale.setScalar(R * (0.74 + 0.26 * sstep(0, CRUSH_LEN, s)) * mix(1, f.userData.k, kf) * Math.min(1, 0.25 + s / 60) + 4);
        f.position.y = -45 * kf * (1 - s / (CRUSH_LEN + 250));
        f.rotation.set(0, f.userData.ry * kf, f.userData.rz * kf);
      }
      sonarGlass.uniforms.uAmount.value = h * 0.9;
      sonar.visible = h > 0.003;
      const ks = sstep(0.15, 0.6, k);
      sonarUp.position.set(70 * ks, 55 * ks, 25 * ks);
      sonarUp.rotation.set(0.1 * ks, 0, -0.22 * ks);
      sonarDn.position.set(40 * ks, -50 * ks, -20 * ks);
      sonarDn.rotation.set(-0.08 * ks, 0, 0.16 * ks);
      sonar.position.x = SONAR.x - 350 * es;
      crackMat.opacity = ks;
      const kt = sstep(0.3, 0.85, k);
      for (let i = 0; i < tearGroups.length; i++) {
        tearGroups[i].visible = kt > 0.01;
        tearGroups[i].scale.setScalar(Math.max(0.001, kt));
        tearMats[i].opacity = kt * (tearOut[i].T.side > 0 ? 1 : 0.8);
      }

      /* the inner glass: the pressure hull, the room, the crew */
      const inner = clamp01(P.inner ?? 1) * dim;
      const litHull = clamp01(P.litHull ?? 0);
      phGlass.uniforms.uAmount.value = inner * (0.75 + 0.6 * litHull);
      phGlass.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.7 * litHull);
      phRingMat.opacity = 0.18 * inner * (1 + litHull);
      phRingMat.color.copy(INK).lerp(VEILLE, 0.7 * litHull);
      phull.visible = phGlass.uniforms.uAmount.value > 0.003;
      roomGlass.uniforms.uAmount.value = inner;
      roomLineMat.opacity = 0.3 * inner;
      room.visible = inner > 0.003;
      const c = clamp01(P.crew ?? 1) * dim;
      crew.visible = !onBench && c > 0.01;
      const j = clamp01(P.jolt ?? 0);
      for (const m of crewMen) {
        m.fig.body.uniforms.uAmount.value = c;
        m.throwG.rotation.z = (m.c.seated ? 10 : 24) * DEG * j;
        m.throwG.position.x = m.x0 - (m.c.seated ? 25 : 70) * j;
      }
      if (Math.abs(j - jolted) > 0.01 || (j === 0 && jolted !== 0)) {
        poseCrew(j);
        jolted = j;
      }

      /* the system */
      const litBank = clamp01(P.litBank ?? 0), litValve = clamp01(P.litValve ?? 0), litPipe = clamp01(P.litPipe ?? 0);
      const litCmd = clamp01(P.litCmd ?? 0), litTank = clamp01(P.litTank ?? 0);
      for (const p of allSolids) if (p !== tFp.part) setPartOpacity(p, dim);
      // the bottles: green while they hold the air
      const air = clamp01(P.bank ?? 1);
      bottleMat.emissive.copy(VEILLE).multiplyScalar(0.13 * air + 0.12 * litBank);
      bottleCap.emissive.copy(VEILLE).multiplyScalar(0.12 * litBank);
      // the valves: a quarter turn, the handle green once open
      const v = clamp01(P.valves ?? 0);
      for (const hd of valveHandles) hd.rotation.y = -v * 90 * DEG;
      valveMat.emissive.copy(VEILLE).multiplyScalar(0.2 * litValve);
      handleMat.emissive.copy(VEILLE).multiplyScalar(0.55 * v + 0.25 * litValve);
      // the pipes and the air running in them
      pipeMat.emissive.copy(VEILLE).multiplyScalar(0.14 * litPipe);
      setFlow(flows.F, clamp01(P.flowF ?? 0), time, litPipe);
      setFlow(flows.A, clamp01(P.flowA ?? 0), time, litPipe);
      // the command: the cover lifts, then the handle is thrown — green
      const cm = clamp01(P.cmd ?? 0);
      coverPivot.rotation.x = -105 * DEG * sstep(0, 0.45, cm);
      leverPivot.rotation.x = 62 * DEG * sstep(0.45, 1, cm);
      leverMat.emissive.copy(VEILLE).multiplyScalar(0.26 * sstep(0.45, 1, cm) + 0.1 * litCmd);
      bezelMat.emissive.copy(VEILLE).multiplyScalar(0.07 * litCmd);
      panelMat.emissive.copy(VEILLE).multiplyScalar(0);
      setGlow(lampMat, 1.3 * sstep(0.6, 1, cm) + 0.35 * litCmd);
      wireMat.color.copy(INK).lerp(VEILLE, sstep(0.6, 1, cm));
      wireMat.opacity = (0.3 + 0.6 * sstep(0.6, 1, cm)) * dim;
      // the tanks: apart in the exploded view (the tees stretch with them); their water and air
      const zF = 300 * es, zA = 250 * es;
      tFp.part.position.set(0, -40 * es, zF);
      tFs.part.position.set(0, -40 * es, -zF);
      tAp.part.position.set(0, -40 * es, zA);
      tAs.part.position.set(0, -40 * es, -zA);
      tees[0].scale.z = 2 * (BR - 40 + zF) * 0.8;
      tees[1].scale.z = 2 * (BR - 40 + zA) * 0.8;
      tees[0].position.y = PIPE.y - 20 * es;
      tees[1].position.y = PIPE.y - 20 * es;
      for (const b of flows.F.br) b.mesh.scale.z = (BR - 40 + zF) * 0.8 / BR;
      for (const b of flows.A.br) b.mesh.scale.z = (BR - 40 + zA) * 0.8 / BR;
      const airF = clamp01(P.airF ?? 0), airA = clamp01(P.airA ?? 0);
      setTank(tFp, airF, litTank, 1);
      setTank(tFs, airF, litTank, dim);
      setTank(tAp, airA, litTank, dim);
      setTank(tAs, airA, litTank, dim);

      // the cube: cut out in lines, the green pushes it down through the bottom, it sinks; a green cube takes its place
      const q = clamp01(P.cube ?? 0);
      cubeG.visible = q > 0.002;
      if (cubeG.visible) {
        const appear = sstep(0, 0.15, q);
        const push = sstep(0.25, 0.5, q);
        const sink = sstep(0.4, 1, q);
        cubeEdge.material.opacity = appear * (1 - sstep(0.85, 1, q));
        cubeWaterMat.opacity = 0.95 * (1 - sstep(0.85, 1, q));
        cubeWater.position.y = -1500 * sink * sink - 40 * push;
        cubeAir.visible = push > 0.002;
        cubeAir.position.y = mix(CUBE.side * 1.05, 0, push) - 40 * push * (1 - sink);
        cubeAir.scale.setScalar(Math.max(0.01, push));
        setGlow(cubeAirMat, 1.1 * push);
        cubeAirEdge.material.opacity = push;
        tFp.win.waterMat.opacity = 0.94 - 0.5 * appear * (1 - sstep(0.85, 1, q));
      } else {
        tFp.win.waterMat.opacity = 0.94;
      }

      // the bubbles: out of the tears, rising, widening, drifting aft
      const lk = clamp01(P.leak ?? 0);
      bubbles.visible = !onBench && lk > 0.01;
      if (bubbles.visible) {
        bMat.uniforms.uK.value = Math.min(1, lk * 1.4) * (0.5 + 0.5 * dim);
        for (let s = 0; s < 3; s++) {
          const g = tearOut[s].g;
          tearPos.copy(g.position).add(tearOut[s].T.part.position);
          for (let b = 0; b < PER; b++) {
            const id = s * PER + b;
            const r1 = seeds[id * 3], r2 = seeds[id * 3 + 1], r3 = seeds[id * 3 + 2];
            const u = (time * (0.32 + 0.12 * r1) + b / PER + s * 0.37) % 1;
            const rise = u * (2600 + 1400 * r2);
            const spread = 80 + 520 * u;
            vP.set(
              tearPos.x + (r3 - 0.5) * spread + 520 * u * u + 30 * Math.sin(time * 2.1 + id),
              tearPos.y + rise,
              tearPos.z + (r1 - 0.5) * spread * 1.3 + 25 * Math.cos(time * 1.7 + id),
            );
            const size = (26 + 110 * u) * (0.55 + 0.6 * r2) * sstep(0, 0.06, u) * (1 - sstep(0.82, 1, u)) * Math.min(1, lk * 1.6);
            vS.set(size, size * (0.82 + 0.1 * Math.sin(time * 6 + id)), size);
            mtx.compose(vP, qI, vS.x > 0.01 ? vS : vS.setScalar(0.01));
            bubbles.setMatrixAt(id, mtx);
          }
        }
        bubbles.instanceMatrix.needsUpdate = true;
      }

      /* the arrows */
      const pr = clamp01(P.press ?? 0);
      pressMat.opacity = Math.min(1, pr * 2);
      for (const ring of pressRings) {
        ring.visible = pr > 0.01;
        const f = (ring.userData.r + (1 - pr) * 420 + 18 * Math.sin(time * 2.4) * pr) / ring.userData.r;
        ring.scale.set(1, f, f);
      }
      growArrow(wA, clamp01(P.weight ?? 0), WEIGHT.len);
      growArrow(lA, clamp01(P.lift ?? 0), LIFT.len);
    },
  };
}
