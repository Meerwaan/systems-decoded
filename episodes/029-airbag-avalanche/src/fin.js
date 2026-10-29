// FIN — from « Voilà le secret » (toverdict) to the last frame, which IS the first.
//   chute        the section, the flow set still and sorted: the big blocks on top, you among them with your balloon,
//                the small grains at the bottom. « Te fait flotter » struck → « Te rend gros »; the account name lights
//                up on « gros »; on « remonte » the frame rises with the big ones toward the surface (by ratio).
//   commentaire  what the film owes the hook's C (« Sauf si ta main… ne tire pas »): cut on the handle, on the bench;
//                « un sac sur cinq ne se gonfle pas » — the balloon stays folded, nothing happens: the picture says it;
//                « personne n'a tiré » — the handle alone lit, intact on its strap; the duel AVEC AIRBAG / SANS, each on
//                its word, never answered for the viewer.
//   like         back on the slope, calm: the flow set, you at its surface under your full balloon (« ça remontera »).
//   prochain     the valley far below: the chalet of glass on « maison », its veille line into the ground on « défaut ».
//                Nothing of the avalanche comes back after it; the voice does not ask to subscribe, the panel does.
//   boucle       « Comme ton sac… le jour où… » — the slope BEFORE the crack, a little further back than POSE0; the
//                camera comes in by ratio and is on POSE0 a quarter of a second before the end; then the crack starts
//                running (linear, at act 1's pace) and lands on FIRST.crack: act 1 carries it on from frame 0.
// `travel` never runs backwards: act 3 leaves it still at ≈ 54.4 m (the chute's cut does not pose it); the like and
// the valley pose it forward (TR), the loop's cut puts it back to 0 with everything else (a cut may pose it).
import * as THREE from "three";
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0 } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const SIDE = { az: -90, el: 4, roll: -32 }; // the section's axis (act 3's): the flow keeps its direction on screen
const TR = 60; // m: the like and the valley, posed forward of act 3's ≈ 54.4 (never backwards)
const L = (x, y, z, s) => ({ fx: x, fy: y, fz: z, fs: s });

export default function fin({ D, world }) {
  const { tl, st, shot, cut, chip, punch, tEnd } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "secret", strike: "strike", verdict: "verdict", gros: "grosc",
    avalanche: "avalanche", remonte: "remonte", tocta: "tocta",
    etudiees: "etudiees", personne: "personne", commentaire: "commentaire", avec: "avec", sans: "sans",
    tolike: "tolike", like: "like", likeEnd: "like$",
    toabo: "toabo", prochain: "prochain", fil: "fil", maison: "maison", defaut: "defaut", aboEnd: "abo$",
    toloop: "toloop",
  });

  /* ── where things are, for a state of this act (the sets posed once at build time, like world.js's HANDOFF) ── */
  const scene = world.set.parent;
  const v = new THREE.Vector3();
  const where = (state, obj) => {
    world.apply({ ...FIRST, ...STAGED, roll: 1, ...state, set: SET.SLOPE }, 0);
    scene.updateMatrixWorld(true);
    return obj().getWorldPosition(v).toArray();
  };
  const aim = ([tx, ty, tz]) => ({ tx, ty, tz });
  const mid = (a, b) => a.map((x, i) => (x + b[i]) / 2);
  const S = world.slope.A;
  const H = world.hero.A;

  /* ═════════════ CHUTE — « Voilà le secret : ton sac ne te fait pas flotter. Il te rend gros. » ═════════════ */
  // the same section, wider, the snow stopped: sorted, the big ones on top with you and your balloon
  const UP = { sort: 1, bury: 0.05, reach: 1, pull: 1, pierce: 1, gas: 1, draw: 1, bag: 1 };
  const you = where(UP, () => S.you);
  const crown = where(UP, () => H.bagTop);
  const top = mid(you, crown);
  const CHUTE0 = { ...P, ...VIEW.section, ...SIDE, d: 1150, fov: 34, shift: 40, drift: 0.3 }; // you and your balloon under the title, the bed above the captions
  const CHUTE1 = { ...CHUTE0, ...aim([top[0], top[1] + 40, top[2]]), d: 860, shift: -60 };
  cut(t.toverdict, SET.SLOPE, CHUTE0, { ...STAGED, ...UP, roll: 1, rush: 0, mood: 0, litBag: 0.4, litHandle: 0.35, ...L(0, -60, 10, 650) });
  shot(t.toverdict, t.avalanche - t.toverdict, { ...CHUTE0, d: 1090 }, "sine.inOut");
  retitle(tl, { showAt: t.secret + 0.1, strikeAt: t.strike, swapAt: t.verdict - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.verdict);
  // « gros » : your balloon lights veille among the big ones
  st(t.gros - 0.05, 0.35, { litBag: 1 }, "power2.out");
  punch(t.gros, 0.06, { hold: 0.18, down: 0.5 });
  // « …ce qui est gros… remonte » : the frame rises with the big ones toward the surface (by ratio)
  shot(t.avalanche, t.tocta - 0.05 - t.avalanche, CHUTE1, "sine.inOut", 1090);
  st(t.avalanche, t.tocta - 0.05 - t.avalanche, L(...top, 450), "sine.inOut");

  /* ═════════════ CE QUI EST DÛ — « Et ta main ? » ═════════════ */
  // cut on the handle (what the hook left hanging), on the bench, the pack whole and folded
  world.apply({ ...FIRST, ...BENCHED, set: SET.BENCH }, 0);
  scene.updateMatrixWorld(true);
  const handle = H.handle.getWorldPosition(v).toArray();
  const HANDLE = { ...P, ...aim(handle), d: 120, az: VIEW.whole.az, el: 14, fov: 30, shift: 0, dof: VIEW.handleBench.dof };
  cut(t.tocta, SET.BENCH, HANDLE, { ...BENCHED, litHandle: 1, ...L(...handle, 60) });
  shot(t.tocta, t.etudiees - 0.1 - t.tocta, { ...HANDLE, d: 108 }, "sine.inOut");
  st(t.etudiees - 0.1, t.personne - t.etudiees, { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs }, "sine.inOut");
  // « un sac sur cinq ne se gonfle pas » : back to the whole pack — the balloon stays folded, nothing happens
  chip("chip-cinq", null, 96, 470, t.etudiees, t.personne - 0.15);
  shot(t.etudiees - 0.1, t.personne - t.etudiees, VIEW.whole, "sine.inOut", 108);
  // « Le plus souvent… personne n'a tiré » : the handle alone lit, intact on its strap; then the slow turn of the duel
  chip("chip-tire", null, 96, 470, t.personne, t.commentaire - 0.15);
  shot(t.personne, t.tolike - 0.1 - t.personne, { ...VIEW.whole, az: -6, d: 245 }, "sine.inOut");
  duelCall(tl, { from: t.commentaire + 0.1, aAt: t.avec, bAt: t.sans, to: t.tolike - 0.3, toneA: "veille", toneB: "signal" });

  /* ═════════════ LIKE — « ça remontera chez quelqu'un… » ═════════════ */
  // the slope, calm: the flow set, you at its surface under your full balloon, the crown far uphill
  const youL = where({ ...UP, travel: TR }, () => S.you);
  const crownL = where({ ...UP, travel: TR }, () => H.bagTop);
  const mL = mid(youL, crownL);
  const LIKE0 = { ...P, ...aim(mL), d: 1000, az: -162, el: 38, fov: 36, shift: 80 }; // high enough that no block stands between you and the lens (22/10 review);
  cut(t.tolike, SET.SLOPE, LIKE0, { ...STAGED, ...UP, travel: TR, roll: 1, rush: 0, mood: 0, litBag: 0.6, litHandle: 0.35, ...L(...mL, 500) });
  shot(t.tolike, t.toabo - t.tolike, { ...LIKE0, d: 1150, az: -152 }, "sine.inOut", 1000);
  likeCall(tl, { from: t.like + 0.12, to: t.toabo - 0.3, count: 5, label: (n) => `${n} personnes` });

  /* ═════════════ PROCHAIN DOSSIER — the valley far below ═════════════ */
  const dT = TR; // VIEW.valley is set at travel 0 (pente.js journal: ty += 61.6·T, tz −= 78.8·T)
  const VALLEY0 = { ...VIEW.valley, ty: VIEW.valley.ty + 61.6 * dT, tz: VIEW.valley.tz - 78.8 * dT, drift: 0.3 };
  cut(t.toabo, SET.SLOPE, VALLEY0, { ...STAGED, ...UP, travel: TR, roll: 1, rush: 0, mood: 0, you: 0, teaser: 0, fx: VALLEY0.tx, fy: VALLEY0.ty, fz: VALLEY0.tz, fs: 6000 });
  shot(t.toabo, t.toloop - t.toabo, { ...VALLEY0, d: 12500 }, "sine.inOut", VALLEY0.d);
  st(t.maison - 0.05, 0.6, { teaser: 0.6 }, "sine.out");
  st(t.defaut - 0.05, 0.6, { teaser: 1 }, "sine.out");
  nextFile(tl, { showAt: Math.max(t.toabo + 0.03, t.prochain - 0.15), factAt: t.fil, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ═════════════ BOUCLE — « Comme ton sac… le jour où… » → « Sous tes skis, la neige casse » ═════════════ */
  const RUN = 0.12 / 0.436; // s: act 1 runs the crack 0.12 → 1 in choc + 0.3 (0.436 a second) — the same pace into frame 0
  const rew = tEnd - RUN;
  const FROM = POSE0.d * 1.22;
  cut(t.toloop, SET.SLOPE, { ...POSE0, d: FROM }, { ...FIRST, crack: 0, rush: 0.1 });
  shot(t.toloop, rew - t.toloop, POSE0, "sine.inOut", FROM);
  st(t.toloop + 0.2, rew - t.toloop - 0.2, { rush: FIRST.rush }, "sine.inOut");
  // from `rew` the camera holds POSE0 and every number not yet FIRST (the crack) glides back to it, linear
  D.loop({ at: t.toloop, rewindAt: rew, ease: "none" });
}
