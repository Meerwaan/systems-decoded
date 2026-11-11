// DOSSIER 043 — sortie.js : THE SYSTEM, solid — point 6, the way out (docs/043-decors.md § sortie.js).
//
//   buildSortie() → { group, A, update(p, time, px, eye) }
//   p = { cavern, explode, litKick, litSepta, litLine, litDil, litBlock, arm, kick, septa, dil, route, paint, heat, point,
//         crack, pool, dump, beam, sweep }   (sweep > 0: the repos ghost — the fired kickers glow signal, not veille)
//   A = anchors (world cm): kick (the kicker row's centre), septa, branch, dilution, face (centre of the core's entrance
//       face), block (its middle), spot (where the principle's single point strikes), halo
//
// SOLID (three greys, fine edges, metal ≤ 0.5): the 15 kickers (MKD) round the ring pipe at S6 (tanks, flanges, bellows,
// pumping port, the HV feedthrough's ceramic on top — the lightest grey), the 15 septa (C-yokes, the line in their slot),
// the 10 dilution magnets (window frames: 4 with a horizontal gap, 6 with a vertical one, their poles lighter), the
// graphite core of the block (segments of different greys). X-RAY (glass + asShell, fine lines, a grid for a floor):
// the line's pipe (straight, then widening), its tunnel, the steel vessel of the block (flanges, dished end), its
// saddles, the cavern and its shielding (iron, concrete).
// LIGHT: the kickers' veille breath and their cascade (signal while `sweep` > 0), the septa's slot, the dilution's
// travelling wave and the dot that sweeps each gap, the route (a head of veille light and its line), the stream (the
// train's white bunches leaving the ring, fanning out after the dilution magnets toward THEIR point of the « e »), the
// « e » and the heat (a shader on the face: the distance to the drawn bar and arc, orange that cools behind the head —
// never white), the principle's ghost (one signal point, a thin signal beam, cracks that run out and go dark; no hole).
//
// THE STREAM AND THE RING. anneau.js hides the bunches k < dump·n (they have passed S6). Here bunch q (its fraction of
// the train) stands at u = (dump·(1+LAG) − q)·P along the way out (P = C − gap: the same pace and spacing as in the
// ring), LAG = the line's length / P. So the head is at the face when dump = 1 − ... and the LAST bunch reaches the
// face at dump = 1. The « e » is painted by the bunch at the face: e = max(paint, dump·(1+LAG) − LAG).
// The way out (`pathAt`) slides from the ring pipe to the straight line between u 0 and the first septum: the straight
// line at its exaggerated 3° would leave the kicker tanks after the tenth.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, fatLine, setGlow, edgesOf, box, cyl, lathe, makePart, addMesh, explode } from "@kit/build3d.js";
import { makePool, makeContact } from "@kit/atmo.js";
import { dressCavern } from "./habillage.js";
import { rng } from "@kit/rng.js";
import { S6, KICKERS, SEPTA, BRANCH, DILUTION, LINE, LINE_DIR, BLOCK, ETRACE, CAVERN, HALO, BEAM, C, ringAt, lineAt } from "./plan.js";

const UP = new THREE.Vector3(0, 1, 0);
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const INK = new THREE.Color(BRAND.ink), VEI = new THREE.Color(BRAND.veille), SIG = new THREE.Color(BRAND.signal);
const CRACK_HOT = SIG.clone().multiplyScalar(1.5), CRACK_DARK = new THREE.Color(0x140d0a);
const H2 = (BRAND.H / 2).toFixed(1);

/* three greys (+ the darkest for what carries them) */
const G_DARK = 0x303336, G_BODY = 0x5b5e62, G_LIGHT = 0x8d9094, G_HERO = 0xb0b2b4;

/* ── the « e », in the face's frame (cm; x right looking downstream, y up): the bar, then the loop, open at the lower right */
const E_AMAX = 1.85 * Math.PI;
const E_LEN = ETRACE.bar + E_AMAX * ETRACE.loop; // ≈ 117 cm: the source's 1.2 m
function eAt(q, out) {
  const s = clamp01(q) * E_LEN;
  if (s <= ETRACE.bar) {
    out[0] = -ETRACE.bar / 2 + s;
    out[1] = 0;
  } else {
    const a = (s - ETRACE.bar) / ETRACE.loop;
    out[0] = ETRACE.loop * Math.cos(a);
    out[1] = ETRACE.loop * Math.sin(a);
  }
  return out;
}

/* ── the way out: from the ring pipe at S6 to the straight line, blended until the first septum */
const RB = { p: [0, 0, 0], t: [0, 0, 0], n: [0, 0, 0], th: 0 };
const LB = [0, 0, 0];
function pathAt(u, out) {
  const w = smooth(0, SEPTA.from, u);
  ringAt(S6 + u, RB);
  lineAt(u, LB);
  out[0] = RB.p[0] + (LB[0] - RB.p[0]) * w;
  out[1] = 0;
  out[2] = RB.p[2] + (LB[2] - RB.p[2]) * w;
  return out;
}

/* ── the line's pipe: r0 through the septa and the dilution magnets, then it widens to r1 before the block */
const PIPE_END = BLOCK.u - 40, PIPE_WIDE = 1650;
const pipeR = (u) => LINE.pipe.r0 + (LINE.pipe.r1 - LINE.pipe.r0) * clamp01((u - PIPE_WIDE) / (PIPE_END - PIPE_WIDE));
const TUN0 = 1000; // the line's own tunnel leaves the ring's here (before, the septa stand in the ring's tunnel)
const CAV0 = BLOCK.u + BLOCK.len / 2 - CAVERN.len / 2, CAV1 = CAV0 + CAVERN.len, CAV_TOP = CAVERN.floor + CAVERN.h;
const FAN0 = DILUTION.from + DILUTION.period * ((DILUTION.h + DILUTION.v) / 2); // where the sweep starts to tell

/* ── the train's pace, the same as anneau.js */
const PLACES = BEAM.places, WAGON = BEAM.perWagon + BEAM.between;
const PTRAIN = C - BEAM.gap; // = places · slot
const LAG = BLOCK.u / PTRAIN;
const STREAM_MAX = 360;

/* ── recopied (022/model.js): a ball of light with no edge, always facing the eye */
const lightMaterial = (uniforms, vertexShader, fragmentShader, o = {}) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms, vertexShader, fragmentShader, ...o });
const lightMesh = (geometry, material, order = 4) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
};
function makeBall(heart, hue, through = false) {
  const mesh = lightMesh(
    new THREE.PlaneGeometry(2, 2),
    lightMaterial(
      { uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
      /* glsl */ `
      uniform float uRadius, uMinPx; varying vec2 vUv;
      void main() {
        vUv = position.xy;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        c.xy += position.xy * r;
        gl_Position = projectionMatrix * c;
      }`,
      /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        float core = exp(-r2 / 0.012);
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
        gl_FragColor = vec4((uHeart * (core * 2.4) + uHue * (body + tail)) * uAmount, 1.0);
      }`,
      { depthTest: !through },
    ),
    8,
  );
  mesh.visible = false;
  return mesh;
}
const shine = (ball, amount, radius, minPx = 0) => {
  ball.visible = amount > 0.004;
  ball.material.uniforms.uAmount.value = amount;
  ball.material.uniforms.uRadius.value = radius;
  ball.material.uniforms.uMinPx.value = minPx;
};

/* ── a floor grid (no solid floor in an X-ray decor): fine lines that melt away before they turn into a veil */
function gridMat(cell, half) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(BRAND.ink) }, uCell: { value: cell }, uHalf: { value: new THREE.Vector2(half[0], half[1]) }, uAmount: { value: 0.1 } },
    vertexShader: /* glsl */ `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uCell, uAmount; uniform vec2 uHalf; varying vec2 vP;
      float lines(float x, float cell) {
        float q = x / cell;
        float w = max(fwidth(q) * 1.8, 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        return (1.0 - smoothstep(0.0, w, d)) * (1.0 - smoothstep(0.12, 0.35, w));
      }
      float grid(vec2 p, float cell) { return max(lines(p.x, cell), lines(p.y, cell)); }
      void main() {
        float g = 0.45 * grid(vP, uCell) + grid(vP, uCell * 5.0);
        vec2 e = 1.0 - smoothstep(uHalf * 0.7, uHalf, abs(vP));
        gl_FragColor = vec4(uColor * g * e.x * e.y * uAmount, 1.0);
      }`,
  });
}

/* ── the face: the « e » and its heat, the principle's single point. Additive, over the graphite. */
function faceMat() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uProg: { value: 0 }, uHeat: { value: 0 }, uPoint: { value: 0 },
      uBar: { value: ETRACE.bar }, uR: { value: ETRACE.loop }, uAmax: { value: E_AMAX }, uLen: { value: E_LEN },
      uHot: { value: new THREE.Color(1.0, 0.43, 0.15) }, uCool: { value: SIG.clone() },
    },
    vertexShader: /* glsl */ `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uProg, uHeat, uPoint, uBar, uR, uAmax, uLen; uniform vec3 uHot, uCool; varying vec2 vP;
      // the nearest point of the DRAWN e (the bar, then the arc, cut at sh cm of trace): (distance, cm of trace there)
      vec2 nearestE(vec2 p, float sh) {
        float x0 = -0.5 * uBar;
        float cx = clamp(p.x, x0, x0 + min(uBar, sh));
        vec2 best = vec2(length(p - vec2(cx, 0.0)), cx - x0);
        if (sh > uBar) {
          float aEnd = min(uAmax, (sh - uBar) / uR);
          vec2 q = p + vec2(1e-4, 1e-4);
          float a = atan(q.y, q.x);
          if (a < 0.0) a += 6.2831853;
          float d; float s;
          if (a <= aEnd) { d = abs(length(p) - uR); s = uBar + a * uR; }
          else {
            float de = length(p - uR * vec2(cos(aEnd), sin(aEnd)));
            float ds = length(p - vec2(uR, 0.0));
            if (de < ds) { d = de; s = uBar + aEnd * uR; } else { d = ds; s = uBar; }
          }
          if (d < best.x) best = vec2(d, s);
        }
        return best;
      }
      void main() {
        vec3 col = vec3(0.0);
        if (uProg > 0.001) {
          float sh = uProg * uLen;
          vec2 n = nearestE(vP, sh);
          // 0 at the head, 1 forty-five cm behind it; all of it once the e is whole (it cools as one)
          float age = max(clamp((sh - n.y) / 45.0, 0.0, 1.0), smoothstep(0.97, 1.0, uProg));
          float heat = clamp(uHeat, 0.0, 1.0);
          float w = 1.1 + 1.4 * heat;
          float w2 = 4.0 + 9.0 * heat;
          float core = exp(-n.x * n.x / (w * w));
          float halo = exp(-n.x * n.x / (w2 * w2));
          float k = 0.22 + 1.1 * heat;
          // the halo keeps ONE colour: where the nearest point jumps from the bar to the loop, an age-coloured halo shows a seam
          col += k * (mix(uHot, uCool, age) * core * (0.8 + 0.25 * (1.0 - age)) + uCool * 0.3 * halo);
        }
        if (uPoint > 0.001) {
          float r2 = dot(vP, vP);
          col += vec3(1.0, 0.42, 0.2) * uPoint * (1.5 * exp(-r2 / 6.0) + 0.3 * exp(-r2 / 70.0));
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

/** Points of a circle of radius r round the line's axis, at u (line frame: x left, y up, z = u). */
const circle = (r, u, n = 48, y0 = 0) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    pts.push([r * Math.cos(a), y0 + r * Math.sin(a), u]);
  }
  return pts;
};
const worldLine = (points, color, width, o = {}) => {
  const l = fatLine(points, { color, width, ...o });
  l.material.worldUnits = true;
  return l;
};

export function buildSortie() {
  const group = new THREE.Group();
  group.name = "sortie";
  const m4 = new THREE.Matrix4();
  const K = ringAt(S6).p.slice();
  const dir = new THREE.Vector3(...LINE_DIR);
  const LX = new THREE.Vector3().crossVectors(UP, dir).normalize(); // the line frame's x: LEFT, looking downstream

  /* the line frame: everything along the line lives here, at (x left, y up, z = u) */
  const line = new THREE.Group();
  line.name = "line";
  line.position.set(...K);
  line.quaternion.setFromRotationMatrix(m4.makeBasis(LX, UP, dir));
  line.updateMatrix();
  const toLine = line.matrix.clone().invert();
  group.add(line);
  const habit = dressCavern(); line.add(habit.group); // the cavern's life (habillage.js)

  const parts = []; // what lifts in the exploded view
  const delayAt = (u) => 0.4 * clamp01((u + 210) / 1800); // the cascade runs down the line
  const cavLines = [], pipeLines = [], vesLines = []; // fine lines that go with their shell
  const keepLine = (list, obj) => {
    list.push(obj.material);
    return obj;
  };

  /* ═══ the 15 kickers (MKD) round the ring pipe, centred on S6 ═══ */
  const L2 = KICKERS.len / 2;
  const bellowsGeo = (() => {
    const pr = [[0, -2]];
    for (let i = 0; i <= 8; i++) pr.push([i % 2 ? 7.4 : 6.3, -2 + i * 0.5]);
    pr.push([0, 2]);
    return lathe(pr, 40).rotateX(Math.PI / 2);
  })();
  const insulatorGeo = lathe(
    [[0, 0], [3, 0], [3, 1], [4.3, 1.6], [3, 2.6], [3, 3.4], [4.3, 4], [3, 5], [3, 5.8], [4.3, 6.4], [3, 7.4], [3, 8.2], [4.3, 8.8], [3, 9.8], [3, 11], [0, 11]],
    40,
    { crease: 30 },
  );
  const kick = [];
  for (let i = 0; i < KICKERS.count; i++) {
    const uK = (i - (KICKERS.count - 1) / 2) * KICKERS.period;
    const r = ringAt(S6 + uK);
    const t = new THREE.Vector3(r.t[0], 0, r.t[2]);
    const holder = new THREE.Group();
    holder.position.set(...r.p);
    holder.quaternion.setFromRotationMatrix(m4.makeBasis(new THREE.Vector3().crossVectors(UP, t).normalize(), UP, t));
    const part = makePart(`kicker${i}`, { lift: 46, delay: delayAt(uK), span: 0.5 });
    holder.add(part);
    group.add(holder);
    parts.push(part);
    const body = solid(G_BODY, { rough: 0.5, metal: 0.35 });
    body.emissive = VEI.clone();
    body.emissiveIntensity = 0;
    const light = solid(G_LIGHT, { rough: 0.42, metal: 0.4 });
    const hero = solid(G_HERO, { rough: 0.32, metal: 0.05 });
    addMesh(part, cyl(KICKERS.r, KICKERS.len - 3, 0.6, 48).rotateX(Math.PI / 2), body);
    for (const z of [-L2 + 1, L2 - 1]) addMesh(part, cyl(KICKERS.r + 1.8, 2, 0.4, 48).rotateX(Math.PI / 2).translate(0, 0, z), light);
    if (i < KICKERS.count - 1) addMesh(part, bellowsGeo, light, { pos: [0, 0, KICKERS.period / 2], edges: false });
    // the pumping port, outward
    addMesh(part, cyl(3.2, 6, 0.3, 24).rotateZ(Math.PI / 2).translate(KICKERS.r + 2.2, 0, -5), body);
    addMesh(part, cyl(4.8, 1.3, 0.3, 24).rotateZ(Math.PI / 2).translate(KICKERS.r + 5.6, 0, -5), light);
    // the high-voltage feedthrough on top: its flange, its ceramic (the lightest grey), its cap
    addMesh(part, cyl(5.2, 1.4, 0.3, 32).translate(0, KICKERS.r + 0.2, 4), light);
    addMesh(part, insulatorGeo, hero, { pos: [0, KICKERS.r + 0.9, 4], edges: false });
    addMesh(part, cyl(2.5, 2.2, 0.4, 24).translate(0, KICKERS.r + 13, 4), light);
    // its foot
    addMesh(part, box(12, 12, 14, 0.4), body, { pos: [0, -KICKERS.r - 4.5, 0] });
    // the glow round its two flanges: the breath, the firing
    const ring = glow(BRAND.veille, 1.5, { opacity: 0, additive: true });
    for (const z of [-L2 + 1, L2 - 1]) {
      const g = new THREE.Mesh(new THREE.TorusGeometry(KICKERS.r + 1.95, 0.5, 6, 56), ring);
      g.position.z = z;
      part.add(g);
    }
    kick.push({ body, ring });
  }
  { // the girder they stand on, and its legs to the ring tunnel's floor
    const r = ringAt(S6);
    const holder = new THREE.Group();
    holder.position.set(...r.p);
    const t = new THREE.Vector3(r.t[0], 0, r.t[2]);
    holder.quaternion.setFromRotationMatrix(m4.makeBasis(new THREE.Vector3().crossVectors(UP, t).normalize(), UP, t));
    const base = makePart("kickBase");
    const dark = solid(G_DARK, { rough: 0.6, metal: 0.3 });
    addMesh(base, box(18, 8, 470, 0.5), dark, { pos: [0, -KICKERS.r - 14.5, 0] });
    for (const z of [-215, 0, 215]) {
      addMesh(base, box(8, 70, 8, 0.4), dark, { pos: [0, -KICKERS.r - 53.5, z] });
      addMesh(base, box(26, 2, 22, 0.3), dark, { pos: [0, -104, z] });
    }
    holder.add(base);
    group.add(holder);
  }

  /* ═══ the 15 septa (MSD) along the line: C-yokes, the line in their slot, open toward the ring ═══ */
  const septaBody = solid(G_BODY, { rough: 0.55, metal: 0.3 });
  septaBody.emissive = VEI.clone();
  septaBody.emissiveIntensity = 0;
  const septaCoil = solid(G_LIGHT, { rough: 0.45, metal: 0.35 });
  const septaGlow = glow(BRAND.veille, 1.4, { opacity: 0, additive: true });
  const darkLine = solid(G_DARK, { rough: 0.6, metal: 0.3 });
  for (let i = 0; i < SEPTA.count; i++) {
    const u = SEPTA.from + (i + 0.5) * SEPTA.period;
    const holder = new THREE.Group();
    holder.position.set(0, 0, u);
    const part = makePart(`septum${i}`, { lift: 52, delay: delayAt(u), span: 0.5 });
    holder.add(part);
    line.add(holder);
    parts.push(part);
    const L = SEPTA.len;
    addMesh(part, box(7, SEPTA.h, L, 0.5), septaBody, { pos: [7.5, 0, 0] }); // the back
    addMesh(part, box(15, 8, L, 0.5), septaBody, { pos: [-3.5, 9, 0] }); // the jaws, either side of the slot
    addMesh(part, box(15, 8, L, 0.5), septaBody, { pos: [-3.5, -9, 0] });
    addMesh(part, box(11, 15, L + 3, 0.8), septaCoil, { pos: [7.5, 0, 0] }); // its coil round the back
    const slot = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, L), septaGlow);
    slot.position.set(-3.5, 0, 0);
    part.add(slot);
    addMesh(part, box(10, 6, 20, 0.3), darkLine, { pos: [6, -16, 0] }); // the pedestal
  }
  { // their girder and its legs (they stand in the ring's tunnel: its floor)
    const base = makePart("septaBase");
    addMesh(base, box(14, 6, SEPTA.count * SEPTA.period + 20, 0.4), darkLine, { pos: [6, -22, SEPTA.from + (SEPTA.count * SEPTA.period) / 2] });
    for (const u of [SEPTA.from + 20, SEPTA.from + 270, SEPTA.from + 520]) addMesh(base, box(6, 80, 6, 0.3), darkLine, { pos: [6, -65, u] });
    line.add(base);
  }

  /* ═══ the 10 dilution magnets (MKB): window frames, 4 with a wide gap (they sweep across), 6 with a tall one ═══ */
  const dil = [];
  for (let i = 0; i < DILUTION.h + DILUTION.v; i++) {
    const horiz = i < DILUTION.h;
    const u = DILUTION.from + (i + 0.5) * DILUTION.period;
    const holder = new THREE.Group();
    holder.position.set(0, 0, u);
    const part = makePart(`dilution${i}`, { lift: 56, delay: delayAt(u), span: 0.5 });
    holder.add(part);
    line.add(holder);
    parts.push(part);
    const body = solid(G_BODY, { rough: 0.5, metal: 0.3 });
    body.emissive = VEI.clone();
    body.emissiveIntensity = 0;
    const pole = solid(G_LIGHT, { rough: 0.38, metal: 0.4 });
    pole.emissive = VEI.clone();
    pole.emissiveIntensity = 0;
    const W = DILUTION.w, Hh = DILUTION.hgt, L = DILUTION.len;
    const aw = horiz ? 22 : 13, ah = horiz ? 13 : 22;
    const tb = (Hh - ah) / 2, lr = (W - aw) / 2;
    addMesh(part, box(W, tb, L, 0.5), body, { pos: [0, ah / 2 + tb / 2, 0] });
    addMesh(part, box(W, tb, L, 0.5), body, { pos: [0, -ah / 2 - tb / 2, 0] });
    addMesh(part, box(lr, ah, L, 0.4), body, { pos: [aw / 2 + lr / 2, 0, 0] });
    addMesh(part, box(lr, ah, L, 0.4), body, { pos: [-aw / 2 - lr / 2, 0, 0] });
    // the poles, lighter, facing each other across the gap: the long side of the gap is the sweep
    const pg = horiz ? box(aw, 1.6, L + 1, 0.3) : box(1.6, ah, L + 1, 0.3);
    const off = horiz ? [0, ah / 2 - 0.8] : [aw / 2 - 0.8, 0];
    addMesh(part, pg, pole, { pos: [off[0], off[1], 0] });
    addMesh(part, pg.clone(), pole, { pos: [-off[0], -off[1], 0] });
    // the end plates, round the gap
    for (const z of [-L / 2 - 0.8, L / 2 + 0.8]) {
      addMesh(part, box(W + 2, tb + 1, 1.6, 0.3), pole, { pos: [0, ah / 2 + tb / 2, z] });
      addMesh(part, box(W + 2, tb + 1, 1.6, 0.3), pole, { pos: [0, -ah / 2 - tb / 2, z] });
    }
    addMesh(part, box(22, 7, 30, 0.3), darkLine, { pos: [0, -Hh / 2 - 3.5, 0] });
    // the dot that sweeps the gap
    const dotMat = glow(BRAND.veille, 2.2, { opacity: 0, additive: true });
    const dot = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 12), dotMat);
    dot.visible = false;
    part.add(dot);
    dil.push({ horiz, body, pole, dot, dotMat, amp: 0.38 * (horiz ? aw : ah) });
  }
  { // their girder and legs, to the line tunnel's floor
    const base = makePart("dilBase");
    const n = DILUTION.h + DILUTION.v;
    addMesh(base, box(18, 6, n * DILUTION.period + 20, 0.4), darkLine, { pos: [0, -DILUTION.hgt / 2 - 10, DILUTION.from + (n * DILUTION.period) / 2] });
    for (const u of [DILUTION.from + 20, DILUTION.from + 250, DILUTION.from + 480]) addMesh(base, box(6, 85, 6, 0.3), darkLine, { pos: [0, -67.5, u] });
    line.add(base);
  }

  /* ═══ the line, X-ray: the branch's pipe (on the way out), the line's pipe, its flanges and supports ═══ */
  const pipeMat = glass(BRAND.ink, { rim: 0.3, edge: 0.42 });
  const pipes = [];
  {
    const pts = [];
    const w = [0, 0, 0], v = new THREE.Vector3();
    for (let i = 0; i <= 24; i++) {
      pathAt(200 + (i / 24) * (BRANCH.u - 200), w);
      pts.push(v.set(w[0], w[1], w[2]).applyMatrix4(toLine).clone());
    }
    pipes.push(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 4, 14, false), pipeMat));
    const a = new THREE.CylinderGeometry(LINE.pipe.r0, 4, 30, 24, 1, true).rotateX(Math.PI / 2).translate(0, 0, BRANCH.u + 15);
    pipes.push(new THREE.Mesh(a, pipeMat));
    const b = new THREE.CylinderGeometry(LINE.pipe.r0, LINE.pipe.r0, PIPE_WIDE - BRANCH.u - 30, 24, 1, true).rotateX(Math.PI / 2).translate(0, 0, (BRANCH.u + 30 + PIPE_WIDE) / 2);
    pipes.push(new THREE.Mesh(b, pipeMat));
    const c = new THREE.CylinderGeometry(LINE.pipe.r1, LINE.pipe.r0, PIPE_END - PIPE_WIDE, 40, 1, true).rotateX(Math.PI / 2).translate(0, 0, (PIPE_WIDE + PIPE_END) / 2);
    pipes.push(new THREE.Mesh(c, pipeMat));
    for (const m of pipes) line.add(m);
    asShell(pipes, 13);
    for (const u of [BRANCH.u, BRANCH.u + 30, 1300, PIPE_WIDE, 2000, 2350, 2700, PIPE_END]) line.add(keepLine(pipeLines, fatLine(circle(pipeR(u) + 2.2, u, 40), { color: BRAND.ink, width: 2, opacity: 0.5 })));
    // the supports, in lines: a post from the pipe to the floor, a foot
    for (const u of [1750, 2050, 2350, 2650, 2880]) {
      const y0 = -pipeR(u) - 2.2, f = LINE.tunnel.floor;
      line.add(keepLine(cavLines, fatLine([[0, y0, u], [0, f, u]], { color: BRAND.ink, width: 2, opacity: 0.4 })));
      line.add(keepLine(cavLines, fatLine([[-22, f, u], [22, f, u]], { color: BRAND.ink, width: 2, opacity: 0.4 })));
      line.add(keepLine(cavLines, fatLine([[-pipeR(u) - 6, y0 - 4, u], [pipeR(u) + 6, y0 - 4, u]], { color: BRAND.ink, width: 2, opacity: 0.4 })));
    }
  }
  // the line's tunnel (from where it leaves the ring's), rings in lines, a grid for a floor
  const tunnelMat = glass(BRAND.ink, { rim: 0.07, edge: 0.1 });
  const tunLen = CAV0 - TUN0;
  const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(LINE.tunnel.r, LINE.tunnel.r, tunLen, 40, 1, true).rotateX(Math.PI / 2).translate(0, 0, TUN0 + tunLen / 2), tunnelMat);
  line.add(tunnel);
  asShell(tunnel, 18);
  for (let u = TUN0; u <= CAV0; u += 280) line.add(keepLine(cavLines, fatLine(circle(LINE.tunnel.r, u, 56), { color: BRAND.ink, width: 2, opacity: 0.16 })));
  const chord = 2 * Math.sqrt(Math.max(0, LINE.tunnel.r ** 2 - LINE.tunnel.floor ** 2));
  const tunGrid = gridMat(20, [chord / 2, tunLen / 2]);
  {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(chord, tunLen), tunGrid);
    g.rotation.x = -Math.PI / 2;
    g.position.set(0, LINE.tunnel.floor + 0.3, TUN0 + tunLen / 2);
    line.add(g);
  }

  /* ═══ the cavern and its shielding, X-ray ═══ */
  const cavernMat = glass(BRAND.ink, { rim: 0.04, edge: 0 }); // a box is its lines: flat glass faces at a grazing angle make grey slabs
  const cavGeo = new THREE.BoxGeometry(CAVERN.w, CAVERN.h, CAVERN.len);
  const cavern = new THREE.Mesh(cavGeo, cavernMat);
  cavern.position.set(0, CAVERN.floor + CAVERN.h / 2, (CAV0 + CAV1) / 2);
  cavern.add(keepLine(cavLines, edgesOf(cavGeo, { opacity: 0.28 })));
  line.add(cavern);
  asShell(cavern, 22);
  const cavGrid = gridMat(20, [CAVERN.w / 2, CAVERN.len / 2]);
  {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(CAVERN.w, CAVERN.len), cavGrid);
    g.rotation.x = -Math.PI / 2;
    g.position.set(0, CAVERN.floor + 0.3, (CAV0 + CAV1) / 2);
    line.add(g);
  }
  const ironMat = glass(BRAND.ink, { rim: 0.05, edge: 0 });
  const concMat = glass(BRAND.ink, { rim: 0.025, edge: 0 });
  const shields = [];
  const shieldMeshes = [];
  const shield = (w, h, l, x, y, u, mat, op, out) => {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(w, h, l);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, u);
    m.add(keepLine(cavLines, edgesOf(geo, { opacity: op })));
    g.add(m);
    line.add(g);
    shieldMeshes.push(m);
    shields.push({ g, out });
  };
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) shield(46, 170, 236, s * 84, CAVERN.floor + 85, BLOCK.u + 125 + k * 240, ironMat, 0.26, [s * 46, 0, 0]);
    for (let k = 0; k < 3; k++) shield(70, 250, 380, s * 160, CAVERN.floor + 125, BLOCK.u + 30 + k * 390, concMat, 0.15, [s * 70, 0, 0]);
  }
  shield(390, 250, 80, 0, CAVERN.floor + 125, CAV1 - 60, concMat, 0.15, [0, 0, 80]);
  asShell(shieldMeshes, 16);

  /* ═══ the block: the graphite core (solid, segments of different greys), the steel vessel (X-ray), its saddles ═══ */
  const coreMats = [];
  {
    const core = makePart("core");
    const segs = [70, 118, 118, 118, 118, 118, 118, 70];
    const tones = [0x6a6d71, 0x434549, 0x525458, 0x434549, 0x525458, 0x434549, 0x525458, 0x6a6d71];
    let z = BLOCK.u;
    segs.forEach((l, i) => {
      const m = solid(tones[i], { rough: 0.82, metal: 0.05 });
      m.emissive = VEI.clone();
      m.emissiveIntensity = 0;
      coreMats.push(m);
      addMesh(core, cyl(BLOCK.core, l - 0.5, 0.5, 72).rotateX(Math.PI / 2).translate(0, 0, z + l / 2), m, { edgeOpacity: 0.6 });
      z += l;
    });
    line.add(core);
  }
  const vesselMat = glass(BRAND.ink, { rim: 0.22, edge: 0.3, spec: 0.08, through: 0.12 });
  const vesselG = new THREE.Group();
  line.add(vesselG);
  {
    const v0 = BLOCK.u - 2, vl = BLOCK.len;
    const shellMeshes = [];
    const add = (geo) => {
      const m = new THREE.Mesh(geo, vesselMat);
      vesselG.add(m);
      shellMeshes.push(m);
    };
    add(new THREE.CylinderGeometry(BLOCK.r, BLOCK.r, vl, 56, 1, true).rotateX(Math.PI / 2).translate(0, 0, v0 + vl / 2));
    for (const f of [0, 0.25, 0.5, 0.75, 1]) {
      const u = v0 + 3 + f * (vl - 6);
      add(new THREE.CylinderGeometry(BLOCK.r + 4, BLOCK.r + 4, 6, 56, 1, true).rotateX(Math.PI / 2).translate(0, 0, u));
      for (const du of [-3, 3]) vesselG.add(keepLine(vesLines, fatLine(circle(BLOCK.r + 4, u + du, 56), { color: BRAND.ink, width: 2, opacity: 0.55 })));
    }
    // the dished end downstream
    add(lathe([[BLOCK.r, 0], [BLOCK.r - 3, 8], [BLOCK.r - 12, 15], [12, 19.5], [0, 20.5]], 56).rotateX(Math.PI / 2).translate(0, 0, v0 + vl));
    // the entrance: a window behind its flange
    vesselG.add(keepLine(vesLines, fatLine(circle(BLOCK.r - 0.5, v0, 56), { color: BRAND.ink, width: 2, opacity: 0.45 })));
    asShell(shellMeshes, 12);
  }
  const saddleMat = glass(BRAND.ink, { rim: 0.06, edge: 0 });
  {
    const saddles = [];
    const h = -BLOCK.r - CAVERN.floor; // from the floor to the vessel's underside
    for (const f of [0.13, 0.5, 0.87]) {
      const geo = new THREE.BoxGeometry(64, h, 22);
      const m = new THREE.Mesh(geo, saddleMat);
      m.position.set(0, CAVERN.floor + h / 2, BLOCK.u + f * BLOCK.len);
      m.add(keepLine(cavLines, edgesOf(geo, { opacity: 0.32 })));
      line.add(m);
      saddles.push(m);
    }
    asShell(saddles, 14);
  }
  // its halo: a veille pool along the block, dosed like a bench's; a soft contact under it
  const pool = makePool({ radius: 1 });
  pool.mesh.scale.set(HALO.r * 0.6, BLOCK.len * 0.68, 1);
  pool.mesh.position.set(0, CAVERN.floor + 0.6, BLOCK.u + BLOCK.len / 2);
  line.add(pool.mesh);
  const contact = makeContact({ amount: 0.35 });
  contact.scale.set(110, BLOCK.len + 60, 1);
  contact.position.set(0, CAVERN.floor + 0.9, BLOCK.u + BLOCK.len / 2);
  line.add(contact);

  /* ═══ the face: the « e », its heat, the principle's point and cracks ═══ */
  const fMat = faceMat();
  const faceDisc = new THREE.Mesh(new THREE.CircleGeometry(BLOCK.core - 0.4, 72), fMat);
  faceDisc.rotation.y = Math.PI; // its own x = right looking downstream, its face toward the beam
  faceDisc.position.set(0, 0, BLOCK.u - 0.6);
  faceDisc.renderOrder = 6;
  faceDisc.visible = false;
  line.add(faceDisc);
  const scorchMat = new THREE.MeshBasicMaterial({ color: 0x0b0806, transparent: true, opacity: 0, depthWrite: false });
  const scorch = new THREE.Mesh(new THREE.CircleGeometry(7, 40), scorchMat);
  scorch.rotation.y = Math.PI;
  scorch.position.set(0, 0, BLOCK.u - 0.4);
  scorch.renderOrder = 5;
  scorch.visible = false;
  line.add(scorch);
  const cracks = [];
  {
    const rand = rng(43);
    const CU = BLOCK.u - 0.8;
    const mk = (pts, delay) => {
      const l = worldLine(pts, BRAND.signal, 0.34, { opacity: 1 });
      l.renderOrder = 7;
      l.visible = false;
      line.add(l);
      cracks.push({ line: l, n: pts.length - 1, delay });
    };
    for (let i = 0; i < 9; i++) {
      let a = (i / 9) * TAU + (rand() - 0.5) * 0.5;
      const len = 12 + rand() * 14;
      const pts = [];
      for (let k = 0; k <= 5; k++) {
        const rr = 2.2 + (len - 2.2) * (k / 5);
        a += (rand() - 0.5) * 0.42;
        pts.push([rr * Math.cos(a), rr * Math.sin(a), CU]);
      }
      const d = rand() * 0.3;
      mk(pts, d);
      if (i % 2 === 0) {
        const [x, y] = pts[2];
        let b = a + (rand() < 0.5 ? -0.7 : 0.7);
        const br = [[x, y, CU]];
        for (let k = 1; k <= 3; k++) {
          b += (rand() - 0.5) * 0.4;
          br.push([x + 2.6 * k * Math.cos(b), y + 2.6 * k * Math.sin(b), CU]);
        }
        mk(br, d + 0.2);
      }
    }
  }
  const pointMat = glow(BRAND.signal, 1.1, { opacity: 0, additive: true });
  const pointBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, BLOCK.u - BRANCH.u, 12, 1, true).rotateX(Math.PI / 2).translate(0, 0, (BRANCH.u + BLOCK.u) / 2), pointMat);
  pointBeam.visible = false;
  line.add(pointBeam);
  const eHead = makeBall(new THREE.Color(1.0, 0.94, 0.84), SIG);
  const spotBall = makeBall(new THREE.Color(1.0, 0.62, 0.36), SIG);
  spotBall.position.set(0, 0, BLOCK.u - 1.5);
  line.add(eHead, spotBall);

  /* ═══ the route out (veille) and the stream (the train's white light) ═══ */
  const ROUTE_N = 400;
  const routePts = [];
  for (let i = 0; i <= ROUTE_N; i++) routePts.push(pathAt((i / ROUTE_N) * BLOCK.u, [0, 0, 0]));
  const route = fatLine(routePts, { color: BRAND.veille, width: 3.5, opacity: 1, hdr: 1.3 });
  route.visible = false;
  group.add(route);
  const routeData = route.geometry.attributes.instanceStart.data;
  let routeBent = -1;
  const routeHead = makeBall(new THREE.Color(0.9, 1.0, 0.95), VEI);
  group.add(routeHead);

  const streamMat = glow(BRAND.ink, 2.0, { additive: true });
  const stream = new THREE.InstancedMesh(new THREE.CapsuleGeometry(1, 2, 3, 10).rotateX(Math.PI / 2), streamMat, STREAM_MAX);
  stream.frustumCulled = false;
  stream.count = 0;
  stream.visible = false;
  group.add(stream);
  const dummy = new THREE.Object3D();
  dummy.quaternion.copy(line.quaternion);

  const face = lineAt(BLOCK.u - 0.3);
  const bc = lineAt(BLOCK.u + BLOCK.len / 2);
  const A = {
    kick: K.slice(),
    septa: lineAt(SEPTA.from + (SEPTA.count * SEPTA.period) / 2),
    branch: lineAt(BRANCH.u),
    dilution: lineAt(DILUTION.from + DILUTION.period * ((DILUTION.h + DILUTION.v) / 2)),
    face: face.slice(),
    block: bc.slice(),
    spot: face.slice(),
    halo: [bc[0], CAVERN.floor, bc[2]],
  };

  const eL = new THREE.Vector3();
  const e2 = [0, 0], q3 = [0, 0, 0];

  function update(p, time, px, eye) {
    const ex = clamp01(p.explode);
    const cav = clamp01(p.cavern);
    habit.update({ cavern: cav }, time, px);
    const vs = 260 * smooth(0.3, 1, ex);

    /* the eye: a shell it enters or grazes fades out (glass seen from inside washes the picture white) */
    let fPipe = 1, fTun = 1, fVes = 1, fCav = 1, fAxis = 1;
    if (eye) {
      // looking down the line, every wall of a long tube grazes the eye at once and piles up into a white blob
      const dx = eye.x - face[0], dy = eye.y - face[1], dz = eye.z - face[2];
      fAxis = 1 - 0.65 * smooth(0.8, 0.97, Math.abs(dx * dir.x + dz * dir.z) / (Math.hypot(dx, dy, dz) || 1));
      eL.copy(eye).applyMatrix4(toLine);
      const rad = Math.hypot(eL.x, eL.y), u = eL.z;
      if (u > 150 && u < PIPE_END + 60) fPipe = smooth(26, 90, rad);
      if (u > TUN0 - 60 && u < CAV0 + 60) fTun = smooth(112, 175, rad);
      if (u > BLOCK.u - 70 + vs && u < BLOCK.u + BLOCK.len + 70 + vs) fVes = smooth(42, 110, rad);
      const inside = Math.min(CAVERN.w / 2 - Math.abs(eL.x), CAV_TOP - eL.y, eL.y - CAVERN.floor, u - CAV0, CAV1 - u);
      fCav = 1 - smooth(-70, 0, inside);
    }

    /* the exploded view: magnets lift in a cascade down the line, the vessel slides off, the shielding opens */
    explode(parts, ex);
    vesselG.position.z = vs;
    const so = smooth(0.15, 0.8, ex);
    for (const s of shields) s.g.position.set(s.out[0] * so, s.out[1] * so, s.out[2] * so);

    /* the kickers: armed (a slow veille breath), firing in a cascade (a flash that settles bright); signal: the ghost */
    const hueK = p.sweep > 0.01 ? SIG : VEI;
    for (let i = 0; i < kick.length; i++) {
      const k = kick[i];
      const uu = clamp01((p.kick - i * 0.04) / 0.4);
      const fire = uu > 0 ? smooth(0, 1, uu) * 0.55 + 0.7 * Math.exp(-(((uu - 0.22) / 0.12) ** 2)) : 0;
      const breath = 0.5 + 0.5 * Math.sin((TAU * time) / 3.4 - i * 0.35);
      k.body.emissive.copy(hueK);
      k.body.emissiveIntensity = fire + 0.06 * p.litKick + 0.04 * p.arm * breath;
      setGlow(k.ring, 1.5, hueK);
      k.ring.opacity = clamp01(p.arm * (0.22 + 0.28 * breath) + 0.25 * p.litKick + fire);
    }
    /* the septa take the beam over */
    septaGlow.opacity = clamp01(0.9 * p.septa + 0.35 * p.litSepta);
    septaBody.emissiveIntensity = 0.14 * p.septa + 0.1 * p.litSepta;
    /* the dilution magnets: lit in turn, the dot sweeps each gap (across in the 4, up and down in the 6) */
    const ph = (TAU * time) / 1.6;
    for (let i = 0; i < dil.length; i++) {
      const d = dil[i];
      const w = Math.pow(0.5 + 0.5 * Math.cos(TAU * (time / 1.6 - i / 10)), 3);
      const lv = p.dil * (0.15 + 0.85 * w);
      d.pole.emissiveIntensity = 1.3 * lv + 0.14 * p.litDil;
      d.body.emissiveIntensity = 0.12 * lv + 0.08 * p.litDil;
      d.dot.visible = p.dil > 0.01;
      d.dotMat.opacity = clamp01(p.dil * (0.55 + 0.45 * w));
      if (d.horiz) d.dot.position.set(d.amp * Math.cos(ph), 0, 0);
      else d.dot.position.set(0, d.amp * Math.sin(ph), 0);
    }

    /* the X-ray */
    tunnelMat.uniforms.uAmount.value = cav * fTun;
    cavernMat.uniforms.uAmount.value = cav * fCav;
    ironMat.uniforms.uAmount.value = cav * fCav;
    concMat.uniforms.uAmount.value = cav * fCav;
    saddleMat.uniforms.uAmount.value = Math.max(0.35, cav);
    const pipeA = (Math.max(0.4, cav) + 0.25 * p.litLine) * fPipe * fAxis;
    pipeMat.uniforms.uAmount.value = pipeA;
    pipeMat.uniforms.uColor.value.copy(INK).lerp(VEI, 0.85 * clamp01(p.litLine));
    const vesA = (Math.max(0.4, cav) + 0.15 * p.litBlock) * fVes * fAxis;
    vesselMat.uniforms.uAmount.value = vesA;
    vesselMat.uniforms.uColor.value.copy(INK).lerp(VEI, 0.3 * clamp01(p.litBlock));
    for (const m of cavLines) m.opacity = m.userData.base * cav * fCav;
    for (const m of pipeLines) {
      m.opacity = m.userData.base * Math.min(1, pipeA);
      m.color.copy(INK).lerp(VEI, 0.75 * clamp01(p.litLine));
    }
    for (const m of vesLines) {
      m.opacity = m.userData.base * Math.min(1, vesA + 0.5 * p.litBlock);
      m.color.copy(INK).lerp(VEI, 0.9 * clamp01(p.litBlock)); // the vessel named: its flanges turn veille, its glass stays thin
    }
    tunGrid.uniforms.uAmount.value = 0.12 * cav * fTun;
    cavGrid.uniforms.uAmount.value = 0.12 * (0.3 + 0.7 * cav);
    for (const m of coreMats) m.emissiveIntensity = 0.05 * p.litBlock;
    pool.uniforms.uAmount.value = 0.22 * clamp01(p.pool);
    contact.material.uniforms.uAmount.value = 0.35 * clamp01(0.4 + p.pool);

    /* the « e », painted by the bunch that reaches the face, and the heat */
    const dumpE = p.dump > 0 ? clamp01(p.dump * (1 + LAG) - LAG) : 0;
    const e = clamp01(Math.max(p.paint, dumpE));
    fMat.uniforms.uProg.value = e;
    fMat.uniforms.uHeat.value = clamp01(p.heat);
    fMat.uniforms.uPoint.value = clamp01(p.point);
    faceDisc.visible = e > 0.001 || p.point > 0.001;
    if (e > 0.002 && e < 0.998) {
      eAt(e, e2);
      eHead.position.set(-e2[0], e2[1], BLOCK.u - 1.4);
      shine(eHead, 1.05, 4.2, 5);
    } else eHead.visible = false;
    /* the principle's ghost: one point, its thin signal beam; the plate gives (cracks, never a hole) */
    const pt = clamp01(p.point);
    pointBeam.visible = pt > 0.01;
    pointMat.opacity = 0.4 * pt;
    if (pt > 0.01) shine(spotBall, 0.9 * pt, 4 + 4 * pt, 4);
    else spotBall.visible = false;
    const cr = clamp01(p.crack);
    scorch.visible = cr > 0.005;
    scorchMat.opacity = 0.8 * smooth(0, 0.6, cr);
    const dark = smooth(0.55, 1, cr);
    for (const c of cracks) {
      const g = clamp01((cr - c.delay) / 0.45);
      c.line.visible = g > 0.01;
      if (!c.line.visible) continue;
      c.line.geometry.instanceCount = Math.max(1, Math.ceil(g * c.n));
      c.line.material.color.copy(CRACK_HOT).lerp(CRACK_DARK, dark);
    }

    /* the route out: a head of veille light, the line drawn behind it, a fine line once it is there */
    const rv = clamp01(p.route);
    route.visible = rv > 0.002;
    if (route.visible) {
      const f = rv * ROUTE_N;
      const i = Math.min(ROUTE_N - 1, Math.floor(f));
      const arr = routeData.array;
      if (routeBent >= 0 && routeBent !== i) {
        const b = routePts[routeBent + 1];
        arr[routeBent * 6 + 3] = b[0]; arr[routeBent * 6 + 4] = b[1]; arr[routeBent * 6 + 5] = b[2];
      }
      const a0 = routePts[i], a1 = routePts[i + 1], k = Math.min(1, f - i);
      arr[i * 6 + 3] = a0[0] + (a1[0] - a0[0]) * k;
      arr[i * 6 + 4] = a0[1] + (a1[1] - a0[1]) * k;
      arr[i * 6 + 5] = a0[2] + (a1[2] - a0[2]) * k;
      routeBent = i;
      routeData.needsUpdate = true;
      route.geometry.instanceCount = i + 1;
      route.material.linewidth = rv < 0.999 ? 3.5 : 2.6;
      route.material.opacity = rv < 0.999 ? 1 : 0.8;
      if (rv < 0.998) {
        routeHead.position.set(arr[i * 6 + 3], arr[i * 6 + 4], arr[i * 6 + 5]);
        shine(routeHead, 1.15, 14, 9);
      } else routeHead.visible = false;
    } else routeHead.visible = false;

    /* the stream: the bunches gone from the ring, at the ring's pace, fanning out toward their point of the « e » */
    const dumping = p.dump > 0.0005 && p.dump < 0.9995 && p.beam > 0.01;
    stream.visible = dumping;
    if (dumping) {
      setGlow(streamMat, 2.0 * clamp01(p.beam));
      const tau = p.dump * (1 + LAG);
      const j0 = Math.max(0, Math.ceil((tau - LAG) * PLACES - 0.5));
      const j1 = Math.min(PLACES - 1, Math.floor(tau * PLACES - 0.5));
      let n = 0;
      for (let j = j0; j <= j1 && n < STREAM_MAX; j++) {
        const q = (j + 0.5) / PLACES;
        const u = (tau - q) * PTRAIN;
        pathAt(u, q3);
        const fan = clamp01((u - FAN0) / (BLOCK.u - FAN0));
        if (fan > 0) {
          eAt(q, e2);
          q3[0] -= LX.x * e2[0] * fan;
          q3[1] += e2[1] * fan;
          q3[2] -= LX.z * e2[0] * fan;
        }
        const r = 1.1 * (1 + 1.3 * clamp01((u - BRANCH.u) / 2000));
        dummy.position.set(q3[0], q3[1], q3[2]);
        dummy.scale.set(r, r, 3.2);
        dummy.updateMatrix();
        stream.setMatrixAt(n++, dummy.matrix);
      }
      stream.count = n;
      stream.instanceMatrix.needsUpdate = true;
    }
  }

  return { group, A, update };
}
