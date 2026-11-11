// DOSSIER 041 — 01 MENACE (accroche, promesse, scene: the first frame → « Alors… », 0 → 20,54).
//
// ONE MOVE from outside the lab into the cabin, one cut, a second move on the bumper (plan-séquence: every key turns
// the camera further the same way, az FALLING, and none of them stops it).
//   « Un débris fonce sur ta tête » (POSE0, FIRST): you asleep behind the glass, the bumper veille at your head, the
//   bille's white-hot head and its streak coming — it rushes from frame 1 (`dist` 100 → 62, power2.out), the camera
//   already turning · « dix kilomètres par seconde » the camera slides along the streak toward the wall · « le laisse
//   frapper » under the lab to the coupon · « Devant ta coque, une tôle… » round into the coupon's plane: in profile the
//   bumper is a line, the gap, the wall · « Au-delà d'un centimètre… » up the path to the bille, its gauge, and behind it
//   the big one · « tu te caches où ? » a pull-back: both coming at the coupon, you behind it · « Un centimètre » the dive
//   onto the bille · « trop petit pour être vu » the sweep passes over it · « quinze fois plus vite qu'une balle » the
//   bullet beside the path, which the bille overtakes · CUT (15,10) « Derrière ta paroi » inside, far: the wall, its
//   coupon, you asleep along the frame (retouche: the old traversal passed your head at 84 cm) · « ton air » the cabin's air lights · « Tu dors… » you in your bag against the wall.
//   CUT (18,25, just before « Tout ») outside on the bumper alone, the station fading round it, the bille at the frame's
//   edge · « Tout repose sur cette tôle » it lights, the lens hits; the move runs on into act 2's bench cut (tobench).
// The bille's distance IS the header's countdown (main.js): it only falls, 100 → 20 (STAGED.dist) at 19,6.
// Nothing tweens past 20,54 but the camera (act 2 freezes the world from « Alors… »).
import { setAct } from "@kit/overlay.js";
import { POSE0, STAGED, LIGHT, LOOK } from "./world.js";

const CLOSE = { dof: LOOK.dof };

export default function acte1({ D }) {
  const { tl, st, cut, chip, path, punch } = D;
  const t = D.times({
    tete: "choc", km: "accroche:kilomètres", frappe: "frappe",
    promesse: "promesse", coque: "promesse:coque", tole1: "tole1", mm: "promesse:millimètres", cm1: "cm1", tu: "promesse:tu", caches: "caches",
    scene: "scene", cm2: "cm2", trop: "scene:trop", vu: "vu", quinze: "scene:15", balle: "balle",
    derriere: "scene:Derrière", paroi: "paroi", air: "air", dors: "dors", tout: "scene:Tout", tole2: "tole2",
    ouvre: "ouvre", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ── the bille: its distance only falls (the countdown), fast from frame 1, then the slow motion takes it ── */
  const toTole = t.tout - 0.13; // the cut, a few frames before « Tout »
  const toIn = t.derriere - 0.12; // retouche: the cut inside, a few frames before « Derrière »
  st(0, t.km + 0.1, { dist: 62 }, "expo.out"); // retouche: it rushes hardest on frame 1 (100 → 71 by 0.5 s)
  st(t.km + 0.1, t.promesse - t.km - 0.1, { dist: 54 }, "none");
  st(t.promesse, t.cm1 - t.promesse, { dist: 48.5 }, "none");
  st(t.cm1, t.scene - t.cm1, { dist: 45.5 }, "none");
  st(t.scene, t.quinze - 0.15 - t.scene, { dist: 42.5 }, "none");
  st(t.quinze - 0.15, t.derriere - t.quinze + 0.15, { dist: 37.5 }, "none"); // it overtakes the bullet (≈ 40)
  st(t.derriere, toTole - t.derriere, { dist: 27 }, "none");

  /* ── what the voice names ── */
  st(t.tole1 - 0.08, 0.3, { litBumper: 1 }, "power2.out"); // « tôle »
  st(t.cm1 - 0.3, 0.5, { litBumper: 0.6 }, "sine.inOut"); // never under 0.4 while it is small (041-actes-maj)
  st(t.cm1 - 0.08, 0.3, { gauge1: 1 }, "power2.out"); // « centimètre »
  st(t.cm1 + 0.25, 0.45, { big: 1 }, "power2.out"); // « au-delà » : the big one behind it
  st(t.scene - 0.15, 0.4, { big: 0 }, "sine.inOut");
  st(t.trop - 0.05, t.vu + 0.16 - t.trop, { scan: 1 }, "none"); // « trop petit pour être vu »: the sweep finds nothing
  st(t.quinze - 0.2, 0.3, { gauge1: 0 }, "sine.inOut");
  st(t.quinze - 0.08, 0.35, { bullet: 1 }, "power2.out"); // « quinze »
  st(t.derriere + 0.1, 0.4, { bullet: 0 }, "sine.inOut");
  st(t.air - 0.15, 0.5, { cabin: 1 }, "sine.inOut"); // « ton air »
  // the station's glass, seen raking near the coupon, whitens the frame: faint in the close shots (041-actes-maj)
  st(t.km + 0.8, 1.4, { shell: 0.45 }, "sine.inOut"); // the station still there under the lab, its glass not glaring
  st(t.frappe + 0.25, 0.6, { shell: 0.05 }, "sine.inOut"); // in profile: the coupon's own layers, nothing raking
  st(t.tu - 0.1, 0.5, { shell: 0.35 }, "sine.inOut"); // « tu te caches où ? » : the lab round you
  st(t.scene - 0.1, 0.4, { shell: 0.1 }, "sine.inOut");
  // the light stands on the coupon in the close shots, on the lab in the cabin
  st(t.km + 0.6, 1.6, { ...LIGHT.coupon }, "sine.inOut");

  /* ── the camera: ONE move, outside → the coupon → the bille → through the wall → you ── */
  path([
    [0, POSE0],
    [0.5, { tx: 60, ty: -17, tz: -45, d: 462, az: -38.5, el: -9.5 }], // retouche: the push starts hard on frame 1
    [t.tete + 0.1, { tx: 45, ty: -13, tz: -23, d: 442, az: -46, el: -9 }],
    [t.km + 0.7, { tx: 14, ty: -6, tz: 30, d: 420, az: -56, el: -8, fov: 40, shift: -20 }],
    [t.frappe + 0.3, { tx: 0, ty: 0, tz: 34, d: 270, az: -70, el: -5, fov: 36, shift: 0 }], // the coupon left, the bille right
    [t.tole1 - 0.28, { tz: 6, d: 120, az: -82, el: 8, fov: 32, ...CLOSE }], // round into its plane
    [t.mm + 0.12, { tz: -4, d: 90, az: -89, el: 12 }], // in profile: the bumper a line, the gap, the wall
    [t.cm1, { tx: -1, ty: 1, tz: 47, d: 50, az: -93, el: 8 }], // up the path to the bille, its gauge
    [t.tu - 0.2, { tx: -4, ty: 3.5, tz: 53, d: 95, az: -97, el: 9, shift: 60 }], // the big one behind it
    [t.caches + 0.4, { tx: -4, ty: 0, tz: 4, d: 360, az: -100, el: 14, fov: 44, shift: 0, side: 50, dof: 0 }], // pulled back INTO the lab: you, the wall, both coming
    [t.scene - 0.15, { d: 345, az: -102, el: 13 }],
    [t.cm2 + 0.41, { tx: -0.8, ty: 0, tz: 45.2, d: 24, az: -105, el: 9, fov: 30, side: 0, ...CLOSE }], // the dive: the bille, its gauge
    [t.trop + 0.43, { tz: 44, d: 23, az: -110, el: 12 }],
    [t.quinze + 0.04, { tx: -1.2, ty: 0.2, tz: 42, d: 24, az: -115, el: 9 }],
    [t.balle + 0.12, { tz: 41.2, d: 25, az: -120, el: 7 }], // the camera stays with the bullet: the bille passes it (chef, qa 13–15 s slow)
    [toIn, { tz: 40.8, d: 25.4, az: -122, el: 6.2 }],
  ], { from: "go", to: "go" });
  // retouche: CUT just before « Derrière » — inside, far from your head: the wall and its coupon right, you asleep along
  // the frame, the bille beyond the glass; then a slow push to you (the traversal ran past your head at 84 cm)
  const INSIDE = { tx: 30, ty: -6, tz: -40, d: 470, az: -124, el: 14, fov: 40, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 };
  cut(toIn, null, INSIDE, { shell: 1, ...LIGHT.lab });
  path([
    [toIn, INSIDE],
    [t.air + 0.04, { tx: 50, ty: -8, tz: -60, d: 430, az: -129, el: 14 }], // the cabin, its air
    [t.dors + 0.16, { tx: 52, tz: -58, d: 400, az: -134, el: 12 }], // you, asleep against the wall
    [toTole, { tx: 52, tz: -57, d: 385, az: -137, el: 11 }],
  ], { from: "go", to: "go" });
  punch(t.tete, 0.06);
  punch(t.frappe, 0.06);
  punch(t.mm, 0.06);
  punch(t.balle, 0.06);
  chip("chip-tole", null, 96, 470, t.tole1 + 0.1, t.cm1 - 0.25);
  chip("chip-toi", null, 96, 470, t.dors - 0.24, toTole - 0.15);

  /* ── CUT: outside, the bumper alone — « Tout repose sur cette tôle » ── */
  const TOLE = { tx: 0, ty: 0, tz: 10, d: 230, az: -40, el: 12, fov: 30, shift: 100, side: 0, roll: 0, drift: 0.3, ...CLOSE };
  // retouche: the station already faint on the cut (its glass at 0.6 was a grey plate over the frame at 18,6)
  // and the tôle already glowing (at 0.4 the near bumper read as a bare grey plate): it reads as the tôle, as at 20,0
  cut(toTole, null, TOLE, { ...STAGED, dist: 27, trail: 0.6, litBumper: 0.8, cabin: 0, shell: 0.25 });
  st(toTole, t.tole2 + 0.14 - toTole, { dist: STAGED.dist, trail: 0.4 }, "none");
  st(t.tole2 - 0.08, 0.35, { litBumper: 1 }, "power2.out"); // « tôle »
  punch(t.tole2, 0.06);
  path([
    [toTole, TOLE],
    [t.tole2, { tz: 9, d: 210, az: -50, el: 14 }],
    [t.tobench, { tz: 4, d: 200, az: -59, el: 16 }],
  ], { from: "go", to: "go" }); // act 2 cuts to the bench in place, at tobench, the move still running
}
