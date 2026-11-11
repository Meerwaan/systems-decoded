// CR02 — puits.js : the well in section, a schematic column (its width magnified ≈ 40× against its length), and the surface
// instruments (plan.js COLUMN, WELL, CONSOLE, EDS, KILL_LINE, CABLE, FLOW_DIAL, CULPRIT.puits). « Le noir chaud »: satin clay,
// fine light edges, the amber spot; green = what works, red = the incident. Everything that is cut is cut by x = 0 (the −x half
// removed, the cut faces toward −x and the key):
//   · the RESERVOIR (light porous clay, its pores hold the gas: a dim red that wakes near the bore), the ROCK in four strata, the
//     sediment of the seabed, the CASING; the WELLHEAD, the SIMPLE BOP (a dark body whose ram slots open on the cut: VBR at the
//     bottom, BSR blades, the ANNULAR rubber at the top — the bop.js order — on piston rods), the RISER and its flanges, the DRILL
//     FLOOR (the rotary table), the derrick's foot fading into the black;
//   · the DRILL PIPE, cut too: its two walls in relief down the axis (tool joints every 64 cm), its foot at y 170;
//   · THE FLUIDS, one cut face drawn by a shader: heavy MUD (brown-black, it boils slowly; veille green with `ok`), SEAWATER from the
//     top (paper, the lightest of the frame, threads that run down; a dark meniscus on the interface), the GAS (red, rising bubble
//     trails — a second, faster layer with `debit` —, a bright wavy front and a short glow over it);
//   · the BALANCE of `principe`, shown on the column itself: the mud's weight (a light arrow, down) against the gas's push (a red arrow
//     up from the reservoir); they trade sizes from −1 to +1 and fade once the gas itself is in the bore;
//   · the CONSOLE: two gauges (TUBE on the drill pipe's standpipe, LIGNE on the kill line that runs down the riser to the BOP), no
//     figure engraved; the EDS PANEL and its button (sinks on its own, lid raised), the CONTROL CABLE down the other side, a pulse of
//     paper light along it; the FLOW DIAL at the casing's foot (green to the mark 10, a dull red beyond that wakes when the needle
//     enters it — an indicator of the maquette, not a rig instrument).
// Everything is a function of S and time only (no Math.random, no clock); update() allocates nothing.
//   buildPuits() → { group, A, haloR, haloY, update(S, time, px) }
//   A: focus, fault (on the culprit: the LIGNE dial or the EDS button), bottom (the gas inlet), gasTop (rides on the gas front),
//      bop (the simple BOP), dialTube, dialLine, flowDial, eds (the button), signal (rides on the pulse down the cable), surface
//   reads S: sea balance gas gasBase debit mark dialTube dialLine eds signal link annular vbr bsr ok culprit fault
import * as THREE from "three";
import { clay, clayEdges, alarm, setAlarm, RECON } from "@kit/reconstitution.js";
import { solid, box, cyl, lathe, mergeGeometries } from "@kit/build3d.js";
import { COLUMN, WELL, CONSOLE, EDS, KILL_LINE, CABLE, FLOW_DIAL, CULPRIT } from "./plan.js";

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const sm = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const R = COLUMN.bore; // 17: the bore (the fluids)
const RO = R + COLUMN.wall; // 21: the casing / riser outside
const Y0 = WELL.bottom; // 46
const Y1 = WELL.surface; // 560
const SEABED = WELL.seabed; // 262
const [B0, B1] = WELL.bop; // 262 … 318
const yAt = (k) => Y0 + (Y1 - Y0) * clamp01(k); // 0 the bottom of the bore → 1 the drill floor
const DEPTH = 64; // how deep the cut maquette runs (x 0 … DEPTH)
const HALF = 78; // the rock's half-width (z)
const FLOOR_Y = Y1 + 6; // the drill floor's top
const PIPE_FOOT = 170; // where the drill pipe ends in the bore
const PIPE_R = COLUMN.pipe;
// the instruments' faces (x): just in front of their bodies, toward −x
const FACE_X = CONSOLE.at[0] - 2; // 8
const Z_TUBE = CONSOLE.at[2] - CONSOLE.gap / 2; // −81
const Z_LINE = CONSOLE.at[2] + CONSOLE.gap / 2; // −47
// the kill line runs on the console's side, the cable on the panel's side (whatever the sign plan.js gives: they never cross)
const Z_KILL = Math.sign(Z_LINE || -1) * Math.abs(KILL_LINE.z);
const Z_CABLE = Math.sign(EDS.at[2] || 1) * Math.abs(CABLE.z);
const FLOW_X = -3.2; // the flow dial is mounted on the rock's cut face
// the simple BOP's layers (y): VBR slot, BSR slot, annular slot, solid in between
const SLOT = { vbr: [266, 280], bsr: [284, 294], annular: [298, 314] };

const tinted = (hex, o) => {
  const m = clay(o);
  m.color.setHex(hex);
  return m;
};

/** Clay that sinks into the black above y0 … y1 (local y = world y: the group stands on y 0): what rises behind the header. */
function fadeUp(mat, y0, y1) {
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("void main() {", "varying float vFadeY;\nvoid main() {")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n  vFadeY = (modelMatrix * vec4(transformed, 1.0)).y;");
    sh.fragmentShader = sh.fragmentShader
      .replace("void main() {", "varying float vFadeY;\nvoid main() {")
      .replace("#include <tonemapping_fragment>", `gl_FragColor.rgb *= 1.0 - smoothstep(${y0.toFixed(1)}, ${y1.toFixed(1)}, vFadeY);\n#include <tonemapping_fragment>`);
  };
  mat.customProgramCacheKey = () => `puits-fade-${y0}-${y1}`;
  return mat;
}

/** Fine wavy laminations on a stratum (world y and z), melted into its plain tone before they get thinner than a few pixels. */
function laminate(mat, seed) {
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("void main() {", "varying vec3 vLamP;\nvoid main() {")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n  vLamP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("void main() {", "varying vec3 vLamP;\nvoid main() {").replace(
      "#include <color_fragment>",
      `#include <color_fragment>
      {
        float yy = vLamP.y + 1.6 * sin(vLamP.z * 0.045 + ${seed.toFixed(1)}) + 0.7 * sin(vLamP.z * 0.13 + ${(seed * 2.3).toFixed(1)});
        float fade = 1.0 - smoothstep(0.25, 0.8, fwidth(yy));
        float band = 0.5 + 0.5 * sin(yy * 1.7);
        float band2 = 0.5 + 0.5 * sin(yy * 0.53 + 1.3);
        diffuseColor.rgb *= 1.0 - 0.07 * fade * band - 0.07 * band2;
      }`,
    );
  };
  mat.customProgramCacheKey = () => `puits-lam-${seed}`;
  return mat;
}

/* ── shapes in the cut: drawn in (x, −z), extruded along y (rotateX(−π/2) maps them back) ── */
function prism(shape, h, bevel = 0) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: bevel ? h - 2 * bevel : h,
    curveSegments: 28,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
  });
  g.rotateX(-Math.PI / 2);
  if (bevel) g.translate(0, bevel, 0);
  return g;
}
function halfRing(r1, r2) {
  const s = new THREE.Shape();
  s.moveTo(0, -r2);
  s.absarc(0, 0, r2, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(0, r1);
  s.absarc(0, 0, r1, Math.PI / 2, -Math.PI / 2, true);
  s.closePath();
  return s;
}
/** A block x 0 … depth, z −hz … hz, with the bore (radius r) carved out of its cut face. */
function boredBlock(hz, depth, r) {
  const s = new THREE.Shape();
  s.moveTo(0, hz);
  s.lineTo(depth, hz);
  s.lineTo(depth, -hz);
  s.lineTo(0, -hz);
  s.lineTo(0, -r);
  s.absarc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
  s.closePath();
  return s;
}
/** The same block with a ram slot (x 0 … slotX, |z| ≤ slotZ) open on the cut. */
function slotBlock(hz, depth, slotX, slotZ) {
  const s = new THREE.Shape();
  s.moveTo(0, hz);
  s.lineTo(depth, hz);
  s.lineTo(depth, -hz);
  s.lineTo(0, -hz);
  s.lineTo(0, -slotZ);
  s.lineTo(slotX, -slotZ);
  s.lineTo(slotX, slotZ);
  s.lineTo(0, slotZ);
  s.closePath();
  return s;
}
/** A polyline with rounded corners, as a curve (lines + quadratic corners): what the tubes follow. */
function rounded(points, rc = 3) {
  const P = points.map((p) => new THREE.Vector3(...p));
  const path = new THREE.CurvePath();
  let cur = P[0].clone();
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1], b = P[i], c = P[i + 1];
    const r = Math.min(rc, a.distanceTo(b) * 0.45, b.distanceTo(c) * 0.45);
    const p1 = b.clone().add(a.clone().sub(b).setLength(r));
    const p2 = b.clone().add(c.clone().sub(b).setLength(r));
    path.add(new THREE.LineCurve3(cur, p1));
    path.add(new THREE.QuadraticBezierCurve3(p1, b.clone(), p2));
    cur = p2;
  }
  path.add(new THREE.LineCurve3(cur, P[P.length - 1].clone()));
  return path;
}
const cylZ = (r, h, bevel = 0.3, seg = 64) => cyl(r, h, bevel, seg).rotateX(Math.PI / 2);

/* ── the fluids' cut face ── */
const GLSL_NOISE = /* glsl */ `
  float h21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vn(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
  }`;
function fluidMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uSea: { value: Y1 }, uSeaOn: { value: 0 }, uGasLo: { value: Y0 }, uGasHi: { value: Y0 }, uGasOn: { value: 0 },
      uOk: { value: 0 }, uFast: { value: 0 }, uR: { value: R }, uY0: { value: Y0 }, uPipe: { value: PIPE_R }, uPipeFoot: { value: PIPE_FOOT },
      cMud: { value: new THREE.Color(0x4a3222) },
      cSea: { value: new THREE.Color(0xece6da).multiplyScalar(0.92) },
      cGas: { value: new THREE.Color(RECON.alarme).multiplyScalar(0.9) },
      cHot: { value: new THREE.Color(0xff6a44).multiplyScalar(2.4) },
      cOk: { value: new THREE.Color(RECON.veille) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vP = vec2(position.z, position.y);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uSea, uSeaOn, uGasLo, uGasHi, uGasOn, uOk, uFast, uR, uY0, uPipe, uPipeFoot;
      uniform vec3 cMud, cSea, cGas, cHot, cOk;
      varying vec2 vP;
      ${GLSL_NOISE}
      // rising bubbles: round, a bright rim and a lighter heart, a faint short wake under them, one per cell (some empty),
      // the cells sliding up at v cm/s
      float bub(vec2 p, float cell, float v, float seed, float aa) {
        vec2 cs = vec2(cell, cell * 1.5);
        vec2 q = vec2(p.x, p.y - uTime * v);
        vec2 id = floor(q / cs);
        float acc = 0.0;
        for (int j = -1; j <= 1; j++) {
          vec2 c = id + vec2(0.0, float(j));
          float on = step(0.38, h21(c + seed));
          vec2 ctr = (c + vec2(0.25 + 0.5 * h21(c + seed + 17.0), 0.5)) * cs;
          float rad = cell * (0.2 + 0.1 * h21(c + seed + 5.0));
          vec2 d = q - ctr;
          float dd = length(d);
          float disc = 1.0 - smoothstep(rad - aa, rad + aa, dd);
          float rim = disc * smoothstep(rad * 0.55, rad * 0.9, dd);
          float wake = (1.0 - smoothstep(rad * 0.3, rad * 0.75, abs(d.x))) * step(d.y, 0.0) * (1.0 - smoothstep(0.0, rad * 2.2, -d.y)) * 0.3;
          acc = max(acc, on * max(0.55 * disc + 0.45 * rim, wake));
        }
        return acc;
      }
      void main() {
        float z = vP.x, y = vP.y, t = uTime;
        float px = max(fwidth(y), 0.02);
        float zz = clamp(1.0 - (z * z) / (uR * uR), 0.0, 1.0);
        float edge = 0.84 + 0.16 * sqrt(zz);
        // MUD: brown-black, a slow boil (two drifting noises); veille green when it holds
        float n = 0.6 * vn(vec2(z * 0.22, y * 0.085 - t * 0.2)) + 0.4 * vn(vec2(z * 0.5 + 3.1, y * 0.2 - t * 0.34));
        vec3 mud = mix(cMud * (0.6 + 0.85 * n), cOk * (0.24 + 0.16 * n), clamp(uOk, 0.0, 1.0));
        // SEAWATER: paper, threads that run down
        float s = vn(vec2(z * 0.38, (y + t * 7.0) * 0.055));
        vec3 sea = cSea * (0.9 + 0.1 * s);
        float wob = 0.45 * sin(z * 0.42 + t * 1.2) + 0.25 * sin(z * 1.07 - t * 0.8);
        float yS = uSea + wob;
        float inSea = smoothstep(yS - px, yS + px, y) * uSeaOn;
        vec3 col = mix(mud, sea, inSea);
        // the interface: a fine dark meniscus on the water side, never under 1.3 px
        float lw = max(0.4, 1.3 * px);
        float line = (1.0 - smoothstep(lw, lw + px, abs(y - yS - lw))) * uSeaOn;
        col = mix(col, cMud * 0.22, 0.85 * line);
        // GAS: red, its bubbles (a faster layer with the flow), a bright wavy front and a short glow over it
        float gw = 0.6 * sin(z * 0.55 - t * 2.1) + 0.35 * sin(z * 1.3 + t * 1.4);
        float gHi = uGasHi + gw;
        float gLo = uGasLo > uY0 + 0.5 ? uGasLo - gw * 0.7 : uY0 - 20.0;
        float inGas = uGasOn * smoothstep(gLo - px, gLo + 1.2 + px, y) * (1.0 - smoothstep(gHi - px, gHi + px, y));
        float tn = vn(vec2(z * 0.3, y * 0.07 - t * 0.9));
        vec3 gas = cGas * (0.74 + 0.36 * tn);
        float aa = px * 1.2;
        float b = max(bub(vec2(z, y), 8.0, 15.0, 1.0, aa), uFast * bub(vec2(z + 2.3, y), 6.0, 31.0, 9.0, aa));
        gas = mix(gas, cHot * 0.48, b * 0.8);
        float fw = max(1.4, 3.6 * px);
        float fr = 1.0 - smoothstep(0.0, fw, gHi - y);
        gas = mix(gas, cHot * (1.0 + 0.25 * fr), fr);
        col = mix(col, gas, inGas);
        float over = uGasOn * step(gHi, y) * (1.0 - smoothstep(0.0, 4.5, y - gHi));
        col += cGas * 0.55 * over * over;
        // the drill pipe's walls stand just in front: a little shade beside them
        float pz = abs(abs(z) - uPipe);
        col *= 1.0 - 0.22 * step(uPipeFoot, y) * (1.0 - smoothstep(0.0, 2.2, pz));
        gl_FragColor = vec4(col * edge, 1.0);
      }`,
  });
}

/* ── the reservoir's pores: dark round voids over the light clay, each with a dim red (the gas), awake near the bore ── */
function poreMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uRed: { value: 0.2 }, uIn: { value: 0 }, cDark: { value: new THREE.Color(0x1a1311) }, cRed: { value: new THREE.Color(RECON.alarme) } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = vec2(position.z, position.y); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uRed, uIn; uniform vec3 cDark, cRed; varying vec2 vP;
      ${GLSL_NOISE}
      void main() {
        vec2 cs = vec2(5.2, 4.4);
        vec2 id = floor(vP / cs);
        float best = 9.0, hb = 0.0;
        for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) {
          vec2 c = id + vec2(float(i), float(j));
          vec2 ctr = (c + vec2(0.2 + 0.6 * h21(c + 3.0), 0.2 + 0.6 * h21(c + 8.0))) * cs;
          float rad = 0.85 + 0.85 * h21(c + 13.0);
          float d = length(vP - ctr) - rad;
          if (d < best) { best = d; hb = h21(c + 21.0); }
        }
        float px = max(fwidth(vP.y), 0.02);
        float a = 1.0 - smoothstep(-px, px, best);
        float near = exp(-abs(vP.x) / 24.0) * smoothstep(4.0, 44.0, vP.y);
        float breathe = 0.8 + 0.2 * sin(uTime * 1.1 + hb * 6.283);
        float red = (0.16 + uRed * near + uIn * near * near) * breathe;
        vec3 c = cDark + cRed * clamp(red, 0.0, 1.3) * 0.8;
        gl_FragColor = vec4(c, a * 0.92);
      }`,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
}

/* ── the control cable: a dark sheath, a paper core alive with `link`, the pulse and its trail ── */
function cableMaterial(len) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uHead: { value: 0 }, uOn: { value: 0 }, uLink: { value: 1 }, uLen: { value: len },
      cSheath: { value: new THREE.Color(0x2a2522) }, cCore: { value: new THREE.Color(RECON.papier) }, cPulse: { value: new THREE.Color(RECON.papier) },
    },
    vertexShader: /* glsl */ `
      varying float vU; varying vec3 vN; varying vec3 vV;
      void main() {
        vU = uv.x;
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uHead, uOn, uLink, uLen; uniform vec3 cSheath, cCore, cPulse;
      varying float vU; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        vec3 c = cSheath * (0.5 + 0.7 * f) + cCore * uLink * (0.08 + 0.1 * f);
        float ds = (uHead - vU) * uLen;
        float trail = ds >= 0.0 ? exp(-ds / 16.0) : exp(ds / 1.0);
        c += cPulse * uOn * trail * (0.7 + 0.6 * f) * 1.5;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
}
/** A soft ball of light (bright at its centre, gone at its rim, from any side). */
function glowBall(color, k) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uK: { value: k } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() { vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK; varying vec3 vN; varying vec3 vV;
      void main() { float f = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0); float a = pow(f, 3.0) * uK; gl_FragColor = vec4(uColor * a, a); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export function buildPuits() {
  const group = new THREE.Group();
  group.name = "puits";
  const mesh = (geo, mat, parent = group, { x = 0, y = 0, z = 0, edges = true, shadow = true, eo } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = shadow;
    if (edges) m.add(clayEdges(geo, eo));
    parent.add(m);
    return m;
  };

  /* ───────── the ground: reservoir, strata, sediment, casing ───────── */
  mesh(box(DEPTH, WELL.reservoir[1], 2 * HALF, 0.6), tinted(0xaea294), group, { x: DEPTH / 2, y: WELL.reservoir[1] / 2 });
  const pores = new THREE.Mesh(new THREE.PlaneGeometry(2 * HALF - 1, WELL.reservoir[1] - 1).rotateY(-Math.PI / 2).translate(-0.12, WELL.reservoir[1] / 2, 0), poreMaterial());
  pores.renderOrder = 3;
  group.add(pores);
  const STRATA = [[Y0, 98, 0x70675f], [98, 150, 0x5e5751], [150, 214, 0x766c63], [214, SEABED - 3, 0x605850]]; // mid values: the mud is darker, the sea lighter
  for (const [a, b, hex] of STRATA) {
    const m = laminate(tinted(hex), a * 0.37);
    const h = b - a;
    mesh(box(DEPTH, h, HALF - RO, 0.4), m, group, { x: DEPTH / 2, y: (a + b) / 2, z: (HALF + RO) / 2 });
    mesh(box(DEPTH, h, HALF - RO, 0.4), m, group, { x: DEPTH / 2, y: (a + b) / 2, z: -(HALF + RO) / 2 });
    mesh(box(DEPTH - RO + 1, h, 2 * RO + 0.2, 0.4), m, group, { x: (DEPTH + RO - 1) / 2, y: (a + b) / 2, edges: false });
  }
  mesh(prism(boredBlock(HALF, DEPTH, RO), 3, 0.3), laminate(tinted(0x847a70), 9), group, { y: SEABED - 3 }); // the sediment, the seabed
  mesh(prism(halfRing(R, RO), SEABED - Y0, 0.3), clay({ tone: 0.6 }), group, { y: Y0 }); // the casing
  mesh(prism(halfRing(RO - 0.2, RO + 5), 13, 0.4), clay({ tone: 0.1 }), group, { y: SEABED - 10 }); // the wellhead housing

  /* ───────── the simple BOP: a dark body, three ram slots open on the cut, the rams on their piston rods ───────── */
  const bodyMat = clay({ tone: -0.85 });
  const HZ = 32, BD = 32, SX = 20, SZ = 31;
  const layers = [[B0, SLOT.vbr[0]], [SLOT.vbr[1], SLOT.bsr[0]], [SLOT.bsr[1], SLOT.annular[0]], [SLOT.annular[1], B1]];
  for (const [a, b] of layers) mesh(prism(boredBlock(HZ, BD, R), b - a, 0), bodyMat, group, { y: a });
  for (const k of ["vbr", "bsr", "annular"]) {
    const [a, b] = SLOT[k];
    mesh(prism(slotBlock(HZ, BD, SX, SZ), b - a, 0), bodyMat, group, { y: a });
  }
  const bonnetMat = clay({ tone: -0.6 });
  for (const k of ["vbr", "bsr"]) {
    const [a, b] = SLOT[k];
    for (const s of [-1, 1]) mesh(box(24, b - a + 2, 9, 0.8), bonnetMat, group, { x: 14, y: (a + b) / 2, z: s * (HZ + 4.5) });
  }
  const ramMat = { vbr: clay({ tone: 0.45 }), bsr: clay({ tone: 0.6 }), annular: clay({ tone: -0.15 }) };
  const rodMat = clay({ tone: 0.15 });
  const ram = {};
  {
    const mk = (k, geo, s, yc) => {
      const g = new THREE.Group();
      group.add(g);
      const m = mesh(geo, ramMat[k], g, { x: SX / 2 - 0.8 });
      const rod = mesh(new THREE.BoxGeometry(4, 3.6, 1), rodMat, g, { x: 10, edges: false });
      g.position.y = yc;
      return { g, m, rod, s };
    };
    const yv = (SLOT.vbr[0] + SLOT.vbr[1]) / 2;
    const yb = (SLOT.bsr[0] + SLOT.bsr[1]) / 2;
    const ya = (SLOT.annular[0] + SLOT.annular[1]) / 2;
    ram.vbr = [-1, 1].map((s) => mk("vbr", box(SX - 0.4, 12, 12, 0.6), s, yv));
    ram.bsr = [-1, 1].map((s) => mk("bsr", box(SX - 0.4, 4.2, 14, 0.4), s, yb + (s < 0 ? 2.2 : -2.2)));
    ram.annular = [-1, 1].map((s) => mk("annular", box(SX - 0.4, 14.5, 11, 4.2), s, ya));
  }
  const RAM_LEN = { vbr: 12, bsr: 14, annular: 11 };
  const ramIn = { vbr: PIPE_R + 0.2, bsr: -2.6, annular: PIPE_R + 0.2 }; // the inner face when closed (bsr: past the centre)
  const ramOut = R + 0.6; // open: flush with the bore

  /* ───────── the riser, its flanges; the drill floor, the rotary table, the derrick's foot ───────── */
  const riserMat = clay({ tone: 0.22 });
  mesh(prism(halfRing(R, RO), Y1 - B1, 0.3), riserMat, group, { y: B1 });
  for (let y = 346; y < Y1 - 20; y += 62) mesh(prism(halfRing(RO - 0.2, RO + 2.6), 3.2, 0.4), clay({ tone: 0.0 }), group, { y });
  mesh(prism(boredBlock(106, DEPTH, R), FLOOR_Y - Y1, 0.5), clay({ tone: 0.05 }), group, { y: Y1 });
  mesh(prism(halfRing(R + 0.4, R + 8), 2.4, 0.4), clay({ tone: 0.5 }), group, { y: FLOOR_Y });
  const derrickMat = fadeUp(clay({ tone: -0.2 }), 596, 650);
  for (const x of [36, 58]) for (const z of [-34, 34]) mesh(box(3, 96, 3, 0.4), derrickMat, group, { x, y: FLOOR_Y + 48, z, edges: false });
  for (const y of [604, 640]) {
    for (const x of [36, 58]) mesh(box(2, 2, 68, 0.3), derrickMat, group, { x, y, edges: false });
    for (const z of [-34, 34]) mesh(box(22, 2, 2, 0.3), derrickMat, group, { x: 47, y, z, edges: false });
  }

  /* ───────── the drill pipe: in section in the bore (two walls in relief, tool joints), whole above the floor ───────── */
  const pipeMat = clay({ tone: 0.05 });
  const WZ = 1.3; // a wall's thickness in the cut
  for (const s of [-1, 1]) {
    mesh(box(3.2, Y1 - PIPE_FOOT, WZ, 0.3), pipeMat, group, { x: 0.4, y: (PIPE_FOOT + Y1) / 2, z: s * (PIPE_R - WZ / 2) });
    for (let y = PIPE_FOOT + 30; y < Y1 - 10; y += 64) mesh(box(3.6, 4, WZ + 1.1, 0.4), pipeMat, group, { x: 0.5, y, z: s * (PIPE_R - WZ / 2 + 0.55), edges: false });
  }
  mesh(cyl(PIPE_R, 50, 0.3, 32), pipeMat, group, { y: Y1 + 26 });
  const driveMat = fadeUp(clay({ tone: -0.35 }), 606, 640);
  mesh(box(16, 16, 18, 1), driveMat, group, { y: 620, edges: false });

  /* ───────── the fluids: one cut face ───────── */
  const fluidMat = fluidMaterial();
  const fluids = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, Y1 - Y0).rotateY(-Math.PI / 2).translate(0.3, (Y0 + Y1) / 2, 0), fluidMat);
  group.add(fluids);

  /* ───────── the balance of `principe`: the mud's weight (down) against the gas's push (up), on the column itself ───────── */
  const arrowHead = (w, l) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(0, -l);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.4, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 1 });
    return g;
  };
  const makeArrow = (mat) => {
    const g = new THREE.Group();
    g.rotation.y = -Math.PI / 2;
    g.position.x = -1.6;
    group.add(g);
    const shaft = mesh(new THREE.BoxGeometry(5.6, 1, 2.0), mat, g, { edges: false });
    const head = mesh(arrowHead(15, 10), mat, g, { edges: false });
    return { g, shaft, head };
  };
  const weightMat = clay({ tone: 0.85 });
  weightMat.emissive.setHex(RECON.veille);
  weightMat.emissiveIntensity = 0;
  weightMat.transparent = true;
  const pushMat = solid(new THREE.Color(0x6a1512), { rough: 0.45, metal: 0, env: 0.6 });
  pushMat.emissive.setHex(RECON.alarme);
  pushMat.emissiveIntensity = 0.85;
  pushMat.transparent = true;
  pushMat.userData.finish = false;
  const weight = makeArrow(weightMat); // points down
  const push = makeArrow(pushMat); // points up
  push.head.rotation.z = Math.PI;
  const HEAD = 10;

  /* ───────── the gauges ───────── */
  const darkMat = () => tinted(0x1d1916);
  function gauge({ at, r, max, minor, major, body, zones = [], mark = null, fill = false }) {
    const g = new THREE.Group();
    g.position.set(...at);
    g.rotation.y = -Math.PI / 2; // local +z → world −x (the face), local +x → world +z (screen right)
    group.add(g);
    const phi = (v) => (5 * Math.PI) / 4 - ((3 * Math.PI) / 2) * clamp01(v / max);
    mesh(cylZ(r + 2.3, 4.2, 0.5), body, g, { z: -2.1 });
    mesh(lathe([[r - 0.4, -0.8], [r + 2.5, -0.8], [r + 2.5, 0.9], [r - 0.4, 0.9]], 72, { bevel: 0.4 }).rotateX(Math.PI / 2), body, g, { z: 0.2 });
    const face = new THREE.Mesh(new THREE.CircleGeometry(r - 0.3, 64), clay({ tone: 0.92 }));
    face.position.z = 0.06;
    face.receiveShadow = true;
    g.add(face);
    const ticks = [];
    const k = r / 13;
    for (let v = 0; v <= max + 1e-6; v += minor) {
      const big = Math.abs(v / major - Math.round(v / major)) < 1e-6;
      const len = (big ? 3.2 : 1.6) * k, w = (big ? 0.95 : 0.45) * k;
      ticks.push(new THREE.PlaneGeometry(w, len).translate(0, r - 1.1 * k - len / 2, 0).rotateZ(phi(v) - Math.PI / 2));
    }
    const tm = new THREE.Mesh(mergeGeometries(ticks), new THREE.MeshBasicMaterial({ color: 0x161210 }));
    tm.position.z = 0.14;
    g.add(tm);
    const zoneMats = zones.map(([a, b, color, kk]) => {
      const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(kk), toneMapped: false });
      const ring = new THREE.Mesh(new THREE.RingGeometry(r * 0.56, r * 0.69, 48, 1, phi(b), phi(a) - phi(b)), m);
      ring.position.z = 0.11;
      g.add(ring);
      return m;
    });
    let markMat = null;
    if (mark != null) {
      markMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(RECON.papier), toneMapped: false });
      const mm = new THREE.Mesh(new THREE.PlaneGeometry(1.4 * k, r * 0.5).translate(0, r * 0.66, 0).rotateZ(phi(mark) - Math.PI / 2), markMat);
      mm.position.z = 0.18;
      g.add(mm);
    }
    // the value arc (TUBE, LIGNE): dark, from 0 to the needle — 1 400 is a big arc, 0 is nothing (read at 270 px)
    let arc = null;
    if (fill) {
      arc = new THREE.Mesh(new THREE.RingGeometry(r * 0.3, r * 0.6, 96, 1, -Math.PI / 4, (3 * Math.PI) / 2), new THREE.MeshBasicMaterial({ color: 0x161210, side: THREE.DoubleSide }));
      arc.scale.x = -1; // the ring runs counter-clockwise from −45°: mirrored, it starts at 0 (lower left) and runs clockwise, like the needle
      arc.position.z = 0.12;
      arc.geometry.setDrawRange(0, 0);
      g.add(arc);
    }
    const needle = new THREE.Group();
    needle.position.z = 0.5;
    g.add(needle);
    const ns = new THREE.Shape();
    ns.moveTo(-0.95 * k, -r * 0.24);
    ns.lineTo(0.95 * k, -r * 0.24);
    ns.lineTo(0.3 * k, r * 0.84);
    ns.lineTo(-0.3 * k, r * 0.84);
    ns.closePath();
    const nm = darkMat();
    mesh(new THREE.ExtrudeGeometry(ns, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 1 }), nm, needle, { edges: false });
    mesh(cylZ(1.8 * k, 1.4, 0.3, 32), nm, needle, { z: 0.6, edges: false });
    return { g, needle, phi, zoneMats, markMat, arc };
  }

  /* ───────── the console: TUBE and LIGNE ───────── */
  mesh(box(16, 46, 82, 0.8), clay({ tone: -0.55 }), group, { x: CONSOLE.at[0] + 10, y: FLOOR_Y + 23, z: CONSOLE.at[2] });
  const lineDialMat = alarm({ tone: -0.25, noOk: true });
  const dialT = gauge({ at: [FACE_X, CONSOLE.at[1], Z_TUBE], r: CONSOLE.dial, max: 2000, minor: 100, major: 500, body: clay({ tone: -0.25 }), fill: true });
  const dialL = gauge({ at: [FACE_X, CONSOLE.at[1], Z_LINE], r: CONSOLE.dial, max: 2000, minor: 100, major: 500, body: lineDialMat, fill: true });
  // the standpipe: from the drill pipe over the console into the TUBE gauge
  const lineMatL = clay({ tone: 0.55 });
  const stand = rounded([[1.5, 604, -3], [6, 611, -12], [6, 611, Z_TUBE], [FACE_X + 2, CONSOLE.at[1] + CONSOLE.dial + 1.5, Z_TUBE]], 4);
  mesh(new THREE.TubeGeometry(stand, 120, 1.6, 10, false), lineMatL, group, { edges: false });
  // the kill line: from the LIGNE gauge down along the riser to the BOP
  const kill = rounded([
    [FACE_X + 2, CONSOLE.at[1] - CONSOLE.dial - 1.5, Z_LINE], [6, FLOOR_Y + 2, Z_LINE], [6, FLOOR_Y + 2, Z_KILL], [6, 344, Z_KILL],
    [6, 330, Math.sign(Z_KILL) * 38], [6, 304, Math.sign(Z_KILL) * 38], [6, 304, Math.sign(Z_KILL) * (HZ - 0.5)],
  ], 4);
  mesh(new THREE.TubeGeometry(kill, 260, KILL_LINE.r, 10, false), lineMatL, group, { edges: false });

  /* ───────── the EDS panel and its button, the control cable ───────── */
  const [ex, ey, ez] = EDS.at;
  mesh(box(14, 36, 34, 0.8), clay({ tone: -0.55 }), group, { x: ex + 9, y: FLOOR_Y + 18, z: ez });
  mesh(box(1.4, 17, 17, 0.4), clay({ tone: 0.55 }), group, { x: ex + 1.5, y: ey, z: ez }); // the light bezel
  mesh(cyl(EDS.button + 1.6, 1.8, 0.3, 40).rotateZ(Math.PI / 2), clay({ tone: -0.95 }), group, { x: ex + 0.2, y: ey, z: ez }); // the collar
  const btnMat = alarm({ tone: 0.8, noOk: true });
  const BTN_X = ex - 1.6;
  const btn = mesh(cyl(EDS.button, 3.4, 0.6, 48).rotateZ(Math.PI / 2), btnMat, group, { x: BTN_X, y: ey, z: ez });
  const cablePath = rounded([
    [ex + 2, FLOOR_Y + 4, ez], [6, FLOOR_Y + 1.6, ez - 6], [6, FLOOR_Y + 1.6, Z_CABLE], [6, 344, Z_CABLE],
    [6, 330, Math.sign(Z_CABLE) * 38], [6, 296, Math.sign(Z_CABLE) * 38], [6, 296, Math.sign(Z_CABLE) * (HZ - 0.5)],
  ], 4);
  const cableLen = cablePath.getLength();
  const cMat = cableMaterial(cableLen);
  const cableMesh = new THREE.Mesh(new THREE.TubeGeometry(cablePath, 320, CABLE.r + 0.3, 10, false), cMat);
  cableMesh.castShadow = true;
  group.add(cableMesh);
  const LUT_N = 256;
  const LUT = new Float32Array(LUT_N * 3);
  {
    const p = new THREE.Vector3();
    for (let i = 0; i < LUT_N; i++) {
      cablePath.getPointAt(i / (LUT_N - 1), p);
      LUT[i * 3] = p.x; LUT[i * 3 + 1] = p.y; LUT[i * 3 + 2] = p.z;
    }
  }
  const headCore = new THREE.Mesh(new THREE.SphereGeometry(2.0, 20, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(RECON.papier).multiplyScalar(1.8), toneMapped: false }));
  const headGlow = new THREE.Mesh(new THREE.SphereGeometry(7.5, 24, 16), glowBall(RECON.papier, 0.9));
  headGlow.renderOrder = 5;
  group.add(headCore, headGlow);

  /* ───────── the flow dial at the casing's foot ───────── */
  const flowBody = clay({ tone: -0.4, rough: 0.78, env: 0.35 }); // no softbox glare over the mark
  const flow = gauge({
    at: [FLOW_X, FLOW_DIAL.at[1], FLOW_DIAL.at[2]], r: FLOW_DIAL.r, max: FLOW_DIAL.max, minor: 2, major: 10, body: flowBody,
    zones: [[0, FLOW_DIAL.mark, RECON.veille, 0.75], [FLOW_DIAL.mark, FLOW_DIAL.max, RECON.alarme, 0.3]], mark: FLOW_DIAL.mark,
  });
  const redZone = flow.zoneMats[1];
  const RED = new THREE.Color(RECON.alarme);
  const PAPER = new THREE.Color(RECON.papier);
  {
    const zr = FLOW_DIAL.at[2] - (FLOW_DIAL.r + 2.3) * 0.72;
    const yr = FLOW_DIAL.at[1] - (FLOW_DIAL.r + 2.3) * 0.72;
    const tap = rounded([[-1.4, Y0 + 12, RO - 0.5], [-1.4, Y0 + 12, zr - 6], [-1.4, yr + 1, zr + 0.5]], 3);
    mesh(new THREE.TubeGeometry(tap, 60, 1.3, 10, false), clay({ tone: 0.5 }), group, { edges: false });
  }

  /* ───────── anchors ───────── */
  const A = {};
  const anchor = (name, x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    group.add(o);
    A[name] = o;
    return o;
  };
  anchor("focus", 0, 300, 0);
  anchor("fault", FACE_X, CONSOLE.at[1], Z_LINE);
  anchor("bottom", 0, Y0, 0);
  anchor("gasTop", -0.5, Y0, 0);
  anchor("bop", 0, (B0 + B1) / 2, 0);
  anchor("dialTube", FACE_X, CONSOLE.at[1], Z_TUBE);
  anchor("dialLine", FACE_X, CONSOLE.at[1], Z_LINE);
  anchor("flowDial", FLOW_X, FLOW_DIAL.at[1], FLOW_DIAL.at[2]);
  anchor("eds", BTN_X - 1.7, ey, ez);
  anchor("signal", LUT[0], LUT[1], LUT[2]);
  anchor("surface", 0, Y1, 0);

  const U = fluidMat.uniforms;
  const PU = pores.material.uniforms;
  const placeRam = (k, closed) => {
    const zi = ramOut + (ramIn[k] - ramOut) * clamp01(closed);
    const L = RAM_LEN[k];
    for (const r of ram[k]) {
      const zc = zi + L / 2;
      r.m.position.z = r.s * zc;
      const back = zi + L;
      const rl = Math.max(0.2, SZ + 1 - back);
      r.rod.scale.z = rl;
      r.rod.position.z = r.s * (back + rl / 2);
    }
  };

  return {
    group, A, haloR: 24, haloY: FLOOR_Y + 0.2,
    update(S, time) {
      // the fluids
      const ySea = yAt(1 - clamp01(S.sea));
      U.uTime.value = time;
      U.uSea.value = ySea;
      U.uSeaOn.value = ySea < Y1 - 0.5 ? 1 : 0;
      const lo = yAt(S.gasBase), hi = yAt(S.gas);
      U.uGasLo.value = lo;
      U.uGasHi.value = hi;
      U.uGasOn.value = hi - lo > 0.3 ? 1 : 0;
      U.uOk.value = clamp01(S.ok);
      U.uFast.value = sm(4, 20, S.debit);
      A.gasTop.position.y = hi;
      // the reservoir: its gas wakes as the balance tips, and as the gas enters
      const b = Math.max(-1, Math.min(1, S.balance));
      PU.uTime.value = time;
      PU.uRed.value = 0.25 + 0.55 * sm(-0.6, 1, b);
      PU.uIn.value = hi - lo > 0.3 && lo < Y0 + 1 ? 0.6 : 0;
      // the balance: the weight (down) and the push (up) trade sizes; gone once the gas fills the bore
      const kb = (b + 1) / 2;
      const vis = 1 - sm(0.12, 0.3, S.gas);
      const upL = 22 + 44 * kb; // the push: from inside the reservoir up
      const upTip = 6 + upL;
      const dnL = 60 - 36 * kb; // the weight: its tip just over the push
      const dnTip = Math.max(Y0 + 6, upTip + 4);
      push.g.visible = weight.g.visible = vis > 0.01;
      push.shaft.scale.y = upL - HEAD;
      push.shaft.position.y = 6 + (upL - HEAD) / 2;
      push.head.position.y = upTip - HEAD;
      weight.shaft.scale.y = dnL - HEAD;
      weight.shaft.position.y = dnTip + HEAD + (dnL - HEAD) / 2;
      weight.head.position.y = dnTip + HEAD;
      pushMat.opacity = weightMat.opacity = vis;
      pushMat.depthWrite = weightMat.depthWrite = vis > 0.99;
      pushMat.emissiveIntensity = 0.55 + 0.5 * kb;
      weightMat.emissiveIntensity = 0.55 * clamp01(S.ok);
      // the simple BOP
      placeRam("vbr", S.vbr);
      placeRam("bsr", S.bsr);
      placeRam("annular", S.annular);
      ramMat.vbr.emissive.setHex(RECON.veille);
      ramMat.vbr.emissiveIntensity = 0.5 * sm(0.85, 1, S.vbr);
      ramMat.bsr.emissive.setHex(RECON.veille);
      ramMat.bsr.emissiveIntensity = 0.5 * sm(0.85, 1, S.bsr);
      // the gauges: 0 … 2 000 psi, 0 … 30 barrels/min, over 270°
      dialT.needle.rotation.z = dialT.phi(S.dialTube) - Math.PI / 2;
      dialL.needle.rotation.z = dialL.phi(S.dialLine) - Math.PI / 2;
      dialT.arc.geometry.setDrawRange(0, 6 * Math.round(96 * clamp01(S.dialTube / 2000)));
      dialL.arc.geometry.setDrawRange(0, 6 * Math.round(96 * clamp01(S.dialLine / 2000)));
      flow.needle.rotation.z = flow.phi(S.debit) - Math.PI / 2;
      flow.markMat.color.copy(PAPER).multiplyScalar(0.3 + 0.95 * clamp01(S.mark));
      redZone.color.copy(RED).multiplyScalar(0.28 + 0.8 * sm(FLOW_DIAL.mark - 0.5, FLOW_DIAL.mark + 2.5, S.debit));
      // the button sinks on its own; the culprit
      btn.position.x = BTN_X + 2.2 * clamp01(S.eds);
      const c = Math.round(S.culprit);
      setAlarm(lineDialMat, c === CULPRIT.puits.dialLine ? S.fault : 0);
      setAlarm(btnMat, c === CULPRIT.puits.eds ? S.fault : 0);
      A.fault.position.copy(c === CULPRIT.puits.eds ? A.eds.position : A.dialLine.position);
      // the pulse down the control cable
      const sg = clamp01(S.signal);
      const f = sg * (LUT_N - 1);
      const i0 = Math.min(LUT_N - 2, Math.floor(f));
      const w = f - i0;
      const o = i0 * 3;
      const px = LUT[o] + (LUT[o + 3] - LUT[o]) * w;
      const py = LUT[o + 1] + (LUT[o + 4] - LUT[o + 1]) * w;
      const pz = LUT[o + 2] + (LUT[o + 5] - LUT[o + 2]) * w;
      A.signal.position.set(px, py, pz);
      const on = sm(0.0, 0.02, sg) * (1 - sm(0.97, 1.0, sg));
      cMat.uniforms.uHead.value = sg;
      cMat.uniforms.uOn.value = on;
      cMat.uniforms.uLink.value = clamp01(S.link);
      headCore.position.set(px - 0.6, py, pz);
      headGlow.position.copy(headCore.position);
      headCore.visible = headGlow.visible = on > 0.01;
      headCore.scale.setScalar(0.4 + 0.6 * on);
      headGlow.material.uniforms.uK.value = 0.9 * on;
    },
  };
}
