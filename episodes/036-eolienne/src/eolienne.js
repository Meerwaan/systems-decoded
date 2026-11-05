// DOSSIER 036 — the turbine: its tower and its three blades, seen like an X-ray; the ladder and the technician inside;
// the grid's cable and its station; Formerie's fold; the reach of a tip to your car (docs/036-decors.md).
//
//   buildTurbine() → { group, A, blades, update(P, time, px) }
//   group    the world's frame (plan.js): origin at the tower's foot
//   A        top (the nacelle's frame: at the top of the tower, turned by TURBINE.heading, folded with `fold` —
//            world.js hangs model.js's root there) · foot · door · ladder (its foot)
//   blades   three Groups, each in ITS BLADE'S frame (plan.js: origin at the bearing's flange, +y to the tip, +z
//            upwind, +x the way it moves; pitch 0 = chord across): world.js mounts them in model.js's A.pitch[k]
//   P        tower blades rpm pitchA pitchB pitchC shake reach mains fold tech
//
// THE TOWER: two truncated cones of glass (one shell, order 40), cut at FOLD.y. The upper half turns about a level
// axis laid on the tower's skin on the side it falls to (FOLD.toward): it opens like a hinge, never through the lower
// half. Its flanges are rings, its door faces the road, its ladder is a ribbon drawn in a shader (rungs every 30 cm,
// melted to their mean by fwidth before they get finer than a pixel: no moiré seen from the road).
// THE BLADES: a lofted wing (round root → widest chord → slim tip, twisted), each in 8 chained segments: `shake` bends
// blade A by small angles at the joints, a wave running to the tip. Glass (one shell, order 30) over a dark veil: the
// blade reads dark on the halo; its leading and trailing edges are light lines, readable on the black sky.
// THE BLUR: behind each blade (toward −x), a fan in the rotor plane (counter-turned from the pitch) whose angle is the
// sweep of a long shutter (0.55° per tr/min), computed in a vertex shader; the tips draw a longer trail, ink, signal
// above 13 tr/min (200 km/h at the tips). Under ≈ 4 tr/min, nothing.
// THE GRID: a path from far along the road to the foot (reversed, so that `instanceCount` cuts it FROM THE FOOT): a dark
// ink conductor, veille dashes (a tail and its head) running at 3000 cm/s (period 1200 cm: 1/12 of it per frame).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, fatLine, lineMat, edgesOf } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { TOWER, TURBINE, BLADE, SECTION, FOLD, MAINS, REACH, CARAT } from "./plan.js";
import { dressTurbine } from "./habillage.js"; // the decorator: the beacons, the door lamp, the station's lamp

const DEG = Math.PI / 180;
const AXIS = 190; // the blade's flange, from the rotor axis (BEARING.r): the tip is at AXIS + BLADE.len = 4100
const SEGS = 8; // the blade's chained segments
const ORDER = { tech: 10, blades: 30, tower: 40 };
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, u) => a + (b - a) * u;
const rAt = (y) => mix(TOWER.r0, TOWER.r1, y / TOWER.top); // the tower's radius at a height

/* ───────────── the blade: a lofted wing ───────────── */
/** The section at `y` (blade frame): chord, thickness ratio, roundness (1 = the root's circle), twist (rad). */
function sectionAt(y) {
  const L = BLADE.len;
  const round = 1 - smooth(60, BLADE.atMax * 0.92, y);
  let chord, thick;
  if (y <= BLADE.atMax) {
    chord = mix(BLADE.root * 2, BLADE.chordMax, smooth(0, BLADE.atMax, y));
    thick = 0.42;
  } else {
    const u = (y - BLADE.atMax) / (L - BLADE.atMax);
    chord = BLADE.chordTip + (BLADE.chordMax - BLADE.chordTip) * Math.pow(1 - u, 1.18);
    thick = mix(0.34, 0.13, Math.pow(u, 0.7));
  }
  const twist = BLADE.twist * DEG * Math.pow(Math.max(0, 1 - y / L), 1.4);
  return { chord, thick, round, twist };
}
const RING = 36; // points around a section
/** One point of the section at angle φ (φ 0 = leading edge, toward +x; π = trailing edge). */
function sectionPoint(s, phi, out) {
  const c = (1 - Math.cos(phi)) / 2; // 0 at the leading edge, 1 at the trailing edge (cosine spacing)
  const sq = Math.sqrt(Math.max(0, c));
  const half = 5 * s.thick * (0.2969 * sq - 0.126 * c - 0.3516 * c * c + 0.2843 * c * c * c - 0.1036 * c * c * c * c);
  const side = Math.sin(phi) >= 0 ? 1 : -1;
  let x = s.chord * (0.3 - c);
  let z = side * half * s.chord + s.chord * 0.025 * 4 * c * (1 - c); // a little camber, upwind
  x = mix(x, BLADE.root * Math.cos(phi), s.round);
  z = mix(z, BLADE.root * Math.sin(phi), s.round);
  const ct = Math.cos(s.twist), st = Math.sin(s.twist); // the leading edge turns toward +z
  out[0] = x * ct - z * st;
  out[1] = x * st + z * ct;
  return out;
}
/** The segment of the blade from y0 to y1 (in a frame whose origin is at y0): its surface and its two edges. */
function bladeSegment(y0, y1, steps, cap) {
  const ys = [];
  for (let i = 0; i <= steps; i++) ys.push(mix(y0, y1, i / steps));
  if (cap) ys.push(y1 + 14);
  const pos = [];
  const lead = [];
  const trail = [];
  const p = [0, 0];
  ys.forEach((y, i) => {
    const s = sectionAt(Math.min(y, BLADE.len));
    if (cap && i === ys.length - 1) { s.chord *= 0.2; s.thick *= 0.6; }
    for (let j = 0; j < RING; j++) {
      sectionPoint(s, (j / RING) * Math.PI * 2, p);
      pos.push(p[0], y - y0, p[1]);
    }
    if (!(cap && i === ys.length - 1)) {
      sectionPoint(s, 0, p); lead.push([p[0], y - y0, p[1]]);
      sectionPoint(s, Math.PI, p); trail.push([p[0], y - y0, p[1]]);
    }
  });
  const index = [];
  for (let i = 0; i < ys.length - 1; i++) {
    for (let j = 0; j < RING; j++) {
      const a = i * RING + j, b = i * RING + ((j + 1) % RING), c = a + RING, d = b + RING;
      index.push(a, c, b, b, c, d);
    }
  }
  if (cap) { // close the tip: a fan to the last section's centre
    const last = (ys.length - 1) * RING;
    const centre = pos.length / 3;
    pos.push(0, ys[ys.length - 1] - y0 + 4, 0);
    for (let j = 0; j < RING; j++) index.push(last + j, centre, last + ((j + 1) % RING));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return { geometry: g, lead, trail };
}

/* ───────────── the blur: a fan in the rotor plane, swept in a shader ───────────── */
const FAN_VS = /* glsl */ `
  attribute float aRho; attribute float aU;
  uniform float uBeta; uniform float uAxis;
  varying float vU; varying float vR;
  void main() {
    float th = -uBeta * aU; // behind the blade: toward −x
    vec3 p = vec3(aRho * sin(th), aRho * cos(th) - uAxis, 0.0);
    vU = aU; vR = aRho;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;
const FAN_FS = /* glsl */ `
  uniform vec3 uColor; uniform float uAmt; uniform float uTip; uniform float uDark;
  varying float vU; varying float vR;
  void main() {
    float u = clamp(vU, 0.0, 1.0);
    float a;
    if (uTip > 0.5) {
      // the tip's trail: a bright core at the tip's radius, a long tail
      float core = 1.0 - smoothstep(0.0, 1.0, abs(vR - 4050.0) / 70.0);
      a = uAmt * pow(1.0 - u, 1.25) * core;
    } else {
      float r = clamp((vR - 450.0) / 3650.0, 0.0, 1.0);
      a = uAmt * pow(1.0 - u, 1.6) * smoothstep(0.0, 0.12, r) * (0.25 + 0.75 * r) * (1.0 - smoothstep(0.93, 1.0, r));
    }
    if (a < 0.002) discard;
    if (uDark > 0.5) gl_FragColor = vec4(0.0, 0.0, 0.0, clamp(a, 0.0, 1.0));
    else gl_FragColor = vec4(uColor * a, 1.0);
  }`;
function fanGeometry(r0, r1, nr, nu) {
  const rho = [], uu = [], pos = [], index = [];
  for (let i = 0; i <= nr; i++) {
    for (let j = 0; j <= nu; j++) {
      const r = mix(r0, r1, i / nr), u = j / nu;
      rho.push(r); uu.push(u);
      const th = -0.2 * u;
      pos.push(r * Math.sin(th), r * Math.cos(th) - AXIS, 0);
    }
  }
  for (let i = 0; i < nr; i++) {
    for (let j = 0; j < nu; j++) {
      const a = i * (nu + 1) + j, b = a + 1, c = a + nu + 1, d = c + 1;
      index.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aRho", new THREE.Float32BufferAttribute(rho, 1));
  g.setAttribute("aU", new THREE.Float32BufferAttribute(uu, 1));
  g.setIndex(index);
  return g;
}
function fanMaterial({ dark = false, tip = false } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBeta: { value: 0 }, uAxis: { value: AXIS }, uAmt: { value: 0 }, uTip: { value: tip ? 1 : 0 }, uDark: { value: dark ? 1 : 0 },
      uColor: { value: new THREE.Color(BRAND.ink) },
    },
    vertexShader: FAN_VS,
    fragmentShader: FAN_FS,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: dark ? THREE.NormalBlending : THREE.AdditiveBlending,
  });
}

/* ───────────── the ladder: a ribbon whose rungs are drawn by the shader ───────────── */
const LADDER_VS = /* glsl */ `
  attribute float aY; attribute float aX; varying float vY; varying float vX;
  void main() { vY = aY; vX = aX; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const LADDER_FS = /* glsl */ `
  uniform vec3 uColor; uniform float uAmt; varying float vY; varying float vX;
  void main() {
    if (uAmt < 0.003) discard;
    float s = vY / 30.0;
    float w = max(fwidth(s), 1e-4);
    float d = min(fract(s), 1.0 - fract(s));
    float rung = 1.0 - smoothstep(0.07, 0.07 + w * 1.3, d);
    rung = mix(rung, 0.14, smoothstep(0.12, 0.4, w)); // finer than the pixel: its mean, not a moiré
    float ax = abs(vX);
    float wx = max(fwidth(vX), 1e-4);
    float rail = smoothstep(0.84 - wx, 0.84 + wx, ax);
    rail = mix(rail, 0.16, smoothstep(0.12, 0.4, wx));
    float a = uAmt * max(rail * 0.85, rung * 0.55);
    gl_FragColor = vec4(uColor * a, 1.0);
  }`;
function ladderRibbon(y0, y1, mat) {
  // on the road side (TOWER.ladder.az), `inset` inside the skin: the ribbon leans with the cone
  const az = TOWER.ladder.az * DEG;
  const n = [Math.sin(az), Math.cos(az)]; // outward
  const t = [Math.cos(az), -Math.sin(az)]; // across
  const half = 22;
  const pos = [], ay = [], ax = [];
  for (const y of [y0, y1]) {
    const r = rAt(y) - TOWER.ladder.inset;
    for (const s of [-1, 1]) {
      pos.push(n[0] * r + t[0] * half * s, y, n[1] * r + t[1] * half * s);
      ay.push(y); ax.push(s);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aY", new THREE.Float32BufferAttribute(ay, 1));
  g.setAttribute("aX", new THREE.Float32BufferAttribute(ax, 1));
  g.setIndex([0, 2, 1, 1, 2, 3]);
  const m = new THREE.Mesh(g, mat);
  m.renderOrder = 5;
  m.frustumCulled = false;
  return m;
}

/* ───────────── small helpers ───────────── */
const circle = (r, y, n = 64, arc = 1, a0 = 0) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (i / n) * Math.PI * 2 * arc;
    pts.push([Math.sin(a) * r, y, Math.cos(a) * r]);
  }
  return pts;
};
/** A soft point of light (a gradient, never a flat disc): additive sprite. */
function glowSprite(color, soft = 0) {
  const N = 64;
  const data = new Uint8Array(N * N * 4);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const dx = (i + 0.5) / N * 2 - 1, dy = (j + 0.5) / N * 2 - 1;
      const r = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      const v = soft ? Math.pow(1 - r, 1.7) * (1 - r * r * 0.15) : Math.pow(1 - r, 2.4) * 0.75 + Math.pow(1 - r, 9) * 0.25;
      const k = (j * N + i) * 4;
      data[k] = data[k + 1] = data[k + 2] = Math.round(255 * v);
      data[k + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, N, N);
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(color), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false });
  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 6;
  sprite.userData.hue = new THREE.Color(color);
  return sprite;
}
const lightSprite = (s, k) => { s.material.color.copy(s.userData.hue).multiplyScalar(k); s.visible = k > 0.004; };
function segmentsLine(pairs, color, width, opacity) {
  const g = new LineSegmentsGeometry();
  g.setPositions(pairs.flat(2));
  const l = new LineSegments2(g, lineMat(color, width, { opacity }));
  l.renderOrder = 3;
  return l;
}

export function buildTurbine() {
  const group = new THREE.Group();

  /* ───────────── the tower ───────────── */
  const towerMat = glass(BRAND.ink, { base: 0.003, rim: 0.24, power: 2.6, edge: 0.42, through: 0.32 });
  const rF = rAt(FOLD.y);
  const lower = new THREE.Group();
  group.add(lower);
  const lowerSkin = new THREE.Mesh(new THREE.CylinderGeometry(rF, TOWER.r0, FOLD.y, 56, 1, true), towerMat);
  lowerSkin.position.y = FOLD.y / 2;
  lower.add(lowerSkin);
  // the upper half: hinge (turned toward the fall) → pivot on the skin → bend → back (the tower's own frame again)
  const hinge = new THREE.Group();
  hinge.position.y = FOLD.y;
  hinge.rotation.y = FOLD.toward * DEG;
  const pivot = new THREE.Group();
  pivot.position.z = rF;
  hinge.add(pivot);
  const bend = new THREE.Group();
  pivot.add(bend);
  const unpivot = new THREE.Group();
  unpivot.position.z = -rF;
  bend.add(unpivot);
  const back = new THREE.Group();
  back.rotation.y = -FOLD.toward * DEG;
  unpivot.add(back);
  group.add(hinge);
  const H2 = TOWER.top - FOLD.y;
  const upperSkin = new THREE.Mesh(new THREE.CylinderGeometry(TOWER.r1, rF, H2, 56, 1, true), towerMat);
  upperSkin.position.y = H2 / 2;
  back.add(upperSkin);
  asShell([lowerSkin, upperSkin], ORDER.tower);

  // the flanges: rings at each section's joint; the top flange carries the yaw bearing
  const ringMat = lineMat(BRAND.ink, 2, { opacity: 0.55 });
  const ringLines = [];
  const ring = (parent, r, y, mat = ringMat) => {
    const l = fatLine(circle(r + 2, y, 72), { width: 2 });
    l.material = mat;
    parent.add(l);
    ringLines.push(l);
    return l;
  };
  for (let k = 0; k <= TOWER.sections; k++) {
    const y = (k / TOWER.sections) * TOWER.top;
    if (Math.abs(y - FOLD.y) < 60) continue; // the hinge has its own two rings
    if (y < FOLD.y) ring(lower, rAt(y), Math.max(4, y));
    else ring(back, rAt(y), y - FOLD.y);
  }
  // the hinge: a ring on each side of the cut, ink → signal as it folds; a glow where it tears
  const hingeMat = lineMat(BRAND.ink, 2.4, { opacity: 0.6 });
  ring(lower, rF, FOLD.y - 6, hingeMat);
  ring(back, rF, 6, hingeMat);
  const tear = glowSprite(BRAND.signal);
  tear.scale.set(760, 760, 1);
  tear.position.set(0, 0, 0);
  pivot.add(tear);
  // landings: a half floor at every flange inside, on the ladder's side
  const landMat = lineMat(BRAND.ink, 1.8, { opacity: 0.28 });
  for (let k = 1; k < TOWER.sections; k++) {
    const y = (k / TOWER.sections) * TOWER.top;
    if (Math.abs(y - FOLD.y) < 60) continue;
    const l = fatLine(circle(rAt(y) * 0.72, y < FOLD.y ? y : y - FOLD.y, 24, 0.5, (TOWER.ladder.az - 90) * DEG));
    l.material = landMat;
    (y < FOLD.y ? lower : back).add(l);
  }
  // the door at the foot, toward the road
  const doorPts = [];
  {
    const a0 = TOWER.door.az * DEG, half = TOWER.door.w / 2 / TOWER.r0, r = TOWER.r0 + 3;
    const P = (a, y) => [Math.sin(a) * r, y, Math.cos(a) * r];
    doorPts.push(P(a0 - half, 2), P(a0 - half, TOWER.door.h));
    for (let i = 1; i <= 6; i++) doorPts.push(P(a0 - half + (2 * half * i) / 6, TOWER.door.h + Math.sin((i / 6) * Math.PI) * 14));
    doorPts.push(P(a0 + half, 2));
  }
  const door = fatLine(doorPts, { width: 2.2, opacity: 0.8 });
  lower.add(door);
  // the ladder: two ribbons (the upper one folds)
  const ladderMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(BRAND.ink) }, uAmt: { value: 0.5 } },
    vertexShader: LADDER_VS, fragmentShader: LADDER_FS,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  lower.add(ladderRibbon(0, FOLD.y - 10, ladderMat));
  const upLadder = ladderRibbon(FOLD.y + 10, TOWER.top - 40, ladderMat);
  upLadder.position.y = -FOLD.y;
  back.add(upLadder);

  // the nacelle's frame rides the upper half
  const topA = new THREE.Group();
  topA.position.y = H2;
  topA.rotation.y = TURBINE.heading * DEG;
  back.add(topA);
  const dress = dressTurbine({ top: topA }); group.add(dress.group); // habillage.js

  /* ───────────── the ground: the crane pad and the access track, lines only ───────────── */
  const pad = [];
  const PAD = { x0: -2200, x1: -500, z0: -700, z1: 1700, step: 425 };
  for (let x = PAD.x0; x <= PAD.x1 + 1; x += PAD.step) pad.push([[x, 3, PAD.z0], [x, 3, PAD.z1]]);
  for (let z = PAD.z0; z <= PAD.z1 + 1; z += (PAD.z1 - PAD.z0) / 6) pad.push([[PAD.x0, 3, z], [PAD.x1, 3, z]]);
  const padLines = segmentsLine(pad, BRAND.ink, 1.8, 0.24);
  group.add(padLines);
  const footing = fatLine(circle(900, 3, 64), { width: 1.8, opacity: 0.3 });
  group.add(footing);
  const track = segmentsLine([
    [[PAD.x0, 3, 300], [-2950, 3, 900]], [[PAD.x0, 3, 900], [-2950, 3, 1500]],
  ], BRAND.ink, 1.8, 0.3);
  group.add(track);

  /* ───────────── the blades ───────────── */
  const bladeGlass = glass(BRAND.ink, { base: 0.004, rim: 0.34, power: 2.3, edge: 0.4, spec: 0.25, through: 0.22 });
  const bladeVeil = new THREE.MeshBasicMaterial({ color: 0x030303, transparent: true, opacity: 0.62, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const leadMat = lineMat(BRAND.ink, 2.4, { opacity: 0.95 });
  const trailMat = lineMat(BRAND.ink, 1.9, { opacity: 0.6 });
  // blade A's own edges: they turn signal while it shudders (« une pale peut lâcher »)
  const leadA = lineMat(BRAND.ink, 2.4, { opacity: 0.95 });
  const trailA = lineMat(BRAND.ink, 1.9, { opacity: 0.6 });
  const segLen = BLADE.len / SEGS;
  const shapes = [];
  for (let s = 0; s < SEGS; s++) shapes.push(bladeSegment(s * segLen, (s + 1) * segLen, s === 0 ? 10 : s === 1 ? 7 : 5, s === SEGS - 1));
  const blades = [];
  const joints = []; // joints[k][s]: the segment groups of blade k
  const fans = [];
  const shells = [];
  for (let k = 0; k < 3; k++) {
    const b = new THREE.Group();
    const chain = [];
    let parent = b;
    for (let s = 0; s < SEGS; s++) {
      const seg = new THREE.Group();
      seg.position.y = s === 0 ? 0 : segLen;
      parent.add(seg);
      const { geometry, lead, trail } = shapes[s];
      const skin = new THREE.Mesh(geometry, bladeGlass);
      const veil = new THREE.Mesh(geometry, bladeVeil);
      veil.renderOrder = ORDER.blades - 3;
      seg.add(veil, skin);
      shells.push(skin);
      const le = fatLine(lead); le.material = k === 0 ? leadA : leadMat;
      const te = fatLine(trail); te.material = k === 0 ? trailA : trailMat;
      le.renderOrder = te.renderOrder = ORDER.blades - 2; // over the dark veil, under the glass
      seg.add(le, te);
      chain.push(seg);
      parent = seg;
    }
    joints.push(chain);
    // the blur rides the blade but stays in the rotor plane: its group cancels the pitch
    const fanFrame = new THREE.Group();
    b.add(fanFrame);
    const fanG = fanGeometry(450, AXIS + BLADE.len - 40, 26, 16);
    const tipG = fanGeometry(3960, 4120, 6, 28);
    const dark = new THREE.Mesh(fanG, fanMaterial({ dark: true }));
    const light = new THREE.Mesh(fanG, fanMaterial());
    const tip = new THREE.Mesh(tipG, fanMaterial({ tip: true }));
    dark.renderOrder = ORDER.blades - 5;
    light.renderOrder = ORDER.blades - 4;
    tip.renderOrder = 7;
    for (const m of [dark, light, tip]) { m.frustumCulled = false; fanFrame.add(m); }
    fans.push({ frame: fanFrame, dark: dark.material.uniforms, light: light.material.uniforms, tip: tip.material.uniforms });
    blades.push(b);
  }
  asShell(shells, ORDER.blades);
  const tipInk = new THREE.Color(BRAND.ink).multiplyScalar(1.5);
  const tipSignal = new THREE.Color(BRAND.signal).multiplyScalar(2.1);
  const fanInk = new THREE.Color(BRAND.ink);

  /* ───────────── the grid: far along the road → the station → buried → the tower's foot ───────────── */
  const path = [];
  {
    const [px, , pz] = MAINS.post;
    const zEnd = pz - 420; // the last pole, beside the station
    const span = (zEnd - MAINS.away[2]) / 8;
    const poleH = 900, sag = 110;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const u = j / 8;
        path.push([px, poleH - sag * 4 * u * (1 - u), MAINS.away[2] + span * (i + u)]);
      }
    }
    path.push([px, poleH, zEnd]);
    path.push([px, MAINS.post_size[1], pz]); // into the station's roof
    path.push([px, 4, pz]);
    const [fx, , fz] = MAINS.foot;
    for (let i = 1; i <= 24; i++) path.push([mix(px, fx, i / 24), 4, mix(pz, fz, i / 24)]);
    path.push([fx * 0.55, 4, fz * 0.55]); // into the foot
  }
  const NSEG = path.length - 1;
  const cum = [0];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  const conductor = fatLine(path, { width: 2.6, opacity: 0.42 });
  const tail = fatLine(path, { color: BRAND.veille, width: 3.4, dashed: true, dashSize: 520, gapSize: 680, hdr: 1.3, opacity: 0.75 });
  const head = fatLine(path, { color: BRAND.veille, width: 4.2, dashed: true, dashSize: 110, gapSize: 1090, hdr: 2.6 });
  group.add(conductor, tail, head);
  const cutSpark = glowSprite(BRAND.signal);
  cutSpark.scale.set(700, 700, 1);
  group.add(cutSpark);
  // the poles along the road and the station (glass), lines only
  const poles = [];
  {
    const [px, , pz] = MAINS.post;
    const zEnd = pz - 420, span = (zEnd - MAINS.away[2]) / 8;
    for (let i = 0; i <= 8; i++) {
      const z = MAINS.away[2] + span * i;
      poles.push([[px, 0, z], [px, 930, z]], [[px - 90, 900, z], [px + 90, 900, z]]);
    }
  }
  const poleLines = segmentsLine(poles, BRAND.ink, 2, 0.4);
  group.add(poleLines);
  const [sw, sh, sd] = MAINS.post_size;
  const stationG = new THREE.BoxGeometry(sw, sh, sd);
  const stationMat = glass(BRAND.ink, { base: 0.004, rim: 0.22, power: 2.4, edge: 0.3 });
  const station = new THREE.Mesh(stationG, stationMat);
  station.position.set(MAINS.post[0] + 60, sh / 2, MAINS.post[2] + sd / 2 + 40);
  const stationEdges = edgesOf(stationG, { width: 2, opacity: 0.7 });
  station.add(stationEdges);
  group.add(station);

  /* ───────────── the reach: a signal arc from a tip's path to your car ───────────── */
  const reachPts = [];
  {
    const [ax, ay, az] = REACH.from, [bx, by, bz] = REACH.to;
    const cx = mix(ax, bx, 0.3), cy = Math.max(ay, by) + 1200, cz = mix(az, bz, 0.3);
    for (let i = 0; i <= 64; i++) {
      const u = i / 64, w = 1 - u;
      reachPts.push([w * w * ax + 2 * w * u * cx + u * u * bx, w * w * ay + 2 * w * u * cy + u * u * by, w * w * az + 2 * w * u * cz + u * u * bz]);
    }
  }
  const reachLine = fatLine(reachPts, { color: BRAND.signal, width: 3.6, dashed: true, dashSize: 300, gapSize: 180, hdr: 1.5 });
  const reachRing = fatLine(circle(560, 6, 64).map(([x, y, z]) => [x + CARAT[0], y, z + CARAT[2]]), { color: BRAND.signal, width: 3, hdr: 1.4 });
  const reachRing2 = fatLine(circle(820, 6, 64).map(([x, y, z]) => [x + CARAT[0], y, z + CARAT[2]]), { color: BRAND.signal, width: 2, hdr: 1, opacity: 0.5 });
  group.add(reachLine, reachRing, reachRing2);

  /* ───────────── the technician on the ladder ───────────── */
  const fig = makeFigure({ shell: true, order: ORDER.tech, glassK: 0.9 });
  fig.ghost(true);
  fig.group.rotation.y = TOWER.ladder.az * DEG; // facing the ladder, outward
  group.add(fig.group);
  const hand = { L: new THREE.Vector3(), R: new THREE.Vector3() };
  const foot = { L: new THREE.Vector3(), R: new THREE.Vector3() };

  /* ───────────── anchors ───────────── */
  const ladAz = TOWER.ladder.az * DEG, doorAz = TOWER.door.az * DEG;
  const A = { top: topA, foot: new THREE.Object3D(), door: new THREE.Object3D(), ladder: new THREE.Object3D() };
  A.door.position.set(Math.sin(doorAz) * TOWER.r0, TOWER.door.h / 2, Math.cos(doorAz) * TOWER.r0);
  A.ladder.position.set(Math.sin(ladAz) * (TOWER.r0 - TOWER.ladder.inset), 0, Math.cos(ladAz) * (TOWER.r0 - TOWER.ladder.inset));
  group.add(A.foot, A.door, A.ladder);

  /* ───────────── the halo: the storm's sky lit behind the rotor, seen from the road ───────────── */
  // a soft glow far behind the hub (along the road's line of sight): the blades and the hub read dark on it.
  // signal while the storm threatens (mood 1), a dim ink cloud when the scene is calm (mood 0)
  // It stands on the camera's line through the hub, twice as far: wherever the camera is, the hub sits in its heart.
  // Faded on the close shots (the hub's own light takes over). Its draw also says whether the camera is INSIDE the
  // tower (the ladder's shot): from within, the cone's skin is all grazing — its glass is dimmed there.
  const halo = glowSprite(BRAND.signal, 1);
  halo.material.depthWrite = false;
  halo.renderOrder = -8;
  halo.frustumCulled = false;
  group.add(halo);
  const haloSignal = new THREE.Color(BRAND.signal).multiplyScalar(0.46), haloInk = new THREE.Color(BRAND.ink).multiplyScalar(0.2);
  const haloBase = new THREE.Color();
  const HUB_LOCAL = new THREE.Vector3(0, 250, 380);
  const camW = new THREE.Vector3(), hubW = new THREE.Vector3(), camL = new THREE.Vector3();
  halo.onBeforeRender = (renderer, scene, camera) => {
    camW.setFromMatrixPosition(camera.matrixWorld);
    camL.copy(camW);
    group.worldToLocal(camL);
    const inside = camL.y > 0 && camL.y < TOWER.top && Math.hypot(camL.x, camL.z) < rAt(camL.y) + 40;
    towerMat.uniforms.uGain.value = inside ? 0.28 : 1;
    topA.localToWorld(hubW.copy(HUB_LOCAL));
    const dHub = Math.max(1, camW.distanceTo(hubW));
    group.worldToLocal(hubW);
    camL.sub(hubW).multiplyScalar(-0.95); // from the hub, away from the camera
    halo.position.copy(hubW).add(camL);
    const size = Math.min(11500, 0.85 * dHub) * 1.95;
    halo.scale.set(size * 1.15, size, 1);
    halo.material.color.copy(haloBase).multiplyScalar(smooth(3500, 8000, dHub));
    halo.updateMatrixWorld();
  };

  const hingeInk = new THREE.Color(BRAND.ink), hingeSignal = new THREE.Color(BRAND.signal).multiplyScalar(1.6);

  return {
    group, A, blades,
    update({ tower: tw = 1, blades: bl = 1, rpm = 0, pitchA = 0, pitchB = 0, pitchC = 0, shake = 0, reach = 0, mains = 1, fold = 0, tech = 0, mood = 1, flow = 0 } = {}, time = 0) {
      /* the tower */
      const T = clamp01(tw);
      const towerOn = T > 0.01;
      lower.visible = towerOn;
      back.visible = towerOn;
      towerMat.uniforms.uAmount.value = T;
      ringMat.opacity = 0.55 * T;
      landMat.opacity = 0.28 * T;
      door.material.opacity = 0.8 * T;
      ladderMat.uniforms.uAmt.value = 0.5 * T;
      padLines.visible = footing.visible = track.visible = towerOn;
      padLines.material.opacity = 0.24 * T;
      // the fold: the upper half opens on its hinge, away from the road
      const f = clamp01(fold);
      bend.rotation.x = f * FOLD.max * DEG;
      const hot = smooth(0, 0.08, f);
      hingeMat.color.lerpColors(hingeInk, hingeSignal, hot);
      hingeMat.opacity = mix(0.6, 1, hot) * T;
      lightSprite(tear, hot * (0.75 - 0.35 * smooth(0.3, 1, f)) * T);

      halo.visible = T > 0.01 || bl > 0.01;
      haloBase.lerpColors(haloInk, haloSignal, clamp01(mood)).multiplyScalar(Math.max(T, clamp01(bl)));

      /* the blades */
      const B = clamp01(bl);
      const bladesOn = B > 0.01;
      bladeGlass.uniforms.uAmount.value = B;
      bladeVeil.opacity = 0.62 * B;
      leadMat.opacity = leadA.opacity = 0.95 * B;
      trailMat.opacity = trailA.opacity = 0.6 * B;
      const spin = Math.max(0, rpm);
      const beta = spin * 0.55 * DEG;
      const blur = smooth(3.6, 8, spin) * B;
      const hotTip = smooth(12.7, 13.3, spin);
      for (let k = 0; k < 3; k++) {
        blades[k].visible = bladesOn;
        const pitch = k === 0 ? pitchA : k === 1 ? pitchB : pitchC;
        const F = fans[k];
        F.frame.rotation.y = pitch * DEG; // back in the rotor plane
        const face = 1 - 0.7 * Math.abs(Math.sin(pitch * DEG)); // feathered, a blade sweeps less of the sky
        F.dark.uBeta.value = F.light.uBeta.value = beta;
        F.dark.uAmt.value = 0.5 * blur * face;
        F.light.uAmt.value = 0.2 * blur * face;
        F.light.uColor.value.copy(fanInk);
        F.tip.uBeta.value = beta * 2.4;
        F.tip.uAmt.value = blur;
        F.tip.uColor.value.lerpColors(tipInk, tipSignal, hotTip);
      }
      // blade A shudders: a bend that runs along it, ≈ 1 m at the tip at shake 1
      const sh = clamp01(shake);
      const chain = joints[0];
      for (let s = 1; s < SEGS; s++) {
        const w = Math.sin(time * 2 * Math.PI * 2.1 - s * 0.35); // a quarter of a wave along it: the tip swings
        // mostly in the rotor plane (edgewise: what a camera in front of the rotor sees), a little flapwise
        chain[s].rotation.z = sh * (0.003 + 0.02 * w);
        chain[s].rotation.x = sh * 0.006 * Math.sin(time * 2 * Math.PI * 2.1 - s * 0.35 + 1.3);
      }
      leadA.color.lerpColors(hingeInk, hingeSignal, smooth(0, 0.5, sh));
      trailA.color.lerpColors(hingeInk, hingeSignal, smooth(0, 0.5, sh));
      // the principle (flow > 0.01): blade A keeps only its part on the hub's side of the section (SECTION.y) — seen
      // from VIEW.section, its outer half would pass in front of the cut as a pale diagonal band
      const cutA = flow > 0.01;
      const sCut = Math.floor(SECTION.y / segLen);
      chain[sCut + 1].visible = !cutA; // its children (the segments beyond) go with it
      chain[sCut].scale.y = cutA ? (SECTION.y - sCut * segLen) / segLen : 1;

      /* the grid */
      const m = clamp01(mains);
      dress.update({ tower: T, mains: m }, time); // habillage.js
      const live = Math.ceil(m * NSEG - 1e-4);
      tail.visible = head.visible = live > 0;
      tail.geometry.instanceCount = live;
      head.geometry.instanceCount = live;
      const run = time * 3000;
      tail.material.dashOffset = run;
      head.material.dashOffset = run;
      conductor.material.opacity = 0.42 * T + 0.1;
      // the cut runs from the foot: a short signal spark on its front
      const spark = 4 * m * (1 - m);
      if (spark > 0.01) {
        const target = cum[NSEG] * m; // distance from the far end (the path is reversed)
        let i = 1;
        while (i < NSEG && cum[i] < target) i++;
        const a = path[i - 1], b = path[i];
        const u = clamp01((target - cum[i - 1]) / Math.max(1, cum[i] - cum[i - 1]));
        cutSpark.position.set(mix(a[0], b[0], u), mix(a[1], b[1], u) + 40, mix(a[2], b[2], u));
      }
      lightSprite(cutSpark, spark * 2.2);

      /* the reach */
      const r = clamp01(reach);
      reachLine.visible = r > 0.005;
      reachLine.geometry.instanceCount = Math.round(r * 64);
      reachLine.material.dashOffset = -time * 1400;
      const ringK = smooth(0.82, 1, r);
      reachRing.visible = reachRing2.visible = ringK > 0.005;
      reachRing.material.opacity = ringK;
      reachRing2.material.opacity = 0.5 * ringK * (0.6 + 0.4 * Math.sin(time * 2 * Math.PI * 0.8));

      /* the technician */
      const on = tech > 0.004 && towerOn && f < 0.01;
      fig.group.visible = on;
      if (on) {
        fig.body.uniforms.uAmount.value = T * smooth(0.004, 0.03, tech);
        const y = mix(12, TOWER.top - 240, clamp01(tech));
        const rr = rAt(y) - TOWER.ladder.inset - 30;
        fig.group.position.set(Math.sin(ladAz) * rr, y, Math.cos(ladAz) * rr);
        const ph = tech * 18 * 2 * Math.PI;
        const s = Math.sin(ph);
        hand.L.set(21, 168 + 20 * s, 27);
        hand.R.set(-21, 168 - 20 * s, 27);
        foot.L.set(9, 14 - 16 * s, 22);
        foot.R.set(-9, 14 + 16 * s, 22);
        fig.reach("L", hand.L);
        fig.reach("R", hand.R);
        fig.leg("L", foot.L);
        fig.leg("R", foot.R);
      }
    },
  };
}
