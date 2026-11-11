// DOSSIER 041 — 02 AUTOPSIE, the principle and the shield at rest (principe − 0.12 → tozero).
//
// THE PRINCIPLE, on the bench, in ONE travelling that keeps turning into the plane of the layers (the gap only reads
// in profile: az −86 → −94, always decreasing; el rising) — cut on the PAIR, wide: the coupon (low) and its
// counter-example, one plate of the same metal (high), two billes coming in together from the right (« Pourquoi du
// vide ? », the gap lights up on « vide »). Both hit on « perce »: two flashes, one frame. The camera goes down to the
// coupon: « il s'y brise » (punch) the bille is gone, the hole is hot, « en nuage » the cone is born behind it;
// « En 10 centimètres, ce nuage s'étale »: close on the gap, its 10-cm gauge under it, the cone opens along it to the
// blanket; « Et ta coque » lights the wall, « reçoit une pluie » the rain on it — it bulges a hair, holds (veille
// rim); « pas une balle »: a cut in the breath onto the mirror plate (rising 57 cm in 0.4 s crossed an empty frame —
// retouche 08/11), hot, dug, through on « balle »: one tight jet out of its back.
// THE SHIELD AT REST, in orbit, in ONE travelling (az −40 → −106): cut on the whole station on the limb; its shield
// wakes up veille on « attend », the front ones thicken on « épais… station » as the camera turns to the front.
// « Il arrête un centimètre. Pas plus. » (the chip): a cut in the breath before « Il », from the front onto the lab's
// coupon, three-quarter, its bumper veille, the lab's glass faint (the dive from 5200 to 32 in 2 s was the film's
// jerkiest move and its glass, seen grazing, whitened the frame — retouche 08/11); then a slow push into the profile,
// onto the bille. The Earth slows and stops: time freezes again. « Et le
// tien… »: the bille, frozen 20 cm off the bumper, and the light turns signal in the breath (the threat is back: act
// 3 cuts from here); « fait un centimètre »: its 1-cm gauge, exactly its size (punch).
import { SET, VIEW, BENCHED, STAGED, LIGHT, MIRROR } from "./world.js";

/* ── on the bench: the coupon's impact at y 0, the mirror plate's at y 54 (MIRROR.at) ── */
const B = { tx: 0, fov: 30, side: 0, roll: 0, drift: 0.3, shift: 0, dof: 0 };
// both impact points between the header and the captions (54 cm apart: the frame must be ≥ 175 cm tall)
const PAIR_WIDE = { ...B, ty: 16, tz: -2, d: 360, az: -85.5, el: 1 };
// the mirror plate alone (y 38 → 70), its crater just above the frame's centre, room on the left for the jet
const MIRROR_SHOT = { ...B, ty: 47, tz: -5, d: 140, az: -112, el: 13.6 };
/* ── in orbit ── */
const HZ = VIEW.whole.tz;
const BZ = STAGED.dist + 0.5; // the bille's centre, frozen (whipple.js: z = dist + r)
// the lab's coupon in three-quarter, from far enough that neither layer fills the frame (chef, 08/11: profile at
// az −96 read as a green sliver at 270 px), both layers under the panel, the bille small on the right
const COUPON_SHOT = { ...VIEW.whole, tx: 0, ty: 2, tz: 6, d: 220, az: -125, el: 16, fov: 30, shift: 0, dof: 0 };

export default function acte2b({ D }) {
  const { st, path, cut, chip, punch } = D;
  const t = D.times({
    principe: "principe", vide: "principe:vide", perce: "perce1", brise: "brise1", nuage: "principe:nuage",
    dix: "principe:centimètres-0.12", etale: "etale", etaleEnd: "principe:s'étale$", coque: "principe:coque",
    pluie: "pluie", pas: "pasballe", balle: "principe:balle",
    repos: "repos", attend: "repos:attend", epais: "repos:épais", avant: "avant", station: "repos:station",
    arrete: "arrete", pasplus: "repos:pas", tien: "tien", fait: "repos:fait", cm: "repos:centimètre#2", tozero: "tozero",
  });

  /* ═════════ the principle (bench) ═════════ */
  const at0 = t.principe - 0.12;
  const atM = t.pas - 0.13; // the cut to the mirror plate (between two frames)
  // the two billes the same distance from their plates, so they hit together (whipple.js: the twin's z is
  // MIRROR.twinFrom × (1 − pierce / 0.4)): one tween for both, linear — a projectile does not brake
  const D0 = 24;
  const P0 = 0.4 * (1 - D0 / MIRROR.twinFrom);
  cut(at0, SET.BENCH, PAIR_WIDE, { ...BENCHED, mirror: 1, gauge10: 1, litGap: 0.5, bille: 1, dist: D0, trail: 0.3, pierce: P0 });
  st(at0, t.perce - at0, { dist: 0, pierce: 0.4 }, "none");
  // « Pourquoi du vide ? »: the gap lights up on its word, and goes out before the cloud is born in it
  st(t.vide - 0.08, 0.3, { litGap: 1 }, "power2.out");
  st(t.perce - 0.45, 0.75, { litGap: 0 }, "sine.inOut");
  // the impact (whipple.js: flash 0 → 0.11, hole at 0.06, front on the blanket at 0.7, rain 0.86 → 0.95, held at 1)
  st(t.perce, 0.24, { burst: 0.12 }, "power1.out");
  st(t.perce + 0.24, t.nuage + 0.12 - t.perce - 0.24, { burst: 0.42 }, "sine.inOut"); // « brise en nuage »: the cone is born
  st(t.nuage + 0.12, t.dix - t.nuage - 0.12, { burst: 0.46 }, "none");
  st(t.dix, t.etaleEnd - t.dix, { burst: 0.7 }, "sine.inOut"); // « s'étale »: along the gauge, to the blanket
  st(t.etaleEnd, t.pluie - 0.18 - t.etaleEnd, { burst: 0.85 }, "sine.inOut"); // the blanket breaks it again
  st(t.pluie - 0.18, 0.5, { burst: 0.93 }, "none"); // « pluie »: the rain on the wall…
  st(t.pluie + 0.32, 0.6, { burst: 1 }, "sine.out"); // …which bulges a hair and holds
  st(t.coque - 0.08, 0.35, { litWall: 1 }, "power2.out"); // « ta coque »
  // the mirror plate: a crater that digs while the cloud spreads, through on « balle »
  st(t.perce, 0.24, { pierce: 0.45 }, "power1.out"); // its flash with the coupon's, in the same frames
  st(t.perce + 0.24, t.etale - t.perce - 0.24, { pierce: 0.65 }, "sine.inOut");
  st(t.etale, t.balle - 0.03 - t.etale, { pierce: 0.79 }, "sine.inOut");
  st(t.balle - 0.03, 0.45, { pierce: 1 }, "power2.out");
  punch(t.brise, 0.06);

  path([
    [at0, PAIR_WIDE],
    // closer on the pair (at d 330 it read too small at 270 px — retouche 08/11): both impact points stay between
    // the header and the captions (mirror ≈ 450 px, coupon ≈ 1220 px at d 250)
    [t.vide + 0.4, { ty: 17.4, tz: -2.3, d: 268, az: -86.4, el: 3 }],
    [t.perce, { ty: 18.2, tz: -2.5, d: 250, az: -87.4, el: 5 }], // both flashes in one frame
    [t.brise, { ty: -6.5, tz: -5, d: 118, az: -88.4, el: 5 }], // down to the coupon: the hole, the cone being born
    [t.nuage + 0.2, { ty: -5.5, tz: -5.5, d: 78, az: -89.2, el: 6 }],
    [t.dix + 0.6, { ty: -5, tz: -5.5, d: 60, az: -89.9, el: 8, dof: 8 }], // the gap, the gauge under it
    [t.etaleEnd, { ty: -5, tz: -5.5, d: 52, az: -90.6, el: 10 }],
    [t.coque, { ty: -4.6, tz: -5.8, d: 58, az: -91.3, el: 11.5 }],
    [t.pluie + 0.2, { ty: -3.5, tz: -6.5, d: 60, az: -91.9, el: 12.5 }],
    [atM, { ty: -3.2, tz: -6.8, d: 62, az: -92.3, el: 13 }],
  ]);
  // « pas une balle »: cut on the mirror plate in the breath, a few frames before « pas »; it pulls back slowly as
  // the plate goes through on « balle » and the jet comes out of its back
  cut(atM, null, MIRROR_SHOT);
  path([
    [atM, MIRROR_SHOT],
    [t.balle, { ty: 46.5, tz: -6, d: 148, az: -113, el: 14.4 }],
    [t.repos - 0.17, { ty: 46, tz: -6.8, d: 156, az: -114, el: 15.2 }],
  ]);

  /* ═════════ the shield at rest (orbit) ═════════ */
  const at1 = t.repos - 0.15;
  cut(at1, SET.ORBIT, VIEW.whole, {
    ...STAGED, shell: 1, you: 1, cabin: 0.3, shield: 0.3, ram: 0, bille: 0, trail: 0, mood: 0, flown: 0, ...LIGHT.station,
  });
  st(t.attend - 0.05, 0.7, { shield: 1 }, "power2.out"); // « Il attend »: the bumpers over every module, veille
  st(t.epais, t.station + 0.28 - t.epais, { ram: 1 }, "sine.inOut"); // « plus épais à l'avant »
  st(at1, t.tien - at1, { flown: 24 }, "power1.out"); // the Earth goes by… and stops: time freezes on the bille
  // « Il arrête »: a cut in the breath (« station » ends 42.84, « Il » 43.28), from the station's shield to the piece
  // of it the film has opened — the glass, the shield and the cabin's air faint, the light on the coupon (seen grazing,
  // they whitened the frame: brouillon, 43.5–44.3 s); the bumper glows veille on « arrête », then the bille off it
  const atC = t.arrete - 0.24;
  cut(atC, null, COUPON_SHOT, { shell: 0.15, shield: 0.12, cabin: 0, litBumper: 0.35, ...LIGHT.coupon });
  st(t.arrete - 0.1, 0.5, { litBumper: 0.7 }, "power2.out");
  st(t.arrete + 0.5, 0.5, { bille: 1 }, "sine.inOut");
  st(t.tien + 0.22, 0.25, { mood: 1 }, "power2.out"); // « le tien… »: the threat is back
  st(t.fait, 0.3, { gauge1: 1 }, "power2.out"); // « fait un centimètre »
  punch(t.cm, 0.06);
  chip("chip-arrete", null, 96, 470, t.arrete - 0.08, t.tien - 0.3);

  path([
    [at1, VIEW.whole],
    // a soft start: the cut onto the station reads as a cut, not as a whip (brouillon: 40.7 s); its shield wakes
    [t.attend + 0.45, { tx: 150, ty: 160, d: 20500, az: -46, el: 15.5, shift: 56 }],
    [t.station, { tx: -800, ty: 0, tz: HZ, d: 8000, az: -65, el: 12.5, shift: 40 }], // the front, thicker
    [atC, { tx: -950, ty: -10, d: 6800, az: -70, el: 12, shift: 38 }],
  ]);
  path([
    [atC, COUPON_SHOT],
    [t.arrete + 0.7, { ty: 1, tz: 10.8, d: 190, az: -120, el: 15 }], // « un centimètre »: the bumper and the bille, both
    [t.tien - 0.1, { ty: -1.2, tz: BZ, d: 40, az: -99, el: 9.5, dof: 8 }], // the bille
    [t.cm, { ty: -1.5, d: 23, az: -102.5, el: 10.5 }],
    [t.tozero, { d: 21.5, az: -106, el: 12 }],
  ]);
}
