// DOSSIER 050 — Plaque à induction : THE HOB, the system. Hob frame (plan.js): origin = centre of the glass's top face,
// x right, z toward you, y up. Solid: black vitroceramic glass (SATIN: a gloss coat would mirror the studio's softbox
// as one huge tinted patch over the whole plate), the sheet-metal case, under the glass four inductors (flat copper
// spirals on a mica disc, a crown of ferrite bars, a carrier), the power board (rectifier, two capacitors, a heat sink and
// its transistors, a copper track), the fan, the mains lead; on the glass the printed zones, the slider, one 7-segment
// display per front zone. And what is not an object, drawn veille on its conductor: the current (lead → board → riser →
// the hero coil's turns), the field of the hero zone (loops around the winding, up through the glass into the base and
// back through the ferrite — it reverses twice a second: the slowed strobe of the principle); in signal the heat the
// glass takes from the base by contact (a ring on the top, and a warm zone in the glass's cut face).
//
//   buildHob() → { root, parts, A, update(p, time, px) }
//   p = { see, on, field, coil, flow, glassHeat, sensor, blink, power, hot, explode, cut, fan, litBoard, litCoil, litGlass, litSensor }
//   A (anchors, hob frame, they follow the exploded view): board, coil (hero coil centre), glass (hero zone on the glass),
//     sensor, display (hero display), displayHand (the empty zone's display), cord, fan
//
// THE CUT (`cut`): everything that crosses the plane z = ZONES.pan.z (the front zones' centres) is built three times —
// whole, its back half, its front half. cut 0 shows the whole pieces; as soon as cut > 0 the halves replace them and the
// front halves (with all that stands wholly in front) drop away under the hob (y −45·cut²), gone at 1. What stays shows
// its section: the glass's slice (a light line, warm under the base), the copper turns as a row of squares, the ferrite.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, glass, asShell, setGlow, explode, cyl, box, plate, anchor, fatLine } from "@kit/build3d.js";
import { GLASS, CASE, ZONES, COIL, SENSOR, DISPLAYS, SLIDER, BOARD, FAN, CORD, EXPLODE, HEAT } from "./plan.js";

const T = GLASS.thick;
const CZ = ZONES.pan.z; // the cut plane
const Y_COIL = -T - COIL.gap - COIL.h / 2; // the coils' mid-plane
const TAU = Math.PI * 2;
const OMEGA = TAU * 1; // the slowed field: one cycle a second, it reverses twice
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const WHITE = new THREE.Color(1, 1, 1);

// three greys, and the copper lighter than all (the hero of the hob)
const C = {
  glass: 0x0a0b0d, caseOut: 0x5b6167, caseIn: 0x41464c, board: 0x2c3a33, track: 0x7a5a40, sink: 0xa9afb4, cap: 0x464c53,
  dark: 0x1e2125, copper: 0xc89c74, copperCut: 0xf0cfa8, ferrite: 0x3a3d42, mica: 0x8e8a80, tray: 0x2a2d32, cord: 0x25282c,
  fanBody: 0x30353a, blade: 0x80878e, sensor: 0x9a9fa4,
};

/* ── a current drawn on its conductor: bands of light that move along a tube (uv.x in METRES along it) ── */
function flowMat(color, period = 2) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uK: { value: 0 }, uPhase: { value: 0 }, uPeriod: { value: period },
      uReveal: { value: 1e3 }, uScale: { value: 1 }, uBase: { value: 0.22 }, uAng: { value: 0 }, uWidth: { value: 0.25 }, uDir: { value: 1 }, uCurl: { value: 0 },
      uTip: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vP;
      void main() { vUv = uv; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uPhase, uPeriod, uReveal, uScale, uBase, uAng, uWidth, uDir, uCurl, uTip; varying vec2 vUv; varying vec3 vP;
      void main() {
        float m = vUv.x * uScale;                       // metres along the conductor
        if (uK < 0.003 || m > uReveal) discard;
        // along the conductor (bands every uPeriod cm), or around the coil's axis (uPeriod bands per turn: all the turns
        // light at the same angles, the current reads as arcs sweeping round)
        float s = uAng > 0.5 ? atan(vP.z, vP.x) / 6.2831853 * uPeriod + length(vP.xz) * uCurl - uPhase : m * 100.0 / max(uPeriod, 0.01) - uPhase;
        // each band a comet: a bright head where it is going, a tail behind — the direction reads on a still frame
        float f = fract(uDir * s);
        float b = smoothstep(1.0 - 3.0 * uWidth, 0.96, f) * (1.0 - smoothstep(0.96, 1.0, f));
        float head = 1.0 + 1.2 * smoothstep(uReveal - 0.025, uReveal, m) * step(uReveal, 99.0);
        // a white-hot tip at the front of each band (uTip): the head reads apart from the tail on a still frame
        float tip = uTip * smoothstep(0.84, 0.94, f) * (1.0 - smoothstep(0.955, 0.995, f));
        vec3 col = mix(uColor, vec3(1.0), clamp(0.4 * tip, 0.0, 0.35));
        gl_FragColor = vec4(col * uK * (uBase + (1.0 - uBase) * b + tip) * head, 1.0);
      }`,
  });
}
/** uv.x of a tube from 0–1 to metres, so that bands keep their size from one conductor to the next. */
function metered(geo, length) {
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * length / 100);
  return geo;
}
const tube = (curve, seg, r, radial = 8, closed = false) => metered(new THREE.TubeGeometry(curve, seg, r, radial, closed), curve.getLength());

class Spiral extends THREE.Curve {
  constructor(rOut, rIn, turns, th0) { super(); Object.assign(this, { rOut, rIn, turns, th0 }); }
  getPoint(u, t = new THREE.Vector3()) {
    const th = this.th0 + u * this.turns * TAU;
    const r = this.rOut + (this.rIn - this.rOut) * u;
    return t.set(r * Math.cos(th), 0, r * Math.sin(th));
  }
}
class Arc extends THREE.Curve {
  constructor(r, a0, a1, y = 0) { super(); Object.assign(this, { r, a0, a1, y }); }
  getPoint(u, t = new THREE.Vector3()) {
    const a = this.a0 + (this.a1 - this.a0) * u;
    return t.set(this.r * Math.cos(a), this.y, this.r * Math.sin(a));
  }
}
/** A field line around the winding, in the radial plane at azimuth `phi`: up the inner side, over through the glass
 *  into the base, down outside, back under through the ferrite. (rho0, rho1) its radial span, (y0, y1) its height. */
class Loop extends THREE.Curve {
  constructor(phi, rho0, rho1, y0, y1) { super(); Object.assign(this, { c: Math.cos(phi), s: Math.sin(phi), rho0, rho1, y0, y1 }); }
  getPoint(u, t = new THREE.Vector3()) {
    const th = u * TAU, e = 0.42;
    const cx = Math.cos(th), sy = Math.sin(th);
    const rc = (this.rho0 + this.rho1) / 2, a = (this.rho1 - this.rho0) / 2;
    const yc = (this.y0 + this.y1) / 2, b = (this.y1 - this.y0) / 2;
    const rho = rc - a * Math.sign(cx) * Math.pow(Math.abs(cx), e);
    const y = yc + b * Math.sign(sy) * Math.pow(Math.abs(sy), e);
    return t.set(rho * this.c, y, rho * this.s);
  }
}

/** A disc (y-centred, thickness h): whole, or its half on one side of the local plane z = 0 (side −1 back, +1 front). */
function disc(r, h, side = 0, bevel = 0.04) {
  if (!side) return cyl(r, h, bevel, 72);
  const pts = [];
  for (let i = 0; i <= 36; i++) {
    const a = Math.PI * (side < 0 ? 1 + i / 36 : i / 36); // back: sin ≤ 0 → z ≤ 0
    pts.push([r * Math.cos(a), -r * Math.sin(a)]); // the outline's y is −z
  }
  return plate(pts, h, { bevel }).rotateX(-Math.PI / 2).translate(0, -h / 2, 0);
}

/** The groups of a piece that the cut crosses: whole (cut 0), back half (cut > 0), and the mover that drops away with
 *  what stands in front (front: always · frontHalf: cut > 0). */
function cutGroups(parent) {
  const g = { whole: new THREE.Group(), back: new THREE.Group(), mover: new THREE.Group(), front: new THREE.Group(), frontHalf: new THREE.Group() };
  g.mover.add(g.front, g.frontHalf);
  parent.add(g.whole, g.back, g.mover);
  return g;
}
const ALL_CUTS = [];
function setCut(g, cut) {
  g.whole.visible = cut < 0.001;
  g.back.visible = g.frontHalf.visible = cut >= 0.001;
  g.mover.position.y = -45 * cut * cut;
  g.mover.visible = cut < 0.999;
}

/** Add a mesh to `part` (its materials registered for the exploded view) and hang it in `group`. */
function put(part, group, geo, mat, o = {}) {
  const m = addMesh(part, geo, mat, o);
  if (group !== part) group.add(m);
  return m;
}
/** A box [x0,x1]×[y0,y1]×[z0,z1] in a part, split by the cut if it crosses it. */
function slab(part, g, mat, X, Y, Z, r = 0.1, o = {}) {
  const at = (grp, z0, z1) => put(part, grp, box(X[1] - X[0], Y[1] - Y[0], z1 - z0, r), mat, { ...o, pos: [(X[0] + X[1]) / 2, (Y[0] + Y[1]) / 2, (z0 + z1) / 2] });
  if (Z[1] <= CZ) return at(part, Z[0], Z[1]);
  if (Z[0] >= CZ) return at(g.front, Z[0], Z[1]);
  at(g.whole, Z[0], Z[1]);
  at(g.back, Z[0], CZ);
  at(g.frontHalf, CZ, Z[1]);
}

/* ── 7 segments: a top, b top-right, c bottom-right, d bottom, e bottom-left, f top-left, g middle ── */
const GLYPH = { 9: "abcdfg", H: "bcefg" };
const SEG = { a: [0, 1, 1], b: [0.5, 0.5, 0], c: [0.5, -0.5, 0], d: [0, -1, 1], e: [-0.5, -0.5, 0], f: [-0.5, 0.5, 0], g: [0, 0, 1] };
function makeDigit(h, mat) {
  const g = new THREE.Group();
  const segs = {};
  const long = h * 0.44, thick = h * 0.11;
  for (const [k, [x, y, horiz]] of Object.entries(SEG)) {
    const m = new THREE.Mesh(horiz ? box(long, 0.03, thick, 0.012) : box(thick, 0.03, long, 0.012), mat);
    m.position.set(x * h * 0.5, 0.02, -y * h * 0.5);
    m.renderOrder = 4;
    g.add(m);
    segs[k] = m;
  }
  let shown = null;
  return {
    group: g,
    show(glyph) {
      if (glyph === shown) return;
      shown = glyph;
      const on = GLYPH[glyph] ?? "";
      for (const k in segs) segs[k].visible = on.includes(k);
    },
  };
}

const circle = (x, z, r, y = 0.02, n = 96) => Array.from({ length: n + 1 }, (_, i) => [x + r * Math.cos((i / n) * TAU), y, z + r * Math.sin((i / n) * TAU)]);

export function buildHob() {
  const root = new THREE.Group();
  root.name = "hob";

  /* ───────────── the glass ───────────── */
  const glassPart = makePart("glass", { lift: EXPLODE.glass });
  const gG = cutGroups(glassPart);
  // satin black: rough enough that the softbox spreads into a faint sheen, little of the studio mirrored
  // (retouche 14/11: coat nearly off — kept > 0 so the material stays physical and `specularIntensity` applies —, specular
  // and env halved: the kitchen's pink key made a veil at grazing angles)
  const glassMat = solid(C.glass, { rough: 0.55, metal: 0, env: 0.04, coat: 0.02, coatRough: 0.4 });
  glassMat.specularIntensity = 0.08;
  glassMat.userData.finish = false; // the plateau's hand traces read as dirty patches on a black glass
  slab(glassPart, gG, glassMat, [-GLASS.w / 2, GLASS.w / 2], [-T, 0], [-GLASS.d / 2, GLASS.d / 2], GLASS.bevel, { edgeOpacity: 0.9, edgeWidth: 2 });
  // its X-ray (see 1): a shell with a lip
  const glassShellMat = glass(BRAND.ink, { base: 0, rim: 0.05, power: 4, edge: 0 }); // a thin slab seen grazing: a rim would light it all
  glassShellMat.uniforms.uAmount.value = 0;
  const glassShell = new THREE.Mesh(box(GLASS.w, T, GLASS.d, GLASS.bevel), glassShellMat);
  glassShell.position.y = -T / 2;
  gG.whole.add(asShell(glassShell, 20));
  // the slice of the glass in the cut face: a light line, warm where the base has heated it
  const sliceMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uInk: { value: new THREE.Color(BRAND.ink) }, uHot: { value: SIGNAL.clone() }, uHeat: { value: 0 }, uX: { value: ZONES.pan.x }, uR: { value: HEAT.ring } },
    vertexShader: /* glsl */ `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uHot; uniform float uHeat, uX, uR; varying vec3 vP;
      void main() {
        float q = clamp(abs(vP.x - uX) / uR, 0.0, 1.5);
        float warm = uHeat * (1.0 - smoothstep(0.55, 1.1, q));
        vec3 c = mix(uInk * 0.55, uHot * 1.6, clamp(warm, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const slice = new THREE.Mesh(new THREE.PlaneGeometry(GLASS.w - 0.3, T * 0.8), sliceMat);
  slice.position.set(0, -T / 2, CZ + 0.006);
  slice.renderOrder = 5;
  gG.back.add(slice);

  // what is printed and lit on the glass (gone with the front half when cut)
  const print = new THREE.Group();
  glassPart.add(print);
  const printMats = [];
  const ink = (pts, opacity = 0.5, width = 1.8) => {
    const l = fatLine(pts, { color: BRAND.ink, width, opacity });
    printMats.push(l.material);
    print.add(l);
    return l;
  };
  for (const z of Object.values(ZONES)) ink(circle(z.x, z.z, z.r), 0.42);
  ink([[SLIDER.x0, 0.02, SLIDER.z], [SLIDER.x1, 0.02, SLIDER.z]], 0.5, 2);
  for (const x of [SLIDER.x0 - 1.4, SLIDER.x1 + 1.4]) ink(circle(x, SLIDER.z, 0.45, 0.02, 24), 0.45);
  ink(circle(-GLASS.w / 2 + 3.6, SLIDER.z, 0.75, 0.02, 32), 0.45); // the power key
  ink(circle(GLASS.w / 2 - 3.6, SLIDER.z, 0.75, 0.02, 32), 0.45); // the lock key
  for (const d of Object.values(DISPLAYS)) { // the window of each display, a faint frame
    const w = d.h * 0.5, h = d.h * 0.62;
    ink([[d.x - w, 0.02, d.z - h], [d.x + w, 0.02, d.z - h], [d.x + w, 0.02, d.z + h], [d.x - w, 0.02, d.z + h], [d.x - w, 0.02, d.z - h]], 0.22);
  }
  const handMat = glow(BRAND.veille, 0);
  const panMat = glow(BRAND.veille, 0);
  const digits = { hand: makeDigit(DISPLAYS.hand.h, handMat), pan: makeDigit(DISPLAYS.pan.h, panMat) };
  for (const k of ["hand", "pan"]) {
    digits[k].group.position.set(DISPLAYS[k].x, 0, DISPLAYS[k].z);
    print.add(digits[k].group);
  }
  // the heat the glass took from the base: a ring, hotter at its centre (whole, and its back half for the cut)
  const heatMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL.clone() }, uK: { value: 0 }, uR: { value: HEAT.ring } },
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uR; varying vec2 vP;
      void main() {
        if (uK < 0.003) discard;
        float q = clamp(length(vP) / uR, 0.0, 1.0);
        float core = pow(1.0 - q, 1.6);
        float rim = smoothstep(0.62, 0.9, q) * (1.0 - smoothstep(0.9, 1.0, q));
        gl_FragColor = vec4(uColor * uK * (0.85 * core + 0.12 * rim + 0.05), 1.0);
      }`,
  });
  const heatWhole = new THREE.Mesh(new THREE.CircleGeometry(HEAT.ring, 72), heatMat);
  const heatHalf = new THREE.Mesh(new THREE.CircleGeometry(HEAT.ring, 36, 0, Math.PI), heatMat);
  for (const [m, grp] of [[heatWhole, gG.whole], [heatHalf, gG.back]]) {
    m.rotation.x = -Math.PI / 2;
    m.position.set(ZONES.pan.x, 0.012, ZONES.pan.z);
    m.renderOrder = 3;
    grp.add(m);
  }

  /* ───────────── the inductors ───────────── */
  const coils = makePart("coils", { lift: EXPLODE.coils, delay: 0.05 });
  const copperMat = solid(C.copper, { rough: 0.38, metal: 0.35 });
  const copperDim = solid(0xa98466, { rough: 0.45, metal: 0.3 });
  const cutMat = solid(C.copperCut, { rough: 0.3, metal: 0.2 });
  const micaMat = solid(C.mica, { rough: 0.6 });
  const ferriteMat = solid(C.ferrite, { rough: 0.75 });
  const trayMat = solid(C.tray, { rough: 0.7 });
  const coilFlowMat = flowMat(BRAND.veille, 3);
  const cutFlowMat = flowMat(BRAND.veille, 3);
  for (const m of [coilFlowMat, cutFlowMat]) Object.assign(m.uniforms, { uAng: { value: 1 }, uBase: { value: 0.04 }, uWidth: { value: 0.12 }, uCurl: { value: 0.07 }, uTip: { value: 0.6 } });
  const coilTop = -T - COIL.gap; // the copper's top face
  const TH0 = (200 / 180) * Math.PI; // where the hero spiral's outer end (its lead) stands
  const heroLead = [ZONES.pan.x + ZONES.pan.r * Math.cos(TH0), ZONES.pan.z + ZONES.pan.r * Math.sin(TH0)];
  let heroZG = null;

  for (const [key, z] of Object.entries(ZONES)) {
    const hero = key === "pan";
    const zg = new THREE.Group();
    zg.position.set(z.x, 0, z.z);
    coils.add(zg);
    if (hero) heroZG = zg;
    const crosses = Math.abs(z.z - CZ) < z.r * 1.2;
    const g = crosses ? cutGroups(zg) : null;
    if (g) ALL_CUTS.push(g);
    const rIn = z.r * COIL.inner, strand = COIL.h * 0.46;
    const turns = hero ? COIL.turns : 14;
    const pitch = (z.r - strand - rIn) / turns;
    const mat = hero ? copperMat : copperDim;
    // the copper: a flat spiral (whole), or, cut, concentric half turns and their section
    const spiral = new Spiral(z.r - strand, rIn, turns, hero ? TH0 : 0);
    const sGeo = tube(spiral, turns * (hero ? 96 : 56), strand, hero ? 8 : 6);
    put(coils, g ? g.whole : zg, sGeo, mat, { pos: [0, Y_COIL, 0], edges: false });
    if (hero) {
      const over = new THREE.Mesh(tube(spiral, turns * 96, strand * 1.08, 8), coilFlowMat);
      over.position.y = Y_COIL;
      over.renderOrder = 6;
      g.whole.add(over);
    }
    // the copper's lead: a short tail off the outer end, down to where the riser meets it (hero only)
    const yBase = Y_COIL - COIL.h / 2;
    if (g) {
      for (const side of [-1, 1]) {
        const arcs = [];
        for (let i = 0; i < turns; i++) {
          const r = z.r - strand - (i + 0.5) * pitch;
          const a0 = side < 0 ? Math.PI : 0;
          arcs.push(new Arc(r, a0, a0 + Math.PI, Y_COIL));
        }
        const geos = arcs.map((a) => tube(a, 28, strand, 6));
        const grp = side < 0 ? g.back : g.frontHalf;
        for (const geo of geos) put(coils, grp, geo, mat, { edges: false });
        if (hero && side < 0) for (const a of arcs) { const o = new THREE.Mesh(tube(a, 28, strand * 1.08, 6), cutFlowMat); o.renderOrder = 6; g.back.add(o); }
      }
      // the section of the turns: a row of light squares on the cut face, each side of the centre
      for (let i = 0; i < turns; i++) {
        const r = z.r - strand - (i + 0.5) * pitch;
        for (const sx of [-1, 1]) put(coils, g.back, box(Math.min(pitch * 0.86, strand * 2), COIL.h * 0.92, 0.06, 0.01), hero ? cutMat : copperMat, { pos: [sx * r, Y_COIL, -0.03], edges: false });
      }
    }
    // the mica disc under the copper, the ferrite bars, the carrier
    const micaY = yBase - 0.04, ferY = micaY - 0.04 - COIL.ferrite.h / 2, trayY = ferY - COIL.ferrite.h / 2 - COIL.tray / 2;
    const discs = [[z.r * 1.02, 0.08, micaY, micaMat], [z.r * 1.08, COIL.tray, trayY, trayMat]];
    for (const [r, h, y, m] of discs) {
      if (!g) { put(coils, zg, disc(r, h), m, { pos: [0, y, 0] }); continue; }
      put(coils, g.whole, disc(r, h), m, { pos: [0, y, 0] });
      put(coils, g.back, disc(r, h, -1), m, { pos: [0, y, 0] });
      put(coils, g.frontHalf, disc(r, h, 1), m, { pos: [0, y, 0] });
    }
    const fl = z.r * COIL.ferrite.len, f0 = z.r * 0.32;
    for (let i = 0; i < COIL.ferrite.n; i++) {
      const a = (i / COIL.ferrite.n) * TAU;
      const c = Math.cos(a), s = Math.sin(a);
      const mid = f0 + fl / 2;
      const along = (grp, w, off) => {
        const m = put(coils, grp, box(fl, COIL.ferrite.h, w, 0.08), ferriteMat, { pos: [mid * c - off * s, ferY, mid * s + off * c] });
        m.rotation.y = -a;
      };
      if (!g || s < -0.01) along(zg, COIL.ferrite.w, 0);
      else if (s > 0.01) along(g.front, COIL.ferrite.w, 0);
      else { // in the cut plane: halved lengthwise
        along(g.whole, COIL.ferrite.w, 0);
        along(g.back, COIL.ferrite.w / 2, (c > 0 ? 1 : -1) * COIL.ferrite.w / 4 * -1);
        along(g.frontHalf, COIL.ferrite.w / 2, (c > 0 ? 1 : -1) * COIL.ferrite.w / 4);
      }
    }
  }
  // the temperature point, at the hero coil's centre, pressed under the glass: a pad on a post
  const sensorMat = solid(C.sensor, { rough: 0.5 });
  const sensorGlow = glow(BRAND.veille, 0, { additive: true });
  put(coils, heroZG, cyl(0.32, -T - (Y_COIL - COIL.h / 2) - SENSOR.h, 0.05, 24), trayMat, { pos: [0, (Y_COIL - COIL.h / 2 + (-T - SENSOR.h)) / 2, 0], edges: false });
  const pad = put(coils, heroZG, cyl(SENSOR.r, SENSOR.h, 0.06, 40), sensorMat, { pos: [0, -T - SENSOR.h / 2, 0] });
  const padLight = new THREE.Mesh(new THREE.CircleGeometry(SENSOR.r * 0.8, 32), sensorGlow);
  padLight.rotation.x = -Math.PI / 2;
  padLight.position.y = SENSOR.h / 2 + 0.01;
  pad.add(padLight);
  coils.userData.part.mats.add(sensorGlow);
  // seen through the black glass, the point shows as a small light on its top face (the glass is opaque otherwise)
  const padSeen = new THREE.Mesh(new THREE.CircleGeometry(SENSOR.r * 0.7, 32), sensorGlow);
  padSeen.rotation.x = -Math.PI / 2;
  padSeen.position.set(ZONES.pan.x, 0.016, ZONES.pan.z);
  padSeen.renderOrder = 4;
  gG.whole.add(padSeen);

  // the field of the hero zone: loops around the winding in ten radial planes; the two in the cut plane (φ 0, π) carry
  // three nested lines and stay when cut, the others fade
  const field = new THREE.Group();
  heroZG.add(field);
  const fieldMat = flowMat(BRAND.veille, 1.5);
  const fieldOther = flowMat(BRAND.veille, 1.5);
  for (const m of [fieldMat, fieldOther]) { m.uniforms.uBase.value = 0.25; m.uniforms.uWidth.value = 0.14; m.uniforms.uTip.value = 0.5; }
  const zr = ZONES.pan.r, rI = zr * COIL.inner;
  const NEST = [[rI - 0.6, zr + 0.5, -1.62, 0.22], [rI - 1.3, zr + 1.3, -1.78, 0.42], [Math.max(0.35, rI - 2.0), zr + 2.1, -1.94, 0.7]];
  // a chevron (arrowhead) on each loop of the cut plane, on its inner and outer sides (its top is hidden in the base), pointing the way the field runs
  // (flipped with B): the direction reads on a still frame at 270 px, not only in motion
  const chevMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
  const chevOther = chevMat.clone();
  const chevGeo = (s) => new THREE.ConeGeometry(0.3 * s, 0.75 * s, 14).rotateZ(-Math.PI / 2); // points along +x
  const chevrons = [];
  const X1 = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < 10; i++) {
    const phi = (i / 10) * TAU;
    const inPlane = i === 0 || i === 5;
    for (const [r0, r1, y0, y1] of inPlane ? NEST : NEST.slice(0, 2)) {
      const loop = new Loop(phi, r0, r1, y0, y1);
      const m = new THREE.Mesh(tube(loop, 120, inPlane ? 0.075 : 0.06, 6, true), inPlane ? fieldMat : fieldOther);
      m.renderOrder = 7;
      field.add(m);
      if (inPlane) for (const u of [0.0, 0.5]) { // the inner side (up for B > 0) and the outer side (down), under the glass where the section shows them
        const g = new THREE.Group();
        g.position.copy(loop.getPoint(u));
        g.quaternion.setFromUnitVectors(X1, loop.getTangent(u).normalize());
        const c = new THREE.Mesh(chevGeo(inPlane ? 1 : 0.8), inPlane ? chevMat : chevOther);
        c.renderOrder = 8;
        g.add(c);
        field.add(g);
        chevrons.push(c);
      }
    }
  }

  /* ───────────── the power board ───────────── */
  const board = makePart("board", { lift: EXPLODE.board, delay: 0.1 });
  const bG = cutGroups(board);
  const boardMat = solid(C.board, { rough: 0.62, env: 0.45 });
  const trackMat = solid(C.track, { rough: 0.45, metal: 0.3, env: 0.45 });
  const sinkMat = solid(C.sink, { rough: 0.45, metal: 0.4 });
  const capMat = solid(C.cap, { rough: 0.45, metal: 0.2, env: 0.45 });
  const darkMat = solid(C.dark, { rough: 0.55, env: 0.45 });
  for (const m of [boardMat, trackMat]) m.userData.finish = false;
  const cordMat = solid(C.cord, { rough: 0.6 });
  const yB = BOARD.y; // the board's top face
  const bx0 = BOARD.x - BOARD.w / 2, bx1 = BOARD.x + BOARD.w / 2, bz0 = BOARD.z - BOARD.d / 2, bz1 = BOARD.z + BOARD.d / 2;
  const notch = [FAN.x + FAN.r + 1.2, FAN.z + FAN.r + 1.4]; // the corner left for the fan
  const outline = (z0, z1, withNotch) => (withNotch
    ? [[notch[0], -z0], [bx1, -z0], [bx1, -z1], [bx0, -z1], [bx0, -notch[1]], [notch[0], -notch[1]]]
    : [[bx0, -z0], [bx1, -z0], [bx1, -z1], [bx0, -z1]]).reverse();
  const pcb = (pts) => plate(pts, BOARD.thick, { bevel: 0.04 }).rotateX(-Math.PI / 2);
  put(board, bG.whole, pcb(outline(bz0, bz1, true)), boardMat, { pos: [0, yB - BOARD.thick, 0] });
  put(board, bG.back, pcb(outline(bz0, CZ, true)), boardMat, { pos: [0, yB - BOARD.thick, 0] });
  put(board, bG.frontHalf, pcb(outline(CZ, bz1, false)), boardMat, { pos: [0, yB - BOARD.thick, 0] });
  // the heat sink: a base and its fins, the two transistors pressed on its front face
  const sk = BOARD.sink, sx = BOARD.x + sk.x, sz = BOARD.z + sk.z;
  put(board, board, box(sk.w, 0.35, sk.d, 0.06), sinkMat, { pos: [sx, yB + 0.175, sz] });
  for (let i = 0; i < 9; i++) put(board, board, box(0.22, sk.h, sk.d, 0.04), sinkMat, { pos: [sx - sk.w / 2 + 0.4 + i * ((sk.w - 0.8) / 8), yB + sk.h / 2, sz], edgeOpacity: 0.55 });
  for (const dx of [-2.6, 2.6]) {
    put(board, board, box(1.6, 2.0, 0.45, 0.06), darkMat, { pos: [sx + dx, yB + 1.15, sz + sk.d / 2 + 0.25] });
    for (const l of [-0.5, 0, 0.5]) put(board, board, box(0.12, 0.6, 0.12, 0.02), sinkMat, { pos: [sx + dx + l, yB + 0.2, sz + sk.d / 2 + 0.55], edges: false });
  }
  // the two smoothing capacitors, a bridge rectifier, a choke
  for (const [x, z] of BOARD.caps) {
    put(board, board, cyl(BOARD.capR, BOARD.capH, 0.18, 40), capMat, { pos: [BOARD.x + x, yB + BOARD.capH / 2, BOARD.z + z] });
    put(board, board, cyl(BOARD.capR * 0.8, 0.04, 0.01, 32), sinkMat, { pos: [BOARD.x + x, yB + BOARD.capH + 0.02, BOARD.z + z], edges: false });
  }
  put(board, board, box(2.2, 0.8, 2.2, 0.12), darkMat, { pos: [-12, yB + 0.4, -2] });
  const choke = put(board, board, new THREE.TorusGeometry(1.4, 0.55, 14, 40), copperDim, { pos: [-3, yB + 0.6, -10], edges: false });
  choke.rotation.x = Math.PI / 2;
  put(board, board, box(3.2, 1.0, 1.6, 0.1), darkMat, { pos: [CORD.to[0], yB + 0.5, CORD.to[2] - 0.6] }); // the mains terminal
  // the copper track the current follows: terminal → between the capacitors → to the transistors → the riser's foot
  const TRACK = [[CORD.to[0], CORD.to[2] + 0.4], [-10, CORD.to[2] + 0.4], [-10, 5], [heroLead[0], 5], [heroLead[0], heroLead[1]]];
  for (let i = 0; i < TRACK.length - 1; i++) {
    const [x0, z0] = TRACK[i], [x1, z1] = TRACK[i + 1];
    const w = 0.7;
    put(board, board, box(Math.abs(x1 - x0) + w, 0.05, Math.abs(z1 - z0) + w, 0.02), trackMat, { pos: [(x0 + x1) / 2, yB + 0.025, (z0 + z1) / 2], edges: false });
  }
  // the mains lead: in through the back wall, down onto its terminal
  const cordCurve = new THREE.CatmullRomCurve3([CORD.out, [CORD.out[0], CORD.out[1], -30], CORD.from, [-21, -3.7, -16], [CORD.to[0], yB + 0.6, CORD.to[2] - 0.6]].map((p) => new THREE.Vector3(...p)));
  put(board, board, new THREE.TubeGeometry(cordCurve, 80, 0.45, 12), cordMat, { edges: false });
  put(board, board, cyl(0.85, 1.2, 0.1, 24), darkMat, { pos: [CORD.from[0], CORD.from[1], -CASE.d / 2], rot: [Math.PI / 2, 0, 0] });
  // the current's path, drawn on its conductors: lead · track · riser (stretches with the exploded view)
  const cordFlow = flowMat(BRAND.veille, 3);
  const trackFlow = flowMat(BRAND.veille, 3);
  const riserFlow = flowMat(BRAND.veille, 3);
  const cordOver = new THREE.Mesh(tube(cordCurve, 80, 0.52, 10), cordFlow);
  const trackPath = new THREE.CurvePath();
  for (let i = 0; i < TRACK.length - 1; i++) trackPath.add(new THREE.LineCurve3(new THREE.Vector3(TRACK[i][0], yB + 0.12, TRACK[i][1]), new THREE.Vector3(TRACK[i + 1][0], yB + 0.12, TRACK[i + 1][1])));
  const trackOver = new THREE.Mesh(tube(trackPath, 160, 0.26, 8), trackFlow);
  const riser = new THREE.Group(); // a unit-long wire, scaled to the gap between the board and the coils
  riser.position.set(heroLead[0], yB, heroLead[1]);
  const riserLen = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
  put(board, riser, new THREE.TubeGeometry(riserLen, 1, 0.2, 10), darkMat, { edges: false });
  riser.add(new THREE.Mesh(new THREE.TubeGeometry(riserLen, 1, 0.27, 10), riserFlow));
  board.add(riser);
  for (const m of [cordOver, trackOver]) { m.renderOrder = 6; board.add(m); }
  riser.children[1].renderOrder = 6;
  const L_CORD = cordCurve.getLength() / 100, L_TRACK = trackPath.getLength() / 100;

  /* ───────────── the fan ───────────── */
  const fanPart = makePart("fan", { lift: EXPLODE.fan, delay: 0.15 });
  const fanMat = solid(C.fanBody, { rough: 0.6 });
  const bladeMat = solid(C.blade, { rough: 0.5, metal: 0.2 });
  const fyB = FAN.y - FAN.h / 2;
  put(fanPart, fanPart, cyl(FAN.r + 0.5, 0.25, 0.06, 48), fanMat, { pos: [FAN.x, fyB + 0.125, FAN.z] });
  const housing = new THREE.LatheGeometry([[FAN.r + 0.3, 0], [FAN.r + 0.5, 0], [FAN.r + 0.5, FAN.h], [FAN.r + 0.3, FAN.h]].map(([r, y]) => new THREE.Vector2(r, y)), 64);
  put(fanPart, fanPart, housing, fanMat, { pos: [FAN.x, fyB, FAN.z], threshold: 40 });
  const rotor = new THREE.Group();
  rotor.position.set(FAN.x, fyB + 0.3 + FAN.h / 2, FAN.z);
  fanPart.add(rotor);
  put(fanPart, rotor, cyl(FAN.r * 0.32, FAN.h * 0.8, 0.12, 32), darkMat);
  for (let i = 0; i < FAN.blades; i++) {
    const a = (i / FAN.blades) * TAU;
    const b = put(fanPart, rotor, box(FAN.r * 0.62, FAN.h * 0.7, 0.16, 0.04), bladeMat, { edgeOpacity: 0.6 });
    b.position.set(Math.cos(a) * FAN.r * 0.62, 0, -Math.sin(a) * FAN.r * 0.62);
    b.rotation.set(0, a + 0.35, 0);
  }

  /* ───────────── the case (sheet metal tray) ───────────── */
  const casePart = makePart("case", { lift: EXPLODE.case, delay: 0.2 });
  const cG = cutGroups(casePart);
  const caseMat = solid(C.caseOut, { rough: 0.5, metal: 0.35 });
  const caseIn = solid(C.caseIn, { rough: 0.6, metal: 0.25 });
  caseMat.userData.finish = caseIn.userData.finish = false;
  const cx = CASE.w / 2, cz = CASE.d / 2, cy0 = -T - CASE.depth, cy1 = -T - 0.05, wall = 0.3;
  slab(casePart, cG, caseIn, [-cx, cx], [cy0, cy0 + wall], [-cz, cz], 0.12);
  slab(casePart, cG, caseMat, [-cx, -cx + wall], [cy0, cy1], [-cz, cz], 0.1);
  slab(casePart, cG, caseMat, [cx - wall, cx], [cy0, cy1], [-cz, cz], 0.1);
  slab(casePart, cG, caseMat, [-cx, cx], [cy0, cy1], [-cz, -cz + wall], 0.1);
  slab(casePart, cG, caseMat, [-cx, cx], [cy0, cy1], [cz - wall, cz], 0.1);
  for (let i = 0; i < 6; i++) slab(casePart, cG, darkMat, [-cx + 10 + i * 2.2, -cx + 11.1 + i * 2.2], [cy0 - 0.02, cy0 + 0.02], [-cz + 4, -cz + 14], 0.02, { edges: false }); // vents
  const caseShellMat = glass(BRAND.ink, { base: 0, rim: 0.1, power: 3, edge: 0.3 });
  caseShellMat.uniforms.uAmount.value = 0;
  const caseShell = new THREE.Mesh(box(CASE.w, CASE.depth, CASE.d, 0.3), caseShellMat);
  caseShell.position.y = (cy0 + cy1) / 2;
  cG.whole.add(asShell(caseShell, 20));
  ALL_CUTS.push(gG, bG, cG);
  const cuts = ALL_CUTS.splice(0);

  root.add(casePart, fanPart, board, coils, glassPart);
  const parts = { case: casePart, fan: fanPart, board, coils, glass: glassPart };
  const list = Object.values(parts);
  const A = {
    board: anchor(board, BOARD.x, BOARD.y + 1, BOARD.z),
    coil: anchor(coils, ZONES.pan.x, Y_COIL, ZONES.pan.z),
    sensor: anchor(coils, ZONES.pan.x, -T, ZONES.pan.z),
    glass: anchor(glassPart, ZONES.pan.x, 0, ZONES.pan.z),
    display: anchor(glassPart, DISPLAYS.pan.x, 0, DISPLAYS.pan.z),
    displayHand: anchor(glassPart, DISPLAYS.hand.x, 0, DISPLAYS.hand.z),
    cord: anchor(board, CORD.from[0], CORD.from[1], CORD.from[2]),
    fan: anchor(fanPart, FAN.x, FAN.y, FAN.z),
  };

  // what fades with `see` (solid ↔ X-ray), with the transparency switched only when it changes
  const fading = [[glassMat, 0.92], [caseMat, 0.85], [caseIn, 0.85]];
  let seen = -1;
  const litBoardMats = [boardMat, sinkMat, capMat, trackMat];
  const litCoilMats = [copperMat, cutMat];
  const emit = (mats, k) => { for (const m of mats) m.emissive.copy(VEILLE).multiplyScalar(k); };

  return {
    root, parts, A,
    /**
     * see        0 the hob as it is seen (black glass, closed case) → 1 glass and case turn to X-ray: the inside shows
     * on         the hero zone is powered (0/1): its coil is fed, its field beats — what the header reads (« Champ »)
     * field      how much of the hero zone's field is DRAWN (0–1: each loop drawn from the coil up, and brighter); it
     *            beats with `time` (one cycle a second: it reverses twice — never 25 kHz on screen)
     * coil       the current in the hero coil, bands of veille along its turns, back and forth with the field (0–1)
     * flow       the current's path drawn, veille: lead (0 → .45) → board track (→ .8) → riser to the coil (→ 1)
     * glassHeat  the ring of glass under the saucepan's base, warm (signal, 0–1); in the cut, the glass's slice warm there
     * sensor     the hero zone's temperature point under the glass, veille (0–1) — discreet, never a thermometer
     * blink      the EMPTY zone's display: its « 9 » blinks twice a second (0 off · 1 blinking)
     * power      the hero display shows its « 9 », steady, veille (0/1) · hot  it shows « H », signal (0/1, wins)
     * explode    0 assembled → 1 the layers rise (EXPLODE): case, fan, board, coils, glass
     * cut        0 whole → 1 cut through the front zones' centres: the front half drops away, the sections show
     * fan        the fan turns (0–1) · lit*  the part the voice names glows faintly veille (0–1)
     */
    update({ see = 0, on = 1, field: f = 0, coil = 0, flow = 0, glassHeat = 0, sensor = 0, blink = 0, power = 0, hot = 0, explode: k = 0, cut = 0, fan = 0, litBoard = 0, litCoil = 0, litGlass = 0, litSensor = 0 } = {}, time = 0) {
      explode(list, k);
      for (const g of cuts) setCut(g, cut);

      // see: the solids thin out, the shells come
      if (see !== seen) {
        for (const [m, depth] of fading) {
          const a = 1 - depth * see;
          m.opacity = a;
          const tr = a < 0.999;
          if (m.transparent !== tr) { m.transparent = tr; m.depthWrite = !tr; m.needsUpdate = true; }
          m.visible = a > 0.02;
        }
        glassShellMat.uniforms.uAmount.value = see;
        caseShellMat.uniforms.uAmount.value = 0.8 * see;
        seen = see;
      }

      // the printed glass goes with the front half
      print.visible = cut < 0.001;
      setGlow(handMat, blink > 0.5 && Math.floor(time * 4 + 0.5) % 2 === 0 ? 2.4 : 0);
      digits.hand.show(9);
      if (hot > 0.5) { setGlow(panMat, 2.2, SIGNAL); digits.pan.show("H"); }
      else { setGlow(panMat, power > 0.5 ? 2.2 : 0, VEILLE); digits.pan.show(9); }
      for (const m of printMats) m.opacity = m.userData.base * (1 + 0.6 * litGlass);

      // heat (signal): the ring on the glass, the slice in the cut
      heatMat.uniforms.uK.value = 0.85 * glassHeat;
      sliceMat.uniforms.uHeat.value = glassHeat;

      // the alternating field and current (slowed): B = cos ωt, the bands swing with its integral
      const B = Math.cos(OMEGA * time);
      const swing = 0.55 * Math.sin(OMEGA * time);
      const beat = 0.45 + 0.55 * Math.abs(B);
      const fk = f * on;
      fieldMat.uniforms.uK.value = 1.7 * fk * beat;
      fieldOther.uniforms.uK.value = 1.2 * fk * beat * (1 - cut);
      const dir = B >= 0 ? 1 : -1;
      for (const m of [fieldMat, fieldOther, coilFlowMat, cutFlowMat]) m.uniforms.uDir.value = dir;
      for (const m of [fieldMat, fieldOther]) { m.uniforms.uPhase.value = swing; m.uniforms.uReveal.value = f >= 0.999 ? 1e3 : f * 0.36; }
      const ch = 1.1 * fk * beat * Math.min(1, Math.max(0, (f - 0.55) / 0.35)) * Math.min(1, Math.abs(B) / 0.35);
      chevMat.color.copy(VEILLE).lerp(WHITE, 0.3).multiplyScalar(ch);
      chevOther.color.copy(VEILLE).lerp(WHITE, 0.3).multiplyScalar(0.75 * ch * (1 - cut));
      for (const c of chevrons) { c.scale.x = dir; c.visible = ch > 0.003; }
      const ck = coil * on;
      coilFlowMat.uniforms.uK.value = 0.9 * ck * beat;
      cutFlowMat.uniforms.uK.value = 0.9 * ck * beat;
      coilFlowMat.uniforms.uPhase.value = cutFlowMat.uniforms.uPhase.value = swing;
      cutMat.emissive.copy(VEILLE).multiplyScalar(0.12 * litCoil + 0.35 * ck * Math.abs(B));
      emit([copperMat], 0.045 * litCoil);

      // the path: lead → track → riser (the riser spans whatever the exploded view opens between board and coils)
      const run = time * 1.6;
      const seg = (m, a, b, L) => {
        const u = Math.min(1, Math.max(0, (flow - a) / (b - a)));
        m.uniforms.uK.value = u > 0 ? 1.5 * on : 0;
        m.uniforms.uReveal.value = u >= 0.999 ? 1e3 : u * L;
        m.uniforms.uPhase.value = run;
      };
      seg(cordFlow, 0, 0.45, L_CORD);
      seg(trackFlow, 0.45, 0.8, L_TRACK);
      const gap = Math.max(0.2, coils.position.y + Y_COIL - (board.position.y + yB));
      riser.scale.y = gap;
      riserFlow.uniforms.uScale.value = gap / 100; // its uv.x runs 0–1 over `gap` cm: in metres, like the other conductors
      seg(riserFlow, 0.8, 1, gap / 100);

      // the temperature point, the lit parts, the fan
      setGlow(sensorGlow, 1.6 * Math.max(sensor, litSensor));
      emit(litBoardMats, 0.06 * litBoard);
      glassMat.emissive.copy(VEILLE).multiplyScalar(0.05 * litGlass);
      rotor.rotation.y = fan * time * 3;
    },
  };
}
