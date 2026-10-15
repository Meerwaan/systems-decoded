// DOSSIER 023 — the plane and its world: the A330 like an X-ray over the Atlantic, the sea, the island and its runway.
// BOUCHON — grey volumes in the right places, so the film builds while the real set is made. Replace this file whole;
// keep EXACTLY what buildAvion() returns (docs/023-decors.md).
import * as THREE from "three";
import { FUSE, WING, ENGINES, TAIL, GEAR, BAY, YOU, ISLAND } from "./plan.js";

const mat = (c, o = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.1, transparent: o < 1, opacity: o });

export function buildAvion() {
  const group = new THREE.Group();
  const plane = new THREE.Group(); // pitch and bank turn this, around the origin
  const fuse = new THREE.Mesh(new THREE.CylinderGeometry(FUSE.r, FUSE.r, FUSE.len, 24), mat(0x9aa3ab, 0.25));
  fuse.rotation.z = Math.PI / 2;
  fuse.position.x = (FUSE.nose + FUSE.tail) / 2;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(WING.root, 40, WING.span), mat(0x9aa3ab, 0.25));
  wing.position.set(WING.x, WING.y, 0);
  const engines = [1, -1].map((s) => {
    const e = new THREE.Mesh(new THREE.CylinderGeometry(ENGINES.r, ENGINES.r, ENGINES.len, 20), mat(0x3a4046));
    e.rotation.z = Math.PI / 2;
    e.position.set(ENGINES.x, ENGINES.y, s * ENGINES.z);
    return e;
  });
  const fin = new THREE.Mesh(new THREE.BoxGeometry(600, TAIL.fin, 30), mat(0x9aa3ab, 0.25));
  fin.position.set(TAIL.x, FUSE.r + TAIL.fin / 2, 0);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(400, 20, TAIL.stab), mat(0x9aa3ab, 0.25));
  stab.position.set(TAIL.x, 60, 0);
  const you = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 8), mat(0xe9e4d8, 0.6));
  you.position.set(YOU.at[0], YOU.at[1] + 60, YOU.at[2]);
  const mount = new THREE.Group();
  mount.position.set(...BAY.at);
  plane.add(fuse, wing, ...engines, fin, stab, you, mount);
  // the world around: the sea and the island move with the ground and the threshold
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(170000, 170000), mat(0x0c1014));
  sea.rotation.x = -Math.PI / 2;
  const island = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND.r * 0.7, ISLAND.r, ISLAND.h, 32), mat(0x20262b));
  const runway = new THREE.Mesh(new THREE.BoxGeometry(ISLAND.len, 4, ISLAND.w), mat(0x4a5258));
  group.add(plane, sea, island, runway);
  const anchor = (parent, x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const A = {
    nose: anchor(plane, FUSE.nose, 0, 0), tail: anchor(plane, TAIL.x, 300, 0), cockpit: anchor(plane, FUSE.cockpit, 120, 0),
    engL: anchor(plane, ENGINES.x, ENGINES.y, ENGINES.z), engR: anchor(plane, ENGINES.x, ENGINES.y, -ENGINES.z),
    you: anchor(plane, YOU.at[0], YOU.at[1] + 60, YOU.at[2]), window: anchor(plane, YOU.at[0], YOU.at[1] + 60, FUSE.r),
    bay: anchor(plane, ...BAY.at), gear: anchor(plane, GEAR.main[0], -FUSE.r, GEAR.main[1]),
    wingTip: anchor(plane, WING.x + 1400, WING.y + 200, WING.span / 2), aileron: anchor(plane, WING.x + 1300, WING.y + 180, WING.span * 0.4),
    elevator: anchor(plane, TAIL.x + 300, 60, 600), rudder: anchor(plane, TAIL.x + 400, FUSE.r + TAIL.fin * 0.5, 0),
    tanks: anchor(plane, WING.x, WING.y, 1800), leak: anchor(plane, ENGINES.x + 300, ENGINES.y, -ENGINES.z),
    threshold: anchor(runway, ISLAND.len / 2, 0, 0), island: anchor(island, 0, ISLAND.h / 2, 0),
  };
  const D = Math.PI / 180;
  return {
    group, mount, A,
    update(P) {
      plane.rotation.set(-P.bank * D, 0, -P.pitch * D);
      engines[0].material.color.setHex(P.engines >= 0.5 ? 0x8d939a : 0x5a2a1c);
      engines[1].material.color.setHex(P.engines >= 1.5 ? 0x8d939a : 0x5a2a1c);
      fuse.material.opacity = 0.25 * P.shell;
      you.visible = P.you > 0.5;
      sea.position.y = P.ground - ISLAND.h;
      island.position.set(P.threshold - ISLAND.len / 2, P.ground - ISLAND.h / 2, 0);
      runway.position.set(P.threshold - ISLAND.len / 2, P.ground + 2, 0);
    },
  };
}
