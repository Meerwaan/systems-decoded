// CR01 — salle.js : the control room of unit 4, reconstituted as an investigators' maquette, ≈ 1:1 (plan.js ROOM).
// LA RECONSTITUTION: matte clay volumes, fine light edges, one hard light from −x; the AZ-5 button is THE part in fault (alarm()).
// Seen from −x, from behind the operators:
//   · the DESK: six straight console modules on an arc, concave toward the operators (a sloped writing top, a raised riser of meters);
//     on the module in front of the left silhouette, the AZ-5 button alone on its light bezel, its cover lifted open behind it (a light
//     backdrop the red reads against); on the next module, the row of protection KEYS and their papier lamps
//   · the BOARD of rod positions on the wall behind: a disc of ≈ 72 dials, each a dark face where a papier bar shows how deep its rod is
//     (the same reading as coeur.js: `rodsIn` share of rods inside — half-way down —, `scram` all of them toward the bottom)
//   · three faceless clay SILHOUETTES standing at the desk, backs to the camera, nobody's hand near the button: it sinks on its own
//   · cabinets on either side of the board, sober volumes that fall into the dark
//   buildSalle() → { group, A, haloR, update(S, time, px) }
//   A: focus, fault (the AZ-5 button), desk, board (the centre of the disc of dials), keys, crew
//   reads S: az5 prot crew fault rodsIn scram
import * as THREE from "three";
import { box, cyl, plate, mergeGeometries, solid } from "@kit/build3d.js";
import { clay, clayEdges, alarm, setAlarm, RECON } from "@kit/reconstitution.js";
import { makeFigure } from "@kit/figure.js";
import { ROOM } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/* ── the desk: a profile (u from the front edge toward +x, y up) extruded along each module ── */
const DESK_R = 320; // radius of the desk's front edge (the arc's centre is on the operators' side)
const DESK_FRONT = 115; // x of the front edge on the axis (ROOM.desk.at[0] − depth / 2)
const C = new THREE.Vector3(DESK_FRONT - DESK_R, 0, 0); // the arc's centre
// module centres: one centred on AZ-5, the next on the keys, the same step on either side
const AZ_T = Math.atan2(ROOM.az5[2], ROOM.az5[0] - C.x);
const KEY_T = Math.atan2(ROOM.keys.at[2], ROOM.keys.at[0] - C.x);
const STEP = KEY_T - AZ_T; // ≈ 13.3°
const MODULES = [-2, -1, 0, 1, 2, 3].map((k) => AZ_T + k * STEP);
const HALF_W = DESK_R * Math.tan(STEP / 2); // the modules meet at their front edges
const TOP0 = 90; // the writing top: y 90 at the front edge, rising to 98 at u 44
const TOP_U = 44;
const ySurf = (u) => TOP0 + ((98 - TOP0) * u) / TOP_U;
const TILT = Math.atan2(98 - TOP0, TOP_U); // the top's slope, toward the operator
const RISER = Math.atan2(8, 34); // the riser leans back by this much
const PROFILE = [
  [5, 0], [70, 0], [70, 128], [52, 132], [44, 98], [0, 90], [-2, 87], [-2, 14], [5, 10],
];

/* ── the board ── */
const B = ROOM.board;
const DIAL = { r: 9.4, face: 7.6, bar: 12.6, w: 3.4 };

export function buildSalle() {
  const group = new THREE.Group();
  const add = (geo, mat, x, y, z, parent = group, edges = true) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    if (edges) m.add(clayEdges(geo));
    parent.add(m);
    return m;
  };

  // the maquette's base plate (its edge says « maquette »; the reconstitution's floor carries the shadows around it)
  add(box(500, 2.5, 600, 0.5), clay({ tone: -0.62 }), 140, 1.25, 0);

  /* ───────── the desk ───────── */
  const deskMat = clay({ tone: 0.12 });
  const deskGeo = plate(PROFILE, 2 * HALF_W, { bevel: 0.6, round: 1 }).translate(0, 0, -HALF_W);
  const meterMat = clay({ tone: -0.78 });
  const knobMat = clay({ tone: -0.7 });
  const meterGeo = box(1.2, 13, 17, 0.3);
  const knobGeo = cyl(1.9, 2.2, 0.3, 20);
  const modules = MODULES.map((t) => {
    const m = new THREE.Group();
    m.position.copy(C).addScaledVector(new THREE.Vector3(Math.cos(t), 0, Math.sin(t)), DESK_R);
    m.rotation.y = -t; // local +x = the radial direction, local +z = along the arc
    group.add(m);
    add(deskGeo, deskMat, 0, 0, 0, m);
    // the riser's meters: dark windows, few and large (nothing fine that flickers)
    for (const w of [-22, 0, 22]) {
      const mt = add(meterGeo, meterMat, 48 - 0.7 * Math.cos(RISER), 115 + 0.7 * Math.sin(RISER), w, m);
      mt.rotation.z = -RISER;
    }
    return m;
  });
  /** a frame lying on a module's writing top at (u, w), its y the surface's normal */
  const pad = (mod, u, w) => {
    const p = new THREE.Group();
    p.position.set(u, ySurf(u), w);
    p.rotation.z = TILT;
    mod.add(p);
    return p;
  };
  // a few knobs on the modules that carry neither the button nor the keys
  for (const i of [0, 1, 4, 5]) {
    const p = pad(modules[i], 22, 0);
    for (let j = -2; j <= 2; j++) add(knobGeo, knobMat, 0, 1.1, j * 11, p);
  }

  /* ───────── AZ-5: alone on its module, under its cover lifted open ───────── */
  const toLocal = (mod, x, z) => {
    const t = -mod.rotation.y;
    const rx = x - mod.position.x;
    const rz = z - mod.position.z;
    return [rx * Math.cos(t) + rz * Math.sin(t), -rx * Math.sin(t) + rz * Math.cos(t)];
  };
  const azMod = modules[2];
  const [azU, azW] = toLocal(azMod, ROOM.az5[0], ROOM.az5[2]);
  const azPad = pad(azMod, azU, azW);
  add(box(17, 1.2, 17, 0.25), clay({ tone: 0.5 }), 0, 0.6, 0, azPad); // the bezel
  add(cyl(4.7, 1.6, 0.25, 32), clay({ tone: -0.72 }), 0, 2.0, 0, azPad); // the collar it sinks into
  add(box(3.2, 0.5, 10, 0.12), clay({ tone: 0.82 }), -6.6, 1.45, 0, azPad); // the label plate (blank: no text, no size)
  const btnMat = alarm();
  const BTN_Y = 3.9;
  const btn = add(cyl(3.6, 3.2, 0.5, 40), btnMat, 0, BTN_Y, 0, azPad);
  // the cover, hinged on its far edge, lifted past upright: a light plate behind the red
  const hinge = new THREE.Group();
  hinge.position.set(6.4, 1.2, 0);
  hinge.rotation.z = -104 * DEG;
  azPad.add(hinge);
  const lidMat = clay({ tone: 0.62 });
  add(box(12.4, 0.8, 12.4, 0.2), lidMat, -6.4, 5.2, 0, hinge);
  add(box(0.8, 4.4, 12.4, 0.2), lidMat, -12.2, 3.0, 0, hinge);
  add(box(12.4, 4.4, 0.8, 0.2), lidMat, -6.4, 3.0, 5.8, hinge);
  add(box(12.4, 4.4, 0.8, 0.2), lidMat, -6.4, 3.0, -5.8, hinge);

  /* ───────── the protection keys and their lamps ───────── */
  const K = ROOM.keys;
  const keyMod = modules[3];
  const [kU, kW] = toLocal(keyMod, K.at[0], K.at[2]);
  const keyPad = pad(keyMod, kU, kW);
  add(box(22, 1, K.gap * K.count + 6, 0.25), clay({ tone: 0.45 }), 2, 0.5, 0, keyPad);
  const barrelGeo = cyl(2.3, 2.6, 0.3, 28);
  const handleGeo = box(1.5, 3.4, 5.4, 0.3);
  const lampGeo = cyl(2.3, 1.8, 0.4, 28);
  const barrelMat = clay({ tone: -0.7 });
  const handleMat = clay({ tone: 0.66 });
  const keys = [];
  const lamps = [];
  for (let i = 0; i < K.count; i++) {
    const w = (i - (K.count - 1) / 2) * K.gap;
    add(barrelGeo, barrelMat, -3, 2.3, w, keyPad);
    const handle = add(handleGeo, handleMat, -3, 5.2, w, keyPad);
    keys.push(handle);
    const lm = solid(new THREE.Color(0x2b2a28), { rough: 0.6, metal: 0, env: 0.2 });
    lm.emissive = new THREE.Color(RECON.papier);
    lm.emissiveIntensity = 0;
    lm.userData.finish = false;
    lamps.push(lm);
    add(lampGeo, lm, 6.5, 1.9, w, keyPad);
  }

  /* ───────── the wall, the disc of dials ───────── */
  add(box(10, 300, 360, 0.6), clay({ tone: -0.42 }), B.at[0] + 15, 150, B.at[2]);
  const disc = add(cyl(B.r, 5, 0.8, 96), clay({ tone: -0.12 }), B.at[0] + 4, B.at[1], B.at[2]);
  disc.rotation.z = Math.PI / 2;
  // ≈ 72 dials: the points of a square grid inside the disc, nearest the centre first
  const spots = [];
  const s = 23.5;
  for (let a = -6; a <= 5; a++) for (let b = -6; b <= 5; b++) spots.push([(a + 0.5) * s, (b + 0.5) * s]);
  spots.sort((p, q) => Math.hypot(...p) - Math.hypot(...q) || p[0] - q[0] || p[1] - q[1]);
  const dialSpots = spots.slice(0, B.dials);
  const xFace = B.at[0] + 1.5; // the disc's −x face
  const bezels = [];
  const faces = [];
  for (const [z, y] of dialSpots) {
    bezels.push(cyl(DIAL.r, 2, 0.4, 40).rotateZ(Math.PI / 2).translate(xFace - 1, B.at[1] + y, B.at[2] + z));
    faces.push(cyl(DIAL.face, 1.2, 0.2, 40).rotateZ(Math.PI / 2).translate(xFace - 2.3, B.at[1] + y, B.at[2] + z));
  }
  add(mergeGeometries(bezels), clay({ tone: 0.5 }), 0, 0, 0, group, false);
  add(mergeGeometries(faces), clay({ tone: -0.9 }), 0, 0, 0, group, false);
  const barMat = solid(new THREE.Color(0x2b2a28), { rough: 0.6, metal: 0, env: 0.2 });
  barMat.emissive = new THREE.Color(RECON.papier);
  barMat.emissiveIntensity = 1.0;
  const BAR_INK = barMat.emissive.clone(), BAR_OK = new THREE.Color(RECON.veille), BAR_RED = new THREE.Color(RECON.alarme);
  barMat.userData.finish = false;
  const barGeo = new THREE.BoxGeometry(0.8, 1, DIAL.w);
  const bars = dialSpots.map(([z, y]) => {
    const m = new THREE.Mesh(barGeo, barMat);
    m.position.set(xFace - 3.1, B.at[1] + y, B.at[2] + z);
    m.userData.top = B.at[1] + y + DIAL.bar / 2;
    group.add(m);
    return m;
  });
  const N = bars.length;

  /* ───────── cabinets either side of the board, angled toward the room ───────── */
  const cabMat = clay({ tone: -0.3 });
  const winMat = clay({ tone: -0.85 });
  const cabGeo = box(40, 220, 52, 0.6);
  const winGeo = box(1.2, 30, 34, 0.3);
  for (const side of [-1, 1]) {
    for (let j = 0; j < 3; j++) {
      const g = new THREE.Group();
      const z0 = side * (205 + j * 50);
      g.position.set(B.at[0] - 10 - j * 22, 0, B.at[2] + z0);
      g.rotation.y = side * 24 * DEG;
      group.add(g);
      add(cabGeo, cabMat, 0, 110, 0, g);
      for (const y of [150, 108]) add(winGeo, winMat, -20.4, y, 0, g);
    }
  }

  /* ───────── three silhouettes, backs to the camera ───────── */
  const silMat = clay({ tone: -0.78 });
  // ROOM.crew moved a little (journal « À changer ailleurs »): the button and the keys stay clear from the room's camera, and the close
  // cameras on the button and the keys stand between the silhouettes instead of inside one
  const CREW = [[62, 0, -88], [50, 0, 28], [70, 0, 124]];
  const crew = CREW.map(([x, y, z], i) => {
    const f = makeFigure();
    f.group.traverse((o) => {
      if (o.isMesh) {
        o.material = silMat;
        o.castShadow = o.receiveShadow = true;
      }
    });
    f.shadow.visible = false;
    if (i < 2) {
      // hands clasped behind the back: no hand ever reads near the button, from any camera of the room
      f.reach("L", new THREE.Vector3(6, 100, -13));
      f.reach("R", new THREE.Vector3(-6, 100, -13));
      f.lean(i ? 5 : 0, 0, i ? -6 : 0);
    } else {
      f.lean(3, 2, 10);
    }
    const t = Math.atan2(z, x - C.x); // facing the desk, along its radius
    f.group.position.set(x, y + 2.5, z);
    f.group.rotation.y = Math.PI / 2 - t;
    f.group.scale.set(0.9, 1, 0.9); // slim
    group.add(f.group);
    return f.group;
  });

  const anchor = (x, y, z, parent = group) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };
  const A = {
    focus: anchor(200, 110, 0),
    fault: btn,
    desk: anchor(ROOM.desk.at[0], ROOM.desk.h, 0),
    board: anchor(...B.at),
    keys: anchor(0, 3, 0, keyPad),
    crew: anchor(70, 120, 0),
  };

  return {
    group, A, haloR: 30,
    update(S) {
      // AZ-5: it sinks on its own (nobody's hand on it)
      btn.position.y = BTN_Y - 1.9 * clamp01(S.az5);
      setAlarm(btnMat, S.fault);
      // the protections: lamps go out one by one, left to right, and each key turns a quarter as it does
      const p = clamp01(S.prot) * K.count;
      for (let i = 0; i < K.count; i++) {
        const k = clamp01((p - (K.count - 1 - i)) / 0.45);
        lamps[i].emissiveIntensity = 1.0 * k;
        keys[i].rotation.y = (1 - k) * 90 * DEG;
      }
      for (let i = 0; i < crew.length; i++) crew[i].visible = S.crew > 0.5;
      // the board: the same reading as coeur.js (inside rods half-way down, all of them toward the bottom with `scram`)
      const nIn = Math.round(clamp01(S.rodsIn) * N);
      const sc = clamp01(S.scram);
      // the colour code: the bars light green while the margin holds (S.ok), red once it is violated (S.viol)
      const viol = clamp01(S.viol ?? 0), okb = clamp01(S.ok ?? 0) * (1 - viol);
      barMat.emissive.copy(BAR_INK).lerp(BAR_OK, okb).lerp(BAR_RED, viol);
      for (let i = 0; i < N; i++) {
        const base = (i * 29) % N < nIn ? 0.45 : 0;
        const depth = base + (1 - base) * sc;
        const m = bars[i];
        m.visible = depth > 0.004;
        const L = Math.max(0.01, DIAL.bar * depth);
        m.scale.y = L;
        m.position.y = m.userData.top - L / 2;
      }
    },
  };
}
