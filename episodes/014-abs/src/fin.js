// DOSSIER 014 — the chute, the three calls to action, the loop (toverdict → the end).
//   chute        ONE push on the bench, under the title. The system whole, the wheel turning: the pedal goes down on
//                "freiner" (the fluid's light runs to the brake) — "Freine plus court" is struck on "court" · the camera
//                closes on the wheel and its brake, the tyre turns to glass · "plus loin": the unit lets the brake go
//                (its two coils light up, the wheel's line pales) · "en vie": the sensor's pulses run up the wire ·
//                "tourner": the wheel STEERS, toward us — "Te laisse tourner"; the account name lights up
//   like         the system whole under the panel, alive (glass wheel, lines lit, pulses); on "lève le pied" the pedal
//                comes up and the light leaves the brake
//   abonnement   the pedal goes down again on the word; the camera backs away and comes down to a low profile
//   commentaire  the hook's "mauvais réflexe" is paid. The same picture, in the car: the system where it lives, you
//                round it, the rain — and the camera dives through the glass to your foot · "veut relâcher": the foot
//                comes up · "Ne relâche pas": it goes down, for good · "tu écrases, tu tiens…": from behind, the truck
//                grows in your lane · "et tu tournes": the car changes lane, the truck goes by on your right — and the
//                question is asked over that picture
//   boucle       the road again, the car launched, the truck far ahead: the camera dives along the car to the front-left
//                wheel while the road runs under it (`gap` and `rolled` together, to the first frame's own) and your
//                foot goes down. The last frame IS the instant of the first.
// (Poses placed by projection — against the title, the panels, the chevrons and the captions — then looked at.)
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { moved } from "@kit/direct.js";
import { SET, BENCHED, STAGED, SYSTEM } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };

/* chute — the title's line ends at y 606, its shade at 840: everything that matters lies under it */
// the system whole: the wheel on the left, the unit behind it, the servo and the pedal on the right (x 141…813, y 666…1168)
const WHOLE = { ...P, tx: -6, ty: 42, tz: -6, d: 690, az: -44, el: 13, shift: 15, side: 45 };
const WHOLE_END = { d: 660, az: -42 };
// the wheel and its brake, the unit just right of it (wheel x 275…689, y 708…1206 · unit x 651…785, y 668…859)
const CORNER = { ...P, tx: -14, ty: 40, tz: -28, d: 540, az: -38, el: 17, shift: 45, side: -30 };
// the same, a little higher and more from behind: the wheel steers toward the lens (steered: x 225…728)
const TURNS = { ...P, tx: -14, ty: 40, tz: -28, d: 520, az: -34, el: 19, shift: 45, side: -30 };
const CORNER_LIGHT = { fx: -14, fy: 40, fz: -28, fs: 48 };

/* like · abonnement — the system whole under a panel (#net ends at y 761, #next at y ≈ 840) */
// (x 121…678 → 107…679 as it turns, y 783…1197: the pedal stays 150 px left of the chevrons)
const LIKE = { ...P, tx: -6, ty: 42, tz: -6, d: 860, az: -50, el: 9, shift: -45, side: 120 };
const LIKE_END = { az: -59 };
// a long low profile (x 130…678, y 858…1251)
const ABO = { ...P, tx: -6, ty: 42, tz: -6, d: 900, az: -68, el: 4, shift: -105, side: 105 };
const ABO_END = { ...ABO, d: 930, az: -72 };
// on the bench the header keeps the story's last word: the truck is passed, the car still braking (what act 3 ends on)
const ROLLING = { kmh: 30, wkmh: 29 };
const ALIVE = { xray: 1, brake: 1, grip: 0.6, sense: 1 };

/* commentaire */
// the picture the bench ends on, in the car: the system at its true place (it is ABO_END, moved back by SYSTEM.bench)
const IN_CAR = moved(ABO_END, SYSTEM.bench);
// your foot on the pedal, through the glass (pad x ≈ 440…540, y ≈ 850…930)
const PEDAL = { ...P, tx: -33, ty: 48, tz: -64, d: 170, az: -104, el: 18, shift: 150 };
const PEDAL_END = { d: 160, az: -100 };
// from behind: the car, the truck ahead in its lane — then on its right (car x 324…777, y 825…1222; the truck at 5 m
// x 234…528: its corner stays clear of the label, which stands on the right of the top slot)
const BEHIND = { ...P, tx: 0, ty: 43, tz: -1500, d: 3023, az: -4.57, el: 5.45, fov: 40, shift: 160, side: 230 };
const BEHIND_END = { az: -3.6 };
const ROAD_LIGHT = { fx: 0, fy: 60, fz: -400, fs: 900 };

/* boucle */
const AWAY = { ...BEHIND, shift: 237, side: 200 }; // (car x 354…807, y 748…1145; the truck far ahead, up on the left)
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));
// metres of road a second on the first frame: act 1 opens on a rush that dies as the foot goes down (acte1.js: RUSH / TAU + SLOW)
const RUSH = 7.5;

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", pressed: "chute:freiner-0.1", idea: "idea", gravel: "gravel", far: "far", alive: "alive", verdict: "verdict", tocta: "tocta",
    like: "like", lifts: "like:lève-0.1", likeEnd: "like$",
    toabo: "toabo", abo: "abo", next: "next", deck: "deck", aboEnd: "abo$",
    tocomment: "tocomment", wants: "wants", dont: "dont", stomp: "stomp", go: "go", ask: "ask",
    commentaire: "comment:commentaire", typed: "comment:tremblé+0.45", toloop: "toloop", rewind: "rewind",
  });

  /* ── CHUTE: "L'ABS ne sert pas d'abord à freiner plus court :" — the system whole, the wheel turning ── */
  cut(t.toverdict, SET.BENCH, WHOLE, { ...BENCHED, ...ROLLING, rolled: 0 });
  // on the bench the wheel turns slowly, from here to the last call to action (under 0.4 m a second: the teeth stay sharp)
  const benchTime = t.tocomment - t.toverdict;
  st(t.toverdict, benchTime, { rolled: 0.3 * benchTime }, "none");
  shot(t.toverdict, t.gravel - t.toverdict, WHOLE_END);
  // "…à freiner": the pedal goes down, the fluid's light runs to the unit, then to the caliper
  st(t.pressed, 0.3, { brake: 1 }, "power2.out");
  st(t.pressed + 0.15, 0.4, { grip: 0.7 }, "power2.out");
  retitle(tl, { showAt: t.toverdict + 0.08, strikeAt: t.idea + 0.12, swapAt: t.verdict, hideAt: t.tocta - 0.27 });

  // "sur du gravier, il t'arrête même plus loin." — in to the wheel and its brake; the tyre and the rim turn to glass
  shot(t.gravel, t.alive - t.gravel, CORNER);
  st(t.gravel, t.alive - t.gravel, { ...CORNER_LIGHT }, "sine.inOut");
  st(t.gravel, 1.2, { xray: 0.75 }, "sine.inOut");
  // "…plus loin": it lets the brake go — both coils light up, the wheel's line pales
  st(t.far, 0.2, { inlet: 0, outlet: 1 }, "power2.out");
  st(t.far, 0.45, { grip: 0.25, pump: 1 }, "power2.out");

  // "Il garde tes roues en vie…" — the sensor's pulses run up the wire; then it squeezes again
  st(t.alive, 0.4, { sense: 1 }, "power2.out");
  const squeeze = t.alive + 0.55 * (t.verdict - t.alive);
  st(squeeze, 0.2, { inlet: 1, outlet: 0 }, "power2.out");
  st(squeeze, 0.45, { grip: 0.7, pump: 0 }, "power2.out");

  // "pour que tu puisses tourner." — the wheel steers, toward the lens: the file's verdict
  shot(t.alive, t.tocta - t.alive, TURNS);
  st(t.verdict, 0.6, { steer: 0.8 }, "power3.out");
  D.verdict(t.verdict);

  /* ── LIKE: "Like. Pour celui qui lève le pied quand ça tremble." — the system whole, alive, turning slowly ── */
  cut(t.tocta, SET.BENCH, LIKE, { ...BENCHED, ...ROLLING, ...ALIVE, pulse: 1, pump: 1 });
  const toAbo = t.toabo - 0.05;
  shot(t.tocta, toAbo - t.tocta, LIKE_END);
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });
  // "…qui lève le pied": the pedal comes up, the light leaves the brake
  st(t.lifts, 0.45, { brake: 0.06, pulse: 0, pump: 0 }, "power2.inOut");
  st(t.lifts + 0.12, 0.5, { grip: 0.04, wkmh: 30 }, "power2.inOut");

  /* ── ABONNEMENT: the pedal goes down again; the camera backs away and comes down, the next file over it ── */
  st(t.abo, 0.25, { brake: 1 }, "power2.in");
  st(t.abo + 0.14, 0.4, { grip: 0.6, wkmh: 29 }, "power2.out");
  shot(toAbo, t.next + 0.6 - toAbo, ABO);
  shot(t.next + 0.6, t.tocomment - t.next - 0.6, ABO_END);
  nextFile(tl, { showAt: t.next, factAt: t.deck, hideAt: t.tocomment - 0.32, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── COMMENTAIRE 1: "Et le mauvais réflexe ?" — the same picture, in the car; the camera dives to your foot ── */
  // (the film is in slow motion: half a metre of road a second)
  const onPedal = t.stomp - t.tocomment;
  cut(t.tocomment, SET.STREET, IN_CAR, { ...STAGED, brake: 1, grip: 0.7, pulse: 1, pump: 1, dive: 1, gap: 16, rolled: 0, kmh: 60, wkmh: 54, fx: -60, fy: 50, fz: -110, fs: 170 });
  st(t.tocomment, onPedal, { gap: 16 - 0.5 * onPedal, rolled: 0.5 * onPedal, kmh: 56 }, "none");
  const atFoot = t.wants - 0.15;
  // (a dive from the whole cabin to the pedal in little more than a second came out as the film's most abrupt move
  // once the voice was in: the cabin holds, pushed in a little, and the pedal is a cut)
  shot(t.tocomment, atFoot - t.tocomment, { d: IN_CAR.d * 0.9 }, "sine.out");
  // the glass round the pedal (your shin, the sill beyond it) is dimmed: the pedal is the subject
  cut(atFoot, SET.STREET, PEDAL, { fx: -33, fy: 50, fz: -66, fs: 40, shell: 0.5 });
  shot(atFoot, t.stomp - atFoot, PEDAL_END);
  // "Ton pied veut relâcher." — it comes up: the brake lets go with it
  st(t.wants, 0.5, { brake: 0.5, grip: 0.35, wkmh: 57 }, "power2.inOut");
  chip("chip-tiens", null, 96, 470, t.wants + 0.05, t.stomp - 0.18);
  // "Ne relâche pas, ne pompe pas :" — down, and it stays down
  st(t.dont, 0.16, { brake: 1 }, "power3.in");
  st(t.dont + 0.1, 0.4, { grip: 0.7, wkmh: 50 }, "power2.out");
  D.jolt(t.dont + 0.16, 0.5, 0.35);

  /* ── COMMENTAIRE 2: "tu écrases, tu tiens… et tu tournes." — from behind: the truck in your lane, then on your right ── */
  const ROAD = 2.6; // metres of road a second, on screen (slow motion: the truck's tail is still in the picture when the question is asked)
  const pass = t.go + 1.25; // your nose reaches the truck's tail: the car is in the next lane
  const gapAt = (time) => 0.3 + ROAD * (pass - time);
  const behind = t.toloop - t.stomp;
  cut(t.stomp, SET.STREET, BEHIND, { ...STAGED, ...ROAD_LIGHT, brake: 1, grip: 0.7, pulse: 1, pump: 1, dive: 1, gap: gapAt(t.stomp), rolled: 0, kmh: 56, wkmh: 50 });
  st(t.stomp, behind, { gap: gapAt(t.toloop), rolled: ROAD * behind, kmh: 34, wkmh: 31 }, "none");
  shot(t.stomp, behind, BEHIND_END);
  // (on the right of the top slot: the truck's roof stands on the left of it until the car steers)
  chip("chip-geste", null, 530, 470, t.stomp + 0.12, t.ask - 0.18);
  // "…et tu tournes": left, the body follows, then straight again in the next lane (no contact: the car's corner is
  // clear of the truck's 2 m before its tail, and never comes nearer to it than 1.3 m)
  st(t.go - 0.1, 0.35, { steer: 1 }, "power2.out");
  st(t.go - 0.05, 1.3, { lane: 3.5 }, "sine.inOut");
  st(t.go - 0.05, 0.6, { yaw: 8 }, "sine.inOut");
  st(t.go + 0.55, 0.75, { yaw: 0 }, "sine.inOut");
  st(t.go + 0.4, 0.4, { steer: -0.6 }, "sine.inOut");
  st(t.go + 0.85, 0.45, { steer: 0 }, "sine.inOut");
  st(pass, 0.4, { mood: 0 }, "sine.inOut"); // the truck is passed
  // "En commentaire : ta pédale a déjà tremblé ?"
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.typed, chars: 3, to: t.toloop - 0.32 });

  /* ── BOUCLE: "Parce que la prochaine fois, ce sera peut-être…" — the road again, and down to the wheel ── */
  // Everything is written here, to the first frame's own numbers (D.first, D.pose0), and ends on D.tEnd: the road must
  // still be running when the film gets there — at the speed the first frame opens on — which one ease for the whole
  // world cannot do.
  const first = numbers(D.first);
  const back = D.tEnd - t.toloop;
  const metres = RUSH * back; // of road between the cut and the first frame, at the speed the first frame opens on
  cut(t.toloop, D.first.set, AWAY, { ...STAGED, ...first, ...ROAD_LIGHT, gap: first.gap + metres, rolled: first.rolled - metres, brake: 0, grip: 0, dive: 0 });
  st(t.toloop, back, { gap: first.gap, rolled: first.rolled }, "none");
  shot(t.toloop, t.rewind - t.toloop, { d: AWAY.d * 0.97 });
  const descent = D.tEnd - t.rewind;
  shot(t.rewind, descent, D.pose0, "sine.inOut", AWAY.d * 0.97);
  st(t.rewind, descent, { fx: first.fx, fy: first.fy, fz: first.fz, fs: first.fs }, "sine.inOut");
  // your foot goes down as the camera reaches the wheel: the lines light up
  const down = Math.min(0.8, descent * 0.4);
  st(D.tEnd - down, down, { brake: first.brake, grip: first.grip, dive: first.dive }, "power2.inOut");
  D.loop({ at: t.toloop, rewindAt: D.tEnd });
}
