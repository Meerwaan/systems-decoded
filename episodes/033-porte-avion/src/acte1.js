// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). ONE move from the hook to the plane, three cuts
// (Korea; back to the cabin at cruise; you) — between them the plunge through the floor into the night, and from you
// the glide to the door's edge that act 2 opens.
//
//   0 → 2,8     the first frame (POSE0 / FIRST): low, in profile, under the floor's glass — the neighbour HEAVES on
//               the handle from frame 1 (vol.js: a heave every 1,15 s; the handle twitches with it). The camera pushes
//               in, fastest at first, and stops dead before « Elle ne bouge pas »; on « pas » the stops light.
//   3,75 → 7,1  the pull-back through the hull, by ratio: under the floor, out through the belly's glass, round to
//               the A330 at night, three quarters low, door 1L lit on its flank. (The arc goes UNDER the floor so the
//               camera never grazes you, seated just aft of the door.)
//   8,00        CUT — Korea: the same door, the same side, closer, low over the runway; 200 m, ≈ 0 t; on « ouvert »
//               the door swings out and forward (signal). Held on the question.
//   10,37       CUT — back at cruise, in the cabin: the door and the neighbour leaning back, all his weight on « poids ».
//   12,0        the plunge, by ratio: the camera sinks through the floor, then tilts down into the night — the island
//               far below (« dix kilomètres »).
//   14,34       CUT — you, seated beside the door (the rise from the night would have been a 76° turn in a second).
//   16,0        the glide to the door's aft edge (VIEW.edge); the stops light on « confiance », punch on « porte ? ».
//   18,1        held on the edge (a 2 % drift), the light goes from signal to nothing on « Alors » — act 2 cuts to
//               benchPose(VIEW.edge) on the same picture.
//
// Nothing here writes the header: `alt` does (11 300 m, 200 m in Korea).
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, STAGED, VIEW, POSE0 } from "./world.js";
import { DOOR_AT } from "./plan.js";

const [DX, DY, DZ] = DOOR_AT;
const MIDY = DY + 96.5;

/* ── the poses (plane frame) ── */
// the hook's push: closer, the target lowered with it so the camera stays under the floor's glass (as on frame 0)
const PUSH = { ...POSE0, ty: -20, d: 320 };
// Korea: VIEW.approach (the door in the foreground, the runway ahead)
const KOREA = VIEW.approach;
// back at cruise: the neighbour in profile, a little from above (his lean reads at az 100–125: vol.js journal)
const LEAN = { tx: DX + 8, ty: -10, tz: 240, d: 480, az: 112, el: 8, fov: 34, shift: 80, side: 0, roll: 0, drift: 0.3, dof: 0 };
// « En croisière »: door 1L from outside, lit on the flank (the cut's raccord), then the pull back to VIEW.plane
const OUTDOOR = { ...VIEW.plane, tx: DX + 150, d: 2600 };
// « Dehors »: the A330 from high above, small, its cabin lit, the coast far below (retouche: the plunge was black)
const OUT = { tx: DX + 508, ty: -1500, tz: DZ - 20, d: 14000, az: -60, el: 78, fov: 44, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 };
// you, seated beside the door
const YOU = VIEW.you;
// the door's aft edge — act 2 cuts from EXACTLY this
const EDGE = VIEW.edge;

/* ── the light: what it stands around, and how wide ── */
const L_DOOR = { fx: DX, fy: MIDY, fz: DZ, fs: 300 };
const L_PLANE = { fx: DX + 500, fy: -40, fz: DZ - 20, fs: 4000 };
const L_KOREA = { fx: DX - 200, fy: 0, fz: DZ, fs: 1600 };
const L_YOU = { fx: DX + 120, fy: 0, fz: 260, fs: 450 };
const L_EDGE = { fx: DX + 54, fy: MIDY, fz: DZ - 30, fs: 80 };

export default function acte1({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    choc: "choc", pas: "accroche:pas", promesse: "promesse", coree: "coree", ouvert: "ouvert",
    scene: "scene", poids: "poids", dehors: "dehors", dix: "dix", toi: "toi",
    confiance: "confiance", porte: "scenePorte", ouvre: "ouvre", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /** The handle twitches with each of the neighbour's heaves (vol.js: u = time / 1.15 + 0.04, the pull peaks at u ≈ 0.1). */
  const heaves = (from, to, amp) => {
    for (let n = Math.ceil((from + 0.046) / 1.15); 1.15 * n - 0.046 < to - 0.9; n++) {
      const at = Math.max(from, 1.15 * n - 0.046);
      st(at, 0.11, { handle: amp }, "power2.out");
      st(at + 0.13, 0.72, { handle: 0 }, "sine.inOut");
    }
  };

  /* ═════════════ A · « Ton voisin force la porte, en plein vol. Elle ne bouge pas. » ═════════════ */
  const stop = t.pas - 0.6; // the camera has stopped before « Elle ne bouge pas »
  shot(0, stop, PUSH, glide(3, 0.3)); // (orchestrateur: the first half-second read as still, 0,9)
  heaves(0, t.promesse, 0.18); // (retouche: 0.06 read as still — the handle yanked from frame 1, his hands with it)
  punch(t.choc, 0.06);
  st(t.pas, 0.35, { stops: 0.7 }, "power2.out");

  /* ═════════════ B · « En croisière, personne ne peut l'ouvrir. Même en le voulant. » ═════════════ */
  // CUT on « En croisière » (retouche: the pull-back through the hull swept a blurred arc of glass across the frame
  // and turned 156° in 3,4 s): the same door, from outside — the A330 in the night, door 1L lit on its flank — then
  // a slow pull back to VIEW.plane
  const back = t.promesse - 0.12;
  const atPlane = t.coree - 0.96; // (≈ 7,1: on the plane before « Alors pourquoi »)
  cut(back, SET.VOL, OUTDOOR, {
    ...STAGED, alt: 11300, ahead: 0.05, wind: 0.5, pull: 1, shell: 1, stops: 0.7, ...L_PLANE,
  });
  shot(back, atPlane - back, VIEW.plane, "sine.out", OUTDOOR.d);
  st(back + 0.3, 2.0, { stops: 1 }, "sine.inOut");
  st(back, t.coree - 0.12 - back, { ahead: 0.042, wind: 0.6 }, "none");
  shot(atPlane, t.coree - 0.12 - atPlane, { d: VIEW.plane.d * 0.96 }, "sine.out", VIEW.plane.d);

  /* ═════════════ C · « Alors pourquoi, en Corée, un passager en a ouvert une ? » ═════════════ */
  // CUT on « Corée »: the same door, the same side, closer, low over the runway — 200 m, ≈ 0 t
  const toKorea = t.coree - 0.12;
  cut(toKorea, SET.VOL, KOREA, {
    ...STAGED, alt: 200, ahead: 0.03, gear: 1, runway: 1, wind: 0.7, voisin: 0, you: 0, seated: 2, handle: 0.9,
    stops: 0.25, mood: 1, ...L_KOREA,
  });
  chip("chip-coree", null, 96, 470, toKorea, t.scene - 0.3);
  shot(toKorea, t.scene - 0.12 - toKorea, { d: KOREA.d * 0.9 }, "sine.out", KOREA.d);
  st(toKorea, t.scene - 0.12 - toKorea, { ahead: 0.024 }, "none");
  st(t.ouvert - 0.04, 0.6, { open: 0.35 }, "power2.out");
  punch(t.ouvert, 0.06);

  /* ═════════════ THE SCENE · « Il y met tout son poids. » ═════════════ */
  // CUT: back at cruise, in the cabin; the neighbour in profile, leaning back — all his weight on « poids »
  const toScene = t.scene - 0.12;
  cut(toScene, SET.VOL, LEAN, { ...STAGED, alt: 11300, ahead: 0.024, pull: 0.7, ...L_DOOR });
  st(t.poids - 0.25, 0.4, { pull: 1 }, "power2.out");
  const toOut = t.dehors - 0.12; // (≈ 11,9)
  heaves(toScene, toOut, 0.16); // (every twitch settled before the cut)
  shot(toScene, toOut - toScene, { d: LEAN.d * 0.95 }, "sine.out", LEAN.d);

  /* ═════════════ « Dehors, plus de dix kilomètres d'altitude. » ═════════════ */
  // CUT on « Dehors » (retouche: the plunge through the floor was 0,6 s of black, then a near-empty frame): the A330
  // seen from high above, small, its cabin lit, the coast far below — and the camera keeps rising away from it
  const toYou = t.toi - 0.12;
  cut(toOut, SET.VOL, { ...OUT, d: 8000 }, {
    ...STAGED, alt: 11300, ahead: 0.024, pull: 1, shell: 1, lights: 0.7, fx: DX + 500, fy: -40, fz: DZ - 20, fs: 8000,
  });
  shot(toOut, toYou - toOut, { ...OUT, ty: -2500, d: 17000 }, "power1.out", 8000); // (orchestrateur: 12–14 s read as still)
  st(toOut, toYou - toOut, { ahead: 0.02 }, "none");
  punch(t.dix + 0.05, 0.05);

  /* ═════════════ « Toi, tu es juste à côté. » ═════════════ */
  // CUT: you, seated beside the door (a rise of 76° in a second would be a cut anyway: it is one, on the swish)
  cut(toYou, SET.VOL, { ...YOU, d: YOU.d * 1.08 }, { ...STAGED, alt: 11300, ahead: 0.02, pax: 0.35, ...L_YOU });
  const atYou = t.toi + 0.9;
  shot(toYou, atYou - toYou, YOU, "sine.out", YOU.d * 1.08);
  chip("chip-toi", null, 96, 470, t.toi - 0.1, t.toi + 1.4);
  const toEdge = t.confiance - 1.3; // (≈ 16,0: « Tu l'arrêtes… »)
  shot(atYou, toEdge - atYou, { d: YOU.d * 0.96 }, "sine.out", YOU.d);

  /* ═════════════ « Tu l'arrêtes… ou tu fais confiance à cette porte ? » ═════════════ */
  // CUT to the door's aft edge (retouche: the glide from you swept the neighbour out of the picture, heurté 16,4),
  // then a slow push in; the stops light on « confiance »
    // (orchestrateur: ONE linear push from the cut to « Alors », landing on EXACTLY VIEW.edge — 16,5–20 read as still)
  cut(toEdge, SET.VOL, { ...EDGE, d: EDGE.d * 1.4 }, { ...STAGED, alt: 11300, ahead: 0.02, pax: 0.35, ...L_EDGE });
  shot(toEdge, t.tobench - toEdge, EDGE, "none", EDGE.d * 1.4);
  st(t.confiance, 0.4, { stops: 0.7 }, "power2.out");
  heaves(toEdge, t.tobench + 0.6, 0.1);
  punch(t.porte, 0.06);

  /* ═════════════ « Alors… » ═════════════ */
  // held on the edge (a 3 % drift, landing on EXACTLY VIEW.edge for act 2's cut); the signal light goes out
  st(t.ouvre, 0.3, { mood: 0 }, "sine.inOut");
}
