// DOSSIER 043 — the chute, what the film owes, the like, the next file last, the loop (toverdict → end).
// Plan-séquence: one path per place, az DECREASING in each, every key a few degrees further round; the calm end is an
// orbit that never stops. Cuts: toverdict (invisible, on act 3's last pose) · tocta · tolike · toabo · toloop.
// The loop: a cut on POSE0 turned 12° on the way the film turns, then D.loop WITHOUT fromD (041's trap: a black MP4
// from 91.0 to 92.4 s) and in ease "none" from just after the cut: the camera glides onto POSE0 at an even pace and
// every number back to FIRST — `gap` among them, so the train runs at the hook's 900 cm/s: the cut puts the ring's
// big gap at the grain (an empty pipe on « Une balle »), and the train's head rushes past the grain on « vite ».
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, FIRST, POSE0, LIGHT, TEASER } from "./world.js";

/* the chute: from up the line (act 3's last pose) down to the block's face, the « e » alone */
const VERDICT = VIEW.verdict; //                                         act 3 passes through it at speed: the seam is invisible
const FACE = { ...VIEW.etrace, dof: 0 }; //                              « on l'étale »: the « e » alone, the face 70 % (the lens off: at d 125 it was a blur)
/* the comment: the grain in the empty pipe, the 37 grains in a row behind it (their rings face az −60) */
const TALLY = { ...VIEW.tally, az: -55 }; //                             (the orbit rises in el rather than turning past −67: the monitors' green bars come in at the bottom right)
/* the like: the grain before the train — the train moves (calme, 300 cm/s) so a wagon gap passes: close up the train
   is a white bar, it reads « train » only when a gap goes by */
const LIKE = { ...VIEW.like, tx: 20, az: -74 }; //                      the grain in the frame from the first frame of the shot
const LIKE_V = 300; // cm/s
const LIKE_GAP = 8462; // a wagon gap crosses the aim (x ≈ 40) at ≈ 79.4 and ≈ 81.2 s; the ring's big gap stays behind the lens
/* the 044 teaser: the vest under seals, the stone in its ribs (local y 36, in front of the plate) */
const VEST = { tx: TEASER.at[0], ty: TEASER.at[1] + 36, tz: TEASER.at[2] + 9, fov: 34, shift: -110, dof: 0 };
/* the loop — the first frame, 12° further round on the way the whole film turns (az decreasing), a touch further back */
const BACK = { ...POSE0, d: POSE0.d * 1.05, az: POSE0.az + 12 };
const HOOK_V = 900; // cm/s: the train's speed on the first frame (acte1)

export default function fin({ D }) {
  const { tl, st, path, cut, punch } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", train: "chute:train", pas: "verdict", sur: "chute:sur", point: "chute:point",
    jette: "chute:jette", dehors: "chute:dehors", etale: "chute:l'étale",
    tocta: "tocta", grains: "comment:grains", trente: "comment:37",
    commentaire: "comment:commentaire", prudent: "duelA", assez: "duelB",
    tolike: "tolike", like: "like", grain: "like:grain", rien: "like:rien",
    toabo: "toabo", prochain: "abo:prochain", policier: "abo:policier", pierre: "abo:pierre",
    etait: "abo:c'était", balle: "abo:balle", aboEnd: "abo$", toloop: "toloop",
  });
  const SHORT = { hold: 0.12, down: 0.3 }; // a punch with a cut close behind it

  /* ───────────── CHUTE « Voilà le secret : ce train, on ne l'encaisse pas sur un point. On le jette dehors… et on
     l'étale. » — the block cools, its « e » still orange; the camera comes down the line to the face. ───────────── */
  cut(t.toverdict, SET.RING, VERDICT, { ...STAGED, beam: 0, dump: 1, paint: 0, heat: 0.9, pool: 1, mood: 0, ...LIGHT.block });
  st(t.toverdict + 0.2, t.tocta - t.toverdict - 0.2, { heat: 0.4 }, "sine.inOut"); // it cools; the trace stays orange
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.etale - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  punch(t.pas, 0.06);
  st(t.sur - 0.05, t.point - t.sur + 0.25, { point: 0.7 }, "power2.out"); //  « sur un point »: the ghost, the whole train on one spot
  st(t.jette - 0.1, 0.45, { point: 0 }, "sine.inOut"); //                    gone: it is not what happens
  st(t.jette, t.dehors - t.jette + 0.5, { litLine: 0.7 }, "sine.inOut"); //   « on le jette dehors »: the way out
  st(t.etale - 0.3, 0.8, { litLine: 0 }, "sine.inOut");
  punch(t.etale, 0.06);
  path([
    [t.toverdict, VERDICT],
    [t.train, { tz: VERDICT.tz - 100, d: 900, az: -162, el: 18 }], //         « ce train »: the line empty, the face rising in the frame
    [t.point, { tx: FACE.tx, ty: FACE.ty, tz: FACE.tz, d: 520, az: -164, el: 14 }], // coming down to the face
    [t.etale, { ...FACE, d: 240, az: -166, el: 10 }], //                      the « e » big
    [t.tocta, { ...FACE, d: 215, az: -169, el: 8 }],
  ]);

  /* ───────────── COMMENTAIRE « Et ces grains, combien ont gagné ? Trente-sept fois, en moins de deux ans. En
     commentaire : couper pour un grain… trop prudent, ou juste assez ? » ───────────── */
  cut(t.tocta, SET.RING, TALLY, { ...STAGED, beam: 0, gap: 0, grain: 0, sensors: 0, ...LIGHT.grain, mood: 0 }); // (the floating grain sat cut at the frame's edge; the monitors' green bars sat at the bottom: dark)
  st(t.grains + 0.2, t.trente - t.grains - 0.2, { grains: 37 }, "none"); //  the row fills: 37 when the voice says it
  duelCall(tl, { from: t.prudent - 0.6, aAt: t.prudent, bAt: t.assez, to: t.tolike - 0.34, toneA: "signal", toneB: "veille" });
  punch(t.assez, 0.06);
  path([
    [t.tocta, TALLY],
    [t.trente, { d: 178, az: -58, el: 13 }],
    [t.commentaire, { d: 186, az: -61, el: 16 }],
    [t.prudent, { d: 194, az: -64, el: 19 }],
    [t.tolike, { d: 202, az: -67, el: 22 }],
  ]);

  /* ───────────── LIKE « Like : pour celui qui croit qu'un grain de poussière, c'est rien. » — the grain before the
     train; on « grain » it drops into the beam, on « rien » it rains (it is not nothing) ───────────── */
  cut(t.tolike, SET.RING, LIKE, { ...STAGED, gap: LIKE_GAP, grain: 0.35, ...LIGHT.grain, mood: 0 });
  st(t.tolike, t.toabo - t.tolike, { gap: LIKE_GAP + LIKE_V * (t.toabo - t.tolike) }, "none");
  st(t.grain - 0.1, 0.6, { grain: 1 }, "sine.inOut"); //                  « grain »: it falls into the beam
  st(t.rien - 0.05, t.toabo - t.rien + 0.05, { spray: 0.6, coil: 0.3 }, "power2.out"); // « rien »: the shower starts
  likeCall(tl, { from: t.like, to: t.toabo - 0.33, count: 5, label: (n) => `${n} personne${n > 1 ? "s" : ""}` });
  path([
    [t.tolike, LIKE],
    [t.grain, { tx: 10, d: 82, az: -80, el: 6 }],
    [t.toabo, { tx: 4, d: 74, az: -86, el: 7 }],
  ]);

  /* ───────────── PROCHAIN DOSSIER — the 044, last: nothing of the beam after « Abonne-toi » ───────────── */
  cut(t.toabo, SET.RING, { ...VEST, d: 340, az: -12, el: 12 }, {
    ...STAGED, beam: 0, shell: 0, ring: 0, cavern: 0, pool: 0, sensors: 0, arm: 0, teaser: 0.22, mood: 0,
    fx: TEASER.at[0], fy: 0, fz: TEASER.at[2], fs: 120,
  });
  st(t.toabo + 0.05, t.policier - t.toabo - 0.05, { teaser: 0.4 }, "sine.inOut"); // the vest under seals lights
  st(t.etait, t.balle - t.etait + 0.15, { teaser: 1 }, "sine.inOut"); //            « C'était une balle »: the stone turns
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.2, railTo: t.aboEnd + 0.15 });
  punch(t.balle, 0.06, SHORT);
  path([
    [t.toabo, { ...VEST, d: 340, az: -12, el: 12 }],
    [t.policier, { d: 300, az: -18, el: 10 }],
    [t.pierre, { d: 190, az: -24, el: 8, shift: -60 }], //            « une pierre »: toward the stone in its ribs
    [t.balle, { ty: VEST.ty + 2, d: 74, az: -30, el: 7, shift: -20 }], //              « une balle »: the copper mushroom three-quarters, a third of the width
    [t.toloop, { ty: VEST.ty + 2, d: 66, az: -34, el: 6 }], //                         (its shape and tilt: anneau.js, the teaser's stone)
  ]);

  /* ───────────── BOUCLE « Une balle, ça va vite. Mais… » — the train comes back at the hook's speed: the cut sets
     every number to FIRST but `gap` (behind by the loop's run), the grain at the pipe's top, the shower faint;
     D.loop (ease "none") glides them home — the train runs at 900 cm/s, its head passes the grain on « vite » ─── */
  const rewindAt = t.toloop + 0.04;
  cut(t.toloop, SET.RING, BACK, { ...FIRST, gap: FIRST.gap - HOOK_V * (D.tEnd - rewindAt), grain: 0.1, spray: 0.04 });
  D.loop({ at: t.toloop, rewindAt, ease: "none" });
}
