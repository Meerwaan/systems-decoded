// DOSSIER 018 — Cocotte-minute : the kitchen. Nothing is modelled here — it is an assembly of sets that exist:
//   · the kitchen of 009, seen like an X-ray, without its glass hob and without anybody in it
//   · the gas hob of 012 let into its worktop — WITHOUT its saucepan (`pot` 0) — and you, of glass, at the hob,
//     the fingers of your left hand on the knob of the front-left burner (they go down with `press`)
//   · that burner itself, solid (012's system: burner, knob, tap), and its crown of flame (012's fire), which
//     runs along the base of whatever stands on it: the pressure cooker (world.js stands it there: plan.js, HOME)
// The cooker is NOT built here: it is the system (model.js), and world.js re-parents it between this set and the bench.
//
//   buildCuisine() → { group, A, update(p, time, px) }      p = { shell, you, press, flame }
//   A: knob, youHead, youHand (012's hob) · flame (a flame on the camera's side)
import * as THREE from "three";
import { buildKitchen } from "../../009-micro-ondes/src/kitchen.js";
import { buildHob } from "../../012-gaziniere/src/hob.js";
import { buildSystem as buildBurner } from "../../012-gaziniere/src/model.js";
import { buildFire } from "../../012-gaziniere/src/fire.js";
import { SYSTEM as BURNER } from "../../012-gaziniere/src/plan.js";

export function buildCuisine() {
  const group = new THREE.Group();
  group.name = "cuisine";
  const kitchen = buildKitchen({ hob: false, floorAt: [176, 105] });
  const hob = buildHob();
  const burner = buildBurner();
  const fire = buildFire();
  const at = new THREE.Group(); // the centre of the hero burner on the hob's top face
  at.position.set(...BURNER.home);
  at.add(burner.root, fire.crown);
  group.add(kitchen.group, hob.group, at, fire.room);

  // what never changes in this film: no saucepan, no boil-over, a burner that has its safety and stays open, no gas loose
  const HOB = { shell: 1, pot: 0, boil: 0, spill: 0, you: 0, press: 0, flame: 1 };
  const BURN = { bench: 0, shell: 1, safety: 1, explode: 0, press: 0, valve: 1, heat: 1, volts: 0, hold: 0, xray: 0, litTap: 0, litSpring: 0, litMagnet: 0, litTip: 0 };
  const FIRE = { bench: 0, flame: 1, gas: 0, pot: 1, spill: 0, fill: 0, spark: 0, explode: 0 };
  const ROOM = { shell: 1, you: 0 };

  return {
    group, kitchen, hob, burner, fire,
    A: { knob: hob.A.knob, youHead: hob.A.youHead, youHand: hob.A.youHand, flame: fire.A.flame },
    /**
     * shell  the X-ray of the kitchen and of the hob: glass and fine lines (0–1). You do not fade with it
     * you    0 nobody · 1 you at the hob, your fingers on the burner's knob
     * press  your fingers push the knob down (0–1): the gesture of « coupe le feu » (the flame is `flame`: move both)
     * flame  the crown of flame under the cooker: 1 full → 0 out (it dies port after port)
     */
    update({ shell = 1, you = 0, press = 0, flame = 1 } = {}, time = 0, px = 1) {
      ROOM.shell = HOB.shell = BURN.shell = shell;
      HOB.you = you > 0.5 ? 1 : 0;
      HOB.press = BURN.press = press;
      HOB.flame = FIRE.flame = flame;
      BURN.heat = flame; // the thermocouple's pin, red in the flame: it cools with it
      kitchen.update(ROOM, time, px);
      hob.update(HOB, time, px);
      burner.update(BURN, time, px);
      fire.update(FIRE, time, px);
    },
  };
}
