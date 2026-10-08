// DOSSIER 011 — Fusible pyro. The film, assembled:
//   plan.js   where everything stands             world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   car.js    the road, the wall, the car, you, the airbags      pack.js   the battery, its junction box, the cables, the order
//   model.js  the pyro fuse (the system: in the car, on the bench)
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script: they depend on world.js alone.
//
// The story clock counts MILLISECONDS from the crash: the hook plays it once through (the bags, the charge) and act 1
// rewinds it; act 3 plays it again — ten milliseconds to the control unit's decision (Bosch), then it HOLDS while the
// second counter of the header runs the fuse's own millisecond (Autoliv: 0,35 · 0,5 · 0,75 · 1), and goes on to the
// thirty the airbags take to fill. The two figures come from two makers: the film never shows their sum.
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
  const stage = createStage($("stage"), { scale: SIZE, far: 20000, fog: 0.00022, keySize: 2.5 });
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

  const t = D.times({ bags0: "bags0", boom0: "boom0", tosans: "tosans", back: "back", tofuse: "tofuse", crash: "crash", order: "order", fire: "trigger", hit: "hit", snap: "snap", out: "out", tobag: "tobag", inflate: "inflate", toverdict: "toverdict", toloop: "toloop" });
  const comma = (x, n) => x.toFixed(n).replace(".", ",");
  // the hook's run-through, the rewind (done before act 2 cuts), then act 3 (held at 10 ms while the fuse's own
  // millisecond runs; the bags are not full yet when the act ends: ≈ 26 ms)
  const rew = Math.min(t.back, t.tofuse - 0.37);
  const CRASH = [[0, 0], [t.bags0, 10], [t.boom0, 10], [rew, 10], [rew + 0.35, 0], [t.crash, 0], [t.order, 10], [t.tobag, 10], [t.toverdict, 26]];
  D.readout("hud-clock", (time) => `T+${Math.round(time >= t.toloop ? 0 : along(CRASH, time))} ms`);
  const FUSE = [[t.fire, 0], [t.fire + 0.12, 0.35], [t.hit, 0.5], [t.snap, 0.75], [t.out, 1]];
  const e = D.times({ blow: "blow", tocta: "tocta", tocomment: "tocomment" });
  D.readout("hud-count-v", (time) => {
    if (time >= t.toloop) return "prêt";
    // (the hook's run-through fires it once; "sans elle" is a car that has none)
    if (time < t.fire) return time >= t.boom0 && time < t.tosans ? "coupé · 1,00 ms" : time >= t.tosans && time < rew + 0.35 ? "absent" : "prêt";
    if (time < t.out) return `+${comma(along(FUSE, time), 2)} ms`;
    // the end: a whole fuse on the bench until it is blown on "sauter", a new one for the like and the next file, the car's own after the crash
    const whole = (time >= t.toverdict && time < e.blow) || (time >= e.tocta && time < e.tocomment);
    return whole ? "prêt" : "coupé · 1,00 ms";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
