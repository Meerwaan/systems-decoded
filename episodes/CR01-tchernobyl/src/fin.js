// 03 · DEPUIS — issue → boucle (toissue → end): the toll, the effect already seen, the redesigned rod (the only red → green of the
// film), the French reactor that slows down by itself, the two enquiries and the question in two answers, the next file, the loop.
// Starts with a complete cut at `toissue`. Nothing of the subject comes back after the announcement; the last frame IS the first.
//   issue    the burning top of the stack, low and close (the slab out of frame: `slab` 1 leaves it in the air) · chip-bilan, the
//            « 28 » on its word
//   pire     the master shot of the canal again: on « effet des barres » the foot goes red and chases the water, as at `defaut`;
//            chip-1983 on « trois »; the felt-pen circle on « parades »
//   depuis   the rod alone: red → green from « redessinées » to « graphite », the displacer lengthens on « plus d'eau sous le
//            graphite », the rod drops fast on « douze secondes » (chip-12s)
//   france   the French fuel channel in its water: it boils on « chauffe », the glow and the neutrons fall on « ralentit »
//   comment  ONE shot in the control room: the crew (« les hommes »), the AZ-5 button red on « la machine », then the whole room,
//            neutral, under the duel — neither answer lights in green (green = « bon » in this format: the film never answers)
//   abo      the core whole, calm, in the light of `depuis`, sinking under the next-file panel
//   boucle   the cut back to the first frame's state, a little farther than POSE0, and the glide home (D.loop)
import { setAct } from "@kit/overlay.js";
import { duelCall, nextFile } from "@kit/blocks.js";
import { feutre } from "@kit/reconstitution.js";
import { STAGED, VIEW, SET, BENCHED, FIRST, POSE0, W } from "./world.js";

export default function fin({ D, world }) {
  const { tl, st, cut, shot } = D;
  const t = D.times({
    toissue: "toissue", morts: "morts", v28: "issue:28", pompiers: "pompiers", topire: "topire", pire: "pire", effet: "effet", trois: "trois",
    parades: "parades", todepuis: "todepuis", redessinees: "redessinees", eau3: "eau3", graphite: "depuis:graphite", douze: "douze",
    dixhuit: "depuis:18", tofrance: "tofrance", france: "france", chauffe2: "chauffe2", ralentit2: "ralentit2", seule: "seule",
    tocta: "tocta", hommes1: "hommes1", tomachine: "tomachine", seconde2: "seconde2", machine1: "machine1", toi: "comment:toi", accuse: "comment:accusé",
    commentaire: "commentaire", duelA: "duelA", duelB: "duelB", toabo: "toabo", prochain: "prochain", deepwater: "deepwater",
    vanne: "vanne", toloop: "toloop", rewind: "rewind",
  });
  const canalAim = (local) => {
    const [tx, ty, tz] = W("canal", local);
    return { tx, ty, tz };
  };
  const coeurAim = (local) => {
    const [tx, ty, tz] = W("coeur", local);
    return { tx, ty, tz };
  };
  const salleAim = (local) => {
    const [tx, ty, tz] = W("salle", local);
    return { tx, ty, tz };
  };

  /* ISSUE — « Deux morts cette nuit-là. 28 pompiers et employés dans les mois suivants. » The burning top of the stack, low and
     close (raccord: the fire of t8), the slab gone out of the top of the frame; sober, a slow push. */
  const ISSUE = { ...VIEW.coeur, ...coeurAim([0, 110, 0]), d: 400, az: -62, el: 40, fov: 34, shift: 190, side: 0, drift: 0.2, dof: 0 };
  // fault 0: the burning top is the one red of the shot (the cut face back to clay)
  cut(t.toissue, SET.COEUR, ISSUE, { ...STAGED.coeur, fault: 0, ok: 0, viol: 0, pLow: 0.5, pHigh: 0.5, rodsIn: 0.25, scram: 0.4, blast: 0, slab: 1, blast2: 1, fire: 0.55 });
  shot(t.toissue, t.topire - t.toissue - 0.05, { ...ISSUE, d: 360, az: -58 }, "sine.inOut", ISSUE.d);
  st(t.toissue, t.topire - t.toissue, { fire: 0.3 }, "sine.inOut");
  D.chip("chip-bilan", null, 96, 470, t.morts - 0.1, t.topire - 0.3);
  tl.fromTo("#chip-bilan b, #chip-bilan i", { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power2.out", immediateRender: false }, t.v28 - 0.06);
  tl.set("#chip-bilan b, #chip-bilan i", { opacity: 0 }, 0);

  /* PIRE — « Cet effet des barres, on l'avait déjà vu trois ans plus tôt. Les parades n'avaient pas été appliquées. » The master
     shot of the canal again (the callback): on « effet » the foot turns red and enters, the bottom water is chased; the camera
     dives to the foot by ratio; the felt-pen circle on « parades ». */
  const PIRE0 = { ...VIEW.canal, drift: 0.2 };
  const PIRE1 = { ...VIEW.canal, ...canalAim([0, 70, 0]), d: 620, az: -64, el: 5, shift: 120, drift: 0.2 };
  cut(t.topire, SET.CANAL, PIRE0, { ...STAGED.canal, fault: 0, ok: 0, depuis: 0, rod: 0, flux: 0, split: 0, xenon: 0, newRod: 0, solo: 0, rep: 0, steam: 0.6, pLow: 0.3, pHigh: 0.3 });
  shot(t.topire + 0.1, t.parades - t.topire - 0.1, PIRE1, "sine.inOut", VIEW.canal.d);
  st(t.effet - 0.05, 0.25, { fault: 1 }, "power2.out");
  st(t.effet, t.trois - t.effet, { rod: 0.18 }, "sine.inOut");
  D.chip("chip-1983", null, 96, 470, t.trois - 0.1, t.todepuis - 0.32);
  feutre(D, { id: "feutre-1983", anchor: world.canal.A.fault, kind: "circle", w: 190, h: 420, dy: -170, from: t.parades - 0.05, to: t.todepuis - 0.34, seed: 11 });

  /* DEPUIS — « Depuis, ces barres ont été redessinées : plus d'eau sous le graphite, douze secondes au lieu de 18. » The rod alone,
     red on its halo; the only part of the film that goes from red to green, light and rod together. */
  setAct(tl, 3, t.todepuis);
  const SOLO = { ...VIEW.rodSolo, ...canalAim([0, 100, 0]), d: 700, az: -48, el: 10, shift: 150, drift: 0.2 };
  cut(t.todepuis, SET.CANAL, SOLO, { ...BENCHED, fault: 1, ok: 0, depuis: 0, newRod: 0, steam: 0.3, pLow: 0.3, pHigh: 0.3 });
  shot(t.todepuis, t.tofrance - t.todepuis - 0.05, { ...SOLO, d: 620, az: -44 }, "sine.inOut", SOLO.d);
  // red → green: the red glow fades over the first half of `depuis`, the green comes over the second (kit paint(): `fault` stays 1)
  const heal0 = t.redessinees, heal1 = t.graphite + 0.2;
  st(heal0, heal1 - heal0, { depuis: 1 }, "sine.inOut");
  st(t.eau3 - 0.1, t.graphite - t.eau3 + 0.4, { newRod: 1 }, "sine.inOut");
  st(t.douze, t.dixhuit - t.douze + 0.2, { rod: 0.6 }, "power2.inOut");
  D.chip("chip-12s", null, 96, 470, t.douze - 0.1, t.tofrance - 0.3);

  /* FRANCE — « En France, nos réacteurs font l'inverse : quand l'eau chauffe, la réaction ralentit. Toute seule. » Raccord: the green
     rod → the fuel pencil. The French channel in its water, no graphite: it boils on « chauffe », the glow falls on « ralentit ». */
  const FUEL = { ...VIEW.fuel, d: 780, az: -60, el: 12, shift: 100, dof: 0, drift: 0.2 };
  const fuelLight = W("canal", [0, 120, -44]);
  cut(t.tofrance, SET.CANAL, FUEL, { ...STAGED.canal, fx: fuelLight[0], fy: fuelLight[1], fz: fuelLight[2], fs: 70, fault: 0, ok: 1, depuis: 1, rep: 1, solo: 0, newRod: 1, rod: 0, flux: 1, split: 0, xenon: 0, steam: 0, pLow: 0.6, pHigh: 0.6 });
  shot(t.tofrance, t.tocta - t.tofrance - 0.05, { ...FUEL, d: 680, az: -64 }, "sine.inOut", FUEL.d);
  st(t.chauffe2 - 0.15, 1.0, { steam: 1 }, "sine.inOut");
  st(t.ralentit2 - 0.1, 0.9, { pLow: 0.15, pHigh: 0.15 }, "sine.inOut");
  D.punch(t.seule, 0.06, { hold: 0.12, down: 0.32 });

  /* COMMENT — « La première enquête a accusé les hommes. La seconde, surtout la machine. Et toi, en commentaire : les hommes… ou la
     machine ? » Three shots in the control room, cut (a dive from the crew to the desk passes through a silhouette): the crew; the
     AZ-5 button, green, that turns red on « machine » (the button that was to stop it); the whole room, low in the frame, all clay
     (`ok` 0, `fault` 0: nothing green, nothing red), under the duel. */
  const ROOM = { ...VIEW.salle, drift: 0.2 };
  const BUTTON = { ...VIEW.az5, ...salleAim([136, 97, -46]), d: 160, az: -60, el: 24, fov: 34, shift: -40, drift: 0.2 }; // over the shoulders: no silhouette near the lens
  const DUEL = { ...VIEW.salle, d: 980, el: 12, shift: -260, drift: 0.2 };
  // `depuis` 0: the salle in the warm black of the night (the light of `depuis` washes this set grey)
  cut(t.tocta, SET.SALLE, ROOM, { ...STAGED.salle, fault: 0, ok: 1, viol: 0, depuis: 0, crew: 1, prot: 1, az5: 0, rodsIn: 0.25, scram: 0 });
  shot(t.tocta, t.tomachine - t.tocta, { ...ROOM, d: 800, az: -71 }, "sine.inOut", VIEW.salle.d);
  cut(t.tomachine, null, BUTTON, { fault: 0 });
  shot(t.tomachine, t.toi - 0.28 - t.tomachine, { ...BUTTON, d: 140, az: -57 }, "sine.inOut", BUTTON.d);
  st(t.machine1 - 0.05, 0.25, { fault: 1 }, "power2.out");
  const duelAt = t.toi - 0.28; // a few frames before « Et toi »
  cut(duelAt, null, DUEL, { fault: 0, ok: 0 });
  shot(duelAt, t.toabo - duelAt - 0.05, { ...DUEL, d: 1060, az: -66 }, "sine.inOut", DUEL.d);
  D.chip("chip-insag1", null, 96, 470, t.tocta + 0.1, t.tomachine - 0.24);
  // the verdict of 1986 on « accusé » (the chip leaves before the cut on « La seconde »)
  tl.fromTo("#chip-insag1 b", { opacity: 0 }, { opacity: 1, duration: 0.16, ease: "power2.out", immediateRender: false }, t.accuse - 0.06);
  tl.set("#chip-insag1 b", { opacity: 0 }, 0);
  D.chip("chip-insag7", null, 96, 470, t.seconde2 - 0.02, duelAt - 0.2);
  tl.fromTo("#chip-insag7 b", { opacity: 0 }, { opacity: 1, duration: 0.16, ease: "power2.out", immediateRender: false }, t.machine1 - 0.3);
  tl.set("#chip-insag7 b", { opacity: 0 }, 0);
  duelCall(tl, { from: t.commentaire - 0.5, word: t.commentaire, aAt: t.duelA, bAt: t.duelB, to: t.toabo - 0.32, toneA: null, toneB: null }); // gone (0.28 s) before the cut on « Abonne-toi »

  /* ABO — « Abonne-toi : chaque compte à rebours, un vrai accident, et une sécurité qui lâche. Prochain : Deepwater Horizon… »
     The core whole, calm, its rods green, in the light of `depuis`; it sinks slowly under the next-file panel. */
  const CALM = { ...VIEW.coeur, drift: 0.2 };
  cut(t.toabo, SET.COEUR, CALM, { ...STAGED.coeur, fault: 0, ok: 1, viol: 0, depuis: 1, pLow: 0.2, pHigh: 0.2, rodsIn: 0.25, scram: 0, blast: 0, slab: 0, blast2: 0, fire: 0 });
  shot(t.toabo, t.toloop - t.toabo - 0.1, { ...CALM, d: 1700, az: -50, shift: -140 }, "sine.out", VIEW.coeur.d); // small, between the panel and the captions
  nextFile(tl, { showAt: t.deepwater - 0.15, factAt: t.vanne - 0.1, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.prochain + 0.5 });

  /* BOUCLE — « Comme ici à… » back in the first frame's world, a little farther; D.loop glides camera and numbers home. */
  const BACK = { ...POSE0, d: POSE0.d * 1.16 };
  cut(t.toloop, SET.COEUR, BACK, { ...FIRST, scram: 0.05, pLow: 0.72 });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: BACK.d });
}
