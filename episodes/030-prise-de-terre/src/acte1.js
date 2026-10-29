// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). One move, two cuts: the consumer unit (« Ton
// différentiel marche »), then inside the machine (« Un fil de phase touche la carcasse »).
//
// THE HOOK. The first frame (POSE0 / FIRST, candidate a′) is taken from the wet floor: the machine in its spin cycle on
// two thirds of the width, its casing live (signal), the laundry turning behind the door, the water trembling, your
// bare legs in the puddle at the right and your hand arriving over the corner of the lid. It is already moving: the
// camera rushes in (a speed ramp) while your hand goes on toward the lid; « tension » hits; on « rien n'a sauté » the
// camera rises and turns left, low along the floor, to the cord and its pale green-and-yellow going to the wall.
// THE PROMISE. A cut (the cord going up to the wall → the unit's box): the differential, close, alive on « marche »;
// then the camera leaves it and comes down along the wall to you, whole, by the machine — and on « toi » the way it
// waits for draws itself, dotted, from your hand to your feet (no head runs: without a body, no current flows). It
// dives along the cord to the socket: an old two-hole socket, the green-and-yellow stopping at the plug. No label (the
// answer is the end's).
// THE SCENE. A cut (the cord entering the machine → the wire climbing inside the casing): the phase wire along the
// left panel; on « touche » its bare end touches the sheet — a light that has a place. On « métal » the camera pulls
// back without losing the fault, and the wave leaves it and wins the whole casing, the lid with it (the door stays ink):
// the header says « 230 VOLTS » with the voice. Down to your feet in the puddle, the live casing mirrored in it; up your
// arm, the hand stops just above the lid; during « Alors… » everything holds while the camera pushes slowly into the
// casing, on the lug under your hand (VIEW.system): act 2 cuts to the bench from there.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, POSE0, VIEW, FAULT, PLACE } from "./world.js";

/* ── the poses ── */
// the hook pushes in: the machine grows, your hand stays in the picture on the right
const PUSH = { ...POSE0, tx: 24, ty: 43, tz: 46, d: 222, az: -33, shift: 20 }; // (shift down: the lid and your hand stay under the header)
// « rien n'a sauté »: up a little and to the left, low along the floor — the cord and its green-and-yellow to the wall
const RISE = { ...POSE0, tx: -26, ty: 36, tz: 24, d: 268, az: -30, el: 9, shift: 70, side: 0 };
// the unit, close (VIEW.tableau), and where the camera has drifted to when it leaves it
const TAB = { ...VIEW.tableau, tx: PLACE.diff[0], ty: PLACE.diff[1] - 4, tz: PLACE.diff[2], d: 100, shift: 40 };
const TAB_IN = { d: TAB.d * 0.72, az: TAB.az + 16 }; // (it keeps moving: no still stretch on the unit)
// you whole, barefoot by the machine (VIEW.you)
const YOU_P = { ...VIEW.you, d: 470, shift: -50 }; // (your head under the header)
// the socket, close: two holes, the plug, the green-and-yellow that stops there (VIEW.socket)
const SOCK = VIEW.socket;
// inside the casing, close on the fault — a little wider than VIEW.fault and sharp (its blurred edges made bars: 030-actes-maj)
const FLT = { ...VIEW.fault, d: 110, dof: 0 };
// the machine whole (VIEW.machine): where the pull-back from the fault lands
const MACH = VIEW.machine;
// your feet in the puddle (VIEW.feet), your arm going to the lid (VIEW.reach), the lug under your hand (VIEW.system)
const FEET = VIEW.feet;
const REACH = VIEW.reach;
const SYS = VIEW.system;

/* ── the light: what it stands around, and how wide (docs/030-actes.md, « Ce que tout acte respecte ») ── */
const L = {
  machine: { fx: 0, fy: 46, fz: 32, fs: 130 },
  cord: { fx: -40, fy: 24, fz: 20, fs: 140 },
  tableau: { fx: PLACE.diff[0], fy: PLACE.diff[1], fz: PLACE.diff[2], fs: 50 },
  you: { fx: 40, fy: 88, fz: 48, fs: 250 },
  socket: { fx: -64, fy: 32, fz: 3, fs: 25 },
  fault: { fx: FAULT[0], fy: FAULT[1], fz: FAULT[2], fs: 40 },
  feet: { fx: 64, fy: 12, fz: 54, fs: 90 },
  reach: { fx: 30, fy: 98, fz: 44, fs: 90 },
  lug: { fx: PLACE.cosse[0], fy: PLACE.cosse[1], fz: PLACE.cosse[2], fs: 45 },
};

export default function acte1({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    choc: "choc", rien: "rien", saute: "saute", topromesse: "topromesse", marche: "marche", attend: "attend",
    partoi: "partoi", souvent: "souvent", prises: "prises", prisesEnd: "promesse$",
    toscene: "toscene", touche: "touche", metal: "metal", volts: "volts", pieds: "pieds", mouille: "mouille",
    main: "main", capot: "capot", sceneEnd: "scene$", alors: "alors", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ═════════════ THE HOOK — « Ta machine à laver est sous tension. Et rien n'a sauté. » ═════════════ */
  // the camera rushes in from the first frame (three times its mean speed) and thickens into the hook; your hand goes
  // on toward the lid (it is fastest at the start too): something is under way on frame 1
  shot(0, t.rien, PUSH, glide(3.4, 0.3));
  st(0, t.choc + 0.4, { reach: 0.6 }, "power2.out");
  punch(t.choc, 0.06);
  // « rien n'a sauté »: up and to the left, the cord low along the floor
  shot(t.rien, t.topromesse - t.rien, RISE, "sine.inOut");
  st(t.rien, t.topromesse - t.rien, L.cord, "sine.inOut");

  /* ═════════════ THE PROMISE ═════════════ */
  /* ── « Ton différentiel marche. » — a cut: the unit, close; on « marche » the differential is alive ── */
  cut(t.topromesse, SET.SCENE, TAB, L.tableau);
  shot(t.topromesse, t.attend - t.topromesse, TAB_IN, "none"); // (steady: a push by ratio would stop at its end)
  st(t.marche, 0.3, { ddr: 0.5 }, "sine.out");

  /* ── « Mais il attend… que le courant passe par toi. » — down the wall to you; the way it waits for ── */
  // (2.5 m of bare wall lie between the unit and you: the move crosses them quickly, then settles on you)
  const onYou = t.attend + 1.15;
  shot(t.attend, onYou - t.attend, YOU_P, "sine.inOut", TAB_IN.d);
  shot(onYou, t.souvent - onYou, { d: YOU_P.d * 0.9, az: YOU_P.az - 4 }, "sine.out");
  st(t.attend, t.souvent - t.attend, L.you, "sine.inOut");
  st(t.attend + 0.6, 0.6, { ddr: 0 }, "sine.inOut"); // (the unit has left the picture)
  chip("chip-diff", null, 96, 470, t.attend, t.partoi - 0.12); // (gone before your head comes under it)
  st(t.partoi, 0.35, { body: 0.25 }, "sine.out"); // dotted, pale: no head runs — nothing flows without a body
  punch(t.partoi, 0.05);

  /* ── « Souvent, ce qui manque se voit sur tes prises. » — along the cord to the socket ── */
  st(t.souvent, 0.4, { body: 0 }, "sine.inOut");
  shot(t.souvent, t.prises - t.souvent, SOCK, "sine.inOut", YOU_P.d);
  st(t.souvent, t.prises - t.souvent, L.socket, "sine.inOut");
  shot(t.prises, t.toscene - t.prises, { d: SOCK.d * 0.84 }, "sine.out");

  /* ═════════════ THE SCENE ═════════════ */
  /* ── « Un fil de phase touche la carcasse : » — a cut: inside the casing, the wire; on « touche » it touches ── */
  // nothing is live yet (the header reads « 0 VOLT »): the casing is ink, the fault apart
  cut(t.toscene, SET.SCENE, FLT, { live: 0, fault: 0, ...L.fault });
  shot(t.toscene, t.metal - t.toscene, { d: FLT.d * 0.72, az: FLT.az + 8 }, "none");
  st(t.touche, 0.25, { fault: 1 }, "power2.out");

  /* ── « tout le métal est à 230 volts. » — the pull-back without losing the fault; the wave wins the casing ── */
  shot(t.metal, t.pieds - t.metal, MACH, "sine.inOut", FLT.d * 0.72);
  st(t.metal, t.pieds - t.metal, L.machine, "sine.inOut");
  st(t.metal, 1.3, { live: 1 }, "sine.inOut"); // the header turns « 230 VOLTS » halfway: on « deux cent trente »
  punch(t.volts, 0.06);

  /* ── « Pieds nus, mouillé, » — down to your feet in the puddle, the live casing mirrored in it ── */
  shot(t.pieds - 0.12, t.main - (t.pieds - 0.12), FEET, "sine.inOut", MACH.d);
  st(t.pieds - 0.12, t.mouille - t.pieds + 0.3, L.feet, "sine.inOut");

  /* ── « ta main se tend vers le capot. » — up your arm; the hand stops just above the lid ── */
  // a cut, then a slow push: the climb from the feet to the hand was the most jerky move of the draft (qa, 16.7 s)
  cut(t.main - 0.1, SET.SCENE, { ...REACH, d: REACH.d * 1.14 });
  shot(t.main - 0.1, t.sceneEnd - (t.main - 0.1), REACH, "sine.inOut", REACH.d * 1.14);
  st(t.main - 0.1, t.capot - t.main + 0.1, L.reach, "sine.inOut");
  st(t.main, t.capot + 0.2 - t.main, { reach: 1 }, "sine.inOut");

  /* ── « Alors… » — everything holds; the camera pushes slowly into the casing, on the lug under your hand ── */
  shot(t.sceneEnd, t.tobench - t.sceneEnd, SYS, "sine.inOut", REACH.d);
  st(t.sceneEnd, t.tobench - t.sceneEnd, L.lug, "sine.inOut");
}

