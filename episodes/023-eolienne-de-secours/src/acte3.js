// DOSSIER 023 — 03 RÉPONSE: from « Six heures vingt-six. » to « Et la piste est là. » (tozero → toverdict). The climax.
// In cuts, one shot per breath. Every cut is laid a few frames before its sentence, its pose complete and its state
// whole ({ ...HERE, … }, built on STAGED): nothing is inherited from the act before, nor from the shot before.
//
// THE ORDER OF THE CAUSES, and no other: the second engine dies (the header: « 1 / 2 » → « 0 / 2 », signal) → ten
// thousand metres over the sea → no autopilot → the plane comes down → the RAT comes out → it spins → ONE circuit of
// three comes back (veille, from the bay outward; the two others stay signal) → the control surfaces answer → the
// captain aims for an island → nineteen minutes of glide (the altimeter runs down) → the runway is there: on « là »
// its lamps and the header turn veille (`mood` 0) — not before.
//
// Two numbers run straight through the act and are never put in a cut: `ahead` (the world comes to the plane) and,
// once the RAT is out, `turn` (its blades: ≈ 1,6 turns a second, never faster — `whirl` draws the disc).
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, VIEW, ENGINES, BAY, TAIL } from "./world.js";

/* ── the poses (found with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [BX, BY, BZ] = BAY.at;
// the near (left) engine, close, three quarters front: it still runs — then it dies
const ENG0 = { ...P, ...VIEW.engine, d: 2200, side: -70 };
const ENG1 = { ...ENG0, d: 1950 };
// the plane small, high in the frame, from above and ahead: the cloud deck and the black sea very far below it (the
// island is behind the camera: it is not shown before « vise une île »). A slow pull-back: the drop opens under it
const WIDE0 = { ...P, tx: -700, ty: -4500, tz: 0, d: 28000, az: -30, el: 22, fov: 40, shift: 0 };
const WIDE1 = { ...WIDE0, d: 33000 };
// you at your window, the cabin full around you
const YOU0 = { ...P, ...VIEW.you };
const YOU1 = { ...YOU0, d: 880 };
// the whole plane from the side, a little below: it noses down and sinks in the frame
// (d 14 000: the nose and the tail in the frame; the camera's aim rises 12 m, the plane sinks under it)
const PLANE0 = { ...P, ...VIEW.plane, d: 14000, ty: -700 };
const PLANE1 = { ...PLANE0, ty: 500 };
// the belly and the bay: the door, then the arm and the propeller in the wind
// (from the front-left and below: the near engine is out of the frame, the bay's box above it)
const BAY0 = { ...P, tx: BX, ty: BY - 152, tz: BZ, d: 700, az: -70, el: -20, shift: 120 };
const BAY1 = { ...BAY0, d: 650 };
// the propeller alone, from ahead-left and below, nothing between it and the camera: its disc square enough to read
const PROP0 = { ...P, tx: BX, ty: BY - 172, tz: BZ, d: 560, az: -55, el: -30, shift: 200 };
const PROP1 = { ...PROP0, d: 520 };
// the three circuits from below, the bay to the wings and the tail
const CIRC0 = { ...P, tx: 0, ty: -300, tz: 0, d: 7600, az: -60, el: -55, fov: 34, shift: 80 };
const CIRC1 = { ...CIRC0, d: 7100 };
// the tail and its three surfaces, from behind
// (three quarters from behind and above, close: the fin and the stabiliser fill the frame)
const TAIL0 = { ...P, tx: 2500, ty: 250, tz: 0, d: 6500, az: 65, el: 14, fov: 34, shift: 60 };
const TAIL1 = { ...TAIL0, d: 6100 };
// the approach, from behind: the island far ahead and far below (alt ≈ 10 000) → the runway in front of the nose (alt 600)
// (both pushed up: the plane, then the runway, stay above the captions)
const APP1 = { ...P, ...VIEW.approach, shift: 260 };
const APP0 = { ...P, tx: -30000, ty: -13000, tz: 0, d: 75000, az: 90, el: 16, fov: 34, shift: 100 };

/* ── the light: what it stands around, and how wide ── */
const L_ENG = { fx: ENGINES.x, fy: ENGINES.y, fz: ENGINES.z, fs: 600 };
const L_WIDE = { fx: -700, fy: -250, fz: 300, fs: 8000 };
const L_YOU = { fx: -1460, fy: 10, fz: 240, fs: 500 };
const L_PLANE = { fx: -700, fy: -250, fz: 300, fs: 3500 };
const L_BAY = { fx: BX, fy: BY - 90, fz: BZ, fs: 300 };
const L_CIRC = { fx: 400, fy: -260, fz: 0, fs: 3000 };
const L_TAIL = { fx: TAIL.x, fy: 200, fz: 0, fs: 1800 };
const L_APP = { fx: -6000, fy: -1500, fz: 0, fs: 6000 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    tozero: "tozero", h626: "h626", second: "second", dies: "zero:s'éteint", towide: "zero:Dix-0.12", meters: "zero:mètres",
    toyou: "zero:Plus-0.12", nopilot: "nopilot", toplane: "zero:Et-0.12", descends: "zero:descend",
    tobay: "reponse:L'hélice-0.15", trigger: "trigger", rsort: "reponse:sort", rturn: "rturn", toprop: "reponse:Elle-0.12", tourne: "reponse:tourne",
    tocirc: "reponse:Un-0.12", rcircuit: "rcircuit", revit: "reponse:revit",
    totail: "reponse:Les-0.12", surf: "reponse:gouvernes", respond: "reponse:répondent",
    toapp: "reponse:commandant-0.24", captain: "captain", island: "reponse:île", m19: "reponse:Dix-neuf", minutes: "m19", glide: "glide",
    runway: "runway", there: "there", la: "reponse:là",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word: a beat on the altimeter (#hud-clock) or on the engines (#hud-count). */
  const beat = (sel, at, k = 1.18) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  // the sky as this act finds it: night, the glide, the RAT in its bay, you at your window, a little signal in the light
  const HERE = { ...STAGED, gel: 0.1 };

  /* ── what runs through the whole act ── */
  // the world comes to the plane: straight, ≈ 0,01 a second while it cruises…
  now(t.tozero, { ahead: 0.94, alt: 10500 });
  st(t.tozero, span(t.tozero, t.toapp), { ahead: 0.82 }, "none");
  // …the altimeter holds 10 500 until the plane comes down: it gives way on « descend », then slowly
  st(t.descends - 0.1, span(t.descends - 0.1, t.tobay), { alt: 10300 }, "power1.out");
  st(t.tobay, span(t.tobay, t.toapp), { alt: 10100 }, "none");

  /* ───────────── « Six heures vingt-six. Le second moteur s'éteint. » ───────────── */
  // the near engine, close: it still runs (ink, its fan a blur; the far one is dead already). On « s'éteint » its fan
  // slows, its core goes out, its lip turns signal — and the header counts « 0 / 2 »
  cut(t.tozero, SET.SKY, ENG0, { ...HERE, engines: 1, ...L_ENG });
  shot(t.tozero, span(t.tozero, t.towide), ENG1, "sine.inOut", ENG0.d);
  chip("chip-626", null, 96, 470, t.h626, t.towide - 0.15);
  st(t.dies - 0.08, 0.75, { engines: 0 }, "power1.out");
  beat("#hud-count", t.dies + 0.12);

  /* ───────────── « Dix mille mètres. » ───────────── */
  // the plane small, the black sea very far below it: the header says 10 500
  cut(t.towide, SET.SKY, WIDE0, { ...HERE, ...L_WIDE });
  shot(t.towide, span(t.towide, t.toyou), WIDE1, "sine.inOut", WIDE0.d);
  beat("#hud-clock", t.meters + 0.05);

  /* ───────────── « Plus de pilote automatique. » ───────────── */
  // you at your window, the cabin full around you, the cockpit far ahead in the glass
  cut(t.toyou, SET.SKY, YOU0, { ...HERE, pax: 0.5, ...L_YOU });
  shot(t.toyou, span(t.toyou, t.toplane), YOU1, "sine.inOut", YOU0.d);
  chip("chip-pilote", null, 96, 470, t.nopilot + 0.1, t.toplane - 0.14);

  /* ───────────── « Et l'avion… descend. » ───────────── */
  // the whole plane from the side: the camera holds its height while the plane noses down and sinks in the frame
  cut(t.toplane, SET.SKY, PLANE0, { ...HERE, ...L_PLANE });
  shot(t.toplane + 0.2, span(t.toplane + 0.2, t.tobay), PLANE1, "sine.inOut");
  st(t.toplane + 0.2, span(t.toplane + 0.2, t.tobay), { pitch: -6 }, "sine.inOut");

  /* ───────────── « L'hélice sort. Elle tourne. » ───────────── */
  // the belly and the bay: the door opens, the spring pushes the arm out — arrived on « sort ». Then the blades catch
  // the wind and run faster: the disc on « tourne »
  cut(t.tobay, SET.SKY, BAY0, { ...HERE, ...L_BAY, turn: 0 });
  shot(t.tobay, span(t.tobay, t.toprop), BAY1, "sine.inOut", BAY0.d);
  st(t.trigger, 0.3, { door: 1 }, "power2.out");
  st(t.trigger + 0.14, span(t.trigger + 0.14, t.rsort + 0.05), { arm: 1 }, "power2.inOut");
  const spinUp = t.rsort + 0.05;
  st(spinUp, span(spinUp, t.tourne), { turn: 0.8 }, "power2.in");
  st(t.tourne, span(t.tourne, t.toverdict), { turn: 0.8 + 1.6 * span(t.tourne, t.toverdict) }, "none");
  // « Elle tourne »: a cut to the propeller alone — the disc comes up veille, frank, as the word is said
  cut(t.toprop, SET.SKY, PROP0, { ...HERE, ...L_BAY, door: 1, arm: 1 });
  shot(t.toprop, span(t.toprop, t.tocirc), PROP1, "sine.inOut", PROP0.d);
  st(t.toprop, 0.3, { whirl: 1 }, "sine.out");

  /* ───────────── « Un circuit sur trois revit. » ───────────── */
  // the three circuits from below, dead (signal). One of them comes back: a head of veille light leaves the bay and
  // runs to the wings and the tail; the two others stay dead
  const OUT = { door: 1, arm: 1, whirl: 1 };
  cut(t.tocirc, SET.SKY, CIRC0, { ...HERE, ...OUT, ...L_CIRC });
  shot(t.tocirc, span(t.tocirc, t.totail), CIRC1, "sine.inOut", CIRC0.d);
  st(t.revit - 0.42, 0.3, { press: 1 }, "sine.out");
  st(t.revit - 0.42, span(t.revit - 0.42, t.totail), { flow: 1 }, "sine.inOut");
  chip("chip-vert", null, 96, 470, t.revit - 0.1, t.totail - 0.14);

  /* ───────────── « Les gouvernes répondent. » ───────────── */
  // the tail and its surfaces, from behind: alive (veille) on « gouvernes », and they move on « répondent »
  const LIVE = { ...OUT, press: 1, flow: 1 };
  cut(t.totail, SET.SKY, TAIL0, { ...HERE, ...LIVE, ...L_TAIL });
  shot(t.totail, span(t.totail, t.toapp), TAIL1, "sine.inOut", TAIL0.d);
  st(t.surf - 0.05, 0.3, { surf: 1 }, "sine.out");
  st(t.respond - 0.12, 0.25, { stick: 1 }, "sine.inOut");
  st(t.respond + 0.13, 0.35, { stick: -1 }, "sine.inOut");
  st(t.respond + 0.48, 0.3, { stick: 0 }, "sine.inOut");
  chip("chip-gouvernes", null, 96, 470, t.surf + 0.05, t.toapp - 0.14);

  /* ───────────── « Le commandant vise une île. Dix-neuf minutes de plané. Et la piste est là. » ───────────── */
  // ONE long shot from behind: the plane banks toward the island, the island comes to the centre of the frame ahead of
  // the nose; then the glide — the world rushes to the plane, the altimeter runs down, the first light rises — and the
  // runway is there. On « là » its lamps turn veille, the header with them
  cut(t.toapp, SET.SKY, APP0, { ...HERE, ...LIVE, surf: 1, ahead: 0.8, alt: 10100, runway: 1, made: 0, ...L_APP });
  shot(t.toapp, span(t.toapp, t.there), APP1, "sine.inOut", APP0.d);
  st(t.toapp, span(t.toapp, t.there), { ahead: 0.1 }, "sine.in");
  st(t.there, span(t.there, t.toverdict), { ahead: 0.06 }, "sine.out");
  st(t.captain, span(t.captain, t.island + 0.1), { bank: 15 }, "sine.inOut");
  st(t.island + 0.1, span(t.island + 0.1, t.m19 + 0.3), { bank: 0 }, "sine.inOut");
  // the altimeter: the cloud deck (9 600 → 6 400) leaves over a second, never cut in the middle
  st(t.toapp, span(t.toapp, t.m19), { alt: 9600 }, "sine.in");
  st(t.m19, span(t.m19, t.glide + 0.25), { alt: 6400 }, "none");
  st(t.glide + 0.25, span(t.glide + 0.25, t.there), { alt: 600 }, "sine.out");
  st(t.there, span(t.there, t.toverdict), { alt: 150 }, "sine.out");
  st(t.glide, span(t.glide, t.there), { dawn: 0.7 }, "sine.inOut");
  chip("chip-19", null, 96, 470, t.minutes + 0.1, t.runway - 0.14);
  st(t.runway, 0.5, { gear: 1 }, "sine.inOut");
  st(t.there, 0.3, { made: 1, mood: 0, gel: 0 }, "sine.inOut");
  chip("chip-piste", null, 96, 470, t.there + 0.05, t.toverdict - 0.15);
  beat("#hud-clock", t.la);
}
