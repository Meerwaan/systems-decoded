// DOSSIER 041 — 03 RÉPONSE (zero, reponse: « Contact » → « …et tient »), tozero → toverdict. The climax, in ONE move.
// One cut (tozero, in the breath before « Contact »), then ONE path to the end: the contact is seen whole, never cut on —
// the camera that was coming keeps coming, the bille enters the frame and hits, the camera takes the blow (jolt).
//
// Where the camera stands, and why (az DECREASES all the way, as in every path of the film):
//   · outside, three-quarter on the bumper (az −48 → −64): the hit, the shock ring running through the plate, the hole
//     and its hot lip — the bille comes from the right (+z), so the picture is pushed left to leave it room;
//   · round the bumper's edge into the plane of the layers (az −88 → −92, docs/041-actes-maj.md: the gap is seen in
//     profile only): behind the plate the bille breaks, drops glow, the cone opens across the ten centimetres, the
//     blanket breaks it again, the wall takes the rain. `shell` ≤ 0.2 there (the lab's glass, seen grazing, whitens
//     the frame); the camera stays 12 to 30 cm off the coupon's cut edge (x ≈ −32…−49), in the gap's plane (z ≈ −3…−10);
//     the picture pushed left (`side` 40–80): the hole and the cone's root stay clear of TikTok's buttons (x > 905);
//   · through the hull's glass beside the coupon (x ≈ −60…−110, never the coupon), into the lab: from inside, the wall
//     that held — its veille edge — and you asleep in front of it; it lands at speed on VIEW.cabin, where fin.js cuts
//     invisibly (same pose, same state).
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, LIGHT } from "./world.js";

/* ── the poses (VIEW.contact, VIEW.cone and VIEW.cabin are the decor's; the rest is found with `look`) ── */
// the contact: the bumper three-quarter, the whole plate on the dark with the station's modules behind it, the picture
// pushed left — the bille's side (+z, the right) left open for its streak (d 40 was a grey wall filling the frame)
const CONTACT0 = { ...VIEW.contact, d: 110, el: 8, side: 160, dof: 6 };
// inside the lab: the wall that held (its veille edge), you asleep in front of it. Retouche 08/11: halfway to
// VIEW.cabin (tx, el, az, d all go one way: no swing back), the coupon held in frame by `side` — the last 0.8 s
// were a 110-unit sideways slide past your glass body (qa: heurté 16.4 at 61.2)
const INSIDE = { tx: 8, ty: -3, tz: -34, d: 280, az: -128, el: 14, fov: 38, shift: 0, side: 200, dof: 0 };

/* ── the state: the station, you asleep, the bille at 20 cm and coming, the light on the coupon ── */
const HERE = { ...STAGED, ...LIGHT.coupon, dist: 20 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, path, cut, chip, jolt, punch } = D;
  const t = D.times({
    tozero: "tozero", contact: "contact", choc: "zero:choc", million: "million", air: "zero:l'air",
    perce: "perce", brise: "brise", gouttes: "gouttes", nuage: "nuage", vide: "reponse:vide",
    casse: "reponse:casse", coque: "reponse:coque", encaisse: "encaisse", trigger: "trigger", tient: "reponse:tient",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /* ───────────── the one move ───────────── */
  cut(t.tozero, SET.ORBIT, CONTACT0, HERE);
  path([
    [t.tozero, CONTACT0], //                                                    az −48, d 110: the plate, the clock at T−20 µs
    [t.contact, { az: -50, d: 100, el: 9, side: 130 }], //                      still coming: the hit lands in the frame
    [t.million, { az: -55, d: 80, el: 12, side: 50 }], //                       the ring runs through the plate
    [t.perce, { tz: 0, az: -63, d: 56, el: 16, side: 0 }], //                   the hole, its hot lip
    [t.brise, { tz: -4, az: -88, d: 44, el: 24, fov: 32, dof: 8, side: 80 }], // round the edge: behind the plate the bille breaks
    [t.gouttes, { tx: 1, tz: -3.5, az: -89, d: 34, el: 19, side: 60 }], //      closer: drops of molten metal
    [t.vide, { ...VIEW.cone, d: 50, el: 13, side: 70 }], //                      back: the cone across the ten centimetres
    [t.casse, { tz: -7, az: -91, d: 46, el: 9, side: 70 }], //                   the front on the blanket
    [t.encaisse, { tz: -9, az: -97, d: 66, el: 7, side: 40 }], //                the wall takes the rain — the pull-back already begun
    [(t.encaisse + t.tient) / 2, { tx: 4, ty: -1, tz: -18, az: -113, d: 150, el: 11, side: 120, dof: 4 }], // the breath: through the glass beside the coupon
    [t.tient, INSIDE], //                                                     through the glass: the wall held, you in front
    [t.toverdict, VIEW.cabin], //                                               fin.js cuts here on the same pose (invisible)
  ], { to: "go" });

  /* ───────────── « Contact. Sur la tôle, un choc d'un million de fois la pression de l'air. » ───────────── */
  st(t.tozero, span(t.tozero, t.contact), { dist: 0 }, "none"); // a bille does not accelerate: the clock counts down evenly
  st(t.contact, 0.12, { burst: 0.1, shock: 0.2 }, "none"); //    the flash that has a place, the plug gone, the hole
  jolt(t.contact + 0.02, 0.9);
  st(t.contact + 0.12, span(t.contact + 0.12, t.air - 0.2), { shock: 0.75 }, "none"); // the ring runs while « choc… million »
  st(t.air - 0.2, 0.6, { shock: 1 }, "sine.out");
  st(t.contact + 0.12, span(t.contact + 0.12, t.perce - 0.25), { burst: 0.14 }, "none"); // the glow of the cloud behind the hole
  chip("chip-pression", null, 96, 470, t.million - 0.3, t.air + 0.45);
  st(t.million + 0.5, span(t.million + 0.5, t.perce + 0.3), { shell: 0.15 }, "sine.inOut"); // before the turn into the layers

  /* ───────────── « La tôle se perce. Le débris se brise. Gouttes de métal fondu. » ───────────── */
  st(t.perce - 0.25, 0.6, { burst: 0.3 }, "sine.out");
  st(t.perce + 0.35, span(t.perce + 0.35, t.brise - 0.3), { burst: 0.33 }, "none");
  st(t.brise - 0.3, 0.6, { burst: 0.4 }, "sine.out"); //          the fragments part behind the plate
  st(t.gouttes - 0.1, 0.6, { molten: 1 }, "sine.out");
  st(t.brise + 0.3, span(t.brise + 0.3, t.nuage - 0.1), { burst: 0.45 }, "none"); // slow motion: the cloud never stops

  /* ───────────── « Le nuage s'ouvre dans le vide. La céramique le casse encore. » ───────────── */
  st(t.nuage - 0.1, span(t.nuage - 0.1, t.vide + 0.1), { burst: 0.7 }, "sine.inOut");
  st(t.vide + 0.1, span(t.vide + 0.1, t.casse - 0.25), { burst: 0.74 }, "none");
  st(t.casse - 0.25, 0.6, { burst: 0.85 }, "sine.out");

  /* ───────────── « Ta coque encaisse… et tient. » ───────────── */
  st(t.encaisse - 0.15, span(t.encaisse - 0.15, t.tient - 0.2), { burst: 0.93 }, "sine.out"); // the rain, the bulge
  st(t.tient - 0.2, 0.4, { burst: 1 }, "sine.inOut"); //                                        the veille edge: it holds
  st(t.tient - 0.04, 0.4, { mood: 0 }, "sine.inOut");
  punch(t.tient, 0.06, { hold: 0.16, down: 0.45 });
  chip("chip-tient", null, 96, 470, t.trigger, t.toverdict - 0.15);
  st(t.encaisse + 0.5, span(t.encaisse + 0.5, t.toverdict - 0.05), { cabin: 0.6 }, "sine.inOut");
  st(t.encaisse + 0.6, span(t.encaisse + 0.6, t.toverdict - 0.05), { shell: 1 }, "sine.inOut"); // inside (r < 213 from ≈ 59.8): the station comes back around you
  void tl;
}
