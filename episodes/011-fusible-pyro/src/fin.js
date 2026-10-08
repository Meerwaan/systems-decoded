// DOSSIER 011 — the chute, the three calls to action, the loop (`toverdict` → the end).
//   chute        the bench: the fuse in section, whole, the battery's current through its bar, under the received idea
//                ("Il fond", struck on "pas"). On "sauter" the fuse goes off AT REAL SPEED — four frames: the charge, the
//                piston through the copper, an arc of one frame — and "Il saute" takes the struck title's place. The camera
//                turns slowly round what is left; on "pas après" the title leaves and the cut bar comes up to the header
//   like · abo   the bench, a NEW fuse, whole, alive (the current through its bar), turning slowly under the panel
//   commentaire  what the hook left open ("ces volts restent… quelque part"): the car after the crash, empty, everything
//                dark — and on "batterie" the battery alone lights up under the floor: the picture act 1 refused to show.
//                The car fades, the camera goes down to the modules for the figure, then along the dead orange cable for
//                the rule, and the question (answered before the cut: no panel straddles it)
//   boucle       the car whole, alive, held at the instant of the crash: ONE move down to the first frame, reached on
//                "l'instant" — and the crash starts there, gathering speed into the first frame of the film
// Every pose was placed by projection (the fuse's top and feet, the battery, the cable's points against the panels, the
// header and the captions), then looked at.
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, FIRST, POSE0, BENCHED, STAGED } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };

/* chute — the fuse in section (lid 0): its connector just under the title (which ends at y 634), its pit above the captions */
const SECTION = { ...P, tx: 0, ty: 7.7, tz: 0, d: 45, az: -22, el: 11, shift: 8 };
const SECTION_ON = { d: 44 };
const SECTION_TURN = { az: -17 };
// the cut bar once the title has left: the connector just under the header (closer, the charge climbs behind its labels)
const GAP = { ...P, tx: 0, ty: 6, tz: 0.3, d: 33, az: -13, el: 12, shift: -76 };

/* like · abonnement — a new fuse, whole, under a panel (#net ends at y 761, #next at 835): 17 cm of bar for 11 cm of height
   on its stand — between a panel and the captions it cannot be wider than ≈ 600 px, left of TikTok's buttons */
const NEW = { ...P, tx: 0, ty: 5.8, tz: 0, d: 103, az: -32, el: 10, shift: -22, side: 60 };
const NEW_LIKE = { az: -25 };
const NEW_ABO = { d: 116, az: -18, el: 6, shift: -65 };
const NEW_END = { az: -13 };

/* commentaire — the whole car after the crash, from high behind your side (from the side a car does not hold in an upright
   frame): the battery is its floor. Then the left modules, alone in the frame; then the front cable, running up the picture
   — its fold stays behind the question's panel */
const DARK = { ...P, tx: 0, ty: 45, tz: 20, d: 1800, az: -24, el: 36, shift: 190 };
const DARK_ON = { d: 1700 };
const MODULES = { ...P, tx: -52, ty: 29, tz: 40, d: 230, az: -24, el: 46, shift: 0 };
const CABLE = { ...P, tx: 10, ty: 34, tz: -30, d: 250, az: -24, el: 32, shift: 0 };
const CABLE_END = { tz: -45, shift: -60 };

/* boucle — the whole car, alive, from three quarters rear */
const REAR = { tx: -10, ty: 70, tz: 0, d: 1100, az: -30, el: 22, fov: 42, shift: 150, side: 0, roll: 0, drift: 0 };

/* what a cut to the road sets, whatever came before (STAGED, and what STAGED leaves alone: the bench's own light) */
const ROAD = { ...STAGED, pool: FIRST.pool, grid: FIRST.grid };
/* the car after the crash: you are out, the bags hang empty, the fuse has cut — nothing lives outside the battery, and the
   battery itself is kept in the dark until its word */
const AFTER = { ...ROAD, crush: 1, you: 0, bags: 0.35, hv: 0, flow: 0, piston: 1, broken: 1, mood: 0, shell: 0.6, pack: 0.1 };

export default function fin({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", blow: "blow", sauter: "chute:sauter", pas2: "chute:pas#2", tocta: "tocta",
    like: "like", likeEnd: "like$", abo: "abo", prochain: "abo:Prochain", flamme: "abo:flamme", aboEnd: "abo$",
    tocomment: "tocomment", pack: "pack", dans: "comment:Dans#2", volts: "volts", voltsEnd: "comment:volts#2$", orange: "orange",
    ask: "ask", commentaire: "comment:commentaire", tu: "comment:tu#2", toloop: "toloop", instant: "boucle:instant",
  });
  const f = 1 / D.EP.fps; // one frame
  const onFrame = (x) => Math.round(x / f) * f;

  /* ── chute: "Ce fusible ne fond PAS." — whole, in section, the current through its bar ── */
  cut(t.toverdict, SET.BENCH, SECTION, { ...BENCHED, lid: 0, flow: 0.5 });
  shot(t.toverdict, t.blow - t.toverdict, SECTION_ON);
  // (no shade: the fuse stands UNDER the title, and the title has left when the camera goes to the gap — on "pas après")
  const untitle = t.pas2 - 0.1;
  retitle(tl, { showAt: t.chute, strikeAt: t.pas, swapAt: t.sauter, hideAt: untitle, shade: false });
  D.verdict(t.pas);

  /* "On le fait SAUTER" — at REAL speed, four frames: the charge (one frame up, two at the top), the piston through the
     copper, the bar's middle down in the pit, an arc of one frame; then no current */
  const blow = onFrame(t.blow);
  st(blow, f, { fire: 1.2 }, "power2.out");
  st(blow + f, 2 * f, { piston: 1 }, "power1.in");
  st(blow + 1.5 * f, 1.5 * f, { broken: 1 }, "power1.in");
  now(blow + 3 * f, { arc: 1.2 });
  now(blow + 4 * f, { arc: 0, flow: 0 });
  st(blow + 3 * f, 0.4, { fire: 0 }, "power2.out");
  st(blow, 2 * f, { pool: 0.4 }, "power2.out");
  st(blow + 3 * f, 0.7, { pool: 0.2 }, "sine.inOut");

  /* "avant que ça chauffe," — the camera turns slowly round what is left: the wedge through the bar, the piece in the pit */
  shot(blow + 4 * f, untitle - blow - 4 * f, SECTION_TURN);
  /* "pas après." — the title leaves, the camera goes to the cut bar */
  shot(untitle, t.tocta - untitle, GAP, "sine.inOut", SECTION_ON.d);
  st(untitle, t.tocta - untitle, { fy: 6, fs: 6 }, "sine.inOut");

  /* ── LIKE: a new fuse, the current through it; it turns slowly under the panel ── */
  cut(t.tocta, SET.BENCH, NEW, { ...BENCHED, flow: 0.8, litCase: 0.3, pool: 0.3 });
  shot(t.tocta, t.abo - 0.15 - t.tocta, NEW_LIKE);
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ── ABONNEMENT: the camera backs away and comes down, then the next file, classified ── */
  const atAbo = t.prochain - 0.12;
  shot(t.abo - 0.15, atAbo - t.abo + 0.15, NEW_ABO);
  shot(atAbo, t.tocomment - atAbo, NEW_END);
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.flamme - 0.12, hideAt: t.tocomment - 0.4, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── COMMENTAIRE: "Et ces volts, ils sont où ?" — the car after the crash: everything is dark ── */
  cut(t.tocomment, SET.ROAD, DARK, { ...AFTER, fx: 0, fy: 40, fz: 20, fs: 330 });
  shot(t.tocomment, t.dans - t.tocomment, DARK_ON);
  /* "Restés dans la BATTERIE." — it alone lights up under the floor, the car dims round it */
  st(t.pack, 0.35, { pack: 1 }, "power2.out");
  st(t.pack, (t.dans - t.pack) * 0.55, { shell: 0.3 }, "sine.inOut");
  chip("chip-reste", null, 96, 470, t.pack + 0.1, t.volts - 0.2);
  /* "Dans un pack écrasé, on a mesuré jusqu'à 167 volts." — down to its modules; the car fades away on the way (the bags,
     which cannot fade, go once they are out of the frame) */
  shot(t.dans, t.voltsEnd - t.dans, MODULES, "sine.inOut", DARK_ON.d);
  st(t.dans, t.voltsEnd - t.dans, { fx: MODULES.tx, fy: MODULES.ty, fz: MODULES.tz, fs: 120 }, "sine.inOut");
  st(t.dans, (t.voltsEnd - t.dans) * 0.6, { shell: 0 }, "sine.inOut");
  now(t.dans + (t.voltsEnd - t.dans) * 0.82, { bags: 0 });
  chip("chip-pack", null, 96, 470, t.volts, t.orange - 0.2);
  /* "Ce qui est ORANGE, tu n'y touches jamais." — to the front cable, dead, and forward along it (its label to its right) */
  shot(t.voltsEnd, t.ask - t.voltsEnd, CABLE, "sine.inOut", MODULES.d);
  st(t.voltsEnd, t.ask - t.voltsEnd, { fx: 10, fy: 34, fz: -30, fs: 130 }, "sine.inOut");
  chip("chip-orange", null, 560, 470, t.orange, t.ask - 0.2);
  /* "En commentaire : tu le savais ?" — the question; its answer is typed before the cut (no panel straddles it) */
  shot(t.ask, t.toloop - t.ask, CABLE_END);
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.tu, chars: 3, to: t.toloop - 0.32 });

  /* ── BOUCLE: "Maintenant, tu sais ce qui se passe sous le plancher, à l'instant du…" — the bumper on the wall, time held;
     one move to the first frame, reached on "l'instant": there the loop lets the crash start (crush 0 → FIRST, debris 0 →
     FIRST), slowly then faster — the film's first half second goes on from it ── */
  cut(t.toloop, SET.ROAD, REAR, { ...ROAD });
  shot(t.toloop, t.instant - t.toloop, POSE0, "sine.inOut", REAR.d);
  D.loop({ at: t.toloop, rewindAt: t.instant, ease: "power2.in" });
}
