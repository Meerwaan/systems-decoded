// DOSSIER 020 — Taipei 101 : the system. The tuned mass damper as ONE object, at TRUE scale (only its cables are
// shortened: plan.js). Its root's origin: the middle of the cage's floor, right under the ball at rest.
//   · THE BALL — 41 steel plates stacked into a sphere of 5.50 m. Its strata SHOW: every plate is a disc with its own
//     chant, the stack is a staircase at the poles and a banded drum at the equator; the seams and the bright fillet
//     next to them are drawn in the shader and melt into their mean once a plate is too small to count
//   · the cradle under it, its four arms and yokes (where the cables end), the pin that hangs from it
//   · the bumper ring round the pin, on four legs: 150 cm of play — THE gauge of the film
//   · eight dampers, in pairs on the axes: a dark body standing on the floor, a bright rod coming down from the cradle.
//     Their length is real: the one the ball runs at shortens, the one it leaves stretches
//   · eight legs of cable (92 strands: 4 legs of 12, 4 of 11), each a flat band of strands, from the yokes to the mounts
//   · what carries it, in glass (it is a piece of the tower): a floor, four posts, the frame the cables hang from
// The ball, the cradle and the pin hang as a parallelogram: they travel WITHOUT turning.
// Three values of grey: cradle, damper bodies, mounts dark · ring, cables, pin in between · the ball and the rods clear.
// Light: VEILLE is the system alive (the cables pulling, the damper that brakes, what the voice names) · SIGNAL the
// course that nears the bumper (the ring's near side, the play that is left) · INK the ball's rest (the datum).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, edgesOf, fatLine, makePart, addMesh, setPartOpacity, setGlow, anchor, box, cyl, lathe, placed, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { BALL, CRADLE, PIN, RING, DAMPERS, CABLES, FRAME, COURSE } from "./plan.js";

const DEG = Math.PI / 180;
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const WHITE = new THREE.Color(1, 1, 1);
const PALE = VEILLE.clone().lerp(WHITE, 0.55); // what the dampers have swallowed: warm oil, not a lamp
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);
const glsl3 = (c) => `vec3(${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)})`;
const f1 = (x) => x.toFixed(1);
const f3 = (x) => x.toFixed(3);
const H2 = (BRAND.H / 2).toFixed(1);

/* ─────────────────────────────────────────────────────────── where everything is */

const [BX, BY, BZ] = BALL.at;
const R = BALL.r;
const PITCH = (2 * R) / BALL.plates; //        a plate and its seam: 13.4 cm
const MID = (BALL.plates - 1) / 2; //          the middle plate's index
const GAP = 2.4; //                            cm between two plates, apart (`plates` 1): the stack grows upward, by 96 cm — the sphere still reads
const BODY = { y0: 14, len: 245 }; //          a damper's cylinder, along its own axis from the foot
const ROD = 275; //                            its rod, down from the head
const LEG = { w: 26, t: 16 }; //               a leg of cable: a band of strands, 4 across and 3 deep
const L0 = Math.hypot(CABLES.mountY - CABLES.lugY, 2 * CABLES.mountR * Math.sin((CABLES.split * DEG) / 2)); // a leg's length
const RINGR = RING.inner + RING.tube; //       the ring's own circle
// The exploded view (the bench, one vertical frame): the frame and the cables go up and the legs fan out, the ball
// rises off its cradle, the cradle off the dampers; the dampers step back in a star; the ring comes down and widens.
const OPEN = { top: 120, ball: 200, cradle: 70, out: 150, drop: 36, fan: 130, wide: 85, down: 46 };
/** The screen's band where the header stands (0 bottom → 1 top): what climbs toward it melts into the dark first. */
const HEADER = [0.752, 0.794];

/* ─────────────────────────────────────────────────────────── geometry */

/** The 41 plates as one geometry: each a disc with its chant and its two faces. `aPlate`: its index from the middle one, `aH`: 0 at its foot → 1 at its top. */
function stackGeometry(N = 96) {
  const n = BALL.plates;
  const radius = (i) => {
    const y = -R + (i + 0.5) * PITCH;
    return Math.sqrt(Math.max(1, R * R - y * y));
  };
  const pos = [];
  const nor = [];
  const plate = [];
  const high = [];
  const cover = [];
  const index = [];
  const ring = (r, y, nx, ny, k, h, hidden = 0) => {
    const start = pos.length / 3;
    for (let j = 0; j <= N; j++) {
      const a = (j / N) * Math.PI * 2;
      pos.push(r * Math.cos(a), y, r * Math.sin(a));
      nor.push(nx * Math.cos(a), ny, nx * Math.sin(a));
      plate.push(k);
      high.push(h);
      cover.push(hidden);
    }
    return start;
  };
  const band = (a, b) => {
    for (let j = 0; j < N; j++) index.push(a + j, b + j, a + j + 1, a + j + 1, b + j, b + j + 1);
  };
  for (let i = 0; i < n; i++) {
    const r = radius(i);
    const y0 = -R + i * PITCH;
    const y1 = y0 + PITCH;
    const k = i - MID;
    band(ring(r, y0, 1, 0, k, 0), ring(r, y1, 1, 0, k, 1)); // its chant
    const up = i < n - 1 ? Math.max(0, radius(i + 1) - 26) : 0; // what the next plate covers of it is not drawn (but for a rim, seen through the gaps)
    const down = i > 0 ? Math.max(0, radius(i - 1) - 26) : 0;
    band(ring(r, y1, 0, 1, k, 1, up), ring(0, y1, 0, 1, k, 1, up)); // its top
    band(ring(0, y0, 0, -1, k, 0, down), ring(r, y0, 0, -1, k, 0, down)); // its underside
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("aPlate", new THREE.Float32BufferAttribute(plate, 1));
  geo.setAttribute("aH", new THREE.Float32BufferAttribute(high, 1));
  geo.setAttribute("aCover", new THREE.Float32BufferAttribute(cover, 1));
  geo.setIndex(index);
  geo.computeBoundingSphere();
  geo.boundingSphere.radius += GAP * BALL.plates;
  return geo;
}

const circle = (r, y, n = 72, cx = 0, cz = 0) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((i / n) * Math.PI * 2), y, cz + r * Math.sin((i / n) * Math.PI * 2)]);

/** `count` squares that always face the eye: the shader stands each where its seed says. */
function sprites(count, seed, per) {
  const rand = rng(seed);
  const corner = [];
  const seeds = [];
  const index = [];
  for (let i = 0; i < count; i++) {
    const s = [((i % per) + rand() * 0.5) / per, Math.floor(i / per), rand(), rand()]; // a phase, spread evenly · whose it is · two numbers
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

/* ─────────────────────────────────────────────────────────── matter that is drawn */

/**
 * A lit solid of the house whose colour and light also depend on where the fragment stands in the part's own frame
 * (`oP`, `oN`). `key`: a name of its own. `move`: what the vertex does before it is placed; `end`: the last word on the colour.
 */
function patterned(mat, key, uniforms, { decl = "", colour = "", light = "", attr = "", pass = "", move = "", end = "" }) {
  mat.userData.U = uniforms;
  mat.customProgramCacheKey = () => key;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 oP; varying vec3 oN; ${attr}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\noP = position; oN = normal; ${pass}\n${move}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 oP; varying vec3 oN; ${decl}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n{ ${colour} }`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n{ ${light} }`)
      .replace("#include <dithering_fragment>", `#include <dithering_fragment>\n{ ${end} }`);
  };
  return mat;
}

/** The ball's strata: a dark seam where two plates meet, a bright fillet above it and a shaded one under it, each plate its own grey. */
const SEAM = 0.05; //   half a seam, in plates
const FILLET = 0.11; // the broken edge next to it
const STRATA = {
  attr: /* glsl */ `attribute float aPlate; attribute float aH; attribute float aCover; uniform float uGap; varying float oH; varying float oK; varying float oCover;`,
  pass: /* glsl */ `oH = aH; oK = aPlate; oCover = aCover;`,
  move: /* glsl */ `transformed.y += uGap * (aPlate + ${f1(MID)});`,
  decl: /* glsl */ `uniform float uLit; varying float oH; varying float oK; varying float oCover; float gSeam;`,
  colour: /* glsl */ `
    if (length(oP.xz) < oCover) discard;
    float chant = 1.0 - smoothstep(0.3, 0.7, abs(oN.y));
    float w = clamp(fwidth(oH) * 1.2, 0.002, 0.5); // what a pixel covers of a plate's height
    float melt = smoothstep(0.14, 0.42, w); //         a plate under three pixels: its detail melts into its mean
    float e = min(oH, 1.0 - oH);
    float seam = 1.0 - smoothstep(${f3(SEAM)}, ${f3(SEAM)} + w, e);
    seam = mix(seam, ${f3(2 * SEAM)}, melt) * chant;
    float fillet = smoothstep(${f3(SEAM)}, ${f3(SEAM)} + w, e) * (1.0 - smoothstep(${f3(SEAM + FILLET)}, ${f3(SEAM + FILLET)} + w, e));
    float lip = fillet * mix(-0.28, 0.62, smoothstep(0.4, 0.6, oH)); // its top edge catches the key, its foot is in its own shade
    lip = mix(lip, ${f3(2 * FILLET * 0.17)}, melt) * chant;
    float tone = 0.93 + 0.14 * fract(sin(oK * 12.9898 + 4.1) * 43758.5453); // no two plates were rolled alike
    diffuseColor.rgb *= tone * (1.0 - 0.8 * seam) * (1.0 + lip) * mix(0.8, 1.0, chant);
    gSeam = seam;`,
  light: /* glsl */ `totalEmissiveRadiance += ${glsl3(VEILLE)} * uLit * (0.035 + 0.3 * gSeam);`,
};

/** A leg of cable: its strands side by side (grooves along it), the head of light that climbs it, and its melting into the dark under the header. */
const STRANDS = {
  decl: /* glsl */ `uniform float uPull, uOn, uLit, uFade; float gPull;`,
  colour: /* glsl */ `
    float wide = step(0.5, abs(oN.z));
    float q = mix((oP.z + ${f1(LEG.t / 2)}) / ${f3(LEG.t / 3)}, (oP.x + ${f1(LEG.w / 2)}) / ${f3(LEG.w / 4)}, wide);
    float w = clamp(fwidth(q) * 1.4, 0.004, 0.5);
    float fr = fract(q);
    float groove = 1.0 - smoothstep(0.0, 0.13 + w, min(fr, 1.0 - fr));
    groove = mix(groove, 0.3, smoothstep(0.15, 0.45, w));
    diffuseColor.rgb *= 1.0 - 0.5 * groove;
    float u = 1.0 + oP.y / ${f1(L0)}; // 0 at the cradle → 1 at the mount
    float dh = (u - uPull) / 0.04;
    float behind = 1.0 - smoothstep(uPull - 0.01, uPull + 0.01, u);
    gPull = uOn * (1.5 * exp(-dh * dh) + behind * (0.2 + 0.5 * exp(-max(uPull - u, 0.0) / 0.2)));`,
  light: /* glsl */ `totalEmissiveRadiance += ${glsl3(VEILLE)} * (0.6 * gPull + 0.14 * uLit);`,
  end: /* glsl */ `gl_FragColor.rgb *= 1.0 - uFade * smoothstep(${f3(HEADER[0])}, ${f3(HEADER[1])}, gl_FragCoord.y / ${f1(BRAND.H)});`,
};

/** The bumper ring: `uWide` opens it (the exploded view); `uHot`, the side the pin nears, signal. */
const BUMPER = {
  attr: /* glsl */ `uniform float uWide;`,
  move: /* glsl */ `transformed.xz += normalize(position.xz) * uWide;`,
  decl: /* glsl */ `uniform float uHot, uSide, uWarm, uLit; float gHot;`,
  colour: /* glsl */ `
    float toward = clamp(normalize(oP.xz).x * uSide, 0.0, 1.0);
    gHot = uWarm + uHot * toward * toward * toward;
    diffuseColor.rgb *= mix(vec3(1.0), vec3(1.0, 0.5, 0.36), clamp(0.85 * gHot, 0.0, 1.0));`,
  light: /* glsl */ `totalEmissiveRadiance += ${glsl3(SIGNAL)} * (0.95 * gHot) + ${glsl3(VEILLE)} * (0.22 * uLit);`,
};

/** What climbs toward the header melts into the dark before it reaches it (the frame is 1080 × 1920: the kit's lines count on it too). */
const MELT = `(1.0 - smoothstep(${f3(HEADER[0])}, ${f3(HEADER[1])}, gl_FragCoord.y / ${f1(BRAND.H)}))`;
/** …and so do the edge lines drawn on it. */
const melting = (line) => {
  line.material.customProgramCacheKey = () => "020-melting-line";
  line.material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace("#include <fog_fragment>", `gl_FragColor.a *= ${MELT};\n#include <fog_fragment>`);
  };
  return line;
};
/** A damper's cylinder: what it gives off shows in its heart (where it faces the eye), not as a coat of paint. */
const WARM = {
  decl: /* glsl */ `uniform vec3 uGlow;`,
  light: /* glsl */ `float facing = clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0); totalEmissiveRadiance += uGlow * (0.1 + 0.9 * facing * facing * facing);`,
};

/* ─────────────────────────────────────────────────────────── light that has a place */

const lightMaterial = (uniforms, vertexShader, fragmentShader, o = {}) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms, vertexShader, fragmentShader, ...o });
const lightMesh = (geometry, material, order = 4) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
};
const SQUARE = new THREE.PlaneGeometry(2, 2);

/** A ball of light with no edge, always facing the eye: a small hot heart, a soft body, a long tail. `uRadius` cm, never under `uMinPx` pixels. */
function makeBall(heart, hue) {
  const mesh = lightMesh(
    SQUARE,
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
        gl_FragColor = vec4((uHeart * (core * 2.2) + uHue * (body + tail)) * uAmount, 1.0);
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

/** What the dampers have swallowed: slow puffs of pale light that rise off each cylinder, swell and thin out. Periodic: alive from the first frame. */
const HAZE_PER = 4;
const hazeMaterial = (U) =>
  lightMaterial(
    U,
    /* glsl */ `
    uniform vec3 uAt[8]; uniform float uTime;
    attribute vec2 aCorner; attribute vec4 aSeed; varying vec2 vUv; varying float vA;
    void main() {
      int who = int(aSeed.y + 0.5);
      float ph = fract(aSeed.x + uTime * 0.06 * (0.8 + 0.4 * aSeed.z));
      vec3 p = uAt[who] + vec3((aSeed.z - 0.5) * 40.0, 22.0 + ph * 170.0, (aSeed.w - 0.5) * 40.0);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      mv.xy += aCorner * (26.0 + 54.0 * ph);
      vUv = aCorner;
      vA = smoothstep(0.0, 0.22, ph) * (1.0 - smoothstep(0.45, 1.0, ph));
      gl_Position = projectionMatrix * mv;
    }`,
    /* glsl */ `
    uniform float uAmount; varying vec2 vUv; varying float vA;
    void main() {
      float r2 = dot(vUv, vUv);
      float a = exp(-r2 * 3.2) * (1.0 - smoothstep(0.6, 1.0, sqrt(r2)));
      gl_FragColor = vec4(${glsl3(PALE)} * (0.2 * a * vA * uAmount), 1.0);
    }`,
  );

/* ─────────────────────────────────────────────────────────── the system */

/**
 * → { root, A, parts, update(P, time, px) }. `root`: its origin is the middle of the cage's floor (world.js stands it
 * in the tower's cage, or on the bench). `A`: anchors that follow their parts, opened or not.
 * P (see FIRST in world.js):
 *   bench     1: on the bench — the glass that carries it is drawn in full; in the tower, where the tower doubles it, at half
 *   course    the ball's course along x, true cm, signed (−150 … 150): ball, cradle and pin travel without turning (and
 *             rise, as a pendulum does), the cables lean, the dampers lengthen and shorten
 *   vel       its speed, signed, 1 = the fastest a full course gives: what `brake` is dosed by
 *   explode   0 → 1 (the bench): see OPEN
 *   plates    the 41 plates part: the stack grows upward, a pile of floating discs
 *   xray      the ball and its cradle turn to glass where they stand: the pin, the ring, the dampers show
 *   pull      a head of veille light climbing each leg, from the yokes (0) to the mounts (1); what it has passed stays lit
 *   brake     the damper the ball runs at glows veille, by the speed it is closed at
 *   heat      the cylinders warm (a pale light), slow puffs rise off them
 *   lock      veille collars close on the rods
 *   limit     the ring drawn hot: signal on the side the pin nears, by how near — and the play that is left, a signal bar from pin to ring
 *   datum     the ball's rest, ink: a circle the pin's size and a cross, at the ring's centre
 *   litBall, litCables, litDampers, litRing   0–1: the part the voice is naming glows faintly veille
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
  /** A mesh of `part` (its materials, its shadows) that lives in `group`. */
  const piece = (part, group, geometry, material, o = {}) => {
    const mesh = addMesh(part, geometry, material, o);
    group.add(mesh);
    return mesh;
  };
  const ghostOf = (parent, shape, o = {}) => {
    const mat = glass(BRAND.ink, { base: 0.012, rim: 0.3, power: 2.4, edge: 0.45, spec: 0.5, through: 0.22, ...o });
    const mesh = new THREE.Mesh(shape, mat);
    mesh.visible = false;
    parent.add(mesh);
    return { mesh, mat, lines: [] };
  };
  const see = (ghost, amount) => {
    ghost.mesh.visible = amount > 0.004;
    ghost.mat.uniforms.uAmount.value = amount;
    for (let i = 0; i < ghost.lines.length; i++) ghost.lines[i].material.opacity = ghost.lines[i].material.userData.base * amount;
  };

  const swung = grp(); //        what swings: ball, cradle, pin
  const ballG = grp(swung);
  const cradleG = grp(swung);

  /* ══ THE BALL: 41 plates ══ */
  const ball = partIn(ballG, "ball");
  const BU = { uGap: { value: 0 }, uLit: { value: 0 } };
  const ballMat = patterned(solid(0xbec3c8, { rough: 0.56, metal: 0.3 }), "020-strata", BU, STRATA);
  const stack = addMesh(ball, stackGeometry(), ballMat, { edges: false });
  stack.position.set(BX, BY, BZ);
  // apart, a gap seen dead level would show right through the pile: a dark heart, well inside the rims, closes it
  const core = new THREE.Mesh(new THREE.SphereGeometry(R - 30, 40, 24), new THREE.MeshBasicMaterial({ color: 0x0b0d10 }));
  core.visible = false;
  ballG.add(core);
  const sphere = Array.from({ length: 49 }, (_, i) => [Math.max(0.01, R * Math.sin((i / 48) * Math.PI)), -R * Math.cos((i / 48) * Math.PI)]);
  const ballGhost = ghostOf(ballG, lathe(sphere, 96));
  ballGhost.mesh.position.set(BX, BY, BZ);
  for (const k of [-15, -8, 0, 8, 15]) {
    // a few of its seams stay, in glass: it is still a pile of plates
    const y = (k + 0.5) * PITCH;
    const line = fatLine(circle(Math.sqrt(R * R - y * y), y, 96), { color: BRAND.ink, width: 1.8, opacity: 0.3 });
    ballGhost.mesh.add(line);
    ballGhost.lines.push(line);
  }

  /* ══ THE CRADLE, its arms and yokes; THE PIN ══ */
  const cradle = partIn(cradleG, "cradle");
  const CY0 = CRADLE.y;
  const CY1 = CRADLE.y + CRADLE.h;
  const dish = lathe([[42, CY0], [CRADLE.r - 12, CY0], [CRADLE.r, CY0 + 12], [CRADLE.r, CY1], [CRADLE.r - 26, CY1], [CRADLE.r - 62, CY0 + 20], [42, CY0 + 20], [42, CY0]], 72, { bevel: 1.6, round: 1 });
  const arms = [];
  const yokeR = CABLES.lugR * Math.cos(CABLES.split * DEG);
  const yokeHalf = CABLES.lugR * Math.sin(CABLES.split * DEG);
  for (const deg of CABLES.at) {
    const a = deg * DEG;
    const at = (r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
    arms.push(placed(box(yokeR - CRADLE.r + 34, 28, 46, 3), { pos: at((yokeR + CRADLE.r - 20) / 2, CY0 + 16), rotY: -a }));
    arms.push(placed(box(36, 34, 2 * yokeHalf + 44, 4), { pos: at(yokeR, CY0 + 18), rotY: -a }));
    for (const s of [-1, 1]) arms.push(placed(cyl(15, 14, 2, 24), { pos: [Math.cos(a + s * CABLES.split * DEG) * CABLES.lugR, CABLES.lugY - 7, Math.sin(a + s * CABLES.split * DEG) * CABLES.lugR] }));
  }
  const cradleMat = solid(0x454b52, { rough: 0.62, metal: 0.3 });
  const yokeMat = solid(0x565c63, { rough: 0.55, metal: 0.35 });
  addMesh(cradle, dish, cradleMat, { edgeOpacity: 0.5 });
  const armShape = mergeGeometries(arms);
  addMesh(cradle, armShape, yokeMat, { edgeOpacity: 0.42 });
  const cradleGhost = ghostOf(cradleG, mergeGeometries([dish, armShape]), { spec: 0.3 });
  {
    const line = edgesOf(mergeGeometries([dish, armShape]), { color: BRAND.ink, width: 1.8, opacity: 0.32 });
    line.material.userData.base = 0.32;
    cradleGhost.mesh.add(line);
    cradleGhost.lines.push(line);
  }
  asShell([ballGhost.mesh, cradleGhost.mesh], 12);

  const pin = partIn(cradleG, "pin");
  const pinMat = solid(0xa4abb2, { rough: 0.38, metal: 0.45 });
  addMesh(pin, cyl(PIN.r, PIN.y1 - PIN.y0, 3, 48).translate(0, (PIN.y0 + PIN.y1) / 2, 0), pinMat, { edgeOpacity: 0.5 });
  // the sleeve that would meet the ring
  addMesh(pin, lathe([[PIN.r, RING.y - 22], [PIN.r + 6, RING.y - 22], [PIN.r + 6, RING.y + 22], [PIN.r, RING.y + 22]], 48, { bevel: 1.5, round: 1 }), solid(0x6d747b, { rough: 0.6, metal: 0.3 }), { edgeOpacity: 0.45 });

  /* ══ THE BUMPER RING, on four legs ══ */
  const ringG = grp();
  const ring = partIn(ringG, "ring");
  const T = RING.tube;
  const C = T * 0.45; // an eight-sided section: every facet is a band of light
  const RU = { uWide: { value: 0 }, uHot: { value: 0 }, uSide: { value: 0 }, uWarm: { value: 0 }, uLit: { value: 0 } };
  const ringMat = patterned(solid(0x7a8189, { rough: 0.48, metal: 0.4 }), "020-bumper", RU, BUMPER);
  addMesh(
    ring,
    lathe([[RINGR - T, RING.y - T + C], [RINGR - T + C, RING.y - T], [RINGR + T - C, RING.y - T], [RINGR + T, RING.y - T + C], [RINGR + T, RING.y + T - C], [RINGR + T - C, RING.y + T], [RINGR - T + C, RING.y + T], [RINGR - T, RING.y + T - C], [RINGR - T, RING.y - T + C]], 96, { crease: 30 }),
    ringMat,
    { edges: false },
  );
  const legMat = solid(0x4a5057, { rough: 0.6, metal: 0.3 });
  const LEGH = RING.y - T - 8;
  const legs = Array.from({ length: RING.legs }, (_, i) => {
    const a = (45 + (360 / RING.legs) * i) * DEG;
    const g = grp(ringG);
    g.rotation.y = -a;
    g.userData.dir = [Math.cos(a), Math.sin(a)];
    piece(ring, g, mergeGeometries([box(16, LEGH, 22, 2).translate(0, LEGH / 2, 0), box(30, 8, 44, 2).translate(0, LEGH - 2, 0)]), legMat, { edgeOpacity: 0.4 });
    return g;
  });
  const feet = Array.from({ length: RING.legs }, () => piece(ring, root, box(46, 8, 46, 2), legMat, { edgeOpacity: 0.35 }));
  // the play that is left, pin to ring: a bar of signal light — and a light where they would meet
  const gapMat = glow(BRAND.signal, 2);
  const gapBar = new THREE.Mesh(new THREE.BoxGeometry(1, 5, 5), gapMat);
  gapBar.renderOrder = 5;
  ringG.add(gapBar);
  const nearBall = makeBall(new THREE.Color(1, 0.86, 0.7), SIGNAL);
  ringG.add(nearBall);
  // the ball's rest: a circle the pin's size, a cross
  const datum = grp(ringG);
  const datumLines = [
    fatLine(circle(PIN.r + 10, RING.y, 64), { color: BRAND.ink, width: 2.4, opacity: 0.9 }),
    fatLine([[-RING.inner + 14, RING.y, 0], [RING.inner - 14, RING.y, 0]], { color: BRAND.ink, width: 2, opacity: 0.55 }),
    fatLine([[0, RING.y, -RING.inner + 14], [0, RING.y, RING.inner - 14]], { color: BRAND.ink, width: 2, opacity: 0.55 }),
  ];
  for (const line of datumLines) datum.add(line);

  /* ══ THE EIGHT DAMPERS ══ */
  const dampers = partIn(root, "dampers");
  const rodMat = solid(0xcfd4d8, { rough: 0.3, metal: 0.5 });
  const glandMat = solid(0x8a9198, { rough: 0.45, metal: 0.4 });
  const baseMat = solid(0x3a4046, { rough: 0.7, metal: 0.2 });
  const collarMat = glow(BRAND.veille, 2);
  dampers.userData.part.mats.add(collarMat);
  const bodyShape = mergeGeometries([
    cyl(DAMPERS.body, BODY.len, 2, 32).translate(0, BODY.y0 + BODY.len / 2, 0),
    cyl(DAMPERS.body + 3, 9, 1.5, 32).translate(0, BODY.y0 + 52, 0),
    cyl(DAMPERS.body + 3, 9, 1.5, 32).translate(0, BODY.y0 + 150, 0),
    new THREE.SphereGeometry(19, 20, 12).toNonIndexed(),
  ]);
  const glandShape = cyl(DAMPERS.body + 2.5, 16, 2, 32).translate(0, BODY.y0 + BODY.len - 2, 0);
  const rodShape = mergeGeometries([cyl(DAMPERS.rod, ROD, 1, 20).translate(0, -ROD / 2, 0), new THREE.SphereGeometry(16, 20, 12).toNonIndexed()]);
  const collarShape = lathe([[DAMPERS.rod + 1, -8], [DAMPERS.rod + 9, -8], [DAMPERS.rod + 9, 8], [DAMPERS.rod + 1, 8], [DAMPERS.rod + 1, -8]], 28, { bevel: 1.5, round: 1 });
  const DAMP = [];
  for (const deg of DAMPERS.at) {
    for (const s of [-1, 1]) {
      const a = (deg + s * DAMPERS.spread) * DEG;
      const cx = Math.cos(a);
      const cz = Math.sin(a);
      const group = grp(dampers);
      const glowing = { uGlow: { value: new THREE.Color(0, 0, 0) } };
      const bodyMat = patterned(solid(0x3f454c, { rough: 0.5, metal: 0.4 }), "020-damper", glowing, WARM);
      piece(dampers, group, bodyShape, bodyMat, { edgeOpacity: 0.42 });
      piece(dampers, group, glandShape, glandMat, { edgeOpacity: 0.4 });
      const rod = piece(dampers, group, rodShape, rodMat, { edgeOpacity: 0.3 });
      const collar = new THREE.Mesh(collarShape, collarMat);
      collar.position.y = BODY.y0 + BODY.len + 22;
      collar.visible = false;
      group.add(collar);
      const base = piece(dampers, dampers, box(58, 14, 58, 3), baseMat, { edgeOpacity: 0.35 });
      const lamp = makeBall(new THREE.Color(0.86, 1, 0.92), VEILLE);
      lamp.position.y = BODY.y0 + BODY.len + 8;
      group.add(lamp);
      DAMP.push({ cx, cz, fx: cx * DAMPERS.foot, fz: cz * DAMPERS.foot, hx: cx * DAMPERS.head, hz: cz * DAMPERS.head, group, rod, collar, base, lamp, glowing: glowing.uGlow.value });
    }
  }
  const HZ = { uAt: { value: Array.from({ length: 8 }, () => new THREE.Vector3()) }, uTime: { value: 0 }, uAmount: { value: 0 } };
  const haze = lightMesh(sprites(DAMPERS.n * HAZE_PER, 20, HAZE_PER), hazeMaterial(HZ), 7);
  haze.visible = false;
  root.add(haze);

  /* ══ THE 92 CABLES, as eight legs — and what they hang from ══ */
  const cables = partIn(root, "cables");
  const KU = { uPull: { value: 0 }, uOn: { value: 0 }, uLit: { value: 0 }, uFade: { value: 1 } };
  const cableMat = patterned(solid(0x8d949b, { rough: 0.55, metal: 0.4 }), "020-strands", KU, STRANDS);
  const mountMat = patterned(solid(0x40464d, { rough: 0.6, metal: 0.3 }), "020-mounts", KU, { decl: /* glsl */ `uniform float uFade;`, end: STRANDS.end });
  const legShape = box(LEG.w, L0, LEG.t, 2.5).translate(0, -L0 / 2, 0);
  const CAB = [];
  const mountsG = grp(cables);
  for (const deg of CABLES.at) {
    const m = deg * DEG;
    const mx = Math.cos(m) * CABLES.mountR;
    const mz = Math.sin(m) * CABLES.mountR;
    const saddle = piece(cables, mountsG, mergeGeometries([box(64, 26, 150, 4).translate(0, 15, 0), cyl(17, 150, 2, 24).rotateX(Math.PI / 2)]), mountMat, { edgeOpacity: 0.4 });
    saddle.position.set(mx, CABLES.mountY, mz);
    saddle.rotation.y = -m;
    saddle.castShadow = false;
    saddle.children.forEach(melting);
    for (const s of [-1, 1]) {
      const a = (deg + s * CABLES.split) * DEG;
      const group = grp(cables);
      const mesh = piece(cables, group, legShape, cableMat, { edgeOpacity: 0.28 });
      mesh.children.forEach(melting);
      mesh.castShadow = false; // eight bars of shade across the ball would strike its strata out
      const lamp = makeBall(new THREE.Color(0.86, 1, 0.92), VEILLE);
      root.add(lamp);
      CAB.push({ mx, mz, rx: Math.cos(m), rz: Math.sin(m), lx: Math.cos(a) * CABLES.lugR, lz: Math.sin(a) * CABLES.lugR, ox: Math.cos(a), oz: Math.sin(a), group, lamp });
    }
  }
  cables.userData.part.meshes.length = 0; // (none of them casts: see above)

  /* ══ WHAT CARRIES IT, in glass: the floor, four posts, the frame ══ */
  const frame = partIn(root, "frame");
  const topG = grp(frame);
  const melt = (mat) => {
    mat.fragmentShader = mat.fragmentShader.replace("gl_FragColor = vec4(uColor * light * uAmount * uGain, 1.0);", `gl_FragColor = vec4(uColor * light * uAmount * uGain * ${MELT}, 1.0);`);
    return mat;
  };
  const frameGlass = melt(glass(BRAND.ink, { base: 0.012, rim: 0.22, power: 2.4, edge: 0.4, spec: 0.3, through: 0.2 }));
  // a floor seen at a grazing angle is all rim: a milky plate. It keeps its outline, and a breath of glass
  const floorGlass = glass(BRAND.ink, { base: 0.003, rim: 0.035, power: 3, edge: 0.05 });
  const frameLines = [];
  const postGlass = melt(glass(BRAND.ink, { base: 0.004, rim: 0.1, power: 2.6, edge: 0.14 })); // one post stands between the camera and the ball: a breath of glass
  const pane = (parent, shape, mat = frameGlass, opacity = 0.34) => {
    const mesh = new THREE.Mesh(shape, mat);
    const line = melting(edgesOf(shape, { color: BRAND.ink, width: 1.8, opacity }));
    mesh.add(line);
    frameLines.push(line);
    parent.add(mesh);
    return mesh;
  };
  const floor = pane(frame, lathe([[0, 2], [FRAME.floor, 2], [FRAME.floor, 8], [0, 8]], 96, { bevel: 1, round: 1 }), floorGlass);
  const BEAM = 32;
  const side = FRAME.post * Math.SQRT1_2;
  const beamY = FRAME.top - BEAM / 2;
  const posts = pane(topG, mergeGeometries(CABLES.at.map((deg) => placed(box(34, FRAME.top - 8 - BEAM, 34, 3), { pos: [Math.cos(deg * DEG) * FRAME.post, 8 + (FRAME.top - 8 - BEAM) / 2, Math.sin(deg * DEG) * FRAME.post], rotY: -deg * DEG }))), postGlass, 0.16);
  const carry = pane(
    topG,
    mergeGeometries([
      ...[-1, 1].flatMap((s) => [box(2 * side + 34, BEAM, 34, 3).translate(0, beamY, s * side), box(34, BEAM, 2 * side + 34, 3).translate(s * side, beamY, 0)]),
      ...[45, 135].map((deg) => placed(box(2 * FRAME.post, BEAM, 30, 3), { pos: [0, beamY, 0], rotY: -deg * DEG })),
    ]),
  );
  asShell([floor, posts, carry], 24);

  root.add(swung); // (drawn last among equals: nothing depends on it)

  /* ══ anchors ══ */
  const CAM = 135 * DEG; // the side the film's cameras stand on (−x, +z)
  const A = {
    ball: anchor(ballG, BX, BY, BZ), //                the ball's centre (it travels)
    ballTop: anchor(ballG, BX, BY + R, BZ),
    plates: anchor(ballG, BX + Math.cos(CAM) * R, BY, BZ + Math.sin(CAM) * R), // its flank, camera side
    cradle: anchor(cradleG, Math.cos(CAM) * CRADLE.r, CRADLE.y + CRADLE.h / 2, Math.sin(CAM) * CRADLE.r),
    pin: anchor(cradleG, 0, PIN.y0, 0),
    ring: anchor(ring, -RINGR, RING.y, 0), //         the ring, on the side the ball lags to
    ringFar: anchor(ring, RINGR, RING.y, 0),
    rest: anchor(ring, 0, RING.y, 0), //              the ball's rest: the ring's centre
    dampers: anchor(root, -353, 125, 82), //           the middle of a damper, camera side (it follows it)
    damperHead: anchor(cradleG, DAMP[4].hx, DAMPERS.headY, DAMP[4].hz),
    cables: anchor(root, -242, 740, 170), //           the middle of a leg, camera side (it follows it)
    mount: anchor(topG, Math.cos(CAM) * CABLES.mountR, CABLES.mountY, Math.sin(CAM) * CABLES.mountR),
    frameTop: anchor(topG, 0, FRAME.top, 0),
    floor: anchor(root, 0, 0, 0),
  };
  const NEAR_DAMPER = 4; // the pair on −x: 167° (+z, the camera's side) and 193°
  const NEAR_LEG = 3; //    mount 135°, the leg toward 155°

  // nothing is allocated past this line
  const UP = new THREE.Vector3(0, 1, 0);
  const vX = new THREE.Vector3();
  const vY = new THREE.Vector3();
  const vZ = new THREE.Vector3();
  const basis = new THREE.Matrix4();

  return {
    root, A,
    parts: { ball, cradle, pin, ring, dampers, cables, frame },
    update(P, time = 0) {
      const bench = (P.bench ?? 0) > 0.5;
      const course = Math.max(-COURSE.max, Math.min(COURSE.max, P.course ?? 0));
      const vel = P.vel ?? 0;
      const e = clamp01(P.explode ?? 0);
      const plates = clamp01(P.plates ?? 0);
      const xray = clamp01(P.xray ?? 0);
      const pull = clamp01(P.pull ?? 0);
      const brake = clamp01(P.brake ?? 0);
      const heat = clamp01(P.heat ?? 0);
      const lock = clamp01(P.lock ?? 0);
      const limit = clamp01(P.limit ?? 0);
      const mark = clamp01(P.datum ?? 0);
      const litBall = clamp01(P.litBall ?? 0);
      const litCables = clamp01(P.litCables ?? 0);
      const litDampers = clamp01(P.litDampers ?? 0);
      const litRing = clamp01(P.litRing ?? 0);

      // ── opened (the bench): each in its own window
      const eDamp = settle(ramp(e, 0, 0.45));
      const eTop = settle(ramp(e, 0.08, 0.6));
      const eBall = settle(ramp(e, 0.2, 0.78));
      const eFan = settle(ramp(e, 0.4, 0.92));
      const eRing = settle(ramp(e, 0.5, 1));

      // ── the pendulum: a parallelogram — it travels and rises, it never turns
      const rise = CABLES.len - Math.sqrt(CABLES.len * CABLES.len - course * course);
      swung.position.set(course, rise, 0);
      ballG.position.y = OPEN.ball * eBall;
      cradleG.position.y = OPEN.cradle * eBall;
      const gap = GAP * smooth(plates);
      BU.uGap.value = gap;
      core.visible = gap > 0.01 && xray < 0.004;
      core.position.set(BX, BY + gap * MID, BZ);
      core.scale.y = 1 + (gap * MID) / R;
      BU.uLit.value = litBall;
      A.ball.position.y = BY + gap * MID;
      A.ballTop.position.y = BY + R + gap * 2 * MID;
      A.plates.position.y = BY + gap * MID;

      // ── steel, or glass
      setPartOpacity(ball, 1 - xray);
      setPartOpacity(cradle, 1 - xray);
      see(ballGhost, xray);
      see(cradleGhost, xray);
      setPartOpacity(cables, 1 - 0.78 * xray); // they stand between the eye and the pin: they thin out with the ball

      // ── the ring: hot on the side the pin nears; opened, it comes down and widens
      const near = Math.abs(course) / COURSE.max;
      const sideOf = course < 0 ? -1 : 1;
      RU.uWide.value = OPEN.wide * eRing;
      RU.uSide.value = Math.max(-1, Math.min(1, course / 12));
      RU.uWarm.value = 0.07 * limit;
      RU.uHot.value = limit * (0.1 + 0.9 * Math.pow(near, 1.5));
      RU.uLit.value = litRing;
      ring.position.y = -OPEN.down * eRing;
      datum.position.y = gapBar.position.y = nearBall.position.y = -OPEN.down * eRing;
      const legR = RINGR + OPEN.wide * eRing;
      for (let i = 0; i < legs.length; i++) {
        const dx = legs[i].userData.dir[0];
        const dz = legs[i].userData.dir[1];
        legs[i].position.set(dx * legR, 8, dz * legR);
        legs[i].scale.y = (LEGH - OPEN.down * eRing) / LEGH;
        feet[i].position.set(dx * legR, 6, dz * legR);
      }
      const left = Math.max(1, COURSE.max - 6 - Math.abs(course)); // from the pin's sleeve to the ring
      const shown = limit * ramp(near, 0.04, 0.14) * (1 - eRing);
      gapBar.visible = shown > 0.004;
      gapBar.scale.x = left;
      gapBar.position.x = course + sideOf * (PIN.r + 6 + left / 2);
      gapBar.position.y += RING.y;
      setGlow(gapMat, 2.1 * shown);
      nearBall.position.set(sideOf * RING.inner, RING.y - OPEN.down * eRing, 0);
      shine(nearBall, 0.5 * limit * near * near * near * (1 - eRing), 85, 9);
      datum.visible = mark > 0.004;
      for (let i = 0; i < datumLines.length; i++) datumLines[i].material.opacity = datumLines[i].material.userData.base * mark;

      // ── the dampers: feet on the floor, heads on the cradle — their length is the ball's course
      const out = OPEN.out * eDamp;
      const held = 1 - eDamp;
      for (let i = 0; i < DAMP.length; i++) {
        const d = DAMP[i];
        const fx = d.fx + d.cx * out;
        const fz = d.fz + d.cz * out;
        vY.set(d.hx + d.cx * out + course * held - fx, DAMPERS.headY + rise * held - OPEN.drop * eDamp - DAMPERS.footY, d.hz + d.cz * out - fz);
        const length = vY.length();
        vY.divideScalar(length);
        d.group.position.set(fx, DAMPERS.footY, fz);
        d.group.quaternion.setFromUnitVectors(UP, vY);
        d.rod.position.y = length;
        d.base.position.set(fx, DAMPERS.footY - 9, fz);
        // the head runs at the foot: it closes — that one brakes (the one that opens, a little)
        const rate = -vel * vY.x * 1.25;
        const closing = brake * Math.pow(clamp01(rate), 0.6) + 0.14 * brake * Math.pow(clamp01(-rate), 0.6);
        const green = 1.6 * closing + 0.2 * litDampers + 0.2 * lock;
        d.glowing.setRGB(VEILLE.r * green + PALE.r * 0.5 * heat, VEILLE.g * green + PALE.g * 0.5 * heat, VEILLE.b * green + PALE.b * 0.5 * heat);
        shine(d.lamp, 0.6 * closing, 60, 7);
        d.collar.visible = lock > 0.004;
        const grip = lerp(2.3, 1, smooth(lock));
        d.collar.scale.set(grip, 1, grip);
        HZ.uAt.value[i].set(fx + vY.x * 150, DAMPERS.footY + vY.y * 150, fz + vY.z * 150);
        if (i === NEAR_DAMPER) A.dampers.position.set(fx + vY.x * length * 0.5, DAMPERS.footY + vY.y * length * 0.5, fz + vY.z * length * 0.5);
      }
      setGlow(collarMat, 2.4 * smooth(lock));
      HZ.uAmount.value = heat;
      HZ.uTime.value = time;
      haze.visible = heat > 0.004;

      // ── the cables: from the mounts down to the yokes, wherever the cradle is; opened, they go up and fan out
      const lift = OPEN.top * eTop;
      topG.position.y = lift;
      mountsG.position.y = lift;
      const on = smooth(ramp(pull, 0, 0.05));
      KU.uPull.value = pull;
      KU.uOn.value = on;
      KU.uLit.value = litCables;
      KU.uFade.value = 1;
      for (let i = 0; i < CAB.length; i++) {
        const c = CAB[i];
        const my = CABLES.mountY + lift;
        const lx = c.lx + course * (1 - eFan) + c.ox * OPEN.fan * eFan;
        const ly = CABLES.lugY + rise * (1 - eFan) + lift + 11 * eFan;
        const lz = c.lz + c.oz * OPEN.fan * eFan;
        vY.set(c.mx - lx, my - ly, c.mz - lz);
        const length = vY.length();
        vY.divideScalar(length);
        vZ.set(c.rx, 0, c.rz);
        vX.crossVectors(vY, vZ).normalize();
        vZ.crossVectors(vX, vY);
        c.group.quaternion.setFromRotationMatrix(basis.makeBasis(vX, vY, vZ));
        c.group.position.set(c.mx, my, c.mz);
        c.group.scale.y = length / L0;
        c.lamp.position.set(lerp(lx, c.mx, pull), lerp(ly, my, pull), lerp(lz, c.mz, pull));
        shine(c.lamp, 0.5 * on * (1 - 0.6 * ramp(pull, 0.9, 1)), 70, 8);
        if (i === NEAR_LEG) A.cables.position.set((lx + c.mx) / 2, (ly + my) / 2, (lz + c.mz) / 2);
      }

      // ── the glass that carries it: whole on the bench, half in the tower (the tower's own cage doubles it)
      const carried = (bench ? 1 : 0.5) * frame.userData.part.opacity; // (setPartOpacity(parts.frame, a) is heard here: glass has no opacity of its own)
      frameGlass.uniforms.uAmount.value = postGlass.uniforms.uAmount.value = floorGlass.uniforms.uAmount.value = carried;
      for (let i = 0; i < frameLines.length; i++) frameLines[i].material.opacity = frameLines[i].material.userData.base * carried;
    },
  };
}
