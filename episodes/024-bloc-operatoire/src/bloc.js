// DOSSIER 024 — the operating room, seen like an X-ray. The floor is y = 0 and only a grid; the table's long axis
// is x, YOUR HEAD AT −x (the anaesthesia side, the ventilator there), your feet at +x; the room is open toward +z
// (the camera's side); the back wall is the plane z = ROOM.z0, behind the surgeon; behind it, in the technical
// space, the IT cabinet that holds the system (model.js hangs on `mount`).
// Glass and fine lines: the walls and the ceiling (their edges, their seams, their tiles), the carts, the casing of
// the appliance, the cabinet, the lamp's arm, the hose, the drape, you and the surgeon. Solid only what counts: the
// table, the lamp's head and its lit face, the bellows of the ventilator, the WIRE in the appliance and the sheet
// metal it touches (lit, with its few screws), the cord and its protective conductor, the IT sockets, the alarm
// repeater, the cabinet's shelf; and in the walls the two conductors of the IT circuit, dark, the current running
// along them in ink dashes.
// Three colours. signal: the wire on the metal (and its bare copper, a breath away). veille: the cabinet's glow, the
// head that looks for the fault, the repeater's light and its rings. ink: the rest, the ordinary current included.
// Tact: you are asleep; a drape covers you up to the chest, the surgeon's hands work above it. Nothing else.
// Everything is a function of the state and of `time` (update() is called sixteen times a frame: no allocation).
//
// Shell orders (see `asShell`: a lower order is seen through a higher one): the surgeon 10 · the drape 11 (drawn
// before you: it hides your body under it, your head and shoulders stay) · you 12
// · the carts, the casing 16 · the cabinet 18 · the lamp's arm 20 · the hose 22. Glows that live INSIDE a shell
// (the fault, the cabinet's light) are drawn before the shells (order 6): a shell's depth never hides them.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makeSurface, makePool } from "@kit/atmo.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, glass, asShell, box, cyl, lathe, anchor, lineMat, edgesOf, setGlow } from "@kit/build3d.js";
import { ROOM, TABLE, YOU, LAMP, RESP, SURGEON, DEVICE, FAULT, SOCKETS, REPEATER, CABINET, MOUNT, CONDUIT, OUT } from "./plan.js";
import { dressBloc } from "./habillage.js"; // the decorator's dressing (docs/recette-decorateur.md)

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.86, 0.74); // the heart of the contact: signal pushed to white
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const TAU = Math.PI * 2;

const ORDER = { surgeon: 10, drape: 11, you: 12, things: 16, cabinet: 18, arm: 20, hose: 22, inner: 6 };
const PAD = TABLE.top + 2; // the top of the table's pad: what you lie on
const BREATH = window.__EPISODE.duration / 24; // seconds per breath (≈ 4 s), a whole number of breaths in the film: the last frame breathes like the first
const PERIOD = 7; // the current's dashes: one every PERIOD cm…
const SPEED = 10; // …running at SPEED cm/s — a seventh of a period per frame at most

/* ───────────────────────────────────────────────────────────── helpers */

/** Many segments in one draw: `list` is a flat [x1,y1,z1, x2,y2,z2, …]. */
function segments(list, { color = BRAND.ink, width = 1.8, opacity = 0.4 } = {}) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(list);
  const obj = new LineSegments2(geo, lineMat(color, width, { opacity }));
  obj.renderOrder = 2;
  return obj;
}
const seg = (L, a, b) => L.push(a[0], a[1], a[2], b[0], b[1], b[2]);

/** A polyline with its corners rounded by `r`, points never further apart than `step`. */
function roundPath(pts, r = 6, step = 2) {
  const P = pts.map((p) => (p.isVector3 ? p.clone() : V(...p)));
  const out = [];
  const push = (v) => {
    if (!out.length || out[out.length - 1].distanceToSquared(v) > 1e-8) out.push(v.clone());
  };
  const straight = (a, b) => {
    const n = Math.max(1, Math.ceil(a.distanceTo(b) / step));
    for (let i = 0; i <= n; i++) push(a.clone().lerp(b, i / n));
  };
  let from = P[0];
  for (let i = 1; i < P.length - 1; i++) {
    const u = P[i - 1].clone().sub(P[i]);
    const w = P[i + 1].clone().sub(P[i]);
    const k = Math.min(r, u.length() / 2.2, w.length() / 2.2);
    const a = P[i].clone().addScaledVector(u.normalize(), k);
    const b = P[i].clone().addScaledVector(w.normalize(), k);
    straight(from, a);
    for (let j = 1; j <= 8; j++) {
      const t = j / 8;
      push(a.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(P[i], 2 * t * (1 - t)).addScaledVector(b, t * t));
    }
    from = b;
  }
  straight(from, P[P.length - 1]);
  return out;
}
/** How far along `path` its point nearest to `p` is. */
function along(path, p) {
  let best = 0;
  let bestD = Infinity;
  let s = 0;
  for (let i = 0; i < path.length; i++) {
    if (i) s += path[i].distanceTo(path[i - 1]);
    const d = path[i].distanceToSquared(p);
    if (d < bestD) [bestD, best] = [d, s];
  }
  return best;
}
/** The point `s` cm along `path`, written into `out` (no allocation: called every frame). */
function pointAt(path, cum, s, out) {
  if (s <= 0) return out.copy(path[0]);
  for (let i = 1; i < path.length; i++) {
    if (s <= cum[i]) {
      const d = cum[i] - cum[i - 1];
      return out.copy(path[i - 1]).lerp(path[i], d > 1e-6 ? (s - cum[i - 1]) / d : 0);
    }
  }
  return out.copy(path[path.length - 1]);
}
function cumulative(path) {
  const c = [0];
  for (let i = 1; i < path.length; i++) c.push(c[i - 1] + path[i].distanceTo(path[i - 1]));
  return c;
}

/** A tube round `path`, its vertices carrying `aS` (cm along the path, from `s0`). */
function sweep(path, radius, radial = 12, s0 = 0) {
  const n = path.length;
  const ring = radial + 1;
  const pos = new Float32Array(n * ring * 3);
  const nor = new Float32Array(n * ring * 3);
  const aS = new Float32Array(n * ring);
  const t = V();
  const N = V();
  const B = V();
  let s = s0;
  for (let i = 0; i < n; i++) {
    t.subVectors(path[Math.min(n - 1, i + 1)], path[Math.max(0, i - 1)]).normalize();
    if (i === 0) N.crossVectors(t, Math.abs(t.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0)).normalize();
    else N.addScaledVector(t, -N.dot(t)).normalize(); // carried along: the tube never twists
    B.crossVectors(t, N);
    if (i) s += path[i].distanceTo(path[i - 1]);
    for (let j = 0; j < ring; j++) {
      const th = (j / radial) * TAU;
      const dx = N.x * Math.cos(th) + B.x * Math.sin(th);
      const dy = N.y * Math.cos(th) + B.y * Math.sin(th);
      const dz = N.z * Math.cos(th) + B.z * Math.sin(th);
      const k = (i * ring + j) * 3;
      pos[k] = path[i].x + dx * radius;
      pos[k + 1] = path[i].y + dy * radius;
      pos[k + 2] = path[i].z + dz * radius;
      nor[k] = dx;
      nor[k + 1] = dy;
      nor[k + 2] = dz;
      aS[i * ring + j] = s;
    }
  }
  const index = [];
  for (let i = 0; i < n - 1; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * ring + j;
      index.push(a, a + ring, a + 1, a + 1, a + ring, a + ring + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
  geo.setIndex(index);
  return geo;
}
const smoothPath = (pts, n = 80) => new THREE.CatmullRomCurve3(pts.map((p) => V(...p)), false, "centripetal").getPoints(n);

/** A light that has a place: a disc that always faces the eye, brightest at its heart, `power` its tail (world size). */
function glowSprite(color, size, power = 2.2) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uSize: { value: size }, uPower: { value: power }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uSize; varying vec2 vUv;
      void main() {
        vUv = position.xy * 2.0;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower, uAmount; varying vec2 vUv;
      void main() {
        if (uAmount < 0.002) discard;
        float a = pow(clamp(1.0 - length(vUv), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  mesh.frustumCulled = false;
  return { mesh, u: mat.uniforms };
}

/** A flat patch of light (a plane): radial from `centre` (in the plane's own x, y), `radius` cm. */
function patchLight(w, h, color, centre, radius, power = 1.6) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uC: { value: new THREE.Vector2(...centre) }, uR: { value: radius }, uPower: { value: power }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform vec2 uC; uniform float uR, uPower, uAmount; varying vec2 vP;
      void main() {
        if (uAmount < 0.002) discard;
        float d = length(vP - uC) / max(uR, 1e-3);
        gl_FragColor = vec4(uColor * pow(clamp(1.0 - d, 0.0, 1.0), uPower) * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.renderOrder = 1;
  return { mesh, u: mat.uniforms };
}

/** A conductor of the IT circuit: a dark sleeve, the current's ink dashes running along it, and the veille trail of
 *  the head that looks for the fault. `aS` is shared along a branch (`s0`), so the trail goes on from the trunk. */
function conductorMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uInk: { value: INK }, uVeille: { value: VEILLE }, uFlow: { value: 0 }, uCur: { value: 1 }, uAmt: { value: 1 },
      uSeek: { value: -1 }, uSeekOn: { value: 0 }, uSeekMax: { value: 1e5 },
    },
    vertexShader: /* glsl */ `
      attribute float aS; varying float vS; varying vec3 vN; varying vec3 vP;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vS = aS; vN = normalize(normalMatrix * normal); vP = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uVeille; uniform float uFlow, uCur, uAmt, uSeek, uSeekOn, uSeekMax;
      varying float vS; varying vec3 vN; varying vec3 vP;
      void main() {
        float facing = clamp(dot(normalize(vN), normalize(-vP)), 0.0, 1.0);
        vec3 col = uInk * (0.06 + 0.2 * pow(facing, 1.5)) * uAmt;
        // the current: one dash per period, a little under half of it lit; too far to tell apart, they melt into their mean
        float q = (vS - uFlow) / ${PERIOD.toFixed(1)};
        float w = clamp(fwidth(q), 1e-4, 1.0);
        float d = abs(fract(q) - 0.5);
        float lit = 1.0 - smoothstep(0.21 - w, 0.21 + w, d);
        lit = mix(lit, 0.42, smoothstep(0.3, 0.65, w));
        col += uInk * 1.25 * lit * uCur * (0.55 + 0.45 * facing);
        // the search: a veille trail behind the head, on this branch only up to uSeekMax
        float behind = uSeek - vS;
        float trail = exp(-max(behind, 0.0) / 40.0) * smoothstep(-1.5, 0.0, behind) * step(vS, uSeekMax);
        col = mix(col, uVeille * (0.9 + 1.1 * facing), clamp(trail * uSeekOn, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

/* ───────────────────────────────────────────────────────────── the drape */

/** The drape: from your chest to beyond your feet, over the shape of your body, hanging down the table's sides. */
function drapeGeometry() {
  const KEYS = [[-50, 19], [-40, 18], [-22, 16], [4, 15], [30, 14.5], [56, 13], [70, 15], [79, 21], [88, 17], [97, 8], [104, 2]];
  const hAt = (x) => {
    if (x <= KEYS[0][0]) return KEYS[0][1];
    for (let i = 1; i < KEYS.length; i++) {
      if (x <= KEYS[i][0]) {
        const u = (x - KEYS[i - 1][0]) / (KEYS[i][0] - KEYS[i - 1][0]);
        return KEYS[i - 1][1] + (KEYS[i][1] - KEYS[i - 1][1]) * u * u * (3 - 2 * u);
      }
    }
    return KEYS[KEYS.length - 1][1];
  };
  const HEM = PAD - 30;
  const cross = (h) => {
    const pts = [];
    for (let i = 0; i <= 5; i++) pts.push([-31, HEM + (PAD - 5 - HEM) * (i / 5)]);
    pts.push([-30.6, PAD - 1.6], [-29.4, PAD + 0.6]);
    for (let i = 0; i <= 26; i++) {
      const z = -28 + (56 * i) / 26;
      const b = Math.pow(Math.max(0, 1 - (z / 28.5) ** 2), 0.6);
      pts.push([z, PAD + 1.3 + h * b]);
    }
    pts.push([29.4, PAD + 0.6], [30.6, PAD - 1.6]);
    for (let i = 5; i >= 0; i--) pts.push([31, HEM + (PAD - 5 - HEM) * (i / 5)]);
    return pts;
  };
  const rows = [];
  for (let x = -50; x <= 104; x += 2) rows.push([x, 0]);
  for (let k = 1; k <= 6; k++) rows.push([104 + k * 0.35, k / 6]); // the foot end falls over the table's end
  const C = cross(0).length;
  const pos = new Float32Array(rows.length * C * 3);
  rows.forEach(([x, fall], i) => {
    cross(hAt(x)).forEach(([z, y], j) => {
      const k = (i * C + j) * 3;
      pos[k] = x;
      pos[k + 1] = y + (HEM - y) * fall * fall * (3 - 2 * fall);
      pos[k + 2] = z * (1 + 0.04 * fall);
    });
  });
  const index = [];
  for (let i = 0; i < rows.length - 1; i++)
    for (let j = 0; j < C - 1; j++) {
      const a = i * C + j;
      index.push(a, a + C, a + 1, a + 1, a + C, a + C + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  // what rises with your breath: the drape over your chest, never its hem nor your legs
  const rise = new Float32Array(pos.length / 3);
  for (let i = 0; i < rise.length; i++) rise[i] = smooth(25, -40, pos[i * 3]) * clamp01((pos[i * 3 + 1] - PAD - 1) / 16);
  geo.setAttribute("aRise", new THREE.BufferAttribute(rise, 1));
  return geo;
}

/* ───────────────────────────────────────────────────────────── the set */

export function buildBloc() {
  const group = new THREE.Group();
  const LINES = []; // { mat, base, dim }: line opacities, faded by shell and (by `dim`) by the dark
  const GLASS = []; // { u, dim, lamp }: glass shells
  const keepLines = (obj, dim = 0.6) => {
    LINES.push({ mat: obj.material, base: obj.material.opacity, dim });
    return obj;
  };
  const keepGlass = (mat, dim = 0.55, lamp = 0) => {
    GLASS.push({ u: mat.uniforms, dim, lamp });
    return mat;
  };
  const mesh = (parent, geo, mat, pos, o = {}) => {
    const m = new THREE.Mesh(geo, mat);
    if (pos) m.position.set(...pos);
    if (o.rot) m.rotation.set(...o.rot);
    const isSolid = !mat.isShaderMaterial && !mat.isMeshBasicMaterial;
    m.castShadow = isSolid && o.shadow !== false;
    m.receiveShadow = isSolid;
    if (o.edges) m.add(keepLines(edgesOf(geo, { color: o.edgeColor ?? BRAND.ink, width: o.edgeWidth ?? 1.8, opacity: o.edges }), o.edgeDim ?? 0.5));
    parent.add(m);
    return m;
  };
  const shellMesh = (parent, geo, mat, order, pos, o = {}) => {
    const m = mesh(parent, geo, mat, pos, o);
    asShell(m, order);
    return m;
  };

  /* ═════════════ 1 · THE ROOM: lines, ceiling lights, the floor's grid ═════════════ */
  const { x0, x1, z0, z1, h } = ROOM;
  const strong = [];
  seg(strong, [x0, 0.3, z0], [x1, 0.3, z0]);
  seg(strong, [x0, h, z0], [x1, h, z0]);
  for (const x of [x0, x1]) {
    seg(strong, [x, 0, z0], [x, h, z0]);
    seg(strong, [x, 0.3, z0], [x, 0.3, z1]);
    seg(strong, [x, h, z0], [x, h, z1]);
    seg(strong, [x, 0, z1], [x, h, z1]);
  }
  group.add(keepLines(segments(strong, { width: 2, opacity: 0.36 })));
  const fine = [];
  for (let i = 1; i < 6; i++) {
    const x = x0 + ((x1 - x0) * i) / 6;
    seg(fine, [x, 0, z0 + 0.3], [x, h, z0 + 0.3]);
  }
  seg(fine, [x0, 12, z0 + 0.3], [x1, 12, z0 + 0.3]); // the skirting
  seg(fine, [x0, h, z0 - 8], [x1, h, z0 - 8]); // the wall's thickness
  for (const x of [x0, x1]) {
    for (let i = 1; i < 5; i++) {
      const z = z0 + ((z1 - z0) * i) / 5;
      seg(fine, [x, 0, z], [x, h, z]);
    }
    seg(fine, [x, 12, z0], [x, 12, z1]);
  }
  group.add(keepLines(segments(fine, { width: 1.8, opacity: 0.2 })));
  const faint = [];
  for (let x = x0 + 60; x < x1; x += 60) seg(faint, [x, h - 0.2, z0], [x, h - 0.2, z1]);
  for (let z = z0 + 60; z < z1; z += 60) seg(faint, [x0, h - 0.2, z], [x1, h - 0.2, z]);
  // the technical space behind the back wall, where the cabinet stands
  const TX = 186;
  const TZ = z0 - 110;
  seg(faint, [TX, 0.3, z0 - 8], [TX, 0.3, TZ]);
  seg(faint, [TX, 0.3, TZ], [x1, 0.3, TZ]);
  seg(faint, [x1, 0.3, z0 - 8], [x1, 0.3, TZ]);
  seg(faint, [TX, 0, TZ], [TX, h, TZ]);
  seg(faint, [x1, 0, TZ], [x1, h, TZ]);
  seg(faint, [TX, h, TZ], [x1, h, TZ]);
  seg(faint, [TX, 0, z0 - 8], [TX, h, z0 - 8]);
  group.add(keepLines(segments(faint, { width: 1.8, opacity: 0.12 })));

  // the ceiling's lights: the room's general light (they go out with `dark`)
  const ceilMat = glow(BRAND.ink, 0.7, { additive: true });
  const ceilFrames = [];
  for (const [cx, cz] of [[-230, -150], [230, -150], [-230, 110], [230, 110]]) {
    mesh(group, new THREE.PlaneGeometry(100, 50), ceilMat, [cx, h - 0.6, cz], { rot: [Math.PI / 2, 0, 0] });
    const c = [[cx - 52, cz - 27], [cx + 52, cz - 27], [cx + 52, cz + 27], [cx - 52, cz + 27]];
    for (let i = 0; i < 4; i++) seg(ceilFrames, [c[i][0], h - 0.5, c[i][1]], [c[(i + 1) % 4][0], h - 0.5, c[(i + 1) % 4][1]]);
  }
  group.add(keepLines(segments(ceilFrames, { width: 1.8, opacity: 0.3 }), 0.5));

  // the floor: a grid, never a slab (seen from above, a slab is a grey band across the picture)
  const floor = makeSurface({ radius: 780, cell: 20, fade: 360, lift: 4 });
  floor.group.children[0].visible = false;
  floor.group.position.set(0, 0, -40);
  group.add(floor.group);

  /* ═════════════ 2 · THE TABLE ═════════════ */
  const steel = solid(0x7a8188, { rough: 0.42, metal: 0.4 });
  const steelLight = solid(0xa3aab0, { rough: 0.38, metal: 0.45 });
  const darkSteel = solid(0x454b51, { rough: 0.55, metal: 0.3 });
  const padMat = solid(0x3a4045, { rough: 0.82 });
  const T = TABLE;
  mesh(group, box(T.len, 5, T.w, 1.2), steel, [T.at[0], T.top - 4.5, T.at[2]], { edges: 0.5 });
  mesh(group, box(T.len - 4, 4, T.w - 3, 1.6), padMat, [T.at[0], T.top, T.at[2]], { edges: 0.35 });
  mesh(group, box(T.col[0], T.top - 15, T.col[1], 2), darkSteel, [T.at[0] + 10, (T.top - 15) / 2 + 8, T.at[2]], { edges: 0.45 });
  mesh(group, box(86, 8, 58, 2), darkSteel, [T.at[0] + 10, 4, T.at[2]], { edges: 0.45 });
  for (const s of [-1, 1]) mesh(group, box(T.len - 14, 2.4, 1.4, 0.4), steelLight, [T.at[0], T.top - 4.5, T.at[2] + s * (T.w / 2 + 1.4)], { edges: 0.4 });

  // the lamp's light on the table (clipped to the pad: a pool would float in the air beyond its edges)
  const LH = V(...LAMP.head);
  const tablePool = patchLight(T.len - 4, T.w - 3, BRAND.ink, [LH.x - T.at[0], -(LH.z - T.at[2])], 78, 1.5);
  tablePool.mesh.rotation.x = -Math.PI / 2;
  tablePool.mesh.position.set(T.at[0], PAD + 0.15, T.at[2]);
  group.add(tablePool.mesh);
  // and what spills past it onto the floor, round the table
  const floorPool = makePool({ radius: 190, color: BRAND.ink });
  floorPool.mesh.position.set(LH.x, 0.4, LH.z - 10);
  group.add(floorPool.mesh);

  /* ═════════════ 3 · YOU, ASLEEP ═════════════ */
  const you = makeFigure({ shell: true, hands: "flat", order: ORDER.you, glassK: 1.25, through: 0.2, skin: BRAND.ink });
  you.ghost(true);
  // standing, facing +z → lying on the back, the face up (+y), the head toward −x
  const lieY = new THREE.Group();
  lieY.rotation.y = Math.PI / 2;
  const lieX = new THREE.Group();
  lieX.rotation.x = -Math.PI / 2;
  lieY.add(lieX);
  lieX.add(you.group);
  const LIE = PAD + 8; // the body's axis: its back sinks into the pad a little
  lieY.position.set(YOU.head[0] + 165.5, LIE, YOU.head[2]);
  group.add(lieY);
  you.reach("L", V(18, 86, -6)); // the arms along the body, under the drape
  you.reach("R", V(-18, 86, -6));
  const trunk = you.torso.children[0];
  const TRUNK_Z = trunk.scale.z;
  // the mask on your face, and the hose to the ventilator
  const maskMat = solid(0xc2bcb0, { rough: 0.5 });
  const mask = mesh(you.torso, lathe([[0, 0], [4.6, 0], [4.2, 2.6], [2.6, 4.2], [1.4, 5.2], [0, 5.2]], 40, { bevel: 0.3 }), maskMat, [0, 72.5, 9.6], { rot: [Math.PI / 2, 0, 0], edges: 0.35 });
  group.updateMatrixWorld(true);
  const MOUTH = mask.localToWorld(V(0, 5, 0));
  const B0 = V(...RESP.bellows);
  const hoseMat = keepGlass(glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.2, edge: 0.55, spec: 0.5, through: 0.2 }));
  const hosePts = [[MOUTH.x, MOUTH.y, MOUTH.z], [MOUTH.x - 6, MOUTH.y + 8, MOUTH.z - 3], [MOUTH.x - 26, MOUTH.y + 13, -14], [B0.x + 16, B0.y - 2, B0.z + 10], [B0.x + 7, B0.y - 14, B0.z + 7]];
  shellMesh(group, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hosePts.map((p) => V(...p))), 60, 1.5, 12, false), hoseMat, ORDER.hose);

  // the drape, up to your chest
  const drapeMat = keepGlass(glass(BRAND.ink, { base: 0.022, rim: 0.26, power: 2.2, edge: 0.55, spec: 0.5, through: 0.12 }), 0.45, 1);
  drapeMat.uniforms.uRise = { value: 0 };
  drapeMat.vertexShader = drapeMat.vertexShader
    .replace("void main() {", "attribute float aRise; uniform float uRise;\n      void main() {")
    .replace("modelViewMatrix * vec4(position, 1.0)", "modelViewMatrix * vec4(position + vec3(0.0, uRise * aRise, 0.0), 1.0)");
  shellMesh(group, drapeGeometry(), drapeMat, ORDER.drape);

  /* ═════════════ 4 · THE OPERATING LAMP ═════════════ */
  const lampMat = solid(0x8f969c, { rough: 0.4, metal: 0.35 });
  const head = mesh(group, lathe([[0, -6.2], [33.6, -6.2], [34.7, -4.8], [34.9, 1], [33, 4.4], [27, 7.8], [16, 10.6], [6, 11.8], [0, 12]], 96, { bevel: 0.5 }), lampMat, [LH.x, LH.y, LH.z], { edges: 0.45, edgeColor: 0x1d2226 });
  // its face: dark, and its cells in it — the brightest thing of the room, until it goes out
  const faceMat = solid(0x15191c, { rough: 0.6 });
  mesh(head, new THREE.CircleGeometry(33.4, 72), faceMat, [0, -6.25, 0], { rot: [Math.PI / 2, 0, 0], shadow: false });
  const cellMat = glow(BRAND.ink, 2.2);
  const rimMat = solid(0xb8b2a6, { rough: 0.35, metal: 0.3 });
  const CELLS = [[0, 0, 8.2]];
  for (let i = 0; i < 6; i++) CELLS.push([20.5 * Math.cos((i * TAU) / 6 + 0.26), 20.5 * Math.sin((i * TAU) / 6 + 0.26), 7.6]);
  for (const [cx, cz, r] of CELLS) {
    mesh(head, new THREE.RingGeometry(r, r + 1.7, 48), rimMat, [cx, -6.32, cz], { rot: [Math.PI / 2, 0, 0], shadow: false });
    mesh(head, new THREE.CircleGeometry(r, 48), cellMat, [cx, -6.36, cz], { rot: [Math.PI / 2, 0, 0] });
  }
  mesh(head, cyl(2.6, 9, 0.4, 32), steelLight, [0, -10.5, 0], { edges: 0.3, edgeColor: 0x1d2226 }); // the sterile handle
  const lipMat = glow(BRAND.ink, 1.2);
  mesh(head, new THREE.RingGeometry(31.4, 33.5, 96), lipMat, [0, -6.3, 0], { rot: [Math.PI / 2, 0, 0] });
  head.rotation.set(-0.42, 0, -0.2); // turned toward the table's near side, where the camera stands
  head.updateMatrix();
  const FACE_N = V(0, -1, 0).applyEuler(head.rotation);
  const lampHalo = glowSprite(0xfff1e2, 120, 2.8);
  lampHalo.mesh.position.copy(LH).addScaledVector(FACE_N, 12);
  group.add(lampHalo.mesh);
  // its arm, of glass, from the ceiling
  const PV = V(...LAMP.pivot);
  const ARM_Y = LH.y + 50;
  const armMat = keepGlass(glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.2, edge: 0.6, spec: 0.5, through: 0.2 }));
  const TOP = V(0, 12.5, 0).applyEuler(head.rotation).add(LH);
  const armPath = roundPath([[TOP.x, TOP.y, TOP.z], [LH.x, ARM_Y, LH.z], [PV.x, ARM_Y, PV.z], [PV.x, PV.y - 4, PV.z]], 9, 2);
  shellMesh(group, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(armPath), 120, 2.6, 14, false), armMat, ORDER.arm);
  mesh(group, new THREE.SphereGeometry(4.2, 24, 16), darkSteel, [PV.x, ARM_Y, PV.z]);
  mesh(group, cyl(9, 5, 0.6, 40), darkSteel, [PV.x, PV.y - 2.5, PV.z], { edges: 0.4 });

  /* ═════════════ 5 · THE VENTILATOR ═════════════ */
  const RX = RESP.at[0];
  const RZ = RESP.at[2] - 8; // the cart a little back: its bellows column stands in front of it, on a bracket
  const [RW, RH, RD] = RESP.size;
  const cartMat = keepGlass(glass(BRAND.ink, { base: 0, rim: 0.16, power: 2.4, edge: 0.5, spec: 0.3, through: 0.25 }));
  shellMesh(group, box(RW, RH - 4, RD - 8, 2), cartMat, ORDER.things, [RX, (RH - 4) / 2 + 6, RZ], { edges: 0.42, edgeDim: 0.55 });
  mesh(group, box(RW + 2, 3, RD - 6, 0.8), darkSteel, [RX, RH + 1.5, RZ], { edges: 0.4 });
  const drawers = [];
  for (const y of [34, 62, 90]) seg(drawers, [RX - RW / 2 + 3, y, RZ + (RD - 8) / 2 + 0.2], [RX + RW / 2 - 3, y, RZ + (RD - 8) / 2 + 0.2]);
  group.add(keepLines(segments(drawers, { width: 1.8, opacity: 0.3 })));
  const wheelMat = solid(0x2c3135, { rough: 0.7 });
  for (const [dx, dz] of [[-24, -16], [24, -16], [-24, 16], [24, 16]]) mesh(group, cyl(3, 2.4, 0.4, 24), wheelMat, [RX + dx, 3, RZ + dz], { rot: [0, 0, Math.PI / 2] });
  // the bellows column: a bracket, a base, a glass column, a cap
  mesh(group, box(26, 3, B0.z - RZ - (RD - 8) / 2 + 14, 0.6), darkSteel, [B0.x, B0.y - 19, (B0.z + RZ + (RD - 8) / 2) / 2], { edges: 0.4 });
  mesh(group, cyl(12.6, 2.4, 0.5, 48), steel, [B0.x, B0.y - 17, B0.z], { edges: 0.4 });
  const COL = { r: 11, h: 34, y0: B0.y - 15.8 };
  const colMat = keepGlass(glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.2, edge: 0.6, spec: 0.7, through: 0.25 }), 0.5);
  shellMesh(group, new THREE.CylinderGeometry(COL.r, COL.r, COL.h, 48, 1, true), colMat, ORDER.things, [B0.x, COL.y0 + COL.h / 2, B0.z]);
  mesh(group, cyl(12, 2.2, 0.5, 48), steel, [B0.x, COL.y0 + COL.h + 1.1, B0.z], { edges: 0.4 });
  // the bellows: an accordion, solid, that rises and falls
  const FOLD = [];
  for (let k = 0; k <= 20; k++) FOLD.push([k % 2 ? 7.9 : 9.7, k * 1.2]);
  const bellowsMat = solid(0xcfc9bd, { rough: 0.6 });
  const bellows = mesh(group, lathe([[0, 0], ...FOLD, [0, 24]], 56), bellowsMat, [B0.x, COL.y0 + 0.4, B0.z]);
  const bellowsTop = mesh(group, cyl(9.9, 1.4, 0.3, 48), steelLight, [B0.x, COL.y0 + 25, B0.z], { edges: 0.3, edgeColor: 0x1d2226 });
  // its screen: a slow pressure curve, ink, that goes out with the dark
  mesh(group, cyl(1.5, 20, 0.3, 16), darkSteel, [RX + 6, RH + 13, RZ - 4]);
  const screen = new THREE.Group();
  screen.position.set(RX + 6, RH + 34, RZ - 2);
  screen.rotation.set(-0.12, -0.62, 0);
  group.add(screen);
  mesh(screen, box(36, 25, 2.6, 0.8), solid(0x22272b, { rough: 0.6 }), [0, 0, 0], { edges: 0.45 });
  const screenMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: INK }, uAmount: { value: 1 }, uTime: { value: 0 }, uVent: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uTime, uVent; varying vec2 vUv;
      float breath(float t) { float u = fract(t / ${BREATH.toFixed(4)}); return smoothstep(0.0, 0.3, u) * (1.0 - smoothstep(0.42, 0.78, u)); }
      float trace(float y, float at) { float w = fwidth(vUv.y) * 1.2 + 0.022; return 1.0 - smoothstep(w * 0.5, w, abs(y - at)); }
      void main() {
        float ts = uTime - (1.0 - vUv.x) * 8.0;
        float l1 = trace(vUv.y, 0.56 + 0.3 * breath(ts) * uVent);
        float l2 = trace(vUv.y, 0.2 + 0.12 * breath(ts - 0.5) * uVent);
        float c = 0.035 + 0.9 * l1 + 0.45 * l2;
        gl_FragColor = vec4(uColor * c * uAmount, 1.0);
      }`,
  });
  mesh(screen, new THREE.PlaneGeometry(32, 21), screenMat, [0, 0, 1.36]);

  /* ═════════════ 6 · THE SURGEON ═════════════ */
  const surgeon = makeFigure({ shell: true, hands: "real", order: ORDER.surgeon, glassK: 0.85, through: 0.15, skin: BRAND.ink });
  surgeon.ghost(true);
  surgeon.group.position.set(...SURGEON.at);
  group.add(surgeon.group);
  surgeon.lean(15);
  // the cap and the mask, in volumes: the same glass
  const cap = new THREE.Mesh(new THREE.SphereGeometry(11.4, 36, 18, 0, TAU, 0, Math.PI / 2), surgeon.body);
  cap.scale.set(1, 0.72, 1.02);
  cap.position.set(0, 166.5 - surgeon.HIP + 2.4, 0);
  const smask = new THREE.Mesh(box(13, 8.5, 5, 2.2), surgeon.body);
  smask.position.set(0, 166.5 - surgeon.HIP - 4.6, 9.8);
  surgeon.torso.add(cap, smask);
  asShell([cap, smask], ORDER.surgeon);
  surgeon.shadow.visible = true;
  const S0 = V(...SURGEON.at);
  const HANDS = { L: V(9, 124, 52), R: V(-9, 123, 49) }; // in his frame: above the drape, over your belly
  const handAt = V();
  const LAY = { dir: V(0, -0.45, 1).normalize(), palm: V(0, -1, 0.15).normalize() };

  /* ═════════════ 7 · THE APPLIANCE, AND ITS FAULT ═════════════ */
  const DC = V(DEVICE.at[0], DEVICE.cart[1] + DEVICE.box[1] / 2, DEVICE.at[2]);
  const [BW, BH, BD] = DEVICE.box;
  const dev = new THREE.Group();
  dev.position.copy(DC);
  group.add(dev);
  // its cart: four posts of glass, a solid top, a shelf of glass, wheels
  const postMat = keepGlass(glass(BRAND.ink, { base: 0, rim: 0.3, power: 2.2, edge: 0.55, spec: 0.4, through: 0.2 }));
  const [CW, CH, CD] = DEVICE.cart;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    shellMesh(group, new THREE.CylinderGeometry(1.3, 1.3, CH - 6, 16, 1, true), postMat, ORDER.things, [DC.x + dx * (CW / 2 - 3), (CH - 6) / 2 + 4, DC.z + dz * (CD / 2 - 3)]);
    mesh(group, cyl(2.6, 2, 0.3, 20), wheelMat, [DC.x + dx * (CW / 2 - 3), 2.6, DC.z + dz * (CD / 2 - 3)], { rot: [0, 0, Math.PI / 2] });
  }
  mesh(group, box(CW, 2.4, CD, 0.6), darkSteel, [DC.x, CH - 1.2, DC.z], { edges: 0.45 });
  const shelfMat = keepGlass(glass(BRAND.ink, { base: 0, rim: 0.12, power: 2.4, edge: 0.4 }));
  shellMesh(group, box(CW - 2, 1.6, CD - 2, 0.4), shelfMat, ORDER.things, [DC.x, 26, DC.z], { edges: 0.3 });
  // its casing of sheet metal: glass in the X-ray, its edges crisp, the softbox in it; a few screws
  const casingMat = keepGlass(glass(BRAND.ink, { base: 0, rim: 0.16, power: 2.6, edge: 0.6, spec: 0.6, through: 0.3 }), 0.4);
  shellMesh(dev, box(BW, BH, BD, 0.6), casingMat, ORDER.things, [0, 0, 0], { edges: 0.8, edgeWidth: 2.2, edgeDim: 0.35 });
  const screwMat = solid(0xc4beb2, { rough: 0.35, metal: 0.4 });
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mesh(dev, cyl(0.9, 0.5, 0.15, 16), screwMat, [sx * (BW / 2 - 2), sy * (BH / 2 - 2), BD / 2 + 0.2], { rot: [Math.PI / 2, 0, 0], shadow: false });
  mesh(dev, box(13, 5.5, 0.6, 0.3), solid(0x1b1f22, { rough: 0.5 }), [10, 2.5, BD / 2 + 0.3], { edges: 0.45, shadow: false });
  mesh(dev, cyl(1.8, 1.4, 0.3, 24), steelLight, [17, -4, BD / 2 + 0.7], { rot: [Math.PI / 2, 0, 0], shadow: false });
  const vents = [];
  for (let i = 0; i < 6; i++) seg(vents, [4 + i * 2.6, BH / 2 + 0.05, -9], [4 + i * 2.6, BH / 2 + 0.05, 9]);
  dev.add(keepLines(segments(vents, { width: 1.8, opacity: 0.35 }), 0.4));
  // inside: two terminals, the wire whose sleeve is worn where it nearly touches the front face, the second
  // conductor, the earth stud and its protective conductor — all toward the cord at the back
  const termMat = solid(0x5d646a, { rough: 0.5, metal: 0.2 });
  const T1 = V(12, -5, -10);
  const T2 = V(1, -5, -11.5);
  mesh(dev, box(7, 4, 5, 0.5), termMat, [T1.x, T1.y, T1.z], { edges: 0.45 });
  mesh(dev, box(7, 4, 5, 0.5), termMat, [T2.x, T2.y, T2.z], { edges: 0.45 });
  const FL = V(...FAULT).sub(DC); // the worn spot, in the casing's frame (at rest a breath from the front face)
  const wirePath = smoothPath([[T1.x, T1.y + 2, T1.z], [6, -3, -2], [-4, 0, 9], [FL.x, FL.y, FL.z], [-17, 0.5, 11], [-16, -3, 0], [-8, -4.5, -9], [T2.x, T2.y + 2, T2.z]], 160);
  const wireGeo = sweep(wirePath, 0.72, 12);
  const sF = along(wirePath, FL);
  {
    const aS = wireGeo.getAttribute("aS");
    const aW = new Float32Array(aS.count);
    const col = new Float32Array(aS.count * 3);
    const SLEEVE = new THREE.Color(0x8d949a);
    const COPPER = new THREE.Color(0xc0643e); // bare copper: a dull signal, the faint threat of the first frame
    const c = new THREE.Color();
    for (let i = 0; i < aS.count; i++) {
      const d = aS.getX(i) - sF;
      aW[i] = Math.exp(-((d / 5) ** 2));
      c.copy(SLEEVE).lerp(COPPER, smooth(1.6, 0.7, Math.abs(d)));
      col.set([c.r, c.g, c.b], i * 3);
    }
    wireGeo.setAttribute("aW", new THREE.BufferAttribute(aW, 1));
    wireGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
  const bend = { value: V() };
  const wireMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.15 });
  wireMat.onBeforeCompile = (sh) => {
    sh.uniforms.uBend = bend;
    sh.vertexShader = "attribute float aW;\nuniform vec3 uBend;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n  transformed += uBend * aW;");
  };
  const wire = new THREE.Mesh(wireGeo, wireMat);
  dev.add(wire);
  const CORD_IN = V(15, -5.5, -BD / 2 + 0.6);
  const wireSolid = solid(0x8d949a, { rough: 0.45, metal: 0.15 });
  dev.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(T2.x + 2, T2.y - 1, T2.z - 2), V(9, -7, -16), CORD_IN.clone().add(V(-0.8, 0, 0))]), 30, 0.55, 10), wireSolid));
  dev.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(T1.x + 2, T1.y - 1, T1.z - 2), V(15, -6, -15), CORD_IN.clone().add(V(0.8, 0.6, 0))]), 30, 0.55, 10), wireSolid));
  const peMat = solid(0xd6d0c3, { rough: 0.45 });
  mesh(dev, cyl(1, 1.4, 0.2, 16), screwMat, [-6, -BH / 2 + 0.7, -12]); // the earth stud, on the casing
  dev.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-6, -BH / 2 + 1.5, -12), V(4, -7.6, -15), V(12, -7, -17), CORD_IN.clone().add(V(0, -0.8, 0))]), 40, 0.38, 10), peMat));
  // the contact: a light that has a place — a white heart, a signal tail, the sheet metal lit round it
  const CONTACT = V(FL.x, FL.y, BD / 2 - 0.15);
  const faultCore = glowSprite(HOT, 2.6, 1.6);
  const faultTail = glowSprite(SIGNAL, 15, 3.2);
  const faultSheet = patchLight(14, 14, BRAND.signal, [0, 0], 6.5, 2.4);
  for (const g of [faultCore, faultTail]) {
    g.mesh.position.copy(CONTACT);
    g.mesh.renderOrder = ORDER.inner;
    dev.add(g.mesh);
  }
  faultSheet.mesh.position.set(CONTACT.x, CONTACT.y, BD / 2 - 0.12);
  faultSheet.mesh.renderOrder = ORDER.inner;
  dev.add(faultSheet.mesh);

  /* ═════════════ 8 · THE BACK WALL: SOCKETS, CORDS, THE ALARM REPEATER ═════════════ */
  const plastic = solid(0xd4cec1, { rough: 0.55 });
  const holeMat = solid(0x262b2f, { rough: 0.7 });
  const plugMat = solid(0x535a60, { rough: 0.5 });
  for (const s of SOCKETS) {
    mesh(group, box(22, 10, 1.4, 0.4), plastic, [s[0], s[1], z0 + 0.8], { edges: 0.4, edgeColor: 0x1d2226 });
    for (const dx of [-5.5, 5.5]) mesh(group, cyl(3.2, 0.6, 0.15, 32), holeMat, [s[0] + dx, s[1], z0 + 1.6], { rot: [Math.PI / 2, 0, 0], shadow: false });
  }
  const [SA, SB] = SOCKETS;
  mesh(group, box(4.6, 4.6, 3, 0.5), plugMat, [SA[0] + 5.5, SA[1], z0 + 3.2], { edges: 0.4 });
  mesh(group, box(4.6, 4.6, 3, 0.5), plugMat, [SB[0] - 5.5, SB[1], z0 + 3.2], { edges: 0.4 });
  const cordMat = solid(0x4f565c, { rough: 0.55 });
  const CW0 = dev.localToWorld(CORD_IN.clone());
  const cordPts = [[CW0.x, CW0.y, CW0.z - 0.5], [CW0.x + 1, CW0.y - 8, CW0.z - 6], [CW0.x + 3, 34, CW0.z - 16], [CW0.x + 1, 3.2, CW0.z - 46], [SA[0] + 7, 3.2, z0 + 22], [SA[0] + 5.5, 12, z0 + 3.2], [SA[0] + 5.5, SA[1] - 6, z0 + 3.2], [SA[0] + 5.5, SA[1] - 2.3, z0 + 3.2]];
  group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cordPts.map((p) => V(...p)), false, "centripetal"), 140, 0.75, 10), cordMat));
  const respCord = [[RX + 10, 26, RZ - (RD - 8) / 2], [RX + 9, 4, RZ - (RD - 8) / 2 - 20], [SB[0] - 7, 3.2, z0 + 24], [SB[0] - 5.5, 12, z0 + 3.2], [SB[0] - 5.5, SB[1] - 6, z0 + 3.2], [SB[0] - 5.5, SB[1] - 2.3, z0 + 3.2]];
  group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(respCord.map((p) => V(...p)), false, "centripetal"), 120, 0.75, 10), cordMat));
  // the alarm repeater: its panel, its light, its buzzer's grille, a button — no text
  const RP = V(...REPEATER.at);
  const [PW, PH, PD] = REPEATER.size;
  mesh(group, box(PW, PH, PD, 0.6), plastic, [RP.x, RP.y, z0 + PD / 2], { edges: 0.45, edgeColor: 0x1d2226 });
  const LED = V(RP.x - 6, RP.y + 2.5, z0 + PD + 0.05);
  mesh(group, cyl(2.2, 0.8, 0.2, 32), holeMat, [LED.x, LED.y, LED.z - 0.3], { rot: [Math.PI / 2, 0, 0], shadow: false });
  const ledMat = glow(BRAND.veille, 0);
  mesh(group, new THREE.CircleGeometry(1.5, 32), ledMat, [LED.x, LED.y, LED.z + 0.12]);
  mesh(group, cyl(3.4, 0.5, 0.15, 36), holeMat, [RP.x + 5.5, RP.y + 0.5, z0 + PD + 0.1], { rot: [Math.PI / 2, 0, 0], shadow: false });
  const grille = [];
  for (const dy of [-1.6, 0, 1.6]) seg(grille, [RP.x + 3.2, RP.y + 0.5 + dy, z0 + PD + 0.45], [RP.x + 7.8, RP.y + 0.5 + dy, z0 + PD + 0.45]);
  group.add(keepLines(segments(grille, { width: 1.8, opacity: 0.6 }), 0.3));
  mesh(group, cyl(1.4, 1, 0.2, 24), steelLight, [RP.x - 6, RP.y - 3, z0 + PD + 0.5], { rot: [Math.PI / 2, 0, 0], shadow: false });
  const ledHalo = glowSprite(BRAND.veille, 12, 2.6);
  ledHalo.mesh.position.copy(LED);
  group.add(ledHalo.mesh);
  // the rings: three, slow, leaving the light across the wall
  const ringMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: VEILLE }, uAmount: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uTime; varying vec2 vP;
      void main() {
        if (uAmount < 0.002) discard;
        float d = length(vP);
        float a = 0.0;
        for (int i = 0; i < 3; i++) {
          float u = fract(uTime / 2.7 + float(i) / 3.0);
          float r = 4.0 + 30.0 * u;
          float x = (d - r) / 1.0;
          a += exp(-x * x) * pow(1.0 - u, 1.3) * smoothstep(0.0, 0.08, u);
        }
        gl_FragColor = vec4(uColor * 1.05 * a * uAmount, 1.0);
      }`,
  });
  const rings = mesh(group, new THREE.PlaneGeometry(76, 76), ringMat, [LED.x, LED.y, z0 + 0.5]);
  rings.renderOrder = 3;

  /* ═════════════ 9 · THE IT CABINET, BEHIND THE WALL ═════════════ */
  const CB = V(CABINET.at[0], CABINET.h / 2, CABINET.at[2]);
  const cabMat = glass(BRAND.ink, { base: 0, rim: 0.12, power: 2.4, edge: 0.45, spec: 0.25, through: 0.2 });
  const cabGeo = box(CABINET.w, CABINET.h, CABINET.d, 1);
  const cab = shellMesh(group, cabGeo, cabMat, ORDER.cabinet, [CB.x, CB.y, CB.z], { edges: 0.42, edgeDim: 0 });
  const cabVeille = edgesOf(cabGeo, { color: BRAND.veille, width: 2.4, opacity: 0 });
  cabVeille.material.color.multiplyScalar(1.5);
  cab.add(cabVeille);
  const doors = [];
  const FZ = CB.z + CABINET.d / 2 + 0.2;
  seg(doors, [CB.x, 4, FZ], [CB.x, CABINET.h - 4, FZ]);
  seg(doors, [CB.x - CABINET.w / 2, 182, CB.z + CABINET.d / 2 - 1], [CB.x + CABINET.w / 2, 182, CB.z + CABINET.d / 2 - 1]);
  group.add(keepLines(segments(doors, { width: 1.8, opacity: 0.32 }), 0));
  for (const dx of [-4, 4]) mesh(group, box(1.2, 14, 1.6, 0.4), steelLight, [CB.x + dx, 120, FZ + 0.8], { edges: 0.3, edgeColor: 0x1d2226 });
  mesh(group, box(CABINET.w - 4, 2.4, CABINET.d - 4, 0.5), steel, [MOUNT[0], MOUNT[1] - 1.2, MOUNT[2]], { edges: 0.4 }); // the shelf the system stands on
  mesh(group, box(CABINET.w - 4, 8, CABINET.d - 4, 0.5), darkSteel, [CB.x, 4, CB.z], { edges: 0.35 }); // the plinth
  const cabGlow = glowSprite(BRAND.veille, 120, 2.6);
  cabGlow.mesh.position.set(MOUNT[0] + 6, MOUNT[1] + 40, MOUNT[2] - 22);
  cabGlow.mesh.renderOrder = ORDER.inner;
  group.add(cabGlow.mesh);
  const shelfPool = makePool({ radius: 27, color: BRAND.veille });
  shelfPool.mesh.position.set(MOUNT[0] + 5, MOUNT[1] + 0.12, MOUNT[2]);
  group.add(shelfPool.mesh);
  const mount = new THREE.Group();
  mount.position.set(...MOUNT);
  group.add(mount);

  /* ═════════════ 10 · THE IT CIRCUIT IN THE WALLS ═════════════ */
  const RUN = CONDUIT.run;
  const CZ = CONDUIT.z;
  const OW = V(MOUNT[0] + OUT[0], MOUNT[1] + OUT[1], MOUNT[2] + OUT[2]);
  const UP = OW.x + 10;
  const trunkPts = [OW, V(UP, OW.y, OW.z), V(UP, RUN, OW.z), V(UP, RUN, CZ), V(SB[0], RUN, CZ)];
  const dropA = [V(SA[0], RUN, CZ), V(SA[0], SA[1] + 6, CZ), V(SA[0], SA[1] + 2, z0 - 1)];
  const dropB = [V(SB[0], RUN, CZ), V(SB[0], SB[1] + 6, CZ), V(SB[0], SB[1] + 2, z0 - 1)];
  const lampLine = [V(PV.x, RUN, CZ), V(PV.x, h + 2.5, CZ), V(PV.x, h + 2.5, PV.z), V(PV.x, h - 1, PV.z)];
  const seekPath = roundPath([...trunkPts.slice(0, 4), V(SA[0], RUN, CZ), ...dropA.slice(1)], 6, 2);
  const seekCum = cumulative(seekPath);
  const SEEK_LEN = seekCum[seekCum.length - 1];
  const trunkPath = roundPath(trunkPts, 6, 2);
  const sA = along(trunkPath, V(SA[0], RUN, CZ));
  const sB = along(trunkPath, V(SB[0], RUN, CZ));
  const sL = along(trunkPath, V(PV.x, RUN, CZ));
  const OFF = [V(0.9, 0.9, 0), V(-0.9, -0.9, 0)]; // the two conductors, side by side on any run
  const CONDUCTORS = [];
  const addRun = (pts, s0, seekMax, seekOn) => {
    const path = roundPath(pts, 6, 2);
    for (const off of OFF) {
      const mat = conductorMaterial();
      mat.uniforms.uSeekMax.value = seekMax;
      const m = new THREE.Mesh(sweep(path.map((p) => p.clone().add(off)), 0.75, 10, s0), mat);
      group.add(m);
      CONDUCTORS.push({ u: mat.uniforms, seekOn });
    }
  };
  addRun(trunkPts, 0, sA + 2, 1);
  addRun(dropA, sA, 1e5, 1);
  addRun(dropB, sB, 1e5, 0);
  addRun(lampLine, sL, 1e5, 0);
  // the boxes where the branches leave the trunk
  for (const x of [SA[0], PV.x, SB[0]]) mesh(group, box(9, 9, 3, 0.6), darkSteel, [x, RUN, CZ - 1], { edges: 0.4 });
  const seekHead = glowSprite(BRAND.veille, 10, 2.2);
  group.add(seekHead.mesh);
  const sockGlow = glowSprite(BRAND.veille, 26, 2.4);
  sockGlow.mesh.position.set(SA[0], SA[1], z0 + 3);
  group.add(sockGlow.mesh);

  const dress = dressBloc(); // the anaesthetist's corner (habillage.js)
  group.add(dress.group);

  /* ═════════════ anchors ═════════════ */
  group.updateMatrixWorld(true);
  const world = (obj, x, y, z) => obj.localToWorld(V(x, y, z));
  const HEADW = world(you.torso, 0, 166.5 - you.HIP, 1);
  const CHESTW = world(you.torso, 0, 128 - you.HIP, 10);
  const SURGW = world(surgeon.torso, 0, 166.5 - surgeon.HIP, 1);
  const A = {
    table: anchor(group, T.at[0], T.top, T.at[2]),
    you: anchor(group, HEADW.x, HEADW.y, HEADW.z),
    chest: anchor(group, CHESTW.x, CHESTW.y, CHESTW.z),
    lamp: anchor(group, LH.x, LH.y - 6.4, LH.z),
    resp: anchor(group, B0.x, COL.y0 + 20, B0.z),
    surgeon: anchor(group, SURGW.x, SURGW.y, SURGW.z),
    hands: anchor(group, S0.x, S0.y + 124, S0.z + 50),
    device: anchor(group, DC.x, DC.y + BH / 2, DC.z),
    fault: anchor(group, ...FAULT),
    socket: anchor(group, ...SA),
    repeater: anchor(group, RP.x, RP.y, RP.z),
    cabinet: anchor(group, CB.x, CABINET.h * 0.6, CB.z + CABINET.d / 2),
  };

  return {
    group,
    mount,
    A,
    /** P = { shell, lamp, vent, work, dark, current, seek, cabinet, fault, alarm, mood } (their meaning: FIRST, in world.js). */
    update(P, time) {
      const shell = clamp01(P.shell ?? 1);
      const dark = clamp01(P.dark ?? 0);
      const live = 1 - dark;
      const lamp = clamp01(P.lamp ?? 1);
      const vent = clamp01(P.vent ?? 1);
      const work = clamp01(P.work ?? 0);
      const fault = clamp01(P.fault ?? 0);
      const alarm = clamp01(P.alarm ?? 0);
      const cabinet = clamp01(P.cabinet ?? 0);
      const seek = clamp01(P.seek ?? 0);
      const current = clamp01(P.current ?? 1);

      // the room: its lines, its glass, its light — the dark dims them, it never erases them
      for (const l of LINES) l.mat.opacity = l.base * shell * (1 - l.dim * dark);
      for (const g of GLASS) g.u.uAmount.value = shell * (1 - g.dim * dark) * (g.lamp ? 0.6 + 0.4 * lamp : 1);
      floor.grid.uAmount.value = 0.2 * shell * (1 - 0.5 * dark);
      setGlow(ceilMat, 0.7 * shell * live);
      you.body.uniforms.uAmount.value = shell * (1 - 0.4 * dark);
      surgeon.body.uniforms.uAmount.value = shell * (1 - 0.45 * dark);
      cabMat.uniforms.uAmount.value = shell * (1 + 0.6 * cabinet);
      surgeon.shadow.material.uniforms.uAmount.value = 0.4 * shell;

      // the lamp
      setGlow(cellMat, 2.2 * lamp);
      setGlow(lipMat, 1.3 * lamp);
      lampHalo.u.uAmount.value = 0.42 * lamp;
      tablePool.u.uAmount.value = 0.75 * lamp;
      floorPool.uniforms.uAmount.value = 0.05 * lamp;

      // the ventilator: the bellows rise and fall, your chest with them (pushed in, it rises); at 0 they settle mid-way
      const b = Math.sin((TAU * time) / BREATH) * vent;
      const sy = 0.7 + 0.27 * b;
      bellows.scale.y = sy;
      bellowsTop.position.y = COL.y0 + 0.4 + 24 * sy + 0.7;
      trunk.scale.z = TRUNK_Z * (1 - 0.035 * b);
      drapeMat.uniforms.uRise.value = -1.6 * b;
      screenMat.uniforms.uTime.value = time;
      screenMat.uniforms.uVent.value = vent;
      screenMat.uniforms.uAmount.value = shell * live;

      // the surgeon's hands, slow and small, above the drape
      for (const s of ["L", "R"]) {
        const k = s === "L" ? 0 : 1.7;
        handAt.copy(HANDS[s]);
        handAt.x += 2.2 * Math.sin(TAU * 0.21 * time + k) * work;
        handAt.z += 1.6 * Math.sin(TAU * 0.29 * time + 1 + k) * work;
        handAt.y += 0.9 * Math.sin(TAU * 0.17 * time + 2 * k) * work;
        surgeon.reach(s, handAt, undefined, LAY);
        surgeon.grip(s, 0.35 + 0.2 * Math.sin(TAU * 0.23 * time + k) * work);
      }

      // the fault: the wire bends onto the sheet metal; where it touches, a light swells two frames and stays small
      bend.value.set(0, 0, 1.5 * fault);
      const touch = smooth(0.8, 1, fault);
      const swell = Math.exp(-(((fault - 0.93) / 0.035) ** 2));
      const breathe = 0.9 + 0.1 * Math.sin(TAU * 0.5 * time);
      faultCore.u.uAmount.value = 2.2 * touch * (1 + 1.3 * swell) * breathe;
      faultCore.u.uSize.value = 2.6 * (1 + 0.8 * swell);
      faultTail.u.uAmount.value = 0.85 * touch * (1 + 0.9 * swell) * breathe;
      faultTail.u.uSize.value = 15 * (1 + 0.5 * swell);
      faultSheet.u.uAmount.value = 0.45 * touch * breathe;

      // the alarm repeater: a steady light, slow rings — never a blink
      setGlow(ledMat, 2.6 * alarm);
      ledHalo.u.uAmount.value = 0.55 * alarm;
      ringMat.uniforms.uAmount.value = alarm;
      ringMat.uniforms.uTime.value = time;

      // the cabinet glows veille through the wall
      cabVeille.material.opacity = 0.95 * cabinet;
      cabGlow.u.uAmount.value = 0.32 * cabinet;
      shelfPool.uniforms.uAmount.value = 0.5 * cabinet;

      // the IT circuit: ink dashes; the search, a veille head running from the cabinet to the appliance's socket
      const S = seek * SEEK_LEN;
      const seekOn = smooth(0, 0.03, seek) * (1 - smooth(0.97, 1, seek));
      for (const c of CONDUCTORS) {
        c.u.uFlow.value = time * SPEED;
        c.u.uCur.value = current * live * shell;
        c.u.uAmt.value = shell * (1 - 0.5 * dark);
        c.u.uSeek.value = S;
        c.u.uSeekOn.value = seekOn * c.seekOn;
      }
      pointAt(seekPath, seekCum, S, seekHead.mesh.position);
      seekHead.u.uAmount.value = 1.6 * seekOn;
      sockGlow.u.uAmount.value = 0.6 * smooth(0.85, 0.96, seek) * (1 - smooth(0.97, 1, seek));
      dress.update({ shell, dark }, time);
    },
  };
}
