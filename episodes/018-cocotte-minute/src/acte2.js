// 02 · AUTOPSIE — from « Alors… on l'ouvre. » to the cut of act 3 (tobench → tozero).
//
// Act 1 leaves the cooker alone in what is left of its kitchen (VIEW.system). On « on » the same cooker stands on
// the bench at the same place of the picture (benchCut): cold, empty, « 0 kg · Au repos » — it is only ever opened
// without pressure. Nothing moves until the word: on « l'ouvre » the bayonet turns, then everything lifts off in one
// column, every small part glowing for a moment (the cover is taken there).
// A coaxial object makes a thin column, so each part the voice names has its own gesture on its own word:
//   « Une cuve. »                 it lights up at the foot of the column
//   « Un couvercle, verrouillé. » the column comes back down, the lid still turned free — and on the word it turns
//                                 home: its handle swings over the vessel's, the pin comes under its stop
//   « Un joint. »                 the same frame, closer: the lid turns to glass, the ring squeezed under it lights up
//   « Et dessus… deux soupapes. » the camera rises to the crown of the lid: the two of them in ONE frame, named
//   « La première… un poids, posé sur un trou. »   the weight leaves its chimney (its hole in view), comes back down on it
//   « Trop de pression ? La vapeur le soulève… et sort. »   one notch back, the cooker turns to glass: the steam gathers,
//                                 signal, the header climbs to « +350 kg »; the weight lifts on its word, the jet on « sort »
//   « Ce bruit, c'est la pression qui se règle. »   one slow breath: the weight sits, the pressure climbs back, it lifts
//   « …une tige bloque le couvercle : impossible de l'ouvrir. »   a cut to the pin: it rises by itself into the hole
//                                 of the stop as the pressure comes; the lid is pushed toward « open », twice, and
//                                 stops dead on it (the signal spark on its head)
// The threshold does not stop the film: the camera is already leaving the pin for the valve that whistles; on « tait »
// its jet dies, the header says « Muette », the bench turns signal — and on « regarde » it dives at the hole.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, HOME, VIEW, BENCHED, PIN } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [PX, , PZ] = PIN.at;

/* ── the poses (all on the bench: the cooker's base on the origin) ── */
// the whole column, its top clear of the header, its foot clear of the captions
const COLUMN = { ...VIEW.exploded, d: 205, shift: 150 };
// the cooker from above, three quarters, pushed left: its two handles hold in the frame (the lid's swings home)
const LOCK = { ...P, tx: 1.5, ty: 14.5, tz: 0, d: 140, az: -22, el: 30, shift: 150, side: 150 };
// the same, closer: the rim through the glass lid
const RING = { ...P, tx: -1, ty: 14.5, tz: 2, d: 92, az: -26, el: 28, shift: 150 };
// the crown of the lid: the working valve, and in front of it, lower left, the safety valve
const VALVES = { ...P, tx: -0.6, ty: 18.3, tz: 2.4, d: 50, az: -30, el: 30, shift: 150 };
// the working valve alone, from high enough to look into its chimney; room above it for the weight taken off
const VALVE1 = { ...P, tx: 0, ty: 20.4, tz: 0, d: 46, az: -34, el: 30, shift: 110 };
// one notch back (xray 1): the water, the steam held under the lid, the valve and its jet
const PRESS = { ...P, tx: 0.8, ty: 12.5, tz: 0, d: 116, az: -38, el: 6, shift: 80, side: 40 };
// the pin and its stop, along the lid's edge
const PIN_V = { ...VIEW.pinPart };
// the valve that whistles, seen coming up from the pin · the dive at its hole
const SING = { ...P, tx: 0, ty: 20.6, tz: 0, d: 58, az: -55, el: 8, shift: 150 };
const DIVE = { ...P, tx: 0, ty: 19.3, tz: 0, d: 30, az: -50, el: 10, shift: 150 };

/* ── the light: what it stands around, how wide ── */
const L_WHOLE = { fx: 0, fy: 11, fz: 0, fs: 26 }; // (what act 1 ends on, moved to the bench)
const L_COLUMN = { fx: 0, fy: 19, fz: 0, fs: 30 };
const L_TOP = { fx: 0, fy: 15, fz: 0, fs: 22 };
const L_VALVE = { fx: 0, fy: 19.5, fz: 0, fs: 12 };
const L_PRESS = { fx: 0, fy: 12, fz: 0, fs: 20 };
const L_PIN = { fx: PX, fy: 16.5, fz: PZ, fs: 12 };

export default function acte2({ D, world, co }) {
  const { tl, st, now, shot, cut, chip } = D;
  const A = world.system.A;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", open: "ouvre:l'ouvre",
    p1: "p1", p2: "p2", locked: "locked", p3: "p3", and: "eclate:Et", p4: "p4",
    torepos: "torepos", weight: "weight", seat: "seat", hole: "hole",
    toomuch: "toomuch", asked: "repos:pression$", lifts: "lifts", out: "out", noise: "noise", settles: "settles",
    toverrou: "toverrou", left: "left", pin: "pin", blocks: "blocks", nope: "nope",
    toseuil: "toseuil", quiet: "quiet", watch: "watch", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);
  const pulse = (sel, at, k = 1.14) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.3);
  };

  /* ───────────── « Alors… on » — the same cooker on the bench, at the same place: cold, empty, shut ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: HOME, state: { ...BENCHED, ...L_WHOLE } });

  /* ───────────── « l'ouvre. » — on the word: the bayonet turns, then everything lifts off in one column ───────────── */
  const risen = t.p1 - 0.25;
  const turned = t.open + Math.min(0.3, (risen - t.open) * 0.3);
  st(t.open, turned - t.open, { explode: 0.25 }, "sine.inOut");
  st(turned, risen - turned, { explode: 1 }, "sine.inOut");
  // the camera pulls back with it (by ratio, from the pose the cut gave)
  const back = t.open - 0.1;
  shot(back, t.p1 - 0.1 - back, COLUMN, "sine.inOut", bench.d);
  st(back, t.p1 - 0.1 - back, L_COLUMN, "sine.inOut");
  // …and the small parts, which the column makes tiny, glow as they leave: one look at where each one is
  const glowOn = turned + 0.1;
  const glowOff = Math.max(glowOn + 0.3, t.p1 - 0.3);
  st(glowOn, 0.25, { litSeal: 0.7, litValve: 0.8, litSafety: 0.8, litPin: 1 }, "sine.out");
  st(glowOff, 0.25, { litSeal: 0, litValve: 0, litSafety: 0, litPin: 0 }, "sine.inOut");

  /* ───────────── « Une cuve. » — it lights up at the foot of the column ───────────── */
  st(t.p1, 0.2, { litBody: 0.5 }, "sine.out");

  /* ───────────── « Un couvercle, verrouillé. » — the column comes down, the lid still free; on the word it turns home ───────────── */
  st(t.p2 - 0.05, 0.2, { litBody: 0 }, "sine.inOut");
  st(t.p2, 0.2, { litLid: 0.6 }, "sine.out");
  // (twist 1 holds the lid turned free while `explode` falls: the bayonet is kept for the word)
  const down = t.p2 + 0.15;
  const home = t.locked + 0.08;
  now(down, { twist: 1 });
  st(down, home - down, { explode: 0 }, "sine.inOut");
  st(home + 0.06, 0.3, { twist: 0 }, "power2.inOut");
  shot(t.p2, home - t.p2, LOCK, "sine.inOut", COLUMN.d);
  st(t.p2, home - t.p2, L_TOP, "sine.inOut");

  /* ───────────── « Un joint. » — closer, the lid turns to glass: the ring squeezed between the two lights up ───────────── */
  const ring = t.p3 - 0.05;
  st(ring, 0.25, { litLid: 0 }, "sine.inOut");
  st(ring, 0.3, { xray: 1 }, "sine.inOut");
  st(ring + 0.15, 0.25, { litSeal: 1 }, "sine.out");
  shot(ring, t.and - 0.1 - ring, RING, "sine.inOut", LOCK.d);

  /* ───────────── « Et dessus… deux soupapes. » — steel again; up to the crown of the lid: the two, in one frame ───────────── */
  const up = t.and - 0.05;
  st(up, 0.25, { litSeal: 0 }, "sine.inOut");
  st(up, 0.3, { xray: 0 }, "sine.inOut");
  shot(up, t.p4 - up, VALVES, "sine.inOut", RING.d);
  st(up, t.p4 - up, L_VALVE, "sine.inOut");
  st(t.p4, 0.2, { litValve: 0.7, litSafety: 0.8 }, "sine.out");
  const cWork = co.add({ title: "Fonctionnement", x: 400, y: 520, align: "end", tone: "system", anchor: A.valve });
  const cSafe = co.add({ title: "Sécurité", x: 300, y: 1090, align: "end", tone: "system", anchor: A.safety });
  cWork.show(tl, t.p4 + 0.05);
  cSafe.show(tl, t.p4 + 0.2);
  cWork.hide(tl, t.torepos - 0.12);
  cSafe.hide(tl, t.torepos - 0.12);

  /* ───────────── « La première, c'est elle qui siffle : » — the safety valve goes out; the camera closes on the weight ───────────── */
  st(t.torepos, 0.3, { litSafety: 0, litValve: 0.4 }, "sine.inOut"); // (the chimney stays steel enough for its hole to read dark)
  now(t.torepos, { fill: 0.4, boil: 1, plume: 0.05 }); // (nothing shows yet: the vessel is steel, no jet is drawn)
  shot(t.torepos, t.weight - 0.2 - t.torepos, VALVE1, "sine.inOut", VALVES.d);

  /* ───────────── « un poids, posé sur un trou. » — it leaves its chimney (its hole in view), comes back down on it ───────────── */
  st(t.weight, Math.min(0.35, t.seat - t.weight - 0.05), { off: 0.55 }, "power2.out"); // (0.55: 6 cm would lift it into the header)
  st(t.seat, 0.22, { off: 0 }, "power2.in"); // (it lands where the sound claps)
  chip("chip-poids", null, 96, 470, t.hole, t.toomuch - 0.14);

  /* ───────────── « Trop de pression ? » — one notch back, the cooker turns to glass: the steam gathers, the header climbs ───────────── */
  // (steel until here: up close, the glass lid is a band of glare)
  const notch = t.toomuch - 0.05;
  shot(notch, t.asked + 0.1 - notch, PRESS, "sine.inOut", VALVE1.d);
  st(notch, t.asked + 0.1 - notch, L_PRESS, "sine.inOut");
  st(notch, 0.4, { xray: 1 }, "sine.inOut");
  st(t.toomuch, 0.3, { litValve: 0 }, "sine.inOut");
  st(t.toomuch, t.asked - t.toomuch, { bar: 1, seen: 0.8 }, "sine.inOut");
  pulse("#hud-clock", t.asked - 0.05);
  st(t.asked, t.lifts - t.asked, { bar: 1.15 }, "sine.inOut"); // too much: above cooking pressure, the header stays at « +350 kg »

  /* ───────────── « La vapeur le soulève… et sort. » — the weight lifts on its word, the jet on « sort » ───────────── */
  st(t.lifts, 0.16, { whistle: 1 }, "power2.out");
  pulse("#hud-count", t.lifts + 0.1, 1.16);
  st(t.out, 0.4, { plume: 0.25 }, "sine.out");
  st(t.out, t.noise - t.out, { bar: 0.99, seen: 0.68 }, "sine.inOut"); // what leaves no longer pushes

  /* ───────────── « Ce bruit, c'est la pression qui se règle. » — one slow breath ───────────── */
  // the pressure has dropped: the weight sits back, it climbs again, the weight lifts — never faster than a breath
  const half = (t.settles + 0.25 - t.noise) / 2;
  st(t.noise, half, { whistle: 0.6, bar: 1, seen: 0.8 }, "sine.inOut");
  st(t.noise + half, half, { whistle: 1, bar: 0.99, seen: 0.68 }, "sine.inOut");
  chip("chip-regle", null, 96, 470, t.noise + 0.1, t.toverrou - 0.16);

  /* ───────────── « Et tant qu'il reste de la pression, » — a cut to the pin: it rises by itself into its stop ───────────── */
  cut(t.toverrou, SET.BENCH, PIN_V, { ...BENCHED, fill: 0.4, boil: 1, plume: 0.3, ...L_PIN });
  st(t.left - 0.1, 0.12, { whistle: 1 }, "sine.out"); // (the valve is out of the frame: the header only — never « Muette » here)
  st(t.left, 0.45, { bar: 0.3 }, "sine.inOut"); // the pin's whole travel
  st(t.left + 0.45, 0.45, { bar: 1 }, "sine.inOut");

  /* ───────────── « une tige bloque le couvercle : » — it lights up; the lid is pushed toward « open », and stops on it ───────────── */
  st(t.pin, 0.25, { litPin: 1 }, "sine.out");
  st(t.blocks + 0.1, 0.1, { twist: 1 }, "power3.out");
  st(t.blocks + 0.36, 0.25, { twist: 0 }, "sine.inOut");

  /* ───────────── « impossible de l'ouvrir. » — again, harder, and held ───────────── */
  const let_go = Math.min(t.nope + 0.8, t.toseuil - 0.42);
  st(t.nope + 0.05, 0.1, { twist: 1 }, "power3.out");
  st(let_go, 0.3, { twist: 0 }, "sine.inOut");
  chip("chip-tige", null, 96, 470, t.nope + 0.2, t.toseuil - 0.1);

  /* ───────────── the threshold — « Abonne-toi : le jour où elle se tait… regarde. » ───────────── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: the camera leaves the pin for
  // the valve that whistles; on « tait » the jet dies in two frames, the header says « Muette » under « +350 kg »,
  // the bench turns signal — the promise of the hook, back — and on « regarde » it dives at the hole. Act 3 cuts there.
  followCall(tl, { from: t.toseuil + 0.1, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.32) });
  const rise = t.quiet - 0.15 - t.toseuil;
  shot(t.toseuil, rise, SING, "sine.inOut", PIN_V.d);
  st(t.toseuil, rise, L_VALVE, "sine.inOut");
  st(t.toseuil, 0.4, { litPin: 0 }, "sine.inOut");
  st(t.quiet + 0.08, 0.07, { whistle: 0, mood: 1 }, "none");
  pulse("#hud-count", t.quiet + 0.12, 1.16);
  const dive = t.watch - 0.05;
  shot(dive, t.tozero - 0.04 - dive, DIVE, "sine.inOut", SING.d);
}
