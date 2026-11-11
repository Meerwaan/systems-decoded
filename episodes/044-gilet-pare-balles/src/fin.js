// DOSSIER 044 — the chute, what the film owes, the like, the next file, the loop (toverdict 62.57 → the end 90.53).
// ONE slow orbit (D.path, az always decreasing, 62.57 → 89.04): from the panel in section on his torso (the ghost wall
// and its ghost bullet that bounces off, « pas un mur » / « un filet »: the weave lights, the yarns pull tight, the cone
// deepens toward the ribs), over his belly (the blow), to the clay that stands 64 cm to his left on the bench (its dent
// in section, the gauge down to 44 mm), then the panel slides onto the halo in the clay's place to face the ghost blade
// — which never touches it (the comment's question stays open: both answers in ink) —, the panel cut open again on
// « Like » (the mushroom caught in the cone), then, on « Abonne-toi », the panel slides home into its pocket and the
// orbit ends on the 045 rocket alone. Then the loop: a cut on POSE0 turned 12° (VIEW.back), the first frame's numbers a step
// behind, and D.loop WITHOUT fromD (041: the MP4 went black 1.4 s before the loop): the last frame IS the first.
// The panel stays IN ITS POCKET while the clay is up (72.5 → 75.9): standing on the halo it would fill the clay's dent
// and hide its profile (docs/journal/044-rue.md). The clay's `section` flips at 0.5: it is passed once the clay is gone.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { VIEW, STAGED, FIRST, SET, LIGHT, IMPACT_BENCH, TEASER } from "./world.js";

export default function fin({ D }) {
  const { tl, st, now, path, cut, shot, punch } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", mur: "chute:mur", filet: "chute:filet", attrape: "chute:attrape",
    creusant: "chute:creusant", tocta: "tocta", ventre: "comment:ventre", tissu: "comment:tissu", creuse: "comment:creusé",
    toclay: "toclay", norme: "comment:norme", quarante: "comment:44", creux: "comment:creux",
    commentaire: "comment:commentaire", gilet: "comment:gilet", couteau: "comment:couteau", duelA: "duelA", duelB: "duelB",
    tolike: "tolike", like: "like", service: "like:service", likeEnd: "like$",
    toabo: "toabo", prochain: "abo:prochain", dossier: "abo:dossier", fusee: "abo:fusée", explosif: "abo:explosif", elle: "abo:elle-même",
    aboEnd: "abo$", toloop: "toloop", rewind: "rewind",
  });
  // the bullet lodged, the cone not yet at its deepest: « en se creusant vers toi » takes it there
  const LODGED = { dist: 0, cone: 0.6, mushroom: 1, pierce: 0.35, tense: 0.3, ring: 1, share: 0, breaks: 1, trail: 0 };

  /* ── CHUTE — « Voilà le secret : ton gilet n'est pas un mur. C'est un filet. Il attrape la balle… en se creusant vers toi. » ── */
  const VERDICT = { ...VIEW.verdict, tx: -11, ty: 109, d: 105, az: 30 };
  cut(t.toverdict, SET.SCENE, VERDICT, { ...STAGED, ...LODGED, riot: 0, mood: 0, ...LIGHT.panel });
  st(t.toverdict + 0.04, 0.5, { shell: 0 }, "sine.inOut"); // the street and its stones leave (retouche): him, the panel, the ghost
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.filet - 0.3, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  st(t.mur - 0.36, 0.34, { wall: 1 }, "sine.out"); //                    the ghost plate is there ON « mur »
  st(t.mur - 0.28, 0.5, { bounce: 0.5 }, "none"); //                     its ghost bullet comes at it: contact ≈ 65.0 (the blip)
  st(t.mur + 0.22, 0.6, { bounce: 1 }, "sine.out"); //                   …and bounces back up the street
  st(t.filet - 0.36, 0.42, { wall: 0, litWeave: 1 }, "sine.inOut"); //    « un filet »: the plate goes, the weave lights
  punch(t.filet, 0.06);
  st(t.attrape, 0.5, { tense: 1 }, "power2.out"); //                      « attrape »: the struck yarns pull tight, veille
  st(t.creusant, 0.72, { cone: 1 }, "sine.inOut"); //                     « en se creusant vers toi »: the cone deepens, the bullet with it

  /* ── CE QUI EST DÛ — « Et ce choc dans ton ventre ? C'était le tissu, creusé contre toi. » ── */
  st(t.ventre - 0.08, 1.4, { wave: 1 }, "none"); //                        the blow runs over his belly and ribs, signal
  st(t.ventre - 0.08, 0.4, { litWeave: 0.35 }, "sine.inOut"); //           …the question: the fabric goes quiet
  st(t.tissu - 0.06, 0.32, { litWeave: 1 }, "power2.out"); //              « le tissu »: the answer lights up
  /* « La norme américaine tolère 44 millimètres de creux. » — the clay on the halo, the panel left in its pocket */
  st(t.toclay, 0.9, { shell: 0, riot: 0, you: 0, xray: 0, vest: 0, litWeave: 0, tense: 0.3, clay: 1, dent: 1, pool: 0.25, grid: 0.16, ...LIGHT.clay }, "sine.inOut");
  now(t.toclay + 0.92, { set: SET.BENCH, wave: 0 });
  st(t.norme + 0.16, 0.4, { gauge: 0.2 }, "sine.out"); //                   the edge laid across the dent
  st(t.norme + 0.62, t.quarante + 0.04 - (t.norme + 0.62), { gauge: 1 }, "sine.inOut"); // the probe at the bottom ON « 44 »: the header reads 44 mm

  /* ── LA QUESTION — « En commentaire : un gilet pare-balles arrête aussi un couteau… vrai, ou faux ? » ── */
  // the gauge holds 44 until « commentaire » (main.js freezes the header's « Creux » there), then the clay goes…
  st(t.commentaire + 0.02, 0.4, { clay: 0, dent: 0, gauge: 0 }, "sine.inOut");
  st(t.commentaire + 0.44, 0.4, { section: 0, ...LIGHT.bench }, "sine.inOut"); // …then the cut closes: the clay's flip at 0.5 is unseen
  st(t.commentaire + 0.2, 0.75, { out: 1 }, "power2.out"); //               « un gilet pare-balles »: the panel onto the halo, in place ON « gilet »
  punch(t.commentaire, 0.06);
  st(t.couteau - 0.5, 0.62, { blade: 1 }, "sine.out"); //                  the ghost blade comes and stops 3 cm short: no contact
  duelCall(tl, { from: t.commentaire - 0.5, aAt: t.duelA, bAt: t.duelB, to: t.like - 0.3, toneA: null, toneB: null });

  /* ── LIKE — « Like : pour quelqu'un qui l'enfile avant chaque service. » ── */
  st(t.tolike, 0.5, { blade: 0 }, "sine.inOut");
  st(t.tolike + 0.12, 0.62, { section: 1 }, "sine.inOut"); //               « Like »: the cut sweeps the panel open — the cone, the mushroom caught in it
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });
  punch(t.service, 0.06);

  /* ── PROCHAIN DOSSIER, en tout dernier — « Abonne-toi : prochain dossier, une fusée qui porte son propre explosif… » ── */
  st(t.toabo + 0.05, 1.25, { out: 0 }, "sine.inOut"); //                   the panel slides home into its pocket: out of the frame, out of the way
  st(t.toabo + 0.35, t.fusee - 0.3 - (t.toabo + 0.35), { teaser: 0.5 }, "sine.out"); // the rocket comes up as the panel leaves: never an empty frame
  st(t.explosif - 0.04, 0.55, { teaser: 1 }, "power2.out"); //            its charge lights along the body ON « explosif »
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.25, railTo: t.aboEnd + 0.15 });
  punch(t.elle, 0.05, { hold: 0.12, down: 0.3 }); //                       let go 0.4 s before the loop's cut

  /* ── the orbit: one move, az +30 → −76, through every idea of the end without stopping on any ── */
  const RX = TEASER.at[0], RY = TEASER.at[1], RZ = TEASER.at[2];
  const [MX, MY, MZ] = IMPACT_BENCH;
  path([
    [t.toverdict, VERDICT],
    [t.chute + 0.95, { tx: -12.5, ty: 107.5, d: 74, az: 26 }], //          « Voilà le secret »: the panel in the middle, close (retouche)
    [t.mur + 0.07, { tx: -18, ty: 108, d: 70, az: 22 }], //                the ghost plate, its bullet's trail and the bounce on the left
    [t.attrape, { tx: -10.5, ty: 107.5, d: 54, az: 12 }], //               « un filet »: the lit layers and the V, big
    [t.creusant + 0.36, { tx: -9, ty: 108, d: 86, az: 3 }], //              the section square on: the cone in profile
    [t.ventre, { tx: -5, ty: 113, d: 128, az: -8, el: 8 }], //               the belly and the ribs
    [t.creuse, { tx: -9, ty: 109, d: 108, az: -18, el: 7 }], //               the cone against him
    [t.toclay + 0.5, { tx: -12, ty: 107, tz: 48, d: 92, az: -25, el: 8 }], // the eye turns to the clay coming up
    [t.quarante - 0.1, { ...VIEW.clayView, tx: -12, tz: 69, d: 64, az: -31, shift: 120 }],
    // the panel whole, standing on the halo, then the blade with it in the frame (retouche: no more dark slab at the edge)
    [t.gilet, { tx: MX + 3, ty: 112, tz: MZ - 4, d: 118, az: -37, el: 12, fov: 32, shift: 60, dof: 0 }],
    [t.couteau, { ...VIEW.blade, tx: MX - 7, ty: 111, tz: MZ - 3, d: 118, el: 12, shift: 60 }],
    [t.duelA, { d: 108 }], //                                               the panel still whole on « vrai »
    [t.like + 0.1, { tx: MX + 2, ty: MY, tz: MZ, d: 46, az: -50, el: 12, fov: 30, shift: 40, dof: 6 }], // the mushroom caught in the cone, in section
    [t.service, { d: 56, az: -57, dof: 0 }],
    [t.dossier + 0.2, { tx: RX - 20, ty: RY + 66, tz: RZ + 14, d: 185, az: -62, el: 7, fov: 34, shift: -70, side: 40 }],
    // the rocket's nose just under the #next panel (512–888), its body down past the captions, left of TikTok's buttons;
    // the panel back in its pocket stays out of the frame (bottom-left, below 1750 at worst)
    [t.explosif, { tx: RX, ty: RY + 79, tz: RZ, d: 185, az: -68, el: 9, fov: 34, shift: -160, side: 80 }],
    [t.toloop - 0.02, { d: 200, az: -72, side: 90 }],
  ]);

  /* ── REBOUCLAGE — « Et cette nuit-là… »: the first frame, a step behind; the bullet flattens into the cone as at frame 0 ── */
  const BEHIND = { cone: 0.4, mushroom: 0.45, ring: 0.25, pierce: 0.15, tense: 0.4, breaks: 0.4 };
  cut(t.toloop, SET.SCENE, VIEW.back, { ...FIRST, ...BEHIND });
  // the move runs from the cut (linear) and hands over to D.loop at the same speed (sine.out): no stop at `rewind`
  const k = 0.37; // share of the way done by `rewind`: (rewind − toloop) / (end − toloop) × π/2 matched
  const mid = (a, b) => a + (b - a) * k;
  shot(t.toloop, t.rewind - t.toloop, { az: mid(VIEW.back.az, VIEW.hook.az), d: mid(VIEW.back.d, VIEW.hook.d) }, "none");
  st(t.toloop, t.rewind - t.toloop, Object.fromEntries(Object.entries(BEHIND).map(([n, v]) => [n, mid(v, FIRST[n])])), "none");
  D.loop({ at: t.toloop, rewindAt: t.rewind, ease: "sine.out" });
}
