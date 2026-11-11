// DOSSIER 044 — Le gilet pare-balles : the dressing of the street (rue.js). X-ray glass and fine lines, never solid,
// never on the vest (gilet.js), never between the camera and the panel. Three touches, each with its reason:
//
//   stones   the road strewn with stones and a few pavers, thickest toward the fires, none within 2.6 m of him nor on
//            his way home: « Tu crois à une pierre » — the night has thrown hundreds, so a stone is what you believe
//            hit you. Under the street shots (8.4 → 18 s), the rest (39 → 41 s), the walk home seen from above (60 → 62 s).
//   shelter  a bus shelter on the far pavement up the street, one back pane starred by a stone: the night has already
//            broken glass. It stands behind the bullet while the camera flies beside it (12 → 15 s), where the far
//            façade was a flat red wall.
//   skyglow  the sky over the far end of the street, lit from below by fires out of sight (signal: it IS the threat):
//            the riot is bigger than this street. Behind him in « La nuit, le bruit couvre tout » (8.4 → 12 s). Only
//            seen looking up the street: never in POSE0, never on the bench.
//
//   dressRue() → { group, update(p, time, px) }   p: rue.js's own numbers — stones and shelter follow `shell` (they
//   stay on the road when the riot dies down), the sky follows `riot`. Uniforms only; nothing drawn at random
//   (kit/lib/rng.js), nothing that blinks, nothing that moves.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, mergeGeometries, lineMat } from "@kit/build3d.js";
import { STREET, RIOT, WALK } from "./plan.js";

const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/** Position and normal only, non-indexed: every baked piece must carry the same attributes to merge. */
function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position").clone());
  o.setAttribute("normal", n.getAttribute("normal").clone());
  return o;
}

function lines(array, width, opacity) {
  const geo = new LineSegmentsGeometry().setPositions(array);
  const line = new LineSegments2(geo, lineMat(BRAND.ink, width, { opacity }));
  line.renderOrder = 2;
  line.userData.k = opacity;
  return line;
}

export function dressRue() {
  const group = new THREE.Group();
  group.name = "habillage";
  const rand = rng(4404);

  /* ── stones: « Tu crois à une pierre » ── */
  const stoneGeo = [];
  const paveGeo = [];
  const paveEdges = [];
  const ICO = new THREE.IcosahedronGeometry(1, 0);
  const DOD = new THREE.DodecahedronGeometry(1, 0);
  const PAVE = new THREE.BoxGeometry(14, 10, 14); //   a granite paver, torn out of a pavement
  const PAVE_EDGES = new THREE.EdgesGeometry(PAVE, 28);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const s = new THREE.Vector3();
  const burning = [...RIOT.fires, RIOT.car];
  const clear = (x, z) =>
    Math.hypot(x, z) > 260 && //                                   his feet and the close shots stay clean
    Math.abs(z) < STREET.kerb - 20 && //                           on the road, not on the pavements
    !(x > -60 && x < WALK.to[0] + 120 && Math.abs(z - (WALK.to[2] * Math.max(0, x)) / WALK.to[0]) < 120) && // his way home
    burning.every(([fx, fz], i) => (i === burning.length - 1 ? Math.abs(x - fx) > 240 || Math.abs(z - fz) > 120 : Math.hypot(x - fx, z - fz) > 75));
  const stone = (x, z, r) => {
    const sx = r * (0.9 + 0.4 * rand());
    const sy = r * (0.5 + 0.25 * rand());
    const sz = r * (0.7 + 0.4 * rand());
    e.set((rand() - 0.5) * 0.4, rand() * TAU, (rand() - 0.5) * 0.4, "YXZ");
    m4.compose(v.set(x, sy * 0.55, z), q.setFromEuler(e), s.set(sx, sy, sz));
    stoneGeo.push(bare((rand() < 0.5 ? ICO : DOD).clone().applyMatrix4(m4)));
  };
  const pave = (x, z) => {
    const onSide = rand() < 0.35;
    e.set(onSide ? Math.PI / 2 : 0, rand() * TAU, (rand() - 0.5) * 0.15, "YXZ");
    m4.compose(v.set(x, onSide ? 7 : 5, z), q.setFromEuler(e), s.set(1, 1, 1));
    paveGeo.push(bare(PAVE.clone().applyMatrix4(m4)));
    paveEdges.push(...PAVE_EDGES.clone().applyMatrix4(m4).attributes.position.array);
  };
  const put = (x, z, kind) => {
    if (!clear(x, z)) return;
    if (kind === "pave") pave(x, z);
    else stone(x, z, 5 + 5 * rand()); // fist-sized to half a brick
  };
  // the field up the street, thicker toward the fires
  for (let i = 0; i < 52; i++) put(-650 - 2900 * Math.sqrt(rand()), (rand() * 2 - 1) * 440, rand() < 0.3 ? "pave" : "stone");
  // around two fires and the car: where the crowd stood
  for (const [fx, fz] of [RIOT.fires[1], RIOT.fires[2], RIOT.car]) {
    for (let i = 0; i < 6; i++) {
      const a = rand() * TAU;
      const r = 90 + 170 * rand();
      put(fx + r * Math.cos(a), fz + r * Math.sin(a), rand() < 0.2 ? "pave" : "stone");
    }
  }
  // by the bin that burns ahead of him: a few, between him and the far kerb (behind him in every close shot)
  for (let i = 0; i < 12; i++) put(-700 + 950 * rand(), -170 - 270 * rand(), "stone");
  // down the street, toward home: a few that rolled that far
  for (let i = 0; i < 10; i++) put(350 + 2500 * rand(), (rand() * 2 - 1) * 440, "stone");

  const stoneMat = glass(BRAND.ink, { base: 0.015, rim: 0.16, power: 1.6, edge: 0.35, spec: 0, through: 0 });
  const stones = new THREE.Mesh(mergeGeometries([...stoneGeo, ...paveGeo]), stoneMat);
  stones.renderOrder = 5;
  group.add(stones);
  const paveLines = lines(paveEdges, 1.8, 0.2);
  group.add(paveLines);

  /* ── the bus shelter, one pane starred ── */
  const SH = { x: -1350, zb: -628, zf: -505, h: 222, roof: 246 };
  const X = (dx) => SH.x + dx;
  const zs = SH.zf - 20; //  the front post of each side
  const frame = [];
  const crack = [];
  const seg = (list, a, b) => list.push(...a, ...b);
  for (const dx of [-200, 200]) seg(frame, [X(dx), 0, SH.zb], [X(dx), SH.roof, SH.zb]);
  for (const y of [12, SH.h]) seg(frame, [X(-200), y, SH.zb], [X(200), y, SH.zb]);
  for (const dx of [-200, 200]) {
    seg(frame, [X(dx), 0, zs], [X(dx), SH.roof, zs]);
    for (const y of [12, SH.h]) seg(frame, [X(dx), y, SH.zb], [X(dx), y, zs]);
  }
  const rx = [X(-214), X(214)];
  const rz = [SH.zb - 12, SH.zf + 8];
  for (const y of [SH.roof, SH.roof + 7]) {
    seg(frame, [rx[0], y, rz[0]], [rx[1], y, rz[0]]);
    seg(frame, [rx[0], y, rz[1]], [rx[1], y, rz[1]]);
    seg(frame, [rx[0], y, rz[0]], [rx[0], y, rz[1]]);
    seg(frame, [rx[1], y, rz[0]], [rx[1], y, rz[1]]);
  }
  // the seat along the back
  seg(frame, [X(-120), 46, SH.zb + 30], [X(120), 46, SH.zb + 30]);
  seg(frame, [X(-120), 46, SH.zb + 6], [X(120), 46, SH.zb + 6]);
  for (const dx of [-110, 110]) seg(frame, [X(dx), 0, SH.zb + 18], [X(dx), 46, SH.zb + 18]);
  // the star on the upstream back pane: rays that wander a little, two broken rings
  const cx = X(-130);
  const cy = 136;
  const cz = SH.zb + 0.8;
  const inPane = (x, y) => [Math.min(X(-69), Math.max(X(-198), x)), Math.min(SH.h - 2, Math.max(14, y))];
  const n = 10;
  const ang = [];
  for (let i = 0; i < n; i++) {
    let a = (i / n) * TAU + (rand() - 0.5) * 0.45;
    ang.push(a);
    const L = 26 + 38 * rand();
    let p = [cx, cy];
    for (let k = 1; k <= 3; k++) {
      a += (rand() - 0.5) * 0.35;
      const r = (L * k) / 3;
      const nx = inPane(cx + r * Math.cos(a), cy + r * Math.sin(a));
      seg(crack, [...p, cz], [...nx, cz]);
      p = nx;
    }
  }
  for (const R of [8, 19]) {
    for (let i = 0; i < n; i++) {
      if (rand() < 0.3) continue;
      const a0 = ang[i];
      const a1 = ang[(i + 1) % n] + (i === n - 1 ? TAU : 0);
      const r0 = R * (0.85 + 0.3 * rand());
      const r1 = R * (0.85 + 0.3 * rand());
      seg(crack, [cx + r0 * Math.cos(a0), cy + r0 * Math.sin(a0), cz], [cx + r1 * Math.cos(a1), cy + r1 * Math.sin(a1), cz]);
    }
  }
  const paneGeo = [];
  for (const dx of [-133.5, 0, 133.5]) paneGeo.push(bare(new THREE.PlaneGeometry(133, 210).translate(X(dx), 117, SH.zb)));
  for (const dx of [-200, 200]) paneGeo.push(bare(new THREE.PlaneGeometry(zs - SH.zb, 210).rotateY(Math.PI / 2).translate(X(dx), 117, (SH.zb + zs) / 2)));
  const paneMat = glass(BRAND.ink, { base: 0.002, rim: 0.07, power: 2.6, edge: 0.12, spec: 0, through: 0 });
  const panes = new THREE.Mesh(mergeGeometries(paneGeo), paneMat);
  panes.renderOrder = 5;
  const frameLines = lines(frame, 1.8, 0.28);
  const crackLines = lines(crack, 1.8, 0.58);
  const shelter = new THREE.Group();
  shelter.add(panes, frameLines, crackLines);
  group.add(shelter);

  /* ── the sky over the far end, lit from below by fires out of sight ── */
  const skyMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(BRAND.signal).multiplyScalar(0.26) }, uAmount: { value: 1 }, uSize: { value: new THREE.Vector2(4200, 1500) } },
    vertexShader: /* glsl */ `
      uniform vec2 uSize; varying vec2 vQ;
      void main() {
        vQ = position.xy * 2.0;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vQ;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        float a = (0.75 * exp(-r2 * 3.2) + 0.25 * exp(-sqrt(r2) * 2.0)) * (1.0 - r2) * (1.0 - r2);
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), skyMat);
  sky.position.set(STREET.from - 2400, 180, 0); // on the horizon at the far end: the vanishing point glows, never the header
  sky.frustumCulled = false;
  sky.renderOrder = 1;
  group.add(sky);

  return {
    group,
    update(p) {
      const sh = clamp01(p.shell ?? 0);
      const rt = clamp01(p.riot ?? 0);
      const on = sh > 0.004;
      stones.visible = paveLines.visible = shelter.visible = on;
      if (on) {
        stoneMat.uniforms.uAmount.value = sh;
        paneMat.uniforms.uAmount.value = sh;
        for (const l of [paveLines, frameLines, crackLines]) l.material.opacity = l.userData.k * sh;
      }
      sky.visible = rt > 0.004;
      skyMat.uniforms.uAmount.value = rt;
    },
  };
}
