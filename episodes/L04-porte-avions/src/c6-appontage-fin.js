// c6 · « Les trois brins » de « Au moment de toucher » à la fin, « Andromède, la dernière chance », « Pourquoi
// « chien jaune » ? » and the loop — HAND.c56 (525,53 s) → the end (628,8 s). The plan, phrase by phrase:
// docs/L04-actes.md, « c6 » ; journal docs/journal/L04-c6.md.
//
// The rise from Andromède's brake goes on over the wire. « plein gaz »: an aircraft rolls the runway, hook up, and
// leaves the deck — the rule. The officer from behind, the lights of your approach far beyond him (the ad break).
// Under the card « Andromède », a whip behind your aircraft, then the cockpit; the ball sinks, « Wave off » three
// times (the mirror, the officer, the cockpit); you go around over the deck, seen from its far end. The second
// approach: the ball centred, the three guides, the count. « frappent »: from port at deck level, and AU RALENTI the
// hook hops over Athéna, over Aphrodite; the end of the deck; the hook takes Andromède (the thumbnail 3). Time comes
// back: you rush at the camera and stop, the cable trailing; « Sous le pont », a tilt matched into the brake; the
// aircraft stopped, the black sea 34 m beyond. The chute pulls back to the whole ship at night, the catapult and
// Andromède lit in the same picture. The yellow dog, his vest; the wave-off breathes three times; your aircraft back
// on the catapult for the duel; the pull-back to the whole ship on the LEFT (YouTube's end screen on the right); the
// descent to the catapult; the loop glides into the first frame at dawn.
//
// Every instant is read off the script (D.times). Shots that follow a moving aircraft keep the camera's EYE fixed and
// only re-aim (the deck is nothing but its paint: it never slides under a fast camera). `run` is carried by one tween
// at a time, never two that overlap; it only jumps (forward) on a cut.
import { fact } from "@kit/long.js";
import { threadCall, retitle } from "@kit/blocks.js";
import { SET, AT, FIRST, POSE0, VIEW, CLOSE, SHARP, HAND, seam, onFrame, cardAt, cockpitPose } from "./world.js";
import { MIRROR, LSO, BRINS, CREW, CAT, TOUCH, RAFALE, ANGLED_DIR, onAngled, onCat, jetAt } from "./plan.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const DEG = Math.PI / 180;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mix = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
/** A pose from where the camera STANDS (`eye`) toward what it looks at (`tgt`). */
const aimAt = (eye, tgt, extra = {}) => {
  const v = sub(eye, tgt);
  const d = Math.hypot(v[0], v[1], v[2]);
  return { ...P, tx: tgt[0], ty: tgt[1], tz: tgt[2], d, az: Math.atan2(v[0], v[2]) / DEG, el: Math.asin(v[1] / d) / DEG, ...extra };
};
const J = [0, 0, 0, 0, 0];
/** The middle of your aircraft on track 3 (`run` m from the touchdown point, `alt` m up), ≈ 1.5 m above its wheels. */
const jetC = (run, alt = 0) => {
  jetAt(3, run, alt, J);
  return [J[0] - 430 * ANGLED_DIR[0], J[1] + 150, J[2] - 430 * ANGLED_DIR[2]];
};
/** The hook's tip on the deck at `run` (it crosses wire i at plan.js · hookRun(i)). */
const hookTip = (run, y = 18) => onAngled(TOUCH.s + run * 100 - RAFALE.hook, 0, y);

const MB = [MIRROR.at[0], 190, MIRROR.at[2]]; //   the meatball on its datum
const HL = [LSO.at[0], 95, LSO.at[2]]; //          the landing officer's chest
const A3 = onAngled(BRINS.s[2]); //                Andromède, mid-runway
const DOG = CREW.dog;
const NG = CAT[0].from;
const STOP = 126.86; //                            where you stop: Andromède (36.86) + 90 m of cable — 34 m before the end

export default function ({ D }) {
  const { at, st, now, shot, cut } = D;
  const F = (t) => onFrame(t);
  const t = D.times({
    cables: "bolter:câbles", fullgas: "fullgas", repars: "bolter",
    decide: "decide", decider: "decide:décider",
    dans: "approche:dans", handful: "handful", sinks: "sinks",
    toolow: "toolow", wave1: "waveoff", wave2: "waveoff:wave#2", wave3: "waveoff:wave#3",
    tour: "tour", remets: "tour:remets", over: "over", refais: "tour:refais",
    deux: "deuxieme", centred: "centred", gardes: "deuxieme:gardes",
    tiens: "tiens", pente: "tiens:pente", angle: "tiens:angle", axe: "tiens:axe",
    t15: "t15", t10: "t10", t5: "t5",
    touch: "touch", full: "full",
    manque: "manque", miss1: "miss1", aphro: "manque:aphrodite", miss2: "miss2",
    bout: "bout", blacksea: "blacksea",
    attrape: "attrape", catch: "catch",
    arret: "arret", runout: "runout", sous: "arret:sous", stop: "stop", saved: "saved",
    toverdict: "toverdict", chute: "chute", struck: "struck", matin: "chute:matin", launched: "launched", soir: "chute:soir", verdict: "verdict",
    gilet: "vest", heard: "heard",
    aboie: "aboie", vite: "aboie:vite", fort: "aboie:fort", plusieurs: "aboie:plusieurs", bark: "bark",
    tocta: "tocta", servi: "comment:servi", vote1: "vote1", vote2: "vote2", commentEnd: "comment$",
    like: "like", piste: "like:piste", changer: "like:changer",
    abo: "abo", toloop: "toloop",
  });
  const tIn = at(HAND.c56.at); //                    525,53
  const tCardA = F(cardAt(D, "approche")); //       537,22 · « Andromède, la dernière chance »
  const tCardC = F(cardAt(D, "du")); //             593,03 · « Pourquoi « chien jaune » ? »

  /* ═════════ 525,53 → 528,0 · « Au moment de toucher, tu ne freineras pas : tu mettras… » — the rise goes on over the wire ═════════ */
  const after = seam(D, "c56", "in", { set: SET.PONT, state: { ...AT.night, etape: 9, kmhOn: 0, under: 1, jet: 0, bdial: 0.62 } });
  const tSeamEnd = tIn + HAND.c56.opt.after; //      526,73
  const tPlein = F(t.fullgas - 0.08); //             528,0
  shot(tSeamEnd, tPlein - tSeamEnd, { ...after, ...((p) => ({ tx: p[0], tz: p[2] }))(onAngled(4800)), ty: 0, d: 3600, az: -38, el: 24 }, "sine.inOut", after.d);
  st(tIn + 0.1, 1.1, { under: 0 }, "sine.inOut"); // the deck closes over the brake

  /* ═════════ 528,0 → 531,7 · « …plein gaz. Si ta crosse rate les trois câbles… tu repars. » — the rule: it rolls, it leaves ═════════ */
  // an aircraft on the runway, hook UP, full power, from aft-port; the eye stays, it re-aims and zooms to hold it
  const tLso = F(t.decide - 0.08); //                531,7
  const R0 = 60;
  const R1 = 175; //                                 past the end of the deck (161)
  const runB = (time) => R0 + ((R1 - R0) * (time - tPlein)) / (tLso - 0.03 - tPlein);
  const altB = (time) => (time < t.cables ? 0.05 : 0.05 + 11.95 * Math.pow((time - t.cables) / (tLso - 0.03 - t.cables), 2));
  const EB = onAngled(6400, -2300, 380);
  const tMidB = (tPlein + tLso) / 2;
  const B0 = aimAt(EB, jetC(runB(tPlein), altB(tPlein)), { fov: 30, ...SHARP });
  const B1 = aimAt(EB, jetC(runB(tMidB), altB(tMidB)), { fov: 13.6, ...SHARP });
  const B2 = aimAt(EB, jetC(runB(tLso), altB(tLso)), { fov: 8.6, ...SHARP });
  cut(tPlein, null, B0, { ride: 0, jet: 1, track: 3, run: R0, alt: 0.05, bank: 0, hook: 0, gas: 1, hud: 0, under: 0, fx: A3[0], fy: 150, fz: A3[2], fs: 3000 });
  shot(tPlein, tMidB - tPlein, B1, "none");
  shot(tMidB, tLso - tMidB, B2, "none");
  st(tPlein, tLso - 0.03 - tPlein, { run: R1 }, "none");
  st(t.cables, tLso - 0.03 - t.cables, { alt: 12 }, "sine.in"); // it leaves the end of the deck (nose already up: a bolter)

  /* ═════════ 531,7 → 538,9 · « Ce soir, l'officier est là… c'est lui qui va décider. » (pub) · card « Andromède » ═════════ */
  // behind the officer on his platform, the lights of your approach far beyond him; a slow push onto his hand
  const run1 = (time) => -1200 + 42 * (time - 538.0); // your first approach (one law, through the cuts)
  const tGa = F(t.remets - 0.08); //                 550,0 : the go-around
  const L0 = { ...VIEW.lsoBack, ...CLOSE, d: 950, az: 146, el: 11, side: 140 };
  const L1 = { ...L0, d: 800, az: 168, el: 8 };
  const L2 = { ...L0, ty: 110, d: 620, az: 176, el: 7, side: 120 }; // « décider » : onto his hand and his handset
  cut(tLso, null, L0, { ...AT.night, etape: 9, kmhOn: 0, ride: 0, jet: 1, track: 3, run: run1(tLso), alt: 0, bank: 0, hook: 1, gas: 0.8, hud: 0, lso: 1, lsoArm: 0.3, fx: HL[0], fy: 110, fz: HL[2], fs: 900 });
  const tSec = F(at("decide:dans") - 0.12); //       534,4 : « Et dans quelques secondes… » — he turns to us: his face, his handset
  shot(tLso, tSec - tLso, L1);
  const O1 = { ...VIEW.lso, ...CLOSE, d: 760, az: -34, el: 6, side: -170 };
  cut(tSec, null, O1, {});
  shot(tSec, t.decider - 0.3 - tSec, { ...O1, d: 680, az: -26 });
  shot(t.decider - 0.3, tCardA - (t.decider - 0.3), { ...O1, ty: 110, d: 560, az: -18, el: 5 }); // « décider » : onto his handset, through the hold
  st(tLso, tGa - 0.03 - tLso, { run: run1(tGa - 0.03) }, "none");

  // under the card: a whip behind your aircraft (ride 1), the card on the left, the aircraft on the right
  const tCock = F(t.dans - 0.08); //                 538,94
  const W0 = { ...VIEW.approach, d: 6800, az: 42, el: 15, side: -720, ...SHARP }; // right of the card title
  const W1 = { ...VIEW.approach, d: 5000, az: 14, el: 6, side: -700, ...SHARP };
  const W2 = { ...W1, d: 4400, az: 11, side: -600 };
  cut(tCardA, null, W0, { ride: 1, etape: 10, lso: 0, lsoArm: 0, fx: AT.night.fx, fy: AT.night.fy, fz: AT.night.fz, fs: AT.night.fs });
  shot(tCardA, 1.5, W1, "power2.out");
  shot(tCardA + 1.5, tCock - (tCardA + 1.5), W2);
  threadCall(D.tl, { from: tCardA + 0.2, to: tCardA + 2.5, text: "Wave off ? C'est lui qui décide." });

  /* ═════════ 538,9 → 543,8 · « Première approche. Dans le noir, le navire n'est qu'une poignée de lumières. Et la boule… » ═════════ */
  // the cockpit: the eye stays over your shoulder; a push is a lens that closes (changing `d` would move the eye)
  const sEye = TOUCH.s - RAFALE.cockpit[2] - 200;
  const EYEc = onAngled(sEye, 0, 420);
  const TGc = onAngled(sEye + 3000, 0, 420 - 3000 * Math.tan(TOUCH.glide * DEG));
  const CK = (fov) => aimAt(EYEc, TGc, { fov: fov * 0.78, drift: 0, ...SHARP }); // no drift: it would swing the eye into the canopy
  const C0 = CK(40);
  const tMir = F(t.sinks - 0.08); //                 543,75
  cut(tCock, null, C0, { hud: 1 });
  shot(tCock, tMir - tCock, CK(33));

  /* ═════════ 543,8 → 547,8 · « …descend sous la ligne. Trop bas. Dans ta radio : « Wave off… » ═════════ */
  // the ball, close, where the cluster of lights was: it sinks and turns signal; the wave-off lights come on
  const M0 = { ...P, ...CLOSE, tx: MB[0], ty: MB[1], tz: MB[2], d: 1250, az: 15, el: 3 };
  const M1 = { ...M0, d: 820, az: 10, el: 2 };
  const tArm = F(t.wave2 - 0.06); //                 547,77
  cut(tMir, null, M0, { ride: 0, hud: 0, ball: -0.15, fx: MB[0], fy: 150, fz: MB[2], fs: 900 });
  shot(tMir, tArm - tMir, M1);
  st(t.sinks, 0.6, { ball: -0.6 }, "sine.inOut"); //       « descend »
  st(t.toolow - 0.1, 0.45, { ball: -0.85 }, "sine.inOut"); // « Trop bas »
  st(t.wave1 - 0.05, 0.35, { waveoff: 1 }, "sine.out"); //  « Wave off » : fixed, signal

  /* ═════════ 547,8 → 550,0 · « …Wave off. Wave off. » — the officer's arm up; the cockpit, the red lights ahead ═════════ */
  const O0 = { ...VIEW.lso, ...CLOSE, d: 760, az: -24, el: 7, side: -150 };
  const tCock2 = F(t.wave3 - 0.06); //               548,74
  cut(tArm, null, O0, { lso: 1, lsoArm: 0.3, fx: HL[0], fy: 110, fz: HL[2], fs: 900 });
  shot(tArm, tCock2 - tArm, { ...O0, d: 700, az: -20 });
  st(t.wave2, 0.4, { lsoArm: 1 }, "power2.out");
  cut(tCock2, null, CK(36), { ride: 1, hud: 1, lso: 0, fx: AT.night.fx, fy: AT.night.fy, fz: AT.night.fz, fs: AT.night.fs });
  shot(tCock2, tGa - tCock2, CK(31));

  /* ═════════ 550,0 → 553,7 · « Tu remets les gaz. Tu repasses au-dessus du pont… et tu refais le tour. » ═════════ */
  // from the far end of the runway, looking aft: you come over the deck, climbing, and bank away; the eye stays
  const tApp2 = F(t.deux - 0.1); //                  553,7
  const G0r = -120;
  const G1r = 60;
  const runG = (time) => G0r + ((G1r - G0r) * (time - tGa)) / (tApp2 - 0.03 - tGa);
  const altG = (time) => (30 * (time - tGa)) / (tApp2 - 0.03 - tGa);
  const EG = onAngled(700, -15000, 2500); // 150 m abeam to port, 25 m up: you pass over the deck, right to left, climbing
  const tMidG = (tGa + tApp2) / 2;
  const lowG = (time) => { const c = jetC(runG(time), altG(time)); return [c[0], c[1] - 300, c[2]]; }; // aimed a little under it: the deck in the frame
  const G0 = aimAt(EG, lowG(tGa), { fov: 12, ...SHARP });
  const G1 = aimAt(EG, lowG(tMidG), { fov: 12, ...SHARP });
  const G2 = aimAt(EG, lowG(tApp2), { fov: 13, ...SHARP }); // wider: the deck stays under it
  cut(tGa, null, G0, { ride: 0, hud: 0, run: G0r, alt: 0, bank: 0, gas: 0.8, waveoff: 1, ball: -0.85, fx: A3[0], fy: 300, fz: A3[2], fs: 5000 });
  shot(tGa, tMidG - tGa, G1, "none");
  shot(tMidG, tApp2 - tMidG, G2, "none");
  st(tGa, tApp2 - 0.03 - tGa, { run: G1r, alt: 30 }, "none");
  st(t.remets, 0.4, { gas: 1 }, "sine.out"); //            « tu remets les gaz »
  st(t.remets + 0.4, 0.8, { waveoff: 0, ball: 0 }, "sine.inOut");
  st(t.refais - 0.1, 0.9, { bank: 30 }, "sine.inOut"); //  « tu refais le tour »

  /* ═════════ 553,7 → 558,9 · « Deuxième approche. Cette fois, la boule reste au centre. Tu la gardes. Tu la gardes. » ═════════ */
  const tTouch = F(t.touch - 0.03); //               564,87 : the wheels hit
  const run2 = (time) => -500 + (500 * (time - tApp2)) / (tTouch - tApp2); // your second approach: 0 at the touch
  const tCen = F(t.centred - 0.07);
  const tGard = F(t.gardes - 0.05);
  const tBeh = F(t.tiens - 0.06);
  cut(tApp2, null, CK(42), { ride: 1, hud: 1, run: -500, alt: 0, bank: 0, gas: 0.8, waveoff: 0, ball: 0, fx: AT.night.fx, fy: AT.night.fy, fz: AT.night.fz, fs: AT.night.fs });
  shot(tApp2, tCen - tApp2, CK(36));
  st(tApp2, tTouch - 0.03 - tApp2, { run: 0 }, "none"); //  ONE tween, through the cuts, to the touch
  // « la boule reste au centre » : the ball on its datum, veille
  const M2 = { ...P, ...CLOSE, tx: MB[0], ty: MB[1], tz: MB[2], d: 700, az: 9, el: 2 };
  cut(tCen, null, M2, { ride: 0, hud: 0, fx: MB[0], fy: 150, fz: MB[2], fs: 900 });
  shot(tCen, tGard - tCen, { ...M2, d: 640 });
  // « Tu la gardes » : the cockpit, the deck nearer
  cut(tGard, null, CK(34), { ride: 1, hud: 1, fx: AT.night.fx, fy: AT.night.fy, fz: AT.night.fz, fs: AT.night.fs });
  shot(tGard, tBeh - tGard, CK(30));

  /* ═════════ 558,9 → 562,1 · « Ta pente. Ton angle. Ton axe. Tu tiens tout. » — behind your aircraft, the three guides ═════════ */
  const A0 = { ...VIEW.approach, d: 3200, az: 12, el: 9, ...SHARP };
  const tCnt = F(t.t15 - 0.07); //                   562,06
  cut(tBeh, null, A0, { ride: 1, hud: 0 });
  shot(tBeh, tCnt - tBeh, { ...A0, d: 2800, az: 9, el: 8 });
  st(t.pente, 0.45, { guides: 1 / 3 }, "sine.inOut");
  st(t.angle, 0.45, { guides: 2 / 3 }, "sine.inOut");
  st(t.axe, 0.45, { guides: 1 }, "sine.inOut");

  /* ═════════ 562,1 → 564,9 · « Quinze secondes. Dix. Cinq. » — the cockpit, the deck that grows ═════════ */
  cut(tCnt, null, CK(40), { ride: 1, hud: 1, guides: 0 });
  shot(tCnt, tTouch - tCnt, CK(46));
  const fc = fact(D.tl, { id: "c6-count", k: "Le toucher dans", v: "15 secondes", tone: "signal", from: t.t15, to: tTouch - 0.02 });
  D.tl.set(fc.querySelector(".fact__v"), { textContent: "10 secondes" }, t.t10);
  D.tl.set(fc.querySelector(".fact__v"), { textContent: "5 secondes" }, t.t5);

  /* ═════════ 564,9 → 567,5 · « Tes roues frappent le pont. Et tu mets… plein gaz. » — from port, at deck level: AU RALENTI ═════════ */
  const tAth = F(t.manque - 0.12); //                567,5
  const ET = onAngled(3350, -2350, 110);
  const T0p = aimAt(ET, jetC(0), { fov: 34, ...CLOSE });
  const T1p = aimAt(ET, jetC(12.6), { fov: 34, ...CLOSE });
  cut(tTouch, null, T0p, { ride: 0, hud: 0, run: 0, alt: 0, bank: 0, hook: 1, gas: 0.8, fx: jetC(6)[0], fy: 100, fz: jetC(6)[2], fs: 1200 });
  shot(tTouch, tAth - tTouch, T1p, "none");
  st(tTouch, tAth - tTouch, { run: 12.6 }, "none"); //       the slow motion: ≈ 5 m a second of film
  st(t.full, 0.4, { gas: 1 }, "sine.out"); //                « plein gaz » : the two cores white

  /* ═════════ 567,5 → 570,5 · « Athéna… manquée. Aphrodite… manquée. » — the hook hops over each wire ═════════ */
  // the eye at deck level, port of the wire; the hook passes left (forward) — the same side as the shot before
  const tAph = F(t.aphro - 0.1); //                  569,0
  const tBout = F(t.bout - 0.1); //                  570,5
  const EA1 = onAngled(BRINS.s[0] - 170, -620, 75);
  const H0 = aimAt(EA1, hookTip(12.6), { fov: 30, ...CLOSE });
  const H1 = aimAt(EA1, hookTip(15.0), { fov: 30, ...CLOSE });
  cut(tAth, null, H0, { fx: onAngled(BRINS.s[0])[0], fy: 40, fz: onAngled(BRINS.s[0])[2], fs: 500 });
  shot(tAth, tAph - tAth, H1, "none");
  st(tAth, tAph - tAth, { run: 15.0 }, "none"); //           crosses Athéna (12,86) on « Athéna… »
  st(tAth + 0.02, 0.15, { hook: 0.78 }, "sine.out"); //     the hook hops…
  st(tAth + 0.17, 0.32, { hook: 1 }, "sine.in"); //         …and lands beyond the wire
  const EA2 = onAngled(BRINS.s[1] - 170, -620, 75);
  const H2 = aimAt(EA2, hookTip(24.0), { fov: 30, ...CLOSE });
  const H3 = aimAt(EA2, hookTip(26.0), { fov: 30, ...CLOSE });
  cut(tAph, null, H2, { run: 24.0, fx: onAngled(BRINS.s[1])[0], fy: 40, fz: onAngled(BRINS.s[1])[2], fs: 500 });
  shot(tAph, tBout - tAph, H3, "none");
  st(tAph, tBout - tAph, { run: 26.0 }, "none"); //          crosses Aphrodite (24,86) between « Aphrodite… » and « manquée »
  const hop2 = tAph + ((24.86 - 24) / 2) * (tBout - tAph) - 0.15; // peaks as the tip crosses the wire
  st(hop2, 0.15, { hook: 0.78 }, "sine.out");
  st(hop2 + 0.15, 0.32, { hook: 1 }, "sine.in");

  /* ═════════ 570,5 → 574,5 · « Le bout du pont fonce vers toi. Derrière… la mer noire. » — the cockpit, on the deck ═════════ */
  const tCat = F(t.attrape - 0.12); //               574,5
  // ride 1, written around run 0: the eye high over the canopy, behind your helmet (from the seat the helmet fills the frame)
  const K0 = aimAt(onAngled(TOUCH.s - RAFALE.cockpit[2] - 330, 0, 470), onAngled(TOUCH.s + 6500, 0, 0), { fov: 40, ...SHARP });
  cut(tBout, null, K0, { ride: 1, hud: 1, fx: AT.night.fx, fy: AT.night.fy, fz: AT.night.fz, fs: AT.night.fs });
  shot(tBout, tCat - tBout, { ...K0, fov: 33 }); // the lens closes on the end of the deck
  st(tBout, tCat - tBout, { run: 34 - 0.15 * 2.2 }, "none");

  /* ═════════ 574,5 → 576,9 · « Et ta crosse attrape… Andromède. » — three-quarter rear, low: THE THUMBNAIL 3 ═════════ */
  const tRun = F(t.runout - 0.68); //                576,88 : time comes back
  const TH = { ...VIEW.thumb3, ...SHARP };
  cut(tCat, null, { ...TH, d: 2600, az: -33 }, { ride: 0, hud: 0, fx: -747, fy: 100, fz: 6300, fs: 1500 });
  shot(tCat, tRun - tCat, { ...TH, d: 2300, az: -36 });
  st(tCat, t.catch - tCat, { run: 36.86 }, "none"); //       the hook on the wire ON « Andromède »
  const RC = 36.86 + 2.2 * (tRun - t.catch);
  st(t.catch, tRun - t.catch, { run: RC, pull: RC - 36.86 }, "none");
  st(t.catch, 0.15, { caught: 1 }, "power2.out"); //        the bight snaps veille
  D.punch(t.catch, 0.05);

  /* ═════════ 576,9 → 580,8 · « Le câble se déroule. Sous le pont, le frein avale ta vitesse. Et tu t'arrêtes… » ═════════ */
  // time comes back: from ahead-port, you rush at the camera, the cable trailing, and slow down; « Sous le pont » : a tilt
  // down matched into the brake under the glass deck
  const runE = (time) => {
    const u = Math.min(1, Math.max(0, (time - tRun) / (t.stop - tRun)));
    return RC + (STOP - RC) * (1 - (1 - u) * (1 - u)); // power2.out
  };
  const ER = onAngled(18900, -1700, 450);
  const fovR = (time) => 2 * Math.atan(760 / Math.hypot(...sub(ER, jetC(runE(time))))) / DEG;
  const tSink = F(t.sous - 0.08); //                 578,15
  const tA = tSink - 0.6;
  const R0p = aimAt(ER, jetC(runE(tRun)), { fov: fovR(tRun), ...SHARP });
  const RA = aimAt(ER, jetC(runE(tA)), { fov: fovR(tA), ...SHARP });
  const RB = aimAt(ER, mix(jetC(runE(tSink)), ER, 0.15).map((v, i) => (i === 1 ? v - 260 : v)), { fov: fovR(tSink), ...SHARP });
  cut(tRun, null, R0p, { fx: A3[0], fy: 150, fz: A3[2], fs: 4000 });
  shot(tRun, tA - tRun, RA, "none");
  st(tRun, t.stop - tRun, { run: STOP, pull: STOP - 36.86 }, "power2.out");
  const BRK = { ...VIEW.brake, ...SHARP, d: 1700, az: -42, el: 10 };
  const brk = D.match(tSink, [RA, RB], BRK, { state: { under: 1, fx: A3[0], fy: -300, fz: A3[2], fs: 1800 }, before: 0.6, after: 0.9 });
  const tStop = F(t.stop - 0.05); //                 580,8
  shot(tSink + 0.9, tStop - (tSink + 0.9), { ...brk, d: brk.d * 0.9, az: brk.az + 4 });
  st(tSink + 0.05, t.stop - (tSink + 0.05), { brake: 1 }, "power2.out"); // the ram runs, the oil heats

  /* ═════════ 580,8 → 583,4 · « …t'arrêtes… sauvé de justesse. » — stopped; the black sea 34 m beyond ═════════ */
  const SP0 = { ...P, ...SHARP, ...((p) => ({ tx: p[0], ty: 120, tz: p[2] }))(onAngled(16300, -150)), d: 4300, az: -60, el: 9, fov: 30 }; // the aircraft on the right, the end and the sea on the left
  const SP1 = { ...SP0, d: 4100, az: -57 };
  const SP2 = { ...SP0, ...((p) => ({ tx: p[0], tz: p[2] }))(onAngled(16800, -150)), d: 5000, az: -50, el: 20 };
  const tChute = F(t.toverdict); //                  583,4
  cut(tStop, null, SP0, { under: 0, fx: jetC(STOP)[0], fy: 150, fz: jetC(STOP)[2], fs: 2500 });
  shot(tStop, t.saved - 0.1 - tStop, SP1);
  shot(t.saved - 0.1, tChute - (t.saved - 0.1), SP2); //     « sauvé de justesse » : up, to see how close the end is
  now(t.stop, { kmh: -2, kmhOn: 1 });
  st(t.stop + 0.1, 0.9, { gas: 0.5 }, "sine.inOut");

  /* ═════════ 583,4 → 593,0 · LA CHUTE « Un porte-avions, ce n'est pas juste une piste… on l'a lancé… on l'a rattrapé. » ═════════ */
  // a long pull-back to the whole ship at night, from high aft-port; the catapult lights end to end on « Ce matin »,
  // Andromède on « Ce soir » — the two systems in one picture; the account name lights up on « rattrapé »
  now(tChute, { kmh: 0, kmhOn: 0 });
  const SHIP = { ...VIEW.shipWide, tx: -300, ty: -500, tz: 1500, d: 31000, az: -30, el: 24, side: -160 };
  const tMatin = F(t.matin - 0.12);
  const tSoir = F(t.soir - 0.12);
  shot(tChute, tMatin - tChute, { ...SP2, d: 9000, az: -42, el: 26 }, "sine.inOut", SP2.d); // the pull-back from your aircraft
  // « Ce matin » : CLOSE over the bow catapult's slot — the head of light runs through the frame
  const CATN = { ...P, ...CLOSE, ...((p) => ({ tx: p[0], ty: 0, tz: p[2] }))(onCat(0, 1800)), d: 1150, az: -38, el: 28, side: -120 };
  cut(tMatin, null, CATN, {});
  shot(tMatin, tSoir - tMatin, { ...CATN, d: 980, az: -30, el: 24 });
  // « Ce soir » : under the glass deck, Andromède's brake that caught you — the hot oil, the ram home
  const WIRN = { ...VIEW.brake, ...CLOSE, d: 1500, az: -36, el: 9, side: -100 };
  const tRatt = F(t.verdict - 0.32); //             591,7 : « …on l'a rattrapé » — the whole ship, both systems lit
  cut(tSoir, null, WIRN, { under: 1 });
  shot(tSoir, tRatt - tSoir, { ...WIRN, d: 1300, az: -44 });
  cut(tRatt, null, SHIP, { under: 0 });
  shot(tRatt, tCardC - 0.04 - tRatt, { ...SHIP, d: 28500, az: -26, el: 26 });
  st(tChute, 6, { fx: 0, fy: -400, fz: 0, fs: 26000 }, "sine.inOut");
  st(t.matin - 0.1, 1.0, { trace: 1 }, "sine.inOut"); //    « Ce matin » : the bow catapult, end to end…
  now(t.matin, { named: 4 }); //                            …its slot lit veille
  now(t.soir, { named: 11 }); //                           « Ce soir » : the three wires (the catapult keeps its trace)
  now(t.soir, { wireName: 3 }); //                          « Ce soir » : Andromède
  st(t.soir, 0.6, { wires: 1 }, "sine.inOut");
  retitle(D.tl, { showAt: t.chute + 0.07, strikeAt: t.struck, swapAt: t.launched, hideAt: t.verdict + 0.28 });
  D.verdict(t.verdict);

  /* ═════════ card 593,03 · 593,9 → 600,0 · « Et ton chien jaune du début ? Le jaune, c'est son gilet. Et le chien… » ═════════ */
  // under the card, a whip to the bow catapult: your yellow dog, standing, alone on the night deck (the card holds the left)
  const DG0 = { ...P, ...SHARP, tx: DOG[0], ty: 140, tz: DOG[2], d: 1250, az: -96, el: 15, side: -420 };
  const DG1 = { ...VIEW.dog, ...CLOSE, d: 660, az: -42, el: 6, side: -400 }; // right of the card title
  const DG2 = { ...DG1, d: 590, az: -36, side: -150 };
  const tMir2 = F(t.aboie - 0.08); //                600,0
  cut(tCardC, null, DG0, {
    ...AT.night, etape: 0, kmhOn: 0, kmh: 0, ride: 0, jet: 0, track: 1, run: 0, alt: 0, bank: 0, hook: 0, gas: 0.5, hud: 0,
    dog: 1, sig: 0, vest: 0.35, trace: 0, traceOut: 0, named: 0, wireName: 0, wires: 0.6, caught: 0, pull: 0, brake: 0, bdial: 0.5,
    fx: DOG[0], fy: 120, fz: DOG[2], fs: 700,
  });
  shot(tCardC, 1.6, DG1, "power2.out");
  const tChien = F(at("du:chien#2") - 0.08);
  shot(tCardC + 1.6, tChien - (tCardC + 1.6), DG2);
  const DG4 = { ...P, ...CLOSE, tx: DOG[0], ty: 120, tz: DOG[2], d: 300, az: -76, el: 6, side: -140 }; // « Et le chien… » : his vest fills the frame
  cut(tChien, null, DG4, {});
  shot(tChien, tMir2 - tChien, { ...DG4, d: 265, az: -68 }); //  « tu l'as entendu ce soir » : a slow push
  st(t.gilet - 0.05, 0.4, { vest: 1 }, "sine.out"); //       « son gilet »

  /* ═════════ 600,0 → 604,0 · « Ce « wave off » crié vite, fort, plusieurs fois… ça ressemble à un aboiement. » ═════════ */
  const M3 = { ...P, ...CLOSE, tx: MB[0], ty: MB[1] + 20, tz: MB[2], d: 1100, az: 18, el: 4 };
  const tBark = F(t.bark - 0.07); //                 603,95
  cut(tMir2, null, M3, { vest: 0.35, waveoff: 0, ball: 0, fx: MB[0], fy: 150, fz: MB[2], fs: 900 });
  shot(tMir2, tBark - tMir2, { ...M3, d: 950, az: 34 }); //  a slow orbit: its depth, the columns of red lights
  for (const p of [t.vite, t.fort, Math.max(t.fort + 0.55, t.plusieurs + 0.1)]) {
    st(p - 0.04, 0.18, { waveoff: 1 }, "sine.out"); //       one breath per word, never two in less than half a second
    st(p + 0.14, 0.3, { waveoff: 0.12 }, "sine.inOut");
  }
  st(t.fort + 1.4, 0.4, { waveoff: 0 }, "sine.inOut");

  /* ═════════ 604,0 → 606,2 · « …aboiement. C'est de là que vient le surnom. » — the dog again, his vest breathes ═════════ */
  const DG3 = { ...VIEW.dog, ...CLOSE, d: 560, az: -62, el: 8, side: -120 };
  const tDuel = F(t.tocta); //                       606,2
  cut(tBark, null, DG3, { fx: DOG[0], fy: 120, fz: DOG[2], fs: 700 });
  shot(tBark, tDuel - tBark, { ...DG3, d: 520, az: -67 });
  st(t.bark, 0.2, { vest: 1 }, "sine.out");
  st(t.bark + 0.35, 0.8, { vest: 0.55 }, "sine.inOut");

  /* ═════════ 606,2 → 613,5 · « Et toi, sur ce pont ? … Sinon… chien jaune ? Ou pilote ? » — THE DUEL ═════════ */
  // your Rafale back on the bow catapult, low from port-ahead: the dog on the left, your cockpit on the right
  const ck = [NG[0], 250, NG[2] + RAFALE.cockpit[2]];
  const mid = mix([DOG[0], 140, DOG[2]], ck, 0.5);
  // from port-ahead, behind the dog: he stands in the left foreground, your aircraft behind him on the right
  const tgU = mix([DOG[0], 140, DOG[2]], ck, 0.55);
  const U0 = aimAt([DOG[0] - 700, 170, DOG[2] - 650], tgU, { fov: 30, ...CLOSE });
  const U1 = aimAt([DOG[0] - 640, 175, DOG[2] - 610], tgU, { fov: 29, ...CLOSE });
  const U2 = aimAt([DOG[0] - 600, 185, DOG[2] - 520], tgU, { fov: 28, ...CLOSE });
  const tPull = t.commentEnd; //                     613,46 : the pull-back starts (the end screen comes at 613,8)
  cut(tDuel, null, U0, {
    ...FIRST, night: 1, lights: 1, mirror: 1, gas: 0.5, tremble: 0, sig: 0, vest: 0.35, kmhOn: 0, wires: 0.3,
    hot: 0.05, fx: mid[0], fy: 150, fz: mid[2], fs: 1200,
  });
  shot(tDuel, t.servi - tDuel, U1);
  shot(t.servi, tPull - t.servi, U2);
  st(t.vote1 - 0.03, 0.3, { vest: 1 }, "sine.out"); //       « chien jaune ? » : his vest
  st(t.vote2 - 0.03, 0.35, { hud: 1 }, "sine.out"); //       « Ou pilote ? » : your cockpit lights
  st(t.vote2 + 0.05, 0.4, { vest: 0.6 }, "sine.inOut");
  fact(D.tl, { id: "c6-vote1", k: "Toi, sur ce pont", v: "Chien jaune ?", tone: "veille", from: t.vote1 - 0.03, to: t.like + 0.4 });
  fact(D.tl, { id: "c6-vote2", k: "Ou", v: "Pilote ?", top: 430, from: t.vote2 - 0.03, to: t.like + 0.4 });

  /* ═════════ 613,5 → 622,4 · « Et envoie cette vidéo… juste une piste sur la mer… changer d'avis… un petit like. » ═════════ */
  // THE LAST 15 SECONDS: the subject in the LEFT half. A long pull-back to the whole ship at night, on the left
  const LIKE = { ...VIEW.shipWide, tx: -200, ty: -400, tz: -1500, d: 44000, az: -38, el: 17, side: 440 }; // the whole ship in the left half
  const tDown = F(t.abo - 0.05); //                  622,35
  const tLoop = F(t.toloop); //                      626,03
  const tWide = F(t.changer - 0.4); //                 ≈ 618,4 : the whole ship already on the left
  // first UP over your aircraft (the deck seen from above, never grazed by a fast camera), then out to the whole ship
  const UP = { ...P, ...SHARP, tx: mid[0], ty: 0, tz: mid[2], d: 7000, az: -112, el: 34, side: 260 };
  const tUp = tPull + 2.3;
  shot(tPull, tUp - tPull, UP, "sine.in", U2.d);
  shot(tUp, tWide - tUp, LIKE, "sine.out", UP.d);
  shot(tWide, tDown - tWide, { ...LIKE, d: 39000, az: -50, el: 23 }); // a slow orbit while the catapult and the wires light
  st(tPull, 6.5, { fx: -200, fy: -400, fz: -1500, fs: 24000 }, "sine.inOut");
  st(t.piste - 0.1, 0.7, { angled: 1 }, "sine.inOut"); //     « juste une piste sur la mer »
  st(t.changer - 0.1, 1.0, { trace: 1 }, "sine.inOut"); //   « changer d'avis » : the catapult…
  st(t.changer - 0.1, 0.6, { wires: 1 }, "sine.inOut"); //   …and the wires

  /* ═════════ 622,4 → 626,0 · « On se retrouve très vite, pour ouvrir un autre système qui veille sur toi. » ═════════ */
  // the camera comes down to the bow catapult, still on the left; the lights of the story go out as it lands
  const PRE = { ...POSE0, d: 2700, az: -15, el: 13, side: 240 };
  // « On se retrouve… » : a cut onto your aircraft on the catapult (the object), from port-aft high, still on the left; then down
  const NEAR = { ...P, ...SHARP, tx: NG[0], ty: 150, tz: NG[2] + 600, d: 5600, az: -46, el: 24, side: 320 };
  cut(tDown, null, NEAR, {});
  shot(tDown, tLoop - tDown, PRE, "sine.inOut", NEAR.d);
  st(tDown, 3.4, { fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: FIRST.fs }, "sine.inOut");
  now(tDown, { sig: 3, named: 0, wireName: 0, item: 0, etape: 0, track: 1, ride: 0 });
  st(tDown, 1.2, { traceOut: 1 }, "sine.inOut"); //          the trace fades where it stands…
  now(tDown + 1.3, { trace: 0, traceOut: 0 }); //            …and is cleared, never run back
  st(tDown, 1.6, { angled: 0, wires: FIRST.wires }, "sine.inOut");
  st(tDown, 0.6, { hud: 0, vest: FIRST.vest }, "sine.inOut");

  /* ═════════ 626,0 → 628,8 · LA BOUCLE « Et demain matin, sur cette catapulte… » — everything glides to FIRST and POSE0 ═════════ */
  // the day comes up, the engines rise to full power, « 0 km/h » comes back: the last picture IS the first
  D.loop({ at: tLoop, rewindAt: tLoop });
}
