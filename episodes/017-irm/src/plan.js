// DOSSIER 017 — IRM : the plan of the set. Centimetres, y up, the floor is y = 0. No import here:
// suite.js, model.js and world.js all read it — it is what lets them be built at the same time.
//
// THE ROOM (suite.js): an MRI suite seen like an X-ray. The magnet stands at the origin, its tunnel along z; the
// patient table comes out of it toward +z; the door is in the +z wall, to the right (+x) — you come in by it,
// an oxygen cylinder in your arms. By the door, inside, on that same wall: the box with the two buttons. The
// camera mostly stands on the −x / +z side (az −20 … −70), where the key light falls: it sees the mouth of the
// tunnel, the table, the door beyond on the right.

/** The room: its floor is x ∈ [−310, 310], z ∈ [−300, 420]; the door in the +z wall. Above the ceiling (`h`), the roof and the sky. */
export const ROOM = { x: 310, z0: -300, z1: 420, h: 290, roof: 330, door: { x: 175, w: 110, h: 210 } };
/** The magnet: a drum lying along z, centred on `at`; its tunnel (`bore`, the radius); the table that slides into it. */
export const MAGNET = { at: [0, 108, 0], half: 88, r: 108, bore: 34, table: { y: 80, w: 56, from: 70, to: 300 } };
/** The quench pipe: from the turret on top of the magnet, up through the ceiling and the roof, to the open air. */
export const PIPE = { from: [0, 216, -30], r: 11, top: 450 };
/** The box with the two buttons, on the +z wall by the door (in the room) — and where it stands on the bench, on a post beside the magnet. */
export const BOX = { at: [70, 138, 416], bench: [178, 118, 70], w: 30, h: 22, estop: [-7.5, 1], mstop: [7.5, 1] }; // the two buttons on its face, counted from its centre (x along the wall, y up): the emergency stop to the left, the magnet stop — under its flap — to the right
/** You: where you stand in the doorway, and at the box. The cylinder: in your arms, then against the tunnel's mouth. */
export const YOU = { door: [175, 0, 404], box: [44, 0, 372] };
export const BOTTLE = { len: 68, r: 7.5, held: [168, 112, 388], stuck: [-60, 120, 98.7] }; // (flat on the machine's front, left of the mouth: the table fills the mouth itself)
/** The line painted on the floor around the magnet: past it, no iron (illustrative: its true shape depends on the magnet). */
export const LINE = { rx: 230, rz: 290 };

// THE SYSTEM (model.js): the scanner — covers, tunnel, gradient coils, the superconducting coils in their bath of
// liquid helium, the turret and its quench pipe — and the box with its two buttons. Its root's origin is the
// room's: the floor under the middle of the magnet.
/** ≈ the radius of the system on the bench. */
export const SYSTEM = { size: 210 };
/** The field at the centre of the tunnel, in tesla. */
export const TESLA = 1.5;
