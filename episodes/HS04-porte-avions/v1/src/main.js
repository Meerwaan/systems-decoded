// HORS-SÉRIE 04 — Porte-avions : the promo of the L04, vertical. The film, assembled:
//   world.js   the L04's world, as it is (no new set), the state (FIRST), the portrait poses (POSE0, VIEW)
//   acte1.js   01 MENACE       accroche → scene (the ABC at the catapult, the scene, down under your wheels)
//   acte2.js   02 LA CATAPULTE ouvre → reacteurs (the catapult opens; the steam, from the receiver to the reactors)
//   acte3.js   (02)            tient → test (the piece holds; « Paré feu », the valve, the pressure… black)
//   fin.js     03 RENDEZ-VOUS  comment → boucle (the duel, #film, the loop)
// Each act only writes st / now / shot / cut / tl calls on times read off the script, and starts with a cut to a
// complete state (AT.* + what differs): they do not depend on each other, only on world.js.
//
// THE HEADER OF A HORS-SÉRIE. Its clock says WHERE IN THE FILM the shot on screen lives (`l04`, seconds of the L04:
// « FILM · 02:42 »). Its counter counts the OPEN THREADS (`fils`, signal), then, on `youtube`, says where the answers
// are (`yt`: « Réponses · Sur YouTube », veille).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, FAR, LOOK, L04_LENGTH } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: FAR, keySize: 2.5, ...LOOK });
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

  // the clock: the instant of the L04 on screen
  const length = `${Math.floor(L04_LENGTH / 60)} MIN ${String(L04_LENGTH % 60).padStart(2, "0")}`;
  D.readout("hud-clock", () => (D.W.l04 < 0 ? `FILM · ${length}` : `FILM · ${mmss(Math.max(0, D.W.l04))}`));
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
