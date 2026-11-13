// 01 · MENACE — from the first frame to « Alors… » (tobench). One cut in the act (toscene): the hook is one move out
// of the tub, the scene one move into it.
//
// THE HOOK (A · B · C, 0 → 9,1 s). The first frame (POSE0 / FIRST) is under the lower basket, looking up: the gratin
// dish upside down, its crust signal, the arm already turning under it (`turn`, ≈ 0,9 turn/s), its jets hitting the
// crust — the subject moves from frame 1, the camera only orbits a little (« cramé »: the word that hits). On
// « lave-vaisselle » the camera pulls back by ratio through the door's glass to the whole machine seen from the floor,
// and on « litres » the machine's column fills beside it (`litres`, the TEN LITRES of the whole cycle: never in the
// tub). It goes on pulling back and turning to the kitchen (VIEW.kitchen): on « moitié » the hand's column climbs to
// twice the machine's. « Mais ton rinçage, avant… »: the camera slides to the sink, the light of the evening comes back
// on (the « avant »), you rinse a plate under the tap; on « à quoi ? » that water runs to waste, signal.
// THE SCENE (9,8 → 19,98 s). A cut: the machine in the lit kitchen, its door ajar. « Porte fermée »: it slams.
// « programme éco »: the eco lamp. « tu vas dormir »: the kitchen goes dark and the camera pushes in through the door's
// glass into the tub. « Ni éponge, ni brosse »: a sponge of glass, then a brush, come and go over the dish (ONE tween of
// `ghosts`). « Cinquante degrés au plus… »: down to the floor, the heater reddens. « …contre une croûte cuite au
// four »: up to the crust under the dish, the light turns signal. « Il n'a que ses jets »: down along the jets to the
// arm — the jets come back on the word and the arm spins up. « Alors… »: a push INTO VIEW.system, the pose act 2
// cuts to the bench from (it melts the tub and the kitchen from 19,34).
//
// The header: « 0 h 08 » in the hook (the pre-wash already running); 0 h 00 on the cut (the door is not shut yet), then
// it runs slowly. The water's count never moves here (it climbs only on « cinquante » of the wash, act 2b).
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { POSE0, VIEW } from "./world.js";

/* ── the poses (scene coordinates, plan.js) ── */
// the hook, a little further round the dish (az −9°): the camera orbits while the arm turns
const HOOK_OUT = { ...POSE0, az: POSE0.az - 9 };
// the whole machine from the kitchen floor, its own column at its right (« dix litres »)
const MACHINE = { tx: 18, ty: 44, tz: 20, d: 400, az: -52, el: -3, fov: 38, shift: 40, side: 0, roll: 0, drift: 0.3, dof: 0 };
// the machine and the two columns at its right (VIEW.kitchen from further and lower: the hand's column, full, clears
// the chip; the sink is out of the picture)
const KITCHEN = { ...VIEW.kitchen, tx: 0, ty: 56, tz: 22, d: 380, az: -66, el: 12, shift: 40 };
// the sink: you, the tap, the plate, the waste pipe — and a little closer while the question hangs
// (VIEW.sink from further and more to the left: you stand at the right and stop hiding the plate, the J of the waste
// whole under the bowl)
const SINK = { ...VIEW.sink, tx: -160, ty: 80, tz: 20, d: 440, az: -50, el: 10, shift: 40 };
const SINK_IN = { ...SINK, d: 410, az: -46 };
// the machine in the lit kitchen, its door ajar — and a slow drift while it shuts and the lamp comes on
// (VIEW.door from further: the machine ≈ half the width, the kitchen around it, its evening light on the floor)
const DOOR = { ...VIEW.door, d: 400, shift: -40 };
const DOOR_IN = { ...DOOR, d: 380, az: -36 };
// inside, through the door's glass: the dish over the arm, room above it for the sponge and the brush (further and
// lower than VIEW.tub: at shift 85 they passed under the header)
const TUB = { ...VIEW.tub, d: 155, shift: 10 };
const TUB_DRIFT = { ...TUB, d: 146, az: -30 };
// the floor of the tub: the heater and the sump under the basket's lines
const FLOOR = { tx: 0, ty: 16, tz: 8, d: 110, az: -32, el: 30, fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 };
// the crust from under it (VIEW.crust)
const CRUST = VIEW.crust;
// down to the arm under the dish: the arm, its jets, the dish they hit (VIEW.system from further: at d 74 the frame
// is 21 cm wide, the arm does not read) — then « Alors… » pushes in onto VIEW.system exactly (act 2 cuts from it)
const SYS_IN = { ...VIEW.system, d: 110, az: -36, shift: 60 };

export default function acte1({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    crame: "accroche:cramé", lave: "accroche:lave-vaisselle", litres: "accroche:litres",
    moitie: "promesse:moitié", toi: "promesse:toi", rincage: "promesse:rinçage", quoi: "promesse:quoi",
    toscene: "toscene", porte: "scene:Porte", eco: "scene:éco", tu: "scene:tu", dormir: "scene:dormir",
    eponge: "scene:éponge", cinquante: "scene:Cinquante", contre: "scene:contre", croute: "scene:croûte",
    il: "scene:Il", jets: "scene:jets", ouvre: "ouvre", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ═════════════ THE HOOK ═════════════ */
  /* ── A · « Ton plat de gratin a cramé. » ── the arm turns under the crust from frame 1, the camera orbits */
  st(0, t.toscene, { turn: t.toscene * 0.9 }, "none"); // ≈ 0,9 turn per second until the cut
  shot(0, t.lave - 0.12, HOOK_OUT, glide(2, 0));
  punch(t.crame, 0.06);

  /* ── « Ton lave-vaisselle a dix litres d'eau pour le décoller. » ── back through the door to the whole machine */
  shot(t.lave - 0.12, t.litres + 0.4 - (t.lave - 0.12), MACHINE, "sine.inOut", POSE0.d);
  st(t.litres, 0.8, { litres: 1 }, "sine.inOut");
  chip("chip-10l", null, 96, 470, t.litres + 0.05, t.moitie - 0.16);

  /* ── B · « En moyenne, moitié moins d'eau que toi. » ── on back to the kitchen, the hand's column climbs */
  shot(t.litres + 0.4, t.moitie + 0.5 - (t.litres + 0.4), KITCHEN, "sine.inOut", MACHINE.d);
  st(t.moitie, 0.9, { hand: 1 }, "sine.inOut");
  chip("chip-moitie", null, 96, 470, t.moitie + 0.02, t.toi + 0.26);
  punch(t.moitie, 0.06);

  /* ── C · « Mais ton rinçage, avant… il sert à quoi ? » ── the slide to the sink; the evening's light comes back */
  const toSink = t.toi + 0.3;
  shot(toSink, t.rincage + 0.3 - toSink, SINK, "sine.inOut");
  st(toSink + 0.1, 0.8, { night: 0 }, "sine.inOut");
  st(toSink + 0.25, 0.4, { you: 1 }, "sine.inOut");
  st(toSink + 0.4, 0.35, { tap: 1 }, "sine.out");
  st(t.rincage, 0.6, { rinse: 1 }, "sine.inOut");
  shot(t.rincage + 0.3, t.toscene - (t.rincage + 0.3), SINK_IN, "sine.inOut");
  st(t.quoi - 0.1, 0.45, { drain: 1 }, "sine.out"); // the water goes to waste, signal

  /* ═════════════ THE SCENE ═════════════ */
  /* ── a cut: the machine in the lit kitchen, the door ajar, the machine dry and still ── */
  cut(t.toscene, null, DOOR, {
    door: 0.4, night: 0, room: 1, shell: 1, dish: 1, crust: 1, crack: 0, ghosts: 0,
    you: 0, tap: 0, drain: 0, rinse: 0, litres: 0, hand: 0, eco: 0, cycle: 0, temp: 22,
    jets: 0, thrust: 0, inlet: 0, loop: 0, heat: 0, water: 0, pump: 1, trap: 0, tab: 0, mood: 0, gel: 0,
    litValve: 0, litSump: 0, litPump: 0, litArm: 0, litTrap: 0, solo: 0,
  });
  shot(t.toscene, t.tu + 0.1 - t.toscene, DOOR_IN, "sine.inOut");
  // « Porte fermée, » — it slams; the clock runs slowly from here
  st(t.porte + 0.18, 0.35, { door: 0 }, "power2.in");
  st(t.porte + 0.4, t.tobench - (t.porte + 0.4), { cycle: 1.4 }, "none");
  // « programme éco, » — the lamp; the machine starts to take a little water (never more than the sump)
  st(t.eco - 0.02, 0.25, { eco: 1 }, "power2.out");
  st(t.eco + 0.3, 4, { water: 0.6 }, "sine.inOut");
  // « tu vas dormir. » — the kitchen goes dark; the camera pushes in through the glass of the door
  st(t.tu, 0.6, { night: 1 }, "sine.inOut");
  shot(t.tu + 0.1, t.eponge + 0.25 - (t.tu + 0.1), TUB, "sine.inOut", DOOR_IN.d);
  // « Ni éponge, ni brosse. » — ONE tween: the sponge full near 0,3 (« éponge »), the brush near 0,72 (« brosse »)
  st(t.eponge - 0.32, 1.89, { ghosts: 1 }, "none");
  punch(t.eponge, 0.06);
  shot(t.eponge + 0.25, t.cinquante - 0.1 - (t.eponge + 0.25), TUB_DRIFT, "sine.inOut");
  // « Cinquante degrés au plus… » — down to the floor: the heater reddens
  shot(t.cinquante - 0.1, t.contre - 0.2 - (t.cinquante - 0.1), FLOOR, "sine.inOut", TUB_DRIFT.d);
  st(t.cinquante, 0.9, { heat: 0.6 }, "sine.inOut");
  chip("chip-50", null, 96, 470, t.cinquante + 0.05, t.contre - 0.3);
  // « …contre une croûte cuite au four. » — up to the crust under the dish; the light turns signal on « croûte »
  shot(t.contre - 0.2, t.il - 0.15 - (t.contre - 0.2), CRUST, "sine.inOut", FLOOR.d);
  st(t.croute - 0.05, 0.3, { mood: 1 }, "sine.inOut");
  punch(t.croute, 0.06);
  // « Il n'a que ses jets. » — down along the jets to the arm; on « jets » they come back and the arm spins up
  shot(t.il - 0.15, t.jets + 0.2 - (t.il - 0.15), SYS_IN, "sine.inOut", CRUST.d);
  st(t.jets - 0.06, 0.3, { jets: 1 }, "power2.out");
  st(t.jets - 0.06, t.tobench - (t.jets - 0.06), { turn: t.toscene * 0.9 + 0.7 }, "power2.in");
  // « Alors… » — a push onto VIEW.system, toward the heart: act 2 melts the tub around it and cuts to the bench from it
  shot(t.jets + 0.2, t.tobench - (t.jets + 0.2), VIEW.system, "sine.inOut", SYS_IN.d);
}
