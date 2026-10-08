// DOSSIER __ID__ — __TITLE__. The film, assembled:
//   model.js   the system                      world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   acte1.js   01 MENACE (hook, scene)         acte2.js   02 AUTOPSIE (bench, exploded view)
//   acte3.js   03 RÉPONSE (the climax)         fin.js     chute, the three calls to action, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (D.times, cues of episode.json):
// they do not depend on each other, only on world.js.
import { createStage } from "@kit/stage.js";
import { createDirector, along } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 6000, keySize: 2.5 });
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

  // The story clock: the time the voice says, key by key (held, then stretched over act 3). Past the loop, the first frame's.
  const toLoop = D.at("toloop");
  const CLOCK = [[0, -3], [D.at("tobench"), -0.4], [D.at("tozero"), -0.4], [D.at("zero"), 0], [D.at("trigger"), 0.3]];
  const stamp = (s) => `T${s < 0 ? "−" : "+"}${Math.abs(s).toFixed(1).replace(".", ",")} s`;
  D.readout("hud-clock", (time) => stamp(time >= toLoop ? CLOCK[0][1] : along(CLOCK, time)));
  D.readout("hud-count-v", (time) => String(Math.round(100 * (time >= toLoop ? FIRST.threat : D.W.threat))));

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
