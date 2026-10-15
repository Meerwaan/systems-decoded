// DOSSIER 020 — Taipei 101. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   tour.js    Taipei 101 like an X-ray, in the typhoon: the tower that bends, the cage at its top, you behind the glass
//   model.js   the system: the ball of 41 plates, its cables, its eight dampers, the bumper ring
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THIS FILM'S CLOCK IS A RULER. The header's big readout is the ball's course (`reach`): how far it goes at the end of
// a swing, in true centimetres — 50, 70, 100 are the voice's own figures in act 3. Its second readout is what the
// course is read against: the bumper, 150 cm away (sourced, and fixed). « 100 cm » over « Butée 150 cm » is the
// climax in one glance. The big readout turns signal from 40 cm up while the typhoon has the upper hand (`mood` 1),
// veille once the dampers have won (`mood` 0); the bumper turns signal while the ring is drawn hot (`limit`).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, SET, COURSE, tipOf } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 90000, keySize: 2.5 });
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  // `aboard` 1: the camera travels with the cage (the cage holds still in the picture, the storm sways around it)
  const D = createDirector({ stage, first: FIRST, pose0: POSE0, ride: (W) => [W.set === SET.TOWER ? W.aboard * tipOf(W) : 0, 0, 0] });
  window.SD.S = D.S; // for the trial frames
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co };
  acte1(ctx);
  acte2(ctx);
  acte3(ctx);
  fin(ctx);

  const clock = $("hud-clock");
  const count = $("hud-count");
  D.readout("hud-clock", () => {
    const r = Math.max(0, D.W.reach);
    clock.style.color = r >= 40 ? (D.W.mood > 0.5 ? SIGNAL : VEILLE) : INK;
    return `${Math.round(r)} cm`;
  });
  D.readout("hud-count-v", () => {
    count.style.color = D.W.limit > 0.5 ? SIGNAL : INK;
    return `${COURSE.max} cm`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
