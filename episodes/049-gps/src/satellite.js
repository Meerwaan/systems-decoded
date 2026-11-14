// DOSSIER 049 — GPS : THE SKY (docs/049-decors.md › satellite.js, journal docs/journal/049-satellite.md).
//
//   buildSky() → { group, hero, bench, A, update(p, time, px) }
//     group   the sky, in the CAR's frame (it never scrolls): the four satellites over you (THE one solid, the three
//             others X-ray), the rest of the constellation drifting slowly on its tracks, the rings of light streaming
//             down to the phone, the four distance spheres (Fresnel shells, faint meridians) and their circles on the
//             ground, the blue dot on the ground
//     hero    { root, parts } THE satellite (SATS[0]), solid, re-parented by world.js: into `group` (at SATS[0],
//             scaled SKY_SCALE, its array turned to the car) or onto the bench (at BENCH.sat, scale 1, array down).
//             Inside: the oscillator, and at its heart the atomic clock (a tube, a veille core that beats with
//             beatSat, a bead that goes once round its collar per beat). Beside it, its twin « left on the ground »
//             (ink, beatGnd): two beads side by side, the slower one lags — the eye reads « slower » or « ahead ».
//     bench   the bench's own pieces, in the bench's frame: the thread of light from the phone's antenna to the
//             satellite's array, its ruler (a collar every « 300 m »), the ring that travels it and lights each
//             collar as it passes, the solid stroke of distance the collars fuse into
//   p = { bench, sats, others, satGlass, satExplode, core, twin, beatSat, beatGnd, rings, w1, w2, w3, w4, spheres,
//         err, dot, thread, travel, ruler, distance, litOsc, litClock }
// Nothing is allocated in update(): it runs sixteen times per frame.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { BRAND } from "@kit/brand.js";
import {
  solid, glow, glass, asShell, setGlow, lineMat, edgesOf, box, cyl, anchor, makePart, addMesh, setPartOpacity, mergeGeometries, placed,
} from "@kit/build3d.js";
import { SATS, OTHERS, SAT, SKY_SCALE, BENCH, PHONE, ROAD_FIX, FIELD_FIX, DELTA } from "./plan.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const frac = (x) => x - Math.floor(x);
const V = (a) => new THREE.Vector3(...a);
const DOWN = new THREE.Vector3(0, -1, 0);
const ZED = new THREE.Vector3(0, 0, 1);
const BLUE = 0x3b8cff; // the blue dot, and only it (docs/049-decors.md)
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// leaves fast, settles with a slight overshoot: parts have weight (build3d's)
const settle = (u) => easeInOut(u) + Math.sin(Math.PI * u) ** 2 * 0.055 * (u > 0.5 ? 1 : 0.25);

/* ──────────────────────────────────────────────── light that has a place
   A camera-facing glow, pushed BEHIND its centre along the view (so the solid it stands behind is never veiled):
   a bright heart and a long tail. `uK` its strength (≤ 3), sizes in the parent's units. */
function halo(color, size, push = 0, k = 1) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uK: { value: k }, uSize: { value: size }, uPush: { value: push } },
    vertexShader: /* glsl */ `
      uniform float uSize, uPush; varying vec2 vQ;
      void main() {
        vQ = position.xy;
        float s = length(modelMatrix[0].xyz);
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        c.xy += position.xy * uSize * s;
        c.z -= uPush * s;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK; varying vec2 vQ;
      void main() {
        float r = clamp(length(vQ), 0.0, 1.0);
        float g = 0.85 * exp(-r * r * 22.0) + 0.3 * pow(1.0 - r, 3.0);
        gl_FragColor = vec4(uColor * g * uK, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  mesh.userData.k = k;
  return mesh;
}
const setHalo = (h, k) => { h.material.uniforms.uK.value = k; h.visible = k > 0.004; };

/* a unit circle as a fat line: in the XY plane (rings, facing their path) or XZ (on the ground) */
function circleGeo(plane, n = 128) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push(plane === "xz" ? [Math.cos(a), 0, Math.sin(a)] : [Math.cos(a), Math.sin(a), 0]);
  }
  const g = new LineGeometry();
  g.setPositions(pts.flat());
  return g;
}
function lineOf(geo, color, width, hdr) {
  const line = new Line2(geo, lineMat(color, width, { additive: true, hdr }));
  line.renderOrder = 7;
  line.frustumCulled = false;
  return line;
}
/* set a line's colour (preset HDR colours: no allocation) and opacity */
const tint = (line, col, a) => { line.material.color.copy(col); line.material.opacity = a; line.visible = a > 0.004; };

/* ─────────────────────────────────────────────────────────── the clock
   The atomic clock: two light caps, three tie rods, a glass tube and, inside it, the core that glows; a collar
   around it with a bead that goes once round per beat. `hue` veille (the satellite's) or ink (the ground's). */
function makeClock(name, hue, { plinth = false } = {}) {
  const part = makePart(name);
  const [cd, ch] = SAT.clock; // 5 × 7
  const capMat = solid(0xd4cec0, { rough: 0.38, metal: 0.25 });
  for (const y of [-ch / 2 + 0.5, ch / 2 - 0.5]) addMesh(part, cyl(cd / 2, 1, 0.12, 48), capMat, { pos: [0, y, 0] });
  const rodMat = solid(0x9ea4aa, { rough: 0.45, metal: 0.35 });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    addMesh(part, cyl(0.22, ch - 2, 0.05, 12), rodMat, { pos: [Math.cos(a) * 2.0, 0, Math.sin(a) * 2.0], edges: false });
  }
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, ch - 2, 40, 1, true), glass(BRAND.ink, { base: 0.01, rim: 0.4, edge: 0.5, spec: 0.5 }));
  part.add(tube);
  const coreMat = glow(hue, 1.2);
  part.userData.part.mats.add(coreMat);
  const core = new THREE.Mesh(cyl(1.05, ch - 2.8, 0.3, 32), coreMat);
  part.add(core);
  // the collar and its bead (one turn per beat), two fading ghosts behind it
  const collarMat = solid(0x7c838b, { rough: 0.4, metal: 0.4 });
  addMesh(part, new THREE.TorusGeometry(3.1, 0.16, 8, 64).rotateX(Math.PI / 2), collarMat, { edges: false });
  const beads = [1, 0.45, 0.2].map((k) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.5 - 0.08 * (k < 1 ? 1 : 0), 16, 12), glow(hue, 2.2 * k));
    part.userData.part.mats.add(m.material);
    part.add(m);
    return m;
  });
  if (plinth) {
    // « restée au sol »: a dark plinth and its base
    const pMat = solid(0x3a4047, { rough: 0.6, metal: 0.2 });
    addMesh(part, cyl(3.4, 1.2, 0.15, 48), pMat, { pos: [0, -ch / 2 - 0.6, 0] });
    addMesh(part, cyl(4.6, 0.5, 0.1, 48), pMat, { pos: [0, -ch / 2 - 1.45, 0] });
  }
  const light = halo(hue, 13, 3, 0);
  part.add(light);
  const hueC = new THREE.Color(hue);
  return {
    part, core, coreMat, light,
    /** beat: a counter (its fraction is the pulse); lit adds a glow; alone lights its own halo */
    set(beat, lit, alone) {
      const f = frac(beat);
      const pulse = Math.exp(-5 * f);
      setGlow(coreMat, (0.9 + 1.3 * pulse) * (1 + 0.5 * lit), hueC);
      for (let i = 0; i < 3; i++) {
        const a = (beat - i * 0.045) * Math.PI * 2;
        beads[i].position.set(Math.cos(a) * 3.1, 0, -Math.sin(a) * 3.1);
      }
      setHalo(light, 0.35 * lit + 0.9 * alone + 0.25 * alone * pulse);
    },
  };
}

/* ──────────────────────────────────────────────────── the satellite's shape
   In its own units (the bench's): bus 16 × 18 × 16, two wings of two panels, the helix array on its −y face. */
const [BX, BY, BZ] = SAT.bus;
const [WX, WY, WZ] = SAT.wing;
const ARRAY_Y = -BY / 2 - 0.5;
function wingGeos() {
  // one wing along +x from its root: two panels (frame + raised cells), a yoke
  const frames = [];
  const cells = [];
  const pw = WX / 2 - 0.3;
  for (let p = 0; p < 2; p++) {
    const x0 = 2 + p * (pw + 0.6);
    frames.push(placed(box(pw, WY * 0.8, WZ, 0.1), { pos: [x0 + pw / 2, 0, 0] }));
    const cw = (pw - 0.8) / 3;
    const cz = (WZ - 0.8) / 2;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      cells.push(placed(box(cw - 0.35, WY * 1.15, cz - 0.35, 0.06), { pos: [x0 + 0.4 + cw * (i + 0.5), 0, -WZ / 2 + 0.4 + cz * (j + 0.5)] }));
    }
  }
  const yoke = [placed(cyl(0.45, 2.4, 0.05, 16), { pos: [1.2, 0, 0], rotZ: Math.PI / 2 }), placed(cyl(1.3, 0.9, 0.1, 24), { pos: [0.3, 0, 0], rotZ: Math.PI / 2 })];
  return { frame: mergeGeometries(frames), cells: mergeGeometries(cells), yoke: mergeGeometries(yoke) };
}
function arrayGeos() {
  const disc = placed(cyl(SAT.array / 2, 1, 0.15, 64), { pos: [0, ARRAY_Y, 0] });
  const helices = [];
  for (let i = 0; i < 12; i++) {
    const inner = i < 4;
    const a = inner ? (i / 4) * Math.PI * 2 + Math.PI / 4 : ((i - 4) / 8) * Math.PI * 2;
    const r = inner ? 1.7 : 3.7;
    helices.push(placed(cyl(0.42, 2.4, 0.12, 16, 0.3), { pos: [Math.cos(a) * r, ARRAY_Y - 1.7, Math.sin(a) * r] }));
  }
  return { disc, helices: mergeGeometries(helices) };
}

/** THE satellite, solid: parts that can fade, each with its own materials. */
function makeHero() {
  const root = new THREE.Group();
  // bus: three greys — the body mid, the radiators light, the lid mid; the glass shell for the X-ray
  const bus = makePart("bus");
  const busGeo = box(BX, BY, BZ, 0.5);
  addMesh(bus, busGeo, solid(0x59606a, { rough: 0.5, metal: 0.35 }));
  const radMat = solid(0xa3a9af, { rough: 0.4, metal: 0.2 });
  for (const s of [-1, 1]) {
    addMesh(bus, box(12, 14, 0.6, 0.12), radMat, { pos: [0, -0.5, s * (BZ / 2 + 0.3)] });
    for (let i = 0; i < 4; i++) addMesh(bus, box(0.5, 13, 0.7, 0.08), radMat, { pos: [-4.2 + i * 2.8, -0.5, s * (BZ / 2 + 0.75)], edges: false });
  }
  root.add(bus);
  const lid = makePart("lid");
  const lidMat = solid(0x6a717a, { rough: 0.45, metal: 0.35 });
  addMesh(lid, box(BX + 0.6, 1.2, BZ + 0.6, 0.2), lidMat, { pos: [0, BY / 2 + 0.6, 0] });
  addMesh(lid, cyl(0.45, 3.4, 0.08, 16), solid(0xb9b3a6, { rough: 0.4 }), { pos: [4.5, BY / 2 + 2.9, -4.5] });
  addMesh(lid, box(3, 1, 3, 0.15), solid(0x3d434a, { rough: 0.5, metal: 0.3 }), { pos: [-4, BY / 2 + 1.7, 4] });
  root.add(lid);
  const shell = new THREE.Mesh(busGeo, glass(BRAND.ink, { base: 0, rim: 0.35, edge: 0.55, spec: 0.35, through: 0.3 }));
  asShell([shell], 20);
  const shellEdges = edgesOf(busGeo, { color: BRAND.ink, width: 1.8, opacity: 0.75 });
  shell.add(shellEdges);
  root.add(shell);
  // wings
  const wg = wingGeos();
  const wings = [-1, 1].map((s) => {
    const w = makePart(s < 0 ? "wingL" : "wingR");
    addMesh(w, wg.frame, solid(0x7f868e, { rough: 0.62, metal: 0.2, env: 0.5 }));
    addMesh(w, wg.cells, solid(0x1f2731, { rough: 0.58, metal: 0.2, env: 0.35 }));
    addMesh(w, wg.yoke, solid(0x8a9097, { rough: 0.45, metal: 0.35 }));
    w.scale.x = s; // the left wing mirrored
    w.userData.side = s;
    w.position.x = s * (BX / 2);
    root.add(w);
    return w;
  });
  // the antenna array (−y, towards the Earth): a light disc, twelve helices
  const array = makePart("array");
  const ag = arrayGeos();
  addMesh(array, ag.disc, solid(0xbdb6a8, { rough: 0.4, metal: 0.2 }));
  addMesh(array, ag.helices, solid(0xddd7c9, { rough: 0.35, metal: 0.15 }));
  root.add(array);
  // inside: the oscillator (a housing, its crystal oven, a strip that lights) and the clock
  const osc = makePart("osc");
  addMesh(osc, box(6, 3, 5, 0.2), solid(0x8e959c, { rough: 0.42, metal: 0.35 }));
  addMesh(osc, cyl(0.95, 1.3, 0.1, 24), solid(0x555c64, { rough: 0.45, metal: 0.4 }), { pos: [-1.4, 2.1, -0.4] });
  addMesh(osc, cyl(0.35, 1.0, 0.05, 12), solid(0xc8c2b4, { rough: 0.4 }), { pos: [1.8, 0, 2.9], rot: [Math.PI / 2, 0, 0] });
  const oscGlow = glow(BRAND.veille, 0.3);
  osc.userData.part.mats.add(oscGlow);
  const strip = new THREE.Mesh(box(3.4, 0.45, 0.2, 0.05), oscGlow);
  strip.position.set(-0.6, -0.4, 2.55);
  osc.add(strip);
  osc.position.set(0, -4, 0);
  root.add(osc);
  const clock = makeClock("clock", BRAND.veille);
  clock.part.position.set(0, 3, 0);
  root.add(clock.part);
  // the light it stands on, in the sky and on the bench (ink, behind it)
  const back = halo(BRAND.ink, 46, 26, 0.4);
  root.add(back);
  return { root, bus, lid, shell, shellEdges, wings, array, osc, oscGlow, clock, back };
}

/** A satellite in X-ray (the three others, the constellation): one glass shell, its edges, its clock's spark. */
function makeGhost(geos) {
  const root = new THREE.Group();
  const mat = glass(BRAND.ink, { base: 0, rim: 0.45, edge: 0.6, spec: 0.2, through: 0.25 });
  const edgeMat = lineMat(BRAND.ink, 1.8, { opacity: 0.7 });
  const shells = geos.map((geo) => {
    const m = new THREE.Mesh(geo, mat);
    const e = edgesOf(geo);
    e.material = edgeMat;
    m.add(e);
    root.add(m);
    return m;
  });
  asShell(shells, 20);
  const edges = { material: edgeMat };
  const spark = halo(BRAND.veille, 9, 0, 1);
  spark.position.y = 3;
  root.add(spark);
  const back = halo(BRAND.ink, 40, 24, 0.2);
  root.add(back);
  return {
    root,
    set(a, k = 1) {
      root.visible = a > 0.004;
      mat.uniforms.uAmount.value = a * k;
      edges.material.opacity = 0.7 * a * k;
      setHalo(spark, 0.9 * a * k);
      setHalo(back, 0.2 * a * k);
    },
  };
}

/* ─────────────────────────────────────────────────────────── the spheres
   A huge Fresnel shell around each satellite: a lip where it turns away, faint meridians and parallels (drawn at two
   pixels with fwidth, fading before they get dense), a band of light where it meets the ground; nothing below the
   ground; it fades out as the camera goes inside (a wall, seen from within). */
function sphereMat() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(BRAND.signal) }, uC: { value: new THREE.Vector3() }, uR: { value: 1 }, uAmt: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN; varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uC; uniform float uR, uAmt; varying vec3 vW; varying vec3 vN; varying vec2 vUv;
      void main() {
        if (uAmt < 0.003 || vW.y < 0.0) discard;
        vec3 v = normalize(cameraPosition - vW);
        float g = clamp(1.0 - abs(dot(normalize(vN), v)), 0.0, 1.0);
        float rim = 0.55 * pow(g, 4.0) + 0.5 * smoothstep(0.82, 0.99, g);
        vec2 q = vUv * vec2(16.0, 10.0);
        vec2 fw = max(fwidth(q), vec2(1e-4));
        vec2 dl = abs(fract(q - 0.5) - 0.5) / fw;
        float line = 1.0 - clamp(min(dl.x, dl.y) - 0.6, 0.0, 1.0);
        float fine = 1.0 - smoothstep(0.06, 0.16, max(fw.x, fw.y));
        float ground = 1.0 - smoothstep(0.0, 120.0, vW.y);
        float inside = smoothstep(uR * 1.05, uR * 1.7, length(cameraPosition - uC));
        float light = rim + 0.14 * line * fine * (0.35 + 0.65 * g) + 0.2 * ground * ground;
        gl_FragColor = vec4(uColor * light * uAmt * inside, 1.0);
      }`,
  });
}

/* ─────────────────────────────────────────────────────────── the blue dot
   A disc on the ground, its bright lip, its halo of precision (it breathes slowly). */
function makeDot() {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    uniforms: { uColor: { value: new THREE.Color(BLUE) }, uAmt: { value: 0 }, uBreath: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vQ; void main() { vQ = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmt, uBreath; varying vec2 vQ;
      void main() {
        float r = length(vQ) * 420.0; // cm
        float aa = max(fwidth(r), 0.5);
        float disc = 1.0 - smoothstep(78.0 - aa, 78.0 + aa, r);
        float lip = (1.0 - smoothstep(aa, 2.5 * aa, abs(r - 92.0)));
        float halo = 0.5 * exp(-pow(r / (230.0 * uBreath), 2.0));
        float ring = 0.35 * (1.0 - smoothstep(aa, 2.0 * aa, abs(r - 300.0 * uBreath)));
        vec3 c = uColor * (1.7 * disc + halo + ring) + vec3(0.75, 0.85, 1.0) * lip * 1.4;
        gl_FragColor = vec4(c * uAmt, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), mat);
  mesh.scale.setScalar(420);
  mesh.renderOrder = 5;
  return { mesh, mat };
}

export function buildSky() {
  const group = new THREE.Group();
  const A = {};

  /* ── THE satellite and its twin ── */
  const H = makeHero();
  const twin = makeClock("twin", BRAND.ink, { plinth: true });
  twin.part.position.set(15, 3, 13); // beside the bus's front corner, clear of the wing: the two clocks side by side
  H.root.add(twin.part);
  const hero = { root: H.root, parts: { bus: H.bus, lid: H.lid, wings: H.wings, array: H.array, osc: H.osc, clock: H.clock.part, twin: twin.part, clockMat: H.clock.coreMat } };
  A.clock = anchor(H.clock.part, 0, 0, 0);
  A.osc = anchor(H.osc, 0, 0, 0);
  A.array = anchor(H.array, 0, ARRAY_Y - 2.9, 0);
  A.twin = anchor(twin.part, 0, 0, 0);

  /* ── the three others over you, and the rest of the constellation: X-ray ── */
  const wg = wingGeos();
  const ag = arrayGeos();
  const ghostParts = [box(BX, BY, BZ, 0.5), ag.disc];
  for (const s of [-1, 1]) {
    const m = new THREE.Matrix4().makeTranslation(s * BX / 2, 0, 0).multiply(new THREE.Matrix4().makeScale(s, 1, 1));
    ghostParts.push(placed(box(WX, WY, WZ, 0.1), { pos: [s * (BX / 2 + 2 + WX / 2), 0, 0] }), wg.yoke.clone().applyMatrix4(m));
  }

  const faceCar = (obj, at) => {
    obj.position.set(...at);
    obj.quaternion.setFromUnitVectors(DOWN, V(PHONE.at).sub(V(at)).normalize());
  };
  const copies = SATS.slice(1).map((s) => {
    const g = makeGhost(ghostParts);
    faceCar(g.root, s);
    g.root.scale.setScalar(SKY_SCALE);
    group.add(g.root);
    return g;
  });
  const others = OTHERS.map((s, i) => {
    const g = makeGhost(ghostParts);
    g.root.scale.setScalar(SKY_SCALE * 0.7);
    group.add(g.root);
    // each drifts along its own tilted track (deterministic, slow: ≈ a third of a degree per second)
    const axis = new THREE.Vector3(Math.sin(i * 2.1) * 0.5, 1, Math.cos(i * 1.7) * 0.5).normalize();
    return { g, base: V(s), axis, w: (0.004 + 0.0018 * ((i * 5) % 3)) * (i % 2 ? 1 : -1) };
  });
  const heroSky = new THREE.Object3D();
  faceCar(heroSky, SATS[0]);
  A.sats = SATS.map((s) => anchor(group, ...s));

  /* ── the rings of light: per satellite, a stream of heads (each with two fading trails) and ONE marked ring ── */
  const ringGeo = circleGeo("xy", 96);
  const TARGET = V(PHONE.at);
  const VEILLE = new THREE.Color(BRAND.veille);
  const cHead = VEILLE.clone().multiplyScalar(1.35);
  const cTrail = VEILLE.clone().multiplyScalar(0.9);
  const cMark = VEILLE.clone().multiplyScalar(2.6);
  const HEADS = 3;
  const TRAILS = [0, 0.022, 0.044];
  const paths = SATS.map((s) => {
    const from = V(s).add(TARGET.clone().sub(V(s)).normalize().multiplyScalar(11 * SKY_SCALE)); // leaves the array
    const q = new THREE.Quaternion().setFromUnitVectors(ZED, TARGET.clone().sub(from).normalize());
    const mk = (w) => { const l = lineOf(ringGeo, BRAND.veille, w, 1); l.quaternion.copy(q); group.add(l); return l; };
    return {
      from, q,
      stream: Array.from({ length: HEADS * TRAILS.length }, (_, k) => mk(k % TRAILS.length ? 2 : 3.2)),
      mark: TRAILS.map((_, k) => mk(k ? 2.6 : 4.5)),
    };
  });
  const ringR = (u) => 70 + 420 * u; // the wave widens as it travels
  const placeRing = (line, path, u) => {
    line.position.lerpVectors(path.from, TARGET, u);
    const r = ringR(u);
    line.scale.set(r, r, 1);
  };
  const ringFade = (u) => smooth(0.0, 0.07, u) * (1 - smooth(0.84, 1.0, u));
  // the arrival on the phone: a spark when a marked ring lands
  const spark = halo(BRAND.veille, 9, 0, 0); // small: the hook sees it from 40 cm
  spark.position.copy(TARGET);
  group.add(spark);

  /* ── the four distance spheres and their circles on the ground ── */
  const groundGeo = circleGeo("xz", 256);
  const SIG = new THREE.Color(BRAND.signal);
  const cSig = SIG.clone().multiplyScalar(1.8);
  const cVei = VEILLE.clone().multiplyScalar(1.8);
  const cSigH = SIG.clone().multiplyScalar(0.9);
  const cVeiH = VEILLE.clone().multiplyScalar(0.9);
  const spheres = SATS.map((s) => {
    const mat = sphereMat();
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), mat);
    m.position.set(...s);
    m.renderOrder = 4;
    m.frustumCulled = false;
    mat.uniforms.uC.value.set(...s);
    group.add(m);
    const core = lineOf(groundGeo, BRAND.signal, 3.2, 1);
    const glowL = lineOf(groundGeo, BRAND.signal, 11, 1);
    for (const l of [core, glowL]) { l.position.set(s[0], 5, s[2]); group.add(l); }
    return { m, mat, core, glowL, h: s[1], Rs: V(s).distanceTo(V(ROAD_FIX)) };
  });

  /* ── the blue dot on the ground ── */
  const D = makeDot();
  group.add(D.mesh);
  A.dot = anchor(D.mesh, 0, 0, 0);
  const P0 = V(ROAD_FIX);
  const P1 = V(FIELD_FIX);

  /* ── the bench: thread, ruler (a collar every « 300 m »), travelling ring, stroke of distance ── */
  const benchGroup = new THREE.Group();
  const from = V(BENCH.phone).add(V(PHONE.antenna)); // the phone's antenna
  const to = V(BENCH.sat).add(new THREE.Vector3(0, ARRAY_Y - 2.9, 0)); // the satellite's helices
  const len = from.distanceTo(to);
  const dir = from.clone().sub(to).normalize(); // satellite → phone
  const qThread = new THREE.Quaternion().setFromUnitVectors(DOWN, dir);
  const stick = (r, mat, seg = 12) => {
    // a unit rod hanging from the satellite (its top on `to`), scaled along its length
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, seg, 1, true).translate(0, -0.5, 0), mat);
    m.position.copy(to);
    m.quaternion.copy(qThread);
    benchGroup.add(m);
    return m;
  };
  const threadMat = glow(BRAND.veille, 2.2);
  const thread = stick(0.16, threadMat);
  const sleeveMat = glow(BRAND.veille, 0.5, { additive: true, opacity: 0.5 });
  const sleeve = stick(0.55, sleeveMat, 16);
  const strokeMat = glow(BRAND.veille, 1.3, { opacity: 0.9 });
  const stroke = stick(1.05, strokeMat, 24);
  const TICKS = 12;
  const tickBase = new THREE.Color(BRAND.ink).multiplyScalar(0.75);
  const tickLit = VEILLE.clone().multiplyScalar(2.2);
  const ticks = [];
  for (let i = 1; i <= TICKS; i++) {
    const long = i % 4 === 0;
    const mat = new THREE.MeshBasicMaterial({ color: tickBase.clone(), transparent: true, fog: false });
    const tk = new THREE.Mesh(new THREE.TorusGeometry(long ? 1.7 : 1.15, long ? 0.2 : 0.15, 8, 40).rotateX(Math.PI / 2), mat);
    tk.position.lerpVectors(to, from, i / (TICKS + 1));
    tk.quaternion.copy(qThread);
    benchGroup.add(tk);
    ticks.push({ tk, mat, u: i / (TICKS + 1) });
  }
  const runners = [1, 0.4, 0.15].map((k, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(2.4 - 0.2 * i, 0.3 - 0.06 * i, 10, 56).rotateX(Math.PI / 2), glow(BRAND.veille, 2.8 * k, { additive: true }));
    m.quaternion.copy(qThread);
    benchGroup.add(m);
    return m;
  });
  const runnerHalo = halo(BRAND.veille, 7, 0, 0);
  benchGroup.add(runnerHalo);
  A.threadTop = anchor(benchGroup, to.x, to.y, to.z);
  A.threadFoot = anchor(benchGroup, from.x, from.y, from.z);

  const T = new THREE.Vector3();
  const W = [0, 0, 0, 0];
  let lastExp = -1;
  return {
    group, hero, bench: benchGroup, A,
    update({ bench = 0, sats = 1, others: oth = 0, satGlass = 0, satExplode = 0, core = 0, twin: tw = 0, beatSat = 0, beatGnd = 0,
      rings: rg = 0, w1 = 0, w2 = 0, w3 = 0, w4 = 0, spheres: sp = 0, err = 0, dot: dt = 0, thread: th = 0, travel: tv = 0,
      ruler = 0, distance = 0, litOsc = 0, litClock = 0 } = {}, time = 0) {
      const onBench = !!bench;
      const k = clamp01(core);
      const g = clamp01(satGlass);
      /* THE satellite: in the sky or on the bench */
      if (onBench) { H.root.position.set(...BENCH.sat); H.root.scale.setScalar(1); H.root.quaternion.identity(); }
      else { H.root.position.copy(heroSky.position); H.root.scale.setScalar(SKY_SCALE); H.root.quaternion.copy(heroSky.quaternion); }
      H.root.visible = onBench || sats > 0.01;
      // X-ray and « au cœur »: the bus goes glass, then everything but the clock fades
      setPartOpacity(H.bus, (1 - g) * (1 - k));
      setPartOpacity(H.lid, (1 - g) * (1 - k));
      H.shell.material.uniforms.uAmount.value = g * (1 - k);
      H.shell.visible = g * (1 - k) > 0.004;
      H.shellEdges.material.opacity = 0.75 * g * (1 - k);
      for (const w of H.wings) setPartOpacity(w, 1 - k);
      setPartOpacity(H.array, 1 - k);
      setPartOpacity(H.osc, 1 - k);
      setHalo(H.back, (onBench ? 0.3 : 0.42) * (1 - k));
      // it opens: wings apart, the lid up, the clock rises out, the oscillator slides out towards the light
      const e = clamp01(satExplode);
      if (e !== lastExp) {
        lastExp = e;
        const s1 = settle(clamp01(e / 0.6));
        const s2 = settle(clamp01((e - 0.15) / 0.6));
        const s3 = settle(clamp01((e - 0.3) / 0.6));
        for (const w of H.wings) w.position.x = w.userData.side * (BX / 2 + 9 * s1);
        H.lid.position.y = 20 * s1;
        H.array.position.y = -5 * s2;
        H.osc.position.set(0, -4 - 1.5 * s3, 15 * s3);
        H.clock.part.position.y = 3 + 13 * s2;
      }
      H.oscGlow.color.copy(VEILLE).multiplyScalar(0.25 + 1.6 * clamp01(litOsc));
      H.clock.set(beatSat, clamp01(litClock) + 0.6 * g, k);
      // its twin, « left on the ground »
      setPartOpacity(twin.part, clamp01(tw));
      twin.set(beatGnd, 0.4, 0);

      /* the others: three over you (sats 1 → 4), the constellation drifting slowly */
      for (let i = 0; i < copies.length; i++) copies[i].set(onBench ? 0 : clamp01(sats - (i + 1)));
      for (let i = 0; i < others.length; i++) {
        const o = others[i];
        o.g.set(onBench ? 0 : clamp01(oth), 0.55);
        if (onBench || oth < 0.004) continue;
        Q.setFromAxisAngle(o.axis, o.w * time);
        o.g.root.position.copy(o.base).applyQuaternion(Q);
        T.copy(TARGET).sub(o.g.root.position).normalize();
        o.g.root.quaternion.setFromUnitVectors(DOWN, T);
      }
      group.visible = !onBench;
      benchGroup.visible = onBench;

      if (!onBench) {
        /* rings: the stream (a head and its trail, slow: a fifth of the path per head spacing per second at most) */
        W[0] = w1; W[1] = w2; W[2] = w3; W[3] = w4;
        let arrive = 0;
        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];
          const seen = i === 0 ? (sats > 0.01 ? 1 : 0) : clamp01(sats - i);
          const a0 = clamp01(rg) * seen;
          for (let h = 0; h < HEADS; h++) {
            const u0 = frac(0.09 * time + h / HEADS + i * 0.13);
            for (let t = 0; t < TRAILS.length; t++) {
              const line = path.stream[h * TRAILS.length + t];
              const u = u0 - TRAILS[t];
              const a = a0 * (u > 0 ? ringFade(u) : 0) * (t === 0 ? 0.9 : t === 1 ? 0.45 : 0.2);
              tint(line, t === 0 ? cHead : cTrail, a);
              if (a > 0.004) placeRing(line, path, u);
            }
          }
          const w = W[i];
          for (let t = 0; t < TRAILS.length; t++) {
            const line = path.mark[t];
            const u = w - TRAILS[t] * 0.8;
            const a = (w > 0.001 && w < 0.999 && u > 0 ? smooth(0, 0.04, u) * (1 - smooth(0.94, 1, w)) : 0) * seen * (t === 0 ? 1 : t === 1 ? 0.5 : 0.25);
            tint(line, cMark, a);
            if (a > 0.004) placeRing(line, path, u);
          }
          arrive = Math.max(arrive, smooth(0.86, 0.97, w) * (1 - smooth(0.975, 1, w)) * seen);
        }
        setHalo(spark, 1.1 * arrive);

        /* spheres: every radius shrunk by the same DELTA·err — three meet at FIELD_FIX, the fourth misses */
        const e2 = clamp01(err);
        const sig = err > 0.02;
        for (let i = 0; i < spheres.length; i++) {
          const s = spheres[i];
          const show = clamp01(sp - i);
          const r = s.Rs - DELTA * e2;
          s.m.visible = show > 0.004;
          s.m.scale.setScalar(r);
          s.mat.uniforms.uR.value = r;
          s.mat.uniforms.uAmt.value = 0.55 * show;
          s.mat.uniforms.uColor.value.copy(sig ? SIG : VEILLE);
          const rg2 = r > s.h ? Math.sqrt(r * r - s.h * s.h) : 0;
          s.core.scale.set(rg2, 1, rg2);
          s.glowL.scale.set(rg2, 1, rg2);
          tint(s.core, sig ? cSig : cVei, rg2 > 0 ? show : 0);
          tint(s.glowL, sig ? cSigH : cVeiH, rg2 > 0 ? 0.28 * show : 0);
        }
        /* the blue dot, where the phone thinks it is */
        T.lerpVectors(P0, P1, e2);
        D.mesh.position.set(T.x, 4, T.z);
        D.mat.uniforms.uAmt.value = clamp01(dt);
        D.mat.uniforms.uBreath.value = 1 + 0.08 * Math.sin((time * Math.PI * 2) / 2.6);
        D.mesh.visible = dt > 0.004;
      } else {
        /* the bench: the thread unrolls from the satellite down, the ruler's collars appear top-down, the ring
           travels satellite → phone lighting each collar it passes; then the collars fuse into one stroke */
        const t1 = clamp01(th);
        thread.scale.set(1, len * t1, 1);
        sleeve.scale.set(1, len * t1, 1);
        thread.visible = sleeve.visible = t1 > 0.004;
        const dd = clamp01(distance);
        stroke.scale.set(1, len * Math.max(dd, 0.001), 1);
        stroke.visible = dd > 0.004;
        const v = clamp01(tv);
        const moving = tv > 0.001 && tv < 0.999;
        for (const tk of ticks) {
          const shown = smooth(tk.u - 0.06, tk.u, clamp01(ruler) * 1.02) * (1 - smooth(tk.u - 0.04, tk.u + 0.02, dd));
          tk.mat.opacity = shown;
          tk.tk.visible = shown > 0.004;
          const lit = v >= tk.u ? 1 : smooth(tk.u - 0.03, tk.u, v);
          tk.mat.color.copy(tickBase).lerp(tickLit, lit);
        }
        for (let i = 0; i < runners.length; i++) {
          const m = runners[i];
          const u = v - i * 0.03;
          m.visible = moving && u > 0;
          m.position.lerpVectors(to, from, clamp01(u));
        }
        runnerHalo.position.lerpVectors(to, from, v);
        setHalo(runnerHalo, moving ? 1.2 : 0);
      }
    },
  };
}
const Q = new THREE.Quaternion();
