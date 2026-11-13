// DOSSIER 048 — Tunnelier : the system, SOLID — the front of an earth-pressure-balance tunnel boring machine (EPB) of
// the Grand Paris Express, true scale (Ø 9.83 m, shield 11.1 m: EAE line 16, lot 1), in plan.js coordinates (the
// cutterhead's face on x = 0, the axis on y = TBM.axisY, the machine toward +x).
//
//   buildSystem() → { root, parts, A, update(p, time, px) }
//   root    what world.js mounts (the scene's origin, or the bench's mount at −BENCH_FROM): ONE object, re-parented
//   parts   head · chamber · bulkhead · screw · shield · rams · erector · ring — each fades with its own materials
//   A       anchors (Object3D): face · head · cote · chamber · bulkhead · gauge · screwIn · screwOut · rams · ring · ringKey
//   update  p = { bench, explode, wheel, screw, earth, press, rams, ring, cutaway, arrows, hold, solo, cote,
//                 litHead, litChamber, litBulk, litScrew, litRams }
//     bench     1 on the bench (no soil around: the chamber's earth stays, the arrows hide), 0 in the ground
//     explode   0 assembled → 1 the parts apart along EXPLODE (a diagonal row along +x, the screw lifted out); the shield goes
//     wheel     the cutterhead's turns (cumulative: the acts tween it with ease "none")
//     screw     the screw's turns (cumulative, same): its flight turns and the earth between the flights climbs one pitch a turn
//     earth     the chamber's earth: 1 full and pressed → 0.6 domes of void open under the crown → 0.2 nearly empty
//     press     the chamber's pressure against the soil's: 1 balance · < 1 it drops · > 1 too strong. The manometer's
//               needle reads it: straight up at 1 (inside the green band), to the left as it drops, to the right too
//               strong; the dial's ring is veille inside the band, signal outside. NO figure on the dial, anywhere
//     rams      the thrust rams' stroke 0 → 1 (180 cm): their shoes stay on the last ring, everything ahead moves −x
//     ring      the last ring's seven segments lit veille one by one (invert first, the two top ones last): 0 → 7
//     cutaway   0 the shield whole → 1 its near half (+z) gone, a light rim on the cut: the chamber and its earth (cut
//               too), the bulkhead, the screw, the rams inside. The cutterhead stays whole
//     arrows    the soil's push on the face: five signal arrows from −x, 240 cm, tips on the face (0 hidden → 1 shown)
//     hold      the chamber's push: five veille arrows from the chamber, 240 cm × hold — 1 their tips meet the red ones
//               ON the face, 1.4 they pass it and push the red ones back. Independent of press. Hidden on the bench
//     solo      the heart alone: every part but the chamber, the bulkhead and its manometer fades to a ghost (0–1)
//     cote      the dimension line beside the cutterhead (z +600, the camera's side), 0 → 1 it draws itself
//     lit*      the part the voice names glows faintly veille (0–1)
//   px      the stage's pixel scale (unused: every line here is a solid, none thinner than 4 cm)
//
// THE MANOMETER (moved from the stub, see docs/journal/048-model.md « À changer ailleurs »): on a dark console behind
// the bulkhead, on the near side, facing +z — its dial at GAUGE below. The console hides what stands behind it.
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, setGlow, cyl, box, plate, placed, mergeGeometries, anchor, setPartOpacity } from "@kit/build3d.js";
import { TBM, EXPLODE, DEG } from "./plan.js";

const AY = TBM.axisY;
const TAU = Math.PI * 2;
/** The manometer's dial centre (its face looks +z). plan.js's TBM.bulkhead.gauge should read the same. */
export const GAUGE = [372, AY + 230, 344];
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const alongX = (g) => g.rotateZ(-Math.PI / 2); // a geometry standing along y, laid along +x

/** A profile ([r, x] points, counter-clockwise) turned about the machine's axis over [phi0, phi0 + span]. */
function turned(profile, phi0 = 0, span = TAU, segments = 96, crease = 35) {
  const g = new THREE.LatheGeometry(profile.map(([r, x]) => new THREE.Vector2(r, x)), segments, phi0, span);
  const c = toCreasedNormals(g, crease * DEG);
  return alongX(c).translate(0, AY, 0);
}
/** A mesh in a part's set of materials, hung on another parent (a spinning group, a moving one). */
function hang(part, parent, geo, mat, o = {}) {
  const m = addMesh(part, geo, mat, o);
  parent.add(m);
  return m;
}
/** An annular sector (angles in radians), with optional holes. */
function sector(r0, r1, a0, a1, holes = []) {
  const s = new THREE.Shape();
  s.absarc(0, 0, r1, a0, a1, false);
  s.absarc(0, 0, r0, a1, a0, true);
  s.closePath();
  for (const h of holes) s.holes.push(h);
  return s;
}
function slot(r0, r1, a0, a1) {
  const h = new THREE.Path();
  h.absarc(0, 0, r1, a0, a1, false);
  h.absarc(0, 0, r0, a1, a0, true);
  h.closePath();
  return h;
}

/* ───────────────────────── the chamber's earth: a paste with a level, domes of void under the crown ───────────────────────── */
const SURF = /* glsl */ `
uniform float uLevel, uAmp, uAY, uR2;
varying vec3 vEP;
float earthSurf(vec2 q) {
  return uLevel + uAmp * (0.55 * sin(q.x * 0.043 + 1.1) * cos(q.y * 0.0105 + 0.4) + 0.45 * sin(q.y * 0.027 + q.x * 0.018 + 2.0));
}
`;
const GRAIN = /* glsl */ `
float eHash(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float eNoise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(eHash(i), eHash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(eHash(i + vec3(0.0, 1.0, 0.0)), eHash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(eHash(i + vec3(0.0, 0.0, 1.0)), eHash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(eHash(i + vec3(0.0, 1.0, 1.0)), eHash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
`;
function earthMat(U, top) {
  const m = solid(0x7d5a3e, { rough: 0.96, metal: 0 });
  m.userData.finish = false;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", `#include <common>\n${SURF}`);
    if (top) {
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <beginnormal_vertex>",
          `#include <beginnormal_vertex>
          { float h0 = earthSurf(position.xz); float hx = earthSurf(position.xz + vec2(4.0, 0.0)); float hz = earthSurf(position.xz + vec2(0.0, 4.0));
            objectNormal = normalize(vec3(h0 - hx, 4.0, h0 - hz)); }`,
        )
        .replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed.y = earthSurf(position.xz);\nvEP = transformed;");
    } else {
      sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvEP = transformed;");
    }
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\n${SURF}${GRAIN}`)
      .replace(
        "#include <clipping_planes_fragment>",
        top
          ? "#include <clipping_planes_fragment>\n{ float dy = vEP.y - uAY; if (dy * dy + vEP.z * vEP.z > uR2) discard; }"
          : "#include <clipping_planes_fragment>\nif (vEP.y > earthSurf(vEP.xz) + 0.5) discard;",
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        { float g1 = eNoise(vEP * 0.034); float g2 = eNoise(vEP * 0.12 + 3.1);
          float fine = 1.0 - smoothstep(0.25, 0.7, length(fwidth(vEP * 0.12)));
          diffuseColor.rgb *= clamp(0.74 + 0.4 * g1 + 0.3 * (g2 - 0.5) * fine, 0.4, 1.3); }`,
      );
  };
  m.customProgramCacheKey = () => (top ? "sd048-earth-top" : "sd048-earth");
  return m;
}

export function buildSystem() {
  const root = new THREE.Group();
  const litMats = { head: [], chamber: [], bulk: [], screw: [], rams: [] };
  const mk = (color, o, lit) => {
    const m = solid(color, o);
    if (lit) litMats[lit].push(m);
    return m;
  };

  /* ═══════════════════════ the cutterhead: rim, six spokes, six face plates with their slots, 111 discs, 26 scrapers ═══════════════════════ */
  const head = makePart("head");
  const H = TBM.head;
  const headSpin = new THREE.Group(); // turns about x (wheel)
  headSpin.position.set(0, AY, 0);
  const face = new THREE.Group(); // the face's own frame: the face in its XY plane, depth along +z (= world +x)
  face.rotation.y = Math.PI / 2;
  headSpin.add(face);
  head.add(headSpin);
  const rimMat = mk(0xbfc3c6, { rough: 0.42, metal: 0.32 }, "head");
  const plateMat = mk(0xc9ccce, { rough: 0.46, metal: 0.28 }, "head");
  const spokeMat = mk(0xadb2b6, { rough: 0.44, metal: 0.32 }, "head");
  const hubMat = mk(0xcfd2d4, { rough: 0.5, metal: 0.25 }, "head");
  const housingMat = mk(0x5a6168, { rough: 0.55, metal: 0.3 });
  const discMat = mk(0xc9cccf, { rough: 0.5, metal: 0.3 }, "head");
  const scraperMat = mk(0x474e55, { rough: 0.5, metal: 0.3 });
  const RIM_IN = 432;
  {
    const s = new THREE.Shape();
    s.absarc(0, 0, H.r, 0, TAU, false);
    const h = new THREE.Path();
    h.absarc(0, 0, RIM_IN, 0, TAU, true);
    s.holes.push(h);
    hang(head, face, plate(s, 85, { bevel: 5, curveSegments: 96 }).translate(0, 0, -6), rimMat, { edgeOpacity: 0.7 });
  }
  const SLOT_H = 8.5 * DEG;
  for (let k = 0; k < H.spokes; k++) {
    const a = k * 60 * DEG;
    // the spoke: proud of the plates, from the hub to the rim
    hang(head, face, placed(box(72, 352, 86, 5), { pos: [-262 * Math.sin(a), 262 * Math.cos(a), 37], rotZ: a }), spokeMat, { edgeOpacity: 0.7 });
    // the face plate between this spoke and the next, its radial slot (where the earth goes in)
    const b = a + Math.PI / 2; // the spoke's direction, from +x
    const m = b + 30 * DEG;
    const pl = sector(92, 436, b + 4 * DEG, b + 56 * DEG, [slot(150, 404, m - SLOT_H, m + SLOT_H)]);
    hang(head, face, plate(pl, 30, { bevel: 3, curveSegments: 18 }).translate(0, 0, 12), plateMat, { edgeOpacity: 0.65 });
  }
  // the hub and its nose; the centre shaft and two mixing arms reach back into the chamber
  hang(head, face, (() => {
    const g = new THREE.LatheGeometry([[0, -64], [34, -62], [78, -30], [104, -8], [104, 84], [0, 84]].map(([r, y]) => new THREE.Vector2(r, y)), 64);
    return toCreasedNormals(g, 35 * DEG).rotateX(Math.PI / 2);
  })(), hubMat, { edgeOpacity: 0.6 });
  hang(head, face, cyl(66, 150, 4, 48).rotateX(Math.PI / 2).translate(0, 0, 160), spokeMat);
  for (const a of [20 * DEG, 200 * DEG]) {
    hang(head, face, placed(box(34, 230, 34, 4), { pos: [-205 * Math.sin(a), 205 * Math.cos(a), 150], rotZ: a }), spokeMat);
  }
  // the disc cutters: 111 on their own tracks (a spiral over 18 lines: the spokes and both flanks of each slot)
  {
    const lines = [];
    for (let k = 0; k < 6; k++) lines.push(k * 60, k * 60 + 14, k * 60 + 46);
    const at = [];
    for (let i = 0; i < H.cutters; i++) {
      const r = 118 + (i * (470 - 118)) / (H.cutters - 1);
      let placedOk = null;
      for (let t = 0; t < lines.length && !placedOk; t++) {
        const phi = lines[((i * 7) + t) % lines.length] * DEG + Math.PI / 2;
        const x = r * Math.cos(phi);
        const y = r * Math.sin(phi);
        if (at.every((q) => Math.hypot(q[0] - x, q[1] - y) > 48)) placedOk = [x, y, phi];
      }
      if (placedOk) at.push(placedOk);
    }
    const houses = [];
    const discs = [];
    const disc = cyl(21, 7, 0, 18);
    for (const [x, y, phi] of at) {
      houses.push(new THREE.BoxGeometry(46, 34, 22).applyMatrix4(new THREE.Matrix4().makeRotationZ(phi).setPosition(x, y, 1)));
      discs.push(placed(disc, { pos: [x, y, -6], rotZ: phi - Math.PI / 2 }));
    }
    hang(head, face, mergeGeometries(houses), housingMat, { edges: false });
    hang(head, face, mergeGeometries(discs), discMat, { edges: false });
    head.userData.cutters = at.length;
  }
  // the scrapers: four along each slot's flanks, two at the hub
  {
    const sc = [];
    for (let k = 0; k < 6; k++) {
      const m = k * 60 * DEG + 30 * DEG + Math.PI / 2;
      for (const side of [-1, 1]) {
        for (const r of [215, 335]) {
          const phi = m + side * (SLOT_H + 3.2 * DEG);
          sc.push(new THREE.BoxGeometry(52, 16, 26).applyMatrix4(new THREE.Matrix4().makeRotationZ(phi).setPosition(r * Math.cos(phi), r * Math.sin(phi), 2)));
        }
      }
    }
    for (const phi of [0, Math.PI]) sc.push(new THREE.BoxGeometry(60, 18, 26).applyMatrix4(new THREE.Matrix4().makeRotationZ(phi).setPosition(0, 0, -60).multiply(new THREE.Matrix4().makeTranslation(40, 0, 0))));
    hang(head, face, mergeGeometries(sc), scraperMat, { edges: false });
  }

  /* the arrows at the face and the dimension line: on the head (they move with it), never spinning, own materials */
  const front = new THREE.Group();
  head.add(front);
  const redMat = glow(BRAND.signal, 1.25, { opacity: 1 });
  redMat.transparent = true;
  const greenMat = glow(BRAND.veille, 1.05, { opacity: 1 });
  greenMat.transparent = true;
  const ARROW = { len: 240, headLen: 56, z: 500, dys: [-360, -180, 0, 180, 360] };
  const redGeo = mergeGeometries([
    new THREE.BoxGeometry(ARROW.len - ARROW.headLen, 34, 34).translate(-(ARROW.len + ARROW.headLen) / 2, 0, 0),
    new THREE.ConeGeometry(62, ARROW.headLen, 24).rotateZ(-Math.PI / 2).translate(-ARROW.headLen / 2, 0, 0),
  ]);
  const shaftGeo = new THREE.BoxGeometry(1, 34, 34).translate(0.5, 0, 0); // from x 0 to 1: scaled to its length
  const coneGeo = new THREE.ConeGeometry(62, ARROW.headLen, 24).rotateZ(Math.PI / 2).translate(ARROW.headLen / 2, 0, 0); // tip at x 0, pointing −x
  const reds = [];
  const gShafts = [];
  const gHeads = [];
  for (const dy of ARROW.dys) {
    const r = new THREE.Mesh(redGeo, redMat);
    r.position.set(0, AY + dy, ARROW.z);
    reds.push(r);
    const s = new THREE.Mesh(shaftGeo, greenMat);
    s.position.set(0, AY + dy, ARROW.z);
    gShafts.push(s);
    const c = new THREE.Mesh(coneGeo, greenMat);
    c.position.set(0, AY + dy, ARROW.z);
    gHeads.push(c);
    front.add(r, s, c);
  }
  const arrowsAll = [...reds, ...gShafts, ...gHeads];
  // the dimension line: two extension lines from the rim, the line between them, its two arrowheads
  const coteMat = glow(BRAND.ink, 1.0, { opacity: 1 });
  coteMat.transparent = true;
  const COTE = { x: -24, z: 600 };
  const cote = new THREE.Group();
  front.add(cote);
  const coteLine = new THREE.Mesh(new THREE.BoxGeometry(8, 2 * H.r - 80, 8), coteMat);
  coteLine.position.set(COTE.x, AY, COTE.z);
  const coteExt = [];
  const coteTip = [];
  for (const s of [1, -1]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(7, 7, 180).translate(0, 0, -90 + 40), coteMat); // from z 470 to 650
    e.position.set(COTE.x, AY + s * H.r, COTE.z);
    coteExt.push(e);
    const t = new THREE.Mesh(new THREE.ConeGeometry(20, 44, 12).translate(0, -22, 0).rotateZ(s > 0 ? 0 : Math.PI), coteMat);
    t.position.set(COTE.x, AY + s * H.r, COTE.z);
    coteTip.push(t);
    cote.add(e, t);
  }
  cote.add(coteLine);

  /* ═══════════════════════ the chamber's earth (a puck between the head and the bulkhead), its near half apart ═══════════════════════ */
  const chamber = makePart("chamber");
  const earthNear = makePart("earthNear");
  chamber.add(earthNear);
  const C = TBM.chamber;
  const ER = TBM.r - 16; // 475: inside the skin
  const U = { uLevel: { value: AY + 2 * ER }, uAmp: { value: 20 }, uAY: { value: AY }, uR2: { value: (ER - 2) * (ER - 2) } };
  const earthFar = earthMat(U, false);
  const earthFarTop = earthMat(U, true);
  const earthNearM = earthMat(U, false);
  const earthNearTop = earthMat(U, true);
  litMats.chamber.push(earthFar, earthFarTop, earthNearM, earthNearTop);
  const prof = [[0, C.x0 + 1], [ER, C.x0 + 1], [ER, C.x1 - 1], [0, C.x1 - 1]];
  const capW = C.x1 - C.x0 - 2;
  const earthMeshes = [
    addMesh(chamber, turned(prof, Math.PI / 2, Math.PI, 48), earthFar, { edges: false }),
    addMesh(chamber, new THREE.PlaneGeometry(capW, 2 * ER).translate((C.x0 + C.x1) / 2, AY, 0), earthFar, { edges: false }),
    addMesh(earthNear, turned(prof, -Math.PI / 2, Math.PI, 48), earthNearM, { edges: false }),
    addMesh(earthNear, new THREE.PlaneGeometry(capW, 2 * ER).rotateY(Math.PI).translate((C.x0 + C.x1) / 2, AY, 0), earthNearM, { edges: false }),
  ];
  const tops = [
    addMesh(chamber, new THREE.PlaneGeometry(capW, ER, 14, 44).rotateX(-Math.PI / 2).translate((C.x0 + C.x1) / 2, AY, -ER / 2), earthFarTop, { edges: false }),
    addMesh(earthNear, new THREE.PlaneGeometry(capW, ER, 14, 44).rotateX(-Math.PI / 2).translate((C.x0 + C.x1) / 2, AY, ER / 2), earthNearTop, { edges: false }),
  ];
  for (const m of [...earthMeshes, ...tops]) {
    m.castShadow = false;
    m.receiveShadow = false; // the head would shade the cut face: the paste must stay the warmest thing in the machine
    m.frustumCulled = false;
  }
  chamber.userData.part.meshes.length = 0;
  earthNear.userData.part.meshes.length = 0;
  earthFarTop.side = THREE.DoubleSide;
  earthNearTop.side = THREE.DoubleSide;

  /* ═══════════════════════ the bulkhead, the main drive behind it, the air lock, five pressure sensors, the manometer ═══════════════════════ */
  const bulkhead = makePart("bulkhead");
  const B = TBM.bulkhead;
  const bulkMat = mk(0x747b82, { rough: 0.5, metal: 0.32 }, "bulk");
  const driveMat = mk(0x5f666d, { rough: 0.5, metal: 0.35 }, "bulk");
  addMesh(bulkhead, turned([[0, B.x0], [480, B.x0], [484, B.x0 + 4], [484, B.x1 - 4], [480, B.x1], [0, B.x1]], 0, TAU, 96), bulkMat, { edgeOpacity: 0.6 });
  addMesh(bulkhead, turned([[438, B.x1 - 1], [474, B.x1 - 1], [474, B.x1 + 16], [438, B.x1 + 16]], 0, TAU, 96), bulkMat, { edgeOpacity: 0.5 });
  addMesh(bulkhead, turned([[0, B.x1], [168, B.x1], [168, B.x1 + 18], [150, B.x1 + 24], [150, 456], [140, 462], [0, 462]], 0, TAU, 64), driveMat, { edgeOpacity: 0.6 });
  for (const th of [-30, 10, 50, 90, 130, 170, 210]) {
    const a = th * DEG;
    addMesh(bulkhead, alongX(cyl(26, 130, 3, 24)), driveMat, { pos: [B.x1 + 70, AY + 215 * Math.sin(a), 215 * Math.cos(a)], edgeOpacity: 0.5 });
  }
  // the air lock (the way in for the people who change the tools), high on the far side
  addMesh(bulkhead, alongX(cyl(72, 240, 6, 40)), bulkMat, { pos: [B.x1 + 120, AY + 290, -230], edgeOpacity: 0.6 });
  // five pressure sensors through the bulkhead, their heads in the chamber (near side: they read in the cutaway)
  const sensorMat = mk(0x8c939a, { rough: 0.45, metal: 0.35 }, "bulk");
  const sensorGlow = glow(BRAND.veille, 0.8);
  bulkhead.userData.part.mats.add(sensorGlow);
  for (const [dy, z] of [[400, 150], [250, 210], [70, 240], [-140, 230], [-330, 170]]) {
    addMesh(bulkhead, alongX(cyl(13, 22, 2, 20)), sensorMat, { pos: [B.x0 - 10, AY + dy, z], edgeOpacity: 0.5 });
    addMesh(bulkhead, alongX(new THREE.CylinderGeometry(8, 8, 3, 20)), sensorGlow, { pos: [B.x0 - 22, AY + dy, z], edges: false });
  }
  // the manometer: a console on the bulkhead's back, its dial facing +z; no figure anywhere on it
  const [GX, GY, GZ] = GAUGE;
  const consoleMat = mk(0x2b3136, { rough: 0.62, metal: 0.25 });
  addMesh(bulkhead, box(64, 30, 26, 4), consoleMat, { pos: [B.x1 + 30, GY - 70, GZ - 16] });
  addMesh(bulkhead, box(156, 176, 12, 4), consoleMat, { pos: [GX, GY - 4, GZ - 13], edgeOpacity: 0.6 });
  const bezelMat = mk(0x8f969c, { rough: 0.4, metal: 0.4 });
  addMesh(bulkhead, cyl(B.gaugeR + 5, 9, 2, 64).rotateX(Math.PI / 2), bezelMat, { pos: [GX, GY, GZ - 4], edgeOpacity: 0.5 });
  const dialMat = solid(0xddd8cc, { rough: 0.6, metal: 0 });
  dialMat.userData.finish = false;
  addMesh(bulkhead, new THREE.CircleGeometry(B.gaugeR - 1, 64), dialMat, { pos: [GX, GY, GZ + 1], edges: false });
  const bandMat = glow(BRAND.veille, 1.05);
  addMesh(bulkhead, new THREE.RingGeometry(29, 38, 24, 1, (90 - 11) * DEG, 22 * DEG), bandMat, { pos: [GX, GY, GZ + 2], edges: false });
  const tickMat = solid(0x1d2226, { rough: 0.6 });
  tickMat.userData.finish = false;
  {
    const ticks = [];
    for (let i = -6; i <= 6; i++) {
      const a = Math.PI / 2 + i * 11 * DEG;
      const long = i % 3 === 0;
      ticks.push(new THREE.PlaneGeometry(2.6, long ? 9 : 5).translate(0, long ? 23.5 : 25.5, 0).rotateZ(a - Math.PI / 2));
    }
    addMesh(bulkhead, mergeGeometries(ticks), tickMat, { pos: [GX, GY, GZ + 2.5], edges: false });
  }
  const needleMat = solid(0x15191c, { rough: 0.5 });
  needleMat.userData.finish = false;
  const needle = new THREE.Group();
  needle.position.set(GX, GY, GZ + 4);
  bulkhead.add(needle);
  hang(bulkhead, needle, mergeGeometries([new THREE.BoxGeometry(4.2, 40, 1.4).translate(0, 13, 0), new THREE.ConeGeometry(2.1, 6, 8).translate(0, 36, 0)]), needleMat, { edges: false });
  hang(bulkhead, needle, cyl(5.5, 3, 0.6, 24).rotateX(Math.PI / 2), needleMat, { edges: false });
  const verdictMat = glow(BRAND.veille, 1.4);
  addMesh(bulkhead, new THREE.RingGeometry(B.gaugeR + 6, B.gaugeR + 12, 64), verdictMat, { pos: [GX, GY, GZ + 0.5], edges: false });

  /* ═══════════════════════ the screw conveyor: a casing with a window on its +z side, the flight, the earth climbing ═══════════════════════ */
  const screw = makePart("screw");
  const S0 = new THREE.Vector3(...TBM.screw.from);
  const S1 = new THREE.Vector3(...TBM.screw.to);
  const SR = TBM.screw.r;
  const len = S0.distanceTo(S1);
  const frame = new THREE.Group(); // local y along the screw (0 at the inlet), local +z as close to world +z as can be
  {
    const yA = S1.clone().sub(S0).normalize();
    const zA = new THREE.Vector3(0, 0, 1).addScaledVector(yA, -yA.z).normalize();
    const xA = new THREE.Vector3().crossVectors(yA, zA);
    frame.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yA, zA));
    frame.position.copy(S0);
  }
  screw.add(frame);
  const casingMat = mk(0x6d747b, { rough: 0.5, metal: 0.32, double: true }, "screw");
  const W0 = 0.16 * len;
  const W1 = 0.84 * len;
  const tube = (y0, y1, open) => {
    const g = open
      ? new THREE.CylinderGeometry(SR, SR, y1 - y0, 40, 1, true, 52 * DEG, 256 * DEG)
      : new THREE.CylinderGeometry(SR, SR, y1 - y0, 40, 1, true);
    return g.translate(0, (y0 + y1) / 2, 0);
  };
  hang(screw, frame, tube(0, W0, false), casingMat, { edgeOpacity: 0.6 });
  hang(screw, frame, tube(W0, W1, true), casingMat, { edgeOpacity: 0.7 });
  hang(screw, frame, tube(W1, len, false), casingMat, { edgeOpacity: 0.6 });
  for (const y of [W0, W1, len - 4, 0.5 * len]) hang(screw, frame, cyl(SR + 7, 12, 2, 40).translate(0, y, 0), casingMat, { edgeOpacity: 0.5 });
  // the window's lips, light: the opening reads
  const lipMat = mk(0xb6bbbf, { rough: 0.4, metal: 0.3 });
  for (const a of [52 * DEG, -52 * DEG]) hang(screw, frame, box(5, W1 - W0, 5, 1).translate(SR * Math.sin(a), (W0 + W1) / 2, SR * Math.cos(a)), lipMat, { edges: false });
  // the outlet: the discharge chute down, the drive behind
  hang(screw, frame, box(84, 70, 84, 5).translate(SR + 30, len - 40, 0), casingMat, { edgeOpacity: 0.6 });
  hang(screw, frame, cyl(60, 100, 5, 40).translate(0, len + 50, 0), mk(0x575e65, { rough: 0.5, metal: 0.35 }, "screw"), { edgeOpacity: 0.6 });
  // the flight and its shaft: they turn (screw)
  const spin = new THREE.Group();
  frame.add(spin);
  const flightMat = mk(0xbcc1c5, { rough: 0.42, metal: 0.35, double: true }, "screw");
  const P = 84; // the flight's pitch
  {
    const y0 = 6;
    const y1 = len - 10;
    const n = Math.ceil(((y1 - y0) / P) * 30);
    const pos = [];
    const idx = [];
    for (let i = 0; i <= n; i++) {
      const y = y0 + ((y1 - y0) * i) / n;
      const a = (TAU * (y - y0)) / P;
      for (const r of [14, SR - 5]) pos.push(r * Math.sin(a), y, r * Math.cos(a));
    }
    for (let i = 0; i < n; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    hang(screw, spin, g, flightMat, { edges: false });
    hang(screw, spin, cyl(14, len - 8, 1, 20).translate(0, len / 2, 0), flightMat, { edges: false });
  }
  // the earth between the flights, low in the casing (local +x is down): one lump per pitch, climbing with the flight
  const lumpMat = solid(0x7d5a3e, { rough: 0.95 });
  lumpMat.userData.finish = false;
  litMats.chamber.push(lumpMat);
  const lumps = [];
  const NL = Math.floor((len - 20) / P);
  {
    const g = new THREE.SphereGeometry(1, 14, 10);
    for (let k = 0; k < NL; k++) lumps.push(hang(screw, frame, g, lumpMat, { edges: false }));
  }

  /* ═══════════════════════ the shield: far half, near half (cutaway), the light rim on the cut ═══════════════════════ */
  const shield = makePart("shield");
  const shieldNear = makePart("shieldNear");
  const shieldCut = makePart("shieldCut");
  shield.add(shieldNear, shieldCut);
  const SKIN = [[476, 92], [485, 92], [491, 108], [491, 520], [486, 525], [486, 537], [489, 542], [489, 1102], [484, 1110], [476, 1110], [476, 92]];
  const FLANGE = [[430, 520], [476, 520], [476, 546], [430, 546], [430, 520]];
  const skinFar = mk(0x3a4147, { rough: 0.6, metal: 0.3 });
  const skinNear = mk(0x3a4147, { rough: 0.6, metal: 0.3 });
  addMesh(shield, turned(SKIN, Math.PI / 2, Math.PI, 56), skinFar, { edgeOpacity: 0.7 });
  addMesh(shield, turned(FLANGE, Math.PI / 2, Math.PI, 56), skinFar, { edgeOpacity: 0.5 });
  addMesh(shieldNear, turned(SKIN, -Math.PI / 2, Math.PI, 56), skinNear, { edgeOpacity: 0.7 });
  addMesh(shieldNear, turned(FLANGE, -Math.PI / 2, Math.PI, 56), skinNear, { edgeOpacity: 0.5 });
  const cutMat = glow(BRAND.ink, 0.62);
  for (const s of [1, -1]) {
    const sh = new THREE.Shape(SKIN.slice(0, -1).map(([r, x]) => new THREE.Vector2(x, s * r)));
    addMesh(shieldCut, new THREE.ShapeGeometry(sh).translate(0, AY, 0.6), cutMat, { edges: false });
    const fl = new THREE.Shape(FLANGE.slice(0, -1).map(([r, x]) => new THREE.Vector2(x, s * r)));
    addMesh(shieldCut, new THREE.ShapeGeometry(fl).translate(0, AY, 0.6), cutMat, { edges: false });
  }
  cutMat.side = THREE.DoubleSide;

  /* ═══════════════════════ the thrust rams: 14 pairs, cylinders on the shield, rods to their shoes on the last ring ═══════════════════════ */
  const rams = makePart("rams");
  const R = TBM.rams;
  const bodies = new THREE.Group();
  const rods = new THREE.Group();
  const SHOE = TBM.ring.x0 - 16; // the shoe's back face: the rods end there
  rods.position.x = SHOE;
  rams.add(bodies, rods);
  const ROD0 = SHOE - 792; // the rods' length at stroke 0 (they start inside the cylinders' ends at x 800)
  {
    const bGeo = [];
    const rGeo = [];
    const sGeo = [];
    const body = alongX(cyl(18, 240, 3, 24));
    const rod = alongX(cyl(10.5, ROD0, 1.5, 20));
    for (let k = 0; k < R.pairs; k++) {
      const a0 = ((k + 0.5) / R.pairs) * TAU;
      for (const s of [-1, 1]) {
        const a = a0 + s * 3.4 * DEG;
        const y = AY + R.r * Math.sin(a);
        const z = R.r * Math.cos(a);
        bGeo.push(placed(body, { pos: [(R.x0 + 800) / 2, y, z] }));
        rGeo.push(placed(rod, { pos: [-ROD0 / 2, y, z] }));
      }
      sGeo.push(placed(box(16, 96, 30, 3), { pos: [SHOE + 8, AY + R.r * Math.sin(a0), R.r * Math.cos(a0)], rotX: -a0 }));
    }
    hang(rams, bodies, mergeGeometries(bGeo), mk(0x6f767d, { rough: 0.5, metal: 0.35 }), { edgeOpacity: 0.55 });
    hang(rams, rods, mergeGeometries(rGeo), mk(0xc8ccd0, { rough: 0.3, metal: 0.5 }, "rams"), { edgeOpacity: 0.5 });
    addMesh(rams, mergeGeometries(sGeo), mk(0x5a6168, { rough: 0.55, metal: 0.3 }), { edgeOpacity: 0.55 });
  }

  /* ═══════════════════════ the erector: its slewing ring, the arm, the head that holds a segment (still) ═══════════════════════ */
  const erector = makePart("erector");
  const E = TBM.erector;
  const erMat = mk(0x60676e, { rough: 0.5, metal: 0.35 });
  addMesh(erector, new THREE.TorusGeometry(E.r, 15, 14, 96).rotateY(Math.PI / 2), erMat, { pos: [E.x, AY, 0], edges: false });
  addMesh(erector, box(46, 150, 56, 5), erMat, { pos: [E.x, AY - E.r + 70, 0], edgeOpacity: 0.55 });
  addMesh(erector, box(70, 18, 150, 4), mk(0x8a9197, { rough: 0.45, metal: 0.35 }), { pos: [E.x + 10, AY - E.r + 150, 0], edgeOpacity: 0.55 });
  addMesh(erector, box(60, 70, 90, 5), erMat, { pos: [E.x, AY + E.r - 10, 0], edgeOpacity: 0.55 });

  /* ═══════════════════════ the last ring: seven concrete segments, each its own light ═══════════════════════ */
  const ring = makePart("ring");
  const G = TBM.ring;
  const segMats = [];
  const segStep = TAU / G.segments;
  for (let j = 0; j < G.segments; j++) {
    const c = -Math.PI / 2 + j * segStep; // j = 0 the invert
    const sh = sector(G.rIn, G.rOut, c - segStep / 2 + 0.35 * DEG, c + segStep / 2 - 0.35 * DEG);
    const geo = plate(sh, G.x1 - G.x0 - 4, { bevel: 2.5, curveSegments: 20 }).rotateY(Math.PI / 2).translate(G.x0 + 2, AY, 0);
    const m = solid(0xaaa79f, { rough: 0.88, metal: 0 });
    m.emissive = new THREE.Color(0, 0, 0);
    addMesh(ring, geo, m, { edgeOpacity: 0.75 });
    segMats.push(m);
  }
  const SEG_ORDER = [0, 1, 6, 2, 5, 3, 4]; // the order they are laid: the invert, then both sides, the two top ones last

  root.add(head, chamber, bulkhead, screw, shield, rams, erector, ring);
  const parts = { head, chamber, bulkhead, screw, shield, rams, erector, ring };
  const MOVE = [
    [head, EXPLODE.head, true],
    [chamber, EXPLODE.chamber, true],
    [bulkhead, EXPLODE.bulkhead, true],
    [screw, EXPLODE.screw, true],
    [shield, [0, 0, 0], true],
    [rams, EXPLODE.rams, false],
    [erector, EXPLODE.rams, true],
    [ring, EXPLODE.ring, false],
  ];
  const GHOSTED = [head, screw, rams, erector, ring];
  const A = {
    face: anchor(head, -10, AY, 0),
    head: anchor(head, 40, AY, 0),
    cote: anchor(head, COTE.x, AY + H.r + 40, COTE.z),
    chamber: anchor(chamber, (C.x0 + C.x1) / 2, AY, 0),
    bulkhead: anchor(bulkhead, B.x0, AY + 200, 0),
    gauge: anchor(bulkhead, GX, GY, GZ),
    screwIn: anchor(screw, ...TBM.screw.from),
    screwOut: anchor(screw, ...TBM.screw.to),
    rams: anchor(rams, R.x1, AY + R.r, 0),
    ring: anchor(ring, (G.x0 + G.x1) / 2, AY + G.rOut, 0),
    ringKey: anchor(ring, (G.x0 + G.x1) / 2, AY, G.rOut),
  };
  const lit = (list, k) => {
    for (let i = 0; i < list.length; i++) list[i].emissive.copy(VEILLE).multiplyScalar(k);
  };

  return {
    root, parts, A,
    update(p = {}, time = 0, px = 1) {
      void px;
      const onBench = (p.bench ?? 0) > 0.5;
      const k = clamp01(p.explode ?? 0);
      const e = k * k * (3 - 2 * k);
      const stroke = R.stroke * clamp01(p.rams ?? 0);
      for (let i = 0; i < MOVE.length; i++) {
        const part = MOVE[i][0];
        const v = MOVE[i][1];
        const ahead = MOVE[i][2];
        part.position.set(v[0] * e - (ahead ? stroke : 0), v[1] * e, v[2] * e);
      }
      // the rams: the cylinders go with the shield, the rods stretch to their shoes, which stay on the ring
      bodies.position.x = -stroke;
      rods.scale.x = (ROD0 + stroke) / ROD0;

      // what shows: the heart alone, the shield away on the exploded view, its near half on the cutaway
      const ghost = 1 - 0.82 * clamp01(p.solo ?? 0);
      for (let i = 0; i < GHOSTED.length; i++) setPartOpacity(GHOSTED[i], ghost);
      const cut = clamp01(p.cutaway ?? 0);
      const shA = (1 - e) * ghost;
      setPartOpacity(shield, shA);
      setPartOpacity(shieldNear, shA * (1 - smooth(0, 0.85, cut)));
      setPartOpacity(shieldCut, shA * smooth(0.6, 1, cut));
      setPartOpacity(earthNear, 1 - smooth(0.2, 0.9, cut));

      // the cutterhead turns
      headSpin.rotation.x = (p.wheel ?? 0) * TAU;

      // the chamber's earth: its level, the domes of void under the crown (fewer, flatter as it fills and is pressed)
      const ea = p.earth ?? 1;
      U.uLevel.value = ea >= 0.985 ? AY + 2 * ER : AY + ER * (0.5 + 2.75 * (ea - 0.6));
      U.uAmp.value = 16 + 30 * clamp01((0.95 - ea) / 0.4);

      // the manometer: straight up at balance, left as it drops, right too strong; a faint quiver out of the band
      const pr = p.press ?? 1;
      const off = Math.abs(pr - 1);
      const out = smooth(0.06, 0.1, off);
      const th = Math.max(-1.3, Math.min(1.3, (1 - pr) * 2.2)) + out * 0.014 * Math.sin(time * 5.3);
      needle.rotation.z = th;
      setGlow(verdictMat, 1.4, off < 0.08 ? VEILLE : SIGNAL);

      // the screw: its flight turns, the earth between the flights climbs one pitch a turn
      const turns = p.screw ?? 0;
      spin.rotation.y = -turns * TAU;
      const fr = turns - Math.floor(turns);
      for (let i = 0; i < NL; i++) {
        let u = i + 0.75 + fr;
        if (u >= NL) u -= NL;
        const y = 6 + u * P;
        const f = smooth(len - 10, len - 60, y) * smooth(0, 30, y);
        lumps[i].position.set(22, y, -2);
        lumps[i].scale.set(17 * f + 0.01, 30 * f + 0.01, 25 * f + 0.01);
      }

      // the last ring, segment by segment, in the order they are laid
      const rg = p.ring ?? 0;
      for (let i = 0; i < SEG_ORDER.length; i++) segMats[SEG_ORDER[i]].emissive.copy(VEILLE).multiplyScalar(0.45 * clamp01(rg - i));

      // the push on the face: red from the soil, green from the chamber; at hold 1 their tips meet on the face
      const ar = onBench ? 0 : clamp01(p.arrows ?? 0);
      const ho = onBench ? 0 : Math.max(0, p.hold ?? 0);
      const show = ar > 0.01 || ho > 0.01;
      for (let i = 0; i < arrowsAll.length; i++) arrowsAll[i].visible = show;
      if (show) {
        redMat.opacity = ar;
        greenMat.opacity = clamp01(ho * 4);
        const back = -ARROW.len * Math.max(0, ho - 1); // too strong: the green ones push the red ones back
        const gx = ARROW.len * (1 - ho); // the green tips (on the face at hold 1)
        const coneK = clamp01(ho / 0.3);
        const shaftOn = ho > 0.21;
        const sx = gx + ARROW.headLen * coneK;
        for (let i = 0; i < reds.length; i++) {
          reds[i].visible = ar > 0.01;
          reds[i].position.x = back;
          gHeads[i].visible = ho > 0.01;
          gHeads[i].position.x = gx;
          gHeads[i].scale.set(coneK, coneK, coneK);
          gShafts[i].visible = shaftOn;
          gShafts[i].position.x = sx;
          gShafts[i].scale.x = Math.max(0.01, ARROW.len - sx);
        }
      }

      // the dimension line draws itself: the extension lines first, then the line outward from the middle
      const ct = clamp01(p.cote ?? 0);
      cote.visible = ct > 0.01;
      if (cote.visible) {
        const ex = smooth(0, 0.3, ct);
        const ln = smooth(0.2, 1, ct);
        for (let i = 0; i < 2; i++) {
          coteExt[i].scale.z = ex + 0.001;
          const s = i === 0 ? 1 : -1;
          coteTip[i].position.y = AY + s * H.r * ln;
          coteTip[i].visible = ln > 0.05;
        }
        coteLine.scale.y = ln + 0.001;
        coteMat.opacity = smooth(0, 0.15, ct);
      }

      // the part the voice names
      lit(litMats.head, 0.16 * clamp01(p.litHead ?? 0));
      lit(litMats.chamber, 0.11 * clamp01(p.litChamber ?? 0));
      lit(litMats.bulk, 0.2 * clamp01(p.litBulk ?? 0));
      setGlow(sensorGlow, 0.8 + 1.4 * clamp01(p.litBulk ?? 0));
      lit(litMats.screw, 0.2 * clamp01(p.litScrew ?? 0));
      lit(litMats.rams, 0.35 * clamp01(p.litRams ?? 0));
    },
  };
}
