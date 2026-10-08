// DOSSIER 009 — Micro-ondes. The film, assembled:
//   plan.js     where everything stands          world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   kitchen.js  the kitchen, you                 model.js   the oven and its door (the system: in the kitchen, on the bench)
//   waves.js    the microwaves: the field in the cavity, the wave against the holes, the light that gets out
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script: they depend on world.js alone.
//
// The story clock: the film opens two seconds before you pull the handle and stops one second before; act 3 starts
// it again — and from the instant the latch lets go it counts in MICROSECONDS, to the ten the field takes to die.
// The second counter of the header is the microwave power in the cavity: a thousand watts, then nothing.
import { createStage } from "@kit/stage.js";
import { createDirector, along } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 6000, keySize: 2.5 });
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

  const t = D.times({ said: "accroche$", tozero: "tozero", lift: "lift", cut: "trigger", tocomment: "tocomment", toloop: "toloop" });
  const SECONDS = [[0, -2], [t.said, -1], [t.tozero, -1], [t.lift, 0]];
  const MICRO = [[t.lift, 0], [t.cut, 10]];
  const comma = (x, n) => x.toFixed(n).replace(".", ",");
  D.readout("hud-clock", (time) => {
    if (time >= t.tocomment) return "T−2,0 s"; // the comment's oven runs again: the story is back before the door
    if (time < t.lift) return `T−${comma(-along(SECONDS, time), 1)} s`;
    return `T+${Math.round(along(MICRO, time))} µs`;
  });
  // (a thousand watts or nothing: the field dies in ten microseconds — the film never shows a figure in between)
  const heating = (time) => time >= t.toloop || D.W.power >= 0.5;
  D.readout("hud-count-v", (time) => (heating(time) ? "1 000 W" : "0 W"));
  const count = $("hud-count");
  stage.onProject((time) => {
    count.style.color = heating(time) ? "#ff5b2e" : "#5cffb0";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
