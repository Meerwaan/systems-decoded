// CR04 — ville.js · LAC-MÉGANTIC: the downtown at the bottom of the slope, in clay — houses and shops along the curve, rue Frontenac
// and its level crossing, the « 16 » limit sign, the street and window lights, the red glow behind the roofs (issue).
// docs/CR04-decors.md « ville.js » · journal docs/journal/CR04-ville.md.
//
//   buildVille() → { group, A, update(S, time, px) }
//   group   in WORLD coordinates (no transform of its own). Every building stands VERTICAL on y = groundY(x) (plan.js), on both
//           sides of the track's curve (plan.js TOWN, trackXZ), never on the track (≥ 40 from its axis). The track itself is
//           convoi.js's; the derailing cars are convoi.js's (S.derail); the ground is the tilted studio floor (world.js).
//   A       anchors: crossing (rue Frontenac on the track's axis), sign (the « 16 » plate), centre (the middle of the downtown),
//           church (the top of the steeple), glow (the heart of the red glow, on the ground of the pile)
// Numbers read: town (window and street lights, 0 … 2: 1 is the night of the film) · cross (the crossing's lights flashing, 0 → 1) ·
// glow (the red glow behind the roofs: the fire is the incident, it is red; no flame on screen, no person) · solo (everything hidden).
//
// THE TOWN'S OWN FRAME: a point is (u, n) — u along the track (plan.js), n its offset square to it, + on the LEFT (+z at phi 0, the
// inside of the curve), − on the RIGHT (the outside, toward the lake). In the curve, lines of constant u are radial: rue Frontenac
// (constant u) crosses the track square, as it does. Rows of buildings at constant n, streets between them.
// THE LIGHTS read from Nantes (24 000 away): every lit window is ALSO a point of light with a minimum size in pixels, faded in with
// the distance (close up the windows are panes on the facades, far away they are points; never both at full strength).
import * as THREE from "three";
import { clay, clayEdges, RECON } from "@kit/reconstitution.js";
import { mergeGeometries, fatLine } from "@kit/build3d.js";
import { TOWN, FRONTENAC, CURVE, RAIL, PILE, trackXZ, groundY } from "./plan.js";

/* ───────────── the layout (pure numbers) ───────────── */
const F = FRONTENAC.u;
/** Cross streets (constant u) and their half-widths. Rue Frontenac is the only one that crosses the track. */
const CROSS = [
  [21980, 22], [22660, 22], [23180, 22], [F, FRONTENAC.half], [24440, 22], [25120, 22], [25780, 22], [26420, 22],
];
/** Rows of buildings (constant n): their centre line, depth range, how many plots are built, their extent in u. */
const ROWS = [
  { n: 92, d: [46, 74], fill: 1 },
  { n: 248, d: [50, 84], fill: 0.82 },
  { n: 410, d: [54, 88], fill: 0.62, from: 22500, to: 26000 },
  { n: -92, d: [46, 74], fill: 1 },
  { n: -248, d: [50, 78], fill: 0.8, to: 26700 },
];
/** Streets along the rows (constant n), between them. */
const LONG = [165, 328, -165, -330];
/** The derailment's ground (convoi.js piles the cars there): no building within CLEAR of the axis. */
const PILE_ZONE = { from: PILE.u - 70, to: PILE.u + PILE.len + 70, clear: 150 };
/** Open ground kept free (u from → to, n from → to): the « 16 » sign's corner, where VIEW.panneau stands. */
const OPEN = [[FRONTENAC.signU - 230, FRONTENAC.signU + 130, 0, 170]];
/** The downtown's commercial blocks (flat roofs, two or three storeys) around rue Frontenac. */
const SHOPS = { from: F - 1100, to: F + 1000 };
const LAKE = { from: 22300, to: 27400, shore: -440, out: -4200 };
const CHURCH = { u: 24700, n: 600 };

/** World [x, z] of the town point (u, n), and the track's heading there. */
function at(u, n) {
  const t = trackXZ(u);
  return { x: t.x + Math.sin(t.phi) * n, z: t.z + Math.cos(t.phi) * n, phi: t.phi };
}
/** In the curve, a length along the track at offset n is (r − n) / r of its u: the plots on the inside are packed tighter. */
const squeeze = (u, n) => (u > CURVE.u0 && u < CURVE.u0 + CURVE.r * CURVE.phiMax ? Math.max(0.5, 1 - n / CURVE.r) : 1);

function seeded(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/* ───────────── geometry helpers (build time only) ───────────── */
/** A gable roof: ridge along local x (length w), span d along z, height h, base at y 0. Non-indexed, with normals and uvs. */
function gable(w, d, h) {
  const a = w / 2, b = d / 2;
  const A = [-a, 0, b], B = [a, 0, b], C = [a, 0, -b], D = [-a, 0, -b], E = [-a, h, 0], Fp = [a, h, 0];
  const P = [...A, ...B, ...Fp, ...A, ...Fp, ...E, ...C, ...D, ...E, ...C, ...E, ...Fp, ...B, ...C, ...Fp, ...D, ...A, ...E];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((P.length / 3) * 2).fill(0), 2));
  g.computeVertexNormals();
  return g;
}
/** Move a piece: local offset, then the turn of its plot (rotY = the track's heading), then its world place. */
function bake(geo, [lx, ly, lz], rot, [x, y, z]) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.translate(lx, ly, lz);
  g.rotateY(rot);
  g.translate(x, y, z);
  if (!g.attributes.uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array(g.attributes.position.count * 2).fill(0), 2));
  return g;
}
/** A flat strip on the ground between two lines, sampled along u: n0 → n1 at each u (streets, the lake). */
function ribbon(u0, u1, n0, n1, lift, step = 90) {
  const P = [], N = [], UV = [];
  const k = Math.max(1, Math.ceil((u1 - u0) / step));
  const row = [];
  for (let i = 0; i <= k; i++) {
    const u = u0 + ((u1 - u0) * i) / k;
    const a = at(u, typeof n0 === "function" ? n0(u) : n0), b = at(u, typeof n1 === "function" ? n1(u) : n1);
    row.push([a.x, groundY(a.x) + lift, a.z, b.x, groundY(b.x) + lift, b.z]);
  }
  for (let i = 0; i < k; i++) {
    const [ax, ay, az, bx, by, bz] = row[i], [cx, cy, cz, dx, dy, dz] = row[i + 1];
    P.push(ax, ay, az, cx, cy, cz, bx, by, bz, bx, by, bz, cx, cy, cz, dx, dy, dz);
  }
  for (let i = 0; i < P.length / 3; i++) N.push(0, 1, 0), UV.push(0, 0);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(UV, 2));
  return g;
}
/** A strip across the town at constant u (± half), from n0 to n1: a cross street. Straight (radial in the curve). */
function crossStrip(u, half, n0, n1, lift) {
  const a = at(u - half, n0), b = at(u + half, n0), c = at(u - half, n1), d = at(u + half, n1);
  const P = [];
  for (const p of [a, c, b, b, c, d]) P.push(p.x, groundY(p.x) + lift, p.z);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array(12).fill(0), 2));
  return g;
}

/* ───────────── lights (shaders) ───────────── */
/** Points of light with a size in the world close up and a minimum size in pixels far away; faded IN past `near` → `far` (close up,
 *  the panes and lamp heads take over). uAmount: their strength (town, cross). */
function lightsMat(color, { size = 6, min = 5, max = 26, k = 1.2, near = 1200, far = 2600 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color).multiplyScalar(k) },
      uSize: { value: size }, uMin: { value: min }, uMax: { value: max }, uPx: { value: 1000 },
      uNear: { value: near }, uFar: { value: far }, uAmount: { value: 1 },
    },
    vertexShader: /* glsl */ `
      uniform float uSize, uMin, uMax, uPx, uNear, uFar;
      attribute float aLit;
      varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float dist = max(-mv.z, 1.0);
        gl_PointSize = clamp(uSize * uPx / dist, uMin, uMax);
        vA = aLit * smoothstep(uNear, uFar, dist);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount;
      varying float vA;
      void main() {
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(q, q);
        if (r2 > 1.0) discard;
        float a = exp(-r2 * 7.0) + 0.25 * exp(-r2 * 2.2) * (1.0 - r2);
        gl_FragColor = vec4(uColor * (a * vA * uAmount), 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false,
  });
}
function points(pos, lit, mat) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aLit", new THREE.Float32BufferAttribute(lit, 1));
  const p = new THREE.Points(g, mat);
  p.frustumCulled = false;
  return p;
}
/** The window panes on the facades: dark glass, or warm amber where lit (aLit), faded OUT with the distance (far: the points). */
function panesMat() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uLit: { value: new THREE.Color(RECON.ambre).multiplyScalar(1.05) },
      uDark: { value: new THREE.Color(0x0d0a08) },
      uTown: { value: 1 }, uNear: { value: 1600 }, uFar: { value: 3600 },
    },
    vertexShader: /* glsl */ `
      uniform float uNear, uFar;
      attribute float aLit;
      varying float vLit; varying float vFade;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        vLit = aLit;
        vFade = 1.0 - smoothstep(uNear, uFar, -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uLit, uDark; uniform float uTown;
      varying float vLit; varying float vFade;
      void main() {
        float k = clamp(vLit * uTown, 0.0, 2.0);
        gl_FragColor = vec4(mix(uDark, uLit * k, min(k, 1.0)), vFade);
      }`,
    transparent: true, depthWrite: true, toneMapped: false, fog: false, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
}
/** Soft pools of lamp light on the ground (additive discs, a gradient: never a flat disc). */
function poolsMat() {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(RECON.ambre).multiplyScalar(0.34) }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vQ;
      void main() { vQ = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount;
      varying vec2 vQ;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        gl_FragColor = vec4(uColor * (exp(-r2 * 3.2) * (1.0 - r2) * uAmount), 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false,
  });
}
/** THE GLOW: a billboard rising from the ground of the pile, a bright heart low (hidden by the roofs in front) and a long plume that
 *  thins upward. No flame: a light in the air. uK its strength (glow × breath), uRise its height (it climbs as glow grows). */
function glowMat() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(RECON.alarme) }, uK: { value: 0 }, uW: { value: 600 }, uH: { value: 600 }, uRise: { value: 1 },
    },
    vertexShader: /* glsl */ `
      uniform float uW, uH, uRise;
      varying vec2 vQ;
      void main() {
        vQ = vec2(position.x * 2.0, position.y);
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        c.xy += vec2(position.x * uW, position.y * uH * uRise);
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK;
      varying vec2 vQ;
      void main() {
        float x = vQ.x, y = clamp(vQ.y, 0.0, 1.0);
        float core = exp(-x * x * 5.0 - y * y * 9.0);
        float spread = 0.14 + 0.6 * y;
        float plume = exp(-x * x / spread * 1.4) * pow(1.0 - y, 1.4);
        float a = (0.6 * core + 0.55 * plume) * smoothstep(0.0, 0.04, y) * smoothstep(1.0, 0.7, y);
        gl_FragColor = vec4(uColor * (a * uK), 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, side: THREE.DoubleSide,
  });
}

/* ───────────── the « 16 » plate ───────────── */
function plateTexture() {
  const c = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!c) return null;
  c.width = 256; c.height = 320;
  const g = c.getContext("2d");
  g.fillStyle = "#efeae0";
  g.fillRect(0, 0, 256, 320);
  g.strokeStyle = "#141010";
  g.lineWidth = 12;
  g.strokeRect(14, 14, 228, 292);
  // the digits drawn as strokes (deterministic: no font to wait for)
  g.lineWidth = 30;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath(); // « 1 »
  g.moveTo(58, 104); g.lineTo(90, 74); g.lineTo(90, 246);
  g.stroke();
  g.beginPath(); // « 6 »: the hook, then the bowl
  g.moveTo(206, 92); g.quadraticCurveTo(160, 64, 140, 120); g.lineTo(134, 190);
  g.stroke();
  g.beginPath();
  g.ellipse(172, 196, 38, 48, 0, 0, Math.PI * 2);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function buildVille() {
  const group = new THREE.Group();
  const rnd = seeded(20130706);
  const wallsA = [], wallsB = [], roofs = [], church = [];
  const paneP = [], paneL = [], lightP = [], lightL = [];
  let count = 0;

  /** The panes of one facade: nx × floors, local centre (lx, yc, lz), facing along local z (axis "z") or x (axis "x"). */
  function panes(B, axis, s, list, ww, wh, pLit) {
    const { x, z, rot } = B;
    const c = Math.cos(rot), sn = Math.sin(rot);
    for (const [la, yc] of list) {
      const lit = rnd() < pLit ? 0.55 + 0.45 * rnd() : 0;
      const q = [];
      for (const [da, dy] of [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]]) {
        const lx = axis === "z" ? la + (da * ww) / 2 : s * (B.w / 2 + 0.35);
        const lz = axis === "z" ? s * (B.d / 2 + 0.35) : la + (da * ww) / 2;
        q.push([x + c * lx + sn * lz, yc + (dy * wh) / 2, z - sn * lx + c * lz]);
      }
      for (const p of q) paneP.push(...p), paneL.push(lit);
      if (lit > 0) {
        const lx = axis === "z" ? la : s * (B.w / 2 + 1.2), lz = axis === "z" ? s * (B.d / 2 + 1.2) : la;
        lightP.push(x + c * lx + sn * lz, yc, z - sn * lx + c * lz);
        lightL.push(lit);
      }
    }
  }
  const cols = (len, step) => {
    const n = Math.max(1, Math.floor((len - 6) / step));
    return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * step);
  };

  function house(B) {
    const { x, z, rot, w, d, y0 } = B;
    const hw = 28 + rnd() * 12, hr = 15 + rnd() * 9;
    const walls = rnd() < 0.5 ? wallsA : wallsB;
    walls.push(bake(new THREE.BoxGeometry(w, hw, d), [0, hw / 2, 0], rot, [x, y0, z]));
    const along = rnd() < 0.62;
    const roof = along ? gable(w + 5, d + 7, hr) : gable(d + 5, w + 7, hr);
    if (!along) roof.rotateY(Math.PI / 2);
    roofs.push(bake(roof, [0, hw, 0], rot, [x, y0, z]));
    if (rnd() < 0.55) roofs.push(bake(new THREE.BoxGeometry(5, hr + 6, 5), [w * (rnd() - 0.5) * 0.5, hw + hr * 0.45, along ? d * 0.12 : 0], rot, [x, y0, z]));
    const floors = [y0 + 10, y0 + 23.5];
    for (const s of [1, -1]) panes(B, "z", s, cols(w, 15).flatMap((a) => floors.map((y) => [a, y])), 6, 7.5, 0.42);
    for (const s of [1, -1]) panes(B, "x", s, cols(d, 18).map((a) => [a, y0 + 23.5]), 5.5, 7, 0.3);
  }
  function shop(B) {
    const { x, z, rot, w, d, y0 } = B;
    const nf = rnd() < 0.45 ? 3 : 2;
    const h = 20 + 17 * (nf - 1) + 3;
    const walls = rnd() < 0.5 ? wallsA : wallsB;
    walls.push(bake(new THREE.BoxGeometry(w, h, d), [0, h / 2, 0], rot, [x, y0, z]));
    roofs.push(bake(new THREE.BoxGeometry(w + 3, 3.2, d + 3), [0, h + 1.2, 0], rot, [x, y0, z])); // the cornice
    roofs.push(bake(new THREE.BoxGeometry(w + 1, 1.6, d + 1), [0, 19, 0], rot, [x, y0, z])); // the shopfront's band
    for (const s of [1, -1]) {
      panes(B, "z", s, cols(w, 17).map((a) => [a, y0 + 9.5]), 12, 10, 0.62); // shop windows (the bars and cafés were open)
      const up = [];
      for (let f = 1; f < nf; f++) for (const a of cols(w, 12.5)) up.push([a, y0 + 20 + 17 * (f - 1) + 9]);
      panes(B, "z", s, up, 6, 9, 0.4);
    }
    for (const s of [1, -1]) panes(B, "x", s, cols(d, 16).map((a) => [a, y0 + 29]), 6, 9, 0.25);
  }

  // the rows of plots
  for (const row of ROWS) {
    const u1 = row.to ?? TOWN.to;
    let u = (row.from ?? TOWN.from) + rnd() * 80;
    while (u < u1) {
      const shopZone = u > SHOPS.from && u < SHOPS.to && Math.abs(row.n) < 300;
      const w = shopZone ? 62 + rnd() * 50 : 42 + rnd() * 22;
      const gap = shopZone ? 4 + rnd() * 10 : u < 22300 ? 70 + rnd() * 90 : 30 + rnd() * 44;
      const d = row.d[0] + rnd() * (row.d[1] - row.d[0]);
      const sq = squeeze(u, row.n);
      const lenU = w / sq;
      const mid = u + lenU / 2;
      const street = CROSS.find(([cu, half]) => Math.abs(mid - cu) < lenU / 2 + half + 8);
      if (street) {
        u = street[0] + street[1] + 10;
        continue;
      }
      const inPile = mid > PILE_ZONE.from && mid < PILE_ZONE.to && Math.abs(row.n) - d / 2 < PILE_ZONE.clear;
      const n = row.n + (rnd() - 0.5) * 10;
      const open = OPEN.some(([a, b, n0, n1]) => mid + lenU / 2 > a && mid - lenU / 2 < b && n + d / 2 > n0 && n - d / 2 < n1);
      if (!inPile && !open && rnd() < row.fill && Math.abs(n) - d / 2 >= 40) {
        const p = at(mid, n);
        const y0 = groundY(p.x) - 1 - GROUND_SINK(w, d);
        const B = { x: p.x, z: p.z, rot: p.phi, w, d, y0 };
        (shopZone ? shop : house)(B);
        count++;
      }
      u += (w + gap) / sq;
    }
  }

  // the church (Sainte-Agnès stands above the downtown; its steeple reads from afar): nave, transept-less, a front tower and spire
  {
    const p = at(CHURCH.u, CHURCH.n), rot = p.phi;
    const y0 = groundY(p.x) - 4;
    const base = [p.x, y0, p.z];
    church.push(bake(new THREE.BoxGeometry(220, 74, 92), [0, 37, 0], rot, base));
    roofs.push(bake(gable(226, 100, 46), [0, 74, 0], rot, base));
    church.push(bake(new THREE.BoxGeometry(50, 168, 50), [-132, 84, 0], rot, base));
    church.push(bake(new THREE.BoxGeometry(56, 6, 56), [-132, 168, 0], rot, base));
    const spire = new THREE.ConeGeometry(30, 128, 8);
    spire.rotateY(Math.PI / 8);
    roofs.push(bake(spire, [-132, 171 + 64, 0], rot, base));
    count++;
  }

  // the clay: two wall values, the roofs darker, the church the lightest
  const mWallA = clay({ tone: 0.12 }), mWallB = clay({ tone: 0.36 }), mRoof = clay({ tone: -0.38 }), mChurch = clay({ tone: 0.5 });
  const edges = [];
  for (const [list, mat] of [[wallsA, mWallA], [wallsB, mWallB], [roofs, mRoof], [church, mChurch]]) {
    if (!list.length) continue;
    const geo = mergeGeometries(list);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
    const e = clayEdges(geo, { opacity: 0.34 });
    e.material.fog = true;
    edges.push(e);
    group.add(e);
  }

  // streets: dark strips on the ground, just above the floor (never a ground of their own between them)
  const mStreet = clay({ tone: -0.7, rough: 0.9 });
  mStreet.color.multiplyScalar(0.62);
  mStreet.side = THREE.DoubleSide;
  const streets = [];
  for (const n of LONG) streets.push(ribbon(TOWN.from - 300, TOWN.to + 200, n - 15, n + 15, 2.2));
  for (const [cu, half] of CROSS) {
    if (cu === F) continue;
    streets.push(crossStrip(cu, half, 34, 520, 2.2));
    streets.push(crossStrip(cu, half, -34, -420, 2.2));
  }
  streets.push(crossStrip(F, FRONTENAC.half, 16, 1300, 2.3)); // rue Frontenac, both sides of the crossing
  streets.push(crossStrip(F, FRONTENAC.half, -16, LAKE.shore + 30, 2.3));
  const streetMesh = new THREE.Mesh(mergeGeometries(streets), mStreet);
  streetMesh.receiveShadow = true;
  group.add(streetMesh);

  // the lake beyond, on the right of the curve: a dark, smooth flat, its shore a fine line
  const shore = (u) => LAKE.shore - 55 * Math.sin(u * 0.0011 + 0.6) - 26 * Math.sin(u * 0.0043 + 1.3);
  const lakeMat = new THREE.MeshStandardMaterial({ color: 0x0a0807, roughness: 0.16, metalness: 0, envMapIntensity: 0.9, side: THREE.DoubleSide });
  const lake = new THREE.Mesh(ribbon(LAKE.from, LAKE.to, shore, LAKE.out, 3.2, 120), lakeMat);
  lake.receiveShadow = true;
  group.add(lake);
  {
    const pts = [];
    for (let u = LAKE.from; u <= LAKE.to; u += 60) {
      const p = at(u, shore(u));
      pts.push([p.x, groundY(p.x) + 3.6, p.z]);
    }
    const shoreLine = fatLine(pts, { color: RECON.papier, width: 1.8, opacity: 0.22, fog: true });
    group.add(shoreLine);
  }

  // the street lamps: along rue Frontenac and the long streets; a pole, an arm, a lamp head, its point of light and its pool
  const poles = [], heads = [], lampP = [], lampL = [], poolGeo = [];
  const lamp = (u, n, armDir) => {
    const p = at(u, n), rot = p.phi, y0 = groundY(p.x);
    poles.push(bake(new THREE.CylinderGeometry(0.7, 0.9, 46, 6), [0, 23, 0], rot, [p.x, y0, p.z]));
    poles.push(bake(new THREE.BoxGeometry(1, 1, 10), [0, 45.5, armDir * 5], rot, [p.x, y0, p.z]));
    heads.push(bake(new THREE.BoxGeometry(3.4, 1.4, 5), [0, 44.6, armDir * 10], rot, [p.x, y0, p.z]));
    const c = Math.cos(rot), s = Math.sin(rot);
    const hx = p.x + s * armDir * 10, hz = p.z + c * armDir * 10;
    lampP.push(hx, y0 + 43.6, hz);
    lampL.push(1);
    const disc = new THREE.PlaneGeometry(70, 70);
    disc.rotateX(-Math.PI / 2);
    poolGeo.push(bake(disc, [0, 0, 0], 0, [hx, groundY(hx) + 2.7, hz]));
  };
  for (let n = 60; n < 1250; n += 140) lamp(F - FRONTENAC.half - 6, n, 0), lamp(F + FRONTENAC.half + 6, n + 70, 0);
  for (let n = -60; n > LAKE.shore + 60; n -= 140) lamp(F - FRONTENAC.half - 6, n, 0), lamp(F + FRONTENAC.half + 6, n - 70, 0);
  for (const n of LONG) {
    for (let u = TOWN.from + 120; u < TOWN.to; u += 240) {
      if (CROSS.some(([cu, half]) => Math.abs(u - cu) < half + 30)) continue;
      lamp(u, n + Math.sign(n) * 19, -Math.sign(n));
    }
  }
  const mPole = clay({ tone: -0.2 });
  group.add(new THREE.Mesh(mergeGeometries(poles), mPole));
  const mHead = new THREE.MeshBasicMaterial({ color: new THREE.Color(RECON.ambre).multiplyScalar(1.4), toneMapped: false });
  group.add(new THREE.Mesh(mergeGeometries(heads), mHead));
  const pools = new THREE.Mesh(mergeGeometries(poolGeo), poolsMat());
  pools.renderOrder = 2;
  group.add(pools);

  // the panes and the points of light
  const paneGeo = new THREE.BufferGeometry();
  paneGeo.setAttribute("position", new THREE.Float32BufferAttribute(paneP, 3));
  paneGeo.setAttribute("aLit", new THREE.Float32BufferAttribute(paneL, 1));
  const mPanes = panesMat();
  const paneMesh = new THREE.Mesh(paneGeo, mPanes);
  paneMesh.frustumCulled = false;
  group.add(paneMesh);
  const mWin = lightsMat(RECON.ambre, { size: 5, min: 5.2, max: 18, k: 1.25, near: 1500, far: 3200 });
  const mLamp = lightsMat(RECON.ambre, { size: 9, min: 7.5, max: 30, k: 1.5, near: 700, far: 1800 });
  const winPts = points(lightP, lightL, mWin);
  const lampPts = points(lampP, lampL, mLamp);
  group.add(winPts, lampPts);

  /* ── RUE FRONTENAC: the platelage, the two crossing signals ── */
  const c0 = at(F, 0);
  const mDeck = clay({ tone: -0.55 });
  const deck = [];
  const yDeck = (x) => groundY(x) + RAIL.top - 0.25;
  for (const [n0, n1] of [[-2.9, 2.9], [4.3, 9.5], [-9.5, -4.3]]) {
    const pc = at(F, (n0 + n1) / 2);
    deck.push(bake(new THREE.BoxGeometry(FRONTENAC.half * 2, RAIL.top, n1 - n0), [0, -RAIL.top / 2, 0], pc.phi, [pc.x, yDeck(pc.x), pc.z]));
  }
  const deckGeo = mergeGeometries(deck);
  const deckMesh = new THREE.Mesh(deckGeo, mDeck);
  deckMesh.receiveShadow = true;
  group.add(deckMesh);
  group.add(clayEdges(deckGeo, { opacity: 0.3 }));

  const mMast = clay({ tone: 0.05 }), mBuck = clay({ tone: 0.85 }), mHood = clay({ tone: -0.7 });
  const mast = [], buck = [], hood = [];
  const lampsA = [], lampsB = [], ptA = [], ptB = [];
  /** A crossing signal on the road's edge at (u, n): mast, the crossbuck on top (square to the road), two lamps back to back
      facing both ways along the road, alternately lit (A / B). */
  const signal = (u, n) => {
    const p = at(u, n), rot = p.phi, y0 = groundY(p.x), base = [p.x, y0, p.z];
    mast.push(bake(new THREE.CylinderGeometry(1.1, 1.4, 84, 10), [0, 42, 0], rot, base));
    mast.push(bake(new THREE.BoxGeometry(6, 3, 6), [0, 1.5, 0], rot, base));
    mast.push(bake(new THREE.BoxGeometry(26, 1.6, 1.6), [0, 56, 0], rot, base)); // the lamps' cross arm (along the track)
    for (const a of [Math.PI / 4, -Math.PI / 4]) {
      const blade = new THREE.BoxGeometry(30, 5, 0.9);
      blade.rotateZ(a);
      buck.push(bake(blade, [0, 74, 0], rot, base));
    }
    for (const [i, lx] of [[0, -10], [1, 10]]) {
      const c = Math.cos(rot), sn = Math.sin(rot);
      for (const s of [1, -1]) {
        const disc = new THREE.CircleGeometry(3, 20);
        if (s < 0) disc.rotateY(Math.PI);
        const g = bake(disc, [lx, 56, s * 1.4], rot, base);
        (i === 0 ? lampsA : lampsB).push(g);
        const wx = p.x + c * lx + sn * s * 5.4, wz = p.z - sn * lx + c * s * 5.4; // just outside the hood: seen from the track too
        (i === 0 ? ptA : ptB).push(wx, y0 + 56, wz);
      }
    }
  };
  signal(F - FRONTENAC.half - 9, 24);
  signal(F + FRONTENAC.half + 9, -24);
  // the lamps' hoods: short open tubes along the road (n), drawn after the signals (their discs face ± n)
  for (const [u, n] of [[F - FRONTENAC.half - 9, 24], [F + FRONTENAC.half + 9, -24]]) {
    const p = at(u, n), rot = p.phi, base = [p.x, groundY(p.x), p.z];
    for (const lx of [-10, 10]) {
      const tube = new THREE.CylinderGeometry(3.7, 3.7, 6.5, 16, 1, true);
      tube.rotateX(Math.PI / 2);
      hood.push(bake(tube, [lx, 56, 0], rot, base));
      hood.push(bake(new THREE.BoxGeometry(2.2, 9, 2.2), [lx, 51, 0], rot, base));
    }
  }
  const mastGeo = mergeGeometries(mast), buckGeo = mergeGeometries(buck);
  const mastMesh = new THREE.Mesh(mastGeo, mMast), buckMesh = new THREE.Mesh(buckGeo, mBuck);
  const hoodMat = mHood;
  hoodMat.side = THREE.DoubleSide;
  const hoodMesh = new THREE.Mesh(mergeGeometries(hood), hoodMat);
  for (const o of [mastMesh, buckMesh, hoodMesh]) (o.castShadow = o.receiveShadow = true), group.add(o);
  group.add(clayEdges(buckGeo, { opacity: 0.4 }));
  const RED = new THREE.Color(RECON.alarme);
  const mLampA = new THREE.MeshBasicMaterial({ color: RED.clone(), toneMapped: false, side: THREE.DoubleSide });
  const mLampB = new THREE.MeshBasicMaterial({ color: RED.clone(), toneMapped: false, side: THREE.DoubleSide });
  group.add(new THREE.Mesh(mergeGeometries(lampsA), mLampA), new THREE.Mesh(mergeGeometries(lampsB), mLampB));
  const mPtA = lightsMat(RECON.alarme, { size: 10, min: 5, max: 34, k: 1.3, near: 0, far: 1 });
  const mPtB = lightsMat(RECON.alarme, { size: 10, min: 5, max: 34, k: 1.3, near: 0, far: 1 });
  group.add(points(ptA, ptA.map(() => 1).slice(0, ptA.length / 3), mPtA), points(ptB, ptB.map(() => 1).slice(0, ptB.length / 3), mPtB));

  /* ── THE « 16 »: a post on the left of the track, a light plate facing along it (the number on both faces) ── */
  const sp = at(FRONTENAC.signU, 20);
  const sign = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 30, 8), clay({ tone: 0.2 }));
  post.position.y = 15;
  post.castShadow = true;
  const tex = plateTexture();
  const mFace = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 0.55, metalness: 0, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.22 });
  mFace.userData.finish = false;
  const mRim = clay({ tone: 0.3 });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 13, 10.4), [mFace, mFace, mRim, mRim, mRim, mRim]);
  plate.position.y = 30;
  plate.castShadow = true;
  sign.add(post, plate);
  sign.position.set(sp.x, groundY(sp.x) - 0.5, sp.z);
  sign.rotation.y = sp.phi;
  group.add(sign);

  /* ── THE GLOW behind the roofs, above the pile (issue) ── */
  const glows = [];
  for (const [u, n, w, h, ph] of [[PILE.u + 150, -30, 760, 640, 0], [PILE.u + 430, 20, 600, 540, 1.9], [PILE.u + 720, -50, 500, 460, 3.7]]) {
    const p = at(u, n);
    const mat = glowMat();
    mat.uniforms.uW.value = w;
    mat.uniforms.uH.value = h;
    const geo = new THREE.PlaneGeometry(1, 1);
    geo.translate(0, 0.5, 0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(p.x, groundY(p.x) - 30, p.z);
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    group.add(mesh);
    glows.push({ mesh, mat, ph });
  }
  // and its light on the walls and roofs around (a red light with a place: the pile; no shadow)
  const gp = at(PILE.u + 350, -20);
  const fireLight = new THREE.PointLight(RECON.alarme, 0, 1500, 0);
  fireLight.position.set(gp.x, groundY(gp.x) + 70, gp.z);
  group.add(fireLight);

  /* ── anchors ── */
  const A = {
    crossing: new THREE.Object3D(), sign: new THREE.Object3D(), centre: new THREE.Object3D(), church: new THREE.Object3D(), glow: new THREE.Object3D(),
  };
  A.crossing.position.set(c0.x, groundY(c0.x) + RAIL.top + 1, c0.z);
  A.sign.position.set(sign.position.x, sign.position.y + 30, sign.position.z);
  const cc = at((TOWN.from + TOWN.to) / 2, 0);
  A.centre.position.set(cc.x, groundY(cc.x), cc.z);
  const ch = at(CHURCH.u, CHURCH.n), cr = ch.phi;
  A.church.position.set(ch.x - Math.cos(cr) * 132, groundY(ch.x) + 290, ch.z + Math.sin(cr) * 132);
  A.glow.position.set(gp.x, groundY(gp.x), gp.z);
  for (const a of Object.values(A)) group.add(a);
  group.userData.buildings = count;

  // the edges fade out on the far shots (from Nantes, a hairy band of lines would only grey the lights)
  const camAt = new THREE.Vector3();
  const centre = A.centre.position;
  for (const e of edges) {
    const own = e.onBeforeRender.bind(e); // LineSegments2 sets its resolution there
    e.onBeforeRender = (r, s, cam, ...rest) => {
      own(r, s, cam, ...rest);
      camAt.setFromMatrixPosition(cam.matrixWorld);
      const dist = camAt.distanceTo(centre);
      e.material.opacity = 0.34 * (1 - Math.min(1, Math.max(0, (dist - 7000) / 6000)));
    };
  }

  return {
    group, A,
    update(S, time, px) {
      group.visible = S.solo < 0.5;
      if (!group.visible) return;
      const town = Math.max(0, Math.min(2, S.town ?? 1));
      mPanes.uniforms.uTown.value = town;
      mWin.uniforms.uAmount.value = town;
      mLamp.uniforms.uAmount.value = town;
      pools.material.uniforms.uAmount.value = Math.min(1.4, town);
      mHead.color.setRGB(1, 0.698, 0.243).multiplyScalar(0.25 + 1.15 * Math.min(1.4, town));
      mWin.uniforms.uPx.value = px;
      mLamp.uniforms.uPx.value = px;
      mPtA.uniforms.uPx.value = px;
      mPtB.uniforms.uPx.value = px;
      // the crossing: two lamps alternately, ≈ 0.9 flash per second each (a slow, readable rhythm)
      const cross = Math.max(0, Math.min(1, S.cross ?? 0));
      const w = Math.sin(time * Math.PI * 2 * 0.9);
      const kA = cross * smooth(w), kB = cross * smooth(-w);
      mLampA.color.copy(RED).multiplyScalar(0.12 + 1.6 * kA);
      mLampB.color.copy(RED).multiplyScalar(0.12 + 1.6 * kB);
      mPtA.uniforms.uAmount.value = kA;
      mPtB.uniforms.uAmount.value = kB;
      // the glow: it climbs as `glow` grows, and breathes slowly (never a flicker)
      const g = Math.max(0, Math.min(1, S.glow ?? 0));
      for (let i = 0; i < glows.length; i++) {
        const o = glows[i];
        const b = 0.86 + 0.1 * Math.sin(time * 1.35 + o.ph) + 0.05 * Math.sin(time * 3.1 + o.ph * 2.3);
        o.mat.uniforms.uK.value = 0.78 * g * b;
        o.mat.uniforms.uRise.value = 0.55 + 0.45 * g;
        o.mesh.visible = g > 0.005;
      }
      fireLight.intensity = 1.5 * g * (0.9 + 0.1 * Math.sin(time * 1.35));
    },
  };
}

/** How deep a plot's base sinks so that no gap shows under it on the slope (the ground rises 3.5 % along x). */
function GROUND_SINK(w, d) {
  return 0.035 * 0.5 * Math.hypot(w, d);
}
const smooth = (v) => {
  const t = Math.max(0, Math.min(1, (v + 0.3) / 0.6));
  return t * t * (3 - 2 * t);
};
