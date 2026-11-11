// DOSSIER L06 — Blackout : THE SOLID SYSTEMS — what the film opens. Three greys, fine edges, metal ≤ 0.5; light = glow.
// Brief: docs/L06-decors.md § model.js. Numbers: world.js · FIRST (each one commented there). Journal: docs/journal/L06-model.md
//
//   buildModel() → {
//     rotors: { group, A: { flange: [W, E, S] (Object3D at each strobe mark's disc), turbine, rotor, stator } },
//                        three turbo-alternators side by side (plan.js · ROTOR): West at z 0, North-East, South-East;
//                        E and S only show at `rotors` ≥ 2 / 3. Bench spot 0, at the bench's origin.
//     dial:   { group, A: { needle, face } },   the frequency dial (plan.js · DIAL): standing on its foot at its local
//                        origin, its face toward +z. world.js stands it on the map's rim (CARTE) or on the bench (spot 0).
//     lw:     { group, A: { relayRwe, relayEon, dialRwe, dialEon, breakerRwe, bars, coupler } },
//                        Landesbergen–Wehrendorf on the bench (plan.js · LW): bench spot 1, at the bench's origin.
//     hero:   { group, A: { relay, cells: [4], breaker, flags } },   the frequency relay and its four steps of HTA
//                        cells at TRUE scale (plan.js · HERO): local origin at the foot of the first cell's front-left
//                        corner, the row along +x, fronts facing +z. world.js mounts it in the poste source (QUARTIER)
//                        or on the bench (spot 2).
//     sync:   { group },   the coupling device between the West's and the North-East's rotors (bench spot 0)
//     report: { group, A: { cover } },   the UCTE final report, 84 pages (bench spot 3)
//     update(S, time, px, ctx)   ctx = { set, spot }: every frame, sixteen times per frame, no allocation
//   }
//
// What `update` reads in S (world.js · FIRST): rotors altOpen altNamed drive brake gov res turnW turnE turnS · dial
// zone hzW hzE hzS needles band marks · amps markRwe markEon bars couple lwTrip lwNamed volt · hero heroOpen setpt
// clac steps dep precision · sync tryK fail closed · page
//
// THE ONLY FIGURES on the pieces: 50 and (with `marks`) 49,5 · 49 · 48,5 · 48 · 47,5 on the frequency dial; 1 795 (engraved,
// Wehrendorf), « 2 100 » (`markRwe`) and « 3 000 » (`markEon`) on the relays; « 49 » (`setpt`) on the hero. No maker's name.
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { solid, glow, setGlow, placed, mergeGeometries, anchor, lathe, box, cyl, plate, makePart, addMesh, setPartOpacity } from "@kit/build3d.js";
import { ROTOR, DIAL, dialAngle, LW, HERO, REPORT, FREQ, DEG } from "./plan.js";

const PI = Math.PI;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const DARK = new THREE.Color(0x14171a);
const TMP = new THREE.Color();
// three greys (cast < panel < steel), and the pale steel of what the film names
const G = { pit: 0x1b1f22, cast: 0x4c545a, panel: 0x6f797f, steel: 0x9aa1a5, pale: 0xc6c4b9, paper: 0xcfc9bb };
const SET_CARTE = 0;
const SET_QUARTIER = 2;
const SET_BENCH = 3; // world.js · SET (not imported: world.js imports this file)

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const sstep = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const easeOut = (u) => 1 - (1 - u) * (1 - u) * (1 - u);
const mat = (c, o = {}) => solid(c, { rough: 0.6, metal: 0.3, ...o });
const fader = (m, opacity = 0) => {
  m.transparent = true;
  m.depthWrite = false;
  m.opacity = opacity;
  return m;
};

/* ───────────────────────────── geometry helpers ───────────────────────────── */
const at = (g, x = 0, y = 0, z = 0) => placed(g, { pos: [x, y, z] });
const ax = (g, x = 0, y = 0, z = 0) => placed(g, { pos: [x, y, z], rotZ: -PI / 2 }); // a y-axis piece laid along +x
const az = (g, x = 0, y = 0, z = 0) => placed(g, { pos: [x, y, z], rotX: PI / 2 }); //  … along +z
const rotX = (g, a) => g.clone().applyMatrix4(new THREE.Matrix4().makeRotationX(a));
const M = (list) => mergeGeometries(list.map((g) => (g.index ? g.toNonIndexed() : g)));
/** A CLOSED profile ([r, y], counter-clockwise) turned around y — over part of the turn if asked: a thick shell, cut open. */
const loop = (profile, segs = 48, phi0 = 0, phiLen = 2 * PI) => {
  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y));
  pts.push(pts[0].clone());
  return toCreasedNormals(new THREE.LatheGeometry(pts, segs, phi0, phiLen), 40 * DEG);
};
const ring = (r0, r1, y0, y1, segs = 48) => loop([[r0, y0], [r1, y0], [r1, y1], [r0, y1]], segs);
/** Half of such a shell laid along x (profile [r, x]): phi0 0 the LOWER half, π the upper one, π/2 the rear one (z ≤ 0). */
const halfX = (profile, phi0 = 0, segs = 40) => placed(loop(profile, segs, phi0, PI), { rotZ: -PI / 2 });
/** A ribbon bent around the x axis at radius R, from angle a0 to a1 (from +y toward +z), ending in an arrow head at a1. */
function arcArrow(R, w, a0, a1, head = 0.55) {
  const pos = [];
  const idx = [];
  const n = 28;
  const m = 8;
  const ah = a1 - Math.sign(a1 - a0) * head;
  const P = (a, x) => pos.push(x, R * Math.cos(a), R * Math.sin(a));
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((ah - a0) * i) / n;
    P(a, -w / 2);
    P(a, w / 2);
  }
  for (let i = 0; i <= m; i++) {
    const a = ah + ((a1 - ah) * i) / m;
    const hw = w * (1 - i / m);
    P(a, -hw);
    P(a, hw);
  }
  for (let i = 0; i < n + m + 1; i++) {
    if (i === n) continue; // the body's last slice and the head's first one are not joined
    const k = 2 * i;
    idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}
/** What the voice names, lit: a soft veille on the solids, veille edges. Only re-written when it changes. */
function lampOf(...parts) {
  const solids = [];
  const lines = [];
  for (const p of parts)
    for (const m of p.userData.part.mats) {
      if (m.isLineMaterial) {
        m.userData.rest = m.color.clone();
        lines.push(m);
      } else if (m.isMeshStandardMaterial) solids.push(m);
    }
  let k = -1;
  return (v) => {
    if (v === k) return;
    k = v;
    for (const m of solids) m.emissive.copy(VEILLE).multiplyScalar(0.16 * v);
    for (const l of lines) l.color.copy(l.userData.rest).lerp(VEILLE, 0.85 * v);
  };
}

/* ───────────────────────────── light helpers ───────────────────────────── */
let GLOW_TEX = null;
function glowTex() {
  if (GLOW_TEX) return GLOW_TEX;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.12, "rgba(255,255,255,0.62)");
  gr.addColorStop(0.35, "rgba(255,255,255,0.16)");
  gr.addColorStop(0.7, "rgba(255,255,255,0.03)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  GLOW_TEX = new THREE.CanvasTexture(c);
  GLOW_TEX.colorSpace = THREE.SRGBColorSpace;
  return GLOW_TEX;
}
/** A light that has a place: a bright core, a long tail. Off until `setFlare`. */
function flare(color, size) {
  const m = new THREE.SpriteMaterial({ map: glowTex(), color: 0x000000, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
  m.userData.hue = new THREE.Color(color);
  const s = new THREE.Sprite(m);
  s.scale.setScalar(size);
  s.visible = false;
  s.renderOrder = 6;
  return s;
}
const setFlare = (s, k, size) => {
  s.visible = k > 0.004;
  s.material.color.copy(s.material.userData.hue).multiplyScalar(k);
  if (size) s.scale.setScalar(size);
};

/* ───────────────────────────── drawn faces (canvas): painted again once the page's font is there ───────────────────────────── */
const FONT = "'Barlow Condensed', sans-serif";
const painters = [];
function canvasTex(w, h, paint) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const run = () => {
    const g = c.getContext("2d");
    g.clearRect(0, 0, w, h);
    paint(g, w, h);
    tex.needsUpdate = true;
  };
  run();
  painters.push(run);
  return tex;
}
const textTex = (text, w, h, size, color = "#ffffff") =>
  canvasTex(w, h, (g) => {
    g.fillStyle = color;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 ${size}px ${FONT}`;
    g.fillText(text, w / 2, h / 2 + size * 0.04);
  });
/** A radial tick on a round face: `a` radians clockwise from the top, between radii r0 and r1 (px). */
const tick = (g, c, a, r0, r1, width) => {
  g.lineWidth = width;
  g.beginPath();
  g.moveTo(c + r0 * Math.sin(a), c - r0 * Math.cos(a));
  g.lineTo(c + r1 * Math.sin(a), c - r1 * Math.cos(a));
  g.stroke();
};
/** A flat face that carries a drawing, unlit (a luminous instrument) — or lit, with a floor of its own light (paper, a pale dial). */
const drawn = (tex, lit = false) => {
  if (!lit) {
    const m = glow(0xffffff, 1);
    m.map = tex;
    return m;
  }
  const m = solid(0xffffff, { rough: 0.95 });
  m.map = tex;
  m.emissive.set(0xffffff);
  m.emissiveMap = tex;
  m.emissiveIntensity = 0.24;
  m.userData.finish = false;
  return m;
};
const overlay = (tex, color, k) => {
  const m = fader(glow(color, k, { double: true }));
  m.map = tex;
  return m;
};

/* ═════════════════════════════ 1 · the turbo-alternators ═════════════════════════════ */
// Local frame of one machine: the shaft along x at y = 0 (the bench is at y = −ROTOR.axisY). The generator on −x
// (stator in two half shells, the steel rotor inside), the turbine on +x (five bladed wheels in an open lower casing),
// and at the −x end the flange and its strobe MARK.
const SX = ROTOR.stator.x;
const WHEELS = [[53, 19.5], [65, 23.5], [78, 28], [92, 33], [107, 38.5]]; // [x, tip radius]
const BLADES = 10; // 36° apart: at 4.8° a frame a blade moves 1/7.5 of its pitch

function alternatorGeo() {
  const sx = (g) => at(g, SX, 0, 0);
  const up = (g) => rotX(g, PI);
  /* the stator: a ribbed casing with its end shields, the core, the end windings — each cut in two along the shaft */
  const casingLow = halfX([[8, -55], [34, -55], [34, -38], [36, -38], [36, -34], [34, -34], [34, -2], [36, -2], [36, 2], [34, 2], [34, 34], [36, 34], [36, 38], [34, 38], [34, 55], [8, 55], [8, 52], [31, 52], [31, -52], [8, -52]]);
  const railsLow = M([
    at(box(110, 2, 8, 0.3, 1), 0, -1, 35), at(box(110, 2, 8, 0.3, 1), 0, -1, -35),
    at(box(3, 0.4, 23, 0.05, 1), 53.5, -0.2, 19.5), at(box(3, 0.4, 23, 0.05, 1), 53.5, -0.2, -19.5),
    at(box(3, 0.4, 23, 0.05, 1), -53.5, -0.2, 19.5), at(box(3, 0.4, 23, 0.05, 1), -53.5, -0.2, -19.5),
  ]);
  const coreLow = halfX([[18.5, -42], [30.9, -42], [30.9, 42], [18.5, 42]]);
  const windLow = M([halfX([[19.5, -51], [26, -51], [29.5, -42], [19.5, -42]]), halfX([[19.5, 42], [29.5, 42], [26, 51], [19.5, 51]])]);
  const cut = M([at(box(84, 0.3, 12.2, 0.05, 1), 0, -0.15, 24.7), at(box(84, 0.3, 12.2, 0.05, 1), 0, -0.15, -24.7)]); // the core's cut faces: laminations
  const bolts = [];
  for (let k = 0; k < 6; k++) for (const s of [-1, 1]) bolts.push(at(cyl(1.4, 1.4, 0.25, 12), -45 + 18 * k, 2.7, 36 * s));
  const lugs = [at(box(3, 7, 9, 0.8, 2), -30, 37, 0), at(box(3, 7, 9, 0.8, 2), 30, 37, 0)];
  const feet = [];
  for (const x of [-37, 37]) for (const s of [-1, 1]) feet.push(at(box(10, 23, 10, 0.5, 1), x, -36.5, 22 * s));
  const stator = {
    castLow: sx(M([casingLow, railsLow, ax(cyl(11, 4, 0.5, 40), -57), ax(cyl(11, 4, 0.5, 40), 57), ...feet])),
    coreLow: sx(coreLow),
    windLow: sx(windLow),
    cut: sx(cut),
    castUp: sx(M([up(casingLow), up(railsLow), ...bolts, ...lugs])),
    coreUp: sx(up(coreLow)),
    windUp: sx(up(windLow)),
  };
  /* what turns on the generator's side: the shaft, the rotor (two pole faces, six broad slots), half the coupling, the flange */
  const grooves = [50, 90, 130, -50, -90, -130].map((a) => rotX(at(box(70, 0.7, 3.6, 0.1, 1), SX, 14.8, 0), a * DEG));
  const spinA = {
    pale: M([ax(cyl(15, 78, 0.5, 56), SX), ax(cyl(16.5, 9, 0.5, 56), SX - 43.5), ax(cyl(16.5, 9, 0.5, 56), SX + 43.5)]),
    steel: M([ax(cyl(6, 133.5, 0.3, 32), -52.25), ax(cyl(12, 3, 0.4, 40), 16), ax(cyl(ROTOR.flange.r, 6, 0.6, 64), ROTOR.flange.x), ax(cyl(8, 2, 0.3, 32), ROTOR.flange.x - 4)]),
    grooves: M(grooves),
    mark: M([at(box(0.8, 17, 5.8, 0.1, 1), ROTOR.flange.x - 3.5, 12.5, 0), at(box(6.8, 0.8, 5.8, 0.1, 1), ROTOR.flange.x, ROTOR.flange.r + 0.3, 0)]),
  };
  /* what turns on the turbine's side: the drum, five wheels of blades under their shrouds */
  const rims = [ax(cyl(6, 107.5, 0.3, 32), 74.25), ax(cyl(12, 3, 0.4, 40), 19), ax(cyl(9, 65, 0.3, 48, 13), 80)];
  const blades = [];
  WHEELS.forEach(([x, r], w) => {
    const rh = 9 + ((x - 47.5) * 4) / 65;
    rims.push(ax(cyl(rh + 1.6, 2.6, 0.3, 40), x), ax(ring(r - 1, r, -1.9, 1.9), x));
    const blade = placed(box(4.8, r - 1.2 - rh, 1.5, 0.3, 1), { pos: [x, (r - 1.2 + rh) / 2 + 0.2, 0], rotY: 0.56 });
    for (let k = 0; k < BLADES; k++) blades.push(rotX(blade, ((k + w * 0.37) * 2 * PI) / BLADES));
  });
  const spinT = { steel: M(rims), blades: M(blades) };
  /* the turbine's lower casing, its joint, its bearings */
  const turbine = M([
    halfX([[8, 44], [24.3, 44], [43.5, 116], [8, 116], [8, 113.5], [40.9, 113.5], [22, 46.5], [8, 46.5]]),
    placed(box(75, 2, 7, 0.3, 1), { pos: [80, -1, 34.6], rotY: -14.8 * DEG }), placed(box(75, 2, 7, 0.3, 1), { pos: [80, -1, -34.6], rotY: 14.8 * DEG }),
    at(box(2.5, 0.4, 14, 0.05, 1), 45.2, -0.2, 15.5), at(box(2.5, 0.4, 14, 0.05, 1), 45.2, -0.2, -15.5),
    at(box(2.5, 0.4, 32, 0.05, 1), 114.8, -0.2, 24.5), at(box(2.5, 0.4, 32, 0.05, 1), 114.8, -0.2, -24.5),
    ax(cyl(10, 6, 0.5, 40), 41), at(box(8, 40, 20, 0.6, 1), 123, -28, 0), ax(cyl(10, 8, 0.6, 40), 123),
    at(box(10, 30, 10, 0.5, 1), 56, -33, 20), at(box(10, 30, 10, 0.5, 1), 56, -33, -20), at(box(10, 15, 10, 0.5, 1), 104, -40.5, 22), at(box(10, 15, 10, 0.5, 1), 104, -40.5, -22),
  ]);
  /* the admission valve (`gov`): a riser into the casing, the valve, its yoke and actuator, the steam pipe behind */
  const valve = M([
    at(cyl(4, 56, 0.3, 28), 52, 8, -34), az(cyl(4, 12, 0.3, 28), 52, -16, -28), at(cyl(6.5, 12, 0.6, 32), 52, 42, -34), at(cyl(4.5, 4, 0.4, 28), 52, 50, -34),
    at(cyl(0.8, 16, 0.1, 10), 48, 60, -34), at(cyl(0.8, 16, 0.1, 10), 56, 60, -34), at(cyl(6, 9, 0.6, 32), 52, 72.5, -34),
    az(cyl(4, 14, 0.3, 28), 52, 42, -46), at(cyl(4, 90, 0.3, 28), 52, -3, -53),
  ]);
  return {
    stator, spinA, spinT, turbine, valve,
    bed: at(box(246, 12, 66, 1, 2), 10, -54, 0),
    stem: at(cyl(1, 18, 0.1, 10), 52, 59, -34),
    collar: cyl(2.6, 2.6, 0.3, 20),
    post: (s) => M([at(box(3, 89, 3, 0.4, 1), ROTOR.flange.x, -15.5, 27 * s), at(box(3, 3, 29, 0.4, 1), ROTOR.flange.x, 28, 14 * s)]),
    tip: placed(new THREE.ConeGeometry(2, 5.4, 4), { pos: [ROTOR.flange.x, 25.6, 0], rotX: PI }),
    drive: arcArrow(22, 8, -110 * DEG, 70 * DEG), // wider than the coupling: seen from the side
    brake: arcArrow(28, 8, 125 * DEG, -60 * DEG), // wider than the flange (r 22): seen around it from the −x end
    strip: box(210, 2, 0.6, 0.2, 1),
  };
}

function makeAlternator(GEO, hero, side) {
  const g = new THREE.Group();
  const m = {
    cast: mat(G.cast, { double: true }),
    core: mat(G.panel, { double: true, rough: 0.7 }),
    wind: mat(G.steel, { double: true, rough: 0.55 }),
    lam: mat(G.pale, { rough: 0.7, metal: 0.2 }),
    rotor: mat(G.pale, { rough: 0.42, metal: 0.45 }),
    shaft: mat(G.steel, { rough: 0.42, metal: 0.45 }),
    groove: mat(G.cast, { rough: 0.7 }),
    tcast: mat(G.cast, { double: true }),
    wheel: mat(G.steel, { rough: 0.45, metal: 0.45 }),
    blade: mat(G.pale, { rough: 0.4, metal: 0.45 }),
    bed: mat(0x2f3539, { rough: 0.75, metal: 0.2 }),
  };
  const bed = makePart("bed");
  const low = makePart("statorLow");
  const up = makePart("statorUp");
  const rotor = makePart("rotor");
  const turb = makePart("turbine");
  const wheels = makePart("wheels");
  const spinA = new THREE.Group();
  const spinT = new THREE.Group();
  const slide = new THREE.Group(); // « la turbine recule »
  spinA.add(rotor);
  spinT.add(wheels);
  slide.add(turb, spinT);
  g.add(bed, low, up, spinA, slide);

  addMesh(bed, GEO.bed, m.bed, { edgeOpacity: 0.5 });
  addMesh(bed, GEO.post(side), m.bed, { edgeOpacity: 0.5 });
  addMesh(bed, GEO.tip, glow(BRAND.ink, 1.1), { edges: false });
  addMesh(low, GEO.stator.castLow, m.cast, { edgeOpacity: 0.6 });
  addMesh(low, GEO.stator.coreLow, m.core, { edgeOpacity: 0.4 });
  addMesh(low, GEO.stator.windLow, m.wind, { edgeOpacity: 0.4 });
  addMesh(low, GEO.stator.cut, m.lam, { edges: false });
  addMesh(up, GEO.stator.castUp, m.cast, { edgeOpacity: 0.6 });
  addMesh(up, GEO.stator.coreUp, m.core, { edgeOpacity: 0.4 });
  addMesh(up, GEO.stator.windUp, m.wind, { edgeOpacity: 0.4 });
  addMesh(rotor, GEO.spinA.pale, m.rotor, { edgeOpacity: 0.5 });
  addMesh(rotor, GEO.spinA.steel, m.shaft, { edgeOpacity: 0.55 });
  addMesh(rotor, GEO.spinA.grooves, m.groove, { edges: false }); // nothing fine that turns: no edge line on what spins off-axis
  const markMat = glow(BRAND.veille, 2.3);
  addMesh(rotor, GEO.spinA.mark, markMat, { edges: false });
  addMesh(turb, GEO.turbine, m.tcast, { edgeOpacity: 0.6 });
  addMesh(wheels, GEO.spinT.steel, m.wheel, { edgeOpacity: 0.55 });
  addMesh(wheels, GEO.spinT.blades, m.blade, { edges: false });

  const out = { g, up, slide, spinA, spinT, low, rotor, turb, wheels, A: anchor(g, ROTOR.flange.x - 4, 0, 0) };
  if (!hero) return out;

  /* the West's machine only: the valve, the two arrows around the shaft, the three layers of reserve on the bed */
  const valveMat = mat(G.panel);
  addMesh(turb, GEO.valve, valveMat, { edgeOpacity: 0.55 });
  addMesh(turb, GEO.stem, m.shaft, { edges: false });
  out.govMat = glow(BRAND.veille, 0.3);
  out.gov = new THREE.Mesh(GEO.collar, out.govMat);
  out.gov.position.set(52, 54, -34);
  turb.add(out.gov);
  out.driveMat = fader(glow(BRAND.veille, 1.7, { double: true }));
  out.drive = new THREE.Mesh(GEO.drive, out.driveMat);
  out.drive.position.x = 31;
  slide.add(out.drive);
  out.brakeMat = fader(glow(BRAND.signal, 1.8, { double: true }));
  out.brake = new THREE.Mesh(GEO.brake, out.brakeMat);
  out.brake.position.x = -109.5;
  g.add(out.brake);
  out.res = [-57.4, -54, -50.6].map((y) => {
    const rm = glow(BRAND.veille, 0.05);
    const strip = new THREE.Mesh(GEO.strip, rm);
    strip.position.set(10, y, 33.4);
    g.add(strip);
    return rm;
  });
  out.named = [lampOf(turb, wheels), lampOf(rotor), lampOf(low, up)];
  out.A_turbine = anchor(slide, ROTOR.turbine.x, 0, 0);
  out.A_rotor = anchor(g, SX, 0, 0);
  out.A_stator = anchor(up, SX, ROTOR.stator.r, 0);
  return out;
}

/* ═════════════════════════════ 2 · the frequency dial ═════════════════════════════ */
function buildDial() {
  const group = new THREE.Group();
  const part = makePart("dial");
  group.add(part);
  const R = DIAL.r;
  const RF = R * 0.9;
  const CY = R + 8;
  addMesh(part, M([az(cyl(R, 11, 0.8, 64), 0, CY, -5.5), az(cyl(6, 4, 0.4, 28), 0, CY, -12.5)]), mat(G.cast), { edgeOpacity: 0.6 });
  addMesh(part, az(ring(RF, R + 1.5, 0, 2.4, 72), 0, CY, 0), mat(G.pit, { rough: 0.45, metal: 0.4 }), { edgeOpacity: 0.7 });
  addMesh(part, M([at(box(36, 4, 22, 0.6, 2), 0, 2, -5), at(box(14, 9, 12, 0.6, 2), 0, 7.5, -5.5)]), mat(G.panel), { edgeOpacity: 0.6 });

  /* the face: a pale matt centre (the needles read on it, in front of the lit map too), a dark scale ring with light ticks */
  const faceTex = canvasTex(1024, 1024, (g, w) => {
    const c = w / 2;
    g.fillStyle = "#191d20";
    g.fillRect(0, 0, w, w);
    g.beginPath();
    g.arc(c, c, c * 0.745, 0, 2 * PI);
    g.fillStyle = "#d2ccbd";
    g.fill();
    g.strokeStyle = "#e9e4d8";
    for (let i = 0; i <= 50; i++) {
      if (i === 30) continue; // 50 Hz: its figure stands there
      const major = i % 10 === 0;
      const mid = i % 5 === 0;
      tick(g, c, dialAngle(DIAL.from + i * 0.1) * DEG, c * (0.975 - (major ? 0.2 : mid ? 0.13 : 0.07)), c * 0.975, major ? 11 : mid ? 7 : 4);
    }
    g.fillStyle = "#e9e4d8";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 118px ${FONT}`;
    g.fillText("50", c, c - c * 0.868);
    g.strokeStyle = "rgba(22,25,28,0.45)";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(c, c, c * 0.7, 0, 2 * PI);
    g.stroke();
  });
  const marksTex = canvasTex(1024, 1024, (g, w) => {
    const c = w / 2;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 82px ${FONT}`;
    [[FREQ.pumps, "49,5"], [FREQ.steps[0], "49"], [FREQ.steps[1], "48,5"], [FREQ.steps[2], "48"], [FREQ.steps[3], "47,5"]].forEach(([hz, label], i) => {
      const a = dialAngle(hz) * DEG;
      const last = i === 4;
      g.strokeStyle = last ? "#ff5b2e" : "#e9e4d8";
      tick(g, c, a, c * 0.765, c * 0.985, 17);
      g.fillStyle = last ? "#d8431b" : "#16191c";
      g.fillText(label, c + c * 0.535 * Math.sin(a), c - c * 0.535 * Math.cos(a));
    });
  });
  addMesh(part, new THREE.CircleGeometry(RF, 72), drawn(faceTex, true), { pos: [0, CY, 0.35], edges: false });
  const marksMat = overlay(marksTex, 0xffffff, 1);
  const marks = new THREE.Mesh(new THREE.CircleGeometry(RF, 72), marksMat);
  marks.position.set(0, CY, 0.5);
  marks.renderOrder = 3;
  /* the normal band, ± 0.18 Hz: a veille arc on the bezel and one on the scale's inner rim, either side of « 50 » */
  const half = (FREQ.band / (DIAL.to - DIAL.from)) * DIAL.sweep * DEG;
  const bandMat = fader(glow(BRAND.veille, 1.5, { double: true }));
  const band = new THREE.Group();
  const arcOut = new THREE.Mesh(new THREE.RingGeometry(RF + 0.5, R + 1.2, 24, 1, PI / 2 - half, 2 * half), bandMat);
  arcOut.position.z = 2.5;
  const arcIn = new THREE.Mesh(new THREE.RingGeometry(RF * 0.755, RF * 0.8, 24, 1, PI / 2 - half, 2 * half), bandMat);
  arcIn.position.z = 0.55;
  band.add(arcOut, arcIn);
  band.position.set(0, CY, 0);
  band.renderOrder = 3;
  group.add(marks, band);

  /* three needles on one hub: the West's (broad, long), the North-East's, the South-East's (finer, shorter) */
  const needles = [[1.25, 0.72, 0.9], [0.8, 0.66, 1.5], [0.8, 0.6, 2.1]].map(([w, len, z]) => {
    const L = RF * len;
    const nm = glow(0x14171a, 1);
    const pivot = new THREE.Group();
    pivot.position.set(0, CY, z);
    const mesh = addMesh(part, plate([[-w, -4.5], [w, -4.5], [w * 0.3, L], [-w * 0.3, L]], 0.5, { bevel: 0.08 }), nm, { edges: false });
    pivot.add(mesh);
    part.add(pivot);
    return { pivot, mat: nm };
  });
  addMesh(part, az(cyl(2.8, 2.6, 0.5, 28), 0, CY, 1.9), mat(G.pit, { rough: 0.45, metal: 0.4 }), { edgeOpacity: 0.6 });
  return { group, part, needles, marks, marksMat, band, bandMat, A: { needle: anchor(group, 0, CY + R * 0.6, 3), face: anchor(group, 0, CY, 3) } };
}

/* ═════════════════════════════ 3 · Landesbergen–Wehrendorf ═════════════════════════════ */
const ampAngle = (a) => ((Math.min(LW.amps.scale, Math.max(0, a)) / LW.amps.scale) * 240 - 120) * DEG;
const BRK_X = -104; // Wehrendorf's breaker, in the line, where the camera sees it beside the relay

/** The conductor's light: ink or signal, dashes that run toward the west, dead around the breaker out to `uDead` cm. */
function lineLight() {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(BRAND.ink) }, uK: { value: 1.6 }, uDead: { value: -12 }, uX0: { value: BRK_X }, uT: { value: 0 } },
    vertexShader: /* glsl */ `
      varying float vX; varying vec3 vN; varying vec3 vV;
      void main() {
        vX = position.x;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uDead, uX0, uT; varying float vX; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        float live = smoothstep(uDead - 10.0, uDead + 10.0, abs(vX - uX0));
        float d = fract((vX + uT) / 18.0);
        float dash = smoothstep(0.0, 0.25, d) * (1.0 - smoothstep(0.5, 0.75, d));
        vec3 lit = uColor * uK * (0.55 + 0.45 * f) * (0.62 + 0.38 * dash);
        gl_FragColor = vec4(mix(vec3(0.05, 0.055, 0.06) * (0.35 + 0.65 * f), lit, live), 1.0);
      }`,
  });
}

function buildLw() {
  const group = new THREE.Group();
  const Y = LW.y;
  const H = LW.half;
  const A = {};
  /* the supports: a gantry at each end, two portal frames in between, their insulator strings */
  const frame = (x, hz, top) => {
    const list = [at(box(3, top, 3, 0.4, 1), x, top / 2, hz), at(box(3, top, 3, 0.4, 1), x, top / 2, -hz), at(box(4, 3.4, 2 * hz + 6, 0.5, 1), x, top - 1.7, 0), at(cyl(1, top - 3.4 - Y - 1, 0.1, 10), x, (top - 3.4 + Y + 1) / 2, 0)];
    for (let k = 0; k < 3; k++) list.push(at(cyl(2.7, 1.3, 0.4, 20, 1.6), x, Y + 2.4 + k * 3, 0));
    return list;
  };
  const supports = makePart("supports");
  addMesh(supports, M([...frame(-H, 14, 84), ...frame(H, 14, 84), ...frame(-20, 10, 76), ...frame(70, 10, 76)]), mat(G.panel), { edgeOpacity: 0.55 });
  group.add(supports);

  /* the conductor: one light, in two lengths either side of Wehrendorf's breaker; at Landesbergen it climbs to the upper busbar */
  const span = (pts, x0, x1, y0, y1, sag, n = 10) => {
    for (let i = pts.length ? 1 : 0; i <= n; i++) {
      const u = i / n;
      pts.push(new THREE.Vector3(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u - sag * 4 * u * (1 - u), 0));
    }
    return pts;
  };
  const lineMat = lineLight();
  const west = span(span([], -H - 16, -H, Y, Y, 0, 2), -H, BRK_X - 13, Y, Y, 2);
  const east = span(span(span(span([], BRK_X + 21, -20, Y, Y, 4), -20, 70, Y, Y, 6), 70, H, Y, Y, 6), H, LW.bars.x, Y, Y + LW.bars.gap / 2, 1.5, 6);
  for (const pts of [west, east]) group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 3, 1.15, 10, false), lineMat));
  const cts = makePart("cts"); // the current transformers the two relays read: a ring around the conductor at each end
  const torus = new THREE.TorusGeometry(4.2, 1.5, 12, 32).rotateY(PI / 2);
  addMesh(cts, M([at(torus, -146, Y - 1.8, 0), at(torus, 146, Y - 3.2, 0)]), mat(G.pale, { rough: 0.5 }), { edges: false });
  group.add(cts);

  /* the two relays: the same cabinet, the same ammeter — and a red zone that does not start at the same place */
  const ampTex = (alarm) =>
    canvasTex(512, 512, (g, w) => {
      const c = w / 2;
      g.fillStyle = "#14171a";
      g.fillRect(0, 0, w, w);
      g.strokeStyle = "#e9e4d8";
      for (let i = 0; i <= 16; i++) tick(g, c, ampAngle(i * 200), c * (i % 5 === 0 ? 0.74 : 0.85), c * 0.95, i % 5 === 0 ? 10 : 5);
      g.lineWidth = 4;
      g.beginPath();
      g.arc(c, c, c * 0.95, -PI / 2 - 120 * DEG, -PI / 2 + 120 * DEG);
      g.stroke();
      if (alarm) {
        const a = ampAngle(LW.amps.alarm);
        tick(g, c, a, c * 0.56, c * 0.72, 7);
        g.fillStyle = "#e9e4d8";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = `700 46px ${FONT}`;
        g.fillText("1 795", c + c * 0.4 * Math.sin(a) + 14, c - c * 0.4 * Math.cos(a));
      }
    });
  const cabinet = (x, trip, figure, alarm) => {
    const part = makePart("relay");
    const RD = LW.dialR;
    const RF = RD * 0.88;
    const zf = 55; // the cabinet's front
    addMesh(part, M([at(box(44, 78, 30, 0.8, 2), x, 39, 40), az(ring(RF, RD, 0, 2.8, 56), x, 50, zf + 0.6)]), mat(G.cast), { edgeOpacity: 0.6 });
    addMesh(part, at(box(40, 70, 1, 0.4, 1), x, 41, zf + 0.3), mat(G.panel), { edgeOpacity: 0.55 });
    addMesh(part, M([at(box(40, 16, 0.6, 0.2, 1), x, 17, zf + 0.8), at(box(9.4, 4.6, 0.6, 0.2, 1), x - 10, 72, zf + 0.8), az(cyl(RF + 0.2, 0.8, 0.1, 48), x, 50, zf + 1)]), mat(G.pit, { rough: 0.8 }), { edges: false });
    const face = new THREE.Mesh(new THREE.CircleGeometry(RF, 56), drawn(ampTex(alarm)));
    face.position.set(x, 50, zf + 1.5);
    /* the red zone: from the relay's threshold to the end of the scale (dim until its figure is told) */
    const a0 = ampAngle(trip);
    const zoneMat = glow(BRAND.signal, 0.5, { double: true });
    const zone = new THREE.Mesh(new THREE.RingGeometry(RF * 0.56, RF * 0.72, 40, 1, PI / 2 - 120 * DEG, 120 * DEG - a0), zoneMat);
    zone.position.set(x, 50, zf + 1.6);
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.5, RF * 0.3), zoneMat);
    edge.position.set(x + RF * 0.71 * Math.sin(a0), 50 + RF * 0.71 * Math.cos(a0), zf + 1.65);
    edge.rotation.z = -a0;
    const needle = new THREE.Group();
    needle.position.set(x, 50, zf + 2);
    const nm = glow(BRAND.ink, 1.25);
    needle.add(new THREE.Mesh(plate([[-0.75, -2.6], [0.75, -2.6], [0.22, RF * 0.9], [-0.22, RF * 0.9]], 0.4, { bevel: 0.06 }), nm));
    const hub = new THREE.Mesh(az(cyl(1.8, 1.4, 0.3, 24), x, 50, zf + 2.3), mat(G.pit, { rough: 0.5 }));
    /* the threshold's figure under the dial, the trip flag and the service lamp over it */
    const figMat = overlay(textTex(figure, 512, 192, 172), BRAND.signal, 2);
    const fig = new THREE.Mesh(new THREE.PlaneGeometry(38, 14.2), figMat);
    fig.position.set(x, 17, zf + 1.2);
    const flagMat = glow(BRAND.signal, 0.04);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 3.2), flagMat);
    flag.position.set(x - 10, 72, zf + 1.2);
    const lamp = new THREE.Mesh(az(cyl(1.7, 1.2, 0.3, 20), x + 12, 72, zf + 0.9), glow(BRAND.ink, 0.9));
    group.add(part, face, zone, edge, needle, hub, fig, flag, lamp);
    return { part, needle, zoneMat, fig, figMat, flagMat, named: lampOf(part) };
  };
  const rwe = cabinet(-H, LW.amps.tripRWE, "2 100", true);
  const eon = cabinet(H, LW.amps.tripEON, "3 000", false);

  /* Wehrendorf's breaker: a base and its mechanism, a support insulator, the chamber cut open toward the camera */
  const brk = makePart("breaker");
  const sheds = [];
  for (let k = 0; k < 5; k++) sheds.push(at(cyl(4.8, 1.5, 0.5, 28, 3.3), BRK_X, 30 + 5 * k, 0));
  const chamber = [[4.2, -9], [5.6, -9]];
  for (const x of [-6, 0, 6]) chamber.push([5.6, x - 0.8], [6.6, x - 0.5], [6.6, x + 0.5], [5.6, x + 0.8]);
  chamber.push([5.6, 9], [4.2, 9]);
  addMesh(brk, M([at(box(20, 26, 16, 0.8, 2), BRK_X, 13, 0), at(box(9, 5, 9, 0.5, 1), BRK_X, 56.3, 0)]), mat(G.cast), { edgeOpacity: 0.6 });
  addMesh(brk, M([at(cyl(2.6, 29, 0.2, 20), BRK_X, 40.5, 0), ...sheds, placed(halfX(chamber, PI / 2, 28), { pos: [BRK_X, Y, 0] })]), mat(G.panel, { double: true, rough: 0.5, metal: 0.1 }), { edgeOpacity: 0.5 });
  addMesh(brk, M([ax(cyl(5.9, 4, 0.5, 32), BRK_X - 11, Y), ax(cyl(4.8, 12, 0.5, 32), BRK_X + 15, Y), ax(cyl(1.9, 9.5, 0.3, 20), BRK_X - 4.25, Y)]), mat(G.pale, { rough: 0.45, metal: 0.45 }), { edgeOpacity: 0.5 });
  const rod = addMesh(brk, ax(cyl(1.5, 12, 0.3, 20), 6.5, 0), mat(G.pale, { rough: 0.45, metal: 0.45 }), { edgeOpacity: 0.5 });
  rod.position.set(BRK_X, Y, 0);
  const tell = new THREE.Mesh(box(6.4, 1.5, 0.5, 0.1, 1), glow(BRAND.ink, 1)); // the mechanism's position: upright closed, lying open
  tell.position.set(BRK_X, 16, 8.3);
  const arc = flare(0xfff1e2, 12);
  arc.position.set(BRK_X + 4, Y, 1);
  const arcHalo = flare(BRAND.signal, 30);
  arcHalo.position.copy(arc.position);
  group.add(brk, tell, arc, arcHalo);

  /* Landesbergen's two busbars, one over the other, and the coupler between them */
  const B = LW.bars;
  const yUp = Y + B.gap / 2;
  const yLow = Y - B.gap / 2;
  const bars = makePart("bars");
  const posts = [];
  for (const s of [-1, 1]) posts.push(at(box(3, 86, 3, 0.4, 1), B.x + 9, 43, 52 * s), ax(cyl(1.8, 6, 0.3, 16), B.x + 5, yUp, 52 * s), ax(cyl(1.8, 6, 0.3, 16), B.x + 5, yLow, 52 * s), at(box(3, 3, 3, 0.4, 1), B.x + 9, 87.5, 52 * s));
  posts.push(at(box(3, 3, 107, 0.4, 1), B.x + 9, 87.5, 0));
  addMesh(bars, M(posts), mat(G.panel), { edgeOpacity: 0.55 });
  const barMat = glow(BRAND.ink, 0.1);
  const stubMat = glow(BRAND.ink, 0.06);
  group.add(bars, new THREE.Mesh(M([az(cyl(2.2, B.len, 0.4, 24), B.x, yUp, 0), az(cyl(2.2, B.len, 0.4, 24), B.x, yLow, 0)]), barMat));
  group.add(new THREE.Mesh(M([ax(cyl(1.3, 24, 0.2, 16), B.x + 14, yLow, -18), ax(cyl(1.3, 24, 0.2, 16), B.x + 14, yLow, 34), ax(cyl(1.3, 24, 0.2, 16), B.x + 14, yUp, 20)]), stubMat));
  const coupler = makePart("coupler");
  const CZ = -(B.len / 2 - 14); // at the bars' far end: the relay's cabinet stands in front of the near one
  addMesh(coupler, M([at(box(7.4, 5.4, 5.4, 0.5, 1), B.x - 1, yLow, CZ), at(box(7.4, 5.4, 5.4, 0.5, 1), B.x - 1, yUp, CZ)]), mat(G.pale, { rough: 0.5 }), { edgeOpacity: 0.55 });
  const blade = new THREE.Group();
  blade.position.set(B.x - 4.4, yLow, CZ);
  const bladeMat = glow(BRAND.ink, 0.5);
  blade.add(new THREE.Mesh(at(box(1.4, B.gap + 1.5, 2.8, 0.3, 1), 0, B.gap / 2, 0), bladeMat));
  group.add(coupler, blade);

  A.relayRwe = anchor(group, -H, 50, 58);
  A.relayEon = anchor(group, H, 50, 58);
  A.dialRwe = anchor(group, -H, 50, 59);
  A.dialEon = anchor(group, H, 50, 59);
  A.breakerRwe = anchor(group, BRK_X + 3, Y, 0);
  A.bars = anchor(group, B.x, Y, 0);
  A.coupler = anchor(group, B.x - 4.4, Y, CZ);
  return { group, A, lineMat, rwe, eon, rod, tell, arc, arcHalo, barMat, stubMat, blade, bladeMat, namedBars: lampOf(bars), namedCoupler: lampOf(coupler) };
}

/* ═════════════════════════════ 4 · THE HERO: the frequency relay and its four steps ═════════════════════════════ */
// Local origin: the foot of the first cell's front-left corner; the row along +x, fronts on z = 0, facing +z.
const TRUCK_IN = -64; // the breaker's truck racked in; `heroOpen` rolls it out to z = 0 (test position)
const LEVER = { y: 30, z: 34, pin: 12, arm: 14, swing: 33.7 * DEG, spring: [58, 48], rest: 28 }; // the opening mechanism, seen in profile
const POLE_Z = 22;

function buildHero() {
  const group = new THREE.Group();
  const CW = HERO.cell.w;
  const CH = HERO.cell.h;
  const CD = HERO.cell.d;
  const bw = CW - 1.2;
  const cx = (i) => CW * (i + 0.5);
  const A = { cells: [] };

  /* the bodies: three closed cabinets, the first one hollow (its breaker rolls out of it); the busbar duct over the row */
  const body = makePart("bodies");
  const shells = [at(box(CW * HERO.n - 0.6, 16, 34, 1, 2), (CW * HERO.n) / 2, CH + 8, -67)];
  for (let i = 0; i < HERO.n; i++) {
    shells.push(at(box(40, 1.2, 30, 0.3, 1), cx(i), CH + 0.6, -24));
    if (!i) continue;
    shells.push(at(box(bw, CH - 5, CD - 2, 0.6, 1), cx(i), 5 + (CH - 5) / 2, -CD / 2 - 1), at(box(bw - 4, 5, CD - 8, 0.2, 1), cx(i), 2.5, -CD / 2));
  }
  shells.push(
    at(box(1.6, CH - 0.6, CD - 2, 0.3, 1), 1.4, CH / 2 + 0.3, -CD / 2 - 1), at(box(1.6, CH - 0.6, CD - 2, 0.3, 1), CW - 1.4, CH / 2 + 0.3, -CD / 2 - 1),
    at(box(bw, CH - 0.6, 1.6, 0.3, 1), cx(0), CH / 2 + 0.3, -CD + 0.8), at(box(bw, 1.6, CD - 2, 0.3, 1), cx(0), CH - 0.8, -CD / 2 - 1),
    at(box(bw, 2, CD - 4, 0.3, 1), cx(0), 113, -CD / 2 - 2), at(box(bw, 17, 1.6, 0.3, 1), cx(0), 120.5, -2.8), at(box(bw - 3, 110, 1.6, 0.3, 1), cx(0), 57, -70),
    at(box(bw, 1.2, CD - 2, 0.2, 1), cx(0), 0.6, -CD / 2 - 1), at(box(2, 1.2, 64, 0.2, 1), 8.5, 1.8, -34), at(box(2, 1.2, 64, 0.2, 1), CW - 8.5, 1.8, -34),
  );
  addMesh(body, M(shells), mat(G.cast, { rough: 0.65 }), { edgeOpacity: 0.55 });
  const spouts = [];
  for (const x of [12, 30, 48]) for (const y of [96, 40]) spouts.push(az(cyl(4.6, 8, 0.6, 28), x, y, -65.5));
  addMesh(body, M(spouts), mat(G.pale, { rough: 0.6, metal: 0.1 }), { edgeOpacity: 0.5 });
  group.add(body);

  /* the fronts, one part per cell (a step is NAMED: its doors take the veille, its lamp lights) */
  const mimic = (x, withBlade) => {
    const list = [at(box(34, 1.6, 0.5, 0.05, 1), x, 96, 0.25), at(box(1.6, 10, 0.5, 0.05, 1), x, 91, 0.25), az(cyl(1.7, 0.6, 0.1, 16), x, 86, 0.3), az(cyl(1.7, 0.6, 0.1, 16), x, 72, 0.3), at(box(1.6, 40, 0.5, 0.05, 1), x, 52, 0.25), at(plate([[-3.4, 0], [3.4, 0], [0, -6]], 0.5, { bevel: 0.05 }), x, 32, 0)];
    if (withBlade) list.push(at(box(1.6, 14, 0.5, 0.05, 1), x, 79, 0.25));
    return M(list);
  };
  const cells = [];
  let door0 = null;
  let blade0 = null;
  let blade0Mat = null;
  for (let i = 0; i < HERO.n; i++) {
    const x = cx(i);
    const part = makePart(`cell${i}`);
    const panel = mat(G.panel, { rough: 0.55 });
    const trim = mat(G.pale, { rough: 0.5 });
    const lv = [at(box(54, 62, 2, 0.5, 2), x, 160, -1), at(box(bw, 6, 2.4, 0.3, 1), x, 196, -1.2)];
    const bits = [at(box(1.6, 8, 2.4, 0.4, 1), x + 23.5, 150, 1.2)];
    if (i) bits.push(az(cyl(2, 2.2, 0.4, 20), x + 10, 171, 1.1), az(cyl(2, 2.2, 0.4, 20), x + 10, 162, 1.1), at(box(14, 3.2, 0.4, 0.1, 1), x - 8, 146, 0.2));
    else bits.push(at(box(14, 3.2, 0.4, 0.1, 1), x, 134.5, 0.2));
    addMesh(part, M(lv), panel, { edgeOpacity: 0.6 });
    addMesh(part, M(bits), trim, { edgeOpacity: 0.5 });
    if (i) addMesh(part, at(box(16, 10, 0.6, 0.2, 1), x - 8, 168, 0.1), mat(G.pit, { rough: 0.8 }), { edges: false });
    /* the breaker compartment's door (the first cell's is its own part: it comes off with `heroOpen`) and its mimic diagram */
    const door = i ? part : makePart("door0");
    addMesh(door, at(box(54, 106, 2, 0.5, 2), x, 59, -1), i ? panel : mat(G.panel, { rough: 0.55 }), { edgeOpacity: 0.6 });
    addMesh(door, at(box(1.6, 14, 2.4, 0.4, 1), x + 23.5, 60, 1.2), i ? trim : mat(G.pale, { rough: 0.5 }), { edgeOpacity: 0.5 });
    addMesh(door, mimic(x, !!i), glow(BRAND.ink, 0.72), { edges: false });
    if (!i) {
      door0 = door;
      blade0Mat = glow(BRAND.ink, 0.72);
      blade0 = new THREE.Group();
      blade0.position.set(x, 72, 0.25);
      const b = addMesh(door, at(box(1.6, 14, 0.5, 0.05, 1), 0, 7, 0), blade0Mat, { edges: false });
      blade0.add(b);
      door.add(blade0);
      group.add(door);
    }
    const lampMat = glow(BRAND.veille, 0.05); // the step's lamp: a bar of light across the cell's head
    const lamp = new THREE.Mesh(box(40, 3.2, 0.8, 0.3, 1), lampMat);
    lamp.position.set(x, 196, 0.5);
    group.add(part, lamp);
    cells.push({ lampMat, named: i ? lampOf(part) : lampOf(part, door) });
    A.cells.push(anchor(group, x, CH * 0.5, 0));
  }

  /* THE RELAY on the first cell: a box, its setting dial (dark, luminous), its lamp, its trip flag; a cover that comes off */
  const RX = cx(0);
  const RY = HERO.relay.at[1];
  const relay = makePart("relay");
  const cover = makePart("cover");
  addMesh(relay, at(box(HERO.relay.w, HERO.relay.h, 11, 0.6, 2), RX, RY, 5.5), mat(G.cast, { rough: 0.5 }), { edgeOpacity: 0.7 });
  addMesh(relay, M([at(box(21.2, 15.2, 0.4, 0.1, 1), RX, RY, 11.1), az(ring(6, 6.8, 0, 0.9, 48), RX - 4.6, RY + 0.3, 11.2), az(ring(1.5, 2.1, 0, 0.9, 24), RX + 7.4, RY + 4.6, 11.2)]), mat(G.panel, { rough: 0.5 }), { edgeOpacity: 0.6 });
  addMesh(relay, M([at(box(5.8, 3.4, 0.5, 0.1, 1), RX + 7.4, RY - 0.6, 11.25), az(cyl(1.15, 1.3, 0.3, 16), RX + 7.4, RY - 5.4, 11.6)]), mat(G.pit, { rough: 0.7 }), { edges: false });
  addMesh(cover, M([at(box(HERO.relay.w, 1.5, 3.2, 0.3, 1), RX, RY + 8.25, 12.4), at(box(HERO.relay.w, 1.5, 3.2, 0.3, 1), RX, RY - 8.25, 12.4), at(box(1.5, 15, 3.2, 0.3, 1), RX - 11.25, RY, 12.4), at(box(1.5, 15, 3.2, 0.3, 1), RX + 11.25, RY, 12.4)]), mat(G.steel, { rough: 0.45, metal: 0.4 }), { edgeOpacity: 0.7 });
  const setA = (hz) => ((hz - 48.5) / 3) * 200 * DEG; // the setting dial: 47 → 50 Hz over 200°
  const setTex = canvasTex(512, 512, (g, w) => {
    const c = w / 2;
    g.fillStyle = "#14171a";
    g.fillRect(0, 0, w, w);
    g.strokeStyle = "#e9e4d8";
    for (let i = 0; i <= 30; i++) tick(g, c, setA(47 + i * 0.1), c * (i % 10 === 0 ? 0.68 : i % 5 === 0 ? 0.76 : 0.83), c * 0.93, i % 10 === 0 ? 12 : i % 5 === 0 ? 8 : 5);
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(6, 48), drawn(setTex));
  face.position.set(RX - 4.6, RY + 0.3, 11.45);
  const figMat = overlay(canvasTex(512, 512, (g, w) => {
    g.fillStyle = "#ffffff";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 200px ${FONT}`;
    g.fillText("49", w / 2, w * 0.74);
  }), BRAND.veille, 1.7);
  const fig = new THREE.Mesh(new THREE.CircleGeometry(6, 48), figMat);
  fig.position.set(RX - 4.6, RY + 0.3, 11.5);
  const precMat = fader(glow(BRAND.signal, 1.3, { double: true })); // the relay's own band, ± 0.15 Hz around its setting
  const precHalf = (FREQ.relayPrecision / 3) * 200 * DEG;
  const prec = new THREE.Mesh(new THREE.RingGeometry(4.1, 5.7, 16, 1, PI / 2 - setA(FREQ.steps[0]) - precHalf, 2 * precHalf), precMat);
  prec.position.set(RX - 4.6, RY + 0.3, 11.55);
  const pointer = new THREE.Group();
  pointer.position.set(RX - 4.6, RY + 0.3, 11.7);
  const pointerMat = glow(BRAND.veille, 0.3);
  pointer.add(new THREE.Mesh(at(box(0.6, 4.4, 0.3, 0.1, 1), 0, 3.3, 0), pointerMat), new THREE.Mesh(az(cyl(1.5, 1, 0.3, 20), 0, 0, 0.3), mat(G.pit, { rough: 0.5 })));
  const pilotMat = glow(BRAND.veille, 0.2);
  const pilot = new THREE.Mesh(az(cyl(1.5, 1, 0.4, 24), RX + 7.4, RY + 4.6, 11.6), pilotMat);
  const pilotHalo = flare(BRAND.veille, 9);
  pilotHalo.position.set(RX + 7.4, RY + 4.6, 12.8);
  const flagMat = glow(BRAND.veille, 0.03);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.4), flagMat);
  flag.position.set(RX + 7.4, RY - 0.6, 11.55);
  group.add(relay, cover, face, fig, prec, pointer, pilot, pilotHalo, flag);

  /* the ten feeders of the first step, as ten flags on a rail under the relay: eight drop, two stay */
  const rail = makePart("rail");
  addMesh(rail, at(box(52, 1.2, 2, 0.2, 1), RX, 113.6, -1), mat(G.steel, { rough: 0.5 }), { edgeOpacity: 0.5 });
  group.add(rail);
  const stayMat = glow(BRAND.ink, 0.3);
  const dropMat = glow(BRAND.ink, 0.3);
  const flagGeo = at(box(3.6, 8.6, 0.5, 0.15, 1), 0, 4.5, 0);
  const flags = [];
  let fallen = 0;
  for (let j = 0; j < HERO.feeders; j++) {
    const stay = j === 3 || j === 8;
    const f = new THREE.Mesh(flagGeo, stay ? stayMat : dropMat);
    f.position.set(RX + (j - (HERO.feeders - 1) / 2) * 5, 114.3, 0.4);
    group.add(f);
    flags.push({ mesh: f, order: stay ? -1 : fallen++ });
  }

  /* the first cell's breaker on its truck: three poles (the near one cut open on its contacts), and on its flank the
     opening mechanism — a lever, its spring, its latch — where the film's gesture is seen in profile */
  const truck = new THREE.Group();
  const tp = makePart("truck");
  truck.add(tp);
  const poleProfile = [[0, 14], [6.8, 14], [6.8, 18], [5.6, 18], [5.6, 98], [6.4, 98], [6.4, 104], [0, 104]];
  const wheelsG = [];
  for (const x of [7.5, 52.5]) for (const z of [10, 50]) wheelsG.push(ax(cyl(3.5, 2.4, 0.4, 24), x, 3.5, z));
  addMesh(tp, M([at(box(48, 4, 56, 0.5, 1), 30, 9, 30), at(box(44, 60, 20, 0.8, 2), 30, 41, 48), ...wheelsG, az(cyl(2.6, 7, 0.4, 20), 5.2, 19, 56)]), mat(G.panel, { rough: 0.6 }), { edgeOpacity: 0.6 });
  addMesh(tp, at(box(1, 52, 36, 0.2, 1), 7.4, 38, 42), mat(G.cast, { rough: 0.6 }), { edgeOpacity: 0.6 }); // dark behind the pale lever and its spring
  const epoxy = mat(0xa3a59f, { rough: 0.5, metal: 0.05, double: true });
  addMesh(tp, M([at(lathe(poleProfile, 40, { bevel: 0.3 }), 30, 0, POLE_Z), at(lathe(poleProfile, 40, { bevel: 0.3 }), 48, 0, POLE_Z), at(loop([[4.4, 14], [6.8, 14], [6.8, 18], [5.6, 18], [5.6, 98], [6.4, 98], [6.4, 104], [0.01, 104], [0.01, 100.5], [4.4, 100.5]], 28, 0, PI), 12, 0, POLE_Z)]), epoxy, { edgeOpacity: 0.5 });
  const arms = [ax(cyl(1.1, 30, 0.2, 14), 30, 20, 61), az(cyl(0.9, 3, 0.1, 10), 16, 20, 59.5), az(cyl(0.9, 3, 0.1, 10), 44, 20, 59.5), az(cyl(1.7, 1.4, 0.3, 16), 20, 56, 58.6), ax(cyl(1.4, 4, 0.2, 14), 6, LEVER.y, LEVER.z), ax(cyl(1.1, 4, 0.2, 14), 5.6, LEVER.spring[0], LEVER.spring[1])];
  for (const x of [12, 30, 48]) for (const y of [96, 40]) arms.push(at(box(5, 3.6, 24, 0.6, 1), x, y, 10), az(cyl(3.4, 6, 0.5, 24), x, y, -3));
  addMesh(tp, M(arms), mat(G.steel, { rough: 0.45, metal: 0.45 }), { edgeOpacity: 0.5 });
  addMesh(tp, M([az(cyl(3.4, 0.8, 0.2, 24), 40, 52, 58.4), at(box(8, 3, 0.6, 0.1, 1), 30, 30, 58.2), az(cyl(1.7, 1.4, 0.3, 16), 20, 48, 58.6)]), mat(G.pit, { rough: 0.7 }), { edges: false });
  const contactMat = mat(G.pale, { rough: 0.4, metal: 0.5 });
  addMesh(tp, M([at(cyl(1.2, 16, 0.2, 16), 12, 88, POLE_Z), at(cyl(3.9, 2, 0.4, 28), 12, 79, POLE_Z)]), contactMat, { edgeOpacity: 0.6 });
  const mover = new THREE.Group(); // the moving contact, its stem, the insulating rod, the pin the lever pulls
  const mv = makePart("mover");
  addMesh(mv, M([at(cyl(3.9, 2, 0.4, 28), 12, 77, POLE_Z), at(cyl(1.2, 24, 0.2, 16), 12, 64, POLE_Z), ax(cyl(0.9, 9, 0.1, 12), 9, LEVER.y, POLE_Z), at(box(3, 3.4, 3, 0.4, 1), 12, 30.8, POLE_Z)]), contactMat, { edgeOpacity: 0.6 });
  addMesh(mv, at(cyl(1.9, 20, 0.3, 20), 12, 42, POLE_Z), mat(0x6a6660, { rough: 0.5, metal: 0.05 }), { edgeOpacity: 0.5 });
  mover.add(mv);
  const lever = new THREE.Group();
  lever.position.set(5.2, LEVER.y, LEVER.z);
  const lv = makePart("lever");
  addMesh(lv, M([at(box(1.2, 2.8, 30.5, 0.4, 1), 0, 0, -0.75), ax(cyl(1.1, 2.4, 0.2, 12), -0.4, 0, LEVER.arm)]), mat(G.pale, { rough: 0.4, metal: 0.45 }), { edgeOpacity: 0.7 });
  lever.add(lv);
  const coil = [];
  for (let i = 0; i <= 108; i++) coil.push(new THREE.Vector3(2.6 * Math.cos((i / 12) * 2 * PI), (LEVER.rest * i) / 108, 2.6 * Math.sin((i / 12) * 2 * PI)));
  const spring = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 324, 0.62, 6, false), mat(G.pale, { rough: 0.4, metal: 0.45 }));
  spring.castShadow = true;
  const latch = new THREE.Group();
  latch.position.set(5.2, 21, 51.5);
  const lt = makePart("latch");
  addMesh(lt, at(box(1.2, 10, 2.6, 0.4, 1), 0, 4.2, 0), mat(G.cast, { rough: 0.5 }), { edgeOpacity: 0.7 });
  latch.add(lt);
  const plungerMat = glow(BRAND.veille, 0.05);
  const plunger = new THREE.Mesh(az(cyl(1.2, 2.4, 0.2, 14), 5.2, 19, 51.6), plungerMat);
  const tell = new THREE.Group(); // the truck's front: its position indicator, upright closed, lying open
  tell.position.set(40, 52, 58.9);
  const tellMat = glow(BRAND.ink, 0.9);
  tell.add(new THREE.Mesh(box(1.3, 5, 0.4, 0.1, 1), tellMat));
  const gapFlare = flare(BRAND.veille, 12);
  gapFlare.position.set(10.5, 78, POLE_Z);
  truck.add(mover, lever, spring, latch, plunger, tell, gapFlare);
  truck.position.z = TRUCK_IN;
  group.add(truck);
  /* the cord that carries the relay's order to the truck once it stands outside */
  const cordMat = fader(glow(0x23282b, 1));
  const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[30, 122, -1.5], [30, 112, 9], [30, 92, 30], [30, 78, 43], [30, 71.5, 46]].map((p) => new THREE.Vector3(...p))), 40, 0.9, 8, false), cordMat);
  group.add(cord);

  A.relay = anchor(group, RX, RY, HERO.relay.d);
  A.breaker = anchor(truck, 12, 76, POLE_Z);
  A.flags = anchor(group, RX, 119, 2);
  return { group, A, cells, door0, blade0, blade0Mat, cover, fig, figMat, prec, precMat, pointer, pointerMat, setA, pilotMat, pilotHalo, flagMat, flags, stayMat, dropMat, truck, mover, lever, spring, latch, plungerMat, tell, tellMat, gapFlare, contactMat, cord, cordMat };
}

/* ═════════════════════════════ 5 · the coupling device ═════════════════════════════ */
function buildSync() {
  const group = new THREE.Group();
  const part = makePart("sync");
  group.add(part);
  const X = ROTOR.flange.x;
  const Y = ROTOR.axisY;
  const RF = ROTOR.flange.r;
  const [Z0, Z1] = ROTOR.row;
  const ZM = (Z0 + Z1) / 2;
  addMesh(part, M([at(box(12, 40, 12, 0.5, 1), X, 20, ZM), at(box(18, 6, 28, 0.5, 1), X, 43, ZM), at(box(6, 8, 4, 0.4, 1), X, Y, Z0 - RF - 2.4), at(box(6, 8, 4, 0.4, 1), X, Y, Z1 + RF + 2.4)]), mat(G.cast), { edgeOpacity: 0.6 });
  addMesh(part, M([at(box(8, 22, 5, 0.4, 1), X, 55, ZM - 10), at(box(8, 22, 5, 0.4, 1), X, 55, ZM + 10)]), mat(G.panel), { edgeOpacity: 0.6 });
  const rodMat = mat(G.pale, { rough: 0.4, metal: 0.45 });
  const rods = [-1, 1].map((s) => {
    const rod = addMesh(part, az(cyl(1.6, 9, 0.3, 20), 0, 0, 4.5 * s), rodMat, { edgeOpacity: 0.6 });
    rod.position.set(X, Y, ZM);
    return rod;
  });
  /* the bridge's two arms: dark until it closes, then one veille line from flange to flange */
  const armMat = glow(BRAND.veille, 0.05);
  const span = Math.abs(Z0 - ZM) - RF - 4.4 - 12.5;
  const arms = new THREE.Mesh(M([az(cyl(1.7, span, 0.3, 20), X, Y, ZM + 12.5 + span / 2), az(cyl(1.7, span, 0.3, 20), X, Y, ZM - 12.5 - span / 2)]), armMat);
  /* the window: ± 10° around the West's mark — on the West's flange, and on the North-East's (where its mark must fall) */
  const winMat = fader(glow(BRAND.veille, 1.3, { double: true }));
  const winGeo = new THREE.RingGeometry(RF + 1.6, RF + 6.2, 16, 1, 80 * DEG, 20 * DEG).rotateY(-PI / 2);
  const windows = [Z0, Z1].map((z) => {
    const w = new THREE.Mesh(winGeo, winMat);
    w.position.set(X - 3.4, Y, z);
    w.renderOrder = 3;
    return w;
  });
  /* the 45 seconds: a ring that fills clockwise, veille — signal when the attempt fails */
  const ringMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uFill: { value: 0 }, uFail: { value: 0 }, uAmount: { value: 0 }, uVeille: { value: VEILLE }, uSignal: { value: SIGNAL } },
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uFill, uFail, uAmount; uniform vec3 uVeille, uSignal; varying vec2 vP;
      void main() {
        float a = atan(vP.x, vP.y) / 6.2831853;
        a = a < 0.0 ? a + 1.0 : a;
        float on = 1.0 - smoothstep(uFill - 0.004, uFill + 0.004, a);
        vec3 c = mix(uVeille, uSignal, clamp(uFail, 0.0, 1.0)) * (0.16 + 1.5 * on * step(0.002, uFill));
        gl_FragColor = vec4(c, uAmount);
      }`,
  });
  const dialRing = new THREE.Mesh(new THREE.RingGeometry(9.5, 13.5, 64), ringMat);
  dialRing.rotation.y = -PI / 2;
  dialRing.position.set(X - 7, Y, ZM);
  dialRing.renderOrder = 3;
  const spark = flare(BRAND.signal, 34);
  spark.position.set(X - 2, Y, ZM);
  group.add(arms, ...windows, dialRing, spark);
  return { group, part, rods, rodMat, armMat, windows, winMat, ringMat, spark };
}

/* ═════════════════════════════ 6 · the report ═════════════════════════════ */
function buildReport() {
  const group = new THREE.Group();
  const part = makePart("report");
  group.add(part);
  const W = REPORT.w;
  const H = REPORT.h;
  const tA = 0.36; // the cover and the first pages: the slab that turns over
  const tB = REPORT.thick - tA; // what stays
  const lift = (tB + 0.05 - tA) / 2;
  const ink = "#1c2023";
  const lines = (g, x, y, w, n, step, seed) => {
    g.fillStyle = "rgba(28,32,35,0.42)";
    for (let i = 0; i < n; i++) g.fillRect(x, y + i * step, w * (0.62 + 0.38 * Math.abs(Math.sin(seed + i * 2.7))), 7);
  };
  const paperTex = (paint, bg = "#d4cebf") =>
    canvasTex(512, 724, (g, w, h) => {
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      paint(g, w, h);
    });
  const coverTex = paperTex((g, w, h) => {
    g.fillStyle = ink;
    g.fillRect(0, 0, 26, h); // the binding
    g.fillRect(64, 70, 150, 14);
    g.fillRect(64, 170, 330, 30);
    g.fillRect(64, 216, 270, 30);
    g.fillRect(64, 262, 190, 30);
    g.fillRect(64, 318, 384, 4);
    g.strokeStyle = ink;
    g.lineWidth = 5;
    g.strokeRect(64, 370, 384, 230); // a figure: a frame, a line that cuts it in three
    g.lineWidth = 6;
    g.beginPath();
    [[250, 370], [262, 420], [240, 462], [282, 500], [300, 548], [352, 600]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.moveTo(282, 500);
    g.lineTo(448, 520);
    g.stroke();
    g.fillRect(64, 640, 120, 10);
    g.fillRect(64, 662, 80, 10);
  }, "#c7c1b2");
  const causesTex = paperTex((g, w) => {
    g.fillStyle = ink;
    g.fillRect(50, 52, 210, 16);
    [112, 396].forEach((y, k) => {
      g.strokeStyle = ink;
      g.lineWidth = 5;
      g.strokeRect(50, y, w - 100, 262);
      g.fillStyle = "#d8431b";
      g.fillRect(50, y, 14, 262);
      g.fillStyle = ink;
      g.fillRect(84, y + 26, 190 - k * 40, 20);
      lines(g, 84, y + 70, w - 190, 7, 26, k * 5 + 1);
    });
  });
  const tableTex = paperTex((g, w) => {
    g.fillStyle = ink;
    g.fillRect(50, 52, 170, 16);
    g.strokeStyle = ink;
    g.lineWidth = 5;
    g.strokeRect(50, 112, w - 100, 500);
    g.fillRect(50, 112, w - 100, 54);
    g.fillRect(w / 2 - 2, 112, 4, 500);
    g.fillStyle = "#d4cebf";
    g.fillRect(84, 132, 100, 14);
    g.fillRect(w / 2 + 34, 132, 100, 14);
    for (let i = 1; i < 6; i++) {
      g.fillStyle = "rgba(28,32,35,0.35)";
      g.fillRect(50, 166 + i * 74, w - 100, 3);
      if (i === 3) continue;
      g.fillRect(84, 124 + i * 74 + 28, 90 + ((i * 37) % 50), 9);
      g.fillRect(w / 2 + 34, 124 + i * 74 + 28, 70 + ((i * 53) % 70), 9);
    }
    g.fillStyle = "#d8431b"; // the two settings, side by side: one bar shorter than the other (no figure here: the dials say them)
    g.fillRect(74, 334, 112, 26);
    g.fillStyle = ink;
    g.fillRect(w / 2 + 24, 334, 160, 26);
  });
  const textPage = (seed) =>
    paperTex((g, w) => {
      g.fillStyle = ink;
      g.fillRect(50, 52, 150, 14);
      lines(g, 50, 110, w - 100, 21, 27, seed);
    });
  const paper = solid(G.paper, { rough: 0.95 });
  paper.userData.finish = false;
  const sheet = (tex, up) => {
    const geo = new THREE.PlaneGeometry(W - 0.3, H - 0.3);
    if (up) geo.rotateX(-PI / 2);
    else geo.rotateX(PI / 2).rotateY(PI); // read the right way round once its slab has turned over
    return [geo, drawn(tex, true)];
  };
  addMesh(part, at(box(W, tB, H, 0.04, 1), 0, tB / 2, 0), paper, { edgeOpacity: 0.5 });
  addMesh(part, ...sheet(tableTex, true), { pos: [0, tB + 0.004, 0], edges: false });
  /* one leaf: the two causes on its face, text on its back; under it, the table of the two settings */
  const leaf = new THREE.Group();
  const lp = makePart("leaf");
  addMesh(lp, at(box(W, 0.04, H, 0.01, 1), W / 2, 0.02, 0), paper, { edges: false });
  addMesh(lp, ...sheet(causesTex, true), { pos: [W / 2, 0.046, 0], edges: false });
  addMesh(lp, ...sheet(textPage(4), false), { pos: [W / 2, -0.006, 0], edges: false });
  leaf.add(lp);
  /* the cover and the first pages */
  const slab = new THREE.Group();
  slab.position.set(-W / 2, lift + tA, 0);
  const sp = makePart("slab");
  addMesh(sp, at(box(W, tA, H, 0.04, 1), W / 2, lift + tA / 2, 0), paper, { edgeOpacity: 0.5 });
  addMesh(sp, ...sheet(coverTex, true), { pos: [W / 2, lift + tA + 0.006, 0], edges: false });
  addMesh(sp, ...sheet(textPage(9), false), { pos: [W / 2, lift - 0.006, 0], edges: false });
  slab.add(sp);
  group.add(leaf, slab);
  return { group, leaf, slab, y0: tB + 0.008, y1: tA + 0.05, A: { cover: anchor(group, 0, REPORT.thick, 0) } };
}

/* ═════════════════════════════ the model ═════════════════════════════ */
export function buildModel() {
  /* the three alternators: West (z 0), North-East, South-East */
  const rotors = new THREE.Group();
  const GEO = alternatorGeo();
  const R = ROTOR.row.map((z, i) => {
    const r = makeAlternator(GEO, i === 0, i === 1 ? -1 : 1);
    r.g.position.set(0, ROTOR.axisY, z);
    rotors.add(r.g);
    return r;
  });
  const W = R[0];
  const dial = buildDial();
  const lw = buildLw();
  const hero = buildHero();
  const sync = buildSync();
  const report = buildReport();

  /* fonts: the drawn faces are painted again once the page's font is there */
  let typeset = false;
  const FONT_CHECK = `700 40px ${FONT}`;
  try {
    document.fonts?.load(FONT_CHECK);
  } catch {}
  const retype = () => {
    if (typeset) return;
    try {
      if (!document.fonts.check(FONT_CHECK)) return;
    } catch {
      return;
    }
    typeset = true;
    for (const p of painters) p();
  };
  const needleTo = (n, hz) => {
    n.pivot.rotation.z = -dialAngle(hz) * DEG;
    n.mat.color.copy(DARK).lerp(SIGNAL, sstep(FREQ.band, FREQ.band + 0.08, Math.abs(hz - FREQ.f0)));
  };

  function updAlt(S, time) {
    const n = Math.round(S.rotors);
    const base = ROTOR.spin * time;
    R[1].g.visible = n >= 2;
    R[2].g.visible = n >= 3;
    R[0].spinA.rotation.x = R[0].spinT.rotation.x = (base + S.turnW) * DEG;
    R[1].spinA.rotation.x = R[1].spinT.rotation.x = (base + S.turnE) * DEG;
    R[2].spinA.rotation.x = R[2].spinT.rotation.x = (base + S.turnS) * DEG;
    const o = sstep(0, 1, S.altOpen);
    W.up.position.y = 58 * o;
    W.slide.position.x = 46 * o;
    const named = Math.round(S.altNamed);
    for (let i = 0; i < 3; i++) W.named[i](named === i + 1 ? 1 : 0);
    W.drive.visible = S.drive > 0.01;
    W.driveMat.opacity = S.drive;
    W.brake.visible = S.brake > 0.01;
    W.brakeMat.opacity = S.brake;
    W.gov.position.y = 54 + 9 * S.gov;
    setGlow(W.govMat, 0.3 + 2 * S.gov);
    for (let j = 0; j < 3; j++) setGlow(W.res[j], 0.04 + 0.85 * clamp01(S.res - j)); // long strips: above 1 they bleed into one slab

    /* the coupling device between the West's and the North-East's flanges */
    const s = n >= 2 ? S.sync : 0;
    sync.group.visible = s > 0.004;
    if (!sync.group.visible) return;
    setPartOpacity(sync.part, s);
    sync.windows[0].rotation.x = sync.windows[1].rotation.x = (base + S.turnW) * DEG;
    sync.winMat.opacity = 0.9 * s;
    sync.ringMat.uniforms.uFill.value = S.tryK;
    sync.ringMat.uniforms.uFail.value = S.fail;
    sync.ringMat.uniforms.uAmount.value = s;
    const c = sstep(0, 1, S.closed);
    sync.rods[0].position.z = (ROTOR.row[0] + ROTOR.row[1]) / 2 - 4 * (1 - c);
    sync.rods[1].position.z = (ROTOR.row[0] + ROTOR.row[1]) / 2 + 4 * (1 - c);
    sync.rodMat.emissive.copy(VEILLE).multiplyScalar(0.5 * c);
    setGlow(sync.armMat, (0.05 + 1.75 * c) * s);
    setFlare(sync.spark, 2.2 * S.fail * s);
  }

  function updDial(S) {
    const show = clamp01(S.dial);
    setPartOpacity(dial.part, show);
    const three = S.needles > 1.5;
    needleTo(dial.needles[0], three || S.zone < 0.5 ? S.hzW : S.hzE);
    dial.needles[1].pivot.visible = dial.needles[2].pivot.visible = three;
    if (three) {
      needleTo(dial.needles[1], S.hzE);
      needleTo(dial.needles[2], S.hzS);
    }
    dial.bandMat.opacity = 0.95 * S.band * show;
    dial.band.visible = dial.bandMat.opacity > 0.01;
    dial.marksMat.opacity = S.marks * show;
    dial.marks.visible = dial.marksMat.opacity > 0.01;
  }

  function updLw(S, time) {
    const trip = clamp01(S.lwTrip);
    const amps = S.amps * (1 - sstep(0.08, 0.45, trip));
    lw.rwe.needle.rotation.z = lw.eon.needle.rotation.z = -ampAngle(amps);
    const u = lw.lineMat.uniforms;
    u.uColor.value.copy(INK).lerp(SIGNAL, sstep(LW.amps.alarm - 15, LW.amps.alarm + 15, S.amps));
    u.uK.value = 0.35 + 1.4 * clamp01((S.volt - 0.5) / 0.5);
    u.uDead.value = -12 + 440 * trip;
    u.uT.value = time * 30; // 1 cm a frame for dashes 18 cm apart
    setGlow(lw.rwe.zoneMat, 0.5 + 1.3 * S.markRwe);
    lw.rwe.figMat.opacity = S.markRwe;
    lw.rwe.fig.visible = S.markRwe > 0.01;
    setGlow(lw.eon.zoneMat, 0.5 + 1.3 * S.markEon);
    lw.eon.figMat.opacity = S.markEon;
    lw.eon.fig.visible = S.markEon > 0.01;
    /* Wehrendorf's breaker opens: the rod pulls back, an arc that has a place, the flag on its relay */
    const open = sstep(0, 0.22, trip);
    lw.rod.position.x = BRK_X + 7 * open;
    lw.tell.rotation.z = (PI / 2) * (1 - open);
    const f = sstep(0, 0.06, trip) * (1 - sstep(0.08, 0.5, trip));
    setFlare(lw.arc, 2.6 * f, 8 + 10 * f);
    setFlare(lw.arcHalo, 1.1 * f, 22 + 26 * f);
    setGlow(lw.rwe.flagMat, 0.04 + 2 * sstep(0, 0.12, trip));
    /* Landesbergen: the two busbars, the coupler */
    setGlow(lw.barMat, 0.1 + 0.9 * S.bars);
    setGlow(lw.stubMat, 0.05 + 0.42 * S.bars);
    const c = sstep(0, 1, S.couple);
    lw.blade.rotation.x = -52 * DEG * (1 - c);
    setGlow(lw.bladeMat, 0.4 + 0.65 * c * S.bars);
    const named = Math.round(S.lwNamed);
    lw.eon.named(named === 1 ? 1 : 0);
    lw.rwe.named(named === 2 ? 1 : 0);
    lw.namedBars(named === 3 ? 1 : 0);
    lw.namedCoupler(named === 4 ? 1 : 0);
  }

  function updHero(S, time) {
    const o = clamp01(S.heroOpen);
    const off = sstep(0, 0.3, o);
    setPartOpacity(hero.door0, 1 - off);
    hero.door0.position.z = 10 * off;
    setPartOpacity(hero.cover, 1 - off);
    hero.cover.position.z = 7 * off;
    hero.truck.visible = o > 0.004;
    hero.truck.position.z = TRUCK_IN * (1 - sstep(0.2, 1, o));
    hero.cordMat.opacity = sstep(0.85, 1, o);
    hero.cord.visible = hero.cordMat.opacity > 0.01;

    /* « clac » : the latch lets go, the spring pulls the lever, the lever pulls the contact down */
    const c = clamp01(S.clac);
    const e = easeOut(c);
    const th = LEVER.swing * e;
    const drop = LEVER.pin * Math.tan(th);
    hero.mover.position.y = -drop;
    hero.lever.rotation.x = -th;
    const qy = LEVER.y + LEVER.arm * Math.sin(th);
    const qz = LEVER.z + LEVER.arm * Math.cos(th);
    const dy = LEVER.spring[0] - qy;
    const dz = LEVER.spring[1] - qz;
    hero.spring.position.set(4.2, qy, qz);
    hero.spring.rotation.x = Math.atan2(dz, dy);
    hero.spring.scale.y = Math.sqrt(dy * dy + dz * dz) / LEVER.rest;
    hero.latch.rotation.x = 0.6 * sstep(0, 0.25, c);
    const f = sstep(0, 0.1, c) * (1 - sstep(0.15, 0.9, c));
    hero.gapFlare.position.y = 78 - drop / 2;
    setFlare(hero.gapFlare, 1.9 * f + 0.1 * e, 9 + 16 * f); // a flash, then almost nothing: the GAP between the two contacts must stay dark to be read
    hero.contactMat.emissive.copy(VEILLE).multiplyScalar(0.45 * e);
    setGlow(hero.plungerMat, 0.05 + 2.2 * f);
    hero.blade0.rotation.z = -35 * DEG * e;
    hero.blade0Mat.color.copy(INK).lerp(VEILLE, e).multiplyScalar((0.72 + 1.1 * e) * hero.door0.userData.part.opacity);
    hero.tell.rotation.z = (PI / 2) * e;
    hero.tellMat.color.copy(INK).lerp(VEILLE, e).multiplyScalar(0.9 + 0.8 * e);
    const order = sstep(0, 0.2, c);
    setGlow(hero.flagMat, 0.03 + 1.9 * order);
    hero.cordMat.color.copy(DARK).lerp(VEILLE, order).multiplyScalar(1 + 0.9 * order);

    /* the relay watches: its lamp breathes slowly; its setting; its own band */
    const breath = 0.8 + 0.2 * Math.sin(time * 1.5);
    setGlow(hero.pilotMat, 0.06 + 2 * S.hero * breath);
    setFlare(hero.pilotHalo, 0.55 * S.hero * breath);
    const sp = clamp01(S.setpt);
    hero.pointer.rotation.z = -hero.setA(47 + 2 * sstep(0, 1, sp));
    setGlow(hero.pointerMat, 0.3 + 1.6 * sp);
    hero.figMat.opacity = sp;
    hero.fig.visible = sp > 0.01;
    hero.precMat.opacity = 0.9 * S.precision;
    hero.prec.visible = S.precision > 0.01;

    /* the four steps, named one after the other; the ten feeders of the first one */
    for (let i = 0; i < 4; i++) {
      const v = clamp01(S.steps - i);
      hero.cells[i].named(v);
      setGlow(hero.cells[i].lampMat, 0.05 + 2 * v);
    }
    const d = clamp01(S.dep);
    const lit = 0.3 + 0.85 * sstep(0, 0.1, d);
    setGlow(hero.stayMat, lit);
    hero.dropMat.color.copy(INK).lerp(VEILLE, sstep(0.1, 0.6, d)).multiplyScalar(lit);
    for (let j = 0; j < hero.flags.length; j++) {
      const fl = hero.flags[j];
      if (fl.order < 0) continue;
      const fall = sstep(fl.order * 0.085, fl.order * 0.085 + 0.4, d);
      fl.mesh.rotation.x = 100 * DEG * fall * fall;
    }
  }

  function updReport(S) {
    const p = Math.min(2, Math.max(0, S.page));
    const open = sstep(0, 1, p);
    const turn = sstep(1, 2, p);
    report.slab.rotation.z = PI * open;
    report.leaf.rotation.z = PI * turn;
    report.leaf.position.set(-REPORT.w / 2, report.y0 + (report.y1 - report.y0) * turn, 0);
  }

  return {
    rotors: { group: rotors, A: { flange: R.map((r) => r.A), turbine: W.A_turbine, rotor: W.A_rotor, stator: W.A_stator } },
    dial: { group: dial.group, A: dial.A },
    lw: { group: lw.group, A: lw.A },
    hero: { group: hero.group, A: hero.A },
    sync: { group: sync.group },
    report: { group: report.group, A: report.A },
    update(S, time, px, ctx) {
      retype();
      const bench = ctx.set === SET_BENCH;
      if (bench && ctx.spot === 0) updAlt(S, time);
      dial.group.visible = S.dial > 0.004 && (ctx.set === SET_CARTE || (bench && ctx.spot === 0));
      if (dial.group.visible) updDial(S);
      if (bench && ctx.spot === 1) updLw(S, time);
      if (ctx.set === SET_QUARTIER || (bench && ctx.spot === 2)) updHero(S, time);
      if (bench && ctx.spot === 3) updReport(S);
    },
  };
}
