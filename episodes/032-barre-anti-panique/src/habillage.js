// DOSSIER 032 — the dressing of the hall of TODAY (salle.js, `era` 0): what makes the crowd run. The decorator's
// recipe: docs/recette-decorateur.md · journal: docs/journal/032-decorateur.md.
//
//   dressSalle() → { group, update(P, time, px) }   — hung in salle.js's `today` group: gone in 1883, gone with the hall
//
// Three touches, each with its reason — seen above all from OUTSIDE through the leaf (POSE0, the loop, `outflow`),
// where the back of the hall sits behind you and the crowd:
//   1. THE THREAT at the back of the hall, in its far +x corner: a light that has a place — a low hot core and a
//      long tail, signal — the one thing the crowd is running from. Low and to the side: on the first frame it sits
//      behind the crowd, right of you, never on your silhouette nor on the bar.
//   2. ITS LIGHT ON THE BACK WALL: a wash rising from the floor (lit from below), signal, faint — it gives the hall a
//      back, a depth: the far wall exists only where the threat lights it.
//   3. IT BREATHES: the core and its tail swell slowly (≈ 3 s, ± 15 %) — what burns is alive from frame 1, never a blink.
// Tried and taken out (docs/journal/032-decorateur.md): smoke (motes) — unseen at 270 px, dots in TikTok's button
// column; a pool of the same light on the floor — from the low first frame it is a red line behind your legs.
// What each one follows: `shell` (the hall's X-ray), `era` (today only: the `today` group), and `flow` (the hall
// emptied, « et la salle respire »: the threat steps back). Nothing flickers: the core only swells, slowly.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { HALL } from "./plan.js";

const SIGNAL = new THREE.Color(BRAND.signal);
const QUAD = new THREE.PlaneGeometry(1, 1);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** A light that has a place, signal: a bright core and a long tail, facing the camera (kit/lib/details.js `glow`, in signal). */
function signalGlow(at, size, k, order) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL.clone().multiplyScalar(k) }, uAmount: { value: 1 }, uSize: { value: size } },
    vertexShader: /* glsl */ `
      uniform float uSize; varying vec2 vQ;
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
        float a = (0.85 * exp(-r2 * 60.0) + 0.3 * exp(-sqrt(r2) * 5.2)) * (1.0 - r2);
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(QUAD, mat);
  mesh.position.set(...at);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
}

/** The light of the threat on the back wall: brightest at the floor, rising and fading, soft at the sides (never a disc). */
function risingWash(at, w, h, k, order) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL.clone().multiplyScalar(k) }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vUv;
      void main() {
        float u = clamp(vUv.x, 0.0, 1.0) * 2.0 - 1.0;
        float v = clamp(vUv.y, 0.0, 1.0);
        float side = 1.0 - u * u;
        float a = exp(-v * 3.0) * side * side * smoothstep(0.0, 0.06, v);
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), mat); // stands on its bottom edge
  mesh.position.set(...at);
  mesh.rotation.y = Math.PI; // faces the hall (−z), toward the door
  mesh.scale.set(w, h, 1);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
}


export function dressSalle() {
  const group = new THREE.Group();
  group.name = "habillage";
  const Z = HALL.depth;

  // 1 · the threat: at the back, on the stage side, low — a hot core and a wide tail behind the crowd
  const core = signalGlow([900, 45, Z - 80], 130, 1.7, 1);
  const tail = signalGlow([880, 90, Z - 100], 560, 0.85, 1);
  // 2 · its light on the back wall, rising from the floor
  const wash = risingWash([780, 0, Z - 2], 440, 300, 0.14, 1);
  group.add(wash, tail, core);
  const lights = [core.material, tail.material, wash.material];

  return {
    group,
    /** P: the hall's numbers (salle.js) — `shell`, `flow`. No allocation. */
    update(P, time, px = 1) {
      const shell = clamp01(P.shell ?? 1);
      const flow = clamp01(P.flow ?? 0);
      const k = shell * (1 - clamp01(flow * 2)); // the hall empties: the threat steps back before « et la salle respire »
      group.visible = k > 0.003;
      if (!group.visible) return;
      for (let i = 0; i < lights.length; i++) lights[i].uniforms.uAmount.value = k;
      // what burns breathes: a slow swell of the core and its tail (≈ 3 s, ± 15 %), never a blink
      // whole cycles over the 88.8 s film (30 and 47 turns): the last frame breathes exactly like the first — the loop
      const W = (2 * Math.PI) / 88.8;
      const swell = 1 + 0.09 * Math.sin(time * W * 30) + 0.06 * Math.sin(time * W * 47 + 1);
      core.material.uniforms.uAmount.value = k * swell;
      tail.material.uniforms.uAmount.value = k * swell;
    },
  };
}
