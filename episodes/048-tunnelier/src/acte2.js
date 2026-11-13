// 02 · AUTOPSIE — from "…on l'ouvre." to the cut of act 3 (tobench → torepos).
//
// Act 1 leaves the machine in profile in the section, its near half cut away. Just before "on" the same machine
// stands on the bench at the same place of the picture (benchCut, same pose, still cut away), and on "on" it comes
// apart in a diagonal row while the camera pulls back and turns to the whole row (« Un tunnelier du Grand Paris »).
// Then each part the voice names has its frame, the camera gliding from one to the next along the row: the cutterhead
// (it turns, its dimension line draws itself), the chamber full of earth and, sliding on, its bulkhead (two
// neighbours, one frame that glides), the screw (it speeds up, the earth climbs its thread). On « Et au cœur… » the
// row half closes and all but the chamber, the bulkhead and the manometer fade: the needle lands in its green band on
// « pression » (no figure: the dial is mute).
// Then the cut to the section, for the principle: the face in profile, the cutterhead behind it. The soil's red
// arrows come in on « pousse » and the face starts to slide toward the wheel; the depth scale draws itself and the
// camera glides down it on « un bar tous les dix mètres de fond »; back at the face, the chamber's green arrows grow
// out to meet the red ones on « pareil » — the header reads Équilibre, the light turns veille — and on « bouge » the
// face is back and still, and the camera stops dead with it. Act 3 cuts from there (STAGED).
import { setAct } from "@kit/overlay.js";
import { benchCut } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, BENCH_FROM, TBM } from "./world.js";

const AY = TBM.axisY;
const CLOSE = { dof: VIEW.gaugeBench.dof }; // the lens of the close-ups (LOOK.dof)

/* ── the seam: the machine in profile, cut away (section coordinates; acte1.js END: its PROFILE at d 3150; benchCut moves it) ── */
const PROFILE = { ...VIEW.profile, tx: 250, ty: AY - 40, tz: 0, d: 3150, az: -2, el: 5, fov: 30, shift: 100, dof: 0 };

/* ── on the bench (bench coordinates: a plan point p sits at p − BENCH_FROM) ── */
// the whole row, from the front-left, head nearest (model.js journal)
const ROW = { ...VIEW.exploded, tx: -100, ty: 620, tz: 0, d: 7300, az: -60, el: 15, fov: 30, shift: 120, dof: 0 };
const ROW_END = { ...ROW, d: 6800, az: -53, el: 17 };
// the cutterhead, apart, with its dimension line (exploded: head at x ≈ −1090)
const HEAD = { ...VIEW.headBench, tx: -1060, ty: 491, tz: 320, d: 4400, az: -62, el: 8, fov: 28, shift: 100, dof: 0 };
const HEAD_END = { ...HEAD, d: 4100, az: -54, el: 10 };
// the chamber (x ≈ −628 apart), seen past the head from a frontal three quarters (from az −60 the head hides it),
// then the frame glides on to its bulkhead (x ≈ −220)
const CHAMBER = { tx: -600, ty: 491, tz: 0, d: 3800, az: -30, el: 16, fov: 28, shift: 100, side: 0, roll: 0, drift: 0.3, dof: 0 };
const BULK = { ...CHAMBER, tx: -230, d: 3300, az: -18, el: 14 };
// the screw, lifted out of the row: its inlet low near the chamber, its tube climbing to the back
const SCREW = { tx: 330, ty: 760, tz: -30, d: 2600, az: -30, el: 14, fov: 28, shift: 80, side: 0, roll: 0, drift: 0.3, dof: 0 };
const SCREW_END = { ...SCREW, d: 2400, az: -24 };
// the heart: the manometer on the bulkhead, the chamber behind it (row half closed: the bulkhead at +42 cm)
const GAUGE = { ...VIEW.gaugeBench, ...CLOSE, tx: -200, ty: 715, tz: 344, d: 1050, az: -24, el: 8, shift: 120 };
const GAUGE_END = { ...GAUGE, d: 940, az: -20 };

/* ── the principle, in the section (plan coordinates) ── */
// the face in profile between the soil and the chamber, the cutterhead behind it (model.js journal: arrows read)
const FRONT = { tx: 20, ty: AY, tz: 300, d: 4400, az: -8, el: 4, fov: 30, shift: 160, side: 0, roll: 0, drift: 0.3, dof: 0 };
const FRONT_PUSH = { ...FRONT, d: 3900, az: -4, el: 5 };
// the depth scale (x −640, a tick every 10 m) with the face in the same frame, high then low along it
// (retouche 13/11: tx −320 left the machine on the right edge, under TikTok's buttons — now the head stays left of x 905)
const SCALE_TOP = { ...FRONT, tx: -80, ty: -1180, tz: 0, d: 6000, az: -6, el: 4, shift: 120 };
const SCALE_LOW = { ...SCALE_TOP, tx: -60, ty: -1300, d: 5800, az: -3 };
// back at the face for « La chambre pousse pareil » — it stops dead on « bouge »
const FRONT_BACK = { ...FRONT, d: 4200, az: -2, el: 5 };
const FRONT_STILL = { ...FRONT_BACK, d: 3900, az: 2 };

// the light on the bench: round the machine, then wide round the row
const L_WHOLE = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs };
const L_ROW = { fx: 0, fy: 520, fz: 0, fs: 1250 };
const L_HEART = { fx: -250, fy: 600, fz: 120, fs: 700 };

const TOP = [96, 470]; // a label's fixed place in the top slot (the camera travels under every one of them)

export default function acte2({ D }) {
  const { tl, st, now, shot, chip, punch } = D;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode",
    row: "eclate", sa: "eclate:Sa", roue: "eclate:roue", presque: "eclate:presque",
    behind: "eclate:Derrière", chambre: "eclate:chambre", cloison: "eclate:cloison",
    vis: "eclate:vis", et: "eclate:Et", coeur: "eclate:cœur", pression: "eclate:pression",
    principe: "principe", sol: "principe:sol", pousse: "principe:pousse", paroi: "principe:paroi", devant: "principe:devant",
    eau: "principe:seule", bar: "principe:bar", dix: "principe:dix", fond: "principe:fond",
    laChambre: "principe:chambre", pareil: "principe:pareil", bouge: "principe:bouge",
    torepos: "torepos",
  });
  t.eau -= 0.2; // « L'eau » starts one word before « seule »
  t.une = t.vis - 0.2; // « Une » (the beat says « une » three times)
  t.toprin = t.principe - 0.15; // the cut to the section, a few frames before « Pourquoi »
  setAct(tl, 2, t.ouvre);

  /* ── the turns go on (cumulative, from act 1's ≈ 1.2 and ≈ 2): the wheel slow all along, the screw faster on « vis » ── */
  const W_RATE = 0.06;
  const S_RATE = 0.15;
  st(t.tobench, t.torepos - t.tobench, { wheel: 1.2 + W_RATE * (t.torepos - t.tobench) }, "none");
  const s1 = 2 + S_RATE * (t.vis - 0.2 - t.tobench);
  st(t.tobench, t.vis - 0.2 - t.tobench, { screw: s1 }, "none");
  st(t.vis - 0.2, 1.3, { screw: s1 + 1.5 }, "none"); // « Une vis l'en sort »: the screw pulls the earth out
  st(t.vis + 1.1, t.torepos - t.vis - 1.1, { screw: s1 + 1.5 + S_RATE * (t.torepos - t.vis - 1.1) }, "none");

  /* ───────────── "…on l'ouvre." — the same machine on the bench, at the same place; on « on » it comes apart ───────────── */
  // still cut away, as in the section's last frame: the cut only swaps the soil for the bench's halo
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: PROFILE, origin: BENCH_FROM, state: { ...BENCHED, cutaway: 1, ...L_WHOLE } });
  st(t.explode, 1.5, { explode: 1 }, "power2.out");
  st(t.explode, 1.5, L_ROW, "sine.inOut");
  // the camera pulls back and turns with the parts to the whole row (58° in 1.45 s: a move, not a cut)
  shot(t.explode, t.row - t.explode, ROW, "sine.inOut", bench.d);

  /* ── « Un tunnelier du Grand Paris. » — the whole row, turning slowly round it ── */
  shot(t.row, t.sa - 0.15 - t.row, ROW_END, "sine.inOut");
  chip("chip-tunnelier", null, ...TOP, t.row, t.sa - 0.15);

  /* ── « Sa roue : presque dix mètres. » — the cutterhead turns, its dimension line draws itself ── */
  shot(t.sa - 0.15, 1.0, HEAD, "sine.inOut");
  shot(t.sa + 0.85, t.behind - 0.2 - t.sa - 0.85, HEAD_END, "sine.inOut");
  st(t.roue, 0.4, { litHead: 0.5 }, "sine.out");
  st(t.presque - 0.36, 1.0, { cote: 1 }, "power2.inOut");
  chip("chip-roue", null, ...TOP, t.presque, t.behind - 0.12);
  st(t.behind - 0.2, 0.5, { litHead: 0, cote: 0 }, "sine.inOut");

  /* ── « Derrière, une chambre pleine de terre, fermée par une cloison. » — one frame that glides from one to the other ── */
  shot(t.behind - 0.2, t.chambre - t.behind + 0.2, CHAMBER, "sine.inOut");
  shot(t.chambre, t.cloison + 0.3 - t.chambre, BULK, "sine.inOut");
  st(t.chambre, 0.4, { litChamber: 0.15 }, "sine.out");
  chip("chip-chambre", null, ...TOP, t.chambre, t.cloison - 0.12);
  st(t.cloison - 0.1, 0.4, { litChamber: 0, litBulk: 0.35 }, "sine.inOut");
  chip("chip-cloison", null, ...TOP, t.cloison, t.une - 0.05);

  /* ── « Une vis l'en sort. » — the screw speeds up, the earth climbs its thread ── */
  shot(t.cloison + 0.3, t.une + 0.25 - t.cloison - 0.3, SCREW, "sine.inOut");
  shot(t.une + 0.25, t.et - t.une - 0.25, SCREW_END, "sine.inOut");
  st(t.une, 0.4, { litBulk: 0, litScrew: 0.7 }, "sine.inOut");
  chip("chip-vis", null, ...TOP, t.vis, t.et - 0.08);

  /* ── « Et au cœur… la pression. » — the row half closes, the heart alone; the needle lands in the green on « pression » ── */
  st(t.et - 0.05, 0.9, { explode: 0.4, solo: 1, litScrew: 0, ...L_HEART }, "sine.inOut");
  now(t.et, { press: 0.8 }); // the needle drops out of its band while the frame closes in…
  shot(t.et - 0.05, t.pression - 0.1 - t.et + 0.05, GAUGE, "sine.inOut");
  st(t.pression, 0.5, { press: 1 }, "power3.out"); // …and lands in it on the word
  shot(t.pression - 0.1, t.toprin - t.pression + 0.1, GAUGE_END, "sine.inOut");
  punch(t.pression + 0.02, 0.06, { hold: 0.2, down: 0.45 });
  chip("chip-coeur", null, ...TOP, t.coeur, t.toprin - 0.18);

  /* ───────────── the principle, in the section ───────────── */
  // « Pourquoi ça tient ? » — the face alone, nothing pushing yet; the light signal: the soil is the threat
  D.cut(t.toprin, SET.SECTION, FRONT, { ...STAGED, depth: 0, arrows: 0, hold: 0, face: 0, mood: 1 });
  shot(t.toprin + 0.02, t.sol - t.toprin, { ...FRONT, d: 4150, az: -6 }, "sine.inOut");

  // « Le sol pousse sur le front, la paroi devant la roue. » — the red arrows come in and press; the face starts to slide
  st(t.sol, 0.8, { arrows: 1 }, "power2.out");
  now(t.sol, { press: 0.85 }); // nothing pushes back yet: the header says it (En chute)
  st(t.pousse, t.devant - t.pousse, { face: 0.3 }, "sine.inOut");
  shot(t.sol, t.eau - 0.3 - t.sol, FRONT_PUSH, "sine.inOut");

  // « L'eau seule, c'est un bar tous les dix mètres de fond. » — the scale draws itself; the camera glides down it
  shot(t.eau - 0.3, 0.9, SCALE_TOP, "sine.inOut");
  st(t.eau - 0.1, 1.0, { depth: 1 }, "power2.inOut");
  shot(t.eau + 0.6, t.laChambre - 0.2 - t.eau - 0.6, SCALE_LOW, "sine.inOut");
  chip("chip-bar", null, ...TOP, t.bar - 0.16, t.laChambre - 0.45); // gone before the cut (the face reaches the top slot)

  // « La chambre pousse pareil : rien ne bouge. » — the green arrows grow out to meet the red ones on « pareil »
  // (retouche 13/11: the 0.5 s swing from the scale back to the face read as a jolt → a cut inside the place, a few frames
  // before « La chambre », matched on the machine)
  D.cut(t.laChambre - 0.2, null, FRONT_BACK); // « La » ≈ chambre − 0.15
  st(t.laChambre, t.pareil - t.laChambre, { hold: 1 }, "power2.out");
  st(t.pareil, 0.35, { mood: 0, press: 1 }, "sine.inOut");
  chip("chip-pareil", null, ...TOP, t.pareil, t.torepos - 0.2);
  // the face goes back and is still on « bouge »; the camera stops dead with it
  st(t.pareil, t.bouge - t.pareil, { face: 0 }, "power2.out");
  shot(t.laChambre - 0.2, t.bouge - t.laChambre + 0.2, FRONT_STILL, "power2.out");
}
