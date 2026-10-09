// DOSSIER 012 — Gazinière. The film, assembled:
//   plan.js   where everything stands             world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   hob.js    the gas hob, the saucepan boiling over, you      fire.js   the flame, the gas, the spark
//   model.js  the system: the burner, its knob, the tap, the magnet unit, the thermocouple (in the hob, on the bench)
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THIS FILM RUNS IN REAL TIME. The header's clock counts the true seconds since the flame went out (`out`), all
// through the hook, the autopsy and the subscribe call, until the valve snaps shut (`trigger`): about a minute,
// as the voice promised. Its second counter is the gas that has left the burner meanwhile, at 5 litres a minute.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
/** A big burner left open with no flame: 3 kW of natural gas at ≈ 10 kWh/m³ — 0.3 m³ an hour (a calculation, see `sources`). */
const LITRES_PER_SECOND = 5 / 60;

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

  // The clock: seconds since the flame went out, frozen when the valve shuts. Past the loop, the first frame's.
  const t = D.times({ out: "out", shut: "trigger", toloop: "toloop" });
  const since = (time) => (time >= t.toloop ? 0 : Math.min(time, t.shut)) - t.out;
  const stamp = (s) => {
    const whole = s < 0 ? Math.ceil(-s) : Math.floor(s);
    return `T${s < 0 ? "−" : "+"}${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
  };
  D.readout("hud-clock", (time) => stamp(since(time)));
  D.readout("hud-count-v", (time) => `≈ ${(Math.max(0, since(time)) * LITRES_PER_SECOND).toFixed(1).replace(".", ",")} L`);
  // the gas counter is signal while the gas runs, veille once it is shut — and signal again on the way back to the first frame
  D.tl.to("#hud-count", { color: "#5cffb0", duration: 0.2 }, t.shut);
  D.tl.to("#hud-count", { color: "#ff5b2e", duration: 0.2 }, t.toloop);

  // The gauge of act 3 (#gauge, brought in by acte3.js) reads the state: the current the tip makes.
  const fill = $("gauge-fill");
  D.readout("gauge-v", () => {
    const v = Math.min(1, Math.max(0, D.W.volts));
    fill.style.transform = `scaleX(${v.toFixed(4)})`;
    return `${Math.round(100 * v)} %`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
