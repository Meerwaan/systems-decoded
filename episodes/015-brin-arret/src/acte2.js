// 02 · AUTOPSIE — from "Alors…" to the cut of act 3 (tosystem → tozero).
//
// Act 1 has dived through the glass deck to the brake: the ship's last lines go out, the system stays alone. The same
// object on the bench, at the same place of the picture (benchCut); it opens on two levels — the wire lifted off its
// strip of deck, the brake's row drawn out of its cables toward the eye — and closes again while the camera dives to
// the top of it. From there the autopsy is ONE walk down the cable, the way the pull will travel:
//   the wire on the deck ("un câble d'acier : le brin") — steel first, then veille on its name
//   → a head of light leaves it, goes round the deck sheave and down the purchase cable ("Dessous, il continue")
//   → the lead sheave, the fixed block ("des poulies…"), along the upper sheet to the crosshead ("et au bout")
//   → the ram lights up as the head reaches it ("un piston"), the cylinder ("dans un cylindre"), and its steel
//     turns to glass ("plein d'huile").
// At REST: a dive to the valve's graduated wheel, which turns and stops on its mark, the needle following in the
// throat ("on règle ce frein"); then back to the whole system — the frame the act opened on — and a slow pull: a
// hook's head takes the wire, the V opens, the cables run, the ram goes in, the oil passes the open valve and nothing
// heats ("il ne sait que tirer").
// The threshold does not stop the film: the wire is let go while the camera is already diving to its middle — where
// the hook is about to arrive. Act 3 cuts from there to the wheels.
import { setAct } from "@kit/overlay.js";
import { anchor } from "@kit/build3d.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, SYSTEM, ENGINE, BRINS, SIZE } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [, BY] = SYSTEM.bench;
// where the system stands in the ship, counted from where it stands on the bench
const HOME = SYSTEM.bench.map((v) => -v);
// the bench's light, stood round the system in the ship: it is lit alike on both sides of the cut
const LIT = { fx: HOME[0] + BENCHED.fx, fy: HOME[1] + BENCHED.fy, fz: HOME[2] + BENCHED.fz, fs: BENCHED.fs };

/* ── in the ship: the system, alone ── */
const ALONE = { ...VIEW.system, d: 5800 }; // "Alors…": a breath nearer; the cut to the bench leaves from here

/* ── on the bench (the system stands at SYSTEM.bench: the deck is y = BY, the brake's axis y = BY + ENGINE.y) ── */
const OPEN = VIEW.exploded;
// the wire where it leaves its deck sheave, to port: the pot, the purchase cable's end, the coupling, the pendant
// running away up the picture (its far end leaves by the right edge: the brake under it stays out of the frame)
const BRIN = { ...P, tx: -760, ty: BY + BRINS.lift, tz: 0, d: 1100, az: -66, el: 13, shift: 160 };
// the cable's way down: the pot, the fall, the lead sheave, the fixed block
const PATH = { ...P, tx: -930, ty: BY - 250, tz: 0, d: 3100, az: -42, el: 14, shift: 190 };
// the far end of it: the cylinder, the ram coming out of its gland, the crosshead
const HEART = { ...P, tx: 260, ty: BY + ENGINE.y, tz: 0, d: 3300, az: -48, el: 13, shift: 180 };
// the valve: its graduated wheel up on the right, its throat down on the left (the wheel clears the top slot's label)
const DIAL = { ...P, tx: -300, ty: BY + ENGINE.y + 40, tz: 40, d: 1000, az: -34, el: 20, shift: 105 };
// the wire AND the brake — the frame of the cut to the bench, lowered: the hook's head stays under the top slot
const WORK = { ...P, tx: 0, ty: BY - 220, tz: -100, d: 5800, az: -58, el: 18, shift: 105 };
// the middle of the wire, low on its strip of deck: where the hook will take it
const WIRE = { ...P, tx: 0, ty: BY + 20, tz: 0, d: 760, az: -58, el: 8, shift: 150 };

// the light: what it stands around, and how wide (a cut to the bench sets BENCHED's: the whole system)
const L_BRIN = { fx: BRIN.tx, fy: BRIN.ty, fz: 0, fs: 600 };
const L_PATH = { fx: -900, fy: BY - 270, fz: 0, fs: 700 };
const L_HEART = { fx: HEART.tx, fy: HEART.ty, fz: 0, fs: 700 };
const L_DIAL = { fx: DIAL.tx, fy: DIAL.ty, fz: DIAL.tz, fs: 500 };
const L_WORK = { fx: 0, fy: BY - 200, fz: -150, fs: SIZE };
const L_WIRE = { fx: 0, fy: WIRE.ty, fz: 0, fs: 300 };

const UNSET = 0.2; // the valve's wheel before it is set (0.5 is right for this aircraft)
const PULL = 6; //    metres the bench's hook pulls the wire…
const RAM = 0.5; //   …and how far the ram goes in for it
// the head of light (`wave`): where it is along the cable's way (see model.js)
const W = { sheave: 0.36, tackle: 0.47, crosshead: 0.86, ram: 0.93 };

export default function acte2({ D, world, co }) {
  const { tl, st, now, shot, chip } = D;
  const A = world.system.A;
  const t = D.times({
    tosystem: "tosystem", tobench: "tobench", explode: "explode", opened: "ouvre$",
    sur: "eclate", acier: "eclate:d'acier", brin: "brin", under: "under", goesOn: "eclate:continue",
    p2: "p2", p3: "p3", p4: "p4", oil: "oil",
    torepos: "torepos", setup: "setup", avion: "repos:l'avion", cable: "repos:câble", sait: "repos:sait", pulls: "pulls",
    toseuil: "toseuil", seuil: "seuil", cent: "seuil:cent", seuilEnd: "seuil$",
    tozero: "tozero",
  });
  setAct(tl, 2, t.tosystem);
  /** The time between two instants of the script — never less than `min`. */
  const span = (from, to, min = 0.25) => Math.max(min, to - from);
  // a point of the pendant, between its coupling and its middle: what the wire's legend points at
  const onBrin = anchor(world.system.root, -660, BRINS.lift, 0);

  /* ───────────── "Alors…" — the ship's last lines go out: the system stays alone ───────────── */
  // (act 1 ends on VIEW.system, everything else dark: these are soft moves from wherever it left things, not a cut)
  const alone = span(t.tosystem, t.tobench, 0.3);
  shot(t.tosystem + 0.02, alone - 0.04, ALONE, "sine.inOut", VIEW.system.d);
  st(t.tosystem + 0.02, alone * 0.7, { shell: 0, sea: 0, others: 0, jet: 0, you: 0, under: 1, mood: 0, ...LIT }, "sine.inOut");

  /* ───────────── "…on l'ouvre." — the same system on the bench, at the same place; it opens on two levels ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: ALONE, origin: HOME, state: { ...BENCHED, pool: 0, grid: 0, dial: UNSET } });
  // (fast through its first third: the blocks' cheeks cross a sheet of cables there)
  st(t.explode, span(t.explode, t.opened + 0.5, 0.7), { explode: 1 }, "sine.out");
  shot(t.explode + 0.03, span(t.explode, t.sur, 0.9), OPEN, "sine.inOut", bench.d);

  /* ───────────── "Sur le pont, un câble d'acier : le brin." — a dive to the top of it: the wire ───────────── */
  // The row closes behind the camera as it leaves the frame; the pendant comes down on its strip of deck as the
  // camera lands: steel, its strands, its coupling. Its name turns it veille.
  const toBrin = span(t.sur, t.acier, 0.9);
  shot(t.sur + 0.04, toBrin, BRIN, "sine.inOut", OPEN.d);
  st(t.sur + 0.04, toBrin, L_BRIN, "sine.inOut");
  st(t.sur + 0.3, toBrin - 0.3, { explode: 0 }, "sine.in");
  st(t.brin, 0.3, { litBrin: 1 }, "sine.out");
  const cBrin = co.add({ title: "Brin", x: 520, y: 566, align: "end", tone: "system", anchor: onBrin });
  cBrin.show(tl, t.brin - 0.25); // (its dot and its leader first: the word comes with "brin")
  cBrin.hide(tl, t.under + 0.1);

  /* ───────────── "Dessous, il continue : des poulies…" — a head of light leaves the wire: the camera follows it down ───────────── */
  const toPath = span(t.under, t.p2 - 0.2, 1);
  shot(t.under + 0.04, toPath, PATH, "sine.inOut", BRIN.d);
  st(t.under + 0.04, toPath, L_PATH, "sine.inOut");
  st(t.under, span(t.under, t.goesOn), { wave: W.sheave }, "none"); //  along the wire, round the deck sheave
  st(t.goesOn, span(t.goesOn, t.p2), { wave: W.tackle }, "none"); //    down the fall, round the lead sheave
  st(t.under + 0.2, 0.3, { litCable: 1 }, "sine.out");
  st(t.under + 0.5, 0.4, { litBrin: 0 }, "sine.inOut");
  st(t.p2, 0.3, { litSheaves: 1 }, "sine.out");

  /* ───────────── "…et au bout, un piston dans un cylindre plein d'huile." — along the machine, to its far end ───────────── */
  const toHeart = span(t.p2 - 0.1, t.p3, 1.2);
  shot(t.p2 - 0.1, toHeart, HEART, "sine.inOut", PATH.d);
  st(t.p2 - 0.1, toHeart, L_HEART, "sine.inOut");
  st(t.p2, span(t.p2, t.p3 - 0.1), { wave: W.crosshead }, "none"); //   the upper sheet, as far as the crosshead
  st(t.p3 - 0.1, 0.35, { wave: W.ram }, "none"); //                     …and the ram answers
  st(t.p3 + 0.25, span(t.p3 + 0.25, t.p4), { wave: 1 }, "none"); //     (dark at 1, and at 0)
  now(t.p4 + 0.02, { wave: 0 });
  st(t.p3 - 0.1, 0.3, { litCable: 0, litSheaves: 0 }, "sine.inOut");
  st(t.p3, 0.3, { litRam: 1 }, "sine.out");
  const cRam = co.add({ title: "Piston", x: 430, y: 570, align: "end", tone: "system", anchor: A.ram });
  cRam.show(tl, t.p3 - 0.1);
  cRam.hide(tl, t.oil - 0.1);
  st(t.p4 - 0.05, 0.3, { litRam: 0.3 }, "sine.inOut");
  st(t.p4, 0.3, { litCyl: 1 }, "sine.out");
  st(t.oil, 0.55, { xray: 1 }, "sine.inOut");

  /* ───────────── "Avant chaque appontage, on règle ce frein pour l'avion qui arrive." — the valve's wheel, and its needle ───────────── */
  const toDial = span(t.torepos, t.setup, 0.9);
  shot(t.torepos, toDial, DIAL, "sine.inOut", HEART.d);
  st(t.torepos, toDial, L_DIAL, "sine.inOut");
  st(t.torepos, 0.4, { litCyl: 0, litRam: 0 }, "sine.inOut");
  st(t.torepos + 0.3, 0.4, { litValve: 1 }, "sine.out");
  st(t.setup, span(t.setup, t.avion, 0.7), { dial: 0.5 }, "power2.inOut"); // it turns, and stops on its mark
  chip("chip-reglage", null, 96, 470, t.avion - 0.1, t.cable - 0.16);

  /* ───────────── "Le câble, lui, ne freine rien : il ne sait que tirer." — back to the whole of it, and a slow pull ───────────── */
  const toWork = span(t.cable - 0.1, t.sait - 0.1, 1.2);
  shot(t.cable - 0.1, toWork, WORK, "sine.inOut", DIAL.d);
  st(t.cable - 0.1, toWork, L_WORK, "sine.inOut");
  st(t.cable - 0.1, 0.4, { litValve: 0 }, "sine.inOut");
  st(t.cable, 0.4, { litBrin: 1, litCable: 1 }, "sine.out");
  // a hook's head takes the wire's middle; on "tirer" it pulls: the V opens, the cables run, the ram goes in. The
  // valve lets the oil through: nothing heats.
  st(t.sait, 0.25, { held: 1 }, "sine.out");
  const pulling = span(t.pulls, t.seuil + 0.2, 0.9);
  st(t.pulls, 0.3, { tense: 1, litBrin: 0, litCable: 0 }, "sine.out");
  st(t.pulls, pulling, { pull: PULL, ram: RAM }, "sine.inOut");
  st(t.pulls, pulling, { wave: 1 }, "none");
  now(t.pulls + pulling + 0.02, { wave: 0 });
  st(t.pulls + 0.15, 0.4, { flow: 0.3 }, "sine.inOut");
  st(t.pulls + pulling - 0.35, 0.4, { flow: 0 }, "sine.inOut");
  chip("chip-tire", null, 96, 470, t.pulls, t.seuil + 0.25);

  /* ───────────── the threshold — "Abonne-toi : ces cent mètres, on te les montre en entier." ───────────── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: the wire is let go — everything
  // comes back — while the camera is already diving to its middle, on its strip of deck: where the hook will arrive.
  // The header's clock, stopped a tenth of a second before, answers "cent".
  const climb = t.tozero - t.toseuil - 0.03;
  shot(t.toseuil, climb, WIRE, "sine.inOut", WORK.d);
  st(t.toseuil, climb, L_WIRE, "sine.inOut");
  const back = span(t.seuil + 0.3, t.cent + 0.3, 0.7);
  st(t.seuil + 0.3, back, { pull: 0, ram: 0 }, "sine.inOut");
  st(t.seuil + 0.3, back, { tense: 0.4 }, "sine.inOut");
  st(t.seuil + 0.3 + back, 0.35, { held: 0 }, "sine.inOut");
  st(t.seuil + 0.3 + back, 0.4, { litBrin: 1 }, "sine.out");
  // (the chevrons and the lit name need a third of a second to leave: they are gone when act 3 cuts)
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.32) });
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.12, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, t.cent);
  tl.to("#hud-clock", { scale: 1, duration: 0.36, ease: "power2.out" }, t.cent + 0.3);
}
