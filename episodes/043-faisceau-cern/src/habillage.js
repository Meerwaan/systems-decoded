// DOSSIER 043 — habillage.js : the life of the places (docs/recette-decorateur.md). Never the system, never in front of
// it, never between the first frame's eye and the train. Everything here is ink, X-ray: fine lines and a few lights.
//
//   dressTunnel() → { group, update({ shell }, time, px) }   the LHC tunnel round the ring (anneau.js, world frame)
//   dressCavern() → { group, update({ cavern }, time, px) }  the dump line's tunnel and the block's cavern (sortie.js,
//                                                            the line frame: x left looking downstream, y up, z = u)
// Each touch, and why (what is true of the LHC):
//  · THE CRYOGENIC LINE (QRL) along the outer wall, above the magnets, a jumper down to the chain once per cell: the
//    helium that keeps the magnets superconducting runs beside them the whole way round — the tunnel is a fridge.
//  · THE MONORAIL under the vault, over the passage: the rail the inspection train (TIM) runs on — while the beam runs,
//    nobody walks here; a machine patrols.
//  · TWO CABLE TRAYS on the inner wall: the 3 600 loss monitors talk to someone; the tunnel is wired end to end.
//  · THE STRIP LIGHTS under the vault, one per magnet: a tunnel has its lights; they draw the perspective the first
//    frame pulls toward, and fade out long before they would crowd the train's head.
//  · THE LAMPS of the line's tunnel and of the cavern: the block lives in a lit cavern; a row of lights leads the eye
//    down the line to it.
// Not on the insertion (point 6: the kickers' shots look at them through the inner wall) — the system's place stays bare.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makeDresser } from "@kit/details.js";
import { RING, MAGNET, TUNNEL, INSERTION, CAVERN, BLOCK, LINE } from "./plan.js";

const R0 = RING.r, CX = RING.centre[0], CZ = RING.centre[2];
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const TAU = Math.PI * 2;

/** A point in the beam's frame — arc s, `out` from the beam (outward +), `up` — in the world (as anneau.js). */
const bp = (s, out = 0, up = 0) => {
  const th = s / R0, rad = R0 + out;
  return [CX - rad * Math.sin(th), up, CZ + rad * Math.cos(th)];
};
const lines = () => ({ s: [], k: [] });
const seg = (L, a, b, k) => {
  L.s.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  L.k.push(k);
};
/** Along the ring from s0 to s1 at (out, up), cut every `step` cm: it follows the curve. */
const along = (L, s0, s1, out, up, k, step = 40) => {
  const n = Math.max(1, Math.ceil(Math.abs(s1 - s0) / step));
  let prev = bp(s0, out, up);
  for (let i = 1; i <= n; i++) {
    const q = bp(s0 + ((s1 - s0) * i) / n, out, up);
    seg(L, prev, q, k);
    prev = q;
  }
};
/** A circle round an axis that runs along the ring, at arc s: centre (out0, up0), radius r. */
const ringAround = (L, s, out0, up0, r, k, n = 20) => {
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const q = bp(s, out0 + r * Math.cos(a), up0 + r * Math.sin(a));
    if (prev) seg(L, prev, q, k);
    prev = q;
  }
};

/**
 * Lines as ribbons in screen pixels (`width` ≥ 2), additive, trimmed at the eye — the same drawing as the tunnel's own
 * lines in anneau.js, so the dressing sits in its X-ray. `fade` [in0, in1, out0, out1] with the distance to the eye (cm):
 * nothing grazes the lens, nothing crowds the far end of a shot (no shimmer at the vanishing point).
 */
function ribbon(L, { width = 2, fade = [40, 160, 1100, 2400] } = {}) {
  const n = L.k.length;
  const A = new Float32Array(n * 12), B = new Float32Array(n * 12), Q = new Float32Array(n * 8), K = new Float32Array(n * 4);
  const idx = new Uint32Array(n * 6);
  const QS = [0, -1, 0, 1, 1, -1, 1, 1];
  for (let i = 0; i < n; i++) {
    for (let v = 0; v < 4; v++) {
      const j = i * 4 + v;
      for (let c = 0; c < 3; c++) {
        A[j * 3 + c] = L.s[i * 6 + c];
        B[j * 3 + c] = L.s[i * 6 + 3 + c];
      }
      Q[j * 2] = QS[v * 2];
      Q[j * 2 + 1] = QS[v * 2 + 1];
      K[j] = L.k[i];
    }
    const b = i * 4;
    idx.set([b, b + 1, b + 2, b + 2, b + 1, b + 3], i * 6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(A, 3));
  geo.setAttribute("aA", new THREE.BufferAttribute(A, 3));
  geo.setAttribute("aB", new THREE.BufferAttribute(B, 3));
  geo.setAttribute("aQ", new THREE.BufferAttribute(Q, 2));
  geo.setAttribute("aK", new THREE.BufferAttribute(K, 1));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, // the quads wind clockwise on screen
    uniforms: {
      uRes: { value: RES }, uWidth: { value: width }, uColor: { value: new THREE.Color(BRAND.ink) }, uAmount: { value: 1 },
      uFade: { value: new THREE.Vector4(...fade) },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aA; attribute vec3 aB; attribute vec2 aQ; attribute float aK;
      uniform vec2 uRes; uniform float uWidth;
      varying float vK; varying float vDist; varying float vSide;
      void main() {
        vec4 a = modelViewMatrix * vec4(aA, 1.0);
        vec4 b = modelViewMatrix * vec4(aB, 1.0);
        const float NZ = -0.4;
        if (a.z > NZ && b.z > NZ) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
        if (a.z > NZ) a = mix(a, b, (a.z - NZ) / (a.z - b.z));
        if (b.z > NZ) b = mix(b, a, (b.z - NZ) / (b.z - a.z));
        vec4 ca = projectionMatrix * a; vec4 cb = projectionMatrix * b;
        vec2 d = (cb.xy / cb.w - ca.xy / ca.w) * uRes;
        float L = length(d);
        d = L > 1e-5 ? d / L : vec2(1.0, 0.0);
        vec2 nn = vec2(-d.y, d.x);
        vec4 c = aQ.x < 0.5 ? ca : cb;
        c.xy += (nn * aQ.y + d * (aQ.x < 0.5 ? -0.5 : 0.5)) * uWidth / uRes * c.w;
        gl_Position = c;
        vK = aK; vSide = aQ.y;
        vDist = length((aQ.x < 0.5 ? a : b).xyz);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; uniform vec4 uFade;
      varying float vK; varying float vDist; varying float vSide;
      void main() {
        float amt = uAmount * smoothstep(uFade.x, uFade.y, vDist) * (1.0 - smoothstep(uFade.z, uFade.w, vDist));
        if (amt < 0.003) discard;
        vec3 col = uColor * vK * amt * (1.0 - 0.45 * smoothstep(0.35, 1.0, abs(vSide)));
        if (col.r + col.g + col.b < 0.0015) discard;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  return mesh;
}

/* ── where the tunnel's dressing stands (the beam's frame: out from the beam, up) ── */
const QRL = { out: 74, up: 124, r: 22 }; //        the cryogenic line: outer wall, above the magnets
const RAIL = { out: -150, lo: 186, hi: 196 }; //   the monorail's flanges, over the passage
const TRAYS = [92, 128]; //                       two cable trays on the inner wall (their height)
const STRIP = { out: -96, up: 222, len: 120 }; //  the strip lights under the vault
const wallOut = (up, side) => -TUNNEL.inward + side * Math.sqrt(TUNNEL.r ** 2 - (up - TUNNEL.up) ** 2); // side +1 outer, −1 inner
const ceilingUp = (out) => TUNNEL.up + Math.sqrt(TUNNEL.r ** 2 - (out + TUNNEL.inward) ** 2);
// the arc the dressing covers: the whole ring but the insertion and a margin round it
const S_A = INSERTION.to + 900 - 2 * Math.PI * R0, S_B = INSERTION.from - 900;

export function dressTunnel() {
  const group = new THREE.Group();
  group.name = "habillage-tunnel";
  const F = lines(), N = lines();
  /* the cryogenic line: three lines along it, a flange ring at each magnet's ends, an arm to the wall, a jumper per cell */
  for (const [a, k] of [[Math.PI / 2, 0.3], [-Math.PI / 2, 0.3], [Math.PI, 0.2]]) along(F, S_A, S_B, QRL.out + QRL.r * Math.cos(a), QRL.up + QRL.r * Math.sin(a), k);
  const mids = [];
  for (let i = -45; i < 45; i++) {
    const mid = MAGNET.firstAt + i * MAGNET.period + MAGNET.length / 2;
    if (mid - MAGNET.period / 2 > S_A && mid + MAGNET.period / 2 < S_B) mids.push([i, mid]);
  }
  const armUp = QRL.up - QRL.r - 2;
  for (const [i, mid] of mids) {
    for (const e of [mid - MAGNET.length / 2, mid + MAGNET.length / 2]) ringAround(F, e, QRL.out, QRL.up, QRL.r, 0.28);
    seg(F, bp(mid, QRL.out, armUp), bp(mid, wallOut(armUp, 1) - 3, armUp), 0.26);
    if (((i % 7) + 7) % 7 === 3) for (const ds of [-6, 6]) seg(F, bp(mid + 120 + ds, QRL.out - 8, QRL.up - QRL.r), bp(mid + 120 + ds, 20, 41), 0.24);
  }
  /* the monorail: its two flanges, a hanger to the vault every tunnel section */
  along(F, S_A, S_B, RAIL.out, RAIL.lo, 0.42);
  along(F, S_A, S_B, RAIL.out, RAIL.hi, 0.24);
  const vault = ceilingUp(RAIL.out);
  for (let s = Math.ceil(S_A / 314.16) * 314.16; s < S_B; s += 314.16) seg(F, bp(s, RAIL.out, RAIL.hi), bp(s, RAIL.out, vault), 0.28);
  /* the cable trays: the outer edge and its lip, a bracket to the wall every tunnel section */
  for (const up of TRAYS) {
    const w = wallOut(up, -1) + 3;
    along(F, S_A, S_B, w + 34, up, 0.3);
    along(F, S_A, S_B, w + 34, up + 6, 0.18);
    for (let s = Math.ceil(S_A / 314.16) * 314.16; s < S_B; s += 314.16) seg(F, bp(s, w, up), bp(s, w + 34, up), 0.24);
  }
  /* the strip lights: one under the vault per magnet */
  for (const [, mid] of mids) seg(N, bp(mid - STRIP.len / 2, STRIP.out, STRIP.up), bp(mid + STRIP.len / 2, STRIP.out, STRIP.up), 0.62);
  const fine = ribbon(F, { width: 2, fade: [40, 160, 1100, 2400] });
  const strips = ribbon(N, { width: 3, fade: [80, 240, 1300, 2600] });
  group.add(fine, strips);
  return {
    group,
    /** shell: the tunnel's X-ray (the dressing steps back with it) */
    update({ shell = 1 } = {}) {
      group.visible = shell > 0.003;
      fine.material.uniforms.uAmount.value = shell;
      strips.material.uniforms.uAmount.value = shell;
    },
  };
}

/* ── the line's tunnel and the cavern (the line frame) ── */
const CAV0 = BLOCK.u + BLOCK.len / 2 - CAVERN.len / 2;

export function dressCavern() {
  const d = makeDresser({ tone: 0.8, seed: 43 });
  // the line's tunnel: a lamp under its vault every 3 m from past the dilution magnets to the cavern
  for (let u = 1750; u < CAV0; u += 300) d.glow({ at: [30, LINE.tunnel.r - 14, u], size: 90, k: 0.7 });
  // the cavern: two rows of lamps under its roof, above the shielding, never over the block's axis
  const top = CAVERN.floor + CAVERN.h - 14;
  for (let k = 0; k < 4; k++) for (const x of [-130, 130]) d.glow({ at: [x, top, CAV0 + 160 + k * 330], size: 130, k: 0.75 });
  d.done();
  d.group.name = "habillage-caverne";
  return {
    group: d.group,
    /** cavern: the line's tunnel and the cavern's X-ray */
    update({ cavern = 1 } = {}, time = 0, px = 1) {
      d.update({ amount: cavern, lamp: 1, motes: 0 }, time, px);
    },
  };
}
