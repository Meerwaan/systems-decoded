// DOSSIER 012 — the chute, the three calls to action, the loop (toverdict → the end).
//   chute        TWO pictures on the bench. The heart, shut and cold, seen like an X-ray, under the title: "Détecte le gaz"
//                is struck on "détecté", "Lâche un ressort" takes its place and the spring lights up. Then the whole
//                chain in one frame — the flame, the red tip, the veille lead, the magnet that holds — put out in a
//                second: the flame, the tip, the current, the grip, and the spring snaps.
//   like         the system whole, solid, cold; the camera turns slowly round it under the panel
//   abonnement   the camera backs away and comes down; on "d'autres flammes" the knob goes down and the burner lights
//                again (the next file is a fire too), the tip reddens, the lead turns veille — and the knob comes back
//                up: the flame stays
//   commentaire  the kitchen, the hob without its saucepan seen from above, your hand on its knob. You push it · the
//                burner: it lights on "flamme", and the camera goes in to the tip beside it · your hand again, keeping
//                the knob down beside the flame · "c'est elle": the tip, red-hot now, the flame standing by itself
//                (your hand cannot leave the knob — hob.js — so the release is told by the tip, not by the hand) —
//                and the question is asked over it
//   boucle       the first frame's axis from further, another evening: the saucepan on a full flame, nothing boils
//                over yet · back to the first frame (the foam rises and starts to run)
// (Poses placed by projection — the parts against the title, the panels, the chevrons and the captions — then looked at.)
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, FIRST, POSE0, BENCHED, STAGED, VIEW } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };

/* chute 1 — the heart in profile (xray 1), under the title (its last line ends at y 606, its shade at 840): the can lies between y 833 and 1112 */
const HEART = { ...P, tx: -1.5, ty: 3.6, tz: 5.2, d: 27, az: -78, el: 8, shift: 0 };
const HEART_NEAR = { d: 24.5, az: -75 };
const HEART_LIGHT = { fx: -1.5, fy: 3.5, fz: 5, fs: 6 };
/* chute 2 — the whole chain: the crown on the left (its flames stop just under the title), the tip, the lead down to the magnet unit on the right (left of TikTok's buttons) */
const CHAIN = { ...P, tx: -0.5, ty: 7.4, tz: -2.2, d: 86, az: -68, el: 10, shift: 20, side: 70 };
const CHAIN_NEAR = { d: 82, az: -66 };
// …then down the lead to the magnet unit, for the snap (the knob, black, climbs behind the end of the title; the burner and the tip leave by the left)
const SNAP = { ...P, tx: -1.5, ty: 4.4, tz: 4.2, d: 40, az: -74, el: 8, shift: -20 };
const SNAP_NEAR = { d: 38 };

/* like · abonnement — the system whole under a panel (#net ends at y 761, #next lower) */
const WHOLE = { ...P, tx: 0.5, ty: 6, tz: -0.5, d: 98, az: -38, el: 12, shift: -20, side: 125 };
const WHOLE_LIKE = { az: -52 };
const ABO = { ...P, tx: 0.5, ty: 7, tz: -1.2, d: 124, az: -62, el: 5, shift: -90, side: 70 };
const ABO_END = { az: -70, el: 3.5 };

/* commentaire — you at the hob · the burner, then the tip beside the flame · you, the hand on the knob · the tip again */
// (from the hob to the tip it is a CUT: a dive passes your hand at arm's length — a mannequin's hand across the picture)
// the hob from above, your forearm coming in from the right: the hand, the knob, the burner. (The picture is pushed
// 180 px to the right: your upper arm then climbs past the header's clock, not behind it — and from further, or
// lower, your shoulders and your head stand behind the header.)
const KNOB = { ...P, tx: 166, ty: 104, tz: 52, d: 200, az: -58, el: 20, fov: 30, shift: 100, side: -180 };
const KNOB_NEAR = { d: 190, az: -54 };
const AT_HOB = { ...KNOB, d: 214, az: -61 };
const HOB_LIGHT = { fx: 170, fy: 110, fz: 60, fs: 70 };
// the burner alone, your hand just out of the picture on the right (the knob stands 11 cm to the right of the tip)
const BURNER = { ...P, tx: 164.5, ty: 93.5, tz: 36.5, d: 68, az: -66, el: 12, shift: 40 };
const TIP = { ...VIEW.tip, d: 32, az: -60, shift: 55 };
const TIP_NEAR = { d: 30, az: -56 };
const TIP_LIGHT = { fx: 163, fy: 93, fz: 39, fs: 12 };
const ITS = { ...VIEW.tip, d: 33, az: -50, el: 10, shift: -50 };
const ITS_END = { d: 38, az: -44 };

/* boucle — the first frame's own axis, from further: the way back is one push-in */
const KITCHEN = { ...P, ...POSE0, d: POSE0.d * 2.2, ty: POSE0.ty + 3, drift: 0.3 };

/* the hob of the comment: no saucepan, everything cold and shut, you at it */
const COLD = { ...STAGED, pot: 0, spill: 0, boil: 0, flame: 0, gas: 0, valve: 0, hold: 0, heat: 0, volts: 0, mood: 0, you: 1 };

export default function fin({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", idea: "idea", verdict: "verdict", tochain: "chute:flamme-0.08", went: "went", shutdown: "shutdown", shut: "chute:fermé", tocta: "tocta",
    like: "like", likeEnd: "like$",
    toabo: "toabo", abo: "abo", next: "next", autres: "abo:d'autres", flammes: "abo:flammes", f1: "f1", halo: "halo", aboEnd: "abo$",
    tocomment: "tocomment", look: "look", flamme: "comment:flamme", pin: "pin", tohold: "comment:et#2-0.12", hold: "hold", its: "its", elle: "comment:elle#2",
    ask: "ask", commentaire: "comment:commentaire", tienne: "comment:tienne#2", toloop: "toloop", rewind: "rewind",
  });

  /* ── chute 1: "Rien n'a détecté ton gaz. C'est un ressort :" — the heart, shut and cold ── */
  cut(t.toverdict, SET.BENCH, HEART, { ...BENCHED, xray: 1, ...HEART_LIGHT });
  shot(t.toverdict, t.tochain - t.toverdict, HEART_NEAR);
  // (the shade only under the first picture: the heart is dark, the title lies over the knob's spindle; over the chain it would dim the flame)
  retitle(tl, { showAt: t.toverdict + 0.06, strikeAt: t.idea + 0.1, swapAt: t.verdict, hideAt: t.tocta - 0.27, shade: false });
  tl.fromTo("#title-shade", { opacity: 0 }, { opacity: 1, duration: 0.3 }, t.toverdict + 0.02);
  tl.set("#title-shade", { opacity: 0 }, t.tochain);
  D.verdict(t.verdict);
  st(t.verdict - 0.05, 0.3, { litSpring: 1 }, "power2.out");

  /* ── chute 2: "la flamme payait pour le retenir. Elle s'est éteinte… il a fermé." — the chain, then put out ── */
  cut(t.tochain, SET.BENCH, CHAIN, { ...BENCHED, xray: 1, flame: 1, heat: 1, volts: 1, hold: 1, valve: 1 });
  shot(t.tochain, t.went - t.tochain, CHAIN_NEAR);
  // "Elle s'est éteinte…": the flame, then what it paid for — the tip's red, the current in the lead
  st(t.went, 0.5, { flame: 0 }, "power2.in");
  st(t.went + 0.3, 0.9, { heat: 0 }, "sine.inOut");
  st(t.went + 0.4, 0.95, { volts: 0 }, "sine.inOut");
  // the camera follows the loss down the lead to the magnet unit
  const atSnap = t.shutdown - 0.05;
  shot(t.went, atSnap - t.went, SNAP, "sine.inOut", CHAIN_NEAR.d);
  st(t.went, atSnap - t.went, { fx: SNAP.tx, fy: SNAP.ty, fz: SNAP.tz, fs: 9 }, "sine.inOut");
  // "il a fermé.": the grip dies, the spring throws the seal on its seat — and lights up: it is what shut
  st(t.shutdown, 0.1, { hold: 0 }, "power2.out");
  st(t.shut - 0.02, 0.1, { valve: 0 }, "power4.in");
  st(t.shut + 0.06, 0.25, { litSpring: 1 }, "power2.out");
  shot(atSnap, t.tocta - atSnap, SNAP_NEAR);

  /* ── LIKE: the system whole, cold; the camera turns slowly round it ── */
  cut(t.tocta, SET.BENCH, WHOLE, { ...BENCHED });
  const toAbo = t.toabo - 0.05;
  shot(t.tocta, toAbo - t.tocta, WHOLE_LIKE, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ── ABONNEMENT: the camera backs away and comes down ("Abonne-toi."); "d'autres flammes": the burner lights again ── */
  shot(toAbo, t.next - toAbo, ABO);
  shot(t.next, t.tocomment - t.next, ABO_END);
  nextFile(tl, { showAt: t.next, factAt: t.f1, hideAt: t.tocomment - 0.32, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });
  st(t.autres - 0.1, 0.3, { press: 1 }, "power2.out");
  st(t.flammes - 0.06, 0.45, { flame: 1 }, "power2.out");
  st(t.flammes + 0.3, 1.5, { heat: 1 }, "sine.out");
  st(t.flammes + 0.8, 1.3, { volts: 1 }, "sine.inOut");
  st(t.f1 + 0.9, 0.3, { hold: 1 }, "power2.out");
  now(t.f1 + 1.2, { valve: 1 });
  // the knob comes back up: the magnet holds, the flame stays
  st(t.halo - 0.1, 0.35, { press: 0 }, "power2.inOut");

  /* ── COMMENTAIRE: "Et la tienne, elle l'a ?" — the kitchen, the hob without its saucepan, you at it ── */
  cut(t.tocomment, SET.KITCHEN, AT_HOB, { ...COLD, ...HOB_LIGHT });
  shot(t.tocomment, t.look - t.tocomment, { d: AT_HOB.d * 0.95, az: -59 });
  st(t.look - 0.42, 0.3, { press: 1 }, "power2.out"); // you push the knob down…
  // "Regarde à côté de la flamme : une petite pointe de métal." — the burner: it lights on the word; in to the tip
  cut(t.look, SET.KITCHEN, BURNER, { fx: 165, fy: 93, fz: 37, fs: 18 });
  st(t.flamme - 0.1, 0.45, { flame: 1 }, "power2.out");
  const atTip = t.pin - 0.1;
  shot(t.look, atTip - t.look, TIP, "sine.inOut", BURNER.d);
  st(t.look + 0.02, atTip - t.look - 0.02, { ...TIP_LIGHT }, "sine.inOut");
  st(t.pin - 0.05, 0.4, { litTip: 1 }, "power2.out");
  chip("chip-tige", null, 96, 446, t.pin, t.tohold - 0.16);
  shot(atTip, t.tohold - atTip, TIP_NEAR);
  st(t.flamme + 0.5, t.tohold - t.flamme - 0.5, { heat: 0.35 }, "sine.in");

  // "Et si tu dois garder la manette enfoncée pour allumer…" — you, your hand on the knob, kept down while the tip heats
  cut(t.tohold, SET.KITCHEN, KNOB, { ...HOB_LIGHT, litTip: 0 });
  shot(t.tohold, t.its - t.tohold, KNOB_NEAR);
  chip("chip-hold", null, 96, 446, t.hold, t.its - 0.16);
  st(t.tohold, t.its - t.tohold, { heat: 1 }, "sine.out");
  st(t.hold, t.its - t.hold - 0.3, { volts: 1 }, "sine.inOut");
  st(t.its - 0.4, 0.3, { hold: 1 }, "power2.out");
  now(t.its - 0.05, { valve: 1 });

  // "c'est elle." — the tip again, red-hot now; you have let go and the flame stands by itself
  cut(t.its, SET.KITCHEN, ITS, { ...TIP_LIGHT, press: 0 });
  st(t.elle - 0.05, 0.35, { litTip: 1 }, "power2.out");
  shot(t.its, t.toloop - t.its, ITS_END, "sine.inOut", ITS.d);
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.tienne, chars: 3, to: t.toloop - 0.32 });

  /* ── BOUCLE: "Parce qu'un soir ou l'autre, forcément…" — another evening: the saucepan on a full flame ── */
  cut(t.toloop, SET.KITCHEN, KITCHEN, { ...FIRST, spill: 0, flame: 1, fs: 90 });
  shot(t.toloop, t.rewind - t.toloop, { d: KITCHEN.d * 0.95 });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: KITCHEN.d * 0.95 });
}
