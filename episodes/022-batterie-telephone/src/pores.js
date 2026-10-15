// DOSSIER 022 — the pores: the film between its two electrodes, seen from very close. A MAQUETTE, with its own
// scale (plan.js → MICRO): a pore is not a round hole, a film is not this thick — no length is ever shown on it.
//   buildPores() → { group, anchors, update(s, time, px) }
//   group    the maquette, around ITS OWN origin: the middle of the film. world.js mounts it at MICRO.at, counted
//            from the system's origin, and holds its visibility at both ends of the fade; it knows nothing of the phone
//   anchors  upper · membrane · lower · ember · hair (a closed list)
//   update   s = { micro, bench, temp, spot, ions, pores, melt, liquid, touch, chain, hair, litCopper, litAlu, litFilm }
//            (`temp` is not read: the heat is drawn by `spot`, `touch` and `chain`)
//
// From the top: the upper electrode (a granular coating under its sheet of metal), CUT AWAY in front; the film;
// the lower electrode, whole. Three greys: the coatings (dark), the metal sheets, the film (the lightest thing here).
// What it has to say without a caption:
//   · THE FILM IS ALMOST NOTHING: a thin pale sheet; a hair lying in front of it is several times thicker
//   · THE LITHIUM GOES THROUGH: veille grains — a head of light, a tail that says which way — funnel into the
//     pores, cross, and spread again underneath
//   · THE HOT POINT: a signal light that has a place, on the lower electrode's face; the film is translucent and
//     it glows through it (a patch of light on the sheet, right over it: the film is milky)
//   · THE PORES CLOSE ONE BY ONE, from the hot point outward: the sheet swells, glazes, turns opaque and veille;
//     each pore's lips swell, meet, and heal into a smooth dimple; the grains gather against it and stay
// How the film is drawn (the trap of this model): its pores live in the shader of a flat sheet, as the perforated
// plate of 009 — each one REALLY open (alpha 0, no depth written), with a wall (the ray slides across the
// thickness) — and how open each is comes from JS (`uOpen`): the very number that stops the grains.
// Translucency is real: whatever is UNDER the film (grains, glows, liquid) is drawn BEFORE it and veiled by it;
// whatever is over it is drawn after.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glass, asShell, box, lathe, mergeGeometries, makePart, addMesh, setPartOpacity, fatLine, anchor } from "@kit/build3d.js";
import { MICRO } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const { w: W, d: D, film: FILM, gap: GAP, slab: SLAB, cut: CUT } = MICRO;
const [NX, NZ] = MICRO.pores;
const N = NX * NZ;
const FACE = FILM / 2 + GAP; //          from the film's middle to an electrode's face
const FOIL = 0.4; //                     the sheet of metal at the back of each coating
const COAT = SLAB - FOIL;
const BACK = CUT + D / 2; //             how deep the upper electrode goes (it covers z from −D/2 to CUT)
const BACK_Z = (CUT - D / 2) / 2;
const SWELL = 0.24; //                   how much the film thickens where it has melted
const WALL = 0.34; //                    the depth a pore's wall is drawn with (thinner than the sheet: more of what is under shows)
const REST_ALPHA = 0.8; //               the film at rest lets a fifth of what is under it through
const TOUCH = [MICRO.hot[0] - 0.4, CUT - 0.6]; // « si elles se touchent »: where the film gives way — just behind the cut, where both electrodes are
const HOTS = 9; //                       hot points: the one of act 3, the place they touch, seven that light after it
const LANES = 3; //                      grains in flight per pore
const ION = { r: 0.165, tail: 1.9, speed: 3 }; // cm, cm, cm/s: a tenth of a centimetre per frame, a seventeenth of their spacing
const WIN = 0.07; //                     a pore takes this share of `pores` to close: three or four are closing at any time
const FAR = Math.hypot(W / 2 + Math.abs(MICRO.hot[0]), D / 2 + Math.abs(MICRO.hot[1])); // from the hot point to the farthest corner

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (u) => u * u * (3 - 2 * u);
const sm = (a, b, x) => smooth(clamp01((x - a) / (b - a)));
const f4 = (x) => x.toFixed(4);
const vec3 = (c, k = 1) => `vec3(${f4(c.r * k)}, ${f4(c.g * k)}, ${f4(c.b * k)})`;

/* ─────────────────────────────────────────────────────────── shaders */

// A hot point is a light that has a place: a white-hot heart, and a long tail. The lower electrode's face and the
// film over it read the same list — the film right over each of them (it is milky: no parallax).
const HOT_GLSL = /* glsl */ `
  uniform vec4 uHot[${HOTS}]; // x, z, how bright, how wide
  vec3 hotField(vec2 p) {
    vec3 sum = vec3(0.0);
    for (int k = 0; k < ${HOTS}; k++) {
      vec4 h = uHot[k];
      vec2 d = (p - h.xy) / max(h.w, 0.05);
      float r2 = dot(d, d);
      float core = exp(-min(r2 * 2.4, 40.0));
      float tail = 1.0 / (1.0 + 1.2 * r2);
      sum += h.z * (${vec3(SIGNAL)} * (0.17 * tail + 1.15 * core) + ${vec3(INK)} * 0.85 * core * core);
    }
    return sum;
  }`;

const GRAIN_GLSL = /* glsl */ `
  float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float grain(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
               mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
  }`;

// Where the film has melted (0–1): a front that leaves the hot point and reaches the farthest corner, its line uneven.
const MELT_GLSL = /* glsl */ `
  uniform float uMelt;
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float meltAt(vec2 p) {
    float d = length(p - vec2(${f4(MICRO.hot[0])}, ${f4(MICRO.hot[1])})) / ${f4(FAR)};
    d *= 0.88 + 0.24 * vnoise(p * 0.5 + 3.7);
    float front = uMelt * 1.36;
    return 1.0 - smoothstep(front - 0.2, front, d);
  }`;

/**
 * An electrode's coating: a dark, granular body — packed grains, not a sheet of metal. The grain is embossed
 * toward the key light in the shader and melts into its mean before it is smaller than a pixel.
 * uniforms: uOff (where the mesh stands: the grain and the hot points are read in the maquette's frame), uLit (it
 * glows faintly ink), uHotOn (its upper face carries the hot points), uTip (a signal heat near y = 0: the bulges).
 */
function coating(grey, hot, o = {}) {
  const mat = solid(new THREE.Color(grey, grey, grey * 0.96), { rough: 0.92, metal: 0.06, env: 0.55, ...o });
  const U = { uOff: { value: new THREE.Vector3() }, uLit: { value: 0 }, uTip: { value: 0 }, uHotOn: { value: 0 }, uHot: hot };
  mat.userData.uniforms = U;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uOff; varying vec3 vObj;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position + uOff;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nuniform float uLit, uTip, uHotOn; varying vec3 vObj;\n${GRAIN_GLSL}\n${HOT_GLSL}`)
      .replace(
        "#include <normal_fragment_maps>",
        /* glsl */ `#include <normal_fragment_maps>
        {
          float cm = max(max(length(dFdx(vObj)), length(dFdy(vObj))), 1e-5); // what a pixel covers of it
          float keep = 1.0 - smoothstep(0.3, 0.8, cm * 5.2);
          vec3 gp = vObj * 5.2;
          float n0 = grain(gp);
          float n1 = grain(gp + vec3(-0.2, 0.23, 0.17)); // a step toward the key light: the slope that faces it is lit
          float fine = grain(gp * 2.6 + 5.0);
          diffuseColor.rgb *= max(0.25, 1.0 + keep * (0.4 * (n0 - 0.5) + 1.7 * (n0 - n1) + 0.2 * (fine - 0.5)));
          totalEmissiveRadiance += ${vec3(INK)} * uLit * (0.13 + 0.12 * keep * n0);
          if (uHotOn > 0.0) totalEmissiveRadiance += uHotOn * hotField(vObj.xz) * smoothstep(${f4(-FACE - 0.6)}, ${f4(-FACE - 0.03)}, vObj.y);
          float tip = uTip * exp(-min(abs(vObj.y) * 2.1, 30.0));
          totalEmissiveRadiance += (${vec3(SIGNAL, 1.5)} + ${vec3(INK, 0.9)} * tip) * tip;
        }`,
      );
  };
  return mat;
}

/** The film: see the head of this file. uniforms: uPore[N] (x, z, rx, rz), uOpen[N], uMelt, uLit, uBreach (x, z, radius), uHot. */
function filmMaterial(U) {
  const mat = solid(0xd4cfc2, { rough: 0.9, metal: 0, env: 0.9 });
  mat.transparent = mat.userData.transparent = true; // it veils what is under it; where it is solid it still writes depth (what is drawn after it and under it is hidden)
  mat.userData.uniforms = U;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec2 vFilm; varying vec3 vEyeL; varying vec3 vTx; varying vec3 vTz; varying float vTop;\n${MELT_GLSL}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\ntransformed.y += step(0.0, position.y) * ${f4(SWELL)} * meltAt(position.xz);`)
      .replace(
        "#include <project_vertex>",
        /* glsl */ `#include <project_vertex>
        vFilm = position.xz;
        vEyeL = (-mvPosition.xyz) * mat3(modelViewMatrix); // toward the eye, in the sheet's own frame
        vTx = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
        vTz = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
        vTop = step(0.5, normal.y);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        uniform vec4 uPore[${N}]; uniform float uOpen[${N}]; uniform vec3 uBreach; uniform float uLit;
        varying vec2 vFilm; varying vec3 vEyeL; varying vec3 vTx; varying vec3 vTz; varying float vTop;
        ${MELT_GLSL}
        ${HOT_GLSL}
        int poreAt(vec2 p) {
          vec2 g = clamp(floor((p + vec2(${f4(W / 2)}, ${f4(D / 2)})) / vec2(${f4(W / NX)}, ${f4(D / NZ)})), vec2(0.0), vec2(${NX - 1}.0, ${NZ - 1}.0));
          return int(g.x) + ${NX} * int(g.y);
        }
        // the height of the film's face: it swells where it has melted; a pore that closes swells its lips, then heals into a dimple
        float relief(vec2 p) {
          float m = meltAt(p);
          int id = poreAt(p);
          vec4 po = uPore[id];
          float shut = 1.0 - uOpen[id];
          vec2 qn = (p - po.xy) / po.zw;
          float k2 = dot(qn, qn);
          float lip = shut * (1.0 - shut) * 4.0 * exp(-min((k2 - 1.0) * (k2 - 1.0) * 2.5, 30.0));
          float scar = shut * exp(-min(k2 * 1.5, 30.0));
          return ${f4(SWELL)} * m + 0.03 * m * (vnoise(p * 1.2 + 9.1) - 0.5) + 0.06 * lip - 0.15 * scar;
        }`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        /* glsl */ `#include <normal_fragment_maps>
        {
          vec2 p = vFilm;
          float cmPx = max(max(length(dFdx(p)), length(dFdy(p))), 1e-5); // what a pixel covers of the sheet, at its widest
          vec3 e = normalize(vEyeL);
          float m = meltAt(p);
          float mm = m; //       how molten it looks here: the front, or a pore healed over
          float cover = 1.0; //  0: a hole, nothing is drawn
          float wall = 0.0; //   1: the wall of a pore
          float shade = 1.0;
          if (vTop > 0.5) {
            int id = poreAt(p);
            vec4 po = uPore[id];
            float open = uOpen[id];
            vec2 q = p - po.xy;
            vec2 q0 = q / po.zw;
            mm = clamp(max(m, (1.0 - open) * exp(-min(dot(q0, q0) * 0.7, 30.0))), 0.0, 1.0);
            // the face's own relief
            float eps = max(cmPx, 0.04);
            float hx = (relief(p + vec2(eps, 0.0)) - relief(p - vec2(eps, 0.0))) / (2.0 * eps);
            float hz = (relief(p + vec2(0.0, eps)) - relief(p - vec2(0.0, eps))) / (2.0 * eps);
            vec3 faceN = normalize(normal - 2.0 * (vTx * hx + vTz * hz));
            float k0 = dot(q0, q0);
            float pit = (1.0 - open) * exp(-min(k0 * 1.7, 30.0));
            float brim = (1.0 - open) * exp(-min((k0 - 1.15) * (k0 - 1.15) * 5.0, 30.0));
            shade = (1.0 - 0.5 * pit) * (1.0 + 0.55 * brim);
            // the pore: an ellipse that shrinks to nothing; across the sheet the ray slides by hw, its far mouth is seen shifted
            vec2 r = po.zw * max(open, 0.03);
            float rmin = min(r.x, r.y);
            vec2 qn = q / r;
            vec2 hwn = e.xz / max(abs(e.y), 0.2) * ${f4(WALL)} * (1.0 + 0.8 * mm) / r;
            float aa = 0.75 * cmPx / rmin;
            float live = smoothstep(0.03, 0.2, open) * step(abs(p.x), ${f4(W / 2)}) * step(abs(p.y), ${f4(D / 2)});
            float inNear = (1.0 - smoothstep(-aa, aa, length(qn) - 1.0)) * live;
            float inFar = 1.0 - smoothstep(-aa, aa, length(qn - hwn) - 1.0);
            wall = inNear * (1.0 - inFar);
            // where the ray meets the wall (clamped before sqrt and before the division)
            float ww = max(dot(hwn, hwn), 1e-6);
            float qw = dot(qn, hwn);
            float hit = clamp((qw + sqrt(max(qw * qw - ww * (dot(qn, qn) - 1.0), 0.0))) / ww, 0.0, 1.0);
            vec2 hn = qn - hwn * hit;
            normal = normalize(mix(faceN, normalize(normal * 0.1 - vTx * hn.x - vTz * hn.y), wall));
            shade = mix(shade, mix(0.9, 0.36, hit), wall);
            // « si elles se touchent »: the one place where the film has given way
            float gone = (1.0 - smoothstep(-cmPx, cmPx, length(p - uBreach.xy) - uBreach.z)) * step(0.02, uBreach.z);
            cover = 1.0 - max(inNear * inFar, gone);
          }
          // at rest: matt, fibrous (it is a stretched plastic), pale. Molten: smooth, glazed, opaque, veille
          float fm = 1.0 - smoothstep(0.3, 0.8, cmPx * 8.0);
          vec3 rest = diffuseColor.rgb * (1.0 + 0.22 * fm * (vnoise(vec2(p.x * 1.3, p.y * 8.0)) - 0.5));
          vec3 molten = rest * 0.18 + ${vec3(VEILLE)} * 0.17;
          diffuseColor.rgb = mix(rest, molten, mm) * shade * mix(0.82, 1.0, vTop);
          roughnessFactor = mix(roughnessFactor, mix(0.36, 0.6, wall), mm);
          diffuseColor.a *= mix(mix(${f4(REST_ALPHA)}, 0.97, mm), 0.96, wall) * cover;
          if (diffuseColor.a < 0.02) discard;
          totalEmissiveRadiance += ${vec3(VEILLE)} * (0.025 * mm + 0.4 * uLit) * shade;
          // translucent, and milky: what glows on the lower electrode's face makes a patch of light right over it,
          // wherever the eye stands (a lamp under a sheet of paper)
          vec3 through = hotField(p) * mix(1.7, 0.7, mm) * vTop * (1.0 - wall);
          diffuseColor.rgb *= mix(vec3(1.0), ${vec3(SIGNAL)} * 0.9, clamp(dot(through, vec3(0.7)), 0.0, 0.85));
          totalEmissiveRadiance += through;
        }`,
      );
  };
  return mat;
}

/** Light with no edge (a head, a tail, a glow): brightest where it faces the eye. `tail`: it also dies along its length (uv.y). */
const lightMaterial = (power, tail = 0) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPower: { value: power }, uTail: { value: tail }, uColor: { value: new THREE.Color(1, 1, 1) } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vC; varying float vAlong;
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
        vAlong = uv.y;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uPower, uTail; uniform vec3 uColor; varying vec3 vN; varying vec3 vV; varying vec3 vC; varying float vAlong;
      void main() {
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
        float g = mix(1.0, pow(clamp(1.0 - vAlong, 0.0, 1.0), 1.6), uTail);
        gl_FragColor = vec4(uColor * vC * f * g, 1.0);
      }`,
  });

/* ─────────────────────────────────────────────────────────── the maquette */

export function buildPores() {
  const group = new THREE.Group();
  const rand = rng(22);
  const hotU = { value: new Float32Array(HOTS * 4) };

  /* ── the pores: where each one is, how wide, and when it closes (its rank from the hot point: one by one) ── */
  const poreU = new Float32Array(N * 4);
  const open = new Float32Array(N).fill(1);
  const shutE = new Float32Array(N); // how blocked a pore is, eased
  const molten = new Float32Array(N); // how much the film has swollen there
  const away = new Float32Array(N); // its distance from the hot point (0–1)
  const order = new Float32Array(N);
  {
    const raw = [];
    for (let j = 0; j < NZ; j++) {
      for (let i = 0; i < NX; i++) {
        const id = i + NX * j;
        const x = ((i + 0.5) * W) / NX - W / 2 + (rand() - 0.5) * 0.24;
        const z = ((j + 0.5) * D) / NZ - D / 2 + (rand() - 0.5) * 0.24;
        poreU.set([x, z, 0.5 + rand() * 0.09, 0.57 + rand() * 0.1], id * 4); // a little longer along z: seen from above at an angle, it reads round
        away[id] = Math.hypot(x - MICRO.hot[0], z - MICRO.hot[1]) / FAR;
        raw.push([away[id] + (rand() - 0.5) * 0.05, id]);
      }
    }
    raw.sort((a, b) => a[0] - b[0]).forEach(([, id], rank) => (order[id] = rank / (N - 1)));
  }

  /* ── the two electrodes: a granular coating, its sheet of metal at the back ── */
  const upper = makePart("upper");
  const lower = makePart("lower");
  const coatUp = coating(0.2, hotU);
  const coatLow = coating(0.15, hotU);
  const foilUp = solid(0x77777a, { rough: 0.58, metal: 0.3, env: 0.5 }); //  the aluminium side: the lighter grey
  const foilLow = solid(0x4c4c4e, { rough: 0.58, metal: 0.3, env: 0.5 }); // the copper side: a grey, not a colour
  for (const mat of [foilUp, foilLow]) mat.emissive = INK.clone();
  foilUp.emissiveIntensity = foilLow.emissiveIntensity = 0;
  coatUp.userData.uniforms.uOff.value.set(0, FACE + COAT / 2, BACK_Z);
  coatLow.userData.uniforms.uOff.value.set(0, -(FACE + COAT / 2), 0);
  coatLow.userData.uniforms.uHotOn.value = 1;
  addMesh(upper, box(W, COAT, BACK, 0.1), coatUp, { pos: [0, FACE + COAT / 2, BACK_Z] });
  addMesh(upper, box(W, FOIL, BACK, 0.06), foilUp, { pos: [0, FACE + COAT + FOIL / 2, BACK_Z] });
  addMesh(lower, box(W, COAT, D, 0.1), coatLow, { pos: [0, -(FACE + COAT / 2), 0] });
  addMesh(lower, box(W, FOIL, D, 0.06), foilLow, { pos: [0, -(FACE + COAT + FOIL / 2), 0] });
  group.add(upper, lower);

  /* ── « si elles se touchent »: the two coatings bulge toward each other and meet through the film ── */
  const bulges = makePart("bulges");
  const coatTip = coating(0.2, hotU, { double: true });
  const reach = FACE - 0.03;
  coatTip.userData.uniforms.uOff.value.set(TOUCH[0], reach, TOUCH[1]); // (its `vObj.y` is 0 at the tip, whichever way the mesh is turned)
  const bell = lathe([[0, -reach], [0.2, -reach], [0.4, -reach * 0.84], [0.56, -reach * 0.5], [0.86, -reach * 0.2], [1.5, -0.04], [2, 0]], 48);
  const bulgeUp = addMesh(bulges, bell, coatTip, { pos: [TOUCH[0], FACE, TOUCH[1]], edges: false });
  const bulgeLow = addMesh(bulges, bell, coatTip, { pos: [TOUCH[0], -FACE, TOUCH[1]], rot: [Math.PI, 0, 0], edges: false });
  bulgeUp.castShadow = bulgeLow.castShadow = false;
  bulges.visible = false;
  group.add(bulges);

  /* ── the film: its face (a grid: it swells), its four edges ── */
  const FW = W * 1.06; // a little wider than the metal
  const FD = D * 1.06;
  const filmU = { uPore: { value: poreU }, uOpen: { value: open }, uMelt: { value: 0 }, uLit: { value: 0 }, uBreach: { value: new THREE.Vector3(TOUCH[0], TOUCH[1], 0) }, uHot: hotU };
  const filmMat = filmMaterial(filmU);
  const strip = (len, turn, x, z) => new THREE.PlaneGeometry(len, FILM, Math.round(len * 7), 1).rotateY(turn).translate(x, 0, z);
  const film = new THREE.Mesh(
    mergeGeometries([
      new THREE.PlaneGeometry(FW, FD, 126, 72).rotateX(-Math.PI / 2).translate(0, FILM / 2, 0),
      strip(FW, 0, 0, FD / 2),
      strip(FW, Math.PI, 0, -FD / 2),
      strip(FD, -Math.PI / 2, -FW / 2, 0),
      strip(FD, Math.PI / 2, FW / 2, 0),
    ]),
    filmMat,
  );
  film.receiveShadow = true; // (it casts none: the lower electrode's face must stay readable under it)
  film.renderOrder = 3;
  group.add(film);

  /* ── the liquid: a faint signal body in the two gaps (it is flammable: a threat, not a setting) ── */
  const wet = glass(BRAND.signal, { base: 0.055, rim: 0.3, power: 2, edge: 0.3 });
  const wetLow = new THREE.Mesh(new THREE.BoxGeometry(W - 0.12, GAP - 0.08, D - 0.12), wet);
  wetLow.position.y = -(FILM / 2 + GAP / 2);
  wetLow.renderOrder = 1; // under the film: before it
  const wetUp = new THREE.Mesh(new THREE.BoxGeometry(W - 0.12, GAP - 0.08, BACK - 0.06), wet);
  wetUp.position.set(0, FILM / 2 + GAP / 2, BACK_Z);
  wetUp.renderOrder = 4;
  group.add(wetLow, wetUp);

  /* ── its own pool of light: in the room there is no bench under it, and it must never be dark on dark ── */
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(110, 110).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color(0, 0, 0) } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying vec2 vUv;
        void main() {
          float r = length(vUv - 0.5) * 2.0;
          float f = (0.7 * exp(-r * r * 14.0) + 0.3 / (1.0 + r * r * 40.0)) * (1.0 - smoothstep(0.6, 1.0, r));
          gl_FragColor = vec4(uColor * f, 1.0);
        }`,
    }),
  );
  halo.position.y = -(FACE + SLAB) - 0.5;
  halo.renderOrder = -2;
  group.add(halo);

  /* ── the hot points: a dome of light on the lower electrode's face for each (drawn before the film: it veils them) ── */
  const HOT_Y = -FACE + 0.06;
  const hots = [{ x: MICRO.hot[0], z: MICRO.hot[1] }, { x: TOUCH[0], z: TOUCH[1] }];
  for (let k = 0; k < HOTS - 2; k++) {
    // « la chaleur appelle la chaleur »: each a little farther than the last, on the side the eye sees
    const a = (-0.25 + 1.5 * rand()) * Math.PI;
    const far = 1.7 + k * 0.95;
    hots.push({
      x: Math.min(W / 2 - 0.7, Math.max(-W / 2 + 0.7, TOUCH[0] + Math.cos(a) * far)),
      z: Math.min(D / 2 - 0.7, Math.max(-D / 2 + 0.6, TOUCH[1] + Math.abs(Math.sin(a)) * far * 0.8)),
      at: (k / (HOTS - 2)) * 0.84,
    });
  }
  hots.forEach((h, k) => hotU.value.set([h.x, h.z, 0, 1], k * 4));
  const domes = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 28, 18), lightMaterial(3.2), HOTS);
  const junction = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), lightMaterial(2.2)); // where the two electrodes meet, in the film's plane
  junction.position.set(TOUCH[0], 0, TOUCH[1]);
  junction.renderOrder = 6;
  junction.visible = false;
  domes.renderOrder = 2;
  group.add(junction);

  /* ── the lithium: a head of light and a tail per grain; drawn under the film (before it) or over it (after) ── */
  const IONS = N * LANES;
  const SLOTS = IONS * 2; // a grain, and its twin: whatever the moment, a shut pore holds LANES grains at rest
  const headGeo = new THREE.SphereGeometry(1, 16, 12);
  const tailGeo = new THREE.CylinderGeometry(0.06, 0.62, 1, 10, 1, true).translate(0, 0.5, 0); // from the head (y 0) back to its tip (y 1)
  const pass = (at) => {
    const heads = new THREE.InstancedMesh(headGeo, lightMaterial(1.5), SLOTS);
    const tails = new THREE.InstancedMesh(tailGeo, lightMaterial(0.5, 1), SLOTS);
    heads.renderOrder = tails.renderOrder = at;
    return { heads, tails };
  };
  const under = pass(2);
  const over = pass(7);
  const black = new THREE.Color(0, 0, 0);
  const flights = [under.heads, under.tails, over.heads, over.tails];
  for (const mesh of [domes, ...flights]) {
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    for (let i = 0; i < mesh.count; i++) mesh.setColorAt(i, black);
    mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    group.add(mesh);
  }
  const ionPore = new Uint16Array(IONS);
  const ionOff = new Float32Array(IONS * 2); // where it leaves the upper electrode, from its pore's axis
  const ionPhase = new Float32Array(IONS);
  const ionRest = new Float32Array(IONS * 3); // where it comes to rest on a shut pore, from the pore's centre on the film's face
  const REST = [[0.02, 0.86, 0.04], [0.37, 0.92, 0.14], [-0.17, 0.9, -0.33]]; // a little heap (× the grain's radius, y)
  for (let id = 0; id < N; id++) {
    const turn = rand() * Math.PI * 2;
    const start = rand();
    for (let k = 0; k < LANES; k++) {
      const i = id * LANES + k;
      const a = turn + (k / LANES) * Math.PI * 2 + (rand() - 0.5) * 0.8;
      const far = 0.3 + 0.38 * rand();
      ionPore[i] = id;
      ionOff.set([Math.cos(a) * far, Math.sin(a) * far], i * 2);
      ionPhase[i] = start + (k + (rand() - 0.5) * 0.3) / LANES;
      ionRest.set([REST[k][0], REST[k][1] * ION.r, REST[k][2]], i * 3);
    }
  }

  /* ── a hair, for scale: ink glass, its scales in fine lines ── */
  const hair = new THREE.Group();
  const [HX, HY, HZ] = MICRO.hair.at;
  const HR = MICRO.hair.r;
  const HL = W * 1.3;
  hair.position.set(HX, HY, HZ);
  const hairGlass = glass(BRAND.ink, { base: 0.03, rim: 0.62, power: 2.1, edge: 0.6, spec: 0.6, through: 0.2 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(HR, HR, HL, 48, 1, false).rotateZ(Math.PI / 2), hairGlass);
  asShell(shaft, 20);
  hair.add(shaft);
  const scales = [];
  for (let x = -HL / 2 + 0.9; x < HL / 2 - 0.5; x += 1.55) {
    const pts = [];
    const p1 = rand() * 6.3;
    const p2 = rand() * 6.3;
    for (let k = 0; k <= 40; k++) {
      const a = (k / 40) * Math.PI * 2;
      pts.push([x + 0.26 * Math.sin(3 * a + p1) + 0.13 * Math.sin(5 * a + p2), HR * 1.01 * Math.cos(a), HR * 1.01 * Math.sin(a)]);
    }
    const line = fatLine(pts, { width: 2, opacity: 0.55 });
    scales.push(line.material);
    hair.add(line);
  }
  hair.visible = false;
  group.add(hair);

  const anchors = {
    upper: anchor(group, 0, FACE + SLAB / 2, BACK_Z), //      the upper electrode
    membrane: anchor(group, 0, FILM / 2, 1.8), //             the film's upper face, in front of the cut
    lower: anchor(group, 0, -(FACE + SLAB / 2), D / 2), //    the lower electrode, its front edge
    ember: anchor(group, MICRO.hot[0], -FACE, MICRO.hot[1]), // the hot point, under the film
    hair: anchor(group, HX, HY + HR, HZ), //                  the top of the hair
  };

  /* ── every frame (sixteen times): numbers in, transforms and uniforms out ── */
  const L = 2 * FACE; // a grain's way: from one electrode's face to the other's
  const m4 = new THREE.Matrix4();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const quat = new THREE.Quaternion();
  const none = new THREE.Quaternion();
  const UP = new THREE.Vector3(0, 1, 0);
  const P = new THREE.Vector3();
  const Q = new THREE.Vector3();
  const R = new THREE.Vector3();
  const A = new THREE.Vector3();
  const size = new THREE.Vector3();
  const hue = new THREE.Color();

  // where grain `i` is when it has gone `u` of its way: it funnels into its pore, crosses, spreads again
  const flow = (i, u, out) => {
    const id = ionPore[i];
    const y = FACE - u * L;
    const k = 0.16 + 0.84 * sm(0.3, 2.3, Math.abs(y));
    return out.set(poreU[id * 4] + ionOff[i * 2] * k, y, poreU[id * 4 + 1] + ionOff[i * 2 + 1] * k);
  };
  // one grain: at `pos`, this bright, its tail `len` long toward `back`; over the film or under it
  const put = (slot, pos, bright, len, back) => {
    const here = pos.y > 0 ? over : under;
    const there = pos.y > 0 ? under : over;
    there.heads.setMatrixAt(slot, hidden);
    there.tails.setMatrixAt(slot, hidden);
    if (bright < 0.004) {
      here.heads.setMatrixAt(slot, hidden);
      here.tails.setMatrixAt(slot, hidden);
      return;
    }
    here.heads.setMatrixAt(slot, m4.compose(pos, none, size.setScalar(ION.r)));
    here.heads.setColorAt(slot, hue.copy(VEILLE).multiplyScalar(1.7 * bright));
    if (len < 0.03) {
      here.tails.setMatrixAt(slot, hidden);
      return;
    }
    quat.setFromUnitVectors(UP, back);
    here.tails.setMatrixAt(slot, m4.compose(pos, quat, size.set(ION.r, len, ION.r)));
    here.tails.setColorAt(slot, hue.copy(VEILLE).multiplyScalar(0.8 * bright));
  };

  function update(s, time) {
    const amount = smooth(clamp01(s.micro)); // its fade-in (world.js hides the group at 0)
    if (amount < 0.001) return;
    const chain = clamp01(s.chain);
    const touch = clamp01(s.touch);

    /* the pores, one by one, and the melt (the same front as the shader's, without its unevenness) */
    const run = 1 - clamp01(s.pores);
    const front = clamp01(s.melt) * 1.36;
    for (let id = 0; id < N; id++) {
      open[id] = 1 - sm(order[id] * (1 - WIN), order[id] * (1 - WIN) + WIN, run);
      shutE[id] = smooth(1 - open[id]);
      molten[id] = 1 - sm(front - 0.2, front, away[id]);
    }
    filmU.uMelt.value = clamp01(s.melt);
    filmU.uLit.value = clamp01(s.litFilm);
    filmU.uBreach.value.z = 0.8 * sm(0.25, 0.9, touch);
    filmMat.opacity = amount;

    /* the electrodes */
    setPartOpacity(upper, amount);
    setPartOpacity(lower, amount);
    coatUp.userData.uniforms.uLit.value = clamp01(s.litAlu);
    coatLow.userData.uniforms.uLit.value = clamp01(s.litCopper);
    foilUp.emissiveIntensity = 0.1 * clamp01(s.litAlu);
    foilLow.emissiveIntensity = 0.1 * clamp01(s.litCopper);
    const grown = smooth(touch);
    bulges.visible = grown > 0.01;
    if (bulges.visible) {
      setPartOpacity(bulges, amount);
      bulgeUp.scale.set(0.5 + 0.5 * grown, grown, 0.5 + 0.5 * grown);
      bulgeLow.scale.copy(bulgeUp.scale);
      coatTip.userData.uniforms.uTip.value = sm(0.6, 1, touch) * (0.75 + 0.45 * chain);
    }

    /* the hot points: the one that is born under the film, the place they touch, those that light after it */
    const spot = clamp01(s.spot);
    const H = hotU.value;
    H[2] = sm(0, 0.12, spot) * (0.4 + 0.8 * spot);
    H[3] = 0.5 + 1.3 * spot;
    H[6] = sm(0.6, 1, touch) * (1 + 0.4 * chain);
    H[7] = 1 + 0.5 * chain;
    for (let k = 2; k < HOTS; k++) {
      const lit = sm(hots[k].at, hots[k].at + 0.12, chain);
      H[k * 4 + 2] = lit * (0.85 + 1.6 * lit * (1 - lit)); // it flares as it lights, then settles
      H[k * 4 + 3] = 0.7 + 0.5 * lit;
    }
    for (let k = 0; k < HOTS; k++) {
      const bright = H[k * 4 + 2];
      if (bright < 0.004) {
        domes.setMatrixAt(k, hidden);
        continue;
      }
      domes.setMatrixAt(k, m4.compose(P.set(hots[k].x, HOT_Y, hots[k].z), none, size.setScalar(H[k * 4 + 3] * 0.8)));
      domes.setColorAt(k, hue.copy(SIGNAL).multiplyScalar(1.45 * bright * amount));
    }
    domes.instanceMatrix.needsUpdate = true;
    domes.instanceColor.needsUpdate = true;
    junction.visible = H[6] > 0.004;
    if (junction.visible) {
      junction.scale.setScalar(0.85 + 0.3 * chain);
      junction.material.uniforms.uColor.value.copy(SIGNAL).lerp(INK, 0.25).multiplyScalar(2.2 * H[6] * amount);
    }

    /* the liquid, the pool, the hair */
    const liquid = clamp01(s.liquid) * amount * (1 + 0.7 * chain);
    wetLow.visible = wetUp.visible = liquid > 0.003;
    wet.uniforms.uAmount.value = liquid;
    halo.material.uniforms.uColor.value.copy(INK).multiplyScalar(0.4 * amount * (1 - 0.45 * clamp01(s.bench)));
    const strand = clamp01(s.hair) * amount;
    hair.visible = strand > 0.003;
    if (hair.visible) {
      hairGlass.uniforms.uAmount.value = strand;
      for (const mat of scales) mat.opacity = mat.userData.base * strand;
    }

    /* the lithium */
    const gain = clamp01(s.ions) * amount;
    const flowing = gain > 0.004;
    under.heads.visible = under.tails.visible = over.heads.visible = over.tails.visible = flowing;
    if (!flowing) return;
    const turn = (time * ION.speed) / L;
    for (let i = 0; i < IONS; i++) {
      const id = ionPore[i];
      const e = shutE[id];
      const u = turn + ionPhase[i];
      const v = u - Math.floor(u);
      flow(i, v, P);
      flow(i, Math.max(0, v - 0.04), Q).sub(P).normalize(); // where it comes from: its tail lies that way
      if (Q.lengthSq() < 0.5) Q.copy(UP);
      const above = sm(-0.35, 0.45, P.y); //                 1: it has not crossed the film yet
      const born = sm(FACE, FACE - 0.8, P.y); //             it leaves the upper electrode…
      const landed = sm(-FACE + 0.1, -FACE + 0.75, P.y); //  …and is taken by the lower one
      R.set(poreU[id * 4] + ionRest[i * 3], FILM / 2 + SWELL * molten[id] + ionRest[i * 3 + 1], poreU[id * 4 + 1] + ionRest[i * 3 + 2]);
      // over the film: as its pore closes it slides to its place against the film, and stays
      A.lerpVectors(P, R, e);
      put(i * 2, A, gain * above * (born + (1 - born) * e) * (1 - 0.6 * e), ION.tail * (1 - e), Q);
      // under the film: it finishes its way down and is not replaced; its twin takes its place in the heap
      if (e < 0.5) put(i * 2 + 1, P, gain * (1 - above) * landed * (1 - 2 * e), ION.tail * (1 - 2 * e), Q);
      else put(i * 2 + 1, R, gain * (1 - above) * (2 * e - 1) * 0.4, 0, Q);
    }
    for (const mesh of flights) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
    }
  }

  return { group, anchors, update };
}
