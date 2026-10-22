// DOSSIER 024 — Bloc opératoire : the dressing of the room (the decorator's file — docs/recette-decorateur.md).
// Nothing here is the system, nothing stands in front of you, of the appliance or of its wire, nothing on a camera's
// way. The room as it is framed leaves almost no free place: every camera looks from the near side (−x / +z, where
// the cameras themselves stand) into the far quadrant (+x / −z), where the subjects are — you, the surgeon, the
// appliance, the cabinet; the top of every frame is under the header, the bottom under the hook's cards. What the
// bare set did not have, and what it can take there: THE ANAESTHETIST'S CORNER, at the head end, beyond the
// ventilator — where in a real theatre everything that keeps you asleep stands within reach:
//   · the anaesthesia trolley, its drawers toward the table, three syringes ready on it;
//   · the drip stand, two bags — the one that has been running is lower — its lines coiled down the pole (no line
//     to you: it would cross the ventilator in its own shot);
//   · the ceiling boom and its monitor turned toward your head, a still trace of your heart on it (no sweep, no blink).
// All in ink, X-ray glass and fine lines. Seen in the wide shot from far and high (VIEW.far: « une maquette dans la
// nuit »), and in any shot that would turn toward the head end; out of every other pose of VIEW (checked one by one).
// It follows `shell`, and the dark of the what-if (`dark`) halves it, like the room's own glass.
//
//   dressBloc() → { group, update({ shell, dark }, time, px) }    (group: in the room's frame)
import { makeDresser } from "@kit/details.js";
import { ROOM } from "./plan.js";

const DEG = Math.PI / 180;

export function dressBloc() {
  const d = makeDresser({ seed: 24, tone: 1.3 });
  // the trolley, its drawers facing the table's head (+x)
  d.trolley({ at: [-248, 0, -165], w: 60, d: 45, h: 92, rotY: 90 * DEG });
  // the drip stand by your head, on the far side, clear of the ventilator's cart
  d.drip({ at: [-218, 0, -30], h: 200, bags: 2 });
  // the boom from the ceiling, its monitor turned toward your head (between +x and +z)
  d.boom({ from: [-262, ROOM.h, -175], at: [-228, 196, -128], w: 42, h: 30, rotY: 55 * DEG });
  d.done();

  return {
    group: d.group,
    update({ shell = 1, dark = 0 } = {}, time = 0, px = 1) {
      d.update({ amount: shell * (1 - 0.5 * dark), lamp: 1 }, time, px);
    },
  };
}
