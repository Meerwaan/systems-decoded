// 01 · MENACE — from the first frame to "Alors…" (0 → tobench 18.71). ONE cut in the act: the flashback at 8.38.
//
// THE HOOK (0 → 8.38), one move. The first frame is POSE0 as chosen (low on voie 2's ballast, the car in profile
// across the rails, the TGV's headlamps up the track behind it): the hero boom is already coming down (downOut
// 0.62 → 1, landing on « casser »), the R24 flashing, the bell ringing — the subject moves, the camera barely.
//   « Et cette barrière est faite pour +casser+ »  the camera swings round the nose, low: the boom across the frame
//                                                  in front of the car's face, landing on the word
//   « c'est ta +sortie+ »                          it slides along the boom to the bumper; the boom takes a veille
//                                                  edge on the word (litBoom)
//   « Sauf si ta voiture ne *roule* plus »         it rises over the hood: through the glass, the dashboard flickers
//                                                  and dies on « roule » (alive 1 → 0)
// THE SCENE (8.38 → 18.71). A cut, frank: back to T = 0 (the plunge, wide, high). The story then runs in real time —
// T 0 on « feux » 8.62 → T 8.4 when the exit boom lands on « enfermé » 16.90 (header « Feux +N s » and the TGV,
// trainAt(T), follow it) — and the camera never stops:
//   « Les feux *clignotent* »          the R24s light on « feux »; « La sonnerie tinte »: the bells on « sonnerie »
//   « Devant, la file ne bouge plus »  the camera tilts forward over the car: the exit boom still up, the queue's stop
//                                      lights coming on on « file »
//   « Dans ton dos, la barrière… »     it cranes down behind the entry boom, which comes down in the foreground (2/4)
//   « Puis devant ton capot… »         it cranes over the roof to your shoulder: the hero boom comes down beyond the hood
//   « Tu es *enfermé* »                it lands on the word; the camera pulls back high: the four booms, the car
//                                      between them (4/4, signal)
//   « Alors… »                         the camera pushes in on the hero signal whole (VIEW.system) and settles; nothing
//                                      else moves. Act 2 cuts to the bench from there (tobench).
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, VIEW, STAGED, STORY, POSE0, trainAt } from "./world.js";

/* ── the poses (car's frame, the car stuck: crossing at z = +300, hero boom at z = −350, entry boom at z = +950) ── */
const P = { side: 0, roll: 0, drift: 0.2, dof: 0 };
const CLOSE = { dof: 6 };
// the hook, a little closer (same aim far up the track: the car grows, the headlamps stay at the vanishing point)
const HOOK_IN = { ...POSE0, d: 1980 };
// « casser »: low, ahead-left of the nose — the hero boom across the frame, the car's face just behind it
const CASSER = { ...P, tx: 20, ty: 95, tz: -330, d: 1150, az: -152, el: 5, fov: 40, shift: 60 };
// « sortie »: along the boom to the bumper, a few centimetres off — boom and bumper fill the frame
const SORTIE = { ...P, ...CLOSE, tx: -10, ty: 88, tz: -320, d: 640, az: -192, el: 7, fov: 40, shift: 60 };
// « roule »: over the hood, through the windscreen — the dashboard
// (retouche) tight on the two dials: they are the subject, the dummy's head leaves the frame at the top
const DASH = { ...P, tx: -37, ty: 95, tz: -72, d: 210, az: -165, el: 8, fov: 30, shift: 0, dof: 4 };
// the scene, wide and high (the four booms up, the car between them)
// (retouche) closer than VIEW.plunge: the car ≈ a third of the frame, the camera keeps creeping in (az −36 → −28)
const PLUNGE = { ...P, tx: -30, ty: 40, tz: 120, d: 1500, az: -36, el: 40, fov: 46, shift: 50, drift: 0.2 };
// « Devant, la file »: from behind and above, the aim forward past the raised exit boom to the queue
const FILE = { ...P, tx: -20, ty: 60, tz: -450, d: 2300, az: -14, el: 22, fov: 34, shift: 230 };
// « Dans ton dos »: low behind the entry boom, which comes down in the foreground, the car beyond
const DOS = { ...P, tx: 0, ty: 100, tz: 600, d: 1700, az: -6, el: 10, fov: 40, shift: 60 };
// « devant ton capot… la deuxième »: over your left shoulder, the hood and the hero boom beyond it
// (retouche) higher and further: the whole car above the captions, the hero boom beyond the hood
const OVER = { ...P, tx: 0, ty: 60, tz: -250, d: 1800, az: -10, el: 44, fov: 34, shift: 220 };
// « enfermé »: pulled back high — the four booms down, the car between them
const SHUT = { ...P, tx: -160, ty: 40, tz: 300, d: 3400, az: -22, el: 46, fov: 42, shift: 150 };
const SYSTEM = { ...VIEW.system, drift: 0.2 };

export default function acte1({ D }) {
  const { tl, st, shot, cut, punch } = D;
  const t = D.times({
    rails: "choc", casser: "casser", defaut: "promesse", sortie: "sortie", sauf: "promesse:Sauf", roule: "roule",
    scene: "scene", feux: "feux", clignotent: "scene:clignotent", sonnerie: "sonnerie", devant: "scene:Devant",
    file: "file", dos: "dos", descend: "scene:descend", puis: "scene:Puis", capot: "capot", deuxieme: "deuxieme",
    enferme: "enferme", alors: "ouvre", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ═════════════ THE HOOK ═════════════ */
  const flash = t.scene - 0.12; // the cut: a few frames before « Les feux »
  // the story's seconds run under the hook (T 5.6 → 8.4) and the TGV comes with them
  st(0, flash - 0.02, { clock: STORY.outDown, train: trainAt(STORY.outDown) }, "none");
  // the hero boom is already coming down on frame 0, and lands on « casser »
  // (retouche) frank from frame 1 (34°/s), then it settles onto the word
  st(0, 1.7, { downOut: 0.94 }, "power2.out");
  st(1.7, t.casser - 1.7, { downOut: 1 }, "sine.inOut");

  // the queue stands right in the foreground of every frame ahead of the car: it goes while it is out of the picture
  st(0.9, 0.7, { file: 0 }, "none");

  /* ── « Ta voiture est sur les *rails*. » ── the subject moves, the camera barely */
  shot(0, 1.85, HOOK_IN, glide(3, 0));
  punch(t.rails, 0.06);

  /* ── « Et cette barrière est faite pour +casser+. » ── round the nose: the boom across the frame on the word */
  shot(1.85, t.casser + 0.15 - 1.85, CASSER, "sine.inOut");
  shot(t.casser + 0.15, t.defaut - 0.2 - (t.casser + 0.15), { d: 1080 }, "sine.inOut");

  /* ── « Ce n'est pas un défaut : c'est ta +sortie+. » ── along the boom to the bumper; a veille edge on « sortie » */
  shot(t.defaut - 0.2, t.sortie - 0.1 - (t.defaut - 0.2), SORTIE, "sine.inOut");
  shot(t.sortie - 0.1, 0.6, { d: 600 }, "sine.out");
  st(t.sortie - 0.06, 0.16, { litBoom: 0.6 }, "power2.out");
  st(t.sortie + 0.75, 0.45, { litBoom: 0 }, "sine.inOut");
  punch(t.sortie, 0.06);

  /* ── « Sauf si ta voiture ne *roule* plus. » ── over the hood: the dashboard flickers and dies on « roule » */
  // (retouche) a cut a few frames before « Sauf » (the swing SORTIE → DASH was a heurt), then a slow push on the dials
  cut(t.sauf - 0.1, null, DASH);
  shot(t.sauf - 0.1, flash - (t.sauf - 0.1), { d: 180 }, "sine.inOut");
  st(t.roule - 0.12, 0.34, { alive: 0 }, "none");

  /* ═════════════ THE SCENE — back to T = 0, in real time ═════════════ */
  cut(flash, SET.ROAD, PLUNGE, {
    ...STAGED, downIn: 0, downOut: 0, flash: 0, ring: 0, file: 0.3, alive: 1,
    clock: 0, train: trainAt(0), beam: 1,
  });
  // T: 0 on « feux » → 8.4 on « enfermé » (the exit boom down), then 8.8, frozen
  const shut = t.enferme - 0.05;
  st(t.feux, shut - t.feux, { clock: STORY.outDown, train: trainAt(STORY.outDown) }, "none");
  st(shut, t.tobench - 0.2 - shut, { clock: 8.8, train: trainAt(8.8) }, "none");

  /* ── « Les feux *clignotent*. La sonnerie tinte. » ── */
  shot(flash, t.devant - 0.15 - flash, { d: 1250, az: -28 }, "none"); // (retouche) it never stops creeping in
  st(t.feux - 0.04, 0.12, { flash: 1 }, "power2.out");
  punch(t.clignotent, 0.06);
  st(t.sonnerie - 0.04, 0.2, { ring: 1 }, "power2.out");

  /* ── « Devant, la file ne bouge plus. » ── forward over the car: the queue's stop lights */
  const atFile = t.devant - 0.15;
  // (retouche) cuts, not swings (heurts at 11.5 and 13.0), each followed by a slow push
  cut(atFile, null, FILE);
  shot(atFile, t.dos - 0.75 - atFile, { d: 2120 }, "sine.inOut");
  st(t.file - 0.05, 0.4, { file: 1 }, "sine.out");

  /* ── « Dans ton dos, la barrière descend. » ── down behind the entry boom: it lands on « descend » */
  const atDos = t.dos - 0.75;
  cut(atDos, null, DOS);
  st(t.dos - 0.5, t.descend + 0.2 - (t.dos - 0.5), { downIn: 1 }, "sine.inOut");

  /* ── « Puis devant ton capot… la deuxième. » ── over the roof to your shoulder; the hero boom comes down */
  const atOver = t.puis - 0.15;
  shot(atDos, atOver - atDos, { d: 1400 }, "sine.inOut");
  cut(atOver, null, OVER); // (retouche) a cut, not the swing over the roof (heurt at 14.8)
  st(t.puis - 0.3, shut - (t.puis - 0.3), { downOut: 1 }, "sine.inOut");

  /* ── « Tu es *enfermé*. » ── pulled back high: the four booms, the car between them */
  const atShut = t.deuxieme + 0.2;
  shot(atOver, atShut - atOver, { d: 1560 }, "sine.inOut");
  shot(atShut, t.enferme + 0.15 - atShut, SHUT, "sine.inOut", 1560);
  punch(t.enferme, 0.06);

  /* ── « Alors… » ── in on the hero signal, and still */
  // (retouche) the plunge el 46 → 14 in 0.95 s was a heurt: the pull-back eases on, then a cut a few frames before
  // « Alors » onto the signal, a little wide, and a slow push that lands on VIEW.system
  const atSys = t.alors - 0.12;
  shot(t.enferme + 0.15, atSys - (t.enferme + 0.15), { d: 3650 }, "sine.out");
  cut(atSys, null, { ...SYSTEM, d: 1200 });
  shot(atSys, t.tobench - 0.1 - atSys, SYSTEM, "sine.out");
}
