// DOSSIER 045 — L'autodestruction de la fusée : the dressing of the base (the decorator's file — docs/recette-decorateur.md).
// Nothing here is the system (sauvegarde.js), nothing stands on the rocket or in front of it, and nothing of it is in the
// first frame (POSE0 looks up into the empty sky from the mangrove). All of it is what floats in the air of the pad — ink,
// soft, on the ground — and it follows the story's clock: the pad breathes before, smokes at lift-off, and the land smokes
// where the pieces came down. Every piece follows a number of the state that already exists (kourou.js's own `p`).
//
//   dressKourou() → { group, update(p, time, px) }   in kourou.js's group (the world's frame, the pad at the origin)
//
//   · THE PAD'S COLD BREATH (`climb` = 0): a cryogenic stage waiting on its table smokes — the cold of its liquid oxygen
//     and hydrogen lines condenses the wet air of Guyana into vapour that rolls off the table and sinks to the deck.
//     « Armée avant l'allumage, elle attend » : it is fuelled, alive. Only on the pad (the rest, the booth before H0+7,
//     the like's rebuilt rocket, the teaser); a slow loop that never stops, never flickers, gone as soon as it climbs.
//   · THE LIFT-OFF CLOUD (`climb`): the jets go down into the flame ducts and come out of their two mouths, east and west,
//     as two banks of smoke that roll out over the ground and stay there for minutes, drifting south-west on the trade
//     wind. 37 s after lift-off they still say where she left from (« à un kilomètre du pas de tir »); at H0+7, seen from
//     the booth, they burst out as she rises. Held by the state: the like's rewind draws them back into the ducts. The
//     east bank sits over the start of the debris' footprint: it steps back while the footprint is drawn (`fall`).
//   · THE SMOKE OF THE LANDINGS (`debris`): once the pieces are down, thin columns of smoke rise from where they fell —
//     two in the savanna, four in the mangrove (« de la mangrove, de la savane »), leaning west on the wind. The landing
//     glows die at debris 1; the smoke keeps the place — every column inside the corridor.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { PAD } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/**
 * Soft puffs of smoke or vapour, each going from `a` (amount 0) to `b` (amount 1) as `uGrow` rises past its birth, its
 * size from s0 to s1 (cm), its weight `k`, a slow wobble `wob` (cm) and a share `dw` of the wind's drift `uDrift`.
 * `loop`: instead of growing with the state, every puff runs a → b over and over (`uRate` per second), fading in and out
 * (the pad's breath: alive from the first frame it is seen). Points never under 2.4 px; additive, ink only.
 */
function makePuffs(puffs, { k = 0.05, loop = false, rate = 0.1, order = 6, depth = true } = {}) {
  const n = puffs.length;
  const A = new Float32Array(n * 3);
  const B = new Float32Array(n * 3);
  const S = new Float32Array(n * 4);
  const W = new Float32Array(n * 4);
  puffs.forEach((q, i) => {
    A.set(q.a, i * 3);
    B.set(q.b, i * 3);
    S.set([q.s0, q.s1, q.k, q.born], i * 4);
    W.set([q.ph, q.wob, q.dw, 0], i * 4);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(A, 3));
  geo.setAttribute("aB", new THREE.BufferAttribute(B, 3));
  geo.setAttribute("aS", new THREE.BufferAttribute(S, 4));
  geo.setAttribute("aW", new THREE.BufferAttribute(W, 4));
  const u = {
    uGrow: { value: 0 }, uAmt: { value: 0 }, uT: { value: 0 }, uFocal: { value: 2400 }, uRate: { value: rate },
    uLoop: { value: loop ? 1 : 0 }, uDrift: { value: new THREE.Vector3() }, uColor: { value: INK.clone().multiplyScalar(k) },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms: u,
      transparent: true,
      depthWrite: false,
      depthTest: depth,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aB; attribute vec4 aS; attribute vec4 aW;
        uniform float uGrow, uAmt, uT, uFocal, uRate, uLoop; uniform vec3 uDrift;
        varying float vA;
        void main() {
          float g;
          float fade;
          if (uLoop > 0.5) {
            g = fract(uT * uRate + aS.w);
            fade = sin(3.14159265 * g);
          } else {
            g = clamp((uGrow - aS.w) / max(0.001, 1.0 - aS.w), 0.0, 1.0);
            g = g * g * (3.0 - 2.0 * g);
            fade = smoothstep(0.0, 0.25, g);
          }
          vec3 p = mix(position, aB, g) + uDrift * aW.z
                 + vec3(sin(uT * 0.29 + aW.x), 0.5 * sin(uT * 0.21 + aW.x * 1.7), cos(uT * 0.25 + aW.x * 1.3)) * aW.y;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float on = uAmt * aS.z * fade;
          gl_PointSize = on < 0.002 ? 0.0 : clamp(mix(aS.x, aS.y, g) * uFocal / max(1.0, -mv.z), 2.4, 220.0);
          vA = on;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA;
        void main() {
          vec2 q = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(q, q);
          if (r2 > 1.0) discard;
          float a = exp(-r2 * 2.6) * (1.0 - r2) * vA;
          gl_FragColor = vec4(uColor * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = order;
  return { points, u };
}

/* ───────────────────────── the lift-off cloud: two banks out of the duct mouths ───────────────────────── */

const MOUTH = PAD.table.w / 2 + PAD.ducts.len; // where the flame ducts open, east and west (x = ±MOUTH, z = 0)

function exhaust(side, seed) {
  const rand = rng(seed);
  const puffs = [];
  for (let i = 0; i < 48; i++) {
    const u = rand(); //          along the bank: 0 at the mouth, 1 at its far end
    const l = (rand() - 0.5) * 2; // across it
    const h = rand();
    puffs.push({
      a: [side * (MOUTH + 200 * u), 120, l * 300],
      b: [side * (MOUTH + 3800 * Math.pow(u, 0.8)), 150 + h * (450 + 1300 * u), l * (1000 + 2000 * u)],
      s0: 300, s1: (1000 + 1400 * u) * (0.7 + 0.6 * rand()), k: 0.6 + 0.4 * rand(), born: 0.3 * u,
      ph: rand() * TAU, wob: 60 + 120 * u, dw: 0.4 + 0.6 * u,
    });
  }
  return makePuffs(puffs, { k: 0.08 });
}

/* ───────────────────────── the smoke of the landings: six thin columns in the footprint ───────────────────────── */

// [x, z]: two in the savanna (x < 1.5 km × 40), four in the mangrove; all inside FALL's ellipse, away from the ghost's cross
const LANDINGS = [[2600, -1600], [4600, 1200], [8200, 800], [11500, -2300], [14600, 1900], [17800, -600]];

function landings() {
  const rand = rng(45);
  const puffs = [];
  for (const [x, z] of LANDINGS) {
    const H = 2600 + 1600 * rand(); //   how high it rises
    const lean = -(300 + 400 * rand()); // westward, with the wind
    for (let j = 0; j < 14; j++) {
      const v = (j + 0.5 * rand()) / 14;
      puffs.push({
        a: [x, 60, z],
        b: [x + lean * v * v, 80 + v * H, z + (rand() - 0.5) * 200 * (0.3 + v)],
        s0: 150, s1: (200 + 460 * v) * (0.8 + 0.4 * rand()), k: (1 - 0.6 * v) * (0.7 + 0.3 * rand()), born: 0.55 * v,
        ph: rand() * TAU, wob: 40 + 120 * v, dw: v,
      });
    }
  }
  return makePuffs(puffs, { k: 0.18 });
}

/* ───────────────────────── the pad's cold breath: vapour rolling off the table ───────────────────────── */

function breath() {
  const rand = rng(17);
  const { w, d, h } = PAD.table;
  const puffs = [];
  for (let i = 0; i < 26; i++) {
    const west = i < 16; // the west edge and the north edge: the faces the film's cameras see (az −40 → −72)
    const a = west ? [-w / 2 + 150 * rand(), h - 60 + 120 * rand(), (rand() - 0.5) * (d - 200)] : [(rand() - 0.5) * (w - 300), h - 60 + 120 * rand(), d / 2 - 100];
    const b = west
      ? [a[0] - (250 + 900 * rand()), a[1] - (300 + 420 * rand()), a[2] + (rand() - 0.5) * 400]
      : [a[0] + (rand() - 0.5) * 300, a[1] - (300 + 420 * rand()), a[2] + 250 + 700 * rand()];
    puffs.push({ a, b, s0: 200, s1: 450 + 450 * rand(), k: 0.5 + 0.5 * rand(), born: rand(), ph: rand() * TAU, wob: 30, dw: 0 });
  }
  return makePuffs(puffs, { k: 0.2, loop: true, rate: 0.11 });
}

export function dressKourou() {
  const group = new THREE.Group();
  group.name = "habillage-kourou";
  const west = exhaust(-1, 31);
  const east = exhaust(1, 32);
  const smoke = landings();
  const vapour = breath();
  const all = [west, east, smoke, vapour];
  for (const s of all) group.add(s.points);

  return {
    group,
    /** p = kourou.js's { ground, climb, fall, debris, … } — every shutter sample: uniforms only, nothing allocated. */
    update(p, time = 0, px = 2400) {
      const gr = clamp01(p.ground ?? 1);
      group.visible = gr > 0.004;
      if (!group.visible) return;
      for (const s of all) {
        s.u.uT.value = time;
        s.u.uFocal.value = px;
      }
      const climb = clamp01(p.climb ?? 0);
      const grow = smooth(0, 0.035, climb); // the banks burst out in the first metres of the climb…
      const age = smooth(0.035, 1, climb); //  …then drift and thin while she flies
      for (const s of [west, east]) {
        s.u.uGrow.value = grow;
        s.u.uDrift.value.set(-2200 * age, 250 * age, -700 * age);
      }
      west.u.uAmt.value = gr * (1 - 0.3 * age);
      east.u.uAmt.value = gr * (1 - 0.3 * age) * (1 - 0.55 * clamp01(p.fall ?? 0)) * (1 - 0.6 * clamp01(p.debris ?? 0));
      const debris = clamp01(p.debris ?? 0);
      smoke.u.uGrow.value = smooth(0.55, 1, debris);
      smoke.u.uAmt.value = gr * smooth(0.5, 0.75, debris);
      vapour.u.uAmt.value = gr * (1 - smooth(0, 0.004, climb));
    },
  };
}
