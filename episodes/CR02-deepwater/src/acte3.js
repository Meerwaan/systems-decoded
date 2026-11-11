// 02 · LE DÉFAUT → 03 · DEPUIS → the end (todefaut → end). docs/CR02-actes.md « acte3.js », docs/CR02-actes-maj.md. PLAN-SÉQUENCE
// (docs/recette-actes.md): one D.path per place, keys 1 to 3 s apart, and the az always turns the SAME way on screen (less negative,
// as in acte2b) — every path enters its cut and leaves it running ("go"); the end is one slow orbit; the loop cuts on POSE0 a bit
// further and turned 12°, then D.loop glides back to it (no other path on top).
//   1. defaut  THE MASTER SHOT, one path: the blades on the pipe, a thread of red above · « Le tube » the blades open (back in time),
//              the pipe stands straight · « plié » it buckles off-centre, red, circled · « la pression dedans » the red fills it ·
//              « tuyau d'arrosage » it waves once and lies against the wall · « les lames l'ont percé » they close on it off-centre:
//              pinched, pierced · « couper » the red jets through the hole — the moment in full, no cut on it
//   2. pire    the pods, one path: « boîtier » the panel opens, « batterie… vide » the gauge falls, red · « l'autre » a slide along
//              the LMRP to the valve, « câblée » red, the two opposed arrows · « pile » the 9 V pile red (one red at a time)
//   3. issue   the rig after, sober: « coule » it sinks, the fire dies · « trois mois » the BOP and its leak (the plume)
//   4. depuis  the BOP as it failed, healed on the words: the light (Depuis… États-Unis) · « deux jeux » the second shear ram ·
//              « au centre » the ring, the pipe straight, green · « cisaillement » the clean cut, green
//   5. comment « Un tube plié » → the master shot again (red, circled) · « deux cadrans » → the two dials, the duel (no answer lights)
//   6. abo     the rig at night, calm, a slow orbit under the panel · boucle: back to the first image (D.loop)
import { setAct } from "@kit/overlay.js";
import { duelCall, nextFile } from "@kit/blocks.js";
import { feutre } from "@kit/reconstitution.js";
import { STAGED, VIEW, SET, BENCHED, FIRST, POSE0, W, lit } from "./world.js";

const aim = (name, local) => {
  const [tx, ty, tz] = W(name, local);
  return { tx, ty, tz };
};

// every number of a maquette, so that each cut says the whole state (nothing inherited from the act before)
const RIG = { culprit: 0, fault: 0, ok: 0, depuis: 0, jet: 0, spill: 0, blast: 0, fire: 0, sink: 0, lamps: 1 };
const WELL = {
  culprit: 0, fault: 0, ok: 0, depuis: 0, sea: 0, balance: -1, gas: 0, gasBase: 0, debit: 0, mark: 0,
  dialTube: 0, dialLine: 0, eds: 0, signal: 0, link: 1, annular: 0, vbr: 0, bsr: 0,
};
const STACK = {
  culprit: 0, fault: 0, ok: 0, depuis: 0, annular: 0, vbr: 0, bsr: 0, flow: 1, pass: 1, buckle: 0, inside: 0, amf: 0, link: 1,
  podOpen: 0, charge: 1, coils: 0, plume: 0, rams2: 0, ring: 0, shear: 0,
};

export default function acte3({ D, world }) {
  const { tl, st, cut, path, punch, chip } = D;
  const A = world.bop.A;
  const t = D.times({
    todefaut: "todefaut", toujours: "toujours", pourquoi: "defaut:pourquoi", letube: "letube", plie: "plie",
    pression: "defaut:pression", dedans: "defaut:dedans", arrosage: "arrosage", centre: "centre", lames: "defaut:lames",
    perce: "perce", couper: "couper",
    topire: "topire", hasard: "hasard", boitier: "boitier", batterie: "batterie", vide: "pire:vide", lautre: "lautre",
    vanne: "vanne", cablee: "pire:câblée", pile: "pile",
    toissue: "toissue", morts: "morts", jours: "jours", coule: "coule", tard: "issue:tard", mois: "mois", barils: "barils",
    todepuis: "todepuis", etats: "depuis:États-Unis", deux: "deux", garder: "depuis:garder", centre2: "centre2",
    cisaillement: "cisaillement", expert: "expert",
    tocta: "tocta", plie2: "plie2", mais: "mais", cadrans2: "cadrans2", commentaire: "commentaire", mille: "comment:mille",
    zero: "comment:zéro", duelA: "duelA", duelB: "duelB",
    toabo: "toabo", chaque: "chaque", lache: "lache", toloop: "toloop", rewind: "rewind",
  });
  const B = (local, o) => ({ ...aim("bop", local), ...o });
  const Pw = (local, o) => ({ ...aim("puits", local), ...o });
  const Rg = (y, o) => ({ ...aim("plateforme", [0, y, 0]), ...o });

  /* ── 1 · 02 LE DÉFAUT — the master shot, one path (raccord: the blades closing, close → the same, in section, wide) ── */
  setAct(tl, 2, t.todefaut);
  const M0 = { ...VIEW.master, az: -74 };
  cut(t.todefaut, SET.BOP, M0, {
    ...STAGED.bop, ...STACK, ...lit("bop", [0, 84, 0], 100),
    flow: 1, pass: 0.4, vbr: 1, annular: 1, inside: 1, bsr: 0.9, buckle: 1, amf: 1, link: 0, culprit: 2, fault: 0, ok: 1,
  });
  path([
    [t.todefaut, M0],
    [t.toujours, B([0, 84, 0], { d: 328, az: -72, el: 4, shift: 36 })],
    [t.letube, B([0, 82, 0], { d: 292, az: -69, el: 5, shift: 24 })], // « Tu sais pourquoi ? » — a slow push in the silence
    [t.plie, B([0, 80, 0], { d: 250, az: -67, el: 5, shift: 10 })],
    [t.arrosage, B([0, 80, 2], { d: 214, az: -61.5, el: 6, shift: 0 })],
    [t.centre, B([0, 80, 3], { d: 194, az: -59.5, el: 6, dof: 6 })],
    [t.perce, B([0, 79, 3], { d: 146, az: -52, el: 6 })], // closer and further round: the waist and the kink read at 270 px
    [t.topire - 0.04, B([0, 79, 3], { d: 134, az: -48.5, el: 7 })],
  ]);
  // « Le tube s'était plié » — back in time: the blades open, the pipe stands straight, nothing passes the VBR…
  st(t.letube - 0.08, 0.36, { bsr: 0, pass: 0, inside: 0.25 }, "power2.out");
  st(t.letube + 0.3, t.plie - 0.06 - t.letube - 0.3, { buckle: 0 }, "sine.inOut");
  // …then it buckles off-centre on « plié », and turns red: the culprit
  st(t.plie, t.dedans - t.plie, { buckle: 1 }, "sine.inOut");
  st(t.plie, 0.2, { fault: 1 }, "power2.out");
  punch(t.plie, 0.06);
  feutre(D, { id: "feutre-tube", anchor: A.pipeBend, kind: "circle", w: 300, h: 460, from: t.plie + 0.1, to: t.arrosage - 0.1, draw: 0.4, seed: 7 });
  // « tordu en partie par la pression dedans » — the red fills the pipe on the word
  st(t.pression - 0.1, t.dedans + 0.1 - t.pression, { inside: 1 }, "sine.out");
  // « comme un tuyau d'arrosage » — it waves once and lies against the wall
  st(t.arrosage, 0.55, { buckle: 0.78 }, "sine.inOut");
  st(t.arrosage + 0.55, 0.7, { buckle: 1 }, "sine.inOut");
  // « Hors du centre, les lames l'ont percé… sans le couper net. » — pinched, pierced; the red jets through the hole
  st(t.lames - 0.2, t.perce + 0.12 - t.lames + 0.2, { bsr: 0.95 }, "sine.inOut");
  st(t.perce - 0.05, 0.45, { pass: 0.45 }, "sine.out");
  st(t.couper, 0.35, { pass: 1 }, "power2.out");
  punch(t.couper, 0.06, { hold: 0.18, down: 0.4 });

  /* ── 2 · « Et le pire ? » — the pods, one path (raccord: the flank of the stack → the pods on it) ── */
  const cutAutre = t.lautre - 0.12; // « Dans l'autre » — the cut sits a few frames before the sentence
  const P0 = B([10, 112, 0], { d: 540, az: -80, el: 8, shift: 40 });
  cut(t.topire, SET.BOP, P0, {
    ...STAGED.bop, ...STACK, ...lit("bop", [10, 112, 0], 110),
    flow: 1, pass: 1, vbr: 1, annular: 1, inside: 1, bsr: 0.95, buckle: 1, amf: 1, link: 0, ok: 0,
  });
  path([
    [t.topire, P0],
    [t.hasard, B([10, 112, -24], { d: 340, az: -75.5, el: 8, shift: 34 })], // the dive spread over the sentence (no lunge at 110,6)
    [t.boitier, B([10, 112, -40], { d: 236, az: -75, el: 8, shift: 30 })],
    [t.batterie, B([10, 112, -44], { d: 172, az: -73, el: 8, shift: 30, dof: 6 })],
    [cutAutre - 0.04, B([10, 111, -46], { d: 136, az: -71, el: 8 })],
  ]);
  // « Dans l'autre » — a cut from pod to pod (raccord: the same open box), seen from further round so that the open door does not
  // hide the 9 V pile (at az −70 it stands behind the door's edge); the az keeps turning the same way
  const V0 = B([10, 110, 48], { d: 168, az: -92, el: 8, shift: 20, dof: 6 });
  cut(cutAutre, SET.BOP, V0, {
    ...STAGED.bop, ...STACK, ...lit("bop", [10, 110, 48], 60),
    flow: 1, pass: 1, vbr: 1, annular: 1, inside: 1, bsr: 0.95, buckle: 1, amf: 1, link: 0, ok: 0, podOpen: 1, charge: 0, culprit: 3, fault: 0,
  });
  path([
    [cutAutre, V0],
    [t.vanne, B([10, 111, 47], { d: 148, az: -90, el: 8, shift: 10 })],
    [t.cablee, B([10, 110, 48], { d: 136, az: -88.5, el: 8, shift: 0 })],
    [t.pile, B([9, 106, 51], { d: 126, az: -84, el: 13 })],
    [t.toissue - 0.04, B([9, 106, 51], { d: 120, az: -82.5, el: 15 })],
  ]);
  punch(t.hasard, 0.06);
  // « Dans un boîtier, la batterie était vide. »
  st(t.boitier - 0.1, 0.55, { podOpen: 1 }, "power2.inOut");
  st(t.boitier, t.batterie - t.boitier, lit("bop", [10, 112, -46], 60), "sine.inOut");
  st(t.batterie - 0.3, 0.01, { culprit: 3 }, "none");
  st(t.batterie, t.vide - t.batterie, { charge: 0 }, "sine.in");
  st(t.vide - 0.04, 0.2, { fault: 1 }, "power2.out");
  // « Dans l'autre, une vanne mal câblée… » — on the cut the battery is no longer the subject (its red goes with the shot)
  st(cutAutre + 0.01, 0.01, { fault: 0 }, "none");
  st(t.vanne, 0.01, { culprit: 4 }, "none");
  st(t.vanne, t.cablee - t.vanne, { coils: 1 }, "sine.out");
  st(t.cablee - 0.04, 0.2, { fault: 1 }, "power2.out");
  // « …qui ne marchait que grâce à une pile à plat. » — the red goes to the pile (the valve back to clay)
  st(t.pile - 0.04, 0.01, { culprit: 5 }, "none");

  /* ── 3 · l'issue — the rig after, sober; it sinks (raccord: the red of the faults → the fire on the deck) ── */
  const S0 = { ...VIEW.sink, az: -57 };
  cut(t.toissue, SET.PLATEFORME, S0, { ...STAGED.plateforme, ...RIG, spill: 1, fire: 0.8, lamps: 0, sink: 0 });
  path([
    [t.toissue, S0],
    [t.coule, Rg(410, { d: 1060, az: -53, el: 5, shift: 40 })],
    [t.mois - 0.04, Rg(380, { d: 1020, az: -49, el: 4, shift: 40 })],
  ]);
  chip("chip-bilan", null, 96, 470, t.morts - 0.1, t.coule - 0.3);
  // « La plateforme coule deux jours plus tard. » — it goes under, the fire dies with it
  st(t.coule - 0.1, t.mois - 0.2 - t.coule + 0.1, { sink: 1 }, "sine.inOut");
  st(t.coule + 0.2, t.mois - 0.3 - t.coule - 0.2, { fire: 0 }, "sine.in");

  /* ── 3b · « le puits fuit pendant près de trois mois » — the BOP and its leak (raccord: the hull going down → the seabed) ── */
  const L0 = B([0, 165, 0], { d: 760, az: -63, el: 12, shift: 40 });
  cut(t.mois, SET.BOP, L0, {
    ...STAGED.bop, ...STACK, ...lit("bop", [0, 130, 0], 140),
    flow: 1, pass: 1, vbr: 1, annular: 1, inside: 1, bsr: 0.95, buckle: 1, amf: 0, link: 0, plume: 0,
  });
  path([
    [t.mois, L0],
    [t.mois + 2.1, B([0, 162, 0], { d: 720, az: -59, el: 12 })],
    [t.barils, B([0, 158, 0], { d: 680, az: -55, el: 11 })],
    [t.todepuis - 0.04, B([0, 156, 0], { d: 664, az: -53, el: 11 })],
  ]);
  st(t.mois + 0.1, 2.2, { plume: 1 }, "sine.out");
  chip("chip-fuite", null, 96, 470, t.barils - 1.45, t.todepuis - 0.3);

  /* ── 4 · 03 DEPUIS — the BOP as it failed, healed on the words (raccord: the leaking stack → the same stack, lit) ── */
  setAct(tl, 3, t.todepuis);
  const D0 = B([0, 88, 0], { d: 430, az: -66, el: 8, shift: 40 });
  cut(t.todepuis, SET.BOP, D0, { ...BENCHED, ...lit("bop", [0, 88, 0], 110) });
  path([
    [t.todepuis, D0],
    [t.etats, B([0, 88, 0], { d: 390, az: -63, el: 8, shift: 36 })],
    [t.deux, B([0, 86, 0], { d: 290, az: -60, el: 8, shift: 20 })],
    [t.garder, B([0, 80, 0], { d: 240, az: -58, el: 7, shift: 10 })],
    [t.centre2, B([0, 76, 0], { d: 205, az: -57, el: 6, shift: 0, dof: 6 })],
    [t.cisaillement, B([0, 80, 0], { d: 160, az: -53, el: 7 })], // close on the blades: the lifted half of the pipe reads
    [t.tocta - 0.04, B([0, 81, 0], { d: 124, az: -47, el: 8 })],
  ]);
  // « Depuis 2016, aux États-Unis » — the light whitens, the grid and the halo go green
  st(t.todepuis + 0.05, t.etats + 0.5 - t.todepuis, { depuis: 1 }, "sine.inOut");
  // « deux jeux de lames » — the second shear ram slides in (the first opens a little: the pipe must never be cut before « cisaillement »)
  st(t.deux - 0.1, 0.4, { bsr: 0.25 }, "power2.out");
  st(t.deux - 0.06, 0.6, { rams2: 1 }, "power2.out");
  chip("chip-regle", null, 96, 470, t.deux - 0.1, t.tocta - 0.3);
  // « un moyen de garder le tube au centre » — the ring closes, the pipe stands straight and turns green
  st(t.garder, t.centre2 + 0.2 - t.garder, { ring: 1, buckle: 0 }, "sine.inOut");
  punch(t.centre2, 0.06);
  // « et un cisaillement vérifié » — the clean cut, green
  st(t.cisaillement - 0.06, 0.6, { bsr: 1 }, "power2.inOut");
  st(t.cisaillement + 0.3, 0.5, { shear: 1 }, "power2.out");

  /* ── 5 · « Pourquoi les lames n'ont pas scellé le puits ? Un tube plié. » — the master shot again (raccord: the blades → the same blades) ── */
  const C0 = B([0, 84, 0], { d: 360, az: -72, el: 4, shift: 40 });
  cut(t.tocta, SET.BOP, C0, {
    ...STAGED.bop, ...STACK, ...lit("bop", [0, 84, 0], 100),
    depuis: 1, flow: 1, pass: 1, vbr: 1, annular: 1, inside: 1, bsr: 0.95, buckle: 1, amf: 1, link: 0, culprit: 2, fault: 1,
  });
  path([
    [t.tocta, C0],
    [t.plie2, B([0, 80, 2], { d: 262, az: -67, el: 5, shift: 10 })],
    [t.mais - 0.04, B([0, 80, 3], { d: 238, az: -64, el: 5, shift: 0 })],
  ]);
  feutre(D, { id: "feutre-tube2", anchor: A.pipeBend, kind: "circle", w: 300, h: 460, from: t.plie2 + 0.06, to: t.mais - 0.2, draw: 0.36, seed: 9 });

  /* ── 6 · « Mais tout avait commencé par deux cadrans. » — the two dials, the duel (raccord: the red pipe → the red dial) ── */
  const K0 = Pw([10, 588, -64], { d: 266, az: -81, el: 8, shift: 40, dof: 6 });
  cut(t.mais, SET.PUITS, K0, { ...STAGED.puits, ...WELL, ...lit("puits", [10, 588, -64], 90), dialTube: 1400, dialLine: 0, culprit: 1, fault: 1 });
  path([
    [t.mais, K0],
    [t.cadrans2, Pw([10, 588, -64], { d: 250, az: -77, el: 8 })],
    [t.commentaire, Pw([10, 588, -67], { d: 234, az: -72.5, el: 9 })],
    [t.mille, Pw([10, 588, -76], { d: 214, az: -70, el: 8 })], // « 1 400 d'un côté » — the TUBE dial
    [t.zero, Pw([10, 588, -50], { d: 208, az: -67, el: 7 })], // « zéro de l'autre » — the LIGNE dial
    [t.duelB, Pw([10, 588, -62], { d: 236, az: -64.5, el: 7 })],
    [t.toabo - 0.04, Pw([10, 588, -62], { d: 250, az: -63, el: 7 })],
  ]);
  duelCall(tl, { from: t.commentaire - 0.5, word: t.commentaire, aAt: t.duelA, bAt: t.duelB, to: t.toabo - 0.32, toneA: null, toneB: null });

  /* ── 7 · « Abonne-toi » — the rig at night, calm, one slow orbit under the panel ── */
  const R0 = Rg(500, { d: 820, az: -68, el: 3, fov: 30, shift: 140 });
  cut(t.toabo, SET.PLATEFORME, R0, { ...STAGED.plateforme, ...RIG, depuis: 1 });
  path([
    [t.toabo, R0],
    [t.chaque + 1.4, Rg(500, { d: 800, az: -62, el: 3 })],
    [t.toloop - 0.04, Rg(500, { d: 780, az: -55, el: 3 })],
  ]);
  nextFile(tl, { showAt: t.toabo + 0.2, factAt: t.chaque, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.lache + 0.4 });

  /* ── 8 · « Comme ce soir-là, à… » — the first image, a bit further and turned 12°: the camera glides back onto it ── */
  // (el 6° lower than POSE0: at el −40 and az −72 the underside of the drill floor crosses the bottom third of the frame)
  const BACK = { ...POSE0, d: POSE0.d * 1.15, az: POSE0.az - 12, el: POSE0.el - 6 };
  cut(t.toloop, SET.PLATEFORME, BACK, { ...FIRST });
  D.loop({ at: t.toloop, rewindAt: t.toloop + 0.04, fromD: BACK.d, ease: "none" });
}
