// 03 · RÉPONSE — from « Dans la neige qui coule » (tozero) to « …vers la surface. » (toverdict). The climax, in cuts:
// one shot per breath, each cut laid a few frames before its sentence, its pose complete and its state complete
// ({ ...HERE, … }, built on STAGED): nothing is inherited from act 2 (the bench), nothing from the shot before.
//
// THE DEMONSTRATION IS THE SECTION (VIEW.section, pente.js: from your RIGHT, across the slope, the slope laid flat by
// the roll): the flow from its bed to its surface, you in it. « les gros blocs remontent » / « Les petits
// s'enfoncent » : `sort` sorts it on the words. « Et toi… tu es trop petit » : closer on you, you sink (`bury`), the
// big ones ride over you, the clock turns signal (main.js: bury > 0.5).
// THE RESPONSE, from the same side (the flow keeps its direction on screen across every cut): your hand pulls the
// handle (« tires »), the pack turns to glass and the gas goes (« part »: pierced, the gas, the air drawn from the
// snow), the balloon comes out round your head (« s'ouvre »), and back on the section it fills (« en quelques
// secondes », the header's count to 150 L) — you, big among the big ones; the snow passes under you, you rise; on
// « surface » the light lets go (`mood` 0) and the avalanche slows: the end (fin.js) cuts on the flow set still.
//
// The story's clock (`sec`) runs in real time from 17. `travel` runs straight ("none") at one pace and brakes over
// the last sentence; it never runs backwards. `rush` (the flying snow) is kept low on the close shots.
// The balloon's two-lobed middle (bag 0.4–0.7) is passed fast and seen from the side only.
import * as THREE from "three";
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, FIRST, LOOK } from "./world.js";

/* ── the poses (world frame: az −90 your RIGHT, the section's side; roll −32 lays the slope flat on screen) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: LOOK.dof };
const SIDE = { az: -90, el: 4, roll: -32 }; // the section's axis: every shot of this act is on it
// the section whole: the flow from its bed to its surface, you in it
const SECTION = { ...P, ...VIEW.section, d: 1000, shift: 260, drift: 0.3 }; // lifted: the bed above the captions

/* ── the state ── */
const V_RUN = 3; // m of travel per second of film while the snow carries you (pente.js checked 10 cm a frame: nothing jumps)
const HERE = { ...STAGED, roll: 1, sort: 0 };

const L = (x, y, z, s) => ({ fx: x, fy: y, fz: z, fs: s });

export default function acte3({ D, world }) {
  const { tl, st, now, shot, cut, punch } = D;
  const t = D.times({
    zero: "zero", tozero: "tozero", coule: "coule", gros: "gros", remontent: "remontent", petits: "petits",
    enfoncent: "enfoncent", et1: "zero:et", toi: "ettoi", petit: "petit", zeroEnd: "zero$",
    reponse: "reponse", tires: "tires", tiresEnd: "reponse:tires$", le1: "reponse:le", gaz: "gaz3", part: "partg",
    le2: "reponse:le#2", souvre: "souvre", souvreEnd: "reponse:s'ouvre$", en: "reponse:en", quelques: "rq",
    volume: "volume", triple: "triple", la: "reponse:la", passe: "passe", sous: "sous",
    et2: "reponse:et", remontes: "remontes", surface: "surface", toverdict: "toverdict",
  });
  setAct(tl, 3, t.zero);

  /* ── where things are, for a state of this act (the sets posed once at build time, like world.js's HANDOFF) ── */
  const scene = world.set.parent;
  const v = new THREE.Vector3();
  const where = (state, obj) => {
    world.apply({ ...FIRST, ...HERE, ...state, set: SET.SLOPE }, 0);
    scene.updateMatrixWorld(true);
    return obj().getWorldPosition(v).toArray();
  };
  const aim = ([tx, ty, tz]) => ({ tx, ty, tz });
  const S = world.slope.A;
  const H = world.hero.A;

  // the clock, real time from 17 to the end of the act; the slide at one pace, braking over the last sentence
  const span = t.toverdict - t.tozero;
  st(t.tozero, span, { sec: 17 + span }, "none");
  const T0 = 12;
  const tBrake = t.et2 - 0.1;
  const atBrake = T0 + V_RUN * (tBrake - t.tozero);
  const brake = t.toverdict - tBrake;
  st(t.tozero, tBrake - t.tozero, { travel: atBrake }, "none");
  st(tBrake, brake, { travel: atBrake + (V_RUN * brake) / 2 }, "power2.out"); // leaves at V_RUN, lands at 0

  /* ───────────── « Dans la neige qui coule, les gros blocs remontent. Les petits s'enfoncent. » ───────────── */
  cut(t.tozero, SET.SLOPE, SECTION, { ...HERE, travel: T0, bury: 0.35, rush: 0.8, ...L(0, -60, 10, 600) });
  shot(t.tozero, t.et1 - 0.12 - t.tozero, { ...SECTION, d: 930 }, "sine.inOut");
  st(t.remontent - 0.05, 0.8, { sort: 0.55 }, "sine.inOut");
  st(t.enfoncent - 0.05, 0.8, { sort: 1 }, "sine.inOut");

  /* ───────────── « Et toi… tu es trop petit. » — closer on you: you sink, the big ones ride over you ───────────── */
  const chestSunk = where({ bury: 0.9, sort: 1 }, () => S.you);
  const chestHigh = where({ bury: 0.35, sort: 1 }, () => S.you);
  const YOU0 = { ...P, ...SIDE, ...aim(chestHigh), d: 560, fov: 32, shift: 0 };
  const YOU1 = { ...YOU0, ...aim(chestSunk), d: 520 };
  const c1 = t.et1 - 0.12;
  cut(c1, SET.SLOPE, YOU0, { ...HERE, sort: 1, bury: 0.35, rush: 0.7, ...L(...chestHigh, 400) });
  st(t.toi, t.petit + 0.2 - t.toi, { bury: 0.9 }, "sine.inOut");
  shot(t.toi, t.petit + 0.2 - t.toi, YOU1, "sine.inOut");
  st(t.toi, t.petit + 0.2 - t.toi, L(...chestSunk, 400), "sine.inOut");
  punch(t.petit, 0.06, { hold: 0.15, down: 0.4 }); // let go before the cut of « Tu tires »

  /* ───────────── « Tu tires. » — your hand pulls the handle on your strap ───────────── */
  const SUNK = { sort: 1, bury: 0.9, reach: 1 };
  const handle = where({ ...SUNK, pull: 0 }, () => H.handle);
  const PULL = { ...P, ...CLOSE, ...aim(handle), d: 170, az: 55, el: 12, roll: 0, fov: 30, shift: 60 }; // act 1's strap, from your left-front: the same handle
  const c2 = t.reponse - 0.1;
  cut(c2, SET.SLOPE, PULL, { ...HERE, ...SUNK, rush: 0.4, litHandle: 1, ...L(...handle, 60) });
  shot(c2, t.le1 - 0.1 - c2, { ...PULL, d: 158 }, "sine.inOut");
  st(t.tires, 0.25, { pull: 1 }, "power2.out");

  /* ───────────── « Le gaz part. » — the pack of glass: pierced, the gas goes, the air drawn from the snow ───────────── */
  const vent = where({ ...SUNK, pull: 1 }, () => H.venturi);
  const GAS = { ...P, ...CLOSE, ...SIDE, ...aim(vent), d: 150, fov: 30, shift: 40 };
  const c3 = t.le1 - 0.1;
  cut(c3, SET.SLOPE, GAS, { ...HERE, ...SUNK, pull: 1, seethru: 1, rush: 0.4, litHandle: 0.35, litCart: 1, litVenturi: 0.6, ...L(...vent, 60) });
  shot(c3, t.le2 - 0.1 - c3, { ...GAS, d: 140 }, "sine.inOut");
  st(t.gaz - 0.05, 0.2, { pierce: 1 }, "power2.out");
  st(t.part - 0.05, 0.6, { gas: 1 }, "none");
  st(t.part + 0.15, 0.6, { draw: 1, litVenturi: 1 }, "none");

  /* ───────────── « Le ballon s'ouvre. » — round your head and shoulders: the flap jumps, the balloon comes out ───────────── */
  const OPEN_ST = { ...SUNK, pull: 1, pierce: 1, gas: 1, draw: 1 };
  const head = where(OPEN_ST, () => S.head);
  const OPEN = { ...P, ...SIDE, ...aim(head), d: 330, fov: 32, shift: 20 };
  const c4 = t.le2 - 0.1;
  cut(c4, SET.SLOPE, OPEN, { ...HERE, ...OPEN_ST, seethru: 0.5, rush: 0.5, litBag: 1, ...L(...head, 150) });
  shot(c4, t.en - 0.1 - c4, { ...OPEN, d: 360 }, "sine.inOut");
  st(t.souvre - 0.05, 0.45, { bag: 0.3 }, "power2.out");

  /* ───────────── « En quelques secondes, ton volume fait presque le triple. » — the section: it fills, you start up ───────────── */
  // aimed between you and the balloon's crown (uphill of your head: screen left), so the full balloon stays in the frame
  const mid = (a, b) => a.map((x, i) => (x + b[i]) / 2);
  const big = where({ ...OPEN_ST, bag: 1, bury: 0.6 }, () => S.you);
  const crown0 = where({ ...OPEN_ST, bag: 1, bury: 0.9 }, () => H.bagTop);
  const crown1 = where({ ...OPEN_ST, bag: 1, bury: 0.6 }, () => H.bagTop);
  const FULL0 = { ...P, ...SIDE, ...aim(mid(chestSunk, crown0)), d: 640, fov: 32, shift: 0 };
  const FULL1 = { ...FULL0, ...aim(mid(big, crown1)), d: 660 };
  const c5 = t.en - 0.1;
  cut(c5, SET.SLOPE, FULL0, { ...HERE, ...OPEN_ST, bag: 0.3, seethru: 0, rush: 0.8, litBag: 0.6, ...L(...chestSunk, 450) });
  st(t.quelques, 0.9, { bag: 1 }, "power2.out");
  punch(t.triple, 0.06, { hold: 0.15, down: 0.4 }); // let go before the cut of « La neige »
  st(t.volume, t.la - 0.1 - t.volume, { bury: 0.6 }, "sine.inOut");
  shot(c5, t.la - 0.1 - c5, FULL1, "sine.inOut");
  st(c5, t.la - 0.1 - c5, L(...big, 450), "sine.inOut");

  /* ───────────── « La neige passe sous toi. Et tu remontes… vers la surface. » — ONE rise: from the grains streaming
     under you up with you to the surface; on « surface » the light lets go and the avalanche slows ───────────── */
  const up = where({ ...OPEN_ST, bag: 1, bury: 0.35 }, () => S.you);
  const top = where({ ...OPEN_ST, bag: 1, bury: 0.05 }, () => S.you);
  const crown2 = where({ ...OPEN_ST, bag: 1, bury: 0.05 }, () => H.bagTop);
  const low = mid(big, crown1);
  low[1] -= 70; // a little under you: the small grains that pass under
  const high = mid(top, crown2);
  high[1] += 30;
  const UNDER = { ...P, ...SIDE, ...aim(low), d: 680, fov: 32, shift: 0 };
  const RISE = { ...UNDER, ...aim(high), d: 760 };
  const c6 = t.la - 0.1;
  cut(c6, SET.SLOPE, UNDER, { ...HERE, ...OPEN_ST, bag: 1, bury: 0.6, rush: 0.8, litBag: 0.5, ...L(...low, 450) });
  st(t.passe, t.remontes - t.passe, { bury: 0.35 }, "sine.inOut");
  st(t.remontes, t.surface + 0.3 - t.remontes, { bury: 0.05 }, "sine.inOut");
  shot(c6 + 0.05, t.toverdict - c6 - 0.05, RISE, "sine.inOut");
  st(c6 + 0.05, t.toverdict - c6 - 0.05, L(...high, 500), "sine.inOut");
  st(t.surface - 0.1, 0.4, { mood: 0 }, "sine.inOut");
  st(t.surface, t.toverdict - t.surface, { rush: 0.15 }, "sine.inOut");
}
