// THE FACTORY KIT, part 2 — the long format's machines that ACT on the product: the gantry (cutting, screen printing,
// laying the film, sticking the sensors), the clean room, the tempering blower, and the test bench of an approval
// (the drop tower and its balls, the head rig and its frame, the optical bench, the striker of the witness pane).
// Same rules as usine.js: X-ray shells and fine lines, the product is the only solid thing — EXCEPT what strikes it
// in a test (the balls, the head, the punch): they are the threat, solid steel, bordered with light, their aura
// signal. And the few working ends that touch the glass (the scoring wheel, the squeegee's blade, the vacuum cups,
// the needle): small, solid, dark — the eye goes to where the machine meets the product.
// They read no episode file; every number comes through their arguments and `set({…})`.
//
// EVERY BLOCK IS A FAMILY, NOT A SET PIECE: its options change the machine (style, axes, tool, rows, flow…), so two
// films never get the same factory. The catalogue, with examples and the poses that frame them: docs/journal/L01-postes.md.
//
// Origin of each block: its centre on the line's axis (x = 0, z = 0), on the floor (y = 0), unless said. Every
// `set` takes an optional `time` (seconds of film): what streams (air, jets, a spark, a sway) runs on it — and on
// nothing else (several calls per frame, no allocation inside).
//
//   makeGantry({ span, height, tool, style?, axes?, legs?, work?, cable?, lamp?, screen?, cups?, cupSpan?, lift?, rails? })
//       → { group, A: { head }, set({ amount, travel, down, lift?, slide?, time? }) }
//       two legs and a beam across the line (z ∈ ±span/2), a head that runs along the beam (`travel` 0 → 1 from
//       −z to +z) and comes down to the glass (`down` 0 up → 1 at the work, y = `work`). The tool's axis is x = 0.
//       tool: "knife" (a scoring wheel, a cold spark where it bites), "screen" (a frame the size of the windshield and
//       its squeegee: `travel` sweeps the squeegee along x, `down` lowers the frame), "arm" (a frame of vacuum cups:
//       `lift` 0 → 1 raises what it holds by `lift` cm, default 30), "nozzle" (a dispensing needle, and an
//       inspection lamp that lights the glass under it).
//       style: "portal" (two legs) · "bridge" (four posts, two rails along x of length `rails`: the beam rides them,
//       `slide` −1 … 1) · "column" (one column at −z, the beam cantilevered). axes: 3 (a vertical slide that
//       telescopes) · 2 (a fixed drop tube and a short pneumatic stroke). legs: "post" · "a" (A-frames).
//   makeCleanRoom({ length, half, height, bay?, sas?, sasAt?, flow?, ffu?, streaks?, slot?, curtain?, work? })
//       → { group, set({ amount, air, time? }) }   origin at its upstream wall (x = 0)
//       a glass room of panels and mullions around the line, filter units in its ceiling grid, an airlock, strip
//       curtains where the line goes through; its filtered air (`air` 0–1) comes down in long slow streaks, meets the
//       line and fans out to the return grilles. flow: "down" (laminar, from the ceiling) · "cross" (from the back wall).
//   makeBlower({ length, half, y, rows?, kind?, cols?, angle?, gap?, nozzle?, plenum?, oscillate?, period?, fan? })
//       → { group, set({ amount, jets, time? }) }   origin at its upstream end
//       two banks of nozzles, above and below the glass at y; `jets` the air hitting both faces at once (white
//       streaks that crash on the glass and fan out sideways, a print of impacts on each face).
//       kind: "pipes" (rows of round nozzles) · "slots" (knife-edge slots); angle: alternate rows tilted (degrees);
//       oscillate: the banks swing along x (cm); fan: the ducts and the scroll of the blower.
//   makeDropTower({ height, mast, plate, sample, posts?, width?, brace?, behind?, guard?, lamp?, ticks?, axis?, top? })
//       → { group, A: { plate, ball, small }, set({ amount, ball, small, chamber, time? }) }
//       the sample's plate at y = plate (the sample clamped between two frames, its top surface at plate + top); the
//       2.26 kg ball held `height` above it (`ball` 0 held → 1 on the sample, 1 → 1.2 it bounces and settles); the
//       227 g ball `mast` above (`small`); `chamber` the climatic box: 1 hot (signal, its heater glowing) · −1 cold
//       (ink, frost on its panes). The lattice tower stands behind (−z), its releases reach over the axis.
//   makeHeadRig({ drop, frame, w, h, wTop?, rest?, sag?, sagV?, gallows?, lamp?, ticks?, axis?, thick? })
//       → { group, A: { head }, set({ amount, drop, time? }) }
//       the frame (the gabarit) that holds a windshield w × h (wTop at its top) by its edges, at y = rest (its corners)
//       and following its curve (sag across, sagV along); the 10 kg head held `drop` above the glass (`drop` 0 held →
//       1 on the glass → 1.15 sunk into the film). gallows: "portal" · "mast".
//   makeOpticBench({ y, board?, rest?, w?, h?, sag?, cell?, line?, gridY?, scope? })
//       → { group, set({ amount, look }) }
//       four pins hold a windshield at y = rest; a target board (a grid of lines) is seen THROUGH it: `look` 0 off ·
//       1 the grid, straight · 2 bent where it is seen through the glass · 3 doubled there (the secondary image).
//       board: "under" (a light table under the glass) · "wall" (a board standing behind).
//   makeStriker({ y, size, squareAt?, spring? })
//       → { group, set({ amount, strike, square? }) }   a stand for a `size` square pane, its spring punch over the
//       centre (`strike` 0 → 1 the tip on the glass); `square` 0–1 the 5 cm counting frame laid on the pane.
//   makeLamp({ length, r0, r1, k }), makeStreaks({ count, fill, … }): the two effects the blocks share, for an
//   episode's own machine.
import * as THREE from "three";
import { BRAND } from "./brand.js";
import { solid, glow, box, cyl, lathe, placed, mergeGeometries, fatLine, edgesOf } from "./build3d.js";
import { xray } from "./usine.js";
import { rng } from "./rng.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);

/* ─────────────────────────────── the weights of an X-ray (never a trait under 1.8 px) */
const BODY = { rim: 0.2, edge: 0.42, width: 1.9, opacity: 0.74 }; //   a machine's body
const FRAME = { rim: 0.13, edge: 0.3, width: 1.8, opacity: 0.5 }; //   secondary structure: bracing, rails, legs
const WALL = { rim: 0.06, edge: 0.14, width: 1.8, opacity: 0.3 }; //   big panes of glass: walls, guards

/** A geometry moved and turned (radians), the way to bake many pieces into one. */
const at = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => placed(g, { pos: [x, y, z], rotX: rx, rotY: ry, rotZ: rz });

/** Several pieces as one geometry (one draw, one fade), their outlines with them. */
function bake(geos) {
  const flat = geos.map((g) => {
    const edges = g.userData.edges;
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) if (k !== "position" && k !== "normal") n.deleteAttribute(k);
    n.userData = edges ? { edges: edges.index ? edges.toNonIndexed() : edges } : {};
    return n;
  });
  return mergeGeometries(flat);
}

const UP = new THREE.Vector3(0, 1, 0);
/** A bar of section t × t2 from p to q (a brace, a strut, a rail). */
function strut(p, q, t = 4, t2 = t) {
  const a = new THREE.Vector3(...p);
  const b = new THREE.Vector3(...q);
  const d = b.clone().sub(a);
  const g = new THREE.BoxGeometry(t, d.length(), t2);
  const m = new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()), new THREE.Vector3(1, 1, 1));
  return g.applyMatrix4(m);
}

/** What a block fades with `amount`: its X-ray pieces, its solids, its effects (uniform uAmount or a glow's opacity). */
function kit() {
  const shells = [];
  const mats = [];
  const fx = [];
  let last = -1;
  return {
    /** an X-ray piece, added to `parent` */
    x(parent, geo, o = BODY, pos = null) {
      const m = xray(geo, o);
      if (pos) m.position.set(...pos);
      parent.add(m);
      shells.push(m);
      return m;
    },
    /** a solid material (and its edge lines' material) that fades */
    solid(mat) {
      mats.push(mat);
      return mat;
    },
    /** an effect: a ShaderMaterial with uAmount, or a glow material with a base opacity */
    fx(mat, k = 1) {
      fx.push([mat, k]);
      return mat;
    },
    fade(a, extra = 1) {
      for (const m of shells) m.userData.fade(a);
      if (a !== last) {
        last = a;
        for (const mat of mats) {
          const t = a < 0.999;
          if (mat.transparent !== t && !mat.isLineMaterial) {
            mat.transparent = t;
            mat.needsUpdate = true;
          }
          mat.opacity = (mat.userData.base ?? 1) * a;
          if (!mat.isLineMaterial) mat.depthWrite = a > 0.55;
        }
      }
      for (const [mat, k] of fx) {
        if (mat.uniforms?.uAmount) mat.uniforms.uAmount.value = a * k * extra;
        else mat.opacity = (mat.userData.base ?? 1) * a * k * extra;
      }
    },
  };
}

/** A solid working part (wheel, blade, cup, needle): dark, its edges light. Returns the mesh. */
function part(K, parent, geo, { color = 0x262c30, rough = 0.5, metal = 0.35, edge = 0.75, pos = null, rot = null } = {}) {
  const mat = K.solid(solid(color, { rough, metal }));
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (pos) mesh.position.set(...pos);
  if (rot) mesh.rotation.set(...rot);
  const lines = edgesOf(geo, { color: BRAND.ink, width: 1.8, opacity: edge });
  K.solid(lines.material);
  mesh.add(lines);
  parent.add(mesh);
  return mesh;
}

/* ─────────────────────────────── the shaders the blocks share */
const VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec3 vW; varying vec2 vUv;
  void main() {
    vUv = uv; vP = position;
    vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
    vec4 mv = viewMatrix * w;
    vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const HEAD = /* glsl */ `varying vec3 vN; varying vec3 vV; varying vec3 vP; varying vec3 vW; varying vec2 vUv; uniform float uAmount;`;
function fxMat(frag, uniforms = {}, { side = THREE.FrontSide } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uAmount: { value: 1 }, ...uniforms },
    vertexShader: VERT,
    fragmentShader: HEAD + frag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side,
    fog: false,
  });
}

/**
 * The THREAT's light: a bright lip of ink at its silhouette, a broad aura of signal toward it — on a dark steel
 * body it reads as the most dangerous object of the hall, in a thumbnail as in close-up.
 */
function threatHalo(K, mesh, { ink = 1.5, sig = 0.55 } = {}) {
  const mat = K.fx(
    fxMat(
      /* glsl */ `uniform vec3 cInk; uniform vec3 cSig; uniform float uInk; uniform float uSig;
      void main() {
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        vec3 c = cInk * uInk * pow(g, 5.0) + cSig * uSig * pow(g, 2.0);
        gl_FragColor = vec4(c * uAmount, 1.0);
      }`,
      { cInk: { value: INK }, cSig: { value: SIGNAL }, uInk: { value: ink }, uSig: { value: sig } },
    ),
  );
  const halo = new THREE.Mesh(mesh.geometry, mat);
  halo.renderOrder = 6;
  mesh.add(halo);
  return halo;
}
function threat(K, parent, geo, o = {}) {
  const mesh = part(K, parent, geo, { color: 0x2a3034, rough: 0.24, metal: 0.5, edge: o.edge ?? 0, ...o });
  threatHalo(K, mesh, o);
  return mesh;
}

/**
 * A LAMP: a light that has a place — a small bright core, a soft cone that fades away from it, a pool where it
 * lands. Points down −y from its origin. k: its strength (the core stays under 2.4, the cone and the pool far under).
 */
export function makeLamp({ length = 200, r0 = 3, r1 = 36, k = 0.6 } = {}) {
  const group = new THREE.Group();
  const cone = fxMat(
    /* glsl */ `uniform vec3 uColor; uniform float uK;
    void main() {
      float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
      float a = clamp(vUv.y, 0.0, 1.0);
      gl_FragColor = vec4(uColor * uK * 0.28 * pow(a, 1.7) * pow(f, 2.2) * uAmount, 1.0);
    }`,
    { uColor: { value: INK }, uK: { value: k } },
    { side: THREE.DoubleSide },
  );
  const coneMesh = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, length, 40, 1, true).translate(0, -length / 2, 0), cone);
  coneMesh.renderOrder = 8;
  const pool = fxMat(
    /* glsl */ `uniform vec3 uColor; uniform float uK;
    void main() {
      float r = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
      float i = pow(1.0 - r, 2.4);
      gl_FragColor = vec4(uColor * uK * 0.3 * i * uAmount, 1.0);
    }`,
    { uColor: { value: INK }, uK: { value: k } },
  );
  const poolMesh = new THREE.Mesh(new THREE.CircleGeometry(r1 * 1.25, 48).rotateX(-Math.PI / 2), pool);
  poolMesh.position.y = -length + 0.4;
  poolMesh.renderOrder = 8;
  const coreMat = glow(BRAND.ink, Math.min(2.4, 1.2 + k * 1.6), { additive: true, opacity: 1, double: true });
  const core = new THREE.Mesh(new THREE.CircleGeometry(r0 * 0.9, 32).rotateX(Math.PI / 2), coreMat);
  core.position.y = -0.3;
  group.add(coneMesh, poolMesh, core);
  return {
    group,
    mats: [cone, pool, coreMat],
    set(a) {
      group.visible = a > 0.003;
      cone.uniforms.uAmount.value = a;
      pool.uniforms.uAmount.value = a;
      coreMat.opacity = a;
    },
  };
}
/** Points a lamp's group (built pointing −y) from where it hangs toward a target, both in its parent's frame. */
function aim(lampGroup, from, to) {
  lampGroup.position.set(...from);
  const d = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]).normalize();
  lampGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d);
}

/**
 * STREAKS of air: soft tapered strands that run along a path — a straight run (from `o` along `d`, `l1` cm), a
 * rounded turn, a second run (along `s`, `l2` cm) — and loop. They are at least `minPx` wide on screen (dimmer when
 * that is more than their true width: a far streak never becomes a bright hair). `fill(i, r)` returns each one:
 * { o: [x,y,z], d: [x,y,z] (unit), l1, s: [x,y,z] (unit), l2, speed (cm/s), phase?, len? (× `len`), width? (× `width`) }.
 * `splash`: how much brighter a streak is where its two runs meet (a jet crashing on the glass).
 */
export function makeStreaks({ count, fill, seed = 3, len = 60, width = 1.2, minPx = 1.8, k = 0.4, splash = 0, corner = 10, color = BRAND.ink } = {}) {
  const r = rng(seed);
  const base = new THREE.PlaneGeometry(1, 1, 10, 1);
  const g = new THREE.InstancedBufferGeometry();
  g.index = base.index;
  g.setAttribute("position", base.getAttribute("position"));
  const aO = new Float32Array(count * 3);
  const aD = new Float32Array(count * 4);
  const aS = new Float32Array(count * 4);
  const aP = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const f = fill(i, r);
    aO.set(f.o, i * 3);
    aD.set([...f.d, Math.max(0.01, f.l1)], i * 4);
    aS.set([...(f.s ?? [0, 1, 0]), Math.max(0, f.l2 ?? 0)], i * 4);
    aP.set([f.phase ?? r(), f.speed, f.len ?? 1, f.width ?? 1], i * 4);
  }
  g.setAttribute("aO", new THREE.InstancedBufferAttribute(aO, 3));
  g.setAttribute("aD", new THREE.InstancedBufferAttribute(aD, 4));
  g.setAttribute("aS", new THREE.InstancedBufferAttribute(aS, 4));
  g.setAttribute("aP", new THREE.InstancedBufferAttribute(aP, 4));
  g.instanceCount = count;
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uAmount: { value: 0 }, uK: { value: k }, uColor: { value: new THREE.Color(color) },
      uLen: { value: len }, uWidth: { value: width }, uMinPx: { value: minPx }, uCorner: { value: corner }, uSplash: { value: splash },
      uRes: { value: new THREE.Vector2(BRAND.W, BRAND.H) },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aO; attribute vec4 aD; attribute vec4 aS; attribute vec4 aP;
      uniform float uTime, uLen, uWidth, uMinPx, uCorner, uSplash; uniform vec2 uRes;
      varying float vI; varying float vX;
      vec3 path(float s) {
        float L1 = aD.w;
        float rc = min(uCorner, min(L1, aS.w) * 0.5);
        vec3 C = aO + aD.xyz * L1;
        if (aS.w < 0.01 || s <= L1 - rc) return aO + aD.xyz * s;
        if (s >= L1 + rc) return C + aS.xyz * (s - L1);
        float t = (s - (L1 - rc)) / max(2.0 * rc, 1e-3);
        vec3 A = C - aD.xyz * rc; vec3 B = C + aS.xyz * rc;
        return mix(mix(A, C, t), mix(C, B, t), t);
      }
      void main() {
        float L = aD.w + aS.w;
        float sl = uLen * aP.z;
        float u = fract(aP.x + uTime * aP.y / max(L + sl, 1.0));
        float headS = u * (L + sl);
        float a = position.x + 0.5;
        float s = clamp(headS - sl * (1.0 - a), 0.0, L);
        vec3 P = path(s);
        vec3 T = path(min(s + 2.0, L)) - path(max(s - 2.0, 0.0));
        vec4 c0 = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
        vec4 c1 = projectionMatrix * modelViewMatrix * vec4(P + T, 1.0);
        vI = 0.0; vX = position.y * 2.0;
        if (c0.w < 1.0 || c1.w < 1.0) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
        vec2 hres = uRes * 0.5;
        vec2 s0 = c0.xy / c0.w * hres; vec2 s1 = c1.xy / c1.w * hres;
        vec2 dir = s1 - s0; float dl = length(dir);
        dir = dl > 1e-4 ? dir / dl : vec2(1.0, 0.0);
        vec2 nrm = vec2(-dir.y, dir.x);
        float pxcm = projectionMatrix[1][1] * hres.y / c0.w;
        float wpx = uWidth * aP.w * pxcm;
        float dim = clamp(wpx / uMinPx, 0.3, 1.0);
        wpx = max(wpx, uMinPx);
        c0.xy += nrm * (position.y * wpx) / hres * c0.w;
        gl_Position = c0;
        float life = smoothstep(0.0, 0.12 * L, s) * (1.0 - smoothstep(0.72 * L, L, s));
        float taper = sin(3.14159 * a);
        float dz = (s - aD.w) / 9.0;
        vI = life * taper * dim * (1.0 + uSplash * exp(-dz * dz));
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uAmount; varying float vI; varying float vX;
      void main() {
        float x = clamp(1.0 - vX * vX, 0.0, 1.0);
        float i = vI * x * uK * uAmount;
        if (i < 0.002) discard;
        gl_FragColor = vec4(uColor * i, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  return {
    mesh,
    mat,
    set(a, time = 0) {
      mesh.visible = a > 0.003;
      mat.uniforms.uAmount.value = a;
      mat.uniforms.uTime.value = time;
    },
  };
}

/* ───────────────────────────────────────────────────────────── THE GANTRY */

const TOOL_H = { knife: 24, arm: 24, nozzle: 30, screen: 0 }; // from the tip up to the mount

export function makeGantry({
  span = 500, height = 260, tool = "knife", style = "portal", axes = 3, legs = "post", work = 92, cable = true,
  lamp = tool === "nozzle" ? 0.55 : 0, screen = null, cups = 6, cupSpan = [28, 58], lift = 30, rails = 300,
} = {}) {
  const group = new THREE.Group();
  const K = kit();
  const half = span / 2;
  const BW = Math.max(18, span * 0.045); // the beam's section
  const BH = Math.max(24, span * 0.056);
  const bx = BW / 2 + 14; //                the beam stands downstream of the tool's axis (x = 0)
  const beamTop = height + BH / 2;
  const beamLow = height - BH / 2;

  /* the frame: legs (or posts and rails, or one column), feet */
  const frame = new THREE.Group();
  const traverse = new THREE.Group(); // the beam and all it carries (rides the rails in a bridge)
  group.add(frame, traverse);
  const legGeos = [];
  if (style === "bridge") {
    const railY = beamLow - 8;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      legGeos.push(at(box(14, railY, 14, 1.2), bx + (sx * rails) / 2, railY / 2, sz * half));
      legGeos.push(at(box(40, 5, 40, 1), bx + (sx * rails) / 2, 2.5, sz * half));
    }
    for (const sz of [-1, 1]) legGeos.push(at(box(rails + 34, 9, 13, 1.2), bx, railY + 4.5, sz * half));
    for (const sz of [-1, 1]) K.x(traverse, box(46, 14, 18, 1.5), BODY, [bx, beamLow - 1, sz * half]); // the end trucks
  } else if (style === "column") {
    legGeos.push(at(box(30, beamTop + 6, 34, 2), bx, (beamTop + 6) / 2, -half));
    legGeos.push(at(box(90, 8, 80, 1.5), bx, 4, -half));
    legGeos.push(strut([bx, beamLow - 70, -half + 15], [bx, beamLow, -half + 95], 7, 9));
  } else {
    for (const sz of [-1, 1]) {
      const z = sz * half;
      if (legs === "a") {
        for (const sx of [-1, 1]) legGeos.push(strut([bx + sx * 36, 3, z], [bx + sx * 5, beamLow - 6, z], 9, 12));
        legGeos.push(at(box(66, 5, 9, 1), bx, height * 0.36, z));
      } else {
        legGeos.push(at(box(16, beamLow - 8, 20, 1.5), bx, (beamLow - 8) / 2, z));
      }
      legGeos.push(at(box(74, 6, 34, 1.2), bx, 3, z)); //         the foot
      legGeos.push(at(box(26, 10, 28, 1.2), bx, beamLow - 5, z)); // the cap under the beam
    }
  }
  K.x(frame, bake(legGeos), FRAME);

  /* the beam, its linear rails on the upstream face, its motor */
  const beamLen = span + 28;
  const beamZ = style === "column" ? 10 : 0;
  K.x(traverse, bake([
    at(box(BW, BH, beamLen, 2), bx, height, beamZ),
    at(box(2.6, 2.6, beamLen - 16, 0.5), bx - BW / 2 - 1.3, height + BH * 0.3, beamZ),
    at(box(2.6, 2.6, beamLen - 16, 0.5), bx - BW / 2 - 1.3, height - BH * 0.3, beamZ),
  ]), BODY);
  K.x(traverse, bake([at(box(18, 18, 24, 2), bx, beamTop + 9, -half + 6), at(cyl(6, 14, 0.8, 32).rotateX(Math.PI / 2), bx, beamTop + 9, -half + 25)]), FRAME);

  /* the carriage: a plate on the rails, a saddle over the beam, a guide block for the vertical axis */
  const carriage = new THREE.Group();
  traverse.add(carriage);
  K.x(carriage, bake([
    at(box(6, BH + 20, 36, 1), bx - BW / 2 - 5, height, 0),
    at(box(BW + 14, 4, 28, 1), bx, beamTop + 2, 0),
    at(box(9, 26, 16, 1), 1.5, beamLow + 2, 0),
  ]), BODY);

  /* the head: the tool, and (3 axes) its slide that telescopes up through the guide */
  const head = new THREE.Group();
  const unit = new THREE.Group(); // screen: the frame and its squeegee, lowered as one
  const toolH = TOOL_H[tool] ?? 24;
  const rise = tool === "screen" ? 36 : tool === "arm" ? 32 : axes === 2 ? 12 : 40;
  const gapTip = tool === "screen" ? 0.8 : tool === "arm" ? 0.7 : tool === "nozzle" ? 1.4 : 0.05;
  const mountLow = work + gapTip + toolH; // the mount, down
  let wheel = null;
  let spark = null;
  let squeegee = null;
  let rod = null;
  const tubeLow = Math.max(4, beamLow - 6 - (mountLow + rise + 8)); // axes 2: the fixed drop tube's length
  if (tool !== "screen") {
    carriage.add(head);
    if (axes === 3) {
      const zLen = beamTop + 12 - mountLow;
      K.x(head, box(8, zLen, 8, 1), BODY, [0, toolH + zLen / 2, 0]);
    } else {
      K.x(carriage, cyl(5.5, tubeLow, 0.8, 32), BODY, [0, beamLow - 6 - tubeLow / 2, 0]);
      rod = K.x(head, cyl(1.6, 1, 0.2, 16), FRAME, [0, toolH, 0]);
    }
  }
  const S0 = { x: 0, y: 0, z: 0 };
  if (tool === "knife") {
    K.x(head, bake([at(cyl(6.5, 14, 0.8, 40), 0, 17, 0), at(box(16, 9, 12, 1), 0, 28.5, 0), at(cyl(2, 3, 0.3, 24), 0, 8.5, 0)]), BODY);
    K.x(head, cyl(1.8, 12, 0.3, 24), FRAME, [6.6, 16, 0]); // the pressure cylinder
    part(K, head, bake([at(box(1.2, 9.5, 7, 0.3), -1.9, 5.6, 0), at(box(1.2, 9.5, 7, 0.3), 1.9, 5.6, 0), at(box(5, 2, 7, 0.3), 0, 10.4, 0)]), { color: 0x3a4246, edge: 0.7 });
    wheel = part(K, head, cyl(3.2, 1.6, 0.35, 56).rotateZ(Math.PI / 2), { color: 0x30373b, rough: 0.3, metal: 0.5, edge: 0.9, pos: [0, 3.2, 0] });
    // the cold spark where the wheel bites: a point of light and a short tail behind it, on the glass
    spark = new THREE.Group();
    const coreMat = K.fx(glow(BRAND.ink, 2.2, { additive: true, opacity: 1 }));
    spark.add(new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 10), coreMat));
    const tailMat = K.fx(
      fxMat(/* glsl */ `uniform float uK; void main() {
        float along = clamp(vUv.y, 0.0, 1.0); float across = clamp(1.0 - abs(vUv.x - 0.5) * 2.0, 0.0, 1.0);
        gl_FragColor = vec4(vec3(0.913, 0.894, 0.847) * uK * pow(along, 2.0) * across * uAmount, 1.0); }`, { uK: { value: 0.9 } }, { side: THREE.DoubleSide }),
    );
    const tail = new THREE.Mesh(new THREE.PlaneGeometry(2, 26).rotateX(-Math.PI / 2).translate(0, 0, -13), tailMat);
    spark.add(tail);
    const poolMat = K.fx(fxMat(/* glsl */ `uniform float uK; void main() { float r = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
      gl_FragColor = vec4(vec3(0.913, 0.894, 0.847) * uK * pow(1.0 - r, 3.0) * uAmount, 1.0); }`, { uK: { value: 0.8 } }));
    spark.add(new THREE.Mesh(new THREE.CircleGeometry(10, 32).rotateX(-Math.PI / 2), poolMat));
    spark.userData.mats = [coreMat, tailMat, poolMat];
    carriage.add(spark);
  } else if (tool === "arm") {
    const [cx, cz] = cupSpan;
    K.x(head, bake([
      at(box(14, 8, 14, 1), 0, 20, 0),
      at(box(3.5, 3.5, 2 * cz + 8, 0.5), -cx, 13, 0),
      at(box(3.5, 3.5, 2 * cz + 8, 0.5), cx, 13, 0),
      at(box(2 * cx + 3.5, 3.5, 3.5, 0.5), 0, 13, 0),
      at(box(3.5, 3.5, 3.5, 0.5), 0, 15, 0),
    ]), BODY);
    const zs = cups >= 8 ? [-cz, -cz / 3, cz / 3, cz] : cups >= 6 ? [-cz, 0, cz] : [-cz, cz];
    const cupGeo = lathe([[0, 0], [3.3, 0], [3.4, 0.5], [2.4, 1.6], [2.9, 2.2], [1.8, 3.2], [1.2, 3.6], [1.2, 5], [0, 5]], 40, { bevel: 0.15 });
    const stems = [];
    for (const x of [-cx, cx]) for (const z of zs) {
      part(K, head, cupGeo, { color: 0x22272a, rough: 0.8, metal: 0, edge: 0.55, pos: [x, 0, z] });
      stems.push(at(cyl(0.7, 6.4, 0.1, 16), x, 8.1, z));
      const hose = fatLine([[0, 18, 0], [x * 0.55, 19.5, z * 0.55], [x, 11.6, z]], { color: BRAND.ink, width: 1.8, opacity: 0.4 });
      K.solid(hose.material);
      head.add(hose);
    }
    K.x(head, bake(stems), FRAME);
  } else if (tool === "nozzle") {
    K.x(head, bake([at(cyl(3.6, 16, 0.6, 32), 0, 22, 0), at(box(7, 5, 7, 0.6), 0, 11.5, 0)]), BODY);
    K.x(head, cyl(2.4, 18, 0.4, 32), FRAME, [-6.4, 21, 0]); // the glue cartridge
    part(K, head, lathe([[0, 0], [0.35, 0], [0.9, 6.5], [1.7, 8.6], [1.7, 9], [0, 9]], 32, { bevel: 0.08 }), { color: 0x6c7377, rough: 0.35, metal: 0.4, edge: 0.6 });
  } else if (tool === "screen") {
    const fw = screen?.w ?? Math.min(span * 0.38, 190); // across the line (z)
    const fh = screen?.h ?? fw * 0.64; //                 along it (x)
    traverse.add(unit);
    const bars = [
      at(box(fh + 10, 4, 5, 0.6), 0, 2, fw / 2 + 2.5), at(box(fh + 10, 4, 5, 0.6), 0, 2, -fw / 2 - 2.5),
      at(box(5, 4, fw, 0.6), fh / 2 + 2.5, 2, 0), at(box(5, 4, fw, 0.6), -fh / 2 - 2.5, 2, 0),
      at(box(fh + 6, 1.6, 1.6, 0.3), 0, 4.8, fw / 2 - 1), at(box(fh + 6, 1.6, 1.6, 0.3), 0, 4.8, -fw / 2 + 1), // the squeegee's rails
    ];
    K.x(unit, bake(bars), BODY);
    // the mesh (a faint veil) and its stencil: the band that will print, open in the emulsion
    const veil = K.fx(glow(BRAND.ink, 1, { additive: true, opacity: 0.035, double: true }));
    unit.add(new THREE.Mesh(new THREE.PlaneGeometry(fh, fw).rotateX(-Math.PI / 2).translate(0, 0.6, 0), veil));
    const outer = new THREE.Shape([[-fh * 0.43, -fw * 0.44], [fh * 0.43, -fw * 0.37], [fh * 0.43, fw * 0.37], [-fh * 0.43, fw * 0.44]].map(([x, y]) => new THREE.Vector2(x, y)));
    const b = Math.max(4, fw * 0.05);
    outer.holes.push(new THREE.Path([[-fh * 0.43 + b, -fw * 0.44 + b], [-fh * 0.43 + b, fw * 0.44 - b], [fh * 0.43 - b * 1.5, fw * 0.37 - b], [fh * 0.43 - b * 1.5, -fw * 0.37 + b]].map(([x, y]) => new THREE.Vector2(x, y))));
    const stencil = K.fx(glow(BRAND.ink, 1, { additive: true, opacity: 0.12, double: true }));
    unit.add(new THREE.Mesh(new THREE.ShapeGeometry(outer).rotateX(Math.PI / 2).translate(0, 0.7, 0), stencil));
    // the hangers: four rods up to a cross-bar under the beam
    const hang = beamLow - 6 - (work + gapTip + rise);
    K.x(unit, bake([
      at(cyl(1, hang, 0.2, 16), -fh / 2 - 2.5, hang / 2, fw / 2 - 6), at(cyl(1, hang, 0.2, 16), -fh / 2 - 2.5, hang / 2, -fw / 2 + 6),
      at(cyl(1, hang, 0.2, 16), fh / 2 + 2.5, hang / 2, fw / 2 - 6), at(cyl(1, hang, 0.2, 16), fh / 2 + 2.5, hang / 2, -fw / 2 + 6),
      at(box(fh + 12, 5, 6, 0.6), 0, hang, fw / 2 - 6), at(box(fh + 12, 5, 6, 0.6), 0, hang, -fw / 2 + 6),
      at(box(8, 5, fw - 6, 0.6), bx, hang, 0),
      at(cyl(1.8, rise + 34, 0.3, 16), bx - BW / 2 - 6, hang + (rise + 34) / 2, fw * 0.3), at(cyl(1.8, rise + 34, 0.3, 16), bx - BW / 2 - 6, hang + (rise + 34) / 2, -fw * 0.3),
    ]), FRAME);
    // the squeegee: its holder (X-ray), its rubber blade (solid), the flood bar behind it
    squeegee = new THREE.Group();
    unit.add(squeegee);
    K.x(squeegee, bake([at(box(2, 2, fw - 10, 0.4), -7, 4.5, 0), at(box(3, 8, 3, 0.4), 0, 14, fw / 2 - 4), at(box(3, 8, 3, 0.4), 0, 14, -fw / 2 + 4)]), BODY);
    part(K, squeegee, box(6, 7, fw - 6, 0.8), { color: 0x343b3f, rough: 0.45, metal: 0.4, edge: 0.85, pos: [0, 9.8, 0] });
    part(K, squeegee, box(1.4, 5.8, fw - 9, 0.25), { color: 0x1f2427, rough: 0.8, metal: 0, edge: 0.9, pos: [0, 3.5, 0] });
    S0.fh = fh;
  }
  const A = { head: tool === "screen" ? unit : head };

  /* the lamp (inspection): hangs from the carriage, lights the glass under the tool */
  let lampObj = null;
  if (lamp > 0 && tool !== "screen") {
    const len = beamLow - 14 - work;
    lampObj = makeLamp({ length: len, r0: 3.2, r1: 30, k: lamp });
    lampObj.group.position.set(-13, beamLow - 14, 0);
    carriage.add(lampObj.group);
    K.x(carriage, box(12, 6, 12, 1), BODY, [-13, beamLow - 11, 0]);
  }

  /* the cable chain on top of the beam: lower run (fixed end at −z), a U-turn, upper run back to the carriage */
  let chain = null;
  if (cable && tool !== "screen") {
    const r = 7;
    const y0 = beamTop + 1.6;
    const z0 = -half + 8;
    const runGeo = new THREE.BoxGeometry(9, 3, 1);
    const lower = K.x(traverse, runGeo, FRAME);
    const upper = K.x(traverse, runGeo.clone(), FRAME);
    const bend = K.x(traverse, new THREE.CylinderGeometry(r, r, 9, 18, 1, true, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(Math.PI / 2), FRAME);
    chain = { r, y0, z0, lower, upper, bend, C: span * 1.0 };
  }

  const travelReach = span * 0.9;
  return {
    group, A,
    set({ amount = 1, travel = 0, down = 0, lift: lf = 0, slide = 0, time = 0 } = {}) {
      const on = amount > 0.003;
      group.visible = on;
      if (!on) return;
      K.fade(amount);
      const tr = clamp01(travel);
      const dn = clamp01(down);
      if (style === "bridge") traverse.position.x = Math.max(-1, Math.min(1, slide)) * rails * 0.5;
      if (tool === "screen") {
        unit.position.y = work + gapTip + rise * (1 - dn);
        squeegee.position.x = lerp(-S0.fh / 2 + 8, S0.fh / 2 - 8, tr);
        return;
      }
      const zc = (tr - 0.5) * travelReach;
      carriage.position.z = zc;
      const tipY = work + gapTip + rise * (1 - dn) + (tool === "arm" ? clamp01(lf) * lift : 0);
      head.position.y = tipY;
      if (rod) {
        const len = Math.max(1, beamLow - 6 - tubeLow - (tipY + toolH));
        rod.scale.y = len;
        rod.position.y = toolH + len / 2;
      }
      if (wheel) wheel.rotation.x = -zc / 3.2;
      if (spark) {
        const bite = dn > 0.98 && tr > 0.01 && tr < 0.99 ? 1 : 0;
        spark.visible = bite > 0;
        spark.position.set(0, work + 0.15, 0);
        const shimmer = 0.88 + 0.12 * Math.sin(time * 2.7) * Math.sin(time * 1.3 + 0.7);
        for (const m of spark.userData.mats) {
          if (m.uniforms?.uAmount) m.uniforms.uAmount.value = amount * bite * shimmer;
          else m.opacity = amount * bite * shimmer;
        }
      }
      if (lampObj) lampObj.set(amount);
      if (chain) {
        const { r, y0, z0, lower, upper, bend, C } = chain;
        const zcEnd = zc + 4; // where the upper run meets the saddle
        const zb = Math.max(zcEnd + r * 0.6, z0 + r, (C - Math.PI * r + z0 + zcEnd) / 2);
        lower.scale.z = Math.max(1, zb - z0);
        lower.position.set(bx, y0, (z0 + zb) / 2);
        upper.scale.z = Math.max(1, zb - zcEnd);
        upper.position.set(bx, y0 + 2 * r, (zcEnd + zb) / 2);
        bend.position.set(bx, y0 + r, zb);
      }
    },
  };
}

/* ───────────────────────────────────────────────────────────── THE CLEAN ROOM */

export function makeCleanRoom({
  length = 1000, half = 300, height = 300, bay = 125, sas = "back", sasAt = 0.24, flow = "down", ffu = "all",
  streaks = 200, slot = null, curtain = true, work = 96, seed = 7,
} = {}) {
  const group = new THREE.Group();
  const K = kit();
  const sl = { bottom: 48, top: 150, half: Math.min(half - 40, 215), ...slot };
  const nx = Math.max(2, Math.round(length / bay));
  const nz = Math.max(2, Math.round((2 * half) / bay));
  const bx = length / nx;
  const bz = (2 * half) / nz;

  /* mullions, top rails, the ceiling's grid, the posts that frame the slot */
  const frame = [];
  for (let i = 0; i <= nx; i++) for (const s of [-1, 1]) frame.push(at(box(5, height, 5, 0.8), i * bx, height / 2, s * half));
  for (const x of [0, length]) for (const z of [-sl.half - 3, sl.half + 3]) frame.push(at(box(5, height, 5, 0.8), x, height / 2, z));
  for (const x of [0, length]) frame.push(at(box(5, 5, 2 * sl.half + 6, 0.8), x, sl.top + 2.5, 0));
  for (let i = 0; i <= nx; i++) frame.push(at(box(3, 4, 2 * half, 0.5), i * bx, height, 0));
  for (let j = 0; j <= nz; j++) frame.push(at(box(length, 4, 3, 0.5), length / 2, height, -half + j * bz));
  for (const s of [-1, 1]) frame.push(at(box(length, 5, 5, 0.8), length / 2, 2.5, s * half)); // the sill
  K.x(group, bake(frame), FRAME);

  /* the walls: one pane per wall (only its edges show), the end walls around the slot */
  const walls = [
    at(new THREE.PlaneGeometry(length, height), length / 2, height / 2, half),
    at(new THREE.PlaneGeometry(length, height), length / 2, height / 2, -half),
  ];
  for (const x of [0, length]) {
    const side = half - sl.half;
    for (const s of [-1, 1]) walls.push(at(new THREE.PlaneGeometry(side, height), x, height / 2, s * (sl.half + side / 2), 0, Math.PI / 2));
    walls.push(at(new THREE.PlaneGeometry(2 * sl.half, height - sl.top), x, (height + sl.top) / 2, 0, 0, Math.PI / 2));
    walls.push(at(new THREE.PlaneGeometry(2 * sl.half, sl.bottom), x, sl.bottom / 2, 0, 0, Math.PI / 2));
  }
  K.x(group, bake(walls), WALL);
  // the return grilles at the foot of the long walls: where the air leaves
  K.x(group, bake([at(box(length - 24, 22, 4, 0.6), length / 2, 16, half - 4), at(box(length - 24, 22, 4, 0.6), length / 2, 16, -half + 4)]), FRAME);

  /* the strip curtains in the slot: hanging strips, a little swayed */
  if (curtain) {
    const r = rng(seed + 1);
    const n = Math.max(6, Math.round((2 * sl.half) / 26));
    const sw = (2 * sl.half) / n;
    const strips = [];
    for (const x of [0, length]) for (let i = 0; i < n; i++) {
      const hgt = sl.top - sl.bottom - 2;
      strips.push(at(new THREE.PlaneGeometry(sw - 2, hgt), x + (r() - 0.5) * 2, sl.bottom + hgt / 2 + 1, -sl.half + (i + 0.5) * sw, 0, Math.PI / 2 + (r() - 0.5) * 0.12));
    }
    K.x(group, bake(strips), { ...WALL, opacity: 0.22, rim: 0.08 });
  }

  /* the filter units (FFU) in the ceiling grid; their filter faces light up with the air */
  const cells = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) if (ffu === "all" || (i + j) % 2 === 0) cells.push([(i + 0.5) * bx, -half + (j + 0.5) * bz]);
  K.x(group, bake(cells.map(([x, z]) => at(box(bx - 16, 14, bz - 16, 1.2), x, height + 9, z))), WALL);
  const faceMat = K.fx(glow(BRAND.ink, 1, { additive: true, opacity: 0.035, double: true }));
  const faces = new THREE.Mesh(bake(cells.map(([x, z]) => at(new THREE.PlaneGeometry(bx - 20, bz - 20).rotateX(Math.PI / 2), x, height - 1.5, z))), faceMat);
  group.add(faces);

  /* the airlock (sas): a small glass room on one side, its two doors */
  if (sas !== "none") {
    const s = sas === "front" ? 1 : -1;
    const sw = Math.min(170, bx * 1.3);
    const sd = Math.min(180, half * 0.6);
    const sh = height - 40;
    const x0 = sasAt * length;
    const zw = s * half;
    const zo = s * (half + sd);
    K.x(group, bake([
      at(new THREE.PlaneGeometry(sw, sh), x0, sh / 2, zo),
      at(new THREE.PlaneGeometry(sd, sh), x0 - sw / 2, sh / 2, (zw + zo) / 2, 0, Math.PI / 2),
      at(new THREE.PlaneGeometry(sd, sh), x0 + sw / 2, sh / 2, (zw + zo) / 2, 0, Math.PI / 2),
      at(new THREE.PlaneGeometry(sw, sd).rotateX(Math.PI / 2), x0, sh, (zw + zo) / 2),
    ]), WALL);
    const posts = [];
    for (const x of [x0 - sw / 2, x0 + sw / 2]) for (const z of [zw, zo]) posts.push(at(box(5, sh, 5, 0.8), x, sh / 2, z));
    for (const z of [zw, zo]) {
      posts.push(at(box(sw, 5, 5, 0.8), x0, sh, z));
      posts.push(at(box(4, 212, 4, 0.5), x0 - 46, 106, z), at(box(4, 212, 4, 0.5), x0 + 46, 106, z), at(box(96, 4, 4, 0.5), x0, 212, z)); // the door frames
    }
    K.x(group, bake(posts), FRAME);
  }

  /* the AIR: long slow streaks from the filters, down onto the line, then out to the grilles */
  const lineHalf = sl.half - 15;
  const air = makeStreaks({
    count: streaks, seed: seed + 2, len: 150, width: 1.8, minPx: 2, k: 0.85, corner: 30,
    fill: (i, rr) => {
      if (flow === "cross") {
        const x = 20 + rr() * (length - 40);
        const y = 30 + rr() * (height - 60);
        return { o: [x, y, -half + 6], d: [0, 0, 1], l1: 2 * half - 14, l2: 0, speed: 26 + rr() * 22, len: 0.8 + rr() * 0.6, width: 0.8 + rr() * 0.6 };
      }
      const [cx, cz] = cells[Math.floor(rr() * cells.length) % cells.length];
      const x = cx + (rr() - 0.5) * (bx - 24);
      const z = cz + (rr() - 0.5) * (bz - 24);
      const onLine = Math.abs(z) < lineHalf;
      const y0 = height - 3;
      const yHit = onLine ? work + 4 : 26;
      const sz = z === 0 ? 1 : Math.sign(z);
      const sdir = new THREE.Vector3(0, -0.22, sz).normalize();
      const reach = Math.max(10, (half - Math.abs(z)) * 0.9);
      return { o: [x, y0, z], d: [0, -1, 0], l1: y0 - yHit, s: [sdir.x, sdir.y, sdir.z], l2: reach, speed: 30 + rr() * 26, len: 0.75 + rr() * 0.6, width: 0.8 + rr() * 0.7 };
    },
  });
  group.add(air.mesh);

  return {
    group,
    set({ amount = 1, air: a = 0, time = 0 } = {}) {
      const on = amount > 0.003;
      group.visible = on;
      if (!on) return;
      K.fade(amount);
      faceMat.opacity = faceMat.userData.base * amount * (0.35 + 0.65 * clamp01(a));
      air.set(clamp01(a) * amount, time);
    },
  };
}

/* ───────────────────────────────────────────────────────────── THE BLOWER (tempering) */

export function makeBlower({
  length = 500, half = 140, y = 90, rows = 8, kind = "pipes", cols = 9, angle = 0, gap = 10, nozzle = 18, plenum = 46,
  oscillate = 0, period = 2.4, fan = true, seed = 11,
} = {}) {
  const group = new THREE.Group();
  const K = kit();
  const swing = new THREE.Group(); // the two banks, swinging along x
  group.add(swing);
  const yUt = y + 2 + gap; //  the upper tips
  const yLt = y - 1 - gap; //  the lower tips
  const pitch = length / rows;
  const tilt = (i) => (angle ? ((i % 2 ? 1 : -1) * angle * Math.PI) / 180 : 0);
  const zs = [];
  for (let j = 0; j < cols; j++) zs.push(-half * 0.9 + ((j + 0.5) * 1.8 * half) / cols);

  /* the ribs of nozzles, each built tip at its origin, pointing down; the lower bank is the upper one turned over */
  const ribGeo = () => {
    if (kind === "slots") {
      return new THREE.ExtrudeGeometry(new THREE.Shape([[-1.6, 0], [1.6, 0], [6, nozzle], [-6, nozzle]].map(([a, b]) => new THREE.Vector2(a, b))), { depth: 1.86 * half, bevelEnabled: false }).translate(0, 0, -0.93 * half);
    }
    const g = [at(box(8, 6, 1.86 * half, 0.8), 0, nozzle - 3, 0)];
    for (const z of zs) g.push(at(cyl(1.4, nozzle - 6, 0.2, 20, 1.0), 0, (nozzle - 6) / 2, z));
    return bake(g);
  };
  const base = ribGeo();
  const upper = [];
  const lower = [];
  for (let i = 0; i < rows; i++) {
    const x = (i + 0.5) * pitch;
    upper.push(at(base.clone(), x, yUt, 0, 0, 0, tilt(i)));
    lower.push(at(base.clone(), x, yLt, 0, Math.PI, 0, tilt(i)));
  }
  K.x(swing, bake(upper), BODY);
  K.x(swing, bake(lower), BODY);
  const pTop = yUt + nozzle;
  const pLow = yLt - nozzle;
  K.x(swing, bake([at(box(length + 20, plenum, 2 * half + 20, 3), length / 2, pTop + plenum / 2, 0), at(box(length + 20, Math.min(plenum, pLow - 4), 2 * half + 20, 3), length / 2, pLow - Math.min(plenum, pLow - 4) / 2, 0)]), { ...FRAME, rim: 0.1 });
  // the side cheeks that tie the two banks (the glass passes between)
  K.x(swing, bake([at(box(length + 26, pTop + plenum - (pLow - Math.min(plenum, pLow - 4)), 4, 0.6), length / 2, (pTop + plenum + pLow - Math.min(plenum, pLow - 4)) / 2, -half - 12)]), FRAME);

  /* the ducts and the blower's scroll, at −z (the camera stands on +z) */
  if (fan) {
    const dr = Math.min(32, half * 0.24);
    const yU = pTop + plenum + 70;
    const yL = Math.max(dr + 6, pLow - Math.min(plenum, pLow - 4) / 2);
    const zF = -half - 150;
    const R = (yU - yL) / 2 + dr * 0.8;
    const yC = (yU + yL) / 2;
    const xm = length / 2;
    K.x(group, bake([
      at(cyl(dr, 70, 1.5, 48), xm, pTop + plenum + 35, -half * 0.35),
      at(cyl(dr, Math.abs(zF + half * 0.35), 1.5, 48).rotateX(Math.PI / 2), xm, yU, (zF - half * 0.35) / 2),
      at(cyl(dr * 1.1, dr * 2.2, 1.5, 48), xm, yU, -half * 0.35),
      at(cyl(dr, Math.abs(zF + half + 10), 1.5, 48).rotateX(Math.PI / 2), xm, yL, (zF - half - 10) / 2),
    ]), { ...WALL, opacity: 0.4 });
    K.x(group, bake([at(cyl(R, 64, 3, 64).rotateX(Math.PI / 2), xm, yC, zF - 32), at(cyl(R * 0.36, 30, 1.5, 48).rotateX(Math.PI / 2), xm, yC, zF - 80)]), { ...WALL, opacity: 0.4 });
    K.x(group, bake([at(box(64, 52, 52, 3), xm + R + 40, 26, zF - 32), at(box(R * 2 + 30, 8, 90, 1), xm, 4, zF - 32)]), FRAME);
  }

  /* the JETS: from every nozzle to the glass, both faces at once, and out along it; the print of their impacts */
  const sources = [];
  for (let i = 0; i < rows; i++) for (const z of zs) for (const s of [1, -1]) sources.push({ x: (i + 0.5) * pitch, z, s, a: tilt(i) });
  const jets = makeStreaks({
    count: sources.length * 2, seed, len: 22, width: 1.2, minPx: 2, k: 1.0, splash: 1.3, corner: 4,
    fill: (n, rr) => {
      const src = sources[n % sources.length];
      const yTip = src.s > 0 ? yUt : yLt;
      const yHit = src.s > 0 ? y + 2 : y + 1;
      const dir = [Math.sin(src.a), -src.s * Math.cos(src.a), 0];
      const tipX = src.x;
      const l1 = Math.abs(yTip - yHit) / Math.max(0.3, Math.cos(src.a));
      const sz = src.z === 0 ? (rr() < 0.5 ? -1 : 1) : Math.sign(src.z) * (rr() < 0.8 ? 1 : -1);
      const sd = new THREE.Vector3((rr() - 0.5) * 1.2 + Math.sin(src.a) * 1.4, 0, sz * (0.5 + rr() * 0.5)).normalize();
      return { o: [tipX, yTip, src.z], d: dir, l1, s: [sd.x, sd.y, sd.z], l2: 14 + rr() * 26, speed: 160 + rr() * 110, len: 0.7 + rr() * 0.6, width: 0.8 + rr() * 0.5 };
    },
  });
  swing.add(jets.mesh);
  // the impacts on the two faces: soft round marks (a radial gradient by vertex colours)
  const spots = [];
  for (const src of sources) {
    const yS = src.s > 0 ? y + 2.05 : y + 0.95;
    const xS = src.x + Math.tan(src.a) * (src.s > 0 ? yUt - yS : yS - yLt) * 1;
    const c = new THREE.CircleGeometry(4.2, 20).rotateX(-Math.PI / 2).translate(xS, yS, src.z);
    const col = new Float32Array(c.attributes.position.count * 3);
    for (let v = 1; v < c.attributes.position.count; v++) col.set([0, 0, 0], v * 3);
    col.set([1, 1, 1], 0);
    c.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    c.deleteAttribute("uv");
    spots.push(c.toNonIndexed());
  }
  const spotMat = K.fx(new THREE.MeshBasicMaterial({ color: new THREE.Color(BRAND.ink).multiplyScalar(0.55), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
  spotMat.userData.base = 1;
  const spotMesh = new THREE.Mesh(mergeGeometries(spots), spotMat);
  spotMesh.renderOrder = 7;
  swing.add(spotMesh);

  return {
    group,
    set({ amount = 1, jets: j = 0, time = 0 } = {}) {
      const on = amount > 0.003;
      group.visible = on;
      if (!on) return;
      K.fade(amount);
      const jj = clamp01(j);
      swing.position.x = oscillate ? oscillate * Math.sin((time * 2 * Math.PI) / Math.max(0.5, period)) : 0;
      jets.set(jj * amount, time);
      spotMat.opacity = amount * jj;
      spotMesh.visible = jj * amount > 0.003;
    },
  };
}

/* ───────────────────────────────────────────────────────────── THE DROP TOWER */

/** The climatic box's panes: a glass that turns signal when hot (its inside warm), and frosts from its borders when cold. */
function chamberMat(halfSize) {
  return fxMat(
    /* glsl */ `uniform float uHot, uCold; uniform vec3 uHalf, cInk, cSig;
    float hsh(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
    float vn(vec3 p) {
      vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hsh(i), hsh(i + vec3(1, 0, 0)), f.x), mix(hsh(i + vec3(0, 1, 0)), hsh(i + vec3(1, 1, 0)), f.x), f.y),
                 mix(mix(hsh(i + vec3(0, 0, 1)), hsh(i + vec3(1, 0, 1)), f.x), mix(hsh(i + vec3(0, 1, 1)), hsh(i + vec3(1, 1, 1)), f.x), f.y), f.z);
    }
    void main() {
      float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
      vec3 a = clamp(abs(vP) / max(uHalf, vec3(1e-3)), 0.0, 1.0);
      float hi = max(a.x, max(a.y, a.z)); float lo = min(a.x, min(a.y, a.z));
      float mid = a.x + a.y + a.z - hi - lo;           // on a face: how far toward its border
      float n = vn(vP * 0.32) * 0.65 + vn(vP * 0.9) * 0.35;
      float frost = smoothstep(0.62, 0.95, mid + (n - 0.5) * 0.55) * uCold;
      vec3 glassCol = mix(cInk, cSig, uHot);
      vec3 c = glassCol * (0.02 + 0.3 * pow(g, 2.4)) + cInk * frost * (0.15 + 0.2 * n);
      if (!gl_FrontFacing) c += cSig * uHot * 0.07 * (1.0 - 0.5 * a.y);
      gl_FragColor = vec4(c * uAmount, 1.0);
    }`,
    { uHot: { value: 0 }, uCold: { value: 0 }, uHalf: { value: new THREE.Vector3(...halfSize) }, cInk: { value: INK }, cSig: { value: SIGNAL } },
    { side: THREE.DoubleSide },
  );
}

/** A lattice mast: posts at `corners` ([x, z]), rungs and zigzag braces every `brace` cm, from y0 to y1. */
function lattice(corners, y0, y1, brace, { post = 8, rung = 3.4, diag = 3 } = {}) {
  const g = [];
  for (const [x, z] of corners) g.push(at(box(post, y1 - y0, post, 0.8), x, (y0 + y1) / 2, z));
  const faces = corners.length === 2 ? [[0, 1]] : corners.map((_, i) => [i, (i + 1) % corners.length]);
  const n = Math.max(1, Math.round((y1 - y0) / brace));
  const step = (y1 - y0) / n;
  for (let k = 0; k <= n; k++) {
    const yk = y0 + k * step;
    for (const [i, j] of faces) {
      const [a, b] = [corners[i], corners[j]];
      g.push(strut([a[0], yk, a[1]], [b[0], yk, b[1]], rung, rung));
      if (k < n) {
        const flip = (k + i) % 2;
        const p = flip ? a : b;
        const q = flip ? b : a;
        g.push(strut([p[0], yk + 2, p[1]], [q[0], yk + step - 2, q[1]], diag, diag));
      }
    }
  }
  return bake(g);
}

export function makeDropTower({
  height = 400, mast = 900, plate = 100, sample = 30, posts = 4, width = 72, brace = 120, behind = 70, guard = true,
  lamp = 0.5, ticks = true, axis = true, top = 1.7,
} = {}) {
  const group = new THREE.Group();
  const K = kit();
  const rB = 4.1; //  the 2.26 kg ball: 82 mm
  const rS = 1.9; //  the 227 g ball: 38 mm
  const yS = plate + top; // the sample's top surface
  const smallAt = [8, 5]; // its own axis, clear of the big release's arm
  const yHoldB = yS + height + rB;
  const yHoldS = yS + mast + rS;
  const Ht = yHoldS + rS + 70;
  const zT = -(behind + width / 2);

  /* the tower: a lattice mast behind the axis, its cross-head, its hoist */
  const corners =
    posts === 2 ? [[-width / 2, zT], [width / 2, zT]] :
    posts === 3 ? [[-width / 2, zT + width / 2], [width / 2, zT + width / 2], [0, zT - width / 2]] :
    [[-width / 2, zT - width / 2], [width / 2, zT - width / 2], [width / 2, zT + width / 2], [-width / 2, zT + width / 2]];
  K.x(group, lattice(corners, 0, Ht, brace), FRAME);
  K.x(group, bake([
    at(box(width + 34, 16, width + 34, 2), 0, Ht + 8, zT),
    at(box(10, 10, behind + width / 2 + 14, 1), 0, Ht + 5, zT / 2 + 2),
    at(box(width + 60, 10, width + 60, 1.5), 0, 5, zT),
  ]), BODY);
  K.x(group, bake([at(cyl(9, 5, 0.8, 40).rotateZ(Math.PI / 2), -6, Ht + 26, zT + width / 2 - 4), at(box(22, 18, 22, 2), width / 2 - 6, Ht + 25, zT)]), FRAME);

  /* the sample's seat: a heavy base, a lower frame, the upper clamping frame, four toggle clamps */
  const oh = sample / 2 + 5;
  const ih = sample / 2 - 2.5;
  const ring = (y0, t) => [
    at(box(2 * oh, t, oh - ih, 0.4), 0, y0 + t / 2, (oh + ih) / 2), at(box(2 * oh, t, oh - ih, 0.4), 0, y0 + t / 2, -(oh + ih) / 2),
    at(box(oh - ih, t, 2 * ih, 0.4), (oh + ih) / 2, y0 + t / 2, 0), at(box(oh - ih, t, 2 * ih, 0.4), -(oh + ih) / 2, y0 + t / 2, 0),
  ];
  K.x(group, bake([at(box(100, plate - 16, 100, 3), 0, (plate - 16) / 2, 0)]), BODY);
  const seat = [...ring(plate - 2.7, 3), ...ring(yS, 2.4)];
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) seat.push(at(box(5, 13.5, 5, 0.6), x * (oh - 3), plate - 9.5, z * (oh - 3)));
  for (const [x, z] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) seat.push(at(box(x ? 7 : 9, 6, x ? 9 : 7, 0.8), x * (oh + 4), yS - 0.5, z * (oh + 4)));
  K.x(group, bake(seat), BODY);
  const A = { plate: new THREE.Object3D() };
  A.plate.position.set(0, plate, 0);
  group.add(A.plate);

  /* the two releases: a carriage on the tower, an arm over the axis, an electromagnet that holds the ball */
  const release = (x, z, yHold, r) => {
    const yM = yHold + r; // the magnet's face
    const armY = yM + 11;
    return [
      at(box(width + 10, 16, 8, 1), 0, armY, -behind - 4),
      strut([x, armY, -behind], [x, armY, z + 4], 6, 6),
      at(cyl(5.5, 8, 0.6, 40), x, yM + 4, z),
      at(box(8, 6, 8, 0.6), x, yM + 9, z),
    ];
  };
  K.x(group, bake([...release(0, 0, yHoldB, rB), ...release(smallAt[0], smallAt[1], yHoldS, rS)]), BODY);
  part(K, group, bake([at(cyl(2.4, 1.2, 0.2, 32), 0, yHoldB + rB + 0.6, 0), at(cyl(1.6, 1.2, 0.2, 32), smallAt[0], yHoldS + rS + 0.6, smallAt[1])]), { color: 0x3a4246, edge: 0.6 });
  for (const [x, yA] of [[-width / 2 + 8, yHoldB + rB + 19], [width / 2 - 8, yHoldS + rS + 19]]) {
    const c = fatLine([[x, Ht - 2, -behind - 6], [x, yA, -behind - 6]], { color: BRAND.ink, width: 1.8, opacity: 0.4 });
    K.solid(c.material);
    group.add(c);
  }
  if (axis) {
    for (const [x, z, y0] of [[0, 0, yHoldB - rB], [smallAt[0], smallAt[1], yHoldS - rS]]) {
      const l = fatLine([[x, y0 - 2, z], [x, yS + 1, z]], { color: BRAND.ink, width: 1.8, opacity: 0.2, dashed: true, dashSize: 8, gapSize: 7 });
      K.solid(l.material);
      group.add(l);
    }
  }
  if (ticks) {
    const t = [];
    for (let h = 0; yS + h <= Ht - 20; h += 50) {
      const big = h % 100 === 0;
      t.push(at(box(big ? 12 : 6, big ? 1.6 : 1.2, 1.6, 0.2), -width / 2 - (big ? 6 : 3) - 3, yS + h, -behind + 1));
    }
    K.x(group, bake(t), { ...BODY, opacity: 0.9, edge: 0.6 });
  }

  /* the guard: three panes of glass around the seat (open toward the camera) */
  if (guard) {
    const gw = 62;
    const gh = 190;
    K.x(group, bake([
      at(new THREE.PlaneGeometry(gw * 2, gh), 0, gh / 2, -gw + 4),
      at(new THREE.PlaneGeometry(gw * 2, gh), -gw, gh / 2, 4, 0, Math.PI / 2),
      at(new THREE.PlaneGeometry(gw * 2, gh), gw, gh / 2, 4, 0, Math.PI / 2),
    ]), WALL);
    const p = [];
    for (const [x, z] of [[-gw, -gw + 4], [gw, -gw + 4], [-gw, gw + 4], [gw, gw + 4]]) p.push(at(box(4, gh, 4, 0.5), x, gh / 2, z));
    p.push(at(box(gw * 2, 4, 4, 0.5), 0, gh, -gw + 4), at(box(4, 4, gw * 2, 0.5), -gw, gh, 4), at(box(4, 4, gw * 2, 0.5), gw, gh, 4));
    K.x(group, bake(p), { ...WALL, opacity: 0.4 });
  }

  /* the lamp: high on the tower, aimed at the sample */
  let lampObj = null;
  if (lamp > 0) {
    const from = [-22, yS + 240, -behind + 6];
    const len = Math.hypot(from[0], from[1] - yS, from[2]);
    lampObj = makeLamp({ length: len, r0: 4, r1: 26, k: lamp });
    aim(lampObj.group, from, [0, yS, 0]);
    group.add(lampObj.group);
    K.x(group, bake([at(box(12, 9, 12, 1), from[0], from[1] + 5, from[2]), strut([from[0], from[1] + 5, from[2]], [from[0], from[1] + 5, -behind - 4], 4, 4)]), BODY);
  }

  /* the climatic box around the sample: its panes, its port for the ball, its coil */
  const ch = [sample / 2 + 13, 19, sample / 2 + 13];
  const chMat = K.fx(chamberMat(ch));
  const chamberG = new THREE.Group();
  chamberG.position.set(0, plate + 11, 0);
  const chGeo = new THREE.BoxGeometry(ch[0] * 2, ch[1] * 2, ch[2] * 2);
  const chMesh = new THREE.Mesh(chGeo, chMat);
  chMesh.renderOrder = 5;
  const chLines = edgesOf(chGeo, { color: BRAND.ink, width: 1.8, opacity: 0.6 });
  chMesh.add(chLines);
  chamberG.add(chMesh);
  const port = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 3, 40, 1, true), chMat);
  port.position.y = ch[1] + 1.5;
  const portLines = edgesOf(new THREE.CylinderGeometry(7, 7, 3, 40, 1, true), { color: BRAND.ink, width: 1.8, opacity: 0.6 });
  port.add(portLines);
  chamberG.add(port);
  const coilPts = [];
  for (let i = 0; i <= 12; i++) coilPts.push([-ch[0] + 6 + (i * (2 * ch[0] - 12)) / 12, i % 2 ? ch[1] - 7 : -ch[1] + 7, -ch[2] + 3]);
  const coil = fatLine(coilPts, { color: BRAND.ink, width: 2.4, opacity: 1 });
  chamberG.add(coil);
  group.add(chamberG);
  const chCol = new THREE.Color();

  /* the balls: the threat */
  const ball = threat(K, group, new THREE.SphereGeometry(rB, 48, 32), { ink: 1.5, sig: 0.6 });
  const small = threat(K, group, new THREE.SphereGeometry(rS, 32, 20), { ink: 1.5, sig: 0.6 });
  A.ball = ball;
  A.small = small;
  const fall = (k, h) => (k <= 1 ? h * (1 - k * k) : 0); // it falls: slow, then fast (k is time, the drop is k²)
  const settle = (k) => {
    if (k <= 1) return 0;
    const u = clamp01((k - 1) / 0.2);
    return 2.6 * Math.sin(Math.PI * Math.min(1, u * 1.6)) * (1 - u) - 0.9 * smooth(0, 1, u); // a small bounce, then it rests in its dimple
  };

  return {
    group, A,
    set({ amount = 1, ball: b = 0, small: s = 0, chamber = 0, time = 0 } = {}) {
      const on = amount > 0.003;
      group.visible = on;
      if (!on) return;
      K.fade(amount);
      if (lampObj) lampObj.set(amount);
      ball.position.set(0, yS + rB + fall(b, height) + settle(b), 0);
      small.position.set(smallAt[0], yS + rS + fall(s, mast) + settle(s) * 0.5, smallAt[1]);
      const hot = clamp01(chamber);
      const cold = clamp01(-chamber);
      const c = Math.abs(Math.max(-1, Math.min(1, chamber)));
      chamberG.visible = c * amount > 0.003;
      chMat.uniforms.uAmount.value = c * amount;
      chMat.uniforms.uHot.value = hot;
      chMat.uniforms.uCold.value = cold;
      chCol.copy(INK).lerp(SIGNAL, hot);
      chLines.material.color.copy(chCol);
      portLines.material.color.copy(chCol);
      chLines.material.opacity = 0.6 * c * amount;
      portLines.material.opacity = 0.6 * c * amount;
      // the coil: glowing signal when it heats (a slow breath, never a blink), a dim ink tube when it cools
      const breath = 0.92 + 0.08 * Math.sin(time * 1.4);
      coil.material.color.copy(cold > 0 ? INK : SIGNAL).multiplyScalar(cold > 0 ? 0.55 : 1.6 * breath);
      coil.material.opacity = c * amount;
    },
  };
}

/* ───────────────────────────────────────────────────────────── THE HEAD RIG */

export function makeHeadRig({
  drop = 150, frame = 100, w = 150, h = 92, wTop = w, rest = frame, sag = 0, sagV = 0, gallows = "portal", lamp = 0.5,
  ticks = true, axis = true, thick = 1.4,
} = {}) {
  const group = new THREE.Group();
  const K = kit();
  // the pane, lying as on the line: its width across (z), its height along (x: the foot at −h/2); its corners at
  // y = rest, its curve: y = rest − sag (1 − u²) − sagV (1 − v²), u = 2z / w, v = 2x / h
  const yOf = (x, z) => rest - sag * (1 - (2 * z / w) ** 2) - sagV * (1 - (2 * x / h) ** 2);
  const yC = yOf(0, 0) + thick / 2; // the glass's top at its centre: where the head lands

  /* the gabarit: four bars under the pane's edges, following its curve, on legs */
  const inset = 3;
  const corner = [[-h / 2 + inset, -w / 2 + inset], [h / 2 - inset, -wTop / 2 + inset], [h / 2 - inset, wTop / 2 - inset], [-h / 2 + inset, w / 2 - inset]];
  const bars = [];
  for (let i = 0; i < 4; i++) {
    const [a, b] = [corner[i], corner[(i + 1) % 4]];
    const pts = [];
    for (let k = 0; k <= 14; k++) {
      const x = lerp(a[0], b[0], k / 14);
      const z = lerp(a[1], b[1], k / 14);
      pts.push(new THREE.Vector3(x, yOf(x, z) - thick / 2 - 2.8, z));
    }
    bars.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 3.2, 4, false));
  }
  K.x(group, bake(bars), { ...BODY, rim: 0.26, edge: 0.5 });
  const legs = [];
  for (const [x, z] of corner) {
    const y1 = yOf(x, z) - thick / 2 - 5.5;
    legs.push(at(box(6, y1, 6, 0.6), x, y1 / 2, z));
    legs.push(at(box(14, 3, 14, 0.4), x, 1.5, z));
  }
  for (let i = 0; i < 4; i++) {
    const [a, b] = [corner[i], corner[(i + 1) % 4]];
    legs.push(strut([a[0], 14, a[1]], [b[0], 14, b[1]], 4, 4));
    legs.push(strut([a[0], 16, a[1]], [b[0], yOf(b[0], b[1]) - 14, b[1]], 2.6, 2.6));
  }
  K.x(group, bake(legs), FRAME);

  /* the gallows: columns (or one mast and its jib), a beam, the hoist, the release */
  const headTop = 17.2;
  const yRel = yC + drop + headTop; // the release's face
  const yBeam = yRel + 34;
  const xc = h / 2 + 46;
  const g = [];
  if (gallows === "mast") {
    g.push(at(box(16, yBeam + 8, 20, 1.5), -xc, (yBeam + 8) / 2, 0), at(box(50, 6, 50, 1), -xc, 3, 0));
    g.push(at(box(xc + 26, 16, 14, 1.5), -xc / 2 + 13, yBeam, 0), strut([-xc, yBeam - 70, 0], [-xc + 60, yBeam - 8, 0], 6, 8));
  } else {
    for (const s of [-1, 1]) g.push(at(box(12, yBeam + 8, 16, 1.5), s * xc, (yBeam + 8) / 2, 0), at(box(42, 6, 54, 1), s * xc, 3, 0), strut([s * xc, yBeam - 52, 0], [s * (xc - 42), yBeam - 8, 0], 5, 6));
    g.push(at(box(2 * xc + 12, 16, 14, 1.5), 0, yBeam, 0));
  }
  K.x(group, bake(g), FRAME);
  K.x(group, bake([
    at(box(20, 10, 22, 1), 0, yBeam - 13, 0),
    at(cyl(4, 16, 0.6, 32).rotateX(Math.PI / 2), 14, yBeam - 13, 0),
    at(box(11, 8, 11, 0.8), 0, yRel + 4, 0),
  ]), BODY);
  part(K, group, cyl(4.6, 1.4, 0.2, 40), { color: 0x3a4246, edge: 0.6, pos: [0, yRel + 0.7, 0] });
  const cable = fatLine([[0, yBeam - 18, 0], [0, yRel + 8, 0]], { color: BRAND.ink, width: 1.8, opacity: 0.45 });
  K.solid(cable.material);
  group.add(cable);
  if (axis) {
    const l = fatLine([[0, yRel - headTop - 2, 0], [0, yC + 0.5, 0]], { color: BRAND.ink, width: 1.8, opacity: 0.2, dashed: true, dashSize: 6, gapSize: 6 });
    K.solid(l.material);
    group.add(l);
  }
  if (ticks) {
    const t = [];
    for (let d = 0; d <= drop + 0.1; d += 25) {
      const big = d % 50 === 0;
      t.push(at(box(big ? 10 : 5, big ? 1.6 : 1.2, 1.6, 0.2), -xc + 6 + (big ? 5 : 2.5), yC + d, 9));
    }
    K.x(group, bake(t), { ...BODY, opacity: 0.9, edge: 0.6 });
  }

  /* the 10 kg head: a hemisphere of 16.5 cm (its rubber skin) on its steel body, its eye bolt — the threat */
  const headG = new THREE.Group();
  const R = 8.25;
  const hemi = [];
  for (let k = 0; k <= 14; k++) {
    const a = (k / 14) * (Math.PI / 2);
    hemi.push([R * Math.sin(a), R - R * Math.cos(a)]);
  }
  hemi[0] = [0, 0];
  const skin = threat(K, headG, lathe([...hemi, [R, R + 0.4], [0, R + 0.4]], 64, { crease: 30 }), { color: 0x1d2225, rough: 0.7, metal: 0, ink: 1.4, sig: 0.6 });
  const body = threat(K, headG, lathe([[0, R + 0.4], [R, R + 0.4], [R, 13], [7.4, 13.9], [3.2, 14.2], [3.2, 15], [0, 15]], 64, { bevel: 0.3 }), { color: 0x2c3337, rough: 0.28, metal: 0.5, edge: 0.55 });
  threat(K, headG, new THREE.TorusGeometry(1.7, 0.55, 12, 32), { color: 0x3a4246, rough: 0.3, metal: 0.5, pos: [0, 15.6 + 1.1, 0] });
  void skin;
  void body;
  group.add(headG);
  const A = { head: headG };

  let lampObj = null;
  if (lamp > 0) {
    const from = [26, yBeam - 12, 18];
    lampObj = makeLamp({ length: Math.hypot(26, yBeam - 12 - yC, 18), r0: 4, r1: 34, k: lamp });
    aim(lampObj.group, from, [0, yC, 0]);
    group.add(lampObj.group);
    K.x(group, box(12, 9, 12, 1), BODY, [from[0], from[1] + 5, from[2]]);
  }

  return {
    group, A,
    set({ amount = 1, drop: k = 0 } = {}) {
      const on = amount > 0.003;
      group.visible = on;
      if (!on) return;
      K.fade(amount);
      if (lampObj) lampObj.set(amount);
      const y = k <= 1 ? yC + drop * (1 - k * k) : yC - Math.min(0.2, k - 1) * 40;
      headG.position.set(0, y, 0);
    },
  };
}

/* ───────────────────────────────────────────────────────────── THE OPTICAL BENCH */

export function makeOpticBench({
  y = 100, board = "under", rest = y, w = 150, h = 92, sag = 0, cell = 8, line = 0.55, gridY = 26, scope = true,
} = {}) {
  const group = new THREE.Group();
  const K = kit();
  const yG = rest - sag * 0.6; // ≈ where a ray crosses the curved glass

  /* the four pins and their base frame */
  const pins = [];
  const px = h / 2 - 8;
  const pz = w / 2 - 16;
  for (const [x, z] of [[px, pz], [px, -pz], [-px, pz], [-px, -pz]]) {
    const y0 = board === "wall" ? 0 : gridY; // under: the pins stand on the light table's frame
    pins.push(at(cyl(2.2, rest - 4 - y0, 0.4, 24), x, (rest - 4 + y0) / 2, z), at(box(7, 2, 7, 0.4), x, rest - 1, z));
  }
  if (board === "wall") pins.push(strut([-px, 6, -pz], [px, 6, -pz], 4, 4), strut([-px, 6, pz], [px, 6, pz], 4, 4), strut([-px, 6, -pz], [-px, 6, pz], 4, 4), strut([px, 6, -pz], [px, 6, pz], 4, 4));
  K.x(group, bake(pins), BODY);

  /* the target board: a light table under the glass, or a board standing behind it */
  const bw = board === "wall" ? 300 : w + 30; // along z (under) · along x (wall)
  const bh = board === "wall" ? 190 : h + 40; // along x (under) · height (wall)
  const gridMat = K.fx(
    fxMat(
      /* glsl */ `uniform float uLook, uCell, uLine; uniform vec3 uColor, uGlass; uniform vec2 uGlassH; uniform float uWall;
      varying vec3 vGl;
      float gridAt(vec2 p) {
        vec2 fw = max(fwidth(p), vec2(1e-4));
        vec2 f = abs(fract(p / uCell - 0.5) - 0.5) * uCell;
        vec2 hw = max(vec2(uLine * 0.5), fw);
        vec2 l = 1.0 - smoothstep(hw - fw * 0.5, hw + fw * 0.5, f);
        float g = max(l.x, l.y);
        float dense = smoothstep(0.12, 0.3, max(fw.x, fw.y) / uCell);
        return mix(g, clamp(4.0 * hw.x / uCell, 0.0, 1.0), dense);
      }
      void main() {
        vec2 p = uWall > 0.5 ? vP.xy : vec2(vP.x, -vP.y);
        vec3 C = cameraPosition; vec3 P = vW;
        float mask = 0.0;
        float dy = P.y - C.y;
        if (abs(dy) > 1e-3) {
          float t = (vGl.y - C.y) / dy;
          if (t > 0.0 && t < 1.0) {
            vec3 H = C + (P - C) * t;
            vec2 d = abs(H.xz - vGl.xz) - uGlassH;
            mask = 1.0 - smoothstep(-4.0, 0.0, max(d.x, d.y));
          }
        }
        float on = clamp(uLook, 0.0, 1.0);
        float bend = clamp(uLook - 1.0, 0.0, 1.0) * (1.0 - clamp(uLook - 2.0, 0.0, 1.0));
        float dbl = clamp(uLook - 2.0, 0.0, 1.0);
        vec2 q = p + mask * bend * vec2(3.2 * sin(p.y * 0.085 + 0.6) * (0.6 + 0.4 * sin(p.x * 0.05)), 2.6 * sin(p.x * 0.075 + 1.3));
        float g = gridAt(q);
        float g2 = gridAt(p + vec2(2.8, 1.9)) * mask * dbl * 0.6;
        vec2 e = abs(vUv - 0.5) * 2.0;
        float frameFade = 1.0 - smoothstep(0.9, 1.0, max(e.x, e.y));
        vec3 c = uColor * (0.045 + 0.95 * max(g, g2)) * on * frameFade;
        gl_FragColor = vec4(c * uAmount, 1.0);
      }`,
      { uLook: { value: 0 }, uCell: { value: cell }, uLine: { value: line }, uColor: { value: INK.clone().multiplyScalar(1.15) }, uGlass: { value: new THREE.Vector3(0, yG, 0) }, uGlassH: { value: new THREE.Vector2(h / 2 - 5, (w + w) / 4 - 6) }, uWall: { value: board === "wall" ? 1 : 0 } },
    ),
  );
  gridMat.vertexShader = gridMat.vertexShader.replace("void main() {", "uniform vec3 uGlass; varying vec3 vGl;\n void main() { vGl = (modelMatrix * vec4(uGlass, 1.0)).xyz;");
  const gridGeo = new THREE.PlaneGeometry(board === "wall" ? bw : bh, board === "wall" ? bh : bw);
  const grid = new THREE.Mesh(gridGeo, gridMat);
  grid.renderOrder = 6;
  if (board === "wall") {
    grid.position.set(0, 10 + bh / 2, -w / 2 - 70);
    K.x(group, bake([at(box(bw + 10, bh + 10, 6, 1), 0, 10 + bh / 2, -w / 2 - 74), at(box(16, 10, 50, 1), -bw / 2 + 20, 5, -w / 2 - 74), at(box(16, 10, 50, 1), bw / 2 - 20, 5, -w / 2 - 74)]), BODY);
  } else {
    grid.rotation.x = -Math.PI / 2;
    grid.position.set(0, gridY + 0.25, 0);
    K.x(group, bake([at(box(bh + 8, 14, bw + 8, 1.5), 0, gridY - 7, 0), at(box(bh + 16, 4, bw + 16, 0.8), 0, gridY - 15, 0)]), BODY);
    K.x(group, bake([0, 1, 2, 3].map((i) => at(box(6, gridY - 17, 6, 0.6), (i % 2 ? 1 : -1) * (bh / 2 - 6), (gridY - 17) / 2, (i < 2 ? 1 : -1) * (bw / 2 - 6)))), FRAME);
  }
  group.add(grid);

  /* the observer: a column and its arm, a scope looking down through the glass */
  if (scope) {
    const xc = -h / 2 - 48;
    const zc = -w / 2 - 10;
    const yH = rest + 170;
    K.x(group, bake([at(box(12, yH + 14, 12, 1.2), xc, (yH + 14) / 2, zc), at(box(46, 6, 46, 1), xc, 3, zc), strut([xc, yH + 6, zc], [0, yH + 6, 0], 7, 7)]), FRAME);
    K.x(group, bake([at(cyl(6, 22, 0.8, 40), 0, yH - 8, 0), at(cyl(4.2, 6, 0.5, 40), 0, yH - 22, 0)]), BODY);
    const lens = K.fx(glow(BRAND.ink, 1.3, { additive: true, opacity: 0.7 }));
    const ringGeo = new THREE.RingGeometry(2.4, 3.6, 40).rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, lens);
    ring.position.set(0, yH - 25.2, 0);
    group.add(ring);
  }

  return {
    group,
    set({ amount = 1, look = 0 } = {}) {
      const on = amount > 0.003;
      group.visible = on;
      if (!on) return;
      K.fade(amount);
      gridMat.uniforms.uLook.value = Math.max(0, Math.min(3, look));
      grid.visible = look > 0.003;
    },
  };
}

/* ───────────────────────────────────────────────────────────── THE STRIKER (witness pane) */

export function makeStriker({ y = 100, size = 50, squareAt = [12, 10], spring = true } = {}) {
  const group = new THREE.Group();
  const K = kit();
  const top = y + 1.3; // the pane's top (it lies at y + 1)
  const T = size + 34;

  /* the table, the frame round the pane */
  K.x(group, bake([
    at(box(T, 4, T, 1), 0, y - 1.3, 0),
    ...[0, 1, 2, 3].map((i) => at(box(5, y - 3.3, 5, 0.6), (i % 2 ? 1 : -1) * (T / 2 - 6), (y - 3.3) / 2, (i < 2 ? 1 : -1) * (T / 2 - 6))),
    strut([-(T / 2 - 6), 12, -(T / 2 - 6)], [T / 2 - 6, 12, -(T / 2 - 6)], 3, 3),
    strut([-(T / 2 - 6), 12, T / 2 - 6], [T / 2 - 6, 12, T / 2 - 6], 3, 3),
  ]), FRAME);
  const s2 = size / 2 + 1.5;
  K.x(group, bake([
    at(box(size + 6, 2.4, 3, 0.4), 0, y + 1.9, s2), at(box(size + 6, 2.4, 3, 0.4), 0, y + 1.9, -s2),
    at(box(3, 2.4, size, 0.4), s2, y + 1.9, 0), at(box(3, 2.4, size, 0.4), -s2, y + 1.9, 0),
  ]), BODY);

  /* the C-arm from behind, its sleeve over the centre */
  const zb = -(size / 2 + 22);
  const yArm = y + 64;
  K.x(group, bake([at(box(8, yArm + 4, 10, 1), 0, (yArm + 4) / 2, zb), strut([0, yArm, zb], [0, yArm, 4], 7, 7), at(box(24, 4, 24, 0.6), 0, 2, zb)]), BODY);
  K.x(group, cyl(2.6, 24, 0.4, 32), BODY, [0, y + 52, 0]);
  if (spring) K.x(group, cyl(1.9, 9, 0.3, 24), FRAME, [0, yArm + 7, 0]);

  /* the punch: a steel body, its hardened point — the threat, small */
  const punch = new THREE.Group();
  threat(K, punch, lathe([[0, 0], [0.25, 0.05], [1.3, 3], [1.3, 42], [0, 42]], 48, { bevel: 0.1 }), { ink: 1.5, sig: 0.5, edge: 0.4 });
  group.add(punch);

  /* the counting square: 5 × 5 cm laid on the pane */
  const sqMat = K.fx(glow(BRAND.ink, 1.3, { additive: true, opacity: 1 }));
  const sq = new THREE.Mesh(bake([at(box(5.6, 0.2, 0.5, 0.05), 0, 0, 2.55), at(box(5.6, 0.2, 0.5, 0.05), 0, 0, -2.55), at(box(0.5, 0.2, 4.6, 0.05), 2.55, 0, 0), at(box(0.5, 0.2, 4.6, 0.05), -2.55, 0, 0)]), sqMat);
  sq.position.set(squareAt[0], top + 0.12, squareAt[1]);
  group.add(sq);

  return {
    group,
    set({ amount = 1, strike = 0, square = 0 } = {}) {
      const on = amount > 0.003;
      group.visible = on;
      if (!on) return;
      K.fade(amount);
      punch.position.set(0, top + 30 * (1 - clamp01(strike)), 0);
      sqMat.opacity = amount * clamp01(square);
      sq.visible = square * amount > 0.003;
    },
  };
}
