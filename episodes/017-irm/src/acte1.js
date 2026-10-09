// 01 · MENACE — from the first frame to "Alors…" (0 → tosystem). Four cuts in the act: the box, the room, the
// mouth, the machine alone (why four: see the end of this header).
//
// THE HOOK. The first frame (POSE0 / FIRST) is taken from behind the door's wall — it is glass: the silent scanner,
// the mouth of its tunnel toward us, the line on the floor, and in the doorway, you, the cylinder in your arms. It is
// already moving:
//   you         the camera closes in on the doorway ("L'IRM s'est tue. Tu entres…") while the lines of the field
//               gain ground; on "bouteille" they reach the door
//   the flight  "arrachée": the cylinder leaves your arms, crosses the picture from right to left and slaps flat on
//               the machine on "des"; the camera goes with it — you stay a moment, your arms stretched — and
//               lands on the mouth of the tunnel
//   inside      the covers turn to glass where they stand ("Son aimant reste allumé") : the rings, and the current
//               going round on "allumé" ; the header answers on "jour et nuit"
//   the box     a cut (the box looks into the room: half a turn away) — you walk from the doorway to the box with the
//               two buttons ("En urgence, un seul bouton l'éteint…"), and on "pas" your hand slaps the emergency stop:
//               nothing moves in the header, and the picture HOLDS
// THE SCENE. A cut: the whole room, the lines of the field fill it and cross the line on the floor ("30 000 fois le
// champ de la Terre"). From there the camera comes down on the trolley by the wall, through a long lens: on "fer" the
// keys, the scissors, a pen lift off and point at the magnet; when the keys go the lens opens after them, and each
// crosses the whole picture to the mouth of the tunnel. A cut: the mouth, where everything ended up, and someone of
// glass held against the machine by the cylinder ("un objet lourd peut coincer quelqu'un") — the picture holds. A cut: the "what if" is taken back — the machine alone, what is left of its room going out. Act 2 cuts to
// the bench from VIEW.system.
//
// Four cuts where the plan hoped for two, because of what the set allows: the box faces away from every other frame
// (160°); `victim` moves the cylinder 20 cm, so it comes on a cut; and a cylinder on the machine cannot be faded —
// `bottle` → 0 would fly it back to the door — so the last picture starts on a cut too.
//
// The header never moves in this act: 1,5 T, « En marche ». That is the point of "pas".
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, BENCHED, VIEW } from "./world.js";

/* ── the poses (found with arithmetic on the plan's landmarks, checked with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// closer on the doorway: you (≈ 520 px), the cylinder, and the mouth of the tunnel still in the picture on the left
const ENTER = { tx: 75, ty: 130, tz: 220, d: 1150, az: -10.4, el: 11, fov: 35, shift: 228, side: 135, drift: 0.2 };
// the mouth of the tunnel: VIEW.mouth from a little further, the drum clear of the header and of the hook's words
const MOUTH = { tx: -12, ty: 104, tz: 60, d: 1180, az: -26, el: 9, fov: 28, shift: 150, side: 0, drift: 0.3 };
// the box with the two buttons: the door, the box, you (VIEW.box, the top of the door's frame under the header) —
// and closer, from a little higher, your arm on it (higher: the door's top then stays under the header's last row)
const BOX0 = { ...VIEW.box, shift: 125 };
const BOX1 = { ...VIEW.box, tx: 62, ty: 115, tz: 400, d: 560, az: 153, el: 22, fov: 41, shift: 90, side: -30 };
// the whole room, and closer: the line on the floor from edge to edge
const ROOM = { ...VIEW.room, d: 1950 };
const ROOM_IN = { tx: 30, tz: 130, d: 1700 };
// what lies on the trolley, through a long lens: the keys, the scissors, the pen one above the other (seen from
// the front and from above: from the side they hide one another)…
const TROLLEY = { ...P, tx: -250, ty: 100, tz: 160, d: 1373.4, az: -2.6, el: 20.9, fov: 13, shift: 70 };
// …and from the same place, the lens opened: the trolley (left) and the mouth (right) — what leaves the trolley
// crosses the WHOLE picture. (From behind the trolley, VIEW.loose, it flies straight away from the eye: a dot.)
const FLY = { ...P, tx: -122, ty: 105, tz: 120, d: 1420, az: -8, el: 20, fov: 30, shift: 115 };
// the mouth, someone held against it: VIEW.mouth with the top of the drum under the header
const HELD = { ...VIEW.mouth, d: 1150, shift: 125 };
// the machine alone
const SYSTEM = VIEW.system;
const WIDE = 1.3; // …from this much further, on the cut

// the light: what it stands around, and how wide
const L_MACHINE = { fx: STAGED.fx, fy: STAGED.fy, fz: STAGED.fz, fs: STAGED.fs };
const L_BOX = { fx: 62, fy: 120, fz: 400, fs: 150 };
const L_ROOM = { fx: 0, fy: 100, fz: 100, fs: 700 };
const L_TROLLEY = { fx: -272, fy: 95, fz: 160, fs: 120 };
const L_FLY = { fx: -120, fy: 100, fz: 120, fs: 460 };
const L_ALONE = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs }; // (act 2 cuts to the bench under this light)

/** An ease that leaves at `s0` times its mean speed and lands at `s1` times it: moves chained without a stop. */
const glide = (s0, s1) => (u) => s0 * u + (3 - 2 * s0 - s1) * u * u + (s0 + s1 - 2) * u * u * u;

export default function acte1({ D }) {
  const { tl, st, shot, cut, chip, jolt } = D;
  const t = D.times({
    enter: "enter", bottle: "bottle", ripped: "ripped", hit: "accroche:des",
    magnet: "magnet", lit: "promesse:allumé", daynight: "daynight",
    sauf: "sauf", button: "button", notstop: "notstop", no: "promesse:pas",
    toscene: "toscene", tesla: "tesla", times: "scene:fois", earth: "earth", earthEnd: "scene:Terre$",
    iron: "iron", missile: "missile", heavy: "scene:et", pinned: "pinned", back: "back", tosystem: "tosystem",
  });
  setAct(tl, 1, 0);
  /** The header's field answers a word (it never changes in this act). */
  const pulse = (at) => tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.16, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "100% 50%", immediateRender: false }, at);

  /* ═════════════ THE HOOK ═════════════ */
  /* ───────────── A · "L'IRM s'est tue. Tu entres…" ───────────── */
  // the camera closes in on the doorway from the first frame — fastest at the start: a hook moves before its first
  // half second — and the lines of the field gain ground
  const toMouth = t.ripped - 0.08; // (the camera leaves three frames before the cylinder: the hit then falls inside the picture)
  shot(0, toMouth, ENTER, glide(1.3, 0.6));
  st(0, t.enter, { seen: 0.5 }, "sine.out");
  // "…et ta bouteille d'oxygène" : the lines reach the door
  st(t.bottle, t.ripped - t.bottle, { seen: 0.8 }, "sine.inOut");

  /* ───────────── "…t'est arrachée des mains." ───────────── */
  // it leaves your arms (slow, then faster and faster: the set does that) and slaps flat on the machine on "des";
  // the camera goes with it — you stay a moment, your arms stretched after it — and lands on the mouth of the
  // tunnel just before "Son aimant"
  st(t.ripped, t.hit - t.ripped, { bottle: 1 }, "none");
  const atMouth = t.magnet - 0.2;
  shot(toMouth, atMouth - toMouth, MOUTH, glide(0.3, 0.1));
  // the hit: the lines flare, a breath of signal light, a knock on the camera
  st(t.hit - 0.03, 0.08, { seen: 1 }, "power2.out");
  st(t.hit, 0.06, { gel: 0.16 }, "power2.out");
  st(t.hit + 0.06, 0.4, { gel: 0 }, "power2.out");
  jolt(t.hit, 0.14, 0.35);

  /* ───────────── B · "Son aimant reste allumé, jour et nuit." ───────────── */
  // the covers and the vessel turn to glass where they stand: the rings of wire — and on "allumé" the current's
  // round. The lines step back to let it read; the header answers
  shot(atMouth, t.sauf - 0.02 - atMouth, { d: MOUTH.d * 0.95 }, "sine.out");
  st(t.magnet - 0.1, t.lit - (t.magnet - 0.1), { xray: 0.8, seen: 0.45 }, "sine.inOut");
  st(t.lit, t.daynight - t.lit, { spin: 1 }, "sine.out");
  pulse(t.daynight + 0.1);

  /* ───────────── C · "En urgence, un seul bouton l'éteint… et ce n'est pas l'arrêt d'urgence." ───────────── */
  // a cut: the wall by the door, seen from inside the room. You leave the doorway for the box (two steps); it lights
  // up on "bouton"; on "pas" your left hand slaps the emergency stop — and the header has not moved. It holds.
  // (the line on the floor passes right under the camera here — a wide signal arc across the corner of the picture: off)
  cut(t.sauf, SET.SUITE, BOX0, { ...STAGED, bottle: 1, seen: 0.5, line: 0, ...L_BOX });
  st(t.sauf + 0.05, t.button + 0.25 - (t.sauf + 0.05), { spot: 1 }, "sine.inOut");
  st(t.button - 0.05, 0.3, { litButtons: 1 }, "sine.out");
  st(t.notstop - 0.1, t.no - (t.notstop - 0.1), { reach: 1 }, "power2.in");
  shot(t.sauf, t.notstop - t.sauf, BOX1, "sine.inOut");
  shot(t.notstop, t.toscene - 0.02 - t.notstop, { d: BOX1.d * 0.97 }, "sine.out");

  /* ═════════════ THE SCENE ═════════════ */
  /* ───────────── "1,5 tesla : 30 000 fois le champ de la Terre." ───────────── */
  // a cut: the whole room. The lines of the field fill it, and cross the line painted on the floor
  cut(t.toscene, SET.SUITE, ROOM, { ...STAGED, bottle: 1, spot: 1, seen: 0.5, ...L_ROOM });
  st(t.toscene, t.earth - t.toscene, { seen: 1 }, "sine.inOut");
  shot(t.toscene, t.earthEnd - t.toscene, ROOM_IN, "sine.out"); // (already moving on the cut)
  pulse(t.tesla);
  chip("chip-30000", null, 96, 470, t.tesla, t.earthEnd + 0.1);
  tl.fromTo("#chip-30000 b", { opacity: 0 }, { opacity: 1, duration: 0.15 }, t.times - 0.5); // (its second line waits for "30 000")

  /* ───────────── "Ici, le moindre objet en fer devient un projectile…" ───────────── */
  // the camera comes down on the trolley by the wall; on "fer" the keys, the scissors, the pen lift off and point
  // at the magnet, one after the other (slowed down). When the keys go, the lens opens after them — the same place,
  // the whole width of the room: each crosses the picture from left to right and slaps round the mouth of the tunnel.
  // The lines step back: the wakes are signal too
  const toFly = t.earthEnd + 0.15;
  const atFly = t.iron - 0.05;
  const stuck = t.heavy - 0.1; // the cut to the mouth
  const landed = stuck - 0.15; // the last one is on the machine
  const flight = landed - t.iron;
  const go = t.iron + 0.36 * flight; // the keys leave (they are the first: 0 → 0.62 of `loose`, a third of it lifting, then faster and faster)
  const open = t.iron + 0.7 * flight; // the lens is open: the keys land, the scissors are on their way
  shot(toFly, atFly - toFly, TROLLEY, "sine.inOut", ROOM_IN.d);
  // (through the long lens the line on the floor is a wide bright arc beside the trolley: held back while it is the keys' picture)
  st(toFly, atFly - toFly, { ...L_TROLLEY, seen: 0.35, line: 0.55 }, "sine.inOut");
  st(t.iron, flight, { loose: 1 }, "none");
  shot(atFly, go - atFly, { d: TROLLEY.d * 0.985 }, "sine.out");
  shot(go, open - go, FLY, "sine.inOut");
  st(go, open - go, { ...L_FLY, seen: 0.45, line: 1 }, "sine.inOut");
  shot(open, stuck - 0.02 - open, { tx: FLY.tx + 16, d: FLY.d * 0.98 }, "sine.out");
  chip("chip-fer", null, 96, 470, t.iron + 0.05, stuck - 0.16);
  tl.fromTo("#chip-fer b", { opacity: 0 }, { opacity: 1, duration: 0.15 }, t.missile + 0.1);

  /* ───────────── "…et un objet lourd peut coincer quelqu'un contre la machine." ───────────── */
  // a cut: the mouth, everything that flew stuck round it — and someone of glass, whole, still, held against the
  // machine by the cylinder (`victim` moves the cylinder: it comes with the cut). The picture holds
  // (the lines kept low: someone of pale glass against a bright front does not stand a haze of signal over them)
  cut(stuck, SET.SUITE, HELD, { ...STAGED, bottle: 1, spot: 1, loose: 1, victim: 1, seen: 0.45, ...L_MACHINE });
  shot(stuck, t.back - 0.02 - stuck, { d: HELD.d * 0.96 }, "sine.out");
  chip("chip-coince", null, 96, 470, t.pinned, t.back - 0.14);

  /* ───────────── the "what if" is taken back (the silence before "Alors…") ───────────── */
  // a cut — nothing of it can be faded: the machine alone, nobody, nothing on it. What is left of the room goes out,
  // the lines with it, the light turns veille. Act 2 cuts to the bench from VIEW.system with its own state
  // (the room comes back at less than half: from here the trolley stands in the foreground, and the corner of the
  // walls runs down the middle of the picture — and under 0.5 what lies on the trolley is already going)
  cut(t.back, SET.SUITE, { ...SYSTEM, d: SYSTEM.d * WIDE }, { ...STAGED, you: 0, carry: 0, shell: 0.45, line: 0.6, seen: 0.4, ...L_ALONE });
  shot(t.back, t.tosystem - 0.03 - t.back, { d: SYSTEM.d }, "sine.out"); // (already moving on the cut, it settles on VIEW.system)
  st(t.back, t.tosystem - 0.06 - t.back, { shell: 0.25, line: 0, seen: 0 }, "sine.inOut");
  st(t.tosystem - 0.3, 0.28, { mood: 0 }, "none");
}
