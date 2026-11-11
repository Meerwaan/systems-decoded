// CR02 — Deepwater Horizon (Compte à rebours · 02). The film, assembled:
//   plan.js       the three maquettes, where everything stands (no import)
//   world.js      the maquettes, the state (FIRST), the camera (POSE0, VIEW), STAGED / BENCHED, apply()
//   plateforme.js · puits.js · bop.js   the maquettes (one agent each)
//   acte1.js   accroche → piege    (0 → tot1)          01 L'HEURE: the hook, the promise, how a well holds, the BOP, the trap « dix »
//   acte2.js   t1 → t3             (tot1 → tot4)       19 h 55 the test and its two dials, 21 h 08 the gas enters, 21 h 31 « vingt-deux »
//   acte2b.js  t4 → t9             (tot4 → todefaut)   21 h 40 the blowout, the annular, the VBR, the explosion, the button, the last resort
//   acte3.js   defaut → boucle     (todefaut → end)    02 LE DÉFAUT: the bent pipe, the pods; the toll, 03 DEPUIS, the question, abo, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (D.times, cues of episode.json): they do not depend
// on each other, only on world.js.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { crHud } from "@kit/reconstitution.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte2b from "./acte2b.js";
import acte3 from "./acte3.js";

const $ = (id) => document.getElementById(id);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 20000, keySize: 2.5, ...LOOK });
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

  // THE HEADER (kit/lib/reconstitution.js crHud): the real time, as the voice says it, JUMPS in the breath before each stage
  // (0.17 s before the beat, with its `clack` in episode.json → sfx). Hours: the CSB's Engineering Services simulation, ± 1 min;
  // no seconds shown (the sources do not give them). t9: the clock jumps on « Avant 21 h 58 » (cue `avant58`): a bound, not an hour.
  // issue: the dates — the rig sinks on 22 April, the well is closed on 15 July 2010 (cues `jours`, `mois`) · depuis: « 2016 ».
  // Under it, the time left until the explosion (T−0 = 21:49): « Il te reste neuf minutes » at 21:40; it fades at t8 (the countdown is over).
  const k = (beat) => D.at(beat) - 0.17;
  const CLOCK = [
    [0, "21:40"], [k("t1"), "19:55"], [k("t2"), "21:08"], [k("t3"), "21:31"], [k("t4"), "21:40"], [k("t5"), "21:43"],
    [k("t6"), "21:47"], [k("t7"), "21:49"], [k("t8"), "21:56"], [D.at("avant58") - 0.17, "21:58"],
    [D.at("jours"), "22 AVR."], [D.at("mois"), "15 JUIL."], [D.at("todepuis"), "2016"],
  ];
  const LEFT = [[0, 540], [k("t1"), 6840], [k("t2"), 2460], [k("t3"), 1080], [k("t4"), 540], [k("t5"), 360], [k("t6"), 120], [k("t7"), 0]];
  crHud(D, { clock: CLOCK, remain: { keys: LEFT, step: true } });
  D.tl.to("#hud-remain", { opacity: 0, duration: 0.2, ease: "power2.in" }, k("t8"));
  D.tl.set("#hud-remain", { opacity: 1 }, D.at("toloop"));

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
