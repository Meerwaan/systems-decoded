// DOSSIER 052 — Télésiège débrayable : THE STATION, X-ray (the housing of glass, its frame, the quay's grid) with
// solid inside it only what works: the cable round the bullwheel, the came all along the rail, the tyre rows, the
// weighing and its gauge, the side track, the principle's two speed arrows. Where everything stands: plan.js.
// The brief: docs/052-decors.md « gare.js ». Journal: docs/journal/052-gare.md.
//
// buildStation() → { group, A, update(P, time, px) }
//   group    added to the scene's set by world.js, never moved by it (plan.js coordinates)
//   A        anchors (Object3D): wheel (the bullwheel's rim, on the cable), mouth (the station's mouth, departure side),
//            quay (where you board), slowRow / launchRow (the middle of each tyre row), weigh (the instrumented came),
//            gauge (the gauge's bar), garage (the side track's end), cameIn (where the came starts, arrival side)
//   update   sixteen times a frame, no allocation; P plain numbers (world.js hands them over):
//     station  the X-ray of the housing, its frame, the quay's grid, the lamps (0–1); the solids stay
//     rope     cm the cable has run (cumulative, ease "none"): the strands run, the bullwheel and the tyres turn
//              (every tyre at its place's ratio: speedAt) — when it stops, everything stops
//     chair    the hero chair's abscissa (plan.js PATH): the speed arrows ride with it, the weighing bends under it
//     arrows   0 → 1 the two speed arrows over the hero's grip: the cable's (long, ink) and the chair's (veille)
//     vchair   the chair's arrow as a share of the cable's (0.2 at the quay → 1)
//     weigh    0 → 1 the weighing works: its length of came bends a hair under the passing grip, its gauge lights
//     force    the measured clamp, a share of full force: the gauge's mark (under WEIGH.ok it stands in its red band;
//              above it, the bar stays ink: never a green « OK »)
//     iso      0 → 1 the side track's points thrown toward the garage (the hero chair follows: ligne.js)
//     litCame litTyres litWeigh   the part the voice names, faintly veille (0–1)
//     vrope    OPTIONAL, cm/s: how fast the cable runs across the screen. Strands that would step more than a third
//              of their pitch from one frame to the next melt into the steel's even tone instead of strobing. Left
//              out, it is read from the rope between calls (the shutter's sixteen samples).
//
// THE CABLE'S IDIOM (the same in ligne.js, so the cable leaves the station and becomes the line without a seam at
// x 1500): steel 0x3a3f45, metal ≤ 0.5, ink strands at 0.35 in a helix, phase = (s − rope) / CABLE.lay + turn/2π,
// where s is the path's abscissa (plan.js pathAt) — the cable at s moves to s + rope.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, edgesOf, solid, glow, setGlow, box, cyl, lathe, anchor, mergeGeometries, placed } from "@kit/build3d.js";
import { STATION, CABLE, CABLE_Y, SIDE, BULLWHEEL, CAME, FREE, WEIGH, TYRES, GARAGE, PATH, pathAt, sArrival, sDeparture, speedAt } from "./plan.js";

const FPS = 30;
const GY = CABLE_Y - FREE; // the open grip's axis in the station: the came, the tyres, the rails hang from it
const TYRE_AXLE = GY + TYRES.y; // the tyres' axles (world y)
const HALF = Math.max(STATION.half, GARAGE.z + 150); // the housing's half width: the side track inside it
// The gauge HANGS from the roof, outside and above the weighing: on a post at plan.js WEIGH.gauge (y 210, z 470) it
// stood right where the hero chair swings onto the side track (GARAGE: z ≈ 380–500 at x 1240). Until plan.js says
// so (journal, « À changer ailleurs »), a low WEIGH.gauge is lifted here.
const GAUGE = WEIGH.gauge[1] > CABLE_Y ? WEIGH.gauge : [WEIGH.gauge[0], 425, 430];
const GAUGE_HANGS = GAUGE[1] > CABLE_Y + 40; // from the roof above the rail, or on a post from the floor

const STEEL = 0x3a3f45; //  the cable (shared idiom with ligne.js)
const DARK = 0x2c3136; //   beams, posts, hubs
const MID = 0x5d646b; //    spokes, struts, the gauge's case
const LIGHT = 0x9ca3a9; //  the machined faces: the bullwheel's rim, the came, the tyres' rims
const HERO = 0xb9c0c6; //   the weighing (the instrumented came), a shade lighter than the came

const tmp = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0 };
const smooth = (k) => {
  const c = Math.min(1, Math.max(0, k));
  return c * c * (3 - 2 * c);
};

/** The abscissae from s0 to s1: `step` on the straights, finer round the bullwheel. */
function stations(s0, s1, step = 40) {
  const out = [];
  let s = s0;
  while (s < s1) {
    out.push(s);
    s += s > PATH.A - 1 && s < PATH.C0 + 1 ? Math.min(step, 12) : step;
  }
  out.push(s1);
  return out;
}

/** The frame at s: centre (x, y, z), tangent t and outward n (grip frame z), both horizontal. */
function frameAt(s, iso, f) {
  pathAt(s, tmp, iso);
  f.x = tmp.x;
  f.y = tmp.y;
  f.z = tmp.z;
  f.tx = Math.cos(tmp.yaw);
  f.tz = -Math.sin(tmp.yaw);
  f.nx = Math.sin(tmp.yaw);
  f.nz = Math.cos(tmp.yaw);
  return f;
}

/** The cable as a round tube along the path, its abscissa and its turn in `aSA` (the strands' shader reads them). */
function cableGeometry(s0, s1, r, sides = 12) {
  const ss = stations(s0, s1, 20);
  const f = {};
  const pos = [];
  const nor = [];
  const sa = [];
  const idx = [];
  for (let i = 0; i < ss.length; i++) {
    frameAt(ss[i], 0, f);
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      const nx = Math.cos(a) * f.nx;
      const ny = Math.sin(a);
      const nz = Math.cos(a) * f.nz;
      pos.push(f.x + r * nx, CABLE_Y + r * ny, f.z + r * nz);
      nor.push(nx, ny, nz);
      sa.push(ss[i], j / sides);
    }
  }
  const row = sides + 1;
  for (let i = 0; i < ss.length - 1; i++) {
    for (let j = 0; j < sides; j++) {
      const a = i * row + j;
      const b = a + row;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("aSA", new THREE.Float32BufferAttribute(sa, 2));
  g.setIndex(idx);
  return g;
}

/** A beam of rectangular section swept along the path: `rect(s, x)` → [u0, u1, v0, v1] (u outward, v up, cm from
 *  (centre, `base` y)). Hard faces, closed ends: edgesOf() draws its four crests and nothing else. */
function sweepBox(s0, s1, rect, { base = GY, iso = 0, step = 40 } = {}) {
  const ss = stations(s0, s1, step);
  const f = {};
  const ring = ss.map((s) => {
    frameAt(s, iso, f);
    const [u0, u1, v0, v1] = rect(s, f.x);
    const P = (u, v) => [f.x + f.nx * u, base + v, f.z + f.nz * u];
    return { c: [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)], n: [f.nx, f.nz], t: [f.tx, f.tz] };
  });
  const pos = [];
  const nor = [];
  const quad = (a, b, c, d, n) => {
    pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let k = 0; k < 6; k++) nor.push(...n);
  };
  for (let i = 0; i < ring.length - 1; i++) {
    const A = ring[i];
    const B = ring[i + 1];
    const [nx, nz] = A.n;
    quad(A.c[0], B.c[0], B.c[1], A.c[1], [0, -1, 0]); // underside
    quad(A.c[1], B.c[1], B.c[2], A.c[2], [nx, 0, nz]); // outer face
    quad(A.c[2], B.c[2], B.c[3], A.c[3], [0, 1, 0]); // top
    quad(A.c[3], B.c[3], B.c[0], A.c[0], [-nx, 0, -nz]); // inner face
  }
  const first = ring[0];
  const last = ring[ring.length - 1];
  quad(first.c[0], first.c[1], first.c[2], first.c[3], [-first.t[0], 0, -first.t[1]]);
  quad(last.c[3], last.c[2], last.c[1], last.c[0], [last.t[0], 0, last.t[1]]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  return g;
}

/** Steel with its strands: a helix of ink stripes, one every `lay`, that runs with the rope. Under four pixels a
 *  pitch (fwidth) or past a third of a pitch a frame (uMove), the stripes melt into their mean tone: never a flicker. */
function strandSteel() {
  const mat = solid(STEEL, { rough: 0.5, metal: 0.4 });
  mat.userData.finish = false; // no machining grain on a running rope
  const U = {
    uRope: { value: 0 },
    uLay: { value: CABLE.lay },
    uMove: { value: 0 },
    uStr: { value: 0.35 },
    uInk: { value: new THREE.Color(BRAND.ink) },
  };
  mat.userData.strands = U;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec2 aSA; varying vec2 vSA;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSA = aSA;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uRope, uLay, uMove, uStr; uniform vec3 uInk; varying vec2 vSA;")
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        {
          float q = (vSA.x - uRope) / uLay + vSA.y;
          float w = max(fwidth(q), 1e-4);
          float d = abs(fract(q) - 0.5);
          float stripe = 1.0 - smoothstep(0.16 - w, 0.16 + w, d);
          float keep = (1.0 - smoothstep(0.12, 0.25, w)) * (1.0 - smoothstep(0.2, 0.36, uMove));
          diffuseColor.rgb = mix(diffuseColor.rgb, uInk, uStr * mix(0.32, stripe, keep));
        }`,
      );
  };
  mat.customProgramCacheKey = () => "sd-052-strands";
  return mat;
}

/** The quay's grid: lines every metre (they fade when the chair runs fast) and every five, a pool of light under
 *  each lamp, fading out at the housing's edge. No floor: the grid alone says where it is. */
function floorGrid(lamps) {
  const W = STATION.x1 - STATION.x0;
  const geo = new THREE.PlaneGeometry(W, HALF * 2);
  geo.rotateX(-Math.PI / 2);
  geo.translate((STATION.x0 + STATION.x1) / 2, 0.5, 0);
  const U = {
    uColor: { value: new THREE.Color(BRAND.ink) },
    uAmount: { value: 0.16 },
    uFine: { value: 1 },
    uBox: { value: new THREE.Vector4(STATION.x0, STATION.x1, -HALF, HALF) },
    uLamps: { value: lamps.map(([x, z]) => new THREE.Vector2(x, z)) },
  };
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: U,
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vP = w.xz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uFine; uniform vec4 uBox; uniform vec2 uLamps[${lamps.length}];
      varying vec2 vP;
      float lines(float x, float cell) {
        float q = x / cell;
        float w = max(fwidth(q) * 1.5, 1e-5);
        float d = abs(fract(q - 0.5) - 0.5);
        // a line finer than its cell's quarter melts away (moiré, far off) instead of shimmering
        return (1.0 - smoothstep(0.0, w, d)) * (1.0 - smoothstep(0.08, 0.25, w));
      }
      void main() {
        float g = max(lines(vP.x, 100.0), lines(vP.y, 100.0)) * 0.45 * uFine + max(lines(vP.x, 500.0), lines(vP.y, 500.0));
        float pool = 0.0;
        for (int i = 0; i < ${lamps.length}; i++) {
          vec2 d = (vP - uLamps[i]) / 260.0;
          pool += exp(-dot(d, d));
        }
        float ex = min(vP.x - uBox.x, uBox.y - vP.x);
        float ez = min(vP.y - uBox.z, uBox.w - vP.y);
        float edge = smoothstep(0.0, 180.0, min(ex, ez));
        float k = g * (0.55 + 1.6 * pool) * edge + 0.05 * pool * edge;
        gl_FragColor = vec4(uColor * k * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  return { mesh, U };
}

/** An arrow along +x from its tail: a shaft scaled to the length, a head that keeps its size (shrinks under it). */
function makeArrow(color, k) {
  const mat = glow(color, k);
  const group = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(1, 4.5, 3).translate(0.5, 0, 0), mat);
  const tri = new THREE.Shape([new THREE.Vector2(0, -8), new THREE.Vector2(16, 0), new THREE.Vector2(0, 8)]);
  const head = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 3, bevelEnabled: false }).translate(0, 0, -1.5), mat);
  group.add(shaft, head);
  group.visible = false;
  return {
    group,
    mat,
    set(len) {
      const h = Math.min(1, len / 22);
      head.scale.setScalar(Math.max(0.01, h));
      shaft.scale.x = Math.max(0.01, len - 16 * h);
      head.position.x = Math.max(0.01, len - 16 * h);
    },
  };
}

export function buildStation() {
  const group = new THREE.Group();
  const f = {};

  /* ── the housing of glass: a pitched roof on pillars, the back wall behind the bullwheel, the mouth's lintel ── */
  const L = STATION.x1 - STATION.x0;
  const cx = (STATION.x0 + STATION.x1) / 2;
  const pitch = 0.2;
  const slab = HALF / Math.cos(pitch);
  const shellParts = [];
  for (const side of [-1, 1]) {
    shellParts.push(placed(box(L + 40, 8, slab, 2), { pos: [cx, STATION.roof + Math.tan(pitch) * HALF * 0.5, (side * HALF) / 2], rotX: side * pitch }));
  }
  const bays = 6;
  for (let i = 0; i <= bays; i++) {
    const x = STATION.x0 + 20 + ((L - 40) * i) / bays;
    for (const side of [-1, 1]) shellParts.push(placed(box(16, STATION.roof, 16, 2), { pos: [x, STATION.roof / 2, side * HALF] }));
  }
  shellParts.push(placed(box(10, STATION.roof, HALF * 2, 2), { pos: [STATION.x0, STATION.roof / 2, 0] }));
  shellParts.push(placed(box(14, 70, HALF * 2, 2), { pos: [STATION.x1, STATION.roof - 35, 0] }));
  // the eaves' beams on both sides, under the roof
  for (const side of [-1, 1]) shellParts.push(placed(box(L, 14, 14, 2), { pos: [cx, STATION.roof - 7, side * HALF] }));
  const hGeo = mergeGeometries(shellParts);
  const housing = glass(BRAND.ink, { base: 0, rim: 0.16, edge: 0.32, through: 0.25 });
  const hMesh = new THREE.Mesh(hGeo, housing);
  asShell([hMesh], 20);
  const hLines = edgesOf(hGeo, { color: BRAND.ink, width: 1.8, opacity: 0.38 });
  hMesh.add(hLines);
  group.add(hMesh);

  /* ── the frame that carries the machine (glass): posts from the tyre beams to the roof, the came's girder ── */
  const frameParts = [];
  const postAt = (s) => {
    frameAt(s, 0, f);
    const y0 = TYRE_AXLE - 12;
    const h = STATION.roof - 14 - y0;
    const u = -22;
    frameParts.push(placed(box(9, h, 9, 1.5), { pos: [f.x + f.nx * u, y0 + h / 2, f.z + f.nz * u] }));
  };
  for (let x = 1260; x > -900; x -= 640) postAt(sArrival(x));
  for (let x = -660; x < 1200; x += 640) postAt(sDeparture(x));
  for (const th of [0.5, 1.57, 2.64]) postAt(PATH.A + th * SIDE);
  // the came's girder: above the cable, outward, all the way the came runs
  const sCame0 = sArrival(CAME.startX);
  const sCame1 = sDeparture(CAME.stopX);
  const fGeo = mergeGeometries(frameParts);
  const gGeo = sweepBox(sCame0, sCame1, () => [CAME.z - 6, CAME.z + 6, 70, 80], { step: 60 });
  const frameGlass = glass(BRAND.ink, { base: 0, rim: 0.14, edge: 0.3, through: 0.2 });
  const fMesh = new THREE.Mesh(fGeo, frameGlass);
  const girder = new THREE.Mesh(gGeo, frameGlass);
  asShell([fMesh, girder], 10);
  const fLines = edgesOf(fGeo, { color: BRAND.ink, width: 1.8, opacity: 0.22 });
  const gLines = edgesOf(gGeo, { color: BRAND.ink, width: 1.8, opacity: 0.22 });
  gLines.material = fLines.material;
  fMesh.add(fLines);
  girder.add(gLines);
  group.add(fMesh, girder);

  /* ── the lamps: strips under the roof over the quay (and two over the arrival), a pool of light on the grid ── */
  const lampXZ = [
    [-820, SIDE + 110], [-520, SIDE + 110], [-220, SIDE + 110], [80, SIDE + 110], [420, SIDE + 110],
    [300, -SIDE - 110], [-500, -SIDE - 110],
  ];
  const lampMat = glow(BRAND.ink, 1.6);
  const lampGeo = mergeGeometries(lampXZ.map(([x, z]) => placed(box(110, 3, 12, 0.5), { pos: [x, STATION.roof - 26, z] })));
  const lamps = new THREE.Mesh(lampGeo, lampMat);
  const fixtureGeo = mergeGeometries(lampXZ.map(([x, z]) => placed(box(118, 8, 18, 1.5), { pos: [x, STATION.roof - 20, z] })));
  const fixtureMat = solid(DARK, { rough: 0.7, metal: 0.2, opacity: 1 });
  const fixtures = new THREE.Mesh(fixtureGeo, fixtureMat);
  group.add(lamps, fixtures);
  const grid = floorGrid(lampXZ);
  group.add(grid.mesh);

  /* ── the cable: in at the arrival mouth, round the bullwheel, out at the departure mouth ── */
  const steel = strandSteel();
  const cable = new THREE.Mesh(cableGeometry(0, PATH.END, CABLE.r), steel);
  cable.castShadow = true;
  group.add(cable);
  const strands = steel.userData.strands;

  /* ── the bullwheel: Ø 5.2 m, axis vertical; the cable in the groove at its rim's lower edge ── */
  const wheel = new THREE.Group();
  wheel.position.set(...BULLWHEEL.at);
  const R = BULLWHEEL.r;
  const rimProfile = [[R - 28, -3], [R - 2.4, -3], [R - 2.4, 3.4], [R + 6, 4.5], [R + 6, 15], [R - 28, 15], [R - 28, -3]];
  const rimMat = solid(LIGHT, { rough: 0.42, metal: 0.4 });
  const rim = new THREE.Mesh(lathe(rimProfile, 160, { crease: 40 }), rimMat);
  const spokeGeo = mergeGeometries(
    Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const mid = (40 + R - 28) / 2;
      return placed(box(R - 70, 14, 10, 1.5), { pos: [Math.cos(a) * mid, 6, -Math.sin(a) * mid], rotY: a });
    }),
  );
  const spokeMat = solid(MID, { rough: 0.55, metal: 0.35 });
  const spokes = new THREE.Mesh(spokeGeo, spokeMat);
  const hubMat = solid(DARK, { rough: 0.5, metal: 0.4 });
  const hub = new THREE.Mesh(cyl(42, 34, 2, 48), hubMat);
  hub.position.y = 6;
  const capMat = solid(LIGHT, { rough: 0.4, metal: 0.4 });
  const cap = new THREE.Mesh(cyl(24, 6, 1.2, 40), capMat);
  cap.position.y = 26;
  // one mark on the rim's top: the wheel's turn reads even where its spokes are hidden
  const markMat = solid(DARK, { rough: 0.6, metal: 0.2 });
  const mark = new THREE.Mesh(box(26, 2, 10, 0.5), markMat);
  mark.position.set(R - 12, 15.5, 0);
  wheel.add(rim, spokes, hub, cap, mark);
  for (const m of [rim, spokes, hub, cap]) m.add(edgesOf(m.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.5 }));
  const shaft = new THREE.Mesh(cyl(13, STATION.roof - CABLE_Y - 20, 1, 32), solid(DARK, { rough: 0.6, metal: 0.3 }));
  shaft.position.set(BULLWHEEL.at[0], (STATION.roof + CABLE_Y + 20) / 2, BULLWHEEL.at[2]);
  group.add(wheel, shaft);

  /* ── the came: ONE beam from its ramp on the arrival side, round the wheel, to its ramp on the departure side ── */
  const lift = CAME.push + 5; // how high the ramps start above the pressing line
  const cameRect = (s, x) => {
    let r = 0;
    if (s < PATH.A) r = 1 - smooth((CAME.startX - x) / CAME.ramp);
    else if (s > PATH.C0) r = 1 - smooth((CAME.stopX - x) / CAME.ramp);
    const v0 = CAME.y + lift * r;
    return [CAME.z - CAME.w / 2, CAME.z + CAME.w / 2, v0, v0 + CAME.h];
  };
  const cameGeo = sweepBox(sCame0, sCame1, cameRect, { step: 20 });
  const cameMat = solid(LIGHT, { rough: 0.45, metal: 0.4 });
  cameMat.emissive = new THREE.Color(BRAND.veille);
  cameMat.emissiveIntensity = 0;
  const came = new THREE.Mesh(cameGeo, cameMat);
  came.add(edgesOf(cameGeo, { color: BRAND.ink, width: 1.8, opacity: 0.55 }));
  // its struts up to the girder, every 2.4 m
  const strutParts = [];
  for (let s = sCame0 + 60; s < sCame1 - 30; s += 240) {
    frameAt(s, 0, f);
    const [, , v0] = cameRect(s, f.x);
    const y0 = GY + v0 + CAME.h;
    const h = GY + 70 - y0;
    strutParts.push(placed(box(6, h, 6, 1), { pos: [f.x + f.nx * CAME.z, y0 + h / 2, f.z + f.nz * CAME.z] }));
  }
  const strutGeo = mergeGeometries(strutParts);
  const struts = new THREE.Mesh(strutGeo, solid(MID, { rough: 0.6, metal: 0.3 }));
  group.add(came, struts);

  /* ── the tyre rows: slowing (arrival), slow round the wheel and along the quay, launching (departure); a few
   *    idle ones on the side track. Each turns at its place's ratio (speedAt): angle = ratio · rope / r ── */
  const tyreS = [];
  const ratio = [];
  const isoOf = [];
  for (let s = sArrival(TYRES.slow[0]); s <= sDeparture(TYRES.launch[1]) + 1; s += TYRES.pitch) {
    tyreS.push(s);
    ratio.push(speedAt(s));
    isoOf.push(0);
  }
  for (let x = GARAGE.from + 80; x < GARAGE.to - 20; x += TYRES.pitch) {
    tyreS.push(sDeparture(x));
    ratio.push(0);
    isoOf.push(1);
  }
  const N = tyreS.length;
  const upright = new THREE.Matrix4().makeRotationX(Math.PI / 2); // the cylinders' y onto the axle (grip z)
  const tyreGeo = cyl(TYRES.r, TYRES.w, 2.6, 36).applyMatrix4(upright);
  const rimGeo = mergeGeometries([cyl(11, TYRES.w + 1.5, 1, 28), placed(cyl(3.2, 18, 0.4, 12), { pos: [0, -14, 0] })]).applyMatrix4(upright);
  const lugGeo = box(4, TYRES.w + 2.5, 4, 0.6).translate(7, 0, 0).applyMatrix4(upright);
  const tyreMat = solid(0x1d2023, { rough: 0.85, metal: 0.05 });
  const tyreRimMat = solid(LIGHT, { rough: 0.45, metal: 0.4 });
  tyreRimMat.emissive = new THREE.Color(BRAND.veille);
  tyreRimMat.emissiveIntensity = 0;
  const lugMat = solid(0x1d2023, { rough: 0.7, metal: 0.1 });
  const tyres = new THREE.InstancedMesh(tyreGeo, tyreMat, N);
  const tyreRims = new THREE.InstancedMesh(rimGeo, tyreRimMat, N);
  const lugs = new THREE.InstancedMesh(lugGeo, lugMat, N);
  for (const m of [tyres, tyreRims, lugs]) {
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
  }
  tyres.castShadow = true;
  const baseM = [];
  for (let i = 0; i < N; i++) {
    pathAt(tyreS[i], tmp, isoOf[i]);
    baseM.push(new THREE.Matrix4().makeRotationY(tmp.yaw).setPosition(tmp.x, TYRE_AXLE, tmp.z));
  }
  group.add(tyres, tyreRims, lugs);
  // the beams that carry the axles, on the inner side; the main one runs on past the launch to the points
  const beamRect = () => [-28, -20, TYRES.y - 9, TYRES.y + 9];
  const beamMat = solid(0x464d54, { rough: 0.6, metal: 0.3 });
  const beamGeo = sweepBox(sArrival(TYRES.slow[0] + 40), sDeparture(GARAGE.from + 70), beamRect, { step: 30 });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.add(edgesOf(beamGeo, { color: BRAND.ink, width: 1.8, opacity: 0.35 }));
  group.add(beam);

  /* ── the side track: its beam bending outward, its points (a blade that swings with iso), its buffer ── */
  const garageGeo = sweepBox(sDeparture(GARAGE.from + 50), sDeparture(GARAGE.to), beamRect, { iso: 1, step: 20 });
  const garageMat = solid(MID, { rough: 0.6, metal: 0.3 });
  const garage = new THREE.Mesh(garageGeo, garageMat);
  garage.add(edgesOf(garageGeo, { color: BRAND.ink, width: 1.8, opacity: 0.45 }));
  const blade = new THREE.Group();
  blade.position.set(GARAGE.from - 20, GY + TYRES.y, SIDE - 24);
  const bladeMat = solid(LIGHT, { rough: 0.45, metal: 0.4 });
  const bladeMesh = new THREE.Mesh(box(100, 12, 6, 1).translate(50, 0, 0), bladeMat);
  bladeMesh.add(edgesOf(bladeMesh.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.5 }));
  blade.add(bladeMesh);
  pathAt(sDeparture(GARAGE.to), tmp, 1);
  const buffer = new THREE.Mesh(box(24, 40, 40, 3), solid(MID, { rough: 0.6, metal: 0.3 }));
  buffer.position.set(tmp.x + 14, GY + TYRES.y + 8, tmp.z);
  buffer.rotation.y = tmp.yaw;
  buffer.add(edgesOf(buffer.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.5 }));
  group.add(garage, blade, buffer);

  /* ── the weighing: a length of came AFTER the closing, its underside just on the closed grip's roller, on two load
   *    cells; it bends a hair under the passing roller. Its gauge: a bar with a red band, an ink mark, no figure ── */
  const wx0 = WEIGH.x0;
  const wx1 = WEIGH.x1;
  const SEG = 10;
  const segLen = (wx1 - wx0) / SEG;
  const wz = SIDE + CAME.z;
  const wv = 18; // the closed roller's top (plan.js GRIP.roller): the weighing rests on it
  const weighMat = solid(HERO, { rough: 0.42, metal: 0.4 });
  weighMat.emissive = new THREE.Color(BRAND.veille);
  weighMat.emissiveIntensity = 0;
  const weighSegs = [];
  for (let i = 0; i < SEG; i++) {
    const geo = box(segLen + 0.6, CAME.h, CAME.w, 0.8);
    const m = new THREE.Mesh(geo, weighMat);
    const x = wx0 + segLen * (i + 0.5);
    m.position.set(x, GY + wv + CAME.h / 2, wz);
    // its two ends ramp up like the came's
    if (i === 0) m.rotation.z = -0.06;
    if (i === SEG - 1) m.rotation.z = 0.06;
    if (i === 0 || i === SEG - 1) m.position.y += 1.5;
    m.userData.y = m.position.y;
    m.add(edgesOf(geo, { color: BRAND.ink, width: 1.8, opacity: 0.55 }));
    weighSegs.push(m);
    group.add(m);
  }
  const cellMat = solid(MID, { rough: 0.5, metal: 0.35 });
  cellMat.emissive = new THREE.Color(BRAND.veille);
  cellMat.emissiveIntensity = 0;
  const yTop = GY + wv + CAME.h;
  const cellParts = [];
  for (const x of [wx0 + 36, wx1 - 36]) cellParts.push(placed(cyl(6, 10, 1, 24), { pos: [x, yTop + 5, wz] }));
  const cells = new THREE.Mesh(mergeGeometries(cellParts), cellMat);
  cells.add(edgesOf(cells.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.5 }));
  const yoke = new THREE.Mesh(box(wx1 - wx0 - 20, 7, 12, 1.2), solid(DARK, { rough: 0.6, metal: 0.3 }));
  yoke.position.set((wx0 + wx1) / 2, yTop + 13.5, wz);
  yoke.add(edgesOf(yoke.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.4 }));
  group.add(cells, yoke);

  const G = GAUGE;
  const gauge = new THREE.Group();
  gauge.position.set(...G);
  const caseMat = solid(MID, { rough: 0.55, metal: 0.3 });
  const gCase = new THREE.Mesh(box(26, 126, 14, 2.5), caseMat);
  gCase.add(edgesOf(gCase.geometry, { color: BRAND.ink, width: 1.8, opacity: 0.55 }));
  const slot = new THREE.Mesh(box(12, 104, 2, 0.4), solid(0x121518, { rough: 0.9, metal: 0 }));
  slot.position.z = 7.2;
  const redMat = glow(BRAND.signal, 0.4);
  const bandH = 100 * WEIGH.ok;
  const band = new THREE.Mesh(box(9, bandH, 1.6, 0.3), redMat);
  band.position.set(0, -50 + bandH / 2, 8.4);
  // the upper part stays ink: an empty track, outlined — never a green verdict
  const upperH = 100 - bandH;
  const upperGeo = new THREE.BoxGeometry(9, upperH, 1.6);
  const upper = edgesOf(upperGeo, { color: BRAND.ink, width: 1.8, opacity: 0.6 });
  upper.position.set(0, -50 + bandH + upperH / 2, 8.4);
  const markGlow = glow(BRAND.ink, 0.5);
  const needle = new THREE.Group();
  const nBar = new THREE.Mesh(box(20, 3.2, 3, 0.4), markGlow);
  const nTip = new THREE.Mesh(
    new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, -4), new THREE.Vector2(-7, 0), new THREE.Vector2(0, 4)]), { depth: 3, bevelEnabled: false }),
    markGlow,
  );
  nTip.position.set(-13, 0, -1.5);
  needle.add(nBar, nTip);
  needle.position.z = 10;
  gauge.add(gCase, slot, band, upper, needle);
  // its mount: from the roof, or a post from the floor
  const mountMat = solid(DARK, { rough: 0.6, metal: 0.3 });
  const mountH = GAUGE_HANGS ? STATION.roof - 14 - (G[1] + 63) : G[1] - 63;
  const mount = new THREE.Mesh(box(7, Math.max(1, mountH), 7, 1), mountMat);
  mount.position.set(G[0], GAUGE_HANGS ? G[1] + 63 + mountH / 2 : mountH / 2, G[2] - 4);
  // the wire from the load cells to the gauge
  const wire = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(wx0 + 60, yTop + 17, wz),
      new THREE.Vector3(wx0 + 70, yTop + 30, wz + 10),
      new THREE.Vector3(G[0] - 30, G[1] + (GAUGE_HANGS ? 0 : -40), G[2] - 14),
      new THREE.Vector3(G[0] - 14, G[1] + (GAUGE_HANGS ? 0 : -63), G[2] - 7),
    ], false, "centripetal"), 40, 0.8, 6),
    solid(DARK, { rough: 0.7, metal: 0.1 }),
  );
  group.add(gauge, mount, wire);

  /* ── the principle's two speed arrows over the hero's grip ── */
  const arrowCable = makeArrow(BRAND.ink, 1.3);
  const arrowChair = makeArrow(BRAND.veille, 1.5);
  group.add(arrowCable.group, arrowChair.group);
  const ARROW = 110; // the cable's arrow at full length (cm): it fits a close shot's width

  const A = {
    wheel: anchor(group, BULLWHEEL.at[0] - BULLWHEEL.r, CABLE_Y, 0),
    mouth: anchor(group, STATION.mouth, CABLE_Y, SIDE),
    quay: anchor(group, STATION.board, 100, SIDE),
    slowRow: anchor(group, (TYRES.slow[0] + TYRES.slow[1]) / 2, TYRE_AXLE, -SIDE),
    launchRow: anchor(group, (TYRES.launch[0] + TYRES.launch[1]) / 2, TYRE_AXLE, SIDE),
    weigh: anchor(group, (wx0 + wx1) / 2, GY + wv, wz),
    gauge: anchor(group, ...G),
    garage: anchor(group, GARAGE.to, CABLE_Y, GARAGE.z),
    cameIn: anchor(group, CAME.startX, GY + CAME.y, -SIDE - CAME.z),
  };

  const mtx = new THREE.Matrix4();
  const spin = new THREE.Matrix4();
  let lastT = null;
  let lastRope = 0;
  let vEst = 0;
  const BLADE = 0.16; // the points' swing (rad)

  return {
    group, A,
    update(P, time) {
      // the X-ray: housing, frame, grid, lamps
      const st = P.station;
      housing.uniforms.uAmount.value = st;
      hLines.material.opacity = 0.38 * st;
      frameGlass.uniforms.uAmount.value = st;
      fLines.material.opacity = 0.22 * st;
      hMesh.visible = fMesh.visible = girder.visible = st > 0.003;
      setGlow(lampMat, 1.6 * st);
      lamps.visible = fixtures.visible = st > 0.003;
      grid.U.uAmount.value = 0.16 * st;
      grid.mesh.visible = st > 0.003;

      // the cable's speed across the screen: given, or read from the rope between two calls
      let v;
      if (P.vrope !== undefined) v = P.vrope;
      else {
        if (lastT !== null) {
          const dt = time - lastT;
          if (dt > 1e-4 && dt < 0.1) vEst = (P.rope - lastRope) / dt;
        }
        lastT = time;
        lastRope = P.rope;
        v = vEst;
      }
      strands.uRope.value = P.rope;
      strands.uMove.value = Math.abs(v) / FPS / CABLE.lay;
      // the quay's metre lines melt when the chair runs past a seventh of a metre a frame
      const vChair = Math.abs(v) * speedAt(P.chair);
      grid.U.uFine.value = 1 - smooth((vChair / FPS / 100 - 0.1) / 0.15);

      // the bullwheel: its rim runs with the cable (counter-clockwise from above)
      wheel.rotation.y = P.rope / BULLWHEEL.r;

      // the tyres, each at its place's ratio
      for (let i = 0; i < N; i++) {
        spin.makeRotationZ(-(P.rope * ratio[i]) / TYRES.r);
        mtx.multiplyMatrices(baseM[i], spin);
        tyres.setMatrixAt(i, mtx);
        tyreRims.setMatrixAt(i, mtx);
        lugs.setMatrixAt(i, mtx);
      }
      tyres.instanceMatrix.needsUpdate = tyreRims.instanceMatrix.needsUpdate = lugs.instanceMatrix.needsUpdate = true;

      // what the voice names
      cameMat.emissiveIntensity = 0.12 * P.litCame;
      tyreRimMat.emissiveIntensity = 0.35 * P.litTyres;
      weighMat.emissiveIntensity = 0.14 * P.litWeigh;
      cellMat.emissiveIntensity = 0.3 * P.litWeigh;

      // the weighing: under the hero's roller it bends up a hair; its gauge lights, its mark stands at the force
      pathAt(P.chair, tmp, P.iso);
      const onMain = Math.abs(tmp.z - SIDE) < 20 && tmp.yaw === 0 ? 1 : 0;
      const rx = tmp.x - 34; // the roller trails the grip's centre (plan.js GRIP.roller)
      const inside = onMain * smooth((rx - wx0 + 20) / 30) * smooth((wx1 + 20 - rx) / 30);
      for (let i = 0; i < SEG; i++) {
        const m = weighSegs[i];
        const dx = (m.position.x - rx) / 55;
        m.position.y = m.userData.y + 1.3 * P.weigh * inside * Math.exp(-dx * dx);
      }
      const w = P.weigh;
      const low = P.force < WEIGH.ok ? 1 : 0;
      setGlow(redMat, 0.35 + w * (low ? 1.5 + 0.4 * P.litWeigh : 0.35));
      setGlow(markGlow, (0.5 + 1.6 * w) * (low ? 0.5 : 1));
      needle.position.y = -50 + 100 * Math.min(1, Math.max(0, P.force));

      // the points
      blade.rotation.y = -BLADE * P.iso;

      // the arrows over the hero's grip, from a common tail behind it
      const on = P.arrows > 0.01;
      arrowCable.group.visible = arrowChair.group.visible = on;
      if (on) {
        pathAt(P.chair, tmp);
        const lc = ARROW * P.arrows;
        const tx = tmp.x - Math.cos(tmp.yaw) * ARROW * 0.5;
        const tz = tmp.z + Math.sin(tmp.yaw) * ARROW * 0.5;
        arrowCable.group.position.set(tx, CABLE_Y + 34, tz);
        arrowChair.group.position.set(tx, CABLE_Y + 58, tz);
        arrowCable.group.rotation.y = arrowChair.group.rotation.y = tmp.yaw;
        arrowCable.set(lc);
        arrowChair.set(Math.max(2, lc * Math.min(1, Math.max(0, P.vchair))));
      }
    },
  };
}
