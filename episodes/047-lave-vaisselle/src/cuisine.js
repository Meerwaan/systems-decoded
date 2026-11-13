// DOSSIER 047 — Lave-vaisselle : THE KITCHEN. 009's kitchen imported unchanged and wrapped (like 018/cuisine.js),
// moved so that the dishwasher stands at the end of its run; and, beside it, what this film adds:
//   · the worktop that runs on over the dishwasher, an end panel, the wall and the room's corner further right
//     (009 drew its corner at its x 300 — here x 8, through the machine: those lines are taken out of ITS line
//     geometry at run time, the file itself is never touched), its floor widened and seen from below too
//   · the tap's water (the only full thing of the kitchen: it runs), the puddle in the bowl, the waste pipe and,
//     when `drain`, heads of signal running down it into the wall (« il gaspille de l'eau »)
//   · you, of glass from head to hands, at the sink — standing right of the bowl, turned three quarters toward
//     it, never between the camera and the sink — a glass plate in your hands that goes under the tap (`rinse`)
//   · the two columns of water on the floor right of the machine, at their TRUE volumes (r 8 cm): the machine's
//     (veille) holds ten litres in 50 cm and has one mark there; yours (ink) is twice as high and has none
//
//   buildCuisine() → { group, kitchen, A, update(P, time, px) }
//   group   stands at the origin (plan.js coordinates); world.js hides it on the bench
//   A       sink, tap (the mouth), plate (moves with it), drain, waste (where the pipe enters the wall),
//           columnM, columnH (their tops when full)
//   P       room   the X-ray of the kitchen (0–1)          night  the light off: the glass dims, nothing turns blue
//           tap    the water runs (0–1)                     drain  signal heads down the waste pipe (0–1)
//           you    0 nobody · 1 you at the sink             rinse  0 the plate held before you → 1 under the water
//           litres the machine's column (1 = ten litres)    hand   yours (1 = twice as high) — no figure, ever
//
// Shell orders (asShell): you 10, the plate 12, the columns 16, the waste pipe 22, the kitchen 24.
import * as THREE from "three";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, edgesOf, fatLine, lathe, anchor } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { makePool } from "@kit/atmo.js";
import { buildKitchen } from "../../009-micro-ondes/src/kitchen.js";
import { KITCHEN, WORKTOP, SINK, WASTE, YOU, COLUMNS } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const ORDER = { you: 10, plate: 12, column: 16, pipe: 22, room: 24 };
/** 009's frame inside ours: a point of this film → the same point in 009's kitchen. */
const K9 = (x, y, z) => [x - KITCHEN.at[0], y - KITCHEN.at[1], z - KITCHEN.at[2]];
/** Where the room turns: its right wall, beyond the columns. */
const CORNER_X = 120;
/** Where you stand (right of the bowl) and how far you turn toward it. */
const STAND = { x: -152, z: 45, turn: 18 };
const KEY = V(-0.55, 0.65, 0.52).normalize(); // the studio's key light (front-left, high)
const BOWL_Y = SINK.bottom + 0.35; // the water lying in the bowl
const MACHINE_H = COLUMNS.h + 8; // the machine's glass: ten litres, and room above its mark (a mark at the brim reads as a double rim)
const HAND_H = COLUMNS.h * 2 + 3; // yours

/* ───────────────────────────────────────────── water: the only full thing of the kitchen
   Additive and unlit: bright where its surface turns away (a tube of water), the key light mirrored in it,
   slow bands that run down it (`band`) and a shiver of its radius (`wob`) — both far under a seventh of their
   period per frame. `top`: a column's surface is brighter than its side. */
function water(color, { k = 1, band = 0, wob = 0, top = 0 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uK: { value: k }, uAmount: { value: 1 }, uTime: { value: 0 },
      uBand: { value: band }, uWob: { value: wob }, uTop: { value: top }, uKey: { value: KEY },
    },
    vertexShader: /* glsl */ `
      uniform float uTime, uWob;
      varying vec3 vN; varying vec3 vV; varying vec3 vW; varying float vUp;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vec4 c = modelMatrix * vec4(0.0, position.y, 0.0, 1.0);
        float s = 1.0 + uWob * sin(w.y * 0.9 + uTime * 9.0) + 0.5 * uWob * sin(w.y * 2.3 + uTime * 13.0 + 1.7);
        w.xz = c.xz + (w.xz - c.xz) * s;
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - w.xyz);
        vUp = normal.y;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uKey; uniform float uK, uAmount, uTime, uBand, uTop;
      varying vec3 vN; varying vec3 vV; varying vec3 vW; varying float vUp;
      void main() {
        if (uAmount < 0.003) discard;
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        float f = clamp(abs(dot(n, v)), 0.0, 1.0);
        float rim = pow(clamp(1.0 - f, 0.0, 1.0), 1.6);
        float band = 1.0 + uBand * sin(vW.y * 0.8 + uTime * 20.0);
        float spec = pow(clamp(dot(n, normalize(uKey + v)), 0.0, 1.0), 36.0);
        float lid = step(0.5, vUp) * uTop;
        vec3 col = uColor * uK * ((0.22 + 0.78 * rim) * band + lid) + uColor * spec * 0.55;
        gl_FragColor = vec4(col * uAmount, 1.0);
      }`,
  });
}

/** The water lying in the bowl: rings that close slowly on the drain, brighter at it; `uDrain` turns it signal. */
function puddle(radius) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uAmount: { value: 0 }, uTime: { value: 0 }, uDrain: { value: 0 }, uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount, uTime, uDrain; uniform vec3 uInk, uSignal; varying vec2 vUv;
      void main() {
        if (uAmount < 0.003) discard;
        float r = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
        float ring = 0.5 + 0.5 * sin(r * 18.0 + uTime * 3.0);
        float a = pow(1.0 - r, 0.8) * (0.16 + 0.12 * ring) + 0.5 * exp(-r * 9.0);
        gl_FragColor = vec4(mix(uInk, uSignal, uDrain) * a * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, 48).rotateX(-Math.PI / 2), mat);
  mesh.renderOrder = 5;
  return mesh;
}

/** What runs down the waste pipe: heads of light, each with its tail upstream, fading into the wall. */
function flowMaterial(length) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL.clone() }, uAmount: { value: 0 }, uTime: { value: 0 }, uLen: { value: length }, uSpeed: { value: 38 }, uPeriod: { value: 21 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        vUv = uv;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - w.xyz);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uTime, uLen, uSpeed, uPeriod; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        if (uAmount < 0.003) discard;
        float s = vUv.x * uLen;
        float x = fract((uTime * uSpeed - s) / uPeriod); // 0 at a head, growing behind it
        float head = exp(-x * 7.0);
        float ends = smoothstep(0.0, 5.0, s) * (1.0 - smoothstep(uLen - 9.0, uLen, s));
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float k = (0.2 + 1.55 * head) * (0.5 + 0.5 * f);
        gl_FragColor = vec4(uColor * k * ends * uAmount, 1.0);
      }`,
  });
}

/** A circle of points (for a ring line) around a centre, in the plane normal to `axis` ('y' or 'z'). */
function circle(c, r, axis = "y", n = 48) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push(axis === "y" ? [c[0] + r * Math.cos(a), c[1], c[2] + r * Math.sin(a)] : [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), c[2]]);
  }
  return pts;
}

/** Rebuild one family of 009's lines: drop the segments `drop` says, add `extra` (009 coordinates). */
function relines(mesh, drop, extra) {
  const src = mesh.geometry.attributes.instanceStart.data.array;
  const out = [];
  for (let i = 0; i < src.length; i += 6) {
    const s = [src[i], src[i + 1], src[i + 2]];
    const e = [src[i + 3], src[i + 4], src[i + 5]];
    if (!drop(s, e)) out.push(...s, ...e);
  }
  for (const [a, b] of extra) out.push(...a, ...b);
  mesh.geometry.dispose();
  mesh.geometry = new LineSegmentsGeometry().setPositions(out);
}

export function buildCuisine() {
  const group = new THREE.Group();
  group.name = "cuisine";

  /* ═════════════ 1 · 009's KITCHEN, moved, and what it lacks here ═════════════ */

  const kitchen = buildKitchen({ floorAt: KITCHEN.floorAt });
  kitchen.group.position.set(...KITCHEN.at);
  group.add(kitchen.group);
  const ROOM = { shell: 1, you: 0, near: 0, pull: 0, open: 0, eyes: 0, hand: 0, pain: 0 };

  // its lines fade with depth from the oven's column: here, from the end of the run, where the dishwasher is
  for (const m of [kitchen.fx.strong, kitchen.fx.fine, kitchen.fx.faint]) {
    m.uniforms.uCentre.value.set(300, 90, 30);
    m.uniforms.uReach.value = 320;
  }
  // its room ended at its x 300 (here x 8, through the machine): its corner and the foot of its wall go; ours
  // run on to CORNER_X. The splashback's tiles go on over the dishwasher's worktop.
  const RX = K9(CORNER_X, 0, 0)[0];
  const W9 = K9(WORKTOP.x0, 0, 0)[0]; // 009's worktop end (260)
  const E9 = K9(WORKTOP.x1, 0, 0)[0];
  let fineMesh = null;
  let faintMesh = null;
  let floor = null;
  kitchen.group.traverse((o) => {
    if (o.material === kitchen.fx.fine) fineMesh = o;
    if (o.material === kitchen.fx.faint) faintMesh = o;
    if (o.material?.uniforms?.uCell) floor = o;
  });
  const atCorner = (s, e) => (s[0] > 299.9 && e[0] > 299.9) || (s[1] === 0 && e[1] === 0 && s[2] === 0 && e[2] === 0 && Math.max(s[0], e[0]) > 299.9);
  if (fineMesh)
    relines(fineMesh, atCorner, [
      [[-330, 0, 0], [RX, 0, 0]],
      [[RX, 0, 0], [RX, 0, 330]],
      [[RX, 0, 0], [RX, 236, 0]],
      [[W9, 150, 0.4], [E9, 150, 0.4]], // the tiles stop under nothing here: their top edge
    ]);
  if (faintMesh) {
    const tiles = [];
    for (let y = 110; y < 149; y += 20) tiles.push([[W9, y, 0.4], [E9, y, 0.4]]);
    for (let x = 271; x < E9; x += 20) tiles.push([[x, 90, 0.4], [x, 150, 0.4]]);
    relines(faintMesh, () => false, tiles);
  }
  // its floor: wider (under the columns, to the new corner); seen from below, it is ours (`under`)
  if (floor) {
    floor.geometry.dispose();
    floor.geometry = new THREE.PlaneGeometry(900, 560).rotateX(-Math.PI / 2).translate(-10, 0, 280);
    floor.material.uniforms.uCentre.value.set(0, 30); // its fade and its pool are in WORLD x, z: under the dishwasher
  }

  // the floor seen from BELOW (the loop starts there): the same tiles, faces turned down, brighter — 009's grid
  // only shows from above
  const underMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 }, uCell: { value: 30 }, uCentre: { value: new THREE.Vector2(0, 30) } },
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uCell; uniform vec2 uCentre; varying vec2 vP;
      float band(float q, float t) {
        float w = max(fwidth(q) * 1.5, t);
        float d = abs(fract(q - 0.5) - 0.5);
        return (t / w) * (1.0 - smoothstep(0.0, w, d));
      }
      void main() {
        if (uAmount < 0.003) discard;
        float g = max(band(vP.x / uCell, 0.014), band(vP.y / uCell, 0.014));
        float r = length(vP - uCentre);
        gl_FragColor = vec4(uColor * g * 0.55 * exp(-r / 260.0) * uAmount, 1.0);
      }`,
  });
  const under = new THREE.Mesh(new THREE.PlaneGeometry(900, 560).rotateX(Math.PI / 2).translate(-300, -0.4, 250), underMat);
  under.renderOrder = 1;
  group.add(under);

  // what this file adds of the room: glass that fades with it (`k`: its share), lines likewise
  const shellMats = [];
  const shellLines = [];
  const xglass = (o, k = 1) => {
    const mat = glass(BRAND.ink, o);
    shellMats.push({ mat, k });
    return mat;
  };
  const xlines = (obj, k) => {
    shellLines.push({ mat: obj.material, k });
    return obj;
  };

  // the niche of the oven is empty in 009 without its oven: a box of plain glass, its window drawn
  {
    const geo = new THREE.BoxGeometry(56, 34, 39);
    const oven = new THREE.Mesh(geo, xglass({ base: 0.003, rim: 0.2, power: 2.4, edge: 0.3, through: 0.22 }));
    oven.position.set(0, 161, 36.5);
    asShell([oven], ORDER.room);
    oven.add(xlines(edgesOf(geo, { width: 1.8, opacity: 0.4 }), 0.4));
    kitchen.group.add(oven);
    kitchen.group.add(xlines(fatLine([[-24, 150, 56.2], [8, 150, 56.2], [8, 172, 56.2], [-24, 172, 56.2], [-24, 150, 56.2]], { width: 1.8, opacity: 0.3 }), 0.3));
  }

  // the worktop over the dishwasher, drawn like 009's (a flat board: its lines draw it, not its light), its end panel
  {
    const { x0, x1, y0, y1, z0, z1 } = WORKTOP;
    const geo = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    const top = new THREE.Mesh(geo, xglass({ base: 0.004, rim: 0.03, power: 2.6, edge: 0, through: 0.2 }));
    top.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    asShell([top], ORDER.room);
    top.add(xlines(edgesOf(geo, { width: 2.2, opacity: 0.72 }), 0.72));
    group.add(top);
    const pg = new THREE.BoxGeometry(1.8, y0 - 10, z1 - 4 - z0);
    const panel = new THREE.Mesh(pg, xglass({ base: 0.003, rim: 0.2, power: 2.4, edge: 0.3, through: 0.22 }));
    panel.position.set(x1 - 0.9, (y0 + 10) / 2, (z0 + z1 - 4) / 2);
    asShell([panel], ORDER.room);
    panel.add(xlines(edgesOf(pg, { width: 1.8, opacity: 0.4 }), 0.4));
    group.add(panel);
  }

  /* ═════════════ 2 · THE TAP'S WATER, THE BOWL, THE WASTE PIPE ═════════════ */

  const [MX, MY, MZ] = SINK.mouth;
  const streamMat = water(BRAND.ink, { k: 0.95, band: 0.14, wob: 0.07 });
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.46, 1, 18, 40, true).translate(0, -0.5, 0), streamMat);
  stream.position.set(MX, MY, MZ);
  stream.renderOrder = 5;
  // what runs off the plate's lower edge into the bowl
  const runMat = water(BRAND.ink, { k: 0.8, band: 0.18, wob: 0.09 });
  const runoff = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.3, 1, 14, 24, true).translate(0, -0.5, 0), runMat);
  runoff.renderOrder = 5;
  // where the water lands: a small crown of light
  const splashMat = water(BRAND.ink, { k: 0.9 });
  const splash = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.26, 10, 32).rotateX(Math.PI / 2), splashMat);
  splash.renderOrder = 5;
  const bowl = puddle(10.5);
  bowl.position.set(SINK.drain[0], BOWL_Y, SINK.drain[2]);
  group.add(stream, runoff, splash, bowl);

  // the waste pipe: glass, from the bowl's drain down, through a bend, back into the wall; inside it, the flow
  const wasteCurve = new THREE.CatmullRomCurve3(
    [V(...WASTE[0]), V(WASTE[0][0], 56, WASTE[0][2]), V(...WASTE[1]), V(...WASTE[2]), V(WASTE[3][0], WASTE[3][1], -20), V(...WASTE[3])],
    false,
    "centripetal",
  );
  const pipeMat = xglass({ base: 0.003, rim: 0.34, power: 2.2, edge: 0.5, spec: 0.4, through: 0.2 });
  const pipe = new THREE.Mesh(new THREE.TubeGeometry(wasteCurve, 90, 2.1, 18, false), pipeMat);
  asShell([pipe], ORDER.pipe);
  const flowMat = flowMaterial(wasteCurve.getLength());
  const flow = new THREE.Mesh(new THREE.TubeGeometry(wasteCurve, 140, 1.45, 12, false), flowMat);
  flow.renderOrder = 6;
  const collars = [
    xlines(fatLine(circle([SINK.drain[0], SINK.drain[1] - 0.2, SINK.drain[2]], 2.9, "y", 36), { width: 1.8, opacity: 0.6 }), 0.6),
    xlines(fatLine(circle([WASTE[3][0], WASTE[3][1], WASTE[3][2] + 0.5], 3.4, "z", 36), { width: 1.8, opacity: 0.6 }), 0.6),
  ];
  group.add(pipe, flow, ...collars);

  /* ═════════════ 3 · YOU, AND THE PLATE ═════════════ */

  const you = makeFigure({ shell: true, hands: "flat", order: ORDER.you, glassK: 1.25, through: 0.2, skin: BRAND.ink });
  you.ghost(true); // glass from head to hands: nothing of the kitchen is full but the water
  you.group.position.set(STAND.x, 0, STAND.z);
  you.group.rotation.y = Math.PI + STAND.turn * DEG; // facing the wall (−z), turned a little toward the bowl (−x)
  you.group.updateMatrix();
  you.shadow.visible = true;
  group.add(you.group);
  const toYou = you.group.matrix.clone().invert();
  const toYouDir = you.group.quaternion.clone().invert();

  const plateMat = glass(BRAND.ink, { base: 0.008, rim: 0.42, power: 2.2, edge: 0.6, spec: 0.6, through: 0.2 });
  const R = YOU.plateR;
  const plateGeo = lathe([[0.01, 0], [R * 0.55, 0], [R * 0.62, 0.35], [R * 0.95, 2.1], [R, 2.3], [R, 2.75], [R * 0.94, 2.6], [R * 0.6, 0.85], [R * 0.55, 0.5], [0.01, 0.5]], 64);
  const plate = new THREE.Object3D(); // A.plate: moves (and tilts) with it
  const plateMesh = new THREE.Mesh(plateGeo, plateMat);
  asShell([plateMesh], ORDER.plate);
  const plateRim = fatLine(circle([0, 2.75, 0], R, "y", 56), { width: 2, opacity: 0.75 });
  plate.add(plateMesh, plateRim);
  group.add(plate);
  // where the plate goes: held before you (more upright, its face toward you) → under the tap (its back edge up)
  const P0 = V(STAND.x - 7.5, 104, STAND.z - 23);
  const TILT = [56 * DEG, 30 * DEG];
  const HOLD = { lean: [12, 25] };
  const at = V();
  const tmp = V();
  const side = V();
  const dirL = V();
  const palmL = V();
  const dirR = V();
  const palmR = V();
  const LAY_L = { dir: dirL, palm: palmL };
  const LAY_R = { dir: dirR, palm: palmR };
  const last = { rinse: -1 };
  const ARMS = [["L", -1, dirL, palmL, LAY_L], ["R", 1, dirR, palmR, LAY_R]]; // the figure's own left is toward −x here
  function poseYou(r) {
    const u = smooth(0, 1, r);
    at.set(mix(P0.x, YOU.plate[0], u), mix(P0.y, YOU.plate[1], u), mix(P0.z, YOU.plate[2], u));
    const tilt = mix(TILT[0], TILT[1], u);
    plate.position.copy(at);
    plate.rotation.set(tilt, 0, 0);
    you.lean(mix(HOLD.lean[0], HOLD.lean[1], u), 0, -6 * u);
    // each hand on the plate's rim, at its left and right, the fingers under it, the palm up toward it
    const c = Math.cos(tilt);
    const s = Math.sin(tilt);
    for (let i = 0; i < 2; i++) {
      const [arm, sx, dir, palm, lay] = ARMS[i];
      side.set(sx * (R + 0.6), -0.9 * c, -0.9 * s); // on the rim, a little under it (the plate's own −y, tilted)
      tmp.copy(at).add(side).applyMatrix4(toYou);
      dir.set(-sx, 0.15 * c, 0.15 * s).normalize().applyQuaternion(toYouDir);
      palm.set(0, c, s).applyQuaternion(toYouDir);
      you.reach(arm, tmp, null, lay);
    }
  }
  poseYou(0);

  /* ═════════════ 4 · THE TWO COLUMNS OF WATER ═════════════ */

  const columns = [];
  for (const [base, h, color, k, mark] of [
    [COLUMNS.machine, MACHINE_H, BRAND.veille, 0.85, true],
    [COLUMNS.hand, HAND_H, BRAND.ink, 0.6, false],
  ]) {
    const [cx, cy, cz] = base;
    const mat = glass(BRAND.ink, { base: 0.003, rim: 0.3, power: 2.3, edge: 0.55, spec: 0.55, through: 0.25 });
    const can = new THREE.Mesh(new THREE.CylinderGeometry(COLUMNS.r, COLUMNS.r, h, 48, 1, true), mat);
    can.position.set(cx, cy + h / 2, cz);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(COLUMNS.r, COLUMNS.r, 0.6, 48), mat);
    foot.position.set(cx, cy + 0.3, cz);
    asShell([can, foot], ORDER.column);
    const rings = [
      fatLine(circle([cx, cy + 0.6, cz], COLUMNS.r, "y"), { width: 1.8, opacity: 0.55 }),
      fatLine(circle([cx, cy + h, cz], COLUMNS.r, "y"), { width: 2, opacity: 0.7 }),
    ];
    if (mark) rings.push(fatLine(circle([cx, cy + COLUMNS.h, cz], COLUMNS.r + 0.25, "y"), { color: BRAND.veille, width: 2.4, opacity: 0.85 })); // ten litres: one mark, no figure
    const wmat = water(color, { k, top: 0.85 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(COLUMNS.r - 0.55, COLUMNS.r - 0.55, 1, 48).translate(0, 0.5, 0), wmat);
    body.position.set(cx, cy + 0.6, cz);
    body.renderOrder = 5;
    const pool = makePool({ radius: 26, color });
    pool.mesh.position.set(cx, 0.06, cz);
    group.add(can, foot, body, pool.mesh, ...rings);
    columns.push({ mat, can, foot, rings, wmat, body, pool, h: COLUMNS.h * (mark ? 1 : 2), cy: cy + 0.6 });
  }

  /* ═════════════ anchors ═════════════ */

  const A = {
    sink: anchor(group, SINK.x, SINK.top, SINK.z),
    tap: anchor(group, ...SINK.mouth),
    plate,
    drain: anchor(group, ...SINK.drain),
    waste: anchor(group, ...WASTE.at(-1)),
    columnM: anchor(group, COLUMNS.machine[0], COLUMNS.machine[1] + COLUMNS.h, COLUMNS.machine[2]),
    columnH: anchor(group, COLUMNS.hand[0], COLUMNS.hand[1] + COLUMNS.h * 2, COLUMNS.hand[2]),
  };

  const allWater = [streamMat, runMat, splashMat];

  return {
    group, kitchen, A, you,
    update(P = {}, time = 0, px = 1) {
      const { room = 1, night = 0, tap = 0, drain = 0, you: showYou = 0, rinse = 0, litres = 0, hand = 0 } = P;

      // the room: 009's kitchen and what this file adds to it; at night the glass dims (nothing turns blue)
      const sh = clamp01(room) * (1 - 0.72 * clamp01(night));
      ROOM.shell = sh;
      kitchen.update(ROOM, time, px);
      // its floor keeps more of its grid at night: from below (the loop), it is what the eye climbs through
      if (floor) floor.material.uniforms.uAmount.value = clamp01(room) * (1 - 0.25 * clamp01(night));
      underMat.uniforms.uAmount.value = clamp01(room);
      under.visible = room > 0.01;
      for (let i = 0; i < shellMats.length; i++) shellMats[i].mat.uniforms.uAmount.value = sh * shellMats[i].k;
      for (let i = 0; i < shellLines.length; i++) {
        const l = shellLines[i];
        l.mat.opacity = sh * l.k;
        l.mat.visible = sh > 0.01;
      }

      // you and the plate
      const here = showYou > 0.5;
      you.group.visible = here;
      plate.visible = here;
      if (here && rinse !== last.rinse) {
        last.rinse = rinse;
        poseYou(clamp01(rinse));
      }
      you.body.uniforms.uAmount.value = 1 - 0.35 * clamp01(night);
      plateMat.uniforms.uAmount.value = 1 - 0.35 * clamp01(night);

      // the tap: the column of water falls from the mouth; the plate, if it is under it, takes it
      const run = clamp01(tap);
      const grow = smooth(0, 0.4, run);
      let land = BOWL_Y;
      let onPlate = false;
      if (here) {
        const tilt = plate.rotation.x;
        const dz = MZ - plate.position.z;
        const dx = MX - plate.position.x;
        const inPlane = Math.hypot(dx, dz / Math.cos(tilt));
        if (inPlane < R - 1.2) {
          const zl = (dz - 0.5 * Math.sin(tilt)) / Math.cos(tilt); // where it meets the plate's floor (its own y 0.5)
          land = plate.position.y + 0.5 * Math.cos(tilt) - zl * Math.sin(tilt);
          onPlate = true;
        }
      }
      const fall = Math.max(0.5, MY - land);
      stream.visible = run > 0.01;
      stream.scale.y = Math.max(0.5, fall * grow);
      for (let i = 0; i < allWater.length; i++) allWater[i].uniforms.uTime.value = time;
      streamMat.uniforms.uAmount.value = smooth(0, 0.25, run);
      const landed = grow > 0.98;
      splash.visible = stream.visible && landed;
      splash.position.set(MX, land + 0.2, MZ);
      splash.scale.setScalar(1 + 0.12 * Math.sin(time * 2.1));
      splashMat.uniforms.uAmount.value = 0.8 * run;
      // off the plate's lower (near) edge, down into the bowl
      runoff.visible = stream.visible && landed && onPlate;
      if (runoff.visible) {
        const tilt = plate.rotation.x;
        const ex = plate.position.x;
        const ey = plate.position.y + 2.3 * Math.cos(tilt) - R * Math.sin(tilt);
        const ez = plate.position.z + R * Math.cos(tilt) + 2.3 * Math.sin(tilt);
        runoff.position.set(ex + 3, ey, ez);
        runoff.scale.y = Math.max(0.5, ey - BOWL_Y);
        runMat.uniforms.uAmount.value = 0.85 * run;
      }
      bowl.material.uniforms.uAmount.value = smooth(0.2, 0.7, run) * (landed ? 1 : 0.4) + 0.6 * clamp01(drain);
      bowl.material.uniforms.uTime.value = time;
      bowl.material.uniforms.uDrain.value = clamp01(drain);
      bowl.visible = run > 0.01 || drain > 0.01;

      // the waste pipe: glass with the room; signal heads when the water goes to waste
      const d = clamp01(drain);
      flow.visible = d > 0.01;
      flowMat.uniforms.uAmount.value = d;
      flowMat.uniforms.uTime.value = time;

      // the columns: invisible while empty; the water rises, its surface calm once it has stopped
      for (let i = 0; i < 2; i++) {
        const c = columns[i];
        const f = clamp01(i === 0 ? litres : hand);
        const show = f > 0.002;
        const a = smooth(0, 0.06, f);
        c.can.visible = c.foot.visible = c.body.visible = c.pool.mesh.visible = show;
        c.mat.uniforms.uAmount.value = a;
        for (let j = 0; j < c.rings.length; j++) {
          c.rings[j].visible = show;
          c.rings[j].material.opacity = a * (j === 2 ? 0.85 : j === 1 ? 0.7 : 0.55);
        }
        c.body.scale.y = Math.max(0.05, f * c.h - 0.6);
        c.wmat.uniforms.uAmount.value = a;
        c.wmat.uniforms.uTime.value = time;
        c.pool.uniforms.uAmount.value = 0.22 * f;
      }
    },
  };
}
