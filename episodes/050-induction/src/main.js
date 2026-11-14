// DOSSIER 050 — Plaque à induction. The film, assembled:
//   plan.js    where everything stands          world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js   the hob (the system)            casserole.js  the saucepan (its heart)      cuisine.js  009's kitchen, and you
//   acte1.js   01 MENACE (hook, scene)         acte2.js   02 AUTOPSIE (bench: exploded view, the principle in section)
//   acte3.js   03 RÉPONSE (back in the kitchen: the empty zone, the lift, the H)   fin.js  chute, the calls to action, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (D.times, cues of episode.json).
import { createStage } from "@kit/stage.js";
import { createDirector, along } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 6000, keySize: 2.5, ...LOOK });
  window.SD.stage = stage;
  const world = buildWorld(stage);
  const D = createDirector({ stage, first: FIRST, pose0: POSE0 });
  window.SD.S = D.S;
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co };
  acte1(ctx);
  acte2(ctx);
  acte3(ctx);
  fin(ctx);

  // THE STORY CLOCK — seconds to the moment you lift the saucepan (T0 = « Tu soulèves »). Real time through act 1, held
  // during the autopsy (the bench is outside time), slowed through act 3 (3 s of story over 9 s of film), then a few seconds
  // after the lift: the H appears at once (the glass is still hot). Illustrative, never said: `sources` says so.
  const toLoop = D.at("toloop");
  const CLOCK = [[0, -21], [D.at("tobench"), -3], [D.at("torepos"), -3], [D.at("souleves"), 0], [D.at("trigger"), 2.5], [D.at("toverdict"), 4]];
  const stamp = (s) => (Math.abs(s) < 0.05 ? "T0" : `T${s < 0 ? "−" : "+"}${Math.abs(s).toFixed(1).replace(".", ",")} s`);
  D.readout("hud-clock", (time) => stamp(time >= toLoop ? CLOCK[0][1] : along(CLOCK, time)));
  // THE SECOND COUNTER — the hero zone's field: about 25 kHz while it is powered (`on`), 0 the instant the pan is lifted.
  // Sourced: « typiquement aux alentours de 25 kHz » (20 à 50 selon la plaque) — hence the ≈.
  D.readout("hud-count-v", (time) => ((time >= toLoop ? FIRST.on : D.W.on) > 0.5 ? "≈ 25 kHz" : "0"));

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
