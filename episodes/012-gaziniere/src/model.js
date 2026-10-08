// DOSSIER 012 — Gazinière : the system, in centimetres, Y up, standing on the origin.
// A demonstration model (three stacked parts): replace it with the real one, keep what it hands back —
//   root            what the world adds to a set (the same object in the set and on the bench)
//   parts           by name: each can fade (setPartOpacity) and has ITS OWN materials
//   A               anchors: the points the labels and the camera aim at
//   pose(p, time)   every frame: p is plain numbers (explode 0–1, heart, …) — the model owns its mechanism
// Three values of grey read as an object without a legend: the casting dark, the machined faces lighter,
// the hero part clearly lighter. Metal stays little metallic (≤ 0.5): the studio it would mirror is black.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, setGlow, explode, cyl, anchor } from "@kit/build3d.js";

export const MODEL = { height: 4.2, radius: 5.2 };

export function buildModel() {
  const root = new THREE.Group();
  const base = makePart("base", { lift: 0 });
  addMesh(base, cyl(5, 1, 0.12), solid(0x2a3036, { rough: 0.6, metal: 0.3 }), { pos: [0, 0.5, 0] });
  const core = makePart("core", { lift: 4, delay: 0.15 });
  addMesh(core, cyl(2.2, 1.2, 0.1), solid(0x8d939a, { rough: 0.45, metal: 0.4 }), { pos: [0, 1.6, 0] });
  const heart = glow(BRAND.veille, 0.3);
  addMesh(core, new THREE.SphereGeometry(0.5, 32, 16), heart, { pos: [0, 2.5, 0], edges: false });
  const cover = makePart("cover", { lift: 9, delay: 0 });
  addMesh(cover, cyl(5.2, 1.4, 0.2), solid(BRAND.plastic, { rough: 0.55, coat: 0.4 }), { pos: [0, 3.5, 0] });
  root.add(base, core, cover);
  const parts = { base, core, cover };
  const list = Object.values(parts);
  const A = { heart: anchor(core, 0, 2.5, 0), top: anchor(cover, 0, 4.2, 0) };

  return {
    root, parts, A,
    fx: { heart },
    pose({ explode: k = 0, heart: h = 0.3 } = {}) {
      explode(list, k);
      setGlow(heart, h);
    },
  };
}
