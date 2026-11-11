// CR02 — bop.js : THE SYSTEM — the blowout preventer in section, ≈ 1:10 (plan.js STACK, BORE, PIPE, RAMS, PODS, BUCKLE, RAMS2,
// CULPRIT.bop). A clay maquette (« le noir chaud ») cut open by the plane x = 0: the −x half is removed, every cut face looks toward −x.
// From the bottom up (CSB Vol. 2, the order of the stack):
//   · the wellhead stub and its CONNECTOR, the FRAME (back posts, beams) and four ACCUMULATOR bottles behind (dark clay: they frame)
//   · the LOWER STACK, one body of thin plates with five ram cavities: three VBR (pipe rams, a half-round notch around the pipe and a
//     rubber packer in front — only the UPPER one closes: `vbr`), the CSR (grey, never named, always open), the BSR (two blades: the
//     ram from −z carries the UPPER blade, the ram from +z the LOWER blade; closed, they overlap past the axis: `bsr`). Each ram slides
//     along ±z inside its hollow BONNET (half-cylinders on both flanks), pushed by a rod and a piston seen in the section.
//   · the LMRP: its connector, the lower and UPPER ANNULARS (a bell around a ring of rubber that swells inward onto the pipe:
//     `annular`), the flex joint, the RISER that rises and sinks into the black before the header. Its frame, and on its flanks the
//     two CONTROL PODS (front panels toward −x, hinged on their outer edge: `podOpen`): in the −z one the 27 V BATTERY and its amber
//     gauge (`charge`), two electronics boxes; in the +z one the SOLENOID VALVE with its two COILS (two opposed field arrows: `coils`)
//     and the 9 V PILE wired to it; a lamp on each (`amf`). Down the riser, two control cables (light pulses running down: `link`)
//     and two hoses.
//   · THE DRILL PIPE down the bore (magnified ≈ 3×, the lightest piece, itself cut in half: its inside is seen). It BUCKLES (`buckle`):
//     held centred by the VBR, it bows off the axis toward +z, most at the BSR (BUCKLE), a smooth curve back to the axis at the flex.
//     Its shape is rewritten each time a number changes: where a blade passes, the pipe is pushed back — a centred pipe is eaten from
//     both sides and parts (the clean cut); an off-centre one is PINCHED between the two blades (squashed in an S, never severed) and
//     PIERCED where the upper blade bites: a red point and a jet (`bsr` × `buckle`, × `pass`).
//   · THE GAS: one plane in the cut that knows where the pipe is — red in the annulus up to the front (`flow`), dimmed to `pass` above
//     the lowest closed element, red inside the pipe (`inside`, a slow pulse) — and rising streaks; `plume`: the riser broken off at
//     RISER_BREAK, a red plume that billows out of it and drifts with the current.
//   · `depuis`: the LMRP lifts and a SECOND BSR module slides in from behind (`rams2`), a CENTRING RING closes in the bore under the
//     blades and straightens the pipe (`ring`: the offset × (1 − ring)), `shear` forces the clean cut.
// Green (veille) = a seal that closes and holds, ∝ its closure × max(ok, depuis): upper annular, upper VBR, BSR (not when it pierces
// the pipe), second BSR, ring. Red = the culprit (S.culprit, CULPRIT.bop), one at a time, lit by S.fault; the pipe heals with depuis × ring.
// Everything depends on S and time only (seeded hashes, no Math.random, no clock); update() allocates nothing.
//   buildBop() → { group, A, haloR, update(S, time, px) }
//   A: focus, fault (on the culprit), annular (the upper annular), vbr (the upper VBR), bsr (the blades' centre), pipeBend (rides on the
//      most off-centre point of the pipe), podBattery, podValve, battery, valve, pile, riser (the riser's foot), plume (the leak's top)
//   reads S: annular vbr bsr flow pass buckle inside amf link podOpen charge coils plume rams2 ring shear ok culprit fault depuis
import * as THREE from "three";
import { clay, clayEdges, alarm, setAlarm, heal, RECON } from "@kit/reconstitution.js";
import { box, lathe, mergeGeometries } from "@kit/build3d.js";
import { BORE, PIPE, RAMS, PODS, BUCKLE, RAMS2, CULPRIT } from "./plan.js";

const BR = BORE.r; // the bore
const PR = PIPE.r; // the pipe, outside
const WALL = 0.95; // the pipe's wall (thick: its two cut rims are the light lines that say « a tube »)
const DEPTH = 12.6; // how deep a ram is (x)
const BODY_Z = 16; // the lower stack's body: half-width (z) …
const BODY_X = 16; // … and depth (x)
const OPEN = BR + 0.6; // a ram's front when open: just out of the bore
const LMRP_Y = 88; // the LMRP's foot (its connector)
const LIFT2 = 13; // how far the LMRP rises to let the second BSR in (`rams2`)
const YV = RAMS.vbr[2][0]; // the upper VBR (the one that closes)
const YB = RAMS.bsr[0]; // the BSR's shear plane
const HB = RAMS.bsr[1] / 2 - 0.3; // a blade ram's half-height (5.2)
const Y_ANN = RAMS.annular[1][0]; // the upper annular
const Y_FLEX = RAMS.flex[0];
const RISER_BREAK = 196; // where the riser breaks off for the leak (and where its edges stop: above, it fades)
const RISER_TOP = 300;
const FADE0 = 168; // what rises behind the header sinks into the black between these heights (world y)
const FADE1 = 232;
const SPAN = 300; // the gas streaks' climb
const RED = new THREE.Color(RECON.alarme);
const VEILLE = new THREE.Color(RECON.veille);
const GREEN_B = new THREE.Color(0x173a2a);
const PAPER = new THREE.Color(RECON.papier);

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;
/** A seeded hash of two integers → [0, 1). */
function hash(a, b) {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b + 0x632be5ab) | 0, 0xc2b2ae35);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
/** The buckled pipe's shape, 0 … 1 of BUCKLE.off: held at the VBR, most off-centre at the BSR, back on the axis at the flex joint. */
function bump(y) {
  if (y <= YV) return 0;
  if (y <= BUCKLE.y) return 0.5 - 0.5 * Math.cos((Math.PI * (y - YV)) / (BUCKLE.y - YV));
  if (y < 150) return 0.5 + 0.5 * Math.cos((Math.PI * (y - BUCKLE.y)) / (150 - BUCKLE.y));
  return 0;
}
const BUMP_GLSL = /* glsl */ `
  float bump(float y) {
    if (y <= ${YV.toFixed(1)}) return 0.0;
    if (y <= ${BUCKLE.y.toFixed(1)}) return 0.5 - 0.5 * cos(3.14159265 * (y - ${YV.toFixed(1)}) / ${(BUCKLE.y - YV).toFixed(1)});
    if (y < 150.0) return 0.5 + 0.5 * cos(3.14159265 * (y - ${BUCKLE.y.toFixed(1)}) / ${(150 - BUCKLE.y).toFixed(1)});
    return 0.0;
  }`;

/* ── geometry helpers ── */
/** A closed profile ([r, y] corners, [r, y, 1] smooth points) turned half a turn around y (x ≥ 0), with its two cut faces in x = 0. */
function halfRev(profile, segs = 40) {
  const n = profile.length;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const p = profile[i % n];
    const v = new THREE.Vector2(p[0], p[1]);
    if (!p[2] && i > 0 && i < n) pts.push(v, v.clone()); // a corner: two points, two normals
    else pts.push(v);
  }
  const lat = new THREE.LatheGeometry(pts, segs, 0, Math.PI);
  lat.computeVertexNormals();
  const shape = new THREE.Shape(profile.map((p) => new THREE.Vector2(p[0], p[1])));
  const capA = new THREE.ShapeGeometry(shape, 8).rotateY(-Math.PI / 2); // (r, y) → (0, y, +r)
  const capB = new THREE.ShapeGeometry(shape, 8).rotateY(Math.PI / 2); // (r, y) → (0, y, −r)
  return mergeGeometries([lat, capA, capB]);
}
/** The same, turned around the z axis: the profile's y runs along z (a bonnet, a rod, a piston). */
const zRev = (profile, segs = 32) => halfRev(profile, segs).rotateX(Math.PI / 2);
/** An (x, z) outline extruded along y from 0 to h. */
function prismXZ(points, h) {
  const s = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ExtrudeGeometry(s, { depth: h, curveSegments: 20, bevelEnabled: false });
  return g.rotateX(-Math.PI / 2);
}
/** A (z, y) outline extruded along x from 0 to depth. */
function prismZY(points, depth) {
  const s = new THREE.Shape(points.map(([z, y]) => new THREE.Vector2(-z, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  return g.rotateY(Math.PI / 2);
}
/** Half a disk's arc in (x, z) around (0, zc): from (0, zc + r) through (r, zc) to (0, zc − r). */
const arcXZ = (zc, r, n = 16) => Array.from({ length: n + 1 }, (_, i) => [r * Math.sin((Math.PI * i) / n), zc + r * Math.cos((Math.PI * i) / n)]);

/** Clay that sinks into the black above y0 … y1 (world y): what rises behind the header. */
function fadeUp(mat, y0 = FADE0, y1 = FADE1) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    prev?.call(mat, sh, r);
    sh.vertexShader = sh.vertexShader
      .replace("void main() {", "varying float vFadeY;\nvoid main() {")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n  vFadeY = (modelMatrix * vec4(transformed, 1.0)).y;");
    sh.fragmentShader = sh.fragmentShader
      .replace("void main() {", "varying float vFadeY;\nvoid main() {")
      .replace("#include <tonemapping_fragment>", `gl_FragColor.rgb *= 1.0 - smoothstep(${y0.toFixed(1)}, ${y1.toFixed(1)}, vFadeY);\n#include <tonemapping_fragment>`);
  };
  mat.customProgramCacheKey = () => `bop-fade-${y0}-${y1}`;
  return mat;
}
const double = (mat) => {
  mat.side = THREE.DoubleSide;
  return mat;
};

/** A lathe of a closed profile of nP points that changes every frame (a rubber that swells, a ring that closes), half a turn, + its
 *  two cut faces fanned from a centre. write() fills R/Y (nP points) and (cr, cy) then rewrites positions and normals, no allocation. */
function makeDynRev(nP, segs) {
  const nL = (nP + 1) * (segs + 1);
  const nC = nP + 2;
  const total = nL + 2 * nC;
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const idx = [];
  for (let j = 0; j < nP; j++)
    for (let i = 0; i < segs; i++) {
      const a = j * (segs + 1) + i;
      const b = (j + 1) * (segs + 1) + i;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  for (let s = 0; s < 2; s++) {
    const o = nL + s * nC;
    for (let j = 0; j < nP; j++) idx.push(o, o + 1 + j, o + 2 + j);
  }
  const geo = new THREE.BufferGeometry();
  const pa = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  const na = new THREE.BufferAttribute(nor, 3).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("position", pa);
  geo.setAttribute("normal", na);
  geo.setIndex(idx);
  const R = new Float32Array(nP);
  const Y = new Float32Array(nP);
  function write(cr, cy) {
    for (let j = 0; j <= nP; j++) {
      const jj = j % nP;
      const jn = (jj + 1) % nP;
      const jp = (jj + nP - 1) % nP;
      const dr = R[jn] - R[jp];
      const dy = Y[jn] - Y[jp];
      for (let i = 0; i <= segs; i++) {
        const f = (Math.PI * i) / segs;
        const sn = Math.sin(f);
        const cs = Math.cos(f);
        const k = (j * (segs + 1) + i) * 3;
        pos[k] = R[jj] * sn;
        pos[k + 1] = Y[jj];
        pos[k + 2] = R[jj] * cs;
        let nx = -dy * sn;
        let ny = dr;
        let nz = -dy * cs;
        const l = Math.hypot(nx, ny, nz) || 1;
        nor[k] = nx / l;
        nor[k + 1] = ny / l;
        nor[k + 2] = nz / l;
      }
    }
    for (let s = 0; s < 2; s++) {
      const o = nL + s * nC;
      const sz = s ? -1 : 1;
      let area = 0;
      for (let j = 0; j <= nP + 0; j++) {
        const p = j === 0 ? -1 : (j - 1) % nP;
        const k = (o + j) * 3;
        pos[k] = 0;
        pos[k + 1] = p < 0 ? cy : Y[p];
        pos[k + 2] = sz * (p < 0 ? cr : R[p]);
      }
      const kl = (o + nP + 1) * 3; // the closing point
      pos[kl] = 0;
      pos[kl + 1] = Y[0];
      pos[kl + 2] = sz * R[0];
      for (let j = 0; j < nP; j++) {
        const a = (o + 1 + j) * 3;
        const b = (o + 2 + j) * 3;
        area += (pos[a + 1] - cy) * (pos[b + 2] - sz * cr) - (pos[a + 2] - sz * cr) * (pos[b + 1] - cy);
      }
      const nx = area >= 0 ? 1 : -1;
      for (let j = 0; j < nC; j++) {
        const k = (o + j) * 3;
        nor[k] = nx;
        nor[k + 1] = 0;
        nor[k + 2] = 0;
      }
    }
    pa.needsUpdate = true;
    na.needsUpdate = true;
  }
  return { geo, R, Y, write };
}

/* ── textures and the gas ── */
function glowTexture() {
  const N = 64;
  const data = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const r = Math.hypot((x + 0.5) / N - 0.5, (y + 0.5) / N - 0.5) * 2;
      const a = Math.min(1, Math.exp(-r * r * 26) * 0.9 + Math.exp(-r * 4.2) * 0.45) * (1 - smooth(0.82, 1, r));
      const k = (y * N + x) * 4;
      data[k] = data[k + 1] = data[k + 2] = 255;
      data[k + 3] = Math.round(a * 255);
    }
  const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
/** A streak (a rising bubble seen at speed): a soft vertical capsule, brightest at its head. */
function streakTexture() {
  const W = 16;
  const H = 64;
  const data = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const u = ((x + 0.5) / W - 0.5) * 2;
      const v = (y + 0.5) / H;
      const a = Math.exp(-u * u * 3.2) * smooth(0, 0.75, v) * (1 - smooth(0.86, 1, v)) * (0.45 + 0.55 * v);
      const k = (y * W + x) * 4;
      data[k] = data[k + 1] = data[k + 2] = 255;
      data[k + 3] = Math.round(a * 255);
    }
  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
/** A soft puff (the plume): a disc with a firm core and a soft rim. */
function puffTexture() {
  const N = 64;
  const data = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const r = Math.hypot((x + 0.5) / N - 0.5, (y + 0.5) / N - 0.5) * 2;
      const a = (1 - smooth(0.25, 1, r)) * 0.95;
      const k = (y * N + x) * 4;
      data[k] = data[k + 1] = data[k + 2] = 255;
      data[k + 3] = Math.round(a * 255);
    }
  const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
const spriteMat = (map, color, k, additive = true) =>
  new THREE.SpriteMaterial({
    map,
    color: new THREE.Color(color).multiplyScalar(k),
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    toneMapped: false,
    fog: false,
  });

/** The gas in the cut: one plane (x = 0.4, |z| < bore) that knows where the pipe is. Red in the annulus below the front, dimmed to
 *  uAbove above the lowest closed element; red inside the pipe (uInside, a slow pulse); a bright line at a moving front. */
function gasMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uFront: { value: 0 },
      uYClose: { value: 1e4 },
      uAbove: { value: 1 },
      uInside: { value: 0 },
      uOff: { value: 0 },
      uTop: { value: 1e4 },
      uColor: { value: RED.clone().multiplyScalar(1.2) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vP;
      void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uFront, uYClose, uAbove, uInside, uOff, uTop;
      uniform vec3 uColor;
      varying vec3 vP;
      ${BUMP_GLSL}
      void main() {
        float y = vP.y;
        float z = vP.z;
        if (y > uTop) discard;
        float c = uOff * bump(y);
        float d = abs(z - c);
        float bands = 0.5 + 0.5 * sin(y * 0.42 - uTime * 4.2);
        float a = 0.0;
        if (d < ${(PR - WALL - 0.08).toFixed(2)}) {
          float pulse = 0.7 + 0.3 * sin(uTime * 4.4);
          a = uInside * pulse * (0.8 + 0.2 * bands);
        } else if (d < ${(PR + 0.75).toFixed(2)}) {
          discard;
        } else {
          if (y > uFront) discard;
          float k = y < uYClose ? 1.0 : uAbove;
          float edge = 1.0 - smoothstep(${(BR - 0.7).toFixed(2)}, ${(BR - 0.05).toFixed(2)}, abs(z));
          float gap = smoothstep(${(PR + 0.75).toFixed(2)}, ${(PR + 1.3).toFixed(2)}, d);
          a = k * (0.26 + 0.12 * bands) * edge * gap;
          a += k * 0.9 * smoothstep(uFront - 2.4, uFront - 0.3, y) * step(uFront, 296.0) * edge;
        }
        a *= 1.0 - smoothstep(${FADE0.toFixed(1)}, ${FADE1.toFixed(1)}, y);
        if (a < 0.004) discard;
        gl_FragColor = vec4(uColor * (1.0 + 0.3 * bands), clamp(a, 0.0, 0.9));
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

export function buildBop() {
  const group = new THREE.Group();
  group.name = "bop";
  const mesh = (parent, geo, mat, x = 0, y = 0, z = 0, edges = true) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    if (edges) m.add(clayEdges(geo));
    parent.add(m);
    return m;
  };

  /* ── matters: three values of grey (dark frame, mid body, light pipe); each part that changes colour has its own ── */
  const frameMat = double(clay({ tone: -0.8 }));
  const bottleMat = clay({ tone: -0.6 });
  const bodyMat = double(clay({ tone: -0.42 }));
  const backMat = double(clay({ tone: -0.9 }));
  const ramMat = double(clay({ tone: -0.1 })); // the rams that never move (lower VBRs, CSR)
  const rubberMat = double(clay({ tone: -0.82 }));
  const vbrMat = double(clay({ tone: 0.3 }));
  const vbrSealMat = double(clay({ tone: -0.8 }));
  const bsrMat = double(clay({ tone: 0.85 }));
  const bsr2Mat = double(clay({ tone: 0.85 }));
  const ringMat = double(clay({ tone: 0.5 }));
  const annUpMat = double(alarm({ tone: -0.7, noOk: true })); // culprit 1
  const pipeMat = fadeUp(double(alarm({ tone: 1, noOk: true }))); // culprit 2 — the lightest piece
  const pipeInMat = fadeUp(double(alarm({ tone: 0.6, noOk: true })));
  const riserMat = fadeUp(double(clay({ tone: -0.45 })));
  const cableMat = fadeUp(clay({ tone: -0.7 }));
  const hoseMat = fadeUp(clay({ tone: -0.45 }));
  const podMat = double(clay({ tone: -0.15 }));
  const podInMat = clay({ tone: -0.78 });
  const lidMats = [clay({ tone: 0.15 }), clay({ tone: 0.15 })];
  const semMat = clay({ tone: -0.4 });
  const batteryMat = alarm({ tone: 0.3, noOk: true }); // culprit 3
  const valveMat = alarm({ tone: 0.4, noOk: true }); // culprit 4
  const coilMat = alarm({ tone: -0.45, noOk: true }); // the valve's coils: the same part (its red follows the valve)
  const pileMat = alarm({ tone: 0.7, noOk: true }); // culprit 5
  const termMat = clay({ tone: 0.6 });
  const lampMats = [clay({ tone: -0.2 }), clay({ tone: -0.2 })];
  const base = new Map(); // the clay colour of each material whose green is drawn here
  for (const m of [vbrMat, vbrSealMat, bsrMat, bsr2Mat, ringMat, ...lampMats]) base.set(m, m.color.clone());
  const setGreen = (mat, g) => {
    mat.color.copy(base.get(mat));
    if (g <= 0.001) {
      mat.emissive.setRGB(0, 0, 0);
      mat.emissiveIntensity = 0;
      return;
    }
    mat.color.lerp(GREEN_B, 0.6 * g);
    mat.emissive.copy(VEILLE);
    mat.emissiveIntensity = 0.75 * g;
  };

  /* ── the wellhead, its connector, the frame, the accumulators ── */
  mesh(group, halfRev([[BR, -2], [9.5, -2], [9.5, 8], [BR, 8]]), frameMat);
  mesh(group, halfRev([[BR, 8], [15.5, 8], [17, 9.5], [17, 16.5], [15.5, 18], [BR, 18]]), bodyMat);
  for (const s of [-1, 1]) {
    mesh(group, box(3.5, 88, 3.5, 0.3), frameMat, 27, 44, s * 33);
    mesh(group, box(27, 3, 3, 0.3), frameMat, 13.5, 2.5, s * 33);
    mesh(group, box(27, 3, 3, 0.3), frameMat, 13.5, 85.5, s * 33);
    for (const [x, z] of [[21, s * 24], [33, s * 15]]) mesh(group, lathe([[0, 0], [4.2, 0], [4.2, 46], [3.4, 49.5], [1.8, 51], [0, 51.4]], 40, { bevel: 0.5 }), bottleMat, x, 4, z);
  }
  mesh(group, box(3, 3, 69.5, 0.3), frameMat, 27, 2.5, 0);
  mesh(group, box(3, 3, 69.5, 0.3), frameMat, 27, 85.5, 0);

  /* ── the lower stack: plates with the half-round bore, five cavities, their rams and bonnets ── */
  const slabPts = [[0, -BODY_Z], [BODY_X, -BODY_Z], [BODY_X, BODY_Z], [0, BODY_Z], ...arcXZ(0, BR, 22).slice(0)];
  const levels = [...RAMS.vbr, RAMS.csr, RAMS.bsr];
  let yPrev = 18;
  for (const [yc, h] of levels) {
    const y0 = yc - h / 2;
    mesh(group, prismXZ(slabPts, y0 - yPrev), bodyMat, 0, yPrev, 0);
    mesh(group, prismXZ([[DEPTH + 0.4, -BODY_Z], [BODY_X, -BODY_Z], [BODY_X, BODY_Z], [DEPTH + 0.4, BODY_Z]], h), backMat, 0, y0, 0);
    yPrev = yc + h / 2;
  }
  mesh(group, prismXZ(slabPts, LMRP_Y - yPrev), bodyMat, 0, yPrev, 0);

  const bonnet = (parent, yc, h, mat = bodyMat) => {
    const ri = h / 2 + 0.1;
    const ro = ri + 1.3;
    for (const s of [-1, 1]) {
      const p = [[ri, 16], [ro, 16], [ro, 29.5], [ro - 0.8, 31], [0, 31], [0, 29.6], [ri, 29.6]].map(([r, a]) => [r, s * a]);
      mesh(parent, zRev(p), mat, 0, yc, 0);
    }
    return ri;
  };
  /** A rod and a piston behind a ram (local: the ram's back at z = −back, toward −z). */
  const driver = (g, back, ri, rod = 6) => {
    mesh(g, zRev([[0, -back - rod], [1.1, -back - rod], [1.1, -back], [0, -back]], 20), ramMat, 0, 0, 0, false);
    mesh(g, zRev([[0, -back - rod - 1.5], [ri - 0.25, -back - rod - 1.5], [ri - 0.25, -back - rod], [0, -back - rod]], 24), ramMat, 0, 0, 0);
  };
  /** A pipe ram, front at local z = 0 facing +z (the −z one; the +z one is its mirror): a notch around the pipe, a rubber packer. */
  const pipeRam = (h, bodyM, sealM) => {
    const g = new THREE.Group();
    const R = PR + 0.05;
    const hh = h - 0.6;
    const notch = [];
    for (let i = 0; i <= 12; i++) {
      const a = (Math.PI / 2) * (i / 12);
      notch.push([R * Math.cos(a), -R * Math.sin(a)]);
    }
    const packer = prismXZ([[0, -3.2], [DEPTH, -3.2], [DEPTH, 0], ...notch], hh - 1.6).translate(0, -(hh - 1.6) / 2, 0);
    mesh(g, packer, sealM);
    mesh(g, prismXZ([[0, -3.2], [DEPTH, -3.2], [DEPTH, -0.01], [R + 0.4, -0.01], [R + 0.4, -0.2], [0, -R - 0.2]], 0.8).translate(0, hh / 2 - 0.8, 0), bodyM, 0, 0, 0, false);
    mesh(g, prismXZ([[0, -3.2], [DEPTH, -3.2], [DEPTH, -0.01], [R + 0.4, -0.01], [R + 0.4, -0.2], [0, -R - 0.2]], 0.8).translate(0, -hh / 2, 0), bodyM, 0, 0, 0, false);
    const body = box(DEPTH, hh, 10, 0.3);
    mesh(g, body, bodyM, DEPTH / 2, 0, -8.2);
    return g;
  };
  /** A blade ram (the −z one, upper blade; the +z one is it turned half a turn about x): tip at local z = 0. */
  const bladeGeo = (half) =>
    prismZY([[-16, -half], [-8, -half], [-8, 0], [0, 0], [-2.2, half], [-16, half]], DEPTH);

  const rams = { vbr: [], bsr: [], bsr2: [] };
  levels.forEach(([yc, h], li) => {
    const ri = bonnet(group, yc, h);
    for (const s of [-1, 1]) {
      let g;
      if (li <= 2) {
        // the three VBR: only the upper one moves (and turns green)
        g = pipeRam(h, li === 2 ? vbrMat : ramMat, li === 2 ? vbrSealMat : rubberMat);
        driver(g, 13.2, ri);
        if (li === 2) rams.vbr.push(g);
      } else if (li === 3) {
        // the CSR: flat rams, grey, always open
        g = new THREE.Group();
        mesh(g, box(DEPTH, h - 0.6, 13.2, 0.3), ramMat, DEPTH / 2, 0, -6.6);
        driver(g, 13.2, ri);
      } else {
        g = new THREE.Group();
        mesh(g, bladeGeo(HB), bsrMat);
        driver(g, 16, ri, 3);
        rams.bsr.push(g);
      }
      g.position.set(0, yc, s * OPEN);
      if (s > 0) {
        if (li === 4) g.rotation.x = Math.PI; // the lower blade comes from +z
        else g.scale.z = -1;
      }
      group.add(g);
    }
  });

  /* ── `depuis`: the second shear-ram module (slides in from behind, the LMRP lifts), the centring ring under the blades ── */
  const mod2 = new THREE.Group();
  group.add(mod2);
  {
    const yc = LMRP_Y + 6.5;
    const h = 10;
    mesh(mod2, prismXZ(slabPts, 1.5), bodyMat, 0, LMRP_Y, 0);
    mesh(mod2, prismXZ(slabPts, 1.5), bodyMat, 0, yc + h / 2, 0);
    mesh(mod2, prismXZ([[DEPTH + 0.4, -BODY_Z], [BODY_X, -BODY_Z], [BODY_X, BODY_Z], [DEPTH + 0.4, BODY_Z]], h), backMat, 0, yc - h / 2, 0);
    const ri = bonnet(mod2, yc, h);
    for (const s of [-1, 1]) {
      const g = new THREE.Group();
      mesh(g, bladeGeo(h / 2 - 0.3), bsr2Mat);
      driver(g, 16, ri, 3);
      g.position.set(0, yc, s * OPEN);
      if (s > 0) g.rotation.x = Math.PI;
      mod2.add(g);
      rams.bsr2.push(g);
    }
  }
  void RAMS2; // RAMS2.bsr2 is met by the module above (its place freed by the LMRP's lift), RAMS2.ring by the ring below
  const RING_Y = [RAMS2.ring[0] - 2.3, RAMS2.ring[0] + 1.3]; // inside the plate under the BSR cavity
  const ringRev = makeDynRev(4, 32);
  const ring = mesh(group, ringRev.geo, ringMat, 0, 0, 0, false);
  ring.frustumCulled = false;

  /* ── the LMRP (lifts with `rams2`): connector, two annulars, the flex joint, the riser, its frame, the pods, the lines ── */
  const lmrp = new THREE.Group();
  group.add(lmrp);
  mesh(lmrp, halfRev([[BR, LMRP_Y], [18, LMRP_Y], [18, LMRP_Y + 2.6], [16.5, LMRP_Y + 4], [BR, LMRP_Y + 4]]), bodyMat);
  const annBody = (yc) => {
    const yb = yc - 8;
    const yt = yc + 8;
    return halfRev([[BR, yb], [17.5, yb], [17.5, yb + 2], [16.5, yb + 2.6], [16.5, yt - 4.6], [15.6, yt - 2.4, 1], [14, yt - 0.8, 1], [12.4, yt], [BR, yt], [BR, yc + 5.6], [14.2, yc + 5.6], [14.2, yc - 5.6], [BR, yc - 5.6]]);
  };
  for (const [yc] of RAMS.annular) mesh(lmrp, annBody(yc), bodyMat);
  mesh(lmrp, halfRev([[BR, 108], [14, 108], [14, 114], [BR, 114]]), bodyMat);
  mesh(lmrp, halfRev([[BR, 130], [12.8, 130], [12.8, 138], [BR, 138]]), bodyMat);
  mesh(lmrp, halfRev([[BR, Y_FLEX - 6], [15, Y_FLEX - 6], [15, Y_FLEX - 4.4], [16.6, Y_FLEX, 1], [15, Y_FLEX + 4.4], [12, Y_FLEX + 6], [BR, Y_FLEX + 6]]), bodyMat);
  mesh(lmrp, halfRev([[BR, 150], [10.6, 150], [10.6, 152.2], [9, 153.4], [9, RISER_BREAK], [BR, RISER_BREAK]]), riserMat);
  const riserTop = mesh(lmrp, halfRev([[BR, RISER_BREAK], [9, RISER_BREAK], [9, RISER_TOP], [BR, RISER_TOP]]), riserMat, 0, 0, 0, false);
  // the packers: the lower one never moves, the UPPER one swells onto the pipe (alarm clay: culprit 1)
  const NPK = 13;
  const packer = (yc, mat) => {
    const d = makeDynRev(NPK, 36);
    const m = mesh(lmrp, d.geo, mat, 0, 0, 0, false);
    m.frustumCulled = false;
    return { d, yc };
  };
  const packLow = packer(RAMS.annular[0][0], rubberMat);
  const packUp = packer(Y_ANN, annUpMat);
  const writePacker = ({ d, yc }, k, rc) => {
    for (let j = 0; j < 11; j++) {
      const u = -1 + (2 * j) / 10;
      d.R[j] = 7.15 - (7.15 - rc) * k * (1 - u * u);
      d.Y[j] = yc + 5.3 * u;
    }
    d.R[11] = 13.9;
    d.Y[11] = yc + 5.3;
    d.R[12] = 13.9;
    d.Y[12] = yc - 5.3;
    d.write(11.4, yc);
  };
  writePacker(packLow, 0, 7.15);
  // the LMRP frame and the pod brackets
  for (const s of [-1, 1]) {
    mesh(lmrp, box(3, 62, 3, 0.3), frameMat, 24, 119, s * 28);
    mesh(lmrp, box(24, 2.5, 2.5, 0.3), frameMat, 12, 149, s * 28);
    mesh(lmrp, box(5.4, 4, 8, 0.3), frameMat, 21.5, 112, s * 32);
  }
  mesh(lmrp, box(3, 3, 59, 0.3), frameMat, 24, 150.5, 0);

  // the pods: an open-front case, a panel hinged on its outer edge, and what is inside
  const [PX, PY] = PODS.at[0];
  const [SX, SY, SZ] = PODS.size;
  const lids = [];
  const lamps = [];
  PODS.at.forEach(([, , pz], i) => {
    const s = Math.sign(pz);
    mesh(lmrp, box(1.2, SY, SZ, 0.2), podMat, PX + SX / 2 - 0.6, PY, pz);
    mesh(lmrp, box(SX, 1.2, SZ, 0.2), podMat, PX, PY + SY / 2 - 0.6, pz);
    mesh(lmrp, box(SX, 1.2, SZ, 0.2), podMat, PX, PY - SY / 2 + 0.6, pz);
    mesh(lmrp, box(SX, SY, 1.2, 0.2), podMat, PX, PY, pz - SZ / 2 + 0.6);
    mesh(lmrp, box(SX, SY, 1.2, 0.2), podMat, PX, PY, pz + SZ / 2 - 0.6);
    mesh(lmrp, box(0.4, SY - 2.6, SZ - 2.6, 0.1), podInMat, PX + SX / 2 - 1.4, PY, pz, false);
    const pivot = new THREE.Object3D();
    pivot.position.set(PX - SX / 2, PY, pz + s * (SZ / 2));
    lmrp.add(pivot);
    mesh(pivot, box(1, SY - 0.4, SZ - 0.4, 0.25), lidMats[i], -0.5, 0, -s * (SZ / 2 - 0.2));
    mesh(pivot, box(0.8, 5, 1.4, 0.2), frameMat, -1.3, 0, -s * (SZ - 3));
    lids.push({ pivot, s });
    const lamp = mesh(lmrp, new THREE.SphereGeometry(1.5, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), lampMats[i], PX - SX / 2 + 3.2, PY + SY / 2, pz, false);
    lamps.push(lamp);
  });
  const zB = PODS.at[0][2];
  const zV = PODS.at[1][2];
  // the battery pod (−z): the 27 V battery, its amber gauge, two electronics boxes
  const battery = mesh(lmrp, box(7, 15, 12, 0.5), batteryMat, PX, PY - 2, zB);
  for (const dz of [-3, 3]) mesh(lmrp, new THREE.CylinderGeometry(0.9, 0.9, 1.6, 16), termMat, PX, PY + 6.3, zB + dz, false);
  mesh(lmrp, box(0.5, 11.4, 3, 0.15), podInMat, PX - 3.7, PY - 2, zB + 3.4, false);
  const gaugeGeo = new THREE.BoxGeometry(0.5, 10.4, 2.1).translate(0, 5.2, 0);
  const gaugeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(RECON.ambre).multiplyScalar(1.3), toneMapped: false });
  const gauge = new THREE.Mesh(gaugeGeo, gaugeMat);
  gauge.position.set(PX - 4.05, PY - 7.2, zB + 3.4);
  lmrp.add(gauge);
  for (const dz of [-4.2, 3.8]) mesh(lmrp, box(8, 5, 6, 0.3), semMat, PX + 1, PY + 10, zB + dz);
  // the valve pod (+z): the solenoid valve, its two coils and their opposed field arrows, the 9 V pile wired to it
  const valve = mesh(lmrp, new THREE.CylinderGeometry(2.4, 2.4, 19, 24), valveMat, PX, PY, zV - 2);
  const COIL_Y = [PY + 4.5, PY - 4.5];
  for (const y of COIL_Y) mesh(lmrp, new THREE.CylinderGeometry(3.9, 3.9, 4.6, 28), coilMat, PX, y, zV - 2);
  const arrowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(RECON.papier).multiplyScalar(1.25), toneMapped: false });
  const arrowGeo = mergeGeometries([new THREE.CylinderGeometry(0.42, 0.42, 4, 10).translate(0, -1, 0), new THREE.ConeGeometry(1.15, 2.2, 14).translate(0, 2.1, 0)]);
  const arrows = COIL_Y.map((y, i) => {
    const a = new THREE.Mesh(arrowGeo, arrowMat);
    a.position.set(PX - 5.2, y, zV - 2);
    if (i) a.rotation.z = Math.PI; // the second coil's field points the other way
    lmrp.add(a);
    return a;
  });
  const pile = mesh(lmrp, box(4.4, 7.6, 5.6, 0.35), pileMat, PX - 1, PY - 8, zV + 6);
  mesh(lmrp, new THREE.CylinderGeometry(0.85, 0.85, 1.2, 16), termMat, PX - 1, PY - 3.6, zV + 4.8, false);
  mesh(lmrp, new THREE.CylinderGeometry(1.0, 1.0, 1.2, 6), termMat, PX - 1, PY - 3.6, zV + 7.2, false);
  const wire = new THREE.CatmullRomCurve3([[PX - 1, PY - 3, zV + 4.8], [PX - 3, PY - 1, zV + 3], [PX - 3.5, PY - 3.5, zV + 1.6], [PX - 2.6, COIL_Y[1], zV + 1.4]].map((p) => new THREE.Vector3(...p)));
  mesh(lmrp, new THREE.TubeGeometry(wire, 24, 0.32, 8), cableMat, 0, 0, 0, false);

  // the lines down the riser: two control cables (pulses of light while the surface talks) and two hoses
  const pulseMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uLink: { value: 1 }, uLen: { value: 200 }, uColor: { value: new THREE.Color(RECON.papier) } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying float vY;
      void main() { vUv = uv; vY = (modelMatrix * vec4(position, 1.0)).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uLink, uLen; uniform vec3 uColor; varying vec2 vUv; varying float vY;
      void main() {
        float ph = fract(vUv.x * uLen / 16.0 - uTime * 1.1);
        float dash = smoothstep(0.0, 0.06, ph) * (1.0 - smoothstep(0.16, 0.26, ph));
        float a = uLink * (0.25 + 0.9 * dash) * (1.0 - smoothstep(${FADE0.toFixed(1)}, ${FADE1.toFixed(1)}, vY));
        gl_FragColor = vec4(uColor * 1.2 * a, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const pulses = [];
  for (const s of [-1, 1]) {
    const c = new THREE.CatmullRomCurve3([[5, RISER_TOP, s * 12.5], [5, 162, s * 12.5], [6, 147, s * 22], [6, 136, s * 40], [6, PY + SY / 2 + 0.2, s * 44]].map((p) => new THREE.Vector3(...p)));
    mesh(lmrp, new THREE.TubeGeometry(c, 90, 0.9, 10), cableMat, 0, 0, 0, false);
    const p = new THREE.Mesh(new THREE.TubeGeometry(c, 90, 1.02, 10), pulseMat);
    p.renderOrder = 4;
    lmrp.add(p);
    pulses.push(p);
    pulseMat.uniforms.uLen.value = c.getLength();
    const h = new THREE.CatmullRomCurve3([[11.5, RISER_TOP, s * 10], [11.5, 162, s * 10], [13, 146, s * 21], [13, 135, s * 37], [13, PY + SY / 2 + 0.2, s * 41]].map((p) => new THREE.Vector3(...p)));
    mesh(lmrp, new THREE.TubeGeometry(h, 90, 1.3, 10), hoseMat, 0, 0, 0, false);
  }

  /* ── the drill pipe: half a tube (its inside seen), rewritten when its shape changes ── */
  const YS = [];
  for (let y = -2; y < 70; y += 2) YS.push(y);
  for (let y = 70; y < 84; y += 0.2) YS.push(+y.toFixed(2));
  for (let y = 84; y <= RISER_TOP + 0.01; y += 2.5) YS.push(y);
  const NR = YS.length;
  const NT = 12;
  const NO = NR * (NT + 1);
  const pipeGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array((2 * NO + 4 * NR) * 3);
  const pNor = new Float32Array((2 * NO + 4 * NR) * 3);
  {
    const idx = [];
    for (const off of [0, NO])
      for (let i = 0; i < NR - 1; i++)
        for (let k = 0; k < NT; k++) {
          const a = off + i * (NT + 1) + k;
          const b = a + NT + 1;
          idx.push(a, b, a + 1, b, b + 1, a + 1);
        }
    for (let s = 0; s < 2; s++)
      for (let i = 0; i < NR - 1; i++) {
        const o = 2 * NO + (s * NR + i) * 2;
        if (s) idx.push(o, o + 2, o + 1, o + 2, o + 3, o + 1);
        else idx.push(o, o + 1, o + 2, o + 2, o + 1, o + 3);
      }
    pipeGeo.setIndex(idx);
    pipeGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3).setUsage(THREE.DynamicDrawUsage));
    pipeGeo.setAttribute("normal", new THREE.BufferAttribute(pNor, 3).setUsage(THREE.DynamicDrawUsage));
    pipeGeo.addGroup(0, (NR - 1) * NT * 6, 0); // outside
    pipeGeo.addGroup((NR - 1) * NT * 6, (NR - 1) * NT * 6, 1); // inside
    pipeGeo.addGroup(2 * (NR - 1) * NT * 6, 2 * (NR - 1) * 6, 0);
  }
  const pipe = new THREE.Mesh(pipeGeo, [pipeMat, pipeInMat]);
  pipe.castShadow = pipe.receiveShadow = true;
  pipe.frustumCulled = false;
  group.add(pipe);
  const COS = new Float32Array(NT + 1);
  const SIN = new Float32Array(NT + 1);
  for (let k = 0; k <= NT; k++) {
    const t = -Math.PI / 2 + (Math.PI * k) / NT;
    COS[k] = Math.cos(t);
    SIN[k] = Math.sin(t);
  }
  const shape = { off: NaN, t1: NaN, t2: NaN, cut: NaN, top: NaN, pinch: NaN };
  /** off: the bow · t1, t2: the blades' tips · cut: the clean cut 0 → 1 (the upper piece rises 2.5 cm) · top: nothing above · pinch:
   *  how hard the closed blades crush an off-centre pipe (its waist goes down to 1.9 cm at the blades) */
  function writePipe(off, t1, t2, cut, top, pinch) {
    if (shape.off === off && shape.t1 === t1 && shape.t2 === t2 && shape.cut === cut && shape.top === top && shape.pinch === pinch) return;
    shape.off = off;
    shape.t1 = t1;
    shape.t2 = t2;
    shape.cut = cut;
    shape.top = top;
    shape.pinch = pinch;
    const waist = lerp(2 * PR, 1.9, pinch);
    for (let i = 0; i < NR; i++) {
      const y0 = YS[i];
      const y = y0 > YB + HB ? y0 + 6 * cut : y0;
      const c = off * bump(y0);
      let zMin = c - PR;
      let zMax = c + PR;
      let gone = y > top;
      const upper = y0 >= YB && y0 <= YB + HB;
      const lower = y0 >= YB - HB && y0 < YB;
      if (upper) {
        zMin = Math.max(zMin, t1 + 0.06);
        zMax = Math.min(zMax, zMin + waist);
      }
      if (lower) {
        zMax = Math.min(zMax, t2 - 0.06);
        zMin = Math.max(zMin, zMax - waist);
      }
      if ((upper || lower) && cut > 0.5) gone = true;
      if (zMax - zMin < 0.35) gone = true;
      let cc = (zMin + zMax) / 2;
      let zr = (zMax - zMin) / 2;
      let xr = PR + (PR - zr) * 0.6;
      let zi = Math.max(0.08, zr - WALL);
      let xi = Math.max(0.08, xr - WALL);
      if (gone) zr = xr = zi = xi = 0;
      for (let k = 0; k <= NT; k++) {
        const o = (i * (NT + 1) + k) * 3;
        const q = o + NO * 3;
        pPos[o] = xr * COS[k];
        pPos[o + 1] = y;
        pPos[o + 2] = cc + zr * SIN[k];
        pPos[q] = xi * COS[k];
        pPos[q + 1] = y;
        pPos[q + 2] = cc + zi * SIN[k];
        const nx = COS[k] / Math.max(xr, 0.05);
        const nz = SIN[k] / Math.max(zr, 0.05);
        const l = Math.hypot(nx, nz) || 1;
        pNor[o] = pNor[q] = nx / l;
        pNor[o + 1] = pNor[q + 1] = 0;
        pNor[o + 2] = pNor[q + 2] = nz / l;
      }
      for (let s = 0; s < 2; s++) {
        const sg = s ? 1 : -1;
        const o = (2 * NO + (s * NR + i) * 2) * 3;
        pPos[o] = 0;
        pPos[o + 1] = y;
        pPos[o + 2] = cc + sg * zr;
        pPos[o + 3] = 0;
        pPos[o + 4] = y;
        pPos[o + 5] = cc + sg * zi;
        pNor[o] = pNor[o + 3] = -1;
        pNor[o + 1] = pNor[o + 2] = pNor[o + 4] = pNor[o + 5] = 0;
      }
    }
    pipeGeo.attributes.position.needsUpdate = true;
    pipeGeo.attributes.normal.needsUpdate = true;
  }

  /* ── the gas: the plane in the cut, the streaks, the jet from the hole, the plume ── */
  const gasMat = gasMaterial();
  const gas = new THREE.Mesh(new THREE.PlaneGeometry(2 * BR, SPAN + 6).rotateY(-Math.PI / 2).translate(0.4, (SPAN + 6) / 2 - 3, 0), gasMat);
  gas.renderOrder = 3;
  gas.frustumCulled = false;
  group.add(gas);
  const glowTex = glowTexture();
  const streakTex = streakTexture();
  const puffTex = puffTexture();
  const N_B = 84;
  const bubbleMat = spriteMat(streakTex, RECON.alarme, 1.9);
  const bubbles = [];
  for (let i = 0; i < N_B; i++) {
    const sp = new THREE.Sprite(bubbleMat);
    sp.renderOrder = 5;
    group.add(sp);
    bubbles.push(sp);
  }
  const N_IN = 12;
  const innerMat = spriteMat(streakTex, RECON.alarme, 1.7);
  const inners = [];
  for (let i = 0; i < N_IN; i++) {
    const sp = new THREE.Sprite(innerMat);
    sp.renderOrder = 5;
    group.add(sp);
    inners.push(sp);
  }
  const hole = new THREE.Sprite(spriteMat(glowTex, RECON.alarme, 2.0));
  hole.renderOrder = 6;
  group.add(hole);
  const holeCore = new THREE.Sprite(spriteMat(glowTex, RECON.papier, 1.5)); // where the blade meets the pipe: white-hot
  holeCore.renderOrder = 7;
  group.add(holeCore);
  const N_J = 18;
  const jetMat = spriteMat(streakTex, RECON.alarme, 2.4);
  const jets = [];
  for (let i = 0; i < N_J; i++) {
    const sp = new THREE.Sprite(jetMat);
    sp.renderOrder = 6;
    group.add(sp);
    jets.push(sp);
  }
  const N_P = 30;
  const puffs = [];
  for (let i = 0; i < N_P; i++) {
    const m = spriteMat(puffTex, RECON.alarme, 1, false);
    const sp = new THREE.Sprite(m);
    sp.renderOrder = 6;
    group.add(sp);
    puffs.push(sp);
  }
  const plumeCore = new THREE.Sprite(spriteMat(glowTex, RECON.alarme, 1.8));
  plumeCore.renderOrder = 7;
  group.add(plumeCore);
  const lampGlow = lamps.map((l) => {
    const sp = new THREE.Sprite(spriteMat(glowTex, RECON.veille, 1.6));
    sp.position.set(l.position.x - 0.6, l.position.y + 0.9, l.position.z);
    sp.renderOrder = 6;
    lmrp.add(sp);
    return sp;
  });

  /* ── the anchors ── */
  const A = {};
  const anchor = (name, x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    group.add(o);
    A[name] = o;
  };
  anchor("focus", 0, 88, 0);
  anchor("fault", 0, BUCKLE.y, 0);
  anchor("annular", 0, Y_ANN, 0);
  anchor("vbr", 0, YV, 0);
  anchor("bsr", 0, YB, 0);
  anchor("pipeBend", 0, BUCKLE.y, 0);
  anchor("podBattery", PX, PY, zB);
  anchor("podValve", PX, PY, zV);
  anchor("battery", battery.position.x, battery.position.y, battery.position.z);
  anchor("valve", valve.position.x, valve.position.y, valve.position.z);
  anchor("pile", pile.position.x, pile.position.y, pile.position.z);
  anchor("riser", 0, 150, 0);
  anchor("plume", 0, RISER_BREAK, 0);
  const lmrpAnchors = ["annular", "podBattery", "podValve", "battery", "valve", "pile", "riser", "plume"].map((n) => [A[n], A[n].position.y]);

  const band = (y, yc, h, k) => k > 0.6 && Math.abs(y - yc) < h / 2 + 0.8;
  const ringState = { k: NaN };
  const packState = { k: NaN, rc: NaN };

  return {
    group,
    A,
    haloR: 34,
    update(S, time) {
      const annular = clamp01(S.annular);
      const vbr = clamp01(S.vbr);
      const bsr = clamp01(S.bsr);
      const flow = clamp01(S.flow);
      const pass = clamp01(S.pass);
      const inside = clamp01(S.inside);
      const rams2 = clamp01(S.rams2);
      const ringK = clamp01(S.ring);
      const shear = clamp01(S.shear);
      const plumeK = clamp01(S.plume);
      const ok = Math.max(clamp01(S.ok), clamp01(S.depuis));
      const c = Math.round(S.culprit);
      const fault = clamp01(S.fault);

      // the LMRP lifts, the second module slides in from behind
      const lift = LIFT2 * smooth(0, 0.55, rams2);
      lmrp.position.y = lift;
      mod2.visible = rams2 > 0.01;
      mod2.position.x = 70 * (1 - smooth(0.4, 1, rams2));
      for (let i = 0; i < lmrpAnchors.length; i++) lmrpAnchors[i][0].position.y = lmrpAnchors[i][1] + lift;

      // the pipe's offset, the blades' tips, the cut
      const off = BUCKLE.off * clamp01(S.buckle) * (1 - ringK);
      const bk = smooth(0.3, 0.8, off / BUCKLE.off);
      const t1 = lerp(-OPEN, 4, bsr);
      const t2 = lerp(OPEN, lerp(-4, off * bump(YB - 3) + PR - 0.5, bk), bsr);
      const top = plumeK > 0.01 ? RISER_BREAK + lift : 1e4;
      writePipe(off, t1, t2, shear, top, bk * smooth(0.5, 0.97, bsr) * (1 - shear));
      A.pipeBend.position.z = off;
      const pierce = bk * smooth(0.75, 0.97, bsr) * (1 - shear);

      // the rams
      const fv = lerp(OPEN, 0, vbr);
      rams.vbr[0].position.z = -fv;
      rams.vbr[1].position.z = fv;
      rams.bsr[0].position.z = t1;
      rams.bsr[1].position.z = t2;

      // the upper annular swells onto the pipe (it leaves a gap when it is the culprit); the centring ring closes
      const rc = PR + 0.12 + Math.abs(off * bump(Y_ANN)) + (c === CULPRIT.bop.annular ? 0.5 : 0);
      if (packState.k !== annular || packState.rc !== rc) {
        packState.k = annular;
        packState.rc = rc;
        writePacker(packUp, annular, rc);
      }
      ring.visible = ringK > 0.01;
      if (ring.visible && ringState.k !== ringK) {
        ringState.k = ringK;
        const ri = lerp(BR - 0.15, PR + 0.08, ringK);
        ringRev.R[0] = ringRev.R[3] = ri;
        ringRev.R[1] = ringRev.R[2] = BR - 0.05;
        ringRev.Y[0] = ringRev.Y[1] = RING_Y[0];
        ringRev.Y[2] = ringRev.Y[3] = RING_Y[1];
        ringRev.write((ri + BR) / 2, (RING_Y[0] + RING_Y[1]) / 2);
      }

      // the gas: under the lowest closed element always, above it × pass
      let yClose = 1e4;
      let cl = 0;
      if (vbr > 0.6) (yClose = YV), (cl = vbr);
      else if (bsr > 0.6) (yClose = YB), (cl = bsr);
      else if (annular > 0.6) (yClose = Y_ANN + lift), (cl = annular);
      const above = lerp(1, pass, smooth(0.6, 0.95, cl));
      const front = flow * (SPAN + 5) - 2;
      const u = gasMat.uniforms;
      u.uTime.value = time;
      u.uFront.value = flow > 0.001 ? front : -10;
      u.uYClose.value = yClose;
      u.uAbove.value = above;
      u.uInside.value = inside;
      u.uOff.value = off;
      u.uTop.value = top;
      for (let i = 0; i < N_B; i++) {
        const sp = bubbles[i];
        const speed = 16 + 14 * hash(i, 1);
        const y = ((hash(i, 2) * SPAN + time * speed) % SPAN) - 2;
        const cy = off * bump(y);
        const side = hash(i, 3) < 0.5 ? -1 : 1;
        const zIn = cy + side * (PR + 0.7);
        const zOut = side * (BR - 0.7);
        let k = y > front || y > top ? 0 : y < yClose ? 1 : above;
        if ((zOut - zIn) * side < 0.2) k = 0;
        if (band(y, YV, 9, vbr) || band(y, YB, 11, bsr) || band(y, Y_ANN + lift, 12, annular)) k = 0;
        k *= flow > 0.001 ? 1 - smooth(FADE0 - 10, FADE1 - 20, y) : 0;
        sp.visible = k > 0.02;
        if (!sp.visible) continue;
        const s = Math.sqrt(k);
        sp.position.set(0.1, y, lerp(zIn, zOut, hash(i, 4)));
        sp.scale.set(1.15 * s, 4.6 * s, 1);
      }
      for (let i = 0; i < N_IN; i++) {
        const sp = inners[i];
        const speed = 30 + 16 * hash(i, 11);
        const y = ((hash(i, 12) * SPAN + time * speed) % SPAN) - 2;
        let k = y > top ? 0 : inside;
        if ((y > YB - HB - 0.5 && y < YB + HB + 0.5 && (shear > 0.5 || bsr > 0.6)) || y < 2) k = 0;
        k *= 1 - smooth(FADE0 - 10, FADE1 - 20, y);
        sp.visible = k > 0.02;
        if (!sp.visible) continue;
        const s = Math.sqrt(k);
        sp.position.set(0.1, y, off * bump(y) + (hash(i, 13) - 0.5) * 1.6);
        sp.scale.set(0.6 * s, 2.8 * s, 1);
      }
      // the hole the upper blade bites into the off-centre pipe, and the jet out of it (× pass)
      const jk = pierce * (0.35 + 0.65 * pass);
      hole.visible = holeCore.visible = jk > 0.01;
      if (hole.visible) {
        hole.position.set(-0.3, YB + 2.4, t1 + 0.4);
        holeCore.position.set(-0.4, YB + 2.4, t1 + 0.4);
        const br = 0.85 + 0.15 * Math.sin(time * 4.4);
        hole.scale.setScalar(14 * jk * br);
        holeCore.scale.setScalar(3.6 * jk * br);
      }
      for (let i = 0; i < N_J; i++) {
        const sp = jets[i];
        const life = 0.9;
        const a = ((time / life + hash(i, 21)) % 1 + 1) % 1;
        const k = pierce * pass * (1 - a) * smooth(0, 0.1, a);
        sp.visible = k > 0.02;
        if (!sp.visible) continue;
        sp.position.set(-0.2, YB + 2.4 + 44 * a, t1 + 0.6 + (1.5 + 9 * hash(i, 22)) * a);
        sp.scale.set(2.0 * (0.6 + 0.4 * k), 8 * k + 0.5, 1);
      }
      // the leak after: the riser broken off, a red plume that billows and drifts with the current
      riserTop.visible = plumeK < 0.01;
      plumeCore.visible = plumeK > 0.01;
      const yP = RISER_BREAK + lift;
      if (plumeCore.visible) {
        plumeCore.position.set(0, yP + 1.5, 0);
        plumeCore.scale.setScalar(20 * plumeK);
      }
      for (let i = 0; i < N_P; i++) {
        const sp = puffs[i];
        const L = 7;
        const a = ((time / L + i / N_P + 0.37 * hash(i, 31)) % 1 + 1) % 1;
        const y = yP + 58 * a + 18 * a * a;
        let k = plumeK * 0.78 * smooth(0, 0.08, a) * (1 - smooth(0.55, 1, a)) * (1 - smooth(300, 345, y));
        sp.visible = k > 0.01;
        if (!sp.visible) continue;
        sp.position.set(2 + 6 * a * hash(i, 32), y, (8 + 70 * a) * a * (0.6 + 0.8 * hash(i, 33)) + (hash(i, 34) - 0.5) * 16 * a);
        sp.scale.setScalar((9 + 46 * a) * (0.8 + 0.4 * hash(i, 35)) * plumeK);
        sp.material.opacity = k;
        sp.material.color.copy(RED).multiplyScalar(1.5 - 0.7 * a);
      }

      // the pods: panels, lamps, the gauge, the field arrows; the lines from the surface
      const open = 1.75 * smooth(0, 1, clamp01(S.podOpen));
      for (let i = 0; i < lids.length; i++) lids[i].pivot.rotation.y = lids[i].s * open;
      const amf = clamp01(S.amf);
      for (let i = 0; i < lamps.length; i++) {
        setGreen(lampMats[i], 0);
        lampMats[i].emissive.copy(VEILLE);
        lampMats[i].emissiveIntensity = 1.4 * amf;
        lampGlow[i].visible = amf > 0.02;
        lampGlow[i].scale.setScalar(9 * amf * (0.92 + 0.08 * Math.sin(time * 2.2 + i)));
      }
      gauge.scale.y = Math.max(0.001, clamp01(S.charge));
      gauge.visible = S.charge > 0.002;
      const coils = clamp01(S.coils);
      for (let i = 0; i < arrows.length; i++) {
        arrows[i].visible = coils > 0.02;
        arrows[i].scale.setScalar(Math.max(0.001, smooth(0, 1, coils)));
      }
      pulseMat.uniforms.uTime.value = time;
      pulseMat.uniforms.uLink.value = clamp01(S.link);

      // the green of the seals that close and hold; the culprit in red, one at a time
      setGreen(vbrMat, ok * vbr);
      setGreen(vbrSealMat, ok * vbr);
      setGreen(bsrMat, ok * bsr * (1 - bk * (1 - shear))); // blades on an off-centre pipe do not seal: no green
      setGreen(bsr2Mat, ok * rams2);
      setGreen(ringMat, ok * ringK);
      if (c === CULPRIT.bop.annular) setAlarm(annUpMat, fault);
      else {
        setAlarm(annUpMat, 0);
        const g = ok * annular;
        if (g > 0.001) {
          annUpMat.color.lerp(GREEN_B, 0.6 * g);
          annUpMat.emissive.copy(VEILLE);
          annUpMat.emissiveIntensity = 0.75 * g;
        }
      }
      const pk = c === CULPRIT.bop.pipe ? fault : 0;
      const ph = c === CULPRIT.bop.pipe ? clamp01(S.depuis) * ringK : 0;
      setAlarm(pipeMat, pk);
      setAlarm(pipeInMat, pk);
      heal(pipeMat, ph);
      heal(pipeInMat, ph);
      if (pk <= 0.001 && ph <= 0.001)
        for (let i = 0; i < 2; i++) {
          const m = i ? pipeInMat : pipeMat;
          m.emissive.copy(PAPER);
          m.emissiveIntensity = i ? 0.1 : 0.16;
        }
      setAlarm(batteryMat, c === CULPRIT.bop.battery ? fault : 0);
      setAlarm(valveMat, c === CULPRIT.bop.valve ? fault : 0);
      setAlarm(coilMat, c === CULPRIT.bop.valve ? fault : 0);
      setAlarm(pileMat, c === CULPRIT.bop.pile ? fault : 0);
      let at = A.bsr;
      if (c === CULPRIT.bop.annular) at = A.annular;
      else if (c === CULPRIT.bop.pipe) at = A.pipeBend;
      else if (c === CULPRIT.bop.battery) at = A.battery;
      else if (c === CULPRIT.bop.valve) at = A.valve;
      else if (c === CULPRIT.bop.pile) at = A.pile;
      A.fault.position.copy(at.position);
    },
  };
}
