// The decorator's kit: the small things of a lived-in place, drawn like the rest of a set — X-ray glass and
// fine lines, never solid — so that a kitchen, a garage, a cockpit feels inhabited without taking the eye off
// the system. Immersion comes from the life of the place (a ladle on its rail, an open jar, a towel on a
// handle, the lamp under the hood and the steam drifting up to it, a clock that says it is evening, a
// window onto the night), never from clutter. The rules are in docs/recette-decorateur.md.
//
//   const d = makeDresser();                      // one per set
//   d.rail({ from, to, hang: ["ladle", …] });      // place things (centimetres, y up; the set's own frame)
//   d.jar({ at, r, h, fill }); d.kettle({ at }); d.glow({ at, size }); d.motes({ min, size }); …
//   d.done();                                     // bakes: one mesh per material, one per family of lines
//   set.add(d.group);  …  d.update({ amount, lamp, motes }, time, px)   // every shutter sample: uniforms only
//
// `amount` follows the set's X-ray (its `shell`): when the set steps back, so does everything here.
// Things that face somewhere (a socket, a clock, a window) take `rotY`: their front looks along +z, turned.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "./brand.js";
import { glass, asShell, box, cyl, lathe, placed, mergeGeometries, lineMat } from "./build3d.js";
import { makeMotes } from "./atmo.js";
import { rng } from "./rng.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const INK = new THREE.Color(BRAND.ink);

/** Position and normal only: every baked piece must carry the same attributes to merge. */
function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  if (g.userData.edges) o.userData.edges = g.userData.edges;
  return o;
}

/**
 * A soft light seen from anywhere, facing the camera: a bright core and a long tail (a disc that fades evenly reads
 * as a ball on the wall). Drawn in its shader — `size` in cm across, `k` how bright its core is (≤ 2: it must not bleed).
 */
const GLOW_QUAD = new THREE.PlaneGeometry(1, 1);
function glowMaterial(k) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(k) }, uAmount: { value: 1 }, uSize: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uSize; varying vec2 vQ;
      void main() {
        vQ = position.xy * 2.0;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vQ;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        float a = (0.85 * exp(-r2 * 60.0) + 0.3 * exp(-sqrt(r2) * 5.2)) * (1.0 - r2);
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
}

/** The light of a lamp on the wall below it: brightest at the top edge, falling away downward, soft at the sides (never a disc). */
let WASH_TEX = null;
function washTexture() {
  if (WASH_TEX) return WASH_TEX;
  const S = 128;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const u = (x + 0.5) / S * 2 - 1; // −1 … 1 across
      const v = (y + 0.5) / S; // 0 at the top
      const a = Math.exp(-v * 3.2) * Math.pow(Math.max(0, 1 - u * u), 2) * Math.min(1, v * 14);
      const i = (y * S + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
      img.data[i + 3] = Math.round(255 * a);
    }
  g.putImageData(img, 0, 0);
  WASH_TEX = new THREE.CanvasTexture(c);
  WASH_TEX.colorSpace = THREE.SRGBColorSpace;
  return WASH_TEX;
}

/**
 * `order`: where these shells are drawn among the set's (see `asShell`) — after the set's own glass, so what stands
 * inside a cabinet stays hidden by it. `tone`: one knob for the whole dressing (0.6 quieter · 1.4 louder).
 */
export function makeDresser({ order = 26, tone = 1, seed = 11 } = {}) {
  const group = new THREE.Group();
  group.name = "details";
  const rand = rng(seed);
  // glass that steps back: less rim than the set's own, so a jar never outshines the system it stands near
  const G = {
    round: glass(BRAND.ink, { base: 0.003, rim: 0.17 * tone, power: 2.4, edge: 0.22 * tone, spec: 0.25 * tone, through: 0.16 }),
    flat: glass(BRAND.ink, { base: 0.003, rim: 0.06 * tone, power: 2.6, edge: 0.1 * tone, through: 0.14 }),
    // what is inside a jar or a bottle: a faint volume, no edge of its own
    fill: glass(BRAND.ink, { base: 0.012 * tone, rim: 0.05 * tone, power: 1.6, edge: 0, through: 0 }),
  };
  const buckets = new Map([[G.round, []], [G.flat, []], [G.fill, []]]);
  const L = { strong: [], fine: [], faint: [] };
  const LW = { strong: [2.2, 0.62], fine: [1.8, 0.42], faint: [1.8, 0.22] }; // px, opacity at amount 1
  const glows = [];
  const swarms = [];

  /* ── baking ── */
  const seg = (list, a, b) => list.push(a.x, a.y, a.z, b.x, b.y, b.z);
  const toWorld = (m, p) => V(...p).applyMatrix4(m);
  const matrix = ({ at = [0, 0, 0], rotX = 0, rotY = 0, rotZ = 0 } = {}) =>
    new THREE.Matrix4().compose(V(...at), new THREE.Quaternion().setFromEuler(new THREE.Euler(rotX, rotY, rotZ, "YXZ")), V(1, 1, 1));
  // `placed` moves a geometry, not the outline it carries: carry the outline across ourselves
  const placedEdges = (geometry, o) => {
    const g = placed(geometry, o);
    // a clone shares its source's userData: give it its own, with its own outline
    g.userData = geometry.userData.edges ? { ...geometry.userData, edges: placed(geometry.userData.edges, o) } : {};
    return g;
  };
  const part = (m, material, geometry, o = {}) => {
    const g = placedEdges(geometry, o);
    if (g.userData.edges) g.userData.edges.applyMatrix4(m);
    g.applyMatrix4(m);
    if (o.lines) {
      const e = new THREE.EdgesGeometry(g.userData.edges ?? g, 28).attributes.position;
      for (let i = 0; i < e.count; i += 2) L[o.lines].push(e.getX(i), e.getY(i), e.getZ(i), e.getX(i + 1), e.getY(i + 1), e.getZ(i + 1));
    }
    buckets.get(material).push(bare(g));
  };
  const tube = (m, pts, r, material = G.round, segs = 24) =>
    part(m, material, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => V(...p)), false, "centripetal"), segs, r, 8, false));
  const ringLine = (m, list, c, r, n = 32, plane = "xz") => {
    let prev = null;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const p = plane === "xz" ? [c[0] + r * Math.cos(a), c[1], c[2] + r * Math.sin(a)] : [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), c[2]];
      const w = toWorld(m, p);
      if (prev) seg(list, prev, w);
      prev = w;
    }
  };
  const line = (m, list, a, b) => seg(list, toWorld(m, a), toWorld(m, b));

  /* ── the utensils that hang (their ring at the origin, everything below it) ── */
  const HANG = {
    ladle(m) {
      tube(m, [[0, -1, 0], [0, -10, 0.3], [0, -19, 0.9], [0, -22.5, 1.8]], 0.32);
      part(m, G.round, lathe(Array.from({ length: 9 }, (_, i) => [4.1 * Math.sin((i / 8) * 90 * DEG), 3.2 * (1 - Math.cos((i / 8) * 90 * DEG))]), 32), { pos: [0, -26.4, 3.2], rotX: -80 * DEG });
      return 28;
    },
    spatula(m) {
      tube(m, [[0, -1, 0], [0, -14, 0.2]], 0.36);
      part(m, G.flat, box(6.4, 8.6, 0.35, 0.6), { pos: [0, -18.6, 0.25], lines: "fine" });
      return 23;
    },
    spoon(m) {
      tube(m, [[0, -1, 0], [0, -12, 0.4], [0, -20, 1.2]], 0.42);
      part(m, G.round, new THREE.SphereGeometry(1, 20, 12).scale(2.4, 3.6, 0.9), { pos: [0, -23.2, 1.6] });
      return 27;
    },
    skimmer(m) {
      tube(m, [[0, -1, 0], [0, -12, 0.2], [0, -19, 0.8]], 0.3);
      part(m, G.flat, cyl(4.4, 0.35, 0.12, 40), { pos: [0, -23.4, 1.1], rotX: 90 * DEG });
      ringLine(m, L.faint, [0, -23.4, 1.35], 2.6, 28, "xy");
      return 28;
    },
  };
  const hook = (m) => part(m, G.round, new THREE.TorusGeometry(1.0, 0.16, 6, 22), {});

  const api = {
    group,
    /** A rail on a wall (its axis from `from` to `to`, `off` cm in front of the wall: −z of the rail is the wall), utensils hanging from it. */
    rail({ from, to, off = 2.6, hang = ["ladle", "spatula", "spoon", "skimmer"], swing = 4 }) {
      const a = V(...from);
      const b = V(...to);
      const len = a.distanceTo(b);
      const m = new THREE.Matrix4().lookAt(a, b, V(0, 1, 0)).setPosition(a); // its local −z runs from → to
      part(m, G.flat, cyl(0.42, len, 0.1, 20), { pos: [0, 0, -len / 2], rotX: 90 * DEG }); // seen side-on a round rod is all rim: flat glass
      for (const s of [0.04, 0.96]) {
        part(m, G.round, cyl(0.35, off, 0.05, 12), { pos: [-off / 2, 0, -len * s], rotZ: 90 * DEG });
        part(m, G.round, cyl(1.4, 0.4, 0.1, 20), { pos: [-off, 0, -len * s], rotZ: 90 * DEG, lines: "faint" });
      }
      const dir = b.clone().sub(a).normalize();
      hang.forEach((kind, i) => {
        const p = a.clone().addScaledVector(dir, len * (0.14 + (0.72 * i) / Math.max(1, hang.length - 1)));
        const mm = matrix({ at: [p.x, p.y - 0.9, p.z], rotY: Math.atan2(dir.x, dir.z) - 90 * DEG, rotZ: (rand() - 0.5) * swing * DEG });
        hook(mm);
        HANG[kind](mm);
      });
      return api;
    },
    /** A jar with its lid; `fill` 0–1 of something inside (lentils, sugar): a faint volume and the line of its level. */
    jar({ at, r = 4.5, h = 14, fill = 0.6, lid = true }) {
      const m = matrix({ at });
      const k = r * 0.86;
      part(m, G.round, lathe([[0, 0], [r, 0.4], [r, h * 0.84], [k, h * 0.92], [k, h]], 40, { bevel: 0.4 }), { lines: "faint" });
      if (lid) part(m, G.round, cyl(k + 0.3, 1.6, 0.25, 40), { pos: [0, h + 0.8, 0], lines: "fine" });
      if (fill > 0) {
        part(m, G.fill, cyl(r * 0.93, h * 0.84 * fill, 0.1, 32), { pos: [0, (h * 0.84 * fill) / 2 + 0.4, 0] });
        ringLine(m, L.faint, [0, h * 0.84 * fill + 0.4, 0], r * 0.93, 32);
      }
      return api;
    },
    /** A bottle (oil, dish soap): body, shoulder, neck, cap. */
    bottle({ at, r = 3.4, h = 26, fill = 0.55 }) {
      const m = matrix({ at });
      part(m, G.round, lathe([[0, 0], [r, 0.3], [r, h * 0.6], [r * 0.45, h * 0.8], [r * 0.32, h * 0.82], [r * 0.32, h * 0.94]], 36, { bevel: 0.3 }), { lines: "faint" });
      part(m, G.round, cyl(r * 0.38, h * 0.07, 0.15, 24), { pos: [0, h * 0.975, 0], lines: "fine" });
      if (fill > 0) part(m, G.fill, cyl(r * 0.92, h * 0.6 * fill, 0.1, 28), { pos: [0, (h * 0.6 * fill) / 2 + 0.3, 0] });
      return api;
    },
    /** A pepper mill: a waisted column and its knob. */
    mill({ at, r = 2.6, h = 18 }) {
      const m = matrix({ at });
      part(m, G.round, lathe([[0, 0], [r, 0.2], [r * 0.95, h * 0.35], [r * 0.68, h * 0.55], [r * 0.9, h * 0.86], [r * 0.5, h * 0.95], [0, h * 0.95]], 32, { bevel: 0.3 }), { lines: "faint" });
      part(m, G.round, new THREE.SphereGeometry(r * 0.32, 16, 10), { pos: [0, h, 0] });
      return api;
    },
    /** An earthenware pot by the hob, wooden spoons standing in it. */
    crock({ at, r = 6, h = 15, spoons = 4 }) {
      const m = matrix({ at });
      part(m, G.round, lathe([[0, 0], [r * 0.9, 0], [r, h * 0.3], [r, h * 0.9], [r * 1.06, h], [r * 0.96, h]], 40, { bevel: 0.4 }), { lines: "faint" });
      for (let i = 0; i < spoons; i++) {
        const a = (i / spoons) * Math.PI * 2 + rand() * 0.6;
        const lean = 8 + rand() * 9;
        const top = [Math.cos(a) * Math.sin(lean * DEG) * 30, h + 13 + rand() * 7, Math.sin(a) * Math.sin(lean * DEG) * 30];
        const base = [Math.cos(a) * r * 0.25, 1.2, Math.sin(a) * r * 0.25];
        tube(m, [base, top], 0.45);
        part(m, G.round, new THREE.SphereGeometry(0.5, 10, 6), { pos: top });
      }
      return api;
    },
    /** A cutting board leaning against a wall (`rotY` turns it along the wall; it leans toward its local −z). */
    board({ at, w = 24, h = 34, t = 1.6, lean = 9, rotY = 0 }) {
      const m = matrix({ at, rotY });
      const tilt = lean * DEG;
      part(m, G.flat, box(w, h, t, 0.7), { pos: [0, (h / 2) * Math.cos(tilt), -(h / 2) * Math.sin(tilt) + t], rotX: -tilt, lines: "fine" });
      ringLine(matrix({ at: toWorld(m, [0, h * 0.86 * Math.cos(tilt), -h * 0.86 * Math.sin(tilt) + t * 1.6]).toArray(), rotY, rotX: -tilt }), L.faint, [0, 0, 0], 1.3, 18, "xy");
      return api;
    },
    /** A kettle on the worktop (its spout toward local +x). */
    kettle({ at, r = 8, h = 19, rotY = 0 }) {
      const m = matrix({ at, rotY });
      part(m, G.flat, cyl(r * 0.92, 1.2, 0.3, 40), { pos: [0, 0.6, 0], lines: "fine" }); // its base
      part(m, G.round, lathe([[0, 1.2], [r * 0.82, 1.3], [r, h * 0.3], [r * 0.9, h * 0.72], [r * 0.6, h * 0.92], [0, h * 0.95]], 48, { bevel: 0.5 }), { lines: "faint" });
      part(m, G.round, new THREE.SphereGeometry(1.1, 14, 8), { pos: [0, h * 0.98, 0] });
      tube(m, [[r * 0.8, h * 0.32, 0], [r * 1.2, h * 0.55, 0], [r * 1.45, h * 0.78, 0]], 0.9);
      tube(m, [[-r * 0.85, h * 0.85, 0], [-r * 1.05, h * 1.12, 0], [r * 0.2, h * 1.18, 0], [r * 0.55, h * 0.95, 0]], 0.75);
      return api;
    },
    /** A double socket on a wall (front +z, turned by `rotY`). */
    socket({ at, rotY = 0 }) {
      const m = matrix({ at, rotY });
      part(m, G.flat, box(15.5, 8.2, 1.1, 0.6), { pos: [0, 0, 0.55], lines: "fine" });
      for (const x of [-3.9, 3.9]) ringLine(m, L.fine, [x, 0, 1.15], 2.3, 26, "xy");
      return api;
    },
    /** A cable that hangs between points (a kettle's lead, a lamp's flex). */
    cable({ points, r = 0.32 }) {
      tube(new THREE.Matrix4(), points, r, G.round, 48);
      return api;
    },
    /** A towel hung over a bar (`at`: the middle of the bar; it hangs along local x, its front toward +z). */
    towel({ at, w = 22, h = 36, back = 0.42, rotY = 0, folds = 3 }) {
      const m = matrix({ at, rotY });
      const sheet = (len, side) => {
        const g = new THREE.PlaneGeometry(w, len, 16, 14);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i);
          const y = p.getY(i) - len / 2; // 0 at the bar → −len
          const wave = Math.sin((x / w) * Math.PI * 2 * folds + 0.7) * 0.9 * Math.min(1, -y / 8);
          p.setXYZ(i, x, y, side * (0.9 + wave) + side * 0.6 * Math.max(0, 1 + y / 3));
        }
        g.computeVertexNormals();
        return g;
      };
      part(m, G.flat, sheet(h, 1), {});
      part(m, G.flat, sheet(h * back, -1), {});
      line(m, L.fine, [-w / 2, -h, 1.2], [w / 2, -h, 1.2]); // the hem
      line(m, L.faint, [-w / 2, -h + 3, 1.2], [w / 2, -h + 3, 1.2]);
      return api;
    },
    /** A wall clock (front +z, turned by `rotY`), its hands set at `hour`:`minute` — they do not move (fine lines that turn flicker). */
    clock({ at, r = 13, hour = 20, minute = 47, rotY = 0 }) {
      const m = matrix({ at, rotY });
      part(m, G.round, new THREE.TorusGeometry(r, 0.9, 10, 64), { pos: [0, 0, 0.9] });
      part(m, G.flat, cyl(r, 0.6, 0.1, 64), { pos: [0, 0, 0.3], rotX: 90 * DEG });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const k = i % 3 === 0 ? 0.74 : 0.82;
        line(m, i % 3 === 0 ? L.fine : L.faint, [Math.sin(a) * r * k, Math.cos(a) * r * k, 1], [Math.sin(a) * r * 0.9, Math.cos(a) * r * 0.9, 1]);
      }
      const ah = ((hour % 12) + minute / 60) * 30 * DEG;
      const am = minute * 6 * DEG;
      line(m, L.strong, [0, 0, 1.3], [Math.sin(ah) * r * 0.5, Math.cos(ah) * r * 0.5, 1.3]);
      line(m, L.strong, [0, 0, 1.4], [Math.sin(am) * r * 0.76, Math.cos(am) * r * 0.76, 1.4]);
      part(m, G.round, cyl(0.8, 0.8, 0.1, 16), { pos: [0, 0, 1.4], rotX: 90 * DEG });
      return api;
    },
    /** A window in a wall (centre `at`, front +z = the room, turned by `rotY`) and, far behind it, a few lights of the night: depth. */
    window({ at, w = 90, h = 110, rotY = 0, lights = 7, far = 2600, spread = 4 }) {
      const m = matrix({ at, rotY });
      const f = 4;
      // the frame, its mullion, and the sill that sticks out into the room
      for (const [x, y, ww, hh] of [[0, h / 2 - f / 2, w, f], [0, -h / 2 + f / 2, w, f], [-w / 2 + f / 2, 0, f, h], [w / 2 - f / 2, 0, f, h], [0, 0, 2.4, h - 2 * f]])
        part(m, G.flat, box(ww, hh, 5, 0.5), { pos: [x, y, 0], lines: "fine" });
      part(m, G.flat, box(w + 10, 3, 9, 0.5), { pos: [0, -h / 2 - 1.5, 3], lines: "fine" });
      // the night: a few lights far below and beyond (the place is upstairs) — small, still, never a veil
      for (let i = 0; i < lights; i++) {
        const x = (rand() - 0.5) * w * spread;
        const y = -h * 0.5 - rand() * h * 1.6;
        api.glow({ at: toWorld(m, [x, y, -far * (0.7 + rand() * 0.6)]).toArray(), size: 14 + rand() * 14, k: 0.5 + rand() * 0.45, kind: "far" });
      }
      return api;
    },
    /** A light that has a place: a bright core, a long tail. `kind`: "lamp" follows `lamp` in update, "far" follows `amount`. */
    glow({ at, size = 6, k = 1, kind = "lamp" }) {
      const mat = glowMaterial(k);
      mat.uniforms.uSize.value = size;
      const mesh = new THREE.Mesh(GLOW_QUAD, mat);
      mesh.position.set(...at);
      mesh.frustumCulled = false;
      mesh.renderOrder = order + 2;
      group.add(mesh);
      glows.push({ mat, kind });
      return api;
    },
    /** The light of a lamp on the wall below it (`at`: the middle of its TOP edge, on the wall, front +z, turned by `rotY`; `w` × `h`). */
    wash({ at, w = 60, h = 50, k = 0.16, rotY = 0 }) {
      const mat = new THREE.MeshBasicMaterial({ map: washTexture(), color: INK.clone().multiplyScalar(k), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      mesh.geometry.translate(0, -0.5, 0); // hung from its top edge
      mesh.position.set(...at);
      mesh.rotation.y = rotY;
      mesh.scale.set(w, h, 1);
      mesh.renderOrder = order + 1;
      group.add(mesh);
      glows.push({ mat, kind: "lamp" });
      return api;
    },
    /** Something suspended in the air of the place (steam, dust, flour), drifting by `drift` cm/s: streaks, never dots. */
    motes({ min, size, count = 140, drift = [0.2, 1.6, 0.1], psize = [0.16, 0.5], k = 0.5 }) {
      const sw = makeMotes({ count, seed: 1 + Math.floor(rand() * 999), min, size, psize, color: BRAND.ink, drift });
      sw.uniforms.uColor.value.multiplyScalar(k);
      sw.points.renderOrder = order + 3;
      group.add(sw.points);
      swarms.push(sw);
      return api;
    },

    /**
     * A city at night, seen from high up: lights strung along a grid of streets on the ground, out to the horizon —
     * still, soft, at least 2.4 px each (never a veil, never a twinkle). `centre` [x, z], `r0` → `r1` the ring they
     * fill (cm), `y` the street level, `cell` the size of a block, `avenue` every how many streets one is brighter,
     * `fade` the distance from the eye over which they sink into the night, `hole`: leave out a sector the camera
     * looks through toward the subject ([from°, to°] around the centre, from +x toward +z), so nothing glitters behind it.
     */
    nightLights({ centre = [0, 0], r0 = 3000, r1 = 80000, y = 40, cell = 2600, avenue = 4, count = 9000, k = 0.8, fade = 70000, px = [3, 6], hole = null }) {
      const pos = new Float32Array(count * 3);
      const seeds = new Float32Array(count);
      let n = 0;
      for (let tries = 0; n < count && tries < count * 6; tries++) {
        // a street (along x or along z), a point along it: the lights line up the way streets do
        const along = rand() < 0.5;
        const rr = r0 + Math.pow(rand(), 0.7) * (r1 - r0);
        const a = rand() * Math.PI * 2;
        let x = Math.cos(a) * rr;
        let z = Math.sin(a) * rr;
        if (along) z = Math.round(z / cell) * cell; else x = Math.round(x / cell) * cell;
        const r = Math.hypot(x, z);
        if (r < r0 || r > r1) continue;
        if (hole) {
          const deg = ((Math.atan2(z, x) / DEG) + 360) % 360;
          if (deg > hole[0] && deg < hole[1]) continue;
        }
        const street = Math.round((along ? z : x) / cell);
        pos[n * 3] = centre[0] + x;
        pos[n * 3 + 1] = y;
        pos[n * 3 + 2] = centre[1] + z;
        seeds[n] = (street % avenue === 0 ? 0.75 : 0.25) + rand() * 0.35;
        n++;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos.subarray(0, n * 3), 3));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds.subarray(0, n), 1));
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: INK.clone().multiplyScalar(k) }, uAmount: { value: 1 }, uFade: { value: fade }, uPx: { value: new THREE.Vector2(...px) } },
        vertexShader: /* glsl */ `
          uniform float uFade; uniform vec2 uPx; attribute float aSeed; varying float vA;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            float dist = max(1.0, -mv.z);
            vA = aSeed * exp(-dist / max(uFade, 1.0));
            gl_PointSize = mix(uPx.x, uPx.y, clamp(aSeed - 0.25, 0.0, 1.0)); // never under 2.4 px: below that a point crawls
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform float uAmount; varying float vA;
          void main() {
            vec2 q = gl_PointCoord - 0.5;
            float d = clamp(length(q) * 2.0, 0.0, 1.0);
            float a = (1.0 - d * d) * (1.0 - d * d);
            gl_FragColor = vec4(uColor * a * vA * uAmount, 1.0);
          }`,
      });
      const points = new THREE.Points(geo, mat);
      points.frustumCulled = false;
      points.renderOrder = order - 4; // far away: drawn before the glass
      group.add(points);
      glows.push({ mat, kind: "far" });
      return api;
    },

    /** Bakes everything placed: call once, after the last piece. */
    done() {
      const panes = [];
      for (const [material, list] of buckets) {
        if (!list.length) continue;
        const mesh = new THREE.Mesh(list.length > 1 ? mergeGeometries(list) : list[0], material);
        mesh.frustumCulled = false;
        group.add(mesh);
        panes.push(mesh);
      }
      asShell(panes, order);
      for (const name of ["strong", "fine", "faint"]) {
        if (!L[name].length) continue;
        const [width, opacity] = LW[name];
        const mat = lineMat(BRAND.ink, width, { opacity: opacity * tone });
        const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(L[name]), mat);
        mesh.frustumCulled = false;
        mesh.renderOrder = order + 1;
        group.add(mesh);
        lineMats.push(mat);
      }
      return api;
    },

    /**
     * amount  the whole dressing (0–1): follow the set's X-ray (`shell`)
     * lamp    the lamps and their wash on the wall (0–1), times `amount`
     * motes   what floats in the air (0–1), times `amount`
     */
    update({ amount = 1, lamp = 1, motes = 1 } = {}, time = 0, px = 1) {
      group.visible = amount > 0.003;
      if (!group.visible) return;
      for (const mat of Object.values(G)) mat.uniforms.uAmount.value = amount;
      for (const mat of lineMats) mat.opacity = mat.userData.base * amount;
      for (const { mat, kind } of glows) {
        const a = amount * (kind === "lamp" ? lamp : 1);
        if (mat.uniforms) mat.uniforms.uAmount.value = a;
        else mat.opacity = a;
      }
      for (const sw of swarms) {
        sw.uniforms.uAmount.value = amount * motes;
        sw.update(time, px, 0.5 / 30);
      }
    },
  };
  const lineMats = [];
  return api;
}
