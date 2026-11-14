// CR04 — Lac-Mégantic (Compte à rebours · 04). The film, assembled:
//   plan.js       the maquettes, where everything stands (no import): the slope, the track, the train, the parts, the forces
//   world.js      the state (FIRST), the camera (POSE0, VIEW, AT, onLoco, onTrack, lookFrom), STAGED / BENCHED, apply()
//   locomotive.js · convoi.js · ville.js   the maquettes (one agent each)
//   acte1.js   accroche → seuil     (0 → tot1)           0:58 the train leaves alone; 23:58 the engine cut; how the air holds; 66 t
//   acte2.js   t1 → t2              (tot1 → tot3)        22:49 parked at Nantes, seven hand brakes; 23:03 the test « réussi »
//   acte2b.js  t3 → t5              (tot3 → tozero)      23:40 the fire; 23:58 the engine cut, the compressor stops; 0:05 the leak
//   acte2c.js  t6 → defaut          (tozero → tot7)      0:58 it leaves; 02 LE DÉFAUT: the test held on the air, the seven = a third
//   acte3.js   t7 → issue           (tot7 → todepuis)    1:15 Lac-Mégantic at 105, the « 16 » of rue Frontenac; the derailment
//   fin.js     depuis → boucle      (todepuis → end)     03 DEPUIS: two on board, the test; the question, abo, the loop
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

  // THE HEADER (kit/lib/reconstitution.js crHud): the real time (local, Québec: the BST's times, tableau 1 and annexe A), hours and
  // minutes only — the voice says no seconds. Each stage OPENS on its hour: the clock jumps 0.24 s before the beat, IN THE BREATH
  // before the hour is said (every stage has 0.37 to 0.53 s of it; a clack can sit there). 00:58 on the first frame (« Zéro heure
  // cinquante-huit », the departure); back to 23:58 in the breath after « plus tôt » (`recule`); 22:49 → 23:03 → 23:40 → 23:58 →
  // 00:05 → 00:44 (in the breath before « Vers ») → 00:58 → 01:15; it stays on 01:15 through the issue (« l'horloge s'arrête »);
  // « 2013 » at `todepuis`. Under it, the time left until the departure (00:58:21, T−0): T−0 s on the first frame, T−59 min 39 s
  // from `recule` (23:58:42), then with each hour; it fades at `toverdict` (the count is over) and comes back at `toloop`.
  const k = (beat) => D.at(beat) - 0.24;
  const CLOCK = [
    [0, "00:58"], [D.at("recule"), "23:58"], [k("t1"), "22:49"], [k("t2"), "23:03"], [k("t3"), "23:40"], [k("t4"), "23:58"],
    [k("t5"), "00:05"], [D.at("onzequarante"), "00:44"], [k("t6"), "00:58"], [k("t7"), "01:15"], [D.at("todepuis"), "2013"],
  ];
  const LEFT = [
    [0, 0], [D.at("recule"), 3579], [k("t1"), 7724], [k("t2"), 6873], [k("t3"), 4701], [k("t4"), 3579], [k("t5"), 3146],
    [D.at("onzequarante"), 861], [k("t6"), 0],
  ];
  crHud(D, { clock: CLOCK, remain: { keys: LEFT, step: true } });
  D.tl.to("#hud-remain", { opacity: 0, duration: 0.25, ease: "power2.in" }, D.at("toverdict"));
  D.tl.set("#hud-remain", { opacity: 1 }, D.at("toloop"));

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
