// DOSSIER 027 — Voie de détresse : the truck. A 40-tonne articulated lorry — a 4×2 tractor and a 3-axle box
// semi-trailer — seen like an X-ray, and you at the wheel.
//
//   buildTruck() → { group, A, update(P, time, px) }
//   P = { s, kmh, pedal, steer, heat, sink, you, shell }      (docs/027-decors.md, « camion.js »)
//
// ITS FRAME (plan.js, TRUCK): origin at the front axle's centre on the ground, nose toward −z, you (left-hand drive) on
// the −x side. world.js stands it at truckAt(s), turned to its heading, tilted with the descent.
//   group › frontAxle, driveAxle   the tractor's wheels: they only go down (`sink`)
//         › body                   the tractor: cab, chassis, you — it goes down and pitches about the front axle
//         › hitch                  on the fifth wheel: turns alone (the articulation) so that the trailer's middle
//             › trailer axles      axle stays on the path (plan.js truckAt) · their wheels go down one by one
//             › trailerBody        the box: it goes down and pitches about its kingpin
//
// HOW IT READS AT NIGHT. A glass truck must never become a cage of grey lines: it reads by its wheels, its drums, its
// lights and its cab — so that is where the light is.
//   · the wheels: glass tyres, crisp circles, and one painted mark on each sidewall that turns with `s` and is spread
//     over the arc it sweeps while the shutter is open (nothing fine that turns)
//   · the drums, SOLID, dark cast iron: a skin of heat over each (signal, brightest on the band the shoes press), a halo
//     in the air under it — a light that has a place — and embers that fall off and stream back
//   · the lights: the headlamps (ink: a core and a tail), the brake lights (signal: they burn while nothing slows), the
//     marker lights that draw a lorry's outline at night (ink at the front and along the flanks, signal at the back)
//   · the cab: a European flat face, its screen, the sun visor and its four lamps, the big mirrors
// The glass (hullGlass, after 014's body glass): a flat panel does not light up whole — a milky wall —, only where it
// turns away from the eye, on its rounded edges; the panes have a window's streaks. The lines are drawn in screen pixels
// and step back with depth (the far side is faint); the fine ones fade out when the truck gets small on screen.
// Solid besides the drums: the steering wheel and the brake pedal — the pedal is the hero of « c'est ton propre pied ».
// The front-left wheel and its brake are model.js's: they hang on A.hubFL, which steers and sinks; its embers and the
// halo under it are drawn here, with the nine others.
//
// TIME. Nothing here reads the clock: the wheels turn with `s`, the embers live and die with `s` — when the film freezes
// (`s` held), they hang in the air — and their streaks are as long as `kmh` makes them.
import * as THREE from "three";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeGeometries as mergeBare, toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, setGlow, glass, asShell, box, cyl, lathe, plate, placed, anchor, makePart, addMesh, setPartOpacity, SOFTBOX } from "@kit/build3d.js";
import { TRUCK, AXLES, HUB_FL, DRUM, YOU, SINK, truckAt, inBed } from "./plan.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const FRONT = V(0, 0, 1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const R = TRUCK.wheel; //             53: every tyre's radius (315/80 R22.5; the trailer's 385/65 R22.5 are as tall)
const RIM = 28.6; //                  a 22.5-inch rim
const HALF = TRUCK.track / 2; //      102.5: a single wheel's centre plane (the front, the trailer)
const HUB2 = 91; //                   the drive axle's hub flange: its twin tyres at ±(91 ∓ 17), their outer faces at ±124
const TWIN = 17;
const DRUM_X = HALF - DRUM.inset; //  86.5: a drum's centre plane, inboard of a single wheel (plan.js)
const DRUM2_X = HUB2 - TWIN - 2; //   72: a drive drum, inside the inner twin's rim
const DRUM_R = DRUM.r + 3; //         its outside (a 3 cm wall)
const DRUM_W = DRUM.w / 2;
const KP = TRUCK.kingpin; //          320
const KP_Y = 118; //                  the fifth wheel's plate: where the trailer turns and pitches
const TR = TRUCK.trailer;
const BOGIE = TR.axles[1] - KP; //    771: from the kingpin to the trailer's middle axle
const CAB = TRUCK.cab;
const W2 = CAB.w / 2;
const FACE = -140; //                 the cab's face at its foot (the bumper stands out to TRUCK.nose)
const RAKE = 0.075; //                the face leans back: 7.5 cm a metre
const LOCK = 30 * DEG; //             the front wheels at `steer` ±1 (+ to the right)
const SPIN = 100 * DEG; //            the steering wheel at `steer` ±1
const COLUMN = 50 * DEG; //           the steering column above the horizontal: a lorry's wheel lies flatter than a car's
const RIM_W = 24; //                  the steering wheel's radius
const SLOWMO = 2.5; //                world.js: on the road the film runs 2.5 times slower than the story (rate = kmh / 3.6 / SLOWMO)
const SHUTTER = 0.5 / 30; //          how long the stage's shutter stays open (s)

/** The cab's face leans back: where a point of its front end really stands (z), at height y. */
const raked = (y, z) => z + RAKE * Math.max(0, y - 140) * smooth(-40, -125, z);
const rk = (x, y, z) => [x, y, raked(y, z)];

/* ───────────────────────────────────────────────────────────── outlines */

/** A rounded rectangle, [u, v] points: from u0 to u1 and v0 to v1, the corners at v0 rounded by r0, those at v1 by r1. */
function rounded(u0, u1, v0, v1, r0, r1 = r0, n = 6) {
  const pts = [];
  const corner = (cu, cv, r, a0) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      pts.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]);
    }
  };
  corner(u1 - r0, v0 + r0, r0, -Math.PI / 2);
  corner(u1 - r1, v1 - r1, r1, 0);
  corner(u0 + r1, v1 - r1, r1, Math.PI / 2);
  corner(u0 + r0, v0 + r0, r0, Math.PI);
  return pts;
}

/**
 * A plan-view outline ([x, z]) given a height, from y0 to y1, its top and bottom edges rounded by `bevel`; `lean(y, z)`
 * moves each point along z (the cab's raked face). Smooth normals on every round, sharp elsewhere: the glass reads an
 * edge from them.
 */
function hull(outline, y0, y1, bevel, lean = null) {
  const g = plate(outline.map(([x, z]) => [x, -z]), y1 - y0, { bevel, round: 3, curveSegments: 8 });
  g.rotateX(-Math.PI / 2).translate(0, y0, 0);
  if (lean) {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, lean(p.getY(i), p.getZ(i)));
  }
  const out = toCreasedNormals(bare(g), 40 * DEG);
  // a face with no area has no normal: never hand the shader a null one (a NaN pixel is a black slab once bloomed)
  const nrm = out.attributes.normal;
  for (let i = 0; i < nrm.count; i++) if (nrm.getX(i) ** 2 + nrm.getY(i) ** 2 + nrm.getZ(i) ** 2 < 1e-8) nrm.setXYZ(i, 0, 1, 0);
  return out;
}

/** Position and normal only, not indexed: what every piece is reduced to before the pieces of one material are merged. */
function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  return o;
}

/** The edges of a piece (its own outline when its edges are broken), as a flat list of segments. */
function edgesInto(list, geometry, threshold = 28) {
  const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, threshold).attributes.position;
  for (let i = 0; i < e.count; i++) list.push(e.getX(i), e.getY(i), e.getZ(i));
}

const run = (list, pts) => {
  for (let i = 0; i < pts.length - 1; i++) list.push(...pts[i], ...pts[i + 1]);
};
const loop = (list, pts) => run(list, [...pts, pts[0]]);
/** A circle around an axis along x, at x, centred on (cy, cz). */
const ringX = (list, x, cy, cz, r, n = 56) => {
  const pts = [];
  for (let i = 0; i < n; i++) pts.push([x, cy + r * Math.cos((TAU * i) / n), cz + r * Math.sin((TAU * i) / n)]);
  loop(list, pts);
};
const ringZ = (list, cx, cy, z, r, n = 40) => {
  const pts = [];
  for (let i = 0; i < n; i++) pts.push([cx + r * Math.cos((TAU * i) / n), cy + r * Math.sin((TAU * i) / n), z]);
  loop(list, pts);
};
const ringY = (list, cx, y, cz, r, n = 40) => {
  const pts = [];
  for (let i = 0; i < n; i++) pts.push([cx + r * Math.cos((TAU * i) / n), y, cz + r * Math.sin((TAU * i) / n)]);
  loop(list, pts);
};

/* ───────────────────────────────────────────────────────────── materials of our own */

const BOX = (() => {
  const c = V(...SOFTBOX.pos);
  const d = c.length();
  c.normalize();
  const u = V().crossVectors(UP, c).normalize();
  return { c, u, v: V().crossVectors(c, u), size: V(SOFTBOX.w / 2, SOFTBOX.h / 2, d) };
})();

/**
 * The truck's glass (after 014's body glass; the kit's uniforms, so that asShell makes its two other layers out of it).
 * A panel only lights up where it turns away from the eye fast — its rounded edges; a flat flank seen along itself
 * stays dark instead of becoming a milky wall. `pane` (GLSL statements on vP, the object's own position, that set
 * `pane`): where the glass is a window — clear, a window's slanted streaks, the studio's softbox in it. `low`: the
 * panels fade toward the road below that height.
 */
function hullGlass({ rim = 0.3, power = 2.4, edge = 0.3, spec = 0.4, through = 0.2, pane = "", low = [0, 1] } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: INK.clone() }, uBase: { value: 1 }, uRim: { value: rim }, uPower: { value: power }, uAmount: { value: 1 },
      uEdge: { value: edge }, uSpec: { value: spec }, uGain: { value: 1 },
      uBoxC: { value: BOX.c }, uBoxU: { value: BOX.u }, uBoxV: { value: BOX.v }, uBoxSize: { value: BOX.size },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vP = position;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uBoxC, uBoxU, uBoxV, uBoxSize; uniform float uBase, uRim, uPower, uAmount, uEdge, uSpec, uGain;
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      float inside(float a, float b, float x, float w) { return smoothstep(a - w, a + w, x) * (1.0 - smoothstep(b - w, b + w, x)); }
      void main() {
        if (uAmount < 0.003) discard; // faded out, a shell must not hide the ones behind it
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        float facing = dot(n, v);
        float g = clamp(1.0 - abs(facing), 0.0, 1.0); // clamp before pow
        // a true edge turns away from the eye fast; a flank seen along itself does not, and must not light up whole
        float turn = smoothstep(0.0015, 0.02, fwidth(g));
        float fres = pow(g, uPower) * mix(0.25, 1.0, turn);
        float lip = smoothstep(0.6, 0.97, g) * mix(0.08, 1.0, turn);
        float pane = 0.0;
        { ${pane} }
        pane = clamp(pane, 0.0, 1.0);
        float panel = (0.018 * uBase + uRim * fres + uEdge * lip) * mix(0.45, 1.0, smoothstep(${low[0].toFixed(1)}, ${low[1].toFixed(1)}, vP.y));
        float glz = 0.004 * uBase + 0.4 * uRim * fres + 0.25 * uEdge * lip;
        float s = fract((vP.z * 0.8 + vP.y * 1.3) / 150.0);
        glz += uBase * 0.035 * (smoothstep(0.0, 0.08, s) * (1.0 - smoothstep(0.16, 0.3, s)) + 0.5 * smoothstep(0.44, 0.48, s) * (1.0 - smoothstep(0.52, 0.58, s)));
        if (uSpec > 0.0) {
          vec3 rf = (vec4(reflect(-v, facing < 0.0 ? -n : n), 0.0) * viewMatrix).xyz;
          float toward = dot(rf, uBoxC);
          vec3 q3 = rf * (uBoxSize.z / max(toward, 1e-3));
          vec2 q = abs(vec2(dot(q3, uBoxU), dot(q3, uBoxV))) / uBoxSize.xy;
          float sp = uSpec * (0.3 + 0.7 * g) * smoothstep(0.0, 0.3, toward) * (1.0 - smoothstep(0.2, 1.9, length(q)));
          panel += 0.3 * sp;
          glz += sp;
        }
        gl_FragColor = vec4(uColor * mix(panel, glz, pane) * uAmount * uGain, 1.0);
      }`,
  });
  mat.userData.through = through;
  return mat;
}

/**
 * Lines in screen pixels (the instanced quads of LineSegments2) that step back with depth: full strength on the near
 * side of `centre`, `far` on its far side. `lod` [a, b]: they fade out as the truck gets small on screen — gone when a
 * centimetre at `centre` is `a` pixels, whole at `b` (a far truck is not a knot of lines). `opacity`: their own share.
 */
function edgeLines({ width = 2, hdr = 1, far = 0.3, reach = 300, centre = [0, 200, 0], lod = null, opacity = 1 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: INK.clone().multiplyScalar(hdr) }, uWidth: { value: width }, uRes: { value: RES }, uAmount: { value: opacity },
      uFar: { value: far }, uCentre: { value: V(...centre) }, uReach: { value: reach }, uPx: { value: 2000 },
      uLod: { value: new THREE.Vector2(...(lod ?? [-1, 0])) },
    },
    vertexShader: /* glsl */ `
      uniform float uWidth, uReach, uPx; uniform vec2 uRes, uLod; uniform vec3 uCentre;
      attribute vec3 instanceStart; attribute vec3 instanceEnd;
      varying vec2 vUv; varying float vDepth; varying float vLod;
      // an end behind the eye is brought back in front of it (as LineMaterial does), or the quad turns inside out
      void trim(const in vec4 start, inout vec4 end) {
        float a = projectionMatrix[2][2];
        float b = projectionMatrix[3][2];
        float nearEstimate = -0.5 * b / a;
        float alpha = (nearEstimate - start.z) / (end.z - start.z);
        end.xyz = mix(start.xyz, end.xyz, alpha);
      }
      void main() {
        vUv = uv;
        vec4 start = modelViewMatrix * vec4(instanceStart, 1.0);
        vec4 end = modelViewMatrix * vec4(instanceEnd, 1.0);
        if (start.z < 0.0 && end.z >= 0.0) trim(start, end);
        else if (end.z < 0.0 && start.z >= 0.0) trim(end, start);
        vec4 clipStart = projectionMatrix * start;
        vec4 clipEnd = projectionMatrix * end;
        float aspect = uRes.x / uRes.y;
        vec2 dir = clipEnd.xy / (abs(clipEnd.w) > 1e-6 ? clipEnd.w : 1e-6) - clipStart.xy / (abs(clipStart.w) > 1e-6 ? clipStart.w : 1e-6);
        dir.x *= aspect;
        float len = length(dir);
        dir = len > 1e-7 ? dir / len : vec2(1.0, 0.0); // a segment seen end-on has no direction: never divide by its length
        vec2 offset = vec2(dir.y, -dir.x);
        dir.x /= aspect;
        offset.x /= aspect;
        if (position.x < 0.0) offset *= -1.0;
        if (position.y < 0.0) offset -= dir; else if (position.y > 1.0) offset += dir;
        vec4 clip = position.y < 0.5 ? clipStart : clipEnd;
        clip.xy += offset * (uWidth / uRes.y) * clip.w;
        gl_Position = clip;
        vec4 c = viewMatrix * modelMatrix * vec4(uCentre, 1.0);
        float z = position.y < 0.5 ? start.z : end.z;
        vDepth = (c.z - z) / uReach;
        float perCm = uPx / max(1.0, -c.z);
        vLod = uLod.y > 0.0 ? smoothstep(uLod.x, uLod.y, perCm) : 1.0;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uFar;
      varying vec2 vUv; varying float vDepth; varying float vLod;
      void main() {
        float a = uAmount * vLod;
        if (a < 0.003) discard;
        if (abs(vUv.y) > 1.0) { // round ends
          float b = abs(vUv.y) - 1.0;
          if (vUv.x * vUv.x + b * b > 1.0) discard;
        }
        float k = clamp(0.5 + 0.5 * vDepth, 0.0, 1.0);
        gl_FragColor = vec4(uColor, a * mix(1.0, uFar, k * k * (3.0 - 2.0 * k)));
      }`,
  });
  mat.userData.k = opacity;
  return mat;
}

/**
 * The painted mark on a sidewall: drawn on a ring that does not turn, at angle `uAngle` (0 at the top, growing toward
 * the front: the way a rolling wheel turns), spread over the arc it sweeps while the shutter is open (`uSmear`) — an
 * even band at speed, sharp when it stops. `r0`, `r1`: the band on the sidewall.
 */
function markMaterial(r0, r1) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(0.62) }, uAngle: { value: 0 }, uSmear: { value: 0 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vYZ;
      void main() {
        vYZ = position.yz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAngle, uSmear, uAmount; varying vec2 vYZ;
      void main() {
        if (uAmount < 0.003) discard;
        float r = length(vYZ);
        float ring = smoothstep(${r0.toFixed(1)}, ${(r0 + 1.8).toFixed(1)}, r) * (1.0 - smoothstep(${(r1 - 1.8).toFixed(1)}, ${r1.toFixed(1)}, r));
        float phi = atan(-vYZ.y, vYZ.x);
        float h = min(3.1416, 0.3 + 0.5 * uSmear);
        float d = abs(mod(phi - uAngle + 0.5 * uSmear + 3.1416, 6.2832) - 3.1416);
        float e = 0.04 + 0.3 * min(uSmear, 1.0);
        gl_FragColor = vec4(uColor * ring * (0.3 / h) * (1.0 - smoothstep(h - e, h + e, d)) * uAmount, 1.0);
      }`,
  });
}

/**
 * The heat of a drum: an additive skin over the solid, signal. Brightest on the band the shoes press (the middle of
 * its width), less on its outer face, cooler toward the hub; brighter where it faces the eye (it is round). Its object
 * frame is a LEFT drum's: the axle along x, the outer face toward −x (right drums are mirrored).
 */
function heatMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vP = position;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        float facing = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float w = ${DRUM_W.toFixed(1)};
        float band = smoothstep(-w, -0.4 * w, vP.x) * (1.0 - smoothstep(0.4 * w, w, vP.x));
        float face = smoothstep(-w + 0.3, -w - 0.3, vP.x); // the outer face
        float r = length(vP.yz);
        float k = mix(0.3 + 0.7 * band, 0.62 * smoothstep(11.0, ${DRUM_R.toFixed(1)}, r), face);
        gl_FragColor = vec4(uColor * k * (0.4 + 0.6 * sqrt(facing)), 1.0);
      }`,
  });
}

/**
 * Lights that have a place: a core and a tail, one point each (after 014). `core`: the share of the light in the
 * core (0.78 a lamp, 0.2 a glow of heat in the air). `front`: a lamp that faces somewhere (its own frame) is dim seen
 * from behind. `put(i, x, y, z, colour, k, across)`: `across` the whole halo, in cm (0: off).
 */
function makeSprites(count, { core = 0.78, front = null } = {}) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  const uniforms = { uScale: { value: 1600 }, uCore: { value: core }, uFront: { value: front ? V(...front) : V(0, 0, 0) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uScale; uniform vec3 uFront; attribute vec3 aColor; attribute float aSize; varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float k = 1.0;
          if (dot(uFront, uFront) > 0.0) {
            vec3 fw = normalize((modelViewMatrix * vec4(uFront, 0.0)).xyz);
            float toward = dot(fw, normalize(-mv.xyz + vec3(0.0, 0.0, 1e-4)));
            k = mix(0.16, 1.0, smoothstep(-0.2, 0.75, toward));
          }
          vColor = aColor * k;
          gl_Position = aSize > 0.0 ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0);
          gl_PointSize = clamp(aSize * uScale / max(1.0, -mv.z), 6.0, 320.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uCore; varying vec3 vColor;
        void main() {
          float n = clamp(1.0 - length(gl_PointCoord - 0.5) * 2.0, 0.0, 1.0);
          gl_FragColor = vec4(vColor * (uCore * pow(n, 6.0) + (1.0 - uCore) * n * n), 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 7;
  return {
    points, uniforms,
    put(i, x, y, z, colour, k, across) {
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      col[i * 3] = colour.r * k;
      col[i * 3 + 1] = colour.g * k;
      col[i * 3 + 2] = colour.b * k;
      size[i] = k > 0.004 ? across : 0;
    },
    flush() {
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aColor.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
    },
  };
}

/**
 * Embers falling off the drums (after 003 and 007), drawn as streaks — a dot hopping across the screen reads as
 * flicker. Each one is born again every few metres the truck runs: the whole thing is a pure function of `s`, alive on
 * the very first frame, and still when the film freezes. In the frame of what carries the drums: an ember leaves the
 * rim (bottom, toward the rear), falls to the road, skips on it, and falls behind faster and faster — the truck runs
 * on. `origins`: the drums' centres (updated as the axles sink). Its streak is the way it travels in `uStreak` seconds
 * of film at `uRate` metres a second: as long as the speed makes it. `uHeat` (0–1): how many of them are alive.
 */
function makeEmbers(origins, { per = 16, seed = 27 } = {}) {
  const n = origins.length;
  const count = n * per;
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4); // phase, life (m the truck runs), size (cm), rank (when it comes alive)
  const kicks = new Float32Array(count * 4); // which drum, where it leaves the rim (rad from the bottom toward the rear), drift (cm), age it lands
  for (let i = 0; i < count; i++) {
    seeds.set([rand(), 2.6 + rand() * 3.6, 0.9 + Math.pow(rand(), 2) * 1.8, rand()], i * 4);
    kicks.set([i % n, 0.15 + rand() * 1.15, (rand() - 0.5) * 24, 0.16 + rand() * 0.22], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3)); // unused: the shader places them
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  geo.setAttribute("aKick", new THREE.BufferAttribute(kicks, 4));
  const uniforms = {
    uS: { value: 0 }, uRate: { value: 0 }, uStreak: { value: 0.06 }, uAmount: { value: 0 }, uHeat: { value: 0 }, uScale: { value: 2000 },
    uView: { value: RES }, uEmit: { value: origins.map((o) => V(...o)) },
    uHot: { value: INK.clone().multiplyScalar(3.0) }, uCool: { value: SIGNAL.clone().multiplyScalar(2.4) },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uS, uRate, uStreak, uAmount, uHeat, uScale; uniform vec2 uView; uniform vec3 uEmit[${n}];
        attribute vec4 aSeed; attribute vec4 aKick;
        varying float vAge; varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
        vec3 place(float age, vec3 o) {
          float th = aKick.y;
          vec3 p = o + vec3(0.0, -cos(th) * ${DRUM_R.toFixed(1)}, sin(th) * ${DRUM_R.toFixed(1)});
          float life = aSeed.y * 100.0;
          float back = life * (age - (1.0 - exp(-3.0 * age)) / 3.0) + 40.0 * age;
          float land = aKick.w;
          float u = min(age / land, 1.0);
          float y = p.y * (1.0 - u * u);
          float after = clamp((age - land) / max(1.0 - land, 0.05), 0.0, 1.0);
          y += 6.0 * abs(sin(after * 9.42)) * (1.0 - after) * step(land, age);
          return vec3(p.x + aKick.z * age, max(y, 0.8), p.z + back);
        }
        void main() {
          vec3 o = uEmit[int(aKick.x + 0.5)];
          float age = fract(uS / aSeed.y + aSeed.x);
          float dAge = uStreak * uRate / aSeed.y;
          vec3 p = place(age, o);
          vec3 q = place(max(age - dAge, 0.0), o);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vec4 c0 = projectionMatrix * mv;
          vec4 c1 = projectionMatrix * modelViewMatrix * vec4(q, 1.0);
          vec2 run = (c0.w > 0.0 && c1.w > 0.0) ? (c0.xy / c0.w - c1.xy / c1.w) * 0.5 * uView : vec2(0.0);
          float len = min(length(run), 150.0);
          float size = clamp(aSeed.z * uScale / max(1.0, -mv.z), 1.8, 7.0);
          gl_PointSize = size + len;
          gl_Position = c0;
          gl_Position.xy -= (len > 0.5 ? normalize(run) * len : vec2(0.0)) / uView * c0.w; // centred on its path
          vDir = len > 0.5 ? normalize(run) : vec2(1.0, 0.0);
          vDot = size / (size + len);
          vHalf = 0.5 * (1.0 - vDot);
          vAge = age;
          float on = smoothstep(aSeed.w, aSeed.w + 0.1, uHeat);
          float env = smoothstep(0.0, 0.04, age) * (1.0 - smoothstep(0.5, 1.0, age));
          vA = on * env * uAmount * sqrt(vDot); // the same light, spread along the streak
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; varying float vAge; varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
        void main() {
          if (vA < 0.002) discard;
          vec2 q = gl_PointCoord - 0.5;
          q.y = -q.y; // point coordinates run downward
          float along = max(abs(dot(q, vDir)) - vHalf, 0.0);
          float across = dot(q, vec2(-vDir.y, vDir.x));
          float d = length(vec2(along, across)) / max(0.5 * vDot, 1e-3);
          float a = pow(max(0.0, 1.0 - d), 1.6);
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.0, 0.4, vAge)) * a * vA, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 6;
  return { points, uniforms, origins: uniforms.uEmit.value };
}

/* ───────────────────────────────────────────────────────────── the parts' shapes */

/** A tyre turned on its profile, the axle along x: `hw` half its section width; `dish`: the wheel's disc closes its
 *  outer face. `out` (±1): which way its outer face looks. */
function tyreGeometry(hw, dish, out) {
  const p = [[RIM, hw * 0.8], [33, hw * 0.95], [40, hw], [47, hw * 0.96], [51, hw * 0.82], [R, hw * 0.55], [R, -hw * 0.55], [51, -hw * 0.82], [47, -hw * 0.96], [40, -hw], [33, -hw * 0.95], [RIM, -hw * 0.8]];
  if (dish) p.unshift([10, hw * 0.5], [RIM - 3, hw * 0.62]);
  return lathe(p, 64).rotateZ((-out * Math.PI) / 2); // the profile's +y (its outer face) toward `out`·x
}

// a drum (a LEFT one: its outer face toward −x): the hat bolted to the hub, the cylinder, the stiffening lip at its open end
const DRUM_PROFILE = [[0.1, DRUM_W + 4.5], [9, DRUM_W + 4.5], [9.4, DRUM_W + 1.2], [13, DRUM_W + 1.2], [13.4, DRUM_W + 0.2], [DRUM_R - 0.8, DRUM_W + 0.2], [DRUM_R, DRUM_W - 0.6], [DRUM_R, -DRUM_W + 3], [DRUM_R + 1.4, -DRUM_W + 2.4], [DRUM_R + 1.4, -DRUM_W], [DRUM.r, -DRUM_W], [DRUM.r, DRUM_W - 2], [0.1, DRUM_W - 2]];
const drumGeometry = () => lathe(DRUM_PROFILE, 48, { bevel: 0.4 }).rotateZ(Math.PI / 2);
const skinGeometry = () => lathe([[12.6, DRUM_W + 0.55], [DRUM_R + 0.3, DRUM_W + 0.55], [DRUM_R + 0.3, DRUM_W - 0.4], [DRUM_R + 0.3, -DRUM_W + 2.2]], 48).rotateZ(Math.PI / 2);

/* ───────────────────────────────────────────────────────────── the truck */

export function buildTruck() {
  const group = new THREE.Group();
  const A = {};
  const glassMats = []; // what `shell` fades
  const lineMats = []; // the lines: `shell` fades them, `px` tells them how big the truck is on screen
  const lines = (parent, list, opts) => {
    if (!list.length) return null;
    const mat = edgeLines(opts);
    const mesh = new THREE.Mesh(new LineSegmentsGeometry().setPositions(list), mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    parent.add(mesh);
    lineMats.push(mat);
    return mat;
  };
  // the three strengths of a line: the silhouette, the details (gone when the truck is small), the lamps
  const STRONG = { width: 2.3, far: 0.3, opacity: 0.82 };
  const FINE = { width: 1.8, far: 0.22, opacity: 0.46, lod: [0.16, 0.38] };
  const LAMP = { width: 2.6, hdr: 1.6, far: 0.6, opacity: 0.9 };

  const cabGlass = hullGlass({
    rim: 0.34, power: 2.4, edge: 0.32, spec: 0.42, through: 0.22, low: [40, 150],
    pane: /* glsl */ `
      float lift = max(vP.y - 140.0, 0.0);
      float zf = ${FACE.toFixed(1)} + ${RAKE.toFixed(3)} * lift;
      float wind = inside(214.0, 328.0, vP.y, 1.2) * inside(-106.0, 106.0, vP.x, 1.2) * (1.0 - smoothstep(zf + 5.0, zf + 12.0, vP.z));
      float sideWin = inside(222.0, 326.0, vP.y, 1.2) * inside(-108.0 + ${RAKE.toFixed(3)} * lift, 14.0, vP.z, 1.2) * smoothstep(119.0, 123.0, abs(vP.x));
      pane = max(wind, sideWin);`,
  });
  const boxGlass = hullGlass({ rim: 0.2, power: 2.6, edge: 0.26, spec: 0.22, through: 0.14 });
  const trim = glass(BRAND.ink, { base: 0.002, rim: 0.18, power: 2.6, edge: 0.26, spec: 0.18, through: 0.1 }); // mirrors, visor, chassis, guards
  const inner = glass(BRAND.ink, { base: 0.002, rim: 0.08, power: 2.8, edge: 0.1, through: 0.08 }); // seats, dashboard: faint, they must not lie over you
  const tyreGlass = glass(BRAND.ink, { base: 0.01, rim: 0.32, power: 2.2, edge: 0.4, through: 0.15 });
  glassMats.push(cabGlass, boxGlass, trim, inner, tyreGlass);

  /* ═════════════ 1 · THE WHEELS AND THEIR DRUMS ═════════════ */

  const mark = markMaterial(33, 48);
  glassMats.push(mark);
  const drums = makePart("drums");
  const castIron = solid(0x3a4045, { rough: 0.62, metal: 0.35 });
  const shield = solid(0x272c31, { rough: 0.8, metal: 0.2 }); // the backing plate: the darkest grey
  const chamberMat = solid(0x6b7177, { rough: 0.55, metal: 0.3 }); // the air chamber that pushes the brake
  const heat = heatMaterial();
  const drumGeo = drumGeometry();
  const skinGeo = skinGeometry();
  const shieldGeo = cyl(DRUM_R + 1.2, 1.2, 0.3, 40).rotateZ(Math.PI / 2);
  const chamberGeo = cyl(8.5, 18, 0.8, 32).rotateX(Math.PI / 2);
  const rodGeo = box(2, 2, 13, 0.5);
  /** A drum brake, a LEFT one (outer face −x): `out` +1 mirrors it for the right side. */
  const drumNode = (out) => {
    const n = new THREE.Group();
    if (out > 0) n.scale.x = -1;
    for (const [geo, mat, pos] of [[drumGeo, castIron, [0, 0, 0]], [shieldGeo, shield, [DRUM_W + 1.1, 0, 0]], [chamberGeo, chamberMat, [DRUM_W + 12, -3, 27]], [rodGeo, chamberMat, [DRUM_W + 12, -3, 12]]]) {
      const mesh = addMesh(drums, geo, mat, { pos, edgeOpacity: 0.5, edgeWidth: 1.8 });
      n.add(mesh);
    }
    const skin = new THREE.Mesh(skinGeo, heat);
    skin.renderOrder = 4;
    n.add(skin);
    return n;
  };

  const tyres = [];
  /**
   * A wheel and its drum, built on its own centre: `kind` "single" (the front), "wide" (the trailer's super singles),
   * "twin" (the drive axle: two tyres on one hub flange); `out` (±1) which way it looks. Glass tyres, their circles
   * (the outer shoulder and the rim strong, the rest fine), the turning mark on the outer sidewall.
   */
  const makeWheel = (kind, out, phase) => {
    const node = new THREE.Group();
    const L = { strong: [], fine: [] };
    const tyreAt = (x, hw, dish, outer) => {
      const mesh = new THREE.Mesh(tyreGeometry(hw, dish, out).translate(x, 0, 0), tyreGlass);
      node.add(mesh);
      tyres.push(mesh);
      ringX(outer ? L.strong : L.fine, x + out * hw * 0.55, 0, 0, R - 0.6, 64);
      ringX(L.fine, x - out * hw * 0.55, 0, 0, R - 0.6, 64);
      ringX(outer ? L.strong : L.fine, x + out * hw * 0.8, 0, 0, RIM, 48);
      if (dish) ringX(L.fine, x + out * hw * 0.5, 0, 0, 10, 24);
      if (outer) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(33, 48, 64).rotateY(Math.PI / 2).translate(x + out * (hw + 0.4), 0, 0), mark);
        ring.rotation.x = phase;
        ring.renderOrder = 5;
        node.add(ring);
      }
    };
    if (kind === "twin") {
      tyreAt(out * TWIN, 16, true, true);
      tyreAt(-out * TWIN, 16, false, false);
    } else tyreAt(0, kind === "wide" ? 19 : 16, true, true);
    lines(node, L.strong, { ...STRONG, centre: [0, 0, 0], reach: 45, far: 0.25 });
    lines(node, L.fine, { ...FINE, centre: [0, 0, 0], reach: 45, far: 0.2 });
    const drum = drumNode(out);
    drum.position.x = -out * (kind === "twin" ? HUB2 - DRUM2_X : DRUM.inset);
    node.add(drum);
    return node;
  };

  // the front axle: its right wheel steers; the left one is model.js's, hung on A.hubFL (which steers too)
  const frontAxle = new THREE.Group();
  frontAxle.position.set(0, R, 0);
  const steerFR = makeWheel("single", 1, 0.7);
  steerFR.position.x = HALF;
  A.hubFL = anchor(frontAxle, HUB_FL[0], HUB_FL[1] - R, HUB_FL[2]);
  frontAxle.add(steerFR);
  // the drive axle: twin wheels
  const driveAxle = new THREE.Group();
  driveAxle.position.set(0, R, TRUCK.drive);
  for (const [out, phase] of [[-1, 2.1], [1, 4.4]]) {
    const w = makeWheel("twin", out, phase);
    w.position.x = out * HUB2;
    driveAxle.add(w);
  }
  group.add(frontAxle, driveAxle);
  // the axle beams: glass tubes between the wheels (a drive axle carries its differential)
  const axleTube = (r, len) => cyl(r, len, 1, 20).rotateZ(Math.PI / 2);
  const tractorAxleGlass = [new THREE.Mesh(axleTube(6, 2 * DRUM_X - 24), trim), new THREE.Mesh(mergeBare([bare(axleTube(9, 2 * DRUM2_X - 20)), bare(placed(new THREE.SphereGeometry(15, 24, 16), { pos: [0, -2, 3] }))]), trim)];
  frontAxle.add(tractorAxleGlass[0]);
  driveAxle.add(tractorAxleGlass[1]);

  /* ═════════════ 2 · THE TRACTOR: cab, chassis, you ═════════════ */

  const body = new THREE.Group(); // goes down with the front axle and pitches about it
  group.add(body);
  const B = { strong: [], fine: [], lamp: [], inner: [] };

  /* ── the cab's glass: the cabin (its face raked), the fairing and bumper in front of the wheels, the steps behind ── */
  const cabUpper = new THREE.Mesh(hull(rounded(-W2, W2, FACE, CAB.back, 26, 12), CAB.floor, CAB.roof, 10, raked), cabGlass);
  const cabLower = new THREE.Mesh(hull(rounded(-W2, W2, TRUCK.nose, -66, 20, 6), 36, CAB.floor + 6, 5), cabGlass);
  const steps = [-1, 1].map((s) => new THREE.Mesh(hull(rounded(s < 0 ? -W2 : W2 - 24, s < 0 ? -W2 + 24 : W2, 66, CAB.back, 4), 42, CAB.floor + 6, 3), cabGlass));
  body.add(cabUpper, cabLower, ...steps);
  asShell([cabUpper, cabLower, ...steps], 20);

  /* ── its lines ── */
  for (const s of [-1, 1]) {
    // the face's two corners and the back's, on the crest of their rounds
    const cf = W2 - 26 + 26 * Math.SQRT1_2;
    const zf = FACE + 26 - 26 * Math.SQRT1_2;
    run(B.strong, [rk(s * cf, CAB.floor + 10, zf), rk(s * cf, CAB.roof - 10, zf)]);
    const cb = W2 - 12 + 12 * Math.SQRT1_2;
    const zb = CAB.back - 12 + 12 * Math.SQRT1_2;
    run(B.strong, [[s * cb, CAB.floor + 10, zb], [s * cb, CAB.roof - 10, zb]]);
    // the fairing's front corners
    const lf = W2 - 20 + 20 * Math.SQRT1_2;
    const zl = TRUCK.nose + 20 - 20 * Math.SQRT1_2;
    run(B.strong, [[s * lf, 41, zl], [s * lf, CAB.floor + 1, zl]]);
  }
  const e = 10 * (1 - Math.SQRT1_2); // where the crest of a 10 cm round stands in from its two faces
  loop(B.strong, rounded(-W2 + e, W2 - e, FACE + e, CAB.back - e, 26 - e, 12 - e).map(([x, z]) => rk(x, CAB.roof - e, z)));
  loop(B.fine, rounded(-W2 + e, W2 - e, FACE + e, CAB.back - e, 26 - e, 12 - e).map(([x, z]) => rk(x, CAB.floor + e, z)));
  // the fairing and bumper: its foot (strong), the top of the bumper (fine) — round the front only
  const nose = rounded(-W2 + 1.5, W2 - 1.5, TRUCK.nose + 1.5, -66, 18.5, 3).filter(([, z]) => z < -67);
  const around = [...nose.slice(nose.findIndex(([x, z]) => x < 0 && z > TRUCK.nose + 10)), ...nose.slice(0, nose.findIndex(([x, z]) => x < 0 && z > TRUCK.nose + 10))];
  run(B.strong, around.map(([x, z]) => [x, 37.5, z]));
  run(B.fine, around.map(([x, z]) => [x, 94, z]));
  // the screen: the face's one big pane
  loop(B.strong, rounded(-106, 106, 214, 328, 10).map(([x, y]) => rk(x, y, FACE - 0.6)));
  // the grille
  for (const y of [150, 161, 172, 183, 194]) run(B.fine, [rk(-80, y, FACE - 0.6), rk(80, y, FACE - 0.6)]);
  // the doors (yours, at −x, strong), their windows, a handle; the wheel arch; the steps
  for (const s of [-1, 1]) {
    const l = s < 0 ? B.strong : B.fine;
    const x = s * (W2 + 0.5);
    loop(l, rounded(-116, 24, CAB.floor + 4, 336, 8).map(([z, y]) => rk(x, y, z)));
    loop(l, rounded(-108, 14, 222, 326, 6).map(([z, y]) => rk(x, y, z)));
    run(B.fine, [[x, 196, -2], [x, 196, 12]]);
    const arch = [];
    for (let i = 0; i <= 24; i++) {
      const t = (-78 + (152 * i) / 24) * DEG;
      arch.push([s * (W2 + 0.3), R + 63 * Math.cos(t), 63 * Math.sin(t)]);
    }
    run(B.fine, arch);
    for (const y of [72, 100]) run(B.fine, [[s * (W2 + 0.4), y, 69], [s * (W2 + 0.4), y, 92]]);
  }
  // the headlamps: two blades of light in each corner of the bumper
  for (const s of [-1, 1]) {
    run(B.lamp, [[s * 86, 76, TRUCK.nose - 0.8], [s * 115, 76, TRUCK.nose - 0.8]]);
    run(B.lamp, [[s * 88, 85, TRUCK.nose - 0.8], [s * 113, 86, TRUCK.nose + 0.5]]);
  }

  /* ── what says « truck » around the cab: the mirrors on their arms, the sun visor (its four lamps), the chassis
     rails, the fuel tank, the fifth wheel, the drive wheels' guards — glass and fine lines ── */
  const trimPieces = [];
  const trimPiece = (geometry, o, list = B.fine) => {
    const g = placed(geometry, o);
    if (list) edgesInto(list, g);
    trimPieces.push(bare(g));
  };
  for (const s of [-1, 1]) {
    trimPiece(box(22, 44, 9, 4), { pos: [s * 163, 272, raked(272, -128) + 4] });
    trimPiece(box(20, 18, 8, 3), { pos: [s * 160, 234, raked(234, -128) + 5] });
    run(B.fine, [rk(s * (W2 - 1), 304, -136), [s * 156, 292, raked(292, -128) + 4]]);
    run(B.fine, [rk(s * (W2 - 1), 226, -136), [s * 152, 236, raked(236, -128) + 5]]);
  }
  trimPiece(box(224, 3.5, 26, 1.5), { pos: [0, 339, raked(339, FACE) - 11], rotX: -6 * DEG });
  for (const s of [-1, 1]) {
    trimPiece(box(14, 26, 560, 2), { pos: [s * 43, 96, 185] }); // the chassis rails, from the bumper to the tail
  }
  trimPiece(cyl(29, 170, 3, 40).rotateX(Math.PI / 2), { pos: [96, 76, 210] }, null); // the fuel tank, on the other side: yours stays clear
  ringZ(B.fine, 96, 76, 210 - 83.5, 27.5);
  ringZ(B.fine, 96, 76, 210 + 83.5, 27.5);
  run(B.fine, [[96, 105, 127], [96, 105, 293]]);
  trimPiece(cyl(42, 7, 1.5, 40), { pos: [0, KP_Y - 4, KP] }, null); // the fifth wheel
  ringY(B.fine, 0, KP_Y - 0.3, KP, 41);
  run(B.fine, [[-9, KP_Y - 0.3, KP - 2], [0, KP_Y - 0.3, KP + 40]]);
  run(B.fine, [[9, KP_Y - 0.3, KP - 2], [0, KP_Y - 0.3, KP + 40]]);
  for (const s of [-1, 1]) {
    // the drive wheels' guards: a quarter of a drum over the twins, from the front-top round to the rear
    const guard = new THREE.CylinderGeometry(61, 61, 70, 28, 1, true, 10 * DEG, 115 * DEG).rotateZ(Math.PI / 2);
    trimPiece(guard, { pos: [s * HUB2, R, TRUCK.drive] }, null);
    for (const x of [s * HUB2 - 35, s * HUB2 + 35]) {
      const arc = [];
      for (let i = 0; i <= 16; i++) {
        const t = (10 + (115 * i) / 16) * DEG;
        arc.push([x, R + 61 * Math.sin(t), TRUCK.drive + 61 * Math.cos(t)]);
      }
      run(B.fine, arc);
    }
  }
  trimPiece(cyl(5, 220, 1, 16).rotateX(Math.PI / 2), { pos: [0, 64, 236] }, null); // the propeller shaft
  const trimMesh = new THREE.Mesh(mergeBare(trimPieces), trim);
  body.add(trimMesh);
  asShell([trimMesh, ...tractorAxleGlass], 18);

  /* ── inside: the seats, the bunk, the dashboard, the steering column ── */
  const AXIS = V(0, Math.sin(COLUMN), Math.cos(COLUMN)); // the column, toward you
  const HUBV = V(...YOU.wheel);
  const SEAT = V(YOU.wheel[0], CAB.floor + 60, YOU.wheel[2] + 45); // your hips: on the cushion, 60 cm above the floor
  const insidePieces = [];
  const piece = (geometry, o) => {
    const g = placed(geometry, o);
    edgesInto(B.inner, g);
    insidePieces.push(bare(g));
  };
  for (const x of [SEAT.x, -SEAT.x]) {
    piece(box(54, 12, 50, 4), { pos: [x, SEAT.y - 7, SEAT.z + 2] });
    piece(box(52, 74, 12, 5), { pos: [x, SEAT.y + 36, SEAT.z + 28], rotX: 10 * DEG });
    piece(box(28, 18, 10, 4), { pos: [x, SEAT.y + 84, SEAT.z + 36], rotX: 6 * DEG });
  }
  piece(box(236, 26, 46, 6), { pos: [0, 207, -114], rotX: -6 * DEG }); // the dashboard (the pedal stands under it: nothing lower)
  piece(box(232, 14, 62, 5), { pos: [0, 168, 60] }); // the bunk against the back wall
  piece(cyl(3.6, 46, 0.6, 20), { pos: [HUBV.x, HUBV.y - AXIS.y * 26, HUBV.z - AXIS.z * 26], rotX: Math.PI / 2 - COLUMN });
  const insideMesh = new THREE.Mesh(mergeBare(insidePieces), inner);
  body.add(insideMesh);
  asShell(insideMesh, 15);

  /* ── the lamps: the headlamps; the sun visor's four; the roof's front corners; and the trailer's (below) ── */
  const lamp = glow(BRAND.ink, 1.8);
  const visorLamp = glow(BRAND.ink, 1.1);
  const markerInk = glow(BRAND.ink, 1.0);
  const lit = []; // [material, k]: dimmed with `shell`
  lit.push([lamp, 1.8], [visorLamp, 1.1], [markerInk, 1.0]);
  for (const s of [-1, 1]) {
    const head = new THREE.Mesh(new THREE.PlaneGeometry(30, 11).rotateY(Math.PI), lamp); // it looks forward (−z): from behind, nothing
    head.position.set(s * 100, 80.5, TRUCK.nose - 0.8);
    body.add(head);
    for (const x of [26, 66]) {
      const v = new THREE.Mesh(box(8, 3.2, 2.4, 0.6), visorLamp);
      v.position.set(s * x, 336.5, raked(336, FACE) - 23.5);
      body.add(v);
    }
    const m = new THREE.Mesh(box(8, 4, 3, 0.8), markerInk);
    m.position.set(s * 108, CAB.roof - 3, raked(CAB.roof, FACE) + 9);
    body.add(m);
  }
  const heads = makeSprites(2, { core: 0.78, front: [0, 0, -1] });
  body.add(heads.points);

  lines(body, B.strong, { ...STRONG, centre: [0, 240, -20], reach: 200 });
  lines(body, B.fine, { ...FINE, centre: [0, 200, 60], reach: 220 });
  lines(body, B.lamp, { ...LAMP, centre: [0, 80, -146], reach: 200 });
  lines(body, B.inner, { width: 1.8, far: 0.2, opacity: 0.28, lod: [0.25, 0.6], centre: [0, 220, -40], reach: 120 });

  /* ── the controls, SOLID: the steering wheel (it turns with `steer`) and the brake pedal (it sinks with `pedal`) ── */
  const controls = makePart("controls");
  const rimMat = solid(0xaab0b5, { rough: 0.45, metal: 0.15 }); // the hero of « tu braques »: pale
  const darkMat = solid(0x30363b, { rough: 0.7 });
  const paleMat = solid(0xc9c4b8, { rough: 0.6 });
  const steering = new THREE.Group(); // its own frame: the rim in the xy plane, its column along −z
  steering.position.copy(HUBV);
  steering.rotation.set(-COLUMN, 0, 0);
  body.add(steering);
  {
    const spokes = [new THREE.TorusGeometry(RIM_W, 1.9, 14, 80), placed(box(15, 3, 2, 0.6), { pos: [-13, -1, 0] }), placed(box(15, 3, 2, 0.6), { pos: [13, -1, 0] }), placed(box(3.4, 15, 2, 0.6), { pos: [0, -13, 0] })];
    steering.add(addMesh(controls, mergeBare(spokes.map(bare)), rimMat, { edges: false }));
    steering.add(addMesh(controls, cyl(8.4, 5, 0.9, 40).rotateX(Math.PI / 2), darkMat, { edgeOpacity: 0.5, edgeWidth: 1.8 }));
    // the mark at twelve o'clock: what says how far the wheel has been turned
    steering.add(addMesh(controls, placed(new THREE.TorusGeometry(RIM_W, 2.05, 10, 10, 0.3), { rotZ: Math.PI / 2 - 0.15 }), paleMat, { edges: false }));
  }
  A.hands = anchor(body, HUBV.x, HUBV.y, HUBV.z);
  // the brake pedal: a pad hinged on a bracket at the floor (an « organ » pedal, as on a lorry); at rest it leans 52°
  const PAD0 = 52 * DEG;
  const PAD_TRAVEL = 20 * DEG;
  const PAD_LEN = 22;
  const hinge = V(YOU.pedal[0], YOU.pedal[1] - (PAD_LEN / 2) * Math.sin(PAD0), YOU.pedal[2] + (PAD_LEN / 2) * Math.cos(PAD0));
  const pad = new THREE.Group(); // its frame: the hinge at the origin, the pad lying along −z, its face toward +y
  pad.position.copy(hinge);
  pad.rotation.x = PAD0;
  body.add(pad);
  const padMat = solid(0xa9aeb3, { rough: 0.5, metal: 0.25 }); // the hero: the palest grey
  const ribMat = solid(0x252a2f, { rough: 0.9 });
  const armMat = solid(0x6d7379, { rough: 0.55, metal: 0.3 });
  pad.add(addMesh(controls, box(16, 2.2, PAD_LEN, 0.7), padMat, { pos: [0, 1.1, -PAD_LEN / 2], edgeOpacity: 0.7, edgeWidth: 1.8 }));
  for (const z of [-4, -8.5, -13, -17.5]) pad.add(addMesh(controls, box(14, 0.8, 1.7, 0.3), ribMat, { pos: [0, 2.5, z], edges: false }));
  pad.add(addMesh(controls, cyl(1.7, 19, 0.3, 20).rotateZ(Math.PI / 2), armMat, { edgeOpacity: 0.5, edgeWidth: 1.8 }));
  body.add(addMesh(controls, box(24, hinge.y - CAB.floor + 1.5, 8, 1), armMat, { pos: [hinge.x, (hinge.y + CAB.floor) / 2 - 0.5, hinge.z], edgeOpacity: 0.5, edgeWidth: 1.8 }));
  body.add(addMesh(controls, box(34, 1.2, 34, 0.4), darkMat, { pos: [hinge.x, CAB.floor + 0.6, hinge.z - 8], edgeOpacity: 0.45, edgeWidth: 1.8 }));
  A.pedal = anchor(pad, 0, 2.2, -PAD_LEN / 2);

  /* ═════════════ 3 · YOU, AT THE WHEEL ═════════════ */

  const you = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.35, through: 0.18 });
  you.group.rotation.y = Math.PI; // you look toward the nose (−z): your left is the door (−x)
  body.add(you.group);
  const flesh = makePart("flesh");
  flesh.userData.part.mats.add(you.flesh); // your head and your hands fade with the glass
  // your head is glass like the rest: only your hands (on the wheel) and your foot's pedal are what the sentences are about
  you.head.material = you.body;
  asShell(you.head, 10);
  A.head = anchor(you.head, 0, 0, 0);
  A.foot = anchor(you.legs.R.foot, 0, 0, 0);
  const gx = SEAT.x;
  const gy = SEAT.y - you.HIP;
  const gz = SEAT.z;
  you.group.position.set(gx, gy, gz);
  const mine = (x, y, z, out) => out.set(-(x - gx), y - gy, -(z - gz)); // a point of the truck, in your own frame
  const turned = (v, out) => out.set(-v.x, v.y, -v.z); // a direction of the truck, in your frame
  const E1 = V(1, 0, 0); // the rim's own plane: across the truck…
  const E2 = V().crossVectors(AXIS, E1); // …and up along it
  const OVER_RIM = turned(AXIS.clone().negate(), V()); // across the rim, away from you
  const HAND_AT = [Math.PI - 0.172, 0.172]; // where each hand holds the rim, from its +x: a quarter past nine
  const KNEE_L = V(0.45, 1, 0.2); // the left knee leans toward the door
  const KNEE_R = V(-0.35, 1, 0.3); // the right knee toward the middle: clear of the column
  const TOE_L = V(0, 0.12, 1).normalize();
  const SOLE = V(0, -7.6, 11); // the ball of the foot, from its ankle (the foot's own frame)
  const v1 = V();
  const v2 = V();
  const v3 = V();
  const v4 = V();
  const toe = V();
  const sole = V();
  const quat = new THREE.Quaternion();
  /** Your hands on the rim, turned by `spin` (radians, counter-clockwise seen from your seat). */
  function poseHands(spin) {
    for (let i = 0; i < 2; i++) {
      const a = HAND_AT[i] + spin;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      v1.copy(HUBV).addScaledVector(E1, RIM_W * ca).addScaledVector(E2, RIM_W * sa); // where the hand is, on the rim
      turned(v3.copy(E1).multiplyScalar(-sa).addScaledVector(E2, ca), v3); // the rim there: the bar the hand closes on
      turned(v4.copy(E1).multiplyScalar(-ca).addScaledVector(E2, -sa), v4); // the palm faces the hub
      you.hold(i ? "R" : "L", mine(v1.x, v1.y, v1.z, v2), v3, { palm: v4, dir: OVER_RIM, k: 0.92, bar: 1.9 });
    }
  }
  /** The pad at `pedal`, and your right foot on it — or above it: 0 lifted (the sole a hand's breadth off the pad),
   *  0.05 it touches, 1 floored. */
  function posePedal(pedal) {
    const travel = clamp01((pedal - 0.05) / 0.95);
    const lift = clamp01((0.05 - pedal) / 0.05);
    const th = PAD0 - PAD_TRAVEL * travel;
    pad.rotation.x = th;
    // the ball of the foot on the pad's upper half (the pad's own frame), then in the truck's frame
    const ly = 3.3 + 7 * lift;
    const lz = -14 - 2 * lift;
    v1.set(hinge.x, hinge.y + ly * Math.cos(th) - lz * Math.sin(th), hinge.z + ly * Math.sin(th) + lz * Math.cos(th));
    const tf = th + 8 * DEG * lift; // lifted, the toe comes up a little more
    toe.set(0, Math.sin(tf), Math.cos(tf)); // in your frame: along the pad, toward its top
    quat.setFromUnitVectors(FRONT, toe);
    sole.copy(SOLE).applyQuaternion(quat);
    mine(v1.x, v1.y, v1.z, v2).sub(sole);
    you.leg("R", v2, KNEE_R, toe);
  }
  you.leg("L", mine(SEAT.x - 24, CAB.floor + 8, -96, v1), KNEE_L, TOE_L); // the left foot flat on the floor, by the door
  you.lean(4, 0, 0);
  poseHands(0);
  posePedal(0.6);
  A.seat = anchor(body, SEAT.x, SEAT.y, SEAT.z);
  A.cab = anchor(body, 0, (CAB.roof + CAB.floor) / 2, (CAB.back + FACE) / 2);
  A.lamps = anchor(body, 0, 80, TRUCK.nose - 2); // the headlamps' midpoint: they look along −z
  A.kingpin = anchor(body, 0, KP_Y, KP);

  /* ═════════════ 4 · THE SEMI-TRAILER: it turns on the kingpin ═════════════ */

  const hitch = new THREE.Group(); // at the kingpin, on the ground: turns alone
  hitch.position.set(0, 0, KP);
  group.add(hitch);
  const trailerAxles = TR.axles.map((z, i) => {
    const node = new THREE.Group();
    node.position.set(0, R, z - KP);
    for (const out of [-1, 1]) {
      const w = makeWheel("wide", out, 1.3 + 2.4 * i + (out > 0 ? 1.9 : 0));
      w.position.x = out * HALF;
      node.add(w);
    }
    const tube = new THREE.Mesh(axleTube(7, 2 * DRUM_X - 24), trim);
    node.add(tube);
    asShell(tube, 18);
    hitch.add(node);
    return node;
  });
  const trailerBody = new THREE.Group(); // goes down and pitches about the kingpin
  trailerBody.position.y = KP_Y;
  hitch.add(trailerBody);
  const tb = new THREE.Group(); // inside it: true heights, and z from the kingpin
  tb.position.y = -KP_Y;
  trailerBody.add(tb);
  const ZF = TR.front - KP; // -160
  const ZB = TR.back - KP; //  1200
  const X = TR.w / 2;
  const boxMesh = new THREE.Mesh(hull(rounded(-X, X, ZF, ZB, 8), TR.floor, TR.roof, 6), boxGlass);
  tb.add(boxMesh);
  asShell(boxMesh, 20);
  const T2 = { strong: [], rear: [], fine: [], lamp: [] };
  {
    const c = 6 * (1 - Math.SQRT1_2); // the crest of the top and bottom rounds (6 cm), in from their two faces
    const cv = 8 * (1 - Math.SQRT1_2); // …and of the four upright corners (8 cm)
    for (const s of [-1, 1]) {
      run(T2.strong, [[s * (X - c), TR.roof - c, ZF + 8], [s * (X - c), TR.roof - c, ZB - 8]]); // the long edges
      run(T2.strong, [[s * (X - c), TR.floor + c, ZF + 8], [s * (X - c), TR.floor + c, ZB - 8]]);
      for (const z of [ZF + cv, ZB - cv]) run(T2.strong, [[s * (X - cv), TR.floor + 6, z], [s * (X - cv), TR.roof - 6, z]]); // the corners
    }
    for (const z of [ZF + c, ZB - c]) {
      run(T2.strong, [[-X + 8, TR.roof - c, z], [X - 8, TR.roof - c, z]]);
      run(T2.strong, [[-X + 8, TR.floor + c, z], [X - 8, TR.floor + c, z]]);
    }
    // the rear: the doors' frame, the split between them, four lock rods and their handles, the hinges
    loop(T2.rear, rounded(-X + 9, X - 9, TR.floor + 6, TR.roof - 8, 3).map(([x, y]) => [x, y, ZB + 0.5]));
    run(T2.rear, [[0, TR.floor + 7, ZB + 0.8], [0, TR.roof - 9, ZB + 0.8]]);
    for (const x of [-86, -30, 30, 86]) {
      run(T2.rear, [[x, TR.floor + 12, ZB + 1.4], [x, TR.roof - 14, ZB + 1.4]]);
      const toward = Math.abs(x) < 58 ? 1 : -1;
      run(T2.rear, [[x, 206, ZB + 1.8], [x + Math.sign(x) * toward * 17, 204, ZB + 2.2]]);
    }
    for (const s of [-1, 1]) for (const y of [165, 235, 305, 370]) run(T2.fine, [[s * (X - 1), y, ZB - 5], [s * (X - 1), y, ZB + 1.5], [s * (X - 13), y, ZB + 1.5]]);
  }
  // what hangs under it: the under-run bar and its stays, the mud flaps, the side guards, the landing legs
  const tPieces = [];
  const tPiece = (geometry, o) => {
    const g = placed(geometry, o);
    edgesInto(T2.fine, g);
    tPieces.push(bare(g));
  };
  tPiece(box(236, 12, 10, 2), { pos: [0, 52, ZB - 6] });
  for (const s of [-1, 1]) {
    tPiece(box(8, 66, 8, 1), { pos: [s * 70, 91, ZB - 10] });
    tPiece(box(38, 66, 1.4, 0.5), { pos: [s * 104, 54, TR.axles[2] - KP + 66] });
    for (const y of [64, 96]) tPiece(box(3, 6, 300, 1), { pos: [s * (X - 2), y, 450] });
    for (const z of [310, 450, 590]) tPiece(box(3, 42, 4, 0.8), { pos: [s * (X - 2), 92, z] });
    tPiece(box(9, 90, 9, 1), { pos: [s * 62, 80, 240] });
    tPiece(box(22, 3, 22, 0.8), { pos: [s * 62, 34, 240] });
  }
  const underMesh = new THREE.Mesh(mergeBare(tPieces), trim);
  tb.add(underMesh);
  asShell(underMesh, 18);
  // its lamps: at the back, a brake light and a tail light each side (signal), the top corners (signal, dim); at the
  // front top corners (ink); four markers along each flank (ink) — the outline a lorry draws at night
  const stop = glow(BRAND.signal, 0.25);
  const tail = glow(BRAND.signal, 0.7);
  const markerSig = glow(BRAND.signal, 1.0);
  lit.push([tail, 0.7], [markerSig, 1.0]);
  for (const s of [-1, 1]) {
    const add = (geo, mat, pos) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(...pos);
      tb.add(m);
    };
    add(new THREE.PlaneGeometry(22, 12), stop, [s * 106, 93, ZB + 1.6]); // they look backward (+z)
    add(new THREE.PlaneGeometry(14, 12), tail, [s * 84, 93, ZB + 1.6]);
    loop(T2.fine, rounded(s < 0 ? -119 : 74, s < 0 ? -74 : 119, 85, 101, 2).map(([x, y]) => [x, y, ZB + 1]));
    add(box(10, 5, 2.4, 0.6), markerSig, [s * 117, TR.roof - 7, ZB + 1.6]);
    add(box(10, 5, 2.4, 0.6), markerInk, [s * 117, TR.roof - 7, ZF - 1.6]);
    for (const z of [80, 380, 680, 980]) add(box(2.4, 4, 7, 0.6), markerInk, [s * (X + 1), TR.floor + 6, z]);
  }
  const stops = makeSprites(2, { core: 0.78 });
  tb.add(stops.points);
  lines(tb, T2.strong, { ...STRONG, centre: [0, 260, 520], reach: 340, far: 0.24 });
  lines(tb, T2.rear, { width: 2, far: 0.3, opacity: 0.6, lod: [0.1, 0.24], centre: [0, 260, ZB], reach: 300 });
  lines(tb, T2.fine, { ...FINE, centre: [0, 200, 900], reach: 300 });
  A.tail = anchor(tb, 0, 200, ZB);
  A.rearDrum = anchor(trailerAxles[2], -DRUM_X, 0, 0);
  A.driveDrum = anchor(driveAxle, -DRUM2_X, 0, 0);

  asShell(tyres, 16);

  /* ═════════════ 5 · THE HEAT: halos under the drums, embers ═════════════ */

  const DRUMS_T = [[-DRUM_X, R, 0], [DRUM_X, R, 0], [-DRUM2_X, R, TRUCK.drive], [DRUM2_X, R, TRUCK.drive]]; // in `group`: FL (model.js's wheel), FR, the drive axle's
  const AXLE_T = [0, 0, 1, 1]; // which axle (AXLES) each one is on
  const DRUMS_R = [];
  const AXLE_R = [];
  TR.axles.forEach((z, i) => {
    for (const s of [-1, 1]) {
      DRUMS_R.push([s * DRUM_X, R, z - KP]);
      AXLE_R.push(2 + i);
    }
  });
  const halosT = makeSprites(4, { core: 0.22 });
  const halosR = makeSprites(6, { core: 0.22 });
  group.add(halosT.points);
  hitch.add(halosR.points);
  const embersT = makeEmbers(DRUMS_T, { per: 18, seed: 27 });
  const embersR = makeEmbers(DRUMS_R, { per: 16, seed: 41 });
  const EMBERS = [embersT, embersR];
  group.add(embersT.points);
  hitch.add(embersR.points);

  /* ═════════════ the trailer's articulation: its middle axle stays on the path ═════════════ */
  const F = { x: 0, y: 0, z: 0, yaw: 0 };
  const Q = { x: 0, y: 0, z: 0, yaw: 0 };
  /** How far the trailer has turned on its kingpin (radians, + toward +x) when the front axle is at `s`. */
  function articulation(s) {
    truckAt(s, F);
    const kx = F.x - KP * Math.sin(F.yaw); // the kingpin: KP behind the front axle, along the tractor
    const kz = F.z + KP * Math.cos(F.yaw);
    let u = s - (KP + BOGIE) / 100; // the point of the path BOGIE behind it (metres of s): Newton from the straight answer
    for (let i = 0; i < 5; i++) {
      truckAt(u, Q);
      const dx = Q.x - kx;
      const dz = Q.z - kz;
      const dist = Math.max(1, Math.hypot(dx, dz));
      const slope = (100 * dx * Math.tan(Q.yaw) - 100 * dz) / dist;
      if (Math.abs(slope) < 1e-6) break;
      u -= (dist - BOGIE) / slope;
    }
    truckAt(u, Q);
    return Math.atan2(kx - Q.x, Q.z - kz) - F.yaw;
  }

  const drop = [0, 0, 0, 0, 0];
  const last = { steer: NaN, pedal: NaN };
  const SIG2 = SIGNAL.clone().multiplyScalar(2.0);
  const HEAD = INK.clone().multiplyScalar(1.6);
  const HEATC = SIGNAL.clone();

  return {
    group, A,
    /**
     * s       metres run: the wheels turn (100·s / 53 rad), the trailer follows the path, the axles in the gravel sink,
     *         the embers live and die (they hang in the air when `s` is held)
     * kmh     how far the marks and the embers are spread
     * pedal   the pad and your foot (0 lifted above it · 0.05 touching · 1 floored); the brake lights (> 0.08)
     * steer   the steering wheel (100°) and the front wheels (30°), + to the right
     * heat    the drums' skin and the halos under them (signal), how many embers (none below 0.3)
     * sink    how deep the axles in the gravel go (each one once it is in: plan.js inBed), the body with them
     * you     0 nobody · 1 you
     * shell   the glass, its lines and its lamps (0–1)
     */
    update(P, time, px) {
      void time;
      const sh = clamp01(P.shell ?? 1);
      const s = P.s ?? 0;
      const kmh = Math.max(0, P.kmh ?? 0);
      const hot = clamp01(P.heat ?? 0);
      const sink = clamp01(P.sink ?? 0);
      const steer = P.steer ?? 0;
      const pedal = clamp01(P.pedal ?? 0);
      const rate = kmh / 3.6 / SLOWMO; // metres of `s` a second of film

      // the glass, its lines, its lamps
      for (let i = 0; i < glassMats.length; i++) glassMats[i].uniforms.uAmount.value = sh;
      for (let i = 0; i < lineMats.length; i++) {
        const u = lineMats[i].uniforms;
        u.uAmount.value = lineMats[i].userData.k * sh;
        u.uPx.value = px;
      }
      for (let i = 0; i < lit.length; i++) setGlow(lit[i][0], lit[i][1] * sh);
      you.body.uniforms.uAmount.value = sh;
      setPartOpacity(flesh, sh);
      you.group.visible = (P.you ?? 1) > 0.5;

      // each axle sinks once it is in the gravel; the bodies follow
      for (let i = 0; i < 5; i++) drop[i] = SINK * sink * inBed(s - AXLES[i]);
      frontAxle.position.y = R - drop[0];
      driveAxle.position.y = R - drop[1];
      body.position.y = -drop[0];
      body.rotation.x = Math.asin((drop[1] - drop[0]) / TRUCK.drive);
      const dk = drop[0] + ((drop[1] - drop[0]) * KP) / TRUCK.drive; // the kingpin goes down with the tractor
      const dr = (drop[2] + drop[3] + drop[4]) / 3; // …the trailer's bogie with its three axles
      trailerBody.position.y = KP_Y - dk;
      trailerBody.rotation.x = Math.asin((dr - dk) / BOGIE);
      for (let i = 0; i < 3; i++) trailerAxles[i].position.y = R - drop[2 + i];
      // the trailer turns on its kingpin
      hitch.rotation.y = -articulation(s);

      // the front wheels and the steering wheel
      steerFR.rotation.y = -LOCK * steer;
      A.hubFL.rotation.y = -LOCK * steer;
      steering.rotation.z = -SPIN * steer;
      if (steer !== last.steer) {
        poseHands(-SPIN * steer);
        last.steer = steer;
      }
      if (pedal !== last.pedal) {
        posePedal(pedal);
        last.pedal = pedal;
      }

      // the wheels turn: their marks, spread by the speed
      mark.uniforms.uAngle.value = ((100 * s) / R) % TAU;
      mark.uniforms.uSmear.value = ((rate * 100) / R) * SHUTTER;

      // the heat
      const k = hot * hot;
      HEATC.copy(SIGNAL).multiplyScalar(2.3 * k);
      heat.uniforms.uColor.value.copy(HEATC);
      const halo = 0.55 * k;
      const across = 70 + 50 * hot;
      for (let i = 0; i < 4; i++) {
        const d = DRUMS_T[i];
        halosT.put(i, d[0], d[1] - drop[AXLE_T[i]] - 6, d[2], SIGNAL, halo, across);
        embersT.origins[i].set(d[0], d[1] - drop[AXLE_T[i]], d[2]);
      }
      for (let i = 0; i < 6; i++) {
        const d = DRUMS_R[i];
        halosR.put(i, d[0], d[1] - drop[AXLE_R[i]] - 6, d[2], SIGNAL, halo, across);
        embersR.origins[i].set(d[0], d[1] - drop[AXLE_R[i]], d[2]);
      }
      halosT.uniforms.uScale.value = px;
      halosR.uniforms.uScale.value = px;
      halosT.flush();
      halosR.flush();
      const alive = smooth(0.3, 1, hot);
      const flung = smooth(4, 24, kmh);
      for (let i = 0; i < 2; i++) {
        const u = EMBERS[i].uniforms;
        u.uS.value = s;
        u.uRate.value = rate;
        u.uHeat.value = alive;
        u.uAmount.value = flung;
        u.uScale.value = px;
      }

      // the lamps: the headlamps; the brake lights burn as soon as the pedal is down
      const braking = pedal > 0.08 ? 1 : 0;
      setGlow(stop, (0.25 + 2.35 * braking) * sh);
      heads.uniforms.uScale.value = px;
      for (let i = 0; i < 2; i++) heads.put(i, (i ? 1 : -1) * 100, 80.5, TRUCK.nose - 4, HEAD, 0.75 * sh, 90);
      heads.flush();
      stops.uniforms.uScale.value = px;
      for (let i = 0; i < 2; i++) stops.put(i, (i ? 1 : -1) * 106, 93, ZB + 5, SIG2, 0.9 * braking * sh, 150);
      stops.flush();
    },
  };
}
