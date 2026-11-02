// 03 · RÉPONSE — `tozero` (46,38) → `toverdict` (62,65). In cuts: one shot per breath, each readable in half a second.
//
//   46,38  CHASE      behind your fin, the other plane head-on beyond your nose (the act-2 peer was where he is).
//                     « 35. » — the header and « Pour obéir » run together, slow (story time) until « tires ».
//                     « Ta machine envoie à l'autre : je monte » — the coordination's head leaves your processor
//                     for his; punch on « monte ».
//   49,30  HIS SCREENS in his deck (the camera rides with him): his ND (you, the red square) and his vertical speed
//                     scale in one frame — « La sienne lit… et prend l'autre sens »: its green arc flips DOWN on « prend ».
//   51,71  THE PAIR   from ahead and above: him in front, low; you beyond him, high — « Toi : monte. Lui : descends. »,
//                     each one's chip on his word.
//   54,26  THE STICK  your side stick, the hand of glass on it: pulled back on « tires » (punch); the five seconds stop.
//   55,54  THE VSI    your vertical speed scale: the needle climbs, « 1 500 pieds par minute », and enters the green
//                     arc ON « vert ».
//   58,66  SHOULDER   over the captain's shoulder: his lights glide down under the glare shield and leave the frame
//                     under you; the header reaches 0,0 on « sous » (punch).
//   60,46  THE PAIR   stacked: you above, him below, passed; « conflit » — the screens go quiet, the light goes veille.
//
// The approach: `gap` melts in ONE straight line from the cut to the crossing (an airliner does not slow down), the
// vertical separation grows slowly (`power2.in`: the vertical speed builds) and stays small until he has left the
// shoulder shot; the cut to the stacked pair sets the separation of the fall (up 30, down 30). Your own pitch
// (`nose`) is NOT moved while the camera is in your deck: 023's plane pitches about its centre, 27 m behind the
// panel — 6° would throw the screens out of the frame; and the stack keeps both level (fin.js cuts on it with STAGED: nose 0).
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, OTHER, atHim } from "./world.js";

/* ── the approach: one straight line, from the cut to just after the crossing ── */
const G0 = 260; //    gap on the cut (the act-2 peer's distance)
const G1 = 73; //     gap on the cut over your shoulder: his lights just over the glare shield
const G2 = -26; //    gap on the cut to the stacked pair (he has just passed under you, fast)
const SEP1 = 6; //    up = down on the cut over your shoulder (metres, drawn)
const SEP2 = 12; //   … and on the cut to the stack: his whole plane under yours, his fin clear of your belly

/** The pair seen from ahead and above (him in front, low; you beyond, high), aimed at the middle of the two. */
const pairLevel = (gap, d) => ({ ...VIEW.pair, tx: 0.55 * (OTHER.x0 - gap * 100), ty: -300, tz: 0, d, az: -80, el: 18, shift: 150, side: -120 });
/** His ND (you, the red square), then his vertical speed scale (act 1's frames), placed where he stands. */
const hisNd = (gap, d) => atHim({ ...VIEW.hisNd, d }, { gap, up: 0, down: 0 });
const hisVsi = (gap, d) => atHim({ ...VIEW.vsi, d, tx: VIEW.hisNd.tx, tz: -VIEW.vsi.tz, az: VIEW.vsi.az - 180 }, { gap, up: 0, down: 0 });
/** The stack, passed: you above, him below, both inside the subject's band (VIEW.pair at d 20000 puts you under the
 *  header and him in the captions: see the journal, « À changer ailleurs »). */
/** Your vertical speed scale, a little lower in the frame than VIEW.vsi: the green arc (+1 500 … +2 000) under the
 *  header, not behind it. */
const VSI = { ...VIEW.vsi, ty: VIEW.vsi.ty + 3 };
const STACK = { ...VIEW.pair, d: 32000, shift: 60 };

export default function acte3({ D, world }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    tozero: "tozero", zero: "zero", envoie: "zero:envoie", zMonte: "zMonte", zSienne: "zSienne", zSens: "zSens",
    reponse: "reponse", rpMonte: "reponse:monte", rpLui: "rpLui", rpDescends: "reponse:descends",
    trigger: "trigger", tires: "reponse:tires", pieds: "rpPieds", vert: "rpVert", feux: "rpFeux", sous: "rpSous",
    voix: "reponse:voix", conflit: "rpConflit", toverdict: "toverdict",
  });
  setAct(tl, 3, t.zero);

  const toHis = t.zSienne - 0.26; //   a few frames before « La sienne »
  const toHisVsi = t.zSens - 0.3; //   in the breath after « lit… », before « et prend »
  const toPair = t.reponse - 0.1; //   before « Toi »
  const toStick = t.trigger - 0.25; // before « Tu tires »
  const toVsi = t.pieds - 0.5; //      before « 1 500 »
  const toShoulder = t.feux - 0.3; //  before « Ses feux »
  const toStack = t.voix - 0.26; //    before « La voix »
  const gapAt = (time) => G0 + ((G1 - G0) * (time - t.tozero)) / (toShoulder - t.tozero);

  /* ───────────── « 35. Ta machine envoie à l'autre : je monte » — behind your fin ───────────── */
  // (a hard cut, the act's door: the whole state of the sky; what the bench had lit goes dark)
  cut(t.tozero, SET.SKY, VIEW.chase, {
    ...STAGED, gap: G0, up: 0, down: 0, tau: 35, obey: 5, level: 3, ra: 1, vs: 0, level2: 3, ra2: 0, vs2: 0,
    cores: 1, ping: 1, crew: 1, mood: 1,
  });
  st(t.tozero, toShoulder - t.tozero, { gap: G1 }, "none"); // he comes in, one straight line…
  shot(t.tozero, toHis - t.tozero, { ...VIEW.chase, fov: 30.5 }, "sine.inOut");
  // the header and the five seconds run together, slow (story time), until the hand pulls
  st(t.zero, t.tires - t.zero, { tau: 32.6, obey: 2.6 }, "none");
  // « je monte »: the coordination's head goes from your processor to his
  // (the rings stop while it travels: one light on its way, not three)
  st(t.envoie - 0.35, 0.3, { ping: 0 }, "sine.inOut");
  st(t.envoie, t.zMonte - t.envoie, { coord: 1 }, "sine.inOut");
  punch(t.zMonte, 0.06, { hold: 0.12, down: 0.4 }); // let go before the cut to his deck

  /* ───────────── « La sienne lit… et prend l'autre sens » — his screens, the camera riding with him ───────────── */
  // the camera rides with him: the pose moves with the gap, in the same straight line ("none")
  cut(toHis, SET.SKY, hisNd(gapAt(toHis), 70), { coord: 0, ping: 0 });
  shot(toHis, toHisVsi - toHis, hisNd(gapAt(toHisVsi), 62), "none");
  st(t.zSienne, t.zSens - t.zSienne, { answer: 1 }, "sine.inOut");
  cut(toHisVsi, SET.SKY, hisVsi(gapAt(toHisVsi), 68), {});
  shot(toHisVsi, toPair - toHisVsi, hisVsi(gapAt(toPair), 60), "none");
  st(t.zSens, 0.14, { ra2: -1 }, "power2.out"); // his green arc flips down on « prend »

  /* ───────────── « Toi : monte. Lui : descends. » — the pair, from ahead ───────────── */
  cut(toPair, SET.SKY, pairLevel(gapAt(toPair), 42000), { answer: 0 });
  shot(toPair, toStick - toPair, pairLevel(gapAt(toStick), 39000), "sine.inOut");
  const you = world.mine.deck.A.eyeL;
  const him = world.his.deck.A.eyeL;
  chip("chip-toi", you, 40, -70, t.reponse + 0.02, t.rpMonte - 0.02);
  chip("chip-monte", you, 40, -70, t.rpMonte, toStick - 0.16);
  chip("chip-lui", him, 40, 60, t.rpLui, t.rpDescends - 0.02);
  chip("chip-descends", him, 40, 60, t.rpDescends, toStick - 0.16);

  /* ───────────── « Tu tires sur le manche » ───────────── */
  cut(toStick, SET.SKY, VIEW.stick, { ping: 0 });
  shot(toStick, toVsi - toStick, { ...VIEW.stick, d: 72 }, "sine.inOut");
  st(t.tires, 0.4, { pull: 1 }, "power2.out"); // past half: « Pour obéir » stops and turns veille
  punch(t.tires, 0.06);
  // the climb and the dive begin; small and slow at first (the vertical speed builds)
  st(t.tires, toShoulder - t.tires, { up: SEP1, down: SEP1 }, "power2.in");
  st(t.tires, t.vert - t.tires, { vs2: -1500 }, "sine.inOut");
  st(t.tires, toShoulder - t.tires, { nose2: 4 }, "sine.inOut"); // his nose goes down (yours: see the head comment)
  // the count runs out: 0,0 at the closest point, on « sous »
  st(t.tires, t.sous - t.tires, { tau: 0 }, "none");

  /* ───────────── « 1 500 pieds par minute. Ton aiguille entre dans l'arc vert. » ───────────── */
  cut(toVsi, SET.SKY, VSI, {});
  shot(toVsi, toShoulder - toVsi, { ...VSI, d: 42 }, "sine.inOut");
  chip("chip-1500", null, 96, 470, toVsi + 0.1, toShoulder - 0.16);
  // the needle climbs quickly, slows short of the arc, and crosses 1 500 into the green ON « vert »
  st(toVsi + 0.1, t.vert - 0.24 - (toVsi + 0.1), { vs: 1300 }, "power2.out");
  st(t.vert - 0.24, 0.54, { vs: 1750 }, "none");
  st(t.vert + 0.3, 0.6, { vs: 1700 }, "sine.out");

  /* ───────────── « Ses feux passent… sous toi » — over your shoulder ───────────── */
  cut(toShoulder, SET.SKY, VIEW.shoulder, {});
  shot(toShoulder, toStack - toShoulder, { ...VIEW.shoulder, d: 250 }, "sine.inOut");
  // …faster now, and he sinks: his lights slide under the glare shield on « passent », out of the frame on « sous »
  st(toShoulder, toStack - toShoulder, { gap: G2, up: SEP2, down: SEP2 }, "none");
  punch(t.sous, 0.06, { hold: 0.16, down: 0.45 }); // let go before the cut to the stack

  /* ───────────── « La voix : conflit terminé » — passed, stacked ───────────── */
  cut(toStack, SET.SKY, { ...STACK, d: 35000 }, { gap: -45, up: 30, down: 30, nose: 0, nose2: 0, vs: 1700, vs2: -1500, pull: 1, tau: 0 });
  st(toStack, t.toverdict - toStack, { gap: -60 }, "none");
  shot(toStack, t.toverdict - toStack, STACK, "sine.inOut");
  st(t.conflit, 0, { level: 0, ra: 0, ra2: 0, obey: -1 });
  st(t.conflit, 0.25, { mood: 0 }, "power2.out");
}
