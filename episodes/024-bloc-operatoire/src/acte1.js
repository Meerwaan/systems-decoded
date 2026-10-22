// 01 · MENACE — from the first frame to « Alors… » (0 → tosystem). One movement in the bloc, two cuts (home, and back).
//
// THE HOOK. The first frame (POSE0 / FIRST): you asleep on the table under the lit lamp, the surgeon across you, the
// ventilator breathing — and beyond your feet the appliance. It is already moving: the camera pushes over your feet
// into the appliance's glass casing (« Dans un appareil, un fil touche le métal ») and on « métal » the worn wire
// touches the sheet: a light that has a place, signal; the header counts « Défauts 1 ». « Chez toi, ça sauterait » :
// the camera holds the contact, then draws back WITHOUT LOSING IT (aimed at the same point, by ratio) until the whole
// bloc is around that small signal point — nothing goes out (« Ici, rien ne coupe ») ; on « exprès » the IT cabinet
// behind the back wall glows veille (it is meant). « …qu'une fois » : the header's count beats once, the contact
// swells once — an open thread, paid at the comment.
// THE SCENE — a WHAT-IF, played under a signal veil (`gel`). Cut 1 (a lit room with an appliance → another lit room
// with an appliance): home, 016's wall seen along its length — the kettle on in the foreground, the consumer unit down
// the wall; on « différentiel » the differential lights veille (it is the one that acts), on « le noir » the kettle
// and the circuit go off and only the differential stays lit. Cut 2 (from the dark at home to the bloc that
// darkens): the ventilator's bellows, still breathing; on « noir » the room's lights go, on « s'arrête » the bellows
// stop half-way (we do not linger on you). Up to the lamp: on « s'éteint » its face goes dark. Along the table to the
// surgeon: his hands stop above the drape; on « rien » the one light left is the IT cabinet behind the back wall,
// and the camera goes to it: VIEW.system, where act 2 opens « Alors… on l'ouvre ». Act 3 replays it all in the light.
//
// TACT: you sleep, nothing happens to you; nobody is hurt; the surgeon is never seen in trouble, only still.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, HOMED, FAULT } from "./world.js";

/* ── the poses ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [FX, FY, FZ] = FAULT;
// the appliance, close: the casing of glass, the wire, the contact (bloc journal)
const DEVICE = { ...VIEW.device };
// the whole bloc from the front, a little to the right, AIMED AT THE CONTACT (the pull-back never lets it go): the
// table and the surgeon at the left, the appliance in the middle, the IT cabinet at the right (the lamp at the left edge)
const WIDE = { ...P, tx: FX, ty: FY, tz: FZ, d: 1000, az: 10, el: 22, fov: 44, shift: -40 };
// home: 016's wall seen along its length from the kettle's end, at the kettle's height: the kettle lit in the
// foreground, the consumer unit down the wall — what goes dark and what acts, in one frame
const HOME = { ...P, tx: 0, ty: 140, tz: 20, d: 480, az: 74, el: 4, fov: 40, shift: 170 };
// the ventilator's bellows (we do not linger on you)
const RESP = { ...VIEW.resp, d: VIEW.resp.d * 1.18 };
// the lamp from below and the side (VIEW.lamp), its lens opened: the whole face in the frame, small enough not to
// flood it, under the header
const LAMP = { ...VIEW.lamp, fov: 50, shift: 60 };
const SURGEON = { ...P, tx: 60, ty: 135, tz: -60, d: 420, az: -24, el: 8, fov: 36, shift: 60 };
// …a little closer, the aim slid toward the cabinet glowing behind him: act 2 cuts from there on « Alors… »
const SURG_END = { ...SURGEON, tx: 105, tz: -95, d: 380 };

// the light: what it stands around, and how wide
const L_DEV = { fx: FX, fy: FY, fz: FZ, fs: 60 };
const L_WIDE = { fx: 40, fy: 120, fz: -60, fs: 600 };
const L_HOME = { fx: 0, fy: 130, fz: 20, fs: 450 };
const L_RESP = { fx: -155, fy: 118, fz: -42, fs: 120 };
const L_LAMP = { fx: -20, fy: 160, fz: 0, fs: 160 };
const L_SURG = { fx: 12, fy: 130, fz: -50, fs: 250 };
const L_SYS = { fx: 260, fy: 122, fz: -300, fs: 120 };

/** An ease that leaves at `s0` times its mean speed and lands at `s1` times it: moves chained without a stop. */
const glide = (s0, s1) => (u) => s0 * u + (3 - 2 * s0 - s1) * u * u + (s0 + s1 - 2) * u * u * u;

export default function acte1({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    metal: "accroche:métal", sauterait: "promesse:sauterait", ici: "promesse:Ici", expres: "promesse:exprès",
    once: "promesse:qu'une", toscene: "toscene", diff: "scene:différentiel", noir: "scene:noir", ici2: "ici2",
    noir2: "scene:noir#2", arrete: "scene:s'arrête", lampe: "scene:lampe", eteint: "scene:s'éteint",
    chir: "scene:chirurgien", rien: "scene:rien", tosystem: "tosystem",
  });
  setAct(tl, 1, 0);
  /** A readout of the header beats once on a word. */
  const pulse = (sel, at) => tl.fromTo(sel, { scale: 1 }, { scale: 1.16, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "100% 50%", immediateRender: false }, at);

  /* ═════════════ THE HOOK ═════════════ */
  /* ───────────── « Tu dors, sur la table d'opération. Dans un appareil, un fil touche le métal. » ───────────── */
  // moving from the first frame: over your feet, into the appliance's casing; it lands just before « métal »
  const atDev = t.metal - 0.12;
  shot(0, atDev, DEVICE, glide(1.1, 0));
  st(0, atDev, { ...L_DEV }, "sine.inOut");
  st(t.metal, 0.25, { fault: 1 }, "power2.out");
  now(t.metal, { faults: 1 });
  shot(atDev, t.sauterait - atDev, { d: DEVICE.d * 0.93 }, "sine.out");

  /* ───────────── « Chez toi, ça sauterait. Ici, rien ne coupe : exprès. » ───────────── */
  // the pull-back that never lets go of the contact: the whole bloc comes around it, everything lit and running
  const atWide = t.expres - 0.12;
  shot(t.sauterait, atWide - t.sauterait, WIDE, "sine.inOut", DEVICE.d * 0.93);
  st(t.sauterait, atWide - t.sauterait, { ...L_WIDE }, "sine.inOut");
  st(t.expres, 0.3, { cabinet: 1 }, "power2.out");
  st(t.expres + 0.5, 0.9, { cabinet: 0.3 }, "sine.inOut");
  shot(atWide, t.toscene - atWide, { d: WIDE.d * 0.95, az: WIDE.az + 2 }, "sine.out");

  /* ───────────── « Mais ça ne marche… qu'une fois. » ───────────── */
  pulse("#hud-count", t.once);
  st(t.once, 0.12, { fault: 0.93 }, "power1.out");
  st(t.once + 0.12, 0.4, { fault: 1 }, "sine.out");

  /* ═════════════ THE SCENE — a what-if ═════════════ */
  /* ───────────── « Chez toi, ce défaut ferait sauter le différentiel : le noir. » ───────────── */
  // cut 1 — home: 016's wall, the kettle on in the foreground, the consumer unit down the wall; a slow push along it
  cut(t.toscene, SET.HOME, HOME, { ...HOMED, ...L_HOME, gel: 0.12 });
  shot(t.toscene, t.ici2 - t.toscene, { d: HOME.d * 0.94 }, "sine.inOut", HOME.d);
  st(t.diff, 0.25, { ddr: 1 }, "power2.out");
  st(t.noir, 0.15, { dark: 1 }, "power2.in");
  chip("chip-chez", null, 96, 470, t.toscene + 0.1, t.ici2 - 0.25);

  /* ───────────── « Ici, le noir, c'est un respirateur qui s'arrête. » ───────────── */
  // cut 2 — the bloc, the bellows still breathing; on « noir » the room's lights go, on « s'arrête » the bellows stop
  cut(t.ici2, SET.BLOC, RESP, { ...STAGED, ...L_RESP, fault: 1, cabinet: 0, gel: 0.15 });
  st(t.noir2, 0.3, { dark: 1 }, "power2.in");
  st(t.arrete, 0.6, { vent: 0 }, "power2.out");
  const upLamp = t.arrete + 0.45;
  shot(t.ici2, upLamp - t.ici2, { d: RESP.d * 0.94 }, "sine.out");

  /* ───────────── « Une lampe qui s'éteint. » ───────────── */
  const atLamp = t.eteint - 0.05;
  shot(upLamp, atLamp - upLamp, LAMP, "sine.inOut");
  st(upLamp, atLamp - upLamp, { ...L_LAMP }, "sine.inOut");
  st(t.eteint, 0.3, { lamp: 0 }, "power2.in");

  /* ───────────── « Un chirurgien… qui ne voit plus rien. » ───────────── */
  // (the lamp held, a breath closer, until the cut)
  const toSurg = t.chir - 0.1;
  shot(atLamp, toSurg - atLamp, { d: LAMP.d * 0.97 }, "sine.out");
  // cut 3 — down from the dark lamp to the man working under it: the surgeon, the appliance and its point, the cabinet
  // behind the wall at the right (the move from the lamp to him was the jerkiest of the draft)
  cut(toSurg, SET.BLOC, SURGEON, { ...L_SURG });
  st(t.chir + 0.3, 0.7, { work: 0 }, "sine.out");
  st(t.rien, 0.4, { cabinet: 1 }, "power2.out");
  // …and one calm move over the whole phrase, toward the one light left: act 2 cuts to the bench from there
  shot(toSurg, t.tosystem - toSurg, SURG_END, "sine.inOut");
  st(t.rien, t.tosystem - t.rien, { ...L_SYS }, "sine.inOut");
}
