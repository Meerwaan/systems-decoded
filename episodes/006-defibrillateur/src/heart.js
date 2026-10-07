// A heart, and what an eye never sees of it: the electricity that runs over the muscle.
//   · in fibrillation, wavelets of signal wander over it in every direction and it only quivers
//   · at the shock, every cell fires at once (a flash of ink), then nothing: the muscle is dark
//   · when it starts again, a front of veille leaves one point at the top — its own pacemaker —
//     runs down the muscle, and the muscle squeezes behind it
// Centimetres, in the frame of the chest it sits in: +x is the person's left, +y the head, +z the front.
// Everything is a function of the time alone.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { anchor } from "@kit/build3d.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const R = 4.7; // the ventricles, before they are shaped
const NODE = new THREE.Vector3(-3.1, 4.6, 0.9); // the sinus node: top of the right atrium
const BEAT = { sweep: 0.2, reach: 15 }; // the front crosses the muscle (15 cm) in a fifth of a beat

const soft = (power) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uPower: { value: power } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * f, 1.0);
      }`,
  });

/** The ventricles: a sphere pulled into a cone whose tip leans to the left and to the front. */
function ventricles() {
  const geo = new THREE.SphereGeometry(R, 56, 40);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i) / R;
    let y = p.getY(i) / R;
    let z = p.getZ(i) / R;
    const t = Math.min(1, Math.max(0, (0.15 - y) / 1.15)); // 0 at the base … 1 at the tip
    const taper = 1 - 0.66 * Math.pow(t, 1.3);
    x *= taper * (x < 0 ? 0.94 : 1.04);
    z *= taper * 0.9;
    y = y > 0 ? y * 0.8 : y * 1.42;
    x += 0.34 * t;
    z += 0.16 * t;
    p.setXYZ(i, x * R, y * R, z * R);
  }
  geo.computeVertexNormals();
  return geo;
}

const tube = (points, radius) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((q) => new THREE.Vector3(...q))), 40, radius, 18, false);

export function buildHeart() {
  const group = new THREE.Group();
  const fx = {};
  const A = {};

  /* ── the muscle: its own shading, and over it the electricity ── */
  const muscle = () =>
    new THREE.ShaderMaterial({
      uniforms: {
        uInk: { value: INK.clone() }, uSignal: { value: SIGNAL.clone() }, uVeille: { value: VEILLE.clone() },
        uTime: { value: 0 }, uChaos: { value: 0 }, uOrder: { value: 0 }, uFlash: { value: 0 }, uDim: { value: 1 },
        uNode: { value: NODE.clone() }, uWave: { value: -100 }, uSqueeze: { value: 0 }, uActive: { value: 1 }, uPulse: { value: -1 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime, uChaos, uSqueeze, uActive;
        attribute float crease;
        varying vec3 vP; varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying float vCrease;
        void main() {
          vec3 p = position;
          vP = position;
          vUv = uv;
          vCrease = crease;
          // fibrillation: it quivers — every patch on its own
          float q = sin(p.x * 1.9 + uTime * 23.0) * sin(p.y * 1.6 - uTime * 19.0) + sin(p.z * 2.3 + uTime * 27.0 + 1.3);
          p += normal * q * 0.085 * uChaos * uActive;
          // a beat: the muscle closes on itself, the tip rises a little
          p *= 1.0 - 0.075 * uSqueeze * uActive;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uSignal, uVeille, uNode;
        uniform float uTime, uChaos, uOrder, uFlash, uDim, uWave, uSqueeze, uActive, uPulse;
        varying vec3 vP; varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying float vCrease;
        float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float noise(vec3 p) {
          vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                     mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
        }
        void main() {
          vec3 n = normalize(vN);
          vec3 v = normalize(vV);
          float facing = clamp(abs(dot(n, v)), 0.0, 1.0);
          vec3 l = normalize(vec3(-0.4, 0.75, 0.5));
          float lam = 0.5 + 0.5 * dot(n, l);
          // a wet highlight, wide on purpose: the muscle quivers, a sharp one would sparkle
          float spec = pow(clamp(dot(n, normalize(l + v)), 0.0, 1.0), 34.0);
          float rim = pow(clamp(1.0 - facing, 0.0, 1.0), 2.4);
          // the furrows: between the atria and the ventricles (baked), between the two ventricles (down the front)
          float cavity = mix(1.0, smoothstep(0.0, 1.0, vCrease), uActive);
          float g = (vP.x * 0.92 - vP.y * 0.28 - 0.4) / 0.42;
          float groove = exp(-g * g) * (1.0 - smoothstep(1.5, 2.5, vP.y)) * smoothstep(-0.5, 0.5, vP.z) * uActive;
          float relief = mix(0.4, 1.0, cavity) * (1.0 - 0.4 * groove);
          // the muscle itself: dark, modelled by a light from above
          vec3 col = uInk * ((0.04 + 0.19 * lam * lam) * relief + 0.07 * rim) + uInk * 0.22 * spec * cavity;
          // its edge tells its state: signal in the chaos, nothing in the dark, veille when it beats
          col += (uSignal * uChaos * 0.3 + uVeille * uOrder * 0.6) * rim * uActive;
          // fibrillation: fronts that wander, meet, die — a noise bent by itself (a product of sines draws a chequerboard)
          vec3 q = vP * 0.42 + vec3(0.0, uTime * 0.55, uTime * 0.35);
          q += 0.9 * vec3(noise(q * 1.7 + 3.1), noise(q * 1.7 + 7.7), noise(q * 1.7 + 1.3));
          float patches = smoothstep(0.55, 0.72, noise(q * 1.3 + uTime * 0.8));
          col += uSignal * patches * uChaos * uActive * (0.5 + 1.5 * facing) * (1.0 - 0.8 * uFlash);
          // the beat: a front leaves the node, the muscle behind it is alight for a moment
          float d = distance(vP, uNode);
          float w = (d - uWave) / 1.15;
          float front = exp(-w * w);
          float wake = smoothstep(uWave - 9.0, uWave - 1.0, d) * (1.0 - smoothstep(uWave - 0.5, uWave + 0.5, d));
          col += uVeille * uOrder * uActive * (front * 2.3 + wake * 0.26 + uSqueeze * 0.1 + 0.26) * (0.45 + 0.55 * facing);
          // the blood that leaves: a pulse that runs up the vessel (along its length), after each squeeze
          float u = (vUv.x - uPulse) / 0.16;
          col += uInk * uOrder * (1.0 - uActive) * exp(-u * u) * 0.75 * (0.45 + 0.55 * facing);
          // the shock: every cell at once — brightest where the muscle faces us, its outline stays
          col += uInk * uFlash * 1.6 * (0.15 + 0.85 * facing * facing);
          gl_FragColor = vec4(col * uDim, 1.0);
        }`,
    });
  fx.muscle = muscle();
  fx.muscle.fog = false;
  // `crease`: how far a point of the muscle is from the next chamber (0 in the furrow … 1 at 1.4 cm). The shading
  // darkens the furrows: the shape reads as chambers, not as three balls.
  const ATRIA = [[1.9, 3.5, -1.7, 2.7], [-2.6, 3.4, 0.5, 2.9]];
  const bake = (geo, dist) => {
    const p = geo.attributes.position;
    const a = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) a[i] = Math.min(1, Math.max(0, dist(p.getX(i), p.getY(i), p.getZ(i)) / 1.4));
    geo.setAttribute("crease", new THREE.BufferAttribute(a, 1));
    return geo;
  };
  const toAtrium = ([cx, cy, cz, r], x, y, z) => Math.hypot(x - cx, y - cy, z - cz) - r;
  const toVentricles = (x, y, z) => (Math.hypot(x / (R * 0.99), y / (R * 0.8), z / (R * 0.9)) - 1) * R * 0.83; // their top: an ellipsoid
  const lower = new THREE.Mesh(bake(ventricles(), (x, y, z) => Math.min(...ATRIA.map((c) => toAtrium(c, x, y, z)))), fx.muscle);
  group.add(lower);
  ATRIA.forEach(([x, y, z, r], i) => {
    const geo = bake(new THREE.SphereGeometry(r, 32, 24).translate(x, y, z), (px, py, pz) => Math.min(toVentricles(px, py, pz), toAtrium(ATRIA[1 - i], px, py, pz)));
    group.add(new THREE.Mesh(geo, fx.muscle));
  });
  // the great vessels: what makes the shape a heart. They carry no electricity of their own.
  fx.vessels = muscle();
  fx.vessels.fog = false;
  fx.vessels.uniforms.uActive.value = 0;
  const AORTA = [[0.5, 3.0, 0.5], [0.3, 6.4, 0.5], [0.9, 9.0, 0.0], [2.9, 10.1, -1.5], [4.5, 8.6, -2.9], [4.9, 5.6, -3.4]];
  group.add(new THREE.Mesh(tube(AORTA, 1.25), fx.vessels));
  group.add(new THREE.Mesh(tube([[-0.9, 3.2, 2.0], [-0.3, 5.6, 2.3], [1.6, 7.3, 1.6], [3.7, 7.5, 0.4]], 1.12), fx.vessels));
  group.add(new THREE.Mesh(tube([[-3.3, 4.6, 0.1], [-3.5, 7.4, 0.0], [-3.4, 10.4, -0.2]], 0.95), fx.vessels));

  // its light, seen from the other end of a hall
  fx.halo = new THREE.Mesh(new THREE.SphereGeometry(13, 28, 20), soft(2.4));
  fx.halo.position.set(0.4, 0.5, 0);
  group.add(fx.halo);
  // the node: where a beat is born
  fx.node = new THREE.Mesh(new THREE.SphereGeometry(1.5, 20, 14), soft(1.6));
  fx.node.position.copy(NODE);
  group.add(fx.node);
  A.node = anchor(group, NODE.x, NODE.y, NODE.z);
  A.apex = anchor(group, 1.6, -6.4, 0.7);
  A.centre = anchor(group, 0.4, 0, 0);
  A.aorta = anchor(group, 2.9, 10.1, -1.5);

  const hue = new THREE.Color();
  const smooth = (a, b, x) => {
    const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  };
  let first = 1e9; // when it beats again, and how often
  let period = 0.9;

  /**
   * chaos   0 → 1: fibrillation (the wavelets, the quiver)
   * order   0 → 1: the beats (they start at the time given to \`restart\`)
   * flash   0 → 1: every cell fires at once (the shock)
   * dim     how bright the whole heart is · halo: how far its light carries (0 from close)
   */
  function update(S, time) {
    const since = time - first;
    const phase = since >= 0 ? (since / period) % 1 : -1;
    const wave = phase >= 0 && phase < BEAT.sweep * 1.6 ? (phase / BEAT.sweep) * BEAT.reach : -100;
    const squeeze = phase >= 0 ? smooth(0.05, 0.2, phase) * (1 - smooth(0.26, 0.62, phase)) : 0;
    for (const m of [fx.muscle, fx.vessels]) {
      const u = m.uniforms;
      u.uTime.value = time;
      u.uChaos.value = S.chaos;
      u.uOrder.value = S.order;
      u.uFlash.value = S.flash;
      u.uDim.value = S.dim;
      u.uWave.value = wave;
      u.uSqueeze.value = squeeze * S.order;
    }
    // the pulse leaves the heart as it squeezes and runs the length of the vessels (0 → 1) in a third of a beat
    fx.vessels.uniforms.uPulse.value = phase >= 0.1 && phase < 0.62 ? ((phase - 0.1) / 0.36) * 1.25 - 0.15 : -1;
    // the node fires just before the front leaves
    const spark = phase >= 0 ? Math.exp(-Math.pow((phase - 0.02) / 0.06, 2)) : 0;
    fx.node.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(2.4 * spark * S.order * S.dim);
    fx.node.visible = spark * S.order > 0.01;
    hue.copy(SIGNAL).multiplyScalar(0.5 * S.chaos).add(hue2.copy(VEILLE).multiplyScalar((0.12 + 0.4 * squeeze) * S.order)).add(hue2.copy(INK).multiplyScalar(0.8 * S.flash));
    fx.halo.material.uniforms.uColor.value.copy(hue).multiplyScalar(S.dim * (S.halo ?? 1));
    fx.halo.visible = (S.halo ?? 1) > 0.01;
  }
  const hue2 = new THREE.Color();

  return {
    group,
    fx,
    A,
    update,
    /** The beats start at \`time\`, one every \`every\` seconds. */
    restart(time, every = 0.9) {
      first = time;
      period = every;
    },
  };
}
