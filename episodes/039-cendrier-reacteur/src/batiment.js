// DOSSIER 039 — AROUND the system, X-ray: 005's vessel over the pit, the basement of the reactor building, and far
// away the next file's teaser. Centimetres, y up, the frame of plan.js. Glass and fine lines only: nothing solid
// here but the shelters of the teaser (the next film's system) — the solid things are model.js's and corium.js's.
//
//   reactor    005's vessel (episodes/005-arret-urgence/src/reactor.js, IMPORTED, never modified): its group is moved
//              from REACTOR.x to VESSEL.at. Wrapped, not edited: its glass gets a fade toward its head (patched on
//              this instance only), its lines get a vertex colour that fades the same way, and the lower head (the
//              hemisphere the melt pierces) gets parallels and meridians of its own — from underneath, glass alone is
//              an empty disc. The rods are in (`fall` 1: the reactor has scrammed) and yet the fuel glows: what
//              melts a core is the heat that is left; 005's shader darkens the fuel above the rods' tips, so the
//              front is pushed out of the core after each update.
//   building   the pit's structural concrete (a square block with its bore), the channel's tunnel, the chamber's
//              room (walls only: a glass ceiling or floor seen grazing is a grey slab), the containment's wall
//              curving BEHIND (an arc, never between the usual camera and the plant), fading out above
//              BASEMENT.fade, and a floor grid at BASEMENT.floor. The decorator dresses it (src/habillage.js).
//   teaser     the next file (040): a cluster of fire shelters on open ground, a line of fire closing round them,
//              embers rising — far from everything (TEASER.at): the two sets never see each other.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, lineMat, solid, anchor } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { buildReactor } from "../../005-arret-urgence/src/reactor.js";
import { VESSEL, PIT, CHANNEL, CHAMBER, BASEMENT, POOL, TEASER } from "./plan.js";
import { dressBatiment } from "./habillage.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* 005's vessel in its own frame (y 0 = the top of the fuel): the lower head's centre and the head's top, from plan.js */
const LOCAL = { belly: VESSEL.belly - VESSEL.at[1], head: VESSEL.head - VESSEL.at[1] };
/** Over this height (005's frame), the vessel's glass and lines melt into the dark: its head never lights the header. */
const VESSEL_FADE = [300, LOCAL.head + 10];
/** The lift of the vessel in the exploded view. */
const LIFT = 700;
/** The building's line weight and brightness (the decorator's touches come on top of it). */
const LINE = { width: 1.8, opacity: 0.34 };

/* ───────────── shaders ───────────── */

/** The fire's front is not a circle (a burner): its radius wavers with the azimuth θ = atan2(x, z). Same in GLSL. */
const front = (th) => 1 + 0.1 * Math.sin(3 * th + 0.7) + 0.06 * Math.sin(7 * th + 2.1);
const FRONT_GLSL = "float front(float th) { return 1.0 + 0.1 * sin(3.0 * th + 0.7) + 0.06 * sin(7.0 * th + 2.1); }";

/** A floor grid, lines only (no floor: X-ray), fading away from `centre`: a pixel and a half wide whatever the distance. */
function gridMaterial({ cell = 100, major = 5, fade = 2600, amount = 0.1 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone() }, uCell: { value: cell }, uMajor: { value: major }, uFade: { value: fade }, uAmount: { value: amount } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vP = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uCell, uMajor, uFade, uAmount; varying vec2 vP;
      float lines(vec2 p, float cell) {
        vec2 q = p / cell;
        vec2 w = max(fwidth(q) * 1.8, vec2(1e-5));
        vec2 d = abs(fract(q - 0.5) - 0.5);
        vec2 l = 1.0 - smoothstep(vec2(0.0), w, d);
        // where the lines would crowd under the pixel, they melt into an even grey instead of shimmering
        vec2 thin = 1.0 - smoothstep(vec2(0.18), vec2(0.45), w);
        return max(l.x * thin.x, l.y * thin.y);
      }
      void main() {
        float g = lines(vP, uCell) * 0.4 + lines(vP, uCell * uMajor);
        float fade = exp(-length(vP) / max(uFade, 1.0));
        gl_FragColor = vec4(uColor * g * fade * uAmount, 1.0);
      }`,
  });
}

/** The containment's wall: glass lit where it turns away, fading out with height (world y). */
function wallMaterial({ rim = 0.16, power = 2.6, fade = BASEMENT.fade } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uRim: { value: rim }, uPower: { value: power }, uFade: { value: new THREE.Vector2(...fade) }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vY = (modelMatrix * vec4(position, 1.0)).y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uRim, uPower, uAmount; uniform vec2 uFade; varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        if (uAmount < 0.003) discard;
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float fade = 1.0 - smoothstep(uFade.x, uFade.y, vY);
        gl_FragColor = vec4(uColor * uRim * pow(g, uPower) * fade * uAmount, 1.0);
      }`,
  });
  mat.fog = false;
  return mat;
}

/** 005's glass, on THIS instance: the same light, melting into the dark over `from`…`to` of its own height. */
function fadeGlassTop(mat, from, to) {
  const vIn = "void main() {";
  const fOut = "gl_FragColor = vec4(uColor * light * uAmount * uGain, 1.0);";
  if (!mat.vertexShader.includes(vIn) || !mat.fragmentShader.includes(fOut)) {
    console.warn("batiment.js: 005's glass changed, its head is not faded");
    return;
  }
  mat.uniforms.uFadeY = { value: new THREE.Vector2(from, to) };
  mat.vertexShader = mat.vertexShader.replace(vIn, "varying float vFadeY;\n      void main() {\n        vFadeY = position.y;");
  mat.fragmentShader = "uniform vec2 uFadeY; varying float vFadeY;\n" + mat.fragmentShader.replace(fOut, "gl_FragColor = vec4(uColor * light * uAmount * uGain * (1.0 - smoothstep(uFadeY.x, uFadeY.y, vFadeY)), 1.0);");
  mat.needsUpdate = true;
}

/** A line of fire on a band of height 1 (scaled), wrapped round the ring: tongues that rise and breathe, never blink. */
function fireMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: SIGNAL.clone() }, uTime: { value: 0 }, uGain: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uGain; varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      // value noise, periodic in x (the ring closes on itself without a seam)
      float noiseP(vec2 p, float period) {
        vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        float x0 = mod(i.x, period); float x1 = mod(i.x + 1.0, period);
        return mix(mix(hash(vec2(x0, i.y)), hash(vec2(x1, i.y)), u.x), mix(hash(vec2(x0, i.y + 1.0)), hash(vec2(x1, i.y + 1.0)), u.x), u.y);
      }
      void main() {
        float u = vUv.x * 72.0;
        float y = clamp(vUv.y, 0.0, 1.0);
        float n1 = noiseP(vec2(u, y * 2.6 - uTime * 1.1), 72.0);
        float n2 = noiseP(vec2(u * 2.0 + 7.0, y * 5.0 - uTime * 1.9), 144.0);
        // each tongue's height, breathing slowly
        float tip = 0.38 + 0.55 * noiseP(vec2(u * 0.5, uTime * 0.3), 36.0);
        float edge = y + 0.28 * (n1 - 0.5) + 0.14 * (n2 - 0.5);
        float body = 1.0 - smoothstep(tip * 0.35, tip, edge);
        float root = smoothstep(0.0, 0.05, y);
        float heat = body * root * (0.5 + 0.5 * n1);
        float k = heat * (0.45 + 1.7 * heat * (1.0 - y));
        gl_FragColor = vec4(uColor * k * uGain, 1.0);
      }`,
  });
}

/** The burning ground under the line of fire: a soft ring of light on the floor (radius 1, scaled). */
function emberGroundMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL.clone() }, uGain: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uGain, uTime; varying vec2 vP;
      ${FRONT_GLSL}
      void main() {
        float a = atan(vP.x, -vP.y); // the ring lies in xy, turned flat: z = −y
        float r = length(vP) / front(a);
        float x = (r - 1.0) / 0.07;
        float band = exp(-x * x);
        // the burnt side (outside) keeps a low glow, the side not yet burnt (inside) none
        float behind = smoothstep(1.0, 1.06, r) * (1.0 - smoothstep(1.06, 1.3, r)) * 0.25;
        float breath = 0.85 + 0.15 * sin(a * 9.0 + uTime * 0.8);
        gl_FragColor = vec4(uColor * (band * breath + behind) * uGain, 1.0);
      }`,
  });
}

/** Embers rising off the line of fire: every one a pure function of time (no state), soft dots, a few px wide. */
function makeEmbers(count, seed) {
  const r = rng(seed);
  const geo = new THREE.BufferGeometry();
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) seeds.set([r() * Math.PI * 2, r(), 0.12 + 0.2 * r(), r()], i * 4);
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aE", new THREE.BufferAttribute(seeds, 4));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL.clone() }, uTime: { value: 0 }, uR: { value: TEASER.ring }, uPx: { value: 1000 }, uGain: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute vec4 aE; uniform float uTime, uR, uPx; varying float vA;
      ${FRONT_GLSL}
      void main() {
        float rise = fract(uTime * aE.z + aE.y);
        float rad = uR * front(atan(cos(aE.x), sin(aE.x))) * (1.0 + (aE.w - 0.5) * 0.1) - rise * aE.w * 160.0;
        vec3 p = vec3(cos(aE.x) * rad, rise * 950.0, sin(aE.x) * rad);
        p.x += sin(uTime * 0.9 + aE.y * 31.0) * 30.0 * rise;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = clamp(11.0 * uPx / max(-mv.z, 1.0), 2.0, 9.0);
        vA = smoothstep(0.0, 0.08, rise) * (1.0 - smoothstep(0.45, 1.0, rise));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uGain; varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = 1.0 - smoothstep(0.3, 1.0, d);
        gl_FragColor = vec4(uColor * 2.2 * a * vA * uGain, 1.0);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return { points, mat };
}

/* ───────────── the builder ───────────── */

export function buildBatiment() {
  const group = new THREE.Group();

  /* ══ the vessel: 005's, moved over the pit ══ */
  const reactor = buildReactor();
  reactor.group.position.set(...VESSEL.at);
  const vesselMount = new THREE.Group(); // lifted in the exploded view
  vesselMount.add(reactor.group);
  group.add(vesselMount);
  const fx5 = reactor.fx;
  fadeGlassTop(fx5.shell, ...VESSEL_FADE);
  const vesselK = (y) => 1 - smooth(VESSEL_FADE[0], VESSEL_FADE[1], y);
  // 005's own lines (its circles, the barrel): the same fade, by a colour at each end
  const lines5 = reactor.group.children.find((c) => c.material === fx5.lines);
  if (lines5) {
    const pos = lines5.geometry.attributes.instanceStart.data.array;
    const cols = new Float32Array(pos.length);
    for (let i = 0; i < pos.length; i += 3) cols.fill(vesselK(pos[i + 1]), i, i + 3);
    lines5.geometry.setColors(cols);
    fx5.lines.vertexColors = true;
    fx5.lines.needsUpdate = true;
  }
  let headMat;
  // the lower head and the shell: parallels and meridians, a hair outside the glass (and outside corium.js's red skin)
  {
    const seg = [];
    const col = [];
    const r = VESSEL.r + 5;
    const c = LOCAL.belly;
    const head = (lat, lon) => [r * Math.cos(lat) * Math.cos(lon), c - r * Math.sin(lat), r * Math.cos(lat) * Math.sin(lon)];
    const push = (a, b) => {
      seg.push(...a, ...b);
      const ka = vesselK(a[1]);
      const kb = vesselK(b[1]);
      col.push(ka, ka, ka, kb, kb, kb);
    };
    for (const lat of [22, 44, 64, 80]) for (let k = 0; k < 72; k++) push(head(lat * DEG, (k / 72) * Math.PI * 2), head(lat * DEG, ((k + 1) / 72) * Math.PI * 2));
    for (let m = 0; m < 12; m++) {
      const lon = ((m + 0.5) / 12) * Math.PI * 2;
      for (let lat = 0; lat < 80; lat += 5) push(head(lat * DEG, lon), head(Math.min(80, lat + 5) * DEG, lon));
      // …and up the cylinder to the flange, fading as it climbs
      for (let y = c; y < VESSEL_FADE[1]; y += 60) push([r * Math.cos(lon), y, r * Math.sin(lon)], [r * Math.cos(lon), Math.min(VESSEL_FADE[1], y + 60), r * Math.sin(lon)]);
    }
    const geo = new LineSegmentsGeometry();
    geo.setPositions(seg);
    geo.setColors(col);
    headMat = lineMat(0xffffff, 1.9, { opacity: 0.4, vertexColors: true });
    headMat.color.copy(INK);
    const headLines = new LineSegments2(geo, headMat);
    headLines.frustumCulled = false;
    headLines.renderOrder = 2;
    reactor.group.add(headLines);
  }
  // 005's numbers: rods in, coils dead, the fuel's glow is `core`
  const R5 = { power: 0, fall: 1, reaction: 0, neutrons: 0, shell: 1, heat: 0, glow: 0, feed: 0, others: 1, sealed: 0, chain: 0 };

  /* ══ the building ══ */
  const building = new THREE.Group();
  group.add(building);
  const seg = [];
  const col = [];
  const fadeK = (y) => 1 - smooth(BASEMENT.fade[0], BASEMENT.fade[1], y);
  const line = (a, b, k = 1) => {
    seg.push(...a, ...b);
    const ka = k * fadeK(a[1]);
    const kb = k * fadeK(b[1]);
    col.push(ka, ka, ka, kb, kb, kb);
  };
  const rect = (x0, x1, z0, z1, y, k) => {
    line([x0, y, z0], [x1, y, z0], k);
    line([x1, y, z0], [x1, y, z1], k);
    line([x1, y, z1], [x0, y, z1], k);
    line([x0, y, z1], [x0, y, z0], k);
  };
  const circle = (cx, cz, r, y, k, a0 = 0, a1 = 360, step = 5) => {
    for (let a = a0; a < a1 - 1e-6; a += step) {
      const b = Math.min(a1, a + step);
      line([cx + r * Math.sin(a * DEG), y, cz + r * Math.cos(a * DEG)], [cx + r * Math.sin(b * DEG), y, cz + r * Math.cos(b * DEG)], k);
    }
  };
  const glassMat = glass(BRAND.ink, { base: 0, rim: 0.1, power: 3.4, edge: 0 });
  const panes = [];
  const pane = (w, h, x, y, z, rotY = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassMat);
    m.position.set(x, y, z);
    m.rotation.y = rotY;
    building.add(m);
    panes.push(m);
    return m;
  };
  const F = BASEMENT.floor;

  // the pit's structural concrete: a square block round the bore, from the basemat to the rim
  const RI = PIT.r + PIT.sac + PIT.zirc; // the bore: the outside of the zirconia (model.js)
  const RB = RI + PIT.wall; // half the block's width
  const hB = PIT.rim - F;
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) line([sx * RB, F, sz * RB], [sx * RB, PIT.rim, sz * RB]);
  rect(-RB, RB, -RB, RB, PIT.rim);
  rect(-RB, RB, -RB, RB, F, 0.8);
  circle(0, 0, RI, PIT.rim, 1);
  circle(0, 0, RI, PIT.top, 0.6);
  line([-RB, PIT.floor, RB], [RB, PIT.floor, RB], 0.5); // the pit floor's level, on the face toward the chamber
  pane(2 * RB, hB, 0, (F + PIT.rim) / 2, RB);
  pane(2 * RB, hB, 0, (F + PIT.rim) / 2, -RB);
  pane(2 * RB, hB, RB, (F + PIT.rim) / 2, 0, Math.PI / 2);
  pane(2 * RB, hB, -RB, (F + PIT.rim) / 2, 0, Math.PI / 2);
  {
    // the bore above the lining: open glass
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(RI, RI, PIT.rim - PIT.top, 96, 1, true), glassMat);
    bore.position.y = (PIT.rim + PIT.top) / 2;
    building.add(bore);
    panes.push(bore);
  }

  // the channel's tunnel: its concrete round the zirconia channel, from the bore to the chamber's room
  {
    const [, yA] = CHANNEL.from;
    const [, yB, zB] = CHANNEL.to;
    const zA = RI;
    const zEnd = CHAMBER.z0 - BASEMENT.room;
    const yAt = (z) => yA + ((yB - yA) * (z - CHANNEL.from[2])) / (zB - CHANNEL.from[2]);
    const hw = CHANNEL.w / 2 + 50;
    for (const sx of [-1, 1]) {
      line([sx * hw, yAt(zA) - 50, zA], [sx * hw, yAt(zEnd) - 50, zEnd], 0.8);
      line([sx * hw, yAt(zA) + CHANNEL.h + 50, zA], [sx * hw, yAt(zEnd) + CHANNEL.h + 50, zEnd], 0.8);
    }
    const y0 = yAt(zEnd) - 50;
    const y1 = yAt(zEnd) + CHANNEL.h + 50;
    line([-hw, y0, zEnd], [hw, y0, zEnd], 0.8);
    line([hw, y0, zEnd], [hw, y1, zEnd], 0.8);
    line([hw, y1, zEnd], [-hw, y1, zEnd], 0.8);
    line([-hw, y1, zEnd], [-hw, y0, zEnd], 0.8);
  }

  // the chamber's room: four walls of glass (no ceiling, no floor: seen grazing they are slabs), its edges, its beams
  {
    const x0 = CHAMBER.x0 - BASEMENT.room;
    const x1 = CHAMBER.x1 + BASEMENT.room;
    const z0 = CHAMBER.z0 - BASEMENT.room;
    const z1 = CHAMBER.z1 + BASEMENT.room;
    const y1 = BASEMENT.ceiling;
    rect(x0, x1, z0, z1, F, 0.8);
    rect(x0, x1, z0, z1, y1, 1);
    for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) line([x, F, z], [x, y1, z]);
    for (let z = z0 + 400; z < z1 - 100; z += 400) line([x0, y1, z], [x1, y1, z], 0.55); // the ceiling's beams
    const h = y1 - F;
    pane(x1 - x0, h, (x0 + x1) / 2, (F + y1) / 2, z0);
    pane(x1 - x0, h, (x0 + x1) / 2, (F + y1) / 2, z1);
    pane(z1 - z0, h, x0, (F + y1) / 2, (z0 + z1) / 2, Math.PI / 2);
    pane(z1 - z0, h, x1, (F + y1) / 2, (z0 + z1) / 2, Math.PI / 2);
  }
  asShell(panes, 30); // the outermost shell: everything else (glass, water, steam) is drawn before it and shows

  // the containment: an arc of wall BEHIND the plant (seen from the usual side, az −10 … −50), fading out with height
  const wallMat = wallMaterial();
  {
    const [cx, , cz] = BASEMENT.centre;
    const Rc = BASEMENT.containment;
    const A0 = 65; // its arc, in the stage's azimuth (0 = +z): 65° … 295°, centred on −z
    const A1 = 295;
    const top = BASEMENT.fade[1];
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(Rc, Rc, top - F, 120, 1, true, A0 * DEG, (A1 - A0) * DEG), wallMat);
    wall.position.set(cx, (F + top) / 2, cz);
    wall.renderOrder = 1;
    building.add(wall);
    for (let a = A0; a <= A1 + 1e-6; a += 23) {
      const x = cx + Rc * Math.sin(a * DEG);
      const z = cz + Rc * Math.cos(a * DEG);
      for (let y = F; y < top; y += 200) line([x, y, z], [x, Math.min(top, y + 200), z], 0.5);
    }
    circle(cx, cz, Rc, F, 0.7, A0, A1, 3);
    for (const y of [0, 700, 1400, 2000]) circle(cx, cz, Rc, y, 0.45, A0, A1, 3);
  }
  const bGeo = new LineSegmentsGeometry();
  bGeo.setPositions(seg);
  bGeo.setColors(col);
  const bLineMat = lineMat(0xffffff, LINE.width, { opacity: LINE.opacity, vertexColors: true });
  bLineMat.color.copy(INK);
  const bLines = new LineSegments2(bGeo, bLineMat);
  bLines.frustumCulled = false;
  bLines.renderOrder = 2;
  building.add(bLines);

  // the floor: a grid, no slab
  const gridMat = gridMaterial({ cell: 100, major: 5, fade: 2400, amount: 0.1 });
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(12000, 12000), gridMat);
  grid.rotation.x = -Math.PI / 2;
  grid.position.set(BASEMENT.centre[0], F + 0.5, BASEMENT.centre[2]);
  building.add(grid);
  const dress = dressBatiment(); building.add(dress.group); // the decorator's touches (habillage.js)

  /* ══ the teaser: the next file (040), far away ══ */
  const teaser = new THREE.Group();
  teaser.position.set(...TEASER.at);
  group.add(teaser);
  const tGridMat = gridMaterial({ cell: 100, major: 5, fade: 1500, amount: 0.12 });
  const tGrid = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), tGridMat);
  tGrid.rotation.x = -Math.PI / 2;
  tGrid.position.y = 0.5;
  teaser.add(tGrid);
  // the shelters: the next film's system, solid foil, in a loose cluster at the centre (≈ 2.1 m long, 0.4 m high)
  {
    const r = rng(40);
    const shelterMat = solid(0xa9afb6, { rough: 0.38, metal: 0.45 });
    const geo = new THREE.SphereGeometry(1, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    geo.scale(107, 42, 40);
    for (let row = 0; row < 2; row++) {
      for (let k = 0; k < 4; k++) {
        const m = new THREE.Mesh(geo, shelterMat);
        m.position.set((k - 1.5) * 270 + (row ? 120 : -40) + (r() - 0.5) * 60, 0, (row ? 170 : -170) + (r() - 0.5) * 70);
        m.rotation.y = (r() - 0.5) * 0.5;
        m.castShadow = true;
        m.receiveShadow = true;
        teaser.add(m);
      }
    }
  }
  // the light of the fire, from beyond the shelters (it rims them): always there, its intensity follows `teaser`
  const fireLight = new THREE.PointLight(BRAND.signal, 0, 4200, 0);
  fireLight.position.set(0, 260, -700);
  teaser.add(fireLight);
  // the line of fire
  const ring = new THREE.Group();
  teaser.add(ring);
  const FIRE_H = 420;
  const fireMat = fireMaterial();
  const bandGeo = new THREE.CylinderGeometry(1, 1, 1, 288, 1, true).translate(0, 0.5, 0);
  {
    const p = bandGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const k = front(Math.atan2(p.getX(i), p.getZ(i)));
      p.setXYZ(i, p.getX(i) * k, p.getY(i), p.getZ(i) * k);
    }
  }
  const band = new THREE.Mesh(bandGeo, fireMat);
  band.scale.y = FIRE_H;
  band.frustumCulled = false;
  ring.add(band);
  const groundMat = emberGroundMaterial();
  const ground = new THREE.Mesh(new THREE.RingGeometry(0.6, 1.55, 288, 1), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 1;
  ground.frustumCulled = false;
  ring.add(ground);
  const embers = makeEmbers(320, 41);
  teaser.add(embers.points);

  const A = {
    vessel: anchor(vesselMount, 0, VESSEL.low, 0), // the vessel's lowest point: it lifts with `explode`
    pit: anchor(group, 0, 200, 0),
    pool: anchor(group, (POOL.x0 + POOL.x1) / 2, POOL.level, (POOL.z0 + POOL.z1) / 2),
    teaser: anchor(teaser, 0, 120, 0),
  };

  /**
   * P: shell 0–1 (the building) · vessel 0–1 (005's glass and lines) · core 0–1 (the fuel's glow: the core that
   * melts) · explode 0–1 (the vessel lifts by 700) · teaser 0–1 (the next file: 0 hidden; from 0.01 the fire burns,
   * and as it climbs to 1 the ring closes from TEASER.ring to 0.55 of it — tween it over the shot) · bench 0/1 (the
   * building is gone, whatever `shell`). Sixteen times a frame: nothing allocated.
   */
  function update(P, time, px) {
    const s = P.bench ? 0 : clamp01(P.shell);
    building.visible = s > 0.003;
    glassMat.uniforms.uAmount.value = s;
    wallMat.uniforms.uAmount.value = s;
    bLineMat.opacity = LINE.opacity * s;
    gridMat.uniforms.uAmount.value = 0.1 * s;
    dress.update(P, time, px);

    vesselMount.position.y = LIFT * clamp01(P.explode);
    const v = clamp01(P.vessel);
    reactor.group.visible = v > 0.01;
    if (reactor.group.visible) {
      R5.shell = v;
      R5.reaction = clamp01(P.core);
      R5.glow = 1.6 * R5.reaction;
      reactor.update(R5, time, px);
      fx5.barMat.uniforms.uUnder.value *= 0.3; // the drive rods over the core: lit a little from under, not a bright brush
      fx5.fuel.uniforms.uFront.value = 1e4; // the rods are in, and the fuel still glows: the heat that is left
      headMat.opacity = 0.4 * v;
    }

    const T = clamp01(P.teaser);
    teaser.visible = T > 0.01;
    if (teaser.visible) {
      const on = smooth(0.01, 0.2, T);
      const rr = TEASER.ring * (1 - 0.45 * smooth(0, 1, T));
      ring.scale.set(rr, 1, rr);
      fireMat.uniforms.uTime.value = time;
      fireMat.uniforms.uGain.value = 1.15 * on;
      groundMat.uniforms.uTime.value = time;
      groundMat.uniforms.uGain.value = 0.9 * on;
      embers.mat.uniforms.uTime.value = time;
      embers.mat.uniforms.uR.value = rr;
      embers.mat.uniforms.uPx.value = px;
      embers.mat.uniforms.uGain.value = on;
      fireLight.intensity = 2.2 * on;
      fireLight.position.z = -0.75 * rr;
    } else fireLight.intensity = 0;
  }

  return { group, reactor, A, update };
}
