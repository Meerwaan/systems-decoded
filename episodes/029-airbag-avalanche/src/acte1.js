// 01 · MENACE — from the first frame to « Tire. » (0 → tobench). ONE move, two cuts: the vision (« Enseveli ») and
// the way back (« Sur ta bretelle »).
//
// THE HOOK. The first frame (POSE0 / FIRST) is taken from under the snow, on your left: your skis in a diagonal seen
// from below, the step of the crack in a signal diagonal under them, the powder already flying. It moves by itself
// from frame 1: the crack runs out across the slope, and on « casse » the slab breaks into blocks under you. « La
// pente part avec toi » : the slab slides, the camera comes up out of the snow on your left — the crown left behind,
// uphill. « Ce qui peut te sauver ? » : it comes to your chest, the handle lit on your strap; « Un ballon » : the
// outline of the full balloon round your head (the promise, not the real one: it dissolves on « Sauf »); « ta main…
// ne tire pas » : your left hand comes up near the handle, and falls back.
// THE SCENE. « La neige t'emporte » : the camera dives low and downhill of you, still on your left; you are knocked
// down into the flow, it rolls you (one turn), it swallows you (the surface closes over you). A cut — the vision, the
// same mass seen from the side through the snow, set: you curled up under it, and the header's clock running toward
// ten minutes. A cut — back in the flow, near the surface, the camera dives to your strap; on « poignée » it lights,
// your hand goes to it, and on « Tire. » it closes on it — it does not pull (that is act 3): the time stops, and the
// picture settles on VIEW.strap at HANDOFF. Act 2 cuts to the bench from there.
//
// The story's clock (`sec`) is the film's time, but in the vision (it runs to T+10:00 and comes back on the cut).
// `travel` never runs backwards: held through the vision, it reaches HANDOFF's 9 m as the time stops.
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW, HANDOFF, STAGED, SET } from "./world.js";

/* ── the poses (world frame: az 0 downhill of you, +90 your LEFT — the handle's side —, el < 0 looks up) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0, dof: 0 };
// « La pente part avec toi » : up out of the snow on your left, low: you on the sliding slab, the crown behind, uphill (screen right)
const SLIDE = { ...P, tx: 0, ty: 85, tz: -20, d: 560, az: 84, el: -6, fov: 42, shift: 90 };
// « Ce qui peut te sauver ? » : your chest from your left-front, the handle on the strap
const CHEST = { ...P, tx: 6, ty: 112, tz: 10, d: 400, az: 58, el: 4, fov: 34, shift: 130 };
// « Un ballon, sorti de ton dos… » : back far enough for the whole outline round your head
const PROMISE = { ...P, tx: 0, ty: 125, tz: 0, d: 680, az: 52, el: 6, fov: 36, shift: 110 };
// « Sauf si ta main… » : your left hand near the handle, the strap and the pack (never the hand alone)
const HAND = { ...P, tx: 8, ty: 100, tz: 12, d: 420, az: 48, el: 8, fov: 30, shift: -30 };
// « La neige t'emporte… » : low and downhill of you, on your left: the flow coming at the lens, you lying in it
const RIDE = { ...P, tx: 0, ty: 16, tz: 12, d: 430, az: 38, el: -6, fov: 44, shift: 110 };
// the vision: the section, the flow set, you under it (pente.js journal) — and a little further back as it holds
const BURIED = { ...VIEW.buried, drift: 0 };
// back in the flow: over your left shoulder, wide, before the dive to the strap (its aim is VIEW.strap's: filled at build)
const BACK = (strap) => ({ ...P, tx: strap.tx, ty: strap.ty, tz: strap.tz, d: 340, az: 46, el: 22, fov: 34, shift: -30 });

// the light: what it stands around, and how wide
const L = (x, y, z, s) => ({ fx: x, fy: y, fz: z, fs: s });

export default function acte1({ D, co }) {
  const { tl, st, now, shot, cut, chip, punch } = D;
  const t = D.times({
    choc: "choc", glisse: "glisse", toi0: "toi0", accEnd: "accroche$",
    sauver: "sauver", ballon: "ballon0", sorti: "sorti", sauf: "sauf", main: "main0", tirepas: "tirepas", promEnd: "promesse$",
    emporte: "emporte", roule: "roule", avale: "avale",
    toburied: "toburied", enseveli: "enseveli", dizaine: "dizaine", minutesEnd: "scene:minutes$",
    toback: "toback", poignee: "poignee", tire: "tire", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });
  const strap = VIEW.strap; // aimed at the handle posed on HANDOFF (buildWorld fills it before the acts are staged)

  /* ═════════════ THE HOOK ═════════════ */
  /* ───────────── « Sous tes skis, la neige casse. » ───────────── */
  // the crack runs out across the slope from frame 0, straight; the powder flies harder and harder. The camera only
  // breathes in (the subject moves by itself — and pushing toward your head would put it in the header)
  st(0, t.choc + 0.3, { crack: 1 }, "none");
  st(0, t.choc, { rush: 0.85 }, "none"); // (qa, 22/10: in sine.in the first half-second hardly moved — 1.0)
  shot(0, t.glisse, { d: POSE0.d * 0.93, az: POSE0.az - 4 }, "sine.inOut");
  // « casse » : the slab breaks into blocks under you, the step drops behind your heels
  st(t.choc, 0.3, { slab: 1 }, "power2.out");
  punch(t.choc, 0.06);

  /* ───────────── « La pente part avec toi. » ───────────── */
  // the slab goes: it starts slow and gathers speed; the camera comes up out of the snow on your left, by ratio
  st(0, t.glisse, { travel: 0.5 }, "none"); // the slab creeps from frame 0 (qa, 22/10: the first half-second hardly moved)
  st(t.glisse, t.emporte - t.glisse, { travel: 3.0 }, "none");
  st(t.glisse, t.toi0 + 0.3 - t.glisse, { rush: 0.8 }, "sine.inOut");
  shot(t.glisse, t.sauver - t.glisse, SLIDE, "sine.inOut", POSE0.d * 0.93);
  st(t.glisse, t.sauver - t.glisse, L(0, 85, -20, 600), "sine.inOut");

  /* ───────────── « Ce qui peut te sauver ? » ───────────── */
  // to your chest: the handle lights on the strap (the system already there)
  shot(t.sauver, t.ballon - 0.05 - t.sauver, CHEST, "sine.inOut", SLIDE.d);
  st(t.sauver, t.ballon - t.sauver, { ...L(8, 110, 14, 150), litHandle: 0.8 }, "sine.inOut");

  /* ───────────── « Un ballon, sorti de ton dos en quelques secondes. » ───────────── */
  // « ballon » : the outline of the full balloon round your head — the promise; the camera steps back to hold it whole
  st(t.ballon, 0.5, { promise: 1 }, "power2.out");
  punch(t.ballon, 0.05);
  shot(t.ballon, t.sauf - 0.1 - t.ballon, PROMISE, "sine.inOut", CHEST.d);
  st(t.ballon, t.sorti - t.ballon, L(0, 140, 0, 320), "sine.inOut");

  /* ───────────── « Sauf si ta main… ne tire pas. » ───────────── */
  // « Sauf » : the promise dissolves; the camera comes to your hand — it rises toward the handle on « main »… and
  // falls back on « ne tire pas »
  st(t.sauf, 0.4, { promise: 0, litHandle: 0.35 }, "sine.inOut");
  shot(t.sauf - 0.1, t.tirepas - (t.sauf - 0.1), HAND, "sine.inOut", PROMISE.d);
  st(t.sauf, t.main - t.sauf, L(8, 108, 14, 140), "sine.inOut");
  st(t.main, 0.45, { reach: 0.55 }, "sine.out");
  st(t.tirepas - 0.05, 0.5, { reach: 0 }, "power2.in");
  punch(t.tirepas, 0.05);

  /* ═════════════ THE SCENE ═════════════ */
  /* ───────────── « La neige t'emporte. » ───────────── */
  // the door: the snow knocks you down into the flow, everything goes faster; the camera dives low, downhill of you
  const down = t.emporte - 0.05;
  st(t.promEnd, down - 0.1 - t.promEnd, { rush: 0.85 }, "sine.in"); // (it ends where the next one on `rush` starts)
  st(down, 0.6, { fall: 1 }, "power2.in");
  st(down - 0.1, 0.9, { flow: 0.75, rush: 0.95 }, "sine.inOut");
  st(t.emporte, t.toburied - t.emporte, { travel: 6.4 }, "none");
  shot(t.promEnd, t.roule - t.promEnd, RIDE, "sine.inOut", HAND.d);
  st(t.promEnd, t.roule - t.promEnd, L(0, 16, 12, 420), "sine.inOut");

  /* ───────────── « Elle te roule, elle t'avale. » ───────────── */
  // one turn, head over heels — the camera does not turn with you; « t'avale » : the surface closes over you
  st(t.roule, 1.0, { roll: 1 }, "sine.inOut");
  st(t.avale, t.toburied - 0.04 - t.avale, { bury: 0.7, flow: 0.85 }, "power2.in");
  punch(t.avale, 0.05, { hold: 0.12, down: 0.4 }); // (it has let go before the cut)
  shot(t.roule, t.toburied - t.roule, { d: RIDE.d * 0.94 }, "sine.inOut");

  /* ───────────── the vision: « Enseveli, tu as une dizaine de minutes. » ───────────── */
  // a cut — the same mass, from the side through the snow, set: you curled up under it. The clock runs toward ten
  // minutes; the camera steps back, slowly
  const held = { crack: 1, slab: 1, travel: 6.4, sort: 0, roll: 1 };
  cut(t.toburied, SET.SLOPE, BURIED, { ...STAGED, ...held, flow: 1, rush: 0, bury: 1, fall: 1, reach: 0, ...L(BURIED.tx, BURIED.ty, BURIED.tz, 600) });
  shot(t.toburied, t.toback - 0.02 - t.toburied, { d: BURIED.d * 1.12 }, "sine.out", BURIED.d);
  chip("chip-enseveli", null, 96, 470, t.enseveli, t.toback - 0.15);

  /* ───────────── the clock (`sec`) ───────────── */
  st(0, t.toburied, { sec: t.toburied }, "none"); // real time
  st(t.dizaine, t.minutesEnd - t.dizaine, { sec: 600 }, "power2.in"); // « une dizaine de minutes » (an order of magnitude)
  now(t.toback, { sec: t.toback }); // back to the moment, the vision taken back
  st(t.toback, HANDOFF.sec - t.toback, { sec: HANDOFF.sec }, "none");

  /* ───────────── « Sur ta bretelle, une poignée. » ───────────── */
  // a cut — back in the flow, near the surface, over your left shoulder; the camera dives to your strap (by ratio)
  const back = BACK(strap);
  cut(t.toback, SET.SLOPE, back, {
    ...STAGED, ...held, flow: 0.9, rush: 0.75, bury: 0.3, fall: 0.55, reach: 0, litHandle: 0.35,
    ...L(strap.tx, strap.ty, strap.tz, 160),
  });
  st(t.toback, t.tire - t.toback, { travel: HANDOFF.travel - 0.22 }, "none");
  shot(t.toback, t.tobench - 0.03 - t.toback, strap, "sine.inOut", back.d);
  st(t.toback, t.poignee - t.toback, L(strap.tx, strap.ty, strap.tz, 70), "sine.inOut");
  // « poignée » : it lights — a light that has a place; your hand goes to it
  st(t.poignee - 0.05, 0.35, { litHandle: 1 }, "power2.out");
  st(t.poignee, t.tire - t.poignee, { reach: 1 }, "sine.inOut");

  /* ───────────── « Tire. » ───────────── */
  // the hand closes on it — it does not pull. The time stops: the snow freezes, the picture settles on the strap
  punch(t.tire, 0.05);
  st(t.tire, 0.35, { travel: HANDOFF.travel }, "power2.out");
  st(t.tire, 0.4, { rush: HANDOFF.rush, flow: HANDOFF.flow }, "power2.out");
  // (everything else is HANDOFF already: crack 1, slab 1, sort 0, fall 0.55, roll 1, bury 0.3, reach 1, pull 0)
}
