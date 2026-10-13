// 02 · AUTOPSIE — "Alors… on l'ouvre." The same system on the bench, at the same place of the picture (benchCut):
// only what stood around it changes on the cut. Then the exploded view — a short list, and the heart alone.
// Each part has its shot on its word, with a gesture that shows what it is for. A mechanism is shown from
// three quarters, never from the front; try four azimuths at once with `npm run look` before choosing a side.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, HOME, VIEW, BENCHED } from "./world.js";

export default function acte2({ D, world, co }) {
  const { tl, st, shot, chip } = D;
  const t = D.times({ ouvre: "ouvre", tobench: "tobench", explode: "explode", eclate: "eclate", coeur: "eclate:cœur", repos: "repos", seuil: "seuil", seuilEnd: "seuil$", tozero: "tozero" });
  setAct(tl, 2, t.ouvre);

  // "alors…" — time stops; "…on l'ouvre": the bench, and from there the camera backs away as the system comes apart
  st(t.ouvre - 0.05, t.tobench - t.ouvre + 0.05, { shell: 0, threat: 0, mood: 0 }, "sine.inOut");
  const pose = benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: HOME, state: BENCHED });
  st(t.explode, 1.2, { explode: 1 }, "none");
  shot(t.tobench + 0.02, t.eclate - t.tobench, VIEW.exploded, "sine.inOut", pose.d);

  // "…et au centre… le cœur."
  shot(t.coeur - 0.4, 1.2, { tx: 0, ty: 6.5, tz: 0, d: 56, az: -52, el: 12 }, "sine.inOut");
  st(t.coeur - 0.1, 0.4, { heart: 2.4 }, "power2.out");
  chip("chip-coeur", world.hero.A.heart, 60, -150, t.coeur, t.repos - 0.15);
  const cTop = co.add({ title: "Couvercle", x: 330, y: 620, align: "end", tone: "system", anchor: world.hero.A.top });
  cTop.show(tl, t.eclate + 0.1);
  cTop.hide(tl, t.coeur - 0.4);

  // "il attend." — how it waits: a slow breath, never a flicker
  st(t.repos, 1.2, { heart: 0.8 }, "sine.inOut");
  shot(t.repos, t.seuil - t.repos, { d: 60, az: -40 }, "sine.inOut");

  // THE THRESHOLD — "Abonne-toi : ce qui arrive maintenant, on te le montre en entier." The one subscribe call most
  // viewers are still there to hear (see followCall). The film does not stop for it: the camera is already leaving
  // for what act 3 will show, the account name lights up, the chevrons point at the button. No panel.
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
  shot(t.seuil - 0.1, t.tozero - t.seuil, { d: 46, az: -30, el: 16 }, "sine.inOut");
}
