// The chain reaction, shown where it happens: a handful of nuclei of the fuel, seen from very close.
// A neutron breaks one; it lets go of two neutrons; each breaks another… a tree that doubles at
// every step. Intact, a nucleus is an ink ball (matter, nothing more); broken, its two halves are
// signal. Every position, every light is a function of the time alone. Centimetres, in the plane
// that faces the camera: x to the right, y up, z toward the eye.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const GENS = 5; // 1 + 2 + 4 + 8 + 16 nuclei
const RADIUS = [0, 12, 23, 34, 45]; // how far from the first nucleus each generation sits
const BALL = 3;

const ballShader = (soft) => ({
  vertexShader: /* glsl */ `
    varying vec3 vN; varying vec3 vV; varying vec3 vC;
    void main() {
      vec4 p = vec4(position, 1.0);
      vec3 n = normal;
      vC = vec3(1.0);
      #ifdef USE_INSTANCING
        p = instanceMatrix * p;
        n = mat3(instanceMatrix) * n;
      #endif
      #ifdef USE_INSTANCING_COLOR
        vC = instanceColor;
      #endif
      vec4 mv = modelViewMatrix * p;
      vN = normalize(normalMatrix * n);
      vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: soft
    ? /* glsl */ `
    uniform float uPower; varying vec3 vN; varying vec3 vV; varying vec3 vC;
    void main() {
      // a ball of light with no edge: brightest where it faces the eye, nothing at its rim
      float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
      gl_FragColor = vec4(vC * f, 1.0);
    }`
    : /* glsl */ `
    uniform float uAlpha; varying vec3 vN; varying vec3 vV; varying vec3 vC;
    void main() {
      // a ball of matter: a soft light from above, on the left, and a rim that says "sphere"
      vec3 n = normalize(vN);
      float lam = 0.5 + 0.5 * dot(n, normalize(vec3(-0.45, 0.7, 0.55)));
      float rim = pow(clamp(1.0 - dot(n, normalize(vV)), 0.0, 1.0), 2.2);
      gl_FragColor = vec4(vC * (0.1 + 0.62 * lam * lam + 0.55 * rim), uAlpha);
    }`,
});

export function buildChain({ seed = 23 } = {}) {
  const group = new THREE.Group();
  const rand = rng(seed);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  /* ── the tree: who breaks whom ── */
  const nodes = [];
  for (let g = 0; g < GENS; g++) {
    const n = 1 << g;
    for (let k = 0; k < n; k++) {
      const a = 0.42 + ((k + 0.5) / n) * Math.PI * 2 + (g ? (rand() - 0.5) * (1.5 / n) : 0);
      const r = RADIUS[g] * (0.94 + rand() * 0.12);
      const axis = V(rand() - 0.5, rand() - 0.5, (rand() - 0.5) * 0.5).normalize();
      nodes.push({ g, parent: g ? (1 << (g - 1)) - 1 + (k >> 1) : -1, pos: V(Math.cos(a) * r * 0.9, Math.sin(a) * r, g ? (rand() - 0.5) * 12 : 0), axis });
    }
  }
  // the neutron that starts it all comes from outside the picture
  const origin = V(-78, 26, 8);
  const edges = nodes.map((n, i) => {
    const from = n.parent < 0 ? origin : nodes[n.parent].pos;
    const dir = n.pos.clone().sub(from).normalize();
    return { to: i, g: n.g, a: from.clone().addScaledVector(dir, n.parent < 0 ? 0 : BALL * 1.3), b: n.pos.clone().addScaledVector(dir, -BALL * 0.9), dir };
  });

  /* ── what is drawn: two halves per nucleus, a flash per nucleus, a head and a trail per neutron ── */
  const balls = new THREE.InstancedMesh(
    new THREE.SphereGeometry(BALL, 30, 20),
    new THREE.ShaderMaterial({ ...ballShader(false), uniforms: { uAlpha: { value: 0 } }, transparent: true }),
    nodes.length * 2,
  );
  const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
  const flashes = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 28, 18), new THREE.ShaderMaterial({ ...ballShader(true), uniforms: { uPower: { value: 4.2 } }, ...additive }), nodes.length);
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.62, 16, 12), new THREE.ShaderMaterial({ ...ballShader(true), uniforms: { uPower: { value: 0.6 } }, ...additive }), edges.length);
  const trails = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.17, 0.17, 1, 8, 1, true),
    new THREE.ShaderMaterial({ ...ballShader(true), uniforms: { uPower: { value: 0.35 } }, ...additive, side: THREE.DoubleSide }),
    edges.length,
  );
  const black = new THREE.Color(0, 0, 0);
  for (const mesh of [balls, flashes, heads, trails]) {
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.material.fog = false;
    for (let i = 0; i < mesh.count; i++) mesh.setColorAt(i, black);
    mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    group.add(mesh);
  }
  flashes.renderOrder = 4;
  heads.renderOrder = 4;

  const m4 = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const none = new THREE.Quaternion();
  const up = V(0, 1, 0);
  const at = V(0, 0, 0);
  const size = V(1, 1, 1);
  const hue = new THREE.Color();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const smooth = (a, b, x) => {
    const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  };
  // `when[g]`: the moment the nuclei of generation g break. Their neutrons leave at once and reach the next ones at when[g + 1].
  let when = [1e9, 1e9, 1e9, 1e9, 1e9];
  let lead = 0.5; // how long the first neutron takes to come in

  /** `amount` 0 → 1: the whole picture (the nuclei appear, and go). */
  function update(time, amount) {
    group.visible = amount > 0.002;
    if (!group.visible) return;
    balls.material.uniforms.uAlpha.value = amount;

    nodes.forEach((n, i) => {
      const dt = time - when[n.g]; // since it broke
      const sep = dt > 0 ? 3.9 * (1 - Math.exp(-dt / 0.22)) + 0.5 * Math.min(dt, 3) : 0; // the halves part fast, then drift
      const k = dt > 0 ? 1 - 0.26 * smooth(0, 0.3, dt) : 1;
      // ink while whole; white-hot as it breaks, then signal, for good
      if (dt > 0) hue.copy(SIGNAL).multiplyScalar(0.85 + 2.3 * Math.exp(-dt / 0.45)).lerp(INK, 0.5 * Math.exp(-dt / 0.08));
      else hue.copy(INK).multiplyScalar(0.8);
      hue.multiplyScalar(amount);
      for (const side of [0, 1]) {
        at.copy(n.pos).addScaledVector(n.axis, (side ? 1 : -1) * sep);
        balls.setMatrixAt(i * 2 + side, m4.compose(at, none, size.setScalar(k)));
        balls.setColorAt(i * 2 + side, hue);
      }
      // the flash: a light that has a place — it swells for two frames, then dies small
      if (dt > 0 && dt < 1.4) {
        const swell = dt < 0.066 ? 0.5 + 0.5 * (dt / 0.066) : 1 - 0.6 * smooth(0.066, 0.8, dt);
        flashes.setMatrixAt(i, m4.compose(n.pos, none, size.setScalar(7.2 * swell)));
        flashes.setColorAt(i, hue.copy(SIGNAL).lerp(INK, 0.35 * Math.exp(-dt / 0.08)).multiplyScalar(2.4 * Math.exp(-dt / 0.2) * amount));
      } else {
        flashes.setMatrixAt(i, hidden);
      }
    });

    edges.forEach((e, i) => {
      const t1 = when[e.g];
      const t0 = e.g ? when[e.g - 1] + 0.03 : t1 - lead;
      const u = Math.min(1, Math.max(0, (time - t0) / (t1 - t0)));
      if (time <= t0) {
        heads.setMatrixAt(i, hidden);
        trails.setMatrixAt(i, hidden);
        return;
      }
      at.copy(e.a).lerp(e.b, u);
      // the neutron itself: seen only while it flies
      if (u < 1) {
        heads.setMatrixAt(i, m4.compose(at, none, size.setScalar(1)));
        heads.setColorAt(i, hue.copy(INK).multiplyScalar(2.4 * amount * smooth(0, 0.08, u)));
      } else {
        heads.setMatrixAt(i, hidden);
      }
      // its path: drawn behind it, and left there — the tree is what the eye keeps
      const len = Math.max(0.001, e.a.distanceTo(at));
      at.add(e.a).multiplyScalar(0.5);
      quat.setFromUnitVectors(up, e.dir);
      trails.setMatrixAt(i, m4.compose(at, quat, size.set(1, len, 1)));
      const since = time - t1;
      trails.setColorAt(i, hue.copy(INK).multiplyScalar((since > 0 ? 0.3 + 0.5 * Math.exp(-since / 0.5) : 0.8) * amount));
    });

    for (const mesh of [balls, flashes, heads, trails]) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
    }
  }

  return {
    group,
    update,
    /** When each generation breaks (seconds of film), and how long the first neutron flies in. */
    schedule(times, flyIn = 0.5) {
      when = times;
      lead = flyIn;
    },
  };
}
