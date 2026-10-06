// DOSSIER 005 — what holds a control rod above the core of a pressurised-water reactor: the gripper
// of its drive mechanism. Centimetres; it stands on the bench the way it stands on the vessel head.
//   · a notched drive rod (the control rod cluster hangs from its lower end, metres below)
//   · three latches whose teeth sit in one of its notches
//   · a ring that keeps the latches closed — as long as an electromagnet holds that ring up
//   · the coil of that electromagnet, outside the pressure tube
// Cut the current: the ring drops, the latches swing out, the rod falls. Nothing pushes anything.
// Opening it is lifting its coil off (the only part with a `lift`): everything is on one axis, and
// an exploded view of coaxial parts is a thin column. The rest is shown at work, part by part.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, makePart, addMesh, anchor, lathe, fatLine } from "@kit/build3d.js";

const DEG = Math.PI / 180;
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const INK = new THREE.Color(BRAND.ink);

export const ROD = { r: 2.2, groove: 1.55, pitch: 3, y0: 12, y1: 66 }; // the drive rod: radius, radius at the bottom of a notch, notch every 3 cm. It hangs: its lower end is above the stand
const NOTCH = 31.5; // the height of the notch the latches hold
export const TUBE = { r: 6.9, y0: 8, y1: 57 }; // the pressure tube: the coil is outside it, the latches inside
const PIVOT = { r: 4.6, y: 39.2 }; // where a latch hinges
const RING = { y: 31.6, h: 3.2, fall: 4.6 }; // the holding ring: its height when held up, how far it drops
export const COIL = { r0: 7.5, r1: 12.4, y0: 26, y1: 38, flange: 0.9 };

/**
 * A coil as it is seen from far away: all light. The crown of the reactor is made of these
 * (`aHero` marks the one the film goes to, `uOthers` dims the rest), and the coil on the bench
 * wears the same light for an instant, at the cut (`fade`: it can then dissolve).
 */
export const coilGlow = ({ fade = false } = {}) => {
  const mat = new THREE.ShaderMaterial({
    transparent: fade,
    depthWrite: !fade,
    uniforms: { uColor: { value: VEILLE.clone() }, uOthers: { value: 1 }, uAlpha: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aHero;
      varying vec3 vN; varying vec3 vV; varying float vK;
      void main() {
        vec4 p = vec4(position, 1.0);
        vK = 1.0;
        #ifdef USE_INSTANCING
          p = instanceMatrix * p;
          vK = aHero;
        #endif
        vec4 mv = modelViewMatrix * p;
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOthers, uAlpha; varying vec3 vN; varying vec3 vV; varying float vK;
      void main() {
        float facing = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        gl_FragColor = vec4(uColor * mix(uOthers, 1.0, vK) * (0.25 + 0.75 * facing * facing), uAlpha);
      }`,
  });
  mat.fog = false;
  return mat;
};

/** The notched rod, as a profile to turn: a notch every `pitch`, one of them exactly at NOTCH. */
function rodProfile() {
  const pts = [[0.01, ROD.y0], [ROD.r - 0.3, ROD.y0], [ROD.r, ROD.y0 + 0.3]];
  const first = NOTCH - Math.floor((NOTCH - ROD.y0 - 1) / ROD.pitch) * ROD.pitch;
  for (let y = first; y < ROD.y1 - 1.2; y += ROD.pitch) {
    pts.push([ROD.r, y - 0.56], [ROD.groove, y - 0.42], [ROD.groove, y + 0.42], [ROD.r, y + 0.56]);
  }
  pts.push([ROD.r, ROD.y1 - 0.5], [ROD.r - 0.5, ROD.y1], [0.01, ROD.y1]);
  return pts;
}

export function buildGripper() {
  const root = new THREE.Group();
  const fx = {};
  const A = {};
  // one set of materials per part: a part can fade without taking its neighbours along
  const metals = () => ({
    cast: solid(0x232a30, { rough: 0.6, metal: 0.3, coat: 0.3, coatRough: 0.45 }),
    steel: solid(0x6f7a83, { rough: 0.42, metal: 0.4, env: 1.1 }),
    bright: solid(0xb9c0c4, { rough: 0.36, metal: 0.45, env: 1.3 }),
    hero: solid(0xc9ced1, { rough: 0.42, metal: 0.25, env: 1.2 }),
  });

  /* ── the stand, and the pressure tube: glass, so that what it hides is the subject ── */
  const stand = makePart("stand", { lift: 0 });
  const m0 = metals();
  addMesh(stand, new THREE.CylinderGeometry(13, 13.6, 1.7, 64), m0.cast, { pos: [0, 0.85, 0], threshold: 40 });
  addMesh(stand, lathe([[TUBE.r + 0.1, 1.7], [9.2, 1.7], [9.2, 5.6], [8.1, 8.2], [TUBE.r + 0.1, 8.2]], 64), m0.steel, { threshold: 40, edgeOpacity: 0.6 });
  fx.tube = glass(BRAND.ink, { base: 0.02, rim: 0.3, power: 2.4 });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(TUBE.r, TUBE.r, TUBE.y1 - TUBE.y0, 64, 1, true), fx.tube);
  tube.position.y = (TUBE.y0 + TUBE.y1) / 2;
  stand.add(tube);
  // its rim, top and bottom: two fine circles, or a glass tube has no edge at all
  for (const y of [TUBE.y0 + 0.4, TUBE.y1]) {
    addMesh(stand, new THREE.TorusGeometry(TUBE.r, 0.14, 8, 72).rotateX(Math.PI / 2), m0.bright, { pos: [0, y, 0], edges: false });
  }
  A.tube = anchor(stand, -TUBE.r, 50, 0);

  /* ── the rod ── */
  const rod = makePart("rod", { lift: 0 });
  const m1 = metals();
  fx.rod = new THREE.Group(); // dropped by the film
  m1.bright.flatShading = true; // each land, each notch, its own facet: the notches read as notches
  fx.rod.add(addMesh(rod, lathe(rodProfile(), 72), m1.bright, { edges: false })); // registered on the part, hung on what moves
  rod.add(fx.rod);
  A.rod = anchor(fx.rod, -ROD.r, 21, 0);

  /* ── the latches: three arms on a carrier, a tooth at the end of each, and the ring that keeps them closed ── */
  const latches = makePart("latches", { lift: 0 }); // they stay where they hold: opening the gripper is lifting its coil off them
  const m2 = metals();
  addMesh(latches, new THREE.TorusGeometry(PIVOT.r + 0.5, 0.75, 14, 64).rotateX(Math.PI / 2), m2.steel, { pos: [0, PIVOT.y + 0.9, 0], edges: false });
  // an arm, drawn in its own plane: x points away from the rod, y up; the hinge is the origin
  const arm = new THREE.Shape();
  arm.moveTo(-0.7, 0.8);
  arm.lineTo(0.75, 0.8);
  arm.lineTo(0.75, -8.4);
  arm.lineTo(-0.7, -8.4);
  arm.lineTo(-3.0, -7.95); // the tooth: its tip sits in the notch
  arm.lineTo(-3.0, -7.3);
  arm.lineTo(-0.7, -6.5);
  arm.closePath();
  const armGeo = new THREE.ExtrudeGeometry(arm, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelOffset: -0.12, bevelSegments: 1 });
  armGeo.translate(0, 0, -0.75);
  fx.arms = [0, 120, 240].map((deg) => {
    const yaw = new THREE.Group(); // turns the arm's plane around the rod
    yaw.rotation.y = -deg * DEG;
    const pivot = new THREE.Group();
    pivot.position.set(PIVOT.r, PIVOT.y, 0);
    pivot.add(addMesh(latches, armGeo, m2.hero, { edgeOpacity: 0.9 }));
    pivot.add(addMesh(latches, new THREE.CylinderGeometry(0.42, 0.42, 2.1, 14).rotateX(Math.PI / 2), m2.cast, { edges: false }));
    yaw.add(pivot);
    latches.add(yaw);
    return pivot;
  });
  // the edge of each tooth: what bites (a drawing device)
  fx.teeth = glow(BRAND.veille, 1.4);
  for (const pivot of fx.arms) {
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.75, 1.5), fx.teeth);
    tip.position.set(-3.02, -7.62, 0);
    pivot.add(tip);
  }
  // the holding ring: a collar around the lower ends of the arms. Up, it wedges them shut.
  fx.ring = new THREE.Group();
  const collar = lathe([[5.5, 0], [6.55, 0], [6.55, RING.h], [5.5, RING.h], [5.36, RING.h - 0.5], [5.36, 0.5], [5.5, 0]], 64);
  fx.ring.add(addMesh(latches, collar, m2.cast, { threshold: 40, edgeOpacity: 0.85 }));
  fx.ringGlow = glow(BRAND.veille, 1.6);
  const band = new THREE.Mesh(new THREE.TorusGeometry(6.58, 0.13, 8, 72).rotateX(Math.PI / 2), fx.ringGlow);
  band.position.y = RING.h / 2;
  fx.ring.add(band);
  fx.ring.position.y = RING.y - RING.h / 2;
  latches.add(fx.ring);
  A.latch = anchor(fx.arms[0], 0.75, -3.6, 0);
  A.tooth = anchor(fx.arms[0], -3.0, -7.6, 0);
  A.ring = anchor(fx.ring, 6.55, RING.h / 2, 0);
  A.latchL = anchor(latches, -3.1, 35.5, 4.6); // on the arm that leans toward the left of the picture

  /* ── the coil: outside the tube, around the place where the ring waits ── */
  const coil = makePart("coil", { lift: 25, delay: 0, span: 1 });
  const m3 = metals();
  const turns = [];
  const n = 15;
  turns.push([COIL.r0, COIL.y0 + 0.9], [COIL.r1 - 0.5, COIL.y0 + 0.9]);
  for (let i = 0; i < n; i++) {
    const y = COIL.y0 + 0.9 + ((COIL.y1 - COIL.y0 - 1.8) * (i + 0.5)) / n;
    const half = (COIL.y1 - COIL.y0 - 1.8) / n / 2;
    turns.push([COIL.r1 - 0.5, y - half * 0.7], [COIL.r1, y], [COIL.r1 - 0.5, y + half * 0.7]); // the winding, as ribs
  }
  turns.push([COIL.r1 - 0.5, COIL.y1 - 0.9], [COIL.r0, COIL.y1 - 0.9]);
  addMesh(coil, lathe(turns, 72), m3.cast, { edges: false });
  for (const y of [COIL.y0, COIL.y1 - 0.9]) {
    addMesh(coil, lathe([[COIL.r0, y], [COIL.r1 + 0.9, y], [COIL.r1 + 0.9, y + 0.9], [COIL.r0, y + 0.9], [COIL.r0, y]], 72), m3.steel, { threshold: 40, edgeOpacity: 0.8 });
  }
  // the current in it, as a light: two bands of veille. No current, no light.
  fx.power = glow(BRAND.veille, 2);
  for (const y of [COIL.y0 + 3.6, COIL.y1 - 3.6]) {
    const b = new THREE.Mesh(new THREE.TorusGeometry(COIL.r1 + 0.06, 0.2, 8, 96).rotateX(Math.PI / 2), fx.power);
    b.position.y = y;
    coil.add(b);
  }
  // its two leads
  for (const side of [-1, 1]) {
    addMesh(coil, new THREE.CylinderGeometry(0.34, 0.34, 9, 10).rotateZ(Math.PI / 2), m3.steel, { pos: [-(COIL.r1 + 5), COIL.y0 + 4 + side * 2.2, side * 2.4], edges: false });
  }
  A.coil = anchor(coil, COIL.r1 + 0.9, (COIL.y0 + COIL.y1) / 2, 0);
  A.leads = anchor(coil, -(COIL.r1 + 9.5), COIL.y0 + 4, 0);
  A.coilL = anchor(coil, -(COIL.r1 + 0.9), (COIL.y0 + COIL.y1) / 2, 0);
  // the light it wears when the film arrives from the reactor: one coil of the crown, on the bench
  fx.shell = coilGlow({ fade: true });
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(COIL.r1 + COIL.flange + 0.1, COIL.r1 + COIL.flange + 0.1, COIL.y1 - COIL.y0 + 0.2, 48), fx.shell);
  shell.position.y = (COIL.y0 + COIL.y1) / 2;
  shell.renderOrder = 3;
  coil.add(shell);
  const shellMesh = shell;

  /* ── its field: the lines of an electromagnet, from one face of the coil to the other. No current, no field. ── */
  fx.field = [];
  const fieldLines = new THREE.Group();
  const yc = (COIL.y0 + COIL.y1) / 2;
  for (let k = 0; k < 8; k++) {
    const a = (k * 45 + 22.5) * DEG;
    for (const bulge of [7.5, 12.5]) {
      const pts = [];
      for (let i = 0; i <= 28; i++) {
        const th = (-90 + (180 * i) / 28) * DEG;
        const r = 10.2 + bulge * Math.cos(th);
        pts.push([r * Math.cos(a), yc + (6.7 + bulge * 0.16) * Math.sin(th), r * Math.sin(a)]);
      }
      const line = fatLine(pts, { color: BRAND.veille, width: 2.2, opacity: 0 });
      fx.field.push(line.material);
      fieldLines.add(line);
    }
  }
  root.add(fieldLines);

  const parts = { stand, rod, latches, coil };
  root.add(stand, rod, latches, coil);
  const outline = [...coil.userData.part.mats].filter((m) => m.isLineMaterial);
  for (const m of outline) m.userData.rest = m.color.clone();

  const hue = new THREE.Color();
  /**
   * power   1 → 0: the current in the coil (its bands go out)
   * ring    0 → 1: the holding ring has dropped · open 0 → 1: the latches have swung out
   * drop    cm the rod has fallen
   * aura    0 → 1: the coil's outline lights up (veille) — how it is found from far away
   * shell   0 → 1: the coil is all light, as in the crown of the reactor · `shellK` how bright
   * field   0 → 1: the lines of its magnetic field · pulse 0 → 1: the ring and the teeth squeeze (a light)
   * bands   how bright the two bands of the coil are (less when the coil is glass: what they surround is the subject)
   */
  function pose({ power = 1, ring = 0, open = 0, drop = 0, aura = 0, shell = 0, shellK = 1.45, field = 0, pulse = 0, bands = 1 }) {
    fx.shell.uniforms.uAlpha.value = shell;
    fx.shell.uniforms.uColor.value.copy(VEILLE).multiplyScalar(shellK);
    shellMesh.visible = shell > 0.004;
    for (const m of fx.field) m.opacity = 0.55 * field;
    fieldLines.visible = field > 0.004;
    fx.ring.position.y = RING.y - RING.h / 2 - RING.fall * ring;
    for (const pivot of fx.arms) pivot.rotation.z = 19 * DEG * open; // about the hinge, away from the rod
    fx.rod.position.y = -drop;
    fx.power.color.copy(VEILLE).multiplyScalar(0.05 + 1.7 * power * bands);
    hue.copy(INK).multiplyScalar(0.35).lerp(VEILLE, power);
    fx.ringGlow.color.copy(hue).multiplyScalar((0.4 + 1.5 * power) * (1 + 1.5 * pulse));
    // the teeth: veille while they hold; once open they hold nothing
    hue.copy(VEILLE).lerp(SIGNAL, open);
    fx.teeth.color.copy(hue).multiplyScalar((1.4 + 1.6 * open) * (1 + 1.2 * pulse));
    for (const m of outline) m.color.copy(m.userData.rest).lerp(VEILLE, Math.min(1, aura * 1.5)).multiplyScalar(1 + aura * 3);
  }
  pose({});

  return { root, parts, fx, A, pose };
}
