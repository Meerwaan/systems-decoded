// DOSSIER 035 — the chute, what the film owes, the like, the next file, the loop (toverdict → the end).
//   chute        the car out, stopped past the tracks; the hero signal still beating beside it, its boom gone (given);
//                the TGV's tail clears the road just before « pas un mur ». One long pull-back that rises: on « Toi,
//                non » the car is small under the night, the second train's lamps far on voie 1. « Un mur » struck on
//                « pas », « Ta sortie » on « Elle ».
//   ce qui est dû  back to the scene's instant (« Et si… »): the car stuck on voie 2, all four booms down — its
//                dashboard dies on « plus ». « Tout le monde sort »: you and the passenger get out and run round the tail
//                (no train in this frame: the camera looks away from +x) · a cut on « Puis » to the verge: the two of
//                them behind the entry boom, the phone lights on « téléphone », the camera slides to the signboard on
//                « pancarte » · the duel « Téléphone / Pancarte »: the film does not answer
//   like         another morning: booms up, lights off, the car rolls over the crossing as every day
//   prochain     the camera rises into the night and the crossing fades under the classified file — nothing of the
//                subject comes back after it
//   boucle       a cut to the hook's axis: the exit boom lands on « barrière »; on « jour » it all rewinds (the boom
//                rises back to 0.62, the clock and the TGV go back) into the first frame. D.loop brings every number back.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, STAGED, FIRST, POSE0, GAP_OUT, trainAt } from "./world.js";

const P = { fov: 34, side: 0, roll: 0, drift: 0.3, dof: 0 };

/* chute — car's frame, the car OUT (gap −6.8): the crossing's centre at z = +680, voie 2 at +470, voie 1 at +890, the
   hero mast at (235, 0, 30) beside the car. From ahead-right, low: the mast in front, the car, the tracks behind it.
   The title holds the top slot (436 → ≈ 790): the subject sits under it. */
const OUT0 = { ...P, tx: 120, ty: 120, tz: 0, d: 1900, az: 176, el: 8, shift: -110, side: 50 };
const OUT1 = { ...P, tx: 60, ty: 40, tz: 250, d: 3400, az: 170, el: 38, shift: -150 };

/* ce qui est dû — the car STUCK (gap −3): voie 2 at z = +90, voie 1 at +510, the entry booms at +950, the phone at
   (325, 0, 1170), the signboard at (325, 0, 1330). Seen from −x: +z is to the right of the frame; the TGV (far up +x)
   stays ≥ 18° off the axis — out of this narrow vertical frame while the people are on the tracks. */
// « ne roule plus »: in front of the hood, the exit boom down across the bottom, the dashboard through the windscreen
const DASHV = { ...P, tx: -30, ty: 95, tz: -90, d: 560, az: 166, el: 13, shift: -60 };
const DASH_IN = { d: 500 };
const STUCK = { ...P, tx: 30, ty: 85, tz: 160, d: 1400, az: -74, el: 12, shift: -60 };
const STUCK_OUT = { tz: 330, d: 1300 }; // the camera follows them round the tail, to the right
// the verge (docs/035-actes-maj.md § 7): the two of them, the phone, the signboard, the tracks behind
const VERGE = { ...P, fov: 32, tx: 420, ty: 110, tz: 1150, d: 1250, az: -66, el: 8, shift: -90, side: 60 };
const BOARD = { tz: 1215, d: 1170 }; // « pancarte »: the camera slides along the verge to the signboard
const BOTH = { tz: 1190, d: 1300, az: -64 }; // the duel: both side by side

/* like — another morning: the camera stands on the crossing (its centre is at z = −100 · gap in the car's frame: the
   shot tracks it at the car's speed) and the car rolls through it, away from us, as every day */
const KMH = 18; // (slow enough for the car to stay in the picture: it is on the crossing on « passe »)
const DAY = { ...P, tx: -120, ty: 0, tz: 0, d: 4000, az: -12, el: 30, fov: 36, shift: -20 }; // (along the road: the car stays in frame)
const AHEAD = 300; // the camera aims 3 m short of the crossing's centre
// prochain — the camera rises into the night over the crossing
const NIGHT = { d: 5600, el: 58, az: -16 };

/* boucle — on the hook's axis, a little closer than POSE0: the pull-back into it is the rewind */
const LOOP = { ...POSE0, d: 2150 };

const ROAD_DAY = { downIn: 0, downOut: 0, flash: 0, ring: 0, file: 0, train: 3000, beam: 0, other: 0, mood: 0, clock: 0 };

export default function fin({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    toverdict: "toverdict", pas: "verdict", elle: "chute:Elle", toi: "chute:Toi", tocta: "tocta",
    ne: "comment:ne", plus: "comment:plus", tout: "comment:Tout", sort: "sort", puis: "comment:Puis", alerte: "alerte",
    tel: "tel", pancarte: "pancarte", commentaire: "commentaire", duelA: "duelA", duelB: "duelB", commentEnd: "comment$",
    like: "like", passeLike: "like:passe", likeEnd: "like$", abo: "abo", prochain: "abo:Prochain", fact: "abo:Un", aboEnd: "abo$",
    toloop: "toloop", barriere: "boucle:barrière", rewind: "rewind",
  });

  /* ── CHUTE: « Voilà le secret : cette barrière n'est pas un mur. Elle est faite pour casser. Toi, non. » ── */
  // the story's clock runs on from act 3 (T ≈ 25.4): the TGV's tail clears the road at T ≈ 27.2 (≈ « pas »)
  const T0 = 27.6; // (a two-second ellipsis on the cut: the TGV has just cleared — at speed, behind the car, it is a white smear)
  const T1 = T0 + (t.tocta - t.toverdict);
  cut(t.toverdict, SET.ROAD, OUT0, { ...STAGED, gap: GAP_OUT, give: 1, other: 1, beam: 1, clock: T0, train: trainAt(T0), mood: 0 });
  st(t.toverdict, t.tocta - t.toverdict, { clock: T1, train: trainAt(T1) }, "none");
  shot(t.toverdict, t.tocta - t.toverdict, OUT1, "sine.inOut", OUT0.d);
  retitle(tl, { showAt: t.toverdict + 0.22, strikeAt: t.pas, swapAt: t.elle - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  punch(t.pas, 0.06);

  /* ── « Et si ta voiture ne roule plus ? » — back to the scene's instant: stuck, four booms down; it dies on « plus » ── */
  const S0 = 8.8;
  const S1 = S0 + (t.like - 0.12 - t.tocta);
  cut(t.tocta, SET.ROAD, DASHV, { ...STAGED, clock: S0, train: trainAt(S0), beam: 1, alive: 1 });
  st(t.tocta, t.like - 0.12 - t.tocta, { clock: S1, train: trainAt(S1) }, "none");
  st(t.ne, t.plus + 0.2 - t.ne, { alive: 0 }, "none"); // the dashboard flickers and dies
  shot(t.tocta, t.tout - 0.12 - t.tocta, DASH_IN, "sine.inOut");
  cut(t.tout - 0.12, SET.ROAD, STUCK, {});

  /* ── « Tout le monde sort. » — out of the doors, round the tail (out 0 → 0.3: past voie 2, no train in frame) ── */
  const toVerge = t.puis - 0.06;
  st(t.tout - 0.05, toVerge - t.tout + 0.05, { people: 0.3 }, "power1.in");
  shot(t.tout, toVerge - t.tout, STUCK_OUT, "power1.in");
  punch(t.sort, 0.05, { up: 0.06, hold: 0.05, down: 0.14 });
  chip("chip-sort", null, 96, 470, t.tout - 0.04, toVerge - 0.14);

  /* ── « Puis on alerte : le téléphone du passage, ou le numéro de la pancarte. » — the verge ── */
  cut(toVerge, SET.ROAD, VERGE, { people: 0.8 });
  st(toVerge, 1.1, { people: 1 }, "sine.out");
  chip("chip-alerte", null, 96, 470, t.alerte - 0.1, t.commentaire - 0.4);
  st(t.tel - 0.02, 0.3, { phone: 1 }, "power2.out");
  shot(toVerge, t.pancarte - toVerge, { tz: 1170, d: 1200 }, "sine.inOut");
  shot(t.pancarte - 0.1, t.commentaire - t.pancarte + 0.1, BOARD, "sine.inOut");

  /* ── « En commentaire : près de chez toi… téléphone, ou pancarte ? » — the duel; the film does not answer ── */
  shot(t.commentaire, t.like - 0.15 - t.commentaire, BOTH, "sine.inOut");
  duelCall(tl, { from: t.commentaire - 0.18, aAt: t.duelA, bAt: t.duelB, to: t.commentEnd + 0.1, toneA: "veille", toneB: "veille" });

  /* ── LIKE: « Like : pour quelqu'un qui en passe un tous les jours. » — another morning, the car rolls over it ── */
  const toLike = t.like - 0.12;
  const gapAt = (at) => (KMH / 3.6) * (t.passeLike - at);
  cut(toLike, SET.ROAD, { ...DAY, tz: -100 * gapAt(toLike) + AHEAD }, { ...STAGED, ...ROAD_DAY, gap: gapAt(toLike), kmh: KMH, alive: 1, rolled: 0 });
  st(toLike, t.toloop - toLike, { gap: gapAt(t.toloop), rolled: gapAt(toLike) - gapAt(t.toloop) }, "none");
  shot(toLike, t.abo - toLike, { tz: -100 * gapAt(t.abo) + AHEAD }, "none");
  likeCall(tl, { from: t.like, to: t.likeEnd - 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ── PROCHAIN DOSSIER — the camera rises into the night, the crossing fades under the file ── */
  shot(t.abo, t.toloop - t.abo, { ...NIGHT, tz: -100 * gapAt(t.toloop) + AHEAD }, "none");
  st(t.abo + 0.3, t.fact - t.abo, { shell: 0.2 }, "sine.inOut");
  nextFile(tl, { showAt: t.prochain + 0.03, factAt: t.fact - 0.05, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: « Comme cette barrière, le jour où… » — the boom lands on « barrière »; on « jour » it all rewinds ── */
  const L0 = 7.6;
  const L1 = 8.4;
  cut(t.toloop, SET.ROAD, LOOP, { ...FIRST, downOut: 0.8, clock: L0, train: trainAt(L0) });
  st(t.toloop, t.barriere + 0.25 - t.toloop, { downOut: 1 }, "sine.in");
  st(t.toloop, t.rewind - t.toloop, { clock: L1, train: trainAt(L1) }, "none");
  shot(t.toloop, t.rewind - t.toloop, { d: LOOP.d * 0.97 }, "none");
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: LOOP.d * 0.97 });
}
