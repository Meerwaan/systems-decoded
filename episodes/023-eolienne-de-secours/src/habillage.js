// DOSSIER 023 — Éolienne de secours : the dressing of the sky (the decorator's file — docs/recette-decorateur.md).
// Nothing here is the system, nothing stands in front of the plane. What the bare set did not have — the life of the
// Atlantic at night, then of the Azores at first light, all in ink, all far:
//   · THE STARS: a moonless night over the ocean (new moon on 19 August 2001: on the 24th, before six, the crescent
//     had long set) — sparse, still, dim points at infinity, hazed out at the horizon; they go with the dawn.
//   · THE CLOUDS BELOW: a deck of broken cloud in streets along the wind, far under the plane — what gives the black
//     lower half of the night shots their depth (the hook looks out at them, low over the horizon). Soft streaked
//     bodies, NO outline: outlined, a cloud seen from above reads as another island. They lie at ≈ 6 000 true metres
//     (on the altimeter's scale): the plane comes down through their level in the glide, so they leave before it gets
//     there (`alt`). None over the island, none along the plane's track toward it: the island has to read.
//   · TERCEIRA LIVES: its villages strung along the coast road, two towns (Praia, by the runway; Angra, across the
//     island) — still points of ink, never on the runway nor on its approach. They pale with the dawn.
//   · THE CABIN HAS ITS ROWS: the seat backs, row after row — only in the shots of you (close, at cabin height): from
//     below and from afar they are gone, so nothing stands behind the RAT in its bay.
//
//   dressAvion({ plane, island, group }) → { update(P, time, px) }
//   plane: the plane's group (the seats) · island: the island's group (clouds and villages ride with the sea)
//   group: the world's frame (the stars, at infinity) · P: what avion.update receives (ground, dawn, shell)
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { FUSE, GEAR, ALT, ISLAND, CABIN, YOU } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const ISLE_Z = 0.62; // as avion.js: the island is longer than wide
const isleR = (th) => 1 + 0.07 * Math.sin(3 * th + 1.0) + 0.045 * Math.sin(5 * th + 2.3) + 0.03 * Math.sin(9 * th + 0.4);
const RWY_W = Math.max(ISLAND.w, 4500);
// the cloud deck's height above the runway (island frame, y = 0 at its top): ≈ 6 000 true metres on the altimeter's scale
const DECK = (ALT.depth * 6000) / ALT.cruise;

/* ── points that keep their size on screen (≥ 2.4 px: below that a point crawls), still, never a twinkle ── */
function pointsMat({ k = 1, fade = 1e9, far = 165000, infinity = false } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(k) }, uAmount: { value: 1 }, uFade: { value: fade }, uFar: { value: far } },
    vertexShader: /* glsl */ `
      uniform float uFade, uFar; attribute float aK; attribute float aPx; varying float vA;
      void main() {
        ${infinity
          ? `// at infinity, like the dome: the eye's position does not move them, the horizon hazes them out
             vec3 d = normalize(position);
             vA = aK * smoothstep(0.02, 0.16, d.y);
             vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * d * 1000.0, 1.0);
             gl_Position = vec4(p.xy, p.w * 0.99993, p.w);`
          : `vec4 mv = modelViewMatrix * vec4(position, 1.0);
             float dist = max(1.0, -mv.z);
             vA = aK * exp(-dist / max(uFade, 1.0)) * (1.0 - smoothstep(uFar * 0.75, uFar, dist));
             gl_Position = projectionMatrix * mv;`}
        gl_PointSize = aPx;
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
}
function pointCloud(list, mat, order) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(list.flatMap((p) => p.at), 3));
  geo.setAttribute("aK", new THREE.Float32BufferAttribute(list.map((p) => p.k), 1));
  geo.setAttribute("aPx", new THREE.Float32BufferAttribute(list.map((p) => p.px), 1));
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = order;
  return pts;
}

/* ── the cloud deck: flat sheets, a faint body and a wobbly outline (an X-ray of a cloud), streaked along x ── */
function cloudMat() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aSeed; varying vec2 vQ; varying float vS; varying vec3 vW;
      void main() {
        vQ = uv * 2.0 - 1.0; vS = aSeed;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vQ; varying float vS; varying vec3 vW;
      void main() {
        float s = vS * 37.0;
        // a few lobes on an ellipse: never more than ±0.12, so the quad's own edge is always outside the cloud
        float n = 0.07 * sin(vQ.x * 6.0 + s) * sin(vQ.y * 4.0 + s * 1.7) + 0.05 * sin(vQ.x * 13.0 + vQ.y * 3.0 + s * 0.6);
        float e = length(vQ) + n;
        // a soft body streaked along its length (the streets of a deck), no outline
        float body = smoothstep(0.88, 0.15, e) * (0.6 + 0.4 * sin(vQ.y * 6.0 + s * 2.3) * sin(vQ.x * 2.0 + s));
        float dist = length(vW - cameraPosition);
        float far = exp(-dist / 420000.0) * (1.0 - smoothstep(150000.0, 172000.0, dist)); // gone before the far plane: never a cut edge
        vec3 V = (cameraPosition - vW) / max(dist, 1.0);
        float graze = smoothstep(0.012, 0.09, abs(V.y)); // seen edge-on a sheet would be a line across the frame
        float a = body * 0.2 * far * graze * uAmount;
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
  });
}

/* ── the seat backs: a faint glass, only close and at cabin height ── */
function seatMat() {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 1 }, uSeen: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vD;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vV = cameraPosition - w.xyz;
        vD = length(vV);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uSeen; varying vec3 vN; varying vec3 vV; varying float vD;
      void main() {
        float c = abs(dot(normalize(vN), vV / max(vD, 1.0)));
        float rim = pow(clamp(1.0 - c, 0.0, 1.0), 2.4);
        float near = 1.0 - smoothstep(1500.0, 3200.0, vD);
        gl_FragColor = vec4(uColor * (0.002 + 0.07 * rim) * near * uSeen * uAmount, 1.0);
      }`,
  });
  return mat;
}

export function dressAvion({ plane, island, group }) {
  const rand = rng(23);
  const fx = {};

  /* ── the stars: a moonless night over the ocean ── */
  {
    const list = [];
    while (list.length < 1100) {
      const u = rand() * 2 - 1;
      const th = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const d = [r * Math.cos(th), Math.abs(u), r * Math.sin(th)];
      if (d[1] < 0.03) continue;
      const b = Math.pow(rand(), 3.2);
      list.push({ at: d, k: 0.18 + 0.7 * b, px: 2.4 + 1.6 * b });
    }
    fx.stars = pointsMat({ k: 0.85, infinity: true });
    group.add(pointCloud(list, fx.stars, 1));
  }

  /* ── the cloud deck, far under the plane (island frame: it rides with the sea) ── */
  {
    const pos = [];
    const uv = [];
    const seed = [];
    let n = 0;
    for (let tries = 0; n < 620 && tries < 12000; tries++) { // a deck: ≈ a third of the sea covered
      const x = -140000 + rand() * 460000;
      const z = (rand() * 2 - 1) * 260000;
      // the island reads: nothing within twice its radius, nor along the track the plane flies toward it (the wide
      // shots look down at the island through the deck there)
      if (Math.hypot(x, z / ISLE_Z) < ISLAND.r * 2) continue;
      if (Math.abs(z) < 26000 && x > -30000 && x < 150000) continue;
      const len = 10000 + rand() * 30000;
      const wid = len * (0.18 + rand() * 0.22);
      const yaw = (rand() - 0.5) * 0.35;
      const y = DECK + (rand() - 0.5) * 1400;
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      const corner = (a, b) => [x + a * c * len * 0.5 - b * s * wid * 0.5, y, z + a * s * len * 0.5 + b * c * wid * 0.5];
      const quad = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
      const sd = rand();
      for (const [a, b] of quad) {
        pos.push(...corner(a, b));
        uv.push((a + 1) / 2, (b + 1) / 2);
        seed.push(sd);
      }
      n++;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
    fx.clouds = cloudMat();
    const mesh = new THREE.Mesh(geo, fx.clouds);
    mesh.frustumCulled = false;
    mesh.renderOrder = 5;
    island.add(mesh);
    fx.cloudMesh = mesh;
  }

  /* ── Terceira lives: villages along the coast road, two towns — never on the runway nor its approach ── */
  {
    const R = ISLAND.r;
    const H = ISLAND.h;
    const list = [];
    const ok = (x, z) => Math.abs(z) > RWY_W * 0.8 + 700 && !(x > ISLAND.len / 2 - 600 && Math.abs(z) < 3000);
    // on the slope just below the cap's edge (between the contour lines at 0.87 and 0.925 of the radius)
    const coast = (th, f, y, k, px) => {
      const r = R * isleR(th) * f;
      const x = r * Math.cos(th);
      const z = r * Math.sin(th) * ISLE_Z;
      if (ok(x, z)) list.push({ at: [x, y, z], k, px });
    };
    const ring = (th) => {
      // its height on the slope, from where it stands between the two contour lines
      const f = 0.875 + rand() * 0.04;
      const y = -0.05 * H - ((f - 0.87) / 0.055) * 0.25 * H + 25;
      return [f, y];
    };
    // the villages: clusters strung round the coast
    const VILLAGES = 17;
    for (let v = 0; v < VILLAGES; v++) {
      const th0 = (v / VILLAGES) * Math.PI * 2 + rand() * 0.18;
      const m = 5 + Math.floor(rand() * 9);
      for (let i = 0; i < m; i++) {
        const [f, y] = ring();
        coast(th0 + (rand() - 0.5) * 0.09, f, y, 0.7 + rand() * 0.5, 2.8 + rand() * 0.9);
      }
      // the road between this village and the next: a few lone lights
      for (let i = 0; i < 3; i++) {
        const [f, y] = ring();
        coast(th0 + ((i + 1) / 4) * ((Math.PI * 2) / VILLAGES), f, y, 0.45 + rand() * 0.25, 2.6);
      }
    }
    // the two towns: a denser grid of lights on the top's edge — Praia beside the runway's threshold, Angra across
    const town = (cx, cz, rad, count) => {
      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2;
        const rr = Math.sqrt(rand()) * rad;
        let x = cx + Math.cos(a) * rr;
        let z = cz + Math.sin(a) * rr * 0.7;
        if (rand() < 0.5) x = Math.round(x / 260) * 260; else z = Math.round(z / 260) * 260; // streets
        const th = Math.atan2(z / ISLE_Z, x);
        if (Math.hypot(x, z / ISLE_Z) > R * isleR(th) * 0.835 || !ok(x, z)) continue;
        list.push({ at: [x, 6, z], k: 0.4 + rand() * 0.55, px: 2.6 + rand() * 1.0 });
      }
    };
    town(ISLAND.len / 2 - 3200, 6400, 2600, 150);
    town(-ISLAND.len / 2 + 5200, -6400, 3400, 210);
    fx.towns = pointsMat({ k: 1.4, fade: 320000 });
    island.add(pointCloud(list, fx.towns, 8));
  }

  /* ── the cabin has its rows: a seat back behind every head (yours is already there) ── */
  {
    const geos = [];
    const ZS = [-215, -165, -75, -25, 25, 75, 165, 215];
    const back = new THREE.BoxGeometry(7, 70, 44);
    for (let i = 0; i < CABIN.rows; i++) {
      const x = CABIN.from + ((CABIN.to - CABIN.from) * i) / (CABIN.rows - 1);
      for (const z of ZS) {
        if (Math.abs(x - YOU.at[0]) < 60 && z === 215) continue;
        geos.push(back.clone().translate(x + 22, -10, z).toNonIndexed());
      }
    }
    const pos = [];
    const nor = [];
    for (const g of geos) {
      pos.push(...g.attributes.position.array);
      nor.push(...g.attributes.normal.array);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    fx.seats = seatMat();
    const mesh = new THREE.Mesh(geo, fx.seats);
    mesh.frustumCulled = false;
    mesh.renderOrder = 8;
    // seen from below the cabin floor (the belly, the bay, the hook) they are gone: nothing behind the RAT
    const eye = new THREE.Vector3();
    mesh.onBeforeRender = (r, s, camera) => {
      eye.setFromMatrixPosition(camera.matrixWorld);
      mesh.worldToLocal(eye);
      fx.seats.uniforms.uSeen.value = smooth(-170, -60, eye.y);
    };
    plane.add(mesh);
  }

  return {
    update(P = {}, time = 0, px = 1) {
      const ground = P.ground ?? -(FUSE.r + GEAR.h) - ALT.depth;
      const alt = Math.max(0, ((-(FUSE.r + GEAR.h) - ground) * ALT.cruise) / ALT.depth);
      const dawn = clamp01(P.dawn ?? 0);
      // the stars go with the first light
      fx.stars.uniforms.uAmount.value = 1 - smooth(0.05, 0.75, dawn);
      // the deck leaves before the plane reaches its level; its tops catch the dawn
      const deck = smooth(6400, 9600, alt) * (1 + 0.7 * dawn);
      fx.clouds.uniforms.uAmount.value = deck;
      fx.cloudMesh.visible = deck > 0.003;
      // the island's lights pale as the day comes
      fx.towns.uniforms.uAmount.value = 1 - 0.4 * dawn;
      fx.seats.uniforms.uAmount.value = clamp01(P.shell ?? 1);
    },
  };
}
