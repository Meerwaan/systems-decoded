// 01 · MENACE — from the first frame to « Alors… » (0 → ouvre 21,82). Five shots, all in the sky:
//
// THE HOOK (POSE0 / FIRST: behind your fin, the other plane head-on at the end of your nose). It moves by its
// subject from frame 1: the other plane rushes in (`gap` 250 → 140 in a straight line), a ring leaves your crown
// antenna toward it every second; the lens only closes a little (fov 34 → 32). « Ta machine dit : monte » → the
// order of your machine enters the top slot (veille); « Le contrôleur : descends » → the controller's wave rises
// from the ground and reaches you ON « descends », the controller's order (signal) beside the first, a punch.
// HIS SCREENS (a cut, the match is the other plane: we are now in its deck). « En face, sa machine » on his ND — the
// red square is you; a cut on « lui dit » to his vertical speed scale; on « descends » its green arc flips down. The gap is held: the camera rides in his deck.
// THE CHOICE (a cut, back behind you, higher: your whole back, the rings leaving it, him ahead). « Une seule réponse
// te garde en vie » — the camera comes down toward your level while he grows; « Toi, tu obéis à qui ? » the two
// orders again, side by side over you, and « Toi » on your plane.
// THE SCENE (a cut, at your level through a long lens: your fin cuts his nose in two — « Même altitude, nuit
// noire »). The header leaves the hook's 35 and counts down in real time toward the word « 35 ». A cut over the
// captain's shoulder: his lights grow in the windscreen; « 35 » → the count lands on 35,0 and turns signal;
// « cinq » → « Pour obéir » 5,0. On « Sur ton écran » the camera dives into your ND (by ratio): the symbol turns
// to the TA circle, then to the red square ON « carré », punch on « rouge ». Act 2 pulls back from VIEW.nd.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, FIRST, POSE0, atHim } from "./world.js";

/* ── the poses ── */
// the hook, its lens closing a little (the subject does the move)
const HOOK_END = { ...POSE0, fov: 32 };
// his deck: the gap is held while the camera rides in it (written for gap 0, placed where he stands)
const HIS = { gap: 140, up: 0, down: 0 };
const HIS_ND = atHim({ ...VIEW.hisNd, d: 66 }, HIS);
const HIS_ND_IN = atHim(VIEW.hisNd, HIS);
// his vertical speed scale: VIEW.vsi turned half round (his deck is yours turned about y)
const HIS_VSI0 = atHim({ ...VIEW.vsi, d: 68, tx: VIEW.hisNd.tx, tz: -VIEW.vsi.tz, az: VIEW.vsi.az - 180 }, HIS);
const HIS_VSI = atHim({ ...VIEW.vsi, d: 60, tx: VIEW.hisNd.tx, tz: -VIEW.vsi.tz, az: VIEW.vsi.az - 180 }, HIS);
// your flight deck like an X-ray, from ahead and above (cockpit.js's journal): the two pilots of glass in their
// seats, the processor lit in the bay under them — then closer on the captain: you
const CHOICE0 = { ...VIEW.fuselage, tx: -2600, ty: 10, tz: 0, d: 720, az: -50, el: 28, fov: 30, shift: 60 };
const CHOICE1 = { ...CHOICE0, tx: -2580, ty: 20, tz: 30, d: 560, shift: -30 }; // his head under the orders
// at your level, a long lens: the two planes on one line
const LEVEL0 = { ...VIEW.chase, d: 45000, az: 89.7, el: 0.3, fov: 22 }; // a hair off the axis: your fin beside his nose
const LEVEL1 = { ...LEVEL0, fov: 20.5 };
// the scene, one image a sentence (retouche 30/10): over the captain's shoulder, a push while his lights grow; his
// face on the hook's axis, closer (« 35 secondes »); your hand on the stick (« cinq pour obéir »); a CUT to your ND
const SHOULDER0 = { ...VIEW.shoulder, d: 250, fov: 42, shift: -200, side: 100 }; // his lights up in the windscreen, the shoulder at the edge
const SHOULDER1 = { ...VIEW.shoulder, d: 232, fov: 34, shift: -340, side: 150 };
const FACE0 = { ...POSE0, fov: 28 };
const FACE1 = { ...POSE0, fov: 25 };
const STICK0 = { ...VIEW.stick, d: 92 };
const ND_IN = { ...VIEW.nd, d: 80 };

export default function acte1({ D, world }) {
  const { tl, st, shot, cut, chip, panel } = D;
  const t = D.times({
    atcFrom: "accroche:contrôleur", monte: "hkMonte", atc: "hkAtc",
    promesse: "promesse", lui: "promesse:lui", hisDown: "prDescends", une: "promesse:une", toi: "promesse:toi", qui: "prQui",
    scene: "scene", ses: "scene:ses", feux: "scFeux", sc35: "sc35", cinq: "scCinq",
    il: "scene:il", dont: "scene:dont", sur: "scene:sur", vire: "scene:vire", carre: "scene:carré", rouge: "scRouge", ouvre: "ouvre",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });
  // (#orders has no `position` in index.html: placed here in the top slot until the page says it — see the journal)
  tl.set("#orders", { position: "absolute", left: 72, top: 470 }, 0);

  /* ── the hook: the other plane rushes in ── */
  shot(0, t.promesse - 0.1, HOOK_END, "sine.out");
  // it comes in fast from frame 1, then less (three straight lines, one after the other: an ease-out that never stops)
  st(0, 0.9, { gap: 196 }, "none");
  st(0.9, 1.5, { gap: 168 }, "none");
  st(2.4, t.promesse - 0.1 - 2.4, { gap: 140 }, "none");
  // the two orders, one on its word, then the other
  panel("#orders", t.monte - 0.06, t.promesse - 0.36);
  tl.fromTo("#order-atc", { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power2.out" }, t.atc - 0.04);
  // the controller's wave: it rises from the ground while « le contrôleur » is said, reaches you on « descends »
  st(t.atcFrom, t.atc - t.atcFrom, { atc: 1 }, "none");
  st(t.atc, 0.7, { atc: 2 }, "none");
  D.punch(t.atc, 0.06);

  /* ── his screens ── */
  const toHim = t.promesse - 0.1;
  cut(toHim, SET.SKY, HIS_ND, { ...STAGED, ...HIS, tau: 35, level: 0, ra: 0, level2: 3, ra2: 0, ping: 0, cores: 1 });
  shot(toHim, t.lui - 0.1 - toHim, HIS_ND_IN, "sine.out");
  // a cut, not a pan (a pan of a screen's width blurs the two into nothing): his vertical speed scale, the arc flips
  const toVsi = t.lui - 0.1;
  cut(toVsi, SET.SKY, HIS_VSI0, { ...STAGED, ...HIS, tau: 35, level: 0, ra: 0, level2: 3, ra2: 0, ping: 0, cores: 1 });
  shot(toVsi, t.une - 0.08 - toVsi, HIS_VSI, "sine.out");
  st(t.hisDown, 0.14, { ra2: -1 }, "power2.out");

  /* ── the choice: behind you, the two orders ── */
  const toChoice = t.une - 0.08;
  cut(toChoice, SET.SKY, CHOICE0, { ...STAGED, gap: 150, tau: 35, level: 0, ra: 0, level2: 3, ra2: -1, ping: 1, cores: 1 });
  shot(toChoice, t.scene - 0.1 - toChoice, CHOICE1, "sine.inOut");
  panel("#orders", t.toi - 0.06, t.scene - 0.4); // out before the cut
  chip("chip-toi", world.mine.deck.A.eyeL, 70, -10, t.toi + 0.02, t.scene - 0.4);

  /* ── the scene: same level, black night; the count comes down to 35 ── */
  const toLevel = t.scene - 0.1;
  const tau0 = 35 + (t.sc35 - toLevel); // counts in real time from here, lands on 35,0 on « 35 »
  cut(toLevel, SET.SKY, LEVEL0, { ...STAGED, gap: 140, tau: tau0, level: 1, ra: 0, level2: 3, ra2: -1, ping: 0, cores: 1 });
  shot(toLevel, t.ses - 0.1 - toLevel, LEVEL1, "sine.inOut");
  st(toLevel, t.sc35 - toLevel, { tau: 35 }, "none");
  st(toLevel, t.ses - 0.1 - toLevel, { gap: 112 }, "none");

  /* ── one image a sentence, a cut in each breath (each gap tween ends on the cut that sets the next) ── */
  const toShoulder = t.ses - 0.1; // 13,72
  const toFace = t.il - 0.12; //     15,58, in the breath after « pare-brise »
  const toStick = t.dont - 0.12; //  17,42, in the breath after « secondes »
  const toNd = t.sur - 0.12; //      19,02, in the breath before « Sur ton écran »
  const SKY = { level: 1, ra: 0, level2: 3, ra2: -1, cores: 1 };
  // over your shoulder: his lights grow in the windscreen
  cut(toShoulder, SET.SKY, SHOULDER0, { ...STAGED, ...SKY, gap: 330, ping: 0 });
  shot(toShoulder, toFace - toShoulder, SHOULDER1, "sine.inOut");
  st(toShoulder, toFace - toShoulder, { gap: 170 }, "none");
  // his face, the hook's axis, closer: « 35 secondes » (the count lands on 35,0 and turns signal)
  cut(toFace, SET.SKY, FACE0, { ...STAGED, ...SKY, gap: 175, ping: 0 }); // no ring: at this lens it sweeps past the camera
  shot(toFace, toStick - toFace, FACE1, "sine.inOut");
  st(toFace, toStick - toFace, { gap: 130 }, "none");
  // your hand on the stick: « dont cinq pour obéir »
  cut(toStick, SET.SKY, STICK0, { ...STAGED, ...SKY, gap: 200, ping: 0 });
  shot(toStick, toNd - toStick, VIEW.stick, "sine.inOut");
  st(toStick, toNd - toStick, { gap: 196 }, "none");
  st(t.cinq, 0, { obey: 5 });

  /* ── a cut to your ND (no pilot in front of the lens): the circle, then the red square ── */
  cut(toNd, SET.SKY, ND_IN, { ...STAGED, ...SKY, gap: 196, ping: 0, crew: 0 });
  shot(toNd, t.ouvre - toNd, VIEW.nd, "sine.out");
  st(toNd, t.ouvre - toNd, { gap: 190 }, "none");
  st(t.vire, 0, { level: 2 });
  st(t.carre, 0, { level: 3, ra: 1 });
  D.punch(t.rouge, 0.06);
}

// (FIRST is the state of frame 0: tau 35, obey −1, level 0, gap 250, ping 1, cores 1 — nothing is set before the hook)
void FIRST;
