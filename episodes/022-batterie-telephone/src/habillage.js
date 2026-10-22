// DOSSIER 022 — Batterie de téléphone : the dressing of the bedroom (the decorator's file — docs/recette-decorateur.md).
// Nothing here is the system, nothing stands in front of the pillow or of the phone. The room is filmed close (the
// pillow, the bedside table) and once wide (« tu l'éloignes »): the dressing sits where those pictures look.
//   · THE STREET BEHIND THE SHUTTER: the room's only other light at night — soft bands of street light on the
//     headboard, above the pillow and left of your head, coming from a window behind us (the side of the room the
//     camera stands in, never drawn). It says « it is night, the lights are off »: the one warm light left is under
//     the pillow. It is seen in every pillow shot (the first frame, « sous l'oreiller », « et ton oreiller ? », the like,
//     the loop) and on the headboard in the wide shot. Static: the first and the last frame stay the same.
//   · A GLASS OF WATER on the bedside table, on the bed's side: what one puts there before sleeping. Never where the
//     phone is carried or set down.
//
//   dressChambre() → { group, update({ shell }, time, px) }    (group: in the room's frame; it follows the room's X-ray)
import { makeDresser } from "@kit/details.js";
import { BED, TABLE } from "./plan.js";

export function dressChambre() {
  const d = makeDresser({ seed: 22, tone: 0.8 });
  const face = BED.z0 - 1.5 + 0.4; // the headboard's front face (chambre.js: it stands from the back wall to BED.z0 − 1.5), just in front of it

  // the street through the shutter: four bands across the headboard, just above the pillow and left of your head — low enough to stay under the header in every pillow shot
  d.slats({ at: [12, 66, face], w: 50, h: 16, n: 4, skew: -4, k: 0.11 });
  // a glass of water at the bed-side front corner of the table (the phone lands in the middle, comes from the bed above it)
  d.jar({ at: [TABLE.at[0] + TABLE.w / 2 - 4.5, TABLE.h, TABLE.at[2] + TABLE.d / 2 - 5], r: 3.4, h: 10, fill: 0.62, lid: false });
  d.done();

  return {
    group: d.group,
    update({ shell = 1 } = {}, time = 0, px = 1) {
      d.update({ amount: shell }, time, px);
    },
  };
}
