// DOSSIER 040 — the dressing of the crest (crete.js), X-ray. The decorator's recipe: docs/recette-decorateur.md ·
// journal: docs/journal/040-habillage.md.
//
//   dressCrete() → { group, update(p, time, px) }   — hung in crete.js's group (gone with the crest on the bench);
//                                                     `p` is crete's own: `shell`, `burn`
//
// The Butte Fire's safety zone was a ridge top cut by bulldozers in the hours before the front came up; when it had
// passed, the flanks went on smoking. What makes the place a place, and nothing more:
//   1. THE DOZER LINE: two passes of a bulldozer along the crest, their track plates printed in the scraped earth —
//      the lines that run down the crest to its vanishing point in the wide shots (crest, back), « they cut this ».
//   2. TWO SNAGS SMOKING on the +z flank, in `back`: dead trunks a fire has gone through (`burn`), a thin wisp
//      leaning with the wind — after the front, the place still breathes smoke.
//   3. A LINE PACK thrown off on the edge of crew 39's pad (between the two domes of zeroWide's foreground): you drop
//      the pack, you keep the shelter — the only thing at a person's scale that is not a person.
// Nothing within 9 m of your shelter, nothing on your −x side within 28 m, nothing in the hook's view (it looks from
// your head end toward −z), nothing on the duo's pad. Nothing flickers: the smoke rises and sways slowly.
// Tried and taken out (journal): coals on the scraped top (invisible at any pose's distance), two wisps down the −z
// slope for `standing` (seen from the crest, a pale beam across the standing figure).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { glass, asShell, box, solid, edgesOf, mergeGeometries } from "@kit/build3d.js";
import { ridgeY, DUO } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export function dressCrete() {
  const group = new THREE.Group();
  group.name = "habillage";
  const ink = new THREE.Color(BRAND.ink);

  /* ── 1. THE DOZER LINE: two passes, each two tracks 56 cm wide, 2 m apart, wandering a little along the crest. ──
     A ribbon on the ground (6 cm up, over the depth mask), drawn in its shader: the two edges of each track and its
     grouser bars every 30 cm, which melt into an even band before they come closer than a few pixels (no moiré). */
  const TW = 28; // half a track's width
  const passes = [
    { zc: -320, k: 1, ph: 0.7 },
    { zc: 360, k: 0.7, ph: 2.9 },
  ];
  const tpos = [];
  const tuv = [];
  const tf = [];
  const tidx = [];
  for (const { zc, k, ph } of passes)
    for (const off of [-100, 100]) {
      const base = tpos.length / 3;
      let n = 0;
      for (let x = -13000; x <= 13000; x += 50, n++) {
        const z = zc + off + 90 * Math.sin(x / 2900 + ph) + 35 * Math.sin(x / 1150 + 2 * ph);
        const fade =
          k *
          (x < 0 ? smooth(1600, 2800, -x) : smooth(900, 1800, Math.hypot(x, z))) * // nothing near your shelter nor on your −x side
          smooth(500, 800, Math.hypot(x - DUO.at[0], z - DUO.at[2])) * // nor on the duo's pad
          (1 - smooth(9500, 14000, Math.abs(x)));
        for (const v of [-TW, TW]) {
          tpos.push(x, ridgeY(x, z + v) + 6, z + v);
          tuv.push(x, v);
          tf.push(fade);
        }
        if (n > 0) {
          const a = base + (n - 1) * 2;
          tidx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      }
    }
  const tGeo = new THREE.BufferGeometry();
  tGeo.setAttribute("position", new THREE.Float32BufferAttribute(tpos, 3));
  tGeo.setAttribute("aUV", new THREE.Float32BufferAttribute(tuv, 2));
  tGeo.setAttribute("aF", new THREE.Float32BufferAttribute(tf, 1));
  tGeo.setIndex(tidx);
  const trackMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -4,
    uniforms: { uInk: { value: ink.clone() }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec2 aUV; attribute float aF; varying vec2 vUV; varying float vF;
      void main() { vUV = aUV; vF = aF; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uAmount; varying vec2 vUV; varying float vF;
      void main() {
        if (vF < 0.002) discard;
        float v = vUV.y;
        float fv = max(fwidth(v), 1e-4);
        float wide = smoothstep(3.0, 10.0, ${(2 * TW).toFixed(1)} / fv); // the track's width in pixels: far, a band
        float edge = 1.0 - smoothstep(0.6, 1.5, (${TW.toFixed(1)} - abs(v)) / fv);
        float q = vUV.x / 30.0;
        float w = max(fwidth(q), 1e-5);
        float d0 = abs(fract(q + 0.5) - 0.5);
        float bars = mix(1.0 - smoothstep(0.15 - w, 0.15 + w, d0), 0.3, smoothstep(0.15, 0.4, w));
        float g = mix(0.05, 0.2 * edge + 0.16 * bars + 0.015, wide);
        gl_FragColor = vec4(uInk * g * vF * uAmount, 1.0);
      }`,
  });
  const tracks = new THREE.Mesh(tGeo, trackMat);
  tracks.frustumCulled = false;
  tracks.renderOrder = 3;
  group.add(tracks);

  /* ── 2. SNAGS on the +z flank: a dead trunk (the forest's own wood, black once burnt) and a thin wisp of smoke
     leaning with the wind. Placed where `back` looks (projected on the VIEW pose): between the crest and the passed
     front, left and right of your dome, never over it; behind every other camera (crete.js CLEAR, checked by hand). ── */
  const SNAGS = [
    { x: 2100, z: 2300, h: 1000, lean: 4, t: 0.5, s: 0.13, H: 1100 },
    { x: 800, z: 2500, h: 900, lean: -5, t: 0.55, s: 0.61, H: 1100 },
  ].map((o) => ({ ...o, y: ridgeY(o.x, o.z) }));
  const wood = [];
  for (const { x, y, z, h, lean, s } of SNAGS) {
    const tilt = (g) => g.rotateZ(lean * DEG).rotateY(s * 6.28).translate(x, y, z);
    wood.push(tilt(new THREE.CylinderGeometry(7, 18, h, 6).translate(0, h / 2, 0)));
    for (let b = 0; b < 2; b++) {
      const len = 70 + 50 * b;
      wood.push(tilt(new THREE.CylinderGeometry(2.5, 5, len, 5).translate(0, len / 2, 0).rotateZ((55 + 20 * b) * DEG * (b ? 1 : -1)).translate(0, h * (0.5 + 0.2 * b), 0)));
    }
  }
  const woodMat = solid(0x5d554b, { rough: 0.92, metal: 0, env: 0.4 });
  woodMat.userData.finish = false;
  const woodGreen = new THREE.Color(0x5d554b);
  const woodBurnt = new THREE.Color(0x0f0d0c);
  const snags = new THREE.Mesh(mergeGeometries(wood.map((g) => (g.index ? g.toNonIndexed() : g))), woodMat);
  snags.frustumCulled = false;
  group.add(snags);

  // the smoke: one strip per snag (NY rows, so it can bend), turned to the camera around the vertical, drawn in its shader
  const spos = [];
  const sloc = [];
  const sbase = [];
  const sidx = [];
  const NY = 20;
  SNAGS.forEach(({ x, y, z, h, t, s, H }, i) => {
    const top = [x, y + h * 0.97, z];
    for (let j = 0; j <= NY; j++)
      for (const lx of [-0.5, 0.5]) {
        spos.push(...top);
        sloc.push(lx, j / NY);
        sbase.push(t, s * 6.283, H);
      }
    for (let j = 0; j < NY; j++) {
      const a = i * (NY + 1) * 2 + j * 2;
      sidx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute("position", new THREE.Float32BufferAttribute(spos, 3));
  sGeo.setAttribute("aL", new THREE.Float32BufferAttribute(sloc, 2));
  sGeo.setAttribute("aS", new THREE.Float32BufferAttribute(sbase, 3));
  sGeo.setIndex(sidx);
  const smokeMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uInk: { value: ink.clone() }, uBurn: { value: 0 }, uTime: { value: 0 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uBurn, uTime;
      attribute vec2 aL; attribute vec3 aS; varying vec2 vL; varying float vLife, vPh;
      void main() {
        vec3 base = (modelMatrix * vec4(position, 1.0)).xyz;
        vec3 toCam = cameraPosition - base; toCam.y = 0.0;
        vec3 side = normalize(cross(vec3(0.0, 1.0, 0.0), toCam + vec3(1e-3, 0.0, 0.0)));
        float H = aS.z;
        float y = aL.y;
        float w = (140.0 + 640.0 * y) * H / 1100.0;
        // it rises, the wind lays it over (+z, a little −x: from the crest it leans, it is not a pillar), it sways slowly (a 40 s swing: nothing flickers)
        float sway = 0.16 * H * y * sin(y * 3.2 + aS.y + uTime * 0.16);
        vec3 p = base + side * (aL.x * w + sway) + vec3(0.0, y * H * (1.0 - 0.35 * y), 0.0) + vec3(-0.55, 0.0, 1.0) * pow(y, 1.5) * H * 0.9; // the wind: toward +z, a little toward −x
        vL = aL; vPh = aS.y;
        vLife = smoothstep(aS.x, aS.x + 0.12, uBurn);
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uTime, uAmount; varying vec2 vL; varying float vLife, vPh;
      void main() {
        if (vLife < 0.003) discard;
        float s = vL.x * 2.0;
        float y = clamp(vL.y, 0.0, 1.0);
        float core = exp(-s * s * 2.6);
        float puffs = 0.55 + 0.45 * sin(y * 7.0 - uTime * 0.35 + vPh) * cos(s * 1.7 + y * 4.0 + vPh);
        float a = core * puffs * smoothstep(0.0, 0.12, y) * (1.0 - smoothstep(0.25, 1.0, y));
        gl_FragColor = vec4(uInk * 0.075 * a * vLife * uAmount, 1.0);
      }`,
  });
  const smoke = new THREE.Mesh(sGeo, smokeMat);
  smoke.frustumCulled = false;
  smoke.renderOrder = 25;
  group.add(smoke);

  /* ── 3. A LINE PACK thrown off on the edge of crew 39's pad, its shoulder strap trailing: glass and a fine outline. ── */
  const packMat = glass(BRAND.ink, { base: 0.003, rim: 0.2, power: 2.4, edge: 0.24, spec: 0.25, through: 0.16 });
  const bag = box(34, 16, 42, 5).rotateY(-28 * DEG).rotateZ(6 * DEG);
  const strap = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([[-12, 7, 18], [-24, 2, 34], [-10, 1, 52], [8, 1, 44], [12, 6, 20]].map((p) => new THREE.Vector3(...p))),
    24, 1.6, 6, false,
  ).rotateY(-28 * DEG);
  const P0 = [1150, 0, 182];
  const pack = new THREE.Group();
  pack.position.set(P0[0], ridgeY(P0[0], P0[2]) + 8, P0[2]);
  const bagMesh = new THREE.Mesh(bag, packMat);
  const strapMesh = new THREE.Mesh(strap, packMat);
  const outline = edgesOf(bag, { width: 1.8, opacity: 0.5 });
  outline.renderOrder = 27;
  pack.add(bagMesh, strapMesh, outline);
  asShell([bagMesh, strapMesh], 26);
  group.add(pack);

  return {
    group,
    update(p, time, px = 1000) {
      const shell = p.shell ?? 1;
      const burn = p.burn ?? 0;
      group.visible = shell > 0.003;
      if (!group.visible) return;
      trackMat.uniforms.uAmount.value = shell;
      woodMat.color.lerpColors(woodGreen, woodBurnt, smooth(0.1, 0.8, burn));
      smokeMat.uniforms.uBurn.value = burn;
      smokeMat.uniforms.uTime.value = time;
      smokeMat.uniforms.uAmount.value = shell;
      packMat.uniforms.uAmount.value = shell;
      outline.material.opacity = (outline.material.userData.base ?? 0.5) * shell;
    },
  };
}
