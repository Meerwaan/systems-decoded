// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). One cut in the act, on `toscene`.
//
// THE HOOK. POSE0 / FIRST: at the glass, from the low left — your left hand flat on the empty front-left zone, the
// saucepan boiling behind it, its steam, the « 9 » blinking. It moves from frame 1 by its subject: the bubbles roll, the
// steam rises, and your fingers lift a hair and press back down on the glass as the voice says « touche »; the camera
// glides in along the glass (a speed ramp, the hand kept in frame). « allumée » hits.
//   « rien »      the glass turns X-ray under your hand: the coil beneath stays DARK (nothing to heat), the chip says why
//   « plaque »    the glass goes black again and the camera travels along it, from your hand to the saucepan
//   « brûler »    the ring of glass around the base turns signal; the word hits
// THE SCENE. A cut (`toscene`), on the same saucepan seen from above: the water rolling (« à gros bouillons » hits). On
// « Même » the camera pulls back by ratio to the two front zones on one glass — your hand on one, the saucepan on the
// other. On « soulever » your right hand closes on the handle; on « poser … son fond » the camera leans toward the zone
// under the saucepan. On « dessous » it dives to the glass and the hob goes X-ray: VIEW.system, its four coils beneath.
// Held through « Alors… » — act 2 cuts to the bench from there (benchCut, same picture).
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { POSE0, VIEW, HOME } from "./world.js";

const [HX, HY, HZ] = HOME;
const PANX = HX + 14, PANZ = HZ + 8; // the saucepan's zone (plan.js ZONES.pan)

/* ── the poses ── */
// the glide of the hook: the same low look, closer (the hand grows, the saucepan stays behind it)
const HOOK1 = { ...POSE0, d: 62, el: 4.5 };
// along the glass toward the saucepan (VIEW.glassLow, a little wider: the base and its ring in frame with the steam)
const GLASS = { ...VIEW.glassLow, d: 95 };
// the cut on the boiling water: from a little further and lower than VIEW.boil, which it then closes on
const BOIL0 = { ...VIEW.boil, d: 100, az: -44, el: 50, dof: 0 };
const BOIL1 = { ...VIEW.boil, d: 82, az: -38, el: 46, dof: 0 };
// « Même verre, même plaque »: the two front zones, your hand on one, the saucepan on the other
const TWO0 = { ...VIEW.twoZones, tx: HX + 1, d: 170, az: -36, el: 22 };
// after « soulever »: wider, drifting right — your right hand closing on the handle comes into the frame
const TWO1 = { ...VIEW.twoZones, tx: HX + 9, d: 195, az: -30, el: 26 };
// « où était son fond »: back low over your hand, the saucepan and its zone behind it (the hook, from higher)
const BASE = { ...VIEW.glassLow, tx: PANX - 8, ty: HY + 4, tz: PANZ, d: 100, az: -62, el: 14, dof: 0 };

export default function acte1({ D, world }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    touche: "accroche:touche", choc: "choc", rien: "rien", plaque: "promesse:plaque", brule: "brule",
    toscene: "toscene", bouillons: "bouillons", meme: "meme", soulever: "soulever", poser: "poser", fond1: "fond1",
    dessous: "dessous", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ── the hook ── */
  // the fingers: a hair off the glass, then pressed back down on « touche »
  // (retouche 14/11: the gesture made visible in the first half-second — the fingers rise from frame 1 and slide back a
  // hair, then press down and slide in on « touche »; frame 0 stays FIRST)
  const up = Math.max(0.2, Math.min(0.32, t.touche - 0.2));
  st(0, up, { hover: 0.8, away: 0.04 }, "power2.out");
  st(up, t.touche - 0.05 - up, { hover: 0.65, away: 0.03 }, "sine.inOut");
  st(t.touche - 0.05, 0.3, { hover: 0, away: 0 }, "power2.in");
  shot(0, t.plaque - 0.25, HOOK1, glide(2.2, 0.4), POSE0.d);
  punch(t.choc, 0.06);
  // « rien »: the glass in X-ray under your hand, the coil dark
  st(t.rien - 0.12, 0.4, { see: 1 }, "sine.inOut");
  chip("chip-vide", world.cuisine.A.palm, -40, -150, t.rien + 0.25, t.plaque + 0.35);
  // « Ce n'est pas ta plaque… »: black glass again, the travelling to the saucepan
  st(t.plaque, 0.5, { see: 0 }, "sine.inOut");
  shot(t.plaque - 0.25, t.brule - t.plaque + 0.25, GLASS, "sine.inOut");
  // « brûler »: the ring of glass around the base, signal
  st(t.brule - 0.15, 0.45, { glassHeat: 1 }, "sine.out");
  punch(t.brule, 0.06);
  shot(t.brule, t.toscene - t.brule, { ...GLASS, d: 88, az: -64 }, "sine.inOut");

  /* ── the scene ── */
  cut(t.toscene, null, BOIL0);
  shot(t.toscene, t.meme - t.toscene - 0.1, BOIL1, "sine.inOut");
  punch(t.bouillons, 0.06);
  // « Même verre, même plaque »: back to the two zones, by ratio
  shot(t.meme - 0.1, t.soulever - t.meme + 0.1, TWO0, "sine.inOut", BOIL1.d);
  // « Tu vas soulever la casserole… »: your right hand on the handle
  st(t.soulever - 0.1, 1.2, { grip: 1 }, "sine.inOut");
  shot(t.soulever, t.poser - t.soulever, TWO1, "sine.inOut");
  // « …et poser ta main où était son fond »: the zone under the saucepan
  shot(t.poser, t.fond1 - t.poser + 0.5, BASE, "sine.inOut");
  // « Avant, regarde dessous »: the dive to the glass, the hob in X-ray
  st(t.dessous - 0.3, 0.8, { see: 1 }, "sine.inOut");
  st(t.dessous - 0.3, 1.2, { fx: HX, fy: HY, fz: HZ, fs: 60 }, "sine.inOut");
  shot(t.fond1 + 0.5, t.tobench - t.fond1 - 0.5, VIEW.system, "sine.inOut");
  punch(t.dessous, 0.06);
}
