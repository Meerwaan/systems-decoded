// DOSSIER 036 — the dressing of the turbine's site (the decorator's file — docs/recette-decorateur.md).
// Nothing here is the system, nothing stands in front of the hub. What the bare set did not have — the life of a wind
// farm on a stormy night, all in ink:
//   · THE NACELLE'S BEACON: the obstruction light on the rear of the nacelle roof, breathing slowly (≈ 30 a minute:
//     French beacons flash 20 to 60 times a minute). It says « 78 m up, in the night » without a word. Ink, not red:
//     red is the threat here. It rides the nacelle's frame (it folds with the tower) and fades on the close shots.
//   · THE FARM, far off: four beacons of the neighbouring turbines on the horizon, kilometres away, breathing in step
//     with ours (a farm's beacons are synchronised). Only their lights: at night that is all one sees of them. They
//     give the road's black horizon a depth.
//   · THE DOOR LAMP at the tower's foot: the lamp over the technicians' door, its light run down the tower's skin and
//     its reflection on the wet crane pad below. The foot of an 80 m tower gets a place and a scale.
//   · THE DELIVERY STATION by the road: its door, the lamp over it — which dies with the grid (`mains`): « le réseau a
//     sauté » has its small image down by the road too.
// Every light keeps a size on screen (computed from the camera's distance), never a blob on the close shots.
//
//   dressTurbine({ top }) → { group, update({ tower, mains }, time) }
//   group: in eolienne.js's group (the world's frame: the tower's foot) · the beacon goes into `top` (the nacelle frame)
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { fatLine } from "@kit/build3d.js";
import { makeDresser } from "@kit/details.js";
import { TOWER, MAINS } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
// the beacons' breath: 44 periods over the film (88.73 s), so the last frame breathes like the first
const PERIOD = 88.73 / 44;
const breath = (t) => 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.cos((2 * Math.PI * t) / PERIOD), 3);

/** A light with a place: a bright core and a long tail, facing the camera (details.js's glow), stretched in y by
 *  `uStretch` (a reflection on wet ground). Its size is set before each draw: `px` pixels across on screen, between
 *  `min` and `max` cm, and it fades out nearer than `near` cm (the close shots belong to the system). */
const QUAD = new THREE.PlaneGeometry(1, 1);
function light({ at, px = 50, min = 20, max = 400, near = 0, k = 1, stretch = 1 }) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(k) }, uAmount: { value: 1 }, uSize: { value: 100 }, uStretch: { value: stretch } },
    vertexShader: /* glsl */ `
      uniform float uSize; uniform float uStretch; varying vec2 vQ;
      void main() {
        vQ = position.xy * 2.0;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * vec2(1.0, uStretch) * uSize;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vQ;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        float a = (0.85 * exp(-r2 * 60.0) + 0.3 * exp(-sqrt(r2) * 5.2)) * (1.0 - r2);
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(QUAD, mat);
  mesh.position.set(...at);
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  const self = { mesh, mat, k: 1 }; // `k`: what update says this light is worth now
  const w = new THREE.Vector3(), c = new THREE.Vector3();
  mesh.onBeforeRender = (renderer, scene, camera) => {
    mesh.getWorldPosition(w);
    c.setFromMatrixPosition(camera.matrixWorld);
    const dist = Math.max(1, w.distanceTo(c));
    const H = renderer.getRenderTarget()?.height ?? renderer.domElement.height;
    const pxPerCm = H / (2 * Math.tan(((camera.fov ?? 30) * DEG) / 2)) / dist;
    mat.uniforms.uSize.value = Math.min(max, Math.max(min, px / pxPerCm));
    mat.uniforms.uAmount.value = self.k * (near > 0 ? smooth(near, near * 1.8, dist) : 1);
  };
  return self;
}

export function dressTurbine({ top }) {
  const group = new THREE.Group();
  group.name = "habillage";

  /* the nacelle's beacon, on a short mast at the rear of its roof (the nacelle's frame: +z upwind, the body toward −z).
     Seen from the road, low and in front, the nacelle hides it (as it would): it shows in the shots that see the roof */
  const beacon = light({ at: [0, 660, -700], px: 44, min: 30, max: 2000, near: 4200, k: 1.4 });
  top.add(beacon.mesh);

  /* the farm, far off beyond the turbine (seen from the road), its beacons at hub height — within the camera's far plane (1.2 km from the car) */
  const farm = [[23600, -55300], [38600, -72600], [51200, -85200], [-16300, -89500]].map(([x, z], i) =>
    light({ at: [x, TOWER.top + 250, z], px: [50, 44, 40, 42][i], min: 60, max: 9000, k: 1.4 }));
  for (const f of farm) group.add(f.mesh);

  /* the door lamp at the tower's foot (the door faces the road: TOWER.door.az) */
  const da = TOWER.door.az * DEG;
  const out = (r, y) => [Math.sin(da) * r, y, Math.cos(da) * r];
  const foot = makeDresser({ order: 24, tone: 0.9 });
  foot.wash({ at: out(TOWER.r0 + 6, TOWER.door.h + 40), w: 190, h: 300, k: 0.17, rotY: da });
  foot.done();
  group.add(foot.group);
  const doorLamp = light({ at: out(TOWER.r0 + 30, TOWER.door.h + 42), px: 40, min: 20, max: 2000, k: 1.5 });
  const doorWet = light({ at: out(TOWER.r0 + 30, -(TOWER.door.h + 42)), px: 40, min: 20, max: 2000, k: 0.45, stretch: 3.2 });
  group.add(doorLamp.mesh, doorWet.mesh);

  /* the delivery station: its door and its lamp on the face toward the car (+z), the lamp on the grid */
  const [sw, sh, sd] = MAINS.post_size;
  const sx = MAINS.post[0] + 60, sz = MAINS.post[2] + sd + 40; // its +z face (eolienne.js's box)
  const station = makeDresser({ order: 24, tone: 0.9 });
  station.wash({ at: [sx - 40, sh - 30, sz + 1], w: 170, h: 220, k: 0.18 });
  station.done();
  group.add(station.group);
  const doorPts = [[sx - 90, 2, sz + 1], [sx - 90, 200, sz + 1], [sx + 10, 200, sz + 1], [sx + 10, 2, sz + 1]];
  const stationDoor = fatLine(doorPts, { width: 1.8, opacity: 0.4 });
  group.add(stationDoor);
  const postLamp = light({ at: [sx - 40, sh - 26, sz + 14], px: 36, min: 18, max: 2000, k: 1.5 });
  const postWet = light({ at: [sx - 40, -(sh - 26), sz + 14], px: 36, min: 18, max: 2000, k: 0.4, stretch: 3 });
  group.add(postLamp.mesh, postWet.mesh);

  return {
    group,
    /** tower: the set's X-ray (everything follows it) · mains: the grid (the station's lamp dies with it) */
    update({ tower = 1, mains = 1 } = {}, time = 0) {
      const T = clamp01(tower);
      group.visible = beacon.mesh.visible = T > 0.01;
      if (!group.visible) return;
      const b = breath(time) * T;
      beacon.k = b;
      for (const f of farm) f.k = b;
      // the cut runs from the foot: it passes the station early (≈ 15 % of the way)
      const lamp = smooth(0.78, 0.9, mains);
      foot.update({ amount: T, lamp: 1 }, time);
      station.update({ amount: T, lamp }, time);
      doorLamp.k = T;
      doorWet.k = T;
      postLamp.k = postWet.k = T * lamp;
      stationDoor.material.opacity = 0.4 * T;
    },
  };
}
