// DOSSIER 021 — Veille du TGV : the system. The veille automatique (VACMA) of a TGV cab, as ONE object.
// Its root's origin: the pedal's hinge on the cab floor, in the knee space under the desk (plan.js: CAB_PEDAL).
// The driver would sit at +x (the seat): his foot would come from +x. Sizes are ILLUSTRATIVE (plan.js).
//   · THE PEDAL — a clear steel plate with five wide ribs, hinged at its heel (+x), its toe toward −x; up at `rest`
//     degrees, flat when pressed. Under its toe its return spring, a coarse coil that is squeezed in the shader (its
//     wire keeps its section). A toe stop, a bracket, a dark pad on the floor
//   · THE KEYS — two touch pads on a dark strip lying on the desk's edge, facing up; lit veille from under
//   · THE BOX — the countdown, a dark casing behind the desk's face; on its +z face (the camera's side) THE DIAL:
//     a ring that empties clockwise from noon, veille when a gesture feeds it, signal when it runs out with nobody.
//     Drawn in a shader: no number, no fine graduation. Its BLIND SPOT: a pie wedge of 1/12 of the turn at three
//     o'clock, dull signal, edged by two signal radii; the ring's empty track takes its tint in that sector — the
//     lit arc passes over it unchanged
//   · THE BELL — a clear dome on the desk top, its hammer (30 Hz: a steady blur) and three glass shells of signal
//     that widen slowly round it: a circle from any azimuth
//   · THE RELAY — two blades whose tips touch; `cut` lifts the upper one, the gap lights veille. An ink line runs
//     from the box through it and on toward +x (the traction): beyond the relay it goes dark when it opens
//   · THE VALVE — on a stub of the brake pipe under the floor: its flap opens downward, the air leaves in slow ink
//     streaks (tubes whose streaks are drawn in the shader), a veille lip round the outlet
//   · THE BOOT (the bench only) — a glass shoe, sole, heel, upper, low collar: no leg, no ankle. It lives in the
//     pedal's frame: it comes from above and behind (+x, +y), rests on the plate and goes down with it
//   · on the bench: a dark floor plate, two glass posts, and a glass silhouette of the desk (its top and its knee wall)
// Three values of grey: pad, box, strip, floor dark · bezel, relay, valve, bracket in between · pedal, dome, blades clear.
// Light: VEILLE is the system alive (the dial fed, the keys, the relay's gap, the open valve, what the voice names) ·
// SIGNAL the threat (the dial running out, the bell nobody answers, the blind spot) · INK the current and the air.
import * as THREE from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, edgesOf, fatLine, makePart, addMesh, setPartOpacity, setGlow, anchor, box, cyl, lathe, mergeGeometries, placed } from "@kit/build3d.js";
import { PEDAL, KEYS, BOX, BELL, RELAY, VALVE, SYSTEM } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const TINT = new THREE.Color(0.5, 1, 0.78); // what veille light does to a grey
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);
const glsl3 = (c) => `vec3(${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)})`;

/* ─────────────────────────────────────────────────────────── where everything is */

const DARK = 0x2a3035;
const MID = 0x646c72;
const CLEAR = 0xb6bbbe;
const HY = 5; //                                the hinge's axis above the floor
const TH = 1.6; //                              the pedal plate's thickness
const SPRING = { x: -22, r: 2.9, wire: 0.42, turns: 3.2 }; // the return spring, under the toe
const DIAL = { ro: 8.4, ri: 5.6, face: 8.9, b0: 0.25 - 1 / 24, b1: 0.25 + 1 / 24 }; // ring outer / inner, the face, the blind sector (fraction of the turn, clockwise from noon)
// The relay stands ON the box, not below it (plan.js has it at [−50, 20, 24], where it hides the pedal from every
// three-quarter view: the journal asks for RELAY.at = [−50, 64, 2]).
const RELAY_AT = RELAY.at;
const BELLY = 90; //                            the bell stands on the desk top (y 90 in the root's frame)
const TREMOR = 30; //                           the hammer's rate: the frame rate, a steady blur
// The exploded view, in ONE vertical frame seen from VIEW.exploded (az −40): each part's group goes to
// C + u·R + y·Up + f·F (R: the screen's right at az −40, F: toward the camera), turned by `yaw` (and `tilt` about R).
// (the stage puts the camera at (sin az, ·, cos az): az 0 is the +z side, az −90 the −x side, the nose's)
const R_ = new THREE.Vector3(Math.cos(40 * DEG), 0, Math.sin(40 * DEG));
const F_ = new THREE.Vector3(-Math.sin(40 * DEG), 0, Math.cos(40 * DEG));
const C_ = new THREE.Vector3(-20, 0, 15);
const OPEN = {
  bell: { u: -14, y: 88, f: 0, yaw: 0, tilt: 0, from: 0.0, to: 0.55 },
  keys: { u: 16, y: 74, f: 0, yaw: 50, tilt: 38, from: 0.07, to: 0.62 },
  box: { u: -6, y: 47, f: 6, yaw: -40, tilt: 0, from: 0.14, to: 0.7 },
  relay: { u: 25, y: 46, f: 0, yaw: -40, tilt: 0, from: 0.22, to: 0.78 },
  pedal: { u: 2, y: 15, f: 0, yaw: -40, tilt: 0, from: 0.28, to: 0.86 },
  valve: { u: 27, y: 3, f: -4, yaw: 30, tilt: 0, from: 0.36, to: 0.95 },
};

/* ─────────────────────────────────────────────────────────── light that is drawn */

/** A billboard of light: a bright core and a long tail (017). `uRadius` cm, `uMinPx` its least size on screen. */
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

/** A flat pool of light (a plane in its own xy): a soft disc that lights what it lies on. */
function haloMaterial(hue) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uHue: { value: hue.clone() }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        float k = exp(-r2 / 0.16) * 0.9 + 0.25 * exp(-r2 / 0.5);
        gl_FragColor = vec4(uHue * k * (1.0 - smoothstep(0.7, 1.0, sqrt(r2))) * uAmount, 1.0);
      }`,
  });
}

/** THE DIAL: a disc in its own xy (noon = +y, clockwise seen from +z = toward +x). */
function dialMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCount: { value: 1 }, uDanger: { value: 0 }, uBlind: { value: 0 }, uLit: { value: 0 }, uAmount: { value: 1 },
    },
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uCount, uDanger, uBlind, uLit, uAmount; varying vec2 vP;
      const float RO = ${DIAL.ro.toFixed(2)}, RI = ${DIAL.ri.toFixed(2)}, FACE = ${DIAL.face.toFixed(2)};
      const float B0 = ${DIAL.b0.toFixed(4)}, B1 = ${DIAL.b1.toFixed(4)}, TAU = 6.2831853;
      void main() {
        if (uAmount < 0.003) discard;
        float r = length(vP);
        if (r > FACE) discard;
        float aa = max(fwidth(r), 0.015);
        float th = fract(atan(vP.x, vP.y) / TAU + 1.0); // 0 at noon, growing clockwise
        float dth = aa / (TAU * max(r, 0.3));
        float band = smoothstep(RI - aa, RI + aa, r) * (1.0 - smoothstep(RO - aa, RO + aa, r));
        float count = clamp(uCount, 0.0, 1.0);
        float edge = 1.0 - count;
        float lit = max(smoothstep(edge - dth, edge + dth, th), step(0.9995, count)) * step(0.0005, count);
        // the blind sector: a pie wedge inside the ring, and the ring's empty track in it
        float inS = smoothstep(B0 - dth, B0 + dth, th) * (1.0 - smoothstep(B1 - dth, B1 + dth, th)) * uBlind;
        float pie = inS * (1.0 - smoothstep(RI - 0.35 - aa, RI - 0.35 + aa, r)) * smoothstep(0.5, 0.9, r);
        float dB = min(abs(th - B0), abs(th - B1)) * TAU * r;
        float radii = (1.0 - smoothstep(0.14, 0.14 + 2.0 * aa, dB)) * step(th, B1 + 0.05) * step(B0 - 0.05, th)
          * smoothstep(1.0, 1.4, r) * (1.0 - smoothstep(RI - 0.3, RI - 0.3 + aa, r)) * uBlind;
        float rims = (1.0 - smoothstep(0.08, 0.08 + 2.0 * aa, abs(r - RI))) + (1.0 - smoothstep(0.08, 0.08 + 2.0 * aa, abs(r - RO)));
        vec3 veille = ${glsl3(VEILLE)}, signal = ${glsl3(SIGNAL)}, ink = ${glsl3(INK)};
        float hot = smoothstep(0.3, 0.7, uDanger);
        vec3 arc = mix(veille * 1.1, signal * 1.5, hot) * (1.0 + 0.22 * uLit);
        // the head: where the ring is emptying, a pale lip
        float head = exp(-pow((th - edge) * TAU * r / 0.45, 2.0)) * step(0.0005, count) * (1.0 - step(0.9995, count));
        vec3 col = ink * 0.022 + veille * 0.03 * uLit;
        col += band * (1.0 - lit) * mix(ink * 0.085, signal * 0.36, inS);
        col += band * lit * (arc + head * vec3(0.9, 0.85, 0.75));
        col += pie * signal * 0.3 + radii * signal * 1.05;
        col += rims * (1.0 - band * lit) * ink * 0.2;
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });
}

/** Air leaving the valve: tubes along which slow streaks run (drawn in the shader: never points, never jumps). */
function airMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aSeed; varying float vS, vSeed; varying vec3 vN, vV;
      void main() {
        vS = uv.x; vSeed = aSeed;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uAmount; varying float vS, vSeed; varying vec3 vN, vV;
      void main() {
        float f = fract(vS * 2.6 - uTime * 0.75 + vSeed);
        float streak = smoothstep(0.0, 0.25, f) * (1.0 - smoothstep(0.35, 0.95, f));
        float along = smoothstep(0.0, 0.06, vS) * pow(clamp(1.0 - vS, 0.0, 1.0), 1.3);
        float facing = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        gl_FragColor = vec4(${glsl3(INK)} * streak * along * (0.35 + 0.65 * facing) * 0.75 * uAmount, 1.0);
      }`,
  });
}

/* ─────────────────────────────────────────────────────────── geometry */

/** The return spring: a coil of `turns` turns, its centreline's height carried in `aCy` (the shader squeezes it). */
function springGeometry(height) {
  const pts = [];
  const n = 120;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * SPRING.turns * Math.PI * 2;
    pts.push(new THREE.Vector3(SPRING.r * Math.cos(a), SPRING.wire + t * (height - 2 * SPRING.wire), SPRING.r * Math.sin(a)));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 160, SPRING.wire, 8, false);
  const cy = new Float32Array(geo.attributes.position.count);
  const segs = 160;
  for (let i = 0; i <= segs; i++) {
    const y = curve.getPointAt(i / segs).y;
    for (let j = 0; j <= 8; j++) cy[i * 9 + j] = y;
  }
  geo.setAttribute("aCy", new THREE.BufferAttribute(cy, 1));
  return geo;
}
/** A lit solid whose vertices are squeezed toward the floor by `uSqueeze` (rest height → `uH`), section kept. */
function squeezable(mat, rest) {
  const U = { uH: { value: rest } };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uH = U.uH;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nattribute float aCy; uniform float uH;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\ntransformed.y += aCy * (uH / ${rest.toFixed(3)} - 1.0);`);
  };
  mat.customProgramCacheKey = () => "021-spring";
  mat.userData.U = U;
  return mat;
}

/** The boot's width (cm) along its length (x from the heel, +2, to the toe, −29). */
const SHOE_W = [[2, 6.2], [-5, 6.6], [-12, 7.4], [-19, 9.4], [-24, 8.8], [-27.5, 6.2], [-29, 3]];
const shoeW = (x) => {
  for (let i = 1; i < SHOE_W.length; i++) {
    const [x0, w0] = SHOE_W[i - 1];
    const [x1, w1] = SHOE_W[i];
    if (x >= x1) return lerp(w0, w1, (x0 - x) / (x0 - x1));
  }
  return SHOE_W[SHOE_W.length - 1][1];
};
function shoeUpper() {
  const prof = [[0, 0.4], [0.7, 2.4], [0.5, 6.0], [-2.4, 6.4], [-6.2, 5.4], [-10.2, 5.3], [-14.5, 4.7], [-19.5, 3.6], [-24, 2.7], [-26.6, 1.9], [-27.4, 0.9], [-26.8, 0.1], [-20, 0], [-8, 0], [-1, 0.05]];
  const shape = new THREE.Shape(prof.map(([x, y]) => new THREE.Vector2(x, y)));
  let g = new THREE.ExtrudeGeometry(shape, { depth: 5, bevelEnabled: true, bevelThickness: 2.2, bevelSize: 1.1, bevelSegments: 5, curveSegments: 10 });
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g, 0.02);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i) + 1.1; // the bevel grows the outline: its foot back on 0
    const z = p.getZ(i) - 2.5;
    const w = shoeW(x) / 9.4;
    const top = 1 - 0.24 * smooth(clamp01(y / 7.5));
    p.setXYZ(i, x, y + 1.1 * smooth(ramp(x, -9, -5)) + 1.0, z * w * top); // on its sole; raised on the heel
  }
  g.computeVertexNormals();
  return g;
}
function shoeSole() {
  const side = [];
  for (let x = 2.2; x >= -29.2; x -= 1.4) side.push([x, (shoeW(x) / 2) * 1.05]);
  const back = side.slice().reverse().map(([x, z]) => [x, -z]);
  const shape = new THREE.Shape([...side, ...back].map(([x, z]) => new THREE.Vector2(x, z)));
  const sole = new THREE.ExtrudeGeometry(shape, { depth: 1.1, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.3, bevelSegments: 2, curveSegments: 8 });
  sole.rotateX(-Math.PI / 2);
  sole.translate(0, 0.2, 0);
  const heel = box(8, 1.2, 6.4, 0.3);
  heel.translate(-2, 1.9, 0);
  return { sole, heel };
}

/* ─────────────────────────────────────────────────────────── the system */

/** A group inside a part that moves on its own (a hinge, a blade, a hammer): what is added to it belongs to the part. */
function sub(part, name) {
  const g = makePart(name);
  g.userData.part.mats = part.userData.part.mats;
  g.userData.part.meshes = part.userData.part.meshes;
  part.add(g);
  return g;
}

/**
 * → { root, A, parts, update(P, time, px) }. `root`: its origin is the pedal's hinge on the floor (world.js hangs it
 * on the cab's mount or on the bench). `A`: anchors that follow their parts, opened or not.
 * P (see FIRST in world.js): bench, pedal, foot, still, keys, count, danger, bell, cut, vent, blind, explode,
 * litPedal, litKeys, litBox, litBell — docs/021-decors.md.
 */
export function buildSystem() {
  const root = new THREE.Group();
  root.name = "vacma";

  /* ── the bench's own: a floor plate, two glass posts, a glass silhouette of the desk ── */
  const benchG = new THREE.Group();
  root.add(benchG);
  const floorMat = solid(0x1f2428, { rough: 0.85, metal: 0.2 });
  floorMat.transparent = true; // it fades as the parts open
  const floorEdge = edgesOf(box(102, 3, 120, 0.4), { color: BRAND.ink, width: 1.8, opacity: 0.4 });
  const floor = new THREE.Mesh(box(102, 3, 120, 0.4), floorMat);
  floor.position.set(-21, -1.5, 20);
  floor.receiveShadow = true;
  floor.add(floorEdge);
  const postGlass = glass(BRAND.ink, { base: 0, rim: 0.22, edge: 0.45, spec: 0.35, through: 0.2 });
  const posts = [[-58, -22], [16, -22]].map(([x, z]) => {
    const m = new THREE.Mesh(cyl(1.8, 67, 0.2, 24), postGlass);
    m.position.set(x, -36.5, z);
    return m;
  });
  asShell(posts, 22);
  // the desk, in glass: its top (a faint pane and its outline) and its knee wall (an outline only, nothing in front of the pedal)
  const deskGlass = glass(BRAND.ink, { base: 0, rim: 0.12, edge: 0.3, spec: 0.18, through: 0.1 });
  const deskTop = new THREE.Mesh(box(80, 4, 92, 0.6), deskGlass);
  deskTop.position.set(-28, 88, 7);
  asShell([deskTop], 20);
  const kneeWall = edgesOf(new THREE.BoxGeometry(0.01, 56, 92), { color: BRAND.ink, width: 1.8, opacity: 0.22 });
  kneeWall.position.set(-34, 58, 7); // from the top down to the knee space: its lower edge stays clear of the pedal
  const topLines = edgesOf(deskTop.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.3 });
  deskTop.add(topLines);
  const deskLines = [topLines.material, kneeWall.material];
  const deskRest = [0.3, 0.22];
  benchG.add(floor, ...posts, deskTop, kneeWall);

  /* ── THE PEDAL ── */
  const pedal = makePart("pedal");
  root.add(pedal);
  const padMat = solid(DARK, { rough: 0.75, metal: 0.25 });
  addMesh(pedal, box(44, 0.8, 22, 0.25), padMat, { pos: [-18, 0.4, 0], edgeOpacity: 0.55 });
  const lugMat = solid(MID, { rough: 0.5, metal: 0.45 });
  for (const z of [-8.6, 8.6]) addMesh(pedal, box(4, HY + 1.2, 1.2, 0.2), lugMat, { pos: [0, (HY + 1.2) / 2 + 0.6, z], edgeOpacity: 0.5 });
  addMesh(pedal, box(3, HY - TH / 2 - 0.8, 12, 0.4), padMat, { pos: [-29, 0.8 + (HY - TH / 2 - 0.8) / 2, 0], edgeOpacity: 0.5 }); // the toe stop: where the plate lies, pressed
  const springRest = HY - TH / 2 + Math.sin(PEDAL.rest * DEG) * -SPRING.x - 0.8;
  const springMat = squeezable(solid(0x9ba2a6, { rough: 0.4, metal: 0.5 }), springRest);
  const spring = addMesh(pedal, springGeometry(springRest), springMat, { pos: [SPRING.x, 0.8, 0], edges: false });
  spring.castShadow = false; // its shadow would be the spring at rest
  const pivot = sub(pedal, "pivot"); // the plate and what rides on it turn about the hinge
  pivot.position.set(0, HY, 0);
  const plateMat = solid(0xa3a9ad, { rough: 0.55, metal: 0.3 });
  const ribs = [];
  for (let i = 0; i < 5; i++) ribs.push(placed(box(1.7, 0.75, PEDAL.w - 2.4, 0.28), { pos: [-5.5 - i * 5.4, TH / 2 + 0.3, 0] }));
  addMesh(pivot, box(PEDAL.len, TH, PEDAL.w, 0.45), plateMat, { pos: [-PEDAL.len / 2, 0, 0], edgeOpacity: 0.7 });
  addMesh(pivot, mergeGeometries(ribs), plateMat, { edgeOpacity: 0.45 });
  addMesh(pivot, cyl(1.2, PEDAL.w + 1, 0.2, 32), lugMat, { rot: [Math.PI / 2, 0, 0], edgeOpacity: 0.5 }); // the hinge's barrel

  /* ── THE BOOT (bench only) — it rides the plate ── */
  const boot = makePart("boot");
  const bootRig = new THREE.Group(); // where it rests on the plate (its heel near the hinge, its sole on the ribs)
  bootRig.position.set(-2.2, TH / 2 + 0.68, 0);
  pivot.add(bootRig);
  bootRig.add(boot);
  const upperGlass = glass(BRAND.ink, { base: 0, rim: 0.26, edge: 0.5, spec: 0.4, through: 0.22 });
  const soleGlass = glass(BRAND.ink, { base: 0, rim: 0.36, edge: 0.7, spec: 0.22, through: 0.25 });
  const shoe = shoeSole();
  const upper = new THREE.Mesh(shoeUpper(), upperGlass);
  const soleM = new THREE.Mesh(shoe.sole, soleGlass);
  const heelM = new THREE.Mesh(shoe.heel, soleGlass);
  const soleLines = edgesOf(shoe.sole, { color: BRAND.ink, width: 2, opacity: 0.55, threshold: 40 });
  soleM.add(soleLines);
  boot.add(upper, soleM, heelM);
  asShell([upper, soleM, heelM], 12);
  const bootMats = [upperGlass, soleGlass];

  /* ── THE KEYS ── */
  const keys = makePart("keys");
  keys.position.set(...KEYS.at);
  root.add(keys);
  const stripMat = solid(DARK, { rough: 0.6, metal: 0.2, coat: 0.3 });
  addMesh(keys, box(12, 2.4, 62, 0.5), stripMat, { pos: [0, 1.2, 0], edgeOpacity: 0.6 });
  const keyMat = solid(0x7d858b, { rough: 0.35, metal: 0.15, coat: 0.6 });
  const lensMat = glow(BRAND.veille, 0.1);
  const keyHalos = [];
  for (const s of [-1, 1]) {
    const z = (s * KEYS.gap) / 2;
    addMesh(keys, box(KEYS.size + 1, 1.0, KEYS.size + 1, 0.4), keyMat, { pos: [0, 2.9, z], edgeOpacity: 0.6 });
    addMesh(keys, box(KEYS.size - 1.6, 0.25, KEYS.size - 1.6, 0.1), lensMat, { pos: [0, 3.45, z], edges: false });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), haloMaterial(VEILLE));
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(0, 2.45, z);
    halo.renderOrder = 7;
    keys.add(halo);
    keyHalos.push(halo);
  }

  /* ── THE BOX AND ITS DIAL ── */
  const boxP = makePart("box");
  boxP.position.set(...BOX.at);
  root.add(boxP);
  const [bw, bh, bd] = BOX.size;
  const caseMat = solid(DARK, { rough: 0.55, metal: 0.3, coat: 0.25 });
  addMesh(boxP, box(bw, bh, bd, 0.9), caseMat, { edgeOpacity: 0.6 });
  const bezelMat = solid(MID, { rough: 0.38, metal: 0.45 });
  const bezel = lathe([[DIAL.face - 0.1, 0], [DIAL.face + 1.6, 0], [DIAL.face + 1.8, 0.5], [DIAL.face + 1.5, 1.1], [DIAL.face + 0.2, 1.1], [DIAL.face - 0.1, 0.7]], 96, { bevel: 0.15 });
  bezel.rotateX(Math.PI / 2);
  bezel.translate(0, 0, bd / 2);
  addMesh(boxP, bezel, bezelMat, { edgeOpacity: 0.5 });
  addMesh(boxP, box(4, bh - 6, bd + 2, 0.4), bezelMat, { pos: [-bw / 2 - 1.6, 0, 0], edgeOpacity: 0.5 }); // the connector at its back
  for (const y of [-bh / 2 + 3, bh / 2 - 3]) addMesh(boxP, box(bw + 6, 1.4, 4, 0.3), bezelMat, { pos: [0, y, -bd / 2 + 2], edgeOpacity: 0.45 }); // its mounting ears
  const dialMat = dialMaterial();
  const dial = new THREE.Mesh(new THREE.CircleGeometry(DIAL.face, 128), dialMat);
  dial.position.set(0, 0, bd / 2 + 0.35);
  boxP.add(dial);

  /* ── THE BELL ── */
  const bell = makePart("bell");
  bell.position.set(BELL.at[0], BELLY, BELL.at[2]);
  root.add(bell);
  const bellBase = solid(DARK, { rough: 0.6, metal: 0.25 });
  const domeMat = solid(0xc4c8ca, { rough: 0.26, metal: 0.5, coat: 0.5 });
  addMesh(bell, cyl(4.2, 1.2, 0.25, 48), bellBase, { pos: [0, 0.6, 0], edgeOpacity: 0.5 });
  addMesh(bell, cyl(0.7, 2.4, 0.1, 16), lugMat, { pos: [0, 2.2, 0], edges: false });
  const dome = lathe([[0, 7.6], [1.1, 7.5], [3.2, 6.7], [4.6, 5.1], [5.2, 3.6], [5.0, 3.4], [4.3, 4.8], [2.9, 6.3], [0, 7.0]], 96, { bevel: 0.12, round: 2 });
  addMesh(bell, dome, domeMat, { edgeOpacity: 0.4 });
  addMesh(bell, box(3.4, 3.2, 3.2, 0.4), bellBase, { pos: [-6.6, 1.6 + 1.2, -2.4], edgeOpacity: 0.5 }); // the hammer's coil
  const hammer = sub(bell, "hammer");
  hammer.position.set(-6.2, 3.8, -1.2);
  addMesh(hammer, box(0.7, 3.6, 0.7, 0.15), lugMat, { pos: [0, 1.6, 0], edges: false });
  addMesh(hammer, new THREE.SphereGeometry(0.95, 24, 16), domeMat, { pos: [0.4, 3.6, 0], edges: false });
  const waves = [0, 1, 2].map(() => {
    const mat = glass(BRAND.signal, { base: 0, rim: 1.25, power: 6 });
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mat);
    m.position.set(0, 4.8, 0);
    m.visible = false;
    m.renderOrder = 9;
    bell.add(m);
    return m;
  });

  /* ── THE RELAY ── */
  const relay = makePart("relay");
  relay.position.set(...RELAY_AT);
  root.add(relay);
  const [rw, rh, rd] = RELAY.size;
  addMesh(relay, box(rw + 3, 2.2, rd, 0.3), padMat, { pos: [0, -rh / 2 + 1.1, 0], edgeOpacity: 0.55 });
  const coilMat = solid(MID, { rough: 0.5, metal: 0.3 });
  addMesh(relay, cyl(2.3, 5.8, 0.2, 40), coilMat, { pos: [-2.6, -rh / 2 + 5.1, 0], edgeOpacity: 0.5 });
  addMesh(relay, box(1.2, 8, 4.2, 0.2), padMat, { pos: [-5.6, -rh / 2 + 6.2, 0], edgeOpacity: 0.5 }); // the yoke
  addMesh(relay, box(1.6, 7.5, 3, 0.25), padMat, { pos: [2.2, -0.05, 0], edgeOpacity: 0.55 }); // the post the blades come out of
  const bladeMat = solid(CLEAR, { rough: 0.32, metal: 0.45 });
  addMesh(relay, box(7.4, 0.55, 2.2, 0.15), bladeMat, { pos: [6.4, -0.4, 0], edgeOpacity: 0.6 }); // the fixed blade
  addMesh(relay, new THREE.SphereGeometry(0.75, 20, 12), bladeMat, { pos: [9.4, 0.15, 0], edges: false });
  const blade = sub(relay, "blade"); // the moving one, pivoting on the post
  blade.position.set(2.8, 2.4, 0);
  addMesh(blade, box(7.4, 0.55, 2.2, 0.15), bladeMat, { pos: [3.6, 0, 0], edgeOpacity: 0.6 });
  addMesh(blade, new THREE.SphereGeometry(0.75, 20, 12), bladeMat, { pos: [6.6, -0.55, 0], edges: false });
  const gapBall = makeBall(VEILLE);
  gapBall.position.set(9.4, 1.0, 0);
  relay.add(gapBall);
  const shut = 0.025; // closed: its contact rests on the fixed one

  /* ── THE VALVE, on a stub of the brake pipe ── */
  const valve = makePart("valve");
  valve.position.set(...VALVE.at);
  root.add(valve);
  const pipeMat = solid(MID, { rough: 0.5, metal: 0.35 });
  addMesh(valve, cyl(1.9, VALVE.stub, 0.2, 32), pipeMat, { rot: [0, 0, Math.PI / 2], edgeOpacity: 0.45 });
  for (const s of [-1, 1]) addMesh(valve, cyl(2.6, 1.4, 0.2, 32), pipeMat, { pos: [s * (VALVE.stub / 2 - 0.7), 0, 0], rot: [0, 0, Math.PI / 2], edgeOpacity: 0.45 });
  const valveMat = solid(0x353b40, { rough: 0.55, metal: 0.35 });
  addMesh(valve, lathe([[0, -11], [3.6, -11], [3.9, -10.4], [VALVE.r - 1, -8.6], [VALVE.r, -6], [VALVE.r, -2.2], [3, -1.2], [2.4, 0], [0, 0]], 64, { bevel: 0.25, round: 2 }), valveMat, { edgeOpacity: 0.55 });
  addMesh(valve, box(6, 5, 6, 0.5), lugMat, { pos: [0, 4.2, 0], edgeOpacity: 0.5 }); // its actuator, over the pipe
  const flap = sub(valve, "flap"); // the flap at the outlet: hinged at its +z edge, it swings down
  flap.position.set(0, -11.2, 3.4);
  addMesh(flap, cyl(3.4, 0.6, 0.15, 40), bladeMat, { pos: [0, 0, -3.4], edgeOpacity: 0.6 });
  const lipMat = glow(BRAND.veille, 0.01, { additive: true });
  const lip = new THREE.Mesh(new THREE.TorusGeometry(3.9, 0.32, 10, 64), lipMat);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = -11.1;
  lip.renderOrder = 6;
  valve.add(lip);
  const airGeos = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const ox = Math.cos(a) * 1.6;
    const oz = Math.sin(a) * 1.6;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(ox, -11.6, oz),
      new THREE.Vector3(ox * 2.2 + 2, -19, oz * 2.2),
      new THREE.Vector3(ox * 4 + 8, -28, oz * 3.6),
      new THREE.Vector3(ox * 5.5 + 17, -36, oz * 5),
    ]);
    const g = new THREE.TubeGeometry(curve, 40, 0.42, 6, false);
    g.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill((i * 0.37) % 1), 1));
    airGeos.push(g);
  }
  const airMat = airMaterial();
  const air = new THREE.Mesh(mergeGeometries(airGeos), airMat);
  air.renderOrder = 7;
  air.visible = false;
  valve.add(air);

  /* ── the wires: from the pedal and the keys to the box, from the box to the bell, the relay, the valve ── */
  const wireOpts = { color: BRAND.ink, width: 2, opacity: 0.3 };
  const wires = [
    [[-6, 0.9, -9.5], [-46, 0.9, -9.5], [-46, BOX.at[1] - bh / 2, -4]],
    [[KEYS.at[0] - 4, 89, -28], [-30, 84, -28], [-42, BOX.at[1] + bh / 2, -4]],
    [[-44, BOX.at[1] + bh / 2, 5], [-30, 86, 38], [BELL.at[0] - 3, BELLY + 0.5, BELL.at[2] - 1]],
    [[-62, BOX.at[1] - bh / 2 + 2, 2], [-62, 1, 40], [-62, -3, 70], [-62, VALVE.at[1] + 4, 70], [VALVE.at[0] - 26, VALVE.at[1] + 3, 70]],
  ].map((pts) => fatLine(pts, wireOpts));
  const [rx, ry, rz] = RELAY_AT;
  const lineIn = fatLine([[BOX.at[0] + 8, BOX.at[1] + bh / 2, -3], [rx + 2.2, ry - 4, -3], [rx + 2.2, ry - 0.6, rz]], { color: BRAND.ink, width: 2.6, opacity: 0.85, hdr: 1.25 });
  const lineOut = fatLine([[rx + 2.8, ry + 2.4, rz], [rx + 2.8, ry + 2.4, -20], [-30, ry + 2.4, -20], [-30, 1.2, -20], [30, 1.2, -20]], { color: BRAND.ink, width: 2.6, opacity: 0.85, hdr: 1.25 });
  root.add(...wires, lineIn, lineOut);
  const wireMats = wires.map((w) => w.material);

  /* ── anchors ── */
  const A = {
    hinge: anchor(root, 0, 0, 0),
    pedal: anchor(pivot, -PEDAL.len + 3, TH / 2 + 0.7, 0),
    keys: anchor(keys, 0, 3.6, 0),
    box: anchor(boxP, 0, 0, 0),
    dial: anchor(dial, 0, 0, 0),
    bell: anchor(bell, 0, 7.6, 0),
    relay: anchor(relay, 9.4, 0.6, 0),
    valve: anchor(valve, 0, -11.2, 0),
    boot: anchor(boot, -12, 6, 0),
    centre: anchor(root, ...SYSTEM.centre),
  };

  /* ── what lights up when the voice names a part: its solids, and the lines of its edges ── */
  const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  const lampOf = (...parts) => {
    const mats = parts.flatMap((part) => [...part.userData.part.mats]);
    const lines = mats.filter((mat) => mat.isLineMaterial);
    for (const line of lines) line.userData.rest = line.color.clone();
    const solids = mats.filter((mat) => mat.isMeshStandardMaterial);
    for (const mat of solids) {
      mat.userData.rest = mat.color.clone();
      mat.userData.tint = mat.color.clone().multiply(TINT);
      mat.userData.glow = 0.12 * (1 - 0.8 * Math.min(1, lum(mat.color)));
    }
    return { solids, lines, k: -1 };
  };
  const light = (lamp, k) => {
    if (lamp.k === k) return;
    lamp.k = k;
    for (const mat of lamp.solids) {
      mat.emissive.copy(VEILLE).multiplyScalar(mat.userData.glow * k);
      mat.color.copy(mat.userData.rest).lerp(mat.userData.tint, 0.65 * k);
    }
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.6 * k);
  };
  // the box, the bell, the relay and the valve share a few materials with the pedal (padMat, lugMat, bladeMat):
  // each lamp lights only what belongs to its own part, so those shared ones are given their own copies first
  for (const part of [keys, boxP, bell, relay, valve]) {
    const swap = new Map();
    part.traverse((o) => {
      if (!o.isMesh || !o.material.isMeshStandardMaterial) return;
      if (![padMat, lugMat, bladeMat].includes(o.material)) return;
      if (!swap.has(o.material)) {
        const copy = o.material.clone();
        copy.userData = { ...o.material.userData };
        swap.set(o.material, copy);
      }
      o.material = swap.get(o.material);
    });
    for (const [was, now] of swap) {
      part.userData.part.mats.delete(was);
      part.userData.part.mats.add(now);
    }
  }
  const lamps = { pedal: lampOf(pedal), keys: lampOf(keys), box: lampOf(boxP), bell: lampOf(bell) };

  /* ── the exploded view: each part's home and its open place, its turn ── */
  const Y = new THREE.Vector3(0, 1, 0);
  const opened = {};
  for (const [name, part] of Object.entries({ bell, keys, box: boxP, relay, pedal, valve })) {
    const o = OPEN[name];
    const at = C_.clone().addScaledVector(R_, o.u).addScaledVector(F_, o.f);
    at.y = o.y;
    const q = new THREE.Quaternion().setFromAxisAngle(R_, o.tilt * DEG).multiply(new THREE.Quaternion().setFromAxisAngle(Y, o.yaw * DEG));
    opened[name] = { part, home: part.position.clone(), at, q, from: o.from, to: o.to };
  }
  const QI = new THREE.Quaternion();
  const springU = springMat.userData.U;
  let lastBench = -1;

  // nothing is allocated past this line
  return {
    root, A,
    parts: { pedal, keys, box: boxP, bell, relay, valve, boot },
    update(P, time = 0) {
      const bench = (P.bench ?? 0) > 0.5;
      const e = bench ? clamp01(P.explode ?? 0) : 0;
      const pressed = clamp01(P.pedal ?? 0);
      const foot = bench ? clamp01(P.foot ?? 0) : 0;
      const still = clamp01(P.still ?? 0);
      const keysOn = clamp01(P.keys ?? 0);
      const ring = clamp01(P.bell ?? 0);
      const cut = clamp01(P.cut ?? 0);
      const vent = clamp01(P.vent ?? 0);

      // ── the bench's own: there on the bench, gone in the cab; they leave as the parts open
      if (lastBench !== +bench) {
        lastBench = +bench;
        benchG.visible = bench;
      }
      const stay = 1 - smooth(ramp(e, 0, 0.35));
      floorMat.opacity = stay;
      floorMat.depthWrite = stay > 0.5;
      floorEdge.material.opacity = 0.4 * stay;
      floor.visible = stay > 0.004;
      postGlass.uniforms.uAmount.value = stay;
      deskGlass.uniforms.uAmount.value = stay;
      for (let i = 0; i < deskLines.length; i++) deskLines[i].opacity = deskRest[i] * stay;

      // ── the pedal: up at its rest angle → flat; its spring is squeezed with it
      const ang = (1 - pressed) * PEDAL.rest * DEG;
      pivot.rotation.z = -ang;
      springU.uH.value = HY - TH / 2 + Math.sin(ang) * -SPRING.x - 0.8 - 0.25 * pressed;

      // ── the boot: from above and behind, onto the plate; then a dead weight
      const there = smooth(ramp(foot, 0, 0.45));
      boot.visible = bench && there > 0.004 && e < 0.3;
      const away = 1 - foot;
      bootRig.position.set(-2.2 + 15 * away, TH / 2 + 0.68 + 22 * away * away + 9 * away - 1.0 * still, 0.6 * still);
      bootRig.rotation.set(0.15 * still, 0, -0.1 * still + 0.18 * away * (1 - away) * 2);
      boot.scale.set(1, 1 - 0.07 * still, 1 + 0.04 * still);
      const amount = there * (1 - 0.6 * smooth(still)) * (1 - smooth(ramp(e, 0, 0.25)));
      upperGlass.uniforms.uAmount.value = amount;
      soleGlass.uniforms.uAmount.value = amount;
      upperGlass.uniforms.uSpec.value = 0.4 * (1 - 0.8 * still);
      soleLines.material.opacity = 0.55 * amount;
      soleLines.visible = amount > 0.004;

      // ── the keys, as under fingers
      setGlow(lensMat, 0.1 + 1.5 * keysOn);
      const keysSeen = keys.userData.part.opacity;
      for (const h of keyHalos) {
        h.material.uniforms.uAmount.value = 0.85 * keysOn * keysSeen;
        h.visible = keysOn > 0.004;
      }

      // ── the dial
      const DU = dialMat.uniforms;
      DU.uCount.value = clamp01(P.count ?? 1);
      DU.uDanger.value = clamp01(P.danger ?? 0);
      DU.uBlind.value = clamp01(P.blind ?? 0);
      DU.uLit.value = clamp01(P.litBox ?? 0);
      DU.uAmount.value = boxP.userData.part.opacity;

      // ── the bell rings: the hammer at the frame's own rate, three shells of signal widening slowly
      hammer.rotation.z = ring * 0.22 * Math.sin(time * TREMOR * Math.PI * 2);
      for (let i = 0; i < 3; i++) {
        const phi = (((time * 0.8 + i / 3) % 1) + 1) % 1;
        const k = ring * smooth(ramp(phi, 0, 0.12)) * Math.pow(1 - phi, 1.4) * bell.userData.part.opacity;
        const w = waves[i];
        w.visible = k > 0.004;
        w.scale.setScalar(6.5 + 22 * phi);
        w.material.uniforms.uAmount.value = k;
      }

      // ── the relay: the upper blade lifts, the gap lights veille, the line beyond goes dark
      blade.rotation.z = -shut + cut * 24 * DEG;
      shine(gapBall, 1.1 * smooth(ramp(cut, 0.08, 0.5)) * relay.userData.part.opacity, 2.2, 7);
      const wiresOn = 1 - smooth(ramp(e, 0, 0.2));
      lineIn.material.opacity = 0.85 * wiresOn;
      lineOut.material.opacity = (0.1 + 0.75 * (1 - smooth(ramp(cut, 0.2, 0.6)))) * wiresOn;
      lineIn.visible = lineOut.visible = wiresOn > 0.004;
      for (const m of wireMats) m.opacity = 0.3 * wiresOn;
      for (const w of wires) w.visible = wiresOn > 0.004;

      // ── the valve: the flap swings down, the air leaves in slow streaks, a veille lip
      const open = smooth(ramp(vent, 0, 0.4));
      flap.rotation.x = -68 * DEG * open;
      const seen = valve.userData.part.opacity;
      airMat.uniforms.uTime.value = time;
      airMat.uniforms.uAmount.value = smooth(ramp(vent, 0.05, 0.5)) * seen;
      air.visible = vent > 0.05;
      setGlow(lipMat, 1.5 * open * seen);
      lip.visible = open > 0.004;

      // ── opened (the bench): each part to its place in one vertical frame, turned to the camera
      for (const name in opened) {
        const o = opened[name];
        const s = settle(ramp(e, o.from, o.to));
        o.part.position.lerpVectors(o.home, o.at, s);
        o.part.quaternion.slerpQuaternions(QI, o.q, s);
      }

      // ── the part the voice names
      light(lamps.pedal, clamp01(P.litPedal ?? 0));
      light(lamps.keys, clamp01(P.litKeys ?? 0));
      light(lamps.box, clamp01(P.litBox ?? 0));
      light(lamps.bell, clamp01(P.litBell ?? 0));
    },
  };
}
