// 02 · AUTOPSIE — from "Alors…" to the cut of act 3 (tosystem → tozero).
//
// Act 1 leaves the breaker alone in its row (VIEW.system). What is left of the wall goes out on "Alors…", and the
// same object stands on the bench at the same place of the picture (benchCut). On "on" its half-shell steps off; the
// works leave the case and the camera climbs with them to the upper row of the exploded view — ONE frame that glides
// along that row while the voice names three parts: it is what lights up that says which word is being said.
// "Et sur le chemin du courant" : the works go home, the case stays open, and the current's path lights up from one
// terminal to the other. The camera follows it down to the two traps — the blade, then the coil, in one frame.
// Then the blade, in profile and close. The current goes off for a moment: its two metals show, side by side. The
// current comes back on its word, above the rating: the blade glows like the wire of the hook, and bends toward the
// latch — the film shows the gesture before act 3 plays it for good. It does not reach it; it straightens.
// The threshold does not stop the film: the evening's 18 amperes come back in the header, the blade begins to warm
// again, and the camera closes on its tip and the latch it will push. Act 3 cuts from there.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, HOME, RATING } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };

/* ── in the row of the consumer unit: the breaker, alone ── */
const ALONE = VIEW.system; // act 1 ends on it, the cut to the bench leaves from it
// the bench's light, stood round the breaker where it hangs in its row: it is lit alike on both sides of the cut
const LIT = { fx: HOME[0] + BENCHED.fx, fy: HOME[1] + BENCHED.fy, fz: HOME[2] + BENCHED.fz, fs: BENCHED.fs };

/* ── on the bench: the upper row of the exploded view ── */
// The row runs across a camera at az −60 — world = [0.5 s, 10.8, 3.3 + 0.866 s] : the handle stands at s −5.65,
// the latch at −3.85, the spring at −3.05, the two contacts from −0.2 to 2.3. One frame, close, that glides along it.
const row = (s) => ({ ...P, tx: 0.5 * s, ty: 10.8, tz: 3.3 + 0.866 * s, d: 28, az: -60, el: 8, shift: 130 });
const ROW_HANDLE = row(-4.5); // the handle left of the middle, the latch and the spring on its right
const ROW_CONTACTS = row(-0.2); // the fixed contact and the arm; the arm stops short of TikTok's buttons

/* ── on the bench: assembled, open ── */
const OPEN = { ...VIEW.whole, tz: 3.5 }; // (the pose the bench cut lands on)
// the lower half of the works: the blade (right) and the coil lying under the chamber (left)
const TRAPS_BLADE = { ...P, tx: 0, ty: 3.0, tz: 3.5, d: 27, az: -66, el: 9, shift: 110 };
const TRAPS_COIL = { ...TRAPS_BLADE, ty: 2.8, tz: 2.7 };
// the blade's edge, from very close: its two metals are two strips, 1 mm each — from farther than this they are one grey.
// (pushed right: the bar is pale, and the caption must not be written across it)
const METALS = { ...P, tx: 0, ty: 3.55, tz: 4.1, d: 8.5, az: -86, el: 5, shift: 120, side: -290 };
// the blade in profile (it bends toward the left of the picture, where the latch's bar stands)
const BLADE = { ...VIEW.blade, d: 20 };
const BLADE_NEAR = { ...VIEW.blade, ty: 3.4, d: 18.5 };
// its tip and the head of the latch, the gap between them in the middle of the picture
const TIP = { ...VIEW.blade, ty: 4.0, tz: 3.8, d: 14.5, shift: 110 };

// the light: what it stands around, and how wide (a cut to the bench sets BENCHED's: the whole breaker)
const around = (pose, fs) => ({ fx: pose.tx, fy: pose.ty, fz: pose.tz, fs });
const L_OPEN = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs };

// the currents of this act (the header's readout and the picture's `load` always move together)
const amps = (a) => ({ amps: a, load: a / RATING });
const OVER = 21; // amperes of the demonstration: well above the rating — the blade bends, and does not trip
const EVENING = 18; // the hook's current: it comes back on the threshold

export default function acte2({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    tosystem: "tosystem", tobench: "tobench", explode: "explode",
    p1: "p1", p2: "p2", p3: "p3", path: "path", current: "eclate:courant", traps: "traps", p4: "p4", p5: "p5",
    torepos: "torepos", metals: "metals", current2: "repos:courant", warms: "warms", likewire: "likewire",
    toolong: "toolong", bends: "bends", reposEnd: "repos$",
    toseuil: "toseuil", seuil: "seuil", wire: "seuil:fil", heats: "seuil:chauffe", seuilEnd: "seuil$",
    tozero: "tozero",
  });
  setAct(tl, 2, t.tosystem);

  /* ───────────── "Alors…" — the breaker alone in its row: what is left of the wall goes out ───────────── */
  // (the same picture as act 1's last one: this cut only says the whole state — but for the header's "Depuis",
  // which keeps what act 1 counted until the bench takes the breaker out of its circuit)
  const evening = { ...STAGED };
  delete evening.secs;
  cut(t.tosystem, SET.ROOM, ALONE, { ...evening, others: 0, shell: 0.3, you: 0, mood: 0, ...LIT });
  st(t.tosystem + 0.04, (t.tobench - t.tosystem) * 0.8, { shell: 0, hotwire: 0 }, "sine.inOut");

  /* ───────────── "…on l'ouvre." — the same breaker on the bench, at the same place; its half-shell steps off ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: ALONE, origin: HOME, state: { ...BENCHED, cover: 1, ...amps(0), secs: 0, pool: 0, grid: 0 } });
  st(t.explode, 0.75, { cover: 0 }, "sine.inOut");
  // …and the works leave the case: the camera climbs with them to the upper row, and lands on the handle
  // (the half-shell is still half there when the exploded view takes it back: it never goes out and comes in again)
  const apart = t.explode + 0.3;
  st(apart, t.p1 - 0.05 - apart, { explode: 1 }, "sine.inOut");
  shot(apart, t.p1 + 0.1 - apart, ROW_HANDLE, "sine.inOut", bench.d);
  st(apart, t.p1 + 0.1 - apart, around(ROW_HANDLE, 5), "sine.inOut");

  /* ───────────── "Une manette, un ressort, deux contacts." — one frame glides along the row; each lights up on its word ───────────── */
  const glide = t.p3 + 0.35 - (t.p1 + 0.1);
  shot(t.p1 + 0.1, glide, ROW_CONTACTS, "sine.inOut");
  st(t.p1 + 0.1, glide, around(ROW_CONTACTS, 5), "sine.inOut");
  st(t.p1 + 0.05, 0.25, { litHandle: 1 }, "sine.out");
  st(t.p2 - 0.02, 0.25, { litHandle: 0 }, "sine.inOut");
  st(t.p2 + 0.05, 0.25, { litSpring: 1 }, "sine.out");
  st(t.p3 - 0.05, 0.25, { litSpring: 0 }, "sine.inOut");
  st(t.p3, 0.25, { litContacts: 1 }, "sine.out");

  /* ───────────── "Et sur le chemin du courant, deux pièges :" — the works go home; the path lights up, terminal to terminal ───────────── */
  const home = t.path - 0.5;
  st(home, 0.3, { litContacts: 0 }, "sine.inOut");
  st(home, t.path + 0.4 - home, { explode: 0 }, "sine.inOut");
  shot(home, t.path + 0.55 - home, OPEN, "sine.inOut", ROW_CONTACTS.d);
  st(home, t.path + 0.55 - home, L_OPEN, "sine.inOut");
  st(t.current - 0.1, t.traps - (t.current - 0.1), amps(RATING), "sine.inOut");

  /* ───────────── "un bilame… et une bobine." — down the path to the blade, a glide to the coil: one frame ───────────── */
  const dive = t.traps + 0.3;
  shot(dive, t.p4 + 0.2 - dive, TRAPS_BLADE, "sine.inOut", OPEN.d);
  st(dive, t.p4 + 0.2 - dive, around(TRAPS_BLADE, 4), "sine.inOut");
  st(t.p4 + 0.1, 0.25, { litBlade: 1 }, "sine.out");
  const toCoil = t.p4 + 0.55;
  shot(toCoil, t.p5 + 0.3 - toCoil, TRAPS_COIL, "sine.inOut");
  st(toCoil, t.p5 + 0.3 - toCoil, around(TRAPS_COIL, 4), "sine.inOut");
  st(t.p5 - 0.05, 0.3, { litBlade: 0 }, "sine.inOut");
  st(t.p5 + 0.1, 0.25, { litCoil: 1 }, "sine.out");

  /* ───────────── "Le bilame : deux métaux soudés." — a dive to its edge, in profile. The current goes off: its two metals show ───────────── */
  // (the current is drawn on the very face the two metals show: while it runs, the blade is one striped bar)
  const toBlade = t.torepos - 0.5;
  st(toBlade, 0.3, { litCoil: 0 }, "sine.inOut");
  shot(toBlade, t.metals - 0.05 - toBlade, METALS, "sine.inOut", TRAPS_COIL.d);
  st(toBlade, t.metals - 0.05 - toBlade, around(METALS, 1.6), "sine.inOut");
  st(t.torepos - 0.3, 0.6, amps(0), "sine.inOut");

  /* ───────────── "Le courant le chauffe, comme ton fil." — back from the detail: the current returns on its word, above the rating ───────────── */
  const back = t.current2 - 0.3;
  shot(back, t.warms + 0.3 - back, BLADE, "sine.inOut", METALS.d);
  st(back, t.warms + 0.3 - back, around(BLADE, 2.5), "sine.inOut");
  // …and from there to the bend, one slow push
  shot(t.warms + 0.3, t.reposEnd + 0.2 - (t.warms + 0.3), BLADE_NEAR, "sine.inOut");
  st(t.current2 - 0.05, 0.4, amps(OVER), "sine.out");
  st(t.current2 - 0.05, 0.3, { mood: 1 }, "sine.inOut");
  st(t.warms, t.toolong + 0.3 - t.warms, { warm: 0.8 }, "sine.out");
  chip("chip-comme", null, 96, 470, t.likewire - 0.3, t.toolong + 0.75);

  /* ───────────── "Trop longtemps… il se tord." — it creeps, then bends toward the latch — and does not reach it ───────────── */
  st(t.toolong, t.bends - 0.1 - t.toolong, { bend: 0.15 }, "sine.in");
  st(t.bends - 0.1, 0.55, { bend: 0.8 }, "power2.out");
  // …the film has shown the gesture: the current falls back to the rating, the blade cools and straightens
  const relax = t.reposEnd + 0.2;
  st(relax, t.seuil + 0.4 - relax, { bend: 0.1, warm: 0.3, ...amps(RATING) }, "sine.inOut");
  st(relax + 0.1, 0.3, { mood: 0 }, "sine.inOut");

  /* ───────────── the threshold — "Abonne-toi : ce fil qui chauffe, regarde ce qu'il fait au bilame." ───────────── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: on "ce fil qui chauffe" the
  // evening's 18 amperes are back in the header — it turns signal — the blade begins to warm again, and the camera
  // closes on its tip and the head of the latch: the gap act 3 is about to close.
  // (the chevrons and the lit name need a third of a second to leave: they are gone when act 3 cuts)
  const closing = t.tozero - 0.04 - t.toseuil;
  shot(t.toseuil, closing, TIP, "sine.inOut", BLADE_NEAR.d);
  st(t.toseuil, closing, around(TIP, 2), "sine.inOut");
  st(t.wire - 0.1, t.heats + 0.2 - (t.wire - 0.1), amps(EVENING), "sine.inOut");
  st(t.wire, 0.3, { mood: 1 }, "sine.inOut");
  st(t.heats, t.tozero - 0.04 - t.heats, { warm: 0.42, bend: 0.17 }, "sine.in");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.32) });
  // the header answers the word
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.14, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, t.heats);
  tl.to("#hud-clock", { scale: 1, duration: 0.36, ease: "power2.out" }, t.heats + 0.3);
}
