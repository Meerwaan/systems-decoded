// DOSSIER L07 — fabrique.js : THE FACTORY, X-ray, its glass solid (place USINE). One station every LINE.step along +x:
//   1 STILL   the tank of silicon tetrachloride (a liquid clear as water, its surface a mirror that trembles when it
//             boils), the distillation column, the vapour line to the lathe's burner; the metals left at the bottom
//   2 LATHE   the bait rod between two chucks, the burner travelling under it, its flame, the WHITE SOOT flying up and
//             sticking: the soot body grows layer by layer (the layers show as rings on its tapered ends); a quarter
//             is cut away when `doped` comes in: the first layers (the core) tinted veille against the pure cladding
//   3 SINTER  a vertical tube furnace (its elements signal), the body lowered on its rod; the chlorine streaming up
//             the muffle; the WHITE TURNS CLEAR from the bottom up and shrinks; the core shows inside; the end cut away
//   4 TOWER   THE CENTREPIECE: an X-ray frame of several floors (gratings, a stair), the preform hanging from its feed,
//             its tip in the furnace, the DROP that forms, stretches and falls, the fibre that runs down (marks race
//             along it), the laser gauge (two beams across it, its readout), the two coating cups (the fibre grows),
//             the UV tunnel, the pulley, the capstan, the spool
//   5 PROOF   pay-out spool, two pairs of wheels that hold the load, take-up spool; the microcrack; the break; the echo
// The machines are X-ray (`xray` shells + fine lines, `asShell`); SOLID are only the matter that becomes fibre (the
// liquid, the soot, the preform, the drop, the fibre, the spools) and the working ends (chucks, burner, wheels).
//
//   buildFabrique() → { group, A, update(S, time, px), fog(d) }
//   A       anchors: tank (the liquid's surface), dregs, burner (the lathe's nozzle, moves with it), flame, rod, sootBody,
//           furnaceMouth, sinterBody, preformEnd, towerTop, drop (follows the drop), gauge, cup1, cup2, uv, capstan,
//           spool, wheelsA, wheelsB, breakPoint, takeup
//   update  reads: boil, vapour, flame, soot, spin, deposit, doped, dust, sinter, sink, chlorine, water, bubble,
//           section, draw, drop, heat, feed, gauge, diam, coat, uv, wind, tension, flaw, claque, echo, pulse, flow, mood
//   SPEEDS  spin, wind and flow are SPEEDS: an angle or a phase = time × speed. Change them with `now` (or on a cut),
//           never with a tween: tweened at t ≈ 300 s, the angle would race through hundreds of turns.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glow, glass, asShell, edgesOf, fatLine, lathe, cyl, box, setGlow } from "@kit/build3d.js";
import { xray } from "@kit/usine.js";
import { makeLamp, makeStreaks } from "@kit/postes.js";
import { makeMotes } from "@kit/atmo.js";
import { rng } from "@kit/rng.js";
import { STILL, LATHE, SINTER, TOWER, PROOF } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeIO = (u) => u * u * (3 - 2 * u);
const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

/* ───────────────────────────── small helpers ───────────────────────────── */

let HALO_TEX = null;
/** A soft round light (a bright heart, a long fall-off) as a texture: what a light that has a place looks like. */
function haloTex() {
  if (HALO_TEX) return HALO_TEX;
  const n = 64;
  const d = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const r = Math.min(1, Math.hypot(((x + 0.5) / n) * 2 - 1, ((y + 0.5) / n) * 2 - 1));
      const a = Math.exp(-r * r * 14) * 0.55 + Math.pow(1 - r, 2.6) * 0.45;
      d.set([255, 255, 255, Math.round(255 * Math.min(1, a))], (y * n + x) * 4);
    }
  HALO_TEX = new THREE.DataTexture(d, n, n);
  HALO_TEX.needsUpdate = true;
  return HALO_TEX;
}
function halo(color, k, size) {
  const m = new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(color).multiplyScalar(k), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, fog: false });
  const s = new THREE.Sprite(m);
  s.scale.set(size, size, 1);
  s.renderOrder = 8;
  return s;
}
const setA = (obj, a) => {
  obj.visible = a > 0.003;
  obj.material.opacity = a;
};
const circle = (r, n = 64, f = (x, z) => [x, 0, z]) => {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    p.push(f(Math.cos(a) * r, Math.sin(a) * r));
  }
  return p;
};

/** The grid lines of a floor or a grating: about a pixel and a half, faded out before they get denser than ~3 px. */
const LINES_GLSL = /* glsl */ `
  float lines(float x, float cell) {
    float q = x / cell;
    float w = max(fwidth(q) * 1.5, 1e-5);
    float d = abs(fract(q - 0.5) - 0.5);
    return (1.0 - smoothstep(0.0, w, d)) * (1.0 - smoothstep(0.12, 0.45, w));
  }
  float grid(vec2 p, float c) { return max(lines(p.x, c), lines(p.y, c)); }`;
function gridMat({ cell, major, amount, ends = null }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: amount } },
    vertexShader: /* glsl */ `varying vec2 vP; void main() { vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vP;
      ${LINES_GLSL}
      void main() {
        float g = grid(vP, ${cell.toFixed(1)}) * 0.42 + grid(vP, ${major.toFixed(1)});
        float f = 1.0;
        ${ends ? `f = smoothstep(${ends[0].toFixed(1)}, ${(ends[0] + 1000).toFixed(1)}, vP.x) * (1.0 - smoothstep(${(ends[1] - 1000).toFixed(1)}, ${ends[1].toFixed(1)}, vP.x)) * (1.0 - smoothstep(500.0, 1300.0, abs(vP.y)));` : ""}
        gl_FragColor = vec4(uColor * g * f * uAmount, 1.0);
      }`,
  });
}

/** A lit solid whose `onBeforeCompile` adds what the stock material cannot do; `key` keeps its program apart. */
function patched(mat, key, U, patch) {
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    patch(sh);
  };
  mat.customProgramCacheKey = () => key;
  mat.userData.finish = false;
  return mat;
}

/** The soot body's matter: white, matt, porous; its layers as fine rings wherever the cut or a taper crosses them;
 *  the core (r < uCore) tinted veille by uDoped, its border a thin veille line ("le mur où la lumière ricoche"). */
function sootMat(U, o = {}) {
  const m = solid(0xe6e3da, { rough: 0.96, double: true, ...o });
  return patched(m, "l07-soot", U, (sh) => {
    sh.vertexShader = "varying float vR;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n vR = length(position.yz);");
    sh.fragmentShader =
      "uniform float uS, uDoped, uRod, uStep, uCore; uniform vec3 uVeille; varying float vR;\n" +
      sh.fragmentShader
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float rr = vR * uS;
          float q = (rr - uRod) / uStep;
          float fw = fwidth(q);
          float w = max(fw * 1.2, 1e-4);
          float d0 = abs(fract(q + 0.5) - 0.5);
          float ring = (1.0 - smoothstep(w * 0.5, w * 1.6, d0)) * smoothstep(0.004, 0.03, fw) * (1.0 - smoothstep(0.2, 0.45, w));
          diffuseColor.rgb *= 1.0 - 0.28 * ring;
          float cw = max(fwidth(rr), 0.04);
          float inCore = 1.0 - smoothstep(uCore - cw, uCore + cw, rr);
          diffuseColor.rgb = mix(diffuseColor.rgb, uVeille * 0.62, inCore * uDoped * 0.82);`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          totalEmissiveRadiance += uVeille * uDoped * (0.16 * inCore + 0.9 * (1.0 - smoothstep(cw * 0.6, cw * 2.2, abs(rr - uCore))) * smoothstep(0.004, 0.03, fw));`,
        );
  });
}

/* ═════════════════════════════ THE FACTORY ═════════════════════════════ */

export function buildFabrique() {
  const group = new THREE.Group();
  const A = {};
  const shells = [];
  const r = rng(707);
  const at = (name, x, y, z, parent = group) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    A[name] = o;
    return o;
  };
  /** an X-ray piece of machine */
  const X = (geo, pos, parent = group, o = {}) => {
    const m = xray(geo, { rim: 0.2, edge: 0.32, opacity: 0.5, base: 0.003, ...o });
    m.position.set(...pos);
    if (o.rot) m.rotation.set(...o.rot);
    parent.add(m);
    shells.push(m);
    return m;
  };
  /** a solid piece, its fine edges with it */
  const P = (geo, mat, pos, parent = group, o = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    if (o.rot) m.rotation.set(...o.rot);
    m.castShadow = o.shadow ?? true;
    m.receiveShadow = true;
    if (o.edges !== false && mat.color) {
      const light = lum(mat.color) > 0.3;
      m.add(edgesOf(geo, { color: light ? 0x1d2226 : BRAND.ink, width: 1.8, opacity: o.edgeOp ?? (light ? 0.55 : 0.7), threshold: o.threshold }));
    }
    parent.add(m);
    return m;
  };
  const L = (points, parent = group, o = {}) => {
    const l = fatLine(points, { color: BRAND.ink, width: 1.8, opacity: 0.35, ...o });
    parent.add(l);
    return l;
  };
  const DARK = () => solid(0x464d52, { rough: 0.42, metal: 0.4 });
  const STEEL = () => solid(0x8d959a, { rough: 0.34, metal: 0.45 });
  const CLEAR = () => {
    const m = solid(0xa9b4b9, { rough: 0.1, metal: 0.1, opacity: 0.3, env: 1.6 });
    m.depthWrite = false;
    return m;
  };

  /* — the floor: a grid, no slab — */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10400, 3000).rotateX(-Math.PI / 2).translate(3200, 0, 0), gridMat({ cell: 100, major: 500, amount: 0.11, ends: [-1600, 8000] }));
  floor.renderOrder = 1;
  group.add(floor);

  /* ═══════════ 1 — THE STILL ═══════════ */
  const st = new THREE.Group();
  st.position.x = STILL.x;
  group.add(st);
  const TR = STILL.tank[0] / 2;
  const TH = STILL.tank[1];
  const LEVEL = 104;
  X(lathe([[0, 12], [TR * 0.6, 14], [TR, 30], [TR, TH - 26], [TR * 0.66, TH - 6], [0, TH]], 64, { bevel: 2 }), [0, 0, 0], st, { rim: 0.24, edge: 0.45, spec: 0.35 });
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) X(box(8, 26, 8, 1), [sx * 52, 13, sz * 52], st);
  X(cyl(18, 14, 1, 32), [0, TH + 4, 0], st); // the manway
  // the liquid: clear as water, its surface a mirror
  const liqMat = solid(0x9aa4aa, { rough: 0.2, opacity: 0.26, env: 1.4 });
  liqMat.depthWrite = false;
  P(lathe([[0, 15], [TR * 0.6 - 1, 17], [TR - 2.5, 30], [TR - 2.5, LEVEL], [0, LEVEL]], 64), liqMat, [0, 0, 0], st, { edges: false, shadow: false });
  const UL = { uT: { value: 0 }, uB: { value: 0 } };
  const surfMat = patched(new THREE.MeshStandardMaterial({ color: 0x66717a, roughness: 0.1, metalness: 0.3, envMapIntensity: 1.8 }), "l07-liquid", UL, (sh) => {
    sh.vertexShader =
      `uniform float uT, uB;
      float hgt(vec2 p) {
        float rr = length(p);
        return uB * (0.9 * sin(0.34 * rr - 5.2 * uT) + 0.5 * sin(0.21 * p.x + 0.27 * p.y + 3.3 * uT) + 0.45 * sin(-0.25 * p.x + 0.19 * p.y + 2.1 * uT + 1.7));
      }\n` +
      sh.vertexShader
        .replace("#include <beginnormal_vertex>", "float h0 = hgt(position.xy); float hx = hgt(position.xy + vec2(1.0, 0.0)) - h0; float hy = hgt(position.xy + vec2(0.0, 1.0)) - h0; vec3 objectNormal = normalize(vec3(-hx, -hy, 1.0));")
        .replace("#include <begin_vertex>", "vec3 transformed = vec3(position.xy, position.z + h0);");
  });
  const surface = new THREE.Mesh(new THREE.RingGeometry(0.4, TR - 2.6, 120, 28), surfMat);
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = LEVEL;
  surface.receiveShadow = true;
  st.add(surface);
  st.add(fatLine(circle(TR - 2.6, 96, (x, z) => [x, LEVEL + 0.3, z]), { color: BRAND.ink, width: 1.8, opacity: 0.55 }));
  // the bubbles (boil) and the dregs (signal: the metals that stay)
  const NB = 44;
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), glow(BRAND.ink, 1.1, { additive: true, opacity: 0 }), NB);
  bubbles.frustumCulled = false;
  const bSeed = [];
  for (let i = 0; i < NB; i++) {
    const a = r() * Math.PI * 2;
    const rr = Math.sqrt(r()) * (TR - 12);
    bSeed.push([Math.cos(a) * rr, Math.sin(a) * rr, r(), 0.5 + r() * 0.7, 0.8 + r() * 1.4]);
  }
  st.add(bubbles);
  const dregMat = new THREE.MeshBasicMaterial({ color: SIGNAL.clone().multiplyScalar(1.25), transparent: true, opacity: 0.3, toneMapped: false });
  const dregs = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), dregMat, 34);
  {
    const m = new THREE.Matrix4();
    for (let i = 0; i < 34; i++) {
      const a = r() * Math.PI * 2;
      const rr = Math.sqrt(r()) * TR * 0.55;
      const s = 1.5 + r() * 3;
      m.makeRotationY(r() * 6).scale(new THREE.Vector3(s, s * 0.6, s)).setPosition(Math.cos(a) * rr, 16 + rr * 0.04, Math.sin(a) * rr);
      dregs.setMatrixAt(i, m);
    }
  }
  st.add(dregs);
  at("tank", 0, LEVEL, 0, st);
  at("dregs", 0, 18, 0, st);
  // the column, its trays, the line to the burner
  const CX = 200;
  const CR = STILL.column[0] / 2;
  const CH = STILL.column[1];
  X(cyl(CR, CH, 1.5, 48), [CX, CH / 2 + 10, 0], st, { rim: 0.24, edge: 0.45, spec: 0.3 });
  X(box(90, 10, 90, 1.5), [CX, 5, 0], st);
  for (let i = 1; i <= 9; i++) L(circle(CR - 1, 48, (x, z) => [CX + x, 10 + i * (CH / 10), z]), st, { opacity: 0.28 });
  X(cyl(6, 60, 0.5, 20), [TR + 28, 60, 0], st, { rot: [0, 0, Math.PI / 2] }); // tank → column
  const PIPE = [[CX, CH + 10], [CX, 600], [620, 600], [620, 90], [LATHE.x - 240, 90]];
  for (let i = 0; i < PIPE.length - 1; i++) {
    const [x0, y0] = PIPE[i];
    const [x1, y1] = PIPE[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    X(cyl(6, len, 0.5, 20), [(x0 + x1) / 2, (y0 + y1) / 2, 0], st, { rot: [0, 0, x1 === x0 ? 0 : Math.PI / 2], edge: 0.2 });
  }
  X(box(30, 40, 30, 2), [LATHE.x - 240, 90, 0], st); // the valve block at the lathe
  // the vapour: ink streaks up the column and along the pipe
  const vapA = makeStreaks({
    count: 60, seed: 21, len: 52, width: 2.2, k: 1.7,
    fill: (i, R) => {
      const a = R() * 6.283;
      const rr = Math.sqrt(R()) * (CR - 8);
      const y = 30 + R() * 80;
      return { o: [CX + Math.cos(a) * rr * 0.9, y, Math.sin(a) * rr], d: [0, 1, 0], l1: 600 - y, s: [1, 0, 0], l2: 420, speed: 62 + R() * 30 };
    },
  });
  const vapB = makeStreaks({
    count: 36, seed: 22, len: 64, width: 1.6, k: 1.4,
    fill: (i, R) => ({ o: [620 + (R() - 0.5) * 5, 600, (R() - 0.5) * 5], d: [0, -1, 0], l1: 510, s: [1, 0, 0], l2: LATHE.x - 240 - 620, speed: 90 + R() * 30 }),
  });
  st.add(vapA.mesh, vapB.mesh);

  /* ═══════════ 2 — THE LATHE ═══════════ */
  const la = new THREE.Group();
  la.position.x = LATHE.x;
  group.add(la);
  const LY = LATHE.y;
  const ROD = LATHE.rod[1] / 2;
  const RM = LATHE.body / 2;
  X(box(400, 28, 70, 2), [0, 46, -6], la);
  for (const sx of [-1, 1]) {
    X(box(34, 32, 60, 2), [sx * 160, 16, -6], la);
    X(box(56, 130, 78, 3), [sx * 172, 98, -6], la, { edge: 0.4 });
  }
  X(box(330, 36, 96, 3), [0, LY + 96, -4], la); // the exhaust hood
  X(cyl(15, 320, 1, 24), [0, LY + 274, -4], la);
  L([[-200, 61, 22], [200, 61, 22]], la, { opacity: 0.45 }); // the carriage's rails
  L([[-200, 61, -22], [200, 61, -22]], la, { opacity: 0.45 });
  // the chucks and the rod (they turn: spin)
  const spinners = [];
  for (const sx of [-1, 1]) {
    const ch = new THREE.Group();
    ch.position.set(sx * 134, LY, 0);
    la.add(ch);
    P(cyl(15, 16, 1, 40).rotateZ(Math.PI / 2), DARK(), [0, 0, 0], ch);
    const jm = STEEL();
    for (let j = 0; j < 3; j++) {
      const a = (j / 3) * Math.PI * 2;
      P(box(10, 6, 6, 0.8), jm, [-sx * 11, Math.cos(a) * 7, Math.sin(a) * 7], ch, { rot: [a, 0, 0] });
    }
    spinners.push(ch);
  }
  const rodG = new THREE.Group();
  rodG.position.y = LY;
  la.add(rodG);
  P(cyl(ROD, 280, 0.3, 24).rotateZ(Math.PI / 2), solid(0xcbc8bf, { rough: 0.5 }), [0, 0, 0], rodG, { edgeOp: 0.3 });
  for (const x of [-115, 115]) P(cyl(ROD + 0.4, 3, 0.2, 24).rotateZ(Math.PI / 2), DARK(), [x, 0, 0], rodG, { edges: false });
  spinners.push(rodG);
  // the soot body: a quarter cut away (fixed: the cut faces the key light and the camera), its filler wedge fades with `doped`
  const US = { uS: { value: 0.1 }, uDoped: { value: 0 }, uRod: { value: ROD }, uStep: { value: (RM - ROD) / 13 }, uCore: { value: LATHE.coreBody / 2 }, uVeille: { value: VEILLE } };
  const prof = [[ROD, -102], [RM * 0.3, -96], [RM * 0.55, -89], [RM * 0.8, -81], [RM * 0.95, -75], [RM, -70], [RM, 70], [RM * 0.95, 75], [RM * 0.8, 81], [RM * 0.55, 89], [RM * 0.3, 96], [ROD, 102]];
  const lat = (p0, len) => new THREE.LatheGeometry(prof.map(([rr, y]) => new THREE.Vector2(rr, y)), 72, p0, len).rotateZ(-Math.PI / 2);
  const sootG = new THREE.Group();
  sootG.position.y = LY;
  la.add(sootG);
  const sootM = sootMat(US);
  const bodyMain = new THREE.Mesh(lat(0, Math.PI * 1.5), sootM);
  const shape = new THREE.Shape(prof.map(([rr, y]) => new THREE.Vector2(y, rr)));
  const faceA = new THREE.Mesh(new THREE.ShapeGeometry(shape, 1), sootM); //  z = 0, facing +z
  const faceB = new THREE.Mesh(new THREE.ShapeGeometry(shape, 1).rotateX(Math.PI / 2), sootM); // y = 0, facing +y
  const fillM = sootMat(US, { opacity: 1 });
  const filler = new THREE.Mesh(lat(Math.PI * 1.5, Math.PI * 0.5), fillM);
  for (const m of [bodyMain, faceA, faceB, filler]) {
    m.castShadow = m.receiveShadow = true;
    sootG.add(m);
  }
  at("rod", 0, LY, 0, la);
  at("sootBody", 0, LY, 0, la);
  // the dust caught between two layers, on the cut face
  const dustG = new THREE.Group();
  sootG.add(dustG);
  dustG.position.set(28, 9.4, 0.4);
  const dustCore = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), glow(BRAND.signal, 2, { opacity: 0 }));
  const dustHalo = halo(BRAND.signal, 1.1, 9);
  dustG.add(dustCore, dustHalo);
  // the burner's carriage: it travels along the rod while the flame burns
  const car = new THREE.Group();
  la.add(car);
  X(box(48, 22, 44, 2), [0, 72, 0], car, { edge: 0.45 });
  P(cyl(4.5, 26, 0.6, 24), DARK(), [0, 96, 0], car);
  const flameOut = new THREE.Mesh(new THREE.ConeGeometry(6.5, 36, 24, 1, true).translate(0, 18, 0), glow(BRAND.signal, 1.15, { additive: true, opacity: 0.5, double: true }));
  const flameIn = new THREE.Mesh(new THREE.ConeGeometry(3, 24, 20, 1, true).translate(0, 12, 0), glow(BRAND.signal, 2.3, { additive: true, opacity: 0.9, double: true }));
  const flameG = new THREE.Group();
  flameG.position.y = 108;
  flameG.add(flameOut, flameIn);
  const flameHalo = halo(BRAND.signal, 0.7, 46);
  flameHalo.position.y = 8;
  flameG.add(flameHalo);
  car.add(flameG);
  at("burner", 0, 108, 0, car);
  at("flame", 0, 118, 0, car);
  const sootStreaks = makeStreaks({
    count: 70, seed: 31, len: 16, width: 0.8, k: 0.62,
    fill: (i, R) => {
      const dx = (R() - 0.5) * 9;
      const dz = (R() - 0.5) * 9;
      const side = i % 2 ? 1 : -1;
      return { o: [dx, 112, dz], d: [dx * 0.03, 1, dz * 0.03], l1: 22 + R() * 14, s: [(R() - 0.5) * 0.5, 0.75, side * 0.66], l2: 18 + R() * 26, speed: 48 + R() * 22 };
    },
  });
  car.add(sootStreaks.mesh);
  const grains = makeMotes({ count: 170, seed: 12, min: [-13, 108, -13], size: [26, 34, 26], psize: [0.35, 0.95], color: BRAND.ink, drift: [0, 24, 0] });
  const impur = makeMotes({ count: 12, seed: 13, min: [-12, 108, -12], size: [24, 32, 24], psize: [0.7, 1.3], color: BRAND.signal, drift: [0, 22, 0] });
  grains.points.renderOrder = impur.points.renderOrder = 7;
  car.add(grains.points, impur.points);

  /* ═══════════ 3 — THE SINTERING FURNACE ═══════════ */
  const si = new THREE.Group();
  si.position.x = SINTER.x;
  group.add(si);
  const HOT = (SINTER.hot[0] + SINTER.hot[1]) / 2;
  const SL = SINTER.len;
  X(box(230, 40, 200, 3), [0, 20, 0], si);
  const housing = X(cyl(76, 300, 2, 72), [0, HOT, 0], si, { heat: (x, y) => 0.35 + 0.65 * Math.exp(-((y / 110) ** 2)), rim: 0.22, edge: 0.4 });
  const muffle = X(cyl(30, 440, 1, 64), [0, 260, 0], si, { rim: 0.26, edge: 0.55, spec: 0.45 });
  void muffle;
  const elemMat = glow(BRAND.signal, 1.7, { opacity: 0 });
  const elements = [];
  for (let i = 0; i < 5; i++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(40, 1.3, 8, 72).rotateX(Math.PI / 2), elemMat);
    t.position.y = SINTER.hot[0] + 18 + i * ((SINTER.hot[1] - SINTER.hot[0] - 36) / 4);
    si.add(t);
    elements.push(t);
  }
  const sHalo = halo(BRAND.signal, 0.35, 330);
  sHalo.position.set(0, HOT, -30);
  si.add(sHalo);
  for (const sx of [-1, 1]) X(box(12, 940, 12, 1), [sx * 112, 470, -70], si);
  X(box(250, 14, 16, 1), [0, 940, -70], si);
  L([[0, 940, -70], [0, 940, -10], [0, 940, 0]], si);
  // the hoist's carriage and the hanging rod (move with the body)
  const hang = new THREE.Group();
  si.add(hang);
  X(box(70, 22, 34, 2), [0, 0, -50], hang);
  const hangRod = P(cyl(1.6, 1, 0.2, 16), STEEL(), [0, 0, 0], hang, { edges: false });
  // the body: white (porous) above the front, clear below; the core inside the clear
  const sb = new THREE.Group();
  si.add(sb);
  const unitCyl = (rr, seg = 64) => new THREE.CylinderGeometry(rr, rr, 1, seg, 1);
  const white = P(unitCyl(SINTER.body / 2), solid(0xe6e3da, { rough: 0.96 }), [0, 0, 0], sb, { edgeOp: 0.35 });
  const RC = SINTER.clear / 2;
  const clear = P(unitCyl(RC), CLEAR(), [0, 0, 0], sb, { edges: false, shadow: false });
  const clearRim = new THREE.Mesh(unitCyl(RC + 0.15), glass(BRAND.ink, { base: 0, rim: 0.42, power: 2.4, edge: 0.55, spec: 0.75 }));
  sb.add(clearRim);
  const coreK = (LATHE.coreBody / LATHE.body) * RC;
  const sCore = new THREE.Mesh(unitCyl(coreK, 32), glow(BRAND.veille, 0.55, { opacity: 0.85 }));
  sb.add(sCore);
  const frontRing = new THREE.Mesh(new THREE.TorusGeometry(SINTER.body / 2 - 1.6, 1.6, 10, 72).rotateX(Math.PI / 2), glow(BRAND.signal, 1.5, { opacity: 0 }));
  sb.add(frontRing);
  P(cyl(5, 10, 0.8, 24), DARK(), [0, SL / 2 + 5, 0], sb); // the handle
  // the end, cut away: the cladding's face and the core's
  const capG = new THREE.Group();
  capG.position.y = -SL / 2 - 0.2;
  sb.add(capG);
  const capFace = new THREE.Mesh(new THREE.CircleGeometry(RC, 64).rotateX(Math.PI / 2), solid(0xc9d1d4, { rough: 0.12, opacity: 0.85, double: true }));
  const capCore = new THREE.Mesh(new THREE.CircleGeometry(coreK, 48).rotateX(Math.PI / 2), glow(BRAND.veille, 1, { double: true }));
  capCore.position.y = -0.15;
  const capRing = fatLine(circle(RC, 72, (x, z) => [x, -0.2, z]), { color: BRAND.ink, width: 2, opacity: 0.7 });
  const capCoreRing = fatLine(circle(coreK, 48, (x, z) => [x, -0.3, z]), { color: BRAND.veille, width: 2, opacity: 0 });
  capG.add(capFace, capCore, capRing, capCoreRing);
  // water in the pores (signal points), the bubble
  const NW = 46;
  const waterMat = new THREE.MeshBasicMaterial({ color: SIGNAL.clone().multiplyScalar(1.7), transparent: true, opacity: 0, toneMapped: false });
  const water = new THREE.InstancedMesh(new THREE.SphereGeometry(0.85, 8, 6), waterMat, NW);
  water.frustumCulled = false;
  const wSeed = [];
  for (let i = 0; i < NW; i++) wSeed.push([r() * Math.PI * 2, -SL / 2 + 8 + r() * (SL - 16)]);
  sb.add(water);
  const bubbleG = new THREE.Group();
  bubbleG.position.set(4.5, -SL / 2 + 46, 4);
  bubbleG.add(new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 12), glow(BRAND.signal, 1.4, { opacity: 0 })), halo(BRAND.signal, 0.9, 16));
  sb.add(bubbleG);
  const chlorine = makeStreaks({
    count: 56, seed: 41, len: 44, width: 0.9, k: 0.5,
    fill: (i, R) => {
      const a = R() * 6.283;
      const rr = 19 + R() * 8;
      const sw = (R() - 0.5) * 0.12;
      return { o: [Math.cos(a) * rr, 46 + R() * 20, Math.sin(a) * rr], d: [-Math.sin(a) * sw, 1, Math.cos(a) * sw], l1: 420, speed: 70 + R() * 30 };
    },
  });
  si.add(chlorine.mesh);
  L([[-120, 46, 0], [-31, 46, 0]], si, { opacity: 0.45 }); // the chlorine's inlet
  X(cyl(5, 90, 0.5, 16), [-76, 46, 0], si, { rot: [0, 0, Math.PI / 2] });
  at("furnaceMouth", 0, 480, 0, si);
  at("sinterBody", 0, 0, 0, sb);
  at("preformEnd", 0, -SL / 2, 0, sb);

  /* ═══════════ 4 — THE DRAW TOWER ═══════════ */
  const tw = new THREE.Group();
  tw.position.x = TOWER.x;
  group.add(tw);
  const FH = TOWER.frame[1];
  const HW = TOWER.frame[0] / 2 - 10;
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) X(box(14, FH, 14, 1.5), [sx * HW, FH / 2, sz * HW], tw, { opacity: 0.8, edge: 0.5, width: 2 });
  const FLOORS = [320, 700, 1060, TOWER.furnace[0] - 2, 1640]; // the furnace stands on the 4th floor: the drop hangs under it, in the open
  const grate = gridMat({ cell: 6, major: 30, amount: 0.1 });
  for (const y of FLOORS) {
    const sq = new THREE.Shape([[-HW, -HW], [HW, -HW], [HW, HW], [-HW, HW]].map(([a, b]) => new THREE.Vector2(a, b)));
    sq.holes.push(new THREE.Path([[-40, -40], [-40, 40], [40, 40], [40, -40]].map(([a, b]) => new THREE.Vector2(a, b))));
    const g = new THREE.Mesh(new THREE.ShapeGeometry(sq).rotateX(-Math.PI / 2), grate);
    g.position.y = y;
    g.renderOrder = 1;
    tw.add(g);
    L([[-HW, y, -HW], [HW, y, -HW], [HW, y, HW], [-HW, y, HW], [-HW, y, -HW]], tw, { opacity: 0.5 });
    L([[-40, y, -40], [40, y, -40], [40, y, 40], [-40, y, 40], [-40, y, -40]], tw, { opacity: 0.3 });
    L([[-HW, y + 100, -HW], [HW, y + 100, -HW], [HW, y + 100, HW * 0.2]], tw, { opacity: 0.26 }); // the railing, back and side
  }
  // bracing on the back, the stair outside the −x face
  const levels = [0, ...FLOORS];
  for (let i = 0; i < levels.length - 1; i++) {
    const y0 = levels[i];
    const y1 = levels[i + 1];
    L([[-HW, y0, -HW], [HW, y1, -HW]], tw, { opacity: 0.2 });
    L([[HW, y0, -HW], [-HW, y1, -HW]], tw, { opacity: 0.2 });
    const z0 = i % 2 ? HW : -HW;
    L([[-HW - 60, y0, z0], [-HW - 60, y1, -z0]], tw, { opacity: 0.32 });
    L([[-HW - 60, y0 + 90, z0], [-HW - 60, y1 + 90, -z0]], tw, { opacity: 0.18 });
  }
  X(box(90, 190, 56, 3), [-HW + 50, 95, -HW + 34], tw); // the drive cabinet
  // the feed: rails, screw and motor at the top
  for (const sx of [-1, 1]) X(box(8, 290, 8, 1), [sx * 34, 1760, -22], tw);
  X(box(96, 56, 64, 3), [0, 1886, -22], tw);
  L([[0, 1630, -22], [0, 1860, -22]], tw, { opacity: 0.5, width: 2 });
  const feedCar = new THREE.Group();
  tw.add(feedCar);
  X(box(86, 20, 50, 2), [0, 14, -10], feedCar);
  P(cyl(14, 16, 1, 40), DARK(), [0, 0, 0], feedCar);
  // the preform: clear glass, the core inside; its neck in the furnace, heated (signal)
  const PR = TOWER.preform[0] / 2;
  const NECK = 1528; // the neck starts inside the furnace…
  const TIP = TOWER.furnace[0] - 28; // …and its tip comes out of it: the cone and the drop are seen in the open, under the furnace
  const pf = P(unitCyl(PR), CLEAR(), [0, 0, 0], tw, { edges: false, shadow: false });
  const pfRim = new THREE.Mesh(unitCyl(PR + 0.15), glass(BRAND.ink, { base: 0, rim: 0.42, power: 2.4, edge: 0.55, spec: 0.75 }));
  const pfCore = new THREE.Mesh(unitCyl((LATHE.coreBody / LATHE.body) * PR, 32), glow(BRAND.veille, 0.5, { opacity: 0.8 }));
  tw.add(pfRim, pfCore);
  const neckProf = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    neckProf.push([0.9 + (PR - 0.9) * Math.pow(1 - t, 0.85), NECK - t * (NECK - TIP)]);
  }
  neckProf.push([0, TIP - 0.4]);
  const neckGeo = new THREE.LatheGeometry(neckProf.map(([a, b]) => new THREE.Vector2(a, b)).reverse(), 64);
  P(neckGeo, CLEAR(), [0, 0, 0], tw, { edges: false, shadow: false });
  const UH = { uHeat: { value: 0 } };
  const hotMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { ...UH, uSig: { value: SIGNAL }, uInk: { value: INK } },
    vertexShader: /* glsl */ `varying float vY; varying vec3 vN; varying vec3 vV;
      void main() { vY = position.y; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `uniform float uHeat; uniform vec3 uSig, uInk; varying float vY; varying vec3 vN; varying vec3 vV;
      void main() {
        float t = clamp((${NECK.toFixed(1)} + 24.0 - vY) / ${(NECK + 24 - TIP).toFixed(1)}, 0.0, 1.0);
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        vec3 c = uSig * (0.25 + 1.7 * t * t) + uInk * 0.55 * t * t * t * t;
        gl_FragColor = vec4(c * uHeat * (0.5 + 0.5 * f), 1.0);
      }`,
  });
  const neckHot = new THREE.Mesh(new THREE.LatheGeometry([[PR + 0.3, NECK + 24], [PR + 0.3, NECK], ...neckProf.slice(1).map(([a, b]) => [a + 0.3, b])].map(([a, b]) => new THREE.Vector2(a, b)).reverse(), 64), hotMat);
  neckHot.renderOrder = 6;
  tw.add(neckHot);
  // the furnace
  const FC = (TOWER.furnace[0] + TOWER.furnace[1]) / 2;
  const FHt = TOWER.furnace[1] - TOWER.furnace[0];
  const tFurn = X(cyl(72, FHt, 2, 72), [0, FC, 0], tw, { heat: (x, y) => 0.55 + 0.45 * Math.exp(-((y / 52) ** 2)), rim: 0.22, edge: 0.42 });
  const boreMat = glow(BRAND.signal, 1.25, { additive: true, opacity: 0 });
  boreMat.side = THREE.BackSide;
  const bore = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, FHt - 6, 48, 1, true), boreMat);
  bore.position.y = FC;
  tw.add(bore);
  const tElem = glow(BRAND.signal, 1.8, { opacity: 0 });
  for (let i = 0; i < 3; i++) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(28, 1.4, 8, 64).rotateX(Math.PI / 2), tElem);
    t.position.y = TOWER.furnace[0] + 30 + i * 40;
    tw.add(t);
  }
  const fHalo = halo(BRAND.signal, 0.55, 260);
  fHalo.position.y = TOWER.furnace[0] - 6;
  tw.add(fHalo);
  // the drop and the thread it pulls
  const dropG = new THREE.Group();
  tw.add(dropG);
  // hot glass has a volume: whiter where it faces the eye (the thickest glass), deep orange at its rim
  const dropMat = new THREE.ShaderMaterial({
    uniforms: { uSig: { value: SIGNAL }, uInk: { value: INK } },
    vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vV; varying float vY;
      void main() { vY = position.y; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `uniform vec3 uSig, uInk; varying vec3 vN; varying vec3 vV; varying float vY;
      void main() {
        float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        float low = clamp(0.5 - 0.5 * vY, 0.0, 1.0);
        vec3 c = uSig * (0.75 + 1.25 * f * f) + uInk * (0.25 * pow(f, 6.0) + 0.12 * low * f);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const dropM = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), dropMat);
  const dropCore = new THREE.Mesh(new THREE.SphereGeometry(1.25, 24, 16), glow(BRAND.signal, 0.5, { additive: true, opacity: 0.6 }));
  const dropHalo = halo(BRAND.signal, 0.85, 1);
  dropG.add(dropM, dropCore, dropHalo);
  const dropA = at("drop", 0, TOWER.drop, 0, tw);
  const thread = new THREE.Mesh(unitCyl(0.8, 16), glow(BRAND.signal, 1.7));
  tw.add(thread);
  // the fibre: bare glass (glowing ink), then the soft and the hard resin (solid, lit)
  const YC1 = TOWER.cup1;
  const YC2 = TOWER.cup2;
  const YP = TOWER.pulley + 20;
  const vseg = (y0, y1, mat) => {
    const m = new THREE.Mesh(unitCyl(1, 16), mat);
    m.position.y = (y0 + y1) / 2;
    m.scale.set(0.6, y0 - y1, 0.6);
    tw.add(m);
    return m;
  };
  const bareMat = glow(BRAND.ink, 1.15, { opacity: 1 });
  const segA = vseg(TIP, YC1 - 25, bareMat);
  const segB = vseg(YC1 - 25, YC2 - 25, bareMat);
  const segC = vseg(YC2 - 25, YP, bareMat);
  const softMat = solid(0xd8dad3, { rough: 0.32, opacity: 1 });
  const coatMat = solid(0xd8dad3, { rough: 0.3, opacity: 1 });
  const segBc = vseg(YC1 - 25, YC2 - 25, softMat);
  const segCc = vseg(YC2 - 25, YP, coatMat);
  const hotTip = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 70, 12, 1, true).translate(0, TIP - 35, 0), hotMat);
  hotTip.renderOrder = 6;
  tw.add(hotTip);
  // the path along the bottom: around the pulley, over the capstan, to the spool
  const pts = [[0, TIP, 0], [0, YP, 0]];
  for (let i = 1; i <= 10; i++) {
    const a = Math.PI + (i / 10) * Math.PI * 0.5;
    pts.push([22 + 22 * Math.cos(a), YP + 22 * Math.sin(a), 0]);
  }
  const CAP = [150, TOWER.capstan + 30];
  const CAPR = 38;
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI / 2 - (i / 12) * Math.PI * 0.75;
    pts.push([CAP[0] + CAPR * Math.cos(a), CAP[1] + CAPR * Math.sin(a), 0]);
  }
  const SP = [TOWER.spool[0] - TOWER.x, TOWER.spool[1]];
  pts.push([SP[0], SP[1] - 33, 0]);
  const bottom = pts.slice(2);
  const curve = new THREE.CatmullRomCurve3(bottom.map((p) => new THREE.Vector3(...p)), false, "centripetal");
  const botBare = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.6, 8), bareMat);
  const botCoat = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 1.75, 10), coatMat);
  tw.add(botBare, botCoat);
  const strandLine = fatLine(pts, { color: BRAND.ink, width: 2, opacity: 0.5 });
  const marks = fatLine(pts, { color: BRAND.ink, width: 2.6, opacity: 1, dashed: true, dashSize: 3, gapSize: 57, hdr: 1.7 });
  tw.add(strandLine, marks);
  // the laser gauge
  const YG = TOWER.gauge;
  X(box(130, 24, 130, 3), [0, YG, 0], tw, { rim: 0.16, edge: 0.3 });
  const emitM = DARK();
  P(box(14, 16, 14, 1.2), emitM, [-56, YG, 0], tw);
  P(box(14, 16, 14, 1.2), emitM, [0, YG, -56], tw);
  const recvM = STEEL();
  P(box(10, 16, 14, 1.2), recvM, [56, YG, 0], tw);
  P(box(14, 16, 10, 1.2), recvM, [0, YG, 56], tw);
  const beamMat = glow(BRAND.veille, 1.9, { opacity: 0 });
  const beamX = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 100, 10).rotateZ(Math.PI / 2), beamMat);
  const beamZ = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 100, 10).rotateX(Math.PI / 2), beamMat);
  beamX.position.y = beamZ.position.y = YG;
  tw.add(beamX, beamZ);
  const sheetMat = new THREE.MeshBasicMaterial({ color: VEILLE.clone().multiplyScalar(0.5), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const sheetGeo = new THREE.BufferGeometry();
  sheetGeo.setAttribute("position", new THREE.Float32BufferAttribute([-50, 0, 0, 50, 0, -12, 50, 0, 12], 3));
  const sheet = new THREE.Mesh(sheetGeo, sheetMat);
  sheet.position.y = YG;
  tw.add(sheet);
  L([[-32, YG + 16, 66], [32, YG + 16, 66]], tw, { opacity: 0.5 });
  for (const x of [-32, -16, 0, 16, 32]) L([[x, YG + (x === 0 ? 11 : 13), 66], [x, YG + 19, 66]], tw, { opacity: x === 0 ? 0.6 : 0.3 });
  const markerMat = glow(BRAND.veille, 1.6, { opacity: 0 });
  const marker = new THREE.Mesh(box(3.2, 9, 1.4, 0.4), markerMat);
  marker.position.set(0, YG + 16, 66.5);
  tw.add(marker);
  at("gauge", 0, YG, 0, tw);
  // the coating cups
  const cupProf = [[3, -26], [9, -26], [21, -12], [21, 25]];
  const resins = [];
  for (const [y, col] of [[YC1, 0xc3c7c1], [YC2, 0xa2a9a6]]) {
    X(lathe(cupProf, 48, { bevel: 1 }), [0, y, 0], tw, { rim: 0.26, edge: 0.5, spec: 0.35 });
    P(cyl(5, 6, 0.5, 24), DARK(), [0, y - 27, 0], tw);
    const rm = solid(col, { rough: 0.28, opacity: 1 });
    resins.push(P(lathe([[2, -24], [9, -24], [20, -11], [20, 14], [0, 14]], 48), rm, [0, y, 0], tw, { edgeOp: 0.25 }));
    L([[21, y + 18, 0], [60, y + 18, 0], [60, y + 18, -HW], [60, FLOORS[2] + 40, -HW]], tw, { opacity: 0.32 });
  }
  at("cup1", 0, YC1, 0, tw);
  at("cup2", 0, YC2, 0, tw);
  // the UV tunnel: four lamp houses, lit from the top down
  const UV0 = TOWER.uv[0];
  const UVH = (TOWER.uv[1] - TOWER.uv[0]) / 4;
  const uvUnits = [];
  for (let i = 0; i < 4; i++) {
    const y = TOWER.uv[1] - UVH * (i + 0.5);
    X(box(80, UVH - 6, 80, 2.5), [0, y, 0], tw, { rim: 0.18, edge: 0.34 });
    const tubeMat = glow(BRAND.ink, 1.9, { opacity: 0 });
    const lamps = [];
    for (const sx of [-1, 1]) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, UVH - 16, 16), tubeMat);
      t.position.set(sx * 26, y, -12);
      tw.add(t);
      const lamp = makeLamp({ length: 26, r0: 2.4, r1: 11, k: 0.55 });
      lamp.group.position.set(sx * 23, y, -10);
      lamp.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-sx, 0, 0.45).normalize());
      tw.add(lamp.group);
      lamps.push(lamp);
    }
    const h = halo(BRAND.ink, 0.32, 120);
    h.position.set(0, y, -20);
    tw.add(h);
    uvUnits.push({ tubeMat, lamps, h });
  }
  void UV0;
  at("uv", 0, (TOWER.uv[0] + TOWER.uv[1]) / 2, 0, tw);
  // the pulley, the capstan, the spool
  const pulley = new THREE.Group();
  pulley.position.set(22, YP, 0);
  tw.add(pulley);
  const sheave = (rad, th, holes) => {
    const s = new THREE.Shape(circle(rad, 64, (x, y) => [x, y]).map(([x, y]) => new THREE.Vector2(x, y)));
    for (let i = 0; i < holes; i++) {
      const a = (i / holes) * Math.PI * 2;
      s.holes.push(new THREE.Path(circle(rad * 0.2, 24, (x, y) => [x + Math.cos(a) * rad * 0.55, y + Math.sin(a) * rad * 0.55]).map(([x, y]) => new THREE.Vector2(x, y))));
    }
    return new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: true, bevelThickness: 0.8, bevelSize: 0.8, bevelSegments: 1, curveSegments: 48 }).translate(0, 0, -th / 2);
  };
  P(sheave(21, 5, 4), STEEL(), [0, 0, 0], pulley);
  X(box(8, 60, 8, 1), [22, YP - 30, -12], tw);
  const capstan = new THREE.Group();
  capstan.position.set(CAP[0], CAP[1], 0);
  tw.add(capstan);
  P(sheave(CAPR - 3, 12, 5), STEEL(), [0, 0, 0], capstan);
  P(new THREE.TorusGeometry(CAPR - 1.6, 2.2, 10, 72), solid(0x2e3438, { rough: 0.6 }), [0, 0, 0], capstan, { edges: false });
  X(box(70, CAP[1] + 30, 40, 2), [CAP[0], (CAP[1] + 30) / 2, -36], tw);
  at("capstan", CAP[0], CAP[1], 0, tw);
  const makeSpool = (parent, pos) => {
    const g = new THREE.Group();
    g.position.set(...pos);
    parent.add(g);
    const flM = solid(0x4a5156, { rough: 0.4, metal: 0.35 });
    for (const z of [-24, 24]) P(sheave(54, 4, 6), flM, [0, 0, z], g);
    P(cyl(33, 44, 0.6, 72).rotateX(Math.PI / 2), solid(0xd3d6cf, { rough: 0.45 }), [0, 0, 0], g, { edgeOp: 0.3 });
    P(cyl(8, 60, 0.6, 32).rotateX(Math.PI / 2), DARK(), [0, 0, 0], g);
    return g;
  };
  const spool = makeSpool(tw, [SP[0], SP[1], 0]);
  X(box(150, 30, 100, 2), [SP[0], 15, 0], tw);
  for (const sz of [-1, 1]) X(box(10, 70, 10, 1), [SP[0], 50, sz * 38], tw);
  const spoolFlaw = halo(BRAND.signal, 1, 7);
  spoolFlaw.position.set(-8, 30, 26);
  spool.add(spoolFlaw);
  at("spool", SP[0], SP[1], 0, tw);
  at("towerTop", 0, TOWER.feed, 0, tw);

  /* ═══════════ 5 — THE PROOF TEST ═══════════ */
  const pr = new THREE.Group();
  pr.position.set(PROOF.x, PROOF.y, 0);
  group.add(pr);
  const PY = -PROOF.y;
  X(box(660, 22, 150, 2.5), [0, -97, 0], pr);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) X(box(10, PROOF.y - 22, 10, 1), [sx * 310, PY + (PROOF.y - 22) / 2, sz * 64], pr);
  X(box(660, 210, 8, 2), [0, -4, -46], pr, { rim: 0.14, edge: 0.3 });
  const back = halo(BRAND.ink, 0.1, 700);
  back.position.set(0, 4, -70);
  pr.add(back);
  const payout = makeSpool(pr, [PROOF.payout[0], -33, 0]);
  const takeup = makeSpool(pr, [PROOF.takeup[0], -33, 0]);
  // the wheel pairs: they turn with the fibre, close on it with the load, their rims veille while it holds
  const WR = PROOF.wheel / 2;
  const rimMat = glow(BRAND.veille, 1.6, { opacity: 0 });
  const wheels = [];
  for (const wx of [PROOF.wheelsA[0], PROOF.wheelsB[0]]) {
    for (const side of [1, -1]) {
      const w = new THREE.Group();
      w.position.set(wx, side * (WR + 1.2), 0);
      pr.add(w);
      P(sheave(WR - 2.2, 9, 4), STEEL(), [0, 0, 0], w);
      P(new THREE.TorusGeometry(WR - 1.2, 1.6, 10, 64), solid(0x2c3236, { rough: 0.65 }), [0, 0, 0], w, { edges: false });
      const rim = new THREE.Mesh(new THREE.TorusGeometry(WR - 1.2, 0.5, 6, 64), rimMat);
      rim.position.z = 5.2;
      w.add(rim);
      P(cyl(3.5, 30, 0.5, 20).rotateX(Math.PI / 2), DARK(), [0, 0, -17], w);
      wheels.push({ w, side, wx });
    }
  }
  // the test fibre: one tube, its sag, its break and its pulses in the shader
  const UF = {
    uT: { value: 0 }, uTension: { value: 0 }, uClaque: { value: 0 }, uXa: { value: PROOF.wheelsA[0] }, uXb: { value: PROOF.wheelsB[0] }, uBp: { value: PROOF.breakAt },
    uPulse: { value: 0 }, uFlow: { value: 1 }, uFlaw: { value: 0 }, uInk: { value: INK }, uVeille: { value: VEILLE }, uSignal: { value: SIGNAL },
  };
  const span = PROOF.takeup[0] - PROOF.payout[0];
  const fibreT = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, span, 10, 320, true).rotateZ(-Math.PI / 2).translate((PROOF.takeup[0] + PROOF.payout[0]) / 2, 0, 0),
    new THREE.ShaderMaterial({
      uniforms: UF,
      vertexShader: /* glsl */ `
        uniform float uTension, uClaque, uXa, uXb, uBp;
        varying float vX; varying vec3 vN; varying vec3 vV;
        void main() {
          vec3 p = position; float x = p.x;
          float s = clamp((x - uXa) / (uXb - uXa), 0.0, 1.0);
          p.y -= (1.0 - uTension) * 20.0 * s * (1.0 - s);
          float side = x < uBp ? -1.0 : 1.0;
          float w = exp(-abs(x - uBp) / 55.0);
          p.x += side * uClaque * 26.0 * w;
          p.y += uClaque * 16.0 * w * w;
          vX = x;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uVeille, uSignal; uniform float uT, uPulse, uFlow, uFlaw, uClaque, uBp;
        varying float vX; varying vec3 vN; varying vec3 vV;
        void main() {
          if (uClaque > 0.01 && abs(vX - uBp) < 0.6 + 2.0 * uClaque) discard;
          float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
          vec3 col = uInk * (0.5 + 0.55 * f);
          float ph = fract((vX - uT * 180.0 * uFlow) / 70.0);
          float head = pow(clamp(ph, 0.0, 1.0), 5.0) * (1.0 - smoothstep(0.93, 1.0, ph));
          float live = uClaque > 0.01 ? step(vX, uBp) : 1.0;
          col += uVeille * 2.1 * head * uPulse * live;
          float fl = exp(-pow((vX - uBp) / 1.4, 2.0)) * uFlaw;
          col = mix(col, uSignal * 2.2, clamp(fl, 0.0, 1.0));
          gl_FragColor = vec4(col, 1.0);
        }`,
    }),
  );
  pr.add(fibreT);
  const flawG = new THREE.Group();
  flawG.position.set(PROOF.breakAt, 0, 1.6);
  const flawH = halo(BRAND.signal, 1.2, 12);
  flawG.add(flawH);
  pr.add(flawG);
  const flash = halo(BRAND.ink, 2.2, 24);
  flash.position.set(PROOF.breakAt, 4, 3);
  pr.add(flash);
  // the echo on the finished spool: a band of light out across it, the flaw lights, a weaker one comes back
  const UE = { uEcho: { value: 0 }, uVeille: { value: VEILLE } };
  const echoM = new THREE.Mesh(
    new THREE.CylinderGeometry(33.4, 33.4, 44, 72, 1, true).rotateX(Math.PI / 2),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: UE,
      vertexShader: /* glsl */ `varying float vU; varying vec3 vN; varying vec3 vV;
        void main() { vU = (position.z + 22.0) / 44.0; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `uniform float uEcho; uniform vec3 uVeille; varying float vU; varying vec3 vN; varying vec3 vV;
        void main() {
          float e = uEcho;
          float out_ = e <= 1.0 ? 1.0 : 0.0;
          float p = e <= 1.0 ? e : 0.72 * (2.0 - e);
          float d = vU - p;
          float band = exp(-d * d / 0.0016) + (out_ > 0.5 ? step(d, 0.0) * exp(d / 0.12) * 0.35 : step(0.0, d) * exp(-d / 0.12) * 0.3);
          float on = smoothstep(0.0, 0.03, e) * (1.0 - smoothstep(1.96, 2.0, e)) * (out_ > 0.5 ? 1.0 : 0.6);
          float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
          gl_FragColor = vec4(uVeille * 1.5 * band * on * (0.35 + 0.65 * f), 1.0);
        }`,
    }),
  );
  echoM.renderOrder = 7;
  takeup.add(echoM);
  const echoFlaw = halo(BRAND.signal, 1.3, 11);
  echoFlaw.position.set(-12, 30, -22 + 44 * 0.72);
  takeup.add(echoFlaw);
  X(box(46, 30, 34, 2), [330, -70, 58], pr); // the reflectometer
  L([[330, -55, 58], [330, -33, 40], [PROOF.takeup[0], -33, 24]], pr, { opacity: 0.5, width: 2 });
  at("wheelsA", PROOF.wheelsA[0], 0, 0, pr);
  at("wheelsB", PROOF.wheelsB[0], 0, 0, pr);
  at("breakPoint", PROOF.breakAt, 0, 0, pr);
  at("takeup", PROOF.takeup[0], -33, 0, pr);

  asShell(shells, 20);

  /* ───────────────────────────── every frame ───────────────────────────── */
  const M = new THREE.Matrix4();
  const hue = new THREE.Color();
  const SQ = SINTER.top - HOT;

  return {
    group, A,
    fog: (d) => 0.03 / Math.max(4000, d),
    update(S, time, px = 1500) {
      const fl = S.flow;

      /* 1 — the still */
      UL.uT.value = time;
      UL.uB.value = S.boil;
      bubbles.visible = S.boil > 0.01;
      bubbles.material.opacity = 0.75 * S.boil;
      if (bubbles.visible) {
        for (let i = 0; i < NB; i++) {
          const b = bSeed[i];
          const u = (b[2] + time * b[3] * 0.55) % 1;
          const s = b[4] * (0.5 + u) * S.boil;
          M.makeScale(s, s, s).setPosition(b[0] + Math.sin(time * 3 + i) * 1.2, 22 + u * (LEVEL - 24), b[1]);
          bubbles.setMatrixAt(i, M);
        }
        bubbles.instanceMatrix.needsUpdate = true;
      }
      dregMat.opacity = 0.22 + 0.7 * S.boil;
      vapA.set(S.vapour, time);
      vapB.set(S.vapour, time);

      /* 2 — the lathe */
      const ang = time * S.spin * 2.4;
      for (const s of spinners) s.rotation.x = ang;
      const R = ROD + 0.25 + (RM - ROD - 0.25) * clamp01(S.deposit);
      const k = R / RM;
      sootG.scale.set(1, k, k);
      sootG.visible = S.deposit > 0.005;
      US.uS.value = k;
      US.uDoped.value = S.doped;
      setA(filler, 1 - smooth(0, 0.6, S.doped));
      fillM.opacity = filler.material.opacity;
      fillM.transparent = fillM.opacity < 0.999;
      fillM.depthWrite = fillM.opacity > 0.6;
      const dpos = 9.4;
      dustG.visible = S.dust > 0.01 && R > dpos + 1;
      dustG.scale.set(1, 1 / Math.max(k, 0.05), 1 / Math.max(k, 0.05));
      dustG.position.y = dpos / Math.max(k, 0.05);
      dustCore.material.opacity = S.dust;
      dustHalo.material.opacity = S.dust;
      const travel = (LATHE.travel / 2) * Math.sin((time * Math.PI * 2) / 6);
      car.position.x = travel * smooth(0, 0.3, S.flame);
      const fk = S.flame * (1 + 0.07 * Math.sin(time * 23) + 0.05 * Math.sin(time * 37 + 1));
      flameG.visible = S.flame > 0.01;
      flameG.scale.set(S.flame, fk, S.flame);
      flameHalo.material.opacity = S.flame;
      sootStreaks.set(S.soot, time);
      grains.uniforms.uAmount.value = 0.9 * S.soot;
      grains.points.visible = S.soot > 0.01;
      grains.update(time, px, 1 / 30);
      impur.uniforms.uAmount.value = S.soot * S.mood;
      impur.points.visible = S.soot * S.mood > 0.01;
      impur.update(time, px, 1 / 30);

      /* 3 — the sintering furnace */
      const yb = SINTER.top - S.sink * SQ;
      sb.position.y = yb;
      const topY = yb + SL / 2 + 10;
      hang.position.y = topY + 40;
      hangRod.position.y = -20;
      hangRod.scale.y = 40;
      const fg = 0.25 + 0.75 * clamp01(Math.max(S.sink, S.chlorine));
      housing.userData.heat(0.45 * fg);
      elemMat.opacity = fg;
      sHalo.material.opacity = fg;
      const sn = clamp01(S.sinter);
      const front = -SL / 2 + sn * SL;
      white.visible = sn < 0.999;
      white.scale.y = Math.max(0.001, SL / 2 - front);
      white.position.y = (front + SL / 2) / 2;
      const cl = Math.max(0.001, front + SL / 2);
      for (const m of [clear, clearRim, sCore]) {
        m.visible = sn > 0.001;
        m.scale.y = cl;
        m.position.y = (-SL / 2 + front) / 2;
      }
      sCore.material.opacity = 0.55 + 0.45 * S.section;
      frontRing.position.y = front;
      setA(frontRing, smooth(0, 0.04, sn) * (1 - smooth(0.96, 1, sn)) * clamp01(S.sink * 2));
      capG.visible = sn > 0.02;
      setGlow(capCore.material, 0.5 + 1.3 * S.section);
      capCoreRing.material.opacity = S.section;
      capCoreRing.visible = S.section > 0.01;
      water.visible = S.water > 0.01;
      waterMat.opacity = S.water;
      if (water.visible) {
        const lift = (1 - S.water) * 30;
        for (let i = 0; i < NW; i++) {
          const [a, y] = wSeed[i];
          const rr = y < front ? RC * 0.6 : SINTER.body / 2 + 0.2;
          M.makeTranslation(Math.cos(a) * rr, y + lift, Math.sin(a) * rr);
          water.setMatrixAt(i, M);
        }
        water.instanceMatrix.needsUpdate = true;
      }
      bubbleG.visible = S.bubble > 0.01;
      bubbleG.children[0].material.opacity = S.bubble;
      bubbleG.children[1].material.opacity = S.bubble;
      chlorine.set(S.chlorine, time);

      /* 4 — the tower */
      const h = S.heat;
      tFurn.userData.heat(0.15 + 0.4 * h);
      boreMat.opacity = 0.45 * h;
      bore.visible = h > 0.01;
      tElem.opacity = h;
      fHalo.material.opacity = h;
      UH.uHeat.value = h;
      const ytop = TOWER.feed - S.feed * 120;
      feedCar.position.y = ytop + 10;
      for (const m of [pf, pfRim, pfCore]) {
        m.scale.y = ytop - NECK;
        m.position.y = (ytop + NECK) / 2;
      }
      // the drop: it forms, stretches, falls
      const dd = S.drop;
      const u1 = clamp01(dd / 0.3);
      const u2 = clamp01((dd - 0.3) / 0.4);
      const u3 = clamp01((dd - 0.7) / 0.3);
      let rad = 2.5 + 6.5 * u1;
      let sy = 1;
      let cy = TIP + 2 - rad * 0.9 * u1;
      if (dd > 0.3) {
        rad = 9 - 1.5 * u2;
        sy = 1 + 0.6 * u2;
        cy = TIP + 2 - 8.1 + (TIP - 40 - (TIP + 2 - 8.1)) * easeIO(u2);
      }
      if (dd > 0.7) {
        rad = 7.5;
        sy = 1.6 - 0.3 * u3;
        cy = TIP - 40 - 420 * u3 * u3;
      }
      dropG.visible = dd > 0.01 && dd < 0.995;
      dropG.position.y = cy;
      dropM.scale.set(rad, rad * sy, rad);
      dropCore.scale.set(rad, rad * sy, rad);
      dropHalo.scale.set(rad * 7, rad * 7, 1);
      dropA.position.y = cy;
      const thTop = TIP;
      const thBot = cy + rad * sy * 0.8;
      thread.visible = dd > 0.3 && dd < 0.995 && thTop - thBot > 0.5;
      thread.scale.set(1 - 0.4 * u3, Math.max(0.01, thTop - thBot), 1 - 0.4 * u3);
      thread.position.y = (thTop + thBot) / 2;
      // the fibre and its coats
      const dw = smooth(0.2, 0.8, S.draw);
      const drawn = dw > 0.01;
      const rA = 0.6 * (1 + 0.45 * Math.max(-1, Math.min(1, S.diam)));
      segA.scale.x = segA.scale.z = rA;
      bareMat.opacity = dw;
      for (const m of [segA, segB, segC, botBare]) m.visible = drawn;
      hotTip.visible = drawn && h > 0.01;
      const c1 = clamp01(S.coat);
      const c2 = clamp01(S.coat - 1);
      const rB = 0.6 + 0.65 * c1;
      const rC = rB + 0.5 * c2;
      segBc.visible = drawn && c1 > 0.01;
      segBc.scale.x = segBc.scale.z = rB;
      segCc.visible = drawn && c1 > 0.01;
      segCc.scale.x = segCc.scale.z = rC;
      softMat.opacity = coatMat.opacity = dw;
      softMat.transparent = coatMat.transparent = dw < 0.999;
      const g2 = 0.85 - 0.2 * c2;
      coatMat.color.setRGB(g2 * 0.99, g2, g2 * 0.97);
      botCoat.visible = drawn && S.coat > 1.5;
      botBare.visible = drawn && !botCoat.visible;
      strandLine.visible = marks.visible = drawn;
      strandLine.material.opacity = 0.5 * dw;
      marks.material.opacity = dw;
      marks.material.dashOffset = -((time * 240 * fl) % 60);
      // the gauge
      const ga = S.gauge;
      const bad = smooth(0.45, 0.55, Math.abs(S.diam));
      hue.copy(VEILLE).lerp(SIGNAL, bad);
      setGlow(beamMat, 1.9, hue);
      setGlow(markerMat, 1.6, hue);
      sheetMat.color.copy(hue).multiplyScalar(0.5);
      beamMat.opacity = ga;
      beamX.visible = beamZ.visible = ga > 0.01;
      sheetMat.opacity = 0.2 * ga;
      sheet.visible = ga > 0.01;
      sheet.rotation.y = 0.12 * Math.sin(time * 9);
      markerMat.opacity = ga;
      marker.visible = ga > 0.01;
      marker.position.x = 30 * Math.max(-1, Math.min(1, S.diam));
      // the cups
      resins[0].visible = c1 > 0.01;
      resins[1].visible = c2 > 0.01;
      // the UV tunnel: lit from the top unit down
      for (let i = 0; i < 4; i++) {
        const a = clamp01(S.uv * 4 - i);
        const u = uvUnits[i];
        u.tubeMat.opacity = a;
        for (const l of u.lamps) l.set(a);
        u.h.material.opacity = a;
        u.h.visible = a > 0.01;
      }
      // the wheels
      const wa = time * S.wind;
      pulley.rotation.z = -wa * 4;
      capstan.rotation.z = -wa * 2.3;
      spool.rotation.z = -wa * 1.4;
      spoolFlaw.material.opacity = 0.7 * S.flaw;
      spoolFlaw.visible = S.flaw > 0.01;

      /* 5 — the proof test */
      const T = S.tension;
      const broke = S.claque;
      UF.uT.value = time;
      UF.uTension.value = T;
      UF.uClaque.value = broke;
      UF.uPulse.value = S.pulse;
      UF.uFlow.value = fl;
      UF.uFlaw.value = S.flaw * (1 - smooth(0, 0.1, broke));
      for (const wh of wheels) {
        wh.w.rotation.z = wh.side * wa * 3.2;
        wh.w.position.y = wh.side * (WR + 1.2 - 1.1 * T);
      }
      rimMat.opacity = T * (1 - smooth(0, 0.2, broke));
      payout.rotation.z = -wa * 1.4;
      takeup.rotation.z = -wa * 1.4;
      flawH.material.opacity = S.flaw * (1 - smooth(0, 0.1, broke));
      flawG.visible = flawH.material.opacity > 0.01;
      const fla = smooth(0, 0.08, broke) * (1 - smooth(0.08, 0.35, broke));
      flash.material.opacity = fla;
      flash.visible = fla > 0.01;
      UE.uEcho.value = S.echo;
      echoM.visible = S.echo > 0.01 && S.echo < 1.995;
      const ef = smooth(0.7, 0.76, S.echo);
      echoFlaw.material.opacity = ef;
      echoFlaw.visible = ef > 0.01;
    },
  };
}
