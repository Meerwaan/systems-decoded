// DOSSIER 046 — Torchère : the REFINERY around the flare network, X-ray — and the two places the end needs: the flat's
// window (like) and the next file's dishwasher (047, abo / boucle). Built against the architect's contract
// (docs/046-decors.md → « src/raffinerie.js »); journal: docs/journal/046-raffinerie.md.
//
//   buildRaffinerie() → { group, A, update(P, time, px) }
//   group  world coordinates (plan.js: COLUMNS, COMPRESSOR, RACK, UNITS, GROUND, PANE, TEASER)
//   A      anchors: col0..2 (each column's top), compressor, rotor, motor, cloud, pane, washer, arm
//   P      bench · shell · press · rotor (turns) · hum · spark · blast · cloud · pane · teaser · arm (degrees) · jets
//
// What it draws:
//   · the dusk SKY: a low signal glow standing where the key light comes from (world azimuth ≈ 150°, the −x +z side), on a
//     dome read from the camera — seen only when the camera films into the light (the hook). The same test gives `cj`
//     (0 → 1, how much we are in contre-jour): the columns' glass takes a stronger lip, and a dark body (its back face, the
//     colour of the background) cuts them out of the sky. On black it is invisible; out of contre-jour it is off and
//     writes no depth (the relief valves seen through the columns from VIEW.columns stay bright).
//   · the ground: a grid drawn in a shader (lines ≥ 1.8 px, gone before a cell gets under ~6 px: no moiré), no floor.
//   · the rack (glass portals under the header), the plant behind (glass columns, spheres, tanks, blocks, an air cooler,
//     paler with the distance), the three COLUMNS (glass, trays and ladders in lines; `press` fills them with a solid
//     signal volume from the bottom, its surface brighter).
//   · the COMPRESSOR, solid: skid, split casing with a window, the rotor (five wheels, the light hero) seen through it,
//     coupling, finned motor, its terminal box where the fault sparks (a light that has a place).
//   · the ghosts: `blast` (the middle column bursts in signal lines: shell fragments, a starburst, a flash, a ground ring),
//     `cloud` (soft puffs rolling out round the columns' feet, low, signal-lipped).
//   · the flat's window (`pane`): a dark wall, its frame and sill at the right and bottom of VIEW.pane, the glass between.
//   · the 047 teaser (`teaser`, on its own floor at TEASER.at): an X-ray built-in dishwasher between two cabinets, plates
//     and glasses, the two baskets in lines, the two SOLID spray arms (`arm`, degrees; the lower one follows at 0.8×) and
//     their veille jets, tilted backwards: they are what pushes the arm (`arm` increasing = counter-clockwise seen from above).
// Everything depends on P and `time`; update() allocates nothing (it is called sixteen times per frame).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, edgesOf, solid, glow, setGlow, cyl, box, lathe, plate, placed, mergeGeometries, lineMat, anchor, makePart, addMesh, setPartOpacity } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { GROUND, COLUMNS, COMPRESSOR, RACK, UNITS, PANE, TEASER } from "./plan.js";
import { dressRaffinerie } from "./habillage.js"; // the dressing (decorator): lamps, the site road, the windsock

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const SUN_AZ = 162 * DEG; // where the dusk glows: world azimuth atan2(z, x) — the −x +z side, the key light's side
const SUN = [Math.cos(SUN_AZ), Math.sin(SUN_AZ)];
const GREY = { dark: 0x23282c, motor: 0x353b41, casing: 0x5f6870, light: 0xa6aeb5 }; // three values of grey + the hero

/* ───────────────────────────── lines ───────────────────────────── */

function segLines(segs, { color = BRAND.ink, width = 1.8, opacity = 0.4, additive = false, hdr = 0, fog = false } = {}) {
  const g = new LineSegmentsGeometry();
  g.setPositions(segs);
  const l = new LineSegments2(g, lineMat(color, width, { opacity, additive, hdr: hdr || undefined, fog }));
  l.renderOrder = 2;
  return l;
}
/** A circle of segments around an axis ("x", "y" or "z"), from angle a0 to a1. */
function ring(out, c, r, n, axis = "y", a0 = 0, a1 = TAU) {
  for (let i = 0; i < n; i++) {
    const t0 = a0 + ((a1 - a0) * i) / n;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / n;
    const p = (t) => (axis === "y" ? [c[0] + r * Math.cos(t), c[1], c[2] + r * Math.sin(t)] : axis === "z" ? [c[0] + r * Math.cos(t), c[1] + r * Math.sin(t), c[2]] : [c[0], c[1] + r * Math.cos(t), c[2] + r * Math.sin(t)]);
    out.push(...p(t0), ...p(t1));
  }
}
const seg = (out, a, b) => out.push(a[0], a[1], a[2], b[0], b[1], b[2]);

/* ───────────────────────────── fading layers ───────────────────────────── */

/** A set of glass shells and lines that fade together (each keeps its own level `k`). */
function layer() {
  const shells = [];
  const lines = [];
  const solids = [];
  let last = -1;
  return {
    shells,
    shell(parent, geo, pos, { k = 1, rim = 0.22, edge = 0.42, through = 0.22, spec = 0, power = 2.6, width = 1.8, lineOp = 0.5, order = 20, fog = false, rot = null } = {}) {
      const mat = glass(BRAND.ink, { base: 0, rim, edge, through, spec, power });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      asShell([mesh], order);
      const edges = edgesOf(geo, { color: BRAND.ink, width, opacity: lineOp });
      if (fog) edges.material.fog = true;
      mesh.add(edges);
      parent.add(mesh);
      const s = { mesh, mat, edges, k, lineOp };
      shells.push(s);
      return s;
    },
    line(obj, op = obj.material.opacity) {
      lines.push([obj, op]);
      return obj;
    },
    part(p) {
      solids.push(p);
      return p;
    },
    set(a) {
      if (a === last) return;
      last = a;
      for (let i = 0; i < shells.length; i++) {
        const s = shells[i];
        s.mat.uniforms.uAmount.value = a * s.k;
        s.edges.material.opacity = s.lineOp * a;
        s.mesh.visible = a * s.k > 0.003;
      }
      for (let i = 0; i < lines.length; i++) {
        lines[i][0].material.opacity = lines[i][1] * a;
        lines[i][0].visible = a > 0.003;
      }
      for (let i = 0; i < solids.length; i++) setPartOpacity(solids[i], a);
    },
  };
}

/* ───────────────────────────── shaders ───────────────────────────── */

/** The ground: a grid in a shader. Lines ≈ 2 px wide whatever the distance; a cell under ~6 px fades out (no moiré). */
function makeGrid({ cell, major, radius, centre, opacity = 0.14, fog = 0.00011 }) {
  const geo = new THREE.PlaneGeometry(radius * 2.2, radius * 2.2).rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(BRAND.ink) }, uAmount: { value: 0 }, uCell: { value: cell }, uMajor: { value: major }, uRadius: { value: radius }, uCentre: { value: new THREE.Vector2(...centre) }, uFog: { value: fog }, uOp: { value: opacity } },
    vertexShader: /* glsl */ `
      varying vec3 vW; varying float vDepth;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform vec2 uCentre; uniform float uAmount, uCell, uMajor, uRadius, uFog, uOp;
      varying vec3 vW; varying float vDepth;
      float lines(vec2 q, float w0, float w1, out float thin) {
        vec2 fw = max(fwidth(q), vec2(1e-5));
        vec2 d = abs(fract(q - 0.5) - 0.5) / fw;
        thin = 1.0 - smoothstep(0.07, 0.17, max(fw.x, fw.y));
        return 1.0 - smoothstep(w0, w1, min(d.x, d.y));
      }
      void main() {
        if (uAmount < 0.003) discard;
        float t1, t2;
        float l1 = lines(vW.xz / uCell, 0.5, 1.4, t1);
        float l2 = lines(vW.xz / (uCell * uMajor), 0.6, 1.6, t2);
        float r = clamp(length(vW.xz - uCentre) / uRadius, 0.0, 2.0);
        float edge = 1.0 - smoothstep(0.5, 1.0, r);
        float f = uFog * max(vDepth, 0.0);
        float fog = exp(-f * f);
        float a = max(l1 * t1 * 0.5, l2 * t2) * edge * fog * uAmount * uOp;
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(centre[0], 0.6, centre[1]);
  mesh.renderOrder = -4;
  mesh.frustumCulled = false;
  return { mesh, mat };
}

/** The dusk: a glow low on the horizon toward SUN_AZ, read from the camera (it stands at infinity). */
function makeSky() {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    uniforms: { uColor: { value: new THREE.Color(BRAND.signal) }, uK: { value: 0 }, uAz: { value: SUN_AZ }, uWidth: { value: 0.85 } },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uAz, uWidth; varying vec3 vW;
      void main() {
        if (uK < 0.003) discard;
        vec3 d = normalize(vW - cameraPosition);
        float el = asin(clamp(d.y, -1.0, 1.0));
        float da = atan(d.z, d.x) - uAz;
        da = mod(da + 3.14159265, 6.2831853) - 3.14159265;
        float sector = exp(-(da * da) / (uWidth * uWidth));
        float band = smoothstep(-0.10, 0.02, el) * exp(-max(el - 0.02, 0.0) / 0.2);
        float line = exp(-(el * el) / 0.0016) * smoothstep(-0.06, 0.0, el); // the horizon itself, a little brighter
        gl_FragColor = vec4(uColor * uK * sector * (band + 0.35 * line), 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(40000, 48, 24), mat);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  return { mesh, mat };
}

/** The inside of a column under pressure: a solid signal volume, shaded round, its surface brighter, slowly churning. */
function fillMaterial(seed) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(BRAND.signal) }, uK: { value: 1 }, uTime: { value: 0 }, uH: { value: 1 }, uSeed: { value: seed } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vY; varying float vTop;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vY = position.y; vTop = step(0.9, normal.y);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uTime, uH, uSeed;
      varying vec3 vN; varying vec3 vV; varying float vY; varying float vTop;
      void main() {
        float facing = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float y = clamp(vY, 0.0, 1.0) * uH;
        float churn = 0.9 + 0.1 * sin(y * 0.011 - uTime * 0.8 + uSeed) * sin(y * 0.004 + uTime * 0.35 + uSeed * 2.0);
        float body = (0.3 + 0.7 * pow(facing, 0.8)) * churn;
        float surf = smoothstep(uH - 70.0, uH - 4.0, y);
        float k = mix(body + 0.75 * surf, 1.55, vTop);
        gl_FragColor = vec4(uColor * uK * k, 1.0);
      }`,
  });
}

/** A camera-facing soft light (a flash, a spark): a bright core, a long soft tail. */
function softBall(color, size) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uK: { value: 0 }, uSize: { value: size } },
    vertexShader: /* glsl */ `
      uniform float uSize; varying vec2 vUv;
      void main() { vUv = position.xy; vec4 mv = viewMatrix * modelMatrix * vec4(0.0, 0.0, 0.0, 1.0); mv.xy += position.xy * uSize; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK; varying vec2 vUv;
      void main() {
        float r = clamp(length(vUv), 0.0, 1.0);
        float core = exp(-r * r * 40.0);
        float tail = pow(1.0 - r, 3.0) * 0.55;
        gl_FragColor = vec4((uColor * (core * 1.4 + tail) + vec3(core * 0.6)) * uK, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, mat };
}

/** A spray of water out of a nozzle: a thin open cone, veille, droplets running out (slowly enough never to jump). */
function jetMaterial(shared, phase) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uColor: shared.uColor, uK: shared.uK, uTime: shared.uTime, uPhase: { value: phase } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying float vF; varying float vNear;
      void main() {
        vUv = uv;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vec4 mv = viewMatrix * w;
        vec3 n = normalize(normalMatrix * normal);
        vF = abs(dot(n, normalize(-mv.xyz)));
        vNear = smoothstep(6.0, 16.0, distance(w.xyz, cameraPosition)); // a jet that brushes the lens is not there
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uTime, uPhase; varying vec2 vUv; varying float vF; varying float vNear;
      void main() {
        if (uK < 0.003) discard;
        float v = clamp(vUv.y, 0.0, 1.0);
        float len = pow(1.0 - v, 1.2) * smoothstep(0.0, 0.07, v);
        float drops = 0.3 + 0.7 * smoothstep(0.35, 0.75, fract(v * 3.0 - uTime * 1.5 + uPhase));
        float core = 0.3 + 0.7 * vF;
        gl_FragColor = vec4(uColor * uK * len * drops * core * vNear, 1.0);
      }`,
  });
}

/** The ghost cloud: soft puffs (camera-facing) growing out of the columns' feet along the ground as `uC` goes 0 → 1. */
function makePuffs({ count, seed, from, to }) {
  const r = rng(seed);
  const c0 = new Float32Array(count * 12);
  const c1 = new Float32Array(count * 12);
  const corner = new Float32Array(count * 8);
  const size = new Float32Array(count * 8);
  const meta = new Float32Array(count * 8);
  const index = [];
  for (let i = 0; i < count; i++) {
    const [a, b, s0, s1, t] = [from(r, i), to(r, i), 70 + 60 * r(), 230 + 230 * r(), 0.45 * r()];
    const sd = r();
    const cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (let v = 0; v < 4; v++) {
      c0.set(a, (i * 4 + v) * 3);
      c1.set(b, (i * 4 + v) * 3);
      corner.set(cs[v], (i * 4 + v) * 2);
      size.set([s0, s1], (i * 4 + v) * 2);
      meta.set([t, sd], (i * 4 + v) * 2);
    }
    index.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(c0, 3));
  geo.setAttribute("aTo", new THREE.BufferAttribute(c1, 3));
  geo.setAttribute("aCorner", new THREE.BufferAttribute(corner, 2));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 2));
  geo.setAttribute("aMeta", new THREE.BufferAttribute(meta, 2));
  geo.setIndex(index);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uC: { value: 0 }, uTime: { value: 0 }, uLip: { value: new THREE.Color(BRAND.signal) }, uCore: { value: new THREE.Color(BRAND.signal).multiplyScalar(0.07) } },
    vertexShader: /* glsl */ `
      uniform float uC, uTime; attribute vec3 aTo; attribute vec2 aCorner, aSize, aMeta;
      varying vec2 vUv; varying float vA;
      void main() {
        float k = smoothstep(aMeta.x, aMeta.x + 0.5, uC);
        float born = smoothstep(aMeta.x, aMeta.x + 0.14, uC);
        float s6 = aMeta.y * 6.2831853;
        vec3 c = mix(position, aTo, k);
        c += vec3(sin(uTime * 0.21 + s6) * 45.0, (0.5 + 0.5 * sin(uTime * 0.29 + s6 * 1.7)) * 26.0, cos(uTime * 0.17 + s6 * 1.3) * 45.0) * k;
        float s = mix(aSize.x, aSize.y, k) * (0.4 + 0.6 * born);
        vec4 mv = modelViewMatrix * vec4(c, 1.0);
        mv.xy += aCorner * s;
        vUv = aCorner; vA = born;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uLip, uCore; varying vec2 vUv; varying float vA;
      void main() {
        float r = clamp(length(vUv), 0.0, 1.0);
        float body = 1.0 - smoothstep(0.55, 0.97, r);
        float lip = smoothstep(0.5, 0.8, r) * (1.0 - smoothstep(0.8, 0.98, r));
        vec3 col = uCore + uLip * (0.05 + 0.8 * lip);
        float a = (body * 0.62 + lip * 0.3) * vA;
        if (a < 0.004) discard;
        gl_FragColor = vec4(col, a);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 8;
  return { mesh, mat };
}

/* ═══════════════════════════════ THE BUILD ═══════════════════════════════ */

export function buildRaffinerie() {
  const group = new THREE.Group();

  /* ───── the sky and the ground ───── */
  const sky = makeSky();
  const groundGrid = makeGrid({ cell: 250, major: 4, radius: GROUND.half + 600, centre: [-1400, 0], opacity: 0.16 });
  group.add(sky.mesh, groundGrid.mesh);
  const dress = dressRaffinerie(); group.add(dress.group);

  /* ───── the plant: rack and far units (one layer, follows `shell`) ───── */
  const plant = new THREE.Group();
  const P = layer();
  // the rack: glass portals under the header, beams along it, knee braces
  {
    const parts = [];
    const legH = RACK.y - 60;
    for (let x = RACK.from; x <= RACK.to + 1; x += RACK.every) {
      for (const z of [-RACK.half, RACK.half]) parts.push(placed(box(22, legH, 22, 2), { pos: [x, legH / 2, z] }));
      parts.push(placed(box(26, 24, RACK.half * 2 + 40, 2), { pos: [x, RACK.y - 58, 0] }));
      parts.push(placed(box(20, 18, RACK.half * 2 + 30, 2), { pos: [x, RACK.y - 300, 0] }));
    }
    const len = RACK.to - RACK.from;
    for (const z of [-RACK.half, RACK.half]) parts.push(placed(box(len, 18, 16, 2), { pos: [(RACK.from + RACK.to) / 2, RACK.y - 58, z] }));
    P.shell(plant, mergeGeometries(parts), [0, 0, 0], { k: 0.9, lineOp: 0.42 });
  }
  // the units behind the columns: kept off the poses' camera paths (VIEW.columns stands at ≈ (−4350, 1600, 2830))
  const far = (x) => 0.95 - 0.35 * clamp01((-x - 2800) / 1800); // paler with the distance
  const unitColumn = (x, z, r, h) => {
    const prof = [[0, 0], [r + 14, 0], [r + 14, 26], [r, 26], [r, h - r / 2]];
    for (let i = 1; i <= 8; i++) prof.push([r * Math.cos((i / 8) * Math.PI / 2), h - r / 2 + (r / 2) * Math.sin((i / 8) * Math.PI / 2)]);
    const s = P.shell(plant, lathe(prof, 40, { crease: 40 }), [x, 0, z], { k: far(x), lineOp: 0.28 * far(x), order: 14, fog: true });
    const segs = [];
    for (let y = 260; y < h - r; y += 320) ring(segs, [x, y, z], r + 40, 28);
    P.line(plant.add(segLines(segs, { opacity: 0.15 * far(x), fog: true })) && plant.children[plant.children.length - 1]);
    return s;
  };
  const sphereTank = (x, z, r) => {
    const parts = [placed(new THREE.SphereGeometry(r, 32, 18).toNonIndexed(), { pos: [0, r + 120, 0] })];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      parts.push(placed(box(20, r + 120, 20, 2), { pos: [Math.cos(a) * r * 0.8, (r + 120) / 2, Math.sin(a) * r * 0.8] }));
    }
    P.shell(plant, mergeGeometries(parts), [x, 0, z], { k: far(x), lineOp: 0.22 * far(x), order: 14, fog: true });
  };
  const tank = (x, z, r, h) => {
    P.shell(plant, cyl(r, h, 6, 56), [x, h / 2, z], { k: far(x), lineOp: 0.36 * far(x), order: 14, fog: true });
    const segs = [];
    ring(segs, [x, h - 30, z], r - 8, 56); // the floating roof
    for (let y = 90; y < h - 40; y += 90) ring(segs, [x, y, z], r + 1, 56, "y");
    P.line(plant.add(segLines(segs, { opacity: 0.16 * far(x), fog: true })) && plant.children[plant.children.length - 1]);
  };
  unitColumn(-3350, -380, 105, 1380);
  unitColumn(-3720, 420, 78, 1080);
  unitColumn(-3050, -1650, 70, 900);
  sphereTank(-3350, 1450, 250);
  sphereTank(-3980, 1150, 250);
  tank(-4250, -1350, 470, 360);
  tank(-4300, -150, 400, 320);
  P.shell(plant, box(620, 300, 440, 6), [-3150, 150, -2350], { k: far(-3150), lineOp: 0.34, order: 14, fog: true });
  P.shell(plant, box(420, 440, 340, 6), [-2980, 220, 760], { k: far(-2980), lineOp: 0.38, order: 14, fog: true });
  {
    // an air cooler bank: a long low box raised on legs (fin-fans)
    const parts = [placed(box(1000, 110, 320, 4), { pos: [0, 520, 0] })];
    for (const dx of [-460, -150, 150, 460]) for (const dz of [-140, 140]) parts.push(placed(box(18, 470, 18, 2), { pos: [dx, 235, dz] }));
    P.shell(plant, mergeGeometries(parts), [-3800, 0, -2350], { k: far(-3800), lineOp: 0.32, order: 14, fog: true });
    const segs = [];
    for (const dx of [-375, -125, 125, 375]) ring(segs, [-3800 + dx, 578, -2350], 110, 28);
    P.line(plant.add(segLines(segs, { opacity: 0.2, fog: true })) && plant.children[plant.children.length - 1]);
  }
  {
    // a long pipe rack across the plant, behind the columns
    const parts = [];
    for (let z = -2600; z <= 1900; z += 900) {
      for (const dx of [-110, 110]) parts.push(placed(box(18, 520, 18, 2), { pos: [dx, 260, z] }));
      parts.push(placed(box(250, 18, 20, 2), { pos: [0, 510, z] }));
    }
    for (const dy of [0]) for (const dx of [-110, 110]) parts.push(placed(box(14, 14, 4400, 2), { pos: [dx, 510 + dy, -400] }));
    P.shell(plant, mergeGeometries(parts), [-2750, 0, 0], { k: 0.35, lineOp: 0.16, order: 14, fog: true });
    const segs = [];
    for (const [dx, r] of [[-70, 22], [-15, 30], [45, 18], [85, 14]]) seg(segs, [-2750 + dx, 548 + r, -2600], [-2750 + dx, 548 + r, 1800]);
    P.line(plant.add(segLines(segs, { opacity: 0.14, width: 1.8, fog: true })) && plant.children[plant.children.length - 1]);
  }
  group.add(plant);

  /* ───── the three columns ───── */
  const cols = COLUMNS.map((c, i) => {
    const g = new THREE.Group();
    const L = layer();
    const [x, z] = c.at;
    const { r, h } = c;
    const head = r / 2;
    const yc = h - head;
    const prof = [[0, 0], [r + 22, 0], [r + 22, 38], [r, 38], [r, yc]];
    for (let k = 1; k <= 9; k++) prof.push([r * Math.cos((k / 10) * Math.PI / 2), yc + head * Math.sin((k / 10) * Math.PI / 2)]);
    prof.push([r * 0.16, yc + head * 0.99], [r * 0.16, h + 44], [r * 0.25, h + 44], [r * 0.25, h + 58], [0, h + 58]);
    const geo = lathe(prof, 48, { crease: 40 });
    const shell = L.shell(g, geo, [x, 0, z], { rim: 0.24, edge: 0.48, through: 0.25, spec: 0.12, lineOp: 0.55 });
    // the dark body that cuts the column out of the dusk (contre-jour only): its far wall, the colour of the background
    const bodyMat = new THREE.MeshBasicMaterial({ color: BRAND.bg, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false, fog: false });
    const body = new THREE.Mesh(geo, bodyMat);
    body.position.set(x, 0, z);
    body.scale.set(0.985, 1, 0.985);
    body.renderOrder = 1;
    g.add(body);
    // trays (with their weirs), the ladder and its cage, two manways
    const segs = [];
    let side = 1;
    for (let y = 150; y < yc - 40; y += 88) {
      ring(segs, [x, y, z], r * 0.965, 40);
      const w = r * 0.55 * side;
      const half = Math.sqrt(Math.max(0, (r * 0.965) ** 2 - w * w));
      seg(segs, [x + w, y, z - half], [x + w, y, z + half]);
      side = -side;
    }
    const la = [(-115 + 60 * i) * DEG, (-120) * DEG, (100) * DEG][i]; // where the ladder runs (never on the valves' side, +x)
    const lr = r + 30;
    const [ux, uz] = [Math.cos(la), Math.sin(la)];
    const [tx, tz] = [-uz, ux];
    for (const s of [-15, 15]) seg(segs, [x + ux * lr + tx * s, 60, z + uz * lr + tz * s], [x + ux * lr + tx * s, yc + 40, z + uz * lr + tz * s]);
    for (let y = 300; y < yc; y += 140) {
      const pts = [];
      for (let k = 0; k <= 6; k++) {
        const a = Math.PI * (k / 6);
        pts.push([x + ux * (lr + 6) + tx * Math.cos(a) * 26 + ux * Math.sin(a) * 26, y, z + uz * (lr + 6) + tz * Math.cos(a) * 26 + uz * Math.sin(a) * 26]);
      }
      for (let k = 0; k < 6; k++) seg(segs, pts[k], pts[k + 1]);
    }
    const ma = la + 1.1;
    for (const my of [220, yc - 160]) {
      const cx = x + Math.cos(ma) * (r + 2);
      const cz = z + Math.sin(ma) * (r + 2);
      for (let k = 0; k < 16; k++) {
        const a0 = (k / 16) * TAU;
        const a1 = ((k + 1) / 16) * TAU;
        const p = (a) => [cx - Math.sin(ma) * Math.cos(a) * 26, my + Math.sin(a) * 26, cz + Math.cos(ma) * Math.cos(a) * 26];
        seg(segs, p(a0), p(a1));
      }
    }
    const lines = L.line(segLines(segs, { opacity: 0.34 }));
    g.add(lines);
    // the pressure: a solid signal volume, from the bottom up
    const fillMat = fillMaterial(i * 2.1);
    const fillGeo = new THREE.CylinderGeometry(r * 0.9, r * 0.9, 1, 40, 1).translate(0, 0.5, 0);
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.set(x, 40, z);
    fill.visible = false;
    g.add(fill);
    group.add(g);
    return { g, L, shell, body, bodyMat, fill, fillMat, h, yc, amount: 1 };
  });

  /* ───── the compressor: SOLID ───── */
  const comp = new THREE.Group();
  const [cx, , cz] = COMPRESSOR.at;
  const R = COMPRESSOR.r;
  const Y0 = 168; // the shaft's height
  const x0 = cx - COMPRESSOR.len / 2; // the casing's two ends
  const x1 = cx + COMPRESSOR.len / 2;
  const MX = -1985; // the motor's centre (a little further than plan.js's −1930: room for the coupling)
  const compBody = makePart("compressor");
  const matDark = solid(GREY.dark, { rough: 0.7, metal: 0.2 });
  const matMotor = solid(GREY.motor, { rough: 0.55, metal: 0.35 });
  const matCasing = solid(GREY.casing, { rough: 0.5, metal: 0.35 });
  const matInner = solid(0x1b1f22, { rough: 0.85, metal: 0.1, double: true });
  const matSteel = solid(GREY.light, { rough: 0.42, metal: 0.4 });
  // skid
  addMesh(compBody, box(x1 + 60 - (MX - 185), 34, 310, 3), matDark, { pos: [(x1 + 60 + MX - 185) / 2, 17, cz], edgeOpacity: 0.5 });
  addMesh(compBody, box(x1 + 40 - (MX - 130), 8, 260, 2), matDark, { pos: [(x1 + 40 + MX - 130) / 2, 38, cz], edgeOpacity: 0.4 });
  // the casing: a split barrel with a window toward +z, a little up (seen from VIEW.compressor), its inside dark
  {
    const w0 = 106 * DEG;
    const w1 = 176 * DEG; // the window, in the shape's own angle (see below)
    const sector = (ro, ri) => {
      const s = new THREE.Shape();
      s.absarc(0, 0, ro, w1, w0 + TAU, false);
      s.absarc(0, 0, ri, w0 + TAU, w1, true);
      return s;
    };
    // the shape lies in (x, y), extruded along z; turned a quarter about y, z → x and the shape's x → −z:
    // the angle φ in the shape points to world (z = −cos φ, y = sin φ): φ ≈ 140° looks toward +z and up
    const outer = plate(sector(R, R - 5), COMPRESSOR.len - 40, { bevel: 2 }).rotateY(Math.PI / 2).translate(x0 + 20, Y0, cz);
    const inner = plate(sector(R - 5, R - 14), COMPRESSOR.len - 40, { bevel: 1 }).rotateY(Math.PI / 2).translate(x0 + 20, Y0, cz);
    addMesh(compBody, outer, matCasing, { edgeOpacity: 0.55 });
    addMesh(compBody, inner, matInner, { edges: false });
    // end covers, the horizontal split flange, bearing housings, the two nozzles on top, the feet
    for (const [x, s] of [[x0 + 12, 1], [x1 - 12, -1]]) {
      addMesh(compBody, cyl(R + 10, 24, 3, 48).rotateZ(Math.PI / 2), matCasing, { pos: [x, Y0, cz], edgeOpacity: 0.5 });
      addMesh(compBody, cyl(44, 46, 3, 32).rotateZ(Math.PI / 2), matMotor, { pos: [x - s * 34, Y0, cz], edgeOpacity: 0.5 });
    }
    for (const sz of [-1, 1]) addMesh(compBody, box(COMPRESSOR.len - 50, 12, 16, 2), matCasing, { pos: [cx, Y0 - 9, cz + sz * (R + 4)], edgeOpacity: 0.5 });
    for (const nx of [cx - 150, cx + 150]) {
      addMesh(compBody, cyl(38, 150, 2, 32), matCasing, { pos: [nx, Y0 + R + 55, cz - 18], edgeOpacity: 0.5 });
      addMesh(compBody, cyl(56, 14, 2, 32), matCasing, { pos: [nx, Y0 + R + 132, cz - 18], edgeOpacity: 0.5 });
    }
    for (const fx of [x0 + 70, x1 - 70]) for (const sz of [-1, 1]) addMesh(compBody, box(60, Y0 - 42 - R + 34, 48, 3), matDark, { pos: [fx, (Y0 - R + 42 + 8) / 2 + 10, cz + sz * (R - 30)], edgeOpacity: 0.45 });
  }
  // the coupling guard (top half only: the hubs turn under it), the motor and its fins, its fan cowl, its terminal box
  const MLEN = 230;
  const mx1 = MX + MLEN / 2;
  {
    const guard = new THREE.CylinderGeometry(52, 52, x0 - 45 - (mx1 - 2), 32, 1, true, 0, Math.PI).rotateZ(Math.PI / 2);
    addMesh(compBody, guard, solid(GREY.motor, { rough: 0.55, metal: 0.3, double: true }), { pos: [(x0 - 45 + mx1 - 2) / 2, Y0, cz], edgeOpacity: 0.5 });
    addMesh(compBody, cyl(84, MLEN, 3, 48).rotateZ(Math.PI / 2), matMotor, { pos: [MX, Y0, cz], edgeOpacity: 0.5 });
    const fins = [];
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * TAU;
      if (Math.sin(a) < -0.75) continue; // none under it, where the feet are
      fins.push(placed(box(MLEN - 30, 3.5, 13, 1), { pos: [0, Math.sin(a) * 90, Math.cos(a) * 90], rotX: -a }));
    }
    addMesh(compBody, mergeGeometries(fins), matMotor, { pos: [MX, Y0, cz], edgeOpacity: 0.35 });
    addMesh(compBody, lathe([[0, 0], [88, 0], [92, 8], [92, 52], [60, 64], [0, 64]], 48, { bevel: 2 }).rotateZ(Math.PI / 2), matMotor, { pos: [MX - MLEN / 2 + 4, Y0, cz], edgeOpacity: 0.5 });
    for (const fx of [MX - 70, MX + 70]) addMesh(compBody, box(40, Y0 - 84 - 42 + 10, 150, 3), matDark, { pos: [fx, 42 + (Y0 - 84 - 42 + 10) / 2, cz], edgeOpacity: 0.45 });
    addMesh(compBody, box(78, 56, 74, 4), matMotor, { pos: [MX + 25, Y0 + 84 + 26, cz], edgeOpacity: 0.55 });
    addMesh(compBody, box(70, 8, 66, 2), matCasing, { pos: [MX + 25, Y0 + 84 + 58, cz], edgeOpacity: 0.5 });
    addMesh(compBody, cyl(9, 26, 1, 16).rotateX(Math.PI / 2), matDark, { pos: [MX + 25, Y0 + 84 + 18, cz + 46], edgeOpacity: 0.5 });
  }
  comp.add(compBody);
  // the rotor: shaft, five closed impellers with their blades, the two coupling hubs (turns about x)
  const rotor = new THREE.Group();
  rotor.position.set(0, Y0, cz);
  const rotorPart = makePart("rotor");
  const blurPart = makePart("blur");
  {
    addMesh(rotorPart, cyl(15, x1 - 30 - (mx1 - 10), 1.5, 24).rotateZ(Math.PI / 2), matSteel, { pos: [(x1 - 30 + mx1 - 10) / 2, 0, 0], edgeOpacity: 0.45 });
    const wheel = lathe([[22, -14], [72, -6], [72, 6], [22, 14]], 48, { bevel: 1.5 }).rotateZ(Math.PI / 2);
    const bladeParts = [];
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * TAU;
      bladeParts.push(placed(box(18, 46, 3.5, 0.8), { pos: [0, Math.cos(a) * 46, Math.sin(a) * 46], rotX: a, rotY: 0.35 }));
    }
    const blades = mergeGeometries(bladeParts);
    const matBlade = solid(0xc4cad0, { rough: 0.4, metal: 0.35 });
    for (let k = 0; k < 5; k++) {
      const x = x0 + 80 + k * ((COMPRESSOR.len - 160) / 4);
      addMesh(rotorPart, wheel.clone(), matSteel, { pos: [x - 12, 0, 0], edgeOpacity: 0.5 });
      addMesh(rotorPart, blades, matBlade, { pos: [x + 7, 0, 0], edgeOpacity: 0.55 });
      // the blur of a wheel running fast: a soft disc that comes in with `hum`
      const disc = new THREE.Mesh(new THREE.CircleGeometry(70, 48).rotateY(Math.PI / 2), solid(0x8f979e, { rough: 0.5, metal: 0.2, double: true }));
      disc.position.set(x + 9, Y0, cz);
      blurPart.userData.part.mats.add(disc.material);
      blurPart.add(disc);
    }
    for (const [hx, w] of [[mx1 + 14, 26], [x0 - 58, 26]]) addMesh(rotorPart, cyl(36, w, 2, 32).rotateZ(Math.PI / 2), matSteel, { pos: [hx, 0, 0], edgeOpacity: 0.55 });
    // one bolt circle on each hub: what shows the shaft turning when it turns slowly
    for (const hx of [mx1 + 28, x0 - 72]) for (let k = 0; k < 6; k++) {
      const a = (k / 6) * TAU;
      addMesh(rotorPart, cyl(4.5, 6, 0.8, 12).rotateZ(Math.PI / 2), matDark, { pos: [hx, Math.cos(a) * 25, Math.sin(a) * 25], edges: false });
    }
  }
  rotor.add(rotorPart);
  comp.add(rotor, blurPart);
  setPartOpacity(blurPart, 0);
  // the motor alive: a small ink lamp on its terminal box (steady, never blinking)
  const runMat = glow(BRAND.ink, 0);
  const runLamp = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 8), runMat);
  runLamp.position.set(MX + 50, Y0 + 84 + 40, cz + 38);
  comp.add(runLamp);
  // the fault: a light that has a place — on the terminal box's cable gland
  const SPARK_AT = [MX + 25, Y0 + 84 + 18, cz + 62];
  const sparkBall = softBall(BRAND.signal, 150);
  sparkBall.mesh.position.set(...SPARK_AT);
  const sparkStreaks = new THREE.Group();
  sparkStreaks.position.set(...SPARK_AT);
  {
    const r = rng(46);
    const segs = [];
    for (let k = 0; k < 14; k++) {
      const a = r() * TAU;
      const b = (r() - 0.25) * Math.PI * 0.8;
      const d = [Math.cos(a) * Math.cos(b), Math.sin(b) + 0.2, Math.sin(a) * Math.cos(b) * 0.6 + 0.5];
      const l0 = 0.25 + 0.2 * r();
      const l1 = l0 + 0.35 + 0.4 * r();
      seg(segs, [d[0] * l0, d[1] * l0, d[2] * l0], [d[0] * l1, d[1] * l1, d[2] * l1]);
    }
    sparkStreaks.add(segLines(segs, { color: BRAND.signal, width: 2.2, opacity: 0, additive: true, hdr: 2 }));
  }
  const sparkLight = new THREE.PointLight(BRAND.signal, 0, 900, 2);
  sparkLight.position.set(SPARK_AT[0], SPARK_AT[1], SPARK_AT[2] + 30);
  comp.add(sparkBall.mesh, sparkStreaks);
  group.add(sparkLight); // outside `comp`: a light that comes and goes with a group would recompile every material
  group.add(comp);

  /* ───── the ghosts ───── */
  // blast: the middle column bursts — its shell in fragments, a starburst of lines, a flash, a ring on the ground
  const BC = COLUMNS[1];
  const BAT = [BC.at[0], BC.h * 0.58, BC.at[1]];
  const blast = new THREE.Group();
  const blastMat = lineMat(BRAND.signal, 2.4, { opacity: 0, additive: true, hdr: 1.7 });
  const frags = [];
  {
    const rows = 4;
    const colsN = 8;
    const dA = TAU / colsN;
    const dY = (BC.h * 0.92) / rows;
    // one fragment's outline, centred on its own middle, facing +z: two arcs and two sides
    const fs = [];
    const arc = (y) => {
      for (let k = 0; k < 3; k++) {
        const a0 = -dA / 2 + (dA * k) / 3;
        const a1 = -dA / 2 + (dA * (k + 1)) / 3;
        seg(fs, [BC.r * Math.sin(a0), y, BC.r * Math.cos(a0) - BC.r], [BC.r * Math.sin(a1), y, BC.r * Math.cos(a1) - BC.r]);
      }
    };
    arc(-dY / 2 + 6);
    arc(dY / 2 - 6);
    for (const a of [-dA / 2 + 0.02, dA / 2 - 0.02]) seg(fs, [BC.r * Math.sin(a), -dY / 2 + 6, BC.r * Math.cos(a) - BC.r], [BC.r * Math.sin(a), dY / 2 - 6, BC.r * Math.cos(a) - BC.r]);
    seg(fs, [0, -dY / 2 + 20, 0], [BC.r * Math.sin(dA / 3), dY / 2 - 30, BC.r * Math.cos(dA / 3) - BC.r]); // a crack across it
    const fragGeo = new LineSegmentsGeometry().setPositions(fs);
    const r = rng(7);
    for (let row = 0; row < rows; row++) for (let k = 0; k < colsN; k++) {
      const a = (k + 0.5 * (row % 2)) * dA;
      const y = 40 + dY * (row + 0.5);
      const line = new LineSegments2(fragGeo, blastMat);
      line.renderOrder = 3;
      const o = { line, x: BC.at[0] + Math.sin(a) * BC.r, y, z: BC.at[1] + Math.cos(a) * BC.r, ry: a, dx: Math.sin(a), dz: Math.cos(a), up: 0.3 + 0.9 * r() + (y / BC.h) * 0.6, far: 700 + 900 * r(), spinX: (r() - 0.5) * 5, spinZ: (r() - 0.5) * 5 };
      frags.push(o);
      blast.add(line);
    }
    // the starburst: long thin lines from the heart of the column
    const sb = [];
    const r2 = rng(19);
    for (let k = 0; k < 34; k++) {
      const a = r2() * TAU;
      const b = (r2() - 0.3) * Math.PI * 0.7;
      const d = [Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b)];
      const l0 = 0.15 + 0.25 * r2();
      const l1 = l0 + 0.3 + 0.45 * r2();
      seg(sb, [d[0] * l0, d[1] * l0, d[2] * l0], [d[0] * l1, d[1] * l1, d[2] * l1]);
    }
    const burst = new LineSegments2(new LineSegmentsGeometry().setPositions(sb), blastMat);
    burst.renderOrder = 3;
    burst.position.set(...BAT);
    blast.add(burst);
    blast.userData.burst = burst;
    const shock = [];
    ring(shock, [0, 0, 0], 1, 64);
    const ringLine = new LineSegments2(new LineSegmentsGeometry().setPositions(shock), lineMat(BRAND.signal, 2.4, { opacity: 0, additive: true, hdr: 1.4 }));
    ringLine.renderOrder = 3;
    ringLine.position.set(BC.at[0], 8, BC.at[1]);
    blast.add(ringLine);
    blast.userData.ring = ringLine;
  }
  const flash = softBall(BRAND.signal, 600);
  flash.mesh.position.set(...BAT);
  blast.add(flash.mesh);
  group.add(blast);
  // cloud: puffs rolling out round the columns' feet, at ground level
  const puffs = makePuffs({
    count: 80, seed: 31,
    from: (r, i) => {
      const c = COLUMNS[i % 3];
      const a = r() * TAU;
      return [c.at[0] + Math.cos(a) * c.r * 1.1, 40 + 50 * r(), c.at[1] + Math.sin(a) * c.r * 1.1];
    },
    to: (r) => {
      const a = r() * TAU;
      const d = Math.sqrt(r());
      return [-2050 + Math.cos(a) * d * 1450, 90 + 160 * r() * r(), Math.sin(a) * d * 1500];
    },
  });
  group.add(puffs.mesh);

  /* ───── the flat's window (like) ───── */
  // in the pane's own frame: +z toward the torch (lookAt), x to the LEFT of the picture (seen from inside), y up.
  // Designed for VIEW.pane: the frame's right jamb on the right edge of the picture, its sill at the bottom, the torch through the glass.
  const pane = new THREE.Group();
  const paneSolid = makePart("pane");
  const PL = layer();
  {
    const hole = [[2, -3], [122, -3], [122, 157], [2, 157]];
    const wall = new THREE.Shape([new THREE.Vector2(-190, -170), new THREE.Vector2(320, -170), new THREE.Vector2(320, 290), new THREE.Vector2(-190, 290)]);
    wall.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x, y))));
    addMesh(paneSolid, plate(wall, 18, { bevel: 1.5 }).translate(0, 0, -18), solid(0x1a1e21, { rough: 0.9, metal: 0 }), { edgeOpacity: 0.55 });
    const frameMat = solid(0x4c545b, { rough: 0.55, metal: 0.25 });
    addMesh(paneSolid, box(10, 160, 12, 1.2), frameMat, { pos: [7, 77, -5], edgeOpacity: 0.8 });
    addMesh(paneSolid, box(10, 160, 12, 1.2), frameMat, { pos: [117, 77, -5], edgeOpacity: 0.8 });
    addMesh(paneSolid, box(120, 10, 12, 1.2), frameMat, { pos: [62, 2, -5], edgeOpacity: 0.8 });
    addMesh(paneSolid, box(120, 10, 12, 1.2), frameMat, { pos: [62, 152, -5], edgeOpacity: 0.8 });
    addMesh(paneSolid, box(8, 146, 10, 1), frameMat, { pos: [62, 77, -5], edgeOpacity: 0.8 });
    addMesh(paneSolid, box(150, 4, 30, 1), solid(0x737b82, { rough: 0.6, metal: 0.1 }), { pos: [62, -5, -17], edgeOpacity: 0.8 });
    PL.shell(pane, new THREE.PlaneGeometry(48, 140), [34.5, 77, 0.5], { k: 1, rim: 0.02, edge: 0, through: 0, spec: 0.55, lineOp: 0 });
    PL.shell(pane, new THREE.PlaneGeometry(48, 140), [89.5, 77, 0.5], { k: 1, rim: 0.02, edge: 0, through: 0, spec: 0.55, lineOp: 0 });
  }
  const sheenMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(BRAND.ink) }, uK: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK; varying vec2 vP;
      void main() {
        float u = (vP.x * 0.8 + vP.y) / 100.0; // across the streaks
        float s = exp(-pow((u - 0.62) / 0.07, 2.0)) + 0.55 * exp(-pow((u - 0.86) / 0.03, 2.0));
        gl_FragColor = vec4(uColor * uK * s, 1.0);
      }`,
  });
  const sheen = new THREE.Mesh(new THREE.PlaneGeometry(104, 140).translate(62, 77, 0), sheenMat);
  sheen.position.z = 0.8;
  sheen.renderOrder = 22;
  pane.add(sheen);
  pane.add(paneSolid);
  pane.position.set(...PANE.at);
  pane.lookAt(...PANE.look);
  group.add(pane);

  /* ───── the next file (047): an X-ray dishwasher, its two solid spray arms ───── */
  const washer = new THREE.Group();
  washer.position.set(...TEASER.at);
  const WL = layer();
  const washSolid = makePart("washer");
  const [ww, wh, wd] = TEASER.size;
  const washGrid = makeGrid({ cell: 10, major: 5, radius: 230, centre: [TEASER.at[0], TEASER.at[2]], opacity: 0.2, fog: 0 });
  washGrid.mesh.position.set(0, 0.3, 0);
  washer.add(washGrid.mesh);
  {
    // the kitchen: two cabinets and the worktop (paler), the machine between them
    for (const sx of [-1, 1]) WL.shell(washer, box(60, 82, 57, 1.5), [sx * 61, 45, -1.5], { k: 0.22, lineOp: 0.16 });
    WL.shell(washer, box(186, 4, 63, 1), [0, 88, 0], { k: 0.55, lineOp: 0.38 });
    // the machine: its body, the door, the tub inside (drawn before: it shows through)
    WL.shell(washer, box(ww - 1, wh - 4, wd - 3, 1.5), [0, 4 + (wh - 4) / 2, -1.5], { k: 1, lineOp: 0.55, edge: 0.5 });
    WL.shell(washer, box(ww - 2, 70, 2.5, 0.8), [0, 39, wd / 2 - 0.5], { k: 0.8, lineOp: 0.5, spec: 0.25 });
    addMesh(washSolid, box(ww - 2, 10, 3.5, 0.6), solid(0x2b3035, { rough: 0.5, metal: 0.2 }), { pos: [0, 79.5, wd / 2 - 0.2], edgeOpacity: 0.6 });
    addMesh(washSolid, box(28, 2.4, 2.2, 0.5), solid(GREY.light, { rough: 0.45, metal: 0.3 }), { pos: [0, 72, wd / 2 + 1.8], edgeOpacity: 0.6 });
    // plates in the lower basket (rear half: the front stays free for VIEW.washerArm), glasses upside down in the upper one
    const dish = lathe([[0, 0], [7.5, 0], [11.2, 1.7], [12, 2.3], [11.6, 2.5], [7.3, 0.7], [0, 0.7]], 40, { crease: 30 }).rotateX(Math.PI / 2);
    for (const z of [-22, -17.5, -13, -8.5]) WL.shell(washer, dish.clone(), [-6, 30, z], { k: 0.9, rim: 0.34, edge: 0.45, lineOp: 0.55, order: 16 });
    const tumbler = lathe([[3.9, 0], [3.7, 0.5], [3.05, 11], [0, 11]], 28, { crease: 30 });
    for (const [x, z] of [[-17, -15], [16, -15]]) WL.shell(washer, tumbler.clone(), [x, 56.5, z], { k: 0.9, rim: 0.32, edge: 0.4, lineOp: 0.5, order: 16 });
    // the two baskets, in lines
    const b = [];
    const basket = (y0, y1, x, z) => {
      for (const y of [y0, y1]) {
        seg(b, [-x, y, -z], [x, y, -z]); seg(b, [x, y, -z], [x, y, z]); seg(b, [x, y, z], [-x, y, z]); seg(b, [-x, y, z], [-x, y, -z]);
      }
      for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) seg(b, [sx * x, y0, sz * z], [sx * x, y1, sz * z]);
      for (let k = -4; k <= 4; k++) seg(b, [k * (x / 4.5), y0, -z], [k * (x / 4.5), y0, z]);
      for (const zz of [-z / 2, 0, z / 2]) seg(b, [-x, y0, zz], [x, y0, zz]);
    };
    basket(55.5, 73, 25, 23);
    basket(17, 35, 25.5, 23.5);
    for (const z of [-20, -15.5, -11, -6.5]) for (let x = -20; x <= 8; x += 4) seg(b, [x, 17, z], [x, 28, z]); // the tines
    WL.line(washer.add(segLines(b, { opacity: 0.34 })) && washer.children[washer.children.length - 1]);
    // the feed tube up the back wall to the upper arm, the lower arm's stand
    addMesh(washSolid, box(3, 3, 24, 0.8), solid(0x6a7279, { rough: 0.5, metal: 0.2 }), { pos: [0, TEASER.arm.y + 2.6, -12], edgeOpacity: 0.5 });
    addMesh(washSolid, box(3, TEASER.arm.y - 6, 3, 0.8), solid(0x6a7279, { rough: 0.5, metal: 0.2 }), { pos: [0, 6 + (TEASER.arm.y - 6) / 2 + 2.6, -24], edgeOpacity: 0.5 });
    addMesh(washSolid, cyl(3.2, TEASER.lower.y - 8, 0.6, 20), solid(0x6a7279, { rough: 0.5, metal: 0.2 }), { pos: [0, 8 + (TEASER.lower.y - 8) / 2, 0], edgeOpacity: 0.5 });
  }
  washer.add(washSolid);
  // the arms: solid, the upper one the light hero; jets tilted backwards on each side (they push it round)
  const jetShared = { uColor: { value: new THREE.Color(BRAND.veille) }, uK: { value: 0 }, uTime: { value: 0 } };
  const makeArm = (y, span, color, nozzles, lift, tipLen, seed) => {
    const g = new THREE.Group();
    g.position.y = y;
    const part = makePart("arm");
    const mat = solid(color, { rough: 0.42, metal: 0.25 });
    const half = span / 2;
    addMesh(part, cyl(4.4, 3.8, 0.6, 28), mat, { edgeOpacity: 0.6 });
    for (const s of [-1, 1]) {
      addMesh(part, box(half - 2.5, 2.3, 5.2, 0.7), mat, { pos: [s * (half / 2 + 1), 0, 0], edgeOpacity: 0.6 });
      addMesh(part, cyl(2.6, 2.3, 0.5, 20), mat, { pos: [s * (half - 1.2), 0, 0], edgeOpacity: 0.6 });
    }
    const dots = [];
    for (const s of [-1, 1]) for (const n of nozzles) dots.push(placed(cyl(0.65, 0.5, 0.1, 10), { pos: [s * n, 1.3, 0] }));
    addMesh(part, mergeGeometries(dots), solid(0x1d2125, { rough: 0.8 }), { edges: false });
    g.add(part);
    const r = rng(seed);
    const jet = (x, len, tilt, s) => {
      const geo = new THREE.CylinderGeometry(len * 0.07, 0.22, len, 10, 1, true).translate(0, len / 2, 0);
      const m = new THREE.Mesh(geo, jetMaterial(jetShared, r()));
      m.position.set(x, 1.2, 0);
      m.rotation.x = s * tilt; // +x side leans toward +z, −x side toward −z: the reaction turns the arm the way `arm` grows
      m.renderOrder = 7;
      m.frustumCulled = false;
      g.add(m);
    };
    for (const s of [-1, 1]) {
      for (const n of nozzles) jet(s * n, lift, 28 * DEG, s);
      jet(s * (half - 1.2), tipLen, 72 * DEG, s);
    }
    return { g, part };
  };
  const armU = makeArm(TEASER.arm.y, TEASER.arm.len, 0xb4bbc1, [6, 11, 15.5], 15, 9, 3);
  const armL = makeArm(TEASER.lower.y, TEASER.lower.len, 0x8e969d, [7, 13, 18.5], 19, 10, 5);
  washer.add(armU.g, armL.g);
  // seen from under the upper arm, a soft light behind it: the arm dark on its halo, its jets across it (the loop's match)
  const armHalo = softBall(BRAND.ink, 34);
  armHalo.mesh.position.set(0, TEASER.arm.y + 22, 0);
  armHalo.mesh.renderOrder = -2;
  const haloAt = new THREE.Vector3();
  let haloK = 0;
  armHalo.mesh.onBeforeRender = (renderer, scene, camera) => {
    const e = camera.matrixWorld.elements;
    haloAt.set(e[12], e[13], e[14]);
    washer.worldToLocal(haloAt);
    const under = smooth(TEASER.arm.y - 6, TEASER.arm.y - 18, haloAt.y) * smooth(55, 30, Math.hypot(haloAt.x, haloAt.z));
    armHalo.mat.uniforms.uK.value = 0.42 * under * haloK;
  };
  washer.add(armHalo.mesh);
  group.add(washer);

  /* ───── anchors ───── */
  const A = {
    col0: anchor(group, COLUMNS[0].at[0], COLUMNS[0].h, COLUMNS[0].at[1]),
    col1: anchor(group, COLUMNS[1].at[0], COLUMNS[1].h, COLUMNS[1].at[1]),
    col2: anchor(group, COLUMNS[2].at[0], COLUMNS[2].h, COLUMNS[2].at[1]),
    compressor: anchor(group, cx, Y0 + R + 40, cz), rotor: anchor(group, cx, Y0, cz),
    motor: anchor(group, SPARK_AT[0], SPARK_AT[1], SPARK_AT[2]), cloud: anchor(group, -2050, 220, 0),
    pane: anchor(group, ...PANE.at), washer: anchor(washer, 0, wh / 2, 0), arm: anchor(washer, 0, TEASER.arm.y, 0),
  };

  /* ───── contre-jour: read from the camera, once per draw of the sky ───── */
  let cj = 0;
  let colA = 1;
  const applyBack = () => {
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      const a = c.amount;
      c.shell.mat.uniforms.uRim.value = 0.24 + 0.42 * cj;
      c.shell.mat.uniforms.uEdge.value = 0.48 + 0.5 * cj;
      c.bodyMat.opacity = 0.86 * cj * a;
      c.bodyMat.depthWrite = cj * a > 0.3;
    }
  };
  sky.mesh.onBeforeRender = (renderer, scene, camera) => {
    const e = camera.matrixWorld.elements;
    const fx = -e[8];
    const fz = -e[10];
    const l = Math.hypot(fx, fz) || 1;
    const d = (fx * SUN[0] + fz * SUN[1]) / l;
    const k = clamp01((d - 0.25) / 0.65);
    cj = k * k * (3 - 2 * k) * colA;
    applyBack();
  };

  return {
    group, A,
    update(p, time) {
      const bench = p.bench > 0.5;
      const sh = bench ? 0 : clamp01(p.shell);
      // the sky, the ground, the plant
      sky.mesh.visible = sh > 0.003;
      sky.mat.uniforms.uK.value = 0.55 * sh;
      groundGrid.mat.uniforms.uAmount.value = sh;
      groundGrid.mesh.visible = sh > 0.003;
      P.set(sh);
      plant.visible = sh > 0.003;
      dress.update({ amount: sh }, time);
      if (!sky.mesh.visible) cj = 0;
      colA = sh;
      // the columns (faint glass on the bench); the middle one gives way to its ghost while it bursts
      const b = clamp01(p.blast);
      const gone = b > 0.001 && b < 0.999 ? 1 - smooth(0.0, 0.06, b) * (1 - smooth(0.78, 1.0, b)) : 1;
      const press = clamp01(p.press);
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        const a = (bench ? 0.3 : sh) * (i === 1 ? gone : 1);
        c.amount = a;
        c.L.set(a);
        c.g.visible = a > 0.003;
        const k = Math.max(0.001, press) * (c.yc - 40) * 0.97;
        c.fill.scale.y = k;
        c.fill.visible = press > 0.01 && a > 0.05;
        c.fillMat.uniforms.uH.value = k;
        c.fillMat.uniforms.uTime.value = time;
        c.fillMat.uniforms.uK.value = 1.15 * (bench ? 0.8 : 1) * Math.min(1, a / 0.3 + (bench ? 1 : 0));
      }
      if (bench) cj = 0;
      applyBack();
      // the compressor: solid, fades with the plant
      comp.visible = sh > 0.003;
      setPartOpacity(compBody, sh);
      setPartOpacity(rotorPart, sh * (1 - 0.6 * clamp01(p.hum)));
      setPartOpacity(blurPart, sh * 0.65 * clamp01(p.hum));
      rotor.rotation.x = p.rotor * TAU;
      setGlow(runMat, 1.6 * clamp01(p.hum) * sh);
      runLamp.visible = p.hum > 0.01 && sh > 0.01;
      const s = clamp01(p.spark) * sh;
      sparkBall.mesh.visible = s > 0.003;
      sparkBall.mat.uniforms.uK.value = 2.4 * s;
      sparkBall.mat.uniforms.uSize.value = 60 + 150 * s;
      sparkStreaks.visible = s > 0.003;
      sparkStreaks.scale.setScalar(40 + 150 * s);
      sparkStreaks.children[0].material.opacity = s;
      sparkLight.intensity = 4e4 * s;
      // the burst: fragments out and up, tumbling; the starburst and the ring spreading; the flash first
      const live = b > 0.001 && b < 0.999 && !bench;
      blast.visible = live;
      if (live) {
        const e = 1 - (1 - b) * (1 - b) * (1 - b); // fast out, slowing
        blastMat.opacity = smooth(0, 0.025, b) * Math.pow(1 - b, 1.3);
        for (let i = 0; i < frags.length; i++) {
          const f = frags[i];
          f.line.position.set(f.x + f.dx * f.far * e, f.y + f.up * 700 * e - 900 * b * b * b, f.z + f.dz * f.far * e);
          f.line.rotation.set(f.spinX * e, f.ry, f.spinZ * e);
        }
        blast.userData.burst.scale.setScalar(250 + 1500 * e);
        const ringLine = blast.userData.ring;
        ringLine.scale.setScalar(BC.r + 2400 * e);
        ringLine.material.opacity = smooth(0, 0.05, b) * (1 - b) * (1 - b);
        flash.mat.uniforms.uK.value = 2.2 * smooth(0, 0.04, b) * Math.pow(1 - b, 3);
        flash.mat.uniforms.uSize.value = 380 + 1300 * e;
      }
      // the cloud
      const c = bench ? 0 : clamp01(p.cloud);
      puffs.mesh.visible = c > 0.003;
      puffs.mat.uniforms.uC.value = c;
      puffs.mat.uniforms.uTime.value = time;
      // the window
      const pa = clamp01(p.pane);
      pane.visible = pa > 0.003 && !bench;
      setPartOpacity(paneSolid, pa);
      PL.set(pa);
      sheenMat.uniforms.uK.value = 0.09 * pa;
      // the dishwasher
      const te = bench ? 0 : clamp01(p.teaser);
      washer.visible = te > 0.003;
      washGrid.mat.uniforms.uAmount.value = te;
      WL.set(te);
      setPartOpacity(washSolid, te);
      setPartOpacity(armU.part, te);
      setPartOpacity(armL.part, te);
      armU.g.rotation.y = p.arm * DEG;
      armL.g.rotation.y = p.arm * 0.8 * DEG + 0.6;
      jetShared.uK.value = 0.6 * clamp01(p.jets) * te;
      haloK = te;
      jetShared.uTime.value = time;
    },
  };
}
