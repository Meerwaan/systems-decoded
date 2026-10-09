// 01 · MENACE — from the first frame to "Alors…" (0 → tosystem). The saucepan boils over, the flame dies, the gas
// keeps coming.
//
// ONE move until the night, each stage landing on its word: the saucepan and its foam ("Ta casserole déborde") →
// down under it, the crown dying port after port ("La flamme s'éteint") → the same frame, where a dull haze now
// leaves the same ports ("Le gaz, lui… sort toujours") → through the glass of the top, to the tap and the small
// magnet unit screwed into it ("il se coupe tout seul") → up the only lead that leaves it, to the tip beside the
// crown ("sans prise ni pile") → the tip glows, then dissolves with its lead ("n'a pas cette pièce") → back out
// from the bare burner to the saucepan ("un grand feu ouvert, sans flamme") → and out to the whole room, filling
// ("toute une nuit, cuisine fermée"). One cut: you at the door, your hand on the switch — a spark, and the picture
// holds on it. Then the film winds back.
//
// The story runs in real time: from `out` on the tip cools (`heat`, `volts` glide down and never come back up).
// The hook's cards lie over y 1186–1542: under the saucepan the foam's puddle stops just above them (BURNER is not
// pushed closer than d 55), and the tip is framed high (shift 255) so that the puddle is a band ABOVE the cards.
import { setAct } from "@kit/overlay.js";
import { SET, SYSTEM } from "./world.js";

/* ── the poses (found with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [HX, HY, HZ] = SYSTEM.home;
// the saucepan from closer: the three runs of foam reach the top
const PUSH = { ...P, tx: HX, ty: 99, tz: HZ + 0.5, d: 80, az: -35, el: 8, fov: 40, shift: 110 };
// under the saucepan, low: the crown between the two runs of foam, the tip in the middle
const BURNER = { ...P, tx: HX, ty: HY + 2.6, tz: HZ + 1, d: 62, az: -34, el: 7, shift: 150 };
// under the top, through its glass: the lead comes down from the left into the magnet unit, the tap and its spindle on the right
const UNDER = { ...P, tx: HX - 3, ty: HY - 3.4, tz: HZ + 14, d: 38, az: -72, el: 6, shift: 150 };
// the tip beside the crown, level with the top: the puddle of foam is a band at its foot, the lead goes down under it
const TIP = { ...P, tx: HX - 2.9, ty: HY + 1.45, tz: HZ + 4.9, d: 26, az: -42, el: 2, shift: 255 };
// the saucepan and the hob: the haze climbs along the pan
const WIDE = { ...P, tx: 170, ty: 99, tz: 32, d: 170, az: -36, el: 12, shift: 120 };
// the whole room: the hob on the left, the door on the right, the layer under the ceiling
const ROOM = { ...P, tx: 215, ty: 125, tz: 127, d: 800, az: -48, el: 6, fov: 44, shift: 120 };
// you in the doorway, your hand on the switch (your head stays under the label of the top slot)
const DOOR = { ...P, tx: 284, ty: 118, tz: 172, d: 330, az: -68, el: 4, fov: 34, shift: -170 };

// the light: what it stands around, and how wide
const L_POT = { fx: 166, fy: 97, fz: 36, fs: 46 };
const L_HEART = { fx: 163, fy: 87, fz: 46, fs: 12 };
const L_TIP = { fx: 163, fy: 93, fz: 39, fs: 12 };
const L_ROOM = { fx: 200, fy: 120, fz: 100, fs: 250 };
const L_DOOR = { fx: 280, fy: 120, fz: 180, fs: 120 };

export default function acte1({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    spill: "spill", dying: "dying", out: "out", gas: "gas", still: "still",
    minute: "minute", minuteW: "promesse:minute", alone: "alone", plug: "plug", pile: "promesse:pile$",
    sauf: "sauf", pas: "promesse:pas", tosans: "tosans", litres: "litres", night: "night", closed: "closed",
    todoor: "scene:fermée$+0.1", sw: "switch", back: "back", tosystem: "tosystem",
  });
  const frame = 1 / D.EP.fps;
  setAct(tl, 1, 0);

  /* ───────────── A · "Ta casserole déborde." ───────────── */
  // the first frame is POSE0 / FIRST. The camera pushes toward the saucepan from frame 1 (a move that is already under
  // way, and still is when the next one takes over) and the foam keeps rising: its runs reach the top as the word is
  // said (0.84, 0.92), then the puddle
  const down = t.spill + 0.22;
  shot(0, down, PUSH, (u) => u * (0.7 + 0.3 * u));
  st(0, t.spill + 0.45, { spill: 1 }, "none");
  // the foam is on the burner: the crown wavers on that side…
  st(t.spill, t.dying - t.spill, { flame: 0.8 }, "sine.inOut");

  /* ───────────── "La flamme s'éteint." ───────────── */
  // …and the camera follows the foam down, under the saucepan: it is there while the crown is still half alive, and
  // watches it die port after port (slowly, then all at once). At `out` exactly: not one flame left — the header's
  // clock starts there
  const atBurner = t.dying + 0.43;
  shot(down, atBurner - down, BURNER, "sine.out");
  st(t.dying, t.out - t.dying, { flame: 0 }, "power1.in");
  // from here on the tip cools, all the way to act 2 — it never warms up again in the kitchen
  st(t.out, t.tosystem - t.out, { heat: 0.8, volts: 0.85 }, "none");

  /* ───────────── "Le gaz, lui… sort toujours." ───────────── */
  // the same ports, the same frame: a dull haze where the flames were. Nothing heats any more
  st(t.gas, t.still + 0.3 - t.gas, { gas: 1 }, "sine.inOut");
  st(t.out, t.still + 0.7 - t.out, { boil: 0.3 }, "sine.out");
  const toUnder = t.minute - 0.2;
  shot(atBurner, toUnder - atBurner, { d: 55 });
  chip("chip-gaz", null, 96, 446, t.gas + 0.15, toUnder - 0.1);

  /* ───────────── B · "Dans une minute environ, il se coupe tout seul :" ───────────── */
  // the camera slides from the burner to what hangs under the top, through its glass: the tap, the magnet unit
  const atUnder = t.alone - 0.1;
  const toTip = t.plug - 0.15;
  shot(toUnder, atUnder - toUnder, UNDER);
  st(toUnder, atUnder - toUnder, L_HEART, "sine.inOut");
  st(t.minute + 0.5, atUnder - t.minute - 0.5, { xray: 0.7 }, "sine.inOut");
  // "une minute": the clock that is counting it answers once
  tl.to("#hud-clock", { scale: 1.16, transformOrigin: "100% 50%", duration: 0.12, ease: "power2.out" }, t.minuteW);
  tl.to("#hud-clock", { scale: 1, duration: 0.32, ease: "power2.inOut" }, t.minuteW + 0.12);
  shot(atUnder, toTip - atUnder, { d: UNDER.d * 0.93 });

  /* ───────────── "sans prise ni pile." ───────────── */
  // up the only lead that leaves the magnet unit, to the tip beside the crown: the current still runs in it
  shot(toTip, t.pile - toTip, TIP);
  st(toTip, t.pile - toTip, L_TIP, "sine.inOut");

  /* ───────────── C · "Sauf si ta gazinière… n'a pas cette pièce." ───────────── */
  // on the tip, from close: it glows — and on "pas" it dissolves, with its lead and the magnet unit under the top
  shot(t.pile, t.tosans - t.pile, { d: TIP.d * 0.9 });
  st(t.sauf + 0.1, 0.6, { litTip: 1 }, "sine.out");
  st(t.pas - 0.05, 0.45, { safety: 0 }, "power2.inOut");
  now(t.pas + 0.45, { litTip: 0 });

  /* ───────────── "Un grand feu ouvert, sans flamme : dans les cinq litres de gaz à la minute." ───────────── */
  // back out from the bare burner, by ratio, to the saucepan and the hob: the haze climbs along the pan
  const atWide = t.litres - 0.2;
  shot(t.tosans, atWide - t.tosans, WIDE, "sine.inOut", TIP.d * 0.9);
  st(t.tosans, atWide - t.tosans, L_POT, "sine.inOut");
  st(t.tosans, 0.6, { xray: 0 }, "sine.inOut");
  const toRoom = t.night - 0.3;
  chip("chip-sans", null, 96, 452, t.litres - 0.1, toRoom - 0.05);
  shot(atWide, toRoom - atWide, { d: WIDE.d * 1.06 });

  /* ───────────── "Laisse-le toute une nuit, cuisine fermée…" ───────────── */
  // the long pull-back to the whole room, while it fills: the column climbs round the hood, the layer spreads under
  // the ceiling — and the camera is back in time to watch it come down (it leans back until the cut)
  const atRoom = Math.min(t.closed + 0.35, t.todoor - 0.3);
  shot(toRoom, atRoom - toRoom, ROOM, "sine.inOut", WIDE.d * 1.06);
  st(toRoom, atRoom - toRoom, L_ROOM, "sine.inOut");
  st(t.night, t.todoor - 0.1 - t.night, { fill: 1 }, "none");
  shot(atRoom, t.todoor - atRoom, { d: ROOM.d * 1.04 });
  chip("chip-nuit", null, 96, 470, t.night + 0.2, t.todoor - 0.15);

  /* ───────────── "et un interrupteur peut suffire." ───────────── */
  // the only cut: you have just come in, your hand on the switch, the layer of gas down to your shoulders
  cut(t.todoor, SET.KITCHEN, DOOR, { you: 2, fill: 1, ...L_DOOR });
  // (the rewind needs its third of a second before act 2 cuts)
  const rew = Math.min(t.back, t.tosystem - 0.37);
  shot(t.todoor, rew - t.todoor, { d: DOOR.d * 0.96, az: DOOR.az + 3 });
  chip("chip-lie", null, 96, 446, t.todoor + 0.2, rew - 0.05);
  // "interrupteur": the spark — a point of light, two frames to come, and the picture HOLDS on it. Nothing blows up
  st(t.sw, 2 * frame, { spark: 1.5 }, "power2.out");
  st(t.sw + 2 * frame, 0.3, { spark: 1.2 }, "sine.out");

  // …and the film winds back: none of this happens (act 2 cuts at tosystem, and takes you out of the doorway)
  st(rew, 0.35, { spark: 0, fill: 0, safety: 1 }, "power2.inOut");
  shot(rew, t.tosystem - 0.02 - rew, { d: DOOR.d, az: DOOR.az }, "power2.inOut");
}
