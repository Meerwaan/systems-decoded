// 01 · L'HEURE — accroche → piege (0 → tot1). Starts on POSE0 and FIRST, no cut; hands over at `tot1` (acte2 cuts on the centrale).
//
// THE HOOK (0 → bouton). Under the core, looking up: the rods are already coming down (`scram`, linear from frame 1), the bottom
//   breathes red; the camera creeps in. On « accélère » the bottom flares (`pLow` → 1) and the lens punches. « C'est Tchernobyl » :
//   a long pull-back by ratio to the whole core — the slab, the stack, the vessel — while the rods go on sinking.
// THE QUESTION (bouton → toprincipe). A cut (match: the rods coming down → the button that sent them): AZ-5, green — the
//   safety that works. It sinks alone on « arrêter » (nobody's hand); on « l'inverse » it turns alarm red.
// HOW IT WORKS (toprincipe → totrap), in one dive and three cuts; green (`ok`) only on what brakes, as it is named:
//   · the slice whole (« comment ça marche »), and the camera dives by ratio into the loupe over the left fuel;
//   · « se casse » the first nucleus breaks, « neutrons » they fly, « cassent d'autres atomes » the chain — and the fuel fills with
//     neutrons (`flux`); the loupe closes before the pull-back (canal.js: it closes from split 0.9);
//   · « Ça chauffe l'eau, la vapeur… » the pull-back to the fuel channel: the pellets glow up, the vapour takes the ring from the top;
//   · a cut (the vapour rising → the shaft turning): « …fait tourner la turbine »;
//   · a cut on the top of the rod channel: « Pour freiner, des barres qui avalent les neutrons » — the green absorber comes in and the
//     neutrons that reach it fold into it.
// THE TRAP (totrap → tot1). A cut on the fuel channel, all water (`steam` 0), no green: « un piège » punches;
//   « l'eau aussi avale des neutrons » — the trails die in the light ring; « Changée en vapeur » the vapour climbs down the ring and
//   on « vapeur » it turns alarm red (`viol`: canal.js reads it once « À changer ailleurs » is applied — docs/journal/CR01-acte1.md),
//   the water under it stays light; « elle en avale moins… et la réaction accélère » the pellets flare, punch; « Retiens bien ça » the
//   camera backs off and holds, the neutrons still flying.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { STAGED, VIEW, SET, POSE0, W } from "./world.js";

/** The light around a point of a maquette (fx fy fz) and its size (fs): a close-up gets a tighter pool. */
const lit = (name, local, fs) => {
  const [fx, fy, fz] = W(name, local);
  return { fx, fy, fz, fs };
};

export default function acte1({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    choc: "choc", promesse: "promesse", bouton: "bouton", arreter: "promesse:arrêter", inverse: "inverse",
    toprincipe: "toprincipe", toloupe: "toloupe", casse: "principe:casse", neutrons: "neutrons1", cassent: "cassent", atomes: "atomes",
    chauffe: "chauffe", vapeur: "vapeur1", toturbine1: "toturbine1", tofreiner: "tofreiner", freiner: "freiner", avalent: "avalent",
    totrap: "totrap", trap: "trap", eau: "eau1", changee: "changee", vapeur2: "piege:vapeur", moins: "moins", accelere: "accelere1",
    retiens: "retiens", tot1: "tot1", barres: "principe:barres",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ── THE HOOK: under the core, the rods already coming down ── */
  // retouche 05/11: from frame 1 the rods drop franchement (glide: fastest at once) and the heat climbs the stack, the bottom pulses
  st(0, t.bouton - 0.1, { scram: 0.5 }, glide(2.2, 0.5));
  st(0, t.choc - 0.14, { pHigh: 0.7 }, "none"); // the glow climbs the stack
  // retouche 2 (05/11): the red bottom beats hard (a swing of ≈ 30 % of its light), from frame 1 to « accélère »
  [[0, 0.22, 0.3], [0.22, 0.3, 1], [0.52, 0.3, 0.35], [0.82, 0.3, 1], [1.12, 0.35, 0.4], [1.47, 0.3, 1], [1.77, 0.35, 0.45], [2.12, 0.48, 1]].forEach(([a, d, v]) =>
    st(a, d, { pLow: v }, "sine.inOut"));
  st(2.6, t.choc - 2.74, { pLow: 0.75 }, "sine.inOut");
  // a real push and a turn under the core, rushing on frame 1 (retouche 2: d 275 → 262 was nothing), the core out of the button column
  shot(0.02, t.choc - 0.02, { ...POSE0, d: 205, az: POSE0.az - 14, side: 300 }, glide(2.6, 1)); // from 0.02: frame 0 stays POSE0 (the loop), frame 1 already moves
  st(t.choc - 0.14, 0.3, { pLow: 1 }, "power2.in"); // « accélère »: the bottom flares, at once
  D.punch(t.choc, 0.06);
  // « C'est Tchernobyl. Tout est vrai… »: the pull-back, by ratio, to the whole core
  const whole = { ...VIEW.coeur, fov: 36, d: 600 };
  shot(t.promesse - 0.1, t.bouton - t.promesse + 0.1, whole, "sine.inOut", 205);

  /* ── THE QUESTION: AZ-5, green, sinks alone — then red ── */
  const salle = { ...STAGED.salle, fault: 0, ok: 1, az5: 0, prot: 1, crew: 1, rodsIn: 0.25, scram: 0.12, viol: 0 };
  cut(t.bouton - 0.08, SET.SALLE, VIEW.az5, salle);
  // retouche 2: a steady push and turn from the cut to the next one (sine left 8–10.5 s still at both ends)
  shot(t.bouton - 0.08, t.arreter - t.bouton - 0.02, { ...VIEW.az5, d: 72, el: 30, az: VIEW.az5.az + 14 }, "none");
  // on « arrêter », a cut low and on the other side of the button (more than 30°): it sinks there, in big — nobody touches it
  const az5Low = { ...VIEW.az5, d: 66, el: 12, az: VIEW.az5.az + 40 };
  cut(t.arreter - 0.1, SET.SALLE, az5Low, salle);
  shot(t.arreter - 0.1, t.toprincipe - t.arreter + 0.1, { ...az5Low, d: 52, az: az5Low.az + 10 }, "none");
  st(t.arreter - 0.04, t.inverse - t.arreter - 0.1, { az5: 1 }, "sine.inOut");
  st(t.inverse - 0.02, 0.2, { fault: 1 }, "power2.out"); // « l'inverse »: green → alarm red

  /* ── HOW IT WORKS: the slice, the dive into the loupe ── */
  const canal = {
    ...STAGED.canal, fault: 0, ok: 0, viol: 0, depuis: 0, rod: 0, flux: 0, split: 0, steam: 0.1, pLow: 0.3, pHigh: 0.3,
    xenon: 0, newRod: 0, solo: 0, rep: 0,
  };
  cut(t.toprincipe, SET.CANAL, VIEW.canal, canal);
  // retouche 05/11: no dive (it swept the slice face-on at 11.6 s) — a slow push on the slice, then a cut in on the axis to the loupe
  shot(t.toprincipe, t.toloupe - t.toprincipe - 0.15, { ...VIEW.canal, d: 960 }, "sine.inOut");
  const loupe = { ...VIEW.fuel, tx: VIEW.fuel.tx - 17, ty: 128, d: 240, az: -72, el: 4, shift: 0, dof: 6 };
  cut(t.toloupe - 0.15, SET.CANAL, loupe, { ...canal, ...lit("canal", [0, 125, -44], 70) });
  // retouche 2: a steady push and turn on the nuclei, cut to cut (12.5–15.5 s was still)
  shot(t.toloupe - 0.15, t.chauffe - t.toloupe + 0.1, { ...loupe, d: 165, az: loupe.az + 12 }, glide(1.3, 0)); // eased to a stop while the loupe closes (15.9 s jerked)
  // the chain, on the words
  st(t.toloupe - 0.12, 0.3, { split: 0.05 }, "power2.out"); // the loupe opens on the cut
  // the chain without a stop (retouche 05/11: 13–15.5 s was still): each step runs into the next word
  st(t.casse - 0.08, t.neutrons - t.casse + 0.03, { split: 0.35 }, "power2.out"); // « se casse »: the first nucleus breaks
  st(t.neutrons - 0.05, t.cassent - t.neutrons, { split: 0.55 }, "sine.inOut"); // « neutrons »: they fly
  st(t.cassent - 0.05, t.atomes - t.cassent + 0.35, { split: 0.85 }, "sine.inOut"); // « cassent d'autres atomes »: the chain
  st(t.neutrons, t.atomes - t.neutrons + 0.3, { flux: 1 }, "sine.inOut"); // …and the fuel behind fills with neutrons
  st(t.atomes + 0.35, t.chauffe - t.atomes - 0.4, { split: 1 }, "sine.out"); // the loupe closes before the cut, over ≈ 0.4 s (retouche 2: in 0.13 s it jerked at 15.9)
  // « Ça chauffe l'eau, la vapeur… »: the pull-back to the fuel channel; the pellets glow up, the vapour takes the ring
  // framed on the ring's upper half: the vapour comes down from the top, the water stays under it
  const ring = { ...VIEW.fuel, ty: VIEW.fuel.ty + 35, d: 215, shift: 0 }; // the channel ≈ 45 % of the width: the ring reads
  // retouche 2: a cut in the axis (the pan loupe → ring jerked at 17.2 s), then a slow push; split and flux are already at 1 here
  cut(t.chauffe - 0.05, SET.CANAL, { ...ring, d: 250 }, { ...canal, ...lit("canal", [0, 125, -44], 70), flux: 1, split: 1 });
  shot(t.chauffe - 0.05, t.toturbine1 - t.chauffe + 0.05, ring, "sine.out");
  st(t.chauffe, 0.8, { pLow: 0.5, pHigh: 0.5 }, "sine.inOut");
  st(t.chauffe + 0.15, t.toturbine1 - t.chauffe - 0.1, { steam: 0.6 }, "sine.inOut");

  /* ── …fait tourner la turbine ── */
  cut(t.toturbine1, SET.CENTRALE, VIEW.turbine, {
    ...STAGED.centrale, fault: 0, ok: 0, viol: 0, spin: 1, flow: 1, mains: 1, feed: 0, diesel: 0,
  });
  shot(t.toturbine1, t.tofreiner - t.toturbine1, { ...VIEW.turbine, d: 300 }, "sine.inOut");

  /* ── « Pour freiner, des barres qui avalent les neutrons »: the green absorber comes in ── */
  cut(t.tofreiner, SET.CANAL, VIEW.canalTop, {
    ...canal, ...lit("canal", [0, 190, 0], 60), flux: 1, split: 1, steam: 0.5, pLow: 0.5, pHigh: 0.5,
  });
  // retouche 05/11: closer and lower in frame — the green absorber is THE piece (out of the HUD, ≈ the frame's middle), and it comes down
  shot(t.tofreiner, t.totrap - t.tofreiner, { ...VIEW.canalTop, d: 300, ty: VIEW.canalTop.ty + 10 }, "sine.inOut");
  st(t.freiner - 0.05, t.avalent - t.freiner + 0.6, { rod: 0.2 }, "sine.inOut");
  st(t.barres - 0.06, 0.3, { ok: 1 }, "power2.out"); // « des barres »: what brakes lights green — the system that works

  /* ── THE TRAP: the water swallows neutrons too… the vapour fewer ── */
  // the ring close, at the height where the vapour front will stop (steam 0.62 → y ≈ 97): water below, vapour above
  const trap = { ...VIEW.fuel, ty: VIEW.fuel.ty - 20, d: 190, az: -64, el: 8, shift: 0 }; // channel ≈ 45 %, neutrons ≈ 15 px
  cut(t.totrap, SET.CANAL, trap, {
    ...canal, ...lit("canal", [0, 120, -44], 60), ok: 0, flux: 1, split: 1, steam: 0, pLow: 0.4, pHigh: 0.4,
  });
  D.punch(t.trap, 0.06);
  shot(t.totrap + 0.3, t.accelere - t.totrap - 0.2, { ...trap, d: 168 }, "sine.inOut");
  st(t.changee + 0.05, t.moins - t.changee + 0.1, { steam: 0.62 }, "sine.inOut"); // « Changée en vapeur »: down to mid-height
  st(t.vapeur2 - 0.04, 0.2, { viol: 1 }, "power2.out"); // on « vapeur »: the vapour in alarm red, the water under it stays light
  st(t.accelere - 0.08, 0.4, { pLow: 0.9, pHigh: 0.9 }, "power2.in"); // « …et la réaction accélère »
  D.punch(t.accelere, 0.06);
  // « Retiens bien ça »: the camera backs off and holds — the neutrons still fly
  // retouche 05/11: the pull-back over 1.6 s, from « accélère » (in 0.7 s it jerked at 28.3 s) — the same pose at tot1
  shot(t.accelere - 0.1, t.tot1 - t.accelere - 0.05, { ...trap, d: 300, ty: trap.ty + 15 }, "sine.inOut", 168);
  now(t.tot1, { viol: 0 }); // nothing leaks: the red vapour is this act's (acte2 cuts and sets the rest)
}
