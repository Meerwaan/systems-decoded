// 02 · AUTOPSIE — « …on l'ouvre. », the exploded view, the heart (tobench → toprincipe).
//
// Act 1 leaves blade A's root still on its axis, the rotor stopped, A at the top (VIEW.root). In the breath after
// « Alors… » the same picture cuts to the bench: the system stands where the top of the tower is, turned the same
// way, so the root stays where it was on the screen. On « l'ouvre » it comes apart — the glass cover lifts, the hub
// comes forward, each root leaves its bearing, each pitch drive and each battery cabinet come out along their blade —
// and the camera pulls back, by ratio, to the whole exploded view.
// The voice then names the parts top-down, each lit on its word: the top of the tower, the nacelle, its ring
// generator; « Devant, le moyeu » — the camera glides to the hub. « Dedans » — the drives and the cabinets slide
// home INTO the hub (the picture says « inside »), the cover goes, and the camera enters through the hub's window:
// three motors, three cabinets. « un moteur par pale » — the three motors come alive (veille) and the camera closes
// on blade A's drive: its pinion turns a little in the toothed ring (the blade pitches 15° and back). « et sa propre
// batterie » — the glide ends on blade A's cabinet, the rest of the system dims round it: the heart. Act 2b cuts.
// Electric all the way: a motor and a battery per blade, never a cylinder.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, BENCHED, top, HUB, BEARING, PITCH, BATTERY } from "./world.js";

const H = -50; // TURBINE.heading: the cone looks toward az −50
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const at = (x, y, z) => { const [tx, ty, tz] = top(x, y, z); return { tx, ty, tz }; };
// blade A's frame (rotor 0, assembled): its axis leaves the hub upward from the bearing
const AY = HUB.at[1] + BEARING.r;
// the whole exploded view, from the left of the cone: the ring generator (left), the hub come forward (centre),
// blade A's root lifted above it, the top of the tower under it — everything between the header and the captions
// (VIEW.exploded, aimed higher than the assembled centre and turned 30° further: checked on a planche)
const EXPL = { ...P, ...at(0, 520, 160), d: 4700, az: H - 55, el: 26, fov: 32, shift: 80, side: 30 };
// the hub, come forward and up in the exploded view (model.js: +260 y, +170 z)
const HUBX = { ...P, ...at(HUB.at[0], HUB.at[1] + 260, HUB.at[2] + 170), d: 1900, az: H - 45, el: 20, fov: 30, shift: 140 };
// inside the hub, assembled and uncovered: blade A's drive in its col (VIEW.motor), blade A's cabinet above-left,
// blade B's drive and cabinet lower right — the camera enters on « Dedans » and closes in on « moteur »
const INSIDE = { ...VIEW.motor, d: 780 };
const MOTOR = { ...VIEW.motor, d: 690 };
// THE HEART: blade A's cabinet (VIEW.battery)
// (retouche 04/11: lifted and a little wider so the green caption « BATTERIE » no longer falls on the green cabinet)
const HEART = { ...VIEW.battery, d: 440, shift: 280 };

// the light: what it stands around, and how wide
const L_WHOLE = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs };
const L_HUB = (() => { const [fx, fy, fz] = top(HUB.at[0], HUB.at[1] + 260, HUB.at[2] + 170); return { fx, fy, fz, fs: 420 }; })();
const L_MOTOR = (() => { const [fx, fy, fz] = top(PITCH.at[0], AY + PITCH.at[1], HUB.at[2] + PITCH.at[2]); return { fx, fy, fz, fs: 200 }; })();
const L_BATT = (() => { const [fx, fy, fz] = top(BATTERY.at[0], AY + BATTERY.at[1], HUB.at[2] + BATTERY.at[2]); return { fx, fy, fz, fs: 180 }; })();

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const A = world.system.A;
  const t = D.times({
    tobench: "tobench", explode: "explode",
    en: "eclate:En", mat: "mat", nacelle: "nacelle", generateur: "generateur",
    devant: "eclate:Devant", moyeu: "moyeu", dedans: "dedans", modele: "modele",
    un: "eclate:un", moteur: "moteur", et: "eclate:et#2", batterie2: "batterie2",
    toprincipe: "toprincipe",
  });
  setAct(tl, 2, t.tobench);

  /* ───────────── (breath) — the same picture, on the bench: blade A's root, still ───────────── */
  cut(t.tobench, SET.BENCH, VIEW.root, {
    ...BENCHED, rotor: 0, rpm: 0, pitchA: 0, pitchB: 0, pitchC: 0, batt: 1, charge: 1, motors: 0,
    cover: 0.4, pool: 0, grid: 0, ...L_WHOLE,
  });
  st(t.tobench + 0.02, 0.6, { pool: 0.2, grid: 0.16 }, "sine.out");

  /* ───────────── « …on l'ouvre. » — it comes apart, the camera pulls back to the whole exploded view ───────────── */
  const open = t.explode + 0.03;
  st(open, 1.35, { explode: 1 }, "power1.inOut");
  st(open + 0.4, 0.8, { cover: 0.3 }, "sine.inOut");
  // the pull back starts on the word, with the opening (retouche 04/11: the top whole, then a gentle recul)
  const backEnd = t.en + 0.35;
  shot(t.explode, backEnd - t.explode, { ...EXPL, az: H - 25 }, "power1.inOut", VIEW.root.d);

  /* ───────────── « En haut du mât, la nacelle et son générateur. » — each lit on its word ───────────── */
  // a slow orbit under the list (retouche 04/11: the push alone read as still), toward the hub's side
  const drift = { ...EXPL, d: 4400 }; // lands on the framing checked (az H − 55)
  shot(backEnd, t.devant - 0.1 - backEnd, drift, "sine.inOut");
  st(t.mat - 0.12, 0.3, { litMast: 1 }, "sine.out");
  st(t.nacelle - 0.15, 0.25, { litMast: 0 }, "sine.inOut");
  st(t.nacelle - 0.05, 0.3, { litNacelle: 1 }, "sine.out");
  st(t.generateur - 0.15, 0.25, { litNacelle: 0 }, "sine.inOut");
  st(t.generateur - 0.05, 0.3, { litGen: 1 }, "sine.out");
  const cNac = co.add({ title: "Nacelle", x: 150, y: 560, align: "start", anchor: A.carrier });
  cNac.show(tl, t.nacelle - 0.1);
  cNac.hide(tl, t.devant - 0.25);
  const cGen = co.add({ title: "Générateur", x: 150, y: 1060, align: "start", anchor: A.gen });
  cGen.show(tl, t.generateur - 0.1);
  cGen.hide(tl, t.devant - 0.25);

  /* ───────────── « Devant, le moyeu. » — the camera glides to it, it lights up ───────────── */
  st(t.devant - 0.2, 0.3, { litGen: 0 }, "sine.inOut");
  const toHub = t.dedans - 0.15 - (t.devant - 0.1);
  shot(t.devant - 0.1, toHub, HUBX, "sine.inOut", drift.d);
  st(t.devant - 0.1, toHub, L_HUB, "sine.inOut");
  st(t.moyeu - 0.05, 0.3, { litHub: 1 }, "sine.out");
  const cHub = co.add({ title: "Moyeu", x: 150, y: 600, align: "start", anchor: A.hub });
  cHub.show(tl, t.moyeu - 0.1);
  const home = t.dedans - 0.12;
  cHub.hide(tl, home - 0.2);

  /* ───────────── « Dedans, sur ce modèle, » — a cut inside the hub, assembled and uncovered; a slow push ───────────── */
  // retouche 04/11: the glide in crossed blade A's root coming home (25,2 heurté) — a clean cut a few frames before
  cut(home, null, { ...INSIDE, d: 900 }, { explode: 0, cover: 0, litHub: 0, ...L_MOTOR });
  shot(home + 0.02, t.un - 0.05 - (home + 0.02), INSIDE, "sine.inOut");
  chip("chip-modele", null, 96, 470, t.modele - 0.05, t.et - 0.15);

  /* ───────────── « un moteur par pale… » — the three come alive; the camera closes on A's: its pinion turns ───────────── */
  st(t.moteur - 0.05, 0.3, { motors: 1, litMotor: 1 }, "sine.out");
  const close = t.et - 0.2 - (t.un - 0.05);
  shot(t.un - 0.05, close, MOTOR, "sine.inOut");
  st(t.moteur + 0.15, 0.45, { pitchA: 20, pitchB: 20, pitchC: 20 }, "sine.inOut");
  st(t.moteur + 0.7, 0.45, { pitchA: 0, pitchB: 0, pitchC: 0 }, "sine.inOut");
  const cMot = co.add({ title: "Moteur de pas", x: 150, y: 1080, align: "start", tone: "system", anchor: A.motor[0] });
  cMot.show(tl, t.moteur - 0.05);
  cMot.hide(tl, t.et - 0.15);

  /* ───────────── « et sa propre +batterie+. » — the glide ends on A's cabinet; everything else dims: the heart ───────────── */
  st(t.et - 0.2, 0.3, { litMotor: 0 }, "sine.inOut");
  const glide = t.batterie2 + 0.12 - (t.et - 0.2);
  shot(t.et - 0.2, glide, HEART, "sine.inOut", MOTOR.d);
  st(t.et - 0.2, glide, L_BATT, "sine.inOut");
  st(t.batterie2 - 0.02, 0.4, { heart: 1 }, "sine.out");
  punch(t.batterie2, 0.06);
  chip("chip-coeur", null, 96, 470, t.batterie2 - 0.02, t.toprincipe - 0.2);
  shot(t.batterie2 + 0.12, t.toprincipe - (t.batterie2 + 0.12), { ...HEART, d: HEART.d * 0.94 }, "sine.inOut");
}
