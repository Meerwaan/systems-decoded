// DOSSIER 010 — Scie sur table. The film, assembled:
//   plan.js   where everything stands             world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   shop.js   the saw's cabinet and table, the board, you
//   model.js  the blade, its arbor block and the brake cartridge (the system: in the saw, on the bench)
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script: they depend on world.js alone.
//
// The story clock: the film opens four tenths of a second before your finger meets the teeth, and stops on the
// contact (T+0,0 ms). Act 3 starts it again, in MILLISECONDS: under five to the blade stopped, about fourteen to
// the blade under the table. The second counter of the header is the blade's speed: 100 %, then nothing.
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

  const t = D.times({ touch: "touch", tosans: "tosans", back: "back", zero: "trigger", burn: "burn", bite: "bite", stop: "stop", dive: "dive", toyou: "toyou", tocomment: "tocomment", snap: "snap", toloop: "toloop" });
  const comma = (x, n) => x.toFixed(n).replace(".", ",");
  // milliseconds since the contact (act 3): the wire, the block in the teeth, the blade stopped (under five), the blade under the table (about fourteen)
  const MS = [[t.zero, 0], [t.burn, 0.5], [t.bite, 3], [t.stop, 4.8], [t.dive, 6], [t.toyou - 0.3, 14]];
  D.readout("hud-clock", (time) => {
    if (time >= t.toloop) return "T−0,40 s";
    if (time >= t.snap) return "T+14 ms"; // the inventor's own finger, at real speed: the blade is already under the table
    if (time >= t.tocomment) return `T−${comma(t.snap - time, 1)} s`;
    if (time < t.touch) return `T−${comma(0.4 * (1 - time / t.touch), 2)} s`;
    if (time >= t.tosans && time < t.back) return `T+${comma(time - t.tosans, 1)} s`; // an ordinary saw: time does not stop
    const ms = time < t.zero ? 0 : along(MS, time);
    return `T+${ms >= 9.95 ? Math.round(ms) : comma(ms, 1)} ms`;
  });
  const SPEED = [[t.bite, 100], [t.stop, 0]];
  const speed = (time) => (time >= t.toloop || time < t.bite || (time >= t.tocomment && time < t.snap) ? 100 : time >= t.snap ? 0 : along(SPEED, time));
  D.readout("hud-count-v", (time) => `${Math.round(speed(time))} %`);

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
