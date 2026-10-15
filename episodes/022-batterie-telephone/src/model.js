// DOSSIER 022 — Batterie de téléphone : the system. A phone of no brand at all, lying flat, its back up, and what
// it opens on. Its root's origin is the centre of its underside; long axis x, charging port toward −x (plan.js).
//   · the phone — a sandwich: the screen's glass (underneath), a clear metal frame, a dark lacquered back with ONE
//     round lens; inside, a mid-plate, two small boards and their cans
//   · the battery — a flat pouch of satin foil, the clearest piece; at its −x end the PROTECTION BOARD: a bar of
//     circuit, two tabs to the pouch, a temperature probe, and a switch one SEES open (a blade that lifts, veille)
//   · in the pouch, the ROLL: the layers wound round z — their turns are drawn on its two flanks
//   · the TONGUE: the outer end of the winding laid out toward +x behind a small scroll that rolls away, its three
//     sheets fanned — from the bottom: copper (coated), THE FILM, aluminium (coated)
// Three sheets, three values, no hue: the coated copper is the darkest (a matt black coat, a margin of bare grey
// metal), the film the clearest (ink, translucent, matt), the coated aluminium in between (a clear bare margin).
// Light: SIGNAL is the heat (the glow in the pouch, the hot point, the crease) · VEILLE the system alive (the
// switch that has cut, the level, the film named) · INK the charger's current and the metal sheets named.
// Liberties taken to be read in one frame (docs/journal/022-model.md): the exploded view is a FAN — the battery and
// the back lean toward the camera as they rise, their centres where plan.js says; a protection switch is a
// transistor, not a blade; the roll has two turns and a half; the scroll at the tongue's tip is a figure of speech.
//   buildSystem() → { root, anchors, update(s, time, px) }
//   s = { bench, fade, temp, heat, charge, xray, explode, unroll, swell, dent, spot, level, levelSeen,
//         litCopper, litAlu, litFilm, litRoll, litBoard }
// The maquette of the pores is NOT here: pores.js builds it, world.js mounts it on the system.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glass, asShell, edgesOf, makePart, addMesh, setPartOpacity, anchor, box, cyl, plate, mergeGeometries } from "@kit/build3d.js";
import { PHONE, PORT, BATT, BOARD, OPEN, TONGUE, DENT } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.86, 0.62);
const PALE = VEILLE.clone().lerp(new THREE.Color(1, 1, 1), 0.55);
const H2 = (BRAND.H / 2).toFixed(1);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ramp = (x, a, b) => clamp01((x - a) / (b - a));
const smooth = (u) => u * u * (3 - 2 * u);
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// the kit's own: a part leaves fast, overshoots a little and settles
const settle = (u) => ease(u) + Math.sin(Math.PI * u) ** 2 * 0.045 * (u > 0.5 ? 1 : 0.25);
const glsl3 = (c) => `vec3(${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)})`;
const f = (x, n = 4) => Number(x).toFixed(n);

/* ─────────────────────────────────────────────────────────── where everything is */

const T = PHONE.t;
const BACK = { t: 0.11, y: T - 0.055 }; //   the back: its thickness, its centre (it turns about it)
const [BX, BY] = BATT.at; //                 the battery's centre: the origin of everything that rises with it
const HW = BATT.w / 2;
const HT = BATT.t / 2;
const HD = BATT.d / 2;
const ROLL = { w: BATT.w - 0.5, t: BATT.t - 0.08, d: BATT.d - 0.5, pitch: 0.084 };
/** The exploded view is a fan: how far the battery and the back lean toward the camera (about x), their centres where plan.js says. */
const LEAN = { cell: 20 * DEG, back: 24 * DEG, away: 1.3 }; // …and the back steps `away` cm from the camera
/** The tongue, in its own frame (its origin: where it leaves the roll; x along it, y up). */
const TG = {
  x: HW - 0.3, //        where it leaves the battery (from its centre)
  len: TONGUE.len, //    laid out flat at `unroll` 1
  tail: 0.6, //          what stays curled at each sheet's tip
  y0: -0.2, //           it leaves from under the roll's round end
  fan: TONGUE.fan, //    the sheets, apart in y at the tip
  stag: 1.1, //         …and staggered in z: copper toward the camera, aluminium away — a hand of cards
  pitch: 0.075, //       the scroll: how much its radius gains a turn
  gap: 0.025, //         …and from one sheet to the next in it
  ri2: 0.02, //          its inner radius, squared
  film: 5.3, //          the film's width (z)
  metal: 4.7, //         the metal sheets'
  margin: 0.62, //       their bare margin, on the camera's side; and at the tip
};
const LT = TG.len + TG.tail;
/** The crease of a damaged pouch: a short fold on its top face, about DENT (battery frame, x z). */
const FOLD = [[DENT[0] - BX - 0.75, DENT[2] - 0.55], [DENT[0] - BX + 0.7, DENT[2] + 0.5]];

/* ─────────────────────────────────────────────────────────── geometry */

/** A slab's outline: w along x, d along y (laid flat: z), corners of radius r. */
function slabShape(w, d, r) {
  const s = new THREE.Shape();
  const x = w / 2;
  const y = d / 2;
  s.moveTo(-x + r, -y);
  s.lineTo(x - r, -y);
  s.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x, y - r);
  s.absarc(x - r, y - r, r, 0, Math.PI / 2, false);
  s.lineTo(-x + r, y);
  s.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-x, -y + r);
  s.absarc(-x + r, -y + r, r, Math.PI, 1.5 * Math.PI, false);
  return s;
}
/** A plate laid flat: its outline in x z, from y0 up. */
const flat = (geo, y0 = 0) => geo.rotateX(-Math.PI / 2).translate(0, y0, 0);
const at = (geo, x, y, z) => geo.translate(x, y, z);

/**
 * A box whose every edge is a full round of radius r, finely meshed: its faces can then be bulged or creased by the
 * vertex shader. The `k` outer rows of each face are spent on the round.
 */
function pillowBox(w, h, d, r, seg = [44, 9, 30], k = 4) {
  const geo = new THREE.BoxGeometry(w, h, d, ...seg);
  const half = [w / 2, h / 2, d / 2];
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const inner = [0, 0, 0];
  const out = [0, 0, 0];
  for (let i = 0; i < pos.count; i++) {
    for (let a = 0; a < 3; a++) {
      const H = half[a];
      const N = seg[a];
      const j = Math.round(((pos.getComponent(i, a) + H) / (2 * H)) * N);
      const flatHalf = H - r;
      let c;
      if (j <= k) c = -flatHalf - r * Math.tan(((k - j) / k) * (Math.PI / 4));
      else if (j >= N - k) c = flatHalf + r * Math.tan(((j - (N - k)) / k) * (Math.PI / 4));
      else c = -flatHalf + ((j - k) / (N - 2 * k)) * 2 * flatHalf;
      inner[a] = Math.min(flatHalf, Math.max(-flatHalf, c));
      out[a] = c - inner[a];
    }
    const len = Math.hypot(out[0], out[1], out[2]) || 1;
    pos.setXYZ(i, inner[0] + (out[0] / len) * r, inner[1] + (out[1] / len) * r, inner[2] + (out[2] / len) * r);
    nor.setXYZ(i, out[0] / len, out[1] / len, out[2] / len);
  }
  const e = 2 * r * (1 - Math.SQRT1_2);
  geo.userData.edges = new THREE.BoxGeometry(w - e, h - e, d - e); // one line on the crest of each round
  return geo;
}

/** The roll's section: a flat turn, round at both ends (x y), extruded along z and centred. */
function rollGeometry() {
  const a = ROLL.w / 2 - ROLL.t / 2;
  const r = ROLL.t / 2;
  const pts = [];
  for (let i = 0; i <= 14; i++) pts.push([a + r * Math.sin((i / 14) * Math.PI), -r * Math.cos((i / 14) * Math.PI)]);
  for (let i = 0; i <= 14; i++) pts.push([-a - r * Math.sin((i / 14) * Math.PI), r * Math.cos((i / 14) * Math.PI)]);
  return plate(pts, ROLL.d, { bevel: 0.02, round: 1 }).translate(0, 0, -ROLL.d / 2);
}

/* ─────────────────────────────────────────────────────────── matter that is drawn */

/**
 * A lit solid of the house whose shape, colour and light also depend on where the fragment stands in the part's own
 * frame (`oP`, `oN`). `key`: a name of its own — two materials sharing this function must not share a program.
 * `normal` runs after the object's normal is read (it may rewrite `objectNormal`), `warp` after its position (`transformed`).
 */
function patterned(mat, key, uniforms, { vdecl = "", normal = "", warp = "", decl = "", colour = "", matter = "", light = "" }) {
  mat.userData.U = uniforms;
  mat.customProgramCacheKey = () => key;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\nvarying vec3 oP; varying vec3 oN; ${vdecl}`)
      .replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>\noN = normal; ${normal}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\noP = position; ${warp}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 oP; varying vec3 oN; ${decl}`)
      .replace("#include <color_fragment>", `#include <color_fragment>\n{ ${colour} }`)
      .replace("#include <metalnessmap_fragment>", `#include <metalnessmap_fragment>\n{ ${matter} }`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n{ ${light} }`);
  };
  return mat;
}

/** The pouch swells (a pillow: more on top than underneath) and creases (a fold pressed into its top face). */
const FOLD_FN = /* glsl */ `
  float foldDist(vec2 p) {
    vec2 a = vec2(${f(FOLD[0][0])}, ${f(FOLD[0][1])});
    vec2 ba = vec2(${f(FOLD[1][0] - FOLD[0][0])}, ${f(FOLD[1][1] - FOLD[0][1])});
    vec2 pa = p - a;
    return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
  }`;
const POUCH_FN = /* glsl */ `
  uniform float uSwell, uDent;
  ${FOLD_FN}
  vec3 pouchWarp(vec3 p, vec3 n) {
    vec2 q = clamp(p.xz / vec2(${f(HW)}, ${f(HD)}), -1.0, 1.0);
    float bump = (1.0 - q.x * q.x) * (1.0 - q.y * q.y);
    float dy = uSwell * bump * (0.13 + 0.21 * p.y / ${f(HT)});
    float d = foldDist(p.xz);
    dy -= uDent * 0.085 * exp(-d * d / 0.045) * max(n.y, 0.0);
    return p + vec3(0.0, dy, 0.0);
  }`;
const POUCH = {
  vdecl: POUCH_FN,
  normal: /* glsl */ `
    float pw0 = pouchWarp(position, normal).y;
    float pwx = pouchWarp(position + vec3(0.06, 0.0, 0.0), normal).y;
    float pwz = pouchWarp(position + vec3(0.0, 0.0, 0.06), normal).y;
    objectNormal = normalize(normal - vec3(pwx - pw0, 0.0, pwz - pw0) * (normal.y / 0.06));`,
  warp: /* glsl */ `transformed = pouchWarp(position, normal);`,
  decl: /* glsl */ `uniform float uHeat, uDent; float gFold;
    ${FOLD_FN}`,
  colour: /* glsl */ `
    gFold = foldDist(oP.xz);
    float top = smoothstep(0.2, 0.7, oN.y);
    diffuseColor.rgb *= 1.0 - 0.55 * uDent * top * (1.0 - smoothstep(0.0, 0.24, gFold));
    diffuseColor.rgb *= mix(vec3(1.0), vec3(1.0, 0.6, 0.48), 0.75 * uHeat);`,
  light: /* glsl */ `
    vec2 hq = (oP.xz - vec2(0.5, -0.2)) / vec2(3.5, 2.0);
    float heart = exp(-dot(hq, hq));
    totalEmissiveRadiance += ${glsl3(SIGNAL)} * (uHeat * (0.12 + 0.85 * heart));
    float fw = fwidth(gFold) * 1.5 + 0.024;
    totalEmissiveRadiance += ${glsl3(SIGNAL)} * (1.8 * uDent * smoothstep(0.2, 0.7, oN.y) * (1.0 - smoothstep(0.0, fw, gFold)));`,
};

/** The back takes the battery's warmth where it lies over it: the glow one sees on a phone that is closed. */
const WARM = {
  decl: /* glsl */ `uniform float uHeat;`,
  light: /* glsl */ `
    vec2 hq = (oP.xz - vec2(${f(BX + 0.3)}, -0.1)) / vec2(4.3, 2.5);
    totalEmissiveRadiance += ${glsl3(SIGNAL)} * (uHeat * 0.6 * exp(-dot(hq, hq)));`,
};

/** The roll: wrapped in its film; on its two flanks, the turns — copper, film, aluminium, film — a spiral. */
const TURNS = {
  decl: /* glsl */ `uniform float uLit, uHeat, uDent; float gFlank; float gFilm; float gFold;
    ${FOLD_FN}`,
  colour: /* glsl */ `
    float ax = max(abs(oP.x) - ${f(ROLL.w / 2 - ROLL.t / 2)}, 0.0);
    float dd = length(vec2(ax, oP.y));
    float ph = dd / ${f(ROLL.pitch)} + atan(oP.y, oP.x) / 6.28319 + 0.1;
    float w = clamp(fwidth(dd) * ${f(1.3 / ROLL.pitch)}, 0.004, 0.5);
    float fr = fract(ph);
    float cu = smoothstep(0.0, w, fr) * (1.0 - smoothstep(0.28, 0.28 + w, fr));
    float al = smoothstep(0.5, 0.5 + w, fr) * (1.0 - smoothstep(0.78, 0.78 + w, fr));
    vec3 lay = mix(mix(vec3(0.86, 0.84, 0.79), vec3(0.05, 0.055, 0.06), cu), vec3(0.34, 0.36, 0.38), al);
    lay = mix(lay, vec3(0.48, 0.47, 0.45), smoothstep(0.2, 0.5, w));
    gFlank = smoothstep(0.55, 0.85, abs(oN.z));
    gFold = foldDist(oP.xz);
    diffuseColor.rgb *= 1.0 - 0.5 * uDent * smoothstep(0.2, 0.7, oN.y) * (1.0 - smoothstep(0.0, 0.24, gFold));
    gFilm = (1.0 - cu) * (1.0 - al);
    diffuseColor.rgb = mix(diffuseColor.rgb, lay, gFlank) * mix(vec3(1.0), vec3(1.0, 0.5, 0.36), 0.85 * uHeat);`,
  light: /* glsl */ `vec2 hq = (oP.xz - vec2(0.5, -0.2)) / vec2(3.5, 2.0);
    totalEmissiveRadiance += ${glsl3(SIGNAL)} * (uHeat * (0.07 + 0.5 * exp(-dot(hq, hq))));
    totalEmissiveRadiance += ${glsl3(SIGNAL)} * (1.8 * uDent * smoothstep(0.2, 0.7, oN.y) * (1.0 - smoothstep(0.0, fwidth(gFold) * 1.5 + 0.024, gFold)));
    totalEmissiveRadiance += ${glsl3(VEILLE)} * (uLit * gFlank * (0.1 + 0.85 * gFilm)) + ${glsl3(INK)} * (0.05 * (1.0 - gFlank) + 0.1 * gFlank * gFilm);`,
};

/**
 * A sheet of the tongue. Its mesh is a flat strip, x its length; the shader lays it out: flat (and fanned) up to
 * `uOut`, and beyond, wound into the scroll that rolls away — where the three sheets lie tight against one another.
 * `uJoin` 1: they come back together before the scroll · 0: each ends free, on a curl of its own.
 */
const SHEET_V = {
  vdecl: /* glsl */ `uniform float uOut, uJoin, uSig;`,
  normal: /* glsl */ `
    float ts = position.x;
    float tsf = min(ts, uOut);
    float tq = 1.0 - clamp(tsf / ${f(TG.len)}, 0.0, 1.0);
    float tg = 1.0 - tq * tq;
    float tj = 1.0 - uJoin * smoothstep(uOut - 2.6, uOut - 0.3, tsf);
    float tsep = uSig * tg * tj;
    float tslope = (2.0 * tq / ${f(TG.len)}) * (${f(TG.fan)} * uSig * tj - (${f(TG.y0)}));
    vec2 tT = normalize(vec2(1.0, tslope));
    vec2 tN = vec2(-tT.y, tT.x);
    vec3 tP = vec3(tsf, ${f(TG.y0)} * (1.0 - tg) + uSig * ${f(TG.gap)} + ${f(TG.fan)} * tsep, position.z - ${f(TG.stag)} * tsep);
    float tR0 = sqrt(${f(TG.ri2)} + max(${f(LT)} - uOut, 0.0) * ${f(TG.pitch / Math.PI, 5)});
    float tr = sqrt(max(tR0 * tR0 - max(ts - uOut, 0.0) * ${f(TG.pitch / Math.PI, 5)}, ${f(TG.ri2 * 0.5)}));
    float tth = (tR0 - tr) * ${f((2 * Math.PI) / TG.pitch)};
    vec2 tn = cos(tth) * tN - sin(tth) * tT;
    vec2 tt = cos(tth) * tT + sin(tth) * tN;
    vec2 txy = tP.xy + (tR0 - uSig * ${f(TG.gap)}) * tN - (tr - uSig * ${f(TG.gap)} - position.y) * tn;
    objectNormal = vec3(normal.x * tt + normal.y * tn, normal.z);`,
  warp: /* glsl */ `transformed = vec3(txy, tP.z);`,
};
const sheetLook = (half, coat) => ({
  ...SHEET_V,
  decl: /* glsl */ `uniform float uLit; float gBare; float gEdge;`,
  colour: /* glsl */ `
    float e = fwidth(oP.z) * 1.2 + 0.004;
    gBare = ${coat ? `max(smoothstep(${f(half - TG.margin)} - e, ${f(half - TG.margin)} + e, oP.z), smoothstep(${f(TG.len - TG.margin)} - e, ${f(TG.len - TG.margin)} + e, oP.x))` : "1.0"};
    gEdge = 1.0 - smoothstep(0.0, fwidth(oP.z) * 1.8 + 0.003, ${f(half)} - abs(oP.z));
    ${coat ? `diffuseColor.rgb = mix(${glsl3(coat)}, diffuseColor.rgb, gBare);` : `diffuseColor.rgb *= mix(vec3(1.0), vec3(0.5, 1.0, 0.78), 0.85 * uLit);`}`,
  matter: coat ? /* glsl */ `roughnessFactor = mix(0.97, roughnessFactor, gBare); metalnessFactor *= gBare;` : "",
});

/* ─────────────────────────────────────────────────────────── light that has a place */

const lightMaterial = (uniforms, vertexShader, fragmentShader, o = {}) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms, vertexShader, fragmentShader, ...o });
const lightMesh = (geometry, material, order = 4) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
};

/**
 * A ball of light with no edge, always facing the eye: a small hot heart, a soft body, a long tail. `uRadius` cm
 * (where the tail ends), never under `uMinPx` pixels. `through`: it shows through whatever stands before it — the
 * warmth of a battery seen through a closed phone, through a pillow.
 */
function makeBall(heart, hue, through = false) {
  const mesh = lightMesh(
    new THREE.PlaneGeometry(2, 2),
    lightMaterial(
      { uHeart: { value: heart.clone() }, uHue: { value: hue.clone() }, uRadius: { value: 1 }, uMinPx: { value: 0 }, uAmount: { value: 0 } },
      /* glsl */ `
      uniform float uRadius, uMinPx; varying vec2 vUv;
      void main() {
        vUv = position.xy;
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float r = max(uRadius, uMinPx * max(1.0, -c.z) / (projectionMatrix[1][1] * ${H2}));
        c.xy += position.xy * r;
        gl_Position = projectionMatrix * c;
      }`,
      /* glsl */ `
      uniform vec3 uHeart, uHue; uniform float uAmount; varying vec2 vUv;
      void main() {
        float r2 = dot(vUv, vUv);
        float core = exp(-r2 / 0.012);
        float body = 0.42 * exp(-r2 / 0.09);
        float tail = 0.15 / (1.0 + r2 / 0.02) * (1.0 - smoothstep(0.45, 1.0, sqrt(r2)));
        gl_FragColor = vec4((uHeart * (core * 2.4) + uHue * (body + tail)) * uAmount, 1.0);
      }`,
      { depthTest: !through },
    ),
    8,
  );
  mesh.visible = false;
  return mesh;
}
const shine = (ball, amount, radius, minPx = 0) => {
  ball.visible = amount > 0.004;
  ball.material.uniforms.uAmount.value = amount;
  ball.material.uniforms.uRadius.value = radius;
  ball.material.uniforms.uMinPx.value = minPx;
};

const BARS = /* glsl */ `
  // bars of light, their ends softened over what a pixel covers — and melted into their mean once too small to count
  float bars(float x, float duty) {
    float w = clamp(fwidth(x) * 1.5, 0.004, 0.5);
    float q = fract(x);
    float b = smoothstep(0.0, w, q) * (1.0 - smoothstep(duty, duty + w, q));
    return mix(b, duty, smoothstep(0.12, 0.4, w));
  }`;

/* ─────────────────────────────────────────────────────────── the system */

export function buildSystem() {
  const root = new THREE.Group();
  const grp = (parent = root) => {
    const g = new THREE.Group();
    parent.add(g);
    return g;
  };
  const partIn = (parent, name) => {
    const part = makePart(name);
    parent.add(part);
    return part;
  };
  const shellGlass = (o = {}) => glass(BRAND.ink, { base: 0.008, rim: 0.26, power: 2.6, edge: 0.45, spec: 0.55, through: 0.28, ...o });
  /** A solid piece's twin in glass, for the X-ray: only its nearest surface lights up. What is inside goes first (`order`). */
  const ghostOf = (parent, geo, mat, order) => {
    const mesh = new THREE.Mesh(geo, mat);
    const lines = edgesOf(geo, { color: BRAND.ink, width: 2, opacity: 0.45 });
    mesh.add(lines);
    mesh.visible = false;
    parent.add(mesh);
    asShell(mesh, order);
    return { mesh, mat, lines: lines.material };
  };
  const see = (ghost, amount) => {
    ghost.mesh.visible = amount > 0.004;
    ghost.mat.uniforms.uAmount.value = amount;
    ghost.lines.opacity = 0.45 * amount;
  };

  /* ══ THE BODY: the screen's glass, the frame, and what is screwed inside. It stays down ══ */
  const body = partIn(root, "body");
  const screenGeo = flat(plate(slabShape(PHONE.w, PHONE.d, PHONE.r), 0.08, { bevel: 0.03, round: 2 }), 0);
  const ring = slabShape(PHONE.w, PHONE.d, PHONE.r);
  ring.holes.push(slabShape(PHONE.w - 0.5, PHONE.d - 0.5, PHONE.r - 0.25));
  const frameGeo = flat(plate(ring, T - BACK.t - 0.08, { bevel: 0.05, round: 2 }), 0.08);
  const M = {
    screen: solid(0x15181b, { rough: 0.25, coat: 0.8, coatRough: 0.15 }),
    frame: solid(0x9ba2a8, { rough: 0.55, metal: 0.3 }),
    plate: solid(0x41474d, { rough: 1 }), // (a flat face lying under a grazing camera mirrors the rim light: matt)
    card: solid(0x1f2428, { rough: 0.92 }),
    can: solid(0x8a9197, { rough: 0.42, metal: 0.4 }),
    dark: solid(0x2b3035, { rough: 0.75 }),
    slot: solid(0x0b0d0f, { rough: 0.5 }),
  };
  addMesh(body, screenGeo, M.screen, { edgeOpacity: 0.3 });
  addMesh(body, frameGeo, M.frame, { edgeOpacity: 0.55 });
  addMesh(body, flat(plate(slabShape(PHONE.w - 0.5, PHONE.d - 0.5, PHONE.r - 0.25), 0.05, { bevel: 0.01, round: 1 }), 0.08), M.plate, { edges: false });
  // the two small boards, at the top (+x) and at the bottom (−x) of the phone, and the bay the battery lies in
  addMesh(body, mergeGeometries([at(box(1.45, 0.05, 5.8, 0.02), 6.5, 0.155, 0), at(box(2.0, 0.05, 5.8, 0.02), -6.25, 0.155, 0)]), M.card, { edgeOpacity: 0.3 });
  addMesh(body, mergeGeometries([
    at(box(1.0, 0.22, 1.9, 0.04), 6.5, 0.29, -1.8), at(box(0.9, 0.18, 1.3, 0.04), 6.45, 0.27, 1.95), at(box(1.05, 0.3, 1.05, 0.06), 6.45, 0.33, 0),
    at(box(0.7, 0.3, 1.05, 0.05), -6.95, PORT[1], 0), at(box(1.1, 0.4, 1.5, 0.06), -6.2, 0.38, 1.9),
  ]), M.can, { edgeOpacity: 0.5 });
  addMesh(body, mergeGeometries([at(box(1.25, 0.42, 1.7, 0.08), -6.2, 0.39, -1.95), at(box(BATT.w + 0.3, 0.1, 0.08, 0.02), BX, 0.19, 3.02), at(box(BATT.w + 0.3, 0.1, 0.08, 0.02), BX, 0.19, -3.02)]), M.dark, { edgeOpacity: 0.4 });
  addMesh(body, cyl(0.4, 0.3, 0.03, 40), M.card, { pos: [6.45, 0.56, 0], edgeOpacity: 0.5 });
  // outside: the port's slot, two keys on the flank
  addMesh(body, at(box(0.06, 0.26, 0.92, 0.03), -PHONE.w / 2 + 0.01, PORT[1], 0), M.slot, { edgeOpacity: 0.5 });
  addMesh(body, mergeGeometries([at(box(1.5, 0.2, 0.1, 0.04), 2.7, 0.42, PHONE.d / 2 + 0.01), at(box(0.8, 0.2, 0.1, 0.04), 4.6, 0.42, PHONE.d / 2 + 0.01)]), M.frame, { edgeOpacity: 0.5 });
  const bodyGhost = ghostOf(root, mergeGeometries([screenGeo, frameGeo]), shellGlass(), 20);

  /* ══ THE BACK: a dark lacquered plate and its one lens. It lifts, and leans toward the camera ══ */
  const backG = grp();
  const back = partIn(backG, "back");
  const backGeo = flat(plate(slabShape(PHONE.w, PHONE.d, PHONE.r), BACK.t, { bevel: 0.045, round: 3 }), -BACK.t / 2);
  const WU = { uHeat: { value: 0 } };
  const backMat = patterned(solid(0x2a2f35, { rough: 0.62, coat: 0.2, coatRough: 0.55 }), "022-back", WU, WARM);
  const backMesh = addMesh(back, backGeo, backMat, { edgeOpacity: 0.5 });
  back.userData.part.meshes.length = 0; // its shadow is this file's: lifted, the back must not put the battery in the dark
  addMesh(back, cyl(0.52, 0.07, 0.025, 48), M.frame.clone(), { pos: [6.45, BACK.t / 2 + 0.03, 0], edgeOpacity: 0.55 });
  addMesh(back, cyl(0.38, 0.02, 0.008, 40), solid(0x07090a, { rough: 0.3, coat: 0.5, coatRough: 0.3 }), { pos: [6.45, BACK.t / 2 + 0.072, 0], edges: false });
  const backGhost = ghostOf(backG, backGeo, shellGlass(), 20);

  /* ══ THE BATTERY and all that rises with it: its frame is the battery's centre ══ */
  const cellG = grp();
  cellG.position.set(BX, BY, 0);

  // the pouch: satin foil, the clearest piece of the phone. It warms, it swells, it creases
  const pouch = partIn(cellG, "pouch");
  const pouchGeo = pillowBox(BATT.w, BATT.t, BATT.d, 0.2);
  const PU = { uSwell: { value: 0 }, uDent: { value: 0 }, uHeat: { value: 0 } };
  const pouchMat = patterned(solid(0xb3babf, { rough: 0.62, metal: 0.25 }), "022-pouch", PU, POUCH);
  const pouchMesh = addMesh(pouch, pouchGeo, pouchMat, { edgeOpacity: 0.4 });
  pouchMesh.castShadow = true;
  const pouchGlass = shellGlass({ rim: 0.3, edge: 0.5, through: 0.3 });
  pouchGlass.vertexShader = POUCH_FN + pouchGlass.vertexShader.replace("vec4(position, 1.0)", "vec4(pouchWarp(position, normal), 1.0)");
  pouchGlass.uniforms.uSwell = PU.uSwell;
  pouchGlass.uniforms.uDent = PU.uDent;
  const pouchGhost = ghostOf(cellG, pouchGeo, pouchGlass, 10);

  // the roll in it: the layers wound round z
  const roll = partIn(cellG, "roll");
  const RU = { uLit: { value: 0 }, uHeat: { value: 0 }, uDent: PU.uDent };
  addMesh(roll, rollGeometry(), patterned(solid(0xcbc7bc, { rough: 0.9 }), "022-roll", RU, TURNS), { edgeOpacity: 0.3, edgeColor: 0x40454a });

  // the level: a veille column lying in the pouch, from the board's end; its top (or its bottom) turns signal
  const LU = { uSwell: PU.uSwell, uDent: PU.uDent, uLevel: { value: 0.6 }, uAmount: { value: 0 }, uTime: { value: 0 } };
  const gauge = lightMesh(
    pouchGeo,
    lightMaterial(
      LU,
      /* glsl */ `${POUCH_FN}
      varying vec3 vP; varying vec3 vO;
      void main() {
        vP = position; vO = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pouchWarp(position, normal) * vec3(1.0, 1.06, 1.0) + normal * 0.012, 1.0);
      }`,
      /* glsl */ `
      uniform float uLevel, uAmount, uTime; varying vec3 vP; varying vec3 vO;
      void main() {
        float u = (vP.x + ${f(HW - 0.3)}) / ${f(2 * HW - 0.6)};
        float inside = smoothstep(0.0, 0.03, u) * (1.0 - smoothstep(0.97, 1.0, u)) * (1.0 - smoothstep(${f(HD - 0.42)}, ${f(HD - 0.28)}, abs(vP.z))) * smoothstep(-0.3, 0.3, vO.y);
        float fill = 1.0 - smoothstep(uLevel - 0.004, uLevel + 0.004, u);
        float hd = (u - uLevel) / 0.014;
        float head = exp(-hd * hd);
        float breath = 0.72 + 0.28 * sin(uTime * 2.2);
        float over = smoothstep(0.95, 0.97, uLevel) * smoothstep(0.86, 0.89, u);
        float under = (1.0 - smoothstep(0.04, 0.06, uLevel)) * (1.0 - smoothstep(0.1, 0.13, u));
        vec3 col = mix(${glsl3(VEILLE)} * (0.3 * fill + 0.95 * head), ${glsl3(SIGNAL)} * ((0.8 * fill + 1.1 * head) * breath), over);
        col += ${glsl3(SIGNAL)} * (0.85 * breath * under);
        gl_FragColor = vec4(col * (inside * uAmount), 1.0);
      }`,
    ),
    6,
  );
  gauge.visible = false;
  cellG.add(gauge);

  // the heat: a light that has a place, in the pouch — it shows through a closed phone, through a pillow
  const heatBall = makeBall(HOT, SIGNAL, true);
  heatBall.position.set(0.5, 0, -0.2);
  cellG.add(heatBall);
  // the hot point, where the pouch is damaged
  const spotBall = makeBall(new THREE.Color(1, 0.93, 0.8), SIGNAL, true);
  spotBall.position.set(DENT[0] - BX, 0.05, DENT[2]);
  cellG.add(spotBall);

  /* ── the protection board, at the pouch's −x end: a bar of circuit, two tabs, a probe — and a switch ── */
  const board = partIn(cellG, "board");
  const QX = BOARD.at[0] - BX; // its centre, from the battery's
  const B = {
    card: solid(0x20262a, { rough: 0.55 }),
    chip: solid(0x0f1214, { rough: 0.4, coat: 0.3 }),
    tab: solid(0xc6ccd0, { rough: 0.3, metal: 0.5 }),
    pad: solid(0x9aa1a6, { rough: 0.35, metal: 0.45 }),
    probe: solid(0xbfc5c9, { rough: 0.4 }),
    blade: solid(0xd3d8db, { rough: 0.28, metal: 0.5 }),
  };
  const cardTop = -BOARD.t / 2 + 0.12;
  addMesh(board, at(box(BOARD.w, 0.12, BOARD.d, 0.03), QX, -BOARD.t / 2 + 0.06, 0), B.card, { edgeOpacity: 0.6 });
  addMesh(board, mergeGeometries([at(box(0.5, 0.14, 0.8, 0.03), QX, cardTop + 0.07, -1.55), at(box(0.3, 0.09, 0.3, 0.02), QX + 0.1, cardTop + 0.045, -0.75), at(box(0.22, 0.08, 0.36, 0.02), QX - 0.2, cardTop + 0.04, -2.2)]), B.chip, { edgeOpacity: 0.45 });
  // the tabs: from the card to the pouch
  addMesh(board, mergeGeometries([at(box(0.8, 0.035, 0.55, 0.012), QX + 0.5, cardTop + 0.02, 2.1), at(box(0.8, 0.035, 0.55, 0.012), QX + 0.5, cardTop + 0.02, -0.1), at(box(0.34, 0.06, BATT.d - 0.5, 0.02), -HW - 0.1, cardTop + 0.0, 0)]), B.tab, { edgeOpacity: 0.5 });
  // the probe: a bead against the pouch, on its lead
  addMesh(board, new THREE.SphereGeometry(0.11, 20, 14), B.probe, { pos: [-HW + 0.05, cardTop + 0.1, -1.1], edges: false });
  addMesh(board, at(box(0.5, 0.03, 0.05, 0.01), QX + 0.3, cardTop + 0.05, -1.1), B.probe, { edges: false });
  // the switch: two posts, and a blade hinged on one of them — it lies across, or lifts
  const SW = { z0: 0.35, len: 1.45 };
  addMesh(board, mergeGeometries([at(box(0.34, 0.1, 0.3, 0.03), QX - 0.12, cardTop + 0.05, SW.z0), at(box(0.34, 0.07, 0.3, 0.03), QX - 0.12, cardTop + 0.035, SW.z0 + SW.len)]), B.pad, { edgeOpacity: 0.5 });
  const bladeG = grp(cellG);
  bladeG.position.set(QX - 0.12, cardTop + 0.1, SW.z0);
  const blade = partIn(bladeG, "blade");
  addMesh(blade, at(box(0.24, 0.07, SW.len + 0.2, 0.025), 0, 0.035, SW.len / 2), B.blade, { edgeOpacity: 0.7 });
  const cutBall = makeBall(PALE, VEILLE);
  cutBall.position.set(QX - 0.12, cardTop + 0.25, SW.z0 + SW.len);
  cellG.add(cutBall);

  /* ── the charger's current, from the port to the board: a ribbon of light that follows the battery up ── */
  const FU = { uA: { value: new THREE.Vector3(PORT[0] + 0.75, PORT[1], 0) }, uB: { value: new THREE.Vector3() }, uSlack: { value: 0.9 }, uLen: { value: 2 }, uFlow: { value: 1 }, uAmount: { value: 1 }, uTime: { value: 0 } };
  const flow = lightMesh(
    new THREE.PlaneGeometry(1, 0.44, 56, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0),
    lightMaterial(
      FU,
      /* glsl */ `
      uniform vec3 uA, uB; uniform float uSlack; varying float vU; varying float vV;
      void main() {
        float u = position.x;
        float k = 1.0 - u;
        vec3 c0 = uA + vec3(uSlack, 0.0, 0.0);
        vec3 c1 = uB - vec3(uSlack, 0.0, 0.0);
        vec3 p = k * k * k * uA + 3.0 * k * k * u * c0 + 3.0 * k * u * u * c1 + u * u * u * uB;
        p.z += position.z;
        vU = u; vV = position.z / 0.22;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
      /* glsl */ `${BARS}
      uniform float uLen, uFlow, uAmount, uTime; varying float vU; varying float vV;
      void main() {
        float body = 1.0 - smoothstep(0.55, 1.0, abs(vV));
        float dash = bars(vU * uLen / 0.5 - uTime * 1.6, 0.5);
        gl_FragColor = vec4(${glsl3(INK)} * ((0.08 + 0.9 * dash * uFlow) * body * uAmount), 1.0);
      }`,
      { side: THREE.DoubleSide },
    ),
    5,
  );
  root.add(flow);

  /* ══ THE TONGUE: three sheets off the roll's +x end ══ */
  const tongueG = grp(cellG);
  tongueG.position.set(TG.x, 0, 0);
  const tongue = partIn(tongueG, "tongue");
  const TU = { uOut: { value: 0 }, uJoin: { value: 1 } };
  const strip = (width, thick) => (thick ? new THREE.BoxGeometry(LT, thick, width, 240, 1, 1) : new THREE.PlaneGeometry(LT, width, 240, 1).rotateX(-Math.PI / 2)).translate(LT / 2, 0, 0);
  const sheet = (name, sig, geo, mat, look, order) => {
    const U = { ...TU, uSig: { value: sig }, uLit: { value: 0 } };
    patterned(mat, `022-${name}`, U, look);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.receiveShadow = true;
    mesh.renderOrder = order;
    tongue.userData.part.mats.add(mat); // (not through addMesh: the kit's edge lines and shadows would not follow the shader)
    tongue.add(mesh);
    return U;
  };
  const copperLook = sheetLook(TG.metal / 2, new THREE.Color(0.085, 0.09, 0.095));
  copperLook.light = /* glsl */ `totalEmissiveRadiance += ${glsl3(INK)} * (0.32 * gEdge + uLit * (0.05 + 0.2 * gBare + 0.4 * gEdge));`;
  const aluLook = sheetLook(TG.metal / 2, new THREE.Color(0.19, 0.2, 0.212));
  aluLook.light = copperLook.light;
  const filmLook = sheetLook(TG.film / 2, null);
  filmLook.light = /* glsl */ `totalEmissiveRadiance += ${glsl3(INK)} * (0.06 + 0.3 * gEdge) + ${glsl3(VEILLE)} * (uLit * (0.28 + 0.6 * gEdge));`;
  const CU = sheet("copper", -1, strip(TG.metal, 0.02), solid(0x8d9297, { rough: 0.36, metal: 0.5 }), copperLook, 0);
  const AU = sheet("alu", 1, strip(TG.metal, 0.02), solid(0xd2d7da, { rough: 0.3, metal: 0.5 }), aluLook, 0);
  const filmMat = solid(0xdedacf, { rough: 0.92, opacity: 0.76, double: true });
  filmMat.depthWrite = filmMat.userData.depthWrite = false;
  const FI = sheet("film", 0, strip(TG.film, 0), filmMat, filmLook, 5);

  /* ══ anchors: what the acts hang their labels on ══ */
  const anchors = {
    phone: anchor(root, 0, T, 0),
    port: anchor(root, ...PORT),
    battery: anchor(cellG, 0, 0, 0),
    board: anchor(cellG, QX, 0, 0),
    dent: anchor(cellG, DENT[0] - BX, HT, DENT[2]),
    copper: anchor(tongueG, 0, 0, 0),
    film: anchor(tongueG, 0, 0, 0),
    alu: anchor(tongueG, 0, 0, 0),
    roll: anchor(cellG, 0, 0, HD),
  };
  const sheets = [[anchors.copper, -1], [anchors.film, 0], [anchors.alu, 1]];

  // the part the voice names glows faintly veille: its solids take the hue, its lines too
  const lampOf = (part, k0 = 0.3) => {
    const lamp = { solids: [], lines: [], k: -1, k0 };
    for (const mat of part.userData.part.mats) {
      if (mat.isLineMaterial) {
        mat.userData.rest = mat.color.clone();
        lamp.lines.push(mat);
      } else if (mat.emissive) lamp.solids.push(mat);
    }
    return lamp;
  };
  const light = (lamp, k) => {
    if (lamp.k === k) return;
    lamp.k = k;
    for (const mat of lamp.solids) mat.emissive.copy(VEILLE).multiplyScalar(lamp.k0 * k);
    for (const line of lamp.lines) line.color.copy(line.userData.rest).lerp(VEILLE, 0.7 * k);
  };
  const boardLamp = lampOf(board, 0.22);
  const bladeLamp = lampOf(blade, 1.5);

  // nothing is allocated past this line
  return {
    root, anchors,
    update(s, time = 0) {
      const fade = clamp01(s.fade ?? 1);
      const e = clamp01(s.explode ?? 0);
      const xray = clamp01(s.xray ?? 0);
      const unroll = clamp01(s.unroll ?? 0);
      const swell = clamp01(s.swell ?? 0);
      const dent = clamp01(s.dent ?? 0);
      const spot = clamp01(s.spot ?? 0);
      const heat = clamp01(s.heat ?? 0);
      const cut = 1 - clamp01(s.charge ?? 1);
      const level = clamp01(s.level ?? 0.6);
      const levelSeen = clamp01(s.levelSeen ?? 0);
      const litRoll = clamp01(s.litRoll ?? 0);
      const litBoard = clamp01(s.litBoard ?? 0);

      const gBody = smooth(ramp(xray, 0, 0.55));
      // ── opened: the back first, then the battery; both lean toward the camera as they rise — a fan, not a pile
      const upBack = settle(ramp(e, 0, 0.8));
      const upCell = settle(ramp(e, 0.16, 1));
      backG.position.y = BACK.y + (OPEN.back - BACK.y) * upBack + 0.27 * swell;
      backG.position.z = -LEAN.away * upBack;
      backMesh.castShadow = e < 0.3 && gBody * 1 < 0.4 && fade > 0.6;
      backG.rotation.x = LEAN.back * smooth(ramp(e, 0.25, 0.95)) - 3.2 * DEG * swell; // swollen: the back comes off the frame, on the camera's side first
      const cellY = BY + (OPEN.battery - BY) * upCell + 0.05 * swell;
      cellG.position.y = cellY;
      cellG.rotation.x = LEAN.cell * smooth(ramp(e, 0.3, 1));

      // ── solid, or glass: the body and the back first (the battery shows), then the pouch (its layers show)
      const gPouch = Math.max(smooth(ramp(xray, 0.5, 1)), smooth(ramp(unroll, 0, 0.2)), litRoll);
      setPartOpacity(body, (1 - gBody) * fade);
      setPartOpacity(back, (1 - gBody) * fade);
      see(bodyGhost, gBody * fade);
      see(backGhost, gBody * fade);
      setPartOpacity(pouch, (1 - gPouch) * fade);
      see(pouchGhost, gPouch * fade);
      setPartOpacity(roll, gPouch > 0.004 ? fade : 0);
      RU.uLit.value = litRoll;

      // ── the pouch: warm, swollen, creased
      const bare = Math.max(gBody, smooth(ramp(e, 0.08, 0.45))); // how much of the battery the eye reaches
      PU.uSwell.value = swell;
      PU.uDent.value = dent;
      PU.uHeat.value = heat;
      RU.uHeat.value = heat;
      WU.uHeat.value = heat * (1 - smooth(ramp(e, 0, 0.3)));
      shine(heatBall, fade * heat * 0.4, 7 + 3 * heat, 30);
      shine(spotBall, fade * smooth(ramp(spot, 0, 0.08)) * (0.45 + 0.4 * bare), 0.9 + 4.6 * spot, 9);

      // ── the level
      LU.uAmount.value = levelSeen * fade;
      LU.uLevel.value = level;
      LU.uTime.value = time;
      gauge.visible = levelSeen * fade > 0.004;

      // ── the board: its switch lies across (the charge goes through) or has lifted (it has cut, veille)
      const open = ease(cut);
      setPartOpacity(board, fade);
      setPartOpacity(blade, fade);
      bladeG.rotation.x = -38 * DEG * open;
      light(boardLamp, Math.max(litBoard, 0.55 * cut));
      light(bladeLamp, Math.max(0.3 * litBoard, cut));
      shine(cutBall, 0.5 * cut * fade, 1.7, 7);
      FU.uB.value.set(BOARD.at[0] - BOARD.w / 2, cellY, 0);
      FU.uLen.value = Math.hypot(FU.uB.value.x - FU.uA.value.x, cellY - PORT[1]) * 1.15;
      FU.uFlow.value = 1 - smooth(ramp(cut, 0, 0.5));
      FU.uAmount.value = fade * (1 - 0.6 * cut);
      FU.uTime.value = time;

      // ── the tongue: flat and fanned up to `out`, the rest wound in the scroll that rolls away
      const out = TG.len * unroll;
      const join = 1 - smooth(ramp(unroll, 0.78, 1));
      TU.uOut.value = out;
      TU.uJoin.value = join;
      setPartOpacity(tongue, fade * smooth(ramp(unroll, 0.004, 0.06)));
      CU.uLit.value = clamp01(s.litCopper ?? 0);
      AU.uLit.value = clamp01(s.litAlu ?? 0);
      FI.uLit.value = clamp01(s.litFilm ?? 0);
      const ax = Math.min(TG.len * 0.62, out * 0.8);
      const q = 1 - ax / TG.len;
      const g = 1 - q * q;
      const j = 1 - join * smooth(ramp(ax, out - 2.6, out - 0.3));
      for (let i = 0; i < 3; i++) {
        const sig = sheets[i][1];
        sheets[i][0].position.set(ax, TG.y0 * (1 - g) + sig * (TG.gap + TG.fan * g * j), -TG.stag * sig * g * j);
      }
    },
  };
}
