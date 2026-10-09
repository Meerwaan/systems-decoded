// DOSSIER 015 — Brin d'arrêt : the system. The wire across the deck and everything it pulls, as ONE rigid assembly at
// its true place in the ship (plan.js: the root's origin is the middle of the wire, on the deck; the landing axis is −z):
//   · ON THE DECK: the wire — a pendant of steel rope between two couplings — and, at x = ±1100, the two deck sheaves:
//     a wheel in a pot, on a turntable that swivels to face wherever the wire is pulled.
//   · THROUGH THE DECK: each end goes down as a purchase cable, round a lead sheave hung under its pot, and into the brake.
//   · THE BRAKE, lying along x right under the wire, one machine on two rails:
//         fixed block ── vessel ══ valve ══ cylinder ◄═ ram ── crosshead and its block
//     The cables are reeved between the two blocks of sheaves (four parts each): pulled, they draw the crosshead toward
//     the fixed block, and the crosshead drives the ram into the cylinder. The oil has one way out: the valve's throat —
//     a needle in an orifice, set by a graduated wheel — and beyond it the vessel, whose free piston gives way.
//     The oil's way is a straight line, an hourglass lying down: wide, narrow, wide.
// Three values of grey: frames, pots and rails dark · sheaves and rope in between · the heart (ram, cylinder, valve)
// clear. Light: VEILLE is the system alive (the wire under load, the pull running down the cable, the oil at work, the
// part the voice names), SIGNAL the threat (the oil once the throat has heated it, a wrong setting, the wire that parts).
// Liberties taken to be read in one frame (docs/journal/015-model.md): it is a model, no length of it is displayed —
// a rope of 8 cm, a tackle of four parts (the real one has many more), a ram's stroke of 3.7 m whatever the pull,
// sheaves standing on edge so that their faces show, the vessel in line with the cylinder. The system does not take
// the scene's fog (see the end of buildSystem).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, edgesOf, makePart, addMesh, setPartOpacity, anchor, box, cyl, lathe, plate, mergeGeometries } from "@kit/build3d.js";
import { BRINS, ENGINE } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.86, 0.62);
const PALE = VEILLE.clone().lerp(new THREE.Color(1, 1, 1), 0.45);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const TINT_S = new THREE.Color(1, 0.5, 0.36); // …and signal light
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);

/* ─────────────────────────────────────────────────────────── where everything is */

const HALF = BRINS.half;
const LIFT = BRINS.lift;
const YE = ENGINE.y;
/** The rope's radius. A real wire is 3.5 cm across: this one is 8.4, to be seen. */
export const RW = 4.2;
const RS = 30; //             a deck sheave, to the rope's centre
const XD = HALF + RS; //      the vertical each cable goes down by
const CPL = 880; //           the couplings, from the middle of the wire
const R = 115; //             a sheave of the tackle, to the rope's centre
const YT = YE + R; //         the upper sheet of cables
const YB = YE - R; //         the lower one
const RL = 44; //             a lead sheave
const XF = -778; //           the fixed block's axle
const XM0 = 764; //           the crosshead's, the ram out
/** The ram's stroke, cm (`ram` 0 → 1). */
export const STROKE = 370;
const ZM = [-91, -39, 39, 91]; // the crosshead's four sheaves
const ZF = [-65, 13, 65]; //      the fixed block's three
const VES = { x0: -642, x1: -392, r: 78, bore: 68.5, travel: 189 };
const VAL = { x0: -392, x1: -222, throat: -352 };
const CYL = { x0: -222, x1: 214, r: 70, bore: 49 };
const HEAD = { x0: 168, x1: 202 }; //  the ram's head, the ram out
const ROD_END = XM0 - 150; //         where the ram bolts on the crosshead's beam
const DIAL = { at: [-258, YE + 66, 58], n: [-0.22, 0.5, 0.84], turn: 270 * DEG }; // on the valve's wide end: the throat stays in sight
const NEEDLE = 24; //                 cm the needle travels for `dial` 0 → 1
const RAIL = { z: 108, top: YE - 150 };
const WHIP = 2.5; //                  how many half-waves a parted end carries
const LAY = 9; //                     cm of rope for one strand to take the next one's place
/** The wave's way (`wave` 0 → 1): the deck, the deck sheave, down and into the tackle as far as the crosshead, the ram. */
const WAY = { deck: 0.3, under: 0.36, cross: 0.86, ram: 0.93 };

// The exploded view (the bench, a camera filming toward az −40): the pendant lifts off the deck; the whole row of the
// brake — fixed block · vessel · valve · cylinder · ram · crosshead — comes out of the cables TOWARD THE EYE (first
// along the sheaves' own axles: nothing goes through a cable) and a little down, then opens along its own axis.
const OPEN = { pendant: 110, row: [-514, -50, 613], fixed: -300, vessel: -215, valve: -120, cyl: -40, ram: 135, cross: 245 };

/* ─────────────────────────────────────────────────────────── geometry */

const lyingZ = (g) => g.rotateX(Math.PI / 2); // a lathe's axis (y) laid along +z
const lyingX = (g) => g.rotateZ(-Math.PI / 2); // …along +x
/** A lathe written [radius, x] round the machine's axis. Profiles run anticlockwise in (radius, x): it then faces outward. */
const turnX = (profile, segments = 64, o = { bevel: 1, round: 2 }) => lyingX(lathe(profile, segments, o));
const turnY = (profile, segments = 64, o = { bevel: 0.8, round: 2 }) => lathe(profile, segments, o);
const ringOf = (r0, r1, a, b) => [[r0, a], [r1, a], [r1, b], [r0, b], [r0, a]];
const arc = (cx, cy, r, from, to, n = 10) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((from + ((to - from) * i) / n) * DEG), cy + r * Math.sin((from + ((to - from) * i) / n) * DEG)]);
/** A flat piece drawn in (x, y), `t` thick, centred on z. */
const cheek = (outline, t, z, bevel = 1.2) => plate(outline, t, { bevel }).translate(0, 0, z - t / 2);
/** A flat piece drawn in (z, y), `t` thick, centred on x. */
const frame = (outline, t, x, bevel = 1.2) => plate(outline, t, { bevel }).rotateY(-Math.PI / 2).translate(x + t / 2, 0, 0);

/**
 * A round of radius `r` swept through `points` (its frame carried from one to the next: no twist at a bend). It carries
 * `aS`, the length run since the first point, `aAng`, 0–1 round it, and one more attribute per entry of `extra`
 * (a number per point).
 */
function tube(points, r, { radial = 10, extra = {} } = {}) {
  const n = points.length;
  const ring = radial + 1;
  const pos = [];
  const nor = [];
  const sAt = [];
  const ang = [];
  const more = Object.fromEntries(Object.keys(extra).map((k) => [k, []]));
  const index = [];
  const T = V();
  const T0 = V();
  const N = V();
  const Bn = V();
  const axis = V();
  const d = V();
  const q = new THREE.Quaternion();
  let s = 0;
  for (let i = 0; i < n; i++) {
    if (i) s += points[i].distanceTo(points[i - 1]);
    T.subVectors(points[Math.min(n - 1, i + 1)], points[Math.max(0, i - 1)]).normalize();
    if (i === 0) N.set(Math.abs(T.y) > 0.9 ? 1 : 0, Math.abs(T.y) > 0.9 ? 0 : 1, 0);
    else {
      axis.crossVectors(T0, T);
      const sin = axis.length();
      if (sin > 1e-7) N.applyQuaternion(q.setFromAxisAngle(axis.divideScalar(sin), Math.atan2(sin, T0.dot(T))));
    }
    N.addScaledVector(T, -N.dot(T)).normalize();
    T0.copy(T);
    Bn.crossVectors(T, N);
    const p = points[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      d.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(Bn, Math.sin(a));
      pos.push(p.x + d.x * r, p.y + d.y * r, p.z + d.z * r);
      nor.push(d.x, d.y, d.z);
      sAt.push(s);
      ang.push(j / radial);
      for (const k in more) more[k].push(extra[k][i]);
    }
    if (i) {
      for (let j = 0; j < radial; j++) {
        const a = (i - 1) * ring + j;
        index.push(a, a + 1, a + ring, a + ring, a + 1, a + ring + 1);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("aS", new THREE.Float32BufferAttribute(sAt, 1));
  geo.setAttribute("aAng", new THREE.Float32BufferAttribute(ang, 1));
  for (const k in more) geo.setAttribute(k, new THREE.Float32BufferAttribute(more[k], 1));
  geo.setIndex(index);
  geo.userData.length = s;
  return geo;
}

/** A length of rope lying from x = 0 to x = 1: stood between two points by its mesh (scale.x is its length in cm). */
function unitRope(segments) {
  const pts = Array.from({ length: segments + 1 }, (_, i) => V(i / segments, 0, 0));
  const u = pts.map((p) => p.x);
  const zero = pts.map(() => 0);
  return tube(pts, RW, { extra: { aW: u, aMove: zero, aRun: zero } });
}

/**
 * A sheave standing in the (x, y) plane, its axle along z: a grooved rim, a web pierced with `holes` round holes
 * (it is what shows it turning), a hub. `R0`: to the centre of the rope lying in its groove.
 */
function sheave(R0, { flange = 7, t = 16, hub = 24, holes = 5, rimW = 18 } = {}) {
  const inner = R0 - rimW;
  const web = new THREE.Shape();
  web.absarc(0, 0, inner + 1, 0, Math.PI * 2, false);
  const hr = (inner - hub) * 0.34;
  const hc = (inner + hub) / 2;
  for (let k = 0; k < holes; k++) {
    const a = (k / holes) * Math.PI * 2 + Math.PI / 2;
    const hole = new THREE.Path();
    hole.absarc(hc * Math.cos(a), hc * Math.sin(a), hr, 0, Math.PI * 2, true);
    web.holes.push(hole);
  }
  const wt = t * 0.42;
  const h = t / 2;
  return mergeGeometries([
    plate(web, wt, { bevel: Math.min(1, wt / 4), round: 1, curveSegments: 20 }).translate(0, 0, -wt / 2),
    lyingZ(lathe([[inner, -h], [R0 + flange, -h], [R0 + flange, -h * 0.6], [R0 - RW, -h * 0.16], [R0 - RW, h * 0.16], [R0 + flange, h * 0.6], [R0 + flange, h], [inner, h], [inner, -h]], 72, { bevel: Math.min(0.6, t / 30), round: 1 })),
    lyingZ(lathe([[hub * 0.42, -h - 3], [hub, -h - 3], [hub, h + 3], [hub * 0.42, h + 3], [hub * 0.42, -h - 3]], 32, { bevel: 0.6, round: 1 })),
  ]);
}

/**
 * One purchase cable, from where it leaves its deck sheave (going down) to its dead end on the fixed block, the ram out.
 * Each point carries `move` — how much of the crosshead's travel it follows (1 on the crosshead's sheaves, 0 on the
 * fixed ones, in between along a run) — and `run`, how many runs of the tackle lie between it and the deck (0 … 4).
 * `turn`: the index where the cable has gone round its first sheave of the crosshead — as far as the wave follows it.
 */
function reeve(side) {
  const pts = [];
  const move = [];
  const run = [];
  const add = (p, m, r) => (pts.push(p), move.push(m), run.push(r));
  const line = (to, m1, r1, n = 2) => {
    const from = pts.at(-1);
    const m0 = move.at(-1);
    const r0 = run.at(-1);
    for (let i = 1; i <= n; i++) add(from.clone().lerp(to, i / n), m0 + ((m1 - m0) * i) / n, r0 + ((r1 - r0) * i) / n);
  };
  const round = (cx, cy, z, rad, a0, a1, m, n = 16) => {
    const r0 = run.at(-1);
    for (let i = 1; i <= n; i++) add(V(cx + rad * Math.cos((a0 + ((a1 - a0) * i) / n) * DEG), cy + rad * Math.sin((a0 + ((a1 - a0) * i) / n) * DEG), z), m, r0);
  };
  const overCross = (z) => round(XM0, YE, z, R, 90, -90, 1); // top → its far side → bottom
  const overFixed = (z) => round(XF, YE, z, R, 270, 90, 0); //  bottom → its far side → top
  let turn;
  if (side < 0) {
    add(V(-XD, LIFT - RS, 0), 0, 0);
    line(V(-XD, YT + RL, 0), 0, 0);
    round(-XD + RL, YT + RL, 0, RL, 180, 270, 0, 8);
    line(V(XM0, YT, ZM[1]), 1, 1);
    overCross(ZM[1]);
    turn = pts.length - 1;
    line(V(XF, YB, ZF[0]), 0, 2);
    overFixed(ZF[0]);
    line(V(XM0, YT, ZM[0]), 1, 3);
    overCross(ZM[0]);
    line(V(XF + 40, YB, ZM[0]), 0, 4);
  } else {
    add(V(XD, LIFT - RS, 0), 0, 0);
    line(V(XD, YB + RL, 0), 0, 0, 3);
    round(XD - RL, YB + RL, 0, RL, 0, -90, 0, 8);
    line(V(XF, YB, ZF[1]), 0, 0); // under the crosshead, without touching it
    overFixed(ZF[1]);
    line(V(XM0, YT, ZM[2]), 1, 1);
    overCross(ZM[2]);
    turn = pts.length - 1;
    line(V(XF, YB, ZF[2]), 0, 2);
    overFixed(ZF[2]);
    line(V(XM0, YT, ZM[3]), 1, 3);
    overCross(ZM[3]);
    line(V(XF + 40, YB, ZM[3]), 0, 4);
  }
  const runAt = pts.reduce((acc, p, i) => (acc.push(i ? acc[i - 1] + p.distanceTo(pts[i - 1]) : 0), acc), []);
  // beyond its first turn round the crosshead, the cable is no longer on the wave's way
  const wave = runAt.map((s, i) => (i <= turn ? WAY.under + (WAY.cross - WAY.under) * (s / runAt[turn]) : 3));
  return { pts, move, run, wave, turn, length: runAt.at(-1), geo: tube(pts, RW, { extra: { aW: wave, aMove: move, aRun: run } }) };
}

/* ─────────────────────────────────────────────────────────── steel rope */

/**
 * Steel rope, lit like any solid of the house. In the shader:
 *   · six strands laid in a helix (dark grooves between them) and one tracer strand, clearer, drawn on the rope's own
 *     length (uSa + uSb·aS − uSlide·aRun): the lay RUNS when the rope does, never with time; under the pixel it melts
 *   · never thinner than uMinPx pixels
 *   · uShift: the crosshead's travel (each vertex follows it by its aMove)
 *   · uLight: its even glow (under load, named) · uHead / uWave: the head of light running down it, and its tail
 *   · uBend, uV: the whip of a parted wire (straight lengths only) · uTip: its hot end
 */
function rope(color) {
  const mat = solid(color, { rough: 0.62, metal: 0.4 });
  const U = {
    uSa: { value: 0 }, uSb: { value: 1 }, uSlide: { value: 0 }, uShift: { value: 0 }, uMinPx: { value: 2.4 },
    uWa: { value: 0 }, uWb: { value: 1 }, uHead: { value: -1 }, uWave: { value: 0 }, uLight: { value: new THREE.Color(0, 0, 0) },
    uBend: { value: new THREE.Vector4(0, 0, WHIP, 0) }, uV: { value: new THREE.Vector2(0, 0) }, uTip: { value: 0 }, uLit: { value: 0 },
  };
  mat.userData.U = U;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        attribute float aS; attribute float aAng; attribute float aW; attribute float aMove; attribute float aRun;
        uniform float uSa, uSb, uSlide, uShift, uMinPx, uWa, uWb; uniform vec4 uBend; uniform vec2 uV;
        varying float rS; varying float rAng; varying float rW; varying float rV;`,
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `#include <begin_vertex>
        transformed.x += aMove * uShift;
        rV = uV.x + uV.y * aS;
        transformed.y += uBend.x * rV * rV * rV;
        transformed.z += uBend.y * rV * rV * sin(3.14159265 * (uBend.z * rV + uBend.w));
        {
          vec4 c0 = modelViewMatrix * vec4(transformed, 1.0);
          float cmPerPx = max(1.0, -c0.z) / (projectionMatrix[1][1] * ${H2});
          transformed += normal * max(0.0, 0.5 * uMinPx * cmPerPx - ${RW.toFixed(2)});
        }
        rS = uSa + uSb * aS - uSlide * aRun;
        rAng = aAng;
        rW = uWa + uWb * aW;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        uniform float uHead, uWave, uTip, uLit; uniform vec3 uLight;
        varying float rS; varying float rAng; varying float rW; varying float rV;`,
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        {
          float ph = rAng * 6.0 + rS / ${LAY.toFixed(1)};
          float w = clamp(fwidth(ph) * 1.5, 0.002, 0.5);
          float q = fract(ph);
          float groove = 1.0 - smoothstep(0.0, 0.14 + w, min(q, 1.0 - q));
          groove = mix(groove, 0.22, smoothstep(0.15, 0.45, w));
          float pt = rAng + rS / ${(LAY * 6).toFixed(1)};
          float wt = clamp(fwidth(pt) * 1.5, 0.002, 0.5);
          float qt = fract(pt);
          float tracer = smoothstep(0.0, wt, qt) * (1.0 - smoothstep(0.1667, 0.1667 + wt, qt));
          tracer = mix(tracer, 0.1667, smoothstep(0.2, 0.5, wt));
          diffuseColor.rgb *= (1.0 - 0.5 * groove) * (1.0 + 0.6 * tracer) * mix(vec3(1.0), vec3(0.6, 1.3, 0.98), uLit);
        }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        {
          float d = rW - uHead;
          float head = exp(-d * d / 0.0005);
          float tail = step(d, 0.0) * exp(d / 0.09);
          totalEmissiveRadiance += uLight + vec3(${VEILLE.r.toFixed(3)}, ${VEILLE.g.toFixed(3)}, ${VEILLE.b.toFixed(3)}) * uWave * (1.7 * head + 0.55 * tail)
            + vec3(${SIGNAL.r.toFixed(3)}, ${SIGNAL.g.toFixed(3)}, ${SIGNAL.b.toFixed(3)}) * uTip * (0.22 * smoothstep(0.35, 1.0, rV) + 2.0 * smoothstep(0.94, 1.0, rV));
        }`,
      );
  };
  return mat;
}

/* ─────────────────────────────────────────────────────────── light that has a place */

const BARS = /* glsl */ `
  // bars of light, their ends softened over what a pixel covers — and melted into their mean once too small to count
  float bars(float x, float duty) {
    float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
    float q = fract(x);
    float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
    return mix(b, duty, smoothstep(0.12, 0.4, w));
  }`;
const STREAM = { period: 46, speed: 150 }; // cm, cm/s: 5 cm a frame, a ninth of a period — it runs, it does not strobe

/**
 * The oil, as a volume of light: brighter where the eye goes through more of it (a column, not a disc). `shared`:
 * uniforms every volume reads —
 *   uAmount  how much of it shows (the X-ray)           uFlow   it streams toward the vessel (rings of light, running −x)
 *   uReach   how far from the throat it has turned signal: the heat is made THERE, and spreads from there (cm; < 0: none)
 * — and its own: where it stands along the machine's axis (uXa + uXs·x), how bright it is (uBase).
 */
function oil(shared, base, white = 0) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { ...shared, uXa: { value: 0 }, uXs: { value: 1 }, uBase: { value: base }, uWhite: { value: white } },
    vertexShader: /* glsl */ `
      uniform float uXa, uXs; varying vec3 vN; varying vec3 vE; varying float vX;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vE = normalize(-mv.xyz);
        vX = uXa + uXs * position.x;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCool, uHot; uniform float uAmount, uTime, uFlow, uReach, uBase, uWhite;
      varying vec3 vN; varying vec3 vE; varying float vX;
      ${BARS}
      void main() {
        float facing = clamp(abs(dot(normalize(vN), normalize(vE))), 0.0, 1.0);
        float body = 0.3 + 0.7 * pow(facing, 1.3);
        float hot = 1.0 - smoothstep(uReach - 26.0, uReach + 26.0, abs(vX - (${VAL.throat.toFixed(1)})));
        float ring = bars((vX + uTime * ${STREAM.speed.toFixed(1)}) / ${STREAM.period.toFixed(1)}, 0.5);
        float light = uBase * mix(1.0, 0.72 + 0.56 * ring, uFlow);
        gl_FragColor = vec4(mix(mix(uCool, uHot, hot), vec3(1.0, 0.9, 0.72), uWhite) * light * body * uAmount, 1.0);
      }`,
  });
}

/**
 * A ball of light with no edge, always facing the eye: a small hot heart, a soft body, a long tail. `uRadius` cm
 * (where the tail ends), never under `uMinPx` pixels. It stands where it is: what is in front of it hides it.
 */
function makeBall(heart, hue) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
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
        uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv;
        void main() {
          float r2 = dot(vUv, vUv);
          float core = exp(-r2 / 0.012);
          float body = 0.42 * exp(-r2 / 0.09);
          float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
          gl_FragColor = vec4((uHeart * (core * 2.4) + uHue * (body + tail)) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  mesh.visible = false;
  return mesh;
}
const lightMesh = (geometry, material) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  return mesh;
};
const shine = (ball, amount, radius, minPx) => {
  ball.visible = amount > 0.004;
  ball.material.uniforms.uAmount.value = amount;
  ball.material.uniforms.uRadius.value = radius;
  ball.material.uniforms.uMinPx.value = minPx;
};

/* ─────────────────────────────────────────────────────────── the system */

/**
 * → { root, A, update(P, time, px) }. `root`: one rigid assembly, its origin the middle of the wire on the deck
 * (world.js stands it in the ship, or on the bench). `A`: anchors that follow their parts, opened or not.
 * P (see FIRST in world.js):
 *   bench     1: on the bench — a T of glass deck under the wire, feet under the rails and, when `held`, a hook's head
 *   held      the bight follows the hook: it stands at [0, lift + 3, −pull × 100] (× held); the legs run straight to it
 *             from the deck sheaves, which swivel to face it and turn as the rope pays out; the couplings travel with it
 *   pull      metres the bight has been pulled (see held): the lay of the rope runs with it
 *   ram       the ram's stroke: the crosshead and its sheaves come 3.7 m toward the fixed block, every sheave turns
 *             (each at its own speed), the lay runs in the tackle, the oil leaves the cylinder, the vessel's piston gives way
 *   flow      the oil forced through the throat: a jet into the vessel, a light at the throat, rings running in the oil
 *             (under the X-ray; without it the valve's neck glows)
 *   heat      the oil turns signal, from the throat outward (0.5: the vessel · 1: all of it)
 *   tense     the wire and its cables glow veille
 *   wave      a head of light: the deck (0 → 0.3), the deck sheave, down and through the tackle to the crosshead (0.86),
 *             the ram (0.93). It is dark at 0 AND at 1: bring it back to 0 on a cut
 *   dial      the graduated wheel turns (0.5: its mark on the index, both veille) and the needle moves in the throat
 *   wrong     the wheel, its mark and the valve turn signal
 *   parted    the wire breaks at the bight: a ball of signal light there, two ends that whip back, frayed and hot
 *   xray      the cylinder, the valve and the vessel turn to glass: the ram's head, the oil, the needle, the free piston
 *   explode   0 → 1 (the bench): see OPEN
 *   litBrin, litCable, litSheaves, litRam, litCyl, litValve   0–1: the part the voice is naming glows faintly veille
 */
export function buildSystem() {
  const root = new THREE.Group();
  const grp = (parent = root) => {
    const g = new THREE.Group();
    parent.add(g);
    return g;
  };
  const partIn = (parent, name) => {
    const part = makePart(name);
    parent.add(part);
    return part;
  };
  // three values of grey
  const dark = () => solid(0x3d444a, { rough: 0.8, metal: 0.2 });
  const mid = () => solid(0x7d858c, { rough: 0.5, metal: 0.4 });
  const fine = () => solid(0xb4bbc0, { rough: 0.42, metal: 0.45 });
  const bright = () => solid(0xdde1e4, { rough: 0.3, metal: 0.5, env: 1.3 });
  const sheaveMat = solid(0x848c93, { rough: 0.48, metal: 0.4 });

  /* ══ ON THE DECK: the two sheaves in their pots ══ */
  const pots = partIn(root, "pots");
  const wheels = partIn(root, "wheels"); // every sheave of the film: one material, they light together
  const hang = partIn(root, "hangers");
  const SIDES = [-1, 1];
  const leadAt = (s) => [s * (XD - RL), (s < 0 ? YT : YB) + RL];
  {
    const m = { pot: dark(), ring: solid(0x8b9299, { rough: 0.92, metal: 0, env: 0.5 }), strap: dark() }; // matt: a flat face looking up mirrors the rim light, a white-green burn
    for (const s of SIDES) {
      addMesh(pots, turnY([[0, -74], [78, -74], [78, -3], [73.5, -3], [73.5, -69], [0, -69]], 56).translate(s * XD, 0, 0), m.pot, { edgeOpacity: 0.4 });
      addMesh(pots, turnY(ringOf(73.5, 90, -3, 1.5), 56, { bevel: 0.6, round: 1 }).translate(s * XD, 0, 0), m.ring, { edgeOpacity: 0.5 });
      // the two straps the lead sheave hangs by, under the pot
      const [cx, cy] = leadAt(s);
      const strap = [[cx - 15, -74], [cx - 10, cy], ...arc(cx, cy, 12, 180, 360, 8), [cx + 10, cy], [cx + 15, -74]];
      addMesh(hang, mergeGeometries([cheek(strap, 4, -11, 0.8), cheek(strap, 4, 11, 0.8), lyingZ(cyl(6, 30, 0.8, 20)).translate(cx, cy, 0)]), m.strap, { edgeOpacity: 0.35 });
    }
  }
  const leadSpin = SIDES.map((s) => {
    const g = grp();
    g.position.set(...leadAt(s), 0);
    g.add(addMesh(wheels, sheave(RL, { flange: 5, t: 12, hub: 10, holes: 4, rimW: 10 }), sheaveMat, { edgeOpacity: 0.45 }));
    return g;
  });
  // the turntable in each pot: it swivels about the vertical the cable goes down by, to face the bight
  const tables = partIn(root, "turntables");
  const tableMat = solid(0x4d545b, { rough: 0.95, metal: 0, env: 0.5 });
  const swivel = SIDES.map((s) => {
    const g = grp();
    g.position.set(s * XD, 0, 0);
    const top = new THREE.Shape();
    top.absarc(0, 0, 72.5, 0, Math.PI * 2, false);
    top.holes.push(new THREE.Path([[-10, -11], [69, -11], [69, 11], [-10, 11]].map(([x, y]) => new THREE.Vector2(x, y))));
    g.add(addMesh(tables, plate(top, 3, { bevel: 0.5, round: 1 }).rotateX(Math.PI / 2), tableMat, { edgeOpacity: 0.45 }));
    const spin = grp(g);
    spin.position.set(RS, LIFT - RS, 0);
    spin.add(addMesh(wheels, sheave(RS, { flange: 7, t: 14, hub: 9, holes: 0, rimW: 9 }), sheaveMat, { edgeOpacity: 0.45 }));
    return { g, spin };
  });

  /* ══ THE WIRE: a pendant between two couplings, and the ends of the two purchase cables it is pinned to ══ */
  const wireG = grp();
  const pendG = grp(); // the pendant: it lifts off in the exploded view
  const ropeMesh = (parent, geometry, color) => {
    const mesh = new THREE.Mesh(geometry, rope(color));
    mesh.frustumCulled = false;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const PENDANT = 0xd0d5d9;
  const CABLE = 0x9aa1a8;
  const pendGeo = unitRope(40);
  const endGeo = unitRope(10);
  const wrapGeo = (() => {
    // over the deck sheave: from the top of the wheel, a quarter of a turn, to the vertical it goes down by
    const pts = arc(RS, LIFT - RS, RS, 90, 180, 10).map(([x, y]) => V(x, y, 0));
    const run = pts.map((_, i) => (i / 10) * (Math.PI / 2) * RS);
    const zero = pts.map(() => 0);
    return tube(pts, RW, { extra: { aW: run.map((s) => WAY.deck + (WAY.under - WAY.deck) * (s / run.at(-1))), aMove: zero, aRun: zero } });
  })();
  const socketMat = { pend: fine(), cable: mid() };
  const sockets = partIn(pendG, "sockets");
  const ferrules = partIn(wireG, "ferrules");
  const frayMat = bright();
  const fraying = partIn(pendG, "fray");
  const legs = SIDES.map((s, i) => {
    const end = ropeMesh(wireG, endGeo, CABLE);
    const pend = ropeMesh(pendG, pendGeo, PENDANT);
    pend.material.userData.U.uMinPx.value = 3;
    const wrap = ropeMesh(swivel[i].g, wrapGeo, CABLE);
    // the coupling: a socket swaged on each rope, pinned to the other (drawn along +x: toward the bight)
    const socket = addMesh(sockets, mergeGeometries([turnX([[0, 3], [9.5, 3], [9.5, 24], [6, 34], [0, 34]], 24, { bevel: 0.8, round: 1 }), cyl(3, 22, 0.5, 12).translate(0, 0, 0)]), socketMat.pend, { edgeOpacity: 0.5 });
    const ferrule = addMesh(ferrules, turnX([[0, -34], [6, -34], [9.5, -24], [9.5, -3], [0, -3]], 24, { bevel: 0.8, round: 1 }), socketMat.cable, { edgeOpacity: 0.5 });
    // the broken end: strands sprung apart
    const wires = [[0, 0, 22], [0.5, 0.35, 19], [-0.45, 0.4, 20], [0.3, -0.5, 17], [-0.5, -0.3, 21], [0.05, 0.6, 16]].map(([y, z, len]) => lyingX(cyl(1.3, len, 0.05, 6, 0.25)).translate(len / 2, 0, 0).rotateZ(y * 0.9).rotateY(-z * 0.9));
    const fray = addMesh(fraying, mergeGeometries(wires), frayMat, { edges: false });
    fray.castShadow = false;
    return { s, end, pend, wrap, socket, ferrule, fray, U: [end.material.userData.U, pend.material.userData.U, wrap.material.userData.U] };
  });

  /* ══ THE PURCHASE CABLES, reeved through the brake ══ */
  const reeved = SIDES.map((s) => {
    const way = reeve(s);
    const mesh = ropeMesh(root, way.geo, CABLE);
    return { ...way, mesh, U: mesh.material.userData.U };
  });

  /* ══ THE BRAKE ══ */
  const frameG = grp();
  const rails = partIn(frameG, "frame");
  const feet = partIn(frameG, "feet");
  {
    const m = { rail: solid(0x343a40, { rough: 0.85, metal: 0.2 }), foot: solid(0x23272b, { rough: 0.95, env: 0.4 }) };
    const saddle = (x, rc) => frame([[-116, -150], [-100, -150], [-100, -98], [100, -98], [100, -150], [116, -150], [116, -40], ...arc(0, 0, rc + 0.5, -26, -154, 14), [-116, -40]].map(([z, y]) => [z, y + YE]), 10, x);
    addMesh(rails, mergeGeometries([...[-1, 1].map((k) => box(1800, 10, 18, 1.5).translate(0, RAIL.top - 5, k * RAIL.z)), saddle(-520, VES.r), saddle(-140, CYL.r), saddle(140, CYL.r)]), m.rail, { edgeOpacity: 0.35 });
    addMesh(feet, mergeGeometries([-800, -400, 0, 400, 800].flatMap((x) => [-1, 1].map((k) => box(70, 30, 34, 3).translate(x, RAIL.top - 25, k * RAIL.z)))), m.foot, { edgeOpacity: 0.3 });
  }
  const rowG = grp(); // everything that comes out of the cables in the exploded view

  /* ── the fixed block: three sheaves on an axle, two cheeks standing on the rails, the cables' dead ends ── */
  const fG = grp(rowG);
  const fixed = partIn(fG, "fixed");
  {
    const m = { cheek: dark(), pin: fine() };
    const side = [[-95, -150], [95, -150], [95, -132], [50, -112], ...arc(0, 0, 40, 14, 166, 12), [-50, -112], [-95, -132]].map(([x, y]) => [x + XF, y + YE]);
    addMesh(fixed, mergeGeometries([cheek(side, 8, -104), cheek(side, 8, 104), box(190, 12, 200, 2).translate(XF, YE - 143, 0), ...[-1, 1].map((k) => box(40, 24, 18, 3).translate(XF + 44, YB, k * 91))]), m.cheek, { edgeOpacity: 0.42 });
    addMesh(fixed, lyingZ(cyl(13, 232, 1.5, 24)).translate(XF, YE, 0), m.pin, { edgeOpacity: 0.45 });
  }
  const bigSheave = sheave(R);
  const spinning = (parent, x, z) => {
    const g = grp(parent);
    g.position.set(x, YE, z);
    g.add(addMesh(wheels, bigSheave, sheaveMat, { edgeOpacity: 0.45 }));
    return g;
  };
  const fSpin = ZF.map((z) => spinning(fG, XF, z));

  /* ── the crosshead: a beam the ram bolts on, two cheeks on shoes that ride the rails, four sheaves ── */
  const mG = grp(rowG);
  const cross = partIn(mG, "crosshead");
  {
    const m = { cheek: solid(0x4a5158, { rough: 0.75, metal: 0.25 }), pin: fine() };
    const side = [[-150, -52], [-108, -52], [-100, -136], [-132, -136], [-132, -150], [-30, -150], [-30, -136], [-62, -136], [-70, -52], [-36, -52], ...arc(0, 0, 40, -64, 64, 12), [-36, 52], [-150, 52]].map(([x, y]) => [x + XM0, y + YE]);
    addMesh(cross, mergeGeometries([cheek(side, 8, -108), cheek(side, 8, 108), box(18, 104, 224, 2.5).translate(XM0 - 141, YE, 0), box(110, 56, 12, 2).translate(XM0 - 78, YE, 0)]), m.cheek, { edgeOpacity: 0.45 });
    addMesh(cross, lyingZ(cyl(13, 240, 1.5, 24)).translate(XM0, YE, 0), m.pin, { edgeOpacity: 0.45 });
  }
  const mSpin = ZM.map((z) => spinning(mG, XM0, z));
  // how many runs of the tackle pay out over each sheave: it turns that many times faster
  const TURNS = [[mSpin[0], 1], [fSpin[0], 2], [mSpin[1], 3], [mSpin[3], 1], [fSpin[2], 2], [mSpin[2], 3], [fSpin[1], 4]];

  /* ── the ram: a polished plunger, its head in the cylinder, its end bolted on the crosshead ── */
  const ramG = grp(rowG);
  const ram = partIn(ramG, "ram");
  const ramMat = bright();
  addMesh(ram, turnX([[0, HEAD.x0], [CYL.bore - 0.4, HEAD.x0], [CYL.bore - 0.4, HEAD.x1], [40, HEAD.x1], [40, ROD_END - 14], [54, ROD_END - 14], [54, ROD_END], [0, ROD_END]], 64), ramMat, { edgeOpacity: 0.5 });

  /* ── the cylinder: thick walls, a flange at each end, the gland the ram goes in by ── */
  const hydGlass = () => glass(BRAND.ink, { base: 0.012, rim: 0.3, power: 2.6, edge: 0.45, spec: 0.55, through: 0.25 });
  const nuts = (x, r, n = 10) => mergeGeometries(Array.from({ length: n }, (_, i) => lyingX(cyl(4.6, 6, 0.6, 6)).translate(x, r * Math.cos(((i + 0.5) / n) * Math.PI * 2), r * Math.sin(((i + 0.5) / n) * Math.PI * 2))));
  /** A shell of the brake: solid, and the same in glass for the X-ray. */
  const shell = (parent, name, profile, color, bolts) => {
    const part = partIn(parent, name);
    const shape = turnX(profile, 72);
    const mat = solid(color, { rough: 0.45, metal: 0.4 });
    addMesh(part, shape, mat, { edgeOpacity: 0.5 });
    if (bolts.length) addMesh(part, mergeGeometries(bolts), fine(), { edges: false });
    const glassMat = hydGlass();
    const ghost = new THREE.Mesh(shape, glassMat);
    const lines = edgesOf(shape, { color: BRAND.ink, width: 2, opacity: 0.5 });
    ghost.add(lines);
    ghost.visible = false;
    asShell(ghost, 10);
    parent.add(ghost);
    return { part, mat, ghost, glassMat, lines };
  };
  const cylG = grp(rowG);
  const C = CYL;
  const cylS = shell(
    cylG, "cylinder",
    [[0, C.x0], [84, C.x0], [84, C.x0 + 14], [C.r, C.x0 + 14], [C.r, -66], [75, -66], [75, -54], [C.r, -54], [C.r, 54], [75, 54], [75, 66], [C.r, 66], [C.r, C.x1 - 14], [84, C.x1 - 14], [84, C.x1], [58, C.x1], [58, C.x1 + 20], [0, C.x1 + 20]],
    0xb3babf, [nuts(C.x0 + 17, 77), nuts(C.x1 - 17, 77)],
  );

  /* ── the valve: outside, a funnel down to a neck; inside, an orifice and the needle that half shuts it ── */
  const valveG = grp(rowG);
  const XT = VAL.throat;
  const valveS = shell(
    valveG, "valve",
    [[0, VAL.x0], [84, VAL.x0], [84, VAL.x0 + 14], [52, VAL.x0 + 14], [46, XT - 14], [46, XT + 14], [70, VAL.x1 - 22], [70, VAL.x1 - 14], [84, VAL.x1 - 14], [84, VAL.x1], [0, VAL.x1]],
    0xcdd2d6, [nuts(VAL.x0 + 17, 70, 8), nuts(VAL.x1 - 17, 77)],
  );
  const guts = partIn(valveG, "orifice");
  addMesh(guts, turnX(ringOf(13, 45, XT - 8, XT + 8), 48, { bevel: 0.8, round: 1 }), bright(), { edgeOpacity: 0.5 });
  const needleG = grp(valveG);
  const needle = partIn(needleG, "needle");
  {
    const tip = XT - 24;
    const arm = box(5, 34, 8, 1).translate(tip + 116, 24, 0);
    addMesh(needle, mergeGeometries([turnX([[0, tip], [20, tip + 62], [20, tip + 70], [7, tip + 76], [7, tip + 120], [0, tip + 120]], 40, { bevel: 0.5, round: 1 }), ...[0, 1, 2].map((k) => arm.clone().rotateX((k / 3) * Math.PI * 2))]), bright(), { edgeOpacity: 0.5 });
  }
  // the graduated wheel: a fixed ring and its index, a wheel that turns — its ticks, its mark
  const dialG = grp(valveG);
  dialG.position.set(...DIAL.at);
  dialG.quaternion.setFromUnitVectors(V(0, 0, 1), V(...DIAL.n).normalize());
  const dial = partIn(dialG, "dial");
  const dialSpin = grp(dialG);
  const dialMat = { boss: solid(0xcdd2d6, { rough: 0.45, metal: 0.4 }), ring: solid(0x2a2f34, { rough: 0.7, coat: 0.2 }), rim: bright(), face: solid(0x1d2125, { rough: 0.8, env: 0.6 }), tick: glow(BRAND.ink, 0.8), mark: glow(BRAND.veille, 1.5), index: glow(BRAND.veille, 1.5) };
  addMesh(dial, lyingZ(cyl(21, 66, 1.5, 32)).translate(0, 0, -35), dialMat.boss, { edgeOpacity: 0.5 });
  addMesh(dial, lyingZ(lathe([[0, -5], [37, -5], [37, 1.5], [0, 1.5]], 56, { bevel: 0.8, round: 1 })), dialMat.ring, { edgeOpacity: 0.5 });
  addMesh(dial, plate([[-5, 36.5], [5, 36.5], [0, 29]], 2.5, { bevel: 0.3 }).translate(0, 0, 1.5), dialMat.index, { edges: false });
  dialSpin.add(
    addMesh(dial, lyingZ(lathe([[0, 1.5], [28, 1.5], [28, 8], [25, 12], [9, 12], [9, 19], [0, 19]], 56, { bevel: 0.7, round: 1 })), dialMat.rim, { edgeOpacity: 0.5 }),
    addMesh(dial, lyingZ(lathe([[9.5, 12], [24.5, 12], [24.5, 12.5], [9.5, 12.5], [9.5, 12]], 48)), dialMat.face, { edges: false }),
    addMesh(dial, mergeGeometries(Array.from({ length: 24 }, (_, i) => box(i % 6 ? 1.3 : 2, i % 6 ? 4.5 : 7.5, 0.8, 0.2, 1).translate(0, 23.5 - (i % 6 ? 2.25 : 3.75), 12.8).rotateZ((i / 24) * Math.PI * 2)).slice(1)), dialMat.tick, { edges: false }),
    addMesh(dial, box(3.4, 11, 1.2, 0.3, 1).translate(0, 18, 13), dialMat.mark, { edges: false }),
  );

  /* ── the vessel: a bottle with a free piston; beyond the piston, the gas that will send the oil back ── */
  const vesselG = grp(rowG);
  const A0 = VES.x0;
  const vesselS = shell(
    vesselG, "vessel",
    [[0, A0], [34, A0 + 2], [58, A0 + 9], [73, A0 + 20], [VES.r, A0 + 34], [VES.r, VES.x1 - 14], [86, VES.x1 - 14], [86, VES.x1], [0, VES.x1]],
    0x9da4ab, [nuts(VES.x1 - 17, 70, 8)],
  );
  const freeG = grp(vesselG);
  const free = partIn(freeG, "piston");
  addMesh(free, turnX([[0, VES.x1 - 36], [VES.bore, VES.x1 - 36], [VES.bore, VES.x1 - 12], [0, VES.x1 - 12]], 56), fine(), { edgeOpacity: 0.5 });

  // What stands in the oil is drawn AFTER its light, not under it: a needle of steel in a green glow, not a paler green.
  for (const part of [ram, guts, needle, free]) {
    for (const mesh of part.children) {
      mesh.material.transparent = mesh.material.userData.transparent = true;
      mesh.renderOrder = 6;
      for (const line of mesh.children) line.renderOrder = 7;
    }
  }

  /* ── the oil: in the cylinder, in the valve's passage, in the vessel; the jet ── */
  const OIL = { uCool: { value: VEILLE.clone() }, uHot: { value: SIGNAL.clone() }, uAmount: { value: 0 }, uTime: { value: 0 }, uFlow: { value: 0 }, uReach: { value: -100 } };
  const column = () => lyingX(new THREE.CylinderGeometry(1, 1, 1, 40).translate(0, 0.5, 0)); // from x = 0 to x = 1, radius 1
  const cylOil = lightMesh(column(), oil(OIL, 0.65));
  cylOil.position.set(C.x0 + 8, YE, 0);
  cylG.add(cylOil);
  const passOil = lightMesh(turnX([[0, VAL.x0 + 2], [60, VAL.x0 + 2], [60, VAL.x0 + 8], [16, XT - 12], [13, XT - 8], [13, XT + 8], [16, XT + 14], [C.bore, VAL.x1 - 6], [0, VAL.x1 - 6]], 48, { bevel: 0, crease: 30 }), oil(OIL, 0.5));
  passOil.position.y = YE;
  valveG.add(passOil);
  const vesOil = lightMesh(column(), oil(OIL, 0.65));
  vesOil.position.y = YE;
  vesselG.add(vesOil);
  const JET = { uAmount: { value: 0 } };
  const jetMat = oil({ ...OIL, uAmount: JET.uAmount }, 1, 0.55);
  const jet = lightMesh(lyingX(new THREE.CylinderGeometry(0.24, 1, 1, 32, 1, true).translate(0, -0.5, 0)), jetMat); // narrow at x = 0, wide at x = −1
  jet.position.set(XT - 8, YE, 0);
  const core = lightMesh(lyingX(new THREE.CylinderGeometry(0.2, 0.2, 1, 16).translate(0, -0.5, 0)), oil({ ...OIL, uAmount: JET.uAmount }, 1, 0.55));
  core.position.set(XT + 12, YE, 0);
  core.scale.set(24, 54, 54);
  const jetBall = makeBall(HOT, VEILLE);
  jetBall.position.set(XT - 10, YE, 0);
  valveG.add(jet, core, jetBall);
  // the shells stand on the machine's axis
  for (const s of [cylS, valveS, vesselS]) {
    for (const child of s.part.children) child.position.y = YE;
    s.ghost.position.y = YE;
  }
  for (const part of [ram, guts, needle, free]) for (const child of part.children) child.position.y = YE;

  /* ══ THE BENCH: a T of glass deck under the wire, and the head of a hook ══ */
  const benchG = grp();
  const deckMat = glass(BRAND.ink, { base: 0, rim: 0.02, power: 3, edge: 0.05 });
  {
    const t = new THREE.Shape([[-1270, 130], [1270, 130], [1270, -130], [150, -130], [150, -790], [-150, -790], [-150, -130], [-1270, -130]].map(([x, z]) => new THREE.Vector2(x, z)));
    for (const s of SIDES) {
      const hole = new THREE.Path();
      hole.absarc(s * XD, 0, 93, 0, Math.PI * 2, true);
      t.holes.push(hole);
    }
    const slab = plate(t, 8, { bevel: 1, round: 1, curveSegments: 32 }).rotateX(Math.PI / 2);
    const deck = new THREE.Mesh(slab, deckMat);
    deck.add(edgesOf(slab, { color: BRAND.ink, width: 2, opacity: 0.42 }));
    asShell(deck, 30);
    // the centreline the aircraft comes down
    const paint = new THREE.Mesh(mergeGeometries([-250, -400, -550, -700].map((z) => new THREE.PlaneGeometry(14, 80).rotateX(-Math.PI / 2).translate(0, 0.6, z))), glow(BRAND.ink, 0.2, { additive: true, double: true }));
    paint.renderOrder = 4;
    benchG.add(deck, paint);
  }
  const hookG = grp(benchG);
  const hook = partIn(hookG, "hook");
  {
    // drawn in (z, y) round the wire it holds: a beak under it, a throat, the shank going up and forward to the aircraft
    const shoe = [[-26, -9.5], [-4, -12.5], [12, -12.5], [20, -3], [20, 8], [10, 16], [-70, 82], [-80, 70], [-12, 9.5], ...arc(0, 0, 6.2, 130, -130, 10)];
    addMesh(hook, frame(shoe, 22, 0, 1.2), solid(0x7d858c, { rough: 0.55, metal: 0.4 }), { edgeOpacity: 0.6 });
  }

  /* ── lights that have a place: the wave's two heads, the break, (the jet's is above) ── */
  const heads = SIDES.map(() => makeBall(PALE, VEILLE));
  const breakBall = makeBall(HOT, SIGNAL);
  const breakLight = new THREE.PointLight(BRAND.signal, 0, 1500, 2);
  root.add(...heads, breakBall, breakLight);

  /* ── anchors ── */
  const bight = anchor(root, 0, LIFT, 0);
  const A = {
    wire: anchor(root, 0, LIFT, 0),
    bight,
    sheaveL: anchor(root, -XD, 12, 0),
    sheaveR: anchor(root, XD, 12, 0),
    coupling: anchor(pendG, -CPL, LIFT, 0),
    cable: anchor(root, -XD, (LIFT - RS + YT + RL) / 2, 0),
    cableR: anchor(root, XD, (LIFT - RS + YB + RL) / 2, 0),
    lead: anchor(root, ...leadAt(-1), 8),
    runs: anchor(root, (XF + XM0) / 2 - 150, YT, ZM[3]),
    blocks: anchor(fG, XF, YE + R, ZF[2]),
    fixed: anchor(fG, XF, YE, ZF[2] + 12),
    crosshead: anchor(mG, XM0, YE + R, ZM[3]),
    ram: anchor(ramG, (C.x1 + 20 + ROD_END) / 2, YE + 40, 0),
    head: anchor(ramG, (HEAD.x0 + HEAD.x1) / 2, YE, 0),
    cyl: anchor(cylG, 0, YE + C.r, 0),
    valve: anchor(valveG, XT, YE + 46, 0),
    throat: anchor(valveG, XT, YE, 0),
    dial: anchor(dialSpin, 0, 0, 19),
    vessel: anchor(vesselG, (VES.x0 + VES.x1) / 2, YE + VES.r, 0),
  };

  /* ── what lights up when the voice names a part: its solids, and the lines of its edges ── */
  const glowOf = (mat) => 0.11 * (1 - 0.85 * Math.min(1, 0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b));
  const lampOf = (...parts) => {
    const mats = parts.flatMap((part) => [...part.userData.part.mats]);
    const lineMats = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lineMats) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.hot = mat.color.clone().multiply(TINT_S);
      mat.userData.glow = glowOf(mat);
    }
    return { solids, lines: lineMats, k: -1, bad: -1, extra: -1 };
  };
  const red = new THREE.Color();
  /** `k` veille (named), `bad` signal (a fault, or heat), `extra` more veille light (the wave arriving). */
  const light = (lamp, k, bad = 0, extra = 0) => {
    if (lamp.k === k && lamp.bad === bad && lamp.extra === extra) return;
    lamp.k = k;
    lamp.bad = bad;
    lamp.extra = extra;
    for (const mat of lamp.solids) {
      mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k + extra).add(red.copy(SIGNAL).multiplyScalar(bad * 0.22));
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.7 * k).lerp(mat.userData.hot, 0.62 * bad);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k).lerp(SIGNAL, 0.7 * bad);
  };
  const lamps = { brin: lampOf(sockets), cable: lampOf(ferrules), sheaves: lampOf(wheels), ram: lampOf(ram), cyl: lampOf(cylS.part), valve: lampOf(valveS.part, dial), vessel: lampOf(vesselS.part) };

  // The system does not take the fog: it is the subject, and it is 22 m wide — a fog set for the camera's distance
  // would eat its far end, and one set for another distance (a trial frame posed far away) would eat it whole.
  root.traverse((o) => {
    if (o.material?.fog) o.material.fog = false;
  });
  const SHELLS = [cylS, valveS, vesselS];

  // nothing is allocated past this line
  const X = V();
  const Y = V();
  const Z = V();
  const UP = V(0, 1, 0);
  const m4 = new THREE.Matrix4();
  const tmp = new THREE.Color();
  const at = V();
  /** Where the wave's head stands on a purchase cable (→ `at`). */
  const along = (way, w, shift) => {
    let i = 1;
    while (i < way.turn && way.wave[i] < w) i++;
    const u = clamp01((w - way.wave[i - 1]) / Math.max(1e-6, way.wave[i] - way.wave[i - 1]));
    at.copy(way.pts[i - 1]).lerp(way.pts[i], u);
    at.x += shift * (way.move[i - 1] + (way.move[i] - way.move[i - 1]) * u);
  };

  return {
    root, A,
    parts: { pots, wheels, fixed, cross, ram, cylinder: cylS.part, valve: valveS.part, vessel: vesselS.part, dial, hook },
    update(P, time = 0) {
      const bench = (P.bench ?? 0) > 0.5;
      const e = clamp01(P.explode ?? 0);
      const whole = 1 - smooth(ramp(e, 0, 0.1)); // what only makes sense assembled leaves first
      const held = clamp01(P.held ?? 0);
      const pull = Math.max(0, P.pull ?? 0);
      const stroke = clamp01(P.ram ?? 0);
      const flow = clamp01(P.flow ?? 0);
      const heat = clamp01(P.heat ?? 0);
      const tense = clamp01(P.tense ?? 0);
      const wave = clamp01(P.wave ?? 0);
      const setting = clamp01(P.dial ?? 0.5);
      const wrong = clamp01(P.wrong ?? 0);
      const parted = clamp01(P.parted ?? 0);
      const xray = clamp01(P.xray ?? 0);
      const litBrin = clamp01(P.litBrin ?? 0);
      const litCable = clamp01(P.litCable ?? 0);
      const D = stroke * STROKE;
      const waveOn = smooth(ramp(wave, 0, 0.03)) * (1 - smooth(ramp(wave, 0.95, 1)));

      // ── the wire: its bight, its two legs, the sheaves that face it
      const bx = 0;
      const by = LIFT + 3 * held;
      const bz = -pull * 100 * held;
      bight.position.set(bx, by, bz);
      const keep = 1 - 0.45 * Math.pow(parted, 1.6); // the ends recoil toward their sheaves
      const taut = 1 - smooth(ramp(parted, 0, 0.4)); // a parted wire holds nothing
      const whipY = 150 * Math.sin(Math.PI * parted);
      const whipZ = 0.09 * Math.sin(Math.PI * Math.min(1, 1.15 * parted)) + 0.02 * parted;
      const tip = smooth(ramp(parted, 0, 0.05)) * (1 - 0.75 * parted);
      const lift = OPEN.pendant * settle(ramp(e, 0, 0.45));
      pendG.position.y = lift;
      for (let i = 0; i < 2; i++) {
        const leg = legs[i];
        const s = leg.s;
        let hx = bx - s * XD;
        let hz = bz;
        const hl = Math.hypot(hx, hz);
        hx /= hl;
        hz /= hl;
        const tx = s * XD + RS * hx;
        const tz = RS * hz;
        swivel[i].g.rotation.y = Math.atan2(-hz, hx);
        X.set(bx - tx, by - LIFT, bz - tz);
        const L = X.length();
        X.divideScalar(L);
        Z.crossVectors(X, UP).normalize();
        Y.crossVectors(Z, X);
        m4.makeBasis(X, Y, Z);
        swivel[i].spin.rotation.z = -(L - HALF) / RS;
        const vC = (L - CPL) / L;
        const Lp = L * keep;
        const bendZ = -s * whipZ * L;
        const phase = 0.2 + 1.5 * parted;
        leg.end.quaternion.setFromRotationMatrix(m4);
        leg.end.position.set(tx, LIFT, tz);
        leg.end.scale.set(vC * Lp, 1, 1);
        leg.pend.quaternion.copy(leg.end.quaternion);
        leg.pend.position.set(tx + X.x * vC * Lp, LIFT + X.y * vC * Lp, tz + X.z * vC * Lp);
        leg.pend.scale.set((1 - vC) * Lp, 1, 1);
        const uEnd = leg.U[0];
        const uPend = leg.U[1];
        const uWrap = leg.U[2];
        uEnd.uV.value.set(0, vC);
        uPend.uV.value.set(vC, 1 - vC);
        uEnd.uBend.value.set(whipY, bendZ, WHIP, phase);
        uPend.uBend.value.set(whipY, bendZ, WHIP, phase);
        uEnd.uSa.value = L;
        uEnd.uSb.value = -(L - CPL);
        uPend.uSa.value = CPL;
        uPend.uSb.value = -CPL;
        uWrap.uSa.value = L;
        uEnd.uWa.value = WAY.deck;
        uEnd.uWb.value = -WAY.deck * vC;
        uPend.uWa.value = WAY.deck * (1 - vC);
        uPend.uWb.value = -WAY.deck * (1 - vC);
        uPend.uTip.value = tip;
        // the coupling, and the broken end, where the whip has taken them
        for (let k = 0; k < 2; k++) {
          const v = k ? 1 : vC;
          const obj = k ? leg.fray : leg.socket;
          const oy = whipY * v * v * v;
          const oz = bendZ * v * v * Math.sin(Math.PI * (WHIP * v + phase));
          obj.position.set(tx + X.x * v * Lp + Y.x * oy + Z.x * oz, LIFT + X.y * v * Lp + Y.y * oy + Z.y * oz, tz + X.z * v * Lp + Y.z * oy + Z.z * oz);
          obj.quaternion.copy(leg.end.quaternion);
        }
        leg.ferrule.position.copy(leg.socket.position);
        leg.ferrule.quaternion.copy(leg.socket.quaternion);
        leg.fray.visible = parted > 0.004;
        // the wave's head on this side
        const head = heads[i];
        let shown = waveOn;
        if (wave < WAY.deck) {
          const u = wave / WAY.deck;
          head.position.set(bx + (tx - bx) * u, by + (LIFT - by) * u + lift * ramp(1 - u, 0, 0.02), bz + (tz - bz) * u);
        } else if (wave < WAY.under) {
          head.position.set(s * XD, LIFT - RS, 0);
          shown *= 0.5;
        } else if (wave < WAY.cross) {
          along(reeved[i], wave, -D);
          head.position.copy(at);
        } else {
          const u = ramp(wave, WAY.cross, WAY.ram);
          head.position.set(ROD_END - D + (HEAD.x1 - ROD_END) * u, YE, 0);
          shown *= 0.5;
        }
        shine(head, 0.7 * shown, 30, 15);
      }
      A.coupling.position.copy(legs[0].socket.position);
      fraying.visible = parted > 0.004;
      if (fraying.visible) frayMat.emissive.copy(SIGNAL).multiplyScalar(1.6 * tip);
      // the break: a ball of light that swells and dies small, where the wire let go
      const flash = smooth(ramp(parted, 0, 0.07)) * (1 - 0.8 * smooth(ramp(parted, 0.15, 1)));
      breakBall.position.set(bx, by + 16, bz + 30);
      shine(breakBall, 1.15 * flash, 80 + 170 * (1 - ramp(parted, 0.05, 0.8)), 30 * flash);
      breakLight.position.set(bx, by + 160, bz);
      breakLight.intensity = 6e4 * flash;

      // ── the rope's light: under load, named, and the wave running down it
      for (let i = 0; i < 2; i++) {
        const uEnd = legs[i].U[0];
        const uPend = legs[i].U[1];
        const uWrap = legs[i].U[2];
        const uReeve = reeved[i].U;
        uPend.uLight.value.copy(VEILLE).multiplyScalar(0.55 * tense * taut + 0.12 * litBrin);
        uEnd.uLight.value.copy(VEILLE).multiplyScalar(0.55 * tense * taut + 0.1 * litCable);
        uWrap.uLight.value.copy(uEnd.uLight.value);
        uReeve.uLight.value.copy(VEILLE).multiplyScalar(0.2 * tense * taut + 0.1 * litCable);
        uPend.uLit.value = litBrin;
        uEnd.uLit.value = uWrap.uLit.value = uReeve.uLit.value = litCable;
        uEnd.uHead.value = uPend.uHead.value = uWrap.uHead.value = uReeve.uHead.value = wave;
        uEnd.uWave.value = uPend.uWave.value = uWrap.uWave.value = uReeve.uWave.value = waveOn;
        // …and the tackle: the crosshead's sheaves come with the ram, the lay runs toward the deck
        uReeve.uShift.value = -D;
        uReeve.uSa.value = reeved[i].length - 4 * D;
        uReeve.uSb.value = -1;
        uReeve.uSlide.value = -D;
      }
      for (let i = 0; i < TURNS.length; i++) TURNS[i][0].rotation.z = (TURNS[i][1] * D) / R;
      leadSpin[0].rotation.z = (-4 * D) / RL;
      leadSpin[1].rotation.z = (4 * D) / RL;

      // ── the hydraulics: the ram goes in, the oil goes through, the vessel's piston gives way
      const face = VES.x1 - 12 - VES.travel * stroke; // the free piston's face
      freeG.position.x = -VES.travel * stroke;
      const inCyl = HEAD.x0 - D - (C.x0 + 8);
      cylOil.scale.set(inCyl, C.bore - 0.6, C.bore - 0.6);
      cylOil.material.uniforms.uXa.value = C.x0 + 8;
      cylOil.material.uniforms.uXs.value = inCyl;
      const inVes = VES.x1 - 2 - face;
      vesOil.position.x = face;
      vesOil.scale.set(inVes, VES.bore - 0.6, VES.bore - 0.6);
      vesOil.material.uniforms.uXa.value = face;
      vesOil.material.uniforms.uXs.value = inVes;
      const reach = Math.min(170, XT - 8 - face - 5);
      jet.scale.set(reach, 15 + 0.26 * reach, 15 + 0.26 * reach);
      jetMat.uniforms.uXa.value = XT - 8;
      jetMat.uniforms.uXs.value = reach;
      core.material.uniforms.uXa.value = XT + 12;
      core.material.uniforms.uXs.value = 24;
      OIL.uTime.value = time;
      OIL.uFlow.value = flow;
      OIL.uReach.value = heat * 640 - 50;
      OIL.uAmount.value = xray;
      JET.uAmount.value = 1.3 * flow * xray;
      jet.visible = core.visible = flow * xray > 0.004 && reach > 4;
      cylOil.visible = passOil.visible = vesOil.visible = xray > 0.004;
      jetBall.material.uniforms.uHue.value.copy(VEILLE).lerp(SIGNAL, smooth(ramp(heat, 0.05, 0.2)));
      shine(jetBall, 0.55 * flow * xray, 50, 14 * flow);

      // ── the X-ray
      for (let i = 0; i < SHELLS.length; i++) {
        const s = SHELLS[i];
        // (in the ship these shells are drawn after the deck's lid, which cannot darken them: they follow `under` themselves)
        setPartOpacity(s.part, (1 - xray) * (P.bench ? 1 : clamp01(P.under ?? 1)));
        s.ghost.visible = xray > 0.004;
        s.glassMat.uniforms.uAmount.value = xray;
        s.lines.material.opacity = 0.36 * xray;
      }

      // ── the setting: the wheel turns, the needle follows; right, its mark stands on the index
      dialSpin.rotation.z = -(setting - 0.5) * DIAL.turn;
      needleG.position.x = -(setting - 0.5) * NEEDLE;
      const right = (1 - smooth(ramp(Math.abs(setting - 0.5), 0.01, 0.07))) * (1 - wrong);
      dialMat.mark.color.copy(VEILLE).lerp(SIGNAL, wrong).multiplyScalar(1 + 0.9 * Math.max(right, wrong));
      dialMat.index.color.copy(INK).lerp(VEILLE, right).lerp(SIGNAL, wrong).multiplyScalar(0.85 + 0.8 * Math.max(right, wrong));

      // ── opened (the bench): the pendant lifts; the row comes out toward the eye — along the axles first — and opens
      const out = settle(ramp(e, 0.05, 0.4));
      const over = settle(ramp(e, 0.34, 0.8));
      const apart = settle(ramp(e, 0.56, 1));
      rowG.position.set(OPEN.row[0] * over, OPEN.row[1] * over, OPEN.row[2] * (0.4 * out + 0.6 * over));
      fG.position.x = OPEN.fixed * apart;
      vesselG.position.x = OPEN.vessel * apart;
      valveG.position.x = OPEN.valve * apart;
      cylG.position.x = OPEN.cyl * apart;
      ramG.position.x = -D + OPEN.ram * apart;
      mG.position.x = -D + OPEN.cross * apart;
      setPartOpacity(rails, whole);
      feet.visible = bench && whole > 0.004;
      if (feet.visible) setPartOpacity(feet, whole);
      benchG.visible = bench;
      // in the ship, nothing of the brake shows through a deck that is shut (`under` 0): the deck's lid cannot darken
      // what is drawn after it (every part that can fade is)
      rowG.visible = frameG.visible = !!bench || (P.under ?? 1) > 0.02;
      hookG.position.set(bx, by, bz);
      hookG.visible = bench && held > 0.004;
      if (hookG.visible) setPartOpacity(hook, held);

      // ── the part the voice names; the valve's fault; the heat that shows through steel
      const litValve = clamp01(P.litValve ?? 0);
      const litCyl = clamp01(P.litCyl ?? 0);
      const warm = heat * (1 - xray);
      const arrive = 0.5 * waveOn * smooth(ramp(wave, WAY.cross - 0.02, WAY.ram));
      light(lamps.brin, litBrin);
      light(lamps.cable, litCable);
      light(lamps.sheaves, clamp01(P.litSheaves ?? 0));
      light(lamps.ram, clamp01(P.litRam ?? 0), 0, arrive);
      light(lamps.cyl, litCyl);
      light(lamps.valve, litValve, Math.max(wrong, 0.5 * warm), 0.2 * flow * (1 - xray) * (1 - wrong));
      light(lamps.vessel, 0, 0.4 * warm);
      cylS.glassMat.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.45 * litCyl);
      valveS.glassMat.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.45 * litValve).lerp(tmp.copy(SIGNAL), 0.6 * wrong);
    },
  };
}
