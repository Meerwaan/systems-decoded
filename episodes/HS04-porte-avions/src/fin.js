// 03 · RENDEZ-VOUS — comment → boucle (v2, 27/10 : docs/HS04-v2-montage.md § 1 et § 8).
//   comment  out of the black, the night of the L04 (c5, 504 → 517 s): the three wires across the angled runway
//            (VIEW.wires, re-framed 9:16, low under #duel), « Athéna » lights the first (wireName 1); a cut a few frames
//            before « Andromède » onto the third on its sheave (VIEW.andromede, wireName 3). #duel « Athéna » /
//            « Andromède », each lit on its word — the film never answers: no aircraft, never a hook on a wire (caught 0)
//   youtube  the whole Rafale in profile, at full power, low in the frame: the long's name in the top slot (filmTitle),
//            the account's name lights up on « chaîne » (D.verdict), the counter says where the answers are
//   boucle   « Et demain matin, sur cette catapulte… » — back behind the tail, gliding to POSE0 / FIRST
import { setAct } from "@kit/overlay.js";
import { duelCall, filmTitle } from "@kit/blocks.js";
import { onAngled } from "../../L04-porte-avions/src/plan.js";
import { SET, AT, VIEW, FIRST, POSE0, NG, P, SHARP } from "./world.js";

const F = (t) => Math.round(t * 30) / 30; // a cut on a frame
const DEG = Math.PI / 180;
/** A pose from where the camera STANDS (`eye`) toward what it looks at (`tgt`) — as the L04's c5 writes its night. */
const aimAt = (eye, tgt, extra = {}) => {
  const v = [eye[0] - tgt[0], eye[1] - tgt[1], eye[2] - tgt[2]];
  const d = Math.hypot(v[0], v[1], v[2]);
  return { ...P, tx: tgt[0], ty: tgt[1], tz: tgt[2], d, az: Math.atan2(v[0], v[2]) / DEG, el: Math.asin(v[1] / d) / DEG, ...extra };
};

export default function fin({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    comment: "comment", athena: "comment:athéna", andromede: "comment:andromède", commentaire: "comment:commentaire",
    youtube: "youtube", verdict: "verdict", toloop: "toloop", rewind: "rewind",
  });
  const after = D.breath("tir$") + 0.6; // the black of D.cliff ends here
  setAct(tl, 3, after);

  // the two answers (index.html still says the v1's: see the journal, « À changer ailleurs »)
  const label = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  label("duel-a", "Athéna");
  label("duel-b", "Andromède");
  const kicker = document.querySelector("#duel .kicker");
  if (kicker) kicker.textContent = "Lequel t'attrape ?";

  /* comment — the night: the three wires, low in the frame (#duel owns the top slot); nobody on the runway */
  // (the L04's VIEW.wires, re-framed close for 9:16: c5's « Athéna », from its port end, high — the wire a bright bar
  // across the picture, its sheave beyond; the three lit alike, then « Athéna » brighter on its word)
  const NIGHT = { ...AT.night, jet: 0, hook: 0, caught: 0, pull: 0, wires: 1, wireName: 0, mirror: 1, angled: 0.6, mood: 1 };
  const wiresP = aimAt(onAngled(2700, -1750, 640), onAngled(3600, -300, 0), { fov: 34, shift: -170, ...SHARP });
  cut(after, SET.PONT, wiresP, { ...NIGHT, l04: 504 });
  const tAnd = F(t.andromede - 0.12);
  shot(after, tAnd - after, aimAt(onAngled(2900, -1600, 500), onAngled(3600, -300, 0), { fov: 34, shift: -170, ...SHARP }), "sine.inOut");
  now(t.athena, { wireName: 1, l04: 509 });

  // « Andromède » (retouche 27/10) : from astern, low, along the angled runway — the third wire a bright bar across it
  // between its two sheaves (y ≈ 1100), the deck's lit end just beyond, then the sea under its signal glow (y ≈ 800–900):
  // the last one before the sea. The two others dimmed, the sky a little less black (night 0.5); a slow push along the axis
  const andT = onAngled(13000, -200, 0);
  const andP = aimAt(onAngled(-1800, 500, 600), andT, { fov: 24, shift: 0, ...SHARP });
  cut(tAnd, null, andP, { l04: 512, night: 0.5, wires: 0.15 });
  now(t.andromede, { wireName: 3 });
  const ytAt = F(t.youtube - 0.12);
  shot(tAnd, ytAt - tAnd, aimAt(onAngled(-700, 500, 600), andT, { fov: 24, shift: 0, ...SHARP }), "sine.inOut");
  duelCall(tl, { from: t.comment + 0.1, aAt: t.athena, bAt: t.andromede, to: ytAt - 0.3, word: t.commentaire });

  /* youtube — day again, the whole Rafale, low; the long's name over it */
  const low = { ...VIEW.hurl, d: 1500, az: 20, shift: -230 };
  cut(ytAt, SET.PONT, low, {
    ...AT.deck, gas: 1, tremble: 1, jbd: 1, strain: 1, hooked: 1, held: 1, dog: 1, crew: 0.6, parked: 0.6, sig: 3, vest: 0.35, mood: 1, hot: 0.12,
    under: 0, ship: 1, press: 0.3, valve: 0, named: 0, l04: -1, fx: NG[0], fy: 150, fz: NG[2] + 900, fs: 1200,
  });
  shot(ytAt, t.toloop - ytAt, { ...low, d: 1350, az: 15 }, "sine.inOut");
  now(t.youtube, { yt: 1 });
  filmTitle(tl, { showAt: t.youtube + 0.2, hideAt: t.toloop - 0.35 });
  D.verdict(t.verdict);

  /* the loop: behind the tail; between rewind and the end everything glides to FIRST */
  const back = { ...POSE0, d: 1700, el: 10 };
  cut(t.toloop, SET.PONT, back, {
    ...AT.deck, gas: 1, tremble: 1, jbd: 1, strain: 1, hooked: 1, held: 1, dog: 1, crew: 0.6, parked: 0.6, sig: FIRST.sig, vest: FIRST.vest,
    l04: FIRST.l04, fils: 0, yt: 0, mood: FIRST.mood, gel: FIRST.gel, hot: FIRST.hot, pool: FIRST.pool, grid: FIRST.grid,
    press: FIRST.press, tank: FIRST.tank, named: FIRST.named, fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: FIRST.fs,
  });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: back.d });
}
