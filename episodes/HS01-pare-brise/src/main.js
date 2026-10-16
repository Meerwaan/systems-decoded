// HORS-SÉRIE 01 — Ton pare-brise : the promo of the L01, vertical. The film, assembled:
//   world.js   the L01's world, as it is (no new set), the state (FIRST), the portrait poses (POSE0, VIEW)
//   acte1.js   01 MENACE      accroche → curiosite (the ABC, in the car)
//   acte2.js   02 L'USINE     lancement → bande (the line: the furnace, the tin bath, the black band)
//   acte3.js   (02 L'USINE)   flacon → tete (1903, the stamp, the side window that bursts, the 10 kg head — cut before)
//   fin.js     03 RENDEZ-VOUS ouvre → boucle (the gag « Alors… on l'ouvre. Pas ici. », #film, the loop)
// Each act only writes st / now / shot / cut / tl calls on times read off the script, and starts with a cut to a
// complete state (AT.* + what differs): they do not depend on each other, only on world.js.
//
// THE HEADER OF A HORS-SÉRIE. Its clock is not a story clock: it says WHERE IN THE FILM the shot on screen lives
// (`l01`, seconds of the L01: « FILM · 01:31 ») — the viewer knows where to find it. Its counter counts the OPEN
// THREADS (`fils`, signal, 0 → 7), then, on `youtube`, says where the answers are (`yt`: « Réponses · Sur YouTube »,
// veille).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, FAR, L01_LENGTH } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: FAR, keySize: 2.5 });
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

  // the clock: the instant of the L01 on screen
  const length = `${Math.floor(L01_LENGTH / 60)} MIN ${String(L01_LENGTH % 60).padStart(2, "0")}`;
  D.readout("hud-clock", () => (D.W.l01 < 0 ? `FILM · ${length}` : `FILM · ${mmss(Math.max(0, D.W.l01))}`));
  // the counter: the open threads (signal), then where their answers are (veille)
  const count = $("hud-count");
  D.readout("hud-count-l", () => (D.W.yt > 0.5 ? "Réponses" : "Fils ouverts"));
  D.readout("hud-count-v", () => {
    const yt = D.W.yt > 0.5;
    count.style.color = yt ? "#5cffb0" : "#ff5b2e";
    return yt ? "Sur YouTube" : String(Math.max(0, Math.round(D.W.fils)));
  });

  D.commit({ hook: ["accroche", "promesse", "curiosite"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
