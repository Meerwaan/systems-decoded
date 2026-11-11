// DOSSIER 041 — Le bouclier de l'ISS. The film, assembled:
//   plan.js     where everything stands          world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   whipple.js  the system, solid: the coupon of stuffed Whipple shield, the bille, the impact, the counter-example plate
//   station.js  around, X-ray: the ISS, the sleeper and the crew, the capsules, the dodge, Kosmos 1408, the next file's tank
//   (026/sky.js the Earth from orbit, reused as it is)
//   acte1.js    01 MENACE (accroche, promesse, scene)              acte2.js   02 AUTOPSIE (« on l'ouvre », the exploded view)
//   acte2b.js   02 AUTOPSIE (the principle, the shield at rest)     acte3.js   03 RÉPONSE (contact, the cloud, the wall holds)
//   fin.js      chute, what the film owes, like, the next file, the loop
// Each act only writes st / shot / path / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER. Its big readout is the story's clock, at the speed the voice gives (10 km/s, 1 cm ≈ 1 µs): before the
// contact, the time the bille has left for the distance the picture shows (`dist`, « T−340 µs » on the first frame);
// frozen and dimmed while the film is on the bench (the voice has stopped time: « même seconde »), at the value act 3
// cuts back with (STAGED.dist); from « Contact » (zero:Contact) the time the cloud takes across the ten centimetres
// (`burst`, T+0 → T+12 µs) — a reconstitution, `sources` says so. In the comment, the date the voice gives (« En 2021 »):
// 15/11/2021 (faits § 9). Its second readout, « Débris », is what the voice says of it: « 1 cm » (signal, sourced: what
// the shield stops); « Arrêté » (veille) once the wall holds (`trigger`); « > 1 500 » (signal) from « morceaux suivis »
// to the like. Past the loop both read the first frame's.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, STAGED } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte2b from "./acte2b.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/** cm left at 10 km/s → the countdown: µs below a millisecond, ms above (French decimal comma). */
const countdown = (dist) => {
  const us = Math.max(0, dist); // 1 cm at 10 km/s = 1 µs
  if (us >= 1000) return `T−${(us / 1000).toFixed(2).replace(".", ",")} ms`;
  return `T−${Math.round(us)} µs`;
};

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 90000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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

  const toBench = D.at("tobench");
  const toZero = D.at("tozero");
  const contact = D.at("contact");
  const held = D.at("trigger");
  const year = D.at("annee") - 0.1;
  const like = D.at("like") - 0.12;
  const pieces = D.at("morceaux") - 0.6; // « 1 500 », just before « morceaux »
  const toLoop = D.at("toloop");
  const clock = $("hud-clock");
  const count = $("hud-count");
  D.readout("hud-clock", (time) => {
    if (time >= toLoop || time < toBench) {
      clock.style.color = SIGNAL;
      clock.style.opacity = 1;
      return countdown((time >= toLoop ? FIRST : D.W).dist);
    }
    if (time < contact) {
      // the voice has stopped time: frozen at the instant act 3 comes back to, dimmed on the bench
      clock.style.color = SIGNAL;
      clock.style.opacity = time < toZero ? 0.55 : 1;
      return countdown(time < toZero ? STAGED.dist : D.W.dist);
    }
    clock.style.opacity = 1;
    if (time >= year && time < like) {
      clock.style.color = INK;
      return "15/11/2021";
    }
    clock.style.color = time >= held ? VEILLE : SIGNAL;
    return `T+${Math.round(12 * clamp01((D.W.burst - 0.1) / 0.9))} µs`;
  });
  D.readout("hud-count-v", (time) => {
    const late = time >= toLoop;
    if (!late && time >= pieces && time < like) {
      count.style.color = SIGNAL;
      return "> 1 500";
    }
    const stopped = !late && time >= held;
    count.style.color = stopped ? VEILLE : SIGNAL;
    return stopped ? "Arrêté" : "1 cm";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
