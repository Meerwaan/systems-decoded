// DOSSIER 040 — L'abri anti-feu : THE RIDGE, seen like an X-ray. The Butte Fire's crest (Idaho, 29/08/1985): the top
// scraped by the bulldozers, its pads spread along it, the 72 others and their shelters, the forest on the flanks, your
// shovel, the comment's two figures, the next file's spark. The image reconstitutes the place (a maquette: `sources`).
//
//   buildCrete() → { group, A, heightAt, update(p, time, px) }
//     group     added to the crest set by world.js
//     A.pad     where your shelter stands (the origin): world.js puts the system there
//     A.shovel  the burning point of your shovel's handle (it walks from the blade to the end with `char`)
//     A.duo     the comment's two figures (their group, on their pad)
//     heightAt  ridgeY (plan.js): the ground under any (x, z)
//
//   p = {
//     shell    0–1 the X-ray of the place: the ground's grid, the pads, the trees' glass, the crews' glass
//     crowd    0–1 the 72 other firefighters STANDING on their pads (glass silhouettes, their fire side lit faintly signal)
//     deploy   0 standing → 1 lying under their deployed shelters: each takes its turn (a seeded threshold), the folded
//              packet, the sheet held up over the body, then down flat — the figure kneels and lies under it
//     burn     0 the forest on the flanks (glass firs, snags) → 1 burnt: crowns gone, black trunks, embers in them and
//              in the grid of the flanks, which go on breathing slowly and die one by one; the pads never burn
//     shovel   0–1 your shovel on the ground beside your shelter
//     char     0 its handle whole → 1 consumed down to the steel, from the blade toward the end (« se consument »:
//              a ring of embers walks up the wood, black char ahead of it, nothing behind it; the blade stays)
//     duo      0–1 the comment's two figures side by side on their pad (DUO): one feet to the front, one head to it
//     debris   0 nothing · 0 → 1 a white spark crosses the black sky in one stroke, a long trail behind it
//   }
// Nothing here is allocated in `update` (it runs sixteen times a frame): uniforms and transforms only.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glow, glass, asShell, plate, edgesOf } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { ridgeY, RIDGE, CREW, SHELTER, SHOVEL, DUO, DEBRIS, PAD } from "./plan.js";
import { dressCrete } from "./habillage.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, u) => a + (b - a) * u;

/** Where the cameras of the poses stand (world.js VIEW: crest, back, zeroWide, sky, canyon), x z: no tree there — a
 *  solid trunk in front of the lens is a black bar. Re-check if a pose moves far (radius RCLEAR). */
const CLEAR = [[-5335, -3062], [-2358, -1037], [2200, 874], [2763, 6671], [1656, 1444], [-603, 731]];
const RCLEAR = 1800;

/** Each shelter's turn (deploy threshold), seeded: index 0 is yours (model.js). Same list for the dome and the figure. */
const TURN = (() => {
  const r = rng(1985);
  return CREW.map((_, i) => (i === 0 ? 0 : 0.03 + 0.72 * r()));
})();
const WINDOW = 0.22; // how much of `deploy` one crew member takes, packet to flat

/* ── shader pieces ── */
// one family of grid lines, ≈ 1.8 px wide, faded out before they come closer than ≈ 4 px (no moiré, no shimmer)
const LINES = /* glsl */ `
  float lines(float x, float cell) {
    float q = x / cell;
    float w = max(fwidth(q), 1e-5);
    float d = abs(fract(q - 0.5) - 0.5) / w;
    return (1.0 - smoothstep(0.55, 1.35, d)) * (1.0 - smoothstep(0.1, 0.26, w));
  }`;

export function buildCrete() {
  const group = new THREE.Group();
  group.name = "crete";
  const ink = new THREE.Color(BRAND.ink);
  const sig = new THREE.Color(BRAND.signal);

  /* ── THE GROUND: a depth mask that follows the ridge (the crest hides what is behind it: the front climbing the far
     side of the flank is cut out by it — and nothing is drawn: no solid floor) and, on it, the grid in a shader. ── */
  const xs = [];
  for (let x = -RIDGE.len / 2; x <= RIDGE.len / 2 + 1; x += 250) xs.push(x);
  const zs = [0];
  for (let z = 0; z > RIDGE.zMinus; ) zs.unshift((z -= 40 + Math.abs(z) * 0.06));
  for (let z = 0; z < RIDGE.zPlus; ) zs.push((z += 40 + Math.abs(z) * 0.06));
  const gpos = new Float32Array(xs.length * zs.length * 3);
  let k = 0;
  for (const z of zs) for (const x of xs) gpos.set([x, ridgeY(x, z), z], (k++) * 3);
  const gidx = [];
  for (let j = 0; j < zs.length - 1; j++)
    for (let i = 0; i < xs.length - 1; i++) {
      const a = j * xs.length + i;
      const b = a + xs.length;
      gidx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const ground = new THREE.BufferGeometry();
  ground.setAttribute("position", new THREE.BufferAttribute(gpos, 3));
  ground.setIndex(gidx);
  ground.computeBoundingSphere();
  const mask = new THREE.Mesh(ground, new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 }));
  mask.renderOrder = -10; // first: whatever lies behind the crest is hidden by it
  const gridMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uInk: { value: ink.clone() }, uShell: { value: 1 }, uBurn: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uShell, uBurn; varying vec3 vW;
      ${LINES}
      void main() {
        float az = abs(vW.z);
        float top = 1.0 - smoothstep(560.0, 820.0, az); // the scraped top
        // the top: a square grid, 1 m and 5 m — the bare earth the crews stand on
        float gTop = max(max(lines(vW.x, 100.0), lines(vW.z, 100.0)) * 0.42, max(lines(vW.x, 500.0), lines(vW.z, 500.0)));
        // the flanks: contour lines (4 m, 20 m) and the fall lines (8 m): the relief reads, the slope plunges
        float gFl = max(max(lines(vW.y, 400.0) * 0.6, lines(vW.y, 2000.0)), lines(vW.x, 800.0) * 0.5);
        // the lip of the scraped top, both sides: where the ground starts falling
        float e = abs(az - 600.0);
        float lip = (1.0 - smoothstep(0.6, 1.5, e / max(fwidth(az), 1e-4))) * (1.0 - smoothstep(0.5, 3.0, fwidth(az) / 40.0));
        float drop = max(0.0, -vW.y);
        float down = exp(-drop / 9000.0);
        float along = 1.0 - smoothstep(9500.0, 15500.0, abs(vW.x));
        float burnt = 1.0 - 0.62 * uBurn;
        float g = top * gTop * 0.17 + (1.0 - top) * gFl * 0.32 * down * burnt + lip * 0.3;
        gl_FragColor = vec4(uInk * g * along * uShell, 1.0);
      }`,
  });
  const gridMesh = new THREE.Mesh(ground, gridMat);
  gridMesh.renderOrder = 1;
  group.add(mask, gridMesh);

  /* ── THE PADS: 73 rectangles of bare earth, 4 × 5 m, scraped by the blade — its passes, the berm it left round ── */
  const padGeo = (() => {
    const NX = 8;
    const NZ = 10;
    const pos = [];
    const loc = [];
    const idx = [];
    let base = 0;
    for (const [cx, cz, yaw] of CREW) {
      const c = Math.cos(yaw * DEG);
      const s = Math.sin(yaw * DEG);
      for (let j = 0; j <= NZ; j++)
        for (let i = 0; i <= NX; i++) {
          const u = (i / NX - 0.5) * PAD.w;
          const v = (j / NZ - 0.5) * PAD.l;
          const x = cx + u * c + v * s;
          const z = cz - u * s + v * c;
          pos.push(x, ridgeY(x, z) + 1.2, z);
          loc.push(u, v);
        }
      for (let j = 0; j < NZ; j++)
        for (let i = 0; i < NX; i++) {
          const a = base + j * (NX + 1) + i;
          const b = a + NX + 1;
          idx.push(a, b, a + 1, a + 1, b, b + 1);
        }
      base += (NX + 1) * (NZ + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aL", new THREE.Float32BufferAttribute(loc, 2));
    g.setIndex(idx);
    return g;
  })();
  const padMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uInk: { value: ink.clone() }, uShell: { value: 1 }, uHalf: { value: new THREE.Vector2(PAD.w / 2, PAD.l / 2) } },
    vertexShader: /* glsl */ `
      attribute vec2 aL; varying vec2 vL;
      void main() { vL = aL; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uShell; uniform vec2 uHalf; varying vec2 vL;
      ${LINES}
      void main() {
        vec2 dd = uHalf - abs(vL);
        float border = min(dd.x, dd.y);
        float fw = max(fwidth(border), 1e-4);
        float rim = (1.0 - smoothstep(0.6, 1.6, abs(border - 6.0) / fw)) * (1.0 - smoothstep(0.5, 4.0, fw / 12.0));
        float berm = smoothstep(40.0, 0.0, border); // the windrow of pushed dirt round the edge
        // the blade's passes along the pad, uneven, slightly wavering
        float pass = lines(vL.x + 6.0 * sin(vL.y / 85.0 + vL.x * 0.01), 36.0) * (0.55 + 0.45 * sin(vL.x * 0.173 + 1.3));
        float g = 0.012 + 0.025 * berm + 0.06 * pass + 0.2 * rim;
        gl_FragColor = vec4(uInk * g * uShell, 1.0);
      }`,
  });
  const pads = new THREE.Mesh(padGeo, padMat);
  pads.renderOrder = 2;
  group.add(pads);

  /* ── THE FOREST on the flanks: 027's fir (four tiers of open cones, glass), a solid trunk in each; some snags.
     Clumps and clearings, never on the scraped top, never where a camera stands. ── */
  const rand = rng(4040);
  const clump = (x, z) =>
    0.55 * Math.sin(x / 3300 + 1.3) * Math.sin(z / 2900 - 0.4) + 0.35 * Math.sin((x + 1.7 * z) / 2100 + 2.1) + 0.25 * Math.sin((x - z) / 5200);
  const TREES = [];
  const CELL = 900;
  for (let z = -15500; z <= 10000; z += CELL)
    for (let x = -15000; x <= 15000; x += CELL) {
      const xx = x + rand() * CELL;
      const zz = z + rand() * CELL;
      const keep = rand();
      const kind = rand();
      const hk = rand();
      const spin = rand();
      if (zz > -1300 && zz < 2100) continue; // the scraped top and its lips, and the near +z slope (the cameras' side)
      if (CLEAR.some(([cx, cz]) => Math.hypot(xx - cx, zz - cz) < RCLEAR)) continue;
      if (clump(xx, zz) + 0.12 < 0 || keep > 0.5) continue;
      const h = 900 + hk * 750;
      TREES.push({ x: xx, y: ridgeY(xx, zz) - 40, z: zz, h, snag: kind < 0.18, k: spin });
    }
  const bare = (g) => {
    const n = g.index ? g.toNonIndexed() : g;
    const o = new THREE.BufferGeometry();
    o.setAttribute("position", n.getAttribute("position"));
    o.setAttribute("normal", n.getAttribute("normal"));
    return o;
  };
  const crowns = [];
  const trunks = [];
  for (const { x, y, z, h, snag, k: spin } of TREES) {
    const r = h * (0.17 + 0.04 * spin);
    const th = snag ? h * (0.6 + 0.3 * spin) : h * 0.85;
    trunks.push(bare(new THREE.CylinderGeometry(snag ? 9 : 7, snag ? 20 : 24, th, 6).translate(x, y + th / 2, z)));
    if (snag) {
      // a snag: a bare trunk and a few broken stubs of branches
      for (let b = 0; b < 3; b++) {
        const at = th * (0.45 + 0.17 * b);
        const len = 90 + 60 * ((spin * 7 + b) % 1);
        const stub = new THREE.CylinderGeometry(2.5, 5, len, 5).translate(0, len / 2, 0).rotateZ((60 + 25 * b) * DEG * (b % 2 ? 1 : -1)).rotateY((spin * 360 + 120 * b) * DEG).translate(x, y + at, z);
        trunks.push(bare(stub));
      }
      continue;
    }
    const tiers = [[0.1, 0.42, 1], [0.3, 0.36, 0.8], [0.5, 0.3, 0.6], [0.68, 0.32, 0.4]];
    for (const [at, len, w] of tiers)
      crowns.push(bare(new THREE.ConeGeometry(r * w, h * len, 9, 1, true).rotateY(spin * 6.28).translate(x, y + h * at + (h * len) / 2, z)));
  }
  const firMat = glass(BRAND.ink, { base: 0.005, rim: 0.46, power: 2.2, edge: 0.42, through: 0 });
  const forest = new THREE.Mesh(mergeGeometries(crowns), firMat);
  forest.frustumCulled = false;
  asShell([forest], 22);
  const trunkMat = solid(0x5d554b, { rough: 0.92, metal: 0, env: 0.4 });
  trunkMat.userData.finish = false;
  const trunkMesh = new THREE.Mesh(mergeGeometries(trunks), trunkMat);
  trunkMesh.frustumCulled = false;
  group.add(trunkMesh, forest);
  const trunkGreen = new THREE.Color(0x5d554b);
  const trunkBurnt = new THREE.Color(0x0f0d0c);

  /* ── THE EMBERS: on the flanks' ground and in the trunks. Points of a size bounded in pixels (never a sub-pixel
     dot that flickers), breathing slowly; each lights up as `burn` passes its threshold, then fades, one by one. ── */
  const emberPts = [];
  const er = rng(29081985);
  for (let i = 0; i < 1700; i++) {
    const x = (er() - 0.5) * 26000;
    const z = er() < 0.72 ? -800 - Math.pow(er(), 1.3) * 12500 : 800 + Math.pow(er(), 1.5) * 6500;
    emberPts.push([x, ridgeY(x, z) + 6, z, 3 + 5 * er(), er(), er(), er()]);
  }
  for (const t of TREES) {
    const n = t.snag ? 3 : 1 + Math.floor(er() * 2);
    for (let j = 0; j < n; j++) emberPts.push([t.x + (er() - 0.5) * 30, t.y + 60 + er() * t.h * 0.55, t.z + (er() - 0.5) * 30, 4 + 5 * er(), er(), er(), er()]);
  }
  const eGeo = new THREE.BufferGeometry();
  eGeo.setAttribute("position", new THREE.Float32BufferAttribute(emberPts.flatMap((e) => e.slice(0, 3)), 3));
  eGeo.setAttribute("aSz", new THREE.Float32BufferAttribute(emberPts.map((e) => e[3]), 1));
  eGeo.setAttribute("aT", new THREE.Float32BufferAttribute(emberPts.map((e) => 0.04 + 0.9 * e[4]), 1));
  eGeo.setAttribute("aPh", new THREE.Float32BufferAttribute(emberPts.map((e) => e[5] * 6.283), 1));
  eGeo.setAttribute("aF", new THREE.Float32BufferAttribute(emberPts.map((e) => 0.8 + 1.3 * e[6]), 1));
  const emberMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uSig: { value: sig.clone() }, uBurn: { value: 0 }, uTime: { value: 0 }, uPx: { value: 1000 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uBurn, uTime, uPx, uAmount;
      attribute float aSz, aT, aPh, aF; varying float vI;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float depth = max(1.0, -mv.z);
        float life = smoothstep(aT, aT + 0.05, uBurn) * (0.25 + 0.75 * exp(-max(0.0, uBurn - aT) * 2.4));
        float breath = 0.62 + 0.38 * sin(uTime * aF + aPh);
        float sz = aSz * uPx / depth;
        float ps = clamp(sz, 2.6, 40.0);
        vI = uAmount * life * breath * clamp(sz * sz / (ps * ps), 0.32, 1.0);
        gl_PointSize = vI < 0.004 ? 0.0 : ps;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSig; varying float vI;
      void main() {
        vec2 c = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(c, c);
        if (r2 > 1.0) discard;
        float a = exp(-r2 * 3.2);
        gl_FragColor = vec4(uSig * (0.7 + 1.5 * a) * a * vI, 1.0);
      }`,
  });
  const embers = new THREE.Points(eGeo, emberMat);
  embers.frustumCulled = false;
  embers.renderOrder = 24;
  group.add(embers);

  /* ── THE 72 OTHER SHELTERS: the same system, solid — a crinkled tunnel of foil and its flat hem, instanced; the
     tone of model.js's outer foil, a faint light of its own so it reads silver even away from the fire. ── */
  const domeGeo = (() => {
    const g = new THREE.SphereGeometry(1, 56, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i);
      let y = p.getY(i);
      let z = p.getZ(i);
      x = Math.sign(x) * Math.pow(Math.abs(x), 0.78);
      z = Math.sign(z) * Math.pow(Math.abs(z), 0.5); // a tunnel with rounded ends, not an egg
      y = Math.pow(Math.max(0, y), 0.82);
      let X = (x * SHELTER.w) / 2;
      let Y = y * SHELTER.h;
      let Z = (z * SHELTER.len) / 2;
      // the crinkle: folds across the tunnel and a few along it, a centimetre or two
      const f = 1.3 * Math.sin(Z * 0.21 + 1.1 * Math.sin(X * 0.09)) + 0.8 * Math.sin(Z * 0.53 + X * 0.31 + 2.0) + 0.5 * Math.sin(X * 0.7 - Z * 0.12);
      const up = Math.min(1, Y / 6);
      Y += f * 0.9 * up;
      X += f * 0.35 * Math.sign(X) * up;
      p.setXYZ(i, X, Y, Z);
    }
    g.computeVertexNormals();
    const hem = new THREE.RingGeometry(1, 1.09, 56, 1).rotateX(-Math.PI / 2);
    const hp = hem.attributes.position;
    for (let i = 0; i < hp.count; i++) {
      const x = hp.getX(i);
      const z = hp.getZ(i);
      const r = Math.hypot(x, z);
      const ang = Math.atan2(z, x);
      const ex = Math.sign(Math.cos(ang)) * Math.pow(Math.abs(Math.cos(ang)), 0.78);
      const ez = Math.sign(Math.sin(ang)) * Math.pow(Math.abs(Math.sin(ang)), 0.5);
      hp.setXYZ(i, (ex * r * SHELTER.w) / 2 + Math.sign(ex) * (r - 1) * 80, 0.6, (ez * r * SHELTER.len) / 2 + Math.sign(ez) * (r - 1) * 60);
    }
    hem.computeVertexNormals();
    return mergeGeometries([g, hem]);
  })();
  const domeMat = solid(0xc9cdd2, { rough: 0.32, metal: 0.5 });
  domeMat.userData.finish = false;
  domeMat.emissive = new THREE.Color(0x26282c);
  const N = CREW.length - 1;
  const domes = new THREE.InstancedMesh(domeGeo, domeMat, N);
  domes.frustumCulled = false;
  group.add(domes);

  /* ── THE 72 FIREFIGHTERS standing on their pads: one simple silhouette (legs, trunk, arms, head, helmet, line pack)
     copied 72 times into ONE geometry; a glass of its own (the kit's formula) that kneels and lies down in the vertex
     shader on the same turn as its shelter — and whose side facing the fire (−z) takes its light, faintly. ── */
  const crowdGeo = (() => {
    const parts = [
      new THREE.CapsuleGeometry(7, 70, 3, 8).translate(9, 44, 0),
      new THREE.CapsuleGeometry(7, 70, 3, 8).translate(-9, 44, 0),
      new THREE.LatheGeometry([[0.1, 84], [13, 86], [14, 104], [17, 128], [18.5, 140], [9, 151], [5, 156], [0.1, 157]].map(([r, y]) => new THREE.Vector2(r, y)), 12).scale(1, 1, 0.66),
      new THREE.CapsuleGeometry(5, 50, 3, 8).translate(0, -27, 0).rotateZ(8 * DEG).translate(-21, 142, 2),
      new THREE.CapsuleGeometry(5, 50, 3, 8).translate(0, -27, 0).rotateZ(-8 * DEG).translate(21, 142, 2),
      new THREE.SphereGeometry(10.5, 14, 10).translate(0, 167, 1),
      new THREE.SphereGeometry(12.6, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.8, 1.05).translate(0, 170, 1), // the helmet
      new THREE.CylinderGeometry(16, 16, 1.4, 16).translate(0, 170, 1), // its brim
      new THREE.BoxGeometry(30, 38, 15).translate(0, 120, -19), // the line pack, the shelter folded in it
    ].map(bare);
    const one = mergeGeometries(parts);
    const P = one.attributes.position;
    const Nn = one.attributes.normal;
    const n = P.count;
    const pos = new Float32Array(n * N * 3);
    const nor = new Float32Array(n * N * 3);
    const bas = new Float32Array(n * N * 3);
    const yaw = new Float32Array(n * N);
    const turn = new Float32Array(n * N);
    for (let i = 1; i <= N; i++) {
      const [x, z, yw] = CREW[i];
      const y = ridgeY(x, z);
      const o = (i - 1) * n;
      pos.set(P.array, o * 3);
      nor.set(Nn.array, o * 3);
      for (let v = 0; v < n; v++) {
        bas[(o + v) * 3] = x;
        bas[(o + v) * 3 + 1] = y;
        bas[(o + v) * 3 + 2] = z;
        yaw[o + v] = yw * DEG;
        turn[o + v] = TURN[i];
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    g.setAttribute("aBase", new THREE.BufferAttribute(bas, 3));
    g.setAttribute("aYaw", new THREE.BufferAttribute(yaw, 1));
    g.setAttribute("aT", new THREE.BufferAttribute(turn, 1));
    return g;
  })();
  const crowdMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: ink.clone() }, uSig: { value: sig.clone() }, uAmount: { value: 1 }, uGain: { value: 1 },
      uBase: { value: 0.05 }, uRim: { value: 0.75 }, uPower: { value: 2.0 }, uEdge: { value: 0.45 }, uFire: { value: 0.7 },
      uDeploy: { value: 0 }, uCrowd: { value: 0 }, uWin: { value: WINDOW },
    },
    vertexShader: /* glsl */ `
      uniform float uDeploy, uCrowd, uWin;
      attribute vec3 aBase; attribute float aYaw, aT;
      varying vec3 vN; varying vec3 vV; varying float vFire; varying float vOn;
      void main() {
        float own = clamp((uDeploy - aT) / uWin, 0.0, 1.0);
        float fall = smoothstep(0.38, 0.95, own);
        vec3 p = position; vec3 n = normal;
        p.y *= 1.0 - 0.3 * smoothstep(0.15, 0.5, own); // the knees give first
        float a = fall * 1.5707963; // then face down, head toward +z
        float c = cos(a), s = sin(a);
        p = vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
        n = vec3(n.x, n.y * c - n.z * s, n.y * s + n.z * c);
        p.y += fall * 14.0;
        float cy = cos(aYaw), sy = sin(aYaw);
        p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
        n = vec3(n.x * cy + n.z * sy, n.y, -n.x * sy + n.z * cy);
        vOn = uCrowd * (1.0 - smoothstep(0.8, 0.97, own));
        vFire = max(0.0, -n.z) * (0.5 + 0.5 * max(0.0, n.y + 0.4));
        vec4 mv = modelViewMatrix * vec4(aBase + p, 1.0);
        vN = normalize(normalMatrix * n);
        vV = normalize(-mv.xyz);
        gl_Position = vOn < 0.003 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uSig; uniform float uAmount, uGain, uBase, uRim, uPower, uEdge, uFire;
      varying vec3 vN; varying vec3 vV; varying float vFire; varying float vOn;
      void main() {
        if (uAmount * vOn < 0.003) discard;
        float facing = dot(normalize(vN), normalize(vV));
        float g = clamp(1.0 - abs(facing), 0.0, 1.0);
        float light = uBase + uRim * pow(g, uPower) + uEdge * smoothstep(0.6, 0.97, g);
        vec3 col = uColor * light + uSig * vFire * uFire * (0.3 + 0.7 * g);
        gl_FragColor = vec4(col * uAmount * uGain * vOn, 1.0);
      }`,
  });
  const crowd = new THREE.Mesh(crowdGeo, crowdMat);
  crowd.frustumCulled = false;
  asShell([crowd], 21);
  group.add(crowd);

  /* ── YOUR SHOVEL, on the scraped ground beside your shelter: a round-point blade of steel, its socket, a wooden
     handle. `char` walks a ring of embers up the handle from the socket: behind it nothing, ahead of it black char. ── */
  const shovel = new THREE.Group();
  shovel.name = "pelle";
  const steel = solid(0x6c7277, { rough: 0.42, metal: 0.5 });
  const BL = SHOVEL.blade[1];
  const BW = SHOVEL.blade[0] / 2;
  const outline = [[-BW, 0], [BW, 0], [BW, -0.22 * BL], [BW * 0.92, -0.57 * BL], [BW * 0.64, -0.82 * BL], [BW * 0.32, -0.95 * BL], [0, -BL], [-BW * 0.32, -0.95 * BL], [-BW * 0.64, -0.82 * BL], [-BW * 0.92, -0.57 * BL], [-BW, -0.22 * BL]];
  const bladeGeo = plate(outline, 0.6, { bevel: 0.2 }).rotateX(Math.PI / 2).translate(0, 0.6, 0);
  const blade = new THREE.Mesh(bladeGeo, steel);
  blade.add(edgesOf(bladeGeo, { opacity: 0.55, width: 1.8 }));
  const socket = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.6, 18, 16).rotateX(Math.PI / 2).translate(0, 2.6, 6), steel);
  const tongue = new THREE.Mesh(new THREE.BoxGeometry(5, 0.8, 12).translate(0, 1.0, -4), steel);
  shovel.add(blade, socket, tongue);
  const H0 = 14; // where the wood comes out of the socket
  const H1 = H0 + SHOVEL.handle;
  const unit = (r) => new THREE.CylinderGeometry(r, r, 1, 14, 1).rotateX(Math.PI / 2).translate(0, 0, 0.5);
  const woodMat = solid(0x8c8478, { rough: 0.78, metal: 0 });
  const charMat = solid(0x161311, { rough: 0.95, metal: 0 });
  woodMat.userData.finish = false;
  charMat.userData.finish = false;
  const wood = new THREE.Mesh(unit(1.9), woodMat);
  const charred = new THREE.Mesh(unit(1.93), charMat);
  const ring = new THREE.Mesh(unit(2.05), glow(BRAND.signal, 2.2));
  for (const m of [wood, charred, ring]) m.position.y = 2.6;
  shovel.add(wood, charred, ring);
  // the embers round the burning ring: a few points that breathe (the same shader as the flanks')
  const sPts = [];
  const sr = rng(120);
  for (let i = 0; i < 18; i++) {
    const a = sr() * 6.283;
    sPts.push(Math.cos(a) * 2.4, 2.6 + Math.sin(a) * 2.4, (sr() - 0.5) * 7);
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute("position", new THREE.Float32BufferAttribute(sPts, 3));
  sGeo.setAttribute("aSz", new THREE.Float32BufferAttribute(Array.from({ length: 18 }, () => 0.5 + sr() * 0.6), 1));
  sGeo.setAttribute("aT", new THREE.Float32BufferAttribute(Array.from({ length: 18 }, () => 0), 1));
  sGeo.setAttribute("aPh", new THREE.Float32BufferAttribute(Array.from({ length: 18 }, () => sr() * 6.283), 1));
  sGeo.setAttribute("aF", new THREE.Float32BufferAttribute(Array.from({ length: 18 }, () => 1.5 + sr() * 2), 1));
  const sMat = emberMat.clone();
  sMat.uniforms = { ...THREE.UniformsUtils.clone(emberMat.uniforms) };
  const sEmbers = new THREE.Points(sGeo, sMat);
  sEmbers.frustumCulled = false;
  sEmbers.renderOrder = 25;
  shovel.add(sEmbers);
  const burnPoint = new THREE.Object3D();
  burnPoint.position.y = 2.6;
  shovel.add(burnPoint);
  shovel.position.set(SHOVEL.at[0], ridgeY(SHOVEL.at[0], SHOVEL.at[2]) + SHOVEL.at[1] - 1.5, SHOVEL.at[2]);
  shovel.rotation.y = SHOVEL.yaw * DEG;
  group.add(shovel);

  /* ── THE DUO (the comment): two glass firefighters lying face down side by side on their pad — the first with his
     feet to the front (−z), the second with his head to it. Same glass, same light: nothing says which is right. ── */
  const duo = new THREE.Group();
  duo.name = "duo";
  const duoFigs = [];
  for (const [dx, turnY] of [[-DUO.gap / 2, 0], [DUO.gap / 2, Math.PI]]) {
    const holder = new THREE.Group();
    holder.position.x = dx;
    holder.rotation.y = turnY;
    const f = makeFigure({ hands: "flat", shell: true, glassK: 0.9 });
    // prone: elbows out, hands by the head (holding the hem down), legs straight
    f.reach("L", new THREE.Vector3(22, 158, 22));
    f.reach("R", new THREE.Vector3(-22, 158, 22));
    f.group.rotation.x = Math.PI / 2;
    f.group.position.set(0, 12, -88);
    holder.add(f.group);
    duo.add(holder);
    duoFigs.push(f);
  }
  duo.position.set(DUO.at[0], ridgeY(DUO.at[0], DUO.at[2]) + DUO.at[1], DUO.at[2]);
  group.add(duo);
  const nearDuo = []; // the crews' domes on the duo's own pad: hidden while it is shown
  for (let i = 1; i <= N; i++) if (Math.hypot(CREW[i][0] - DUO.at[0], CREW[i][1] - DUO.at[2]) < 320) nearDuo.push(i);

  /* ── THE DEBRIS: a white spark crossing the black sky in one stroke — a ribbon computed in the shader (its width in
     pixels, a long trail fading behind the head) and a soft head. ── */
  const DF = new THREE.Vector3(...DEBRIS.from);
  const DT = new THREE.Vector3(...DEBRIS.to);
  const PATH = /* glsl */ `
    uniform vec3 uFrom, uTo;
    vec3 path(float s) { return mix(uFrom, uTo, s) + vec3(0.0, 700.0 * sin(3.14159 * s), 0.0); }`;
  const ribbon = (() => {
    const S = 160;
    const pos = [];
    const idx = [];
    for (let i = 0; i <= S; i++) pos.push(i / S, -1, 0, i / S, 1, 0);
    for (let i = 0; i < S; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 2, 2 * i + 1, 2 * i + 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    return g;
  })();
  const debrisU = { uFrom: { value: DF }, uTo: { value: DT }, uHead: { value: 0 }, uLen: { value: 0.42 }, uRes: { value: new THREE.Vector2(BRAND.W, BRAND.H) }, uK: { value: 0 } };
  const trailMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: debrisU,
    vertexShader: /* glsl */ `
      ${PATH}
      uniform float uHead, uLen; uniform vec2 uRes; varying float vSide; varying float vT;
      void main() {
        float s = position.x;
        vec4 a = projectionMatrix * viewMatrix * vec4(path(s), 1.0);
        vec4 b = projectionMatrix * viewMatrix * vec4(path(s + 0.004), 1.0);
        vec2 sa = a.xy / max(a.w, 1e-3) * uRes;
        vec2 sb = b.xy / max(b.w, 1e-3) * uRes;
        vec2 dir = sb - sa;
        dir = dir / max(length(dir), 1e-4);
        vec2 nrm = vec2(-dir.y, dir.x);
        float behind = uHead - s;
        vT = behind < 0.0 ? 0.0 : exp(-behind / uLen * 3.0);
        float wpx = mix(3.0, 12.0, vT);
        vSide = position.y;
        a.xy += nrm * position.y * wpx / uRes * a.w;
        gl_Position = a;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uK; varying float vSide; varying float vT;
      void main() {
        if (vT < 0.002) discard;
        float across = exp(-vSide * vSide * 3.5);
        gl_FragColor = vec4(vec3(1.0, 0.97, 0.92) * across * vT * uK * 2.8, 1.0);
      }`,
  });
  const trail = new THREE.Mesh(ribbon, trailMat);
  trail.frustumCulled = false;
  trail.renderOrder = 30;
  const headGeo = new THREE.BufferGeometry();
  headGeo.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
  const headMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: debrisU,
    vertexShader: /* glsl */ `
      ${PATH}
      uniform float uHead, uK;
      void main() {
        gl_Position = projectionMatrix * viewMatrix * vec4(path(min(uHead, 1.0)), 1.0);
        gl_PointSize = uHead > 1.0 ? 0.0 : 30.0;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uK;
      void main() {
        vec2 c = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(c, c);
        if (r2 > 1.0) discard;
        float a = exp(-r2 * 7.0) + 0.6 * exp(-r2 * 40.0);
        gl_FragColor = vec4(vec3(1.0, 0.97, 0.92) * a * uK * 1.6, 1.0);
      }`,
  });
  const head = new THREE.Points(headGeo, headMat);
  head.frustumCulled = false;
  head.renderOrder = 31;
  const debris = new THREE.Group();
  debris.add(trail, head);
  group.add(debris);

  const pad = new THREE.Object3D();
  group.add(pad);
  const dress = dressCrete(); group.add(dress.group); // the decorator's touches (habillage.js)
  const A = { pad, shovel: burnPoint, duo };

  // reused in update
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const sc = new THREE.Vector3();
  const BASEY = CREW.map(([x, z]) => ridgeY(x, z));

  return {
    group, A, heightAt: ridgeY,
    update(p, time, px = 1000) {
      const shell = p.shell ?? 1;
      const burn = p.burn ?? 0;
      gridMat.uniforms.uShell.value = shell;
      gridMat.uniforms.uBurn.value = burn;
      padMat.uniforms.uShell.value = shell;
      firMat.uniforms.uAmount.value = shell * (1 - 0.88 * burn);
      trunkMat.color.lerpColors(trunkGreen, trunkBurnt, smooth(0.1, 0.8, burn));
      emberMat.uniforms.uBurn.value = burn;
      emberMat.uniforms.uTime.value = time;
      emberMat.uniforms.uPx.value = px;
      emberMat.uniforms.uAmount.value = 0.3 + 0.7 * shell;
      embers.visible = burn > 0.03;

      // the 72 shelters, each its turn; the standing crews in the shader, on the same turn
      const dep = p.deploy ?? 0;
      const showDuo = (p.duo ?? 0) > 0.01;
      domeMat.emissive.setRGB(0.15 * (0.4 + 0.6 * shell), 0.157 * (0.4 + 0.6 * shell), 0.172 * (0.4 + 0.6 * shell));
      for (let i = 1; i <= N; i++) {
        const [x, z, yaw] = CREW[i];
        let own = clamp01((dep - TURN[i]) / WINDOW);
        if (showDuo && nearDuo.includes(i)) own = 0;
        const s1 = smooth(0, 0.45, own);
        const s2 = smooth(0.45, 1, own);
        const sx = mix(mix(0.3, 1.05, s1), 1, s2);
        const sy = mix(mix(0.35, 2.1, s1), 1, s2);
        const sz = mix(mix(0.2, 0.62, s1), 1, s2);
        const wob = Math.sin(time * 4.1 + i * 1.7) * 0.16 * s1 * (1 - s2);
        q.setFromEuler(e.set(wob * 0.6, yaw * DEG + wob, 0));
        const on = own > 0.001 ? 1 : 0.0001;
        domes.setMatrixAt(i - 1, m4.compose(v.set(x, BASEY[i], z), q, sc.set(sx * on, sy * on, sz * on)));
      }
      domes.instanceMatrix.needsUpdate = true;
      crowdMat.uniforms.uDeploy.value = dep;
      crowdMat.uniforms.uCrowd.value = p.crowd ?? 0;
      crowdMat.uniforms.uAmount.value = shell;
      crowd.visible = (p.crowd ?? 0) > 0.003;

      // your shovel: the burning ring walks from the socket to the end of the handle
      shovel.visible = (p.shovel ?? 0) > 0.01;
      if (shovel.visible) {
        const c = clamp01(p.char ?? 0);
        const F = H0 + c * (H1 - H0); // the burning point
        const charLen = Math.min(H1 - F, 16 * smooth(0, 0.06, c));
        const live = smooth(0, 0.02, c) * (1 - smooth(0.96, 1, c));
        ring.visible = live > 0.01;
        ring.position.z = F - 1.2;
        ring.scale.z = 2.6;
        setGlowK(ring.material, 2.2 * live * (0.8 + 0.2 * Math.sin(time * 2.1)));
        charred.visible = charLen > 0.05;
        charred.position.z = F;
        charred.scale.z = Math.max(0.01, charLen);
        const woodFrom = F + charLen;
        wood.visible = H1 - woodFrom > 0.05;
        wood.position.z = woodFrom;
        wood.scale.z = Math.max(0.01, H1 - woodFrom);
        burnPoint.position.z = F;
        sEmbers.position.z = F;
        sEmbers.visible = live > 0.01;
        sMat.uniforms.uBurn.value = 0.05 * live;
        sMat.uniforms.uTime.value = time;
        sMat.uniforms.uPx.value = px;
      }

      // the duo
      const dk = p.duo ?? 0;
      duo.visible = dk > 0.01;
      for (const f of duoFigs) f.body.uniforms.uAmount.value = 0.9 * smooth(0, 1, dk) * (0.5 + 0.5 * shell);

      // the debris: one stroke, the head goes on past the end so the trail leaves too
      const d = p.debris ?? 0;
      debris.visible = d > 0.001 && d < 0.999;
      debrisU.uHead.value = d * (1 + debrisU.uLen.value * 1.1);
      debrisU.uK.value = smooth(0, 0.04, d);
      dress.update(p, time, px);
    },
  };
}

/** Re-light a glow material without allocating (build3d's setGlow, with the hue it was made with). */
function setGlowK(mat, k) {
  mat.color.copy(mat.userData.hue).multiplyScalar(k);
}
