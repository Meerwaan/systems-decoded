// DOSSIER 017 — IRM : the system. An MRI scanner as ONE coaxial object, and the box with its two buttons.
// Its root's origin is the room's: the floor under the middle of the magnet (plan.js). The tunnel runs along z,
// the table comes out of it toward +z. From the tunnel outward:
//   · the covers — a drum in two halves that part at the middle, a paler fascia dished into a funnel at each end,
//     two control pads and a ring of light round the mouth, a plinth; on top, the collar the turret comes through
//   · the tunnel's tube, and the bridge the table slides on
//   · the gradient coils: a dark sleeve, its windings drawn on it (four saddles round the axis, twice, and hoops
//     at both ends). They are what knocks
//   · the helium vessel, an annular tank on two cradles, and in it THE MAGNET: six rings of wound wire on a former
//     and two shield rings (their current runs the other way), bathed in liquid helium
//   · the turret on top, its cold head, and the quench pipe that goes up through the roof
// Three values of grey: plinth, sleeve and cradles dark · covers, vessel, tube in between · the rings clear.
// Light: VEILLE is the system alive (the helium, the magnet stop, the part the voice names) · SIGNAL the threat
// (the field's lines, the wire that warms) · INK the machine's own lights, the current's quiet round, the cold gas.
// Liberties taken to be read in one frame (docs/journal/017-model.md): eight rings where a real magnet has about
// as many but finer, a vessel shown without its vacuum jacket and shields, a field drawn as fifteen closed lines, a gradient sleeve that sticks out of the magnet (so that it shows at the mouths).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, edgesOf, makePart, addMesh, setPartOpacity, anchor, box, cyl, lathe, plate, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { MAGNET, PIPE, BOX, TESLA } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const WHITE = new THREE.Color(1, 1, 1);
const HOT = new THREE.Color(1, 0.86, 0.62);
const PALE = VEILLE.clone().lerp(WHITE, 0.5); //  helium that boils
const FROST = INK.clone().lerp(WHITE, 0.45); //   the cold gas
const TINT = new THREE.Color(0.5, 1, 0.78); //    what veille light does to a grey
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);
const glsl3 = (c) => `vec3(${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)})`;
const f1 = (x) => x.toFixed(1);

/* ─────────────────────────────────────────────────────────── where everything is */
// Everything coaxial is written in the magnet's own frame: its centre, the tunnel along z, y up.

const [MX, MY, MZ] = MAGNET.at;
const HALF = MAGNET.half; //                the covers, from the middle to a face
const RO = MAGNET.r; //                     their radius
const RB = MAGNET.bore; //                  the tunnel's
const FLOOR = -MY; //                       the floor, seen from the magnet's centre
const TUBE = { r1: 36.5, half: 76 };
const GRAD = { r0: 39, r1: 50, half: 72 };
const VES = { r0: 54, r1: 100, half: 60 };
const HE = { r0: 56.5, r1: 98.4, half: 57.8, full: 88, empty: -99.5 }; // the bath, and its level (y) full and empty
const FORMER = 60; //                       the radius the main rings are wound on
/** The magnet's rings: [z, width, inner radius, outer radius, the way its current turns]. */
const RINGS = [
  ...[-1, 1].flatMap((s) => [[s * 8.5, 11, FORMER, 66, 1], [s * 26.5, 12, FORMER, 68, 1], [s * 46, 16, FORMER, 73, 1]]),
  ...[-1, 1].map((s) => [s * 42, 15, 86, 92.5, -1]), // the shield rings
];
/** Where the wire first warms: a ring (its z), a place round it (degrees from +x, toward +y). */
const QUENCH = { z: 26.5, at: 125, r: 68 };
const TUR = { x: PIPE.from[0], z: PIPE.from[2] - 6, top: 129.5 };
const PX = PIPE.from[0];
const PZ = PIPE.from[2];
const PTOP = PIPE.top - MY; //              the pipe's mouth
const PSPLIT = 165; //                      above this the pipe melts into the dark on the bench (2.7 m from the floor, gone at 3.3 m)
const SPIN = 0.2; //                        turns a second: one head of light a ring, a 150th of its period a frame
const TREMOR = 30; //                       Hz: one beat a frame — a steady blur, never a jump

// The exploded view (the bench, a camera filming toward az −40): the covers part along the axis and go up, one to
// each side; the tube and the sleeve come out by the back, along the axis, and line up across the camera to the left
// of the vessel, the tube still in the sleeve's mouth; the turret and its pipe lift; the table backs away; the box stays
// on its post, to the right. Nothing hangs between the key light (−x, +y, +z) and a piece of the row.
const AZ = 40 * DEG;
const slot = (right, up, away) => [right * Math.cos(AZ) + away * Math.sin(AZ), up, right * Math.sin(AZ) - away * Math.cos(AZ)];
const SLEEVE = slot(-235, 0, -60);
const OPEN = {
  front: { out: 130, at: slot(190, 170, 40) },
  rear: { out: -160, at: slot(-190, 130, 200) },
  grad: { out: -225, at: SLEEVE },
  bore: { out: -140, at: [SLEEVE[0], 0, SLEEVE[2] + 85] }, // on the sleeve's own axis, 85 cm out of its mouth
  turret: 45,
  table: [170, -50],
};

/* ─────────────────────────────────────────────────────────── geometry */

const lyingZ = (g) => g.rotateX(Math.PI / 2); // a lathe's axis (y) laid along +z
const lyingX = (g) => g.rotateZ(-Math.PI / 2); // …along +x
/** A lathe written [radius, z] round the tunnel's axis. Profiles run anticlockwise in (radius, z): it then faces outward. */
const turnZ = (profile, segments = 96, o = { bevel: 0.5, round: 2 }) => lyingZ(lathe(profile, segments, o));
const turnY = (profile, segments = 48, o = { bevel: 0.5, round: 2 }) => lathe(profile, segments, o);
const ringOf = (r0, r1, a, b) => [[r0, a], [r1, a], [r1, b], [r0, b], [r0, a]];
const arc = (cx, cy, r, from, to, n = 10) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = (from + ((to - from) * i) / n) * DEG;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const fill = (geo, name, value) => geo.setAttribute(name, new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count).fill(value), 1));

/**
 * A line as a tube whose flesh the shader gives it: every vertex stands ON the line and carries the way out (its
 * normal), `aRad` its radius, `aU` 0–1 along the line, `aGain`. The frame is carried from one point to the next.
 */
function pathTube(points, radius, { radial = 8, gain = 1 } = {}) {
  const n = points.length;
  const ring = radial + 1;
  const pos = [];
  const nor = [];
  const rad = [];
  const along = [];
  const gains = [];
  const index = [];
  const T = V();
  const T0 = V();
  const N = V();
  const Bn = V();
  const axis = V();
  const d = V();
  const q = new THREE.Quaternion();
  const run = [0];
  for (let i = 1; i < n; i++) run.push(run[i - 1] + points[i].distanceTo(points[i - 1]));
  for (let i = 0; i < n; i++) {
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
      pos.push(p.x, p.y, p.z);
      nor.push(d.x, d.y, d.z);
      rad.push(radius);
      along.push(run[i] / run[n - 1]);
      gains.push(gain);
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
  geo.setAttribute("aRad", new THREE.Float32BufferAttribute(rad, 1));
  geo.setAttribute("aU", new THREE.Float32BufferAttribute(along, 1));
  geo.setAttribute("aGain", new THREE.Float32BufferAttribute(gains, 1));
  geo.setIndex(index);
  return geo;
}

/** `count` squares that always face the eye: the shader stands each where its seed (four numbers, 0–1) says. */
function sprites(count, seed) {
  const rand = rng(seed);
  const corner = [];
  const seeds = [];
  const index = [];
  for (let i = 0; i < count; i++) {
    const s = [(i + rand()) / count, rand(), rand(), rand()]; // the first one spread evenly: it is a phase
    for (const c of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      corner.push(...c);
      seeds.push(...s);
    }
    index.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(count * 12), 3));
  geo.setAttribute("aCorner", new THREE.Float32BufferAttribute(corner, 2));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 4));
  geo.setIndex(index);
  return geo;
}

/** The field's lines: closed loops in planes through the axis — straight through the tunnel, out by a mouth, round the machine and back in by the other. */
const FIELD = {
  planes: [20, 50, 80, 110, 200], // degrees round the axis. None near the horizontal: the film's cameras stand on the −x side, they would see those planes edge-on — a skewer through the machine
  // [how far from the axis it runs in the tunnel, how far out it goes, how far along z, how square it is, how bright]
  loops: [[24, 150, 135, 3, 1], [13, 240, 215, 2.6, 0.78], [4, 340, 290, 2.3, 0.58]],
};
function fieldLines() {
  const geos = [];
  for (const deg of FIELD.planes) {
    const c = Math.cos(deg * DEG);
    const s = Math.sin(deg * DEG);
    for (const [rIn, rOut, a, squareness, gain] of FIELD.loops) {
      const rc = (rIn + rOut) / 2;
      const b = (rOut - rIn) / 2;
      const k = 2 / squareness;
      const pts = Array.from({ length: 121 }, (_, i) => {
        const t = Math.PI / 2 + (i / 120) * Math.PI * 2; // it starts and ends far out, where it is faintest
        const cs = Math.cos(t);
        const sn = Math.sin(t);
        const rho = rc + b * Math.sign(sn) * Math.abs(sn) ** k;
        return V(rho * c, rho * s, a * Math.sign(cs) * Math.abs(cs) ** k);
      });
      geos.push(pathTube(pts, 6, { gain }));
    }
  }
  return mergeGeometries(geos);
}

/* ─────────────────────────────────────────────────────────── matter that is drawn */

/**
 * A lit solid of the house whose colour and light also depend on where the fragment stands in the part's own frame
 * (`oP`, `oN`). `key`: a name of its own — two materials sharing this function must not share a program.
 */
function patterned(mat, key, uniforms, { decl, colour, light, attr = "", pass = "" }) {
  mat.userData.U = uniforms;
  mat.customProgramCacheKey = () => key;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 oP; varying vec3 oN; ${attr}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\noP = position; oN = normal; ${pass}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 oP; varying vec3 oN; ${decl}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n{ ${colour} }`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n{ ${light} }`);
  };
  return mat;
}

/** The gradient coils' windings, drawn on the sleeve's skin: under the pixel they melt into their mean. */
const WINDINGS = {
  decl: /* glsl */ `uniform float uKnock, uNamed; float gWind; float gEnd;`,
  colour: /* glsl */ `
    float rr = length(oP.xy);
    float skin = smoothstep(${f1(GRAD.r1 - 1.6)}, ${f1(GRAD.r1 - 0.7)}, rr);
    float th = atan(oP.y, oP.x);
    float a = (fract(th / 1.5708 + 0.5) - 0.5) * 1.5708; // four saddles round the axis
    vec2 q = abs(vec2(a * ${(GRAD.r1 / 31).toFixed(3)}, (abs(oP.z) - 33.0) / 25.0)); // …twice along it
    float f = pow(max(q.x * q.x * q.x + q.y * q.y * q.y, 1e-5), 0.3333);
    float ph = f * 5.0;
    float w = clamp(fwidth(ph) * 1.3, 0.004, 0.5);
    float fr = fract(ph);
    float turn = smoothstep(0.0, w, fr) * (1.0 - smoothstep(0.45, 0.45 + w, fr));
    turn = mix(turn, 0.45, smoothstep(0.15, 0.45, w)) * step(0.5, ph) * (1.0 - smoothstep(1.0, 1.03, f));
    float hz = (abs(oP.z) - 60.6) / 2.3; // the hoops of the z coil, at both ends
    float wz = clamp(fwidth(hz) * 1.3, 0.004, 0.5);
    float fz = fract(hz);
    float hoop = smoothstep(0.0, wz, fz) * (1.0 - smoothstep(0.5, 0.5 + wz, fz));
    hoop = mix(hoop, 0.5, smoothstep(0.15, 0.45, wz)) * step(0.0, hz);
    gWind = max(turn, hoop) * skin;
    gEnd = smoothstep(${f1(GRAD.half - 1.2)}, ${f1(GRAD.half - 0.4)}, abs(oP.z)); // its two end faces: what shows of it at the mouths
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.5, 0.52, 0.54), 0.9 * gWind);`,
  light: /* glsl */ `totalEmissiveRadiance += (${glsl3(INK)} * uKnock + ${glsl3(VEILLE)} * uNamed) * (gWind + 0.45 * gEnd);`,
};

/**
 * The magnet's wire: turns laid side by side (grooves along z on a ring's back, along the radius on its flanks) and
 * `uHot`, the stretch that has stopped being superconducting — it starts at one place of one ring, runs round it both
 * ways, and reaches the next rings later (`aDelay`).
 */
const WOUND = {
  attr: /* glsl */ `attribute float aDelay; varying float oDelay;`,
  pass: /* glsl */ `oDelay = aDelay;`,
  decl: /* glsl */ `uniform float uHot; varying float oDelay; float cGlow;`,
  colour: /* glsl */ `
    float flank = smoothstep(0.55, 0.8, abs(oN.z));
    float ph = mix(oP.z, length(oP.xy), flank) / 1.15;
    float w = clamp(fwidth(ph) * 1.4, 0.004, 0.5);
    float fr = fract(ph);
    float groove = 1.0 - smoothstep(0.0, 0.16 + w, min(fr, 1.0 - fr));
    groove = mix(groove, 0.3, smoothstep(0.15, 0.45, w));
    diffuseColor.rgb *= 1.0 - 0.3 * groove;
    float dth = abs(atan(oP.y, oP.x) - ${(QUENCH.at * DEG).toFixed(4)});
    dth = min(dth, 6.28319 - dth);
    float reach = (1.7 * uHot + 0.9 * uHot * uHot * uHot - oDelay) * 3.14159;
    float heat = clamp((reach - dth) / 0.5, 0.0, 1.0) * step(0.0005, uHot);
    cGlow = heat * (0.5 + 0.6 * exp(-1.2 * dth - 2.5 * oDelay));
    diffuseColor.rgb *= mix(vec3(1.0), vec3(1.0, 0.42, 0.28), 0.9 * heat);`,
  light: /* glsl */ `totalEmissiveRadiance += ${glsl3(SIGNAL)} * (0.6 * cGlow);`,
};

/** A lit solid that melts into the dark with height (`uFade` 0–1): the pipe, on the bench, before it reaches the header. */
function fading(color, from, to) {
  const mat = solid(color, { rough: 0.45, metal: 0.4 });
  mat.transparent = mat.userData.transparent = true;
  const U = { uFade: { value: 0 } };
  mat.userData.U = U;
  mat.customProgramCacheKey = () => "fading";
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying float pY;").replace("#include <begin_vertex>", "#include <begin_vertex>\npY = position.y;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uFade; varying float pY;")
      .replace("#include <color_fragment>", `#include <color_fragment>\ndiffuseColor.a *= 1.0 - uFade * smoothstep(${f1(from)}, ${f1(to)}, pY);`);
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
const SEEN = /* glsl */ `
  varying vec3 vN; varying vec3 vE; varying vec3 vP;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vE = normalize(-mv.xyz);
    vP = position;
    gl_Position = projectionMatrix * mv;
  }`;
const lightMaterial = (uniforms, vertexShader, fragmentShader, o = {}) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms, vertexShader, fragmentShader, ...o });
const lightMesh = (geometry, material, order = 4) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
};

/**
 * The liquid helium, as a volume of light that stops at its level (`uLevel`, cm above the magnet's axis): brighter
 * where the eye goes through more of it, darker with depth, a clear skin under its surface. `uBoil`: the surface
 * heaves, the bath pales, a mist stands above it.
 */
const heliumMaterial = (U) =>
  lightMaterial(
    U,
    SEEN,
    /* glsl */ `
    uniform float uAmount, uLevel, uBoil, uTime, uNamed; varying vec3 vN; varying vec3 vE; varying vec3 vP;
    void main() {
      float facing = clamp(abs(dot(normalize(vN), normalize(vE))), 0.0, 1.0);
      float lvl = uLevel + uBoil * (0.9 * sin(vP.x * 0.19 + uTime * 4.6) + 0.7 * sin(vP.z * 0.23 - uTime * 3.9));
      float w = max(fwidth(vP.y) * 1.2, 0.05);
      float below = 1.0 - smoothstep(lvl - w, lvl + w, vP.y);
      float deep = clamp((lvl - vP.y) / 190.0, 0.0, 1.0);
      float skin = exp(-max(lvl - vP.y, 0.0) / 2.6);
      float body = (0.26 + 0.74 * pow(facing, 1.3)) * mix(1.0, 0.5, deep);
      vec3 col = mix(${glsl3(VEILLE)}, ${glsl3(PALE)}, 0.3 * uBoil);
      float light = (0.95 * body + 0.55 * skin) * below * (1.0 + 0.5 * uNamed);
      float mist = (1.0 - below) * uBoil * 0.07 * pow(facing, 1.3);
      gl_FragColor = vec4((col * light + ${glsl3(FROST)} * mist) * uAmount, 1.0);
    }`,
  );
/** Its surface: a sheet across the vessel, kept between the two walls of the annular tank at that height. */
const surfaceMaterial = (U) =>
  lightMaterial(
    U,
    SEEN,
    /* glsl */ `
    uniform float uAmount, uLevel, uBoil, uTime; varying vec3 vP;
    void main() {
      float xo = sqrt(max(${f1(HE.r1 * HE.r1)} - uLevel * uLevel, 0.0));
      float xi = sqrt(max(${f1(HE.r0 * HE.r0)} - uLevel * uLevel, 0.0));
      float ax = abs(vP.x);
      float w = max(fwidth(ax) * 1.2, 0.05);
      float inside = (1.0 - smoothstep(xo - w, xo + w, ax)) * mix(1.0, smoothstep(xi - w, xi + w, ax), step(0.01, xi));
      float heave = 0.5 + 0.5 * sin(vP.x * 0.5 + uTime * 5.0) * sin(vP.z * 0.42 - uTime * 4.1);
      gl_FragColor = vec4(mix(${glsl3(VEILLE)}, ${glsl3(PALE)}, 0.4 * uBoil) * ((0.42 + 0.5 * uBoil * heave) * inside * uAmount), 1.0);
    }`,
    { side: THREE.DoubleSide },
  );
/** Bubbles: each climbs round the tunnel, from the bottom of the tank to the surface, and starts again. */
const bubbleMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    attribute vec2 aCorner; attribute vec4 aSeed; uniform float uTime, uLevel; varying vec2 vUv; varying float vAlive;
    void main() {
      float u = fract(aSeed.x + uTime * (0.15 + 0.13 * aSeed.y));
      float side = aSeed.z < 0.5 ? -1.0 : 1.0;
      float r = mix(${f1(HE.r0 + 2)}, ${f1(HE.r1 - 2)}, fract(aSeed.z * 7.31));
      float phi = -1.5708 + u * 3.1416;
      vec3 c = vec3(side * r * cos(phi), r * sin(phi), mix(${f1(-HE.half + 4)}, ${f1(HE.half - 4)}, aSeed.w) + 1.5 * sin(u * 30.0 + aSeed.w * 40.0));
      vAlive = smoothstep(0.0, 0.08, u) * (1.0 - smoothstep(uLevel - 6.0, uLevel + 0.5, c.y));
      vec4 mv = modelViewMatrix * vec4(c, 1.0);
      float size = max((1.6 + 2.8 * aSeed.y) * (0.6 + 0.8 * u), 2.2 * max(1.0, -mv.z) / (projectionMatrix[1][1] * ${H2}));
      mv.xy += aCorner * size;
      vUv = aCorner;
      gl_Position = projectionMatrix * mv;
    }`,
    /* glsl */ `
    uniform float uAmount; varying vec2 vUv; varying float vAlive;
    void main() {
      float r2 = dot(vUv, vUv);
      gl_FragColor = vec4(${glsl3(PALE)} * (exp(-r2 * 3.2) * (1.0 - smoothstep(0.6, 1.0, r2)) * 1.35 * vAlive * uAmount), 1.0);
    }`,
  );

/** The current's round: a head of light on each ring, its tail behind it, going round and round — the shield rings the other way. */
const spinMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    attribute float aDir; varying vec3 vN; varying vec3 vE; varying vec3 vP; varying float vDir;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vN = normalize(normalMatrix * normal);
      vE = normalize(-mv.xyz);
      vP = position;
      vDir = aDir;
      gl_Position = projectionMatrix * mv;
    }`,
    /* glsl */ `
    uniform float uAmount, uTime; varying vec3 vN; varying vec3 vE; varying vec3 vP; varying float vDir;
    void main() {
      float body = pow(clamp(dot(normalize(vN), normalize(vE)), 0.0, 1.0), 1.2);
      float q = fract(uTime * ${SPIN.toFixed(3)} - vDir * atan(vP.y, vP.x) / 6.28319 + 0.13 * vP.z);
      float head = min(1.0, exp(-q * 12.0) + exp(-(1.0 - q) * 120.0));
      gl_FragColor = vec4(${glsl3(INK)} * ((0.02 + 1.7 * head) * body * uAmount), 1.0);
    }`,
  );

/** The field's lines: soft tubes of light, never thinner than `uMinPx`, a slow swell running the way the field goes; they sink into the floor. */
const fieldMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    attribute float aRad; attribute float aU; attribute float aGain; uniform float uMinPx;
    varying vec3 vN; varying vec3 vE; varying float vU; varying float vGain; varying float vY;
    void main() {
      vec4 c = modelViewMatrix * vec4(position, 1.0);
      float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
      vec4 mv = modelViewMatrix * vec4(position + normal * max(aRad, uMinPx * cmPerPx), 1.0);
      vN = normalize(normalMatrix * normal);
      vE = normalize(-mv.xyz);
      vU = aU;
      vGain = aGain;
      vY = position.y;
      gl_Position = projectionMatrix * mv;
    }`,
    /* glsl */ `
    uniform float uAmount, uTime; varying vec3 vN; varying vec3 vE; varying float vU; varying float vGain; varying float vY;
    void main() {
      float facing = clamp(dot(normalize(vN), normalize(vE)), 0.0, 1.0);
      float body = 0.85 * pow(facing, 7.0) + 0.3 * pow(facing, 1.8); // a bright thread in a wide soft sheath
      float swell = 0.72 + 0.28 * sin(6.28319 * (4.0 * vU - uTime * 0.14));
      float ground = smoothstep(${f1(FLOOR)}, ${f1(FLOOR + 22)}, vY);
      gl_FragColor = vec4(${glsl3(SIGNAL)} * (body * swell * vGain * ground * uAmount), 1.0);
    }`,
  );

/** The cold in the pipe: a sheath of pale light below `uHead` (cm), a brighter head while it climbs, bars that stream up. */
const frostMaterial = (U) =>
  lightMaterial(
    U,
    SEEN,
    /* glsl */ `
    uniform float uAmount, uHead, uRush, uTime; varying vec3 vN; varying vec3 vE; varying vec3 vP;
    ${BARS}
    void main() {
      float body = pow(clamp(dot(normalize(vN), normalize(vE)), 0.0, 1.0), 1.2);
      float below = 1.0 - smoothstep(uHead - 10.0, uHead + 2.0, vP.y);
      float head = exp(-(vP.y - uHead) * (vP.y - uHead) / 140.0) * uRush;
      float stream = bars((vP.y - uTime * 120.0) / 64.0, 0.5);
      gl_FragColor = vec4(${glsl3(FROST)} * ((below * (0.24 + 0.09 * stream) + 0.9 * head) * body * uAmount), 1.0);
    }`,
  );

/** The cloud above the roof: puffs with no edge that leave the pipe's mouth, rise, swell and drift — and are born again. */
const puffMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    attribute vec2 aCorner; attribute vec4 aSeed; uniform float uTime, uGrow; varying vec2 vUv; varying float vAmount; varying vec2 vSeed;
    void main() {
      float u = fract(aSeed.x + uTime * 0.16);
      float up = (1.0 - exp(-2.4 * u)) / 0.909;
      vec3 c = vec3(${f1(PX)}, ${f1(PTOP)}, ${f1(PZ)}) + uGrow * vec3(170.0 * pow(u, 1.5) + (aSeed.y - 0.5) * 90.0 * u, 12.0 + 200.0 * up, (aSeed.z - 0.5) * 90.0 * u);
      float size = uGrow * mix(15.0, 92.0, sqrt(u)) * (0.75 + 0.5 * aSeed.w);
      vAmount = smoothstep(0.0, 0.06, u) * (1.0 - smoothstep(0.55, 1.0, u)) * mix(0.16, 0.06, sqrt(u));
      vec4 mv = modelViewMatrix * vec4(c, 1.0);
      mv.xy += aCorner * size;
      vUv = aCorner;
      vSeed = aSeed.yz * 17.0;
      gl_Position = projectionMatrix * mv;
    }`,
    /* glsl */ `
    uniform float uAmount, uTime; varying vec2 vUv; varying float vAmount; varying vec2 vSeed;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    void main() {
      float r = length(vUv);
      float fall = exp(-r * r * 2.8) * (1.0 - smoothstep(0.62, 1.0, r));
      float n = 0.6 * noise(vUv * 1.9 + vSeed + vec2(0.0, -uTime * 0.1)) + 0.4 * noise(vUv * 4.1 - vSeed);
      gl_FragColor = vec4(${glsl3(FROST)} * (fall * (0.15 + 1.5 * n * n) * vAmount * uAmount), 1.0);
    }`,
  );

/**
 * A ball of light with no edge, always facing the eye: a small hot heart, a soft body, a long tail. `uRadius` cm
 * (where the tail ends), never under `uMinPx` pixels. It stands where it is: what is in front of it hides it.
 */
function makeBall(heart, hue) {
  const mesh = lightMesh(
    new THREE.PlaneGeometry(2, 2),
    lightMaterial(
      { uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
      /* glsl */ `
      uniform float uRadius, uMinPx; varying vec2 vUv;
      void main() {
        vUv = position.xy;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        c.xy += position.xy * r;
        gl_Position = projectionMatrix * c;
      }`,
      /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        float core = exp(-r2 / 0.012);
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
        gl_FragColor = vec4((uHeart * (core * 2.4) + uHue * (body + tail)) * uAmount, 1.0);
      }`,
    ),
    8,
  );
  mesh.visible = false;
  return mesh;
}
const shine = (ball, amount, radius, minPx = 0) => {
  ball.visible = amount > 0.004;
  ball.material.uniforms.uAmount.value = amount;
  ball.material.uniforms.uRadius.value = radius;
  ball.material.uniforms.uMinPx.value = minPx;
};

/* ─────────────────────────────────────────────────────────── the system */

/**
 * → { root, A, parts, update(P, time, px) }. `root`: its origin is the floor under the middle of the magnet (world.js
 * stands it in the room, or on the bench). `A`: anchors that follow their parts, opened or not.
 * P (see FIRST in world.js):
 *   bench     1: on the bench — the box stands on a post beside the machine, and the pipe melts into the dark between
 *             2.7 and 3.3 m (it comes back whole as soon as `plume` moves)
 *   tesla     the field: only the brightness of its lines (× seen / 1.5)
 *   seen      the field's lines, signal: through the tunnel, out by both mouths, round the machine, up to 3.5 m
 *   spin      the current's round in the rings (ink): seen once the vessel is glass
 *   power     the machine's own lights: the two pads' screens, the ring of light round the mouth, the tunnel's lamp
 *   knock     the gradient sleeve trembles (30 Hz on a slow swell) and its windings light up, ink
 *   cover     1 → 0: the two halves of the covers slide apart along the axis and fade (table, tube and works stay)
 *   xray      covers and vessel turn to glass: the helium, the rings
 *   explode   0 → 1 (the bench): see OPEN. From 0.45 the vessel turns to glass by itself: the magnet must show
 *   helium    the bath's level, 1 full → 0 empty      boil  it heaves, pales, bubbles climb round the tunnel
 *   hot       a signal stretch of wire that starts on one ring and wins the others
 *   plume     0 → 0.3 a head of cold climbs the pipe · 0.28 → 1 the cloud at its mouth grows and drifts toward +x
 *   estop     the emergency stop goes in        flap  the magnet stop's cover lifts        mstop  the magnet stop goes in
 *   litBore, litGradients, litMagnet, litHelium, litPipe, litButtons   0–1: the part the voice is naming glows faintly veille
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
  const mag = grp(); // the magnet's own frame
  mag.position.set(MX, MY, MZ);

  const shellGlass = () => glass(BRAND.ink, { base: 0.01, rim: 0.28, power: 2.6, edge: 0.42, spec: 0.5, through: 0.25 });
  /** A skin of the machine: its solid pieces — and the same, as one glass, for the X-ray. */
  const shellOf = (parent, name, pieces) => {
    const part = partIn(parent, name);
    for (const { geo, mat, edgeOpacity = 0.5 } of pieces) addMesh(part, geo, mat, { edgeOpacity });
    const shape = pieces.length > 1 ? mergeGeometries(pieces.map((p) => p.geo)) : pieces[0].geo;
    const glassMat = shellGlass();
    const ghost = new THREE.Mesh(shape, glassMat);
    const lines = edgesOf(shape, { color: BRAND.ink, width: 2, opacity: 0.4 });
    ghost.add(lines);
    ghost.visible = false;
    parent.add(ghost);
    return { part, ghost, glassMat, lines };
  };
  const see = (shell, amount) => {
    shell.ghost.visible = amount > 0.004;
    shell.glassMat.uniforms.uAmount.value = amount;
    shell.lines.material.opacity = 0.4 * amount;
  };

  /* ══ THE COVERS: two halves of a drum, a fascia dished into a funnel at each end, a plinth ══ */
  const frontG = grp(mag);
  const rearG = grp(mag);
  const SH = 15; // the shoulder's round
  const shoulder = arc(RO - SH, HALF - 20, SH, 0, 78, 8);
  const dish = [[96.4, 81.2], [80, 87], [62, 88], [56.5, 86.7], [50, 84.4], [44.5, 81.5], [40, 78.5], [36.6, 76], [34.8, 74.6], [RB, 73]];
  const back = (profile) => profile.map(([r, z]) => [r, -z]).reverse();
  const coverMat = () => ({
    drum: solid(0x8d949b, { rough: 0.62, coat: 0.12, coatRough: 0.5, double: true }),
    fascia: solid(0xb3babf, { rough: 0.45, coat: 0.4, coatRough: 0.35, double: true }),
    plinth: solid(0x363c42, { rough: 0.8, metal: 0.1 }),
  });
  const mF = coverMat();
  const front = shellOf(frontG, "front", [
    { geo: turnZ([[RO, 0], ...shoulder], 96, { bevel: 0.3, round: 1 }), mat: mF.drum, edgeOpacity: 0.45 },
    { geo: turnZ(ringOf(RO - 3.5, RO + 0.7, 0, 2.4), 96, { bevel: 0.4, round: 1 }), mat: mF.drum, edgeOpacity: 0.4 },
    { geo: turnZ(dish, 96, { bevel: 0.3, round: 1 }), mat: mF.fascia, edgeOpacity: 0.5 },
    { geo: box(168, 34, HALF - 2, 3).translate(0, FLOOR + 17, HALF / 2), mat: mF.plinth, edgeOpacity: 0.35 },
  ]);
  const mR = coverMat();
  const rear = shellOf(rearG, "rear", [
    { geo: turnZ([...back(shoulder), [RO, 0]], 96, { bevel: 0.3, round: 1 }), mat: mR.drum, edgeOpacity: 0.45 },
    { geo: turnZ(ringOf(RO - 3.5, RO + 0.7, -2.4, 0), 96, { bevel: 0.4, round: 1 }), mat: mR.drum, edgeOpacity: 0.4 },
    { geo: turnZ(back(dish), 96, { bevel: 0.3, round: 1 }), mat: mR.fascia, edgeOpacity: 0.5 },
    { geo: box(168, 34, HALF - 2, 3).translate(0, FLOOR + 17, -HALF / 2), mat: mR.plinth, edgeOpacity: 0.35 },
    // the collar the turret comes through
    { geo: turnY([[26, 99], [30.5, 99], [30.5, 116], [28.5, 118.5], [26, 118.5], [26, 99]], 48).translate(TUR.x, 0, TUR.z), mat: mR.drum, edgeOpacity: 0.45 },
  ]);
  asShell([front.ghost, rear.ghost], 20);
  // the two pads, left and right of the mouth
  const PAD = { x: 74, y: 13, z: 88.4, turn: 0.2 };
  {
    const body = solid(0x30363b, { rough: 0.6, coat: 0.3 });
    for (const s of [-1, 1]) addMesh(front.part, box(13, 21, 4.4, 1.3), body, { pos: [s * PAD.x, PAD.y, PAD.z], rot: [0, s * PAD.turn, 0], edgeOpacity: 0.5 });
  }
  // …and the machine's own lights: their screens, their keys, the ring of light round the mouth, the lamp in the tunnel
  const lights = partIn(frontG, "lights");
  const lampMat = { screen: glow(BRAND.ink, 1.2), keys: glow(BRAND.ink, 0.7), ring: glow(BRAND.ink, 1.5) };
  for (const s of [-1, 1]) {
    const on = (x, y, z) => V(x, y, z).applyEuler(new THREE.Euler(0, s * PAD.turn, 0)).add(V(s * PAD.x, PAD.y, PAD.z)).toArray();
    addMesh(lights, box(9.6, 7.2, 0.5, 0.2, 2), lampMat.screen, { pos: on(0, 4.6, 2.2), rot: [0, s * PAD.turn, 0], edges: false });
    addMesh(lights, mergeGeometries([-3.2, 0, 3.2].map((x) => box(2, 2, 0.5, 0.2, 2).translate(x, -3.6, 2.2))), lampMat.keys, { pos: on(0, 0, 0), rot: [0, s * PAD.turn, 0], edges: false });
  }
  addMesh(lights, new THREE.TorusGeometry(53, 0.85, 8, 96).translate(0, 0, 85.7), lampMat.ring, { edges: false });
  const boreLamp = new THREE.PointLight(BRAND.ink, 0, 150, 2);
  boreLamp.position.set(0, 20, 18);
  frontG.add(boreLamp);

  /* ══ THE TABLE: a plinth, a column, a frame, the cradle that slides into the tunnel ══ */
  const tableG = grp();
  const table = partIn(tableG, "table");
  {
    const T = MAGNET.table;
    addMesh(table, box(46, 7, 150, 2).translate(0, 3.5, 195), solid(0x2c3136, { rough: 0.85 }), { edgeOpacity: 0.35 });
    addMesh(table, box(32, 58, 84, 4).translate(0, 36, 195), solid(0x4a5158, { rough: 0.6, coat: 0.25 }), { edgeOpacity: 0.4 });
    addMesh(table, box(T.w, 11, T.to - 92, 2.5).translate(0, 70.5, (T.to + 92) / 2), solid(0x7d858c, { rough: 0.85, env: 0.6 }), { edgeOpacity: 0.45 });
    addMesh(table, box(42, 6, T.to - 8 - 78, 2.2).translate(0, 79, (78 + T.to - 8) / 2), solid(0xa9b0b6, { rough: 0.92, env: 0.5 }), { edgeOpacity: 0.5 });
    addMesh(table, box(34, 1.8, 152, 0.8).translate(0, 82.7, 192), solid(0x24282c, { rough: 0.9 }), { edgeOpacity: 0.3 });
  }

  /* ══ THE TUNNEL'S TUBE, and the bridge the cradle slides on ══ */
  const boreG = grp(mag);
  const bore = partIn(boreG, "bore");
  addMesh(bore, turnZ(ringOf(RB, TUBE.r1, -TUBE.half, TUBE.half), 96, { bevel: 0.5, round: 1 }), solid(0xbcc2c7, { rough: 0.6, coat: 0.15 }), { edgeOpacity: 0.5 });
  addMesh(bore, box(22, 1.5, TUBE.half * 2 - 4, 0.5).translate(0, -32.6, 0), solid(0x7d858c, { rough: 0.6 }), { edgeOpacity: 0.4 });

  /* ══ THE GRADIENT COILS: a sleeve, its windings drawn on it ══ */
  const gradG = grp(mag);
  const grad = partIn(gradG, "gradients");
  const GU = { uKnock: { value: 0 }, uNamed: { value: 0 } };
  addMesh(grad, turnZ(ringOf(GRAD.r0, GRAD.r1, -GRAD.half, GRAD.half), 96, { bevel: 0.8, round: 2 }), patterned(solid(0x474e55, { rough: 0.72, metal: 0.15 }), "windings", GU, WINDINGS), { edgeOpacity: 0.5 });

  /* ══ THE VESSEL: an annular tank on two cradles ══ */
  const vesselG = grp(mag);
  const VZ = VES.half;
  const R1 = VES.r1;
  const vessel = shellOf(vesselG, "vessel", [
    {
      geo: turnZ([[VES.r0, -VZ], [90, -VZ], [97, -VZ + 3], [R1, -VZ + 10], [R1, -24], [R1 + 1.5, -24], [R1 + 1.5, -18], [R1, -18], [R1, 18], [R1 + 1.5, 18], [R1 + 1.5, 24], [R1, 24], [R1, VZ - 10], [97, VZ - 3], [90, VZ], [VES.r0, VZ], [VES.r0, -VZ]], 96, { bevel: 0.6, round: 1 }),
      mat: solid(0x767e85, { rough: 0.45, metal: 0.45 }),
      edgeOpacity: 0.5,
    },
  ]);
  asShell(vessel.ghost, 10);
  const feet = partIn(vesselG, "cradles");
  {
    const saddle = [[-80, FLOOR], [80, FLOOR], [80, FLOOR + 10], [78, FLOOR + 16], ...arc(0, 0, R1 + 0.6, -40, -140, 16), [-78, FLOOR + 16], [-80, FLOOR + 10]];
    addMesh(feet, mergeGeometries([-38, 38].map((z) => plate(saddle, 10, { bevel: 1 }).translate(0, 0, z - 5))), solid(0x2f353a, { rough: 0.85, metal: 0.15 }), { edgeOpacity: 0.35 });
  }

  /* ══ THE MAGNET: rings of wound wire on a former, two shield rings on their struts ══ */
  const former = partIn(vesselG, "former");
  {
    const m = solid(0x596067, { rough: 0.6, metal: 0.3 });
    addMesh(former, turnZ(ringOf(FORMER - 2, FORMER, -56, 56), 96, { bevel: 0.4, round: 1 }), m, { edgeOpacity: 0.4 });
    const strut = box(3, 26, 3, 0.5, 2).translate(0, 73, 0);
    addMesh(former, mergeGeometries([-35.25, 35.25].flatMap((z) => Array.from({ length: 8 }, (_, i) => strut.clone().rotateZ(((i + 0.5) / 8) * Math.PI * 2).translate(0, 0, z)))), m, { edgeOpacity: 0.3 });
  }
  const coils = partIn(vesselG, "coils");
  const CU = { uHot: { value: 0 } };
  const coilMat = patterned(solid(0xe4e7e9, { rough: 0.4, metal: 0.3, env: 1.2 }), "wound", CU, WOUND);
  const delayOf = ([z, , r0]) => Math.abs(z - QUENCH.z) / 70 + (r0 > FORMER ? 0.4 : 0);
  addMesh(
    coils,
    mergeGeometries(
      RINGS.map((ring) => {
        const [z, w, r0, r1] = ring;
        const geo = turnZ(ringOf(r0, r1, z - w / 2, z + w / 2), 96, { bevel: 0.7, round: 2 });
        fill(geo, "aDelay", delayOf(ring));
        return geo;
      }),
    ),
    coilMat,
    { edgeOpacity: 0.55 },
  );
  // What stands in the helium is drawn AFTER its light, not under it: rings of clear metal in a green bath, not paler green.
  for (const part of [former, coils]) {
    for (const mesh of part.children) {
      mesh.material.transparent = mesh.material.userData.transparent = true;
      mesh.renderOrder = 6;
      for (const line of mesh.children) line.renderOrder = 7;
    }
  }
  // the current's round: a sheath on each ring's back and flanks
  const SU = { uAmount: { value: 0 }, uTime: { value: 0 } };
  const round = lightMesh(
    mergeGeometries(
      RINGS.map(([z, w, r0, r1, dir]) => {
        const geo = turnZ([[r0 + 1, z - w / 2 - 0.5], [r1 + 0.5, z - w / 2 - 0.5], [r1 + 0.5, z + w / 2 + 0.5], [r0 + 1, z + w / 2 + 0.5]], 96, { bevel: 0, crease: 30 });
        fill(geo, "aDir", dir);
        return geo;
      }),
    ),
    spinMaterial(SU),
    8,
  );
  vesselG.add(round);
  // where the wire first warms: a light that has a place
  const hotAt = [QUENCH.r * Math.cos(QUENCH.at * DEG), QUENCH.r * Math.sin(QUENCH.at * DEG), QUENCH.z];
  const hotBall = makeBall(HOT, SIGNAL);
  hotBall.position.set(hotAt[0] * 1.03, hotAt[1] * 1.03, hotAt[2]);
  vesselG.add(hotBall);

  /* ══ THE HELIUM: the bath, its surface, its bubbles ══ */
  const HU = { uAmount: { value: 0 }, uLevel: { value: HE.full }, uBoil: { value: 0 }, uTime: { value: 0 }, uNamed: { value: 0 } };
  const bath = lightMesh(turnZ(ringOf(HE.r0, HE.r1, -HE.half, HE.half), 96, { bevel: 0, crease: 30 }), heliumMaterial(HU));
  const surface = lightMesh(new THREE.PlaneGeometry(HE.r1 * 2, HE.half * 2).rotateX(-Math.PI / 2), surfaceMaterial(HU));
  const BBL = { ...HU, uAmount: { value: 0 } }; // the bath's level and clock, an amount of their own
  const bubbles = lightMesh(sprites(170, 17), bubbleMaterial(BBL), 8);
  vesselG.add(bath, surface, bubbles);

  /* ══ THE TURRET, its cold head, and the quench pipe ══ */
  const turretG = grp(mag);
  const turret = partIn(turretG, "turret");
  {
    const m = { neck: solid(0x9aa1a8, { rough: 0.45, metal: 0.4 }), nut: solid(0xc4c9cd, { rough: 0.4, metal: 0.45 }), head: solid(0x4a5158, { rough: 0.6, metal: 0.25 }) };
    addMesh(turret, turnY([[0, 94], [20, 94], [20, 119], [24.5, 119], [24.5, 123], [20.5, 123], [20.5, 126], [17, TUR.top], [0, TUR.top]], 56).translate(TUR.x, 0, TUR.z), m.neck, { edgeOpacity: 0.5 });
    addMesh(turret, mergeGeometries(Array.from({ length: 10 }, (_, i) => cyl(1.6, 1.6, 0.3, 6).translate(TUR.x + 22.5 * Math.cos(((i + 0.5) / 10) * Math.PI * 2), 123.8, TUR.z + 22.5 * Math.sin(((i + 0.5) / 10) * Math.PI * 2)))), m.nut, { edges: false });
    // the cold head: a cylinder, its motor, two hoses
    addMesh(turret, mergeGeometries([cyl(5, 22, 0.6, 24).translate(-12.5, TUR.top + 10, TUR.z - 9), box(11, 6.5, 11, 1.2).translate(-12.5, TUR.top + 24, TUR.z - 9), ...[-2.6, 2.6].map((z) => lyingX(cyl(1.3, 9, 0.2, 10)).translate(-20, TUR.top + 24, TUR.z - 9 + z))]), m.head, { edgeOpacity: 0.4 });
  }
  const pipe = partIn(turretG, "pipe");
  const pipeMat = solid(0xb4bbc0, { rough: 0.45, metal: 0.4 });
  addMesh(pipe, turnY([[0, 128], [PIPE.r, 128], [PIPE.r, 138], [15.5, 138], [15.5, 145], [PIPE.r, 145], [PIPE.r, PSPLIT], [0, PSPLIT]], 40).translate(PX, 0, PZ), pipeMat, { edgeOpacity: 0.5 });
  const pipeUp = partIn(turretG, "pipe-up");
  const upMat = fading(0xb4bbc0, PSPLIT, PSPLIT + 60);
  const upMesh = addMesh(pipeUp, turnY([[PIPE.r, PSPLIT], [PIPE.r, 246], [12.6, 246], [12.6, 250.5], [PIPE.r, 250.5], [PIPE.r, PTOP - 7], [13, PTOP - 7], [13, PTOP], [9.6, PTOP], [9.6, PTOP - 24]], 40).translate(PX, 0, PZ), upMat, { edgeOpacity: 0.5 });
  upMesh.castShadow = false; // on the bench it is not there: its shadow would be
  pipeUp.userData.part.meshes.length = 0;
  const upLines = upMesh.children[0].material;
  // the cold that climbs it, and the cloud at its mouth
  const FU = { uAmount: { value: 0 }, uHead: { value: 0 }, uRush: { value: 0 }, uTime: { value: 0 } };
  const frost = lightMesh(new THREE.CylinderGeometry(PIPE.r + 0.7, PIPE.r + 0.7, PTOP - 128, 32, 1, true).translate(PX, (PTOP + 128) / 2, PZ), frostMaterial(FU));
  const CL = { uAmount: { value: 0 }, uGrow: { value: 1 }, uTime: { value: 0 } };
  const cloud = lightMesh(sprites(46, 5), puffMaterial(CL), 8);
  const burst = makeBall(WHITE, FROST);
  burst.position.set(PX, PTOP + 8, PZ);
  turretG.add(frost, cloud, burst);

  /* ══ THE FIELD ══ */
  const BU = { uAmount: { value: 0 }, uTime: { value: 0 }, uMinPx: { value: 3.2 } };
  const field = lightMesh(fieldLines(), fieldMaterial(BU), 8);
  mag.add(field);

  /* ══ THE BOX: the emergency stop to the left, the magnet stop under its flap to the right ══ */
  // Its own frame: its face looks toward +z, x runs to the right of whoever faces it.
  const boxG = grp();
  const casing = partIn(boxG, "box");
  const [EX, EY] = BOX.estop;
  const [SX, SY] = BOX.mstop;
  {
    const m = { case: solid(0x30363b, { rough: 0.7, coat: 0.2 }), face: solid(0x8d949b, { rough: 0.55, metal: 0.3 }), collar: solid(0x4a5158, { rough: 0.6, metal: 0.3 }), label: solid(0xb9bfc4, { rough: 0.7 }) };
    addMesh(casing, box(BOX.w, BOX.h, 7, 1.2).translate(0, 0, -0.5), m.case, { edgeOpacity: 0.5 });
    addMesh(casing, box(BOX.w - 3, BOX.h - 3, 1, 0.4).translate(0, 0, 3.4), m.face, { edgeOpacity: 0.5 });
    addMesh(casing, mergeGeometries([lyingZ(lathe(ringOf(2.2, 4.7, 3.9, 5.2), 40, { bevel: 0.3, round: 1 })).translate(EX, EY, 0), box(8.6, 8.6, 0.9, 0.5).translate(SX, SY, 4.3)]), m.collar, { edgeOpacity: 0.45 });
    addMesh(casing, mergeGeometries([EX, SX].map((x) => box(9, 1.5, 0.4, 0.15, 2).translate(x, -8.1, 4.0))), m.label, { edges: false });
  }
  const estopG = grp(boxG);
  estopG.position.set(EX, EY, 0);
  const estop = partIn(estopG, "estop"); // a mushroom, ink: it is not the one that saves
  addMesh(estop, lyingZ(lathe([[0, 3.6], [1.7, 3.6], [1.7, 8], [4, 8.2], [4, 9.3], [3.1, 10.7], [0, 11.2]], 40, { bevel: 0.35, round: 2 })), solid(0xd8d3c6, { rough: 0.5, coat: 0.4 }), { edgeOpacity: 0.6 });
  const mstopG = grp(boxG);
  mstopG.position.set(SX, SY, 0);
  const mstop = partIn(mstopG, "mstop");
  const stopMat = solid(BRAND.veille, { rough: 0.45, coat: 0.4 });
  addMesh(mstop, lyingZ(lathe([[0, 3.6], [2.6, 3.6], [2.6, 6.5], [2.1, 7.1], [0, 7.2]], 32, { bevel: 0.25, round: 2 })), stopMat, { edgeOpacity: 0.5 });
  // its flap: clear, hinged along its top
  const flapG = grp(boxG);
  flapG.position.set(SX, SY + 5.8, 4.6);
  const flapGlass = glass(BRAND.ink, { base: 0.03, rim: 0.4, power: 2.2, edge: 0.5, spec: 0.7 });
  const flapShape = box(10.6, 11.4, 4.6, 0.6).translate(0, -5.7, 2.3);
  const flap = new THREE.Mesh(flapShape, flapGlass);
  const flapLines = edgesOf(flapShape, { color: BRAND.ink, width: 2, opacity: 0.75 });
  flap.add(flapLines);
  asShell(flap, 24);
  flapG.add(flap);
  addMesh(casing, lyingX(cyl(0.6, 11.4, 0.15, 12)).translate(SX, SY + 5.9, 4.5), solid(0x4a5158, { rough: 0.6, metal: 0.3 }), { edges: false });
  // on the bench: a post, a foot
  const post = partIn(boxG, "post");
  addMesh(post, mergeGeometries([cyl(2.6, BOX.bench[1] - BOX.h / 2, 0.5, 20).translate(0, -(BOX.bench[1] + BOX.h / 2) / 2, -1), cyl(13, 2.4, 0.8, 32).translate(0, -BOX.bench[1] + 1.2, -1)]), solid(0x30363b, { rough: 0.75, metal: 0.2 }), { edgeOpacity: 0.4 });

  /* ── anchors ── */
  const A = {
    mouth: anchor(mag, 0, 0, HALF),
    top: anchor(mag, 0, RO, 0),
    bore: anchor(boreG, 0, TUBE.r1, TUBE.half - 3),
    gradients: anchor(gradG, 0, GRAD.r1, GRAD.half - 3),
    coils: anchor(vesselG, 0, 73, 46),
    vessel: anchor(vesselG, 0, R1, 30),
    helium: anchor(vesselG, -86, -20, VZ),
    hot: anchor(vesselG, ...hotAt),
    turret: anchor(turretG, TUR.x, TUR.top, TUR.z),
    pipe: anchor(turretG, PX, 170, PZ),
    pipeTop: anchor(turretG, PX, PTOP, PZ),
    box: anchor(boxG, 0, 0, 4),
    estop: anchor(estopG, 0, 0, 11.2),
    mstop: anchor(mstopG, 0, 0, 7.2),
    table: anchor(tableG, 0, 84, 190),
    panel: anchor(frontG, -PAD.x, PAD.y + 4.6, PAD.z + 3),
  };

  /* ── what lights up when the voice names a part: its solids, and the lines of its edges ── */
  const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  const lampOf = (...parts) => {
    const mats = parts.flatMap((part) => [...part.userData.part.mats]);
    const lineMats = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lineMats) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.glow = 0.11 * (1 - 0.85 * Math.min(1, lum(mat.color)));
    }
    return { solids, lines: lineMats, k: -1, cold: -1 };
  };
  const tmp = new THREE.Color();
  /** `k` veille (named) · `cold`: a pale light of its own (the gas going through). */
  const light = (lamp, k, cold = 0) => {
    if (lamp.k === k && lamp.cold === cold) return;
    lamp.k = k;
    lamp.cold = cold;
    for (const mat of lamp.solids) {
      mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k).add(tmp.copy(FROST).multiplyScalar(cold));
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.7 * k);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };
  const lamps = { bore: lampOf(bore), grad: lampOf(grad), coils: lampOf(coils), vessel: lampOf(vessel.part), turret: lampOf(turret, pipe, pipeUp), box: lampOf(casing) };

  // nothing is allocated past this line
  const place = (group, open, a, b, z0 = 0) => group.position.set(open.at[0] * b, open.at[1] * b, z0 + open.out * a * (1 - b) + open.at[2] * b);

  return {
    root, A,
    parts: { front: front.part, rear: rear.part, lights, table, bore, gradients: grad, vessel: vessel.part, cradles: feet, former, coils, turret, pipe, box: casing, estop, mstop },
    update(P, time = 0) {
      const bench = (P.bench ?? 0) > 0.5;
      const e = clamp01(P.explode ?? 0);
      const cover = clamp01(P.cover ?? 1);
      const xray = clamp01(P.xray ?? 0);
      const power = clamp01(P.power ?? 1);
      const knock = clamp01(P.knock ?? 0);
      const helium = clamp01(P.helium ?? 1);
      const boil = clamp01(P.boil ?? 0);
      const plume = clamp01(P.plume ?? 0);
      const hot = clamp01(P.hot ?? 0);
      const spin = clamp01(P.spin ?? 0);
      const litBore = clamp01(P.litBore ?? 0);
      const litGradients = clamp01(P.litGradients ?? 0);
      const litMagnet = clamp01(P.litMagnet ?? 0);
      const litHelium = clamp01(P.litHelium ?? 0);
      const litPipe = clamp01(P.litPipe ?? 0);
      const litButtons = clamp01(P.litButtons ?? 0);

      // ── the covers: there, away (they part along the axis and fade), or glass
      const on = smooth(ramp(cover, 0.02, 0.7));
      const away = 70 * (1 - ease(cover));
      setPartOpacity(front.part, on * (1 - xray));
      setPartOpacity(rear.part, on * (1 - xray));
      see(front, on * xray);
      see(rear, on * xray);
      setPartOpacity(lights, on);
      lampMat.screen.color.copy(INK).multiplyScalar(0.04 + 1.16 * power);
      lampMat.keys.color.copy(INK).multiplyScalar(0.03 + 0.67 * power);
      lampMat.ring.color.copy(INK).multiplyScalar(0.03 + 1.47 * power);
      boreLamp.intensity = 520 * power * on;

      // ── opened (the bench): each layer comes out along the axis, then takes its place across the camera
      place(frontG, OPEN.front, settle(ramp(e, 0, 0.25)), settle(ramp(e, 0.2, 0.55)), away);
      place(rearG, OPEN.rear, settle(ramp(e, 0, 0.25)), settle(ramp(e, 0.2, 0.55)), -away);
      const across = settle(ramp(e, 0.52, 0.9)); // the tube and the sleeve go across together: they stay on one axis
      place(gradG, OPEN.grad, settle(ramp(e, 0.2, 0.5)), across);
      place(boreG, OPEN.bore, settle(ramp(e, 0.3, 0.56)), across);
      turretG.position.y = OPEN.turret * settle(ramp(e, 0.6, 0.95));
      tableG.position.z = OPEN.table[0] * settle(ramp(e, 0, 0.2)) + OPEN.table[1] * settle(ramp(e, 0.5, 0.8));

      // ── the gradient coils knock: a tremor at the frame's own rate (a steady blur), on a slow swell
      const swell = 0.6 + 0.4 * Math.sin(time * 8.2) * Math.sin(time * 2.9 + 1);
      const beat = Math.sin(time * TREMOR * Math.PI * 2);
      gradG.position.x += 1.15 * knock * swell * beat;
      gradG.position.y += 0.8 * knock * swell * Math.sin(time * TREMOR * Math.PI * 2 + 1.3);
      gradG.rotation.z = 0.006 * knock * swell * beat;
      GU.uKnock.value = knock * (0.12 + 0.2 * swell);
      GU.uNamed.value = 0.5 * litGradients;

      // ── the vessel: steel, or glass — and then the bath, the rings, the current's round
      const open = Math.max(xray, smooth(ramp(e, 0.45, 0.8)));
      setPartOpacity(vessel.part, 1 - open);
      see(vessel, open);
      vessel.glassMat.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.5 * litHelium);
      const level = lerp(HE.empty, HE.full, helium);
      HU.uAmount.value = open;
      HU.uLevel.value = level;
      HU.uBoil.value = boil;
      HU.uTime.value = time;
      HU.uNamed.value = litHelium;
      surface.position.y = level;
      bath.visible = surface.visible = open > 0.004 && helium > 0.002;
      bubbles.visible = bath.visible && boil > 0.004;
      BBL.uAmount.value = open * boil;
      SU.uAmount.value = spin;
      SU.uTime.value = time;
      round.visible = spin > 0.004;
      CU.uHot.value = hot;
      shine(hotBall, 0.5 * smooth(ramp(hot, 0, 0.12)) * (1 - 0.6 * smooth(ramp(hot, 0.4, 1))), 30, 10);

      // ── the field's lines
      BU.uAmount.value = 0.85 * clamp01(P.seen ?? 0) * Math.max(0, Math.min(1.3, (P.tesla ?? TESLA) / TESLA));
      BU.uTime.value = time;
      field.visible = BU.uAmount.value > 0.004;

      // ── the pipe: on the bench it melts into the dark before the header; the cold climbs it, the cloud leaves its mouth
      const whole = bench ? smooth(ramp(plume, 0, 0.06)) : 1;
      upMat.userData.U.uFade.value = 1 - whole;
      upLines.opacity = upLines.userData.base * whole;
      const climbing = ramp(plume, 0.01, 0.3);
      FU.uAmount.value = smooth(ramp(plume, 0, 0.04));
      FU.uHead.value = lerp(120, PTOP + 14, climbing);
      FU.uRush.value = 1 - smooth(ramp(plume, 0.28, 0.4));
      FU.uTime.value = time;
      frost.visible = plume > 0.002;
      const out = smooth(ramp(plume, 0.28, 0.45));
      CL.uAmount.value = out;
      CL.uGrow.value = 0.3 + 0.95 * ramp(plume, 0.3, 1);
      CL.uTime.value = time;
      cloud.visible = out > 0.004;
      shine(burst, 0.22 * out, 24 + 14 * plume, 5);

      // ── the box: on the wall by the door (it looks into the room), or on its post beside the machine
      const at = bench ? BOX.bench : BOX.at;
      boxG.position.set(at[0], at[1], at[2]);
      boxG.rotation.y = bench ? -15 * DEG : Math.PI;
      post.visible = bench;
      estopG.position.z = -2.6 * clamp01(P.estop ?? 0);
      mstopG.position.z = -1.4 * clamp01(P.mstop ?? 0);
      flapG.rotation.x = -112 * DEG * clamp01(P.flap ?? 0);
      stopMat.emissive.copy(VEILLE).multiplyScalar(0.3 + 0.25 * litButtons + 0.3 * clamp01(P.mstop ?? 0));
      flapGlass.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.4 * litButtons);

      // ── the part the voice names; the cold that goes through the turret
      light(lamps.bore, litBore);
      light(lamps.grad, litGradients);
      light(lamps.coils, litMagnet);
      light(lamps.vessel, litHelium);
      light(lamps.turret, litPipe, 0.1 * smooth(ramp(plume, 0, 0.1)));
      light(lamps.box, litButtons);
    },
  };
}
