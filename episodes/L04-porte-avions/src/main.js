// DOSSIER L04 — Le pont d'envol du Charles de Gaulle (format long, 16:9). The film, assembled:
//   plan.js      the numbers every set reads (no import: the sets are built at the same time against it)
//   world.js     the sets, the state (FIRST), the camera (POSE0, VIEW, HAND), the steps of the day (STEPS), apply(), ride()
//   chapters.js  the chapter files in order — each one only writes st / shot / cut / tl calls on times read
//                off the script (D.at), and starts with its half of a seam: they do not depend on each other
// The page carries no captions: chapter cards, keywords and the header (the step, "Ton Rafale" in km/h);
// the words go in the .srt (npm run srt).
import "@kit/landscape.js"; // first: the 16:9 frame, before anything reads BRAND.W / BRAND.H
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { lineHud } from "@kit/long.js";
import { buildWorld, FIRST, POSE0, SIZE, FAR, STEPS, CARD, KEYWORDS_SKIP, LOOK, LINE_HUD } from "./world.js";
import CHAPTERS from "./chapters.js";

const $ = (id) => document.getElementById(id);

function build() {
  // LOOK (world.js): the air and the surface for the whole film; the lens is a pose number (CLOSE / SHARP), never the film's
  const stage = createStage($("stage"), { scale: SIZE, far: FAR, keySize: 2.5, air: LOOK.air, finish: LOOK.finish });
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  // `ride` (FIRST): the camera can ride your aircraft — the shots are then written around where it stands at run 0
  const D = createDirector({ stage, first: FIRST, pose0: POSE0, ride: world.ride });
  window.SD.S = D.S; // for the trial frames
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co };
  for (const chapter of CHAPTERS) chapter(ctx);

  // the header: the step of the day on the deck (ÉTAPE 03 / 10), and "Ton Rafale" (0 km/h · 240 km/h · En vol · Arrêté)
  lineHud(stage, { steps: STEPS, step: () => Math.round(D.W.etape), temp: () => (D.W.kmhOn > 0.5 ? D.W.kmh : null), ...LINE_HUD });

  // a chapter that shows something better than a keyword says so: D.quiet(from, to)
  D.commit({ long: { chapters: CARD, keywords: { skip: KEYWORDS_SKIP } } });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
