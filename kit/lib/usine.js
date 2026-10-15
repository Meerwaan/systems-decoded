// THE FACTORY KIT, part 1 — the long format's machines that HOLD the glass: the furnace (also the lehr's tunnel and
// the bending / tempering ovens), the vat (flat: the tin bath · cylinder: the autoclave), the roller conveyor. Seen
// like an X-ray: shells of glass and fine edge lines, never solid — the product they make is the one solid thing of
// the picture, and it is what LIGHTS them: the heat inside a machine colours its own shell (signal), from inside.
// They read NO episode file: an episode hands them their sizes (its plan.js) and drives them every frame with
// `set({…})`, numbers only, depending on nothing but what it is given.
//
// Each block: origin at its upstream end (x = 0), on the floor (y = 0), on the line's axis (z = 0); it extends
// toward +x. `amount` (0–1) fades the whole block (0 hides it). Every option below has a default that builds a
// credible machine; changing them gives ANOTHER machine (a long must never look like a template with a new object):
// see docs/journal/L01-usine.md for the catalogue and examples.
//
//   makeFurnace({ length, half, height, tunnel, hopper, …options }) → { group, A, set({ amount, glow, batch, open, time }) }
//       a long vault (tunnel: low and open at both ends, the conveyor's rollers run through it); `glow` its fire
//       inside (signal, 0–1); `hopper`: a funnel at x = hopper.x up to hopper.top, its mouth at hopper.mouth;
//       `batch` the raw materials falling in it (0–1); `open` its exit door / tweel (0 shut → 1 open);
//       `time` (optional, s) lets the flames breathe and the batch fall in real time. A: { mouth, exit }
//       options: kind ("melter" | "oven" | "lehr"), roof ("arch" | "flat"), crown, wall, melt, fire ("burners" |
//       "elements" | "none"), burners, firing, elements, windows, bays, zones, fans, ends, slot, spout, canal,
//       doghouse, lift, stack, hot, lines, rim
//   makeVat({ shape: "flat", length, half, level, hood, …options }) → { group, A, set({ amount, shine, heat }) }
//       the tin bath: a tray, the liquid tin's mirror at y = level (`shine`), its hood above (nitrogen + hydrogen);
//       `heat` its glow, hot (signal) at the entry → cold at the exit
//       options: tray, bay, ports, ribbon, spread, pipes, atmo, exitBox, lines
//   makeVat({ shape: "cylinder", length, radius, axisY, …options }) → { group, A, set({ amount, door, pressure }) }
//       the autoclave: a drum lying along x, its door at x = 0 (`door` 0 open → 1 shut), `pressure` heat inside (0–1)
//       options: head ("dished" | "flat"), hinge ("far" | "near"), lugs, bolts, bands, saddles, gauge, window, pipes, rails
//   makeConveyor({ from, to, half, y, pitch, gaps, …options }) → { group, set({ amount, roll, heat }) }
//       rollers across the line every `pitch` cm from x = from to x = to (gaps: [[x0, x1]…] where a station has its
//       own floor); `roll` = cm travelled by what they carry (only grows): they turn by roll / radius
//       options: radius, rails, legs, warm ([[x0, x1, k]…] where hot glass lights them), mark, lines
//
//   xray(geometry, opts) → Mesh: a piece of X-ray (glass shell + edges), `mesh.userData.fade(a)`;
//       opts.heat = (x, y, z) => 0–1 bakes where it takes the colour of a fire; then `mesh.userData.heat(h)`.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "./brand.js";
import { glass, glow, edgesOf, lineMat, setGlow, asShell, mergeGeometries, SOFTBOX } from "./build3d.js";
import { rng } from "./rng.js";

const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  if (b <= a) return x >= b ? 1 : 0;
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ───────────────────────────── shaders ───────────────────────────── */

// the studio's softbox, as build3d.js sees it (glass mirrors it)
const BOX = (() => {
  const c = new THREE.Vector3(...SOFTBOX.pos);
  const d = c.length();
  c.normalize();
  const u = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), c).normalize();
  return { c, u, v: new THREE.Vector3().crossVectors(c, u), size: new THREE.Vector3(SOFTBOX.w / 2, SOFTBOX.h / 2, d) };
})();
const boxUniforms = () => ({ uBoxC: { value: BOX.c }, uBoxU: { value: BOX.u }, uBoxV: { value: BOX.v }, uBoxSize: { value: BOX.size } });

/** The heat along a station: rises from `inL` at x = 0 to 1 at h0, holds to h1, falls to `outL` at L (cm). */
function profileAt(x, L, p) {
  if (x < p.h0) return p.inL + (1 - p.inL) * smooth(0, p.h0, x);
  if (x > p.h1) return 1 + (p.outL - 1) * smooth(p.h1, L, x);
  return 1;
}
const PROF_GLSL = /* glsl */ `
  uniform vec4 uProf; uniform float uLen;
  float prof(float x) {
    float a = uProf.x > 0.5 ? mix(uProf.z, 1.0, smoothstep(0.0, uProf.x, x)) : 1.0;
    float b = mix(1.0, uProf.w, smoothstep(uProf.y, max(uLen, uProf.y + 1.0), x));
    return x < uProf.x ? a : b;
  }`;
const profUniforms = (L, p) => ({ uLen: { value: L }, uProf: { value: new THREE.Vector4(p.h0, p.h1, p.inL, p.outL) } });

// the glass of build3d.js, plus a baked heat (attribute aHeat) that takes the colour of a fire: the shell lit from inside
const GLASS_FRAG_HEAD = /* glsl */ `
  uniform vec3 uColor, uHot, uBoxC, uBoxU, uBoxV, uBoxSize;
  uniform float uBase, uRim, uPower, uAmount, uEdge, uSpec, uGain, uHeat, uHeatBase, uHeatRim;
  float glassLight(vec3 n, vec3 v, out float g) {
    float facing = dot(n, v);
    g = clamp(1.0 - abs(facing), 0.0, 1.0);
    float light = uBase + uRim * pow(g, uPower) + uEdge * smoothstep(0.6, 0.97, g);
    if (uSpec > 0.0) {
      vec3 r = (vec4(reflect(-v, facing < 0.0 ? -n : n), 0.0) * viewMatrix).xyz;
      float toward = dot(r, uBoxC);
      vec3 p = r * (uBoxSize.z / max(toward, 1e-3));
      vec2 q = abs(vec2(dot(p, uBoxU), dot(p, uBoxV))) / uBoxSize.xy;
      light += uSpec * (0.3 + 0.7 * g) * smoothstep(0.0, 0.3, toward) * (1.0 - smoothstep(0.2, 1.9, length(q)));
    }
    return light;
  }
  vec3 heatLight(float h, float g) {
    return uHot * h * (uHeatBase + uHeatRim * uRim * pow(g, uPower) + 0.9 * uEdge * smoothstep(0.6, 0.97, g));
  }`;
function glassUniforms(color, { base = 0.003, rim = 0.2, power = 2.6, edge = 0.38, spec = 0, heatBase = 0.02, heatRim = 1.6 } = {}) {
  return {
    uColor: { value: new THREE.Color(color) }, uHot: { value: SIGNAL.clone() },
    uBase: { value: base }, uRim: { value: rim }, uPower: { value: power }, uAmount: { value: 1 }, uEdge: { value: edge },
    uSpec: { value: spec }, uGain: { value: 1 }, uHeat: { value: 0 }, uHeatBase: { value: heatBase }, uHeatRim: { value: heatRim },
    ...boxUniforms(),
  };
}
function hotGlass(color, o = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: glassUniforms(color, o),
    vertexShader: /* glsl */ `
      attribute float aHeat;
      varying vec3 vN; varying vec3 vV; varying float vHeat;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vHeat = aHeat;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: GLASS_FRAG_HEAD + /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vHeat;
      void main() {
        if (uAmount < 0.003) discard;
        float g;
        float light = glassLight(normalize(vN), normalize(vV), g);
        float h = clamp(uHeat * vHeat, 0.0, 1.5);
        vec3 col = uColor * light * (1.0 - 0.8 * min(h, 1.0)) + heatLight(h, g);
        gl_FragColor = vec4(col * uAmount * uGain, 1.0);
      }`,
  });
  mat.userData.through = o.through ?? 0;
  return mat;
}

/**
 * Light that lives INSIDE a machine: its inner walls (back faces of an inset copy of the shell), lit by what glows
 * — the melt or the ribbon below (`roof` 0), or the heating elements above (`roof` 1). Strongest by the source,
 * along the station's heat profile. Additive, drawn before the shells: seen through the glass, like a forge
 * through a window.
 */
function innerMat({ L, prof, src = 0, fall = 100, roof = 0, top = 300, floor = 0.2, color = SIGNAL }) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide, fog: false,
    uniforms: { uColor: { value: color.clone() }, uK: { value: 0 }, uAmount: { value: 1 }, uSrc: { value: src }, uFall: { value: Math.max(1, fall) }, uRoof: { value: roof }, uTop: { value: top }, uFloor: { value: floor }, ...profUniforms(L, prof) },
    vertexShader: /* glsl */ `
      varying vec3 vP;
      void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: PROF_GLSL + /* glsl */ `
      uniform vec3 uColor; uniform float uK, uAmount, uSrc, uFall, uRoof, uTop, uFloor; varying vec3 vP;
      void main() {
        float ys = mix(max(vP.y - uSrc, 0.0), max(uTop - vP.y, 0.0), uRoof);
        float k = uK * prof(vP.x) * (uFloor + exp(-ys / uFall)) * uAmount;
        gl_FragColor = vec4(uColor * k, 1.0);
      }`,
  });
}

/** A soft light on a quad: a bright core (superellipse `core`, 0–1 of the quad) and a long halo. */
function spotMat({ color = SIGNAL, core = 0.42, halo = 0.35 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uColor: { value: color.clone() }, uK: { value: 0 }, uAmount: { value: 1 }, uCore: { value: core }, uHalo: { value: halo } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uAmount, uCore, uHalo; varying vec2 vUv;
      void main() {
        vec2 q = abs(vUv * 2.0 - 1.0);
        float d = length(q);
        float sq = pow(q.x * q.x * q.x * q.x + q.y * q.y * q.y * q.y, 0.25);
        float a = (1.0 - smoothstep(uCore * 0.82, uCore, sq)) + uHalo * exp(-d * d * 3.0) * (1.0 - smoothstep(0.7, 1.0, d));
        gl_FragColor = vec4(uColor * uK * a * uAmount, 1.0);
      }`,
  });
}

/** A flame tongue on a quad (uv.x from the burner's mouth to its tip): wide and bright at the mouth, thinning out. */
function flameMat() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uColor: { value: SIGNAL.clone() }, uK: { value: 0 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uAmount; varying vec2 vUv;
      void main() {
        float u = clamp(vUv.x, 0.0, 1.0);
        float w = mix(0.9, 0.16, u);
        float v = (vUv.y * 2.0 - 1.0) / w;
        float a = exp(-v * v * 2.6) * smoothstep(0.0, 0.07, u) * pow(1.0 - u, 0.85);
        gl_FragColor = vec4(uColor * uK * a * uAmount, 1.0);
      }`,
  });
}

/** Raw materials falling from a hopper's mouth: streaks (never dots) drawn facing the eye, lit warm as they near the melt. */
function streamMat() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: {
      uInk: { value: INK.clone() }, uHot: { value: SIGNAL.clone() }, uK: { value: 0 }, uAmount: { value: 1 }, uWarm: { value: 0 },
      uTop: { value: 300 }, uBot: { value: 100 }, uPhase: { value: 0 }, uLen: { value: 7 }, uWid: { value: 1 }, uSpread: { value: 10 }, uXZ: { value: new THREE.Vector2() },
    },
    vertexShader: /* glsl */ `
      uniform float uTop, uBot, uPhase, uLen, uWid, uSpread; uniform vec2 uXZ;
      attribute vec2 corner; attribute vec4 aSeed;
      varying vec2 vC; varying float vFall;
      void main() {
        float L = max(uTop - uBot, 1.0);
        float s = fract(aSeed.z + uPhase * (0.85 + 0.3 * aSeed.w) * 240.0 / L);
        float spread = mix(0.5, 1.0, s);
        vec3 c = vec3(uXZ.x + aSeed.x * uSpread * spread, uTop - s * L, uXZ.y + aSeed.y * uSpread * spread);
        vec4 mv = modelViewMatrix * vec4(c, 1.0);
        vec3 up = (modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
        float lu = length(up.xy);
        vec2 u2 = lu > 1e-3 ? up.xy / lu : vec2(0.0, 1.0);
        vec2 sd = vec2(u2.y, -u2.x);
        mv.xy += u2 * corner.y * uLen * max(lu, 0.25) + sd * corner.x * uWid;
        vC = corner; vFall = s;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uHot; uniform float uK, uAmount, uWarm; varying vec2 vC; varying float vFall;
      void main() {
        float head = clamp(0.5 - 0.5 * vC.y, 0.0, 1.0);
        float a = head * head * (1.0 - vC.x * vC.x) * smoothstep(0.0, 0.1, vFall) * (1.0 - smoothstep(0.82, 1.0, vFall));
        vec3 col = mix(uInk, uHot * 1.4, uWarm * smoothstep(0.45, 1.0, vFall));
        gl_FragColor = vec4(col * uK * a * uAmount, 1.0);
      }`,
  });
}

/* ───────────────────────────── geometry helpers ───────────────────────────── */

/**
 * A profile [[z, y]…] (z ascending over the top) swept along x from x0 to x1 in `segX` steps: walls and roof of a
 * vault, a tunnel, a channel (`closed`: the profile closes on itself). Normals outward; smooth across a bend of
 * the profile under 35°, sharp above (so the edges only draw the creases).
 */
function sweep(profile, x0, x1, segX, { closed = false } = {}) {
  const n = profile.length;
  const segs = closed ? n : n - 1;
  const segN = [];
  for (let i = 0; i < segs; i++) {
    const a = profile[i];
    const b = profile[(i + 1) % n];
    const dz = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dz, dy) || 1;
    segN.push([-dy / l, dz / l]); // [nz, ny]
  }
  const cos35 = Math.cos((35 * Math.PI) / 180);
  const nAt = (s, o) => {
    const oi = closed ? (o + segs) % segs : o;
    if (oi < 0 || oi >= segs) return segN[s];
    const A = segN[s];
    const B = segN[oi];
    if (A[0] * B[0] + A[1] * B[1] < cos35) return A;
    const z = A[0] + B[0];
    const y = A[1] + B[1];
    const l = Math.hypot(z, y) || 1;
    return [z / l, y / l];
  };
  const pos = [];
  const nor = [];
  const idx = [];
  for (let s = 0; s < segs; s++) {
    const a = profile[s];
    const b = profile[(s + 1) % n];
    const nA = nAt(s, s - 1);
    const nB = nAt(s, s + 1);
    const base = pos.length / 3;
    for (let j = 0; j <= segX; j++) {
      const x = x0 + ((x1 - x0) * j) / segX;
      pos.push(x, a[1], a[0], x, b[1], b[0]);
      nor.push(0, nA[1], nA[0], 0, nB[1], nB[0]);
      if (j < segX) {
        const k = base + 2 * j;
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/** A segmental arch: walls up to `wall`, then a crown rising `crown` above them. */
function archProfile(half, wall, crown, steps = 18) {
  const R = (half * half + crown * crown) / (2 * crown);
  const cy = wall + crown - R;
  const a0 = Math.asin(half / R);
  const pts = [[-half, 0], [-half, wall]];
  for (let i = 1; i < steps; i++) {
    const a = -a0 + (2 * a0 * i) / steps;
    pts.push([R * Math.sin(a), cy + R * Math.cos(a)]);
  }
  pts.push([half, wall], [half, 0]);
  return pts;
}

/** An end wall at x: the profile closed by the floor, with rectangular holes [z0, z1, y0, y1]. */
function endWall(profile, x, holes = []) {
  const s = new THREE.Shape(profile.map(([z, y]) => new THREE.Vector2(z, y)));
  for (const [z0, z1, y0, y1] of holes) {
    const p = new THREE.Path();
    p.moveTo(z0, y0);
    p.lineTo(z1, y0);
    p.lineTo(z1, y1);
    p.lineTo(z0, y1);
    p.lineTo(z0, y0);
    s.holes.push(p);
  }
  return new THREE.ShapeGeometry(s, 8).rotateY(-Math.PI / 2).translate(x, 0, 0);
}

/** A box by its two corners (block coordinates), subdivided every `step` cm so a baked heat reads smoothly. */
function boxAt(x0, y0, z0, x1, y1, z1, step = 0) {
  const w = x1 - x0;
  const h = y1 - y0;
  const d = z1 - z0;
  const sx = step ? Math.max(1, Math.round(w / step)) : 1;
  const sy = step ? Math.max(1, Math.round(h / step)) : 1;
  const sz = step ? Math.max(1, Math.round(d / step)) : 1;
  return new THREE.BoxGeometry(w, h, d, sx, sy, sz).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
}

/** Fine lines from a flat list of segment ends [x0, y0, z0, x1, y1, z1, …]. */
function segLines(segs, { color = BRAND.ink, width = 1.8, opacity = 0.4, colors = null, additive = false, hdr = 1 } = {}) {
  const g = new LineSegmentsGeometry();
  g.setPositions(segs);
  if (colors) g.setColors(colors);
  const obj = new LineSegments2(g, lineMat(color, width, { opacity, vertexColors: !!colors, additive, hdr }));
  obj.renderOrder = 2;
  return obj;
}
/** Pushes a polyline (closed or not) into a segment list. */
function poly(segs, pts, closed = false) {
  const n = pts.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) segs.push(...pts[i], ...pts[(i + 1) % n]);
}
/** A circle of `r` around c in the plane given by two unit axes u, v. */
function circle(segs, c, u, v, r, n = 24) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    pts.push([c[0] + r * (Math.cos(a) * u[0] + Math.sin(a) * v[0]), c[1] + r * (Math.cos(a) * u[1] + Math.sin(a) * v[1]), c[2] + r * (Math.cos(a) * u[2] + Math.sin(a) * v[2])]);
  }
  poly(segs, pts, true);
}

/** A quad from four corners, uv (0,0) (1,0) (1,1) (0,1). */
function quad(p0, p1, p2, p3) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([...p0, ...p1, ...p2, ...p3], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  return g;
}

/* ───────────────────────────── X-ray pieces ───────────────────────────── */

/**
 * A piece of X-ray: a glass shell and its edges. Returns the mesh; `fade(a)` on `mesh.userData`.
 * `heat` (optional): (x, y, z) → 0–1, in the geometry's own coordinates — where this shell takes the colour of a
 * fire inside; the shell then has `mesh.userData.heat(h)` (0–1.5) and an overlay of hot edges.
 */
export function xray(geometry, { rim = 0.22, edge = 0.4, width = 1.8, opacity = 0.7, color = BRAND.ink, base = 0.004, power = 2.6, spec = 0, through = 0, heat = null, hotEdges = 0.85 } = {}) {
  let mat;
  if (heat) {
    const p = geometry.attributes.position;
    const h = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) h[i] = clamp01(heat(p.getX(i), p.getY(i), p.getZ(i)));
    geometry.setAttribute("aHeat", new THREE.BufferAttribute(h, 1));
    mat = hotGlass(color, { base, rim, power, edge, spec, through });
  } else {
    mat = glass(color, { base, rim, power, edge, spec, through });
  }
  const mesh = new THREE.Mesh(geometry, mat);
  const lines = edgesOf(geometry, { color, width, opacity });
  mesh.add(lines);
  let hot = null;
  if (heat) {
    // the same edges in signal, each end as hot as the shell there: the vault's ribs lit from inside
    const eg = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, 28);
    const ep = eg.attributes.position;
    const colors = new Float32Array(ep.count * 3);
    for (let i = 0; i < ep.count; i++) colors.fill(clamp01(heat(ep.getX(i), ep.getY(i), ep.getZ(i))), i * 3, i * 3 + 3);
    hot = segLines(Array.from(ep.array), { color: BRAND.signal, width: width + 0.2, opacity: 0, colors: Array.from(colors), additive: true, hdr: 1.5 });
    mesh.add(hot);
  }
  let A = 1;
  let H = 0;
  const apply = () => {
    mat.uniforms.uAmount.value = A;
    lines.material.opacity = opacity * A;
    mesh.visible = A > 0.003;
    if (hot) {
      mat.uniforms.uHeat.value = H;
      hot.material.opacity = Math.min(1, H) * A * hotEdges;
      hot.visible = A * H > 0.003;
    }
  };
  mesh.userData.fade = (a) => {
    A = a;
    apply();
  };
  mesh.userData.heat = (h) => {
    H = h;
    apply();
  };
  return mesh;
}

/** What a block needs to fade as one: shells, lines, glows (each keeps its own base level). */
function fader() {
  const fns = [];
  const api = {
    shell(...meshes) {
      for (const m of meshes) fns.push((a) => m.userData.fade(a));
      return meshes[0];
    },
    lines(obj) {
      const base = obj.material.opacity;
      fns.push((a) => {
        obj.material.opacity = base * a;
        obj.visible = a > 0.003;
      });
      return obj;
    },
    fn(f) {
      fns.push(f);
    },
    set(a) {
      for (const f of fns) f(a);
    },
  };
  return api;
}

/* ═════════════════════════════ THE FURNACE ═════════════════════════════ */

/**
 * makeFurnace — three machines from one block, chosen by `kind` (default: `tunnel` → "lehr", `hopper` →
 * "melter", else "oven"):
 *   · melter  an arched vault (crown) on low walls, steel buckstays and tie rods, burner ports in rows on both
 *             flanks with their gas lances, flame tongues across the melt, peepholes; at the upstream end a
 *             doghouse under the hopper (and a bucket elevator behind it, `lift`); at the exit a canal (`spout`)
 *             and its tweel, the gate that lifts with `open`
 *   · lehr    a long low box tunnel, open at both ends, cut into `zones` by steel frames, a fan on the roof of
 *             each zone, access doors on the flanks; the hot ribbon lights it from below at the entry
 *   · oven    a flat-roofed box, electric `elements` glowing under the roof, columns between its `zones`,
 *             lifting doors at both ends (`ends`, `slot`, `open`), peepholes, an exhaust stack
 */
export function makeFurnace({
  length = 1000, half = 250, height = 300, tunnel = false, hopper = null,
  kind, roof, crown, wall, melt, fire, burners, firing = "near", elements, windows, bays, zones, fans,
  ends, slot, spout, canal, doghouse, lift, stack, hot, heatGain, lines, rim, power, seed = 7,
} = {}) {
  kind = kind ?? (tunnel ? "lehr" : hopper ? "melter" : "oven");
  const L = length;
  const H = height;
  const MELTER = kind === "melter";
  const LEHR = kind === "lehr";
  const OVEN = !MELTER && !LEHR;
  roof = roof ?? (MELTER ? "arch" : "flat");
  crown = roof === "arch" ? (crown ?? half * 0.3) : 0;
  wall = wall ?? H - crown;
  melt = melt ?? (MELTER ? H * 0.29 : 90);
  fire = fire ?? (MELTER ? "burners" : LEHR ? "none" : "elements");
  const endsDef = MELTER ? { in: "shut", out: "spout" } : LEHR ? { in: "open", out: "open" } : { in: "door", out: "door" };
  ends = typeof ends === "string" ? { in: ends, out: ends } : { ...endsDef, ...(ends || {}) };
  lines = lines ?? (LEHR ? 0.34 : 0.42);
  rim = rim ?? (LEHR ? 0.06 : 0.2);
  power = power ?? (LEHR ? 4 : 2.6);
  // a lehr is driven by the ribbon's dull heat (world: 0.25 × ribbon): it shows it stronger
  heatGain = heatGain ?? (LEHR ? 2.6 : 1);
  const hp = hot ?? (MELTER ? { h0: 0.05, h1: 0.72, inL: 0.6, outL: 0.38 } : LEHR ? { h0: 0, h1: 0.04, inL: 1, outL: 0 } : { h0: 0.12, h1: 0.88, inL: 0.55, outL: 0.55 });
  const P = { h0: hp.h0 * L, h1: Math.min(hp.h1 * L, L - 1), inL: hp.inL, outL: hp.outL };
  const fromRoof = fire === "elements";
  const fall = Math.max(30, (H - melt) * 0.45);
  /** how hot the shell is at a point of the block (0–1): the station's profile, strongest by its source */
  const heatAt = (x, y) => {
    const d = fromRoof ? Math.max(0, H - y) : Math.max(0, y - melt);
    return profileAt(Math.min(L, Math.max(0, x)), L, P) * (0.4 + 0.6 * Math.exp(-d / fall));
  };
  const sl = slot ?? {};
  const S = { y0: sl.y0 ?? Math.max(10, melt - 50), y1: sl.y1 ?? Math.min(H - 30, melt + 80), half: sl.half ?? half * 0.82 };
  const C = { len: spout ?? 60, half: canal ?? Math.min(half * 0.45, 130), y0: melt - 16, y1: melt + 44 };

  const group = new THREE.Group();
  const F = fader();
  const shells = [];
  const hotShells = [];
  const X = (geo, o = {}) => {
    const m = xray(geo, { rim, power, edge: LEHR ? 0.1 : 0.38, base: 0.003, opacity: lines, ...o });
    if (o.shell !== false) shells.push(m);
    if (o.heat) hotShells.push([m, o.heatGain ?? 1]);
    group.add(m);
    F.shell(m);
    return m;
  };
  const segs = []; //   fine ink details (lances, ties, frames, seams)
  const faint = []; //  fainter still (panel seams, guides)
  const A = { mouth: new THREE.Object3D(), exit: new THREE.Object3D() };
  group.add(A.mouth, A.exit);

  /* — the body: walls and roof, end walls — */
  const profile = roof === "arch" ? archProfile(half, wall, crown) : [[-half, 0], [-half, H], [half, H], [half, 0]];
  const segX = Math.max(8, Math.round(L / 60));
  X(sweep(profile, 0, L, segX), { heat: heatAt });
  const dogH = melt + 46;
  const dog = doghouse ?? (MELTER && !!hopper);
  const dogHalf = Math.min(85, half * 0.4);
  const holesFor = (type) => {
    if (type === "spout") return [[-C.half, C.half, C.y0, C.y1]];
    if (type === "slot" || type === "door") return [[-S.half, S.half, S.y0, S.y1]];
    return [];
  };
  for (const [side, x] of [["in", 0], ["out", L]]) {
    const type = ends[side];
    if (type === "open") continue;
    const holes = side === "in" && dog ? [[-dogHalf, dogHalf, melt - 10, dogH]] : holesFor(type);
    X(endWall(profile, x, holes), { heat: heatAt, rim: rim * 0.8 });
  }
  A.exit.position.set(L, ends.out === "spout" ? melt : melt, 0);

  /* — inside: the light of what glows — */
  const inset = profile.map(([z, y]) => [z - Math.sign(z) * 5, y > 1 ? y - 5 : y]);
  const innerM = innerMat({ L, prof: P, src: melt, fall: fromRoof ? H * 0.18 : (H - melt) * (LEHR ? 0.3 : 0.24), roof: fromRoof ? 1 : 0, top: H, floor: 0.03 });
  const inner = new THREE.Mesh(sweep(inset, 4, L - 4, segX), innerM);
  inner.renderOrder = 1;
  group.add(inner);
  const innerK = MELTER ? 0.75 : LEHR ? 0.7 : 0.6;
  F.fn((a) => (innerM.uniforms.uAmount.value = a));

  /* — the steel: buckstays and ties (melter), zone frames (lehr), columns (oven) — */
  const R = rng(seed);
  const portXs = [];
  const nBurn = fire === "burners" ? (burners ?? Math.max(2, Math.round((L * 0.62) / 160))) : 0;
  for (let i = 0; i < nBurn; i++) portXs.push(L * 0.1 + (nBurn === 1 ? 0.31 * L : (L * 0.62 * i) / (nBurn - 1)));
  const portY = melt + (wall - melt) * 0.42;
  if (MELTER) {
    const step = bays ?? 160;
    const geos = [];
    const top = H + 22;
    for (let x = step / 2; x < L; x += step) {
      if (portXs.some((px) => Math.abs(px - x) < 42)) continue;
      for (const s of [-1, 1]) geos.push(boxAt(x - 7, 0, s * (half + 1) - (s < 0 ? 10 : 0), x + 7, top, s * (half + 1) + (s > 0 ? 10 : 0)));
      segs.push(x, top - 6, -(half + 6), x, top - 6, half + 6); // the tie rod over the crown
    }
    X(mergeGeometries(geos), { shell: false, rim: 0.12, edge: 0.3, opacity: lines * 0.9, heat: (x, y) => 0.35 * heatAt(x, y), heatGain: 0.8 });
    for (const s of [-1, 1]) segs.push(step / 2 - 7, top - 6, s * (half + 6), L - step / 2 + 7, top - 6, s * (half + 6)); // longitudinal ties
  }
  const nZones = zones ?? (LEHR ? Math.max(2, Math.round(L / 300)) : OVEN ? Math.max(2, Math.round(L / 250)) : 0);
  if (LEHR) {
    const zl = L / nZones;
    for (let k = 0; k <= nZones; k++) {
      const x = k * zl;
      poly(segs, [[x, 0, -half - 4], [x, H + 4, -half - 4], [x, H + 4, half + 4], [x, 0, half + 4]]);
    }
    for (let k = 0; k < nZones; k++) {
      const xc = (k + 0.5) * zl;
      // an access door on each flank of the zone
      for (const s of [-1, 1]) poly(faint, [[xc - zl * 0.26, 34, s * (half + 1)], [xc + zl * 0.26, 34, s * (half + 1)], [xc + zl * 0.26, H * 0.66, s * (half + 1)], [xc - zl * 0.26, H * 0.66, s * (half + 1)]], true);
      // its fan on the roof: housing and motor
      const nf = fans ?? 1;
      for (let f = 0; f < nf; f++) {
        const fz = nf === 1 ? -half * 0.42 : -half * 0.6 + (half * 1.2 * f) / (nf - 1);
        X(new THREE.CylinderGeometry(25, 25, 18, 20, 1).translate(xc, H + 9, fz), { shell: false, rim: 0.14, opacity: lines * 0.9 });
        X(boxAt(xc - 11, H + 18, fz - 11, xc + 11, H + 38, fz + 11), { shell: false, rim: 0.12, opacity: lines * 0.8 });
      }
    }
  }
  if (OVEN) {
    const zl = L / nZones;
    const geos = [];
    for (let k = 0; k <= nZones; k++) {
      const x = Math.min(L - 6, Math.max(6, k * zl));
      for (const s of [-1, 1]) geos.push(boxAt(x - 6, 0, s * half + (s < 0 ? -9 : 0), x + 6, H + 14, s * half + (s > 0 ? 9 : 0)));
      segs.push(x, H + 10, -half - 5, x, H + 10, half + 5);
    }
    X(mergeGeometries(geos), { shell: false, rim: 0.12, edge: 0.3, opacity: lines * 0.9 });
    for (let x = 100; x < L - 50; x += 100) for (const s of [-1, 1]) faint.push(x, 8, s * (half + 0.5), x, H - 8, s * (half + 0.5)); // panel seams
    for (const s of [-1, 1]) faint.push(0, H * 0.5, s * (half + 0.5), L, H * 0.5, s * (half + 0.5));
  }

  /* — the fire: burner ports and flames (melter), elements (oven) — */
  const ports = [];
  const flames = [];
  for (const [i, x] of portXs.entries()) {
    for (const s of [-1, 1]) {
      X(boxAt(x - 22, portY - 19, s > 0 ? half : -half - 30, x + 22, portY + 19, s > 0 ? half + 30 : -half), { shell: false, rim: 0.14, opacity: lines * 0.9, heat: () => 0.7 });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(76, 62).translate(x, portY, s * (half + 30.6)), spotMat({ core: 0.5, halo: 0.45 }));
      m.renderOrder = 1;
      group.add(m);
      ports.push({ m, near: s > 0, i });
      // the gas lance and its feed pipe
      segs.push(x + 20, portY - 72, s * (half + 64), x + 6, portY - 12, s * (half + 34));
      segs.push(x + 20, portY - 72, s * (half + 64), x + 20, 0, s * (half + 64));
      const fires = firing === "both" || (firing === "near" && s > 0) || (firing === "far" && s < 0);
      if (fires) {
        const y0 = portY - 6;
        const y1 = melt + 22;
        const z0 = s * (half - 2);
        const z1 = -s * half * 0.3;
        const w = 34;
        const fm = new THREE.Mesh(quad([x - w, y0, z0], [x - w * 0.5, y1, z1], [x + w * 0.5, y1, z1], [x + w, y0, z0]), flameMat());
        fm.renderOrder = 1;
        group.add(fm);
        flames.push({ m: fm, i: i + (s > 0 ? 0 : 0.5), ph: R() * TAU });
      }
    }
  }
  // (quad corners: mouth-left, tip-left, tip-right, mouth-right → uv.x along the tongue, uv.y across)
  let elementsMat = null;
  if (fire === "elements") {
    const n = elements ?? Math.max(4, Math.round(L / 75));
    const geos = [];
    const ey = H - 24;
    for (let i = 0; i < n; i++) {
      const x = L * 0.07 + (L * 0.86 * i) / Math.max(1, n - 1);
      geos.push(new THREE.CylinderGeometry(1.8, 1.8, half * 1.76, 8).rotateX(Math.PI / 2).translate(x, ey, 0));
      faint.push(x, ey, -half * 0.88, x, ey, half * 0.88);
      for (const s of [-1, 1]) segs.push(x, ey, s * half * 0.88, x, H, s * half * 0.88); // hangers
    }
    elementsMat = glow(BRAND.signal, 0, { additive: true });
    const el = new THREE.Mesh(mergeGeometries(geos), elementsMat);
    el.renderOrder = 1;
    group.add(el);
  }

  /* — peepholes — */
  const nWin = windows ?? (MELTER ? 3 : OVEN ? 2 : 0);
  const peeps = [];
  for (let i = 0; i < nWin; i++) {
    const x = MELTER ? L * (0.78 + (0.16 * i) / Math.max(1, nWin - 1)) : L * (0.25 + (0.5 * i) / Math.max(1, nWin - 1));
    const y = melt + (MELTER ? 30 : 40);
    for (const s of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(30, 30).translate(x, y, s * (half + 1.2)), spotMat({ core: 0.36, halo: 0.6 }));
      m.renderOrder = 1;
      group.add(m);
      peeps.push(m);
      circle(segs, [x, y, s * (half + 1.4)], [1, 0, 0], [0, 1, 0], 10, 16);
    }
  }

  /* — doors at the ends (oven) — */
  const doors = [];
  for (const [side, x] of [["in", 0], ["out", L]]) {
    if (ends[side] !== "door") continue;
    const dx = side === "in" ? -5 : 5;
    const dh = S.y1 - S.y0 + 16;
    const g = new THREE.Group();
    group.add(g);
    const m = xray(boxAt(x + dx - 3, S.y0 - 8, -S.half - 8, x + dx + 3, S.y1 + 8, S.half + 8, 40), { rim, edge: 0.38, base: 0.003, opacity: lines, heat: () => 0.75 });
    g.add(m);
    shells.push(m);
    hotShells.push([m, 0.8]);
    F.shell(m);
    doors.push({ g, lift: dh });
    // its guides, up to where it hides when open
    const top = S.y1 + dh + 24;
    for (const s of [-1, 1]) faint.push(x + dx, 0, s * (S.half + 14), x + dx, top, s * (S.half + 14));
    faint.push(x + dx, top, -S.half - 14, x + dx, top, S.half + 14);
  }

  /* — the canal and its tweel (melter's exit) — */
  let tweel = null;
  if (ends.out === "spout") {
    const cp = [[-C.half, C.y0], [-C.half, C.y1], [C.half, C.y1], [C.half, C.y0]];
    X(sweep(cp, L, L + C.len, 3, { closed: true }), { heat: () => 0.8, rim: rim * 0.9 });
    const tx = L + C.len * 0.4;
    tweel = new THREE.Group();
    const tw = xray(boxAt(tx - 3, 0, -C.half + 3, tx + 3, 64, C.half - 3, 30), { rim, edge: 0.4, base: 0.003, opacity: lines, heat: (x, y) => (y < 20 ? 0.9 : 0.4) });
    tweel.add(tw);
    group.add(tweel);
    shells.push(tw);
    hotShells.push([tw, 1]);
    F.shell(tw);
    const top = C.y1 + 110;
    for (const s of [-1, 1]) segs.push(tx, C.y1, s * (C.half + 8), tx, top, s * (C.half + 8));
    segs.push(tx, top, -C.half - 8, tx, top, C.half + 8);
    A.exit.position.set(L + C.len, melt, 0);
  }

  /* — the doghouse, the hopper, its elevator, the batch falling (melter) — */
  let stream = null;
  if (hopper) {
    const hx = hopper.x;
    if (dog) X(boxAt(hx - 70, 0, -dogHalf, 30, dogH, dogHalf, 40), { heat: (x, y) => 0.55 * heatAt(0, y), heatGain: 1 });
    const square = (hopper.shape ?? "box") === "box";
    const segs4 = square ? 4 : 28;
    const rt = hopper.r ?? 80;
    const rm = 22;
    const fy = hopper.mouth + 30;
    const funnel = new THREE.CylinderGeometry(rt, rm, hopper.top - fy, segs4, 3, true);
    if (square) funnel.rotateY(Math.PI / 4);
    X(funnel.translate(hx, (hopper.top + fy) / 2, 0), { rim: 0.24 });
    const neck = new THREE.CylinderGeometry(rm, rm, 30, segs4, 1, true);
    if (square) neck.rotateY(Math.PI / 4);
    X(neck.translate(hx, hopper.mouth + 15, 0), { rim: 0.24 });
    const c = square ? rt / Math.SQRT2 : rt * 0.7;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) segs.push(hx + sx * c, hopper.top, sz * c, hx + sx * (c + 34), 0, sz * (c + 34)); // splayed legs
    poly(segs, [[hx - c - 10, hopper.top + 6, -c - 10], [hx + c + 10, hopper.top + 6, -c - 10], [hx + c + 10, hopper.top + 6, c + 10], [hx - c - 10, hopper.top + 6, c + 10]], true);
    if (lift ?? true) {
      const ez = -c - 90;
      X(boxAt(hx - 24, 0, ez - 24, hx + 24, hopper.top + 60, ez + 24, 60), { shell: false, rim: 0.12, opacity: lines * 0.8 });
      X(boxAt(hx - 34, hopper.top + 50, ez - 34, hx + 34, hopper.top + 104, ez + 34), { shell: false, rim: 0.12, opacity: lines * 0.8 });
      const a = [hx, hopper.top + 68, ez + 30];
      const b = [hx, hopper.top + 10, -c * 0.4];
      const len = Math.hypot(b[1] - a[1], b[2] - a[2]);
      const chute = new THREE.BoxGeometry(26, 18, len).rotateX(Math.asin((a[1] - b[1]) / len)).translate(hx, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
      X(chute, { shell: false, rim: 0.12, opacity: lines * 0.8 });
    }
    A.mouth.position.set(hx, hopper.mouth, 0);
    // the falling batch: streaks
    const N = 84;
    const corner = [];
    const seedA = [];
    const index = [];
    const Rs = rng(seed + 11);
    for (let i = 0; i < N; i++) {
      const a = Rs() * TAU;
      const r = Math.sqrt(Rs());
      const s = [Math.cos(a) * r, Math.sin(a) * r, Rs(), Rs()];
      for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        corner.push(cx, cy);
        seedA.push(...s);
      }
      const k = i * 4;
      index.push(k, k + 1, k + 2, k, k + 2, k + 3);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(N * 12), 3));
    sg.setAttribute("corner", new THREE.Float32BufferAttribute(corner, 2));
    sg.setAttribute("aSeed", new THREE.Float32BufferAttribute(seedA, 4));
    sg.setIndex(index);
    const sm = streamMat();
    sm.uniforms.uTop.value = hopper.mouth;
    sm.uniforms.uBot.value = melt + 8;
    sm.uniforms.uXZ.value.set(hx, 0);
    sm.uniforms.uSpread.value = rm * 0.55;
    stream = new THREE.Mesh(sg, sm);
    stream.frustumCulled = false;
    stream.renderOrder = 1;
    group.add(stream);
  }

  /* — an exhaust stack — */
  const st = stack ?? (OVEN ? { x: 0.82, h: 56, r: 13 } : null);
  if (st) {
    const sx = st.x * L;
    const sz = st.z ?? -half * 0.45;
    X(new THREE.CylinderGeometry(st.r, st.r, st.h, 18, 1, true).translate(sx, H + st.h / 2, sz), { rim: 0.2, opacity: lines * 0.85 });
  }

  if (segs.length) group.add(F.lines(segLines(segs, { opacity: lines * 0.85, width: 1.8 })));
  if (faint.length) group.add(F.lines(segLines(faint, { opacity: lines * 0.45, width: 1.8 })));
  asShell(shells, 20);

  const portK = (near) => (near ? 2.3 : 1.5);
  let lastOpen = -1;
  return {
    group, A,
    set({ amount = 1, glow: g = 0, batch = 0, open, time = 0 } = {}) {
      F.set(amount);
      const on = amount > 0.003;
      const G = Math.max(0, g) * heatGain;
      for (const [m, k] of hotShells) m.userData.heat(G * k);
      innerM.uniforms.uK.value = innerK * G;
      inner.visible = on && G > 0.003;
      for (const p of ports) {
        p.m.material.uniforms.uK.value = portK(p.near) * G * (0.93 + 0.07 * Math.sin(0.7 * time + p.i * 1.9));
        p.m.material.uniforms.uAmount.value = amount;
        p.m.visible = on && G > 0.003;
      }
      for (const f of flames) {
        f.m.material.uniforms.uK.value = 1.55 * G * (0.86 + 0.14 * Math.sin(1.1 * time + f.ph));
        f.m.material.uniforms.uAmount.value = amount;
        f.m.visible = on && G > 0.02;
      }
      for (const m of peeps) {
        m.material.uniforms.uK.value = 1.7 * G;
        m.material.uniforms.uAmount.value = amount;
        m.visible = on && G > 0.003;
      }
      if (elementsMat) {
        setGlow(elementsMat, 2.4 * G);
        elementsMat.opacity = amount;
      }
      const o = open ?? (MELTER ? 0.5 : 1);
      if (o !== lastOpen) {
        lastOpen = o;
        for (const d of doors) d.g.position.y = clamp01(o) * d.lift;
        if (tweel) tweel.position.y = C.y0 + clamp01(o) * (C.y1 - C.y0 - 12);
      }
      if (stream) {
        const s = smooth(0, 0.06, batch) * (1 - smooth(0.9, 1, batch));
        const u = stream.material.uniforms;
        u.uK.value = 1.25 * s;
        u.uAmount.value = amount;
        u.uWarm.value = clamp01(G);
        u.uPhase.value = time > 0 ? time : batch * 5;
        stream.visible = on && s > 0.003;
      }
    },
  };
}

/* ═════════════════════════════ THE VAT ═════════════════════════════ */

/** The liquid tin: a dark mirror. It reads by what it reflects — the hood's ribs and its warm entry, the ribbon's glow. */
function tinMat({ L, half, level, hood, bay, ribbon, spread }) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: true,
    uniforms: {
      uInk: { value: INK.clone() }, uHot: { value: SIGNAL.clone() }, uAmount: { value: 1 }, uShine: { value: 1 }, uHeat: { value: 0 },
      uLevel: { value: level }, uHood: { value: hood }, uLen: { value: L }, uHalf: { value: half }, uBay: { value: bay }, uBand: { value: ribbon }, uSpread: { value: spread },
      ...boxUniforms(),
    },
    vertexShader: /* glsl */ `
      varying vec3 vL; varying vec3 vW;
      void main() { vL = position; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uHot, uBoxC, uBoxU, uBoxV, uBoxSize;
      uniform float uAmount, uShine, uHeat, uLevel, uHood, uLen, uHalf, uBay, uBand, uSpread;
      varying vec3 vL; varying vec3 vW;
      float heatX(float x) { return mix(1.0, 0.22, smoothstep(0.0, uLen, x)); }
      float line(float d, float w, float fw) {
        // a line of half-width w (cm) at distance d, antialiased; fades out before it would be thinner than a pixel
        return (1.0 - smoothstep(w, w + 1.5 * fw, d)) * (1.0 - smoothstep(0.6 * w, 2.5 * w, fw));
      }
      void main() {
        vec3 dir = normalize(vW - cameraPosition);
        float down = clamp(-dir.y, 0.0, 1.0);
        vec3 r = vec3(dir.x, max(-dir.y, 0.02), dir.z);   // the ray, mirrored by the tin
        float fres = 0.55 + 0.45 * pow(1.0 - down, 4.0);
        float t = (uHood - uLevel) / r.y;
        vec2 h = vL.xz + r.xz * t;                         // where it meets the hood's roof
        float inside = step(abs(h.y), uHalf) * step(0.0, h.x) * step(h.x, uLen);
        float fx = fwidth(h.x);
        float ribs = line(abs(fract(h.x / uBay + 0.5) - 0.5) * uBay, 2.2, fx);
        float fz = fwidth(h.y);
        float rails = line(abs(abs(h.y) - uHalf * 0.45), 2.6, fz);
        vec3 col = uInk * (0.010 + 0.035 * fres);
        col += uInk * 0.2 * (ribs + 0.7 * rails) * inside * fres * uShine;
        col += uHot * uHeat * heatX(h.x) * inside * 0.16 * fres * uShine;
        // the ribbon's glow on the tin beside it
        float az = abs(vL.z);
        float band = exp(-max(az - uBand, 0.0) / uSpread) * smoothstep(uBand * 0.7, uBand, az);
        col += uHot * uHeat * heatX(vL.x) * band * 1.5 * (0.5 + 0.5 * uShine);
        // the studio's softbox: one soft streak, it is a liquid metal
        vec3 rw = reflect(dir, vec3(0.0, 1.0, 0.0));
        float toward = dot(rw, uBoxC);
        vec3 p = rw * (uBoxSize.z / max(toward, 1e-3));
        vec2 q = abs(vec2(dot(p, uBoxU), dot(p, uBoxV))) / uBoxSize.xy;
        col += uInk * 0.07 * uShine * smoothstep(0.0, 0.3, toward) * (1.0 - smoothstep(0.2, 1.9, length(q)));
        gl_FragColor = vec4(col, uAmount);
      }`,
  });
}

export function makeVat({ shape = "flat", ...o } = {}) {
  return shape === "cylinder" ? makeAutoclave(o) : makeBath(o);
}

/**
 * The tin bath: a shallow tray, the tin's mirror, the hood (a very light shell, ribbed every `bay`), its gas
 * manifold on the roof (`pipes`), the side seals where the edge rolls enter (`ports` per side), and an optional
 * dross box at the exit (`exitBox`, its length). `ribbon`: the half-width of the glass on it (its glow on the tin).
 */
function makeBath({ length: L = 1000, half = 250, level = 88, hood = 200, tray = 8, bay = 200, ports, ribbon = 180, spread = 70, pipes = true, atmo = 0.025, exitBox = 0, lines = 0.38 } = {}) {
  const group = new THREE.Group();
  const F = fader();
  const shells = [];
  const hotShells = [];
  const heatX = (x) => 1 + (0.1 - 1) * smooth(0, L, x);
  const X = (geo, o = {}) => {
    const m = xray(geo, { rim: 0.2, edge: 0.36, base: 0.003, opacity: lines, ...o });
    if (o.shell !== false) shells.push(m);
    if (o.heat) hotShells.push([m, o.heatGain ?? 1]);
    group.add(m);
    F.shell(m);
    return m;
  };
  const segs = [];
  const faint = [];
  const top = level + tray;
  const A = { entry: new THREE.Object3D(), exit: new THREE.Object3D() };
  A.entry.position.set(0, level, 0);
  A.exit.position.set(L, level, 0);
  group.add(A.entry, A.exit);

  // the tray (its casing), OPEN on top — a lid of glass would veil the mirror: walls and floor, its two ends; warm at the entry
  const trayHeat = (x) => 0.55 * heatX(x);
  X(sweep([[-half, top], [-half, 0], [half, 0], [half, top]], 0, L, Math.max(8, Math.round(L / 60))), { heat: trayHeat });
  const trayEnd = [[-half, 0], [-half, top], [half, top], [half, 0]];
  X(endWall(trayEnd, 0), { heat: trayHeat });
  X(endWall(trayEnd, L), { heat: trayHeat });
  // the hood: walls and roof, very light; its end walls leave a slot for the glass
  const hp = [[-half, top], [-half, hood], [half, hood], [half, top]];
  X(sweep(hp, 0, L, Math.max(8, Math.round(L / 60))), { rim: 0.1, edge: 0.18, opacity: lines * 0.55, heat: (x, y) => 0.4 * heatX(x) * (y < top + 30 ? 1 : 0.6), heatGain: 1 });
  const hoodEnd = [[-half, top], [-half, hood], [half, hood], [half, top]];
  const shapeAt = (x) => {
    const s = new THREE.Shape(hoodEnd.map(([z, y]) => new THREE.Vector2(z, y)));
    const p = new THREE.Path();
    const zz = Math.min(half - 12, ribbon + 40);
    p.moveTo(-zz, top);
    p.lineTo(zz, top);
    p.lineTo(zz, top + 34);
    p.lineTo(-zz, top + 34);
    p.lineTo(-zz, top);
    s.holes.push(p);
    return new THREE.ShapeGeometry(s, 4).rotateY(-Math.PI / 2).translate(x, 0, 0);
  };
  // the shape's outline starts on the tray top: drop its bottom edge into the slot's lip
  X(shapeAt(0), { rim: 0.1, edge: 0.18, opacity: lines * 0.55, heat: () => 0.5 });
  X(shapeAt(L), { rim: 0.1, edge: 0.18, opacity: lines * 0.55 });
  // the ribs of the hood, every bay
  for (let x = 0; x <= L + 0.5; x += bay) poly(segs, [[x, 0, -half - 3], [x, hood + 3, -half - 3], [x, hood + 3, half + 3], [x, 0, half + 3]]);
  // side seals: where the edge rolls come in
  const np = ports ?? Math.max(2, Math.round(L / 260));
  for (let i = 0; i < np; i++) {
    const x = L * (0.12 + (0.6 * i) / Math.max(1, np - 1));
    for (const s of [-1, 1]) poly(faint, [[x - 16, top + 8, s * (half + 0.6)], [x + 16, top + 8, s * (half + 0.6)], [x + 16, top + 30, s * (half + 0.6)], [x - 16, top + 30, s * (half + 0.6)]], true);
  }
  // the nitrogen + hydrogen manifold on the roof, and its drops at every bay
  if (pipes) {
    for (const s of [-1, 1]) {
      const z = s * half * 0.45;
      X(new THREE.CylinderGeometry(6, 6, L, 10, 1, true).rotateZ(Math.PI / 2).translate(L / 2, hood + 22, z), { shell: false, rim: 0.1, edge: 0.16, opacity: lines * 0.45 });
      for (let x = bay / 2; x < L; x += bay) segs.push(x, hood + 16, z, x, hood, z);
    }
  }
  if (exitBox > 0) X(boxAt(L, 0, -half * 0.92, L + exitBox, hood * 0.86, half * 0.92, 40), { shell: false, rim: 0.12, opacity: lines * 0.8 });

  // the tin
  const tm = tinMat({ L, half, level, hood, bay, ribbon, spread });
  const tin = new THREE.Mesh(new THREE.PlaneGeometry(L - 4, 2 * half - 4).rotateX(-Math.PI / 2).translate(L / 2, level - 0.4, 0), tm);
  group.add(tin);
  // the atmosphere under the hood: a pale breath, and the warmth of the entry
  const P = { h0: 0, h1: 1, inL: 1, outL: 0.08 };
  const inset = hp.map(([z, y]) => [z - Math.sign(z) * 4, y > top + 1 ? y - 4 : y]);
  const geoIn = sweep(inset, 3, L - 3, Math.max(8, Math.round(L / 60)));
  const warmM = innerMat({ L, prof: P, src: level, fall: (hood - level) * 0.3, floor: 0.04 });
  const warm = new THREE.Mesh(geoIn, warmM);
  warm.renderOrder = 1;
  const paleM = innerMat({ L, prof: { h0: 0, h1: L - 1, inL: 1, outL: 1 }, src: hood, fall: 400, floor: 1, color: INK });
  const pale = new THREE.Mesh(geoIn, paleM);
  pale.renderOrder = 1;
  group.add(warm, pale);

  if (segs.length) group.add(F.lines(segLines(segs, { opacity: lines * 0.7 })));
  if (faint.length) group.add(F.lines(segLines(faint, { opacity: lines * 0.5 })));
  asShell(shells, 20);

  return {
    group, A,
    set({ amount = 1, shine = 1, heat = 0 } = {}) {
      F.set(amount);
      const on = amount > 0.003;
      for (const [m, k] of hotShells) m.userData.heat(heat * k);
      tin.visible = on;
      tm.uniforms.uAmount.value = amount;
      tm.uniforms.uShine.value = shine;
      tm.uniforms.uHeat.value = heat;
      warmM.uniforms.uK.value = 0.22 * heat;
      warmM.uniforms.uAmount.value = amount;
      warm.visible = on && heat > 0.003;
      paleM.uniforms.uK.value = atmo;
      paleM.uniforms.uAmount.value = amount;
      pale.visible = on && atmo > 0;
    },
  };
}

/**
 * The autoclave: a drum lying along x, a dished head at the far end, at x = 0 its mouth (a flange, its bolts, the
 * lugs of a quick-opening ring) and its door, which swings out on a hinge post (`hinge`: on the far side by
 * default, so the camera sees into it), with a sight glass; stiffening `bands`, `saddles` on the floor, a
 * pressure `gauge` on the near flank whose needle follows `pressure`, an air inlet on top (`pipes`), the cart's
 * `rails` inside.
 */
function makeAutoclave({ length: L = 1000, radius: r = 170, axisY = 190, head = "dished", hinge = "far", lugs = 16, bolts = 28, bands, saddles, gauge = true, window: sight = true, pipes = true, rails = true, lines = 0.42 } = {}) {
  const group = new THREE.Group();
  const F = fader();
  const shells = [];
  const hotShells = [];
  const X = (geo, o = {}, parent = group) => {
    const m = xray(geo, { rim: 0.22, edge: 0.4, base: 0.003, opacity: lines, ...o });
    if (o.shell !== false) shells.push(m);
    if (o.heat) hotShells.push([m, o.heatGain ?? 1]);
    parent.add(m);
    F.shell(m);
    return m;
  };
  const segs = [];
  const faint = [];
  const A = { entry: new THREE.Object3D(), exit: new THREE.Object3D() };
  A.entry.position.set(0, axisY, 0);
  A.exit.position.set(L, axisY, 0);
  group.add(A.entry, A.exit);
  const drumHeat = (x, y) => 0.7 + 0.3 * smooth(axisY + r, axisY - r, y);
  // the drum
  X(new THREE.CylinderGeometry(r, r, L, 64, Math.max(4, Math.round(L / 80)), true).rotateZ(Math.PI / 2).translate(L / 2, axisY, 0), { spec: 0.22, heat: drumHeat });
  // its head
  const dish = head === "dished" ? r * 0.42 : 4;
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.max(0.01, r * Math.cos(a)), dish * Math.sin(a)));
  }
  X(new THREE.LatheGeometry(pts, 64).rotateZ(-Math.PI / 2).translate(L, axisY, 0), { spec: 0.22, heat: () => 0.8 });
  // the mouth: a flange ring, its bolts, the lugs of the locking ring
  const ringAt = (x, r0, r1) => new THREE.RingGeometry(r0, r1, 64, 1).rotateY(Math.PI / 2).translate(x, axisY, 0);
  X(ringAt(0, r, r + 22), { rim: 0.18, heat: () => 0.6 });
  X(new THREE.CylinderGeometry(r + 22, r + 22, 14, 64, 1, true).rotateZ(Math.PI / 2).translate(7, axisY, 0), { rim: 0.2, heat: () => 0.6 });
  const boltGeos = [];
  for (let i = 0; i < bolts; i++) {
    const a = (i / bolts) * TAU;
    boltGeos.push(new THREE.CylinderGeometry(3.2, 3.2, 8, 6).rotateZ(Math.PI / 2).translate(-3, axisY + Math.sin(a) * (r + 13), Math.cos(a) * (r + 13)));
  }
  X(mergeGeometries(boltGeos), { shell: false, rim: 0.16, opacity: lines * 0.9 });
  const lugGeo = (x, rr, phase) => {
    const gs = [];
    for (let i = 0; i < lugs; i++) {
      const a = ((i + phase) / lugs) * TAU;
      gs.push(new THREE.BoxGeometry(10, 14, 22).rotateX(-a).translate(x, axisY + Math.sin(a) * rr, Math.cos(a) * rr));
    }
    return mergeGeometries(gs);
  };
  X(lugGeo(16, r + 28, 0), { shell: false, rim: 0.14, opacity: lines * 0.85 });
  // bands and saddles
  const nb = bands ?? Math.max(2, Math.round(L / 260));
  for (let i = 1; i <= nb; i++) {
    const x = (L * i) / (nb + 1);
    circle(segs, [x, axisY, 0], [0, 1, 0], [0, 0, 1], r + 5, 48);
    circle(segs, [x + 12, axisY, 0], [0, 1, 0], [0, 0, 1], r + 5, 48);
  }
  const ns = saddles ?? Math.max(2, Math.round(L / 450));
  for (let i = 0; i < ns; i++) {
    const x = L * (0.15 + (0.7 * i) / Math.max(1, ns - 1));
    const s = new THREE.Shape();
    const w = 0.8 * r;
    const yC = axisY - 0.6 * r;
    s.moveTo(-w - 10, 0);
    s.lineTo(w + 10, 0);
    s.lineTo(w, yC);
    for (let k = 1; k < 12; k++) {
      const a = 2 * Math.PI - Math.atan2(0.6, 0.8) - ((Math.PI - 2 * Math.atan2(0.6, 0.8)) * k) / 12;
      s.lineTo(r * Math.cos(a), axisY + r * Math.sin(a));
    }
    s.lineTo(-w, yC);
    s.lineTo(-w - 10, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 34, bevelEnabled: false }).rotateY(-Math.PI / 2).translate(x + 17, 0, 0);
    X(geo, { shell: false, rim: 0.12, opacity: lines * 0.85 });
  }
  // the cart's rails inside
  if (rails) for (const s of [-1, 1]) segs.push(-30, axisY - r * 0.78, s * r * 0.5, L - 10, axisY - r * 0.78, s * r * 0.5);
  // the air inlet on top, its valve wheel
  if (pipes) {
    const px = L * 0.72;
    X(new THREE.CylinderGeometry(9, 9, 70, 14, 1, true).translate(px, axisY + r + 30, 0), { rim: 0.22, opacity: lines * 0.85 });
    poly(segs, [[px, axisY + r + 64, 0], [px, axisY + r + 92, 0], [L + 60, axisY + r + 92, 0]]);
    circle(segs, [px, axisY + r + 74, 0], [1, 0, 0], [0, 0, 1], 18, 18);
  }
  // the pressure gauge on the near flank, near the door: a dial facing the camera, a needle
  let needle = null;
  if (gauge) {
    const gx = 80;
    const gy = axisY + r * 0.45;
    const gz = Math.sqrt(Math.max(0, r * r - (gy - axisY) ** 2)) + 22;
    segs.push(gx, gy, gz - 22, gx, gy, gz - 2);
    X(new THREE.CylinderGeometry(17, 17, 6, 28).rotateX(Math.PI / 2).translate(gx, gy, gz), { rim: 0.26, opacity: lines });
    for (let i = 0; i <= 6; i++) {
      const a = (-135 + (270 * i) / 6) * (Math.PI / 180);
      faint.push(gx + Math.sin(a) * 12, gy + Math.cos(a) * 12, gz + 3.2, gx + Math.sin(a) * 15, gy + Math.cos(a) * 15, gz + 3.2);
    }
    needle = new THREE.Group();
    needle.position.set(gx, gy, gz + 3.4);
    const nl = segLines([0, -3, 0, 0, 12.5, 0], { opacity: lines * 1.6, width: 2.2 });
    needle.add(F.lines(nl));
    group.add(needle);
  }
  // the door: on its hinge post, swinging out to −x
  const zs = hinge === "far" ? -1 : 1;
  const pivot = new THREE.Group();
  pivot.position.set(-6, axisY, zs * (r + 34));
  group.add(pivot);
  const doorPts = [];
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * (Math.PI / 2);
    doorPts.push(new THREE.Vector2(Math.max(0.01, (r + 18) * Math.cos(a)), r * 0.3 * Math.sin(a)));
  }
  const toPivot = (geo) => geo.translate(6, -axisY, -zs * (r + 34));
  X(toPivot(new THREE.LatheGeometry(doorPts, 64).rotateZ(Math.PI / 2).translate(0, axisY, 0)), { spec: 0.25, heat: () => 0.7 }, pivot);
  X(toPivot(lugGeo(-6, r + 22, 0.5)), { shell: false, rim: 0.14, opacity: lines * 0.85 }, pivot);
  const dSegs = [];
  dSegs.push(0, 40, 0, 0, -40, 0); // the hinge post
  for (const yy of [-r * 0.55, r * 0.55]) dSegs.push(0, yy, 0, 6, yy, -zs * (r + 34) * 0.85); // the arms
  pivot.add(F.lines(segLines(dSegs, { opacity: lines * 0.85 })));
  let sightM = null;
  if (sight) {
    const sp = toPivot(new THREE.PlaneGeometry(34, 34).rotateY(-Math.PI / 2).translate(-r * 0.3 - 1, axisY + r * 0.42, 0));
    sightM = spotMat({ core: 0.5, halo: 0.55 });
    const sm = new THREE.Mesh(sp, sightM);
    sm.renderOrder = 1;
    pivot.add(sm);
    const ss = [];
    circle(ss, [-r * 0.3 - 1.4 + 6, r * 0.42, -zs * (r + 34)], [0, 1, 0], [0, 0, 1], 12, 18);
    pivot.add(F.lines(segLines(ss, { opacity: lines })));
  }
  // the warmth inside
  const P = { h0: L * 0.04, h1: L * 0.96, inL: 0.5, outL: 0.6 };
  const innerM = innerMat({ L, prof: P, src: axisY - r, fall: r * 1.4, floor: 0.4 });
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(r - 5, r - 5, L - 6, 48, 1, true).rotateZ(Math.PI / 2).translate(L / 2, axisY, 0), innerM);
  inner.renderOrder = 1;
  group.add(inner);

  if (segs.length) group.add(F.lines(segLines(segs, { opacity: lines * 0.8 })));
  if (faint.length) group.add(F.lines(segLines(faint, { opacity: lines * 0.6 })));
  asShell(shells, 20);

  let lastDoor = -1;
  return {
    group, A,
    set({ amount = 1, door = 1, pressure = 0 } = {}) {
      F.set(amount);
      const on = amount > 0.003;
      const p = clamp01(pressure);
      for (const [m, k] of hotShells) m.userData.heat(0.1 * p * k); // 140 °C is not hot glass: the drum barely warms (signal is for glass above ≈ 450 °C)
      innerM.uniforms.uK.value = 0.16 * p;
      innerM.uniforms.uAmount.value = amount;
      inner.visible = on && p > 0.003;
      if (sightM) {
        sightM.uniforms.uK.value = 0.12 + 1.1 * p;
        sightM.uniforms.uAmount.value = amount;
      }
      if (needle) needle.rotation.z = (135 - 270 * (0.04 + 0.78 * p)) * (Math.PI / 180);
      if (door !== lastDoor) {
        lastDoor = door;
        pivot.rotation.y = zs * (1 - clamp01(door)) * 1.95;
      }
    },
  };
}

/* ═════════════════════════════ THE CONVEYOR ═════════════════════════════ */

/** The rollers' glass: build3d's, plus a soft mark on each roller that turns with it (the stage's shutter blurs it). */
function rollerMat({ rim = 0.3, edge = 0.45, mark = 0.3 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { ...glassUniforms(BRAND.ink, { rim, edge, power: 2.2, spec: 0.12, heatBase: 0.04, heatRim: 1.6 }), uPhi: { value: 0 }, uMark: { value: mark } },
    vertexShader: /* glsl */ `
      attribute vec3 aAxis; attribute float aHeat;
      varying vec3 vN; varying vec3 vV; varying vec2 vR; varying float vOff; varying float vHeat;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vR = position.xy - aAxis.xy; vOff = aAxis.z; vHeat = aHeat;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: GLASS_FRAG_HEAD + /* glsl */ `
      uniform float uPhi, uMark;
      varying vec3 vN; varying vec3 vV; varying vec2 vR; varying float vOff; varying float vHeat;
      void main() {
        if (uAmount < 0.003) discard;
        float g;
        float light = glassLight(normalize(vN), normalize(vV), g);
        float lr = length(vR);
        vec2 d = lr > 1e-4 ? vR / lr : vec2(1.0, 0.0);
        float ph = uPhi + vOff;
        float m = smoothstep(0.3, 1.0, dot(d, vec2(cos(ph), sin(ph))));
        light += uMark * m * (0.35 + 0.65 * g);
        float h = clamp(uHeat * vHeat, 0.0, 1.5);
        vec3 col = uColor * light * (1.0 - 0.5 * min(h, 1.0)) + heatLight(h, g);
        gl_FragColor = vec4(col * uAmount * uGain, 1.0);
      }`,
  });
}

/**
 * makeConveyor — rollers across the line, merged in one glass mesh (each with its turning mark), their two side
 * rails with a bearing at every roller, legs every `legs` cm to the floor. `radius` the rollers'; `warm`:
 * [[x0, x1, k]…] stretches where hot glass rides on them and lights them (signal, ×`heat` of set()).
 */
export function makeConveyor({ from = 0, to = 1000, half = 200, y = 90, pitch = 45, gaps = [], radius = 5, rails = true, legs = 360, warm = null, mark = 0.3, lines = 0.4, seed = 3 } = {}) {
  const group = new THREE.Group();
  const F = fader();
  const Rr = radius;
  const xs = [];
  for (let x = from; x <= to; x += pitch) if (!gaps.some(([a, b]) => x > a && x < b)) xs.push(x);
  const yc = y - Rr;
  const R = rng(seed);
  const warmAt = (x) => {
    if (!warm) return 0;
    let h = 0;
    for (const [a, b, k = 1] of warm) h = Math.max(h, k * smooth(a - 60, a, x) * (1 - smooth(a + (b - a) * 0.25, b, x)));
    return h;
  };
  // the rollers
  const one = new THREE.CylinderGeometry(Rr, Rr, half * 2, 14, 1, true).rotateX(Math.PI / 2);
  const geos = [];
  for (const x of xs) {
    const g = one.clone().translate(x, yc, 0);
    const n = g.attributes.position.count;
    const ax = new Float32Array(n * 3);
    const off = R() * TAU;
    const ht = new Float32Array(n).fill(warmAt(x));
    for (let i = 0; i < n; i++) ax.set([x, yc, off], i * 3);
    g.setAttribute("aAxis", new THREE.BufferAttribute(ax, 3));
    g.setAttribute("aHeat", new THREE.BufferAttribute(ht, 1));
    geos.push(g);
  }
  const rm = rollerMat({ mark });
  let rollers = null;
  const segs = [];
  if (geos.length) {
    const merged = mergeGeometries(geos);
    rollers = new THREE.Mesh(merged, rm);
    group.add(rollers);
    // their ends: a circle each, on the bearings
    for (const x of xs) for (const s of [-1, 1]) circle(segs, [x, yc, s * half], [1, 0, 0], [0, 1, 0], Rr, 12);
    asShell(rollers, 20);
  }
  // the rails (one per run of rollers between gaps), the legs
  const runs = [];
  for (const x of xs) {
    const last = runs[runs.length - 1];
    if (last && x - last[1] <= pitch + 0.5) last[1] = x;
    else runs.push([x, x]);
  }
  const shells = [];
  if (rails) {
    const rg = [];
    for (const [a, b] of runs) {
      for (const s of [-1, 1]) {
        const z0 = s * (half + 2);
        rg.push(boxAt(a - pitch * 0.4, yc - 8, Math.min(z0, z0 + s * 9), b + pitch * 0.4, yc + 7, Math.max(z0, z0 + s * 9)));
      }
      for (let x = a; x <= b + 0.5; x += legs) for (const s of [-1, 1]) segs.push(x, yc - 8, s * (half + 6), x, 0, s * (half + 6));
      if (b - a > legs * 0.5) for (const s of [-1, 1]) segs.push(b, yc - 8, s * (half + 6), b, 0, s * (half + 6));
    }
    if (rg.length) {
      const m = xray(mergeGeometries(rg), { rim: 0.09, edge: 0.18, base: 0.002, opacity: lines * 0.9 });
      group.add(m);
      F.shell(m);
      shells.push(m);
      asShell(shells, 20);
    }
  }
  if (segs.length) group.add(F.lines(segLines(segs, { opacity: lines * 0.8 })));
  F.fn((a) => {
    rm.uniforms.uAmount.value = a;
    if (rollers) rollers.visible = a > 0.003;
  });
  return {
    group,
    set({ amount = 1, roll = 0, heat = 1 } = {}) {
      F.set(amount);
      // roll / radius, wrapped in double precision before it reaches the shader's floats
      rm.uniforms.uPhi.value = -((roll / Rr) % TAU);
      rm.uniforms.uHeat.value = heat;
    },
  };
}

export { setGlow };
