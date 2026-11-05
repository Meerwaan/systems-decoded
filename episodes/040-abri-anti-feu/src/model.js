// DOSSIER 040 — L'abri anti-feu : THE SYSTEM, solid. The M-2002 fire shelter deployed over you, its four layers, the
// air it keeps — and the same sheet folded like a loaf in its case, or shaken open by its two handles.
//
//   buildModel() → { root, parts, A, figure, update(p, time, px) }
//     root    what world.js re-parents: on your pad in the crest (crete.js `A.pad`) or on the bench — the same object,
//             at the same place (the cut matches on it). Origin: the middle of the shelter's footprint, on the ground.
//     parts   foil · silica · gap · fibre · inner (each a page of the exploded view, its own materials)
//     A       anchors (THREE.Object3D, follow the parts): top, feet, head, mouth, glue, handleL, handleR, gap, pack
//     figure  you (@kit/figure.js): an act may `ghost()` it on a close-up
//     update  every frame, 16 times: plain numbers only, no allocation
//
//   p = {
//     bench    1 on the bench (the bag shows) · 0 in the crest
//     explode  0 assembled → 1 the layers lift off one another like pages (SHELTER.lift), each hinged at the head end
//              and opening a little toward the feet, one after the other; the air gap a void framed by glass
//     fold     0 deployed over you · 0.5 out of its case, held by its two handles, shaking open (the shake runs on
//              `time`): 1 → 0.5 is the loaf coming out of the case and the sheet unfurling · 1 folded like a loaf in
//              its case (on the bag on the bench; in your hands, kneeling, in the crest). Under 0.25: deployed.
//     cut      0 whole · 1 the −x half off along the long axis: the five layers' edge (a mille-feuille), the air, you
//     you      0 nobody · 1 you, prone inside (glass figure), feet at −z
//     head     0 face in the dirt · 1 head (and shoulders) lifted ≈ YOU.lift cm, the mouth into the hot gas
//     hands    0 hands by your head, boots together · 1 hands on the hold-down straps, boots spread on the hem
//     rise     0 lying · 1 standing at the shelter's −x side, facing the fire slope (−z) — a cut, not a move
//     cool     0–1 the cool clean layer at the floor (veille), AIR.cool — light that has a place, never a veil
//     hot      0–1 the hot gas above it (signal, dull), AIR.hot
//     heat     0–1 the outer foil glows signal, the fire end (−z) and the top first. It glows, it NEVER melts.
//     glue     0–1 the glue at SHELTER.glue lets go: the hem's corner peels off its cloth, the glue line glows signal,
//              a thread of smoke rises
//     hole     0–1 the corner delaminated and lifted wide, the heat (signal) gets in under it
//     lean     the wind (feu.js): the loose hem flaps, the low panels of the dome shiver — the subject moves on frame 1
//     litFoil (foil + its silica) · litGap · litFibre · litInner   0–1 the layer the voice names glows faintly veille
//   }
//
// What makes it read as aluminium at 270 px: the sheet is CRUMPLED — creases baked in the geometry, flat-shaded, each
// facet a slightly different grey — so it catches the light in facets like kitchen foil; a smooth dome reads as grey
// plastic. metal 0.45, low roughness, `finish` off on the foil (its grain would fight the creases).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glass, fatLine, anchor, box, edgesOf } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { SHELTER, PACK, BAG, YOU, AIR } from "./plan.js";

export const MODEL = { len: SHELTER.len, w: SHELTER.w, h: SHELTER.h };

const L = SHELTER.len / 2;
const W = SHELTER.w / 2;
const H = SHELTER.h;
const M = 2.6; // the cross-section: a superellipse, flatter on top than a half-circle (a low tunnel)
// silver that reads at 270 px: light, a little metallic, reflecting little of the (coloured) studio — the creases do the rest
const FOIL = 0xd6dadd;
const FOIL_LOOK = { rough: 0.42, metal: 0.3, env: 0.55, double: true };
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const mix = (a, b, u) => a + (b - a) * u;
const sgnpow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
// leaves fast, settles with a little weight
const settle = (u) => {
  const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  return e + Math.sin(Math.PI * u) ** 2 * 0.05 * (u > 0.5 ? 1 : 0.25);
};

/* ── a seeded value noise (deterministic: no Math.random) ── */
function hash(i, j, k) {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x, y, z) {
  const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z);
  const fx = x - i, fy = y - j, fz = z - k;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const a = mix(mix(hash(i, j, k), hash(i + 1, j, k), u), mix(hash(i, j + 1, k), hash(i + 1, j + 1, k), u), v);
  const b = mix(mix(hash(i, j, k + 1), hash(i + 1, j, k + 1), u), mix(hash(i, j + 1, k + 1), hash(i + 1, j + 1, k + 1), u), v);
  return mix(a, b, w);
}
const ridged = (x, y, z) => 1 - Math.abs(2 * vnoise(x, y, z) - 1);
/** Crumpled foil, 0–1: big creases (≈ 20 cm), smaller ones (≈ 8 cm), a little grit. Always outward. */
function crumple(x, y, z) {
  return 0.42 * ridged(x / 19, y / 19, z / 19) ** 3 + 0.36 * ridged(x / 7 + 3.1, y / 7, z / 7) ** 3 + 0.14 * ridged(x / 2.9, y / 2.9 + 5, z / 2.9) ** 2 + 0.08 * vnoise(x / 1.6, y / 1.6, z / 1.6 + 7);
}

/* ── the shape: u along the length (−1 feet → 1 head), θ around (0: the +x ground line → π: the −x one) ── */
const tOf = (u) => Math.sin((u * Math.PI) / 2); // z / L — samples crowd toward the rounded ends
const sOf = (t) => Math.pow(clamp01(1 - t * t * t * t), 0.25); // the footprint and the height shrink at the ends
function surf(u, th, inset, out) {
  const t = tOf(u);
  const s = sOf(t);
  const c = Math.cos(th);
  out.set((W - inset) * s * sgnpow(c, 2 / M), (H - inset) * s * Math.pow(Math.abs(Math.sin(th)), 2 / M), (L - inset) * t);
  return out;
}
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
/** The smooth surface's outward normal at (u, θ). */
function normalAt(u, th, out) {
  const e = 1e-3;
  surf(Math.min(1, u + e), th, 0, _a).sub(surf(Math.max(-1, u - e), th, 0, _b));
  surf(u, th + e, 0, _b).sub(surf(u, th - e, 0, _c));
  out.crossVectors(_a, _b);
  if (out.lengthSq() < 1e-10) out.set(0, 0, Math.sign(u) || 1);
  out.normalize();
  surf(u, th, 0, _c);
  if (out.dot(_c) < 0) out.negate();
  return out;
}

/** How hot the outer foil gets, 0–1, at a point of it: the fire end (−z) and the top first, unevenly (the creases). */
const heatAt = (x, y, z) => (0.06 + 0.94 * Math.pow(clamp01((L - z) / (2 * L)), 2)) * (0.55 + 0.45 * clamp01(y / H)) * (0.6 + 0.4 * crumple(x + 40, y, z));

/**
 * One half (or a band) of a layer: a grid in (u, θ). `crinkle` cm of crumpled relief (outward), `skip(i, j)` drops a
 * quad (the glue's corner is its own mesh). Positions, smooth normals, uv, a grey per facet (`tone`), and aHeat.
 */
function sheet({ inset = 0, crinkle = 0, th0, th1, nu = 120, nv = 26, tone = 0, skip = null }) {
  const pos = [], nor = [], uv = [], col = [], hot = [], idx = [];
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i <= nu; i++) {
    for (let j = 0; j <= nv; j++) {
      // the grid is shaken a little inside (never on its borders, which meet the other half and the cut): the facets
      // fall every which way, as on real foil, instead of lining up in rows
      const jit = crinkle && i > 0 && i < nu && j > 0 && j < nv ? 0.42 : 0;
      const u = -1 + (2 * (i + jit * (hash(i, j, 1) - 0.5))) / nu;
      const th = th0 + ((th1 - th0) * (j + jit * (hash(i, j, 2) - 0.5))) / nv;
      surf(u, th, inset, p);
      normalAt(u, th, n);
      const ground = smooth(0, 5, p.y); // the hem's line stays on the ground
      const c = crumple(p.x + inset * 13, p.y, p.z);
      if (crinkle) p.addScaledVector(n, crinkle * c * ground);
      pos.push(p.x, p.y, p.z);
      nor.push(n.x, n.y, n.z);
      uv.push((u + 1) / 2, th / Math.PI);
      const g = 1 - tone * (0.55 * vnoise(p.x / 15 + 9, p.y / 15, p.z / 15) + 0.45 * (1 - c));
      col.push(g, g, g);
      hot.push(heatAt(p.x, p.y, p.z));
    }
  }
  const row = nv + 1;
  for (let i = 0; i < nu; i++)
    for (let j = 0; j < nv; j++) {
      if (skip && skip(i, j)) continue;
      const a = i * row + j, b = a + row;
      idx.push(a, a + 1, b, b, a + 1, b + 1); // front faces outward (a lit double-sided cloth flips its normal on back faces)
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("aHeat", new THREE.Float32BufferAttribute(hot, 1));
  g.setIndex(idx);
  return g;
}

/** A woven cloth, as a greyscale map the colour multiplies: over-under threads, each rounded. */
function weave(cell = 4, cells = 8) {
  const n = cell * cells;
  const data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const over = (Math.floor(x / cell) + Math.floor(y / cell)) % 2;
      const fx = ((x % cell) + 0.5) / cell, fy = ((y % cell) + 0.5) / cell;
      const v = Math.round(255 * (0.58 + 0.42 * Math.sin(Math.PI * (over ? fy : fx)) * (0.9 + 0.1 * hash(x, y, 3))));
      data.set([v, v, v, 255], (y * n + x) * 4);
    }
  const tex = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** A soft round light (a dégradé, never a flat disc): smoke puffs and the heat at the hole. */
function softDot() {
  const n = 64;
  const data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const r = Math.hypot((x + 0.5) / n - 0.5, (y + 0.5) / n - 0.5) * 2;
      const a = Math.round(255 * Math.pow(clamp01(1 - r), 2.2));
      data.set([255, 255, 255, a], (y * n + x) * 4);
    }
  const tex = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/** The outer foil: silver, crumpled, flat-shaded; its glow under the front and its shiver in the wind in the shader. */
function foilMaterial(U, color = FOIL, look = FOIL_LOOK) {
  const m = solid(color, look);
  m.vertexColors = true;
  m.flatShading = true;
  m.userData.finish = false;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = "uniform float uTime; uniform float uFlut; attribute float aHeat; varying float vHeat; varying vec3 vFire; varying vec3 vSmooth;\n" +
      sh.vertexShader.replace("#include <begin_vertex>", /* glsl */ `#include <begin_vertex>
        vHeat = aHeat;
        vFire = normalize((modelViewMatrix * vec4(0.0, 0.5, -1.0, 0.0)).xyz); // toward the fire: its end (−z), up the flames
        vSmooth = normalize(normalMatrix * objectNormal); // the dome's own curve, under the creases
        // the low panels shiver in the wind; the hem's line and the ridge hold
        float sdM = smoothstep(1.0, 7.0, position.y) * (1.0 - smoothstep(12.0, 32.0, position.y));
        float sdW = sin(position.z * 0.07 + uTime * 6.3 + position.x * 0.11) * 0.6 + sin(position.z * 0.19 - uTime * 10.1 + position.x * 0.05) * 0.4;
        transformed += normal * (uFlut * sdM * sdW);`);
    // The foil stays SILVER under the fire (a flat signal wash over a light grey reads pink): the fire shows only as
    // a reflection, soft streaks where the dome mirrors it (mostly its curve, a little of the facet: a glint per facet
    // is a hard speckle that the depth of field turns into pink pixel blocks on a close shot) — and `heat` glows
    // signal, franc, only where the sheet is really hot (the fire end, the top), the silver giving way under it.
    sh.fragmentShader = "uniform vec3 uHeat; uniform vec3 uFire; uniform vec3 uLit; varying float vHeat; varying vec3 vFire; varying vec3 vSmooth;\n" +
      sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        vec3 fV = normalize(vViewPosition);
        vec3 fR = reflect(-fV, normalize(mix(normalize(vSmooth), normal, 0.35)));
        float fCatch = 0.8 * smoothstep(0.55, 0.95, dot(fR, vFire));
        float fHot = clamp(length(uHeat) * 0.8, 0.0, 1.0) * smoothstep(0.42, 0.9, vHeat);
        totalEmissiveRadiance += uFire * fCatch * (0.3 + 0.7 * vHeat) + uHeat * smoothstep(0.42, 0.9, vHeat) + uLit;`)
        // the fire's light (feu.js, a signal point light) reads salmon on a light grey, diffuse AND its broad specular
        // lobe: both stay grey (bright, as silver under a blaze); the orange is in the glints above
        .replace("#include <lights_fragment_end>", `#include <lights_fragment_end>
        reflectedLight.directDiffuse = mix(reflectedLight.directDiffuse, vec3(dot(reflectedLight.directDiffuse, vec3(0.42, 0.46, 0.12))), 0.88);
        reflectedLight.directSpecular = mix(reflectedLight.directSpecular, vec3(dot(reflectedLight.directSpecular, vec3(0.42, 0.46, 0.12))), 0.88);
        reflectedLight.directDiffuse *= 1.0 - 0.7 * fHot; reflectedLight.directSpecular *= 1.0 - 0.7 * fHot;
        reflectedLight.indirectDiffuse *= 1.0 - 0.7 * fHot; reflectedLight.indirectSpecular *= 1.0 - 0.7 * fHot;`);
  };
  m.customProgramCacheKey = () => "sd-foil-040";
  return m;
}

/** The air under the dome: vertical slices across x, lit only inside the dome's section and inside a height band. */
function airMaterial(color, lo, hi) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
    uniforms: { uCol: { value: new THREE.Color(color) }, uAmt: { value: 0 }, uClip: { value: -99 }, uLo: { value: lo }, uHi: { value: hi } },
    vertexShader: /* glsl */ `varying vec3 vP; void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uCol; uniform float uAmt; uniform float uClip; uniform float uLo; uniform float uHi; varying vec3 vP;
      void main() {
        if (vP.x < uClip) discard;
        float t = clamp(abs(vP.z) / ${L.toFixed(1)}, 0.0, 1.0);
        float s = pow(clamp(1.0 - t * t * t * t, 0.0, 1.0), 0.25);
        float e = abs(vP.x) / (${W.toFixed(1)} * s + 0.5);
        float yr = clamp(vP.y / (${H.toFixed(1)} * s + 0.5), 0.0, 1.0);
        float inside = 1.0 - smoothstep(0.62, 0.95, pow(clamp(e, 0.0, 2.0), ${M.toFixed(1)}) + pow(yr, ${M.toFixed(1)}));
        float band = smoothstep(uLo - 1.2, uLo + 1.6, vP.y) * (1.0 - smoothstep(uHi - 2.2, uHi + 0.8, vP.y));
        float a = clamp(uAmt * inside * band, 0.0, 1.0);
        gl_FragColor = vec4(uCol * a, a);
      }`,
  });
}

export function buildModel() {
  const root = new THREE.Group();
  root.name = "abri";
  const INK = new THREE.Color(BRAND.ink);
  const VEILLE = new THREE.Color(BRAND.veille);
  const SIGNAL = new THREE.Color(BRAND.signal);

  /* ── the five layers, from outside in: each a page (a pivot at the head end, its body inside) ── */
  const NAMES = ["foil", "silica", "gap", "fibre", "inner"];
  const inset = {};
  let o = 0;
  for (const l of SHELTER.layers) {
    inset[l.name] = o;
    o += l.draw;
  }
  const draw = Object.fromEntries(SHELTER.layers.map((l) => [l.name, l.draw]));
  const TILT = { foil: 10, silica: 6, gap: 4.5, fibre: 3, inner: 0 }; // degrees: the pages open toward the feet
  const DELAY = { foil: 0, silica: 0.1, gap: 0.14, fibre: 0.2, inner: 0 };
  const parts = {};
  const bodies = {};
  for (const name of NAMES) {
    const part = new THREE.Group();
    part.name = name;
    part.position.z = L; // hinged at the head end
    const body = new THREE.Group();
    body.position.z = -L;
    part.add(body);
    parts[name] = part;
    bodies[name] = body;
    root.add(part);
  }

  // the glue's corner: hem samples ia..ib (z ≈ 98 → 108, +x side) are their own mesh, peeling
  const NT = 120; // hem samples along each side (the same u as the dome)
  const ia = Math.round(((0.7 + 1) / 2) * NT), ib = Math.round(((0.9 + 1) / 2) * NT);

  const U = { uTime: { value: 0 }, uFlut: { value: 0 }, uHeat: { value: new THREE.Color(0) }, uFire: { value: new THREE.Color(0) }, uLit: { value: new THREE.Color(0) } };
  const foilMat = foilMaterial(U);
  // the hem lies flat on the light pool: rougher and a shade darker, or it rings the dome with a halo of its own
  const hemMat = foilMaterial(U, 0xb4b9be, { rough: 0.55, metal: 0.22, env: 0.45, double: true });
  const innerMat = solid(0xd0d4d8, { rough: 0.4, metal: 0.25, env: 0.6, double: true });
  innerMat.vertexColors = true;
  innerMat.flatShading = true;
  innerMat.userData.finish = false;
  const silicaMap = weave(4, 8);
  silicaMap.repeat.set(SHELTER.len / 5.4, 125 / 5.4);
  const fibreMap = weave(4, 8);
  fibreMap.repeat.set(SHELTER.len / 3, 125 / 3);
  const silicaMat = solid(0xb3a88f, { rough: 0.88, metal: 0, double: true });
  silicaMat.map = silicaMap;
  const fibreMat = solid(0x9a9fa4, { rough: 0.8, metal: 0, double: true });
  fibreMat.map = fibreMap;
  const gapMat = glass(BRAND.ink, { base: 0.006, rim: 0.5, power: 2.2, edge: 0.7 });
  const MAT = { foil: foilMat, silica: silicaMat, fibre: fibreMat, inner: innerMat };
  const HALVES = { far: [0, Math.PI / 2], near: [Math.PI / 2, Math.PI] };
  const halves = []; // [name, side, mesh]
  for (const name of ["foil", "silica", "fibre", "inner"]) {
    for (const side of ["far", "near"]) {
      const [th0, th1] = HALVES[side];
      const g = sheet({
        inset: inset[name], th0, th1, nu: name === "foil" ? 190 : name === "inner" ? 150 : 96, nv: name === "foil" ? 42 : name === "inner" ? 32 : 20,
        crinkle: name === "foil" ? 2.4 : name === "inner" ? 0.7 : 0, tone: name === "foil" ? 0.42 : name === "inner" ? 0.25 : 0,
      });
      const mesh = new THREE.Mesh(g, MAT[name]);
      mesh.castShadow = name === "foil";
      mesh.receiveShadow = name !== "inner"; // the inside, seen through the cut, keeps its light
      bodies[name].add(mesh);
      halves.push({ near: side === "near", mesh, cast: name === "foil" });
    }
  }
  // the air gap: nothing — in the exploded view a dome of glass (a void with a lip), in the cut two fine lines
  const gapDome = new THREE.Group();
  for (const [th0, th1] of Object.values(HALVES)) gapDome.add(new THREE.Mesh(sheet({ inset: inset.gap + draw.gap / 2, th0, th1, nu: 72, nv: 16 }), gapMat));
  bodies.gap.add(gapDome);

  /* ── the cut: each layer's edge along the ridge (x = 0), a band `draw` cm thick — the mille-feuille ── */
  const strips = [];
  const NS = 132;
  const edgeLine = (off, crinkle) => {
    const pts = [];
    const p = new THREE.Vector3(), n = new THREE.Vector3();
    for (let i = 0; i <= NS; i++) {
      const u = -1 + (2 * i) / NS;
      surf(u, Math.PI / 2, off, p);
      if (crinkle) p.addScaledVector(normalAt(u, Math.PI / 2, n), crinkle * crumple(p.x, p.y, p.z) * smooth(0, 5, p.y));
      pts.push([-0.08, p.y, p.z]);
    }
    return pts;
  };
  const stripMats = {};
  const STRIP_NAMES = ["foil", "silica", "fibre", "inner"];
  for (const name of ["foil", "silica", "fibre", "inner"]) {
    const outer = edgeLine(inset[name], name === "foil" ? 2.4 : name === "inner" ? 0.7 : 0);
    const inner = edgeLine(inset[name] + draw[name], 0);
    const pos = [], nor = [], idx = [];
    for (let i = 0; i <= NS; i++) {
      pos.push(...outer[i], ...inner[i]);
      nor.push(-1, 0, 0, -1, 0, 0);
      if (i < NS) idx.push(2 * i, 2 * i + 2, 2 * i + 1, 2 * i + 1, 2 * i + 2, 2 * i + 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    g.setIndex(idx);
    const tone = { foil: 0xeef0f2, silica: 0xc9bc9c, fibre: 0xa9aeb3, inner: 0xdde1e5 }[name];
    const m = solid(tone, { rough: 0.5, metal: 0.1, double: true });
    m.emissive.set(tone).multiplyScalar(0.28); // the cut face lit from inside: it reads against the dark interior
    m.userData.finish = false;
    stripMats[name] = m;
    const mesh = new THREE.Mesh(g, m);
    bodies[name].add(mesh);
    strips.push(mesh);
  }
  // the gap's two lips, and a thin dark line under each solid band (they read as five strokes, not one grey ribbon)
  const gapLines = [edgeLine(inset.gap, 0), edgeLine(inset.gap + draw.gap, 0)].map((pts) => {
    const line = fatLine(pts, { color: BRAND.ink, width: 2, opacity: 0.85 });
    bodies.gap.add(line);
    strips.push(line);
    return line;
  });

  /* ── the hem: a crumpled ribbon flat on the ground all round, 9 cm wide; the hands and the boots hold it down ── */
  const NR = 3;
  const hems = [];
  const fp = new THREE.Vector3(), fq = new THREE.Vector3();
  const footprint = (u, sign, out) => {
    const t = tOf(u);
    return out.set(sign * W * sOf(t), 0, L * t);
  };
  function hemGeo(sign, from, to, skip) {
    const pos = [], col = [], hot = [], idx = [], meta = [];
    for (let i = from; i <= to; i++) {
      const u = -1 + (2 * i) / NT;
      footprint(u, sign, fp);
      footprint(Math.min(1, u + 1e-3), sign, fq).sub(footprint(Math.max(-1, u - 1e-3), sign, _a));
      const nx = fq.z * sign, nz = -fq.x * sign; // outward in the ground plane
      const nl = Math.hypot(nx, nz) || 1;
      for (let r = 0; r <= NR; r++) {
        const d = (SHELTER.skirt * r) / NR;
        const x = fp.x + (nx / nl) * d, z = fp.z + (nz / nl) * d;
        const c = crumple(x + 5, 0, z);
        const y = 0.25 + 0.7 * c * (r ? 1 : 0.3);
        pos.push(x, y, z);
        const g = 1 - 0.28 * (0.55 * vnoise(x / 15 + 9, 0, z / 15) + 0.45 * (1 - c));
        col.push(g, g, g);
        hot.push(heatAt(x, 0, z) * 0.8);
        meta.push(u, d / SHELTER.skirt, y);
      }
    }
    const row = NR + 1;
    for (let i = 0; i < to - from; i++) {
      if (skip && skip(from + i)) continue;
      for (let r = 0; r < NR; r++) {
        const a = i * row + r, b = a + row;
        if (sign > 0) idx.push(a, a + 1, b, b, a + 1, b + 1);
        else idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(pos.map((_, k) => (k % 3 === 1 ? 1 : 0)), 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute("aHeat", new THREE.Float32BufferAttribute(hot, 1));
    g.setIndex(idx);
    return { g, meta: Float32Array.from(meta), rest: Float32Array.from(pos) };
  }
  for (const [side, sign] of [["far", 1], ["near", -1]]) {
    const h = hemGeo(sign, 0, NT, sign > 0 ? (i) => i >= ia && i < ib : null);
    const mesh = new THREE.Mesh(h.g, hemMat);
    mesh.receiveShadow = true;
    bodies.foil.add(mesh);
    hems.push({ mesh, ...h, side });
  }
  // the glue's corner: the flap of foil, and under it its cloth (silica) and the glue line
  const flapH = hemGeo(1, ia, ib, null);
  const flap = new THREE.Mesh(flapH.g, hemMat);
  bodies.foil.add(flap);
  const under = hemGeo(1, ia, ib, null);
  for (let k = 1; k < under.rest.length; k += 3) under.g.attributes.position.array[k] = 0.12;
  const clothMat = solid(0xd6c7a2, { rough: 0.9, double: true });
  clothMat.emissive.set(0xd6c7a2).multiplyScalar(0.16); // the bare cloth under the lifted corner: it must read, even in its shadow
  const cloth = new THREE.Mesh(under.g, clothMat);
  bodies.foil.add(cloth);
  const gluePts = [];
  for (let i = ia; i <= ib; i++) {
    const k = ((i - ia) * (NR + 1) + NR) * 3;
    gluePts.push([under.rest[k], 0.3, under.rest[k + 2]]);
  }
  for (let r = NR; r >= 0; r--) {
    const k = ((ib - ia) * (NR + 1) + r) * 3;
    gluePts.push([under.rest[k], 0.3, under.rest[k + 2]]);
  }
  const glueLine = fatLine(gluePts, { color: BRAND.signal, width: 3.6, opacity: 0, hdr: 2.2 });
  bodies.foil.add(glueLine);
  // the hinge the flap turns on: its inner edge, from sample ia to ib
  const h0 = new THREE.Vector3(flapH.rest[0], flapH.rest[1], flapH.rest[2]);
  const kb = (ib - ia) * (NR + 1) * 3;
  const hAxis = new THREE.Vector3(flapH.rest[kb], flapH.rest[kb + 1], flapH.rest[kb + 2]).sub(h0).normalize();
  if (hAxis.z < 0) hAxis.negate();

  /* ── seams: the sheet is sewn from panels — fine lines across it, and the one along the ridge ── */
  const lines = { far: [], near: [], ridge: null };
  const n0 = new THREE.Vector3(), p0 = new THREE.Vector3();
  const onFoil = (u, th) => {
    surf(u, th, 0, p0);
    normalAt(u, th, n0);
    p0.addScaledVector(n0, 2.4 * crumple(p0.x, p0.y, p0.z) * smooth(0, 5, p0.y) + 0.35);
    return [p0.x, p0.y, p0.z];
  };
  for (const [side, [th0, th1]] of Object.entries(HALVES)) {
    for (const u of [-0.62, -0.3, 0, 0.3, 0.62]) {
      const pts = [];
      for (let j = 0; j <= 24; j++) pts.push(onFoil(u, th0 + ((th1 - th0) * j) / 24));
      const line = fatLine(pts, { color: BRAND.ink, width: 1.8, opacity: 0.32 });
      bodies.foil.add(line);
      lines[side].push(line);
    }
  }
  {
    const pts = [];
    for (let i = 0; i <= 90; i++) pts.push(onFoil(-0.97 + (1.94 * i) / 90, Math.PI / 2));
    lines.ridge = fatLine(pts, { color: BRAND.ink, width: 1.8, opacity: 0.38 });
    bodies.foil.add(lines.ridge);
  }
  // each layer's bottom line (the exploded view reads as stacked shells, not one blur)
  for (const name of ["silica", "fibre", "inner"])
    for (const [side, sign] of [["far", 1], ["near", -1]]) {
      const pts = [];
      for (let i = 0; i <= 80; i++) {
        const u = -1 + (2 * i) / 80;
        const t = tOf(u);
        pts.push([sign * (W - inset[name]) * sOf(t), 0.35, (L - inset[name]) * t]);
      }
      const line = fatLine(pts, { color: BRAND.ink, width: 2, opacity: 0.55 });
      bodies[name].add(line);
      lines[side].push(line);
    }

  /* ── the handles (shake) and the hold-down straps (inside, at the hem) ── */
  const webMat = solid(0x3b4046, { rough: 0.85 });
  const strapMeshes = [];
  for (const [x, y, z] of [...SHELTER.straps.hands, ...SHELTER.straps.feet]) {
    const m = new THREE.Mesh(box(4.5, 1.2, 14, 0.4), webMat);
    m.position.set(x * 0.92, 1.2, z);
    m.rotation.z = Math.sign(x) * 0.25;
    bodies.foil.add(m);
    strapMeshes.push(m);
  }

  /* ── folded: the loaf in its case, on the bag (bench) or in your hands (crest) ── */
  const loafGeo = new THREE.BoxGeometry(PACK.w, PACK.h, PACK.l, 8, 5, 10);
  {
    const a = loafGeo.attributes.position;
    const cols = [];
    for (let k = 0; k < a.count; k++) {
      const x = a.getX(k), y = a.getY(k), z = a.getZ(k);
      _a.set(x / (PACK.w / 2), y / (PACK.h / 2), z / (PACK.l / 2));
      const r = Math.max(Math.abs(_a.x), Math.abs(_a.y), Math.abs(_a.z));
      _b.set(x, y, z).normalize();
      // rounded like a loaf, pleated across its length (the folds), crumpled
      const pleat = 0.45 * Math.abs(Math.sin((z / PACK.l) * Math.PI * 7)) * (Math.abs(_a.z) < 0.98 ? 1 : 0);
      const d = -0.9 * (r > 0.99 ? smooth(0.6, 1, Math.min(Math.abs(_a.x) + Math.abs(_a.y), 1.6) - 0.6) : 0) + 0.35 * crumple(x * 2, y * 2, z * 2) - pleat;
      a.setXYZ(k, x + _b.x * d, y + _b.y * d, z + _b.z * d);
      const g = 1 - 0.25 * crumple(x * 2 + 3, y * 2, z * 2);
      cols.push(g, g, g);
    }
    loafGeo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    loafGeo.deleteAttribute("normal");
    loafGeo.computeVertexNormals();
  }
  const loafMat = solid(0xbfc4c9, { rough: 0.55, metal: 0.25, env: 0.4 }); // seen from above: rougher, or the softbox burns its top
  loafMat.vertexColors = true;
  loafMat.flatShading = true;
  loafMat.userData.finish = false;
  const loaf = new THREE.Mesh(loafGeo, loafMat);
  loaf.castShadow = true;
  const trayH = PACK.h * 0.62;
  const trayGeo = box(PACK.w + 2 * PACK.case, trayH, PACK.l + 2 * PACK.case, 0.6);
  const tray = new THREE.Mesh(trayGeo, solid(0x4a5057, { rough: 0.55, metal: 0.15 }));
  tray.add(edgesOf(trayGeo, { color: BRAND.ink, width: 1.8, opacity: 0.6 }));
  tray.castShadow = true;
  const pack = new THREE.Group();
  loaf.position.y = PACK.h / 2 + 0.6;
  tray.position.y = trayH / 2;
  pack.add(loaf, tray);
  const bagGeo = box(BAG.w, BAG.h, BAG.d, 2.2);
  const bag = new THREE.Mesh(bagGeo, solid(0x2e3338, { rough: 0.85 }));
  bag.add(edgesOf(bagGeo, { color: BRAND.ink, width: 1.8, opacity: 0.55 }));
  bag.position.set(0, BAG.h / 2, 0);
  bag.castShadow = bag.receiveShadow = true;
  for (const x of [-9, 9]) {
    const s = new THREE.Mesh(box(4, BAG.h + 1, BAG.d + 1.2, 0.4), solid(0x454b52, { rough: 0.8 }));
    s.position.x = x;
    bag.add(s);
  }
  root.add(pack, bag);

  /* ── shaken open: the sheet held by its two handles, unfurling and flapping in the wind (on `time`) ── */
  const SX = 30, SY = 40;
  const shGeo = new THREE.BufferGeometry();
  const shPos = new Float32Array((SX + 1) * (SY + 1) * 3);
  const shCrk = new Float32Array((SX + 1) * (SY + 1));
  {
    const col = [], idx = [];
    for (let j = 0; j <= SY; j++)
      for (let i = 0; i <= SX; i++) {
        const c = crumple(i * 2.4, j * 2.9, 11);
        shCrk[j * (SX + 1) + i] = 2.4 * c;
        const g = 1 - 0.45 * (1 - c);
        col.push(g, g, g);
        if (i < SX && j < SY) {
          const a = j * (SX + 1) + i, b = a + SX + 1;
          idx.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    shGeo.setAttribute("position", new THREE.BufferAttribute(shPos, 3));
    shGeo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    shGeo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(shPos.length).fill(0), 3));
    shGeo.setIndex(idx);
  }
  const sheetMat = solid(FOIL, FOIL_LOOK);
  sheetMat.vertexColors = true;
  sheetMat.flatShading = true;
  sheetMat.userData.finish = false;
  const shake = new THREE.Mesh(shGeo, sheetMat);
  shake.frustumCulled = false;
  shake.castShadow = true;
  root.add(shake);

  /* ── the air inside: slices across x, lit only in the dome's section and in their height band ── */
  const coolMat = airMaterial(BRAND.veille, AIR.cool[0], AIR.cool[1]);
  const hotMat = airMaterial(BRAND.signal, AIR.hot[0], AIR.hot[1]);
  const airGroup = new THREE.Group();
  for (let k = 0; k < 11; k++) {
    const x = -W + 4 + ((2 * W - 8) * k) / 10;
    for (const mat of [coolMat, hotMat]) {
      // baked in the geometry: the shader reads the shelter's own coordinates
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(SHELTER.len, H + 2).rotateY(Math.PI / 2).translate(x, (H + 2) / 2, 0), mat);
      plane.renderOrder = 6;
      airGroup.add(plane);
    }
  }
  root.add(airGroup);

  /* ── the glue lets go: smoke, and the heat that comes in under the lifted corner ── */
  const dot = softDot();
  const puffs = [];
  for (let i = 0; i < 7; i++) {
    const m = new THREE.SpriteMaterial({ map: dot, color: 0xe2dccf, transparent: true, opacity: 0, depthWrite: false, fog: false });
    const s = new THREE.Sprite(m);
    s.renderOrder = 7;
    bodies.foil.add(s);
    puffs.push(s);
  }
  const holeMat = new THREE.SpriteMaterial({ map: dot, color: new THREE.Color(BRAND.signal).multiplyScalar(2.2), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const holeGlow = new THREE.Sprite(holeMat);
  const mid = Math.round((ib - ia) / 2) * (NR + 1) * 3;
  const glueAt = new THREE.Vector3(flapH.rest[mid], 3, flapH.rest[mid + 2]);
  holeGlow.position.set(glueAt.x + 6, 4, glueAt.z + 4); // under the lifted corner, between it and the ground
  holeGlow.renderOrder = 7;
  bodies.foil.add(holeGlow);

  /* ── you: a glass figure, prone, face in the dirt, feet at −z ── */
  const fig = makeFigure({ hands: "flat" });
  const you = new THREE.Group();
  you.name = "toi";
  you.add(fig.group);
  root.add(you);
  const OZ = YOU.mouth[2] - 173.5; // the figure's origin (its soles) along z, lying: the mouth at YOU.mouth, the crown ≈ z 87
  const OY = 11; // lying: the depth of the chest above the ground
  const mouth = anchor(fig.head, 0, 7, 6.5); // the head is face down: its front is the world's −y

  const A = {
    top: anchor(bodies.foil, 0, SHELTER.h, 0),
    feet: anchor(bodies.foil, 0, 10, SHELTER.feet),
    head: anchor(bodies.foil, 0, 14, SHELTER.head - 20),
    mouth,
    glue: anchor(bodies.foil, ...SHELTER.glue),
    handleL: anchor(bodies.foil, ...SHELTER.handles[0]),
    handleR: anchor(bodies.foil, ...SHELTER.handles[1]),
    gap: anchor(bodies.gap, 0, SHELTER.h - inset.gap - draw.gap / 2, 0),
    pack: anchor(root, 0, BAG.h + PACK.h, 0),
  };

  // scratch (no allocation in update)
  const V = new THREE.Vector3();
  const V2 = new THREE.Vector3();
  const BEND = new THREE.Vector3();
  const DIR = new THREE.Vector3();
  const PALM = new THREE.Vector3();
  const tmpC = new THREE.Color();
  const LAY = { dir: DIR, palm: PALM };
  const lay = (a, b, c, d, e, f) => (DIR.set(a, b, c), PALM.set(d, e, f), LAY); // the hand's lay, without a new object
  const toLocal = (x, y, z) => V.set(x, z - OZ, OY - y); // the prone figure's own frame, from the shelter's
  const kneelLocal = (x, y, z, out = V) => out.set(x, y + 38, z + 34); // kneeling, facing +z

  function poseProne(head, hands) {
    const g = fig.group;
    g.rotation.set(Math.PI / 2, 0, 0);
    g.position.set(0, OY, OZ);
    fig.lean(-8 * head, 0, 0);
    fig.head.position.set(0, 166.5 - fig.HIP - 2 * head, 1 - 6 * head);
    for (let q = 0; q < 2; q++) {
      const s = q ? "R" : "L", sx = q ? -1 : 1;
      const [x, , z] = SHELTER.straps.hands[sx > 0 ? 1 : 0];
      // hands: by your head → on the straps at the hem, palms down, fingers toward your head
      const tx = mix(sx * 21, x * 0.9, hands), tz = mix(74, z, hands);
      // the elbows tucked out and back along the chest: they stay under the dome
      fig.reach(s, toLocal(tx, 1.5, tz), BEND.set(sx * 0.6, -1, -0.15), lay(0, 1, 0.1, 0, 0, 1));
      // boots: together → spread on the hem, toes dug in
      fig.leg(s, toLocal(sx * mix(10, 24, hands), 3, mix(-80, -84, hands)), BEND.set(0, 0, 1), DIR.set(0, -0.3, 1));
    }
  }
  function poseKneel(hl, hr) {
    const g = fig.group;
    g.rotation.set(0, 0, 0);
    g.position.set(0, -38, -34);
    fig.lean(9, 0, 0);
    fig.head.position.set(0, 166.5 - fig.HIP, 1);
    fig.leg("L", V2.set(9.5, 46, -40), BEND.set(0, 0, 1), DIR.set(0, -0.6, -1));
    fig.leg("R", V2.set(-9.5, 46, -40), BEND.set(0, 0, 1), DIR.set(0, -0.6, -1));
    fig.reach("L", kneelLocal(hl.x, hl.y, hl.z), BEND.set(1, -0.6, -0.4), lay(0, 1, 0.4, -1, 0, 0.2));
    fig.reach("R", kneelLocal(hr.x, hr.y, hr.z), BEND.set(-1, -0.6, -0.4), lay(0, 1, 0.4, 1, 0, 0.2));
  }
  function poseStand() {
    const g = fig.group;
    g.rotation.set(0, Math.PI, 0);
    g.position.set(-90, 0, -100);
    fig.lean(0, 0, 0);
    fig.head.position.set(0, 166.5 - fig.HIP, 1);
    fig.leg("L", V2.set(9.5, 8, 0));
    fig.leg("R", V2.set(-9.5, 8, 0));
    fig.reach("L", V2.set(21, 92, 3));
    fig.reach("R", V2.set(-21, 92, 3));
  }
  const HL = new THREE.Vector3(), HR = new THREE.Vector3();

  return {
    root, parts, A, figure: fig,
    update(p, time) {
      const bench = (p.bench ?? 0) > 0.5;
      const fold = p.fold ?? 0;
      const deployed = fold < 0.25;
      const k = p.explode ?? 0;
      const cut = (p.cut ?? 0) > 0.5;
      const lean = p.lean ?? 0;
      const heat = p.heat ?? 0;

      /* the pages */
      for (let i = 0; i < NAMES.length; i++) {
        const name = NAMES[i];
        const part = parts[name];
        part.visible = deployed;
        const kk = settle(clamp01((k - DELAY[name]) / 0.66));
        // the air gap is no page: its glass hangs midway between the silica and the fibre, a void with a lip
        part.position.y = name === "gap" ? 0.5 * (SHELTER.lift.silica + SHELTER.lift.fibre) * kk : SHELTER.lift[name] * kk;
        part.rotation.x = TILT[name] * (Math.PI / 180) * kk;
      }
      for (let i = 0; i < halves.length; i++) {
        halves[i].mesh.visible = !halves[i].near || !cut;
        halves[i].mesh.castShadow = halves[i].cast && k < 0.05; // the lifted pages throw no shadow on the ones under
      }
      for (let i = 0; i < lines.near.length; i++) lines.near[i].visible = !cut;
      lines.ridge.visible = !cut;
      for (let i = 0; i < strips.length; i++) strips[i].visible = cut;
      gapDome.visible = !cut && k > 0.02;
      gapMat.uniforms.uAmount.value = clamp01(k * 3);
      hems[1].mesh.visible = !cut;
      for (let i = 0; i < strapMeshes.length; i++) strapMeshes[i].visible = cut || k > 0.02; // inside: they show only through the cut or the pages

      /* light: the heat on the foil, the layer the voice names */
      U.uTime.value = time;
      U.uFlut.value = bench ? 0 : 0.9 * lean;
      U.uHeat.value.copy(SIGNAL).multiplyScalar(2.1 * heat * (0.93 + 0.07 * Math.sin(time * 1.4)));
      U.uFire.value.copy(SIGNAL).multiplyScalar(2 * smooth(0, 0.3, heat) * (0.9 + 0.1 * Math.sin(time * 5.3))); // the fire's reflection
      U.uLit.value.copy(VEILLE).multiplyScalar(0.12 * (p.litFoil ?? 0));
      const lf = p.litFoil ?? 0, lb = p.litFibre ?? 0, li = p.litInner ?? 0, lg = p.litGap ?? 0;
      silicaMat.emissive.copy(VEILLE).multiplyScalar(0.1 * lf);
      fibreMat.emissive.copy(VEILLE).multiplyScalar(0.14 * lb);
      innerMat.emissive.copy(INK).multiplyScalar(cut ? 0.07 : 0).add(tmpC.copy(VEILLE).multiplyScalar(0.13 * li)); // the inside: a little of its own light
      for (let i = 0; i < STRIP_NAMES.length; i++) {
        const m = stripMats[STRIP_NAMES[i]];
        const l = i < 2 ? lf : i === 2 ? lb : li;
        m.emissive.copy(m.color).multiplyScalar(0.28 * (1 - l)).add(tmpC.copy(VEILLE).multiplyScalar(0.9 * l));
      }
      for (let i = 0; i < gapLines.length; i++) gapLines[i].material.color.copy(INK).lerp(VEILLE, lg).multiplyScalar(1 + 0.8 * lg);
      gapMat.uniforms.uColor.value.copy(INK).lerp(VEILLE, lg);

      /* the hem flaps in the wind (the free edge only; held where the straps are, when your hands are on them) */
      const hands = p.hands ?? 0;
      for (let hi = 0; hi < hems.length; hi++) {
        const h = hems[hi];
        const arr = h.g.attributes.position.array;
        const sign = h.side === "far" ? 1 : -1;
        for (let v = 0, n = h.meta.length / 3; v < n; v++) {
          const u = h.meta[3 * v], r = h.meta[3 * v + 1];
          const z = h.rest[3 * v + 2];
          const held = 1 - hands * (Math.exp(-(((z - 62) / 20) ** 2)) + Math.exp(-(((z + 96) / 16) ** 2)));
          const windward = 1 + 0.7 * clamp01(-tOf(u));
          const wave = 0.5 + 0.5 * Math.sin(time * 8.3 + u * 26 + sign * 1.3) * (0.65 + 0.35 * Math.sin(time * 3.1 + u * 9));
          arr[3 * v + 1] = h.meta[3 * v + 2] + lean * 4.2 * Math.pow(r, 1.6) * wave * windward * Math.max(0.15, held);
        }
        h.g.attributes.position.needsUpdate = true;
      }

      /* the glue's corner: it peels off its cloth, then lifts wide (the hole) */
      const glue = p.glue ?? 0, hole = p.hole ?? 0;
      const alpha = 0.55 * smooth(0, 1, glue) + 0.85 * smooth(0, 1, hole);
      {
        const arr = flapH.g.attributes.position.array;
        const n = flapH.meta.length / 3;
        for (let v = 0; v < n; v++) {
          const i = Math.floor(v / (NR + 1));
          const t = i / (ib - ia);
          const r = flapH.meta[3 * v + 1];
          const w = r * (1 - 0.7 * Math.abs(t - 0.55)) + 0.15 * t;
          const ang = alpha * (0.75 * w + 0.4 * w * w) + (deployed && !bench ? lean * 0.05 * Math.sin(time * 9 + t * 4) * r : 0);
          // Rodrigues: turn the rest point about the hinge
          V.set(flapH.rest[3 * v], flapH.rest[3 * v + 1], flapH.rest[3 * v + 2]).sub(h0);
          const c = Math.cos(ang), s = Math.sin(ang);
          V2.crossVectors(hAxis, V);
          const dt = hAxis.dot(V) * (1 - c);
          arr[3 * v] = h0.x + V.x * c + V2.x * s + hAxis.x * dt;
          arr[3 * v + 1] = h0.y + V.y * c + V2.y * s + hAxis.y * dt + 0.05;
          arr[3 * v + 2] = h0.z + V.z * c + V2.z * s + hAxis.z * dt;
        }
        flapH.g.attributes.position.needsUpdate = true;
      }
      cloth.visible = glue > 0.01 || hole > 0.01;
      glueLine.visible = cloth.visible;
      glueLine.material.opacity = clamp01(glue * 1.6) * (1 - 0.4 * hole);
      for (let i = 0; i < puffs.length; i++) {
        const s = puffs[i];
        const ph = (time * 0.38 + i / puffs.length) % 1;
        const a = glue * 0.7 * Math.sin(Math.PI * ph) * (1 - 0.35 * hole);
        s.visible = a > 0.004 && deployed;
        s.material.opacity = a;
        s.position.set(glueAt.x + 2 + 3 * Math.sin(ph * 5 + i) + ph * 4, 2 + ph * 44, glueAt.z - 2 + ph * (6 + 10 * lean));
        s.scale.setScalar(5 + ph * 20);
      }
      // the glue that lets go glows a little; the hole lets the heat in
      const hg = Math.max(0.35 * glue, hole);
      holeGlow.visible = hg > 0.01 && deployed;
      holeMat.opacity = hg * (0.85 + 0.15 * Math.sin(time * 2.1));
      holeGlow.scale.setScalar(10 + 22 * hg);

      /* the air */
      const airOn = deployed && k < 0.3;
      airGroup.visible = airOn && ((p.cool ?? 0) > 0.01 || (p.hot ?? 0) > 0.01);
      coolMat.uniforms.uAmt.value = 0.17 * (p.cool ?? 0);
      hotMat.uniforms.uAmt.value = 0.14 * (p.hot ?? 0);
      coolMat.uniforms.uClip.value = hotMat.uniforms.uClip.value = cut ? -14 : -99;

      /* folded, or shaken open */
      const uu = clamp01((1 - fold) / 0.5); // 0 at fold 1 (in its case) → 1 at fold 0.5 (open, shaking)
      const unfurl = smooth(0.45, 1, uu);
      const inHands = !deployed && !bench;
      pack.visible = !deployed && (bench || uu < 0.55);
      bag.visible = !deployed && bench;
      shake.visible = inHands && unfurl > 0.01;
      const bobY = 4.5 * Math.sin(time * 8.8) * unfurl, bobZ = 3.5 * Math.sin(time * 8.8 + 1.1) * unfurl;
      if (bench) {
        pack.position.set(0, BAG.h, 0);
        pack.rotation.set(0, 0.35, 0);
        tray.visible = true;
        pack.scale.setScalar(1);
      } else {
        // kneeling, the case at your chest; then the loaf alone, held up; then it opens
        pack.position.set(0, 96 + 10 * smooth(0.2, 0.45, uu), 16);
        pack.rotation.set(0.2, 0, 0);
        tray.visible = uu < 0.25;
        pack.scale.setScalar(1 - 0.5 * smooth(0.4, 0.55, uu));
      }
      const half = mix(9, 30, unfurl);
      if (shake.visible) {
        const len = mix(10, 112, unfurl);
        const topY = 120 + bobY, topZ = 12 + bobZ;
        for (let j = 0; j <= SY; j++) {
          const b = j / SY;
          for (let i = 0; i <= SX; i++) {
            const a = -1 + (2 * i) / SX;
            const q = (j * (SX + 1) + i) * 3;
            const w = half * (1 + 0.3 * b);
            const billow = b * b * (34 + 12 * Math.sin(time * 6.7 - b * 5)) * unfurl;
            const flapw = 7 * b * Math.sin(time * 11 + a * 2.2 - b * 8) * unfurl;
            shPos[q] = a * w + 3 * b * Math.sin(time * 9 + b * 6) * unfurl;
            shPos[q + 1] = topY - b * len * (1 - 0.18 * b) + 5 * b * Math.sin(time * 7.4 + a * 3);
            shPos[q + 2] = topZ + billow + flapw + shCrk[j * (SX + 1) + i] * (0.3 + b);
          }
        }
        shGeo.attributes.position.needsUpdate = true;
      }

      /* you */
      const rise = p.rise ?? 0;
      you.visible = (p.you ?? 0) > 0.01 && (deployed || inHands);
      if (you.visible) {
        if (inHands) {
          if (shake.visible && unfurl > 0.2) {
            HL.set(half, 120 + bobY, 12 + bobZ);
            HR.set(-half, 120 + bobY, 12 + bobZ);
          } else {
            const y = pack.position.y + PACK.h * 0.4;
            HL.set(PACK.w / 2 + 3, y, 16);
            HR.set(-PACK.w / 2 - 3, y, 16);
          }
          poseKneel(HL, HR);
        } else if (rise > 0.5) poseStand();
        else poseProne(p.head ?? 0, hands);
      }
    },
  };
}
