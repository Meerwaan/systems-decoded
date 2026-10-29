// DOSSIER L04 — the ship: the Charles de Gaulle seen like an X-ray, the sea and the sky around it.
// Built from 015's carrier.js know-how (a deck that is nothing but its paint, a hull of glass in fine lines, the sea and
// the sky on a dome drawn at infinity), re-set for this film: the whole ship, from 50 cm to 2.6 km, by day, at dusk and
// by night, outside and inside — the hangar, its lifts and its curtain, the anti-heel masses, the nuclear plant and its
// steam main, the fuel holds, the fire detectors, the fins, the hull cut across.
//
//   buildNavire() → { ship, sky, A, set(p, time, px) }
//     ship  Group, THE SHIP'S FRAME (plan.js: deck y = 0, bow −z, starboard +x). world.js puts it inside the heel group
//     sky   Group, LEVEL, same coordinates (not heeled): the sea and the sky dome, the hull's waterline skin that rides
//           the swell, the water seen in section under the cut
//     A     A.lifts[0], A.lifts[1] (the centre of each lift's platform, on its top: world.js hangs two aircraft on the
//           forward one), A.island (on top of the island), A.hangar (the hangar floor's centre), and A.bow, A.stern,
//           A.mast, A.plant, A.curtain, A.lights (the stern's drop lights)
//     set(p, time, px)  p = { amount, sea, night, lights, taxi, speed, wind, under, angled, cutaway, heel, masses,
//           massGlow, fins, lift, hangar, curtain, detectors, plant, feed, fuel, coast, swell, windAxis, mist } (FIRST in
//           world.js). Every key may be missing: its rest value then. Called sixteen times a frame: no allocation inside.
//
// THE HULL is built in the ship's frame directly (the keel is the z axis; the angled runway is what lies askew): on each
// side, rows from the deck's edge down to the keel, a station every metre or so. Above the waterline it is ONE shell of
// glass (asShell) with the island; below, a fainter glass that writes no depth: the sea is drawn over it from above, it
// shows when the camera is under the water (VIEW.fins).
//
// What hides what, by render order (nothing here can hide the systems or the aircraft):
//   −1e6 the probe: reads the camera once per draw (the lines' dosage by distance, under the water or not)
//   −5   the lid: the deck's darkness over the troughs and the brakes, `under` lifts it over the bow catapult and Andromède
//   3    lines (outline, hull, island, hangar, lifts, section)        7  the wind
//   44–50 what is INSIDE the hull, drawn first: fuel holds 44, reactor vessels 46, steam main 47, hangar shell 50
//   57   the deck, depth only: from above, the hull's own glass and lines stay under it, and so does the sea
//   58–60 the hull's lines under the deck, the hull and the island: ONE shell · 59 the hull under the water (no depth)
//   45   inside the shells: the curtain, the detectors, the reactors' cores · 48 the hangar floor
//   61   the deck's paint · 63 the lift platforms · 65 the night's lights
//   70   the waterline skin, the water in section · 100 the sea and the sky, last
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makePool } from "@kit/atmo.js";
import { makeStreaks } from "@kit/postes.js";
import { solid, asShell, lineMat, fatLine, anchor, box, cyl, makePart, addMesh } from "@kit/build3d.js";
import {
  SHIP, ANGLED, ANGLED_DIR, ANGLED_RIGHT, onAngled, CAT, STROKE, ISLAND, LIFTS, HANGAR, MASSES, PLANT, FUEL, FINS, BRINS, TOUCH, CABIN, CUT,
} from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const f = (v) => (Number.isInteger(v) ? `${v}.0` : `${v}`); // a number written for GLSL

/* ───────────────────────────────────────────────────────────── the plan of the hull */

const SLAB = SHIP.slab; //       the flight deck's edge, drawn
const CHINE = -760; //           where the overhang meets the hull's side (just under the hangar floor)
const SEA = SHIP.sea;
const KEEL = SHIP.keel;
const KEEL_AFT = -1720; //       the bottom rises toward the transom (the screws, the rudder)
const RAKE = 1700; //            how far aft of the deck's stem the keel's forefoot is
const CUTZ = CUT.z; // the cut across the hull: just ahead of the first row of masses (its block stays whole)
const SPEED = 700; //            cm/s the sea goes by: FIXED (a tween of `speed` must never make the water jump)
const ROLL_L = 11000; //         the long rollers of `swell`: wavelength (cm)…
const ROLL_W = 0.34; //          …and how fast their phase turns (rad/s: ≈ 6 m/s past the hull)
const ROLL_A = 210; //           …and their height at `swell` 1 (cm, half the trough-to-crest)
const STEM_WL = SHIP.bow + RAKE * (SEA / KEEL); // the stem at the waterline
/** The stem's line: where the bow is at height y (0 at the deck … KEEL at the forefoot). */
const zStem = (y) => SHIP.bow + RAKE * (Math.min(0, y) / KEEL);
/** The bottom, rising toward the transom. */
const yBottom = (z) => (z <= 9000 ? KEEL : KEEL + ((z - 9000) / (SHIP.stern - 9000)) * (KEEL_AFT - KEEL));
const yBilge = (z) => Math.min(Math.max(-2300, yBottom(z) + 130), SEA - 25);

// the deck's edge, on each side, from the outline of plan.js (half-beams, as [z, x] sorted by z)
const OUT = SHIP.deck;
const STAR = OUT.filter(([x], i) => x >= 0 && i >= 1 && i <= 8).map(([x, z]) => [z, x]).sort((a, b) => a[0] - b[0]);
const PORT = [...OUT.slice(8), OUT[0]].map(([x, z]) => [z, -x]).sort((a, b) => a[0] - b[0]);
// the hull below the overhang (half-beams at CHINE, at the waterline, at the bilge, and the flat of the bottom)
const MID = [[zStem(CHINE), 0], [-11500, 760], [-9500, 1300], [-6500, 1650], [-2000, 1760], [6000, 1760], [10000, 1680], [SHIP.stern, 1500]];
const WATER = [[STEM_WL, 0], [-11000, 560], [-9000, 1150], [-6000, 1500], [-2000, SHIP.halfWL], [6000, SHIP.halfWL], [10000, 1480], [SHIP.stern, 1250]];
const BILGE = [[zStem(-2300), 0], [-10500, 520], [-8500, 1080], [-5500, 1420], [5000, 1440], [9500, 1250], [12000, 1050], [SHIP.stern, 1050]];
const FLAT = [[zStem(KEEL), 0], [-9500, 300], [-6000, 750], [6000, 780], [10000, 860], [SHIP.stern, 1000]];
const at = (chain, z) => {
  if (z <= chain[0][0]) return chain[0][1];
  for (let i = 1; i < chain.length; i++) {
    const [z0, v0] = chain[i - 1];
    const [z1, v1] = chain[i];
    if (z <= z1) return z1 === z0 ? v1 : v0 + ((v1 - v0) * (z - z0)) / (z1 - z0);
  }
  return chain.at(-1)[1];
};
/** The rows of a section, top to bottom: [y, half-beam chain]. */
const ROWS = (side) => [
  [() => 0, side < 0 ? PORT : STAR],
  [() => -SLAB, side < 0 ? PORT : STAR],
  [() => CHINE, MID],
  [() => SEA, WATER],
  [yBilge, BILGE],
  [yBottom, FLAT],
];
/** One point of the hull: station z, row j, side ±1. Past the stem, the rows gather on its line. */
function hullPoint(z, j, side) {
  const [yf, chain] = ROWS(side)[j];
  const y = yf(z);
  const zs = zStem(y);
  if (z <= zs) return [0, y, zs];
  return [side * at(chain, z), y, z];
}
/** The hull's half-beam at height y and station z (interpolated through the rows): where the inside ends. */
function inside(z, y) {
  const rows = [0, -SLAB, CHINE, SEA, yBilge(z), yBottom(z)];
  const half = [Math.min(at(STAR, z), at(PORT, z)), Math.min(at(STAR, z), at(PORT, z)), at(MID, z), at(WATER, z), at(BILGE, z), at(FLAT, z)];
  for (let j = 1; j < rows.length; j++) if (y >= rows[j]) return half[j - 1] + ((half[j] - half[j - 1]) * (rows[j - 1] - y)) / Math.max(1, rows[j - 1] - rows[j]);
  return 0;
}

/* ───────────────────────────────────────────────────────────── small tools */

/** Split segments at the cut: [fore (z < CUTZ), aft]. */
function splitCut(segs) {
  const fore = [];
  const aft = [];
  for (let i = 0; i < segs.length; i += 6) {
    const a = segs.slice(i, i + 3);
    const b = segs.slice(i + 3, i + 6);
    if (a[2] >= CUTZ && b[2] >= CUTZ) aft.push(...a, ...b);
    else if (a[2] <= CUTZ && b[2] <= CUTZ) fore.push(...a, ...b);
    else {
      const t = (CUTZ - a[2]) / (b[2] - a[2]);
      const m = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, CUTZ];
      if (a[2] < CUTZ) fore.push(...a, ...m), aft.push(...m, ...b);
      else aft.push(...a, ...m), fore.push(...m, ...b);
    }
  }
  return [fore, aft];
}
const seg = (list, a, b) => {
  if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) > 1) list.push(...a, ...b);
};
const loop = (list, pts) => pts.forEach((p, i) => seg(list, p, pts[(i + 1) % pts.length]));
const boxEdges = (list, [x0, y0, z0], [x1, y1, z1]) => {
  const c = (i) => [i & 1 ? x1 : x0, i & 2 ? y1 : y0, i & 4 ? z1 : z0];
  for (const [i, j] of [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]]) seg(list, c(i), c(j));
};

/** A glass like the kit's (`glass`), that also knows the cut: ahead of it, it fades out then is gone. Its geometry is
 *  laid in the ship's frame (the mesh at identity), or it never comes near the cut. asShell-compatible. */
function glassMat(color, { base = 0.003, rim = 0.06, power = 3.2, edge = 0.035, through = 0 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uBase: { value: base }, uRim: { value: rim }, uPower: { value: power }, uAmount: { value: 1 },
      uEdge: { value: edge }, uSpec: { value: 0 }, uGain: { value: 1 }, uCut: { value: 0 }, uCutZ: { value: CUTZ },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vS;
      void main() {
        vS = position;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uBase, uRim, uPower, uAmount, uEdge, uGain, uSpec, uCut, uCutZ;
      varying vec3 vN; varying vec3 vV; varying vec3 vS;
      void main() {
        if (uAmount < 0.003) discard;
        float fore = step(vS.z, uCutZ);
        if (fore > 0.5 && uCut > 0.5) discard;
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float light = uBase + uRim * pow(g, uPower) + uEdge * smoothstep(0.6, 0.97, g);
        light *= 1.0 - fore * smoothstep(0.0, 0.5, uCut);
        gl_FragColor = vec4(uColor * light * uAmount * uGain, 1.0);
      }`,
  });
  mat.userData.through = through;
  return mat;
}

/** The GLSL every paint shares: a mark never thinner than `px` pixels each side (so ≥ 1.8 px), never wider than four,
 *  gone before a pixel covers 7 m; a span along an axis; boxes and segments. */
const PAINT_GLSL = /* glsl */ `
  float mark(float x, float size, float px) {
    float w = max(fwidth(x), 1e-4);
    float h = clamp(size, w * px, w * max(px, 4.0));
    return (1.0 - smoothstep(h - w * 0.75, h + w * 0.75, abs(x))) * (1.0 - smoothstep(700.0, 2600.0, w * px));
  }
  float span(float z, float from, float to) { float w = max(fwidth(z), 1.0); return smoothstep(from - w, from + w, z) * (1.0 - smoothstep(to - w, to + w, z)); }
  float sdBox(vec2 p, vec2 c, vec2 h) { vec2 d = abs(p - c) - h; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
`;
const RUN_GLSL = /* glsl */ `
  const vec2 RO = vec2(${f(ANGLED.origin[0])}, ${f(ANGLED.origin[2])});
  const vec2 RD = vec2(${f(ANGLED_DIR[0])}, ${f(ANGLED_DIR[2])});
  const vec2 RR = vec2(${f(ANGLED_RIGHT[0])}, ${f(ANGLED_RIGHT[2])});
  vec2 runway(vec2 q) { vec2 r = q - RO; return vec2(dot(r, RD), dot(r, RR)); } // (s along the runway, off to its right)
  // the windows "under" opens: around the bow catapult (its trough, valve and receiver) and around Andromède's brake
  float winBow(vec2 q) { return sdBox(q, vec2(${f(CAT[0].from[0])}, -8225.0), vec2(470.0, 5075.0)); }
  float winBrake(vec2 q) { return sdBox(runway(q), vec2(${f(BRINS.s[2])}, 0.0), vec2(700.0, 1500.0)); }
  // what the lid always keeps dark: the angled catapult's trough, the two other brakes
  float winOther(vec2 q) {
    vec2 r = runway(q);
    return min(sdBox(r, vec2(${f(11800 + STROKE / 2)}, 0.0), vec2(${f(STROKE / 2 + 500)}, 420.0)), sdBox(r, vec2(${f((BRINS.s[0] + BRINS.s[1]) / 2)}, 0.0), vec2(1300.0, 1500.0)));
  }
`;

/* The deck is its paint: the safety line along its edge, the two catapults' slots (a dark line between two fillets) and
   their lanes, the angled runway (its edges, its axis in wide dashes, the landing area, the stripes of the round-down),
   a coarse plating. Every mark keeps ≥ 1.8 px and leaves before it gets thinner; the axis's dashes melt into a steady
   line before their period gets under 14 px. Around the bow catapult and Andromède's brake, `under` makes it a pane. */
const paintMat = (poly) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uVeille: { value: VEILLE.clone() },
      uAmount: { value: 1 }, uUnder: { value: 0 }, uAngled: { value: 0 }, uNight: { value: 0 }, uCut: { value: 0 },
      uPoly: { value: poly },
    },
    vertexShader: /* glsl */ `
      varying vec3 vS;
      void main() { vS = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSignal, uVeille; uniform float uAmount, uUnder, uAngled, uNight, uCut;
      uniform vec2 uPoly[${poly.length}];
      varying vec3 vS;
      ${PAINT_GLSL}
      ${RUN_GLSL}
      float sdPoly(vec2 p) {
        float d = 1e12; float s = 1.0;
        for (int i = 0; i < ${poly.length}; i++) {
          int j = i == 0 ? ${poly.length - 1} : i - 1;
          vec2 vi = uPoly[i]; vec2 vj = uPoly[j];
          vec2 e = vj - vi; vec2 w = p - vi;
          vec2 b = w - e * clamp(dot(w, e) / max(dot(e, e), 1e-3), 0.0, 1.0);
          d = min(d, dot(b, b));
          bvec3 c = bvec3(p.y >= vi.y, p.y < vj.y, e.x * w.y > e.y * w.x);
          if (all(c) || all(not(c))) s *= -1.0;
        }
        return s * sqrt(d);
      }
      float level(vec2 p, float cell) {
        vec2 q = p / cell; vec2 fw = max(fwidth(q), vec2(1e-5));
        vec2 g = 1.0 - smoothstep(vec2(0.0), fw * 1.5, abs(fract(q - 0.5) - 0.5));
        return smoothstep(7.0, 24.0, 1.0 / max(fw.x, fw.y)) * max(g.x, g.y);
      }
      // a catapult's paint, in its own frame (a: metres along from where the shuttle waits, x: across)
      float catapult(float a, float x) {
        float on = span(a, -250.0, ${f(STROKE + 320)});
        float fillets = mark(abs(x) - 22.0, 3.5, 1.0) * 0.62;
        float lane = mark(abs(x) - 150.0, 4.0, 1.0) * 0.17;
        float ends = (mark(a + 250.0, 5.0, 1.0) + mark(a - ${f(STROKE + 320)}, 5.0, 1.0)) * (1.0 - smoothstep(150.0, 170.0, abs(x))) * 0.3;
        return on * (fillets + lane) + ends;
      }
      void main() {
        vec2 q = vS.xz;
        float fore = step(q.y, ${f(CUTZ)});
        if (fore > 0.5 && uCut > 0.5) discard;
        // the catapult cabin's glazed top (model.js) stands in the deck: no paint over its footprint
        if (abs(q.x - ${f(CABIN.at[0])}) < ${f(CABIN.size[0] / 2)} && abs(q.y - ${f(CABIN.at[2])}) < ${f(CABIN.size[2] / 2)}) discard;
        float inEdge = -sdPoly(q); // > 0 on the deck: the distance to its edge
        // the deck's edge: a safety line a metre and a half in, and at the bow the last metres before the sea, signal
        float edge = mark(inEdge - 140.0, 6.0, 1.0) * 0.3 * step(0.0, inEdge);
        float lip = (1.0 - smoothstep(30.0, 170.0, inEdge)) * (1.0 - smoothstep(-11900.0, -11200.0, q.y));
        // the two catapults
        float bow = catapult(${f(CAT[0].from[2])} - q.y, q.x - ${f(CAT[0].from[0])});
        vec2 c1 = q - vec2(${f(CAT[1].from[0])}, ${f(CAT[1].from[2])});
        float obl = catapult(dot(c1, RD), dot(c1, RR));
        // the angled runway
        vec2 r = runway(q);
        float onRun = span(r.x, 0.0, ${f(ANGLED.len)}) * (1.0 - smoothstep(${f(ANGLED.half)}, ${f(ANGLED.half + 20)}, abs(r.y)));
        float edges = mark(abs(r.y) - ${f(ANGLED.half)}, 7.0, 1.1) * span(r.x, 0.0, ${f(ANGLED.len)}) * 0.5;
        float per = 1200.0; float ds = max(fwidth(r.x), 1e-3);
        float dd = abs(fract(r.x / per) - 0.25) * per;
        float dash = 1.0 - smoothstep(0.25 * per - ds, 0.25 * per + ds, dd);
        dash = mix(0.5, dash, smoothstep(14.0, 40.0, per / ds));
        float axis = mark(r.y, 5.0, 1.0) * dash * span(r.x, 150.0, ${f(ANGLED.len - 100)}) * 0.42;
        float zone = mark(sdBox(r, vec2(${f((TOUCH.s - 700 + BRINS.s[2] + 900) / 2)}, 0.0), vec2(${f((BRINS.s[2] + 900 - TOUCH.s + 700) / 2)}, ${f(ANGLED.half - 260)})), 5.0, 1.0) * 0.22;
        float stripes = 0.0;
        for (int i = 0; i < 3; i++) stripes += mark(r.x - (360.0 + float(i) * 300.0), 45.0, 1.0);
        stripes *= (1.0 - smoothstep(${f(ANGLED.half - 300)}, ${f(ANGLED.half - 260)}, abs(r.y))) * 0.2;
        float threshold = mark(q.y - ${f(SHIP.stern - 260)}, 6.0, 1.1) * 0.34;
        float runPaint = edges + axis + zone + stripes;
        // the plating: one coarse level, and from high up a plate a shade lighter than the night
        float high = smoothstep(6000.0, 20000.0, cameraPosition.y);
        float plating = level(q, 2500.0) * 0.045 + high * (0.018 + 0.025 * onRun);
        // the panes "under" opens
        float pane = max(1.0 - smoothstep(-12.0, 12.0, winBow(q)), 1.0 - smoothstep(-12.0, 12.0, winBrake(q)));
        float frame = mark(min(abs(winBow(q)), abs(winBrake(q))), 8.0, 1.1) * 0.34;
        float dim = 1.0 - 0.45 * uNight;
        float keep = 1.0 - 0.72 * pane * uUnder;
        vec3 col = uInk * ((edge + bow + obl + threshold + plating) * keep * dim);
        col += mix(uInk, uVeille, uAngled) * runPaint * keep * (dim + 0.9 * uAngled);
        col += uInk * smoothstep(0.25, 1.0, uUnder) * frame;
        col += uSignal * lip * 0.45;
        col *= 1.0 - fore * smoothstep(0.0, 0.5, uCut);
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });

/* What the deck hides of what lies under it: the scene's own dark laid over the troughs and the brakes (it only ever
   darkens SOLIDS standing under the deck: it is drawn before every line, glow and glass, and tests its depth). */
const lidMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(BRAND.bg) }, uUnder: { value: 0 }, uAmount: { value: 1 }, uCut: { value: 0 } },
    vertexShader: /* glsl */ `varying vec3 vS; void main() { vS = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uUnder, uAmount, uCut; varying vec3 vS;
      float sdBox(vec2 p, vec2 c, vec2 h) { vec2 d = abs(p - c) - h; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
      ${RUN_GLSL}
      void main() {
        vec2 q = vS.xz;
        if (q.y < ${f(CUTZ)} && uCut > 0.5) discard;
        float open = (1.0 - smoothstep(0.0, 1.0, uUnder));
        float a = max(max(1.0 - smoothstep(-60.0, 40.0, winBow(q)), 1.0 - smoothstep(-60.0, 40.0, winBrake(q))) * open, 1.0 - smoothstep(-60.0, 40.0, winOther(q)));
        if (a * uAmount < 0.002) discard;
        gl_FragColor = vec4(uColor, a * uAmount);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the sea and the sky

   Drawn at infinity, after everything (what wrote its depth hides them). The sea is where each ray of the eye meets the
   plane SHIP.sea: the chop in four sizes (each leaves before its lines get too close), sliding astern at a FIXED speed;
   the long rollers of `swell` (broad lit faces, not lines); the wake astern of the transom and the bow's wave (wide
   streaks that slide along themselves); ahead of the bow, on the catapult's axis, the threat at dawn: a low signal light on
   the water under a glow on the horizon — wide enough to stand behind the aircraft seen from abeam. `night` blacks it
   out, `mist` brings a haze on the horizon, `coast` a dark line of land with a few lights. Under the water (VIEW.fins):
   the surface seen from below, its window on the sky, the water's haze. */
const backdropMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uAmount: { value: 1 }, uTravel: { value: 0 }, uRollT: { value: 0 },
      uNight: { value: 0 }, uSpeed: { value: 0.4 }, uSwell: { value: 0.2 }, uMist: { value: 0 }, uCoast: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position; // the dome follows the eye and never turns: the horizon stays level, and stays far
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSignal; uniform float uAmount, uTravel, uRollT, uNight, uSpeed, uSwell, uMist, uCoast;
      varying vec3 vDir;
      const float SEA = ${f(SEA)};
      float crest(vec2 s, float cell) {
        float bend = min(cell, 3000.0) * (0.16 * sin(s.y / (cell * 2.3) + 1.3) + 0.1 * sin(s.y / (cell * 0.9) + s.x / (cell * 3.1)));
        float q = (s.x + 0.32 * s.y + bend) / cell;
        float fw = max(fwidth(q), 1e-5);
        float id = floor(q + 0.5);
        float gap = smoothstep(0.2, 0.65, 0.5 + 0.5 * sin(s.y / (cell * 1.7) + id * 2.399));
        return smoothstep(5.0, 14.0, 1.0 / fw) * gap * (1.0 - smoothstep(0.0, fw * 2.0, abs(fract(q - 0.5) - 0.5)));
      }
      float stratum(vec3 d, float h, float height, float far, float width, float k1, float k2, float phase) {
        float az = atan(d.x, d.z + 1e-6);
        float wisp = smoothstep(0.35, 0.9, 0.5 + 0.5 * sin(az * k1 + phase) * sin(az * k2 + phase * 1.7));
        float x = (d.y - (height - h) / far) / width;
        return exp(-x * x) * wisp;
      }
      float hash(float n) { return fract(sin(n * 127.1 + 3.7) * 43758.5453); }
      // the rollers: the very phase the waterline skin rides (the same numbers)
      float rollers(vec2 p) {
        float ph = (p.y * 0.94 + p.x * 0.34) / ${f(ROLL_L)} * 6.2831853 + uRollT;
        float pw = max(fwidth(ph), 1e-5);
        return smoothstep(18.0, 50.0, 6.2831853 / pw) * pow(clamp(0.5 + 0.5 * sin(ph), 0.0, 1.0), 5.0);
      }
      void main() {
        vec3 d = normalize(vDir);
        float day = 1.0 - uNight;
        float hcam = cameraPosition.y - SEA;
        vec3 col = vec3(0.0);
        if (hcam > 0.0) {
          float below = smoothstep(0.0, 0.0015, -d.y);
          float t = hcam / max(-d.y, 1e-4);
          vec2 p = cameraPosition.xz + d.xz * t; // where the ray meets the water: (x, z)
          vec2 k = vec2(-p.y, p.x); //              (forward, to starboard)
          vec2 s = vec2(k.x + uTravel, k.y);
          float chop = max(max(crest(s, 620.0) * 0.5, crest(s, 2480.0) * 0.72), max(crest(s, 9920.0) * 0.9, crest(s, 39680.0)));
          float graze = 0.42 + 0.58 * pow(clamp(1.0 + d.y, 0.0, 1.0), 6.0);
          float far = exp(-t / 900000.0) * exp(-t * uMist / 90000.0);
          float roll = uSwell * rollers(p);
          // the wake, astern of the transom, along the catapult's axis… and the bow's wave, folded along the hull
          float aft = p.y - ${f(SHIP.stern)};
          float halfW = 1250.0 + 0.1 * max(aft, 0.0);
          float inWake = smoothstep(-300.0, 900.0, aft) * (1.0 - smoothstep(halfW * 0.55, halfW, abs(p.x))) * exp(-max(aft, 0.0) / (30000.0 + 60000.0 * uSpeed));
          float sq = p.x / 300.0 + 0.16 * sin(s.x / 1500.0) + 0.1 * sin(s.x / 610.0 + p.x / 400.0);
          float sfw = max(fwidth(sq), 1e-5);
          float foam = smoothstep(0.2, 0.7, 0.5 + 0.5 * sin(s.x / 1300.0 + floor(sq + 0.5) * 2.399));
          float streaks = smoothstep(4.0, 12.0, 1.0 / sfw) * foam * (1.0 - smoothstep(0.0, sfw * 2.0, abs(fract(sq - 0.5) - 0.5)));
          float wake = inWake * (0.8 * streaks + 0.16) * (0.35 + 0.65 * uSpeed);
          float dz = p.y - ${f(STEM_WL)};
          float hb = ${f(SHIP.halfWL)} * sqrt(clamp(dz / 7000.0, 0.0, 1.0));
          float arm = abs(p.x) - max(hb * 1.15 + 260.0, 0.36 * max(dz, 0.0) + 200.0); // it leaves the hull at once: it must show beside it
          float w = 200.0 + 0.05 * max(dz, 0.0);
          float bowWave = exp(-arm * arm / (w * w)) * smoothstep(-300.0, 250.0, dz) * exp(-max(dz, 0.0) / (4000.0 + 10000.0 * uSpeed));
          bowWave *= 0.62 + 0.38 * sin((dz + uTravel) / 850.0 + abs(p.x) / 520.0);
          float collar = exp(-(dz * dz + p.x * p.x) / (320.0 * 320.0)) * smoothstep(-500.0, 0.0, dz);
          float bowK = uSpeed * uSpeed * (bowWave * 0.55 + collar * 0.3);
          col += uInk * (chop * 0.13 * graze * (0.35 + 0.65 * day) + roll * 0.15 * graze + wake * 0.3 + bowK) * far * below;
          // ahead of the bow, on the catapult's axis: the light on the water (the sea you fall into)
          float dA = ${f(SHIP.bow)} - p.y;
          float wide = 420.0 + 0.045 * max(dA, 0.0);
          float lat = (p.x - ${f(CAT[0].from[0])}) / wide;
          float c = (dA - 11000.0) / 7000.0;
          float run = smoothstep(1200.0, 7000.0, dA) * exp(-max(dA - 9000.0, 0.0) / 80000.0);
          float path = run * exp(-lat * lat * 1.6) * (0.1 + 0.45 * exp(-c * c) + 1.5 * chop);
          col += uSignal * path * 0.85 * below * day * far;
          // the horizon: a line and the air above it; strata of cloud; dead ahead, the dawn, and its glow along the horizon
          float air = (0.11 * exp(-abs(d.y) / 0.0018) + step(0.0, d.y) * 0.028 * exp(-d.y / 0.11)) * (0.32 + 0.68 * day);
          air += uMist * (0.07 * exp(-abs(d.y) / 0.03) + 0.015);
          float cloud = (stratum(d, hcam, 30000.0, 500000.0, 0.0026, 9.0, 23.0, 0.6) * 0.06
            + stratum(d, hcam, 90000.0, 900000.0, 0.004, 7.0, 17.0, 2.1) * 0.045
            + stratum(d, hcam, 220000.0, 1500000.0, 0.006, 5.0, 13.0, 4.0) * 0.035) * day * (1.0 - 0.6 * uMist);
          float az = atan(d.x, -d.z + 1e-6); // 0 dead ahead (the bow)
          float ahead = step(0.0, -d.z);
          float dawn = ahead * ((0.5 * exp(-az * az / 0.0025) + 0.08 * exp(-abs(az) / 0.15)) * exp(-abs(d.y) / 0.008)
            + 0.07 * exp(-az * az / 0.03) * step(0.0, d.y) * exp(-d.y / 0.06));
          float glow = 0.3 * exp(-abs(az) / 0.9) * exp(-abs(d.y) / 0.02) * (0.4 + 0.6 * step(0.0, d.y));
          float sky = step(0.0, d.y);
          col += uInk * (air + cloud * sky) + uSignal * day * (1.0 - 0.5 * uMist) * (dawn * 0.9 + glow + cloud * sky * ahead * exp(-az * az / 0.06) * 1.6);
          // a coast, far to port and ahead: a dark line of land against the air, and a few lights along it
          if (uCoast > 0.001) {
            float caz = az + 0.75;
            float inC = 1.0 - smoothstep(0.42, 0.55, abs(caz));
            float hl = 0.0014 + 0.0022 * (0.5 + 0.5 * sin(caz * 17.0 + 1.3)) * (0.6 + 0.4 * sin(caz * 41.0));
            float fy = max(fwidth(d.y), 1e-6);
            float land = inC * smoothstep(-fy, fy, d.y) * (1.0 - smoothstep(hl - fy, hl + fy, d.y));
            col *= 1.0 - 0.85 * land * uCoast;
            float rim = inC * exp(-pow((d.y - hl) / (fy * 1.3), 2.0)) * 0.05;
            float cell = caz * 140.0;
            float fa = max(fwidth(cell), 1e-5);
            float lx = (fract(cell) - 0.5) / fa;
            float ly = (d.y - 0.0006) / fy;
            float lamp = step(0.7, hash(floor(cell))) * exp(-(lx * lx + ly * ly) / 2.2) * smoothstep(3.0, 9.0, 1.0 / fa);
            col += uInk * (rim + lamp * 1.3) * inC * uCoast * (1.0 - 0.7 * uMist);
          }
        } else {
          // under the water: the surface from below, its window on the sky, the haze of the water
          float up = smoothstep(0.0, 0.004, d.y);
          float t = -hcam / max(d.y, 1e-4);
          vec2 p = cameraPosition.xz + d.xz * t;
          vec2 s = vec2(-p.y + uTravel, p.x);
          float chop = max(crest(s, 2480.0) * 0.7, crest(s, 9920.0));
          float roll = uSwell * rollers(p);
          float window = smoothstep(0.6, 0.72, d.y);
          float far = exp(-t / 250000.0);
          col += uInk * up * far * (chop * 0.07 + roll * 0.16 + window * (0.03 + 0.04 * day));
          col += uInk * 0.028 * exp(-abs(d.y) / 0.22);
        }
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── points of light

   A light is a core and a halo, camera-facing, never smaller than `minCore` / `minHalo` pixels (far away it stays a
   light, close by it is its true size). Nothing in time makes them vary: no twinkle. `mist` swells the halos and fades
   the far ones. `wave` (≥ 0) lights them one after the other by their own order (aA.z), never in a blink. */
function makeLights(points, { color = BRAND.ink, core = 6, halo = 40, minCore = 1.6, minHalo = 6, kCore = 2.2, kHalo = 0.45, order = 65 } = {}) {
  const n = points.length;
  const quad = new THREE.PlaneGeometry(2, 2);
  const g = new THREE.InstancedBufferGeometry();
  g.index = quad.index;
  g.setAttribute("position", quad.getAttribute("position"));
  const aP = new Float32Array(n * 3);
  const aA = new Float32Array(n * 4);
  points.forEach((p, i) => {
    aP.set([p[0], p[1], p[2]], i * 3);
    aA.set([core * (p[4] ?? 1), halo * (p[4] ?? 1), p[3] ?? -1, p[5] ?? 1], i * 4);
  });
  g.setAttribute("aP", new THREE.InstancedBufferAttribute(aP, 3));
  g.setAttribute("aA", new THREE.InstancedBufferAttribute(aA, 4));
  g.instanceCount = n;
  const uniforms = {
    uColor: { value: new THREE.Color(color) }, uAmount: { value: 0 }, uMist: { value: 0 }, uWave: { value: -1 },
    uMinCore: { value: minCore }, uMinHalo: { value: minHalo }, uCore: { value: kCore }, uHalo: { value: kHalo },
    uCut: { value: 0 }, uRes: { value: new THREE.Vector2(BRAND.W, BRAND.H) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec3 aP; attribute vec4 aA;
      uniform float uAmount, uMist, uWave, uMinCore, uMinHalo, uCut; uniform vec2 uRes;
      varying vec2 vQ; varying float vCore; varying float vI;
      void main() {
        vec4 mv = modelViewMatrix * vec4(aP, 1.0);
        vec4 c = projectionMatrix * mv;
        float dist = -mv.z;
        float pxcm = projectionMatrix[1][1] * uRes.y * 0.5 / max(dist, 1.0);
        float swell = 1.0 + 1.6 * uMist;
        float halo = max(aA.y * pxcm, uMinHalo) * swell;
        float core = min(max(aA.x * pxcm, uMinCore), halo * 0.6);
        vCore = core / halo;
        float on = aA.z < 0.0 ? 1.0 : smoothstep(aA.z - 0.06, aA.z, uWave);
        float cut = aP.z < ${f(CUTZ)} ? 1.0 - smoothstep(0.0, 0.5, uCut) : 1.0;
        vI = uAmount * on * aA.w * cut * exp(-dist * uMist / 70000.0);
        vQ = position.xy;
        c.xy += position.xy * halo * 2.0 / uRes * c.w;
        if (dist < 5.0 || vI < 0.002) c = vec4(2.0, 2.0, 2.0, 1.0);
        gl_Position = c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uCore, uHalo;
      varying vec2 vQ; varying float vCore; varying float vI;
      void main() {
        float r = length(vQ);
        if (r > 1.0) discard;
        float rc = r / max(vCore, 1e-3);
        float core = exp(-rc * rc * 2.2);
        float halo = pow(clamp(1.0 - r, 0.0, 1.0), 2.6);
        gl_FragColor = vec4(uColor * (core * uCore + halo * uHalo) * vI, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the ship */

export function buildNavire() {
  const ship = new THREE.Group();
  const sky = new THREE.Group();
  const A = {};
  const fx = {};
  const R = rng(104);

  /* ── the dosage of every line: what set() wants × what the distance allows (the probe, once per draw) ── */
  const LINES = []; // { mat, kind, fore, obj }
  const want = {}; //  per kind, written by set()
  const far = { k: 1, inner: 1, below: 0, night: 0, paint: 1 };
  const lines = (segs, { color = BRAND.ink, width = 2, opacity = 0.5, order = 3, kind, parent = ship, hdr, cut = true }) => {
    const parts = cut ? splitCut(segs) : [[], segs];
    const out = [];
    parts.forEach((list, i) => {
      if (!list.length) return;
      const mat = lineMat(color, width, { opacity, hdr });
      const geo = new LineSegmentsGeometry();
      geo.setPositions(list);
      const obj = new LineSegments2(geo, mat);
      obj.frustumCulled = false;
      obj.renderOrder = order;
      parent.add(obj);
      LINES.push({ mat, kind, fore: i === 0, obj, base: opacity });
      out.push(obj);
    });
    return out;
  };

  const probe = new THREE.Mesh(
    new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0, 0, 0, 0], 3)),
    new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, depthTest: false }),
  );
  probe.frustumCulled = false;
  probe.renderOrder = -1e6;
  sky.add(probe);

  /* ═════════════════════ the hull ═════════════════════ */
  const stations = [
    ...new Set(
      [...STAR, ...PORT, ...MID, ...WATER, ...BILGE, ...FLAT]
        .map(([z]) => Math.round(z))
        .concat(Array.from({ length: 27 }, (_, i) => -13000 + i * 1000), [CUTZ, SHIP.bow, SHIP.stern, 9000]),
    ),
  ]
    .filter((z) => z >= SHIP.bow && z <= SHIP.stern)
    .sort((a, b) => a - b);
  const upperPanes = [];
  const lowerPanes = [];
  const hullUnder = []; // the deck edge's underside and the waterline: they stay under the deck seen from above
  const hullRibs = [];
  const lowLines = [];
  const mesh = (pos, index, crease) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(index);
    return toCreasedNormals(geo, crease * DEG);
  };
  for (const side of [-1, 1]) {
    const rows = stations.map((z) => [0, 1, 2, 3, 4, 5].map((j) => hullPoint(z, j, side)));
    const up = { pos: rows.map((r) => r.slice(0, 4)).flat(2), index: [] };
    const lo = { pos: rows.map((r) => r.slice(3, 6)).flat(2), index: [] };
    for (let i = 0; i < rows.length - 1; i++) {
      for (let j = 0; j < 3; j++) {
        const a = i * 4 + j;
        up.index.push(a, a + 4, a + 1, a + 1, a + 4, a + 5);
      }
      for (let j = 0; j < 2; j++) {
        const a = i * 3 + j;
        lo.index.push(a, a + 3, a + 1, a + 1, a + 3, a + 4);
      }
      seg(hullUnder, rows[i][1], rows[i + 1][1]);
      seg(hullUnder, rows[i][3], rows[i + 1][3]);
      seg(hullRibs, rows[i][2], rows[i + 1][2]);
      seg(lowLines, rows[i][4], rows[i + 1][4]);
      seg(lowLines, rows[i][5], rows[i + 1][5]);
    }
    rows.forEach((r, i) => {
      const z = stations[i];
      if (z % 2000 === 0 && z > SHIP.bow + 1500 && z < SHIP.stern - 500) {
        for (let j = 0; j < 3; j++) seg(hullRibs, r[j], r[j + 1]);
        if (z % 4000 === 0) for (let j = 3; j < 5; j++) seg(lowLines, r[j], r[j + 1]);
      }
    });
    upperPanes.push(mesh(up.pos, up.index, 36));
    lowerPanes.push(mesh(lo.pos, lo.index, 36));
  }
  // the bottom between the two flats
  {
    const pos = [];
    const index = [];
    stations.forEach((z, i) => {
      pos.push(...hullPoint(z, 5, -1), ...hullPoint(z, 5, 1));
      if (i < stations.length - 1) index.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
    });
    lowerPanes.push(mesh(pos, index, 36));
  }
  // the stem, the transom (above and below the water), and the round-down over the transom
  for (let i = 0; i < 6; i++) seg(i < 3 ? hullUnder : lowLines, [0, [0, -SLAB, CHINE, SEA, -2300, KEEL][i], zStem([0, -SLAB, CHINE, SEA, -2300, KEEL][i])], [0, [-SLAB, CHINE, SEA, -2300, KEEL, KEEL][i], zStem([-SLAB, CHINE, SEA, -2300, KEEL, KEEL][i])]);
  const T = [-1, 1].map((s) => [0, 1, 2, 3, 4, 5].map((j) => hullPoint(SHIP.stern, j, s)));
  const shapeAt = (pts) => {
    const geo = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))));
    return geo.translate(0, 0, SHIP.stern);
  };
  upperPanes.push(shapeAt([...T[0].slice(0, 4), ...T[1].slice(0, 4).reverse()]));
  lowerPanes.push(shapeAt([...T[0].slice(3), ...T[1].slice(3).reverse()]));
  for (const row of T) for (let j = 0; j < 5; j++) seg(j < 3 ? hullUnder : lowLines, row[j], row[j + 1]);
  seg(hullUnder, T[0][3], T[1][3]);
  seg(lowLines, T[0][5], T[1][5]);
  const ROUND = 260;
  const roll = [...Array.from({ length: 7 }, (_, i) => [ROUND * Math.sin(i * 15 * DEG), -ROUND * (1 - Math.cos(i * 15 * DEG))]), [ROUND, -ROUND - 70], [0, -ROUND - 320]];
  const [xp, xs] = [OUT[0][0], OUT[1][0]];
  {
    const pos = [];
    const index = [];
    roll.forEach(([dz, y], i) => {
      pos.push(xp, y, SHIP.stern + dz, xs, y, SHIP.stern + dz);
      if (i < roll.length - 1) index.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
    });
    upperPanes.push(mesh(pos, index, 50));
  }
  const rolled = [];
  for (const i of [3, 6]) seg(rolled, [xp, roll[i][1], SHIP.stern + roll[i][0]], [xs, roll[i][1], SHIP.stern + roll[i][0]]);
  for (const x of [xp, xs]) for (let i = 0; i < roll.length - 1; i++) seg(rolled, [x, roll[i][1], SHIP.stern + roll[i][0]], [x, roll[i + 1][1], SHIP.stern + roll[i + 1][0]]);

  fx.hull = glassMat(BRAND.ink, { base: 0.003, rim: 0.06, power: 3.2, edge: 0.035, through: 0.3 });
  fx.low = glassMat(BRAND.ink, { base: 0.002, rim: 0.05, power: 3.0, edge: 0.03 });
  const shell = upperPanes.map((geo) => new THREE.Mesh(geo, fx.hull));
  for (const m of shell) {
    m.frustumCulled = false;
    ship.add(m);
  }
  const lowHull = new THREE.Group();
  for (const geo of lowerPanes) {
    const m = new THREE.Mesh(geo, fx.low);
    m.frustumCulled = false;
    m.renderOrder = 59;
    lowHull.add(m);
  }
  ship.add(lowHull);

  /* ═════════════════════ the island: blocks of glass, the bridges' windows, a mast of a few thick tubes ═════════════════════ */
  fx.island = glassMat(BRAND.ink, { base: 0.003, rim: 0.07, power: 2.6, edge: 0.04, through: 0.2 });
  const ix = (ISLAND.x[0] + ISLAND.x[1]) / 2;
  const iz = (ISLAND.z[0] + ISLAND.z[1]) / 2;
  const islandLines = [];
  const windows = [];
  const islandMeshes = [];
  // [width (x), height, length (z), centre x, centre y, centre z]
  const BLOCKS = [
    [ISLAND.x[1] - ISLAND.x[0], 700, ISLAND.z[1] - ISLAND.z[0], ix, 350, iz], //          the base, on the deck
    [700, 460, 2300, ix + 20, 930, iz + 150], //                                          the deck of the bridges
    [780, 270, 1150, ix, 1295, ISLAND.z[0] + 650], //                                     the navigation bridge, forward, overhanging
    [300, 250, 900, ISLAND.x[0] - 60, 1285, iz + 700], //                                 the aviation bridge: it looks at the deck
    [480, 320, 700, ix + 60, 1320, iz + 350], //                                          a block behind it
    [260, 520, 260, ix, 1660, iz - 300], //                                               the mast's foot
    [440, 40, 440, ix, 2520, iz - 300], //                                                a platform up the mast
  ];
  for (const [w, h, l, x, y, z] of BLOCKS) {
    const geo = new THREE.BoxGeometry(w, h, l).translate(x, y, z);
    islandMeshes.push(new THREE.Mesh(geo, fx.island));
    boxEdges(islandLines, [x - w / 2, y - h / 2, z - l / 2], [x + w / 2, y + h / 2, z + l / 2]);
  }
  // the mast and its yard: tubes, thick (no lattice for the camera to cross)
  const tube = (r, h, x, y, z, rotZ = 0) => {
    const geo = new THREE.CylinderGeometry(r, r, h, 20, 1);
    if (rotZ) geo.rotateZ(rotZ);
    geo.translate(x, y, z);
    islandMeshes.push(new THREE.Mesh(geo, fx.island));
  };
  tube(48, ISLAND.mast - 1900, ix, (1900 + ISLAND.mast) / 2, iz - 300);
  tube(26, 1000, ix, 3050, iz - 300, Math.PI / 2);
  seg(islandLines, [ix, 1900, iz - 300], [ix, ISLAND.mast, iz - 300]);
  seg(islandLines, [ix - 500, 3050, iz - 300], [ix + 500, 3050, iz - 300]);
  for (const [r, x, y, z] of [[190, ix, 1430 + 175, ISLAND.z[0] + 500], [130, ix, 2560 + 125, iz - 300]]) {
    const geo = new THREE.SphereGeometry(r, 36, 22).translate(x, y, z);
    islandMeshes.push(new THREE.Mesh(geo, fx.island));
  }
  // the bands of windows: the navigation bridge all around, the aviation bridge on its deck side
  for (const [w, l, x, y, z] of [[780, 1150, ix, 1330, ISLAND.z[0] + 650], [300, 900, ISLAND.x[0] - 60, 1320, iz + 700]]) {
    for (const dy of [-55, 40]) {
      const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => [x + (sx * w * 1.006) / 2, y + dy, z + (sz * l * 1.006) / 2]);
      loop(windows, c);
    }
  }
  for (const m of islandMeshes) {
    m.frustumCulled = false;
    ship.add(m);
  }
  asShell([...shell, ...islandMeshes], 60);
  A.island = anchor(ship, ix, ISLAND.h, iz);
  A.mast = anchor(ship, ix, ISLAND.mast, iz - 300);

  /* ═════════════════════ the lines of the hull and the deck ═════════════════════ */
  const outline = [];
  const bowEdge = [];
  OUT.forEach((p, i) => {
    const q = OUT[(i + 1) % OUT.length];
    seg(p[1] < -11300 && q[1] < -11300 ? bowEdge : outline, [p[0], 0.6, p[1]], [q[0], 0.6, q[1]]);
  });
  // the nets hung outside the angled deck's overhang, to port (a few posts, wide apart)
  const nets = [];
  for (let i = 10; i <= 14; i++) {
    const a = OUT[i];
    const b = OUT[i + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
    const outP = (x, z) => [x + n[0] * 170, -55, z + n[1] * 170];
    const count = Math.max(1, Math.round(len / 900));
    for (let k = 0; k <= count; k++) {
      const x = a[0] + ((b[0] - a[0]) * k) / count;
      const z = a[1] + ((b[1] - a[1]) * k) / count;
      seg(nets, [x, -12, z], outP(x, z));
    }
    seg(nets, outP(a[0], a[1]), outP(b[0], b[1]));
  }
  lines(outline, { width: 2.4, opacity: 0.85, kind: "outline" });
  lines(bowEdge, { color: BRAND.signal, width: 3, opacity: 0.95, hdr: 1.4, kind: "bow" });
  lines(rolled, { width: 2, opacity: 0.5, kind: "outline" });
  lines(nets, { width: 1.8, opacity: 0.22, kind: "hull" });
  lines(hullUnder, { width: 2, opacity: 0.42, order: 58, kind: "hull" });
  lines(hullRibs, { width: 1.8, opacity: 0.2, order: 58, kind: "inner" });
  lines(lowLines, { width: 1.8, opacity: 0.3, order: 59, kind: "low" });
  lines(islandLines, { width: 2, opacity: 0.4, kind: "island" });
  lines(windows, { width: 2.6, opacity: 0.95, kind: "windows" });

  /* ═════════════════════ the deck: what it hides, and its paint ═════════════════════ */
  const deckGeo = new THREE.ShapeGeometry(new THREE.Shape(OUT.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2);
  fx.hold = new THREE.ShaderMaterial({
    colorWrite: false,
    depthWrite: true,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 24,
    uniforms: { uCut: { value: 0 } },
    vertexShader: /* glsl */ `varying vec3 vS; void main() { vS = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `uniform float uCut; varying vec3 vS; void main() { if (vS.z < ${f(CUTZ)} && uCut > 0.5) discard; gl_FragColor = vec4(0.0); }`,
  });
  fx.hold.transparent = true; // drawn in order with the glass (57), not with the solids
  const hold = new THREE.Mesh(deckGeo, fx.hold);
  hold.position.y = -8;
  hold.renderOrder = 57;
  hold.frustumCulled = false;
  fx.paint = paintMat(OUT.map(([x, z]) => new THREE.Vector2(x, z)));
  const paint = new THREE.Mesh(deckGeo, fx.paint);
  paint.position.y = 1.2;
  paint.renderOrder = 61;
  paint.frustumCulled = false;
  fx.lid = lidMat();
  const lid = new THREE.Mesh(deckGeo, fx.lid);
  lid.position.y = -5;
  lid.renderOrder = -5;
  lid.frustumCulled = false;
  lid.onBeforeRender = (renderer, scene) => {
    if (scene.background?.isColor) fx.lid.uniforms.uColor.value.copy(scene.background); // the scene's own dark, whatever the mood made it
  };
  ship.add(hold, paint, lid);

  /* ═════════════════════ the hangar: its volume, its floor in a grid, its lights, its doors to the lifts, its curtain ═════════════════════ */
  const hangar = new THREE.Group();
  ship.add(hangar);
  const [hx0, hx1] = HANGAR.x;
  const [hz0, hz1] = HANGAR.z;
  const H0 = HANGAR.floor;
  const H1 = HANGAR.ceil;
  fx.hangarGlass = glassMat(BRAND.ink, { base: 0.004, rim: 0.07, power: 2.8, edge: 0.04 });
  const hangarBox = new THREE.Mesh(new THREE.BoxGeometry(hx1 - hx0, H1 - H0, hz1 - hz0).translate(0, (H0 + H1) / 2, (hz0 + hz1) / 2), fx.hangarGlass);
  hangarBox.frustumCulled = false;
  hangar.add(hangarBox);
  asShell(hangarBox, 50);
  const hangarLines = [];
  boxEdges(hangarLines, [hx0, H0, hz0], [hx1, H1, hz1]);
  for (let z = hz0 + 2000; z < hz1 - 500; z += 2000) loop(hangarLines, [[hx0, H0, z], [hx0, H1, z], [hx1, H1, z], [hx1, H0, z]]); // the frames
  const doors = [];
  for (const l of LIFTS) {
    const [z0, z1] = [l.z[0] + 150, l.z[1] - 150];
    loop(doors, [[hx1, H0, z0], [hx1, H1 - 40, z0], [hx1, H1 - 40, z1], [hx1, H0, z1]]);
    // the passage out to the lift: its floor and its lintel, through the hull's side
    for (const z of [z0, z1]) seg(doors, [hx1, H0, z], [l.x[0], H0, z]), seg(doors, [hx1, H1 - 40, z], [l.x[0], H1 - 40, z]);
    loop(doors, [[l.x[0], H0, z0], [l.x[0], H1 - 40, z0], [l.x[0], H1 - 40, z1], [l.x[0], H0, z1]]);
  }
  const strips = [];
  for (const x of [-950, 0, 950]) seg(strips, [x, H1 - 12, hz0 + 300], [x, H1 - 12, hz1 - 300]);
  lines(hangarLines, { width: 2, opacity: 0.4, kind: "hangar", parent: hangar });
  lines(doors, { width: 2.2, opacity: 0.6, kind: "doors", parent: hangar });
  lines(strips, { width: 2.6, opacity: 0.7, kind: "strips", parent: hangar });
  // the floor: a grid that leaves before its cells get too small (no shimmer), a pool of the hangar's own light
  fx.floor = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uInk: { value: INK.clone() }, uAmount: { value: 0 }, uLit: { value: 0 }, uCut: { value: 0 } },
    vertexShader: /* glsl */ `varying vec3 vS; void main() { vS = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount, uLit, uCut; varying vec3 vS;
      void main() {
        if (vS.z < ${f(CUTZ)} && uCut > 0.5) discard;
        vec2 q = vS.xz / 400.0; vec2 fw = max(fwidth(q), vec2(1e-5));
        vec2 g = 1.0 - smoothstep(vec2(0.0), fw * 1.6, abs(fract(q - 0.5) - 0.5));
        float grid = smoothstep(6.0, 20.0, 1.0 / max(fw.x, fw.y)) * max(g.x, g.y);
        vec2 e = vec2(vS.x / ${f(hx1)}, (vS.z - ${f((hz0 + hz1) / 2)}) / ${f((hz1 - hz0) / 2)});
        float pool = pow(clamp(1.0 - dot(e, e) * 0.8, 0.0, 1.0), 1.6);
        gl_FragColor = vec4(uInk * (grid * (0.07 + 0.16 * uLit) + pool * 0.11 * uLit) * uAmount, 1.0);
      }`,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(hx1 - hx0, hz1 - hz0).rotateX(-Math.PI / 2).translate(0, H0 + 2, (hz0 + hz1) / 2), fx.floor);
  floor.renderOrder = 48; // inside the hangar's shell: drawn before it
  floor.frustumCulled = false;
  hangar.add(floor);
  A.hangar = anchor(ship, 0, H0, (hz0 + hz1) / 2);
  // the fire curtain: it comes down across the hangar (veille: its frame, a wide weave — never a flat sheet)
  fx.curtain = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uVeille: { value: VEILLE.clone() }, uAmount: { value: 0 }, uDown: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uVeille; uniform float uAmount, uDown; varying vec2 vP;
      ${PAINT_GLSL}
      void main() {
        float H = ${f(H1 - H0)} * uDown;
        float y = -vP.y; // 0 at the ceiling, growing downward, the curtain's own (it moves with it)
        if (y > H) discard;
        float lead = mark(y - H + 6.0, 6.0, 1.2);
        float sides = mark(abs(vP.x) - ${f(hx1 - 8)}, 6.0, 1.1);
        vec2 q = vec2(vP.x, H - y) / 300.0; // the weave rides down with the curtain's edge
        vec2 fw = max(fwidth(q), vec2(1e-5));
        vec2 g = 1.0 - smoothstep(vec2(0.0), fw * 1.6, abs(fract(q - 0.5) - 0.5));
        float weave = smoothstep(5.0, 16.0, 1.0 / max(fw.x, fw.y)) * max(g.x, g.y);
        gl_FragColor = vec4(uVeille * (lead * 1.1 + sides * 0.7 + weave * 0.34 + 0.03) * uAmount, 1.0);
      }`,
  });
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(hx1 - hx0, H1 - H0).translate(0, -(H1 - H0) / 2, 0), fx.curtain);
  curtain.position.set(0, H1, HANGAR.curtain);
  curtain.renderOrder = 45; // inside the shells (hangar 50, hull 60): drawn before them, or their depth hides it
  curtain.frustumCulled = false;
  ship.add(curtain);
  A.curtain = anchor(ship, 0, (H0 + H1) / 2, HANGAR.curtain);

  /* ═════════════════════ the two deck-edge lifts ═════════════════════ */
  fx.liftGlass = glassMat(BRAND.ink, { base: 0.002, rim: 0.08, power: 2.4, edge: 0.05 });
  const liftWells = [];
  A.lifts = LIFTS.map((l) => {
    const g = new THREE.Group();
    const w = l.x[1] - l.x[0];
    const d = l.z[1] - l.z[0];
    g.position.set((l.x[0] + l.x[1]) / 2, 0, (l.z[0] + l.z[1]) / 2);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(w, 40, d).translate(0, -20, 0), fx.liftGlass);
    plate.renderOrder = 63;
    plate.frustumCulled = false;
    g.add(plate);
    const top = [];
    loop(top, [[-w / 2, 0.8, -d / 2], [w / 2, 0.8, -d / 2], [w / 2, 0.8, d / 2], [-w / 2, 0.8, d / 2]]);
    loop(top, [[-w / 2, -40, -d / 2], [w / 2, -40, -d / 2], [w / 2, -40, d / 2], [-w / 2, -40, d / 2]]);
    lines(top, { width: 2.2, opacity: 0.7, kind: "outline", parent: g, cut: false });
    // the well along the hull's side: two guides, top to hangar floor
    for (const z of l.z) seg(liftWells, [l.x[0] + 30, 0, z], [l.x[0] + 30, H0 - 40, z]);
    ship.add(g);
    return g;
  });
  lines(liftWells, { width: 2, opacity: 0.45, kind: "doors" });

  /* ═════════════════════ the anti-heel masses: blocks on rails across the hull, two groups of three ═════════════════════ */
  const masses = makePart("masses");
  ship.add(masses);
  fx.massMat = solid(0x51575b, { rough: 0.55, metal: 0.35 });
  const topMat = solid(0x8e938f, { rough: 0.5, metal: 0.3 });
  const railMat = solid(0x2c3134, { rough: 0.7, metal: 0.3 });
  const wheelMat = solid(0x6a6f71, { rough: 0.5, metal: 0.4 });
  const [bw, bh, bd] = MASSES.block;
  const railY = MASSES.y - bh / 2 - 22;
  const blocks = [];
  const railGlow = [];
  for (const z of MASSES.rows) {
    for (const dz of [-70, 70]) {
      addMesh(masses, box(MASSES.half * 2 + 120, 14, 16, 3), railMat, { pos: [0, railY, z + dz], edgeOpacity: 0.5 });
      railGlow.push([[-MASSES.half - 60, railY + 9, z + dz], [MASSES.half + 60, railY + 9, z + dz]]);
    }
    const b = makePart("block");
    addMesh(b, box(bw, bh - 30, bd, 8), fx.massMat, { pos: [0, 15, 0], edgeOpacity: 0.7 });
    addMesh(b, box(bw - 30, 14, bd - 30, 4), topMat, { pos: [0, bh / 2 + 4, 0], edgeOpacity: 0.6 });
    for (const sx of [-1, 1]) for (const dz of [-70, 70]) addMesh(b, cyl(26, 18, 3, 28).rotateZ(Math.PI / 2), wheelMat, { pos: [sx * (bw / 2 - 50), -bh / 2 + 8, dz], edgeOpacity: 0.55 });
    b.position.set(0, MASSES.y, z);
    masses.add(b);
    blocks.push(b);
  }
  fx.railGlow = railGlow.map((pts) => {
    const l = fatLine(pts, { color: BRAND.veille, width: 3, opacity: 0 });
    masses.add(l);
    return l;
  });

  /* ═════════════════════ the nuclear plant: two vessels low amidships, a core of light in each; the steam main ═════════════════════ */
  const plant = new THREE.Group();
  ship.add(plant);
  fx.vessel = glassMat(BRAND.ink, { base: 0.003, rim: 0.12, power: 2.6, edge: 0.06 });
  const vesselProfile = [];
  for (let i = 0; i <= 8; i++) vesselProfile.push(new THREE.Vector2(PLANT.r * Math.sin((i / 8) * Math.PI * 0.5), -PLANT.h / 2 - PLANT.r * 0.5 * Math.cos((i / 8) * Math.PI * 0.5)));
  for (let i = 8; i >= 0; i--) vesselProfile.push(new THREE.Vector2(PLANT.r * Math.sin((i / 8) * Math.PI * 0.5), PLANT.h / 2 + PLANT.r * 0.5 * Math.cos((i / 8) * Math.PI * 0.5)));
  const plantLines = [];
  for (const [x, y, z] of PLANT.reactors) {
    const geo = new THREE.LatheGeometry(vesselProfile, 40).translate(x, y, z);
    const m = new THREE.Mesh(geo, fx.vessel);
    m.renderOrder = 46;
    m.frustumCulled = false;
    plant.add(m);
    for (const dy of [-PLANT.h / 2, PLANT.h / 2]) {
      const ring = [];
      for (let i = 0; i < 24; i++) ring.push([x + PLANT.r * Math.cos((i / 24) * 2 * Math.PI), y + dy, z + PLANT.r * Math.sin((i / 24) * 2 * Math.PI)]);
      loop(plantLines, ring);
    }
  }
  lines(plantLines, { width: 2, opacity: 0.5, kind: "plant", parent: plant });
  fx.cores = makeLights(
    PLANT.reactors.map(([x, y, z]) => [x, y, z]),
    { color: BRAND.veille, core: 70, halo: 300, minCore: 3, minHalo: 14, kCore: 2.2, kHalo: 0.55, order: 45 },
  );
  plant.add(fx.cores.mesh);
  A.plant = anchor(ship, 0, PLANT.reactors[0][1], PLANT.reactors[0][2]);
  // the steam main: risers from each vessel, then forward and up to the receiver. `feed` runs veille dashes along it, at a
  // FIXED speed (30 cm a frame for a period of 450: a fifteenth), from the plant toward the catapult
  const riserTop = PLANT.main[0];
  const tankEnd = PLANT.main[2];
  const pathPts = [PLANT.main[0], PLANT.main[1], [tankEnd[0], tankEnd[1] - 150, tankEnd[2]]]; // it stops at the receiver's skin
  const riserLen = Math.hypot(PLANT.reactors[0][0] - riserTop[0], PLANT.reactors[0][1] + PLANT.h / 2 + PLANT.r * 0.5 - riserTop[1]);
  const pipes = [];
  for (const [x, y, z] of PLANT.reactors) pipes.push([[x, y + PLANT.h / 2 + PLANT.r * 0.5, z], riserTop, 0]);
  let s0 = riserLen;
  for (let i = 0; i < pathPts.length - 1; i++) {
    pipes.push([pathPts[i], pathPts[i + 1], s0]);
    s0 += Math.hypot(pathPts[i + 1][0] - pathPts[i][0], pathPts[i + 1][1] - pathPts[i][1], pathPts[i + 1][2] - pathPts[i][2]);
  }
  const MAIN_LEN = s0;
  fx.main = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uInk: { value: INK.clone() }, uVeille: { value: VEILLE.clone() }, uAmount: { value: 0 }, uFeed: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aS; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() { vS = aS; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uVeille; uniform float uAmount, uFeed, uTime; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float glass = 0.01 + 0.2 * pow(g, 2.4);
        float front = uFeed * ${f(MAIN_LEN + 200)};
        float lit = 1.0 - smoothstep(front - 60.0, front, vS);
        float head = exp(-pow((vS - front) / 140.0, 2.0)) * step(0.001, uFeed) * (1.0 - smoothstep(0.97, 1.0, uFeed));
        float q = (vS - uTime * 900.0) / 450.0;
        float fw = max(fwidth(q), 1e-5);
        float dd = abs(fract(q) - 0.5);
        float dash = mix(0.5, 1.0 - smoothstep(0.25 - fw, 0.25 + fw, dd), smoothstep(6.0, 18.0, 1.0 / fw));
        vec3 col = uInk * glass + uVeille * (lit * (0.14 + 0.55 * dash) * (0.4 + 0.6 * g) + head * 1.2);
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });
  for (const [a, b, sStart] of pipes) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const geo = new THREE.CylinderGeometry(34, 34, len, 16, Math.max(2, Math.round(len / 150)), true);
    const posA = geo.attributes.position;
    const aS = new Float32Array(posA.count);
    for (let i = 0; i < posA.count; i++) aS[i] = sStart + (posA.getY(i) + len / 2);
    geo.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
    const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
    const m = new THREE.Mesh(geo, fx.main);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    m.renderOrder = 47;
    m.frustumCulled = false;
    plant.add(m);
  }

  /* ═════════════════════ the fuel holds: two low volumes, signal — dosed (a hot volume of glass is a wall) ═════════════════════ */
  const fuel = new THREE.Group();
  ship.add(fuel);
  fx.fuel = glassMat(BRAND.signal, { base: 0.012, rim: 0.32, power: 2.2, edge: 0.18 });
  const fuelLines = [];
  for (const [x, y, z] of FUEL) {
    const [w, h, d] = [2000, 340, 2800];
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d).translate(x, y, z), fx.fuel);
    m.renderOrder = 44;
    m.frustumCulled = false;
    fuel.add(m);
    boxEdges(fuelLines, [x - w / 2, y - h / 2, z - d / 2], [x + w / 2, y + h / 2, z + d / 2]);
  }
  lines(fuelLines, { color: BRAND.signal, width: 2.2, opacity: 0.7, kind: "fuel", parent: fuel });

  /* ═════════════════════ the fire detectors: ≈ a thousand points of veille, lit in a wave from the bow ═════════════════════ */
  const det = [];
  for (let i = 0; i < 420; i++) {
    const z = hz0 + 150 + R() * (hz1 - hz0 - 300);
    det.push([(R() * 2 - 1) * (hx1 - 120), H1 - 14, z]);
  }
  for (let i = 0; i < 600; i++) {
    const y = [-1080, -1480, -1880][i % 3];
    const z = -10500 + R() * 21500;
    const half = Math.max(0, inside(z, y) - 160);
    if (half < 200) continue;
    det.push([(R() * 2 - 1) * half, y, z]);
  }
  fx.detectors = makeLights(
    det.map(([x, y, z]) => [x, y, z, clamp01((z - SHIP.bow - 1500) / (SHIP.len - 2500))]),
    { color: BRAND.veille, core: 7, halo: 40, minCore: 1.2, minHalo: 4.5, kCore: 2.0, kHalo: 0.4, order: 45 },
  );
  ship.add(fx.detectors.mesh);

  /* ═════════════════════ the fins and the rudder: solid, under the hull ═════════════════════ */
  const fins = makePart("fins");
  ship.add(fins);
  fx.finMat = solid(0x4f5559, { rough: 0.5, metal: 0.35 });
  const finPivots = [];
  for (const z of FINS.z) {
    for (const side of [-1, 1]) {
      const root = at(BILGE, z) - 30;
      const pivot = new THREE.Group();
      pivot.position.set(side * root, FINS.y, z);
      addMesh(makeLocal(pivot), box(FINS.span, 46, 420, 10), fx.finMat, { pos: [(side * FINS.span) / 2, 0, 0], edgeOpacity: 0.7 });
      fins.add(pivot);
      finPivots.push([pivot, side, z]);
    }
  }
  const rudder = new THREE.Group();
  rudder.position.set(...FINS.rudder);
  addMesh(makeLocal(rudder), box(60, 560, 460, 10), fx.finMat, { pos: [0, -60, 180], edgeOpacity: 0.7 });
  fins.add(rudder);
  function makeLocal(group) {
    // addMesh files its materials with the part: a group inside the part, the same part's book
    group.userData.part = fins.userData.part;
    return group;
  }

  /* ═════════════════════ the night's lights ═════════════════════ */
  const deckLights = [];
  // along the deck's edge, every 30 m or so (a handful seen from 1.3 km, never a dotted line)
  for (let i = 0; i < OUT.length; i++) {
    const a = OUT[i];
    const b = OUT[(i + 1) % OUT.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.round(len / 3000));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      deckLights.push([a[0] + (b[0] - a[0]) * t, 12, a[1] + (b[1] - a[1]) * t]);
    }
  }
  // the runway: its two edges every 20 m, its centreline every 20 m, offset by half a step
  for (let s = 600; s <= ANGLED.len; s += 2000) for (const off of [-ANGLED.half, ANGLED.half]) deckLights.push(onAngled(s, off, 10));
  for (let s = 1600; s <= ANGLED.len; s += 2000) deckLights.push(onAngled(s, 0, 8));
  // the drop lights down the stern, on the runway's axis
  const dropX = onAngled(-275)[0];
  for (let i = 0; i < 6; i++) deckLights.push([dropX, -380 - i * 210, SHIP.stern + 8]);
  A.lights = anchor(ship, dropX, -900, SHIP.stern);
  fx.lights = makeLights(deckLights, { color: BRAND.ink, core: 6, halo: 45, minCore: 2, minHalo: 7.5, kCore: 2.6, kHalo: 0.5 });
  ship.add(fx.lights.mesh);
  // the island's floodlights, over the deck
  fx.floods = makeLights(
    [[ISLAND.x[0] - 10, 1480, ISLAND.z[0] + 500], [ISLAND.x[0] - 10, 1520, iz], [ISLAND.x[0] - 10, 1480, ISLAND.z[1] - 400]],
    { color: BRAND.ink, core: 18, halo: 160, minCore: 2, minHalo: 9, kCore: 2.4, kHalo: 0.5 },
  );
  ship.add(fx.floods.mesh);
  // the coloured lights the aviation bridge switches on: veille along your way to the bow catapult, a signal stop bar
  // across it ahead of the shuttle (under the aircraft's nose)
  const cx = CAT[0].from[0];
  const cz = CAT[0].from[2];
  const way = [];
  for (let z = cz + 4300; z >= cz + 250; z -= 450) for (const dx of [-390, 390]) way.push([cx + dx, 8, z]);
  fx.taxi = makeLights(way, { color: BRAND.veille, core: 6, halo: 38, minCore: 2, minHalo: 8, kCore: 2.4, kHalo: 0.5 });
  ship.add(fx.taxi.mesh);
  const stop = [];
  for (let k = -2; k <= 2; k++) stop.push([cx + k * 150, 8, cz - 470]);
  fx.stop = makeLights(stop, { color: BRAND.signal, core: 7, halo: 42, minCore: 2.1, minHalo: 9, kCore: 2.5, kHalo: 0.55 });
  ship.add(fx.stop.mesh);

  /* ═════════════════════ the wind over the deck: long strands running aft, along the keel or along the runway ═════════════════════ */
  fx.wind = makeStreaks({
    count: 70,
    seed: 41,
    len: 900,
    width: 4,
    minPx: 1.8,
    k: 0.32,
    fill: (i, r) => ({ o: [-3200 + r() * 5400, 40 + r() * r() * 520, SHIP.bow - 600], d: [0, 0, 1], l1: SHIP.len + 1500, speed: 2400 + r() * 900, len: 0.7 + r() * 0.6 }),
  });
  fx.windRun = makeStreaks({
    count: 50,
    seed: 43,
    len: 900,
    width: 4,
    minPx: 1.8,
    k: 0.32,
    fill: (i, r) => {
      const o = onAngled(ANGLED.len + 1200, (r() * 2 - 1) * (ANGLED.half + 600), 40 + r() * r() * 480);
      return { o, d: [-ANGLED_DIR[0], 0, -ANGLED_DIR[2]], l1: ANGLED.len + 2600, speed: 2400 + r() * 900, len: 0.7 + r() * 0.6 };
    },
  });
  ship.add(fx.wind.mesh, fx.windRun.mesh);

  /* ═════════════════════ the section: the hull cut across at the masses (`cutaway`) ═════════════════════ */
  const section = new THREE.Group();
  ship.add(section);
  const prof = [-1, 1].map((s) => [0, 1, 2, 3, 4, 5].map((j) => hullPoint(CUTZ, j, s)));
  const secLines = [];
  for (const row of prof) for (let j = 0; j < 5; j++) seg(secLines, row[j], row[j + 1]);
  seg(secLines, prof[0][0], prof[1][0]); //   the deck
  seg(secLines, prof[0][5], prof[1][5]); //   the bottom
  loop(secLines, [[hx0, H0, CUTZ], [hx0, H1, CUTZ], [hx1, H1, CUTZ], [hx1, H0, CUTZ]]); // the hangar
  const secThin = [];
  seg(secThin, prof[0][1], prof[1][1]); //    the deck's underside
  for (const y of [railY - 10, -1650 - 250, -2150]) {
    const half = inside(CUTZ, y) - 20;
    seg(secThin, [-half, y, CUTZ], [half, y, CUTZ]);
  }
  lines(secLines, { width: 2.8, opacity: 0.95, kind: "section", parent: section, cut: false });
  lines(secThin, { width: 2, opacity: 0.4, kind: "section", parent: section, cut: false });
  const secShape = new THREE.Shape([...prof[1].map(([x, y]) => new THREE.Vector2(x, y)), ...prof[0].slice().reverse().map(([x, y]) => new THREE.Vector2(x, y))]);
  secShape.holes.push(new THREE.Path([new THREE.Vector2(hx0, H0), new THREE.Vector2(hx1, H0), new THREE.Vector2(hx1, H1), new THREE.Vector2(hx0, H1)]));
  fx.secFill = new THREE.MeshBasicMaterial({ color: INK.clone().multiplyScalar(0.05), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const secFill = new THREE.Mesh(new THREE.ShapeGeometry(secShape).translate(0, 0, CUTZ), fx.secFill);
  secFill.renderOrder = 62;
  section.add(secFill);
  // the water in section, LEVEL (it lives in `sky`): the sea's line across the cut, the water under it
  const water = new THREE.Group();
  sky.add(water);
  fx.water = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uInk: { value: INK.clone() }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount; varying vec3 vP;
      void main() {
        float depth = ${f(SEA)} - vP.y;
        float side = 1.0 - smoothstep(6000.0, 9000.0, abs(vP.x));
        gl_FragColor = vec4(uInk * (0.045 * exp(-depth / 700.0) + 0.012) * side * uAmount, 1.0);
      }`,
  });
  const waterQuad = new THREE.Mesh(new THREE.PlaneGeometry(18000, 1800).translate(0, SEA - 900, CUTZ), fx.water);
  waterQuad.renderOrder = 70;
  waterQuad.frustumCulled = false;
  water.add(waterQuad);
  fx.waterLine = fatLine([[-9000, SEA, CUTZ], [9000, SEA, CUTZ]], { width: 2.4, opacity: 0 });
  water.add(fx.waterLine);

  /* ═════════════════════ the waterline's skin: the sea against the hull, riding the rollers (LEVEL, in `sky`) ═════════════════════ */
  const ring = [];
  for (const z of [STEM_WL, ...stations.filter((z) => z > STEM_WL + 1)]) ring.push([at(WATER, z), z]);
  const wl = [...ring.map(([x, z]) => [x, z]), ...ring.slice().reverse().map(([x, z]) => [-x, z])].filter((p, i, a) => i === 0 || Math.hypot(p[0] - a[i - 1][0], p[1] - a[i - 1][1]) > 1);
  {
    const pos = [];
    const across = [];
    const index = [];
    const n = wl.length;
    for (let i = 0; i < n; i++) {
      const a = wl[(i - 1 + n) % n];
      const b = wl[(i + 1) % n];
      let nx = b[1] - a[1];
      let nz = -(b[0] - a[0]);
      const l = Math.hypot(nx, nz) || 1;
      nx /= l;
      nz /= l;
      // outward: away from the centreline
      const [x, z] = wl[i];
      if (nx * x + nz * (z - (SHIP.bow + SHIP.stern) / 2) * 0.05 < 0) (nx = -nx), (nz = -nz);
      pos.push(x, SEA, z, x + nx * 260, SEA, z + nz * 260);
      across.push(0, 1);
      const j = (i + 1) % n;
      index.push(i * 2, j * 2, i * 2 + 1, i * 2 + 1, j * 2, j * 2 + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aAcross", new THREE.Float32BufferAttribute(across, 1));
    geo.setIndex(index);
    fx.skin = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uInk: { value: INK.clone() }, uAmount: { value: 0 }, uSwell: { value: 0.2 }, uSpeed: { value: 0.4 }, uRollT: { value: 0 }, uCut: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aAcross; uniform float uSwell, uRollT; varying float vA; varying float vZ;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          float ph = (w.z * 0.94 + w.x * 0.34) / ${f(ROLL_L)} * 6.2831853 + uRollT;
          w.y += uSwell * ${f(ROLL_A)} * sin(ph);
          vA = aAcross; vZ = position.z;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk; uniform float uAmount, uSpeed, uCut; varying float vA; varying float vZ;
        void main() {
          if (vZ < ${f(CUTZ)} && uCut > 0.5) discard;
          float a = pow(clamp(1.0 - vA, 0.0, 1.0), 2.0);
          float bow = 1.0 - smoothstep(${f(SHIP.bow + 2500)}, ${f(SHIP.bow + 9000)}, vZ);
          gl_FragColor = vec4(uInk * a * (0.14 + 0.16 * uSpeed * bow) * uAmount, 1.0);
        }`,
    });
    const skin = new THREE.Mesh(geo, fx.skin);
    skin.renderOrder = 70;
    skin.frustumCulled = false;
    sky.add(skin);
    fx.skinMesh = skin;
  }

  /* ═════════════════════ the sea and the sky ═════════════════════ */
  fx.backdrop = backdropMat();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), fx.backdrop);
  dome.frustumCulled = false;
  dome.renderOrder = 17; // BEFORE the glass shells (asShell's depth pass, 19): drawn after them (100), every aircraft and figure of glass in front of the dawn was a black silhouette (bord.js)
  sky.add(dome);

  A.bow = anchor(ship, 0, 0, SHIP.bow);
  A.stern = anchor(ship, 0, 0, SHIP.stern);

  /* ═════════════════════ the probe: once per draw, what the camera's distance allows ═════════════════════ */
  probe.onBeforeRender = (renderer, scene, camera) => {
    const e = camera.matrixWorld.elements;
    const d = Math.hypot(e[12], e[13], e[14]);
    far.k = 1 - 0.5 * smooth(25000, 220000, d); //   the structure: dimmer from far, never a white bar
    far.inner = 1 - 0.85 * smooth(15000, 120000, d); // the hull's ribs, the hangar's frames: gone before they crowd
    far.below = e[13] < SEA ? 1 : 0;
    // by night, from far, the X-ray steps back for good: the ship is a handful of lights
    const nk = 1 - 0.88 * far.night * smooth(9000, 70000, d);
    for (let i = 0; i < LINES.length; i++) {
      const L = LINES[i];
      const k = L.kind === "inner" || L.kind === "hangar" ? far.inner : L.kind === "outline" || L.kind === "bow" || L.kind === "section" || L.kind === "windows" ? Math.max(far.k, 0.75) : far.k;
      L.mat.opacity = L.want * k * (L.kind === "section" ? 1 : nk);
    }
    fx.hull.uniforms.uAmount.value = fx.hull.userData.want * far.k * nk;
    fx.island.uniforms.uAmount.value = fx.island.userData.want * far.k * nk;
    fx.paint.uniforms.uAmount.value = far.paint * (1 - 0.7 * far.night * smooth(9000, 70000, d));
    fx.low.uniforms.uAmount.value = fx.low.userData.want * Math.max(far.below, fx.low.userData.fins, 0.15);
    for (let i = 0; i < lowLinesObjs.length; i++) lowLinesObjs[i].mat.opacity = lowLinesObjs[i].want * Math.max(far.below, fx.low.userData.fins, 0.12);
  };
  const lowLinesObjs = LINES.filter((L) => L.kind === "low");

  /* ═════════════════════ set ═════════════════════ */
  const CUTTERS = [fx.hull, fx.low, fx.island, fx.hangarGlass, fx.vessel, fx.fuel];
  const NIGHTS = [fx.lights, fx.floods];
  function set(p = {}, time = 0) {
    const amount = clamp01(p.amount ?? 1);
    const sea = clamp01(p.sea ?? 1);
    const night = clamp01(p.night ?? 0);
    const lightsK = clamp01(p.lights ?? 0);
    const taxi = clamp01(p.taxi ?? 0);
    const speed = clamp01(p.speed ?? 0.4);
    const wind = clamp01(p.wind ?? 0.4);
    const under = clamp01(p.under ?? 0);
    const angled = clamp01(p.angled ?? 0);
    const cut = clamp01(p.cutaway ?? 0);
    const heel = p.heel ?? 0;
    const mpos = Math.max(-1, Math.min(1, p.masses ?? 0));
    const mGlow = clamp01(p.massGlow ?? 0);
    const finsK = clamp01(p.fins ?? 0);
    const lift = clamp01(p.lift ?? 0);
    const hangarK = clamp01(p.hangar ?? 0);
    const curtainK = clamp01(p.curtain ?? 0);
    const detK = clamp01(p.detectors ?? 0);
    const plantK = clamp01(p.plant ?? 0);
    const feed = clamp01(p.feed ?? 0);
    const fuelK = clamp01(p.fuel ?? 0);
    const coast = clamp01(p.coast ?? 0);
    const swell = clamp01(p.swell ?? 0.2);
    const windAxis = clamp01(p.windAxis ?? 0);
    const mist = clamp01(p.mist ?? 0);

    ship.visible = amount > 0.003;
    const dimN = 1 - 0.62 * night; // by night the X-ray steps back: the lights carry the ship
    const foreK = 1 - smooth(0, 0.5, cut);
    const cutOn = cut > 0.5 ? 1 : 0;

    // what is seen of the inside of the hull
    const inner = smooth(0.25, 0.6, under);
    const hangarShow = Math.max(hangarK, inner * 0.6, cut, curtainK, lift > 0.001 ? 0.6 : 0, detK * 0.5);
    const massShow = Math.max(mGlow, cut, Math.abs(mpos) > 0.005 ? 1 : 0);

    want.outline = amount * dimN;
    want.bow = amount * (1 - 0.35 * night);
    want.hull = amount * dimN;
    want.inner = amount * dimN;
    want.low = amount * dimN;
    want.island = amount * dimN;
    want.windows = amount * (dimN + 0.35 * lightsK);
    want.hangar = amount * hangarShow * (0.5 + 0.5 * hangarK);
    want.doors = amount * Math.max(hangarShow * 0.6, lift > 0.001 ? 1 : 0) * (0.5 + 0.5 * Math.max(hangarK, lift > 0.001 ? 1 : 0));
    want.strips = amount * hangarShow * (0.25 + 0.75 * hangarK);
    want.section = amount * smooth(0.45, 1, cut);
    want.plant = amount * Math.max(plantK, feed) * 0.9;
    want.fuel = amount * fuelK;
    for (let i = 0; i < LINES.length; i++) {
      const L = LINES[i];
      L.want = L.base * (want[L.kind] ?? amount) * (L.fore ? foreK : 1);
      L.obj.visible = L.want > 0.003 && !(L.fore && cutOn);
      L.mat.opacity = L.want; // the probe doses it by distance
    }

    for (let i = 0; i < CUTTERS.length; i++) CUTTERS[i].uniforms.uCut.value = cut;
    fx.hull.userData.want = amount * dimN;
    fx.hull.uniforms.uAmount.value = fx.hull.userData.want;
    fx.island.userData.want = amount * dimN;
    fx.island.uniforms.uAmount.value = fx.island.userData.want;
    fx.low.userData.want = amount * dimN;
    fx.low.userData.fins = finsK;
    fx.low.uniforms.uAmount.value = fx.low.userData.want * 0.15;

    fx.paint.uniforms.uAmount.value = amount;
    far.paint = amount;
    far.night = night;
    fx.paint.uniforms.uUnder.value = under;
    fx.paint.uniforms.uAngled.value = angled;
    fx.paint.uniforms.uNight.value = night;
    fx.paint.uniforms.uCut.value = cut;
    fx.hold.uniforms.uCut.value = cut;
    fx.lid.uniforms.uUnder.value = under;
    fx.lid.uniforms.uAmount.value = clamp01(amount * 4);
    fx.lid.uniforms.uCut.value = cut;
    lid.visible = amount > 0.003;

    // the hangar, its curtain, the lifts
    hangar.visible = amount * hangarShow > 0.003;
    fx.hangarGlass.uniforms.uAmount.value = amount * hangarShow * (0.6 + 0.8 * hangarK);
    fx.floor.uniforms.uAmount.value = amount * hangarShow;
    fx.floor.uniforms.uLit.value = hangarK;
    fx.floor.uniforms.uCut.value = cut;
    curtain.visible = amount * curtainK > 0.003;
    fx.curtain.uniforms.uAmount.value = amount * smooth(0, 0.08, curtainK);
    fx.curtain.uniforms.uDown.value = curtainK;
    A.lifts[0].position.y = LIFTS[0].down * lift;
    fx.liftGlass.uniforms.uAmount.value = amount * dimN;

    // the masses
    masses.visible = amount * massShow > 0.003;
    for (let i = 0; i < blocks.length; i++) blocks[i].position.x = mpos * MASSES.travel;
    const breath = 0.85 + 0.15 * Math.sin(time * 2.1);
    fx.massMat.emissive.copy(VEILLE).multiplyScalar(0.32 * mGlow * breath);
    for (let i = 0; i < fx.railGlow.length; i++) fx.railGlow[i].material.opacity = 0.85 * mGlow * breath * amount;

    // the plant and its main
    plant.visible = amount * Math.max(plantK, feed) > 0.003;
    fx.vessel.uniforms.uAmount.value = amount * (0.5 + 0.5 * plantK);
    fx.vessel.uniforms.uColor.value.copy(INK).lerp(VEILLE, 0.45 * plantK);
    fx.cores.uniforms.uAmount.value = amount * plantK;
    fx.main.uniforms.uAmount.value = amount * Math.max(plantK, feed > 0.001 ? 1 : 0);
    fx.main.uniforms.uFeed.value = feed;
    fx.main.uniforms.uTime.value = time;

    // the fuel holds, the detectors
    fuel.visible = amount * fuelK > 0.003;
    fx.fuel.uniforms.uAmount.value = amount * fuelK;
    fx.detectors.mesh.visible = amount * detK > 0.003;
    fx.detectors.uniforms.uAmount.value = amount;
    fx.detectors.uniforms.uWave.value = detK * 1.12;
    fx.detectors.uniforms.uCut.value = cut;

    // the fins and the rudder: they work slowly
    fins.visible = amount * finsK > 0.003;
    fx.finMat.emissive.copy(VEILLE).multiplyScalar(0.28 * finsK);
    for (let i = 0; i < finPivots.length; i++) {
      const F = finPivots[i];
      F[0].rotation.x = 0.16 * finsK * Math.sin(time * 1.05 + (F[2] > 0 ? 1.4 : 0) + (F[1] > 0 ? Math.PI : 0));
    }
    rudder.rotation.y = 0.12 * finsK * Math.sin(time * 0.62 + 0.4);

    // the lights
    for (let i = 0; i < NIGHTS.length; i++) {
      const L = NIGHTS[i];
      L.mesh.visible = amount * lightsK > 0.003;
      L.uniforms.uAmount.value = amount * lightsK;
      L.uniforms.uMist.value = mist;
      L.uniforms.uCut.value = cut;
    }
    fx.taxi.mesh.visible = fx.stop.mesh.visible = amount * taxi > 0.003;
    fx.taxi.uniforms.uAmount.value = fx.stop.uniforms.uAmount.value = amount * taxi;
    fx.taxi.uniforms.uMist.value = fx.stop.uniforms.uMist.value = mist;
    fx.cores.uniforms.uMist.value = 0;

    // the wind
    fx.wind.set(wind * (1 - windAxis) * amount * (1 - 0.4 * night) * (cut > 0.01 ? 0 : 1), time);
    fx.windRun.set(wind * windAxis * amount * (1 - 0.4 * night) * (cut > 0.01 ? 0 : 1), time);

    // the section
    section.visible = amount * cut > 0.003;
    fx.secFill.opacity = amount * smooth(0.45, 1, cut);
    water.visible = sea * cut > 0.003;
    fx.water.uniforms.uAmount.value = sea * smooth(0.45, 1, cut);
    fx.waterLine.material.opacity = 0.55 * sea * smooth(0.45, 1, cut);

    // the sea, the sky, the hull's skin of water
    dome.visible = sea > 0.003;
    const bd = fx.backdrop.uniforms;
    bd.uAmount.value = sea;
    bd.uTravel.value = time * SPEED;
    bd.uRollT.value = time * ROLL_W;
    bd.uNight.value = night;
    bd.uSpeed.value = speed;
    bd.uSwell.value = swell;
    bd.uMist.value = mist;
    bd.uCoast.value = coast;
    const sk = fx.skin.uniforms;
    fx.skinMesh.visible = sea * amount > 0.003;
    sk.uAmount.value = sea * amount * (1 - 0.7 * smooth(1, 4, Math.abs(heel))) * (1 - 0.5 * night);
    sk.uSwell.value = swell;
    sk.uSpeed.value = speed;
    sk.uRollT.value = time * ROLL_W;
    sk.uCut.value = cut;
  }
  set();

  return { ship, sky, A, set };
}
