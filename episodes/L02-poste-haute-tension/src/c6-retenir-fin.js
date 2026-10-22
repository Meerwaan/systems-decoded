// c6 · L'incident, Ce qu'il faut retenir, la fin (la boucle) — HAND.c56 (429,35 s) → la fin (550,33 s).
//
// You have climbed; the camera rises with you, then turns into a long pull-back over the gantry toward −x, down the
// corridor to the horizon: far away, a light on the neighbour's tower. It goes on forward (matched) onto that tower in
// the country: the neighbour's bottom string, the arc ON "lâche". The neighbour races, the field reaches for your line;
// a forward travel along your conductors carries into the poste, along your spans to the gantry: your earthed line
// flares ON "grimpe". Down the earthing cables to the terminal: the dashes run into the ground, 5 000 A. Up to you on the
// beam, in the zone that breathes as one. A cut ON "Là-bas" to the bench — the chamber framed as in "Le disjoncteur":
// a zero, the gas, the arc dies. The poste at night, wide, the neighbour dark, veille: the release ("claquement sec").
// The recap travels along your bay, each gesture lit on its word (and in the header). The chute pushes in on your
// clamps from inside the zone (COUPÉE = MORTE → COUPÉE ≠ MORTE). A dip to Virginia 1987 on the same clamp, down the
// cable to its earth end, a pull-back between the two towers; the crew; the earth end undone first, the apprentice's
// hand, up the cable to the clamp still on the line; his glass turns signal — and a dip: the same clamp, the crew gone,
// the right order played. An orbit for the comment; the poste wide on the LEFT half for the like and the rendezvous
// (the right half is YouTube's end screen); one push by ratio back to the first frame, every number back to FIRST,
// the neighbour lit again on "il reste…".
import { carry } from "@kit/direct.js";
import { fact } from "@kit/long.js";
import { retitle } from "@kit/blocks.js";
import { SET, AT, VIEW, WORKAT, HAND, seam, cardAt } from "./world.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const DEG = Math.PI / 180;
const W0 = WORKAT[0];

/** The same pose moved `s` cm forward along its line of sight (the camera and its aim together: a travel). */
const fwd = (p, s) => {
  const az = p.az * DEG;
  const el = p.el * DEG;
  return { ...p, tx: p.tx - s * Math.sin(az) * Math.cos(el), ty: p.ty - s * Math.sin(el), tz: p.tz - s * Math.cos(az) * Math.cos(el) };
};

/* ── the poses (complete) ── */
// the incident, in the poste: the corridor seen from over the gantry, the far tower at the horizon (ligne.js, seen)
const CORR = { ...VIEW.corridor };
// the far tower in the country (the last of the corridor, x 200 000): the neighbour's bottom string, seen from +x
const FAULT = { ...P, tx: 200000, ty: 3391, tz: -1000, d: 2500, az: 70, el: 4 };
const FAULT_IN = { ...FAULT, d: 1900, az: 66 };
const RACE = { ...P, tx: 199000, ty: 3500, tz: 300, d: 3400, az: 76, el: 3 }; //        both circuits, yours on the left
// the poste: along your spans from the pylon to the gantry, your droppers
const GANTRY_IN = { ...P, tx: 100, ty: 1250, tz: 200, d: 2500, az: -70, el: 6 };
const TERMINAL = { ...P, tx: 300, ty: 90, tz: 1150, d: 460, az: -45, el: 6, side: -150 }; // the earth terminal, the cables
const YOU_ZONE = { ...P, tx: 0, ty: 1720, tz: 600, d: 1200, az: -20, el: 14, side: -150 }; //  you on the beam, from +z (no span near the lens)
const YOU_ORBIT = { ...YOU_ZONE, d: 1100, az: -34, el: 16 };
// the bench: the chamber, exactly as in "Le disjoncteur"
const CHAMBER = { ...VIEW.chamber };
// the poste at night, wide
const WIDE = { ...VIEW.posteWide };
const WIDE_IN = { ...WIDE, d: 9800, az: -33 };
const BAY_A = { ...P, tx: 400, ty: 700, tz: 300, d: 4200, az: -55, el: 14, side: -150 };
const BAY_B = { ...P, tx: 1000, ty: 650, tz: 300, d: 3800, az: -25, el: 12, side: -150 };
// the chute: your line clamps on the droppers, seen from INSIDE the zone (camera ≈ [−330, 850, 1130]), title on the left
const CLAMPS = { ...P, tx: W0[0], ty: W0[1], tz: W0[2], d: 850, az: -50, el: -14, side: -260 };
const CLAMPS_IN = { ...CLAMPS, d: 620, az: -46 };

export default function ({ D, world }) {
  const { st, now, shot, cut, at, tl } = D;
  const first = D.first;

  /* ═══════════════ L'INCIDENT ═══════════════ */
  const SEAM = { ...AT.poste, open: 1, sopen: 1, lock: 1, sign: 1, clamps: 2, earthed: 1, zone: 0.15, walk: 1, climb: 1, arms: 0, perche: 0, probe: 0, tool: 0, cycle: 0, fly: 60000, geste: 5, kv: -1, kvOn: 1 };
  const afterSeam = seam(D, "c56", "in", { set: SET.POSTE, state: SEAM });
  const t = D.times({
    defaut: "orage:défaut", une: "orage:Une", lache: "orage:lâche", emballe: "defaut:s'emballe", dans: "defaut:dans", grimpe: "defaut:grimpe",
    dizaines: "chiffre:dizaines", centaines: "chiffre:centaines", pire: "chiffre:pire", plus: "chiffre:5",
    passe: "passe", tout: "passe:tout", bouge: "passe:bouge",
    labas: "coupe", zero: "coupe:zéro", gaz: "coupe:gaz", etouffe: "coupe:étouffe", ilcoupe: "coupe:coupe",
    calme: "calme",
  });
  const seamEnd = at(HAND.c56.at) + HAND.c56.opt.after;
  st(at(HAND.c56.at), 1.0, { zone: 0.06 }); //                                      the zone stays a line: no green wall under the card

  // the rise with you turns into a long pull-back over the gantry, down the corridor (−x) to the horizon
  shot(seamEnd, t.une - 0.5 - seamEnd, CORR, "sine.inOut", afterSeam.d);
  st(t.defaut - 0.1, 0.35, { defect: 0.55 }); //                                          "un défaut": far away, a light
  // the travel goes on forward, and lands in the country on that tower (matched on the movement)
  const corrB = fwd(CORR, 5000);
  D.match(t.une, [CORR, corrB], FAULT, {
    set: SET.LIGNE, before: 0.5, after: 1.0, fade: 0.2,
    state: { ...AT.ligne, live: 0, earthed: 1, voisine: 1, defect: 0.35, couple: 0.4, induced: 0, fx: 200000, fy: 3400, fz: -800, fs: 4000, cycle: 0, fly: 60000, geste: 5, kv: -1, kvOn: 1 },
  });
  shot(t.une + 1.0, t.emballe - 0.9 - (t.une + 1.0), FAULT_IN);
  st(t.lache, 0.15, { defect: 1 }, "power2.out"); //                                     "lâche": the arc at the string
  // "s'emballe": the camera backs off to both circuits, the field reaches from the neighbour to yours
  shot(t.emballe - 0.9, t.dans - 0.6 - (t.emballe - 0.9), RACE);
  st(t.emballe, 0.5, { couple: 1 });
  st(t.emballe + 0.1, 0.7, { induced: 1 });
  // "dans ta ligne": a forward travel along your conductors → in the poste, along your spans to the gantry
  const raceB = fwd(RACE, 900);
  const k = 2.0 / 0.6;
  D.match(t.dans, [RACE, raceB], [carry(raceB, RACE, GANTRY_IN, k), GANTRY_IN], {
    set: SET.POSTE, before: 0.6, after: 2.0, fade: 0.25, kind: "dip", // a dip: the mix froze a fast travel (qa 439,77)
    state: { ...SEAM, couple: 0.4, induced: 1, defect: 1 },
  });
  st(t.grimpe, 0.4, { induced: 2 }, "power2.out"); //                                    "grimpe": your line flares
  shot(t.dans + 2.0, at("chiffre") - (t.dans + 2.0), { ...GANTRY_IN, d: 2300, az: -66 });

  // "chiffre": down the earthing cables to the terminal; the dashes run into the ground
  shot(at("chiffre") + 0.05, t.centaines + 0.4 - at("chiffre"), TERMINAL, "sine.inOut", 2300);
  shot(t.centaines + 0.5, t.passe - (t.centaines + 0.5), { ...TERMINAL, d: 400, az: -38 });
  st(t.dizaines, 0.5, { current: 0.2 }); //                                        the dashes run down the clamps' cables:
  st(t.centaines, 0.5, { current: 0.4 }); //                                      never a ground lit in full
  st(t.pire, 0.5, { current: 0.45 });
  const f1 = fact(tl, { id: "c6-sim", k: "Simulation · dans les terres", v: "Dizaines → centaines", s: "d'ampères", from: t.dizaines - 0.3, to: t.pire - 0.5 });
  f1.querySelector(".fact__v").style.fontSize = "58px";
  fact(tl, { id: "c6-worst", k: "Le pire des cas", v: "Plus de 5 000", s: "ampères", tone: "signal", from: t.plus - 0.5, to: t.passe + 1.0 });

  // "passe": up to you on the beam, in the zone; it breathes as one on "tout monte ensemble"
  st(t.passe, 1.0, { induced: 1 }); //                                             it does not go through you: the surge calms
  cut(t.passe, null, YOU_ZONE); //                                                  a cut ON "Mais": you, on the beam
  shot(t.passe, t.labas - t.passe, YOU_ORBIT);
  st(t.tout - 0.4, 0.45, { zone: 0.3 }); //                                         "tout monte ensemble": a brief breath
  st(t.tout + 0.1, 0.8, { zone: 0.06 });

  // "Là-bas": the bench, the chamber as you saw it — a zero, the gas, the arc dies, it cuts
  cut(t.labas, SET.BENCH, CHAMBER, { ...AT.bench, see: 1, open: 1, arc: 1, heat: 0.3, gas: 0.4, wave: 1, cycle: 0.5, kvOn: 0 }, { fade: 0.2 });
  const rate = 2.5 / (t.zero - t.labas); //                                      half-waves per second: 0.5 → 3 lands ON "zéro"
  st(t.labas, 3.5 / rate, { cycle: 4 }, "none"); //                              …and the next zero falls under "étouffe"
  shot(t.labas, t.ilcoupe - t.labas, { ...CHAMBER, d: 255, az: -22 });
  st(t.gaz - 0.1, 0.5, { gas: 1 });
  st(t.etouffe, 0.4, { arc: 0 });
  st(t.etouffe + 0.5, 1.2, { gas: 0.4 });
  st(t.ilcoupe, 0.8, { wave: 0 });
  shot(t.ilcoupe, t.calme - t.ilcoupe, { ...CHAMBER, d: 330, az: -27, el: 7 });

  // "calme": the poste at night, wide; the neighbour is dark, the light is stable (mood → veille: the release)
  const CALM = { ...SEAM, zone: 0.06, voisine: 0, defect: 0, induced: 0, current: 0, couple: 0, mood: 0 };
  cut(t.calme, SET.POSTE, WIDE, CALM, { fade: 0.3 });
  shot(t.calme, cardAt(D, "recap") - t.calme, WIDE_IN);

  /* ═══════════════ CE QU'IL FAUT RETENIR ═══════════════ */
  const r = D.times({
    card: "recap-0.9", detecteur: "recap:détecteur", induite: "recap:il", cinq: "recap:Cinq", separer: "recap:séparer", condamner: "recap:condamner",
    identifier: "recap:identifier", verifier: "recap:vérifier", terre: "recap:mettre", chacun: "recap:Chacun",
    chute: "chute", nest: "chute:n'est", morte: "chute:morte", jamais: "chute:jamais", laterre: "chute:terre",
  });
  shot(r.card, 3.6, BAY_A, "sine.inOut", WIDE_IN.d);
  shot(r.card + 3.6, r.chute - 0.4 - (r.card + 3.6), BAY_B);
  now(r.detecteur, { named: 7 }); //                                               "Pas le détecteur": lit…
  now(r.induite, { named: 0 }); //                                                 …and out: it does not see it
  now(r.cinq, { geste: 0 });
  now(r.separer, { named: 4, geste: 1 });
  now(r.condamner, { named: 6, geste: 2 });
  now(r.identifier, { named: 0, geste: 3 });
  st(r.identifier, 0.3, { mark: 1 });
  now(r.verifier, { named: 7, geste: 4 });
  now(r.terre, { named: 8, geste: 5 });
  st(r.terre, 0.35, { zone: 0.3 });
  st(r.terre + 0.4, 0.8, { zone: 0.06 });
  now(r.chacun, { named: 0 });
  st(r.chacun, 0.6, { mark: 0 });

  // the chute: in on your clamps from inside the zone; the title on the left
  shot(r.chute - 0.4, 3.0, CLAMPS, "sine.inOut", BAY_B.d);
  shot(r.chute + 2.6, at("virginie") - 0.6 - (r.chute + 2.6), CLAMPS_IN);
  document.querySelector("#retitle-k").textContent = "Ce qui te garde en vie";
  document.querySelector("#retitle-a").firstChild.textContent = "Coupée = morte";
  document.querySelector("#retitle-b").textContent = "Coupée ≠ morte";
  retitle(tl, { showAt: r.chute + 0.2, strikeAt: r.nest, swapAt: r.morte, hideAt: at("chute$") - 0.4 });
  D.verdict(at("verdict"));

  /* ═══════════════ VIRGINIE, 1987 ═══════════════ */
  const v = D.times({
    cut: "virginie:1987", etats: "virginie:États-Unis", circuit: "virginie:230", autre: "virginie:part",
    nuit: "apprenti", defait: "apprenti:défait", saisit: "apprenti:saisit", alors: "apprenti:alors", courant: "apprenti:courant", traverse: "apprenti:traverse",
    regle: "regle", ligne: "regle:ligne", dernier: "regle:dernier", premiere: "regle:première", derniere: "regle:dernière",
    comment: "comment", ces: "comment:ces", like: "like",
  });
  // the bottom line clamp of the first tower: world.js hangs the 1987 set on ligne.A.phases(x + 600)
  const CL87 = world.ligne.A.phases(40600).reduce((a, b) => (b[1] < a[1] ? b : a));
  const FOOT87 = { ...P, tx: 40000, ty: 80, tz: 1200, d: 320, az: -22, el: 6, fov: 34 }; // its earth end; behind: the tower's legs, the truck
  const TWO87 = { ...P, tx: 49300, ty: 2600, tz: 800, d: 20000, az: -75, el: 3 }; //  the near tower, the span, the far one
  const APP = { ...P, tx: 40070, ty: 100, tz: 1480, d: 620, az: -22, el: 6, fov: 30, side: -150 };
  const UP87 = { ...P, tx: CL87[0], ty: CL87[1], tz: CL87[2], d: 1100, az: -50, el: 4 }; // the tower's lattice out of frame
  const APP_HI = { ...P, tx: 40100, ty: 110, tz: 1450, d: 600, az: -32, el: 12, fov: 30, side: -150 };
  const RULE = { ...FOOT87 };
  const L87 = { ...AT.ligne, live: 0, earthed: 1, voisine: 1, v87: 1, clamps: 2, cycle: 0, fly: 60000, geste: 0, kv: 0, kvOn: 0 };

  // a dip onto the earth end of 1987 at the foot of its tower (the clamp at your feet in the hook, the same place)
  cut(v.cut - 0.1, SET.LIGNE, FOOT87, { ...L87, fx: 40000, fy: 200, fz: 1200, fs: 800 }, { fade: 0.5, kind: "dip" });
  shot(v.cut - 0.1, v.autre - 0.6 - (v.cut - 0.1), { ...FOOT87, d: 280, az: -18 });
  fact(tl, { id: "c6-87", k: "Virginie, États-Unis", v: "1987", from: v.etats - 0.4, to: v.circuit - 0.1 });
  fact(tl, { id: "c6-230", k: "Un circuit coupé", v: "230 000 V", from: v.circuit, to: v.autre + 0.3 });
  // "de part et d'autre": back, between the two towers; the crew comes
  shot(v.autre - 0.6, v.defait - 0.15 - (v.autre - 0.6), TWO87, "sine.inOut", 280);
  st(v.autre - 0.4, 1.2, { fx: 60000, fy: 3000, fz: 0, fs: 8000 });
  st(v.nuit, 1.0, { v87: 2 }); //                                                  the crew and their truck, seen from back here
  // "On défait les terres": the earth end first; the apprentice, two steps, his hand on it
  cut(v.defait - 0.15, null, APP, { fx: 40050, fy: 120, fz: 1450, fs: 600 });
  st(v.defait, 1.2, { wrong: 1 });
  st(v.saisit, 1.6, { grab: 1 });
  shot(v.defait - 0.15, v.alors - (v.defait - 0.15), { ...APP, d: 560, az: -26 });
  // "encore reliée à la ligne": up the cable to the clamp still on the conductor
  // (a cut, not a rise: the fast climb along the tower's lattice made a parasite frame, qa 511,67)
  cut(v.alors, null, UP87, { fx: 40400, fy: 2400, fz: 1100, fs: 2000 });
  shot(v.alors, v.courant - v.alors, { ...UP87, d: 950, az: -46 });
  // "Le courant induit le traverse": back down on him, his glass turns signal — and we leave
  cut(v.courant, null, APP_HI, { fx: 40050, fy: 120, fz: 1450, fs: 600 });
  shot(v.courant, v.regle - 0.3 - v.courant, { ...APP_HI, d: 520 });
  st(v.traverse, 0.3, { shock: 1 }, "power2.out");

  // the rule: the same clamp after a dip, the crew gone; line side first, earth side last; then the right way on
  cut(v.regle - 0.3, null, RULE, { ...L87, v87: 1, wrong: 0, grab: 0, shock: 0, clamps: 2, fx: 40000, fy: 200, fz: 1200, fs: 700 }, { fade: 0.5, kind: "dip" });
  shot(v.regle - 0.3, v.premiere - 0.2 - (v.regle - 0.3), { ...RULE, d: 290, az: -26 });
  st(v.ligne, 1.4, { clamps: 1 });
  st(v.dernier, 0.9, { clamps: 0 });
  st(v.premiere, 1.6, { clamps: 1 });
  now(v.derniere, { named: 8 }); //                                                "la dernière que tu enlèves": it shines
  now(v.comment - 0.2, { named: 0 });
  shot(v.premiere - 0.2, v.comment - (v.premiere - 0.2), { ...RULE, d: 300, az: -34, el: 8 });

  // the comment: an orbit around the frozen clamp; the header counts the five gestures
  shot(v.comment, v.like - v.comment, { ...RULE, d: 360, az: 4, el: 10 });
  for (let i = 1; i <= 5; i++) now(v.ces + 0.3 * (i - 1), { geste: i });

  /* ═══════════════ LIKE, RENDEZ-VOUS, LA BOUCLE ═══════════════ */
  const e = D.times({ abo: "abo", toloop: "toloop", coupe: "boucle:coupé", reste: "boucle:il" });
  const pose0 = D.pose0;
  // the poste wide, its subject in the LEFT half (YouTube's end screen takes the right half from 535,3 s)
  const LIKE = { ...P, tx: 300, ty: 900, tz: 0, d: 5800, az: pose0.az - 38, el: 12, side: 500 };
  const LIKE_B = { ...LIKE, d: 5200, az: pose0.az - 30, el: 10, side: 460 };
  const END = D.tEnd - 0.3; //                                                     the camera is back on the first frame here
  cut(v.like, SET.POSTE, LIKE, {
    ...AT.poste, clamps: 2, earthed: 1, zone: 0.06, voisine: 0, mood: 0, bays: 0.15, poste: 0.55,
    walk: first.walk, climb: first.climb, arms: first.arms, perche: first.perche, probe: first.probe, tool: first.tool, you: first.you,
    open: first.open, sopen: first.sopen, lock: first.lock, sign: first.sign, cycle: first.cycle, fly: first.fly, geste: 5, kv: -1, kvOn: 1,
  }, { fade: 0.3 });
  shot(v.like, e.abo - v.like, LIKE_B);
  // "Et on se retrouve…": the poste goes dark, the light turns back to signal; ONE push by ratio onto the first frame
  st(e.abo, 1.2, { poste: 0.35, bays: 0 });
  st(e.abo, 0.3, { mood: first.mood });
  shot(e.abo, END - e.abo, pose0, "sine.inOut", LIKE_B.d);
  now(e.toloop - 0.02, { geste: first.geste, kv: first.kv, kvOn: first.kvOn });
  // every number back to FIRST before END: the zone and the clamps leave, your line goes back to its cut ink on
  // "tout est coupé", the poste comes back, the light stands on the head again — and the neighbour lights on "il reste…"
  st(e.toloop, 1.8, { zone: first.zone });
  st(e.toloop, 2.4, { clamps: first.clamps });
  st(e.coupe - 0.6, 0.8, { earthed: first.earthed });
  st(e.toloop + 0.1, 2.6, { poste: first.poste, bays: first.bays });
  st(e.toloop, 3.0, { fx: first.fx, fy: first.fy, fz: first.fz, fs: first.fs, hot: first.hot });
  st(e.reste - 0.25, 0.6, { voisine: first.voisine });
  D.loop({ at: e.toloop, rewindAt: END });
}
