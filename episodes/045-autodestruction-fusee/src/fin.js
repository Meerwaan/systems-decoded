// DOSSIER 045 — la chute, ce que le film doit encore, les appels à l'action, et le prochain dossier en tout dernier
// (toverdict 63,61 → 92,8). Four places, three cuts of the plan and one more (toabo: see below):
//   chute        from the ground, the morning after: the debris lie in the corridor's band, the trail still hangs in the
//                sky — « Ratée » struck on « pas », « Réussie » on « Rater »; on « encore » the path it would have flown
//                on (the ghost) leaves the corridor, and is struck out. One slow glide, az −36 → −48 (past −48 the
//                cross lands on the trail, docs/045-actes-maj.md §5)
//   commentaire  a cut back to the instant before, close in the slit between the core and the +z booster (az −80): the
//                booster lifts, on « coupé » its links tear, the veille signal runs up to the bay and the camera follows
//                it; then it pulls back and rises over the rocket whole, crossways, for the duel (both answers neutral:
//                the film never answers for the viewer)
//   like         the same move goes on: the boosters close back, the rocket straightens and flies back down its own
//                trail to its pad (the rewind), the camera riding down with it
//   abo          a cut (toabo) to the pad from the west-north-west — the only side the 046 flare stands behind it, on the
//                south-east horizon: it rises on « flamme », its pilot lights on « brûle »
//   boucle       a cut on VIEW.back (POSE0 + 12°), STAGED with the boosters a little less open; D.loop brings the camera
//                and every number back to the first frame — the boosters lift off at the last frame as at the first
// Why toabo is a cut: the junction is filmed from az −80 and the flare is only behind the pad from az ≈ −62 … −78
// (its bearing from the pad is 112°); the camera turns one way in every path (az decreasing), so the orbit cannot run
// from one to the other. The cut also hides the last metres of the rewind (the take-off cloud sucked back into the
// flame trenches, habillage.js).
// A title or a panel has finished leaving BEFORE the cut that follows it. No sound is added here (episode.json sfx).
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, ONPAD, LIGHT, CENTER, onRocket } from "./world.js";

/** The rocket's middle when it stands straight on its path at `climb` (the rewind of the like). */
const mid = (climb) => onRocket(climb, 0, [0, CENTER, 0]);
const [HX, HY, HZ] = onRocket(1, 30, [0, CENTER, 0]); //   the rocket's middle at the breakup (= C_HOOK)

/** After the charge: everything on the ground east of the pad, the corridor lit, the trail hanging in the sky. */
const AFTER = { tear: 1, incid: 32, blast: 1, rip: 1, debris: 1, charge: 1, burn: 0, inside: 0, corridor: 1, fall: 1, mood: 0 };

export default function fin({ D }) {
  const { tl, st, cut, path } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", rate: "chute:raté", pas: "verdict", rater: "chute:Rater", laisser: "chute:laisser",
    encore: "chute:encore", tocta: "tocta", boosters: "comment:boosters", coupe: "comment:coupé", fils: "comment:fils",
    commentaire: "comment:commentaire", devie: "comment:dévie", duelA: "duelA", duelB: "duelB", tolike: "tolike",
    like: "like", rate2: "like:raté", likeEnd: "like$", toabo: "toabo", prochain: "abo:prochain", flamme: "abo:flamme", brule: "abo:brûle",
    nexplose: "abo:n'explose", aboEnd: "abo$", toloop: "toloop",
  });

  /* ── CHUTE — « Voilà son secret : ce jour-là, la fusée a raté. Sa sauvegarde, pas du tout. Rater, pour elle, c'est
     laisser la fusée voler encore. » ── */
  cut(t.toverdict, SET.SCENE, VIEW.verdict, { ...STAGED, ...AFTER });
  path([
    [t.toverdict, VIEW.verdict],
    [t.rate, { az: -41, el: -2, d: 40000 }],
    [t.rater, { az: -45, el: 1.5, d: 35500 }],
    [t.tocta, { az: -48, el: 3, d: 32000 }],
  ]);
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.rater - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  D.punch(t.pas, 0.06);
  // « laisser la fusée voler encore »: the path it would have flown on, out through the corridor's wall on « encore »
  st(t.laisser - 0.05, t.encore + 0.13 - t.laisser, { ghost: 1 }, "sine.inOut");
  st(t.encore + 0.18, 0.4, { barred: 1 }, "none");
  D.punch(t.encore, 0.06, { hold: 0.12, down: 0.3 });

  /* ── COMMENTAIRE — « Et qui a déclenché la charge ? Les boosters eux-mêmes : en s'arrachant, ils ont coupé leurs fils.
     En commentaire : une fusée qui dévie… un humain décide, ou la machine ? » ── */
  // (retouche 08/11) from above, square to the plane of the three bodies: the core between its boosters, the noses
  // leaving it, the links, the bay — the rocket reads whole-ish; the camera stays above it, no glass in the foreground
  const SLIT = { ...VIEW.junction, tx: 6400, ty: 17500, tz: 150, az: -84, el: 50, d: 6000 }; // between the links and the bay
  cut(t.tocta, SET.SCENE, SLIT, { ...STAGED, tear: 0.15, inside: 1, mood: 0 });
  st(t.boosters - 0.1, t.coupe - t.boosters + 0.1, { tear: 0.35 }, "sine.inOut"); // the booster's nose lifts off the core
  st(t.coupe, 0.15, { links: 0 }, "power2.out"); //                                    « coupé »: the links tear
  st(t.coupe + 0.2, 0.8, { pulse: 1 }, "sine.inOut"); //                               the signal runs up to the bay
  st(t.coupe + 0.6, 4.5, { tear: 0.42 }, "sine.inOut"); //                             …and the booster keeps leaving, slowly
  duelCall(tl, { from: t.commentaire - 0.5, word: t.commentaire, aAt: t.duelA, bAt: t.duelB, to: t.tolike - 0.14, toneA: null, toneB: null });
  D.punch(t.commentaire, 0.06);
  D.punch(t.duelB, 0.05, { hold: 0.12, down: 0.3 });

  /* ── LIKE — « Like : pour celui qui croit qu'une fusée qui explose, c'est raté. » The rewind: the boosters close back,
     the rocket straightens, then flies back down its trail to the pad. ── */
  const back0 = t.tolike - 0.05; //  the pieces come back together
  const back1 = t.like + 0.95;
  const down0 = t.like + 0.45; //    the rocket flies back down
  const down1 = t.toabo - 0.05;
  st(back0, back1 - back0, { tear: 0, incid: 0, links: 1, pulse: 0, gimbal: 0 }, "sine.inOut");
  st(down0, down1 - down0, { climb: 0.04, ...LIGHT.pad }, "sine.inOut"); // (0.04: the last metres land under the cut)
  st(down1 - 0.7, 0.65, { burn: 0, trail: 0 }, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.toabo - 0.3, count: 5, label: (n) => `${n} personnes` });
  D.punch(t.rate2, 0.05, { up: 0.06, hold: 0.06, down: 0.18 });
  // where the rocket is along the rewind (the same easing as its climb), for the camera to ride with it
  const climbAt = (time) => 1 - 0.96 * (0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, (time - down0) / (down1 - down0)))));
  const ride = (time, pose) => {
    const [x, y, z] = mid(climbAt(time));
    return [time, { tx: x, ty: y, tz: z, ...pose }];
  };
  const k1 = down0 + (down1 - down0) * 0.36;
  const k2 = down0 + (down1 - down0) * 0.7;

  /* the move of the comment and the like: ONE path, az decreasing from the junction */
  path([
    [t.tocta, SLIT],
    [t.boosters, { tz: 220, az: -86, el: 50, d: 5500 }], //  sliding toward the +z booster (frame right)
    [t.coupe, { tz: 300, az: -88, el: 48, d: 4900 }], //     « coupé »: the core left, the booster right, its links between
    [t.coupe + 1, { tz: 300, az: -90, el: 45, d: 4700, shift: -60 }], // the pulse reaches the bay, the panel comes in above
    [t.devie, { tx: HX, ty: HY, tz: HZ, az: -100, el: 18, d: 13000, shift: -130 }], // the rocket whole, under the duel
    [t.duelB, { az: -104, el: 22, d: 15000, shift: -150 }],
    ride(down0, { az: -108, el: 22, d: 17000, shift: -190 }),
    ride(k1, { az: -112, el: 16, d: 19000, shift: -210 }),
    ride(k2, { az: -116, el: 10, d: 20000, shift: -220 }),
    ride(t.toabo, { az: -120, el: 6, d: 20500, shift: -220 }),
  ]);

  /* ── ABO — « Abonne-toi : prochain dossier, la flamme géante d'une raffinerie : elle brûle pour que l'usine
     n'explose pas. » The rocket whole on its pad, the 046 flare on the horizon behind it. ── */
  // the flare's bearing from the pad is 112°: behind the rocket at az ≈ −68, 47 px further left per degree below it; the rocket
  // drifts right ≈ 25 px per degree (this target): from −71 to −76 both stay clear of each other and of the edges
  const ABO = { ...VIEW.teaserView, az: -69, d: 22000, side: -60 };
  cut(t.toabo, SET.SCENE, ABO, { ...ONPAD, teaser: 0 });
  path([
    [t.toabo, ABO],
    [t.flamme, { az: -71.5, d: 24500 }],
    [t.brule, { az: -74.5, d: 27500 }],
    [t.toloop, { az: -77.5, d: 30500 }],
  ]);
  st(t.flamme - 0.1, 0.9, { teaser: 0.5 }, "sine.inOut"); // the flare rises on the horizon
  st(t.brule - 0.1, 0.6, { teaser: 1 }, "sine.inOut"); //   its pilot flame lights
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.4, railTo: t.aboEnd + 0.15 });
  D.punch(t.nexplose, 0.05, { hold: 0.12, down: 0.3 });

  /* ── BOUCLE — « Jusqu'à la seconde où… » → « Ta fusée bascule ». No fromD (041: a black MP4 before the loop). ── */
  cut(t.toloop, SET.SCENE, VIEW.back, { ...STAGED, tear: 0.12, incid: 27 });
  D.loop({ at: t.toloop, rewindAt: t.toloop });
}
