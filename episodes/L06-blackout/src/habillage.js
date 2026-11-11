// DOSSIER L06 — Blackout : THE DRESSING of the two true-scale places (terrain.js). Recipe: docs/recette-decorateur.md.
// Journal: docs/journal/L06-habillage.md. Never on the system, never in front of it, never on the first frame's flash.
//
//   dressEms(group)      → { group, update(S, time, px) }   the Ems at night: a plain that people live on
//   dressQuartier(group) → { group, update(S, time, px) }   your street: a town around it, the hour on your wall
//
// Each one adds its own group to the set's group (so it is shown and hidden with the place) and reads only numbers that
// already exist: `shell` (the Ems' X-ray), `town` · `lights` · `room` (the street's). No clock of its own: `time`.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makeDresser } from "@kit/details.js";
import { rng } from "@kit/rng.js";
import { EMS, HALL, QUARTIER } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * Still lights on the ground, seen from far (farms, a town): soft points, at least 3 px (never under 2.4: they crawl),
 * sinking into the night with distance. `pts`: [x, y, z, brightness] — no fog (the far plane and `fade` do it).
 */
function lightField(pts, { k = 0.8, fade = 3000000, px = [3, 5.5], order = 18 } = {}) {
  const pos = new Float32Array(pts.length * 3);
  const seeds = new Float32Array(pts.length);
  pts.forEach((p, i) => {
    pos.set([p[0], p[1], p[2]], i * 3);
    seeds[i] = p[3];
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(k) }, uAmount: { value: 1 }, uFade: { value: fade }, uPx: { value: new THREE.Vector2(...px) } },
    vertexShader: /* glsl */ `
      uniform float uFade; uniform vec2 uPx; attribute float aSeed; varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float dist = max(1.0, -mv.z);
        vA = aSeed * exp(-dist / max(uFade, 1.0));
        gl_PointSize = mix(uPx.x, uPx.y, clamp(aSeed, 0.0, 1.0));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying float vA;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float d = clamp(length(q) * 2.0, 0.0, 1.0);
        float a = (1.0 - d * d) * (1.0 - d * d);
        gl_FragColor = vec4(uColor * a * vA * uAmount, 1.0);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = order;
  return { points, u: mat.uniforms };
}

/* ───────────────────────────── the Ems ───────────────────────────── */
export function dressEms(set) {
  const group = new THREE.Group();
  group.name = "habillage-ems";
  const rand = rng(64);
  const fields = [];

  // 1 · THE FARMS of the Emsland plain: lone yard lights, one to three per farm, strung along the country roads. They say
  //     « people live under this line » and give the plain its depth. Kept out of the river, out of the corridor, and
  //     out of the cone the first frame looks down (the flash at the far east end stays alone on its horizon).
  const farms = [];
  for (let tries = 0; farms.length < 420 && tries < 20000; tries++) {
    const road = rand() < 0.5;
    let x = (rand() * 2 - 1) * 700000;
    let z = (rand() * 2 - 1) * 700000;
    if (road) z = Math.round(z / 60000) * 60000 + (rand() - 0.5) * 3000; else x = Math.round(x / 60000) * 60000 + (rand() - 0.5) * 3000;
    if (Math.abs(x) < EMS.width / 2 + EMS.dike.x + 4000) continue; //                       the river and its dikes
    if (Math.abs(z) < 9000) continue; //                                                     under the corridor
    if (x > 40000 && Math.abs(z) < 0.2 * (x - 40000) + 12000) continue; //                   the first frame's cone, east
    if (Math.abs(x - HALL.at[0]) < 30000 && Math.abs(z - HALL.at[2]) < 60000) continue; //   the yard (its own lights)
    const n = 1 + Math.floor(rand() * 3);
    const b = 0.35 + rand() * 0.5;
    for (let i = 0; i < n; i++) farms.push([x + (rand() - 0.5) * 4000, 300 + rand() * 300, z + (rand() - 0.5) * 4000, b * (i ? 0.6 : 1)]);
  }
  fields.push(lightField(farms, { k: 0.7, fade: 2600000 }));

  // 2 · THE TWO TOWNS on the river: Papenburg upstream, around Meyer Werft (the yard is in the town), Leer downstream —
  //     the crossing is between them. Street-aligned, spread wide (never one blob behind the wires), Leer off to the
  //     west of the river's end; compressed like the hall (true: ≈ 10 km).
  const town = (cx, cz, r, count, cell) => {
    const out = [];
    for (let tries = 0; out.length < count && tries < count * 8; tries++) {
      const rr = Math.pow(rand(), 0.6) * r; // spread out: a town far away must not merge into one blob
      const a = rand() * Math.PI * 2;
      let x = Math.cos(a) * rr;
      let z = Math.sin(a) * rr * 0.7;
      if (rand() < 0.5) z = Math.round(z / cell) * cell; else x = Math.round(x / cell) * cell;
      const wx = cx + x;
      if (Math.abs(wx) < EMS.width / 2 + 1500) continue; // nothing on the water
      out.push([wx, 400 + rand() * 600, cz + z, (1 - rr / r) * 0.6 + 0.25 + rand() * 0.3]);
    }
    return out;
  };
  fields.push(lightField([...town(90000, 150000, 70000, 700, 8000), ...town(-120000, -700000, 170000, 800, 12000)], { k: 0.55, fade: 3200000 }));
  fields.forEach((f) => group.add(f.points));

  // 3 · THE YARD WORKS THROUGH THE NIGHT: two floodlights on masts at Meyer Werft's hall (lights that have a place: a
  //     core and a long tail, never a veil).
  const yard = makeDresser({ order: 20, tone: 0.8, seed: 7 });
  // at the hall's two ends, on its land side: never in front of the ship of glass (hallW looks at it from the river)
  const qx = HALL.at[0] + HALL.W / 2 + 2000;
  for (const sz of [-1, 1]) yard.glow({ at: [qx, 3200, HALL.at[2] + sz * (HALL.L / 2 + 3000)], size: 8000, k: 0.9, kind: "far" });
  yard.done();
  group.add(yard.group);

  set.add(group);
  return {
    group,
    update(S, time, px) {
      const a = clamp01(S.shell);
      group.visible = a > 0.003;
      if (!group.visible) return;
      for (let i = 0; i < fields.length; i++) fields[i].u.uAmount.value = a;
      yard.update({ amount: a * clamp01(S.hall) }, time, px);
    },
  };
}

/* ───────────────────────────── your street ───────────────────────────── */
export function dressQuartier(set) {
  const Q = QUARTIER;
  const group = new THREE.Group();
  group.name = "habillage-quartier";

  // 4 · THE TOWN AROUND YOUR STREET, out to the horizon: everybody plugged in, that Saturday evening. Lights strung on
  //     streets, still. They do not follow `shed` (only feeder 1 goes dark: never a whole town), they follow `lights`.
  const city = makeDresser({ order: 20, tone: 0.8, seed: 23 });
  city.nightLights({ centre: [0, -2500], r0: 16000, r1: 240000, y: 60, cell: 3600, avenue: 4, count: 5200, k: 0.7, fade: 90000, px: [3, 5.5] });
  city.done();
  group.add(city.group);

  // 5 · THE HOUR ON YOUR WALL: a clock beside your window, its hands still at 22:10 — the hour the film opens on, the
  //     hour your light depends on a line you have never seen. Faces into the room (rotY π), above the switch's height.
  const room = makeDresser({ order: 26, tone: 0.85, seed: 5 });
  room.clock({ at: [Q.room.x1 - 75, Q.room.floorY + 225, Q.window[2] - 3], r: 15, hour: 22, minute: 10, rotY: Math.PI });
  room.done();
  group.add(room.group);

  set.add(group);
  return {
    group,
    update(S, time, px) {
      const t = clamp01(S.town);
      city.update({ amount: t * clamp01(S.lights) }, time, px);
      room.update({ amount: t * clamp01(S.room) }, time, px);
    },
  };
}
