// 02 · AUTOPSIE — from « …on l'ouvre » to the cut of act 3 (tobench → tozero).
//
// Act 1 leaves the door and its bar alone on the black (VIEW.system). The same system stands on the bench at the same
// place of the picture (benchCut); on « ouvre » it comes apart, the camera pulling back with it. On « la barre » the
// parts fly home onto the slab (the section of the leaf, the width of the door), and on « court » a head of light
// runs the bar's length, finished on « porte ». « c'est un levier » : a cut to the pivot in profile, the bar swings
// about its axis and springs back. « Au bout » : the camera runs along the bar to the box. « Dedans » : its cover
// turns to glass, the bolt lights up — and on « planté » it snaps into the strike, the strike lights up on its word.
// « Au repos » : the box, the bar held in, the spring squeezed; on « repousse » the spring opens and the bar comes back
// out. « Le pêne reste sorti : la porte tient » : the bolt in its strike, both lit, the camera closing slowly.
// « Mais là » : the picture turns signal and pulls back to the whole slab; the crowd's arrows come on « foule »; the
// camera dives back to the bolt and it jams on « coince ». The threshold does not stop the film: the same bolt in the
// same strike, now in the door of the hall, and the camera already pulling back to the shut door, you and the crowd
// pushing on it (« on la pousse ») — the door wide, the crowd massed against it (VIEW.door). Act 3 cuts from there to 1883.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { moved } from "@kit/direct.js";
import { SET, VIEW, BENCHED, STAGED, BENCHAT, onBench, BOX, GACHE } from "./world.js";

/* ── on the bench (bench coordinates) ── */
const B = onBench([-6, 96, 6]); // the system's centre on the bench
const BOXC = onBench(BOX.at);
const GAC = onBench(GACHE.at);
// the whole slab and its bar: « plus de la moitié de la porte »
const WHOLE = { ...VIEW.whole, tx: B[0] + 4, d: 320, az: -38, el: 32, shift: 110 };
// the exploded view, a little wider and to the right: the strike comes into the frame
const EXPLODED = { ...VIEW.exploded, tx: VIEW.exploded.tx - 4, d: 240 };
// the same, a little more from the room (the camera dives from it to the bolt: less of a turn)
const WHOLE_LOAD = { ...VIEW.whole, az: -30 };
// along the bar toward the box: the run starts over the bar and ends on the box (« Au bout »)
const RUN = { ...VIEW.boxBench, tx: VIEW.boxBench.tx + 30, d: 86 };
const BOXV = VIEW.boxBench;
const BOXW = { ...VIEW.boxBench, d: 78 }; // the box as an object, its arm coming in
const JAM = { ...VIEW.jamBench, d: 66 };
const JAM_NEAR = { ...JAM, d: 56, az: 32 };
// the bolt in its strike, in the door of the hall: the very same frame as on the bench (a match in place)
const LATCH = { ...moved(JAM, [0, 0, 0], BENCHAT), dof: 0 };

// the light: what it stands around, and how wide
const L_WIDE = { fx: B[0], fy: B[1], fz: B[2], fs: 80 };
const L_PIVOT = { fx: B[0] + 46, fy: B[1] + 2, fz: B[2] + 2, fs: 60 };
const L_BOX = { fx: BOXC[0], fy: BOXC[1], fz: BOXC[2], fs: 42 };
const L_JAM = { fx: GAC[0] + 4, fy: GAC[1], fz: GAC[2], fs: 40 };

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const A = world.system.A;
  const t = D.times({
    alors: "alors", tobench: "tobench", explode: "explode",
    sous: "sous", barre: "barre2", court: "eclate:court", porte: "porte2", levier: "levier", bout: "bout", boitier: "boitier",
    dedans: "dedans", pene: "pene1", plante: "plante", gache: "gache1", cadre: "cadre",
    torepos: "torepos", ressort: "ressort", repousse: "repousse", pene2: "pene2", tient: "tient",
    mais: "mais", foule: "foule2", coince: "coince", gache2: "gache2",
    toseuil: "toseuil", abonne: "abonne", fermee: "seuil:fermée", pousse: "pousse2", tozero: "tozero",
  });
  setAct(tl, 2, t.alors);

  /* ───────────── « …on l'ouvre. » — the same system on the bench, at the same place; it comes apart ───────────── */
  // (the bolt stands a hair back in its box — hidden by the cover — so that it can be seen snapping home on « planté »)
  // (act 1 hands over the bar lit: it stays lit through the cut, and lets its light go while the parts come apart —
  // dark again well before the head of light runs it on « court »)
  const sys = benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: BENCHAT, state: { ...BENCHED, pene: 0.45, litBar: 1 } });
  const open = t.explode + 0.08; // on « l'ouvre »
  st(open, 1.0, { explode: 1 }, "none"); // the parts have their own timing (model.js: each leaves, overshoots, settles)
  st(open, 1.1, { litBar: 0 }, "sine.inOut");
  shot(t.tobench + 0.02, t.sous - 0.1 - t.tobench, EXPLODED, "sine.inOut", sys.d);
  st(t.tobench + 0.02, 1.2, L_WIDE, "sine.inOut");

  /* ───────────── « Sous ta hanche, la barre court sur plus de la moitié de la porte : » ───────────── */
  // on « la barre » the parts fly home onto the slab; the camera takes in the whole slab, the width of the door
  st(t.barre - 0.5, 0.75, { explode: 0 }, "sine.inOut");
  shot(t.barre - 0.5, t.court + 0.1 - (t.barre - 0.5), WHOLE, "sine.inOut");
  // a head of light runs the bar from the box to its far end, finished on « porte »
  st(t.court, t.porte + 0.05 - t.court, { litBar: 1 }, "sine.inOut");
  const cBar = co.add({ title: "Barre-levier", x: 96, y: 480, align: "start", tone: "system", anchor: A.bar });
  cBar.show(tl, t.barre - 0.06);
  cBar.hide(tl, t.levier - 0.62);

  /* ───────────── « c'est un levier. » — the pivot in profile: the bar swings about its axis, the spring brings it back ───────────── */
  const toLever = t.levier - 0.36; // a few frames before « c'est »
  cut(toLever, null, VIEW.barBench, { litBar: 0, litPivot: 1, ...L_PIVOT });
  shot(toLever, t.bout - 0.2 - toLever, { ...VIEW.barBench, d: 68, az: 58 }, "sine.inOut");
  st(t.levier, 0.22, { push: 0.7 }, "power2.out");
  st(t.levier + 0.22, 0.2, { push: 0 }, "power2.in"); // it lands on the click (bout − 0.48)
  punch(t.levier, 0.06);

  /* ───────────── « Au bout, un boîtier. » — the camera runs along the bar to its end ───────────── */
  const toRun = t.bout - 0.2;
  cut(toRun, null, RUN, { litPivot: 0, ...L_BOX });
  shot(toRun, t.boitier + 0.1 - toRun, BOXW, "sine.inOut");
  st(t.boitier, 0.3, { litBox: 1 }, "sine.out");
  const cBox = co.add({ title: "Boîtier", x: 96, y: 480, align: "start", tone: "system", anchor: A.box });
  cBox.show(tl, t.boitier - 0.06);
  cBox.hide(tl, t.dedans + 0.35);

  /* ───────────── « Dedans, le pêne… » — the cover turns to glass, the bolt lights up ───────────── */
  st(t.dedans, 0.45, { see: 1 }, "sine.inOut");
  st(t.pene - 0.3, 0.3, { litBox: 0 }, "sine.inOut");
  st(t.pene, 0.3, { litPene: 1 }, "sine.out");
  const cPene = co.add({ title: "Pêne", x: 96, y: 480, align: "start", tone: "system", anchor: A.pene });
  cPene.show(tl, t.pene - 0.06);
  cPene.hide(tl, t.gache - 0.3);

  /* ───────────── « …planté dans la gâche du cadre. » — the camera follows the bolt to the strike; it snaps home ───────────── */
  // (a long, even travel — from just before « pêne » to « cadre »: the turn from the box to the strike stays gentle)
  const follow = t.pene - 0.25;
  shot(follow, t.cadre + 0.1 - follow, JAM, "sine.inOut");
  st(follow, t.gache - follow, L_JAM, "sine.inOut");
  st(t.plante - 0.04, 0.18, { pene: 0 }, "power3.out");
  st(t.gache, 0.3, { litGache: 1 }, "sine.out");
  punch(t.gache, 0.06);
  const cGache = co.add({ title: "Gâche", x: 96, y: 480, align: "start", tone: "system", anchor: A.gache });
  cGache.show(tl, t.gache - 0.06);
  cGache.hide(tl, t.torepos - 0.3);

  /* ───────────── « Au repos, un ressort repousse la barre. » — the box open: the spring squeezed, then it pushes back ───────────── */
  cut(t.torepos, null, BOXV, { see: 1, push: 0.6, litPene: 0, litGache: 0, litBox: 0, ...L_BOX });
  shot(t.torepos, t.pene2 - 0.3 - t.torepos, { ...BOXV, d: 54, az: -24 }, "sine.inOut");
  st(t.ressort, 0.3, { litSpring: 1 }, "sine.out");
  st(t.repousse, 0.6, { push: 0 }, "power2.out");
  const cSpring = co.add({ title: "Ressort de rappel", x: 96, y: 480, align: "start", tone: "system", anchor: A.spring });
  cSpring.show(tl, t.ressort - 0.06);
  cSpring.hide(tl, t.pene2 - 0.5);

  /* ───────────── « Le pêne reste sorti : la porte tient. » — the bolt in its strike, both lit; a slow close-in ───────────── */
  const toJam = t.pene2 - 0.28;
  cut(toJam, null, JAM, { litSpring: 0, litPene: 1, ...L_JAM });
  const toLoad = t.mais - 0.12; // a cut a few frames before « Mais »
  shot(toJam, toLoad - toJam, JAM_NEAR, "sine.inOut");
  st(t.tient - 0.05, 0.35, { litGache: 1 }, "sine.out");

  /* ───────────── « Mais là, toute la foule pèse dessus. » — signal; the whole slab, the crowd's arrows ───────────── */
  // a cut, not a pull-back (d 56 → 300 and 60° of turn in a second was the film's harshest move): the whole slab,
  // already signal, the camera easing in toward the bolt it will cut to
  const dive = t.coince - 0.84; // a cut a few frames before « Et le pêne », in the breath after « dessus »
  cut(toLoad, null, { ...WHOLE_LOAD, d: 330 }, { mood: 1, litPene: 0, litGache: 0, ...L_WIDE });
  shot(toLoad, dive - toLoad, { ...WHOLE_LOAD, d: 290 }, "sine.inOut");
  st(t.foule, 0.5, { load: 1 }, "sine.out");

  /* ───────────── « Et le pêne se coince dans la gâche. » — back on the bolt (a cut), a slow push; it jams ───────────── */
  // (from a hair closer, easing back to JAM: further back on this axis, an edge of glass crosses the lens)
  cut(dive, null, { ...JAM, d: 58, az: 29 }, { ...L_JAM });
  shot(dive, t.coince - 0.1 - dive, JAM, "sine.inOut");
  st(t.coince, 0.25, { jam: 1 }, "power2.out");
  punch(t.coince, 0.06);
  chip("chip-coince", null, 96, 470, t.coince + 0.04, t.toseuil - 0.1);

  /* ───────────── the threshold — the same bolt in the same strike, in the door of the hall; already pulling back ───────────── */
  cut(t.toseuil, SET.SALLE, LATCH, {
    ...STAGED, load: 0, jam: 1, see: 1, press: 0.85,
    fx: GACHE.at[0] + 4, fy: GACHE.at[1], fz: GACHE.at[2], fs: 40,
  });
  // « Abonne-toi » on the jammed bolt, the camera easing in; a cut a few frames before « cette porte » to the shut
  // door from the hall, the camera already closing in on it (no long pull-back through the leaf and you: it was the
  // film's harshest move). The box shuts on the cut; the crowd's arrows come back with « fermée ».
  const toDoor = t.fermee - 0.48; // « cette » − 0.12
  shot(t.toseuil + 0.04, toDoor - (t.toseuil + 0.04), { ...LATCH, d: 60 }, "sine.inOut");
  cut(toDoor, null, { ...VIEW.door, d: 620 }, { see: 0, fx: 0, fy: 100, fz: 40, fs: 450 });
  shot(toDoor, t.tozero - 0.04 - toDoor, VIEW.door, "sine.out");
  st(t.fermee - 0.45, 0.6, { load: 1 }, "sine.out");
  // « on la pousse » : the crowd leans in
  st(t.pousse - 0.06, 0.4, { press: 1 }, "sine.out");
  followCall(tl, { from: t.abonne, to: t.tozero - 0.1 });
}
