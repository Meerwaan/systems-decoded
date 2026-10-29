// DOSSIER 029 — the system: the avalanche airbag pack. Everything that belongs to it, as ONE object that world.js
// re-parents between your back (pente.js's A.pack, no rotation) and the bench (BENCHAT, turned by `upright`):
//   · the pack: dark matt fabric (three greys: the fabric, its reinforcements, the zip), a top compartment whose lid
//     snaps open when the balloon comes out — nothing that recalls a brand
//   · the harness: two shoulder straps over your shoulders and down your chest, a chest strap, a hip belt. Held as if
//     worn (hollow) on the bench: « a pack you wear »
//   · THE HANDLE on the LEFT strap at your sternum: a light grip, a veille ring that glows (`litHandle`)
//   · the cable, sheathed: up the strap, over the shoulder, into the pack, to the trigger. A head of light runs it
//     when `pull` moves (the handle « pulls a cable »)
//   · THE CARTRIDGE, the hero in metal (the lightest grey), standing against the back panel; on its head the trigger,
//     cut open toward the camera: the cable's lever drives a pin through the seal (`pierce`), a spark that has a place
//   · the venturi on top: a collar, SIX side intakes between posts, a throat, a diffuser, a short hose to the balloon.
//     The gas (veille dashes on a dark conductor) runs through it; the air around (ink dashes, twelve streams on dark
//     conductors) converges into its intakes (`draw`)
//   · THE BALLOON — ONE. Folded: a flat bundle under the lid. Full (≥ 150 L): a thick horseshoe that rises out of the
//     pack's top behind your head and wraps its sides and top, leaning back (never in front of the face). Coated
//     fabric that is lit (shading, seams, a rim), not a glow. It unfolds — out of the pack, unrolling up the arms,
//     then the top, then it goes taut — never a ball that swells from a point
//   · the hook's promise: the same full balloon as a veille outline (glass rim + edge) that grows out of the pack
// Centimetres, the pack's frame (plan.js): origin at the centre of the back panel, +x = YOUR LEFT, y up your spine,
// −z away from your back, +z toward your chest. Sizes are illustrative, never written.
// Liberty taken (docs/journal/029-model.md): the folded bundle sits higher and to the left of plan.js's BAG.folded
// (FOLD below) — at plan.js's place it went through the venturi.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, setGlow, glass, asShell, box, cyl, lathe, anchor, setPartOpacity } from "@kit/build3d.js";
import { PACK, HANDLE, CARTRIDGE, TRIGGER, VENTURI, BAG } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const VEILLE = new THREE.Color(BRAND.veille);
const INK = new THREE.Color(BRAND.ink);
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25); // the kit's: a part has weight

/* ─────────────────────────────────────────────────────────── the greys (three families) */
const GREY = {
  fabric: 0x2a3036, // the pack: dark, matt
  strap: 0x343b42, // the harness
  reinf: 0x4b535b, // reinforcements, the holster, the back pads
  zip: 0x9aa1a8, // the zips, the buckles
  mech: 0x8e959c, // the venturi, the trigger
  grip: 0xc6cacf, // the handle
  hero: 0xdfe2e5, // THE cartridge: the lightest
  dark: 0x15191d, // the conductors, the hose, the inner core
};

/* ─────────────────────────────────────────────────────────── where things stand (pack frame) */
const AX = { x: VENTURI.at[0], z: VENTURI.at[2] }; // the stack's axis: cartridge, trigger, venturi
const CART_Y0 = CARTRIDGE.at[1] - CARTRIDGE.h / 2; // −21
const CART_Y1 = CARTRIDGE.at[1] + CARTRIDGE.h / 2; // 5: the neck's top
const SEAL_Y = CART_Y1 + 1.02; // the seal sits on the valve collar (5 → 6)
const VENT_Y = VENTURI.at[1]; // 14
const FOLD = { at: [1, 23.3, -10.5], size: [18, 5, 10] }; // the folded bundle (see the header)
const LIDY = 17; // the lid covers the pack from here to its top
const HINGE = [0, PACK.h / 2 - 0.6, -PACK.d + 0.3]; // the lid's hinge: the top outer edge — it flips back, away from your head
const OPEN = 118 * DEG;

// THE EXPLODED VIEW — one vertical frame seen from az ≈ −30, read bottom → top in the voice's order: the handle (and
// its cable) in front, low · the cartridge · the venturi · the folded balloon. The pack and its harness step back.
// `to`: where the part's reference point goes at `explode` 1; `win`: [delay, span] of its move.
const EXP = {
  pack: { from: [0, 0, 0], to: [0, 0, -14], win: [0, 0.55] },
  harness: { from: [0, 0, 0], to: [0, 0, -14], win: [0, 0.55] },
  handle: { from: HANDLE.at, to: [-1, -22, 37], win: [0.05, 0.55] },
  cartridge: { from: [AX.x, CARTRIDGE.at[1], AX.z], to: [-6, 1, 34], win: [0.15, 0.55] },
  venturi: { from: [AX.x, VENT_Y, AX.z], to: [-6, 33, 34], win: [0.25, 0.55] },
  bag: { from: FOLD.at, to: [-3, 51, 31], win: [0.35, 0.55] },
};
for (const e of Object.values(EXP)) e.off = V(...e.to).sub(V(...e.from));

/* ─────────────────────────────────────────────────────────── a tube swept along points, rewritten in place */
/**
 * `n` rings of `radial` + 1 vertices. Write the centre line into `P`, the two half-axes of each ring into `RA` (along
 * N) and `RB` (along B), and call update(): positions, normals, `aS` (cm run since the first ring), `aRad` and `aSeam`
 * (s, around) are rewritten in place — no allocation. Frames: carried along the line from `hint` (no twist at a
 * bend), or, with `OUT` and `useOut`, N set by an outward vector per ring (a flat band lying on a body).
 * `onPath`: the vertices stay ON the line (a sheath shader pushes them out by their radius or a few pixels).
 */
function makeSweep(n, radial, { onPath = false, hint = V(1, 0, 0) } = {}) {
  const ring = radial + 1;
  const count = n * ring;
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const sA = new Float32Array(count);
  const rA = new Float32Array(count);
  const seam = new Float32Array(count * 2);
  const index = [];
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < radial; j++) {
      const a = (i - 1) * ring + j;
      index.push(a, a + 1, a + ring, a + ring, a + 1, a + ring + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  const attr = (name, arr, k) => geo.setAttribute(name, new THREE.BufferAttribute(arr, k).setUsage(THREE.DynamicDrawUsage));
  attr("position", pos, 3);
  attr("normal", nor, 3);
  attr("aS", sA, 1);
  attr("aRad", rA, 1);
  attr("aSeam", seam, 2);
  geo.setIndex(index);
  const COS = Float32Array.from({ length: ring }, (_, j) => Math.cos((j / radial) * Math.PI * 2));
  const SIN = Float32Array.from({ length: ring }, (_, j) => Math.sin((j / radial) * Math.PI * 2));
  const sw = {
    geo, n, P: Array.from({ length: n }, () => V()), OUT: Array.from({ length: n }, () => V(0, 0, 1)),
    RA: new Float32Array(n).fill(1), RB: new Float32Array(n).fill(1), WR: new Float32Array(n), useOut: false, hint, length: 0,
  };
  const T = V();
  const T0 = V();
  const N = V();
  const B = V();
  const ax = V();
  const d = V();
  const nd = V();
  sw.update = () => {
    const { P, OUT, RA, RB, WR } = sw;
    let s = 0;
    for (let i = 0; i < n; i++) {
      if (i) s += P[i].distanceTo(P[i - 1]);
      T.subVectors(P[Math.min(n - 1, i + 1)], P[Math.max(0, i - 1)]);
      if (T.lengthSq() < 1e-10) T.copy(i ? T0 : V(0, 1, 0));
      else T.normalize();
      if (sw.useOut) {
        B.crossVectors(T, OUT[i]);
        if (B.lengthSq() < 1e-10) B.set(1, 0, 0);
        B.normalize();
        N.crossVectors(B, T);
      } else {
        if (i === 0) N.copy(sw.hint).addScaledVector(T, -sw.hint.dot(T));
        else {
          ax.crossVectors(T0, T);
          const sin = ax.length();
          if (sin > 1e-7) N.applyAxisAngle(ax.divideScalar(sin), Math.atan2(sin, T0.dot(T)));
          N.addScaledVector(T, -N.dot(T));
        }
        if (N.lengthSq() < 1e-10) N.set(T.y, -T.x, 0).lengthSq() < 1e-10 && N.set(1, 0, 0);
        N.normalize();
        B.crossVectors(T, N);
      }
      T0.copy(T);
      const p = P[i];
      for (let j = 0; j < ring; j++) {
        const c = COS[j];
        const sn = SIN[j];
        const wr = 1 + WR[i] * Math.sin(3 * (j / radial) * Math.PI * 2 + s * 0.9);
        const ra = RA[i] * wr;
        const rb = RB[i] * wr;
        const k = i * ring + j;
        d.copy(N).multiplyScalar(c * ra).addScaledVector(B, sn * rb);
        nd.copy(N).multiplyScalar(c * Math.max(rb, 1e-3)).addScaledVector(B, sn * Math.max(ra, 1e-3)).normalize();
        if (onPath) {
          pos[k * 3] = p.x;
          pos[k * 3 + 1] = p.y;
          pos[k * 3 + 2] = p.z;
        } else {
          pos[k * 3] = p.x + d.x;
          pos[k * 3 + 1] = p.y + d.y;
          pos[k * 3 + 2] = p.z + d.z;
        }
        nor[k * 3] = nd.x;
        nor[k * 3 + 1] = nd.y;
        nor[k * 3 + 2] = nd.z;
        sA[k] = s;
        rA[k] = RA[i];
        seam[k * 2] = s;
        seam[k * 2 + 1] = j / radial;
      }
    }
    sw.length = s;
    for (const name of ["position", "normal", "aS", "aRad", "aSeam"]) geo.attributes[name].needsUpdate = true;
  };
  return sw;
}

/** A static sweep through `pts` (sampled smooth), radius `r`: the geometry, written once. */
function tubeGeo(pts, r, { samples = 32, radial = 10, onPath = false, curve = true } = {}) {
  const line = curve ? new THREE.CatmullRomCurve3(pts.map((p) => V(...p)), false, "centripetal").getSpacedPoints(samples - 1) : pts.map((p) => V(...p));
  const sw = makeSweep(line.length, radial, { onPath });
  line.forEach((p, i) => sw.P[i].copy(p));
  sw.RA.fill(r);
  sw.RB.fill(r);
  sw.update();
  return sw;
}

/* ─────────────────────────────────────────────────────────── light that has a place */
const BARS = /* glsl */ `
  // bars of light, their ends softened over what a pixel covers — melted into their mean once too small to count
  float bars(float x, float duty) {
    float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
    float q = fract(x);
    float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
    return mix(b, duty, smoothstep(0.12, 0.4, w));
  }`;
const SHEATH_VERTEX = /* glsl */ `
  attribute float aS; attribute float aRad; uniform float uMinPx; uniform float uGrow;
  varying float vS; varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 c = modelViewMatrix * vec4(position, 1.0);
    float cmPerPx = max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2});
    vec4 mv = modelViewMatrix * vec4(position + normal * max(aRad * uGrow, uMinPx * cmPerPx), 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vS = aS;
    gl_Position = projectionMatrix * mv;
  }`;
/**
 * A sheath of light round a conductor (s = 0 where the flow comes from). `uHead` cm: the flow's front — lit behind it,
 * a head of light at it (`uTip`); `uLevel`: wide dashes running toward +s at `speed` cm/s, a period of `period` cm —
 * at 30 frames a second they move by at most a seventh of their period (004: at half a period they hop). `uFade`: cm
 * over which the far end fades in (the air comes from nowhere). `uBase`: the steady glow behind the head.
 */
function sheathMaterial(color, { period = 2.4, duty = 0.5, speed = 9, minPx = 2.4, hdr = 1 } = {}) {
  if (speed / 30 > period / 7) throw new Error("model.js: dashes faster than a seventh of their period per frame strobe");
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color).multiplyScalar(hdr) }, uTime: { value: 0 }, uHead: { value: 0 }, uTip: { value: 0 }, uLevel: { value: 0 },
      uBase: { value: 0.3 }, uAmount: { value: 0 }, uFade: { value: 0 }, uMinPx: { value: minPx }, uGrow: { value: 1 },
    },
    vertexShader: SHEATH_VERTEX,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime, uHead, uTip, uLevel, uBase, uAmount, uFade;
      varying float vS; varying vec3 vN; varying vec3 vV;
      ${BARS}
      void main() {
        float body = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.1);
        float behind = 1.0 - smoothstep(uHead - 0.8, uHead + 0.15, vS);
        float dash = bars((vS - uTime * ${speed.toFixed(3)}) / ${period.toFixed(3)}, ${duty.toFixed(2)});
        float line = behind * (uBase + uLevel * (0.25 + 1.15 * dash));
        float gap = vS - uHead;
        float tip = uTip * 1.6 * exp(-gap * gap / 0.9);
        float fade = uFade > 0.0 ? smoothstep(0.0, uFade, vS) : 1.0;
        gl_FragColor = vec4(uColor * min(line + tip, 2.6) * body * fade * uAmount, 1.0);
      }`,
  });
}
function sheathMesh(geo, mat) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return mesh;
}

/** A ball of light with no edge, always facing the eye (012): a small hot heart, a soft body, a long tail. */
const ballMaterial = (heart, hue) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uRadius, uMinPx; varying vec2 vUv;
      void main() {
        vUv = position.xy;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        c.xy += position.xy * r;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        float core = exp(-r2 / 0.012);
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(clamp(r2, 0.0, 4.0))));
        gl_FragColor = vec4((uHeart * (core * 2.4) + uHue * (body + tail)) * uAmount, 1.0);
      }`,
  });
function makeBall(heart, hue, pos, radius, minPx) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ballMaterial(heart, hue));
  mesh.position.set(...pos);
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  mesh.visible = false;
  mesh.material.uniforms.uRadius.value = radius;
  mesh.material.uniforms.uMinPx.value = minPx;
  return mesh;
}

/**
 * The balloon's coated fabric: a lit veille solid (it has shading: a volume, not a stain), its seams drawn in the
 * shader — four along the tube, one round it every 22 cm — melted away once finer than a pixel can hold, and a rim.
 * `uLit` lifts it when the voice names it.
 */
function balloonMaterial() {
  const mat = new THREE.MeshStandardMaterial({ color: VEILLE.clone().multiplyScalar(0.6), roughness: 0.52, metalness: 0, emissive: VEILLE.clone().multiplyScalar(0.06), envMapIntensity: 0.6 });
  mat.userData.finish = false; // fabric, not a machined part
  mat.userData.base = 1;
  mat.userData.transparent = false;
  mat.userData.depthWrite = true;
  const U = { uRim: { value: VEILLE.clone().multiplyScalar(0.32) }, uLit: { value: 0 } };
  mat.userData.u = U;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = "attribute vec2 aSeam;\nvarying vec2 vSeam;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n  vSeam = aSeam;");
    sh.fragmentShader =
      "varying vec2 vSeam;\nuniform vec3 uRim;\nuniform float uLit;\n" +
      sh.fragmentShader.replace(
        "#include <normal_fragment_maps>",
        /* glsl */ `#include <normal_fragment_maps>
        {
          float xl = vSeam.y * 4.0 + 0.125; // four seams along the tube
          float xr = vSeam.x / 22.0; //         one round it every 22 cm
          float wl = fwidth(xl);
          float wr = fwidth(xr);
          float ql = abs(fract(xl + 0.5) - 0.5);
          float qr = abs(fract(xr + 0.5) - 0.5);
          float sl = (1.0 - smoothstep(0.01, 0.01 + wl * 1.5, ql)) * (1.0 - smoothstep(0.02, 0.06, wl));
          float sr = (1.0 - smoothstep(0.012, 0.012 + wr * 1.5, qr)) * (1.0 - smoothstep(0.03, 0.09, wr));
          float seam = max(sl, sr);
          diffuseColor.rgb *= 1.0 - 0.5 * seam;
          float rimF = pow(clamp(1.0 - abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0), 3.0);
          totalEmissiveRadiance += uRim * rimF + diffuseColor.rgb * uLit * 0.45;
        }`,
      );
  };
  mat.customProgramCacheKey = () => "sd-029-balloon";
  return mat;
}

/* ─────────────────────────────────────────────────────────── the balloon's shape */
// One arm (+x, your left), from its end inside the compartment to the crown over your head; the other mirrors it.
// The head (plan.js YOU.head, in this frame) is at (0, 38.5, 12): the arms pass beside it, the crown above and behind.
const ARM = [[9, 28, -11], [15, 32.5, -10.5], [24, 38, -8], [30, 48, -3], [26, 66, -10], [13, 77, -17], [0, 80, -19]];
const BALLOON = { rings: 97, radial: 28, tube: 16.5 };
const FULL = new THREE.CatmullRomCurve3([...ARM.map(([x, y, z]) => V(-x, y, z)), ...ARM.slice(0, -1).reverse().map(([x, y, z]) => V(x, y, z))], false, "centripetal").getSpacedPoints(BALLOON.rings - 1);
const FOLDLINE = FULL.map((_, i) => {
  const s = i / (BALLOON.rings - 1);
  return V(FOLD.at[0] - 8 + 16 * s, FOLD.at[1] + 1.2, FOLD.at[2] + 2.2 * Math.sin(s * Math.PI * 5));
});
const FULL_R = FULL.map((_, i) => {
  const s = i / (BALLOON.rings - 1);
  return BALLOON.tube * (0.45 + 0.55 * smooth(clamp01(Math.min(s, 1 - s) / 0.1))); // its ends bulge out of the compartment: no funnel
});
const FROM_END = FULL.map((_, i) => 2 * Math.min(i, BALLOON.rings - 1 - i) / (BALLOON.rings - 1)); // 0 at the ends, 1 at the crown
/** Write the balloon at unfolding `u` into a sweep: the arms come out of the pack first, the crown last, then taut. */
function shapeBalloon(sw, u, crumple = 0.06) {
  const taut = smooth(ramp(u, 0.62, 1));
  for (let i = 0; i < BALLOON.rings; i++) {
    const e = FROM_END[i];
    const w = smooth(ramp(u, e * 0.28, e * 0.28 + 0.62)); // how far this ring has come out (the crown not far behind: ONE balloon, never two lobes)
    sw.P[i].lerpVectors(FOLDLINE[i], FULL[i], w);
    const r = FULL_R[i] * (0.3 + 0.7 * w) * (0.86 + 0.14 * taut);
    sw.RA[i] = r;
    sw.RB[i] = r * (0.38 + 0.62 * Math.max(taut, w * w)); // flat while it comes out
    sw.WR[i] = crumple * w * (1 - taut); // crumpled, then smooth
  }
  sw.update();
}

/* ─────────────────────────────────────────────────────────── the harness (bands lying on the body) */
// [x, y, z, outward normal]: the left shoulder strap, from the back panel over the shoulder, down the chest, under the arm
const STRAP_L = [
  [9, 15, -1.2, 0, 0, -1], [9, 21, -0.5, 0, 0.5, -0.85], [9.5, 24.2, 3, 0, 0.92, -0.4], [10, 25.1, 9, 0, 1, 0], [10, 23.8, 15, 0, 0.7, 0.7],
  [9.5, 18.6, 19.4, 0, 0.25, 1], [9, 10, 20.2, 0, 0, 1], [9, 0, 20, 0, 0, 1], [9.4, -9, 19, 0.1, 0, 1], [10.8, -15, 16.8, 0.45, 0, 0.9],
  [13.2, -18.6, 11.5, 0.9, 0, 0.4], [14.4, -19.6, 5, 1, 0, 0], [14.6, -19.6, -1.5, 1, 0, 0],
];
const HIP = [[-14.6, -22, -1, -1, 0, 0], [-14.2, -22, 8, -0.95, 0, 0.3], [-9.5, -22, 15.8, -0.5, 0, 0.87], [0, -22, 18.6, 0, 0, 1], [9.5, -22, 15.8, 0.5, 0, 0.87], [14.2, -22, 8, 0.95, 0, 0.3], [14.6, -22, -1, 1, 0, 0]];
const CHEST = [[-9.4, 2, 20.6, 0, 0, 1], [0, 2.4, 21.2, 0, 0, 1], [9.4, 2, 20.6, 0, 0, 1]];
function bandGeo(rows, thick, width, samples) {
  const curve = new THREE.CatmullRomCurve3(rows.map((r) => V(r[0], r[1], r[2])), false, "centripetal");
  const outs = new THREE.CatmullRomCurve3(rows.map((r) => V(r[3], r[4], r[5])), false, "centripetal");
  const sw = makeSweep(samples, 16);
  sw.useOut = true;
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    sw.P[i].copy(curve.getPointAt(t));
    sw.OUT[i].copy(outs.getPoint(t)).normalize();
  }
  sw.RA.fill(thick / 2);
  sw.RB.fill(width / 2);
  sw.update();
  return sw.geo;
}

/* ─────────────────────────────────────────────────────────── the cable's route */
const HANDLE_TOP = [HANDLE.at[0], HANDLE.at[1] + HANDLE.size[1] / 2, HANDLE.at[2] - 0.4];
const LEVER = [AX.x + 2.7, TRIGGER.at[1] + 0.9, AX.z]; // where the cable enters the trigger (its +x side)
const CABLE_ON = [HANDLE_TOP, [9, 2.6, 21], [10.4, 10, 20.8], [10.6, 18.6, 20.3], [11, 24.2, 15.6], [11, 26.2, 9], [10.4, 25, 2.5], [9, 21.4, -1.6], [4, 15, -4.6], [-1.5, 10.6, -6.6], LEVER];
const T_OFF = EXP.cartridge.off; // the trigger goes with the cartridge
const H_OFF = EXP.handle.off;
const CABLE_EXP = [
  [HANDLE_TOP[0] + H_OFF.x, HANDLE_TOP[1] + H_OFF.y, HANDLE_TOP[2] + H_OFF.z], [4, -14, 37], [5, 2, 36.5], [4.2, 12, 35.5],
  [LEVER[0] + T_OFF.x + 1.6, LEVER[1] + T_OFF.y - 0.6, LEVER[2] + T_OFF.z + 0.6], [LEVER[0] + T_OFF.x, LEVER[1] + T_OFF.y, LEVER[2] + T_OFF.z],
];
const CABLE_N = 56;
const CABLE_A = new THREE.CatmullRomCurve3(CABLE_ON.map((p) => V(...p)), false, "centripetal").getSpacedPoints(CABLE_N - 1);
const CABLE_B = new THREE.CatmullRomCurve3(CABLE_EXP.map((p) => V(...p)), false, "centripetal").getSpacedPoints(CABLE_N - 1);

/* ─────────────────────────────────────────────────────────── the gas's path: [point, the part it rides with, samples to the next] */
const GAS = [
  [[AX.x, SEAL_Y + 0.05, AX.z], "cartridge", 2],
  [[AX.x, TRIGGER.at[1] + 1.6, AX.z], "cartridge", 4],
  [[AX.x, VENT_Y - 4.6, AX.z], "venturi", 8],
  [[AX.x, VENT_Y + 6.4, AX.z], "venturi", 3],
  [[AX.x + 0.2, VENT_Y + 7.6, AX.z - 0.9], "venturi", 3],
  [[AX.x + 0.5, VENT_Y + 8.4, AX.z - 2.6], "bag", 3],
  [[FOLD.at[0] - 7.6, FOLD.at[1] + 0.4, FOLD.at[2] - 0.4], "bag", 0],
];
const GAS_N = GAS.reduce((n, g) => n + g[2], 1);
const HOSE_FROM = 3; // the hose runs from GAS[3] (the venturi's outlet) to the end

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════ */

export function buildModel() {
  const root = new THREE.Group();
  root.name = "airbag";

  /* ── the pack ── */
  const pack = makePart("pack");
  const fabric = solid(GREY.fabric, { rough: 0.86, metal: 0, env: 0.5 });
  const reinf = solid(GREY.reinf, { rough: 0.8, metal: 0, env: 0.5 });
  const zip = solid(GREY.zip, { rough: 0.45, metal: 0.3 });
  for (const m of [fabric, reinf]) m.userData.finish = false;
  const bodyGeo = box(PACK.w, LIDY + PACK.h / 2, PACK.d, 4.2);
  const body = addMesh(pack, bodyGeo, fabric, { pos: [0, (LIDY - PACK.h / 2) / 2, -PACK.d / 2], edgeOpacity: 0.55 });
  addMesh(pack, box(PACK.w + 0.6, 6, PACK.d + 0.6, 3), reinf, { pos: [0, -PACK.h / 2 + 2.9, -PACK.d / 2], edgeOpacity: 0.5 }); // the bottom
  for (const sx of [-1, 1]) addMesh(pack, box(10, 34, 2, 1.4), reinf, { pos: [sx * 7.2, -4, 0.7], edgeOpacity: 0.45 }); // the back pads
  for (const y of [-11, 3]) addMesh(pack, box(PACK.w + 0.8, 2.2, 1.2, 0.5), reinf, { pos: [0, y, -PACK.d - 0.1], edgeOpacity: 0.5 }); // compression straps
  for (const y of [-11, 3]) addMesh(pack, box(3, 3, 1.2, 0.5), zip, { pos: [9.5, y, -PACK.d - 0.6] }); // their buckles
  addMesh(pack, box(1, 25, 0.6, 0.25), zip, { pos: [-4.5, -7, -PACK.d - 0.15] }); // the zip on the outer face
  addMesh(pack, box(1.4, 3, 0.8, 0.3), zip, { pos: [-4.5, 6.2, -PACK.d - 0.45] }); // its pull
  // the lid of the top compartment, on its hinge (the top outer edge): it flips back when the balloon comes out
  const lidPivot = new THREE.Group();
  lidPivot.position.set(...HINGE);
  pack.add(lidPivot);
  const lidGeo = box(PACK.w + 0.6, PACK.h / 2 - LIDY + 1.6, PACK.d + 0.6, 3.6);
  const lidAt = [0, (PACK.h / 2 + LIDY) / 2 - 0.4 - HINGE[1], -PACK.d / 2 - HINGE[2]];
  const lid = addMesh(pack, lidGeo, fabric, { pos: lidAt, edgeOpacity: 0.6 });
  lidPivot.add(lid);
  const lidZip = addMesh(pack, box(PACK.w - 4, 0.7, 0.5, 0.2), zip, { pos: [0, lidAt[1] - 3.4, lidAt[2] - PACK.d / 2 - 0.35] });
  lidPivot.add(lidZip);
  // …and the same fabric as glass, for `seethru` (not in the part's materials: it has its own amount)
  const packGlass = glass(BRAND.ink, { base: 0, rim: 0.26, power: 2.6, edge: 0.35, through: 0.22 });
  // (outside the part: when the solid fades to 0 the part hides, the glass must stay)
  const glassG = new THREE.Group();
  const glassLid = new THREE.Group();
  glassLid.position.copy(lidPivot.position);
  const bodyShell = new THREE.Mesh(bodyGeo, packGlass);
  bodyShell.position.copy(body.position);
  const lidShell = new THREE.Mesh(lidGeo, packGlass);
  lidShell.position.copy(lid.position);
  glassG.add(bodyShell, glassLid);
  glassLid.add(lidShell);
  asShell([bodyShell, lidShell], 22);

  /* ── the harness ── */
  const harness = makePart("harness");
  const zipH = solid(GREY.zip, { rough: 0.45, metal: 0.3 });
  const reinfH = solid(GREY.reinf, { rough: 0.8, metal: 0, env: 0.5 });
  reinfH.userData.finish = false;
  const strapMat = solid(GREY.strap, { rough: 0.82, metal: 0, env: 0.5 });
  strapMat.userData.finish = false;
  const strapGeo = bandGeo(STRAP_L, 1.3, 5.4, 64);
  addMesh(harness, strapGeo, strapMat, { edges: false });
  addMesh(harness, strapGeo.clone().scale(-1, 1, 1), strapMat, { edges: false });
  // a scaled −1 copy turns its faces inside out: flip its winding back
  {
    const m = harness.children[1];
    const idx = m.geometry.index.array;
    for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
  }
  addMesh(harness, bandGeo(HIP, 1.2, 4.6, 48), strapMat, { edges: false });
  addMesh(harness, bandGeo(CHEST, 0.8, 2.2, 16), strapMat, { edges: false });
  addMesh(harness, box(4, 3, 1.5, 0.5), zipH, { pos: [0, -22, 19.2] }); // the hip buckle
  addMesh(harness, box(3.2, 2.2, 1.2, 0.4), zipH, { pos: [0, 2.4, 21.6] }); // the chest buckle
  addMesh(harness, box(8.4, 6.2, 1, 0.45), reinfH, { pos: [HANDLE.at[0], HANDLE.at[1] - 0.4, 20.6], edgeOpacity: 0.5 }); // the holster

  /* ── THE HANDLE ── */
  const handle = makePart("handle");
  const gripMat = solid(GREY.grip, { rough: 0.42, metal: 0.1, coat: 0.4 });
  addMesh(handle, box(...HANDLE.size, 1.1), gripMat, { pos: HANDLE.at, edgeOpacity: 0.7 });
  const ringGlow = glow(BRAND.veille, 1);
  addMesh(handle, box(1.5, HANDLE.size[1] + 0.5, HANDLE.size[2] + 0.5, 0.5), ringGlow, { pos: HANDLE.at, edges: false });
  const handleBall = makeBall(new THREE.Color(1, 1, 1).lerp(VEILLE, 0.35), VEILLE, [HANDLE.at[0], HANDLE.at[1], HANDLE.at[2] + 1.6], 4.5, 9);
  handle.add(handleBall);

  /* ── the cable ── */
  const cable = makePart("cable");
  const cableMat = solid(GREY.dark, { rough: 0.55, metal: 0.2 });
  const cableSw = makeSweep(CABLE_N, 8);
  cableSw.RA.fill(0.4);
  cableSw.RB.fill(0.4);
  const cableMesh = addMesh(cable, cableSw.geo, cableMat, { edges: false });
  cableMesh.frustumCulled = false;
  const cableLight = makeSweep(CABLE_N, 8, { onPath: true });
  cableLight.RA.fill(0.52);
  cableLight.RB.fill(0.52);
  const cableGlow = sheathMaterial(BRAND.veille, { period: 3, speed: 6, minPx: 2.2, hdr: 1 });
  cableGlow.uniforms.uBase.value = 0.55;
  cable.add(sheathMesh(cableLight.geo, cableGlow));

  /* ── THE CARTRIDGE and its trigger ── */
  const cartridge = makePart("cartridge");
  const heroMat = solid(GREY.hero, { rough: 0.32, metal: 0.45, coat: 0.6, coatRough: 0.25 });
  heroMat.userData.finish = false; // the machining rings read as a ribbed bottle (plank of 22/10): a smooth lacquered cylinder
  const trigMat = solid(GREY.mech, { rough: 0.4, metal: 0.4 }); // each part its own materials (setPartOpacity)
  const darkMat = solid(GREY.dark, { rough: 0.6, metal: 0.1 });
  const c = CARTRIDGE.r;
  const neckR = 1.55;
  addMesh(cartridge, lathe([[0, CART_Y0], [c - 0.4, CART_Y0], [c, CART_Y0 + 0.6], [c, CART_Y1 - 4.6], [c - 0.5, CART_Y1 - 2.4], [2.2, CART_Y1 - 1.1], [neckR, CART_Y1 - 0.7], [neckR, CART_Y1], [0, CART_Y1]], 64, { bevel: 0.25, round: 2 }), heroMat, { pos: [AX.x, 0, AX.z], edgeOpacity: 0.6 });
  addMesh(cartridge, cyl(c + 0.08, 2.2, 0.3), trigMat, { pos: [AX.x, CART_Y0 + 4, AX.z], edgeOpacity: 0.5 }); // a band (the valve's thread is up top: this one says « a bottle »)
  // the trigger, cut open toward the camera (az ≈ −40): a collar on the neck, a cap, two posts behind, the pin and its lever inside
  const trig = TRIGGER;
  const ty0 = CART_Y1; // 5: the collar's foot
  addMesh(cartridge, cyl(trig.r, 1, 0.2), trigMat, { pos: [AX.x, ty0 + 0.5, AX.z], edgeOpacity: 0.6 }); // the collar (5 → 6)
  const sealMat = solid(0xf2f3f4, { rough: 0.25, metal: 0.4 });
  addMesh(cartridge, cyl(1.3, 0.12, 0.03), sealMat, { pos: [AX.x, SEAL_Y, AX.z], edges: false }); // THE SEAL
  const holeMat = solid(0x050607, { rough: 0.9 });
  const hole = addMesh(cartridge, cyl(0.55, 0.14, 0.02, 24), holeMat, { pos: [AX.x, SEAL_Y + 0.02, AX.z], edges: false });
  const capY = trig.at[1] + trig.h / 2 - 0.5; // the cap: 9 → 10 (the venturi's collar sits on it)
  addMesh(cartridge, cyl(trig.r, 1, 0.2), trigMat, { pos: [AX.x, capY, AX.z], edgeOpacity: 0.6 });
  const WIN = -40 * DEG; // the window faces the bench camera
  for (const a of [WIN + Math.PI - 0.75, WIN + Math.PI + 0.75]) {
    addMesh(cartridge, box(1.3, capY - 0.5 - (ty0 + 1), 1, 0.25), trigMat, { pos: [AX.x + Math.sin(a) * (trig.r - 0.55), (capY - 0.5 + ty0 + 1) / 2, AX.z + Math.cos(a) * (trig.r - 0.55)], rot: [0, a, 0], edgeOpacity: 0.5 });
  }
  const pin = new THREE.Group();
  pin.position.set(AX.x, 0, AX.z);
  cartridge.add(pin);
  const PIN_Y = SEAL_Y + 0.45; // its tip, at rest
  const pinMesh = addMesh(cartridge, lathe([[0, PIN_Y], [0.12, PIN_Y + 0.05], [0.34, PIN_Y + 0.7], [0.34, capY - 0.5], [0, capY - 0.5]], 24, { bevel: 0.05 }), sealMat, { edgeOpacity: 0.6 });
  pinMesh.position.set(-AX.x, 0, -AX.z);
  pin.add(pinMesh);
  const lever = new THREE.Group(); // the cable's lever: pivots at its outer end, pushes the pin down
  lever.position.set(LEVER[0], LEVER[1], LEVER[2]);
  cartridge.add(lever);
  const leverMesh = addMesh(cartridge, box(2.9, 0.6, 0.9, 0.2), darkMat, { pos: [-1.3, 0, 0], edgeOpacity: 0.8 });
  lever.add(leverMesh);
  const spark = makeBall(new THREE.Color(1, 1, 1).lerp(VEILLE, 0.25), VEILLE, [AX.x, SEAL_Y + 0.15, AX.z], 2.6, 7);
  cartridge.add(spark);

  /* ── the venturi ── */
  const venturi = makePart("venturi");
  const mechMat = solid(GREY.mech, { rough: 0.4, metal: 0.4 });
  const chamberMat = solid(GREY.dark, { rough: 0.6, metal: 0.1 });
  const vy = VENT_Y;
  addMesh(venturi, cyl(3, 1.4, 0.25), mechMat, { pos: [AX.x, vy - 4.3, AX.z], edgeOpacity: 0.6 }); // the collar on the trigger (9 → 10.4)
  addMesh(venturi, cyl(VENTURI.r, 0.7, 0.2), mechMat, { pos: [AX.x, vy - 3.25, AX.z], edgeOpacity: 0.6 }); // the lower ring
  const INTAKE = { y0: vy - 2.9, y1: vy + 0.3 }; // the six windows, between six posts
  for (let k = 0; k < VENTURI.intakes; k++) {
    const a = (k / VENTURI.intakes) * Math.PI * 2;
    addMesh(venturi, box(2.1, INTAKE.y1 - INTAKE.y0, 1.0, 0.25), mechMat, { pos: [AX.x + Math.sin(a) * (VENTURI.r - 0.55), (INTAKE.y0 + INTAKE.y1) / 2, AX.z + Math.cos(a) * (VENTURI.r - 0.55)], rot: [0, a, 0], edgeOpacity: 0.55 });
  }
  addMesh(venturi, cyl(2.1, INTAKE.y1 - INTAKE.y0 + 0.2, 0.1), chamberMat, { pos: [AX.x, (INTAKE.y0 + INTAKE.y1) / 2, AX.z], edges: false }); // the chamber inside, dark
  addMesh(venturi, lathe([[0, vy + 0.3], [VENTURI.r, vy + 0.3], [VENTURI.r, vy + 1.0], [2.5, vy + 2.2], [2.45, vy + 2.7], [3.7, vy + 5.4], [1.7, vy + 5.8], [1.6, vy + 6.6], [0, vy + 6.6]], 64, { bevel: 0.22, round: 2 }), mechMat, { edgeOpacity: 0.6 }).position.set(AX.x, 0, AX.z); // the throat, the diffuser, the outlet

  // the air drawn in: twelve streams, from all round, into the six windows — ink dashes on dark conductors
  const airMat = sheathMaterial(BRAND.ink, { period: 2, duty: 0.45, speed: 6.6, minPx: 2.2, hdr: 0.95 });
  airMat.uniforms.uBase.value = 0.12;
  airMat.uniforms.uFade.value = 4;
  const airCore = solid(GREY.dark, { rough: 0.6, metal: 0, opacity: 0.999 });
  airCore.userData.finish = false;
  const airMeshes = [];
  const airLen = [];
  for (let k = 0; k < VENTURI.intakes; k++) {
    for (const side of [-1, 1]) {
      const a = ((k + 0.5) / VENTURI.intakes) * Math.PI * 2;
      const sw = 0.28 * side * (k % 2 ? 1 : -1);
      const yMid = (INTAKE.y0 + INTAKE.y1) / 2;
      const at = (ang, r, y) => [AX.x + Math.sin(ang) * r, y, AX.z + Math.cos(ang) * r];
      const pts = [at(a + sw, 18, yMid + side * 7), at(a + sw * 0.6, 11.5, yMid + side * 3.8), at(a + sw * 0.2, 6.2, yMid + side * 0.9), at(a, 3.9, yMid + side * 0.25), at(a, 2.3, yMid)];
      const core = tubeGeo(pts, 0.3, { samples: 30, radial: 8 });
      const light = tubeGeo(pts, 0.42, { samples: 30, radial: 8, onPath: true });
      const coreMesh = new THREE.Mesh(core.geo, airCore);
      const lightMesh = sheathMesh(light.geo, airMat);
      venturi.add(coreMesh, lightMesh);
      airMeshes.push(coreMesh, lightMesh);
      airLen.push(light.length);
    }
  }
  airMat.uniforms.uHead.value = Math.max(...airLen) + 2;

  /* ── the hose (venturi → balloon) and the gas ── */
  const hoseMat = solid(0x23292e, { rough: 0.62, metal: 0 });
  hoseMat.userData.finish = false;
  venturi.userData.part.mats.add(hoseMat);
  const hoseN = GAS_N - GAS.slice(0, HOSE_FROM).reduce((n, g) => n + g[2], 0);
  const hoseSw = makeSweep(hoseN, 12);
  hoseSw.RA.fill(1.05);
  hoseSw.RB.fill(1.05);
  const hoseMesh = new THREE.Mesh(hoseSw.geo, hoseMat);
  hoseMesh.frustumCulled = false;
  hoseMesh.receiveShadow = true;
  root.add(hoseMesh);
  const gasSw = makeSweep(GAS_N, 10, { onPath: true });
  {
    let i = 0;
    GAS.forEach((g, k) => {
      for (let j = 0; j < Math.max(1, g[2]) && i < GAS_N; j++, i++) gasSw.RA[i] = gasSw.RB[i] = k >= HOSE_FROM ? 1.2 : 0.62;
    });
    gasSw.RA[GAS_N - 1] = gasSw.RB[GAS_N - 1] = 1.2;
  }
  const gasMat = sheathMaterial(BRAND.veille, { period: 2.4, duty: 0.5, speed: 9, minPx: 2.6, hdr: 1.1 });
  gasMat.uniforms.uBase.value = 0.18;
  root.add(sheathMesh(gasSw.geo, gasMat));

  /* ── THE BALLOON ── */
  const bag = makePart("bag");
  const foldMat = solid(VEILLE.clone().multiplyScalar(0.42).getHex(), { rough: 0.6, metal: 0, env: 0.5 });
  foldMat.userData.finish = false;
  const fold = new THREE.Group(); // the folded bundle: three flat layers, a fold line on each — « plié »
  fold.position.set(FOLD.at[0], FOLD.at[1] - FOLD.size[1] / 2, FOLD.at[2]);
  bag.add(fold);
  for (let k = 0; k < 3; k++) {
    const m = addMesh(bag, box(FOLD.size[0] - k * 1.2, FOLD.size[1] / 3 - 0.15, FOLD.size[2] - (k % 2) * 0.8, 0.7), foldMat, { pos: [(k % 2 ? 0.6 : -0.4), (k + 0.5) * (FOLD.size[1] / 3), 0], edgeOpacity: 0.5 });
    fold.add(m);
  }
  const balloonMat = balloonMaterial();
  bag.userData.part.mats.add(balloonMat);
  const balloonSw = makeSweep(BALLOON.rings, BALLOON.radial, { hint: V(0, 0, -1) });
  const balloon = new THREE.Mesh(balloonSw.geo, balloonMat);
  balloon.frustumCulled = false;
  balloon.castShadow = true;
  balloon.receiveShadow = true;
  balloon.visible = false;
  bag.add(balloon);
  bag.userData.part.meshes.push(balloon);

  /* ── the promise: the full balloon's outline, veille, growing out of the pack ── */
  const promiseMat = glass(BRAND.veille, { base: 0, rim: 0.55, power: 2.2, edge: 0.9, spec: 0.15 });
  const promiseSw = makeSweep(BALLOON.rings, BALLOON.radial, { hint: V(0, 0, -1) });
  const promise = new THREE.Mesh(promiseSw.geo, promiseMat);
  promise.frustumCulled = false;
  promise.visible = false;
  root.add(promise);
  asShell(promise, 24);

  root.add(pack, glassG, harness, handle, cable, cartridge, venturi, bag);
  const parts = { pack, harness, handle, cable, cartridge, venturi, bag };

  const A = {
    handle: anchor(handle, ...HANDLE.at),
    cable: anchor(cable, ...CABLE_ON[5]),
    cartridge: anchor(cartridge, AX.x, CARTRIDGE.at[1], AX.z),
    trigger: anchor(cartridge, AX.x, SEAL_Y + 1.5, AX.z),
    venturi: anchor(venturi, AX.x, VENT_Y, AX.z),
    bag: anchor(bag, ...FOLD.at),
    bagTop: anchor(bag, ...ARM[ARM.length - 1].map((v, i) => (i === 1 ? v + BALLOON.tube : v))),
    centre: anchor(pack, 0, 0, -PACK.d / 2),
  };

  /* ── the update's working state (no allocation below) ── */
  const offH = V();
  const offC = V();
  const offV = V();
  const offB = V();
  const pullV = V(...HANDLE.dir).normalize();
  const tmp = V();
  const d0 = V();
  const d1 = V();
  const OFFSET = { cartridge: offC, venturi: offV, bag: offB };
  const last = { k: NaN, pull: NaN, bag: NaN, promise: NaN };
  const place = (part, e, k, out) => {
    const u = clamp01((k - e.win[0]) / e.win[1]);
    out.copy(e.off).multiplyScalar(settle(u));
    if (part) part.position.copy(out);
    return out;
  };
  const emissive = (mat, k) => mat.emissive.copy(VEILLE).multiplyScalar(k);
  const lightOf = (mat, k) => {
    mat.uniforms.uAmount.value = k;
  };

  function layCable(k, pull) {
    const kc = smooth(clamp01((k - 0.05) / 0.6));
    const P = cableSw.P;
    // the ends: on the handle (pulled), on the lever (exploded)
    d0.set(HANDLE_TOP[0], HANDLE_TOP[1], HANDLE_TOP[2]).add(offH).addScaledVector(pullV, pull * HANDLE.pull);
    d1.set(LEVER[0], LEVER[1], LEVER[2]).add(offC);
    for (let i = 0; i < CABLE_N; i++) P[i].lerpVectors(CABLE_A[i], CABLE_B[i], kc);
    tmp.subVectors(d0, P[0]);
    for (let i = 0; i < CABLE_N; i++) {
      const t = i / (CABLE_N - 1);
      const w0 = Math.max(0, 1 - t / 0.3) ** 2;
      P[i].addScaledVector(tmp, w0);
    }
    tmp.subVectors(d1, P[CABLE_N - 1]);
    for (let i = 0; i < CABLE_N; i++) {
      const t = i / (CABLE_N - 1);
      const w1 = Math.max(0, 1 - (1 - t) / 0.3) ** 2;
      P[i].addScaledVector(tmp, w1);
    }
    cableSw.update();
    for (let i = 0; i < CABLE_N; i++) cableLight.P[i].copy(P[i]);
    cableLight.update();
    A.cable.position.copy(P[Math.round(CABLE_N * 0.55)]);
  }

  function layGas() {
    let i = 0;
    for (let g = 0; g < GAS.length - 1; g++) {
      const [a, pa, n] = GAS[g];
      const [b, pb] = GAS[g + 1];
      const oa = OFFSET[pa];
      const ob = OFFSET[pb];
      for (let j = 0; j < n; j++, i++) {
        const t = j / n;
        gasSw.P[i].set(a[0] + oa.x + (b[0] + ob.x - a[0] - oa.x) * t, a[1] + oa.y + (b[1] + ob.y - a[1] - oa.y) * t, a[2] + oa.z + (b[2] + ob.z - a[2] - oa.z) * t);
      }
    }
    const [z, pz] = GAS[GAS.length - 1];
    gasSw.P[GAS_N - 1].set(z[0] + OFFSET[pz].x, z[1] + OFFSET[pz].y, z[2] + OFFSET[pz].z);
    gasSw.update();
    const from = GAS_N - hoseN;
    for (let j = 0; j < hoseN; j++) hoseSw.P[j].copy(gasSw.P[from + j]);
    hoseSw.update();
    return gasSw.length;
  }

  let gasLen = 1;
  return {
    root, parts, A,
    update(P, time, px) {
      const {
        explode: k = 0, pull = 0, pierce = 0, gas = 0, draw = 0, bag: b = 0, promise: pr = 0, seethru = 0,
        litHandle = 0, litCart = 0, litVenturi = 0, litBag = 0,
      } = P;
      void px;
      /* the exploded view */
      place(pack, EXP.pack, k, tmp);
      place(harness, EXP.harness, k, tmp);
      place(null, EXP.handle, k, offH);
      handle.position.copy(offH).addScaledVector(pullV, pull * HANDLE.pull);
      place(cartridge, EXP.cartridge, k, offC);
      place(venturi, EXP.venturi, k, offV);
      place(bag, EXP.bag, k, offB);
      // the hose rides between the venturi and the bag: it fades with the venturi's part
      hoseMesh.visible = venturi.visible;
      if (k !== last.k || pull !== last.pull) layCable(k, pull);
      if (k !== last.k) gasLen = layGas();
      last.k = k;
      last.pull = pull;

      /* the handle and its cable */
      setGlow(ringGlow, 0.55 + 2.1 * clamp01(litHandle));
      handleBall.visible = litHandle > 0.02;
      handleBall.material.uniforms.uAmount.value = 0.18 + 0.55 * clamp01(litHandle);
      emissive(gripMat, 0.08 * litHandle);
      // pulled: a head of light runs from the handle to the trigger, the cable lit behind it; at rest the cable glows
      // faintly, all along, with the handle (litHandle)
      const run = clamp01(pull);
      cableGlow.uniforms.uHead.value = run > 0 ? (cableSw.length + 1.5) * run : cableSw.length + 2;
      cableGlow.uniforms.uTip.value = run > 0 && run < 1 ? 1 : 0;
      lightOf(cableGlow, run > 0 ? 1 : 0.14 * clamp01(litHandle));
      cableGlow.uniforms.uTime.value = time;

      /* the cartridge, its trigger, the spark */
      const p = clamp01(pierce);
      const drive = smooth(ramp(p, 0, 0.5));
      lever.rotation.z = 14 * DEG * drive; // its inner end goes down: it drives the pin
      pin.position.y = -1.05 * drive;
      hole.scale.set(drive, 1, drive);
      hole.visible = drive > 0.05;
      const flash = Math.exp(-(((p - 0.5) / 0.13) ** 2));
      spark.visible = flash > 0.01;
      spark.material.uniforms.uAmount.value = flash;
      emissive(heroMat, 0.16 * clamp01(litCart));
      emissive(sealMat, 0.2 * clamp01(litCart));

      /* the venturi: the gas through it, the air into it */
      emissive(mechMat, 0.16 * clamp01(litVenturi));
      emissive(trigMat, 0.12 * clamp01(Math.max(litCart, litVenturi * 0.5)));
      const g = clamp01(gas);
      gasMat.uniforms.uTime.value = time;
      gasMat.uniforms.uHead.value = (gasLen + 2) * smooth(ramp(g, 0, 0.45));
      gasMat.uniforms.uTip.value = g > 0 && g < 0.45 ? 1 : 0;
      gasMat.uniforms.uLevel.value = smooth(ramp(g, 0.25, 0.7));
      lightOf(gasMat, g > 0 ? 1 : 0);
      const dr = clamp01(draw);
      airMat.uniforms.uTime.value = time;
      airMat.uniforms.uLevel.value = smooth(ramp(dr, 0, 0.6));
      lightOf(airMat, smooth(ramp(dr, 0, 0.25)));
      for (const m of airMeshes) m.visible = dr > 0.01;
      airCore.opacity = 0.85 * smooth(ramp(dr, 0, 0.3));

      /* the balloon: the lid snaps, the bundle is used up, the tube comes out, unrolls, goes taut */
      const bb = clamp01(b);
      lidPivot.rotation.x = -OPEN * ease(ramp(bb, 0, 0.09));
      const used = smooth(ramp(bb, 0.02, 0.2));
      fold.scale.set(1 - 0.25 * used, Math.max(0.02, 1 - used), 1 - 0.25 * used);
      fold.visible = used < 0.98;
      balloon.visible = bb > 0.004;
      if (balloon.visible && bb !== last.bag) shapeBalloon(balloonSw, bb);
      last.bag = bb;
      emissive(foldMat, 0.22 * clamp01(litBag));
      balloonMat.userData.u.uLit.value = clamp01(litBag);

      /* the promise */
      const q = clamp01(pr);
      promise.visible = q > 0.004;
      if (promise.visible && q !== last.promise) shapeBalloon(promiseSw, smooth(ramp(q, 0, 0.75)), 0.03); // an outline: barely crumpled
      last.promise = q;
      promiseMat.uniforms.uAmount.value = smooth(ramp(q, 0, 0.35));

      /* the fabric to glass */
      const st = clamp01(seethru);
      setPartOpacity(pack, 1 - st);
      packGlass.uniforms.uAmount.value = st;
      glassG.visible = st > 0.004;
      glassG.position.copy(pack.position);
      glassLid.rotation.x = lidPivot.rotation.x;
    },
  };
}
