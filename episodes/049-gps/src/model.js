// DOSSIER 049 — GPS : THE PHONE (the system, solid). docs/049-decors.md › model.js.
//
//   buildPhone() → { root, parts, A, fx, update(p, time, px) }
//   p = { bench, explode, peek, quartz, qBeat, tremble, screen, map, strike, err, eta, litChip, litQuartz }
//
// Its OWN frame: centre on the origin, portrait, the screen facing +z, its top +y (world.js puts it in the holder,
// or stands it on the bench). An unbranded phone: no logo, no notch. Three greys: the dark back and glass, the mid
// aluminium frame and battery, the light parts the voice names (the receiver chip — the hero, the lightest —, its
// antenna trace, the quartz can). Layers, from the screen backwards: glass+screen, frame, board (chip, antenna,
// quartz), battery, back.
//
// THE SCREEN is a night navigation map drawn by the phone itself: two canvases drawn ONCE (the road alone; the rest
// of the map: the T junction, the hatched field on the right and its ditch), windowed by the texture offset so the
// junction slides down towards you with `eta` without a redraw. The blue dot (#3B8CFF, the film's one exception:
// the phone's own icon) and its accuracy halo are meshes over it: `err` pushes them off the road into the field.
// `strike` draws a signal stroke across the map, `map` 0 erases all but the road; a clock then runs in millionths
// (a small canvas, redrawn only when its string changes).
//
// PEEK (in the car): back, frame and screen go glass (their glass twins rise, the solids fade); the board and its
// chip, antenna, quartz stay solid. EXPLODE (on the bench): the layers part in a ROW ACROSS the camera — each step
// +x and +z, so seen from az ≈ −48 they lie side by side at the same depth, the board in the middle; the chip,
// the antenna and the quartz rise off the board.
// THE QUARTZ: a can open on top, a tuning-fork blade inside that glows; `qBeat` (a counter) swells and lets fall a
// soft light on each beat — never a blink; `tremble` shakes the blade; `quartz` 0 veille → 1 signal, frank.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, setGlow, box, cyl, plate, anchor, makePart, addMesh, setPartOpacity, edgesOf, mergeGeometries, placed } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";
import { PHONE, MPS } from "./plan.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const DOT_BLUE = 0x3b8cff; // the phone's own icon: the ONLY blue of the film (the voice says « point bleu »)

/* ── the screen's geometry (phone frame, cm) and the map's (canvas) ── */
const SW = PHONE.w * 0.9; //   6.48: the lit area
const SH = PHONE.h * 0.94; //  14.1
const CW = 360, CH = 1560; //  the map canvas: 400 m of road at 3.9 px/m; the screen shows half of it (200 m)
const SPAN = 200; //           metres the screen shows, bottom to top
const DOT_V = 0.3; //          the dot sits 30 % up the screen (navigation apps keep you low)
const T_V = 0.9; //            the junction's near edge on the canvas (v from the bottom)
const ROAD = [0.36, 0.49]; //  the road, in canvas widths
const ROAD_C = (ROAD[0] + ROAD[1]) / 2;
const DITCH_U = 0.58, FIELD_U = 0.61, DOT_FIELD = 0.8; // the ditch, the field's edge, where `err` 1 lands the dot
const T_H = 50; //             the crossing road's height on the canvas (px)
/** How far the screen's window into the canvas is slid: the junction's near edge `gap` metres ahead of the dot. */
const windowFor = (gap) => T_V - 0.5 * (DOT_V + gap / SPAN);

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}
function texture(c, window = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  if (window) t.repeat.set(1, 0.5);
  return t;
}

/** The road alone, on the screen's night (what stays when the map is erased). */
function drawRoad() {
  const [c, g] = canvas(CW, CH);
  g.fillStyle = "#0b1013";
  g.fillRect(0, 0, CW, CH);
  const far = CH * (1 - T_V) - T_H; // your road ends at the T's far edge
  g.fillStyle = "#8e8b84";
  g.fillRect(ROAD[0] * CW, far, (ROAD[1] - ROAD[0]) * CW, CH - far);
  g.fillStyle = "#c9c4b8"; // its two edges a shade lighter: a road, not a bar
  g.fillRect(ROAD[0] * CW, far, 4, CH - far);
  g.fillRect(ROAD[1] * CW - 4, far, 4, CH - far);
  return c;
}

/** The rest of the map, on a transparent canvas: the land's faint paths, the field and its ditch, the T. */
function drawMap() {
  const [c, g] = canvas(CW, CH);
  const r = rng(49);
  const near = CH * (1 - T_V), far = near - T_H;
  // faint paths over the land on the left and past the hedge: the map has a country around the road
  g.strokeStyle = "#1c2429";
  g.lineWidth = 5;
  for (let i = 0; i < 7; i++) {
    g.beginPath();
    let x = r() * CW * 0.3, y = far + 40 + r() * (CH - far);
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += (r() - 0.6) * 60; y += 50 + r() * 70; g.lineTo(Math.max(0, Math.min(ROAD[0] * CW - 8, x)), y); }
    g.stroke();
  }
  // the field on your right: a dim plot, hatched (ploughed rows), from its edge to the screen's edge
  g.fillStyle = "#1c2427";
  g.fillRect(FIELD_U * CW, near + 10, CW, CH);
  g.save();
  g.beginPath();
  g.rect(FIELD_U * CW, near + 10, CW, CH);
  g.clip();
  g.strokeStyle = "#47535a";
  g.lineWidth = 5;
  for (let k = -CW; k < CH + CW; k += 19) {
    g.beginPath();
    g.moveTo(FIELD_U * CW, near + k);
    g.lineTo(CW, near + k - (1 - FIELD_U) * CW * 0.9);
    g.stroke();
  }
  g.restore();
  g.strokeStyle = "#4c5459"; // the field's edge
  g.lineWidth = 3;
  g.strokeRect(FIELD_U * CW, near + 10, CW, CH);
  // the ditch between the verge and the field: a dashed line
  g.strokeStyle = "#7b8286";
  g.lineWidth = 5;
  g.setLineDash([22, 14]);
  g.beginPath();
  g.moveTo(DITCH_U * CW, near + 14);
  g.lineTo(DITCH_U * CW, CH);
  g.stroke();
  g.setLineDash([]);
  // the T: the crossing road, the whole width (your road ends against it)
  g.fillStyle = "#8e8b84";
  g.fillRect(0, far, CW, T_H);
  g.fillStyle = "#c9c4b8";
  g.fillRect(0, far, CW, 4);
  g.fillRect(0, far + T_H - 4, ROAD[0] * CW + 4, 4);
  g.fillRect(ROAD[1] * CW - 4, far + T_H - 4, CW, 4);
  // past it, the hedge (a dotted line) and the dark field beyond
  g.fillStyle = "#59626a";
  for (let x = 6; x < CW; x += 18) g.fillRect(x, far - 22, 9, 7);
  g.strokeStyle = "#20292d";
  g.lineWidth = 4;
  for (let y = far - 44; y > 0; y -= 17) { g.beginPath(); g.moveTo(0, y); g.lineTo(CW, y - 20); g.stroke(); }
  return c;
}

/** The dot: a blue disc in a white ring, its heading cone fanning upwards. */
function drawDot() {
  const [c, g] = canvas(256, 256);
  const cx = 128, cy = 150;
  const cone = g.createRadialGradient(cx, cy, 10, cx, cy, 120);
  cone.addColorStop(0, "rgba(59,140,255,0.75)");
  cone.addColorStop(1, "rgba(59,140,255,0)");
  g.fillStyle = cone;
  g.beginPath();
  g.moveTo(cx, cy);
  g.arc(cx, cy, 120, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55);
  g.closePath();
  g.fill();
  g.fillStyle = "#f4f1ea";
  g.beginPath(); g.arc(cx, cy, 40, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#3b8cff";
  g.beginPath(); g.arc(cx, cy, 31, 0, Math.PI * 2); g.fill();
  return c;
}
/** The accuracy halo: a pale blue disc with a crisper rim. */
function drawHalo() {
  const [c, g] = canvas(256, 256);
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 124);
  grad.addColorStop(0, "rgba(59,140,255,0.22)");
  grad.addColorStop(0.86, "rgba(59,140,255,0.28)");
  grad.addColorStop(0.93, "rgba(59,140,255,0.6)");
  grad.addColorStop(1, "rgba(59,140,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return c;
}
/** A soft light (the quartz's beat). */
function drawSoft() {
  const [c, g] = canvas(128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 62);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return c;
}

/** A rounded rectangle outline (for plate()), optionally with a rounded hole. */
function rrect(w, h, r, x = 0, y = 0) {
  const s = new THREE.Shape();
  const a = x - w / 2, b = y - h / 2;
  s.moveTo(a + r, b);
  s.lineTo(a + w - r, b); s.quadraticCurveTo(a + w, b, a + w, b + r);
  s.lineTo(a + w, b + h - r); s.quadraticCurveTo(a + w, b + h, a + w - r, b + h);
  s.lineTo(a + r, b + h); s.quadraticCurveTo(a, b + h, a, b + h - r);
  s.lineTo(a, b + r); s.quadraticCurveTo(a, b, a + r, b);
  return s;
}
const ring = (w, h, r, inset, ri) => {
  const s = rrect(w, h, r);
  const hole = new THREE.Path(rrect(w - 2 * inset, h - 2 * inset, ri).getPoints(12));
  s.holes.push(hole);
  return s;
};

export function buildPhone() {
  const root = new THREE.Group();
  root.name = "phone";
  const body = new THREE.Group(); // lowered on the bench so the phone stands on its bottom edge
  root.add(body);
  const { w, h, t } = PHONE;
  const R = 0.9; // the corners' radius

  /* ── the parts (each its own materials: each can fade) ── */
  const screen = makePart("screen");
  const frame = makePart("frame");
  const board = makePart("board");
  const battery = makePart("battery");
  const back = makePart("back");
  const order = [screen, frame, board, battery, back]; // from the screen backwards: the board in the middle
  const Z0 = [t / 2 - 0.04, 0, -0.06, -0.17, -t / 2 + 0.05];
  order.forEach((p, i) => { p.userData.z0 = Z0[i]; p.position.z = Z0[i]; body.add(p); });

  // BACK: a dark glass-and-metal plate, its camera island (two lenses, a flash), no logo
  const backGeo = plate(rrect(w, h, R), 0.1, { bevel: 0.04 }).translate(0, 0, -0.05);
  const backSolid = addMesh(back, backGeo, solid(0x30373d, { rough: 0.32, metal: 0.25, coat: 0.6 }), { edgeOpacity: 0.85 });
  const islandMat = solid(0x262c31, { rough: 0.3, metal: 0.3, coat: 0.7 });
  addMesh(back, plate(rrect(2.7, 2.7, 0.7), 0.14, { bevel: 0.05 }), islandMat, { pos: [-1.85, 5.35, -0.19], edgeOpacity: 0.7 });
  const lensRim = solid(0x8d939a, { rough: 0.3, metal: 0.45 });
  const lensGlass = solid(0x07090b, { rough: 0.08, metal: 0.2, coat: 1 });
  for (const [x, y] of [[-2.45, 5.95], [-2.45, 4.75]]) {
    addMesh(back, cyl(0.5, 0.14, 0.04, 48), lensRim, { pos: [x, y, -0.3], rot: [Math.PI / 2, 0, 0], edgeOpacity: 0.6 });
    addMesh(back, cyl(0.34, 0.06, 0.02, 48), lensGlass, { pos: [x, y, -0.38], rot: [Math.PI / 2, 0, 0], edges: false });
  }
  addMesh(back, cyl(0.17, 0.06, 0.02, 24), solid(0xbab5aa, { rough: 0.5 }), { pos: [-1.2, 5.95, -0.27], rot: [Math.PI / 2, 0, 0], edges: false });

  // BATTERY: a pouch, mid grey, its flex tail up to the board
  const batMat = solid(0x5c6268, { rough: 0.75 });
  addMesh(battery, box(5.9, 7.4, 0.26, 0.18), batMat, { pos: [0, -3.0, 0] });
  addMesh(battery, box(1.4, 0.9, 0.06, 0.03), solid(0x3b4146, { rough: 0.6 }), { pos: [1.6, 1.05, 0.08], edgeOpacity: 0.6 });
  addMesh(battery, box(4.6, 0.05, 0.02, 0.01), solid(0x7b8187, { rough: 0.6 }), { pos: [0, -5.9, 0.14], edges: false }); // a pull-tab seam

  // BOARD: a dark grey PCB around the camera notch; its parts in low relief, the three the voice names light
  const pcb = new THREE.Shape();
  [[-3.2, 0.95], [3.2, 0.95], [3.2, 6.95], [-0.85, 6.95], [-0.85, 4.15], [-3.2, 4.15]].forEach(([x, y], i) => (i ? pcb.lineTo(x, y) : pcb.moveTo(x, y)));
  addMesh(board, plate(pcb, 0.08, { bevel: 0.025 }).translate(0, 0, -0.04), solid(0x2a3136, { rough: 0.8 }), { edgeOpacity: 0.75 });
  // the processor under its shield can (mid grey), and a field of small parts (one merged mesh, no outlines)
  addMesh(board, box(2.3, 1.7, 0.18, 0.05), solid(0x6a7177, { rough: 0.45, metal: 0.35 }), { pos: [-1.95, 2.45, 0.1], edgeOpacity: 0.7 });
  const r = rng(7);
  const bits = [];
  for (let i = 0; i < 46; i++) {
    const x = -3 + r() * 6, y = 1.15 + r() * 5.6;
    if (x < -0.85 && y > 4.0) continue; // the notch
    if (Math.abs(x - PHONE.chip[0]) < 1.25 && Math.abs(y - PHONE.chip[1]) < 1.25) continue;
    if (Math.abs(x - PHONE.quartz[0]) < 1.0 && Math.abs(y - PHONE.quartz[1]) < 0.75) continue;
    if (x < -0.7 && y > 1.45 && y < 3.4) continue; // the shield
    if (y > 6.2) continue; // the antenna's lane
    const big = r() > 0.8;
    bits.push(placed(box(big ? 0.55 : 0.22, big ? 0.4 : 0.12, big ? 0.12 : 0.08, 0.02, 1), { pos: [x, y, 0.06] }));
  }
  addMesh(board, mergeGeometries(bits), solid(0x4a5157, { rough: 0.6 }), { edges: false });
  // the connector to the screen: a small block near the bottom
  addMesh(board, box(1.6, 0.5, 0.14, 0.04), solid(0x3e454b, { rough: 0.55 }), { pos: [-1.7, 1.25, 0.07], edgeOpacity: 0.6 });

  // THE RECEIVER CHIP — the hero: the lightest thing in the phone, on its own small group (it rises off the board)
  const chipG = new THREE.Group();
  chipG.position.set(PHONE.chip[0], PHONE.chip[1], 0);
  board.add(chipG);
  const chipMat = solid(0xd9dad5, { rough: 0.38, metal: 0.15 });
  chipMat.emissive = new THREE.Color(BRAND.veille);
  chipMat.emissiveIntensity = 0;
  chipG.add(addMesh(board, box(1.7, 1.7, 0.26, 0.05), chipMat, { pos: [0, 0, 0.13] }));
  const pinMark = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), solid(0x5d6368, { rough: 0.6 }));
  pinMark.position.set(-0.55, 0.55, 0.265);
  chipG.add(pinMark);
  board.userData.part.mats.add(pinMark.material);
  const chipRingMat = glow(BRAND.veille, 1.3, { opacity: 0.999 });
  const chipRing = new THREE.Mesh(plate(ring(2.15, 2.15, 0.12, 0.13, 0.06), 0.03, { bevel: 0.01 }), chipRingMat);
  chipRing.position.z = 0.02;
  chipG.add(chipRing);

  // THE ANTENNA — a light trace near the top edge (an L), its feed line down to the chip
  const antG = new THREE.Group();
  board.add(antG);
  const antMat = solid(0xc7c1b3, { rough: 0.4, metal: 0.4 });
  antMat.emissive = new THREE.Color(BRAND.veille);
  antMat.emissiveIntensity = 0;
  const [ax, ay] = PHONE.antenna;
  const trace = [
    placed(box(3.9, 0.32, 0.05, 0.02, 1), { pos: [ax + 1.0, ay, 0.06] }),
    placed(box(0.32, 1.5, 0.05, 0.02, 1), { pos: [ax + 2.79, ay - 0.59, 0.06] }),
    placed(box(0.14, 3.1, 0.04, 0.02, 1), { pos: [ax + 2.79, PHONE.chip[1] + 1.6, 0.05] }), // the feed line
    placed(box(1.0, 0.14, 0.04, 0.02, 1), { pos: [PHONE.chip[0] + 1.1, PHONE.chip[1] + 0.05, 0.05] }),
  ];
  const antMesh = addMesh(board, mergeGeometries(trace), antMat, { edgeOpacity: 0.7 });
  antG.add(antMesh);

  // THE QUARTZ — a can open on top; inside, the tuning-fork blade that glows and beats
  const qG = new THREE.Group();
  qG.position.set(PHONE.quartz[0], PHONE.quartz[1], 0);
  board.add(qG);
  const canMat = solid(0xa6aaa8, { rough: 0.35, metal: 0.4 });
  const can = addMesh(board, plate(ring(1.7, 0.95, 0.16, 0.13, 0.06), 0.34, { bevel: 0.03 }), canMat, { edgeOpacity: 0.8 });
  const canFloor = addMesh(board, box(1.6, 0.86, 0.04, 0.01), solid(0x22282c, { rough: 0.7 }), { pos: [0, 0, 0.03], edges: false });
  qG.add(can, canFloor);
  const quartzMat = glow(BRAND.veille, 1.2);
  const fork = new THREE.Group();
  fork.position.set(-0.42, 0, 0.2);
  const tineGeo = box(0.8, 0.12, 0.1, 0.04, 2);
  const tineA = new THREE.Mesh(tineGeo, quartzMat);
  const tineB = new THREE.Mesh(tineGeo, quartzMat);
  const stem = new THREE.Mesh(box(0.18, 0.4, 0.1, 0.04, 2), quartzMat);
  tineA.position.set(0.5, 0.13, 0); tineB.position.set(0.5, -0.13, 0); stem.position.set(0.05, 0, 0);
  fork.add(tineA, tineB, stem);
  qG.add(fork);
  board.userData.part.mats.add(quartzMat);
  const softTex = texture(drawSoft());
  const beatMat = new THREE.SpriteMaterial({ map: softTex, color: new THREE.Color(BRAND.veille), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, opacity: 0 });
  const beat = new THREE.Sprite(beatMat);
  beat.position.set(0, 0, 0.35);
  beat.renderOrder = 6;
  qG.add(beat);

  // FRAME: the aluminium band, its buttons, the port and the speaker holes at the bottom
  const frameMat = solid(0x858b91, { rough: 0.55, metal: 0.3 });
  addMesh(frame, plate(ring(w, h, R, 0.24, R - 0.2), t - 0.06, { bevel: 0.06, round: 3 }).translate(0, 0, -(t - 0.06) / 2), frameMat, { edgeOpacity: 0.9 });
  const btnMat = solid(0x9aa0a5, { rough: 0.5, metal: 0.3 });
  for (const [x, y, l] of [[-w / 2 - 0.05, 3.6, 1.5], [-w / 2 - 0.05, 1.7, 1.5], [w / 2 + 0.05, 2.7, 2.2]]) addMesh(frame, box(0.14, l, 0.34, 0.06), btnMat, { pos: [x, y, 0], edgeOpacity: 0.6 });
  const holeMat = solid(0x0d1012, { rough: 0.8 });
  addMesh(frame, box(1.0, 0.16, 0.34, 0.07), holeMat, { pos: [0, -h / 2 + 0.06, 0], edges: false });
  const holes = [];
  for (let i = 0; i < 5; i++) holes.push(placed(cyl(0.05, 0.2, 0.01, 12), { pos: [1.2 + i * 0.25, -h / 2 + 0.05, 0] }));
  addMesh(frame, mergeGeometries(holes), holeMat, { edges: false });

  // SCREEN: the front glass (near-black, glossy) and on it the lit map, the dot, the strike, the clock
  addMesh(screen, plate(rrect(w - 0.1, h - 0.1, R - 0.05), 0.08, { bevel: 0.03 }).translate(0, 0, -0.04), solid(0x0a0d10, { rough: 0.12, coat: 1 }), { edgeOpacity: 0.7 });
  const display = new THREE.Group();
  display.position.z = 0.045;
  screen.add(display);
  const basic = (map, o = {}) => new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, fog: false, ...o });
  const roadTex = texture(drawRoad(), true);
  const mapTex = texture(drawMap(), true);
  const screenMat = basic(roadTex);
  const mapMat = basic(mapTex);
  const plane = new THREE.PlaneGeometry(SW, SH);
  const roadPlane = new THREE.Mesh(plane, screenMat);
  const mapPlane = new THREE.Mesh(plane, mapMat);
  mapPlane.position.z = 0.004;
  roadPlane.renderOrder = 4; mapPlane.renderOrder = 5;
  display.add(roadPlane, mapPlane);
  const haloMat = basic(texture(drawHalo()));
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), haloMat);
  halo.renderOrder = 6;
  const dotMat = basic(texture(drawDot()));
  dotMat.color.setScalar(1.25); // a touch over white: the dot is the brightest thing on the screen
  const dot = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), dotMat);
  dot.renderOrder = 7;
  const dotG = new THREE.Group();
  dotG.add(halo, dot);
  halo.position.z = 0.008; dot.position.z = 0.012;
  dot.position.y = -0.21; // the canvas centres the disc a little below its middle (the cone fans upward)
  display.add(dotG);
  // the strike: a signal stroke from the top-left corner to the bottom-right, growing with `strike`
  const diag = Math.hypot(SW * 0.86, SH * 0.86);
  const strikeMat = glow(BRAND.signal, 1.7, { opacity: 0.999 });
  strikeMat.depthWrite = false;
  const strikeBar = new THREE.Mesh(box(diag, 0.34, 0.02, 0.01, 1).translate(diag / 2, 0, 0), strikeMat);
  strikeBar.position.set(-SW * 0.43, SH * 0.43, 0.02);
  strikeBar.rotation.z = -Math.atan2(SH * 0.86, SW * 0.86);
  strikeBar.renderOrder = 8;
  display.add(strikeBar);
  // the clock in millionths (when the map is gone)
  const [clockC, cg] = canvas(512, 256);
  const clockTex = texture(clockC);
  const clockMat = basic(clockTex);
  const clockPlane = new THREE.Mesh(new THREE.PlaneGeometry(SW * 0.94, SW * 0.47), clockMat);
  clockPlane.position.set(0, SH * 0.2, 0.01);
  clockPlane.renderOrder = 6;
  display.add(clockPlane);
  let clockText = "";
  const drawClock = (s) => {
    cg.clearRect(0, 0, 512, 256);
    cg.fillStyle = "rgba(11,16,19,0.94)"; // its own dark card: the road does not run through the digits
    cg.beginPath();
    cg.roundRect(8, 8, 496, 240, 28);
    cg.fill();
    cg.fillStyle = "#e9e4d8";
    cg.textAlign = "center";
    cg.textBaseline = "middle";
    cg.font = "700 92px 'JetBrains Mono', monospace";
    cg.fillText(s.slice(0, 8), 256, 72);
    cg.font = "700 104px 'JetBrains Mono', monospace";
    cg.fillText(s.slice(8), 256, 186);
    clockTex.needsUpdate = true;
  };
  const pad = (n, k) => String(n).padStart(k, "0");

  /* ── PEEK: the glass twins of back, frame and screen (the same shapes, X-ray) ── */
  const twins = [];
  const twin = (geo, z, part) => {
    const mat = glass(BRAND.ink, { base: 0, rim: 0.22, power: 2.6, edge: 0.55, spec: 0.35, through: 0.25 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = z;
    const lines = edgesOf(geo, { color: BRAND.ink, width: 1.8, opacity: 0.5 });
    mesh.add(lines);
    asShell(mesh, 20);
    mesh.visible = false;
    body.add(mesh);
    twins.push({ mesh, mat, lines, part });
  };
  twin(backGeo, Z0[4], back);
  twin(plate(ring(w, h, R, 0.24, R - 0.2), t - 0.06, { bevel: 0.06, round: 3 }).translate(0, 0, -(t - 0.06) / 2), 0, frame);
  twin(plate(rrect(w - 0.1, h - 0.1, R - 0.05), 0.08, { bevel: 0.03 }).translate(0, 0, -0.04), Z0[0], screen);

  // the soft contact of the phone on the bench (only there)
  const parts = { back, battery, board, frame, screen };
  const A = {
    chip: anchor(chipG, 0, 0, 0.3), antenna: anchor(antG, ax + 1.0, ay, 0.1), quartz: anchor(qG, 0, 0, 0.3),
    screen: anchor(screen, 0, 0, 0.06), dot: anchor(dotG, 0, 0, 0.02), top: anchor(body, 0, h / 2, 0),
  };

  // the explode: one step per layer, +x and +z (a row across a camera at az ≈ −48); the board's three parts rise
  const STEP = [3.4, 0, 3.4];
  const qColor = new THREE.Color();
  const cVeille = new THREE.Color(BRAND.veille), cSignal = new THREE.Color(BRAND.signal);
  let lastOpen = -1, lastPeek = -1;

  return {
    root, parts, A,
    fx: { quartzMat, dotMat, screenMat, mapMat, chipMat },
    update({ bench = 0, explode = 0, peek = 0, quartz: qz = 0, qBeat = 0, tremble = 0, screen: on = 1, map = 1, strike = 0,
      err = 0, eta = 5, litChip = 0, litQuartz = 0 } = {}, time = 0) {
      body.position.y = bench ? -1.5 : 0; // BENCH.phone stands 9 above the floor: the bottom edge on it
      // EXPLODE — each layer in its own window, from the outside in; the hero parts rise last
      const k = clamp01(explode);
      if (k !== lastOpen) {
        lastOpen = k;
        order.forEach((p, i) => {
          const c = 2 - i;
          const u = ease(clamp01((k - Math.abs(c) * 0.12) / 0.7));
          p.position.set(STEP[0] * c * u, STEP[1] * c * u, p.userData.z0 + STEP[2] * c * u);
        });
        const rise = ease(clamp01((k - 0.45) / 0.55));
        chipG.position.z = 1.5 * rise;
        antG.position.z = 0.8 * rise;
        qG.position.z = 0.8 * rise;
      }
      // PEEK — the solids of back, frame, screen fade, their glass twins rise; the board stays
      const pk = clamp01(peek);
      if (pk !== lastPeek) {
        lastPeek = pk;
        setPartOpacity(back, 1 - smooth(0, 0.7, pk));
        setPartOpacity(frame, 1 - smooth(0, 0.7, pk));
        setPartOpacity(screen, 1 - smooth(0.1, 0.8, pk));
        setPartOpacity(battery, 1 - 0.75 * smooth(0.2, 0.9, pk)); // the battery steps back too: the board is the subject
        for (const tw of twins) {
          tw.mesh.visible = pk > 0.01;
          tw.mesh.position.copy(tw.part.position);
          tw.mat.uniforms.uAmount.value = smooth(0.15, 1, pk);
          tw.lines.material.opacity = 0.5 * smooth(0.15, 1, pk);
        }
      }
      // THE SCREEN — lit, the map windowed on the road ahead, the dot pushed by `err`
      const lit = clamp01(on) * (1 - smooth(0, 0.6, pk));
      const off = windowFor(Math.max(0, eta) * MPS);
      roadTex.offset.y = off;
      mapTex.offset.y = off;
      screenMat.opacity = lit;
      mapMat.opacity = lit * clamp01(map);
      const e = clamp01(err);
      dotG.position.set((-0.5 + ROAD_C + (DOT_FIELD - ROAD_C) * e) * SW, (-0.5 + DOT_V) * SH, 0);
      const hs = 1.8 + 1.4 * e; // the accuracy halo widens while the phone is unsure
      halo.scale.set(hs, hs, 1);
      dotMat.opacity = lit;
      haloMat.opacity = lit;
      const sk = clamp01(strike);
      strikeBar.visible = sk > 0.002 && lit > 0.01;
      strikeBar.scale.x = Math.max(0.001, ease(sk));
      strikeMat.opacity = lit * clamp01(map * 1.5);
      // the clock in millionths, once the map goes
      const ck = lit * (1 - clamp01(map));
      clockPlane.visible = ck > 0.01;
      clockMat.opacity = ck;
      if (clockPlane.visible) {
        const f = Math.round(time * 30); // one string per frame: the shutter's instants all round to it
        const tq = f / 30;
        const sec = 7 + Math.floor(tq);
        const jitter = Math.floor(((Math.sin(f * 12.9898) * 43758.5453) % 1 + 1) % 1 * 997);
        const micro = (Math.floor((tq % 1) * 1e6) + jitter) % 1000000;
        const s = `23:${pad(41 + Math.floor(sec / 60), 2)}:${pad(sec % 60, 2)},${pad(micro, 6)}`;
        if (s !== clockText) { clockText = s; drawClock(s); }
      }
      // THE CHIP and its antenna, lit by the voice
      const lc = clamp01(litChip);
      chipMat.emissiveIntensity = 0.28 * lc;
      antMat.emissiveIntensity = 0.45 * lc;
      chipRingMat.opacity = lc * board.userData.part.opacity;
      chipRing.visible = lc > 0.01;
      // THE QUARTZ — a light that swells and falls on each beat; frank veille or signal; the blade trembles
      const ph = ((qBeat % 1) + 1) % 1;
      const pulse = Math.pow(Math.sin(Math.PI * Math.min(1, ph * 1.6)), 2); // up fast, down slower, then still
      const lq = clamp01(litQuartz);
      qColor.copy(cVeille).lerp(cSignal, smooth(0.35, 0.65, qz));
      setGlow(quartzMat, (0.55 + 0.6 * pulse * (0.6 + 0.4 * lq)) * (0.8 + 0.25 * smooth(0.35, 0.65, qz)), qColor);
      beatMat.color.copy(qColor);
      beatMat.opacity = (0.06 + 0.22 * pulse) * (0.5 + 0.5 * lq);
      const bs = 1.1 + 0.7 * pulse;
      beat.scale.set(bs, bs, 1);
      const tr = clamp01(tremble);
      const shake = tr * (Math.sin(time * 61) * 0.6 + Math.sin(time * 37 + 1.3) * 0.4);
      fork.position.x = -0.42 + 0.05 * shake;
      fork.rotation.z = 0.06 * tr * Math.sin(time * 53 + 0.4);
      tineA.position.y = 0.13 + 0.03 * tr * Math.sin(time * 71);
      tineB.position.y = -0.13 - 0.03 * tr * Math.sin(time * 71);
    },
  };
}
