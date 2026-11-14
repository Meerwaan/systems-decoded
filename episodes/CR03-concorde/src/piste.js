// CR03 — piste.js : THE GROUND — the runway 26R at Roissy and west of it, ≈ 1:20, distances compressed past the runway (plan.js
// RUNWAY, RUN, V1_LINE, STOP, STRIP, FOUND, GROUND, TRAJ, INSPECT, CULPRIT).
// LOCAL FRAME = world (ORIGIN.piste is 0): the runway along x, the aircraft rolls toward −x, z the runway's width (+z: the left side of
// the aircraft). The ground y = 0 is the reconstitution's floor.
//   buildPiste() → { group, A, haloR, update(S, time, px) }
//   A: focus (the runway's middle), fault (on the culprit: the strip), strip, ruler, v1 (the line's middle), panel, chunk (found on the
//      runway), hotel, bourget (Le Bourget's runway, its middle), vehicle (the inspection vehicle)
//   reads S: run (the stopping bar's length) stop v1 ruler found soot traj bourget inspect culprit fault
//
// LAYERS (y): the fields 0 · the asphalt 0.03 · the paint 0.08 (pulled forward) · the soot 0.1 · the glowing bands 0.12. The
// reconstitution's floor (makeSurface, scaled to stage.focus) lies under and between them: its base below the fields, its amber grid
// just above them (it shows on the ground near the subject and fades away), its halo and its shadow catcher above the asphalt. So
// the ground plates here receive NO shadow of their own (the kit's catcher carries them: two would double the dark).
// Colour: the asphalt is the darkest thing in the frame, the fields a hair lighter, the strip the lightest thing on the asphalt.
// Amber = the lights and the trajectory (the time) · green = the stopping bar while it fits, the inspected runway · red = the bar past
// the end, the strip in fault (culprit 1).
import * as THREE from "three";
import { clay, clayEdges, alarm, setAlarm, RECON } from "@kit/reconstitution.js";
import { box, cyl, plate, fatLine, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { RUNWAY, RUN, V1_LINE, STOP, STRIP, FOUND, GROUND, TRAJ, INSPECT, CULPRIT, trajZ } from "./plan.js";

const DEG = Math.PI / 180;
const Y = { field: 0, ground: 0.03, paint: 0.08, soot: 0.1, band: 0.12 };
const HALF = RUNWAY.half;
const THR_E = 290; // the east threshold (26R): the bar's far edge
const THR_W = RUNWAY.x1 + 10; // the west threshold (08L)
const SHOULDER = 37.5; // 7.5 m each side

const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ─────────────────────────────── matters ─────────────────────────────── */

const NOISE = /* glsl */ `
float sdH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float sdN(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(sdH(i), sdH(i + vec2(1.0, 0.0)), f.x), mix(sdH(i + vec2(0.0, 1.0)), sdH(i + vec2(1.0, 1.0)), f.x), f.y);
}`;

// the asphalt: long patches of repaving, a fine aggregate, the rubber laid down along the centre of both touchdown zones
const ASPHALT = /* glsl */ `{
  float n = sdN(vGW * vec2(1.0 / 520.0, 1.0 / 70.0)) * 0.6 + sdN(vGW / 37.0) * 0.4;
  float a = 0.86 + 0.28 * n;
  float zone = smoothstep(-3900.0, -800.0, vGW.x) * (1.0 - smoothstep(-150.0, 260.0, vGW.x))
             + (1.0 - smoothstep(${(RUNWAY.x1 + 800).toFixed(1)}, ${(RUNWAY.x1 + 3900).toFixed(1)}, vGW.x)) * smoothstep(${(RUNWAY.x1 - 200).toFixed(1)}, ${(RUNWAY.x1 + 150).toFixed(1)}, vGW.x);
  float lane = 1.0 - smoothstep(26.0, 52.0, abs(vGW.y));
  float streak = sdN(vec2(vGW.x / 380.0, vGW.y / 5.0));
  a *= 1.0 - 0.5 * zone * lane * (0.45 + 0.55 * streak) * step(abs(vGW.y), ${HALF.toFixed(1)});
  diffuseColor.rgb *= a;
}`;
// the fields: rows (aRow: direction xy, depth z) melted into their mean as soon as they would get under two pixels, and a slow mottle
const FIELD = /* glsl */ `{
  float q = dot(vGW, vRow.xy) / 11.0;
  float fw = fwidth(q);
  float rows = (0.5 + 0.5 * cos(6.2831853 * q)) * clamp(1.0 - fw * 1.6, 0.0, 1.0);
  float big = sdN(vGW / 640.0);
  diffuseColor.rgb *= (1.0 - vRow.z * rows) * (0.88 + 0.24 * big);
}`;

/** A ground matter: the clay, matte, that reflects nothing, its colour set by hand (darker than the darkest clay tone). */
function groundMat(hex, kind) {
  const mat = clay({ tone: -1 });
  mat.color.set(hex);
  mat.roughness = 1;
  mat.envMapIntensity = 0.1;
  if (kind) {
    mat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nattribute vec3 aRow;\nvarying vec3 vRow;\nvarying vec2 vGW;")
        .replace(
          "#include <project_vertex>",
          `#include <project_vertex>
          vec4 sdP = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            sdP = instanceMatrix * sdP;
          #endif
          vGW = (modelMatrix * sdP).xz;
          vRow = aRow;`,
        );
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", `#include <common>\nvarying vec3 vRow;\nvarying vec2 vGW;\n${NOISE}`)
        .replace("#include <color_fragment>", `#include <color_fragment>\n${kind === "asphalt" ? ASPHALT : FIELD}`);
    };
    mat.customProgramCacheKey = () => "cr03-piste-" + kind;
  }
  return mat;
}

/** Paint on the asphalt: light clay, matte, pulled forward in depth so that it always wins over the asphalt it lies on. */
function paintMat(tone = 0.8) {
  const mat = clay({ tone });
  mat.roughness = 0.85;
  mat.envMapIntensity = 0.2;
  mat.polygonOffsetFactor = -2;
  mat.polygonOffsetUnits = -8;
  return mat;
}

/** A glowing band laid on the ground (additive): a faint fill, two bright edges (never thinner than ≈ 2.5 px), a bright cap at its
 *  far end. u runs along it (0 → 1), v across. `uShow` cuts it at u; the cap rides that cut. Light has a place: the cap. */
function bandMat(color, { fill = 0.22, edge = 0.8, cap = 1.2, edgeW = 0.05, capW = 0.02, k = 1.3 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color).multiplyScalar(k) },
      uFill: { value: fill },
      uEdge: { value: edge },
      uCap: { value: cap },
      uEdgeW: { value: edgeW },
      uCapW: { value: capW },
      uShow: { value: 1 },
      uAmount: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uFill, uEdge, uCap, uEdgeW, uCapW, uShow, uAmount;
      varying vec2 vUv;
      void main() {
        if (vUv.x > uShow) discard;
        float fu = max(fwidth(vUv.x), 1e-5), fv = max(fwidth(vUv.y), 1e-5);
        float ew = max(uEdgeW, fv * 2.5);
        float e = 1.0 - smoothstep(ew * 0.55, ew, min(vUv.y, 1.0 - vUv.y));
        float cw = max(uCapW, fu * 3.0);
        float c = 1.0 - smoothstep(cw * 0.4, cw, uShow - vUv.x);
        float a = uFill + uEdge * e + uCap * c;
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
    fog: false,
  });
}

/** Points of light that keep a size in the world close up and a minimum size in pixels far away (a lamp, a beacon, a runway's
 *  edge lights seen from the sky). `uSweep`: those east of it (x greater) turn `uGreen` — the runway already inspected. */
function lightsMat(color, { size = 1.4, min = 2.5, max = 28, k = 1.2 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color).multiplyScalar(k) },
      uGreen: { value: new THREE.Color(RECON.veille).multiplyScalar(k * 1.1) },
      uSize: { value: size },
      uMin: { value: min },
      uMax: { value: max },
      uPx: { value: 1000 },
      uAmount: { value: 1 },
      uSweep: { value: 1e9 },
    },
    vertexShader: /* glsl */ `
      uniform float uSize, uMin, uMax, uPx, uSweep;
      varying float vG;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(uSize * uPx / max(-mv.z, 1.0), uMin, uMax);
        vG = smoothstep(uSweep + 60.0, uSweep + 260.0, (modelMatrix * vec4(position, 1.0)).x);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uGreen; uniform float uAmount;
      varying float vG;
      void main() {
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(q, q);
        if (r2 > 1.0) discard;
        float a = exp(-r2 * 9.0) + 0.22 * exp(-r2 * 2.5) * (1.0 - r2);
        gl_FragColor = vec4(mix(uColor, uGreen, vG) * a * uAmount, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    fog: false,
  });
}
function points(positions, mat) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const p = new THREE.Points(g, mat);
  p.frustumCulled = false;
  p.renderOrder = 0; // before the floor's shadow catcher (renderOrder 1), which writes depth above the ground
  return p;
}

/** The soot along the runway: near black, ragged at its edges, patchy, revealed westward (uShow). */
function sootMat() {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0x030201) }, uShow: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uShow;
      varying vec2 vUv;
      ${NOISE}
      void main() {
        float u = vUv.x, v = vUv.y;
        if (u > uShow) discard;
        float n = sdN(vec2(u * 70.0, v * 3.0)) * 0.6 + sdN(vec2(u * 330.0, v * 9.0)) * 0.4;
        // (retouche 13/11) a clean, ragged edge (not a soft fade) and a near-opaque core: outside the floor's halo the soot reads by
        // the paint it swallows (centreline, touchdown bars), so it must be as dark as the asphalt's darkest and cut sharp
        float d = abs(v - 0.5 + 0.06 * (sdN(vec2(u * 24.0, 3.7)) - 0.5));
        float edge = 0.4 + 0.08 * (n - 0.5);
        float fe = max(fwidth(d), 1e-4);
        float across = 1.0 - smoothstep(edge - fe * 1.5, edge + fe * 0.5, d);
        float along = smoothstep(0.0, 0.006, u) * (1.0 - 0.4 * smoothstep(0.6, 1.0, u));
        float front = 1.0 - smoothstep(uShow - 0.02, uShow, u);
        float a = across * along * front * (0.82 + 0.18 * n);
        gl_FragColor = vec4(uColor, clamp(a, 0.0, 0.97));
      }`,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    // pulled forward past the paint (which is itself pulled forward): at a grazing view the paint otherwise wins the depth test
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -16,
  });
}

/* ─────────────────────────────── geometry helpers ─────────────────────────────── */

/** Flat rectangles on the ground, one geometry: [cx, cz, sx, sz, rot] (rot about y, like Object3D.rotation.y). */
function flatRects(rects, y) {
  const pos = new Float32Array(rects.length * 18);
  const nor = new Float32Array(rects.length * 18);
  let i = 0;
  for (const [cx, cz, sx, sz, rot = 0] of rects) {
    const c = Math.cos(rot), s = Math.sin(rot), hx = sx / 2, hz = sz / 2;
    const P = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]].map(([u, v]) => [cx + u * c + v * s, cz - u * s + v * c]);
    for (const k of [0, 2, 1, 0, 3, 2]) {
      pos.set([P[k][0], y, P[k][1]], i);
      nor.set([0, 1, 0], i);
      i += 3;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  return g;
}
/** A unit quad on the ground: u along local −x (0 at the origin → 1 at x = −1), v across (z −0.5 → 0.5). Scale x by the length. */
function unitQuad() {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -0.5, -1, 0, -0.5, -1, 0, 0.5, 0, 0, 0.5], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]); // facing up
  return g;
}
/** A grassy plate with rows: aRow = (direction, depth) on every vertex. */
function rowPlate(x0, x1, z0, z1, row) {
  const g = flatRects([[(x0 + x1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0), Math.abs(z1 - z0)]], Y.field);
  const a = new Float32Array(18);
  for (let i = 0; i < 6; i++) a.set(row, i * 3);
  g.setAttribute("aRow", new THREE.BufferAttribute(a, 3));
  return g;
}
const solidMesh = (geo, mat, parent, { cast = true, receive = true, edges = 0.36 } = {}) => {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = receive;
  parent.add(m);
  if (edges) m.add(clayEdges(geo, { opacity: edges }));
  return m;
};
const flatMesh = (geo, mat, parent) => {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = false;
  m.receiveShadow = false;
  parent.add(m);
  return m;
};
/** Strip a geometry down to position + normal (+ colour), non-indexed: what mergeGeometries needs to weld a town. */
function bare(geo, color) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal") g.deleteAttribute(k);
  if (color) {
    const n = g.attributes.position.count, c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) c.set([color.r, color.g, color.b], i * 3);
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  }
  g.userData = {};
  return g;
}
/** A gable roof over a w × d footprint, its ridge along x, rh high (non-indexed, flat normals). */
function roofGeo(w, d, rh) {
  const x = w / 2, z = d / 2;
  const v = [
    // the two slopes
    -x, 0, z, x, 0, z, x, rh, 0, -x, 0, z, x, rh, 0, -x, rh, 0,
    x, 0, -z, -x, 0, -z, -x, rh, 0, x, 0, -z, -x, rh, 0, x, rh, 0,
    // the two gables
    x, 0, z, x, 0, -z, x, rh, 0, -x, 0, -z, -x, 0, z, -x, rh, 0,
  ];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

/* ─────────────────────────────── runway paint: the glyphs ─────────────────────────────── */

// a stroke font of bars (3 wide, 5 high), like the runway designators
const GLYPH = {
  0: [[0, 0, 1, 5], [2, 0, 3, 5], [0, 4, 3, 5], [0, 0, 3, 1]],
  2: [[0, 4, 3, 5], [2, 2.5, 3, 5], [0, 2, 3, 3], [0, 0, 1, 2.5], [0, 0, 3, 1]],
  6: [[0, 0, 1, 5], [0, 4, 3, 5], [0, 2, 3, 3], [0, 0, 3, 1], [2, 0, 3, 3]],
  8: [[0, 0, 1, 5], [2, 0, 3, 5], [0, 4, 3, 5], [0, 2, 3, 3], [0, 0, 3, 1]],
  R: [[0, 0, 1, 5], [0, 4, 3, 5], [2, 2.6, 3, 5], [0, 2, 2.6, 3], { a: [1.5, 2.3], b: [2.6, 0.45], w: 1 }],
  L: [[0, 0, 1, 5], [0, 0, 3, 1]],
};
/** Rectangles of a text painted on the runway: `map(u, v)` → [x, z] (u to the reader's right, v up the text). */
function paintText(text, map, s) {
  const out = [];
  [...text].forEach((ch, i) => {
    const u0 = i * 4;
    for (const r of GLYPH[ch]) {
      if (Array.isArray(r)) {
        const [a, b] = [map((u0 + r[0]) * s, r[1] * s), map((u0 + r[2]) * s, r[3] * s)];
        out.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])]);
      } else {
        const a = map((u0 + r.a[0]) * s, r.a[1] * s), b = map((u0 + r.b[0]) * s, r.b[1] * s);
        const dx = b[0] - a[0], dz = b[1] - a[1];
        out.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.hypot(dx, dz) + r.w * s * 0.3, r.w * s, Math.atan2(-dz, dx)]);
      }
    }
  });
  return out;
}

/* ─────────────────────────────── the build ─────────────────────────────── */

export function buildPiste() {
  const group = new THREE.Group();
  group.name = "piste";
  const R = rng(26);

  /* ── matters ── */
  const asphalt = groundMat(0x16110d, "asphalt");
  const shoulderMat = groundMat(0x221b15, "asphalt");
  const grassMat = groundMat(0xffffff, "field"); // instance / vertex colours carry the tone
  grassMat.vertexColors = false;
  const paint = paintMat(0.82);
  const fixtureMat = clay({ tone: -0.7 });
  const hedgeMat = clay({ tone: -1 });
  hedgeMat.color.set(0x2c2823);
  hedgeMat.roughness = 0.95;
  hedgeMat.envMapIntensity = 0.25;
  const treeMat = hedgeMat.clone();
  treeMat.color.set(0x302b25);

  /* ── the runway 26R ── */
  const len = RUNWAY.x0 - RUNWAY.x1;
  const midX = (RUNWAY.x0 + RUNWAY.x1) / 2;
  flatMesh(flatRects([[midX, 0, len, HALF * 2]], Y.ground), asphalt, group);
  flatMesh(
    flatRects([[midX, HALF + SHOULDER / 2, len, SHOULDER], [midX, -HALF - SHOULDER / 2, len, SHOULDER]], Y.ground),
    shoulderMat,
    group,
  );
  // the parallel taxiway (south, −z: away from the cameras) and its links
  const TW = { z: -660, w: 115 };
  flatMesh(
    flatRects(
      [
        [midX - 400, TW.z, len - 600, TW.w],
        ...[-2600, -8600, -14600, -20400].map((x) => [x, (TW.z - HALF - SHOULDER) / 2 - 3, 110, Math.abs(TW.z) - HALF - SHOULDER - 6, 0]),
      ],
      Y.ground + 0.25,
    ),
    shoulderMat,
    group,
  );

  // the paint: thresholds, piano keys, designators, touchdown zone, aiming points, centreline, edge lines
  const rects = [];
  const keysZ = [];
  for (let k = 0; k < 6; k++) keysZ.push(12.5 + 16.5 * k, -12.5 - 16.5 * k);
  for (const [thr, dir] of [[THR_E, -1], [THR_W, 1]]) {
    rects.push([thr + dir * 4.5, 0, 9, (HALF - 4.5) * 2]); // threshold bar
    for (const z of keysZ) rects.push([thr + dir * 85, z, 150, 9]); // piano keys
    // touchdown zone: 3, 3, 2, 2, 1 bars each side; aiming point at 400 m
    [[750, 3], [1500, 3], [3000, 2], [3750, 2], [4500, 1]].forEach(([d, n]) => {
      for (let b = 0; b < n; b++) for (const sz of [1, -1]) rects.push([thr + dir * (d + 56), sz * (52.5 + 22.5 * b), 112, 15]);
    });
    for (const sz of [1, -1]) rects.push([thr + dir * 2125, sz * 65, 250, 40]);
  }
  // 26R (read by the aircraft heading −x: up = −x, right = −z) · 08L (heading +x)
  rects.push(...paintText("R", (u, v) => [112 - v, 13.5 - u], 9));
  rects.push(...paintText("26", (u, v) => [55 - v, 31.5 - u], 9));
  rects.push(...paintText("L", (u, v) => [RUNWAY.x1 + 183 + v, -13.5 + u], 9));
  rects.push(...paintText("08", (u, v) => [RUNWAY.x1 + 240 + v, -31.5 + u], 9));
  for (let x = -5; x - 150 > RUNWAY.x1 + 300; x -= 250) rects.push([x - 75, 0, 150, 4.5]);
  for (const sz of [1, -1]) rects.push([(THR_E + THR_W) / 2, sz * (HALF - 2.25), THR_E - THR_W, 4.5]);
  flatMesh(flatRects(rects, Y.paint), paint, group);

  // the edge lights: a fixture every 60 m each side, a row across each end; small amber hearts, weak
  const lightPos = [];
  for (let x = THR_E; x >= THR_W - 1; x -= 300) for (const sz of [1, -1]) lightPos.push(x, 1.3, sz * (HALF + 3.5));
  for (const x of [THR_E + 4, THR_W - 4]) for (let z = -HALF + 7.5; z <= HALF - 7; z += 15) lightPos.push(x, 0.9, z);
  const nFix = lightPos.length / 3;
  const fixtures = new THREE.InstancedMesh(cyl(0.42, 1.2, 0.08, 16), fixtureMat, nFix);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < nFix; i++) fixtures.setMatrixAt(i, m4.makeTranslation(lightPos[i * 3], lightPos[i * 3 + 1] * 0.45, lightPos[i * 3 + 2]));
  fixtures.castShadow = true;
  group.add(fixtures);
  const edgeLights = points(lightPos, lightsMat(RECON.ambre, { size: 1.1, min: 2.4, max: 22, k: 1.15 }));
  group.add(edgeLights);

  /* ── the ground around: the airfield's grass, the fields, the N17, the town's ground, Le Bourget's grass ── */
  const AIR = { x: [-24200, 4600], z: [-1800, 1800] };
  const TOWN = { x: [GROUND.gonesse.x[1] - 250, GROUND.gonesse.x[0] + 250], z: [GROUND.gonesse.z[0] - 250, GROUND.gonesse.z[1] + 250] };
  const B = GROUND.bourget;
  const bc = Math.cos(B.yaw * DEG), bs = Math.sin(B.yaw * DEG);
  const bHX = (B.len / 2) * bc + B.half * bs + 700, bHZ = (B.len / 2) * bs + B.half * bc + 700;
  const BFIELD = { x: [B.at[0] - bHX, B.at[0] + bHX], z: [B.at[2] - bHZ, B.at[2] + bHZ] };
  const ROAD = { x: [GROUND.road.x - GROUND.road.w / 2, GROUND.road.x + GROUND.road.w / 2], z: [-14000, 16000] };
  const EXTENT = { x: [-50000, 6500], z: [-14000, 16000] };

  // the airfield: mown grass, rows along the runway; around the runway's ends too
  const mown = [1, 0, 0.12];
  const airGeos = [
    rowPlate(AIR.x[0], AIR.x[1], HALF + SHOULDER, AIR.z[1], mown),
    rowPlate(AIR.x[0], AIR.x[1], AIR.z[0], -HALF - SHOULDER, mown),
    rowPlate(RUNWAY.x0, AIR.x[1], -HALF - SHOULDER, HALF + SHOULDER, mown),
    rowPlate(AIR.x[0], RUNWAY.x1, -HALF - SHOULDER, HALF + SHOULDER, mown),
    rowPlate(BFIELD.x[0], BFIELD.x[1], BFIELD.z[0], BFIELD.z[1], [bc, -bs, 0.1]),
  ];
  const airMat = grassMat.clone();
  airMat.onBeforeCompile = grassMat.onBeforeCompile;
  airMat.customProgramCacheKey = grassMat.customProgramCacheKey;
  airMat.color.set(0x5e564c);
  flatMesh(mergeGeometries(airGeos), airMat, group);
  // the town's ground
  const townMat = groundMat(0x3a332c, "asphalt");
  flatMesh(flatRects([[(TOWN.x[0] + TOWN.x[1]) / 2, (TOWN.z[0] + TOWN.z[1]) / 2, TOWN.x[1] - TOWN.x[0], TOWN.z[1] - TOWN.z[0]]], Y.field + 0.02), townMat, group);
  // the N17 and its dashes
  flatMesh(flatRects([[GROUND.road.x, 1000, GROUND.road.w, 30000]], Y.ground), asphalt, group);
  const dashes = [];
  for (let z = -14000; z < 16000; z += 160) dashes.push([GROUND.road.x, z, 2.4, 70]);
  flatMesh(flatRects(dashes, Y.paint), paintMat(0.5), group);

  // the patchwork: columns of uneven width cut into uneven fields, the reserved places cut out
  const cuts = [AIR, TOWN, BFIELD, ROAD];
  const subtract = (c, r) => {
    if (c.x1 <= r.x[0] || c.x0 >= r.x[1] || c.z1 <= r.z[0] || c.z0 >= r.z[1]) return [c];
    const out = [];
    if (c.x0 < r.x[0]) out.push({ ...c, x1: r.x[0] });
    if (c.x1 > r.x[1]) out.push({ ...c, x0: r.x[1] });
    const mx0 = Math.max(c.x0, r.x[0]), mx1 = Math.min(c.x1, r.x[1]);
    if (c.z0 < r.z[0]) out.push({ ...c, x0: mx0, x1: mx1, z1: r.z[0] });
    if (c.z1 > r.z[1]) out.push({ ...c, x0: mx0, x1: mx1, z0: r.z[1] });
    return out;
  };
  let fields = [];
  for (let x1 = EXTENT.x[1]; x1 > EXTENT.x[0]; ) {
    const x0 = Math.max(EXTENT.x[0], x1 - (1100 + R() * 1300));
    for (let z0 = EXTENT.z[0]; z0 < EXTENT.z[1]; ) {
      const z1 = Math.min(EXTENT.z[1], z0 + 800 + R() * 1200);
      fields.push({ x0, x1, z0, z1 });
      z0 = z1;
    }
    x1 = x0;
  }
  for (const r of cuts) fields = fields.flatMap((c) => subtract(c, r));
  fields = fields.filter((c) => c.x1 - c.x0 > 120 && c.z1 - c.z0 > 120);
  const TONES = [0x6a6156, 0x5b5349, 0x786d60, 0x51493f, 0x655d53, 0x82776a].map((h) => new THREE.Color(h));
  const fieldMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), grassMat, fields.length);
  const rowAttr = new Float32Array(fields.length * 3);
  const hedges = [], trees = [];
  const treeGeo = new THREE.IcosahedronGeometry(1, 1);
  // (retouche 13/11) no hedge, no tree under the t7 flight past the runway: seen from the aircraft's height a hedge reads as a long
  // black stick with a ball (its tree) across the frame (81 s). The random draws are kept so that the patchwork does not change.
  const underFlight = (x, z) => x < -23800 && x > -29600 && z > -1000 && z < 2600;
  fields.forEach((c, i) => {
    const gap = 7;
    m4.makeScale(c.x1 - c.x0 - gap * 2, 1, c.z1 - c.z0 - gap * 2).setPosition((c.x0 + c.x1) / 2, Y.field, (c.z0 + c.z1) / 2);
    fieldMesh.setMatrixAt(i, m4);
    fieldMesh.setColorAt(i, TONES[Math.floor(R() * TONES.length)]);
    const along = R() < 0.5;
    rowAttr.set([along ? 1 : 0, along ? 0 : 1, R() < 0.25 ? 0.04 : 0.14 + R() * 0.16], i * 3);
    // a hedge on some edges, a few trees along it
    for (const edge of ["n", "w"]) {
      if (R() > 0.42) continue;
      const horiz = edge === "n";
      const L = horiz ? c.x1 - c.x0 : c.z1 - c.z0;
      const hx = horiz ? (c.x0 + c.x1) / 2 : c.x0, hz = horiz ? c.z1 : (c.z0 + c.z1) / 2;
      const hh = 7 + R() * 4;
      const crosses = horiz
        ? hz > -1000 && hz < 2600 && c.x0 < -23800 && c.x1 > -29600
        : hx < -23800 && hx > -29600 && c.z0 < 2600 && c.z1 > -1000;
      if (!crosses) hedges.push(bare(new THREE.BoxGeometry(horiz ? L : 6, hh, horiz ? 6 : L).translate(hx, 4, hz)));
      for (let t = 120 + R() * 300; t < L - 60; t += 260 + R() * 420) {
        if (R() < 0.45) continue;
        const r = 10 + R() * 9;
        const tx = horiz ? c.x0 + t : c.x0, tz = horiz ? c.z1 : c.z0 + t;
        for (let k = 0; k < 3; k++) {
          const rr = r * (0.7 + R() * 0.4);
          const px = tx + (R() - 0.5) * r * 1.6, pz = tz + (R() - 0.5) * r * 1.6;
          if (!crosses && !underFlight(px, pz)) trees.push(bare(treeGeo.clone().scale(rr, rr * 0.92, rr).translate(px, rr * 0.95, pz)));
        }
      }
    }
  });
  fieldMesh.geometry.setAttribute("aRow", new THREE.InstancedBufferAttribute(rowAttr, 3));
  fieldMesh.receiveShadow = false;
  fieldMesh.frustumCulled = false;
  group.add(fieldMesh);
  if (hedges.length) solidMesh(mergeGeometries(hedges), hedgeMat, group, { receive: true, edges: 0 });
  if (trees.length) solidMesh(mergeGeometries(trees), treeMat, group, { receive: true, edges: 0 });

  /* ── Gonesse: streets of houses with gable roofs, a few blocks of flats; the corridor of the trajectory and the hotel kept clear ── */
  const H = GROUND.hotel;
  const town = [];
  const tc = [(GROUND.gonesse.x[0] + GROUND.gonesse.x[1]) / 2, (GROUND.gonesse.z[0] + GROUND.gonesse.z[1]) / 2];
  const ta = 11 * DEG, tca = Math.cos(ta), tsa = Math.sin(ta);
  const WALL = [0x8f8b85, 0x9c9891, 0x85817b].map((h) => new THREE.Color(h));
  const ROOF = [0x7a756f, 0x6e6a65, 0x86817b].map((h) => new THREE.Color(h));
  const clear = (x, z, r) => {
    if (Math.hypot(x - H.at[0], z - H.at[2]) < 240 + r) return false;
    if (x < -28800 && x > -32300 && Math.abs(z - trajZ(-x)) < 150 + r) return false;
    return x < GROUND.gonesse.x[0] - r && x > GROUND.gonesse.x[1] + r && z > GROUND.gonesse.z[0] + r && z < GROUND.gonesse.z[1] - r;
  };
  for (let a = -3000; a <= 3000; a += 290)
    for (let b = -3200; b <= 3200; b += 290) {
      const flats = R() < 0.08;
      if (R() < 0.3) continue; // gardens, a square, a school yard: the town breathes
      const lots = flats ? [[0, -60, 190, 46, 60 + R() * 30], [0, 60, 190, 46, 55 + R() * 30]] : [];
      if (!flats) for (const side of [-1, 1]) for (let k = -1.5; k <= 1.5; k += 1) if (R() > 0.4) lots.push([k * 58, side * 72, 40 + R() * 14, 34 + R() * 10, 24 + R() * 10]);
      for (const [la, lb, w, d, h] of lots) {
        const ua = a + la + (R() - 0.5) * 10, ub = b + lb + (R() - 0.5) * 8;
        const x = tc[0] + ua * tca - ub * tsa, z = tc[1] + ua * tsa + ub * tca;
        if (!clear(x, z, Math.max(w, d) * 0.6)) continue;
        const rot = -ta + (R() - 0.5) * 0.06;
        const body = bare(new THREE.BoxGeometry(w, h, d), WALL[Math.floor(R() * 3)]).translate(0, h / 2, 0);
        town.push(body.rotateY(rot).translate(x, Y.field, z));
        if (!flats) town.push(bare(roofGeo(w + 2, d + 2, 12 + R() * 6), ROOF[Math.floor(R() * 3)]).translate(0, h, 0).rotateY(rot).translate(x, Y.field, z));
        else town.push(bare(new THREE.BoxGeometry(w - 4, 2, d - 4), ROOF[1]).translate(0, h + 1, 0).rotateY(rot).translate(x, Y.field, z));
      }
    }
  const townMatC = clay({ tone: 0 });
  townMatC.color.set(0xffffff);
  townMatC.vertexColors = true;
  solidMesh(mergeGeometries(town), townMatC, group, { edges: 0 });

  // the hotel: low, long, lighter than the town (it must be found from the sky); its flat roof, its bands of (dark) windows
  const hotel = new THREE.Group();
  hotel.position.set(H.at[0], Y.field, H.at[2]);
  group.add(hotel);
  const [hw, hh, hd] = H.size;
  solidMesh(box(hw, hh, hd, 1.2).translate(0, hh / 2, 0), clay({ tone: 0.82 }), hotel, { edges: 0.4 });
  solidMesh(box(hw - 8, 1.6, hd - 8, 0.3).translate(0, hh + 0.4, 0), clay({ tone: 1 }), hotel, { edges: 0.3 });
  const bands = [];
  for (const y of [14, 27, 40]) for (const sz of [1, -1]) bands.push(bare(new THREE.BoxGeometry(hw - 16, 3.2, 0.8).translate(0, y, sz * (hd / 2 + 0.2))));
  solidMesh(mergeGeometries(bands), clay({ tone: -0.85 }), hotel, { edges: 0, cast: false });
  for (const [ux, uz] of [[-90, 10], [40, -14], [100, 12]]) solidMesh(box(22, 7, 16, 0.6).translate(ux, hh + 4.5, uz), clay({ tone: 0.1 }), hotel, { edges: 0.3 });
  flatMesh(flatRects([[0, hd / 2 + 80, hw * 0.8, 120]], 0.02), shoulderMat, hotel); // its car park

  /* ── Le Bourget: its runway (lights on with `bourget`), a wash of amber on it, hangars ── */
  const bour = new THREE.Group();
  bour.position.set(B.at[0], 0, B.at[2]);
  bour.rotation.y = B.yaw * DEG;
  group.add(bour);
  flatMesh(flatRects([[0, 0, B.len, B.half * 2]], Y.ground), asphalt, bour);
  const brects = [];
  for (let x = B.len / 2 - 300; x > -B.len / 2 + 300; x -= 250) brects.push([x - 75, 0, 150, 4.5]);
  for (const sx of [1, -1]) {
    for (const z of keysZ) brects.push([sx * (B.len / 2 - 90), z, 150, 9]);
    for (const sz of [1, -1]) brects.push([0, sz * (B.half - 2.25), B.len - 20, 4.5]);
  }
  flatMesh(flatRects(brects, Y.paint), paint, bour);
  const bl = [];
  for (let x = -B.len / 2 + 10; x <= B.len / 2; x += 300) for (const sz of [1, -1]) bl.push(x, 1.3, sz * (B.half + 3.5));
  for (const sx of [1, -1]) for (let z = -B.half + 7.5; z <= B.half; z += 15) bl.push(sx * (B.len / 2 + 4), 1, z);
  for (let k = 1; k <= 10; k++) for (const sz of [-12, 0, 12]) bl.push(B.len / 2 + 60 + k * 150, 1.5, sz); // the approach lights, toward Roissy
  const bourgetLights = points(bl, lightsMat(RECON.ambre, { size: 2.2, min: 4.5, max: 26, k: 1.6 }));
  bourgetLights.material.uniforms.uAmount.value = 0;
  bour.add(bourgetLights);
  const bWash = new THREE.Mesh(unitQuad(), bandMat(RECON.ambre, { fill: 0.1, edge: 0.55, cap: 0.5, edgeW: 0.06, capW: 0.012, k: 1.2 }));
  bWash.position.set(B.len / 2, Y.band, 0);
  bWash.scale.set(B.len, 1, B.half * 2.2);
  bWash.renderOrder = 0;
  bWash.visible = false;
  bour.add(bWash);
  const hangars = [];
  for (const [hx, hz, hl] of [[-2400, -720, 300], [-1900, -720, 260], [-1350, -760, 360], [-600, -700, 220]]) {
    hangars.push(bare(new THREE.BoxGeometry(hl, 42, 190).translate(hx, 21, hz)));
    hangars.push(bare(new THREE.CylinderGeometry(95, 95, hl, 20, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).scale(1, 0.4, 1).translate(hx, 42, hz)));
  }
  solidMesh(mergeGeometries(hangars), clay({ tone: -0.2 }), bour, { edges: 0.22 });

  /* ── principe: the V1 line, the stopping bar ── */
  const v1Mat = bandMat(RECON.ambre, { fill: 0.75, edge: 0.9, cap: 1.2, edgeW: 0.22, capW: 0.012, k: 1.7 });
  const v1 = new THREE.Mesh(unitQuad(), v1Mat);
  v1.rotation.y = -Math.PI / 2; // u from the +z edge (the camera's side) to the −z edge
  v1.position.set(V1_LINE.x, Y.band, HALF - 2);
  v1.scale.set(HALF * 2 - 4, 1, V1_LINE.w);
  v1.renderOrder = 0;
  group.add(v1);
  // seen from far, a painted 1.2 m line is under two pixels: a line drawn in pixels takes over (it fades out close up)
  const v1Far = fatLine([[0, 0, 0], [0, 0, -(HALF * 2 - 4)]], { color: RECON.ambre, width: 13, hdr: 2.2, opacity: 1 });
  v1Far.position.set(V1_LINE.x, Y.band + 0.05, HALF - 2);
  v1Far.renderOrder = 0;
  group.add(v1Far);
  const camAt = new THREE.Vector3();
  const v1State = { k: 0 };
  v1Far.onBeforeRender = (r, s, camera) => {
    camAt.setFromMatrixPosition(camera.matrixWorld);
    const d = Math.hypot(camAt.x - V1_LINE.x, camAt.y, camAt.z);
    v1Far.material.opacity = v1State.k * smooth(700, 2600, d);
  };

  const barMat = bandMat(RECON.veille, { fill: 0.2, edge: 0.75, cap: 1.5, edgeW: 0.05, capW: 0.012, k: 1.3 });
  const bar = new THREE.Mesh(unitQuad(), barMat);
  bar.position.y = Y.band + 0.02;
  bar.scale.z = 120;
  bar.renderOrder = 0;
  group.add(bar);
  const GREEN = new THREE.Color(RECON.veille).multiplyScalar(1.3), RED = new THREE.Color(RECON.alarme).multiplyScalar(1.4);

  /* ── the titanium strip, its rule ── */
  const stripFrame = new THREE.Group();
  stripFrame.position.set(STRIP.at[0], Y.ground, STRIP.at[2]);
  stripFrame.rotation.y = STRIP.yaw * DEG;
  group.add(stripFrame);
  const L = STRIP.len, W = 0.24, THICK = 0.11; // drawn wider and thinner than plan.js STRIP (0.16 × 0.28): a strip, not a beam
  const outline = new THREE.Shape(
    [[-L / 2, -W / 2], [L / 2 - 0.05, -W / 2], [L / 2 - 0.01, -W / 2 + 0.05], [L / 2 - 0.06, -0.005], [L / 2 + 0.01, W / 2 - 0.035], [L / 2 - 0.03, W / 2], [-L / 2 + 0.03, W / 2], [-L / 2, W / 2 - 0.03]].map(
      ([x, y]) => new THREE.Vector2(x, y),
    ),
  );
  for (let i = 0; i < 8; i++) {
    const hole = new THREE.Path();
    hole.absarc(-L / 2 + 0.14 + (i * (L - 0.32)) / 7, 0, 0.028, 0, Math.PI * 2, true);
    outline.holes.push(hole);
  }
  const stripGeo = plate(outline, THICK, { bevel: 0.025, round: 2, curveSegments: 12 });
  const curl = (g) => {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i); // outline in x–y, thickness along z
      const u = x / (L / 2);
      // laid flat: y_up = z, z_world = −y; a slight bow in the plane, the torn end curling up off the asphalt
      p.setXYZ(i, x, z + 0.12 * smooth(0.45, 1, u) ** 2 + 0.03 * smooth(0.7, 1, -u), -y + 0.06 * u * u);
    }
    p.needsUpdate = true;
  };
  curl(stripGeo);
  curl(stripGeo.userData.edges);
  stripGeo.computeVertexNormals();
  stripGeo.computeBoundingSphere();
  const stripMat = alarm({ tone: 0.88, noOk: true });
  const strip = solidMesh(stripGeo, stripMat, stripFrame, { edges: 0.5 });
  strip.renderOrder = 2;

  // the rule (a tape of light clay, graduated, no figure): it unrolls from the strip's square end and stops at its torn end
  const ruler = new THREE.Group();
  ruler.position.set(-L / 2, 0, 0.5);
  stripFrame.add(ruler);
  const tape = solidMesh(box(1, 0.035, 0.3, 0.012).translate(0.5, 0.018, 0), clay({ tone: 0.75 }), ruler, { edges: 0.3, cast: true });
  const TICK = 0.1, nTick = Math.round(L / TICK) + 1;
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.012, 1), clay({ tone: -0.85 }), nTick);
  for (let i = 0; i < nTick; i++) {
    const major = i % 5 === 0 || i === nTick - 1;
    m4.makeScale(major ? 0.018 : 0.011, 1, major ? 0.2 : 0.11).setPosition(Math.min(i * TICK, L), 0.04, 0.15 - (major ? 0.1 : 0.055));
    ticks.setMatrixAt(i, m4);
  }
  ticks.count = 0;
  ruler.add(ticks);
  const rollGeo = cyl(1, 0.32, 0.06, 32).rotateX(Math.PI / 2);
  const roll = solidMesh(rollGeo, clay({ tone: 0.45 }), ruler, { edges: 0.35 });
  const rollHub = solidMesh(cyl(0.45, 0.34, 0.04, 24).rotateX(Math.PI / 2), clay({ tone: -0.6 }), roll, { edges: 0 });
  rollHub.position.set(0, 0, 0);

  /* ── preuve: the intrados panel (bulged outward, smooth, no mark), the tyre piece ── */
  const ps = FOUND.panelSize;
  const panelGeo = new THREE.BoxGeometry(ps, 0.05, ps, 18, 1, 18);
  {
    const p = panelGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / (ps / 2), w = p.getZ(i) / (ps / 2);
      p.setY(i, p.getY(i) + 0.025 + 0.26 * (1 - u * u) * (1 - w * w));
    }
    panelGeo.computeVertexNormals();
  }
  const panel = new THREE.Group();
  panel.position.set(FOUND.panel[0], Y.ground, FOUND.panel[2]);
  panel.rotation.y = 22 * DEG;
  group.add(panel);
  solidMesh(panelGeo, clay({ tone: 0.55 }), panel, { edges: 0.42 });
  const rivets = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 10), clay({ tone: -0.9 }), 20);
  {
    let i = 0;
    for (let k = 0; k < 5; k++) {
      const t = -ps / 2 + 0.12 + (k * (ps - 0.24)) / 4;
      for (const [x, z] of [[t, -ps / 2 + 0.07], [t, ps / 2 - 0.07], [-ps / 2 + 0.07, t], [ps / 2 - 0.07, t]]) {
        const u = x / (ps / 2), w = z / (ps / 2);
        rivets.setMatrixAt(i++, m4.makeTranslation(x, 0.051 + 0.26 * (1 - u * u) * (1 - w * w), z));
      }
    }
  }
  panel.add(rivets);

  const chunk = new THREE.Group();
  chunk.position.set(FOUND.chunk[0], Y.ground, FOUND.chunk[2]);
  chunk.rotation.y = -28 * DEG;
  group.add(chunk);
  const TR = 3, T = 0.34, ARC = 2.3;
  const bend = (g, lift = 0) => {
    const p = g.attributes.position;
    const phiMax = ARC / 2 / TR;
    for (let i = 0; i < p.count; i++) {
      const phi = p.getX(i) / TR, r = TR + p.getY(i) + lift;
      p.setXY(i, r * Math.sin(phi), r * Math.cos(phi) - (TR - T / 2) * Math.cos(phiMax));
    }
    p.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  };
  const carcass = bend(new THREE.BoxGeometry(ARC, T, 1.7, 20, 1, 3));
  solidMesh(carcass, clay({ tone: -0.5 }), chunk, { edges: 0.3 });
  const grooves = [];
  for (const z of [-0.5, 0, 0.5]) grooves.push(bare(bend(new THREE.BoxGeometry(ARC - 0.1, 0.04, 0.13, 20, 1, 1).translate(0, T / 2, z), 0.005)));
  solidMesh(mergeGeometries(grooves), clay({ tone: -1 }), chunk, { edges: 0, cast: false });

  /* ── issue: the soot along the runway, under where the left wing burnt, westward from the strip ── */
  const SOOT = { x: STRIP.at[0] - 4, len: RUN.liftoff - RUN.strip + 120, z: 28, w: 72 }; // (retouche 13/11) 46 → 72: over the centreline and the touchdown bars
  const sootM = sootMat();
  const soot = new THREE.Mesh(unitQuad(), sootM);
  soot.position.set(SOOT.x, Y.soot, SOOT.z);
  soot.scale.set(SOOT.len, 1, SOOT.w);
  soot.renderOrder = 0.5; // after the floor's additive amber halo (0), before its shadow catcher (1): it darkens what the halo lit
  group.add(soot);

  /* ── t7: the trajectory, amber, on the ground, from the strip to the hotel; a head of light where it is being drawn ── */
  const NT = 360;
  const trajPts = new Float32Array(NT * 3);
  const tl = [];
  for (let i = 0; i < NT; i++) {
    const run = RUN.strip + ((TRAJ.end - RUN.strip) * i) / (NT - 1);
    trajPts.set([RUNWAY.start - run, 0.9, trajZ(run)], i * 3);
    tl.push([RUNWAY.start - run, 0.9, trajZ(run)]);
  }
  const trajGlow = fatLine(tl, { color: RECON.ambre, width: 24, hdr: 1.0, opacity: 0.22 });
  const trajCore = fatLine(tl, { color: RECON.ambre, width: 9, hdr: 1.6, opacity: 1 });
  trajGlow.renderOrder = trajCore.renderOrder = 0;
  group.add(trajGlow, trajCore);
  const trajHead = points([0, 0, 0], lightsMat(RECON.ambre, { size: 5, min: 14, max: 60, k: 2.2 }));
  group.add(trajHead);

  /* ── depuis: the inspection vehicle (a generic van, its amber beacon), the runway behind it washed green ── */
  const vehicle = new THREE.Group();
  vehicle.position.set(0, Y.ground, -60);
  group.add(vehicle);
  const vanBody = clay({ tone: 0.7 });
  solidMesh(box(15, 8.6, 11, 0.9).translate(3.6, 1.7 + 4.3, 0), vanBody, vehicle);
  solidMesh(box(8.2, 6.6, 10.6, 0.9).translate(-7.9, 1.7 + 3.3, 0), vanBody, vehicle);
  const glassDark = clay({ tone: -1 });
  solidMesh(box(0.5, 2.8, 9.2, 0.2).translate(-11.95, 6.5, 0), glassDark, vehicle, { edges: 0 });
  for (const sz of [1, -1]) solidMesh(box(4.6, 2.4, 0.4, 0.15).translate(-8, 6.6, sz * 5.3), glassDark, vehicle, { edges: 0 });
  const wheelGeo = cyl(2, 1.5, 0.25, 24).rotateX(Math.PI / 2);
  const tyreMat = clay({ tone: -0.95 });
  for (const wx of [-7.2, 6.8]) for (const sz of [1, -1]) solidMesh(wheelGeo.clone().translate(wx, 2, sz * 5), tyreMat, vehicle, { edges: 0.25 });
  solidMesh(box(1.6, 0.9, 7.5, 0.3).translate(-8.2, 8.75, 0), clay({ tone: -0.3 }), vehicle, { edges: 0.3 });
  const beacon = points([-8.2, 9.6, 0], lightsMat(RECON.ambre, { size: 2.6, min: 9, max: 40, k: 1.6 }));
  vehicle.add(beacon);
  const washMat = bandMat(RECON.veille, { fill: 0.09, edge: 0.6, cap: 1.0, edgeW: 0.035, capW: 0.006, k: 1.2 });
  const wash = new THREE.Mesh(unitQuad(), washMat);
  wash.position.set(THR_E, Y.band + 0.01, 0);
  wash.scale.z = HALF * 2;
  wash.renderOrder = 0;
  group.add(wash);

  /* ── anchors ── */
  const anchor = (parent, x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };
  const A = {
    focus: anchor(group, midX, 0, 0),
    fault: anchor(stripFrame, 0, 0.2, 0),
    strip: anchor(stripFrame, 0, 0.2, 0),
    ruler: anchor(ruler, L / 2, 0.05, 0),
    v1: anchor(group, V1_LINE.x, 0.5, 0),
    panel: anchor(panel, 0, 0.2, 0),
    chunk: anchor(chunk, 0, 0.3, 0),
    hotel: anchor(hotel, 0, hh, 0),
    bourget: anchor(bour, 0, 0, 0),
    vehicle: anchor(vehicle, -2, INSPECT.size[1], 0),
  };

  const lightMats = [edgeLights.material, bourgetLights.material, trajHead.material, beacon.material];

  return {
    group,
    A,
    haloR: 2.6,
    update(S, time, px) {
      for (let i = 0; i < lightMats.length; i++) lightMats[i].uniforms.uPx.value = px || 1000;

      // the strip: red when it is the culprit
      setAlarm(stripMat, Math.round(S.culprit) === CULPRIT.strip ? S.fault : 0);

      // the V1 line traced across the runway, from the camera's edge
      const v = Math.max(0, Math.min(1, S.v1));
      v1.visible = v > 0.001;
      v1Mat.uniforms.uShow.value = v;
      v1Mat.uniforms.uAmount.value = Math.min(1, v * 6);
      v1State.k = v;
      v1Far.visible = v > 0.001;
      v1Far.scale.z = Math.max(0.001, v);

      // the stopping bar: from the main gear forward, run × k long (drawn as `stop` grows); green while it ends on the runway,
      // red the moment it runs past the end — through dark, never a khaki in between
      const st = Math.max(0, Math.min(1, S.stop));
      bar.visible = st > 0.001;
      if (bar.visible) {
        const x0 = RUNWAY.start - S.run, Ls = Math.max(1, S.run * STOP.k * st);
        bar.position.x = x0;
        bar.scale.x = Ls;
        const over = smooth(-60, 60, RUNWAY.x1 - (x0 - Ls)); // 0 fits · 1 past the end
        const c = barMat.uniforms.uColor.value;
        if (over < 0.5) c.copy(GREEN).multiplyScalar(1 - 2 * over);
        else c.copy(RED).multiplyScalar(2 * over - 1);
        barMat.uniforms.uAmount.value = Math.min(1, st * 4);
      }

      // the rule unrolls
      const ru = Math.max(0, Math.min(1, S.ruler));
      ruler.visible = ru > 0.001;
      if (ruler.visible) {
        const len = ru * L;
        tape.scale.x = Math.max(0.001, len);
        ticks.count = Math.min(nTick, Math.floor(len / TICK + 1e-6) + 1);
        const r = 0.07 + 0.14 * Math.sqrt(1 - ru);
        roll.scale.set(r, r, 1);
        roll.position.set(len, r + 0.005, 0);
        roll.rotation.z = -len / Math.max(r, 0.05);
      }

      // what was found
      panel.visible = chunk.visible = S.found > 0.01;

      // the soot
      const so = Math.max(0, Math.min(1, S.soot));
      soot.visible = so > 0.001;
      sootM.uniforms.uShow.value = so * 1.03;

      // the trajectory
      const tr = Math.max(0, Math.min(1, S.traj));
      trajCore.visible = trajGlow.visible = trajHead.visible = tr > 0.001;
      if (tr > 0.001) {
        const f = tr * (NT - 1), i0 = Math.min(NT - 2, Math.floor(f)), u = f - i0;
        trajCore.geometry.instanceCount = trajGlow.geometry.instanceCount = Math.max(1, Math.ceil(f));
        const j = i0 * 3;
        trajHead.position.set(
          trajPts[j] + (trajPts[j + 3] - trajPts[j]) * u,
          trajPts[j + 1] + 0.2,
          trajPts[j + 2] + (trajPts[j + 5] - trajPts[j + 2]) * u,
        );
        trajHead.material.uniforms.uAmount.value = 1 - 0.45 * smooth(0.97, 1, tr);
      }

      // Le Bourget lights up
      const bo = Math.max(0, Math.min(1.25, S.bourget));
      bourgetLights.material.uniforms.uAmount.value = bo;
      bWash.visible = bo > 0.001;
      bWash.material.uniforms.uAmount.value = bo;

      // the inspection: the van drives the whole runway; behind it the runway is washed green, its edge lights turn green
      const ins = Math.max(0, Math.min(1, S.inspect));
      vehicle.visible = wash.visible = ins > 0.001;
      const vx = THR_E - (THR_E - THR_W) * ins;
      vehicle.position.x = vx;
      wash.scale.x = Math.max(1, THR_E - vx - 14);
      washMat.uniforms.uAmount.value = Math.min(1, ins * 25);
      edgeLights.material.uniforms.uSweep.value = ins > 0.001 ? vx : 1e9;
      beacon.material.uniforms.uAmount.value = 0.75 + 0.25 * Math.cos(time * 2 * Math.PI * 0.8);
    },
  };
}
