// DOSSIER 052 — Télésiège débrayable : THE SYSTEM, solid. The detachable grip (pince débrayable) of one chair, in the
// GRIP FRAME of plan.js (origin on the cable's axis when closed; x the travel, y up, z outward). The brief:
// docs/052-decors.md « model.js »; the journal: docs/journal/052-model.md.
//
// buildGrip() → { root, parts, A, update(P, time, px) }
//   root     what world.js re-parents: on the chair's grip mount in the scene (ligne.js), on the bench's mount
//   parts    by name (each fades on its own materials): body, fixedJaw, mobileJaw, lever, roller, spring, plate,
//            and, on the bench only, came (a length of the station's came, over the roller) and rope (a length of cable)
//   A        anchors (Object3D): jaws (between the jaws, on the cable), lever, roller, spring, came, plate, hanger
//   update   sixteen times a frame, no allocation; P plain numbers (world.js hands them over):
//     bench    1 on the bench (the came and the rope length show), 0 in the scene (gare.js / ligne.js draw them)
//     explode  0 assembled → 1 the parts apart (bench only), each on its own path
//     open     0 closed on the cable → 1 open: the roller pressed down CAME.push, the lever swung, the mobile jaw
//              swung away, the spring COMPRESSED (it is what pushes back)
//     weak     0 → 1 the spring's weakness: a signal rim on the coil, the jaws close without force
//     slip     cm: how far the cable has run past the jaws (rope − chair): the strands slide (bench)
//     litCame litLever litRoller litJaws litSpring   the part the voice names, faintly veille (0–1); the spring is the heart
//
// THE MECHANISM (what moves, in the grip frame):
//   · the BODY, a dark casting under the cable: an ear carries the lever's pivot (PIVOT, axis z), a pin along x the
//     mobile jaw's hinge (HINGE), a lug at its front end the spring's fixed seat; a neck down to the friction plate.
//   · the FIXED JAW cradles the cable from the inner side and below; the MOBILE JAW hooks over it from the outer side.
//   · the LEVER is a bell crank on PIVOT: its long arm goes back and up to the ROLLER, its short arm down to the
//     spring's cap. The came presses the roller DOWN by CAME.push → the lever turns (θ) → the short arm drives the cap
//     forward → the spring COMPRESSES; the mobile jaw swings outward (≈ 25°) at the same time. Off the came, the spring
//     pushes all of it back: the jaws close on the cable.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, glass, setGlow, setPartOpacity, box, cyl, plate as slab, anchor, mergeGeometries, placed } from "@kit/build3d.js";
import { GRIP, CAME, CABLE } from "./plan.js";

const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (u) => u * u * (3 - 2 * u);
// leaves, arrives with a slight overshoot and settles (the kit's exploded view, any direction)
const settle = (u) => {
  const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  return e + Math.sin(Math.PI * u) * Math.sin(Math.PI * u) * 0.055 * (u > 0.5 ? 1 : 0.25);
};

/* ── the geometry of the mechanism (grip frame, cm) ── */
const R_CABLE = CABLE.r;
const PIVOT = [-18, 2]; //                 the lever's pivot (x, y), axis along z
const LEVER_Z = 10.75; //                  the lever's mid-plane (its plate z 9.5 → 12)
const ARM = [GRIP.roller.at[0] - PIVOT[0], GRIP.roller.at[1] - PIVOT[1]]; // pivot → roller: (−16, 10.5)
const PUSH = [17, -18]; //                 pivot → the short arm's tip, on the spring's cap
const HINGE = { y: -7, z: 6.5 }; //        the mobile jaw's hinge (a pin along x)
const JAW = { x0: -8, x1: 24 }; //         the jaws' length along the cable
const OPEN_ANGLE = 0.44; //                the mobile jaw open (≈ 25°)
const WEAK_ANGLE = 0.03; //                closed « badly »: a 2 mm day at the lip
const SPRING = { x0: GRIP.spring.at[0] - GRIP.spring.len / 2, x1: GRIP.spring.at[0] + GRIP.spring.len / 2, y: GRIP.spring.at[1], z: GRIP.spring.at[2], r: GRIP.spring.r - 0.8, wire: 0.85, turns: 7 };
const ROPE_LEN = 180;

// the lever's swing for the roller to go down exactly CAME.push
const ARM_R = Math.hypot(ARM[0], ARM[1]);
const ARM_A = Math.atan2(ARM[1], ARM[0]);
const THETA = Math.PI - Math.asin((ARM[1] - CAME.push) / ARM_R) - ARM_A;

/** The cable: dark steel, six strands laid in a helix (one ink line every CABLE.lay), the pattern sliding by `slip`.
 *  The strands melt into grey before they get finer than a few pixels (fwidth): never a flicker. */
function ropeMaterial(color = 0x3a3f45) {
  const mat = solid(color, { rough: 0.4, metal: 0.45 });
  mat.userData.finish = false;
  const uSlip = { value: 0 };
  mat.userData.uSlip = uSlip;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSlip = uSlip;
    shader.uniforms.uLay = { value: CABLE.lay };
    shader.uniforms.uInk = { value: new THREE.Color(BRAND.ink) };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vRope;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRope = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vRope; uniform float uSlip, uLay; uniform vec3 uInk;\nfloat ropeLine(float u, float w) { float fw = fwidth(u); float d = min(fract(u), 1.0 - fract(u)); return (1.0 - smoothstep(w, w + fw, d)) * (1.0 - smoothstep(0.12, 0.35, fw)); }")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float ropeA = atan(vRope.z, vRope.y) / 6.2831853;
        float ropeB = fract(ropeA + 0.5) - 0.5; // the same angle, its seam elsewhere: the narrower derivative wins
        float ropeX = (vRope.x - uSlip) / uLay;
        float uA = (ropeX + ropeA) * 6.0;
        float uB = (ropeX + ropeB) * 6.0;
        float sFw = min(fwidth(uA), fwidth(uB));
        float sF = fract(uA);
        float sFade = 1.0 - smoothstep(0.12, 0.4, sFw);
        float bulge = 0.78 + 0.34 * sin(3.14159265 * sF);
        float groove = 1.0 - smoothstep(0.05, 0.05 + sFw, min(sF, 1.0 - sF));
        diffuseColor.rgb *= mix(1.0, bulge * (1.0 - 0.55 * groove), sFade);
        float lA = ropeX + ropeA; float lB = ropeX + ropeB;
        float lFw = min(fwidth(lA), fwidth(lB));
        float lD = min(fract(lA), 1.0 - fract(lA));
        float ropeInk = (1.0 - smoothstep(0.03, 0.03 + lFw, lD)) * (1.0 - smoothstep(0.1, 0.3, lFw));`,
      )
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uInk * 0.35 * ropeInk;");
  };
  mat.customProgramCacheKey = () => "sd052-rope";
  return mat;
}

/** A coil spring along x, from x −len to 0 (its seat at 0): `turns` turns of a wire of radius `wire` on radius `r`. */
class Helix extends THREE.Curve {
  constructor(len, r, turns) {
    super();
    this.len = len;
    this.r = r;
    this.turns = turns;
  }
  getPoint(t, out = new THREE.Vector3()) {
    // closed ends: the first and last half turn lie flat (a real spring sits on them)
    const n = this.turns + 1;
    const a = t * n * TAU;
    const flat = 0.5 / n;
    const k = t < flat ? 0 : t > 1 - flat ? 1 : (t - flat) / (1 - 2 * flat);
    return out.set(-this.len + this.len * k, this.r * Math.cos(a), this.r * Math.sin(a));
  }
}

export function buildGrip() {
  const root = new THREE.Group();
  root.name = "grip";
  // three greys: the dark casting, the machined parts, the spring (the hero, much lighter)
  const cast = () => solid(0x3b4249, { rough: 0.6, metal: 0.3 });
  const machined = (c) => solid(c, { rough: 0.42, metal: 0.42 });

  /* ── the body ── */
  const body = makePart("body");
  const bodyMat = cast();
  const side = [[-28, -10], [-26, -8], [26, -8], [28, -10], [28, -23], [21, -30], [-21, -30], [-28, -23]];
  addMesh(body, slab(side, 16, { bevel: 0.6 }).translate(0, 0, -9), bodyMat, { edgeOpacity: 0.7 });
  addMesh(body, box(22, 10, 12, 0.8), bodyMat, { pos: [0, -34.5, -1], edgeOpacity: 0.6 }); // the neck down to the plate
  // the ear that carries the lever's pivot
  const ear = [[-23, -8], [-13, -8], [-14.5, 2.5], [-18, 5.8], [-21.5, 2.5]];
  addMesh(body, slab(ear, 3.5, { bevel: 0.4 }).translate(0, 0, 6), bodyMat, { edgeOpacity: 0.7 });
  // the lug at the front end: the spring's fixed seat
  addMesh(body, box(4, 13, 11, 0.5), bodyMat, { pos: [SPRING.x1 + 2, SPRING.y, SPRING.z - 0.5], edgeOpacity: 0.7 });
  addMesh(body, box(4, 8, 6, 0.4), bodyMat, { pos: [SPRING.x1 + 1, SPRING.y - 2, 5.5], edges: false });
  // the hinge: two bosses and the pin of the mobile jaw
  const pinMat = machined(0x8a9198);
  for (const x of [JAW.x0 - 2, JAW.x1 + 2]) addMesh(body, cyl(2.4, 3.6, 0.3, 24), bodyMat, { pos: [x, HINGE.y, HINGE.z], rot: [0, 0, Math.PI / 2], edgeOpacity: 0.6 });
  addMesh(body, cyl(1.2, JAW.x1 - JAW.x0 + 8, 0.2, 20), pinMat, { pos: [(JAW.x0 + JAW.x1) / 2, HINGE.y, HINGE.z], rot: [0, 0, Math.PI / 2], edges: false });
  // the lever's pivot pin
  addMesh(body, cyl(1.3, 7, 0.25, 20), pinMat, { pos: [PIVOT[0], PIVOT[1], 9.5], rot: [Math.PI / 2, 0, 0], edges: false });
  // bolt heads on the outer face: what a casting has
  const boltGeo = mergeGeometries([[-20, -14], [-20, -24], [20, -14], [20, -24], [6, -26], [-6, -26]].map(([x, y]) => placed(cyl(1.3, 1.2, 0.25, 6), { pos: [x, y, 7.4], rotX: Math.PI / 2 })));
  addMesh(body, boltGeo, pinMat, { edgeOpacity: 0.5 });

  /* ── the jaws (a cross-section in the y–z plane, along the cable from JAW.x0 to JAW.x1) ── */
  const arc = (r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
    const a = (a0 + ((a1 - a0) * i) / n) * (Math.PI / 180);
    return [r * Math.cos(a), r * Math.sin(a)];
  });
  const rc = R_CABLE + 0.2;
  const alongCable = (outline) => slab(outline, JAW.x1 - JAW.x0, { bevel: 0.35 }).rotateY(-Math.PI / 2).translate(JAW.x1, 0, 0);
  // the fixed jaw: from the cable's top on the inner side, round it, under it
  const fixedJaw = makePart("fixedJaw");
  const fixedMat = machined(0x80888f);
  const fixedOutline = [[-9, -8], [-9, 3], [-6, 4.4], [-1.6, 3.7], ...arc(rc, 110, 280, 14), [1.6, -4.2], [1.6, -8]];
  addMesh(fixedJaw, alongCable(fixedOutline), fixedMat);
  // the mobile jaw: a hook over the cable from the outer side, on its hinge
  const mobileJaw = makePart("mobileJaw");
  const mobileMat = machined(0x9ba3aa);
  const hinge = new THREE.Group();
  hinge.position.set(0, HINGE.y, HINGE.z);
  mobileJaw.add(hinge);
  const mobileOutline = [[3.4, -6.2], [6.4, -9.2], [8.6, -7.4], [7.6, 3.0], [4.6, 5.6], [0.4, 5.4], [-0.7, 4.3], ...arc(rc, 95, -55, 12)];
  const mj = addMesh(mobileJaw, alongCable(mobileOutline).translate(0, -HINGE.y, -HINGE.z), mobileMat);
  hinge.add(mj);

  /* ── the lever: a bell crank on PIVOT ── */
  const lever = makePart("lever");
  const leverMat = machined(0x646c74);
  const crank = new THREE.Group();
  crank.position.set(PIVOT[0], PIVOT[1], LEVER_Z);
  lever.add(crank);
  const bar = (to, w) => {
    const len = Math.hypot(to[0], to[1]);
    const m = addMesh(lever, box(len, w, 2.5, 0.5), leverMat, { pos: [to[0] / 2, to[1] / 2, 0], rot: [0, 0, Math.atan2(to[1], to[0])] });
    crank.add(m);
  };
  bar(ARM, 4.4);
  bar(PUSH, 4);
  crank.add(addMesh(lever, cyl(3.6, 3.2, 0.3, 28), leverMat, { rot: [Math.PI / 2, 0, 0] })); // the hub
  crank.add(addMesh(lever, cyl(2.8, 3, 0.3, 24), leverMat, { pos: [ARM[0], ARM[1], 0], rot: [Math.PI / 2, 0, 0] })); // the roller's boss
  crank.add(addMesh(lever, box(2.6, 5.2, 3.4, 0.6), leverMat, { pos: [PUSH[0] - 0.6, PUSH[1], 0.6] })); // the pad on the cap

  /* ── the roller, at the lever's end (placed every frame) ── */
  const roller = makePart("roller");
  const rollerMat = machined(0xa1a8ae);
  addMesh(roller, cyl(GRIP.roller.r, 4, 0.5, 40), rollerMat, { rot: [Math.PI / 2, 0, 0] });
  addMesh(roller, cyl(2.2, 4.6, 0.3, 24), machined(0x5c636a), { rot: [Math.PI / 2, 0, 0], edges: false });
  addMesh(roller, cyl(0.9, 7, 0.15, 16), pinMat.clone(), { pos: [0, 0, -2.2], rot: [Math.PI / 2, 0, 0], edges: false });

  /* ── the spring: the heart ── */
  const spring = makePart("spring");
  const coilMat = solid(0xd2d5d7, { rough: 0.36, metal: 0.38 });
  const coilLen = SPRING.x1 - SPRING.x0;
  const helix = new Helix(coilLen, SPRING.r, SPRING.turns);
  const coilGeo = new THREE.TubeGeometry(helix, SPRING.turns * 40, SPRING.wire, 12, false);
  const coil = new THREE.Group(); // scaled along x from its seat (x1): the turns close up
  coil.position.set(SPRING.x1, SPRING.y, SPRING.z);
  spring.add(coil);
  coil.add(addMesh(spring, coilGeo, coilMat, { edges: false }));
  // its rim: a hull a little fatter, back faces only — a line round every turn (veille: the heart; signal: weak)
  const rim = glow(BRAND.veille, 0, { additive: true });
  rim.side = THREE.BackSide;
  const rimMesh = addMesh(spring, new THREE.TubeGeometry(helix, SPRING.turns * 40, SPRING.wire + 0.32, 10, false), rim, { edges: false });
  coil.add(rimMesh);
  // the shell of light round the spring when the voice names it
  const shellMat = glass(BRAND.veille, { base: 0.0, rim: 0.16, power: 2.8, edge: 0.08 });
  shellMat.side = THREE.FrontSide;
  const shell = addMesh(spring, cyl(SPRING.r + 2.2, coilLen + 3, 0, 40), shellMat, { pos: [(SPRING.x0 + SPRING.x1) / 2, SPRING.y, SPRING.z], rot: [0, 0, Math.PI / 2], edges: false });
  shell.renderOrder = 6;
  // the guide rod, the moving cap (driven by the lever's pad), the seat on the lug
  const springSteel = machined(0x7f878e);
  addMesh(spring, cyl(1.1, coilLen + 5, 0.2, 18), springSteel, { pos: [(SPRING.x0 + SPRING.x1) / 2 + 0.5, SPRING.y, SPRING.z], rot: [0, 0, Math.PI / 2], edges: false });
  const cap = addMesh(spring, cyl(SPRING.r + 0.6, 1.8, 0.3, 32), springSteel, { rot: [0, 0, Math.PI / 2] });
  addMesh(spring, cyl(SPRING.r + 0.6, 1.4, 0.3, 32), springSteel, { pos: [SPRING.x1 - 0.2, SPRING.y, SPRING.z], rot: [0, 0, Math.PI / 2] });

  /* ── the friction plate the tyres drive ── */
  const plate = makePart("plate");
  const plateMat = solid(0x4a5158, { rough: 0.5, metal: 0.35 });
  addMesh(plate, box(GRIP.plate.len, 2, GRIP.plate.w, 0.3), plateMat, { pos: [0, GRIP.plate.y, 0] });
  addMesh(plate, box(GRIP.plate.len - 14, 1.2, GRIP.plate.w - 5, 0.3), plateMat, { pos: [0, GRIP.plate.y + 1.5, 0], edges: false });

  /* ── on the bench: a length of the came, a length of cable ── */
  const came = makePart("came");
  const cameMat = solid(0x7a8187, { rough: 0.72, metal: 0.2 });
  // side profile (x, y above its underside): flat over the roller, the ramp at its −x end (the grip comes from there)
  const cx0 = -96;
  const cx1 = 18;
  const cameSide = [[cx0, CAME.push + 2.5], [cx0 + CAME.ramp * 0.35, 0], [cx1, 0], [cx1, CAME.h], [cx0, CAME.h + 1]];
  const cameBeam = new THREE.Group();
  came.add(cameBeam);
  cameBeam.add(addMesh(came, slab(cameSide, CAME.w, { bevel: 0.4 }).translate(0, 0, CAME.z - CAME.w / 2), cameMat));
  for (const x of [cx0 + 44, cx1 - 10]) cameBeam.add(addMesh(came, box(4, 12, 3, 0.4), cameMat, { pos: [x, CAME.h + 6, CAME.z], edgeOpacity: 0.5 })); // its brackets, cut off
  const rope = makePart("rope");
  const ropeMat = ropeMaterial(0x6a7279); // on the bench, lit: lighter than the station's, the same strands
  addMesh(rope, cyl(R_CABLE, ROPE_LEN, 0.15, 48).rotateZ(-Math.PI / 2), ropeMat, { edgeOpacity: 0.35 });
  // the cut ends: six strands round a core
  const strandEnd = (x) => mergeGeometries(
    [[0, 0], ...Array.from({ length: 6 }, (_, i) => [1.75 * Math.cos((i * TAU) / 6), 1.75 * Math.sin((i * TAU) / 6)])].map(([y, z]) => placed(cyl(0.82, 0.8, 0.12, 14), { pos: [x, y, z], rotZ: Math.PI / 2 })),
  );
  addMesh(rope, mergeGeometries([strandEnd(-ROPE_LEN / 2 - 0.3), strandEnd(ROPE_LEN / 2 + 0.3)]), solid(0x9aa1a7, { rough: 0.4, metal: 0.4 }), { edges: false });

  root.add(body, fixedJaw, mobileJaw, lever, roller, spring, plate, came, rope);
  const parts = { body, fixedJaw, mobileJaw, lever, roller, spring, plate, came, rope };

  // the exploded view: each part leaves the way it works (cm, grip frame) — no thin column
  const OUT = [
    [came, [0, 30, 4], 0.0],
    [roller, [-26, 34, 20], 0.06],
    [lever, [-12, 20, 12], 0.1],
    [mobileJaw, [2, 10, 24], 0.16],
    [fixedJaw, [0, 17, -6], 0.22],
    [spring, [12, -16, 16], 0.28],
    [plate, [0, -24, 0], 0.34],
  ];

  const A = {
    jaws: anchor(root, 8, 0, 0),
    lever: anchor(lever, PIVOT[0] + ARM[0] * 0.45, PIVOT[1] + ARM[1] * 0.45, LEVER_Z + 1.5),
    roller: anchor(roller, 0, 0, 2),
    spring: anchor(spring, (SPRING.x0 + SPRING.x1) / 2, SPRING.y, SPRING.z),
    came: anchor(came, GRIP.roller.at[0], CAME.y + CAME.h + 2, CAME.z),
    plate: anchor(plate, 0, GRIP.plate.y, 0),
    hanger: anchor(root, ...GRIP.hanger),
  };

  const VEILLE = new THREE.Color(BRAND.veille);
  const SIGNAL = new THREE.Color(BRAND.signal);
  const tint = (mat, k) => mat.emissive.copy(VEILLE).multiplyScalar(k);

  return {
    root, parts, A,
    update(P) {
      const onBench = P.bench > 0.5;
      const o = clamp01(P.open);
      const weak = clamp01(P.weak);
      const k = onBench ? clamp01(P.explode) : 0;
      came.visible = onBench;
      if (!onBench) rope.visible = false;
      // the exploded view
      for (let i = 0; i < OUT.length; i++) {
        const [part, d, delay] = OUT[i];
        const e = settle(clamp01((k - delay) / 0.56));
        part.userData.explode = e;
        part.position.set(d[0] * e, d[1] * e, d[2] * e);
      }
      if (onBench) {
        setPartOpacity(rope, 1 - smooth(clamp01(k / 0.3)));
        rope.visible = rope.userData.part.opacity > 0.004;
        ropeMat.userData.uSlip.value = P.slip || 0;
      }
      // the lever turns, the roller goes down CAME.push, the cap goes forward, the spring closes up
      const th = THETA * o;
      crank.rotation.z = th;
      const c = Math.cos(th);
      const s = Math.sin(th);
      roller.position.x += PIVOT[0] + ARM[0] * c - ARM[1] * s;
      roller.position.y += PIVOT[1] + ARM[0] * s + ARM[1] * c;
      roller.position.z += GRIP.roller.at[2];
      roller.rotation.z = -th * 2.2; // it rolls a little on the came
      const capX = SPRING.x0 + (PUSH[0] * c - PUSH[1] * s - PUSH[0]);
      cap.position.set(capX - 0.9, SPRING.y, SPRING.z);
      coil.scale.x = (SPRING.x1 - capX) / coilLen;
      // on the bench the came comes down onto the roller (its underside on the roller's top)
      cameBeam.position.y = CAME.y + CAME.push * (1 - o);
      // the mobile jaw: open, or closed — badly, a day left at the lip
      hinge.rotation.x = OPEN_ANGLE * smooth(o) + WEAK_ANGLE * weak * (1 - o);
      // what the voice names
      tint(cameMat, 0.07 * clamp01(P.litCame));
      tint(leverMat, 0.08 * clamp01(P.litLever));
      tint(rollerMat, 0.07 * clamp01(P.litRoller));
      tint(fixedMat, 0.07 * clamp01(P.litJaws));
      tint(mobileMat, 0.07 * clamp01(P.litJaws));
      const heart = clamp01(P.litSpring);
      coilMat.emissive.copy(VEILLE).multiplyScalar(0.16 * heart);
      if (weak > 0.001) {
        coilMat.emissive.copy(SIGNAL).multiplyScalar(0.14 * weak);
        setGlow(rim, 2.0 * weak, SIGNAL);
      } else setGlow(rim, 1.5 * heart, VEILLE);
      shellMat.uniforms.uAmount.value = 0.7 * heart * (1 - weak);
    },
  };
}
