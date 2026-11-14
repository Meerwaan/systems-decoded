// DOSSIER 051 — Le brise-glace : THE ICE AT THE BOW, in the ship frame (origin at the waterline amidships, bow −z,
// port −x). docs/051-decors.md, « ## glace.js ». What it builds:
//   · THE TONGUE in contact: a plate of ice under the stem (a cusp, ±TW wide, bounded by open cracks), one metre
//     thick. `bend` sags it like a beam — one curve across its whole width, so it reads in PROFILE — its edge sliding
//     down and aft along the 20° stem (the bow never climbs: the ice bends and dives). `crack` splits it: the arc a
//     few thicknesses out, then two radials — a white line that falls to veille and goes — three blocks (A) and,
//     beyond the arc, the rest (B, two halves) that springs back flat. `tumble` turns the blocks on edge and slides
//     them aft, down along the hull (darker as they sink). `crush` (the « presque droite » stem): the edge crumbles
//     in place — debris, a signal fringe — and nothing gives.
//   · THE LEVEL ICE of the patch (ship frame, fixed): one sheet with the channel and the tongue cut out.
//   · THE CHANNEL: broken blocks along both flanks and in the wake (ice frame, +run·100, wrapped over the patch);
//     `wake` 1 black water between them → 0 packed tight.
//   · THE FLANK RIDGES (`ridge`): rubble piled against both sides; `grip` 1 pressed on the plating (a signal contact
//     line) → 0 a hand of black water. THE CREST ahead (`crest`, ice frame): its foot reaches under the stem at run 0;
//     rammed, `bend` / `crack` act on it — it splits wide, its rubble thrown to both sides.
//   · On THE BENCH (`slab`): the tongue alone, and a glass tank of water around the bow (its surface at y = 0).
// Everything many (blocks, rubble) is instanced; their edges are one line set rewritten in place. update() allocates
// nothing: it is called sixteen times a frame.
//   buildGlace() → { root, A, update(S, time, onBench) }
//   A  anchors: contact (the tongue's edge under the stem, follows the sag), crack (the arc's middle), ridge (the crest)
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, lineMat, anchor } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { SHIP, ICE, CONTACT, PATCH, RIDGE } from "./plan.js";

const DEG = Math.PI / 180;
const TOP = ICE.freeboard; //               the ice's top, 10 cm above the water
const BOT = ICE.freeboard - ICE.thick; //   its underside, 90 cm below
const E = CONTACT.edge; //                  the stem's waterline point (z)
const EDGE = E - 30; //                     the tongue's near face: its top corner just touches the 20° stem
const TW = 850; //                          the tongue's half-width (a cusp: the plate one stem breaks at a time)
const LEN = CONTACT.length; //              how far the tongue reaches ahead
const SC = 760; //                          where the arc crack runs (≈ 7–8 thicknesses out)
const LB = 1500; //                         how far the sag reaches
const SAG = 85; //                          the sag at the edge, bend 1 (exaggerated: it must read at 270 px)
const COT = 1 / Math.tan(20 * DEG); //      the edge slides aft along the 20° stem as it goes down
const CH = 2300; //                         the channel's half-width, abreast the hull
const CREST_Z = E - 950; //                 the crest's centre at run 0 (ice frame): its aft foot under the stem's overhang
const Z0 = E + 300; //                      the channel's blocks: from the bow's shoulders…
const Z1 = PATCH.behind; //                 …to the patch's end astern
const ZP = Z1 - Z0;
const RIDGE_FROM = -3900;
const RIDGE_TO = 4300;

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** The hull's half-beam at the waterline (ship frame) — what the rubble presses against, what the blocks slide along. */
function hb(z) {
  // model.js's waterline: fullness 1 − (1 − s)^2.4 from the stem to the parallel body (z −1 200), a taper aft of 2 600
  if (z <= E || z >= SHIP.stern) return 0;
  const s = clamp01((z - E) / (-1200 - E));
  let f = 1 - Math.pow(1 - s, 2.4);
  if (z > 2600) f *= 1 - 0.16 * ((z - 2600) / 3000) ** 2;
  return (SHIP.beam / 2) * f;
}
/** Where the level ice's channel edge stands (the notch widens from the tongue to the channel behind the bow). */
const LEAD = E - 1500; //                    ahead of the stem, open water beside the tongue down to here (the profile reads)
const notchX = (z) => (z < LEAD ? TW + 30 : z < LEAD + 700 ? TW + 30 + (CH - TW - 30) * smooth(LEAD, LEAD + 700, z) : CH);

/* ───────────── tones: matt ice, clear on black; its broken faces a tone lighter than its top. Never blue. ───────────── */
const INK = new THREE.Color(BRAND.ink);
const TONE = {
  top: INK.clone().multiplyScalar(0.5),
  side: INK.clone().multiplyScalar(0.68),
  crack: INK.clone().multiplyScalar(0.9),
  bot: INK.clone().multiplyScalar(0.3),
};
const EDGE_INK = 0x1f2529; // fine dark edges on light ice (they separate the slabs of a pile)
const iceMat = () => {
  const m = solid(0xffffff, { rough: 0.9, metal: 0 });
  m.vertexColors = true;
  return m;
};
const UP = [0, 1, 0];
const DOWN = [0, -1, 0];

/**
 * A slab of ice: the polygon `pts` ([x, z], ship frame) given its thickness (top → bot), each side resampled every
 * `step` cm so the slab can bend. `flags[i]` names the side pts[i] → pts[i+1]: "outer" (its edges always drawn), "crack"
 * / "split" (only once it opens), "seam" (the patch's border, faint). Returns flat-shaded, vertex-coloured triangles and
 * the edge segments sorted by flag (absolute coordinates).
 */
function prism(pts, flags, top, bot, step) {
  const P = [];
  const F = [];
  const K = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const m = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 0; j < m; j++) {
      P.push([a[0] + ((b[0] - a[0]) * j) / m, a[1] + ((b[1] - a[1]) * j) / m]);
      F.push(flags[i]);
      K.push(j === 0);
    }
  }
  const N = P.length;
  let area = 0;
  for (let k = 0; k < N; k++) area += P[k][0] * P[(k + 1) % N][1] - P[(k + 1) % N][0] * P[k][1];
  const sgn = area > 0 ? 1 : -1;
  const pos = [];
  const nor = [];
  const col = [];
  const tri = (a, b, c, n, cl) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const d = (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2];
    if (d < 0) [b, c] = [c, b];
    pos.push(...a, ...b, ...c);
    for (let i = 0; i < 3; i++) {
      nor.push(...n);
      col.push(cl.r, cl.g, cl.b);
    }
  };
  const faces = THREE.ShapeUtils.triangulateShape(P.map(([x, z]) => new THREE.Vector2(x, z)), []);
  for (const [i, j, k] of faces) {
    tri([P[i][0], top, P[i][1]], [P[j][0], top, P[j][1]], [P[k][0], top, P[k][1]], UP, TONE.top);
    tri([P[i][0], bot, P[i][1]], [P[j][0], bot, P[j][1]], [P[k][0], bot, P[k][1]], DOWN, TONE.bot);
  }
  const segs = {};
  const put = (f, ...v) => (segs[f] ||= []).push(...v);
  for (let k = 0; k < N; k++) {
    const p = P[k];
    const q = P[(k + 1) % N];
    const dx = q[0] - p[0];
    const dz = q[1] - p[1];
    const L = Math.hypot(dx, dz) || 1;
    const n = [(sgn * dz) / L, 0, (-sgn * dx) / L];
    const cl = F[k] === "outer" || F[k] === "seam" ? TONE.side : TONE.crack;
    tri([p[0], top, p[1]], [q[0], top, q[1]], [q[0], bot, q[1]], n, cl);
    tri([p[0], top, p[1]], [q[0], bot, q[1]], [p[0], bot, p[1]], n, cl);
    put(F[k], p[0], top, p[1], q[0], top, q[1]);
    put(F[k], p[0], bot, p[1], q[0], bot, q[1]);
    if (K[k]) {
      // an original corner: a vertical edge where the outline turns (it hides with the crack it belongs to)
      const prev = (k - 1 + N) % N;
      const ax = p[0] - P[prev][0];
      const az = p[1] - P[prev][1];
      const cos = (ax * dx + az * dz) / ((Math.hypot(ax, az) || 1) * L);
      if (cos < 0.85) put(F[k] === "outer" ? F[prev] : F[k], p[0], top, p[1], p[0], bot, p[1]);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  for (const f in segs) segs[f] = new Float32Array(segs[f]);
  return { geo, segs };
}

/** Edge segments (a flat [x,y,z, x,y,z, …] array) as one fat-line object. */
function segLines(arr, mat) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(arr);
  const lines = new LineSegments2(geo, mat);
  lines.frustumCulled = false;
  lines.renderOrder = 2;
  return lines;
}
const lineBuf = (lines) => lines.geometry.attributes.instanceStart.data;

/** Fade a set of materials (the bench's tongue and tank come in with `slab`). */
function fade(mats, a) {
  for (const m of mats) {
    if (m.uniforms?.uAmount) {
      m.uniforms.uAmount.value = a;
      continue;
    }
    m.opacity = (m.userData.base ?? 1) * a;
    const transparent = !!m.userData.transparent || a < 0.999;
    if (m.transparent !== transparent) {
      m.transparent = transparent;
      m.needsUpdate = true;
    }
    m.depthWrite = (m.userData.depthWrite ?? true) && a > 0.55;
  }
}

/* ───────────── the bend: one function of the rest position, shared by the slabs, their edges, the crack lines ───────────── */
const _d = [0, 0, 0];
function bendPoint(x, y, z, sag, slide, crushD) {
  const s = Math.max(0, EDGE - z);
  const g = s < LB ? (1 - s / LB) ** 2 : 0;
  let Z = z + slide * g;
  if (crushD > 0 && s < 140) Z -= crushD * (1 - s / 140); // the crumbled edge recedes from the stem
  _d[0] = x;
  _d[1] = y - sag * g;
  _d[2] = Z;
}
const bendG = (z) => {
  const s = Math.max(0, EDGE - z);
  return s < LB ? (1 - s / LB) ** 2 : 0;
};

/* ───────────── many pieces: instanced slabs, their edges one line set ───────────── */
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();
function makeSwarm(shapes, kinds, mat, lmat) {
  const per = shapes.map(() => 0);
  const slot = kinds.map((k) => per[k]++);
  const meshes = shapes.map((sh, k) => {
    const m = new THREE.InstancedMesh(sh.geo, mat, Math.max(1, per[k]));
    m.count = per[k];
    m.frustumCulled = false;
    m.castShadow = true;
    m.receiveShadow = true;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    _c.setScalar(1);
    for (let j = 0; j < per[k]; j++) m.setColorAt(j, _c);
    return m;
  });
  let total = 0;
  const off = kinds.map((k) => {
    const o = total;
    total += shapes[k].segs.length;
    return o;
  });
  const lines = segLines(new Float32Array(total), lmat);
  const buf = lineBuf(lines);
  const group = new THREE.Group();
  group.add(...meshes, lines);
  return {
    group,
    count: kinds.length,
    set(i, x, y, z, rx, ry, rz, sx, sy, sz) {
      _e.set(rx, ry, rz);
      _q.setFromEuler(_e);
      _v.set(x, y, z);
      _s.set(sx, sy, sz);
      _m.compose(_v, _q, _s);
      meshes[kinds[i]].setMatrixAt(slot[i], _m);
      const src = shapes[kinds[i]].segs;
      const dst = buf.array;
      const e = _m.elements;
      const o = off[i];
      for (let j = 0; j < src.length; j += 3) {
        const a = src[j], b = src[j + 1], c = src[j + 2];
        dst[o + j] = e[0] * a + e[4] * b + e[8] * c + e[12];
        dst[o + j + 1] = e[1] * a + e[5] * b + e[9] * c + e[13];
        dst[o + j + 2] = e[2] * a + e[6] * b + e[10] * c + e[14];
      }
    },
    hide(i) {
      _m.makeScale(0, 0, 0);
      meshes[kinds[i]].setMatrixAt(slot[i], _m);
      const dst = buf.array;
      const o = off[i];
      const n = shapes[kinds[i]].segs.length;
      for (let j = 0; j < n; j += 3) {
        dst[o + j] = (j / 3) % 2; // a tiny segment far below everything: never on screen, never degenerate
        dst[o + j + 1] = -1e6;
        dst[o + j + 2] = 0;
      }
    },
    tint(i, f) {
      _c.setScalar(f);
      meshes[kinds[i]].setColorAt(slot[i], _c);
    },
    commit() {
      for (const m of meshes) {
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      }
      buf.needsUpdate = true;
    },
  };
}

/** A soft round light (the instant the ice gives): a gradient, never a flat disc. */
function glowTexture() {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.22, "rgba(255,255,255,0.5)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function buildGlace() {
  const root = new THREE.Group();
  const R = rng(51);
  const jit = (a) => (R() * 2 - 1) * a;

  /* ───────────── THE TONGUE: its cracks are drawn first, the slabs are cut along them ───────────── */
  const ARCX = [-TW, -640, -380, -150, 0, 160, 400, 650, TW];
  const arc = ARCX.map((x) => [x, EDGE - (SC + 150 * (x / TW) ** 2 + (Math.abs(x) === TW ? 0 : jit(28)))]);
  const radial = (xe, k) => {
    const [xa, za] = arc[k];
    const pts = [[xe, EDGE]];
    for (const f of [0.34, 0.67]) pts.push([xe + (xa - xe) * f + jit(45), EDGE + (za - EDGE) * f + jit(22)]);
    pts.push([xa, za]);
    return pts;
  };
  const r1 = radial(-60, 2);
  const r2 = radial(70, 6);
  const center = [arc[4], [jit(70), arc[4][1] - (LEN - SC) * 0.33], [jit(70), arc[4][1] - (LEN - SC) * 0.66], [30, EDGE - LEN]];
  const sub = (a, i, j) => (i <= j ? a.slice(i, j + 1) : a.slice(j, i + 1).reverse());
  const rev = (c) => c.slice().reverse();
  const loop = (parts) => {
    const pts = [];
    const flags = [];
    for (const [chain, flag] of parts)
      for (let i = 0; i < chain.length - 1; i++) {
        pts.push(chain[i]);
        flags.push(flag);
      }
    return { pts, flags };
  };
  const FAR = EDGE - LEN;
  const shapesA = [
    loop([[[[-TW, EDGE], [-60, EDGE]], "outer"], [r1, "crack"], [sub(arc, 2, 0), "crack"], [[arc[0], [-TW, EDGE]], "outer"]]),
    loop([[[[-60, EDGE], [70, EDGE]], "outer"], [r2, "crack"], [sub(arc, 6, 2), "crack"], [rev(r1), "crack"]]),
    loop([[[[70, EDGE], [TW, EDGE]], "outer"], [[[TW, EDGE], arc[8]], "outer"], [sub(arc, 8, 6), "crack"], [rev(r2), "crack"]]),
  ];
  const shapesB = [
    loop([[sub(arc, 0, 4), "crack"], [center, "split"], [[[30, FAR], [-TW, FAR]], "outer"], [[[-TW, FAR], arc[0]], "outer"]]),
    loop([[sub(arc, 4, 8), "crack"], [[arc[8], [TW, FAR]], "outer"], [[[TW, FAR], [30, FAR]], "outer"], [rev(center), "split"]]),
  ];
  const tongue = new THREE.Group();
  root.add(tongue);
  const tongueMats = [];
  const frag = ({ pts, flags }, side, delay) => {
    const { geo, segs } = prism(pts, flags, TOP, BOT, 45);
    let cx = 0;
    let cz = 0;
    for (const [x, z] of pts) {
      cx += x;
      cz += z;
    }
    cx /= pts.length;
    cz /= pts.length;
    const cy = (TOP + BOT) / 2;
    const rest = Float32Array.from(geo.attributes.position.array);
    geo.translate(-cx, -cy, -cz);
    const mat = iceMat();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.position.set(cx, cy, cz);
    tongue.add(mesh);
    tongueMats.push(mat);
    const lines = [];
    for (const [flag, base] of [["outer", 0.7], ["crack", 0.7], ["split", 0.7]]) {
      if (!segs[flag]) continue;
      const lm = lineMat(EDGE_INK, 1.8, { opacity: base });
      const ls = segLines(segs[flag].map((v, i) => v - (i % 3 === 0 ? cx : i % 3 === 1 ? cy : cz)), lm);
      mesh.add(ls);
      tongueMats.push(lm);
      lines.push({ flag, ls, mat: lm, base, rest: segs[flag] });
    }
    const L = Math.hypot(cx, cz - EDGE) || 1;
    return { mesh, mat, lines, rest, c: [cx, cy, cz], side, delay, dir: [cx / L, (cz - EDGE) / L], key: NaN };
  };
  const A = shapesA.map((s, i) => frag(s, i === 2 ? 1 : -1, [0, 0.12, 0.22][i]));
  const B = shapesB.map((s, i) => frag(s, i ? 1 : -1, 0));
  const deform = (f, sag, slide, crushD) => {
    const key = sag * 1e6 + slide * 1e3 + crushD;
    if (key === f.key) return;
    f.key = key;
    const [cx, cy, cz] = f.c;
    const arr = f.mesh.geometry.attributes.position.array;
    const rest = f.rest;
    for (let i = 0; i < rest.length; i += 3) {
      bendPoint(rest[i], rest[i + 1], rest[i + 2], sag, slide, crushD);
      arr[i] = _d[0] - cx;
      arr[i + 1] = _d[1] - cy;
      arr[i + 2] = _d[2] - cz;
    }
    f.mesh.geometry.attributes.position.needsUpdate = true;
    for (const l of f.lines) {
      const buf = lineBuf(l.ls);
      const dst = buf.array;
      const src = l.rest;
      for (let i = 0; i < src.length; i += 3) {
        bendPoint(src[i], src[i + 1], src[i + 2], sag, slide, crushD);
        dst[i] = _d[0] - cx;
        dst[i + 1] = _d[1] - cy;
        dst[i + 2] = _d[2] - cz;
      }
      buf.needsUpdate = true;
    }
  };

  // the crack itself: a line on the top that flashes white the instant it runs, falls to veille, and goes
  const crackLine = (chains) => {
    const v = [];
    for (const c of chains) for (let i = 0; i < c.length - 1; i++) v.push(c[i][0], TOP + 1.5, c[i][1], c[i + 1][0], TOP + 1.5, c[i + 1][1]);
    const rest = new Float32Array(v);
    const mat = lineMat(0xffffff, 3, { opacity: 0, additive: true });
    const ls = segLines(Float32Array.from(rest), mat);
    ls.renderOrder = 4;
    root.add(ls);
    return { ls, mat, rest, key: NaN };
  };
  const cracks = [crackLine([arc]), crackLine([r1, r2]), crackLine([center])];
  const bendLine = (l, sag, slide) => {
    const key = sag * 1e3 + slide;
    if (key === l.key) return;
    l.key = key;
    const buf = lineBuf(l.ls);
    for (let i = 0; i < l.rest.length; i += 3) {
      bendPoint(l.rest[i], l.rest[i + 1], l.rest[i + 2], sag, slide, 0);
      buf.array[i] = _d[0];
      buf.array[i + 1] = _d[1];
      buf.array[i + 2] = _d[2];
    }
    buf.needsUpdate = true;
  };
  const WHITE = new THREE.Color(1, 1, 1);
  const VEILLE = new THREE.Color(BRAND.veille);
  const flashTex = glowTexture();
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  flash.material.color.setScalar(1.3);
  flash.renderOrder = 6;
  root.add(flash);

  /* ───────────── CRUSH: the « presque droite » stem only grinds the edge — debris, a signal fringe ───────────── */
  const unitShapes = [];
  for (let k = 0; k < 5; k++) {
    const n = 5 + (k % 3);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.3 * jit(1)) / n) * Math.PI * 2;
      const r = 0.55 + 0.45 * R(); // broken, not rounded
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    unitShapes.push(prism(pts, pts.map(() => "outer"), 0.5, -0.5, 10));
  }
  for (const s of unitShapes) s.segs = s.segs.outer;
  const debrisMat = iceMat();
  const debris = new THREE.InstancedMesh(unitShapes[0].geo, debrisMat, 30);
  debris.frustumCulled = false;
  debris.castShadow = true;
  debris.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const DEB = [];
  for (let i = 0; i < 30; i++) {
    const pile = i < 20;
    DEB.push({
      x: jit(pile ? 230 : 380),
      y: pile ? TOP + 6 + R() * 50 : TOP - 4,
      z: E - 50 - R() * (pile ? 70 : 260),
      s: 14 + R() * (pile ? 22 : 30),
      rx: jit(1.4),
      ry: R() * Math.PI,
      rz: jit(1.4),
      d: R() * 0.55,
    });
  }
  root.add(debris);
  const fringe = new THREE.Mesh(new THREE.BoxGeometry(560, 8, 16), glow(BRAND.signal, 2.2, { additive: true }));
  fringe.renderOrder = 5;
  root.add(fringe);

  /* ───────────── THE LEVEL ICE of the patch (field only): the channel and the tongue cut out ───────────── */
  const sheetPts = [];
  const sheetFlags = [];
  const ragged = (a, b, flag, every, amp) => {
    // from a to b (excluded), jittered across its direction
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const L = Math.hypot(dx, dz);
    const m = Math.max(1, Math.round(L / every));
    for (let i = 0; i < m; i++) {
      const t = i / m;
      const j = i === 0 ? 0 : jit(amp);
      sheetPts.push([a[0] + dx * t + (-dz / L) * j, a[1] + dz * t + (dx / L) * j]);
      sheetFlags.push(flag);
    }
  };
  const H = PATCH.half;
  const corners = [
    [[CH, Z1], [CH, LEAD + 700], "outer", 520, 90],
    [[CH, LEAD + 700], [TW + 30, LEAD], "outer", 400, 60],
    [[TW + 30, LEAD], [TW + 30, FAR], "outer", 4000, 0],
    [[TW + 30, FAR], [-(TW + 30), FAR], "outer", 4000, 0],
    [[-(TW + 30), FAR], [-(TW + 30), LEAD], "outer", 4000, 0],
    [[-(TW + 30), LEAD], [-CH, LEAD + 700], "outer", 400, 60],
    [[-CH, LEAD + 700], [-CH, Z1], "outer", 520, 90],
    [[-CH, Z1], [-H, Z1], "seam", 600, 140],
    [[-H, Z1], [-H, PATCH.ahead], "seam", 700, 160],
    [[-H, PATCH.ahead], [H, PATCH.ahead], "seam", 700, 160],
    [[H, PATCH.ahead], [H, Z1], "seam", 700, 160],
    [[H, Z1], [CH, Z1], "seam", 600, 140],
  ];
  for (const [a, b, flag, every, amp] of corners) ragged(a, b, flag, every, amp);
  const sheetP = prism(sheetPts, sheetFlags, TOP, BOT, 100000);
  const sheet = new THREE.Mesh(sheetP.geo, iceMat());
  sheet.receiveShadow = true;
  sheet.frustumCulled = false;
  sheet.add(segLines(sheetP.segs.outer, lineMat(EDGE_INK, 1.8, { opacity: 0.55 })));
  sheet.add(segLines(sheetP.segs.seam, lineMat(EDGE_INK, 1.8, { opacity: 0.2 })));
  root.add(sheet);

  /* ───────────── THE CHANNEL: broken blocks along both flanks and astern (ice frame, wrapped) ───────────── */
  const edgeMat = lineMat(EDGE_INK, 1.8, { opacity: 0.6 });
  const rubbleMat = iceMat();
  const CHAN = [];
  for (let z = Z0; z < Z1; z += 500)
    for (let l = 0; l < 4; l++) {
      const v = -1 + l * 0.5 + R() * 0.5; // stratified across the channel, port to starboard
      CHAN.push({ z: z + jit(140), v, r: 220 + R() * 110, asp: 0.6 + R() * 0.5, ry: R() * Math.PI, ph: R() * 6.28, dy: (CHAN.length % 4) * 3 - 4 });
    }
  const chan = makeSwarm(unitShapes, CHAN.map((_, i) => i % 5), rubbleMat, edgeMat);
  root.add(chan.group);

  /* ───────────── THE FLANK RIDGES (ship frame) and THE CREST ahead (ice frame) ───────────── */
  const RID = [];
  for (const side of [-1, 1])
    for (let z = RIDGE_FROM; z < RIDGE_TO; z += 150)
      for (let l = 0; l < 4; l++) {
        const u = Math.pow(R(), 1.2) * 1250;
        const h = RIDGE.sail * 1.5 * clamp01(1 - Math.abs(u - 380) / 900) * (0.45 + 0.55 * smooth(0, 380, u));
        RID.push({
          side, z: z + jit(60), u, y: (0.2 + 0.75 * R()) * h - 25,
          r: 90 + R() * 80, asp: 0.6 + R() * 0.6, t: 55 + R() * 45,
          rx: jit(1.15), ry: R() * Math.PI, rz: jit(1.15),
          d: 0.25 * R() + 0.2 * Math.abs(z) / 4300,
        });
      }
  const ridges = makeSwarm(unitShapes, RID.map((_, i) => (i * 3) % 5), rubbleMat, edgeMat);
  root.add(ridges.group);
  // the contact: where the rubble bears on the plating, a signal line along each flank (fore and aft of the cut)
  const contactMat = lineMat(BRAND.signal, 4, { opacity: 0, additive: true, hdr: 2 });
  const contact = [];
  for (const [from, to] of [[RIDGE_FROM + 100, 0], [0, RIDGE_TO - 100]]) {
    const v = [];
    for (const side of [-1, 1])
      for (let z = from; z < to; z += 200) {
        const z2 = Math.min(to, z + 200);
        v.push(side * (hb(z) + 6), TOP + 40, z, side * (hb(z2) + 6), TOP + 40, z2);
      }
    const ls = segLines(new Float32Array(v), contactMat);
    ls.renderOrder = 4;
    contact.push(ls);
    root.add(ls);
  }
  const CREST = [];
  for (let x = -4400; x < 4400; x += 120)
    for (let l = 0; l < 3; l++) {
      const dz = jit(450);
      const h = RIDGE.sail * 1.15 * (1 - Math.abs(dz) / 450) * (1 - smooth(3000, 4400, Math.abs(x)));
      CREST.push({
        x: x + jit(50), dz, y: (0.15 + 0.8 * R()) * h - 20,
        r: 80 + R() * 80, asp: 0.6 + R() * 0.6, t: 55 + R() * 45,
        rx: jit(1.15), ry: R() * Math.PI, rz: jit(1.15),
      });
    }
  const crest = makeSwarm(unitShapes, CREST.map((_, i) => (i * 2 + 1) % 5), rubbleMat, edgeMat);
  root.add(crest.group);

  /* ───────────── THE BENCH: a glass tank of water around the bow, its surface at the waterline ───────────── */
  const tank = new THREE.Group();
  const TK = { x: 1300, y0: SHIP.keel, y1: 60, z0: FAR - 150, z1: -2600 };
  const tankGlass = glass(BRAND.ink, { base: 0, rim: 0.22, edge: 0.35, spec: 0.25, through: 0.2 });
  const tankBox = new THREE.Mesh(new THREE.BoxGeometry(TK.x * 2, TK.y1 - TK.y0, TK.z1 - TK.z0), tankGlass);
  tankBox.position.set(0, (TK.y0 + TK.y1) / 2, (TK.z0 + TK.z1) / 2);
  asShell(tankBox, 20);
  tank.add(tankBox);
  const tv = [];
  const rect = (y) => {
    const c = [[-TK.x, TK.z0], [TK.x, TK.z0], [TK.x, TK.z1], [-TK.x, TK.z1]];
    for (let i = 0; i < 4; i++) tv.push(c[i][0], y, c[i][1], c[(i + 1) % 4][0], y, c[(i + 1) % 4][1]);
  };
  rect(TK.y0);
  rect(TK.y1);
  for (const [x, z] of [[-TK.x, TK.z0], [TK.x, TK.z0], [TK.x, TK.z1], [-TK.x, TK.z1]]) tv.push(x, TK.y0, z, x, TK.y1, z);
  const tankLineMat = lineMat(BRAND.ink, 1.8, { opacity: 0.45 });
  tank.add(segLines(new Float32Array(tv), tankLineMat));
  tv.length = 0;
  rect(0);
  const waterLineMat = lineMat(BRAND.ink, 2, { opacity: 0.75 });
  tank.add(segLines(new Float32Array(tv), waterLineMat));
  const waterMat = new THREE.MeshBasicMaterial({ color: BRAND.ink, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide, fog: false });
  waterMat.userData.base = 0.05;
  waterMat.userData.transparent = true;
  waterMat.userData.depthWrite = false;
  const water = new THREE.Mesh(new THREE.PlaneGeometry(TK.x * 2, TK.z1 - TK.z0), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0, (TK.z0 + TK.z1) / 2);
  water.renderOrder = 8;
  tank.add(water);
  root.add(tank);
  const tankMats = [tankGlass, tankLineMat, waterLineMat, waterMat];

  const Aanch = {
    contact: anchor(root, 0, TOP, EDGE),
    crack: anchor(root, 0, TOP, EDGE - SC),
    ridge: anchor(root, 0, RIDGE.sail, CREST_Z),
  };

  return {
    root,
    A: Aanch,
    update(S, time, onBench) {
      const shift = S.run * 100;
      const crack = S.crack;
      const sag = SAG * S.bend * (1 - S.straight); // the near-vertical stem does not bend the ice: it crushes it
      const slide = sag * COT;
      const crushD = 45 * S.crush;
      const spring = smooth(0.12, 0.5, crack); // beyond the arc, the plate springs back flat
      const sep = smooth(0.15, 0.6, crack);
      const near = S.crest > 0.01 ? smooth(-900, -150, shift) * smooth(0, 0.6, S.crest) : 0; // the crest under the stem
      const wide = smooth(0.05, 0.6, crack) * near; // rammed: it breaks wide

      /* the tongue */
      const showTongue = onBench ? S.slab > 0.004 : true;
      tongue.visible = showTongue;
      if (showTongue) {
        fade(tongueMats, onBench ? S.slab : 1);
        for (const f of A) {
          deform(f, sag, slide, crushD);
          const [cx, cy, cz] = f.c;
          const tt = smooth(f.delay, f.delay + 0.45, S.tumble); //      turning on edge
          const ts = smooth(0.3 + f.delay, 1, S.tumble); //               then sliding aft, under
          const zt = cz + 900 * tt + 2600 * Math.pow(ts, 1.3);
          let x = cx + f.dir[0] * 24 * sep + f.side * 160 * wide;
          const k = smooth(0, 0.6, tt);
          x += (f.side * (hb(zt) + 70) - x) * k; // turned on edge, it slides along the plating
          const y = cy - 14 * sep - 40 * wide - 170 * tt - 260 * ts;
          const z = cz + f.dir[1] * 24 * sep + (zt - cz);
          f.mesh.position.set(x, y, z);
          f.mesh.rotation.set(-0.12 * tt - 0.12 * ts - 0.03 * sep, 0, f.side * (78 * DEG * smooth(0, 0.5, tt) + 0.05 * sep + 0.14 * wide));
          f.mat.color.setScalar(1 - 0.6 * smooth(-70, -400, y)); // under the water, darker
          for (const l of f.lines) {
            const o = l.flag === "outer" ? 1 : smooth(0.25, 0.6, crack);
            l.mat.opacity = l.base * o * (onBench ? S.slab : 1);
          }
        }
        for (const f of B) {
          deform(f, sag * (1 - spring), slide * (1 - spring), crushD);
          const [cx, cy, cz] = f.c;
          f.mesh.position.set(cx + f.side * 90 * wide, cy + 12 * wide, cz);
          f.mesh.rotation.set(0, 0, f.side * 0.11 * wide);
          for (const l of f.lines) {
            const o = l.flag === "outer" ? 1 : l.flag === "crack" ? smooth(0.25, 0.6, crack) : wide;
            l.mat.opacity = l.base * o * (onBench ? S.slab : 1);
          }
        }
      }

      /* the crack: white the instant it runs, then veille, then gone (the open water says it) */
      const runs = [smooth(0.02, 0.12, crack), smooth(0.1, 0.24, crack), smooth(0.06, 0.2, crack) * near];
      const live = 1 - smooth(0.55, 0.9, crack);
      const hue = smooth(0.18, 0.45, crack);
      for (let i = 0; i < cracks.length; i++) {
        const l = cracks[i];
        const o = showTongue ? runs[i] * live * (onBench ? S.slab : 1) : 0;
        l.ls.visible = o > 0.003;
        if (!l.ls.visible) continue;
        bendLine(l, i === 2 ? sag * (1 - spring) : sag, i === 2 ? slide * (1 - spring) : slide);
        l.mat.opacity = o;
        l.mat.color.copy(WHITE).lerp(VEILLE, hue).multiplyScalar(2.4 - 1.2 * hue);
      }
      const w = showTongue ? smooth(0.03, 0.12, crack) * (1 - smooth(0.16, 0.42, crack)) : 0;
      flash.visible = w > 0.004;
      if (flash.visible) {
        const gc = bendG(EDGE - SC);
        flash.position.set(0, TOP + 20 - sag * gc, EDGE - SC + slide * gc);
        flash.material.opacity = w * (onBench ? S.slab : 1);
        const sz = (near > 0.5 ? 420 : 200) * (0.5 + 0.6 * w);
        flash.scale.set(sz, sz, 1);
      }

      /* crush: debris piling at the stem, a signal fringe where it grinds */
      debris.visible = S.crush > 0.01 && (!onBench || S.slab > 0.01);
      if (debris.visible) {
        for (let i = 0; i < DEB.length; i++) {
          const p = DEB[i];
          const k = smooth(p.d, p.d + 0.35, S.crush);
          _e.set(p.rx, p.ry + 0.2 * Math.sin(time * 0.8 + i), p.rz);
          _q.setFromEuler(_e);
          _v.set(p.x, p.y - (1 - k) * 30, p.z - crushD * 0.5);
          _s.set(p.s * k, p.s * 0.7 * k, p.s * k);
          _m.compose(_v, _q, _s);
          debris.setMatrixAt(i, _m);
        }
        debris.instanceMatrix.needsUpdate = true;
      }
      const fo = smooth(0, 0.3, S.crush) * (onBench ? S.slab : 1);
      fringe.visible = fo > 0.004;
      fringe.material.opacity = fo * (0.85 + 0.15 * Math.sin(time * 2.1));
      fringe.position.set(0, TOP + 3, EDGE - crushD - 6);

      /* the bench's tank */
      tank.visible = onBench && S.slab > 0.004;
      if (tank.visible) fade(tankMats, S.slab);

      /* the field */
      const field = !onBench;
      sheet.visible = field;
      chan.group.visible = field;
      ridges.group.visible = field && S.ridge > 0.01;
      crest.group.visible = field && S.crest > 0.01;
      const cut = S.section > 0.5; // the cutaway: nothing of the ice stands aft of the cut (z > 0)

      if (field) {
        // the channel: blocks with black water between them (wake 1) → packed tight (wake 0)
        const pack = 1 - S.wake;
        const grow = 1 + 0.42 * pack + 0.08 * S.close;
        for (let i = 0; i < CHAN.length; i++) {
          const b = CHAN[i];
          let z = b.z + shift - Z0;
          z = Z0 + (((z % ZP) + ZP) % ZP);
          const f = smooth(Z0, Z0 + 700, z) * (1 - smooth(Z1 - 900, Z1, z));
          if (f < 0.01 || (cut && z > 0)) {
            chan.hide(i);
            continue;
          }
          const r = b.r * grow * (0.35 + 0.65 * f);
          const inner = z < SHIP.stern ? hb(z) + r * 0.85 + 30 : (hb(SHIP.stern - 1) + r) * Math.max(0, 1 - (z - SHIP.stern) / 2600);
          const outer = notchX(z) - r * 0.8;
          const side = b.v < 0 ? -1 : 1;
          const x = side * (inner + Math.abs(b.v) * Math.max(0, outer - inner));
          const bob = S.wake * (0.3 + 0.7 * (1 - S.close));
          chan.set(i, x, TOP - ICE.thick / 2 + b.dy + 3 * bob * Math.sin(time * 0.9 + b.ph), z,
            0.03 * bob * Math.sin(time * 0.7 + b.ph), b.ry, 0.03 * bob * Math.cos(time * 0.55 + b.ph),
            r, ICE.thick, r * b.asp);
        }
        chan.commit();
      }

      if (ridges.group.visible) {
        const gap = 260 * (1 - S.grip);
        for (let i = 0; i < RID.length; i++) {
          const p = RID[i];
          const k = smooth(p.d, p.d + 0.45, S.ridge * 1.35);
          if (k < 0.01 || (cut && p.z > 0)) {
            ridges.hide(i);
            continue;
          }
          const x = p.side * (hb(p.z) + 20 + p.u + gap + p.r * 0.5);
          ridges.set(i, x, p.y * k - (1 - k) * 110, p.z, p.rx * k, p.ry, p.rz * k, p.r * (0.35 + 0.65 * k), p.t, p.r * p.asp * (0.35 + 0.65 * k));
        }
        ridges.commit();
      }
      const co = field ? S.grip * smooth(0.3, 0.8, S.ridge) : 0;
      contactMat.opacity = co * (0.85 + 0.15 * Math.sin(time * 1.3));
      contact[0].visible = co > 0.004;
      contact[1].visible = co > 0.004 && !cut;

      const zc = CREST_Z + shift;
      if (crest.group.visible) {
        const k = smooth(0, 1, S.crest);
        for (let i = 0; i < CREST.length; i++) {
          const p = CREST[i];
          const z0 = zc + p.dz;
          if (z0 < PATCH.ahead + 300 || z0 > Z1 || (cut && z0 > 0)) {
            crest.hide(i);
            continue;
          }
          let x = p.x;
          let y = p.y * k - (1 - k) * 60;
          let z = z0;
          let rz = p.rz;
          const ax = Math.abs(x);
          if (ax < TW + 150) {
            // on the tongue: it rides its sag (the part beyond the arc springs back once it breaks)
            const g = bendG(z0) * (1 - smooth(TW - 50, TW + 150, ax));
            const beyond = EDGE - z0 > SC + 150 * (x / TW) ** 2;
            y -= sag * g * (beyond ? 1 - spring : 1);
            z += slide * g * (beyond ? 1 - spring : 1);
          }
          if (wide > 0) {
            const sx = x < 0 ? -1 : 1;
            x += sx * wide * 520 * (1 - 0.6 * smooth(800, 4400, ax));
            y -= wide * 70 * (1 - smooth(1000, 1800, ax));
            rz += sx * wide * 0.45 * (1 - ax / 4400);
          }
          crest.set(i, x, y, z, p.rx, p.ry, rz, p.r, p.t * (0.4 + 0.6 * k), p.r * p.asp);
        }
        crest.commit();
      }

      /* anchors follow what they name */
      Aanch.contact.position.set(0, TOP - sag, EDGE + slide);
      const gc = bendG(EDGE - SC);
      Aanch.crack.position.set(0, TOP - sag * gc, EDGE - SC + slide * gc);
      Aanch.ridge.position.set(0, RIDGE.sail * S.crest, zc);
    },
  };
}
