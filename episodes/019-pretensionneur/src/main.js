// DOSSIER 019 — Prétensionneur. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   cabine.js  011's car like an X-ray, its bumper on the wall: you at the wheel, the strap across you — solid
//   model.js   the system: the retractor — spool, strap, gas generator, turbine, torsion bar, the everyday lock and its pendulum
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, what is owed, like, next file, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THIS FILM'S CLOCK COUNTS THOUSANDTHS OF A SECOND SINCE THE CRASH, in slow motion (`ms`, a number of the state the
// acts move). Up to 20 it is the voice's own figure ("une vingtaine de millièmes de seconde": 15 to 20 ms, IRCOBI
// 2023); past 20 no source gives a time, so it is shown as an order of magnitude: rounded to ten, with "≈".
// Its second readout is THE STRAP: "Du mou" (signal: that is the threat) → "Tendue" (veille: the system has acted)
// → the force on your chest in kilos (`load`: signal while it climbs; veille once the bar gives way and holds it).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

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

  const count = $("hud-count");
  D.readout("hud-clock", () => {
    const ms = D.W.ms;
    const sign = ms < -0.5 ? "−" : "+";
    if (Math.abs(ms) <= 20.5) return `T${sign}${String(Math.round(Math.abs(ms))).padStart(2, "0")} ms`;
    return `≈ T${sign}${Math.round(Math.abs(ms) / 10) * 10} ms`;
  });
  D.readout("hud-count-v", () => {
    const kg = Math.round(D.W.load / 10) * 10;
    if (kg < 10) {
      const loose = D.W.slack > 0.5;
      count.style.color = loose ? SIGNAL : VEILLE;
      return loose ? "Du mou" : "Tendue";
    }
    count.style.color = D.W.give > 0.02 ? VEILLE : SIGNAL;
    return `≈ ${kg} kg`;
  });
  void INK;

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
