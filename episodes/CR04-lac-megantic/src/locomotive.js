// CR04 — locomotive.js · THE SYSTEM, plein: the lead locomotive MMA 5017 (GE C30-7, BST R13D0054) and, from the same builder,
// the four others. docs/CR04-decors.md « locomotive.js », journal docs/journal/CR04-locomotive.md.
//
//   buildLocomotive({ lead }) → { group, A, haloR, update(S, time, px, i) }
//   group   in the vehicle's LOCAL frame (plan.js: origin on the rail top at mid-length, FRONT −x, LEFT +z). world.js places it
//           every frame from S.run / S.slack (group.matrixAutoUpdate is false: never touch group.position / rotation)
//   A       anchors: wheel shoe cylinder volant chain compressor reservoir engine turbo stack cutoff stand seatL seatR
//   lead    true: MMA 5017, the full machine (hood doors and roof that lift off, the FDL-16, its turbo and stack, the compressor, the
//           main reservoirs and the air pipe to THE brake cylinder, the cab with its stand and two seats, smoke, fire, air puffs)
//           false: the same silhouette, closed, engine cold — wheels, its hand brake wheel and chain, its brake cylinder and shoe
// Numbers read: run (wheels: angle = run / r about +z) · psi (the piston rod and the shoe on the tread; the shoe lifts off ≈ 0.7 as
// psi falls under ≈ 6) · brakes (applied when brakes > i: the wheel turns 2.5 turns in, the chain pulls straight) · culprit fault ok
// depuis · lead only: engine smoke fire cutaway cab crew cutoff leak auto.
// Built once; update() depends on S and time only and allocates nothing (it runs sixteen times per frame).
//
// Matter (docs/reconstitution.md): satin clay, three greys — the body −0.2, the running gear −0.6/−0.7, the inside and the machined
// faces light. GREEN (safe / alarm under setOk): compressor, reservoirs, pipe, cylinder, rod, shoe. RED (alarm) by culprit: 1 engine +
// turbo · 2 compressor · 3 cylinder, rod, shoe · 4 the hand brake wheel and its chain (healed green by depuis). The fuel cut-off is
// LIGHT clay, never red: the firefighters did what the instructions say.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { box, cyl, lathe, plate, lineMat } from "@kit/build3d.js";
import { clay, clayEdges, alarm, setAlarm, safe, heal, RECON } from "@kit/reconstitution.js";
import { rng } from "@kit/rng.js";
import { LOCO, PARTS, CULPRIT } from "./plan.js";

const PI = Math.PI;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const C_AMBER = new THREE.Color(RECON.ambre);
const C_RED = new THREE.Color(RECON.alarme);
const C_PAPER = new THREE.Color(RECON.papier);

// scratch (module level: update allocates nothing)
const _m = new THREE.Matrix4();
const _m2 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _s = new THREE.Vector3();
const UPY = new THREE.Vector3(0, 1, 0);

/* ───────────── the baker: static pieces merged, one mesh per material, one set of light edges ───────────── */
function baker() {
  const byMat = new Map();
  const lines = [];
  const add = (geo, mat, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], edges = true, th = 28 } = {}) => {
    _e.set(r[0], r[1], r[2], "YXZ");
    _q.setFromEuler(_e);
    _m.compose(_v.set(p[0], p[1], p[2]), _q, _s.set(s[0], s[1], s[2]));
    const g = geo.index ? geo.toNonIndexed() : THREE.BufferGeometry.prototype.clone.call(geo);
    for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal") g.deleteAttribute(k);
    g.applyMatrix4(_m);
    if (!byMat.has(mat)) byMat.set(mat, []);
    byMat.get(mat).push(g);
    if (edges) {
      const eg = new THREE.EdgesGeometry(geo.userData.edges ?? geo, th);
      eg.applyMatrix4(_m);
      lines.push(eg.attributes.position.array);
      eg.dispose();
    }
  };
  const build = (parent, { opacity = 0.36 } = {}) => {
    for (const [mat, gs] of byMat) {
      let n = 0;
      for (const g of gs) n += g.attributes.position.count;
      const pos = new Float32Array(n * 3);
      const nor = new Float32Array(n * 3);
      let o = 0;
      for (const g of gs) {
        pos.set(g.attributes.position.array, o);
        nor.set(g.attributes.normal.array, o);
        o += g.attributes.position.count * 3;
        g.dispose();
      }
      const bg = new THREE.BufferGeometry();
      bg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      bg.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
      bg.computeBoundingSphere();
      const mesh = new THREE.Mesh(bg, mat);
      mesh.castShadow = mesh.receiveShadow = true;
      parent.add(mesh);
    }
    if (lines.length) {
      let n = 0;
      for (const a of lines) n += a.length;
      const all = new Float32Array(n);
      let o = 0;
      for (const a of lines) {
        all.set(a, o);
        o += a.length;
      }
      const ls = new LineSegments2(new LineSegmentsGeometry().setPositions(all), lineMat(RECON.papier, 1.8, { opacity }));
      ls.renderOrder = 2;
      parent.add(ls);
    }
  };
  return { add, build };
}

/** A moving piece: a mesh with its own fine edges. */
function piece(parent, geo, mat, { p = [0, 0, 0], r = [0, 0, 0], edges = true, opacity } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(p[0], p[1], p[2]);
  m.rotation.set(r[0], r[1], r[2], "YXZ");
  m.castShadow = m.receiveShadow = true;
  if (edges) m.add(clayEdges(geo, opacity != null ? { opacity } : {}));
  parent.add(m);
  return m;
}
const grp = (parent, p = [0, 0, 0]) => {
  const g = new THREE.Group();
  g.position.set(p[0], p[1], p[2]);
  parent.add(g);
  return g;
};
/** A cylinder along x / along z (cyl is along y). */
const RX = [0, 0, PI / 2];
const RZ = [PI / 2, 0, 0];

/* ───────────── what flies: puffs placed in the shader from a seed and the time (CR03's idiom) ───────────── */
const LOOP_T = +(globalThis.document?.getElementById("root")?.dataset.duration ?? 1e9); // the film's length (index.html)
function makePuffs({ count, seed, origin, vel, life = 1, size = [1, 4], rise = 0, wobble = 0, soft = 1.6, c0, c1, additive = false, maxPx = 300, period = 0, gate = 1 }) {
  const rand = rng(seed);
  const o = new Float32Array(count * 3);
  const v = new Float32Array(count * 3);
  const s = new Float32Array(count * 4);
  const ph = new Float32Array(count);
  const tO = [0, 0, 0];
  const tV = [0, 0, 0];
  for (let i = 0; i < count; i++) {
    ph[i] = origin(rand, tO, i) ?? 0;
    vel(rand, tV, tO, i);
    o.set(tO, i * 3);
    v.set(tV, i * 3);
    s[i * 4] = rand();
    s[i * 4 + 1] = 0.7 + 0.6 * rand();
    s[i * 4 + 2] = 0.6 + 0.8 * rand();
    s[i * 4 + 3] = 0.45 + 0.55 * rand();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(o, 3));
  geo.setAttribute("aVel", new THREE.BufferAttribute(v, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(s, 4));
  geo.setAttribute("aPh", new THREE.BufferAttribute(ph, 1));
  const uniforms = {
    uTime: { value: 0 }, uAmount: { value: 0 }, uPx: { value: 1000 }, uLife: { value: life }, uSize0: { value: size[0] }, uSize1: { value: size[1] },
    uRise: { value: rise }, uWobble: { value: wobble }, uSoft: { value: soft }, uMaxPx: { value: maxPx }, uPeriod: { value: period }, uGate: { value: gate },
    uC0: { value: new THREE.Color(c0) }, uC1: { value: new THREE.Color(c1 ?? c0) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uAmount, uPx, uLife, uSize0, uSize1, uRise, uWobble, uMaxPx, uPeriod, uGate;
      attribute vec3 aVel; attribute vec4 aSeed; attribute float aPh; varying float vA; varying float vF;
      void main() {
        float life = uLife * aSeed.y;
        float f = fract(uTime / life + aSeed.x);
        float age = f * life;
        float g = 1.0;
        if (uPeriod > 0.0) {
          float c = fract((uTime - age) / uPeriod + aPh);
          g = smoothstep(0.0, 0.04, c) * (1.0 - smoothstep(uGate, uGate + 0.06, c));
        }
        vec3 p = position + aVel * age + vec3(0.0, 0.5 * uRise * age * age, 0.0);
        p.x += uWobble * f * sin(uTime * 0.9 + aSeed.x * 17.0);
        p.z += uWobble * f * cos(uTime * 0.7 + aSeed.x * 11.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = clamp(mix(uSize0, uSize1, f) * aSeed.z * uPx / max(1.0, -mv.z), 0.0, uMaxPx);
        gl_Position = projectionMatrix * mv;
        vA = uAmount * aSeed.w * g * smoothstep(0.0, 0.1, f) * pow(clamp(1.0 - f, 0.0, 1.0), 1.3);
        vF = f;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uC0, uC1; uniform float uSoft; varying float vA; varying float vF;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float r2 = dot(q, q) * 4.0;
        if (r2 > 1.0 || vA < 0.002) discard;
        gl_FragColor = vec4(mix(uC0, uC1, clamp(vF, 0.0, 1.0)), clamp(vA * pow(clamp(1.0 - r2, 0.0, 1.0), uSoft), 0.0, 1.0));
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = additive ? 6 : 4;
  return { points, u: uniforms };
}

// a light that has a place: a bright core and a long tail
let GLOW_TEX = null;
function glowTexture() {
  if (GLOW_TEX) return GLOW_TEX;
  const N = 64;
  const data = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const r = Math.hypot((x + 0.5) / N - 0.5, (y + 0.5) / N - 0.5) * 2;
      const a = Math.min(1, Math.exp(-r * r * 26) * 0.9 + Math.exp(-r * 4.2) * 0.45) * (1 - smooth(0.82, 1, r));
      const k = (y * N + x) * 4;
      data[k] = data[k + 1] = data[k + 2] = 255;
      data[k + 3] = Math.round(a * 255);
    }
  GLOW_TEX = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  GLOW_TEX.magFilter = GLOW_TEX.minFilter = THREE.LinearFilter;
  GLOW_TEX.needsUpdate = true;
  return GLOW_TEX;
}

/** « 5017 » painted on the cab side (the only figure written on the maquette: a fact of the report). */
function numberMaterial(text) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 192;
  const g = c.getContext("2d");
  g.fillStyle = "#efeae0";
  g.font = "700 150px 'Barlow Condensed', 'Arial Narrow', 'Roboto Condensed', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 256, 100);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, roughness: 0.6, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2 });
  mat.userData.finish = false;
  return mat;
}

/* ───────────── the wheel (lathe frame: axis +y = the axle, +y the OUTER face) ───────────── */
const WR = LOCO.wheel.r; // 2.54
let WHEEL_GEO = null;
function wheelGeometry() {
  if (WHEEL_GEO) return WHEEL_GEO;
  // the disc: flange inside, a dished web, the hub, and the roller-bearing end cap out beyond the side frame (it turns with the axle)
  const disc = lathe(
    [
      [0, -0.5], [0.95, -0.5], [0.95, -0.22], [2.05, -0.12], [2.3, -0.36], [2.76, -0.36], [2.76, -0.2], [2.56, -0.1], [2.3, -0.1],
      [2.3, 0.36], [2.05, 0.36], [1.2, 0.2], [0.85, 0.3], [0.85, 1.05], [0.62, 1.05], [0.62, 1.86], [0.78, 1.9], [0.78, 2.18], [0, 2.18],
    ],
    48, { bevel: 0.05, round: 1 },
  );
  // the tread: a machined band, lighter than the cast disc
  const tread = lathe([[2.3, -0.1], [2.56, -0.1], [2.5, 0.36], [2.3, 0.36]], 48, { bevel: 0.03, round: 1 });
  // the marks that show it turns: a chalk stripe across the web, three bolts on the end cap
  const marks = [box(1.3, 0.12, 0.46, 0.05).translate(1.62, 0.31, 0), box(1.3, 0.12, 0.46, 0.05).translate(-1.62, 0.31, 0)];
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * PI) / 3;
    marks.push(cyl(0.13, 0.12, 0.03, 10).translate(0.42 * Math.cos(a), 2.22, 0.42 * Math.sin(a)));
  }
  const mergedMarks = mergeSimple(marks);
  WHEEL_GEO = { disc, tread, marks: mergedMarks };
  return WHEEL_GEO;
}
/** Non-indexed position+normal merge (for instanced pieces). */
function mergeSimple(geos) {
  let n = 0;
  const parts = geos.map((g) => {
    const h = g.index ? g.toNonIndexed() : g;
    n += h.attributes.position.count;
    return h;
  });
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  let o = 0;
  for (const h of parts) {
    pos.set(h.attributes.position.array, o);
    nor.set(h.attributes.normal.array, o);
    o += h.attributes.position.count * 3;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.computeBoundingSphere();
  return g;
}

/** The brake shoe: an arc of the tread on the +x side of a wheel centred at the origin (z centred). */
let SHOE_GEO = null;
function shoeGeometry() {
  if (SHOE_GEO) return SHOE_GEO;
  const pts = [];
  const a0 = -0.5, a1 = 0.5, N = 10;
  for (let k = 0; k <= N; k++) {
    const a = a0 + ((a1 - a0) * k) / N;
    pts.push([2.6 * Math.cos(a), 2.6 * Math.sin(a)]);
  }
  for (let k = N; k >= 0; k--) {
    const a = a0 + ((a1 - a0) * k) / N;
    pts.push([3.18 * Math.cos(a), 3.18 * Math.sin(a)]);
  }
  SHOE_GEO = plate(pts, 0.78, { bevel: 0.08 }).translate(0, 0, -0.39);
  return SHOE_GEO;
}

/* ───────────── the machine ───────────── */
export function buildLocomotive({ lead = false } = {}) {
  const group = new THREE.Group();
  const X = LOCO.x;
  const DECK = LOCO.deck; // 7.6
  const HZ = 6.3; // the long hood's half-width (its walls)
  const SZ = 7.6; // the sill's half-width
  const RAILZ = 7.45; // the handrails

  // materials (each loco its own: the parts that change colour never share one)
  const M = {
    body: clay({ tone: -0.2 }),
    mid: clay({ tone: 0.05 }),
    dark: clay({ tone: -0.72 }),
    under: clay({ tone: -0.5 }),
    rail: clay({ tone: 0.38 }),
    grill: clay({ tone: -0.92 }),
    glass: clay({ tone: -1, rough: 0.22, env: 1 }),
    wheel: clay({ tone: -0.38 }),
    tread: clay({ tone: 0.42, rough: 0.35 }),
    mark: clay({ tone: 0.9 }),
    inner: clay({ tone: 0.32 }),
    seat: clay({ tone: -0.25 }),
    dial: clay({ tone: 0.95 }),
    lever: clay({ tone: 0.82 }),
  };
  const airMat = alarm({ tone: 0.3 }); // the cylinder, its fittings, the brake beam and THE shoe: red at culprit 3, green with ok
  const rodMat = alarm({ tone: 0.7 }); // the piston rod (machined, lighter): same part
  const brakeMat = alarm({ tone: 0.4, noOk: true }); // the hand brake wheel and its chain: red at culprit 4, healed in depuis
  const engineMat = lead ? alarm({ tone: 0.32, noOk: true }) : null; // the FDL-16
  const turboMat = lead ? alarm({ tone: 0.45, peak: 1.25, noOk: true }) : null; // its turbocharger (the oil that overheated, then burned)
  const compMat = lead ? alarm({ tone: 0.4 }) : null; // the air compressor: green while it runs (ok), red at culprit 2
  const resMat = lead ? safe(clay({ tone: 0.12 }), 0.55) : M.dark; // the main reservoirs: the air that holds
  const pipeMat = lead ? safe(clay({ tone: 0.3 }), 0.75) : M.dark; // the pipe from the compressor to the reservoirs to the cylinder
  const helmetMat = lead ? alarm({ tone: 0.75, noOk: true }) : null;

  const caisse = grp(group); // the body on its springs (it hums when the engine runs)
  const B = baker(); // static body
  const T = baker(); // static running gear (does not hum)
  const hoodLid = lead ? grp(caisse) : null;
  const cabLid = lead ? grp(caisse) : null;
  const H = lead ? baker() : B; // the hood's left doors and roof
  const Cb = lead ? baker() : B; // the cab's left wall and roof

  /* ── underframe, deck, pilots, plows, couplers, steps ── */
  B.add(box(100.4, 1.5, SZ * 2, 0.25), M.body, { p: [0, 6.6, 0] }); // the sill
  B.add(box(96, 0.7, 12, 0.12), M.dark, { p: [0, 5.55, 0] });
  B.add(box(101.0, 0.26, 15.6, 0.08), M.mid, { p: [0, 7.47, 0] }); // the walkway
  for (const sx of [-1, 1]) {
    B.add(box(1.05, 4.3, SZ * 2, 0.2), M.body, { p: [sx * 50.6, 5.2, 0] }); // pilot
    const plow = [[-50.1, 3.25], [-51.15, 3.25], [-50.75, 0.75], [-50.1, 0.75]].map(([x, y]) => [sx * x, y]);
    B.add(plate(plow, 13.6, { bevel: 0.12 }).translate(0, 0, -6.8), M.under); // the snow plow
    B.add(box(1.6, 0.9, 0.9, 0.1), M.dark, { p: [sx * 50.25, 4.4, 0] }); // coupler shank
    B.add(box(0.75, 1.5, 1.5, 0.15), M.dark, { p: [sx * 50.88, 4.4, 0] }); // knuckle
    for (const sz of [-1, 1]) {
      B.add(cyl(0.2, 1.6, 0.04, 10), M.dark, { p: [sx * 50.9, 2.9, sz * 1.7], edges: false }); // air hoses (glad hands)
      // the corner steps
      for (const xx of [47.7, 50.0]) B.add(box(0.16, 6.2, 0.14, 0.04), M.body, { p: [sx * xx, 4.25, sz * 7.5] });
      for (const yy of [1.6, 3.5, 5.4]) B.add(box(2.5, 0.2, 1.1, 0.06), M.mid, { p: [sx * 48.85, yy, sz * 7.05] });
      // end handrails
      B.add(cyl(0.13, 4.7, 0.04, 10), M.rail, { p: [sx * 50.0, DECK + 2.35, sz * RAILZ], edges: false });
    }
    B.add(cyl(0.13, 14.9, 0.04, 10), M.rail, { p: [sx * 50.0, DECK + 4.6, 0], r: RZ, edges: false });
  }

  /* ── the short hood (the nose) and its headlights ── */
  B.add(box(5.6, 9.2, 10.4, 0.7), M.body, { p: [-46.2, DECK + 4.6, 0] });
  for (const sz of [-1, 1]) {
    B.add(cyl(0.98, 0.3, 0.06, 24), M.mid, { p: [-49.05, 15.0, sz * 1.8], r: RX });
    B.add(cyl(0.7, 0.3, 0.05, 24), M.glass, { p: [-49.2, 15.0, sz * 1.8], r: RX });
    // nose handrails along the front walkway
    B.add(cyl(0.13, 6.4, 0.04, 10), M.rail, { p: [-47.0, DECK + 4.6, sz * RAILZ], r: RX, edges: false });
    B.add(cyl(0.13, 4.7, 0.04, 10), M.rail, { p: [-44.2, DECK + 2.35, sz * RAILZ], edges: false });
  }

  /* ── the cab ── */
  const cabX = (X.cab[0] + X.cab[1]) / 2; // −36.75
  const cabW = X.cab[1] - X.cab[0]; // 13.5
  const wallH = LOCO.cabTop - 0.8 - DECK; // 15.0
  const wallY = DECK + wallH / 2;
  B.add(box(0.5, wallH, 14.8, 0.3), M.body, { p: [X.cab[0] + 0.25, wallY, 0] }); // front wall
  B.add(box(0.5, wallH, 14.8, 0.3), M.body, { p: [X.cab[1] - 0.25, wallY, 0] }); // rear wall
  B.add(box(cabW, wallH, 0.5, 0.25), M.body, { p: [cabX, wallY, -7.15] }); // right wall
  B.add(box(cabW - 1, 0.4, 14, 0.1), M.mid, { p: [cabX, DECK + 0.2, 0] }); // floor
  for (const sz of [-1, 1]) {
    B.add(box(0.14, 3.7, 5.4, 0.18), M.glass, { p: [X.cab[0] - 0.02, 19.7, sz * 3.5] }); // windshields
    B.add(box(0.14, 1.5, 3.8, 0.12), M.glass, { p: [X.cab[1] + 0.02, 21.5, sz * 4.4] }); // rear windows over the hood
  }
  B.add(box(1.1, 0.16, 13.6, 0.05), M.body, { p: [X.cab[0] - 0.5, 21.95, 0] }); // sun visor
  for (const wx of [-40.3, -34.3]) B.add(box(4.4, 4.2, 0.14, 0.15), M.glass, { p: [wx, 18.7, -7.43] }); // right windows
  // the left wall and the roof: they lift off (cab)
  Cb.add(box(cabW, wallH, 0.5, 0.25), M.body, { p: [cabX, wallY, 7.15] });
  for (const wx of [-40.3, -34.3]) Cb.add(box(4.4, 4.2, 0.14, 0.15), M.glass, { p: [wx, 18.7, 7.43] });
  Cb.add(box(cabW + 1.2, 0.8, 15.6, 0.4), M.body, { p: [cabX, LOCO.cabTop - 0.4, 0] });
  Cb.add(box(5, 0.5, 4, 0.2), M.mid, { p: [cabX + 1, LOCO.cabTop + 0.25, 0] }); // roof hatch
  // cab grab irons (static, by the steps behind the cab)
  for (const sz of [-1, 1]) B.add(cyl(0.12, 6.0, 0.04, 10), M.rail, { p: [-29.6, DECK + 6, sz * 7.3], edges: false });

  /* ── the long hood: right wall, left fixed panel (the hand brake), left doors and roof (they lift off: cutaway) ── */
  const hoodH = LOCO.hoodTop - 0.6 - DECK; // 12.2
  const hoodY = DECK + hoodH / 2;
  B.add(box(60, hoodH, 0.4, 0.15), M.body, { p: [0, hoodY, -HZ + 0.2] });
  B.add(box(3.8, hoodH, 0.4, 0.15), M.body, { p: [-28.1, hoodY, HZ - 0.2] }); // left: the fixed panel by the cab
  H.add(box(56.2, hoodH, 0.4, 0.15), M.body, { p: [1.9, hoodY, HZ - 0.2] }); // left: the doors' wall
  B.add(box(0.4, hoodH, HZ * 2, 0.1), M.mid, { p: [29.7, hoodY, 0] }); // rear bulkhead (inside)
  // the doors: panels a hair proud, their handles, louvres on some
  const doorXs = [];
  for (let k = 0; k < 9; k++) doorXs.push(-25.4 + 3.1 + k * 6.25);
  for (const dx of doorXs) {
    for (const sz of [-1, 1]) {
      const into = sz > 0 ? H : B;
      into.add(box(5.9, 10.6, 0.1, 0.05), M.body, { p: [dx, hoodY + 0.2, sz * (HZ + 0.05)] });
      into.add(box(0.6, 0.22, 0.16, 0.05), M.rail, { p: [dx + 2.2, hoodY - 0.6, sz * (HZ + 0.14)], edges: false });
      if (Math.round(dx) % 3 === 0) into.add(box(4.2, 1.6, 0.08, 0.04), M.grill, { p: [dx, hoodY + 3.9, sz * (HZ + 0.1)] });
    }
  }
  // the roof, its hatches, the dynamic brake hatch behind the cab
  H.add(box(60, 0.6, HZ * 2, 0.3), M.body, { p: [0, LOCO.hoodTop - 0.3, 0] });
  H.add(box(14, 0.26, 9.6, 0.1), M.mid, { p: [-6, LOCO.hoodTop + 0.13, 0] });
  H.add(box(14, 0.26, 9.6, 0.1), M.mid, { p: [9, LOCO.hoodTop + 0.13, 0] });
  H.add(box(7, 0.9, 10.6, 0.25), M.body, { p: [-22.6, LOCO.hoodTop + 0.45, 0] });
  for (let k = 0; k < 3; k++) H.add(box(1.6, 0.1, 8.6, 0.03), M.grill, { p: [-24.8 + k * 2.2, LOCO.hoodTop + 0.92, 0] });

  /* ── the radiator section: the flared wings at the back, its grilles and fans ── */
  const wing = [[-HZ, DECK], [HZ, DECK], [HZ, 14.4], [SZ, 16.1], [SZ, LOCO.hoodTop], [-SZ, LOCO.hoodTop], [-SZ, 16.1], [-HZ, 14.4]];
  B.add(plate(wing, X.radiator[1] - X.radiator[0], { bevel: 0.25 }), M.body, { p: [X.radiator[0], 0, 0], r: [0, PI / 2, 0] });
  for (const sz of [-1, 1]) {
    B.add(box(16.4, 3.4, 0.08, 0.04), M.grill, { p: [39, 18.2, sz * (SZ + 0.04)] });
    for (const yy of [17.1, 18.2, 19.3]) B.add(box(16.4, 0.14, 0.14, 0.03), M.mid, { p: [39, yy, sz * (SZ + 0.08)], edges: false });
    B.add(cyl(0.98, 0.3, 0.06, 24), M.mid, { p: [48.05, 18.4, sz * 1.8], r: RX }); // rear headlights
    B.add(cyl(0.7, 0.3, 0.05, 24), M.glass, { p: [48.2, 18.4, sz * 1.8], r: RX });
  }
  for (const fx of [34.6, 43.4]) {
    B.add(cyl(3.4, 0.24, 0.06, 40), M.grill, { p: [fx, LOCO.hoodTop + 0.1, 0] });
    B.add(box(6.8, 0.16, 0.32, 0.04), M.mid, { p: [fx, LOCO.hoodTop + 0.28, 0], edges: false });
    B.add(box(0.32, 0.16, 6.8, 0.04), M.mid, { p: [fx, LOCO.hoodTop + 0.28, 0], edges: false });
    B.add(cyl(0.7, 0.3, 0.05, 16), M.mid, { p: [fx, LOCO.hoodTop + 0.32, 0] });
  }

  /* ── handrails along the long hood ── */
  for (const sz of [-1, 1]) {
    const x0 = sz > 0 ? -24 : -29.4;
    for (let k = 0; k <= 8; k++) B.add(cyl(0.13, 4.7, 0.04, 10), M.rail, { p: [x0 + ((47.9 - x0) * k) / 8, DECK + 2.35, sz * RAILZ], edges: false });
    B.add(cyl(0.13, 47.9 - x0, 0.04, 10), M.rail, { p: [(x0 + 47.9) / 2, DECK + 4.6, sz * RAILZ], r: RX, edges: false });
  }

  /* ── under the frame: the fuel tank, the main reservoirs ── */
  B.add(box(31, 4.4, 10, 1.0), M.under, { p: [0, 3.7, 0] });
  for (const tx of [-10, 0, 10]) B.add(box(0.4, 4.6, 10.2, 0.08), M.dark, { p: [tx, 3.7, 0] });
  B.add(cyl(0.45, 0.2, 0.04, 16), M.mark, { p: [-8, 4.4, 5.05], r: RZ });
  const capsule = lathe([[0, -15], [0.55, -15], [0.95, -14.5], [1.05, -13.7], [1.05, 13.7], [0.95, 14.5], [0.55, 15], [0, 15]], 32, { bevel: 0.05 });
  for (const sz of [-1, 1]) {
    const into = sz > 0 && lead ? null : B;
    if (into) into.add(capsule, sz > 0 ? resMat : M.dark, { p: [2, 4.6, sz * 6.4], r: RX });
    for (const bx of [-8, 12]) B.add(box(0.5, 0.5, 1.6, 0.08), M.dark, { p: [bx, 5.7, sz * 6.4] });
  }

  /* ── the hand brake on the left: its gear housing on the fixed panel, the sheave on the sill ── */
  const VOL = [PARTS.volant[0], PARTS.volant[1], 7.15];
  B.add(box(2.2, 3.4, 0.55, 0.2), M.mid, { p: [VOL[0], 12.55, HZ + 0.27] });
  B.add(cyl(0.16, 0.6, 0.03, 10), M.dark, { p: [VOL[0], VOL[1], 6.85], r: RZ, edges: false });
  B.add(cyl(0.45, 0.36, 0.05, 16), M.dark, { p: [-29.0, 6.5, 7.78], r: RZ });

  /* ── the fuel cut-off on the left sill (lead: the lever and its cover move) ── */
  const COMP = [-22.0, PARTS.compressor[1], 0]; // the compressor, 2.5 aft of plan.js: clear of the fixed panel that carries the hand brake
  const CUT = PARTS.cutoff; // [6, 6.6, 7.9]
  B.add(box(1.9, 1.4, 0.45, 0.15), M.dark, { p: [CUT[0], CUT[1] - 0.05, 7.82] });

  /* ── THE TRUCKS (FB-2, C-C): side frames, bolsters, axles, traction motors, shoes ── */
  const sideFrame = (() => {
    const pts = [[14.2, 3.6]];
    for (const ax of [LOCO.axle, 0, -LOCO.axle]) pts.push([ax + 1.45, 3.6], [ax + 1.45, 1.45], [ax - 1.45, 1.45], [ax - 1.45, 3.6]);
    pts.push([-14.2, 3.6], [-14.2, 4.4], [-12.8, 5.1], [12.8, 5.1], [14.2, 4.4]);
    return plate(pts, 0.8, { bevel: 0.12 });
  })();
  const shoeG = shoeGeometry();
  const wheelPos = []; // [x, z, side]
  for (const tx of LOCO.trucks) {
    for (const sz of [-1, 1]) T.add(sideFrame, M.dark, { p: [tx, 0, sz > 0 ? 4.6 : -5.4] });
    T.add(box(3.0, 1.6, 9.2, 0.2), M.dark, { p: [tx, 4.4, 0] });
    for (const dt of [-5.2, 5.2]) T.add(box(1.0, 1.0, 9.2, 0.12), M.dark, { p: [tx + dt, 4.4, 0] });
    for (const ax of [-LOCO.axle, 0, LOCO.axle]) {
      const x = tx + ax;
      T.add(cyl(0.55, 7.0, 0.04, 16), M.dark, { p: [x, WR, 0], r: RZ, edges: false });
      T.add(cyl(1.7, 4.6, 0.12, 32), M.under, { p: [x + (ax <= 0 ? 2.1 : -2.1), 3.0, 0], r: RZ }); // traction motor
      for (const sz of [-1, 1]) {
        wheelPos.push([x, sz * LOCO.wheel.z, sz]);
        const isThe = tx < 0 && ax < 0 && sz > 0; // front truck, front axle, left: THE wheel (its shoe moves)
        if (!isThe) {
          const toward = ax === 0 ? -1 : Math.sign(-ax); // the truck-centre side (the middle axle: toward the front)
          T.add(shoeG, M.under, { p: [x, WR, sz * LOCO.wheel.z], r: [0, toward > 0 ? 0 : PI, 0] });
        }
      }
    }
  }
  // the chain's bell crank on the front truck
  T.add(box(0.5, 0.5, 1.3, 0.1), M.dark, { p: [PARTS.chain[0], 4.0, 5.95] });
  T.add(box(0.5, 1.4, 0.4, 0.1), M.dark, { p: [PARTS.chain[0], 3.6, 6.55] });

  /* ── THE BRAKE on THE wheel: cylinder on the side frame, its rod, the lever and beam, the shoe ── */
  const CYL = [-37.0, 4.6, 6.1];
  piece(group, cyl(0.8, 3.2, 0.12, 32), airMat, { p: CYL, r: RX });
  piece(group, cyl(0.95, 0.3, 0.06, 32), airMat, { p: [CYL[0] - 1.45, CYL[1], CYL[2]], r: RX });
  piece(group, cyl(0.95, 0.3, 0.06, 32), airMat, { p: [CYL[0] + 1.45, CYL[1], CYL[2]], r: RX });
  T.add(box(2.2, 0.6, 0.7, 0.1), M.dark, { p: [CYL[0], CYL[1], 5.55] });
  const rodGeo = cyl(0.17, 1, 0.03, 16).translate(0, 0.5, 0); // along −x from its pivot after RX
  const rod = piece(group, rodGeo, rodMat, { p: [CYL[0] - 1.6, CYL[1], CYL[2]], r: RX, edges: false });
  const leverG = grp(group);
  piece(leverG, box(0.36, 2.7, 0.36, 0.08), airMat, { p: [-40.2, 3.45, CYL[2]] });
  piece(leverG, box(0.36, 0.36, 2.6, 0.08), airMat, { p: [-40.2, 2.3, 4.8] });
  const shoeGrp = grp(group);
  piece(shoeGrp, shoeG, airMat, { p: [PARTS.wheel[0], WR, LOCO.wheel.z] });
  piece(shoeGrp, box(0.3, 0.8, 0.6, 0.06), airMat, { p: [-40.28, 2.4, LOCO.wheel.z] });
  const ROD0 = CYL[0] - 1.6, LEV = -40.2; // the rod runs from the cylinder's front cover to the lever

  /* ── THE WHEELS ── */
  const WG = wheelGeometry();
  const ROT_L = new THREE.Matrix4().makeRotationX(PI / 2); // lathe +y → +z (left: outer face out)
  const ROT_R = new THREE.Matrix4().makeRotationX(-PI / 2);
  let spin;
  if (lead) {
    const pivots = [];
    for (const [x, z, sz] of wheelPos) {
      const pv = grp(group, [x, WR, z]);
      const inner = grp(pv);
      inner.rotation.x = sz > 0 ? PI / 2 : -PI / 2;
      piece(inner, WG.disc, M.wheel, { opacity: 0.32 });
      piece(inner, WG.tread, M.tread, { edges: false });
      piece(inner, WG.marks, M.mark, { edges: false });
      pivots.push(pv);
    }
    spin = (a) => {
      for (let k = 0; k < pivots.length; k++) pivots[k].rotation.z = a;
    };
  } else {
    const n = wheelPos.length;
    const inst = [WG.disc, WG.tread, WG.marks].map((g, k) => {
      const im = new THREE.InstancedMesh(g, [M.wheel, M.tread, M.mark][k], n);
      im.castShadow = im.receiveShadow = true;
      im.frustumCulled = false;
      group.add(im);
      return im;
    });
    spin = (a) => {
      _m2.makeRotationZ(a);
      for (let k = 0; k < n; k++) {
        const [x, z, sz] = wheelPos[k];
        _m.makeTranslation(x, WR, z).multiply(_m2).multiply(sz > 0 ? ROT_L : ROT_R);
        for (const im of inst) im.setMatrixAt(k, _m);
      }
      for (const im of inst) im.instanceMatrix.needsUpdate = true;
    };
  }

  /* ── THE HAND BRAKE WHEEL and ITS CHAIN ── */
  const volant = grp(caisse, VOL);
  piece(volant, new THREE.TorusGeometry(1.4, 0.18, 10, 48), brakeMat, { edges: false });
  for (let k = 0; k < 4; k++) piece(volant, box(0.24, 1.25, 0.16, 0.05), brakeMat, { p: [0.72 * Math.cos((k * PI) / 2), 0.72 * Math.sin((k * PI) / 2), 0], r: [0, 0, (k * PI) / 2 - PI / 2], edges: false });
  piece(volant, cyl(0.34, 0.42, 0.06, 20), brakeMat, { r: RZ });
  piece(volant, cyl(0.17, 0.7, 0.05, 12), brakeMat, { p: [1.4 * Math.cos(0.6), 1.4 * Math.sin(0.6), 0.35], r: RZ, edges: false }); // spinner knob
  const NL = 30;
  const linkGeo = new THREE.TorusGeometry(0.2, 0.07, 6, 14).scale(1, 1.5, 1);
  const chain = new THREE.InstancedMesh(linkGeo, brakeMat, NL);
  chain.castShadow = true;
  chain.frustumCulled = false;
  group.add(chain);
  const CP0 = [VOL[0], 11.0, 6.85], CP1 = [-29.0, 6.5, 7.92], CP2 = [PARTS.chain[0], 4.05, 6.6];
  const L1 = Math.hypot(CP1[0] - CP0[0], CP1[1] - CP0[1], CP1[2] - CP0[2]);
  const L2 = Math.hypot(CP2[0] - CP1[0], CP2[1] - CP1[1], CP2[2] - CP1[2]);
  const twist = Array.from({ length: NL }, (_, k) => new THREE.Quaternion().setFromAxisAngle(UPY, (k % 2) * (PI / 2)));
  const chainAt = (s, sag, out) => {
    // s ∈ [0, 1] along the chain; sag 0 taut … 1 slack (the lower run droops, the upper bows out)
    const d = s * (L1 + L2);
    if (d <= L1) {
      const t = d / L1, b = 4 * t * (1 - t);
      out.set(CP0[0] + (CP1[0] - CP0[0]) * t, CP0[1] + (CP1[1] - CP0[1]) * t, CP0[2] + (CP1[2] - CP0[2]) * t + 0.35 * sag * b);
    } else {
      const t = (d - L1) / L2, b = 4 * t * (1 - t);
      out.set(CP1[0] + (CP2[0] - CP1[0]) * t + 0.4 * sag * b, CP1[1] + (CP2[1] - CP1[1]) * t - 1.3 * sag * b, CP1[2] + (CP2[2] - CP1[2]) * t + 0.3 * sag * b);
    }
    return out;
  };
  const placeChain = (sag) => {
    for (let k = 0; k < NL; k++) {
      const s = (k + 0.5) / NL;
      chainAt(s, sag, _v);
      chainAt(Math.min(1, s + 0.01), sag, _v2).sub(_v).normalize();
      _q.setFromUnitVectors(UPY, _v2).multiply(twist[k]);
      _m.compose(_v, _q, _s.set(1, 1, 1));
      chain.setMatrixAt(k, _m);
    }
    chain.instanceMatrix.needsUpdate = true;
  };

  /* ── LEAD ONLY: inside the hood, inside the cab, what lives ── */
  const L = {};
  if (lead) {
    // the main reservoir on the left (green with ok), and the air pipe: compressor → reservoir → THE cylinder
    piece(caisse, capsule, resMat, { p: [2, 4.6, 6.4], r: RX });
    const tube = (pts, r = 0.22) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.12), 80, r, 10);
    const pipeA = tube([[-21.0, 9.4, 2.7], [-21.0, 9.0, 4.6], [-21.6, 7.0, 6.4], [-22.6, 5.45, 7.2], [-15.6, 5.45, 7.25], [-13.6, 4.9, 6.9]]);
    const pipeB = tube([[-13.3, 4.2, 7.0], [-16.5, 5.45, 7.3], [-33.4, 5.45, 7.3], [-34.5, 5.0, 6.8], [-35.45, 4.62, 6.12]]);
    piece(caisse, pipeA, pipeMat, { edges: false });
    piece(caisse, pipeB, pipeMat, { edges: false });
    for (const p of [[-22.6, 5.45, 7.2], [-15.6, 5.45, 7.25], [-33.4, 5.45, 7.3]]) piece(caisse, cyl(0.34, 0.6, 0.06, 16), airMat, { p, r: RX, edges: false }); // fittings

    // THE COMPRESSOR (behind the cab, in the hood): crankcase, two finned cylinders in V, its flywheel on the left
    const C0 = COMP;
    const I = baker();
    I.add(box(3.8, 2.6, 4.6, 0.3), compMat, { p: [C0[0], 9.0, 0] });
    const fin = [];
    for (let k = 0; k <= 8; k++) fin.push([k % 2 ? 0.95 : 0.78, -1.2 + k * 0.3]);
    const barrel = lathe([[0, -1.2], ...fin, [0, 1.2]], 32, { crease: 30 });
    for (const sz of [-1, 1]) {
      I.add(barrel, compMat, { p: [C0[0], 11.3, sz * 1.15], r: [sz * 0.5, 0, 0], th: 40 });
      I.add(box(2.0, 0.6, 2.0, 0.15), compMat, { p: [C0[0], 12.45, sz * 1.75], r: [sz * 0.5, 0, 0] });
    }
    const fly = grp(caisse, [C0[0], 9.6, 2.55]);
    L.fly = fly;
    piece(fly, lathe([[1.25, -0.2], [1.7, -0.2], [1.7, 0.2], [1.25, 0.2]], 40, { bevel: 0.05 }), compMat, { r: RZ });
    for (let k = 0; k < 3; k++) piece(fly, box(0.3, 1.3, 0.16, 0.05), compMat, { p: [0.75 * Math.cos((k * 2 * PI) / 3), 0.75 * Math.sin((k * 2 * PI) / 3), 0], r: [0, 0, (k * 2 * PI) / 3 - PI / 2], edges: false });
    piece(fly, cyl(0.38, 0.5, 0.06, 16), compMat, { r: RZ });
    I.add(cyl(0.32, 7.2, 0.04, 12), M.dark, { p: [-16.5, 9.6, 0], r: RX, edges: false }); // the drive shaft from the engine

    // THE ENGINE, GE FDL-16: oil pan, block, two banks in V with their heads, the manifold, the alternator at the back
    const E0 = PARTS.engine; // [2, 12.5, 0]
    I.add(box(30, 3.0, 6.8, 0.4), engineMat, { p: [E0[0], 9.3, 0] });
    I.add(box(30, 2.4, 5.6, 0.3), engineMat, { p: [E0[0], 11.9, 0] });
    for (const sz of [-1, 1]) {
      I.add(box(30, 3.0, 2.8, 0.3), engineMat, { p: [E0[0], 13.9, sz * 1.75], r: [sz * 0.42, 0, 0] });
      for (let k = 0; k < 8; k++) I.add(box(3.0, 0.9, 2.3, 0.2), M.inner, { p: [E0[0] + (k - 3.5) * 3.6, 15.4, sz * 2.45], r: [sz * 0.42, 0, 0] });
    }
    I.add(cyl(0.72, 29, 0.06, 20), engineMat, { p: [E0[0] - 0.5, 15.6, 0], r: RX });
    I.add(cyl(3.2, 6, 0.2, 40), M.inner, { p: [20, 11.6, 0], r: RX });
    I.add(box(6.8, 0.6, 7.2, 0.1), M.dark, { p: [20, 8.1, 0] });
    // the electrical cabinet between compressor and engine (low)
    I.add(box(2.6, 3.0, 5.0, 0.25), M.inner, { p: [-27.8, 9.1, -3.4] });
    I.build(caisse, { opacity: 0.32 });

    // THE TURBO under THE STACK
    const TB = PARTS.turbo; // [-16, 16, 0]
    L.turbo = grp(caisse, TB);
    piece(L.turbo, new THREE.TorusGeometry(1.15, 0.72, 14, 32), turboMat, { r: [0, PI / 2, 0], edges: false });
    piece(L.turbo, cyl(0.55, 2.2, 0.06, 20), turboMat, { r: RX });
    piece(L.turbo, cyl(0.6, 1.2, 0.06, 24, 1.15), turboMat, { p: [-1.6, 0, 0], r: [0, 0, -PI / 2] });
    piece(L.turbo, cyl(0.6, 2.6, 0.06, 16), turboMat, { p: [1.9, -0.25, 0], r: RX, edges: false }); // duct to the manifold
    const stackMat = clay({ tone: -0.45 });
    piece(caisse, box(2.6, 5.0, 1.8, 0.3), stackMat, { p: [PARTS.stack[0], 19.4, 0] });
    piece(caisse, box(2.0, 0.1, 1.2, 0.04), M.glass, { p: [PARTS.stack[0], 21.92, 0], edges: false });

    // THE CAB inside: the control stand (engineer, right), its two brake valves, the gauge; two seats, two helmets
    const ST = PARTS.stand; // [-38.5, 12.5, -4.4]
    const K = baker();
    K.add(box(2.6, 3.9, 3.6, 0.25), M.inner, { p: [-39.7, 9.75, -4.6] });
    K.add(box(3.0, 0.3, 3.9, 0.08), M.dark, { p: [-39.6, 11.85, -4.6], r: [0, 0, -0.18] });
    K.add(box(0.45, 2.8, 3.6, 0.12), M.dark, { p: [-40.9, 14.3, -4.6] });
    K.add(box(2.0, 3.0, 3.0, 0.2), M.inner, { p: [-40.4, 9.1, 4.8] }); // the conductor's desk
    for (const sz of [-1, 1]) {
      const sp = PARTS.seats[sz < 0 ? 0 : 1];
      K.add(cyl(0.35, 1.6, 0.05, 12), M.dark, { p: [sp[0], 8.6, sp[2]], edges: false });
      K.add(box(2.5, 0.75, 2.5, 0.3), M.seat, { p: [sp[0], 9.75, sp[2]] });
      K.add(box(0.6, 3.3, 2.5, 0.3), M.seat, { p: [sp[0] + 1.35, 11.7, sp[2]], r: [0, 0, -0.12] });
    }
    for (const z of [-5.4, -3.7]) K.add(cyl(0.5, 0.5, 0.06, 16), M.dark, { p: [-39.0, 12.25, z] });
    K.add(cyl(1.0, 0.24, 0.05, 32), M.dial, { p: [-40.62, 14.6, -4.6], r: RX });
    K.build(caisse, { opacity: 0.32 });
    const handle = (z) => {
      const h = grp(caisse, [-39.0, 12.6, z]);
      piece(h, box(1.8, 0.22, 0.34, 0.08), M.lever, { p: [0.8, 0, 0] });
      piece(h, new THREE.SphereGeometry(0.3, 14, 10), M.lever, { p: [1.65, 0.12, 0], edges: false });
      return h;
    };
    L.hAuto = handle(-5.4); // the automatic: the train's brake
    L.hInd = handle(-3.7); // the independent: the locomotives'
    const needle = (len) => {
      const n = grp(caisse, [-40.48, 14.6, -4.6]);
      piece(n, box(0.06, len, 0.09, 0.02), M.dark, { p: [0, len / 2 - 0.1, 0], edges: false });
      return n;
    };
    L.n1 = needle(0.85);
    L.n2 = needle(0.6);
    const helmetGeo = lathe([[0, 0.78], [0.42, 0.74], [0.68, 0.56], [0.8, 0.3], [0.84, 0.08], [1.08, 0.05], [1.08, -0.04], [0, -0.04]], 32, { bevel: 0.03 });
    L.helmets = PARTS.seats.map((sp) => {
      const h = grp(caisse, [sp[0] - 0.1, 10.15, sp[2]]);
      piece(h, helmetGeo, helmetMat, { opacity: 0.3 });
      h.visible = false;
      return h;
    });

    // « 5017 » on both cab sides
    const num = numberMaterial("5017");
    if (num) {
      const pg = new THREE.PlaneGeometry(6.4, 2.4);
      const left = new THREE.Mesh(pg, num);
      left.position.set(cabX, 13.6, 7.42);
      left.renderOrder = 3;
      cabLid.add(left);
      const right = new THREE.Mesh(pg, num);
      right.position.set(cabX, 13.6, -7.42);
      right.rotation.y = PI;
      right.renderOrder = 3;
      caisse.add(right);
    }

    // THE FUEL CUT-OFF: its cover swings open, the lever is thrown
    L.cover = grp(caisse, [CUT[0], CUT[1] + 0.7, 8.1]);
    piece(L.cover, box(1.9, 1.45, 0.1, 0.04), M.inner, { p: [0, -0.72, 0] });
    L.lever = grp(caisse, [CUT[0] - 0.4, CUT[1] - 0.1, 8.15]);
    piece(L.lever, box(0.24, 1.05, 0.2, 0.06), M.lever, { p: [0, 0.45, 0] });
    piece(L.lever, box(0.7, 0.26, 0.26, 0.08), M.lever, { p: [0, 0.98, 0] });

    // what lives: smoke from the stack, flames, the glow and the light of the fire, the puffs of air at the fittings
    const SK = [PARTS.stack[0], 21.9, 0];
    L.smoke = makePuffs({
      count: 110, seed: 17, life: 3.6, size: [1.6, 11], rise: 0.6, wobble: 1.2, soft: 1.5, c0: 0x6e625a, c1: 0x2a221e, maxPx: 360,
      origin: (r, o) => { o[0] = SK[0] + (r() - 0.5) * 1.6; o[1] = SK[1]; o[2] = (r() - 0.5) * 0.9; },
      vel: (r, v) => { v[0] = 1.2 + 1.6 * r(); v[1] = 3.2 + 2.4 * r(); v[2] = (r() - 0.5) * 1.0; },
    });
    caisse.add(L.smoke.points);
    L.flames = makePuffs({
      count: 120, seed: 23, life: 0.7, size: [2.2, 6.5], rise: 3, wobble: 0.4, soft: 1.4, additive: true, maxPx: 240,
      c0: C_RED.clone().lerp(C_AMBER, 0.45).multiplyScalar(0.75), c1: C_RED.clone().multiplyScalar(0.55),
      origin: (r, o) => { o[0] = SK[0] + (r() - 0.5) * 1.8; o[1] = SK[1] - 0.2; o[2] = (r() - 0.5) * 1.0; },
      vel: (r, v) => { v[0] = 0.8 + 1.6 * r(); v[1] = 7 + 6 * r(); v[2] = (r() - 0.5) * 1.2; },
    });
    caisse.add(L.flames.points);
    const glowMat = (s) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0x000000, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
      sp.scale.set(s, s, 1);
      sp.renderOrder = 7;
      return sp;
    };
    L.glow = glowMat(14);
    L.glow.position.set(SK[0], SK[1] + 1.2, 0);
    caisse.add(L.glow);
    L.turboGlow = glowMat(9);
    L.turboGlow.position.set(TB[0], TB[1], 3.0);
    caisse.add(L.turboGlow);
    L.light = new THREE.PointLight(C_RED.clone().lerp(C_AMBER, 0.25), 0, 140, 2);
    L.light.position.set(SK[0], SK[1] + 2, 2);
    caisse.add(L.light);
    const FIT = [[-35.4, 4.85, 6.4], [-13.4, 4.3, 7.2], [-22.6, 5.45, 7.5], [-33.4, 5.45, 7.6], [-50.9, 2.3, 1.7]];
    L.leak = makePuffs({
      count: 150, seed: 41, life: 1.4, size: [0.6, 4.2], rise: 0.6, wobble: 0.4, soft: 1.8, c0: C_PAPER.clone().multiplyScalar(0.92), c1: C_PAPER.clone().multiplyScalar(0.6), maxPx: 220,
      period: 1.9, gate: 0.28,
      origin: (r, o, i) => { const f = FIT[i % FIT.length]; o[0] = f[0] + (r() - 0.5) * 0.3; o[1] = f[1] + (r() - 0.5) * 0.3; o[2] = f[2]; return (i % FIT.length) * 0.37; },
      vel: (r, v, o, i) => { const out = i % FIT.length === 4 ? [-1, 0, 0] : [0, -0.3, 1]; v[0] = out[0] * 2.4 + (r() - 0.5) * 1.6; v[1] = out[1] * 2.4 + (r() - 0.5) * 1.2; v[2] = out[2] * 2.4 + (r() - 0.5) * 1.0; },
    });
    group.add(L.leak.points);
  }

  // bake the statics
  B.build(caisse);
  T.build(group);
  if (lead) {
    H.build(hoodLid);
    Cb.build(cabLid);
  }

  /* ── anchors ── */
  const A = {};
  const anchor = (name, p, parent = group) => {
    const o = new THREE.Object3D();
    o.position.set(p[0], p[1], p[2]);
    parent.add(o);
    A[name] = o;
  };
  anchor("wheel", PARTS.wheel);
  anchor("shoe", PARTS.shoe);
  anchor("cylinder", CYL);
  anchor("volant", VOL);
  anchor("chain", PARTS.chain);
  anchor("compressor", COMP);
  anchor("reservoir", [2, 4.6, 6.4]);
  anchor("engine", PARTS.engine);
  anchor("turbo", PARTS.turbo);
  anchor("stack", PARTS.stack);
  anchor("cutoff", PARTS.cutoff);
  anchor("stand", PARTS.stand);
  anchor("seatR", PARTS.seats[0]);
  anchor("seatL", PARTS.seats[1]);

  const DEG = PI / 180;
  const gaugeA = (psi) => (135 - (270 * Math.max(0, Math.min(140, psi))) / 140) * DEG;

  return {
    group, A, haloR: 40,
    update(S, time, px, i = 0) {
      // the wheels turn with the train
      spin(S.run / WR);
      // the air brake: the shoe on the tread while there is air; off ≈ 0.7 as psi falls to 0
      const grip = smooth(0, 6, Math.max(0, S.psi));
      const gap = 0.7 * (1 - grip);
      shoeGrp.position.x = gap;
      leverG.position.x = gap;
      rod.scale.y = Math.max(0.05, ROD0 - (LEV + gap));
      // the hand brake: 2.5 turns in, the chain pulled straight
      const applied = clamp01(S.brakes - i);
      volant.rotation.z = -applied * 5 * PI;
      placeChain(1 - smooth(0, 1, applied));
      // the colours: one red part at a time
      const c = Math.round(S.culprit);
      setAlarm(brakeMat, c === CULPRIT.handbrakes ? S.fault * applied : 0);
      heal(brakeMat, c === CULPRIT.handbrakes ? Math.min(S.depuis, applied) : (S.ok || 0) * applied); // green = applied × ok
      const air = c === CULPRIT.air ? S.fault : 0;
      setAlarm(airMat, air);
      setAlarm(rodMat, air);
      if (!lead) return;

      const e = clamp01(S.engine);
      const pxs = px || 1000;
      // the body hums on its springs, the compressor's flywheel turns
      caisse.position.y = 0.022 * e * Math.sin(time * 2 * PI * 5.3);
      L.fly.rotation.z = -time * 2 * PI * 2.2 * (e > 0.5 ? 1 : 0); // a phase that never depends on time × e: no whirl on a ramp of engine
      const fire = clamp01(S.fire);
      setAlarm(engineMat, c === CULPRIT.engine ? S.fault : 0);
      setAlarm(turboMat, Math.max(c === CULPRIT.engine ? S.fault : 0, fire));
      setAlarm(compMat, c === CULPRIT.compressor ? S.fault : 0);
      heal(helmetMat, S.depuis);
      // smoke, then flames; the glow and the light of the fire
      const sm = Math.max(clamp01(S.smoke), fire);
      L.smoke.points.visible = sm > 0.003;
      L.smoke.u.uAmount.value = 0.62 * sm;
      L.smoke.u.uC0.value.setRGB(0.43 - 0.24 * fire, 0.385 - 0.24 * fire, 0.353 - 0.23 * fire);
      const fk = smooth(0, 0.2, fire);
      L.flames.points.visible = L.glow.visible = L.turboGlow.visible = fk > 0.003;
      L.flames.u.uAmount.value = 0.7 * fk;
      L.glow.material.color.copy(C_RED).lerp(C_AMBER, 0.2).multiplyScalar(0.55 * fk * (0.92 + 0.08 * Math.sin(time * 2.3)));
      L.turboGlow.material.color.copy(C_RED).multiplyScalar(0.4 * fk * (cutawayK(S) > 0.5 ? 1 : 0.35));
      L.light.intensity = 260 * fk * (0.9 + 0.1 * Math.sin(time * 3.1));
      // the puffs of air at the fittings
      const lk = clamp01(S.leak);
      L.leak.points.visible = lk > 0.003;
      L.leak.u.uAmount.value = 0.75 * lk;
      for (const p of [L.smoke, L.flames, L.leak]) {
        p.u.uTime.value = p === L.leak && time > LOOP_T - 3 ? time - LOOP_T : time; // the loop: the last puffs are the first ones (leak 0 until the loop cut)
        p.u.uPx.value = pxs;
      }
      // the hood's left doors and roof lift off; the cab's left wall and roof
      const ck = cutawayK(S);
      hoodLid.position.set(0, 46 * ck * ck, 14 * ck);
      hoodLid.visible = ck < 0.995;
      const kb = smooth(0, 1, clamp01(S.cab));
      cabLid.position.set(0, 40 * kb * kb, 12 * kb);
      cabLid.visible = kb < 0.995;
      // the stand: the automatic released (auto 0) / applied (1); the independent stays applied while the cylinders hold air
      L.hAuto.rotation.y = (-35 + 70 * clamp01(S.auto)) * DEG;
      L.hInd.rotation.y = (-35 + 70 * smooth(0, 6, Math.max(0, S.psi))) * DEG;
      L.n1.rotation.x = gaugeA(S.psi);
      L.n2.rotation.x = gaugeA(90 - 26 * clamp01(S.auto));
      // two helmets on the two seats
      const crew = Math.max(0, S.crew);
      for (let k = 0; k < 2; k++) {
        const s = smooth(k, k + 1, crew);
        const h = L.helmets[k];
        h.visible = s > 0.01;
        h.scale.setScalar(0.6 + 0.4 * s);
        h.position.y = 10.15 + 1.2 * (1 - s) * (1 - s);
      }
      // the fuel cut-off: its cover opens, the lever is thrown down
      const ct = clamp01(S.cutoff);
      L.cover.rotation.x = -1.5 * smooth(0, 0.4, ct);
      L.lever.rotation.z = -1.9 * smooth(0.3, 1, ct);
    },
  };
}
const cutawayK = (S) => smooth(0, 1, clamp01(S.cutaway));
