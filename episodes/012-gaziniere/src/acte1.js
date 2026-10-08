// 01 · MENACE — from the first frame to "Alors…". The hook A · B · C, the scene, what happens if nothing acts.
// The whole act in ONE move if it can be (the cuts are kept for act 3, where they make the tension):
// each shot is born from the one before — follow the part that moves, back away from the detail just shown.
// Every sentence has its demonstration: what it says happens on screen while it says it.
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW } from "./world.js";

export default function acte1({ D, world }) {
  const { tl, st, shot, chip } = D;
  const t = D.times({ promesse: "promesse", scene: "scene", tard: "scene:trop", seule: "scene:Une", tobench: "tobench" });
  setAct(tl, 1, 0);

  // A — the camera moves before the first half-second, toward what the hook names
  shot(0, t.promesse, { d: 300, az: -30, el: 10 }, "sine.inOut", POSE0.d);
  chip("chip-toi", world.hero.A.top, -44, -130, 0, 0.55);
  // B · C — …
  shot(t.promesse, t.scene - t.promesse, { d: 190, az: -26, el: 14, fov: 34 }, "sine.inOut", 300);

  // the scene: the danger grows, the clock runs
  st(t.scene, t.tard - t.scene + 0.4, { threat: 1 }, "sine.in");
  // …and the camera closes on the one thing that can stop it: act 2 cuts to the bench from VIEW.system
  shot(t.seule - 0.2, t.tobench - t.seule + 0.2, VIEW.system, "sine.inOut", 190);
  st(t.seule - 0.2, t.tobench - t.seule + 0.2, { fs: 9 }, "sine.inOut");
}
