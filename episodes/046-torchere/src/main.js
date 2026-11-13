// DOSSIER 046 — Torchère. The film, assembled:
//   plan.js        where everything stands (a maquette)      world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js       the system: the flare network, solid     flamme.js  the flare, its smoke, the pilot, the raw gas, the rain of fire
//   raffinerie.js  the refinery X-ray, the compressor, the ghosts, the flat's window, the next file's dishwasher
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE (« on l'ouvre », the exploded view, the principle, the rest)
//   acte3.js   03 RÉPONSE    fin.js     chute, the calls to action, the next file (047), the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE STORY'S CLOCK, as the voice tells it (docs/faits/046-torchere.md: the fault at 16 h 30, the
// compressor restarted at 17 h 00 — Fos-sur-Mer, ARIA 50272, never named on screen):
//   · the hook is the instant the flare lights — the clock reads it, a few seconds past 16:30
//   · the scene goes back « quelques secondes avant »: 16:30:00 lands on « coupe » (cue `fault`) and runs
//   · « Alors… on l'ouvre » freezes it (tobench → tozero); act 3 takes it up where it stopped: it reaches the hook's
//     instant on « l'allume » (cue `trigger`)
//   · « Une demi-heure plus tard » (cue `later`): 17:00:00, and it runs
//   · past the loop, the first frame's
// The second readout is the pilot flame — the system the film is about: ALLUMÉE (veille) / ÉTEINTE (signal), read off
// the state (`pilot`). Sourced: « flamme pilote allumée en permanence » (IChemE Hazards 25).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";
const H = (h, m, s) => h * 3600 + m * 60 + s;
const hms = (x) => {
  const s = Math.floor(x);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
};

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

  // the story's clock, key by key (see the head of this file)
  const at = { toscene: D.at("toscene"), fault: D.at("fault"), tobench: D.at("tobench"), tozero: D.at("tozero"), trigger: D.at("trigger"), later: D.at("later"), toloop: D.at("toloop") };
  const T0 = H(16, 30, 0);
  const frozen = T0 + (at.tobench - at.fault); // where « on l'ouvre » stops it
  const lit = frozen + (at.trigger - at.tozero); // the instant the pilot lights the flare
  const hook0 = lit - 1.2; // the first frame: just before the flare is at its biggest
  const story = (time) => {
    if (time >= at.toloop || time < at.toscene) return hook0 + (time >= at.toloop ? 0 : time);
    if (time < at.tobench) return T0 + (time - at.fault);
    if (time < at.tozero) return frozen;
    if (time < at.later) return frozen + (time - at.tozero);
    return H(17, 0, 0) + (time - at.later);
  };
  D.readout("hud-clock", (time) => hms(story(time)));
  const count = $("hud-count");
  D.readout("hud-count-v", (time) => {
    const on = (time >= at.toloop ? FIRST : D.W).pilot >= 0.3;
    count.style.color = on ? VEILLE : SIGNAL;
    return on ? "Allumée" : "Éteinte";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
