// DOSSIER 026 — Soyouz MS-10 : the dressing of the places (the decorator's file — docs/recette-decorateur.md). Nothing
// here is the system, nothing stands in front of it, and nothing of it is in the first frame: 50 km up the pad is
// hidden, the steppe is 50 km below, the teaser is off. What the bare sets did not have — all ink, all X-ray, far or low:
//
//   dressPad()     → { group, update({ amount }, time, px) }  in launcher.js's pad group (its deck at y 0); amount = `pad`
//     · THE LIGHTS OF THE PAD: two floodlight towers out on the steppe behind the rocket, a bank of lamps on each, turned
//       toward it — on the pad the rocket waits at night under its lights (the MS-12 left at 1:14 in the morning,
//       Baïkonour time; the MS-10 stood two nights on its pad before it left). Lights that have a place, never a beam.
//     · THE COSMODROME: far away on the flat steppe, the lamps of its roads and buildings, still and dim — Baïkonour is
//       a field of launch sites, not one tower in the dark. They give the black ground behind the rocket its depth.
//     · THE NIGHT over it: sparse still stars, hazed out toward the horizon.
//
//   dressSteppe()  → { ground, group, update({ alt, retro, truck }, time, px) }
//     ground: on the steppe under the module (sky.js's landing.ground, which `alt` lowers) · group: the scene's frame
//     · THE STEPPE: tufts of dry grass and of wormwood, sparse, out to ≈ 35 m — the semi-desert near Djezkazgan in
//       October, and what gives the module its size once it is down. (The landing was in daylight: nothing here says
//       « night » over it.) Never between a camera and the module, never behind it (it would show through its glass),
//       never under the teaser's road. The last push lights the nearest ones. They are drawn only near the ground.
//     · THE TEASER'S MOUNTAINS: far behind the road of the next file, a faint range — the road comes down out of it
//       (« en pleine descente »). Only with `truck`.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { lineMat, fatLine } from "@kit/build3d.js";
import { makeDresser } from "@kit/details.js";
import { DEG, TEASER } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** Separate segments drawn in screen pixels, each end with its own colour (a far tuft is dimmer, a blade's tip too). */
function segs(pos, col, mat) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(pos);
  if (col) geo.setColors(col);
  const line = new LineSegments2(geo, mat);
  line.frustumCulled = false;
  line.renderOrder = 3;
  return line;
}

/* ───────────────────────────────────────────────────────────── the pad at night */

/** Points at infinity (like the dome): still, at least 2.4 px, hazed out toward the horizon — they never twinkle. */
function starsMat(k) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(k) }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aK; attribute float aPx; varying float vA;
      void main() {
        vec3 d = normalize(position);
        vA = aK * smoothstep(0.004, 0.06, d.y);
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * d * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99993, p.w);
        gl_PointSize = aPx;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vA;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float d = clamp(length(q) * 2.0, 0.0, 1.0);
        float a = (1.0 - d * d) * (1.0 - d * d);
        gl_FragColor = vec4(uColor * a * vA * uAmount, 1.0);
      }`,
  });
}

/** The two floodlight towers: azimuth from the rocket (camera convention), distance, height of the lamps (cm). Placed
 *  for VIEW.pad (az −32): one each side of the rocket, far behind it, never across its silhouette (x ≈ 240 and 860). */
const TOWERS = [
  { az: 157, r: 14000, h: 3500 },
  { az: 138, r: 13000, h: 3300 },
];

export function dressPad() {
  const rand = rng(26);
  const d = makeDresser({ order: 30, seed: 26 });
  const group = d.group;
  group.name = "habillage-pad";

  // the towers: three tapered legs braced in a zigzag, a platform and its bank of lamps turned to the rocket
  const legs = [];
  const brace = [];
  for (const { az, r, h } of TOWERS) {
    const x0 = Math.sin(az * DEG) * r;
    const z0 = Math.cos(az * DEG) * r;
    const face = Math.atan2(-x0, -z0); // its local +z looks at the rocket
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x0, 0, z0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, face, 0)), new THREE.Vector3(1, 1, 1));
    const P = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(m);
    const push = (list, a, b) => list.push(a.x, a.y, a.z, b.x, b.y, b.z);
    const leg = (i, y) => {
      const k = y / h;
      const rr = 120 * (1 - k) + 50 * k;
      const a = (i / 3) * TAU + Math.PI / 6;
      return P(Math.sin(a) * rr, y, Math.cos(a) * rr);
    };
    for (let i = 0; i < 3; i++) push(legs, leg(i, 0), leg(i, h));
    const bay = 420;
    for (let y = 0, s = 0; y + bay <= h; y += bay, s++) {
      for (let i = 0; i < 3; i++) push(brace, leg(i, y + (s % 2 ? bay : 0)), leg((i + 1) % 3, y + (s % 2 ? 0 : bay)));
    }
    // the platform (a rail round it), and the bank on it: two rows of lamps turned to the rocket — no frame round
    // them (framed, a bank of lamps reads as a sign)
    const W = 230;
    const T = h + 40;
    const Z = 60;
    for (const [a, b] of [[[-W, T, Z], [W, T, Z]], [[-W, T, -60], [W, T, -60]], [[-W, T, -60], [-W, T, Z]], [[W, T, -60], [W, T, Z]]])
      push(legs, P(...a), P(...b));
    for (const [lx, ly] of [[-140, 90], [0, 90], [140, 90], [-140, 200], [0, 200], [140, 200]])
      d.glow({ at: P(lx, T + ly, Z + 20).toArray(), size: 560, k: 0.72, kind: "far" });
  }
  const towerLines = [segs(legs, null, lineMat(BRAND.ink, 1.9, { opacity: 0.3 })), segs(brace, null, lineMat(BRAND.ink, 1.8, { opacity: 0.13 }))];
  group.add(...towerLines);

  // the cosmodrome: lamps along its roads, from ≈ 450 m out to ≈ 1.4 km (the far plane is at 1.6 km)
  d.nightLights({ centre: [0, 0], r0: 45000, r1: 140000, y: 450, cell: 16000, avenue: 3, count: 700, k: 1.25, fade: 90000, px: [3, 5.5] });
  d.done();

  // the night: still stars, sparse, a few bright ones
  const pos = [];
  const kk = [];
  const pxs = [];
  while (kk.length < 2600) {
    const u = rand() * 2 - 1;
    const th = rand() * TAU;
    const s = Math.sqrt(1 - u * u);
    const y = Math.abs(u);
    if (y < 0.04) continue;
    const b = Math.pow(rand(), 3.4);
    pos.push(s * Math.cos(th), y, s * Math.sin(th));
    kk.push(0.3 + 0.7 * b);
    pxs.push(2.6 + 2.4 * b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aK", new THREE.Float32BufferAttribute(kk, 1));
  geo.setAttribute("aPx", new THREE.Float32BufferAttribute(pxs, 1));
  const stars = starsMat(0.95);
  const sky = new THREE.Points(geo, stars);
  sky.frustumCulled = false;
  sky.renderOrder = -40; // just after the dome, before everything else
  group.add(sky);

  const knobs = { amount: 1 };
  return {
    group,
    /** P: what launcher.js's update receives — reads `pad` (0–1). Sixteen times a frame, nothing allocated. */
    update(P, time = 0, px = 1000) {
      const amount = clamp01(P.pad ?? 0);
      knobs.amount = amount;
      d.update(knobs, time, px); // (it shows or hides the whole group)
      for (const o of towerLines) o.material.opacity = o.material.userData.base * amount;
      stars.uniforms.uAmount.value = amount;
    },
  };
}

/* ───────────────────────────────────────────────────────────── the steppe, the teaser's mountains */

/** The frames the steppe is seen in (world.js VIEW.ground and VIEW.night, copied here: if an act films the module on
 *  the ground from elsewhere, these are what the tufts keep clear of) — each drawn by a camera like kit/lib/stage.js's.
 *  On screen a tuft keeps off: the module (its box, a margin round it), the captions' band (they are said over this
 *  ground: « Vivant », « une sortie »), the teaser's road; and it is never a big blade in the foreground. */
const W = BRAND.W;
const H = BRAND.H;
const CAPTIONS = [80, 1230, 900, 1500];
const EYES = [
  { pose: { tx: 0, ty: 110, tz: 0, d: 1000, az: -36, el: 9, fov: 34, shift: 130, side: 0 } },
  // (the eye is low here: from 12 m out the tufts pile up into a hedge along the horizon — the whole ground under the
  // road, out to the module, is kept clear: nothing between the eye and the next file's road)
  { pose: { tx: 0, ty: 150, tz: 0, d: 1200, az: -166, el: -2, fov: 40, shift: -40, side: -260 }, road: [0, 990, 560, 1240] },
];
const R0 = 260;
const R1 = 3500;
const NEAR = 520; // within this the last push lights them

function eyeCamera(p) {
  const cam = new THREE.PerspectiveCamera(p.fov, W / H, Math.max(0.5, p.d * 0.012), 160000);
  const az = p.az * DEG;
  const el = p.el * DEG;
  cam.position.set(p.tx + p.d * Math.sin(az) * Math.cos(el), p.ty + p.d * Math.sin(el), p.tz + p.d * Math.cos(az) * Math.cos(el));
  cam.lookAt(p.tx, p.ty, p.tz);
  if (p.side || p.shift) cam.setViewOffset(W, H, p.side, p.shift, W, H);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
  return cam;
}
const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

/** Builds the test: (x, z, tall, spread) → 0 when a tuft there would cut into a frame (over the module, on the road, a
 *  big blade in front), 0.4 when it falls in the captions' band (it stays, quiet: the ground the words are said over), 1. */
function makeClear() {
  const v = new THREE.Vector3();
  const px = (cam, x, y, z) => {
    v.set(x, y, z).project(cam);
    return v.z < 1 ? [(v.x + 1) * 0.5 * W, (1 - v.y) * 0.5 * H] : null;
  };
  const eyes = EYES.map(({ pose, road }) => {
    const cam = eyeCamera(pose);
    // the module's box on screen, a margin round it: its bell from the shield to the hatch
    let box = [W, H, 0, 0];
    for (const y of [0, 224]) for (let k = 0; k < 16; k++) {
      const p = px(cam, Math.sin((k * TAU) / 16) * 112, y, Math.cos((k * TAU) / 16) * 112);
      if (p) box = [Math.min(box[0], p[0]), Math.min(box[1], p[1]), Math.max(box[2], p[0]), Math.max(box[3], p[1])];
    }
    box = [box[0] - 40, box[1] - 40, box[2] + 40, box[3] + 24];
    const scale = H / (2 * Math.tan((pose.fov * DEG) / 2)); // px per unit of depth-ratio
    return { cam, box, road, scale };
  });
  return (x, z, tall, spread) => {
    let k = 1;
    for (const { cam, box, road, scale } of eyes) {
      const b = px(cam, x, 0, z);
      const t = px(cam, x, tall, z);
      if (!b || !t) continue; // behind that eye: not in its frame
      const depth = v.set(x, 0, z).applyMatrix4(cam.matrixWorldInverse).z * -1;
      const half = (spread / Math.max(depth, 1)) * scale;
      const me = [Math.min(b[0], t[0]) - half, t[1], Math.max(b[0], t[0]) + half, b[1]];
      if (me[2] < 0 || me[0] > W || me[3] < 0 || me[1] > H) continue; // out of that frame
      if (me[3] - me[1] > 150) return 0; // a big blade in the foreground
      if (hit(me, box) || (road && hit(me, road))) return 0;
      if (hit(me, CAPTIONS)) k = 0.4;
    }
    return k;
  };
}

export function dressSteppe() {
  const rand = rng(626);
  const ground = new THREE.Group();
  ground.name = "habillage-steppe";
  const group = new THREE.Group();
  group.name = "habillage-teaser";

  // ── the tufts: feather grass (long blades arching out) and wormwood (a low round bush of forked twigs)
  const near = { pos: [], col: [] };
  const far = { pos: [], col: [] };
  const put = (list, a, b, ka, kb) => {
    list.pos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    list.col.push(ka, ka, ka, kb, kb, kb);
  };
  const grass = (list, x, z, k, tall) => {
    const n = 8 + Math.floor(rand() * 7);
    for (let i = 0; i < n; i++) {
      const phi = rand() * TAU;
      const spread = rand();
      let th = (6 + 38 * spread * spread) * DEG;
      const droop = (7 + rand() * 12) * DEG;
      const len = tall * (0.55 + 0.45 * rand()) / 3;
      let p = [x + Math.cos(phi) * 3 * spread, 0.5, z + Math.sin(phi) * 3 * spread];
      for (let s = 0; s < 3; s++) {
        const q = [p[0] + Math.cos(phi) * Math.sin(th) * len, p[1] + Math.cos(th) * len, p[2] + Math.sin(phi) * Math.sin(th) * len];
        put(list, p, q, k * (1 - 0.18 * s), k * (1 - 0.18 * (s + 1)));
        p = q;
        th += droop;
      }
    }
  };
  const wormwood = (list, x, z, k, tall) => {
    const n = 7 + Math.floor(rand() * 5);
    for (let i = 0; i < n; i++) {
      const phi = rand() * TAU;
      const th = (14 + rand() * 40) * DEG;
      const len = tall * (0.42 + 0.2 * rand());
      const a = [x, 1, z];
      const b = [x + Math.cos(phi) * Math.sin(th) * len, 1 + Math.cos(th) * len, z + Math.sin(phi) * Math.sin(th) * len];
      put(list, a, b, k, k * 0.85);
      for (const side of [-1, 1]) {
        const f = phi + side * (0.35 + rand() * 0.3);
        const t2 = th + side * 0.1 + 0.15;
        const l2 = tall * (0.22 + 0.16 * rand());
        const c = [b[0] + Math.cos(f) * Math.sin(t2) * l2, b[1] + Math.cos(t2) * l2, b[2] + Math.sin(f) * Math.sin(t2) * l2];
        put(list, b, c, k * 0.85, k * 0.6);
      }
    }
  };
  const clear = makeClear();
  let tufts = 0;
  for (let tries = 0; tries < 6000 && tufts < 640; tries++) {
    const r = R0 + (R1 - R0) * Math.pow(rand(), 1.5); // denser close to the module, where the eye is
    const a = rand() * TAU;
    const cx = Math.sin(a) * r;
    const cz = Math.cos(a) * r;
    const clump = 1 + Math.floor(rand() * 3);
    for (let c = 0; c < clump; c++) {
      const x = cx + (rand() - 0.5) * 110;
      const z = cz + (rand() - 0.5) * 110;
      const rr = Math.hypot(x, z);
      if (rr < R0) continue;
      const list = rr < NEAR ? near : far;
      const isGrass = rand() < 0.66;
      const tall = isGrass ? 28 + rand() * 30 : 16 + rand() * 10;
      const room = clear(x, z, tall, isGrass ? tall * 0.6 : tall * 0.7);
      if (!room) continue;
      const k = room * (0.6 + 0.4 * rand()) * (1 - 0.72 * smooth(700, R1, rr)); // the far ones sink into the dark
      if (isGrass) grass(list, x, z, k, tall);
      else wormwood(list, x, z, k, tall);
      tufts++;
    }
  }
  const farMat = lineMat(BRAND.ink, 1.8, { opacity: 0.5, vertexColors: true });
  const nearMat = lineMat(BRAND.ink, 1.8, { opacity: 0.5, vertexColors: true });
  ground.add(segs(far.pos, far.col, farMat), segs(near.pos, near.col, nearMat));

  // ── the teaser's mountains: a faint range far behind the road, on the teaser's own axes (u across, v up, w beyond its
  // centre, true cm). The far plane is at 1.6 km: like the teaser (sky.js, built at 1.4 km and shrunk), each ridge is
  // built at 1.5 km and shrunk as much — the same angles seen from the module. It fades out before the module.
  const ta = TEASER.az * DEG;
  const F = [Math.sin(ta), Math.cos(ta)];
  const Rt = [-Math.cos(ta), Math.sin(ta)];
  const at = (u, v, w) => {
    const S = 150000 / (TEASER.far + w);
    return [((TEASER.far + w) * F[0] + u * Rt[0]) * S, v * S, ((TEASER.far + w) * F[1] + u * Rt[1]) * S];
  };
  // two ridges (true cm: u across, v up, w beyond the teaser's centre), their peaks staggered so that the far one shows
  // between the near one's: [w, base, [[u, height, width] …], jag phase, opacity] — ≈ 2 to 3.5° over the horizon
  const RIDGES = [
    [420000, 9000, [[-40000, 30000, 30000], [-125000, 24000, 36000], [20000, 15000, 22000]], 0, 0.26],
    [900000, 20000, [[-85000, 58000, 42000], [-10000, 40000, 30000], [-175000, 44000, 40000]], 1.7, 0.14],
  ];
  const ranges = [];
  for (const [w, base, peaks, phase, op] of RIDGES) {
    const pts = [];
    const cols = [];
    for (let u = -230000; u <= 90000; u += 4000) {
      let v = base + 2600 * Math.sin(u / 9000 + phase) + 1500 * Math.sin(u / 3700 + 2 * phase);
      for (const [pu, ph, pw] of peaks) v += ph * Math.exp(-(((u - pu) / pw) ** 2));
      pts.push(at(u, v, w));
      const fade = smooth(-230000, -150000, u) * (1 - smooth(25000, 80000, u)); // gone before it reaches the module
      cols.push(fade, fade, fade);
    }
    const line = fatLine(pts, { width: 1.9, opacity: op, vertexColors: true });
    line.geometry.setColors(cols);
    line.frustumCulled = false;
    group.add(line);
    ranges.push(line.material);
  }

  return {
    ground,
    group,
    /** P: what sky.js's update receives — reads `alt` (km), `retro`, `truck`. Sixteen times a frame, nothing allocated. */
    update(P, time = 0, px = 1000) {
      const k = 1 - smooth(0.006, 0.012, Math.max(0, P.alt ?? 50)); // only near the ground: from 12 m down
      ground.visible = k > 0.003;
      if (ground.visible) {
        farMat.opacity = farMat.userData.base * k;
        nearMat.opacity = nearMat.userData.base * k;
        nearMat.color.copy(INK).multiplyScalar(1 + clamp01(P.retro ?? 0)); // the last push lights the closest ones (≤ 2: no bloom)
      }
      const m = smooth(0, 0.06, P.truck ?? 0);
      group.visible = m > 0.003;
      for (const mat of ranges) mat.opacity = mat.userData.base * m;
    },
  };
}
