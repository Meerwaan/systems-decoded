// DOSSIER L04 — the SOLID systems we open: the two steam catapults, the holdback bar and its calibrated piece, the launch
// valve and the steam receiver, the control cabin, the jet blast deflector, the three wires and their brake, the landing
// mirror — and, on the bench, a steam cylinder beside an electromagnetic launcher, and Ely's ropes (1911).
//
//   buildModel() → { cats, holdback, holdbackHome, cabin, brins, mirror, bench, set(p, time, px) }
//     cats[0], cats[1]  { group, A: { shuttle, croc } } — the bow and the oblique catapult. `group` is in THE SHIP'S FRAME
//                       (origin = the ship's origin, no rotation): its children stand at their plan.js places (the
//                       cylinders, the pistons, the shuttle and its hook, the slot, the water brake; and for the bow one
//                       the launch valve and its dial, the receiver, the pipes, the deflector, the holdback's deck
//                       fitting). A.shuttle rides the stroke; A.croc is the throat of the shuttle's hook (where the
//                       launch bar sits: onCat(0, 30, 14) at rest)
//     holdback          { group, A: { gear, deck, neck } } — THE HERO: the bar and its calibrated piece, built around the
//                       piece (its origin is the piece's neck, the bar along z: the gear end toward −z). world.js re-parents
//                       `group` between `holdbackHome` (in the ship: set() moves it to where the neck is, between the
//                       nose gear and the deck fitting) and the bench (at its origin: set() lays it on the bench)
//     holdbackHome      Group in the ship's frame (set() places it)
//     cabin             { group, A: { seats: [Object3D, Object3D] } } — in the ship's frame at CABIN.at; each seat is on
//                       the cabin's FLOOR under a chair (y = −88 from the deck), turned so that its +z looks at the screens
//                       (toward starboard, +x): a figure "looking toward +z" sits facing the console
//     brins             { group, A: { bight, labels: [3 Object3D], athena, aphrodite, andromede } } — the three wires
//                       across the angled runway, their deck sheaves, the purchase cables and the three brakes under the
//                       deck (Andromède's works); the bight of Andromède follows `hookAt` once `caught`. A.labels[i]: 60 cm
//                       above the middle of wire i (a label's anchor). The laser and the three glide guides live here too
//     mirror            { group, A: { ball } } — the landing mirror at MIRROR.at, its face toward the aircraft that comes
//                       (local +z = −ANGLED_DIR: astern)
//     bench             { emals: Group, ely: Group } — bench items 2 and 4, at the bench's origin (world.js shows one)
//     set(p, time, px)  see FIRST in world.js; every key may be missing (on the bench only a few are given): rest values.
//                       Called sixteen times a frame: nothing is allocated inside. OPTIONAL, not in FIRST yet: traceOut
//                       (0–1, fades the traced slot where it stands).
//
// Three values of grey: frames, rods and housings dark · sockets, sheaves, the shuttle in between · the hearts (the
// calibrated piece, the pistons, the valve's disc) clear. Light: VEILLE is what launches you and catches you (the
// steam, the piece under load, the wires, the mirror's datum), SIGNAL the threat (the meatball too low, the wave-off,
// the oil once it has heated). Liberties (docs/journal/L04-model.md): it is a model — the shuttle stops in its water
// brake ≈ 2.6 m short of the deck's edge (the plan's 75 m run past the bow on the catapult's line), the purchase
// cables are a two-part tackle, the cylinders' slot is a dark seam, the brake lies at ENGINE.y.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, edgesOf, fatLine, makePart, addMesh as kitAddMesh, setPartOpacity, anchor, box, cyl, lathe, plate, mergeGeometries } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import {
  SHIP, CAT, onCat, STROKE, TROUGH, HOLDBACK, TANK, VALVE, CABIN, JBD, BRINS, ENGINE, MIRROR, TOUCH, ANGLED, ANGLED_DIR, ANGLED_YAW, onAngled, RAFALE,
} from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const WHITE = new THREE.Color(1, 0.97, 0.9);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const TINT_S = new THREE.Color(1, 0.5, 0.36); // …and signal light
const vec3 = (c) => `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.05 * (u > 0.5 ? 1 : 0.25);
const win = (k, a, b) => settle(ramp(k, a, b));

/** The kit's addMesh, onto a plain group inside a part too (the mesh's materials go to the nearest part above it). */
function addMesh(target, geometry, material, o) {
  let part = target;
  while (part && !part.userData.part) part = part.parent;
  const mesh = kitAddMesh(part, geometry, material, o);
  if (target !== part) target.add(mesh);
  return mesh;
}

/* ─────────────────────────────────────────────────────────── geometry helpers */

const alongZ = (profile, segments = 48, bevel = 0.8) => lathe(profile, segments, { bevel, round: 2 }).rotateX(Math.PI / 2); // [r, z]
const alongX = (profile, segments = 48, bevel = 0.8) => lathe(profile, segments, { bevel, round: 2 }).rotateZ(-Math.PI / 2); // [r, x]
const ringZ = (r0, r1, z0, z1, seg = 64, bevel = 0.8) => alongZ([[r0, z0], [r1, z0], [r1, z1], [r0, z1], [r0, z0]], seg, bevel);
const discZ = (r, z0, z1, seg = 48, bevel = 0.8) => alongZ([[0, z0], [r, z0], [r, z1], [0, z1]], seg, bevel);
const discX = (r, x0, x1, seg = 48, bevel = 0.8) => alongX([[0, x0], [r, x0], [r, x1], [0, x1]], seg, bevel);

/** A round of radius `r` swept through `points` (015's): it carries `aS`, the length run since the first point. */
function tube(points, r, { radial = 12, extra = {} } = {}) {
  const n = points.length;
  const ring = radial + 1;
  const pos = [];
  const nor = [];
  const sAt = [];
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
  for (const k in more) geo.setAttribute(k, new THREE.Float32BufferAttribute(more[k], 1));
  geo.setIndex(index);
  geo.userData.length = s;
  return geo;
}

/** A path of straight runs with rounded corners (radius `bend`), for a pipe. */
function bentPath(corners, bend = 40, steps = 6) {
  const out = [];
  for (let i = 0; i < corners.length; i++) {
    const p = V(...corners[i]);
    if (i === 0 || i === corners.length - 1) {
      out.push(p);
      continue;
    }
    const a = V(...corners[i - 1]);
    const b = V(...corners[i + 1]);
    const u = a.clone().sub(p);
    const w = b.clone().sub(p);
    const k = Math.min(bend, u.length() / 2.2, w.length() / 2.2);
    const pa = p.clone().addScaledVector(u.normalize(), k);
    const pb = p.clone().addScaledVector(w.normalize(), k);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      // a quadratic Bézier through the corner: a fillet
      out.push(V().addScaledVector(pa, (1 - t) * (1 - t)).addScaledVector(p, 2 * t * (1 - t)).addScaledVector(pb, t * t));
    }
  }
  return out;
}

/** The deck outline (plan.js) — is (x, z) on the deck? */
function onDeck(x, z) {
  const P = SHIP.deck;
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, zi] = P[i];
    const [xj, zj] = P[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
/** How far along catapult `i` the deck goes (cm from where the shuttle waits). */
function deckEdgeS(i) {
  let s = 0;
  while (s < STROKE + 2000) {
    const p = onCat(i, s);
    if (!onDeck(p[0], p[2])) break;
    s += 10;
  }
  return s - 10;
}

/* ─────────────────────────────────────────────────────────── materials that carry light */

const BARS = /* glsl */ `
  // bars of light, their ends softened over what a pixel covers — and melted into their mean once too small to count
  float bars(float x, float duty) {
    float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
    float q = fract(x);
    float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
    return mix(b, duty, smoothstep(0.12, 0.4, w));
  }`;

/**
 * A ribbon of light along a polyline that always faces the eye: never under `minPx` pixels wide (a line seen from
 * far never breaks into dots), revealed from its first point up to `uHead` (cm along it; < 0: all of it), a head of
 * light at `uHead` (`uHeadK`), dashed if `uPeriod` > 0 (dashes melt into their mean before they go under the pixel:
 * nothing crawls), faded within `uNear` cm of the eye (a guide the camera rides along never fills the frame).
 * `uCore` 0–1: how much of its width is the core; the rest a soft halo.
 */
function ribbon(points, { width = 6, minPx = 2, color = VEILLE, period = 0, duty = 0.55, core = 1, halo = 0, near = 0, H }) {
  const n = points.length;
  const pos = new Float32Array(n * 2 * 3);
  const tan = new Float32Array(n * 2 * 3);
  const side = new Float32Array(n * 2);
  const sAt = new Float32Array(n * 2);
  const index = [];
  let s = 0;
  for (let i = 0; i < n; i++) {
    const p = points[i];
    if (i) s += p.distanceTo(points[i - 1]);
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(n - 1, i + 1)];
    const t = V().subVectors(b, a).normalize();
    for (let k = 0; k < 2; k++) {
      const j = i * 2 + k;
      pos.set([p.x, p.y, p.z], j * 3);
      tan.set([t.x, t.y, t.z], j * 3);
      side[j] = k ? 1 : -1;
      sAt[j] = s;
    }
    if (i) index.push((i - 1) * 2, (i - 1) * 2 + 1, i * 2, i * 2, (i - 1) * 2 + 1, i * 2 + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aTan", new THREE.BufferAttribute(tan, 3));
  geo.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
  geo.setAttribute("aS", new THREE.BufferAttribute(sAt, 1));
  geo.setIndex(index);
  geo.userData.length = s;
  const U = {
    uColor: { value: color.clone() }, uAmount: { value: 0 }, uWidth: { value: width }, uMinPx: { value: minPx }, uH: { value: H },
    uHead: { value: -1 }, uHeadK: { value: 0 }, uHeadLen: { value: 120 }, uPeriod: { value: period }, uDuty: { value: duty },
    uCore: { value: core }, uHalo: { value: halo }, uNear: { value: near },
  };
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: U,
    vertexShader: /* glsl */ `
      attribute vec3 aTan; attribute float aSide; attribute float aS;
      uniform float uWidth, uMinPx, uH; varying float vS; varying float vX; varying float vD;
      void main() {
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        vec3 t = normalize(mat3(modelViewMatrix) * aTan);
        vec3 v = normalize(-p.xyz);
        vec3 sd = cross(t, v);
        float ls = length(sd);
        sd = ls > 1e-4 ? sd / ls : vec3(1.0, 0.0, 0.0);
        float cmPerPx = max(1.0, -p.z) / (projectionMatrix[1][1] * uH * 0.5);
        float w = max(uWidth, uMinPx * cmPerPx);
        p.xyz += sd * aSide * w * 0.5;
        vS = aS; vX = aSide; vD = -p.z;
        gl_Position = projectionMatrix * p;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uHead, uHeadK, uHeadLen, uPeriod, uDuty, uCore, uHalo, uNear;
      varying float vS; varying float vX; varying float vD;
      ${BARS}
      void main() {
        if (uAmount < 0.002) discard;
        float ax = clamp(abs(vX), 0.0, 1.0);
        float prof = (1.0 - smoothstep(uCore * 0.55, uCore, ax)) + uHalo * (1.0 - ax) * (1.0 - ax);
        float lit = uHead < 0.0 ? 1.0 : 1.0 - smoothstep(uHead - 30.0, uHead, vS);
        float dash = uPeriod > 0.0 ? bars(vS / uPeriod, uDuty) : 1.0;
        float d = (vS - uHead) / max(uHeadLen, 1.0);
        float head = uHead < 0.0 ? 0.0 : uHeadK * exp(-d * d);
        float near = uNear > 0.0 ? smoothstep(uNear, uNear * 2.5, vD) : 1.0;
        gl_FragColor = vec4(uColor * uAmount * (lit * dash + head) * prof * near, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, U, length: s };
}

/**
 * A volume of light (steam, oil): brighter where the eye goes through more of it (a column, not a disc), rings that
 * stream along `uAxis` at a FIXED speed when `uFlow` is up (150 cm/s for a 46 cm period: a ninth of it a frame).
 */
function volume(color, base = 0.4) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: color.clone() }, uAmount: { value: 0 }, uTime: { value: 0 }, uFlow: { value: 0 }, uBase: { value: base }, uAxis: { value: V(0, 0, -1) } },
    vertexShader: /* glsl */ `
      uniform vec3 uAxis; varying vec3 vN; varying vec3 vE; varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vE = normalize(-mv.xyz);
        vA = dot(position, uAxis);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uTime, uFlow, uBase; varying vec3 vN; varying vec3 vE; varying float vA;
      ${BARS}
      void main() {
        if (uAmount < 0.002) discard;
        float facing = clamp(abs(dot(normalize(vN), normalize(vE))), 0.0, 1.0);
        float body = 0.3 + 0.7 * pow(facing, 1.3);
        float ring = bars((vA - uTime * 150.0) / 46.0, 0.5);
        gl_FragColor = vec4(uColor * uBase * mix(1.0, 0.7 + 0.6 * ring, uFlow) * body * uAmount, 1.0);
      }`,
  });
}

/**
 * A ball of light with no edge, always facing the eye (015's): a small hot heart, a soft body, a long tail. `uRadius`
 * cm, never under `uMinPx` pixels — and once the pixel floor holds it, its light is turned down with it (a lamp seen
 * from 1.3 km stays a point, it does not bloom into a disc).
 */
function makeBall(heart, hue, H) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 }, uH: { value: H } },
      vertexShader: /* glsl */ `
        uniform float uRadius, uMinPx, uH; varying vec2 vUv; varying float vK;
        void main() {
          vUv = position.xy;
          vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float floorR = uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * uH * 0.5);
          float r = max(uRadius, floorR);
          vK = clamp(uRadius / max(r, 1e-3), 0.0, 1.0);
          c.xy += position.xy * r;
          gl_Position = projectionMatrix * c;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv; varying float vK;
        void main() {
          float r2 = dot(vUv, vUv);
          float core = exp(-r2 / mix(0.16, 0.012, vK));
          float body = 0.42 * exp(-r2 / 0.09);
          float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
          gl_FragColor = vec4((uHeart * (core * 2.2) + uHue * (body + tail)) * uAmount * max(0.6, vK), 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  mesh.visible = false;
  return mesh;
}
const shine = (ball, amount, radius, minPx) => {
  ball.visible = amount > 0.004;
  ball.material.uniforms.uAmount.value = amount;
  ball.material.uniforms.uRadius.value = radius;
  ball.material.uniforms.uMinPx.value = minPx;
};

/**
 * A rope (a wire, a purchase cable) of radius `r`, never under `minPx` pixels across; `aW` (0–1 along it, × uSb + uSa)
 * gives the path distance for a head of light (`uHead`, cm), and `uGlow` lights all of it.
 */
function ropeMat(color, r, H, minPx = 2.4) {
  const mat = solid(color, { rough: 0.6, metal: 0.4 });
  const U = {
    uSa: { value: 0 }, uSb: { value: 1 }, uMinPx: { value: minPx }, uR: { value: r }, uH: { value: H },
    uHead: { value: -1e6 }, uHeadK: { value: 0 }, uGlow: { value: new THREE.Color(0, 0, 0) },
  };
  mat.userData.U = U;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\n attribute float aW; uniform float uSa, uSb, uMinPx, uR, uH; varying float rS;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        {
          vec4 c0 = modelViewMatrix * vec4(transformed, 1.0);
          float cmPerPx = max(1.0, -c0.z) / (projectionMatrix[1][1] * uH * 0.5);
          transformed += normal * max(0.0, 0.5 * uMinPx * cmPerPx - uR);
        }
        rS = uSa + uSb * aW;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\n uniform float uHead, uHeadK; uniform vec3 uGlow; varying float rS;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        { float d = (rS - uHead) / 70.0; totalEmissiveRadiance += uGlow + ${vec3(VEILLE)} * uHeadK * exp(-d * d); }`,
      );
  };
  return mat;
}
/** A length of rope lying from x = 0 to x = 1: stood between two points by `stretch` (scale.x is its length in cm). */
function unitRope(r) {
  const pts = Array.from({ length: 9 }, (_, i) => V(i / 8, 0, 0));
  return tube(pts, r, { radial: 10, extra: { aW: pts.map((p) => p.x) } });
}

/**
 * A catapult cylinder's skin: steam behind the piston — veille on the skin from the aft end up to the piston's rear
 * face (uPist, cm along the catapult), brightest in a front just behind it; and, while the pistons still wait, a faint
 * load that reaches forward as the pressure builds (uAhead, uReach). `vSc` = −z of the catapult's own frame.
 */
function steamSkin(mat) {
  const U = { uPist: { value: -90 }, uPress: { value: 0 }, uAhead: { value: 0 }, uReach: { value: 0 }, uK: { value: 1 } };
  mat.userData.U = U;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\n varying float vSc;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n vSc = -position.z;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\n uniform float uPist, uPress, uAhead, uReach, uK; varying float vSc;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          float behind = 1.0 - smoothstep(uPist - 18.0, uPist + 6.0, vSc);
          float e = (vSc - uPist + 45.0) / 70.0;
          float front = exp(-e * e);
          float ahead = uAhead * (1.0 - smoothstep(uReach - 400.0, uReach + 400.0, vSc)) * (1.0 - behind);
          totalEmissiveRadiance += ${vec3(VEILLE)} * uK * (uPress * behind * (0.2 + 1.2 * front) + ahead);
          diffuseColor.rgb *= 1.0 - 0.35 * uPress * behind;
        }`,
      );
  };
  return mat;
}

/** The calibrated piece: its neck glows veille under load (uNeck), brightest at the neck (z = 0 of its half). */
function neckMat(color) {
  const mat = solid(color, { rough: 0.32, metal: 0.45, env: 1.25 });
  const U = { uNeck: { value: 0 } };
  mat.userData.U = U;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\n varying float vZn;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n vZn = position.z;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\n uniform float uNeck; varying float vZn;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        { float z = vZn / 7.0; totalEmissiveRadiance += ${vec3(VEILLE)} * uNeck * (0.12 + 1.5 * exp(-z * z)); }`,
      );
  };
  return mat;
}

/** A screen: dark glass with a few WIDE marks drawn in veille — a round gauge (its needle at uDial) or three bars. */
function screenMat(kind, H) {
  void H;
  return new THREE.ShaderMaterial({
    uniforms: { uK: { value: 0 }, uDial: { value: 0.5 }, uKind: { value: kind } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uK, uDial, uKind; varying vec2 vUv;
      float band(float x, float a, float b) { float w = max(fwidth(x), 1e-4) * 1.5; return smoothstep(a - w, a + w, x) * (1.0 - smoothstep(b - w, b + w, x)); }
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float m = 0.0;
        if (uKind < 0.5) {
          p.x *= 1.45;
          float r = length(p);
          float a = atan(p.x, p.y);
          float ring = band(r, 0.62, 0.74) * step(abs(a), 2.36);
          float na = (uDial - 0.5) * 4.71;
          vec2 nd = vec2(sin(na), cos(na));
          float along = dot(p, nd);
          float acrossN = abs(p.x * nd.y - p.y * nd.x);
          float needle = (1.0 - smoothstep(0.035, 0.07, acrossN)) * step(0.0, along) * (1.0 - smoothstep(0.55, 0.6, along));
          m = max(ring * 0.75, needle);
        } else {
          for (int i = 0; i < 3; i++) {
            float y0 = 0.45 - float(i) * 0.42;
            float len = 0.35 + 0.25 * float(i) + 0.2 * uDial * float(i == 1);
            m = max(m, band(p.y, y0 - 0.1, y0 + 0.1) * band(p.x, -0.7, -0.7 + len * 1.4) * 0.8);
          }
        }
        float frame = 1.0 - band(abs(p.x), 0.0, 0.94) * band(abs(p.y), 0.0, 0.9);
        vec3 c = vec3(0.012, 0.02, 0.018) + ${vec3(VEILLE)} * uK * (0.06 + 0.9 * m + 0.25 * frame);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
}

/* ─────────────────────────────────────────────────────────── the model */

export function buildModel() {
  const H = BRAND.H; // read now: the long format sets it (kit/lib/landscape.js) before any build
  const R = rng(404);

  /* three greys, each part its own materials (a part fades and lights alone) */
  const dark = () => solid(0x3d444a, { rough: 0.8, metal: 0.2 });
  const mid = () => solid(0x7d858c, { rough: 0.5, metal: 0.4 });
  const fine = () => solid(0xb4bbc0, { rough: 0.42, metal: 0.45 });
  const bright = () => solid(0xdde1e4, { rough: 0.3, metal: 0.5, env: 1.3 });
  const grp = (parent, pos) => {
    const g = new THREE.Group();
    if (pos) g.position.set(...pos);
    parent.add(g);
    return g;
  };
  const partIn = (parent, name) => {
    const p = makePart(name);
    parent.add(p);
    return p;
  };

  /* ── what lights up when the voice names a part: its solids, and the lines of its edges (015) ── */
  const glowOf = (mat) => 0.11 * (1 - 0.85 * Math.min(1, 0.2126 * mat.color.r + 0.7152 * mat.color.g + 0.0722 * mat.color.b));
  const lampOf = (...parts) => {
    const mats = parts.flatMap((part) => [...part.userData.part.mats]);
    const lines = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lines) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.hot = mat.color.clone().multiply(TINT_S);
      mat.userData.glow = glowOf(mat);
    }
    return { solids, lines, k: -1, bad: -1 };
  };
  const red = new THREE.Color();
  /** `k` veille (named), `bad` signal. */
  const light = (lamp, k, bad = 0) => {
    if (lamp.k === k && lamp.bad === bad) return;
    lamp.k = k;
    lamp.bad = bad;
    for (const mat of lamp.solids) {
      mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k).add(red.copy(SIGNAL).multiplyScalar(bad * 0.22));
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.7 * k).lerp(mat.userData.hot, 0.62 * bad);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k).lerp(SIGNAL, 0.7 * bad);
  };

  /* ── a graduated wheel (015's dial), its axis along its +z, `spin` turns it ── */
  const makeDial = (parent, scale) => {
    const g = grp(parent);
    g.scale.setScalar(scale);
    const part = partIn(g, "dial");
    const spin = grp(part);
    const m = { boss: solid(0xcdd2d6, { rough: 0.45, metal: 0.4 }), ring: solid(0x2a2f34, { rough: 0.7, coat: 0.2 }), rim: bright(), face: solid(0x1d2125, { rough: 0.8, env: 0.6 }), tick: glow(BRAND.ink, 0.8), mark: glow(BRAND.veille, 1.5), index: glow(BRAND.veille, 1.5) };
    addMesh(part, discZ(21, -34, 0, 32, 1.5), m.boss, { edgeOpacity: 0.5 });
    addMesh(part, alongZ([[0, -5], [37, -5], [37, 1.5], [0, 1.5]], 56, 0.8), m.ring, { edgeOpacity: 0.5 });
    addMesh(part, plate([[-5, 36.5], [5, 36.5], [0, 29]], 2.5, { bevel: 0.3 }).translate(0, 0, 1.5), m.index, { edges: false });
    spin.add(
      addMesh(part, alongZ([[0, 1.5], [28, 1.5], [28, 8], [25, 12], [9, 12], [9, 19], [0, 19]], 56, 0.7), m.rim, { edgeOpacity: 0.5 }),
      addMesh(part, alongZ([[9.5, 12], [24.5, 12], [24.5, 12.5], [9.5, 12.5], [9.5, 12]], 48, 0), m.face, { edges: false }),
      addMesh(part, mergeGeometries(Array.from({ length: 24 }, (_, i) => box(i % 6 ? 1.6 : 2.4, i % 6 ? 4.5 : 7.5, 0.8, 0.2, 1).translate(0, 23.5 - (i % 6 ? 2.25 : 3.75), 12.8).rotateZ((i / 24) * Math.PI * 2)).slice(1)), m.tick, { edges: false }),
      addMesh(part, box(3.6, 11, 1.2, 0.3, 1).translate(0, 18, 13), m.mark, { edges: false }),
    );
    return { group: g, part, spin, m };
  };

  /* ═══════════════════════════════════════════ the catapults ═══════════════════════════════════════════ */

  const PIST = { aft: 40, fore: 300, r: 24 }; // a piston, cm from the shuttle's place along the catapult
  const SHUT = { aft: 60, fore: 280 }; //        the shuttle body
  const below = []; //                           parts under the deck: they show with `under`
  const catBuild = (i, detail) => {
    const c = CAT[i];
    const group = new THREE.Group(); // the ship's frame
    const frame = grp(group, c.from); // the catapult's own: −z is the throw
    frame.rotation.y = c.yaw;
    const edgeS = deckEdgeS(i);
    const foreS = Math.min(TROUGH.fore, edgeS - 30); //        where the cylinders end (the water brake's nose)
    const stopS = Math.min(STROKE, foreS - SHUT.fore - 30); // where the shuttle stops in its water brake
    const aftS = TROUGH.aft;
    const y = TROUGH.y;
    const r = TROUGH.r;

    /* the two cylinders, each its own part (they part sideways when opened) */
    const cyls = [-1, 1].map((side) => {
      const part = partIn(frame, `cyl${i}${side}`);
      part.position.x = side * TROUGH.gap;
      const skin = steamSkin(mid());
      addMesh(part, alongZ([[0, -foreS], [r, -foreS], [r, -aftS], [0, -aftS]], 72, 2).translate(0, y, 0), skin, { edgeOpacity: 0.5 });
      // the slot along its top, a dark seam (the piston's connector rides in it)
      addMesh(part, box(5, 3, foreS - aftS - 20, 1, 1).translate(0, y + r - 0.6, -(foreS + aftS) / 2), dark(), { edges: false });
      const cap = dark();
      addMesh(part, discZ(r + 5, -aftS - 24, -aftS + 4, 48, 1.5).translate(0, y, 0), cap, { edgeOpacity: 0.55 }); // the aft cap, where the steam comes in
      // flanges, few and far apart: in a raking view nothing fine runs away
      const fl = dark();
      for (const s of detail ? [1500, 3000, 4500, 6000] : [2500, 5000]) if (s < foreS - 400) addMesh(part, ringZ(r - 1, r + 6, -s - 9, -s + 9, 64, 1.5).translate(0, y, 0), fl, { edgeOpacity: 0.45 });
      // the water brake: a fatter cylinder at the fore end, where the piston's spear is caught
      addMesh(part, alongZ([[0, -foreS], [r + 12, -foreS], [r + 12, -(foreS - 320)], [r + 4, -(foreS - 340)], [0, -(foreS - 340)]], 64, 2).translate(0, y, 0), dark(), { edgeOpacity: 0.55 });
      below.push(part);
      return { part, skin };
    });

    /* the pistons: a bright heart in each cylinder, a spear ahead, the connector up through the slot */
    const pistons = [-1, 1].map((side) => {
      const part = partIn(frame, `pist${i}${side}`);
      const body = grp(part);
      body.position.x = side * TROUGH.gap;
      const m = bright();
      addMesh(body, alongZ([[0, -PIST.fore], [PIST.r - 4, -PIST.fore], [PIST.r, -PIST.fore + 8], [PIST.r, -PIST.aft - 8], [PIST.r - 3, -PIST.aft], [0, -PIST.aft]], 48, 1.5).translate(0, y, 0), m, { edgeOpacity: 0.5 });
      addMesh(body, alongZ([[0, -PIST.fore - 95], [5, -PIST.fore - 80], [12, -PIST.fore - 10], [12, -PIST.fore + 2], [0, -PIST.fore + 2]], 32, 1).translate(0, y, 0), fine(), { edgeOpacity: 0.5 }); // the spear
      addMesh(body, box(8, 22, 120, 2, 2).translate(0, y + r + 6, -(PIST.aft + PIST.fore) / 2), fine(), { edgeOpacity: 0.5 }); // the connector, through the slot
      below.push(part);
      return { part, body };
    });

    /* the link under the deck: a yoke over both cylinders, a blade up through the deck's slot to the shuttle */
    const link = partIn(frame, `link${i}`);
    addMesh(link, box(TROUGH.gap * 2 + 26, 12, 150, 2, 2).translate(0, y + r + 18, -(PIST.aft + PIST.fore) / 2), mid(), { edgeOpacity: 0.5 });
    addMesh(link, box(9, -(y + r + 18), 150, 1.5, 2).translate(0, (y + r + 18) / 2, -(PIST.aft + PIST.fore) / 2), mid(), { edgeOpacity: 0.45 });
    below.push(link);

    /* the shuttle on the deck, and its hook (the croc) at its aft end — its throat opening aft and up */
    const shuttleG = grp(frame);
    const shuttle = partIn(shuttleG, `shuttle${i}`);
    const [sw, sh] = TROUGH.shuttle;
    const sm = solid(0x6f777e, { rough: 0.78, metal: 0.25 }); // matt: a flat top under the key light would bloom
    const prof = [[SHUT.aft, 0], [SHUT.fore, 0], [SHUT.fore, 4], [SHUT.fore - 40, sh * 0.62], [SHUT.aft + 30, sh], [SHUT.aft, sh]];
    addMesh(shuttle, plate(prof, sw, { bevel: 3 }).rotateY(Math.PI / 2).translate(-sw / 2, 0, 0), sm, { edgeOpacity: 0.55 });
    const croc = partIn(shuttleG, `croc${i}`);
    const cm = fine();
    // in (s, h): a claw at the shuttle's aft end, its notch open upward where the launch bar's end drops in (s = 50, h = 20)
    const cheek = [[28, 0], [76, 0], [76, 30], [62, 30], [56, 18], [44, 18], [38, 26], [28, 26]];
    for (const x of [-11, 5]) addMesh(croc, plate(cheek, 6, { bevel: 1 }).rotateY(Math.PI / 2).translate(x, 0, 0), cm, { edgeOpacity: 0.55 });
    addMesh(croc, box(22, 6, 30, 1.5, 2).translate(0, 3, -52), cm, { edgeOpacity: 0.5 });
    const crocA = anchor(shuttleG, 0, 20, -50);

    /* the deck's slot: two filets that run away to the bow (ink at rest, veille named), and the trace's head of light */
    const slots = [-TROUGH.slot, TROUGH.slot].map((x) => ribbon([V(x, 1, 50), V(x, 1, -edgeS)], { width: 3.5, minPx: 2, color: INK, H }));
    for (const s of slots) frame.add(s.mesh);
    const trace = detail ? ribbon([V(0, 1.4, 0), V(0, 1.4, -edgeS)], { width: 9, minPx: 3.2, color: VEILLE, core: 0.7, halo: 0.35, H }) : null;
    if (trace) {
      trace.U.uHeadLen.value = 260;
      frame.add(trace.mesh);
    }

    return { group, frame, cyls, pistons, link, shuttleG, shuttle, croc, crocA, slots, trace, edgeS, foreS, stopS };
  };
  const C = [catBuild(0, true), catBuild(1, false)];
  const bow = C[0];

  /* ── the bow catapult's steam: the receiver, the launch valve and its dial, the pipes, and the deck fitting ── */
  const F0 = CAT[0].from;
  const loc = (p) => [p[0] - F0[0], p[1] - F0[1], p[2] - F0[2]]; // ship → the bow catapult's frame (it has no yaw)
  const tankAt = loc(TANK.at);
  const valveAt = loc(VALVE.at);

  const tankG = grp(bow.frame, tankAt);
  const tankP = partIn(tankG, "tank");
  const tGlass = glass(BRAND.ink, { base: 0.01, rim: 0.32, power: 2.4, edge: 0.5, spec: 0.35 });
  const tankShell = new THREE.Mesh(alongZ([[TANK.r, -TANK.len / 2 + 30], [TANK.r, TANK.len / 2 - 30], [TANK.r - 0.1, TANK.len / 2 - 29.9]], 64, 0), tGlass);
  tankShell.renderOrder = 9;
  tankP.add(tankShell);
  const domeProfile = (sgn) => {
    const pts = [];
    for (let k = 0; k <= 10; k++) {
      const a = (k / 10) * (Math.PI / 2);
      pts.push([TANK.r * Math.cos(a), sgn * (TANK.len / 2 - 30 + 70 * Math.sin(a))]);
    }
    return sgn > 0 ? [[0, TANK.len / 2 - 40], [TANK.r, TANK.len / 2 - 40], ...pts.slice(1, -1), [0, TANK.len / 2 + 40]] : [[0, -TANK.len / 2 - 40], ...pts.slice(1, -1).reverse(), [TANK.r, -TANK.len / 2 + 40], [0, -TANK.len / 2 + 40]];
  };
  const tm = dark();
  addMesh(tankP, alongZ(domeProfile(1), 64, 1.5), tm, { edgeOpacity: 0.45 });
  addMesh(tankP, alongZ(domeProfile(1), 64, 1.5).rotateY(Math.PI), tm, { edgeOpacity: 0.45 }); // the fore one: the same, turned round
  for (const z of [-TANK.len / 4, 0, TANK.len / 4]) addMesh(tankP, ringZ(TANK.r - 1, TANK.r + 7, z - 8, z + 8, 72, 1.5), mid(), { edgeOpacity: 0.45 });
  for (const z of [-TANK.len / 3, TANK.len / 3]) addMesh(tankP, plate([[-120, -TANK.r - 40], [120, -TANK.r - 40], [120, -TANK.r + 10], [80, -TANK.r + 60], [-80, -TANK.r + 60], [-120, -TANK.r + 10]], 24, { bevel: 2 }).translate(0, 0, z - 12), dark(), { edgeOpacity: 0.45 });
  const tankSteamMat = volume(VEILLE, 0.5);
  tankSteamMat.uniforms.uAxis.value.set(0, 0, -1);
  const tankSteam = new THREE.Mesh(alongZ([[TANK.r - 8, -TANK.len / 2 - 10], [TANK.r - 8, TANK.len / 2 + 10]], 48, 0), tankSteamMat);
  tankSteam.renderOrder = 8;
  tankP.add(tankSteam);
  below.push(tankP);

  // the launch valve: a housing along z, a window on its aft face where the disc turns, the dial on its port side
  const valveG = grp(bow.frame, valveAt);
  const valveP = partIn(valveG, "valve");
  const VR = VALVE.r;
  const vm = dark();
  addMesh(valveP, alongZ([[VR - 14, -40], [VR, -40], [VR, -30], [VR - 6, -26], [VR - 6, 26], [VR, 30], [VR, 40], [VR - 14, 40], [VR - 14, -40]], 64, 1.2), vm, { edgeOpacity: 0.5 });
  addMesh(valveP, discZ(VR - 4, -40, -28, 48, 1.2), dark(), { edgeOpacity: 0.5 }); // the fore cap
  addMesh(valveP, ringZ(VR - 16, VR + 3, 28, 42, 64, 1), mid(), { edgeOpacity: 0.5 }); // the window's frame
  const vwGlass = glass(BRAND.ink, { base: 0.015, rim: 0.2, power: 2, edge: 0.3, spec: 0.6 });
  const vwin = new THREE.Mesh(new THREE.CircleGeometry(VR - 15, 48).translate(0, 0, 38), vwGlass);
  vwin.renderOrder = 9;
  valveP.add(vwin);
  // inlet (below) and outlet (above) bosses
  for (const sy of [-1, 1]) addMesh(valveP, lathe([[0, 0], [30, 0], [30, 22], [26, 26], [0, 26]], 40, { bevel: 1, round: 2 }).rotateX(sy < 0 ? Math.PI : 0).translate(0, sy * (VR - 6), 0), mid(), { edgeOpacity: 0.5 });
  const discG = grp(valveP, [0, 0, 6]);
  addMesh(discG, box((VR - 9) * 2, 9, 56, 3, 2), bright(), { edgeOpacity: 0.5 }); // the disc (closed: across the vertical flow)
  addMesh(discG, cyl(5, 70, 0.8, 16).rotateX(Math.PI / 2), fine(), { edgeOpacity: 0.4 }); // its shaft, along z
  // move the disc's meshes into the part's material set (they light with it)
  for (const m of discG.children) valveP.userData.part.mats.add(m.material);
  const valveSteamMat = volume(VEILLE, 0.55);
  valveSteamMat.uniforms.uAxis.value.set(0, 1, 0);
  const valveSteam = new THREE.Mesh(alongZ([[VR - 8, -30], [VR - 8, 30]], 40, 0), valveSteamMat);
  valveSteam.renderOrder = 8;
  valveP.add(valveSteam);
  const dial = makeDial(valveG, 0.9);
  dial.group.position.set(-VR - 18, 0, 0);
  dial.group.quaternion.setFromUnitVectors(V(0, 0, 1), V(-1, 0, 0));
  addMesh(valveP, discX(16, -VR - 20, -VR + 4, 24, 1), mid(), { edgeOpacity: 0.4 }); // the dial's boss on the housing
  below.push(valveP, dial.part);

  // the pipes: receiver → under the valve, the valve → up to a header across the two cylinders' aft caps
  const pipesP = partIn(bow.frame, "pipes");
  const PR = 20;
  const yT = tankAt[1];
  const pipeIn = tube(bentPath([[0, yT, tankAt[2] - TANK.len / 2 - 40], [0, yT, valveAt[2] + 20], [0, valveAt[1] - VR - 40, valveAt[2] + 20], [0, valveAt[1] - VR - 22, valveAt[2]]], 60), PR);
  const pipeUp = tube(bentPath([[0, valveAt[1] + VR + 22, valveAt[2]], [0, TROUGH.y - 40, valveAt[2]], [0, TROUGH.y - 40, -TROUGH.aft + 70], [0, TROUGH.y, -TROUGH.aft + 70]], 30), PR);
  const pipeFlow = (geo) => {
    const mat = mid();
    const U = { uFlow: { value: 0 }, uTime: { value: 0 } };
    mat.userData.U = U;
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, U);
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\n attribute float aS; varying float vS;").replace("#include <begin_vertex>", "#include <begin_vertex>\n vS = aS;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\n uniform float uFlow, uTime; varying float vS;\n ${BARS}`)
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n totalEmissiveRadiance += ${vec3(VEILLE)} * uFlow * (0.18 + 0.55 * bars((vS - uTime * 150.0) / 46.0, 0.45));`);
    };
    return addMesh(pipesP, geo, mat, { edges: false });
  };
  const pipes = [pipeFlow(pipeIn), pipeFlow(pipeUp)];
  addMesh(pipesP, cyl(PR, TROUGH.gap * 2 + 20, 1, 24).rotateZ(Math.PI / 2).translate(0, TROUGH.y, -TROUGH.aft + 70), mid(), { edgeOpacity: 0.4 }); // the header
  for (const sx of [-1, 1]) addMesh(pipesP, cyl(PR - 3, 50, 1, 24).rotateX(Math.PI / 2).translate(sx * TROUGH.gap, TROUGH.y, -TROUGH.aft + 45), mid(), { edgeOpacity: 0.4 });
  below.push(pipesP);

  // the holdback's deck fitting: a lug in a flush plate, astern of where the nose gear stands
  const fitP = partIn(bow.frame, "fitting");
  addMesh(fitP, box(46, 4, 60, 1.5, 2).translate(0, 2, HOLDBACK.deckZ + 10), dark(), { edgeOpacity: 0.5 });
  addMesh(fitP, plate([[-12, 0], [12, 0], [8, 14], [-8, 14]], 8, { bevel: 1 }).rotateY(Math.PI / 2).translate(-4, 0, HOLDBACK.deckZ).translate(0, 0, 0), mid(), { edgeOpacity: 0.5 });

  // the jet blast deflector: three panels hinged at their fore edge, raised by struts; WIDE ribs on their back
  const jbdG = grp(bow.frame, [0, 0, JBD.z - F0[2]]);
  const JL = 380;
  const JW = (JBD.half * 2 - 24) / 3;
  const jbdP = partIn(jbdG, "jbd");
  const leaf = grp(jbdP);
  const jm = mid();
  const jb = dark();
  for (let k = 0; k < 3; k++) {
    const x = (k - 1) * (JW + 12);
    addMesh(leaf, box(JW, 18, JL, 3, 2).translate(x, -9, JL / 2), jm, { edgeOpacity: 0.5 });
    for (const rx of [-JW / 3, 0, JW / 3]) addMesh(leaf, box(26, 12, JL - 40, 3, 2).translate(x + rx, -24, JL / 2), jb, { edgeOpacity: 0.4 });
  }
  const struts = [-1, 0, 1].map((k) => {
    const s = new THREE.Mesh(cyl(7, 1, 0.5, 16).translate(0, 0.5, 0), jb);
    s.position.set(k * (JW + 12), 0, JL + 60);
    jbdP.add(s);
    return s;
  });
  jbdP.userData.part.mats.add(jb);

  /* ═══════════════════════════════════════════ the holdback bar (the hero) ═══════════════════════════════════════════ */

  const LB = HOLDBACK.len;
  const LG = LB * HOLDBACK.piece; //   the gear half, neck → gear end
  const LD = LB - LG; //                the deck half, neck → fitting
  const hbGroup = new THREE.Group();
  const halves = [-1, 1].map((sgn) => {
    // sgn −1: the gear half (toward −z) · +1: the deck half (toward +z). Profiles written in z ≥ 0, mirrored by `zz`.
    const part = makePart(sgn < 0 ? "hb-gear" : "hb-deck");
    hbGroup.add(part);
    const zz = (pts) => (sgn < 0 ? pts.map(([r, z]) => [r, -z]).reverse() : pts);
    const L = sgn < 0 ? LG : LD;
    const piece = neckMat(0xdde1e4);
    addMesh(part, alongZ(zz([[0, 0], [2.9, 0], [2.9, 1.6], [4.6, 5], [8.2, 10], [8.2, 21], [6.2, 23], [0, 23]]), 48, 0.6), piece, { edgeOpacity: 0.55 });
    addMesh(part, alongZ(zz([[0, 22.5], [9.8, 22.5], [9.8, 41], [7, 43], [0, 43]]), 48, 1), mid(), { edgeOpacity: 0.5 });
    addMesh(part, alongZ(zz([[0, 42], [4.6, 42], [4.6, L - 14], [0, L - 14]]), 32, 0.6), dark(), { edgeOpacity: 0.45 });
    if (sgn < 0) {
      const e = fine();
      addMesh(part, alongZ(zz([[0, L - 16], [7.6, L - 16], [7.6, L], [0, L]]), 32, 1), e, { edgeOpacity: 0.5 });
      addMesh(part, box(30, 6, 6, 1.5, 2).translate(0, 0, -(L - 5)), e, { edgeOpacity: 0.5 }); // the T that the gear's fitting takes
    } else {
      const e = mid();
      addMesh(part, box(16, 14, 16, 2, 2).translate(0, 0, L - 18), e, { edgeOpacity: 0.5 });
      for (const x of [-6, 6]) addMesh(part, box(4, 16, 16, 1, 2).translate(x, 0, L - 4), e, { edgeOpacity: 0.5 }); // the clevis
      addMesh(part, cyl(2.6, 20, 0.4, 12).rotateZ(Math.PI / 2).translate(0, 0, L - 2), fine(), { edgeOpacity: 0.4 });
    }
    return { part, piece };
  });
  const [gearHalf, deckHalf] = halves.map((h) => h.part);
  const neckA = anchor(hbGroup, 0, 0, 0);
  // the light at the neck when it parts, and a few shards
  const flash = makeBall(WHITE, new THREE.Color(1, 0.94, 0.82), H);
  hbGroup.add(flash);
  const shardMat = solid(0x9aa1a7, { rough: 0.5, metal: 0.4 });
  shardMat.emissive.set(0xffffff);
  const shards = Array.from({ length: 6 }, (_, k) => {
    const m = new THREE.Mesh(box(0.9 + R() * 0.8, 0.7 + R() * 0.5, 1.1 + R() * 0.9, 0.25, 1), shardMat);
    const a = (k / 6) * Math.PI * 2 + R() * 0.6;
    m.userData.v = V(Math.cos(a) * (180 + R() * 160), 120 + R() * 220, (R() - 0.5) * 260);
    m.userData.w = V(R() * 20, R() * 20, R() * 20);
    m.visible = false;
    hbGroup.add(m);
    return m;
  });
  const holdbackHome = new THREE.Group();
  const holdback = { group: hbGroup, A: { gear: gearHalf, deck: deckHalf, neck: neckA } };

  /* ═══════════════════════════════════════════ the cabin ═══════════════════════════════════════════ */

  const cabinG = new THREE.Group();
  cabinG.position.set(...CABIN.at);
  const cabinP = partIn(cabinG, "cabin");
  const [CW, CH, CD] = CABIN.size;
  const yF = CABIN.top - CH; //        the floor (−95)
  const cd = dark();
  cd.side = THREE.DoubleSide;
  addMesh(cabinP, box(CW, 7, CD, 1.5, 2).translate(0, yF + 3.5, 0), cd, { edgeOpacity: 0.4 });
  for (const [w, d, x, z] of [[CW, 6, 0, -CD / 2], [CW, 6, 0, CD / 2], [6, CD, -CW / 2, 0], [6, CD, CW / 2, 0]]) addMesh(cabinP, box(w, -yF, d, 1.5, 2).translate(x, yF / 2, z), cd, { edgeOpacity: 0.35 });
  // the glazed top: a frustum of glass on a frame, its corner posts solid
  const TOPW = CW - 50;
  const TOPD = CD - 50;
  const cframe = mid();
  const corners0 = [[-CW / 2, -CD / 2], [CW / 2, -CD / 2], [CW / 2, CD / 2], [-CW / 2, CD / 2]];
  const corners1 = [[-TOPW / 2, -TOPD / 2], [TOPW / 2, -TOPD / 2], [TOPW / 2, TOPD / 2], [-TOPW / 2, TOPD / 2]];
  addMesh(cabinP, mergeGeometries(corners0.map(([x, z], k) => {
    const [x1, z1] = corners1[k];
    const a = V(x, 0, z);
    const b = V(x1, CABIN.top, z1);
    const len = a.distanceTo(b);
    const g = box(6, len, 6, 1, 1).translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
    return g.applyQuaternion(q).translate(a.x, a.y, a.z);
  })), cframe, { edgeOpacity: 0.5 });
  addMesh(cabinP, mergeGeometries([[TOPW, 6, 0, -TOPD / 2], [TOPW, 6, 0, TOPD / 2], [6, TOPD, -TOPW / 2, 0], [6, TOPD, TOPW / 2, 0]].map(([w, d, x, z]) => box(w, 6, d, 1, 1).translate(x, CABIN.top, z))), cframe, { edgeOpacity: 0.5 });
  addMesh(cabinP, mergeGeometries([[CW, 7, 0, -CD / 2], [CW, 7, 0, CD / 2], [7, CD, -CW / 2, 0], [7, CD, CW / 2, 0]].map(([w, d, x, z]) => box(w, 7, d, 1, 1).translate(x, 2, z))), cframe, { edgeOpacity: 0.5 });
  const cGlass = glass(BRAND.ink, { base: 0.008, rim: 0.22, power: 2.6, edge: 0.4, spec: 0.7 });
  const glassGeo = (() => {
    const pos = [];
    const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let k = 0; k < 4; k++) {
      const a = corners0[k];
      const b = corners0[(k + 1) % 4];
      const c = corners1[(k + 1) % 4];
      const d = corners1[k];
      quad([a[0], 0, a[1]], [b[0], 0, b[1]], [c[0], CABIN.top, c[1]], [d[0], CABIN.top, d[1]]);
    }
    quad([corners1[0][0], CABIN.top, corners1[0][1]], [corners1[1][0], CABIN.top, corners1[1][1]], [corners1[2][0], CABIN.top, corners1[2][1]], [corners1[3][0], CABIN.top, corners1[3][1]]);
    const g = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  })();
  const cabinGlass = new THREE.Mesh(glassGeo, cGlass);
  cabinGlass.renderOrder = 9;
  cabinP.add(cabinGlass);
  // the console along the starboard wall, two screens facing the seats; two chairs
  addMesh(cabinP, box(42, 70, CD - 40, 3, 2).translate(CW / 2 - 30, yF + 7 + 35, 0), dark(), { edgeOpacity: 0.45 });
  addMesh(cabinP, box(56, 6, CD - 40, 2, 2).translate(CW / 2 - 40, yF + 78, 0), mid(), { edgeOpacity: 0.45 });
  const screens = [0, 1].map((k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(74, 48), screenMat(k, H));
    m.position.set(CW / 2 - 28, yF + 112, (k ? 1 : -1) * 46);
    m.rotation.y = -Math.PI / 2;
    m.rotation.x = 0;
    m.rotateX(-0.18);
    cabinP.add(m);
    addMesh(cabinP, box(5, 54, 80, 1.5, 2).translate(CW / 2 - 24, yF + 112, (k ? 1 : -1) * 46), dark(), { edgeOpacity: 0.4 });
    return m;
  });
  const chairM = dark();
  const seats = [-1, 1].map((k) => {
    const z = k * 50;
    addMesh(cabinP, box(46, 9, 46, 2.5, 2).translate(-18, yF + 50, z), chairM, { edgeOpacity: 0.4 });
    addMesh(cabinP, box(8, 58, 44, 2, 2).translate(-44, yF + 84, z), chairM, { edgeOpacity: 0.4 });
    addMesh(cabinP, cyl(4, 40, 0.5, 12).translate(-18, yF + 27, z), chairM, { edgeOpacity: 0.3 });
    const o = new THREE.Object3D();
    o.position.set(-18, yF + 7, z);
    o.rotation.y = Math.PI / 2; // its +z toward the console (+x)
    cabinG.add(o);
    return o;
  });

  /* ═══════════════════════════════════════════ the three wires, their brakes ═══════════════════════════════════════════ */

  const brinsG = new THREE.Group(); // the ship's frame
  const runway = grp(brinsG, ANGLED.origin); // local: −z along the runway (s = −z), +x its right hand
  runway.rotation.y = ANGLED_YAW;
  const RW = 3.2; //           a wire's radius (a real one is ≈ 3.5 cm across: this one reads)
  const RC = 2.6; //           a purchase cable's
  const XS = BRINS.half + 30; // the deck sheaves
  const YS = BRINS.lift - 30; //  their axles (the wire runs over their top)
  const XL = -820; //           the lead sheaves by the brake's fixed end
  const YH = -300; //           the cables' run under the deck
  const YE = ENGINE.y;
  const BR = { x0: -650, x1: 150, xm0: 650, xm1: 280, fixed: -760, r: ENGINE.r };
  const unitW = unitRope(RW);
  const unitC = unitRope(RC);
  const X1 = V(1, 0, 0);
  const tv = V();
  const stretch = (mesh, a, b) => {
    tv.subVectors(b, a);
    const L = Math.max(0.01, tv.length());
    mesh.position.copy(a);
    mesh.scale.set(L, 1, 1);
    mesh.quaternion.setFromUnitVectors(X1, tv.divideScalar(L));
    mesh.material.userData.U.uSb.value = L;
    return L;
  };
  const wires = BRINS.s.map((s, i) => {
    const g = grp(runway, [0, 0, -s]);
    const deckP = partIn(g, `brin${i}`);
    const legs = [0, 1].map(() => {
      const mat = ropeMat(0x9aa1a7, RW, H, 2.6);
      const m = new THREE.Mesh(unitW, mat);
      m.castShadow = false;
      g.add(m);
      return m;
    });
    // the deck sheaves: a pot sunk in the deck, a wheel standing in it; they swivel to face the pull
    const sheaves = [-1, 1].map((sx) => {
      const sg = grp(g, [sx * XS, 0, 0]);
      addMesh(deckP, cyl(46, 14, 1.5, 40).translate(sx * XS, -6, 0), dark(), { edgeOpacity: 0.45 });
      const turn = grp(sg);
      const wheel = partIn(turn, "sheave");
      addMesh(wheel, alongZ([[16, -6], [33, -6], [33, -3], [30, -1], [30, 1], [33, 3], [33, 6], [16, 6], [16, -6]], 48, 0.6).translate(0, YS, 0), mid(), { edgeOpacity: 0.5 });
      addMesh(wheel, discZ(16, -8, 8, 24, 0.8).translate(0, YS, 0), fine(), { edgeOpacity: 0.4 });
      for (const m of wheel.userData.part.mats) deckP.userData.part.mats.add(m);
      return { sg, turn, wheel, sx };
    });
    // two low supports holding the wire off the deck
    for (const x of [-560, 560]) addMesh(deckP, box(14, BRINS.lift - 2, 40, 2, 2).translate(x, (BRINS.lift - 2) / 2, 0), dark(), { edgeOpacity: 0.4 });

    // under the deck: the purchase cables, the brake (cylinder, ram, crosshead and its sheaves, fixed block, valve)
    const underP = partIn(g, `brake${i}`);
    const cables = [];
    const cable = () => {
      const mat = ropeMat(0x8b9298, RC, H, 2.2);
      const m = new THREE.Mesh(unitC, mat);
      underP.add(m);
      cables.push(m);
      return m;
    };
    const runs = [-1, 1].map((sx) => ({ sx, z: sx * 30, segs: [cable(), cable(), cable(), cable(), cable()] }));
    for (const r of runs) {
      addMesh(underP, alongZ([[10, -5], [34, -5], [34, 5], [10, 5], [10, -5]], 32, 0.5).translate(r.sx * (XS + 30 - 34), YH + 34, r.z), mid(), { edgeOpacity: 0.4 }); // where it turns under the deck
      addMesh(underP, alongZ([[10, -5], [34, -5], [34, 5], [10, 5], [10, -5]], 32, 0.5).translate(XL + 34, YH - 34, r.z), mid(), { edgeOpacity: 0.4 }); // the lead sheave by the fixed block
    }
    const bm = dark();
    const bodyG = grp(underP);
    // the cylinder: X-ray skin, solid end rings — the oil inside heats veille → signal; the ram's head in it
    const bGlass = glass(BRAND.ink, { base: 0.01, rim: 0.3, power: 2.4, edge: 0.45, spec: 0.5 });
    const bSkin = new THREE.Mesh(alongX([[BR.r, BR.x0 + 20], [BR.r, BR.x1 - 20], [BR.r - 0.1, BR.x1 - 19.9]], 48, 0).translate(0, YE, 0), bGlass);
    bSkin.renderOrder = 9;
    bodyG.add(bSkin);
    for (const [a, b] of [[BR.x0, BR.x0 + 30], [BR.x1 - 30, BR.x1], [(BR.x0 + BR.x1) / 2 - 10, (BR.x0 + BR.x1) / 2 + 10]]) addMesh(underP, alongX([[BR.r - 4, a], [BR.r + 8, a], [BR.r + 8, b], [BR.r - 4, b], [BR.r - 4, a]], 48, 1.2).translate(0, YE, 0), bm, { edgeOpacity: 0.45 });
    addMesh(underP, discX(BR.r - 3, BR.x0 - 8, BR.x0 + 4, 40, 1).translate(0, YE, 0), bm, { edgeOpacity: 0.45 });
    const oilMat = volume(VEILLE, 0.42);
    oilMat.uniforms.uAxis.value.set(-1, 0, 0);
    const oil = new THREE.Mesh(alongX([[BR.r - 6, BR.x0 + 8], [BR.r - 6, BR.x1 - 8]], 40, 0).translate(0, YE, 0), oilMat);
    oil.renderOrder = 8;
    underP.add(oil);
    // the rails and the fixed block (with its two lead sheaves' frame); a valve block with Andromède's setting wheel
    addMesh(underP, box(BR.xm0 - BR.fixed + 200, 14, 22, 2, 2).translate((BR.xm0 + BR.fixed) / 2 + 40, YE - BR.r - 40, -60), bm, { edgeOpacity: 0.4 });
    addMesh(underP, box(BR.xm0 - BR.fixed + 200, 14, 22, 2, 2).translate((BR.xm0 + BR.fixed) / 2 + 40, YE - BR.r - 40, 60), bm, { edgeOpacity: 0.4 });
    addMesh(underP, box(60, 260, 150, 4, 2).translate(BR.fixed - 30, YE - 20, 0), bm, { edgeOpacity: 0.45 });
    const vb = mid();
    addMesh(underP, box(70, 90, 70, 4, 2).translate(BR.x0 - 30, YE, 112), vb, { edgeOpacity: 0.45 });
    addMesh(underP, cyl(22, 40, 1, 24).rotateX(Math.PI / 2).translate(BR.x0 - 30, YE, 62), vb, { edgeOpacity: 0.4 }); // its port into the cylinder
    // the ram and the crosshead (they travel together, toward the fixed block)
    const crossG = grp(underP);
    const ramM = bright();
    addMesh(crossG, discX(22, BR.x1 - 360, 0, 32, 1).translate(0, YE, 0), ramM, { edgeOpacity: 0.45 }); // ram, local x from its head back to the crosshead (x = 0)
    addMesh(crossG, discX(BR.r - 8, BR.x1 - 380, BR.x1 - 350, 40, 1).translate(0, YE, 0), fine(), { edgeOpacity: 0.45 }); // its head, inside the cylinder
    addMesh(crossG, box(50, 230, 130, 4, 2).translate(20, YE, 0), mid(), { edgeOpacity: 0.45 });
    for (const z of [-30, 30]) addMesh(crossG, alongZ([[30, -7], [95, -7], [95, -3], [91, 0], [95, 3], [95, 7], [30, 7], [30, -7]], 56, 0.6).translate(60, YE, z), mid(), { edgeOpacity: 0.45 });
    underP.userData.part.mats.add(ramM);
    const bdialD = i === 2 ? makeDial(underP, 0.75) : null;
    if (bdialD) {
      bdialD.group.position.set(BR.x0 - 30, YE, 147);
      for (const m of bdialD.part.userData.part.mats) underP.userData.part.mats.add(m);
    }
    below.push(underP);
    const label = anchor(g, 0, BRINS.lift + 60, 0);
    return { g, deckP, underP, legs, sheaves, runs, crossG, oil, oilMat, bGlass, bdial: bdialD, label, cables };
  });
  const bight = anchor(wires[2].g, 0, BRINS.lift, 0);

  /* the laser and the three guides (ship's frame) */
  const T0 = V(...onAngled(TOUCH.s));
  const back = V(-ANGLED_DIR[0], 0, -ANGLED_DIR[2]);
  const tanG = Math.tan(TOUCH.glide * DEG);
  const slopePts = Array.from({ length: 25 }, (_, k) => {
    const d = (k / 24) * 180000;
    return T0.clone().addScaledVector(back, d).add(V(0, d * tanG + 20, 0));
  });
  const slope = ribbon(slopePts, { width: 40, minPx: 3, color: VEILLE, period: 3600, duty: 0.55, core: 0.75, halo: 0.3, near: 1500, H });
  slope.U.uHeadLen.value = 1500;
  const RD = V(...onAngled(0));
  const axisPts = Array.from({ length: 25 }, (_, k) => RD.clone().addScaledVector(back, (k / 24) * 160000).add(V(0, 15, 0)));
  const axisLine = ribbon(axisPts, { width: 40, minPx: 3, color: VEILLE, period: 3600, duty: 0.55, core: 0.75, halo: 0.3, near: 1500, H });
  axisLine.U.uHeadLen.value = 1500;
  brinsG.add(slope.mesh, axisLine.mesh);
  const bracketG = grp(brinsG);
  const bracketParts = (() => {
    const L = 520;
    const path = fatLine([[0, 0, 0], [0, -L * Math.sin(TOUCH.glide * DEG), -L * Math.cos(TOUCH.glide * DEG)]], { color: BRAND.veille, width: 2.6, opacity: 1 });
    const bodyG = grp(bracketG);
    const bodyLine = fatLine([[0, 0, 0], [0, 0, -L]], { color: BRAND.veille, width: 2.6, opacity: 1 });
    bodyG.add(bodyLine);
    const arcPts = Array.from({ length: 13 }, (_, k) => {
      const a = (-TOUCH.glide + (k / 12) * (5 + TOUCH.glide)) * DEG; // from the path up to the body's axis (its pitch on the approach: 5°)
      return [0, 330 * Math.sin(a), -330 * Math.cos(a)];
    });
    const arc = fatLine(arcPts, { color: BRAND.veille, width: 2.6, opacity: 1 });
    bracketG.add(path, arc);
    return [path.material, bodyLine.material, arc.material];
  })();
  bracketG.visible = false;
  const LASER0 = V(...onAngled(900, -1350, 130)); // its source, on the port edge near the round-down
  const laser = ribbon([LASER0.clone(), LASER0.clone().add(V(0, 0, -100))], { width: 4, minPx: 7, color: VEILLE, core: 0.28, halo: 0.55, H });
  brinsG.add(laser.mesh);
  const laserPos = laser.mesh.geometry.attributes.position;
  const laserTan = laser.mesh.geometry.attributes.aTan;
  const laserS = laser.mesh.geometry.attributes.aS;

  /* ═══════════════════════════════════════════ the landing mirror ═══════════════════════════════════════════ */

  const mirrorG = new THREE.Group();
  mirrorG.position.set(...MIRROR.at);
  mirrorG.rotation.y = ANGLED_YAW; // its face (+z) looks astern, at the aircraft that comes
  const mirrorP = partIn(mirrorG, "mirror");
  const YC = 190; //               the datum's height (the meatball's 0)
  const HH = MIRROR.h - 40; //     the lens box
  addMesh(mirrorP, box(320, 18, 200, 3, 2).translate(0, -9, -40), dark(), { edgeOpacity: 0.45 });
  addMesh(mirrorP, box(70, 60, 70, 3, 2).translate(0, 30, -10), dark(), { edgeOpacity: 0.45 });
  addMesh(mirrorP, box(120, HH, 72, 5, 3).translate(0, 60 + HH / 2 - 20, 0), dark(), { edgeOpacity: 0.5 });
  addMesh(mirrorP, box(96, HH - 30, 4, 2, 2).translate(0, 60 + HH / 2 - 20, 36), solid(0x1b1f23, { rough: 0.25, metal: 0.3, env: 1.4 }), { edgeOpacity: 0.55 }); // the lens's dark glass
  const am = mid();
  for (const sx of [-1, 1]) {
    addMesh(mirrorP, box(MIRROR.arm - 60, 12, 16, 2, 2).translate(sx * (60 + (MIRROR.arm - 60) / 2), YC, 4), am, { edgeOpacity: 0.45 });
    addMesh(mirrorP, box(20, 240, 18, 2, 2).translate(sx * 84, 175, 8), dark(), { edgeOpacity: 0.45 }); // the wave-off columns
    addMesh(mirrorP, box(12, YC - 10, 12, 2, 2).translate(sx * (MIRROR.arm - 30), (YC - 10) / 2, 0), dark(), { edgeOpacity: 0.4 }); // the arm's leg
  }
  const lamp = (heart, hue, x, y, z = 20) => {
    const b = makeBall(heart, hue, H);
    b.position.set(x, y, z);
    mirrorG.add(b);
    return b;
  };
  const DATUM = [130, 215, 300, 385, 470].flatMap((x) => [lamp(VEILLE.clone().lerp(WHITE, 0.45), VEILLE, -x, YC, 16), lamp(VEILLE.clone().lerp(WHITE, 0.45), VEILLE, x, YC, 16)]);
  const WAVE = [80, 140, 200, 260].flatMap((y) => [lamp(SIGNAL.clone().lerp(WHITE, 0.4), SIGNAL, -84, y, 20), lamp(SIGNAL.clone().lerp(WHITE, 0.4), SIGNAL, 84, y, 20)]);
  const ball = lamp(WHITE, new THREE.Color(1, 0.88, 0.7), 0, YC, 42);
  const ballHeart = ball.material.uniforms.uHeart.value;
  const ballHue = ball.material.uniforms.uHue.value;
  const BALL_HOT = new THREE.Color(1, 0.88, 0.7);
  const BALL_LOW = SIGNAL.clone();
  const BALL_LOW_H = SIGNAL.clone().lerp(WHITE, 0.35);

  /* ═══════════════════════════════════════════ the bench ═══════════════════════════════════════════ */

  /* item 2: a length of steam cylinder, cut open, its piston (left) · a length of an electromagnetic launcher (right) */
  const emals = new THREE.Group();
  const EL = 320;
  const steamP = partIn(emals, "bench-steam");
  const SX = -95;
  const SR = 32;
  const cutGeo = (r0, r1) => {
    // a cylinder lying along z with a window cut on its upper port side (toward a camera at az −30, el 16)
    // (CylinderGeometry: x = r sin θ, z = r cos θ; laid along z it becomes y = −r cos θ: θ = 210° looks up and to port)
    const open = 1.35; //  radians of the window
    const start = (210 * Math.PI) / 180 + open / 2;
    const outer = new THREE.CylinderGeometry(r1, r1, EL, 64, 1, true, start, Math.PI * 2 - open);
    const inner = new THREE.CylinderGeometry(r0, r0, EL, 64, 1, true, start, Math.PI * 2 - open);
    return [outer.rotateX(Math.PI / 2), inner.rotateX(Math.PI / 2)];
  };
  const sm1 = mid();
  sm1.side = THREE.DoubleSide;
  const [so, si] = cutGeo(SR - 4, SR);
  addMesh(steamP, so.translate(SX, SR + 12, 0), sm1, { edgeOpacity: 0.55, threshold: 40 });
  addMesh(steamP, si.translate(SX, SR + 12, 0), sm1, { edges: false });
  addMesh(steamP, ringZ(SR - 3, SR + 6, EL / 2 - 16, EL / 2, 64, 1.5).translate(SX, SR + 12, 0), dark(), { edgeOpacity: 0.5 });
  for (const z of [-EL / 3, EL / 3]) addMesh(steamP, plate([[-46, 0], [46, 0], [46, 12], [28, 26], [-28, 26], [-46, 12]], 22, { bevel: 2 }).translate(SX, 0, z - 11), dark(), { edgeOpacity: 0.45 });
  const pistonB = grp(steamP, [SX, SR + 12, 0]);
  addMesh(pistonB, alongZ([[0, -40], [SR - 7, -40], [SR - 5, -36], [SR - 5, 36], [SR - 7, 40], [0, 40]], 48, 1.2), bright(), { edgeOpacity: 0.5 });
  addMesh(pistonB, box(8, 22, 60, 2, 2).translate(0, SR - 2, 0), fine(), { edgeOpacity: 0.5 });
  for (const m of pistonB.children) steamP.userData.part.mats.add(m.material);
  const benchSteamMat = volume(VEILLE, 0.55);
  benchSteamMat.uniforms.uAxis.value.set(0, 0, -1);
  const benchSteam = new THREE.Mesh(alongZ([[SR - 7, 40], [SR - 7, EL / 2 - 16]], 40, 0).translate(SX, SR + 12, 0), benchSteamMat);
  benchSteam.renderOrder = 8;
  steamP.add(benchSteam);
  // the electromagnetic launcher: a base, two rows of coil blocks, the armature plate between them
  const emP = partIn(emals, "bench-emals");
  const EX = 95;
  addMesh(emP, box(120, 14, EL, 3, 2).translate(EX, 7, 0), dark(), { edgeOpacity: 0.5 });
  const NC = 12;
  const coilMats = [];
  for (let k = 0; k < NC; k++) {
    const z = -EL / 2 + 13 + (k * (EL - 26)) / (NC - 1);
    const cmk = mid();
    coilMats.push({ mat: cmk, z, rest: cmk.color.clone(), tint: cmk.color.clone().multiply(TINT) });
    for (const sx of [-1, 1]) addMesh(emP, box(34, 40, 21, 3, 2).translate(EX + sx * 26, 14 + 20, z), cmk, { edgeOpacity: 0.5 });
  }
  const armG = grp(emP, [EX, 0, 0]);
  addMesh(armG, box(8, 52, 70, 2, 2).translate(0, 14 + 30, 0), bright(), { edgeOpacity: 0.5 });
  addMesh(armG, box(36, 8, 60, 2, 2).translate(0, 14 + 58, 0), fine(), { edgeOpacity: 0.5 });
  for (const m of armG.children) emP.userData.part.mats.add(m.material);

  /* item 4: Ely, 1911 — a strip of wooden platform (X-ray), ropes across it on two low rails, a sandbag at each end */
  const ely = new THREE.Group();
  const elyP = partIn(ely, "ely");
  const wGlass = glass(BRAND.ink, { base: 0.012, rim: 0.28, power: 2.6, edge: 0.5, spec: 0.3, through: 0.25 });
  const plat = new THREE.Mesh(box(380, 8, 320, 2, 2).translate(0, 4, 0), wGlass);
  plat.renderOrder = 9;
  ely.add(plat);
  const planks = edgesOf(box(380, 8, 320, 2, 2).translate(0, 4, 0), { color: BRAND.ink, width: 1.8, opacity: 0.55 });
  ely.add(planks);
  for (let k = 1; k < 6; k++) ely.add(fatLine([[-190, 8.3, -160 + (k * 320) / 6], [190, 8.3, -160 + (k * 320) / 6]], { color: BRAND.ink, width: 1.8, opacity: 0.32 }));
  for (const x of [-150, 150]) {
    const rail = new THREE.Mesh(box(26, 22, 320, 2, 2).translate(x, 8 + 11, 0), wGlass);
    rail.renderOrder = 9;
    ely.add(rail, edgesOf(box(26, 22, 320, 2, 2).translate(x, 8 + 11, 0), { color: BRAND.ink, width: 1.8, opacity: 0.6 }));
  }
  const ropeM = solid(0xc8c3b6, { rough: 0.8, metal: 0 });
  const bagM = solid(0x7d7a72, { rough: 0.95, metal: 0 });
  const elyRopes = [];
  for (const z of [-110, -55, 0, 55, 110]) {
    const pts = bentPath([[-222, 22, z], [-150, 32, z], [150, 32, z], [222, 22, z]], 14, 5);
    elyRopes.push(addMesh(elyP, tube(pts, 1.8, { radial: 10 }), ropeM, { edges: false }));
    for (const sx of [-1, 1]) addMesh(elyP, box(42, 26, 34, 11, 3).translate(sx * 236, 13, z), bagM, { edgeOpacity: 0.35 });
  }

  /* ═══════════════════════════════════════════ set ═══════════════════════════════════════════ */

  // The systems are the subject: no fog on their lights (a lamp at 1.3 km must not be eaten)
  for (const g of [mirrorG, brinsG]) g.traverse((o) => {
    if (o.material?.isShaderMaterial) o.material.fog = false;
  });

  const lamps = {
    cyl: lampOf(C[0].cyls[0].part, C[0].cyls[1].part),
    pist: lampOf(C[0].pistons[0].part, C[0].pistons[1].part),
    shuttle: lampOf(C[0].shuttle, C[0].croc, C[0].link),
    hb: lampOf(gearHalf, deckHalf),
    tank: lampOf(tankP),
    valve: lampOf(valveP, dial.part),
    cabin: lampOf(cabinP),
    cat2: lampOf(C[1].cyls[0].part, C[1].cyls[1].part, C[1].shuttle, C[1].croc, C[1].link),
    mirror: lampOf(mirrorP),
    brake: lampOf(wires[2].underP),
  };

  // nothing is allocated past this line
  const G = V();
  const Fp = V();
  const N = V();
  const Gl = V();
  const P1 = V();
  const P2 = V();
  const Q = V();
  const hk = V();
  const CK = Math.cos(ANGLED_YAW);
  const SK = Math.sin(ANGLED_YAW);
  /** Points a half of the holdback from its neck end `a` toward its far end `b` (both in holdbackHome's frame). */
  const aim = (half, a, b, sgn) => {
    half.position.copy(a);
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    half.rotation.set(sgn < 0 ? Math.atan2(dy, -dz) : Math.atan2(-dy, dz), 0, 0);
  };

  function set(p = {}, time = 0) {
    const place = Math.round(p.place ?? 0);
    const named = Math.round(p.named ?? 0);
    const broken = clamp01(p.broken ?? 0);
    const strain = clamp01(p.strain ?? 0);
    const tremble = p.tremble ?? 0;

    /* ── the holdback (on the deck, or on the bench) ── */
    const neckGlow = (strain * (0.75 + 0.12 * Math.sin(time * Math.PI * 2 * 0.8)) + (named === 5 ? 0.35 : 0)) * (1 - smooth(ramp(broken, 0.05, 0.4)));
    for (const h of halves) h.piece.userData.U.uNeck.value = neckGlow;
    light(lamps.hb, named === 5 ? 1 : 0);
    // the light at the neck: two frames up (broken 0 → 0.27 ≈ the first 2 of 7.5 frames), then it dies, smaller
    const up = ramp(broken, 0, 0.27);
    const flashK = broken <= 0 || broken >= 1 ? 0 : up < 1 ? up : Math.exp(-(broken - 0.27) * 5.5) * (1 - ramp(broken, 0.85, 1));
    shine(flash, 1.15 * flashK, 46 - 34 * ramp(broken, 0.27, 1), 9);
    for (const sh of shards) {
      const tb = broken * 0.42; // seconds of flight
      sh.visible = broken > 0.02 && broken < 0.98;
      if (!sh.visible) continue;
      const v = sh.userData.v;
      sh.position.set(v.x * tb, v.y * tb - 490 * tb * tb, v.z * tb);
      sh.rotation.set(sh.userData.w.x * tb, sh.userData.w.y * tb, sh.userData.w.z * tb);
    }
    shardMat.emissive.setScalar(0.45 * (1 - ramp(broken, 0.05, 0.5)));

    if (place === 1) {
      /* the bench: the bar lying on it, its two halves apart once broken */
      hbGroup.position.set(0, 9.8, 0);
      const sep = 3 + 16 * ease(ramp(broken, 0, 0.6));
      gearHalf.position.set(0, 0, broken > 0 ? -sep : 0);
      deckHalf.position.set(0, 0, broken > 0 ? sep : 0);
      gearHalf.rotation.set(0, 0, 0);
      deckHalf.rotation.set(0, 0, 0);

      /* item 2: the steam length (press) and the coils' wave (coils) */
      const press = clamp01(p.press ?? 0);
      const coils = clamp01(p.coils ?? 0);
      benchSteamMat.uniforms.uAmount.value = press;
      benchSteamMat.uniforms.uFlow.value = press;
      benchSteamMat.uniforms.uTime.value = time;
      pistonB.position.z = -20 * press;
      const head = EL / 2 - coils * EL; // the wave runs toward −z (the throw)
      for (const c of coilMats) {
        const d = (c.z - head) / 46;
        const k = coils > 0.001 && coils < 0.999 ? Math.exp(-d * d) + 0.18 * (c.z > head ? Math.exp(-(c.z - head) / 120) : 0) : coils >= 0.999 ? 0.15 : 0;
        c.mat.emissive.copy(VEILLE).multiplyScalar(0.55 * k);
        c.mat.color.copy(c.rest).lerp(c.tint, 0.6 * Math.min(1, k));
      }
      armG.position.z = Math.max(-EL / 2 + 40, Math.min(EL / 2 - 40, head));
      return;
    }

    /* ── the ship ── */
    hbGroup.position.set(0, 0, 0);
    const under = clamp01(p.under ?? 0);
    const explode = clamp01(p.explode ?? 0);
    const seeBelow = Math.max(under, smooth(ramp(explode, 0, 0.25)));
    const press = clamp01(p.press ?? 0);
    const valve = clamp01(p.valve ?? 0);
    const sCm = clamp01((p.shuttle ?? 0) / (STROKE / 100)) * STROKE;

    /* the two catapults */
    for (let i = 0; i < 2; i++) {
      const c = C[i];
      const s = i === 0 ? sCm : clamp01((p.shuttle2 ?? 0) / (STROKE / 100)) * STROKE;
      const sv = Math.min(s, c.stopS); // the shuttle stops in its water brake
      const ex = i === 0 ? explode : 0;
      const eCyl = win(ex, 0, 0.55);
      const ePist = win(ex, 0.2, 0.8);
      const eShut = win(ex, 0.08, 0.55);
      c.shuttleG.position.set(0, 260 * eShut, -sv);
      c.link.position.set(0, 140 * eShut, -sv);
      for (let k = 0; k < 2; k++) {
        const side = k ? 1 : -1;
        c.cyls[k].part.position.set(side * (TROUGH.gap + 230 * eCyl), -60 * eCyl, 0);
        // the pistons: under the shuttle — or, opened, slid aft out of their cylinders (the shuttle still moves them)
        const out = ePist * (sv + PIST.fore + 360);
        c.pistons[k].part.position.set(side * 230 * eCyl, -60 * eCyl, -sv + out);
        const U = c.cyls[k].skin.userData.U;
        U.uPist.value = sv + PIST.aft;
        U.uPress.value = (i === 0 ? press : 0) * (1 - eCyl);
        U.uAhead.value = (i === 0 ? 0.06 * press : 0) * (1 - ramp(sv, 100, 600));
        U.uReach.value = sv + press * 1500;
        U.uK.value = 1.15;
      }
      for (const part of [c.cyls[0].part, c.cyls[1].part, c.pistons[0].part, c.pistons[1].part, c.link]) setPartOpacity(part, seeBelow);
      // the slot: two filets (ink, veille when named), lifted with the deck strip when opened
      const slotNamed = (i === 0 && named === 4) || (i === 1 && named === 9) ? 1 : 0;
      for (const sl of c.slots) {
        sl.mesh.position.y = 260 * win(ex, 0, 0.5);
        sl.U.uAmount.value = (0.34 + 1.1 * slotNamed) * (1 - win(ex, 0, 0.5));
        sl.U.uColor.value.copy(INK).lerp(VEILLE, slotNamed);
      }
    }
    /* the trace: a head of light from the shuttle to the bow (0 → 1), the line lit behind it */
    const trace = clamp01(p.trace ?? 0);
    const tr = bow.trace;
    // (trace depends on its value only: tweened down, the head runs back. To put a drawn line out without that, the
    // OPTIONAL traceOut 0 → 1 fades it where it stands — world.js does not pass it yet: see docs/journal/L04-model.md)
    tr.U.uAmount.value = trace > 0.001 ? 0.95 * (1 - clamp01(p.traceOut ?? 0)) : 0;
    tr.U.uHead.value = 10 + trace * (bow.edgeS - 10);
    tr.U.uHeadK.value = 1.8 * (1 - ramp(trace, 0.94, 1)) + 0.25;
    tr.mesh.position.y = 260 * win(explode, 0, 0.5);

    light(lamps.cyl, named === 1 ? 1 : 0);
    light(lamps.pist, named === 2 ? 1 : 0);
    light(lamps.shuttle, named === 3 ? 1 : 0);
    light(lamps.cat2, named === 9 ? 1 : 0);

    /* the receiver, the valve, the pipes (the bow catapult) */
    const eV = win(explode, 0.35, 0.9);
    const eT = win(explode, 0.45, 1);
    valveG.position.set(valveAt[0] - 520 * eV, valveAt[1] + 170 * eV, valveAt[2] + 120 * eV);
    tankG.position.set(tankAt[0] - 700 * eT, tankAt[1] + 650 * eT, tankAt[2] - 1200 * eT);
    setPartOpacity(valveP, seeBelow);
    setPartOpacity(dial.part, seeBelow);
    setPartOpacity(tankP, seeBelow);
    setPartOpacity(pipesP, seeBelow * (1 - smooth(ramp(explode, 0, 0.25))));
    tGlass.uniforms.uAmount.value = seeBelow;
    vwGlass.uniforms.uAmount.value = seeBelow;
    const tank = clamp01(p.tank ?? 0);
    tankSteamMat.uniforms.uAmount.value = seeBelow * tank * (0.35 + 0.65 * under) * (named === 6 ? 1.35 : 1);
    tankSteamMat.uniforms.uFlow.value = valve * press;
    tankSteamMat.uniforms.uTime.value = time;
    discG.rotation.z = (valve * Math.PI) / 2; // closed: across the flow · open: along it
    valveSteamMat.uniforms.uAmount.value = seeBelow * (0.15 * tank + 0.85 * valve * Math.max(press, 0.35));
    valveSteamMat.uniforms.uFlow.value = valve;
    valveSteamMat.uniforms.uTime.value = time;
    const dialV = clamp01(p.dial ?? 0.5);
    dial.spin.rotation.z = -(dialV - 0.5) * 270 * DEG;
    for (const m of pipes) {
      m.material.userData.U.uFlow.value = valve * Math.max(press, 0.3);
      m.material.userData.U.uTime.value = time;
    }
    light(lamps.tank, named === 6 ? 1 : 0);
    light(lamps.valve, named === 7 ? 1 : 0);

    /* the deflector */
    const jbd = clamp01(p.jbd ?? 0);
    const ang = 52 * DEG * smooth(jbd);
    leaf.rotation.x = -ang;
    for (let k = 0; k < 3; k++) {
      // a strut from the deck, aft of the leaf, to the leaf's back two thirds along
      const zt = (JL * 0.66) * Math.cos(ang);
      const yt = (JL * 0.66) * Math.sin(ang) - 20 * Math.cos(ang);
      const st = struts[k];
      const dz = zt - st.position.z;
      const len = Math.max(1, Math.hypot(dz, yt));
      st.scale.set(1, len, 1);
      st.rotation.set(Math.atan2(dz, yt), 0, 0);
      st.visible = jbd > 0.02;
    }

    /* the holdback, between the nose gear and its deck fitting */
    const held = clamp01(p.held ?? 1);
    const sHold = Math.min(sCm, 15);
    Fp.set(F0[0], 6, F0[2] + HOLDBACK.deckZ);
    G.set(F0[0], 36, F0[2] - sHold + 45);
    Gl.set(F0[0], 9, Fp.z - LB);
    G.lerp(Gl, 1 - held);
    N.lerpVectors(G, Fp, HOLDBACK.piece);
    N.y -= (1 - strain) * held * 9;
    const shake = broken > 0 ? 0 : tremble * strain * (0.32 * Math.sin(time * Math.PI * 2 * 30) + 0.45 * Math.sin(time * Math.PI * 2 * 0.9 + 1));
    const lift = 200 * win(explode, 0.15, 0.65);
    holdbackHome.position.set(N.x, N.y + shake + lift, N.z);
    holdbackHome.rotation.set(0, 0, 0);
    // in holdbackHome's frame
    G.sub(N);
    Fp.sub(N);
    if (broken <= 0) {
      aim(gearHalf, Q.set(0, 0, 0), G, -1);
      aim(deckHalf, Q, Fp, 1);
    } else {
      // the gear half goes with the gear, hanging from it; the deck half falls back to the deck and slaps it
      P1.set(0, 36 - N.y, F0[2] - sCm + 45 - N.z); // the gear end, now
      const phi0 = Math.atan2(G.y, -G.z); // its angle below the horizontal, astern
      const phi = phi0 + (62 * DEG - phi0) * ease(ramp(broken, 0, 0.7));
      Q.set(0, P1.y - LG * Math.sin(phi), P1.z + LG * Math.cos(phi));
      aim(gearHalf, Q, P1, -1);
      const a0 = Math.atan2(-Fp.y, Fp.z); // the deck half's angle above the deck, forward of the fitting
      const u = ramp(broken, 0, 0.55);
      const slap = u < 1 ? u * u : 1;
      const bounce = 0.14 * Math.sin(Math.PI * ramp(broken, 0.55, 0.85)) * (broken < 0.85 ? 1 : 0);
      const a = Math.max(Math.asin(Math.min(1, (9.8 - 6) / LD)), a0 * (1 - slap) + a0 * bounce);
      Q.set(0, Fp.y + LD * Math.sin(a), Fp.z - LD * Math.cos(a));
      aim(deckHalf, Q, Fp, 1);
    }

    /* the cabin */
    const cabin = clamp01(p.cabin ?? 0);
    cGlass.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.7 * cabin);
    cGlass.uniforms.uGain.value = 1 + 0.6 * cabin;
    for (const sc of screens) {
      sc.material.uniforms.uK.value = 0.15 + 1.1 * cabin;
      sc.material.uniforms.uDial.value = dialV;
    }
    light(lamps.cabin, named === 8 ? 1 : 0);

    /* the wires, Andromède's bight on your hook, the brakes under the deck */
    const wiresK = clamp01(p.wires ?? 0);
    const wireName = Math.round(p.wireName ?? 0);
    const caught = clamp01(p.caught ?? 0);
    const pull = Math.max(0, p.pull ?? 0);
    const brake = clamp01(p.brake ?? 0);
    const wNamed = named === 11 ? 1 : 0;
    if (p.hookAt && caught > 0.001) {
      // the hook's tip, from the ship's frame to the runway's (rotation.y = ANGLED_YAW about ANGLED.origin), then the wire's
      const dx = p.hookAt.x - ANGLED.origin[0];
      const dz = p.hookAt.z - ANGLED.origin[2];
      hk.set(dx * CK - dz * SK, p.hookAt.y, dx * SK + dz * CK + BRINS.s[2]);
    }
    for (let i = 0; i < 3; i++) {
      const w = wires[i];
      // the bight: the wire's middle at rest; Andromède's on the hook
      Q.set(0, BRINS.lift, 0);
      if (i === 2 && caught > 0.001 && p.hookAt) Q.lerp(hk, caught);
      const isNamed = wireName === i + 1;
      const k = 0.16 * wiresK + 0.32 * wNamed + (isNamed ? 0.55 : 0) + (i === 2 ? 0.25 * caught : 0);
      const head = i === 2 && caught > 0.01 && pull > 0.05 ? pull * 220 : -1e6;
      // the legs: from each deck sheave's top to the bight
      let sMax = 0;
      for (let j = 0; j < 2; j++) {
        const sx = j ? 1 : -1;
        const sh = w.sheaves[j];
        // the sheave swivels to face the bight
        let ux = Q.x - sx * XS;
        let uz = Q.z;
        const ul = Math.max(1e-3, Math.hypot(ux, uz));
        ux /= ul;
        uz /= ul;
        sh.turn.rotation.y = sx < 0 ? Math.atan2(-uz, ux) : Math.atan2(uz, -ux);
        P1.set(sx * XS + 30 * ux, BRINS.lift, 30 * uz);
        const leg = w.legs[j];
        const L = stretch(leg, Q, P1);
        sMax = Math.max(sMax, L);
        const U = leg.material.userData.U;
        U.uSa.value = 0;
        U.uHead.value = head;
        U.uHeadK.value = head > 0 ? 1.6 : 0;
        U.uGlow.value.copy(VEILLE).multiplyScalar(k);
      }
      // the purchase cables under the deck: down from the sheave, along the deck's underside, round the crosshead, back
      const xm = i === 2 ? BR.xm0 + (BR.xm1 - BR.xm0) * brake : BR.xm0;
      w.crossG.position.x = xm;
      for (const r of w.runs) {
        const pts = [
          [r.sx * (XS + 30), YS, r.z * 0],
          [r.sx * (XS + 30), YH, r.z],
          [XL, YH, r.z],
          [XL, YE + 95, r.z],
          [xm + 60, YE + 95, r.z],
        ];
        let sAcc = sMax;
        for (let q = 0; q < 4; q++) {
          P1.set(pts[q][0], pts[q][1], pts[q][2]);
          P2.set(pts[q + 1][0], pts[q + 1][1], pts[q + 1][2]);
          const seg = r.segs[q];
          const U = seg.material.userData.U;
          U.uSa.value = sAcc;
          sAcc += stretch(seg, P1, P2);
          U.uHead.value = head;
          U.uHeadK.value = head > 0 ? 1.3 : 0;
          U.uGlow.value.copy(VEILLE).multiplyScalar(0.6 * k);
        }
        // the return run, from under the crosshead's sheave back to the fixed block
        P1.set(xm + 60, YE - 95, r.z);
        P2.set(BR.fixed, YE - 95, r.z);
        const seg = r.segs[4];
        stretch(seg, P1, P2);
        seg.material.userData.U.uSa.value = sAcc + 200;
        seg.material.userData.U.uHead.value = head;
        seg.material.userData.U.uHeadK.value = head > 0 ? 1.3 : 0;
        seg.material.userData.U.uGlow.value.copy(VEILLE).multiplyScalar(0.6 * k);
      }
      setPartOpacity(w.underP, under);
      w.bGlass.uniforms.uAmount.value = under;
      // the oil: veille at work, signal as it heats (Andromède's)
      const heat = i === 2 ? smooth(ramp(brake, 0.25, 0.95)) : 0;
      const work = i === 2 ? brake : 0;
      w.oilMat.uniforms.uColor.value.copy(VEILLE).lerp(SIGNAL, heat);
      w.oilMat.uniforms.uAmount.value = under * (i === 2 ? 0.16 + 0.84 * work : 0.12);
      w.oilMat.uniforms.uFlow.value = work > 0.01 && work < 0.99 ? 1 : 0;
      w.oilMat.uniforms.uTime.value = time;
      if (w.bdial) w.bdial.spin.rotation.z = -(clamp01(p.bdial ?? 0.5) - 0.5) * 270 * DEG;
    }
    light(lamps.brake, named === 12 ? 1 : 0);

    /* the mirror */
    const mirror = clamp01(p.mirror ?? 0);
    const mNamed = named === 10 ? 1 : 0;
    light(lamps.mirror, mNamed);
    const ballV = Math.max(-1, Math.min(1, p.ball ?? 0));
    const low = smooth(ramp(-ballV, 0.2, 0.4));
    ball.position.y = YC + ballV * 125;
    ballHeart.copy(WHITE).lerp(BALL_LOW_H, low);
    ballHue.copy(BALL_HOT).lerp(BALL_LOW, low);
    shine(ball, 1.05 * mirror, 26, 6);
    for (const d of DATUM) shine(d, 0.85 * mirror, 17, 4);
    const wave = clamp01(p.waveoff ?? 0) * (0.88 + 0.12 * Math.sin(time * Math.PI * 2 * 0.45));
    for (const d of WAVE) shine(d, 0.95 * wave, 15, 5);

    /* the laser: from the port edge to your aircraft */
    const laserK = clamp01(p.laser ?? 0);
    laser.mesh.visible = laserK > 0.005 && !!p.laserTo;
    if (laser.mesh.visible) {
      const t = p.laserTo;
      P2.set(t[0], t[1] + 150, t[2]);
      Q.subVectors(P2, LASER0);
      const L = Q.length();
      Q.divideScalar(Math.max(L, 1e-3));
      for (let k = 0; k < 4; k++) {
        const end = k >= 2;
        laserPos.setXYZ(k, end ? P2.x : LASER0.x, end ? P2.y : LASER0.y, end ? P2.z : LASER0.z);
        laserTan.setXYZ(k, Q.x, Q.y, Q.z);
        laserS.setX(k, end ? L : 0);
      }
      laserPos.needsUpdate = true;
      laserTan.needsUpdate = true;
      laserS.needsUpdate = true;
      laser.U.uAmount.value = 0.9 * laserK;
    }

    /* the guides, in turn */
    const guides = clamp01(p.guides ?? 0);
    const g1 = ramp(guides, 0, 1 / 3);
    const g2 = ramp(guides, 1 / 3, 2 / 3);
    const g3 = ramp(guides, 2 / 3, 1);
    slope.U.uAmount.value = guides > 0.002 ? 0.75 : 0;
    slope.U.uHead.value = g1 * slope.length * 0.6;
    slope.U.uHeadK.value = 1.1 * (1 - g1) * (g1 > 0 ? 1 : 0);
    axisLine.U.uAmount.value = g3 > 0.002 ? 0.6 : 0;
    axisLine.U.uHead.value = g3 * axisLine.length * 0.6;
    axisLine.U.uHeadK.value = 1.1 * (1 - g3);
    bracketG.visible = g2 > 0.002 && !!p.laserTo;
    if (bracketG.visible) {
      const t = p.laserTo;
      const yaw = t[3] ?? ANGLED_YAW;
      bracketG.position.set(t[0] + Math.sin(yaw) * RAFALE.nose, t[1] + 150, t[2] + Math.cos(yaw) * RAFALE.nose);
      bracketG.rotation.set(0, yaw, 0);
      bracketG.children[0].rotation.x = ((t[4] ?? 5) - 5) * DEG; // the body's axis follows the pitch (the arc is drawn for 5°)
      for (const m of bracketParts) m.opacity = smooth(g2);
    }

  }
  set();

  return {
    cats: C.map((c) => ({ group: c.group, A: { shuttle: c.shuttleG, croc: c.crocA } })),
    holdback,
    holdbackHome,
    cabin: { group: cabinG, A: { seats } },
    brins: { group: brinsG, A: { bight, labels: wires.map((w) => w.label), athena: wires[0].label, aphrodite: wires[1].label, andromede: wires[2].label } },
    mirror: { group: mirrorG, A: { ball } },
    bench: { emals, ely },
    set,
  };
}
