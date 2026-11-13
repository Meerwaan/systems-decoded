// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier.
// DOSSIER 046 — fin (toverdict → the end), docs/046-actes.md → « fin.js ».
//   chute      a cut in, on the axis of act 3's last picture: the giant flare itself, the tip under it; one slow orbit.
//              « Géante » is struck on « géante »; on « s'éteint » the fire dies at once (pilot out: the header reads
//              ÉTEINTE), raw gas pours out of the tip and sinks — the camera goes down with it
//   comment    the tip, close, dead: « Et sa plus petite flamme ? » — it lights on « pilote » (ALLUMÉE) · « Sans elle »
//              it goes out again, and on « brûler » the raw gas pours; the camera backs away with it, down toward the
//              plant (Mexico, a fixed chip) · the duel, on the torch lit again and smoking black — never answered
//   like       the torch calm, seen through the flat's window
//   abo        the next file: the X-ray dishwasher, its arm turning at one turn in two seconds (#next) — the last thing
//              the film says
//   boucle     under the arm, the same turn · on « tourne » the cut to the first frame, rolled the way the arm turns
//              (seen from under it the arm turns clockwise on screen: the picture leaves rolled the other way and
//              turns back clockwise); D.loop brings every number back to FIRST
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, FIRST, POSE0, TIP, TEASER } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
/* chute — the flare whole and the tip under it: the tip at y ≈ 1100, the flame's top under the header; the title over
   its upper half (#title-shade carries it) */
const GIANT = { ...P, tx: -150, ty: 2380, tz: 0, d: 6000, az: -55, el: -6, fov: 40, shift: 0 };
const L_GIANT = { fx: 0, fy: 2600, fz: 0, fs: 1500 };
/* comment — the tip, close (VIEW.tip well back: at d 520–650 the tip filled the whole width; here ≈ 40 %) */
const TIPC = { ...VIEW.tip, d: 1400 };
const L_TIP = { fx: 0, fy: TIP.y1, fz: 0, fs: 150 };
// …backing away with the raw gas, down toward the plant: the tip high on the right, the gas sinking across the frame
const SINK = { ...P, tx: -700, ty: 1250, tz: -150, d: 5200, az: -52, el: 2, fov: 36, shift: -40 };
const L_SINK = { fx: -700, fy: 1100, fz: -300, fs: 2600 };
// the torch lit again, smoking black: low, the flame under the duel, its smoke behind it
const SMOKE = { ...P, tx: -120, ty: 2350, tz: 0, d: 3900, az: -38, el: -12, fov: 40, shift: -60 };
const L_SMOKE = { fx: 0, fy: 2300, fz: 0, fs: 1200 };
/* abo, boucle — the dishwasher (raffinerie.js teaser), its light on it */
const L_WASH = { fx: TEASER.at[0], fy: 42, fz: TEASER.at[2], fs: 90 };
const WASHER = { ...VIEW.washer, d: 390, shift: -210 }; // VIEW.washer a step back: the whole machine under #next (≈ 55 %)
const PANE = { ...VIEW.pane, shift: -200 }; // VIEW.pane lower: at shift 120 the torch stood behind #net
const ARM = 180; // the spray arm, degrees a second (one turn in two seconds), the same across the cut under it

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", geante: "chute:géante", out: "out",
    tocta: "tocta", pilote: "pilote", sans: "comment:Sans", sansbruler: "sansbruler", mexique: "mexique",
    morts: "comment:morts$", commentaire: "commentaire", bon: "bon", mauvais: "mauvais",
    tolike: "tolike", like: "like", likeEnd: "like$", toabo: "toabo", prochain: "next", lave: "abo:qui",
    aboEnd: "abo$", toloop: "toloop", rewind: "rewind",
  });

  /* ── CHUTE: « Voilà le secret : ce n'est pas quand elle est géante qu'il faut avoir peur. C'est quand elle s'éteint. » ── */
  cut(t.toverdict, SET.SCENE, GIANT, { ...STAGED, flare: 1, smoke: 1, mood: 1, ...L_GIANT });
  // one move, never resting: a slow orbit round the fire; on « s'éteint » it goes down with the raw gas
  D.path([
    [t.toverdict, GIANT],
    [t.out, { az: -47, d: 5700 }],
    [t.tocta, { az: -44, ty: 2000, d: 5500 }],
  ]);
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.geante + 0.1, swapAt: t.out - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  // the fire dies at once, the pilots with it (the header: ÉTEINTE); the smoke already climbing thins out
  st(t.out, 0.3, { flare: 0, pilot: 0 }, "power2.in");
  st(t.out, 1.4, { smoke: 0 }, "sine.out");
  st(t.out + 0.15, t.tocta - t.out - 0.15, { raw: 0.5 }, "sine.out");

  /* ── COMMENT 1: « Et sa plus petite flamme ? La flamme pilote, allumée jour et nuit. » ── */
  // the dead tip, close, the camera closing in; on « pilote » the pilot lights, and the purge's tiny flame with it
  cut(t.tocta, SET.SCENE, TIPC, { ...STAGED, flare: 0, pilot: 0, raw: 0, smoke: 0, mood: 1, ...L_TIP });
  shot(t.tocta, t.sans - t.tocta, { d: 1250, az: -33 }, "sine.inOut");
  st(t.pilote - 0.04, 0.35, { pilot: 1 }, "power2.out");
  st(t.pilote + 0.2, 0.5, { flare: 0.08 }, "power2.out");
  chip("chip-pilote", null, 96, 470, t.pilote, t.sans + 0.35); // (anchored on the pilot it ran off the right edge)

  /* ── COMMENT 2: « Sans elle, le gaz sort sans brûler : au Mexique, une torche éteinte, un gaz toxique, vingt-deux morts. » ── */
  // « Sans elle »: it goes out (a ghost), the tiny flame too; on « brûler » the raw gas pours, and the camera backs
  // away with it — by ratio — down toward the plant it sinks onto
  st(t.sans, 0.5, { pilot: 0, flare: 0 }, "power2.in");
  st(t.sansbruler - 0.05, 0.7, { raw: 0.45 }, "power2.out");
  st(t.sansbruler + 0.65, t.morts - t.sansbruler - 0.65, { raw: 1 }, "sine.inOut");
  shot(t.sans + 0.2, t.mexique - t.sans + 0.4, SINK, "sine.inOut", TIPC.d);
  st(t.sans + 0.2, t.mexique - t.sans, L_SINK, "sine.inOut");
  shot(t.mexique + 0.6, t.morts - t.mexique - 0.5, { az: -60, ty: 1050, d: 5600 }, "sine.inOut");
  chip("chip-mexique", null, 96, 470, t.mexique, t.commentaire - 0.25);

  /* ── COMMENT 3: « En commentaire : une torchère qui fume… bon signe, ou mauvais ? » — never answered ── */
  cut(t.morts + 0.06, SET.SCENE, SMOKE, { ...STAGED, flare: 0.6, smoke: 1, pilot: 1, raw: 0, mood: 1, ...L_SMOKE });
  shot(t.morts + 0.06, t.tolike - t.morts - 0.06, { az: -28, d: 3700 }, "sine.inOut");
  duelCall(tl, { from: t.bon - 0.5, aAt: t.bon, bAt: t.mauvais, to: t.tolike - 0.3, toneA: "veille", toneB: "signal" });

  /* ── LIKE: « Like : pour ceux qui la voient de leur fenêtre. » — the torch calm, beyond the flat's window ── */
  cut(t.tolike, SET.SCENE, PANE, { ...STAGED, pane: 1, flare: 0.45, smoke: 0.2, mood: 0, fx: 0, fy: 1600, fz: 0, fs: 2400 });
  shot(t.tolike, t.toabo - t.tolike, { d: PANE.d + 40 }, "sine.inOut"); // a step back into the room (sideways, the wall hides the torch)
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} fenêtres` });

  /* ── ABO: « Abonne-toi : prochain dossier, ton lave-vaisselle, qui lave avec moins d'eau que toi. » ── */
  const armAt = (at) => ARM * (at - t.toabo);
  cut(t.toabo, SET.SCENE, WASHER, { ...STAGED, shell: 0, teaser: 1, jets: 1, arm: 0, mood: 0, flare: 0, pilot: 0, smoke: 0, ...L_WASH });
  shot(t.toabo, t.toloop - t.toabo, { d: WASHER.d * 0.92, az: WASHER.az + 6 }, "sine.inOut");
  st(t.toabo, t.rewind - t.toabo, { arm: armAt(t.rewind) }, "none");
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.lave, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: « Et pendant qu'il tourne… » — under the arm, then the match on the rotation onto the first frame ── */
  cut(t.toloop, SET.SCENE, VIEW.washerArm, {});
  cut(t.rewind, SET.SCENE, { ...POSE0, roll: -30 }, { ...FIRST, flare: 0.2, smoke: 0.4 });
  D.loop({ at: t.rewind, rewindAt: t.rewind, ease: "sine.out" });
}
