// DOSSIER 045 — L'autodestruction de la fusée : THE BASE at Kourou, a MAQUETTE (plan.js: 1 km = 40 m), seen like an X-ray.
//   · the dome and its ground grid at infinity (026/src/sky.js, imported as is, `alt` 0: its steppe plane IS our ground at
//     y 0); its steppe tufts (35 m around the origin, i.e. under our launch table) are hidden
//   · the pad ELA-3, TRUE size: the table of glass on its deck (its three openings, the boosters' hold-down posts), the pit
//     and the two flame ducts east and west drawn under the ground, the concrete deck's outline, four lattice lightning
//     masts — turned 25° off the diagonals: at az −45 a mast would stand between the film's camera (az −40) and the rocket
//   · the land in fine ink lines, eaten by the fog far away, nothing solid: the savanna (shrubs, tufts near the pad,
//     stands of palms), the mangrove (crowded domes of crowns on stilt roots) and three creeks down to the coast, which
//     runs north-west → south-east like the real one; the ocean in rows of swell along it
//   · the flight corridor, THE RULE: a veille band on the ground from behind the pad eastward, widening; its two crisp
//     edges, a graduation along them, and (corridor > 0.45) its walls in lines — posts, a light curtain at ground level,
//     a top line at CORRIDOR.wall. From 0.35 to 1 the light runs from the pad toward the sea (a bright front, the edges lit
//     behind it). Its fill is masked under the debris' footprint: green and orange never add up to a fourth colour
//   · the planned path: a veille dash in the air, drawn from the pad toward the coast with `track`
//   · the debris' footprint (`fall`): a hatched signal ellipse that grows from under the breakup point; while it grows, a
//     cone of signal dashes comes down to it from the rocket, then fades
//   · the chute's ghost (`ghost`): signal dashes from the breakup point, veering south (the far side) and through the
//     corridor's far wall INSIDE the frame of VIEW.verdict between az −36 and −52; its head; `barred`: a signal cross
//     drawn stroke by stroke on the crossing (anchor `cross`), the ghost dimmed
//   · the debris' landings: small signal glows inside the footprint that light and die with `debris` (dead at 1)
//   · the CNES safety booth (BOOTH, maquette): a glass room 4.70 m high (so that, from behind the console, its lintel
//     passes over the frame), a solid console in three greys, two screens tilted toward the operator, low on the desk
//     (their top 1.41 m up: seen from behind the console it passes just under the foot of the pad). Left: the map — the
//     band, the coast, the planned route dashed, the flown trace advancing with `climb`; right: the profile — the
//     envelope, the planned curve, the trace. `alarm`: the trace drops out, turns signal, the screen's frame turns
//     signal. Nobody at the desk, no red button. Its shell is drawn after the rocket's (order 30): the rocket shows through
//   · the 046 flare: built FOUR times farther and four times bigger than TEASER — the same angle seen from the pad, but its
//     foot falls on the horizon: it reads « far away », like the 026's teaser. A guyed stack (never a lattice: the
//     pad's masts are lattices), its platforms, its pilot flame (veille) breathing slowly.
//
// buildKourou() → { group, A, update(p, time, px, eye) }
//   group  in the world's frame (world.js adds it, never moves it)
//   A      anchors: pad (the table's top), booth (the console, = world.js CONSOLE), screen (between the two screens),
//          corridor (its band near the pad), fall (the footprint's middle), teaser (the flare's tip), coast, cross (the
//          ghost's crossing of the near wall, where `barred` strikes)
//   p      { ground, corridor, track, fall, ghost, barred, salle, alarm, teaser, climb, incid, debris }
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, asShell, edgesOf, anchor, solid, box, fatLine, lineMat } from "@kit/build3d.js";
import { buildSky } from "../../026-soyouz-ms10/src/sky.js";
import { DEG, KM, ALT, DOWN, PAD, CORRIDOR, corridorHalf, FALL, GROUND, BOOTH, BOOTH_AZ, TEASER } from "./plan.js";
import { dressKourou } from "./habillage.js"; // the decorator: the pad's cold breath, the lift-off cloud, the smoke of the landings

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const f1 = (x) => x.toFixed(1);

/* ───────────────────────── the land (maquette) ───────────────────────── */

/** The coast: north-west → south-east like the real one, through GROUND.coast on the corridor's axis. */
const COAST0 = 320 * Math.sin(0.4) + 140 * Math.sin(1.3);
const coastX = (z) => GROUND.coast - 0.35 * z + 320 * Math.sin(z / 2300 + 0.4) + 140 * Math.sin(z / 830 + 1.3) - COAST0;
/** Where the mangrove takes over from the savanna (it runs to the coast). */
const mangroveX = (z) => GROUND.mangrove[0] + 900 * Math.sin(z / 3100 + 0.8) + 420 * Math.sin(z / 1300 + 2.1);
/** Three creeks winding through the mangrove to the sea. */
const CREEKS = [
  { z0: -13000, amp: 900, wl: 2100, ph: 0.3, x0: 2.4 * KM },
  { z0: 1600, amp: 650, wl: 1700, ph: 1.9, x0: 3.4 * KM },
  { z0: 12500, amp: 1100, wl: 2500, ph: 4.0, x0: 2.0 * KM },
];
const creekZ = (c, x) => c.z0 + c.amp * Math.sin(x / c.wl + c.ph) + 0.35 * c.amp * Math.sin(x / (c.wl * 0.37) + 2 * c.ph);
const creekW = (c, x) => lerp(240, 1150, clamp01((x - c.x0) / (coastX(c.z0) - c.x0)));
const inCreek = (x, z, margin = 0) => CREEKS.some((c) => x > c.x0 - 300 && Math.abs(z - creekZ(c, x)) < creekW(c, x) / 2 + margin);

/** Half the cleared concrete deck around the table (cm). */
const APRON = 4600;
/** The four lightning masts, by azimuth (stage convention): off the diagonals, out of the film's frames (see the header). */
const MAST_AZ = [20, 110, -160, -70];
const BOOTH_LEN = Math.hypot(BOOTH.at[0], BOOTH.at[2]);
const TO_PAD = [-BOOTH.at[0] / BOOTH_LEN, -BOOTH.at[2] / BOOTH_LEN];
/** Nothing grows on the deck, in the ducts, around the booth, nor across the booth's view of the pad. */
function clearOf(x, z) {
  if (Math.abs(x) < APRON + 500 && Math.abs(z) < APRON + 500) return false;
  if (Math.abs(z) < 1000 && Math.abs(x) < PAD.table.w / 2 + PAD.ducts.len + 700) return false;
  const bx = x - BOOTH.at[0];
  const bz = z - BOOTH.at[2];
  if (bx * bx + bz * bz < 2400 * 2400) return false;
  const s = bx * TO_PAD[0] + bz * TO_PAD[1];
  if (s > 0 && s < BOOTH_LEN && Math.abs(bx * TO_PAD[1] - bz * TO_PAD[0]) < 1700) return false;
  return true;
}

/** A bag of line segments, each end with its own brightness (vertex colours, multiplied by the material's colour). */
function strokes() {
  const pos = [];
  const col = [];
  const S = {
    seg(a, b, ka = 1, kb = ka) {
      pos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
      col.push(ka, ka, ka, kb, kb, kb);
    },
    poly(pts, k = 1, k2 = k) {
      const n = pts.length - 1;
      for (let i = 0; i < n; i++) S.seg(pts[i], pts[i + 1], lerp(k, k2, i / n), lerp(k, k2, (i + 1) / n));
    },
    count: () => pos.length / 6,
    build(mat, order = 3) {
      const g = new LineSegmentsGeometry();
      g.setPositions(pos);
      g.setColors(col);
      const l = new LineSegments2(g, mat);
      l.frustumCulled = false;
      l.renderOrder = order;
      return l;
    },
  };
  return S;
}
const circle = (cx, y, cz, r, n = 40) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    pts.push([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]);
  }
  return pts;
};

/** A soft glow that faces the eye: a heart and a short tail, never smaller than `minPx` pixels. */
function makeGlow(color, { size = 600, minPx = 8, gain = 1.6, order = 6 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uAmount: { value: 0 }, uLong: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uLong; varying vec2 vUv;
      void main() { vUv = vec2(uv.x * 2.0 - 1.0, (uv.y * 2.0 - 1.0)); vec3 p = position; p.y *= uLong;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        if (r2 > 1.0) discard;
        float k = exp(-r2 / 0.03) + 0.32 * exp(-r2 / 0.22) * (1.0 - r2);
        gl_FragColor = vec4(uColor * (k * uAmount * ${f1(gain)}), 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  mesh.visible = false;
  return {
    mesh,
    mat,
    /** amount 0–1; faces the eye; its radius in cm, at least minPx pixels. Nothing allocated. */
    set(amount, eye, px, k = 1) {
      mesh.visible = amount > 0.003 && !!eye;
      if (!mesh.visible) return;
      mat.uniforms.uAmount.value = amount;
      mesh.lookAt(eye);
      const dist = mesh.position.distanceTo(eye);
      mesh.scale.setScalar(Math.max(size * k, (minPx * dist) / Math.max(px, 1)));
    },
  };
}

/* ───────────────────────── the land: savanna, mangrove, creeks, coast, ocean ───────────────────────── */

function buildLand() {
  const group = new THREE.Group();
  group.name = "kourou-land";
  const rand = rng(4501);
  const R = (a, b) => a + (b - a) * rand();
  const sav = strokes();
  const tuft = strokes();
  const man = strokes();
  const water = strokes();
  const sea = strokes();

  // a dome of lines (a crown): its rim at y0, its top at y1
  const crown = (S, x, z, r, y0, y1, k) => {
    const a0 = rand() * TAU;
    const ring = [];
    for (let i = 0; i <= 8; i++) {
      const a = a0 + (i / 8) * TAU;
      const rr = r * (0.9 + 0.18 * Math.sin(3 * a + a0));
      ring.push([x + Math.cos(a) * rr, y0, z + Math.sin(a) * rr]);
    }
    S.poly(ring, k * 0.7);
    for (let j = 0; j < 2; j++) {
      const a = a0 + (j * Math.PI) / 2 + R(-0.3, 0.3);
      const arc = [];
      for (let i = 0; i <= 6; i++) {
        const t = (i / 6) * Math.PI;
        arc.push([x + Math.cos(a) * Math.cos(t) * r, y0 + Math.sin(t) * (y1 - y0), z + Math.sin(a) * Math.cos(t) * r]);
      }
      S.poly(arc, k * 0.85, k);
    }
  };
  // a savanna shrub: forked twigs from one foot
  const shrub = (x, z, h) => {
    const n = 5 + Math.floor(rand() * 4);
    for (let i = 0; i < n; i++) {
      const phi = rand() * TAU;
      const th = R(12, 55) * DEG;
      const len = h * R(0.6, 1);
      const m = [x + Math.cos(phi) * Math.sin(th) * len * 0.55, 4 + Math.cos(th) * len * 0.55, z + Math.sin(phi) * Math.sin(th) * len * 0.55];
      const th2 = th + R(8, 22) * DEG;
      const b = [m[0] + Math.cos(phi) * Math.sin(th2) * len * 0.45, m[1] + Math.cos(th2) * len * 0.45, m[2] + Math.sin(phi) * Math.sin(th2) * len * 0.45];
      sav.seg([x, 4, z], m, 0.5, 0.85);
      sav.seg(m, b, 0.85, 1);
    }
  };
  // a palm of the wet savanna: a leaning trunk, drooping fronds
  const palm = (x, z, h) => {
    const lx = R(-0.1, 0.1);
    const lz = R(-0.1, 0.1);
    const top = [x + lx * h, h, z + lz * h];
    sav.poly([[x, 4, z], [x + lx * h * 0.35, h * 0.5, z + lz * h * 0.35], top], 0.55, 0.9);
    const a0 = rand() * TAU;
    for (let i = 0; i < 7; i++) {
      const a = a0 + (i / 7) * TAU + R(-0.2, 0.2);
      const L = h * R(0.3, 0.4);
      const pts = [];
      for (let s = 0; s <= 3; s++) {
        const t = s / 3;
        pts.push([top[0] + Math.cos(a) * L * t, top[1] + L * (0.35 * t - 0.8 * t * t), top[2] + Math.sin(a) * L * t]);
      }
      sav.poly(pts, 0.95, 0.55);
    }
  };
  const grass = (x, z, h) => {
    for (let i = 0; i < 3; i++) {
      const phi = rand() * TAU;
      const th = R(10, 38) * DEG;
      tuft.seg([x, 2, z], [x + Math.cos(phi) * Math.sin(th) * h, 2 + Math.cos(th) * h, z + Math.sin(phi) * Math.sin(th) * h], 0.6, 1);
    }
  };
  const inSavanna = (x, z) => x < mangroveX(z) - 150 && clearOf(x, z);

  // the savanna: shrubs, a few round trees, stands of palms; tufts close to the pad
  for (let i = 0, n = 0; i < 4000 && n < 640; i++) {
    const x = R(-12 * KM, 2 * KM);
    const z = R(-9 * KM, 9 * KM);
    if (!inSavanna(x, z)) continue;
    shrub(x, z, R(150, 320));
    n++;
  }
  for (let i = 0, n = 0; i < 800 && n < 46; i++) {
    const x = R(-11 * KM, 1.4 * KM);
    const z = R(-8 * KM, 8 * KM);
    if (!inSavanna(x, z)) continue;
    const h = R(550, 850);
    sav.seg([x, 4, z], [x, h * 0.55, z], 0.55, 0.7);
    crown(sav, x, z, R(260, 420), h * 0.55, h, R(0.7, 0.95));
    n++;
  }
  for (let c = 0, n = 0; c < 60 && n < 9; c++) {
    const cx = R(-10 * KM, 0.8 * KM);
    const cz = R(-8 * KM, 8 * KM);
    if (!inSavanna(cx, cz)) continue;
    const m = 3 + Math.floor(rand() * 4);
    for (let j = 0; j < m; j++) {
      const x = cx + R(-900, 900);
      const z = cz + R(-900, 900);
      if (inSavanna(x, z)) palm(x, z, R(1100, 1600));
    }
    n++;
  }
  for (let i = 0, n = 0; i < 6000 && n < 1700; i++) {
    const a = rand() * TAU;
    const r = APRON + 400 + 9000 * Math.pow(rand(), 1.4);
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (!inSavanna(x, z)) continue;
    grass(x, z, R(60, 130));
    n++;
  }

  // the mangrove: crowded crowns on stilt roots, from its edge to the coast, out of the creeks
  const CELL = 1250;
  for (let gx = 1.0 * KM; gx < 9 * KM; gx += CELL) {
    for (let gz = -8 * KM; gz < 8 * KM; gz += CELL) {
      const x = gx + R(-0.4, 0.4) * CELL;
      const z = gz + R(-0.4, 0.4) * CELL;
      if (x < mangroveX(z) + R(-300, 300) || x > coastX(z) - 260 || inCreek(x, z, 220) || !clearOf(x, z)) continue;
      const r = R(380, 650);
      const h = R(700, 1150);
      crown(man, x, z, r, h * 0.48, h, R(0.75, 1));
      man.seg([x, 0, z], [x, h * 0.48, z], 0.45, 0.6);
      const a0 = rand() * TAU;
      for (let k = 0; k < 3; k++) {
        const a = a0 + (k / 3) * TAU;
        const mid = [x + Math.cos(a) * r * 0.36, h * 0.2, z + Math.sin(a) * r * 0.36];
        man.poly([[x, h * 0.3, z], mid, [x + Math.cos(a) * r * 0.62, 0, z + Math.sin(a) * r * 0.62]], 0.6, 0.4);
      }
    }
  }

  // the creeks: two banks widening toward their mouth, a faint flow along the middle
  for (const c of CREEKS) {
    const L = [];
    const Rb = [];
    const flow = [];
    const x1 = coastX(c.z0) + 400;
    for (let x = c.x0; x <= x1; x += 160) {
      const zc = creekZ(c, x);
      const w = creekW(c, x) / 2;
      L.push([x, 5, zc - w]);
      Rb.push([x, 5, zc + w]);
      flow.push([x, 5, zc]);
    }
    water.poly(L, 0.6, 0.9);
    water.poly(Rb, 0.6, 0.9);
    for (let i = 0; i < flow.length - 2; i += 4) water.seg(flow[i], flow[i + 2], 0.25, 0.3);
  }
  // the coast, and the surf beside it
  const coast = [];
  for (let z = -24 * KM; z <= 24 * KM; z += 260) coast.push([coastX(z), 6, z]);
  water.poly(coast, 1);
  for (let i = 0; i < coast.length - 1; i++) if (i % 3 !== 2) water.seg([coast[i][0] + 280, 6, coast[i][2]], [coast[i + 1][0] + 280, 6, coast[i + 1][2]], 0.45);
  // the ocean: rows of swell along the coast, farther apart and fainter out to sea
  for (let k = 0; k < 23; k++) {
    const s = 520 * Math.pow(1.24, k);
    for (let z = -20 * KM + R(0, 2000); z < 20 * KM; z += R(1300, 3100)) {
      const len = R(500, 1500) * (1 + 0.04 * k);
      sea.seg([coastX(z) + s, 4, z], [coastX(z + len) + s, 4, z + len], 0.95 - 0.025 * k);
    }
  }

  const mats = [];
  const make = (S, width, opacity) => {
    const m = lineMat(BRAND.ink, width, { opacity, vertexColors: true, fog: true });
    mats.push(m);
    group.add(S.build(m));
  };
  make(sea, 1.8, 0.22);
  make(sav, 1.8, 0.26);
  make(tuft, 1.8, 0.2);
  make(man, 1.8, 0.24);
  make(water, 2, 0.42);
  return {
    group,
    update(gr) {
      group.visible = gr > 0.004;
      for (const m of mats) m.opacity = m.userData.base * gr;
    },
  };
}

/* ───────────────────────── the pad ELA-3 (true size) ───────────────────────── */

function buildPad() {
  const group = new THREE.Group();
  group.name = "kourou-pad";
  const shell = glass(BRAND.ink, { base: 0, rim: 0.42, edge: 0.45, through: 0.18 });
  const meshes = [];
  const mats = [];
  const add = (geo, x, y, z) => {
    const m = new THREE.Mesh(geo, shell);
    m.position.set(x, y, z);
    group.add(m);
    meshes.push(m);
    const e = edgesOf(geo, { opacity: 0.6, width: 1.8 });
    e.position.copy(m.position);
    group.add(e);
    mats.push(e.material);
  };
  const T = PAD.table;
  add(box(T.w, T.h, T.d, 30), 0, T.h / 2, 0);
  // the boosters' hold-down posts, from the table's top to their aft skirts
  const postH = PAD.base - 20 - T.h;
  for (const s of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      const a = (45 + 90 * k) * DEG;
      add(box(48, postH, 48, 6), 215 * Math.cos(a), T.h + postH / 2, s * 452 + 215 * Math.sin(a));
    }
  }
  asShell(meshes);

  const S = strokes();
  // the openings the jets go down through
  S.poly(circle(0, T.h + 1, 0, 150), 1);
  for (const s of [1, -1]) S.poly(circle(0, T.h + 1, s * 452, 205), 1);
  // the pit under the table and the two flame ducts, east and west, under the ground
  const pit = { x: 1000, z: 760, y: -PAD.ducts.depth };
  const pc = [[pit.x, pit.z], [pit.x, -pit.z], [-pit.x, -pit.z], [-pit.x, pit.z], [pit.x, pit.z]];
  S.poly(pc.map(([x, z]) => [x, pit.y, z]), 0.55);
  for (const [x, z] of pc.slice(0, 4)) S.seg([x, 0, z], [x, pit.y, z], 0.4, 0.55);
  const dw = PAD.ducts.w / 2;
  for (const s of [1, -1]) {
    const xa = s * pit.x;
    const xr = s * (T.w / 2 + PAD.ducts.len * 0.72); // where the bottom starts rising
    const xb = s * (T.w / 2 + PAD.ducts.len); //        where it comes out
    for (const z of [dw, -dw]) {
      S.poly([[xa, pit.y, z], [xr, pit.y, z], [xb, 0, z]], 0.55, 0.8);
      S.seg([xa, 2, z], [xb, 2, z], 0.7);
    }
    S.seg([xb, 2, dw], [xb, 2, -dw], 0.8);
    S.seg([xr, pit.y, dw], [xr, pit.y, -dw], 0.45);
  }
  // the concrete deck: its outline, corners cut
  const c = 900;
  const A = APRON;
  S.poly([[A - c, 3, A], [-A + c, 3, A], [-A, 3, A - c], [-A, 3, -A + c], [-A + c, 3, -A], [A - c, 3, -A], [A, 3, -A + c], [A, 3, A - c], [A - c, 3, A]], 0.7);
  const lineM = lineMat(BRAND.ink, 1.8, { opacity: 0.5, vertexColors: true });
  mats.push(lineM);
  group.add(S.build(lineM));

  // the four lattice masts: legs, frames and the lightning rod always; the bracing fades away with distance
  const frame = strokes();
  const brace = strokes();
  const H = PAD.masts.h;
  const n = 14;
  const C = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
  for (const az of MAST_AZ) {
    const cx = PAD.masts.r * Math.sin(az * DEG);
    const cz = PAD.masts.r * Math.cos(az * DEG);
    const P = (i, j) => {
      const y = (j / n) * H;
      const b = lerp(210, 70, y / H);
      return [cx + C[i][0] * b, y, cz + C[i][1] * b];
    };
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < 4; i++) {
        frame.seg(P(i, j), P(i, j + 1), 1);
        frame.seg(P(i, j + 1), P((i + 1) % 4, j + 1), 0.75);
        brace.seg(P(i, j), P((i + 1) % 4, j + 1), 0.8);
        brace.seg(P((i + 1) % 4, j), P(i, j + 1), 0.8);
      }
    }
    frame.seg([cx, H, cz], [cx, H + 650, cz], 1);
  }
  const mastM = lineMat(BRAND.ink, 1.8, { opacity: 0.62, vertexColors: true });
  const braceM = lineMat(BRAND.ink, 1.8, { opacity: 0.36, vertexColors: true });
  mats.push(mastM);
  group.add(frame.build(mastM), brace.build(braceM));

  return {
    group,
    update(gr, eye) {
      group.visible = gr > 0.004;
      shell.uniforms.uAmount.value = gr;
      for (const m of mats) m.opacity = m.userData.base * gr;
      const d = eye ? eye.length() : 20000;
      braceM.opacity = braceM.userData.base * gr * (1 - smooth(16000, 40000, d));
    },
  };
}

/* ───────────────────────── the corridor (the rule) and the planned path ───────────────────────── */

function buildCorridor() {
  const group = new THREE.Group();
  group.name = "kourou-corridor";
  const { x0: X0, x1: X1, half0: H0, half1: H1, wall: WALL } = CORRIDOR;
  const FAR0 = X1 - 0.3 * (X1 - X0);
  const farK = (x) => 1 - smooth(FAR0, X1, x);

  // the band: a shader on a rectangle that holds it — brighter along its edges, masked under the footprint
  const bandMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: VEILLE.clone() }, uAmount: { value: 0.35 }, uFront: { value: X0 - 2400 }, uEll: { value: new THREE.Vector4(0, 1, 1, 0) } },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uFront; uniform vec4 uEll; varying vec3 vW;
      void main() {
        float x = vW.x;
        float z = abs(vW.z);
        float t = clamp((x - ${f1(X0)}) / ${f1(X1 - X0)}, 0.0, 1.0);
        float hw = ${f1(H0)} + ${f1(H1 - H0)} * t;
        if (x < ${f1(X0)} || z > hw) discard;
        float edge = (hw - z) / hw; // 0 on the edge, 1 on the axis
        float fill = 0.008 + 0.04 * exp(-edge / 0.08);
        float lit = 1.0 - smoothstep(uFront - 900.0, uFront + 900.0, x);
        float b = min(uAmount, 0.35) + 0.65 * lit;
        float run = step(0.36, uAmount) * (1.0 - step(0.995, uAmount));
        float front = run * 0.22 * exp(-abs(x - uFront) / 500.0);
        vec2 e = vec2((x - uEll.x) / max(uEll.y, 1.0), vW.z / max(uEll.z, 1.0));
        float m = uEll.w * (1.0 - smoothstep(0.75, 1.05, dot(e, e)));
        float far = 1.0 - smoothstep(${f1(FAR0)}, ${f1(X1)}, x);
        gl_FragColor = vec4(uColor * (fill * b * (1.0 - 0.92 * m) + front) * far, 1.0);
      }`,
  });
  const bandGeo = new THREE.PlaneGeometry(X1 - X0 + 2000, 2 * H1 + 2000);
  bandGeo.rotateX(-Math.PI / 2);
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.position.set((X0 + X1) / 2, 6, 0);
  band.renderOrder = 1;
  band.frustumCulled = false;
  group.add(band);

  // the edges: a base line (the band at rest) and a lit line that follows the front; segment i of both sides side by side
  const N = 136;
  const xs = (i) => lerp(X0, X1, i / N);
  const base = strokes();
  const lit = strokes();
  for (let i = 0; i < N; i++) {
    for (const s of [1, -1]) {
      const a = [xs(i), 10, s * corridorHalf(xs(i))];
      const b = [xs(i + 1), 10, s * corridorHalf(xs(i + 1))];
      base.seg(a, b, farK(a[0]), farK(b[0]));
      lit.seg(a, b, farK(a[0]), farK(b[0]));
    }
  }
  base.seg([X0, 10, -H0], [X0, 10, H0], 1); // where it starts, behind the pad
  const baseM = lineMat(BRAND.veille, 2.2, { opacity: 0.55, vertexColors: true });
  const litM = lineMat(BRAND.veille, 2.6, { opacity: 1, vertexColors: true, hdr: 1.25 });
  const litLine = lit.build(litM, 4);
  group.add(base.build(baseM), litLine);

  // the graduation along the edges (the rule): a tick every kilometre, a longer one every four
  const ticks = strokes();
  for (let x = 0; x <= X1 - 1; x += KM) {
    const L = Math.round(x / KM) % 4 === 0 ? 1500 : 650;
    for (const s of [1, -1]) {
      const h = corridorHalf(x);
      ticks.seg([x, 10, s * h], [x, 10, s * (h - L)], farK(x), 0);
    }
  }
  const tickM = lineMat(BRAND.veille, 2, { opacity: 0.5, vertexColors: true });
  group.add(ticks.build(tickM));

  // the walls, in lines: posts every 2 km fading upward, the top line, and a light curtain at ground level
  const walls = strokes();
  for (let x = 0; x <= X1 - 1; x += 2 * KM) {
    for (const s of [1, -1]) {
      const z = s * corridorHalf(x);
      walls.seg([x, 10, z], [x, WALL * 0.5, z], 0.9 * farK(x), 0.18 * farK(x));
      walls.seg([x, WALL * 0.5, z], [x, WALL, z], 0.18 * farK(x), 0.05 * farK(x));
    }
  }
  for (let i = 0; i < N; i += 2) {
    for (const s of [1, -1]) {
      const a = [xs(i), WALL, s * corridorHalf(xs(i))];
      const b = [xs(i + 2), WALL, s * corridorHalf(xs(i + 2))];
      walls.seg(a, b, 0.32 * farK(a[0]), 0.32 * farK(b[0]));
    }
  }
  const wallM = lineMat(BRAND.veille, 1.9, { opacity: 0.4, vertexColors: true });
  group.add(walls.build(wallM));

  const CURTAIN = 2600;
  const cPos = [];
  const cIdx = [];
  for (const s of [1, -1]) {
    const o = cPos.length / 3;
    for (let i = 0; i <= N; i++) cPos.push(xs(i), 0, s * corridorHalf(xs(i)), xs(i), CURTAIN, s * corridorHalf(xs(i)));
    for (let i = 0; i < N; i++) {
      const a = o + 2 * i;
      cIdx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const cGeo = new THREE.BufferGeometry();
  cGeo.setAttribute("position", new THREE.Float32BufferAttribute(cPos, 3));
  cGeo.setIndex(cIdx);
  const curtainMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: VEILLE.clone() }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vXY;
      void main() { vXY = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vXY;
      void main() {
        float k = exp(-max(vXY.y, 0.0) / 520.0) * (1.0 - smoothstep(${f1(FAR0)}, ${f1(X1)}, vXY.x));
        gl_FragColor = vec4(uColor * (0.045 * k * uAmount), 1.0);
      }`,
  });
  const curtain = new THREE.Mesh(cGeo, curtainMat);
  curtain.renderOrder = 1;
  curtain.frustumCulled = false;
  group.add(curtain);

  // the front: a bright line across the band, running east as the band lights up
  const fs = strokes();
  fs.seg([0, 12, -1], [0, 12, 1], 1);
  const frontM = lineMat(BRAND.veille, 3, { opacity: 0.9, vertexColors: true, hdr: 1.4 });
  const front = fs.build(frontM, 4);
  group.add(front);

  // the planned path in the air: the flight's parabola (plan.js flightAt) carried on past the breakup toward the coast
  const TRACK_END = 2.6;
  const NT = 150;
  const trackPts = [];
  for (let i = 0; i <= NT; i++) {
    const u = (i / NT) * TRACK_END;
    trackPts.push([DOWN * u * u, PAD.base + (ALT - PAD.base) * u, 0]);
  }
  const track = fatLine(trackPts, { color: BRAND.veille, width: 2.2, opacity: 0.85, dashed: true, dashSize: 700, gapSize: 520 });
  track.material.color.multiplyScalar(1.15);
  track.frustumCulled = false;
  track.visible = false;
  group.add(track);

  const ellK = { cx: (FALL.x0 + FALL.x1) / 2, rx: (FALL.x1 - FALL.x0) / 2, rz: FALL.half };
  return {
    group,
    track,
    update(co, tr, fall) {
      const on = co > 0.004;
      band.visible = on;
      const u = clamp01((co - 0.35) / 0.65);
      const fx = co <= 0.35 ? X0 - 2400 : lerp(X0 - 1200, X1 + 1200, u);
      bandMat.uniforms.uAmount.value = co;
      bandMat.uniforms.uFront.value = fx;
      const s = clamp01(fall);
      bandMat.uniforms.uEll.value.set(DOWN + (ellK.cx - DOWN) * s, Math.max(1, ellK.rx * s), Math.max(1, ellK.rz * s), s > 0.002 ? 1 : 0);
      baseM.opacity = 0.55 * Math.min(co, 0.35) / 0.35;
      const nLit = Math.round(clamp01((fx - X0) / (X1 - X0)) * N);
      litLine.visible = on && co > 0.35 && nLit > 0;
      litLine.geometry.instanceCount = 2 * Math.max(nLit, 1);
      tickM.opacity = 0.5 * smooth(0.2, 1, co);
      const w = smooth(0.45, 1, co);
      wallM.opacity = 0.4 * w;
      curtainMat.uniforms.uAmount.value = w;
      curtain.visible = w > 0.003;
      front.visible = co > 0.36 && co < 0.995 && fx < X1;
      front.position.x = fx;
      front.scale.z = corridorHalf(fx);
      group.visible = on || tr > 0.002;
      // the planned path draws itself from the pad
      const t = clamp01(tr);
      track.visible = t > 0.002;
      track.geometry.instanceCount = Math.max(1, Math.round(t * NT));
      track.material.opacity = 0.85 * smooth(0, 0.12, t);
    },
  };
}

/* ───────────────────────── the footprint, the debris' glows ───────────────────────── */

function buildFall() {
  const group = new THREE.Group();
  group.name = "kourou-fall";
  const cx = (FALL.x0 + FALL.x1) / 2;
  const rx = (FALL.x1 - FALL.x0) / 2;
  const rz = FALL.half;
  // the footprint grows from under the breakup point (x = DOWN): its group stands there, scaled by `fall`
  const foot = new THREE.Group();
  foot.position.set(DOWN, 14, 0);
  group.add(foot);
  const ell = [];
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * TAU;
    ell.push([cx - DOWN + rx * Math.cos(a), 0, rz * Math.sin(a)]);
  }
  const outline = fatLine(ell, { color: BRAND.signal, width: 2.4, opacity: 0.9 });
  outline.frustumCulled = false;
  foot.add(outline);
  const hatch = strokes();
  const A = 1 / (rx * rx) + 1 / (rz * rz);
  for (let c = -(rx + rz); c <= rx + rz; c += 760) {
    // the line x' = z + c (x' from the ellipse's middle) across the ellipse
    const B = (2 * c) / (rx * rx);
    const Cc = (c * c) / (rx * rx) - 1;
    const disc = B * B - 4 * A * Cc;
    if (disc <= 0) continue;
    const za = (-B - Math.sqrt(disc)) / (2 * A);
    const zb = (-B + Math.sqrt(disc)) / (2 * A);
    hatch.seg([za + c + cx - DOWN, 0, za], [zb + c + cx - DOWN, 0, zb], 1);
  }
  const hatchM = lineMat(BRAND.signal, 1.8, { opacity: 0.34, vertexColors: true });
  foot.add(hatch.build(hatchM));

  // the cone of the fall, from the breakup point down to the growing footprint (it fades once the footprint is laid)
  const cone = new THREE.Group();
  cone.position.set(DOWN, ALT, 0);
  group.add(cone);
  const coneM = [];
  for (const [ex, ez] of [[cx - rx, 0], [cx + rx, 0], [cx, rz], [cx, -rz]]) {
    const l = fatLine([[0, 0, 0], [ex - DOWN, 14 - ALT, ez]], { color: BRAND.signal, width: 2, opacity: 0.5, dashed: true, dashSize: 500, gapSize: 420 });
    l.frustumCulled = false;
    cone.add(l);
    coneM.push(l.material);
  }

  // the landings: glows inside the footprint, the mangrove first, the savanna last; each lights, then dies
  const rand = rng(4507);
  const NGL = 28;
  const centre = [];
  const corner = [];
  const thr = [];
  const size = [];
  const idx = [];
  for (let n = 0, tries = 0; n < NGL && tries < 2000; tries++) {
    const x = cx + rx * (rand() * 2 - 1);
    const z = rz * (rand() * 2 - 1);
    const e = ((x - cx) / rx) ** 2 + (z / rz) ** 2;
    if (e > 0.85) continue;
    const t = x > mangroveX(z) ? 0.5 + 0.22 * rand() : 0.72 + 0.12 * rand();
    const s = 420 + 520 * rand();
    for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      centre.push(x, 40, z);
      corner.push(u, v);
      thr.push(t);
      size.push(s);
    }
    const o = 4 * n;
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
    n++;
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute("position", new THREE.Float32BufferAttribute(centre, 3));
  gGeo.setAttribute("aCorner", new THREE.Float32BufferAttribute(corner, 2));
  gGeo.setAttribute("aT", new THREE.Float32BufferAttribute(thr, 1));
  gGeo.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));
  gGeo.setIndex(idx);
  const glowMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL.clone() }, uDebris: { value: 0 }, uAmount: { value: 1 }, uPx: { value: 1000 } },
    vertexShader: /* glsl */ `
      attribute vec2 aCorner; attribute float aT; attribute float aSize;
      uniform float uDebris, uPx; varying vec2 vUv; varying float vK;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float dist = max(-mv.z, 1.0);
        float s = max(aSize, 7.0 * dist / max(uPx, 1.0));
        mv.xy += aCorner * s;
        gl_Position = projectionMatrix * mv;
        float since = uDebris - aT;
        vK = clamp(since / 0.015, 0.0, 1.0) * exp(-max(since - 0.015, 0.0) / 0.045);
        vUv = aCorner;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vUv; varying float vK;
      void main() {
        float r2 = dot(vUv, vUv);
        if (r2 > 1.0 || vK < 0.002) discard;
        float k = exp(-r2 / 0.03) + 0.3 * exp(-r2 / 0.22) * (1.0 - r2);
        gl_FragColor = vec4(uColor * (k * vK * uAmount * 1.7), 1.0);
      }`,
  });
  const glows = new THREE.Mesh(gGeo, glowMat);
  glows.frustumCulled = false;
  glows.renderOrder = 5;
  group.add(glows);

  return {
    group,
    centre: [cx, 0, 0],
    update(fall, debris, gr, px) {
      const s = clamp01(fall);
      foot.visible = s > 0.002;
      foot.scale.set(Math.max(s, 0.001), 1, Math.max(s, 0.001));
      outline.material.opacity = 0.9 * smooth(0, 0.08, s);
      hatchM.opacity = 0.34 * smooth(0, 0.15, s);
      const k = s > 0.002 && s < 0.998 ? Math.pow(Math.sin(Math.PI * s), 0.8) : 0;
      cone.visible = k > 0.003;
      cone.scale.set(Math.max(s, 0.001), 1, Math.max(s, 0.001));
      for (const m of coneM) m.opacity = 0.5 * k;
      const d = clamp01(debris);
      glows.visible = d > 0.49 && gr > 0.004;
      glowMat.uniforms.uDebris.value = d;
      glowMat.uniforms.uAmount.value = gr;
      glowMat.uniforms.uPx.value = px;
      group.visible = foot.visible || cone.visible || glows.visible;
    },
  };
}

/* ───────────────────────── the ghost, its strike ───────────────────────── */

function buildGhost() {
  const group = new THREE.Group();
  group.name = "kourou-ghost";
  // from the breakup point, the path it would have flown on: on over, then veering south (the far side: the vertical
  // frame is too narrow on the camera's side, a crossing there leaves it), through the far wall, down outside the band
  const P = [[DOWN, ALT, 0], [DOWN + 2500, ALT + 1000, -2500], [DOWN + 6500, ALT - 5000, -9500], [DOWN + 8000, 0, -15000]];
  const bez = (t, k) => {
    const u = 1 - t;
    return u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k];
  };
  const NG = 96;
  const pts = [];
  const flat = new Float32Array((NG + 1) * 3);
  let cross = null;
  for (let i = 0; i <= NG; i++) {
    const t = i / NG;
    const p = [bez(t, 0), bez(t, 1), bez(t, 2)];
    pts.push(p);
    flat.set(p, i * 3);
    if (!cross && i > 0 && -p[2] > corridorHalf(p[0])) cross = p;
  }
  const line = fatLine(pts, { color: BRAND.signal, width: 6, opacity: 1, dashed: true, dashSize: 1500, gapSize: 500 });
  line.frustumCulled = false;
  line.visible = false;
  group.add(line);
  const head = makeGlow(BRAND.signal, { size: 520, minPx: 9, gain: 1.6 });
  group.add(head.mesh);
  // where it would have come down: a ring on the ground, outside the band
  const ringG = new THREE.Group();
  ringG.position.set(P[3][0], 16, P[3][2]);
  group.add(ringG);
  const ring = fatLine(circle(0, 0, 0, 1600, 48), { color: BRAND.signal, width: 2.4, opacity: 0.8 });
  ring.frustumCulled = false;
  ringG.add(ring);
  const pin = fatLine([[P[3][0], 0, P[3][2]], [P[3][0], 2600, P[3][2]]], { color: BRAND.signal, width: 2.4, opacity: 0.8 });
  pin.frustumCulled = false;
  pin.geometry.setColors([1, 1, 1, 0, 0, 0]);
  pin.material.vertexColors = true;
  group.add(pin);
  // the strike: a cross on the crossing, facing the eye, drawn stroke by stroke
  const X = new THREE.Group();
  X.position.set(...cross);
  group.add(X);
  const NX = 12;
  const S = 2600;
  const strokeLine = (sx) => {
    const p = [];
    for (let i = 0; i <= NX; i++) {
      const t = i / NX;
      p.push([lerp(-S, S, t), lerp(sx * S, -sx * S, t) * 0.92, 0]);
    }
    const l = fatLine(p, { color: BRAND.signal, width: 7, opacity: 1 });
    l.material.color.multiplyScalar(1.3);
    l.frustumCulled = false;
    X.add(l);
    return l;
  };
  const s1 = strokeLine(-1);
  const s2 = strokeLine(1);

  return {
    group,
    cross,
    update(gh, ba, eye, px) {
      const g = clamp01(gh);
      const b = clamp01(ba);
      line.visible = g > 0.002;
      group.visible = line.visible || b > 0.002;
      if (!group.visible) {
        head.mesh.visible = false;
        return;
      }
      line.geometry.instanceCount = Math.max(1, Math.round(g * NG));
      line.material.opacity = 1 - 0.35 * smooth(0, 0.6, b);
      // its head while it draws
      const f = g * NG;
      const i = Math.min(Math.floor(f), NG - 1);
      const u = f - i;
      head.mesh.position.set(lerp(flat[i * 3], flat[i * 3 + 3], u), lerp(flat[i * 3 + 1], flat[i * 3 + 4], u), lerp(flat[i * 3 + 2], flat[i * 3 + 5], u));
      head.set(g > 0.002 ? 1 - smooth(0.94, 1, g) : 0, eye, px);
      const r = smooth(0.9, 1, g);
      ringG.visible = r > 0.003;
      ringG.scale.set(Math.max(r, 0.001), 1, Math.max(r, 0.001));
      ring.material.opacity = 0.8 * r * (1 - 0.5 * b);
      pin.visible = ringG.visible;
      pin.material.opacity = 0.9 * r * (1 - 0.5 * b);
      X.visible = b > 0.002;
      if (X.visible) {
        if (eye) X.lookAt(eye);
        const n1 = Math.round(clamp01(b * 2) * NX);
        const n2 = Math.round(clamp01(b * 2 - 1) * NX);
        s1.visible = n1 > 0;
        s2.visible = n2 > 0;
        s1.geometry.instanceCount = Math.max(n1, 1);
        s2.geometry.instanceCount = Math.max(n2, 1);
      }
    },
  };
}

/* ───────────────────────── the CNES safety booth ───────────────────────── */

const ROOM = { w: BOOTH.w, d: BOOTH.d, h: 470 };
const SCREEN = { w: 64, h: 40, bezel: 3, tilt: 18, gap: 6 };
const DESK = { z: 140, top: 98 };

/** A screen's picture: 0 the map (the band, the coast, the planned route, the flown trace), 1 the profile. */
function screenMat(kind) {
  const A = (SCREEN.w / SCREEN.h).toFixed(4);
  return new THREE.ShaderMaterial({
    transparent: true,
    defines: { KIND: kind },
    uniforms: {
      uAmount: { value: 0 }, uClimb: { value: 0 }, uAlarm: { value: 0 },
      uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() }, uSignal: { value: SIGNAL.clone() },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount, uClimb, uAlarm; uniform vec3 uInk, uVeille, uSignal; varying vec2 vUv;
      const float A = ${A};
      const float X0 = 0.16;
      const float X1 = ${A} - 0.1;
      float px;
      // a line of w pixels at distance d (the same units as px)
      float ln(float d, float w) { float h = 0.5 * w * px; return 1.0 - smoothstep(h, h + px, d); }
      float baseY(float x) {
      #if KIND == 0
        return 0.5;
      #else
        float t = clamp((x - X0) / (X1 - X0), 0.0, 1.0);
        return 0.15 + 0.66 * (1.0 - (1.0 - t) * (1.0 - t));
      #endif
      }
      float baseSlope(float x) {
      #if KIND == 0
        return 0.0;
      #else
        float t = clamp((x - X0) / (X1 - X0), 0.0, 1.0);
        return 0.66 * 2.0 * (1.0 - t) / (X1 - X0);
      #endif
      }
      void main() {
        vec2 p = vec2(vUv.x * A, vUv.y);
        px = max(max(fwidth(p.x), fwidth(p.y)), 1e-5);
        vec3 col = vec3(0.010, 0.012, 0.014);
        vec2 g = abs(fract(p * 8.0 + 0.5) - 0.5) / 8.0;
        col += uInk * 0.035 * ln(min(g.x, g.y), 1.0);
        float climb = clamp(uClimb, 0.0, 1.0);
        float al = clamp(uAlarm, 0.0, 1.0);
        float xh = X0 + (X1 - X0) * 0.94 * pow(climb, 0.6); // the head: where the rocket is
        float xv = X0 + (X1 - X0) * 0.80;                    // where it veers
        float span = max(xh - xv, 0.05);
        float inX = step(X0, p.x) * step(p.x, X1);
      #if KIND == 0
        // the map: the corridor's band from the pad (left) toward the sea (right), the coast, the swell
        float t = clamp((p.x - X0) / (X1 - X0), 0.0, 1.0);
        float hw = 0.075 + 0.24 * t;
        float dy = abs(p.y - 0.5);
        float band = step(X0 - 0.05, p.x);
        col += uVeille * 0.10 * band * (1.0 - smoothstep(hw - px, hw, dy));
        col += uVeille * 0.95 * band * ln(abs(dy - hw), 2.0);
        col += uVeille * 0.6 * ln(abs(p.x - (X0 - 0.05)), 2.0) * step(dy, 0.075);
        float xc = A * 0.70 - 0.16 * (p.y - 0.5) + 0.012 * sin(p.y * 23.0);
        col += uInk * 0.42 * ln(abs(p.x - xc), 1.6);
        float row = abs(fract(p.y * 14.0) - 0.5) / 14.0;
        col += uInk * 0.08 * step(xc + 0.02, p.x) * ln(row, 1.2) * step(0.45, fract(p.x * 7.0 + floor(p.y * 14.0) * 0.37));
        col += uInk * 0.8 * ln(abs(length(p - vec2(X0, 0.5)) - 0.03), 1.8); // the pad
        float dev = -0.40 * al; // it leaves the band upward: north
      #else
        // the profile: height against time, the envelope around the planned curve, the axes
        float yb = baseY(p.x);
        float sb = baseSlope(p.x);
        float hw = 0.045 + 0.05 * clamp((p.x - X0) / (X1 - X0), 0.0, 1.0);
        float dp = abs(p.y - yb) / sqrt(1.0 + sb * sb);
        col += uVeille * 0.10 * inX * (1.0 - smoothstep(hw - px, hw, dp));
        col += uVeille * 0.95 * inX * ln(abs(dp - hw), 2.0);
        col += uInk * 0.36 * (ln(abs(p.y - 0.1), 1.6) * step(0.1, p.x) + ln(abs(p.x - 0.1), 1.6) * step(0.1, p.y));
        float dev = 0.50 * al; // it drops off the curve
      #endif
        // the planned route, dashed
        float dash = step(fract(p.x * 18.0), 0.55);
        col += uVeille * 0.5 * dash * inX * ln(abs(p.y - baseY(p.x)) / sqrt(1.0 + baseSlope(p.x) * baseSlope(p.x)), 1.6);
        // the flown trace, up to the head; past the veer it bends away with the alarm
        float k = max(p.x - xv, 0.0) / span;
        float yf = baseY(p.x) - dev * k * k;
        float sf = baseSlope(p.x) - 2.0 * dev * k / span;
        float d = abs(p.y - yf) / sqrt(1.0 + sf * sf);
        float onTrace = step(X0, p.x) * (1.0 - smoothstep(xh, xh + px, p.x));
        vec3 tc = mix(uVeille, uSignal, al * smoothstep(xv - 0.02, xv + 0.08, p.x));
        col += tc * 1.5 * onTrace * ln(d, 2.6);
        float kh = max(xh - xv, 0.0) / span;
        vec2 hp = vec2(xh, baseY(xh) - dev * kh * kh);
        float hd = length(p - hp);
        vec3 hc = mix(uVeille, uSignal, al * step(xv, xh));
        col += hc * (1.6 * ln(hd, 7.0) + 0.35 * exp(-hd / (7.0 * px)));
        // the screen's frame: it turns signal with the alarm
        float bd = min(min(vUv.x, 1.0 - vUv.x) * A, min(vUv.y, 1.0 - vUv.y));
        col += mix(uInk * 0.22, uSignal * 1.1, al) * ln(abs(bd - 0.02), 2.0);
        gl_FragColor = vec4(col, clamp(uAmount, 0.0, 1.0));
      }`,
  });
}

function buildBooth() {
  const booth = new THREE.Group();
  booth.name = "kourou-booth";
  booth.position.set(...BOOTH.at);
  booth.rotation.y = BOOTH_AZ * DEG + Math.PI; // its window (local +z) faces the pad
  // the room of glass: drawn after the rocket's shell (order 30), so the rocket shows through it; no veil behind
  const shell = glass(BRAND.ink, { base: 0, rim: 0.38, edge: 0.45 });
  const roomGeo = box(ROOM.w, ROOM.h, ROOM.d, 8);
  const room = new THREE.Mesh(roomGeo, shell);
  room.position.y = ROOM.h / 2;
  const roofGeo = box(ROOM.w + 60, 16, ROOM.d + 60, 4);
  const roof = new THREE.Mesh(roofGeo, shell);
  roof.position.y = ROOM.h + 8;
  booth.add(room, roof);
  asShell([room, roof], 30);
  const mats = [];
  for (const [geo, y, op] of [[roomGeo, ROOM.h / 2, 0.55], [roofGeo, ROOM.h + 8, 0.45]]) {
    const e = edgesOf(geo, { opacity: op, width: 1.8 });
    e.position.y = y;
    booth.add(e);
    mats.push(e.material);
  }
  // the window's mullions and the floor's outline
  const fr = strokes();
  for (const sx of [-1, 1]) fr.seg([(sx * ROOM.w) / 4, 0, ROOM.d / 2], [(sx * ROOM.w) / 4, ROOM.h, ROOM.d / 2], 1);
  for (const sx of [-1, 1]) fr.seg([(sx * ROOM.w) / 4, 0, -ROOM.d / 2], [(sx * ROOM.w) / 4, ROOM.h, -ROOM.d / 2], 0.6);
  const frM = lineMat(BRAND.ink, 1.8, { opacity: 0.4, vertexColors: true });
  mats.push(frM);
  booth.add(fr.build(frM));

  // the console, solid, three greys: the body, its top, the bezels and keyboard
  const bodyM = solid(0x3d4349, { rough: 0.62, metal: 0.25 });
  const topM = solid(0x646b73, { rough: 0.5, metal: 0.2 });
  const darkM = solid(0x23272c, { rough: 0.42, metal: 0.3 });
  const solids = [bodyM, topM, darkM];
  for (const m of solids) m.transparent = true;
  const body = new THREE.Mesh(box(176, DESK.top - 5, 58, 3), bodyM);
  body.position.set(0, (DESK.top - 5) / 2, DESK.z);
  const top = new THREE.Mesh(box(188, 5, 70, 1.5), topM);
  top.position.set(0, DESK.top - 2.5, DESK.z);
  const kb = new THREE.Mesh(box(58, 2.2, 17, 0.8), darkM);
  kb.position.set(0, DESK.top + 1.1, DESK.z - 20);
  booth.add(body, top, kb);
  // the two screens, tilted back toward the operator: left (seen from behind the desk) the map, right the profile
  const screens = [];
  const sw = SCREEN.w + 2 * SCREEN.bezel;
  const sh = SCREEN.h + 2 * SCREEN.bezel;
  for (const [kind, sx] of [[0, 1], [1, -1]]) {
    const sg = new THREE.Group();
    sg.position.set((sx * (sw + SCREEN.gap)) / 2, DESK.top, DESK.z + 16);
    sg.rotation.order = "YXZ";
    sg.rotation.y = Math.PI;
    sg.rotation.x = -SCREEN.tilt * DEG;
    booth.add(sg);
    const bez = new THREE.Mesh(box(sw, sh, 3.2, 0.8), darkM);
    bez.position.set(0, sh / 2, -1.7);
    const neck = new THREE.Mesh(box(14, 22, 4, 0.8), darkM);
    neck.position.set(0, 14, -5);
    const m = screenMat(kind);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.w, SCREEN.h), m);
    face.position.set(0, sh / 2, 0.15);
    sg.add(bez, neck, face);
    screens.push(m);
  }
  const A = {
    booth: anchor(booth, 0, BOOTH.desk + 30, 120), // = world.js CONSOLE
    screen: anchor(booth, 0, DESK.top + (sh / 2) * Math.cos(SCREEN.tilt * DEG), DESK.z + 16 + (sh / 2) * Math.sin(SCREEN.tilt * DEG)),
  };
  return {
    group: booth,
    A,
    update(sa, climb, alarm) {
      booth.visible = sa > 0.004;
      if (!booth.visible) return;
      shell.uniforms.uAmount.value = 0.9 * sa;
      for (const m of mats) m.opacity = m.userData.base * sa;
      for (const m of solids) m.opacity = sa;
      for (const m of screens) {
        m.uniforms.uAmount.value = sa;
        m.uniforms.uClimb.value = climb;
        m.uniforms.uAlarm.value = alarm;
      }
    },
  };
}

/* ───────────────────────── the 046 flare, far ───────────────────────── */

const FLARE_FAR = 4;

function buildFlare() {
  const group = new THREE.Group();
  group.name = "kourou-teaser";
  const base = new THREE.Group();
  base.position.set(TEASER.at[0] * FLARE_FAR, 0, TEASER.at[2] * FLARE_FAR);
  group.add(base);
  const tower = new THREE.Group(); // built true size, scaled FLARE_FAR; it rises with `teaser`
  base.add(tower);
  // 0.62 of TEASER.h (56 m true size): seen from the pad it stands ≈ 6.7° tall — it fits between the next file's panel
  // (the top zone, 436–790 px) and the captions, its pilot flame clear of the panel
  const H = TEASER.h * 0.62;
  const r = TEASER.r;
  const shell = glass(BRAND.ink, { base: 0, rim: 0.6, edge: 0.65 });
  // a flare stack, not a lattice (the pad's masts are lattices: the two must never be confused) — a tall tapered
  // chimney on a wider skirt, its tip, three platforms, guy wires down to three anchors
  const stackGeo = new THREE.CylinderGeometry(r * 0.8, r * 1.1, H, 24, 1, true);
  stackGeo.translate(0, H / 2, 0);
  const skirtGeo = new THREE.CylinderGeometry(r * 1.15, r * 2.4, H * 0.08, 24, 1, true);
  skirtGeo.translate(0, H * 0.04, 0);
  const tipGeo = new THREE.CylinderGeometry(r * 1.5, r * 1.05, H * 0.035, 24);
  tipGeo.translate(0, H * 1.0175, 0);
  const meshes = [stackGeo, skirtGeo, tipGeo].map((g) => new THREE.Mesh(g, shell));
  tower.add(...meshes);
  asShell(meshes, 12); // the farthest glass: drawn first, never hidden by a nearer shell
  const S = strokes();
  for (const f of [0.42, 0.7, 0.92]) {
    S.poly(circle(0, H * f, 0, r * 2.6, 20), 0.9);
    S.poly(circle(0, H * f + 220, 0, r * 2.6, 20), 0.5);
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + 0.5;
    for (const f of [0.66, 0.9]) S.seg([r * Math.cos(a), H * f, r * Math.sin(a)], [H * 0.42 * Math.cos(a), 0, H * 0.42 * Math.sin(a)], 0.75, 0.35);
  }
  S.poly(circle(0, H * 1.035, 0, r * 1.5, 16), 1);
  const lineM = lineMat(BRAND.ink, 1.8, { opacity: 0.55, vertexColors: true });
  tower.add(S.build(lineM));
  tower.scale.setScalar(FLARE_FAR);
  // the pilot flame: a heart and a tongue (veille: the next file's system, always lit), breathing slowly
  const halo = makeGlow(BRAND.veille, { size: 3200, minPx: 18, gain: 1.4, order: 7 });
  const tongue = makeGlow(BRAND.veille, { size: 1300, minPx: 8, gain: 2, order: 7 });
  group.add(halo.mesh, tongue.mesh);
  const tipY = H * 1.035;
  return {
    group,
    A: { teaser: anchor(tower, 0, tipY, 0) },
    update(te, time, eye, px) {
      const t = clamp01(te);
      group.visible = t > 0.004;
      if (!group.visible) {
        halo.mesh.visible = false;
        tongue.mesh.visible = false;
        return;
      }
      const rise = smooth(0, 0.5, t);
      tower.scale.set(FLARE_FAR, FLARE_FAR * lerp(0.22, 1, rise), FLARE_FAR);
      shell.uniforms.uAmount.value = 0.85 * rise;
      lineM.opacity = 0.55 * rise;
      const lit = smooth(0.5, 1, t);
      const breath = 0.86 + 0.14 * Math.sin(time * 2.1) * Math.sin(time * 0.73 + 1.1);
      const y = tipY * FLARE_FAR * lerp(0.22, 1, rise);
      halo.mesh.position.set(base.position.x, y + 1200, base.position.z);
      tongue.mesh.position.set(base.position.x, y + 2200, base.position.z);
      tongue.mat.uniforms.uLong.value = 2.2;
      halo.set(lit * breath * 0.8, eye, px);
      tongue.set(lit * breath, eye, px, 0.85 + 0.15 * breath);
    },
  };
}

/* ───────────────────────── the base ───────────────────────── */

export function buildKourou() {
  const group = new THREE.Group();
  group.name = "kourou";

  // the dome and the ground grid at infinity (026), its steppe plane on y 0
  const sky = buildSky();
  group.add(sky.group);
  const SKY = { alt: 0, pitch: 0, flown: 0, airspeed: 0, heat: 0, chute: 0, retro: 0, truck: 0 };
  let tufts = null;
  sky.group.traverse((o) => {
    if (o.name === "habillage-steppe") tufts = o;
  });
  const dome = sky.group.children.find((o) => o.material?.uniforms?.uInk);

  const land = buildLand();
  const pad = buildPad();
  const corridor = buildCorridor();
  const fall = buildFall();
  const ghost = buildGhost();
  const booth = buildBooth();
  const flare = buildFlare();
  group.add(land.group, pad.group, corridor.group, fall.group, ghost.group, booth.group, flare.group);
  const dress = dressKourou();
  group.add(dress.group);

  const A = {
    pad: anchor(group, 0, PAD.table.h, 0),
    booth: booth.A.booth,
    screen: booth.A.screen,
    corridor: anchor(group, 2 * KM, 0, 0),
    fall: anchor(group, ...fall.centre),
    teaser: flare.A.teaser,
    coast: anchor(group, coastX(0), 0, 0),
    cross: anchor(group, ...ghost.cross),
  };

  return {
    group, A,
    /** p = { ground, corridor, track, fall, ghost, barred, salle, alarm, teaser, climb, incid, debris } — 16 times a frame, nothing allocated. */
    update(p, time = 0, px = 1000, eye = null) {
      sky.update(SKY, time, px);
      if (tufts) tufts.visible = false; // they would grow under the table
      const gr = clamp01(p.ground ?? 1);
      sky.group.visible = gr > 0.004;
      if (dome) dome.material.uniforms.uInk.value.copy(INK).multiplyScalar(gr);
      land.update(gr);
      pad.update(gr, eye);
      corridor.update(clamp01(p.corridor ?? 0), clamp01(p.track ?? 0), clamp01(p.fall ?? 0));
      fall.update(p.fall ?? 0, p.debris ?? 0, gr, px);
      ghost.update(p.ghost ?? 0, p.barred ?? 0, eye, px);
      booth.update(clamp01(p.salle ?? 0), clamp01(p.climb ?? 0), clamp01(p.alarm ?? 0));
      flare.update(p.teaser ?? 0, time, eye, px);
      dress.update(p, time, px);
    },
  };
}
