// 03 · RÉPONSE — from "Tu tires la poignée." to the chute (tozero → toverdict). You open the door while the oven
// heats: the latch lets go of two switches, the waves are gone in ten microseconds; and if both stay stuck, a
// third one blows the fuse. In cuts — this is where they make the tension. Each one is laid a few frames before
// its sentence, its pose is complete and its state too ({ ...STAGED, … }): nothing is inherited.
//
// Where the camera stands, and why:
//   · your hand on the bar is filmed from below and from the hinge's side: from anywhere else in front of the oven
//     your own head stands between the camera and the door;
//   · the latch is small and dark: its gesture — the hook lifts, the lever lets go — is filmed from CLOSE, in
//     profile from behind the plane of the front (az −99: from further forward the door's plate is a striped slab).
//     The camera is then inside the cavity: the field is not drawn at all (`seen` 0), and only a hint of it on the
//     wide picture of the board, which the veille chain going dark carries;
//   · the extinction is the film's moment. It is filmed in that same profile, from further back: the whole cavity
//     through its glass wall, full of lobes, the plate edge-on, your hand on the bar — then nothing, on the word.
//     No veil, no flash: the lobes are the only bright thing of the picture, and they go;
//   · the three switches stand 8 and 10 cm apart: all three fit between the header and the captions only from
//     115 cm or more. On every picture of the board the image is pushed to the right (`side` < 0): the labels of
//     the top slot (x 96 → 600) then end before the upper switch, and the magnetron comes into the left of the frame;
//   · the "what if" starts from the board as the film left it — dark. On "collés" the same contacts light up again,
//     signal, and the header reads "1 000 W" with the door open: the word changes the picture;
//   · the fuse's flash is a light that has a place: `spark` 0.7, from 65 cm. Once it has died the camera closes in.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED } from "./world.js";

/* ── the poses (found with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// your hand closed on the bar, from below
const HANDLE = { ...P, tx: 2, ty: 158, tz: 66, d: 138, az: -42, el: -14, fov: 30, shift: 0 };
// the cavity behind the plate, full of lobes
const HEAT = { ...P, tx: -8, ty: 161, tz: 58, d: 150, az: -52, el: 5, fov: 40, shift: 120 };
// one hook on its lever (the upper one), then the whole board: two hooks, three switches, the fuse at the bottom left
const HOOK0 = { ...P, tx: 11.2, ty: 167.8, tz: 52.4, d: 66, az: -99, el: 5, shift: 160 };
const HOOK = { ...P, tx: 11.2, ty: 168.4, tz: 52.5, d: 40, az: -99, el: 5, shift: 160 };
const LATCH = { ...P, tx: 11.2, ty: 160.5, tz: 50.5, d: 135, az: -100, el: 4, shift: 185, side: -110 };
// the whole cavity in profile, through its glass wall
const FIELD0 = { ...P, tx: -8, ty: 160.5, tz: 46, d: 178, az: -90, el: 0, fov: 30, shift: 150 };
const FIELD = { ...P, tx: -8, ty: 160.5, tz: 45.5, d: 160, az: -90, el: 0, fov: 30, shift: 150 };
// the door opens, your hand on it
const PULLING = { ...P, tx: -6, ty: 156, tz: 80, d: 190, az: -46, el: -8, fov: 30, shift: 0 };
// the board without its hooks (the door has gone): the two switches and, between them, the third. (The upper
// switch's pip is signal: it stays 60 px clear of the header's last line — from closer than 90 cm it sits on "03 RÉPONSE")
const BOARD = { ...P, tx: 11.2, ty: 159.5, tz: 50.5, d: 124, az: -101, el: 4, shift: 172, side: -90 };
const THIRD = { ...P, tx: 11.2, ty: 160, tz: 50.6, d: 90, az: -101, el: 4, shift: 162, side: -90 };
// the fuse, from far enough for its flash to have a place — then from close, blown
const FUSE = { ...P, tx: 20.6, ty: 149, tz: 46, d: 65, az: -100, el: 6, shift: 160 };
const BLOWN = { ...P, tx: 20.6, ty: 149, tz: 46, d: 46, az: -100, el: 6, shift: 160 };

const BOARD_LIGHT = { fx: 11, fy: 161, fz: 52, fs: 30 };
const TURN = 0.1; // the turntable: turns per second while the oven heats
const FRAME = 1 / 30;

export default function acte3({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    zero: "zero", tozero: "tozero", pull: "pull", grip: "zero:poignée$", chauffe: "zero:chauffe", encore: "zero:encore",
    tolatch: "tolatch", lift: "lift", deux: "loquet:deux", sw: "sw",
    tocut: "tocut", trigger: "trigger", tohand: "tohand",
    tomon: "tomon", stuck: "stuck", third: "third", ferme: "moniteur:ferme", fuse: "fuse", toverdict: "toverdict",
  });
  setAct(tl, 3, t.zero);

  /* ══════════ « Tu tires la poignée. Le four chauffe encore. » ══════════ */
  // your hand is on the bar (the threshold put it there). On "tires" your fingers tighten — the door has not moved
  const SPIN0 = 0.25;
  cut(t.tozero, SET.KITCHEN, HANDLE, { ...STAGED, pull: 0.5, spin: SPIN0, fx: 2, fy: 156, fz: 68, fs: 70 });
  st(t.pull, 0.3, { pull: 0.62 }, "power2.out");
  const toHeat = t.grip - 0.1;
  const atHeat = t.chauffe + 0.15;
  shot(t.tozero, toHeat - t.tozero, { d: HANDLE.d * 0.9 }, "sine.out");
  // the oven runs until the waves are cut — then the plate coasts to a stop
  const coast = 1.6;
  const spun = SPIN0 + TURN * (t.trigger - t.tozero);
  st(t.tozero, t.trigger - t.tozero, { spin: spun }, "none");
  st(t.trigger, coast, { spin: spun + (TURN * coast) / 2 }, "power1.out");
  // "Le four chauffe encore": up to the cavity behind the plate — the field at full
  shot(toHeat, atHeat - toHeat, HEAT, "sine.inOut");
  st(toHeat, atHeat - toHeat, { fx: -8, fy: 150, fz: 70, fs: 110 }, "sine.inOut");
  shot(atHeat, t.tolatch - atHeat, { d: HEAT.d * 0.94 }, "sine.inOut");
  // …and the header's counter answers the word (as it will each time the film changes what it reads:
  // "0 W" when the waves are cut, "1 000 W" again if the contacts stick, "0 W" when the fuse blows)
  const count = (at) => {
    tl.to("#hud-count", { scale: 1.14, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%" }, at);
    tl.to("#hud-count", { scale: 1, duration: 0.4, ease: "power2.inOut" }, at + 0.14);
  };
  count(t.encore);

  /* ══════════ « Le loquet se soulève : deux interrupteurs coupent le courant. » ══════════ */
  // from close: the hook's nose holds the lever down; on "soulève" it rises a centimetre, the lever follows, then lets go
  cut(t.tolatch, SET.KITCHEN, HOOK0, { ...STAGED, pull: 0.62, body: 0.5, seen: 0, ...BOARD_LIGHT, fy: 168, fs: 16 });
  shot(t.tolatch, t.lift + 0.2 - t.tolatch, HOOK, "sine.out", HOOK0.d);
  st(t.lift, 0.25, { latch: 1 }, "power2.out");
  // "deux interrupteurs": back to the whole board — both hooks are up, both levers free…
  const toBoard = t.deux - 0.15;
  const atBoard = t.sw - 0.1;
  shot(toBoard, atBoard - toBoard, LATCH, "sine.inOut", HOOK.d);
  st(toBoard, atBoard - toBoard, { ...BOARD_LIGHT, seen: 0.05 }, "sine.inOut");
  // …"coupent": one, two — the chain goes dark, all the way to the magnetron
  st(t.sw, 0.07, { sw: 0.45 }, "power2.out");
  st(t.sw + 0.16, 0.07, { sw: 0 }, "power2.out");
  chip("chip-sw", null, 96, 446, t.sw + 0.12, t.tocut - 0.16);
  shot(atBoard, t.tocut - atBoard, { d: LATCH.d * 0.95 }, "sine.inOut");

  /* ══════════ « Dix millionièmes de seconde : plus une onde. » ══════════ */
  // the cavity, full. The camera closes on it, faster and faster — and stops on the word: nothing is left but the
  // lamp, and the plate that coasts to a stop. The light turns veille
  cut(t.tocut, SET.KITCHEN, FIELD0, { ...STAGED, pull: 0.62, latch: 1, sw: 0 });
  shot(t.tocut, t.trigger - t.tocut, FIELD, "sine.in");
  st(t.trigger, 2 * FRAME, { power: 0, mood: 0 }, "none");
  st(t.trigger + 2 * FRAME, 0.5, { gel: 0.1 }, "sine.out");
  count(t.trigger + FRAME);
  shot(t.trigger + 0.2, t.tohand - t.trigger - 0.2, { d: FIELD.d * 1.05 }, "sine.inOut");

  /* ══════════ « Ta main, elle, n'a pas fini de tirer. » ══════════ */
  // only now does the door open — slowly: nothing comes out
  cut(t.tohand, SET.KITCHEN, PULLING, { ...STAGED, pull: 0.62, latch: 1, sw: 0, power: 0, mood: 0, gel: 0.1, fx: -4, fy: 156, fz: 72, fs: 110 });
  st(t.tohand, 0.5, { pull: 1 }, "sine.inOut");
  st(t.tohand + 0.15, t.tomon - t.tohand - 0.2, { open: 0.35 }, "sine.inOut");
  shot(t.tohand, t.tomon - t.tohand, { d: PULLING.d * 0.93 }, "sine.inOut");
  chip("chip-zero", null, 96, 446, t.tohand + 0.5, t.tomon - 0.16);

  /* ══════════ « Et si les deux restent collés ? Un troisième se ferme… et fait sauter le fusible. » ══════════ */
  // the board again, the door ajar: the hooks have gone with it, the levers are up. On "collés" the two contacts
  // that have just opened are closed again, signal: the chain is live, the oven heats with its door open
  cut(t.tomon, SET.KITCHEN, BOARD, { ...STAGED, pull: 1, open: 0.15, latch: 1, sw: 0, power: 0, mood: 0, body: 0.5, seen: 0.05, ...BOARD_LIGHT });
  const toThird = t.stuck + 0.4 * (t.third - t.stuck);
  shot(t.tomon, toThird - t.tomon, { d: BOARD.d * 0.95 }, "sine.inOut");
  chip("chip-si", null, 96, 446, t.tomon + 0.15, toThird + 0.1);
  // (lit on "les deux", not on "collés": until then the board, switched off, was a second and a half of near-black picture)
  const lit = t.tomon + 0.3 * (t.stuck - t.tomon);
  st(lit, 0.1, { stuck: 1, power: 1, mood: 1 }, "power2.out");
  count(lit + FRAME);
  // "Un troisième se ferme": the camera goes to the one between them — its rocker comes down on it
  shot(toThird, t.third - 0.05 - toThird, THIRD, "sine.inOut", BOARD.d * 0.95);
  st(t.third - 0.15, 0.25, { monitor: 1 }, "power2.in");
  chip("chip-mon", null, 96, 446, t.third + 0.1, t.fuse - 0.25);
  // …and its wire goes straight back to the fuse: the camera follows it down
  const toFuse = t.ferme - 0.25;
  shot(toFuse, t.fuse - 0.05 - toFuse, FUSE, "sine.inOut", THIRD.d);
  st(toFuse, t.fuse - 0.05 - toFuse, { fx: 20.6, fy: 149, fz: 46, fs: 20 }, "sine.inOut");
  // "sauter": a flash that has a place — it swells for two frames and dies small. Nothing is live any more
  st(t.fuse, 2 * FRAME, { spark: 0.7 }, "power2.out");
  now(t.fuse + FRAME, { fuse: 0 });
  st(t.fuse + 2 * FRAME, 0.32, { spark: 0 }, "power2.out");
  st(t.fuse + FRAME, 2 * FRAME, { power: 0, mood: 0 }, "none");
  count(t.fuse + 2 * FRAME);
  chip("chip-fuse", null, 96, 446, t.fuse + 0.3, t.toverdict - 0.16);
  // …and once the flash has died the camera closes on what is left: the stubs of the filament, the soot
  shot(t.fuse + 0.3, t.toverdict - t.fuse - 0.3, BLOWN, "sine.inOut", FUSE.d);
}
