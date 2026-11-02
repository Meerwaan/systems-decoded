// 02 · AUTOPSIE — « Alors… on l'ouvre. » (21,82) → `tozero` (46,38).
//
// Act 1 leaves the ND close, the red square on it. This act opens on that same picture (a cut that only says the
// whole state), and on « Alors… » the camera pulls back out of the deck, through the crown of glass: the forward
// fuselage, the system lit in it, the sky gone veille. Cut to the bench on its pool, the same system gathered; on
// « on » it comes apart. Then each part the voice names has its shot and its gesture:
//   « une antenne »        the upper antenna, lifted over the processor, lights up
//   « interroge… chaque seconde »  its ring leaves for the other plane's transponder, one a second: the camera
//                          follows it left until both antennas share the frame
//   « Son transpondeur répond »   the peer, close: its thread of signal, its reply coming back
//   « au cœur, le calculateur »   cut, following the reply into the processor: its gauge, its LED
//   « mesure… le temps »   the gauge fills to a minute, then empties: the header reads the same seconds
// The rest (« comment il attend »): the system closes up; one frame holds the two screens and the speaker — silent
// above 48 s, the TA circle and « traffic » at 48, the red square, the green arc and the spoken order at 35. Then
// up to the antenna: its sector toward the other machine lights on « écoute ». The threshold does not stop the film:
// from the antenna the camera is already on its way to the other plane's transponder — the threat — and act 3
// cuts from there to the sky, the other plane where the peer was.
import { setAct } from "@kit/overlay.js";
import { followCall } from "@kit/blocks.js";
import { glide } from "@kit/direct.js";
import { SET, VIEW, BENCHED, STAGED } from "./world.js";

/* ── in the sky ── */
// « Alors… »: a short, slow pull back from the ND, inside the deck (it never crosses the glass of the deck: the
// pull out through the crown streaked the whole frame at 22,03 on the draft)
const NDBACK = { ...VIEW.nd, d: 100, el: 16 };

/* ── on the bench (the processor at the origin; az −40 is the bench's camera) ── */
// the exploded view: the column (antennas, processor), the transponder and the screens — the peer left out of it
const EXPL = { ...VIEW.exploded, tx: 6.9, ty: 6, tz: 5.8, d: 470, shift: 150, side: 28 };
// the upper antenna, lifted (+30) over the processor
const ANT_UP = { ...VIEW.antBench, tx: 0, ty: 56, tz: 0, d: 210, el: 20, shift: 40 };
// both antennas in one frame, level: yours (right) and the peer's (left), the rings between them
const PAIR = { ...VIEW.exploded, tx: -35.1, ty: 50, tz: -36, d: 460, az: -40, el: 14, shift: 0 };
const PEER = { ...VIEW.peerBench, d: 175, shift: 170 };
const CPU = VIEW.cpuBench;
// gathered: the ND (the symbol), the PFD (the arcs) and the speaker over them, in one frame — far enough for the
// speaker to stay under the header and the screens over the captions
const PANEL = { ...VIEW.ndBench, tx: 6, ty: -2.5, tz: 36.4, d: 235, az: -40, el: 14, shift: 115 };
// the upper antenna, gathered, from above: its four sectors
const ANT = VIEW.antBench;
// the threshold: from the antenna, back until the other plane's transponder is in the frame with it, the rings
// flowing to it — then on toward it, still moving when act 3 cuts
const PEER_END = { ...VIEW.peerBench, d: 240, el: 14, shift: 120 };

// the light: what it stands around, and how wide
const L_BENCH = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs };
const L_PEER = { fx: -29, fy: 20, fz: -31, fs: BENCHED.fs * 1.8 };

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const A = world.system.A;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode",
    antenne: "eAntenne", interroge: "eclate:interroge", seconde: "eSeconde",
    transp: "eTransp", repond: "eclate:répond", coeur: "eCoeur", mesure: "eclate:mesure", temps: "eTemps", eclateEnd: "eclate$",
    repos: "repos", a48: "repos:48#2", ta: "rTA", taEnd: "repos:traffic#2$", ra: "rRA", ordonne: "repos:ordonne",
    mais: "rMais", ecoute: "rEcoute", reposEnd: "repos$",
    seuil: "seuil", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── « Alors… » — out of the deck, the system lit in the fuselage ───────────── */
  // the same picture as act 1's last one: this cut only says the whole state
  cut(t.ouvre, SET.SKY, VIEW.nd, { ...STAGED, gap: 190, level: 3, ra: 1, level2: 3, ra2: -1, tau: 35, obey: 5, cores: 1, ping: 0, crew: 0 });
  st(t.ouvre + 0.12, 0.5, { crew: 1 }, "sine.out"); // acte1 hands over with the captain faded: he comes back as we pull out
  st(t.ouvre + 0.02, 0.3, { mood: 0 }, "sine.inOut");
  st(t.ouvre + 0.02, t.tobench - t.ouvre - 0.04, { shell: 0.5 }, "sine.inOut");
  shot(t.ouvre + 0.02, t.tobench - t.ouvre - 0.02, NDBACK, "sine.inOut");

  /* ───────────── « …on l'ouvre. » — the bench; it comes apart on « on » ───────────── */
  cut(t.tobench, SET.BENCH, VIEW.whole, { ...BENCHED, tau: 35, level: 3, ra: 1, vs: 0, obey: 5 });
  st(t.explode, 1.1, { explode: 1 }, "power2.out");
  shot(t.explode, t.antenne - 0.12 - t.explode, EXPL, "sine.inOut");

  /* ───────────── « Sur ton fuselage, une antenne interroge l'autre avion, chaque seconde. » ───────────── */
  // a cut in, on the same axis, a few frames before « antenne » (the 0,6 s push from the exploded view jerked at 24,8)
  cut(t.antenne - 0.1, null, { ...ANT_UP, d: 240 });
  shot(t.antenne - 0.08, t.interroge + 0.25 - (t.antenne - 0.08), ANT_UP, "sine.inOut");
  st(t.antenne, 0.3, { litAnt: 1 }, "power2.out");
  const cAnt = co.add({ title: "Antenne", x: 640, y: 1010, align: "start", tone: "system", anchor: A.top });
  cAnt.show(tl, t.antenne);
  st(t.interroge, 0.3, { ping: 1 }, "power2.out");
  chip("chip-1030", null, 96, 470, t.interroge + 0.05, t.transp - 0.3);
  // follow the ring to the other plane's transponder: both antennas in one frame
  shot(t.interroge + 0.25, t.transp - 0.4 - (t.interroge + 0.25), PAIR, "sine.inOut");
  st(t.interroge + 0.25, t.transp - 0.4 - (t.interroge + 0.25), L_PEER, "sine.inOut");
  cAnt.hide(tl, t.interroge + 0.2);

  /* ───────────── « Son transpondeur répond. » ───────────── */
  shot(t.transp - 0.4, t.repond + 0.2 - (t.transp - 0.4), PEER, "sine.inOut");
  st(t.transp, 0.3, { litPeer: 1 }, "power2.out");
  st(t.transp, 0.4, { litAnt: 0 }, "sine.inOut");
  const cPeer = co.add({ title: "Son transpondeur", x: 560, y: 1120, align: "start", tone: "danger", anchor: A.peer });
  cPeer.show(tl, t.transp);
  chip("chip-1090", null, 96, 470, t.repond, t.coeur - 0.42);
  const toCpu = t.coeur - 0.26; // a few frames before « Et »: the reply's head has gone down the coax
  cPeer.hide(tl, toCpu - 0.3);

  /* ───────────── « Et au cœur, le calculateur mesure… le temps avant le point le plus proche. » ───────────── */
  cut(toCpu, null, CPU, { litPeer: 0, litAnt: 0, ...L_BENCH });
  shot(toCpu + 0.02, t.eclateEnd + 0.1 - toCpu, { ...CPU, d: 124 }, "sine.inOut");
  st(t.coeur, 0.3, { litCpu: 1 }, "power2.out");
  chip("chip-coeur", null, 96, 470, t.coeur, t.eclateEnd + 0.05);
  // it measures: the gauge fills to a minute — then the seconds run out, the header with it, down to 48 on « 48 »
  st(t.mesure, 0.45, { tau: 60 }, "power2.out");
  st(t.temps, t.a48 - t.temps, { tau: 48 }, "none");
  punch(t.temps, 0.06);

  /* ───────────── the rest: « Au-dessus de 48 secondes, il se tait. À 48 : traffic, traffic. À 35, il ordonne. » ───────────── */
  // a few frames before the sentence: the system closed up, the screens and the speaker
  const toPanel = t.repos - 0.08;
  cut(toPanel, null, PANEL, { explode: 0, litCpu: 0, level: 0, ra: 0, talk: 0 });
  shot(toPanel + 0.02, t.mais - 0.2 - toPanel, { ...PANEL, d: 220 }, "sine.inOut");
  // at 48 s: the intruder becomes the TA circle (the blip in the breath), the speaker says « traffic »
  const taAt = t.a48 + 0.54;
  st(taAt, 0, { level: 2 });
  st(t.ta - 0.08, 0.15, { talk: 1 }, "power2.out");
  st(t.taEnd, 0.3, { talk: 0 }, "sine.inOut");
  st(taAt, t.ra - taAt, { tau: 35 }, "none");
  // at 35: the red square, the green arc, and the order spoken
  st(t.ra, 0, { level: 3, ra: 1 });
  st(t.ordonne - 0.06, 0.15, { talk: 1 }, "power2.out");
  st(t.mais + 0.1, 0.4, { talk: 0 }, "sine.inOut");
  punch(t.ordonne, 0.06);

  /* ───────────── « Mais avant de te dire monte… il écoute l'autre machine. » ───────────── */
  // a cut on « Mais » (the glide from the panel up to the antenna jerked at 40,6), then a slow push
  cut(t.mais - 0.1, null, { ...ANT, d: 150 });
  shot(t.mais - 0.08, t.ecoute - 0.15 - (t.mais - 0.08), ANT, "sine.inOut");
  st(t.ecoute, 0.4, { beam: 1 }, "power2.out");

  /* ───────────── SEUIL « Abonne-toi : ces 35 secondes, on les joue en entier. » — already on the way to the threat ───────────── */
  const go = t.reposEnd + 0.12;
  const turn = t.seuil + 1.6;
  shot(go, turn - go, PAIR, glide(0.4, 0.9));
  shot(turn, t.tozero - turn, PEER_END, glide(1.1, 1.3), PAIR.d);
  st(go, t.tozero - go, L_PEER, "sine.inOut");
  st(t.seuil + 0.4, 0.6, { litPeer: 1 }, "sine.inOut");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
}
