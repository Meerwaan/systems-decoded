// CR04 — convoi.js · THE REST OF THE TRAIN AND THE SLOPE: the VB car, the buffer car, the 72 DOT-111 tank cars, the track from
// behind the tail to the far end of the town, route 161 at Nantes and its headlights, the two arrows of `seuil`, the derailment.
// docs/CR04-decors.md « convoi.js » · journal docs/journal/CR04-convoi.md.
//
//   buildConvoi() → { group, A, update(S, time, px) }
//   group   in WORLD coordinates (no transform of its own): the track follows plan.js trackFrame, the cars are placed every frame
//           from S.run / S.slack with the law of plan.js vehicleU (vehicles 5 … 78: the VB, the buffer car, the 72 tank cars), the
//           road stands on groundY. The GROUND itself is NOT built here (the studio floor, tilted by world.js, is the ground).
//   A       anchors: vb, tampon (their hand brake wheels), middle (the train's middle, above the cars: moved every frame)
// Numbers read: run slack (placement; the wheels turn; the couplers' shanks pull out of the sills, one gap after the other) · brakes
// (vehicle i's hand brake applied when brakes > i: its wheel turns three turns; i ≥ 7, the tank cars' own, dark → veille green) ·
// auto (the cars' brake cylinders in green; released, the green goes out from the head to the tail) · culprit fault depuis ok (the
// VB's and the buffer car's wheels are part of culprit 4: red with fault, healed green by depuis, green when applied and ok) · derail
// (the cars that reach plan.js PILE.u leave the rails in the curve, fall on their side and fold up in an accordion; the 9 last stay on
// the rails) · pull hold (the arrows of seuil) · road (the cars' lights leaving up route 161) · solo (everything hidden) · fx fy fz fs
// (the light: the cars nearest to it carry the clay's fine edges, wide shots none).
//
// Fidelity (BST R13D0054 § 1.1, 1.7; DOT-111 / CTC-111A general arrangement): the tank ≈ 3 m across (r 7.5), ≈ 16 m of shell with
// ellipsoidal heads, a manway housing and its small railed platform on top, ladders at mid-length, stub sills and end platforms,
// two 3-piece trucks (wheel Ø 33 in, wheelbase 5 ft 10 in), the hand brake wheel on the B end (here the front, −x, so that a camera
// standing downhill sees the row). The VB car (a special-purpose car, van-like) and the buffer car (a box car) carry their hand
// brake wheel at the front-left corner of their end wall. Reconstituted: the shades, the exact places of ladders and cylinders.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeGeometries, glow, lineMat, fatLine } from "@kit/build3d.js";
import { clay, alarm, setAlarm, heal, RECON } from "@kit/reconstitution.js";
import { CONSIST, LEN, TRACK, RAIL, ROAD, PILE, CULPRIT, CURVE, GROUND, GROUND_TILT, RUN, SLACK, trackFrame, vehicleU, groundY } from "./plan.js";

const N = CONSIST.length; // 79 vehicles
const FIRST_CAR = 5; // vehicles 5 … 78 are this file's (0 … 4: the locomotives, world.js)
const NC = N - FIRST_CAR; // 74
const FIRST_TANK = 7;
const NT = N - FIRST_TANK; // 72
const LAST_DERAILED = 69; // BST: 63 tank cars + the 2 head cars left the rails; the last 9 tank cars stayed on
const TANK_Y = 12.8; // the tank's axis above the rail top
const WHEEL_R = 2.1;
const GREEN_BODY = new THREE.Color(0x173a2a);
const VEILLE = new THREE.Color(RECON.veille);

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ───────── the track's frame, without allocation (the same law as plan.js trackFrame) ───────── */
const FR = new Float64Array(12); // p(3) ax(3) ay(3) az(3)
function frameInto(u) {
  const { u0, r, phiMax } = CURVE;
  let x, z, phi;
  if (u <= u0) {
    x = -u; z = 0; phi = 0;
  } else {
    const s = u - u0, sMax = r * phiMax;
    if (s <= sMax) {
      phi = s / r; x = -u0 - r * Math.sin(phi); z = r * (1 - Math.cos(phi));
    } else {
      const k = s - sMax;
      x = -u0 - r * Math.sin(phiMax) - k * Math.cos(phiMax); z = r * (1 - Math.cos(phiMax)) + k * Math.sin(phiMax); phi = phiMax;
    }
  }
  FR[0] = x; FR[1] = GROUND.g * x + RAIL.top; FR[2] = z;
  const bx = Math.cos(phi), bz = -Math.sin(phi), by = GROUND.g * bx;
  const n = Math.hypot(bx, by, bz);
  const ax0 = bx / n, ax1 = by / n, ax2 = bz / n;
  let ux = -GROUND.g, uy = 1, uz = 0;
  const dot = ux * ax0 + uy * ax1 + uz * ax2;
  ux -= dot * ax0; uy -= dot * ax1; uz -= dot * ax2;
  const m = Math.hypot(ux, uy, uz);
  const ay0 = ux / m, ay1 = uy / m, ay2 = uz / m;
  FR[3] = ax0; FR[4] = ax1; FR[5] = ax2;
  FR[6] = ay0; FR[7] = ay1; FR[8] = ay2;
  FR[9] = ax1 * ay2 - ax2 * ay1; FR[10] = ax2 * ay0 - ax0 * ay2; FR[11] = ax0 * ay1 - ax1 * ay0;
}
function frameMatrix(m) {
  m.set(FR[3], FR[6], FR[9], FR[0], FR[4], FR[7], FR[10], FR[1], FR[5], FR[8], FR[11], FR[2], 0, 0, 0, 1);
  return m;
}

/* ───────── geometry helpers (vertex-coloured, so one instanced mesh carries three greys) ───────── */
function tint(g, hex) {
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[3 * i] = c.r; a[3 * i + 1] = c.g; a[3 * i + 2] = c.b; }
  g.setAttribute("color", new THREE.BufferAttribute(a, 3));
  return g;
}
const bx = (w, h, d, x, y, z, hex) => tint(new THREE.BoxGeometry(w, h, d).translate(x, y, z), hex);
/** a cylinder along `axis` ("x", "y" or "z") */
function cy(r, h, axis, x, y, z, hex, seg = 20, r2 = r) {
  const g = new THREE.CylinderGeometry(r2, r, h, seg);
  if (axis === "x") g.rotateZ(-Math.PI / 2);
  if (axis === "z") g.rotateX(Math.PI / 2);
  return tint(g.translate(x, y, z), hex);
}
/** clay that takes its greys from the vertices */
function vclay(o = {}) {
  const m = clay({ tone: 1, ...o });
  m.color.set(0xffffff);
  m.vertexColors = true;
  return m;
}
/** a shader patch, chained after any the kit set */
function patch(mat, key, fn) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    if (prev) prev(shader, r);
    fn(shader);
  };
  const prevKey = mat.customProgramCacheKey?.bind(mat);
  mat.customProgramCacheKey = () => (prevKey ? prevKey() : "") + key;
  return mat;
}
/** fine repeated detail (ties, road marks, far rails) melts into `to` with the distance: no shimmering stripes far away */
function distFade(mat, to, near, far) {
  const uTo = { value: new THREE.Color(to) }, uN = { value: near }, uF = { value: far };
  return patch(mat, `fade${near}-${far}`, (s) => {
    Object.assign(s.uniforms, { uSdTo: uTo, uSdN: uN, uSdF: uF });
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vSdDist;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vec4 sdW = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          sdW = instanceMatrix * sdW;
        #endif
        sdW = modelMatrix * sdW;
        vSdDist = distance(sdW.xyz, cameraPosition);`,
      );
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vSdDist;\nuniform vec3 uSdTo;\nuniform float uSdN;\nuniform float uSdF;")
      .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, uSdTo, smoothstep(uSdN, uSdF, vSdDist));");
  });
}
/** a per-instance light (aLit 0 → 1): the body turns green and glows veille */
function litPatch(mat, peak) {
  mat.emissive = VEILLE.clone();
  mat.emissiveIntensity = peak;
  const uBody = { value: GREEN_BODY.clone() };
  return patch(mat, "alit", (s) => {
    s.uniforms.uLitBody = uBody;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aLit;\nvarying float vLit;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLit = aLit;");
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vLit;\nuniform vec3 uLitBody;")
      .replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, uLitBody, vLit * 0.85);")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance *= vLit;");
  });
}
/** a soft round light (for the cars' lamps and the headlight pools), built by numbers */
function softTexture() {
  const S = 64, d = new Uint8Array(S * S * 4);
  for (let j = 0; j < S; j++)
    for (let i = 0; i < S; i++) {
      const x = (i + 0.5) / S * 2 - 1, y = (j + 0.5) / S * 2 - 1;
      const r = Math.min(1, Math.hypot(x, y));
      const v = Math.pow(1 - r, 2.2);
      const k = 4 * (j * S + i);
      d[k] = d[k + 1] = d[k + 2] = 255;
      d[k + 3] = Math.round(255 * v);
    }
  const t = new THREE.DataTexture(d, S, S);
  t.needsUpdate = true;
  return t;
}
/** the samples of the track (straight parts long, the curve fine) */
function trackSamples(from, to) {
  const us = [];
  const push = (u) => { if (u >= from && u <= to && (us.length === 0 || u > us[us.length - 1] + 0.01)) us.push(u); };
  const cEnd = CURVE.u0 + CURVE.r * CURVE.phiMax;
  for (let u = from; u < CURVE.u0; u += 600) push(u);
  for (let u = CURVE.u0; u < cEnd; u += 20) push(u);
  for (let u = cEnd; u < to; u += 600) push(u);
  push(to);
  return us;
}
/** a profile ([[z, y], …] in a vehicle frame, z increasing) swept along the track */
function sweep(us, profile, dz = 0) {
  const pos = [], nor = [], idx = [];
  const nS = us.length;
  for (let s = 0; s < profile.length - 1; s++) {
    const [z0, y0] = profile[s], [z1, y1] = profile[s + 1];
    let nz = -(y1 - y0), ny = z1 - z0;
    const l = Math.hypot(nz, ny); nz /= l; ny /= l;
    const base = pos.length / 3;
    for (const u of us) {
      const f = trackFrame(u);
      for (const [zz, yy] of [[z0 + dz, y0], [z1 + dz, y1]]) {
        for (let c = 0; c < 3; c++) pos.push(f.p[c] + f.az[c] * zz + f.ay[c] * yy);
      }
      for (let k = 0; k < 2; k++) for (let c = 0; c < 3; c++) nor.push(f.az[c] * nz + f.ay[c] * ny);
    }
    for (let k = 0; k < nS - 1; k++) {
      const a0 = base + 2 * k, a1 = a0 + 1, b0 = a0 + 2, b1 = a0 + 3;
      idx.push(a0, b0, a1, a1, b0, b1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}
/** a flat strip on the ground plane, along x (the road and its lines) */
function groundStrip(x0, x1, zc, half, lift) {
  const n = new THREE.Vector3(-GROUND.g, 1, 0).normalize();
  const P = (x, z) => [x, groundY(x) + lift, z];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([...P(x0, zc - half), ...P(x0, zc + half), ...P(x1, zc - half), ...P(x1, zc + half)], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z, n.x, n.y, n.z], 3));
  g.setIndex([0, 1, 2, 1, 3, 2]);
  return g;
}
/** edge segments of a geometry (creases) + extra segments, as one LineSegments2 */
function edgeLines(geo, extra = [], opacity = 0.36) {
  const e = new THREE.EdgesGeometry(geo, 28).attributes.position.array;
  const all = new Float32Array(e.length + extra.length);
  all.set(e, 0);
  all.set(extra, e.length);
  const line = new LineSegments2(new LineSegmentsGeometry().setPositions(all), lineMat(RECON.papier, 1.8, { opacity }));
  line.renderOrder = 2;
  return line;
}
/** a ring of segments around the x axis */
function ring(out, x, yc, r, seg = 40) {
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2, b = ((i + 1) / seg) * Math.PI * 2;
    out.push(x, yc + r * Math.cos(a), r * Math.sin(a), x, yc + r * Math.cos(b), r * Math.sin(b));
  }
  return out;
}

/* ───────── the greys ───────── */
const G = {
  tank: 0x3c3b39, // the tank: « citerne noire », the darkest value that still shades
  fit: 0x7a7772, // its fittings: dome, platform, ladders, end platforms
  under: 0x4b4946, // trucks, sills, bolsters
  wheel: 0x46443f,
  mark: 0xb3afa7, // the light dab on a wheel that shows it turns
  coupler: 0x9a968f,
  shank: 0xc9c5bd, // the shank pulled out of the sill: light, so a gap that opens reads
  vb: 0x7d7a75, vbRoof: 0x8f8c86, // the VB car, the lightest body: it reads apart from the tank cars
  box: 0x5c5a56, boxRib: 0x6c6965, boxRoof: 0x6f6c67, // the buffer car
};

/* ───────── one truck (3-piece freight truck) at x = xc, into a list ───────── */
function truck(list, xc) {
  list.push(bx(12.6, 2.0, 0.9, xc, 2.6, 4.75, G.under), bx(12.6, 2.0, 0.9, xc, 2.6, -4.75, G.under));
  list.push(bx(4.0, 0.9, 0.9, xc, 1.2, 4.75, G.under), bx(4.0, 0.9, 0.9, xc, 1.2, -4.75, G.under)); // the bottom chord
  list.push(bx(2.0, 1.6, 9.4, xc, 3.6, 0, G.under)); // the bolster
  list.push(bx(1.4, 1.2, 1.1, xc, 2.2, 4.75, G.fit), bx(1.4, 1.2, 1.1, xc, 2.2, -4.75, G.fit)); // the spring nests, a shade lighter
}
/** the stub sill and end platform at one end (sign −1 front, +1 back) */
function endOf(list, len, sgn, plat = true) {
  const e = len / 2 - 3;
  list.push(bx(10, 1.8, 2.6, sgn * (e - 5), 4.6, 0, G.under));
  if (plat) list.push(bx(4.4, 0.45, 13.6, sgn * (e - 2.2), 6.1, 0, G.fit));
}

/* ───────── the DOT-111 tank car (local frame: origin rail top, mid-length, front −x, left +z) ───────── */
function tankCarGeometry() {
  const L = [];
  // the shell: a cylinder of 72 between two ellipsoidal heads (4.5 deep): ≈ 16 m of tank, ≈ 3 m across
  const R = 7.5, a = 4.5, c = 36;
  const pr = [];
  for (let k = 0; k <= 8; k++) { const b = (k / 8) * Math.PI / 2; pr.push(new THREE.Vector2(R * Math.sin(b), -c - a * Math.cos(b))); }
  for (let k = 8; k >= 0; k--) { const b = (k / 8) * Math.PI / 2; pr.push(new THREE.Vector2(R * Math.sin(b), c + a * Math.cos(b))); }
  const shell = new THREE.LatheGeometry(pr, 40).rotateZ(-Math.PI / 2).translate(0, TANK_Y, 0);
  L.push(tint(shell, G.tank));
  // top: the manway housing, its cover, the railed platform round it
  L.push(cy(2.6, 2.6, "y", 0, 20.6, 0, G.fit), cy(3.0, 0.5, "y", 0, 22.1, 0, G.fit));
  L.push(bx(11, 0.35, 9, 0, 20.9, 0, G.fit));
  for (const sx of [-4.6, 4.6]) L.push(bx(0.6, 2.4, 8, sx, 19.7, 0, G.under)); // its supports on the shell
  for (const sx of [-5.3, 5.3]) for (const sz of [-4.3, 4.3]) L.push(bx(0.45, 2.2, 0.45, sx, 22.1, sz, G.fit));
  for (const sz of [-4.3, 4.3]) L.push(bx(11, 0.45, 0.45, 0, 23.1, sz, G.fit));
  for (const sx of [-5.3, 5.3]) L.push(bx(0.45, 0.45, 9, sx, 23.1, 0, G.fit));
  // the ladders at mid-length, both sides
  for (const sz of [-1, 1]) {
    const z = sz * 7.9;
    L.push(bx(0.4, 14.4, 0.4, -1.2, 13.4, z, G.fit), bx(0.4, 14.4, 0.4, 1.2, 13.4, z, G.fit));
    for (let y = 7; y <= 19.5; y += 1.8) L.push(bx(2.4, 0.35, 0.4, 0, y, z, G.fit));
  }
  // the saddles on the bolsters, the stub sills, the end platforms, the bottom outlet
  for (const sx of [-33, 33]) L.push(bx(4.2, 2.2, 13.6, sx, 5.6, 0, G.under));
  endOf(L, LEN.citerne, -1); endOf(L, LEN.citerne, 1);
  L.push(cy(0.9, 1.6, "y", 0, 4.9, 0, G.under));
  // the hand brake staff and its bracket on the front end (the wheel itself is its own instanced mesh)
  L.push(bx(0.35, 7.0, 0.35, -42.4, 9.7, 4.6, G.fit), bx(1.6, 0.4, 0.8, -41.6, 9.0, 4.6, G.fit));
  for (const sx of [-33, 33]) truck(L, sx);
  const geo = mergeGeometries(L);
  // the edges: the crease lines of the fittings, plus rings where the heads meet the shell and two girth seams
  const extra = [];
  for (const x of [-36, -12, 12, 36]) ring(extra, x, TANK_Y, R + 0.04);
  return { geo, extra };
}
/** the wheel of a hand brake, in the YZ plane (its axis along x) */
function brakeWheelGeometry() {
  const L = [tint(new THREE.TorusGeometry(1.5, 0.26, 8, 28).rotateY(Math.PI / 2), 0xffffff)];
  for (const a of [0, Math.PI / 3, (2 * Math.PI) / 3]) L.push(tint(new THREE.BoxGeometry(0.3, 2.9, 0.3).rotateX(a), 0xffffff));
  L.push(tint(new THREE.CylinderGeometry(0.45, 0.45, 0.6, 12).rotateZ(Math.PI / 2), 0xffffff));
  const g = mergeGeometries(L);
  g.deleteAttribute("color");
  return g;
}
/** one wheelset (two wheels, their flanges, the axle, a light dab on each outer face) */
function wheelsetGeometry() {
  const L = [];
  for (const s of [-1, 1]) {
    L.push(cy(WHEEL_R, 0.7, "z", 0, 0, s * 3.59, G.wheel, 24));
    L.push(cy(WHEEL_R + 0.25, 0.22, "z", 0, 0, s * 3.1, G.wheel, 24));
    L.push(bx(0.7, 1.0, 0.14, 0, 1.25, s * 3.97, G.mark));
  }
  L.push(cy(0.38, 8.4, "z", 0, 0, 0, G.wheel, 10));
  return mergeGeometries(L);
}

/* ───────── the VB car (van-like special-purpose car) and the buffer car (box car) ───────── */
function vbGeometry() {
  const L = [], len = LEN.vb, e = 33;
  L.push(bx(2 * e, 12.5, 15, 0, 12.6, 0, G.vb));
  L.push(tint(new THREE.CylinderGeometry(9, 9, 2 * e, 32, 1, false, -Math.PI / 2 - 0.9, 1.8).rotateZ(-Math.PI / 2).translate(0, 11.5, 0), G.vbRoof)); // the curved roof
  L.push(bx(2 * e + 0.6, 0.6, 15.6, 0, 6.4, 0, G.under)); // the side sill
  for (const s of [-1, 1]) {
    L.push(bx(10, 10.4, 0.3, -6, 12.2, s * 7.6, G.vbRoof)); // the sliding door
    L.push(bx(11.6, 0.5, 0.5, -6, 17.7, s * 7.75, G.fit)); // its rail
  }
  for (const sx of [-1, 1]) L.push(bx(0.5, 12.5, 15.4, sx * (e - 0.2), 12.6, 0, G.fit)); // the end posts
  for (const sx of [-26, 26]) L.push(bx(4, 1.6, 14, sx, 5.6, 0, G.under));
  endOf(L, len, -1); endOf(L, len, 1);
  L.push(bx(0.35, 9.6, 0.35, -(e + 0.9), 11.3, 5.6, G.fit)); // the brake staff
  for (const sx of [-26, 26]) truck(L, sx);
  return mergeGeometries(L);
}
function boxGeometry() {
  const L = [], len = LEN.tampon, e = 37.5;
  L.push(bx(2 * e, 16, 16, 0, 14.6, 0, G.box));
  L.push(bx(2 * e + 0.4, 0.9, 16.6, 0, 23.0, 0, G.boxRoof)); // the roof
  L.push(bx(2 * e + 0.6, 0.6, 16.6, 0, 6.6, 0, G.under));
  for (const s of [-1, 1]) {
    for (let x = -e + 3; x <= e - 3; x += 5) if (Math.abs(x) > 7.5) L.push(bx(0.6, 15.4, 0.4, x, 14.6, s * 8.15, G.boxRib)); // the side posts
    L.push(bx(12, 14.6, 0.5, 0, 14.4, s * 8.2, G.boxRib)); // the plug door
    L.push(bx(0.4, 13, 0.3, -3, 14.4, s * 8.5, G.fit), bx(0.4, 13, 0.3, 3, 14.4, s * 8.5, G.fit)); // its locking bars
  }
  for (const sx of [-1, 1]) for (let y = 9; y <= 21; y += 4) L.push(bx(0.5, 0.6, 16.2, sx * (e + 0.1), y, 0, G.boxRib)); // end ribs
  for (const sx of [-29, 29]) L.push(bx(4, 1.6, 14, sx, 5.6, 0, G.under));
  endOf(L, len, -1); endOf(L, len, 1);
  L.push(bx(0.35, 11, 0.35, -(e + 0.9), 13.2, 6.0, G.fit));
  for (const sx of [-29, 29]) truck(L, sx);
  return mergeGeometries(L);
}
/** where each vehicle's things are (local) */
const SPEC = {
  citerne: { trucks: 33, wheel: [-42.6, 13.4, 4.6] },
  vb: { trucks: 26, wheel: [-(33 + 0.9), 16.4, 5.6] },
  tampon: { trucks: 29, wheel: [-(37.5 + 0.9), 18.6, 6.0] },
};
const CYL = [-12, 4.3, 3.4]; // the car's brake cylinder, under the tank on the left (its own instanced mesh)

/* ───────── the arrows of seuil (flat, lying parallel to the slope, above the train's middle) ───────── */
function arrowMesh(color) {
  const g = new THREE.Group();
  const mat = glow(color, 1.25, { double: true, opacity: 0.94 });
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(1, 34).rotateX(-Math.PI / 2).translate(0.5, 0, 0), mat);
  const sh = new THREE.Shape();
  sh.moveTo(0, -60); sh.lineTo(150, 0); sh.lineTo(0, 60); sh.lineTo(0, -60);
  const head = new THREE.Mesh(new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2), mat);
  shaft.renderOrder = head.renderOrder = 6;
  g.add(shaft, head);
  return { g, shaft, head, mat };
}

export function buildConvoi() {
  const group = new THREE.Group();

  /* ── THE TRACK: ballast, ties, two rails, and a fine light line on each rail that carries it to the town ── */
  const us = trackSamples(TRACK.from, TRACK.to);
  const ballastMat = clay({ tone: -0.62, double: true });
  const ballast = new THREE.Mesh(sweep(us, [[-15, -3.3], [-8.6, -1.4], [8.6, -1.4], [15, -3.3]]), ballastMat);
  ballast.receiveShadow = true;
  const ballastLin = ballastMat.color.clone();
  const railMat = distFade(clay({ tone: 0.72, rough: 0.34, env: 1.0, double: true }), ballastLin, 1400, 3200);
  const railProfile = [[-0.32, -0.9], [-0.32, 0], [0.32, 0], [0.32, -0.9]];
  const rails = [
    new THREE.Mesh(sweep(us, railProfile, RAIL.gauge / 2), railMat),
    new THREE.Mesh(sweep(us, railProfile, -RAIL.gauge / 2), railMat),
  ];
  for (const r of rails) r.receiveShadow = true;
  const tieStep = 3;
  const nTie = Math.floor((TRACK.to - TRACK.from) / tieStep);
  const tieMat = distFade(clay({ tone: -0.22 }), ballastLin, 900, 2200);
  const ties = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 0.8, RAIL.tie), tieMat, nTie);
  const mT = new THREE.Matrix4(), mL = new THREE.Matrix4();
  for (let k = 0; k < nTie; k++) {
    frameInto(TRACK.from + (k + 0.5) * tieStep);
    frameMatrix(mT);
    mL.makeTranslation(0, -1.3, 0);
    ties.setMatrixAt(k, mT.multiply(mL));
  }
  ties.receiveShadow = true;
  ties.frustumCulled = false;
  const railLines = [-1, 1].map((s) =>
    fatLine(us.map((u) => {
      const f = trackFrame(u);
      return [0, 1, 2].map((c) => f.p[c] + f.az[c] * s * (RAIL.gauge / 2) + f.ay[c] * 0.07);
    }), { color: RECON.papier, width: 2, opacity: 0.42 }),
  );
  group.add(ballast, ...rails, ties, ...railLines);

  /* ── ROUTE 161 at Nantes (on the train's right, −z), its lines, its poles ── */
  const rx0 = -ROAD.to, rx1 = -ROAD.from; // ROAD from / to are u (along the track): x = −u
  const roadMat = clay({ tone: -0.86, rough: 0.8, double: true });
  const road = new THREE.Mesh(groundStrip(rx0, rx1, ROAD.z, ROAD.half, 0.12), roadMat);
  road.receiveShadow = true;
  const roadLin = roadMat.color.clone();
  const lineMatR = distFade(clay({ tone: 0.35, double: true }), roadLin, 1200, 2600);
  const edgesR = [-1, 1].map((s) => new THREE.Mesh(groundStrip(rx0, rx1, ROAD.z + s * (ROAD.half - 1.6), 0.45, 0.2), lineMatR));
  const nDash = Math.floor((rx1 - rx0) / 60);
  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(15, 0.1, 0.8), lineMatR, nDash);
  for (let k = 0; k < nDash; k++) {
    const x = rx0 + 30 + k * 60;
    mT.makeRotationZ(GROUND_TILT).setPosition(x, groundY(x) + 0.2, ROAD.z);
    dashes.setMatrixAt(k, mT);
  }
  dashes.frustumCulled = false;
  const poleGeo = mergeGeometries([cy(0.8, 48, "y", 0, 24, 0, 0x6a6864, 8), bx(0.8, 0.8, 11, 0, 45.5, 0, 0x6a6864), bx(0.6, 1.4, 0.6, 0, 46.6, 4.4, 0x9a968f), bx(0.6, 1.4, 0.6, 0, 46.6, -4.4, 0x9a968f)]);
  const poleXs = [];
  for (let x = rx0 + 100; x < rx1; x += 330) poleXs.push(x);
  const poles = new THREE.InstancedMesh(poleGeo, vclay(), poleXs.length);
  poleXs.forEach((x, k) => poles.setMatrixAt(k, mT.makeTranslation(x, groundY(x), ROAD.z - ROAD.half - 10)));
  poles.castShadow = true;
  poles.frustumCulled = false;
  group.add(road, ...edgesR, dashes, poles);

  /* ── the cars on route 161: three pairs of lamps on a dark body, a pool of light ahead, leaving uphill (+x) ── */
  const soft = softTexture();
  const autos = [0, 1, 2].map((k) => {
    const g = new THREE.Group();
    g.rotation.z = GROUND_TILT;
    const body = new THREE.Mesh(mergeGeometries([bx(22, 4.2, 9, 0, 3.6, 0, 0x2b2a28), bx(11, 3.2, 8.2, -2, 7.2, 0, 0x2b2a28)]), vclay());
    const lamp = glow(RECON.papier, 2.4, { additive: true, opacity: 1 });
    const tail = glow(RECON.ambre, 1.5, { additive: true, opacity: 1 });
    const halo = new THREE.SpriteMaterial({ map: soft, color: RECON.papier, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const tailHalo = new THREE.SpriteMaterial({ map: soft, color: RECON.ambre, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const pool = new THREE.MeshBasicMaterial({ map: soft, color: new THREE.Color(RECON.papier).multiplyScalar(0.55), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    for (const s of [-1, 1]) {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), lamp); l.position.set(11.2, 3.8, s * 3.3);
      const t = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), tail); t.position.set(-11.2, 4.0, s * 3.5);
      const h = new THREE.Sprite(halo); h.position.copy(l.position); h.scale.set(9, 9, 1);
      const th = new THREE.Sprite(tailHalo); th.position.copy(t.position); th.scale.set(5, 5, 1);
      g.add(l, t, h, th);
    }
    const p = new THREE.Mesh(new THREE.PlaneGeometry(70, 26).rotateX(-Math.PI / 2).translate(48, 0.35, 0), pool);
    p.renderOrder = 4;
    g.add(body, p);
    g.visible = false;
    group.add(g);
    return { g, mats: [lamp, tail], sprites: [halo, tailHalo], pool, x0: [-30, 30, 95][k], dist: [3600, 3300, 3000][k], delay: [0, 0.15, 0.3][k] };
  });

  /* ── THE 72 TANK CARS (instanced), their wheelsets, couplers, brake cylinders, hand brake wheels ── */
  const { geo: tankGeo, extra: tankRings } = tankCarGeometry();
  const tanks = new THREE.InstancedMesh(tankGeo, vclay(), NT);
  tanks.castShadow = tanks.receiveShadow = true;
  tanks.frustumCulled = false;
  const wheels = new THREE.InstancedMesh(wheelsetGeometry(), vclay(), NC * 4);
  wheels.frustumCulled = false;
  const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, 1.9, 2.2), clay({ tone: 0.12 }), NC * 2);
  const shanks = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.9, 0.9), clay({ tone: 0.7 }), NC * 2);
  heads.frustumCulled = shanks.frustumCulled = false;
  const cylGeo = new THREE.CylinderGeometry(1.0, 1.0, 3.8, 16).rotateZ(Math.PI / 2);
  const cylLit = new THREE.InstancedBufferAttribute(new Float32Array(NC), 1);
  cylGeo.setAttribute("aLit", cylLit);
  const cyls = new THREE.InstancedMesh(cylGeo, litPatch(clay({ tone: -0.2 }), 1.25), NC);
  cyls.frustumCulled = false;
  const bwGeo = brakeWheelGeometry();
  const bwLit = new THREE.InstancedBufferAttribute(new Float32Array(NT), 1);
  bwGeo.setAttribute("aLit", bwLit);
  const brakeWheels = new THREE.InstancedMesh(bwGeo, litPatch(clay({ tone: -0.55 }), 1.1), NT);
  brakeWheels.frustumCulled = false;
  group.add(tanks, wheels, heads, shanks, cyls, brakeWheels);

  /* ── THE VB CAR and THE BUFFER CAR (one of each: their own groups, edges, and their own red / green wheel) ── */
  const special = [
    { i: 5, kind: "vb", geo: vbGeometry() },
    { i: 6, kind: "tampon", geo: boxGeometry() },
  ].map((o) => {
    const g = new THREE.Group();
    g.matrixAutoUpdate = false;
    const body = new THREE.Mesh(o.geo, vclay());
    body.castShadow = body.receiveShadow = true;
    const mat = alarm({ tone: 0.25, noOk: true });
    const wheel = new THREE.Mesh(brakeWheelGeometry(), mat);
    wheel.position.set(...SPEC[o.kind].wheel);
    g.add(body, wheel, edgeLines(o.geo));
    group.add(g);
    return { ...o, g, mat, wheel };
  });

  /* ── the clay's fine edges on the tank cars nearest to the light (far ones would turn to a smear of lines) ── */
  const K = 14;
  const proxies = Array.from({ length: K }, () => {
    const l = edgeLines(tankGeo, tankRings, 0.34);
    l.matrixAutoUpdate = false;
    l.visible = false;
    group.add(l);
    return l;
  });

  /* ── the arrows of seuil ── */
  const arrows = new THREE.Group();
  arrows.matrixAutoUpdate = false;
  const pull = arrowMesh(RECON.alarme), hold = arrowMesh(RECON.veille);
  pull.g.rotation.y = Math.PI; // pull points down the slope (−ax: toward the head, the town)
  pull.g.position.x = -45; hold.g.position.x = 45;
  arrows.add(pull.g, hold.g);
  group.add(arrows);
  const ARROW = 1700;
  function setArrow(a, k) {
    a.g.visible = k > 0.002;
    a.shaft.scale.x = Math.max(0.001, ARROW * k);
    a.head.position.x = ARROW * k;
    const hk = Math.min(1, k * 5);
    a.head.scale.set(hk, 1, hk);
    a.mat.opacity = 0.94 * Math.min(1, k * 8);
  }

  const A = { vb: new THREE.Object3D(), tampon: new THREE.Object3D(), middle: new THREE.Object3D() };
  group.add(A.vb, A.tampon, A.middle);

  // the derailment: how far the cars run on into the pile at derail 1 — just so that vehicle LAST_DERAILED goes in, the next stays out
  const PUSH = PILE.u + 30 - (vehicleU(LAST_DERAILED, RUN.derail, 1) + LEN.citerne / 2);
  const LAMBDA = 3000;

  // working memory (update allocates nothing)
  const mid = new Float64Array(N), gap = new Float64Array(N + 1);
  const carM = new Float32Array(NC * 16);
  const centre = new Float32Array(NC * 3);
  const near = new Int32Array(K), nearD = new Float64Array(K);
  const M = new THREE.Matrix4(), W = new THREE.Matrix4(), mA = new THREE.Matrix4(), mB = new THREE.Matrix4(), mC = new THREE.Matrix4();
  let lastRun = NaN, lastSlack = NaN, lastDerail = NaN;

  function place(S) {
    const D = clamp01(S.derail);
    const runC = S.run + (Math.min(S.run, RUN.derail) - S.run) * clamp01(D * 20);
    const runE = runC + D * PUSH;
    const slack = S.slack;
    // the law of plan.js vehicleU, in one pass
    let u = runE;
    gap[0] = 0;
    for (let i = 0; i < N; i++) {
      if (i > 0) {
        gap[i] = SLACK.max * clamp01(slack * N - (i - 1));
        u -= CONSIST[i - 1].len + gap[i];
      }
      mid[i] = u - CONSIST[i].len / 2;
    }
    gap[N] = 0;
    for (let v = FIRST_CAR; v < N; v++) {
      const j = v - FIRST_CAR, kind = CONSIST[v].kind, len = CONSIST[v].len;
      const o = mid[v] + len / 2 - PILE.u;
      if (D > 0 && o > 0) {
        // in the pile: compressed along the curve, folded in an accordion, lying on the side, thrown to the outside
        const s = PILE.len * (1 - Math.exp(-o / LAMBDA));
        const c = clamp01((PILE.len / LAMBDA) * Math.exp(-o / LAMBDA));
        const e = smooth(0, 160, o);
        const h1 = hash(v * 1.31), h2 = hash(v * 2.17 + 4), h3 = hash(v * 3.77 + 9), h4 = hash(v * 5.03 + 1), h5 = hash(v * 7.9 + 3);
        frameInto(Math.min(TRACK.to - 60, PILE.u + s - (len / 2) * c));
        frameMatrix(M);
        const yaw = e * ((v % 2 ? 1 : -1) * Math.acos(c) * 0.92 + (h1 - 0.5) * 0.5);
        const roll = e * (0.9 + 0.75 * h2) * (h3 < 0.78 ? -1 : 1);
        const pitch = e * (h4 - 0.5) * 0.16;
        const out = h4 < 0.22 ? 0.4 : -1;
        const dz = e * out * PILE.spread * 0.26 * (0.15 + 0.85 * (1 - c)) * (0.3 + 0.7 * h5);
        const dy = -e * (3 + 8.0 * Math.min(1, Math.abs(roll) / 1.45)) + e * (1 - c) * (h1 > 0.45 ? 1 : 0) * (9 + 9 * h1);
        mA.makeRotationX(roll);
        mB.makeRotationZ(pitch);
        mA.multiply(mB);
        const el = mA.elements;
        el[12] = -TANK_Y * el[4]; el[13] = TANK_Y - TANK_Y * el[5]; el[14] = -TANK_Y * el[6];
        mC.makeRotationY(yaw).setPosition(0, dy, dz);
        mC.multiply(mA);
        M.multiply(mC);
      } else {
        frameInto(mid[v]);
        frameMatrix(M);
      }
      M.toArray(carM, j * 16);
      const ee = M.elements;
      centre[3 * j] = ee[12] + ee[4] * TANK_Y; centre[3 * j + 1] = ee[13] + ee[5] * TANK_Y; centre[3 * j + 2] = ee[14] + ee[6] * TANK_Y;
      if (kind === "citerne") tanks.setMatrixAt(v - FIRST_TANK, M);
      else {
        const sp = special[v - FIRST_CAR];
        sp.g.matrix.copy(M);
        sp.g.matrixWorldNeedsUpdate = true;
      }
      // the wheelsets turn with the distance run
      const tx = SPEC[kind].trucks, spin = mid[v] / WHEEL_R;
      for (let a = 0; a < 4; a++) {
        W.makeRotationZ(spin).setPosition((a < 2 ? -tx : tx) + (a % 2 ? 4.45 : -4.45), WHEEL_R, 0);
        mA.multiplyMatrices(M, W);
        wheels.setMatrixAt(4 * j + a, mA);
      }
      // the couplers: the heads stay mated, the shanks pull out of the sills by half of each gap
      const e3 = len / 2 - 3;
      for (let side = 0; side < 2; side++) {
        const sg = side ? 1 : -1, g = side ? gap[v + 1] : gap[v];
        const ls = 1.8 + g / 2;
        W.makeScale(ls, 1, 1).setPosition(sg * (e3 + ls / 2), 4.4, 0);
        mA.multiplyMatrices(M, W);
        shanks.setMatrixAt(2 * j + side, mA);
        W.makeTranslation(sg * (e3 + ls + 1.2), 4.4, 0);
        mA.multiplyMatrices(M, W);
        heads.setMatrixAt(2 * j + side, mA);
      }
      W.makeTranslation(CYL[0], CYL[1], CYL[2]);
      mA.multiplyMatrices(M, W);
      cyls.setMatrixAt(j, mA);
    }
    tanks.instanceMatrix.needsUpdate = true;
    wheels.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
    shanks.instanceMatrix.needsUpdate = true;
    cyls.instanceMatrix.needsUpdate = true;
  }

  return {
    group, A,
    update(S, time, px) {
      group.visible = S.solo < 0.5;
      if (!group.visible) return;
      if (S.run !== lastRun || S.slack !== lastSlack || S.derail !== lastDerail) {
        place(S);
        lastRun = S.run; lastSlack = S.slack; lastDerail = S.derail;
      }
      const c = Math.round(S.culprit);

      // the hand brakes: the VB's and the buffer car's (part of the seven: red with culprit 4, healed by depuis, green when applied)
      for (let q = 0; q < special.length; q++) {
        const sp = special[q];
        const applied = clamp01(S.brakes - sp.i);
        sp.wheel.rotation.x = applied * Math.PI * 3;
        setAlarm(sp.mat, c === CULPRIT.handbrakes ? S.fault * applied : 0);
        heal(sp.mat, c === CULPRIT.handbrakes ? S.depuis : 0);
        const u = sp.mat.userData;
        const g = applied * clamp01(S.ok ?? 0) * (1 - clamp01(u.k * 4));
        if (u.heal < 0.02 && g > 0.001) {
          sp.mat.color.copy(u.clayBase).lerp(GREEN_BODY, Math.min(1, g * 1.2));
          sp.mat.emissive.copy(VEILLE);
          sp.mat.emissiveIntensity = 0.8 * g;
        }
        sp.wheel.updateMatrix();
        (sp.kind === "vb" ? A.vb : A.tampon).position.copy(sp.wheel.position).applyMatrix4(sp.g.matrix);
      }
      // the tank cars' own: dark and released while brakes ≤ i, green and turned in when brakes passes them
      for (let t = 0; t < NT; t++) {
        const v = FIRST_TANK + t, applied = clamp01(S.brakes - v);
        bwLit.array[t] = applied;
        M.fromArray(carM, (v - FIRST_CAR) * 16);
        W.makeRotationX(applied * Math.PI * 3).setPosition(SPEC.citerne.wheel[0], SPEC.citerne.wheel[1], SPEC.citerne.wheel[2]);
        mA.multiplyMatrices(M, W);
        brakeWheels.setMatrixAt(t, mA);
      }
      bwLit.needsUpdate = true;
      brakeWheels.instanceMatrix.needsUpdate = true;
      // the cars' brake cylinders: green while the automatic brake is applied; released, the green goes out from the head to the tail
      const rel = 1 - clamp01(S.auto);
      for (let j = 0; j < NC; j++) cylLit.array[j] = clamp01(1 - (rel * 4 - (3 * j) / (NC - 1)));
      cylLit.needsUpdate = true;

      // the edges on the cars nearest to the light; none on a wide shot
      const fe = 1 - smooth(500, 1100, S.fs ?? 0);
      for (let k = 0; k < K; k++) { near[k] = -1; nearD[k] = Infinity; }
      if (fe > 0.01) {
        for (let t = 0; t < NT; t++) {
          const j = t + 2;
          const dx = centre[3 * j] - S.fx, dy = centre[3 * j + 1] - S.fy, dz = centre[3 * j + 2] - S.fz;
          const d = dx * dx + dy * dy + dz * dz;
          if (d >= nearD[K - 1]) continue;
          let k = K - 1;
          while (k > 0 && nearD[k - 1] > d) { nearD[k] = nearD[k - 1]; near[k] = near[k - 1]; k--; }
          nearD[k] = d; near[k] = j;
        }
      }
      for (let k = 0; k < K; k++) {
        const l = proxies[k], j = near[k];
        l.visible = j >= 0;
        if (j < 0) continue;
        l.matrix.fromArray(carM, j * 16);
        l.matrixWorldNeedsUpdate = true;
        l.material.opacity = 0.34 * fe * (k < K - 4 ? 1 : (K - k) / 5);
      }

      // the train's middle (above the cars) and the arrows of seuil, lying on the slope over it
      const uMid = (mid[0] + CONSIST[0].len / 2 + mid[N - 1] - CONSIST[N - 1].len / 2) / 2;
      frameInto(uMid);
      frameMatrix(M);
      A.middle.position.set(FR[0] + FR[6] * 14, FR[1] + FR[7] * 14, FR[2] + FR[8] * 14);
      W.makeTranslation(0, 44, 0);
      arrows.matrix.multiplyMatrices(M, W);
      arrows.matrixWorldNeedsUpdate = true;
      setArrow(pull, clamp01(S.pull));
      setArrow(hold, clamp01(S.hold));

      // the cars leaving up route 161
      const road = clamp01(S.road), on = smooth(0, 0.04, road);
      for (let q = 0; q < autos.length; q++) {
        const au = autos[q];
        const p = clamp01((road - au.delay) / (1 - au.delay));
        const alpha = on * (1 - smooth(0.68, 1, p)) * (road > 0 ? 1 : 0);
        au.g.visible = alpha > 0.003;
        if (!au.g.visible) continue;
        const x = au.x0 + au.dist * p * p * (3 - 2 * p);
        au.g.position.set(x, groundY(x) + 0.12, ROAD.z + 8);
        au.mats[0].opacity = alpha; au.mats[1].opacity = alpha;
        au.sprites[0].opacity = 0.85 * alpha; au.sprites[1].opacity = 0.7 * alpha;
        au.pool.opacity = 0.9 * alpha;
      }
    },
  };
}
