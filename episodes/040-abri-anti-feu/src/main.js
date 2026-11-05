// DOSSIER 040 — L'abri anti-feu. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   crete.js   the Butte Fire's crest aux rayons X: pads, the 72 other shelters and their crews, the forest, your shovel
//   feu.js     the front, its smoke, its embers, its light — and the ten radiation rays
//   model.js   the system, solid: the shelter (four layers, the air gap, handles, straps, case), you under it, its air
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE (« on l'ouvre », the layers, the principe)
//   (acte2.js also stages the repos: folded on the bag, the glue, the clock catching up)
//   acte3.js   03 RÉPONSE    fin.js     chute, what is owed, the calls to action, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE STORY'S CLOCK, as the voice says it: `clock` (seconds from « Zéro », the front reaching you).
//   −0:25 when the scene opens, −0:20 on « Vingt secondes », frozen and dim through the autopsy, caught up on the
//   repos' last words, 0:00 on « Zéro » (signal), then the time under the shelter up to 1:30:00 on « une heure et
//   demie » (« environ » : wildfiretoday, one source; 1 to 2 h elsewhere — `sources`). The hook (a flash-forward:
//   the front passing over you) reads +0:04.
// Its second readout, « Abris », is the number of shelters deployed on the crest, 0 → 73 (Jukkala & Putnam 1986: 73
//   deployed): the rhythm at which they open is the picture's (reconstituted), the 73 is sourced. Veille at 73.
// Past the loop both read the first frame's values.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

/** −25 → « −0:25 » · 4 → « +0:04 » · 5400 → « +1:30:00 » */
export function stamp(s) {
  const a = Math.round(Math.abs(s));
  const h = Math.floor(a / 3600);
  const m = Math.floor((a % 3600) / 60);
  const sec = String(a % 60).padStart(2, "0");
  const sign = s < -0.5 ? "−" : "+";
  return h > 0 ? `${sign}${h}:${String(m).padStart(2, "0")}:${sec}` : `${sign}${m}:${sec}`;
}

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 90000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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
  const tobench = D.at("tobench");
  const caught = D.at("rattrape");
  const clock = $("hud-clock");
  const count = $("hud-count");
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const frozen = time >= tobench && time < caught; // the autopsy: the story's time stands still
    clock.style.color = W.clock <= 0.5 && !frozen ? SIGNAL : INK;
    clock.style.opacity = frozen ? 0.55 : 1;
    return stamp(W.clock);
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const n = Math.round(Math.min(73, Math.max(0, W.abris)));
    count.style.color = n >= 73 ? VEILLE : INK;
    return String(n);
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
