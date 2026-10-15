// DOSSIER 023 — the system: the RAT (éolienne de secours). BOUCHON — grey volumes in the right places, so the film
// builds while the real model is made. Replace this file whole; keep EXACTLY what buildSystem() returns (docs/023-decors.md).
import * as THREE from "three";
import { DOOR, ARM, SPRING, PROP, PUMP, LINES, HYD } from "./plan.js";

const grey = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0.2 });

export function buildSystem() {
  const root = new THREE.Group();
  const bay = new THREE.Mesh(new THREE.BoxGeometry(DOOR.len, DOOR.bay, DOOR.w), new THREE.MeshStandardMaterial({ color: 0x333a40, transparent: true, opacity: 0.25 }));
  bay.position.set(DOOR.len * 0.3, DOOR.bay / 2 + DOOR.y, 0);
  const doorPivot = new THREE.Group();
  doorPivot.position.set(DOOR.len * 0.3, DOOR.y, DOOR.w / 2);
  const door = new THREE.Mesh(new THREE.BoxGeometry(DOOR.len, 3, DOOR.w), grey(0x8d939a));
  door.position.set(0, 0, -DOOR.w / 2);
  doorPivot.add(door);
  const armPivot = new THREE.Group();
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(ARM.r, ARM.r, ARM.len, 12), grey(0x5a6168));
  arm.rotation.z = Math.PI / 2;
  arm.position.x = ARM.len / 2;
  armPivot.add(arm);
  const head = new THREE.Group();
  head.position.x = ARM.len;
  armPivot.add(head);
  const pump = new THREE.Mesh(new THREE.CylinderGeometry(PUMP.r, PUMP.r, PUMP.len, 16), grey(0x6c737a));
  pump.rotation.z = Math.PI / 2;
  const prop = new THREE.Group();
  prop.position.x = -PUMP.len / 2 - 4;
  const blades = new THREE.Mesh(new THREE.BoxGeometry(2, PROP.r * 2, 10), grey(0xb8bdc2));
  prop.add(blades);
  head.add(pump, prop);
  const lines = [];
  for (let i = 0; i < HYD.n; i++) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(LINES.r, LINES.r, LINES.len, 8), grey(0x444b52));
    l.rotation.z = Math.PI / 2;
    l.position.set(-LINES.len / 2, 20, (i - 1) * 8);
    lines.push(l);
    root.add(l);
  }
  root.add(bay, doorPivot, armPivot);
  const anchor = (parent, x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const A = {
    hinge: anchor(root, 0, 0, 0), door: anchor(door, 0, 0, 0), spring: anchor(root, SPRING.from[0], SPRING.from[1] - 20, 0),
    arm: anchor(arm, 0, 0, 0), hub: anchor(prop, 0, 0, 0), blade: anchor(blades, 0, PROP.r, 0), pump: anchor(pump, 0, 0, 0),
    lines: anchor(lines[1], 0, 0, 0), live: anchor(lines[HYD.live], 0, -LINES.len / 2, 0),
  };
  const parts = { door: doorPivot, arm: armPivot, prop, pump, lines: root };
  return {
    root, A, parts,
    update(P) {
      doorPivot.rotation.x = -P.door * 1.5;
      armPivot.rotation.z = -P.arm * (ARM.travel * Math.PI) / 180;
      prop.rotation.x = P.turn * Math.PI * 2;
      armPivot.position.x = P.explode * 40;
      doorPivot.position.y = DOOR.y + P.explode * 90;
    },
  };
}
