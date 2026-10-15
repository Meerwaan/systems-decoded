// 03 · RÉPONSE — from « Zéro. Le choc. » to « …encaisse… moins. » (tozero → toverdict). The climax, in slow motion,
// in cuts: one shot per breath of the voice. Every cut is laid a few frames before its sentence; the first one says
// the whole state ({ ...STAGED, … }), the next ones what changes on them. Three numbers run across every cut, from
// one end of the act to the other, and are never set by a cut: the clock (`ms`), the nose folding (`crush`) and what
// the crash throws (`debris`).
//
// THE CLOCK: 0 on « Zéro », 20 on « tendue » (the voice's figure), at an even pace; past 20 nothing is sourced, so it
// only creeps on (the header shows it rounded, with "≈"). THE STRAP: « Du mou » → « Tendue » on « tendue » → it jumps
// to ≈ 300 kg on « Trois cents », ≈ 400 on « Quatre » (signal) → it turns veille as the bar gives way (`give`) — the
// header never shows a figure the voice has not said.
//
// Where the camera stands:
//   · the crash, wide, from your side (the wall on the left) — no knock on it: a car in profile is all level lines;
//   · the order, from above: the control unit on the tunnel, its wire under the seat to the pillar's foot;
//   · ONE frame for « La charge part. Le gaz lance la turbine. La bobine tourne à l'envers. »: the retractor in its
//     pillar, three quarters, the car dimmed — what lights up says which word it is (the flash, the gas, the spool);
//     then the frame backs up the pillar with the strap that runs;
//   · you, from ahead of your door: the strap racing across your chest, flat on it on « tendue »;
//   · you in profile, the wheel ahead: your body comes, sinks into a strap that is already tight;
//   · the bar, through the spool (covers of glass): it twists, the strap goes back out;
//   · you in profile again: the last few centimetres, gently, your head into the pale bag — and the light lets go.
import { setAct } from "@kit/overlay.js";
import { moved } from "@kit/direct.js";
import { SET, STAGED, VIEW, HOME } from "./world.js";

/* ── the poses (bench poses of docs/journal/019-model.md, moved to where the retractor stands in the car) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const inCar = (pose) => moved({ ...P, ...pose }, [0, 0, 0], HOME);
// the crash in profile: the wall on the left, the nose on it, you behind the glass
const CRASH0 = { ...P, ...VIEW.profile };
const CRASH1 = { ...CRASH0, d: 740 };
// the order, from above
const ORDER0 = { ...P, ...VIEW.order };
const ORDER1 = { ...ORDER0, d: 275 };
// the retractor in the pillar's foot, three quarters: generator, turbine, spool and the strap going up (`climax`)
const RET0 = inCar({ tx: 0, ty: 11, tz: 1.5, d: 112, az: -50, el: 10, shift: 160 });
const RET1 = { ...RET0, d: 92 };
// …backed up the pillar, with the strap that runs (the retractor stays big at the foot of the frame)
const PILLAR = { ...P, tx: HOME[0], ty: 52, tz: HOME[2] + 1, d: 170, az: -60, el: 6, shift: 170 };
// you, from ahead of your door: the strap across your chest
// (lower and wider than VIEW.chest: your head stays under the top slot's label, the strap is the subject)
const CHEST0 = { ...P, ...VIEW.chest, d: 240, shift: 0 };
const CHEST1 = { ...CHEST0, d: 222 };
// you in profile, the wheel ahead (az −90 sees the strap on its edge): wide, then closer
const SIDE0 = { ...P, tx: -37, ty: 86, tz: -12, d: 340, az: -100, el: 4, fov: 36, shift: 40 };
const SIDE1 = { ...P, tx: -37, ty: 88, tz: -10, d: 290, az: -110, el: 5, fov: 36, shift: 40 };
// the bar through the spool, the helix on the right of the strap (`chute`)
const BAR0 = inCar({ tx: 0, ty: 7.4, tz: 1.5, d: 54, az: -38, el: 3, shift: 160 });
const BAR1 = { ...BAR0, d: 44 };
// the last centimetres: you in profile, a little wider than the crash into the strap (the bag in the frame)
const EASE0 = { ...P, tx: -37, ty: 88, tz: -14, d: 340, az: -104, el: 5, fov: 36, shift: 40 };
const EASE1 = { ...EASE0, d: 320 };

/* ── the light: what it stands around, and how wide ── */
const [HX, HY, HZ] = HOME;
const L_CAR = { fx: -30, fy: 70, fz: -150, fs: 330 };
const L_ORDER = { fx: -40, fy: 38, fz: 30, fs: 130 };
const L_RET = { fx: HX, fy: HY + 9, fz: HZ, fs: 30 };
const L_PILLAR = { fx: -81, fy: 56, fz: 40, fs: 70 };
const L_YOU = { fx: -40, fy: 92, fz: 2, fs: 150 };

/* ── the state ── */
// the cabin as a cut in this act finds it — without the three numbers that run across the cuts
const RUNNING = ["ms", "crush", "debris"];
const HERE = Object.fromEntries(Object.entries(STAGED).filter(([k]) => !RUNNING.includes(k)));

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    tozero: "tozero", zero: "zero", shock: "shock",
    sensors: "sensors", ordre: "ordre",
    tocharge: "tocharge", part: "zero:part", gas: "gas", spin: "spin", turns: "turns", backward: "backward",
    twenty: "twenty", taut: "taut",
    tobody: "tobody", arrives: "arrives",
    crushes: "crushes", k300: "k300", k400: "k400", onchest: "onchest",
    tobar: "tobar", twists: "twists", payout: "payout", onpurpose: "onpurpose",
    eases: "eases", less: "less",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word: a beat on the clock (#hud-clock) or on the strap (#hud-count). */
  const beat = (sel, at, k = 1.16) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* ───────────── « Zéro. Le choc. » ───────────── */
  // the crash, wide, in profile: the wall a few centimetres away, it touches on « Zéro »; on « choc » the blow lights
  // up where the bumper meets it and the nose starts to fold. You have not moved.
  // (Laid BEFORE the numbers that run across the act: on the same instant, the cut must be drawn first.)
  cut(t.tozero, SET.CABIN, CRASH0, { ...STAGED, gap: 0.1, ms: -6, crush: 0, debris: 0, mood: 1, ...L_CAR });
  shot(t.tozero, span(t.tozero, t.sensors), CRASH1, "sine.out", CRASH0.d);

  /* ══════════ what runs across the cuts ══════════ */
  const contact = t.zero + 0.25; // « Zéro » is being said: the bumper meets the wall
  const tight = t.taut + 0.1; // « tendue »
  // the clock: −06 → 0 as the wall comes, 0 → 20 at an even pace, then it only creeps (≈ 30 on « arrive », ≈ 90 on « moins »)
  st(t.tozero, span(t.tozero, contact), { ms: 0, gap: 0 }, "none");
  st(contact, span(contact, tight), { ms: 20 }, "none");
  st(tight, span(tight, t.toverdict), { ms: 95 }, "none");
  // the nose folds — fast enough on « choc » to be seen, then slowly for the rest of the act
  st(contact, span(contact, t.shock + 0.6), { crush: 0.2 }, "sine.out");
  st(t.shock + 0.6, span(t.shock + 0.6, t.toverdict), { crush: 1 }, "none");
  // the blow's light where the bumper meets the wall, then shards and dust drifting, slowly
  st(t.shock - 0.04, 0.8, { debris: 0.3 }, "power2.out");
  st(t.shock + 0.76, span(t.shock + 0.76, t.toverdict), { debris: 0.7 }, "none");

  /* ───────────── « Les capteurs de l'airbag donnent l'ordre. » ───────────── */
  // from above: on « capteurs » the control unit on the tunnel lights up (veille); on « l'ordre » a head of light runs
  // along its wire, under your seat, to the foot of the pillar
  cut(t.sensors, SET.CABIN, ORDER0, { ...HERE, mood: 1, ...L_ORDER });
  shot(t.sensors, span(t.sensors, t.tocharge), ORDER1, "sine.inOut", ORDER0.d);
  st(t.sensors + 0.12, 0.3, { order: 0.15 }, "sine.out");
  st(t.ordre + 0.1, span(t.ordre + 0.1, t.tocharge - 0.05), { order: 1 }, "sine.inOut");
  chip("chip-ordre", null, 96, 470, t.ordre + 0.05, t.tocharge - 0.14);

  /* ───────────── « La charge part. Le gaz lance la turbine. La bobine tourne à l'envers. » ───────────── */
  // ONE frame, the retractor in its pillar, the car dimmed, the light tight on it; what lights up says which word it is:
  // on « part » the white flash at the nozzle's elbow; on « gaz » the gas, veille, rushes into the case and the blades
  // take it (the covers turn to glass); on « bobine » the spool turns backward and the strap's weave runs DOWN into
  // it — and the frame backs up the pillar with the strap
  cut(t.tocharge, SET.CABIN, RET0, { ...HERE, shell: 0.3, xray: 0.6, order: 1, mood: 1, ...L_RET });
  shot(t.tocharge, span(t.tocharge, t.turns), RET1, "sine.inOut", RET0.d);
  st(t.part - 0.04, 0.3, { fire: 0.2 }, "power1.out");
  st(t.gas, span(t.gas, t.turns), { fire: 0.7 }, "sine.inOut");
  st(t.gas, span(t.gas, t.spin + 0.3), { xray: 1 }, "sine.inOut");
  // (slack stays above 0.5 until « tendue »: the header says « Tendue » on the word, not before)
  st(t.turns + 0.05, span(t.turns + 0.05, t.twenty - 0.05), { slack: 0.55, fire: 1 }, "sine.inOut");
  shot(t.turns + 0.15, span(t.turns + 0.15, t.twenty), PILLAR, "sine.inOut", RET1.d);
  st(t.turns + 0.15, span(t.turns + 0.15, t.twenty), L_PILLAR, "sine.inOut");

  /* ───────────── « Une vingtaine de millièmes de seconde : la sangle est tendue. » ───────────── */
  // you, from ahead of your door: the strap still running across your chest toward the ring (its weave lit veille while
  // it runs) — and on « tendue » it snaps flat on you; the header says T+20 ms, « Tendue », veille. You have not moved.
  // (order 0 from here on: the control unit's lamp and the head of light at the pillar's foot would be two green spots
  // in a shot about you)
  cut(t.twenty, SET.CABIN, CHEST0, { ...HERE, xray: 0, fire: 1, slack: 0.55, mood: 1, ...L_YOU });
  shot(t.twenty, span(t.twenty, t.tobody), CHEST1, "sine.inOut", CHEST0.d);
  st(t.twenty + 0.1, span(t.twenty + 0.1, tight - 0.06), { slack: 0.51 }, "sine.inOut");
  st(tight - 0.05, 0.35, { slack: 0 }, "power2.out");
  beat("#hud-clock", tight + 0.02, 1.2);
  chip("chip-tendue", null, 50, 470, tight + 0.05, t.tobody - 0.14);

  /* ───────────── « Et ton corps… arrive. » / « Il s'écrase dans la sangle. Trois cents kilos. Quatre cents. Sur ta poitrine. » ───────────── */
  // in profile, the wheel ahead. On « arrive » your body comes forward — into a strap that is already there; it sinks
  // into it while the frame closes in. The header jumps with the voice: ≈ 300 kg on « Trois », ≈ 400 on « Quatre »
  // (the strap glows signal where it bears); on « poitrine » you are as far as you go, and the picture holds
  cut(t.tobody, SET.CABIN, SIDE0, { ...HERE, fire: 1, slack: 0, mood: 1, ...L_YOU });
  shot(t.tobody, span(t.tobody, t.onchest + 0.3), SIDE1, "sine.inOut", SIDE0.d);
  st(t.arrives, span(t.arrives, t.crushes), { lunge: 0.3 }, "sine.in");
  st(t.crushes, span(t.crushes, t.k400 + 0.1), { lunge: 0.85 }, "none");
  st(t.k400 + 0.1, span(t.k400 + 0.1, t.onchest + 0.25), { lunge: 1 }, "sine.out");
  now(t.k300 + 0.1, { load: 300 });
  now(t.k400 + 0.1, { load: 400 });
  beat("#hud-count", t.k300 + 0.12);
  beat("#hud-count", t.k400 + 0.12);

  /* ───────────── « Alors la barre se tord. La sangle repart. Exprès. » ───────────── */
  // the retractor again, its covers of glass: the bar inside the spool. On « tord » its grooves turn to a helix (the
  // header stays at ≈ 400 kg and turns veille); on « repart » the spool turns the other way and the weave climbs;
  // on « Exprès » the picture holds
  cut(t.tobar, SET.CABIN, BAR0, { ...HERE, shell: 0.3, xray: 1, order: 1, fire: 1, slack: 0, lunge: 1, load: 400, mood: 1, ...L_RET });
  shot(t.tobar, span(t.tobar, t.eases), BAR1, "sine.inOut", BAR0.d);
  st(t.tobar + 0.3, 0.5, { litBar: 1 }, "sine.out"); // « la barre »: the piece the voice names glows faintly veille
  st(t.twists + 0.05, span(t.twists + 0.05, t.payout), { give: 0.5 }, "sine.inOut");
  st(t.payout + 0.05, span(t.payout + 0.05, t.onpurpose + 0.1), { give: 0.8 }, "sine.inOut");
  chip("chip-barre", null, 96, 470, t.twists + 0.1, t.eases - 0.14);

  /* ───────────── « Et ta poitrine encaisse… moins. » ───────────── */
  // you in profile: the last few centimetres the bar lets out, gently; the pale bag comes up, your head ends in it.
  // On « moins » the force drops back (≈ 300 kg: a figure the voice has said) and the light lets go: mood 0
  cut(t.eases, SET.CABIN, EASE0, { ...HERE, fire: 1, slack: 0, lunge: 1, give: 0.8, load: 400, mood: 1, ...L_YOU });
  shot(t.eases, span(t.eases, t.toverdict), EASE1, "sine.inOut", EASE0.d);
  st(t.eases + 0.05, span(t.eases + 0.05, t.less + 0.3), { give: 1 }, "sine.inOut");
  st(t.eases + 0.1, 0.7, { bags: 1 }, "power2.out");
  now(t.less + 0.1, { load: 300 });
  st(t.less + 0.1, 0.4, { mood: 0 }, "sine.inOut");
  chip("chip-plafond", null, 96, 470, t.eases + 0.25, t.toverdict - 0.14);
}
