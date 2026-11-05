// DOSSIER 036 — L'éolienne dans la tempête. The film, assembled:
//   plan.js     where everything stands             world.js    the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js    the system: the hub, each blade's pitch motor and its own battery, the generator, the cold brake (solid)
//   eolienne.js the tower and the three blades aux rayons X, the ladder, the grid, Formerie's fold, the reach to the car
//   vent.js     the storm's rain and gusts, the principle's section and filets, the fall's filets
//   025-esp/src/route.js   the road at night and its car aux rayons X, you at the wheel (imported as it is)
//   acte1.js    01 MENACE (0 → tobench)          acte2.js  02 AUTOPSIE: « on l'ouvre », the exploded view (→ toprincipe)
//   acte2b.js   the principle and the rest (toprincipe → tozero)
//   acte3.js    03 RÉPONSE (tozero → toverdict)  fin.js    chute, what is owed, like, next file, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE RUNAWAY AND ITS ANSWER. Its big readout is the speed at the tips of the blades, computed from
// `rpm` on a rotor of 82 m (tipKmh, world.js): signal above 200 km/h (« le bout des pales dépasse deux cents »), ink
// under it. Its second readout, « Pales », is blade A's pitch in degrees (0 producing → 90 « en drapeau »), veille.
// The acts never write them: they move `rpm` and the pitches, the header follows. Past the loop both read FIRST.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, tipKmh } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte2b from "./acte2b.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const SIGNAL = "#ff5b2e";
const LIMIT = 200; // km/h at the tips: the voice's « dépasse deux cents »

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 120000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  const D = createDirector({ stage, first: FIRST, pose0: POSE0 });
  window.SD.S = D.S; // for the trial frames
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co };
  acte1(ctx);
  acte2(ctx);
  acte2b(ctx);
  acte3(ctx);
  fin(ctx);

  const toLoop = D.at("toloop");
  const clock = $("hud-clock");
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const v = tipKmh(W.rpm);
    clock.style.color = v > LIMIT ? SIGNAL : INK;
    return `${Math.round(v / 5) * 5} km/h`;
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    return `${Math.round(Math.min(90, Math.max(0, W.pitchA)))}°`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
