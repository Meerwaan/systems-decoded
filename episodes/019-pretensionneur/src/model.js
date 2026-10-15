// DOSSIER 019 — Prétensionneur : the system — a seat-belt retractor at its true size (≈ 11 cm), in ITS OWN frame:
// the origin is the middle of its base, the spool's axis runs along x at SPOOL.y, the strap leaves the spool on the
// +z side (the "front") and rises along +y.
//   · THE FRAME: a pressed steel U — a back plate (−z) with its mounting ear, two cheeks, a tie rod. Dark.
//   · THE SPOOL and THE STRAP: a drum between two flanges cut with four windows (the wound strap's layers show on
//     its edge), and the strap going up to its end — the guide ring in the car, a roller on a slim gallows on the
//     bench, a short tail hanging behind it. A chevron weave runs along it: its travel reads when it moves.
//   · THE TORSION BAR, inside the spool, along its axis: the clearest piece. Its −x end is held by the ratchet wheel,
//     its +x end by the spool; a groove engraved along it turns into a helix when it twists.
//   · THE EVERYDAY LOCK, −x end: a ratchet wheel, under it a pawl resting on the cap of a pendulum in its cup.
//   · THE PRETENSIONER, +x end: a turbine wheel (ten buckets) in its case, and lying over the case the gas generator —
//     a small cylinder, its nozzle bent down into the case, its connector and two wires.
// Three values of grey: the frame and the case dark, what is machined in between, the strap and the bar clear.
// Light: VEILLE is what the system does (the order at the connector, the gas, the bar giving way, the part the voice
// names); SIGNAL the strap's force; the charge's flash is white (ink), it has a place and dies small.
// Liberties taken to be read in one frame (docs/journal/019-model.md): the lock is drawn without its cover; the case
// has an open ring for a cover (the buckets show without the X-ray); the bar's twist is drawn TWIST_GAIN times the
// angle the spool gives back (a real limiter twists by more than a turn; REEL.out is illustrative); the strap's
// belly stands for its slack; the turbine is clutched to the spool only by the charge (a hand's pull leaves it still).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glass, asShell, edgesOf, makePart, addMesh, setPartOpacity, anchor, box, cyl, lathe, plate, mergeGeometries } from "@kit/build3d.js";
import { RETRACTOR, FRAME, SPOOL, BAR, LOCK, TURBINE, CHARGE, REEL, LIMIT, BELT } from "./plan.js";

const TAU = Math.PI * 2;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const WHITE = new THREE.Color(1, 0.97, 0.9);
const SOOT = new THREE.Color(0x0b0c0d);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);
/** Out between a0 and a1, held, back between b0 and b1: the side-step a part takes to let another one pass. */
const trap = (k, a0, a1, b0, b1) => smooth(ramp(k, a0, a1)) * (1 - smooth(ramp(k, b0, b1)));

/* ─────────────────────────────────────────────────────────── where everything is */

const SY = SPOOL.y; //            the axis
const RW = SPOOL.full; //         the wound strap's radius: the strap leaves at z = +RW
const HALF = BELT.width / 2;
const XC = FRAME.w / 2; //        a cheek's inner face
const ZB = -FRAME.d / 2; //       the back plate's front face
const MID = BAR.len / 2 - 0.95; // half the bar's free length, between its two heads
/** The strap's weave — cabine.js must draw the same: a chevron every `period` cm, `chevron` cm deep, `dark` × the base colour. */
export const WEAVE = { color: 0xbdb9ad, period: 1.5, chevron: 0.85, duty: 0.4, dark: 0.68, selvedge: 0.72 };
/** How far a hand pulls the strap out at `tug` 1 (free), and how far it gets before the pawl catches (locked), in cm. */
const TUG = { free: 7, locked: 0.45 };
/** The bar's twist is drawn this many times the angle the spool gives back. */
const TWIST_GAIN = 5;
const PAWL = { pivot: [1.75, 2.5], turn: 0.22 }; // (y, z) of its pin · radians it lifts by
const PEND = { pivot: [1.42, 1.2], tip: 0.55 }; // (y, z) of the cup's seat · radians the pendulum tips by
const TEETH = 16;
const RATCHET_PHASE = -0.19; // the wheel at rest: a tooth's steep face a breath short of where the pawl comes up
const GAS = { r: 2.28, in: 0.72, turns: 1.35 }; // the gas runs round the wheel at `r`; it enters at angle `in` from the top, toward the front
const NOZZLE = [[0, 0, 2.0], [0, 0, 2.9], [0, -0.22, 3.16], [0, -0.62, 3.22], [0, -1.5, 3.22]]; // in the charge's frame
// The exploded view: a row along the spool's axis (x), across a camera standing in front (+z). The spool and its
// strap stay; the gas generator lifts over the turbine and lies along the row.
const OPEN = { lock: -3.4, lockUp: 12.6, lockTurn: 1.15, frame: -8.6, frameBack: -7.6, bar: 9.7, turbine: 13.8, turbineTurn: -0.9, chargeUp: 6.6, chargeTurn: -1.15 };
const TAIL0 = 11; // the tail hanging behind the bench's roller, at rest

/* ─────────────────────────────────────────────────────────── geometry */

const lyingZ = (g) => g.rotateX(Math.PI / 2); // a lathe's axis (y) laid along +z
const lyingX = (g) => g.rotateZ(-Math.PI / 2); // …along +x
const turnX = (profile, segments = 64, o = { bevel: 0.05, round: 2 }) => lyingX(lathe(profile, segments, o));
const turnZ = (profile, segments = 48, o = { bevel: 0.05, round: 2 }) => lyingZ(lathe(profile, segments, o));
const ringOf = (r0, r1, a, b) => [[r0, a], [r1, a], [r1, b], [r0, b], [r0, a]];
/** A flat piece drawn in (z, y), `t` thick along the axis, its +x face at `a`. */
const slab = (outline, t, a, bevel = 0.06) => plate(outline, t, { bevel }).rotateY(-Math.PI / 2).translate(a, 0, 0);
const hole = (x, y, r) => new THREE.Path().absarc(x, y, r, 0, TAU, true);
const shapeOf = (points, holes = []) => {
  const s = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  s.holes.push(...holes);
  return s;
};
const disc = (r, holes = []) => {
  const s = new THREE.Shape().absarc(0, 0, r, 0, TAU, false);
  s.holes.push(...holes);
  return s;
};
/** A window cut in a flange: between two radii, from angle a0 to a1. */
function sector(r0, r1, a0, a1) {
  const p = new THREE.Path();
  p.moveTo(r1 * Math.cos(a0), r1 * Math.sin(a0));
  p.absarc(0, 0, r1, a0, a1, false);
  p.lineTo(r0 * Math.cos(a1), r0 * Math.sin(a1));
  p.absarc(0, 0, r0, a1, a0, true);
  p.closePath();
  return p;
}
/** The ratchet wheel's outline in (z, y): each tooth climbs gently, then drops — the steep face leads when the spool pays out. */
function ratchetOutline(n, rOut, rRoot) {
  const pts = [];
  const pitch = TAU / n;
  for (let i = 0; i < n; i++) {
    const a = i * pitch;
    pts.push([rRoot * Math.cos(a), rRoot * Math.sin(a)], [rOut * Math.cos(a + 0.86 * pitch), rOut * Math.sin(a + 0.86 * pitch)]);
  }
  return pts;
}
/** One bucket of the turbine in (z, y): it curls back toward the gas that comes at it. */
function bucket(a0) {
  const face = [];
  const back = [];
  for (let i = 0; i <= 7; i++) {
    const u = i / 7;
    const r = 0.9 + 1.74 * u;
    const a = a0 + 0.66 * Math.pow(u, 1.6);
    const half = (0.2 - 0.09 * u) / r;
    face.push([r * Math.cos(a + half), r * Math.sin(a + half)]);
    back.push([r * Math.cos(a - half), r * Math.sin(a - half)]);
  }
  return [...face, ...back.reverse()];
}
const tubeAlong = (points, r, radial = 12) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "centripetal"), points.length * 8, r, radial, false);

/* ─────────────────────────────────────────────────────────── light and weave */

/** A ball of light with no edge, always facing the eye: a small hot heart, a soft body, a long tail (014's). */
const ballMaterial = (heart, hue) =>
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
  });
function makeBall(heart, hue, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ballMaterial(heart, hue));
  mesh.position.set(x, y, z);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  mesh.visible = false;
  return mesh;
}
const setBall = (ball, amount, radius, minPx) => {
  ball.visible = amount > 0.004;
  ball.material.uniforms.uAmount.value = amount;
  ball.material.uniforms.uRadius.value = radius;
  ball.material.uniforms.uMinPx.value = minPx;
};

/** Patch a lit material's shader: its colour falls to black between y ≈ 490 px and y ≈ 418 px of the picture, whatever the camera. */
const sinking = (shader) => {
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", `#include <common>\nvarying vec2 vSink;`)
    .replace("#include <project_vertex>", `#include <project_vertex>\nvSink = gl_Position.yw;`);
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", `#include <common>\nvarying vec2 vSink;`)
    .replace("#include <dithering_fragment>", `#include <dithering_fragment>\ngl_FragColor.rgb *= 1.0 - smoothstep(0.49, 0.565, vSink.x / max(vSink.y, 1e-4));`);
};
const sinks = (mat) => {
  mat.customProgramCacheKey = () => "019-sink";
  mat.onBeforeCompile = sinking;
  return mat;
};

const WEAVE_GLSL = /* glsl */ `
  // a chevron weave: \`s\` cm along the strap, \`side\` 0 on its middle → 1 on its edge, \`w\` the width of a pixel in periods
  float weaveMark(float s, float side, float w) {
    float c = (s + side * ${WEAVE.chevron.toFixed(2)}) / ${WEAVE.period.toFixed(2)};
    float f = fract(c);
    float e = w * 1.2 + 0.02;
    float band = smoothstep(0.0, e, f) * (1.0 - smoothstep(${WEAVE.duty.toFixed(2)}, ${WEAVE.duty.toFixed(2)} + e, f));
    return mix(${WEAVE.duty.toFixed(2)}, band, 1.0 - smoothstep(0.22, 0.55, w)); // under the pixel it melts into its mean
  }`;

/** The strap leaving the spool: a ribbon laid by its shader between two points, with a belly; its weave runs by `uRun` cm. */
function ribbonMaterial(U) {
  const mat = solid(WEAVE.color, { rough: 0.86, double: true });
  mat.customProgramCacheKey = () => "019-ribbon";
  mat.onBeforeCompile = (shader) => {
    sinking(shader);
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", /* glsl */ `#include <common>
        uniform vec3 uP0, uP1; uniform float uBelly, uLen; varying float vS; varying float vU;
        vec3 strapAt(float t) {
          vec3 d = uP1 - uP0;
          vec3 T = d / max(length(d), 1e-3);
          vec3 N = vec3(0.0, -T.z, T.y);
          float b = sin(3.14159265 * clamp(t, 0.0, 1.0)) * (1.0 + 0.45 * cos(3.14159265 * t));
          return uP0 + d * t + N * (uBelly * b);
        }`)
      .replace("#include <beginnormal_vertex>", /* glsl */ `
        vec3 dS = strapAt(uv.y + 0.01) - strapAt(uv.y - 0.01);
        dS /= max(length(dS), 1e-4);
        vec3 objectNormal = vec3(0.0, -dS.z, dS.y);`)
      .replace("#include <begin_vertex>", /* glsl */ `
        vec3 transformed = strapAt(uv.y) + vec3(position.x, 0.0, 0.0);
        vS = uv.y * uLen; vU = uv.x;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", /* glsl */ `#include <common>
        uniform float uRun, uLoad; uniform vec3 uGlow; varying float vS; varying float vU;
        ${WEAVE_GLSL}`)
      .replace("#include <color_fragment>", /* glsl */ `#include <color_fragment>
        float sideS = abs(vU - 0.5) * 2.0;
        float markS = weaveMark(vS + uRun, sideS, fwidth(vS) / ${WEAVE.period.toFixed(2)});
        diffuseColor.rgb *= mix(1.0, ${WEAVE.dark.toFixed(2)}, markS) * mix(1.0, ${WEAVE.selvedge.toFixed(2)}, smoothstep(0.8, 0.87, sideS));`)
      .replace("#include <emissivemap_fragment>", /* glsl */ `#include <emissivemap_fragment>
        totalEmissiveRadiance += uGlow * uLoad * (0.05 + 0.1 * (1.0 - markS) + 1.1 * smoothstep(0.62, 0.95, sideS));`);
  };
  return mat;
}
/** The strap wound on the drum: the same weave round it, its layers on its two edges. It turns with its mesh. */
function woundMaterial() {
  const mat = solid(WEAVE.color, { rough: 0.86 });
  const periods = Math.round((TAU * RW) / WEAVE.period);
  mat.customProgramCacheKey = () => "019-wound";
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vObj; varying float vNx;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\nvObj = position; vNx = abs(normal.x);`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", /* glsl */ `#include <common>
        varying vec3 vObj; varying float vNx;
        ${WEAVE_GLSL}`)
      .replace("#include <color_fragment>", /* glsl */ `#include <color_fragment>
        float pxW = length(fwidth(vObj)); // cm a pixel
        if (vNx > 0.5) {
          float rr = length(vObj.yz) / 0.2;
          float wR = pxW / 0.2;
          float lineR = smoothstep(0.5, 0.56 + wR * 2.0, abs(fract(rr) - 0.5) * 2.0);
          diffuseColor.rgb *= mix(1.0, 0.5, mix(0.42, lineR, 1.0 - smoothstep(0.3, 0.7, wR)));
        } else {
          float aW = atan(vObj.z, vObj.y) * ${(periods * WEAVE.period / TAU).toFixed(4)};
          float sideW = clamp(abs(vObj.x) / ${HALF.toFixed(2)}, 0.0, 1.0);
          diffuseColor.rgb *= mix(1.0, ${WEAVE.dark.toFixed(2)}, weaveMark(aW, sideW, pxW / ${WEAVE.period.toFixed(2)})) * mix(1.0, ${WEAVE.selvedge.toFixed(2)}, smoothstep(0.8, 0.87, sideW));
        }`);
  };
  return mat;
}
/** The torsion bar: its −x end turned by uA0, its +x end by uA1, everything between twisted; grooves engraved along it. */
function barMaterial(U) {
  const mat = solid(0xe3e6e8, { rough: 0.36, metal: 0.3 });
  mat.customProgramCacheKey = () => "019-bar";
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nuniform float uA0, uA1; varying vec2 vDir;`)
      .replace("#include <beginnormal_vertex>", /* glsl */ `
        float aB = mix(uA0, uA1, clamp((position.x + ${MID.toFixed(3)}) / ${(2 * MID).toFixed(3)}, 0.0, 1.0));
        float cB = cos(aB); float sB = sin(aB);
        vec3 objectNormal = vec3(normal.x, normal.y * cB - normal.z * sB, normal.y * sB + normal.z * cB);`)
      .replace("#include <begin_vertex>", /* glsl */ `
        vec3 transformed = vec3(position.x, position.y * cB - position.z * sB, position.y * sB + position.z * cB);
        vDir = position.yz;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nuniform float uBarGlow; uniform vec3 uBarHue; varying vec2 vDir;`)
      .replace("#include <color_fragment>", /* glsl */ `#include <color_fragment>
        vec2 nB = vDir / max(length(vDir), 1e-4);
        float xB = clamp(dot(nB, vec2(0.574, 0.819)), -1.0, 1.0); // the cosine of the angle to the main groove: it faces the front, a little up
        float x2 = xB * xB;
        float six = 32.0 * x2 * x2 * x2 - 48.0 * x2 * x2 + 18.0 * x2 - 1.0; // cos(6a): five fine grooves more
        float boldB = smoothstep(0.93, 0.975, xB);
        float fineB = smoothstep(0.78, 0.93, six) * 0.85;
        diffuseColor.rgb *= mix(1.0, 0.14, max(boldB, fineB));`)
      .replace("#include <emissivemap_fragment>", /* glsl */ `#include <emissivemap_fragment>
        totalEmissiveRadiance += uBarHue * (uBarGlow * (1.3 * boldB + 0.9 * fineB));`);
  };
  return mat;
}

/* ─────────────────────────────────────────────────────────── the system */

/**
 * → { root, parts, A, update(p, time, px) }. p (see FIRST in world.js):
 *   bench     0 in the car · 1 on the bench: only the strap's far end changes (RETRACTOR.top / benchTop, its gallows and tail)
 *   slack     1 loose (a belly) → 0 taut: the spool has turned BACKWARD by REEL.take of strap, the turbine with it
 *   give      0 → 1: the bar twists, the spool pays REEL.out back; the ratchet end does not turn
 *   load      0 … LIMIT: a signal glow along the strap
 *   fire      0 intact → ≈ 0.15 the white flash at the nozzle → 0.1–0.8 the gas, veille, round the turbine → 1 spent, dark
 *   order     ≥ 0.95: the connector lights, veille
 *   lock      0 free → 1 the pendulum has tipped, its pawl is in the ratchet wheel
 *   tug       the strap pulled by hand: free the spool turns and pays out; locked it stops dead on a tooth
 *   xray      cheeks, flanges, drum, wound strap and the turbine's case turn to glass
 *   explode   0 → 1: a row along the axis — lock · frame · spool and strap · bar · turbine (the generator over it)
 *   litFrame, litSpool, litCharge, litTurbine, litBar, litPendulum   the part the voice names glows faintly veille
 */
export function buildSystem() {
  const root = new THREE.Group();
  const grp = (parent = root, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };
  const partIn = (parent, name) => {
    const part = makePart(name);
    parent.add(part);
    return part;
  };
  const steel = (hex, o = {}) => solid(hex, { rough: 0.55, metal: 0.22, ...o });

  /* ══ THE FRAME ══ */
  const frameG = grp();
  const frame = partIn(frameG, "frame");
  const cheeks = partIn(frameG, "cheeks");
  const mFrame = steel(0x596067, { rough: 0.62 });
  const mRod = steel(0x4a5158);
  const backShape = shapeOf(
    [[-XC - FRAME.wall, 0], [XC + FRAME.wall, 0], [XC + FRAME.wall, FRAME.h], [1.7, FRAME.h], [1.3, FRAME.h + 1.9], [-1.3, FRAME.h + 1.9], [-1.7, FRAME.h]],
    [hole(0, FRAME.h + 0.75, 0.55), hole(-2.5, 9.3, 0.4), hole(2.5, 9.3, 0.4)],
  );
  const win = new THREE.Path();
  win.moveTo(-2.3, 3.4); win.lineTo(-2.3, 7.6); win.lineTo(2.3, 7.6); win.lineTo(2.3, 3.4); win.closePath();
  backShape.holes.push(win);
  addMesh(frame, plate(backShape, FRAME.wall, { bevel: 0.07 }).translate(0, 0, ZB - FRAME.wall), mFrame, { edgeOpacity: 0.7 });
  addMesh(frame, lyingX(cyl(0.3, FRAME.w + 2 * FRAME.wall + 0.5, 0.06, 20)), mRod, { pos: [0, 10.1, -2.5], edgeOpacity: 0.5 });
  const cheekShape = () => shapeOf([[ZB, 0], [-ZB, 0], [-ZB, 8.0], [2.2, FRAME.h], [ZB, FRAME.h]], [hole(0, SY, 1.3), hole(-2.3, 9.4, 0.42), hole(-2.3, 1.5, 0.42), hole(2.3, 1.5, 0.42)]);
  const mCheek = steel(0x656c73, { rough: 0.6 });
  const cheekGeo = [slab(cheekShape(), FRAME.wall, -XC), slab(cheekShape(), FRAME.wall, XC + FRAME.wall)];
  for (const geo of cheekGeo) addMesh(cheeks, geo, mCheek, { edgeOpacity: 0.7 });
  // …and their twins of glass, for the X-ray
  const mCheekGlass = glass(BRAND.ink, { base: 0.004, rim: 0.22, power: 2.6, edge: 0.4, spec: 0.5, through: 0.3 });
  const glassLines = [];
  const twin = (parent, geo, mat, weight = 0.38) => {
    const mesh = new THREE.Mesh(geo, mat);
    const lines = edgesOf(geo, { opacity: 0 });
    mesh.add(lines);
    glassLines.push({ mat: lines.material, weight });
    parent.add(mesh);
    return mesh;
  };
  const cheekGlassG = grp(frameG);
  asShell(cheekGeo.map((geo) => twin(cheekGlassG, geo, mCheekGlass)), 20);

  /* ══ THE SPOOL ══ */
  const spoolSpin = grp(root, 0, SY, 0);
  const spool = partIn(spoolSpin, "spool");
  const wound = partIn(spoolSpin, "wound");
  const mDrum = steel(0x5d646b);
  const mFlange = steel(0x858c93, { rough: 0.45 });
  const drumGeo = turnX(ringOf(0.72, SPOOL.core, -SPOOL.len / 2, SPOOL.len / 2));
  addMesh(spool, drumGeo, mDrum, { edgeOpacity: 0.5 });
  const flangeShape = () => disc(RW + 0.38, [hole(0, 0, 0.72), ...[0, 1, 2, 3].map((i) => sector(1.85, RW - 0.08, (i * 90 + 14) * (Math.PI / 180), (i * 90 + 76) * (Math.PI / 180)))]);
  const flangeGeo = [slab(flangeShape(), 0.3, -SPOOL.len / 2), slab(flangeShape(), 0.3, SPOOL.len / 2 + 0.3)];
  for (const geo of flangeGeo) addMesh(spool, geo, mFlange, { edgeOpacity: 0.6 });
  const mWound = woundMaterial();
  const woundGeo = turnX(ringOf(SPOOL.core, RW, -HALF, HALF), 72, { bevel: 0.04, round: 1 });
  addMesh(wound, woundGeo, mWound, { edges: false });
  const mSpoolGlass = glass(BRAND.ink, { base: 0.004, rim: 0.2, power: 2.4, edge: 0.35, spec: 0.45, through: 0.3 });
  const spoolGlassG = grp(spoolSpin);
  asShell([...flangeGeo, woundGeo].map((geo) => twin(spoolGlassG, geo, mSpoolGlass, 0.12)), 12);

  /* ══ THE STRAP ══ */
  const strap = partIn(root, "strap");
  const strapU = { uP0: { value: new THREE.Vector3(0, SY, RW) }, uP1: { value: new THREE.Vector3(...RETRACTOR.benchTop) }, uBelly: { value: 0 }, uLen: { value: 1 }, uRun: { value: 0 }, uLoad: { value: 0 }, uGlow: { value: SIGNAL.clone() } };
  const tailU = { uP0: { value: new THREE.Vector3() }, uP1: { value: new THREE.Vector3() }, uBelly: { value: 0 }, uLen: { value: 1 }, uRun: { value: 0 }, uLoad: { value: 0 }, uGlow: { value: SIGNAL.clone() } };
  const ribbon = (U) => {
    const mat = ribbonMaterial(U);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(BELT.width, 1, 1, 56), mat);
    mesh.frustumCulled = false;
    mesh.receiveShadow = true;
    strap.userData.part.mats.add(mat);
    strap.add(mesh);
    return mesh;
  };
  const strapMesh = ribbon(strapU);
  // on the bench: the roller it turns over, on a slim gallows standing well behind, and the tail hanging behind the roller
  const [, BY, BZ] = RETRACTOR.benchTop;
  const ROLL = { y: BY, z: BZ - 0.62, r: 0.5 };
  const tailMesh = ribbon(tailU);
  const mStitch = sinks(solid(0x8a877d, { rough: 0.9 }));
  const mSleeve = sinks(solid(WEAVE.color, { rough: 0.86 }));
  const stitch = addMesh(strap, box(BELT.width + 0.1, 0.7, 0.3, 0.08), mStitch, { edgeOpacity: 0.4 });
  const sleeve = addMesh(strap, lyingX(new THREE.CylinderGeometry(ROLL.r + 0.1, ROLL.r + 0.1, BELT.width, 28, 1, true)), mSleeve, { pos: [0, ROLL.y, ROLL.z], edges: false });
  const post = partIn(root, "post");
  const mPost = sinks(steel(0x4a5158, { rough: 0.5 }));
  const mPostDark = steel(0x3a4147);
  const POST_Z = -12.6;
  addMesh(post, lyingX(cyl(ROLL.r, BELT.width + 1.5, 0.06, 28)), sinks(steel(0x9aa1a7, { rough: 0.4 })), { pos: [0, ROLL.y, ROLL.z], edgeOpacity: 0.3 });
  for (const s of [-1, 1]) addMesh(post, box(0.28, 2.1, 1.7, 0.08), mPost, { pos: [s * (HALF + 0.62), ROLL.y + 0.25, ROLL.z], edgeOpacity: 0.3 });
  addMesh(post, box(BELT.width + 1.52, 0.3, 1.7, 0.08), mPost, { pos: [0, ROLL.y + 1.2, ROLL.z], edgeOpacity: 0.3 });
  addMesh(post, box(0.55, 0.55, ROLL.z - POST_Z, 0.1), mPost, { pos: [0, ROLL.y + 1.55, (ROLL.z + POST_Z) / 2], edgeOpacity: 0.3 });
  addMesh(post, cyl(0.34, ROLL.y + 1.85, 0.06, 20), mPost, { pos: [0, (ROLL.y + 1.85) / 2, POST_Z], edgeOpacity: 0.3 });
  addMesh(post, cyl(2.1, 0.4, 0.1, 40), mPostDark, { pos: [0, 0.2, POST_Z], edgeOpacity: 0.6 });

  /* ══ THE TORSION BAR ══ */
  const barG = grp(root, 0, SY, 0);
  const bar = partIn(barG, "bar");
  const barU = { uA0: { value: 0 }, uA1: { value: 0 }, uBarGlow: { value: 0 }, uBarHue: { value: VEILLE.clone() } };
  const mBar = barMaterial(barU);
  const barMesh = new THREE.Mesh(lyingX(new THREE.CylinderGeometry(BAR.r, BAR.r, 2 * MID, 40, 56, true)), mBar);
  barMesh.castShadow = barMesh.receiveShadow = true;
  bar.userData.part.mats.add(mBar);
  bar.userData.part.meshes.push(barMesh);
  bar.add(barMesh);
  const mHead = steel(0xc6cbcf, { rough: 0.4, metal: 0.35 });
  const headGeo = () => lyingX(cyl(0.95, 0.95, 0.09, 6));
  const headL = addMesh(bar, headGeo(), mHead, { pos: [-(MID + 0.475), 0, 0], edgeOpacity: 0.6 });
  const headR = addMesh(bar, headGeo(), mHead, { pos: [MID + 0.475, 0, 0], edgeOpacity: 0.6 });

  /* ══ THE EVERYDAY LOCK (−x end) ══ */
  const lockG = grp(root, LOCK.x, SY, 0);
  const lock = partIn(lockG, "lock");
  const pendulum = partIn(lockG, "pendulum");
  const mPlate = steel(0x363b40, { rough: 0.65 });
  const plateShape = shapeOf([[-3.4, -5.55], [3.5, -5.55], [3.5, 1.3], [2.2, 3.3], [-3.4, 3.3]], [hole(0, 0, 0.8)]);
  addMesh(lock, slab(plateShape, 0.2, -XC - FRAME.wall - LOCK.x), mPlate, { edgeOpacity: 0.6 });
  const wheelSpin = grp(lock);
  const mWheel = steel(0x8b9299, { rough: 0.42 });
  const wheelMesh = addMesh(lock, slab(shapeOf(ratchetOutline(TEETH, LOCK.wheel, LOCK.wheel - 0.5), [0, 1, 2, 3, 4].map((i) => hole(1.5 * Math.cos((i * TAU) / 5), 1.5 * Math.sin((i * TAU) / 5), 0.4))), 0.5, 0.25, 0.04), mWheel, { edgeOpacity: 0.75 });
  wheelSpin.add(wheelMesh);
  wheelSpin.add(addMesh(lock, lyingX(cyl(0.85, 0.9, 0.08, 28)), steel(0x6e757c), { edgeOpacity: 0.5 }));
  // the pawl: a strut pivoted in front, its tip under the wheel; it rests on the pendulum's cap
  const pawlG = grp(lock, 0, PAWL.pivot[0] - SY, PAWL.pivot[1]);
  const mPawl = steel(0xc4c9cd, { rough: 0.4, metal: 0.3 });
  pawlG.add(addMesh(lock, slab([[0.5, -0.42], [0.5, 0.42], [-1.9, 0.38], [-2.75, 0.62], [-3.2, 0.95], [-3.12, 0.3], [-2.4, -0.1], [-0.45, -0.1], [-0.2, -0.42]], 0.5, 0.25, 0.05), mPawl, { edgeOpacity: 0.7 }));
  addMesh(lock, lyingX(cyl(0.24, 1.5, 0.05, 16)), steel(0x4a5158), { pos: [0.3, PAWL.pivot[0] - SY, PAWL.pivot[1]], edgeOpacity: 0.5 });
  // the pendulum: a bob hanging under a cap seated in a cup — it tips, the cap's edge lifts the pawl
  const pendG = grp(pendulum, 0, PEND.pivot[0] - SY, PEND.pivot[1]);
  const mBob = steel(0xb4babf, { rough: 0.38, metal: 0.35 });
  pendG.add(addMesh(pendulum, cyl(0.95, 0.2, 0.05, 32), mBob, { pos: [0, 0.1, 0], edgeOpacity: 0.6 }));
  pendG.add(addMesh(pendulum, cyl(0.15, 0.55, 0.03, 12), mBob, { pos: [0, -0.25, 0], edges: false }));
  pendG.add(addMesh(pendulum, lathe([[0, -1.3], [0.46, -1.26], [0.64, -0.98], [0.56, -0.62], [0.26, -0.44], [0, -0.44]], 32, { bevel: 0.04, round: 2 }), mBob, { edgeOpacity: 0.55 }));
  const mCup = steel(0x4a5158);
  addMesh(pendulum, lathe(ringOf(0.32, 1.12, -0.2, -0.02), 32, { bevel: 0.04 }), mCup, { pos: [0, PEND.pivot[0] - SY, PEND.pivot[1]], edgeOpacity: 0.6 });
  addMesh(pendulum, box(1.3, 0.18, 0.9, 0.05), mCup, { pos: [0.62, PEND.pivot[0] - SY - 0.11, PEND.pivot[1] + 0.9], edgeOpacity: 0.5 });

  /* ══ THE PRETENSIONER (+x end): the turbine in its case ══ */
  const turbG = grp(root, TURBINE.x, SY, 0);
  const turbine = partIn(turbG, "turbine");
  const carter = partIn(turbG, "carter");
  const soot = partIn(turbG, "soot");
  const turbSpin = grp(turbine);
  const mBlade = steel(0xa2a9af, { rough: 0.4, metal: 0.35 });
  const HT = TURBINE.thick / 2;
  const blades = mergeGeometries(Array.from({ length: 10 }, (_, i) => slab(bucket((i * TAU) / 10), TURBINE.thick - 0.2, HT, 0.04)));
  turbSpin.add(addMesh(turbine, blades, mBlade, { edgeOpacity: 0.7 }));
  turbSpin.add(addMesh(turbine, turnX(ringOf(0.5, TURBINE.r - 0.04, -HT, -HT + 0.2)), mBlade, { edgeOpacity: 0.5 }));
  turbSpin.add(addMesh(turbine, lyingX(cyl(0.95, TURBINE.thick + 0.5, 0.08, 6)), steel(0x6e757c), { pos: [0.1, 0, 0], edgeOpacity: 0.6 }));
  const CASE = { r0: TURBINE.r + 0.14, r1: TURBINE.r + 0.4, a0: -HT - 0.3, a1: HT + 0.3 };
  const mCase = steel(0x585f66, { rough: 0.6 });
  const mCover = steel(0x6d747b, { rough: 0.5 });
  const caseGeo = [
    turnX(ringOf(CASE.r0, CASE.r1, CASE.a0, CASE.a1)), //            the band
    turnX(ringOf(1.1, CASE.r1, CASE.a0 - 0.25, CASE.a0)), //          its back, against the cheek
    turnX(ringOf(1.95, CASE.r1, CASE.a1, CASE.a1 + 0.22)), //         its cover: a ring — the buckets show
    box(2.0, 1.0, 3.1, 0.12).translate(0, CHARGE.at[1] - SY - CHARGE.r - 0.05, CHARGE.at[2]), // the generator's cradle
    lathe(ringOf(0.3, 0.68, 0, 0.75), 24, { bevel: 0.05 }).translate(0, 2.2, NOZZLE[4][2] + CHARGE.at[2]), // the inlet
  ];
  caseGeo.forEach((geo, i) => addMesh(carter, geo, i === 2 ? mCover : mCase, { edgeOpacity: 0.65 }));
  const mCaseGlass = glass(BRAND.ink, { base: 0.004, rim: 0.22, power: 2.6, edge: 0.4, spec: 0.45, through: 0.3 });
  const caseGlassG = grp(turbG);
  asShell(caseGeo.slice(0, 3).map((geo) => twin(caseGlassG, geo, mCaseGlass, 0.3)), 16);
  // what the burn leaves on the case, round the inlet
  const mSoot = solid(0x070808, { rough: 1, opacity: 0.92 });
  addMesh(soot, lathe(ringOf(0.3, 1.25, 0, 0.8), 24, { bevel: 0.2, round: 2 }).translate(0, 2.19, NOZZLE[4][2] + CHARGE.at[2]), mSoot, { edges: false });
  addMesh(soot, turnX(ringOf(1.95, CASE.r1 + 0.02, CASE.a1 + 0.2, CASE.a1 + 0.24), 48, { bevel: 0 }), mSoot, { edges: false });
  // the gas: a trail round the wheel behind a head of light
  const gasMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uHue: { value: VEILLE.clone() }, uHead: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue; uniform float uHead, uAmount; varying vec2 vUv;
      void main() {
        float psi = vUv.x * 6.2831853 - 1.5707963 - ${GAS.in.toFixed(3)}; // how far round from the inlet
        psi = mod(psi, 6.2831853);
        float lap0 = uHead - psi; //                  the head passed here this long ago (radians), on its first lap…
        float lap1 = lap0 - 6.2831853; //             …and on its second
        float glow = step(0.0, lap0) * exp(-max(lap0, 0.0) / 2.2) + step(0.0, lap1) * exp(-max(lap1, 0.0) / 2.2);
        gl_FragColor = vec4(uHue * (glow * uAmount * (0.35 + 0.65 * sin(3.14159265 * vUv.y))), 1.0);
      }`,
  });
  const gas = new THREE.Mesh(new THREE.TorusGeometry(GAS.r, 0.42, 10, 72).rotateY(Math.PI / 2), gasMat);
  gas.renderOrder = 4;
  gas.frustumCulled = false;
  gas.position.x = 0.4;
  turbG.add(gas);
  const gasBall = makeBall(new THREE.Color(0.85, 1, 0.92), VEILLE, 0, 0, 0);
  turbG.add(gasBall);

  /* ══ THE GAS GENERATOR ══ */
  const chargeG = grp(root, ...CHARGE.at);
  const charge = partIn(chargeG, "charge");
  const HL = CHARGE.len / 2;
  const R = CHARGE.r;
  const mBody = steel(0xa4abb1, { rough: 0.42, metal: 0.35 });
  const mBand = steel(0xd6dadd, { rough: 0.5, metal: 0.2 });
  const mNozzle = steel(0x7c838a, { rough: 0.45 });
  const mPlug = solid(0x16191b, { rough: 0.5, coat: 0.4 });
  const mWireA = solid(0x9da3a8, { rough: 0.6 });
  const mWireB = solid(0x4a5158, { rough: 0.6 });
  addMesh(charge, turnZ([[0, -HL], [R - 0.12, -HL], [R, -HL + 0.14], [R, -0.7], [R - 0.08, -0.6], [R - 0.08, -0.42], [R, -0.32], [R, HL - 0.5], [R - 0.3, HL], [0, HL]], 48, { bevel: 0.04, round: 2 }), mBody, { edgeOpacity: 0.6 });
  addMesh(charge, turnZ(ringOf(R - 0.02, R + 0.03, -0.1, 1.15), 48, { bevel: 0.02 }), mBand, { edgeOpacity: 0.45 });
  addMesh(charge, tubeAlong(NOZZLE, 0.42), mNozzle, { edges: false });
  addMesh(charge, box(1.5, 1.3, 1.1, 0.14), mPlug, { pos: [0, 0, -HL - 0.5], edgeOpacity: 0.6 });
  for (const s of [-1, 1]) addMesh(charge, tubeAlong([[s * 0.36, 0, -HL - 1.0], [s * 0.36, -0.25, -HL - 2.1], [s * 0.36, -2.3, -HL - 2.75], [s * 0.36, -6.4, -HL - 2.75]], 0.14, 8), s < 0 ? mWireA : mWireB, { edges: false });
  const chargeMats = [mBody, mBand, mNozzle].map((mat) => ({ mat, rest: mat.color.clone(), tint: mat.color.clone().multiply(TINT) }));
  const plugMats = [mPlug, mWireA, mWireB];
  const flash = makeBall(WHITE, INK, 0.3, -0.85, 3.85);
  const orderBall = makeBall(new THREE.Color(0.85, 1, 0.92), VEILLE, 0, 0.85, -HL - 0.5);
  chargeG.add(flash, orderBall);

  /* ── anchors: they follow their parts, exploded or not ── */
  const A = {
    frame: anchor(frameG, 0, FRAME.h, ZB),
    spool: anchor(root, 0, SY, RW),
    strap: anchor(root, 0, 18, RW),
    strapTop: anchor(root, ...RETRACTOR.benchTop),
    bar: anchor(barG, 0, 0, 0),
    ratchet: anchor(lockG, -0.3, 0, 0),
    pendulum: anchor(lockG, -0.3, LOCK.pendulum[1] - SY - 0.6, PEND.pivot[1]),
    turbine: anchor(turbG, HT + 0.5, 0, 0),
    charge: anchor(chargeG, 0, 0, 0),
  };

  /* ── what lights up when the voice names a part ── */
  const glowOf = (mat) => 0.11 * (1 - 0.85 * Math.min(1, 0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b));
  const lampOf = (...list) => {
    const mats = list.flatMap((part) => [...part.userData.part.mats]);
    const lines = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lines) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.glow = glowOf(mat);
    }
    return { solids, lines, on: -1 };
  };
  const lamps = { frame: lampOf(frame, cheeks), spool: lampOf(spool, wound, strap), turbine: lampOf(turbine, carter), bar: lampOf(bar), pendulum: lampOf(pendulum) };
  const light = (lamp, k, extra = 0) => {
    const key = k + extra * 7;
    if (lamp.on === key) return;
    lamp.on = key;
    for (const mat of lamp.solids) {
      mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k + extra);
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.7 * k);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };
  const bladeLamp = lampOf(turbine);
  const tmp = new THREE.Color();
  const P0 = strapU.uP0.value;
  const P1 = strapU.uP1.value;
  let wasBench = -1;
  let mainLen = 1;

  return {
    root, A,
    parts: { frame: frameG, spool: spoolSpin, strap, bar, lock: lockG, turbine: turbG, charge: chargeG },
    update(p = {}, time = 0, px = 1600) {
      const bench = (p.bench ?? 1) > 0.5;
      const k = clamp01(p.explode ?? 0);
      const slack = clamp01(p.slack ?? 1);
      const give = clamp01(p.give ?? 0);
      const load = clamp01((p.load ?? 0) / LIMIT);
      const fire = clamp01(p.fire ?? 0);
      const locked = clamp01(p.lock ?? 0);
      const tug = clamp01(p.tug ?? 0);
      const xray = clamp01(p.xray ?? 0);
      const ordered = smooth(ramp(p.order ?? 0, 0.9, 0.98));

      // ── where the strap ends
      if ((bench ? 1 : 0) !== wasBench) {
        wasBench = bench ? 1 : 0;
        const top = bench ? RETRACTOR.benchTop : RETRACTOR.top;
        P1.set(top[0], top[1], top[2]);
        mainLen = P0.distanceTo(P1);
        strapU.uLen.value = mainLen;
        A.strapTop.position.copy(P1);
        A.strap.position.copy(P0).lerp(P1, 0.5);
        post.visible = tailMesh.visible = stitch.visible = sleeve.visible = bench;
      }

      // ── the mechanism: how much strap is wound in since rest, and who has turned by how much
      const paid = TUG.free * tug * (1 - locked) + TUG.locked * Math.min(1, tug * 6) * locked;
      const taken = REEL.take * (1 - slack);
      const moved = taken - REEL.out * give - paid; //         cm of strap wound in
      const aLock = (taken - paid) / RW; //                     the ratchet wheel, and the bar's end it holds
      const aSpool = moved / RW; //                             the spool: winding in is a positive turn about x (its front goes down)
      spoolSpin.rotation.x = aSpool;
      wheelSpin.rotation.x = aLock + RATCHET_PHASE;
      turbSpin.rotation.x = (taken - REEL.out * give) / RW; //  clutched by the charge only: a hand's pull leaves it still
      barU.uA0.value = aLock;
      barU.uA1.value = aLock - (REEL.out * give * TWIST_GAIN) / RW;
      headL.rotation.x = aLock;
      headR.rotation.x = barU.uA1.value;
      pawlG.rotation.x = PAWL.turn * smooth(locked);
      pendG.rotation.x = PEND.tip * smooth(locked);

      // ── the strap: its belly, its weave running, its force
      const loose = slack * (1 - 0.25 * tug * locked);
      strapU.uBelly.value = (bench ? 2.7 : 2.2) * loose;
      strapU.uRun.value = moved;
      strapU.uLoad.value = tailU.uLoad.value = load;
      if (bench) {
        const tail = Math.max(1.6, TAIL0 - moved);
        const zt = ROLL.z - ROLL.r - 0.1;
        tailU.uP0.value.set(0, ROLL.y, zt);
        tailU.uP1.value.set(0, ROLL.y - tail, zt - 0.25);
        tailU.uLen.value = tail;
        tailU.uRun.value = moved + mainLen + 1.9;
        stitch.position.set(0, ROLL.y - tail - 0.3, zt - 0.26);
      }

      // ── the charge: the flash, the gas, what is left
      const up = ramp(fire, 0.07, 0.15);
      const down = 1 - ramp(fire, 0.15, 0.34);
      const flashing = up * down * down;
      setBall(flash, 0.95 * flashing, 1.0 + 2.3 * up * down, 20 * flashing);
      const gasOn = smooth(ramp(fire, 0.1, 0.3)) * (1 - smooth(ramp(fire, 0.72, 0.98)));
      const lap = smooth(ramp(fire, 0.22, 0.8)) * GAS.turns * TAU;
      gasMat.uniforms.uHead.value = lap;
      gasMat.uniforms.uAmount.value = 0.75 * gasOn * (1 - 0.6 * k);
      gas.visible = gasOn > 0.004;
      const psi = GAS.in + lap;
      gasBall.position.set(HT + 0.15, GAS.r * Math.cos(psi), GAS.r * Math.sin(psi));
      setBall(gasBall, 0.5 * gasOn, 1.3, 9 * gasOn);
      const burnt = smooth(ramp(fire, 0.14, 0.92));
      const litCharge = clamp01(p.litCharge ?? 0);
      for (const c of chargeMats) {
        c.mat.color.copy(c.rest).lerp(c.tint, 0.7 * litCharge).lerp(SOOT, 0.86 * burnt);
        c.mat.emissive.copy(VEILLE).multiplyScalar(0.05 * litCharge * (1 - burnt)).add(tmp.copy(WHITE).multiplyScalar((c.mat === mNozzle ? 0.6 : 0.16) * flashing));
      }
      mBody.roughness = 0.42 + 0.5 * burnt;
      setPartOpacity(soot, burnt * (1 - xray));
      for (const mat of plugMats) mat.emissive.copy(VEILLE).multiplyScalar((mat === mPlug ? 0.5 : 0.9) * ordered + 0.04 * litCharge);
      setBall(orderBall, 0.5 * ordered, 1.3, 8 * ordered);

      // ── the X-ray
      setPartOpacity(cheeks, 1 - xray);
      setPartOpacity(spool, 1 - xray);
      setPartOpacity(wound, 1 - xray);
      setPartOpacity(carter, 1 - xray);
      cheekGlassG.visible = spoolGlassG.visible = caseGlassG.visible = xray > 0.004;
      mCheekGlass.uniforms.uAmount.value = mSpoolGlass.uniforms.uAmount.value = mCaseGlass.uniforms.uAmount.value = xray;
      for (const line of glassLines) line.mat.opacity = line.weight * xray;

      // ── opened: a row along the axis. The pretensioner leaves by +x, the bar follows it out of the spool; the lock
      //    leaves by −x; the frame steps back off the spool, slides, and comes forward again
      turbG.position.x = TURBINE.x + OPEN.turbine * settle(ramp(k, 0, 0.5));
      turbG.rotation.y = OPEN.turbineTurn * settle(ramp(k, 0.4, 0.9));
      chargeG.position.set(CHARGE.at[0] + OPEN.turbine * settle(ramp(k, 0.05, 0.55)), CHARGE.at[1] + OPEN.chargeUp * settle(ramp(k, 0, 0.4)), CHARGE.at[2] + 1.2 * settle(ramp(k, 0.4, 0.9)));
      chargeG.rotation.y = OPEN.chargeTurn * settle(ramp(k, 0.4, 0.9));
      barG.position.x = OPEN.bar * settle(ramp(k, 0.2, 0.75));
      lockG.position.set(LOCK.x - 2.2 * trap(k, 0, 0.2, 0.45, 0.8) + OPEN.lock * settle(ramp(k, 0.4, 0.9)), SY + OPEN.lockUp * settle(ramp(k, 0.08, 0.6)), 0);
      lockG.rotation.y = OPEN.lockTurn * settle(ramp(k, 0.4, 0.9));
      frameG.position.set(OPEN.frame * settle(ramp(k, 0.4, 0.9)), 0, OPEN.frameBack * trap(k, 0.18, 0.42, 0.78, 1));

      // ── the part the voice names
      light(lamps.frame, clamp01(p.litFrame ?? 0));
      const litSpool = clamp01(p.litSpool ?? 0);
      light(lamps.spool, litSpool);
      light(lamps.bar, clamp01(p.litBar ?? 0));
      light(lamps.pendulum, clamp01(p.litPendulum ?? 0));
      const litTurbine = clamp01(p.litTurbine ?? 0);
      light(lamps.turbine, litTurbine);
      light(bladeLamp, litTurbine, 0.2 * gasOn); // the buckets take the gas's light
      barU.uBarGlow.value = Math.max(0.9 * smooth(give), 0.6 * clamp01(p.litBar ?? 0));
      mCheekGlass.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.4 * clamp01(p.litFrame ?? 0));
      mSpoolGlass.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.4 * litSpool);
      mCaseGlass.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.4 * litTurbine);
    },
  };
}
