// 01 · MENACE — from the first frame to "Alors…" (0 → tosystem). Two cuts in the act: the room, then the breaker.
//
// THE HOOK, one move — a pull-back that never lets go of what it has just shown. The first frame (POSE0 / FIRST) is
// behind the wall, a hand's width from the wire where its conduit is open: a bar of signal light, the stud beside it
// catching the glow, and you through the wall, your back to it. It is already moving:
//   the wire     the camera swings round it and backs away ("Dans ton mur, un fil chauffe") — you pass behind it,
//                the kettle comes in, the wire goes from hot to hotter
//   the wall     it crosses the wall into the room and flies backwards along it, still looking at the wire
//   the breaker  it comes in from the left as the camera passes the consumer unit — the wire still glowing at the far
//                end of the wall — and the camera comes round to its face: closed, its handle up ("Et ton
//                disjoncteur… ne coupe pas") — on "pas" nothing moves: that is the picture
//   inside       its case turns to glass, the works show ("Il n'est pas en panne : il attend")
//   the trip     "…le jour où il saute": the latch lets go, the contacts part, the handle drops, everything goes out;
//                "ne le relève pas": the handle goes back up, the current is back; "deux fois": it drops again — and
//                the picture HOLDS on the handle down
// THE SCENE. A cut: the evening starts again, nothing is on (0 A). The kettle, then the heater, light up on their
// words — the ammeter climbs with them — then down to the strip and its two plugs; from the socket up the wire in the
// wall ("18 ampères, sur un disjoncteur de 16") to the place where it will cook; the header's clock races to just
// under the hour the standard lets the breaker wait. A cut: the breaker, closed — the "what if" winds back — and
// act 2 cuts to the bench from VIEW.system.
//
// The header: `amps` and `load` always move in the same call. `secs` runs 30 times too fast while the overload lasts
// (one frame of film is one second), and faster still on "trop longtemps…".
import { setAct } from "@kit/overlay.js";
import { reaim } from "@kit/direct.js";
import { SET, STAGED, VIEW, HOME } from "./world.js";

/* ── the poses (found with `look`, and with arithmetic for what lies between them) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [HX, HY, HZ] = HOME;
const HERO = { tx: HX, ty: HY + 4.2, tz: HZ + 3.5 }; // where VIEW.system aims
// the first frame — world.js must carry it as POSE0, with FIRST.hotwire 0.7 and FIRST.gel 0.25
const HOOK = { tx: 121.9, ty: 132.4, tz: -1.4, d: 46, az: 164, el: -8, fov: 64, shift: 150, side: -100, roll: 0, drift: 0 };
const HOT0 = 0.7;
const GEL0 = 0.25;
// round the wire and away from it, behind the wall: the hot heart stays in the middle of the picture
// (the picture is pushed up as it goes: the kettle comes in below the wire, and must stay above the hook's words)
const ORBIT = { tx: 120, ty: 150, tz: -3, d: 150, az: 258, el: 3, fov: 46, shift: 360, side: 0 };
// through the wall, in the room, still looking back at the wire (aimed near: the next move leaves from here)
const AWAY = reaim({ tx: 120, ty: 150, tz: -3, d: 237.6, az: 288, el: 5.3, fov: 42, shift: 160, side: 0 }, 120);
// over the breaker: it slides in from the left, in profile, while the wire still glows at the far end of the wall
// (az 285 = −75: the hook's azimuths run on past 180, they never come back the long way round)
const OVER = { ...HERO, d: 66, az: 285, el: 5, fov: 42, shift: 130, side: 220 };
// …and the camera comes round to its face and leans on it: closed, three quarters, its handle up
const CLOSED = { ...HERO, d: 54, az: 300, el: 10, fov: 30, shift: 120, side: 0 };
// VIEW.system, a little further and a little lower (the label stands over it): the works through the glass
const INSIDE = { ...HERO, d: 49, az: VIEW.system.az + 360, el: VIEW.system.el, fov: 28, shift: 110, side: 0, drift: 0.3 };
// the scene: the kettle (top right), the heater (bottom left), the strip between them, the wire going up from the socket
const ROOM = { ...P, tx: 115, ty: 60, tz: 40, d: 360, az: 36, el: 30, fov: 36, shift: 120, side: -30 };
// the strip and its two plugs, the socket above
const PLUGS = { tx: 118, ty: 14, tz: 26, d: 192, az: 25, el: 30, fov: 36, shift: 30, side: 0 };
// close on the wire where it cooks — pushed to the left third: the captions and the smoke get the dark middle
const COOK = { ...VIEW.fault, side: 255 };
// the breaker again, from a little further than VIEW.system
const SYSTEM = VIEW.system;

// the light: what it stands around, and how wide
const L_HERO = { fx: HERO.tx, fy: HERO.ty, fz: HERO.tz };
const L_ROOM = { fx: 110, fy: 50, fz: 40, fs: 160 };
const L_PLUGS = { fx: 118, fy: 15, fz: 20, fs: 60 };
const L_COOK = { fx: 120, fy: 132, fz: 0, fs: 120 };

// the header
const PACE = 30; //        seconds of story per second of film while the overload lasts
const LONG = 55 * 60; //   "trop longtemps": just under the hour the standard obliges a 16 A breaker to hold at 18 A
const KETTLE_A = 9; //     18 A, half of it each (two appliances of about 2 kW) — the header never shows a power

/** An ease that leaves at `s0` times its mean speed and lands at `s1` times it: moves chained without a stop. */
const glide = (s0, s1) => (u) => s0 * u + (3 - 2 * s0 - s1) * u * u + (s0 + s1 - 2) * u * u * u;

export default function acte1({ D }) {
  const { tl, st, now, shot, cut, chip, hide, jolt } = D;
  const t = D.times({
    wire: "wire", hot: "hot", breaker: "breaker", nocut: "nocut", nofault: "nofault", waits: "waits",
    sauf: "sauf", trips: "trips", lift: "promesse:relève", twice: "twice",
    toscene: "toscene", kettle: "kettle", heater: "heater", plug: "plug", a18: "a18", insul: "insul", deg70: "deg70",
    trop: "scene:Trop", cooks: "cooks", back: "back", tosystem: "tosystem",
  });
  setAct(tl, 1, 0);

  /* ═════════════ THE HOOK ═════════════ */
  // While world.js still carries the sets' placeholder (a pose aimed from 136 cm), the act puts its own first frame
  // on the film. Delete this line once POSE0 and FIRST are updated there: the loop returns to world.js's, not to these.
  if (D.pose0.d > 80) cut(0, SET.ROOM, HOOK, { hotwire: HOT0, gel: GEL0 });

  /* ───────────── A · "Dans ton mur, un fil chauffe." ───────────── */
  // round the wire and back from it: slow at first (the first second belongs to the first frame), fast at the end
  const tOrbit = t.hot + 0.4; //    "…chauffe" is being said
  const tOver = t.breaker + 0.4; // the breaker is in the picture while its name is said
  const tAway = tOrbit + 0.47 * (tOver - tOrbit);
  shot(0, tOrbit, ORBIT, glide(0.35, 1.5));
  st(t.wire - 0.3, t.hot + 0.4 - (t.wire - 0.3), { hotwire: 1 }, "sine.inOut");
  st(0, tOrbit, { fs: 200 }, "sine.in");
  // the header's clock: this current has lasted a while already
  st(0, t.trips, { secs: PACE * t.trips }, "none");

  /* ───────────── "Et ton disjoncteur… ne coupe pas." ───────────── */
  // through the wall (between two studs) and backwards along it; the glass of the room fades as it is brushed past,
  // the signal light stays with the wire. The other devices of the row leave before the unit is in the frame: from
  // this side the differential switch stands in front of the film's breaker
  shot(tOrbit, tAway - tOrbit, AWAY, glide(0.8, 1.3));
  shot(tAway, tOver - tAway, OVER, glide(1.3, 0.25));
  st(tOrbit - 0.15, tAway + 0.2 - (tOrbit - 0.15), { gel: 0 }, "sine.inOut");
  st(tOrbit - 0.2, tAway + 0.2 - (tOrbit - 0.2), { shell: 0.4 }, "sine.inOut");
  st(tOrbit - 0.3, tAway - 0.1 - (tOrbit - 0.3), { others: 0 }, "sine.inOut");
  st(tAway - 0.1, tOver - (tAway - 0.1), { ...L_HERO, fs: 30 }, "sine.inOut");
  // …round to its face: the wire leaves by the right, the camera has stopped when "pas" is said
  const tClosed = t.nocut + 0.45;
  shot(tOver, tClosed - tOver, CLOSED, glide(0.4, 0));
  st(tOver, tClosed - tOver, { fs: 16 }, "sine.inOut");
  chip("chip-18", null, 96, 470, t.nocut - 0.2, t.nofault - 0.56);

  /* ───────────── B · "Il n'est pas en panne : il attend." ───────────── */
  // its case turns to glass where it stands: the works, the blade hardly warm, the current running through
  const toInside = t.nofault - 0.5;
  const atInside = t.waits - 0.1;
  shot(toInside, atInside - toInside, INSIDE, "sine.inOut");
  shot(atInside, t.toscene - 0.02 - atInside, { d: INSIDE.d * 0.97 }, "sine.out");
  st(toInside, atInside - toInside, { fs: 8 }, "sine.inOut");
  st(t.nofault - 0.1, t.waits - 0.2 - (t.nofault - 0.1), { xray: 1 }, "sine.inOut");
  chip("chip-attend", null, 96, 470, t.waits - 0.05, t.sauf + 0.5);

  /* ───────────── C · "Mais le jour où il saute… ne le relève pas deux fois." ───────────── */
  /** It trips: the latch lets go, the spring opens the contacts, the handle follows — and the circuit is off. */
  const trip = (at) => {
    st(at, 0.05, { latch: 1 }, "power2.out");
    st(at + 0.04, 0.09, { gap: 1 }, "power2.out");
    st(at + 0.08, 0.12, { handle: 0 }, "power2.in");
    now(at + 0.06, { amps: 0, load: 0, dark: 1, secs: 0 });
    st(at + 0.06, 0.15, { mood: 0 }, "none");
    jolt(at + 0.06, 0.18, 0.3);
  };
  trip(t.trips);
  // "ne le relève pas": the handle goes back up (it is up when the word is said), the contacts close, the current is back…
  const lift = t.lift - 0.12;
  const on = lift + 0.14;
  now(lift, { latch: 0 });
  st(lift, 0.16, { handle: 1, gap: 0 }, "power2.out");
  now(on, { amps: 18, load: STAGED.load, dark: 0 });
  st(on, 0.12, { mood: 1 }, "none");
  // …"deux fois": and it drops at once (the clock has run for a third of a second, in real time)
  const again = t.twice + 0.12;
  st(on, again + 0.05 - on, { secs: again + 0.05 - on }, "none");
  trip(again);

  /* ═════════════ THE SCENE ═════════════ */
  /* ───────────── "Bouilloire, radiateur, la même multiprise :" ───────────── */
  // the cut: the evening starts again. Nothing is on — no current, the wire cold, the light veille. Each lights up
  // on its word, and the ammeter climbs with it: on "radiateur" it passes the breaker's rating
  cut(t.toscene, SET.ROOM, ROOM, { ...STAGED, you: 0, kettle: 0.15, heater: 0.15, amps: 0, load: 0, secs: 0, hotwire: 0.12, mood: 0, ...L_ROOM });
  st(t.kettle, 0.3, { kettle: 1 }, "power2.out");
  st(t.kettle, 0.3, { amps: KETTLE_A, load: KETTLE_A / 16 }, "power2.out");
  st(t.heater, 0.3, { heater: 1 }, "power2.out");
  st(t.heater, 0.3, { amps: 18, load: STAGED.load }, "power2.out");
  const over = t.heater + 0.3;
  st(t.heater + 0.1, 0.25, { mood: 1 }, "none");
  st(over, t.trop - over, { secs: PACE * (t.trop - over) }, "none");
  // down to the strip: its two plugs, the cord to the socket
  const toPlugs = t.plug - 0.55;
  const atPlugs = t.plug + 0.4;
  shot(t.toscene, toPlugs - t.toscene, { d: ROOM.d * 0.945 }, "sine.out");
  shot(toPlugs, atPlugs - toPlugs, PLUGS, "sine.inOut", ROOM.d * 0.945);
  st(toPlugs, atPlugs - toPlugs, L_PLUGS, "sine.inOut");

  /* ───────────── "18 ampères, sur un disjoncteur de 16." ───────────── */
  // from the socket up the wire, in the wall. The header answers; the label says what the breaker is rated for
  const toWire = t.a18 - 0.1;
  const atCook = t.insul + 0.15;
  shot(atPlugs, toWire - atPlugs, { d: PLUGS.d * 0.96 }, "sine.out");
  shot(toWire, atCook - toWire, COOK, "sine.inOut", PLUGS.d * 0.96);
  st(toWire, atCook - toWire, L_COOK, "sine.inOut");
  // (the sideboard's glass is brushed past on the way up: the room's glass steps back, the wire and the socket stay)
  st(toWire, 0.8, { shell: 0.5 }, "sine.inOut");
  st(atCook - 0.8, 0.8, { shell: 0.85 }, "sine.inOut");
  st(over, t.insul - over, { hotwire: 0.55 }, "sine.inOut");
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.16, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "100% 50%", immediateRender: false }, t.a18 + 0.1);
  // (the label is already placed by the hook: it only comes back)
  tl.fromTo("#chip-18", { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, t.a18 + 0.1);
  hide("#chip-18", t.insul - 0.15, 0.12);

  /* ───────────── "L'isolant du fil est fait pour 70 degrés." ───────────── */
  // close on the wire, where its conduit is open: it is warmer already
  shot(atCook, t.back - 0.02 - atCook, { d: COOK.d * 0.85 }, "sine.out");
  st(t.insul, t.trop - t.insul, { hotwire: 0.8 }, "sine.inOut");
  chip("chip-70", null, 96, 470, t.deg70, t.trop - 0.12);

  /* ───────────── "Trop chaud, trop longtemps… il cuit." ───────────── */
  // the clock races, the wire goes to full heat under a signal light; on "cuit" its insulation darkens, blisters,
  // a thread of grey smoke leaves it — never a flame
  st(t.trop, t.cooks - 0.1 - t.trop, { hotwire: 1 }, "sine.in");
  st(t.trop, t.cooks - t.trop, { secs: LONG }, "power2.in");
  st(t.trop, 1, { gel: 0.22 }, "sine.inOut");
  st(t.cooks, 0.45, { char: 1 }, "power2.out");
  // (the label's second line waits for its word)
  chip("chip-cuit", null, 96, 470, t.trop + 0.05, t.back - 0.14); // (it has left before the cut)
  tl.fromTo("#chip-cuit b", { opacity: 0 }, { opacity: 1, duration: 0.15 }, t.cooks);

  /* ───────────── the "what if" winds back (the silence before "Alors…") ───────────── */
  // a cut — the unit is three metres away: the breaker, closed, alone on its rail; the clock runs back to zero, the
  // room's glass fades, the light goes veille. Act 2 cuts to the bench from VIEW.system with its own state
  cut(t.back, SET.ROOM, { ...SYSTEM, d: SYSTEM.d * 1.35 }, { ...STAGED, you: 0, others: 0, shell: 0.5, secs: LONG, ...L_HERO, fs: 8 });
  shot(t.back, t.tosystem - 0.03 - t.back, { d: SYSTEM.d }, "sine.out", SYSTEM.d * 1.35);
  st(t.back, 0.5, { secs: 0 }, "power2.out");
  st(t.back + 0.1, 0.45, { shell: 0.3 }, "sine.inOut");
  st(t.tosystem - 0.3, 0.28, { mood: 0 }, "none");
}
