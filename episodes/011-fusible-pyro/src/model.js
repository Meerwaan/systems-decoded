// DOSSIER 011 — the pyro fuse: ONE fuse, at its place in the junction box of the battery (`group`) and on the
// bench (`benchGroup`). Centimetres, y up; the fuse's own frame: its housing centred on the origin, its copper
// bar along x (the current runs from −x to +x), its piston coming DOWN on the bar.
//   · the housing: two shells of dark moulded plastic, 74 × 47 × 44 mm. The lower one carries the bar, the pocket
//     of the pit and two fixing lugs; the upper one clamps the bar under two M8 screws and rises into the tower the
//     piston runs in, closed by the igniter's collar
//   · the bar: 17 cm of flat copper, 22 mm wide, a fixing hole at each end. Either side of its middle, a neck
//     (narrower, thinner): that is where it will give
//   · the piston: light plastic, a seal round its body, its head a blunt wedge hanging 3 mm over the bar
//   · the charge: a small steel can behind the piston, its header, its two pins, and the plug the order comes by
//   · the pit: a cup under the bar, drawn open toward the eye — it takes the piece the piston punches out
// Three values of grey: the housing is dark, the piston and the charge in between, the bar the clearest thing of
// all (the film has three colours, and copper is none of them). Light: signal is the battery's current (the dashes
// in the bar, the arc); veille is the system acting (the charge going off, the part the voice names).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, setGlow, setPartOpacity, box, cyl, lathe, plate, chamfer, mergeGeometries, anchor } from "@kit/build3d.js";
import { FUSE } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const into = (frame, mesh) => (frame.add(mesh), mesh);

/* ─────────────────────────────────────────────────────────── the plan of the fuse */

const B = -0.76; // the bar's mid-plane: the housing is then centred on y = 0
const BAR = { half: 8.5, hw: 1.1, t: 0.32, top: B + 0.16, bot: B - 0.16, hole: 7.3, slug: 0.85, hinge: 1.45, neckHw: 0.74, neckT: 0.22 };
const LIP = BAR.hinge - BAR.slug; // the neck's length: what bends down when the middle is gone
const DROP = 0.9; // how far the punched piece falls: onto the floor of the pit
const GAP = 0.3; // the wedge hangs this far over the bar
const TRAVEL = GAP + DROP; // the piston's whole stroke
const BEND = 0.6; // radians: the lips of the two stumps, once the piston has gone through
const Y = {
  foot: -2.36, ring: -2.01, pit: BAR.bot - DROP, // the lower shell's foot, its body; the floor of the pit
  deck: 0.25, top: 2.36, collar: 2.62, //           the upper shell's shoulders, the top of its tower, the igniter's collar
  tip: BAR.top + GAP, body: 0.96, crown: 1.51, //   the piston at rest: the tip of its wedge, the foot of its body, its crown
  pot: 1.61, header: 2.19, plug: 2.7, //            the charge: the bottom of its can, its header, the plug over its pins
};
const CASE = { hx: 3.7, hz: 2.2, tx: 1.8, tz: 2.0 };
const STUD = 2.75; // the two M8 screws that clamp the housing on the bar

// Opened, on the bench: a column along the piston's own axis. The bar does not move (it is bolted on its stand),
// nor does the lower shell: it is the bar's seat. (Tried: the lower shell and the pit let down too — a column 17 cm
// tall, every part tiny; and a row above the bar — no larger, and "behind the piston, a charge" was lost.)
const OPEN = { top: [0, 7.4, 0], charge: [0, 2.0, 0], plug: 0.6, piston: [0, 1.3, 0], pit: [0, 0, 0], bottom: [0, 0, 0] };

/* ─────────────────────────────────────────────────────────── geometry */

/** A rectangle x0…x1 × z0…z1, its corners rounded by r: [x, z] points. */
function rrect(x0, x1, z0, z1, r = 0.2, n = 5) {
  const pts = [];
  for (const [cx, cz, a0] of [[x1 - r, z0 + r, -90], [x1 - r, z1 - r, 0], [x0 + r, z1 - r, 90], [x0 + r, z0 + r, 180]]) {
    for (let i = 0; i <= n; i++) {
      const a = (a0 + (i * 90) / n) * DEG;
      pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
    }
  }
  return pts;
}
const vec2 = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
const shapeOf = (pts) => new THREE.Shape(vec2(pts));
const round = (x, z, r) => {
  const hole = new THREE.Path();
  hole.absarc(x, z, r, 0, Math.PI * 2, true);
  return hole;
};
/** A flat piece drawn from above (an [x, z] outline, or a Shape with its holes), `t` thick, its top face at y = `top`. */
const flat = (outline, t, top, bevel = 0.06) => plate(outline, t, { bevel }).rotateX(Math.PI / 2).translate(0, top, 0);
/** A hex head on its washer, standing on y = 0. `r`: across corners / 2. */
const bolt = (r, h = r * 0.75) => mergeGeometries([cyl(r * 1.45, 0.16, 0.04, 24).translate(0, 0.08, 0), cyl(r, h, 0.07, 6).translate(0, 0.16 + h / 2, 0)]);
/** A ring turned round the y axis: from r0 to r1, from y0 to y1. */
const ring = (r0, r1, y0, y1, bevel = 0.05, seg = 40) => lathe([[r0, y0], [r1, y0], [r1, y1], [r0, y1], [r0, y0]], seg, { bevel, round: 2 });

/** A lane of the current: a strip lying on a top face, from bar-x `x0` to `x1`, drawn in the frame of a piece whose origin stands at bar-x `ox`. */
function lane(x0, x1, hw, y, ox = 0) {
  return ruled(new THREE.PlaneGeometry(x1 - x0, 2 * hw).rotateX(-Math.PI / 2).translate((x0 + x1) / 2 - ox, y, 0), ox);
}
/** …and the same on the bar's edge, the one that faces the eye. */
function edgeLane(x0, x1, h, y, z, ox = 0) {
  return ruled(new THREE.PlaneGeometry(x1 - x0, h).translate((x0 + x1) / 2 - ox, y, z), ox);
}
function ruled(geo, ox) {
  const pos = geo.attributes.position;
  const s = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) s[i] = pos.getX(i) + ox;
  geo.setAttribute("aS", new THREE.BufferAttribute(s, 1));
  return geo;
}

/* ─────────────────────────────────────────────────────────── light that has a place */

/**
 * The battery's current in the bar: wide dashes of signal light running from −x to +x, on a lane the dashes
 * darken a little between them — the bar is the clearest thing of the picture, and light only shows on dark.
 *   uFlow   how much of it (0–1)      uMid    the middle of the bar still carries (1) or has been punched out (0)
 *   uRight  what still reaches the far stump: nothing once the bar is cut — unless an arc carries it across
 */
const DASH = { period: 2.1, duty: 0.56, speed: 7 }; // cm, cm/s: 0.23 cm a frame, a ninth of a period — it runs, it does not strobe
const flowMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    uniforms: { uColor: { value: SIGNAL.clone() }, uTime: { value: 0 }, uFlow: { value: 0 }, uMid: { value: 1 }, uRight: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aS; varying float vS; varying float vZ; varying vec2 vUv;
      void main() {
        vS = aS; vZ = position.z; vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uFlow, uMid, uRight; varying float vS; varying float vZ; varying vec2 vUv;
      // bars of light, their ends softened over what a pixel covers — and melted into their mean once too small to count
      float bars(float x, float duty) {
        float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
        float q = fract(x);
        float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
        return mix(b, duty, smoothstep(0.12, 0.4, w));
      }
      void main() {
        float live = vS < -${BAR.slug.toFixed(2)} ? 1.0 : (vS > ${BAR.slug.toFixed(2)} ? uRight : uMid);
        float ends = 1.0 - smoothstep(7.85, 8.3, abs(vS)); // it comes out of the car's own bars, and goes back into them
        if (length(vec2(abs(vS) - ${BAR.hole.toFixed(2)}, vZ)) < 0.52) discard; // the fixing hole
        float a = uFlow * live * ends;
        if (a < 0.004) discard;
        float across = smoothstep(0.0, 0.12, vUv.y) * (1.0 - smoothstep(0.88, 1.0, vUv.y));
        float b = bars((vS - uTime * ${DASH.speed.toFixed(1)}) / ${DASH.period.toFixed(2)}, ${DASH.duty.toFixed(2)}) * across;
        gl_FragColor = vec4(uColor * (1.6 * b), a * mix(0.4 * across, 1.0, b));
      }`,
  });

/**
 * A ball of light with no edge, always facing the eye: a small hot heart, a soft body, a long tail. `uRadius`
 * cm (where the tail ends), never under `uMinPx` pixels. It stands where it is: what is in front of it hides it.
 */
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
        gl_FragColor = vec4((uHeart * (core * 2.6) + uHue * (body + tail)) * uAmount, 1.0);
      }`,
  });
function makeBall(heart, hue) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ballMaterial(heart, hue));
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return mesh;
}

/** The gases between the charge and the piston's crown: a soft column (y from 0 to 1, scaled to the room they have), hot near the charge. */
const gasMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uHue: { value: VEILLE.clone() }, uInk: { value: INK.clone() }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vH;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vH = position.y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue, uInk; uniform float uAmount; varying vec3 vN; varying vec3 vV; varying float vH;
      void main() {
        float f = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 1.6);
        float h = clamp(vH, 0.0, 1.0);
        gl_FragColor = vec4(mix(uHue, uInk, 0.55 * h) * (f * uAmount * mix(0.22, 1.0, h * h)), 1.0);
      }`,
  });

/**
 * The arc: never a line. A ribbon laid on the picture along a path the shader works out — from one stump (uA) to
 * the other (uB), bowing by uBow round the piston that stands between them, writhing slowly — and, across it, a
 * white-hot core with a clear edge, a sheath of signal, a long halo. Hotter at its two feet.
 */
const arcMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation, // the brightest wins: the ribbon is wider than its own wiggles and folds over itself — added up, the folds were beads
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    uniforms: {
      uA: { value: new THREE.Vector3(-1, 0, 0) }, uB: { value: new THREE.Vector3(1, 0, 0) }, uBow: { value: new THREE.Vector3(0, -0.3, 1) },
      uTime: { value: 0 }, uWidth: { value: 0.62 }, uMinPx: { value: 15 }, uJit: { value: 0.1 }, uAmount: { value: 0 },
      uHue: { value: SIGNAL.clone() }, uInk: { value: INK.clone() },
    },
    vertexShader: /* glsl */ `
      uniform vec3 uA, uB, uBow; uniform float uTime, uWidth, uMinPx, uJit;
      varying float vSide; varying float vT;
      vec3 path(float t) {
        float env = max(sin(3.14159265 * clamp(t, 0.0, 1.0)), 0.0);
        vec3 ab = uB - uA;
        vec3 e1 = normalize(uBow);
        vec3 e2 = normalize(cross(ab, e1));
        float w1 = 0.62 * sin(t * 17.0 + uTime * 2.1) + 0.38 * sin(t * 37.0 - uTime * 3.1 + 1.7);
        float w2 = 0.62 * sin(t * 23.0 - uTime * 1.7 + 2.0) + 0.38 * sin(t * 31.0 + uTime * 2.7 + 0.9);
        return uA + ab * t + uBow * env + (e1 * w1 + e2 * w2) * (uJit * sqrt(env));
      }
      void main() {
        float t = position.x;
        vec4 c = modelViewMatrix * vec4(path(t), 1.0);
        vec4 c1 = modelViewMatrix * vec4(path(min(t + 0.015, 1.0)), 1.0);
        vec4 c0 = modelViewMatrix * vec4(path(max(t - 0.015, 0.0)), 1.0);
        vec2 d = c1.xy - c0.xy;
        d /= max(length(d), 1e-5);
        float w = max(uWidth, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        c.xy += vec2(-d.y, d.x) * position.y * w;
        vSide = position.y;
        vT = t;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue, uInk; uniform float uAmount; varying float vSide; varying float vT;
      void main() {
        float d = abs(vSide);
        float core = 1.0 - smoothstep(0.075, 0.125, d);
        float sheath = exp(-d * d / 0.02);
        float x = d / 0.3;
        float halo = pow(1.0 + x * x, -1.4) * (1.0 - smoothstep(0.55, 1.0, d));
        float feet = 2.0 * vT - 1.0;
        float hot = 0.8 + 0.45 * feet * feet;
        vec3 col = uHue * (0.14 * halo + 0.62 * sheath) + mix(uHue, uInk, 0.65) * (1.65 * core);
        gl_FragColor = vec4(col * (uAmount * hot), 1.0);
      }`,
  });
function makeArc(n = 56) {
  const pos = [];
  const index = [];
  for (let i = 0; i <= n; i++) pos.push(i / n, -1, 0, i / n, 1, 0);
  for (let i = 0; i < n; i++) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  const mesh = new THREE.Mesh(geo, arcMaterial());
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return mesh;
}

/* ─────────────────────────────────────────────────────────── the stand (the bench only)
   Two ribbed insulators, as a bar is carried in any cabinet: the fuse hangs between them by its own bar,
   bolted through its two fixing holes. `c`: where the fuse's centre stands. */
function buildStand(c) {
  const stand = makePart("stand");
  const m = {
    foot: solid(0x1f2327, { rough: 0.95, env: 0.3 }),
    post: solid(0x262b30, { rough: 0.85, env: 0.4 }),
    steel: solid(0x858d95, { rough: 0.7, metal: 0.25 }),
  };
  const seat = c[1] + BAR.bot; // the bar rests here
  const sheds = [[0, 0.42]];
  sheds.push([1.25, 0.42], [1.25, 0.85], [0.82, 0.98]);
  const n = 2;
  const span = (seat - 0.6 - 1.0) / n;
  for (let i = 0; i < n; i++) {
    const y = 1.0 + i * span;
    sheds.push([0.82, y + span * 0.45], [1.2, y + span * 0.62], [1.2, y + span * 0.84], [0.82, y + span]);
  }
  sheds.push([0.82, seat - 0.5], [1.02, seat - 0.4], [1.02, seat], [0, seat]);
  const post = lathe(sheds, 48, { bevel: 0.07, round: 2 });
  const foot = lathe([[0, 0], [2.0, 0], [2.0, 0.22], [1.6, 0.44], [0, 0.44]], 56, { bevel: 0.07, round: 2 });
  const posts = [];
  const feet = [];
  const bolts = [];
  for (const s of [-1, 1]) {
    posts.push(post.clone().translate(c[0] + s * BAR.hole, 0, c[2]));
    feet.push(foot.clone().translate(c[0] + s * BAR.hole, 0, c[2]));
    bolts.push(bolt(0.68).translate(c[0] + s * BAR.hole, c[1] + BAR.top, c[2]));
  }
  addMesh(stand, mergeGeometries(feet), m.foot, { edgeOpacity: 0.2 });
  addMesh(stand, mergeGeometries(posts), m.post, { edgeOpacity: 0.22 });
  addMesh(stand, mergeGeometries(bolts), m.steel, { edgeOpacity: 0.45 });
  return stand;
}

/* ─────────────────────────────────────────────────────────── the fuse */

/**
 * → { group, benchGroup, A, update(p, time, px) }, p (see FIRST in world.js):
 *   bench    0: the fuse stands in the car (in `group`, its centre on FUSE.home) · 1: on the bench (in `benchGroup`, on FUSE.bench)
 *   flow     0–1: the battery's current in the bar, dashes of signal light running from −x to +x. Once the bar is cut
 *            they stop at the first stump — unless an arc is alight: it carries them across
 *   lid      1 → 0: the two shells of the housing fade away (the bar, the piston, the charge, the pit seen in place)
 *   fire     0–1.5: the charge going off — a ball of light under the can, the gases down to the piston's crown. While the
 *            housing is closed (`lid` 1) it shows as a flash through it and a line of light at the joint of the two shells
 *   piston   0 at rest → 1 through the bar. It reaches the bar at 0.25, and then pushes its middle whatever `snap` says
 *   snap     0 → 1: the middle of the bar punched out and down on the floor of the pit; the two lips bent down
 *   arc      0–1.5: the arc between the two stumps
 *   explode  0 → 1 (the bench): the upper shell, the charge (its plug off its pins) and the piston rise in a column along
 *            the piston's axis; the bar stays bolted on its stand, the lower shell and the pit under it
 *   litCase, litBar, litPiston, litCharge   0–1: the part the voice is naming glows veille (frank at 1: 0.5–0.7 is "faintly")
 */
export function buildFuse() {
  const group = new THREE.Group();
  const benchGroup = new THREE.Group();
  const root = new THREE.Group(); // the one fuse
  root.position.set(...FUSE.home);
  group.add(root);
  benchGroup.add(buildStand(FUSE.bench));

  /* ── the housing: two shells (they fade: their own materials) ── */
  const caseMats = () => ({
    shell: solid(0x424a53, { rough: 0.58, coat: 0.3, coatRough: 0.5, env: 0.9 }),
    trim: solid(0x5a636c, { rough: 0.72, env: 0.7 }),
    steel: solid(0x8a929a, { rough: 0.7, metal: 0.25 }),
  });

  const caseBottom = makePart("caseBottom");
  {
    const m = caseMats();
    const body = shapeOf(rrect(-CASE.hx, CASE.hx, -CASE.hz, CASE.hz, 0.32));
    body.holes.push(new THREE.Path(vec2(rrect(-1.2, 1.2, -1.48, 1.48, 0.12)))); // the pocket of the pit
    const lug = (sx, sz) => {
      const x = sx * 2.45;
      const z0 = sz * 2.1;
      const z1 = sz * 3.2;
      const pts = [[x - 0.8, z0], [x + 0.8, z0]];
      for (let i = 0; i <= 12; i++) pts.push([x + 0.8 * Math.cos((i / 12) * Math.PI), z1 + sz * 0.8 * Math.sin((i / 12) * Math.PI)]);
      const tab = shapeOf(pts);
      tab.holes.push(round(x, z1, 0.36));
      return flat(tab, 0.42, Y.foot + 0.42);
    };
    addMesh(
      caseBottom,
      mergeGeometries([
        flat(rrect(-CASE.hx - 0.15, CASE.hx + 0.15, -CASE.hz - 0.15, CASE.hz + 0.15, 0.42), Y.ring - Y.foot, Y.ring, 0.09),
        flat(body, BAR.bot - Y.ring, BAR.bot, 0.09),
        lug(-1, 1),
        lug(1, -1),
      ]),
      m.shell,
      { edgeOpacity: 0.55 },
    );
    const ribs = [];
    for (const sz of [-1, 1]) for (const x of [-2.0, -1.25, -0.45, 0.45, 1.25, 2.0]) ribs.push(box(0.26, 0.8, 0.16, 0.05).translate(x, -1.5, sz * (CASE.hz + 0.05)));
    addMesh(caseBottom, mergeGeometries(ribs), m.trim, { edgeOpacity: 0.35 });
    const bush = ring(0.36, 0.62, Y.foot - 0.03, Y.foot + 0.5, 0.05, 32);
    addMesh(caseBottom, mergeGeometries([bush.clone().translate(-2.45, 0, 3.2), bush.clone().translate(2.45, 0, -3.2)]), m.steel, { edgeOpacity: 0.4 });
  }

  const caseTop = makePart("caseTop");
  {
    const m = caseMats();
    // the shoulders: drawn from the end of the bar (the slot it passes through), pulled along it
    const slot = BAR.top + 0.04;
    const profile = chamfer([[-1.18, BAR.bot], [-1.18, slot], [1.18, slot], [1.18, BAR.bot], [CASE.hz, BAR.bot], [CASE.hz, Y.deck], [-CASE.hz, Y.deck], [-CASE.hz, BAR.bot]], 0.2, 2);
    const shoulders = plate(profile, 2 * CASE.hx, { bevel: 0.12 }).rotateY(Math.PI / 2).translate(-CASE.hx, 0, 0);
    const tower = box(2 * CASE.tx, Y.top - Y.deck + 0.45, 2 * CASE.tz, 0.42, 4).translate(0, (Y.top + Y.deck - 0.45) / 2, 0);
    const web = plate([[CASE.tx - 0.05, Y.deck - 0.05], [3.25, Y.deck - 0.05], [CASE.tx - 0.05, 1.75]], 0.24, { bevel: 0.05 }).translate(0, 0, -0.12);
    const webs = [];
    for (const z of [-1.5, 1.5]) webs.push(web.clone().translate(0, 0, z), web.clone().rotateY(Math.PI).translate(0, 0, z));
    addMesh(caseTop, mergeGeometries([shoulders, tower, ring(1.19, 1.5, Y.top - 0.05, Y.collar, 0.06, 48), ...webs]), m.shell, { edgeOpacity: 0.55 });
    const trim = [];
    for (const sz of [-1, 1]) {
      for (const x of [-1.2, -0.4, 0.4, 1.2]) trim.push(box(0.24, 1.45, 0.16, 0.05).translate(x, 1.3, sz * (CASE.tz + 0.04))); // ribs up the tower
      for (const x of [-2.85, 2.85]) trim.push(box(0.9, 0.8, 0.16, 0.05).translate(x, BAR.bot + 0.06, sz * (CASE.hz + 0.05))); // the hooks that hold the two shells together
    }
    addMesh(caseTop, mergeGeometries(trim), m.trim, { edgeOpacity: 0.35 });
    addMesh(caseTop, mergeGeometries([-1, 1].map((s) => bolt(0.6).translate(s * STUD, Y.deck, 0))), m.steel, { edgeOpacity: 0.45 });
  }

  /* ── the bar: two stumps, their two lips (the necks), and the middle that will be punched out ── */
  const bar = makePart("bar");
  const flow = flowMaterial();
  const lanes = [];
  const lipL = new THREE.Group();
  const lipR = new THREE.Group();
  const slug = new THREE.Group();
  {
    const hero = solid(0xd4d7d9, { rough: 0.82, metal: 0.1, env: 0.55 });
    const r = 0.45;
    const outline = [[-BAR.hinge, -BAR.hw], [-BAR.hinge, BAR.hw]];
    for (let i = 0; i <= 6; i++) outline.push([-BAR.half + r - r * Math.sin((i / 6) * 90 * DEG), BAR.hw - r + r * Math.cos((i / 6) * 90 * DEG)]);
    for (let i = 0; i <= 6; i++) outline.push([-BAR.half + r - r * Math.cos((i / 6) * 90 * DEG), -BAR.hw + r - r * Math.sin((i / 6) * 90 * DEG)]);
    for (const s of [-1, 1]) {
      const stump = shapeOf(outline.map(([x, z]) => [-s * x, z]));
      stump.holes.push(round(s * BAR.hole, 0, 0.43));
      addMesh(bar, flat(stump, BAR.t, BAR.top, 0.05), hero, { edgeOpacity: 0.5 });
      // its lip: hinged where the neck begins, drawn from the hinge toward the middle
      const lip = s < 0 ? lipL : lipR;
      lip.position.set(s * BAR.hinge, B, 0);
      bar.add(lip);
      const x0 = s < 0 ? 0 : -LIP;
      into(lip, addMesh(bar, flat([[x0, -BAR.neckHw], [x0 + LIP, -BAR.neckHw], [x0 + LIP, BAR.neckHw], [x0, BAR.neckHw]], BAR.neckT, BAR.neckT - BAR.t / 2, 0.04), hero, { edgeOpacity: 0.5 }));
      // the lanes of the current: on the top face, and on the edge that faces the eye
      const from = s < 0 ? -8.3 : BAR.hinge;
      const to = s < 0 ? -BAR.hinge : 8.3;
      lanes.push(into(bar, new THREE.Mesh(lane(from, to, BAR.hw - 0.12, BAR.top + 0.012), flow)));
      lanes.push(into(bar, new THREE.Mesh(edgeLane(from, to, BAR.t - 0.1, B, BAR.hw + 0.012), flow)));
      const n0 = s < 0 ? -BAR.hinge : BAR.slug;
      lanes.push(into(lip, new THREE.Mesh(lane(n0, n0 + LIP, BAR.neckHw - 0.1, BAR.neckT - BAR.t / 2 + 0.012, s * BAR.hinge), flow)));
    }
    bar.add(slug);
    into(slug, addMesh(bar, flat(rrect(-BAR.slug, BAR.slug, -BAR.hw, BAR.hw, 0.07, 2), BAR.t, BAR.top, 0.05), hero, { edgeOpacity: 0.5 }));
    lanes.push(into(slug, new THREE.Mesh(lane(-BAR.slug, BAR.slug, BAR.hw - 0.12, BAR.top + 0.012), flow)));
    lanes.push(into(slug, new THREE.Mesh(edgeLane(-BAR.slug, BAR.slug, BAR.t - 0.1, B, BAR.hw + 0.012), flow)));
    for (const mesh of lanes) mesh.renderOrder = 3;
  }

  /* ── the piston: its body in the tower, its seal, its head — a blunt wedge over the middle of the bar ── */
  const piston = makePart("piston");
  const ram = new THREE.Group(); // what travels
  piston.add(ram);
  {
    const plastic = solid(0xb7bec4, { rough: 0.7, env: 0.75 });
    const rubber = solid(0x30363c, { rough: 0.85, env: 0.4 });
    const wedge = chamfer([[-1.0, Y.body + 0.03], [-1.0, 0.62], [-0.26, Y.tip], [0.26, Y.tip], [1.0, 0.62], [1.0, Y.body + 0.03]], 0.12, 2);
    into(
      ram,
      addMesh(
        piston,
        mergeGeometries([
          plate(wedge, 2.4, { bevel: 0.06 }).translate(0, 0, -1.2),
          box(2.6, Y.crown - Y.body, 2.9, 0.1).translate(0, (Y.crown + Y.body) / 2, 0),
          ring(0.8, 1.1, Y.crown - 0.04, Y.crown + 0.06, 0.03, 40), // the cup the charge fires into
        ]),
        plastic,
        { edgeOpacity: 0.6 },
      ),
    );
    into(ram, addMesh(piston, box(2.7, 0.15, 3.0, 0.06).translate(0, Y.body + 0.31, 0), rubber, { edgeOpacity: 0.3 }));
  }

  /* ── the charge: the can behind the piston, its header, two pins — and the plug the order comes by ── */
  const charge = makePart("charge");
  const plug = new THREE.Group(); // it comes off its pins as the fuse opens
  charge.add(plug);
  {
    const steel = solid(0x7d858d, { rough: 0.45, metal: 0.45 });
    const can = solid(0xb6bcc2, { rough: 0.4, metal: 0.4, env: 1.1 });
    const pin = solid(0xdfe1e2, { rough: 0.3, metal: 0.45 });
    const shell = solid(0x59616a, { rough: 0.7, env: 0.7 });
    const latch = solid(0x9aa1a8, { rough: 0.6, env: 0.8 });
    addMesh(charge, cyl(1.15, Y.top - Y.header, 0.04, 40).translate(0, (Y.top + Y.header) / 2, 0), steel, { edgeOpacity: 0.45 });
    addMesh(charge, cyl(0.76, Y.header - Y.pot, 0.1, 40).translate(0, (Y.header + Y.pot) / 2, 0), can, { edgeOpacity: 0.5 });
    addMesh(charge, mergeGeometries([-1, 1].map((s) => cyl(0.085, 0.44, 0.02, 12).translate(s * 0.32, Y.top + 0.22, 0))), pin, { edges: false });
    into(
      plug,
      addMesh(
        charge,
        mergeGeometries([
          box(2.0, 0.8, 1.5, 0.16).translate(0, Y.plug + 0.4, 0),
          cyl(0.36, 0.8, 0.08, 20).rotateX(Math.PI / 2).translate(0, Y.plug + 0.4, -1.12), // where the two wires of the order come in
        ]),
        shell,
        { edgeOpacity: 0.5 },
      ),
    );
    into(plug, addMesh(charge, box(0.9, 0.12, 0.8, 0.04).translate(0, Y.plug + 0.84, 0.14), latch, { edgeOpacity: 0.4 }));
  }

  /* ── the pit: a cup under the bar, open toward the eye (+z) ── */
  const pit = makePart("pit");
  {
    const cup = solid(0x4a5259, { rough: 0.9, env: 0.5 });
    const wall = 0.7;
    addMesh(
      pit,
      mergeGeometries([
        box(2.14, 0.18, 2.72, 0.04).translate(0, Y.pit - 0.09, -0.06),
        box(2.14, wall, 0.15, 0.04).translate(0, Y.pit - 0.18 + wall / 2, -1.345),
        ...[-1, 1].map((s) => box(0.15, wall, 2.72, 0.04).translate(s * 0.995, Y.pit - 0.18 + wall / 2, -0.06)),
      ]),
      cup,
      { edgeOpacity: 0.5 },
    );
  }

  root.add(caseBottom, pit, bar, piston, charge, caseTop);

  /* ── the light ── */
  const burst = makeBall(INK, VEILLE); // the charge going off: under the can, on the piston's crown
  burst.position.set(0, Y.pot - 0.04, 0);
  const gas = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1, 32, 1, true).translate(0, 0.5, 0), gasMaterial());
  gas.renderOrder = 5;
  const burstLight = new THREE.PointLight(new THREE.Color(BRAND.veille).lerp(INK, 0.5), 0, 16, 2);
  burstLight.position.copy(burst.position);
  // what leaks out of a closed housing: a line of light at the joint of its two shells
  const seam = glow(BRAND.veille, 0, { additive: true });
  const leak = new THREE.Mesh(
    mergeGeometries([
      ...[-1, 1].map((s) => new THREE.BoxGeometry(2 * CASE.hx, 0.07, 0.03).translate(0, BAR.bot, s * (CASE.hz + 0.02))),
      ...[-1, 1].map((s) => new THREE.BoxGeometry(0.03, 0.07, 2 * CASE.hz).translate(s * (CASE.hx + 0.02), BAR.bot, 0)),
    ]),
    seam,
  );
  leak.renderOrder = 4;
  // …and, seen from the road, the flash itself: a closed housing would hide it all, and the hook needs "a charge goes
  // off under the floor" to have its light. It shines through whatever stands before it; opened (`lid` 0), it is gone
  const flash = makeBall(INK, VEILLE);
  flash.material.depthTest = false;
  flash.renderOrder = 7;
  flash.position.set(0, 1.1, 0);

  const arc = makeArc();
  const AU = arc.material.uniforms;
  const arcBall = makeBall(SIGNAL, SIGNAL); // the air it heats, round its middle
  const arcLight = new THREE.PointLight(BRAND.signal, 0, 14, 2);
  root.add(burst, gas, burstLight, leak, flash, arc, arcBall, arcLight);

  const A = {
    fuse: anchor(root, 0, 0, 0),
    bar: anchor(bar, -5.4, BAR.top, 0),
    stumpL: anchor(bar, -(BAR.hinge + 0.2), B, 0),
    stumpR: anchor(bar, BAR.hinge + 0.2, B, 0),
    piston: anchor(ram, 0, (Y.tip + Y.crown) / 2, 0),
    charge: anchor(charge, 0, (Y.pot + Y.top) / 2, 0),
    pit: anchor(pit, 0, Y.pit + 0.2, 0),
    connector: anchor(plug, 0, Y.plug + 0.4, -1.52), // where the order's wires enter the plug
  };

  // what lights up when the voice names a part: its solids, and the lines of its edges
  const lampOf = (...parts) => {
    const mats = parts.flatMap((part) => [...part.userData.part.mats]);
    const lines = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lines) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.glow = 0.11 * (1 - 0.85 * Math.min(1, 0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b));
    }
    return { solids, lines, on: -1 };
  };
  const lamps = { case: lampOf(caseTop, caseBottom), bar: lampOf(bar), piston: lampOf(piston), charge: lampOf(charge) };
  const light = (lamp, k) => {
    if (lamp.on === k) return;
    lamp.on = k;
    for (const mat of lamp.solids) {
      mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k);
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.7 * k);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };

  // a part rises first, slides out after: it never passes through its neighbour
  const move = (part, v, k, from, to) => {
    const up = ease(ramp(k, from, from + (to - from) * 0.75));
    const out = ease(ramp(k, from + (to - from) * 0.3, to));
    part.position.set(v[0] * out, v[1] * up, v[2] * out);
  };

  let where = -1;
  return {
    group, benchGroup, A,
    parts: { caseTop, caseBottom, bar, piston, charge, pit },
    update(p, time = 0) {
      // ── where it stands: the same fuse, in the car or on the bench
      const on = p.bench > 0.5 ? 1 : 0;
      if (on !== where) {
        where = on;
        (on ? benchGroup : group).add(root);
        const at = on ? FUSE.bench : FUSE.home;
        root.position.set(at[0], at[1], at[2]);
      }

      // ── the housing
      const lid = clamp01(p.lid ?? 1);
      setPartOpacity(caseTop, lid);
      setPartOpacity(caseBottom, lid);

      // ── the stroke: the piston, the middle of the bar it pushes, the lips it leaves bent
      const run = clamp01(p.piston ?? 0) * TRAVEL;
      const snap = clamp01(p.snap ?? 0);
      const drop = Math.max(snap * DROP, Math.min(Math.max(run - GAP, 0), DROP)); // the piston never passes through a whole bar
      const bend = BEND * smooth(clamp01(Math.max(snap, drop / 0.4)));
      ram.position.y = -run;
      slug.position.y = -drop;
      lipL.rotation.z = -bend;
      lipR.rotation.z = bend;

      // ── opened (the bench)
      const k = clamp01(p.explode ?? 0);
      const L = OPEN;
      move(caseTop, L.top, k, 0, 0.8);
      move(charge, L.charge, k, 0.08, 0.86);
      plug.position.y = L.plug * ease(ramp(k, 0.5, 1));
      move(piston, L.piston, k, 0.18, 0.94);
      move(pit, L.pit, k, 0.15, 0.9);
      move(caseBottom, L.bottom, k, 0.02, 0.8);

      light(lamps.case, p.litCase ?? 0);
      light(lamps.bar, p.litBar ?? 0);
      light(lamps.piston, p.litPiston ?? 0);
      light(lamps.charge, p.litCharge ?? 0);

      // ── the current
      const a = Math.max(0, p.arc ?? 0);
      const cut = smooth(ramp(drop, 0.03, 0.22));
      const FU = flow.uniforms;
      const amount = clamp01(p.flow ?? 0);
      FU.uTime.value = time;
      FU.uFlow.value = amount;
      FU.uMid.value = 1 - cut;
      FU.uRight.value = Math.max(1 - cut, Math.min(1, a));
      for (let i = 0; i < lanes.length; i++) lanes[i].visible = amount > 0.004;

      // ── the charge going off (it follows the piston when the fuse is opened)
      const f = Math.min(1.5, Math.max(0, p.fire ?? 0));
      const fired = f > 0.004;
      burst.visible = gas.visible = fired;
      if (fired) {
        const lift = charge.position.y;
        burst.position.y = lift + Y.pot - 0.04;
        burst.material.uniforms.uRadius.value = 0.55 + 1.5 * f;
        burst.material.uniforms.uMinPx.value = 12 + 16 * f;
        burst.material.uniforms.uAmount.value = Math.min(1.25, 1.1 * f);
        const crown = piston.position.y + Y.crown - run;
        gas.position.y = crown;
        gas.scale.y = Math.max(0.02, lift + Y.pot - crown);
        gas.material.uniforms.uAmount.value = 0.55 * f;
        burstLight.position.y = burst.position.y;
      }
      burstLight.intensity = 7 * f;
      const leaking = f * lid;
      leak.visible = leaking > 0.004 && k < 0.01;
      if (leak.visible) setGlow(seam, 2.2 * leaking);
      flash.visible = leak.visible;
      if (flash.visible) {
        flash.material.uniforms.uRadius.value = 2.2 + 2.6 * f;
        flash.material.uniforms.uMinPx.value = 18 + 26 * f;
        flash.material.uniforms.uAmount.value = 0.6 * leaking;
      }

      // ── the arc, from one lip to the other, round the piston
      const lit = a > 0.004;
      arc.visible = arcBall.visible = lit;
      if (lit) {
        const x = BAR.hinge - LIP * Math.cos(bend);
        const y = B - LIP * Math.sin(bend) - 0.05;
        AU.uA.value.set(-x, y, 0.5);
        AU.uB.value.set(x, y, 0.5);
        AU.uBow.value.set(0, -0.3, 0.95);
        AU.uTime.value = time;
        AU.uAmount.value = Math.min(1.5, a);
        arcBall.position.set(0, y - 0.3, 1.2);
        arcBall.material.uniforms.uRadius.value = 1.3 + 0.4 * a;
        arcBall.material.uniforms.uMinPx.value = 30;
        arcBall.material.uniforms.uAmount.value = 0.04 * Math.min(1.5, a);
        arcLight.position.set(0, y - 0.3, 3.0);
      }
      arcLight.intensity = 3 * Math.min(1.5, a);
    },
  };
}
