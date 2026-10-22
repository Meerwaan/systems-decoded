// DOSSIER 024 — Bloc opératoire : the system. The medical IT (schéma IT médical) as ONE object, on its mounting plate.
// Its root's origin: the bottom centre of its shelf; its FRONT faces +z (the room, the camera). Sizes are ILLUSTRATIVE
// (plan.js) and nothing of any size, current or resistance is ever written on it. Left to right:
//   · THE MAINS — a sheathed cable that comes up from below at −x; at its gland it opens into its two live conductors
//     (dark) and its protective conductor (PE, light), which goes down to the earth bar
//   · THE ISOLATION TRANSFORMER — a laminated U–I core standing up (five wide sheets: the stripes read from the side
//     and the top), clamped in a mid-grey frame on two feet. On each leg ITS winding: the PRIMARY on the left (the
//     mains), the SECONDARY on the right (the circuit) — two clear warm coils, their turns in broad bands, that do not
//     touch: a gap of light between them (`apart`). A terminal block on the outer side of each. A mid-grey hood
//     (`cover`) over the top yoke: it lifts in the exploded view. Its frame has its own PE to the earth bar
//   · THE CIRCUIT — two live conductors (L1, L2) from the secondary up to the DIN rail: two BIPOLAR breakers (one per
//     outgoing circuit, a tie-bar handle each) and the INSULATION MONITOR (contrôleur permanent d'isolement): a
//     4-module box, its face a segmented bar gauge with NO figure, a LED, a test button; wired to L1, to L2 and to the
//     earth bar — it measures between them. The two circuits leave toward +x at OUT (in the cabinet they continue in
//     bloc.js's walls)
//   · THE EARTH BAR — a copper bar on insulators along the bottom: the mains PE, the frame's PE, the monitor's earth
//     wire and, on the bench, the casings' PEs land on it, each on its screw. The circuit's conductors never do
//   · ON THE BENCH ONLY — the two circuits run on to two stubs of appliance casings (sheet metal, a glass front to see
//     inside): circuit 1 → casing A (its L1 worn: the first fault), circuit 2 → casing B (its L2: the second fault).
//     Each casing has its PE to the earth bar, light, always visible. Three small capacitor marks (two plates face to
//     face) between the conductors' run and the bar: the tiny return path. The glass mounting plate is extended for them
//   · « CHEZ TOI » (`home`) — a bonding link from the secondary's L2 to the earth bar (as the neutral is at home), and a
//     ghost differential of glass on the rail
// Three values of grey: core, conductors, blocks dark · frame, hood, casings mid · coils, bar, modules clear.
// Light: INK the ordinary current (dashes running on the dark conductors) · VEILLE the system alive (the gap between
// the windings, the monitor's pulses and gauge, its LED, what the voice names, the ghost differential) · SIGNAL the
// threat (the wire on the metal, the fault current, the gauge when the insulation falls, the double-fault loop).
// Every flow is a head of light that moves along a conductor (a trail, never a dot), at most a seventh of its period
// per frame. The wires are rubber: their bends follow the parts when the system opens (no wire is cut by the explode).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, edgesOf, makePart, addMesh, anchor, box, cyl, lathe, plate, mergeGeometries, placed } from "@kit/build3d.js";
import { XFO, CPI, SYSTEM } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const TINT = new THREE.Color(0.55, 1, 0.8); // what veille light does to a grey
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.04 * (u > 0.5 ? 1 : 0.25);
const glsl3 = (c) => `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;

/* ─────────────────────────────────────────────────────────── greys */

const DARK = 0x2a3035; //   the core, the blocks, the handles
const WIRE = 0x23282c; //   a live conductor
const MID = 0x5d656b; //    the frame, the hood, the casings
const CLEAR = 0xd2cfc7; //  the modules' plastic
const WARM = 0xc9bca6; //   the windings: the clearest grey, warm
const COPPER = 0xb4a487; // the earth bar
const PEC = 0xbcb6a9; //    a protective conductor: light, ink-like
const XX = XFO.at[0]; //    the transformer's centre line (x)
const LEG = 11; //          its legs at XX ± LEG
const MAXP = 8; //          points of a wire

// how far each part goes in the exploded view (cm up), and in which window of `explode` it moves
const OPEN = { rail: [56, 0.0, 0.55], hood: [50, 0.08, 0.62], yoke: [34, 0.18, 0.75], coils: [27, 0.28, 0.9] };
// the flows: period (cm), speed (cm/s), trail length (cm). speed / 30 ≤ period / 7: nothing jumps between frames
const FLOW = {
  dash: { period: 3.2, speed: 9, duty: 0.24 },
  pulse: { period: 22, speed: 14, len: 7 },
  leak: { period: 12, speed: 30, len: 7 },
  dbl: { period: 12, speed: 44, len: 7 },
  trk: { period: 16, speed: 7, len: 4 },
};

/* ─────────────────────────────────────────────────────────── a conductor, as rubber */

const WIRE_VERT = /* glsl */ `
  uniform vec3 uP[${MAXP}];
  uniform float uN, uR;
  attribute float aK, aS;
  attribute vec3 aO;
  varying float vS;
  // the ring at control point k, on the deformed polyline: perpendicular to the bisector, mitred in the bend
  void wireFrame(out vec3 pos, out vec3 nrm) {
    int n = int(uN + 0.5);
    int k = int(aK + 0.5);
    vec3 c = uP[k];
    vec3 a = uP[max(k - 1, 0)];
    vec3 b = uP[min(k + 1, n - 1)];
    vec3 tin = c - a;
    vec3 tout = b - c;
    float li = length(tin);
    float lo = length(tout);
    tin = li > 1e-4 ? tin / li : (lo > 1e-4 ? tout / lo : vec3(1.0, 0.0, 0.0));
    tout = lo > 1e-4 ? tout / lo : tin;
    vec3 B = tin + tout;
    float lb = length(B);
    B = lb > 1e-4 ? B / lb : tout;
    vec3 o = aO - dot(aO, B) * B;
    float l2 = length(o);
    if (l2 < 1e-3) { pos = c; nrm = B; return; }
    o /= l2;
    vec3 v = o;
    vec3 N = tout - tin;
    float ln = length(N);
    if (ln > 1e-3) {
      N /= ln;
      float ch = clamp(dot(B, tout), 0.35, 1.0);
      v += N * dot(o, N) * (1.0 / ch - 1.0);
    }
    pos = c + v * uR;
    nrm = o;
  }
`;
const WIRE_FRAG = /* glsl */ `
  uniform vec4 uDash, uPulse, uHot, uTrk, uLit;
  uniform vec2 uDashS, uPulseS, uHotS, uTrkS;
  uniform float uFade;
  varying float vS;
  // a head moving toward +s, its trail behind it (u = 0 at the head)
  float sdHead(float s, vec4 c, float aa) {
    float u = fract((c.z - s) / c.y);
    float L = max(c.w / c.y, 0.02);
    float t = clamp(1.0 - u / L, 0.0, 1.0);
    return t * t * smoothstep(0.0, aa, u);
  }
  float sdDash(float s, vec4 c, float aa) {
    float u = fract((s - c.z) / c.y);
    return smoothstep(0.0, aa, u) * (1.0 - smoothstep(c.w - aa, c.w, u));
  }
  vec3 flowColor() {
    float fw = max(fwidth(vS), 1e-4);
    vec3 col = uLit.rgb * uLit.a;
    if (uDash.x > 0.001) {
      float q = fw / uDash.y;
      float d = sdDash(uDashS.x + uDashS.y * vS, uDash, clamp(1.5 * q, 0.01, 0.4));
      d = mix(d, uDash.w * 0.45, smoothstep(0.15, 0.5, q)); // under the pixel, a steady line
      col += ${glsl3(INK)} * (0.5 * uDash.x * d);
    }
    if (uPulse.x > 0.001) {
      float h = sdHead(uPulseS.x + uPulseS.y * vS, uPulse, clamp(1.5 * fw / uPulse.y, 0.004, 0.3));
      col += ${glsl3(VEILLE)} * (1.7 * uPulse.x * h);
    }
    if (uHot.x > 0.001) {
      float h = sdHead(uHotS.x + uHotS.y * vS, uHot, clamp(1.5 * fw / uHot.y, 0.004, 0.3));
      col += mix(${glsl3(SIGNAL)}, vec3(1.0, 0.92, 0.82), h * h * 0.45) * (3.4 * uHot.x * h);
    }
    if (uTrk.x > 0.001) {
      float h = sdHead(uTrkS.x + uTrkS.y * vS, uTrk, clamp(1.5 * fw / uTrk.y, 0.004, 0.3));
      col += ${glsl3(SIGNAL)} * (1.6 * uTrk.x * h);
    }
    return col * uFade;
  }
`;

/** A conductor's material: lit (`solid` kinds) or an additive overlay that only shows its flows (on the bar, on a sheet). */
function wireMaterial(kind, color) {
  const U = {
    uP: { value: Array.from({ length: MAXP }, () => new THREE.Vector3()) },
    uN: { value: 2 },
    uR: { value: 0.45 },
    uDash: { value: new THREE.Vector4(0, FLOW.dash.period, 0, FLOW.dash.duty) },
    uPulse: { value: new THREE.Vector4(0, FLOW.pulse.period, 0, FLOW.pulse.len) },
    uHot: { value: new THREE.Vector4(0, FLOW.leak.period, 0, FLOW.leak.len) },
    uTrk: { value: new THREE.Vector4(0, FLOW.trk.period, 0, FLOW.trk.len) },
    uDashS: { value: new THREE.Vector2(0, 1) },
    uPulseS: { value: new THREE.Vector2(0, 1) },
    uHotS: { value: new THREE.Vector2(0, 1) },
    uTrkS: { value: new THREE.Vector2(0, 1) },
    uLit: { value: new THREE.Vector4(0, 0, 0, 0) },
    uFade: { value: 1 },
  };
  const overlay = kind === "overlay";
  const mat = overlay
    ? new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    : new THREE.MeshStandardMaterial({ color, roughness: kind === "pe" ? 0.55 : 0.48, metalness: 0.12 });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>\n${WIRE_VERT}`)
      .replace("#include <beginnormal_vertex>", "vec3 objectNormal; { vec3 p_; wireFrame(p_, objectNormal); }")
      .replace("#include <begin_vertex>", "vec3 transformed; { vec3 n_; wireFrame(transformed, n_); } vS = aS;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>\n${WIRE_FRAG}`);
    sh.fragmentShader = overlay
      ? sh.fragmentShader.replace("#include <dithering_fragment>", "gl_FragColor = vec4(flowColor(), 1.0);")
      : sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n  totalEmissiveRadiance += flowColor();");
  };
  mat.customProgramCacheKey = () => `sd024-wire-${overlay ? "o" : "s"}`;
  mat.userData.U = U;
  return mat;
}

/** The rest geometry of a tube through `pts` (one ring per control point: the corners are mitred in the shader). */
function tubeGeometry(pts, radial = 10) {
  const n = pts.length;
  const P = pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const T = [];
  for (let k = 0; k < n; k++) {
    const tin = k > 0 ? P[k].clone().sub(P[k - 1]).normalize() : null;
    const tout = k < n - 1 ? P[k + 1].clone().sub(P[k]).normalize() : null;
    T.push((tin && tout ? tin.clone().add(tout) : (tin ?? tout).clone()).normalize());
  }
  // a frame carried along the polyline: no twist
  let u = new THREE.Vector3(0, 1, 0);
  if (Math.abs(u.dot(T[0])) > 0.9) u.set(1, 0, 0);
  const pos = [];
  const nor = [];
  const aK = [];
  const aS = [];
  const aO = [];
  const idx = [];
  let s = 0;
  for (let k = 0; k < n; k++) {
    if (k > 0) s += P[k].distanceTo(P[k - 1]);
    u = u.clone().sub(T[k].clone().multiplyScalar(u.dot(T[k]))).normalize();
    const w = new THREE.Vector3().crossVectors(T[k], u);
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const o = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a));
      pos.push(P[k].x + o.x * 0.4, P[k].y + o.y * 0.4, P[k].z + o.z * 0.4);
      nor.push(o.x, o.y, o.z);
      aO.push(o.x, o.y, o.z);
      aK.push(k);
      aS.push(s);
    }
  }
  for (let k = 0; k < n - 1; k++) {
    for (let j = 0; j < radial; j++) {
      const a = k * radial + j;
      const b = k * radial + ((j + 1) % radial);
      const c = a + radial;
      const d = b + radial;
      idx.push(a, c, b, b, c, d);
    }
  }
  // the two ends, closed
  for (const [k, sk, flip] of [[0, 0, true], [n - 1, s, false]]) {
    const centre = pos.length / 3;
    pos.push(P[k].x, P[k].y, P[k].z);
    nor.push(T[k].x * (flip ? -1 : 1), T[k].y * (flip ? -1 : 1), T[k].z * (flip ? -1 : 1));
    aO.push(0, 0, 0);
    aK.push(k);
    aS.push(sk);
    for (let j = 0; j < radial; j++) {
      const a = k * radial + j;
      const b = k * radial + ((j + 1) % radial);
      if (flip) idx.push(centre, b, a);
      else idx.push(centre, a, b);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("aO", new THREE.Float32BufferAttribute(aO, 3));
  g.setAttribute("aK", new THREE.Float32BufferAttribute(aK, 1));
  g.setAttribute("aS", new THREE.Float32BufferAttribute(aS, 1));
  g.setIndex(idx);
  return { geometry: g, length: s, rest: P };
}

/* ─────────────────────────────────────────────────────────── light that is drawn (017, 021) */

/** A billboard of light: a bright core and a long tail. `uRadius` cm, `uMinPx` its least size on screen. */
function ballMaterial(hue) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uRadius, uMinPx; varying vec2 vUv;
      void main() {
        vUv = position.xy;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        c.xy += position.xy * r;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        float core = exp(-r2 / 0.012);
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
        gl_FragColor = vec4((vec3(1.0, 0.97, 0.9) * (core * 1.6) + uHue * (body + tail)) * uAmount, 1.0);
      }`,
  });
}
function makeBall(hue) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ballMaterial(hue));
  mesh.renderOrder = 8;
  mesh.frustumCulled = false;
  mesh.visible = false;
  return mesh;
}
const shine = (ball, amount, radius, minPx = 0) => {
  ball.visible = amount > 0.004;
  const u = ball.material.uniforms;
  u.uAmount.value = amount;
  u.uRadius.value = radius;
  u.uMinPx.value = minPx;
};

/** A vertical strip of light in its own xy: bright down its middle, soft at its two ends (the gap between the windings). */
function stripMaterial(hue) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uHue: { value: hue.clone() }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float x = vUv.x;
        float core = exp(-x * x / 0.006);
        float body = 0.35 * exp(-x * x / 0.09);
        float ends = 1.0 - smoothstep(0.72, 1.0, abs(vUv.y));
        gl_FragColor = vec4((vec3(0.85, 1.0, 0.92) * core * 0.6 + uHue * (core + body)) * ends * uAmount, 1.0);
      }`,
  });
}

/** THE MONITOR'S GAUGE: eight cells in a column, no figure. The level it shows, veille; signal, frank, under half. */
function gaugeMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uIns: { value: 1 }, uOn: { value: 1 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uIns, uOn, uAmount; varying vec2 vUv;
      void main() {
        float N = 8.0;
        float y = vUv.y * N;
        float k = floor(y);
        float fy = fract(y);
        float cell = smoothstep(0.0, 0.1, fy) * (1.0 - smoothstep(0.84, 0.94, fy)) * smoothstep(0.0, 0.12, vUv.x) * (1.0 - smoothstep(0.88, 1.0, vUv.x));
        float level = (0.13 + 0.87 * clamp(uIns, 0.0, 1.0)) * N;
        float lit = clamp(level - k, 0.0, 1.0);
        float hot = smoothstep(0.55, 0.45, uIns);
        vec3 hue = mix(${glsl3(VEILLE)}, ${glsl3(SIGNAL)}, hot);
        vec3 off = ${glsl3(INK)} * 0.035;
        vec3 col = mix(off, hue * (0.5 + 1.3 * uOn), lit) * cell;
        gl_FragColor = vec4(col, uAmount);
      }`,
  });
}

/* ─────────────────────────────────────────────────────────── a DIN module's body */

/** The side profile of a modular device (back on the rail at d 0, its nose forward), `w` wide: from x0 to x0 + w. */
function dinBody(w, nose, poles = 1) {
  const outline = [[0, -4.5], [-4.4, -4.5], [-4.4, -nose], [-6.5, -nose], [-6.5, nose], [-4.4, nose], [-4.4, 4.5], [0, 4.5]];
  const one = plate(outline, w / poles - 0.04, { bevel: 0.12, round: 2 });
  const geos = [];
  for (let i = 0; i < poles; i++) geos.push(placed(one, { pos: [i * (w / poles) + 0.02, 0, 0], rotY: Math.PI / 2 }));
  return poles > 1 ? mergeGeometries(geos) : geos[0];
}

/* ─────────────────────────────────────────────────────────── the system */

export function buildSystem() {
  const root = new THREE.Group();
  root.name = "it-medical";

  /** Add a mesh to `part` (its materials registered there) but hang it on `parent` (a group that moves). */
  const put = (part, parent, geo, mat, o = {}) => {
    const mesh = addMesh(part, geo, mat, o);
    if (parent !== part) parent.add(mesh);
    return mesh;
  };
  const own = (mat) => {
    const copy = mat.clone();
    copy.userData = { ...mat.userData };
    return copy;
  };

  /* ── THE TRANSFORMER: its part, and the groups that move inside it ── */
  const xfo = makePart("xfo");
  root.add(xfo);
  const yokeG = new THREE.Group(); //  the top I and its clamps
  const coilPG = new THREE.Group(); // the primary and its terminal block
  const coilSG = new THREE.Group(); // the secondary and its terminal block
  const gapG = new THREE.Group(); //   the light between them
  xfo.add(yokeG, coilPG, coilSG, gapG);

  const coreMat = solid(DARK, { rough: 0.5, metal: 0.35 });
  const frameMat = solid(MID, { rough: 0.55, metal: 0.4 });
  const boltMat = solid(0x9aa0a4, { rough: 0.4, metal: 0.5 });
  // the core: five sheets with a groove between them (stacked through the depth), a U standing and its I on top
  const SHEET = 1.64;
  const GAP = 0.2;
  const zs = [0, 1, 2, 3, 4].map((i) => -4.5 + i * (SHEET + GAP));
  const uOutline = [[-16, 0], [16, 0], [16, 30], [6, 30], [6, 8], [-6, 8], [-6, 30], [-16, 30]];
  const uSheet = plate(uOutline, SHEET, { bevel: 0.08, round: 1 });
  const iSheet = box(32, 8, SHEET, 0.08, 1);
  put(xfo, xfo, mergeGeometries(zs.map((z) => placed(uSheet, { pos: [XX, 0, z] }))), coreMat, { edgeOpacity: 0.32 });
  put(xfo, yokeG, mergeGeometries(zs.map((z) => placed(iSheet, { pos: [XX, 34, z + SHEET / 2] }))), coreMat, { edgeOpacity: 0.32 });
  // the frame: two feet with their clamps on the bottom yoke, two clamps on the top one (they go with it), bolts
  for (const s of [-1, 1]) {
    put(xfo, xfo, box(44, 1.2, 3, 0.15), frameMat, { pos: [XX, 0.6, s * 6], edgeOpacity: 0.5 });
    put(xfo, xfo, box(40, 6, 0.6, 0.12), frameMat, { pos: [XX, 3.6, s * 4.85], edgeOpacity: 0.5 });
    put(xfo, yokeG, box(40, 5.4, 0.6, 0.12), frameMat, { pos: [XX, 34, s * 4.85], edgeOpacity: 0.5 });
    for (const bx of [-12, 0, 12]) {
      put(xfo, xfo, cyl(0.55, 0.5, 0.1, 16), boltMat, { pos: [XX + bx, 4, s * 5.4], rot: [Math.PI / 2, 0, 0], edges: false });
      put(xfo, yokeG, cyl(0.55, 0.5, 0.1, 16), boltMat, { pos: [XX + bx, 34, s * 5.4], rot: [Math.PI / 2, 0, 0], edges: false });
    }
  }
  // the windings: broad turns (bands of light, not fine lines), two dark flanges; one material each (each is named)
  const N_TURNS = 14;
  const pitch = 19.6 / N_TURNS;
  const prof = [[7.0, -9.8], [8.15, -9.8]];
  for (let i = 0; i < N_TURNS; i++) {
    const y0 = -9.8 + i * pitch;
    prof.push([8.52, y0 + 0.3 * pitch], [8.52, y0 + 0.7 * pitch], [8.15, y0 + pitch]);
  }
  prof.push([7.0, 9.8], [7.0, -9.8]);
  const coilGeo = lathe(prof, 72, { crease: 30 });
  const flangeGeo = lathe([[7.0, -0.35], [9.2, -0.35], [9.2, 0.35], [7.0, 0.35], [7.0, -0.35]], 72, { bevel: 0.12, round: 2 });
  const coilBase = solid(WARM, { rough: 0.42, metal: 0.32 });
  const flangeBase = solid(0x23282c, { rough: 0.6, metal: 0.1 });
  const blockBase = solid(0x30363b, { rough: 0.55, metal: 0.15 });
  const screwBase = solid(0xa8adb0, { rough: 0.35, metal: 0.5 });
  const coilP = { mats: [own(coilBase), own(flangeBase), own(blockBase)] };
  const coilS = { mats: [own(coilBase), own(flangeBase), own(blockBase)] };
  const cy = XFO.coil.y;
  for (const [G, side, mats, bx] of [[coilPG, -1, coilP.mats, -38.6], [coilSG, 1, coilS.mats, 6.6]]) {
    const cx = XX + side * LEG;
    put(xfo, G, coilGeo, mats[0], { pos: [cx, cy, 0], edges: false });
    for (const dy of [-10.15, 10.15]) put(xfo, G, flangeGeo, mats[1], { pos: [cx, cy + dy, 0], edgeOpacity: 0.45 });
    // its terminal block, on the outer side, its two screws where the conductors land
    put(xfo, G, box(4, 10, 7.5, 0.25), mats[2], { pos: [bx, 30, 1.75], edgeOpacity: 0.55 });
    const face = bx + side * 2.05;
    for (const ty of [32, 28]) put(xfo, G, cyl(0.6, 0.4, 0.1, 16), screwBase, { pos: [face, ty, side < 0 ? 1.5 : 3.8], rot: [0, 0, Math.PI / 2], edges: false });
  }
  // the gap: a strip of light between the two windings
  const stripMat = stripMaterial(VEILLE);
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 22), stripMat);
  strip.position.set(XX, cy, 6.5);
  strip.renderOrder = 7;
  strip.visible = false;
  gapG.add(strip);

  /* ── THE HOOD (cover), over the top yoke ── */
  const cover = makePart("cover");
  root.add(cover);
  const hoodMat = solid(MID, { rough: 0.5, metal: 0.42 });
  const ventMat = solid(0x1c2024, { rough: 0.8, metal: 0 });
  addMesh(cover, box(42, 1, 25, 0.25), hoodMat, { pos: [XX, 45.5, 0], edgeOpacity: 0.6 });
  for (const s of [-1, 1]) addMesh(cover, box(0.8, 10, 25, 0.15), hoodMat, { pos: [XX + s * 20.6, 41, 0], edgeOpacity: 0.55 });
  addMesh(cover, box(42, 10, 0.8, 0.15), hoodMat, { pos: [XX, 41, -12.1], edgeOpacity: 0.5 });
  addMesh(cover, box(42, 3, 0.8, 0.15), hoodMat, { pos: [XX, 44.5, 12.1], edgeOpacity: 0.6 });
  for (let i = 0; i < 5; i++) addMesh(cover, box(16, 0.14, 1.3, 0.05), ventMat, { pos: [XX, 46.04, -7.2 + i * 3.6], edges: false });

  /* ── THE RAIL: the breakers, the monitor, the ghost differential (they all go up together) ── */
  const railG = new THREE.Group();
  root.add(railG);
  const railMat = solid(0xa9aeb2, { rough: 0.4, metal: 0.45 });
  const standMat = solid(0x30363b, { rough: 0.6, metal: 0.2 });
  const railMesh = new THREE.Mesh(box(40, 3.5, 0.75, 0.1), railMat);
  railMesh.position.set(17, 56, 1.6);
  railMesh.add(edgesOf(railMesh.geometry, { color: 0x1d2226, width: 1.8, opacity: 0.6 }));
  railG.add(railMesh);
  for (const sx of [0, 32]) {
    const m = new THREE.Mesh(box(2, 2, 14.6, 0.15), standMat);
    m.position.set(sx, 56, -5.7);
    railG.add(m);
  }

  // two bipolar breakers (two poles, one tie-bar handle each): circuit 1 (→ casing A) and circuit 2 (→ casing B)
  const breakers = makePart("breakers");
  railG.add(breakers);
  const bodyMat = solid(CLEAR, { rough: 0.6, coat: 0.2 });
  const handleMat = solid(DARK, { rough: 0.45, metal: 0.1 });
  const slotMat = solid(0x1c2024, { rough: 0.7 });
  const brkBody = dinBody(3.6, 2.4, 2);
  const handles = [];
  for (const x0 of [0.2, 3.8]) {
    addMesh(breakers, brkBody, bodyMat, { pos: [x0, 56, 2.0] });
    addMesh(breakers, box(3.0, 2.6, 0.12, 0.04), slotMat, { pos: [x0 + 1.8, 56, 8.52], edges: false });
    const pivot = new THREE.Group();
    pivot.position.set(x0 + 1.8, 56, 8.5);
    breakers.add(pivot);
    put(breakers, pivot, box(3.0, 0.95, 2.0, 0.22), handleMat, { pos: [0, 0, 1.0], edgeOpacity: 0.7 });
    handles.push(pivot);
    for (const px of [0.9, 2.7]) for (const ty of [60.5, 51.5]) addMesh(breakers, cyl(0.42, 0.3, 0.08, 14), screwBase, { pos: [x0 + px, ty + (ty > 56 ? 0.15 : -0.15), 4.2], edges: false });
  }

  // the insulation monitor: a 4-module box, its face a dark window, a column gauge (no figure), a LED, a test button
  const cpi = makePart("cpi");
  railG.add(cpi);
  const [CXc, CYc] = CPI.at;
  const cpiBody = solid(CLEAR, { rough: 0.6, coat: 0.2 });
  addMesh(cpi, dinBody(7.2, 3.7, 4), cpiBody, { pos: [CXc - 3.6, CYc, 2.0] });
  const windowMat = solid(0x15191c, { rough: 0.22, metal: 0.1 });
  addMesh(cpi, box(6.4, 6.8, 0.12, 0.05), windowMat, { pos: [CXc, CYc, 8.55], edgeOpacity: 0.4 });
  const gaugeMat = gaugeMaterial();
  const gauge = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 5.6), gaugeMat);
  gauge.position.set(CXc - 1.55, CYc, 8.63);
  gauge.renderOrder = 5;
  cpi.add(gauge);
  const ledMat = glow(BRAND.veille, 0.18);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), ledMat);
  led.rotation.x = Math.PI / 2;
  led.position.set(CXc + 1.6, CYc + 1.7, 8.6);
  cpi.add(led);
  cpi.userData.part.mats.add(ledMat);
  const ledBall = makeBall(VEILLE);
  ledBall.position.set(CXc + 1.6, CYc + 1.7, 9.1);
  cpi.add(ledBall);
  addMesh(cpi, cyl(0.62, 0.35, 0.1, 24), solid(0x2c3236, { rough: 0.5 }), { pos: [CXc + 1.6, CYc - 1.5, 8.72], rot: [Math.PI / 2, 0, 0], edgeOpacity: 0.7 });
  for (const tx of [19.6, 21.4, 24.4]) addMesh(cpi, cyl(0.42, 0.3, 0.08, 14), screwBase, { pos: [tx, CYc - 4.65, 4.2], edges: false });
  for (const tx of [19.6, 24.4]) addMesh(cpi, cyl(0.42, 0.3, 0.08, 14), screwBase, { pos: [tx, CYc + 4.65, 4.2], edges: false });

  // « chez toi »: a ghost differential of glass, on the rail
  const ghost = makePart("ghost");
  railG.add(ghost);
  const ghostGlass = glass(BRAND.ink, { base: 0, rim: 0.3, edge: 0.55, spec: 0.3, through: 0.15 });
  const ghostGeo = dinBody(3.6, 2.4, 1);
  const ghostMesh = new THREE.Mesh(ghostGeo, ghostGlass);
  ghostMesh.position.set(30.2, 56, 2.0);
  ghost.add(ghostMesh);
  asShell([ghostMesh], 22);
  const ghostLines = edgesOf(ghostGeo, { color: BRAND.ink, width: 2, opacity: 0.6 });
  ghostMesh.add(ghostLines);
  ghost.userData.part.mats.add(ghostLines.material);
  const ghostBall = makeBall(VEILLE);
  ghostBall.position.set(32, 56, 9.2);
  ghost.add(ghostBall);

  /* ── THE EARTH BAR ── */
  const earth = makePart("earth");
  root.add(earth);
  const barMat = solid(COPPER, { rough: 0.38, metal: 0.45 });
  const insMat = solid(0x2c3236, { rough: 0.7 });
  addMesh(earth, box(100, 1.6, 2, 0.18), barMat, { pos: [20, 3, 10], edgeOpacity: 0.7 });
  for (const ix of [-22, 20, 62]) addMesh(earth, box(2.4, 2.2, 2, 0.2), insMat, { pos: [ix, 1.1, 10], edgeOpacity: 0.4 });
  const LAND = { mainsPE: -24, framePE: -28, link: 9.6, cpiPE: 24.4, caps: [38, 42, 46], peB: 64, peA: 68 };
  const earthScrewMat = solid(0xd9d5cc, { rough: 0.35, metal: 0.5 });
  for (const sx of [LAND.mainsPE, LAND.framePE, LAND.link, LAND.cpiPE, ...LAND.caps, LAND.peB, LAND.peA]) {
    addMesh(earth, cyl(0.62, 0.5, 0.12, 16), earthScrewMat, { pos: [sx, 4.05, 10], edges: false });
  }

  /* ── THE MOUNTING PLATE (glass) ── */
  const plateGlass = glass(BRAND.ink, { base: 0, rim: 0.1, edge: 0.3, spec: 0.12, through: 0.08 });
  const plateMesh = new THREE.Mesh(box(86, 72, 1, 0.3), plateGlass);
  plateMesh.position.set(-3, 36, -13.5);
  const plateLines = edgesOf(plateMesh.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.28 });
  plateMesh.add(plateLines);
  root.add(plateMesh);
  asShell([plateMesh], 24);

  /* ── THE MAINS CABLE (its sheath) and the gland ── */
  const sheathMat = solid(0x262b2f, { rough: 0.62, metal: 0.05 });
  const wiresG = new THREE.Group();
  root.add(wiresG);

  /* ── ON THE BENCH: the two casings, their PEs, the capacitor marks, the plate's extension ── */
  const stubs = makePart("stubs");
  root.add(stubs);
  const caseMat = solid(MID, { rough: 0.5, metal: 0.42 });
  const caseGlass = glass(BRAND.ink, { base: 0, rim: 0.16, edge: 0.45, spec: 0.45, through: 0.25 });
  const termMat = solid(0x30363b, { rough: 0.55 });
  const sleeveMat = solid(WARM, { rough: 0.35, metal: 0.4 });
  const capMat = solid(PEC, { rough: 0.45, metal: 0.25 });
  const glassFronts = [];
  const CASES = { A: { cy: 40, term: 40.25 }, B: { cy: 18, term: 18.25 } };
  for (const key of ["A", "B"]) {
    const { cy: yc, term } = CASES[key];
    addMesh(stubs, box(12, 0.4, 10, 0.08), caseMat, { pos: [60, yc + 4.8, 0], edgeOpacity: 0.7 });
    addMesh(stubs, box(12, 0.4, 10, 0.08), caseMat, { pos: [60, yc - 4.8, 0], edgeOpacity: 0.7 });
    addMesh(stubs, box(0.4, 10, 10, 0.08), caseMat, { pos: [54.2, yc, 0], edgeOpacity: 0.7 });
    addMesh(stubs, box(0.4, 10, 10, 0.08), caseMat, { pos: [65.8, yc, 0], edgeOpacity: 0.7 });
    addMesh(stubs, box(12, 10, 0.4, 0.08), caseMat, { pos: [60, yc, -4.8], edgeOpacity: 0.5 });
    // a few screws on the sheet
    for (const [sx, sy] of [[55.2, yc + 3.8], [64.8, yc + 3.8], [55.2, yc - 3.8], [64.8, yc - 3.8]]) {
      addMesh(stubs, cyl(0.36, 0.2, 0.06, 12), screwBase, { pos: [sx, sy, 4.9], rot: [Math.PI / 2, 0, 0], edges: false });
    }
    const front = new THREE.Mesh(box(11.2, 9.2, 0.15, 0.05), caseGlass);
    front.position.set(60, yc, 4.9);
    stubs.add(front);
    glassFronts.push(front);
    addMesh(stubs, box(1.8, 7, 3.4, 0.15), termMat, { pos: [64.5, term, 2.6], edgeOpacity: 0.5 });
    for (const bx of [57, 63]) addMesh(stubs, box(2, 2, 8, 0.15), standMat, { pos: [bx, yc, -9], edges: false });
  }
  asShell(glassFronts, 18);
  addMesh(stubs, cyl(0.5, 0.6, 0.1, 16), screwBase, { pos: [66.3, 37, 2], rot: [0, 0, Math.PI / 2], edges: false }); // A's earth stud
  addMesh(stubs, cyl(0.5, 0.6, 0.1, 16), screwBase, { pos: [64, 12.7, 2], edges: false }); //                         B's earth stud
  // the worn spots: a short bare length on the faulting wire of each (they move with the wire)
  const sleeveA = addMesh(stubs, cyl(0.5, 1.5, 0.1, 16), sleeveMat, { rot: [0, 0, Math.PI / 2], edges: false });
  const sleeveB = addMesh(stubs, cyl(0.5, 1.5, 0.1, 16), sleeveMat, { rot: [0, 0, Math.PI / 2], edges: false });
  // the three capacitor marks: two plates face to face on a lead from the bar to the conductors' run
  for (const x of LAND.caps) {
    addMesh(stubs, box(2.8, 0.34, 1.9, 0.06), capMat, { pos: [x, 29.55, 3.6], edgeOpacity: 0.5 });
    addMesh(stubs, box(2.8, 0.34, 1.9, 0.06), capMat, { pos: [x, 30.65, 3.6], edgeOpacity: 0.5 });
  }
  const extGlass = glass(BRAND.ink, { base: 0, rim: 0.1, edge: 0.3, spec: 0.12, through: 0.08 });
  // on the bench, the plate is the whole width (one piece: no seam in the middle of the picture)
  const extMesh = new THREE.Mesh(box(118, 72, 1, 0.3), extGlass);
  extMesh.position.set(13, 36, -13.5);
  const extLines = edgesOf(extMesh.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.28 });
  extMesh.add(extLines);
  stubs.add(extMesh);
  asShell([extMesh], 24);
  const faultA = makeBall(SIGNAL);
  faultA.position.set(60, 44.4, 3.9);
  const faultB = makeBall(SIGNAL);
  faultB.position.set(60, 13.6, 3.9);
  stubs.add(faultA, faultB);

  /* ─────────────── THE CONDUCTORS ─────────────── */
  // A point is [x, y, z, mover?]: it follows that mover (an offset written every frame) — the bends follow the parts.
  const M = { fix: new THREE.Vector3(), prim: new THREE.Vector3(), sec: new THREE.Vector3(), rail: new THREE.Vector3(), fA: new THREE.Vector3(), fB: new THREE.Vector3() };
  const W = {};
  const wires = [];
  const R = { live: 0.45, pe: 0.42, lead: 0.27, overlay: 0.52, cable: 1.15 };
  const COLOR = { live: WIRE, pe: PEC, lead: PEC, cable: 0x262b2f };
  /** name, points, { kind, fam (L1 | L2 | mL | mN), beyond (past the breakers), parent } */
  const wire = (name, pts, { kind = "live", fam = null, beyond = false, parent = wiresG } = {}) => {
    const { geometry, length, rest } = tubeGeometry(pts);
    const mat = wireMaterial(kind, COLOR[kind] ?? WIRE);
    const U = mat.userData.U;
    U.uN.value = pts.length;
    U.uR.value = R[kind];
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = kind !== "overlay";
    mesh.renderOrder = kind === "overlay" ? 6 : 0;
    parent.add(mesh);
    const w = { name, mesh, mat, U, rest, movers: pts.map((p) => M[p[3] ?? "fix"]), length, kind, fam, beyond, cfg: {} };
    for (let k = 0; k < pts.length; k++) U.uP.value[k].copy(rest[k]);
    W[name] = w;
    wires.push(w);
    return w;
  };
  // the mains: the cable up from below, its gland, then L and N to the primary's block, its PE down to the bar
  wire("cable", [[-64, -4, 1.5], [-64, 20, 1.5], [-48, 20, 1.5]], { kind: "cable" });
  const gland = new THREE.Mesh(cyl(1.6, 1.2, 0.15, 24), sheathMat);
  gland.position.set(-48.4, 20, 1.5);
  gland.rotation.z = Math.PI / 2;
  gland.add(edgesOf(gland.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.5 }));
  root.add(gland);
  wire("mainsL", [[-48, 20.6, 1.8], [-44, 20.6, 1.8], [-44, 32, 1.8, "prim"], [-40.6, 32, 1.5, "prim"]], { fam: "mL" });
  wire("mainsN", [[-48, 19.6, 1.0], [-43, 19.6, 1.0], [-43, 28, 1.0, "prim"], [-40.6, 28, 1.5, "prim"]], { fam: "mN" });
  wire("mainsPE", [[-48, 19.2, 0.2], [-48, 8, 0.2], [-48, 8, 10], [LAND.mainsPE, 8, 10], [LAND.mainsPE, 4.2, 10]], { kind: "pe" });
  wire("framePE", [[-35, 1.4, 7.2], [-35, 6.5, 7.2], [-35, 6.5, 10], [LAND.framePE, 6.5, 10], [LAND.framePE, 4.2, 10]], { kind: "pe" });
  // the secondary: L1 (inner, behind) and L2 (outer, in front) up to the rail, split at each junction
  wire("L1lead", [[8.6, 32, 3.0, "sec"], [11, 32, 3.0, "sec"], [11, 47.8, 3.0, "rail"]], { fam: "L1" });
  wire("L2a", [[8.6, 28, 3.8, "sec"], [9.6, 28, 4.6, "sec"]], { fam: "L2" });
  wire("L2b", [[9.6, 28, 4.6, "sec"], [12.4, 28, 4.6, "sec"], [12.4, 49.2, 4.6, "rail"]], { fam: "L2" });
  wire("L1left", [[11, 47.8, 3.0, "rail"], [4.7, 47.8, 3.0, "rail"]], { fam: "L1" });
  wire("L1left2", [[4.7, 47.8, 3.0, "rail"], [1.1, 47.8, 3.0, "rail"], [1.1, 51.5, 4.2, "rail"]], { fam: "L1" });
  wire("L1drop2", [[4.7, 47.8, 3.0, "rail"], [4.7, 51.5, 4.2, "rail"]], { fam: "L1" });
  wire("L1right", [[11, 47.8, 3.0, "rail"], [21.4, 47.8, 3.0, "rail"], [21.4, 51.5, 4.2, "rail"]], { fam: "L1" });
  wire("L2left", [[12.4, 49.2, 4.6, "rail"], [6.5, 49.2, 4.6, "rail"]], { fam: "L2" });
  wire("L2drop2", [[6.5, 49.2, 4.6, "rail"], [6.5, 51.5, 4.2, "rail"]], { fam: "L2" });
  wire("L2left2", [[6.5, 49.2, 4.6, "rail"], [2.9, 49.2, 4.6, "rail"], [2.9, 51.5, 4.2, "rail"]], { fam: "L2" });
  wire("L2right", [[12.4, 49.2, 4.6, "rail"], [19.6, 49.2, 4.6, "rail"], [19.6, 51.5, 4.2, "rail"]], { fam: "L2" });
  wire("cpiPE", [[24.4, 51.5, 4.2, "rail"], [24.4, 7, 4.2], [24.4, 7, 10], [LAND.cpiPE, 4.2, 10]], { kind: "pe" });
  // the two circuits out of the breakers, to OUT (circuit 1: the upper rows, circuit 2: the lower ones)
  wire("rA1in", [[1.1, 60.5, 4.2, "rail"], [1.1, 65.9, 3.6, "rail"], [36, 65.9, 3.6, "rail"]], { fam: "L1", beyond: true });
  wire("rA2in", [[2.9, 60.5, 4.2, "rail"], [2.9, 64.6, 3.6, "rail"], [36, 64.6, 3.6, "rail"]], { fam: "L2", beyond: true });
  wire("rB1in", [[4.7, 60.5, 4.2, "rail"], [4.7, 63.3, 3.6, "rail"], [36, 63.3, 3.6, "rail"]], { fam: "L1", beyond: true });
  wire("rB2in", [[6.5, 60.5, 4.2, "rail"], [6.5, 62.0, 3.6, "rail"], [36, 62.0, 3.6, "rail"]], { fam: "L2", beyond: true });
  // « chez toi »: the bond from L2 to the bar
  const link = wire("link", [[9.6, 28, 4.6, "sec"], [9.6, 6, 4.6], [9.6, 6, 10], [LAND.link, 4.2, 10]]);
  // the earth bar's flows (overlays on its front face), cut at each landing
  const BY = 3.0;
  const BZ = 11.1;
  wire("E1", [[LAND.peA, BY, BZ], [LAND.peB, BY, BZ]], { kind: "overlay", parent: stubs });
  wire("E2", [[LAND.peB, BY, BZ], [46, BY, BZ]], { kind: "overlay", parent: stubs });
  wire("E3", [[46, BY, BZ], [42, BY, BZ]], { kind: "overlay", parent: stubs });
  wire("E4", [[42, BY, BZ], [38, BY, BZ]], { kind: "overlay", parent: stubs });
  wire("E5", [[38, BY, BZ], [LAND.cpiPE, BY, BZ]], { kind: "overlay" });
  wire("E6", [[LAND.cpiPE, BY, BZ], [LAND.link, BY, BZ]], { kind: "overlay" });
  wire("E7", [[LAND.link, BY, BZ], [-30, BY, BZ]], { kind: "overlay" });
  // bench only: the runs on to the casings, the wires inside them, their PEs, the capacitor leads
  const S = { parent: stubs, beyond: true };
  wire("rA1st", [[36, 65.9, 3.6, "rail"], [51.6, 65.9, 3.6], [51.6, 42, 3.6], [54.6, 42, 3.6]], { ...S, fam: "L1" });
  wire("rA2st", [[36, 64.6, 3.6, "rail"], [50.4, 64.6, 3.6], [50.4, 38.5, 3.6], [54.6, 38.5, 3.6]], { ...S, fam: "L2" });
  wire("rB1st", [[36, 63.3, 3.6, "rail"], [49.2, 63.3, 3.6], [49.2, 20, 3.6], [54.6, 20, 3.6]], { ...S, fam: "L1" });
  wire("rB2st", [[36, 62.0, 3.6, "rail"], [48, 62.0, 3.6], [48, 16.5, 3.6], [54.6, 16.5, 3.6]], { ...S, fam: "L2" });
  wire("inA1", [[54.6, 42, 3.6], [57.5, 42, 3.6], [60, 42.6, 3.6, "fA"]], { ...S, fam: "L1" });
  wire("inA2", [[60, 42.6, 3.6, "fA"], [62.5, 42, 3.6], [63.6, 42, 3.6]], { ...S, fam: "L1" });
  wire("inAL2", [[54.6, 38.5, 3.6], [63.6, 38.5, 3.6]], { ...S, fam: "L2" });
  wire("inBL1", [[54.6, 20, 3.6], [63.6, 20, 3.6]], { ...S, fam: "L1" });
  wire("inB1", [[54.6, 16.5, 3.6], [57.5, 16.5, 3.6], [60, 15.9, 3.6, "fB"]], { ...S, fam: "L2" });
  wire("inB2", [[60, 15.9, 3.6, "fB"], [62.5, 16.5, 3.6], [63.6, 16.5, 3.6]], { ...S, fam: "L2" });
  wire("sheetA", [[60, 44.3, 3.6], [65.3, 44.3, 3.6], [65.3, 37, 3.6], [66.6, 37, 2.6]], { kind: "overlay", parent: stubs });
  wire("sheetB", [[60, 13.7, 3.6], [64, 13.7, 3.6], [64, 12.4, 2.6]], { kind: "overlay", parent: stubs });
  wire("peA", [[66.6, 37, 2], [68, 37, 2], [68, 8, 2], [68, 8, 10], [LAND.peA, 4.2, 10]], { kind: "pe", parent: stubs });
  wire("peB", [[64, 12.4, 2], [64, 8, 2], [64, 8, 10], [LAND.peB, 4.2, 10]], { kind: "pe", parent: stubs });
  for (const x of LAND.caps) {
    wire(`capLo${x}`, [[x, 4.2, 10], [x, 6.5, 10], [x, 6.5, 3.6], [x, 29.4, 3.6]], { kind: "lead", parent: stubs });
    wire(`capHi${x}`, [[x, 30.8, 3.6], [x, 61.6, 3.6]], { kind: "lead", parent: stubs });
  }

  /* ── the flows' coordinates: each wire's place along a path (s0, direction), so that the heads run on ── */
  /** Walk a path from s: items are [wire, reversed?] or a gap in cm. Returns the s at its end. */
  const walk = (key, s, items) => {
    for (const it of items) {
      if (typeof it === "number") { s += it; continue; }
      const [name, rev] = it;
      const w = W[name];
      w.cfg[key] = rev ? [s + w.length, -1] : [s, 1];
      s += w.length;
    }
    return s;
  };
  const len = (...names) => names.reduce((a, n) => a + W[n].length, 0);
  const POLE = 9; // through a breaker's pole
  // the ordinary current, from the secondary out on L1, back on L2 (and in the mains: in on L, back on N)
  walk("dash", 0, [["mainsL"]]);
  walk("dash", 0, [["mainsN"]]);
  walk("dash", 0, [["L1lead"], ["L1left"], ["L1left2"], POLE, ["rA1in"], ["rA1st"], ["inA1"], ["inA2"]]);
  walk("dash", len("L1lead", "L1left"), [["L1drop2"], POLE, ["rB1in"], ["rB1st"], ["inBL1"]]);
  walk("dash", 0, [["L2a"], ["L2b"], ["L2left"]]);
  walk("dash", len("L2a", "L2b", "L2left"), [["L2left2"], POLE, ["rA2in"], ["rA2st"], ["inAL2"]]);
  walk("dash", len("L2a", "L2b", "L2left"), [["L2drop2"], POLE, ["rB2in"], ["rB2st"], ["inB1"], ["inB2"]]);
  for (const w of wires) if ((w.fam === "L2" || w.fam === "mN") && w.cfg.dash) w.cfg.dash = [-w.cfg.dash[0], -w.cfg.dash[1]];
  // the monitor's pulses: from its terminals out into the two conductors, everywhere
  let j = walk("pulse", 0, [["L1right", true]]);
  walk("pulse", j, [["L1lead", true]]);
  const k1 = walk("pulse", j, [["L1left"]]);
  walk("pulse", k1, [["L1left2"], POLE, ["rA1in"], ["rA1st"], ["inA1"], ["inA2"]]);
  walk("pulse", k1, [["L1drop2"], POLE, ["rB1in"], ["rB1st"], ["inBL1"]]);
  j = walk("pulse", 0, [["L2right", true]]);
  walk("pulse", j, [["L2b", true], ["L2a", true]]);
  const k2 = walk("pulse", j, [["L2left"]]);
  walk("pulse", k2, [["L2left2"], POLE, ["rA2in"], ["rA2st"], ["inAL2"]]);
  walk("pulse", k2, [["L2drop2"], POLE, ["rB2in"], ["rB2st"], ["inB1"], ["inB2"]]);
  // the fault current at home (a whole loop): casing A → its PE → the bar → the bond → the secondary → L1 → casing A
  walk("leak", 0, [["sheetA"], 1.2, ["peA"], 1.3, ["E1"], ["E2"], ["E3"], ["E4"], ["E5"], ["E6"], 1.3, ["link", true], ["L2a", true], 20, ["L1lead"], ["L1left"], ["L1left2"], POLE, ["rA1in"], ["rA1st"], ["inA1"]]);
  // here (IT): a trickle, that only gets through the three marks
  const t0 = walk("trk", 0, [["sheetA"], 1.2, ["peA"], 1.3, ["E1"], ["E2"]]);
  walk("trk", t0, [1.3, ["capLo46"], 1.4, ["capHi46"]]);
  const t1 = walk("trk", t0, [["E3"]]);
  walk("trk", t1, [1.3, ["capLo42"], 1.4, ["capHi42"]]);
  const t2 = walk("trk", t1, [["E4"]]);
  walk("trk", t2, [1.3, ["capLo38"], 1.4, ["capHi38"]]);
  // the double fault: casing A → PE → the bar → PE → casing B → its L2 → breaker 2 → the secondary → L1 → breaker 1 → casing A
  walk("dbl", 0, [["sheetA"], 1.2, ["peA"], 1.3, ["E1"], 1.3, ["peB", true], 1.2, ["sheetB", true], ["inB1", true], ["rB2st", true], ["rB2in", true], POLE, ["L2drop2", true], ["L2left", true], ["L2b", true], ["L2a", true], 20, ["L1lead"], ["L1left"], ["L1left2"], POLE, ["rA1in"], ["rA1st"], ["inA1"]]);

  const LIT_SEC = wires.filter((w) => w.fam === "L1" || w.fam === "L2");
  const LIT_PRIM = [W.mainsL, W.mainsN, W.cable];
  const LIT_EARTH = [W.E1, W.E2, W.E3, W.E4, W.E5, W.E6, W.E7];

  /* ── anchors ── */
  const A = {
    xfo: anchor(yokeG, XX, 38, 0),
    primary: anchor(coilPG, XX - LEG, cy, 8.6),
    secondary: anchor(coilSG, XX + LEG, cy, 8.6),
    mains: anchor(root, -50, 20, 1.5),
    breakers: anchor(railG, 3.8, 56, 9.6),
    cpi: anchor(railG, CXc, CYc, 8.7),
    gauge: anchor(railG, CXc - 1.55, CYc, 8.7),
    out: anchor(root, 36, 64, 3.6),
    earth: anchor(root, 20, 3, 11.1),
    caseA: anchor(stubs, 60, 44.6, 3.6),
    caseB: anchor(stubs, 60, 13.4, 3.6),
    ghost: anchor(railG, 32, 56, 8.7),
    centre: anchor(root, ...SYSTEM.centre),
  };

  /* ── what lights up when the voice names a part: its solids, and the lines of its edges ── */
  const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  const lampOf = (mats) => {
    const lines = mats.filter((m) => m.isLineMaterial);
    for (const line of lines) line.userData.rest = line.color.clone();
    const solids = mats.filter((m) => m.isMeshStandardMaterial && !m.userData.U);
    for (const m of solids) {
      m.userData.rest = m.color.clone();
      m.userData.tint = m.color.clone().multiply(TINT);
      m.userData.glow = 0.14 * (1 - 0.75 * Math.min(1, lum(m.color)));
    }
    return { solids, lines, k: -1 };
  };
  const light = (lamp, k) => {
    if (lamp.k === k) return;
    lamp.k = k;
    for (const m of lamp.solids) {
      m.emissive.copy(VEILLE).multiplyScalar(m.userData.glow * k);
      m.color.copy(m.userData.rest).lerp(m.userData.tint, 0.6 * k);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };
  const linesOf = (meshes) => meshes.flatMap((m) => m.children.filter((c) => c.material?.isLineMaterial).map((c) => c.material));
  const meshesIn = (G) => G.children.filter((c) => c.isMesh);
  const coreMats = [coreMat, frameMat, ...linesOf([...meshesIn(xfo), ...meshesIn(yokeG)])];
  const lamps = {
    core: lampOf(coreMats),
    prim: lampOf([...coilP.mats, ...linesOf(meshesIn(coilPG))]),
    sec: lampOf([...coilS.mats, ...linesOf(meshesIn(coilSG))]),
    cpi: lampOf([cpiBody, ...linesOf(meshesIn(cpi))]),
    earth: lampOf([barMat, ...linesOf(meshesIn(earth))]),
  };

  const ON = -34 * DEG;
  const OFF = 40 * DEG;
  let lastBench = -1;
  const VZ = VEILLE.clone();

  // nothing is allocated past this line
  return {
    root, A,
    parts: { xfo, cover, breakers, cpi, earth, stubs, ghost },
    update(P, time = 0) {
      const bench = (P.bench ?? 0) > 0.5;
      const e = bench ? clamp01(P.explode ?? 0) : 0;
      const current = clamp01(P.current ?? 0);
      const trip = clamp01(P.trip ?? 0);
      const home = clamp01(P.home ?? 0);
      const leak = clamp01(P.leak ?? 0);
      const dbl = clamp01(P.double ?? 0);
      const fault = clamp01(P.fault ?? 0);
      const fault2 = clamp01(P.fault2 ?? 0);
      const pulses = clamp01(P.cpi ?? 0);
      const ins = clamp01(P.ins ?? 1);
      const alarm = clamp01(P.alarm ?? 0);
      const ddr = clamp01(P.ddr ?? 0);
      const apart = clamp01(P.apart ?? 0);

      if (lastBench !== +bench) {
        lastBench = +bench;
        stubs.visible = bench;
        plateMesh.visible = !bench;
      }

      // ── opened: the rail goes up first, then the hood, the top yoke, the windings off their legs
      const sr = settle(ramp(e, OPEN.rail[1], OPEN.rail[2]));
      const sh = settle(ramp(e, OPEN.hood[1], OPEN.hood[2]));
      const sy = settle(ramp(e, OPEN.yoke[1], OPEN.yoke[2]));
      const sc = settle(ramp(e, OPEN.coils[1], OPEN.coils[2]));
      const ap = smooth(apart) * 3.5 * smooth(ramp(e, 0.6, 1));
      M.rail.set(0, OPEN.rail[0] * sr, 0);
      M.prim.set(-ap, OPEN.coils[0] * sc, 0);
      M.sec.set(ap, OPEN.coils[0] * sc, 0);
      railG.position.copy(M.rail);
      cover.position.y = OPEN.hood[0] * sh;
      yokeG.position.y = OPEN.yoke[0] * sy;
      coilPG.position.copy(M.prim);
      coilSG.position.copy(M.sec);
      gapG.position.set(0, OPEN.coils[0] * sc, 0);
      const plateK = 1 - 0.6 * smooth(e);
      plateGlass.uniforms.uAmount.value = plateK;
      plateLines.material.opacity = 0.28 * plateK;
      extGlass.uniforms.uAmount.value = plateK;
      extLines.material.opacity = 0.28 * plateK;

      // ── the gap between the windings lights up
      stripMat.uniforms.uAmount.value = 0.95 * smooth(apart) * xfo.userData.part.opacity;
      strip.visible = apart > 0.004;
      // they widen apart with it
      strip.scale.x = 1 + ap / 2.3;

      // ── the faults: the worn wire bends onto the metal (casing A: up to its top sheet; B: down to its bottom one)
      M.fA.set(0, 1.55 * smooth(fault), 0);
      M.fB.set(0, -2.05 * smooth(fault2), 0);
      sleeveA.position.set(60, 42.6 + M.fA.y, 3.6);
      sleeveB.position.set(60, 15.9 + M.fB.y, 3.6);
      const bumpA = Math.sin(Math.PI * ramp(fault, 0.84, 1));
      const bumpB = Math.sin(Math.PI * ramp(fault2, 0.84, 1));
      shine(faultA, (1.05 * smooth(ramp(fault, 0.7, 1)) + 1.2 * bumpA) * (bench ? 1 : 0), 1.15 + 1.5 * bumpA, 6);
      shine(faultB, (1.05 * smooth(ramp(fault2, 0.7, 1)) + 1.2 * bumpB) * (bench ? 1 : 0), 1.15 + 1.5 * bumpB, 6);

      // ── the breakers: closed (handles up) → tripped (down)
      const hd = ON + (OFF - ON) * ease(trip);
      for (const h of handles) h.rotation.x = hd;

      // ── the monitor: its gauge, its LED
      const cpiSeen = cpi.userData.part.opacity;
      gaugeMat.uniforms.uIns.value = ins;
      gaugeMat.uniforms.uOn.value = 0.55 + 0.45 * pulses;
      gaugeMat.uniforms.uAmount.value = cpiSeen;
      gauge.visible = cpiSeen > 0.004;
      ledMat.color.copy(VZ).multiplyScalar(0.18 + 2.2 * alarm);
      shine(ledBall, 0.95 * alarm * cpiSeen, 1.3, 6);

      // ── « chez toi »: the ghost differential and the bond
      ghostGlass.uniforms.uAmount.value = home;
      ghostMesh.visible = home > 0.004;
      ghostLines.material.color.copy(INK).lerp(VEILLE, ddr);
      ghostLines.material.opacity = home * (0.55 + 0.35 * ddr);
      shine(ghostBall, 0.9 * ddr * home, 1.6, 6);
      const lm = link.mat;
      const solidLink = home > 0.999;
      if (lm.transparent === solidLink) {
        lm.transparent = !solidLink;
        lm.needsUpdate = true;
      }
      lm.opacity = home;
      lm.depthWrite = home > 0.5;
      link.mesh.visible = home > 0.004;

      // ── the conductors: their points, their flows
      const tD = time * FLOW.dash.speed;
      // the ordinary current steps back while a fault current runs: the eye goes to the fault
      const quiet = 1 - 0.72 * Math.max(leak, dbl * (1 - trip));
      const tP = time * FLOW.pulse.speed;
      const useDbl = dbl > leak * home;
      const hotF = useDbl ? FLOW.dbl : FLOW.leak;
      const tH = time * hotF.speed;
      const tT = time * FLOW.trk.speed;
      const litP = Math.max(clamp01(P.litPrim ?? 0), clamp01(P.litXfo ?? 0) * 0.5);
      const litS = Math.max(clamp01(P.litSec ?? 0), clamp01(P.litXfo ?? 0) * 0.5);
      const litE = clamp01(P.litEarth ?? 0);
      for (let i = 0; i < wires.length; i++) {
        const w = wires[i];
        const U = w.U;
        const pts = U.uP.value;
        for (let k = 0; k < w.rest.length; k++) pts[k].copy(w.rest[k]).add(w.movers[k]);
        const cut = w.beyond ? 1 - trip : 1 - 0.85 * trip;
        // ordinary current
        const c = w.cfg.dash;
        U.uDash.value.x = c ? current * cut * quiet : 0;
        U.uDash.value.z = tD;
        if (c) U.uDashS.value.set(c[0], c[1]);
        // the monitor's pulses
        const p = w.cfg.pulse;
        U.uPulse.value.x = p ? 0.85 * pulses * (w.beyond ? 1 - trip : 1) * (0.35 + 0.65 * quiet) : 0;
        U.uPulse.value.z = tP;
        if (p) U.uPulseS.value.set(p[0], p[1]);
        // the fault current: the loop at home, or the double fault
        const h = useDbl ? w.cfg.dbl : w.cfg.leak;
        const hk = useDbl ? dbl * (1 - trip) : leak * home;
        U.uHot.value.set(h ? hk : 0, hotF.period, tH, hotF.len);
        if (h) U.uHotS.value.set(h[0], h[1]);
        // the trickle, through the marks
        const t = w.cfg.trk;
        U.uTrk.value.x = t ? 0.75 * leak * (1 - home) : 0;
        U.uTrk.value.z = tT;
        if (t) U.uTrkS.value.set(t[0], t[1]);
        U.uLit.value.set(VEILLE.r, VEILLE.g, VEILLE.b, 0);
      }
      for (const w of LIT_PRIM) w.U.uLit.value.w = 0.3 * litP;
      for (const w of LIT_SEC) w.U.uLit.value.w = 0.3 * litS;
      for (const w of LIT_EARTH) w.U.uLit.value.w = 0.55 * litE;

      // ── the part the voice names
      light(lamps.core, clamp01(P.litXfo ?? 0));
      light(lamps.prim, Math.max(clamp01(P.litXfo ?? 0), clamp01(P.litPrim ?? 0)));
      light(lamps.sec, Math.max(clamp01(P.litXfo ?? 0), clamp01(P.litSec ?? 0)));
      light(lamps.cpi, clamp01(P.litCpi ?? 0));
      light(lamps.earth, litE);
    },
  };
}
