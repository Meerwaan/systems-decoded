// DOSSIER 035 — Passage à niveau. The film, assembled:
//   plan.js     where everything stands (two frames: the car's, the crossing's)
//   world.js    the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   passage.js  the crossing at night: 025's road and car, 021's TGV, the tracks, the queue, the phone (X-ray)
//   model.js    the system: the G2 signal — mast, R24, bell, housing, the boom (solid, built four times)
//   acte1.js    01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js     chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE CROSSING'S STORY. Its big readout, « Feux +8 s », is T: the story's seconds since the R24s lit
// (`clock`, moved by the acts: it runs in act 1, freezes in act 2, runs again in act 3 up to the train at T ≈ 22 —
// illustrative, `sources` says so: the decree gives « vingt secondes au moins », nothing finer). Its second readout,
// « Barrières », counts the half-barriers down out of four (world.js loweredOf): ink while they come down, signal at
// 4/4 (you are shut in), veille at 3/4 once the hero boom has given (your way out is open).
// Past the loop both read the first frame's values (D.loop slides the state back).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, loweredOf } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 160000, keySize: 2.5, ...LOOK }); // far: the TGV's lamps 800 m up the track
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

  const toLoop = D.at("toloop");
  const count = $("hud-count");
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    return `Feux +${Math.max(0, Math.floor(W.clock))} s`;
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const n = loweredOf(W);
    count.style.color = n === 4 ? SIGNAL : n === 3 && W.give > 0.5 ? VEILLE : INK;
    return `${n}/4`;
  });
  // the « repos » chip: the twenty seconds counting down on the maquette
  D.readout("chip-annonce-v", () => `${Math.max(0, Math.ceil(D.W.annonce))}`);

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
