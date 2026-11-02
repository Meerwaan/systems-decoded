// DOSSIER 031 — the chute, what the film still owes, the like, the next file, the loop (toverdict 62,65 → the end).
//   chute        the conflict is over, the two planes stacked: the camera starts on YOUR plane (« tu n'as pas choisi
//                de monter ») and pulls back, by ratio, until the other one is in the frame under it — on « machines »
//                the veille line lights between the two processors; « mises d'accord » a pulse runs from yours to his,
//                and his answer comes back to yours just before « te le dire ». « Toi » struck, « Deux machines ».
//   comment      behind your fin, the other head-on again: « tu obéis à qui ? » — the two orders, the controller's
//                wave rising in signal; on « machine » the ground's order dims and its wave dies
//                · 2002: PIÈCE N° 1, the two descents drawn, converging; they fade BEFORE « percutés » — nothing
//                touches, the sky behind gone dark · « Depuis, la règle est claire »: the light back, the machine's
//                order alone · the duel: your ND, the red square of the order, the five seconds
//                counted in the header. The film never answers for the viewer.
//   like         your cabin, the passenger of glass asleep at his window; a cut out of the cabin on « Deux »: on
//                « machines » the line leaves your bay toward the other plane far ahead, on « veillent » the rings
//   prochain     the camera leaves the cabin and climbs into the night, the next file over it (nothing of the subject
//                is said after it; the panel carries the subscription)
//   boucle       « Mais ce soir, là-haut… »: a cut to the first frame's camera, a lens a little wider, the other plane
//                a little further — it rushes in, the lens closes, and the last frame is the first.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, FIRST, POSE0, BAY, otherPos } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

/* ── the chute: the state act 3 hands over (gap −60, up 30, down 30: you above, him under, passed) ── */
const AFTER = { gap: -60, up: 30, down: 30 };
const [OX, OY] = otherPos(AFTER);
const MINE = BAY.cpu; // your processor, in your bay
const HIS = [OX - BAY.cpu[0], OY + BAY.cpu[1], -BAY.cpu[2]]; // his (his plane is turned half a turn)
const MID = [(MINE[0] + HIS[0]) / 2, (MINE[1] + HIS[1]) / 2, 0];
// « Toi »: your forward fuselage, your bay and its core, under the title
const CH_IN = { ...P, tx: MINE[0], ty: MINE[1], tz: 0, d: 16000, az: -25, el: 16, fov: 30, shift: 40 };
// « Deux machines »: both planes, the line between the two cores, all under the title (it ends at y ≈ 630)
const CH_OUT = { ...P, tx: MID[0], ty: MID[1], tz: 0, d: 52000, az: -25, el: 16, fov: 30, shift: -40 };

/* ── comment: behind your fin, the other head-on (the orders over it) ── */
const CHASE = { ...VIEW.chase, shift: -60 };
// the duel: your ND, close — the red square of the order, back at the moment it was given (35 s, five to obey)
const DUEL = { ...VIEW.nd, d: 66, shift: 150 };

/* ── like, next file ── */
const CABIN = { ...VIEW.cabin };
// « Deux machines veillent sur lui »: out of the cabin — the sleeper at his window, your bay and its core, the crown
const WIDE = { ...P, tx: -2000, ty: -20, tz: 60, d: 4200, az: -25, el: 32, fov: 34, shift: 30 }; // (the core out of the captions: y ≈ 1060)
const NIGHT = { ...P, tx: -1500, ty: 0, tz: 0, d: 9000, az: -20, el: 52, fov: 34, shift: -120 };

export default function fin({ D }) {
  const { tl, st, shot, cut, panel, punch } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", machines: "chMachines", accord: "chute:mises", dire: "chute:dire",
    tocta: "tocta", toi: "comment", machine: "cmMachine", y2002: "cm2002", sienne: "comment:sienne", percutes: "cmPercutes",
    depuis: "comment:depuis", claire: "comment:claire$", commentaire: "cmCommentaire", cinq: "comment:cinq",
    duelA: "duelA", duelB: "duelB", hesites: "comment:hésites$",
    like: "like", lkDeux: "like:deux", lkMachines: "like:machines", veillent: "lkVeillent", likeEnd: "like$",
    abo: "abo", prochain: "abProchain", y1883: "ab1883", aboEnd: "abo$", toloop: "toloop",
  });

  /* ── CHUTE: « Le secret : tu n'as pas choisi de monter. Deux machines se sont mises d'accord… avant de te le dire. » ── */
  cut(t.toverdict, SET.SKY, CH_IN, {
    ...STAGED, ...AFTER, cores: 1, mood: 0, tau: 0, obey: -1, level: 0, ra: 0, level2: 0, ra2: 0, vs: 0, vs2: 0, ping: 0,
  });
  // one move: from you to the pair, by ratio — the other plane comes into the frame under you as « Deux machines » lands
  shot(t.toverdict, t.machines - t.toverdict, CH_OUT, "sine.inOut", CH_IN.d);
  shot(t.machines, t.tocta - t.machines, { d: CH_OUT.d * 0.94 }, "none");
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.machines - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  punch(t.pas, 0.06);
  // « Deux machines »: the line between the two cores · « mises d'accord »: yours tells his · his answer comes back
  st(t.machines - 0.1, 0.35, { link: 1 }, "power2.out");
  st(t.accord - 0.1, 0.65, { coord: 1 }, "sine.inOut");
  st(t.accord + 0.6, t.dire - t.accord - 0.62, { answer: 1 }, "sine.inOut");

  /* ── COMMENT 1: « Toi, tu obéis à qui ? À la machine. » — behind you, both orders; the ground's dies ── */
  cut(t.tocta, SET.SKY, CHASE, { ...STAGED, gap: 170, up: 0, down: 0, cores: 1, mood: 0, tau: 0, obey: -1, level: 0, ra: 0, ping: 0 });
  // (no rings here: from behind your tail, each reply opens 30 m wide as it reaches you, a second apart, by the lens)
  shot(t.tocta, t.depuis - t.tocta, { ...CHASE, fov: 31 }, "sine.inOut");
  st(t.tocta, t.commentaire - t.tocta, { gap: 140 }, "none"); // it keeps coming (a plane that stops is parked in the sky)
  tl.set("#order-tcas", { opacity: 1 }, t.tocta);
  tl.set("#order-atc", { opacity: 1 }, t.tocta);
  panel("#orders", t.toi - 0.04, t.y2002 - 0.45);
  st(t.toi, t.machine - t.toi - 0.2, { atc: 1 }, "sine.out"); // the controller's wave rises to you
  tl.to("#order-atc", { opacity: 0.2, duration: 0.25, ease: "power2.out" }, t.machine);
  st(t.machine, 0.6, { atc: 2 }, "power2.out");

  /* ── COMMENT 2: « En 2002, un seul des deux avions a suivi la sienne. Ils se sont percutés. » ── */
  // the sky goes dark behind the record; the two traces draw and converge — and fade before « percutés »
  st(t.y2002 - 0.3, 0.5, { shell: 0.3, lights: 0.25, ping: 0, cores: 0.4 }, "power2.inOut");
  const traces = ["#piece-a", "#piece-b"].map((sel) => {
    const path = document.querySelector(sel);
    const len = Math.ceil(path?.getTotalLength?.() ?? 700) + 2;
    return [sel, len];
  });
  tl.fromTo("#piece", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.y2002 - 0.1);
  for (const [sel, len] of traces) {
    tl.fromTo(sel, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 }, { strokeDashoffset: 0, duration: t.sienne - t.y2002 + 0.3, ease: "sine.inOut" }, t.y2002 + 0.1);
    tl.to(sel, { opacity: 0, duration: 0.25, ease: "power2.in" }, t.percutes - 0.36);
  }
  punch(t.percutes, 0.05);
  tl.to("#piece", { opacity: 0, y: -24, duration: 0.22, ease: "power2.in" }, t.depuis - 0.25);

  /* ── COMMENT 3: « Depuis, la règle est claire. » — the light back, the machine's order alone ── */
  st(t.depuis - 0.1, 0.45, { shell: 1, lights: 1, cores: 1 }, "power2.out");
  tl.set("#order-atc", { opacity: 0 }, t.depuis - 0.1);
  panel("#orders", t.depuis + 0.02, t.claire);

  /* ── COMMENT 4: « En commentaire : cinq secondes… tu obéis, ou tu hésites ? » — the order on your screen, five seconds ── */
  cut(t.commentaire - 0.2, SET.SKY, DUEL, { ...STAGED, gap: 150, up: 0, down: 0, cores: 1, mood: 1, tau: 35, level: 3, ra: 1, vs: 0, obey: 5 });
  shot(t.commentaire - 0.2, t.like - t.commentaire, { d: DUEL.d * 0.92 }, "sine.inOut");
  duelCall(tl, { from: t.commentaire - 0.1, aAt: t.duelA, bAt: t.duelB, to: t.like - 0.3, toneA: null, toneB: null });
  // the header counts the five seconds out — both readouts in the same story time (the square comes down toward you)
  st(t.cinq, t.hesites - t.cinq, { obey: 0, tau: 30 }, "none");

  /* ── LIKE: « Like : pour quelqu'un qui a peur en avion. Deux machines veillent sur lui. » ── */
  cut(t.like - 0.1, SET.SKY, CABIN, { ...STAGED, gap: 800, up: 0, down: 0, sleeper: 1, cores: 1, mood: 0, tau: 0, obey: -1, level: 0, ra: 0, ping: 0 });
  shot(t.like - 0.1, t.lkDeux - t.like, { d: CABIN.d * 0.94 }, "sine.inOut");
  // « Deux machines veillent sur lui »: a cut out of the cabin — him small at his window, your bay's core, the crown
  cut(t.lkDeux - 0.1, SET.SKY, WIDE, { ...STAGED, gap: 800, up: 0, down: 0, sleeper: 1, cores: 1, mood: 0, tau: 0, obey: -1, level: 0, ra: 0, ping: 0 });
  shot(t.lkDeux - 0.1, t.prochain - t.lkDeux, { d: WIDE.d * 1.08 }, "none");
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.04, count: 5, label: (n) => (n === 1 ? "1 passager" : `${n} passagers`) });
  st(t.lkMachines - 0.08, 0.4, { link: 1 }, "power2.out"); // your machine and his, far ahead: the line
  st(t.veillent - 0.12, 0.25, { ping: 1 }, "power2.out"); // and the rings, every second

  /* ── PROCHAIN DOSSIER — the camera leaves the cabin and climbs into the night; the panel carries the rest ── */
  shot(t.prochain - 0.05, t.toloop - t.prochain - 0.1, NIGHT, "sine.inOut", WIDE.d * 1.08);
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.y1883 - 0.05, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: « Mais ce soir, là-haut… » — the first frame's camera, the lens a little wider, the other further ── */
  // everything is the first frame's but the lens and the gap: both close in, accelerating (sine.in), into frame 0 —
  // where act 1 goes on the same way (its lens 34 → 32, the gap falling)
  cut(t.toloop, SET.SKY, { ...POSE0, fov: POSE0.fov + 1 }, { ...STAGED, ...numbers(FIRST), gap: FIRST.gap + 26 });
  D.loop({ at: t.toloop, rewindAt: t.toloop, ease: "sine.in" });
}
