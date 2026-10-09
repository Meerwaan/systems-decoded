// DOSSIER 015 — Brin d'arrêt : the plan of the set. Centimetres, y up, the flight deck is y = 0. No import here:
// carrier.js, rafale.js, model.js and world.js all read it — it is what lets them be built at the same time.
//
// THE FRAME IS THE SHIP'S: the deck never moves. The landing axis is −z: the Rafale comes from astern (+z) and
// flies toward −z, its nose toward −z. Starboard — the island — is +x; port, where the angled deck overhangs the
// sea, is −x. The camera mostly stands on the −x / +z side (az −20 … −70), where the key light falls: it sees the
// aircraft's left-rear quarter, the wire stretching behind it, the deck running away up the picture, the island
// beyond on the right. It is a MODEL of a deck at the aircraft's scale, not a survey of the Charles de Gaulle: no
// length of it is ever displayed.

/** The landing strip, in the ship's frame. */
export const DECK = {
  half: 1500, //    half-width of the painted landing strip
  stern: 6500, //   the round-down, astern
  end: -11500, //   the end of the angled deck, ahead: past it, the sea
  sea: -1600, //    the water, below the deck
  skew: 8.5, //     degrees between the landing axis and the ship's keel (the hull's bow points to starboard of −z)
  island: [2700, 0, -2200], // the island's foot, to starboard
  hull: 3200, //    half-beam of the hull around the strip (the glass shell)
};

/**
 * Three wires across the strip. The film's — THE SYSTEM, model.js — is the middle one, at z = 0; carrier.js draws
 * the two others (a line and its two deck sheaves each), NOT this one. Each wire runs between two deck sheaves at
 * x = ±half, held `lift` cm above the deck.
 */
export const BRINS = { z: [1200, 0, -1200], hero: 1, half: 1100, lift: 9 };

// THE AIRCRAFT (rafale.js): a single-seat Rafale M like an X-ray. Two numbers of the state place it:
//   `pos`  metres of its HOOK'S TIP along the landing axis, counted from the film's wire: negative astern of it
//          (still coming), 0 on the wire, positive past it (≈ 90 when it is stopped)
//   `alt`  metres between its main wheels and the deck (0: rolling)
/** The aircraft in numbers; along its own axis, counted from the hook's tip (hook down, wheels on the deck). */
export const RAFALE = { length: 1535, span: 1088, wheels: 556, nosewheel: 1086, nose: 1440, tail: -129, hook: 211, cockpit: [0, 250, 1042] };
/** Where the hook's tip is in the ship's frame. model.js pulls the wire's bight to this point when it is held. */
export const hookAt = (pos, alt = 0) => [0, BRINS.lift + 3 + alt * 100, -pos * 100];

// THE SYSTEM (model.js): the film's wire and everything it pulls, ONE rigid assembly at its true place in the ship
// (its root's origin is the deck's: the middle of the wire, on the deck). The wire on the deck, its two deck
// sheaves, the two cables that go down through the deck, and under it the brake: sheaves, a ram, a cylinder full
// of oil, the valve the oil is forced through, the vessel it is pushed into.
/** The brake under the deck: it lies ALONG x, right under the wire. Its envelope, for carrier.js to leave room. */
export const ENGINE = { y: -430, len: 1500, r: 70, half: [900, 160, 200] };
/** Where the system stands on the bench (its root is lifted so the brake rests on cradles), and ≈ its radius there. */
export const SYSTEM = { bench: [0, 620, 0], size: 1300 };
/** How far the wire is pulled, in metres, when the aircraft is stopped; on the bench a pull is a few metres only. */
export const RUNOUT = 90;
