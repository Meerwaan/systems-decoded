// 02 · AUTOPSIE — from the cut to the bench (tobench, « on ») to the cut of act 3 (tozero).
//
// Act 1 ends on your strap and its lit handle, the time frozen (« Tire. »). On « on » the same pack stands on the
// bench, in place and at the same angle (benchCut, `upright` 0): the slope goes, the pool comes up under it — and it
// opens: the parts come apart and the pack stands up straight while the camera pulls back to the whole exploded view.
// Then the voice walks the parts in order, and the camera with it, one close frame per part, each lit on its word:
// the handle (it is pulled on « tire », the light runs up the cable: no label for it — its anchor stands in the header), the cartridge (pierced on « perce »), the gas up
// into the venturi (« file »), the air drawn in from all round (« aspire »), the folded balloon behind (« plié »).
// « Le gaz ne remplit pas… » : the parts go home, the pack turns to glass — one thread of gas alone; then the air
// from all round; the camera pulls back and the balloon comes out (« cent cinquante litres », the header's count
// climbs). « Encore faut-il… » rewinds it: the balloon folds back, the handle is on the strap again, lit, waiting.
// The threshold does not stop the film: one slow orbit up and round the pack to its top compartment, where the
// balloon waits (it glows through the fabric on « ballon ») — act 3 cuts from there to the same compartment on your
// back, on the slope.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, LOOK } from "./world.js";

/* ── the poses (bench frame: the pack's bottom on the floor, +z its straps' side, +x your left) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: LOOK.dof };
// the exploded view whole, in one vertical frame (the parts in front of the pack, on its left on screen)
const EXPL = { ...P, tx: -3, ty: 40, tz: 18, d: 300, az: 10, el: 14, fov: 30, shift: 40 };
// the handle on the floor of the exploded view, pulled: it and the cable going up out of the frame
const HANDLE = { ...P, ...CLOSE, tx: -1, ty: 12, tz: 38, d: 95, az: 20, el: 18, shift: 60 };
// the cartridge and the trigger on its head (pierced)
const CART = { ...P, ...CLOSE, tx: -6, ty: 42, tz: 34, d: 90, az: 0, el: 12, shift: 120 };
// the venturi, the gas through it, then a little further back: the air comes from all round
const VENT = { ...P, ...CLOSE, tx: -6, ty: 58, tz: 34, d: 70, az: -25, el: 14, shift: 120 };
const VENT_WIDE = { ...VENT, d: 105 };
// the folded balloon, on top of the exploded view
const BAG = { ...P, ...CLOSE, tx: -3, ty: 77, tz: 31, d: 90, az: -30, el: 18, shift: 120 };
// the pack whole, assembled, its fabric glass: the cartridge, the venturi, the folded balloon inside
const PACK = { ...P, tx: 0, ty: 30, tz: 0, d: 220, az: -35, el: 16, fov: 30, shift: 90 };
const PACK_NEAR = { ...PACK, d: 210 };
// the balloon full on the pack (« cent cinquante litres »)
const FULL = { ...P, tx: 0, ty: 70, tz: -5, d: 400, az: -30, el: 14, fov: 30, shift: 20 };
// the handle on the strap again, waiting (« que ta main tire »)
const STRAP = { ...P, ...CLOSE, tx: 9, ty: 26, tz: 22, d: 110, az: -5, el: 12, shift: 70 };
// the top compartment, from above and behind: where the balloon comes out (act 3 cuts to the same on your back)
const TOP = { ...P, tx: 0, ty: 46, tz: -9, d: 170, az: -115, el: 38, fov: 30, shift: 60 };

// the light: what it stands around, and how wide
const L = (x, y, z, s) => ({ fx: x, fy: y, fz: z, fs: s });
const L_WHOLE = L(BENCHED.fx, BENCHED.fy, BENCHED.fz, BENCHED.fs);
const L_EXPL = L(-3, 40, 18, 75);
const L_HANDLE = L(-1, 4, 38, 30);
const L_CART = L(-6, 34, 34, 30);
const L_VENT = L(-6, 58, 34, 30);
const L_BAG = L(-3, 77, 31, 30);
const L_FULL = L(0, 62, -5, 90);
const L_STRAP = L(9, 24, 22, 40);
const L_TOP = L(0, 48, -9, 45);

export default function acte2({ D, world, co }) {
  const { tl, st, shot, punch } = D;
  const A = world.hero.A;
  const t = D.times({
    tobench: "tobench", on: "explode", ouvreEnd: "ouvre$",
    poignee: "epoignee", tire: "etire", cable: "cable",
    perce: "perce", cartouche: "cartouche",
    gaz: "gaz2", file: "eclate:file", venturi: "venturi", aspire: "aspire", autour: "autour",
    derriere: "derriere", plie: "plie", eclateEnd: "eclate$",
    repos: "repos", seul: "seul", raspire: "raspire", rtoi: "rtoi",
    cent: "cent", litres: "litres", quelques: "rquelques", secondesEnd: "repos:secondes$",
    encore: "encore", main: "rmain", rtire: "rtire",
    toseuil: "toseuil", seuil: "seuil", ballon: "sballon", sortir: "sortir", seuilEnd: "seuil$",
    tozero: "tozero",
  });
  setAct(tl, 2, t.tobench);

  /* ───────────── « …on l'ouvre. » — the same pack, in place and at the same angle, on the bench: it opens ───────────── */
  const cutPose = benchCut(D, {
    at: t.tobench, set: SET.BENCH, view: VIEW.strap, origin: world.handoff.origin,
    state: { ...BENCHED, upright: 0, litHandle: 1 },
  });
  st(t.on, 0.9, { explode: 1, upright: 1 }, "power2.out");
  st(t.on + 0.6, 0.4, { litHandle: 0.35 }, "sine.inOut"); // (it comes back on its word)
  const whole = t.ouvreEnd + 0.65; // the whole view reached as the clicks of the parts end
  shot(t.tobench + 0.02, whole - (t.tobench + 0.02), EXPL, "sine.inOut", cutPose.d);
  st(t.tobench + 0.02, whole - (t.tobench + 0.02), L_EXPL, "sine.inOut");

  /* ───────────── « Ta poignée tire un câble. » — down to the handle; it is pulled on « tire », the light runs the cable ───────────── */
  const dive = t.poignee - 0.3;
  shot(dive, t.tire - 0.05 - dive, HANDLE, "sine.inOut", EXPL.d);
  st(dive, t.tire - 0.05 - dive, L_HANDLE, "sine.inOut");
  st(t.poignee - 0.1, 0.25, { litHandle: 1 }, "sine.out");
  st(t.tire, 0.35, { pull: 0.4 }, "power2.out");
  const cHandle = co.add({ title: "Poignée", x: 150, y: 960, align: "start", tone: "system", anchor: A.handle });
  cHandle.show(tl, t.poignee - 0.12);
  const toCart = t.perce - 0.55;
  cHandle.hide(tl, toCart - 0.25);

  /* ───────────── « Il perce une cartouche de gaz. » — up the cable to the cartridge: pierced on « perce » ───────────── */
  shot(toCart, 0.5, CART, "sine.inOut");
  st(toCart, 0.5, L_CART, "sine.inOut");
  st(toCart + 0.1, 0.4, { litHandle: 0.35 }, "sine.inOut");
  st(t.perce - 0.1, 0.25, { litCart: 1 }, "sine.out");
  st(t.perce, 0.2, { pierce: 1 }, "power2.out");
  punch(t.perce, 0.06);
  const cCart = co.add({ title: "Cartouche", x: 150, y: 600, align: "start", tone: "system", anchor: A.cartridge });
  cCart.show(tl, t.cartouche - 0.1);
  cCart.hide(tl, t.gaz - 0.15);

  /* ───────────── « Le gaz file dans un venturi… » — the gas runs up out of the cartridge, the camera with it ───────────── */
  st(t.file - 0.05, 0.6, { gas: 1 }, "none");
  const toVent = t.file - 0.45; // 0.8 s up the gas (qa, 22/10: in 0.45 s the climb came out jerky)
  shot(toVent, t.venturi - 0.05 - toVent, VENT, "sine.inOut");
  st(toVent, t.venturi - 0.05 - toVent, L_VENT, "sine.inOut");
  st(t.venturi - 0.3, 0.4, { litCart: 0.3 }, "sine.inOut");
  st(t.venturi - 0.1, 0.25, { litVenturi: 1 }, "sine.out");
  const cVent = co.add({ title: "Venturi", x: 930, y: 1000, align: "end", tone: "system", anchor: A.venturi });
  cVent.show(tl, t.venturi - 0.1);

  /* ───────────── « …qui aspire l'air autour. » — the air comes in from all round; a step back to see it come ───────────── */
  st(t.aspire, 0.6, { draw: 1 }, "none");
  punch(t.aspire, 0.06);
  shot(t.aspire + 0.1, t.autour + 0.3 - (t.aspire + 0.1), VENT_WIDE, "sine.inOut");

  /* ───────────── « Et derrière, un ballon plié. » — up to the folded balloon, on top ───────────── */
  cVent.hide(tl, t.derriere - 0.25);
  const toBag = t.autour + 0.35; // a 1.45 s climb to the balloon (qa, 22/10: in 0.95 s it was the jerkiest move of the film)
  shot(toBag, t.plie - 0.05 - toBag, BAG, "sine.inOut");
  st(toBag, t.plie - 0.05 - toBag, L_BAG, "sine.inOut");
  st(toBag, 0.4, { litVenturi: 0.3 }, "sine.inOut");
  st(t.plie - 0.1, 0.25, { litBag: 1 }, "sine.out");
  const cBag = co.add({ title: "Ballon", x: 150, y: 600, align: "start", tone: "system", anchor: A.bag });
  cBag.show(tl, t.plie - 0.12);
  cBag.hide(tl, t.repos + 0.25);

  /* ───────────── « Le gaz ne remplit pas le ballon tout seul : » — the parts go home, the pack turns to glass: ONE thread of gas ───────────── */
  const home = t.repos + 0.04;
  const back = t.seul - 0.1 - home;
  st(home, back, { explode: 0 }, "sine.inOut");
  shot(home, back, PACK, "sine.inOut", BAG.d);
  st(home, back, L_WHOLE, "sine.inOut");
  st(home, 0.4, { draw: 0, litBag: 0.3 }, "sine.inOut");
  st(home + 0.5, 0.6, { seethru: 1 }, "sine.inOut");
  st(t.seul - 0.15, 0.3, { litVenturi: 1 }, "sine.out"); // « seul »: the thread alone, the venturi it runs through

  /* ───────────── « il aspire l'air autour de toi. » — the air from all round the pack ───────────── */
  st(t.raspire, 0.7, { draw: 1 }, "none");
  shot(t.seul + 0.2, t.cent - 0.15 - (t.seul + 0.2), PACK_NEAR, "sine.inOut");

  /* ───────────── « Au moins cent cinquante litres, en quelques secondes. » — back: the balloon comes out ───────────── */
  const wide = t.cent - 0.15;
  shot(wide, t.quelques + 0.15 - wide, FULL, "sine.inOut", PACK_NEAR.d);
  st(wide, t.quelques + 0.15 - wide, L_FULL, "sine.inOut");
  punch(t.litres, 0.05);
  st(t.quelques - 0.1, 0.3, { litBag: 1, litVenturi: 0.3 }, "sine.out");
  st(t.quelques, Math.max(0.6, t.secondesEnd - t.quelques), { bag: 1 }, "power2.out");

  /* ───────────── « Encore faut-il… que ta main tire. » — it rewinds: the balloon folds back, the handle waits on the strap ───────────── */
  // (the full balloon is held a breath first; it folds back slowly then fast: the two-lobed middle passes quick)
  const fold = t.encore + 0.25;
  st(fold, 1.2, { bag: 0 }, "sine.inOut"); // (qa, 22/10: 0.85 s in power2.in came out jerky)
  st(fold + 0.3, 0.5, { gas: 0, draw: 0, litBag: 0, litVenturi: 0, litCart: 0 }, "sine.inOut");
  st(fold + 0.5, 0.5, { seethru: 0 }, "sine.inOut");
  st(fold + 0.4, 0.45, { pull: 0, pierce: 0 }, "sine.inOut");
  const down = t.encore - 0.05; // a longer way down to the strap (qa, 22/10: it came out jerky)
  shot(down, t.main + 0.1 - down, STRAP, "sine.inOut", FULL.d);
  st(down, t.main + 0.1 - down, L_STRAP, "sine.inOut");
  st(t.main - 0.1, 0.3, { litHandle: 1 }, "sine.out");
  punch(t.rtire, 0.06);

  /* ───────────── the threshold — « Abonne-toi : ce ballon… regarde-le te sortir de là. » ───────────── */
  // The subscribe call that is heard (kit: followCall). The film does not stop: one slow orbit up and round the pack,
  // from the handle to the top compartment, where the balloon waits; it glows through the fabric on « ballon ».
  const orbit = t.toseuil;
  shot(orbit, t.sortir + 0.1 - orbit, TOP, "sine.inOut");
  st(orbit, t.sortir + 0.1 - orbit, L_TOP, "sine.inOut");
  st(orbit + 0.4, 0.5, { litHandle: 0.35 }, "sine.inOut");
  st(t.ballon - 0.15, 0.5, { seethru: 0.6, litBag: 0.8 }, "sine.out");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
}
