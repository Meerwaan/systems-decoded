// DOSSIER 009 — the microwave oven: its DOOR (the system, solid) and, like an X-ray around it, the body it closes.
// Centimetres, y up, the cotes of plan.js. buildOven() → { group, benchGroup, A, update(p, time, px) }.
//   · the door, from the room inward: a bezel and its handle · a pane of smoked glass · THE PERFORATED PLATE (the
//     hero: holes of 1.5 mm, 2.5 mm apart, really pierced, drawn by a shader) · an inner film · the inner frame
//     and its groove · two hooks on the free edge. It is ONE door: it hangs on its hinge in the kitchen, and
//     `bench` 1 stands it on the bench (same object, same orientation: the cut matches on it)
//   · the body: a shell of glass, and solid inside it the cavity (five faint walls, their edges, the flange the
//     door closes on), the turntable and a bowl, the lamp, the magnetron and its waveguide, and the safety chain
//     — fuse → two interlock switches the hooks hold down → magnetron, and the third switch, the monitor
// Three values of grey: what frames is dark (cast), what holds is in between (steel), what moves or is
// machined is clear (fine), and the perforated plate is the clearest thing of all (hero).
// Light is veille (the chain when it holds), signal (switches stuck closed), and one white flash: the fuse.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, glass, asShell, setPartOpacity, box, cyl, lathe, plate, mergeGeometries, fatLine, edgesOf, anchor } from "@kit/build3d.js";
import { OVEN, DOOR, CAVITY, TURNTABLE, WINDOW, HOLES, HINGE, HANDLE, HOOKS, LATCH, MAGNETRON, FUSE } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.96, 0.88); // the fuse's flash: white
const WARM = new THREE.Color(1, 0.93, 0.82); // the cavity's lamp: ink, a little warmer
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
const H2 = (BRAND.H / 2).toFixed(1);

/** How far the door swings (degrees) when `open` is 1 — about HINGE, outward. */
export const SWING = 100;
/** How far the hooks lift (cm) when `latch` is 1. */
export const LIFT = 1;
/** Exploded, how far along its normal each layer of the door goes (cm; + is toward the room). The plate stays. */
export const LAYERS = { frame: 21, glass: 11, mesh: 0, film: -7, inner: -14, hooks: -17.6 };

// the door's own frame: its centre is the origin, x toward its free edge, z out of it (toward the room)
const DW = DOOR.w;
const DH = DOOR.h;
const ZF = OVEN.doorThick / 2; // its front face
const WIN = { w: WINDOW.x1 - WINDOW.x0, h: WINDOW.y1 - WINDOW.y0 };
const HANDLE_X = HANDLE.x - DOOR.home[0];
const HOOK_X = HOOKS.x - DOOR.home[0];
const HOOK_Y = HOOKS.y.map((y) => y - DOOR.home[1]);
const PLATE_Z = -0.3;
const DIM = 0.55; // the plate, seen behind the door's smoked glass
const OPEN_AREA = (Math.PI * HOLES.d * HOLES.d) / (2 * Math.sqrt(3) * HOLES.pitch * HOLES.pitch); // a third of the plate is hole

// the safety chain, in the kitchen
const SW = { x: 11.2, z: 51.9, t: 1.3, h: 1.9, l: 3.4, lever: 3.95 }; // a microswitch: where its body stands, its size
const RELEASE = 11 * DEG; // how far a lever springs up once let go
const MON_Y = LATCH.y + 0.5; // the line the monitor's rocker works on (as a hook's centre line)
const CRANK_REST = 13 * DEG;
const FUSE_AT = [FUSE.x - 0.4, FUSE.y, FUSE.z]; // the cartridge's centre; it lies along z
const LAMP_AT = [-17, 172.1, 27]; // on the cavity's ceiling, far from the magnetron: a light knows no wall, and next to it the waveguide burnt

// One set of materials per part: a part fades, or lights up, without taking its neighbours along.
const metals = () => ({
  hero: solid(0xe8ebec, { rough: 0.36, metal: 0.35, env: 1.1 }),
  fine: solid(0xb4bbc1, { rough: 0.42, metal: 0.4, env: 0.9 }),
  steel: solid(0x7d868e, { rough: 0.5, metal: 0.3 }),
  cast: solid(0x363c43, { rough: 0.56, metal: 0.25, env: 0.8 }),
  dark: solid(0x23282d, { rough: 0.5, metal: 0.1, env: 0.7 }),
  board: solid(0x596169, { rough: 0.82, metal: 0, env: 0.5 }),
});

/* ─────────────────────────────────────────────────────────── geometry */

const lyingZ = (g) => g.rotateX(Math.PI / 2); // a round standing on y → lying along z
const lyingX = (g) => g.rotateZ(Math.PI / 2); // → lying along x (its top toward −x)

/** A rectangle w × h with rounded corners, anticlockwise. */
const rrect = (w, h, r, dx = 0, dy = 0, n = 6) => {
  const pts = [];
  for (const [sx, sy, a0] of [[1, -1, -90], [1, 1, 0], [-1, 1, 90], [-1, -1, 180]]) {
    for (let i = 0; i <= n; i++) {
      const a = (a0 + (i * 90) / n) * DEG;
      pts.push(new THREE.Vector2(dx + sx * (w / 2 - r) + r * Math.cos(a), dy + sy * (h / 2 - r) + r * Math.sin(a)));
    }
  }
  return pts;
};
/** A rounded rectangle with holes (each a list of points). */
const pierced = (outer, ...holes) => {
  const shape = new THREE.Shape(outer);
  for (const hole of holes) shape.holes.push(new THREE.Path([...hole].reverse()));
  return shape;
};
/** A frame W × H around an opening w × h. */
const ringShape = (W, H, R, w, h, r) => pierced(rrect(W, H, R), rrect(w, h, r));

/** Lists of geometries by material ("steel", or "steel:hw" for small hardware: fainter edges), merged into one mesh each. */
function bins(part, m, frame = part) {
  const lists = new Map();
  return {
    put(key, ...geos) {
      if (!lists.has(key)) lists.set(key, []);
      lists.get(key).push(...geos.flat());
      return this;
    },
    flush() {
      for (const [key, geos] of lists) {
        const [name, small] = key.split(":");
        const mesh = addMesh(part, mergeGeometries(geos), m[name], { edgeOpacity: small ? 0.34 : name === "hero" ? 0.42 : 0.5 });
        if (frame !== part) frame.add(mesh);
      }
      lists.clear();
    },
  };
}

/** A polyline with its corners rounded — the way a wire is bent — and no stretch longer than `stride`. */
function bent(points, cut = 0.8, steps = 5, stride = 2.5) {
  const out = [];
  const push = (p) => {
    const last = out[out.length - 1];
    if (last) {
      const n = Math.ceil(last.distanceTo(p) / stride);
      for (let i = 1; i < n; i++) out.push(last.clone().lerp(p, i / n));
    }
    out.push(p);
  };
  points.forEach((p, i) => {
    const a = points[i - 1];
    const b = points[i + 1];
    if (!a || !b) return push(p.clone());
    const u = a.clone().sub(p);
    const v = b.clone().sub(p);
    const k = Math.min(cut, u.length() / 2.2, v.length() / 2.2);
    const from = p.clone().addScaledVector(u.normalize(), k);
    const to = p.clone().addScaledVector(v.normalize(), k);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      push(from.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(p, 2 * t * (1 - t)).addScaledVector(to, t * t));
    }
  });
  return out;
}

/** A wire through `points`: its solid tube, and the same path a little fatter for its sheath of light (uv.x = cm along it, from `s0`). */
const WIRE_R = 0.15;
function wire(points, s0 = 0) {
  const pts = bent(points.map((p) => V(...p)));
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const len = curve.getLength();
  const segs = Math.max(10, Math.round(len / 0.3));
  const sheath = new THREE.TubeGeometry(curve, segs, WIRE_R, 8, false);
  const uv = sheath.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, s0 + uv.getX(i) * len);
  return { len, solid: new THREE.TubeGeometry(curve, segs, WIRE_R, 8, false), sheath, line: pts.map((p) => [p.x, p.y, p.z]) };
}

/* ─────────────────────────────────────────────────────────── the perforated plate
   The trap of this model. A sheet 32 cm wide carries sixteen thousand holes: none can be a triangle, and drawn
   naively they shimmer and moiré as soon as one is smaller than a few pixels. So the holes live in the shader
   of a flat sheet, at true scale, on a triangular lattice with a hole exactly at the origin (HOLES.origin):
     · close: each hole is REALLY open (alpha 0: what is behind shows), its rim softened over one pixel, and the
       sheet has a thickness — the ray that enters a hole slides across it and may meet its wall, which is shaded
       as a wall (its own normal, darker with depth). From three quarters each hole is a crescent of metal
     · as a hole shrinks under 4.2 px the pattern melts, with `fwidth`, into its own mean — a sheet that lets a
       third of what is behind through (less at a slant: the two mouths of a hole no longer face each other) —
       and under 2.4 px nothing is left of it: an even tone. Same energy at both ends: nothing pops in between
   It stays a lit, shadowed standard material; it does not write depth (what is behind is drawn first). */
function perforated(color) {
  const mat = solid(color, { rough: 0.38, metal: 0.35, env: 1.1, double: true });
  mat.transparent = mat.userData.transparent = true;
  mat.depthWrite = mat.userData.depthWrite = false;
  const U = { uPitch: { value: HOLES.pitch }, uHole: { value: HOLES.d / 2 }, uThick: { value: 0.07 }, uHalf: { value: new THREE.Vector2(WIN.w / 2 - 0.1, WIN.h / 2 - 0.1) }, uDim: { value: 1 } };
  mat.userData.uniforms = U;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vPlate; varying vec3 vEyeL; varying vec3 vTx; varying vec3 vTy;")
      .replace(
        "#include <project_vertex>",
        /* glsl */ `#include <project_vertex>
        vPlate = position.xy;
        vEyeL = (-mvPosition.xyz) * mat3(modelViewMatrix); // toward the eye, in the sheet's own frame
        vTx = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
        vTy = normalize(normalMatrix * vec3(0.0, 1.0, 0.0));`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uPitch, uHole, uThick, uDim; uniform vec2 uHalf; varying vec2 vPlate; varying vec3 vEyeL; varying vec3 vTx; varying vec3 vTy;")
      .replace(
        "#include <normal_fragment_maps>",
        /* glsl */ `#include <normal_fragment_maps>
        {
          vec2 hp = vPlate;
          float cmPx = max(max(length(dFdx(hp)), length(dFdy(hp))), 1e-5); // what a pixel covers of the sheet, at its widest
          float hMelt = 1.0 - smoothstep(2.4, 4.2, 2.0 * uHole / cmPx); // 1: a hole is under two pixels and a half (a margin over two: the film is compressed, and often served at 720p)
          // the nearest hole of a triangular lattice: two rectangular ones, half a cell apart
          vec2 cell = vec2(1.0, 1.7320508) * uPitch;
          vec2 ha = mod(hp + 0.5 * cell, cell) - 0.5 * cell;
          vec2 hb = mod(hp, cell) - 0.5 * cell;
          vec2 hq = dot(ha, ha) < dot(hb, hb) ? ha : hb; // from that hole's centre
          vec2 hc = hp - hq;
          float has = step(abs(hc.x), uHalf.x) * step(abs(hc.y), uHalf.y); // no hole under the frame
          float hasMean = (1.0 - smoothstep(uHalf.x - cmPx, uHalf.x + cmPx, abs(hp.x))) * (1.0 - smoothstep(uHalf.y - cmPx, uHalf.y + cmPx, abs(hp.y)));
          // across the thickness of the sheet the ray slides by hw: its far mouth is seen shifted
          vec3 he = normalize(vEyeL);
          vec2 hw = he.xy / max(abs(he.z), 0.15) * uThick;
          float aa = 0.7 * cmPx;
          float inNear = 1.0 - smoothstep(-aa, aa, length(hq) - uHole);
          float inFar = 1.0 - smoothstep(-aa, aa, length(hq - hw) - uHole);
          float hOpen = inNear * inFar * has;
          float hWall = inNear * (1.0 - inFar) * has;
          // the mean: what two discs shifted by hw still share
          float hx = clamp(length(hw) / (2.0 * uHole), 0.0, 1.0);
          float lens = 0.63662 * (acos(hx) - hx * sqrt(max(1.0 - hx * hx, 0.0)));
          float cover = 1.0 - mix(hOpen, ${OPEN_AREA.toFixed(4)} * lens * hasMean, hMelt);
          // where the ray meets the wall of the hole (clamped before sqrt and before the division)
          float ww = max(dot(hw, hw), 1e-9);
          float qw = dot(hq, hw);
          float hit = clamp((qw + sqrt(max(qw * qw - ww * (dot(hq, hq) - uHole * uHole), 0.0))) / ww, 0.0, 1.0);
          vec2 hn = (hq - hw * hit) / uHole;
          float wk = (1.0 - hMelt) * hWall / max(hWall + 1.0 - inNear * has, 1e-3);
          normal = normalize(mix(normal, normalize(normal * 0.08 - vTx * hn.x - vTy * hn.y), wk));
          diffuseColor.rgb *= uDim * mix(1.0, mix(0.92, 0.42, hit), wk);
          diffuseColor.a *= cover;
          if (diffuseColor.a < 0.004) discard;
        }`,
      );
  };
  return mat;
}

/* ─────────────────────────────────────────────────────────── glass, and light that has a place */

/**
 * A pane seen from close: almost nothing where it faces the eye, a bright lip where it turns away, and the
 * studio lying across it — two soft bands that slide over the pane as the eye moves. Additive: what is
 * behind shows through. `uGain` scales it, `uBands` the reflection alone.
 */
const paneMaterial = ({ gain = 1, bands = 1 } = {}) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 }, uGain: { value: gain }, uBands: { value: bands } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec3 vWN; varying vec3 vWV;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vec4 mv = viewMatrix * world;
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vP = position;
        vWN = normalize(mat3(modelMatrix) * normal);
        vWV = cameraPosition - world.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uGain, uBands;
      varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec3 vWN; varying vec3 vWV;
      void main() {
        if (uAmount < 0.003) discard;
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float fresnel = 0.03 + 0.97 * pow(g, 4.0);
        vec3 wn = normalize(vWN); vec3 wv = normalize(vWV);
        if (dot(wn, wv) < 0.0) wn = -wn;
        vec3 r = reflect(-wv, wn);
        float t = (vP.x + 0.6 * vP.y) / 22.0 + 1.1 * r.x - 0.5 * r.y;
        float wide = smoothstep(-0.62, -0.38, t) * (1.0 - smoothstep(-0.12, 0.12, t));
        float thin = smoothstep(0.2, 0.3, t) * (1.0 - smoothstep(0.38, 0.48, t));
        float light = 0.012 + 0.5 * fresnel + uBands * (wide + 0.6 * thin) * (0.05 + 0.3 * g);
        gl_FragColor = vec4(uColor * light * uAmount * uGain, 1.0);
      }`,
  });

/** A ball of light with no edge: brightest where it faces the eye, nothing at its rim. */
const softGlow = (power = 2.2) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uPower: { value: power } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * f, 1.0);
      }`,
  });

/** A light seen from anywhere: a bright core and a long tail, on a unit sphere the shader sizes — `uRadius` cm, or `uMinPx` pixels if that is more. */
const haloMaterial = (core = 0.8, flash = false) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uRadius: { value: 1 }, uMinPx: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uRadius, uMinPx; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        vec4 mv = modelViewMatrix * vec4(position * r, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main() {
        float n = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        gl_FragColor = vec4(uColor * (${flash ? "2.6 * pow(n, 26.0) + 0.3 * pow(n, 5.0) + 0.05 * n * n" : `${core.toFixed(2)} * pow(n, 14.0) + ${(1 - core).toFixed(2)} * pow(n, 4.0)`}), 1.0);
      }`,
  });

/**
 * The current in a wire: a sheath of light round it, never thinner than `uMinPx` pixels, with dashes running
 * the way the current goes (uv.x: cm along the chain). `uOn` 0 dark → 1; the dashes melt into their mean once too small.
 */
const FLOW = { period: 1.5, speed: 5 }; // cm, cm/s: a dash moves a ninth of its period per frame — it runs, it does not hop
const sheathMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: VEILLE.clone() }, uOn: { value: 0 }, uTime: { value: 0 }, uMinPx: { value: 2.6 } },
    vertexShader: /* glsl */ `
      uniform float uMinPx; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 centre = position - normal * ${WIRE_R.toFixed(3)};
        vec4 c = modelViewMatrix * vec4(centre, 1.0);
        float cmPerPx = max(0.5, -c.z) / (projectionMatrix[1][1] * ${H2});
        vec4 mv = modelViewMatrix * vec4(centre + normal * max(${(WIRE_R * 1.9).toFixed(3)}, uMinPx * cmPerPx), 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vS = uv.x;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOn, uTime; varying float vS; varying vec3 vN; varying vec3 vV;
      float bars(float x, float duty) {
        float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
        float q = fract(x);
        float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
        return mix(b, duty, smoothstep(0.12, 0.4, w));
      }
      void main() {
        float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.2);
        float run = bars((vS - uTime * ${FLOW.speed.toFixed(1)}) / ${FLOW.period.toFixed(2)}, 0.55);
        gl_FragColor = vec4(uColor * uOn * (0.4 + 1.0 * run) * body, 1.0);
      }`,
  });

/* ─────────────────────────────────────────────────────────── the oven */

// A hook, seen from the side: u goes INTO the body from the door's inner face, v is up. Its nose points down,
// behind the strike; its front is a ramp (closing the door, it rides up the strike by itself).
const HOOK = [[-2.2, 0.35], [-2.2, -0.35], [1.45, -0.35], [1.45, -1.0], [2.0, -1.0], [2.4, -0.35], [2.4, 0.05], [2.05, 0.35]];
// The rocker that works the monitor switch: the same finger, on a pivot of the latch board (u toward the door).
const CRANK = [[-0.6, 0.4], [-0.6, -0.4], [3.0, -0.4], [3.0, -1.3], [3.7, -1.3], [4.0, -0.4], [4.0, 0.15], [3.6, 0.4]];

/**
 * → { group, benchGroup, A, update(p, time, px) }. `group` is the oven in the kitchen (cotes of plan.js);
 * `benchGroup` receives the door when `bench` is 1 — upright, its centre at DOOR.bench.
 * p (see FIRST in world.js):
 *   bench     1: the door stands on the bench (the body is not updated: its set is hidden)
 *   body      1 everything · 0.5 the shell, the cavity, the turntable have gone and the safety chain is left
 *             alone (latch board, switches, wires, fuse, magnetron) · 0 nothing
 *   door      0–1: the door fades (0: no door at all)
 *   open      0 closed → 1: it has turned SWING degrees about HINGE
 *   latch     0 → 1: the hooks lift LIFT cm; the levers of the two interlocks follow them up, then are let go
 *   sw        1: the two interlocks closed — their pip, the wires and the fuse's filament lit veille · 0: dark
 *   stuck     1: they stay closed whatever `sw` says, and what was veille is signal (the levers are up: it is
 *             the contacts that are welded)
 *   monitor   0 → 1: the rocker comes down on the third switch's lever, its pip lights, and — if the chain is
 *             still live — the wire from it to the fuse carries the short
 *   fuse      1 whole → 0: the filament is broken, the cartridge sooted; nothing is live any more
 *   spark     0–1.5: the flash, in the cartridge: a white core that swells with it
 *   spin      turns of the turntable · lamp: the cavity's lamp (0–1)
 *   explode   0 → 1: the door's layers part along its normal (LAYERS)
 *   litGlass, litMesh, litHooks   0–1: that part glows faintly veille
 */
export function buildOven() {
  const group = new THREE.Group();
  const benchGroup = new THREE.Group();
  const fx = {};

  /* ══════════ the door ══════════ */
  const hinge = new THREE.Group();
  hinge.position.set(HINGE.x, 0, HINGE.z);
  group.add(hinge);
  const door = new THREE.Group();
  const REST = [DOOR.home[0] - HINGE.x, DOOR.home[1], DOOR.home[2] - HINGE.z];
  door.position.set(...REST);
  hinge.add(door);

  /* ── the bezel and its handle ── */
  const frame = makePart("frame");
  {
    const m = { ...metals(), cast: solid(0x464d55, { rough: 0.52, metal: 0.25, env: 0.9 }) };
    // its face, and behind it a wider rebate the glass sits in
    const face = plate(ringShape(DW, DH, 1.5, WIN.w, WIN.h, 0.8), 0.65, { bevel: 0.18 }).translate(0, 0, ZF - 0.65);
    const back = plate(ringShape(DW, DH, 1.5, 34.4, 24.4, 0.5), 0.85, { bevel: 0.06 }).translate(0, 0, -0.2);
    addMesh(frame, mergeGeometries([face, back]), m.cast, { edgeOpacity: 0.6 });
    const grip = box(1.5, HANDLE.y1 - HANDLE.y0 + 1.6, 1.25, 0.55, 4).translate(HANDLE_X, 0, ZF + HANDLE.out - 0.62);
    const posts = [-1, 1].map((s) => lyingZ(cyl(0.6, HANDLE.out - 1.1, 0.12, 24)).translate(HANDLE_X, s * 8.4, ZF + (HANDLE.out - 1.1) / 2));
    addMesh(frame, mergeGeometries([grip, ...posts]), m.fine, { edgeOpacity: 0.45 });
  }

  /* ── the glass: smoked (what is behind it is darker), and the studio lies across it ── */
  const glasses = [];
  const paneOf = (part, geometry, { gain, bands, order, smoke = 0, lines = 0.5 }) => {
    const mat = paneMaterial({ gain, bands });
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.renderOrder = order + 1;
    const edge = edgesOf(geometry, { color: BRAND.ink, width: 1.8, opacity: lines });
    mesh.add(edge);
    part.add(mesh);
    const entry = { mat, gain, line: edge.material, rest: edge.material.color.clone(), smoke: null };
    if (smoke) {
      geometry.computeBoundingBox();
      const b = geometry.boundingBox;
      entry.smoke = new THREE.MeshBasicMaterial({ color: 0x05070a, transparent: true, opacity: smoke, depthWrite: false, side: THREE.DoubleSide });
      entry.smoke.userData.base = smoke;
      const veil = new THREE.Mesh(new THREE.PlaneGeometry(b.max.x - b.min.x, b.max.y - b.min.y), entry.smoke);
      veil.position.set((b.max.x + b.min.x) / 2, (b.max.y + b.min.y) / 2, (b.max.z + b.min.z) / 2);
      veil.renderOrder = order;
      part.add(veil);
    }
    glasses.push(entry);
    return entry;
  };
  const pane = makePart("glass");
  const paneGlass = paneOf(pane, box(33.8, 23.8, 0.36, 0.1, 2).translate(0, 0, 0.47), { gain: 1, bands: 1, order: 8, smoke: 0.18 });

  /* ── the perforated plate ── */
  const sheet = makePart("mesh");
  {
    const mat = perforated(0xe8ebec);
    const geo = new THREE.PlaneGeometry(36, 26).translate(0, 0, PLATE_Z);
    const mesh = addMesh(sheet, geo, mat, { edgeOpacity: 0.5, edgeColor: 0x1d2226 });
    mesh.renderOrder = 7;
    fx.sheet = mesh;
    fx.dim = mat.userData.uniforms.uDim;
    // its folded edge: the sheet is a shallow tray
    const m = metals();
    addMesh(sheet, plate(ringShape(36, 26, 0.3, 35.2, 25.2, 0.15), 0.3, { bevel: 0.05 }).translate(0, 0, PLATE_Z - 0.3), m.hero, { edgeOpacity: 0.42 });
  }

  /* ── the inner film ── */
  const film = makePart("film");
  paneOf(film, box(34, 24, 0.06, 0.02, 1).translate(0, 0, -0.55), { gain: 0.6, bands: 0.5, order: 5, lines: 0.42 });

  /* ── the inner frame: the face that meets the oven, a groove running all round it ── */
  const inner = makePart("inner");
  {
    const m = metals();
    const b = bins(inner, m);
    b.put("steel", plate(ringShape(39.6, 33.6, 1.3, 32.6, 22.6, 0.6), 0.3, { bevel: 0.06 }).translate(0, 0, -0.95));
    b.put("steel", plate(ringShape(39.6, 33.6, 1.3, 37.2, 31.2, 0.8), 0.45, { bevel: 0.06 }).translate(0, 0, -0.65)); // the skirt that meets the bezel
    b.put("steel", plate(ringShape(39.6, 33.6, 1.3, 37.4, 31.4, 0.8), 0.35, { bevel: 0.09 }).translate(0, 0, -ZF)); // the outer lip of the groove…
    b.put("steel", plate(ringShape(35, 29, 0.8, 32.6, 22.6, 0.6), 0.35, { bevel: 0.09 }).translate(0, 0, -ZF)); // …and the inner one
    b.flush();
  }

  /* ── the two hooks: they lift together ── */
  const hooks = makePart("hooks");
  const slide = new THREE.Group();
  hooks.add(slide);
  {
    const m = metals();
    const geos = HOOK_Y.map((y) => plate(HOOK, 0.6, { bevel: 0.07 }).rotateY(Math.PI / 2).translate(HOOK_X - 0.3, y, -ZF));
    slide.add(addMesh(hooks, mergeGeometries(geos), m.fine, { edgeOpacity: 0.55 }));
  }

  door.add(inner, hooks, film, sheet, pane, frame);
  // the door's large pieces shadow the bench, not the oven: in the kitchen the key light must reach the cavity and the latch
  const casters = [frame, sheet, inner].flatMap((part) => part.userData.part.meshes.splice(0));
  fx.sheet.castShadow = true;
  if (!casters.includes(fx.sheet)) casters.push(fx.sheet);

  /* ── on the bench: a low plinth the door stands in ── */
  {
    const stand = makePart("stand");
    const m = { cast: solid(0x2c3238, { rough: 0.95, metal: 0, env: 0.35 }) };
    const b = bins(stand, m);
    const [bx, by, bz] = DOOR.bench;
    const foot = by - DH / 2; // the door's lower edge
    b.put("cast", box(31, 1.5, 9, 0.35).translate(bx, 0.75, bz));
    b.put("cast", box(30, foot - 1.4, 2.9, 0.1).translate(bx, 1.4 + (foot - 1.4) / 2, bz)); // the bed it rests on
    for (const s of [-1, 1]) b.put("cast", box(31, foot - 1.5 + 1.2, 1.6, 0.3).translate(bx, 1.5 + (foot - 1.5 + 1.2) / 2 - 0.02, bz + s * (ZF + 0.95)));
    b.flush();
    benchGroup.add(stand);
  }

  /* ══════════ the body, like an X-ray ══════════ */
  const shellMat = glass(BRAND.ink, { base: 0, rim: 0.16, power: 2.6, edge: 0.32, through: 0.3 });
  const shellLines = [];
  {
    const carcass = box(OVEN.x1 - OVEN.x0, OVEN.y1 - OVEN.y0, OVEN.z1 - OVEN.z0, 0.8, 3).translate((OVEN.x0 + OVEN.x1) / 2, (OVEN.y0 + OVEN.y1) / 2, (OVEN.z0 + OVEN.z1) / 2);
    const fascia = box(OVEN.x1 - OVEN.doorX1 - 0.3, OVEN.y1 - OVEN.y0, OVEN.doorThick, 0.5, 3).translate((OVEN.x1 + OVEN.doorX1) / 2 + 0.15, (OVEN.y0 + OVEN.y1) / 2, OVEN.z1 + ZF);
    for (const geo of [carcass, fascia]) {
      const mesh = new THREE.Mesh(geo, shellMat);
      const lines = edgesOf(geo, { color: BRAND.ink, width: 1.8, opacity: 0.4 });
      shellLines.push(lines);
      mesh.add(lines);
      group.add(mesh);
      asShell(mesh, 20);
    }
    // the control panel, drawn on the fascia: a display, six keys, a dial
    const zf = OVEN.z1 + OVEN.doorThick + 0.03;
    const loop = (x0, y0, x1, y1) => [[x0, y0, zf], [x1, y0, zf], [x1, y1, zf], [x0, y1, zf], [x0, y0, zf]];
    const marks = [loop(14.6, 168.6, 25.4, 173.6)];
    for (const cx of [17.1, 22.9]) for (const cy of [164.6, 161.6, 158.6]) marks.push(loop(cx - 2.3, cy - 0.9, cx + 2.3, cy + 0.9));
    marks.push(Array.from({ length: 41 }, (_, i) => [20 + 3.5 * Math.cos((i / 40) * Math.PI * 2), 151.2 + 3.5 * Math.sin((i / 40) * Math.PI * 2), zf]));
    marks.push([[20, 152.6, zf], [20, 154.7, zf]]);
    for (const pts of marks) {
      const line = fatLine(pts, { color: BRAND.ink, width: 1.8, opacity: 0.42 });
      shellLines.push(line);
      group.add(line);
    }
  }

  /* ── the cavity: five walls of metal, drawn by their edges; the flange the door closes on ── */
  const cav = makePart("cavity");
  {
    const { x0, x1, y0, y1, z0, z1 } = CAVITY;
    const xm = (x0 + x1) / 2;
    const ym = (y0 + y1) / 2;
    const zm = (z0 + z1) / 2;
    const wallMat = solid(0x98a1a9, { rough: 0.6, metal: 0.25, opacity: 0.18, double: true });
    wallMat.depthWrite = wallMat.userData.depthWrite = false;
    const flat = (w, h) => new THREE.PlaneGeometry(w, h).toNonIndexed();
    const walls = [
      flat(x1 - x0, y1 - y0).translate(xm, ym, z0),
      flat(z1 - z0, y1 - y0).rotateY(Math.PI / 2).translate(x0, ym, zm),
      flat(z1 - z0, y1 - y0).rotateY(-Math.PI / 2).translate(x1, ym, zm),
      flat(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate(xm, y0, zm),
      flat(x1 - x0, z1 - z0).rotateX(Math.PI / 2).translate(xm, y1, zm),
    ];
    addMesh(cav, mergeGeometries(walls), wallMat, { edges: false });
    const m = metals();
    const t = 0.36;
    const bars = [];
    for (const y of [y0, y1]) bars.push(box(x1 - x0 + t, t, t, 0.06).translate(xm, y, z0));
    for (const x of [x0, x1]) bars.push(box(t, y1 - y0 + t, t, 0.06).translate(x, ym, z0));
    for (const x of [x0, x1]) for (const y of [y0, y1]) bars.push(box(t, t, z1 - z0, 0.06).translate(x, y, zm));
    // the door's two hinge pins
    for (const y of [OVEN.y0 + 4.6, OVEN.y1 - 4.6]) bars.push(cyl(0.5, 3.4, 0.1, 20).translate(HINGE.x - 0.1, y, HINGE.z + 0.2));
    addMesh(cav, mergeGeometries(bars), m.fine, { edges: false });
    // the same edges as lines: from afar a bar is a hair, and a hair crawls
    const far = [
      [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z0]],
      ...[x0, x1].flatMap((x) => [y0, y1].map((y) => [[x, y, z0], [x, y, z1]])),
    ];
    for (const pts of far) {
      const line = fatLine(pts, { color: 0xa9b0b6, width: 2, opacity: 0.85 });
      cav.userData.part.mats.add(line.material);
      cav.add(line);
    }
    // the flange: the oven's face round the mouth, with the two slots the hooks enter by
    const [cx, cy] = [DOOR.home[0], DOOR.home[1]];
    const slots = HOOK_Y.map((y) => rrect(1.0, 3.1, 0.2, HOOK_X, y + 0.15, 3));
    const flange = plate(pierced(rrect(DW, DH, 1.2), rrect(x1 - x0, y1 - y0, 0.8, xm - cx, ym - cy), ...slots), 0.4, { bevel: 0.08 }).translate(cx, cy, OVEN.z1 - 0.4);
    addMesh(cav, flange, m.steel, { edgeOpacity: 0.5 });
  }

  /* ── the turntable, and a bowl on it (off its centre: one sees it go round) ── */
  const table = makePart("table");
  const turn = new THREE.Group();
  turn.position.set(TURNTABLE.x, TURNTABLE.y, TURNTABLE.z);
  table.add(turn);
  {
    const m = metals();
    const R = TURNTABLE.r;
    const tray = solid(0xaeb7be, { rough: 0.5, metal: 0, opacity: 0.42, env: 1.3 }); // (at 0.22 it mirrored the rim light: a white slab under whatever stood over it)
    tray.depthWrite = tray.userData.depthWrite = false;
    turn.add(addMesh(table, lathe([[0, 0], [R - 1, 0], [R, 0.55], [R, 0.95], [R - 0.5, 0.95], [R - 1.2, 0.45], [0, 0.45]], 72, { bevel: 0.1, round: 2 }), tray, { edgeColor: BRAND.ink, edgeOpacity: 0.5 }));
    // under it: the roller ring, its three arms and wheels, the coupler
    const under = [cyl(1.3, 0.55, 0.1, 24).translate(0, -0.3, 0), new THREE.TorusGeometry(R - 4.5, 0.16, 8, 64).rotateX(Math.PI / 2).toNonIndexed().translate(0, -0.3, 0)];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      under.push(box(R - 5.6, 0.2, 0.7, 0.06).rotateY(-a).translate(Math.cos(a) * (R - 3.4) * 0.5, -0.3, Math.sin(a) * (R - 3.4) * 0.5));
      under.push(lyingX(cyl(0.42, 0.5, 0.08, 16)).rotateY(-a).translate(Math.cos(a) * (R - 4.5), -0.3, Math.sin(a) * (R - 4.5)));
    }
    turn.add(addMesh(table, mergeGeometries(under), m.steel, { edgeOpacity: 0.34 }));
    // the bowl
    const bowl = solid(0xe6e1d6, { rough: 0.32, metal: 0, env: 1 });
    const BOWL = [3.4, 0.95, 0.6];
    turn.add(addMesh(table, lathe([[0, 0], [2.7, 0], [3.1, 0.25], [5.4, 2.4], [6.1, 4.7], [5.7, 4.7], [5.0, 2.6], [2.6, 0.6], [0, 0.6]], 64, { bevel: 0.12, round: 2 }).translate(...BOWL), bowl, { edgeOpacity: 0.5 }));
    const food = solid(0xb9b3a6, { rough: 0.8, metal: 0 });
    turn.add(addMesh(table, cyl(5.35, 0.3, 0.08, 48).translate(BOWL[0], BOWL[1] + 3.5, BOWL[2]), food, { edges: false }));
    fx.food = anchor(turn, BOWL[0], BOWL[1] + 3.8, BOWL[2]);
  }

  /* ── the lamp: a light that has a place (the cavity's right wall, up and back) ── */
  const lamp = new THREE.PointLight(WARM, 0, 70, 2);
  lamp.position.set(...LAMP_AT);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 16), softGlow(2.6));
  bulb.position.set(...LAMP_AT);
  bulb.renderOrder = 5;
  group.add(lamp, bulb);

  /* ── the magnetron (drawn standing, its antenna up; laid with the antenna toward the cavity) and its waveguide ── */
  const mag = makePart("magnetron");
  {
    const m = metals();
    const frameM = new THREE.Group();
    frameM.position.set(MAGNETRON.x, MAGNETRON.y, MAGNETRON.z);
    frameM.rotation.z = Math.PI / 2;
    mag.add(frameM);
    const b = bins(mag, m, frameM);
    b.put("cast", cyl(2.1, 5.7, 0.1, 40)); // the anode block
    for (const s of [-1, 1]) {
      b.put("cast", cyl(3.4, 0.9, 0.14, 40).translate(0, s * 3.35, 0)); // the two magnets
      b.put("cast", box(8.7, 0.45, 8.7, 0.12).translate(0, s * 4.05, 0)); // the yoke: two plates…
    }
    b.put("cast", box(8.7, 8.5, 0.45, 0.12).translate(0, 0, -4.12)); // …and its back
    for (let i = 0; i < 8; i++) b.put("steel:hw", box(8, 0.11, 8, 0.03, 1).translate(0, -2.45 + i * 0.7, 0)); // the cooling fins
    b.put("fine", lathe([[0, 4.3], [1.35, 4.3], [1.35, 5.0], [0.85, 5.2], [0.85, 6.0], [0.5, 6.45], [0, 6.45]], 32, { bevel: 0.08, round: 2 })); // the antenna
    b.put("cast", box(5.4, 2.4, 5, 0.2).translate(0, -5.6, 0.4)); // the filter box, and its two terminals
    for (const s of [-1, 1]) b.put("fine:hw", lyingZ(cyl(0.36, 1.1, 0.06, 16)).translate(s * 0.9, -5.6, 3.4));
    b.flush();
    // the waveguide: a duct from the antenna to the cavity's wall
    const w = bins(mag, m);
    w.put("cast", box(CAVITY.x1 + 5 - CAVITY.x1, 6.8, 11, 0.25).translate(CAVITY.x1 + 2.5, MAGNETRON.y, MAGNETRON.z));
    w.put("steel", box(0.3, 8, 12.2, 0.08).translate(CAVITY.x1 + 0.17, MAGNETRON.y, MAGNETRON.z));
    w.flush();
  }

  /* ── the latch board: strikes for the hooks, three microswitches, the rocker of the third ── */
  const latch = makePart("latch");
  const switches = [];
  {
    const m = { ...metals(), body: solid(0x5d656d, { rough: 0.6, metal: 0.1, env: 0.7 }) };
    const b = bins(latch, m);
    const { x, z, t, h, l } = SW;
    const zFront = OVEN.z1 - 0.6; // the board stops short of the flange
    const zBack = 48.6;
    const zMid = (zFront + zBack) / 2;
    const paneMat = solid(0x98a1a9, { rough: 0.6, metal: 0.1, opacity: 0.16, double: true });
    paneMat.depthWrite = paneMat.userData.depthWrite = false;
    addMesh(latch, new THREE.PlaneGeometry(zFront - zBack, LATCH.h).rotateY(-Math.PI / 2).translate(12.15, LATCH.y, zMid), paneMat, { edges: false });
    for (const zz of [zBack, zFront]) b.put("board", box(0.5, LATCH.h + 0.5, 0.5, 0.1).translate(12.15, LATCH.y, zz));
    for (const dy of [-LATCH.h / 2, LATCH.h / 2]) b.put("board", box(0.5, 0.5, zFront - zBack, 0.1).translate(12.15, LATCH.y + dy, zMid), box(3, 0.5, 2.4, 0.1).translate(13.9, LATCH.y + dy, zMid)); // …and the two feet it is screwed by
    for (const y0 of HOOKS.y) {
      b.put("steel", box(1.7, 0.7, 0.6, 0.1).translate(11.15, y0 - 0.8, OVEN.z1 - 1.05)); // the strike the nose drops behind
      b.put("board", box(1.7, 0.35, 1.2, 0.08).translate(11.15, y0 + 1.75, OVEN.z1 - 1.4)); // the guide above the hook
    }
    const pips = [];
    for (const [i, y0] of [HOOKS.y[1], HOOKS.y[0], MON_Y].entries()) {
      const yc = y0 - 1.35 - h / 2;
      const top = yc + h / 2;
      b.put("body", box(t, h, l, 0.14).translate(x, yc, z));
      b.put("body", box(0.5, 0.3, 0.5, 0.06).translate(x, top + 0.13, z - 1.5)); // the lever's hinge
      for (const dz of [-1.1, 1.1]) b.put("fine:hw", lyingX(cyl(0.17, 0.1, 0.03, 12)).translate(x - t / 2 - 0.03, yc - 0.4, z + dz)); // two rivets
      for (const dz of [-1.2, 0, 1.2]) b.put("fine:hw", box(0.12, 0.95, 0.5, 0.04).translate(x, yc - h / 2 - 0.45, z + dz)); // three terminals
      const pip = glow(BRAND.ink, 0.07);
      pips.push(pip);
      switches.push({ i, yc, top, pip, terminals: yc - h / 2 - 0.9 });
    }
    b.flush();
    for (const s of switches) {
      // what moves: the lever on its hinge, the plunger under it; and the pip that says whether the contact is made
      s.lever = new THREE.Group();
      s.lever.position.set(x, s.top + 0.27, z - 1.5);
      s.lever.add(addMesh(latch, mergeGeometries([box(0.9, 0.16, SW.lever, 0.05).translate(0, 0, SW.lever / 2), lyingX(cyl(0.2, 0.9, 0.04, 12)).translate(0, -0.04, SW.lever)]), m.fine, { edgeOpacity: 0.45 }));
      s.plunger = addMesh(latch, cyl(0.2, 0.5, 0.05, 16), m.fine, { edges: false, pos: [x, s.top - 0.05, z + 0.75] });
      const lens = new THREE.Mesh(lyingX(cyl(0.34, t + 0.2, 0.04, 24)), s.pip); // through the body: it shows on both faces
      lens.position.set(x, s.yc + 0.3, z + 0.15);
      latch.userData.part.mats.add(s.pip);
      latch.add(s.lever, lens);
    }
    // the rocker: a finger on a pivot of the board, over the third switch's lever
    fx.crank = new THREE.Group();
    fx.crank.position.set(x, MON_Y + 0.3, z - 1.3);
    fx.crank.add(addMesh(latch, plate(CRANK, 0.5, { bevel: 0.07 }).rotateY(-Math.PI / 2).translate(0.25, 0, 0), m.fine, { edgeOpacity: 0.55 }));
    fx.crank.add(addMesh(latch, lyingX(cyl(0.26, 1.5, 0.05, 16)).translate(0.35, 0, 0), m.steel, { edges: false }));
    latch.add(fx.crank);
  }
  const [sw1, sw2, mon] = switches;

  /* ── the fuse: a glass cartridge in two clips, on its small board ── */
  const fuse = makePart("fuse");
  const [fxX, fxY, fxZ] = FUSE_AT;
  {
    const m = metals();
    const b = bins(fuse, m);
    b.put("board", box(0.18, 3.8, 6.8, 0.06).translate(fxX + 0.8, fxY + 0.4, fxZ));
    for (const s of [-1, 1]) {
      const zc = fxZ + s * 1.43;
      b.put("fine", lyingZ(cyl(0.5, 0.75, 0.08, 28)).translate(fxX, fxY, zc)); // the cap
      b.put("steel:hw", box(1.25, 0.2, 0.6, 0.05).translate(fxX, fxY - 0.62, zc), box(0.9, 0.2, 0.6, 0.05).translate(fxX + 0.42, fxY - 0.62, zc)); // the clip, and its foot on the board
      for (const sx of [-1, 1]) b.put("steel:hw", box(0.1, 0.95, 0.6, 0.03).translate(fxX + sx * 0.58, fxY - 0.2, zc));
    }
    b.flush();
    fx.tube = glass(BRAND.ink, { base: 0.02, rim: 0.3, power: 2.4, edge: 0.45, spec: 0.8 });
    const tubeMesh = new THREE.Mesh(lyingZ(new THREE.CylinderGeometry(0.46, 0.46, 2.12, 32, 1, true)), fx.tube);
    tubeMesh.position.set(fxX, fxY, fxZ);
    tubeMesh.renderOrder = 6;
    fx.soot = solid(0x0b0d0f, { rough: 0.9, metal: 0, opacity: 0 });
    fx.soot.transparent = true;
    fx.sootMesh = new THREE.Mesh(lyingZ(cyl(0.41, 2.1, 0.03, 24)), fx.soot);
    fx.sootMesh.position.set(fxX, fxY, fxZ);
    fx.sootMesh.visible = false;
    fx.filament = fatLine([[fxX, fxY, fxZ - 1.06], [fxX, fxY, fxZ + 1.06]], { color: BRAND.ink, width: 2.4 });
    // broken: two stubs, their ends drooping
    fx.stubs = [-1, 1].map((s) => fatLine([[fxX, fxY, fxZ + s * 1.06], [fxX, fxY - 0.05, fxZ + s * 0.6], [fxX, fxY - 0.24, fxZ + s * 0.42]], { color: 0x8c949b, width: 2.4 }));
    fx.spark = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), haloMaterial(0.8, true));
    fx.spark.position.set(fxX, fxY, fxZ);
    fx.spark.renderOrder = 9;
    fx.spark.frustumCulled = false;
    fx.spark.visible = false;
    for (const stub of fx.stubs) fuse.userData.part.mats.add(stub.material);
    fuse.add(fx.sootMesh, tubeMesh, fx.filament, ...fx.stubs, fx.spark);
  }

  /* ── the wires: mains → fuse → lower interlock → upper interlock → magnetron; and the monitor, across to the fuse ── */
  const wires = makePart("wires");
  const sheaths = {};
  {
    const m = metals();
    const { x } = SW;
    const tz = (dz) => SW.z + dz; // a terminal's z
    const runs = [];
    let s = 0;
    const lay = (points) => {
      const w = wire(points, s);
      s += w.len;
      runs.push(w);
      return w;
    };
    const chain = [
      lay([[23.4, 145.3, OVEN.z0 + 1], [23.4, 145.3, fxZ - 6], [fxX, fxY - 2.3, fxZ - 2.2], [fxX, fxY - 0.75, fxZ - 1.43]]), // from the mains to the fuse
      lay([[fxX, fxY - 0.75, fxZ + 1.43], [fxX, fxY - 2.6, fxZ + 2.4], [14.4, sw2.terminals - 1.4, tz(1.2)], [x, sw2.terminals - 1.3, tz(1.2)], [x, sw2.terminals, tz(1.2)]]), // …to the lower interlock
      lay([[x, sw2.terminals, tz(-1.2)], [x, sw2.terminals - 0.95, tz(-1.2)], [x, sw2.terminals - 0.95, tz(-2.6)], [x, sw1.terminals - 0.95, tz(-2.6)], [x, sw1.terminals - 0.95, tz(-1.2)], [x, sw1.terminals, tz(-1.2)]]), // …up to the upper one
      lay([[x, sw1.terminals, tz(1.2)], [x, sw1.terminals - 0.7, tz(1.2)], [x - 0.5, sw1.terminals - 0.85, tz(0.5)], [x - 0.5, sw1.terminals - 0.85, tz(-3.9)], [13.2, sw1.terminals - 0.85, tz(-5.2)], [21, 164.6, 42.5], [MAGNETRON.x + 5.6, MAGNETRON.y + 0.9, MAGNETRON.z + 4.1]]), // …and to the magnetron
    ];
    const tap = wire([[x, mon.terminals - 0.95, tz(-2.6)], [x, mon.terminals - 0.95, tz(-1.2)], [x, mon.terminals, tz(-1.2)]], 0); // the monitor is fed from the chain…
    const short = wire([[x, mon.terminals, tz(1.2)], [x, mon.terminals - 1.2, tz(1.2)], [13.6, mon.terminals - 1.6, tz(1.2)], [17.5, fxY + 3.4, fxZ + 3.4], [fxX, fxY + 1.5, fxZ + 1.6], [fxX, fxY + 0.55, fxZ + 1.43]], 0); // …and its other side goes straight back to the fuse
    const all = [...chain, tap, short];
    addMesh(wires, mergeGeometries(all.map((w) => w.solid)), m.steel, { edges: false });
    addMesh(wires, new THREE.SphereGeometry(0.3, 16, 12).translate(x, mon.terminals - 0.95, tz(-2.6)), m.steel, { edges: false }); // the splice
    for (const w of all) {
      const line = fatLine(w.line, { color: 0x858d95, width: 2, opacity: 0.9 });
      wires.userData.part.mats.add(line.material);
      wires.add(line);
    }
    const sheath = (list) => {
      const mesh = new THREE.Mesh(mergeGeometries(list.map((w) => w.sheath)), sheathMaterial());
      mesh.renderOrder = 4;
      mesh.frustumCulled = false;
      mesh.visible = false;
      wires.add(mesh);
      return mesh;
    };
    sheaths.chain = sheath([...chain, tap]);
    sheaths.short = sheath([short]);
  }

  group.add(cav, table, mag, latch, fuse, wires);

  /* ══════════ anchors ══════════ */
  const A = {
    door: anchor(door, 0, 0, 0),
    plate: anchor(sheet, 0, 0, PLATE_Z),
    hole: anchor(sheet, HOLES.origin[0] - DOOR.home[0], HOLES.origin[1] - DOOR.home[1], PLATE_Z),
    handle: anchor(frame, HANDLE_X, 0, ZF + HANDLE.out),
    hookTop: anchor(slide, HOOK_X, HOOK_Y[1] - 0.3, -ZF - 1.9),
    hookBottom: anchor(slide, HOOK_X, HOOK_Y[0] - 0.3, -ZF - 1.9),
    latch: anchor(group, SW.x, LATCH.y, SW.z + 0.6),
    sw1: anchor(group, SW.x - SW.t / 2, sw1.yc, SW.z),
    sw2: anchor(group, SW.x - SW.t / 2, sw2.yc, SW.z),
    monitor: anchor(group, SW.x - SW.t / 2, mon.yc, SW.z),
    fuse: anchor(group, fxX, fxY, fxZ),
    magnetron: anchor(group, MAGNETRON.x, MAGNETRON.y, MAGNETRON.z),
    cavity: anchor(group, (CAVITY.x0 + CAVITY.x1) / 2, (CAVITY.y0 + CAVITY.y1) / 2, (CAVITY.z0 + CAVITY.z1) / 2),
    food: fx.food,
    // on the bench (they follow their layer as the door opens up)
    glass: anchor(pane, -14.5, 8, 0.47),
    mesh: anchor(sheet, -15, 0, PLATE_Z),
    film: anchor(film, -15, -8, -0.55),
    frame: anchor(frame, -18, 13, ZF),
    hooks: anchor(slide, HOOK_X, HOOK_Y[1], -ZF - 1.2),
  };

  /* ══════════ what lights up when the voice names a part: its metal and the lines of its edges ══════════ */
  const lampOf = (part) => {
    const mats = [...part.userData.part.mats];
    const lines = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lines) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.glow = 0.2 * (1 - 0.85 * Math.min(1, lum(mat.color)));
    }
    return { solids, lines, on: -1 };
  };
  const light = (l, k) => {
    if (l.on === k) return;
    l.on = k;
    for (const mat of l.solids) {
      mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k);
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.7 * k);
    }
    for (const line of l.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };
  const lamps = { mesh: lampOf(sheet), hooks: lampOf(hooks) };

  const hue = new THREE.Color();
  const shown = { door: -1, shell: -1, core: -1, explode: -1, glass: -1, bench: null };

  return {
    group, benchGroup, A,
    update(p, time = 0) {
      /* ── the door: where it is ── */
      const onBench = p.bench > 0.5;
      if (onBench !== shown.bench) {
        shown.bench = onBench;
        (onBench ? benchGroup : hinge).add(door);
        door.position.set(...(onBench ? DOOR.bench : REST));
        for (const mesh of casters) mesh.castShadow = onBench;
      }
      hinge.rotation.y = -clamp01(p.open ?? 0) * SWING * DEG;
      const there = clamp01(p.door ?? 1);
      if (there !== shown.door) {
        shown.door = there;
        door.visible = there > 0.004;
        for (const part of [frame, sheet, inner, hooks]) setPartOpacity(part, there);
        for (const g of glasses) {
          g.mat.uniforms.uAmount.value = there;
          g.line.opacity = g.line.userData.base * there;
          if (g.smoke) g.smoke.opacity = g.smoke.userData.base * there;
        }
      }
      const up = clamp01(p.latch ?? 0);
      slide.position.y = LIFT * up;

      /* ── its layers ── */
      const k = clamp01(p.explode ?? 0);
      if (k !== shown.explode) {
        shown.explode = k;
        frame.position.z = LAYERS.frame * ease(ramp(k, 0, 0.75));
        pane.position.z = LAYERS.glass * ease(ramp(k, 0.08, 0.85));
        film.position.z = LAYERS.film * ease(ramp(k, 0.08, 0.85));
        inner.position.z = LAYERS.inner * ease(ramp(k, 0, 0.8));
        fx.dim.value = DIM + (1 - DIM) * ease(ramp(k, 0.05, 0.6)); // out from behind its glass, the plate is as clear as it is
        hooks.position.z = LAYERS.inner * ease(ramp(k, 0, 0.8)) + (LAYERS.hooks - LAYERS.inner) * ease(ramp(k, 0.55, 1)); // they leave with the frame, then come out of it
      }
      light(lamps.mesh, clamp01(p.litMesh ?? 0));
      light(lamps.hooks, clamp01(p.litHooks ?? 0));
      const lg = clamp01(p.litGlass ?? 0);
      if (lg !== shown.glass) {
        shown.glass = lg;
        paneGlass.mat.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.7 * lg);
        paneGlass.mat.uniforms.uGain.value = paneGlass.gain * (1 + 0.8 * lg); // more, and the pane is a green sticker
        paneGlass.line.color.copy(paneGlass.rest).lerp(VEILLE, 0.7 * lg);
      }
      if (onBench) return;

      /* ── the body ── */
      const shellK = smooth(ramp(p.body ?? 1, 0.5, 1));
      const coreK = smooth(ramp(p.body ?? 1, 0, 0.5));
      if (shellK !== shown.shell) {
        shown.shell = shellK;
        shellMat.uniforms.uAmount.value = shellK;
        for (const line of shellLines) {
          line.material.opacity = line.material.userData.base * shellK;
          line.visible = shellK > 0.004;
        }
        setPartOpacity(cav, shellK);
        setPartOpacity(table, shellK);
      }
      if (coreK !== shown.core) {
        shown.core = coreK;
        for (const part of [mag, latch, fuse, wires]) setPartOpacity(part, coreK);
        fx.tube.uniforms.uAmount.value = coreK;
      }
      turn.rotation.y = -(p.spin ?? 0) * Math.PI * 2;
      const lit = clamp01(p.lamp ?? 0) * shellK;
      lamp.intensity = 900 * lit;
      bulb.visible = lit > 0.01;
      bulb.material.uniforms.uColor.value.copy(WARM).multiplyScalar(1.05 * lit);

      /* ── the safety chain ── */
      const whole = clamp01(p.fuse ?? 1);
      const stuck = clamp01(p.stuck ?? 0);
      const closed = Math.max(clamp01(p.sw ?? 0), stuck);
      const live = closed * whole;
      const let_go = Math.min(1, (LIFT * up) / (SW.lever * Math.sin(RELEASE))); // the lever follows the hook up, then stops
      hue.copy(VEILLE).lerp(SIGNAL, stuck);
      for (const s of [sw1, sw2]) {
        s.lever.rotation.x = -RELEASE * let_go;
        s.plunger.position.y = s.top - 0.05 + 0.4 * let_go;
        s.pip.color.copy(INK).lerp(hue, Math.min(1, closed * 3)).multiplyScalar(0.07 + 2.3 * closed * (0.3 + 0.7 * whole));
      }
      const m3 = clamp01(p.monitor ?? 0);
      fx.crank.rotation.x = -CRANK_REST * (1 - m3);
      mon.lever.rotation.x = -RELEASE * (1 - m3);
      mon.plunger.position.y = mon.top - 0.05 + 0.4 * (1 - m3);
      mon.pip.color.copy(INK).lerp(VEILLE, Math.min(1, m3 * 3)).multiplyScalar(0.07 + 2.3 * m3);

      const chainOn = 1.25 * live * coreK;
      sheaths.chain.visible = chainOn > 0.01;
      sheaths.chain.material.uniforms.uOn.value = chainOn;
      sheaths.chain.material.uniforms.uColor.value.copy(hue);
      sheaths.chain.material.uniforms.uTime.value = time;
      const shortOn = 1.6 * live * m3 * coreK;
      sheaths.short.visible = shortOn > 0.01;
      sheaths.short.material.uniforms.uOn.value = shortOn;
      sheaths.short.material.uniforms.uColor.value.copy(hue);
      sheaths.short.material.uniforms.uTime.value = time;

      /* ── the fuse ── */
      fx.filament.visible = whole > 0.5;
      for (const stub of fx.stubs) stub.visible = whole <= 0.5;
      fx.filament.material.color.copy(INK).lerp(hue, live).multiplyScalar(1 + 1.3 * live);
      fx.filament.material.opacity = coreK;
      const soot = 0.9 * (1 - whole) * coreK;
      fx.sootMesh.visible = soot > 0.01;
      fx.soot.opacity = soot;
      fx.tube.uniforms.uGain.value = 1 - 0.55 * (1 - whole);
      const flash = Math.max(0, p.spark ?? 0) * coreK;
      fx.spark.visible = flash > 0.01;
      if (fx.spark.visible) {
        const U = fx.spark.material.uniforms;
        U.uColor.value.copy(HOT).multiplyScalar(Math.min(1.3, 1.1 * Math.pow(flash, 0.6)));
        U.uRadius.value = 0.9 + 3.6 * flash;
        U.uMinPx.value = 8 + 24 * flash;
      }
    },
  };
}
