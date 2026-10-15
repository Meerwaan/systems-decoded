// DOSSIER 023 — Éolienne de secours. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   avion.js   the A330 like an X-ray over the Atlantic, the sea, the island and its runway, you at a window
//   model.js   the system: the RAT — door, arm and spring, two-bladed propeller, pump, the three lines
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THIS FILM'S CLOCK IS AN ALTIMETER. The header's big readout is `alt`, in true metres, rounded to the hundred:
// 10 500 at the hook (FL 345 in the report; the voice says « dix mille mètres »), held while the story is told,
// 10 500 again on « Six heures vingt-six », then down to 0 through « Dix-neuf minutes de plané » — the values in
// between are illustrative, the two ends are sourced. Signal while the plane comes down without a way to land
// (`mood` 1), veille once the runway is there (`mood` 0). The second readout counts the engines that run, « 0 / 2 »:
// signal below 2. It is the hook in one glance — and « Le second moteur s'éteint » turns it from 1 to 0 on the word.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 180000, keySize: 2.5 });
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
    const m = Math.max(0, Math.round(D.W.alt / 100) * 100);
    clock.style.color = D.W.mood > 0.5 ? (D.W.engines < 0.5 ? SIGNAL : INK) : VEILLE;
    return `${m.toLocaleString("fr-FR").replace(/\s/g, " ")} m`;
  });
  D.readout("hud-count-v", () => {
    const n = Math.round(Math.max(0, Math.min(2, D.W.engines)));
    count.style.color = n < 2 ? SIGNAL : INK;
    return `${n} / 2`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
