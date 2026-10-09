// DOSSIER 015 — the ship: an aircraft carrier seen like an X-ray. A hull and an island of glass in fine lines, a
// deck that is nothing but its paint (no slab: a floor seen at a grazing angle is a grey band across the picture),
// the two other wires, a few deck hands of glass — and all around, at infinity, the sea going by and the sky.
// The frame is the ship's (plan.js): the deck is y = 0 and never moves, the landing axis is −z, starboard is +x.
// The hull is turned by DECK.skew: it is built in the KEEL's frame — u forward from the transom, v to starboard —
// and laid in the ship's frame by one group.
//
// What hides what, by render order (nothing here can hide the system or the aircraft):
//   −5   the lid: the deck's darkness over what lies under it (the brake's bay), `under` lifts it
//   3    lines (the deck's outline, the island, the bay)
//   57   the deck, depth only: from above, the hull's own glass and lines stay under it, and so does the sea
//   58   the hull's lines and the far side of its glass · 60 the hull and the island: ONE shell
//   61   the deck's paint · 62 the light of an aircraft gone around
//   100  the sea and the sky, last: whatever wrote its depth (a solid, a shell of glass) hides them
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { makeFigure } from "@kit/figure.js";
import { makePool } from "@kit/atmo.js";
import { solid, glass, asShell, lineMat, fatLine, anchor, box, cyl, makePart, addMesh, setPartOpacity } from "@kit/build3d.js";
import { DECK, BRINS, ENGINE } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/* ───────────────────────────────────────────────────────────── the plan of the hull, in the keel's frame */

const SIN = Math.sin(DECK.skew * DEG);
const COS = Math.cos(DECK.skew * DEG);
const TAN = SIN / COS;
const OZ = DECK.stern; // the keel's frame starts where the landing axis crosses the transom
const LEN = 26000; //    the hull, from the transom to the stem (at the deck)
const RAKE = 1000; //    how far aft of that the stem meets the water
const SLAB = 260; //     the thickness of the flight deck's edge
const CHINE = -900; //   where the overhang meets the hull's side
const SPEED = 600; //    cm/s the sea goes by (the ship's way, slowed: the film is)
const WINDOW = [1400, 450]; // the half-sizes of the clear panel over the brake (x, z)
/** The ship's frame → the keel's: [u, v]. */
const keel = (x, z) => [x * SIN - (z - OZ) * COS, x * COS + (z - OZ) * SIN];
/** The keel's frame → the ship's: [x, y, z]. */
const ship = (u, v, y = 0) => [u * SIN + v * COS, y, OZ - u * COS + v * SIN];

// The end of the angled deck: an edge square to the landing axis, from the port corner to where the bow's deck goes on.
const EDGE = { port: -1800, star: 950 };
const END_PORT = keel(EDGE.port, DECK.end);
const END_STAR = keel(EDGE.star, DECK.end);
// the port edge runs along the landing strip, three metres outside its paint
const PORT = [[0, -1850], [1500, END_PORT[1] + (END_PORT[0] - 1500) * TAN], END_PORT, END_STAR, [20500, -1650], [23000, -1350], [25000, -800], [25800, -350], [LEN, 0]];
const STAR = [[0, 1900], [3000, 2100], [5500, 2250], [11500, 2250], [14000, 2000], [19000, 1700], [23000, 1300], [25000, 800], [25800, 350], [LEN, 0]];
const MID = [[0, 1650], [2500, 1750], [18500, 1700], [21000, 1450], [23000, 1100], [24600, 550], [LEN - RAKE * (CHINE / DECK.sea), 0]]; // the hull's half-beam at the chine
const WATER = [[0, 1350], [2500, 1550], [18000, 1550], [21000, 1150], [23200, 600], [24400, 220], [LEN - RAKE, 0]]; // …and at the waterline
const at = (chain, u) => {
  if (u <= chain[0][0]) return chain[0][1];
  for (let i = 1; i < chain.length; i++) {
    const [u0, v0] = chain[i - 1];
    const [u1, v1] = chain[i];
    if (u <= u1) return u1 === u0 ? v1 : v0 + ((v1 - v0) * (u - u0)) / (u1 - u0);
  }
  return chain.at(-1)[1];
};
/** The flight deck seen from above, clockwise from the port quarter: [u, v]. */
const OUTLINE = [...PORT, ...STAR.slice(0, -1).reverse()];
const ISLAND = keel(DECK.island[0], DECK.island[2]);

/* ───────────────────────────────────────────────────────────── small tools */

const lineSet = (segs, mat, order = 3) => {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(segs);
  const obj = new LineSegments2(geo, mat);
  obj.frustumCulled = false;
  obj.renderOrder = order;
  return obj;
};
const seg = (list, a, b) => {
  if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) > 1) list.push(...a, ...b);
};
/** In the hull's group: v to +x, u to −z. */
const L = (u, v, y = 0) => [v, y, -u];

const PAINT_GLSL = /* glsl */ `
  // paint drawn like on a map: never less than px pixels on each side of its line (far away it stays readable),
  // never more than four (under the lens it stays a line, not a white slab)
  float mark(float x, float size, float px) {
    float w = max(fwidth(x), 1e-4);
    float h = clamp(size, w * px, w * max(px, 4.0));
    return (1.0 - smoothstep(h - w * 0.75, h + w * 0.75, abs(x))) * (1.0 - smoothstep(700.0, 2600.0, w * px));
  }
  float span(float z, float from, float to) { float w = max(fwidth(z), 1.0); return smoothstep(from - w, from + w, z) * (1.0 - smoothstep(to - w, to + w, z)); }
  float sdBox(vec2 p, vec2 c, vec2 h) { vec2 d = abs(p - c) - h; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
  float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a; vec2 ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / max(dot(ba, ba), 1e-3), 0.0, 1.0)); }
`;

/* The deck is its paint: the strip's two edges, its axis, a ladder of ticks, the threshold; off the strip, fainter,
   two lifts, a catapult's track, the plating. Around the film's wire, a panel of the deck is a pane (`uUnder`). */
const paintMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uAmount: { value: 1 }, uUnder: { value: 0 },
      uEnd: { value: DECK.end }, uStern: { value: DECK.stern }, uHalf: { value: DECK.half }, uKeel: { value: new THREE.Vector2(SIN, COS) },
      uEdge: { value: new THREE.Vector2(EDGE.port, EDGE.star) }, uWindow: { value: new THREE.Vector2(...WINDOW) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSignal; uniform float uAmount, uUnder, uEnd, uStern, uHalf; uniform vec2 uKeel, uEdge, uWindow;
      varying vec3 vW;
      ${PAINT_GLSL}
      float gline(float q) { float w = max(fwidth(q) * 1.5, 1e-5); return 1.0 - smoothstep(0.0, w, abs(fract(q - 0.5) - 0.5)); }
      // a level of the plating leaves before its cells get too small to draw: no shimmer, no grey slab toward the horizon
      float level(vec2 p, float cell) {
        vec2 q = p / cell; vec2 fw = fwidth(q);
        return smoothstep(7.0, 24.0, 1.0 / max(max(fw.x, fw.y), 1e-5)) * max(gline(q.x), gline(q.y));
      }
      void main() {
        float x = vW.x; float z = vW.z;
        vec2 k = vec2(x * uKeel.x - (z - uStern) * uKeel.y, x * uKeel.y + (z - uStern) * uKeel.x); // the keel's frame
        float inStrip = 1.0 - smoothstep(uHalf, uHalf + 12.0, abs(x));
        float strip = span(z, uEnd, uStern - 260.0);
        float zt = (z - uEnd) / 1500.0;
        float ticks = mark((fract(zt + 0.5) - 0.5) * 1500.0, 6.0, 1.05) * smoothstep(uHalf - 340.0, uHalf - 310.0, abs(x)) * inStrip
          * smoothstep(5.0, 12.0, 1500.0 / max(fwidth(z), 1e-3));
        float paint = strip * (mark(abs(x) - uHalf, 7.0, 1.3) * 0.62 + mark(x, 5.0, 1.05) * 0.42 + ticks * 0.42)
          + mark(z - (uStern - 260.0), 9.0, 1.3) * inStrip * 0.5;
        // off the strip: the two lifts to starboard, the bow catapult's track
        float lifts = min(sdBox(k, vec2(3500.0, 1750.0), vec2(900.0, 450.0)), sdBox(k, vec2(5900.0, 1750.0), vec2(900.0, 450.0)));
        paint += mark(lifts, 8.0, 1.0) * 0.26 + mark(sdSeg(k, vec2(15200.0, 420.0), vec2(25300.0, 0.0)), 8.0, 1.0) * 0.24;
        float plating = max(level(k, 500.0) * 0.5, level(k, 2500.0)) * 0.12;
        // the tie-downs: a lattice of small bright points, drawn only where they stand apart — near the eye, they are the deck
        vec2 fk = max(fwidth(k), vec2(1e-4));
        vec2 cell = (fract(k / 250.0) - 0.5) * 250.0;
        float rr = length(cell / max(vec2(5.0), fk * 1.15));
        float big = smoothstep(3.0, 9.0, 5.0 / max(fk.x, fk.y)); // its radius, in pixels
        float studs = (1.0 - smoothstep(0.6, 1.0, rr)) * mix(1.0, 0.2 + 0.8 * smoothstep(0.32, 0.56, rr), big) * smoothstep(5.0, 16.0, 250.0 / max(fk.x, fk.y));
        plating += studs * 0.34;
        // from high up the deck is a plate a shade lighter than the night, and the strip a shade lighter than the deck
        float high = smoothstep(6000.0, 20000.0, cameraPosition.y);
        plating += high * (0.02 + 0.03 * strip * inStrip);
        // the pane over the brake: its frame, a breath of reflection, and the paint that crosses it steps back
        float sd = sdBox(vec2(x, z), vec2(0.0), uWindow);
        float pane = 1.0 - smoothstep(-12.0, 12.0, sd);
        float band = fract((x * 0.55 + z * 1.9) / 1700.0 + 0.2) - 0.5;
        float sheen = exp(-band * band * 60.0);
        vec3 col = uInk * (paint * (1.0 - 0.6 * pane * uUnder) + plating * (1.0 - pane * uUnder));
        col += uInk * (smoothstep(0.25, 1.0, uUnder) * (mark(sd, 9.0, 1.15) * 0.4 + mark(sd - 46.0, 4.0, 1.0) * 0.18) + uUnder * pane * (0.012 + 0.03 * sheen));
        // the last metre before the void
        float lip = (1.0 - smoothstep(uEnd + 10.0, uEnd + 110.0, z)) * smoothstep(uEdge.x - 40.0, uEdge.x, x) * (1.0 - smoothstep(uEdge.y, uEdge.y + 40.0, x));
        col += uSignal * lip * 0.5;
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });

/* What the deck hides of what lies under it, when it is a deck: the scene's own dark laid over the bay. It only ever
   darkens solids standing UNDER the deck (it is drawn before every line, glow and glass, and tests its depth). */
const lidMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(BRAND.bg) }, uAlpha: { value: 0 } },
    vertexShader: /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAlpha; varying vec3 vW;
      void main() {
        float a = (1.0 - smoothstep(1500.0, 1760.0, abs(vW.x))) * (1.0 - smoothstep(2400.0, 3000.0, abs(vW.z)));
        gl_FragColor = vec4(uColor, uAlpha * a);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the sea and the sky

   Drawn at infinity, after everything: nothing here is an object the far plane could cut. The sea is where each ray
   of the eye meets the plane DECK.sea: the swell as broken crests, in four sizes — each leaves before its lines get
   too close to draw —, sliding astern with the ship's way; the wake behind the transom, the bow's wave; and, past
   the end of the angled deck, on the landing axis, the threat: a low signal light on the water, a core and a long
   tail running to the horizon, under the dawn it mirrors. */
const backdropMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uAmount: { value: 1 }, uTravel: { value: 0 },
      uSea: { value: DECK.sea }, uEnd: { value: DECK.end }, uStern: { value: OZ }, uKeel: { value: new THREE.Vector2(SIN, COS) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position; // the dome follows the eye and never turns: the horizon stays level, and stays far
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSignal; uniform float uAmount, uTravel, uSea, uEnd, uStern; uniform vec2 uKeel;
      varying vec3 vDir;
      ${PAINT_GLSL}
      // one size of swell: crests across the ship's way, a little askew, never straight, each broken where it likes
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
      void main() {
        vec3 d = normalize(vDir);
        float h = max(cameraPosition.y - uSea, 1.0); // the eye above the water
        float below = smoothstep(0.0, 0.0015, -d.y);
        float t = h / max(-d.y, 1e-4);
        vec2 p = cameraPosition.xz + d.xz * t; // where the ray meets the water: (x, z)
        vec2 k = vec2(p.x * uKeel.x - (p.y - uStern) * uKeel.y, p.x * uKeel.y + (p.y - uStern) * uKeel.x); // the keel's frame
        vec2 s = vec2(k.x + uTravel, k.y);
        // (the brightest size wins: added up, the crests they share would be four times too bright)
        float swell = max(max(crest(s, 620.0) * 0.5, crest(s, 2480.0) * 0.72), max(crest(s, 9920.0) * 0.9, crest(s, 39680.0)));
        // water mirrors little seen from above, a lot toward the horizon
        float graze = 0.42 + 0.58 * pow(clamp(1.0 + d.y, 0.0, 1.0), 6.0);
        float far = exp(-t / 900000.0);

        // the wake: streaks along the ship's way (they do not hop: they slide along themselves), fanning out astern
        float aft = -k.x;
        float halfW = 1250.0 + 0.1 * max(aft, 0.0);
        float inWake = smoothstep(-300.0, 900.0, aft) * (1.0 - smoothstep(halfW * 0.55, halfW, abs(k.y))) * exp(-max(aft, 0.0) / 70000.0);
        float sq = k.y / 300.0 + 0.16 * sin(s.x / 1500.0) + 0.1 * sin(s.x / 610.0 + k.y / 400.0);
        float sfw = max(fwidth(sq), 1e-5);
        float foam = smoothstep(0.2, 0.7, 0.5 + 0.5 * sin(s.x / 1300.0 + floor(sq + 0.5) * 2.399));
        float streaks = smoothstep(4.0, 12.0, 1.0 / sfw) * foam * (1.0 - smoothstep(0.0, sfw * 2.0, abs(fract(sq - 0.5) - 0.5)));
        float wake = inWake * (0.8 * streaks + 0.16);
        vec3 col = uInk * (swell * 0.13 * graze + wake * 0.3) * far * below;

        // past the end of the deck, on the landing axis: the light on the water
        float dz = uEnd - p.y;
        float wide = 420.0 + 0.045 * max(dz, 0.0);
        float lat = p.x / wide;
        float c = (dz - 11000.0) / 7000.0;
        float run = smoothstep(1200.0, 7000.0, dz) * exp(-max(dz - 9000.0, 0.0) / 80000.0);
        float path = run * exp(-lat * lat * 1.6) * (0.1 + 0.45 * exp(-c * c) + 1.5 * swell);
        col += uSignal * path * 0.85 * below;

        // the horizon: a thin line and the air above it; three strata of cloud; and dead ahead of the landing axis, the dawn
        float air = 0.11 * exp(-abs(d.y) / 0.0018) + step(0.0, d.y) * 0.028 * exp(-d.y / 0.11);
        float cloud = stratum(d, h, 30000.0, 500000.0, 0.0026, 9.0, 23.0, 0.6) * 0.06
          + stratum(d, h, 90000.0, 900000.0, 0.004, 7.0, 17.0, 2.1) * 0.045
          + stratum(d, h, 220000.0, 1500000.0, 0.006, 5.0, 13.0, 4.0) * 0.035;
        float az = atan(d.x, -d.z + 1e-6);
        float ahead = step(0.0, -d.z);
        float dawn = ahead * ((0.5 * exp(-az * az / 0.0025) + 0.08 * exp(-abs(az) / 0.15)) * exp(-abs(d.y) / 0.008)
          + 0.07 * exp(-az * az / 0.03) * step(0.0, d.y) * exp(-d.y / 0.06));
        float sky = step(0.0, d.y);
        col += uInk * (air + cloud * sky) + uSignal * (dawn * 0.9 + cloud * sky * ahead * exp(-az * az / 0.06) * 1.6);
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── an aircraft gone around

   One light, beyond the end of the deck, climbing away: a bright core in a soft halo, and behind it the line it
   has just drawn. `uAway` 0–1 is how far it has climbed; the path is the same here and in `awayAt`. */
const AWAY = { x: -900, y0: 320, y: 9000, z0: DECK.end - 2500, z: -60000, back: 0.4 };
const awayAt = (a, out) => out.set(AWAY.x * a * a, AWAY.y0 + AWAY.y * Math.pow(Math.max(a, 0), 1.4), AWAY.z0 + AWAY.z * a);
function makeAway() {
  const N = 28;
  const data = [];
  const index = [];
  for (const c of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) data.push(c[0], c[1], 1);
  index.push(0, 1, 2, 1, 3, 2);
  for (let i = 0; i <= N; i++) {
    data.push(i / N, -1, 0, i / N, 1, 0);
    if (i < N) {
      const a = 4 + i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(data, 3));
  geo.setIndex(index);
  const uniforms = {
    uAway: { value: 0 }, uAmount: { value: 0 }, uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() },
    uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) },
    uPath: { value: new THREE.Vector4(AWAY.x, AWAY.y0, AWAY.y, AWAY.z0) }, uRun: { value: new THREE.Vector2(AWAY.z, AWAY.back) },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uAway; uniform vec2 uView, uRun; uniform vec4 uPath;
        varying vec3 vQ;
        vec3 path(float a) { a = max(a, 0.0); return vec3(uPath.x * a * a, uPath.y + uPath.z * pow(a, 1.4), uPath.w + uRun.x * a); }
        void main() {
          vQ = position;
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          mat4 pv = projectionMatrix * viewMatrix;
          if (position.z > 0.5) {
            // the light itself: never smaller than a star
            vec4 c = pv * vec4(path(uAway), 1.0);
            if (c.w > 10.0) {
              float size = max(72.0, 420.0 * projectionMatrix[1][1] * 0.5 * uView.y / c.w);
              c.xy += position.xy * size * 2.0 / uView * c.w;
              gl_Position = c;
            }
          } else {
            // the line it has just drawn: a ribbon a few pixels wide, laid across its run on the screen
            float a = uAway - position.x * min(uRun.y, uAway);
            vec4 c0 = pv * vec4(path(a), 1.0);
            vec4 c1 = pv * vec4(path(a + 0.004), 1.0);
            if (c0.w > 10.0 && c1.w > 10.0) {
              vec2 run = (c1.xy / c1.w - c0.xy / c0.w) * uView;
              float l = length(run);
              vec2 n = l > 1e-4 ? vec2(-run.y, run.x) / l : vec2(1.0, 0.0);
              c0.xy += n * position.y * mix(6.0, 2.0, position.x) / uView * c0.w;
              gl_Position = c0;
            }
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uSignal; uniform float uAmount; varying vec3 vQ;
        void main() {
          vec3 col;
          if (vQ.z > 0.5) {
            float r = length(vQ.xy);
            float core = exp(-r * r * 110.0);
            float halo = pow(clamp(1.0 - r, 0.0, 1.0), 3.2);
            col = uInk * core * 3.2 + uSignal * (halo * 0.75 + core * 1.6);
          } else {
            col = uSignal * (1.0 - abs(vQ.y)) * pow(clamp(1.0 - vQ.x, 0.0, 1.0), 1.7) * 1.25;
          }
          gl_FragColor = vec4(col * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 62;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the ship */

export function buildCarrier() {
  const group = new THREE.Group();
  const fx = {};
  const A = {};

  // the hull's own group: the keel's frame — v to +x, u to −z
  const hull = new THREE.Group();
  hull.position.set(0, 0, OZ);
  hull.rotation.y = -DECK.skew * DEG;
  group.add(hull);

  /* ── the hull: on each side the deck's edge, the overhang, the side down to the water ── */
  const stations = [...new Set([...PORT, ...STAR, ...MID, ...WATER].map(([u]) => u).concat(Array.from({ length: LEN / 1000 + 1 }, (_, i) => i * 1000)))].sort((a, b) => a - b);
  const stem = (y) => LEN - RAKE * (y / DECK.sea);
  const section = (u, side) => {
    const edge = side < 0 ? at(PORT, u) : at(STAR, u);
    const low = (chain, y) => {
      const us = Math.min(u, stem(y)); // past the stem there is no hull: the rows gather on its line
      return L(us, u >= stem(y) ? 0 : side * at(chain, u), y);
    };
    return [L(u, edge, 0), L(u, edge, -SLAB), low(MID, CHINE), low(WATER, DECK.sea)];
  };
  const under = []; // the hull's lines: they stay under the deck when it is seen from above
  const ribs = [];
  const panes = [];
  for (const side of [-1, 1]) {
    const rows = stations.map((u) => section(u, side));
    const pos = rows.flat(2);
    const index = [];
    for (let i = 0; i < rows.length - 1; i++) {
      for (let j = 0; j < 3; j++) {
        const a = i * 4 + j;
        index.push(a, a + 4, a + 1, a + 1, a + 4, a + 5);
      }
      seg(under, rows[i][1], rows[i + 1][1]);
      seg(under, rows[i][3], rows[i + 1][3]);
      seg(ribs, rows[i][2], rows[i + 1][2]);
    }
    rows.forEach((r, i) => {
      if (stations[i] % 2000 === 0 && stations[i] > 0 && stations[i] < 25000) for (let j = 0; j < 3; j++) seg(ribs, r[j], r[j + 1]);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(index);
    panes.push(toCreasedNormals(geo, 36 * DEG));
  }
  seg(under, L(LEN, 0, 0), L(LEN - RAKE, 0, DECK.sea)); // the stem
  // the transom, and over it the round-down: the deck's after edge rolled downward
  const T = [section(0, -1), section(0, 1)];
  const transom = new THREE.ShapeGeometry(new THREE.Shape([...T[0], ...T[1].slice().reverse()].map(([x, y]) => new THREE.Vector2(x, y))));
  for (const row of T) for (let j = 0; j < 3; j++) seg(under, row[j], row[j + 1]);
  seg(under, T[0][3], T[1][3]);
  seg(under, T[0][1], T[1][1]);
  panes.push(transom);
  const ROUND = 260;
  const roll = [...Array.from({ length: 7 }, (_, i) => [-ROUND * Math.sin((i * 15 * Math.PI) / 180), -ROUND * (1 - Math.cos((i * 15 * Math.PI) / 180))]), [-ROUND, -ROUND - 70], [0, -ROUND - 320]];
  const [vp, vs] = [PORT[0][1], STAR[0][1]];
  {
    const pos = [];
    const index = [];
    roll.forEach(([u, y], i) => {
      pos.push(...L(u, vp, y), ...L(u, vs, y));
      if (i < roll.length - 1) index.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(index);
    panes.push(toCreasedNormals(geo, 50 * DEG));
  }
  const rolled = []; // two lines along the round-down: what says the deck's edge is rounded
  for (const i of [3, 6]) seg(rolled, L(roll[i][0], vp, roll[i][1]), L(roll[i][0], vs, roll[i][1]));
  for (const v of [vp, vs]) for (let i = 0; i < roll.length - 1; i++) seg(rolled, L(roll[i][0], v, roll[i][1]), L(roll[i + 1][0], v, roll[i + 1][1]));

  fx.hull = glass(BRAND.ink, { base: 0.003, rim: 0.06, power: 3.2, edge: 0.035, through: 0.3 });
  const shell = panes.map((geo) => new THREE.Mesh(geo, fx.hull));
  for (const mesh of shell) {
    mesh.frustumCulled = false;
    hull.add(mesh);
  }

  /* ── the island, to starboard: stacked blocks, the bridge and its band of windows, a mast, two domes ── */
  fx.island = glass(BRAND.ink, { base: 0.004, rim: 0.09, power: 2.6, edge: 0.05, through: 0.25 });
  const islandLines = [];
  const windows = [];
  const island = new THREE.Group();
  island.position.set(ISLAND[1], 0, -ISLAND[0]);
  hull.add(island);
  // [width, height, length, to starboard, up, forward]
  const BLOCKS = [
    [560, 620, 2700, 0, 310, 0], //       the base
    [500, 380, 2000, 0, 810, 150], //     the deck of the bridges
    [640, 250, 1000, 0, 1125, 600], //    the navigation bridge, overhanging
    [260, 220, 620, -330, 1110, -500], // the aviation bridge: it looks at the strip
    [380, 560, 620, 30, 1280, -640], //   the uptakes
    [220, 500, 220, 0, 1500, 150], //     the mast's foot
    [110, 900, 110, 0, 2200, 150], //     the mast
    [1100, 40, 40, 0, 2180, 150], //      its yard
    [360, 40, 360, 0, 1770, 150], //      a platform
    [60, 150, 560, 0, 2725, 150], //      the antenna on top
  ];
  for (const [w, h, l, v, y, u] of BLOCKS) {
    const geo = new THREE.BoxGeometry(w, h, l);
    const mesh = new THREE.Mesh(geo, fx.island);
    mesh.position.set(v, y, -u);
    island.add(mesh);
    shell.push(mesh);
    const e = new THREE.EdgesGeometry(geo).attributes.position.array;
    for (let i = 0; i < e.length; i += 3) islandLines.push(e[i] + v, e[i + 1] + y, e[i + 2] - u);
  }
  for (const [r, v, y, u] of [[190, 0, 1250 + 185, 720], [125, 0, 620 + 120, -1120]]) {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 36, 22), fx.island);
    dome.position.set(v, y, -u);
    island.add(dome);
    shell.push(dome);
  }
  // the band of windows around the navigation bridge, and along the aviation bridge
  for (const [w, l, v, y, u] of [[640, 1000, 0, 1150, 600], [260, 620, -330, 1130, -500]]) {
    const c = [[-w / 2, -l / 2], [w / 2, -l / 2], [w / 2, l / 2], [-w / 2, l / 2]].map(([dx, dz]) => [v + dx * 1.004, y, -u + dz * 1.004]);
    c.forEach((p, i) => seg(windows, p, c[(i + 1) % 4]));
  }
  asShell(shell, 60);

  /* ── the lines ── */
  const outline = [];
  OUTLINE.forEach((p, i) => {
    const q = OUTLINE[(i + 1) % OUTLINE.length];
    if (!(p === END_PORT && q === END_STAR)) seg(outline, L(p[0], p[1], 0.6), L(q[0], q[1], 0.6));
  });
  // the nets hung outside the deck's edge, to port and around the end of the angled deck
  const nets = [];
  const net = (a, b) => {
    const [du, dv] = [b[0] - a[0], b[1] - a[1]];
    const len = Math.hypot(du, dv);
    const n = [-dv / len, du / len]; // outward: the outline runs clockwise in (v, u)
    const out = ([u, v]) => L(u + n[0] * 170, v + n[1] * 170, -55);
    const count = Math.max(1, Math.round(len / 680));
    for (let i = 0; i <= count; i++) {
      const p = [a[0] + (du * i) / count, a[1] + (dv * i) / count];
      seg(nets, L(p[0], p[1], -12), out(p));
    }
    seg(nets, out(a), out(b));
  };
  net(PORT[1], PORT[2]);
  net(PORT[2], PORT[3]);
  net(PORT[3], PORT[4]);
  fx.outline = lineMat(BRAND.ink, 2.4, { opacity: 0.85 });
  fx.edge = lineMat(BRAND.signal, 3.2, { opacity: 1, hdr: 1.5 }); // THE edge: where the landing strip ends
  fx.under = lineMat(BRAND.ink, 2, { opacity: 0.42 });
  fx.ribs = lineMat(BRAND.ink, 1.8, { opacity: 0.2 });
  fx.rolled = lineMat(BRAND.ink, 2, { opacity: 0.5 });
  fx.nets = lineMat(BRAND.ink, 1.8, { opacity: 0.24 });
  fx.islandLines = lineMat(BRAND.ink, 2, { opacity: 0.62 });
  fx.windows = lineMat(BRAND.ink, 2.6, { opacity: 0.95 });
  hull.add(
    lineSet(outline, fx.outline),
    lineSet([...L(END_PORT[0], END_PORT[1], 0.8), ...L(END_STAR[0], END_STAR[1], 0.8)], fx.edge),
    lineSet(under, fx.under, 58),
    lineSet(ribs, fx.ribs, 58),
    lineSet(rolled, fx.rolled),
    lineSet(nets, fx.nets),
  );
  island.add(lineSet(islandLines, fx.islandLines), lineSet(windows, fx.windows));
  fx.shellLines = [fx.outline, fx.edge, fx.under, fx.ribs, fx.rolled, fx.nets, fx.islandLines, fx.windows];

  /* ── the deck: what it hides, and its paint ── */
  const deckGeo = new THREE.ShapeGeometry(new THREE.Shape(OUTLINE.map(([u, v]) => new THREE.Vector2(v, u)))).rotateX(-Math.PI / 2);
  const hold = new THREE.Mesh(deckGeo, new THREE.MeshBasicMaterial({ colorWrite: false, transparent: true, depthWrite: true, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 24 }));
  hold.position.y = -8;
  hold.renderOrder = 57;
  hold.frustumCulled = false;
  fx.paint = paintMat();
  const paint = new THREE.Mesh(deckGeo, fx.paint);
  paint.position.y = 1.2;
  paint.renderOrder = 61;
  paint.frustumCulled = false;
  hull.add(hold, paint);

  fx.lid = lidMat();
  const lid = new THREE.Mesh(new THREE.PlaneGeometry(3600, 6200).rotateX(-Math.PI / 2), fx.lid);
  lid.position.y = -5;
  lid.renderOrder = -5;
  lid.onBeforeRender = (renderer, scene) => {
    if (scene.background?.isColor) fx.lid.uniforms.uColor.value.copy(scene.background); // the scene's own dark, whatever the mood made it
  };
  group.add(lid);

  /* ── the brake's bay, under the pane: its walls in fine lines, a pool of light on its floor ── */
  const bay = [];
  const [BX, BZ] = WINDOW;
  const FLOOR = ENGINE.y - ENGINE.half[1] - 110;
  const TOP = -14;
  for (const y of [FLOOR, TOP]) {
    seg(bay, [-BX, y, -BZ], [BX, y, -BZ]);
    seg(bay, [BX, y, -BZ], [BX, y, BZ]);
    seg(bay, [BX, y, BZ], [-BX, y, BZ]);
    seg(bay, [-BX, y, BZ], [-BX, y, -BZ]);
  }
  for (let x = -BX; x <= BX + 1; x += 700) for (const z of [-BZ, BZ]) seg(bay, [x, FLOOR, z], [x, TOP, z]); // frames
  const bayFloor = [];
  for (let x = -BX + 350; x < BX; x += 350) seg(bayFloor, [x, FLOOR, -BZ], [x, FLOOR, BZ]);
  for (const z of [-BZ / 2, 0, BZ / 2]) seg(bayFloor, [-BX, FLOOR, z], [BX, FLOOR, z]);
  fx.bay = lineMat(BRAND.ink, 2, { opacity: 0.36 });
  fx.bayFloor = lineMat(BRAND.ink, 1.8, { opacity: 0.13 });
  fx.bayPool = makePool({ radius: 1, color: BRAND.ink });
  fx.bayPool.mesh.scale.set(BX * 1.05, BZ * 1.25, 1);
  fx.bayPool.mesh.position.set(0, FLOOR + 3, 0);
  const bayGroup = new THREE.Group();
  bayGroup.add(lineSet(bay, fx.bay), lineSet(bayFloor, fx.bayFloor), fx.bayPool.mesh);
  group.add(bayGroup);

  /* ── the two other wires: a cable across the strip, a sheave lying on the deck at each end ── */
  const others = makePart("others");
  const steel = solid(0x9b9d98, { rough: 0.42, metal: 0.45 });
  const iron = solid(0x565b5f, { rough: 0.6, metal: 0.3 });
  const plate = solid(0x24292d, { rough: 0.8, metal: 0.2 });
  const R = 2.1;
  for (const z of [BRINS.z[0], BRINS.z[2]]) {
    addMesh(others, new THREE.CylinderGeometry(R, R, BRINS.half * 2, 20, 1).rotateZ(Math.PI / 2), steel, { pos: [0, BRINS.lift, z], edges: false });
    // from far away a cable is thinner than a pixel: a line along its crest keeps it in the picture
    const crest = fatLine([[-BRINS.half, BRINS.lift + R + 0.5, z], [BRINS.half, BRINS.lift + R + 0.5, z]], { width: 3.2, opacity: 0.95 });
    others.userData.part.mats.add(crest.material);
    others.add(crest);
    for (const side of [-1, 1]) {
      const x = side * (BRINS.half + 4);
      addMesh(others, box(96, 4, 84, 1.2), plate, { pos: [x, 2, z + 26], edgeOpacity: 0.45 });
      addMesh(others, cyl(25, 8, 1.4, 44), iron, { pos: [x, BRINS.lift, z + 26], edgeOpacity: 0.6 });
      addMesh(others, cyl(8.5, 12, 1.2, 28), steel, { pos: [x, BRINS.lift, z + 26], edgeOpacity: 0.5 });
    }
  }
  group.add(others);
  A.brinAft = anchor(group, 0, BRINS.lift, BRINS.z[0]);
  A.brinFwd = anchor(group, 0, BRINS.lift, BRINS.z[2]);

  /* ── the deck hands: five figures of glass, to starboard, clear of the strip, near the wires ── */
  const hands = new THREE.Group();
  group.add(hands);
  fx.crew = [];
  const stand = (x, z, face, pose) => {
    const fig = makeFigure({ skin: 0x8d887d, glassK: 0.8, shell: true, order: 30, through: 0.12 });
    fig.flesh.transparent = true; // it fades with the others
    fig.group.position.set(x, 0, z);
    fig.group.rotation.y = face * DEG;
    pose?.(fig);
    hands.add(fig.group);
    fx.crew.push(fig);
    return fig;
  };
  // crouched at the strip's edge, one hand to the deck: the one who watches the wire
  stand(1680, 1150, -90, (f) => {
    f.group.position.y = -40;
    f.leg("L", V(9, 48, 16));
    f.leg("R", V(-10, 48, -10), V(0.2, 0, 1));
    f.reach("L", V(24, 62, 34));
    f.reach("R", V(-16, 100, 30));
    f.lean(30, 0, 0);
  });
  // standing, an arm raised toward the aircraft coming
  A.crew = stand(1760, 1400, -37, (f) => {
    f.reach("R", V(-30, 192, 14));
    f.lean(-3, 0, 0);
  }).head;
  stand(2000, 620, -92, (f) => {
    f.reach("L", V(17, 104, 14), V(1, -0.2, -0.6));
    f.reach("R", V(-17, 104, 14), V(-1, -0.2, -0.6));
  });
  // turned aft: he watches it come
  stand(1780, 60, -14, (f) => {
    f.reach("L", V(13, 150, 20), V(1, -0.6, 0));
    f.lean(-4, 0, 0);
  });
  stand(2200, -300, -104);

  /* ── an aircraft gone around, the sea, the sky ── */
  fx.away = makeAway();
  group.add(fx.away.mesh);
  A.away = anchor(group, 0, AWAY.y0, AWAY.z0);

  fx.backdrop = backdropMat();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), fx.backdrop);
  dome.frustumCulled = false;
  dome.renderOrder = 100; // last: whatever wrote its depth hides the sea and the sky behind it
  group.add(dome);

  A.end = anchor(group, 0, 0, DECK.end);
  A.stern = anchor(group, 0, 0, DECK.stern);
  A.island = anchor(group, DECK.island[0], 1100, DECK.island[2]);
  A.mast = anchor(island, 0, 2650, -150);
  A.bay = anchor(group, 0, ENGINE.y, 0);
  A.bow = anchor(group, ...ship(LEN, 0));
  A.sea = anchor(group, 0, DECK.sea, DECK.end - 11000); // the core of the light on the water

  /**
   * Everything 0–1 (see FIRST in world.js):
   *   shell   the X-ray of the ship: the hull, the island, the deck's paint and what the deck hides
   *   sea     the sea and the sky: the swell going by, the wake, the horizon, the light on the water past the end of the deck
   *   under   0 a deck: what lies under it is dark · 1 a pane over the brake, its bay lit
   *   others  the two other wires · crew  the deck hands · away  the light of an aircraft gone around: how far it has climbed
   */
  function update(P = {}, time = 0) {
    const sh = clamp01(P.shell ?? 1);
    const sea = clamp01(P.sea ?? 1);
    const un = clamp01(P.under ?? 0);
    const crew = clamp01(P.crew ?? 0);
    const away = clamp01(P.away ?? 0);

    hull.visible = sh > 0.003;
    fx.hull.uniforms.uAmount.value = sh;
    fx.island.uniforms.uAmount.value = sh;
    for (let i = 0; i < fx.shellLines.length; i++) fx.shellLines[i].opacity = fx.shellLines[i].userData.base * sh;
    fx.paint.uniforms.uAmount.value = sh;
    fx.paint.uniforms.uUnder.value = un;

    const there = clamp01(sh * 4);
    fx.lid.uniforms.uAlpha.value = (1 - smooth(0, 1, un)) * there;
    lid.visible = there * (1 - un) > 0.003;
    const lit = un * there;
    const open = smooth(0.35, 1, lit);
    bayGroup.visible = open > 0.003;
    fx.bay.opacity = fx.bay.userData.base * open;
    fx.bayFloor.opacity = fx.bayFloor.userData.base * open;
    fx.bayPool.uniforms.uAmount.value = 0.16 * open;

    setPartOpacity(others, clamp01(P.others ?? 1));

    hands.visible = crew > 0.004;
    for (let i = 0; i < fx.crew.length; i++) {
      fx.crew[i].body.uniforms.uAmount.value = crew;
      fx.crew[i].flesh.opacity = crew;
    }

    fx.away.mesh.visible = away > 0.002;
    fx.away.uniforms.uAway.value = away;
    fx.away.uniforms.uAmount.value = smooth(0, 0.06, away) * (1 - 0.35 * away);
    awayAt(away, A.away.position);

    dome.visible = sea > 0.003;
    fx.backdrop.uniforms.uAmount.value = sea;
    fx.backdrop.uniforms.uTravel.value = time * SPEED;
  }
  update();

  return { group, hull, fx, A, update };
}
