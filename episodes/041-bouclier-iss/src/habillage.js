// DOSSIER 041 — THE DECORATOR (docs/recette-decorateur.md): the life the station has in reality, around the system and
// never on it. station.js adds `group` to its own (not to the ship: the Earth does not dodge) and calls update() with the
// state it gets. Every touch follows a number that exists: `flown` (km along the orbit), `shell` (the station's X-ray),
// `dodge` (the loose things go where the station goes), `bench` (gone on the bench) — and `time` for a slow drift.
//   · THE EARTH AT NIGHT, 400 km down (« tu dors au-dessus des villes »): 026's dome draws a dark Earth and its limb, and
//     nothing on it moves. Here, over it, at infinity and with the same studio geometry (its limb, its lean): the lights
//     of towns and villages, sparse over the land, none over the sea, and the night's clouds, faint, dimming the lights
//     under them. They are pinned to the ground: as `flown` grows the ground slides toward +x — the station flies −x.
//     Never a point under 2.4 px (a light keeps its energy, spread), each level leaves before its cells crowd.
//   · THE LAB'S LOOSE THINGS (« en apesanteur, rien ne tombe »): the water pouch you drank before sleeping, a cargo bag
//     unpacked tonight, a binder of checklists left open — glass and fine lines, low in the lab, under you and your feet,
//     clear of the bumper and of the bille's path in the first frame. They drift a hair (nothing spins), and fade away
//     when the camera comes close (a camera that flies through the lab never brushes them).
// Three colours: everything here is ink.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, box, cyl, lineMat } from "@kit/build3d.js";
import { ORBIT, DODGE } from "./plan.js";

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const INK = new THREE.Color(BRAND.ink);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/* ───────────────────────────────────────────────────────────── the Earth at night */

/** 026's studio Earth (sky.js, KAPPA and kappaAt): the same lean, or the lights would not sit on its limb. */
const KAPPA = { max: 36, scale: 25, top: 93 };
const kappaAt = (alt) => (KAPPA.max * DEG * (1 - Math.exp(-Math.max(alt, 0) / KAPPA.scale))) / (1 - Math.exp(-KAPPA.top / KAPPA.scale));
const R_EARTH = 6371; // km

/**
 * Drawn at infinity like 026's dome, right after it (additive): for each ray that meets the studio Earth, where on the
 * ground it lands (km from the point under the station, along the ray's azimuth — like the dome's strata, fixed in
 * azimuth), then that ground shifted by `uFlown` km: the lights and the clouds are the ground's.
 */
const nightMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uInk: { value: INK.clone() },
      uGround: { value: -ORBIT.alt * 1e5 }, // cm: the ground under the station
      uKappa: { value: kappaAt(ORBIT.alt) },
      uFlown: { value: 0 }, // km
      uAmount: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position * 1000.0, 1.0);
        gl_Position = vec4(p.xy, p.w * 0.99995, p.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk;
      uniform float uGround, uKappa, uFlown, uAmount;
      varying vec3 vDir;
      const float HALF_PI = 1.5707963;
      const float R = ${R_EARTH.toFixed(1)};
      float hash(vec2 p) { p = fract(p * vec2(0.1031, 0.1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
      float vnoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      // the lights of one level: one settlement per cell at most (where the land holds people), a core and a faint halo;
      // never under 1.3 px of radius (the light keeps its energy, spread); the level leaves before its cells crowd
      float lights(vec2 G, float L, mat2 Ji, float det, float cell, float share, float r0, float r1, float k) {
        float show = smoothstep(6.0, 16.0, cell / L);
        if (show <= 0.0) return 0.0;
        vec2 c0 = floor(G / cell);
        float acc = 0.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 c = c0 + vec2(float(i), float(j));
            float h0 = hash(c + 0.37 * cell);
            if (h0 > share) continue;
            vec2 at = (c + 0.15 + 0.7 * vec2(hash(c + 3.7), hash(c + 9.1))) * cell;
            float h3 = hash(c + 21.3);
            float r = mix(r0, r1, h3 * h3);
            vec2 dG = G - at;
            float q = length(dG) / r;
            // its true footprint (squashed toward the limb); when that footprint holds less than a dot of 1.3 px, a round
            // dot of 1.3 px with the same light instead — a light never shrinks under the pixel, it fades
            float a = r * r / det; // px² / π
            vec2 dp = Ji * dG; // the offset in pixels
            float dot13 = (a / 1.69) * exp(-dot(dp, dp) / 1.69);
            float big = smoothstep(1.2, 2.6, a);
            if (q > 4.0 && dot(dp, dp) > 12.0) continue;
            // a town is not a disc: its sprawl is grainy where the grain still holds two pixels
            float grain = mix(1.0, 0.35 + 0.9 * vnoise(dG / max(0.32 * r, 0.05) + h3 * 17.0), smoothstep(2.0, 6.0, 0.32 * r / L));
            float shape = mix(dot13, exp(-q * q) * grain + 0.09 * exp(-0.2 * q * q), big);
            acc += k * (0.45 + 0.55 * h3) * shape;
          }
        }
        return acc * show;
      }
      void main() {
        vec3 d = normalize(vDir);
        vec3 eye = cameraPosition;
        float hk = max(eye.y - uGround, 1.0) * 1e-5; // km above the ground
        float dip = atan(sqrt(2.0 * R * hk + hk * hk) / R);
        vec3 fw = -vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec2 hv = fw.xz * length(fw.xz) - up.xz * fw.y;
        hv /= max(length(hv), 1e-5);
        float kap = min(uKappa, 0.45 * (HALF_PI - dip));
        vec3 C = vec3(hv.x * sin(kap), -cos(kap), hv.y * sin(kap));
        float th = acos(clamp(dot(d, C), -1.0, 1.0));
        float rho = HALF_PI - dip - kap; // the studio Earth's angular radius
        float e = th - rho; // radians from the limb: − the Earth
        float w = max(fwidth(e), 1e-6);
        float earth = 1.0 - smoothstep(-w, w, e);
        // the ground: the studio angle stretched to the true one, then where that ray meets a true sphere
        float tht = clamp(th / rho, 0.0, 1.0) * (HALF_PI - dip);
        float gam = asin(clamp((R + hk) / R * sin(tht), 0.0, 1.0)) - tht;
        float s = R * max(gam, 0.0);
        float az = atan(d.x, abs(d.z) < 1e-6 ? 1e-6 : d.z);
        vec2 G = s * vec2(sin(az), cos(az)) - vec2(uFlown, 0.0);
        vec2 gx = dFdx(G), gy = dFdy(G);
        float L = max(max(length(gx), length(gy)), 1e-4); // km per pixel, the worst way
        float det = max(abs(gx.x * gy.y - gx.y * gy.x), 1e-8); // km² per pixel
        mat2 Ji = mat2(gy.y, -gx.y, -gy.x, gx.x) / det; // ground offset → pixel offset
        if (earth <= 0.0) { gl_FragColor = vec4(0.0); return; }
        // the land (where people live) and the sea (nothing), on the scale of a coast
        float land = smoothstep(0.46, 0.6, 0.62 * vnoise(G / 1500.0 + 4.1) + 0.38 * vnoise(G / 520.0 - 2.3));
        // the night's clouds: their finer octaves leave before they would crawl
        float n = 0.0, a = 0.5, f = 1.0 / 700.0, tot = 0.0;
        for (int o = 0; o < 4; o++) {
          float keep = smoothstep(5.0, 14.0, 1.0 / (f * L));
          n += a * mix(0.5, vnoise(G * f + float(o) * 7.31), keep);
          tot += a; a *= 0.45; f *= 2.4;
        }
        float cloud = smoothstep(0.55, 0.7, n / tot);
        // people gather: the villages thick around some places, thin elsewhere
        float pop = smoothstep(0.3, 0.75, vnoise(G / 260.0 + 11.0));
        float glow = lights(G, L, Ji, det, 95.0, 0.85, 4.5, 14.0, 0.8) + (0.2 + 0.8 * pop) * (lights(G, L, Ji, det, 24.0, 0.7, 0.9, 2.8, 0.42) + lights(G, L, Ji, det, 7.0, 0.55, 0.35, 0.8, 0.22));
        glow = min(glow * land, 1.1) * (1.0 - 0.75 * cloud);
        float haze = smoothstep(0.003, 0.045, -e); // the air near the limb swallows them
        float k = earth * uAmount * (glow * haze + 0.032 * cloud * (0.4 + 0.6 * haze));
        gl_FragColor = vec4(uInk * k, 1.0);
      }`,
  });

/* ───────────────────────────────────────────────────────────── the lab's loose things */

/** Where they float (the lab's frame: centimetres, the origin at the impact point), how big they are, how they drift. */
const LOOSE = {
  // the water pouch you drank before sleeping: under your head, a little deeper in the lab than you
  pouch: { at: [10, -88, -92], rot: [0.25, -0.35, 0.3], amp: 2.2, period: 11.0, phase: 0.4 },
  // a cargo bag, unpacked tonight and left to drift: low, under your feet
  bag: { at: [135, -95, -110], rot: [0.18, -0.55, 0.12], amp: 2.6, period: 14.0, phase: 2.1 },
  // the binder of checklists, open: deeper, past your feet
  binder: { at: [225, -45, -200], rot: [0.35, 0.7, -0.4], amp: 2.0, period: 12.5, phase: 4.0 },
};

function makeLoose() {
  const group = new THREE.Group();
  group.name = "loose";
  const tone = 0.8;
  const G = {
    round: glass(BRAND.ink, { base: 0.003, rim: 0.17 * tone, power: 2.4, edge: 0.22 * tone, spec: 0.25 * tone, through: 0.16 }),
    flat: glass(BRAND.ink, { base: 0.003, rim: 0.07 * tone, power: 2.6, edge: 0.12 * tone, through: 0.14 }),
  };
  const fine = lineMat(BRAND.ink, 1.8, { opacity: 0.4 * tone });
  const strong = lineMat(BRAND.ink, 2.0, { opacity: 0.55 * tone });
  const lineMats = [fine, strong];
  const panes = [];
  const things = [];

  const thing = (key) => {
    const o = LOOSE[key];
    const g = new THREE.Group();
    g.position.set(...o.at);
    g.rotation.set(...o.rot, "YXZ");
    group.add(g);
    const t = { g, o, base: V(...o.at), rot: new THREE.Euler(...o.rot, "YXZ"), lines: [] };
    things.push(t);
    return t;
  };
  // a piece of glass, and its outline as fine lines (same place)
  const piece = (t, geometry, material, { at = [0, 0, 0], rot = [0, 0, 0], lines = fine } = {}) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...at);
    mesh.rotation.set(...rot);
    t.g.add(mesh);
    panes.push(mesh);
    if (lines) {
      const outline = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, 28)), lines);
      outline.position.copy(mesh.position);
      outline.rotation.copy(mesh.rotation);
      outline.renderOrder = 13;
      t.g.add(outline);
    }
    return mesh;
  };

  // the pouch: a flat bag of 10 × 16 cm, its straw and its clamp
  const pouch = thing("pouch");
  piece(pouch, box(10, 16, 1.6, 0.7), G.flat);
  piece(pouch, cyl(0.38, 7, 0.05, 16), G.round, { at: [2.6, 11.2, 0] });
  piece(pouch, box(1.8, 1.4, 1.4, 0.25), G.round, { at: [2.6, 9.2, 0] });

  // the cargo bag: a soft box of 50 × 25 × 42 cm, its lid seam, its handle
  const bag = thing("bag");
  piece(bag, box(50, 25, 42, 4), G.flat, { lines: strong });
  piece(bag, box(46, 0.6, 38, 0.25), G.flat, { at: [0, 7.5, 0] }); // the zip of the lid, all round
  const handle = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-9, 12.5, 0), V(-6, 17, 0), V(6, 17, 0), V(9, 12.5, 0)]), 16, 0.9, 6, false);
  piece(bag, handle, G.round, { lines: null });

  // the binder: open, its covers apart, three sheets fanned between them
  const binder = thing("binder");
  for (const [k, a] of [[0, -0.55], [1, 0.55]]) piece(binder, box(0.5, 22, 28, 0.2), G.flat, { at: [Math.sin(a) * 11, Math.cos(a) * 11, 0], rot: [0, 0, -a], lines: k ? fine : strong });
  for (const a of [-0.25, 0.02, 0.3]) piece(binder, box(0.12, 21, 27, 0.05), G.flat, { at: [Math.sin(a) * 10.5, Math.cos(a) * 10.5, 0], rot: [0, 0, -a] });
  piece(binder, cyl(0.9, 27, 0.1, 16), G.round, { rot: [Math.PI / 2, 0, 0], lines: null }); // the spine

  // no shell of their own: a shell would punch their shape out of the lab's glass behind them (a dark square); drawn
  // early, additive, they only add their faint rim to it — light glass in the lab's light
  asShell(panes, false);
  for (const mesh of panes) mesh.renderOrder = 4;

  const world = V();
  return {
    group,
    /** k: how much of them (the station's X-ray); dy: the dodge; eye: the camera, in the scene's frame. */
    update(k, dy, time, eye) {
      group.visible = k > 0.003;
      if (!group.visible) return;
      let near = 1;
      for (const t of things) {
        const { o, g } = t;
        const w = (TAU * time) / o.period + o.phase;
        g.position.set(t.base.x + o.amp * Math.sin(w), t.base.y + 0.7 * o.amp * Math.sin(0.77 * w + 1.3), t.base.z + 0.5 * o.amp * Math.sin(0.61 * w + 2.2));
        g.rotation.set(t.rot.x + 4 * DEG * Math.sin(0.83 * w), t.rot.y + 5 * DEG * Math.sin(0.57 * w + 0.6), t.rot.z + 3 * DEG * Math.sin(0.71 * w + 1.9), "YXZ");
        if (eye) near = Math.min(near, smooth(40, 130, world.set(g.position.x, g.position.y + dy, g.position.z).distanceTo(eye)));
      }
      group.position.y = dy;
      const a = k * near; // a camera flying through the lab never brushes them
      for (const mat of Object.values(G)) mat.uniforms.uAmount.value = a;
      for (const mat of lineMats) mat.opacity = mat.userData.base * a;
      group.visible = a > 0.003;
    },
  };
}

/* ───────────────────────────────────────────────────────────── the dressing */

/**
 * dressStation() → { group, update(P, time, px, eye) }
 *   P: the station's own state (`shell`, `dodge`, `flown`, `bench`).
 */
export function dressStation() {
  const group = new THREE.Group();
  group.name = "habillage";

  const night = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), nightMat());
  night.frustumCulled = false;
  night.renderOrder = -49; // right after 026's dome (−50), before everything else
  group.add(night);

  const loose = makeLoose();
  group.add(loose.group);

  return {
    group,
    update(P, time = 0, px = 1000, eye = null) {
      const onBench = (P.bench ?? 0) > 0.5;
      night.visible = !onBench;
      night.material.uniforms.uFlown.value = P.flown ?? 0;
      loose.update(onBench ? 0 : clamp01(P.shell ?? 0), DODGE.dy * clamp01(P.dodge ?? 0), time, eye);
    },
  };
}
