// Atmosphere: the surface the system is mounted on, a light pool, and drifting motes.
// Everything here is a pure function of time (shader uniforms), so it renders deterministically.
import * as THREE from "three";
import { BRAND } from "./brand.js";
import { rng } from "./rng.js";

/** Dark mounting surface with a procedural technical grid that fades with distance. */
export function makeSurface({ radius = 260, cell = 5, fade = 46 } = {}) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 72),
    new THREE.MeshStandardMaterial({ color: 0x0b0f12, roughness: 0.96, metalness: 0 }),
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.02;
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
      },
      vertexShader: /* glsl */ `
        varying vec2 vP;
        void main() {
          vP = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uCell; uniform float uFade; uniform float uAmount;
        varying vec2 vP;
        float gridLine(vec2 p, float cell) {
          vec2 q = p / cell;
          vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
          return 1.0 - min(min(g.x, g.y), 1.0);
        }
        void main() {
          float g = gridLine(vP, uCell) * 0.45 + gridLine(vP, uCell * 5.0);
          float fade = exp(-length(vP) / uFade);
          gl_FragColor = vec4(uColor * g * fade * uAmount, 1.0);
        }`,
    }),
  );
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = 0.01;
  group.add(grid);
  return { group, grid: grid.material.uniforms };
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
 * Drive `uniforms.uAmount` (0–1) and call `update(t, pixelScale)` every frame.
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
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime, uAmount, uScale; uniform vec3 uMin, uSize, uDrift;
        attribute vec4 aSeed; varying float vA;
        void main() {
          vec3 wob = vec3(sin(uTime * 0.4 * aSeed.y + aSeed.x * 6.28), cos(uTime * 0.31 * aSeed.y + aSeed.x * 4.1), sin(uTime * 0.35 + aSeed.x * 9.4));
          vec3 p = position + uDrift * uTime * (0.5 + aSeed.y) + wob * 1.3;
          p = uMin + mod(p - uMin, uSize);
          vec3 q = (p - uMin) / uSize;
          float edge = smoothstep(0.0, 0.1, q.x) * smoothstep(1.0, 0.9, q.x) * smoothstep(0.0, 0.1, q.y) * smoothstep(1.0, 0.9, q.y) * smoothstep(0.0, 0.1, q.z) * smoothstep(1.0, 0.9, q.z);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSeed.z * uScale / max(0.5, -mv.z);
          vA = aSeed.w * (0.6 + 0.4 * sin(uTime * (0.8 + aSeed.y) + aSeed.x * 20.0)) * uAmount * edge;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - d), 2.0);
          gl_FragColor = vec4(uColor * a * vA, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  return {
    points,
    uniforms,
    update(t, pixelScale) {
      uniforms.uTime.value = t;
      uniforms.uScale.value = pixelScale;
    },
  };
}
