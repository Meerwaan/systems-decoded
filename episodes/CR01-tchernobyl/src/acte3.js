// 02 · LE DÉFAUT — from « Du graphite » to « Le graphite prend feu » (tocanal → toissue). docs/CR01-actes.md « acte3.js ».
//   1. THE MASTER SHOT (tocanal → tot7), ONE shot in the canal, no cut while it explains: close on the displacer's foot over the
//      bottom water (the cut matches the rod's foot of acte2b) — it turns red on « graphite », circled; the camera pulls back up the
//      rod to the absorber, which lights green on « freine » (what brakes works); « en entrant » the red foot comes down and pushes
//      the bottom water out (gone on « bas »); a push into the bottom: the neutrons that the water swallowed now pass; « Alors… »
//      the pull-back to the whole slice: the top dims under the green absorber, the bottom burns — « le frein accélère ».
//   2. t7: cut on the bottom of the core (the bottom that burns → the bottom of the core), 530 MW, « en flèche », the rods (green)
//      come down and stop dead on « bloquent » — their green dies.
//   3. t8: cut wide: the tubes burst, the steam explodes, the slab rises with the camera, the second explosion, the graphite burns.
// Starts with a complete cut at `tocanal`; hands over at `toissue` (fin.js cuts). The header's act 02 lit at « Sauf que » (acte2b.js).
import { feutre } from "@kit/reconstitution.js";
import { STAGED, VIEW, SET, W } from "./world.js";

const at = (name, local) => {
  const [tx, ty, tz] = W(name, local);
  return { tx, ty, tz };
};
/** The light around a point of a maquette (fx fy fz) and its size (fs). */
const lit = (name, local, fs) => {
  const [fx, fy, fz] = W(name, local);
  return { fx, fy, fz, fs };
};

export default function acte3({ D, world }) {
  const { st, shot, cut, punch, jolt, chip } = D;
  const t = D.times({
    tocanal: "tocanal", graphite: "graphite1", sous: "defaut:sous", freine: "freine3", entrant: "entrant", bas: "bas",
    avalait: "avalait", alors: "alors", accelere: "accelere2",
    tot7: "tot7", cinq30: "cinq30", monte: "t7:monte", fleche: "fleche", surchauffe: "surchauffe", bloquent: "bloquent",
    tot8: "tot8", eclatent: "eclatent", explose: "explose", dalle: "dalle", souleve: "souleve", explosion: "t8:explosion",
    graphite2: "t8:graphite", feu: "feu", toissue: "toissue",
  });

  /* ── 1 · THE MASTER SHOT (canal) ── */
  // close: the displacer's foot over the bottom water column (the rod's foot of acte2b, the same shape)
  const FOOT = { ...VIEW.canalLow, ...at("canal", [0, 64, 0]), d: 320, az: -64, el: 6, shift: 120 };
  const FOOT_IN = { ...FOOT, d: 278 }; // 320 → 278 in power1.out: it leaves at acte2b's push speed
  // the whole slice, tight: the absorber at the top under the header, the low plate above the captions (no blur: everything reads)
  const SLICE = { ...VIEW.canal, ...at("canal", [0, 122, -6]), d: 940, az: -62, el: 6, shift: 100, dof: 0 };
  const SLICE_IN = { ...SLICE, d: 900 };
  // into the bottom: where the water was, the neutrons now pass
  const BOTTOM = { ...VIEW.canalLow, ...at("canal", [0, 58, -4]), d: 400, az: -64, el: 6, shift: 120 };

  cut(t.tocanal, SET.CANAL, FOOT, {
    ...STAGED.canal, ...lit("canal", [0, 70, 0], 70),
    ok: 0, viol: 0, fault: 0, depuis: 0, rod: 0, flux: 1, steam: 0.6, pLow: 0.45, pHigh: 0.45,
    split: 0, xenon: 0, newRod: 0, solo: 0, rep: 0,
  });
  // the push carries on acte2b's linear push to the foot: it leaves at speed, then settles (retouche 05/11)
  const reveal = t.freine - 0.15; // the cut in the axis, a few frames before « freine »
  shot(t.tocanal, reveal - t.tocanal, FOOT_IN, "power1.out");
  // « Du graphite » — the foot turns red (the one red part), circled as the voice names it
  st(t.graphite, 0.22, { fault: 1 }, "power2.out");
  const lift = t.sous + 0.32; // the circle has lifted off before the camera moves
  feutre(D, { id: "feutre-graphite", anchor: world.canal.A.fault, kind: "circle", w: 300, h: 360, dx: 0, dy: -120, from: t.graphite + 0.06, to: lift - 0.15, draw: 0.42, seed: 5 });
  // « sous la partie qui freine » — a cut in the axis to the whole slice (the 1.5 s pull-back 290 → 940 was jerky, qa 88.3 s):
  // the absorber is in the frame when it lights green on « freine »; the light moves up with the cut
  cut(reveal, null, SLICE, lit("canal", [0, 120, 0], 120));
  st(t.freine, 0.35, { ok: 1 }, "power2.out");
  const dive = t.bas + 0.05; // the dive leaves once the bottom water is gone
  shot(reveal, dive - reveal, SLICE_IN);
  // « En entrant, il chasse l'eau du bas du cœur » — the red foot comes down, the bottom water is pushed out: gone on « bas »
  st(t.entrant, t.bas - t.entrant, { rod: 0.18 }, "sine.inOut");
  // « l'eau qui avalait les neutrons » — into the bottom: no more water, the neutrons pass through
  // (2.2 s instead of 1.5: the dive on « avalait » was jerky, qa 91.8 s)
  shot(dive, t.alors - 0.15 - dive, BOTTOM, "sine.inOut", SLICE_IN.d);
  st(dive, t.alors - dive, lit("canal", [0, 60, 0], 80), "sine.inOut");
  // « Alors pendant quelques secondes… le frein accélère » — back to the whole slice: the top dims under the green absorber, the bottom burns
  shot(t.alors, t.accelere - 0.15 - t.alors, SLICE, "sine.inOut", BOTTOM.d);
  st(t.alors, t.accelere - t.alors, lit("canal", [0, 120, 0], 120), "sine.inOut");
  st(t.alors, t.accelere + 0.1 - t.alors, { pLow: 1 }, "power2.in");
  st(t.alors, t.accelere - t.alors, { pHigh: 0.08 }, "sine.inOut");
  punch(t.accelere, 0.06);
  // hold, breathing (it must END before the cut at tot7: a shot that starts after a cut pulls the camera back into the canal)
  shot(t.accelere - 0.1, t.tot7 - 0.02 - (t.accelere - 0.1), { ...SLICE, d: 915 });

  /* ── 2 · t7 — 01 h 23 43, 530 MW, the rods that stop (coeur) ── */
  // low, looking up at the burning bottom (the first image's angle, closer): the red bottom, the plate, the green rods above.
  // No blur here: VIEW.coeurBottom with CLOSE drew a black frame on the look sheet (97.9 s), dof 0 draws.
  const BOT = { ...VIEW.coeurBottom, ...at("coeur", [0, 64, -10]), d: 350, az: -52, el: -4, fov: 40, shift: 70, side: 240, dof: 0 }; // side 240 (retouche 05/11): the core out of the buttons column
  const BOT_IN = { ...BOT, d: 335 };
  // the rods in the frame, above the burning bottom
  const RODS = { ...BOT, ...at("coeur", [0, 74, -10]), d: 430, el: -2, side: 170 };
  cut(t.tot7, SET.COEUR, BOT, {
    ...STAGED.coeur, ok: 1, viol: 0, fault: 1, depuis: 0, pLow: 0.8, pHigh: 0.3, rodsIn: 0.25, scram: 0.15,
    blast: 0, slab: 0, blast2: 0, fire: 0,
  });
  shot(t.tot7, t.surchauffe - 0.3 - t.tot7, BOT_IN);
  chip("chip-530", null, 96, 470, t.cinq30 - 0.06, t.surchauffe - 0.3);
  // « et ça monte en flèche »
  st(t.monte, t.fleche + 0.12 - t.monte, { pLow: 1, pHigh: 0.9 }, "power3.in");
  punch(t.fleche, 0.06);
  // « Le cœur surchauffe… les barres se bloquent avant le fond » — the rods come down, and stop dead: their green dies
  shot(t.surchauffe - 0.3, t.bloquent - 0.1 - (t.surchauffe - 0.3), RODS, "sine.inOut", BOT_IN.d);
  st(t.surchauffe, t.bloquent - t.surchauffe, { scram: 0.4 }, "none");
  jolt(t.bloquent, 0.5, 0.45);
  st(t.bloquent, 0.3, { ok: 0 }, "power2.out");

  /* ── 3 · t8 — the explosions (coeur, wide) ── */
  // the core, its slab, its pipes between the header and the captions; then up with the slab (the bottom of the core goes under the captions)
  const WIDE = { ...VIEW.slab, ...at("coeur", [10, 85, 0]), d: 950, el: 12, shift: 150 };
  const WIDE_IN = { ...WIDE, ...at("coeur", [10, 100, 0]), d: 880 };
  const LIFTED = { ...WIDE, ...at("coeur", [10, 185, 0]), d: 1180, el: 14 };
  cut(t.tot8, SET.COEUR, WIDE, {
    ...STAGED.coeur, ok: 0, viol: 0, fault: 1, depuis: 0, pLow: 1, pHigh: 0.9, rodsIn: 0.25, scram: 0.4,
    blast: 0, slab: 0, blast2: 0, fire: 0,
  });
  // « Les tubes éclatent, la vapeur explose »
  st(t.eclatent, 0.45, { blast: 0.6 }, "power2.out");
  st(t.explose, 0.6, { blast: 1 }, "power2.out");
  // « La dalle du réacteur, un disque géant » — the camera closes on the slab
  shot(t.tot8, t.souleve - 0.2 - t.tot8, WIDE_IN);
  // « se soulève » — the slab lifts, the camera rises with it
  st(t.souleve, 1.3, { slab: 1 }, "power2.out");
  shot(t.souleve - 0.2, 1.9, LIFTED, "sine.inOut", WIDE_IN.d);
  // « Une seconde explosion. Le graphite prend feu. »
  st(t.explosion, t.toissue - t.explosion, { blast2: 1 }, "none");
  st(t.graphite2, t.feu + 0.4 - t.graphite2, { fire: 1 }, "sine.inOut");
  shot(t.souleve + 1.7, t.toissue - t.souleve - 1.7, { ...LIFTED, d: 1210 });
}
