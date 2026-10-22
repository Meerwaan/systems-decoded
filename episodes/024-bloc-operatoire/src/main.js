// DOSSIER 024 — Bloc opératoire. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   bloc.js    the operating room like an X-ray: the table, you asleep, the lamp, the ventilator, the surgeon, the
//              faulty appliance, the IT sockets, the alarm repeater, the IT cabinet behind the back wall
//   model.js   the system: the medical IT — isolation transformer, breakers, insulation monitor, earth bar
//   (home)     016's room reused as it is: its wall, its consumer unit and its differential (world.js)
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THIS FILM'S CLOCK IS THE OPERATION'S. The header's big readout is the time of your operation, hh:mm:ss, from
// 01:12:40 on the first frame (a scenario: the story's clock, no fact). It runs at one second per second through
// act 1; it HOLDS during the autopsy (from `tobench`: on the bench, time stands still); at `tozero` act 3 replays the
// fault, so it reads again what it read at the hook's fault (`metal`) and runs on from there. It NEVER stops in the
// story: that is the film (« rien ne coupe »). Past `toloop` it reads the seconds just before the first frame, so
// that the last frame reads 01:12:40 again. Ink; signal while the set is dark (the what-if of the scene); veille from
// `trigger` (the alarm: the system has held) to `toloop`.
// The second readout is « Défauts »: the story's count `faults` (0, 1, 2 — « ça ne marche… qu'une fois »), set by
// the acts on the words; signal from 1 up, ink at 0. Past `toloop` it reads FIRST (0).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, START } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";
const two = (n) => String(n).padStart(2, "0");
const hms = (s) => {
  const k = Math.max(0, Math.floor(s));
  return `${two(Math.floor(k / 3600))}:${two(Math.floor((k % 3600) / 60))}:${two(k % 60)}`;
};

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 12000, keySize: 2.5 });
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

  const toBench = D.at("tobench");
  const toZero = D.at("tozero");
  const metal = D.at("metal");
  const trigger = D.at("trigger");
  const toLoop = D.at("toloop");
  const end = D.tl.duration();
  // the story's seconds since the first frame, at film time `time`
  const story = (time) => {
    if (time >= toLoop) return Math.ceil(time - end); // just before the first frame: the last frame reads START
    if (time >= toZero) return metal + (time - toZero); // act 3 replays the fault: from the hook's fault on
    return Math.min(time, toBench); // act 1 runs, the autopsy holds
  };
  const clock = $("hud-clock");
  const count = $("hud-count");
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    clock.style.color = W.dark > 0.5 ? SIGNAL : time >= trigger && time < toLoop ? VEILLE : INK;
    return hms(START + story(time));
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const n = Math.round(Math.max(0, W.faults));
    count.style.color = n >= 1 ? SIGNAL : INK;
    return String(n);
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
