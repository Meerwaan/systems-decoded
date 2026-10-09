// 02 · AUTOPSIE — from "Alors…" to the cut of act 3 (tosystem → tozero).
//
// The system in the kitchen, while everything round it fades; the same system on the bench, at the same place of the
// picture (benchCut); it comes apart into a row laid across the camera, and the voice names its parts from right to
// left: ONE travelling — the tap under its knob, then the spring and the electromagnet in a single frame (the glow
// says which one is being named), then back to see the row's left half and in on the pin beside the burner. The two
// parts of the heart have their gesture: the spring is squeezed and springs back ("ne demande qu'à le fermer");
// squeezed again with the magnet alive, it stays ("pour le retenir").
// Then the bench DEMONSTRATES (the story's clock keeps running meanwhile: in the kitchen the gas is still coming out):
// the burner lit again, the knob held down — the pin reddens in the flame; a head of light leaves it and runs down
// the lead, the camera follows it to the magnet unit, which turns to glass. Three cuts in on the same axis, each
// closer: the heart in profile — the magnet takes hold, the knob comes up, the valve stays open; then the gap itself
// for "pas assez pour l'attirer": the magnet glows, the armature is half a centimetre away, NOTHING moves. The camera
// pulls back to the knob, which comes down and sets the plate against the poles; it comes up again and everything
// stays open, the gas running to the flame.
// The threshold does not stop the film: a cut to the kitchen, the dead burner under the saucepan and its foam (the
// picture of the hook), the lead going down under the top, and the camera already on its way to the pin. Act 3 cuts
// from there.
//
// In the kitchen `heat` and `volts` never go up between `out` and `trigger` (the story runs in real time): they are
// STAGED's here, on both cuts. On the bench they take the values of the demonstration.
//
// What the header forbids (measured, frame by frame): the burner's cap, lifted high in the row, climbs into it when
// the camera travels straight from the heart to the pin — hence the pull-back to ROW_LEFT first; a dive from the chain
// to the heart drags the flames through it — hence the cut; in the heart's profile the glass top's edge and the knob's
// spindle cross it unless the frame is pushed up and aside (HEART); the flames of the bench reach it from d < 33.
// What the captions forbid: the burner's pale cup under the pin (PIN is no closer than d 36).
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, SYSTEM } from "./world.js";

// where the system stands in the kitchen, counted from where it stands on the bench
const HOME = SYSTEM.home.map((v, i) => v - SYSTEM.bench[i]);
// the bench's light, stood round the system in its hob: it is lit alike on both sides of the cut
const LIT = { fx: HOME[0] + BENCHED.fx, fy: HOME[1] + BENCHED.fy, fz: HOME[2] + BENCHED.fz, fs: BENCHED.fs };

/* ── in the kitchen: the system, alone ── */
const ALONE = { ...VIEW.system, shift: 200 }; // the cut to the bench leaves from here
const ALONE_FAR = { ...ALONE, d: 92 };
/* ── on the bench: the row ── */
const ROW = VIEW.exploded;
const ROW_TAP = { ...VIEW.rowTap, d: 62, shift: 160 }; // the knob lifted over its tap
const ROW_HEART = { ...VIEW.rowHeart, d: 28 }; // magnet · armature · spring and seal, in ONE frame
const ROW_HEART_NEAR = { ...VIEW.rowHeart, d: 25 };
// the left half of the row: from the heart (right) along the lead to the open burner (left)
const ROW_LEFT = { ...VIEW.exploded, tx: -3.2, ty: 5.5, tz: -1.2, d: 100, el: 22, shift: 200, side: 0 };
const ROW_TIP = { ...VIEW.rowTip, d: 66, shift: 150 }; // the burner open, the pin in front of its crown (the cap stays under the header)
const ROW_TIP_NEAR = { ...ROW_TIP, d: 62, ty: 8.2 };
/* ── on the bench: the demonstration ── */
// the pin in the flame (the tips of the flames stay under the header)
const PIN_FAR = { ...VIEW.tipPart, d: 40, shift: 170 };
const PIN = { ...VIEW.tipPart, d: 36, shift: 170 };
// the whole chain: the flame, the red pin, the lead, the magnet unit, the knob
const CHAIN = { ...VIEW.chain, d: 68, shift: 100 };
const CHAIN_ON = { ...CHAIN, tz: 3.8, d: 66 }; // it glides along the lead, toward the magnet
// the heart in profile, from the lead's nut to the cone under the knob's spindle (pushed up and aside: the glass
// top's edge passes over the header, the knob's spindle to the right of it)
const HEART_FAR = { ...VIEW.magnetPart, tz: 4.5, d: 24.5, shift: 250 };
const HEART = { ...HEART_FAR, d: 23.5 };
// a punch-in on the same axis: the gap between the poles and the armature
const GAP = { ...VIEW.magnetPart, tz: 4.8, d: 18.5, shift: 150 };
const GAP_NEAR = { ...GAP, d: 17.5 };
// the knob over the heart: what your hand does to it
const KNOB = { ...VIEW.pressPart, ty: 6, tz: 6.6, d: 48, az: -80, shift: 74 };
/* ── in the kitchen: the threshold ── */
const [HX, HY, HZ] = SYSTEM.home;
// (the picture is pushed up: the foam on the top then lies above the chevrons that point at the follow button, and under it the lead shows, going down to the magnet)
const BURNER = { ...VIEW.burner, shift: 355 };
const TO_PIN = { ...VIEW.burner, tx: HX - 1.8, ty: HY + 2.3, tz: HZ + 3.4, d: 36, az: -38, el: 8, shift: 430 };

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip } = D;
  const A = world.system.A;
  const t = D.times({
    tosystem: "tosystem", tobench: "tobench", explode: "explode", sous: "eclate",
    p1: "p1", p2: "p2", demande: "eclate:demande", fermer: "eclate:fermer",
    p3: "p3", retenir: "eclate:retenir", flamme: "eclate:flamme", p4: "p4",
    torepos: "torepos", hot: "hot", fabrique: "repos:fabrique", current: "current", mv: "mv", mieux: "repos:mieux",
    juste: "repos:Juste", aimant: "repos:aimant", grip: "grip",
    tomain: "tomain", weak: "weak", cest: "main:c'est", press: "press", warm: "warm",
    toseuil: "toseuil", seuil: "seuil", gaz: "seuil:gaz", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.tosystem);
  /** The time between two instants of the script — never less than `min` (the voice is not recorded yet: a gap may shrink). */
  const span = (from, to, min = 0.25) => Math.max(min, to - from);

  /* ───────────── "Alors…" — the system in its hob. Everything round it fades: it stays alone ───────────── */
  cut(t.tosystem, SET.KITCHEN, ALONE_FAR, { ...STAGED, ...LIT });
  const alone = t.tobench - t.tosystem;
  shot(t.tosystem + 0.02, alone - 0.02, ALONE, "sine.inOut", ALONE_FAR.d);
  st(t.tosystem + 0.04, alone * 0.7, { shell: 0, gas: 0, boil: 0 }, "sine.inOut");
  st(t.tosystem + 0.04, alone * 0.8, { pot: 0 }, "sine.inOut"); // (the saucepan's glass goes with `shell`; its water and its foam a little slower)
  st(t.tosystem + 0.04, Math.min(0.45, alone * 0.6), { mood: 0 }, "sine.inOut");

  /* ───────────── "…on l'ouvre." — the same system on the bench, at the same place; then its parts come apart ───────────── */
  // (the pin is still warm and the lead still alive on the cut: the SAME object — they die as it opens)
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: ALONE, origin: HOME, state: { ...BENCHED, heat: STAGED.heat, volts: STAGED.volts, pool: 0, grid: 0 } });
  const opening = t.sous - t.explode;
  st(t.explode, Math.max(1.2, opening * 0.95), { explode: 1 }, "none");
  st(t.explode + 0.05, 0.5, { heat: 0, volts: 0 }, "sine.inOut");
  shot(t.explode + 0.05, Math.max(0.6, opening - 0.1), ROW, "sine.inOut", bench.d);

  /* ───────────── "Sous la manette : un robinet." — the right end of the row ───────────── */
  shot(t.sous - 0.05, t.p1 - t.sous + 0.1, ROW_TAP, "sine.inOut", ROW.d);
  st(t.p1 - 0.05, 0.3, { litTap: 1 }, "sine.out");
  const cTap = co.add({ title: "Robinet", sub: "Ouvre le gaz", x: 430, y: 760, align: "end", anchor: A.tap });
  cTap.show(tl, t.p1);
  cTap.hide(tl, t.p2 + 0.02); // (its leader follows the tap while the camera sets off: it has the time to be read)

  /* ───────────── "Un ressort, qui ne demande qu'à le fermer." — the spring and the magnet in ONE frame ───────────── */
  shot(t.p2 - 0.16, 0.9, ROW_HEART, "sine.inOut", ROW_TAP.d);
  st(t.p2 - 0.37, 0.2, { litTap: 0 }, "sine.inOut"); // (out before the camera sets off: the knob then passes behind the header, and it must be dark)
  st(t.p2 - 0.02, 0.3, { litSpring: 1 }, "sine.out"); // (on its word, the camera still on its way: it goes to what has just lit up)
  const cSpring = co.add({ title: "Ressort", sub: "Ferme le gaz", x: 620, y: 560, align: "end", anchor: A.spring });
  cSpring.show(tl, t.p2 + 0.45);
  cSpring.hide(tl, t.p3 - 0.4);
  // its gesture: squeezed while "ne demande qu'à le…" is being said, it springs back on "fermer"
  st(t.demande - 0.1, span(t.demande, t.fermer), { valve: 1 }, "sine.inOut");
  st(t.fermer, 0.22, { valve: 0 }, "power2.in");

  /* ───────────── "Un électroaimant, pour le retenir." — same frame: the glow changes part ───────────── */
  const leave = t.retenir + 0.5; // the camera sets off again, the gesture done
  shot(t.p3 - 0.2, leave - t.p3 + 0.2, ROW_HEART_NEAR, "sine.inOut", ROW_HEART.d);
  st(t.p3 - 0.1, 0.3, { litSpring: 0 }, "sine.inOut");
  st(t.p3, 0.3, { litMagnet: 1 }, "sine.out");
  const cMagnet = co.add({ title: "Électroaimant", sub: "Retient le clapet", x: 400, y: 560, align: "start", tone: "system", anchor: A.magnet });
  cMagnet.show(tl, t.p3 + 0.1);
  cMagnet.hide(tl, leave - 0.1);
  // its gesture: the spring is squeezed again — and this time, the magnet alive, it STAYS
  st(t.retenir - 0.25, 0.5, { valve: 1 }, "sine.inOut");
  st(t.retenir - 0.1, 0.35, { hold: 0.4, litMagnet: 0.6 }, "sine.out"); // (more would drown the U of the core in its own halo)

  /* ───────────── "Et dans la flamme… une pointe de métal." — back along the lead to the burner, then in on the pin ───────────── */
  // (two moves: straight from the heart to the pin, the burner's lifted cap climbs into the header)
  const back = Math.max(leave + 0.5, t.flamme - 0.1);
  shot(leave, back - leave, ROW_LEFT, "sine.inOut", ROW_HEART_NEAR.d);
  const onPin = Math.max(back + 0.6, t.p4 + 0.2);
  shot(back, onPin - back, ROW_TIP, "sine.inOut", ROW_LEFT.d);
  // the glow passes from the magnet to the pin
  st(t.p4 - 0.25, 0.3, { litMagnet: 0, hold: 0 }, "sine.inOut");
  st(t.p4 - 0.05, 0.3, { litTip: 1 }, "sine.out");
  const cTip = co.add({ title: "Thermocouple", sub: "La pointe", x: 440, y: 1090, align: "end", tone: "system", anchor: A.tip });
  cTip.show(tl, t.p4 + 0.05);
  cTip.hide(tl, t.torepos - 0.3);
  shot(onPin, span(onPin, t.torepos), ROW_TIP_NEAR, "sine.inOut", ROW_TIP.d);

  /* ───────────── "Chauffée, cette pointe…" — the system whole again, the burner lit, the knob held down ───────────── */
  // (the fire cannot be drawn while the row is open: the flame catches on the cut, port after port, and reaches the pin last)
  cut(t.torepos, SET.BENCH, PIN_FAR, { ...BENCHED, press: 1, valve: 1 });
  st(t.torepos + 0.02, t.hot - t.torepos + 0.35, { flame: 1 }, "sine.out");
  shot(t.torepos + 0.02, span(t.torepos + 0.18, t.current), PIN, "sine.inOut", PIN_FAR.d);
  st(t.hot + 0.25, span(t.hot + 0.1, t.fabrique, 0.5), { heat: 1 }, "sine.inOut"); // it reddens

  /* ───────────── "…fabrique du courant : trente millièmes de volt, au mieux." — a head of light goes down the lead ───────────── */
  // 0 → 0.4 is the head's way from the pin to the magnet unit; the camera goes with it and the unit turns to glass
  const descent = t.mv - t.current + 0.7;
  st(t.current, descent, { volts: 0.4 }, "sine.inOut");
  st(t.current + descent, Math.max(0.3, t.mieux - t.current - descent), { volts: 1 }, "sine.inOut");
  shot(t.current - 0.12, descent, CHAIN, "sine.inOut", PIN.d);
  st(t.current + 0.25, Math.max(0.4, descent - 0.4), { xray: 1 }, "sine.inOut");
  chip("chip-mv", null, 96, 448, t.mv + 0.35, t.juste - 0.28);

  // …and it glides on along the lead while the figure is being said
  shot(t.current - 0.12 + descent, span(t.current - 0.12 + descent, t.juste - 0.12), CHAIN_ON, "sine.inOut", CHAIN.d);

  /* ───────────── "Juste assez pour que l'aimant retienne le ressort." — a cut in, on the same axis: the heart, in profile ───────────── */
  // (a dive from the chain was tried: the flames climb through the header on the way)
  cut(t.juste - 0.12, SET.BENCH, HEART_FAR);
  shot(t.juste - 0.1, span(t.juste, t.tomain), HEART, "sine.inOut", HEART_FAR.d);
  st(t.aimant - 0.1, 0.35, { hold: 1 }, "sine.out");
  // "retienne": the knob comes up, the push-rod draws back — the valve stays open: the magnet holds it
  st(t.grip, 0.45, { press: 0 }, "sine.inOut");
  // (the gas runs across the top slot: the label is written under the magnet it names — the frame is still)
  chip("chip-tient", A.magnet, -250, 190, t.grip + 0.15, t.tomain - 0.16);

  /* ───────────── "Pas assez pour l'attirer :" — same axis, closer; everything shut: the magnet glows, and NOTHING moves ───────────── */
  cut(t.tomain, SET.BENCH, GAP, { valve: 0, press: 0, hold: 1, volts: 1, heat: 1, flame: 1, xray: 1, litMagnet: 0 });
  shot(t.tomain + 0.02, span(t.tomain + 0.12, t.cest), GAP_NEAR, "sine.inOut", GAP.d);
  // on "attirer" it tries harder: its glow swells, the plate does not come
  st(t.weak - 0.1, 0.25, { litMagnet: 0.5 }, "sine.out");
  st(t.weak + 0.35, 0.45, { litMagnet: 0 }, "sine.inOut");

  /* ───────────── "c'est pour ça que tu gardes la manette enfoncée," — back to the knob: it sets the plate against the poles ───────────── */
  shot(t.cest - 0.1, span(t.cest - 0.1, t.press, 0.5), KNOB, "sine.inOut", GAP_NEAR.d);
  st(t.press - 0.2, 0.3, { litTap: 0.7 }, "sine.out"); // (a dark knob on a dark bench: it is the part being named)
  st(t.press, 0.4, { press: 1 }, "power2.out");
  st(t.press + 0.42, 0.05, { valve: 1 }, "none"); // (open by hand already: nothing shows — it is what lets the knob come up again)
  chip("chip-main", null, 96, 448, t.press + 0.1, t.warm - 0.16);

  /* ───────────── "le temps qu'elle chauffe." — the knob comes up, all stays open: the gas runs to the flame ───────────── */
  st(t.warm, 0.4, { press: 0, litTap: 0 }, "sine.inOut");
  shot(t.warm - 0.1, span(t.warm - 0.08, t.toseuil, 0.5), CHAIN, "sine.inOut", KNOB.d);

  /* ───────────── the threshold — "Abonne-toi : ce gaz qui sort toujours, regarde ce qui l'arrête." ───────────── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: back in the kitchen, the dead
  // burner under the saucepan and its foam — the picture of the hook —, the lead going down under the top, and ONE
  // move toward the pin, which is what will stop it. The header's gas counter answers "gaz".
  // (the chevrons and the lit name need a third of a second to leave: they are gone when act 3 cuts)
  cut(t.toseuil, SET.KITCHEN, BURNER, { ...STAGED });
  shot(t.toseuil + 0.02, t.tozero - t.toseuil - 0.02, TO_PIN, "sine.inOut", BURNER.d);
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.32) });
  const beat = Math.min(t.gaz, t.tozero - 0.7);
  tl.fromTo("#hud-count", { scale: 1 }, { scale: 1.16, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, beat);
  tl.to("#hud-count", { scale: 1, duration: 0.36, ease: "power2.out" }, beat + 0.3);
}
