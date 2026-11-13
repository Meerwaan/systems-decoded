// 03 · RÉPONSE — from tozero (« Lavage principal ») to toverdict (« …et la croûte lâche »). The climax, on the voice's
// short breaths: the trap, the tablet, the heat — then the water's round, the same water, hundreds of times, until the
// crust lets go. Every instant comes from a word of the script (D.times); nothing is inherited from act 2b: the act
// opens on a cut whose pose and state are complete.
//
// Where the camera stands, and why:
//   · the dispenser in PROFILE from the left (−x, the key light's side), long lens: the trap falls toward the tub and
//     reads as a hinge, not as a dot; the same lens then tilts down WITH the tablet to the tub floor, where it lands by
//     the heater's front run — the heater reddens and the header climbs to 50 in that frame;
//   · the tub in section, three quarters from the left (az ≈ −64: the water's way up and its way down part on screen,
//     at −28 they lay on each other): the pump, the arm, the jets, the dish, the round of the water, all in one picture.
//     From there the camera FOLLOWS THE WATER: up to the crust it hits, down to the filters it falls through, back out
//     to the whole round as it goes again — then turns slowly round it while the counter runs;
//   · the crust from under the dish, close: the camera that was coming at it keeps coming, the crust splits in the
//     frame and its plates fall onto the coarse filter — no cut on the moment the whole film announces.
// The round's heads (`passes`) run slow enough to be followed (≤ 1/7 of their spacing a frame) while the voice tells the
// way; on « La même » they jump to a whole number of spacings per frame: the shutter smears them into one steady,
// brighter line — the round lit through — and the counter runs into the hundreds. No rate between the two (it would
// strobe).
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED } from "./world.js";

/* ── the poses (scene coordinates, plan.js), found with `look` ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: VIEW.crust.dof ?? 8 };
// the dispenser in profile from the left, long lens: the door's inner face edge-on, the trap falls to the left (the tub)
const DISP0 = { ...P, ...CLOSE, tx: 9, ty: 50, tz: 24, d: 105, az: -114, el: 10, fov: 24, shift: 0 };
const DISP1 = { ...DISP0, tx: 10, ty: 54, d: 88, az: -104, el: 8 };
// the tub floor by the door, same lens tilted down: where the tablet lands, the heater's front run, the sump behind
const FLOOR0 = { ...P, ...CLOSE, tx: 8, ty: 19, tz: 18, d: 100, az: -92, el: 24, fov: 24, shift: 40 };
const FLOOR1 = { ...FLOOR0, d: 90, az: -88 };
// the tablet, close, as it slides out over the open trap (cut) — then the floor where it lands (cut): a 40-unit fall
// in 0.7 s cannot be followed by a turning camera without tearing the frame (retouche du 13/11)
const TAB0 = { ...P, tx: 10.5, ty: 51, tz: 22.5, d: 50, az: -104, el: 4, fov: 24, shift: 0 }; // room below to fall in
const TAB1 = { ...TAB0, ty: 48.5, d: 48 };
const LAND0 = { ...P, tx: 10, ty: 16.5, tz: 21, d: 40, az: -92, el: 30, fov: 24, shift: 40 };
// the tub in section from below and the left: the water's round unfolds as ONE loop on screen — up the jet to the
// crust (the dish at the top of the frame, never in front), down onto the filters, into the sump, the pump, the tube.
// From above (el > 0) the tube crosses the water's way down and the line tangles. The whole round stays in this
// frame: a slow push, then a slow turn toward the crust (retouche du 13/11: HIT / FILT dropped)
const SECT0 = { ...P, tx: 4, ty: 20, tz: 4, d: 142, az: -56, el: -18, fov: 30, shift: 40 };
const SECT1 = { ...SECT0, d: 130, az: -52 };
const ROUND1 = { ...SECT0, d: 130, az: -46, el: -15 };
// under the dish, close: the crust lets go in the frame
const CRACK0 = { ...P, ...CLOSE, tx: -1, ty: 23, tz: 4, d: 98, az: -34, el: -8, fov: 30, shift: 40 };
const CRACK1 = { ...CRACK0, d: 92, az: -31 };

/* ── the light: what it stands around ── */
const L_DISP = { fx: 8, fy: 50, fz: 24, fs: 40 };
const L_FLOOR = { fx: 6, fy: 18, fz: 18, fs: 36 };
const L_SECT = { fx: 2, fy: 22, fz: 4, fs: 60 };
const L_TAB = { fx: 10, fy: 49, fz: 22, fs: 30 };
const L_LAND = { fx: 10, fy: 16.5, fz: 21, fs: 26 };
const L_SUMP = { fx: 3, fy: 11, fz: 8, fs: 40 };
const L_DISH = { fx: STAGED.fx, fy: STAGED.fy, fz: STAGED.fz, fs: STAGED.fs };

/** A length of time between two instants, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, shot, cut, jolt, punch, chip } = D;
  const t = D.times({
    tozero: "tozero", lavage: "zero:Lavage", trappe: "zero:trappe", ouvre: "zero:s'ouvre", pastille: "zero:pastille-0.12",
    et: "zero:et", grimpe: "zero:grimpe", degres: "zero:degrés",
    reponse: "reponse", pompe: "reponse:pompe", bras: "reponse:bras", crache: "reponse:crache",
    frappe: "reponse:L'eau", croute: "reponse:croûte", retombe: "reponse:retombe", filtres: "reponse:filtres", repart: "reponse:repart",
    meme: "reponse:même", centaines: "reponse:centaines", fois: "reponse:fois", lache: "reponse:lâche",
    trigger: "trigger", toverdict: "toverdict",
  });
  const tosect = t.reponse - 0.12; // the cut to the section, a few frames before « La pompe »
  const end = t.toverdict;
  setAct(tl, 3, t.tozero);

  /** The header answers: a beat on the clock (#hud-clock) or on the water's temperature (#hud-count). */
  const beat = (sel, at, k = 1.16) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* ── « Lavage principal. » — the dispenser, shut, in profile; the programme's clock jumps ── */
  cut(t.tozero, SET.SCENE, DISP0, {
    ...STAGED, ...L_DISP, night: 1, eco: 1, mood: 1, gel: 0, door: 0, crust: 1, crack: 0, ghosts: 0,
    you: 0, tap: 0, drain: 0, rinse: 0, litres: 0, hand: 0,
    turn: 60, jets: 0.4, thrust: 0, inlet: 0, water: 0.6, pump: 1, passes: 0, loop: 0, heat: 0, trap: 0, tab: 0,
    litValve: 0, litSump: 0, litPump: 0, litArm: 0, litTrap: 0, solo: 0, sinner: 0, sHeat: 1,
    cycle: 34, temp: 22,
  });
  beat("#hud-clock", t.tozero + 0.06);
  chip("chip-lavage", null, 96, 470, t.lavage, t.trappe - 0.06);
  shot(t.tozero, span(t.tozero, t.ouvre), DISP1, "sine.inOut", DISP0.d);

  /* ── « Sa trappe s'ouvre. » — it lights as it is named, then falls open toward the tub ── */
  st(t.trappe - 0.06, 0.25, { litTrap: 1 }, "sine.out");
  st(t.ouvre - 0.06, 0.15, { trap: 1, tab: 0.3 }, "power3.out");
  punch(t.ouvre, 0.06);
  const cutTab = t.pastille - 0.06; // a few frames before « pastille »
  shot(t.ouvre, span(t.ouvre, cutTab), { ...DISP1, d: 84 }, "sine.inOut");
  st(t.pastille, 0.5, { litTrap: 0 }, "sine.inOut");

  /* ── « La pastille tombe, » — CUT close on the tablet sliding out, on its halo; CUT on the floor where it lands ── */
  const lands = t.pastille + 0.85;
  const cutLand = t.pastille + 0.5; // it has fallen ≈ 10 units across the first frame; it lands in the second at +0.85
  st(t.pastille, 0.85, { tab: 0.55 }, "none");
  cut(cutTab, SET.SCENE, TAB0, { ...L_TAB });
  shot(cutTab, span(cutTab, cutLand), TAB1, "power1.in");
  cut(cutLand, SET.SCENE, LAND0, { ...L_LAND, jets: 0, shell: 0, dish: 0 }); // the lens rises through the tub: no jet, no steam, no glass, no dish rim across it (qa 52,33 / 52,53)
  st(lands, 0.8, L_FLOOR, "sine.inOut");

  /* ── « et l'eau grimpe vers cinquante degrés. » — the tablet melts, the heater reddens, the header climbs to 50 ── */
  // the tablet stays whole on the floor in this shot: its melting cloud hazes the whole lens (qa 52,53); the cut to the section finds it melted (tab 1)
  st(t.et, 1.3, { heat: 1 }, "sine.inOut");
  st(t.grimpe, span(t.grimpe, t.degres + 0.08), { temp: 50 }, "sine.out");
  beat("#hud-count", t.degres + 0.1, 1.12);
  // no rise through the tub (the lens crossed hazy glass, qa 52,53): a CUT just before « vers » to the floor seen from above
  const cutFloor = lands + 0.9;
  cut(cutFloor, SET.SCENE, FLOOR0, { ...L_FLOOR, jets: 0, shell: 0, dish: 0 });
  shot(cutFloor, span(cutFloor, tosect), FLOOR1, "sine.out");

  /* ── « La pompe aspire. » — CUT: the tub in section; the round of the water appears, its heads leave the sump ── */
  cut(tosect, SET.SCENE, SECT0, { ...L_SECT, trap: 1, tab: 1, heat: 1, temp: 50, jets: 0.4, shell: 1, dish: 1 });
  st(tosect + 0.06, 0.4, { loop: 1 }, "sine.out");
  st(t.pompe - 0.06, 0.25, { litPump: 1 }, "sine.out");
  st(t.bras - 0.3, 0.5, { litPump: 0 }, "sine.inOut");
  shot(tosect, span(tosect, t.meme - 0.1), SECT1, "sine.inOut"); // the whole way of the water in one slow push
  // the heads at a pace an eye can follow: 0.74 pass/s (a head moves 1/8 of the spacing between heads a frame)
  const fast = t.meme - 0.06; // « La même »: the round lit through
  const slowRate = 0.74;
  st(t.pompe, span(t.pompe, fast), { passes: slowRate * span(t.pompe, fast) }, "none");

  /* ── « Le bras crache. » — the jets at full strength, the arm runs faster ── */
  st(t.bras - 0.06, 0.25, { litArm: 1 }, "sine.out");
  st(t.crache - 0.1, 0.25, { jets: 1 }, "power2.out");
  punch(t.crache, 0.06);
  st(t.frappe - 0.2, 0.5, { litArm: 0 }, "sine.inOut");
  // turn: 0.9 turn/s from the cut, then it picks up to 1.3 turn/s over 0.8 s on « crache », and holds it to the end
  const spin0 = t.crache - 0.1;
  const turnA = 60 + 0.9 * span(t.tozero, cutLand);
  st(t.tozero, span(t.tozero, cutLand), { turn: turnA }, "none");
  // the arm rests while its jets are off (landing shot, lens in the tub): no blurred arm sweeping it (qa 52,33)
  const turn1 = turnA + 0.9 * span(tosect, spin0);
  st(tosect, span(tosect, spin0), { turn: turn1 }, "none");
  const turn2 = turn1 + 0.88; // over 0.8 s, from 0.9 to 1.3 turn/s (0.72 u + 0.16 u²)
  st(spin0, 0.8, { turn: turn2 }, (u) => (0.72 * u + 0.16 * u * u) / 0.88);
  st(spin0 + 0.8, span(spin0 + 0.8, end), { turn: turn2 + 1.3 * span(spin0 + 0.8, end) }, "none");

  /* ── « L'eau frappe la croûte, » — the light goes up the jets to the crust they hit (same frame) ── */
  st(t.frappe - 0.1, span(t.frappe - 0.1, t.retombe - 0.05), L_DISH, "sine.inOut");

  /* ── « retombe, traverse les filtres… et repart. » — the light comes down with the water to the filters ── */
  st(t.retombe - 0.05, span(t.retombe - 0.05, t.repart - 0.2), L_SUMP, "sine.inOut");
  st(t.filtres - 0.06, 0.25, { litSump: 1 }, "sine.out");
  st(t.repart - 0.2, 0.8, L_SECT, "sine.inOut");
  st(t.meme - 0.1, 0.6, { litSump: 0 }, "sine.inOut");

  /* ── « La même, pendant tout le lavage. » « Des centaines de fois. » — the round lit through, the counter runs ── */
  // whole spacings of heads per frame (30 fps, 5 heads): 60 pass/s = 2 a frame, then 120 = 4 — the shutter smears them
  // into one steady line, no strobing; the counter reaches the hundreds on « centaines »
  const p1 = slowRate * span(t.pompe, fast);
  const mid = t.centaines - 0.2;
  const p2 = p1 + 60 * span(fast, mid);
  st(fast, span(fast, mid), { passes: p2 }, "none");
  st(mid, span(mid, end), { passes: p2 + 120 * span(mid, end) }, "none");
  chip("chip-passes", null, 96, 470, t.meme, t.fois + 0.26);
  // the programme's clock: it crept since the cut; now the wash runs on, to ≈ 1 h 20
  st(t.lavage, span(t.lavage, fast), { cycle: 37 }, "none");
  st(fast, span(fast, t.fois + 0.26), { cycle: 78 }, "sine.inOut");
  st(t.fois + 0.26, span(t.fois + 0.26, end), { cycle: 80 }, "sine.out");
  shot(t.meme - 0.1, span(t.meme - 0.1, t.fois + 0.2), ROUND1, "sine.inOut");
  punch(t.centaines, 0.06);

  /* ── « Et la croûte lâche. » — no cut: the camera comes at the dish and keeps coming; the crust splits in the frame ── */
  const come = t.fois + 0.2;
  shot(come, span(come, t.lache + 0.24), CRACK0, "sine.inOut", ROUND1.d);
  st(come, 0.9, L_DISH, "sine.inOut");
  st(come, 0.6, { loop: 0 }, "sine.inOut"); // the round has said its piece: nothing drawn over the crust when it goes
  st(t.trigger, span(t.trigger, end - 0.06), { crack: 1 }, "power1.in");
  punch(t.lache, 0.05, { up: 0.08, hold: 0.16, down: 0.4 });
  jolt(t.lache + 0.12, 0.35, 0.45);
  st(t.lache + 0.1, 0.35, { mood: 0 }, "power2.out");
  shot(t.lache + 0.24, span(t.lache + 0.24, end), CRACK1, "sine.out");
}
