// DOSSIER 020 — the chute, what the film still owes, the calls to action, the loop (toverdict → the end).
//   chute        ONE shot (the title crosses no cut): the cage, aboard, in the typhoon — the ball in the middle, you on the
//                left, bent on the rail. "Tient la tour" comes with "secret", struck on "empêche"; on "La tour tient
//                seule" the skeleton lights up around the cage from the bottom up and the ball turns to glass a moment:
//                the columns carry. On "d'abord" you straighten while the camera closes in; "Ton confort" lands on
//                "confort", with the header's verdict, and the light turns veille.
//   ce qui est dû  "Et les séismes ?" — a calm day, the tower from its foot: on "séismes" the ground shakes (short, never
//                close) · the dampers, three quarters low: on "brident" their collars close, the ball makes one small
//                swing and the header says 20 on "vingt" · the same foot of the tower, its glass at half: on "squelette"
//                the columns rise veille, on "encaisse" the ground stops — the tower never left its plumb line
//   commentaire  you at the window in the typhoon, the ball going and coming behind you: "tu montes ?" → JE MONTE
//   like         the whole tower on a calm day, straight on its plumb line: on "bouge" the typhoon comes and it leaves it
//   prochain     the bench, the system whole under the next file, the ball swinging quietly — the LAST thing said
//   boucle       the top in the typhoon, from a little further than the first frame: the sway, set just BEFORE the first
//                frame's phase, runs straight into it — at the same speed on both sides of "rewind" (D.loop in "none")
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, CAGE, BALL } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));
const [CX, CY, CZ] = CAGE.at;
const HEART = CY + BALL.at[1];

/* chute — the cage whole, aboard; the push on "d'abord" closes in on you and the ball */
const CHUTE = { ...VIEW.cage };
const CHUTE_END = { d: 3300, tx: -200, ty: CY + 520, tz: 60, shift: 120 };
const L_CAGE = { fx: CX, fy: HEART, fz: CZ, fs: 900 };

/* séismes — the tower from its foot (VIEW.low, further and lower: the crown out of the header) */
const LOW = { ...P, tx: 0, ty: 6400, tz: 0, d: 12500, az: -28, el: -30, fov: 55, shift: -120 }; // the eye 1.5 m above the ground, the crown under the header
const L_LOW = { fx: 0, fy: 6200, fz: 0, fs: 6000 };

/* bride — the dampers, three quarters low (from above, the cage's glass floors veil their bodies) */
const BRIDLE = { ...P, tx: 40, ty: CY + 190, tz: 100, d: 2600, az: -40, el: 16, shift: 170 };
const BRIDLE_END = { d: 2350 };
const L_DAMPERS = { fx: CX, fy: CY + 170, fz: CZ, fs: 320 };

/* commentaire — you at the window, the ball behind you */
const YOU_SHOT = { ...VIEW.you };

/* like — the whole tower, the city at its foot */
// (the top half, under the #net panel: the whole tower is 110 px wide and its lean 40 px — here the crown travels ≈ 250 px)
const TOWER = { ...P, tx: 0, ty: 10500, tz: 0, d: 14000, az: -32, el: 3, fov: 36, shift: -180 };
const L_TOWER = { fx: 0, fy: 10000, fz: 0, fs: 3000 };

/* prochain — the system whole on the bench, under the panel */
const ABO = { ...P, tx: 0, ty: 640, tz: 0, d: 6600, az: -36, el: 8, shift: -90 };
const ABO_END = { ...ABO, d: 5600, shift: -110 };

/* boucle — a little further than the first frame; the sway runs at RATE half-swings a second into it */
const RATE = 0.25;

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "secret", deny: "deny", stands: "chute:tient-0.3", alone: "alone", abord: "abord", verdict: "verdict",
    tocta: "tocta", quakes: "quakes", tobridle: "comment:séismes$+0.12", bridle: "bridle", c20: "c20",
    toskel: "comment:C'est-0.12", skeleton: "skeleton", takes: "takes", tocomment: "comment:encaisse$+0.08",
    ask: "ask", answer: "answer",
    tolike: "tolike", like: "like", believes: "believes", nomove: "nomove", likeEnd: "like$",
    toabo: "toabo", tgv: "tgv", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });

  /* ── CHUTE: "Voilà son secret : cette boule n'empêche pas la tour de tomber. La tour tient seule. La boule est là… d'abord pour ton confort." ── */
  cut(t.toverdict, SET.TOWER, CHUTE, { ...STAGED, aboard: 1, reach: 40, storm: 0.8, grip: 1, swing: 0.5, ...L_CAGE });
  // the storm goes on: the ball keeps its slow swing in the cage while the voice talks
  st(t.toverdict, t.tocta - t.toverdict, { swing: 0.5 + RATE * (t.tocta - t.toverdict) }, "none");
  retitle(tl, { showAt: t.secret + 0.1, strikeAt: t.deny, swapAt: t.verdict, hideAt: t.tocta - 0.42 });
  // "La tour tient seule": the skeleton, from the bottom up — and the ball, a moment of glass: it is not what carries
  st(t.stands, t.alone + 0.4 - t.stands, { bones: 1 }, "sine.inOut");
  st(t.alone - 0.1, 0.45, { xray: 0.7 }, "sine.out");
  st(t.alone + 0.9, 0.6, { xray: 0 }, "sine.inOut");
  // "d'abord pour ton confort": you straighten, the camera closes in on you and the ball
  shot(t.abord - 0.3, t.tocta - t.abord + 0.25, CHUTE_END, "sine.inOut", CHUTE.d);
  st(t.abord, 0.9, { grip: 0 }, "sine.inOut");
  st(t.verdict, 0.3, { mood: 0 }, "sine.out");
  D.verdict(t.verdict);

  /* ── SÉISMES: "Et les séismes ?" — a calm day, the tower from its foot ── */
  cut(t.tocta, SET.TOWER, LOW, { ...STAGED, storm: 0, bend: 0, reach: 0, swing: 0.5, city: 1, you: 0, mood: 1, ...L_LOW });
  shot(t.tocta, t.tobridle - t.tocta, { d: LOW.d * 0.96 }, "none");
  st(t.quakes, 0.35, { quake: 1 }, "power2.out");

  /* ── BRIDE: "Là, ses vérins la brident : vingt centimètres, son record en séisme." ── */
  cut(t.tobridle, SET.TOWER, BRIDLE, { ...STAGED, storm: 0, bend: 0, reach: 0, swing: 0.5, city: 1, you: 0, aboard: 1, xray: 0.85, quake: 0.3, mood: 1, ...L_DAMPERS });
  shot(t.tobridle, t.toskel - t.tobridle, BRIDLE_END, "sine.inOut", BRIDLE.d);
  st(t.bridle, 0.5, { lock: 1 }, "power2.out");
  // one small swing, at the end of its course on "vingt": the header says 20
  st(t.bridle, t.c20 + 0.1 - t.bridle, { swing: 1, reach: 20 }, "sine.inOut");
  chip("chip-seisme", null, 96, 470, t.c20, t.toskel - 0.2);

  /* ── SQUELETTE: "C'est le squelette de la tour qui encaisse." — the same foot of the tower, its glass at half ── */
  cut(t.toskel, SET.TOWER, { ...LOW, d: LOW.d * 0.96 }, { ...STAGED, storm: 0, bend: 0, reach: 20, swing: 1, city: 1, you: 0, shell: 0.4, axis: 1, quake: 1, mood: 1, ...L_LOW });
  shot(t.toskel, t.tocomment - t.toskel, { d: LOW.d * 0.9 }, "none");
  st(t.skeleton, t.takes - t.skeleton, { bones: 2 }, "sine.inOut");
  st(t.takes, 0.5, { quake: 0, mood: 0 }, "sine.out");
  chip("chip-squelette", null, 96, 470, t.skeleton + 0.1, t.tocomment - 0.2);

  /* ── COMMENTAIRE: "En commentaire : un jour de typhon… tu montes ?" — you at the window, the ball behind you ── */
  cut(t.tocomment, SET.TOWER, YOU_SHOT, { ...STAGED, aboard: 1, swing: 0.5 });
  st(t.tocomment, t.tolike - t.tocomment, { swing: 0.5 + RATE * (t.tolike - t.tocomment) }, "none");
  shot(t.tocomment, t.tolike - t.tocomment, { d: YOU_SHOT.d * 0.94 }, "none");
  commentCall(tl, { from: t.ask, typedAt: t.answer, chars: 8, to: t.tolike - 0.3 });

  /* ── LIKE: "Like : quelqu'un croit encore qu'une tour ne bouge pas." — straight on its plumb line, then it leaves it ── */
  cut(t.tolike, SET.TOWER, TOWER, { ...STAGED, storm: 0, bend: 0, reach: 0, swing: 0, city: 1, axis: 1, you: 0, mood: 1, ...L_TOWER });
  st(t.nomove, t.likeEnd + 0.1 - t.nomove, { swing: 0.5, bend: 3, storm: 0.6, reach: 30 }, "sine.inOut");
  st(t.likeEnd + 0.1, t.toabo - t.likeEnd - 0.1, { swing: 0.5 + RATE * (t.toabo - t.likeEnd - 0.1) }, "none");
  likeCall(tl, { from: t.like, to: Math.min(t.likeEnd + 0.12, t.toabo - 0.3), count: 5, label: (n) => `${n} personnes` });

  /* ── PROCHAIN DOSSIER: "Prochain dossier : un TGV à 255 kilomètres-heure… et dans la cabine, plus personne." ── */
  cut(t.toabo, SET.BENCH, ABO, { ...BENCHED, litBall: 0.5, reach: 25, swing: 0.5 });
  shot(t.toabo, t.toloop - t.toabo, ABO_END, "sine.inOut", ABO.d);
  st(t.toabo, t.toloop - t.toabo, { swing: 0.5 + RATE * (t.toloop - t.toabo) }, "none");
  nextFile(tl, { showAt: t.toabo + 0.04, factAt: t.tgv, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: "Et là, pas besoin d'un…" — back to the first frame ── */
  const first = numbers(D.first);
  const far = D.pose0.d * 1.22;
  const swing0 = first.swing - RATE * (D.tEnd - t.toloop);
  cut(t.toloop, D.first.set, { ...D.pose0, d: far }, { ...first, swing: swing0 });
  st(t.toloop, t.rewind - t.toloop, { swing: first.swing - RATE * (D.tEnd - t.rewind) }, "none");
  shot(t.toloop, t.rewind - t.toloop, { d: far * 0.98 }, "none");
  // from "besoin" the camera comes back to POSE0 and the sway glides into FIRST at the same speed (ease "none")
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: far * 0.98, ease: "none" });
}
