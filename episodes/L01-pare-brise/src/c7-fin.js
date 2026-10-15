// Chapter 12 · Ce qu'il faut retenir (recap → boucle): the whole line again in seven flashes, the chute on the bench
// (the received idea struck out), what is owed (the side window: tempered or laminated, the AAA's breakers, the stamp
// in the corner), the comment, the like, the rendezvous (no subject, no date), and the loop back to the first frame.
// From 516.2 s the right half of the frame is YouTube's end screen: the subject stands left (side > 0).
// Plan, sentence by sentence: docs/L01-actes.md · c7. Journal: docs/journal/L01-c7-fin.md.
import { SET, AT, FIRST, POSE0, VIEW, span, run } from "./world.js";
import { SIDE } from "./plan.js";
import { retitle } from "@kit/blocks.js";
import { fact, chipEl } from "@kit/long.js";

const B = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }; // what a complete pose needs besides its aim
const ON = { step: 0, temp: 20, tempOn: 1 };

/* where the side window's stamp stands in the car (plan.js · SIDE; verre.js: at [w/2 − 12, −h/2 + 8] of its pane) */
const LEAN = (SIDE.lean * Math.PI) / 180;
const SIDE_STAMP = [SIDE.at[0] - 12 * Math.sin(LEAN), SIDE.at[1] - 12 * Math.cos(LEAN), SIDE.at[2] - (SIDE.w / 2 - 12)];
const atStamp = (s, o) => ({ ...B, tx: s[0], ty: s[1], tz: s[2], ...o });

export default function ({ D }) {
  const [from, to] = span(D, "recap");
  const T = D.times({
    du: "recap:du", flotte: "recap:flotté", refroidi: "recap:refroidi", courbe: "recap:courbé", colle: "recap:collé",
    cuit: "recap:cuit", frappe: "recap:frappé",
    tenir: "chute:tenir", casser: "chute:casser",
    du0: "du", sort: "du:sort", breaker: "du:brise-vitre", mais: "du:mais",
    aaa: "aaa", environ: "aaa:environ", six: "aaa:et", brise: "aaa:brise-vitres", essayes: "aaa:essayés", aucun: "aaa:aucun",
    tr0: "trempe4", trempee: "trempe4:trempée", outils: "trempe4:outils", echoue: "trempe4:échoué",
    et0: "etiquette", marquage: "etiquette:marquage", lui: "etiquette:c'est", viser: "etiquette:viser",
    curieux: "comment:je", cEnd: "comment$",
    like0: "like", envoie: "like:envoie", bv: "like:brise-vitre", quelle: "like:quelle",
    abo0: "abo", usine: "abo:usine",
  });
  const toverdict = D.at("toverdict");
  const tocta = D.at("tocta");
  const toloop = D.at("toloop");
  const rewind = D.at("rewind");
  const rewindAt = D.tEnd - 0.1; // every number is back to FIRST here: the loop's own glide has nothing left to do

  // the line runs until the car comes back for the loop (flow then returns to FIRST's 0 on the cut: the line is hidden)
  run(D, from, toloop);

  // one written thing at a time: the keywords keep out of the two moments that carry a fact or a chip
  const quiet = [[T.environ - 0.08, T.six - 0.05], [T.curieux - 0.1, T.cEnd + 0.4]];
  for (const [a, b] of quiet) D.quiet(a, b);

  const line = (at, pose, state) => D.cut(at, SET.LINE, pose, { ...AT.line, ...ON, ...state });
  const car = (at, pose, state) => D.cut(at, SET.CAR, pose, { ...AT.car, ...state });
  const FIN = { cut: 1, print: 1, bend: 1, film: 1, sensors: 1, hero: 1 }; // the finished windshield on the line

  /* ── « Résumons. » — the card, and a whip onto the heaps of the batch ── */
  line(from, { ...VIEW.batch, az: -62, d: 980, el: 30 }, { step: 1, tempOn: 0, batch: 5, pos: 5000 });
  D.shot(from + 0.02, 0.85, { ...VIEW.batch }, "expo.out");
  D.shot(from + 0.9, T.du - 0.1 - from - 0.9, { tx: VIEW.batch.tx + 120, az: -10 }, "sine.inOut");

  /* ── the seven flashes: one cut a few frames before each phrase, each on its station, already moving ── */
  // « Du sable fondu. » — the whole furnace, its vault glowing
  line(T.du - 0.1, { ...VIEW.furnace, d: 1500, az: -42 }, { step: 1, temp: 1500, pos: 5000 });
  D.shot(T.du - 0.08, T.flotte - T.du, { tx: 620, az: -14, d: 1200, el: 24 }, "sine.inOut");
  // « Flotté sur de l'étain. » — raking along the ribbon, travelling with it
  line(T.flotte - 0.1, { ...VIEW.ribbon, tx: 1380 }, { step: 2, temp: 1100, pos: 5000 });
  D.st(T.flotte - 0.1, T.refroidi - T.flotte, { temp: 600 }, "sine.inOut");
  D.shot(T.flotte - 0.08, T.refroidi - T.flotte, { tx: 1700, az: 4 }, "sine.inOut");
  // « Refroidi lentement. » — inside the lehr's tunnel, the rollers running
  line(T.refroidi - 0.1, { ...VIEW.lehrIn, tx: 3150, az: -72 }, { step: 3, temp: 600, pos: 5000 });
  D.st(T.refroidi - 0.1, T.courbe - T.refroidi, { temp: 20 }, "sine.inOut");
  D.shot(T.refroidi - 0.08, T.courbe - T.refroidi, { tx: 3550 }, "sine.inOut"); // the camera stays inside the lehr (x > 2800): crossing out of the bath hood (x 2700) flipped its haze in one frame (qa, 472.73)
  // « Courbé par son propre poids. » — the hot glass sags on its mould
  line(T.courbe - 0.1, { ...VIEW.bendHot, az: -50 }, { step: 5, temp: 600, ...FIN, film: 0, sensors: 0, bend: 0, mould: 1, glow: 0.55, pos: 6600 });
  D.st(T.courbe, T.colle - T.courbe - 0.25, { bend: 1 }, "sine.inOut");
  D.shot(T.courbe - 0.08, T.colle - T.courbe, { az: -18, el: 28 }, "sine.inOut");
  // « Collé à un film, en salle blanche. » — the film slides in between the two sheets
  line(T.colle - 0.1, { ...VIEW.film, az: -40, d: 340 }, { step: 6, ...FIN, film: 0, sensors: 0, open: 0.6, air: 1, pos: 7900 });
  D.st(T.colle, 1.3, { film: 1 }, "sine.inOut");
  D.st(T.colle + 1.1, T.cuit - T.colle - 1.2, { open: 0 }, "sine.inOut");
  D.shot(T.colle - 0.08, T.cuit - T.colle, { az: -66, d: 280 }, "sine.inOut");
  // « Cuit sous pression. » — the autoclave shut, its heat and pressure rising
  line(T.cuit - 0.1, { ...VIEW.autoclave, az: -44 }, { step: 7, temp: 140, ...FIN, door: 1, press: 0.2, pos: 9300 });
  D.st(T.cuit, T.frappe - T.cuit, { press: 1 }, "sine.inOut");
  D.shot(T.cuit - 0.08, T.frappe - T.cuit, { az: -24, d: 900, ty: 150 }, "sine.inOut");
  // « Et frappé, exprès. » — the 10 kg head falls on the windshield, the web is born
  const hit = T.frappe + 0.18;
  line(T.frappe - 0.24, { ...VIEW.frameLow }, { step: 8, ...FIN, drop: 0.35, pos: 11850 });
  D.st(T.frappe - 0.24, hit - T.frappe + 0.24, { drop: 1 }, "power2.in");
  D.st(hit, 0.5, { drop: 1.15 }, "power2.out");
  D.st(hit, 0.55, { web: 1 }, "power2.out");
  D.st(hit + 0.1, 0.8, { rings: 1 }, "power2.out");
  D.shot(T.frappe - 0.22, toverdict - T.frappe + 0.2, { ...VIEW.frame }, "sine.inOut");

  /* ── the chute: the broken windshield standing on the bench, the received idea struck out ── */
  D.cut(toverdict, SET.BENCH, { ...VIEW.benchClose, d: 380, az: -52, el: 12, side: -400 }, { ...AT.bench, web: 1, rings: 1, stick: 1, mood: 0 });
  D.shot(toverdict + 0.02, T.du0 - toverdict - 0.1, { az: 4, el: 16, d: 340 }, "sine.inOut");
  document.getElementById("retitle-k").textContent = "Ton pare-brise";
  document.getElementById("retitle-a").firstChild.nodeValue = "Fait pour tenir";
  document.getElementById("retitle-b").textContent = "Fait pour casser";
  retitle(D.tl, { showAt: toverdict + 0.1, strikeAt: T.tenir, swapAt: T.casser, hideAt: T.du0 - 0.42, shade: false });
  D.verdict(D.at("verdict"));

  /* ── what is owed: the side window ── */
  const SIDE_ON = { sideOn: 1, sideFilm: 0, tool: 0, web: 0, rings: 0, grains: 0 };
  // « …c'est par elle qu'on sort, avec un brise-vitre. » — your hand rises with the breaker, strikes: grains
  car(T.du0 - 0.12, { ...VIEW.tool, d: 124, az: 108 }, { ...SIDE_ON });
  D.shot(T.du0 - 0.1, T.mais - T.du0, { d: 86, az: 94, el: 16 }, "sine.inOut");
  D.st(T.sort - 0.3, T.breaker - T.sort + 0.25, { tool: 0.5 }, "sine.inOut");
  D.st(T.breaker, 0.2, { tool: 1 }, "power2.in");
  D.st(T.breaker + 0.2, 0.58, { grains: 1 }, "power1.out");
  // « Mais de plus en plus de voitures ont des vitres de côté feuilletées. » — the same window, laminated: its film
  car(T.mais - 0.1, { ...VIEW.sideOut, d: 190, az: -56, el: 12, side: -140 }, { ...SIDE_ON, sideFilm: 1 });
  D.shot(T.mais - 0.08, T.aaa - T.mais + 0.1, { d: 135, az: -86, el: 6 }, "sine.inOut");

  /* « Aux États-Unis, environ une voiture sur trois en 2018. » — the car seen whole, the fact on the left */
  car(T.aaa - 0.1, { ...B, tx: -40, ty: 100, tz: 0, d: 820, az: -60, el: 14, side: -300 }, { ...SIDE_ON, sideFilm: 1 });
  D.shot(T.aaa - 0.08, T.six - T.aaa, { az: -98, d: 700, el: 9 }, "sine.inOut");
  fact(D.tl, { id: "c7-aaa", k: "Voitures de 2018", v: "≈ 1 sur 3", s: "États-Unis · vitres de côté feuilletées", tone: "veille", from: T.environ, to: T.six - 0.05 });

  /* « Et six brise-vitres essayés dessus : aucun ne l'a cassée. » — three quick cuts, three strikes, the film holds */
  const strike = (at, webTo, ringsTo) => {
    D.st(at - 0.2, 0.2, { tool: 1 }, "power2.in");
    D.st(at, 0.32, { tool: 0.55 }, "power2.out");
    D.st(at, 0.3, { web: webTo, rings: ringsTo }, "power2.out");
  };
  const LAM = { ...SIDE_ON, sideFilm: 1, tool: 0.5 };
  car(T.six - 0.1, { ...VIEW.tool, d: 110, az: 112, el: 16 }, { ...LAM });
  D.shot(T.six - 0.08, T.essayes - T.six, { az: 100, d: 96 }, "power1.out");
  strike(T.brise + 0.1, 0.22, 0.08);
  car(T.essayes - 0.05, { ...B, tx: SIDE.at[0], ty: SIDE.at[1], tz: SIDE.at[2], d: 170, az: -60, el: 10, side: -160 }, { ...LAM, web: 0.22, rings: 0.08 });
  D.shot(T.essayes - 0.03, T.aucun - T.essayes, { az: -80, d: 150 }, "power1.out");
  strike(T.essayes + 0.42, 0.4, 0.2);
  car(T.aucun - 0.25, { ...VIEW.sideIn, d: 130, az: 70, el: 2 }, { ...LAM, web: 0.4, rings: 0.2 });
  D.shot(T.aucun - 0.23, T.tr0 - T.aucun + 0.2, { az: 86, d: 112, el: 8 }, "sine.inOut");
  strike(T.aucun + 0.05, 0.55, 0.32);
  fact(D.tl, { id: "c7-zero", k: "Brise-vitres essayés", v: "0 sur 6", s: "n'ont cassé le feuilleté", tone: "veille", from: T.aucun, to: T.tr0 - 0.05 });

  /* « Et même sur une vitre trempée, deux de ces outils sur six ont échoué. » — tempered: the breaker bounces off */
  car(T.tr0 - 0.08, { ...VIEW.tool, d: 112, az: 88, el: 32 }, { ...SIDE_ON, tool: 0.5 });
  D.shot(T.tr0 - 0.06, T.et0 - T.tr0, { az: 106, d: 90, el: 22 }, "sine.inOut");
  for (const at of [T.trempee + 0.12, T.outils + 0.25]) {
    D.st(at - 0.18, 0.18, { tool: 1 }, "power2.in");
    D.st(at, 0.4, { tool: 0.5 }, "back.out(2)");
  }
  fact(D.tl, { id: "c7-deux", k: "Sur la vitre trempée", v: "2 sur 6", s: "ont échoué", tone: "signal", from: T.outils - 0.4, to: T.et0 - 0.05 });

  /* « …regarde le petit marquage dans le coin de chaque vitre. C'est lui qui te dit laquelle viser. » —
     a dive onto the side window's stamp (« I »), then a cut to the windshield's (« II »), on the bench where it reads */
  car(T.et0 - 0.12, atStamp(SIDE_STAMP, { d: 320, az: -48, el: 24, side: -120 }), { ...SIDE_ON });
  D.shot(T.et0 - 0.1, T.marquage + 0.3 - T.et0, atStamp(SIDE_STAMP, { d: 46, az: -84, el: 6, side: -120 }), "sine.inOut", 320);
  D.shot(T.marquage + 0.42, T.lui - T.marquage - 0.54, { d: 40, az: -96, el: 10 }, "sine.inOut");
  D.cut(T.lui - 0.1, SET.BENCH, { ...VIEW.stamp, d: 96, az: -24 }, { ...AT.bench, litStamp: 1 });
  D.shot(T.lui - 0.08, tocta - T.lui, { d: 66, az: -2, el: 18 }, "sine.inOut");

  /* « Et dis-moi en commentaire ce qui est écrit sur ta vitre conducteur. » — the driver's window stamp, close */
  car(tocta, atStamp(SIDE_STAMP, { d: 70, az: -104, el: 14, side: -220 }), { ...SIDE_ON });
  D.shot(tocta + 0.02, T.like0 - tocta - 0.1, { d: 40, az: -78, el: 4 }, "sine.inOut");
  chipEl("c7-vitre", { label: "Ta vitre conducteur ?", value: "I ou II", color: "ink" });
  D.chip("c7-vitre", null, 96, 300, T.curieux, T.cEnd + 0.3);

  /* ── the like: the car in profile, LEFT of the frame (the right half is YouTube's from here) ── */
  car(T.like0 - 0.12, { ...B, tx: 0, ty: 95, tz: 0, d: 1450, az: -84, el: 8, side: 430 }, { ...SIDE_ON });
  D.shot(T.like0 - 0.1, T.envoie - T.like0, { d: 1700, az: -98, el: 10 }, "sine.inOut");
  // « …quelqu'un qui garde un brise-vitre dans sa boîte à gants : ce jour-là, il saura quelle vitre viser. »
  car(T.envoie - 0.12, { ...B, tx: SIDE.at[0], ty: SIDE.at[1] + 4, tz: SIDE.at[2], d: 300, az: -58, el: 12, side: 400 }, { ...SIDE_ON });
  D.shot(T.envoie - 0.1, T.abo0 - T.envoie, { d: 210, az: -80, el: 8 }, "sine.inOut");
  D.st(T.bv - 0.7, 1, { tool: 0.5 }, "sine.inOut");
  D.st(T.envoie, 1.4, { shell: 0.3 }, "sine.inOut"); // what we do not talk about goes out: the right half empties

  /* ── the rendezvous: another factory, by night, seen from far, LEFT of the frame — no subject, no date ── */
  line(T.abo0 - 0.12, { ...B, tx: 4200, ty: 100, tz: 0, d: 9000, az: -62, el: 12, side: 420 }, { tempOn: 0, pos: 6600, ...FIN, film: 0, sensors: 0 });
  D.shot(T.abo0 - 0.1, toloop - T.abo0, { tx: 5200, az: -74, el: 10, d: 8400 }, "sine.inOut");

  /* ── the loop: the car intact, you at the wheel, seen as the first frame but further; on « jour » the crash,
        your head, the web — in that order — and the camera lands on POSE0 ── */
  car(toloop, { ...POSE0, d: 290, az: -132, el: 16 }, { ...FIRST, crash: 0, lunge: 0, web: 0, rings: 0 });
  D.shot(toloop + 0.02, rewindAt - toloop - 0.02, { ...POSE0 }, "sine.inOut", 290);
  D.st(rewind, 0.3, { crash: FIRST.crash }, "power2.out");
  D.st(rewind + 0.1, 0.45, { lunge: FIRST.lunge }, "power2.in");
  D.st(rewind + 0.5, 0.4, { web: FIRST.web }, "power2.out");
  D.st(rewind + 0.6, 0.4, { rings: FIRST.rings }, "power2.out");
  D.loop({ at: toloop, rewindAt });
}
