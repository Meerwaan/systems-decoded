// DOSSIER 051 — Le brise-glace. The film, assembled:
//   plan.js     where everything stands         world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js    the icebreaker (the system)     glace.js   the ice at the bow     banquise.js   the field, the trapped ship
//   acte1.js    01 MENACE (hook, scene)         acte2.js   02 AUTOPSIE (« on l'ouvre », the exploded view, the principle)
//   acte2b.js   the plain ice, and the pack closing (repos)
//   acte3.js    03 RÉPONSE (stuck; the tanks, the roll, the ram)   fin.js   chute, the three calls to action, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (D.times, cues of episode.json):
// they do not depend on each other, only on world.js.
import { createStage } from "@kit/stage.js";
import { createDirector, along } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte2b from "./acte2b.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 3000000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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

  // THE STORY'S CLOCK, as the voice tells it: the month of the trap (« ce jour-là »: Christmas 2013, the Shokalskiy;
  // the Xuelong caught from 1 January 2014), then, while the Oden rolls, the seconds of its roll (« quinze secondes »:
  // T+0 on « bord », T+15 s as the voice says it, held), the month again, and January for the six days of the comment.
  // Past the loop, the first frame's.
  const at = { reponse: D.at("reponse"), bord: D.at("rollFrom"), quinze: D.at("rollTo"), toverdict: D.at("toverdict"), tocta: D.at("tocta"), toloop: D.at("toloop") };
  const ROLL = [[at.bord, 0], [at.quinze, 15]];
  D.readout("hud-clock", (time) => {
    if (time >= at.toloop || time < at.reponse || (time >= at.toverdict && time < at.tocta)) return "Déc. 2013";
    if (time >= at.tocta) return "Janv. 2014";
    return `T+${Math.round(along(ROLL, time))} s`;
  });
  // the second counter: how far the trapped ship lies from the icebreaker — ≈ 6 nmi (sourced): it does not shrink
  D.readout("hud-count-v", () => "11 km");
  // the comment's six days (chip-jours)
  D.readout("chip-jours-v", () => String(Math.round(D.W.days)));

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
