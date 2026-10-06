// The reactor, seen like an X-ray: a pressure vessel drawn in glass and fine lines, and — solid or
// alight — the only things the story needs: the core (157 fuel assemblies, glowing while the chain
// reaction runs), the 57 control rod clusters hanging above it, and on the vessel head the crown of
// coils that hold them. True scale of a 900 MWe unit (1 unit = 1 cm). y = 0 is the top of the fuel.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makeMotes } from "@kit/atmo.js";
import { glass, lineMat, lathe, anchor, mergeGeometries } from "@kit/build3d.js";
import { coilGlow, COIL, TUBE } from "./model.js";
import { buildChain } from "./chain.js";

const DEG = Math.PI / 180;
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const INK = new THREE.Color(BRAND.ink);

export const REACTOR = { x: 30000 }; // far from the bench: the two sets never see each other
export const CORE = { h: 366, pitch: 21.5, rows: [3, 7, 9, 11, 13, 13, 15, 15, 15, 13, 13, 11, 9, 7, 3] }; // 157 assemblies
const VESSEL = { r: 205, bottom: -440, flange: 470, head: 500 };
// one coil per mechanism, just above the vessel head — the very coil of the bench, same size
const COILS = { y: 674, r: COIL.r1 + COIL.flange, h: COIL.y1 - COIL.y0 };
const TUBE_TOP = 800; // above the crown, tubes and drive rods fade into the dark (FADE): nothing bright climbs behind the header
const FADE = [700, 800];
// the bars hang this far above the fuel (more than in a real core, where they sit just over it:
// "suspended" has to be seen); their drive rod is this long; a cluster is this wide
const BAR = { gap: 36, shaft: 400, w: 12.5 };
/** Where the nuclei of the chain reaction are shown: against the fuel, on the side the camera comes from. */
export const CHAIN = { az: 12, r: 188, y: -178 };

/** Where the 157 assemblies stand, and which 57 of them have a control rod cluster above. */
function layout() {
  const cells = [];
  CORE.rows.forEach((len, row) => {
    const di = row - 7;
    for (let dj = -(len - 1) / 2; dj <= (len - 1) / 2; dj++) {
      const even = di % 2 === 0 && dj % 2 === 0;
      const a = Math.abs(di);
      const b = Math.abs(dj);
      const extra = (a === 3 && b === 3) || (a === 1 && (b === 5 || b === 7)) || (b === 1 && (a === 5 || a === 7));
      cells.push({ x: dj * CORE.pitch, z: di * CORE.pitch, rodded: even || extra });
    }
  });
  return cells;
}

/**
 * The bars. A cluster is a bundle of thin absorber rods: each face of the box shows five of them
 * (drawn only when they are wide enough to be seen — from far away, their average). The bars on the
 * far side of the core are darker, so the forest has a depth; the fire below lights their lower ends.
 * `ghost`: the same bars as a light seen through the fuel — what the core looks like once they are in.
 */
function barMaterial(ghost) {
  const mat = new THREE.ShaderMaterial({
    defines: ghost ? { GHOST: 1 } : {},
    uniforms: {
      uInk: { value: new THREE.Color(0xb4bcc2) },
      uHot: { value: SIGNAL.clone() },
      uGhost: { value: VEILLE.clone() },
      uUnder: { value: 0 },
      uDrop: { value: 0 },
      uAmount: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vL; varying vec3 vNl; varying float vDepth;
      void main() {
        vL = position;
        vNl = normal;
        vec4 p = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          p = instanceMatrix * p;
        #endif
        vec4 mv = modelViewMatrix * p;
        vec4 axis = modelViewMatrix * vec4(0.0, p.y, 0.0, 1.0);
        vDepth = axis.z - mv.z; // > 0: beyond the axis of the core, seen from the eye
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uHot, uGhost; uniform float uUnder, uDrop, uAmount;
      varying vec3 vN; varying vec3 vV; varying vec3 vL; varying vec3 vNl; varying float vDepth;
      void main() {
        float h = vL.y - ${BAR.gap.toFixed(1)}; // above the lower ends
        float facing = 0.3 + 0.7 * abs(dot(normalize(vN), normalize(vV)));
        float body = 1.0;
        if (h < ${CORE.h.toFixed(1)} && abs(vNl.y) < 0.5) {
          float across = abs(vNl.x) > 0.5 ? vL.z : vL.x;
          float u = (across / ${BAR.w.toFixed(1)} + 0.5) * 5.0;
          float w = max(fwidth(u), 1e-4); // never two equal edges in the smoothstep below
          float s = abs(fract(u) - 0.5) * 2.0; // 0 on the axis of a rod, 1 between two rods
          float rod = 1.0 - smoothstep(0.6 - w, 0.6 + w, s);
          float round = 0.62 + 0.38 * (1.0 - s * s);
          body = mix(rod * round, 0.55, clamp(w * 1.6 - 0.3, 0.0, 1.0));
        }
        #ifdef GHOST
          if (h > ${CORE.h.toFixed(1)} || vL.y - uDrop > 0.0) discard; // only what is inside the fuel: it appears from the top, as they go in
          gl_FragColor = vec4(uGhost * uAmount * (0.2 + 0.8 * facing) * body, 1.0);
        #else
          float shade = mix(1.0, 0.4, clamp(0.5 + vDepth / 340.0, 0.0, 1.0));
          vec3 col = uInk * (0.035 + 0.66 * facing * body * shade);
          // the light of the core, on what hangs just above it
          float above = max(vL.y - uDrop, 0.0);
          col += uHot * uUnder * exp(-above / 70.0) * (0.25 + 0.75 * body) * shade;
          col *= 1.0 - smoothstep(${FADE[0].toFixed(1)}, ${FADE[1].toFixed(1)}, vL.y); // the top of the drive rod goes into the dark
          gl_FragColor = vec4(col, 1.0);
        #endif
      }`,
  });
  mat.fog = false;
  if (ghost) Object.assign(mat, { transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  return mat;
}

export function buildReactor() {
  const group = new THREE.Group();
  group.position.set(REACTOR.x, 0, 0);
  const fx = {};
  const A = {};
  const cells = layout();
  const rodded = cells.filter((c) => c.rodded);
  const m4 = new THREE.Matrix4();

  /* ── the vessel: glass, and the fine circles that give it a shape ── */
  const profile = [];
  for (let a = -90; a <= 0; a += 6) profile.push([Math.max(0.01, VESSEL.r * Math.cos(a * DEG)), VESSEL.bottom + VESSEL.r * Math.sin(a * DEG)]);
  profile.push([VESSEL.r, VESSEL.flange], [VESSEL.r + 20, VESSEL.flange], [VESSEL.r + 20, VESSEL.head], [VESSEL.r, VESSEL.head]);
  for (let a = 6; a <= 90; a += 6) profile.push([Math.max(0.01, VESSEL.r * Math.cos(a * DEG)), VESSEL.head + VESSEL.r * 0.62 * Math.sin(a * DEG)]);
  fx.shell = glass(BRAND.ink, { base: 0.01, rim: 0.2, power: 2.6 });
  group.add(new THREE.Mesh(lathe(profile, 96), fx.shell));
  // the six nozzles the water comes in and goes out by
  const nozzle = new THREE.CylinderGeometry(40, 46, 90, 32, 1, true).rotateZ(Math.PI / 2);
  for (let k = 0; k < 6; k++) {
    const n = new THREE.Mesh(nozzle, fx.shell);
    const a = (k * 60 + 30) * DEG;
    n.position.set(Math.cos(a) * (VESSEL.r + 40), 255, Math.sin(a) * (VESSEL.r + 40));
    n.rotation.y = -a;
    group.add(n);
  }
  const seg = [];
  const circle = (r, y, n = 72) => {
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI * 2;
      const a1 = ((k + 1) / n) * Math.PI * 2;
      seg.push(r * Math.cos(a0), y, r * Math.sin(a0), r * Math.cos(a1), y, r * Math.sin(a1));
    }
  };
  circle(VESSEL.r, VESSEL.bottom);
  circle(VESSEL.r, VESSEL.flange);
  circle(VESSEL.r + 20, VESSEL.flange);
  circle(VESSEL.r + 20, VESSEL.head);
  circle(VESSEL.r, VESSEL.head);
  circle(168, 0); // the plate above the fuel
  circle(168, -CORE.h); // …and the one it stands on
  for (let k = 0; k < 8; k++) {
    // the barrel around the core: eight uprights
    const a = (k * 45 + 22.5) * DEG;
    seg.push(168 * Math.cos(a), -CORE.h, 168 * Math.sin(a), 168 * Math.cos(a), 0, 168 * Math.sin(a));
  }
  const linesGeo = new LineSegmentsGeometry();
  linesGeo.setPositions(seg);
  fx.lines = lineMat(BRAND.ink, 1.9, { opacity: 0.42 });
  const lines = new LineSegments2(linesGeo, fx.lines);
  lines.frustumCulled = false;
  group.add(lines);

  /* ── the core: 157 assemblies. Their light is the chain reaction. ── */
  fx.fuel = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: SIGNAL.clone() }, uReaction: { value: 1 }, uFront: { value: 20 }, uTime: { value: 0 }, uGain: { value: 1.7 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec3 vL; varying float vR;
      void main() {
        vL = position;
        vec4 p = vec4(position, 1.0);
        vec3 n = normal;
        #ifdef USE_INSTANCING
          p = instanceMatrix * p;
          vR = length(instanceMatrix[3].xz) / 165.0;
        #else
          vR = 0.0;
        #endif
        vP = p.xyz;
        vec4 mv = modelViewMatrix * p;
        vN = normalize(normalMatrix * n);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uReaction, uFront, uTime, uGain; varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec3 vL; varying float vR;
      void main() {
        // hotter in the middle of the core than at its edge, hotter at mid-height than at the ends,
        // each face lit by how it faces the eye, each assembly darker toward its own edges
        float profile = 0.5 + 0.5 * cos(1.5708 * clamp(vR, 0.0, 1.0));
        profile *= 0.5 + 0.5 * sin(3.14159 * clamp(vL.y / 366.0 + 0.5, 0.0, 1.0));
        float facing = 0.3 + 0.7 * abs(dot(normalize(vN), normalize(vV)));
        facing *= 1.0 - 0.6 * smoothstep(0.6, 0.98, max(abs(vL.x), abs(vL.z)) / 9.7);
        // a slow breath, never a blink
        float breath = 0.93 + 0.07 * sin(uTime * 1.7 + vP.x * 0.02 + vP.z * 0.03);
        // above the tips of the rods, the neutrons are swallowed: the fuel goes dark from the top down
        float lit = 1.0 - smoothstep(uFront - 26.0, uFront + 6.0, vP.y);
        float k = (0.07 + uGain * 1.5 * uReaction * lit * profile * breath) * facing;
        gl_FragColor = vec4(uColor * k, 1.0);
      }`,
  });
  fx.fuel.fog = false;
  const fuel = new THREE.InstancedMesh(new THREE.BoxGeometry(19.4, CORE.h, 19.4), fx.fuel, cells.length);
  cells.forEach((c, i) => fuel.setMatrixAt(i, m4.makeTranslation(c.x, -CORE.h / 2, c.z)));
  fuel.frustumCulled = false;
  group.add(fuel);
  A.core = anchor(group, -150, -CORE.h * 0.45, 150);
  A.coreTop = anchor(group, 0, 0, 0);
  // the neutrons: sparks that criss-cross the core
  fx.neutrons = makeMotes({ count: 900, seed: 11, min: [-170, -CORE.h, -170], size: [340, CORE.h + 30, 340], psize: [3, 8], color: BRAND.ink, drift: [34, 21, -27] });
  group.add(fx.neutrons.points);
  // …and, from very close, a few nuclei: what a chain reaction is
  fx.chain = buildChain();
  fx.chain.group.position.set(Math.sin(CHAIN.az * DEG) * CHAIN.r, CHAIN.y, Math.cos(CHAIN.az * DEG) * CHAIN.r);
  fx.chain.group.rotation.y = CHAIN.az * DEG;
  group.add(fx.chain.group);
  A.chain = anchor(fx.chain.group, 0, 0, 0);

  /* ── the 57 clusters: a bundle of absorber rods, and the long drive rod it hangs from ── */
  const absorber = new THREE.BoxGeometry(BAR.w, CORE.h, BAR.w).translate(0, BAR.gap + CORE.h / 2, 0);
  const bundle = mergeGeometries([
    absorber,
    new THREE.BoxGeometry(17, 4, 17).translate(0, BAR.gap + CORE.h + 2, 0), // the spider the rods hang from
    new THREE.CylinderGeometry(2.6, 2.6, BAR.shaft, 8).translate(0, BAR.gap + CORE.h + 4 + BAR.shaft / 2, 0),
  ]);
  fx.barMat = barMaterial(false);
  fx.bars = new THREE.InstancedMesh(bundle, fx.barMat, rodded.length);
  fx.barGhost = barMaterial(true);
  fx.ghost = new THREE.InstancedMesh(absorber, fx.barGhost, rodded.length);
  rodded.forEach((c, i) => {
    fx.bars.setMatrixAt(i, m4.makeTranslation(c.x, 0, c.z));
    fx.ghost.setMatrixAt(i, m4.makeTranslation(c.x, 0, c.z));
  });
  fx.bars.frustumCulled = false;
  fx.ghost.frustumCulled = false;
  fx.ghost.renderOrder = 5;
  group.add(fx.bars, fx.ghost);
  A.bars = anchor(fx.bars, -130, BAR.gap + CORE.h * 0.62, 130);
  A.barsTop = anchor(fx.bars, 0, BAR.gap + CORE.h, 0);

  /* ── on the head: one mechanism per cluster. A tube, and its coil — alight while it holds. ── */
  fx.tubes = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(0.06) } },
    vertexShader: /* glsl */ `
      varying float vY;
      void main() {
        vec4 p = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          p = instanceMatrix * p;
        #endif
        vY = p.y;
        gl_Position = projectionMatrix * modelViewMatrix * p;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vY;
      void main() { gl_FragColor = vec4(uColor * (1.0 - smoothstep(${FADE[0].toFixed(1)}, ${FADE[1].toFixed(1)}, vY)), 1.0); }`,
  });
  fx.tubes.fog = false;
  const headAt = (c) => VESSEL.head + VESSEL.r * 0.62 * Math.sqrt(Math.max(0, 1 - (c.x * c.x + c.z * c.z) / (VESSEL.r * VESSEL.r)));
  const tubes = new THREE.InstancedMesh(new THREE.CylinderGeometry(TUBE.r, TUBE.r, 1, 16, 1, true), fx.tubes, rodded.length);
  const scale = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const at = new THREE.Vector3();
  rodded.forEach((c, i) => {
    const y0 = headAt(c);
    tubes.setMatrixAt(i, m4.compose(at.set(c.x, (y0 + TUBE_TOP) / 2, c.z), quat, scale.set(1, TUBE_TOP - y0, 1)));
  });
  tubes.frustumCulled = false;
  group.add(tubes);
  // the one the film goes to: the nearest, seen from where the camera ends its first act
  const toward = (c) => c.x * Math.sin(24 * DEG) + c.z * Math.cos(24 * DEG);
  const hero = rodded.reduce((best, c, i) => (toward(c) > toward(rodded[best]) ? i : best), 0);
  fx.coils = coilGlow();
  const coilGeo = new THREE.CylinderGeometry(COILS.r, COILS.r, COILS.h, 32);
  const mark = new Float32Array(rodded.length);
  mark[hero] = 1;
  coilGeo.setAttribute("aHero", new THREE.InstancedBufferAttribute(mark, 1));
  const coils = new THREE.InstancedMesh(coilGeo, fx.coils, rodded.length);
  rodded.forEach((c, i) => coils.setMatrixAt(i, m4.makeTranslation(c.x, COILS.y, c.z)));
  coils.frustumCulled = false;
  group.add(coils);
  A.coils = anchor(group, -150, COILS.y, 150);
  A.crown = anchor(group, 0, COILS.y, 0);
  A.hero = anchor(group, rodded[hero].x, COILS.y, rodded[hero].z);
  // the line that feeds them: it comes in from the side, at the height of the crown
  const feedGeo = new LineSegmentsGeometry();
  feedGeo.setPositions([VESSEL.r + 420, COILS.y, 0, 180, COILS.y, 0]);
  fx.feed = lineMat(BRAND.veille, 3.2, { opacity: 0.95, dashed: true, dashSize: 16, gapSize: 12, hdr: 1.6 });
  const feed = new LineSegments2(feedGeo, fx.feed);
  feed.computeLineDistances();
  feed.frustumCulled = false;
  group.add(feed);
  A.feed = anchor(group, VESSEL.r + 250, COILS.y, 0);

  const hue = new THREE.Color();
  /**
   * power      1 → 0: the current in the coils (the crown goes out, the feed stops)
   * fall       0 → 1: the clusters, from hanging above the core to fully in
   * reaction   1 → 0: the chain reaction (the light of the fuel, the neutrons)
   * shell      0 → 1: the glass and the fine lines · heat 0 → 1: how much more the coils glow, seen from far
   * glow       how bright the fuel is (≈ 3 from far; less from close, or it is a flat wall of light) · neutrons 0 → 1
   * feed       0 → 1: the line that feeds the crown (hidden whenever the camera travels past it)
   * others     1 → 0: every coil but the one the film goes to
   * sealed     0 → 1: the bars, seen through the fuel wherever they are in it (veille): the green goes down as the orange goes out
   * chain      0 → 1: the nuclei, from very close
   */
  function update(S, time, px) {
    fx.bars.position.y = -S.fall * CORE.h;
    fx.ghost.position.y = fx.bars.position.y;
    fx.ghost.visible = S.sealed > 0.004;
    fx.barGhost.uniforms.uAmount.value = 0.38 * S.sealed;
    fx.barGhost.uniforms.uDrop.value = S.fall * CORE.h;
    fx.barMat.uniforms.uUnder.value = S.reaction * (0.5 + 0.22 * S.glow);
    fx.barMat.uniforms.uDrop.value = S.fall * CORE.h;
    fx.fuel.uniforms.uReaction.value = S.reaction;
    fx.fuel.uniforms.uFront.value = BAR.gap - S.fall * CORE.h;
    fx.fuel.uniforms.uTime.value = time;
    fx.fuel.uniforms.uGain.value = S.glow;
    fx.neutrons.uniforms.uAmount.value = 0.9 * S.reaction * S.neutrons;
    fx.neutrons.update(time, px, 1 / 30);
    fx.chain.update(time, S.chain);
    hue.copy(INK).multiplyScalar(0.12).lerp(VEILLE, S.power);
    fx.coils.uniforms.uColor.value.copy(hue).multiplyScalar(0.4 + (0.9 + S.heat) * S.power);
    fx.coils.uniforms.uOthers.value = S.others;
    fx.feed.opacity = 0.95 * S.power * S.shell * S.feed;
    fx.feed.dashOffset = -time * 60; // 2 cm a frame for dashes 28 cm apart: it runs, it does not strobe
    feed.visible = fx.feed.opacity > 0.01;
    fx.shell.uniforms.uAmount.value = S.shell;
    fx.lines.opacity = 0.42 * S.shell;
    fx.tubes.uniforms.uColor.value.copy(INK).multiplyScalar(0.06 * S.shell);
  }

  return { group, fx, A, update, rodded: rodded.length, hero: { x: rodded[hero].x, y: COILS.y, z: rodded[hero].z } };
}
