// c1 · « Ton avion brûle », « Alors… on l'ouvre » — 0 → HAND.c12 (« gonfle » − 0,9 s = 49,84 s). docs/L03-actes.md, c1.
// The first frame is C3 (hook2, reframed): OUTSIDE at Haneda, the A350 burning, slide 1L dropping and unrolling — it moves
// BY ITS SUBJECT from frame 1. Then the cabin on « La fumée descend » (before 3 s), a shot every 3 to 5 s until 30 s, the
// pack in the door, « Alors… on l'ouvre » (the exploded view opens ON « on »), the parts, the void under the door, and
// the door from inside — the half of the seam c12 that this file owns. Every instant is read off the voice (D.at).
// Journal: docs/journal/L03-c1.md.
import { glide } from "@kit/direct.js";
import { fact } from "@kit/long.js";
import { SET, AT, VIEW, HAND, POSE0, CLOSE, SHARP, seam, onFrame, benchLight, benchFromCabin, PACK_IN_DOOR } from "./world.js";
import { ITEM } from "./plan.js";

export default function ({ D }) {
  const { at, st, now, shot, cut, punch } = D;
  const t = D.times({
    brule: "fire", fumee: "accroche:fumée", plafond: "accroche:plafond", haut: "accroche:haut", taisent: "silence",
    scene: "scene", fermees: "titre", feu: "scene:feu",
    promesse: "promesse", vider: "promesse:vider", secondes: "miniature", noir: "promesse:noir", moitie: "promesse:moitié",
    defi: "defi", trois: "three", trois2: "defi:trois#2", pour: "defi:pour", personnes: "defi:personnes",
    curio: "curiosite", toi: "curiosite:toi", sortir: "paquet:sortir",
    tobench: "tobench", on: "explode",
    toboggan: "eclate:toboggan", bouteille: "eclate:bouteille", bouches: "eclate:bouches", avalent: "eclate:avalent",
    retiens: "eclate:retiens", secret: "eclate:secret", tout: "eclate:tout", barre: "eclate:barre", girt: "girt",
    avant: "avant", souvre: "avant:ouvre", vide: "avant:vide", et: "avant:et",
  });
  const seamAt = onFrame(at(HAND.c12.at)); //                                   49,84
  const handAt = seamAt - HAND.c12.opt.before; //                               48,64: the last shot ends on HAND.c12.from[0]

  /* ── 0 → 1,6 · « Ton avion brûle. » — POSE0 / FIRST: Haneda, the slide unrolls, the camera already glides in ── */
  st(0, 1.5, { doorA: 0.86 }, "power1.out"); //                                 the pack has dropped: it unrolls and tightens
  st(t.brule - 0.06, 0.6, { fire: 1 }, "power2.out"); //                        « brûle »: the fire swells under the belly
  shot(0, 1.6, { ...POSE0, d: 2050, az: -66, el: -9 }, glide(2.5, 0.6)); //     a push toward the nose, low

  /* ── 1,6 → 3,5 · « La fumée descend du plafond… » — the cabin, from the door looking aft, the smoke rolling down ── */
  // raccord: the fire's glow in the left windows (the place changes: a short melt, on a frame). It is the second
  // thumbnail (thumbSmoke, 2,24 s): its promise is paid on the word. (C5 / hook4 was tried: a wall of glass heads.)
  const C5 = { ...VIEW.thumbSmoke };
  const tCab = onFrame(t.fumee - 0.28);
  cut(tCab, SET.CABINE, C5, { ...AT.tokyo, smoke: 0.55, fire: 0.7, floor: 1, signs: 1, pa: 1, fx: 500, fy: 150, fz: 115, fs: 700 }, { fade: 0.2 });
  st(tCab, 1.8, { smoke: 0.85 }, "sine.inOut"); //                              it comes down (the camera stays ≈ 40 cm above the floor, looking up)
  st(t.plafond - 0.1, 0.6, { signs: 0.4 }, "power1.inOut"); //                  « plafond »: the signs drown
  shot(tCab, 1.9, { ...C5, d: 680, el: -11, tx: 530 }, "sine.out"); //            the glide goes on, and looks up

  /* ── 3,5 → 5,1 · « …et les haut-parleurs se taisent. » — a PA grille in the ceiling, its glow dies ── */
  const tSpk = onFrame(t.haut - 0.27);
  // from the front of the aisle, before row 0 (no glass head within a metre), the look rises along the ceiling to a
  // grille: the rows soft below it (CLOSE), the smoke around it (raccord: the look that was already rising)
  const SPK = { ...VIEW.speaker, ...CLOSE, d: 650, az: -90, el: -12, fov: 34 };
  cut(tSpk, SET.CABINE, SPK, { ...AT.tokyo, smoke: 0.6, fire: 0.7, floor: 1, pa: 1, signs: 0.6, fx: 839, fy: 200, fz: 118, fs: 500 });
  shot(tSpk, 1.6, { ...SPK, d: 560 }, "sine.inOut"); //                         a slow push toward the grille
  st(t.taisent, 0.3, { pa: 0 }, "power2.out"); //                               « taisent »: dead, cold

  /* ── 5,1 → 9,2 · « Sur huit portes, cinq restent fermées. Derrière elles, il y a le feu. » — the left flank ── */
  const SIDE0 = { ...VIEW.planeSide, tx: -1500, d: 2700, shift: 0 }; //       a segment of the hull: 1L, 2L (≥ 40 % of the height)
  const SIDE1 = { ...VIEW.planeSide, tx: 0, d: 2600, shift: 0 }; //            2L, the fire under the wing root, 3L
  const tSide = onFrame(t.scene - 0.14);
  cut(tSide, SET.PISTE, SIDE0, { ...AT.haneda, fire: 0.6, smoke: 0.8, shut: 0, fx: -200, fy: 450, fz: 0, fs: 3500 }, { fade: 0.2 });
  shot(tSide, 4.1, SIDE1, "sine.inOut"); //                                     a travelling toward the tail, along the doors
  st(t.fermees, 0.5, { shut: 1 }, "power2.out"); //                             « fermées »: five doors turn signal
  punch(t.fermees, 0.05);
  st(t.feu - 0.05, 0.35, { fire: 1 }, "power2.out"); //                         « le feu » climbs behind them (done before the cut)

  /* ── 9,2 → 16,8 · « Pourtant… on peut le vider en 90 secondes. Dans le noir. Par la moitié de ses portes. » ── */
  // the same A350 at the same place of the picture, in the trial hangar: the fire goes out on a melt
  const HIGH = { ...SHARP, fov: 28, shift: 0, side: -200, roll: 0, drift: 0.3, tx: 0, ty: 450, tz: 0, d: 8800, az: -22, el: 20 };
  const tHang = onFrame(t.promesse - 0.19);
  cut(tHang, SET.PISTE, SIDE1, { ...AT.hangar, lights: 1, fx: 0, fy: 500, fz: 0, fs: 3500 }, { fade: 0.2 });
  shot(tHang, onFrame(t.defi - 0.1) - tHang, HIGH, "sine.inOut", SIDE1.d); //   a pull-back and a rise, by ratio
  st(t.vider, 1.6, { doorA: 1 }, "power2.out"); //                              « vider »: the four left doors, their slides
  st(t.vider + 0.5, 3.2, { evac: 0.3 }, "none"); //                             the first ones slide (it only grows, ends before the cut)
  now(t.secondes, { chronoOn: 1, chrono: -90 }); //                             « secondes »: CHRONO 90 s, veille
  st(t.noir, 0.3, { lights: 0 }, "power2.out"); //                              « noir »: the cabin lights die
  st(t.moitie, 0.5, { shut: 1 }, "power2.out"); //                              « moitié »: the four right doors condemned

  /* ── 16,8 → 21,7 · « Ce soir, il t'en reste trois. Trois toboggans… pour 379 personnes. » — Haneda, same frame ── */
  const tHan = onFrame(t.defi - 0.1);
  cut(tHan, SET.PISTE, HIGH, { ...AT.haneda, fire: 1, smoke: 0.8, shut: 1, pax: 0.15, fx: -1200, fy: 450, fz: 0, fs: 3500 });
  now(tHan, { chronoOn: 0, chrono: 0 });
  shot(tHan, onFrame(t.curio - 0.17) - tHan, { ...HIGH, az: -30, d: 8300, el: 22 }, "sine.inOut");
  st(t.trois - 0.04, 1.3, { doorA: 1 }, "power2.out"); //                       « trois »: 1L and 1R burst out
  st(t.trois2 - 0.04, 1.3, { doorB: 1 }, "power2.out"); //                      then 4L
  st(t.pour, 1.5, { pax: 1 }, "sine.inOut"); //                                 379: the heads behind the windows light up
  st(t.pour + 0.3, 1.5, { evac: 0.05 }, "none"); //                              the first ones on the slides
  fact(D.tl, { id: "c1-379", k: "À bord", v: "379", s: "personnes", from: t.pour, to: onFrame(t.curio - 0.17) - 0.02 });

  /* ── 21,7 → 26,5 · « Et ce soir-là, presque personne n'a pris son sac. Toi… tu l'aurais pris ? » — your bag ── */
  // the third thumbnail (24,12): the bag full, hanging from your hand, ≈ 45 % of the height
  const tBag = onFrame(t.curio - 0.17);
  cut(tBag, SET.CABINE, { ...VIEW.thumbBag, d: 205 }, { ...AT.tokyo, you: 2, bag: 1, smoke: 0.9, floor: 1, fire: 0.6, fx: 742, fy: 60, fz: 110, fs: 250 }, { fade: 0.2 });
  shot(tBag, onFrame(t.sortir - 0.2) - tBag, { ...VIEW.thumbBag, d: 168 }, "sine.inOut"); // a slow push on the bag
  st(t.toi, 0.6, { bag: 0.94 }, "sine.inOut"); //                               « Toi… »: the hand hesitates
  st(t.toi + 0.6, 0.8, { bag: 1 }, "sine.inOut");

  /* ── 26,5 → 31,7 · « Pour sortir, il te faut d'abord ce qui dort, plié… dans chaque porte. » — the door 1L ── */
  // the look goes from the bag to the door; a slow push down to the bustle (never a dive), the subject moving right
  // before the card « On l'ouvre » covers the left half
  const DOOR0 = { ...VIEW.doorIn, ty: 70, tz: 265, d: 390, el: 9, side: 0 };
  const BUSTLE = { ...VIEW.bustle, d: 235, el: 11, side: -220 };
  const tDoor = onFrame(t.sortir - 0.2);
  cut(tDoor, SET.CABINE, DOOR0, { ...AT.tokyo, arm: 1, floor: 1, smoke: 0.8, fire: 0.6, signs: 0.6, fx: 0, fy: 40, fz: 240, fs: 200 });
  shot(tDoor, t.tobench - tDoor, BUSTLE, "sine.inOut");

  /* ── 31,7 → 33,3 · « Alors… on l'ouvre. » — the same pack at the same place, on the bench; it opens ON « on » ── */
  cut(t.tobench, SET.BENCH, benchFromCabin(BUSTLE, PACK_IN_DOOR), { ...AT.bench, ...benchLight(ITEM.PACK), explode: 0, named: 0 });
  const OPEN = { ...VIEW.exploded, side: -120, d: 372 };
  st(t.on, 2.2, { explode: 1, fy: 50 }, "power2.out");
  shot(t.on, 2.2, OPEN, "sine.inOut", BUSTLE.d); //                              a pull-back by ratio (× 1,6)

  /* ── 33,3 → 39,1 · « Un toboggan plié, serré. Contre lui, une bouteille… Des bouches qui avalent l'air. » ── */
  now(t.toboggan, { named: 1 });
  now(t.bouteille, { named: 2 });
  now(t.bouches, { named: 3 });
  shot(t.on + 2.2, t.retiens - 0.12 - (t.on + 2.2), { ...OPEN, az: -6, el: 20, d: 350, side: -60 }, "sine.inOut"); // a slow orbit of ≈ 22°
  st(t.avalent, 0.6, { air: 0.5 }, "sine.out"); //                               « avalent l'air »: one breath, veille
  st(t.avalent + 0.6, 0.7, { air: 0 }, "sine.in");

  /* ── 39,1 → 41,5 · « Retiens-les : ce sont elles le secret. » — closer on the aspirators, the flaps ── */
  const tSec = onFrame(t.retiens - 0.12);
  cut(tSec, null, { ...VIEW.secret, d: 225 }, { fy: 70, fz: 16 });
  const tBar = onFrame(t.barre - 0.12);
  shot(tSec, tBar - tSec, { ...VIEW.secret, d: 188, ty: 64 }, "sine.inOut"); //   a slow push; « tout en bas… » the look sinks a little
  now(t.secret, { named: 5 });
  punch(t.secret, 0.05);

  /* ── 41,5 → 44,9 · « Et tout en bas… une barre de métal : la barre d'arrimage. » — down to the girt bar ── */
  // a CUT on « barre » (qa 22/10: the descent secret → girt in 2,8 s was a jerk, 23,2 at 42,4 s), then a slow push
  cut(tBar, null, { ...VIEW.girt, d: 245 }, { fy: 20, fz: 30 });
  now(t.barre, { named: 4 });
  shot(tBar, onFrame(t.avant - 0.13) - tBar, { ...VIEW.girt, d: 212, az: -21 }, "sine.inOut");

  /* ── 44,9 → 47,2 · « Sans lui, ta porte s'ouvre sur le vide. » — the apron at night: the door opens, no slide ── */
  // raccord: the bar low in the bench's frame → the sill low in the door's frame
  const D1L = { ...VIEW.door1L, ...SHARP, ty: 412, tz: 330, d: 1950, az: -22, el: 8, side: -150 }; // the door high, the ground at the bottom
  const tApr = onFrame(t.avant - 0.13);
  cut(tApr, SET.PISTE, D1L, { ...AT.apron, bridge: 0, doorA: 0 }, { fade: 0.2 });
  shot(tApr, t.souvre + 0.1 - tApr, { ...D1L, d: 1900, ty: 405 }, "sine.inOut");
  st(t.souvre, 0.6, { doorA: 0.3 }, "power2.inOut"); //                          « s'ouvre »: out and swung — nothing comes
  const tIn = onFrame(t.et - 0.17);
  shot(t.souvre + 0.1, tIn - (t.souvre + 0.1), { ...D1L, d: 1800, ty: 380, el: 10 }, "sine.inOut"); // « vide »: closer, toward the drop (the door stays below the header)
  punch(t.vide, 0.05, { up: 0.08, hold: 0.1, down: 0.26 });

  /* ── 47,2 → 49,84 · « Et il doit être prêt… avant que tu y arrives. » — the door from inside, armed ── */
  const [DOOR_A] = HAND.c12.from;
  cut(tIn, SET.CABINE, { ...DOOR_A, d: 470, az: 143 }, { ...AT.cabin, arm: 1 }, { fade: 0.2 });
  shot(tIn, handAt - tIn, DOOR_A, "sine.out"); //                                 a slow push toward the lever, onto HAND.c12.from[0]
  seam(D, "c12", "out");
}
