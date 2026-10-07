// DOSSIER 006 — the defibrillator of public places, the one in the green box on the wall.
// Centimetres; it lies flat on the bench, its front toward +z. Five parts, stacked:
//   · the base (lower shell)
//   · what stores the shock: a battery, and the capacitor it fills in a few seconds
//   · the board, and on it the chip that reads the heart — the only thing that decides
//   · the lid: one button (it only works when the chip allows it), one light (ready), a speaker
//   · two electrodes on their cables: they bring the heart's signal in, and take the shock out
// Opened, the stack comes apart along its height; the electrodes slide out of the front.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { solid, glow, makePart, addMesh, anchor, lineMat } from "@kit/build3d.js";

const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const INK = new THREE.Color(BRAND.ink);

export const CASE = { w: 21, d: 19, h: 10.8 }; // closed
const HALF = CASE.h / 2; // where the two shells meet
export const PAD = { w: 9, d: 12.5, t: 0.45 };
const CAN = { r: 3.0, x: 5.0, y: 5.4 }; // the capacitor

/** A box with rounded corners, standing on y = 0. */
export function roundedBox(w, h, d, r, bevel = 0.3) {
  const s = new THREE.Shape();
  const x = w / 2 - r;
  const z = d / 2 - r;
  s.absarc(x, z, r, 0, Math.PI / 2);
  s.absarc(-x, z, r, Math.PI / 2, Math.PI);
  s.absarc(-x, -z, r, Math.PI, 1.5 * Math.PI);
  s.absarc(x, -z, r, 1.5 * Math.PI, 2 * Math.PI);
  const g = new THREE.ExtrudeGeometry(s, { depth: h - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  return g;
}

/** The sign of a defibrillator, flat in the xy plane, `size` high: a heart… */
export function heartSign(size, depth) {
  const s = new THREE.Shape();
  const k = size / 2;
  s.moveTo(0, -0.95 * k);
  s.bezierCurveTo(-1.5 * k, 0.05 * k, -1.05 * k, 1.05 * k, 0, 0.42 * k);
  s.bezierCurveTo(1.05 * k, 1.05 * k, 1.5 * k, 0.05 * k, 0, -0.95 * k);
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 20 });
}
/** …and the bolt that goes through it. */
export function boltSign(size, depth) {
  const s = new THREE.Shape();
  const k = size / 2;
  [[0.12, 0.4], [-0.2, -0.02], [0.0, -0.02], [-0.13, -0.44], [0.21, 0.07], [0.01, 0.07]].forEach(([x, y], i) => (i ? s.lineTo(x * k, (y - 0.06) * k) : s.moveTo(x * k, (y - 0.06) * k)));
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
}

/** One electrode: a soft pad, its gel side down, a tab where the cable arrives. */
export function padGeometry() {
  return roundedBox(PAD.w, PAD.t, PAD.d, 1.8, 0.12);
}

export function buildAED() {
  const root = new THREE.Group();
  const fx = {};
  const A = {};
  // one set of materials per part: a part can fade without taking its neighbours along
  const metals = () => ({
    cast: solid(0x20272c, { rough: 0.62, metal: 0.25, coat: 0.35, coatRough: 0.4 }),
    shell: solid(0x2c353b, { rough: 0.5, metal: 0.2, coat: 0.5, coatRough: 0.35 }),
    steel: solid(0x6f7a83, { rough: 0.42, metal: 0.4, env: 1.1 }),
    bright: solid(0xb9c0c4, { rough: 0.34, metal: 0.45, env: 1.3 }),
    hero: solid(0xd2d6d8, { rough: 0.4, metal: 0.25, env: 1.2 }),
  });

  /* ── the base ── */
  const base = makePart("base", { lift: 0 });
  const m0 = metals();
  addMesh(base, roundedBox(CASE.w, HALF, CASE.d, 2.8), m0.cast, { threshold: 50, edgeOpacity: 0.7 });
  // seen open, it is a tray: a darker floor inside a lip
  addMesh(base, roundedBox(CASE.w - 1.6, 0.1, CASE.d - 1.6, 2.2, 0.03), solid(0x0d1215, { rough: 0.9 }), { pos: [0, HALF - 0.02, 0], threshold: 50, edgeOpacity: 0.5 });
  // the slot the electrodes leave by
  addMesh(base, new THREE.BoxGeometry(7.5, 1.1, 0.5), m0.steel, { pos: [0, 2.1, CASE.d / 2 + 0.05], edges: false });
  A.slot = anchor(base, 0, 2.1, CASE.d / 2 + 0.4);

  /* ── what stores the shock ── */
  const power = makePart("power", { lift: 9, delay: 0.1, span: 0.7 });
  const m1 = metals();
  // the battery: a block, its terminals, a band that says "charged"
  addMesh(power, roundedBox(8.8, 4.2, 13.5, 0.9, 0.2), m1.steel, { pos: [-5.2, 2.4, 0.2], threshold: 50, edgeOpacity: 0.75 });
  fx.cell = glow(BRAND.veille, 1.1);
  const cellBand = new THREE.Mesh(new THREE.BoxGeometry(8.9, 0.55, 0.5), fx.cell);
  cellBand.position.set(-5.2, 4.6, 6.75);
  power.add(cellBand);
  for (const x of [-7.4, -3.0]) addMesh(power, new THREE.CylinderGeometry(0.5, 0.5, 0.7, 14), m1.bright, { pos: [x, 6.9, -4.4], edges: false });
  A.battery = anchor(power, -9.6, 4.6, 0.2);
  // the capacitor: a can, lying down — the largest part in the box, and the reason for the box
  const can = new THREE.CylinderGeometry(CAN.r, CAN.r, 14.5, 48).rotateX(Math.PI / 2);
  addMesh(power, can, m1.hero, { pos: [CAN.x, CAN.y, 0], threshold: 60, edgeOpacity: 0.85 });
  addMesh(power, new THREE.CylinderGeometry(CAN.r + 0.05, CAN.r + 0.05, 2.4, 48).rotateX(Math.PI / 2), m1.cast, { pos: [CAN.x, CAN.y, -3.6], edges: false });
  for (const x of [CAN.x - 1, CAN.x + 1]) addMesh(power, new THREE.CylinderGeometry(0.34, 0.34, 1.2, 12).rotateX(Math.PI / 2), m1.bright, { pos: [x, CAN.y, 7.8], edges: false });
  // its charge: three rings of light that come on one after the other, veille … then signal when it is full
  fx.charge = [-1.6, 1.9, 5.4].map((z) => {
    const mat = glow(BRAND.veille, 0);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(CAN.r + 0.06, 0.15, 8, 64), mat);
    ring.position.set(CAN.x, CAN.y, z);
    power.add(ring);
    return mat;
  });
  A.cap = anchor(power, CAN.x + CAN.r, CAN.y, 2);

  /* ── the board, and the chip ── */
  const board = makePart("board", { lift: 18, delay: 0.05, span: 0.75 });
  const m2 = metals();
  addMesh(board, new THREE.BoxGeometry(18.4, 0.45, 16.4), solid(0x33414a, { rough: 0.55, metal: 0.1, coat: 0.4, coatRough: 0.5 }), { pos: [0, 8.9, 0], threshold: 60, edgeOpacity: 0.8 });
  // its tracks: fine lines that all lead to the chip
  const tracks = [];
  const chipAt = [-1.6, 9.15, -0.8];
  for (let k = 0; k < 14; k++) {
    const side = k % 2 ? 1 : -1;
    const z = -6.6 + k * 1.0;
    const x1 = side * (8.4 - (k % 3) * 0.7);
    tracks.push(x1, 9.16, z, chipAt[0] + side * 2.1, 9.16, z, chipAt[0] + side * 2.1, 9.16, z, chipAt[0] + side * 1.75, 9.16, chipAt[2] + (z - chipAt[2]) * 0.22);
  }
  const trackGeo = new LineSegmentsGeometry();
  trackGeo.setPositions(tracks);
  fx.tracks = lineMat(BRAND.ink, 1.9, { opacity: 0.5 });
  const trackLines = new LineSegments2(trackGeo, fx.tracks);
  board.add(trackLines);
  board.userData.part.mats.add(fx.tracks);
  for (const [x, z, w, d] of [[5.4, -4.6, 2.2, 1.2], [5.9, 2.6, 1.4, 2.6], [-6.4, 4.8, 2.6, 1.3], [-6.2, -5.4, 1.2, 1.2], [2.6, 5.6, 1.6, 1.0]]) {
    addMesh(board, new THREE.BoxGeometry(w, 0.55, d), m2.steel, { pos: [x, 9.4, z], edges: false });
  }
  // the chip: the one thing here that decides
  addMesh(board, new THREE.BoxGeometry(3.5, 0.7, 3.5), m2.hero, { pos: [chipAt[0], 9.48, chipAt[2]], edgeOpacity: 0.95 });
  fx.chip = glow(BRAND.veille, 1.2);
  const mark = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.5), fx.chip);
  mark.position.set(chipAt[0], 9.87, chipAt[2]);
  board.add(mark);
  // it listens: rings that leave it and die, slowly — a breath, not a blink
  fx.rings = [0, 1, 2].map(() => {
    const mat = glow(BRAND.veille, 0, { additive: true });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 6, 72).rotateX(Math.PI / 2), mat);
    ring.position.set(chipAt[0], 9.22, chipAt[2]);
    board.add(ring);
    return { mat, ring };
  });
  A.chip = anchor(board, chipAt[0] - 1.8, 9.7, chipAt[2]);

  /* ── the lid ── */
  const lid = makePart("lid", { lift: 27, delay: 0, span: 0.8 });
  const m3 = metals();
  addMesh(lid, roundedBox(CASE.w, HALF, CASE.d, 2.8), m3.shell, { pos: [0, HALF, 0], threshold: 50, edgeOpacity: 0.75 });
  // the sign: a heart, a bolt through it
  fx.sign = glow(BRAND.veille, 0.9);
  const emblem = new THREE.Mesh(heartSign(2.6, 0.12), fx.sign);
  emblem.rotation.x = -Math.PI / 2;
  emblem.position.set(-4.6, CASE.h + 0.04, -3.4);
  lid.add(emblem);
  const bolt = new THREE.Mesh(boltSign(2.6, 0.16), solid(0x0d1215, { rough: 0.8 }));
  bolt.rotation.x = -Math.PI / 2;
  bolt.position.set(-4.6, CASE.h + 0.06, -3.4);
  lid.add(bolt);
  // the handle, at the back
  const arc = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-5.2, 9.3, -9.3], [-5.0, 9.9, -12.2], [0, 10.1, -13.0], [5.0, 9.9, -12.2], [5.2, 9.3, -9.3]].map((q) => new THREE.Vector3(...q))), 40, 0.75, 14);
  addMesh(lid, arc, m3.cast, { edges: false });
  // the button: dark, and dead, until the chip has said yes
  addMesh(lid, new THREE.CylinderGeometry(2.75, 2.9, 0.5, 48), m3.cast, { pos: [5.0, 11.0, 3.2], edges: false });
  fx.button = glow(BRAND.signal, 0.12);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.55, 48), fx.button);
  cap.position.set(5.0, 11.2, 3.2);
  lid.add(cap);
  A.button = anchor(lid, 5.0, 11.5, 3.2);
  // the light that says "ready"
  addMesh(lid, new THREE.CylinderGeometry(0.95, 0.95, 0.3, 24), m3.cast, { pos: [6.9, 10.9, -5.6], edges: false });
  fx.led = glow(BRAND.veille, 1);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 14), fx.led);
  led.position.set(6.9, 11.0, -5.6);
  lid.add(led);
  A.led = anchor(lid, 6.9, 11.3, -5.6);
  // the speaker: it will have to talk someone through the worst minutes of their life
  for (let k = 0; k < 5; k++) addMesh(lid, new THREE.BoxGeometry(5.2 - Math.abs(k - 2) * 0.9, 0.12, 0.34), m3.cast, { pos: [-5.2, 10.84, 1.6 + k * 0.85], edges: false });
  A.speaker = anchor(lid, -5.2, 11.0, 3.3);
  fx.voice = [0, 1, 2].map(() => {
    const mat = glow(BRAND.veille, 0, { additive: true });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.09, 6, 64).rotateX(Math.PI / 2), mat);
    ring.position.set(-5.2, 11.05, 3.3);
    lid.add(ring);
    return { mat, ring };
  });
  // what sits on the lid fades with it: a button left alone in the air above the board is a red moon
  for (const mesh of [emblem, bolt, cap, led]) lid.userData.part.mats.add(mesh.material);

  /* ── the two electrodes, on their cables ── */
  const pads = makePart("pads", { lift: 0 });
  const m4 = metals();
  const padMat = solid(0xcfcbc0, { rough: 0.7, env: 0.5 });
  pads.userData.part.mats.add(padMat);
  fx.pads = [-1, 1].map((side) => {
    const g = new THREE.Group();
    const mesh = new THREE.Mesh(padGeometry(), padMat);
    mesh.castShadow = true;
    g.add(mesh);
    const tab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.6), m4.cast);
    tab.position.set(0, 0.35, -PAD.d / 2 + 0.2);
    g.add(tab);
    pads.add(g);
    const geo = new LineGeometry();
    geo.setPositions([0, 0, 0, 0, 0, 1]);
    const mat = lineMat(0x8a949b, 0.42, { opacity: 0.95 });
    mat.worldUnits = true;
    pads.userData.part.mats.add(mat);
    const cable = new Line2(geo, mat);
    cable.frustumCulled = false;
    pads.add(cable);
    return { g, cable, side };
  });
  pads.userData.part.mats.add(m4.cast);
  A.padL = anchor(fx.pads[0].g, -PAD.w / 2, 0.4, 0);
  A.padR = anchor(fx.pads[1].g, PAD.w / 2, 0.4, 0);

  const parts = { base, power, board, lid, pads };
  root.add(base, power, board, lid, pads);

  const hue = new THREE.Color();
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
  let laid = -1;
  const smooth = (a, b, x) => {
    const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  };
  /**
   * led      0 → 1: the "ready" light (a slow breath)
   * armed    0 → 1: the button comes alive (signal): the chip has allowed the shock
   * charge   0 → 1: the capacitor fills (its rings come on, one after the other; signal when full)
   * listen   0 → 1: the chip reads (rings leave it)
   * out      0 → 1: the electrodes are out of the box, laid on each side
   * speak    0 → 1: it talks (rings leave the speaker)
   */
  function pose({ led = 1, armed = 0, charge = 0, listen = 0, out = 0, speak = 0 }, time = 0) {
    fx.voice.forEach(({ mat, ring }, i) => {
      const u = (time * 0.9 + i / 3) % 1; // a ring is born at the grille, grows, and is gone
      ring.scale.setScalar(1.6 + 5.2 * u);
      ring.position.y = 11.05 + 3.4 * u;
      mat.color.copy(VEILLE).multiplyScalar(1.3 * speak * (1 - u) * smooth(0, 0.15, u));
      ring.visible = speak > 0.01;
    });
    fx.led.color.copy(VEILLE).multiplyScalar(led * (1.5 + 0.9 * Math.sin(time * 2.2)));
    hue.copy(SIGNAL).multiplyScalar(0.1 + 2.3 * armed * (0.86 + 0.14 * Math.sin(time * 4.0)));
    fx.button.color.copy(hue);
    fx.charge.forEach((mat, i) => {
      const on = smooth(i / 3, (i + 0.8) / 3, charge);
      hue.copy(VEILLE).lerp(SIGNAL, smooth(0.92, 1, charge));
      mat.color.copy(hue).multiplyScalar(2.0 * on);
    });
    fx.chip.color.copy(VEILLE).multiplyScalar(0.5 + 1.6 * listen);
    fx.rings.forEach(({ mat, ring }, i) => {
      const u = (time * 0.55 + i / 3) % 1; // each ring: born small and bright, gone wide and faint
      ring.scale.setScalar(2.2 + 6.5 * u);
      mat.color.copy(VEILLE).multiplyScalar(0.9 * listen * (1 - u) * smooth(0, 0.12, u));
      ring.visible = listen > 0.01;
    });
    // the electrodes: out of the slot, to each side of the front
    pads.visible = out > 0.004 && pads.userData.part.opacity > 0.004;
    if (out !== laid) {
      laid = out;
      const e = smooth(0, 1, out);
      for (const { g, cable, side } of fx.pads) {
        from.set(side * 1.6, 2.1, CASE.d / 2 + 0.3);
        to.set(side * (9.5 + 11.5 * e), 0.02 + 2.0 * (1 - e), CASE.d / 2 - 3 + 12.5 * e);
        g.position.copy(to);
        const turn = -side * 0.42 * e;
        g.rotation.y = turn;
        // the cable: from the slot to the tab of the pad (the tab is at the back edge of the pad, turned with it)
        const back = -(PAD.d / 2 - 0.2);
        curve.points[0].copy(from);
        curve.points[1].set(from.x + side * 1.2, 0.6, from.z + 4 * e + 0.6);
        curve.points[2].set(to.x - side * 5.0 * e, 0.3, to.z - 9.5 * e - 0.2);
        curve.points[3].set(to.x + back * Math.sin(turn), to.y + 0.5, to.z + back * Math.cos(turn));
        cable.geometry.setPositions(curve.getPoints(28).flatMap((q) => [q.x, q.y, q.z]));
      }
    }
  }
  pose({});

  return { root, parts, fx, A, pose };
}
