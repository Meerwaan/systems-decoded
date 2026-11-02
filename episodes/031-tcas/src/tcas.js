// DOSSIER 031 — the system: the TCAS II, plain, on its pool (docs/031-decors.md « src/tcas.js »).
//
//   buildTcas()               → { root, A, update(P, time, px) }   the bench: the whole system, gathered
//     P = { explode, tau, level, ra, vs, talk, ping, beam, litAnt, litXpdr, litCpu, litPeer, litScreen, mood }
//     A = { cpu, gauge, top, bottom, xpdr, nd, pfd, symbol, needle, speaker, peer, peerAnt }   (anchors, bench frame)
//   buildScreens({ side })    → { root, A, update(P, time, px) }   ONE pilot's two screens, true size — mounted three
//                                times: in your deck, in his, and inside buildTcas on the bench (same code, same look)
//     local frame: the ND's centre at the origin, its face toward +x (toward the pilot), up +y; the PFD at
//     z = (SCREENS.pfd.z − SCREENS.nd.z)·side, its vertical speed scale on its outer edge
//     P = { level, ra, vs, tau, shell }       A = { nd, pfd, symbol, own, vsi, needle, arcUp, arcDown }
//   buildAntenna()            → { root, A, update(P, time, px) }   a directional antenna on its doubler: its base at
//                                the origin, up +y, its four sectors of 90° (one of them, toward −x, the beam)
//     P = { beam, lit }       A = { tip, beam }
//
// The look. The system is PLAIN, three greys: the processor (the heart) the lightest, the transponder, radomes and
// speaker mid, the front plates, doublers, cables dark; metal ≤ 0.5, fine edges. The screens are emissive faces drawn
// in their shader (crisp at any distance, no texture; `userData.finish = false`). Light has a place: the rings are
// thin fronts with a bright heart (never a bubble), the heads in the coax a core and a tail, the LEDs breathe slowly.
// Colours: veille the system alive (gauge, rings, beam, heads, green arc, the needle once in it), signal the threat
// (the TA circle, the RA square, the red arc, the gauge past 35 s, the other plane's transponder's thread), ink the rest.
//
// The bench's layout (LAY) is written for its camera (az −40, el 16): « screen x / depth » converted to the bench
// frame. It replaces plan.js RIG where RIG put the screens in front of the processor (journal docs/journal/031-tcas.md).
// Nothing in update() allocates: it is called sixteen times per frame.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, setGlow, box, cyl, lathe, placed, mergeGeometries, makePart, addMesh, setPartOpacity, fatLine, anchor } from "@kit/build3d.js";
import { RIG, SCREENS } from "./plan.js";

const DEG = Math.PI / 180;
const TAU2 = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const bump = (a, b, c, x) => (x <= a || x >= c ? 0 : x < b ? smooth(a, b, x) : 1 - smooth(b, c, x));
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

const INK = new THREE.Color(BRAND.ink);
const VEI = new THREE.Color(BRAND.veille);
const SIG = new THREE.Color(BRAND.signal);
const VEI_HOT = VEI.clone().multiplyScalar(1.7); // a thread of light on an edge: past the bloom, just
const SIG_HOT = SIG.clone().multiplyScalar(1.5);

/* the three greys (and a fourth, the cables): the heart is the lightest thing on the bench */
const GREY = { hero: 0xa3abb1, mid: 0x646c73, face: 0x485056, dark: 0x343a3f, cable: 0x262b30 };
const mat = (c, o = {}) => {
  const m = solid(c, { rough: o.rough ?? 0.5, metal: o.metal ?? 0.28, coat: o.coat, env: o.env ?? 1 });
  if (o.bare) m.userData.finish = false; // a big flat plate or a cable: the grain reads as marble there
  return m;
};

/* ─────────────────────────────────────────────── the bench's layout (bench frame, cm) */
// for the bench camera (az −40): screen x = 0.766·x + 0.643·z, depth toward it = −0.643·x + 0.766·z
const toBench = (sx, y, dp) => [0.766 * sx - 0.643 * dp, y, 0.643 * sx + 0.766 * dp];
const LAY = {
  cpu: RIG.cpu, //                    the heart, at the origin (the poses aim it)
  yaw: 12 * DEG, //                   the processor and the transponders turn their front plate a little toward the camera
  top: [0, 28, 0], //                 the upper antenna, over the processor
  bottom: [0, -30, 0], //             the lower one, under it (upside down)
  xpdr: toBench(-32, -4, -14), //     your Mode S transponder: left, behind
  panel: toBench(40, -19, 24), //     the ND's centre (the PFD at its left): right, low, in front, facing the camera
  panelScale: 0.8,
  speaker: toBench(44, 14, 18), //    over the screens
  peer: toBench(-84, 40, -10), //     THE OTHER PLANE'S transponder, far at the left, out of the `whole` frame
  floor: -66, //                      the bench's floor under the system (makeBench lays it at 0: through the processor)
  // the exploded view: one column (antenna, processor, antenna), the transponder and the screens either side, lower
  out: {
    top: [0, 30, 0],
    bottom: [0, -16, 0],
    xpdr: (() => { const a = toBench(-30, -30, -14); const b = toBench(-32, -4, -14); return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; })(),
    panel: (() => { const a = toBench(46, -34, 24); const b = toBench(40, -19, 24); return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; })(),
    speaker: (() => { const a = toBench(42, 30, 18); const b = toBench(44, 14, 18); return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; })(),
  },
};

/* ─────────────────────────────────────────────── shared bits */

/** The edge lines of a part, and their colours at rest: what `lit` turns into a thread of light. */
function threadOf(...parts) {
  const lines = [];
  for (const part of parts) for (const m of part.userData.part.mats) if (m.isLineMaterial) lines.push(m);
  return { lines, base: lines.map((m) => m.color.clone()), width: lines.map((m) => m.linewidth), k: -1, hot: null };
}
function setThread(t, k, hot = VEI_HOT) {
  k = clamp01(k);
  if (k === t.k && hot === t.hot) return;
  t.k = k;
  t.hot = hot;
  for (let i = 0; i < t.lines.length; i++) {
    t.lines[i].color.lerpColors(t.base[i], hot, k);
    t.lines[i].linewidth = t.width[i] + 1.1 * k;
  }
}

const VERT_UV = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// signed distances and a coverage that follows the pixel (fwidth): a line thinner than a pixel greys, never crawls
const SDF = /* glsl */ `
  float cover(float d) { float w = max(fwidth(d), 1e-4); return 1.0 - smoothstep(-w, w, d); }
  float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
  float sdDiamond(vec2 p, float r) { p = abs(p); return (p.x + p.y - r) * 0.70710678; }
  float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * h); }
`;
const screenMat = (fragmentShader, uniforms) => {
  const m = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT_UV, fragmentShader, fog: false });
  m.userData.finish = false;
  return m;
};

/* the vertical speed scale: non-linear like an Airbus's (0–1000 opens wide, 2000–6000 is packed), −1…1 */
const vsiF = (v) => {
  const a = Math.min(6000, Math.abs(v));
  const f = a <= 1000 ? (0.5 * a) / 1000 : a <= 2000 ? 0.5 + (0.25 * (a - 1000)) / 1000 : 0.75 + (0.25 * (a - 2000)) / 4000;
  return Math.sign(v) * f;
};
const VSI = { x0: 0.64, x1: 0.95, half: 0.84 }; // where the scale stands on the PFD (q units, +1 = the outer edge)

const ND_FRAG = /* glsl */ `
  uniform float uLevel, uFlash, uSym, uOn; uniform vec3 uInk, uSig;
  varying vec2 vUv;
  ${SDF}
  void main() {
    vec2 q = vUv * 2.0 - 1.0;
    vec3 col = vec3(0.010, 0.013, 0.016) * (1.0 - 0.25 * dot(q, q));
    vec2 o = vec2(0.0, -0.52);
    vec2 p = q - o;
    float r = length(p);
    float ang = atan(p.y, p.x);
    // the compass arc over you, its ticks every ten degrees (dim: a frame, not a subject)
    float upper = smoothstep(-0.25, 0.05, p.y);
    col += uInk * 0.30 * cover(abs(r - 1.08) - 0.007) * upper;
    float tk = 6.2831853 / 36.0;
    float at = floor(ang / tk + 0.5) * tk;
    col += uInk * 0.30 * cover(max(abs(ang - at) * r - 0.008, abs(r - 1.125) - 0.04)) * upper;
    // the ring of twelve dots around you (the TCAS display's range ring)
    float sec = 6.2831853 / 12.0;
    float a0 = floor(ang / sec + 0.5) * sec;
    col += uInk * 0.62 * cover(length(p - 0.44 * vec2(cos(a0), sin(a0))) - 0.022);
    // you: a small airliner, ink
    float d = sdBox(p - vec2(0.0, 0.0), vec2(0.022, 0.15));
    d = min(d, sdSeg(vec2(abs(p.x), p.y), vec2(0.0, 0.05), vec2(0.16, -0.03)) - 0.02);
    d = min(d, sdSeg(vec2(abs(p.x), p.y), vec2(0.0, -0.11), vec2(0.065, -0.15)) - 0.016);
    col = mix(col, uInk * 1.05, cover(d));
    // the intruder: hollow diamond · filled diamond · filled circle (signal) · filled square (signal)
    vec2 s = q - vec2(0.0, uSym);
    float sz = 0.12 * (1.0 + 0.35 * uFlash);
    float sh; vec3 sc;
    if (uLevel < 0.5) { sh = abs(sdDiamond(s, sz)) - 0.018; sc = uInk; }
    else if (uLevel < 1.5) { sh = sdDiamond(s, sz); sc = uInk; }
    else if (uLevel < 2.5) { sh = length(s) - sz * 0.8; sc = uSig; }
    else { sh = sdBox(s, vec2(sz * 0.74)); sc = uSig; }
    col = mix(col, sc * (uLevel < 1.5 ? 1.1 : 1.45) * (1.0 + 0.9 * uFlash), cover(sh));
    // its burst on a new shape: one ring, gone in a few frames
    col += sc * 1.3 * uFlash * cover(abs(length(s) - sz * (2.4 - 1.0 * uFlash)) - 0.016);
    // its data tag: a dash and an arrow-stub beside it, unreadable on purpose (no figure on the picture)
    col += uInk * 0.55 * cover(sdBox(s - vec2(0.0, -0.24), vec2(0.07, 0.016))) * step(0.5, uLevel);
    // a glass: one faint streak
    col += vec3(0.020) * smoothstep(0.35, 0.0, abs(q.x + q.y * 0.6 - 0.5));
    gl_FragColor = vec4(col * uOn, 1.0);
  }`;

const PFD_FRAG = /* glsl */ `
  uniform float uSide, uRa, uVsY, uNeedle, uPitch, uOn;
  uniform vec2 uUp, uDown; // the green and red bands (y from, y to) in q units; empty when equal
  uniform vec3 uInk, uSig, uVei;
  varying vec2 vUv;
  ${SDF}
  float vsiF(float v) { float a = min(6000.0, abs(v)); float f = a <= 1000.0 ? 0.5 * a / 1000.0 : a <= 2000.0 ? 0.5 + 0.25 * (a - 1000.0) / 1000.0 : 0.75 + 0.25 * (a - 2000.0) / 4000.0; return sign(v) * f; }
  void main() {
    vec2 q = vUv * 2.0 - 1.0;
    q.x *= -uSide; // +1: the outer edge, where the vertical speed scale stands
    vec3 col = vec3(0.010, 0.013, 0.016);
    // the attitude: dark sky over darker ground, the horizon in ink, its ladder, the aircraft's wings
    vec2 a = q - vec2(-0.16, 0.0);
    float win = sdBox(a, vec2(0.62, 0.66)) - 0.04;
    float hy = a.y + uPitch;
    vec3 att = hy > 0.0 ? vec3(0.060, 0.068, 0.076) : vec3(0.030, 0.030, 0.032);
    att += uInk * 0.75 * cover(abs(hy) - 0.010);
    for (int i = 1; i <= 3; i++) {
      float ly = float(i) * 0.16;
      float w = i == 2 ? 0.17 : 0.09;
      att += uInk * 0.32 * cover(sdBox(vec2(a.x, hy - ly), vec2(w, 0.006)));
      att += uInk * 0.32 * cover(sdBox(vec2(a.x, hy + ly), vec2(w, 0.006)));
    }
    float wing = min(sdBox(a - vec2(-0.30, 0.0), vec2(0.13, 0.022)), sdBox(a - vec2(0.30, 0.0), vec2(0.13, 0.022)));
    wing = min(wing, sdBox(a, vec2(0.025)));
    att = mix(att, uInk * 1.0, cover(wing));
    col = mix(col, att, cover(win));
    // the vertical speed scale: its grey tape, its ticks, the order's bands, the needle
    vec2 v = q;
    float tape = sdBox(v - vec2(${((VSI.x0 + VSI.x1) / 2).toFixed(3)}, 0.0), vec2(${((VSI.x1 - VSI.x0) / 2).toFixed(3)}, ${VSI.half.toFixed(3)})) - 0.02;
    vec3 vs = vec3(0.045, 0.050, 0.055);
    float vals[6]; vals[0] = 0.0; vals[1] = 500.0; vals[2] = 1000.0; vals[3] = 1500.0; vals[4] = 2000.0; vals[5] = 6000.0;
    for (int i = 0; i < 6; i++) {
      float len = (i == 0 || i == 2 || i == 5) ? 0.07 : 0.04;
      float y = ${VSI.half.toFixed(3)} * vsiF(vals[i]);
      vs += uInk * 0.55 * cover(sdBox(v - vec2(${VSI.x0.toFixed(3)} + 0.03 + len * 0.5, y), vec2(len * 0.5, 0.007)));
      vs += uInk * 0.55 * cover(sdBox(v - vec2(${VSI.x0.toFixed(3)} + 0.03 + len * 0.5, -y), vec2(len * 0.5, 0.007)));
    }
    float amt = abs(uRa);
    float bx = sdBox(vec2(v.x - (${VSI.x0.toFixed(3)} + 0.085), 0.0), vec2(0.045, 1.0));
    float inUp = max(bx, max(uUp.x - v.y, v.y - uUp.y));
    float inDn = max(bx, max(uDown.x - v.y, v.y - uDown.y));
    vs = mix(vs, uVei * 1.5, cover(inUp) * amt);
    vs = mix(vs, uSig * 1.35, cover(inDn) * amt);
    // the needle: from a pivot outside the scale to the value, drawn on the tape only
    vec2 piv = vec2(1.30, 0.0);
    vec2 tip = vec2(${VSI.x0.toFixed(3)} + 0.05, uVsY);
    float nd = sdSeg(v, piv, tip) - 0.016;
    nd = max(nd, (${VSI.x0.toFixed(3)} + 0.04) - v.x);
    vs = mix(vs, mix(uInk * 1.1, uVei * 1.7, uNeedle), cover(nd));
    col = mix(col, vs, cover(tape));
    col += vec3(0.018) * smoothstep(0.35, 0.0, abs(q.x * 0.4 + q.y * 0.6 - 0.45));
    gl_FragColor = vec4(col * uOn, 1.0);
  }`;

/* ─────────────────────────────────────────────── the screens */

export function buildScreens({ side = 1 } = {}) {
  const root = new THREE.Group();
  const A = {};
  const W = SCREENS.nd.w;
  const H = SCREENS.nd.h;
  const pz = (SCREENS.pfd.z - SCREENS.nd.z) * side;
  // the two bezels, one part (it fades with `shell`): a deep frame, a lip around each face
  const bezel = makePart("screens");
  const frame = (z) => [
    placed(box(2.6, H + 3, W + 3, 0.7), { pos: [-1.3, 0, z] }),
    placed(box(0.5, 0.9, W + 1.8, 0.2), { pos: [0.25, H / 2 + 0.45, z] }),
    placed(box(0.5, 0.9, W + 1.8, 0.2), { pos: [0.25, -H / 2 - 0.45, z] }),
    placed(box(0.5, H, 0.9, 0.2), { pos: [0.25, 0, z + W / 2 + 0.45] }),
    placed(box(0.5, H, 0.9, 0.2), { pos: [0.25, 0, z - W / 2 - 0.45] }),
  ];
  addMesh(bezel, mergeGeometries([...frame(0), ...frame(pz)]), mat(0x32383d, { rough: 0.55, metal: 0.2, bare: true }), { edgeOpacity: 0.55 });
  // two knobs under the PFD (its brightness) — a hint of a real unit, nothing to read
  const knobs = mergeGeometries([0.32, 0.68].map((u) => placed(cyl(0.8, 0.9, 0.2, 24), { pos: [0.45, -H / 2 - 0.95, pz + (u - 0.5) * W], rotZ: 90 * DEG })));
  addMesh(bezel, knobs, mat(GREY.mid, { rough: 0.4 }), { edgeOpacity: 0.4 });
  root.add(bezel);

  const U = () => ({ uInk: { value: INK }, uSig: { value: SIG }, uVei: { value: VEI }, uOn: { value: 1 } });
  const ndMat = screenMat(ND_FRAG, { ...U(), uLevel: { value: 0 }, uFlash: { value: 0 }, uSym: { value: 0.3 } });
  const pfdMat = screenMat(PFD_FRAG, {
    ...U(), uSide: { value: side }, uRa: { value: 0 }, uVsY: { value: 0 }, uNeedle: { value: 0 }, uPitch: { value: 0 },
    uUp: { value: new THREE.Vector2() }, uDown: { value: new THREE.Vector2() },
  });
  const face = (m, z) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(W, H).rotateY(Math.PI / 2), m);
    mesh.position.set(0.04, 0, z);
    root.add(mesh);
    return mesh;
  };
  face(ndMat, 0);
  face(pfdMat, pz);

  // q (−1…1 on a face) → the local frame: uv.x runs toward −z; on the PFD, q′ = +1 is the outer edge
  const ndY = (qy) => (qy * H) / 2;
  const pfdZ = (qo) => pz + (side * qo * W) / 2;
  A.nd = anchor(root, 0.1, 0, 0);
  A.pfd = anchor(root, 0.1, 0, pz);
  A.symbol = anchor(root, 0.1, ndY(0.3), 0);
  A.own = anchor(root, 0.1, ndY(-0.52), 0);
  A.vsi = anchor(root, 0.1, 0, pfdZ((VSI.x0 + VSI.x1) / 2));
  A.needle = anchor(root, 0.1, 0, pfdZ(VSI.x0 + 0.05));
  A.arcUp = anchor(root, 0.1, (VSI.half * vsiF(1750) * H) / 2, pfdZ(VSI.x0 + 0.085));
  A.arcDown = anchor(root, 0.1, (VSI.half * vsiF(-1500) * H) / 2, pfdZ(VSI.x0 + 0.085));

  // the burst on a new symbol: seen only while the film plays forward (a seek shows the shape, not its burst)
  let lastLevel = null;
  let changeAt = -1e9;
  let lastT = -1e9;
  const thread = threadOf(bezel);
  return {
    root, A, thread,
    update(P = {}, time = 0) {
      const level = Math.max(0, Math.min(3, Math.round(P.level ?? 0)));
      if (lastLevel === null || time < lastT - 0.1 || time > lastT + 0.5) {
        lastLevel = level;
        changeAt = -1e9;
      } else if (level !== lastLevel) {
        lastLevel = level;
        changeAt = time;
      }
      lastT = time;
      const since = time - changeAt;
      const flash = since >= 0 && since < 0.12 ? 1 - since / 0.12 : 0;
      const tau = P.tau ?? 35;
      const symY = -0.52 + 0.2 + 0.72 * clamp01(tau / 60); // the intruder comes down onto you as the seconds go
      ndMat.uniforms.uLevel.value = level;
      ndMat.uniforms.uFlash.value = flash;
      ndMat.uniforms.uSym.value = symY;
      A.symbol.position.y = ndY(symY);

      const ra = Math.max(-1, Math.min(1, P.ra ?? 0));
      const vs = Math.max(-6000, Math.min(6000, P.vs ?? 0));
      const s = ra >= 0 ? 1 : -1;
      const g0 = VSI.half * vsiF(1500 * s);
      const g1 = VSI.half * vsiF(2000 * s);
      const r1 = VSI.half * vsiF(-6000 * s);
      const u = pfdMat.uniforms;
      u.uRa.value = ra;
      u.uUp.value.set(Math.min(g0, g1), Math.max(g0, g1)); // the green band: fly into it
      u.uDown.value.set(Math.min(g0, r1), Math.max(g0, r1)); // the red one: everything on the wrong side
      const vy = VSI.half * vsiF(vs);
      u.uVsY.value = vy;
      const inGreen = Math.abs(ra) > 0.01 && Math.sign(vs) === s ? bump(1380, 1480, 9e9, Math.abs(vs)) * (1 - smooth(2050, 2200, Math.abs(vs))) : 0;
      u.uNeedle.value = inGreen * Math.abs(ra);
      u.uPitch.value = Math.max(-0.2, Math.min(0.2, (vs / 1500) * 0.06)); // climbing: the horizon goes down
      A.needle.position.y = (vy * H) / 2;
      setPartOpacity(bezel, clamp01(P.shell ?? 1));
    },
  };
}

/* ─────────────────────────────────────────────── the directional antenna */

// the beam: a quarter of a ring of light lying on the doubler, toward −x, fading outward
const BEAM_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uAmt; varying vec2 vP;
  void main() {
    if (uAmt < 0.002) discard;
    float r = length(vP);
    float a = abs(atan(vP.y, -vP.x)); // 0 on the axis (−x)
    float side = 1.0 - smoothstep(0.70, 0.785, a);
    float rad = smoothstep(9.2, 10.4, r) * (1.0 - smoothstep(17.0, 22.0, r)) * (0.55 + 0.45 * smoothstep(19.0, 10.0, r));
    gl_FragColor = vec4(uColor * uAmt * side * rad, 1.0);
  }`;

function radomeGeometry() {
  // a pebble, blunt toward −x (the nose), tapering toward +x: the lower half of a sphere cut away
  const g = new THREE.SphereGeometry(1, 64, 18, 0, TAU2, 0, Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const back = Math.max(0, x);
    p.setXYZ(i, x < 0 ? x * 9.5 : x * 15, y * 3.8 * (1 - 0.35 * back * back), z * 7.6 * (1 - 0.42 * back));
  }
  g.computeVertexNormals();
  return g;
}

export function buildAntenna() {
  const root = new THREE.Group();
  const part = makePart("antenna");
  // the doubler (the skin's reinforcing plate) and its screws
  addMesh(part, placed(cyl(18.5, 0.8, 0.25, 72), { pos: [0, 0.4, 0] }), mat(GREY.dark, { rough: 0.6, bare: true }), { edgeOpacity: 0.6 });
  const screws = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU2 + 0.3;
    screws.push(placed(cyl(0.55, 0.35, 0.12, 12), { pos: [Math.cos(a) * 16.6, 0.95, Math.sin(a) * 16.6] }));
  }
  addMesh(part, mergeGeometries(screws), mat(GREY.mid, { rough: 0.35, metal: 0.4 }), { edges: false });
  // the radome, painted (a varnish), mid grey; its base seam
  const dome = addMesh(part, radomeGeometry(), mat(0x7d858b, { rough: 0.58, metal: 0.05, bare: true }), { edges: false });
  dome.position.y = 0.8;
  root.add(part);
  // the four sectors of 90°, suggested on the doubler (fine ink lines, on the diagonals)
  for (let i = 0; i < 4; i++) {
    const a = (45 + 90 * i) * DEG;
    const l = fatLine([[Math.cos(a) * 11, 0.86, Math.sin(a) * 11], [Math.cos(a) * 18, 0.86, Math.sin(a) * 18]], { color: BRAND.ink, width: 2, opacity: 0.55 });
    root.add(l);
  }
  // the beam, toward −x
  const beamMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uColor: { value: VEI.clone().multiplyScalar(1.25) }, uAmt: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: BEAM_FRAG,
  });
  const beam = new THREE.Mesh(new THREE.RingGeometry(9, 22.5, 48, 4, Math.PI - Math.PI / 4, Math.PI / 2), beamMat);
  beam.rotation.x = -Math.PI / 2; // lying on the doubler: ring's +y → −z, ring's x stays x
  beam.position.y = 0.9;
  beam.renderOrder = 4;
  root.add(beam);
  const A = { tip: anchor(root, 0, 4.6, 0), beam: anchor(root, -17, 1, 0) };
  const thread = threadOf(part);
  return {
    root, A, thread, beamMat,
    update(P = {}) {
      beamMat.uniforms.uAmt.value = clamp01(Math.max(P.beam ?? 0, P.flash ?? 0));
      setThread(thread, P.lit ?? 0);
    },
  };
}

/* ─────────────────────────────────────────────── the bench's boxes */

/** An avionics box (ARINC 600 style): its case, the front plate and its two handles, the rear connector, a LED. */
function avionicsBox(name, { L, Hh, Wd, color, plate, top = "vents", side = true, sockets = [] }) {
  const part = makePart(name);
  const caseMat = mat(color, { rough: 0.64, metal: 0.2 }); // rougher: the rim light grazing a top face must not mirror
  addMesh(part, box(L, Hh, Wd, 0.9), caseMat, { edgeOpacity: 0.5 });
  const fx = -L / 2 - 0.7;
  addMesh(part, placed(box(1.4, Hh + 1, Wd + 1.2, 0.5), { pos: [fx, 0, 0] }), mat(plate, { rough: 0.5, metal: 0.25 }), { edgeOpacity: 0.55 });
  // the handles: two bars on standoffs
  const hz = Wd / 2 - 1.6;
  const hh = Hh * 0.62;
  const bars = [];
  for (const z of [hz, -hz]) {
    bars.push(placed(cyl(0.55, hh, 0.15, 20), { pos: [fx - 2.6, 0, z] }));
    for (const y of [hh / 2 - 0.3, -hh / 2 + 0.3]) bars.push(placed(cyl(0.5, 2.4, 0.1, 16), { pos: [fx - 1.5, y, z], rotZ: 90 * DEG }));
  }
  addMesh(part, mergeGeometries(bars), mat(0xa9b1b6, { rough: 0.3, metal: 0.5 }), { edgeOpacity: 0.35 });
  // the hold-down hooks at the front's foot
  addMesh(part, mergeGeometries([hz - 1, -hz + 1].map((z) => placed(box(3, 2, 2.4, 0.3), { pos: [-L / 2 + 1.4, -Hh / 2 - 0.6, z] }))), mat(GREY.dark), { edgeOpacity: 0.5 });
  // the rear connector and its sockets (where the coax plug)
  addMesh(part, placed(box(2.2, Hh * 0.62, Wd * 0.66, 0.4), { pos: [L / 2 + 1.0, 0, 0] }), mat(GREY.dark, { rough: 0.5 }), { edgeOpacity: 0.55 });
  if (sockets.length) addMesh(part, mergeGeometries(sockets.map(([y, z]) => placed(cyl(1.15, 2.2, 0.2, 20), { pos: [L / 2 + 2.6, y, z], rotZ: 90 * DEG }))), mat(0x8e979d, { rough: 0.3, metal: 0.5 }), { edgeOpacity: 0.4 });
  // the top: vent slots (the processor) or cooling ribs (the transponders)
  if (top === "vents") {
    const slots = [];
    for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) slots.push(placed(box(2.8, 0.3, 0.8, 0.1), { pos: [-L / 2 + 7 + i * ((L - 12) / 6), Hh / 2 + 0.08, -Wd / 2 + 5 + j * ((Wd - 10) / 3)] }));
    addMesh(part, mergeGeometries(slots), mat(GREY.dark, { rough: 0.7 }), { edges: false });
  } else {
    const ribs = [];
    for (let j = 0; j < 4; j++) ribs.push(placed(box(L - 6, 0.9, 0.6, 0.15), { pos: [1, Hh / 2 + 0.4, -Wd / 2 + 3 + j * ((Wd - 6) / 3)] }));
    addMesh(part, mergeGeometries(ribs), mat(color, { rough: 0.45, metal: 0.3 }), { edgeOpacity: 0.4 });
  }
  // the side toward the camera: a service plate and its screws
  if (side) {
    const z = Wd / 2 + 0.12;
    addMesh(part, placed(box(L * 0.62, Hh * 0.6, 0.35, 0.15), { pos: [L * 0.06, 0, z] }), mat(new THREE.Color(color).multiplyScalar(0.84).getHex(), { rough: 0.5, metal: 0.3 }), { edgeOpacity: 0.45 });
    const sc = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) sc.push(placed(cyl(0.45, 0.4, 0.1, 12), { pos: [L * 0.06 + x * L * 0.28, y * Hh * 0.24, z + 0.25], rotX: 90 * DEG }));
    addMesh(part, mergeGeometries(sc), mat(GREY.dark), { edges: false });
  }
  // the status LED on the front plate (veille, breathing)
  const ledMat = glow(BRAND.veille, 1.5);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 10), ledMat);
  led.position.set(fx - 0.75, -Hh / 2 + 2.6, Wd / 2 - 4.4);
  part.add(led);
  return { part, ledMat, front: fx - 0.7 };
}

/* ─────────────────────────────────────────────── the coax: a tube that follows its two ends (exploded view) */

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _t = new THREE.Vector3();
const _n = new THREE.Vector3();
const _m = new THREE.Vector3();
const _q = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const XAXIS = new THREE.Vector3(1, 0, 0);

function makeCable(radius, N = 44, M = 10) {
  const V = (N + 1) * (M + 1);
  const pos = new Float32Array(V * 3);
  const nor = new Float32Array(V * 3);
  const uv = new Float32Array(V * 2);
  const index = [];
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= M; j++) {
      const k = i * (M + 1) + j;
      uv[k * 2] = i / N;
      uv[k * 2 + 1] = j / M;
      if (i < N && j < M) {
        const a = k;
        const b = k + M + 1;
        index.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.setIndex(index);
  return { geo, pos, nor, N, M, radius, a: new THREE.Vector3(), ta: new THREE.Vector3(), b: new THREE.Vector3(), tb: new THREE.Vector3() };
}

/** Lay the tube along the cubic from a (leaving along ta) to b (arriving along −tb): parallel-transported rings. */
function shapeCable(c) {
  const { a, ta, b, tb, N, M, pos, nor, radius } = c;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const mt = 1 - t;
    const w0 = mt * mt * mt;
    const w1 = 3 * mt * mt * t;
    const w2 = 3 * mt * t * t;
    const w3 = t * t * t;
    const px = w0 * a.x + w1 * (a.x + ta.x) + w2 * (b.x + tb.x) + w3 * b.x;
    const py = w0 * a.y + w1 * (a.y + ta.y) + w2 * (b.y + tb.y) + w3 * b.y;
    const pz = w0 * a.z + w1 * (a.z + ta.z) + w2 * (b.z + tb.z) + w3 * b.z;
    const d0 = 3 * mt * mt;
    const d1 = 6 * mt * t;
    const d2 = 3 * t * t;
    _t.set(
      d0 * ta.x + d1 * (b.x + tb.x - a.x - ta.x) - d2 * tb.x,
      d0 * ta.y + d1 * (b.y + tb.y - a.y - ta.y) - d2 * tb.y,
      d0 * ta.z + d1 * (b.z + tb.z - a.z - ta.z) - d2 * tb.z,
    );
    if (_t.lengthSq() < 1e-8) _t.set(1, 0, 0);
    _t.normalize();
    if (i === 0) {
      _n.crossVectors(_t, Math.abs(_t.y) > 0.9 ? XAXIS : UP).normalize();
    } else {
      _n.addScaledVector(_t, -_n.dot(_t));
      if (_n.lengthSq() < 1e-8) _n.crossVectors(_t, UP);
      _n.normalize();
    }
    _m.crossVectors(_t, _n);
    for (let j = 0; j <= M; j++) {
      const ang = (j / M) * TAU2;
      const cs = Math.cos(ang);
      const sn = Math.sin(ang);
      const k = (i * (M + 1) + j) * 3;
      const nx = _n.x * cs + _m.x * sn;
      const ny = _n.y * cs + _m.y * sn;
      const nz = _n.z * cs + _m.z * sn;
      nor[k] = nx;
      nor[k + 1] = ny;
      nor[k + 2] = nz;
      pos[k] = px + nx * radius;
      pos[k + 1] = py + ny * radius;
      pos[k + 2] = pz + nz * radius;
    }
  }
  c.geo.attributes.position.needsUpdate = true;
  c.geo.attributes.normal.needsUpdate = true;
}

// the head of light that runs in a coax: a bright core and a tail behind it, on a sleeve a hair over the cable
const FLOW_VERT = /* glsl */ `varying float vU; void main(){ vU = uv.x; vec3 p = position + normal * 0.45; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
const FLOW_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uHead, uAmt, uDir; varying float vU;
  void main() {
    if (uAmt < 0.002) discard;
    float d = (vU - uHead) * uDir; // behind the head: d < 0
    float core = exp(-d * d / 0.0022);
    float tail = d < 0.0 ? exp(d / 0.2) * 0.55 : 0.0;
    gl_FragColor = vec4(uColor * uAmt * (core * 2.0 + tail), 1.0);
  }`;
function flowMat(color) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uColor: { value: new THREE.Color(color) }, uHead: { value: -1 }, uAmt: { value: 0 }, uDir: { value: 1 } },
    vertexShader: FLOW_VERT, fragmentShader: FLOW_FRAG,
  });
}

/* ─────────────────────────────────────────────── the waves on the bench: thin directional fronts */

const CAP = 30 * DEG;
const WAVE_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uAmt, uCos; varying vec3 vN; varying vec3 vV; varying float vA;
  void main() {
    if (uAmt < 0.002) discard;
    float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
    float rim = pow(g, 3.0);
    float k = clamp((vA - uCos) / max(1.0 - uCos, 1e-3), 0.0, 1.0); // 0 on the cap's border, 1 on its axis
    float core = k * k * (3.0 - 2.0 * k);
    gl_FragColor = vec4(uColor * uAmt * rim * core * (0.35 + 0.65 * core), 1.0);
  }`;
const WAVE_VERT = /* glsl */ `varying vec3 vN; varying vec3 vV; varying float vA;
  void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vA = position.y; gl_Position = projectionMatrix * mv; }`;
function waveFront(geo, color) {
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uColor: { value: new THREE.Color(color) }, uAmt: { value: 0 }, uCos: { value: Math.cos(CAP) } },
    vertexShader: WAVE_VERT, fragmentShader: WAVE_FRAG,
  });
  const mesh = new THREE.Mesh(geo, m);
  mesh.renderOrder = 6;
  mesh.frustumCulled = false;
  return mesh;
}

/* ─────────────────────────────────────────────── the speaker */

function buildSpeaker() {
  const g = new THREE.Group();
  const part = makePart("speaker");
  // the cup, its rim; open (no grille): the cone is what speaks
  addMesh(part, lathe([[0, -3.2], [6.4, -3.2], [7.2, -2.4], [7.2, 1.0], [6.7, 1.5], [5.9, 1.5], [5.9, -2.2], [0, -2.2]], 72, { bevel: 0.25, round: 2 }), mat(GREY.mid, { rough: 0.5, bare: true }), { edgeOpacity: 0.5 });
  addMesh(part, mergeGeometries([0, 1, 2, 3].map((i) => placed(cyl(0.45, 0.4, 0.1, 12), { pos: [Math.cos(i * 1.5708 + 0.785) * 6.55, 1.62, Math.sin(i * 1.5708 + 0.785) * 6.55] }))), mat(GREY.dark), { edges: false });
  g.add(part);
  const cone = new THREE.Group();
  const conePart = makePart("cone");
  addMesh(conePart, lathe([[5.5, 1.1], [4.9, 1.0], [1.7, -0.9], [1.4, -1.0]], 64, { bevel: 0.15 }), (() => { const m = solid(0x1e2226, { rough: 0.9, double: true }); m.userData.finish = false; return m; })(), { edgeOpacity: 0.45 });
  addMesh(conePart, lathe([[0, -0.2], [1.2, -0.45], [1.75, -0.95]], 40, { crease: 30 }), mat(0x3a4146, { rough: 0.5, bare: true }), { edges: false });
  cone.add(conePart);
  g.add(cone);
  // rings of sound: thin, slow, in ink
  const rings = [];
  const ringGeo = new THREE.RingGeometry(0.965, 1, 96).rotateX(-Math.PI / 2);
  for (let i = 0; i < 3; i++) {
    const m = glow(BRAND.ink, 1.25, { additive: true, double: true, opacity: 0 });
    const r = new THREE.Mesh(ringGeo, m);
    r.renderOrder = 6;
    r.visible = false;
    g.add(r);
    rings.push(r);
  }
  return { group: g, part, cone, rings };
}

/* ─────────────────────────────────────────────── the bench */

export function buildTcas() {
  const root = new THREE.Group();
  const A = {};

  /* the processor: the heart */
  const cpuG = new THREE.Group();
  cpuG.position.set(...LAY.cpu);
  cpuG.rotation.y = LAY.yaw;
  const SOCK = [[5, 7], [5, -3], [-4, 5], [-4, -5], [0.5, 1]]; // (y, z) of the rear sockets
  const cpu = avionicsBox("cpu", { L: 36, Hh: 19, Wd: 24, color: GREY.hero, plate: GREY.face, sockets: SOCK });
  cpuG.add(cpu.part);
  // the time gauge on the front plate: an arc that empties from 60 s to 0, two fine marks at 48 and 35
  const gaugeMat = new THREE.ShaderMaterial({
    uniforms: { uFill: { value: 35 / 60 }, uSig: { value: 0 }, uInk: { value: INK }, uVei: { value: VEI }, uSigC: { value: SIG }, uT1: { value: 48 / 60 }, uT2: { value: 35 / 60 } },
    vertexShader: VERT_UV,
    fragmentShader: /* glsl */ `
      uniform float uFill, uSig, uT1, uT2; uniform vec3 uInk, uVei, uSigC; varying vec2 vUv;
      ${SDF}
      void main() {
        vec2 q = vUv * 2.0 - 1.0;
        float r = length(q);
        if (r > 0.99) discard;
        vec3 col = vec3(0.012, 0.014, 0.017);
        col += uInk * 0.35 * cover(abs(r - 0.955) - 0.012);
        float a = atan(q.y, q.x);
        float s = mod(3.6651914 - a, 6.2831853) / 4.1887902; // 0 at 210° (lower left) → 1 at −30° (lower right), clockwise
        float band = abs(r - 0.70) - 0.12;
        float inArc = step(s, 1.0);
        float arcLen = 4.1887902 * 0.70;
        float lit = cover((s - uFill) * arcLen) * inArc;
        vec3 hue = mix(uVei, uSigC, uSig) * 1.55;
        col = mix(col, vec3(0.055, 0.06, 0.065), cover(band) * inArc);
        col = mix(col, hue, cover(band) * lit);
        // the two marks: TA (48 s) and RA (35 s)
        for (int i = 0; i < 2; i++) {
          float sT = i == 0 ? uT1 : uT2;
          float dT = abs(s - sT) * arcLen - 0.022;
          col = mix(col, uInk * 1.15, cover(max(dT, abs(r - 0.70) - 0.2)) * inArc);
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
    fog: false,
  });
  gaugeMat.userData.finish = false;
  const gauge = new THREE.Mesh(new THREE.PlaneGeometry(13, 13).rotateY(-Math.PI / 2), gaugeMat);
  gauge.position.set(cpu.front - 0.03, 1.5, 0);
  cpu.part.add(gauge);
  root.add(cpuG);

  /* the two antennas */
  const top = buildAntenna();
  const bottom = buildAntenna();
  bottom.root.rotation.x = Math.PI;
  root.add(top.root, bottom.root);

  /* your transponder (Mode S) */
  const xpG = new THREE.Group();
  xpG.rotation.y = LAY.yaw;
  const XS = [[2, 3], [-2, -3]];
  const xp = avionicsBox("xpdr", { L: 28, Hh: 13, Wd: 15, color: GREY.mid, plate: GREY.dark, top: "ribs", sockets: XS });
  xpG.add(xp.part);
  root.add(xpG);

  /* the screens, on their panel (the bench's: a backplate holds the two bezels) */
  const scrG = new THREE.Group();
  const screens = buildScreens({ side: 1 });
  const back = makePart("panel");
  const pz = SCREENS.pfd.z - SCREENS.nd.z;
  addMesh(back, placed(box(1.6, SCREENS.nd.h + 6, pz + SCREENS.nd.w + 7, 0.6), { pos: [-3.4, -0.4, pz / 2] }), mat(GREY.face, { rough: 0.55 }), { edgeOpacity: 0.5 });
  screens.root.add(back);
  scrG.add(screens.root);
  scrG.scale.setScalar(LAY.panelScale);
  scrG.rotation.set(0, -130 * DEG, 14 * DEG); // faces the bench's camera (az −40), leaning back like a panel
  root.add(scrG);

  /* the speaker */
  const spk = buildSpeaker();
  spk.group.quaternion.setFromUnitVectors(UP, new THREE.Vector3(-0.6, 0.36, 0.72).normalize());
  root.add(spk.group);

  /* the other plane's transponder and its antenna: far at the left of the pool, a thread of signal */
  const peerG = new THREE.Group();
  peerG.position.set(...LAY.peer);
  peerG.rotation.y = LAY.yaw;
  const peer = avionicsBox("peer", { L: 28, Hh: 13, Wd: 15, color: GREY.mid, plate: GREY.dark, top: "ribs", sockets: [[0, 0]] });
  peerG.add(peer.part);
  root.add(peerG);
  const peerAnt = buildAntenna();
  peerAnt.root.position.set(LAY.peer[0], LAY.peer[1] + 14, LAY.peer[2]);
  root.add(peerAnt.root);

  /* where things stand, gathered and apart (the frame of the root) */
  const parts = [
    { obj: top.root, at: LAY.top, off: LAY.out.top, delay: 0.0 },
    { obj: bottom.root, at: LAY.bottom, off: LAY.out.bottom, delay: 0.1 },
    { obj: xpG, at: LAY.xpdr, off: LAY.out.xpdr, delay: 0.2 },
    { obj: scrG, at: LAY.panel, off: LAY.out.panel, delay: 0.25 },
    { obj: spk.group, at: LAY.speaker, off: LAY.out.speaker, delay: 0.3 },
  ];
  for (const p of parts) p.obj.position.set(...p.at);
  // each antenna's beam toward the other one (on the plane, −x is ahead: there, nothing turns)
  const tipTop = new THREE.Vector3(LAY.top[0], LAY.top[1] + 4.6, LAY.top[2]);
  const tipPeer = new THREE.Vector3(LAY.peer[0], LAY.peer[1] + 14 + 4.6, LAY.peer[2]);
  const toPeer = tipPeer.clone().sub(tipTop);
  top.root.rotation.y = Math.atan2(toPeer.z, -toPeer.x);
  peerAnt.root.rotation.y = Math.atan2(-toPeer.z, toPeer.x);

  /* the coax: each from a part to the processor's rear connector */
  const cableMat = mat(GREY.cable, { rough: 0.5, metal: 0.15, bare: true });
  const yawP = (p) => {
    const c = Math.cos(LAY.yaw);
    const s = Math.sin(LAY.yaw);
    return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
  };
  const sockAt = (i) => yawP([18 + 2.6 + 1.1, SOCK[i][0], SOCK[i][1]]).map((v, k) => v + LAY.cpu[k]);
  const outRear = yawP([1, 0, 0]);
  const scrLocal = (x, y, z) => {
    scrG.updateMatrix();
    return new THREE.Vector3(x, y, z).applyMatrix4(scrG.matrix).toArray();
  };
  const cableDefs = [
    // [from, its tangent, the part it moves with, to (processor), its tangent, the part it moves with]
    { a: [0, LAY.top[1] - 0.2, 0], ta: [0, -9, 0], pa: 0, b: sockAt(0), tb: outRear.map((v) => v * 11), r: 0.62 },
    { a: [0, LAY.bottom[1] + 0.2, 0], ta: [0, 9, 0], pa: 1, b: sockAt(3), tb: outRear.map((v) => v * 11), r: 0.62 },
    { a: yawP([14 + 2.6 + 1.1, XS[0][0], XS[0][1]]).map((v, k) => v + LAY.xpdr[k]), ta: outRear.map((v) => v * 10), pa: 2, b: sockAt(1), tb: outRear.map((v) => v * 10), r: 0.55 },
    { a: scrLocal(-4.4, -2, pz / 2), ta: [8, -4, -10], pa: 3, b: sockAt(2), tb: outRear.map((v) => v * 12), r: 0.55 },
    { a: (() => { const v = new THREE.Vector3(0, -3.4, 0).applyQuaternion(spk.group.quaternion).add(spk.group.position); return v.toArray(); })(), ta: [6, -2, -8], pa: 4, b: sockAt(4), tb: outRear.map((v) => v * 9), r: 0.5 },
  ];
  const cables = cableDefs.map((d) => {
    const c = makeCable(d.r);
    const mesh = new THREE.Mesh(c.geo, cableMat);
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);
    c.ta.set(...d.ta);
    c.tb.set(...d.tb);
    return { c, d, mesh };
  });
  // the peer's own short coax, antenna → its transponder
  const peerCable = makeCable(0.5);
  peerCable.a.set(LAY.peer[0], LAY.peer[1] + 13.8, LAY.peer[2]);
  peerCable.ta.set(0, -4, 0);
  peerCable.b.set(...yawP([14 + 2.6 + 1.1, 0, 0]).map((v, k) => v + LAY.peer[k]));
  peerCable.tb.set(...outRear.map((v) => v * 6));
  shapeCable(peerCable);
  const peerCableMesh = new THREE.Mesh(peerCable.geo, cableMat);
  peerCableMesh.frustumCulled = false;
  root.add(peerCableMesh);
  // the heads: in the upper antenna's coax (the reply going in) and in the screens' (the processor's word to them)
  const flowTop = flowMat(VEI.clone().multiplyScalar(1.4));
  const flowScr = flowMat(VEI.clone().multiplyScalar(1.2));
  const headTop = new THREE.Mesh(cables[0].c.geo, flowTop);
  const headScr = new THREE.Mesh(cables[3].c.geo, flowScr);
  flowScr.uniforms.uDir.value = -1; // it runs from the processor's end back to the screens
  for (const h of [headTop, headScr]) {
    h.frustumCulled = false;
    h.renderOrder = 7;
    root.add(h);
  }

  /* the waves: the interrogation (veille) and the reply (paler), each a front and its two echoes */
  const capGeo = new THREE.SphereGeometry(1, 72, 18, 0, TAU2, 0, CAP);
  const askHue = VEI.clone().multiplyScalar(2.5);
  const replyHue = VEI.clone().lerp(INK, 0.45).multiplyScalar(1.8);
  const ask = [1, 0.5, 0.22].map((k) => ({ mesh: waveFront(capGeo, askHue), k }));
  const reply = [1, 0.5, 0.22].map((k) => ({ mesh: waveFront(capGeo, replyHue), k }));
  for (const w of [...ask, ...reply]) root.add(w.mesh);

  /* anchors */
  A.cpu = anchor(cpu.part, 0, 0, 0);
  A.gauge = anchor(gauge, 0, 0, 0);
  A.top = top.A.tip;
  A.bottom = bottom.A.tip;
  A.xpdr = anchor(xp.part, 0, 0, 0);
  A.nd = screens.A.nd;
  A.pfd = screens.A.pfd;
  A.symbol = screens.A.symbol;
  A.needle = screens.A.needle;
  A.speaker = anchor(spk.group, 0, 2, 0);
  A.peer = anchor(peer.part, 0, 0, 0);
  A.peerAnt = peerAnt.A.tip;

  /* the threads (the part the voice names) */
  const thCpu = threadOf(cpu.part);
  const thXp = threadOf(xp.part);
  const thPeer = threadOf(peer.part);
  const thPanel = threadOf(back);
  const thSpk = threadOf(spk.part);

  const tmpA = new THREE.Vector3();
  const dir = new THREE.Vector3();
  let floored = false;
  let lastK = -1;
  const ledBase = 1.3;

  return {
    root, A,
    update(P = {}, time = 0, px = 1) {
      // the bench's floor goes down to the system's feet (makeBench lays it at y 0, through the processor):
      // absolute, so it holds whoever else sets it
      if (!floored && root.parent) {
        for (const c of root.parent.children) if (c !== root) c.position.y = LAY.floor + (c.isMesh ? 0.02 : 0);
        floored = true;
      }

      /* apart / together */
      const k = clamp01(P.explode ?? 0);
      if (k !== lastK) {
        lastK = k;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const u = ease(clamp01((k - p.delay) / 0.7));
          p.obj.position.set(p.at[0] + p.off[0] * u, p.at[1] + p.off[1] * u, p.at[2] + p.off[2] * u);
          p.u = u;
        }
        for (let i = 0; i < cables.length; i++) {
          const { c, d } = cables[i];
          const p = parts[d.pa];
          c.a.set(d.a[0] + p.off[0] * p.u, d.a[1] + p.off[1] * p.u, d.a[2] + p.off[2] * p.u);
          c.b.set(d.b[0], d.b[1], d.b[2]);
          shapeCable(c);
        }
      }

      /* the screens, the gauge */
      const tau = P.tau ?? 35;
      screens.update({ level: P.level, ra: P.ra, vs: P.vs, tau, shell: 1 }, time, px);
      gaugeMat.uniforms.uFill.value = clamp01(tau / 60);
      gaugeMat.uniforms.uSig.value = tau <= 35.05 && tau > 0.05 ? 1 : 0;

      /* the ping: out 0 → 0.35 s, at the peer 0.35 → 0.5, the reply 0.5 → 0.8, in the coax 0.8 → 1, to the screens 0 → 0.15 */
      const ping = clamp01(P.ping ?? 0);
      const u = ((time % 1) + 1) % 1;
      tmpA.set(top.root.position.x, top.root.position.y + 4.6, top.root.position.z);
      dir.copy(tipPeer).sub(tmpA);
      const dist = dir.length();
      dir.multiplyScalar(1 / Math.max(dist, 1e-3));
      const sOut = u / 0.35;
      for (let i = 0; i < ask.length; i++) {
        const w = ask[i];
        const r = (sOut - i * 0.09) * dist;
        const on = u < 0.37 && r > 0.5 ? ping * w.k * smooth(0, 0.08, sOut) * (1 - 0.85 * smooth(0.72, 1.0, sOut)) : 0;
        w.mesh.visible = on > 0.002;
        w.mesh.material.uniforms.uAmt.value = on;
        if (w.mesh.visible) {
          w.mesh.position.copy(tmpA);
          w.mesh.quaternion.setFromUnitVectors(UP, dir);
          w.mesh.scale.setScalar(Math.min(r, dist));
        }
      }
      const sBack = (u - 0.5) / 0.3;
      _q.copy(dir).negate();
      for (let i = 0; i < reply.length; i++) {
        const w = reply[i];
        const r = (sBack - i * 0.09) * dist;
        const on = u >= 0.5 && u < 0.82 && r > 0.5 ? ping * w.k * smooth(0, 0.1, sBack) * (1 - 0.85 * smooth(0.72, 1.0, sBack)) : 0;
        w.mesh.visible = on > 0.002;
        w.mesh.material.uniforms.uAmt.value = on;
        if (w.mesh.visible) {
          w.mesh.position.copy(tipPeer);
          w.mesh.quaternion.setFromUnitVectors(UP, _q);
          w.mesh.scale.setScalar(Math.min(r, dist));
        }
      }
      const atPeer = ping * bump(0.3, 0.38, 0.52, u);
      const atYou = ping * bump(0.74, 0.8, 0.92, u);
      flowTop.uniforms.uHead.value = (u - 0.8) / 0.2;
      flowTop.uniforms.uAmt.value = ping * bump(0.78, 0.82, 1.0, u);
      flowScr.uniforms.uHead.value = 1 - u / 0.16; // from the processor (its end) to the screens
      flowScr.uniforms.uAmt.value = ping * 0.85 * bump(-0.01, 0.02, 0.17, u);

      /* the antennas, the threads */
      top.update({ beam: Math.max(P.beam ?? 0, atYou * 0.55), lit: P.litAnt ?? 0 });
      bottom.update({ beam: 0, lit: P.litAnt ?? 0 });
      peerAnt.update({ beam: atPeer * 0.8, lit: 0 });
      setThread(peerAnt.thread, 0.45 + 0.55 * clamp01((P.litPeer ?? 0) + atPeer), SIG_HOT);
      setThread(thPeer, 0.45 + 0.55 * clamp01((P.litPeer ?? 0) + atPeer), SIG_HOT);
      setThread(thCpu, P.litCpu ?? 0);
      setThread(thXp, P.litXpdr ?? 0);
      setThread(thPanel, P.litScreen ?? 0);
      setThread(screens.thread, P.litScreen ?? 0);
      setThread(thSpk, P.litScreen ?? 0);

      /* the LEDs breathe (slowly: one breath in two seconds); the processor's takes the reply's arrival */
      const breath = 0.5 + 0.5 * Math.sin(time * Math.PI);
      setGlow(cpu.ledMat, ledBase + 0.6 * breath + 1.2 * ping * bump(0.95, 1.0, 1.0001, u) + 1.2 * ping * bump(-0.01, 0.0, 0.08, u));
      setGlow(xp.ledMat, ledBase * 0.8 + 0.4 * breath);
      setGlow(peer.ledMat, ledBase * 0.8 + 0.4 * breath + 1.4 * atPeer);

      /* the speaker: its cone beats, rings of sound leave it, slowly */
      const talk = clamp01(P.talk ?? 0);
      const env = 0.6 + 0.4 * Math.sin(time * TAU2 * 1.3);
      spk.cone.position.y = talk * 0.55 * env * Math.sin(time * TAU2 * 7);
      for (let i = 0; i < spk.rings.length; i++) {
        const r = spk.rings[i];
        const s = (((time / 1.3 + i / 3) % 1) + 1) % 1;
        const a = talk * smooth(0, 0.12, s) * Math.pow(1 - s, 1.4);
        r.visible = a > 0.003;
        r.material.opacity = 0.7 * a;
        r.position.y = 2 + s * 9;
        r.scale.setScalar(6.5 + s * 13);
      }
    },
  };
}
