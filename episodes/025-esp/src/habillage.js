// DOSSIER 025 — ESP : the dressing of the road (the decorator's file — docs/recette-decorateur.md).
// Nothing here is the system, nothing stands on the road nor in front of the boar or the car. What the bare set did
// not have — the life of a French country road at night, all in ink:
//   · THE DELINEATORS (balises J6): a short white post every 50 m on each verge, its black band and its reflector. It
//     is what a départementale looks like at night: the posts the beams sweep, and their reflectors giving the
//     headlamps back — but only toward the car (a reflector returns the light where it came from: seen from in front,
//     in the hook, they stay dark). They give the road its rhythm and its depth, ahead and behind.
//   · THE SIGN « PASSAGE D'ANIMAUX SAUVAGES » (A15b): the warning you have just passed, on your verge, behind the car on
//     the first frame — its back to the hook's camera; its face lights up in the beams when the road brings it ahead.
//     A pictogram, no text.
//   · A BORNE on your verge, far ahead: the small rounded marker of a départementale.
//   · THE COUNTRYSIDE, far off to the sides: two farms (a yard lamp, a few windows) a few hundred metres away, two
//     hamlets strung up a hillside kilometres away — their lights draw the hill's line, no line is drawn — and the
//     faint glow of the larger one on the low clouds. Never along the road's axis (the hook, the chase, the verge and
//     the rocket look down it): only in the low shots that look across (front, rear, 1997).
// What floats under the headlamps is already there: route.js's rain.
// From above (VIEW.top, wide) the roadside goes (camera above ≈ 5 m): no posts across the spin's picture.
//
//   dressRoute() → { road, far, update({ shell, scroll, slid, co, si }, time, px) }
//   road: in route.js's `slide` (the road's frame: things stand at z = s − scroll) · far: in its `pivot` (too far to scroll)
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeDresser } from "@kit/details.js";
import { CAR, ROAD } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const RES = new THREE.Vector2(BRAND.W, BRAND.H);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const NOSE = CAR.nose;
const ED = ROAD.edge; //          your lane's edge line (x 175)
const OTHER = ROAD.otherEdge; //  the other lane's (x −525)

/* the roadside is wrapped in a window that runs from 180 m ahead of the car to 70 m behind it, faded at both ends */
const WIN = { from: -18000, to: 7000 };
const PERIOD = WIN.to - WIN.from; // 250 m: five delineators a side
const wrapZ = (z) => WIN.from + ((((z - WIN.from) % PERIOD) + PERIOD) % PERIOD);
const ends = (z) => smooth(WIN.from, WIN.from + 3000, z) * (1 - smooth(WIN.to - 2500, WIN.to, z));

/** How much of the headlamps reaches a point of the car's frame — route.js's cones (`beamAt`), here `widen`ed and with
 *  their own `reach`: the white paint of a post catches their spill, a reflector their axis from far away (a reflector
 *  sends back a thousand times what paint does: it is seen at a hundred metres). */
const spillAt = (x, z, widen, reach) => {
  const ahead = NOSE - z;
  if (ahead < -10) return 0;
  const w = (62 + 0.2 * Math.max(ahead, 0)) * widen;
  const bl = (x - 60) / w;
  const br = (x + 60) / w;
  return 0.5 * (Math.exp(-bl * bl) + Math.exp(-br * br)) * smooth(-10, 240, ahead) * Math.exp(-Math.max(ahead, 0) / reach);
};

/* ── fine ink lines, one material per object (its brightness is a uniform: nothing to upload each frame) ── */
function inkLines(segments, width = 2) {
  const geo = new LineSegmentsGeometry().setPositions(new Float32Array(segments));
  const mat = new LineMaterial({ color: INK.clone(), linewidth: width, transparent: true, depthWrite: false, opacity: 0 });
  mat.fog = true; // far ones sink into the rain's night, like the road's own lines
  mat.resolution.copy(RES);
  const mesh = new LineSegments2(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  return mesh;
}

/**
 * A reflector, or a reflective face: it returns the headlamps toward the lamps only. `uRetro`: how close the eye is to
 * the lamps' direction, seen from the reflector (cos of 14° → 3°: the camera over the roof still sees it). A point keeps ≥ 2.4 px (`uPxMin`); a face (`face`)
 * is a flat triangle drawn as it is.
 */
function retroMat({ size = 24, k = 1.6, pxMin = 3, face = false } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: INK.clone().multiplyScalar(k) }, uAmount: { value: 0 }, uBeam: { value: 0 }, uSize: { value: size },
      uFocal: { value: 1600 }, uPxMin: { value: pxMin }, uRes: { value: RES }, uLamp0: { value: new THREE.Vector3() }, uLamp1: { value: new THREE.Vector3() },
    },
    vertexShader: /* glsl */ `
      uniform float uSize, uFocal, uPxMin; uniform vec2 uRes; uniform vec3 uLamp0, uLamp1;
      varying vec2 vQ; varying float vRetro; varying float vFar;
      void main() {
        vec4 w = modelMatrix * vec4(${face ? "position" : "vec3(0.0)"}, 1.0);
        vec3 toCam = normalize(cameraPosition - w.xyz);
        float r = max(dot(toCam, normalize(uLamp0 - w.xyz)), dot(toCam, normalize(uLamp1 - w.xyz)));
        vRetro = smoothstep(0.9703, 0.9986, r);
        vec4 c = projectionMatrix * viewMatrix * w;
        vFar = exp(-max(c.w, 1.0) / 9000.0);
        ${face
          ? "vQ = vec2(0.0);"
          : `vQ = position.xy * 2.0;
             float px = max(uSize * uFocal / max(c.w, 1.0), uPxMin);
             c.xy += position.xy * px * 2.0 / uRes * c.w;`}
        gl_Position = c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uBeam; varying vec2 vQ; varying float vRetro; varying float vFar;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        float a = ${face ? "1.0" : "(0.75 * exp(-r2 * 14.0) + 0.3 * exp(-sqrt(r2) * 5.0)) * (1.0 - r2)"};
        gl_FragColor = vec4(uColor * a * vRetro * uBeam * vFar * uAmount, 1.0);
      }`,
  });
}

/* ── the far lights: still points that keep their size (≥ 2.4 px), never a twinkle, never in the fog ── */
function farPoints(list) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(list.flatMap((p) => p.at), 3));
  geo.setAttribute("aK", new THREE.Float32BufferAttribute(list.map((p) => p.k), 1));
  geo.setAttribute("aPx", new THREE.Float32BufferAttribute(list.map((p) => p.px), 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aK; attribute float aPx; varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vA = aK * exp(-max(1.0, -mv.z) / 900000.0);
        gl_PointSize = aPx;
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
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 1;
  return { pts, mat };
}

export function dressRoute() {
  const rand = rng(25);
  const road = new THREE.Group();
  road.name = "habillage";
  const far = new THREE.Group();
  const items = []; // { node, s, x, mats: LineMaterial[], retro: ShaderMaterial[], base, gain }
  const st = { amount: 1, focal: 1600, cam: 1 };
  const lampL = new THREE.Vector3();
  const lampR = new THREE.Vector3();
  const eye = new THREE.Vector3();

  // the eye's height and where the lamps are, once per shutter sample (the first roadside object drawn reads them)
  const sense = (camera) => {
    eye.setFromMatrixPosition(camera.matrixWorld);
    st.cam = 1 - smooth(450, 1000, eye.y); // from above, the roadside goes
    const car = road.parent?.parent?.parent; // slide › pivot › the car's frame
    if (car) {
      lampL.set(-60, 66, NOSE + 6).applyMatrix4(car.matrixWorld);
      lampR.set(60, 66, NOSE + 6).applyMatrix4(car.matrixWorld);
    }
  };
  const place = (node, s, x, o = {}) => {
    const it = { node, s, x, mats: [], retro: [], base: o.base ?? 0.3, gain: o.gain ?? 0.7, glint: o.glint ?? 1 };
    node.traverse((m) => {
      if (m.material?.isLineMaterial) it.mats.push(m.material);
      else if (m.material?.uniforms?.uLamp0) it.retro.push(m.material);
      if (m.isMesh || m.isLine) m.onBeforeRender = (r, sc, camera) => {
        sense(camera);
        const b = it.lit;
        for (const mat of it.mats) mat.opacity = b * st.cam;
        for (const mat of it.retro) {
          mat.uniforms.uLamp0.value.copy(lampL);
          mat.uniforms.uLamp1.value.copy(lampR);
          mat.uniforms.uAmount.value = st.amount * st.cam * it.fade;
          mat.uniforms.uBeam.value = it.glint * it.beam;
          mat.uniforms.uFocal.value = st.focal;
        }
      };
    });
    road.add(node);
    items.push(it);
    return it;
  };

  /* ── the delineators (J6): 10 cm wide, 1.05 m high, a black band at the top and its reflector, facing the traffic ── */
  const POST = [
    -5, 0, 0, -5, 105, 0, 5, 0, 0, 5, 105, 0, -5, 105, 0, 5, 105, 0, // its outline
    -5, 72, 0, 5, 72, 0, -5, 92, 0, 5, 92, 0, //                       its band
  ];
  const quad = new THREE.PlaneGeometry(1, 1);
  const post = (side, s) => {
    const g = new THREE.Group();
    g.add(inkLines(POST, 2.2));
    const glint = new THREE.Mesh(quad, retroMat({ size: side > 0 ? 26 : 22, k: side > 0 ? 1.8 : 1.5 }));
    glint.position.set(0, 82, 1.5);
    glint.frustumCulled = false;
    glint.renderOrder = 6;
    g.add(glint);
    // on your verge just beyond the edge line; on the other side beyond the other lane's (the ditches are further out)
    return place(g, s, side > 0 ? ED + 85 : OTHER - 85);
  };
  // spaced 50 m; on the first frame none stands between the hook's camera and the boar (right: z +15 m, −35 m…;
  // left: z −10 m, out of the hook's narrow frame)
  for (let k = 0; k < PERIOD / 5000; k++) {
    post(1, 3300 + 5000 * k);
    post(-1, 800 + 5000 * k);
  }

  /* ── the sign « passage d'animaux sauvages » (A15b): a 70 cm triangle on its post, its face toward the traffic ── */
  {
    const T = 70;
    const H = (T * Math.sqrt(3)) / 2;
    const y0 = 100; // its lower edge, 1 m above the verge (a rural road)
    const tri = (inset) => {
      const a = [-T / 2 + inset * 1.732, y0 + inset];
      const b = [T / 2 - inset * 1.732, y0 + inset];
      const c = [0, y0 + H - inset * 2];
      return [...a, 0.5, ...b, 0.5, ...b, 0.5, ...c, 0.5, ...c, 0.5, ...a, 0.5];
    };
    // a stag leaping to the right, in a few strokes (the pictogram)
    const deer = [
      [-16, 116], [-8, 119], [6, 120], [11, 122], [14, 128], [18, 131], // back, neck, head
      [12, 113], [6, 117], [-8, 116], [-14, 113], [-16, 116], //           belly back to the rump
    ];
    const strokes = [];
    for (let i = 0; i < deer.length - 1; i++) strokes.push(deer[i][0], deer[i][1], 0.6, deer[i + 1][0], deer[i + 1][1], 0.6);
    for (const [a, b] of [[[9, 115], [17, 110]], [[6, 117], [12, 109]], [[-12, 114], [-19, 108]], [[-14, 113], [-17, 106]], [[14, 128], [12, 135]], [[16, 129], [19, 135]]])
      strokes.push(a[0], a[1], 0.6, b[0], b[1], 0.6);
    const g = new THREE.Group();
    g.add(inkLines([-3, 0, 0, -3, y0, 0, 3, 0, 0, 3, y0, 0, ...tri(0), ...tri(8)], 2));
    g.add(inkLines(strokes, 1.8));
    // its reflective face: it lights up, faintly, when the headlamps come back to the eye
    const face = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(tri(0).slice(0, 3).concat(tri(0).slice(3, 6), tri(0).slice(9, 12)), 3));
    const fm = new THREE.Mesh(face, retroMat({ k: 0.5, face: true }));
    fm.frustumCulled = false;
    fm.renderOrder = 5;
    g.add(fm);
    // on your verge, just passed on the first frame: behind the car (z +26 m)
    place(g, 4400, ED + 110, { base: 0.34, gain: 0.66 });
  }

  /* ── a borne (the small marker of a départementale): rounded top, its cap band — far ahead on the first frame ── */
  {
    const pts = [[-20, 0], [-20, 44]];
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI - (i / 10) * Math.PI;
      pts.push([20 * Math.cos(a), 44 + 16 * Math.sin(a)]);
    }
    pts.push([20, 0]);
    const seg = [];
    for (let i = 0; i < pts.length - 1; i++) seg.push(pts[i][0], pts[i][1], 0, pts[i + 1][0], pts[i + 1][1], 0);
    seg.push(-20, 40, 0, 20, 40, 0);
    place(new THREE.Group().add(inkLines(seg, 2)), -5200, ED + 70, { base: 0.26 });
  }

  /* ── the countryside, far off to the sides (pivot frame: ahead −z, your right +x) — never down the road's axis ── */
  const list = [];
  const at = (deg, metres) => [Math.sin((deg * Math.PI) / 180) * metres * 100, -Math.cos((deg * Math.PI) / 180) * metres * 100]; // deg from ahead, + to the right
  const farm = (deg, metres, n) => {
    const [x, z] = at(deg, metres);
    list.push({ at: [x, 650, z], k: 1.5, px: 5 }); // the yard lamp
    for (let i = 0; i < n; i++) list.push({ at: [x + (rand() - 0.5) * 2600, 220 + rand() * 260, z + (rand() - 0.5) * 2600], k: 0.7 + rand() * 0.4, px: 3.2 + rand() * 0.8 });
  };
  farm(36, 380, 3); //   ahead on your right, across the field
  farm(-128, 520, 2); // behind on your left
  const hamlet = (deg, metres, n, rise, spread) => {
    const [x, z] = at(deg, metres);
    const th = (deg * Math.PI) / 180;
    const tx = Math.cos(th); // across the line of sight
    const tz = Math.sin(th);
    for (let i = 0; i < n; i++) {
      const u = rand() * 2 - 1;
      const up = (1 - u * u) * rise * (0.7 + 0.3 * rand()); // strung up the hill and down again: its line
      list.push({ at: [x + u * spread * tx, 400 + up, z + u * spread * tz + (rand() - 0.5) * 6000], k: 0.55 + rand() * 0.55, px: 3 + rand() * 1.2 });
    }
    return [x, z];
  };
  const [hx, hz] = hamlet(140, 2400, 26, 6500, 32000); // behind on your right, up a hillside
  hamlet(-55, 3000, 12, 3000, 20000); //                  ahead on your left
  const lights = farPoints(list);
  far.add(lights.pts);
  // the larger hamlet's glow on the low clouds: a light that has a place, faint
  const halo = makeDresser({ seed: 5 });
  halo.glow({ at: [hx, 9000, hz], size: 70000, k: 0.28, kind: "far" });
  halo.done();
  far.add(halo.group);

  return {
    road,
    far,
    update({ shell = 1, scroll = 0, slid = 0, co = 1, si = 0 } = {}, time = 0, px = 1600) {
      const amount = clamp01(shell);
      st.amount = amount;
      st.focal = px;
      road.visible = far.visible = amount > 0.003;
      for (const it of items) {
        const z = wrapZ(it.s - scroll);
        it.node.position.set(it.x, 0, z);
        // where it stands in the car's frame: how much of the beams reaches it
        const qx = it.x + slid;
        const cx = qx * co - z * si;
        const cz = qx * si + z * co;
        it.fade = ends(z);
        it.beam = spillAt(cx, cz, 1.3, 9000);
        it.lit = amount * it.fade * (it.base + it.gain * Math.min(1, 1.8 * spillAt(cx, cz, 1.8, 3000)));
      }
      lights.mat.uniforms.uAmount.value = amount;
      halo.update({ amount }, time, px);
    },
  };
}
