// DOSSIER 037 — Le parachute de secours : THE SYSTEM, solid. The reserve container on your back and what keeps it shut.
//   buildSystem() → { root, parts, A, update(p, time, px) }
//   root     what the world adds: to the diver's back (sauteur.js `A.back`) in the scene, to the bench on the bench
//   parts    by name (tray, main, flaps, flapBottom, flapTop, flapLeft, flapRight, control, pilot, bag, unit, cutter,
//            loop, pin, cable): update() fades them itself, every frame
//   A        anchors: unit, sensor, control, diode, cable, cutter, hole, piston, loop, loopTop, pin, flapTop, pilot, centre
//   update(p, time, px) — p, plain numbers (world.js, sixteen times a frame: nothing is allocated in here):
//     bench    1 on the bench, 0 on your back (nothing changes: the rig is the same object)
//     explode  0 assembled → 1 apart along ONE vertical path: the four flaps lift (the top one, with the control unit,
//              highest) and open a little like petals, the pilot chute rises and its spring stretches, the bag rises,
//              the processing unit slides out of its pocket to the side and its cable pulls taut to the cutter, which
//              stays on the floor with the loop standing in it. The tray's walls turn to glass on the way
//     flaps    the four reserve flaps swing open about their hinges, the last closed first (right, left, top, bottom),
//              with a little overshoot; the pilot chute's spring rises as they go (0 → 1 = FLAPS.open degrees)
//     deploy   > 0.05 the pilot chute (and the cut loop's upper part) have left; > 0.25 the bag too (sauteur.js flies them)
//     loop     0 whole → 1 cut in the cutter's hole: its two upper ends spring apart and slip up, the stubs splay
//     piston   0 → 1 the piston's chisel across the hole (CUTTER.stroke)
//     section  0 → 1 a quarter of the cutter's tube fades away: the bore, the piston, the loop in the hole, the cut faces
//     litCable a head of light on the unit → cutter cable, with a short wake (0 at the unit → 1 at the cutter; off at 0)
//     power    0 the box off (screen and diode dark) → 1 on (the diode breathes, veille: ≈ 3 s, never a blink)
//     wake     the diode lit frank, with a wider halo
//     test     the self-test: two laps of the screen's segments (0 → 0.75), then all of them and the diode frank
//     press    the pressure gauge on the unit's flank (a veille bar rising, 0 → 1)
//     rate     the rate bar beside it (0 → 1): veille under the threshold mark, signal over it
//     fabric   the container's cloth: 1 solid → 0 glass (aux rayons X): the unit, the cables, the cutter, the loop,
//              the pin, the grommets, the control unit and the pilot's spring stay solid inside
//     solo     the processing unit alone, the rest fades out (the principle)
//     heart    the loop and the cutter alone, the loop veille on its halo; the rest dims to a trace
//     litFlap, litUnit, litSensor, litCutter, litLoop — the part the voice names glows faintly, veille
//
// Built in the diver's frame (plan.js): back plate at y 0 → 1.2, out of your back +y, head +z, your left +x. Three
// greys: the cloth dark (0x353c43), the boxes mid (0x7c838a), the cutter light (0xcdd1d5); metal ≤ 0.5; fine edges.
// Facts: the box CUTS THE LOOP, it does not open anything; nothing leaves the cutter (no spark, no smoke); no mark and
// no figure is written on any part (the screen shows segments only).
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, glass, asShell, setGlow, box, cyl, lathe, plate, fatLine, anchor } from "@kit/build3d.js";
import { CONTAINER, RESERVE, FLAPS, LOOP, PIN, CUTTER, UNIT, CONTROL, CABLES, PILOT, BAG, SYSTEM } from "./plan.js";

export const MODEL = { radius: SYSTEM.size };

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (x) => x * x * (3 - 2 * x);
const easeOut = (u) => 1 - (1 - u) * (1 - u) * (1 - u);
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// leaves fast, lands with a slight overshoot: parts have weight
const settle = (u) => easeInOut(u) + Math.sin(Math.PI * u) * Math.sin(Math.PI * u) * 0.055 * (u > 0.5 ? 1 : 0.25);
// a flap thrown open by the spring under it: fast, past its stop, back
const springOpen = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2));

/* ───────────── the greys ───────────── */
const C = {
  cloth: 0x3a424a, //   the container's Cordura
  main: 0x30373e, //    the main container, a hair darker
  bind: 0x535c65, //    the binding tape on the rims
  bag: 0x3d454c, //     the deployment bag
  unit: 0x7c838a, //    the processing unit
  control: 0x5f666d, // the control unit
  rubber: 0x23282d, //  glands, the button, the plug
  cutter: 0xcdd1d5, //  THE HERO: the lightest thing on the rig
  piston: 0xe6e8ea,
  face: 0xb9bdc1, //    the cut faces of the section (a grey, not a white: the bench's green would light it up)
  metal: 0x9aa0a6, //   grommets, the pin
  cord: 0xb3b8bd, //    the closing loop
  spring: 0x8b9197,
  cable: 0x40464c,
  hole: 0x07090a,
};

/* ───────────── a soft light that has a place: a bright heart, a long tail (one texture, made once) ───────────── */
let HALO = null;
function haloTexture() {
  if (HALO) return HALO;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.08, "rgba(255,255,255,0.85)");
  grd.addColorStop(0.22, "rgba(255,255,255,0.32)");
  grd.addColorStop(0.5, "rgba(255,255,255,0.08)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  HALO = new THREE.CanvasTexture(c);
  return HALO;
}
function halo(color, scale) {
  const mat = new THREE.SpriteMaterial({ map: haloTexture(), color: new THREE.Color(color), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, opacity: 0 });
  mat.userData.hue = new THREE.Color(color);
  const s = new THREE.Sprite(mat);
  s.scale.set(scale, scale, 1);
  s.renderOrder = 6;
  s.visible = false;
  return s;
}
/** A halo's light: k its intensity (HDR, ≤ 3), o its opacity. */
function setHalo(s, k, o) {
  s.visible = o > 0.004 && k > 0.004;
  if (!s.visible) return;
  s.material.color.copy(s.material.userData.hue).multiplyScalar(k);
  s.material.opacity = o;
}

/* ───────────── fading, by group of materials ───────────── */
// cloth: the solid Cordura (fades to glass with `fabric`); edge: its outline (stays, fainter, in the X-ray);
// glass: the X-ray shell of the same cloth; dev: devices and metal, solid whatever the cloth
const group = () => ({ cloth: [], edge: [], dev: [], glass: null, glassMeshes: [], casters: [], lastA: -1, lastC: -1 });
function fadeMat(m, o) {
  const b = m.userData.base ?? 1;
  m.opacity = b * o;
  const tr = !!m.userData.transparent || o < 0.999;
  if (m.transparent !== tr) {
    m.transparent = tr;
    m.needsUpdate = true;
  }
  if (m.userData.depthWrite !== undefined) m.depthWrite = m.userData.depthWrite && o > 0.55;
  m.visible = o > 0.004;
}
function fadeGroup(g, a, cloth = 1) {
  if (g.lastA === a && g.lastC === cloth) return;
  g.lastA = a;
  g.lastC = cloth;
  for (const m of g.cloth) fadeMat(m, a * cloth);
  for (const m of g.edge) fadeMat(m, a * (0.3 + 0.7 * cloth));
  for (const m of g.dev) fadeMat(m, a);
  if (g.glass) g.glass.uniforms.uAmount.value = a * (1 - cloth);
  for (const mesh of g.casters) mesh.castShadow = a * cloth > 0.6;
}
const GLASS = { base: 0, rim: 0.16, power: 2.6, edge: 0.3, spec: 0.08, through: 0.1 };
/** A piece of the container's cloth: a lit solid, its outline, and the same geometry in glass (the X-ray). */
function cloth(g, parent, geometry, color, o = {}) {
  const m = solid(color, { rough: 0.88 });
  m.userData.finish = false; // no machining grain on a fabric
  m.emissive.set(BRAND.veille);
  m.emissiveIntensity = 0;
  const mesh = addMesh(parent, geometry, m, { pos: o.pos, rot: o.rot, edges: o.edges, edgeOpacity: o.edgeOpacity ?? 0.85 });
  g.cloth.push(m);
  for (const child of mesh.children) g.edge.push(child.material);
  if (mesh.castShadow) g.casters.push(mesh);
  if (!g.glass) g.glass = glass(BRAND.ink, GLASS);
  const shell = new THREE.Mesh(geometry, g.glass);
  shell.position.copy(mesh.position);
  shell.rotation.copy(mesh.rotation);
  parent.add(shell);
  g.glassMeshes.push(shell);
  return mesh;
}
/** A device or a metal piece: solid whatever the cloth does. */
function dev(g, parent, geometry, material, o = {}) {
  const mesh = addMesh(parent, geometry, material, o);
  g.dev.push(material);
  for (const child of mesh.children) g.dev.push(child.material);
  if (mesh.castShadow) g.casters.push(mesh);
  return mesh;
}
function metal(color, o = {}) {
  const m = solid(color, { rough: o.rough ?? 0.4, metal: o.metal ?? 0.4, double: o.double, env: o.env });
  m.emissive.set(BRAND.veille);
  m.emissiveIntensity = 0;
  return m;
}

/* ───────────── shapes ───────────── */
/** A rounded rectangle in the (x, z) plane, as [x, z] points. */
function rrect(x0, z0, x1, z1, r, n = 6) {
  const pts = [];
  const corner = (cx, cz, a0) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
    }
  };
  corner(x1 - r, z0 + r, -Math.PI / 2);
  corner(x1 - r, z1 - r, 0);
  corner(x0 + r, z1 - r, Math.PI / 2);
  corner(x0 + r, z0 + r, Math.PI);
  return pts;
}
// plate() extrudes a shape of the (x, y) plane along +z; turned by −90° about x, its thickness runs along +y and its
// y becomes −z: so an outline of the (x, z) plane is written (x, −z)
const toShape = (pts, S = THREE.Shape) => new S(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
/** A plate lying flat: an (x, z) outline (or a shape), `t` thick from y 0 up. */
function flat(outline, t, bevel) {
  const shape = outline instanceof THREE.Shape ? outline : toShape(outline);
  return plate(shape, t, { bevel, round: 2 }).rotateX(-Math.PI / 2);
}
/** A tube along a smooth curve through [x, y, z] points. */
function tube(points, r, { closed = false, seg = 120, radial = 8 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => V(...p)), closed, "centripetal");
  return new THREE.TubeGeometry(curve, seg, r, radial, closed);
}

/* ───────────── a tube re-shaped in place (the cable that pulls taut in the exploded view) ───────────── */
const _T = V();
const _N = V();
const _B = V();
function liveTube(n, radial, r) {
  const ring = radial + 1;
  const count = (n + 1) * ring;
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  const index = [];
  for (let i = 0; i <= n; i++)
    for (let j = 0; j <= radial; j++) {
      uv[(i * ring + j) * 2] = i / n;
      uv[(i * ring + j) * 2 + 1] = j / radial;
      if (i < n && j < radial) {
        const a = i * ring + j;
        const b = (i + 1) * ring + j;
        index.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.setIndex(index);
  const P = Array.from({ length: n + 1 }, () => V());
  return {
    geo,
    shape(curve) {
      for (let i = 0; i <= n; i++) curve.getPoint(i / n, P[i]);
      for (let i = 0; i <= n; i++) {
        _T.subVectors(P[Math.min(i + 1, n)], P[Math.max(i - 1, 0)]).normalize();
        if (i === 0) {
          _N.set(0, 1, 0);
          if (Math.abs(_T.y) > 0.9) _N.set(1, 0, 0);
        }
        _N.addScaledVector(_T, -_N.dot(_T)).normalize(); // carried along: no twist
        _B.crossVectors(_T, _N);
        for (let j = 0; j <= radial; j++) {
          const th = (j / radial) * TAU;
          const c = Math.cos(th);
          const s = Math.sin(th);
          const nx = c * _N.x + s * _B.x;
          const ny = c * _N.y + s * _B.y;
          const nz = c * _N.z + s * _B.z;
          const k = (i * ring + j) * 3;
          nor[k] = nx;
          nor[k + 1] = ny;
          nor[k + 2] = nz;
          pos[k] = P[i].x + r * nx;
          pos[k + 1] = P[i].y + r * ny;
          pos[k + 2] = P[i].z + r * nz;
        }
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.normal.needsUpdate = true;
    },
  };
}

export function buildSystem() {
  const root = new THREE.Group();
  root.name = "system";
  const { w, z0, z1 } = CONTAINER;
  const floor = RESERVE.floor; // 1.2: the back plate's top, the reserve tray's floor
  const RIM = 17; //               the tray's walls stop here; the flaps close on top
  const allGlass = [];

  /* ═════════════ the back plate and the main container (below the reserve, toward your feet) ═════════════ */
  const gMain = group();
  const main = makePart("main");
  cloth(gMain, main, flat(rrect(-w / 2 - 0.6, z0 - 0.6, w / 2 + 0.6, z1 + 0.6, 3.6), floor, 0.45), C.main);
  const mz0 = z0 + 0.5;
  const mz1 = RESERVE.z0 - 0.5;
  cloth(gMain, main, box(w - 1, 13.8, mz1 - mz0, 3), C.main, { pos: [0, floor + 6.9, (mz0 + mz1) / 2] });
  // its closing flap and the pin cover: the main stays shut, it is not the story
  cloth(gMain, main, flat([[-15.4, mz1 - 1], [15.4, mz1 - 1], [15.4, mz0 + 9], [5, mz0 + 2.5], [-5, mz0 + 2.5], [-15.4, mz0 + 9]], 0.7, 0.3), C.main, { pos: [0, 14.7, 0] });
  cloth(gMain, main, flat(rrect(-3.4, -16, 3.4, -8.5, 1.2), 0.5, 0.2), C.bind, { pos: [0, 15.4, 0] });
  // seams: fine, faint, never dashed (the rig spins in act 1: stitches would crawl)
  const seam = (pts) => {
    const line = fatLine(pts, { color: BRAND.ink, width: 1.8, opacity: 0.22 });
    gMain.edge.push(line.material);
    main.add(line);
  };
  seam([[-w / 2 + 0.48, 9, mz0 + 3], [-w / 2 + 0.48, 9, mz1 - 3]]);
  seam([[w / 2 - 0.48, 9, mz0 + 3], [w / 2 - 0.48, 9, mz1 - 3]]);
  seam([[-12, 4, mz0 - 0.02], [12, 4, mz0 - 0.02]]);

  /* ═════════════ the reserve tray: four walls, its rolled rim, the unit's pocket ═════════════ */
  const gTray = group();
  const tray = makePart("tray");
  const ring = toShape(rrect(-w / 2, RESERVE.z0, w / 2, RESERVE.z1, 3));
  ring.holes.push(toShape(rrect(-w / 2 + 1.2, RESERVE.z0 + 1.2, w / 2 - 1.2, RESERVE.z1 - 1.2, 1.9), THREE.Path));
  cloth(gTray, tray, flat(ring, RIM - floor, 0.5), C.cloth, { pos: [0, floor, 0] });
  const rimTube = tube(rrect(-w / 2 + 0.6, RESERVE.z0 + 0.6, w / 2 - 0.6, RESERVE.z1 - 0.6, 2.4).map(([x, z]) => [x, RIM, z]), 0.62, { closed: true, seg: 200 });
  cloth(gTray, tray, rimTube, C.bind, { edges: false });
  const seamT = (pts) => {
    const line = fatLine(pts, { color: BRAND.ink, width: 1.8, opacity: 0.22 });
    gTray.edge.push(line.material);
    tray.add(line);
  };
  seamT([[-w / 2 - 0.02, 9.5, RESERVE.z0 + 3.2], [-w / 2 - 0.02, 9.5, RESERVE.z1 - 3.2]]);
  seamT([[w / 2 + 0.02, 9.5, RESERVE.z0 + 3.2], [w / 2 + 0.02, 9.5, RESERVE.z1 - 3.2]]);
  seamT([[-w / 2 + 3.2, 9.5, RESERVE.z1 + 0.02], [w / 2 - 3.2, 9.5, RESERVE.z1 + 0.02]]);
  // the unit's pocket: an elastic band across it, between its pressure port and its gauge
  const [ux, uy, uz] = UNIT.at;
  const [uw, uh, ud] = UNIT.size;
  const strapZ = 14.95;
  cloth(gTray, tray, box(uw + 0.7, 0.3, 1.3, 0.12), C.bind, { pos: [ux, uy + uh / 2 + 0.15, strapZ] });
  cloth(gTray, tray, box(0.3, uh + 0.1, 1.3, 0.12), C.bind, { pos: [ux - uw / 2 - 0.15, uy + 0.05, strapZ] });
  cloth(gTray, tray, box(0.3, uh + 0.1, 1.3, 0.12), C.bind, { pos: [ux + uw / 2 + 0.15, uy + 0.05, strapZ] });

  /* ═════════════ the four flaps, each on its hinge, in their closing order ═════════════ */
  // outlines in the (x, z) plane; the left and right ones are cut back where the control unit sits on the top flap
  const LEFT = [[18, 5.2], [18, 26.6], [14.5, 21.6], [6, 19.6], [-3.2, 19.3], [-3.2, 12.7], [6, 12.4], [14.5, 10.4]];
  const FLAP = {
    bottom: { hinge: [0, 16.9, RESERVE.z0], axis: "x", sign: -1, w: [0.3, 0.84], ex: [0, 28, -4], delay: 0.09,
      outline: [[-17.5, 4], [17.5, 4], [17.2, 7.6], [9, 11.2], [3.2, 18.8], [-3.2, 18.8], [-9, 11.2], [-17.2, 7.6]] },
    top: { hinge: [0, 17.15, RESERVE.z1], axis: "x", sign: 1, w: [0.2, 0.74], ex: [0, 50, 4], delay: 0.03,
      outline: [[-17.5, 28], [17.5, 28], [17.4, 22.2], [9, 20.4], [3.2, 13.2], [-3.2, 13.2], [-9, 20.4], [-17.4, 22.2]] },
    left: { hinge: [w / 2, 17.4, 16], axis: "z", sign: -1, w: [0.09, 0.62], ex: [4, 35, 0], delay: 0.05, outline: LEFT },
    right: { hinge: [-w / 2, 17.65, 16], axis: "z", sign: 1, w: [0, 0.52], ex: [-4, 42, 0], delay: 0, outline: LEFT.map(([x, z]) => [-x, z]) },
  };
  const flapsAll = makePart("flaps");
  const grommetGeo = new THREE.TorusGeometry(0.56, 0.14, 10, 32).rotateX(Math.PI / 2);
  const holeGeo = new THREE.CircleGeometry(0.42, 24).rotateX(-Math.PI / 2);
  const holeMat = () => solid(C.hole, { rough: 1 });
  const flaps = {};
  for (const [name, f] of Object.entries(FLAP)) {
    const g = group();
    const part = makePart(`flap-${name}`);
    const hinge = makePart(`hinge-${name}`);
    hinge.position.set(...f.hinge);
    part.add(hinge);
    const [hx, , hz] = f.hinge;
    cloth(g, hinge, flat(f.outline.map(([x, z]) => [x - hx, z - hz]), FLAPS.thick, 0.3), C.cloth);
    // its grommet, where the loop goes through: only the last one closed shows from outside
    dev(g, hinge, grommetGeo, metal(C.metal), { pos: [LOOP.base[0] - hx, FLAPS.thick + 0.02, LOOP.base[2] - hz], edges: false });
    dev(g, hinge, holeGeo, holeMat(), { pos: [LOOP.base[0] - hx, FLAPS.thick + 0.012, LOOP.base[2] - hz], edges: false });
    flapsAll.add(part);
    flaps[name] = { ...f, g, part, hinge, s: 0 };
  }

  /* ═════════════ the control unit, on the top flap, readable from outside ═════════════ */
  const gCtrl = group();
  const control = makePart("control");
  const ft = flaps.top;
  ft.hinge.add(control);
  const cx = CONTROL.at[0];
  const cy = CONTROL.at[1] - ft.hinge.position.y;
  const cz = CONTROL.at[2] - ft.hinge.position.z;
  const [cw, ch, cd] = CONTROL.size;
  const top = cy + ch / 2; // its face
  const holderH = cy - ch / 2 - FLAPS.thick;
  dev(gCtrl, control, box(cw + 0.8, holderH, cd + 0.8, 0.25), solid(C.rubber, { rough: 0.85 }), { pos: [cx, FLAPS.thick + holderH / 2, cz] });
  const ctrlMat = metal(C.control, { rough: 0.5, metal: 0.25 });
  dev(gCtrl, control, box(cw, ch, cd, 0.14), ctrlMat, { pos: [cx, cy, cz] });
  // the screen: a dark window, a faint backlight, eight segments around its edge (no figure, ever)
  const scX = cx - 1.4;
  const scW = 2.6;
  const scD = 1.08;
  const bezelMat = solid(0x0d1012, { rough: 0.3 });
  bezelMat.userData.finish = false;
  dev(gCtrl, control, box(scW + 0.3, 0.06, scD + 0.24, 0.02), bezelMat, { pos: [scX, top + 0.02, cz], edges: false });
  const screenMat = glow(BRAND.veille, 0.1);
  screenMat.userData.finish = false;
  dev(gCtrl, control, new THREE.PlaneGeometry(scW, scD).rotateX(-Math.PI / 2), screenMat, { pos: [scX, top + 0.055, cz], edges: false });
  const segs = [];
  const segAt = [
    [-0.85, -0.4, 1], [0, -0.4, 1], [0.85, -0.4, 1], [1.18, 0, 0], [0.85, 0.4, 1], [0, 0.4, 1], [-0.85, 0.4, 1], [-1.18, 0, 0],
  ];
  for (const [dx, dz, along] of segAt) {
    const m = glow(BRAND.veille, 0.3);
    m.userData.finish = false;
    dev(gCtrl, control, along ? new THREE.BoxGeometry(0.66, 0.03, 0.11) : new THREE.BoxGeometry(0.11, 0.03, 0.5), m, { pos: [scX + dx, top + 0.075, cz + dz], edges: false });
    segs.push(m);
  }
  dev(gCtrl, control, cyl(0.34, 0.16, 0.05, 24), solid(C.rubber, { rough: 0.7 }), { pos: [cx + 1.25, top + 0.08, cz], edges: false });
  // THE DIODE: a lens in its ring, a heart of light and a halo (it must read at 25 px)
  const [dxw, dyw, dzw] = CONTROL.diode;
  const dpos = [dxw, dyw - ft.hinge.position.y, dzw - ft.hinge.position.z];
  dev(gCtrl, control, cyl(0.42, 0.12, 0.03, 24), solid(C.rubber, { rough: 0.5 }), { pos: [dpos[0], top + 0.06, dpos[2]], edges: false });
  const diodeMat = glow(BRAND.veille, 1);
  dev(gCtrl, control, new THREE.SphereGeometry(0.27, 20, 10, 0, TAU, 0, Math.PI / 2), diodeMat, { pos: [dpos[0], top + 0.1, dpos[2]], edges: false });
  const diodeHalo = halo(BRAND.veille, 2.4);
  diodeHalo.position.set(dpos[0], top + 0.3, dpos[2]);
  control.add(diodeHalo);

  /* ═════════════ the control → unit cable: over the top flap, across its hinge, down the wall, coiled on the floor ═════════════ */
  const gCtrlCable = group();
  const cableMat = () => solid(C.cable, { rough: 0.5, metal: 0.2, double: true });
  const hingeCx = 6; // where it crosses the top flap's hinge: ON the axis, so it bends there and never stretches
  dev(gCtrlCable, ft.hinge, tube([[cx - cw / 2 + 0.1, cy, cz], [cx - cw / 2 - 0.7, FLAPS.thick + 0.4, cz + 0.4], [hingeCx + 0.4, FLAPS.thick + 0.24, -2.6], [hingeCx + 0.1, FLAPS.thick + 0.15, -1], [hingeCx, 0.25, -0.15], [hingeCx, 0, 0]], CABLES.r, { seg: 60 }), cableMat(), { edges: false });
  const coil = [];
  for (let k = 0; k <= 30; k++) {
    const a = 0.6 + (k / 30) * 2 * TAU;
    const r = 1.2 + 0.5 * (k / 30);
    coil.push([-6.8 + r * Math.cos(a), floor + 0.25, 23.4 + r * Math.sin(a)]);
  }
  dev(gCtrlCable, tray, tube([[hingeCx, ft.hinge.position.y, RESERVE.z1], [hingeCx, RIM - 0.6, 26.45], [5, 10, 26.45], [3, 2.4, 26.4], [-2.5, floor + 0.25, 25.4], ...coil, [-9.6, floor + 0.3, 21.2], [ux, 2.4, uz + ud / 2 + 0.5]], CABLES.r, { seg: 220 }), cableMat(), { edges: false });

  /* ═════════════ under the flaps: the pilot chute (a spring, compressed) on the bag ═════════════ */
  const gPilot = group();
  const gSpring = group();
  const pilot = makePart("pilot");
  const [px0, py0, pz0] = PILOT.at;
  const SPRING_Y = py0 + 0.4;
  const SPRING_H = 6.6;
  cloth(gPilot, pilot, cyl(PILOT.r - 0.2, 0.4, 0.15, 48), C.bind, { pos: [px0, py0 + 0.2, pz0] });
  const spring = makePart("spring");
  spring.position.set(px0, SPRING_Y, pz0);
  pilot.add(spring);
  const helix = [];
  for (let k = 0; k <= 180; k++) {
    const t = k / 180;
    const a = t * 6 * TAU;
    const r = 6.1 - 2.6 * t;
    helix.push([r * Math.cos(a), t * SPRING_H, r * Math.sin(a)]);
  }
  const springMat = metal(C.spring, { rough: 0.35, metal: 0.45 });
  const springMesh = addMesh(spring, tube(helix, 0.22, { seg: 540, radial: 6 }), springMat, { edges: false });
  gSpring.dev.push(springMat);
  gSpring.casters.push(springMesh);
  const cap = makePart("cap");
  pilot.add(cap);
  cloth(gPilot, cap, cyl(PILOT.r, 0.6, 0.25, 48), C.cloth, { pos: [0, 0.3, 0] });
  dev(gPilot, cap, grommetGeo, metal(C.metal), { pos: [LOOP.base[0], 0.62, 0], edges: false });
  const capAt = (s) => cap.position.set(px0, SPRING_Y + SPRING_H * s, pz0);
  capAt(1);

  const gBag = group();
  const bag = makePart("bag");
  const BAG_Y = floor + 0.9; // it rests over the cutter lying on the floor
  const bagH = PILOT.at[1] - BAG_Y;
  const bagX0 = ux + uw / 2 + 0.8;
  const bagX1 = w / 2 - 2;
  cloth(gBag, bag, box(bagX1 - bagX0, bagH, BAG.size[2], 2.2), C.bag, { pos: [(bagX0 + bagX1) / 2, BAG_Y + bagH / 2, BAG.at[2]] });
  dev(gBag, bag, grommetGeo, metal(C.metal), { pos: [LOOP.base[0], PILOT.at[1] + 0.02, LOOP.base[2]], edges: false });

  /* ═════════════ THE PROCESSING UNIT, in its pocket on the floor ═════════════ */
  const gUnit = group();
  const unit = makePart("unit");
  const unitMat = metal(C.unit, { rough: 0.42, metal: 0.35 });
  dev(gUnit, unit, box(uw, uh, ud, 0.45), unitMat, { pos: UNIT.at });
  dev(gUnit, unit, box(uw + 0.06, 0.14, ud + 0.06, 0.06), solid(0x262b30, { rough: 0.6 }), { pos: [ux, uy + 0.9, uz], edges: false });
  // its pressure port, on the flank toward −x: a ring, a dark mouth
  const [sx, sy, sz] = UNIT.sensor;
  dev(gUnit, unit, new THREE.TorusGeometry(0.44, 0.09, 10, 32).rotateY(Math.PI / 2), metal(0xa3a9af), { pos: [sx - 0.02, sy, sz], edges: false });
  dev(gUnit, unit, new THREE.CircleGeometry(0.38, 28).rotateY(-Math.PI / 2), solid(C.hole, { rough: 1 }), { pos: [sx - 0.015, sy, sz], edges: false });
  const sensorRing = glow(BRAND.veille, 1.5);
  dev(gUnit, unit, new THREE.TorusGeometry(0.62, 0.05, 8, 40).rotateY(Math.PI / 2), sensorRing, { pos: [sx - 0.04, sy, sz], edges: false });
  const sensorHalo = halo(BRAND.veille, 3);
  sensorHalo.position.set(sx - 0.5, sy, sz);
  unit.add(sensorHalo);
  // the principle's gauge, on the same flank: the pressure (a veille bar), the rate (veille → signal past its mark)
  const GY = uy - uh / 2 + 0.95;
  const GH = 2.75;
  const slot = (z, d) => dev(gUnit, unit, box(0.06, GH + 0.15, d, 0.02), solid(0x101316, { rough: 0.5 }), { pos: [ux - uw / 2 - 0.03, GY + GH / 2, z], edges: false });
  slot(16.4, 0.72);
  slot(17.55, 0.52);
  const pressMat = glow(BRAND.veille, 1.5);
  const rateMat = glow(BRAND.veille, 1.5);
  const pressBar = dev(gUnit, unit, new THREE.BoxGeometry(0.05, GH, 0.52).translate(0, GH / 2, 0), pressMat, { pos: [ux - uw / 2 - 0.07, GY, 16.4], edges: false });
  const rateBar = dev(gUnit, unit, new THREE.BoxGeometry(0.05, GH, 0.34).translate(0, GH / 2, 0), rateMat, { pos: [ux - uw / 2 - 0.07, GY, 17.55], edges: false });
  const THRESHOLD = 0.62; // ≈ 35 / 55.6 m/s: the mark on the rate bar
  dev(gUnit, unit, new THREE.BoxGeometry(0.07, 0.07, 0.66), glow(BRAND.ink, 1.1), { pos: [ux - uw / 2 - 0.08, GY + GH * THRESHOLD, 17.55], edges: false });
  // its glands: the cable to the cutter (+x), the cable from the control unit (+z)
  const glandX = ux + uw / 2;
  dev(gUnit, unit, cyl(0.34, 0.55, 0.06, 24).rotateZ(Math.PI / 2), solid(C.rubber, { rough: 0.7 }), { pos: [glandX + 0.27, 2.4, 18.6], edges: false });
  dev(gUnit, unit, cyl(0.3, 0.5, 0.06, 24).rotateX(Math.PI / 2), solid(C.rubber, { rough: 0.7 }), { pos: [ux, 2.4, uz + ud / 2 + 0.25], edges: false });

  /* ═════════════ THE CUTTER: a tube on the floor, its hole across it, the piston inside ═════════════ */
  const gCutter = group();
  const cutter = makePart("cutter");
  const cutG = makePart("cutter-frame"); // the cutter's own frame: its axis along +x, its centre at CUTTER.at
  cutG.position.set(...CUTTER.at);
  cutter.add(cutG);
  const R = CUTTER.r;
  const L2 = CUTTER.len / 2;
  const bore = 0.3;
  const HX = -CUTTER.holeAt; // the hole, across the tube (along y)
  // the casing turned about its axis: a bore, a closed end at +x; in two pieces so a quarter can go (the section)
  const PROFILE = [[bore, -L2], [R - 0.03, -L2], [R, -L2 + 0.03], [R, L2 - 0.03], [R - 0.03, L2], [0, L2], [0, L2 - 0.3], [bore, L2 - 0.3], [bore, -L2]];
  const turned = (phi0, phiLen) => {
    const g = new THREE.LatheGeometry(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), 36, phi0, phiLen);
    return toCreasedNormals(g, 35 * DEG).rotateZ(-Math.PI / 2);
  };
  // after rotateZ(−90°) a lathe angle φ points to (y, z) = (−sin φ, cos φ): the quarter facing up and toward the head (φ ≈ −35°)
  const CUT0 = -80 * DEG;
  const CUT1 = 10 * DEG;
  const casingMat = metal(C.cutter, { rough: 0.42, metal: 0.35, double: true, env: 0.55 });
  dev(gCutter, cutG, turned(CUT1, TAU - (CUT1 - CUT0)), casingMat, { threshold: 30 });
  const quarterMat = metal(C.cutter, { rough: 0.42, metal: 0.35, double: true, env: 0.55 });
  const quarter = addMesh(cutG, turned(CUT0, CUT1 - CUT0), quarterMat, { threshold: 30 });
  const quarterEdge = quarter.children[0].material;
  // the cut faces, the colour of fresh metal
  const faceMat = solid(C.face, { rough: 0.65, metal: 0.15, double: true, env: 0.4 });
  faceMat.userData.finish = false;
  const faceShape = new THREE.Shape(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)));
  const faces = [];
  for (const phi of [CUT0, CUT1]) {
    const geo = new THREE.ShapeGeometry(faceShape).rotateY(phi - Math.PI / 2).rotateZ(-Math.PI / 2);
    const f = addMesh(cutG, geo, faceMat, { edges: false });
    f.visible = false;
    faces.push(f);
  }
  // the hole: a dark mouth above and below, a bright lip
  for (const s of [1, -1]) {
    dev(gCutter, cutG, new THREE.CircleGeometry(CUTTER.hole, 24).rotateX(-s * Math.PI / 2), solid(C.hole, { rough: 1 }), { pos: [HX, s * (R + 0.004), 0], edges: false });
    dev(gCutter, cutG, new THREE.TorusGeometry(CUTTER.hole + 0.02, 0.025, 6, 28).rotateX(Math.PI / 2), metal(C.face), { pos: [HX, s * (R - 0.01), 0], edges: false });
  }
  // the plug at −x, where the cable comes in
  dev(gCutter, cutG, cyl(bore + 0.02, 0.55, 0.05, 24).rotateZ(Math.PI / 2), solid(C.rubber, { rough: 0.6 }), { pos: [-L2 - 0.2, 0, 0] });
  // the piston: a chisel that rides along +x across the hole
  const PISTON_L = 1.2;
  const PISTON_X = HX - CUTTER.hole - 0.03 - PISTON_L / 2; // its tip just short of the hole
  const pistonMat = metal(C.piston, { rough: 0.28, metal: 0.4 });
  const pistonMesh = dev(gCutter, cutG, lathe([[0, -PISTON_L / 2], [bore - 0.02, -PISTON_L / 2], [bore - 0.02, PISTON_L / 2 - 0.2], [0.07, PISTON_L / 2], [0, PISTON_L / 2]], 32, { bevel: 0.02 }).rotateZ(-Math.PI / 2), pistonMat, { pos: [PISTON_X, 0, 0], threshold: 30 });
  const pistonTip = anchor(pistonMesh, PISTON_L / 2, 0, 0);
  // the charge behind it (dark), between the plug and the piston
  dev(gCutter, cutG, cyl(bore - 0.04, 0.3, 0.02, 20).rotateZ(Math.PI / 2), solid(0x30353a, { rough: 0.6 }), { pos: [PISTON_X - PISTON_L / 2 - 0.15, 0, 0], edges: false });
  const cutterHalo = halo(BRAND.veille, 3.2);
  cutterHalo.position.set(0, 0.2, 0);
  cutG.add(cutterHalo);

  /* ═════════════ THE CLOSING LOOP: two strands from the floor, through the hole, the bag, the pilot, the grommets, over the pin ═════════════ */
  const gLoop = group();
  const loop = makePart("loop");
  const LX = CUTTER.at[0] + HX; // the strands go through the hole
  const LZ = LOOP.base[2];
  const CUT_Y = CUTTER.at[1]; //  where the chisel crosses them
  const SPLIT = CUT_Y + 0.8; //   the upper ends' pivots
  const sL = LX - 0.12;
  const sR = LX + 0.12;
  const cordMat = solid(C.cord, { rough: 0.85 });
  cordMat.userData.finish = false;
  cordMat.emissive.set(BRAND.veille);
  cordMat.emissiveIntensity = 0;
  gLoop.dev.push(cordMat);
  const upper = makePart("loop-upper");
  loop.add(upper);
  const [, pinY] = PIN.at;
  const eye = 0.33;
  addMesh(upper, tube([
    [sL, SPLIT, LZ], [sL, SPLIT + 1.6, LZ], [LX - 0.02, 9, LZ], [-0.4, 15, LZ], [-eye, pinY - 0.6, LZ], [-eye, pinY, LZ], [-0.23, pinY + 0.24, LZ], [0, pinY + eye, LZ],
    [0.23, pinY + 0.24, LZ], [eye, pinY, LZ], [eye, pinY - 0.6, LZ], [-0.2, 15, LZ], [LX + 0.18, 9, LZ], [sR, SPLIT + 1.6, LZ], [sR, SPLIT, LZ],
  ], 0.1, { seg: 260 }), cordMat, { edges: false });
  const end = (parent, x, y, len, dir) => {
    const pivot = makePart("loop-end");
    pivot.position.set(x, y, LZ);
    parent.add(pivot);
    addMesh(pivot, cyl(0.1, len, 0.02, 12), cordMat, { pos: [0, (dir * len) / 2, 0], edges: false });
    return pivot;
  };
  const tailL = end(upper, sL, SPLIT, SPLIT - CUT_Y, -1); // hanging from the strands down to the chisel
  const tailR = end(upper, sR, SPLIT, SPLIT - CUT_Y, -1);
  const stubL = end(loop, sL, floor, CUT_Y - floor, 1); //  standing from the floor up to the chisel
  const stubR = end(loop, sR, floor, CUT_Y - floor, 1);
  const loopHalo = halo(BRAND.veille, 1);
  loopHalo.scale.set(5.5, 22, 1);
  loopHalo.position.set(LX + 0.3, (floor + pinY) / 2, LZ);
  loop.add(loopHalo);

  /* ═════════════ the pin, through the loop's eye, above the last flap ═════════════ */
  const gPin = group();
  const pin = makePart("pin");
  const pinL = PIN.len / 2;
  dev(gPin, pin, lathe([[0, -pinL], [PIN.r * 0.6, -pinL + 0.06], [PIN.r, -pinL + 0.4], [PIN.r, pinL - 0.1], [0, pinL]], 32, { bevel: 0.03 }).rotateX(Math.PI / 2), metal(C.metal, { rough: 0.3, metal: 0.45 }), { pos: PIN.at, threshold: 30 });
  dev(gPin, pin, new THREE.TorusGeometry(0.36, 0.09, 10, 28).rotateY(Math.PI / 2), metal(C.metal, { rough: 0.3, metal: 0.45 }), { pos: [PIN.at[0], PIN.at[1], PIN.at[2] + pinL + 0.3], edges: false });

  /* ═════════════ the unit → cutter cable: it pulls taut when the unit leaves its pocket ═════════════ */
  const gCable = group();
  const cablePart = makePart("cable");
  const UNIT_OUT = V(-8, 9, 13); // the exploded view: out of the pocket, to the side
  const CORE_OUT = V(2, 3, 13); //  …and the cutter with the loop standing in it and the pin on top, out in front of the tray
  const CABLE_PTS = [
    [V(glandX + 0.55, 2.4, 18.6), 1, 0], [V(glandX + 1.9, 1.9, 18.8), 1, 0], [V(-6.5, floor + 0.25, 18.6), 0.55, 0.35], [V(-4.4, floor + 0.25, 16.9), 0.2, 0.75],
    [V(CUTTER.at[0] - L2 - 1.1, CUTTER.at[1], LZ), 0, 1], [V(CUTTER.at[0] - L2 - 0.45, CUTTER.at[1], LZ), 0, 1],
  ];
  const cableCurve = new THREE.CatmullRomCurve3(CABLE_PTS.map(([p]) => p.clone()), false, "centripetal");
  const live = liveTube(64, 8, CABLES.r);
  live.shape(cableCurve);
  const cableSolid = solid(C.cable, { rough: 0.5, metal: 0.2, double: true });
  gCable.dev.push(cableSolid);
  const cableMesh = new THREE.Mesh(live.geo, cableSolid);
  cableMesh.frustumCulled = false;
  cableMesh.castShadow = true;
  cableMesh.receiveShadow = true;
  gCable.casters.push(cableMesh);
  cablePart.add(cableMesh);
  // the head of light: the same tube, additive, lit around uHead and in a short wake behind it
  const headMat = new THREE.ShaderMaterial({
    uniforms: { uHead: { value: 0 }, uOn: { value: 0 }, uColor: { value: VEILLE.clone() } },
    vertexShader: /* glsl */ `
      varying float vU;
      void main() { vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uHead, uOn; uniform vec3 uColor; varying float vU;
      void main() {
        float d = vU - uHead;
        float core = exp(-d * d / 0.0011);
        float wake = step(d, 0.0) * exp(max(d, -1.0) / 0.09) * 0.5;
        float k = (2.2 * core + wake) * uOn;
        if (k < 0.004) discard;
        gl_FragColor = vec4(uColor * k, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    depthFunc: THREE.LessEqualDepth,
    side: THREE.DoubleSide,
  });
  const headMesh = new THREE.Mesh(live.geo, headMat);
  headMesh.frustumCulled = false;
  headMesh.renderOrder = 4;
  headMesh.visible = false;
  cablePart.add(headMesh);
  const headHalo = halo(BRAND.veille, 1.8);
  cablePart.add(headHalo);

  /* ═════════════ assembly ═════════════ */
  root.add(main, tray, flapsAll, pilot, bag, unit, cutter, loop, pin, cablePart);
  for (const g of [gMain, gTray, ...Object.values(flaps).map((f) => f.g), gPilot, gBag]) allGlass.push(...g.glassMeshes);
  asShell(allGlass, 21);

  const parts = {
    tray, main, flaps: flapsAll, flapBottom: flaps.bottom.part, flapTop: flaps.top.part, flapLeft: flaps.left.part, flapRight: flaps.right.part,
    control, pilot, bag, unit, cutter, loop, pin, cable: cablePart,
  };
  // the exploded view's path: what moves, when, where to
  const EXP = [
    ...Object.values(flaps).map((f) => ({ part: f.part, d: f.ex, delay: f.delay, s: 0, ref: f })),
    { part: pilot, d: [0, 20, 0], delay: 0.16, s: 0 },
    { part: bag, d: [0, 10, 0], delay: 0.24, s: 0 },
    { part: unit, d: [UNIT_OUT.x, UNIT_OUT.y, UNIT_OUT.z], delay: 0.32, s: 0 },
    ...[cutter, loop, pin].map((part) => ({ part, d: [CORE_OUT.x, CORE_OUT.y, CORE_OUT.z], delay: 0.36, s: 0 })),
  ];
  const SPAN = 0.55;
  // in the exploded view the flaps also turn their outer face toward the camera (VIEW.exploded looks from az ≈ −42):
  // flat plates seen from 26° above are slivers; tilted by 34° about their own middle they read as four shapes
  const FAN_AXIS = V(Math.cos(-42 * DEG), 0, -Math.sin(-42 * DEG)); // up × (toward the camera)
  const FAN = new THREE.Quaternion().setFromAxisAngle(FAN_AXIS, 34 * DEG);
  const NOFAN = new THREE.Quaternion();
  const FAN_PIVOT = V(0, 17.5, 16);
  const _q = new THREE.Quaternion();
  const _v = V();
  const expPilot = EXP.find((e) => e.part === pilot);
  const expUnit = EXP.find((e) => e.part === unit);
  const expCore = EXP.find((e) => e.part === cutter);

  const A = {
    unit: anchor(unit, ...UNIT.at),
    sensor: anchor(unit, ...UNIT.sensor),
    control: anchor(control, cx, cy, cz),
    diode: anchor(control, ...dpos),
    cable: anchor(cablePart, 0, 0, 0),
    cutter: anchor(cutG, 0, 0, 0),
    hole: anchor(cutG, HX, 0, 0),
    piston: pistonTip,
    loop: anchor(loop, LX, (floor + pinY) / 2, LZ),
    loopTop: anchor(upper, 0, pinY + eye, LZ),
    pin: anchor(pin, ...PIN.at),
    flapTop: anchor(ft.hinge, 0, FLAPS.thick, -4),
    pilot: anchor(cap, 0, 0.6, 0),
    centre: anchor(tray, ...SYSTEM.centre),
  };

  let lastUnitS = -1;
  let lastCoreS = -1;
  const flapList = Object.values(flaps);
  const ALL_FLAP_CLOTH = flapList.flatMap((f) => f.g.cloth);
  const CUTTER_MATS = [casingMat, quarterMat];

  return {
    root, parts, A,
    update(p, time = 0) {
      const ex = clamp01(p.explode ?? 0);
      const fl = clamp01(p.flaps ?? 0);
      const dep = p.deploy ?? 0;
      const cut = clamp01(p.loop ?? 0);
      const sec = clamp01(p.section ?? 0);
      const power = clamp01(p.power ?? 1);
      const wake = clamp01(p.wake ?? 0);
      const test = clamp01(p.test ?? 0);
      const fabric = clamp01(p.fabric ?? 1);
      const solo = clamp01(p.solo ?? 0);
      const heart = clamp01(p.heart ?? 0);

      /* the exploded view */
      for (const e of EXP) {
        e.s = settle(ramp(ex, e.delay, e.delay + SPAN));
        e.part.position.set(e.d[0] * e.s, e.d[1] * e.s, e.d[2] * e.s);
        if (e.ref) {
          e.ref.s = e.s;
          // turned about the flaps' middle: position += pivot − q·pivot
          _q.slerpQuaternions(NOFAN, FAN, e.s);
          e.part.quaternion.copy(_q);
          _v.copy(FAN_PIVOT).applyQuaternion(_q);
          e.part.position.add(FAN_PIVOT).sub(_v);
        }
      }
      /* the flaps: thrown open by the spring, the last closed first; a little open in the exploded view */
      for (const f of flapList) {
        const open = springOpen(ramp(fl, f.w[0], f.w[1]));
        f.hinge.rotation[f.axis] = f.sign * FLAPS.open * DEG * open;
      }
      /* the pilot chute: its spring rises as the flaps let it go, stretches in the exploded view, leaves with deploy */
      const sp = 1 + 0.6 * expPilot.s + 0.85 * smooth(ramp(fl, 0.15, 0.9)) * (1 - expPilot.s);
      spring.scale.y = sp;
      capAt(sp);
      pilot.visible = dep <= 0.05;
      bag.visible = dep <= 0.25;

      /* the loop: cut, its upper ends spring apart and slip up (with the spring, once cut); the stubs splay */
      const ce = easeOut(cut);
      upper.position.y = ce * (1.6 + SPRING_H * (sp - 1));
      upper.visible = dep <= 0.05;
      tailL.rotation.z = -30 * DEG * ce;
      tailR.rotation.z = 30 * DEG * ce;
      stubL.rotation.z = 18 * DEG * ce;
      stubR.rotation.z = -18 * DEG * ce;

      /* the cutter: the piston, the section */
      pistonMesh.position.x = PISTON_X + CUTTER.stroke * clamp01(p.piston ?? 0);

      /* the cable pulls taut when the unit leaves its pocket (re-shaped only when that changes) */
      if (expUnit.s !== lastUnitS || expCore.s !== lastCoreS) {
        lastUnitS = expUnit.s;
        lastCoreS = expCore.s;
        for (let i = 0; i < CABLE_PTS.length; i++) {
          const [p0, wu, wc] = CABLE_PTS[i];
          cableCurve.points[i].copy(p0).addScaledVector(UNIT_OUT, expUnit.s * wu).addScaledVector(CORE_OUT, expCore.s * wc);
        }
        live.shape(cableCurve);
        cableCurve.getPoint(0.5, A.cable.position);
      }

      /* what stays, what fades */
      // the section is a cutaway close-up: whatever stands around the cutter (the bag over it, the walls) goes
      const others = (1 - solo) * (1 - 0.94 * heart) * (1 - sec);
      const inner = (1 - solo) * (1 - heart) * (1 - sec); // the pilot chute: under the loop's halo, not even a trace
      const core = 1 - solo;
      fadeGroup(gMain, others, fabric * (1 - 0.85 * smooth(ramp(ex, 0, 0.35))));
      fadeGroup(gTray, others, fabric * (1 - 0.85 * smooth(ramp(ex, 0, 0.35))));
      for (const f of flapList) fadeGroup(f.g, others, fabric);
      fadeGroup(gCtrl, others);
      fadeGroup(gCtrlCable, others * (1 - ramp(ex, 0, 0.2)));
      fadeGroup(gPilot, inner, fabric);
      fadeGroup(gSpring, inner * (0.4 + 0.6 * fabric));
      fadeGroup(gBag, inner, fabric);
      fadeGroup(gUnit, 1 - 0.94 * heart);
      fadeGroup(gCutter, core);
      fadeGroup(gLoop, core);
      fadeGroup(gPin, others);
      fadeGroup(gCable, (1 - solo) * (1 - 0.85 * heart) * (1 - 0.6 * sec));
      fadeMat(quarterMat, core * (1 - sec));
      fadeMat(quarterEdge, core * (1 - sec));
      quarter.castShadow = sec < 0.4;
      faces[0].visible = faces[1].visible = sec > 0.01 && core > 0.01;

      /* the parts the voice names, glowing faintly */
      const litFlap = p.litFlap ?? 0;
      for (const m of ALL_FLAP_CLOTH) m.emissiveIntensity = 0.22 * litFlap;
      unitMat.emissiveIntensity = 0.3 * (p.litUnit ?? 0);
      const litSensor = p.litSensor ?? 0;
      setGlow(sensorRing, 1.6 * litSensor);
      sensorRing.visible = litSensor > 0.01 && gUnit.lastA > 0.01;
      setHalo(sensorHalo, 1.4, 0.8 * litSensor * gUnit.lastA);
      const litCutter = p.litCutter ?? 0;
      for (const m of CUTTER_MATS) m.emissiveIntensity = 0.35 * litCutter;
      setHalo(cutterHalo, 1.2, 0.55 * litCutter * core);
      const lit = Math.max(heart, p.litLoop ?? 0);
      cordMat.emissiveIntensity = 0.85 * lit;
      setHalo(loopHalo, 1, (0.4 * heart + 0.12 * (p.litLoop ?? 0)) * core);

      /* the gauge */
      const press = clamp01(p.press ?? 0);
      const rate = clamp01(p.rate ?? 0);
      pressBar.scale.y = Math.max(0.001, press);
      pressBar.visible = press > 0.002;
      rateBar.scale.y = Math.max(0.001, rate);
      rateBar.visible = rate > 0.002;
      setGlow(rateMat, 1.5, rate > THRESHOLD ? SIGNAL : VEILLE);

      /* the control unit: the screen, the self-test, the diode */
      const running = test > 0.001 && test < 0.75 ? 1 : 0;
      const done = ramp(test, 0.74, 0.8);
      setGlow(screenMat, power * (0.1 + 0.08 * Math.max(wake, done)));
      const head = (test / 0.75) * 16;
      for (let i = 0; i < segs.length; i++) {
        let k = 0.28;
        if (running) {
          const behind = (((head - i) % 8) + 8) % 8; // how far the running head is past this segment
          k = behind < 1 ? 2 : 0.15 + 1.6 * Math.exp(-behind * 1.3);
        } else if (test >= 0.75) k = 1.7 - 1.1 * ramp(test, 0.85, 1);
        setGlow(segs[i], power * k);
      }
      const breath = 0.5 + 0.5 * Math.sin(time * 2.0); // ≈ 3 s a breath
      const frank = Math.max(wake, done);
      const dark = running * (1 - done);
      const kd = power * (1 - dark) * (frank * 2.4 + (1 - frank) * (0.55 + 0.75 * breath));
      setGlow(diodeMat, kd);
      const hs = (2.3 + 1.1 * frank) * (p.bench ? 1 : 1.5); // on your back it is seen from 4 m: a wider tail
      diodeHalo.scale.set(hs, hs, 1);
      setHalo(diodeHalo, 1 + 0.6 * frank, power * (1 - dark) * (frank * 0.95 + (1 - frank) * (0.4 + 0.35 * breath)) * others);

      /* the head of light along the cable */
      const h = p.litCable ?? 0;
      const on = h > 0.001 ? Math.min(1, h * 25) * (1 - ramp(h, 1, 1.06)) * gCable.lastA : 0;
      headMesh.visible = on > 0.002;
      headMat.uniforms.uHead.value = h;
      headMat.uniforms.uOn.value = on;
      if (on > 0.002) cableCurve.getPoint(Math.min(h, 1), headHalo.position);
      setHalo(headHalo, 1.6, 0.85 * on);
    },
  };
}
