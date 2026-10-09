// DOSSIER 017 — IRM. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   suite.js   the MRI room like an X-ray: the door, the line on the floor, you and the oxygen cylinder
//   model.js   the system: the scanner — tunnel, gradient coils, the coils in their helium, the quench pipe — and its two buttons
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THIS FILM'S CLOCK IS A TESLAMETER. The header's big readout is the field (`tesla`): signal as long as there is
// one, veille at zero. Its second readout says whether the MACHINE is on (`power`): « arrêtée » under « 1,5 T » is
// the whole film in one glance.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 30000, keySize: 2.5 });
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  const D = createDirector({ stage, first: FIRST, pose0: POSE0 });
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
    const t = Math.max(0, D.W.tesla);
    clock.style.color = t > 0.04 ? "#ff5b2e" : "#5cffb0";
    return `${t.toFixed(1).replace(".", ",")} T`;
  });
  D.readout("hud-count-v", () => {
    const on = D.W.power > 0.5;
    count.style.color = on ? "#e9e4d8" : "#5cffb0";
    return on ? "En marche" : "Arrêtée";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
