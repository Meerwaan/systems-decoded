// CR01 — Tchernobyl (Compte à rebours · 01). The film, assembled:
//   plan.js    the four maquettes, where everything stands (no import)
//   world.js   the maquettes, the state (FIRST), the camera (POSE0, VIEW), STAGED / BENCHED, apply()
//   coeur.js · canal.js · centrale.js · salle.js   the maquettes (one agent each)
//   acte1.js   accroche → piege       (0 → t1)        L'HEURE: the hook, the promise, how it works, the trap
//   acte2.js   t1 → t3                (t1 → t4)       the test, the report, the power that falls, the rods pulled out
//   acte2b.js  t4 → t6                (t4 → defaut)   8 rods for 15, the test, AZ-5
//   acte3.js   defaut → t8            (defaut → issue) LE DÉFAUT: the master shot, 530 MW, the explosions
//   fin.js     issue → boucle         (issue → end)   the toll, DEPUIS, the question, the next one, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (D.times, cues of episode.json): they do not depend
// on each other, only on world.js.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { crHud, feutre } from "@kit/reconstitution.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte2b from "./acte2b.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

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
  fin(ctx);

  // THE HEADER (kit/lib/reconstitution.js crHud): the real time, as the voice says it, JUMPS in the breath before each stage
  // (0.17 s before the beat, with its `clack` in episode.json → sfx); under it, the time left until the press on AZ-5 (T−0 =
  // 01:23:40, WNA « Sequence of events »; 01:23:39 elsewhere — the voice says « quarante »).
  // « 01 h 22 » shows 01:22:30 (the 8-rod margin, WNA). At t8 (« Toujours 01 h 23 ») the clock drops its seconds and the
  // time left fades: the hour of the explosions is not fixed (≈ 4 to 7 s after AZ-5).
  const k = (beat) => D.at(beat) - 0.17;
  const CLOCK = [
    [0, "01:23:40"], [k("t1"), "14:00:00"], [k("t2"), "00:28:00"], [k("t3"), "01:00:00"], [k("t4"), "01:22:30"],
    [k("t5"), "01:23:04"], [k("t6"), "01:23:40"], [k("t7"), "01:23:43"], [k("t8"), "01:23"],
  ];
  const LEFT = [[0, 0], [k("t1"), 41020], [k("t2"), 3340], [k("t3"), 1420], [k("t4"), 70], [k("t5"), 36], [k("t6"), 0], [k("t7"), -3]];
  crHud(D, { clock: CLOCK, remain: { keys: LEFT, step: true } });
  // THE RED CIRCLE (V3, 05/11): the part in fault, circled in alarm red as the voice names it — the graphite displacer at `defaut`.
  // Placed by the DA pass; the act agents may move it onto their own words.
  D.tl.to("#hud-remain", { opacity: 0, duration: 0.2, ease: "power2.in" }, k("t8"));
  D.tl.set("#hud-remain", { opacity: 1 }, D.at("toloop"));

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
