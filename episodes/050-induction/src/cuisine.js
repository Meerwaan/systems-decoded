// DOSSIER 050 — Plaque à induction : the kitchen, and you. Nothing of the room is modelled here: it is 009's kitchen, seen
// like an X-ray, WITHOUT its glass hob (`hob: false`: ours, model.js, is let into the worktop where 012's gas hob stood),
// its floor grid centred on you. Nobody of 009 in it (`you` 0 for 009's figure). 009 is published: imported, never changed.
// What this file adds: YOU, of glass (@kit/figure.js, real hands), standing at the hob facing −z, leaning over it — your
// LEFT hand flat on the empty front-left zone (palm down, fingertips pressed on the glass), then a finger's breadth above
// the hot ring; your RIGHT hand closing on the saucepan's handle and lifting it with the pan; and, for the like, a child's
// hand coming up over the front edge of the worktop. The hob and the saucepan are NOT built here (model.js, casserole.js):
// world.js stands them at HOME.
//
//   buildCuisine() → { group, kitchen, you, kid, A, update(p, time, px) }
//   p = { shell, you, palm, hover, away, grip, lift, child }
//   A: palm (the centre of your left palm), fingers (its fingertips), grip (your right hand on the handle), child (the
//      child's hand) — all ride on the hands themselves: read them with getWorldPosition.
import * as THREE from "three";
import { buildKitchen } from "../../009-micro-ondes/src/kitchen.js";
import { makeFigure } from "@kit/figure.js";
import { anchor } from "@kit/build3d.js";
import { HOME, ZONES, PAN, YOU, HAND, CHILD } from "./plan.js";

const V = (...a) => new THREE.Vector3(...a);
const mix = (a, b, u) => a + (b - a) * u;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const LEAN = 18; // degrees: you lean over the hob — a hand flat on the glass 40 cm in front of you is out of a standing arm's reach
const GAP = 2.0; // « juste au-dessus »: a finger's breadth between the palm and the glass (cm)
const WRIST_Y = 1.7; // the wrist above the glass when the hand lies flat (the palm's half thickness + the fingers' rest curl)
const SPREAD = { flat: -0.4, hover: -0.25 }; // `fingers.pose(k)` below 0: the fingers fan out and straighten (−0.8 lifts them off the glass)
const GLASS_K = 0.38; // your glass, dimmer than a figure seen whole: at the hob the cameras pass over your shoulder, and from this close an arm is a wide tube that bars the frame
const KID = { scale: 0.6, x: 160, z: 92 }; // where the child stands (only its arm is drawn)

export function buildCuisine() {
  const group = new THREE.Group();
  group.name = "cuisine";
  const kitchen = buildKitchen({ hob: false, floorAt: [YOU.x, YOU.z] });
  group.add(kitchen.group);

  /* ── you ── */
  const you = makeFigure({ hands: "real", shell: true, order: 10, glassK: GLASS_K, spec: 0, through: 0 });
  you.group.position.set(YOU.x, 0, YOU.z);
  you.group.rotation.y = Math.PI; // facing −z: your left is −x
  you.lean(LEAN, 0, 0);
  group.add(you.group);

  /* ── the child: its arm only (a glass body standing at the worktop would stand between the camera and the hob) ── */
  const kid = makeFigure({ hands: "real", shell: true, order: 12, glassK: 0.6, spec: 0 });
  kid.group.scale.setScalar(KID.scale);
  kid.group.position.set(KID.x, 0, KID.z);
  kid.group.rotation.y = Math.PI;
  kid.torso.visible = false;
  for (const s of ["L", "R"]) {
    kid.legs[s].thigh.mesh.visible = kid.legs[s].shin.mesh.visible = kid.legs[s].foot.visible = false;
  }
  kid.arms.R.upper.mesh.visible = kid.arms.R.fore.mesh.visible = kid.arms.R.hand.visible = false;
  kid.arms.L.upper.mesh.visible = false;
  kid.group.visible = false;
  group.add(kid.group);

  // world → a figure's own frame (at `ox, oz`, turned half a turn, scaled by `k`) — into `out`
  const toFig = (out, x, y, z, ox, oz, k = 1) => out.set(-(x - ox) / k, y / k, -(z - oz) / k);
  const dirFig = (out, x, y, z) => out.set(-x, y, -z).normalize(); // a direction, world → figure frame

  /* ── fixed numbers, in your frame (computed once) ── */
  const glassY = HOME[1];
  const flatC = V(...HAND.flat); // the palm's centre, lying flat
  const overC = V(...HAND.over);
  const awayW = V(...HAND.away);
  // the left hand: fingers forward and a little inward, palm down · hovering: the fingers tip toward the glass ·
  // withdrawn: the hand relaxes, the fingers dropping
  const dFlat = dirFig(V(), 0.22, -0.05, -1);
  const dHover = dirFig(V(), 0.18, -0.16, -1);
  const dAway = dirFig(V(), 0.35, -0.8, -0.5);
  const pDown = dirFig(V(), 0, -1, 0);
  const pAway = dirFig(V(), 0.5, -0.6, 0.6);
  const bendL = dirFig(V(), -0.35, -0.45, 1); // the elbow out (to your left) and back: it does not bar the glass
  // the right hand on the handle: an overhand grip, palm down and inward, the knuckles toward the pan
  const [hx, , hz] = PAN.handle.dir;
  const hR = PAN.top + PAN.handle.len * 0.72; // where along the handle the hand closes (from the pan's axis)
  const handle0 = V(HOME[0] + ZONES.pan.x + hx * hR, HOME[1] + PAN.handle.y, HOME[2] + ZONES.pan.z + hz * hR);
  const axisR = dirFig(V(), hx, 0, hz);
  const palmR = dirFig(V(), -0.35, -1, 0.1);
  const bendR = dirFig(V(), 0.7, -0.5, 0.5); // the elbow out to your right
  // the right hand at rest: hanging at your side (figure frame), as the figure stands it
  const restR = V(-21, 96, 9), restDirR = V(0.05, -1, 0.2).normalize(), restPalmR = V(1, 0, 0);
  // the child's hand: coming up from below the edge, then lying on it, fingers over the worktop
  const kFrom = V(...CHILD.from), kTo = V(...CHILD.to);
  const kDirUp = dirFig(V(), 0.1, 0.9, -0.4), kDirOn = dirFig(V(), 0.15, -0.25, -1);
  const kPalm = dirFig(V(), 0, -1, 0.1), kPalmUp = dirFig(V(), 0, -0.2, -1);
  const kBend = dirFig(V(), -0.4, -1, 0.3);

  /* ── scratch (update allocates nothing) ── */
  const tW = V(), tL = V(), dL = V(), pL = V(), tR = V(), dR = V(), pR = V(), hp = V(), wR = V(), kW = V(), kL = V(), kD = V(), kP = V();
  const LAY_L = { dir: dL, palm: pL }, LAY_R = { dir: dR, palm: pR }, LAY_K = { dir: kD, palm: kP };
  const HOLD = { palm: palmR, k: 1, bar: 0.9, bend: bendR };

  const A = {
    palm: anchor(you.arms.L.hand, 0, -1.2, 4.6),
    fingers: anchor(you.arms.L.hand, 0, -1.6, 12.5),
    grip: anchor(you.arms.R.hand, 0, -0.6, 5),
    child: anchor(kid.arms.L.hand, 0, -1, 5),
  };

  return {
    group, kitchen, you, kid, A,
    /**
     * shell  the X-ray of the kitchen (0–1) · you  you at the hob (0/1)
     * palm   your LEFT hand: 0 flat on the empty zone → 1 over the zone where the saucepan stood (it never touches it)
     * hover  its height: 0 on the glass, fingertips pressed → 1 a finger's breadth above, fingers tipped down, stopped
     * away   0 the hand where palm/hover put it → 1 withdrawn toward your body
     * grip   your RIGHT hand: 0 at your side → 1 closed on the saucepan's handle (it follows `lift`)
     * lift   the saucepan's height (world.js passes the same number to the pan): 0 on the glass → 1 lifted PAN.lift cm
     * child  a child's hand: 0 out of frame, below the worktop's front edge → 1 lying on the edge, left of the hob
     */
    update({ shell = 1, you: showYou = 1, palm = 0, hover = 0, away: aw = 0, grip = 0, lift = 0, child: c = 0 } = {}, time = 0, px = 1) {
      kitchen.update({ shell, you: 0 }, time, px);
      you.group.visible = showYou > 0.5;

      if (showYou > 0.5) {
        /* left hand: slides from the empty zone to the hot one in an arc, never lower than a finger above it at the end */
        const m = smooth(0, 1, palm);
        const up = Math.max(hover, m); // over the hot ring, the hand is always « juste au-dessus »
        const arc = Math.sin(Math.PI * m) * 7;
        // over the far zone (28 cm to your right) the left arm needs the trunk: you lean further and turn toward it
        const e = smooth(0, 1, aw);
        const reachOver = m * (1 - e);
        you.lean(LEAN + 7 * reachOver, -6 * reachOver, -22 * reachOver);
        tW.lerpVectors(flatC, overC, m);
        tW.y = glassY + WRIST_Y + up * GAP + arc;
        // the wrist sits behind the palm's centre, along the fingers
        dL.lerpVectors(dFlat, dHover, up);
        pL.copy(pDown);
        if (e > 0) {
          dL.lerp(dAway, e);
          pL.lerp(pAway, e);
          tW.lerp(awayW, e);
        }
        dL.normalize();
        pL.normalize();
        toFig(tL, tW.x, tW.y, tW.z, YOU.x, YOU.z).addScaledVector(dL, -4.6);
        you.reach("L", tL, bendL, LAY_L);
        // the fingers: pressed flat and spread (a pose below 0 opens the hand past its rest) → straight, held out → at rest
        you.arms.L.fingers.pose(mix(mix(SPREAD.flat, SPREAD.hover, up), 0, e), 1.4);

        /* right hand: rises from your side, comes down on the handle from above, closes, and lifts with the pan */
        const g = smooth(0, 1, grip);
        const k = smooth(0.55, 1, grip);
        toFig(hp, handle0.x, handle0.y + lift * PAN.lift, handle0.z, YOU.x, YOU.z);
        HOLD.k = k;
        wR.copy(you.hold("R", hp, axisR, HOLD));
        dR.copy(you.arms.R.dir);
        pR.copy(you.arms.R.palm);
        if (g < 1) {
          wR.y += (1 - k) * 5; // the open hand hovers above the handle before it closes
          tR.lerpVectors(restR, wR, g);
          dR.lerpVectors(restDirR, dR, g).normalize();
          pR.lerpVectors(restPalmR, pR, g).normalize();
          you.reach("R", tR, g > 0.2 ? bendR : null, LAY_R);
        }
      }

      /* the child's hand */
      kid.group.visible = c > 0.01 && showYou < 0.5;
      if (c > 0.01) {
        const u = smooth(0, 1, c);
        kW.lerpVectors(kFrom, kTo, u);
        kW.y += Math.sin(Math.PI * u) * 4; // it comes up and over the edge, then lies on it
        kD.lerpVectors(kDirUp, kDirOn, smooth(0.35, 1, c)).normalize();
        kP.lerpVectors(kPalmUp, kPalm, smooth(0.35, 1, c)).normalize();
        toFig(kL, kW.x, kW.y, kW.z, KID.x, KID.z, KID.scale).addScaledVector(kD, -4.6);
        kid.reach("L", kL, kBend, LAY_K);
        kid.grip("L", 0.15 * u); // the fingers curl a little over the edge
      }
    },
  };
}
