// 03 · RÉPONSE — from « La mousse bouche le trou. » to « La pression tombe. » (tozero → toverdict). The climax.
// In cuts: the voice goes by short breaths here, and every breath has its picture — one subject, read in half a
// second. Each cut is laid a few frames before its sentence, its pose is complete and so is its state
// ({ ...HERE, … }, built on STAGED): nothing is inherited from the act before, nothing from the shot before.
//
// NOTHING BURSTS. No flash, no jolt, no lid that moves more than a hair: the three ways out answer one after the
// other, and the last one — the seal — is the picture of the fall: it leaks. The order is the notices' own:
//   the hole is blocked → the valve goes mute → the pressure climbs → the safety valve opens → (blocked as well)
//   → the seal gives way on the side → the pressure falls.
//
// THE HEADER does not climb: « +350 kg » is the only sourced figure, at cooking pressure. Under it, « Siffle » turns
// to « Muette » on « Plus un bruit » and stays there. The climb is carried by the picture (the lid's glass reddens
// with `seen` × `bar`, a signal light comes over the scene) and by THE GAUGE (#gauge), which holds the top slot from
// « Plus un bruit » to the fall — a word, never a figure. Every picture is framed under it (it ends at y ≈ 650).
//
// Where the camera stands, and why:
//   · the hole, from above through the glass of the lid (from below the foam hides the nozzle);
//   · the working valve from outside, in steel: the weight comes down, the jet dies — and the picture holds;
//   · the lid in profile, at the height of its rim: what is drawn of the pressure reads as a lid that reddens;
//   · the pin in its stop, along the lid's edge: the lid tries a hair, and stops dead;
//   · the safety valve from az −75: from −40 its jet rises in front of the weight;
//   · the window of the lid in profile, close enough for the seal's bulge to be 150 px, then a step round it;
//   · the cooker whole, of glass, when the pressure falls: the picture lets go there, not before (`mood` → 0).
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, HOME, VALVE, SAFETY, PIN, WINDOW, LID, SEAL, polar } from "./world.js";

const [HX, HY, HZ] = HOME;
const [SX, SY, SZ] = SAFETY.at;
const [PX, PY, PZ] = PIN.at;
const [WX, , WZ] = polar(WINDOW.at, LID.r);
const TOP = VALVE.at[1] + VALVE.chimney.h; // the mouth of the chimney

/* ── the poses (found with `look`; what lies between two of them is arithmetic) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the lid from above, of glass: the foam under it, the chimney, the weight — closing on the hole
// (from az −60: from −38 the safety valve stands in front of the chimney)
const PLUG0 = { ...P, tx: HX, ty: HY + 18, tz: HZ, d: 44, az: -60, el: 12, shift: 0 };
const PLUG1 = { ...PLUG0, d: 28 };
// the working valve, in steel: the weight on its chimney (under where the gauge comes)
const MUTE = { ...P, tx: HX, ty: HY + TOP + 0.8, tz: HZ, d: 46, az: -34, el: 8, shift: 110 };
// the lid in profile, at the height of its rim, of glass
const CLIMB0 = { ...P, tx: HX, ty: HY + 15.5, tz: HZ, d: 108, az: -52, el: 2, shift: 60 };
const CLIMB1 = { ...CLIMB0, d: 96 };
// the pin up through the tongue of its stop, the lid's edge under it (from az −28 the lid behind it reddens the frame)
const PINNED = { ...P, tx: HX + PX, ty: HY + PY + 1, tz: HZ + PZ, d: 22, az: -62, el: 10, shift: 60 };
// the safety valve, the mute weight behind it on the left · a step back: its jet · back in on it: it dies
const SAFE0 = { ...P, tx: HX + SX, ty: HY + SY + 1.5, tz: HZ + SZ, d: 38, az: -75, el: 12, shift: 0, side: -100 };
const SAFE1 = { ...SAFE0, ty: HY + SY + 2, d: 56 };
const SAFE2 = { ...SAFE0, d: 42 };
// the window of the lid, in profile: the seal bulges out to the left · a step round it: the slot, the leak going sideways
const SIDE0 = { ...P, tx: HX + WX, ty: HY + SEAL.y, tz: HZ + WZ, d: 28, az: -22, el: 5, shift: 50, side: -60 };
const SIDE1 = { ...SIDE0, d: 33 };
const SLOT = { ...P, tx: HX + WX, ty: HY + SEAL.y + 1, tz: HZ + WZ, d: 80, az: -50, el: 22, shift: 20, side: -120 };
// the cooker whole, under the gauge — and a slow step back: the picture lets go
const FALL0 = { ...P, tx: HX, ty: HY + 10.5, tz: HZ, d: 158, az: -40, el: 12, shift: 20 };
const FALL1 = { ...FALL0, d: 172 };

/* ── the state ── */
// tonight, as this act finds it: the cooker on its fire, too full, the foam against the lid. Nobody in the frame:
// every picture is close on the cooker, and from most of these angles your forearm would stand in front of it
const HERE = { ...STAGED, you: 0, foam: 1 };
// the working valve blocked, for good
const MUTED = { clog: 1, whistle: 0 };
// the light: what it stands around, and how wide
const L_LID = { fx: HX, fy: HY + 16.5, fz: HZ, fs: 24 };
const L_VALVE = { fx: HX, fy: HY + TOP, fz: HZ, fs: 13 };
const L_POT = { fx: HX, fy: HY + 11, fz: HZ, fs: 40 };
const L_PIN = { fx: HX + PX, fy: HY + PY + 0.5, fz: HZ + PZ, fs: 12 };
const L_SAFE = { fx: HX + SX, fy: HY + SY + 1, fz: HZ + SZ, fs: 14 };
const L_WIN = { fx: HX + WX, fy: HY + SEAL.y, fz: HZ + WZ, fs: 12 };
const L_SLOT = { fx: HX + WX, fy: HY + SEAL.y, fz: HZ + WZ, fs: 22 };

const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D, world }) {
  const { tl, st, shot, cut, chip } = D;
  const A = world.system.A;
  const t = D.times({
    tozero: "tozero", plugs: "plugs", mute: "mute",
    toclimb: "zero:Dedans-0.12", climbs: "climbs", more: "more",
    tohold: "zero:couvercle-0.3", holds: "holds",
    toreponse: "toreponse", trigger: "trigger", tovent: "reponse:vapeur-0.25", vents: "vents",
    what: "reponse:si-0.25", blocked2: "blocked2",
    tojoint: "tojoint", yields: "yields", side: "side", leaks: "leaks", onpurpose: "onpurpose",
    tofall: "reponse:pression-0.3", falls: "falls",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word: a beat on the push (#hud-clock) or on the valve (#hud-count). */
  const beat = (sel, at, k = 1.16) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* ───────────── the gauge: the pressure under the lid, against cooking pressure — a word, never a figure ───────────── */
  // it comes in on « Plus un bruit », already saying what the silence means (« plus rien ne sort — elle monte »), and
  // leaves once the pressure has fallen. Its fill is `bar` (2 is the end of the track); its word follows the story
  const gaugeIn = t.mute + 0.3;
  const fill = document.getElementById("gauge-fill");
  D.readout("gauge-v", (time) => {
    const bar = Math.max(0, D.W.bar);
    const high = bar > 1.03;
    fill.style.transform = `scaleX(${Math.min(1, bar / 2).toFixed(3)})`;
    fill.style.backgroundColor = high ? SIGNAL : VEILLE;
    if (time >= t.leaks) return "Tombe";
    if (time >= t.vents && time < t.blocked2) return "Baisse";
    return time >= t.mute ? "Monte" : "Réglée";
  });
  tl.set("#gauge-s0", { opacity: 0 }, gaugeIn - 0.05);
  tl.set("#gauge-s1", { opacity: 1 }, gaugeIn - 0.05);
  D.panel("#gauge", gaugeIn, t.toverdict - 0.3);
  tl.to("#gauge-s1", { opacity: 0, duration: 0.12 }, t.trigger + 0.12); // the safety valve is letting it out
  tl.to("#gauge-s1", { opacity: 1, duration: 0.12 }, t.blocked2 + 0.15); // …and no longer
  tl.to("#gauge-s1", { opacity: 0, duration: 0.1 }, t.leaks + 0.04);
  tl.to("#gauge-s2", { opacity: 1, duration: 0.12 }, t.leaks + 0.14);

  /* ══════════ SHE GOES MUTE ══════════ */

  /* ───────────── « La mousse bouche le trou. » ───────────── */
  // from above, through the glass of the lid: the foam is a finger from the nozzle. It reaches it; on « bouche » it
  // goes in — a signal column climbs the chimney's bore, the foam turns signal round its mouth. Outside, the weight
  // dances less and less. (Not to the end: the header keeps « Siffle » until the next sentence says otherwise.)
  const toMute = t.mute - 0.15;
  cut(t.tozero, SET.KITCHEN, PLUG0, { ...HERE, xray: 1, seen: 0.5, foam: 0.85, plume: 0, ...L_VALVE });
  shot(t.tozero, span(t.tozero, toMute), PLUG1, "sine.out", PLUG0.d);
  st(t.tozero, span(t.tozero, t.plugs + 0.2), { foam: 1 }, "sine.inOut");
  st(t.plugs, Math.min(0.55, span(t.plugs, toMute - 0.04)), { clog: 0.85 }, "power2.out");

  /* ───────────── « Plus un bruit. » ───────────── */
  // outside, in steel: the valve from close, its jet already thin. On « Plus » the weight comes down on its hole and
  // the jet dies; the header says « Muette », signal, under « +350 kg ». Nothing moves any more: THE PICTURE HOLDS.
  // The gauge comes in over it — and starts to creep past its mark
  cut(toMute, SET.KITCHEN, MUTE, { ...HERE, clog: 0.85, plume: 0.25, ...L_VALVE });
  st(t.mute, 0.1, { ...MUTED }, "power2.in");
  beat("#hud-count", t.mute + 0.12, 1.2);
  st(t.mute + 0.1, span(t.mute + 0.1, t.toclimb - 0.03), { bar: 1.12 }, "power1.out");

  /* ══════════ THE PRESSURE CLIMBS ══════════ */

  /* ───────────── « Dedans, la pression monte. Encore. » ───────────── */
  // the lid in profile, of glass, at the height of its rim: what is held under it. On « monte » it thickens — the
  // glass of the lid reddens, the strokes that push on it beat harder —, on « Encore », again; a signal light comes
  // over the kitchen. The gauge goes with each word. The header has not moved: no figure is sourced up there
  cut(t.toclimb, SET.KITCHEN, CLIMB0, { ...HERE, ...MUTED, bar: 1.12, xray: 1, seen: 0.45, ...L_LID });
  shot(t.toclimb, span(t.toclimb, t.tohold), CLIMB1, "sine.inOut", CLIMB0.d);
  st(t.climbs, Math.min(0.5, span(t.climbs, t.more - 0.02)), { bar: 1.45, seen: 0.75 }, "power2.out");
  st(t.more, Math.min(0.5, span(t.more, t.tohold - 0.03)), { bar: 1.8, seen: 1 }, "power2.out");
  st(t.climbs, span(t.climbs, t.tohold - 0.03), { gel: 0.15 }, "sine.inOut");

  /* ───────────── « Le couvercle, lui… tient toujours. » ───────────── */
  // the pin, up in the hole of its stop, along the lid's edge. On « tient » the lid tries to turn: a hair, and it
  // stops dead on the pin. Nothing breaks, nothing lifts: THE PICTURE HOLDS
  const HELD = { ...HERE, ...MUTED, bar: 1.8, gel: 0.15 };
  cut(t.tohold, SET.KITCHEN, PINNED, { ...HELD, litPin: 0.6, ...L_PIN });
  st(t.holds, 0.12, { twist: 1 }, "power3.out");

  /* ══════════ THE SECOND WAY OUT ══════════ */

  /* ───────────── « La soupape de sécurité s'ouvre. La vapeur sort. » ───────────── */
  // the safety valve, the mute weight behind it. It glows as the voice names it; on « s'ouvre » it lifts — four
  // frames — and its steam leaves, veille. A step back on « La vapeur sort » to see the jet: the gauge comes down a notch
  cut(t.toreponse, SET.KITCHEN, SAFE0, { ...HELD, plume: 0.22, ...L_SAFE });
  st(t.toreponse + 0.1, span(t.toreponse + 0.1, t.trigger - 0.05), { litSafety: 0.8 }, "sine.inOut");
  st(t.trigger, 0.14, { safety: 1 }, "power2.out");
  chip("chip-secu", A.safety, -560, 120, t.trigger + 0.15, t.blocked2 + 0.1);
  shot(t.tovent, span(t.tovent, t.vents + 0.45), SAFE1, "sine.inOut", SAFE0.d);
  st(t.tovent, span(t.tovent, t.vents + 0.4), { plume: 0.33 }, "sine.out");
  st(t.vents, span(t.vents, t.what - 0.03), { bar: 1.35, gel: 0.08 }, "sine.out");

  /* ───────────── « Et si elle est bouchée, elle aussi ? » ───────────── */
  // back in on the valve, in steel (of glass, the foam under the lid washes the frame pink and its plug does not
  // show): on « bouchée » its jet dies and its glow goes out — it is up, and nothing comes out. The silence is back,
  // the light reddens again, the gauge goes to the end of its track
  shot(t.what, span(t.what, t.blocked2 + 0.4), SAFE2, "sine.inOut", SAFE1.d);
  st(t.blocked2, 0.25, { clog2: 1, litSafety: 0 }, "power2.in");
  st(t.blocked2 + 0.1, span(t.blocked2 + 0.1, t.tojoint - 0.04), { bar: 2, gel: 0.2 }, "sine.out");

  /* ══════════ THE LAST WAY OUT ══════════ */

  /* ───────────── « Le joint cède, sur le côté. Il fuit. » ───────────── */
  // the window of the lid, in profile. On « cède » the seal bulges out through it; the camera gives it room on
  // « côté »; on « fuit » its lip lifts and the steam leaves sideways, veille: the gauge starts down
  const BLOCKED = { ...HERE, ...MUTED, clog2: 1, safety: 1, gel: 0.2 };
  cut(t.tojoint, SET.KITCHEN, SIDE0, { ...BLOCKED, bar: 2, plume: 0.3, ...L_WIN });
  st(t.tojoint + 0.15, 0.3, { litSeal: 0.6 }, "sine.out"); // the voice names it: it glows, veille
  st(t.yields, 0.3, { leak: 0.5 }, "power2.out");
  shot(t.side, span(t.side, t.onpurpose), SIDE1, "sine.inOut", SIDE0.d);
  st(t.leaks, 0.3, { leak: 1 }, "power2.out");
  st(t.leaks + 0.1, span(t.leaks + 0.1, t.onpurpose - 0.03), { bar: 1.8 }, "sine.out");

  /* ───────────── « Exprès. » ───────────── */
  // a step round it: the slot cut in the lid — it was made for this —, the seal lit, the steam going away to the side
  cut(t.onpurpose, SET.KITCHEN, SLOT, { ...BLOCKED, leak: 1, bar: 1.8, plume: 0.4, litSeal: 1, ...L_SLOT });
  chip("chip-joint", A.window, -590, 130, t.onpurpose + 0.08, t.tofall - 0.14);
  st(t.onpurpose + 0.05, span(t.onpurpose + 0.05, t.tofall - 0.03), { bar: 1.55 }, "sine.out");

  /* ───────────── « La pression tombe. » ───────────── */
  // the cooker whole, of glass, leaking by its side. On « tombe » what was drawn of the pressure drains away, the
  // header counts down to « 0 kg » and turns veille, the gauge falls under its mark, the pin comes down by itself —
  // and the light turns: this is where the picture lets go. The gauge has left before the fall
  cut(t.tofall, SET.KITCHEN, FALL0, { ...BLOCKED, leak: 1, bar: 1.55, xray: 1, seen: 1, plume: 0.5, ...L_POT });
  shot(t.tofall, span(t.tofall, t.toverdict), FALL1, "sine.out", FALL0.d);
  const falling = Math.min(0.6, span(t.falls + 0.04, t.toverdict - 0.38));
  const zero = t.falls + 0.04 + falling;
  st(t.falls + 0.04, falling, { bar: 0 }, "none");
  st(t.falls + 0.04, falling, { seen: 0.2 }, "sine.inOut");
  st(t.falls + 0.04, Math.min(0.45, falling), { mood: 0, gel: 0 }, "sine.inOut");
  beat("#hud-clock", zero, 1.2);
}
