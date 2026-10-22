// DOSSIER L02 — Poste haute tension : the dressing (the decorator's file — docs/recette-decorateur.md).
// Nothing here is the system, nothing stands in front of it, nothing is lit veille or signal: ink, X-ray glass,
// points of light. Every touch follows a number that already exists.
//
// THE POSTE AT NIGHT (dressPoste, follows `poste`):
//   · its floodlight masts, on the far fence and the +x fence: a poste is lit at night — a lamp up there, its pool on
//     the gravel. They give the wide pictures their depth and the gantries their scale (15 m masts). Placed so that
//     none stands behind the detector's head in the hook (az −38 from the work point) nor behind your breaker.
//   · the country beyond the fence: a few villages and farms on the horizon, on the side the cameras look (+x / −z),
//     never toward −x where the corridor runs and the far fault burns — « the carrefour before the towns ».
// THE LINE IN THE COUNTRY (dressLigne, follows `span`):
//   · July 2025, Dunkerque–Arras (`day`): the wind farms of the north on the dusk horizon, their blades still.
//   · villages and farms lit far away (both nights and the dusk): the line crosses an inhabited country.
//   · Virginia 1987 (`crew` = v87 1 → 2, with the crew): their line truck, headlights on, its work light on the
//     tower's foot — the night work had a light, and it was theirs.
//
//   dressPoste() → { group, update({ amount }, time, px) }          (group: in the POSTE place, world frame)
//   dressLigne() → { group, update({ amount, day, crew }, time, px) } (group: in the LIGNE place, world frame)
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { makeDresser } from "@kit/details.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, box, cyl, lineMat } from "@kit/build3d.js";
import { rng } from "@kit/rng.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** A pool of light on the ground (horizontal, `w` along x × `d` along z, turned by `rotY`): soft on every side, never a disc. */
function makePool({ at, w, d, k = 0.05, rotY = 0, order = 3 }) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(k) }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vQ;
      void main() { vQ = position.xy * 2.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vQ;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        float a = (0.7 * exp(-r2 * 4.0) + 0.3 * exp(-r2 * 14.0)) * (1.0 - r2);
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  mesh.rotation.set(-90 * DEG, 0, rotY, "YXZ");
  mesh.position.set(...at);
  mesh.scale.set(w, d, 1);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return { mesh, mat };
}

/** Collects fine lines (one LineSegments2 per width) and fades them with `amount`. */
function makeLines(list) {
  const L = {};
  return {
    seg(kind, a, b) {
      (L[kind] ??= []).push(a[0], a[1], a[2], b[0], b[1], b[2]);
    },
    done(group, spec, order = 27) {
      const mats = [];
      for (const [kind, pts] of Object.entries(L)) {
        const [width, opacity] = spec[kind];
        const mat = lineMat(BRAND.ink, width, { opacity });
        const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(pts), mat);
        mesh.frustumCulled = false;
        mesh.renderOrder = order;
        group.add(mesh);
        mats.push(mat);
      }
      list.push(...mats);
    },
  };
}

/* ───────────────────────────── the poste ───────────────────────────── */

/** The floodlight masts: [x, z] on the fence (inside it), and which way their lamps look (toward the bays). */
// (checked on the hook, az −38 from the work point: none stands behind the detector's head, and at 15 m their lamps
// stay under the header; a mast at [6000, −5000] stood in the middle of the hook, its pool behind the head: moved)
const MASTS = [
  [-1000, -8300],
  [1600, -8300],
  [4200, -8300],
  [6000, -3000],
];
const MAST_H = 1500;

export function dressPoste() {
  const group = new THREE.Group();
  group.name = "habillage-poste";

  // the masts (15 m): a glass pole, a short crossbar, two lamps that look in toward the bays, their pool on the gravel
  const masts = makeDresser({ seed: 21, tone: 0.8 });
  const pools = [];
  const poleMats = [];
  const poles = makeLines(poleMats);
  for (const [x, z] of MASTS) {
    const inward = Math.atan2(2400 - x, -1200 - z); // toward the middle of the poste
    const ix = Math.sin(inward);
    const iz = Math.cos(inward);
    masts.cable({ points: [[x, 0, z], [x, MAST_H * 0.5, z], [x, MAST_H, z]], r: 13 });
    const px = -iz * 70;
    const pz = ix * 70;
    masts.cable({ points: [[x - px, MAST_H + 10, z - pz], [x, MAST_H + 12, z], [x + px, MAST_H + 10, z + pz]], r: 6 });
    for (const s of [-1, 1]) masts.glow({ at: [x + s * px + ix * 25, MAST_H - 8, z + s * pz + iz * 25], size: 380, k: 1.2 });
    poles.seg("pole", [x, 0, z], [x, MAST_H, z]);
    const p = makePool({ at: [x + ix * 1500, 3, z + iz * 1500], w: 3000, d: 4200, k: 0.085, rotY: inward });
    group.add(p.mesh);
    pools.push(p.mat);
  }
  masts.done();
  group.add(masts.group);
  poles.done(group, { pole: [1.8, 0.26] });

  // the country: villages and farms on the horizon, on the side the cameras look (bearing from +x toward −z)
  const far = makeDresser({ seed: 5 });
  const C = [2500, -1200]; // the poste's middle
  const at = (b, r) => [C[0] + Math.cos(b * DEG) * r, C[1] - Math.sin(b * DEG) * r];
  for (const [b, r, n, size] of [[38, 190000, 110, 5200], [74, 250000, 80, 4200], [-6, 210000, 70, 3800], [96, 160000, 40, 2600]]) {
    const [x, z] = at(b, r);
    far.nightLights({ centre: [x, z], r0: 300, r1: size, y: 300, cell: 1300, avenue: 3, count: n, k: 0.55, fade: 900000, px: [3, 5] });
  }
  const rand = rng(17);
  for (let i = 0; i < 18; i++) {
    const [x, z] = at(-14 + rand() * 112, 60000 + rand() * 200000);
    far.glow({ at: [x, 250, z], size: 900 + rand() * 600, k: 0.55 + rand() * 0.3, kind: "far" });
  }
  far.done();
  group.add(far.group);

  return {
    group,
    update({ amount = 1 } = {}, time = 0, px = 1) {
      const a = clamp01(amount);
      group.visible = a > 0.003;
      if (!group.visible) return;
      masts.update({ amount: a, lamp: 1 }, time, px);
      for (const m of pools) m.uniforms.uAmount.value = a;
      for (const m of poleMats) m.opacity = m.userData.base * a;
      far.update({ amount: a }, time, px);
    },
  };
}

/* ───────────────────────────── the line in the country ───────────────────────────── */

/** The wind farms on the dusk horizon (far side, −z, where the sky is warm): [x, z, turbines, step along x]. */
const FARMS = [
  [110000, -230000, 5, 42000],
  [270000, -160000, 4, 38000],
];
/** Virginia 1987: the crew's truck, behind and beside the tower's foot, its nose toward the tower (−x). */
const TRUCK = { at: [41850, 0, -840], rotY: Math.PI };

export function dressLigne() {
  const group = new THREE.Group();
  group.name = "habillage-ligne";
  const lineMats = [];

  /* the wind farms: lines only, still (a fine thing that turns flickers); they follow `day` */
  const dusk = new THREE.Group();
  group.add(dusk);
  const dl = makeLines(lineMats);
  const duskMats = [];
  const rand = rng(29);
  for (const [x0, z0, n, step] of FARMS) {
    for (let i = 0; i < n; i++) {
      const x = x0 + i * step + (rand() - 0.5) * 9000;
      const z = z0 + (rand() - 0.5) * 22000;
      const hub = 9500 + rand() * 1500;
      dl.seg("mast", [x, 0, z], [x, hub, z]);
      // the nacelle: a short box seen from anywhere as a dash
      dl.seg("blade", [x - 450, hub + 60, z], [x + 250, hub + 60, z]);
      const a0 = rand() * 120 * DEG;
      for (let b = 0; b < 3; b++) {
        const a = a0 + b * 120 * DEG;
        dl.seg("blade", [x - 480, hub, z], [x - 480, hub + Math.cos(a) * 5600, z + Math.sin(a) * 5600]);
      }
    }
  }
  dl.done(dusk, { mast: [2.0, 0.42], blade: [1.8, 0.36] }, 1);
  duskMats.push(...lineMats.splice(0));

  /* villages and farms, far: both nights and the dusk */
  const far = makeDresser({ seed: 9 });
  for (const [x, z, r1, n] of [[120000, -175000, 6000, 120], [255000, -85000, 5000, 90], [-50000, -150000, 4200, 60], [330000, 30000, 5000, 80]]) {
    far.nightLights({ centre: [x, z], r0: 300, r1, y: 300, cell: 1300, avenue: 3, count: n, k: 0.55, fade: 1200000, px: [3, 5] });
  }
  for (let i = 0; i < 26; i++) {
    const x = -60000 + rand() * 400000;
    const z = -40000 - rand() * 260000;
    far.glow({ at: [x, 250, z], size: 1300 + rand() * 900, k: 0.5 + rand() * 0.35, kind: "far" });
  }
  far.done();
  group.add(far.group);

  /* Virginia 1987: the crew's line truck, glass; headlights on, a work light on the cab roof aimed at the tower */
  const crew = new THREE.Group();
  crew.position.set(...TRUCK.at);
  crew.rotation.y = TRUCK.rotY; // local +x (its nose) → world −x
  group.add(crew);
  const hull = glass(BRAND.ink, { base: 0.003, rim: 0.17, power: 2.4, edge: 0.22, spec: 0.25, through: 0.16 });
  const flat = glass(BRAND.ink, { base: 0.003, rim: 0.07, power: 2.6, edge: 0.12, through: 0.14 });
  const panes = [];
  const tl = makeLines(lineMats);
  const piece = (geo, mat, pos, rot = [0, 0, 0], lines = true) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.frustumCulled = false;
    crew.add(m);
    panes.push(m);
    if (lines) {
      m.updateMatrix();
      const e = new THREE.EdgesGeometry(geo.userData.edges ?? geo, 28).applyMatrix4(m.matrix).attributes.position;
      for (let i = 0; i < e.count; i += 2) tl.seg("edge", [e.getX(i), e.getY(i), e.getZ(i)], [e.getX(i + 1), e.getY(i + 1), e.getZ(i + 1)]);
    }
  };
  piece(box(190, 170, 230, 18), hull, [250, 175, 0]); //            the cab
  piece(box(420, 150, 240, 8), flat, [-90, 165, 0]); //             the utility body
  piece(box(640, 22, 220, 4), flat, [40, 80, 0], [0, 0, 0], false); // the chassis
  for (const wx of [255, -150, -260]) for (const s of [-1, 1]) piece(cyl(48, 26, 3, 28), hull, [wx, 48, s * 102], [90 * DEG, 0, 0], false);
  tl.done(crew, { edge: [1.8, 0.4] });
  asShell(panes, 26);
  const lights = makeDresser({ seed: 3 });
  for (const s of [-1, 1]) lights.glow({ at: [346, 105, s * 82], size: 120, k: 1.4 });
  lights.glow({ at: [300, 272, 0], size: 160, k: 1.15 }); // the work light on the cab roof
  lights.done();
  crew.add(lights.group);
  const crewPools = [
    makePool({ at: [1100, 3, 0], w: 1500, d: 650, k: 0.06 }), //   the headlights, on the ground ahead
    makePool({ at: [1850, 3, -840], w: 1500, d: 1200, k: 0.04 }), // the work light, on the tower's foot
  ];
  for (const p of crewPools) crew.add(p.mesh);


  return {
    group,
    update({ amount = 1, day = 0, crew: c = 0 } = {}, time = 0, px = 1) {
      const a = clamp01(amount);
      group.visible = a > 0.003;
      if (!group.visible) return;
      const d = clamp01(day) * a;
      dusk.visible = d > 0.003;
      for (const m of duskMats) m.opacity = m.userData.base * d;
      far.update({ amount: a }, time, px);
      const k = clamp01(c) * a;
      crew.visible = k > 0.003;
      if (crew.visible) {
        hull.uniforms.uAmount.value = flat.uniforms.uAmount.value = k;
        for (const m of lineMats) m.opacity = m.userData.base * k;
        lights.update({ amount: k }, time, px);
        for (const p of crewPools) p.mat.uniforms.uAmount.value = k;
      }
    },
  };
}
