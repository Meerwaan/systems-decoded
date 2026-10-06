// Atmosphere: the surface the system is mounted on, a light pool, and drifting motes.
// Everything here is a pure function of time (shader uniforms), so it renders deterministically.
import * as THREE from "three";
import { BRAND } from "./brand.js";
import { rng } from "./rng.js";

/**
 * Dark mounting surface with a procedural technical grid that fades with distance.
 * `grid.uOffset` slides the grid under the object (a road going by) without moving the surface;
 * `grid.uSmear` is how far it slides during one frame: the lines are spread over that distance,
 * like any moving thing in front of a shutter — crisp lines hopping from frame to frame flicker.
 * `lift` spaces the layers of the floor apart (a camera hundreds of metres away cannot tell
 * surfaces a fraction of a millimetre apart, and they fight).
 */
export function makeSurface({ radius = 260, cell = 5, fade = 46, lift = 1 } = {}) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 72),
    new THREE.MeshStandardMaterial({ color: 0x0b0f12, roughness: 0.72, metalness: 0, envMapIntensity: 0.35 }),
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.02 * lift;
  base.receiveShadow = true; // what grounds the object
  group.add(base);

  const grid = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 72),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(BRAND.ink) },
        uCell: { value: cell },
        uFade: { value: fade },
        uAmount: { value: 0.12 },
        uOffset: { value: new THREE.Vector2(0, 0) },
        uSmear: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uCell; uniform float uFade; uniform float uAmount; uniform vec2 uOffset; uniform vec2 uSmear;
        varying vec2 vP;
        // one family of lines: a pixel and a half wide (thinner, they shimmer as they move), and
        // spread over the smear — with the same light, so a fast grid melts into an even veil
        float lines(float x, float cell, float smear) {
          float q = x / cell;
          float w = max(fwidth(q) * 1.5, 1e-5);
          float d = abs(fract(q - 0.5) - 0.5);
          float reach = max(w, 0.5 * smear / cell);
          return (w / reach) * (1.0 - smoothstep(reach - w, reach, d));
        }
        float gridLine(vec2 p, float cell) {
          return max(lines(p.x, cell, uSmear.x), lines(p.y, cell, uSmear.y));
        }
        void main() {
          float g = gridLine(vP + uOffset, uCell) * 0.45 + gridLine(vP + uOffset, uCell * 5.0);
          float fade = exp(-length(vP) / uFade);
          gl_FragColor = vec4(uColor * g * fade * uAmount, 1.0);
        }`,
    }),
  );
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = 0.01 * lift;
  group.add(grid);

  // The floor glows (pool, grid), and light cannot be shadowed: a catcher laid over it
  // darkens whatever is underneath wherever the key light is blocked. This is what grounds the object.
  const catcher = new THREE.Mesh(new THREE.CircleGeometry(radius, 72), new THREE.ShadowMaterial({ opacity: 0.62 }));
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = 0.035 * lift;
  catcher.receiveShadow = true;
  catcher.renderOrder = 1;
  group.add(catcher);
  return { group, grid: grid.material.uniforms, shadow: catcher.material };
}

/** Soft disc of light on the surface, under the object. */
export function makePool({ radius = 17, color = BRAND.veille } = {}) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color(color) }, uAmount: { value: 0.25 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying vec2 vUv;
        void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.4); gl_FragColor = vec4(uColor * a * uAmount, 1.0); }`,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.02;
  return { mesh, uniforms: mesh.material.uniforms };
}

/**
 * Drifting motes filling a box (embers, dust). `min`/`size` in world units.
 * Drive `uniforms.uAmount` (0–1) and call `update(t, pixelScale, streak)` every frame.
 * `streak`: how much of `t` one frame covers. A mote is drawn as a line of the length it
 * travels in that time — dots hopping across the screen read as flicker, not as speed.
 */
export function makeMotes({ count = 420, seed = 5, min = [-70, 0.4, -70], size = [140, 44, 140], psize = [0.18, 0.7], color = BRAND.signal, drift = [0.5, -0.9, 0.2] } = {}) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = min[0] + rand() * size[0];
    pos[i * 3 + 1] = min[1] + rand() * size[1];
    pos[i * 3 + 2] = min[2] + rand() * size[2];
    seeds[i * 4] = rand();
    seeds[i * 4 + 1] = 0.4 + rand() * 0.9;
    seeds[i * 4 + 2] = psize[0] + Math.pow(rand(), 2.2) * (psize[1] - psize[0]);
    seeds[i * 4 + 3] = 0.35 + rand() * 0.65;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  const uniforms = {
    uTime: { value: 0 },
    uAmount: { value: 0 },
    uScale: { value: 1 },
    uColor: { value: new THREE.Color(color).multiplyScalar(2.2) },
    uMin: { value: new THREE.Vector3(...min) },
    uSize: { value: new THREE.Vector3(...size) },
    uDrift: { value: new THREE.Vector3(...drift) },
    uStreak: { value: 0 },
    uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uAmount, uScale, uStreak; uniform vec3 uMin, uSize, uDrift; uniform vec2 uView;
        attribute vec4 aSeed; varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
        void main() {
          vec3 wob = vec3(sin(uTime * 0.4 * aSeed.y + aSeed.x * 6.28), cos(uTime * 0.31 * aSeed.y + aSeed.x * 4.1), sin(uTime * 0.35 + aSeed.x * 9.4));
          vec3 vel = uDrift * (0.5 + aSeed.y);
          vec3 p = position + vel * uTime + wob * 1.3;
          p = uMin + mod(p - uMin, uSize);
          vec3 q = (p - uMin) / uSize;
          float edge = smoothstep(0.0, 0.1, q.x) * smoothstep(1.0, 0.9, q.x) * smoothstep(0.0, 0.1, q.y) * smoothstep(1.0, 0.9, q.y) * smoothstep(0.0, 0.1, q.z) * smoothstep(1.0, 0.9, q.z);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vec4 c0 = projectionMatrix * mv;
          // where it was one frame ago, on screen: the streak runs from there to here
          vec4 c1 = projectionMatrix * modelViewMatrix * vec4(p - vel * uStreak, 1.0);
          vec2 run = c1.w > 0.0 && c0.w > 0.0 ? (c0.xy / c0.w - c1.xy / c1.w) * 0.5 * uView : vec2(0.0);
          float len = min(length(run), 260.0);
          float size = aSeed.z * uScale / max(0.5, -mv.z);
          gl_PointSize = size + len;
          gl_Position = c0;
          gl_Position.xy -= (len > 0.5 ? normalize(run) * len : vec2(0.0)) / uView * c0.w; // centred on its path
          vDir = len > 0.5 ? normalize(run) : vec2(1.0, 0.0);
          vDot = size / (size + len);
          vHalf = 0.5 * (1.0 - vDot);
          // the same light, spread along the streak
          vA = aSeed.w * (0.6 + 0.4 * sin(uTime * (0.8 + aSeed.y) + aSeed.x * 20.0)) * uAmount * edge * sqrt(vDot);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA; varying vec2 vDir; varying float vHalf; varying float vDot;
        void main() {
          vec2 q = gl_PointCoord - 0.5;
          q.y = -q.y; // point coordinates run downward
          float along = max(abs(dot(q, vDir)) - vHalf, 0.0);
          float across = dot(q, vec2(-vDir.y, vDir.x));
          float d = length(vec2(along, across)) / (0.5 * vDot);
          float a = pow(max(0.0, 1.0 - d), 2.0);
          gl_FragColor = vec4(uColor * a * vA, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  return {
    points,
    uniforms,
    update(t, pixelScale, streak = 0) {
      uniforms.uTime.value = t;
      uniforms.uScale.value = pixelScale;
      uniforms.uStreak.value = streak;
    },
  };
}
