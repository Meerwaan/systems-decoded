// DOSSIER 039 — Le cendrier du réacteur. The film, assembled:
//   plan.js     where everything stands          world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js    the system, solid: the pit's sacrificial lining, the plug, the channel, the chamber, the pool, the valves
//   corium.js   the threat: the red belly, the drop, the melt in the pit, the channel, the chamber; the heat; the steam
//   batiment.js around, X-ray: 005's vessel over the pit, the basement of the reactor building; the next file's teaser
//   acte1.js    01 MENACE (accroche, promesse, scene)           acte2.js   02 AUTOPSIE (« on l'ouvre », the exploded view)
//   acte2b.js   02 AUTOPSIE (the principle, the system at rest)  acte3.js   03 RÉPONSE (the plug gives, it spreads, the water)
//   fin.js      chute, what the film owes, like, the next file, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER. Its big readout is the story's clock — as the voice says it. Before the plug gives way nothing in the
// sources dates the pit phase: the clock shows no number, only « Cuve percée » (signal). From « La porte fusible
// cède » (zero:cède) it runs from T+00:00: the spread is done by « mince » at T+00:30 (« en quelques dizaines de
// secondes », IRSN via Laponche), then « Plusieurs minutes passent » runs it to T+05:00 by « recouvre » (« après
// plusieurs minutes », same source) — illustrative inside the sourced ranges, `sources` says so.
// Its second readout, « Corium », is what the voice says of it: « > 2 000 °C » (signal) while it is liquid and dry,
// « Sous l'eau » (veille) once the water covers it (`water` ≥ 0.95). Past the loop both read the first frame's.
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
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

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
  acte2b(ctx);
  acte3(ctx);
  fin(ctx);

  // the story clock, in seconds after the plug gives way (illustrative inside the sourced ranges: see above)
  const toLoop = D.at("toloop");
  const cede = D.at("cede");
  const CLOCK = [[cede, 0], [D.at("mince"), 30], [D.at("minutes") - 0.4, 30], [D.at("recouvre"), 300]];
  const clock = $("hud-clock");
  const count = $("hud-count");
  const mmss = (s) => `T+${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  D.readout("hud-clock", (time) => {
    if (time >= toLoop || time < cede) {
      clock.style.color = SIGNAL;
      return "Cuve percée";
    }
    clock.style.color = INK;
    return mmss(along(CLOCK, time));
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const covered = W.water >= 0.95;
    count.style.color = covered ? VEILLE : SIGNAL;
    return covered ? "Sous l'eau" : "> 2 000 °C";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
