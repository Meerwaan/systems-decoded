// DOSSIER 030 — Prise de terre. The film, assembled:
//   plan.js      where everything stands       world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   buanderie.js the laundry room (X-ray)      model.js   the system: the earthing chain, in place and on the bench
//   acte1.js     01 MENACE (hook, scene)       acte2.js   02 AUTOPSIE (bench, the chain opened, the threshold)
//   acte3.js     03 RÉPONSE (without the wire, then replayed with it)   fin.js   chute, the three calls, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (D.times, cues of episode.json):
// they do not depend on each other, only on world.js.
//
// THE HEADER. The big clock is the story's time of day (a scenario: 21:47:12 on the first frame), one second per second
// through act 1; it HOLDS on the bench (the autopsy stops time); at `tozero` (« on rejoue la scène ») it reads the
// scene again from just before your hand reaches the lid (REPLAY), and at `trigger` (« On rejoue, avec le fil ») it
// rewinds to that same second once more — the film replays, the clock says so. Past `toloop` it reads the seconds just
// before the first frame: the last frame reads 21:47:12 again. Ink; signal while the current goes through you
// (`body`); veille from the second cut (`coupe2`, « Il coupe… avant ta main ») to `toloop`.
// The second readout is « Carcasse »: what the casing is at, from the state — « 230 VOLTS » (signal) while it is live
// and the fault has no path (the voice's figure, « tout le métal est à 230 volts »), « VERS LA TERRE » (veille) while
// it is live and the fault current takes the earth (`leak`: no figure — it is lower than 230, and not sourced), and
// « 0 VOLT » (ink) once it is not live. Past `toloop` it reads FIRST.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, START, VOLTS } from "./world.js";
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
  const stage = createStage($("stage"), { scale: SIZE, far: 12000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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
  const trigger = D.at("trigger");
  const coupe2 = D.at("coupe2");
  const toLoop = D.at("toloop");
  const REPLAY = D.at("main") - 1; // the story's second the replays start from: just before your hand reaches the lid
  const end = D.tl.duration();
  // the story's seconds since the first frame, at film time `time`
  // a 30 mA RCD trips in tens of milliseconds: the clock holds while the voice stretches those instants, then runs on
  const held = (s, a, b) => (s < a ? s : s < b ? a : s - (b - a));
  const story = (time) => {
    if (time >= toLoop) return Math.ceil(time - end); // just before the first frame: the last frame reads START
    if (time >= trigger) return REPLAY + held(time - trigger, D.at("file") - trigger, coupe2 - trigger); // « On rejoue, avec le fil »
    if (time >= toZero) return REPLAY + held(time - toZero, D.at("ztouche") - toZero, D.at("coupe1") - toZero); // « on rejoue la scène »: without the wire
    return Math.min(time, toBench); // act 1 runs, the autopsy holds
  };
  const clock = $("hud-clock");
  const count = $("hud-count");
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    clock.style.color = W.body > 0.3 ? SIGNAL : time >= coupe2 && time < toLoop ? VEILLE : INK;
    return hms(START + story(time));
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    if (W.live > 0.5) {
      const earthed = W.leak > 0.5 && W.chain > 0.5;
      count.style.color = earthed ? VEILLE : SIGNAL;
      return earthed ? "Vers la terre" : `${VOLTS} volts`;
    }
    count.style.color = INK;
    return "0 volt";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
