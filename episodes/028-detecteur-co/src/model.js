// DOSSIER 028 — Détecteur de CO : THE SYSTEM, and THE BLOOD.
//
//   buildModel() → { root, A, parts, update(P, time, px) }
//     root    a THREE.Group: re-parented by world.js between the bedroom's back wall and the bench (its origin = the
//             centre of the detector's BACK, its face toward +z)
//     A       anchors (Object3D): grille · membrane · electrode · puce · buzzer · pile · led · face · centre
//     parts   { case, grille, membrane, electrode, puce, buzzer, pile } — each with ITS OWN materials
//     P       { bench, explode, sniff, current, dose, alarm, litGrille, litMembrane, litElectrode, litPuce, litBuzzer, litPile }
//   buildBlood() → { group, update(P, time, px) }   P = { micro, swap }
//     group   the maquette of the blood, its origin at its middle, its axis along x (world.js mounts it at BLOOD.at)
//
// THE DETECTOR — a wall unit of no brand, no logo, no text. Three greys, nothing else solid:
//   dark   the case (back and walls), the cell's body, the board, the battery's body
//   mid    the face, the membrane, the buzzer, the battery's ends
//   clear  the cell's PLATINUM face alone — the hero: that is where the CO « burns »
// The face: real slots over the cell (the air goes in there), a round mouth for the buzzer, and at the top the light
// (a veille dome) in the middle of THE RING — twelve light pipes showing the twelve LEDs of the board right behind:
// the count (`dose`), an image of the sum, not a real display (`sources` says so). Inside: the board, its chip in the
// middle of its own ring of twelve LEDs and the printed trace from the cell to the chip; the cell (ONE electrode is
// drawn: the film never says how many there are) and its membrane; the buzzer (housing, piezo disc, ceramic); the
// battery lying behind the board. The battery feeds the chip and the buzzer — NEVER the gas: in the exploded row two
// grey leads go from the battery to the chip and from the chip to the buzzer, unlit; the veille current runs only
// from the cell to the chip.
// What moves:
//   sniff    signal beads (the CO in the air) come in through the slots, cross the membrane, land on the platinum and
//            « burn » there (a small glint that swells and dies: oxidised, never a flame). Periodic in `time`, slow.
//   current  heads of veille light run from the cell to the chip, as bright as `current` (two values side by side give
//            two brightnesses: « proportionnel »). Assembled on the wall they are seen THROUGH the face, softer: a light
//            under the plastic. They glide (≈ 13 cm/s on the bench): a head never jumps from one frame to the next.
//   dose     the ring fills, segment by segment, on the face and on the board alike
//   alarm    rings of veille leave the buzzer's mouth, one every 0.8 s, slow, widening onto the wall; the light at the
//            dome grows, and a soft light that has a place spreads on the wall around the unit. Never a flicker.
//   lit…     the part the voice names glows faintly veille from behind (its silhouette against its own light)
//   explode  ONE ROW across the camera (ROW: grille · membrane · electrode · chip · buzzer · battery, from −x to +x, in
//            the order the air goes through them), each part upright, face +z; the case stays behind and pales.
//            LIBERTY: in the row the small parts are SHOWN BIGGER (the membrane, the cell and the buzzer × 3 to 3.4,
//            the battery × 1.7): ≈ 10 cm each, so that six of them read across a frame; three pieces of 3 cm on a
//            75 cm row would be 45 px. The camera's
//            pull back while they leave hides it. Sizes are illustrative anyway (plan.js).
//
// THE BLOOD — a maquette with its own scale, no length ever shown: a short vessel of glass along x, red cells
// (biconcave discs of clear glass, not solid) drifting slowly along it, each carrying four beads: veille = oxygen,
// signal = CO. `swap` 0 → 1: the signal beads take the place of the veille ones, one by one (the oxygen bead leaves
// outward and fades as the CO bead flies in — never a colour halfway), and none goes back.
//
// Centimetres, y up. Everything is a function of the state and of `time`; `update` allocates nothing.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, glass, asShell, edgesOf, box, cyl, lathe, plate, anchor, setPartOpacity, fatLine } from "@kit/build3d.js";
import { DETECTOR, ROW, BLOOD } from "./plan.js";

const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const PALE = VEILLE.clone().lerp(new THREE.Color(1, 1, 1), 0.55);
const SPALE = SIGNAL.clone().lerp(new THREE.Color(1, 0.95, 0.85), 0.45);
const HOT = new THREE.Color(1, 0.9, 0.72);
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (u) => u * u * (3 - 2 * u);
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);
const fract = (x) => x - Math.floor(x);
const hash = (i) => fract(Math.sin(i * 127.1 + 311.7) * 43758.5453);

/* ─────────────────────────────────────────────────────────── where everything is (root coordinates) */

const { w: W, h: H, d: D, r: R } = DETECTOR; // 11 × 11, 4.4 deep, corners 1.6
const RING = { y: 2.1, r0: 1.5, r1: 2.15 }; //  the light and its ring of twelve, on the face (and the LEDs right behind)
const CELL = { x: -1.75, y: -2.2 }; //            the cell, behind the slots
const BUZ = { x: 3.05, y: -2.2 }; //              the buzzer, behind its mouth
const Z = { back: 0.28, walls: 3.8, face: D, pcb: 1.85, cell: 2.8, membrane: 3.7, buzzer: 2.83, pile: 1.0 };
/** Each part: its home (its centre, assembled), its scale in the row, its half depth (to its front), its size (for its light). */
const SPEC = {
  grille: { home: [0, 0, Z.walls + (D - Z.walls) / 2], grow: 0.95, hd: (D - Z.walls) / 2, size: W, delay: 0 },
  membrane: { home: [CELL.x, CELL.y, Z.membrane], grow: 3.1, hd: 0.08, size: 3.2, delay: 0.08 },
  electrode: { home: [CELL.x, CELL.y, Z.cell], grow: 3.0, hd: 0.82, size: 3.2, delay: 0.14 },
  puce: { home: [0, 0, Z.pcb], grow: 1.05, hd: 0.3, size: 9.4, delay: 0.3 },
  buzzer: { home: [BUZ.x, BUZ.y, Z.buzzer], grow: 3.4, hd: 0.92, size: 2.8, delay: 0.2 },
  pile: { home: [0.4, -1.3, Z.pile], grow: 1.7, hd: 0.7, size: 6.4, delay: 0.38 },
};
const SPAN = 0.58; // the share of `explode` each part takes to reach its place

const G = { dark: 0x3a4045, mid: 0x6a7076, clear: 0xdcddd7 };

/* ─────────────────────────────────────────────────────────── geometry */

function roundRect(w, h, r, path = new THREE.Shape(), cx = 0, cy = 0) {
  const x = w / 2;
  const y = h / 2;
  path.moveTo(cx - x + r, cy - y);
  path.lineTo(cx + x - r, cy - y);
  path.absarc(cx + x - r, cy - y + r, r, -Math.PI / 2, 0, false);
  path.lineTo(cx + x, cy + y - r);
  path.absarc(cx + x - r, cy + y - r, r, 0, Math.PI / 2, false);
  path.lineTo(cx - x + r, cy + y);
  path.absarc(cx - x + r, cy + y - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(cx - x, cy - y + r);
  path.absarc(cx - x + r, cy - y + r, r, Math.PI, 1.5 * Math.PI, false);
  return path;
}
/** A disc of radius r, thickness t, its axis along z, centred. */
const disc = (r, t, bevel = 0.06) => cyl(r, t, bevel, 64).rotateX(Math.PI / 2);
/** A flat strip from a to b ([x, y]), width w, thickness t, lying on z = 0. */
function strip(a, b, w, t) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return box(len + w, w, t, w * 0.3, 1)
    .rotateZ(Math.atan2(b[1] - a[1], b[0] - a[0]))
    .translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0);
}
/** One of the twelve segments of a ring: an arc between r0 and r1, `j` counted clockwise from twelve o'clock. */
function arcSegment(j, r0, r1, t) {
  const gap = 0.16; // radians between two segments
  const a1 = Math.PI / 2 - (j / 12) * Math.PI * 2 - gap / 2;
  const a0 = a1 - (Math.PI * 2) / 12 + gap;
  const s = new THREE.Shape();
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    if (i === 0) s.moveTo(r1 * Math.cos(a), r1 * Math.sin(a));
    else s.lineTo(r1 * Math.cos(a), r1 * Math.sin(a));
  }
  for (let i = n; i >= 0; i--) {
    const a = a0 + ((a1 - a0) * i) / n;
    s.lineTo(r0 * Math.cos(a), r0 * Math.sin(a));
  }
  return plate(s, t, { bevel: 0.03, round: 1 });
}

/* ─────────────────────────────────────────────────────────── light that has a place */

/**
 * A ball of light with no edge, always facing the eye: a small hot heart, a soft body, a long tail (012's). `uRadius`
 * cm (where the tail ends), never under `uMinPx` pixels. What stands in front of it hides it — unless depthTest is off.
 */
const ballMaterial = (heart, hue) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uRadius, uMinPx; varying vec2 vUv;
      void main() {
        vUv = position.xy;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        c.xy += position.xy * r;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = clamp(dot(vUv, vUv), 0.0, 4.0);
        float core = exp(-r2 / 0.012);
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
        gl_FragColor = vec4((uHeart * (core * 2.4) + uHue * (body + tail)) * uAmount, 1.0);
      }`,
  });
function makeBall(heart, hue, order = 5) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ballMaterial(heart, hue));
  mesh.frustumCulled = false;
  mesh.renderOrder = order + 4; // above the mist (drawn at 7, no depth test)
  mesh.visible = false;
  return mesh;
}
function shine(ball, amount, radius, minPx = 0) {
  ball.visible = amount > 0.004;
  const u = ball.material.uniforms;
  u.uAmount.value = amount;
  u.uRadius.value = radius;
  u.uMinPx.value = minPx;
}

/** The sound one sees: a soft ring of veille in the plane of the face, widening. Its profile is melted under the pixel. */
const ringMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: VEILLE.clone() }, uR: { value: 1 }, uW: { value: 0.2 }, uSize: { value: 2 }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vP; uniform float uSize;
      void main() { vP = position.xy * uSize; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uR, uW, uAmount; varying vec2 vP;
      void main() {
        float d = length(vP) - uR;
        float w = max(uW, fwidth(d) * 1.6);
        float a = exp(-d * d / (w * w)) * min(1.0, uW / w);
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });

/* ─────────────────────────────────────────────────────────── the detector */

export function buildModel() {
  const root = new THREE.Group();
  root.name = "detector";
  const parts = {};
  const mains = {}; // the lit solids of each part: its glow (lit…) tints them a hair
  const mat = (name, color, o = {}) => {
    const m = solid(color, { rough: o.rough ?? 0.55, metal: o.metal ?? 0.15, coat: o.coat, coatRough: 0.35 });
    m.userData.finish = o.finish ?? false; // moulded plastic and small parts: no machining grain (it read as corduroy on the face)
    if (o.main !== false) (mains[name] ??= []).push(m);
    return m;
  };
  const part = (name) => {
    const p = makePart(name);
    p.position.set(...(SPEC[name]?.home ?? [0, 0, (Z.back + Z.walls) / 2]));
    root.add(p);
    parts[name] = p;
    return p;
  };

  /* the case: a back and its four walls, dark moulded plastic, open in front (the face closes it) */
  const pc = part("case");
  const cz = (Z.back + Z.walls) / 2;
  const back = plate(roundRect(W, H, R), Z.back, { bevel: 0.08 }).translate(0, 0, -cz);
  const wallShape = roundRect(W, H, R);
  wallShape.holes.push(roundRect(W - 0.7, H - 0.7, R - 0.35, new THREE.Path()));
  const walls = plate(wallShape, Z.walls - Z.back, { bevel: 0.14, round: 3 }).translate(0, 0, Z.back - cz);
  const caseMat = mat("case", G.dark, { rough: 0.5, coat: 0.25 });
  addMesh(pc, back, caseMat, { edges: false });
  addMesh(pc, walls, caseMat, { edgeOpacity: 0.55 });

  /* the face: slots over the cell, the buzzer's mouth, the light in its ring */
  const pg = part("grille");
  const ft = D - Z.walls; // its thickness
  const faceShape = roundRect(W, H, R);
  const slotX = [CELL.x - 2.35, CELL.x + 2.35];
  const slotY = [-0.95, -1.75, -2.55, -3.35];
  for (const y of slotY) faceShape.holes.push(roundRect(slotX[1] - slotX[0], 0.42, 0.2, new THREE.Path(), (slotX[0] + slotX[1]) / 2, y));
  const mouth = new THREE.Path();
  mouth.absarc(BUZ.x, BUZ.y, 0.55, 0, Math.PI * 2, true);
  faceShape.holes.push(mouth);
  const faceMat = mat("grille", G.mid, { rough: 0.5, coat: 0.3 });
  addMesh(pg, plate(faceShape, ft, { bevel: 0.16, round: 3 }).translate(0, 0, -ft / 2), faceMat, { edges: false });
  // its outline only (the slots read by their depth: a line round each would crowd them from afar)
  const outline = edgesOf(plate(roundRect(W, H, R), ft, { bevel: 0.16, round: 3 }).translate(0, 0, -ft / 2), { color: BRAND.ink, width: 2, opacity: 0.75 });
  pg.add(outline);
  pg.userData.part.mats.add(outline.material);
  // a shallow groove round the ring, and the light's bezel
  addMesh(pg, lathe([[RING.r1 + 0.1, 0], [RING.r1 + 0.32, 0], [RING.r1 + 0.32, 0.06], [RING.r1 + 0.1, 0.06]], 64).rotateX(Math.PI / 2).translate(0, RING.y, ft / 2 - 0.01), mat("grille", 0x4d5359, { main: false }), { edges: false });
  const faceRing = [];
  for (let j = 0; j < 12; j++) {
    const m = glow(BRAND.veille, 1);
    m.color.set(0x1c2023);
    faceRing.push(m);
    addMesh(pg, arcSegment(j, RING.r0, RING.r1, 0.07).translate(0, RING.y, ft / 2 - 0.02), m, { edges: false });
  }
  const ledMat = glow(BRAND.veille, 1.3);
  addMesh(pg, new THREE.SphereGeometry(0.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2).translate(0, RING.y, ft / 2), ledMat, { edges: false });
  addMesh(pg, lathe([[0.42, 0], [0.62, 0], [0.62, 0.1], [0.42, 0.1]], 48).rotateX(Math.PI / 2).translate(0, RING.y, ft / 2 - 0.02), mat("grille", 0x4d5359, { main: false }), { edges: false });

  /* the membrane: a fine matt pastille in front of the cell */
  const pm = part("membrane");
  addMesh(pm, disc(1.6, 0.16, 0.05), mat("membrane", 0x959a9e, { rough: 0.9, metal: 0 }), { edgeOpacity: 0.7 });
  addMesh(pm, lathe([[1.2, 0], [1.26, 0], [1.26, 0.03], [1.2, 0.03]], 64).rotateX(Math.PI / 2).translate(0, 0, 0.08), mat("membrane", 0x7d8287, { main: false }), { edges: false });

  /* the electrode: the cell — a dark body, a grey crown, the PLATINUM face (the clearest thing of the system) */
  const pe = part("electrode");
  addMesh(pe, disc(1.6, 1.36, 0.12).translate(0, 0, -0.12), mat("electrode", G.dark, { rough: 0.45, coat: 0.2 }), { edgeOpacity: 0.6 });
  addMesh(pe, lathe([[1.12, 0], [1.62, 0], [1.62, 0.26], [1.12, 0.26]], 64, { bevel: 0.05 }).rotateX(Math.PI / 2).translate(0, 0, 0.56), mat("electrode", G.mid, { rough: 0.4, metal: 0.3 }), { edgeOpacity: 0.55 });
  const platinum = mat("electrode", G.clear, { rough: 0.42, metal: 0.3 });
  addMesh(pe, disc(1.1, 0.14, 0.04).translate(0, 0, 0.74), platinum, { edgeOpacity: 0.6 });
  for (const sx of [-0.55, 0.55]) addMesh(pe, disc(0.11, 0.55, 0.02).translate(sx, -0.2, -1.0), mat("electrode", G.mid, { main: false }), { edges: false });

  /* the board: the chip in the middle of its twelve LEDs, the printed trace from the cell's pad, a few parts */
  const pp = part("puce");
  addMesh(pp, plate(roundRect(9.4, 9.4, 1.0), 0.16, { bevel: 0.04 }).translate(0, 0, -0.08), mat("puce", 0x41474d, { rough: 0.7, metal: 0.05 }), { edgeOpacity: 0.7 });
  addMesh(pp, box(1.7, 1.7, 0.3, 0.06).translate(0, RING.y, 0.23), mat("puce", 0x25292d, { rough: 0.35, coat: 0.4 }), { edgeOpacity: 0.85 });
  const TRACE = [[CELL.x, CELL.y], [CELL.x, 0.9], [-1.25, 1.5], [-0.86, 1.6]];
  const traceMat = mat("puce", 0x8b9196, { rough: 0.35, metal: 0.4, main: false });
  for (let i = 0; i < TRACE.length - 1; i++) addMesh(pp, strip(TRACE[i], TRACE[i + 1], 0.16, 0.03).translate(0, 0, 0.095), traceMat, { edges: false });
  addMesh(pp, disc(0.3, 0.04, 0.01).translate(CELL.x, CELL.y, 0.1), traceMat, { edges: false }); // the cell's pad
  const pcbRing = [];
  for (let j = 0; j < 12; j++) {
    const a = Math.PI / 2 - ((j + 0.5) / 12) * Math.PI * 2;
    const m = glow(BRAND.veille, 1);
    m.color.set(0x2a2f33);
    pcbRing.push(m);
    addMesh(pp, box(0.5, 0.3, 0.16, 0.04).rotateZ(a + Math.PI / 2).translate(Math.cos(a) * 1.85, RING.y + Math.sin(a) * 1.85, 0.16), m, { edges: false });
  }
  const bits = mat("puce", 0x7a8086, { rough: 0.5, main: false });
  for (const [x, y, w, h] of [[2.6, 2.6, 1.0, 0.5], [2.6, 1.6, 1.0, 0.5], [-3.1, 3.2, 0.6, 1.2], [3.4, -0.4, 1.4, 0.7], [-3.6, -0.2, 0.7, 0.4]]) addMesh(pp, box(w, h, 0.3, 0.06).translate(x, y, 0.23), bits, { edgeOpacity: 0.5 });

  /* the buzzer: its housing (open in front), the piezo disc, its ceramic, its dot */
  const pb = part("buzzer");
  addMesh(pb, lathe([[1.18, -0.92], [1.4, -0.92], [1.4, 0.82], [1.18, 0.82]], 64, { bevel: 0.05 }).rotateX(Math.PI / 2), mat("buzzer", 0x484e54, { rough: 0.5 }), { edgeOpacity: 0.6 });
  addMesh(pb, disc(1.4, 0.12, 0.03).translate(0, 0, -0.86), mat("buzzer", 0x484e54, { main: false }), { edges: false });
  addMesh(pb, disc(1.22, 0.08, 0.02).translate(0, 0, 0.7), mat("buzzer", 0x7c8288, { rough: 0.35, metal: 0.4 }), { edgeOpacity: 0.55 });
  addMesh(pb, disc(0.8, 0.07, 0.02).translate(0, 0, 0.77), mat("buzzer", 0xa2a6a9, { rough: 0.6 }), { edgeOpacity: 0.5 });
  addMesh(pb, disc(0.2, 0.06, 0.02).translate(0, 0, 0.82), mat("buzzer", 0x6a7076, { main: false }), { edges: false });

  /* the battery: lying behind the board */
  const pl = part("pile");
  const pile = (geo, c, o) => addMesh(pl, geo.rotateZ(Math.PI / 2), mat("pile", c, o), { edgeOpacity: 0.6 });
  pile(cyl(0.7, 4.6, 0.08), 0x4a5056, { rough: 0.45, coat: 0.3 });
  pile(cyl(0.72, 0.9, 0.06).translate(0, -1.2, 0), 0x5d636a, { rough: 0.45, coat: 0.3, main: false }); // the band
  pile(cyl(0.7, 0.42, 0.08).translate(0, 2.51, 0), 0x8e9499, { rough: 0.35, metal: 0.4 });
  pile(cyl(0.7, 0.42, 0.08).translate(0, -2.51, 0), 0x8e9499, { rough: 0.35, metal: 0.4, main: false });
  pile(cyl(0.27, 0.26, 0.05).translate(0, 2.85, 0), 0x8e9499, { rough: 0.35, metal: 0.4, main: false });

  const order = ROW.order;
  const home = {};
  for (const n of order) home[n] = new THREE.Vector3(...SPEC[n].home);

  /* the light of each named part: behind it, so it stands against its own glow */
  const lamps = {};
  for (const n of order) {
    lamps[n] = makeBall(PALE, VEILLE, 4);
    root.add(lamps[n]);
  }

  /* the CO beads: in through the slots, across the membrane, onto the platinum — where they burn */
  const NB = 14;
  const beads = [];
  for (let i = 0; i < NB; i++) {
    const b = makeBall(SPALE, SIGNAL, 6);
    root.add(b);
    beads.push({ mesh: b, phase: fract(i * 0.618 + 0.11), jx: hash(i) * 2 - 1, jy: hash(i + 40) * 2 - 1 });
  }
  const PATH_A = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const PATH = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const segLen = [0, 0, 0];

  /* the current: a lead from the cell to the board's pad, then the printed trace to the chip */
  const NL = 10; //            points of the lead (a sagging curve)
  const NP = NL + TRACE.length - 1; // + the trace after the pad
  const pts = Array.from({ length: NP }, () => new THREE.Vector3());
  const cum = new Float32Array(NP);
  const flat = new Array(NP * 3).fill(0);
  const wire = fatLine(chunk(flat), { color: 0x80868b, width: 2.4, opacity: 0.9 });
  const sheath = fatLine(chunk(flat), { color: BRAND.veille, width: 3.2, opacity: 0, additive: true });
  sheath.renderOrder = 10;
  for (const l of [wire, sheath]) {
    l.frustumCulled = false;
    root.add(l);
  }
  const heads = [makeBall(PALE, VEILLE, 7), makeBall(PALE, VEILLE, 7)];
  for (const h of heads) root.add(h);
  /* the battery's leads (grey, unlit): battery → chip, chip → buzzer — what feeds the alarm */
  const NW = 9;
  const leads = [0, 1].map(() => {
    const l = fatLine(chunk(new Array(NW * 3).fill(0)), { color: 0x80868b, width: 2.4, opacity: 0 });
    l.frustumCulled = false;
    root.add(l);
    return l;
  });

  /* the alarm: the dome's light, the light on the wall, the rings from the mouth */
  const ledBall = makeBall(PALE, VEILLE, 5);
  const wallBall = makeBall(VEILLE.clone().multiplyScalar(0.6), VEILLE, 3);
  root.add(ledBall, wallBall);
  const rings = [];
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ringMaterial());
    m.renderOrder = 9;
    m.frustumCulled = false;
    m.visible = false;
    root.add(m);
    rings.push(m);
  }

  const A = {
    grille: anchor(parts.grille, 0, 0, ft / 2), membrane: anchor(parts.membrane, 0, 0, 0.1), electrode: anchor(parts.electrode, 0, 0, 0.82),
    puce: anchor(parts.puce, 0, RING.y, 0.4), buzzer: anchor(parts.buzzer, 0, 0, 0.85), pile: anchor(parts.pile, 0, 0, 0.72),
    led: anchor(parts.grille, 0, RING.y, ft / 2 + 0.4), face: anchor(root, 0, 0, D), centre: anchor(root, 0, 0, D / 2),
  };

  const v = new THREE.Vector3();
  const c = new THREE.Vector3();
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  const scale = {};
  const LIT = { grille: "litGrille", membrane: "litMembrane", electrode: "litElectrode", puce: "litPuce", buzzer: "litBuzzer", pile: "litPile" };

  /** A point of a part, given in its own (unscaled) frame, in root coordinates. */
  const at = (name, x, y, z, out) => out.set(x, y, z).multiplyScalar(scale[name]).add(parts[name].position);
  /** Writes a polyline into a fat line, in place. */
  function setLine(line, points, n) {
    const attr = line.geometry.attributes.instanceStart;
    const arr = attr.data.array;
    for (let i = 0; i < n - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      arr[i * 6] = a.x; arr[i * 6 + 1] = a.y; arr[i * 6 + 2] = a.z;
      arr[i * 6 + 3] = b.x; arr[i * 6 + 4] = b.y; arr[i * 6 + 5] = b.z;
    }
    attr.data.needsUpdate = true;
  }
  const wirePts = Array.from({ length: NW }, () => new THREE.Vector3());
  /** A sagging lead from a to b, `sag` cm down at its middle, into `wirePts`. */
  function sagging(a, b, sag, back) {
    for (let i = 0; i < NW; i++) {
      const t = i / (NW - 1);
      const s = 4 * t * (1 - t);
      wirePts[i].copy(a).lerp(b, t);
      wirePts[i].y -= sag * s;
      wirePts[i].z -= back * s;
    }
  }

  return {
    root, A, parts,
    update(P, time = 0) {
      const onBench = (P.bench ?? 0) > 0.5;
      const k = clamp01(P.explode ?? 0);
      const ke = smooth(k);
      const sniff = clamp01(P.sniff ?? 0);
      const current = clamp01(P.current ?? 0);
      const dose = clamp01(P.dose ?? 0);
      const alarm = clamp01(P.alarm ?? 0);

      /* the row */
      for (let i = 0; i < order.length; i++) {
        const n = order[i];
        const s = SPEC[n];
        const u = clamp01((k - s.delay) / SPAN);
        const ux = settle(ramp(u, 0.18, 1));
        const uz = ease(ramp(u, 0, 0.5));
        const tx = (i - (order.length - 1) / 2) * ROW.pitch;
        const h = home[n];
        let z = h.z + (ROW.z - h.z) * uz;
        if (n === "pile") z = h.z + (ROW.z - h.z) * ease(ramp(u, 0.5, 1)) - 3.2 * Math.sin(Math.PI * ramp(u, 0, 0.8)); // it leaves by the back
        parts[n].position.set(h.x + (tx - h.x) * ux, h.y + (ROW.y - h.y) * ux, z);
        scale[n] = 1 + (s.grow - 1) * smooth(ux);
        parts[n].scale.setScalar(scale[n]);
      }
      setPartOpacity(parts.case, 1 - 0.82 * ke);

      /* the parts the voice names */
      for (const n of order) {
        const lit = clamp01(P[LIT[n]] ?? 0);
        const s = SPEC[n];
        at(n, 0, 0, -s.hd - 0.9, v);
        lamps[n].position.copy(v);
        shine(lamps[n], lit * 0.6, s.size * scale[n] * 1.05, 0);
        for (const m of mains[n]) m.emissive.copy(VEILLE).multiplyScalar(lit * 0.07);
      }

      /* the count: the face's ring and the board's, segment by segment */
      for (let j = 0; j < 12; j++) {
        const a = smooth(clamp01(dose * 12 - j));
        faceRing[j].color.set(0x1c2023).lerp(VEILLE, a).multiplyScalar(1 + 0.75 * a);
        pcbRing[j].color.set(0x2a2f33).lerp(VEILLE, a).multiplyScalar(1 + 0.9 * a);
      }

      /* the beads: their path, assembled (straight in through the slots) and in the row (along it) */
      PATH_A[0].set(CELL.x, CELL.y, D + 7.5);
      PATH_A[1].set(CELL.x, CELL.y, D + 0.35);
      PATH_A[2].set(CELL.x, CELL.y, Z.membrane + 0.12);
      PATH_A[3].set(CELL.x, CELL.y, Z.cell + 0.84);
      at("grille", CELL.x, CELL.y, SPEC.grille.hd + 0.7, PATH[1]);
      PATH[0].copy(PATH[1]).add(c.set(-9, 0.6, 2.4));
      at("membrane", 0, 0, SPEC.membrane.hd + 0.8, PATH[2]);
      at("electrode", 0, 0, SPEC.electrode.hd + 0.06, PATH[3]);
      for (let j = 0; j < 4; j++) PATH[j].lerp(PATH_A[j], 1 - ke);
      let total = 0;
      for (let j = 0; j < 3; j++) total += segLen[j] = PATH[j].distanceTo(PATH[j + 1]);
      const T = 4.2; // a bead's whole life, seconds
      const many = sniff * NB;
      for (let i = 0; i < NB; i++) {
        const b = beads[i];
        const there = clamp01(many - i);
        if (there < 0.004) {
          b.mesh.visible = false;
          continue;
        }
        const u = fract(time / T + b.phase);
        const go = Math.min(1, u / 0.7); // travelling, then resting on the platinum
        let s = go * total;
        let j = 0;
        while (j < 2 && s > segLen[j]) s -= segLen[j++];
        b.mesh.position.copy(PATH[j]).lerp(PATH[j + 1], segLen[j] > 1e-4 ? s / segLen[j] : 1);
        const loose = (1 - go) ** 1.3; // the bead wanders while far, and goes straight once sucked in
        b.mesh.position.x += b.jx * 2.2 * loose * (1 - ke);
        b.mesh.position.y += b.jy * (1.3 + 0.9 * ke) * loose;
        b.mesh.position.z += b.jx * 1.4 * loose * ke;
        // …and lands on its own spot of the platinum, not all on its centre
        const near = smooth(ramp(go, 0.6, 1)) * ke * scale.electrode;
        b.mesh.position.x += b.jx * 0.55 * near;
        b.mesh.position.y += b.jy * 0.55 * near;
        // it burns: a glint that swells and dies (oxidised, no flame)
        const burn = Math.sin(Math.PI * ramp(u, 0.7, 0.93)) * (u < 0.93 ? 1 : 0);
        const gone = 1 - ramp(u, 0.86, 0.95);
        const born = ramp(u, 0, 0.07);
        const m = b.mesh.material.uniforms;
        m.uHeart.value.copy(SPALE).lerp(HOT, burn);
        shine(b.mesh, there * born * gone * (0.8 + 0.9 * burn), 0.95 * (1 + 0.9 * burn), 3.2);
      }

      /* the current: the lead (cell → pad) and the printed trace (pad → chip) */
      // it leaves the cell by its rim, on the chip's side: in a close frame of the platinum, the head is seen setting off
      at("electrode", 1.62 * ke, -0.25, -0.75 + 0.35 * ke, from);
      at("puce", CELL.x, CELL.y, 0.12, to);
      c.copy(from).lerp(to, 0.5);
      c.y -= 2.6 * ke;
      c.z += 0.6 * ke;
      for (let i = 0; i < NL; i++) {
        const t = i / (NL - 1);
        const a = (1 - t) * (1 - t);
        const bq = 2 * t * (1 - t);
        const cq = t * t;
        pts[i].set(a * from.x + bq * c.x + cq * to.x, a * from.y + bq * c.y + cq * to.y, a * from.z + bq * c.z + cq * to.z);
      }
      for (let i = 1; i < TRACE.length; i++) at("puce", TRACE[i][0], TRACE[i][1], 0.12, pts[NL - 1 + i]);
      cum[0] = 0;
      for (let i = 1; i < NP; i++) cum[i] = cum[i - 1] + pts[i].distanceTo(pts[i - 1]);
      setLine(wire, pts, NP);
      setLine(sheath, pts, NP);
      wire.visible = ke > 0.02;
      wire.material.opacity = 0.9 * smooth(ramp(ke, 0.02, 0.4));
      // assembled, the current runs under the face: seen through it, softer
      const through = ke < 0.35;
      const seen = through ? 0.5 : 1;
      sheath.material.depthTest = !through;
      sheath.material.opacity = Math.min(1, current * 0.55 * seen);
      sheath.visible = current > 0.004;
      const len = cum[NP - 1];
      for (let h = 0; h < heads.length; h++) {
        const ball = heads[h];
        const q = fract(time * 0.62 + h / heads.length); // along the path, at ≈ 13 cm/s in the row
        let s = q * len;
        let i = 1;
        while (i < NP - 1 && cum[i] < s) i++;
        const seg = cum[i] - cum[i - 1];
        ball.position.copy(pts[i - 1]).lerp(pts[i], seg > 1e-4 ? (s - cum[i - 1]) / seg : 0);
        ball.material.depthTest = !through;
        const ends = smooth(ramp(q, 0, 0.08)) * (1 - smooth(ramp(q, 0.9, 1)));
        shine(ball, current * 1.5 * seen * ends, (0.9 + 0.9 * ke) * Math.max(scale.puce, 1), 4.5);
      }

      /* what feeds the alarm: battery → chip, chip → buzzer (grey, unlit; only apart) */
      const show = smooth(ramp(ke, 0.35, 0.8));
      at("pile", -2.75, 0, 0, from);
      at("puce", 4.3, -3.9, 0.1, to);
      sagging(from, to, 7 * ke, 1);
      setLine(leads[0], wirePts, NW);
      at("puce", 4.3, -3.4, 0.1, from);
      at("buzzer", -0.5, -1.2, -0.3, to);
      sagging(from, to, 4 * ke, 0.6);
      setLine(leads[1], wirePts, NW);
      for (const l of leads) {
        l.visible = show > 0.01;
        l.material.opacity = 0.9 * show;
      }

      /* the alarm */
      setGlowK(ledMat, 1.3 + 1.1 * alarm);
      at("grille", 0, RING.y, SPEC.grille.hd + 0.5, v);
      ledBall.position.copy(v);
      shine(ledBall, 0.32 + 0.8 * alarm, (2.0 + 1.6 * alarm) * scale.grille, 3);
      wallBall.position.set(0, RING.y * 0.4, Z.back + 0.4);
      shine(wallBall, onBench ? 0 : (0.05 + 0.22 * alarm) * (1 - ke), 13 + 7 * alarm, 0);
      at("buzzer", 0, 0, SPEC.buzzer.hd + 0.06, v);
      c.set(BUZ.x, BUZ.y, D + 0.08);
      v.lerp(c, 1 - ke);
      for (let i = 0; i < rings.length; i++) {
        const ring = rings[i];
        const u = fract(time / 3.2 + i / rings.length); // one leaves every 0.8 s
        const r = 0.8 + 12 * u;
        const a = alarm * (1 - u) ** 1.6 * smooth(ramp(u, 0, 0.1)) * 0.9;
        ring.visible = a > 0.004;
        if (!ring.visible) continue;
        const w = 0.22 + 0.045 * r;
        const size = r + 3 * w;
        ring.position.copy(v);
        ring.scale.setScalar(size);
        const U = ring.material.uniforms;
        U.uSize.value = size;
        U.uR.value = r;
        U.uW.value = w;
        U.uAmount.value = a;
      }
    },
  };
}

/** [x, y, z, …] → [[x, y, z], …] (fatLine takes points). */
function chunk(flat) {
  const out = [];
  for (let i = 0; i < flat.length; i += 3) out.push([flat[i] + i * 1e-3, flat[i + 1], flat[i + 2]]);
  return out;
}
function setGlowK(m, k) {
  m.color.copy(m.userData.hue).multiplyScalar(k);
}

/* ─────────────────────────────────────────────────────────── the blood (a maquette) */

/** The biconcave profile of a red cell (Evans & Fung), radius `r`: [radius, height] points for a lathe, from the top centre round the rim. */
function cellProfile(r) {
  const half = (rho) => 0.5 * Math.sqrt(Math.max(0, 1 - rho * rho)) * (0.81 + 7.83 * rho * rho - 4.39 * rho ** 4) * (r / 3.91);
  const top = [];
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const rho = Math.sin(((i / n) * Math.PI) / 2); // denser toward the rim
    top.push([rho * r, Math.max(half(rho), i === n ? 0 : 0.02)]);
  }
  const bottom = top.slice(0, -1).reverse().map(([x, y]) => [x, -y]);
  return [...top, ...bottom];
}

export function buildBlood() {
  const group = new THREE.Group();
  group.name = "blood";
  const { len: L, r: RV } = BLOOD;

  /* the vessel: a length of glass, its two cut ends drawn */
  const wallMat = glass(BRAND.ink, { base: 0.0, rim: 0.22, edge: 0.45, spec: 0.35, through: 0.25 });
  const vessel = new THREE.Mesh(new THREE.CylinderGeometry(RV, RV, L, 64, 1, true).rotateZ(Math.PI / 2), wallMat);
  asShell(vessel, 22);
  group.add(vessel);
  const ends = [];
  for (const x of [-L / 2, L / 2]) {
    const ring = [];
    for (let i = 0; i <= 64; i++) ring.push([x, RV * Math.cos((i / 64) * Math.PI * 2), RV * Math.sin((i / 64) * Math.PI * 2)]);
    const line = fatLine(ring, { color: BRAND.ink, width: 2, opacity: 0.5 });
    ends.push(line);
    group.add(line);
  }

  /* the cells: biconcave discs of clear glass, drifting, each with four beads at its rim */
  const NC = 9;
  const RC = 3.0;
  const cellGeo = lathe(cellProfile(RC), 64);
  const cells = [];
  const NBC = 4;
  let j = 0;
  for (let ci = 0; ci < NC; ci++) {
    const holder = new THREE.Group();
    const m = glass(BRAND.ink, { base: 0.012, rim: 0.3, edge: 0.55, spec: 0.3, through: 0.2 });
    const mesh = new THREE.Mesh(cellGeo, m);
    asShell(mesh, 18);
    holder.add(mesh);
    const beads = [];
    for (let b = 0; b < NBC; b++) {
      const a = (b / NBC) * Math.PI * 2 + 0.4;
      const base = new THREE.Vector3(Math.cos(a) * RC * 0.72, 0, Math.sin(a) * RC * 0.72);
      const o2 = makeBall(PALE, VEILLE, 5);
      const co = makeBall(SPALE, SIGNAL, 5);
      holder.add(o2, co);
      beads.push({ base, o2, co, th: 0.02 + 0.94 * fract(j * 0.618 + 0.23) });
      j++;
    }
    const rho = 1.2 + 3.4 * hash(ci + 7);
    const ang = hash(ci + 17) * Math.PI * 2;
    cells.push({ holder, mat: m, beads, off: ci / NC + 0.05 * hash(ci + 3), y: rho * Math.cos(ang), z: rho * Math.sin(ang), tilt: [hash(ci + 29) * 2.4 - 1.2, hash(ci + 31) * 3, hash(ci + 37) * 2.4 - 1.2], spin: 0.18 + 0.12 * hash(ci + 41) });
    group.add(holder);
  }
  const SPEED = 2.4; // cm/s along the vessel

  return {
    group,
    update(P, time = 0) {
      const a = clamp01(P.micro ?? 0);
      group.visible = a > 0.001;
      if (!group.visible) return;
      const swap = clamp01(P.swap ?? 0);
      wallMat.uniforms.uAmount.value = a;
      for (const e of ends) e.material.opacity = 0.5 * a;
      for (let ci = 0; ci < NC; ci++) {
        const cell = cells[ci];
        const x = -L / 2 + fract(cell.off + (time * SPEED) / L) * L;
        // a cell enters and leaves the cut ends softly
        const f = smooth(ramp(x, -L / 2, -L / 2 + 7)) * (1 - smooth(ramp(x, L / 2 - 7, L / 2))) * a;
        const h = cell.holder;
        h.position.set(x, cell.y + 0.35 * Math.sin(time * 0.5 + ci), cell.z + 0.3 * Math.cos(time * 0.4 + ci * 1.7));
        h.rotation.set(cell.tilt[0] + 0.12 * Math.sin(time * 0.3 + ci), cell.tilt[1] + time * cell.spin, cell.tilt[2]);
        cell.mat.uniforms.uAmount.value = f;
        h.visible = f > 0.004;
        for (const b of cell.beads) {
          // the CO bead flies in as the oxygen one leaves: never one colour halfway into the other
          const s = smooth(clamp01((swap - b.th) / 0.07));
          const out = 1 + 0.9 * s;
          const into = 1 + 1.1 * (1 - s);
          b.o2.position.set(b.base.x * out, b.base.y, b.base.z * out);
          b.co.position.set(b.base.x * into, b.base.y, b.base.z * into);
          shine(b.o2, f * (1 - s), 1.5, 4);
          shine(b.co, f * s, 1.5, 4);
        }
      }
    },
  };
}
