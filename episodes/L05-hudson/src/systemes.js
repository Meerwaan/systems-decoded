// DOSSIER L05 — the SOLID systems we open, each mounted by world.js at its true place in the A320 (or on the bench):
// the left CFM56 that opens in place, the APU in the tail cone, the cockpit (two pilots of glass, the sidesticks, the
// computers, the overhead and its ditching button, the screens, the angle-of-attack limit), the check-list binder (QRH),
// the engine's test stand and its bird gun, the lineup of the end.
//
//   buildSystemes() → { engine, apu, cockpit, qrh, stand, lineup, update(p, time, px, ctx) }   each part = { group, A }
//   p    the world's state S — systemes.js reads: explode named n1L n1R burn goose ign gen apu law stick limit aoa pilots
//        pf masters ecam alarm qrh page done apuMark gap gun aimCore birdCmp listK feed (meaning: FIRST, in world.js)
//   ctx  { t, camera, … } in flight · { t, bench: true } on the bench
//
//   engine.group  origin at the INLET LIP's centre, axis along +x (aft), the plane's frame (world.js puts it at
//                 A320.engine, left: +z; on the bench, on stand.A.mount). A: fan, compressor, core, turbine, nozzle, idg
//                 (each rides with its part when the engine opens), goose (the goose / its debris).
//                 The nacelle is GLASS (two half-cowls hinged at the top: they open like gull wings); inside, solid:
//                 the inlet lip, the fan (36 twisted blades, the spinner), the booster, the HP compressor, the combustor,
//                 the turbines, the nozzle and its plug, the gearbox and its generator (IDG) underneath. The core is cut
//                 open on the outboard-upper quarter (φ −35° ± 60°: toward +z and up) — the fire, the igniters and the
//                 goose's debris are seen through it.
//   apu.group     origin at the APU's centre in the tail cone (A320.apu), axis +x aft. A: inlet, exhaust, gen
//   cockpit.group origin on the cockpit floor's centre line at A320.cockpit.floorX (y = A320.cockpit.floorY). Captain
//                 LEFT (+z), first officer RIGHT (−z). A: capt, fo (their heads), stickC, stickF (the grips), overhead
//                 (the ditching button), ecam, glare, lap (where the QRH sits in the first officer's hands: the anchor is
//                 turned so the open binder faces him), computers (the bay, under the floor), limit (the
//                 angle-of-attack arc's centre, beside the nose OUTSIDE)
//   qrh.group     origin at the binder's spine, bottom (≈ 22 × 30 cm): spine along z, the right-hand pages toward +x,
//                 the tops of the pages toward −z. A: page (the open pages' centre), tab1 tab2 tab3, apu (its line)
//   stand.group   the test stand on the bench (origin on the bench's floor). A: mount (the engine's inlet lip on it),
//                 muzzle, bird (the projectile, it moves)
//   lineup.group  four places in a row on the bench (origin on the floor). A: slot1 (an APU), slot2 (a sidestick and its
//                 computers), slot3 (world.js: a slide-raft, avion.makeRaft), slot4 (world.js: a ferry, hudson.makeFerry)
//
// Everything that moves is read in `update` (called sixteen times a frame): no allocation there.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glass, asShell, lathe, box, plate, makePart, addMesh, fatLine, mergeGeometries } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { A320 } from "./plan.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = SIGNAL.clone().lerp(INK, 0.35); // the fire's heart
const WARM = INK.clone().lerp(SIGNAL, 0.22); // hot metal, an exhaust: ink, barely warm
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const lerp = (a, b, u) => a + (b - a) * u;
const easeIO = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// leaves fast, lands with a slight overshoot: parts have weight (build3d's `settle`)
const settle = (u) => easeIO(u) + Math.sin(Math.PI * u) ** 2 * 0.05 * (u > 0.5 ? 1 : 0.25);

/* ── three greys (and a light hero), metal never more than half metallic ── */
const GREY = { dark: 0x32373c, mid: 0x5b6167, light: 0x8d949a, pale: 0xaeb2b0, hero: 0xcdc8bc };
const metal = (c, o = {}) => solid(c, { rough: o.rough ?? 0.46, metal: o.metal ?? 0.35, env: o.env ?? 1.1, double: o.double, opacity: o.opacity });

/* ── geometry helpers ── */
// a profile [[r, x], …] turned about the x axis (lathe turns about y; rotateZ(−90°) sends y to +x): (x, −r sinφ, r cosφ)
const alongX = (profile, seg = 64, bevel = 0) => (bevel ? lathe(profile, seg, { bevel, round: 2 }) : lathe(profile, seg)).rotateZ(-Math.PI / 2);
// the same, open between two angles (the cutaway): φ 0 = +z, φ −90° = +y
const cutX = (profile, a0, len, seg = 48) =>
  new THREE.LatheGeometry(profile.map(([r, x]) => new THREE.Vector2(r, x)), seg, a0 * DEG, len * DEG).rotateZ(-Math.PI / 2);
const WIN = { c: -35, w: 120 }; // the cutaway window, φ centre and width (degrees): outboard and up
const CUT = [WIN.c + WIN.w / 2, 360 - WIN.w]; // what stays of a casing

function xform(geo, { pos = [0, 0, 0], rx = 0, ry = 0, rz = 0 } = {}) {
  const m = new THREE.Matrix4().compose(V(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "XYZ")), V(1, 1, 1));
  return geo.applyMatrix4(m);
}
const bare = (g) => {
  const n = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(n.attributes)) if (k !== "position" && k !== "normal") n.deleteAttribute(k);
  return n;
};
/** A row of `n` blades around the x axis at `x`, from r0 to r1, `chord` long, turned by `stagger` (degrees). */
function bladeRing(x, r0, r1, n, chord, thick, stagger) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.BoxGeometry(chord, r1 - r0, thick);
    xform(g, { pos: [0, (r0 + r1) / 2, 0], ry: stagger * DEG });
    xform(g, { pos: [x, 0, 0], rx: (i / n) * TAU });
    out.push(bare(g));
  }
  return mergeGeometries(out);
}
/** The fan's 36 blades: wide toward the tip, twisted from root to tip (one geometry). */
function fanBlades(n = 36, r0 = 30, r1 = 86) {
  const base = new THREE.BoxGeometry(1, 1, 1, 1, 10, 1);
  const p = base.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getY(i) + 0.5;
    const chord = 21 + 11 * u;
    const thick = 2.8 - 1.5 * u;
    const x = p.getX(i) * chord;
    const z = p.getZ(i) * thick;
    const a = (28 + 34 * u) * DEG; // root nearly axial, tip nearly across
    p.setXYZ(i, x * Math.cos(a) - z * Math.sin(a), r0 + u * (r1 - r0), x * Math.sin(a) + z * Math.cos(a));
  }
  const one = bare(base);
  one.computeVertexNormals();
  const all = [];
  for (let i = 0; i < n; i++) all.push(xform(one.clone(), { pos: [83, 0, 0], rx: (i / n) * TAU }));
  const g = mergeGeometries(all);
  g.computeVertexNormals();
  return g;
}
const arcPts = (x, r, a0, a1, n = 28) => {
  const pts = [];
  for (let j = 0; j <= n; j++) {
    const a = (a0 + ((a1 - a0) * j) / n) * DEG;
    pts.push([x, -r * Math.sin(a), r * Math.cos(a)]);
  }
  return pts;
};

/* ── light that has a place: a soft sprite (a bright heart, a long fall-off) ── */
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
function makeGlow(color, size) {
  const mat = new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(color), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
  const s = new THREE.Sprite(mat);
  s.scale.setScalar(size);
  s.renderOrder = 6;
  s.userData = { size, hue: new THREE.Color(color) };
  return s;
}
const WP = new THREE.Vector3();
/** Light a sprite (k ≤ 2.5: above 3 it bleeds); `cam` + `px`: never smaller than `minPx` pixels on screen. */
function setGlowK(s, k, cam = null, px = 0, minPx = 0) {
  s.visible = k > 0.004;
  if (!s.visible) return;
  s.material.color.copy(s.userData.hue).multiplyScalar(k);
  let size = s.userData.size;
  if (cam && px > 0 && minPx > 0) {
    s.getWorldPosition(WP);
    size = Math.max(size, (minPx * WP.distanceTo(cam.position)) / px);
  }
  s.scale.setScalar(size);
}
/** An unlit, additive glow material (a band, a LED, a flame) that we light by hand. */
function glowMat(color, o = {}) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, blending: o.normal ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, side: o.double ? THREE.DoubleSide : THREE.FrontSide, fog: false, opacity: o.opacity ?? 1 });
  m.userData.hue = new THREE.Color(color);
  return m;
}
const setK = (m, k, hue = null) => m.color.copy(hue ?? m.userData.hue).multiplyScalar(k);
const setOp = (m, k) => (m.opacity = (m.userData.base ?? 1) * k);

/* ── a spinning wheel's angle, integrated (a speed that changes must not make it jump) ── */
const wheel = () => ({ a: 0, t: -1e9 });
function spin(w, time, rate) {
  const dt = time - w.t;
  if (dt > 0 && dt < 0.25) w.a += dt * rate;
  else if (dt !== 0) w.a = time * rate;
  w.t = time;
  return w.a % TAU;
}

/* ── a part the voice names: its solids glow veille, its edges turn veille ── */
function litSet(...parts) {
  const sol = [];
  const lin = [];
  for (const part of parts)
    for (const m of part.userData.part.mats) {
      if (m.isLineMaterial) {
        m.userData.c0 = m.color.clone();
        lin.push(m);
      } else if (m.emissive) sol.push(m);
    }
  return { sol, lin, k: -1 };
}
function light(set, k) {
  if (Math.abs(set.k - k) < 1e-3) return;
  set.k = k;
  for (const m of set.sol) m.emissive.copy(VEILLE).multiplyScalar(0.2 * k);
  for (const m of set.lin) m.color.copy(m.userData.c0).lerp(VEILLE, k);
}

/* ═══════════════════════════════════════ the goose ═══════════════════════════════════════ */
/** A Canada goose in flight, ≈ 85 cm long, 1.6 m across: head toward +x. Returns its wings to beat them. */
function makeGoose(mat, dark) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(alongX([[0, -30], [5, -27], [9.5, -18], [12.5, -5], [12.8, 6], [11, 15], [7, 21], [0, 25]], 32), mat);
  body.scale.z = 0.86;
  group.add(body);
  const neck = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(17, 4, 0), V(30, 7, 0), V(42, 8.5, 0), V(50, 9, 0)]), 16, 3.3, 10), dark);
  group.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(4.8, 20, 14), dark);
  head.scale.set(1.45, 0.92, 0.9);
  head.position.set(53, 9.5, 0);
  group.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(1.6, 6, 10).rotateZ(-Math.PI / 2), dark);
  beak.position.set(61, 8.8, 0);
  group.add(beak);
  const tail = new THREE.Mesh(plate([[0, -6], [-14, -7], [-16, 0], [-14, 7], [0, 6]], 1.4, { bevel: 0.4 }).rotateX(Math.PI / 2), dark);
  tail.position.set(-26, 3, 0);
  group.add(tail);
  // a wing: span along +z, chord toward −x; the left one, the right mirrored
  const outline = [[6, 0], [2, 22], [-4, 46], [-14, 70], [-24, 78], [-30, 74], [-24, 50], [-20, 24], [-17, 0]];
  const wingGeo = plate(outline, 1.6, { bevel: 0.5 }).rotateX(Math.PI / 2);
  const wings = [1, -1].map((s) => {
    const pivot = new THREE.Group();
    pivot.position.set(4, 6, s * 8);
    const w = new THREE.Mesh(wingGeo, mat);
    w.scale.z = s;
    pivot.add(w);
    group.add(pivot);
    return pivot;
  });
  return { group, wings };
}

/* ═══════════════════════════════════════ the engine ═══════════════════════════════════════ */
function buildEngine() {
  const group = new THREE.Group();
  const A = {};
  const ex = []; // [part, dx, dy, delay]
  const P = (name, dx, dy, delay) => {
    const part = makePart(name);
    group.add(part);
    ex.push({ part, dx, dy, delay });
    return part;
  };

  /* the nacelle: glass, two half-cowls hinged at the top (+y), a few fine rings */
  const NAC = [[88, 40], [87, 20], [88, 8], [91, 2], [95, 0.5], [99, 2], [102, 10], [105, 50], [106, 140], [104, 240], [99, 320], [88, 390], [74, 436], [70, 442], [67, 437]];
  const nacMat = glass(BRAND.ink, { base: 0, rim: 0.34, power: 2.6, edge: 0.32, spec: 0.45, through: 0.22 });
  const HINGE = 106;
  const cowls = [
    [-90, 180, -1],
    [90, 180, 1],
  ].map(([a0, len, s]) => {
    const pivot = new THREE.Group();
    pivot.position.y = HINGE;
    const inner = new THREE.Group();
    inner.position.y = -HINGE;
    pivot.add(inner);
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(NAC.map(([r, x]) => new THREE.Vector2(r, x)), 40, a0 * DEG, len * DEG).rotateZ(-Math.PI / 2), nacMat);
    inner.add(mesh);
    const rings = [[3, 99.5], [62, 105.4], [250, 104], [438, 71]].map(([x, r]) => fatLine(arcPts(x, r, a0, a0 + len), { color: BRAND.ink, width: 1.8, opacity: 0.32 }));
    rings.forEach((l) => inner.add(l));
    group.add(pivot);
    return { pivot, mesh, s, rings };
  });
  asShell(cowls.map((c) => c.mesh), 18);

  /* the inlet lip: polished, the lightest of the nacelle */
  const lip = P("lip", -120, 0, 0.02);
  addMesh(lip, alongX([[86, 6], [88, 0.8], [92, 0], [97, 1.2], [100, 4], [101.5, 12], [101, 30], [97, 30], [92, 22], [88.5, 13], [86, 6]], 72), metal(GREY.pale, { rough: 0.38 }), { edgeOpacity: 0.7 });

  /* the fan: spinner, 36 blades, its case's front flange */
  const fan = P("fan", -50, 0, 0.06);
  const fanRot = makePart("fanRot");
  fan.add(fanRot);
  addMesh(fanRot, alongX([[0, 30], [8, 36], [17, 46], [25, 60], [30, 76], [31.5, 92], [31.5, 102], [0, 102]], 48), metal(GREY.dark, { rough: 0.4 }), { edgeOpacity: 0.55 });
  const bladeMat = metal(GREY.light, { rough: 0.42, metal: 0.4 });
  const blades = addMesh(fanRot, fanBlades(), bladeMat, { edges: false });
  blades.castShadow = false;
  addMesh(fan, alongX([[87, 58], [97, 58], [97, 66], [87, 66], [87, 58]], 72), metal(GREY.mid), { edgeOpacity: 0.6 });
  A.fan = new THREE.Object3D();
  A.fan.position.set(84, 60, 0);
  fan.add(A.fan);
  // fan.userData.part.mats holds the blades' material: `named` lights the blades too
  fan.userData.part.mats.add(bladeMat);

  /* the booster (low-pressure compressor) and the splitter that parts the core flow from the bypass */
  const booster = P("booster", 0, 0, 0.1);
  const boMat = metal(GREY.mid, { double: true });
  addMesh(booster, cutX([[47, 104], [44, 101], [42, 106], [41, 150], [44, 150], [46, 112], [47, 104]], CUT[0], CUT[1]), boMat, { threshold: 30 });
  addMesh(booster, alongX([[0, 102], [22, 102], [24, 150], [0, 150]], 48), metal(GREY.dark));
  addMesh(booster, [112, 126, 140].map((x) => bladeRing(x, 23, 40, 22, 6, 1.2, 38)).reduce((a, b) => mergeGeometries([a, b])), metal(GREY.light), { edges: false });

  /* the high-pressure compressor: nine rows, the casing narrows */
  const hpc = P("hpc", 45, 0, 0.14);
  const hcR = (x) => lerp(35, 27, (x - 150) / 98);
  const hcProfile = [[37.5, 150]];
  for (let i = 0; i <= 9; i++) {
    const x = 150 + i * 10.8;
    hcProfile.push([hcR(x) + 1.6, x], [hcR(x) + 1.6, x + 2], [hcR(x + 2), x + 2]);
  }
  hcProfile.push([27, 248], [25, 248], [33, 150], [37.5, 150]);
  addMesh(hpc, cutX(hcProfile, CUT[0], CUT[1]), metal(GREY.light, { double: true }), { threshold: 40 });
  addMesh(hpc, alongX([[0, 150], [17, 150], [15, 248], [0, 248]], 48), metal(GREY.mid));
  const hpRows = [];
  for (let i = 0; i < 9; i++) {
    const x = 156 + i * 10.6;
    hpRows.push(bladeRing(x, 16.5, hcR(x) - 0.8, 26, 4.5, 1, 40));
  }
  addMesh(hpc, mergeGeometries(hpRows), metal(GREY.pale), { edges: false });

  /* the core: the combustion chamber, the hero — its fire, its fuel nozzles, its two igniters */
  const core = P("core", 100, 0, 0.18);
  const coreMat = metal(GREY.hero, { rough: 0.5, metal: 0.3, double: true });
  addMesh(core, cutX([[33, 248], [36.5, 256], [36.5, 288], [32, 296], [30, 296], [34, 288], [34, 256], [31, 248], [33, 248]], CUT[0], CUT[1]), coreMat, { threshold: 30 });
  const linerMat = metal(GREY.mid);
  addMesh(core, alongX([[0, 248], [19, 248], [21.5, 272], [19.5, 296], [0, 296]], 48), linerMat);
  addMesh(core, cutX([[20, 249], [31, 249], [31, 251.5], [20, 251.5], [20, 249]], CUT[0], CUT[1]), metal(GREY.light, { double: true }), { edges: false }); // the dome
  // twenty fuel nozzles around a manifold outside the casing
  const noz = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * 360;
    const g = new THREE.CylinderGeometry(1.1, 1.1, 8, 8);
    xform(g, { pos: [0, 39, 0] });
    xform(g, { pos: [254, 0, 0], rx: a * DEG });
    noz.push(bare(g));
  }
  noz.push(bare(xform(new THREE.TorusGeometry(42.5, 1, 8, 72), { pos: [254, 0, 0], ry: Math.PI / 2 })));
  addMesh(core, mergeGeometries(noz), metal(GREY.mid), { edges: false });
  // the fire: a ring in the annulus, seen through the cutaway
  const fireMat = glowMat(HOT);
  const fire = new THREE.Mesh(xform(new THREE.TorusGeometry(26, 4.2, 12, 72), { ry: Math.PI / 2 }), fireMat);
  fire.position.x = 270;
  fire.renderOrder = 5;
  core.add(fire);
  const fireGlow = makeGlow(HOT, 46);
  fireGlow.position.set(271, 26 * Math.sin(-WIN.c * DEG), 26 * Math.cos(WIN.c * DEG));
  core.add(fireGlow);
  // two igniters on the window's edges, their sparks inside
  const ignMat = metal(GREY.pale);
  const sparks = [CUT[0] + 4, CUT[0] + CUT[1] - 4].map((a) => {
    const plug = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 12, 10), ignMat);
    const c = Math.cos(a * DEG);
    const s = Math.sin(a * DEG);
    plug.position.set(266, -37 * s, 37 * c);
    plug.rotation.x = (a + 90) * DEG;
    core.add(plug);
    const sp = makeGlow(VEILLE, 9);
    sp.position.set(266, -30 * s, 30 * c);
    core.add(sp);
    return sp;
  });
  A.core = new THREE.Object3D();
  A.core.position.set(272, 28 * Math.sin(-WIN.c * DEG), 28 * Math.cos(WIN.c * DEG));
  core.add(A.core);

  /* the turbines: one high-pressure stage, four low-pressure ones, the casing widens */
  const turb = P("turbine", 160, 0, 0.22);
  const tR = (x) => (x < 316 ? 31 : lerp(32, 45, (x - 316) / 56));
  addMesh(turb, cutX([[30, 296], [31.5, 298], [31.5, 314], [32, 316], [45, 372], [47, 372], [47, 375], [42, 375], [30, 316], [29, 298], [30, 296]], CUT[0], CUT[1]), metal(GREY.mid, { double: true }), { threshold: 30 });
  addMesh(turb, alongX([[0, 296], [18, 296], [20, 316], [24, 372], [0, 372]], 48), metal(GREY.dark));
  addMesh(turb, mergeGeometries([306, 326, 340, 353, 365].map((x) => bladeRing(x, x < 316 ? 18.5 : lerp(20, 24, (x - 316) / 56), tR(x) - 1, 30, 5, 1.2, -42))), metal(GREY.light), { edges: false });

  /* the nozzle: the mixer, the plug, the nacelle's exit ring */
  const nozzle = P("nozzle", 235, 0, 0.26);
  addMesh(nozzle, alongX([[41, 375], [44, 377], [40, 410], [37, 410], [39, 377], [41, 375]], 64), metal(GREY.mid, { double: true }), { edgeOpacity: 0.6 });
  addMesh(nozzle, alongX([[0, 372], [29, 374], [30.5, 392], [26, 428], [15, 462], [5, 480], [0, 483]], 48, 0), metal(GREY.dark, { rough: 0.55 }), { edgeOpacity: 0.55 });
  addMesh(nozzle, alongX([[67, 430], [71.5, 431], [71, 442], [68, 442], [67, 430]], 72), metal(GREY.light), { edgeOpacity: 0.65 });
  // the heat behind it: the fire's breath (with `burn`)
  const exhaustGlow = makeGlow(WARM, 70);
  exhaustGlow.position.set(500, 0, 0);
  nozzle.add(exhaustGlow);

  /* the gearbox under the fan case, and its generator (IDG) — it steps down when the engine opens */
  const gear = P("idg", 0, -88, 0.3);
  addMesh(gear, xform(box(92, 8, 24, 1.5), { pos: [150, -99, 8] }), metal(GREY.mid));
  addMesh(gear, xform(alongX([[0, -20], [10.5, -20], [11.5, -14], [11.5, 14], [9, 20], [0, 20]], 40, 0.8), { pos: [168, -91, 27] }), metal(GREY.pale, { rough: 0.5 }), { edgeOpacity: 0.7 });
  addMesh(gear, xform(box(16, 14, 12, 1.2), { pos: [140, -92, 26] }), metal(GREY.dark));
  const genBand = new THREE.Mesh(xform(new THREE.TorusGeometry(11.9, 0.9, 8, 48), { ry: Math.PI / 2 }), glowMat(VEILLE));
  genBand.position.set(168, -91, 27);
  gear.add(genBand);
  const genGlow = makeGlow(VEILLE, 22);
  genGlow.position.set(168, -91, 40);
  gear.add(genGlow);
  A.idg = new THREE.Object3D();
  A.idg.position.set(168, -91, 27);
  gear.add(A.idg);

  for (const [k, part] of [["compressor", hpc], ["turbine", turb], ["nozzle", nozzle]]) {
    A[k] = new THREE.Object3D();
    A[k].position.set(k === "compressor" ? 200 : k === "turbine" ? 340 : 440, 0, 0);
    part.add(A[k]);
  }

  /* the goose, and what is left of it in the core */
  const gooseMat = metal(0x8e8a84, { rough: 0.78, metal: 0 });
  gooseMat.emissive.copy(SIGNAL).multiplyScalar(0.2); // the threat: a warm grey, never dark on dark
  const goose = makeGoose(gooseMat, metal(0x2c2f33, { rough: 0.7, metal: 0 }));
  group.add(goose.group);
  A.goose = goose.group;
  const shardMat = metal(0x6e6a65, { rough: 0.75, metal: 0 });
  const shardGeo = new THREE.IcosahedronGeometry(1, 0);
  const shards = [];
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(shardGeo, shardMat);
    m.scale.set(3.2 + rnd() * 3.6, 2.4 + rnd() * 2.8, 3 + rnd() * 3);
    m.userData = { phi: WIN.c + (rnd() - 0.5) * 80, x1: 258 + rnd() * 30, dr: (rnd() - 0.5) * 6, lag: rnd() * 0.18, spin: 1 + rnd() * 3 };
    group.add(m);
    shards.push(m);
  }
  const hitGlow = makeGlow(SIGNAL, 60); // the strike at the fan
  hitGlow.position.set(84, 38, 0);
  group.add(hitGlow);
  const smudge = makeGlow(SIGNAL, 40); // the core, darkened, under threat
  smudge.position.copy(A.core.position);
  core.add(smudge);

  /* the bird gun's projectile (on the bench), in the engine's frame: it flies down −x → the fan */
  const shotMat = metal(0x2a2e33, { rough: 0.7, metal: 0.1 });
  const shot = new THREE.Mesh(alongX([[0, -13], [7, -9], [9, 0], [7.5, 8], [0, 13]], 24), shotMat);
  shot.scale.z = 0.85;
  group.add(shot);
  const testShards = [];
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(shardGeo, shotMat);
    m.scale.setScalar(2 + rnd() * 2.6);
    m.userData = { phi: rnd() * 360, dx: 60 + rnd() * 220, dr: 8 + rnd() * 30, lag: rnd() * 0.12 };
    group.add(m);
    testShards.push(m);
  }
  const flash = makeGlow(SIGNAL, 90);
  flash.material.depthTest = false;
  group.add(flash);

  const named = {
    1: litSet(fan, fanRot),
    2: litSet(booster, hpc),
    3: litSet(core),
    4: litSet(turb, nozzle),
    5: litSet(gear),
  };
  const coreBase = new THREE.Color(GREY.hero);
  const coreDark = new THREE.Color(0x4a3a33);
  const fanSpin = wheel();

  function update(p, time, px, ctx) {
    const cam = ctx?.camera ?? null;
    const bench = !!ctx?.bench;
    /* open in place: the parts slide apart along the axis, the generator steps down, the cowls swing up */
    const k = clamp01(p.explode);
    for (const e of ex) {
      const u = settle(ramp(k, e.delay, e.delay + 0.62));
      e.part.position.set(e.dx * u, e.dy * u, 0);
    }
    const open = settle(ramp(k, 0, 0.7));
    for (const c of cowls) c.pivot.rotation.x = c.s * 108 * DEG * open;
    nacMat.uniforms.uAmount.value = 1 - 0.35 * open;

    /* the fan turns at N1 (blurred by the shutter), never while opened */
    const n1 = Math.max(0, p.n1L);
    fanRot.rotation.x = spin(fanSpin, time, TAU * 9.5 * (n1 / 100) * (1 - open));

    /* the fire; the igniters; the generator */
    const burn = clamp01(p.burn);
    const fl = 1 + 0.07 * Math.sin(time * 7.1) + 0.05 * Math.sin(time * 11.3 + 1.7);
    setK(fireMat, 1.7 * burn * fl);
    fire.visible = burn > 0.01;
    setGlowK(fireGlow, 1.1 * burn * fl);
    setGlowK(exhaustGlow, 0.5 * burn * (bench ? 0 : 1));
    const ign = clamp01(p.ign);
    for (let i = 0; i < 2; i++) setGlowK(sparks[i], ign * (0.6 + 1.6 * smooth(clamp01(Math.sin(time * TAU * 1.4 + i * 2.1) * 1.4))));
    const gen = clamp01(p.gen) * (0.85 + 0.25 * clamp01(p.feed));
    setK(genBand.material, 1.5 * gen);
    genBand.visible = gen > 0.01;
    setGlowK(genGlow, 0.9 * gen);

    /* the goose: 0 → 0.5 it comes to the fan, 0.5 → 1 its debris rides the core flow to the chamber */
    const g = clamp01(p.goose);
    const fly = ramp(g, 0, 0.5);
    goose.group.visible = g > 0.002 && g < 0.53;
    if (goose.group.visible) {
      const s = 1 - smooth(ramp(g, 0.46, 0.53));
      goose.group.position.set(lerp(-330, 70, fly), lerp(58, 40, fly), lerp(14, 0, fly));
      goose.group.scale.setScalar(Math.max(0.01, s));
      goose.group.rotation.set(0.06 * Math.sin(time * 1.3), 0, lerp(-0.08, 0.05, fly));
      const beat = 1 - smooth(ramp(g, 0.25, 0.42)); // the wings fold as it is sucked in
      const flap = 0.55 * Math.sin(time * TAU * 2.6) * beat + (1 - beat) * 0.9;
      goose.wings[0].rotation.x = -flap;
      goose.wings[1].rotation.x = flap;
    }
    setGlowK(hitGlow, 2.2 * smooth(ramp(g, 0.45, 0.5)) * (1 - smooth(ramp(g, 0.5, 0.66))));
    const deb = ramp(g, 0.48, 1);
    for (const m of shards) {
      const d = m.userData;
      const u = clamp01((deb - d.lag) / (1 - d.lag));
      m.visible = g > 0.48 && u > 0;
      if (!m.visible) continue;
      const e = easeIO(u);
      const x = lerp(86, d.x1, e);
      const r = (x < 150 ? 33 : x < 248 ? lerp(25.5, 21, (x - 150) / 98) : 26) + d.dr * (1 - 0.6 * e);
      const a = d.phi * DEG + (1 - e) * 0.6;
      m.position.set(x + (core.position.x * smooth(ramp(x, 240, 260))), -r * Math.sin(a), r * Math.cos(a));
      m.rotation.set(time * d.spin, time * d.spin * 0.7, 0);
    }
    shardMat.emissive.copy(SIGNAL).multiplyScalar(0.3 + 0.5 * smooth(ramp(g, 0.8, 1)));
    const inCore = smooth(ramp(g, 0.85, 1));
    coreMat.color.copy(coreBase).lerp(coreDark, 0.55 * inCore);
    setGlowK(smudge, inCore * (0.9 + 0.2 * Math.sin(time * 2.2)));

    /* the bench's bird gun: the projectile, the strike, the debris (blades or core) */
    const gun = bench ? clamp01(p.gun) : 0;
    const aim = clamp01(p.aimCore);
    const ay = lerp(62, 32, aim);
    shot.visible = gun > 0.02 && gun < 0.56;
    if (shot.visible) {
      const u = ramp(gun, 0.04, 0.55);
      shot.position.set(lerp(-185, 86, u * u * (2 - u)), ay, 0);
      shot.rotation.x = time * 3;
    }
    const strike = smooth(ramp(gun, 0.53, 0.57)) * (1 - smooth(ramp(gun, 0.57, 0.78)));
    flash.position.set(52, ay, 0); // in front of the fan face: the spinner would hide it
    setGlowK(flash, 2.3 * strike);
    const td = ramp(gun, 0.55, 1);
    for (const m of testShards) {
      const d = m.userData;
      const u = clamp01((td - d.lag) / (1 - d.lag));
      m.visible = gun > 0.55 && u > 0 && u < 0.999;
      if (!m.visible) continue;
      const e = 1 - (1 - u) * (1 - u);
      // blades: thrown outward into the bypass · core: swallowed down the core flow
      const rB = ay + d.dr * e;
      const rC = lerp(ay, 24, e);
      const r = lerp(rB, rC, aim);
      const a = d.phi * DEG;
      m.position.set(86 + d.dx * e * lerp(1, 0.75, aim), lerp(r, r * Math.cos(a * 0.3), 0.3), lerp(0, r * Math.sin(a) * 0.5, 1 - aim));
      m.rotation.set(time * 4, time * 3, 0);
    }

    /* the part the voice names */
    const nm = Math.round(p.named);
    for (const i in named) light(named[i], nm === +i ? 1 : 0);
    void px;
    void cam;
  }

  return { group, A, update, shot };
}

/* ═══════════════════════════════════════ the APU ═══════════════════════════════════════ */
/** The APU: generator, gearbox, load compressor (cut open: its wheel), combustor, turbine, exhaust duct. Axis +x aft. */
function buildApu() {
  const group = new THREE.Group();
  const A = {};
  const part = makePart("apu");
  group.add(part);
  const genMat = metal(GREY.pale, { rough: 0.5 });
  addMesh(part, alongX([[0, -100], [12, -100], [13.5, -95], [13.5, -74], [11, -70], [0, -70]], 40, 0.8), genMat);
  addMesh(part, xform(box(28, 46, 46, 3), { pos: [-56, 0, 0] }), metal(GREY.dark));
  addMesh(part, cutX([[24, -42], [33, -40], [35, -30], [33, -18], [26, -14], [24, -14], [31, -18], [33, -30], [31, -38], [22, -40], [24, -42]], CUT[0], CUT[1]), metal(GREY.light, { double: true }), { threshold: 30 });
  addMesh(part, alongX([[0, -14], [26, -14], [28, -6], [28, 26], [25, 36], [0, 36]], 48, 0.8), metal(GREY.light));
  addMesh(part, alongX([[0, 36], [24, 36], [22, 52], [17, 62], [0, 62]], 40, 0.6), metal(GREY.dark));
  addMesh(part, alongX([[13, 60], [15.5, 62], [16.5, 120], [17.5, 122], [17.5, 127], [14.5, 127], [14.5, 122], [13, 62], [13, 60]], 40), metal(GREY.mid, { double: true }));
  addMesh(part, xform(box(30, 44, 30, 2), { pos: [-28, 50, 0] }), metal(GREY.mid));
  for (const [x, z] of [[-60, 18], [-60, -18], [40, 0]]) addMesh(part, xform(new THREE.CylinderGeometry(1.3, 1.3, 40, 8), { pos: [x, 42, z] }), metal(GREY.dark), { edges: false });
  // the compressor's wheel, seen through the cutaway: it spins up with `apu`
  const wheelG = makePart("apuWheel");
  wheelG.position.x = -29;
  part.add(wheelG);
  addMesh(wheelG, alongX([[0, -11], [8, -9], [16, 0], [22, 9], [0, 9]], 36), metal(GREY.pale), { edgeOpacity: 0.5 });
  addMesh(wheelG, bladeRing(0, 8, 30, 12, 14, 1.4, 30), metal(GREY.light), { edges: false });
  const bandMat = glowMat(VEILLE);
  const band = new THREE.Mesh(xform(new THREE.TorusGeometry(14.2, 1, 8, 48), { ry: Math.PI / 2 }), bandMat);
  band.position.x = -85;
  part.add(band);
  const point = makeGlow(VEILLE, 30); // seen from far: a small veille point in the tail
  point.position.set(-85, 0, 0);
  part.add(point);
  const heat = makeGlow(WARM, 46);
  heat.position.set(138, 0, 0);
  part.add(heat);
  A.inlet = new THREE.Object3D();
  A.inlet.position.set(-28, 72, 0);
  A.exhaust = new THREE.Object3D();
  A.exhaust.position.set(127, 0, 0);
  A.gen = new THREE.Object3D();
  A.gen.position.set(-85, 0, 0);
  part.add(A.inlet, A.exhaust, A.gen);
  const set = litSet(part, wheelG);
  const w = wheel();
  return {
    group, A, part,
    update(on, time, px, cam, lit) {
      const k = clamp01(on);
      wheelG.rotation.x = spin(w, time, TAU * 3.2 * smooth(k));
      setK(bandMat, 1.6 * smooth(ramp(k, 0.4, 1)));
      band.visible = k > 0.4;
      setGlowK(point, 1.4 * smooth(ramp(k, 0.5, 1)), cam, px, 7);
      setGlowK(heat, 0.8 * smooth(ramp(k, 0.2, 1)) * (0.95 + 0.05 * Math.sin(time * 5)));
      light(set, lit);
    },
  };
}

/* ═══════════════════════════════════════ the cockpit ═══════════════════════════════════════ */
/** A sidestick on its base: pivot at the base, the grip up +y. Returns its pivot (tilt it about z) and its grip. */
function makeStick(mats) {
  const group = new THREE.Group();
  const part = makePart("stick");
  group.add(part);
  const pivot = makePart("stickPivot");
  part.add(pivot);
  addMesh(part, alongX([[0, -1], [6.5, -1], [6.5, 1], [0, 1]], 32).rotateZ(Math.PI / 2), mats.base, { edgeOpacity: 0.6 }); // the plate
  addMesh(pivot, lathe([[0, 0], [5, 0], [4, 2.4], [2.4, 4.6], [0, 4.6]], 24), mats.boot, { edgeOpacity: 0.4 });
  addMesh(pivot, lathe([[0, 4], [1.5, 4], [1.5, 7], [2.2, 7.5], [2.9, 10], [2.8, 15], [2.4, 18.5], [1.6, 19.6], [0, 20]], 28), mats.grip, { edgeOpacity: 0.7 });
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.2, 12), mats.boot);
  btn.position.set(-0.6, 19.6, 0);
  pivot.add(btn);
  const grip = new THREE.Object3D();
  grip.position.set(0, 13, 0);
  pivot.add(grip);
  return { group, part, pivot, grip };
}
const stickMats = () => ({ base: metal(GREY.dark), boot: metal(0x26292d, { rough: 0.8, metal: 0 }), grip: metal(GREY.light, { rough: 0.6, metal: 0.1 }) });

/** A computer (LRU): a box, its handle, a status strip on its front (+z). */
function makeComputer(part, x, y, z, w = 9, h = 20, d = 32, lit = true) {
  addMesh(part, xform(box(w, h, d, 0.6), { pos: [x, y, z] }), part.userData.boxMat, { edgeOpacity: 0.55 });
  addMesh(part, xform(box(w * 0.6, 1.4, 2.2, 0.3), { pos: [x, y + h * 0.32, z + d / 2 + 1] }), part.userData.handleMat, { edges: false });
  if (!lit) return null;
  const led = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.55, 1.6), glowMat(VEILLE));
  led.position.set(x, y - h * 0.2, z + d / 2 + 0.08);
  part.add(led);
  return led;
}

/** Screen faces: abstract lines, no word (canvas, ink on black). */
function screenTex(kind) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#06090b";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(233,228,216,0.8)";
  g.fillStyle = "rgba(233,228,216,0.55)";
  g.lineWidth = 4;
  if (kind === "pfd") {
    g.strokeRect(70, 50, 116, 130);
    g.beginPath();
    g.moveTo(70, 118);
    g.lineTo(186, 112);
    g.stroke();
    for (const y of [80, 150]) g.fillRect(108, y, 40, 3);
    g.strokeRect(20, 40, 34, 160);
    g.strokeRect(202, 40, 34, 160);
    g.fillRect(96, 205, 64, 22);
  } else if (kind === "nd") {
    g.beginPath();
    g.arc(128, 210, 150, Math.PI * 1.22, Math.PI * 1.78);
    g.stroke();
    g.beginPath();
    g.arc(128, 210, 80, Math.PI * 1.15, Math.PI * 1.85);
    g.stroke();
    g.beginPath();
    g.moveTo(128, 210);
    g.lineTo(128, 60);
    g.stroke();
    g.fillRect(118, 200, 20, 8);
  } else if (kind === "ecam") {
    for (const cx of [72, 184]) {
      g.beginPath();
      g.arc(cx, 76, 44, Math.PI * 0.85, Math.PI * 2.15);
      g.stroke();
      g.fillRect(cx - 18, 128, 36, 12);
    }
    for (let i = 0; i < 4; i++) g.fillRect(24, 168 + i * 20, 70 + ((i * 37) % 60), 7);
  } else {
    g.strokeRect(40, 40, 176, 120);
    g.beginPath();
    g.moveTo(40, 100);
    g.lineTo(216, 100);
    g.moveTo(128, 40);
    g.lineTo(128, 160);
    g.stroke();
    for (let i = 0; i < 3; i++) g.fillRect(40 + i * 64, 190, 44, 8);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function warnTex() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#000";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#fff";
  for (let i = 0; i < 4; i++) g.fillRect(126, 168 + i * 20, 46 + ((i * 29) % 70), 8);
  g.fillRect(24, 148, 110, 9);
  return new THREE.CanvasTexture(c);
}

function buildCockpit() {
  const group = new THREE.Group();
  const A = {};
  const C = A320.cockpit;
  const dx = C.eyeX - C.floorX; // −20: the pilots' eyes, from the floor's origin
  const S = C.seatZ;

  /* the furniture: seats, consoles, pedestal, panel, glareshield, overhead */
  const furn = makePart("cockpit");
  group.add(furn);
  const dark = metal(GREY.dark, { rough: 0.7, metal: 0.15 });
  const mid = metal(GREY.mid, { rough: 0.6, metal: 0.2 });
  for (const s of [1, -1]) {
    addMesh(furn, xform(box(50, 10, 48, 3), { pos: [dx + 12, 44, s * S] }), dark);
    addMesh(furn, xform(box(10, 66, 46, 3), { pos: [dx + 39, 84, s * S], rz: -12 * DEG }), dark); // low backs: the heads show over them
    addMesh(furn, xform(box(30, 34, 30, 2), { pos: [dx + 15, 22, s * S] }), mid); // the seat's base
    addMesh(furn, xform(box(88, 62, 22, 2), { pos: [-40, 31, s * (S + 40)] }), mid); // the side console
    addMesh(furn, xform(box(12, 30, 9, 1.5), { pos: [-92, 24, s * (S - 9)], rz: 30 * DEG }), dark); // pedals
    addMesh(furn, xform(box(12, 30, 9, 1.5), { pos: [-92, 24, s * (S + 9)], rz: 30 * DEG }), dark);
  }
  addMesh(furn, xform(box(100, 70, 36, 2), { pos: [-55, 35, 0] }), mid); // the pedestal
  addMesh(furn, xform(box(12, 60, 190, 2), { pos: [-112, 100, 0], rz: 8 * DEG }), dark); // the main panel
  const glare = xform(box(30, 9, 196, 2), { pos: [-112, 133, 0] });
  addMesh(furn, glare, dark); // the glareshield
  addMesh(furn, xform(box(10, 7, 60, 1.2), { pos: [-100, 140, 0] }), mid); // its control unit
  // thrust levers and the two engine master switches
  const levers = [];
  for (const z of [-7, 7]) {
    const lv = new THREE.Group();
    lv.position.set(-70, 70, z);
    lv.rotation.z = 14 * DEG;
    furn.add(lv);
    levers.push(lv);
  }
  const leverMat = metal(GREY.light, { rough: 0.5 });
  for (const lv of levers) {
    const shaft = new THREE.Mesh(box(2.4, 20, 2.4, 0.6), mid);
    shaft.position.y = 10;
    lv.add(shaft);
    const h = new THREE.Mesh(box(5, 4, 9, 1.5), leverMat);
    h.position.y = 21;
    lv.add(h);
  }
  const masterMat = metal(GREY.pale, { rough: 0.45 });
  const masters = [-6, 6].map((z) => {
    const sw = new THREE.Group();
    sw.position.set(-26, 70.5, z);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 6, 10), masterMat);
    st.position.y = 3;
    sw.add(st);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(1.7, 14, 10), masterMat);
    knob.position.y = 6.4;
    sw.add(knob);
    furn.add(sw);
    return sw;
  });
  addMesh(furn, xform(box(16, 1.5, 22, 0.5), { pos: [-26, 70.4, 0] }), dark, { edgeOpacity: 0.6 });

  /* the screens: two PFD, two ND, the two ECAM; warnings in signal on the upper ECAM */
  const panelTilt = 8 * DEG;
  const scr = [];
  const face = (z, y, kind) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(17, 17), new THREE.MeshBasicMaterial({ map: screenTex(kind), toneMapped: true, fog: false }));
    m.position.set(-105.6 - (y - 100) * Math.sin(panelTilt), y, z);
    m.rotation.set(0, Math.PI / 2, 0);
    m.rotateX(-panelTilt);
    m.material.color.setScalar(0.85);
    group.add(m);
    scr.push(m);
    return m;
  };
  face(76, 98, "pfd");
  face(55, 98, "nd");
  face(-55, 98, "nd");
  face(-76, 98, "pfd");
  const ecamU = face(0, 112, "ecam");
  face(0, 90, "sd");
  const warnMat = new THREE.MeshBasicMaterial({ map: warnTex(), color: SIGNAL.clone(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false });
  const warn = new THREE.Mesh(new THREE.PlaneGeometry(17, 17), warnMat);
  warn.position.copy(ecamU.position).x += 0.05;
  warn.quaternion.copy(ecamU.quaternion);
  group.add(warn);
  // the two N1 needles on the upper ECAM (they read n1L, n1R)
  const needleMat = glowMat(INK);
  const needles = [3.3, -3.3].map((zz) => {
    const pv = new THREE.Group();
    pv.position.set(ecamU.position.x + 0.1, ecamU.position.y + 3.5, zz);
    const n = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 3.6).translate(0, 1.8, 0), needleMat);
    n.rotation.y = Math.PI / 2;
    pv.add(n);
    group.add(pv);
    return pv;
  });

  /* the master warnings on the glareshield: a slow signal pulse ("terrain, remontez") */
  const mwMat = glowMat(SIGNAL);
  const mws = [62, -62].map((z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), mwMat);
    m.position.set(-96.8, 135, z);
    m.rotation.y = Math.PI / 2;
    group.add(m);
    const g = makeGlow(SIGNAL, 16);
    g.position.set(-95, 135, z);
    group.add(g);
    return g;
  });
  addMesh(furn, xform(box(1, 4, 7.4, 0.3), { pos: [-97.6, 135, 62] }), dark, { edges: false });
  addMesh(furn, xform(box(1, 4, 7.4, 0.3), { pos: [-97.6, 135, -62] }), dark, { edges: false });
  A.glare = new THREE.Object3D();
  A.glare.position.set(-96, 135, 0);
  A.ecam = new THREE.Object3D();
  A.ecam.position.copy(ecamU.position);
  group.add(A.glare, A.ecam);

  /* the overhead: a sloped panel of pushbuttons; the ditching button (a guarded pushbutton, OFF, never pressed) */
  const over = new THREE.Group();
  over.position.set(-40, 202, 0);
  over.rotation.z = 15 * DEG;
  group.add(over);
  const overMat = metal(0x6a7076, { rough: 0.62, metal: 0.15 }); // lit from below by the cabin: a mid grey, the buttons pale
  addMesh(furn, xform(box(118, 5, 66, 1.5), { pos: [-40, 202, 0], rz: 15 * DEG }), overMat);
  const btnGeo = [];
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 8; j++) {
      if (i === 6 && j === 2) continue;
      btnGeo.push(bare(new THREE.BoxGeometry(3, 1.6, 3).translate(-48 + i * 11.5, -3.2, -26 + j * 7.4)));
    }
  addMesh(furn, xform(mergeGeometries(btnGeo), { pos: [-40, 202, 0], rz: 15 * DEG }), metal(GREY.pale, { rough: 0.55, metal: 0.1 }), { edgeColor: 0x1d2226, edgeOpacity: 0.7 });
  const DB = [-48 + 6 * 11.5, -3.6, -26 + 2 * 7.4]; // the ditching button, in the panel's frame
  const dbMat = metal(GREY.dark, { rough: 0.55, metal: 0.1 }); // OFF: dark, never lit
  const ditch = new THREE.Mesh(box(3.4, 1.8, 3.4, 0.4), dbMat);
  ditch.position.set(DB[0], DB[1], DB[2]);
  over.add(ditch);
  const guard = fatLine([[DB[0] - 2.4, DB[1] - 1.6, DB[2] - 2.4], [DB[0] + 2.4, DB[1] - 1.6, DB[2] - 2.4], [DB[0] + 2.4, DB[1] - 1.6, DB[2] + 2.4], [DB[0] - 2.4, DB[1] - 1.6, DB[2] + 2.4], [DB[0] - 2.4, DB[1] - 1.6, DB[2] - 2.4]], { color: BRAND.ink, width: 1.8, opacity: 0.6 });
  over.add(guard);
  const ringPts = [];
  for (let j = 0; j <= 40; j++) ringPts.push([DB[0] + 5.4 * Math.cos((j / 40) * TAU), DB[1] - 2.2, DB[2] + 5.4 * Math.sin((j / 40) * TAU)]);
  const ring = fatLine(ringPts, { color: BRAND.ink, width: 4, opacity: 1 });
  ring.renderOrder = 7;
  over.add(ring);
  A.overhead = new THREE.Object3D();
  A.overhead.position.set(DB[0], DB[1] - 1, DB[2]);
  over.add(A.overhead);

  /* the two sidesticks, on the outboard consoles */
  const sticks = [1, -1].map((s) => {
    const st = makeStick(stickMats());
    st.group.position.set(-46, 62, s * (S + 40));
    group.add(st.group);
    return st;
  });
  A.stickC = sticks[0].grip;
  A.stickF = sticks[1].grip;

  /* the avionics bay under the floor: the flight computers (top shelf, veille) and the rest */
  const bay = makePart("computers");
  bay.userData.boxMat = metal(GREY.light, { rough: 0.55, metal: 0.2 });
  bay.userData.handleMat = metal(GREY.dark);
  const BX = A320.avionics.x - C.floorX;
  const BY = A320.avionics.y - C.floorY;
  group.add(bay);
  const rackMat = metal(GREY.dark);
  addMesh(bay, xform(box(118, 3, 42, 0.8), { pos: [BX, BY - 2, -16] }), rackMat);
  addMesh(bay, xform(box(118, 3, 42, 0.8), { pos: [BX, BY + 24, -16] }), rackMat);
  for (const x of [-58, 58]) addMesh(bay, xform(box(3, 76, 42, 0.8), { pos: [BX + x, BY + 10, -16] }), rackMat);
  const leds = [];
  for (let i = 0; i < 7; i++) leds.push(makeComputer(bay, BX - 45 + i * 15, BY + 36.5, -18, 11, 22, 34, true));
  const other = makePart("bay-rest");
  other.userData.boxMat = metal(GREY.mid, { rough: 0.6, metal: 0.2 });
  other.userData.handleMat = metal(GREY.dark);
  group.add(other);
  for (let i = 0; i < 5; i++) makeComputer(other, BX - 42 + i * 21, BY + 10.5, -18, 17, 22, 34, false);
  A.computers = new THREE.Object3D();
  A.computers.position.set(BX, BY + 36, 0);
  group.add(A.computers);
  // the floor and the bay's outline: fine lines (what holds them is glass: avion.js)
  group.add(fatLine([[-120, 0.5, 100], [40, 0.5, 100], [40, 0.5, -100], [-120, 0.5, -100], [-120, 0.5, 100]], { color: BRAND.ink, width: 1.8, opacity: 0.28 }));

  /* the two pilots of glass, seated: captain left (+z), first officer right (−z); they face −x */
  const FIG = { x: dx + 16, y: -42 };
  const pilots = [S, -S].map((z) => {
    const f = makeFigure({ shell: true, hands: "flat", order: 12, glassK: 0.85 });
    f.ghost(true);
    f.group.rotation.y = -Math.PI / 2;
    f.group.position.set(FIG.x, FIG.y, z);
    f.leg("L", V(9.5, 64, 80));
    f.leg("R", V(-9.5, 64, 80));
    f.reach("L", V(11, 97, 30));
    f.reach("R", V(-11, 97, 30));
    f.lean(-7);
    group.add(f.group);
    return f;
  });
  A.capt = new THREE.Object3D();
  A.capt.position.set(FIG.x - 2, FIG.y + 166, S);
  A.fo = new THREE.Object3D();
  A.fo.position.set(FIG.x - 2, FIG.y + 166, -S);
  group.add(A.capt, A.fo);

  /* where the binder sits in the first officer's hands: turned so its pages face him */
  A.lap = new THREE.Object3D();
  A.lap.position.set(FIG.x - 34, 74, -S);
  A.lap.rotation.set(0, Math.PI / 2, -52 * DEG, "ZYX");
  group.add(A.lap);
  A.lap.updateMatrix();
  const lapPt = (bx, by, bz) => V(bx, by, bz).applyMatrix4(A.lap.matrix);
  const holdClosed = [lapPt(1, 0.5, 13), lapPt(21, 0.5, 13)]; // FO's left hand, right hand (cockpit frame)
  const holdOpen = [lapPt(-21, 0.5, 12), lapPt(21, 0.5, 12)];

  /* the angle-of-attack limit: an arc beside the nose, outside (the plane's frame), its stop, the needle */
  const LIM = { r: 800, max: 17.5 };
  A.limit = new THREE.Object3D();
  A.limit.position.set(A320.fuse.noseX - C.floorX + 200, -C.floorY, 300);
  group.add(A.limit);
  const arc = [];
  for (let j = 0; j <= 36; j++) {
    const a = (-4 + ((LIM.max + 4) * j) / 36) * DEG;
    arc.push([-LIM.r * Math.cos(a), LIM.r * Math.sin(a), 0]);
  }
  const limitArc = fatLine(arc, { color: BRAND.veille, width: 8, opacity: 1, hdr: 1.5 });
  const am = LIM.max * DEG;
  const stopBar = fatLine([[-(LIM.r - 90) * Math.cos(am), (LIM.r - 90) * Math.sin(am), 0], [-(LIM.r + 90) * Math.cos(am), (LIM.r + 90) * Math.sin(am), 0]], { color: BRAND.veille, width: 12, opacity: 1, hdr: 1.7 });
  const beyond = [];
  for (let j = 0; j <= 14; j++) {
    const a = (LIM.max + (12 * j) / 14) * DEG;
    beyond.push([-LIM.r * Math.cos(a), LIM.r * Math.sin(a), 0]);
  }
  const beyondLine = fatLine(beyond, { color: BRAND.ink, width: 2, opacity: 0.35, dashed: true, dashSize: 30, gapSize: 24 });
  const zeroLine = fatLine([[-(LIM.r - 120), 0, 0], [-(LIM.r + 60), 0, 0]], { color: BRAND.ink, width: 2, opacity: 0.5 });
  const needle = new THREE.Group();
  const needleLine = fatLine([[0, 0, 0], [-(LIM.r + 150), 0, 0]], { color: BRAND.ink, width: 4, opacity: 1 });
  needle.add(needleLine);
  const hub = makeGlow(INK, 60);
  A.limit.add(limitArc, stopBar, beyondLine, zeroLine, needle, hub);
  const limitLines = [limitArc, stopBar, beyondLine, zeroLine, needleLine];

  const capStick = litSet(sticks[0].part, sticks[0].pivot);
  const compSet = litSet(bay);
  const ledMats = leds.map((l) => l.material);

  // scratch (no allocation in update)
  const T = [V(), V(), V(), V()];
  const D1 = V();
  const D2 = V();
  const toFig = (f, X, Y, Z, out) => out.set(Z - f.group.position.z, Y - f.group.position.y, -(X - f.group.position.x));
  const gripAt = (st, a, out) => out.set(st.group.position.x + 13 * Math.sin(a), st.group.position.y + 13 * Math.cos(a), st.group.position.z);
  const HAND_DIR = V(0, -0.35, 1).normalize(); // fingers forward, a little down (figure's frame)
  const PALM_DOWN = V(0, -1, 0);
  const lay = { dir: HAND_DIR, palm: PALM_DOWN };
  const palmIn = { L: V(-1, -0.4, 0).normalize(), R: V(1, -0.4, 0).normalize() };
  const layStick = { L: { dir: V(0, 0.15, 1).normalize(), palm: palmIn.L }, R: { dir: V(0, 0.15, 1).normalize(), palm: palmIn.R } };
  const layBook = { dir: V(0, 0.6, 0.4).normalize(), palm: V(0, 0.4, -1).normalize() };
  const REST = { L: V(11, 97, 30), R: V(-11, 97, 30) };

  function update(p, time, px, ctx) {
    void ctx;
    /* the sticks: the captain's pulled aft to its stop (16°) */
    const aC = 16 * DEG * clamp01(p.stick);
    sticks[0].pivot.rotation.z = -aC;
    sticks[1].pivot.rotation.z = 0;
    /* masters: 0 on (up) → 1 off (down, aft) */
    const mk = clamp01(p.masters);
    for (const m of masters) m.rotation.z = -100 * DEG * smooth(mk);
    /* screens, warnings, the needles */
    warnMat.color.copy(SIGNAL).multiplyScalar(1.5 * clamp01(p.ecam));
    warn.visible = p.ecam > 0.01;
    needles[0].rotation.x = -(-130 + 2.6 * Math.max(0, p.n1L)) * DEG;
    needles[1].rotation.x = -(-130 + 2.6 * Math.max(0, p.n1R)) * DEG;
    setK(needleMat, 1.1);
    const al = clamp01(p.alarm) * (0.5 + 0.5 * Math.sin(time * TAU * 0.8 - Math.PI / 2));
    setK(mwMat, 0.25 + 2 * al);
    mws.forEach((g) => setGlowK(g, 1.4 * al));
    /* the ditching button: an ink ring when named — never lit */
    const on9 = Math.round(p.named) === 9 ? 1 : 0;
    ring.visible = on9 > 0;
    /* the computers: veille in "loi normale", a slow signal flicker below 0.3 */
    const law = clamp01(p.law);
    const bad = clamp01((0.3 - law) / 0.3);
    for (let i = 0; i < ledMats.length; i++) {
      const fl = 0.5 + 0.5 * Math.sin(time * TAU * 1.1 + i * 1.9);
      ledMats[i].color.copy(VEILLE).lerp(SIGNAL, bad * fl).multiplyScalar(1.6 * Math.max(law, 0.35 * bad));
    }
    light(capStick, Math.round(p.named) === 7 ? 1 : 0);
    light(compSet, Math.round(p.named) === 8 ? 1 : 0);
    /* the limit */
    const lim = clamp01(p.limit);
    A.limit.visible = lim > 0.01;
    if (A.limit.visible) {
      for (const l of limitLines) setOp(l.material, lim);
      needle.rotation.z = -LIM.max * DEG * clamp01(p.aoa);
      setGlowK(hub, 1.2 * lim);
    }
    /* the pilots */
    const vis = clamp01(p.pilots);
    for (const f of pilots) {
      f.group.visible = vis > 0.01;
      f.body.uniforms.uAmount.value = vis;
    }
    if (vis > 0.01) {
      const pf = smooth(clamp01(p.pf));
      const book = smooth(clamp01(p.qrh));
      const open = smooth(clamp01(p.page));
      // the captain: left hand to his stick when he flies, right hand on the thrust levers
      const cap = pilots[0];
      gripAt(sticks[0], aC, T[0]).x += 3;
      T[0].y += 1;
      toFig(cap, T[0].x, T[0].y, T[0].z, T[1]);
      T[2].copy(REST.L).lerp(T[1], pf);
      cap.reach("L", T[2], null, pf > 0.5 ? layStick.L : lay);
      toFig(cap, -64, 94, 9, T[3]);
      cap.reach("R", T[3], null, lay);
      // the first officer: right hand on his stick while he flies, then the binder in both hands
      const fo = pilots[1];
      gripAt(sticks[1], 0, T[0]).x += 3;
      T[0].y += 1;
      toFig(fo, T[0].x, T[0].y, T[0].z, T[1]);
      D1.copy(holdClosed[1]).lerp(holdOpen[1], open);
      toFig(fo, D1.x, D1.y, D1.z, T[2]);
      T[3].copy(REST.R).lerp(T[1], 1 - pf).lerp(T[2], book * pf);
      fo.reach("R", T[3], null, book * pf > 0.5 ? layBook : 1 - pf > 0.5 ? layStick.R : lay);
      D2.copy(holdClosed[0]).lerp(holdOpen[0], open);
      toFig(fo, D2.x, D2.y, D2.z, T[2]);
      toFig(fo, -64, 94, -9, T[1]);
      T[3].copy(REST.L).lerp(T[1], 1 - pf).lerp(T[2], book * pf);
      fo.reach("L", T[3], null, book * pf > 0.5 ? layBook : lay);
    }
    void px;
  }

  return { group, A, update };
}

/* ═══════════════════════════════════════ the check-list (QRH) ═══════════════════════════════════════ */
const PAGE = { w: 21, h: 29, px: 22 }; // cm, canvas pixels per cm
// three parts + the separate ditching check-list; `apu`: the APU line (far down part 1); `gap`: the hole in part 3
const PARTS = [
  { title: "1 · RALLUMER", n: 16, apu: 13 },
  { title: "2 · PLANER", n: 9 },
  { title: "3 · SE POSER", n: 12, gap: [4, 2] },
  { title: "AMERRISSAGE", n: 10 },
];
const LINE0 = 6.4; // cm from the top: the first item
const STEP = 1.32; // cm between items
const itemY = (i, part) => LINE0 + (i + (part.gap && i >= part.gap[0] ? part.gap[1] : 0)) * STEP;

function pageTex(part, seedK) {
  const W = PAGE.w * PAGE.px;
  const H = PAGE.h * PAGE.px;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#c2bcae";
  g.fillRect(0, 0, W, H);
  let s = seedK;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 2500; k++) {
    g.fillStyle = r() < 0.5 ? "rgba(40,34,26,0.05)" : "rgba(255,250,240,0.05)";
    g.fillRect(r() * W, r() * H, 2 + r() * 3, 2 + r() * 3);
  }
  const ink = "rgba(28,26,23,";
  if (part) {
    g.fillStyle = ink + "0.9)";
    g.fillRect(1.2 * PAGE.px, 1.4 * PAGE.px, W - 2.4 * PAGE.px, 0.12 * PAGE.px);
    g.font = `700 ${Math.round(2.2 * PAGE.px)}px "Barlow Condensed", "Arial Narrow", sans-serif`;
    g.textBaseline = "alphabetic";
    g.fillText(part.title, 1.2 * PAGE.px, 4.2 * PAGE.px);
    g.fillRect(1.2 * PAGE.px, 4.9 * PAGE.px, W - 2.4 * PAGE.px, 0.06 * PAGE.px);
    for (let i = 0; i < part.n; i++) {
      const y = itemY(i, part) * PAGE.px;
      const lw = (4 + r() * 5) * PAGE.px;
      const rw = (2.5 + r() * 3) * PAGE.px;
      g.fillStyle = ink + "0.7)";
      g.fillRect(2.2 * PAGE.px, y - 0.22 * PAGE.px, lw, 0.42 * PAGE.px);
      g.fillRect(W - 1.4 * PAGE.px - rw, y - 0.22 * PAGE.px, rw, 0.42 * PAGE.px);
      g.fillStyle = ink + "0.45)";
      for (let x = 2.2 * PAGE.px + lw + 0.4 * PAGE.px; x < W - 1.8 * PAGE.px - rw; x += 0.42 * PAGE.px) g.fillRect(x, y, 0.12 * PAGE.px, 0.12 * PAGE.px);
      g.fillStyle = ink + "0.55)";
      g.fillRect(1.2 * PAGE.px, y - 0.2 * PAGE.px, 0.4 * PAGE.px, 0.4 * PAGE.px);
    }
  } else {
    g.fillStyle = ink + "0.22)";
    for (let i = 0; i < 18; i++) g.fillRect(2.2 * PAGE.px, (LINE0 + i * STEP) * PAGE.px, (6 + r() * 10) * PAGE.px, 0.36 * PAGE.px);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function buildQrh() {
  const group = new THREE.Group();
  const A = {};
  const part = makePart("qrh");
  group.add(part);
  const coverMat = metal(GREY.mid, { rough: 0.6, metal: 0.05 });
  const paperMat = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1 });
  // the back cover and the spine with its rings
  addMesh(part, xform(box(22.8, 0.5, 30.8, 0.2), { pos: [11.2, 0.25, 0] }), coverMat);
  const ringMat = metal(GREY.pale, { rough: 0.35, metal: 0.5 });
  for (const z of [-10, 0, 10]) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.25, 8, 24, Math.PI), ringMat);
    r.position.set(0, 0.6, z);
    group.add(r);
  }
  const backTex = pageTex(null, 3);
  const pageGeo = new THREE.PlaneGeometry(PAGE.w, PAGE.h).rotateX(-Math.PI / 2).translate(0.6 + PAGE.w / 2, 0, 0);
  const backGeo = new THREE.PlaneGeometry(PAGE.w, PAGE.h).rotateX(Math.PI / 2).translate(0.6 + PAGE.w / 2, 0, 0);
  // leaves: 0 the front cover, 1–3 the three parts' first pages (each with its tab); they turn about the spine (z)
  const leaves = [];
  const tabMats = [];
  for (let i = 0; i < 4; i++) {
    const pivot = new THREE.Group();
    group.add(pivot);
    const leaf = { pivot, i };
    if (i === 0) {
      const cov = new THREE.Mesh(xform(box(22.8, 0.5, 30.8, 0.2), { pos: [11.4, 0.25, 0] }), coverMat);
      pivot.add(cov);
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.4).rotateX(-Math.PI / 2), metal(GREY.pale, { rough: 0.6 }));
      stripe.position.set(12, 0.52, -9);
      pivot.add(stripe);
    } else {
      const P = PARTS[i - 1];
      const front = new THREE.Mesh(pageGeo, paperMat(pageTex(P, 17 + i * 31)));
      const back = new THREE.Mesh(backGeo, paperMat(backTex));
      pivot.add(front, back);
      // the tab: on the outer edge, a little lower for each part
      const tm = metal(0xd6d0c2, { rough: 0.7, metal: 0 });
      tm.emissive = new THREE.Color(0, 0, 0);
      const tab = new THREE.Mesh(box(2.2, 0.16, 3.6, 0.05), tm);
      tab.position.set(0.6 + PAGE.w + 1, 0, -11 + (i - 1) * 5.5);
      pivot.add(tab);
      tabMats.push(tm);
      A[`tab${i}`] = tab;
      // the crew's progress: a veille bar down the left margin
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5), glowMat(VEILLE, { normal: true }));
      bar.position.set(1.15, 0.03, -PAGE.h / 2 + itemY(0, P) - 0.5);
      pivot.add(bar);
      leaf.bar = bar;
      leaf.part = P;
      if (P.apu) {
        const band = new THREE.Mesh(new THREE.PlaneGeometry(PAGE.w - 1.6, 1.0).rotateX(-Math.PI / 2), glowMat(VEILLE, { normal: true, opacity: 0.4 }));
        band.position.set(0.6 + PAGE.w / 2, 0.025, -PAGE.h / 2 + itemY(P.apu, P));
        pivot.add(band);
        leaf.apu = band;
        A.apu = new THREE.Object3D();
        A.apu.position.copy(band.position);
        pivot.add(A.apu);
      }
      if (P.gap) {
        const y0 = -PAGE.h / 2 + itemY(P.gap[0], P) - P.gap[1] * STEP - 0.25;
        const y1 = -PAGE.h / 2 + itemY(P.gap[0], P) - 0.75;
        const x0 = 1.6;
        const x1 = PAGE.w - 0.6;
        const out = fatLine([[x0, 0.04, y0], [x1, 0.04, y0], [x1, 0.04, y1], [x0, 0.04, y1], [x0, 0.04, y0]], { color: BRAND.signal, width: 4, opacity: 1, hdr: 1.3 });
        pivot.add(out);
        leaf.gap = out;
      }
    }
    leaves.push(leaf);
  }
  // the separate ditching check-list: a card that comes onto the right-hand page (page 3 → 4)
  const card = new THREE.Group();
  const cardFront = new THREE.Mesh(pageGeo, paperMat(pageTex(PARTS[3], 211)));
  card.add(cardFront);
  const cardEdge = fatLine([[0.6, 0.02, -PAGE.h / 2], [0.6 + PAGE.w, 0.02, -PAGE.h / 2], [0.6 + PAGE.w, 0.02, PAGE.h / 2], [0.6, 0.02, PAGE.h / 2], [0.6, 0.02, -PAGE.h / 2]], { color: BRAND.ink, width: 1.8, opacity: 0.6 });
  card.add(cardEdge);
  group.add(card);
  A.page = new THREE.Object3D();
  A.page.position.set(0, 1, 0);
  group.add(A.page);
  const tabSets = tabMats;
  const total = PARTS[0].n + PARTS[1].n + PARTS[2].n;

  function update(p, time) {
    const pg = Math.max(0, p.page);
    /* leaves 0..2 turn when the page passes 1, 2, 3 (leaf i turns between i and i + 1) */
    for (let i = 0; i < 4; i++) {
      const L = leaves[i];
      const u = i < 3 ? smooth(clamp01(pg - i)) : 0;
      const yR = 0.55 + 0.09 * (3 - i);
      const yL = 0.55 + 0.09 * i;
      L.pivot.rotation.z = Math.PI * u;
      L.pivot.position.y = lerp(yR, yL, u) + Math.sin(Math.PI * u) * 1.2;
    }
    /* the ditching card */
    const cu = smooth(clamp01(pg - 3));
    card.visible = cu > 0.01;
    card.position.set(lerp(26, 0, cu), 0.95 + 1.5 * Math.sin(Math.PI * cu), 0);
    /* the crew's progress, over the three parts */
    const done = clamp01(p.done) * total;
    let from = 0;
    for (let i = 1; i <= 3; i++) {
      const L = leaves[i];
      const n = Math.max(0, Math.min(L.part.n, done - from));
      const len = n > 0 ? itemY(Math.max(0, Math.ceil(n) - 1), L.part) - itemY(0, L.part) + 1 : 0;
      L.bar.visible = len > 0.01;
      L.bar.scale.z = Math.max(0.01, len);
      from += L.part.n;
      if (L.apu) {
        L.apu.visible = p.apuMark > 0.01;
        L.apu.material.opacity = 0.45 * clamp01(p.apuMark);
      }
      if (L.gap) {
        L.gap.visible = p.gap > 0.01;
        setOp(L.gap.material, clamp01(p.gap) * (0.85 + 0.15 * Math.sin(time * 2.4)));
      }
    }
    const nm = Math.round(p.named);
    for (let i = 0; i < 3; i++) tabSets[i].emissive.copy(VEILLE).multiplyScalar(nm === 10 + i ? 0.9 : 0);
  }
  return { group, A, update };
}

/* ═══════════════════════════════════════ the bench: the test stand, the lineup ═══════════════════════════════════════ */
function buildStand(birdMat, gooseMat) {
  const group = new THREE.Group();
  const A = {};
  const part = makePart("stand");
  group.add(part);
  const steel = metal(GREY.dark, { rough: 0.62, metal: 0.25 });
  const MX = -200; // the engine's inlet lip on the stand
  const MY = 150;
  // the gantry: rails, two posts, a beam, the thrust frame the engine hangs from
  for (const z of [-170, 170]) {
    addMesh(part, xform(box(560, 12, 22, 2), { pos: [20, 6, z] }), steel);
    addMesh(part, xform(box(24, 330, 24, 2), { pos: [20, 165, z] }), steel);
    addMesh(part, xform(box(80, 10, 50, 2), { pos: [20, 5, z] }), steel);
  }
  addMesh(part, xform(box(30, 26, 364, 2), { pos: [20, 330, 0] }), steel);
  addMesh(part, xform(box(300, 18, 30, 2), { pos: [MX + 200, 300, 0] }), steel);
  for (const x of [MX + 90, MX + 270]) addMesh(part, xform(box(14, 50, 20, 2), { pos: [x, 268, 0] }), steel);
  A.mount = new THREE.Object3D();
  A.mount.position.set(MX, MY, 0);
  group.add(A.mount);
  // the gun: a long barrel, its air tank, a cart; it slides up or down to aim (blades / core)
  const gunG = makePart("gun");
  group.add(gunG);
  const gunMat = metal(GREY.mid, { rough: 0.5, metal: 0.35 });
  const muzzleX = MX - 185;
  addMesh(gunG, xform(alongX([[0, 0], [11, 0], [11, 380], [13.5, 382], [13.5, 392], [9, 392], [9, 380], [0, 380]], 40, 0.6), { pos: [muzzleX - 392, 0, 0] }), gunMat);
  addMesh(gunG, xform(alongX([[0, -60], [30, -56], [32, 0], [32, 70], [28, 80], [0, 82]], 40, 1), { pos: [muzzleX - 470, 0, 0] }), gunMat);
  const col = new THREE.Mesh(box(30, 1, 30, 1), steel);
  group.add(col);
  addMesh(part, xform(box(260, 40, 90, 3), { pos: [muzzleX - 300, 20, 0] }), steel);
  A.muzzle = new THREE.Object3D();
  A.muzzle.position.set(muzzleX, 0, 0);
  gunG.add(A.muzzle);
  const aimLine = fatLine([[muzzleX + 2, 0, 0], [MX + 84, 0, 0]], { color: BRAND.ink, width: 2, opacity: 0.55, dashed: true, dashSize: 10, gapSize: 8 });
  gunG.add(aimLine);
  // the two birds compared, on a small table in front of the engine: the test's 1.8 kg, a 3.6 kg goose
  const cmp = new THREE.Group();
  cmp.position.set(MX - 250, 0, 175);
  group.add(cmp);
  const tablePart = makePart("cmp");
  cmp.add(tablePart);
  addMesh(tablePart, xform(box(130, 90, 70, 2), { pos: [0, 45, 0] }), steel);
  const small = new THREE.Mesh(alongX([[0, -16], [7, -12], [9.5, -2], [8.5, 8], [5, 13], [0, 15]], 24), birdMat);
  small.scale.z = 0.85;
  small.position.set(-34, 99, 0);
  cmp.add(small);
  const big = makeGoose(gooseMat, metal(0x2c2f33, { rough: 0.7, metal: 0 }));
  big.group.scale.setScalar(0.9);
  big.wings.forEach((w, i) => {
    w.rotation.set((i ? 1 : -1) * 0.25, (i ? 1 : -1) * 1.45, 0); // folded along the back
    w.scale.setScalar(0.7);
  });
  big.group.position.set(26, 104, 0);
  cmp.add(big.group);
  return {
    group, A,
    update(p, eng) {
      const aim = clamp01(p.aimCore);
      const y = MY + lerp(62, 32, aim);
      gunG.position.y = y;
      col.position.set(muzzleX - 300, 40 + (y - 52) / 2, 0);
      col.scale.y = Math.max(1, y - 52);
      const g = clamp01(p.gun);
      aimLine.visible = g < 0.5;
      setOp(aimLine.material, 1 - smooth(ramp(g, 0.02, 0.3)));
      A.bird = eng.shot;
      const c = clamp01(p.birdCmp);
      cmp.visible = c > 0.01;
      cmp.scale.setScalar(Math.max(0.01, smooth(c)));
    },
  };
}

export function buildSystemes() {
  const engineB = buildEngine();
  const engine = { group: engineB.group, A: engineB.A };

  const apuB = buildApu();
  const apu = { group: apuB.group, A: apuB.A };

  const cockpitB = buildCockpit();
  const cockpit = { group: cockpitB.group, A: cockpitB.A };

  const qrhB = buildQrh();
  const qrh = { group: qrhB.group, A: qrhB.A };

  const birdMat = metal(GREY.light, { rough: 0.7, metal: 0 });
  const gooseMat = metal(0x6f6d69, { rough: 0.78, metal: 0 });
  gooseMat.emissive.copy(SIGNAL).multiplyScalar(0.04);
  const standB = buildStand(birdMat, gooseMat);
  const stand = { group: standB.group, A: standB.A };
  stand.A.bird = engineB.shot;

  /* the lineup: four places, lit one by one (a veille ring under each) */
  const lineup = { group: new THREE.Group(), A: {} };
  const SLOT = [-390, -130, 130, 390];
  const rings = SLOT.map((x, i) => {
    const a = new THREE.Object3D();
    a.position.set(x, 0, 0);
    lineup.group.add(a);
    lineup.A[`slot${i + 1}`] = a;
    const m = new THREE.Mesh(new THREE.RingGeometry(104, 111, 96).rotateX(-Math.PI / 2), glowMat(VEILLE, { double: true }));
    m.position.set(x, 0.6, 0);
    lineup.group.add(m);
    return m;
  });
  const apu2 = buildApu();
  apu2.group.position.set(0, 60, 0);
  apu2.group.rotation.y = -18 * DEG;
  lineup.A.slot1.add(apu2.group);
  // a sidestick on its console and three of its computers (×2.2: the lineup is read at a glance)
  const s2 = new THREE.Group();
  s2.scale.setScalar(2.2);
  s2.rotation.y = -20 * DEG;
  lineup.A.slot2.add(s2);
  const s2part = makePart("slot2");
  s2.add(s2part);
  s2part.userData.boxMat = metal(GREY.light, { rough: 0.55, metal: 0.2 });
  s2part.userData.handleMat = metal(GREY.dark);
  addMesh(s2part, xform(box(30, 26, 16, 1.2), { pos: [-6, 13, 10] }), metal(GREY.mid));
  const stick2 = makeStick(stickMats());
  stick2.group.position.set(-10, 26, 10);
  s2.add(stick2.group);
  const leds2 = [0, 1, 2].map((i) => makeComputer(s2part, -13 + i * 12, 11, -14, 10, 22, 26, true));
  const cable = fatLine([[-10, 26, 10], [-10, 30, -2], [-1, 24, -4]], { color: BRAND.veille, width: 3, opacity: 0.9 });
  s2.add(cable);
  const slotSets = [null, litSet(s2part, stick2.part, stick2.pivot)];
  // world.js hangs a raft and a ferry at their true size on slots 3 and 4: each slot is fitted, once, to ≈ 2.3 m
  const BB = new THREE.Box3();
  const BS = new THREE.Vector3();
  const fitted = [false, false, false, false];
  const fit = (i) => {
    const a = lineup.A[`slot${i + 1}`];
    if (fitted[i] || a.children.length === 0) return;
    a.scale.setScalar(1);
    a.updateMatrixWorld(true);
    BB.setFromObject(a);
    BB.getSize(BS);
    const L = Math.max(BS.x, BS.z);
    if (L > 0) a.scale.setScalar(Math.min(1, 230 / L));
    fitted[i] = true;
  };

  return {
    engine, apu, cockpit, qrh, stand, lineup,
    update(p, time, px, ctx) {
      const bench = !!ctx?.bench;
      const cam = ctx?.camera ?? null;
      engineB.update(p, time, px, ctx);
      apuB.update(p.apu, time, px, cam, Math.round(p.named) === 6 ? 1 : 0);
      qrh.group.visible = bench || p.qrh > 0.02;
      if (qrh.group.visible) qrhB.update(p, time);
      if (bench) {
        standB.update(p, engineB);
        fit(2);
        fit(3);
        const k = Math.max(0, p.listK);
        for (let i = 0; i < 4; i++) {
          const u = smooth(clamp01(k - i));
          rings[i].visible = u > 0.01;
          setK(rings[i].material, 1.3 * u);
          if (slotSets[i]) light(slotSets[i], u);
        }
        apu2.update(smooth(clamp01(k)), time, px, null, smooth(clamp01(k)));
        for (const l of leds2) setK(l.material, 0.4 + 1.2 * smooth(clamp01(k - 1)));
        setOp(cable.material, 0.3 + 0.7 * smooth(clamp01(k - 1)));
      } else {
        cockpitB.update(p, time, px, ctx);
      }
    },
  };
}
