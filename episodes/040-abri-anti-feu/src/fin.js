// DOSSIER 040 — the chute, what the film still owes, the calls to action, the next file last, the loop (toverdict → end).
//   chute     the bench, the section on its pool: the rays still bounce, the lens pushes in; « Il encaisse » struck on
//             « pas », « Il renvoie » on « renvoie » · the camera slides to the head end, where the glue lets go: one
//             tongue of flame plastered on the corner on « flamme », the glue smokes, the corner lifts, the hole on
//             « lâche » and the hot gas comes in. The limit, on the piece.
//   comment   Idaho: the crest with its 73 silver domes, a slow travel along it · on « ni abris » the domes stand up into
//             the crews they hid (the counterfactual; nobody hurt on the picture) · a cut inside the section: your head
//             leaves the cool green floor into the red on « Lève » · the two lying side by side: the duel, both in ink.
//   like      « ceux qui montent au feu »: you kneeling, the shelter FOLDED in its case in your hands, the crews standing
//             behind you on the crest, the fire's glow down the slope — the shelter as they carry it up, never laid down.
//   abo       the sky over the black crest: the next file, the debris crossing the dark on « débris ». Nothing of the
//             shelter after the announcement.
//   boucle    a cut back low at the hem, a little further than the first frame: on « crête » D.loop glides camera and
//             every number back to POSE0 / FIRST.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0 } from "./world.js";

const P = { fov: 32, side: 0, roll: 0, drift: 0, dof: 0 };

/* chute — the section, then the glue's corner at the head end (+x, +z): the flame sits at x ≈ 715, y ≈ 970 */
const SECTION_IN = { ...VIEW.section, d: VIEW.section.d * 0.88 };
const CORNER = { ...P, tx: 20, ty: 20, tz: 85, d: 330, az: -62, el: 16, shift: 40, side: 80 };
const CORNER_WIDE = { ...CORNER, d: 340, az: -53, el: 18, side: 120 }; // the cut lands here a few frames before « Une flamme », then turning in
/* comment — the crest pose of crete.js, pushed left clear of the TikTok buttons: the domes in the middle third */
const IDAHO = { ...P, tx: -2200, ty: -200, tz: -1600, d: 5600, az: -62, el: 15, fov: 38, shift: 140, side: 160 };
const IDAHO_END = { ...IDAHO, tx: -1500, tz: -1450, d: 5000 };
// inside the section, your head in the middle of the frame: green floor, red gas above
const HEAD = { ...P, tx: 0, ty: 14, tz: 55, d: 320, az: -96, el: 8, fov: 34, shift: 60 };
const HEAD_IN = { ...HEAD, d: 285 };
/* like — #net ends at y ≈ 764: the kneeling figure under it (head ≈ 845), the crews standing behind, right */
const KNEEL = { ...P, tx: 0, ty: 70, tz: 0, d: 880, az: -70, el: 3, fov: 34, shift: -70 };
const KNEEL_IN = { ...KNEEL, d: 800 };
/* abo — (retouche) the crest first: camera 2,5 m above it behind the 1700 crew, looking down the slope across the
   silver domes (nearest ≈ 340 px, y 920–1070, x 210–920), the dark sky above; then the sky for the debris on « débris »;
   then back on the domes until the loop. The debris flies 20°+ above the crest from anywhere a dome reads: one frame
   cannot hold both under the #next panel. */
const CREST_A = { ...P, tx: 900, ty: -40, tz: -500, d: 3146, az: 50.2, el: 6.8, fov: 34, shift: 0, side: 150 };
const CREST_A_IN = { ...CREST_A, d: 2960 };
const CREST_B_IN = { ...CREST_A, d: 2800 };
/* the sky, low: the black crest at the bottom, the debris crossing the middle (x 140 → 940, y ≈ 1020) */
const SKY = { ...VIEW.sky, shift: -520, drift: 0 };
const SKY_IN = { ...SKY, d: 15600 };
/* boucle — the first frame, 12° further round on the way the whole end turns, a touch further back */
const BACK = { ...POSE0, d: POSE0.d * 1.1, az: POSE0.az + 12 };

export default function fin({ D }) {
  const { tl, cut, st, punch, path } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", renvoie2: "renvoie2", flamme: "flamme", lache: "lache",
    tocta: "tocta", idaho: "idaho", abris: "comment:abris", tete: "tete", leve: "leve", chaud: "chaud",
    commentaire: "comment:commentaire", pieds: "pieds", outete: "outete",
    like: "like", likeEnd: "like$", abo: "abo", prochain: "abo:prochain", debris: "abo:débris", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });
  const crest = { ...STAGED, clock: 5400, abris: 73 }; // the header goes on reading the end of the story

  /* ── CHUTE — the section on its halo: the rays still bounce; the lens closes on « pas » ── */
  cut(t.toverdict, SET.BENCH, VIEW.section, { ...BENCHED, cut: 1, rays: 1, bounce: 1, mood: 0 });
  // PLAN-SÉQUENCE (06/11): every plan of the end moves, all turning the same way on screen (az falling), never held
  // (it was coupe + poussée: 43 % of the film still, 74,5 → 88,1 s frozen)
  path([
    [t.toverdict, VIEW.section],
    [t.pas, { az: -95, el: 11, d: 590 }],
    [t.renvoie2, { az: -100, el: 13, d: 560 }],
    [t.flamme - 0.3, { az: -103, el: 14, d: SECTION_IN.d }],
  ]);
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.renvoie2 - 0.05, hideAt: t.flamme - 0.3 });
  D.verdict(t.pas);
  punch(t.pas, 0.06);
  // « Une flamme collée trop longtemps… et il lâche. » — to the corner, where the glue goes first
  // (retouche: a cut, not a 1 s slide — the slide turned 28° and halved the distance: heurté at 63,7)
  const toCorner = t.flamme - 0.3; // « Une » 63,26
  cut(toCorner, null, CORNER_WIDE);
  path([
    [toCorner, CORNER_WIDE],
    [t.flamme + 0.6, { az: -58, el: 17, d: 265, side: 160 }],
    [t.lache, { az: -63, el: 16, d: 240, side: 170 }],
    [t.tocta, { az: -67, el: 15, d: 232, side: 170 }],
  ]);
  st(t.flamme - 0.1, 0.5, { lick: 1, rays: 0.4 }, "power2.out");
  st(t.flamme + 0.35, (t.lache - 0.45) - (t.flamme + 0.35), { glue: 1 }, "sine.inOut");
  st(t.lache - 0.4, 0.45, { hole: 1 }, "power2.in");
  st(t.lache - 0.1, 0.8, { hot: 0.9 }, "power2.out");

  /* ── WHAT IS OWED — Idaho: the crest, its 73 domes; « ni abris »: they stand up, exposed ── */
  cut(t.tocta, SET.CRETE, IDAHO, { ...crest, burn: 1, front: 60, fire: 0.3, flank: 0, smoke: 0.5, embers: 0.3, lean: 0.4, mood: 1 });
  path([
    [t.tocta, IDAHO],
    [t.abris, { tx: -1900, tz: -700, az: -68, el: 16, d: 5350, side: 200 }],
    [t.tete - 0.25, { tx: -1700, tz: -300, az: -76, el: 18, d: IDAHO_END.d, side: 220 }],
  ]);
  D.chip("chip-lieu", null, 96, 470, t.idaho, t.tete - 0.5);
  st(t.abris, 0.9, { deploy: 0, crowd: 1 }, "sine.inOut");
  // « Et ta tête ? Lève-la, et tu respires l'air chaud » — inside the section: from the green floor into the red
  cut(t.tete - 0.25, SET.CRETE, HEAD, { ...crest, burn: 1, front: 60, fire: 0.3, flank: 0, smoke: 0.4, embers: 0.2, lean: 0.4, cut: 1, cool: 1, hot: 1, head: 0, mood: 1 });
  path([
    [t.tete - 0.25, HEAD],
    [t.leve + 0.4, { az: -101, el: 9, d: 305 }],
    [t.commentaire - 0.35, { az: -110, el: 11, d: HEAD_IN.d }],
  ]);
  st(t.leve - 0.05, 0.7, { head: 1 }, "power2.inOut");
  punch(t.chaud, 0.06);
  // « En commentaire : pieds vers le feu… ou tête ? » — the two lying side by side; both answers in ink
  const toDuo = t.commentaire - 0.35;
  cut(toDuo, SET.CRETE, VIEW.duo, { ...crest, burn: 1, front: -40, fire: 0.6, lean: 0.4, smoke: 0.6, embers: 0.4, duo: 1, mood: 1 });
  path([
    [toDuo, VIEW.duo],
    [t.pieds, { az: 19, el: 29, d: 675 }],
    [t.like - 0.12, { az: 11, el: 27, d: VIEW.duo.d * 0.9 }],
  ]);
  duelCall(tl, { from: toDuo + 0.1, aAt: t.pieds, bAt: t.outete, to: t.like - 0.42, toneA: null, toneB: null });

  /* ── LIKE — « ceux qui montent au feu »: the shelter folded in your hands, the crews standing behind ── */
  cut(t.like - 0.12, SET.CRETE, KNEEL, { ...crest, burn: 0.3, front: -40, fire: 0.6, lean: 0.4, smoke: 0.6, embers: 0.4, deploy: 0, crowd: 1, fold: 1, hands: 0, mood: 1 });
  path([
    [t.like - 0.12, KNEEL],
    [t.likeEnd - 1, { az: -76, el: 4, d: 840 }],
    [t.abo - 0.15, { az: -83, el: 5, d: KNEEL_IN.d }],
  ]);
  likeCall(tl, { from: t.like, to: t.likeEnd, count: 5, label: (n) => `${n} personnes` });

  /* ── PROCHAIN DOSSIER — the sky over the black crest; the debris crosses on « débris » ── */
  cut(t.abo - 0.15, SET.CRETE, CREST_A, { ...crest, shell: 1, burn: 1, front: 60, fire: 0, flank: 0, smoke: 0.5, embers: 0.4, debris: 0, mood: 0 });
  const toSky = t.debris - 0.34; // after « spatiale », a few frames before « un débris »
  const back = t.debris + 0.6; // between « arrive » and « à dix kilomètres »: the spark has crossed
  // one travelling across the two cuts: the crest turning, the sky turning on, the crest again a little further round
  path([[t.abo - 0.15, CREST_A], [t.prochain, { az: 46.5, el: 7.4, d: 3040, side: 200 }], [toSky, { az: 41, el: 8.4, d: CREST_A_IN.d * 0.97, side: 250 }]]);
  cut(toSky, null, SKY);
  path([[toSky, SKY], [back, { az: 7, d: SKY_IN.d }]]);
  cut(back, null, { ...CREST_A_IN, az: 38.5, el: 8.6, side: 270 });
  path([[back, { ...CREST_A_IN, az: 38.5, el: 8.6, side: 270 }], [t.toloop, { az: 33, el: 9.2, d: CREST_B_IN.d, side: 330 }]]);
  st(t.debris - 0.6, 2.0, { debris: 1 }, "none"); // the head crosses the frame between 0.15 and 0.55: on the word
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.debris - 0.05, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── REBOUCLAGE — back low at the hem, the front rolling behind the dome: the first frame on « crête » ── */
  // (retouche) one slow, even push over the whole sentence, at the speed the hook leaves frame 1 with (front +1,1 m/s,
  // lean +0,027/s, the lens closing in): no more 0,9 s rush from « crête » (heurté 87,5)
  // (plan-séquence) the same push, now turning the same way as the whole end: BACK is 12° round, a touch further; the
  // turn runs linear and is still moving on the last frame (= frame 0)
  cut(t.toloop, SET.CRETE, BACK, { ...STAGED, ...FIRST, front: -8, lean: 0.7 });
  D.loop({ at: t.toloop, rewindAt: t.toloop + 0.04, ease: "none" });
}
