// DOSSIER L02 — Poste haute tension : THE POSTE, a 400 kV substation at night, seen like an X-ray: lattice gantries,
// double strings of glass discs, the apparatus of the other bays in glass, the busbars, the fence — and what burns:
// the conductors under tension, tubes of light (a core, a tight halo) that light the gravel under them. Under your bay
// the ground can be cut open (gravel, soil, the copper mesh); the air can give way (an arc that has a place); you are
// a figure of glass with a solid helmet, who walks, climbs the gantry leg and kneels on the beam.
//
//   buildPoste() → {
//     group,                    the POSTE place (world.js adds it; the solid apparatus of YOUR bay is model.js's, mounted
//                               by world.js at z = BAY.mine — this file draws everything else, the other bays' apparatus
//                               included, in glass)
//     you: { group, A: { hands, head, feet } },   you, a figure of glass (kit/lib/figure.js) — `hands`: an Object3D
//                               between your two hands (world.js hangs the pole there), world positions
//     A: { strings, beam, legTop, fault, … }      anchors other files may need (Object3D, world positions)
//     set(p, time, px)          every frame, several times per frame: depends on `p` and `time` only
//   }
//
// What `set` accepts (world.js · apply passes them all, every frame — the meaning of each is in world.js · FIRST):
//   amount   the X-ray of the poste (0–1)
//   live, voisine, earthed, couple, induced, current     the lines: YOUR circuit (bay z = BAY.mine) and THE NEIGHBOUR's
//            (z = BAY.voisine), from the gantry's strings down their droppers and along their bays to the busbars.
//            Yours: signal × live, dark ink at 0, veille × earthed. The neighbour: signal × voisine. `couple`: field
//            lines from the neighbour's conductors to yours. `induced` 0 → 1 → 2 on yours. `current`: the mesh lights
//            under the earthing sets (their cables are model.js's)
//   bays, mark          the other bays (0–1); YOUR bay's gantry lit veille and a marker on it (0–1)
//   efield              field lines rising from the ground to the conductors (0–1)
//   airArc              0 → 0.5 the air tenses between a conductor and your hand → 1 the arc (your hand: climb 1, arms 2)
//   envelope            the forbidden distance: a glass envelope around the conductors near the gantry (0–1)
//   cutaway, mesh, fault, bond, gravel   the ground in section under your bay (plan.js · GROUND), the mesh lit, the
//            rings of potential from a fault, everything rising together, the gravel's resistance
//   explode, named      "on l'ouvre": the gantry rises, the strings and insulators come apart, the mesh comes down out
//            of the ground (model.js separates the apparatus with the same number); `named` lights one part (1 gantry ·
//            2 insulators · 5 mesh — 3 and 4 are model.js's)
//   zone                the equipotential zone between the two earthing sets (EARTH.a / EARTH.b), you inside (veille glass)
//   you, walk, climb, arms   you: shown (0–1), along your path (0 gate → 0.8 WORK.stand → 1 the leg's foot), up the
//            leg (0 → 1 WORK.climb.top), your arms (0 down · 1 on the pole · 2 one hand forward)
//   chief, paper        the chargé de consignation (a second figure of glass) and the paper going from him to you
//   OPTIONAL (world.js may pass them; defaults keep the behaviour): `probe` (0–2) and `perche` (0–1), the same numbers
//            world.js aims the pole with — your upper hand then lies exactly on the pole; `path` (0–1) forces the
//            signal line from your hand to your feet (by default it follows `fault`, `bond` and your hand on the leg)
//
// Where things are, beyond plan.js (this file's own choices):
//   · the gantry legs are lattice columns 1.6 m wide at the foot; the ladder is on the +z face of YOUR bay's +z leg
//     (z = 1 200), you climb it facing −z, step onto the beam and walk to z ≈ 760, above phase 1's string
//   · the strings are double chains of 13 glass discs hanging from the beam's underside to GANTRY.attach
//   · the fault of the ground scenes comes into the earth at the foot of that leg ([0, 0, 1 200]: `A.fault`)
//   · the cut: a trench in front of z = GROUND.cut.z (its face shows the gravel, the soil, the mesh); the mesh runs under
//     the whole poste at 80 cm, 6 m cells, with risers to the legs and to the two earth terminals
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, edgesOf, lineMat, solid, box, mergeGeometries } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { rng } from "@kit/rng.js";
import { BAY, PH, FENCE, GANTRY, LSECT, BREAKER, BSECT, BUS, WORK, EARTH, GROUND, PYLON } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.86, 0.68);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const mix3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

/* ─────────────────────────────────────────────────────────── the poste's own numbers */

const ZLO = Math.min(...BAY.z) - BAY.w / 2; // −8 400: the row of bays, end to end
const ZHI = Math.max(...BAY.z) + BAY.w / 2; //  6 000
const BEAM = { y0: GANTRY.beam - GANTRY.depth / 2, y1: GANTRY.beam + GANTRY.depth / 2, hx: GANTRY.depth / 2 }; // 1 720 … 1 880
const LEG = { base: 80, top: 52, panel: 157 }; // half-widths of a gantry leg, foot and head; its panels
const STRING = { n: 13, pitch: 15.6, gap: 15 }; // a double chain of 13 discs, the two chains 30 cm apart (x)
const PORTAL = BAY.w / 2 - 70; //                       each bay has its own portal: its legs at its centre ± PORTAL (identical portals in a row)
const MYLEG = BAY.mine + PORTAL; //                     z of the leg you touch and climb (your bay's +z leg)
const LADDER = MYLEG + LEG.base + 8; //                  its rungs, on the leg's +z face
const RUNG = 35;
const FOOT = [GANTRY.x, 0, LADDER + 44]; //             where you stand at its foot (walk = 1), facing −z
const ONBEAM = [GANTRY.x - 12, BEAM.y1, BAY.mine + PH[0] + 160]; // where you work on the beam (climb = 1), facing −x
const SRC = [GANTRY.x, 0, MYLEG]; //                    the fault comes into the ground here (the leg's foot)
const STAND = WORK.stand;
const PATH = [[FENCE.gate[0], FENCE.gate[2]], [STAND[0] + 600, STAND[2] + 200], [STAND[0], STAND[2]], [FOOT[0], FOOT[2]]];

/** Where a conductor ends on the gantry, on the line side, on the disconnectors, on the busbar (a bay's own frame: z absolute). */
const STRING_END = (z) => [GANTRY.x, GANTRY.attach, z];
const LINE_AT = (z) => [WORK.lineX, GANTRY.attach + 180, z];
const LS_NEAR = (z) => [LSECT.x - LSECT.gap / 2, LSECT.top, z];
const LS_FAR = (z) => [LSECT.x + LSECT.gap / 2, LSECT.top, z];
const BRK_TOP = (z) => [BREAKER.x, BREAKER.top, z];
const BS_NEAR = (z) => [BSECT.x - BSECT.gap / 2, BSECT.top, z];
const BS_FAR = (z) => [BSECT.x + BSECT.gap / 2, BSECT.top, z];
/** The chain end under a pylon arm (plan.js · PYLON: 2.5 m under each arm). Phase i (0 nearest the camera) on arm 2 − i. */
const chainEnd = (i, side) => {
  const k = 2 - i;
  return [PYLON.at[0], PYLON.arms[k] - 250, PYLON.at[2] + side * PYLON.reach[k]];
};

/* ─────────────────────────────────────────────────────────── GLSL */

const BARS = /* glsl */ `
  float bars(float x, float duty) {
    float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
    float q = fract(x);
    float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
    return mix(b, duty, smoothstep(0.12, 0.4, w));
  }`;
// cells of gravel: (distance to the nearest stone's centre, distance to its border, which stone)
const GRAINS = /* glsl */ `
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }
  vec3 grains(vec2 x) {
    vec2 n = floor(x); vec2 f = fract(x);
    float f1 = 8.0; float f2 = 8.0; float h = 0.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = 0.15 + 0.7 * hash2(n + g);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < f1) { f2 = f1; f1 = d; h = hash2(n + g + 17.0).x; } else if (d < f2) { f2 = d; }
    }
    float a = sqrt(f1); float b = sqrt(f2);
    return vec3(a, b - a, h);
  }
  // a gravel surface: lit stones, dark gaps; it melts away (to nothing, or to its mean) once a stone is under 3 px
  float gravelAt(vec2 x, float toMean) {
    vec3 g = grains(x);
    float w = fwidth(x.x) + fwidth(x.y);
    float stone = smoothstep(0.03, 0.16, g.y) * (0.45 + 0.55 * g.z) * (1.0 - 0.5 * smoothstep(0.1, 0.6, g.x));
    float far = smoothstep(0.18, 0.45, w);
    return mix(stone, 0.42 * toMean, far);
  }`;
// the rings of potential round the fault's foot: equal steps of potential (dense near it), drifting outward
const RINGS = /* glsl */ `
  uniform vec3 uSrc; uniform float uFault, uBond, uRingT;
  vec3 ringsAt(vec3 p, vec3 sig, vec3 veil, float meshMask) {
    if (uFault < 0.003) return vec3(0.0);
    float r = max(length(p - uSrc), 20.0);
    float V = clamp(80.0 / r, 0.0, 1.0);
    float q = V * 22.0 + uRingT;
    float w = fwidth(q);
    float d = abs(fract(q) - 0.5);
    float line = 1.0 - smoothstep(0.07, 0.07 + max(1.3 * w, 0.02), d);
    line = mix(line, 0.12, smoothstep(0.1, 0.3, w));
    float front = 150.0 + uFault * 2700.0;
    float reach = 1.0 - smoothstep(front - 450.0, front, r);
    vec3 col = sig * (uFault * (1.0 - uBond) * reach) * (line * (0.35 + 0.65 * sqrt(V)) * 0.62 + 0.45 * V);
    col += veil * (uFault * uBond * 0.13 * meshMask);
    return col;
  }`;

/** A tube of light round a conductor (never thinner than `minPx`): the core (`halo` false) or its tight halo. */
function wireMaterial({ R, minPx, halo = false, fade = 0 }, H2) {
  const uniforms = {
    uHue: { value: SIGNAL.clone() }, uLevel: { value: 0 }, uDead: { value: 1 }, uInd: { value: 0 }, uSurge: { value: 0 },
    uTime: { value: 0 }, uAmount: { value: 1 }, uR: { value: R }, uMinPx: { value: minPx }, uFade: { value: fade },
    uInk: { value: INK.clone() }, uSig: { value: SIGNAL.clone() }, uHot: { value: HOT.clone() },
  };
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */ `
      attribute float aS;
      uniform float uR, uMinPx;
      varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 c = modelViewMatrix * vec4(position, 1.0);
        float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
        vec4 mv = modelViewMatrix * vec4(position + normal * (max(uR, uMinPx * cmPerPx) - uR), 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vS = aS;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue, uInk, uSig, uHot; uniform float uLevel, uDead, uInd, uSurge, uTime, uAmount, uFade;
      varying float vS; varying vec3 vN; varying vec3 vV;
      ${BARS}
      void main() {
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float slow = 0.55 + 0.45 * sin(vS / 380.0 - uTime * 0.8);
        float pulse = bars((vS - uTime * 520.0) / 900.0, 0.3);
        float fade = uFade > 0.0 ? 1.0 - smoothstep(uFade * 0.45, uFade, vS) : 1.0;
        vec3 col;
        ${halo
          ? `float a = pow(f, 2.4);
             col = (uInk * (max(uDead - 1.0, 0.0) * 0.05) + uHue * (uLevel * 0.17) + uSig * (uInd * 0.07 * slow + uSurge * (0.35 + 0.3 * pulse))) * a;`
          : `float body = 0.4 + 0.6 * f;
             col = uInk * uDead * (0.16 + 0.3 * pow(1.0 - f, 1.4) + 0.08 * smoothstep(0.9, 1.0, f));
             col += uSig * body * (uInd * 0.42 * slow + uSurge * (1.0 + 1.2 * pulse));
             col += uHue * (uLevel * body) + uHot * ((uLevel * 0.5 + uSurge * 0.35) * smoothstep(0.82, 1.0, f));`}
        gl_FragColor = vec4(col * (uAmount * fade), 1.0);
      }`,
  });
}

/** Thin lines of a field, as tubes of light whose dashes run along them (`uDir` +1 from the start, −1 toward it). */
function flowMaterial(H2) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uHue: { value: SIGNAL.clone() }, uLevel: { value: 0 }, uTime: { value: 0 }, uDir: { value: 1 }, uR: { value: 1.2 }, uMinPx: { value: 1.9 }, uSpeed: { value: 40 }, uPeriod: { value: 180 } },
    vertexShader: /* glsl */ `
      attribute float aS; attribute float aT;
      uniform float uR, uMinPx;
      varying float vS; varying float vT; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 c = modelViewMatrix * vec4(position, 1.0);
        float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
        vec4 mv = modelViewMatrix * vec4(position + normal * (max(uR, uMinPx * cmPerPx) - uR), 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vS = aS; vT = aT;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHue; uniform float uLevel, uTime, uDir, uSpeed, uPeriod;
      varying float vS; varying float vT; varying vec3 vN; varying vec3 vV;
      ${BARS}
      void main() {
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float w = 0.5 + 0.5 * sin(6.2831853 * (vS - uDir * uTime * uSpeed) / uPeriod);
        float dash = w * w;
        float ends = smoothstep(0.0, 0.12, vT) * (1.0 - smoothstep(0.88, 1.0, vT));
        gl_FragColor = vec4(uHue * (uLevel * (0.3 + 0.7 * dash) * ends * (0.5 + 0.5 * f)), 1.0);
      }`,
  });
}

/** The arc: core, sheath, halo — one material each; `uReveal` grows it from the conductor (aT 0) toward the hand (aT 1). */
function arcMaterial(kind, H2) {
  const R = { core: 1.6, sheath: 6, halo: 34 }[kind];
  const minPx = { core: 2.4, sheath: 6, halo: 16 }[kind];
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uLevel: { value: 0 }, uReveal: { value: 0 }, uM: { value: 0 }, uR: { value: R }, uMinPx: { value: minPx }, uSig: { value: SIGNAL.clone() }, uHot: { value: HOT.clone() } },
    vertexShader: /* glsl */ `
      attribute float aT; attribute vec3 aPos1;
      uniform float uR, uMinPx, uM;
      varying float vT; varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 p = mix(position, aPos1, uM);
        vec4 c = modelViewMatrix * vec4(p, 1.0);
        float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
        vec4 mv = modelViewMatrix * vec4(p + normal * (max(uR, uMinPx * cmPerPx) - uR), 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vT = aT;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSig, uHot; uniform float uLevel, uReveal;
      varying float vT; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float head = 1.0 - smoothstep(uReveal - 0.04, uReveal + 0.01, vT);
        vec3 col;
        ${{
          core: `col = mix(uSig * 1.6, uHot * 2.4, smoothstep(0.35, 0.95, f));`,
          sheath: `col = uSig * (1.1 * pow(f, 1.4));`,
          halo: `col = uSig * (0.22 * pow(f, 2.6));`,
        }[kind]}
        gl_FragColor = vec4(col * (uLevel * head), 1.0);
      }`,
  });
}

/** A light seen from anywhere, facing the camera: a bright core and a long tail (never a disc). `uSize` in cm across. */
function ballMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uSize: { value: 40 } },
    vertexShader: /* glsl */ `
      uniform float uSize; varying vec2 vQ;
      void main() {
        vQ = position.xy * 2.0;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying vec2 vQ;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        float a = (0.85 * exp(-r2 * 60.0) + 0.3 * exp(-sqrt(r2) * 5.2)) * (1.0 - r2);
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
  });
}
const BALL = new THREE.PlaneGeometry(1, 1);
function makeBall() {
  const m = new THREE.Mesh(BALL, ballMaterial());
  m.frustumCulled = false;
  m.renderOrder = 6;
  return m;
}

/* ─────────────────────────────────────────────────────────── geometry helpers (build time) */

/** Fine lines from pairs of points [[a, b], …] (one draw). */
function segLines(pairs, { color = BRAND.ink, width = 1.8, opacity = 0.4, additive = false } = {}) {
  const flat = [];
  for (const [a, b] of pairs) flat.push(...a, ...b);
  const g = new LineSegmentsGeometry();
  g.setPositions(flat);
  const o = new LineSegments2(g, lineMat(color, width, { opacity, additive }));
  o.renderOrder = 2;
  return o;
}
const UPV = new THREE.Vector3(0, 1, 0);
/** A round strut from a to b (radius r): a member of a lattice in glass. */
function strut(a, b, r, radial = 6) {
  const A = V3(...a);
  const B = V3(...b);
  const g = new THREE.CylinderGeometry(r, r, A.distanceTo(B), radial, 1, true);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UPV, B.clone().sub(A).normalize()));
  g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
  g.deleteAttribute("uv");
  return g;
}
/** A tube along points (centripetal Catmull-Rom), its arc length in `aS` (and `aT` 0–1). */
function tubeOf(pts, r, { radial = 8, step = 50, minSeg = 2, segs = 0 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => V3(...p)), false, "centripetal");
  const L = curve.getLength();
  const g = new THREE.TubeGeometry(curve, segs || Math.max(minSeg, Math.ceil(L / step)), r, radial, false);
  const uv = g.attributes.uv;
  const s = new Float32Array(uv.count);
  const t = new Float32Array(uv.count);
  for (let i = 0; i < uv.count; i++) {
    t[i] = uv.getX(i);
    s[i] = t[i] * L;
  }
  g.setAttribute("aS", new THREE.BufferAttribute(s, 1));
  g.setAttribute("aT", new THREE.BufferAttribute(t, 1));
  g.deleteAttribute("uv");
  return g;
}
const merged = (geos) => (geos.length ? mergeGeometries(geos) : new THREE.BufferGeometry());
/** A mesh of light (no frustum culling: its vertex shader swells it). */
function lightMesh(geometry, material, order = 4) {
  const m = new THREE.Mesh(geometry, material);
  m.frustumCulled = false;
  m.renderOrder = order;
  return m;
}

/** A lattice column, laced on its four faces, from y0 to y1 round (cx, cz), half-width hw0 at the foot → hw1 at the head. */
function latticeColumn(out, cx, cz, y0, y1, hw0, hw1, panel) {
  const n = Math.max(1, Math.round((y1 - y0) / panel));
  const C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const at = (k, [sx, sz]) => {
    const hw = lerp(hw0, hw1, k / n);
    return [cx + sx * hw, lerp(y0, y1, k / n), cz + sz * hw];
  };
  for (const c of C) out.chords.push([at(0, c), at(n, c)]);
  for (let k = 0; k <= n; k += 2) for (let f = 0; f < 4; f++) out.lace.push([at(k, C[f]), at(k, C[(f + 1) % 4])]);
  for (let k = 0; k < n; k++)
    for (let f = 0; f < 4; f++) {
      const a = C[f];
      const b = C[(f + 1) % 4];
      out.lace.push((k + f) % 2 ? [at(k, a), at(k + 1, b)] : [at(k, b), at(k + 1, a)]);
    }
}
/** A box girder along z from z0 to z1 (chords at ±hx in x, y0 / y1), laced on its four faces. */
function girder(out, cx, y0, y1, hx, z0, z1, panel) {
  const n = Math.max(1, Math.round((z1 - z0) / panel));
  const C = [[-1, 0], [1, 0], [1, 1], [-1, 1]]; // (x side, top?)
  const at = (k, [sx, top]) => [cx + sx * hx, top ? y1 : y0, lerp(z0, z1, k / n)];
  for (const c of C) out.chords.push([at(0, c), at(n, c)]);
  for (let k = 0; k <= n; k++) for (let f = 0; f < 4; f++) out.lace.push([at(k, C[f]), at(k, C[(f + 1) % 4])]);
  for (let k = 0; k < n; k++)
    for (let f = 0; f < 4; f++) {
      const a = C[f];
      const b = C[(f + 1) % 4];
      out.lace.push((k + f) % 2 ? [at(k, a), at(k + 1, b)] : [at(k, b), at(k + 1, a)]);
    }
}

/** A cap-and-pin glass disc (radius 12.5 cm), its pin up, centred on y = 0. */
const DISC = (() => {
  const prof = [[0, 5.5], [2.6, 5.5], [3.6, 4.2], [5.5, 2.8], [9.5, 1.4], [12.5, 0.2], [12.6, -0.4], [11.2, -0.8], [9.6, -1.9], [8.4, -1.0], [6.6, -2.4], [5.2, -1.2], [3.2, -3.4], [0, -3.4]];
  return new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 22);
})();
/** An insulator column of height h from y = 0 (sheds every `pitch`, `amp` deep), or smooth (`amp` 0). */
function columnGeo(r, h, pitch, amp, segs = 14) {
  const pts = [[0, 0], [r + 3, 0], [r + 3, 6]];
  if (amp > 0) for (let y = 10; y < h - 12; y += pitch) pts.push([r, y], [r + amp, y + pitch * 0.32], [r + amp * 0.85, y + pitch * 0.42], [r, y + pitch * 0.7]);
  else pts.push([r + 1, 10], [r + 1, h - 12]);
  pts.push([r + 3, h - 6], [r + 3, h], [0, h]);
  return new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), segs);
}
const clean = (g) => {
  g.deleteAttribute("uv");
  return g;
};

/* ─────────────────────────────────────────────────────────── the set */

export function buildPoste() {
  const H2 = (BRAND.H / 2).toFixed(1); // read here: the long's 16:9 frame is set before this runs
  const group = new THREE.Group();
  const R = rng(4021);

  /* where the camera is (for the level of detail): caught by the ground, the one thing always drawn */
  let CAM = null;
  const camPos = new THREE.Vector3(1500, 3000, 8000);
  let PX = 1000; // px per cm at 1 cm (stage.pixelScale)
  const sizePx = (size, x, y, z, hx = 0, hy = 0, hz = 0) => {
    // how many pixels `size` cm makes at the nearest point of a box round (x, y, z) ± (hx, hy, hz)
    const dx = Math.max(0, Math.abs(camPos.x - x) - hx);
    const dy = Math.max(0, Math.abs(camPos.y - y) - hy);
    const dz = Math.max(0, Math.abs(camPos.z - z) - hz);
    return (PX * size) / Math.max(60, Math.hypot(dx, dy, dz));
  };

  /* ═══════════════════════════ THE GROUND: a grid, gravel near the eye, the light of the lines, the rings ═══════════════════════════ */
  const segU = Array.from({ length: 12 }, () => new THREE.Vector4());
  const groundU = {
    uInk: { value: INK.clone() }, uSig: { value: SIGNAL.clone() }, uVeil: { value: VEILLE.clone() },
    uMineCol: { value: new THREE.Vector3() }, uVoisCol: { value: new THREE.Vector3() }, uBusCol: { value: new THREE.Vector3() },
    uSegs: { value: segU }, uAmount: { value: 1 }, uCut: { value: 0 }, uStep: { value: 0 },
    uFootA: { value: new THREE.Vector3() }, uFootB: { value: new THREE.Vector3() },
    uSrc: { value: V3(...SRC) }, uFault: { value: 0 }, uBond: { value: 0 }, uRingT: { value: 0 },
    uTrench: { value: new THREE.Vector4(GROUND.cut.x0, GROUND.cut.x1, GROUND.cut.z, GROUND.cut.z + 3000) },
    uFence: { value: new THREE.Vector4(FENCE.x0, FENCE.x1, FENCE.z0, FENCE.z1) },
  };
  const groundMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: groundU,
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSig, uVeil, uMineCol, uVoisCol, uBusCol; uniform vec4 uSegs[12];
      uniform float uAmount, uCut, uStep; uniform vec3 uFootA, uFootB; uniform vec4 uTrench, uFence;
      varying vec3 vW;
      ${GRAINS}
      ${RINGS}
      float lines(float x, float cell) {
        float q = x / cell;
        float fw = fwidth(q);
        float w = max(fw * 1.5, 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return (1.0 - smoothstep(w * 0.5, w, d)) * (1.0 - smoothstep(0.05, 0.16, fw));
      }
      float segD(vec2 p, vec2 a, vec2 b) {
        vec2 ab = b - a;
        float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-3), 0.0, 1.0);
        return length(p - a - ab * t);
      }
      float inRect(vec2 p, vec4 r, float soft) {
        return smoothstep(r.x - soft, r.x, p.x) * (1.0 - smoothstep(r.y, r.y + soft, p.x)) * smoothstep(r.z - soft, r.z, p.y) * (1.0 - smoothstep(r.w, r.w + soft, p.y));
      }
      void main() {
        vec2 p = vW.xz;
        float inside = inRect(p, uFence, 200.0);
        float hole = uCut * inRect(p, uTrench, 1.0);
        float dist = exp(-length(p - vec2(1500.0, -1200.0)) / 16000.0);
        float g = max(lines(p.x, 600.0), lines(p.y, 600.0)) * (0.55 + 0.45 * inside) + 0.35 * inside * max(lines(p.x, 150.0), lines(p.y, 150.0));
        float stones = inside * gravelAt(p / 3.4, 0.0);
        vec3 col = uInk * (g * 0.085 * dist + stones * 0.05);
        // the lines that burn light the gravel under them
        vec3 pool = vec3(0.0);
        for (int i = 0; i < 12; i++) {
          float d = segD(p, uSegs[i].xy, uSegs[i].zw);
          float k = exp(-d * d / (2.0 * 380.0 * 380.0));
          pool += (i < 5 ? uMineCol : i < 10 ? uVoisCol : uBusCol) * k;
        }
        col += pool * (0.015 + 0.03 * stones);
        col += ringsAt(vec3(vW.x, 0.0, vW.z), uSig, uVeil, inside);
        float st = segD(p, uFootA.xz, uFootB.xz);
        col += uSig * (uStep * 0.9 * exp(-st * st / (2.0 * 5.0 * 5.0)));
        gl_FragColor = vec4(col * uAmount * (1.0 - hole), 1.0);
      }`,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(56000, 40000).rotateX(-Math.PI / 2), groundMat);
  ground.position.set(-9000, 0.5, -1200);
  ground.renderOrder = 1;
  ground.frustumCulled = false;
  ground.onBeforeRender = (r, s, cam) => {
    CAM = cam;
  };
  group.add(ground);

  /* ═══════════════════════════ THE BAYS: gantry, strings, apparatus in glass ═══════════════════════════ */
  const bayList = [];
  const shellOf = (o) => glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.4, edge: 0.32, ...o });

  for (const zb of BAY.z) {
    const mine = zb === BAY.mine;
    const bay = { zb, mine, group: new THREE.Group() };
    bayList.push(bay);
    group.add(bay.group);

    /* the gantry: one portal per bay — its beam, its two legs, the earth-wire peaks */
    const g = { chords: [], lace: [] };
    girder(g, GANTRY.x, BEAM.y0, BEAM.y1, BEAM.hx, zb - PORTAL - LEG.top, zb + PORTAL + LEG.top, GANTRY.depth);
    const legZ = [zb - PORTAL, zb + PORTAL];
    for (const lz of legZ) {
      latticeColumn(g, GANTRY.x, lz, 0, BEAM.y0, LEG.base, LEG.top, LEG.panel);
      // the earth-wire peak over the leg
      for (const sx of [-1, 1]) g.chords.push([[GANTRY.x + sx * BEAM.hx, BEAM.y1, lz], [GANTRY.x, BEAM.y1 + 380, lz]]);
      g.lace.push([[GANTRY.x - BEAM.hx * 0.5, BEAM.y1 + 190, lz], [GANTRY.x + BEAM.hx * 0.5, BEAM.y1 + 190, lz]]);
    }
    bay.gantry = new THREE.Group();
    bay.group.add(bay.gantry);
    bay.chordMat = shellOf({ rim: 0.34, edge: 0.4 });
    bay.laceMat = shellOf({ rim: 0.26, edge: 0.3 });
    bay.chordGlass = new THREE.Mesh(merged(g.chords.map(([a, b]) => strut(a, b, 5.5))), bay.chordMat);
    bay.laceGlass = new THREE.Mesh(merged(g.lace.map(([a, b]) => strut(a, b, 3.2, 5))), bay.laceMat);
    asShell([bay.chordGlass, bay.laceGlass], 20);
    bay.chordLines = segLines(g.chords, { width: 2.2, opacity: 0.55 });
    bay.laceLines = segLines(g.lace, { width: 1.8, opacity: 0.36 });
    bay.gantry.add(bay.chordGlass, bay.laceGlass, bay.chordLines, bay.laceLines);

    /* the ladder (your leg only): two stiles, rungs every 35 cm */
    if (mine) {
      const rungs = [];
      for (const sx of [-21, 21]) rungs.push([[GANTRY.x + sx, 20, LADDER], [GANTRY.x + sx, BEAM.y1 + 40, LADDER]]);
      for (let y = 30; y < BEAM.y1; y += RUNG) rungs.push([[GANTRY.x - 21, y, LADDER], [GANTRY.x + 21, y, LADDER]]);
      bay.ladder = segLines(rungs, { width: 1.9, opacity: 0.5 });
      bay.gantry.add(bay.ladder);
    }

    /* the strings: a double chain per phase (yours: one mesh per disc, they come apart; the others: baked) */
    bay.discMat = shellOf({ rim: 0.42, edge: 0.45, spec: mine ? 0.35 : 0, through: 0.15 });
    bay.rodMat = shellOf({ rim: 0.3, edge: 0.35 });
    bay.fitLines = [];
    const discTop = BEAM.y0 - 14;
    if (mine) {
      bay.discs = [];
      for (const dz of PH)
        for (const sx of [-1, 1])
          for (let k = 0; k < STRING.n; k++) {
            const m = new THREE.Mesh(DISC, bay.discMat);
            m.position.set(GANTRY.x + sx * STRING.gap, discTop - k * STRING.pitch, zb + dz);
            m.userData.k = k;
            asShell(m, 20);
            bay.discs.push(m);
            bay.gantry.add(m); // they rise with the gantry; `set` spreads them
          }
      bay.strings = new THREE.Group();
    } else {
      const discs = [];
      const rods = [];
      for (const dz of PH)
        for (const sx of [-1, 1]) {
          for (let k = 0; k < STRING.n; k++) discs.push(clean(DISC.clone()).translate(GANTRY.x + sx * STRING.gap, discTop - k * STRING.pitch, zb + dz));
          rods.push(clean(new THREE.CylinderGeometry(7, 7, BEAM.y0 - GANTRY.attach - 20, 10, 1, true)).translate(GANTRY.x + sx * STRING.gap, (BEAM.y0 + GANTRY.attach) / 2, zb + dz));
        }
      bay.discGlass = new THREE.Mesh(merged(discs), bay.discMat);
      bay.rodGlass = new THREE.Mesh(merged(rods), bay.rodMat);
      asShell([bay.discGlass, bay.rodGlass], 20);
      bay.gantry.add(bay.discGlass, bay.rodGlass);
    }
    // the fittings: the yoke under the two chains (the conductor hangs there) and their hangers on the beam
    const fit = [];
    for (const dz of PH) {
      const z = zb + dz;
      fit.push([[GANTRY.x - STRING.gap - 8, GANTRY.attach + 8, z], [GANTRY.x + STRING.gap + 8, GANTRY.attach + 8, z]]);
      fit.push([[GANTRY.x - STRING.gap - 8, GANTRY.attach + 8, z], [GANTRY.x, GANTRY.attach - 4, z]], [[GANTRY.x + STRING.gap + 8, GANTRY.attach + 8, z], [GANTRY.x, GANTRY.attach - 4, z]]);
      for (const sx of [-1, 1]) fit.push([[GANTRY.x + sx * STRING.gap, BEAM.y0, z], [GANTRY.x + sx * STRING.gap, discTop + 6, z]]);
    }
    bay.fit = segLines(fit, { width: 2, opacity: 0.5 });
    if (mine) bay.fitMine = bay.fit; // they move with the discs
    (mine ? bay.group : bay.gantry).add(bay.fit);

    /* the apparatus of the other bays, in glass: disconnectors, breaker poles (yours are model.js's, solid) */
    if (!mine) {
      const frames = [];
      const sheds = [];
      const plain = [];
      const column = (x, z, y0, h, r, pitch, amp) => {
        sheds.push(clean(columnGeo(r, h, pitch, amp)).translate(x, y0, z));
        plain.push(clean(columnGeo(r, h, pitch, 0)).translate(x, y0, z));
      };
      for (const dz of PH) {
        const z = zb + dz;
        for (const S of [LSECT, BSECT]) {
          for (const sx of [-1, 1]) {
            const x = S.x + (sx * S.gap) / 2;
            frames.push(box(46, S.base, 46, 4).translate(x, S.base / 2, z));
            column(x, z, S.base, S.column, 12, 13, 6);
            frames.push(box(36, 16, 36, 4).translate(x, S.base + S.column + 8, z));
            frames.push(box(S.arm - 10, 10, 12, 3).translate(x - (sx * (S.arm - 10)) / 2, S.top, z));
          }
          frames.push(box(S.gap + 120, 22, 60, 5).translate(S.x, 11, z)); // the base frame both columns stand on
        }
        frames.push(box(64, BREAKER.base, 64, 5).translate(BREAKER.x, BREAKER.base / 2, z));
        column(BREAKER.x, z, BREAKER.base, BREAKER.chamber.y0 - BREAKER.base, 19, 13, 7);
        frames.push(clean(new THREE.CylinderGeometry(BREAKER.chamber.r, BREAKER.chamber.r, BREAKER.chamber.y1 - BREAKER.chamber.y0, 18)).translate(BREAKER.x, (BREAKER.chamber.y0 + BREAKER.chamber.y1) / 2, z));
        frames.push(box(30, 14, 46, 4).translate(BREAKER.x, BREAKER.top + 2, z));
      }
      bay.frameMat = shellOf({ rim: 0.28, edge: 0.3 });
      bay.shedMat = shellOf({ rim: 0.4, edge: 0.35 });
      bay.plainMat = shellOf({ rim: 0.34, edge: 0.35 });
      const flat = (f) => {
        // rounded boxes come unindexed, cylinders indexed: all unindexed, outlines kept
        const e = f.userData.edges;
        const g2 = f.index ? f.toNonIndexed() : f;
        if (g2.getAttribute("uv")) g2.deleteAttribute("uv");
        if (e) g2.userData.edges = e;
        return g2;
      };
      const fg = merged(frames.map(flat));
      bay.frames = new THREE.Mesh(fg, bay.frameMat);
      bay.frameEdges = edgesOf(fg, { width: 1.8, opacity: 0.32 });
      bay.shedGlass = new THREE.Mesh(merged(sheds), bay.shedMat);
      bay.plainGlass = new THREE.Mesh(merged(plain), bay.plainMat);
      asShell([bay.frames, bay.shedGlass, bay.plainGlass], 20);
      bay.app = new THREE.Group();
      bay.app.add(bay.frames, bay.frameEdges, bay.shedGlass, bay.plainGlass);
      bay.group.add(bay.app);
    }
  }
  const myBay = bayList.find((b) => b.mine);

  /* ═══════════════════════════ THE CONDUCTORS ═══════════════════════════ */
  /** The span from a pylon's chain end to the string end at z, through the line-side work point; a twin bundle between. */
  const spanPts = (from, z, off = 0, toFar = null) => {
    const la = toFar ? null : LINE_AT(z);
    const end = toFar ?? la;
    const pts = [];
    const N = 12;
    for (let k = 0; k <= N; k++) {
      const s = k / N;
      const o = off * smooth(0, 0.07, s) * (1 - smooth(0.78, 0.95, s));
      const p = mix3(from, end, s);
      p[1] -= (toFar ? 260 : 150) * 4 * s * (1 - s);
      p[2] += o;
      pts.push(p);
    }
    if (!toFar) pts.push(STRING_END(z));
    return pts;
  };
  const bayPaths = (zb, i, side, kind) => {
    const z = zb + PH[i];
    const line = [];
    if (kind === "far") {
      // another line, leaving toward −x and fading (its pylons are out of the poste)
      const drift = Math.sign(zb) * (900 + 500 * i) + (zb > 0 ? 400 : -400);
      line.push(spanPts(STRING_END(z), z, 0, [-7200, 2600 + 300 * i, z + drift])); // from the gantry outward: it fades along s
    } else {
      for (const off of [-22, 22]) line.push(spanPts(chainEnd(i, side), z, off));
    }
    return {
      line,
      dropper: [STRING_END(z), LS_NEAR(z)],
      bay: [
        [LS_FAR(z), [lerp(LS_FAR(z)[0], BRK_TOP(z)[0], 0.5), LSECT.top + 40, z], BRK_TOP(z)],
        [BRK_TOP(z), [lerp(BRK_TOP(z)[0], BS_NEAR(z)[0], 0.5), BSECT.top + 40, z], BS_NEAR(z)],
      ],
      bus: [BS_FAR(z), [BS_FAR(z)[0] + 240, BSECT.top + 70, z], [BUS.x0, BUS.h - BUS.r, z]],
    };
  };
  const W = { core: 2.4, halo: 24 };
  const circuit = (name, paths, { halo = true, fade = 0, r = W.core, minPx = 1.9 } = {}) => {
    const geo = merged(paths.map((pts) => tubeOf(pts, r, { radial: 8 })));
    const core = lightMesh(geo, wireMaterial({ R: r, minPx, fade }, H2), 4);
    const out = { core, mats: [core.material] };
    group.add(core);
    if (halo) {
      const hgeo = merged(paths.map((pts) => tubeOf(pts, W.halo, { radial: 10 })));
      out.halo = lightMesh(hgeo, wireMaterial({ R: W.halo, minPx: 5, halo: true, fade }, H2), 5);
      out.mats.push(out.halo.material);
      group.add(out.halo);
    }
    out.name = name;
    return out;
  };
  const P = { mineLine: [], mineDrop: [], mineBay: [], mineBus: [], vois: [], voisBus: [], others: [], othersFar: [], front: [] };
const FRONTBAY = BAY.mine + BAY.w; // the bay in front of yours (+z): the trench of the cut is dug in its ground — it steps back for the cut
  for (const zb of BAY.z) {
    const mine = zb === BAY.mine;
    const vois = zb === BAY.voisine;
    for (let i = 0; i < 3; i++) {
      const b = bayPaths(zb, i, mine ? 1 : -1, mine || vois ? "pylon" : "far");
      if (mine) {
        P.mineLine.push(...b.line);
        P.mineDrop.push(b.dropper);
        P.mineBay.push(...b.bay);
        P.mineBus.push(b.bus);
      } else if (vois) {
        P.vois.push(...b.line, b.dropper, ...b.bay);
        P.voisBus.push(b.bus);
      } else if (zb === FRONTBAY) {
        P.front.push(...b.line, b.dropper, ...b.bay, b.bus);
      } else {
        P.othersFar.push(...b.line);
        P.others.push(b.dropper, ...b.bay, b.bus);
      }
    }
  }
  const C = {
    mineLine: circuit("mineLine", [...P.mineLine, ...P.mineDrop], { minPx: 3.2 }),
    mineBay: circuit("mineBay", P.mineBay, { minPx: 2.6 }),
    mineBus: circuit("mineBus", P.mineBus, { halo: false }),
    vois: circuit("vois", P.vois, { minPx: 2.6 }),
    voisBus: circuit("voisBus", P.voisBus, { halo: false }),
    others: circuit("others", P.others, { halo: false }),
    othersFar: circuit("othersFar", P.othersFar, { halo: false, fade: 6500 }),
    front: circuit("front", P.front, { halo: false, fade: 0 }),
    bus: circuit("bus", [BUS.x0, BUS.x1].map((x) => [[x, BUS.h, ZLO - 200], [x, BUS.h, ZHI + 200]]), { r: BUS.r, halo: false }),
  };
  // the busbars' supports: a lattice post and a glass insulator at every bay border, under each bar
  {
    const g = { chords: [], lace: [] };
    const ins = [];
    for (let z = ZLO; z <= ZHI + 1; z += BAY.w)
      for (const x of [BUS.x0, BUS.x1]) {
        latticeColumn(g, x, z, 0, 760, 34, 22, 152);
        ins.push(clean(columnGeo(13, BUS.h - BUS.r - 760, 13, 6)).translate(x, 760, z));
      }
    const busMat = shellOf({ rim: 0.36, edge: 0.32 });
    const busIns = new THREE.Mesh(merged(ins), busMat);
    asShell(busIns, 20);
    const busChords = segLines(g.chords, { width: 2, opacity: 0.42 });
    const busLace = segLines(g.lace, { width: 1.8, opacity: 0.26 });
    group.add(busIns, busChords, busLace);
    C.busParts = { busMat, busChords, busLace };
  }

  /* the fence and its gate (lines), on the four sides of plan.js · FENCE; the gate on the +x side, level with FENCE.gate */
  {
    const f = [];
    const gz0 = FENCE.gate[2] - 450;
    const gz1 = FENCE.gate[2] + 450;
    const side = (a, b, gate) => {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const n = Math.round(L / 400);
      for (let k = 0; k <= n; k++) {
        const [x, z] = [lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)];
        if (gate && z > gz0 && z < gz1) continue;
        f.push([[x, 0, z], [x, FENCE.h, z]]);
      }
      for (const h of [40, 125, 210, FENCE.h]) {
        if (gate) {
          f.push([[a[0], h, a[1]], [a[0], h, gz0]], [[a[0], h, gz1], [b[0], h, b[1]]]);
        } else f.push([[a[0], h, a[1]], [b[0], h, b[1]]]);
      }
    };
    side([FENCE.x0, FENCE.z0], [FENCE.x1, FENCE.z0]);
    side([FENCE.x0, FENCE.z1], [FENCE.x1, FENCE.z1]);
    side([FENCE.x0, FENCE.z0], [FENCE.x0, FENCE.z1]);
    side([FENCE.x1, FENCE.z0], [FENCE.x1, FENCE.z1], true);
    // the gate: two leaves, framed and braced, a little open
    for (const [z0, z1] of [[gz0, FENCE.gate[2] - 8], [FENCE.gate[2] + 8, gz1]]) {
      const hinge = z0 === gz0 ? z0 : z1;
      const tip = z0 === gz0 ? z1 : z0;
      const open = z0 === gz0 ? 25 : -25;
      const tx = FENCE.x1 - Math.sin(open * DEG) * Math.abs(tip - hinge);
      const tz = hinge + (tip - hinge) * Math.cos(open * DEG);
      f.push([[FENCE.x1, 0, hinge], [FENCE.x1, FENCE.h + 20, hinge]], [[tx, 10, tz], [tx, FENCE.h, tz]]);
      for (const h of [10, FENCE.h / 2, FENCE.h]) f.push([[FENCE.x1, h, hinge], [tx, h, tz]]);
      f.push([[FENCE.x1, 10, hinge], [tx, FENCE.h, tz]]);
    }
    C.fence = segLines(f, { width: 1.8, opacity: 0.3 });
    group.add(C.fence);
  }

  /* ═══════════════════════════ THE FIELD: lines from the ground to your conductors; from the neighbour's to yours ═══════════════════════════ */
  const dropAt = (z, x) => mix3(STRING_END(z), LS_NEAR(z), x / LS_NEAR(z)[0]);
  /** A point of a span (by x) on a circuit, from the sampled path. */
  const spanAt = (paths, x) => {
    let best = paths[0][0];
    let bd = 1e9;
    for (const pts of paths)
      for (let k = 0; k < pts.length - 1; k++) {
        const a = pts[k];
        const b = pts[k + 1];
        if ((a[0] - x) * (b[0] - x) <= 0 && a[0] !== b[0]) {
          const u = (x - a[0]) / (b[0] - a[0]);
          const p = mix3(a, b, u);
          const d = Math.abs(u - 0.5);
          if (d < bd) (bd = d), (best = p);
        }
      }
    return best;
  };
  const fieldGeo = [];
  // a few real field lines: each leaves its conductor sideways, bends, and lands on the ground standing up (a cubic
  // in one plane); the outer phases throw theirs outward, phase 1's fan round where you stand
  const FIELD = [
    [0, 150, 1, 520], [0, 420, 1, 360], [0, 300, 1, 760], [0, 260, -1, 300],
    [1, 200, 1, 260], [1, 460, -1, 280],
    [2, 160, -1, 480], [2, 430, -1, 340], [2, 300, -1, 700],
  ];
  for (const [i, x, sgn, reach] of FIELD) {
    const c = dropAt(BAY.mine + PH[i], x);
    const out = sgn * reach;
    const g = [x + 60 * (R() - 0.5), 0, c[2] + out];
    const curve = new THREE.CubicBezierCurve3(V3(...c), V3(c[0], c[1] * 0.92, c[2] + out * 0.7), V3(g[0], c[1] * 0.4, g[2] + out * 0.08), V3(...g));
    fieldGeo.push(tubeOf(curve.getPoints(40).map((v) => [v.x, v.y, v.z]), 2.4, { radial: 8, step: 25 }));
  }
  const efield = lightMesh(merged(fieldGeo), flowMaterial(H2), 5);
  efield.material.uniforms.uDir.value = -1; // the light runs up, from the ground to the conductor
  efield.material.uniforms.uR.value = 2.4;
  efield.material.uniforms.uMinPx.value = 3;
  efield.material.uniforms.uSpeed.value = 28;
  efield.material.uniforms.uPeriod.value = 300;
  group.add(efield);

  const mineSpans = [0, 1, 2].map((i) => spanPts(chainEnd(i, 1), BAY.mine + PH[i], 0));
  const voisSpans = [0, 1, 2].map((i) => spanPts(chainEnd(i, -1), BAY.voisine + PH[i], 0));
  const pointOn = (spans, i, x) => (x > 0 ? dropAt(spans === mineSpans ? BAY.mine + PH[i] : BAY.voisine + PH[i], x) : spanAt([spans[i]], x));
  const coupleGeo = [];
  for (const x of [-3300, -2500, -1700, -1000, -420, 120, 420]) {
    for (const [vi, mi, lift] of [[0, 2, 240], [0, 1, 420], [1, 2, 330]]) {
      const a = pointOn(voisSpans, vi, x + (R() - 0.5) * 120);
      const b = pointOn(mineSpans, mi, x + (R() - 0.5) * 120);
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + lift * (0.7 + 0.5 * R()), (a[2] + b[2]) / 2];
      const curve = new THREE.QuadraticBezierCurve3(V3(...a), V3(...m), V3(...b));
      coupleGeo.push(tubeOf(curve.getPoints(20).map((v) => [v.x, v.y, v.z]), 1.2, { radial: 5, step: 40 }));
    }
  }
  const couple = lightMesh(merged(coupleGeo), flowMaterial(H2), 5);
  couple.material.uniforms.uMinPx.value = 3;
  couple.material.uniforms.uR.value = 2;
  couple.material.uniforms.uSpeed.value = 35;
  couple.material.uniforms.uPeriod.value = 240;
  group.add(couple);

  /* ═══════════════════════════ THE ENVELOPE (the forbidden distance) and THE ZONE (equipotential) ═══════════════════════════ */
  const ENV_R = 330;
  const envGeo = [];
  PH.forEach((dz, i) => {
    const z = BAY.mine + dz;
    const sp = mineSpans[i].filter((p) => p[0] > -1700);
    const pts = [...sp, LS_NEAR(z)];
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => V3(...p)), false, "centripetal");
    envGeo.push(clean(new THREE.TubeGeometry(curve, 60, ENV_R, 28, false)));
    for (const end of [pts[0], pts[pts.length - 1]]) envGeo.push(clean(new THREE.SphereGeometry(ENV_R, 28, 16)).translate(...end));
  });
  const envMat = glass(BRAND.signal, { base: 0.0, rim: 0.11, power: 2.2, edge: 0.1 });
  const envelope = new THREE.Mesh(merged(envGeo), envMat);
  asShell(envelope, 40);
  group.add(envelope);

  const zoneBox = { x0: WORK.lineX - 200, x1: WORK.x + 200, y1: BEAM.y1 + 260, z0: BAY.mine + PH[2] - 260, z1: FOOT[2] + 80 };
  const zoneGeo = new RoundedBoxGeometry(zoneBox.x1 - zoneBox.x0, zoneBox.y1, zoneBox.z1 - zoneBox.z0, 6, 140);
  zoneGeo.translate((zoneBox.x0 + zoneBox.x1) / 2, zoneBox.y1 / 2, (zoneBox.z0 + zoneBox.z1) / 2);
  const zoneMat = glass(BRAND.veille, { base: 0.0008, rim: 0.09, power: 3.4, edge: 0.6 });
  const zone = new THREE.Mesh(zoneGeo, zoneMat);
  asShell(zone, 41);
  const zoneFloor = segLines(
    [
      [[zoneBox.x0, 1, zoneBox.z0], [zoneBox.x1, 1, zoneBox.z0]], [[zoneBox.x1, 1, zoneBox.z0], [zoneBox.x1, 1, zoneBox.z1]],
      [[zoneBox.x1, 1, zoneBox.z1], [zoneBox.x0, 1, zoneBox.z1]], [[zoneBox.x0, 1, zoneBox.z1], [zoneBox.x0, 1, zoneBox.z0]],
    ],
    { color: BRAND.veille, width: 2, opacity: 0, additive: true },
  );
  group.add(zone, zoneFloor);

  /* ═══════════════════════════ THE MARK on your gantry ═══════════════════════════ */
  const markG = new THREE.Group();
  {
    const m = [];
    const y = BEAM.y1 + 620;
    const ring = [];
    for (let k = 0; k <= 48; k++) ring.push([Math.cos((k / 48) * Math.PI * 2) * 520, y, BAY.mine + Math.sin((k / 48) * Math.PI * 2) * 520]);
    for (let k = 0; k < 48; k++) m.push([ring[k], ring[k + 1]]);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      m.push([[Math.cos(a) * 600, y, BAY.mine + Math.sin(a) * 600], [Math.cos(a) * 780, y, BAY.mine + Math.sin(a) * 780]]);
    }
    m.push([[0, y - 40, BAY.mine], [0, BEAM.y1 + 420, BAY.mine]]);
    markG.add(segLines(m, { color: BRAND.veille, width: 2.6, opacity: 1, additive: true }));
    const ball = makeBall();
    ball.position.set(0, BEAM.y1 + 420, BAY.mine);
    ball.material.uniforms.uSize.value = 260;
    markG.add(ball);
    markG.userData.ball = ball;
  }
  myBay.gantry.add(markG);

  /* ═══════════════════════════ THE GROUND IN SECTION: the trench, the soil, the gravel band, the mesh ═══════════════════════════ */
  const cut = new THREE.Group();
  group.add(cut);
  const soilU = { uAmount: { value: 0 }, uInk: { value: INK.clone() }, uSig: { value: SIGNAL.clone() }, uVeil: { value: VEILLE.clone() }, uSrc: groundU.uSrc, uFault: groundU.uFault, uBond: groundU.uBond, uRingT: groundU.uRingT };
  const soilMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: soilU,
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount; uniform vec3 uInk, uSig, uVeil;
      varying vec3 vW; varying vec3 vN;
      ${GRAINS}
      ${RINGS}
      void main() {
        vec2 q = abs(vN.z) > 0.5 ? vW.xy : vW.zy;
        float depth = -vW.y;
        float band = 1.0 - smoothstep(${GROUND.gravel.toFixed(1)} - 1.0, ${GROUND.gravel.toFixed(1)} + 1.0, depth);
        float stones = gravelAt(q / 3.2, 1.0);
        // the soil: dark, warm, a few strata and pebbles; the gravel band on top, stone by stone
        float strata = 0.5 + 0.5 * sin(depth * 0.09 + sin(q.x * 0.004) * 2.0);
        float pebble = smoothstep(0.03, 0.2, grains(q / 11.0).y) * step(0.82, grains(q / 11.0).z);
        vec3 col = uInk * (0.028 + 0.012 * strata + 0.03 * pebble) * (1.0 - band);
        col += uInk * band * (0.06 + 0.24 * stones);
        float edge = (1.0 - smoothstep(0.0, 2.5, depth)) * 0.5;
        col += uInk * edge;
        col += ringsAt(vW, uSig, uVeil, 1.0);
        float a = mix(0.62, 0.9, band);
        gl_FragColor = vec4(col, a * uAmount);
      }`,
  });
  const T = GROUND.cut;
  const DEPTH = 300;
  const TLEN = 3000;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(T.x1 - T.x0, DEPTH), soilMat);
  face.position.set((T.x0 + T.x1) / 2, -DEPTH / 2, T.z);
  const wallL = new THREE.Mesh(new THREE.PlaneGeometry(TLEN, DEPTH), soilMat);
  wallL.rotation.y = Math.PI / 2;
  wallL.position.set(T.x0, -DEPTH / 2, T.z + TLEN / 2);
  const wallR = wallL.clone();
  wallR.position.x = T.x1;
  for (const m of [face, wallL, wallR]) m.renderOrder = 7;
  const cutEdges = segLines(
    [
      [[T.x0, 0, T.z], [T.x1, 0, T.z]], [[T.x0, -DEPTH, T.z], [T.x1, -DEPTH, T.z]],
      [[T.x0, 0, T.z], [T.x0, 0, T.z + TLEN]], [[T.x1, 0, T.z], [T.x1, 0, T.z + TLEN]],
      [[T.x0, 0, T.z], [T.x0, -DEPTH, T.z]], [[T.x1, 0, T.z], [T.x1, -DEPTH, T.z]],
      [[T.x0, -DEPTH, T.z], [T.x0, -DEPTH, T.z + TLEN]], [[T.x1, -DEPTH, T.z], [T.x1, -DEPTH, T.z + TLEN]],
    ],
    { width: 2, opacity: 0 },
  );
  cutEdges.renderOrder = 8;
  // the trench's floor: the grid again, lower
  const floorMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uAmount: { value: 0 }, uInk: { value: INK.clone() } },
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount; uniform vec3 uInk; varying vec2 vP;
      float lines(float x, float cell) { float q = x / cell; float fw = fwidth(q); float d = abs(fract(q - 0.5) - 0.5); return (1.0 - smoothstep(fw * 0.75, fw * 1.5, d)) * (1.0 - smoothstep(0.05, 0.16, fw)); }
      void main() { float g = max(lines(vP.x, 150.0), lines(vP.y, 150.0)); gl_FragColor = vec4(uInk * g * 0.07 * uAmount, 1.0); }`,
  });
  const tFloor = new THREE.Mesh(new THREE.PlaneGeometry(T.x1 - T.x0, TLEN).rotateX(-Math.PI / 2), floorMat);
  tFloor.position.set((T.x0 + T.x1) / 2, -DEPTH, T.z + TLEN / 2);
  tFloor.renderOrder = 1;
  cut.add(face, wallL, wallR, cutEdges, tFloor);

  // the mesh: copper bars at 80 cm, 6 m cells under the whole poste, rods, and risers to the legs and the earth terminals
  const meshG = new THREE.Group();
  group.add(meshG);
  const meshPaths = [];
  const MX0 = -1200;
  const MX1 = 6000;
  const MZ0 = ZLO;
  const MZ1 = T.z;
  for (let x = MX0; x <= MX1 + 1; x += GROUND.cell) meshPaths.push([[x, -GROUND.mesh, MZ0], [x, -GROUND.mesh, MZ1]]);
  for (let z = MZ1 - 300; z >= MZ0 - 1; z -= GROUND.cell) meshPaths.push([[MX0, -GROUND.mesh, z], [MX1, -GROUND.mesh, z]]);
  meshPaths.push([[MX0, -GROUND.mesh, MZ1], [MX1, -GROUND.mesh, MZ1]]);
  const risers = [[GANTRY.x, MYLEG], [GANTRY.x, BAY.mine - PORTAL], EARTH.a.filter((_, k) => k !== 1), EARTH.b.filter((_, k) => k !== 1)];
  for (const dz of PH) for (const x of [LSECT.x, BREAKER.x, BSECT.x]) risers.push([x, BAY.mine + dz]);
  for (const [x, z] of risers) meshPaths.push([[x, -GROUND.mesh, z], [x, 2, z]]);
  for (const [x, z] of [[MX0, MZ1], [0, MZ1], [1800, MZ1], [3000, MZ1], [MX0, 0], [2400, 0], [EARTH.a[0], EARTH.a[2]], [EARTH.b[0], EARTH.b[2]]]) meshPaths.push([[x, -GROUND.mesh, z], [x, -GROUND.mesh - 210, z]]);
  const meshGeo = merged(
    meshPaths.map((pts) => {
      const g = tubeOf(pts, 3, { radial: 8, step: 120 });
      // aS: how far from the nearer earth terminal (the current spreads from there)
      const pos = g.attributes.position;
      const s = g.attributes.aS;
      for (let k = 0; k < pos.count; k++) {
        const x = pos.getX(k);
        const z = pos.getZ(k);
        s.setX(k, Math.min(Math.abs(x - EARTH.a[0]) + Math.abs(z - EARTH.a[2]), Math.abs(x - EARTH.b[0]) + Math.abs(z - EARTH.b[2])) + Math.abs(pos.getY(k)));
      }
      return g;
    }),
  );
  const meshMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uSeen: { value: 0 }, uLit: { value: 0 }, uCurrent: { value: 0 }, uTime: { value: 0 }, uInk: { value: INK.clone() }, uVeil: { value: VEILLE.clone() }, uR: { value: 3 }, uMinPx: { value: 1.8 } },
    vertexShader: /* glsl */ `
      attribute float aS; uniform float uR, uMinPx;
      varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 c = modelViewMatrix * vec4(position, 1.0);
        float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
        vec4 mv = modelViewMatrix * vec4(position + normal * (max(uR, uMinPx * cmPerPx) - uR), 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vS = aS;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uSeen, uLit, uCurrent, uTime; uniform vec3 uInk, uVeil;
      varying float vS; varying vec3 vN; varying vec3 vV;
      ${BARS}
      void main() {
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        // copper: a warm grey round bar (light on its crest), lit veille when it protects, dashes running from the clamps
        vec3 col = uInk * vec3(1.0, 0.9, 0.78) * uSeen * (0.07 + 0.28 * pow(f, 3.0) + 0.12 * pow(1.0 - f, 2.0));
        col += uVeil * (uLit * (0.25 + 0.65 * f));
        float dash = bars((vS - uTime * 260.0) / 320.0, 0.4);
        col += uVeil * (uCurrent * dash * (0.4 + 1.3 * exp(-vS / 1800.0)) * (0.4 + 0.6 * f));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const meshMesh = lightMesh(meshGeo, meshMat, 4);
  meshG.add(meshMesh);

  /* the gravel under your feet, for "le gravier": a slab 15 cm thick that lights, the current choked under each sole */
  const slabU = { uGravel: { value: 0 }, uFootA: groundU.uFootA, uFootB: groundU.uFootB, uInk: { value: INK.clone() }, uVeil: { value: VEILLE.clone() }, uSig: { value: SIGNAL.clone() }, uC: { value: new THREE.Vector2() } };
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(190, GROUND.gravel, 130, 1, 1, 1).translate(0, -GROUND.gravel / 2, 0),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: slabU,
      vertexShader: /* glsl */ `
        varying vec3 vW; varying vec3 vN;
        void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `
        uniform float uGravel; uniform vec3 uFootA, uFootB, uInk, uVeil, uSig; uniform vec2 uC;
        varying vec3 vW; varying vec3 vN;
        ${GRAINS}
        void main() {
          vec2 q = abs(vN.y) > 0.5 ? vW.xz : abs(vN.z) > 0.5 ? vW.xy : vW.zy;
          float stones = gravelAt(q / 3.0, 1.0);
          float depth = clamp(-vW.y / ${GROUND.gravel.toFixed(1)}, 0.0, 1.0);
          vec2 d = abs(vW.xz - uC) / vec2(95.0, 65.0);
          float soft = 1.0 - smoothstep(0.55, 1.0, max(d.x, d.y));
          vec3 col = uVeil * (0.07 + 0.3 * stones) + uInk * (0.05 * stones);
          // under each sole, a thin signal that dies in the stones: the current, choked
          for (int i = 0; i < 2; i++) {
            vec3 f = i == 0 ? uFootA : uFootB;
            vec2 r = (vW.xz - f.xz) / vec2(6.0, 12.0);
            col += uSig * (1.2 * exp(-dot(r, r)) * exp(-depth * 3.2) * (0.6 + 0.4 * stones));
          }
          gl_FragColor = vec4(col * uGravel * soft, 1.0);
        }`,
    }),
  );
  slab.renderOrder = 6;
  slab.frustumCulled = false;
  group.add(slab);

  /* ═══════════════════════════ THE ARC: the air that gives way between a conductor and your hand ═══════════════════════════ */
  const ARC_L = 350;
  const arcG = new THREE.Group();
  group.add(arcG);
  const jag = (seed) => {
    const r = rng(seed);
    const pts = [];
    const n = 22;
    let ox = 0;
    let oy = 0;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      ox += (r() - 0.5) * 22;
      oy += (r() - 0.5) * 22;
      const env = Math.sin(Math.PI * t);
      pts.push([ox * env, oy * env, t * ARC_L]);
    }
    return pts;
  };
  const arcGeo = (r) => {
    const a = tubeOf(jag(71), r, { radial: 8, segs: 64 });
    const b = tubeOf(jag(93), r, { radial: 8, segs: 64 });
    a.setAttribute("aPos1", b.attributes.position.clone());
    return a;
  };
  const arcParts = ["halo", "sheath", "core"].map((kind, i) => lightMesh(arcGeo({ core: 1.6, sheath: 6, halo: 34 }[kind]), arcMaterial(kind, H2), 6 + i));
  arcG.add(...arcParts);
  const arcRoot = makeBall();
  const arcTip = makeBall();
  group.add(arcRoot, arcTip);
  // the air, tense: a straight, faint glow along the same way
  const tense = lightMesh(tubeOf([[0, 0, 0], [0, 0, ARC_L]], 26, { radial: 10, step: 60 }), wireMaterial({ R: 26, minPx: 10, halo: true }, H2), 5);
  tense.material.uniforms.uDead.value = 0;
  arcG.add(tense);
  // the conductor point the arc leaves from: phase 1's span, a little outside the gantry
  const ARC_FROM = spanAt([mineSpans[0]], -230);

  /* ═══════════════════════════ YOU, and the two chargés ═══════════════════════════ */
  const helmet = (fig, k = 1) => {
    const mat = solid(BRAND.plastic, { rough: 0.42, env: 0.7 });
    mat.color.multiplyScalar(k);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(12.2, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(13.4, 13.8, 1.4, 32), mat);
    brim.position.y = 0.4;
    const peak = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 6), mat);
    peak.position.set(0, 0.3, 13);
    const h = new THREE.Group();
    h.add(shell, brim, peak);
    h.position.set(0, 2.2, -0.5);
    fig.head.add(h);
    return mat;
  };
  const fig = makeFigure({ shell: true, hands: "flat", order: 22 });
  const helmetMat = helmet(fig);
  for (const m of [fig.flesh, helmetMat]) m.transparent = true;
  group.add(fig.group);
  const hands = new THREE.Object3D();
  fig.group.add(hands);
  const head = new THREE.Object3D();
  head.position.set(0, 178, 0);
  fig.group.add(head);
  const feet = new THREE.Object3D();
  fig.group.add(feet);
  // the signal from your hand to your feet (the touch voltage): nine segments rewritten in place every frame
  const pathLine = segLines(Array.from({ length: 9 }, () => [[0, 0, 0], [0, 1, 0]]), { color: BRAND.signal, width: 3.2, opacity: 0, additive: true });
  pathLine.material.color.multiplyScalar(1.8);
  pathLine.frustumCulled = false;
  pathLine.renderOrder = 9;
  fig.group.add(pathLine);
  const pathArr = pathLine.geometry.attributes.instanceStart.data;

  const chiefs = [0.62, 0.5].map((k) => {
    const c = makeFigure({ shell: true, hands: "flat", order: 24, glassK: k });
    helmet(c, 0.8);
    c.flesh.transparent = true;
    group.add(c.group);
    return c;
  });
  const CH = { a: [1180, 0, 1330], b: [1040, 0, 1330] };
  chiefs[0].group.position.set(...CH.a);
  chiefs[0].group.rotation.y = -Math.PI / 2;
  chiefs[1].group.position.set(...CH.b);
  chiefs[1].group.rotation.y = Math.PI / 2;
  for (const c of chiefs) {
    c.leg("L", V3(12, 8, 3));
    c.leg("R", V3(-12, 8, -3));
  }
  const paper = new THREE.Mesh(box(21, 0.5, 29.7, 0.2), solid(BRAND.ink, { rough: 0.85, env: 0.4 }));
  paper.material.transparent = true;
  group.add(paper);

  /* ═══════════════════════════ every frame ═══════════════════════════ */
  const tmp = new THREE.Vector3();
  const tA = new THREE.Vector3();
  const tB = new THREE.Vector3();
  const tC = new THREE.Vector3();
  const tD = new THREE.Vector3();
  const hue = new THREE.Color();
  const q = new THREE.Quaternion();
  const ZAX = new THREE.Vector3(0, 0, 1);
  const ankL = new THREE.Vector3();
  const ankR = new THREE.Vector3();
  const segLen = [];
  let pathLen = 0;
  for (let k = 0; k < PATH.length - 1; k++) {
    segLen.push(Math.hypot(PATH[k + 1][0] - PATH[k][0], PATH[k + 1][1] - PATH[k][1]));
    pathLen += segLen[k];
  }
  // walk u → which segment, how far along it, distance walked from the gate
  const along = (u) => {
    const k = u < 0.8 ? (u / 0.8) * 2 : 2 + (u - 0.8) / 0.2;
    const i = Math.min(PATH.length - 2, Math.floor(k));
    const f = clamp01(k - i);
    let d = 0;
    for (let j = 0; j < i; j++) d += segLen[j];
    d += f * segLen[i];
    return { i, f, d, x: lerp(PATH[i][0], PATH[i + 1][0], f), z: lerp(PATH[i][1], PATH[i + 1][1], f) };
  };
  const angLerp = (a, b, u) => {
    let d = b - a;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return a + d * u;
  };
  const tri = (x) => 1 - Math.abs(2 * (x - Math.floor(x)) - 1);
  const toLocal = (fg, v) => fg.worldToLocal(v);
  const tE = new THREE.Vector3();
  const tF = new THREE.Vector3();
  const POSE = { mode: "ground" };
  /**
   * Which phase the pole's head is on (0 → 2, continuous): `probe` — or, while the pole carries the earth clamps up
   * (`tool` 1, `clamps` 1 → 2, the order of model.js: one phase per third), the phase of the clamp on its way: you
   * walk from under the last one put on to under the next one while it rises.
   */
  const aimOf = (p) => {
    const ck = p.clamps ?? 0;
    if ((p.tool ?? 0) > 0.5 && ck > 1 && ck < 2) {
      const kk = (ck - 1) * 3;
      const i = Math.min(2, Math.floor(kk));
      return Math.max(0, Math.min(2, i - 1 + smooth(0, 0.9, kk - i)));
    }
    return Math.max(0, Math.min(2, p.probe ?? 0));
  };
  const WP = PH.map((dz) => V3(...dropAt(BAY.mine + dz, WORK.x))); // = world.js · WORKAT
  const CHEST = new THREE.Vector3(0, 122, 0);
  const HIPS = new THREE.Vector3(0, 90, 0);
  // the touch voltage's way through you: hand → elbow → shoulder → chest → hips → each knee → each ankle
  const PATHPTS = [
    [fig.arms.R.at, fig.arms.R.elbow], [fig.arms.R.elbow, fig.arms.R.sh], [fig.arms.R.sh, CHEST], [CHEST, HIPS],
    [HIPS, fig.legs.L.knee], [fig.legs.L.knee, fig.legs.L.ankle], [HIPS, fig.legs.R.knee], [fig.legs.R.knee, fig.legs.R.ankle], [fig.legs.R.ankle, fig.legs.R.ankle],
  ];

  /** Pose you: where (walk / climb), the legs, the trunk, the arms. Returns the mode. */
  const poseYou = (p) => {
    const walk = clamp01(p.walk ?? 0.8);
    const climb = clamp01(p.climb ?? 0);
    const arms = Math.max(0, Math.min(2, p.arms ?? 0));
    const g = fig.group;
    let kneel = 0;
    let mode = "ground";
    let amp = 0;
    let phase = 0;
    if (climb <= 0.001) {
      const a = along(walk);
      amp = smooth(0, 0.035, Math.abs(walk - 0.8)) * smooth(0, 0.035, walk) * smooth(0, 0.035, 1 - walk);
      phase = (a.d / 135) * Math.PI * 2;
      const dx = PATH[a.i + 1][0] - PATH[a.i][0];
      const dz = PATH[a.i + 1][1] - PATH[a.i][1];
      const tangent = Math.atan2(dx, dz);
      const stop = walk > 0.9 || Math.abs(walk - 0.8) < 0.05 ? Math.PI : tangent;
      // at your work spot you stand under the phase the pole is on: in front of phase 1 at WORK.stand, and 6 m
      // further (−z) for each phase after it — the same place relative to each phase, so the pole stays ≈ 10 m
      const atWork = 1 - smooth(0.02, 0.06, Math.abs(walk - 0.8));
      const aim = aimOf(p);
      const f = aim - Math.floor(aim);
      const step = smooth(0, 0.06, f) * smooth(0, 0.06, 1 - f) * atWork; // walking between two phases
      const zAim = (lerp(PH[Math.min(1, Math.floor(aim))], PH[Math.min(2, Math.floor(aim) + 1)], aim - Math.min(1, Math.floor(aim))) - PH[0]) * atWork;
      phase = ((a.d + Math.abs(zAim)) / 135) * Math.PI * 2;
      amp = Math.max(amp, step);
      g.position.set(a.x, 0, a.z + zAim);
      g.rotation.y = angLerp(stop, tangent, amp * (1 - atWork));
    } else if (climb < 0.8) {
      mode = "ladder";
      const y = (climb / 0.8) * BEAM.y1;
      g.position.set(FOOT[0], y, LADDER + 34);
      g.rotation.y = Math.PI;
      phase = y / RUNG;
    } else {
      mode = "beam";
      const u = (climb - 0.8) / 0.2;
      const zs = MYLEG - 40;
      const z = u < 0.35 ? lerp(LADDER + 34, zs, u / 0.35) : lerp(zs, ONBEAM[2], smooth(0.35, 1, u));
      const x = lerp(FOOT[0], ONBEAM[0], smooth(0.35, 1, u));
      g.position.set(x, BEAM.y1, z);
      g.rotation.y = angLerp(Math.PI, -Math.PI / 2, smooth(0.75, 1, u));
      amp = u > 0.35 && u < 0.97 ? Math.sin(Math.PI * smooth(0.35, 0.97, u)) : 0;
      phase = (Math.abs(z - zs) / 120) * Math.PI * 2;
      kneel = smooth(0.97, 1, u) * clamp01(arms - 1);
    }

    /* the legs */
    if (mode === "ladder") {
      const c = phase / 2;
      fig.leg("L", tA.set(11, 8 + 30 * tri(c + 0.5), 20), undefined, ZAX);
      fig.leg("R", tA.set(-11, 8 + 30 * tri(c), 20), undefined, ZAX);
    } else {
      const sw = Math.sin(phase) * 22 * amp;
      const lift = 7 * amp;
      ankL.set(lerp(13, 9, amp), 8 + lift * Math.max(0, Math.cos(phase)), lerp(3, sw, amp));
      ankR.set(lerp(-13, -9, amp), 8 + lift * Math.max(0, -Math.cos(phase)), lerp(-3, -sw, amp));
      if (kneel > 0) {
        ankL.lerp(tA.set(11, 50, -34), kneel);
        ankR.lerp(tA.set(-11, 50, -30), kneel);
        g.position.y -= 42 * kneel;
      }
      fig.leg("L", ankL);
      fig.leg("R", ankR);
    }
    fig.lean(mode === "ladder" ? 4 : 58 * kneel + (arms > 1 && mode === "ground" && walk > 0.95 ? 6 * (arms - 1) : 0));
    g.updateMatrixWorld(true);

    /* the arms */
    if (mode === "ladder") {
      const c = phase / 2;
      fig.reach("L", tA.set(19, 152 + 32 * tri(c), 26));
      fig.reach("R", tB.set(-19, 152 + 32 * tri(c + 0.5), 26));
      hands.position.copy(fig.arms.R.at);
      POSE.mode = mode;
      return POSE;
    }
    // 0: hanging, swinging as you walk
    const sw = Math.cos(phase) * 12 * amp;
    tA.set(20.5, 92, 3 + sw);
    tB.set(-20.5, 92, 3 - sw);
    // 1: both hands on the pole — the lower at `hands`, the upper along the pole toward the conductor it aims at
    const k1 = smooth(0, 1, Math.min(1, arms));
    if (k1 > 0) {
      // the same aim as world.js: the pole's foot at `hands`, its head on the conductor `probe` (or leaning, `perche` 0)
      hands.position.set(-5, 112, 34);
      hands.getWorldPosition(tC);
      const kk = Math.max(0, Math.min(2, p.probe ?? 0));
      const i0 = Math.min(1, Math.floor(kk));
      tD.copy(WP[i0]).lerp(WP[i0 + 1], kk - i0);
      tmp.set(tC.x + 120, tC.y + 260, tC.z + 120);
      tD.lerp(tmp, 1 - clamp01(p.perche ?? 1));
      tD.sub(tC).normalize(); // the pole's direction, world
      tE.copy(tC).addScaledVector(tD, 8);
      toLocal(g, tE);
      tF.copy(tC).addScaledVector(tD, 50);
      toLocal(g, tF);
      tB.lerp(tE, k1);
      tA.lerp(tF, k1);
    }
    // 2: one hand forward — on the leg (at its foot), toward the conductor (kneeling on the beam), or simply forward
    const k2 = smooth(0, 1, arms - 1);
    if (k2 > 0) {
      if (mode === "beam") {
        tB.lerp(tmp.set(-10, 74, 80), k2);
        tA.lerp(tmp.set(20, 46, 42), k2);
      } else if (walk > 0.95) {
        tmp.set(GANTRY.x - 14, 138, LADDER + 2);
        toLocal(g, tmp);
        tB.lerp(tmp, k2);
        tA.lerp(tmp.set(20.5, 92, 3), k2);
      } else {
        tB.lerp(tmp.set(-16, 132, 52), k2);
      }
    }
    fig.reach("L", tA);
    fig.reach("R", tB);
    if (k1 <= 0) hands.position.copy(fig.arms.R.at);
    POSE.mode = mode;
    return POSE;
  };

  const posePaper = (pp) => {
    const [A, B] = chiefs;
    const out = smooth(0.0, 0.35, pp) * (1 - smooth(0.62, 0.9, pp));
    const take = smooth(0.25, 0.5, pp);
    A.reach("R", tA.set(-14, lerp(96, 112, out), lerp(6, 44, out)));
    A.reach("L", tA.set(20.5, 92, 3));
    B.reach("R", tB.set(-12, lerp(96, lerp(112, 116, smooth(0.6, 1, pp)), take), lerp(6, lerp(44, 24, smooth(0.6, 1, pp)), take)));
    B.reach("L", tB.set(20.5, 92, 3));
    A.group.updateMatrixWorld(true);
    B.group.updateMatrixWorld(true);
    A.arms.R.hand.getWorldPosition(tC);
    B.arms.R.hand.getWorldPosition(tD);
    const k = smooth(0.42, 0.58, pp);
    paper.position.copy(tC).lerp(tD, k);
    paper.position.y += 2 + Math.sin(Math.PI * k) * 6;
    paper.rotation.set(-0.6 + 0.3 * k, lerp(-Math.PI / 2, Math.PI / 2, k), 0);
  };

  // the segments of the pools of light on the ground: your three droppers, your spans' first 20 m; the neighbour's; the busbars
  const segInit = () => {
    let i = 0;
    for (const zb of [BAY.mine, BAY.voisine]) {
      for (const dz of PH) segU[i++].set(GANTRY.x - 200, zb + dz, LS_NEAR(0)[0], zb + dz);
      segU[i++].set(-2600, zb - 300, GANTRY.x, zb);
      segU[i++].set(LS_FAR(0)[0], zb, BS_NEAR(0)[0], zb);
    }
    segU[10].set(BUS.x0, ZLO, BUS.x0, ZHI);
    segU[11].set(BUS.x1, ZLO, BUS.x1, ZHI);
  };
  segInit();

  const setWire = (c, { hueC, level, dead = 1, ind = 0, surge = 0, amount = 1, time = 0 }) => {
    for (const m of c.mats) {
      const u = m.uniforms;
      u.uHue.value.copy(hueC);
      u.uLevel.value = level;
      u.uDead.value = dead;
      u.uInd.value = ind;
      u.uSurge.value = surge;
      u.uAmount.value = amount;
      u.uTime.value = time;
    }
    c.core.visible = amount > 0.003;
    if (c.halo) c.halo.visible = amount > 0.003 && (level > 0.003 || ind > 0.003 || surge > 0.003 || dead > 1);
  };

  return {
    group,
    you: { group: fig.group, A: { hands, head, feet } },
    A: {
      beam: (() => {
        const o = new THREE.Object3D();
        o.position.set(GANTRY.x, GANTRY.beam, BAY.mine);
        myBay.gantry.add(o);
        return o;
      })(),
      legs: [MYLEG, BAY.mine - PORTAL].map((z) => {
        const o = new THREE.Object3D();
        o.position.set(GANTRY.x, BEAM.y0, z);
        myBay.gantry.add(o);
        return o;
      }),
      strings: PH.map((dz) => {
        const o = new THREE.Object3D();
        o.position.set(...STRING_END(BAY.mine + dz));
        group.add(o);
        return o;
      }),
      legTop: (() => {
        const o = new THREE.Object3D();
        o.position.set(GANTRY.x, BEAM.y1, MYLEG);
        myBay.gantry.add(o);
        return o;
      })(),
      fault: (() => {
        const o = new THREE.Object3D();
        o.position.set(...SRC);
        group.add(o);
        return o;
      })(),
      mark: markG.userData.ball,
      arc: arcRoot,
      zone,
    },
    set(p, time, px) {
      if (CAM) CAM.getWorldPosition(camPos);
      if (px) PX = px;
      const a = clamp01(p.amount ?? 1);
      const bays = clamp01(p.bays ?? 1);
      const ex = smooth(0, 1, clamp01(p.explode ?? 0));
      const named = Math.round(p.named ?? 0);
      const mark = clamp01(p.mark ?? 0);
      const live = clamp01(p.live ?? 0);
      const vois = clamp01(p.voisine ?? 0);
      const earthed = clamp01(p.earthed ?? 0);
      const induced = Math.max(0, Math.min(2, p.induced ?? 0));

      /* ── the bays: their fade, their level of detail (from the camera), your gantry rising, lit, marked ── */
      for (const b of bayList) {
        const k = a * (b.mine ? 1 : bays) * (b.zb === FRONTBAY ? 1 - clamp01(p.cutaway ?? 0) : 1);
        b.group.visible = k > 0.003;
        if (!b.group.visible) continue;
        const n1 = sizePx(1, GANTRY.x + 300, 900, b.zb, 400, 950, BAY.w / 2); // px per cm at this bay's nearest point
        const chordG = smooth(2.2, 5, n1 * 11);
        const laceG = smooth(2.6, 5.5, n1 * 6.4);
        const panel = smooth(6, 14, n1 * LEG.panel);
        const lit = b.mine ? 1 + 1.3 * (named === 1 ? 1 : 0) + 0.4 * mark : 1;
        b.chordMat.uniforms.uAmount.value = k * chordG;
        b.laceMat.uniforms.uAmount.value = k * laceG * panel;
        for (const m of [b.chordMat, b.laceMat]) {
          m.uniforms.uColor.value.copy(INK).lerp(VEILLE, b.mine ? mark : 0);
          m.uniforms.uGain.value = lit;
        }
        b.chordLines.material.opacity = k * 0.55 * (1 - 0.8 * chordG) * Math.min(1.6, lit);
        b.laceLines.material.opacity = k * 0.34 * panel * (1 - 0.8 * laceG) * Math.min(1.6, lit);
        for (const l of [b.chordLines, b.laceLines]) l.material.color.copy(INK).lerp(VEILLE, b.mine ? mark : 0);
        const disc = smooth(3.5, 7, n1 * STRING.pitch);
        const strLit = b.mine && named === 2 ? 1.9 : 1;
        b.discMat.uniforms.uAmount.value = k * (b.mine ? 1 : disc);
        b.discMat.uniforms.uGain.value = strLit;
        b.rodMat.uniforms.uAmount.value = k * (b.mine ? 0 : 1 - disc);
        b.fit.material.opacity = k * 0.5 * strLit;
        if (b.ladder) b.ladder.material.opacity = k * 0.5 * Math.max(0.35, panel);
        if (b.app) {
          const sh = smooth(3, 6, n1 * 13);
          b.frameMat.uniforms.uAmount.value = k;
          b.shedMat.uniforms.uAmount.value = k * sh;
          b.plainMat.uniforms.uAmount.value = k * (1 - sh);
          b.frameEdges.material.opacity = k * 0.3;
        }
      }
      // your gantry rises, its strings come apart
      myBay.gantry.position.y = 600 * ex;
      const discTop = BEAM.y0 - 14; // in the gantry, which rises
      const pitch = STRING.pitch * (1 + 0.9 * ex);
      for (const m of myBay.discs) m.position.y = discTop - m.userData.k * pitch;
      myBay.fit.position.y = 600 * ex - (STRING.n - 1) * (pitch - STRING.pitch);
      markG.visible = mark > 0.003;
      markG.children[0].material.opacity = mark;
      markG.userData.ball.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(0.9 * mark);

      /* ── the conductors ── */
      const conductorsOn = a > 0 ? 1 : 0;
      const mineK = (1 - smooth(0, 0.35, ex)) * conductorsOn;
      hue.copy(SIGNAL).lerp(VEILLE, earthed);
      const mineLevel = 1.5 * live * (1 - earthed) + 0.85 * earthed;
      // what the sentence is about burns: your circuit and the neighbour's. The rest of the live poste (the other bays, the
      // busbars, the jumpers up to them) is a thin, low glow — and lower still in a wide shot (wide 0 near → 1 far)
      const wide = smooth(3500, 10000, camPos.distanceTo(tmp.set(800, 900, BAY.mine - 1200)));
      const restLevel = 0.11 * (1 - 0.55 * wide);
      const deadMine = 1.7 * (1 - 0.65 * Math.max(live, earthed));
      setWire(C.mineLine, { hueC: hue, level: mineLevel, dead: deadMine, ind: Math.min(1, induced) * (1 - earthed), surge: Math.max(0, induced - 1), amount: mineK, time });
      setWire(C.mineBay, { hueC: hue, level: mineLevel, dead: deadMine, amount: mineK, time });
      setWire(C.mineBus, { hueC: SIGNAL, level: restLevel * 1.6, dead: 0.6, amount: mineK, time });
      setWire(C.vois, { hueC: SIGNAL, level: 1.5 * vois, dead: 0.6, amount: conductorsOn, time });
      setWire(C.voisBus, { hueC: SIGNAL, level: restLevel * 1.6 * vois, dead: 0.6, amount: conductorsOn, time });
      setWire(C.bus, { hueC: SIGNAL, level: restLevel * 2, dead: 0.6, amount: conductorsOn * (0.5 + 0.5 * bays), time });
      setWire(C.others, { hueC: SIGNAL, level: restLevel, dead: 0.45, amount: bays * conductorsOn, time });
      setWire(C.othersFar, { hueC: SIGNAL, level: restLevel, dead: 0.45, amount: bays * conductorsOn, time });
      setWire(C.front, { hueC: SIGNAL, level: restLevel, dead: 0.45, amount: bays * conductorsOn * (1 - clamp01(p.cutaway ?? 0)), time });
      C.busParts.busMat.uniforms.uAmount.value = a;
      C.busParts.busChords.material.opacity = 0.42 * a;
      C.busParts.busLace.material.opacity = 0.24 * a * smooth(6, 14, sizePx(152, (BUS.x0 + BUS.x1) / 2, 400, -1200, 300, 400, 7200));
      C.fence.material.opacity = 0.3 * a;

      /* ── the ground: the pools under what burns, the rings, the cut ── */
      // earthed, your conductors still glow veille — on the gravel only a third of it: a light under them, never a green floor
      const mineHue = tmp.set(hue.r, hue.g, hue.b).multiplyScalar(mineLevel * mineK * (1 - 0.67 * earthed));
      groundU.uMineCol.value.copy(mineHue);
      groundU.uVoisCol.value.set(SIGNAL.r, SIGNAL.g, SIGNAL.b).multiplyScalar(1.5 * vois);
      groundU.uBusCol.value.set(SIGNAL.r, SIGNAL.g, SIGNAL.b).multiplyScalar(0.03);
      groundU.uAmount.value = 0.35 + 0.65 * a;
      const cutA = clamp01(p.cutaway ?? 0);
      const fault = clamp01(p.fault ?? 0);
      const bond = clamp01(p.bond ?? 0);
      groundU.uCut.value = cutA;
      groundU.uFault.value = fault;
      groundU.uBond.value = bond;
      groundU.uRingT.value = time * 0.4;
      cut.visible = cutA > 0.003;
      soilU.uAmount.value = cutA;
      cutEdges.material.opacity = 0.5 * cutA;
      floorMat.uniforms.uAmount.value = cutA;

      const meshSeen = Math.max(cutA, clamp01(p.mesh ?? 0), clamp01(p.current ?? 0), ex, named === 5 ? 1 : 0, fault * bond);
      meshG.visible = meshSeen > 0.003;
      meshG.position.y = -300 * ex;
      meshMat.uniforms.uSeen.value = meshSeen;
      meshMat.uniforms.uLit.value = Math.max(clamp01(p.mesh ?? 0), named === 5 ? 1 : 0, 0.8 * fault * bond) * (0.6 + 0.4 * meshSeen);
      meshMat.uniforms.uCurrent.value = clamp01(p.current ?? 0);
      meshMat.uniforms.uTime.value = time;

      /* ── the field, the coupling ── */
      const ef = clamp01(p.efield ?? 0);
      efield.visible = ef > 0.003;
      efield.material.uniforms.uLevel.value = 0.7 * ef;
      efield.material.uniforms.uTime.value = time;
      const cp = clamp01(p.couple ?? 0);
      couple.visible = cp > 0.003;
      couple.material.uniforms.uLevel.value = 1.15 * cp;
      couple.material.uniforms.uTime.value = time;

      /* ── the envelope, the zone ── */
      const env = clamp01(p.envelope ?? 0);
      envelope.visible = env > 0.003;
      envMat.uniforms.uAmount.value = env * (0.9 + 0.1 * Math.sin(time * 1.3));
      const zn = clamp01(p.zone ?? 0);
      zone.visible = zn > 0.003;
      zoneMat.uniforms.uAmount.value = zn * (0.92 + 0.08 * Math.sin(time * 1.1));
      zoneFloor.material.opacity = 0.7 * zn;

      /* ── you ── */
      const you = clamp01(p.you ?? 0);
      fig.group.visible = you > 0.003;
      let pose = null;
      if (fig.group.visible) {
        fig.body.uniforms.uAmount.value = you;
        fig.flesh.opacity = you;
        helmetMat.opacity = you;
        pose = poseYou(p);
        fig.group.updateMatrixWorld(true);
        fig.legs.L.foot.getWorldPosition(groundU.uFootA.value);
        fig.legs.R.foot.getWorldPosition(groundU.uFootB.value);
        feet.position.set(0, 0, 4);
      }
      // the step voltage between your feet, and the line from your hand to your feet (the touch voltage)
      const onGround = pose && pose.mode === "ground" ? 1 : 0;
      groundU.uStep.value = onGround * fault * (1 - bond) * you;
      const touch = onGround * smooth(1.3, 1.9, p.arms ?? 0) * smooth(0.9, 0.97, p.walk ?? 0);
      const pathK = p.path ?? fault * (1 - bond) * touch;
      pathLine.visible = fig.group.visible && pathK > 0.003;
      if (pathLine.visible) {
        let o = 0;
        for (const [A, B] of PATHPTS) {
          pathArr.array[o++] = A.x;
          pathArr.array[o++] = A.y;
          pathArr.array[o++] = A.z;
          pathArr.array[o++] = B.x;
          pathArr.array[o++] = B.y;
          pathArr.array[o++] = B.z;
        }
        pathArr.needsUpdate = true;
        pathLine.material.opacity = Math.min(1, pathK) * (0.85 + 0.15 * Math.sin(time * 2.0));
      }

      /* ── the gravel's resistance under your feet ── */
      const gv = clamp01(p.gravel ?? 0) * you;
      slab.visible = gv > 0.003 && onGround === 1;
      if (slab.visible) {
        const fa = groundU.uFootA.value;
        const fb = groundU.uFootB.value;
        slab.position.set((fa.x + fb.x) / 2, 0, (fa.z + fb.z) / 2);
        slabU.uC.value.set(slab.position.x, slab.position.z);
        slabU.uGravel.value = gv;
      }

      /* ── the arc: from the conductor toward your hand (it stops a few centimetres short) ── */
      const air = clamp01(p.airArc ?? 0);
      const arcOn = air > 0.003 && fig.group.visible;
      arcG.visible = arcRoot.visible = arcTip.visible = arcOn;
      if (arcOn) {
        fig.arms.R.hand.getWorldPosition(tB);
        tA.set(...ARC_FROM);
        tC.subVectors(tB, tA);
        const L = Math.max(10, tC.length() - 7);
        tC.normalize();
        arcG.position.copy(tA);
        q.setFromUnitVectors(ZAX, tC);
        arcG.quaternion.copy(q);
        arcG.scale.set(1, 1, L / ARC_L);
        const tension = smooth(0, 0.5, air);
        const fire = smooth(0.5, 0.62, air);
        const reveal = smooth(0.5, 0.75, air);
        const breathe = 0.75 + 0.25 * Math.sin(time * 2.3);
        tense.material.uniforms.uHue.value.copy(SIGNAL);
        tense.material.uniforms.uLevel.value = 0.9 * tension * (1 - fire) * breathe;
        tense.visible = tension * (1 - fire) > 0.003;
        for (const m of arcParts) {
          m.visible = fire > 0.003;
          m.material.uniforms.uLevel.value = fire * (0.88 + 0.12 * Math.sin(time * 9.0));
          m.material.uniforms.uReveal.value = reveal * 1.05;
          m.material.uniforms.uM.value = 0.5 + 0.5 * Math.sin(time * 1.7);
        }
        arcRoot.position.copy(tA);
        arcRoot.material.uniforms.uSize.value = lerp(60, 150, fire);
        arcRoot.material.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(0.5 * tension + 1.6 * fire);
        arcTip.position.copy(tA).addScaledVector(tC, L * Math.min(1, reveal * 1.05));
        arcTip.material.uniforms.uSize.value = 90;
        arcTip.material.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(1.3 * fire * smooth(0.6, 1, reveal));
      }

      /* ── the two chargés, the attestation ── */
      const ch = clamp01(p.chief ?? 0);
      for (const c of chiefs) {
        c.group.visible = ch > 0.003;
        c.body.uniforms.uAmount.value = ch;
        c.flesh.opacity = ch;
      }
      paper.visible = ch > 0.003;
      if (paper.visible) {
        paper.material.opacity = ch;
        posePaper(clamp01(p.paper ?? 0));
      }
    },
  };
}
