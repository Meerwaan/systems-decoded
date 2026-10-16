// DOSSIER 020 — Taipei 101 : the tower, seen like an X-ray, in the typhoon. A MODEL AT THE SCALE OF THE SUBJECT
// (plan.js): 142 m instead of 508, its sway exaggerated. A tapering base, eight modules that each flare out, a crown,
// a spire — glass, fine lines, its storeys drawn in the glass itself (they melt into an even grey before they get
// too close to draw). No solid ground: a grid, and Taipei in a few low blocks of glass.
// Solid in all that glass: nothing of ours but the skeleton when the film asks for it (`bones`) — the system hangs
// on `mount` (world.js), and it is the one solid thing of the picture.
// Three colours. signal: the typhoon — rain flying level, long veins of wind. veille: the skeleton taking the load
// (`bones` 2). ink: everything else.
// Centimetres, y up; the origin is the ground under the tower's axis; the wind blows toward +x.
// Everything is a function of the state and of `time` (update() is called sixteen times a frame: no allocation).
//
// THE BEND. u(y) = tip · (y / CAGE.at[1]) ^ LEAN.pow. The tower is cut in slices (three for the base, one per module,
// the crown, the spire); each is moved by u and tilted by u' at its own middle. A module is 11 m high: two neighbours
// then disagree by less than a centimetre at their joint — and a joint of Taipei 101 is a step anyway.
// `mount` is the eighth module: the cage. Its origin is the cage's floor (CAGE.at); it travels by `tip` exactly, and
// tilts with the tower there. All that is "in the cage" is its child: its façade, its floors, the gallery, the rails, you.
//
// Shell orders (see `asShell`): you 10 · the tower 40 · the rain 46 (after the tower's shell: the tower hides the
// rain behind it and is clean of it inside; the rain in front flies over it). Floors and rails are single sheets,
// no shell: they never hide anything.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { glass, asShell, lineMat, anchor, fatLine } from "@kit/build3d.js";
import { TOWER, CAGE, LEAN, GALLERY, YOU, BONES, CITY } from "./plan.js";
import { dressTour } from "./habillage.js";

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const [CX, CY, CZ] = CAGE.at;
const { base: BASE, modules: MOD, crown: CROWN, spire: SPIRE } = TOWER;
const Y_MOD = BASE.h; //                       where the modules begin
const Y_LAST = Y_MOD + (MOD.n - 1) * MOD.h; // the eighth module: the cage's
const Y_CROWN = Y_MOD + MOD.n * MOD.h;
const Y_SPIRE = Y_CROWN + CROWN.h;
const TOP = TOWER.top;
const CHAMFER = 0.15; //                       the corners are cut: a square with eight sides
const STOREY = GALLERY.y; //                   in the cage the storeys are the cage's own: true scale
const ORDER = { you: 10, tower: 40, rain: 46 };
const STROKE = { strong: { w: 2.4, a: 0.8 }, fine: { w: 1.9, a: 0.42 }, faint: { w: 1.8, a: 0.2 } };
const WIND = V(1, -0.13, 0.05).normalize();

/** The half-width of the eighth module's façade at a height of the cage's own space. */
const cageHalf = (y) => mix(MOD.half0, MOD.half1, clamp01((CY + y - Y_LAST) / MOD.h));

/* ───────────────────────────────────────────────────────────── glass with storeys in it */

/**
 * The tower's glass: the kit's (a rim, a lip, only the nearest surface once handed to `asShell`), and its storeys —
 * a line per floor and a faint band under it, like a lit ceiling seen through the pane. `aQ.x` counts the floors;
 * a family of lines leaves before its lines get too close to draw, into the grey they average to (a hundred
 * identical storeys seen from afar are a slab, or a comb that shimmers). `aQ.y` runs along the face (metres):
 * `streak`, the slanted reflections of a window pane, anchored in the wall.
 */
function towerGlass({ base = 0.004, rim = 0.07, power = 3, edge = 0, lines = 0.1, band = 0.035, streak = 0, mull = 0, through = 0.3 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: INK }, uBase: { value: base }, uRim: { value: rim }, uPower: { value: power }, uAmount: { value: 1 },
      uEdge: { value: edge }, uSpec: { value: 0 }, uGain: { value: 1 }, uLines: { value: lines }, uBand: { value: band }, uStreak: { value: streak }, uMull: { value: mull },
    },
    vertexShader: /* glsl */ `
      attribute vec2 aQ; varying vec3 vN; varying vec3 vV; varying vec2 vQ;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vQ = aQ;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uBase, uRim, uPower, uAmount, uEdge, uGain, uLines, uBand, uStreak, uMull;
      varying vec3 vN; varying vec3 vV; varying vec2 vQ;
      void main() {
        if (uAmount < 0.003) discard; // faded out, a shell must not hide the ones behind it
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        float g = clamp(1.0 - abs(dot(n, v)), 0.0, 1.0);
        float light = uBase + uRim * pow(g, uPower) + uEdge * smoothstep(0.6, 0.97, g);
        float fw = clamp(fwidth(vQ.x), 1e-5, 1.0);             // storeys per pixel
        float show = smoothstep(3.0, 10.0, 1.0 / fw);          // pixels per storey
        float d = abs(fract(vQ.x - 0.5) - 0.5);
        float line = 1.0 - smoothstep(fw * 0.5, fw * 1.6, d);  // two pixels wide, whatever the distance
        float f = fract(vQ.x);
        light += uLines * mix(min(0.3, 1.3 * fw), line, show) + uBand * mix(0.33, f * f, show);
        if (uMull > 0.0) {
          // the curtain wall's uprights, every uMull metres along the face: they leave like the storeys do
          float mq = vQ.y / uMull;
          float mw = clamp(fwidth(mq), 1e-5, 1.0);
          float md = abs(fract(mq - 0.5) - 0.5);
          light += uLines * 0.55 * mix(min(0.25, 1.3 * mw), 1.0 - smoothstep(mw * 0.5, mw * 1.6, md), smoothstep(4.0, 12.0, 1.0 / mw));
        }
        if (uStreak > 0.0) light += uStreak * smoothstep(0.8, 1.0, sin(vQ.y * 1.7 + vQ.x * 2.1)) * (0.35 + 0.65 * g);
        gl_FragColor = vec4(uColor * light * uAmount * uGain, 1.0);
      }`,
  });
  mat.userData.through = through;
  return mat;
}

/** The eight corners of a square of half-width `half` with its corners cut: [x, z], going round. */
const section = (half, c = half * CHAMFER) => {
  const m = half - c;
  return [[-m, half], [m, half], [half, m], [half, -m], [m, -half], [-m, -half], [-half, -m], [-half, m]];
};

/** A point of face `f` (0: +z · 1: +x · 2: −z · 3: −x): `t` along it, `r` out from the axis. */
const onFace = (f, t, r, y) => (f === 0 ? [t, y, r] : f === 1 ? [r, y, -t] : f === 2 ? [-t, y, -r] : [-r, y, t]);

/** A bar between two points, `r0` thick at the first and `r1` at the other: flat facets, so each takes the light its own way. */
function strut(a, b, r0, r1 = r0, sides = 6) {
  const va = V(...a);
  const vb = V(...b);
  const g = new THREE.CylinderGeometry(r1, r0, va.distanceTo(vb), sides, 1).toNonIndexed();
  g.deleteAttribute("uv");
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, vb.clone().sub(va).normalize()));
  g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  g.computeVertexNormals();
  return g;
}

/**
 * What one slice of the tower is made of, in the slice's own space (its middle at height `yc`: every height given
 * here is a height of the tower): panes of façade, lines in three families, bones. `ghost` collects the outline of
 * the tower at rest (never bent).
 */
function makeSet(yc, ghost) {
  const pos = [];
  const nor = [];
  const aq = [];
  const L = { strong: [], fine: [], faint: [] };
  const bones = [];
  const seg = (list, a, b) => list.push(a[0], a[1] - yc, a[2], b[0], b[1] - yc, b[2]);
  const loop = (list, pts) => pts.forEach((p, i) => seg(list, p, pts[(i + 1) % pts.length]));
  const n = V();
  const e1 = V();
  const e2 = V();
  const quad = (a, b, c, d, qa, qb, qc, qd) => {
    n.crossVectors(e1.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]), e2.set(d[0] - a[0], d[1] - a[1], d[2] - a[2])).normalize();
    for (const [p, q] of [[a, qa], [b, qb], [c, qc], [a, qa], [c, qc], [d, qd]]) {
      pos.push(p[0], p[1] - yc, p[2]);
      nor.push(n.x, n.y, n.z);
      aq.push(q[0], q[1]);
    }
  };
  /**
   * A block of storeys: from `half0` wide at `y0` to `half1` at `y1` (a module flares, the base tapers), its floors
   * counted from `q0` to `q1`. `rings`: the family of its bottom and of its top outline; `edges`: of its eight corners.
   */
  const frustum = (y0, half0, y1, half1, q0, q1, { rings = ["fine", "strong"], edges = "fine", outline = true } = {}) => {
    const A = section(half0).map(([x, z]) => [x, y0, z]);
    const B = section(half1).map(([x, z]) => [x, y1, z]);
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      const w0 = Math.hypot(A[j][0] - A[i][0], A[j][2] - A[i][2]) / 200;
      const w1 = Math.hypot(B[j][0] - B[i][0], B[j][2] - B[i][2]) / 200;
      const o = i * 7.3; // (each face its own streaks)
      quad(A[i], A[j], B[j], B[i], [q0, o - w0], [q0, o + w0], [q1, o + w1], [q1, o - w1]);
      if (edges) seg(L[edges], A[i], B[i]);
      if (outline) ghost.push(...A[i], ...B[i]);
    }
    if (rings[0]) loop(L[rings[0]], A);
    if (rings[1]) loop(L[rings[1]], B);
    if (outline) B.forEach((p, i) => ghost.push(...p, ...B[(i + 1) % 8]));
  };
  const bone = (a, b, r0, r1, sides) => bones.push(strut([a[0], a[1] - yc, a[2]], [b[0], b[1] - yc, b[2]], r0, r1, sides));
  /** Into the scene. */
  const build = (parent, material, out) => {
    if (pos.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute("aQ", new THREE.Float32BufferAttribute(aq, 2));
      const mesh = new THREE.Mesh(g, material);
      mesh.frustumCulled = false;
      parent.add(mesh);
      out.panes.push(mesh);
    }
    for (const name of Object.keys(L)) {
      if (!L[name].length) continue;
      const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(L[name]), lineMat(BRAND.ink, STROKE[name].w, { opacity: STROKE[name].a }));
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;
      parent.add(mesh);
      out.lines.push(mesh.material);
    }
    if (bones.length) {
      const mesh = new THREE.Mesh(mergeGeometries(bones), out.bonesMat);
      mesh.frustumCulled = false;
      mesh.renderOrder = 1;
      parent.add(mesh);
      out.bones.push(mesh);
    }
  };
  return { L, seg, loop, frustum, bone, build };
}

/* ───────────────────────────────────────────────────────────── the skeleton */

/** How far from the axis the mega-columns stand, and how thick they are, at a height. */
const COLUMN = { off: 72, out: (y) => (y < Y_MOD ? mix(830, MOD.half0 - 46, y / BASE.h) : MOD.half0 - 46), r: (y) => mix(40, 15, clamp01(y / (CY + CAGE.h))) };

/**
 * The skeleton's own light: a solid that shades itself (three greys by its facets), and is only there below the
 * head of light that climbs it — `uClimb` 0 → 1 lights it from the ground up. `uHue`: 0 ink · 1 veille.
 */
function bonesMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uInk: { value: INK }, uVeille: { value: VEILLE }, uClimb: { value: 0 }, uHue: { value: 0 }, uAmount: { value: 0 }, uTop: { value: CY + CAGE.h } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying float vY;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vY = w.y;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uVeille; uniform float uClimb, uHue, uAmount, uTop; varying vec3 vN; varying float vY;
      void main() {
        float y = vY / uTop;
        float head = uClimb * 1.16;
        float a = (1.0 - smoothstep(head - 0.1, head, y)) * (1.0 - smoothstep(0.955, 1.0, y)) * uAmount; // (above the ball they dissolve: a frame on the cage must not run bright bars into the header)
        if (a < 0.02) discard;
        float l = 0.16 + 0.84 * pow(clamp(0.5 + 0.5 * dot(normalize(vN), normalize(vec3(-0.6, 0.35, 0.72))), 0.0, 1.0), 2.2);
        vec3 hue = mix(uInk * 0.5, uVeille * 0.72, uHue);
        float front = smoothstep(head - 0.2, head - 0.06, y) * (1.0 - smoothstep(0.98, 1.0, uClimb)); // the head itself, while it climbs
        gl_FragColor = vec4(hue * l * (1.0 + 1.3 * front), a);
      }`,
  });
}

/** The bones of the tower between two heights: eight mega-columns (two per face), and the core up to the cage's floor. */
function columns(set, y0, y1) {
  for (let f = 0; f < 4; f++)
    for (const s of [-1, 1]) set.bone(onFace(f, s * COLUMN.off, COLUMN.out(y0), y0), onFace(f, s * COLUMN.off, COLUMN.out(y1), y1), COLUMN.r(y0), COLUMN.r(y1), 8);
  // (the core: four posts — a solid shaft, seen from the cage, is a slab under the ball)
  const core = BONES.core / 2;
  const top = Math.min(y1, CY - 20);
  if (top > y0) for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) set.bone([sx * core, y0, sz * core], [sx * core, top, sz * core], 15, 15, 4);
}
/** A belt of trusses at a height: on each face two chords and a zigzag between them, and an outrigger from the core to each column. */
function belt(set, y, half, h = 150) {
  const r = COLUMN.out(y);
  const span = Math.min(half * (1 - CHAMFER), r + 40);
  for (let f = 0; f < 4; f++) {
    set.bone(onFace(f, -span, r, y), onFace(f, span, r, y), 10, 10, 4);
    set.bone(onFace(f, -span, r, y + h), onFace(f, span, r, y + h), 10, 10, 4);
    const N = 8;
    for (let i = 0; i < N; i++) {
      const t0 = mix(-span, span, i / N);
      const t1 = mix(-span, span, (i + 1) / N);
      set.bone(onFace(f, t0, r, y + (i % 2 ? h : 0)), onFace(f, t1, r, y + (i % 2 ? 0 : h)), 7, 7, 4);
    }
    for (const s of [-1, 1]) set.bone(onFace(f, s * COLUMN.off, BONES.core / 2, y + h / 2), onFace(f, s * COLUMN.off, r, y + h / 2), 9, 9, 4);
  }
}

/* ───────────────────────────────────────────────────────────── the typhoon */

/**
 * What the wind carries, in a cube that follows the eye (each streak stays where it is in the world: it is the
 * cube's window that moves). Each is drawn as the line it is — a head, a tail upwind — never thinner than `px[0]`
 * pixels: rain when thin, a vein of wind when wide. Its length is many times what it covers in one frame: it slides
 * along itself, it never hops. Several cubes, each four times the last: there is rain at arm's length and rain far
 * behind the tower, and all of it flies level.
 */
function makeStreaks({ count, half, seed, shared, len, speed, wide, px, gain }) {
  const rand = rng(seed);
  const base = [];
  const seeds = [];
  const corner = [];
  const index = [];
  for (let i = 0; i < count; i++) {
    const p = [(rand() * 2 - 1) * half, (rand() * 2 - 1) * half, (rand() * 2 - 1) * half];
    const s = [rand(), rand(), rand()];
    for (const c of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
      base.push(...p);
      seeds.push(...s);
      corner.push(...c);
    }
    index.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 1, i * 4 + 3, i * 4 + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(base, 3));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 3));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute(corner, 2));
  geo.setIndex(index);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms: { ...shared, uHalf: { value: half }, uLen: { value: len * half }, uSpeed: { value: speed * half }, uWide: { value: wide * half }, uPx: { value: new THREE.Vector2(...px) }, uGain: { value: gain } },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uAmount, uDense, uHalf, uLen, uSpeed, uWide, uGain; uniform vec2 uView, uPx; uniform vec3 uDir, uColor;
        attribute vec3 aSeed; attribute vec2 aCorner;
        varying vec3 vCol; varying vec2 vUv;
        void main() {
          float k = 0.72 + 0.28 * aSeed.x; // not all at one speed: that is the depth of the air
          vec3 p = position + uDir * (uSpeed * k * uTime);
          vec3 rel = mod(p - cameraPosition + uHalf, 2.0 * uHalf) - uHalf; // the copy of this streak nearest to the eye
          vec3 w = cameraPosition + rel;
          float dist = length(rel) / uHalf;
          // (a ball inside the cube: a streak is gone before the cube's wall takes it to the other side)
          float seen = smoothstep(0.14, 0.3, dist) * (1.0 - smoothstep(0.7, 0.98, dist)) * (1.0 - smoothstep(uDense - 0.1, uDense, aSeed.z)) * smoothstep(0.0, 300.0, w.y);
          float len = uLen * (0.55 + 0.9 * aSeed.y);
          vec4 a = projectionMatrix * viewMatrix * vec4(w, 1.0);              // its head
          vec4 b = projectionMatrix * viewMatrix * vec4(w - uDir * len, 1.0); // its tail, upwind
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          vCol = vec3(0.0); vUv = vec2(0.0);
          if (seen * uAmount > 0.002 && a.w > 30.0 && b.w > 30.0) {
            float focal = 0.5 * uView.y * projectionMatrix[1][1];
            vec2 pa = a.xy / a.w * uView * 0.5;
            vec2 run = b.xy / b.w * uView * 0.5 - pa;
            float l = length(run);
            vec2 dir = l > 1e-3 ? run / l : vec2(-1.0, 0.0);
            float real = uWide * focal / a.w;            // half its width, in pixels
            float wide = clamp(real, uPx.x, uPx.y);
            float lpx = max(l, 8.0 * wide);              // seen end on it is a short stroke, never a dot
            vec2 q = pa + dir * (lpx * aCorner.x) + vec2(-dir.y, dir.x) * aCorner.y * wide;
            gl_Position = vec4(q / (uView * 0.5), mix(a.z / a.w, b.z / b.w, aCorner.x), 1.0);
            vUv = aCorner;
            float thin = clamp(real / uPx.x, 0.3, 1.0);  // drawn wider than it is, it pays for it in light
            vCol = uColor * ((0.35 + 0.65 * aSeed.y) * thin * seen * uAmount * uGain);
          }
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vCol; varying vec2 vUv;
        void main() {
          float along = smoothstep(0.0, 0.07, vUv.x) * pow(clamp(1.0 - vUv.x, 0.0, 1.0), 1.4);
          float across = pow(clamp(1.0 - abs(vUv.y), 0.0, 1.0), 1.5);
          gl_FragColor = vec4(vCol * along * across, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = ORDER.rain;
  return mesh;
}

/* ───────────────────────────────────────────────────────────── the ground */

/** A ground that is only its grid: each family of lines leaves before its lines get too close to draw (017, suite.js). */
function gridMaterial({ cell, major = 4, reach = 9000 }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK }, uCell: { value: cell }, uMajor: { value: major }, uReach: { value: reach }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vP = position.xz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uCell, uMajor, uReach, uAmount; varying vec2 vP;
      float lines(float q) {
        float fw = max(fwidth(q), 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return smoothstep(3.0, 11.0, 1.0 / fw) * (1.0 - smoothstep(fw * 0.5, fw * 1.6, d));
      }
      float level(vec2 q) { return max(lines(q.x), lines(q.y)); }
      void main() {
        if (uAmount < 0.002) discard;
        float g = max(level(vP / uCell) * 0.42, level(vP / (uCell * uMajor)));
        vec2 r = vP / uReach;
        float near = exp(-dot(r, r));
        gl_FragColor = vec4(uColor * (g * near * uAmount), 1.0);
      }`,
  });
}

/* ═════════════════════════════════════════════════════════════ the tower ═════════════ */

export function buildTour() {
  const group = new THREE.Group();
  group.name = "tour";
  const out = { panes: [], lines: [], bones: [], bonesMat: bonesMaterial() };
  const cageOut = { panes: [], lines: [], bones: [], bonesMat: out.bonesMat };
  const ghost = []; // the outline of the tower at rest: what the lean is read against
  const facade = towerGlass({ rim: 0.08, power: 3, lines: 0.17, band: 0.05, mull: 2.4, through: 0.28 });
  // the cage's own façade: the same glass, quieter (the ball is behind it), with a window's reflections
  const glazing = towerGlass({ rim: 0.07, power: 3, lines: 0.1, band: 0.012, streak: 0.085, mull: 1.7, through: 0.2 });

  /* ═════════════ 1 · THE SLICES: base, seven modules, crown, spire ═════════════ */

  const slices = []; // { g, y }: each moved by u(y), tilted by u'(y)
  const slice = (y0, y1) => {
    const g = new THREE.Group();
    const y = (y0 + y1) / 2;
    g.position.y = y;
    group.add(g);
    const s = { g, y, set: makeSet(y, ghost) };
    slices.push(s);
    return s;
  };

  // the base: it tapers; its floors are taller
  const baseHalf = (y) => mix(BASE.half0, BASE.half1, y / BASE.h);
  for (let i = 0; i < 3; i++) {
    const y0 = (i * BASE.h) / 3;
    const y1 = ((i + 1) * BASE.h) / 3;
    const s = slice(y0, y1);
    s.set.frustum(y0, baseHalf(y0), y1, baseHalf(y1), i * 5, (i + 1) * 5, { rings: [i === 0 ? "strong" : null, i === 2 ? "strong" : "faint"] });
    columns(s.set, y0, y1);
  }
  // seven modules: each flares out, the next starts again narrower (the eighth is the cage: see `mount`)
  for (let i = 0; i < MOD.n - 1; i++) {
    const y0 = Y_MOD + i * MOD.h;
    const s = slice(y0, y0 + MOD.h);
    s.set.frustum(y0, MOD.half0, y0 + MOD.h, MOD.half1, 0, 8);
    columns(s.set, y0, Math.min(y0 + MOD.h, CY));
    belt(s.set, y0 - 75, MOD.half0);
  }
  // the crown: three steps
  const crown = slice(Y_CROWN, Y_SPIRE);
  const STEPS = [[0, 0.4, 540, 500, 3], [0.4, 0.72, 400, 362, 2], [0.72, 1, 252, 214, 2]];
  for (const [a, b, h0, h1, floors] of STEPS) crown.set.frustum(Y_CROWN + a * CROWN.h, h0, Y_CROWN + b * CROWN.h, h1, 0, floors, { rings: ["fine", "strong"] });
  // the spire
  const spire = slice(Y_SPIRE, TOP);
  spire.set.frustum(Y_SPIRE, 74, Y_SPIRE + SPIRE.h * 0.5, 36, 0.5, 0.5, { rings: ["strong", "fine"] });
  spire.set.frustum(Y_SPIRE + SPIRE.h * 0.5, 30, TOP, 7, 0.5, 0.5, { rings: [null, null] });
  for (const s of slices) s.set.build(s.g, facade, out);

  /* ═════════════ 2 · THE CAGE: the eighth module, its floors, the gallery, the rails ═════════════ */

  const mount = new THREE.Group();
  mount.name = "tour-mount";
  mount.position.set(CX, CY, CZ);
  group.add(mount);
  const cage = makeSet(CY, ghost); // (heights given to it are the tower's: CY + a height of the cage)
  cage.frustum(Y_LAST, MOD.half0, Y_CROWN, MOD.half1, (Y_LAST - CY) / STOREY, (Y_CROWN - CY) / STOREY, { edges: "faint" });
  columns(cage, CY, CY + CAGE.h);

  // floors of glass, each pierced by a great round hole: the ball's well
  const floorGlass = glass(BRAND.ink, { base: 0.0015, rim: 0.035, power: 4 }); // (seen edge on from outside, a floor with a rim is a veil across the picture: its lines draw it)
  const railGlass = glass(BRAND.ink, { base: 0.002, rim: 0.07, power: 3.4 });
  const WELL = GALLERY.inner;
  const FLOORS = [STOREY, 2 * STOREY, 3 * STOREY]; // (the cage's own floor and its frame are the system's: model.js)
  const circle = (r, y, n = 72) => Array.from({ length: n }, (_, i) => [r * Math.cos((i / n) * TAU), CY + y, r * Math.sin((i / n) * TAU)]);
  const sheets = [];
  for (const y of FLOORS) {
    const half = cageHalf(y) - 8;
    const shape = new THREE.Shape(section(half).map(([x, z]) => new THREE.Vector2(x, -z)));
    shape.holes.push(new THREE.Path().absarc(0, 0, WELL, 0, TAU, true));
    sheets.push(new THREE.ShapeGeometry(shape, 48).rotateX(-Math.PI / 2).translate(0, y, 0));
    cage.loop(cage.L[y === STOREY ? "strong" : "fine"], circle(WELL, y));
    cage.loop(cage.L.faint, section(half).map(([x, z]) => [x, CY + y, z]));
  }
  const floors = new THREE.Mesh(mergeGeometries(sheets), floorGlass);
  floors.frustumCulled = false;
  mount.add(floors);

  // the gallery's rail, round the well: a hand rail, a mid rail, posts, a pane
  const RAIL = { r: WELL + 6, h: 105 };
  cage.loop(cage.L.strong, circle(RAIL.r, STOREY + RAIL.h));
  cage.loop(cage.L.faint, circle(RAIL.r, STOREY + RAIL.h * 0.5));
  for (let i = 0; i < 16; i++) {
    const a = ((i + 0.5) / 16) * TAU;
    cage.seg(cage.L.fine, [RAIL.r * Math.cos(a), CY + STOREY, RAIL.r * Math.sin(a)], [RAIL.r * Math.cos(a), CY + STOREY + RAIL.h, RAIL.r * Math.sin(a)]);
  }
  const pane = new THREE.Mesh(new THREE.CylinderGeometry(RAIL.r, RAIL.r, RAIL.h - 8, 96, 1, true).translate(0, STOREY + RAIL.h / 2, 0), railGlass);
  pane.frustumCulled = false;
  mount.add(pane);

  // the rail at the window, where you stand: on the −x side, a step inside the glass
  const BAR = { x: YOU.at[0] - 52, y: STOREY + 105, z0: -430, z1: 330 };
  cage.seg(cage.L.strong, [BAR.x, CY + BAR.y, BAR.z0], [BAR.x, CY + BAR.y, BAR.z1]);
  cage.seg(cage.L.faint, [BAR.x, CY + BAR.y - 50, BAR.z0], [BAR.x, CY + BAR.y - 50, BAR.z1]);
  for (let i = 0; i <= 6; i++) {
    const z = mix(BAR.z0, BAR.z1, i / 6);
    cage.seg(cage.L.fine, [BAR.x, CY + STOREY, z], [BAR.x, CY + BAR.y, z]);
  }
  cage.build(mount, glazing, cageOut);

  // one shell for the whole tower: only its nearest surface lights up, the rest shows through faintly
  asShell([...out.panes, ...cageOut.panes], ORDER.tower);
  const shellLines = [...out.lines, ...cageOut.lines];
  const shellBase = shellLines.map((mat) => mat.opacity);
  const allBones = [...out.bones, ...cageOut.bones];

  /* ═════════════ 3 · YOU: a body of glass on the gallery, at the window, the ball behind you ═════════════ */

  const you = makeFigure({ shell: true, hands: "flat", order: ORDER.you, glassK: 1.7, through: 0.2, skin: BRAND.ink });
  you.ghost(true);
  you.group.name = "tour-you";
  you.group.position.set(YOU.at[0], YOU.at[1], YOU.at[2]);
  you.group.rotation.y = -90 * DEG; // you face the window (−x): the typhoon in front of you, the ball at your back
  mount.add(you.group);
  // in your own frame (+z: the window, +x: your left — the camera's side): the bar, 52 cm ahead
  const FRONT = V(0, 0, 1);
  const HANDS = {
    L: { rest: V(20.5, 92, 3), grab: V(19, 106, 49), restDir: V(0.05, -1, 0.12), grabDir: V(-0.1, -0.25, 1), restPalm: V(-1, 0, 0), grabPalm: V(0, -1, 0.1), bend: V(0.45, -1, -0.2) },
    R: { rest: V(-20.5, 92, 3), grab: V(-19, 106, 49), restDir: V(-0.05, -1, 0.12), grabDir: V(0.1, -0.25, 1), restPalm: V(1, 0, 0), grabPalm: V(0, -1, 0.1), bend: V(-0.45, -1, -0.2) },
  };
  const SIDES = ["L", "R"];
  const lay = { dir: V(), palm: V() };
  const hand = V();
  const foot = V();

  /* ═════════════ 4 · THE AXIS: the plumb line, and the tower's outline at rest ═════════════ */

  const plumb = fatLine([[0, 0, 0], [0, TOP + 260, 0]], { width: 3.4, dashed: true, dashSize: 430, gapSize: 250, opacity: 1 });
  plumb.frustumCulled = false;
  plumb.material.depthTest = false;
  const outline = new LineSegments2(new LineSegmentsGeometry().setPositions(ghost), lineMat(BRAND.ink, 1.8, { opacity: 0.2 }));
  outline.frustumCulled = false;
  outline.material.depthTest = false;
  outline.renderOrder = 2;
  group.add(plumb, outline);

  /* ═════════════ 5 · THE GROUND: a grid, Taipei in low blocks of glass ═════════════ */

  const ground = new THREE.Group();
  group.add(ground);
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(CITY.r * 3.2, CITY.r * 3.2).rotateX(-Math.PI / 2), gridMaterial({ cell: 500, major: 4, reach: CITY.r * 1.05 }));
  grid.frustumCulled = false;
  ground.add(grid);
  const cityGlass = glass(BRAND.ink, { base: 0.004, rim: 0.2, power: 2.4, edge: 0.1 });
  const blocks = [];
  const streets = [];
  const rand = rng(20);
  const PITCH = 1080;
  for (let gx = -8; gx <= 8; gx++)
    for (let gz = -8; gz <= 8; gz++) {
      const r = [rand(), rand(), rand(), rand(), rand(), rand()];
      const x = gx * PITCH + (r[0] - 0.5) * 240;
      const z = gz * PITCH + (r[1] - 0.5) * 240;
      const far = Math.hypot(x, z);
      const az = Math.atan2(-x, z) / DEG; // where the camera stands when it is low: an open square there
      if (far < 2300 || far > CITY.r || r[2] > 0.64 || (far > 4600 && az > 8 && az < 82)) continue;
      const w = 360 + r[3] * 420;
      const d = 360 + r[4] * 420;
      const h = 110 + r[5] * r[5] * (CITY.h - 110);
      blocks.push(new THREE.BoxGeometry(w, h, d).translate(x, h / 2, z));
      const c = [[x - w / 2, z - d / 2], [x + w / 2, z - d / 2], [x + w / 2, z + d / 2], [x - w / 2, z + d / 2]];
      c.forEach(([px, pz], i) => {
        const [nx, nz] = c[(i + 1) % 4];
        streets.push(px, h, pz, nx, h, nz, px, 0, pz, px, h, pz);
      });
    }
  const city = new THREE.Mesh(mergeGeometries(blocks), cityGlass);
  city.frustumCulled = false;
  const cityLines = new LineSegments2(new LineSegmentsGeometry().setPositions(streets), lineMat(BRAND.ink, 1.8, { opacity: 0.34, fog: true }));
  cityLines.frustumCulled = false;
  cityLines.renderOrder = 2;
  ground.add(city, cityLines);

  /* ═════════════ 6 · THE TYPHOON: rain flying level, veins of wind — signal ═════════════ */

  const air = { uTime: { value: 0 }, uAmount: { value: 0 }, uDense: { value: 1 }, uDir: { value: WIND }, uColor: { value: SIGNAL }, uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) } };
  const storm = new THREE.Group();
  // rain: per frame a streak covers a sixth of its own length
  for (const [i, half] of [900, 3600, 14400, 57600].entries()) storm.add(makeStreaks({ count: 10000, half, seed: 31 + i, shared: air, len: 0.1, speed: 0.4, wide: 0.0012, px: [1.7, 3.2], gain: 1.15 }));
  // veins of wind: few, long, wide and soft; a twentieth of their length per frame
  for (const [i, half] of [4500, 18000, 72000].entries()) storm.add(makeStreaks({ count: 420, half, seed: 51 + i, shared: air, len: 0.62, speed: 0.9, wide: 0.009, px: [5, 34], gain: 0.13 }));
  group.add(storm);

  /* ═════════════ anchors ═════════════ */

  const A = {
    you: anchor(you.group, 0, 124, 0), //                                       your chest
    head: anchor(you.head, 0, 12, 0),
    cage: anchor(mount, 0, CAGE.h / 2, 0), //                                   the middle of the cage
    window: anchor(mount, -cageHalf(YOU.at[1] + 150), YOU.at[1] + 150, YOU.at[2]), // the façade in front of you
    top: anchor(spire.g, 0, TOP - spire.y, 0), //                               the tip of the spire
    crown: anchor(crown.g, 0, Y_SPIRE - crown.y, 0),
    mid: null, //                                                               mid-height, on the camera-side corner
    foot: anchor(group, -BASE.half0 * (1 - CHAMFER / 2), 0, BASE.half0 * (1 - CHAMFER / 2)),
  };
  const midSlice = slices.find((s) => Math.abs(s.y - TOP / 2) <= MOD.h / 2) ?? slices[6];
  const midHalf = mix(MOD.half0, MOD.half1, 0.5) * (1 - CHAMFER / 2);
  A.mid = anchor(midSlice.g, -midHalf, 0, midHalf);

  /* ═════════════ every frame ═════════════ */

  const POW = LEAN.pow;
  let qx = 0;
  let qz = 0;
  /** The ground shaking, at a height: a vibration at the frame rate (a steady blur) on a slow swell; it fades as it climbs. */
  const shake = (y, k, time) => {
    const up = y / TOP;
    const fast = 24 * (1 - 0.85 * up) * (1 - 0.85 * up);
    const slow = 62 * (1 - 0.5 * up);
    qx = k * (fast * Math.sin(TAU * 30 * time + y * 0.004) + slow * Math.sin(TAU * 0.85 * time - y * 0.0009));
    qz = k * (fast * 0.7 * Math.sin(TAU * 30 * time + 1.7 + y * 0.004) + slow * 0.55 * Math.sin(TAU * 0.67 * time + 0.6 - y * 0.0011));
  };

  /**
   * tip     the cage's travel along x, cm: the tower bends to it, `mount` follows
   * shell   the tower's glass and lines (façade, floors, cage, gallery, rails); at 0.15 nothing of it is left
   * storm   the typhoon: how much rain there is, how bright; the veins of wind (0 a calm day · 1 its peak)
   * city    Taipei's blocks and the ground's grid
   * axis    the plumb line and the tower's outline at rest
   * bones   the skeleton: 0 unseen → 1 lit ink, from the ground up → 2 veille
   * quake   the ground shakes
   * you     0 nobody · 1 you            grip   0 standing · 1 bent, both hands on the bar
   */
  function update(P, time = 0) {
    const tip = P.tip ?? 0;
    const k = clamp01(((P.shell ?? 1) - 0.15) / 0.85);
    const quake = clamp01(P.quake ?? 0);
    dress.update({ shell: k, city: clamp01(P.city ?? 0) }, time); // the life of the place: habillage.js

    // the bend, slice by slice
    for (let i = 0; i < slices.length; i++) {
      const s = slices[i];
      const r = s.y / CY;
      shake(s.y, quake, time);
      s.g.position.x = tip * Math.pow(r, POW) + qx;
      s.g.position.z = qz;
      s.g.rotation.z = -Math.atan(((tip * POW) / CY) * Math.pow(r, POW - 1));
    }
    shake(CY, quake, time);
    mount.position.set(CX + tip + qx, CY, CZ + qz);
    mount.rotation.z = -Math.atan((tip * POW) / CY);
    shake(0, quake, time);
    ground.position.set(qx, 0, qz);

    // the glass
    facade.uniforms.uAmount.value = k;
    glazing.uniforms.uAmount.value = k;
    floorGlass.uniforms.uAmount.value = k;
    railGlass.uniforms.uAmount.value = k;
    for (let i = 0; i < shellLines.length; i++) shellLines[i].opacity = shellBase[i] * k;

    // the skeleton
    const b = Math.max(0, P.bones ?? 0);
    const seen = b > 0.004;
    for (let i = 0; i < allBones.length; i++) allBones[i].visible = seen;
    if (seen) {
      const u = out.bonesMat.uniforms;
      u.uAmount.value = smooth(0, 0.08, b);
      u.uClimb.value = clamp01(b);
      u.uHue.value = clamp01(b - 1);
    }

    // the axis
    const ax = clamp01(P.axis ?? 0);
    plumb.visible = outline.visible = ax > 0.004;
    plumb.material.opacity = ax;
    outline.material.opacity = 0.2 * ax;

    // the ground
    const town = clamp01(P.city ?? 0);
    ground.visible = town > 0.004;
    grid.material.uniforms.uAmount.value = 0.24 * town;
    cityGlass.uniforms.uAmount.value = town;
    cityLines.material.opacity = 0.34 * town;

    // the typhoon
    const wind = clamp01(P.storm ?? 0);
    storm.visible = wind > 0.004;
    air.uTime.value = time;
    air.uAmount.value = smooth(0, 0.5, wind);
    air.uDense.value = 0.3 + 0.8 * wind;

    // you
    const here = clamp01(P.you ?? 1) * smooth(0.15, 0.4, P.shell ?? 1);
    you.group.visible = here > 0.01;
    if (you.group.visible) {
      const g = smooth(0, 1, clamp01(P.grip ?? 0));
      you.body.uniforms.uAmount.value = here;
      you.group.position.y = YOU.at[1] - 5 * g; // the knees give
      you.lean(mix(1.5, 23, g) + 0.5 * Math.sin(time * 1.1), 0, 0);
      for (let i = 0; i < 2; i++) {
        const side = SIDES[i];
        const h = HANDS[side];
        hand.copy(h.rest).lerp(h.grab, g);
        hand.y += 5 * g;
        lay.dir.copy(h.restDir).lerp(h.grabDir, g);
        lay.palm.copy(h.restPalm).lerp(h.grabPalm, g);
        you.reach(side, hand, h.bend, lay);
        foot.set(i ? -9.5 : 9.5, 8 + 5 * g, i ? -2 - 16 * g : 2 + 5 * g); // one foot back: braced
        you.leg(side, foot, FRONT, FRONT);
      }
      you.head.rotation.set(mix(-3, 16, g) * DEG, mix(24, 6, g) * DEG, 0);
    }
  }

  const dress = dressTour(mount);
  group.add(dress.group);
  return { group, mount, A, update };
}
