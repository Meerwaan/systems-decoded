// DOSSIER 020 — Taipei 101 : the dressing of the tower (the decorator's file — docs/recette-decorateur.md).
// Nothing here is the system, nothing stands in front of the ball. Two things the bare set did not have:
//   · TAIPEI AT NIGHT, far below: lights strung along the streets out to the horizon — it is what says « you are
//     up there », and gives every wide picture its depth. Still points, never a veil; they follow `city`.
//   · THE ROOM OF THE BALL, lit like the real one: a ring of lamps set in the gallery's inner edge, on the far side
//     of the ball (the camera stands at −x / +z), whose light rims its base; a crown of spots in the ceiling over it.
//     They follow `shell`.
//
//   dressTour(mount) → { group, update({ shell, city }, time, px) }    (group: in the tower's frame; the lamps ride `mount`)
import { makeDresser } from "@kit/details.js";
import { GALLERY } from "./plan.js";

const DEG = Math.PI / 180;

export function dressTour(mount) {
  // the city: from the foot of the blocks (CITY.r 90 m) to the horizon
  const town = makeDresser({ seed: 7 });
  town.nightLights({ r0: 2600, r1: 85000, y: 30, cell: 2400, count: 22000, k: 1.6, fade: 110000, px: [3.2, 7] });
  town.done();

  // the lamps of the gallery, on the far side of the ball only (az −20 … −70 cameras: the near side would sit on the ball)
  const room = makeDresser({ seed: 3 });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * 360 * DEG;
    const x = Math.cos(a) * (GALLERY.inner + 12);
    const z = Math.sin(a) * (GALLERY.inner + 12);
    if (-0.72 * x + 0.69 * z > -40) continue; // toward the camera: no
    room.glow({ at: [x, GALLERY.y + 14, z], size: 150, k: 1.6 });
  }
  // and a crown of spots in the ceiling over the ball, all round: above it on the screen, never on it
  for (let i = 0; i < 14; i++) {
    const a = ((i + 0.5) / 14) * 360 * DEG;
    room.glow({ at: [Math.cos(a) * 560, 1040, Math.sin(a) * 560], size: 120, k: 1.4 });
  }
  room.done();
  mount.add(room.group);

  return {
    group: town.group,
    update({ shell = 1, city = 0 } = {}, time = 0, px = 1) {
      town.update({ amount: Math.min(1, city * 1.4) }, time, px);
      room.update({ amount: shell, lamp: 1 }, time, px);
    },
  };
}
