// DOSSIER 030 — the chute, what the film still owes and the comment, the like, the next file LAST, the loop
// (toverdict → the end).
//   chute        the bench, the chain opened in one column, casing on top, loop at the bottom, nothing live. « La terre
//                ne te protège pas seule » : the loop glows on « terre », and « Te protège » is struck. « Elle donne un
//                chemin » : a veille head runs the whole chain from the lug to the loop and leaves it lit — the account
//                name lights up. « …au courant… » : the fault comes on the stub of casing and its current takes that way
//                (the header: VERS LA TERRE); « …pour que ton tableau coupe » : the differential sees it, its handle
//                falls, the casing is dead (0 VOLT) — « avant toi ». One slow move toward the unit.
//   comment      what the hook's C owed (« ce qui manque se voit sur tes prises ») : a cut in, on the same bench, to
//                the plug pulled out of its socket, the earth pin seen from above. « Sans broche » : the pin goes, and
//                what lies beyond the socket turns ghost — « pas de terre ». « Avec broche… » : the pin is back, the plug
//                goes home, and on « pas toujours » a head comes down the cord and dies behind the pin: nothing beyond.
//                « Dans les logements anciens… » : the camera pulls back to the column, its earth a ghost (one label:
//                what the picture cannot show). Then the question as a duel, back on the socket: the pin comes on « avec
//                broche », goes on « sans » — each answer has its picture, the film never answers.
//   like         the laundry, the machine stopped and unplugged: the old two-hole socket, the plug out of it.
//   prochain     the laundry far off, a model in the night; the next file, classified. Nothing of the subject after.
//   boucle       « Comme ce fil… » : back in the laundry, low on the floor, the cord and its green-and-yellow to the
//                socket, the casing live again; on « jour » the camera turns back onto the machine: the first frame.
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { moved } from "@kit/direct.js";
import { SET, VIEW, BENCHED, STAGED, POSE0, SOCKET, BENCH, SIZE } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

/* ── chute — the column whole under the title (the title and its shade end at y ≈ 640 / 840) ── */
const CHUTE = { ...VIEW.exploded, d: 360, shift: -120 };
const CHUTE_END = { ...CHUTE, d: 300, az: -22, shift: -165 }; // (a slow push toward the unit, the whole column kept)
/* ── comment — the plug pulled out of its socket, the earth pin seen from above (030-actes-maj: plug ≤ 0.3, el ≥ 25) ── */
const PLUG = { ...VIEW.bPlug, d: 80, shift: -90 };
const PLUG_END = { ...PLUG, d: 74, az: -18 };
// « pas toujours » : a step back and up the cord, so the head comes down it into the picture and dies behind the pin
const PLUG_RUN = { ...VIEW.bPlug, ty: 50, d: 130, el: 22, shift: -110 };
// « Dans les logements anciens… » : the column, the chain beyond the socket a ghost (the label in the top slot)
const ANOM = { ...VIEW.exploded, d: 330, az: -36, shift: -110 };
// the duel: the socket again, under the panel (#duel ends at y ≈ 760)
const DUEL = { ...VIEW.bPlug, d: 84, az: -22, shift: -150 };
const DUEL_END = { ...DUEL, d: 78, az: -28 };
/* ── like — a cut matched on the socket: the same socket at the same place of the picture, at home now — the old
   two-hole one, the plug out of it; the camera pulls back to the cord and the machine, stopped (#net ends at y ≈ 760) ── */
const LIKE = moved(DUEL_END, BENCH.socket, SOCKET.at);
const LIKE_END = { ...LIKE, d: 150, az: -30 }; // (a pull-back on the socket alone: wider, toward the machine, the camera ran into its lit drum)
/* ── prochain — the laundry far off, under the panel (#next ends at y ≈ 860) ── */
const FAR = { ...VIEW.far, shift: -170 };
const FAR_END = { ...FAR, d: 1850, az: -32 };
/* ── boucle — low on the wet floor, the cord and its green-and-yellow going to the socket (act 1's « rien n'a sauté ») ── */
const CORD = { ...POSE0, tx: -26, ty: 36, tz: 24, d: 268, az: -30, el: 9, shift: 70, side: 0 };
const CORD_END = { ...CORD, d: 262, az: -32 };

/* ── the light: what it stands around, and how wide ── */
const Lb = (p, fs) => ({ fx: p[0], fy: p[1], fz: p[2], fs });
const L_COLUMN = Lb([0, 34, 0], SIZE);
const L_PLUG = Lb(BENCH.plug, 18);
const [SX, SY] = SOCKET.at;
const L_SOCKET = Lb([SX + 16, SY, 8], 60);
const L_FAR = Lb([-40, 80, 80], 1200);

export default function fin({ D }) {
  const { tl, st, now, shot, cut, chip, punch } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", terre: "chute:terre", seule: "seule", elle: "elle", chemin: "chemin",
    courant: "chute:courant", ctableau: "ctableau", ccoupe: "ccoupe", cavant: "cavant", chuteEnd: "chute$",
    tocta: "tocta", prises2: "prises2", sansb: "sansb", avecb: "avecb", avecbEnd: "comment:broche#2$",
    toujours: "toujours", anciens: "comment:Dans", defect: "defect", frequente: "comment:fréquente$",
    enComm: "comment:En", commentaire: "commentaire", duelA: "duelA", duelB: "duelB",
    tolike: "tolike", like: "like", likeEnd: "likeEnd",
    toabo: "toabo", prochain: "prochain", autre: "autre", aboEnd: "aboEnd",
    toloop: "toloop", fil: "boucle:fil", rewind: "rewind",
  });

  /* ═════════════ CHUTE — « Voilà le secret : la terre ne te protège pas seule. Elle donne un chemin au courant… pour que ton tableau coupe avant toi. » ═════════════ */
  cut(t.toverdict, SET.BENCH, CHUTE, { ...BENCHED, explode: 1, live: 0, fault: 0, ...L_COLUMN });
  shot(t.toverdict, t.tocta - t.toverdict, CHUTE_END, "sine.inOut");
  // « la terre » : the loop glows — and it is not enough on its own
  st(t.terre, 0.3, { litBoucle: 1 }, "sine.out");
  st(t.seule + 0.1, 0.5, { litBoucle: 0.3 }, "sine.inOut");
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.seule, swapAt: t.chemin - 0.05, hideAt: t.tocta - 0.42 });
  // « Elle donne un chemin » : the head runs the chain from the lug to the loop, and leaves it lit
  st(t.elle, t.courant - t.elle, { run: 1, litBoucle: 0 }, "sine.inOut");
  D.verdict(t.chemin);
  // « …au courant… » : the fault on the stub, and its current takes that way, down to the earth (VERS LA TERRE)
  // (the casing turns live once the current is already on its way: the header goes 0 VOLT → VERS LA TERRE, never 230)
  st(t.courant, 0.12, { fault: 1 }, "power2.out");
  st(t.courant, 0.45, { leak: 1 }, "power1.out");
  st(t.courant + 0.16, 0.1, { live: 1 }, "none");
  // « …pour que ton tableau coupe » : the differential sees it, trips; the casing is dead (0 VOLT) — « avant toi »
  st(t.ctableau, 0.25, { ddr: 1 }, "sine.out");
  st(t.ccoupe, 0.12, { trip: 1 }, "power2.in");
  now(t.ccoupe + 0.12, { live: 0, fault: 0, leak: 0 });
  st(t.ccoupe + 0.4, 0.8, { ddr: 0.4 }, "sine.inOut");
  punch(t.cavant, 0.05);

  /* ═════════════ COMMENT — « Et tes prises ? Sans broche, pas de terre. Avec broche… pas toujours. » ═════════════ */
  // a cut in, on the same bench: the plug pulled out, the socket with its earth pin, the chain whole beyond it
  cut(t.tocta, SET.BENCH, PLUG, { ...BENCHED, explode: 1, plug: 0, pin: 1, ...L_PLUG });
  shot(t.tocta, t.avecbEnd - t.tocta, PLUG_END, "sine.inOut");
  // « Sans broche, pas de terre » : the pin goes; what lies beyond the socket turns ghost
  now(t.sansb, { pin: 0 });
  st(t.sansb + 0.1, 0.6, { chain: 0 }, "sine.inOut");
  // « Avec broche… » : the pin is back — the plug goes home in the pause; « pas toujours » : a head comes down the
  // cord and dies behind the pin, nothing beyond it
  now(t.avecb, { pin: 1 });
  st(t.avecbEnd + 0.02, 0.35, { plug: 1 }, "power2.inOut");
  shot(t.avecbEnd, t.toujours + 0.5 - t.avecbEnd, PLUG_RUN, "sine.inOut", PLUG_END.d);
  st(t.avecbEnd + 0.15, t.toujours + 0.45 - t.avecbEnd - 0.15, { run: 1 }, "sine.inOut");
  // « Dans les logements anciens, la terre défectueuse est l'anomalie la plus fréquente. » : the column, its earth a ghost
  shot(t.toujours + 0.5, t.frequente - t.toujours - 0.5, ANOM, "sine.inOut", PLUG_RUN.d);
  st(t.toujours + 0.5, 1.2, Lb([0, 34, 0], SIZE), "sine.inOut");
  st(t.anciens, 0.6, { run: 0 }, "sine.inOut");
  // (its two lines stacked: on one line it runs past the right edge TikTok crops)
  const anomaly = document.getElementById("chip-anomalie");
  if (anomaly) Object.assign(anomaly.style, { flexDirection: "column", alignItems: "flex-start", gap: "10px" });
  chip("chip-anomalie", null, 96, 470, t.anciens + 0.1, t.frequente - 0.12);

  /* ═════════════ « En commentaire : chez toi… avec broche, ou sans ? » — the duel, on the socket ═════════════ */
  const toDuel = t.enComm - 0.18; // (in the breath before « En »; the label has left)
  cut(toDuel, SET.BENCH, DUEL, { ...BENCHED, explode: 1, plug: 0, pin: 0, chain: 0, ...L_PLUG });
  shot(toDuel, t.tolike - toDuel, DUEL_END, "sine.inOut");
  now(t.duelA, { pin: 1 }); // « avec broche »
  now(t.duelB, { pin: 0 }); // « sans » — each answer its picture; the film does not answer
  duelCall(tl, { from: toDuel + 0.08, word: t.commentaire, aAt: t.duelA, bAt: t.duelB, to: t.tolike - 0.32, toneA: "veille", toneB: "signal" });

  /* ═════════════ LIKE — « Like : pour quelqu'un qui a encore des prises sans broche. » ═════════════ */
  // the laundry, the machine stopped and unplugged: the two-hole socket, the plug out of it; nothing is live
  // (the same socket as the duel's, at the same place: only what stood around it changes on the cut)
  cut(t.tolike, SET.SCENE, LIKE, { ...STAGED, spin: 0, live: 0, fault: 0, reach: 0, plug: 0, mood: 0, ...L_SOCKET });
  shot(t.tolike + 0.3, t.toabo - t.tolike - 0.3, LIKE_END, "sine.inOut", LIKE.d);
  likeCall(tl, { from: t.like, to: t.likeEnd - 0.1, count: 5, label: (n) => `${n} personnes` });

  /* ═════════════ PROCHAIN DOSSIER — classified, and last: it stays until the loop ═════════════ */
  cut(t.toabo, SET.SCENE, FAR, { ...STAGED, spin: 0, live: 0, fault: 0, reach: 0, plug: 0, mood: 0, ...L_FAR });
  shot(t.toabo, t.toloop - t.toabo, FAR_END, "sine.inOut", FAR.d);
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.autre - 0.2, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ═════════════ BOUCLE — « Comme ce fil… le jour où… » → « Ta machine à laver est sous tension. » ═════════════ */
  // back in the laundry as the first frame has it (every number FIRST's): low on the floor, the cord and its
  // green-and-yellow to the socket; on « fil » it glows a little; on « jour » the camera turns back onto the machine
  const first = numbers(D.first);
  cut(t.toloop, D.first.set, CORD, { ...STAGED, ...first });
  shot(t.toloop, t.rewind - t.toloop, CORD_END, "sine.inOut");
  st(t.fil, 0.35, { pe: 0.7 }, "sine.out");
  D.loop({ at: t.toloop, rewindAt: t.rewind });
}
