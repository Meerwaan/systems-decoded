// 02 · AUTOPSIE — from "…on l'ouvre" (tobench) to the cut of act 3 (tozero).
//
// Act 1 holds on the door's aft edge, from the cabin (VIEW.edge). On "on l'ouvre" the cabin and the plane go out and
// the same door stands on the bench at the same place of the picture (benchPose): it comes apart on "on", the camera
// pulls back to the whole exploded view. "Côté cabine :" — it closes on the handle and the hook shaft in ONE frame:
// the handle lifts on its word, the shaft it turns lights up on "crochets". "Mais la porte est plus grande que son
// cadre" — the parts go home, the camera turns nearly edge-on: the frame's outline, the overhang lit on "cadre".
// "Elle s'appuie, de l'intérieur… sur des butées" — along the edge down to one pair of stops: the heart, lit.
// "Au sol" — the cut through the door, edge-on, the header at 0 m: the arrows come on "l'air pousse", as many on
// both faces. "L'avion monte" — `alt` climbs: outside they thin on "s'amincit" (the camera leans that way), inside
// they stay (the camera leans back); the header reaches ≈ 8 t on "trois fois plus". "Et ton voisin force toujours" —
// back in the plane, his hands on the handle, the arrows behind the door. The threshold does not stop the film: the
// camera is already travelling down the aisle toward door 1L when the voice asks (followCall); the stops answer
// "regarde la porte". Act 3 cuts from there (tozero).
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, benchPose } from "./world.js";
import { DOOR_AT, AIR } from "./plan.js";

const [DX, DY, DZ] = DOOR_AT;

/* ── on the bench (the door turned: its cabin face toward the key light) ── */
const EDGE = benchPose(VIEW.edge); // act 1's last picture, on the bench
const EXP = VIEW.exploded; //          the whole exploded view, one vertical frame
const PAIR = { ...VIEW.exploded, ty: 106, d: 800, az: -34, side: 150, shift: 120 }; // the handle (right) and the hook shaft (left), ONE frame — the handle's tip left of the buttons (x < 905)
const LAP = { ...VIEW.lapB, tx: -5, tz: 10, d: 720, az: -28, el: 12, shift: 80, side: 20 }; // the door home, from the cabin: the overhang all round
const STOP = { ...VIEW.stopB, ty: 80, d: 128, az: -80, el: 8, shift: 40 }; // one pair of stops on the door's edge: the heart (close-up, dof), the pads big, the hook a bar at the top
const STOP_IN = { ...STOP, d: 150 }; //   the cut lands here on « Elle », then a slow push to STOP on « butées »
const SEC = VIEW.section; //           the cut, edge-on: cabin LEFT, night RIGHT
const SEC_OUT = { ...SEC, d: 690, side: 70 }; //  « dehors » : the frame leans to the night's face
const SEC_IN = { ...SEC, d: 670, side: -60 }; //  « dedans » : back to the cabin's face

/* ── in the plane ── */
// the neighbour in profile, leaning back on the handle, the arrows on the door's cabin face (vol.js journal)
const HANDLE = { fov: 34, side: 0, roll: 0, drift: 0.3, dof: 0, tx: DX + 6, ty: DY + 96, tz: DZ - 60, d: 420, az: 100, el: 4, shift: 60 };
const HANDLE_IN = { ...HANDLE, d: 385 }; //             …pushing in slowly while he forces
const AISLE = { ...VIEW.aisle, ty: DY + 100, tz: DZ - 75, d: 720, el: 6, fov: 24, side: 0 }; // retouche: closer, standing eye height over the seat backs, aimed between the door and the neighbour: both big, left of the buttons
const AISLE_END = { ...AISLE, d: 640 }; //              80 cm in 3.45 s: 23 cm/s along the rows (act 3 cuts from it to the handle)

// the light: what it stands around, and how wide
const L_EXP = { fx: -10, fy: 100, fz: 70, fs: 160 };
const L_PAIR = { fx: -10, fy: 106, fz: 70, fs: 150 };
const L_LAP = { fx: -30, fy: 100, fz: 20, fs: 130 };
const L_STOP = { fx: -56, fy: 82, fz: 16, fs: 50 };
const L_SEC = { fx: -10, fy: 96, fz: 0, fs: 150 };
const L_HANDLE = { fx: DX, fy: DY + 96, fz: DZ, fs: 250 };
const L_AISLE = { fx: DX, fy: DY + 100, fz: DZ, fs: 400 };

/** A pop of a header readout: it swells and settles (the eye goes to the number the voice gives). */
const pop = (tl, sel, at, k = 1.14) => {
  tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
  tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.3);
};

export default function acte2({ D, world, co }) {
  const { tl, st, now, shot, chip, punch } = D;
  const A = world.model.A;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode", ouvreMot: "ouvre:l'ouvre",
    cote: "eclate", poignee: "poignee", crochets: "crochets", verrouEnd: "eclate:verrouillage$",
    mais: "eclate:Mais", cadre: "cadre", appuie: "eclate:Elle", butees: "butees",
    repos: "repos", sol: "sol", pousse: "repos:l'air", monte: "monte", dehors: "repos:dehors", amincit: "amincit",
    dedans: "dedans", trois: "trois", encore: "encore", toujours: "repos:toujours",
    toseuil: "toseuil", seuil: "seuil", regarde: "regarde", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── "…on l'ouvre." — the same door, the same picture, on the bench; it comes apart on "on" ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: EDGE, state: { ...BENCHED, stops: 0.7 } });
  // retouche: the camera leaves the close-up at once (by ratio, sine.out: no lingering on the edge), and the parts
  // part on « l'ouvre » with a soft start (power2.out at d 200 was the jolt of the act, 15,2 at 20,0)
  st(t.ouvreMot, 1.3, { explode: 1 }, "sine.inOut");
  st(t.explode + 0.6, 0.8, { stops: 0.3 }, "sine.inOut");
  const back = t.cote - 0.05 - (t.tobench + 0.02);
  shot(t.tobench + 0.02, back, EXP, "sine.out", bench.d);
  st(t.tobench + 0.02, back, L_EXP, "sine.inOut");

  /* ───────────── "Côté cabine : une poignée, des crochets de verrouillage." — ONE frame for the two ───────────── */
  const inAt = t.cote + 0.35; // after "Côté": the cabin face comes toward us
  shot(inAt, t.poignee - 0.02 - inAt, PAIR, "sine.inOut");
  st(inAt, t.poignee - 0.02 - inAt, L_PAIR, "sine.inOut");
  shot(t.poignee - 0.02, t.mais - t.poignee + 0.02, { ...PAIR, d: PAIR.d * 0.9 }, "none", PAIR.d); // (orchestrateur: 22,5–24,5 read as still)
  // the handle lifts a quarter on its word…
  now(t.poignee - 0.04, { named: 1 });
  st(t.poignee, 0.35, { handle: 0.3 }, "power2.out");
  // …and the shaft it turns lights up on "crochets": the handle goes back down, the crank turning with it
  now(t.crochets - 0.04, { named: 2 });
  st(t.crochets + 0.05, 0.6, { handle: 0 }, "sine.inOut");
  const cHandle = co.add({ title: "Poignée", x: 870, y: 560, align: "end", tone: "system", anchor: A.handle });
  cHandle.show(tl, t.poignee - 0.08);
  cHandle.hide(tl, t.mais - 0.2);
  const cHooks = co.add({ title: "Crochets de verrouillage", x: 200, y: 1090, align: "start", tone: "system", anchor: A.hooks });
  cHooks.show(tl, t.crochets - 0.08);
  cHooks.hide(tl, t.mais - 0.2);

  /* ───────────── "Mais la porte est plus grande que son cadre." — the parts go home; edge-on, the overhang ───────────── */
  now(t.mais - 0.1, { named: 0 });
  st(t.mais, t.cadre - 0.2 - t.mais, { explode: 0 }, "sine.inOut");
  shot(t.mais, t.cadre - 0.1 - t.mais, LAP, "sine.inOut");
  st(t.mais, t.cadre - 0.1 - t.mais, L_LAP, "sine.inOut");
  now(t.cadre - 0.03, { named: 3 });
  punch(t.cadre, 0.06);
  const cFrame = co.add({ title: "Cadre", x: 160, y: 600, align: "start", tone: "system", anchor: A.lap });
  cFrame.show(tl, t.cadre - 0.06);
  cFrame.hide(tl, t.appuie - 0.1);

  /* ───────────── "Elle s'appuie, de l'intérieur… sur des butées." — along the edge to one pair: the heart ───────────── */
  // retouche: the dive 720 → 220 was the jolt at 27,4 (14,8): a clean cut a few frames before « Elle », then a slow push
  D.cut(t.appuie - 0.1, null, STOP_IN, { named: 0, ...L_STOP }); // the lit overhang would cross the lens
  shot(t.appuie - 0.08, t.butees - (t.appuie - 0.08), STOP, "sine.inOut");
  shot(t.butees, t.repos - 0.12 - t.butees, { ...STOP, d: 120 }, "sine.out");
  now(t.butees - 0.03, { named: 4 });
  st(t.butees, 0.3, { stops: 1 }, "sine.out");
  punch(t.butees + 0.02, 0.05);
  chip("chip-butees", null, 96, 470, t.butees, t.repos - 0.26);

  /* ───────────── "Au sol, l'air pousse pareil des deux côtés." — the cut through the door; the header at 0 m ───────────── */
  D.cut(t.repos - 0.12, SET.BENCH, SEC, { ...BENCHED, section: 1, air: 0, stops: 0.5, alt: 0, ...L_SEC });
  pop(tl, "#hud-clock", t.sol);
  st(t.pousse - 0.05, 0.45, { air: 1 }, "sine.out");
  shot(t.repos - 0.1, t.monte - (t.repos - 0.1), { ...SEC, d: 700 }, "sine.inOut");

  /* ───────────── "L'avion monte : dehors, l'air s'amincit. Dedans, on en garde trois fois plus." ───────────── */
  st(t.monte, t.trois - t.monte, { alt: AIR.cruise }, "sine.inOut");
  shot(t.dehors - 0.25, t.amincit + 0.3 - (t.dehors - 0.25), SEC_OUT, "sine.inOut");
  shot(t.dedans - 0.1, t.trois + 0.25 - (t.dedans - 0.1), SEC_IN, "sine.inOut");
  pop(tl, "#hud-count", t.trois + 0.4, 1.16);
  shot(t.trois + 0.25, t.encore - 0.12 - (t.trois + 0.25), { ...SEC_IN, d: 650 }, "sine.inOut");

  /* ───────────── "Et ton voisin force toujours." — back in the plane: his hands on the handle, the air behind ───────────── */
  D.cut(t.encore - 0.12, SET.VOL, HANDLE, { ...STAGED, alt: AIR.cruise, ahead: 0.05, air: 1, pull: 1, tug: 0.3, stops: 0.5, ...L_HANDLE });
  shot(t.encore - 0.1, t.toseuil - (t.encore - 0.1), HANDLE_IN, "sine.inOut");
  punch(t.toujours, 0.06);

  /* ───────────── the threshold — "Abonne-toi : on rejoue la scène… et on regarde la porte." ───────────── */
  // The film does not stop for it: the camera is already travelling down the aisle toward the door (linear, under
  // 40 cm/s along the rows), the neighbour still at it; the stops answer "regarde la porte". Act 3 cuts on tozero.
  D.cut(t.toseuil, SET.VOL, AISLE, { ...STAGED, alt: AIR.cruise, ahead: 0.05, air: 1, pull: 1, tug: 0, stops: 0.3, pax: 0.4, ...L_AISLE });
  shot(t.toseuil, t.tozero - t.toseuil, AISLE_END, "none");
  st(t.regarde, 0.5, { stops: 0.75 }, "sine.out");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
}
