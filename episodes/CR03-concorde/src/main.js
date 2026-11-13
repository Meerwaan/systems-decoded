// CR03 — Concorde (Compte à rebours · 03). The film, assembled:
//   plan.js       the maquettes, where everything stands (no import)
//   world.js      the maquettes, the state (FIRST), the camera (POSE0, VIEW, AT, onPlane), STAGED / BENCHED, apply()
//   concorde.js · piste.js · reservoir.js   the maquettes (one agent each)
//   acte1.js   accroche → principe   (0 → toreservoir)        16:43:13 the fire, « 78 secondes », the V1 rule
//   acte2.js   reservoir → t2        (toreservoir → tot3)     the tanks and « 4 kilos », 16:42:31 the top and the strip, 16:43:03 V1
//   acte2b.js  t3 → t5               (tot3 → tot6)            16:43:10 the tyre bursts, 16:43:13 the fire « 60 kilos », 16:43:22 engine 2
//   acte2c.js  t6 → issue            (tot6 → todefaut)        16:43:56 the gear, 16:44:00 Le Bourget, 16:44:29 the fall, 16:44:31
//   acte3.js   defaut → preuve       (todefaut → todepuis)    02 LE DÉFAUT: the tank in section, the wave, the panel; the proof
//   fin.js     depuis → boucle       (todepuis → end)         03 DEPUIS: Kevlar, the inspections; the question, abo, the loop
// Each act only writes st / shot / path / cut / chip / tl calls on times read off the script (D.times, cues of episode.json): they do
// not depend on each other, only on world.js.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { crHud } from "@kit/reconstitution.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte2b from "./acte2b.js";
import acte2c from "./acte2c.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 90000, keySize: 2.5, ...LOOK });
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  const D = createDirector({ stage, first: FIRST, pose0: POSE0 });
  window.SD.S = D.S; // for the trial frames
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co };
  acte1(ctx);
  acte2(ctx);
  acte2b(ctx);
  acte2c(ctx);
  acte3(ctx);
  fin(ctx);

  // THE HEADER (kit/lib/reconstitution.js crHud): the real time (LOCAL, UTC + 2: the CVR's times + 2 h), with its seconds — the voice
  // says them. Each stage OPENS on its hour, said without a breath before it: the clock jumps 0.08 s before the beat, on the first
  // syllable (no `clack` there: it would fall on a word — the monteur-son decides). Before t1 it shows the accroche's instant, 16:43:13
  // (« des flammes derrière vous »). At `todepuis` « 2001 ». Under it, the time left until the end of the recording (T−0 = 16:44:31):
  // « Il te reste 78 secondes » at 16:43:13; T−0 s at the issue, then it fades at `todefaut` (the count is over).
  const k = (beat) => D.at(beat) - 0.08;
  const CLOCK = [
    [0, "16:43:13"], [k("t1"), "16:42:31"], [k("t2"), "16:43:03"], [k("t3"), "16:43:10"], [k("t4"), "16:43:13"],
    [k("t5"), "16:43:22"], [k("t6"), "16:43:56"], [k("t7"), "16:44:00"], [k("t8"), "16:44:29"], [k("issue"), "16:44:31"],
    [D.at("todepuis"), "2001"],
  ];
  const LEFT = [[0, 78], [k("t1"), 120], [k("t2"), 88], [k("t3"), 81], [k("t4"), 78], [k("t5"), 69], [k("t6"), 35], [k("t7"), 31], [k("t8"), 2], [k("issue"), 0]];
  crHud(D, { clock: CLOCK, remain: { keys: LEFT, step: true } });
  D.tl.to("#hud-remain", { opacity: 0, duration: 0.25, ease: "power2.in" }, D.at("todefaut"));
  D.tl.set("#hud-remain", { opacity: 1 }, D.at("toloop"));

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
