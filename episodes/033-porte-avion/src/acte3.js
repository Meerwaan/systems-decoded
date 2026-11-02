// 03 · RÉPONSE — « Ton voisin force la poignée. » → « La poignée, presque rien. » (tozero → toverdict). In cuts, one
// shot per breath; every cut a few frames before its sentence, its pose complete, its state complete (built on HERE =
// STAGED at cruise): nothing is inherited from act 2.
//
// THE STORY OF THE ACT: first the locks, and the locks only — the air is NOT drawn (`air` 0) while the voice makes its
// hypothesis: the hooks let go, one by one, signal… and the door does not move. Only then the answer comes in: « L'air
// de ta cabine » — the arrows appear and stream to the door (`wall`), slam it on its stops (`trigger`), « environ huit
// tonnes » (the header's « Sur la porte » beats: computed from `alt`, never written). The release falls on « Les butées
// encaissent » (`mood` → 0); the last shot pulls back from the neighbour's one signal arrow (`tug`) to the whole wall.
//
// Where the camera stands, and why:
//   · inside the cabin (az 118–155: from aft, toward door 1L), always low — near the walls and ceiling the stacked
//     glass of L03's cabin veils the picture brown (033-actes-maj);
//   · the handle in three quarters (his hands WITH the handle and the porthole, never a hand alone);
//   · the aft edge (shaft, hooks, stops) — what lets go, then what holds; a stop pair close up for « encaissent »;
//   · « Elle ne bouge pas » is said twice in the film: the second time, the frame of the first (POSE0's low profile)
//     — with the hooks gone signal.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, POSE0, LOOK } from "./world.js";
import { DOOR_AT, DOOR, AIR } from "./plan.js";

const [DX, DY, DZ] = DOOR_AT;
const MIDY = DY + DOOR.open.h / 2;

/* ── the poses (found with `look`; plane frame) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
// his hands on the handle, three quarters from aft: the lever, the porthole, his glass arms — pushing in slowly
const GRIP0 = { ...P, tx: DX + 15, ty: DY + 106, tz: DZ - 48, d: 240, az: 118, el: 6, fov: 32, shift: 60 };
const GRIP1 = { ...GRIP0, d: 215 };
// the aft edge from the cabin: the hook shaft, the middle hook in the middle, the stops along the frame
const EDGE0 = { ...P, tx: DX + 54, ty: MIDY, tz: DZ - 30, d: 200, az: 155, el: 8, fov: 30, shift: 40 };
const EDGE1 = { ...EDGE0, d: 186 };
// …pulled back (by ratio) to the door whole: the three hooks gone signal down its aft edge
const FREE = { ...P, tx: DX + 30, ty: MIDY, tz: DZ - 20, d: 520, az: 150, el: 6, fov: 32, shift: 90 };
// « Elle ne bouge pas » : the first frame of the film again (low profile, the neighbour heaving), a step back
const STILL0 = { ...POSE0, d: 440, dof: 0 };
const STILL1 = { ...STILL0, d: 420 };
// the cabin behind the door: the air of the whole cabin streaming to it — close enough for the door to fill ≈ 40 %
// of the frame (retouche: from d 950 it was 20 % and the arrows read as confetti), the stream entering from the lower
// left and converging on it; the wall's front (WIDE) stays ≈ 1,3 m short of the lens
const CABIN0 = { ...P, tx: DX + 70, ty: DY + 96, tz: DZ - 40, d: 640, az: 135, el: 8, fov: 36, shift: 110 };
const CABIN1 = { ...CABIN0, d: 600 };
const WIDE = 0.72;
// « Il la plaque sur ses butées » : the aft edge again, wider, the wall arriving on it
const SLAM0 = { ...P, tx: DX + 50, ty: MIDY, tz: DZ - 25, d: 260, az: 122, el: 6, fov: 30, shift: 40 };
const SLAM1 = { ...SLAM0, d: 254 };
// the blow on « plaque »: the frame takes the load — a short push in, then it settles (the door itself moves by mm)
const SLAM2 = { ...SLAM0, d: 238 };
const SLAM3 = { ...SLAM0, d: 233 };
// one stop pair, close (the lens): between two hooks, on the aft frame
// (a little from below: the hook above it stays out of the frame, under the chip)
const PAIR0 = { ...P, dof: LOOK.dof, tx: DX + 58, ty: DY + 82, tz: DZ - 18, d: 100, az: 140, el: -8, shift: 60 };
const PAIR1 = { ...PAIR0, d: 94 };
// « La poignée, presque rien » : from the handle and its one signal arrow, back to the whole wall of veille
const TUG0 = { ...P, tx: DX + 11, ty: DY + 110, tz: DZ - 48, d: 240, az: 140, el: 10, fov: 32, shift: 60 };
const TUG1 = { ...TUG0, d: 820 };
// retouche: no more pull-back 240 → 820 in 1,8 s (the most jerky move of the film, motion-blur trails): the handle
// alone, pushing in slowly; then a cut on « presque » to the whole door, settling back to TUG1
const TUGP = { ...TUG0, d: 228 };
const TUGW = { ...TUG1, d: 860 };

/* ── the state ── */
const NEAR = 0.32; // the cabin's wall of arrows, its front ≈ 2 m from the door: for the shots taken closer than that
// the cabin at cruise as this act finds it: the neighbour heaving, the passengers faint, the air NOT drawn yet
const HERE = { ...STAGED, alt: AIR.cruise, ahead: 0.05, pull: 1, pax: 0.4, air: 0, wall: 0, tug: 0, stops: 0.3 };
// the light: what it stands around, and how wide
const L_GRIP = { fx: DX + 11, fy: DY + 110, fz: DZ - 40, fs: 90 };
const L_EDGE = { fx: DX + 50, fy: MIDY, fz: DZ - 20, fs: 120 };
const L_DOOR = { fx: DX, fy: MIDY, fz: DZ, fs: 250 };
const L_CABIN = { fx: DX + 120, fy: MIDY, fz: DZ - 60, fs: 800 };
const L_PAIR = { fx: DX + 58, fy: DY + 82, fz: DZ - 18, fs: 60 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    tozero: "tozero", voisin: "zero:voisin", forcePoignee: "forcePoignee",
    toverrous: "zero:Et-0.12", verrous: "verrous", lachent: "lachent", plus: "zero:Plus", retient: "retient",
    toreponse: "reponse-0.12", bouge: "bouge",
    toair: "reponse:l'air-0.12", airCabine: "airCabine", nuit: "nuit",
    slam: "slam", trigger: "trigger", tonnes: "tonnes",
    toles: "reponse:Les-0.12", encaissent: "encaissent",
    tola: "reponse:poignée-0.24", presque: "presque", rien: "reponse:rien",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word: its figure swells and settles (#hud-clock: the height · #hud-count: the force). */
  const beat = (sel, at, k = 1.14) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* ───────────── « Ton voisin force la poignée. » — his hands on it, the lever jerking with his heaves ───────────── */
  // `mood` 0.5 the time of this shot: at 1 its grade veils the lining brown in the foreground (retouche; `shell` and
  // `cabin` do nothing there); the next cut puts it back at 1
  cut(t.tozero, SET.VOL, GRIP0, { ...HERE, tug: 0.5, handle: 0, mood: 0.5, ...L_GRIP });
  shot(t.tozero, span(t.tozero, t.toverrous), GRIP1, "sine.inOut");
  beat("#hud-clock", t.voisin);
  // his heaves come every 1.15 s (vol.js): the lever gives a few degrees with each, and comes back (never lifted)
  for (const at of [t.tozero + 0.22, t.tozero + 1.37]) {
    st(at, 0.1, { handle: 0.17, tug: 0.75 }, "power2.out");
    st(at + 0.12, 0.55, { handle: 0.03, tug: 0.5 }, "sine.inOut");
  }

  /* ───────────── « Et mettons que tous les verrous lâchent. » — the hypothesis: the hooks go, one by one ───────────── */
  cut(t.toverrous, SET.VOL, EDGE0, { ...HERE, hooks: 0, ...L_EDGE });
  shot(t.toverrous, span(t.toverrous, t.lachent + 0.4), EDGE1, "sine.inOut");
  chip("chip-hypothese", null, 96, 470, t.toverrous + 0.08, t.toreponse - 0.24);
  st(t.lachent + 0.12, 0.32, { hooks: 1 }, "none"); // one hook every ≈ 0.11 s: the three clicks of the sfx (45.34–45.50)
  punch(t.lachent, 0.06);

  /* ───────────── « Plus rien ne retient la porte. » — back (by ratio) to the door whole, its hooks gone ───────────── */
  shot(t.lachent + 0.42, span(t.lachent + 0.42, t.toreponse), FREE, "sine.inOut", EDGE1.d);
  st(t.lachent + 0.42, span(t.lachent + 0.42, t.retient), L_DOOR, "sine.inOut");

  /* ───────────── « Elle ne bouge pas. » — the first frame of the film again: he heaves, it does not move ───────────── */
  cut(t.toreponse, SET.VOL, STILL0, { ...HERE, hooks: 1, ...L_DOOR });
  shot(t.toreponse, span(t.toreponse, t.toair), STILL1, "sine.inOut");

  /* ───────────── « L'air de ta cabine pousse vers la nuit. » — the answer comes in: the whole cabin's air ───────────── */
  // the seats' glass passengers faint (`pax` 0.15) the time of the shot: the stream, not the seats
  cut(t.toair, SET.VOL, CABIN0, { ...HERE, hooks: 1, air: 0, wall: 0, pax: 0.15, ...L_CABIN });
  shot(t.toair, span(t.toair, t.slam), CABIN1, "sine.inOut");
  st(t.airCabine, 0.35, { air: 1 }, "sine.out");
  st(t.airCabine + 0.1, span(t.airCabine + 0.1, t.nuit + 0.2), { wall: WIDE }, "sine.inOut");

  /* ───────────── « Il la plaque sur ses butées : environ huit tonnes. » — the wall arrives, the stops take it ───────────── */
  // the wall stops short of the lens (`wall` NEAR: its front ≈ 2 m from the door): an arrow that brushes the camera
  // blooms into a green blot across the frame
  // the wall arrives on the door just at « plaque » (power2.in), the stops light at once, and the frame takes the blow
  cut(t.slam, SET.VOL, SLAM0, { ...HERE, hooks: 1, air: 1, wall: 0.12, stops: 0.3, ...L_EDGE });
  st(t.slam, span(t.slam, t.trigger), { wall: NEAR }, "power2.in");
  shot(t.slam, span(t.slam, t.trigger), SLAM1, "sine.in");
  shot(t.trigger, 0.2, SLAM2, "power3.out");
  shot(t.trigger + 0.2, span(t.trigger + 0.2, t.toles), SLAM3, "sine.out");
  st(t.trigger, 0.12, { stops: 1 }, "power2.out");
  beat("#hud-count", t.tonnes, 1.18);
  punch(t.tonnes, 0.06, { hold: 0.12, down: 0.3 }); // let go before the cut at « Les »

  /* ───────────── « Les butées encaissent. » — one pair, close: lit, loaded; the release ───────────── */
  cut(t.toles, SET.VOL, PAIR0, { ...HERE, hooks: 1, air: 1, wall: NEAR, stops: 1, ...L_PAIR });
  shot(t.toles, span(t.toles, t.tola), PAIR1, "sine.inOut");
  chip("chip-charge", null, 96, 470, t.toles + 0.08, t.tola - 0.18); // gone before the cut
  st(t.encaissent, 0.3, { mood: 0 }, "sine.inOut");

  /* ───────────── « La poignée, presque rien. » — his one signal arrow, then the wall of veille around it ───────────── */
  // « La poignée » : his arrow ALONE (no air drawn: close to the lining, the door's arrows bloom into blots);
  // « presque rien » : the camera is back far enough, the air comes in all round it — the door's faces, then the wall,
  // whose front follows the camera back and never passes it (the distance goes by ratio: the front lags, power2.in)
  // retouche: « La poignée » the handle alone, pushing in; cut a few frames before « presque » to the whole door in its
  // air (its front at 3,2 m, far short of the lens at 8,6 m), the wall filling in while the camera settles on TUG1
  const topresque = t.presque - 0.12;
  cut(t.tola, SET.VOL, TUG0, { ...HERE, hooks: 1, air: 0, wall: 0, stops: 1, tug: 1, mood: 0, ...L_GRIP });
  shot(t.tola, span(t.tola, topresque), TUGP, "sine.inOut");
  cut(topresque, SET.VOL, TUGW, { ...HERE, hooks: 1, air: 1, wall: 0.5, stops: 1, tug: 1, mood: 0, ...L_CABIN });
  shot(topresque, span(topresque, t.toverdict), TUG1, "sine.inOut");
  st(topresque, span(topresque, t.toverdict), { wall: 1 }, "sine.inOut");
  punch(t.rien, 0.05, { hold: 0.12, down: 0.5 }); // let go before the cut at toverdict
}
