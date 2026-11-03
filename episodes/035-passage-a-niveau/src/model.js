// DOSSIER 035 — Passage à niveau : THE SYSTEM, the G2 signal of an automatic level crossing — the mast, its R24
// (a flashing red lamp, double-faced), its bell on top, the housing at its foot and the half-barrier: the BOOM,
// painted in white and red retroreflective bands all over. SOLID (the system): three values of grey, fine edges —
// the housing dark (cast iron), the mast mid grey, the boom the lightest (the hero part).
// world.js builds it FOUR times (plan.js SIGNALS): the hero (outA, the exit boom in front of your hood) is the one
// that goes to the bench and the one that gives. Geometries are shared, materials are per instance.
//
//   buildSignal({ hero = false } = {}) → { root, parts, A, update(p, time, px) }
//   p = { down, give, flash, ring, shine, explode, sweep, litLamp, litBell, litBar, litBoom, bench }
//     down     the boom: 0 raised (vertical) → 1 lowered (horizontal, pointing −x); the counterweight follows
//     give     the hero's boom yields under the hood: 0 → 0.3 it bows where the hood pushes (≈ 2 m out), then it
//              swings away toward −z about its pivot, whips straight and fades out (gone at 0.9). A veille rim
//              pulses on « cède ». NO break point, no hinge, no splinter (nothing sourced: faits § 9)
//     flash    the R24: 0 dark → 1 blinking at 1 Hz (lit ≈ 0.5 s, soft attack and release, from `time`), signal
//     ring     the bell: 0 still → 1 ringing (it shivers; two thin ink arcs « (( )) » leave it, slowly)
//     shine    the boom's bands give the headlamps back: 0 matte → 1 bright (white bands ink, red bands signal),
//              strongest where the car's headlamps hit (≈ 2 m out from the pivot)
//     explode  on the bench only: 0 assembled → 1 apart, in ONE vertical frame: the lid slides up the mast, the bell
//              rises, the lamp's lens and visor step out of their black plate, the boom slides out of its hub
//     sweep    on the bench only: two headlamp spots run along the boom from beyond its tip to its pivot (0 → 1);
//              the bands light where they hit (« elle brille dans tes phares »)
//     litLamp  the R24's edges turn veille, its lens glows faintly
//     litBell  the bell's edges turn veille
//     litBar   the support's edges turn veille (housing, lid, hub, mast) and the boom takes a veille rim
//     litBoom  the boom alone: its veille rim, a veille halo behind it, and (on the bench) the rest fades to a ghost
//     bench    1 on the bench (the halo, `explode`, `sweep`, the ghosting live), 0 on the road
//
//   A = { lamp, bell, pivot, tip, mid, foot, top }   anchors the callouts and the camera aim at (they follow the
//       explode, the boom's angle and its give)
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, setGlow, box, cyl, lathe, lineMat, anchor, setPartOpacity } from "@kit/build3d.js";
import { MAST, R24, BELL, HOUSING, BOOM } from "./plan.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// leaves fast, arrives with a slight overshoot and settles: parts have weight (as kit explode)
const settle = (u) => {
  const e = easeInOut(u);
  return e + Math.sin(Math.PI * u) * Math.sin(Math.PI * u) * 0.055 * (u > 0.5 ? 1 : 0.25);
};
const win = (k, delay, span) => clamp01((k - delay) / span);

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const VEILLE_EDGE = VEILLE.clone().multiplyScalar(1.5);

/* ─────────────────────────────────────────────────────────── the sizes (cm, the signal's own frame) */
const SEG = BOOM.band / 2; //                    the boom is a chain of 25 cm segments (two per band)
const NSEG = Math.round(BOOM.len / SEG); //      16
const BH = 5.5; //                               the boom's oval section: half height…
const BW = 4; //                                 …half width
const RIM = 1.4; //                              the veille rim around it (inverted hull), cm
const [PX, PY] = BOOM.pivot; //                  the hub, on the housing's −x flank
const PUSH = 205; //                             where the hood meets the hero boom, cm from the pivot (car's centre)
const BODY = { h: HOUSING.size[1] - 14, y0: 8 }; // the housing's body between its plinth and its lid
const LID_Y = BODY.y0 + BODY.h + 3.5;
const MAST_Y0 = LID_Y + 3.5; //                  the mast leaves the lid
const BELL_TOP = MAST.h + 6; //                  the bell hangs mouth down over the mast's top
const FACE_Z = 10.5; //                          the lamp's face, either side of the mast

/* ─────────────────────────────────────────────────────────── light that has a place */

/** A ball of light with no edge (as 007): brightest where it faces the eye. `back`: drawn from the inside, so that
 *  what stands in front of it (the boom) hides it — a halo BEHIND, never a veil over. */
const softGlow = (power, back = false) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: back ? THREE.BackSide : THREE.FrontSide,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uPower: { value: power } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * f, 1.0);
      }`,
  });

/* ─────────────────────────────────────────────────────────── shared geometries */

let G = null;
function geos() {
  if (G) return G;
  // a tube along −x, from x = −len to 0, oval section ry × rz (open: the chain's segments butt onto each other)
  const tube = (ry, rz, len) => new THREE.CylinderGeometry(1, 1, len, 28, 1, true).rotateZ(Math.PI / 2).scale(1, ry, rz).translate(-len / 2, 0, 0);
  const dome = (rx, ry, rz) => new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2).rotateZ(Math.PI / 2).scale(rx, ry, rz);
  // the bell, mouth down, its top at y = 0: a thick bronze-like shell turned about the mast's axis
  const bellProfile = [
    [0, 4.5], [2.6, 4.5], [3, 2.3], [6.6, 1.3], [9, -0.8], [10.2, -4], [10.6, -9], [11.4, -13.4], [13, -16.4], [15.2, -18.2], [15.4, -19.3],
    [13.6, -19.3], [11.8, -17], [10.1, -13.2], [9.2, -8.8], [8.6, -4.4], [6.4, -1.4], [0, -0.6],
  ];
  // the R24's lens, bulging toward +z
  const lensProfile = [[0, 0], [R24.r, 0], [R24.r - 0.6, 1.3], [R24.r - 4, 2.7], [0, 3.3]];
  G = {
    seg: tube(BH, BW, SEG + 0.04),
    hull: tube(BH + RIM, BW + RIM, SEG + 0.04),
    cap: dome(6, BH, BW),
    capHull: dome(6 + RIM, BH + RIM, BW + RIM),
    sleeve: cyl(1, 34, 0.06, 40).rotateZ(Math.PI / 2).scale(1, BH + 1.8, BW + 1.8).translate(-11, 0, 0),
    halo: new THREE.SphereGeometry(1, 32, 16),
    plinth: box(56, 8, 50, 1.2),
    body: box(HOUSING.size[0], BODY.h, HOUSING.size[2], 2.2),
    door: box(30, 56, 1.4, 0.5),
    lock: cyl(1.7, 1.6, 0.3, 20).rotateX(Math.PI / 2),
    slat: box(20, 1.6, 1.4, 0.4),
    lid: box(HOUSING.size[0] + 5, 7, HOUSING.size[2] + 5, 1.8),
    hub: cyl(8.5, 40, 0.8, 40).rotateX(Math.PI / 2),
    arm: box(50, 7, 5, 1),
    weight: box(18, 30, 10, 1.6),
    mast: cyl(MAST.r, MAST.h - MAST_Y0, 0.5, 40),
    collar: cyl(MAST.r + 3, 8, 0.6, 40),
    capTop: cyl(MAST.r + 1.5, 4, 0.6, 40),
    plate: box(R24.plate[0], R24.plate[1], 4, 1.2),
    bezel: cyl(R24.r + 3, 3, 0.5, 40).rotateX(Math.PI / 2).translate(0, 0, 1.5),
    lens: lathe(lensProfile, 48, { crease: 40 }).rotateX(Math.PI / 2).translate(0, 0, 3),
    lensGlow: lathe(lensProfile, 48).rotateX(Math.PI / 2).scale(1.01, 1.01, 1.05).translate(0, 0, 3),
    visor: new THREE.CylinderGeometry(R24.r + 4, R24.r + 4, R24.visor + 2, 40, 1, true, Math.PI - 1.8, 3.6).rotateX(Math.PI / 2).translate(0, 0, (R24.visor + 2) / 2 + 1),
    bell: lathe(bellProfile, 56, { crease: 35 }),
    // the sound: an arc each side of the bell, unit radius, in the screen's plane (billboarded)
    arcs: (() => {
      const pts = [];
      for (const c of [0, Math.PI]) {
        for (let i = 0; i < 10; i++) {
          const a0 = c - 0.75 + (1.5 * i) / 10;
          const a1 = c - 0.75 + (1.5 * (i + 1)) / 10;
          pts.push(Math.cos(a0), Math.sin(a0), 0, Math.cos(a1), Math.sin(a1), 0);
        }
      }
      return new LineSegmentsGeometry().setPositions(pts);
    })(),
  };
  return G;
}

/* the hood's push bends the boom like a cantilever: curvature ∝ (PUSH − s) up to the hood, none beyond */
const BEND = (() => {
  const w = new Float32Array(NSEG);
  let sum = 0;
  for (let i = 0; i < NSEG; i++) {
    w[i] = Math.max(0, PUSH - i * SEG);
    sum += w[i];
  }
  for (let i = 0; i < NSEG; i++) w[i] /= sum;
  return w;
})();
/* where the car's headlamps hit the boom on the road (shine is strongest there) */
const PROF = Float32Array.from({ length: NSEG }, (_, i) => 0.62 + 0.38 * Math.exp(-((((i + 0.5) * SEG - PUSH) / 170) ** 2)));

const _p = new THREE.Vector3();

export function buildSignal({ hero = false } = {}) {
  const g = geos();
  const root = new THREE.Group();

  /* ── the housing: plinth, body, a door each face, its lock ── */
  const housing = makePart("housing");
  const iron = solid(0x40464c, { rough: 0.62, metal: 0.35 });
  const plinth = solid(0x4c5257, { rough: 0.85 });
  const doorMat = solid(0x4a5157, { rough: 0.5, metal: 0.35 });
  addMesh(housing, g.plinth, plinth, { pos: [0, 4, 0] });
  addMesh(housing, g.body, iron, { pos: [0, BODY.y0 + BODY.h / 2, 0] });
  for (const s of [1, -1]) {
    addMesh(housing, g.door, doorMat, { pos: [-2, BODY.y0 + 50, s * (HOUSING.size[2] / 2 + 0.7)] });
    addMesh(housing, g.lock, doorMat, { pos: [9, BODY.y0 + 58, s * (HOUSING.size[2] / 2 + 1.6)] });
    for (let i = 0; i < 4; i++) addMesh(housing, g.slat, doorMat, { pos: [-2, BODY.y0 + 68 + i * 4.2, s * (HOUSING.size[2] / 2 + 2)], rot: [s * 0.5, 0, 0] });
  }
  /* ── the lid: its own part (it slides up the mast in the exploded view) ── */
  const lid = makePart("lid");
  addMesh(lid, g.lid, solid(0x484e54, { rough: 0.55, metal: 0.35 }), { pos: [0, LID_Y, 0] });

  /* ── the hub on the housing's flank, and the counterweight that turns with the boom ── */
  const weight = makePart("weight");
  const hubMat = solid(0x5a6168, { rough: 0.45, metal: 0.4 });
  addMesh(weight, g.hub, hubMat, { pos: [PX, PY, 8] });
  const hubPitch = new THREE.Group();
  hubPitch.position.set(PX, PY, 0);
  weight.add(hubPitch);
  const armMat = solid(0x464c52, { rough: 0.55, metal: 0.35 });
  addMesh(weight, g.arm, armMat, { pos: [21, 0, 27] });
  addMesh(weight, g.weight, armMat, { pos: [40, -7, 27.5] });
  // addMesh adds to the part: move those two under the hub's pitch
  for (const m of weight.children.slice(-2)) hubPitch.add(m);

  /* ── the mast ── */
  const mast = makePart("mast");
  const steel = solid(0x8c949b, { rough: 0.42, metal: 0.3 });
  addMesh(mast, g.mast, steel, { pos: [0, MAST_Y0 + (MAST.h - MAST_Y0) / 2, 0] });
  addMesh(mast, g.collar, steel, { pos: [0, MAST_Y0 + 6, 0] });
  addMesh(mast, g.capTop, steel, { pos: [0, MAST.h - 2, 0] });

  /* ── the R24, double-faced: a black plate each face; the lens, its bezel and visor step out of it ── */
  const lamp = makePart("lamp");
  const black = solid(0x24292d, { rough: 0.5, metal: 0.2 });
  const lensMat = solid(0x5c1d12, { rough: 0.3, metal: 0 });
  lensMat.userData.finish = false;
  const visorMat = solid(0x24292d, { rough: 0.5, metal: 0.2, double: true });
  const faces = [];
  const lensGlow = [];
  const lampHalo = [];
  for (const s of [1, -1]) {
    addMesh(lamp, g.plate, black, { pos: [0, R24.y, s * (FACE_Z - 2)] });
    const face = new THREE.Group();
    face.position.set(0, R24.y, s * FACE_Z);
    face.rotation.y = s > 0 ? 0 : Math.PI;
    lamp.add(face);
    for (const [geo, mat, o] of [[g.bezel, black, {}], [g.lens, lensMat, {}], [g.visor, visorMat, { edgeOpacity: 0.3 }]]) {
      const m = addMesh(lamp, geo, mat, o);
      face.add(m);
    }
    const gl = glow(BRAND.signal, 0, { additive: true });
    lamp.userData.part.mats.add(gl);
    const glm = new THREE.Mesh(g.lensGlow, gl);
    face.add(glm);
    const halo = softGlow(2.4);
    const hm = new THREE.Mesh(g.halo, halo);
    hm.scale.setScalar(R24.r * 1.9);
    hm.position.z = 9;
    hm.renderOrder = 4;
    face.add(hm);
    faces.push(face);
    lensGlow.push(gl);
    lampHalo.push(hm);
  }

  /* ── the bell on top, mouth down; it shivers when it rings, and the sound leaves it in arcs ── */
  const bell = makePart("bell");
  const bronze = solid(0x8d959b, { rough: 0.46, metal: 0.3 });
  const bellBody = new THREE.Group();
  bellBody.position.set(0, BELL_TOP, 0);
  bell.add(bellBody);
  bellBody.add(addMesh(bell, g.bell, bronze));
  const waves = [];
  for (let i = 0; i < 2; i++) {
    const mat = lineMat(BRAND.ink, 2.2, { opacity: 0 });
    const w = new LineSegments2(g.arcs, mat);
    w.position.set(0, BELL_TOP - 9, 0);
    w.frustumCulled = false;
    w.renderOrder = 5;
    w.visible = false;
    // billboard: the arcs face the camera, whatever turns the signal (the mounts, the explode)
    w.onBeforeRender = (renderer, scene, camera) => {
      _p.copy(w.position).applyMatrix4(w.parent.matrixWorld);
      w.matrixWorld.compose(_p, camera.quaternion, w.scale);
    };
    bell.add(w);
    waves.push(w);
  }

  /* ── the boom: yaw (give) › pitch (down) › slide (explode) › the chain of 16 segments ── */
  const bar = makePart("boom");
  const yaw = new THREE.Group();
  yaw.position.set(PX, PY, 0);
  const pitch = new THREE.Group();
  yaw.add(pitch);
  const slide = new THREE.Group();
  pitch.add(slide);
  bar.add(yaw);
  const sleeveMat = solid(0x7d858c, { rough: 0.4, metal: 0.35 });
  slide.add(addMesh(bar, g.sleeve, sleeveMat));
  const hullMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide, transparent: true, depthWrite: false, fog: false });
  hullMat.visible = false;
  const chain = [];
  const segMats = [];
  let parent = slide;
  for (let i = 0; i < NSEG; i++) {
    const link = new THREE.Group();
    link.position.x = i ? -SEG : 0;
    parent.add(link);
    const red = Math.floor(i / 2) % 2 === 1; // band 0 (at the pivot) white … band 7 (the tip) red
    const mat = red ? solid(0x9a3a26, { rough: 0.38, metal: 0.05 }) : solid(0xdedad0, { rough: 0.36, metal: 0.05 });
    mat.emissive.copy(red ? SIGNAL : INK);
    mat.emissiveIntensity = 0;
    link.add(addMesh(bar, g.seg, mat, { edges: false }));
    const h = new THREE.Mesh(g.hull, hullMat);
    h.renderOrder = 1;
    link.add(h);
    chain.push(link);
    segMats.push(mat);
    parent = link;
  }
  const tipMat = segMats[NSEG - 1];
  const capMesh = addMesh(bar, g.cap, tipMat, { edges: false, pos: [-SEG, 0, 0] });
  parent.add(capMesh);
  const capHull = new THREE.Mesh(g.capHull, hullMat);
  capHull.position.x = -SEG;
  parent.add(capHull);
  // the halo the boom alone stands on (litBoom): behind it, never over it
  const boomHalo = softGlow(3.2, true);
  const haloMesh = new THREE.Mesh(g.halo, boomHalo);
  haloMesh.scale.set(BOOM.len * 0.6, 34, 34);
  haloMesh.position.set(-BOOM.len / 2 - 10, 0, -14);
  haloMesh.visible = false;
  haloMesh.renderOrder = -1;
  slide.add(haloMesh);

  root.add(housing, lid, weight, mast, lamp, bell, bar);
  const parts = { housing, lid, weight, mast, lamp, bell, boom: bar };
  const ghosted = [housing, lid, weight, mast, lamp, bell];

  // edge lines that turn veille when the voice names their part
  const edgesOf = (list) => {
    const mats = [];
    for (const part of list) for (const m of part.userData.part.mats) if (m.isLineMaterial) mats.push(m);
    return { mats, base: mats.map((m) => m.color.clone()) };
  };
  const edgeLamp = edgesOf([lamp]);
  const edgeBell = edgesOf([bell]);
  const edgeBar = edgesOf([housing, lid, weight, mast, bar]);
  const tint = ({ mats, base }, k) => {
    for (let i = 0; i < mats.length; i++) mats[i].color.copy(base[i]).lerp(VEILLE_EDGE, k);
  };
  const last = { lamp: -1, bell: -1, bar: -1 };

  const A = {
    lamp: anchor(faces[0], 0, 0, 4),
    bell: anchor(bellBody, 0, -9, 0),
    pivot: anchor(pitch, 0, 0, 0),
    tip: anchor(chain[NSEG - 1], -SEG - 6, 0, 0),
    mid: anchor(chain[NSEG / 2], 0, 0, 0),
    foot: anchor(lid, 0, LID_Y + 3.5, 0),
    top: anchor(mast, 0, MAST.h, 0),
  };

  return {
    root, parts, A, hero,
    update({ down = 0, give = 0, flash = 0, ring = 0, shine = 0, explode: k = 0, sweep = 0, litLamp = 0, litBell = 0, litBar = 0, litBoom = 0, bench = 0 } = {}, time = 0) {
      const onBench = bench > 0.5;
      /* the exploded view (bench only) */
      const e = onBench ? clamp01(k) : 0;
      lid.position.y = 48 * settle(win(e, 0, 0.5));
      bell.position.y = 70 * settle(win(e, 0.12, 0.5));
      const out = 26 * settle(win(e, 0.24, 0.5));
      faces[0].position.z = FACE_Z + out;
      faces[1].position.z = -FACE_Z - out;
      slide.position.x = -95 * settle(win(e, 0.36, 0.55));

      /* down: the boom and its counterweight turn about the hub */
      const tilt = -(Math.PI / 2) * (1 - clamp01(down));
      pitch.rotation.z = tilt;
      hubPitch.rotation.z = tilt;

      /* give: it bows under the hood, then swings away toward −z, whips straight and fades */
      const gv = clamp01(give);
      let swing, bow;
      if (gv < 0.3) {
        const u = smooth(0, 0.3, gv);
        swing = 0.06 * u;
        bow = 0.34 * u;
      } else {
        const u = (gv - 0.3) / 0.7;
        swing = 0.06 + 1.0 * (1 - Math.pow(1 - u, 3));
        bow = 0.34 * Math.exp(-5 * u) * Math.cos(8 * u);
      }
      yaw.rotation.y = -swing;
      for (let i = 0; i < NSEG; i++) chain[i].rotation.y = -bow * BEND[i];
      const barOp = 1 - smooth(0.45, 0.85, gv);
      setPartOpacity(bar, barOp);
      const pulse = smooth(0.24, 0.34, gv) * (1 - smooth(0.42, 0.8, gv));

      /* the bands: retroreflection (shine), the sweep's two headlamp spots */
      const sw = onBench ? sweep : 0;
      const env = smooth(0, 0.04, sw) * (1 - smooth(0.96, 1, sw));
      const s1 = BOOM.len + 90 - sw * (BOOM.len + 330);
      for (let i = 0; i < NSEG; i++) {
        const s = (i + 0.5) * SEG;
        const a = (s - s1) / 40;
        const b = (s - s1 - 150) / 40;
        const spot = env * (Math.exp(-a * a) + Math.exp(-b * b));
        const red = Math.floor(i / 2) % 2 === 1;
        segMats[i].emissiveIntensity = (red ? 0.8 : 1) * (0.85 * shine * PROF[i] + 1.7 * spot);
      }

      /* the boom's veille rim, and its halo (litBoom) */
      const rim = Math.max(litBar, litBoom, pulse);
      hullMat.visible = rim > 0.01 && barOp > 0.01;
      if (hullMat.visible) {
        hullMat.color.copy(VEILLE).multiplyScalar(1.3 * rim);
        hullMat.opacity = barOp;
      }
      const hk = litBoom * (onBench ? 1 : 0.4) * barOp;
      haloMesh.visible = hk > 0.01;
      if (haloMesh.visible) boomHalo.uniforms.uColor.value.copy(VEILLE).multiplyScalar(0.42 * hk);
      // on the bench, « sa lisse » stands alone: the rest of the signal fades to a ghost
      const ghost = 1 - 0.8 * (onBench ? clamp01(litBoom) : 0);
      for (let i = 0; i < ghosted.length; i++) setPartOpacity(ghosted[i], ghost);

      /* the R24: 1 Hz, lit ≈ 0.5 s, soft attack and release (a breath, never a flicker) */
      const ph = (((time + 0.1) % 1) + 1) % 1;
      const on = clamp01(flash) * smooth(0, 0.1, ph) * (1 - smooth(0.45, 0.62, ph));
      for (let i = 0; i < 2; i++) {
        setGlow(lensGlow[i], 1.1 * on + 0.4 * litLamp);
        lampHalo[i].material.uniforms.uColor.value.copy(SIGNAL).multiplyScalar((0.6 * on + 0.15 * litLamp) * ghost);
        lampHalo[i].visible = on + litLamp > 0.01;
      }

      /* the bell: it shivers, two arcs leave it slowly */
      const r = clamp01(ring);
      bellBody.rotation.z = 0.03 * r * Math.sin(time * Math.PI * 2 * 6.5);
      for (let i = 0; i < 2; i++) {
        const w = waves[i];
        w.visible = r > 0.01;
        if (!w.visible) continue;
        const u = (((time * 0.7 + i * 0.5) % 1) + 1) % 1;
        w.scale.setScalar(BELL.r * (1.7 + 3.6 * u));
        w.material.opacity = 0.85 * r * Math.pow(Math.sin(Math.PI * u), 1.3) * ghost;
      }

      /* the parts the voice names: their edges turn veille */
      if (litLamp !== last.lamp) tint(edgeLamp, clamp01(litLamp)), (last.lamp = litLamp);
      if (litBell !== last.bell) tint(edgeBell, clamp01(litBell)), (last.bell = litBell);
      if (litBar !== last.bar) tint(edgeBar, clamp01(litBar)), (last.bar = litBar);
    },
  };
}
