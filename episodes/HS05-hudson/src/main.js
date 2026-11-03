// HORS-SÉRIE 05 — Hudson : the promo of the L05, vertical. The film, assembled:
//   world.js   the L05's world, as it is (no new set), the state (FIRST), the clock (PROMO_CLOCK), the portrait poses
//   acte1.js   01 MENACE    accroche → scene (the strike, 860 m, the airport behind, the engines, into the engine)
//   acte2.js   02 L'HUDSON  ouvre → hudson (the engine opens; the goose, the 1,8 kg bird; the check-list; the choice)
//   acte3.js   (02)         test (« Trente mètres » → « Et il flotte », played whole)
//   fin.js     03 RENDEZ-VOUS comment → boucle (the duel on the maquette, #film, the loop)
// Each act only writes st / now / shot / cut / tl calls on times read off the script, and starts with a cut to a
// complete state (AT.* + what differs): they do not depend on each other, only on world.js.
//
// THE HEADER OF THIS HORS-SÉRIE: the time in New York (`clockOn`), and the countdown to the river (`countOn`,
// « Il te reste 3:32 », signal; 0:00 ink) — then, on `youtube`, where the answer is (`yt`: « Réponse · Sur YouTube »).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, makeClock, FIRST, POSE0, SIZE, FAR, LOOK, CONTACT, L05_LENGTH } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const hhmmss = (t) => {
  const s = Math.max(0, Math.floor(t + 1e-6));
  return `15:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const left = (t) => {
  const s = Math.max(0, Math.ceil(CONTACT - t - 1e-6));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function build() {
  // LOOK (the L05's): the air and the surface for the whole film; the lens is a pose number (CLOSE / SHARP)
  const stage = createStage($("stage"), { scale: SIZE, far: FAR, keySize: 2.5, air: LOOK.air, finish: LOOK.finish });
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  const D = createDirector({ stage, first: FIRST, pose0: POSE0 });
  window.SD.S = D.S; // for the trial frames
  const clock = makeClock(D);
  // the world's clock reads the FILM's time (`now`), never the warped one handed to apply() below
  let now = 0;
  world.setClock(() => clock(now));
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co, clock };
  acte1(ctx);
  acte2(ctx);
  acte3(ctx);
  fin(ctx);

  // the clock: New York's time — then, on `youtube`, the long's length
  const length = `${Math.floor(L05_LENGTH / 60)} MIN ${String(L05_LENGTH % 60).padStart(2, "0")}`;
  D.readout("hud-clock", (time) => (D.W.yt > 0.5 ? `FILM · ${length}` : D.W.clockOn > 0.5 ? `NY · ${hhmmss(clock(time))}` : "NY · —"));
  // the counter: the time left before the river (signal; 0:00 ink) — then where the answer is (veille)
  const count = $("hud-count");
  D.readout("hud-count-l", () => (D.W.yt > 0.5 ? "Réponse" : "Il te reste"));
  D.readout("hud-count-v", (time) => {
    if (D.W.yt > 0.5) {
      count.style.color = "#5cffb0";
      count.style.opacity = "1";
      return "Sur YouTube";
    }
    count.style.opacity = D.W.countOn > 0.5 ? "1" : "0";
    const v = left(clock(time));
    count.style.color = v === "0:00" ? "#e9e4d8" : "#ff5b2e";
    return v;
  });

  D.commit({ hook: ["accroche", "promesse", "curiosite"] });
  // THE LOOP: the geese stream on a 4.5 s period (avion.js, PER) driven by the time; over the rewind the world's time
  // runs back so that the last frame holds the geese where the first one has them (a multiple of the period)
  const PER = 4.5;
  const rw = D.at("rewind");
  const slip = D.END % PER;
  const warp = (t) => (t <= rw ? t : t - slip * Math.min(1, (t - rw) / Math.max(0.1, D.END - rw)));
  stage.onUpdate((time) => {
    now = time;
    world.apply(D.W, warp(time));
  });
  stage.start();
  return D.tl;
}

window.SD = { build };
