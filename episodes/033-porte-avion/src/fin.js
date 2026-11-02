// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier.
//   chute        « là-haut, ce n'est pas un verrou qui ferme ta porte. C'est l'air. Plus tu montes… plus elle est
//                fermée. » — outside, door 1L on the flank of the climbing A330: `alt` climbs, the header's « Sur la
//                porte » with it, the door sinks on its stops (retitle: « Un verrou » struck → « L'air »)
//   comment      the C of the hook, paid: Korea — on the approach `alt` falls to 200 m, the arrows die by themselves,
//                and in the cabin a seated passenger lifts the lever: the door swings OUT. Then the question, as a duel
//   like         you, seated by that door, your hand letting go of the armrest
//   abo          the next file, last: the recorder in the tail cone, then on the sea bed on its halo. Nothing of the
//                door after that; the voice does not ask to subscribe: the panel carries it
//   boucle       back to the first frame: the neighbour pulling at the door, low, in profile
// A title or a panel has finished leaving BEFORE the cut that follows it. Every instant is a cue of the script.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, POSE0 } from "./world.js";
import { DOOR_AT, DOOR, RECORDER, AIR } from "./plan.js";

const [DX, DY, DZ] = DOOR_AT;
const MIDY = DY + DOOR.open.h / 2;
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

/* chute — outside, the door of three quarters, low under the title (#retitle ends at y ≈ 790) */
const PITCH = 3; // the climb's attitude: the plane turns about its origin, door 1L (x ≈ −24 m) rises with it
const LIFT = -DX * Math.sin((PITCH * Math.PI) / 180);
const OUT = { ...VIEW.doorOut, ty: VIEW.doorOut.ty + LIFT, d: 1500, shift: -50 };
const OUT_END = { d: 1340, az: -30, el: -6, shift: -45 };
const L_OUT = { fx: DX, fy: MIDY + LIFT, fz: DZ, fs: 320 };

/* comment · Korea — the approach (the door on the flank, the runway ahead), then the cabin: the seated passenger */
// the runway does not read from afar (vol.js: two lamps): the door of three quarters, the nose gear down under it
const APPROACH = { ...P, tx: DX - 80, ty: -150, tz: DZ, d: 1250, az: -28, el: -3, fov: 32, shift: 30 };
const APPROACH_END = { d: 1150, az: -22 };
const L_APPROACH = { fx: DX, fy: MIDY, fz: DZ, fs: 1500 };
// nearly square to the door, low (a camera near the ceiling catches the L03's light bars): the leaf slides out of its frame
const KOREA = { ...P, tx: DX + 20, ty: DY + 76, tz: DZ - 20, d: 420, az: 168, el: 4, fov: 42, shift: -10 };
const KOREA_END = { d: 400, az: 166 };
const L_KOREA = { fx: DX, fy: MIDY, fz: DZ, fs: 250 };

/* comment · the question — at cruise, the seat by the door, empty; the door pressed, the arrows dense */
const SEAT = { ...P, ...VIEW.you, d: 720, shift: 30, side: 110 };
const SEAT_END = { d: 660, az: 111, side: 115 };

/* like — from your hand on the armrest (it lets go), back to you seated and the door beyond, left of the buttons */
const YOU = { ...P, tx: -2170, ty: DY + 76, tz: 235, d: 170, az: 105, el: 30, fov: 36, shift: 0, side: 0 };
const YOU_HOLD = { d: 160 }; //  close on the hand while it lets go (« pour quelqu'un »), above the captions
const YOU_END = { tx: -2280, ty: DY + 76, tz: 250, d: 380, az: 97, el: 16 };
const L_YOU = { fx: -2160, fy: DY + 70, fz: 230, fs: 220 };

/* abo — the recorder in the tail cone, then on the sea bed at cruise (vol.js · seabedOf(11 300) ≈ −43 350) */
const [RX, RY, RZ] = RECORDER.at;
const TAIL = { ...P, ...VIEW.tail, d: 600, shift: -60 };
const TAIL_END = { d: 500, az: -46 };
const L_TAIL = { fx: RX, fy: RY, fz: RZ, fs: 160 };
const BED = { ...P, tx: RX + 1400, ty: -43350, tz: RZ, d: 760, az: -40, el: 32, fov: 34, shift: -60 };
const BED_END = { d: 640, az: -34 };
const L_BED = { fx: RX + 1400, fy: -43350, fz: RZ, fs: 300 };

/* boucle — the first frame, a little further and turned: the way back is one move, no stop at `rewind` */
const AWAY = { ...POSE0, d: 480, az: 110, el: -11 };
const MID = { d: 436, az: 114.4, el: -12.6 }; // where the move stands at `rewind`: same speed on both sides (sine.in → sine.out)

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", secret: "secret", pas: "verdict", air: "cestAir", montes: "montes", fermee: "fermee",
    tocta: "tocta", posait: "posait", metres: "metres", presque: "comment:presque", levier: "levier", suffi: "suffi",
    commentaire: "commentaire", prends: "prends", jamais: "jamais",
    like: "like", pour: "like:pour", porte: "like:porte", likeEnd: "like$",
    abo: "abo", prochain: "prochain", noire: "noire", attendu: "attendu", fond: "fond", atlantique: "abo:l'Atlantique", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });

  /* ── CHUTE: the plane climbs, the air closes the door ── */
  cut(t.toverdict, SET.VOL, OUT, { ...STAGED, alt: 3000, ahead: 0.05, pitch: PITCH, cabin: 1, shell: 1, voisin: 0, air: 1, stops: 1, mood: 0, ...L_OUT });
  shot(t.toverdict, t.tocta - t.toverdict, OUT_END, "sine.inOut");
  st(t.toverdict, t.tocta - t.toverdict, { ahead: 0.035 }, "none");
  st(t.secret, t.fermee - t.secret, { alt: AIR.cruise }, "sine.in"); // slow on « là-haut », fast on « plus tu montes »
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.air - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  D.punch(t.pas, 0.05);
  D.punch(t.air, 0.06);

  /* ── COMMENT 1: « Et la Corée ? L'avion se posait. À environ deux cents mètres… » — the approach ── */
  cut(t.tocta, SET.VOL, APPROACH, { ...STAGED, alt: 1500, ahead: 0.05, shell: 1, cabin: 1, voisin: 0, you: 0, gear: 1, runway: 1, air: 1, stops: 0.5, mood: 1, ...L_APPROACH });
  shot(t.tocta, t.presque - 0.12 - t.tocta, APPROACH_END, "sine.inOut");
  st(t.tocta, t.presque - 0.12 - t.tocta, { ahead: 0.03 }, "none");
  st(t.posait, t.metres - t.posait, { alt: 200 }, "sine.inOut"); // the arrows die by themselves; the header falls to 200 m, ≈ 0 t

  /* ── COMMENT 2: « …presque plus rien ne plaquait la porte : le levier a suffi. » — the seated passenger, the door out ── */
  const toKorea = t.presque - 0.12;
  cut(toKorea, SET.VOL, KOREA, { ...STAGED, alt: 200, shell: 0.3, voisin: 0, you: 0, pax: 0.5, seated: 1, gear: 1, air: 1, stops: 0.3, mood: 1, ...L_KOREA });
  shot(toKorea, t.commentaire - 0.12 - toKorea, KOREA_END, "sine.inOut");
  st(t.levier - 0.1, 0.5, { seated: 2 }, "sine.inOut");
  st(t.levier + 0.1, t.suffi - t.levier, { handle: 1, hooks: 1 }, "power2.inOut");
  st(t.suffi, 0.36, { open: 0.7 }, "power2.out"); // the impact of sfx at suffi + 0.36
  chip("chip-coree", null, 96, 470, toKorea + 0.08, t.commentaire - 0.32);

  /* ── COMMENT 3: « En commentaire : la place près de la porte… tu la prends, ou jamais ? » ── */
  const toSeat = t.commentaire - 0.12;
  cut(toSeat, SET.VOL, SEAT, { ...STAGED, alt: AIR.cruise, ahead: 0.05, voisin: 0, you: 0, pax: 0.35, air: 1, stops: 0.5, mood: 0 });
  shot(toSeat, t.like - 0.12 - toSeat, SEAT_END, "sine.inOut");
  duelCall(tl, { from: toSeat + 0.08, word: t.commentaire, aAt: t.prends, bAt: t.jamais, to: t.like - 0.45, toneA: "veille", toneB: "signal" });
  D.punch(t.jamais, 0.05);

  /* ── LIKE: « Like : pour quelqu'un qui n'ose pas s'asseoir près de cette porte. » ── */
  const toYou = t.like - 0.12;
  cut(toYou, SET.VOL, YOU, { ...STAGED, alt: AIR.cruise, ahead: 0.05, voisin: 0, you: 1, grip: 1, pax: 0.35, air: 1, stops: 0.5, mood: 0, ...L_YOU });
  const back = t.pour + 0.9; // the hand has let go: back to you and the door, which lands on « porte »
  shot(toYou, back - toYou, YOU_HOLD, "sine.inOut");
  shot(back, t.abo - 0.12 - back, YOU_END, "sine.inOut");
  st(t.pour, 0.9, { grip: 0 }, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ── PROCHAIN DOSSIER: « la boîte noire. Elle a attendu presque deux ans au fond de l'Atlantique. » ── */
  const toTail = t.abo - 0.12;
  cut(toTail, SET.VOL, TAIL, { ...STAGED, alt: AIR.cruise, ahead: 0.05, shell: 1, cabin: 0, voisin: 0, you: 0, air: 0, recorder: 1, mood: 1, ...L_TAIL });
  shot(toTail, t.attendu - 0.12 - toTail, TAIL_END, "sine.inOut");
  st(t.noire + 0.4, t.attendu - 0.16 - (t.noire + 0.4), { recorder: 1.006 }, "power2.in"); // it slips out of the cone, down into the dark
  const toBed = t.attendu - 0.12;
  cut(toBed, SET.VOL, BED, { ...STAGED, alt: AIR.cruise, ahead: 0.05, shell: 1, cabin: 0, voisin: 0, you: 0, air: 0, recorder: 2, mood: 1, ...L_BED });
  shot(toBed, t.toloop - toBed, BED_END, "sine.inOut");
  D.punch(t.atlantique, 0.05);
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: « Deux ans… depuis le jour où… » → « Ton voisin force la porte » ── */
  cut(t.toloop, D.first.set, AWAY, { ...STAGED, ...numbers(D.first) });
  shot(t.toloop, t.rewind - t.toloop, MID, "sine.in");
  D.loop({ at: t.toloop, rewindAt: t.rewind, ease: "sine.out" });
}
