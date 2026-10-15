// 02 · AUTOPSIE — from "Alors…" to the cut of act 3 (tosystem → tozero).
//
// Act 1 leaves the system alone in what is left of the tower (VIEW.system). "Alors…" holds it there; on the cut it
// stands on the bench at the same place of the picture (benchCut), and on "on" it comes apart — the dampers out in a
// star, the frame and the cables up, the ring down — while the camera pulls back to the whole exploded view.
// Then each part the voice names has its gesture: the ball lights up as the camera closes on it, and on "41" it
// opens into its stack of plates, welded back on "soudées"; on "92" a head of light climbs the cables and the camera
// rises with it; on "Huit" the camera drops under the ball (glass now) to the dampers; on "autour" everything comes
// home while the camera goes down to the ring, the pin standing on its rest.
// "C'est un pendule" : square on, it swings — the pin comes and goes in its ring, the header counts its reach.
// "La tour part…" : a cut into the tower, the camera standing in the world — the cage runs right, the ball hangs back
// (held a breath on "traîne"), then pulls the tower in: the light climbs the cables, the tower arrives less far.
// "…ses vérins changent l'élan en chaleur" : a cut aboard, low under the ball — the damper being closed glows on its
// word, then the heat rises off them and the camera closes in.
// The threshold does not stop the film: the camera pulls back from the dampers to the hook's own picture — you at the
// window, the ball sliding behind you — while the typhoon comes back and the header answers "boule". Act 3 cuts there.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, POSE0, CAGE, SIZE } from "./world.js";

const [CX, CY, CZ] = CAGE.at;
const HEART = CY + 470; // the ball's centre in the tower (BALL.at[1])
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };

/* ── on the bench (the system's floor on the origin) ── */
// the whole exploded view (seen on the set's sheet with `plates` 1: top ≈ 453 px, bottom ≈ 1280)
const EXPLODED = { ...P, tx: 0, ty: 700, tz: 0, d: 7000, az: -36, el: 8, shift: 170 };
// the ball, lifted by the exploded view (+200), and room above it for its stack of plates (+96)
// (nearly on an axis: the two V of cables in front of it stand either side of its centre, not across it)
const BALL = { ...P, tx: 0, ty: 790, tz: 0, d: 3700, az: -8, el: 8, shift: 140 };
// the cables, from the cradle to their mounts (lifted +120), seen a little from below
const CABLES = { ...P, tx: 0, ty: 980, tz: 0, d: 3500, az: -40, el: -4, shift: 150 };
// the dampers, out in their star, under the ball turned to glass
const DAMP = { ...P, tx: 0, ty: 170, tz: 0, d: 3700, az: -36, el: 16, shift: 150 };
// the ring and the pin at its centre, three quarters from above (the ball and its cradle glass)
const RINGV = { ...P, tx: -60, ty: 130, tz: 0, d: 1500, az: -30, el: 22, shift: 150 };
// the pendulum, almost square on: the swing reads at its widest
const SWINGV = { ...P, tx: 0, ty: 560, tz: 0, d: 4400, az: -14, el: 5, shift: 170 };

/* ── in the tower (world space) ── */
// the cage in the tower, the camera standing in the world: the tower travels in the picture
// …nearly square on and near enough for the ball's lag (60 cm) to read against its cage and its ring
const CAGEV = { ...P, tx: 0, ty: CY + 400, tz: 0, d: 3300, az: -18, el: 10, fov: 30, shift: 150 };
// the dampers, low, from three quarters, aboard (the cage holds still): then near, for the heat
const DAMP_T = { ...P, tx: 40, ty: CY + 170, tz: 100, d: 1900, az: -40, el: 8, shift: 150 };
const DAMP_NEAR = { ...DAMP_T, d: 1350, ty: CY + 190 };
// where the threshold's pull-back ends: the hook's own picture, a little wider — you at the window, the ball behind
const HOOKBACK = { ...POSE0, tx: -240, d: 3000, drift: 0.3 };

// the light: what it stands around, and how wide
const L_WIDE = { fx: 0, fy: 640, fz: 0, fs: 900 };
const L_BALL = { fx: 0, fy: 700, fz: 0, fs: 420 };
const L_CABLES = { fx: 0, fy: 900, fz: 0, fs: 700 };
const L_DAMP = { fx: 0, fy: 160, fz: 0, fs: 700 };
const L_RING = { fx: 0, fy: 130, fz: 0, fs: 320 };
const L_SWING = { fx: 0, fy: 520, fz: 0, fs: SIZE };
const L_CAGE = { fx: CX, fy: HEART, fz: CZ, fs: 900 };
const L_DAMP_T = { fx: CX + 40, fy: CY + 170, fz: CZ + 100, fs: 320 };

export default function acte2({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    tosystem: "tosystem", tobench: "tobench", explode: "explode",
    p1: "p1", p2: "p2", plaques: "eclate:plaques", welded: "welded", p3: "p3", p4: "p4", around: "around", p5: "p5",
    torepos: "torepos", pendulum: "pendulum", leaves: "leaves", lags: "lags", holds: "holds", holdsEnd: "repos:retient$",
    each: "each", dampers: "dampers", heat: "heat",
    toseuil: "toseuil", seuil: "seuil", typhon: "seuil:typhon", boule: "seuil:boule", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.tosystem);

  /* ───────────── "Alors…" — the system alone, nothing left of the tower around it ───────────── */
  // (the same picture as act 1's last one: this cut only says the whole state)
  cut(t.tosystem, SET.TOWER, VIEW.system, {
    ...STAGED, shell: 0.15, storm: 0, city: 0, you: 0, axis: 0, bend: 0, reach: 0, swing: 0.5, aboard: 0, mood: 0,
    fx: CX, fy: CY + 520, fz: CZ, fs: 900,
  });

  /* ───────────── "…on l'ouvre." — the same system on the bench, at the same place; it comes apart on "on" ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: CAGE.at, state: { ...BENCHED, pool: 0, grid: 0 } });
  st(t.explode, t.p1 - 0.3 - t.explode, { explode: 1 }, "power2.out");
  const wide = t.p1 - 0.08 - (t.tobench + 0.03);
  shot(t.tobench + 0.03, wide, EXPLODED, "sine.inOut", bench.d);
  st(t.tobench + 0.03, wide, L_WIDE, "sine.inOut");

  /* ───────────── "Une boule de cinq mètres cinquante :" — it lights up, the camera closes on it ───────────── */
  const closeIn = t.p2 - t.p1;
  shot(t.p1, closeIn, BALL, "sine.inOut", EXPLODED.d);
  st(t.p1, closeIn, L_BALL, "sine.inOut");
  st(t.p1 + 0.1, 0.4, { litBall: 1 }, "sine.out");

  /* ───────────── "41 plaques d'acier soudées." — on "41" it opens into its plates; welded back on "soudées" ───────────── */
  st(t.p2 + 0.05, t.plaques + 0.3 - (t.p2 + 0.05), { plates: 1 }, "power2.out");
  st(t.welded, 0.55, { plates: 0 }, "power2.inOut");
  chip("chip-41", null, 96, 470, t.p2 + 0.05, t.p3 - 0.2);

  /* ───────────── "92 câbles." — a head of light climbs them, and the camera rises with it ───────────── */
  const climb = t.p4 - 0.12 - t.p3;
  st(t.p3 - 0.1, 0.3, { litBall: 0 }, "sine.inOut");
  st(t.p3, 0.3, { litCables: 1 }, "sine.out");
  st(t.p3 + 0.05, climb, { pull: 1 }, "sine.inOut");
  shot(t.p3, climb, CABLES, "sine.inOut");
  st(t.p3, climb, L_CABLES, "sine.inOut");
  chip("chip-92", null, 96, 470, t.p3 + 0.05, t.p4 - 0.15);

  /* ───────────── "Huit vérins." — down under the ball, glass now: the dampers light up ───────────── */
  const down = t.around - (t.p4 - 0.1);
  st(t.p4 - 0.1, 0.3, { litCables: 0, pull: 0 }, "sine.inOut");
  st(t.p4 - 0.05, 0.45, { xray: 0.9 }, "sine.inOut"); // (high above the dampers, it crosses the header: as faint as it goes)
  st(t.p4 + 0.05, 0.3, { litDampers: 1 }, "sine.out");
  shot(t.p4 - 0.1, down, DAMP, "sine.inOut");
  st(t.p4 - 0.1, down, L_DAMP, "sine.inOut");
  chip("chip-8", null, 96, 470, t.p4 + 0.05, t.around - 0.12);

  /* ───────────── "Et autour… un anneau de butée." — everything comes home; the pin on its rest, in its ring ───────────── */
  const home = t.p5 + 0.25 - t.around;
  st(t.around, t.p5 + 0.1 - t.around, { explode: 0 }, "sine.inOut");
  st(t.around - 0.05, 0.3, { litDampers: 0 }, "sine.inOut");
  shot(t.around, home, RINGV, "sine.inOut", DAMP.d);
  st(t.around, home, L_RING, "sine.inOut");
  st(t.p5, 0.35, { litRing: 1, datum: 1 }, "sine.out");
  chip("chip-150", null, 96, 470, t.p5 + 0.05, t.torepos - 0.15);

  /* ───────────── "C'est un pendule, accordé sur la tour." — square on: it swings, the pin comes and goes in its ring ───────────── */
  const cage = t.leaves - 0.12; // the next cut
  const pend = cage - t.torepos;
  shot(t.torepos, t.pendulum + 0.4 - t.torepos, SWINGV, "sine.inOut", RINGV.d);
  st(t.torepos, t.pendulum + 0.4 - t.torepos, { ...L_SWING, xray: 0 }, "sine.inOut");
  st(t.torepos, 0.3, { litRing: 0 }, "sine.inOut");
  st(t.torepos, 1.0, { reach: 60 }, "sine.inOut");
  st(t.torepos, pend, { swing: 2.5 }, "none"); // (from 0.5: right, back, left, back — it crosses its rest on the cut)
  chip("chip-pendule", null, 96, 470, t.pendulum, t.leaves - 0.25);

  /* ───────────── "La tour part d'un côté… la boule traîne, et la retient." — in the tower, standing in the world ───────────── */
  // (the tower's travel kept modest: 60 cm of lag against ±200 of travel reads; against ±420 it is lost)
  cut(cage, SET.TOWER, CAGEV, { ...STAGED, storm: 0.4, axis: 1, bend: 0.8, reach: 60, swing: 1.5, mood: 0, litBall: 1, datum: 1, ...L_CAGE });
  // "part": the tower leaves its left end and runs right — it reaches its axis on "traîne", the ball left behind
  st(t.leaves + 0.1, t.lags + 0.1 - (t.leaves + 0.1), { swing: 2 }, "sine.inOut");
  // "retient": the cables pull it in — the light climbs them, the tower arrives less far
  const after = Math.min(t.holdsEnd + 0.15, t.each - 0.3); // the next cut
  st(t.holds + 0.05, after - (t.holds + 0.05), { swing: 2.5, bend: 0.55 }, "sine.inOut");
  st(t.holds + 0.1, Math.max(0.4, after - 0.1 - (t.holds + 0.1)), { pull: 1 }, "sine.inOut");

  /* ───────────── "Et à chaque aller-retour, ses vérins changent l'élan en chaleur." — aboard, under the ball ───────────── */
  cut(after, SET.TOWER, DAMP_T, { ...STAGED, storm: 0.4, bend: 0.55, reach: 60, swing: 2.5, aboard: 1, xray: 0.6, mood: 0, ...L_DAMP_T });
  // it goes on swinging, at one pace, until act 3 cuts (it crosses its rest there: the tower at its end)
  st(after, t.tozero - after, { swing: 6 }, "none");
  st(t.dampers + 0.05, 0.35, { brake: 1 }, "sine.out");
  st(t.heat + 0.05, 0.9, { heat: 1 }, "sine.out");
  shot(t.heat - 0.35, t.toseuil + 0.1 - (t.heat - 0.35), DAMP_NEAR, "sine.inOut");
  chip("chip-chaleur", null, 96, 470, t.dampers, t.toseuil - 0.15);

  /* ───────────── the threshold — "Abonne-toi : ce typhon, regarde ce qu'il fait à la boule." ───────────── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: the camera pulls back from the
  // dampers to the hook's own picture while the typhoon comes back; the header answers "boule" (it waits: 30 cm).
  const go = t.tozero - 0.04 - (t.toseuil + 0.1);
  shot(t.toseuil + 0.1, go, HOOKBACK, "sine.inOut", DAMP_NEAR.d);
  st(t.toseuil + 0.1, go * 0.5, { brake: 0, heat: 0, xray: 0 }, "sine.inOut");
  st(t.toseuil + 0.2, go * 0.8, { aboard: 0 }, "sine.inOut");
  st(t.toseuil + 0.1, go, L_CAGE, "sine.inOut");
  st(t.typhon - 0.15, t.tozero - 0.04 - (t.typhon - 0.15), { storm: 1, bend: 1.4 }, "sine.inOut");
  st(t.typhon, 0.4, { mood: 1 }, "sine.inOut");
  st(t.boule, 0.4, { reach: 30 }, "sine.inOut");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
}
