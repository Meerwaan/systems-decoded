// 01 · MENACE — from the first frame (POSE0 / FIRST: the front passing over you) to « Alors… » (0 → 17,62).
//
// THE HOOK, a flash-forward (+0:04). Low at the hem of your dome, the fire a ceiling over it (candidate C): the front
// rolls on over the foil from frame 1 (`front` −6 → −2, `lean` 0,75 → 0,85, the tongues and embers move by themselves),
// the camera already moving in; on « dessus » the lens hits. « Et tu es sous une feuille d'alu » : the camera dives
// at the hem, the foil warms on its fire side (heat ≤ 0,6: above it, pink tiles in a close shot — 040-actes-maj).
// UNDER THE SHEET (a cut, the section from −x): you, face in the dirt. « fondre » : a puff of heat on the foil, which
// holds · « garder » : the cool layer lights veille at the floor, the hot gas signal above · « sauf si tu lèves… » :
// the camera closes on your head, and on « lèves » it lifts into the red; the lens hits on « tête ».
// THE SCENE (cut `toscene`, −0:25, then real time): the 73 on the crest, the camera running along it; on « 73 » the
// crews come up out of the dark; « piège » hits · CANYON (a cut): over the edge, the front climbing, and on « rabat »
// the wind lays it down on the crest · SHAKE (a cut): your hands pull the packet out of its case on « secondes »,
// it is open on « déplier » and slaps in the wind; behind you the others start going down (Abris 0 → 9).
// The act tweens nothing past 17,62 (act 2 kills the wind from there on the `shake` pose) except the story clock,
// which runs in real time to −16,26 at `tobench` (act 2 freezes it there).
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW, STAGED } from "./world.js";

/* ── the poses ── */
// the hook's dive: the same view, closer on the hem, the camera rising to the ground's level
const HEM = { ty: 44, tz: -26, d: 400, az: -26, el: 1, fov: 44, shift: 30 };
// under the sheet: the section, then closer on your head (it lifts into the red)
// (retouche 06/11: higher and closer — the section and you fill the subject zone, the flames no longer a band cut by
// the header; the camera orbits all along, then a cut on « sauf » closes on your head from above, at the end of the body)
const UNDER = { ...VIEW.under, ty: 16, tz: 30, d: 460, az: -56, el: 24, shift: 80 };
const UNDER_IN = { tz: 34, d: 400, az: -40, el: 27 };
// « pourtant » (a cut): three-quarters from your head's end, the arc of the dome over your back, the floor lighting
const MID = { ...VIEW.under, tx: 0, ty: 24, tz: 40, d: 370, az: -30, el: 28, shift: 70, side: 0 };
const MID_IN = { d: 310, az: -16, el: 25, shift: 160 };
const HEAD = { ...VIEW.under, tx: 0, ty: 22, tz: 52, d: 270, az: -80, el: 15, shift: 60, side: 150 };
const HEAD_IN = { d: 235, az: -72, el: 17 };
// the crest, running along it toward the crews
const CREST = { ...VIEW.crest, side: 60 };
const CREST_ON = { tx: -1500, tz: -1450, d: 5000 };
// over the edge, the front climbing
const CANYON = { ...VIEW.canyon, fov: 32 };
const CANYON_IN = { fov: 27, el: 31 };
// your hands, the packet
const SHAKE = { ...VIEW.shake, ty: 78, d: 380, az: -46, el: 6, shift: 40 };
const SHAKE_OPEN = { ty: 70, d: 500, az: -50, shift: 70 };
const SHAKE_IN = { d: 470, az: -46 };

export default function acte1({ D, world }) {
  const { tl, st, cut, chip, path, punch } = D;
  const t = D.times({
    dessus: "accroche:dessus", et: "accroche:et", alu: "accroche:alu", promesse: "promesse",
    fondre: "promesse:fondre", pourtant: "promesse:pourtant", garder: "promesse:garder", sauf: "promesse:sauf",
    leves: "promesse:lèves", tete: "promesse:tête",
    toscene: "toscene", n73: "scene:soixante", piege: "scene:piège", le: "scene:le", rabat: "scene:rabat",
    vingt: "vingt", secondes: "scene:secondes", deplier: "scene:déplier", abri: "scene:abri", ouvre: "ouvre",
    tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ── the hook: the front rolls over the dome from frame 1 ── */
  // from frame 1 the front surges at the dome, the wind slaps the flames flat, the foil flares (FIRST at frame 0)
  st(0, 0.7, { front: -3.6 }, "power2.out");
  st(0.7, t.promesse - 0.7, { front: -2 }, "none");
  st(0, 0.45, { lean: 0.97 }, "power2.out");
  st(0.45, 0.9, { lean: 0.78 }, "sine.inOut");
  st(1.35, t.promesse - 1.35, { lean: 0.85 }, "sine.inOut");
  st(0, 0.4, { heat: 0.56 }, "power2.out");
  st(0.4, 1.2, { heat: 0.42 }, "sine.inOut");
  st(0, t.toscene, { clock: 4 + t.toscene }, "none"); // the flash-forward runs in real time
  path([
    [0, { ...POSE0 }],
    [t.et, { d: 500, ty: 54 }],
    [t.promesse - 0.1, HEM],
  ], { from: "go", to: "go" });
  punch(t.dessus, 0.06);
  st(t.alu - 0.3, 0.8, { heat: 0.6 }, "sine.inOut"); // « alu »: the foil glows on its fire side

  /* ── under the sheet ── */
  const under = t.promesse - 0.1;
  cut(under, null, UNDER, { cut: 1, you: 1, hands: 1, head: 0, cool: 0, hot: 0.25, heat: 0.45, lean: 0.85, front: -2, embers: 1 });
  path([
    [under, UNDER],
    [t.pourtant - 0.15, UNDER_IN],
  ], { from: "go", to: "go" });
  cut(t.pourtant - 0.15, null, MID, {});
  path([
    [t.pourtant - 0.15, MID],
    [t.sauf - 0.15, MID_IN],
  ], { from: "go", to: "go" });
  // « sauf »: a cut, close on your head at the end of the body; it pushes in while the head lifts
  cut(t.sauf - 0.15, null, HEAD, {});
  path([
    [t.sauf - 0.15, HEAD],
    [t.toscene - 0.04, HEAD_IN],
  ], { from: "go", to: "go" });
  // « fondre »: a puff of heat on the foil (embers, the wind laying the flames), and it holds; then the gusts go on
  st(t.fondre - 0.25, 0.3, { heat: 0.6, lean: 0.95 }, "power2.out");
  st(t.fondre + 0.15, 0.9, { heat: 0.48, lean: 0.85 }, "sine.inOut");
  st(t.fondre + 1.1, 0.35, { heat: 0.57, lean: 1 }, "power2.out");
  st(t.fondre + 1.5, 0.9, { heat: 0.47, lean: 0.8 }, "sine.inOut");
  st(t.fondre + 2.45, 0.35, { heat: 0.56, lean: 0.97 }, "power2.out");
  st(t.fondre + 2.85, 0.9, { heat: 0.5, lean: 0.85 }, "sine.inOut");
  // « garder »: the cool air lights at the floor, the hot gas above
  st(t.garder - 0.15, 0.4, { cool: 1, hot: 0.6 }, "power2.out");
  // « lèves »: the head goes up into the red
  st(t.leves - 0.05, 0.45, { head: 1 }, "power2.inOut");
  punch(t.tete, 0.06, { up: 0.08, hold: 0.18, down: 0.4 });
  chip("chip-toi", world.hero.A.head, -60, -200, t.fondre - 0.6, t.toscene - 0.3);

  /* ── the scene: −0:25, the 73 on the crest ── */
  cut(t.toscene, null, CREST, {
    ...STAGED, clock: -25.43, abris: 0, crowd: 0.3, deploy: 0, fold: 1, front: -120, lean: 0.3, burn: 0, hands: 0,
  });
  st(t.toscene, t.tobench - t.toscene, { clock: -25.43 + (t.tobench - t.toscene) }, "none");
  path([
    [t.toscene, CREST],
    [t.le - 0.2, CREST_ON],
  ], { from: "go", to: "go" });
  st(t.n73 - 0.1, 1.0, { crowd: 1 }, "sine.inOut"); // « 73 »: the crews come up along the crest
  st(t.toscene, t.le - t.toscene, { front: -100 }, "none");
  punch(t.piege, 0.06);
  chip("chip-lieu", null, 96, 470, t.toscene + 0.25, t.le - 0.4);

  /* ── over the edge: the wind lays the flames on you ── */
  const canyon = t.le - 0.12;
  cut(canyon, null, CANYON, { front: -80, lean: 0.3, embers: 1, crowd: 1 });
  path([
    [canyon, CANYON],
    [t.vingt - 0.2, CANYON_IN],
  ], { from: "go", to: "go" });
  st(canyon, t.vingt - canyon, { front: -45 }, "none");
  st(t.rabat - 0.1, 0.8, { lean: 0.8 }, "power2.out");

  /* ── your hands: twenty seconds to open it ── */
  const shake = t.vingt - 0.16;
  cut(shake, null, SHAKE, { front: -45, lean: 0.8, fold: 1, deploy: 0.05, crowd: 1, embers: 1 });
  path([
    [shake, SHAKE],
    [t.deplier + 0.35, SHAKE_OPEN],
    [t.ouvre - 0.05, SHAKE_IN],
  ], { from: "go", to: "rest" });
  st(t.secondes - 0.05, t.deplier - t.secondes + 0.1, { fold: 0.5 }, "power2.inOut");
  st(shake, t.ouvre - 0.05 - shake, { front: -35, deploy: 0.15, abris: 9 }, "none");
}
